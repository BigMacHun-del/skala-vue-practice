<script setup>
// props: 카드 1개 분량의 도시 정보만 받아서 표시 (v-for로 여러 번 재사용됨)
defineProps({
  city: { type: Object, required: true },
  active: { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
})

// emits: 카드 클릭(select)·별표 클릭(toggle-favorite) 둘 다 상태 변경은 부모가 담당
defineEmits(['select', 'toggle-favorite'])
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
      <span class="temp-value">{{ Math.round(city.temp) }}°</span>
    </div>

    <p class="weather-label">{{ city.weatherLabel }}</p>

    <div class="badge-row">
      <span class="badge" :class="city.alert.class">{{ city.alert.label }}</span>
      <span v-if="city.rainAlert" class="badge" :class="city.rainAlert.class">{{ city.rainAlert.label }}</span>
    </div>

    <p v-if="city.precipitation != null" class="precip-line">💧 {{ city.precipitation.toFixed(1) }}mm · 🍃 {{ city.windSpeed?.toFixed(0) ?? '-' }}km/h</p>
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

.precip-line {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 2px;
}
</style>
