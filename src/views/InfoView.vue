<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '../i18n/useI18n'
import NotFoundView from './NotFoundView.vue'

/**
 * 사이트 소개 페이지들.
 *
 * 서버 렌더링 판은 소개 페이지 4종(사이트소개·연혁·조직·찾아오시는 길)을 각각 별도 HTML 로 두었지만,
 * 구조가 히어로 + 본문 패널로 동일하고 문구만 다르다. 문구는 이미 서버 메시지 번들에 있으므로
 * 화면 하나가 슬러그별 키 접두어만 바꿔 그린다.
 */
const PAGES: Record<string, { prefix: string; icon: string }> = {
  about: { prefix: 'about', icon: 'bi-building' },
  history: { prefix: 'history', icon: 'bi-clock-history' },
  organization: { prefix: 'org', icon: 'bi-diagram-3' },
}

const route = useRoute()
const { t } = useI18n()

const page = computed(() => PAGES[String(route.params.slug ?? 'about')])
</script>

<template>
  <NotFoundView v-if="!page" />

  <div v-else class="container">
    <nav :aria-label="t('com.breadcrumb', '현재 위치')">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><RouterLink to="/">{{ t('common.home', '홈') }}</RouterLink></li>
        <li class="breadcrumb-item">{{ t('nav.introGroup', '사이트 소개') }}</li>
        <li class="breadcrumb-item active">{{ t(`${page.prefix}.title`) }}</li>
      </ol>
    </nav>

    <div class="intro-hero">
      <div class="intro-hero-text">
        <span class="intro-hero-eyebrow">
          <i class="bi" :class="page.icon" aria-hidden="true" /> {{ t(`${page.prefix}.eyebrow`) }}
        </span>
        <h1>{{ t(`${page.prefix}.heading`) }}</h1>
        <p>{{ t(`${page.prefix}.lead`) }}</p>
      </div>
    </div>

    <div class="krds-panel">
      <div class="krds-panel-head fw-bold">{{ t(`${page.prefix}.panel.title`) }}</div>
      <div class="krds-panel-body">
        <!-- 본문은 서버 메시지의 한 문단이다 — 줄바꿈만 살려 텍스트로 렌더링한다 -->
        <p class="mb-0" style="white-space: pre-wrap">{{ t(`${page.prefix}.body`) }}</p>
      </div>
    </div>
  </div>
</template>
