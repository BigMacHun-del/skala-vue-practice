<script setup>
import AlertBadge from './AlertBadge.vue'

// 선택된 도시와 그 등급에 맞는 추천곡 정보를 부모로부터 받아 표시
defineProps({
  city: { type: Object, required: true },
  song: { type: Object, required: true },
})
</script>

<template>
  <div class="selected-city">
    <AlertBadge :alert-class="city.alert.class" :label="city.alert.label" />
    <h3 class="selected-name">{{ city.name }}</h3>
    <p class="selected-desc">{{ city.status }} · 현재 기온 {{ city.temp }}°C</p>
  </div>

  <p class="song-mood">{{ song.emoji }} {{ song.mood }}</p>

  <ul class="song-list">
    <li v-for="track in song.tracks" :key="track.title" class="song-item">
      <span class="song-title">{{ track.title }}</span>
      <span class="song-artist">{{ track.artist }}</span>
    </li>
  </ul>
</template>

<style scoped>
.selected-city {
  margin-bottom: 14px;
}

.selected-name {
  font-size: 1.3rem;
  font-weight: 800;
  margin: 8px 0 2px;
  color: var(--gh-text);
}

.selected-desc {
  font-size: 0.85rem;
  color: var(--gh-text-secondary);
}

.song-mood {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--gh-text-secondary);
  background: var(--gh-bg-inset);
  border: 1px solid var(--gh-border-muted);
  padding: 12px 14px;
  border-radius: 12px;
  margin-bottom: 14px;
}

.song-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.song-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--gh-bg-inset);
  border: 1px solid var(--gh-border-muted);
}

.song-title {
  font-weight: 700;
  color: var(--gh-text);
  font-size: 0.92rem;
}

.song-artist {
  font-size: 0.8rem;
  color: var(--gh-text-secondary);
}
</style>
