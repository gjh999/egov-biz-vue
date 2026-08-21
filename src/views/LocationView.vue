<script setup lang="ts">
import { useI18n } from '../i18n/useI18n'

/** 찾아오시는 길 — 주소·연락처·교통편 항목이 따로 있어 별도 화면으로 둔다 */
const { t } = useI18n()
</script>

<template>
  <div class="container">
    <nav :aria-label="t('com.breadcrumb', '현재 위치')">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><RouterLink to="/">{{ t('common.home', '홈') }}</RouterLink></li>
        <li class="breadcrumb-item">{{ t('nav.introGroup', '사이트 소개') }}</li>
        <li class="breadcrumb-item active">{{ t('loc.title') }}</li>
      </ol>
    </nav>

    <div class="intro-hero">
      <div class="intro-hero-text">
        <span class="intro-hero-eyebrow">
          <i class="bi bi-geo-alt" aria-hidden="true" /> {{ t('loc.eyebrow') }}
        </span>
        <h1>{{ t('loc.heading') }}</h1>
        <p>{{ t('loc.lead') }}</p>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-6">
        <section class="krds-panel h-100">
          <div class="krds-panel-head fw-bold">{{ t('loc.addr.title') }}</div>
          <div class="krds-panel-body">
            <div class="krds-table-wrap">
              <table class="tbl col">
                <caption>{{ t('loc.addr.title') }}</caption>
                <tbody>
                  <tr>
                    <th scope="row">{{ t('loc.addr.road') }}</th>
                    <td>{{ t('loc.addr.road.val') }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('loc.addr.jibun') }}</th>
                    <td>{{ t('loc.addr.jibun.val') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div class="col-12 col-lg-6">
        <section class="krds-panel h-100">
          <div class="krds-panel-head fw-bold">{{ t('loc.contact.title') }}</div>
          <div class="krds-panel-body">
            <div class="krds-table-wrap">
              <table class="tbl col">
                <caption>{{ t('loc.contact.title') }}</caption>
                <tbody>
                  <tr>
                    <th scope="row">{{ t('loc.contact.tel') }}</th>
                    <td>02-2100-0000</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('loc.contact.email') }}</th>
                    <td>help@egovframe.go.kr</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div class="col-12">
        <section class="krds-panel">
          <div class="krds-panel-head fw-bold">{{ t('loc.transit.title') }}</div>
          <div class="krds-panel-body">
            <div class="krds-table-wrap">
              <table class="tbl col">
                <caption>{{ t('loc.transit.title') }}</caption>
                <tbody>
                  <tr>
                    <th scope="row">{{ t('loc.transit.line1') }}</th>
                    <td>{{ t('loc.transit.line1.val') }}</td>
                  </tr>
                  <tr>
                    <th scope="row">{{ t('loc.transit.line2') }}</th>
                    <td>{{ t('loc.transit.line2.val') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
