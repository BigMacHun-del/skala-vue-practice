<script setup>
import AlertBadge from '../../task3/AlertBadge.vue'

// 라우팅(router.push)은 부모 View가 담당하고, 이 컴포넌트는 city.id만 emit한다
defineProps({
  city: { type: Object, required: true },
  active: { type: Boolean, default: false },
})

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
