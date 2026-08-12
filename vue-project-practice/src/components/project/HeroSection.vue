<script setup>
// props: 통계 수치와 위치 찾기 로딩 상태를 부모에서 받아서 그리기만 함
defineProps({
  cityCount: { type: Number, required: true },
  warningCount: { type: Number, required: true },
  rainyCount: { type: Number, required: true },
  isLoading: { type: Boolean, default: false },
  locating: { type: Boolean, default: false },
  locateStatus: { type: String, default: '' },
})

// emits: "내 위치 찾기" 버튼을 눌러도 Geolocation 호출은 부모가 함 (여긴 이벤트만 발생)
defineEmits(['locate-me'])
</script>

<template>
  <section class="hero">
    <p class="eyebrow">날씨 × 음악</p>
    <h1 class="headline">
      오늘 하늘에 어울리는<br />
      <span class="gradient-text">노래를 찾아드려요</span>
    </h1>
    <p class="subline">전국 {{ cityCount }}개 도시의 실시간 기온·강수량을 확인하고, 그 순간의 분위기에 맞는 플레이리스트를 받아보세요.</p>

    <div class="hero-actions">
      <button class="locate-btn" type="button" :disabled="locating" @click="$emit('locate-me')">
        <span v-if="locating" class="spinner"></span>
        <span v-else>📍</span>
        {{ locating ? '위치 확인 중...' : '내 위치와 가장 가까운 도시 찾기' }}
      </button>
      <p v-if="locateStatus" class="locate-status">{{ locateStatus }}</p>
    </div>

    <div class="hero-stats">
      <div class="stat">
        <span class="stat-value">{{ isLoading ? '·' : cityCount }}</span>
        <span class="stat-label">추적 도시</span>
      </div>
      <div class="stat">
        <span class="stat-value warn">{{ isLoading ? '·' : warningCount }}</span>
        <span class="stat-label">특보 발효</span>
      </div>
      <div class="stat">
        <span class="stat-value rain">{{ isLoading ? '·' : rainyCount }}</span>
        <span class="stat-label">비/눈 오는 곳</span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding: 72px 28px 48px;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
}

.eyebrow {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent-2);
  margin-bottom: 14px;
}

.headline {
  font-size: clamp(2.1rem, 5vw, 3.4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--text);
  margin-bottom: 18px;
}

.gradient-text {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.subline {
  font-size: 1.02rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.hero-actions {
  margin-bottom: 40px;
}

.locate-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  padding: 13px 24px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: #fff;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--accent-2) 60%, transparent);
  transition: transform 0.15s ease;
}

.locate-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.locate-btn:disabled {
  opacity: 0.7;
  cursor: default;
}

.spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.locate-status {
  margin-top: 12px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text);
}

.stat-value.warn {
  color: #f5576c;
}

.stat-value.rain {
  color: #4facfe;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
</style>
