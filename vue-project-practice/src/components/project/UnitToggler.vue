<script setup>
import { useConfigStore } from '@/stores/configStore'

// props/emits 없이 Pinia 스토어에 바로 접근한다 - 이게 props down/events up 대비 스토어를 쓰는 이유.
// AppHeader.vue든 CityDetailView.vue든, 어디에 갖다 둬도 부모를 거치지 않고 같은 상태를 보고 바꿀 수 있다.
const configStore = useConfigStore()
</script>

<template>
  <button class="unit-toggler" type="button" @click="configStore.toggleUnit()" :aria-pressed="configStore.unit === 'fahrenheit'">
    <span class="unit-option" :class="{ active: configStore.unit === 'celsius' }">°C</span>
    <span class="unit-divider">/</span>
    <span class="unit-option" :class="{ active: configStore.unit === 'fahrenheit' }">°F</span>
  </button>
</template>

<style scoped>
.unit-toggler {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.unit-option {
  color: var(--text-secondary);
  transition: color 0.15s ease;
}

.unit-option.active {
  color: var(--text);
}

.unit-divider {
  color: var(--border);
  font-weight: 400;
}
</style>
