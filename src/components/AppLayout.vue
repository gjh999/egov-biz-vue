<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n/useI18n'
import { NOTICE_BBS_ID } from '../constants'

const { t, lang, setLang } = useI18n()
const { user, isAuthenticated, isAdmin, logout } = useAuth()
const router = useRouter()

const navOpen = ref(false)
const showScrollTop = ref(false)
/** 열려 있는 드롭다운 이름 (한 번에 하나만 열린다) */
const dropdown = ref<string | null>(null)

/** 관리자 메뉴 — 도메인이 많아 드롭다운으로 묶는다 */
const ADMIN_MENU = [
  { to: '/admin/members', key: 'nav.member', fallback: '회원관리' },
  { to: '/admin/board-masters', key: 'nav.boardManage', fallback: '게시판 관리' },
  { to: '/admin/board-use', key: 'nav.boardUse', fallback: '게시판 사용정보' },
  { to: '/admin/templates', key: 'nav.template', fallback: '템플릿 관리' },
  { to: '/admin/banners', key: 'nav.bannerManage', fallback: '배너 관리' },
  { to: '/admin/surveys', key: 'nav.surveyManage', fallback: '설문 관리' },
  { to: '/admin/terms/stplat', key: 'admin.stplat', fallback: '이용약관 관리' },
  { to: '/admin/terms/privacy', key: 'admin.privacy', fallback: '개인정보처리방침 관리' },
  { to: '/admin/authorities', key: 'nav.authManage', fallback: '권한 관리' },
  { to: '/admin/roles', key: 'nav.roleManage', fallback: '롤 관리' },
  { to: '/admin/groups', key: 'nav.groupManage', fallback: '그룹 관리' },
  { to: '/admin/restde', key: 'nav.holidayManage', fallback: '공휴일 관리' },
  { to: '/admin/zip', key: 'nav.zipManage', fallback: '우편번호 관리' },
  /* 기업 업무 템플릿 전용 */
  { to: '/admin/users', key: 'nav.user', fallback: '업무사용자 관리' },
  { to: '/admin/codes', key: 'nav.code', fallback: '공통코드 관리' },
  { to: '/admin/codes/classes', key: 'nav.codeClass', fallback: '공통코드 분류' },
  { to: '/admin/menus', key: 'nav.menuManage', fallback: '메뉴 관리' },
  { to: '/admin/programs', key: 'nav.programManage', fallback: '프로그램 관리' },
  { to: '/admin/absences', key: 'nav.absence', fallback: '사용자 부재' },
  { to: '/admin/login-policies', key: 'nav.loginPolicy', fallback: '접속정책' },
  { to: '/admin/logs/login', key: 'nav.loginLog', fallback: '로그인 로그' },
  { to: '/admin/logs/system', key: 'nav.sysLog', fallback: '시스템 로그' },
]

/** 사이트 소개 하위 메뉴 */
const INFO_MENU = [
  { to: '/info/about', key: 'nav.aboutSite', fallback: '사이트 소개' },
  { to: '/info/history', key: 'nav.history', fallback: '연혁' },
  { to: '/info/organization', key: 'nav.organization', fallback: '조직 안내' },
  { to: '/info/location', key: 'nav.location', fallback: '찾아오시는 길' },
  { to: '/user-types', key: 'userTypes.title', fallback: '사용자 구분 안내' },
]

function toggleDropdown(name: string) {
  dropdown.value = dropdown.value === name ? null : name
}

function closeNav() {
  navOpen.value = false
  dropdown.value = null
}

async function handleLogout() {
  await logout()
  await router.push('/')
}

function onScroll() {
  showScrollTop.value = window.scrollY > 300
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})

onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <!-- 접근성: 반복되는 헤더/내비게이션을 건너뛰고 본문으로 이동 (KWCAG 2.2) -->
  <a href="#content" class="skip-nav">{{ t('com.skipNav', '본문 바로가기') }}</a>

  <header class="egov-header bg-white border-bottom shadow-sm">
    <div class="container-fluid d-flex align-items-center justify-content-between py-2 px-4">
      <div class="egov-header-logo">
        <RouterLink to="/" class="text-decoration-none d-flex align-items-center">
          <span class="fw-bold text-primary fs-5">{{ t('header.brand', '전자정부 기업 업무 템플릿') }}</span>
        </RouterLink>
      </div>

      <div class="egov-header-user d-flex align-items-center gap-2">
        <div class="egov-lang" role="group" :aria-label="t('lang.select', '언어 선택')">
          <button
            type="button"
            class="lang-btn"
            :class="{ active: lang === 'ko' }"
            :aria-pressed="lang === 'ko'"
            @click="setLang('ko')"
          >
            {{ t('lang.korean.short', '한국어') }}
          </button>
          <button
            type="button"
            class="lang-btn"
            :class="{ active: lang === 'en' }"
            :aria-pressed="lang === 'en'"
            @click="setLang('en')"
          >
            EN
          </button>
        </div>

        <RouterLink
          v-if="isAuthenticated"
          to="/mypage"
          class="krds-btn secondary small"
          :title="t('nav.mypage', '마이페이지')"
        >
          <i :class="isAdmin ? 'bi bi-person-gear' : 'bi bi-person-circle'" aria-hidden="true" />
          <strong>{{ user?.name }}</strong> <span>{{ t('header.honorific', '님') }}</span>
        </RouterLink>

        <button v-if="isAuthenticated" type="button" class="krds-btn tertiary small" @click="handleLogout">
          <i class="bi bi-box-arrow-right" aria-hidden="true" />
          <span>{{ t('header.logout', '로그아웃') }}</span>
        </button>
        <template v-else>
          <RouterLink to="/join" class="krds-btn tertiary small">{{ t('nav.join', '회원가입') }}</RouterLink>
          <RouterLink to="/login" class="krds-btn primary small">
            <i class="bi bi-box-arrow-in-right" aria-hidden="true" />
            <span>{{ t('login.submit', '로그인') }}</span>
          </RouterLink>
        </template>
      </div>
    </div>
  </header>

  <nav class="egov-nav navbar navbar-expand-lg navbar-dark bg-primary" :aria-label="t('nav.main', '주요 메뉴')">
    <div class="container-fluid px-4">
      <button
        class="navbar-toggler"
        type="button"
        aria-controls="mainNav"
        :aria-expanded="navOpen"
        :aria-label="t('nav.toggle', '메뉴 펼치기')"
        @click="navOpen = !navOpen"
      >
        <span class="navbar-toggler-icon" />
      </button>

      <div id="mainNav" class="collapse navbar-collapse" :class="{ show: navOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <RouterLink to="/" class="nav-link" @click="closeNav">{{ t('nav.home', '홈') }}</RouterLink>
          </li>

          <!-- 사이트 소개 드롭다운.
               KRDS 킷의 드롭다운은 data-bs-* 에 의존하므로 SPA 에서는 열림 상태를 직접 관리한다.
               aria-expanded 를 함께 갱신해야 스크린리더가 펼침 여부를 읽는다. -->
          <li class="nav-item dropdown">
            <button
              type="button"
              class="nav-link dropdown-toggle"
              :aria-expanded="dropdown === 'info'"
              aria-controls="dropdown-info"
              @click="toggleDropdown('info')"
            >
              {{ t('nav.introGroup', '사이트 소개') }}
            </button>
            <ul id="dropdown-info" class="dropdown-menu" :class="{ show: dropdown === 'info' }">
              <li v-for="item in INFO_MENU" :key="item.to">
                <RouterLink :to="item.to" class="dropdown-item" @click="closeNav">
                  {{ t(item.key, item.fallback) }}
                </RouterLink>
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <RouterLink :to="`/board/${NOTICE_BBS_ID}`" class="nav-link" @click="closeNav">
              {{ t('nav.notice', '공지사항') }}
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/faq" class="nav-link" @click="closeNav">{{ t('nav.faq', 'FAQ') }}</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/qna" class="nav-link" @click="closeNav">{{ t('nav.qna', 'Q&A') }}</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/survey" class="nav-link" @click="closeNav">{{ t('nav.survey', '설문') }}</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink to="/terms" class="nav-link" @click="closeNav">
              {{ t('nav.terms', '이용약관') }}
            </RouterLink>
          </li>

          <li v-if="isAdmin" class="nav-item dropdown">
            <button
              type="button"
              class="nav-link dropdown-toggle"
              :aria-expanded="dropdown === 'admin'"
              aria-controls="dropdown-admin"
              @click="toggleDropdown('admin')"
            >
              {{ t('nav.admin', '관리자') }}
            </button>
            <ul id="dropdown-admin" class="dropdown-menu" :class="{ show: dropdown === 'admin' }">
              <li v-for="item in ADMIN_MENU" :key="item.to">
                <RouterLink :to="item.to" class="dropdown-item" @click="closeNav">
                  {{ t(item.key, item.fallback) }}
                </RouterLink>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>

  <main id="content" class="egov-content container-fluid py-4">
    <RouterView />
  </main>

  <footer class="egov-footer border-top mt-5 py-4">
    <div class="container-fluid px-4 d-flex flex-wrap gap-3 justify-content-between">
      <div>
        <p class="mb-1 fw-bold">{{ t('footer.title', '전자정부표준프레임워크 기업 업무') }}</p>
        <p class="mb-0 small text-muted">
          {{ t('footer.copyright', '© 전자정부표준프레임워크. All rights reserved.') }}
        </p>
      </div>
      <ul class="list-unstyled d-flex gap-3 mb-0 small">
        <li><RouterLink to="/terms">{{ t('nav.terms', '이용약관') }}</RouterLink></li>
        <li>
          <RouterLink to="/terms/privacy">
            <strong>{{ t('nav.privacy', '개인정보처리방침') }}</strong>
          </RouterLink>
        </li>
      </ul>
    </div>
  </footer>

  <button
    type="button"
    class="scroll-top-btn"
    :class="{ show: showScrollTop }"
    :aria-label="t('com.scrollTop', '맨 위로')"
    :title="t('com.scrollTop', '맨 위로')"
    @click="scrollToTop"
  >
    <i class="bi bi-arrow-up" aria-hidden="true" />
  </button>
</template>
