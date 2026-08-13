<script setup>
import GlassCard from './GlassCard.vue'

defineProps({
  food: { type: Array, required: true }, // [{ name, desc }]
})
</script>

<template>
  <GlassCard title="추천 음식" icon="🍽️">
    <ul class="food-list">
      <li v-for="item in food" :key="item.name" class="food-item">
        <p class="food-name">{{ item.name }}</p>
        <p class="food-desc">{{ item.desc }}</p>
      </li>
    </ul>
  </GlassCard>
</template>

<style scoped>
.food-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.food-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.food-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1c1c1e;
  margin-bottom: 4px;
}

.food-desc {
  font-size: 0.82rem;
  color: #48484a;
  line-height: 1.5;
}
</style>
