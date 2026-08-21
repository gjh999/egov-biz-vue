<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { memberApi, termsApi } from '../api/biz'
import { ApiError } from '../api/client'
import { useAsync } from '../composables/useAsync'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'

/**
 * 회원가입.
 *
 * 1) 이용약관·개인정보처리방침에 동의하고 2) 가입 정보를 입력한다.
 * 두 약관 모두 <b>현재 대표로 지정된 버전</b>을 서버에서 받아 보여준다 — 화면에 문구를 박아 두면
 * 약관이 개정돼도 화면이 옛 문구를 계속 보여주게 된다.
 */
const router = useRouter()
const { t } = useI18n()

const step = ref<'agree' | 'form'>('agree')
const agreeTerms = ref(false)
const agreePrivacy = ref(false)

const mberId = ref('')
const password = ref('')
const confirmPassword = ref('')
const mberNm = ref('')
const email = ref('')

const idChecked = ref<boolean | null>(null)
const error = ref<string | null>(null)
const submitting = ref(false)

const stplat = useAsync(() => termsApi.stplat())
const privacy = useAsync(() => termsApi.privacy())

async function handleCheckId() {
  error.value = null
  if (!mberId.value) return
  try {
    const { available } = await memberApi.checkId(mberId.value)
    idChecked.value = available
    if (!available) {
      error.value = t('join.idTaken', '이미 사용 중인 아이디입니다.')
    }
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : t('join.idCheckFail', '아이디를 확인하지 못했습니다.')
  }
}

async function handleSubmit() {
  error.value = null

  if (idChecked.value !== true) {
    error.value = t('join.needIdCheck', '아이디 중복 확인을 해 주세요.')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = t('join.pwMismatch', '비밀번호가 서로 일치하지 않습니다.')
    return
  }

  submitting.value = true
  try {
    // 비밀번호는 평문으로 보낸다 — 서버가 해싱해 저장한다(운영 배포에는 HTTPS 필수)
    await memberApi.joinGeneral({
      mberId: mberId.value,
      password: password.value,
      mberNm: mberNm.value,
      mberEmailAdres: email.value,
    })
    await router.replace('/login')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : t('join.fail', '가입하지 못했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppFeedback v-if="stplat.loading.value || privacy.loading.value" state="loading" />

  <div v-else class="row justify-content-center">
    <div class="col-12 col-lg-8">
      <h1 class="h3 mb-3">{{ t('nav.join', '회원가입') }}</h1>

      <AppFeedback v-if="error" state="error" :message="error" />

      <template v-if="step === 'agree'">
        <section class="krds-panel mb-3">
          <div class="krds-panel-head">
            <h2 class="h5 mb-0">{{ t('nav.terms', '이용약관') }}</h2>
          </div>
          <div class="krds-panel-body">
            <div
              style="white-space: pre-wrap; max-height: 14rem; overflow-y: auto"
              tabindex="0"
              role="region"
              :aria-label="t('nav.terms', '이용약관')"
            >
              {{ stplat.data.value?.useStplatCn ?? t('terms.empty', '등록된 내용이 없습니다.') }}
            </div>
            <div class="form-check mt-3">
              <input id="agree-terms" v-model="agreeTerms" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="agree-terms">
                {{ t('join.agreeTerms', '이용약관에 동의합니다.') }}
              </label>
            </div>
          </div>
        </section>

        <section class="krds-panel mb-3">
          <div class="krds-panel-head">
            <h2 class="h5 mb-0">{{ t('nav.privacy', '개인정보처리방침') }}</h2>
          </div>
          <div class="krds-panel-body">
            <div
              style="white-space: pre-wrap; max-height: 14rem; overflow-y: auto"
              tabindex="0"
              role="region"
              :aria-label="t('nav.privacy', '개인정보처리방침')"
            >
              {{ privacy.data.value?.indvdlInfoCn ?? t('terms.empty', '등록된 내용이 없습니다.') }}
            </div>
            <div class="form-check mt-3">
              <input id="agree-privacy" v-model="agreePrivacy" class="form-check-input" type="checkbox" />
              <label class="form-check-label" for="agree-privacy">
                {{ t('join.agreePrivacy', '개인정보 수집·이용에 동의합니다.') }}
              </label>
            </div>
          </div>
        </section>

        <button
          type="button"
          class="krds-btn primary"
          :disabled="!agreeTerms || !agreePrivacy"
          @click="step = 'form'"
        >
          {{ t('com.next', '다음') }}
        </button>
      </template>

      <form v-else class="krds-panel" novalidate @submit.prevent="handleSubmit">
        <div class="krds-panel-body">
          <div class="form-group">
            <div class="form-tit">
              <label for="join-id">{{ t('login.id', '아이디') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts d-flex gap-2">
              <input
                id="join-id"
                v-model="mberId"
                class="krds-input"
                type="text"
                required
                @input="idChecked = null"
              />
              <button
                type="button"
                class="krds-btn secondary flex-shrink-0"
                :disabled="!mberId"
                @click="handleCheckId"
              >
                {{ t('join.checkId', '중복확인') }}
              </button>
            </div>
            <p v-if="idChecked === true" class="form-hint text-primary">
              {{ t('join.idAvailable', '사용할 수 있는 아이디입니다.') }}
            </p>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="join-name">{{ t('mypage.name', '이름') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input id="join-name" v-model="mberNm" class="krds-input" type="text" required />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="join-email">{{ t('mypage.email', '이메일') }}</label>
            </div>
            <div class="form-conts">
              <input id="join-email" v-model="email" class="krds-input" type="email" />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="join-pw">{{ t('login.password', '비밀번호') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input
                id="join-pw"
                v-model="password"
                class="krds-input"
                type="password"
                autocomplete="new-password"
                minlength="8"
                required
              />
              <p class="form-hint">{{ t('mypage.pwHint', '8자 이상 입력하세요.') }}</p>
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="join-pw-confirm">
                {{ t('mypage.confirmPw', '비밀번호 확인') }} <span class="frm-rq">*</span>
              </label>
            </div>
            <div class="form-conts">
              <input
                id="join-pw-confirm"
                v-model="confirmPassword"
                class="krds-input"
                type="password"
                autocomplete="new-password"
                required
              />
            </div>
          </div>
        </div>

        <div class="krds-panel-body border-top d-flex gap-2">
          <button type="submit" class="krds-btn primary" :disabled="submitting">
            {{ submitting ? t('com.processing', '처리 중…') : t('nav.join', '회원가입') }}
          </button>
          <button type="button" class="krds-btn tertiary" @click="step = 'agree'">
            {{ t('com.prev', '이전') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
