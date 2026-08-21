<script setup lang="ts">
import { computed } from 'vue'
import { termsApi } from '../api/biz'
import type { PrivacyPolicy, Stplat } from '../api/types'
import { useAsync } from '../composables/useAsync'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'

/**
 * 이용약관 · 개인정보처리방침.
 *
 * 여러 버전 중 <b>현재 대표로 지정된 하나</b>만 노출한다. 새 버전을 미리 만들어 두어도
 * 대표로 지정하기 전까지는 사용자에게 보이지 않는다.
 */
const props = defineProps<{ kind: 'stplat' | 'privacy' }>()

const { t } = useI18n()
const { data, loading, error, reload } = useAsync<Stplat | PrivacyPolicy>(() =>
  props.kind === 'stplat' ? termsApi.stplat() : termsApi.privacy(),
)

const title = computed(() =>
  props.kind === 'stplat' ? t('nav.terms', '이용약관') : t('nav.privacy', '개인정보처리방침'),
)

// 두 도메인의 필드명이 다르다 (약관: useStplatNm/useStplatCn, 방침: indvdlInfoNm/indvdlInfoCn)
const name = computed(() =>
  props.kind === 'stplat'
    ? (data.value as Stplat | null)?.useStplatNm
    : (data.value as PrivacyPolicy | null)?.indvdlInfoNm,
)
const content = computed(() =>
  props.kind === 'stplat'
    ? (data.value as Stplat | null)?.useStplatCn
    : (data.value as PrivacyPolicy | null)?.indvdlInfoCn,
)
</script>

<template>
  <AppFeedback v-if="loading" state="loading" />
  <AppFeedback v-else-if="error" state="error" :message="error" retryable @retry="reload" />

  <template v-else>
    <h1 class="h3 mb-3">{{ name ?? title }}</h1>

    <div class="krds-panel">
      <div class="krds-panel-body">
        <p v-if="data?.ver" class="small text-muted">
          {{ t('terms.version', '버전') }} {{ data.ver }}
          <template v-if="data.aplcDe"> · {{ t('terms.applyDate', '시행일') }} {{ data.aplcDe }}</template>
        </p>
        <!-- 약관 본문은 서버가 escape 한 텍스트다 — 줄바꿈만 유지해 텍스트로 렌더링한다 -->
        <div style="white-space: pre-wrap">{{ content ?? t('terms.empty', '등록된 내용이 없습니다.') }}</div>
      </div>
    </div>
  </template>
</template>
