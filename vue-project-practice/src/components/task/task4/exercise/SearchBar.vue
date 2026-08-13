<script setup>
// modelValue / update:modelValue 기본 규칙을 그대로 써서 v-model="searchText"만으로 바인딩되게 함
defineProps({
  modelValue: { type: String, default: '' },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input
      class="search-input"
      type="text"
      :value="modelValue"
      placeholder="도시 이름으로 검색"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button v-if="modelValue" class="clear-btn" type="button" @click="$emit('update:modelValue', '')">✕</button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  margin-bottom: 14px;
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  opacity: 0.7;
}

.search-input {
  width: 100%;
  padding: 11px 36px;
  border-radius: 999px;
  border: 1px solid var(--gh-border);
  background: var(--gh-bg-inset);
  color: var(--gh-text);
  font-size: 0.88rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: var(--gh-accent);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--gh-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
}
</style>
