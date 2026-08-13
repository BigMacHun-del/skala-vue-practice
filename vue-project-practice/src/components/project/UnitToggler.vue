<script setup>
import { useConfigStore } from '@/stores/configStore'

// props/emits 없이 Pinia 스토어에 바로 접근 - 어디에 둬도 부모 없이 같은 상태를 공유한다
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
