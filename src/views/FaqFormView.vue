<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { faqApi } from '../api/biz'
import { ApiError } from '../api/client'
import { useI18n } from '../i18n/useI18n'
import AppFeedback from '../components/AppFeedback.vue'

/** FAQ 등록 / 수정 — 질문과 답변을 한 폼에서 함께 작성한다. */
const props = defineProps<{ mode: 'create' | 'edit' }>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const faqId = computed(() => (route.params.faqId ? String(route.params.faqId) : ''))

const qestnSj = ref('')
const qestnCn = ref('')
const answerCn = ref('')
const files = ref<File[]>([])
const loading = ref(props.mode === 'edit')
const submitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (props.mode === 'create' || !faqId.value) {
    loading.value = false
    return
  }
  try {
    const detail = await faqApi.detail(faqId.value)
    qestnSj.value = detail.result?.qestnSj ?? ''
    qestnCn.value = detail.result?.qestnCn ?? ''
    answerCn.value = detail.result?.answerCn ?? ''
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : t('faq.loadFail', 'FAQ 를 불러오지 못했습니다.')
  } finally {
    loading.value = false
  }
})

function handleFileChange(event: Event) {
  files.value = Array.from((event.target as HTMLInputElement).files ?? [])
}

async function handleSubmit() {
  error.value = null
  submitting.value = true
  try {
    const values = { qestnSj: qestnSj.value, qestnCn: qestnCn.value, answerCn: answerCn.value }
    if (props.mode === 'create') {
      await faqApi.create(values, files.value)
    } else {
      await faqApi.update(faqId.value, values, files.value)
    }
    await router.replace('/faq')
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : t('com.saveFail', '저장하지 못했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <AppFeedback v-if="loading" state="loading" />

  <div v-else class="row justify-content-center">
    <div class="col-12 col-lg-8">
      <h1 class="h3 mb-3">
        {{ props.mode === 'create' ? t('faq.write', 'FAQ 등록') : t('faq.edit', 'FAQ 수정') }}
      </h1>

      <AppFeedback v-if="error" state="error" :message="error" />

      <form class="krds-panel" novalidate @submit.prevent="handleSubmit">
        <div class="krds-panel-body">
          <div class="form-group">
            <div class="form-tit">
              <label for="faq-subject">{{ t('faq.question', '질문') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <input id="faq-subject" v-model="qestnSj" class="krds-input" type="text" maxlength="200" required />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="faq-question">{{ t('faq.questionDetail', '질문 상세') }}</label>
            </div>
            <div class="form-conts">
              <textarea id="faq-question" v-model="qestnCn" class="krds-input" rows="5" />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="faq-answer">{{ t('faq.answer', '답변') }} <span class="frm-rq">*</span></label>
            </div>
            <div class="form-conts">
              <textarea id="faq-answer" v-model="answerCn" class="krds-input" rows="10" required />
            </div>
          </div>

          <div class="form-group">
            <div class="form-tit">
              <label for="faq-files">{{ t('bbs.attach', '첨부파일') }}</label>
            </div>
            <div class="form-conts">
              <input id="faq-files" class="krds-input" type="file" multiple @change="handleFileChange" />
            </div>
          </div>
        </div>

        <div class="krds-panel-body border-top d-flex gap-2">
          <button type="submit" class="krds-btn primary" :disabled="submitting || !qestnSj || !answerCn">
            {{ submitting ? t('com.processing', '처리 중…') : t('com.save', '저장') }}
          </button>
          <button type="button" class="krds-btn tertiary" @click="router.push('/faq')">
            {{ t('com.cancel', '취소') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
