<script setup>
import GlassCard from './GlassCard.vue'

// props: 이 구역의 명소/놀거리 배열만 받아서 나열한다 (v-for)
defineProps({
  attractions: { type: Array, required: true }, // [{ name, desc }]
})
</script>

<template>
  <GlassCard title="명소 및 놀거리" icon="🏖️">
    <ul class="spot-list">
      <li v-for="item in attractions" :key="item.name" class="spot-item">
        <p class="spot-name">{{ item.name }}</p>
        <p class="spot-desc">{{ item.desc }}</p>
      </li>
    </ul>
  </GlassCard>
</template>

<style scoped>
.spot-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spot-item {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.spot-name {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1c1c1e;
  margin-bottom: 4px;
}

.spot-desc {
  font-size: 0.82rem;
  color: #48484a;
  line-height: 1.5;
}
</style>
