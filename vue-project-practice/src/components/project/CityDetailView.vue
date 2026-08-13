<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherCities, SONG_GUIDE } from '@/composables/useWeatherCities'
import { useConfigStore } from '@/stores/configStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import UnitToggler from './UnitToggler.vue'

import WeatherTrendChart from './WeatherTrendChart.vue'
import SongPlayerSection from './SongPlayerSection.vue'
import ShareCardSection from './ShareCardSection.vue'

// /city/:cityId 전용 페이지. CityWeatherCard.vue의 공유 링크를 누르면 여기로 온다.
// useWeatherCities()는 WeatherMusicApp.vue와 같은 캐시를 공유하므로 여기서 다시 fetch하지 않는다.
const route = useRoute()
const { cityList, isLoading, dailyState, ensureDaily } = useWeatherCities()

const city = computed(() => cityList.value.find((c) => c.id === route.params.cityId) ?? null)
const songRecommendation = computed(() => (city.value ? SONG_GUIDE[city.value.alert.class] : null))

// 공유 링크로 바로 들어왔을 수도 있으니 이 도시의 예보가 없으면 불러온다
watch(
  () => city.value?.id,
  (cityId) => {
    if (cityId) ensureDaily(cityId)
  },
  { immediate: true },
)

const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()

const displayTemp = computed(() => {
  if (!city.value) return null
  const rawTemp = city.value.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return Math.round(rawTemp)
})

// 메인 화면과 같은 테마를 유지하기 위해 localStorage 값을 그대로 읽는다 (토글 버튼은 없음)
const isDark = ref(localStorage.getItem('weathertune-theme') !== 'light')
</script>

<template>
  <div class="city-detail" :class="isDark ? 'theme-dark' : 'theme-light'">
    <div class="detail-inner">
      <div class="detail-topbar">
        <RouterLink to="/" class="back-link">← 웨더튠으로 돌아가기</RouterLink>
        <UnitToggler />
      </div>

      <template v-if="isLoading && !city">
        <p class="status-msg">날씨를 불러오는 중이에요...</p>
      </template>

      <template v-else-if="city">
        <header class="detail-header">
          <span class="detail-icon">{{ city.weatherIcon }}</span>
          <div class="detail-header-body">
            <h1 class="detail-name">{{ city.name }}</h1>
            <p class="detail-status">{{ city.weatherLabel }} · {{ displayTemp }}{{ configStore.unitSymbol }}</p>
          </div>
          <button
            class="favorite-toggle"
            type="button"
            :class="{ on: favoritesStore.isFavorite(city.id) }"
            :aria-pressed="favoritesStore.isFavorite(city.id)"
            @click="favoritesStore.toggle(city.id)"
          >
            {{ favoritesStore.isFavorite(city.id) ? '★' : '☆' }}
          </button>
        </header>

        <section class="detail-block">
          <h2 class="block-title">기온 트렌드</h2>
          <WeatherTrendChart v-if="city.daily?.length" :city-name="city.name" :daily="city.daily" />
          <div v-else-if="dailyState[city.id] === 'error'" class="status-msg">
            <p>기온 추이를 불러오지 못했어요.</p>
            <button class="retry-btn" type="button" @click="ensureDaily(city.id)">다시 시도</button>
          </div>
          <p v-else class="status-msg">실시간 데이터를 불러오는 중이에요...</p>
        </section>

        <section class="detail-block">
          <h2 class="block-title">추천곡</h2>
          <SongPlayerSection :city="city" :song="songRecommendation" />
        </section>

        <section class="detail-block">
          <h2 class="block-title">📸 공유 카드</h2>
          <ShareCardSection :city="city" :song="songRecommendation" accent-from="#ff7e5f" accent-to="#7c5cff" />
        </section>
      </template>

      <p v-else class="status-msg">"{{ route.params.cityId }}" 도시를 찾을 수 없어요.</p>
    </div>
  </div>
</template>

<style scoped>
.city-detail {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
}

.detail-inner {
  max-width: 640px;
  margin: 0 auto;
  padding: 28px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.back-link {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-2);
  text-decoration: none;
}

.status-msg {
  font-size: 0.9rem;
  color: var(--text-secondary);
  padding: 24px 0;
  text-align: center;
}

.retry-btn {
  margin-top: 10px;
  border: 1px solid var(--border);
  background: var(--bg-inset);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  cursor: pointer;
}

.retry-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.detail-icon {
  font-size: 2.8rem;
}

.detail-header-body {
  flex: 1;
  min-width: 0;
}

.favorite-toggle {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  line-height: 1;
  color: var(--text-secondary);
  cursor: pointer;
}

.favorite-toggle.on {
  color: #ffb020;
}

.detail-name {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text);
}

.detail-status {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.detail-block {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 24px;
}

.block-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 14px;
}
</style>
