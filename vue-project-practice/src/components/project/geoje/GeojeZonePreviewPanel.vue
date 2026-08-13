<script setup>
import GlassCard from './GlassCard.vue'

// 지도 오른쪽에 놓이는 "구역 목록" 패널. 예전엔 마우스 오버한 구역 하나만 보여줬는데,
// 이제 8개 구역 정보(실시간 날씨 + 명소 소개)를 전부 나열하고 카드 안에서만 스크롤되게 바꿨다.
// weatherByZone: GeojeHomeView.vue가 onMounted에서 구역별로 미리 불러온 날씨 캐시를 그대로 내려받는다 -
// { [zoneId]: { status: 'loading'|'loaded'|'error', data } }, data는 useWeatherApi.fetchCityCurrent() 결과.
// activeZoneId: 지도 핀에 마우스를 올렸을 때 해당 항목을 하이라이트하기 위한 값(선택 사항).
defineProps({
  zones: { type: Array, required: true },
  weatherByZone: { type: Object, default: () => ({}) },
  activeZoneId: { type: String, default: null },
})

defineEmits(['select-zone'])
</script>

<template>
  <GlassCard class="preview-panel" title="구역별 날씨 & 정보" icon="📍">
    <div class="zone-list">
      <button
        v-for="zone in zones"
        :key="zone.id"
        class="zone-row"
        :class="{ 'zone-row-active': zone.id === activeZoneId }"
        @click="$emit('select-zone', zone.id)"
      >
        <div class="zone-row-top">
          <span class="zone-dot" :style="{ background: zone.accentColor }"></span>
          <span class="zone-name">{{ zone.name }}</span>
          <span class="zone-tagline">{{ zone.tagline }}</span>
        </div>

        <div class="zone-weather">
          <template v-if="weatherByZone[zone.id]?.status === 'loading'">
            <span class="weather-spinner"></span>
            <span class="weather-loading-text">날씨 불러오는 중...</span>
          </template>
          <template v-else-if="weatherByZone[zone.id]?.status === 'loaded'">
            <span class="weather-icon">{{ weatherByZone[zone.id].data.icon }}</span>
            <span class="weather-temp">{{ Math.round(weatherByZone[zone.id].data.temp) }}°C</span>
            <span class="weather-label">{{ weatherByZone[zone.id].data.label }}</span>
          </template>
          <template v-else-if="weatherByZone[zone.id]?.status === 'error'">
            <span class="weather-icon">⚠️</span>
            <span class="weather-loading-text">날씨 정보를 불러오지 못했어요.</span>
          </template>
        </div>

        <p class="zone-desc">{{ zone.attractions[0].desc }}</p>

        <ul class="zone-tags">
          <li v-for="fish in zone.fishing.fishTypes" :key="fish" class="zone-tag">🐟 {{ fish }}</li>
        </ul>
      </button>
    </div>
  </GlassCard>
</template>

<style scoped>
.preview-panel {
  /* 부모(.map-row)가 더 이상 stretch로 지도 카드 높이에 맞춰주지 않으니,
     이 카드 자체에 최대 높이를 정해두고 그 안에서만 스크롤되게 한다
     (대략 지도 카드가 데스크톱 폭에서 갖는 높이와 비슷하게 잡음). */
  max-height: 720px;
  display: flex;
  flex-direction: column;
}

.preview-panel :deep(.glass-card-body) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.zone-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 6px;
  margin-right: -6px;
}

.zone-list::-webkit-scrollbar {
  width: 6px;
}

.zone-list::-webkit-scrollbar-thumb {
  background: rgba(28, 28, 30, 0.18);
  border-radius: 999px;
}

.zone-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.5);
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
}

.zone-row:hover {
  background: rgba(255, 255, 255, 0.65);
}

.zone-row-active {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 0 2px rgba(28, 28, 30, 0.15);
}

.zone-row-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.zone-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
}

.zone-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: #1c1c1e;
}

.zone-tagline {
  font-size: 0.76rem;
  color: #6e6e73;
}

.zone-weather {
  display: flex;
  align-items: center;
  gap: 6px;
}

.weather-icon {
  font-size: 1.1rem;
}

.weather-temp {
  font-weight: 800;
  font-size: 0.9rem;
  color: #1c1c1e;
}

.weather-label {
  font-size: 0.76rem;
  color: #6e6e73;
}

.weather-loading-text {
  font-size: 0.76rem;
  color: #6e6e73;
}

.weather-spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(28, 28, 30, 0.15);
  border-top-color: #6e6e73;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.zone-desc {
  font-size: 0.8rem;
  line-height: 1.5;
  color: #48484a;
}

.zone-tags {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.zone-tag {
  font-size: 0.7rem;
  font-weight: 700;
  color: #1c1c1e;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 3px 9px;
  border-radius: 999px;
}
</style>
