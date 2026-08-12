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

// /city/:cityId 라우트 전용 페이지. CityWeatherCard.vue의 "🔗 공유 링크"를 누르면 여기로 온다.
// useWeatherCities()는 WeatherMusicApp.vue와 같은 캐시(cityList)를 공유하는 싱글턴 컴포저블이라,
// 메인 화면에서 이미 날씨를 불러온 뒤라면 여기서 또 fetch하지 않고 바로 재사용한다.
const route = useRoute()
const { cityList, isLoading, dailyState, ensureDaily } = useWeatherCities()

// computed: route.params.cityId가 바뀔 때마다(=다른 공유 링크로 이동할 때마다) 자동으로 다시 찾는다.
// WeatherDetailView.vue(task4)와 달리 onMounted 1회성이 아니라 computed를 쓴 이유 -
// 여기 cityList는 실시간 fetch로 나중에 갱신될 수 있어서, 값이 바뀌면 이 화면도 최신 데이터로 따라가야 한다.
const city = computed(() => cityList.value.find((c) => c.id === route.params.cityId) ?? null)
const songRecommendation = computed(() => (city.value ? SONG_GUIDE[city.value.alert.class] : null))

// 이 도시의 7일 예보가 아직 없으면 불러온다. WeatherMusicApp.vue를 거치지 않고 공유 링크로
// 바로 들어왔을 수도 있어서, 여기서도 똑같이 ensureDaily를 호출해야 한다.
watch(
  () => city.value?.id,
  (cityId) => {
    if (cityId) ensureDaily(cityId)
  },
  { immediate: true },
)

// configStore/favoritesStore: WeatherMusicApp.vue와 props 없이 완전히 같은 상태를 공유한다.
// 이 페이지는 메인 화면을 거치지 않고 공유 링크로 바로 들어올 수도 있어서, Pinia 스토어가 아니었다면
// (로컬 ref였다면) 단위 설정/즐겨찾기 여부를 여기서 알 방법이 없었을 것 - 스토어를 쓰는 이유가 잘 드러나는 지점.
const configStore = useConfigStore()
const favoritesStore = useFavoritesStore()

// CityWeatherCard.vue와 같은 모양의 변환 로직 (요구사항에서 컴포저블 공유는 범위 제외로 명시됨)
const displayTemp = computed(() => {
  if (!city.value) return null
  const rawTemp = city.value.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }
  return Math.round(rawTemp)
})

// 메인 화면(WeatherMusicApp)과 같은 다크/라이트 테마를 유지하기 위해 localStorage 값을 그대로 읽는다.
// (테마 토글 버튼은 메인 화면에만 있고, 여긴 마지막으로 고른 테마를 보여주기만 함)
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
          <!-- 즐겨찾기 별표: CityWeatherCard.vue와 동일한 favoritesStore.toggle을 여기서도 바로 호출한다 -->
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

      <!-- v-else: cityId가 잘못됐거나(오타 링크 등) 존재하지 않는 도시일 때 -->
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
