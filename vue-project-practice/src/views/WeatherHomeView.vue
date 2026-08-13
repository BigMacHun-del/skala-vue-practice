<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'
import { rawCities, parseProvincePaths, toMapPosition, getWeatherAlert, SONG_GUIDE, legendItems } from '../components/task/task4/weatherTaskData.js'

import WeatherMapPanel from '../components/task/task3/WeatherMapPanel.vue'
import SongRecommendationPanel from '../components/task/task3/SongRecommendationPanel.vue'
import BaseDashboardCard from '../components/task/task4/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/task/task4/exercise/SearchBar.vue'
import WeatherCard from '../components/task/task4/exercise/WeatherCard.vue'

// "/" 경로의 홈 화면. 상태는 이 View가 소유하고 자식들은 props/emits로만 주고받는다.
const provincePaths = parseProvincePaths(southKoreaSvgRaw)

const cityList = computed(() =>
  rawCities.map((city) => ({
    ...city,
    ...toMapPosition(city.lat, city.lon),
    alert: getWeatherAlert(city.temp),
  })),
)

const hottestCity = computed(() => [...cityList.value].sort((a, b) => b.temp - a.temp)[0])

const selectedCityId = ref(null)
const selectedCity = computed(() => cityList.value.find((c) => c.id === selectedCityId.value) ?? hottestCity.value)
const songRecommendation = computed(() => SONG_GUIDE[selectedCity.value.alert.class])

const searchText = ref('')
const filteredCities = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return cityList.value
  return cityList.value.filter((city) => city.name.includes(keyword))
})

// WeatherCard의 상세보기 클릭 시 router.push로 이동 (Programmatic Navigation)
const router = useRouter()
const goToDetail = (cityId) => {
  router.push(`/weather/${cityId}`)
}
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <p class="hero-eyebrow">오늘의 특보 현황</p>
      <h1 class="hero-title">전국 {{ cityList.length }}개 도시의 날씨와 추천곡을 확인해 보세요</h1>
    </section>

    <BaseDashboardCard section-id="map" title="실시간 특보 지도" description="점을 눌러 도시별 기온과 추천곡을 확인해 보세요">
      <WeatherMapPanel
        :city-list="cityList"
        :selected-city-id="selectedCity.id"
        :province-paths="provincePaths"
        :legend-items="legendItems"
        @select-city="selectedCityId = $event"
      />
    </BaseDashboardCard>

    <BaseDashboardCard section-id="song" title="오늘 날씨에 어울리는 노래">
      <SongRecommendationPanel :city="selectedCity" :song="songRecommendation" />
    </BaseDashboardCard>

    <BaseDashboardCard section-id="cities" title="도시별 현황">
      <SearchBar v-model="searchText" />

      <div v-if="filteredCities.length > 0" class="city-grid">
        <WeatherCard
          v-for="city in filteredCities"
          :key="city.id"
          :city="city"
          :active="city.id === selectedCity.id"
          @select="selectedCityId = $event"
          @view-detail="goToDetail"
        />
      </div>
      <p v-else class="no-result">"{{ searchText }}"와 일치하는 도시가 없어요.</p>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  padding: 4px 4px 8px;
}

.hero-eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gh-accent);
  margin-bottom: 8px;
}

.hero-title {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1.4;
  color: var(--gh-text);
}

.city-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.no-result {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
  text-align: center;
  padding: 16px;
}
</style>
