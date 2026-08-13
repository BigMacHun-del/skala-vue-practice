<script setup>
// 유튜브 영상 ID 대신 "제목 + 아티스트" 검색 결과를 새 탭에 열어주는 방식으로 미리듣기 구현
defineProps({
  city: { type: Object, required: true },
  song: { type: Object, required: true },
})

const openPreview = (track) => {
  const query = encodeURIComponent(`${track.title} ${track.artist}`)
  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener')
}
</script>

<template>
  <div class="song-panel">
    <div class="song-panel-art">
      <span class="art-emoji">{{ song.emoji }}</span>
    </div>

    <div class="song-panel-body">
      <p class="song-panel-eyebrow">{{ city.name }}의 지금 분위기</p>
      <h3 class="song-panel-mood">{{ song.mood }}</h3>

      <ul class="track-list">
        <li v-for="track in song.tracks" :key="track.title" class="track-item">
          <div class="track-info">
            <span class="track-title">{{ track.title }}</span>
            <span class="track-artist">{{ track.artist }}</span>
          </div>
          <button class="preview-btn" type="button" @click="openPreview(track)">▶ 미리듣기</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.song-panel {
  display: flex;
  gap: 24px;
  padding: 8px;
}

.song-panel-art {
  flex-shrink: 0;
  width: 120px;
  height: 120px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  box-shadow: 0 12px 30px -12px color-mix(in srgb, var(--accent-2) 55%, transparent);
}

.art-emoji {
  font-size: 3rem;
}

.song-panel-body {
  flex: 1;
  min-width: 0;
}

.song-panel-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-2);
  margin-bottom: 4px;
}

.song-panel-mood {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  margin-bottom: 16px;
}

.track-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.track-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border);
}

.track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.track-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.preview-btn {
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

@media (max-width: 560px) {
  .song-panel {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .track-item {
    text-align: left;
  }
}
</style>
