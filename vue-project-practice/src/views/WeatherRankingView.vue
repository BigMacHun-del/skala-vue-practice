<script setup>
import { computed } from 'vue'
import { rawCities, getWeatherAlert } from '../components/task/task4/weatherTaskData.js'
import AlertBadge from '../components/task/task3/AlertBadge.vue'

// 요구사항 6번: "정의된 view 이외에 본인의 추가 view를 작성하고 routing 한다" → /ranking 경로에 매칭되는 View
// computed: 기온 내림차순으로 정렬한 목록. rawCities가 바뀌지 않는 mock이라 실제로 재계산될 일은 없지만,
// v-for에 매번 새 배열을 만들지 않도록(정렬은 원본을 변형하면 안 됨) 여기서 [...배열].sort()로 복사 후 정렬한다.
const rankedCities = computed(() =>
  [...rawCities]
    .map((city) => ({ ...city, alert: getWeatherAlert(city.temp) }))
    .sort((a, b) => b.temp - a.temp),
)
</script>

<template>
  <div class="ranking-view">
    <h1>기온 랭킹</h1>
    <p class="desc">가장 더운 도시부터 가장 추운 도시 순으로 정렬했어요.</p>

    <ol class="ranking-list">
      <li v-for="(city, index) in rankedCities" :key="city.id" class="ranking-item">
        <span class="rank">{{ index + 1 }}</span>
        <RouterLink :to="`/weather/${city.id}`" class="ranking-name">{{ city.name }}</RouterLink>
        <AlertBadge :alert-class="city.alert.class" :label="city.alert.label" small />
        <span class="ranking-temp">{{ city.temp }}°C</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.ranking-view {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ranking-view h1 {
  font-size: 1.2rem;
  color: var(--gh-text);
}

.desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
  margin-bottom: 12px;
}

.ranking-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--gh-bg-elevated);
  border: 1px solid var(--gh-border);
}

.rank {
  width: 20px;
  font-weight: 800;
  color: var(--gh-text-secondary);
  font-size: 0.85rem;
}

.ranking-name {
  flex: 1;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--gh-text);
  text-decoration: none;
}

.ranking-name:hover {
  color: var(--gh-accent);
}

.ranking-temp {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gh-text-secondary);
}
</style>
