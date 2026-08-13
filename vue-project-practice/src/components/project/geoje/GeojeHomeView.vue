<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bridgePhoto from '@/assets/geoje/geoje-pebble-beach.jpg'
import { GEOJE_ZONES } from './geojeZones'
import GlassCard from './GlassCard.vue'
import GeojeIslandMap from './GeojeIslandMap.vue'
import GeojeZonePreviewPanel from './GeojeZonePreviewPanel.vue'
import { fetchCityCurrent, getWeatherCodeInfo } from '@/composables/useWeatherApi'

// /geoje 라우트 홈. 배경은 거제 몽돌해변 사진, 그 위에 유리질감 카드들(소개 + 지도 + 구역 목록 패널)이 떠 있는 구조.
// useRouter(): 지도 핀 클릭 또는 오른쪽 목록의 항목 클릭 시 select-zone 이벤트를 받아
// router.push로 /geoje/:zoneId 상세 페이지로 이동시킨다 (Programmatic Navigation).
const router = useRouter()
const goToZone = (zoneId) => {
  router.push(`/geoje/${zoneId}`)
}

// 지도에서 핀에 마우스를 올리면(preview-zone) 오른쪽 목록의 해당 항목을 하이라이트만 해준다
// (이전엔 이걸로 패널 내용 자체를 바꿔치기했는데, 이제는 8개 구역을 전부 나열하는 방식이라
// 하이라이트 용도로만 남겨뒀다).
const activeZoneId = ref(null)
const previewZone = (zoneId) => {
  activeZoneId.value = zoneId
}

// 구역별 날씨. { [zoneId]: { status: 'loading'|'loaded'|'error', data } } - 화면이 뜨자마자
// 8개 구역 전부를 한 번에 불러온다(더 이상 마우스 오버로 필요할 때만 불러오는 방식이 아님).
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
    <!--
      geoje-pebble-beach.jpg(1200x675, 16:9 가로 사진 - 학동 몽돌해변)로 교체. 사용자가 직접 올려준
      사진이고, 배너 비율에 가까운 가로 사진이라 cover로 크게 잘리지 않는다.
    -->
    <div class="geoje-bg" :style="{ backgroundImage: `url(${bridgePhoto})` }"></div>
    <div class="geoje-overlay"></div>

    <div class="geoje-home-inner">
      <!-- 이스터에그(EasterEggModal)에서 여기로 넘어온 뒤에는 /geoje/:zoneId 상세 페이지처럼
           "← 거제 지도로 돌아가기" 링크가 없어서 메인 WeatherTune 화면(/)으로 돌아갈 방법이
           없었다 - 그거 추가한 것. GeojeZoneDetailView.vue의 back-link와 같은 스타일. -->
      <RouterLink to="/" class="back-link">← WeatherTune 메인으로 돌아가기</RouterLink>

      <!-- 소개 카드: 지금은 기본 문구만 넣어뒀지만, 요구사항 6번대로 GlassCard가 <slot> 기반이라
           이 자리의 내용을 나중에 다른 내용으로 통째로 바꿔 끼울 수 있다.
           아래 map-row(지도+목록 패널) 전체 폭에 맞춰서 이 카드도 늘어나게 max-width를 뺐다. -->
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

        <!-- 마우스 오버로 하나씩 보여주던 방식 대신, 8개 구역 정보를 전부 나열하고 카드 안에서만
             스크롤되게 바꿨다(지도에서 핀에 마우스를 올리면 해당 항목이 하이라이트만 됨). -->
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
  /* 몽돌해변 사진도 이미 하늘/바다가 밝은 원본이라 brightness를 더 끌어올릴 필요가 없다.
     채도만 아주 살짝 올려서 자갈/바다색이 또렷하게 보이게 했다. */
  filter: saturate(1.08) brightness(1.0);
  z-index: 0;
}

.geoje-overlay {
  position: absolute;
  inset: 0;
  /* 카드가 반투명해지면서 이 어두운 오버레이가 카드 안까지 비쳐서 글씨 가독성이 떨어졌다.
     0.3/0.62 -> 0.12/0.3 -> 0.06/0.18 -> 0.04/0.13으로 계속 낮춰서 배경이 더 잘 비치게 했다. */
  background: linear-gradient(rgba(4, 10, 24, 0.04), rgba(4, 10, 24, 0.13));
  z-index: 1;
}

.geoje-home-inner {
  position: relative;
  z-index: 2;
  width: 100%;
  /* 예전엔 480px 고정이라 넓은 화면에서 카드 하나만 가운데 뜨고 양옆이 텅 비었었다.
     지도 옆에 미리보기 패널을 나란히 놓을 수 있게 폭을 넓혔다. */
  max-width: 1040px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.map-row {
  display: grid;
  /* 지도는 최대 520px까지만 커지고, 남는 공간은 전부 목록 패널이 가져간다 */
  grid-template-columns: minmax(0, 520px) minmax(260px, 1fr);
  /* stretch였을 때는 목록 패널의 내용 높이에 맞춰 지도 카드까지 강제로 늘어나면서
     지도 그림 아래로 빈 공백이 크게 남았다. 이제 각 카드가 자기 내용만큼만 높이를 갖게 하고,
     목록 쪽 스크롤은 GeojeZonePreviewPanel.vue 안의 고정 max-height + overflow-y로 처리한다. */
  align-items: start;
  gap: 18px;
}

.preview-card {
  min-width: 0;
}

/* 화면이 좁으면(모바일 등) 미리보기 패널을 지도 아래로 내려서 세로로 쌓는다 */
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
