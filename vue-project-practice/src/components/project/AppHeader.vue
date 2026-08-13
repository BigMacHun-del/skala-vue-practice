<script setup>
import UnitToggler from './UnitToggler.vue'

defineProps({
  isDark: { type: Boolean, required: true },
  favoriteCount: { type: Number, default: 0 },
})

defineEmits(['toggle-theme', 'navigate'])

const navItems = [
  { id: 'map', label: '지도' },
  { id: 'trend', label: '트렌드' },
  { id: 'song', label: '노래' },
  { id: 'favorites', label: '즐겨찾기' },
]
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="brand-mark">♪ ⛅</span>
      <span class="brand-name">WeatherTune</span>
    </div>

    <nav class="nav">
      <button v-for="item in navItems" :key="item.id" class="nav-link" @click="$emit('navigate', item.id)">
        {{ item.label }}
        <span v-if="item.id === 'favorites' && favoriteCount > 0" class="nav-badge">{{ favoriteCount }}</span>
      </button>
    </nav>

    <!-- 스토어에 직접 붙어있어서 부모가 props/emits로 중계할 필요 없음 -->
    <UnitToggler />

    <button class="theme-toggle" type="button" @click="$emit('toggle-theme')" :aria-pressed="isDark">
      <span class="theme-toggle-icon">{{ isDark ? '🌙' : '☀️' }}</span>
      <span class="theme-toggle-track" :class="{ on: isDark }"><span class="theme-toggle-thumb"></span></span>
    </button>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 28px;
  background: color-mix(in srgb, var(--bg) 82%, transparent);
  backdrop-filter: blur(16px) saturate(160%);
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  color: var(--text);
  white-space: nowrap;
}

.brand-mark {
  font-size: 1.1rem;
}

.nav {
  display: flex;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  position: relative;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.88rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-link:hover {
  color: var(--text);
  background: var(--bg-elevated);
}

.nav-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  margin-left: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: #fff;
  font-size: 0.62rem;
  font-weight: 800;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  flex-shrink: 0;
}

.theme-toggle-icon {
  font-size: 0.85rem;
}

.theme-toggle-track {
  position: relative;
  width: 30px;
  height: 16px;
  border-radius: 999px;
  background: var(--border);
  transition: background 0.2s ease;
}

.theme-toggle-track.on {
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
}

.theme-toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.theme-toggle-track.on .theme-toggle-thumb {
  transform: translateX(14px);
}

@media (max-width: 720px) {
  .nav {
    display: none;
  }
}
</style>
