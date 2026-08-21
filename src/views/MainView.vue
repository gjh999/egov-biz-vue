<script setup lang="ts">
import { computed } from 'vue'
import { mainApi } from '../api/biz'
import { useAsync } from '../composables/useAsync'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'
import { NOTICE_BBS_ID } from '../constants'

const { t } = useI18n()
const { data, loading, error, reload } = useAsync(() => mainApi.summary())

const noticeBbsId = computed(() => data.value?.noticeBbsId ?? NOTICE_BBS_ID)
// 이름이 없는 배너는 화면에 빈 배지만 남기므로 거른다.
const banners = computed(() => (data.value?.bannerList ?? []).filter((banner) => banner.bannerNm?.trim()))
const notices = computed(() => data.value?.noticeList ?? [])
const faqs = computed(() => data.value?.faqList ?? [])
</script>

<template>
  <AppFeedback v-if="loading" state="loading" />
  <AppFeedback v-else-if="error" state="error" :message="error" retryable @retry="reload" />

  <template v-else>
    <h1 class="h3 mb-4">{{ t('main.title', '전자정부표준프레임워크 기업 업무 템플릿') }}</h1>

    <section v-if="banners.length > 0" class="mb-4" :aria-label="t('main.banner', '배너')">
      <ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">
        <li v-for="(banner, index) in banners" :key="banner.bannerId || `banner-${index}`">
          <a v-if="banner.linkUrl" :href="banner.linkUrl" class="krds-btn secondary">{{ banner.bannerNm }}</a>
          <span v-else class="krds-badge bg-gray">{{ banner.bannerNm }}</span>
        </li>
      </ul>
    </section>

    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <section class="krds-panel h-100">
          <div class="krds-panel-head d-flex align-items-center justify-content-between">
            <h2 class="h5 mb-0">{{ t('nav.notice', '공지사항') }}</h2>
            <RouterLink :to="`/board/${noticeBbsId}`" class="krds-btn tertiary small">
              {{ t('com.more', '더보기') }}
            </RouterLink>
          </div>
          <div class="krds-panel-body">
            <AppFeedback v-if="notices.length === 0" state="empty" />
            <ul v-else class="list-unstyled mb-0">
              <li
                v-for="item in notices"
                :key="`${item.bbsId}-${item.nttId}`"
                class="d-flex justify-content-between gap-3 py-2 border-bottom"
              >
                <RouterLink :to="`/board/${item.bbsId}/${item.nttId}`" class="text-truncate">
                  {{ item.nttSj }}
                </RouterLink>
                <span class="small text-muted flex-shrink-0">{{ item.frstRegisterPnttm }}</span>
              </li>
            </ul>
          </div>
        </section>
      </div>

      <div class="col-12 col-lg-6">
        <section class="krds-panel h-100">
          <div class="krds-panel-head d-flex align-items-center justify-content-between">
            <h2 class="h5 mb-0">{{ t('nav.faq', 'FAQ') }}</h2>
            <RouterLink to="/faq" class="krds-btn tertiary small">{{ t('com.more', '더보기') }}</RouterLink>
          </div>
          <div class="krds-panel-body">
            <AppFeedback v-if="faqs.length === 0" state="empty" />
            <ul v-else class="list-unstyled mb-0">
              <li v-for="faq in faqs" :key="faq.faqId" class="py-2 border-bottom">
                <RouterLink :to="`/faq/${faq.faqId}`" class="text-truncate d-block">{{ faq.qestnSj }}</RouterLink>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  </template>
</template>
