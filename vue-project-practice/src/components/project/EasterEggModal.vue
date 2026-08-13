<script setup>
import { onMounted, onUnmounted } from 'vue'
import geojeYahoSound from '@/assets/sounds/geoje-yaho.mp3'

// 거제를 5번 연속 클릭하면 나타나는 이스터에그 모달
defineProps({
  song: { type: Object, required: true },
})

defineEmits(['close'])

// 색종이 조각 24개를 뿌리기 위한 더미 배열
const CONFETTI_PIECES = Array.from({ length: 24 }, (_, i) => i)
const CONFETTI_COLORS = ['#ff7e5f', '#7c5cff', '#4facfe', '#ffc65a', '#4ade80', '#f5576c']

const openPreview = (track) => {
  const query = encodeURIComponent(`${track.title} ${track.artist}`)
  window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank', 'noopener')
}

// v-if로 매번 새로 생성되므로 뜰 때마다 onMounted가 실행되어 1회 재생이 보장됨
let audio = null
onMounted(() => {
  audio = new Audio(geojeYahoSound)
  audio.play().catch(() => {})
})

onUnmounted(() => {
  audio?.pause()
})
</script>

<template>
  <div class="egg-overlay" @click.self="$emit('close')">
    <div class="confetti-layer">
      <span
        v-for="piece in CONFETTI_PIECES"
        :key="piece"
        class="confetti-piece"
        :style="{
          left: (piece * 4.2) % 100 + '%',
          animationDelay: (piece % 8) * 0.15 + 's',
          background: CONFETTI_COLORS[piece % CONFETTI_COLORS.length],
        }"
      ></span>
    </div>

    <div class="egg-card">
      <button class="egg-close" type="button" @click="$emit('close')">✕</button>

      <p class="egg-eyebrow">🥚 이스터에그 발견!</p>
      <h3 class="egg-title">거제 야호 🏝️</h3>
      <p class="egg-desc">
        거제를 5번 연속 클릭해서 찾아낸 히든 플레이리스트예요.<br />
        거제는 제주도 다음으로  <strong>두 번째로 큰섬</strong>이예요.
      </p>

      <ul class="egg-track-list">
        <li v-for="track in song.tracks" :key="track.title" class="egg-track">
          <div class="egg-track-info">
            <span class="egg-track-title">{{ track.title }}</span>
            <span class="egg-track-artist">{{ track.artist }}</span>
          </div>
          <button class="egg-preview-btn" type="button" @click="openPreview(track)">▶ 미리듣기</button>
        </li>
      </ul>

      <!-- RouterLink: 누르면 /geoje로 이동 - WeatherMusicApp이 통째로 언마운트되면서
           이 모달도 자연히 같이 사라지므로 close를 따로 emit할 필요가 없다. -->
      <RouterLink to="/geoje" class="egg-tour-btn">🏝️ 거제 관광지 추천 보기</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.egg-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 6, 10, 0.72);
  backdrop-filter: blur(6px);
  overflow: hidden;
}

.confetti-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -20px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  opacity: 0.9;
  animation: confetti-fall 2.6s linear infinite;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotate(400deg);
    opacity: 0.4;
  }
}

.egg-card {
  position: relative;
  z-index: 1;
  width: min(92vw, 460px);
  padding: 32px;
  border-radius: 24px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.5);
  text-align: center;
}

.egg-close {
  position: absolute;
  top: 16px;
  right: 16px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
}

.egg-eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent-2);
  margin-bottom: 8px;
}

.egg-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 14px;
}

.egg-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 22px;
}

.egg-track-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.egg-track {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--bg-inset);
  border: 1px solid var(--border);
  text-align: left;
}

.egg-track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.egg-track-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text);
}

.egg-track-artist {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.egg-preview-btn {
  flex-shrink: 0;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
}

.egg-preview-btn:hover {
  border-color: var(--accent-2);
  color: var(--accent-2);
}

.egg-tour-btn {
  display: block;
  margin-top: 20px;
  padding: 12px 20px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: #fff;
  font-weight: 800;
  font-size: 0.9rem;
  text-decoration: none;
  text-align: center;
}
</style>
