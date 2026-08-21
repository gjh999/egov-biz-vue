<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { surveyApi } from '../api/biz'
import { useAsync } from '../composables/useAsync'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'
import AppPagination from '../components/AppPagination.vue'

/** 설문 목록 — 참여 가능한 설문을 보여준다(참여·집계는 관리자 기능과 분리돼 있다). */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const pageIndex = computed(() => Number(route.query.page ?? '1'))
const { data, loading, error, reload } = useAsync(
  () => surveyApi.list({ pageIndex: pageIndex.value }),
  [pageIndex],
)

const items = computed(() => data.value?.resultList ?? [])
</script>

<template>
  <h1 class="h3 mb-3">{{ t('nav.survey', '설문조사') }}</h1>

  <AppFeedback v-if="loading" state="loading" />
  <AppFeedback v-else-if="error" state="error" :message="error" retryable @retry="reload" />

  <template v-else>
    <AppFeedback v-if="items.length === 0" state="empty">
      {{ t('survey.empty', '진행 중인 설문이 없습니다.') }}
    </AppFeedback>

    <div v-else class="krds-table-wrap">
      <table class="tbl">
        <caption>{{ t('survey.listCaption', '설문 목록 — 제목, 시작일, 종료일') }}</caption>
        <colgroup>
          <col />
          <col style="width: 18%" />
          <col style="width: 18%" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{{ t('survey.subject', '설문 제목') }}</th>
            <th scope="col">{{ t('survey.begin', '시작일') }}</th>
            <th scope="col">{{ t('survey.end', '종료일') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="survey in items" :key="survey.qestnrId">
            <td class="text-start">{{ survey.qestnrSj }}</td>
            <td>{{ survey.qestnrBeginDe ?? '-' }}</td>
            <td>{{ survey.qestnrEndDe ?? '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppPagination :info="data?.paginationInfo" @change="(p) => router.push({ query: { page: String(p) } })" />
  </template>
</template>
