<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bridgePhoto from '@/assets/geoje/geoje-pebble-beach.jpg'
import { GEOJE_ZONES } from './geojeZones'
import GlassCard from './GlassCard.vue'
import GeojeIslandMap from './GeojeIslandMap.vue'
import GeojeZonePreviewPanel from './GeojeZonePreviewPanel.vue'
import { fetchCityCurrent, getWeatherCodeInfo } from '@/composables/useWeatherApi'

// /geoje 라우트 홈. 배경 사진 위에 유리질감 카드들(소개 + 지도 + 구역 목록 패널)이 떠 있는 구조.
// 지도 핀 또는 목록 클릭 시 router.push로 /geoje/:zoneId 상세 페이지로 이동한다.
const router = useRouter()
const goToZone = (zoneId) => {
  router.push(`/geoje/${zoneId}`)
}

// 지도에서 핀에 마우스를 올리면 오른쪽 목록의 해당 항목을 하이라이트한다
const activeZoneId = ref(null)
const previewZone = (zoneId) => {
  activeZoneId.value = zoneId
}

// 구역별 날씨. { [zoneId]: { status, data } } - 화면이 뜨면 전 구역을 한 번에 불러온다
const weatherByZone = reactive({})

const loadZoneWeather = (zone) => {
  weatherByZone[zone.id] = { status: 'loading', data: null }
  fetchCityCurrent(zone.lat, zone.lon)
    .then((result) => {
      weatherByZone[zone.id] = { status: 'loaded', data: { ...result, ...getWeatherCodeInfo(result.weatherCode) } }
    })
    .catch((err) => {
      console.error(err)
      weatherByZone[zone.id] = { status: 'error', data: null }
    })
}

onMounted(() => {
  GEOJE_ZONES.forEach(loadZoneWeather)
})
</script>

<template>
  <div class="geoje-home">
    <div class="geoje-bg" :style="{ backgroundImage: `url(${bridgePhoto})` }"></div>
    <div class="geoje-overlay"></div>

    <div class="geoje-home-inner">
      <RouterLink to="/" class="back-link">← WeatherTune 메인으로 돌아가기</RouterLink>

      <GlassCard class="intro-card">
        <p class="intro-eyebrow">🏝️ 거제 이스터에그에서 오셨나요?</p>
        <h1 class="intro-title">거제 관광지 추천</h1>
        <p class="intro-desc">지도에서 궁금한 지역을 눌러보세요. 명소와 놀거리, 추천 음식, 낚시 정보를 한 번에 볼 수 있어요.</p>
      </GlassCard>

      <div class="map-row">
        <GlassCard class="map-card" title="구역을 선택해 주세요" icon="🗺️">
          <GeojeIslandMap
            :zones="GEOJE_ZONES"
            :active-zone-id="activeZoneId"
            @select-zone="goToZone"
            @preview-zone="previewZone"
          />
        </GlassCard>

        <GeojeZonePreviewPanel
          class="preview-card"
          :zones="GEOJE_ZONES"
          :weather-by-zone="weatherByZone"
          :active-zone-id="activeZoneId"
          @select-zone="goToZone"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.geoje-home {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.geoje-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: saturate(1.08) brightness(1.0);
  z-index: 0;
}

.geoje-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(4, 10, 24, 0.04), rgba(4, 10, 24, 0.13));
  z-index: 1;
}

.geoje-home-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.map-row {
  display: grid;
  /* 지도는 최대 520px까지만 커지고, 남는 공간은 목록 패널이 가져간다 */
  grid-template-columns: minmax(0, 520px) minmax(260px, 1fr);
  /* 목록 쪽 스크롤은 GeojeZonePreviewPanel.vue 안의 고정 max-height + overflow-y로 처리 */
  align-items: start;
  gap: 18px;
}

.preview-card {
  min-width: 0;
}

@media (max-width: 860px) {
  .map-row {
    grid-template-columns: 1fr;
  }
}

.back-link {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: 999px;
}

.intro-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff7e5f;
  margin-bottom: 6px;
}

.intro-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1c1c1e;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.intro-desc {
  font-size: 0.88rem;
  line-height: 1.6;
  color: #3a3a3c;
}
</style>
