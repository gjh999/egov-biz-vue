<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { qnaApi } from '../api/biz'
import { ApiError } from '../api/client'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'

/**
 * Q&A 등록.
 *
 * Q&A 는 비회원도 글을 남길 수 있다. 대신 본인 확인 수단이 없으므로
 * 글마다 작성비밀번호를 받아 두고, 나중에 열람·수정·삭제할 때 그 값으로 확인한다.
 * 비밀번호를 잊으면 본인도 열 수 없으므로 안내 문구를 함께 보여준다.
 */
const router = useRouter()
const { t } = useI18n()

const qestnSj = ref('')
const qestnCn = ref('')
const wrterNm = ref('')
const emailAdres = ref('')
const writngPassword = ref('')
const confirmPassword = ref('')
const error = ref<string | null>(null)
const submitting = ref(false)

async function handleSubmit() {
  error.value = null

  if (writngPassword.value !== confirmPassword.value) {
    error.value = t('qna.pwMismatch', '작성비밀번호가 서로 일치하지 않습니다.')
    return
  }

  submitting.value = true
  try {
    await qnaApi.create({
      qestnSj: qestnSj.value,
      qestnCn: qestnCn.value,
      wrterNm: wrterNm.value,
      emailAdres: emailAdres.value,
      writngPassword: writngPassword.value,
    })
    await router.replace('/qna')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : t('qna.saveFail', '등록하지 못했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-lg-8">
      <h1 class="h3 mb-3">{{ t('qna.write', 'Q&A 등록') }}</h1>

      <AppFeedback v-if="error" state="error" :message="error" />

      <form class="krds-panel" novalidate @submit.prevent="handleSubmit">
        <div class="krds-panel-body">
          <div class="form-group">
            <div class="form-tit">
              <label for="qna-subject">{{ t('bbs.subject', '제목') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input id="qna-subject" v-model="qestnSj" class="krds-input" type="text" maxlength="200" required />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="qna-writer">{{ t('bbs.writer', '작성자') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input id="qna-writer" v-model="wrterNm" class="krds-input" type="text" maxlength="4" required />
              <!-- 서버 VO 가 @Size(max=4) 로 제한한다 — 넘기면 저장 단계에서 거부된다 -->
              <p class="form-hint">{{ t('qna.writerHint', '4자 이내로 입력하세요.') }}</p>
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="qna-email">{{ t('mypage.email', '이메일') }}</label>
            </div>
            <div class="form-conts">
              <input id="qna-email" v-model="emailAdres" class="krds-input" type="email" />
              <p class="form-hint">{{ t('qna.emailHint', '답변이 등록되면 알림을 받을 주소입니다.') }}</p>
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="qna-content">{{ t('bbs.content', '내용') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <textarea id="qna-content" v-model="qestnCn" class="krds-input" rows="12" required />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="qna-pw">{{ t('qna.password', '작성비밀번호') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input id="qna-pw" v-model="writngPassword" class="krds-input" type="password" required />
              <p class="form-hint">
                {{ t('qna.passwordHint', '글을 다시 열어보거나 수정할 때 필요합니다. 잊으면 열람할 수 없습니다.') }}
              </p>
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="qna-pw-confirm">
                {{ t('qna.passwordConfirm', '작성비밀번호 확인') }} <span class="frm-rq">*</span>
              </label>
            </div>
            <div class="form-conts">
              <input id="qna-pw-confirm" v-model="confirmPassword" class="krds-input" type="password" required />
            </div>
          </div>
        </div>

        <div class="krds-panel-body border-top d-flex gap-2">
          <button
            type="submit"
            class="krds-btn primary"
            :disabled="submitting || !qestnSj || !qestnCn || !wrterNm || !writngPassword"
          >
            {{ submitting ? t('com.processing', '처리 중…') : t('com.save', '저장') }}
          </button>
          <button type="button" class="krds-btn tertiary" @click="router.push('/qna')">
            {{ t('com.cancel', '취소') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
