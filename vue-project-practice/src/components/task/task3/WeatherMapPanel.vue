<script setup>
// 실제 한반도 SVG 위에 도시 핀을 찍어 보여주는 지도 패널.
// 상태(cityList, selectedCityId)는 부모가 갖고 있고, 이 컴포넌트는 props로 받아서 그리기만 한다.
// 사용자가 핀을 클릭하면 직접 상태를 바꾸지 않고 select-city 이벤트로 부모에게 알린다.
defineProps({
  cityList: { type: Array, required: true },
  selectedCityId: { type: String, default: null },
  provincePaths: { type: Array, required: true },
  legendItems: { type: Array, required: true },
})

defineEmits(['select-city'])
</script>

<template>
  <div class="map-frame">
    <!-- southKoreaHigh.svg에서 파싱한 실제 시/도 경계를 그대로 렌더링 -->
    <svg class="korea-svg" viewBox="79.59 -2 800.82 964" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#14301f" />
          <stop offset="35%" stop-color="#244a30" />
          <stop offset="60%" stop-color="#2f5c38" />
          <stop offset="100%" stop-color="#1c3722" />
        </linearGradient>
      </defs>
      <path v-for="province in provincePaths" :key="province.id" :d="province.d" class="province-path" />
    </svg>

    <!-- v-for + :key로 도시별 핀을 반복 렌더링, :style로 지도 위 좌표를 동적으로 지정 -->
    <button
      v-for="city in cityList"
      :key="city.id"
      class="map-pin"
      :class="{ selected: city.id === selectedCityId }"
      :style="{ left: city.x + '%', top: city.y + '%' }"
      @click="$emit('select-city', city.id)"
    >
      <span class="pin-dot" :class="city.alert.class"></span>
      <span class="pin-label">{{ city.name }}</span>
    </button>
  </div>

  <ul class="legend">
    <li v-for="item in legendItems" :key="item.class" class="legend-item">
      <span class="legend-dot" :class="item.class"></span>{{ item.label }}
    </li>
  </ul>
</template>

<style scoped>
/* 지도: 야간 위성사진 느낌 (southKoreaHigh.svg의 실제 viewBox 비율과 동일하게 맞춤) */
.map-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 800.82 / 964;
  background: radial-gradient(circle at 28% 18%, #0c1f18 0%, #060d10 45%, #010409 100%);
  border: 1px solid var(--gh-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.55);
}

/* 위성사진 특유의 옅은 스캔라인 질감 */
.map-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.02) 0px, rgba(255, 255, 255, 0.02) 1px, transparent 1px, transparent 3px);
  pointer-events: none;
}

.korea-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* southKoreaHigh.svg에서 파싱한 실제 시/도 경계 도형 (위성사진 질감의 그라디언트 채움) */
.province-path {
  fill: url(#landGradient);
  stroke: rgba(88, 166, 255, 0.2);
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
  border: 1.5px solid rgba(1, 4, 9, 0.7);
  transition: transform 0.15s ease;
}

.map-pin.selected .pin-dot {
  transform: scale(1.4);
}

.pin-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--gh-text);
  background: rgba(1, 4, 9, 0.85);
  border: 1px solid var(--gh-border-muted);
  padding: 1px 5px;
  border-radius: 6px;
  white-space: nowrap;
}

/* 등급별 색상 (범례 점에 사용하는 기본값) - 야간 위성사진의 도시 불빛처럼 은은하게 발광 */
.legend-dot.heat-warning {
  background: #f85149;
}
.legend-dot.heat-caution {
  background: #db6d28;
}
.legend-dot.hot {
  background: #d29922;
}
.legend-dot.cool {
  background: #3fb950;
}
.legend-dot.cold {
  background: #58a6ff;
}
.legend-dot.cold-caution {
  background: #388bfd;
}
.legend-dot.cold-warning {
  background: #a371f7;
}

/* 등급별 색상 (지도 핀에 사용) - 은은한 발광으로 야간 위성사진의 도시 불빛 표현 */
.pin-dot.heat-warning {
  background: #f85149;
  box-shadow: 0 0 8px 1px rgba(248, 81, 73, 0.8);
}
.pin-dot.heat-caution {
  background: #db6d28;
  box-shadow: 0 0 8px 1px rgba(219, 109, 40, 0.8);
}
.pin-dot.hot {
  background: #d29922;
  box-shadow: 0 0 8px 1px rgba(210, 153, 34, 0.8);
}
.pin-dot.cool {
  background: #3fb950;
  box-shadow: 0 0 8px 1px rgba(63, 185, 80, 0.8);
}
.pin-dot.cold {
  background: #58a6ff;
  box-shadow: 0 0 8px 1px rgba(88, 166, 255, 0.8);
}
.pin-dot.cold-caution {
  background: #388bfd;
  box-shadow: 0 0 8px 1px rgba(56, 139, 253, 0.8);
}
.pin-dot.cold-warning {
  background: #a371f7;
  box-shadow: 0 0 8px 1px rgba(163, 113, 247, 0.8);
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
  color: var(--gh-text-secondary);
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}
</style>
