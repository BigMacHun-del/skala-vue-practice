<script setup>
import AlertBadge from '../../task3/AlertBadge.vue'

// props down / emits up: 이 컴포넌트는 city 데이터를 받아 보여주기만 하고,
// 실제 라우팅(router.push)은 부모 View가 담당한다 (컴포넌트는 라우터를 몰라도 됨 → 재사용성 증가).
defineProps({
  city: { type: Object, required: true },
  active: { type: Boolean, default: false },
})

// select: 카드를 눌러 지도/추천곡과 연동되는 "선택" 이벤트
// view-detail: "상세보기" 버튼 전용 이벤트. 예전 방식이라면 여기서 window.alert(city.name)을 띄웠겠지만,
// 그 대신 city.id만 부모에게 emit해서 부모가 router.push(`/weather/${id}`)로 Programmatic Navigation 하게 한다.
defineEmits(['select', 'view-detail'])
</script>

<template>
  <div class="weather-card" :class="{ active }" @click="$emit('select', city.id)">
    <div class="card-head">
      <span class="card-name">{{ city.name }}</span>
      <AlertBadge :alert-class="city.alert.class" :label="city.alert.label" small />
    </div>
    <p class="card-desc">{{ city.status }} · {{ city.temp }}°C</p>
    <button class="detail-btn" type="button" @click.stop="$emit('view-detail', city.id)">상세보기 →</button>
  </div>
</template>

<style scoped>
.weather-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-inset);
  cursor: pointer;
  transition: all 0.15s ease;
}

.weather-card:hover {
  border-color: var(--gh-accent);
}

.weather-card.active {
  border-color: var(--gh-accent);
  background: var(--gh-accent-subtle);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--gh-text);
}

.card-desc {
  font-size: 0.8rem;
  color: var(--gh-text-secondary);
}

.detail-btn {
  align-self: flex-start;
  margin-top: 4px;
  border: none;
  background: transparent;
  color: var(--gh-accent);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}
</style>
