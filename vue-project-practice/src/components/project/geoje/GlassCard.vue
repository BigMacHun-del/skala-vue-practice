<script setup>
// 아이폰(iOS) 느낌의 반투명 "글래스모피즘" 카드 - 거제 관광 페이지 전용 공용 셸.
// props로 제목/아이콘만 받고, 실제 내용은 <slot>으로 부모가 채운다.
// 요구사항 6번(거제 소개 페이지를 슬롯으로 바꿔 끼울 수 있게)을 이 컴포넌트 하나로 충족한다.
// GeojeHomeView.vue든 상세 페이지의 3개 카드든, 이 카드 안에 원하는 내용을 자유롭게 끼워 넣을 수 있다.
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
