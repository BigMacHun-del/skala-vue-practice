<script setup>
import { ref, watch } from 'vue'
import { useConfigStore } from '@/stores/configStore'

// 즐겨찾기한 도시 목록 + 브라우저 알림(Notification API) 연동
const props = defineProps({
  favoriteCities: { type: Array, required: true },
  selectedCityId: { type: String, default: null },
})

const emit = defineEmits(['select', 'toggle-favorite'])

const configStore = useConfigStore()
const formatTemp = (temp) => {
  const value = configStore.unit === 'fahrenheit' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)
  return `${value}${configStore.unitSymbol}`
}

const WARNING_CLASSES = new Set(['heat-warning', 'cold-warning', 'rain-warning', 'other-warning'])

const notifyPermission = ref(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported')
const alreadyNotified = new Set() // 도시id:등급class 형태로 중복 알림 방지

const requestNotification = async () => {
  if (typeof Notification === 'undefined') return
  const result = await Notification.requestPermission()
  notifyPermission.value = result
}

const notifyIfWarning = (city) => {
  if (notifyPermission.value !== 'granted') return
  const grades = [city.alert, city.rainAlert].filter(Boolean)
  for (const grade of grades) {
    if (!WARNING_CLASSES.has(grade.class)) continue
    const key = `${city.id}:${grade.class}`
    if (alreadyNotified.has(key)) continue
    alreadyNotified.add(key)
     
    new Notification(`${city.name} ${grade.label}`, {
      body: `현재 기온 ${Math.round(city.temp)}°C · 즐겨찾기한 도시에 특보가 발효됐어요.`,
      icon: undefined,
    })
  }
}

// 즐겨찾기 도시의 날씨 등급이 바뀔 때마다 경보 등급이면 알림 (immediate로 처음 뜰 때도 검사)
watch(
  () => props.favoriteCities.map((c) => `${c.id}:${c.alert.class}:${c.rainAlert?.class ?? ''}`),
  () => {
    props.favoriteCities.forEach(notifyIfWarning)
  },
  { immediate: true },
)
</script>

<template>
  <div class="favorites">
    <div class="favorites-toolbar">
      <p class="favorites-desc">별표(★)로 즐겨찾기한 도시에 특보가 뜨면 브라우저 알림으로 알려드려요.</p>
      <button v-if="notifyPermission === 'default'" class="notify-btn" type="button" @click="requestNotification">🔔 알림 켜기</button>
      <span v-else-if="notifyPermission === 'granted'" class="notify-status on">🔔 알림 켜짐</span>
      <span v-else-if="notifyPermission === 'denied'" class="notify-status off">🔕 알림 차단됨 (브라우저 설정에서 허용 필요)</span>
    </div>

    <p v-if="favoriteCities.length === 0" class="empty">아직 즐겨찾기한 도시가 없어요. 도시 카드의 ☆ 버튼을 눌러보세요.</p>

    <div v-else class="favorites-grid">
      <button
        v-for="city in favoriteCities"
        :key="city.id"
        class="favorite-chip"
        :class="{ active: city.id === selectedCityId }"
        @click="emit('select', city.id)"
      >
        <span class="chip-icon">{{ city.weatherIcon }}</span>
        <span class="chip-name">{{ city.name }}</span>
        <span class="chip-temp">{{ formatTemp(city.temp) }}</span>
        <span class="chip-remove" @click.stop="emit('toggle-favorite', city.id)">✕</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.favorites-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.favorites-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.notify-btn {
  border: none;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  white-space: nowrap;
}

.notify-status {
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

.notify-status.on {
  color: #4ade80;
}

.notify-status.off {
  color: var(--text-secondary);
}

.empty {
  font-size: 0.88rem;
  color: var(--text-secondary);
  padding: 24px 0;
  text-align: center;
}

.favorites-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.favorite-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-inset);
  cursor: pointer;
  transition: all 0.15s ease;
}

.favorite-chip:hover {
  border-color: var(--accent-2);
}

.favorite-chip.active {
  border-color: var(--accent-2);
  background: color-mix(in srgb, var(--accent-2) 12%, var(--bg-inset));
}

.chip-icon {
  font-size: 1rem;
}

.chip-name {
  font-weight: 700;
  font-size: 0.86rem;
  color: var(--text);
}

.chip-temp {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.chip-remove {
  font-size: 0.72rem;
  color: var(--text-secondary);
  padding: 2px 4px;
  border-radius: 50%;
}

.chip-remove:hover {
  color: #f5576c;
}
</style>
