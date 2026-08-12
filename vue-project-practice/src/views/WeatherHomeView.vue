<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import southKoreaSvgRaw from '@/assets/southKoreaHigh.svg?raw'
import { rawCities, parseProvincePaths, toMapPosition, getWeatherAlert, SONG_GUIDE, legendItems } from '../components/task/task4/weatherTaskData.js'

// 지도/노래 추천 패널은 task3에서 만든 걸 그대로 재사용 (같은 UI를 두 번 만들 필요 없음)
import WeatherMapPanel from '../components/task/task3/WeatherMapPanel.vue'
import SongRecommendationPanel from '../components/task/task3/SongRecommendationPanel.vue'
// 이번 과제 전용 exercise 부품들
import BaseDashboardCard from '../components/task/task4/exercise/BaseDashboardCard.vue'
import SearchBar from '../components/task/task4/exercise/SearchBar.vue'
import WeatherCard from '../components/task/task4/exercise/WeatherCard.vue'

// "/" 경로에 매칭되는 홈 화면. 기존 WeatherComposition.vue(WeatherParent 역할)를 그대로 가져와
// Router 과제에 맞게 다듬은 버전 - 상태는 이 View가 소유하고, 자식들은 props/emits로만 주고받는다.
const provincePaths = parseProvincePaths(southKoreaSvgRaw)

// computed: rawCities에 지도 좌표(x, y)와 특보 등급(alert)을 계산해서 붙인 읽기 전용 목록
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

// exercise/SearchBar.vue와 v-model로 연결되는 검색어. computed로 필터링된 목록을 만든다.
const searchText = ref('')
const filteredCities = computed(() => {
  const keyword = searchText.value.trim()
  if (!keyword) return cityList.value
  return cityList.value.filter((city) => city.name.includes(keyword))
})

// useRouter(): 템플릿의 <RouterLink>와 달리, 스크립트 코드 안에서 "지금 이동시켜야 할 때" 쓰는 방식.
// WeatherCard의 "상세보기" 버튼을 누르면 view-detail 이벤트가 여기로 올라오고,
// router.push로 /weather/:cityId 라우트로 화면을 이동시킨다 (Programmatic Navigation).
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
      <!-- 기본 v-model: SearchBar가 modelValue/update:modelValue를 쓰므로 v-model만 적어도 양방향 바인딩된다 -->
      <SearchBar v-model="searchText" />

      <!-- v-if / v-else로 검색 결과 유무에 따라 다른 화면을 보여준다 -->
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
