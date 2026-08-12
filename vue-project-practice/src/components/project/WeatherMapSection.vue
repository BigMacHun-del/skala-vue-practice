<script setup>
// 지도 위에 실제 한반도 SVG + 도시 핀 + (비/눈이 오는 도시엔) 파티클 애니메이션을 얹는다.
// props: 도시 목록/선택 상태/지도 경로 데이터를 부모에게서 받기만 함 (이 컴포넌트는 상태를 안 가짐)
defineProps({
  cityList: { type: Array, required: true },
  selectedCityId: { type: String, default: null },
  provincePaths: { type: Array, required: true },
  legendItems: { type: Array, required: true },
})

// emits: 핀 클릭 시 selectedCityId를 직접 바꾸지 않고 부모에게 "이 도시 골랐어요" 알림만 보냄
defineEmits(['select-city'])

// 파티클 5개를 v-for로 찍기 위한 더미 배열 (Vue의 <slot>과는 무관, 그냥 반복 횟수용 배열)
const PARTICLE_SLOTS = [0, 1, 2, 3, 4]
</script>

<template>
  <div class="map-frame">
    <!-- southKoreaHigh.svg에서 파싱한 실제 시/도 경계를 그대로 렌더링 -->
    <svg class="korea-svg" viewBox="79.59 -2 800.82 964" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="var(--map-land-1)" />
          <stop offset="60%" stop-color="var(--map-land-2)" />
          <stop offset="100%" stop-color="var(--map-land-3)" />
        </linearGradient>
      </defs>
      <path v-for="province in provincePaths" :key="province.id" :d="province.d" class="province-path" />
    </svg>

    <button
      v-for="city in cityList"
      :key="city.id"
      class="map-pin"
      :class="{ selected: city.id === selectedCityId }"
      :style="{ left: city.x + '%', top: city.y + '%' }"
      @click="$emit('select-city', city.id)"
    >
      <!-- 비/눈이 오는 도시는 핀 위에 작은 파티클 효과를 얹는다 -->
      <span v-if="city.isRain || city.isSnow" class="particles" :class="city.isSnow ? 'snow' : 'rain'">
        <span v-for="slot in PARTICLE_SLOTS" :key="slot" class="particle" :style="{ left: slot * 5 + 2 + 'px', animationDelay: slot * 0.18 + 's' }"></span>
      </span>
      <span class="pin-dot" :class="city.alert.class"></span>
      <span class="pin-label">{{ city.name }}<template v-if="city.isRain || city.isSnow"> {{ city.isSnow ? '❄️' : '🌧️' }}</template></span>
    </button>
  </div>

  <ul class="legend">
    <li v-for="item in legendItems" :key="item.class" class="legend-item">
      <span class="legend-dot" :class="item.class"></span>{{ item.label }}
    </li>
    <li class="legend-item">
      <span class="legend-dot rain-caution"></span>호우주의보
    </li>
    <li class="legend-item">
      <span class="legend-dot rain-warning"></span>호우경보
    </li>
  </ul>
</template>

<style scoped>
.map-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 800.82 / 964;
  background: var(--map-bg);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.25);
}

.korea-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.province-path {
  fill: url(#landGradient);
  stroke: var(--map-border);
  stroke-width: 0.6;
}

.map-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.pin-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}

.map-pin.selected .pin-dot {
  transform: scale(1.4);
}

.pin-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--text);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  padding: 1px 5px;
  border-radius: 6px;
  white-space: nowrap;
}

/* 강수 파티클: 핀 바로 위 작은 영역에서 아래로 떨어지는 애니메이션 */
.particles {
  position: relative;
  width: 24px;
  height: 14px;
  display: block;
}

.particle {
  position: absolute;
  top: -6px;
  width: 2px;
  height: 6px;
  border-radius: 1px;
  background: #74c0fc;
  animation: rain-fall 0.9s linear infinite;
}

.particles.snow .particle {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #ffffff;
  animation: snow-fall 1.6s ease-in infinite;
}

@keyframes rain-fall {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(16px);
    opacity: 0;
  }
}

@keyframes snow-fall {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(3px, 18px);
    opacity: 0;
  }
}

/* 등급별 색상 (범례 점) */
.legend-dot.heat-warning {
  background: #f5576c;
}
.legend-dot.heat-caution {
  background: #ff9a5a;
}
.legend-dot.hot {
  background: #ffc65a;
}
.legend-dot.cool {
  background: #4ade80;
}
.legend-dot.cold {
  background: #4facfe;
}
.legend-dot.cold-caution {
  background: #3b82f6;
}
.legend-dot.cold-warning {
  background: #7c5cff;
}
.legend-dot.rain-caution {
  background: #38bdf8;
}
.legend-dot.rain-warning {
  background: #0369a1;
}

/* 등급별 색상 (지도 핀) - 은은한 발광 */
.pin-dot.heat-warning {
  background: #f5576c;
  box-shadow: 0 0 8px 1px rgba(245, 87, 108, 0.7);
}
.pin-dot.heat-caution {
  background: #ff9a5a;
  box-shadow: 0 0 8px 1px rgba(255, 154, 90, 0.7);
}
.pin-dot.hot {
  background: #ffc65a;
  box-shadow: 0 0 8px 1px rgba(255, 198, 90, 0.7);
}
.pin-dot.cool {
  background: #4ade80;
  box-shadow: 0 0 8px 1px rgba(74, 222, 128, 0.7);
}
.pin-dot.cold {
  background: #4facfe;
  box-shadow: 0 0 8px 1px rgba(79, 172, 254, 0.7);
}
.pin-dot.cold-caution {
  background: #3b82f6;
  box-shadow: 0 0 8px 1px rgba(59, 130, 246, 0.7);
}
.pin-dot.cold-warning {
  background: #7c5cff;
  box-shadow: 0 0 8px 1px rgba(124, 92, 255, 0.7);
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  margin-top: 16px;
  padding: 0;
  list-style: none;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
</style>
