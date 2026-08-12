<script setup>
// props/emits: Vue의 "내장(built-in) v-model" 규칙을 그대로 따르는 검색창.
// project/SearchBar.vue는 v-model:query처럼 커스텀 프로퍼티 이름을 썼지만,
// 여기서는 기본값인 modelValue / update:modelValue를 그대로 써서
// 부모가 그냥 v-model="searchText"라고만 적어도 양방향 바인딩이 되게 한다.
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
