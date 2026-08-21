<script setup lang="ts">
import { computed, ref } from 'vue'
import { memberApi } from '../api/biz'
import { ApiError } from '../api/client'
import { useAsync } from '../composables/useAsync'
import { useAuth } from '../auth/useAuth'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'

/** 마이페이지 — 내 정보 확인과 비밀번호 변경. */
const { t } = useI18n()
const { user } = useAuth()
const { data, loading, error } = useAsync(() => memberApi.myPage())

const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const pwError = ref<string | null>(null)
const pwDone = ref(false)
const submitting = ref(false)

const displayId = computed(() => data.value?.mberId ?? data.value?.emplyrId ?? user.value?.id ?? '-')
const displayName = computed(
  () => data.value?.mberNm ?? data.value?.userNm ?? data.value?.emplyrNm ?? user.value?.name ?? '-',
)
const displayEmail = computed(() => data.value?.mberEmailAdres ?? data.value?.emailAdres ?? '-')

async function handlePasswordChange() {
  pwError.value = null
  pwDone.value = false

  if (newPassword.value !== confirmPassword.value) {
    pwError.value = t('mypage.pwMismatch', '새 비밀번호가 서로 일치하지 않습니다.')
    return
  }

  submitting.value = true
  try {
    await memberApi.updatePassword(oldPassword.value, newPassword.value)
    pwDone.value = true
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (e) {
    pwError.value = e instanceof ApiError ? e.message : t('mypage.pwFail', '비밀번호를 변경하지 못했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppFeedback v-if="loading" state="loading" />

  <template v-else>
    <h1 class="h3 mb-3">{{ t('nav.mypage', '마이페이지') }}</h1>

    <div class="krds-panel mb-4">
      <div class="krds-panel-head">
        <h2 class="h5 mb-0">{{ t('mypage.info', '내 정보') }}</h2>
      </div>
      <div class="krds-panel-body">
        <div class="krds-table-wrap">
          <table class="tbl col">
            <caption>{{ t('mypage.infoCaption', '내 정보 — 아이디, 이름, 이메일') }}</caption>
            <tbody>
              <tr>
                <th scope="row">{{ t('login.id', '아이디') }}</th>
                <td>{{ displayId }}</td>
              </tr>
              <tr>
                <th scope="row">{{ t('mypage.name', '이름') }}</th>
                <td>{{ displayName }}</td>
              </tr>
              <tr>
                <th scope="row">{{ t('mypage.email', '이메일') }}</th>
                <td>{{ displayEmail }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <AppFeedback v-if="error" state="error" :message="error" />
      </div>
    </div>

    <div class="krds-panel">
      <div class="krds-panel-head">
        <h2 class="h5 mb-0">{{ t('mypage.changePw', '비밀번호 변경') }}</h2>
      </div>
      <div class="krds-panel-body">
        <form novalidate @submit.prevent="handlePasswordChange">
          <AppFeedback v-if="pwError" state="error" :message="pwError" />
          <div v-if="pwDone" class="krds-alert success mb-3" role="status">
            {{ t('mypage.pwChanged', '비밀번호를 변경했습니다.') }}
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="pw-old">{{ t('mypage.currentPw', '현재 비밀번호') }}</label>
            </div>
            <div class="form-conts">
              <input
                id="pw-old"
                v-model="oldPassword"
                class="krds-input"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="pw-new">{{ t('mypage.newPw', '새 비밀번호') }}</label>
            </div>
            <div class="form-conts">
              <input
                id="pw-new"
                v-model="newPassword"
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
              <label for="pw-confirm">{{ t('mypage.confirmPw', '새 비밀번호 확인') }}</label>
            </div>
            <div class="form-conts">
              <input
                id="pw-confirm"
                v-model="confirmPassword"
                class="krds-input"
                type="password"
                autocomplete="new-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            class="krds-btn primary mt-3"
            :disabled="submitting || !oldPassword || !newPassword || !confirmPassword"
          >
            {{ submitting ? t('com.processing', '처리 중…') : t('com.save', '저장') }}
          </button>
        </form>
      </div>
    </div>
  </template>
</template>
