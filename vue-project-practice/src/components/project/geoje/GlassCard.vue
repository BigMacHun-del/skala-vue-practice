<script setup>
// 반투명 글래스모피즘 카드 - 거제 관광 페이지 전용 공용 셸.
// 제목/아이콘만 props로 받고 실제 내용은 <slot>으로 부모가 채운다.
defineProps({
  title: { type: String, default: '' },
  icon: { type: String, default: '' },
})
</script>

<template>
  <section class="glass-card">
    <header v-if="title" class="glass-card-header">
      <span v-if="icon" class="glass-card-icon">{{ icon }}</span>
      <h2 class="glass-card-title">{{ title }}</h2>
    </header>
    <div class="glass-card-body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 28px;
  padding: 22px 24px;
  box-shadow: 0 20px 50px -20px rgba(0, 0, 0, 0.4);
}

.glass-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.glass-card-icon {
  font-size: 1.25rem;
}

.glass-card-title {
  font-size: 1.02rem;
  font-weight: 800;
  color: #1c1c1e;
  letter-spacing: -0.01em;
}
</style>
