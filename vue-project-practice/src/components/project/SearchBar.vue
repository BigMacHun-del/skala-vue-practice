<script setup>
// props: 검색어(query)와 그 검색어로 걸러진 도시 목록(suggestions)을 부모(WeatherMusicApp)에게서 받는다.
// query를 여기서 직접 바꾸지 않고 update:query를 emit하는 이유 = Vue의 v-model 규칙
// (practice/ModelBasic.vue에서 :value + @input으로 풀어 썼던 것을, defineProps/defineEmits로 컴포넌트화한 버전)
defineProps({
  query: { type: String, required: true },
  suggestions: { type: Array, required: true },
})

// emits:
//  - update:query → 부모가 v-model:query="searchQuery"로 받을 수 있게 하는 이벤트 이름 규칙
//  - select-city  → 추천 목록 클릭 시 "이 도시 선택했어요"를 부모에게 알림
defineEmits(['update:query', 'select-city'])
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <!-- practice/ModelBasic.vue와 동일한 :value + @input 패턴. 다만 로컬 변수 대신 emit으로 부모 상태를 바꾼다 -->
    <input
      class="search-input"
      type="text"
      :value="query"
      placeholder="도시 이름으로 검색 (예: 대전, 여수, 속초...)"
      @input="$emit('update:query', $event.target.value)"
    />
    <button v-if="query" class="clear-btn" type="button" @click="$emit('update:query', '')">✕</button>

    <!-- v-if / v-else로 검색 상태에 따라 다른 화면을 보여줌 (practice/VueIf.vue) -->
    <ul v-if="query && suggestions.length > 0" class="suggestion-list">
      <li v-for="city in suggestions" :key="city.id" class="suggestion-item" @click="$emit('select-city', city.id)">
        <span class="suggestion-icon">{{ city.weatherIcon }}</span>
        <span class="suggestion-name">{{ city.name }}</span>
        <span class="suggestion-temp">{{ Math.round(city.temp) }}°</span>
      </li>
    </ul>
    <p v-else-if="query" class="no-result">"{{ query }}"와 일치하는 도시가 없어요.</p>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  max-width: 420px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.7;
}

.search-input {
  width: 100%;
  padding: 13px 40px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: var(--accent-2);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px;
}

.suggestion-list {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  z-index: 5;
  list-style: none;
  margin: 0;
  padding: 6px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  box-shadow: 0 16px 32px -16px rgba(0, 0, 0, 0.4);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
}

.suggestion-item:hover {
  background: var(--bg-inset);
}

.suggestion-icon {
  font-size: 1rem;
}

.suggestion-name {
  flex: 1;
  font-weight: 700;
  font-size: 0.88rem;
  color: var(--text);
}

.suggestion-temp {
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.no-result {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: center;
}
</style>
