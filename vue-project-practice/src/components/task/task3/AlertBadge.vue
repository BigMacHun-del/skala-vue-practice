<script setup>
// 폭염/한파 등급 배지. 여러 컴포넌트(도시 카드, 노래 추천 패널)에서 공통으로 재사용한다.
defineProps({
  alertClass: { type: String, required: true }, // getWeatherAlert()가 반환하는 class (heat-warning 등)
  label: { type: String, required: true },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <span class="badge" :class="[alertClass, { small }]">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.badge.small {
  padding: 2px 8px;
  font-size: 0.68rem;
}

.badge.heat-warning {
  color: #f85149;
  background: rgba(248, 81, 73, 0.15);
  border-color: rgba(248, 81, 73, 0.4);
}
.badge.heat-caution {
  color: #db6d28;
  background: rgba(219, 109, 40, 0.15);
  border-color: rgba(219, 109, 40, 0.4);
}
.badge.hot {
  color: #d29922;
  background: rgba(210, 153, 34, 0.15);
  border-color: rgba(210, 153, 34, 0.4);
}
.badge.cool {
  color: #3fb950;
  background: rgba(63, 185, 80, 0.15);
  border-color: rgba(63, 185, 80, 0.4);
}
.badge.cold {
  color: #58a6ff;
  background: rgba(88, 166, 255, 0.15);
  border-color: rgba(88, 166, 255, 0.4);
}
.badge.cold-caution {
  color: #388bfd;
  background: rgba(56, 139, 253, 0.15);
  border-color: rgba(56, 139, 253, 0.4);
}
.badge.cold-warning {
  color: #a371f7;
  background: rgba(163, 113, 247, 0.15);
  border-color: rgba(163, 113, 247, 0.4);
}
</style>
