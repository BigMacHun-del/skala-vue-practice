<script setup>
import GlassCard from './GlassCard.vue'

// props: 이 구역의 낚시 포인트 정보(스팟/팁/어종)를 통째로 객체로 받는다.
// 위 두 카드(명소, 음식)와 달리 배열이 아니라 "낚시 포인트 하나"에 대한 정보라 구조가 다르다.
defineProps({
  fishing: { type: Object, required: true }, // { spot, tip, fishTypes: [] }
})
</script>

<template>
  <GlassCard title="낚시 팁 & 생선 정보" icon="🎣">
    <p class="fishing-spot">📍 {{ fishing.spot }}</p>
    <p class="fishing-tip">{{ fishing.tip }}</p>

    <!-- v-for로 잘 잡히는 어종을 칩 형태로 나열 -->
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
