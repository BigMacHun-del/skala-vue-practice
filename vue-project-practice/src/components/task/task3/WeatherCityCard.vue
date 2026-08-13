<script setup>
import AlertBadge from './AlertBadge.vue'

// 도시 카드 1개. 클릭 시 select 이벤트로 부모에게 알린다.
defineProps({
  city: { type: Object, required: true },
  active: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<template>
  <button class="city-chip" :class="{ active }" @click="$emit('select', city.id)">
    <span class="city-chip-name">{{ city.name }}</span>
    <span class="city-chip-temp">{{ city.temp }}°C</span>
    <AlertBadge :alert-class="city.alert.class" :label="city.alert.label" small />
  </button>
</template>

<style scoped>
.city-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-inset);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
}

.city-chip:hover {
  border-color: var(--gh-accent);
}

.city-chip.active {
  border-color: var(--gh-accent);
  background: var(--gh-accent-subtle);
}

.city-chip-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--gh-text);
}

.city-chip-temp {
  font-size: 0.8rem;
  color: var(--gh-text-secondary);
}
</style>
