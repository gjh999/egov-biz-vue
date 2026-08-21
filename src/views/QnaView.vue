<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { qnaApi } from '../api/biz'
import { ApiError } from '../api/client'
import { useAsync } from '../composables/useAsync'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'
import AppPagination from '../components/AppPagination.vue'
import type { Qna } from '../api/types'

/**
 * Q&A 목록 + 상세.
 *
 * Q&A 는 비회원도 글을 남길 수 있고, 본인 확인은 글마다 지정한 <b>작성비밀번호</b>로 한다.
 * 그래서 상세를 보기 전에 비밀번호 확인 단계를 거친다.
 */
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const pageIndex = computed(() => Number(route.query.page ?? '1'))
const searchCondition = computed(() => String(route.query.cnd ?? '0'))
const searchKeyword = computed(() => String(route.query.wrd ?? ''))

const condition = ref(searchCondition.value)
const keyword = ref(searchKeyword.value)

watch([searchCondition, searchKeyword], ([cnd, wrd]) => {
  condition.value = cnd
  keyword.value = wrd
})

/** 비밀번호 확인 대상 글 */
const target = ref<Qna | null>(null)
const password = ref('')
const verifyError = ref<string | null>(null)
const verifying = ref(false)
/** 확인을 통과해 열람 중인 글 */
const opened = ref<Qna | null>(null)

const { data, loading, error, reload } = useAsync(
  () =>
    qnaApi.list({
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

function selectQna(qna: Qna) {
  target.value = qna
  opened.value = null
  password.value = ''
  verifyError.value = null
}

async function handleVerify() {
  if (!target.value) return

  verifying.value = true
  verifyError.value = null
  try {
    const { matched } = await qnaApi.verify(target.value.qaId, password.value)
    if (!matched) {
      verifyError.value = t('qna.wrongPassword', '작성비밀번호가 일치하지 않습니다.')
      return
    }
    const detail = await qnaApi.detail(target.value.qaId)
    opened.value = detail.result
    target.value = null
    password.value = ''
  } catch (e) {
    verifyError.value = e instanceof ApiError ? e.message : t('qna.verifyFail', '확인하지 못했습니다.')
  } finally {
    verifying.value = false
  }
}
</script>

<template>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h1 class="h3 mb-0">{{ t('nav.qna', '묻고 답하기') }}</h1>
    <!-- Q&A 는 비회원도 글을 남길 수 있다 — 로그인 여부와 무관하게 노출한다 -->
    <RouterLink to="/qna/write" class="krds-btn primary">
      <i class="bi bi-pencil" aria-hidden="true" /> {{ t('qna.write', '질문 등록') }}
    </RouterLink>
  </div>

  <form class="d-flex gap-2 mb-3" role="search" @submit.prevent="handleSearch">
    <label class="visually-hidden" for="qna-condition">{{ t('bbs.searchCondition', '검색 조건') }}</label>
    <select id="qna-condition" v-model="condition" class="krds-form-select">
      <option value="0">{{ t('bbs.subject', '제목') }}</option>
      <option value="1">{{ t('bbs.content', '내용') }}</option>
    </select>

    <label class="visually-hidden" for="qna-keyword">{{ t('bbs.searchKeyword', '검색어') }}</label>
    <input
      id="qna-keyword"
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
    <div v-else class="krds-table-wrap">
      <table class="tbl">
        <caption>{{ t('qna.listCaption', 'Q&A 목록 — 제목, 작성자, 등록일, 처리상태') }}</caption>
        <colgroup>
          <col />
          <col style="width: 15%" />
          <col style="width: 15%" />
          <col style="width: 12%" />
        </colgroup>
        <thead>
          <tr>
            <th scope="col">{{ t('bbs.subject', '제목') }}</th>
            <th scope="col">{{ t('bbs.writer', '작성자') }}</th>
            <th scope="col">{{ t('bbs.date', '등록일') }}</th>
            <th scope="col">{{ t('qna.status', '처리상태') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="qna in items" :key="qna.qaId">
            <td class="text-start">
              <button
                type="button"
                class="btn-link text-start p-0 border-0 bg-transparent"
                @click="selectQna(qna)"
              >
                <i class="bi bi-lock me-1" aria-hidden="true" />{{ qna.qestnSj }}
              </button>
            </td>
            <td>{{ qna.wrterNm }}</td>
            <td>{{ qna.writngDe }}</td>
            <td>
              <span class="krds-badge" :class="qna.answerCn ? 'bg-primary' : 'bg-gray'">
                {{ qna.qnaProcessSttusCodeNm ?? (qna.answerCn ? t('qna.answered', '답변완료') : t('qna.waiting', '접수')) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AppPagination :info="data?.paginationInfo" @change="goPage" />
  </template>

  <!-- 작성비밀번호 확인 -->
  <section v-if="target" class="krds-panel mt-4">
    <div class="krds-panel-head">
      <h2 class="h5 mb-0">{{ t('qna.verifyTitle', '작성비밀번호 확인') }}</h2>
    </div>
    <div class="krds-panel-body">
      <p class="form-hint">
        {{ t('qna.verifyHint', '비공개 글입니다. 글을 등록할 때 입력한 비밀번호를 넣어 주세요.') }}
      </p>
      <form class="d-flex gap-2" @submit.prevent="handleVerify">
        <label class="visually-hidden" for="qna-password">{{ t('login.password', '비밀번호') }}</label>
        <input id="qna-password" v-model="password" class="krds-input" type="password" autofocus required />
        <button type="submit" class="krds-btn primary flex-shrink-0" :disabled="verifying || !password">
          {{ verifying ? t('com.processing', '처리 중…') : t('com.confirm', '확인') }}
        </button>
        <button type="button" class="krds-btn tertiary flex-shrink-0" @click="target = null; verifyError = null">
          {{ t('com.cancel', '취소') }}
        </button>
      </form>
      <AppFeedback v-if="verifyError" state="error" :message="verifyError" />
    </div>
  </section>

  <!-- 확인을 통과한 글 -->
  <article v-if="opened" class="krds-panel mt-4">
    <div class="krds-panel-head d-flex justify-content-between align-items-center">
      <h2 class="h5 mb-0">{{ opened.qestnSj }}</h2>
      <button type="button" class="krds-btn tertiary small" @click="opened = null">
        {{ t('com.close', '닫기') }}
      </button>
    </div>
    <div class="krds-panel-body">
      <dl class="row small text-muted border-bottom pb-3 mb-3">
        <dt class="col-3 col-md-2">{{ t('bbs.writer', '작성자') }}</dt>
        <dd class="col-9 col-md-4">{{ opened.wrterNm }}</dd>
        <dt class="col-3 col-md-2">{{ t('bbs.date', '등록일') }}</dt>
        <dd class="col-9 col-md-4 mb-0">{{ opened.writngDe }}</dd>
      </dl>

      <!-- 서버가 HTMLTagFilter 로 escape 한 텍스트 — 텍스트로 렌더링해 XSS 경로를 만들지 않는다 -->
      <div style="white-space: pre-wrap">{{ opened.qestnCn }}</div>

      <section v-if="opened.answerCn" class="mt-4 pt-3 border-top">
        <h3 class="h6 text-primary">{{ t('qna.answer', '답변') }}</h3>
        <div style="white-space: pre-wrap">{{ opened.answerCn }}</div>
        <p v-if="opened.answerDe" class="small text-muted mt-2 mb-0">{{ opened.answerDe }}</p>
      </section>
    </div>
  </article>
</template>
