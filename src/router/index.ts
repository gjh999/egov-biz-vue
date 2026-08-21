import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { initAuth, useAuth } from '../auth/useAuth'
import { NOTICE_BBS_ID } from '../constants'
import MainView from '../views/MainView.vue'
import LoginView from '../views/LoginView.vue'
import JoinView from '../views/JoinView.vue'
import InfoView from '../views/InfoView.vue'
import LocationView from '../views/LocationView.vue'
import UserTypesView from '../views/UserTypesView.vue'
import BoardListView from '../views/BoardListView.vue'
import BoardDetailView from '../views/BoardDetailView.vue'
import BoardFormView from '../views/BoardFormView.vue'
import FaqView from '../views/FaqView.vue'
import FaqFormView from '../views/FaqFormView.vue'
import QnaView from '../views/QnaView.vue'
import QnaFormView from '../views/QnaFormView.vue'
import SurveyView from '../views/SurveyView.vue'
import TermsView from '../views/TermsView.vue'
import MyPageView from '../views/MyPageView.vue'
import AdminScreenView from '../views/admin/AdminScreenView.vue'
import NotFoundView from '../views/NotFoundView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    /** 로그인이 필요한 화면 */
    requiresAuth?: boolean
    /** ROLE_ADMIN 이 필요한 화면 */
    adminOnly?: boolean
    /** 관리자 화면 정의 이름 (adminScreens.ts 의 키) */
    screen?: string
  }
}

/** 관리자 CRUD 라우트를 한 줄로 정의한다 */
function adminRoute(path: string, name: string, screen: string): RouteRecordRaw {
  return {
    path: `/admin/${path}`,
    name,
    component: AdminScreenView,
    meta: { requiresAuth: true, adminOnly: true, screen },
  }
}

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'main', component: MainView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/join', name: 'join', component: JoinView },

  // 사이트 소개 — 서버 메시지 번들의 문구를 그대로 쓴다
  { path: '/info', redirect: '/info/about' },
  { path: '/info/location', name: 'location', component: LocationView },
  { path: '/info/:slug', name: 'info', component: InfoView },
  { path: '/user-types', name: 'user-types', component: UserTypesView },

  // 게시판 — 목록·상세는 비로그인도 볼 수 있고, 쓰기는 로그인이 필요하다
  // (백엔드 SecurityConfig 의 GET 화이트리스트와 같은 정책)
  { path: '/board', redirect: `/board/${NOTICE_BBS_ID}` },
  { path: '/board/:bbsId', name: 'board-list', component: BoardListView },
  {
    path: '/board/:bbsId/write',
    name: 'board-write',
    component: BoardFormView,
    props: { mode: 'create' },
    meta: { requiresAuth: true },
  },
  { path: '/board/:bbsId/:nttId', name: 'board-detail', component: BoardDetailView },
  {
    path: '/board/:bbsId/:nttId/edit',
    name: 'board-edit',
    component: BoardFormView,
    props: { mode: 'edit' },
    meta: { requiresAuth: true },
  },
  {
    path: '/board/:bbsId/:nttId/reply',
    name: 'board-reply',
    component: BoardFormView,
    props: { mode: 'reply' },
    meta: { requiresAuth: true },
  },

  // 고객지원
  { path: '/faq', name: 'faq', component: FaqView },
  {
    path: '/faq/write',
    name: 'faq-write',
    component: FaqFormView,
    props: { mode: 'create' },
    meta: { requiresAuth: true },
  },
  // 메인에서 특정 FAQ 를 눌러 들어오는 경로. 목록을 열고 그 항목을 펼친다.
  { path: '/faq/:faqId', name: 'faq-detail', component: FaqView },
  {
    path: '/faq/:faqId/edit',
    name: 'faq-edit',
    component: FaqFormView,
    props: { mode: 'edit' },
    meta: { requiresAuth: true },
  },
  { path: '/qna', name: 'qna', component: QnaView },
  // Q&A 는 비회원도 글을 남길 수 있다 — 로그인 가드를 걸지 않는다
  { path: '/qna/write', name: 'qna-write', component: QnaFormView },
  // 설문 참여는 로그인이 필요하다. 화면에 오류를 띄우는 대신 로그인으로 보내고,
  // 로그인하면 원래 보려던 곳으로 되돌아온다.
  { path: '/survey', name: 'survey', component: SurveyView, meta: { requiresAuth: true } },

  // 약관 — 가입 전에도 열람할 수 있어야 한다
  { path: '/terms', name: 'terms', component: TermsView, props: { kind: 'stplat' } },
  { path: '/terms/privacy', name: 'privacy', component: TermsView, props: { kind: 'privacy' } },

  { path: '/mypage', name: 'mypage', component: MyPageView, meta: { requiresAuth: true } },

  // 관리자
  adminRoute('members', 'admin-members', 'members'),
  adminRoute('board-masters', 'admin-board-masters', 'boardMasters'),
  adminRoute('board-use', 'admin-board-use', 'boardUse'),
  adminRoute('templates', 'admin-templates', 'templates'),
  adminRoute('banners', 'admin-banners', 'banners'),
  adminRoute('terms/stplat', 'admin-stplat', 'stplat'),
  adminRoute('terms/privacy', 'admin-privacy', 'privacy'),
  adminRoute('surveys', 'admin-surveys', 'surveys'),
  adminRoute('surveys/templates', 'admin-survey-templates', 'surveyTemplates'),
  adminRoute('surveys/questions', 'admin-survey-questions', 'surveyQuestions'),
  adminRoute('surveys/items', 'admin-survey-items', 'surveyItems'),
  adminRoute('surveys/responses', 'admin-survey-responses', 'surveyResponses'),
  adminRoute('authorities', 'admin-authorities', 'authorities'),
  adminRoute('roles', 'admin-roles', 'roles'),
  adminRoute('groups', 'admin-groups', 'groups'),
  adminRoute('restde', 'admin-restde', 'restde'),
  adminRoute('zip', 'admin-zip', 'zip'),

  /* 기업 업무 템플릿 전용 — 업무사용자·공통코드·메뉴·프로그램·부재·접속정책·로그 */
  adminRoute('users', 'admin-users', 'users'),
  adminRoute('codes', 'admin-codes', 'codes'),
  adminRoute('codes/classes', 'admin-code-classes', 'codeClasses'),
  adminRoute('menus', 'admin-menus', 'menus'),
  adminRoute('programs', 'admin-programs', 'programs'),
  adminRoute('absences', 'admin-absences', 'absences'),
  adminRoute('login-policies', 'admin-login-policies', 'loginPolicies'),
  adminRoute('logs/login', 'admin-login-logs', 'loginLogs'),
  adminRoute('logs/system', 'admin-sys-logs', 'sysLogs'),

  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundView },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

/**
 * 라우트 가드.
 *
 * 서버 권한 검사를 대신하는 장치가 아니다 — 백엔드가 모든 요청을 다시 검사한다.
 * 권한 없는 화면을 그렸다가 401/403 을 받고 깨지는 것을 막는 UX 장치다.
 */
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  // 쿠키가 HttpOnly 라 JS 로는 로그인 여부를 알 수 없다 — 첫 진입 시 서버에 한 번 물어본다
  await initAuth()

  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated.value) {
    // 로그인 후 원래 가려던 곳으로 돌려보내기 위해 경로를 남긴다
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.adminOnly && !isAdmin.value) {
    return { path: '/' }
  }

  return true
})
