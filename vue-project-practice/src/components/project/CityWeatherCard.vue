<script setup>
import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  city: { type: Object, required: true },
  active: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
})

defineEmits(['select', 'toggle-favorite'])

const configStore = useConfigStore()
const displayTemp = computed(() => {
  const rawTemp = props.city.temp // 원본 데이터는 항상 섭씨
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return Math.round(rawTemp)
})
</script>

<template>
  <button class="city-card" :class="{ active }" @click="$emit('select', city.id)">
    <button
      class="favorite-btn"
      :class="{ on: isFavorite }"
      type="button"
      :aria-pressed="isFavorite"
      @click.stop="$emit('toggle-favorite', city.id)"
    >
      {{ isFavorite ? '★' : '☆' }}
    </button>

    <div class="city-card-top">
      <span class="city-name">{{ city.name }}</span>
      <span v-if="city.isLive" class="live-dot" title="실시간 데이터"></span>
    </div>

    <div class="temp-row">
      <span class="weather-icon">{{ city.weatherIcon }}</span>
      <span class="temp-value">{{ displayTemp }}{{ configStore.unitSymbol }}</span>
    </div>

    <p class="weather-label">{{ city.weatherLabel }}</p>

    <div class="badge-row">
      <span class="badge" :class="city.alert.class">{{ city.alert.label }}</span>
      <span v-if="city.rainAlert" class="badge" :class="city.rainAlert.class">{{ city.rainAlert.label }}</span>
    </div>

    <p v-if="city.precipitation != null" class="precip-line">💧 {{ city.precipitation.toFixed(1) }}mm · 🍃 {{ city.windSpeed?.toFixed(0) ?? '-' }}km/h</p>

    <!--
      RouterLink: main.js에서 app.use(router)로 등록해두면 어디서든 import 없이 바로 쓸 수 있는 전역 컴포넌트.
      /city/:cityId 라우트(router/index.js)로 이동해서 이 도시만 딱 보여주는 공유용 페이지(CityDetailView)를 연다.
      @click.stop으로 바깥 button의 select 클릭이 같이 발생하지 않게 막는다.
    -->
    <RouterLink :to="`/city/${city.id}`" class="share-link" @click.stop>🔗 공유 링크</RouterLink>
  </button>
</template>

<style scoped>
.city-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
}

.city-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent-2);
}

.city-card.active {
  border-color: var(--accent-2);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-2) 30%, transparent);
}

.favorite-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px;
}

.favorite-btn.on {
  color: #ffb020;
}

.city-card-top {
  display: flex;
  align-items: center;
  gap: 6px;
}

.city-name {
  font-weight: 700;
  font-size: 0.98rem;
  color: var(--text);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 4px 1px rgba(74, 222, 128, 0.8);
}

.temp-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.weather-icon {
  font-size: 1.3rem;
}

.temp-value {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--text);
}

.weather-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.badge-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  border: 1px solid transparent;
}

.badge.heat-warning {
  color: #f5576c;
  background: rgba(245, 87, 108, 0.14);
  border-color: rgba(245, 87, 108, 0.35);
}
.badge.heat-caution {
  color: #ff9a5a;
  background: rgba(255, 154, 90, 0.14);
  border-color: rgba(255, 154, 90, 0.35);
}
.badge.hot {
  color: #d29922;
  background: rgba(210, 153, 34, 0.14);
  border-color: rgba(210, 153, 34, 0.35);
}
.badge.cool {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.14);
  border-color: rgba(74, 222, 128, 0.35);
}
.badge.cold {
  color: #4facfe;
  background: rgba(79, 172, 254, 0.14);
  border-color: rgba(79, 172, 254, 0.35);
}
.badge.cold-caution {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.14);
  border-color: rgba(59, 130, 246, 0.35);
}
.badge.cold-warning {
  color: #7c5cff;
  background: rgba(124, 92, 255, 0.14);
  border-color: rgba(124, 92, 255, 0.35);
}
.badge.rain-caution {
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.14);
  border-color: rgba(14, 165, 233, 0.35);
}
.badge.rain-warning {
  color: #075985;
  background: rgba(3, 105, 161, 0.16);
  border-color: rgba(3, 105, 161, 0.4);
}
/* 폭염/한파/호우 외 나머지 특보(대설·강풍·태풍·안개 등) 공용 색상 - useKmaAlerts.js의 hazardToClass 참고 */
.badge.other-caution {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.14);
  border-color: rgba(245, 158, 11, 0.35);
}
.badge.other-warning {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.16);
  border-color: rgba(220, 38, 38, 0.4);
}

.precip-line {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.share-link {
  align-self: flex-start;
  margin-top: 4px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-2);
  text-decoration: none;
}

.share-link:hover {
  text-decoration: underline;
}
</style>
