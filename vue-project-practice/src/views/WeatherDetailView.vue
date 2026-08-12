<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { rawCities, getWeatherAlert } from '../components/task/task4/weatherTaskData.js'
import AlertBadge from '../components/task/task3/AlertBadge.vue'

// /weather/:cityId 동적 경로에 매칭되는 상세 페이지.
// useRoute()로 현재 라우트 정보를 읽으면, route.params.cityId에 URL의 :cityId 부분이 그대로 들어온다.
const route = useRoute()

const city = ref(null)

// 요구사항: "Router 동적 경로 매칭에 해당되는 도시ID(cityId)를 기반으로 Mount 시점에 Mock Data에서 도시 객체 선택"
// → onMounted 안에서 한 번만 mock 배열을 조회해 city를 채운다.
// ⚠️ 주의(실습 포인트): 이 컴포넌트가 재사용되는 상태로 /weather/city_01 → /weather/city_02 처럼
// "상세 페이지끼리" 바로 이동하면 컴포넌트가 다시 mount되지 않아 onMounted가 재실행되지 않는다.
// 그 경우까지 대응하려면 watch(() => route.params.cityId, ...)로 감시해야 하지만,
// 이번 실습은 onMounted 시점의 mock 데이터 조회 자체를 연습하는 게 목적이라 최소 형태로 남겨둔다.
onMounted(() => {
  const found = rawCities.find((c) => c.id === route.params.cityId)
  city.value = found ? { ...found, alert: getWeatherAlert(found.temp) } : null
})
</script>

<template>
  <div class="detail-view">
    <RouterLink to="/" class="back-link">← 홈으로</RouterLink>

    <template v-if="city">
      <div class="detail-head">
        <h1 class="detail-name">{{ city.name }}</h1>
        <AlertBadge :alert-class="city.alert.class" :label="city.alert.label" />
      </div>
      <p class="detail-status">{{ city.status }} · 현재 기온 {{ city.temp }}°C</p>

      <div class="stat-grid">
        <div class="stat-cell">
          <span class="stat-label">습도</span>
          <span class="stat-value">{{ city.humidity }}%</span>
        </div>
        <div class="stat-cell">
          <span class="stat-label">풍속</span>
          <span class="stat-value">{{ city.windSpeed }}m/s</span>
        </div>
        <div class="stat-cell">
          <span class="stat-label">강수량</span>
          <span class="stat-value">{{ city.precipitation }}mm</span>
        </div>
      </div>

      <p class="detail-updated">마지막 업데이트: {{ city.updatedAt }} (mock data)</p>
    </template>

    <!-- v-else: cityId에 해당하는 mock 도시가 없을 때 (예: /weather/city_99) -->
    <p v-else class="detail-empty">"{{ route.params.cityId }}" 도시 정보를 찾을 수 없어요.</p>
  </div>
</template>

<style scoped>
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.back-link {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gh-accent);
  text-decoration: none;
}

.detail-head {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--gh-text);
}

.detail-status {
  font-size: 0.95rem;
  color: var(--gh-text-secondary);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  border-radius: 12px;
  background: var(--gh-bg-elevated);
  border: 1px solid var(--gh-border);
}

.stat-label {
  font-size: 0.78rem;
  color: var(--gh-text-secondary);
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--gh-text);
}

.detail-updated {
  font-size: 0.78rem;
  color: var(--gh-text-muted, var(--gh-text-secondary));
}

.detail-empty {
  font-size: 0.9rem;
  color: var(--gh-text-secondary);
  padding: 20px 0;
}
</style>
