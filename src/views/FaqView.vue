<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { faqApi } from '../api/biz'
import { useAsync } from '../composables/useAsync'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'
import AppPagination from '../components/AppPagination.vue'

/**
 * FAQ 목록.
 *
 * 질문을 누르면 그 자리에서 답변이 펼쳐진다(아코디언). 항목 수가 적고 답변이 짧아
 * 상세 화면으로 이동하는 것보다 읽는 흐름이 끊기지 않는다.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isAuthenticated } = useAuth()

const pageIndex = computed(() => Number(route.query.page ?? '1'))
const searchCondition = computed(() => String(route.query.cnd ?? '0'))
const searchKeyword = computed(() => String(route.query.wrd ?? ''))

const condition = ref(searchCondition.value)
const keyword = ref(searchKeyword.value)
// /faq/:faqId 로 들어오면 그 항목을 펼친 채로 연다 — 메인에서 특정 질문을 누른 경우다.
const openId = ref<string | null>((route.params.faqId as string) ?? null)

watch([searchCondition, searchKeyword], ([cnd, wrd]) => {
  condition.value = cnd
  keyword.value = wrd
})

const { data, loading, error, reload } = useAsync(
  () =>
    faqApi.list({
      pageIndex: pageIndex.value,
      searchCondition: searchCondition.value,
      searchKeyword: searchKeyword.value,
    }),
  [pageIndex, searchCondition, searchKeyword],
)

const items = computed(() => data.value?.resultList ?? [])

function handleSearch() {
  void router.push({ query: { page: '1', cnd: condition.value, wrd: keyword.value } })
}

function goPage(pageNo: number) {
  void router.push({
    query: { page: String(pageNo), cnd: searchCondition.value, wrd: searchKeyword.value },
  })
}

function toggle(faqId: string) {
  openId.value = openId.value === faqId ? null : faqId
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h1 class="h3 mb-0">{{ t('nav.faq', '자주 묻는 질문') }}</h1>
    <RouterLink v-if="isAuthenticated" to="/faq/write" class="krds-btn primary">
      <i class="bi bi-pencil" aria-hidden="true" /> {{ t('faq.write', 'FAQ 등록') }}
    </RouterLink>
  </div>

  <form class="d-flex gap-2 mb-3" role="search" @submit.prevent="handleSearch">
    <label class="visually-hidden" for="faq-condition">{{ t('faq.searchCondition', '검색 조건') }}</label>
    <select id="faq-condition" v-model="condition" class="krds-form-select">
      <option value="0">{{ t('faq.question', '질문') }}</option>
      <option value="1">{{ t('faq.answer', '답변') }}</option>
    </select>

    <label class="visually-hidden" for="faq-keyword">{{ t('bbs.searchKeyword', '검색어') }}</label>
    <input
      id="faq-keyword"
      v-model="keyword"
      class="krds-input"
      type="search"
      :placeholder="t('bbs.searchPlaceholder', '검색어를 입력하세요')"
    />

    <button type="submit" class="krds-btn secondary flex-shrink-0">{{ t('com.search', '검색') }}</button>
  </form>

  <AppFeedback v-if="loading" state="loading" />
  <AppFeedback v-else-if="error" state="error" :message="error" retryable @retry="reload" />

  <template v-else>
    <AppFeedback v-if="items.length === 0" state="empty" />
    <ul v-else class="list-unstyled">
      <li v-for="faq in items" :key="faq.faqId" class="krds-panel mb-2">
        <h2 class="mb-0">
          <button
            type="button"
            class="krds-panel-head w-100 text-start d-flex justify-content-between align-items-center"
            :aria-expanded="openId === faq.faqId"
            :aria-controls="`faq-answer-${faq.faqId}`"
            @click="toggle(faq.faqId)"
          >
            <span><strong class="text-primary me-2">Q.</strong>{{ faq.qestnSj }}</span>
            <i :class="openId === faq.faqId ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" aria-hidden="true" />
          </button>
        </h2>
        <div v-if="openId === faq.faqId" :id="`faq-answer-${faq.faqId}`" class="krds-panel-body">
          <p v-if="faq.qestnCn" class="text-muted" style="white-space: pre-wrap">{{ faq.qestnCn }}</p>
          <div style="white-space: pre-wrap"><strong class="text-primary me-2">A.</strong>{{ faq.answerCn }}</div>
        </div>
      </li>
    </ul>

    <AppPagination :info="data?.paginationInfo" @change="goPage" />
  </template>
</template>
