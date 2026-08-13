<script setup>
import GlassCard from './GlassCard.vue'

defineProps({
  fishing: { type: Object, required: true }, // { spot, tip, fishTypes: [] }
})
</script>

<template>
  <GlassCard title="낚시 팁 & 생선 정보" icon="🎣">
    <p class="fishing-spot">📍 {{ fishing.spot }}</p>
    <p class="fishing-tip">{{ fishing.tip }}</p>

    <div class="fish-chip-row">
      <span v-for="fish in fishing.fishTypes" :key="fish" class="fish-chip">🐟 {{ fish }}</span>
    </div>
  </GlassCard>
</template>

<style scoped>
.fishing-spot {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1c1c1e;
  margin-bottom: 6px;
}

.fishing-tip {
  font-size: 0.84rem;
  color: #48484a;
  line-height: 1.6;
  margin-bottom: 14px;
}

.fish-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fish-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.6);
  font-size: 0.78rem;
  font-weight: 700;
  color: #1c1c1e;
}
</style>
