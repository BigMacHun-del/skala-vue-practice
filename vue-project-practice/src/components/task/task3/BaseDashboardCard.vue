<script setup>
// 지도/노래 추천/도시 목록 섹션이 공통으로 쓰는 카드 껍데기.
// 실제 내용은 부모(WeatherComposition)가 <slot>으로 자유롭게 주입한다.
defineProps({
  sectionId: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <section :id="sectionId" class="dashboard-card">
    <h2 class="card-title">{{ title }}</h2>
    <p v-if="description" class="card-desc">{{ description }}</p>
    <slot />
  </section>
</template>

<style scoped>
.dashboard-card {
  background: var(--gh-bg-elevated);
  border: 1px solid var(--gh-border);
  border-radius: 12px;
  padding: 20px;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--gh-text);
  margin-bottom: 4px;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
  margin-bottom: 16px;
}
</style>
