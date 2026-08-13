<script setup>
import { computed } from 'vue'

// 별도 차트 라이브러리 없이 순수 SVG로 그린 기온 추이 차트
const props = defineProps({
  cityName: { type: String, required: true },
  daily: { type: Array, required: true }, // [{ date, max, min, precipitationSum }, ...]
})

const CHART = { width: 800, height: 200, padLeft: 30, padRight: 30, padTop: 24, padBottom: 40 }
const plotWidth = CHART.width - CHART.padLeft - CHART.padRight
const plotHeight = CHART.height - CHART.padTop - CHART.padBottom

// x축: 날짜 개수만큼 균등 분할한 좌표
const xForIndex = (index, total) => CHART.padLeft + (total <= 1 ? 0 : (index * plotWidth) / (total - 1))

// y축: 기온 범위(최저~최고에 여유 2도)를 차트 높이에 매핑
const tempRange = computed(() => {
  const temps = props.daily.flatMap((d) => [d.max, d.min])
  const min = Math.min(...temps) - 2
  const max = Math.max(...temps) + 2
  return { min, max }
})

const yForTemp = (temp) => {
  const { min, max } = tempRange.value
  const ratio = (temp - min) / (max - min || 1)
  return CHART.padTop + (1 - ratio) * plotHeight
}

const maxLinePoints = computed(() => props.daily.map((d, i) => `${xForIndex(i, props.daily.length)},${yForTemp(d.max)}`).join(' '))
const minLinePoints = computed(() => props.daily.map((d, i) => `${xForIndex(i, props.daily.length)},${yForTemp(d.min)}`).join(' '))

// 강수량은 차트 하단의 얕은 막대로 표시
const maxPrecip = computed(() => Math.max(...props.daily.map((d) => d.precipitationSum ?? 0), 1))
const precipBarHeight = 34
const precipBarWidth = 28

const dayLabel = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { weekday: 'short' })
}
</script>

<template>
  <div class="trend-chart">
    <div class="trend-header">
      <h3 class="trend-title">{{ cityName }} 7일 기온 추이</h3>
      <div class="trend-legend">
        <span class="legend-dot max"></span>최고
        <span class="legend-dot min"></span>최저
        <span class="legend-dot precip"></span>강수량
      </div>
    </div>

    <svg class="trend-svg" :viewBox="`0 0 ${CHART.width} ${CHART.height}`">
      <!-- 강수량 막대 (배경) -->
      <rect
        v-for="(d, i) in daily"
        :key="'bar-' + d.date"
        :x="xForIndex(i, daily.length) - precipBarWidth / 2"
        :y="CHART.padTop + plotHeight - ((d.precipitationSum ?? 0) / maxPrecip) * precipBarHeight"
        :width="precipBarWidth"
        :height="((d.precipitationSum ?? 0) / maxPrecip) * precipBarHeight"
        class="precip-bar"
      />

      <!-- 최고/최저 기온 라인 -->
      <polyline :points="maxLinePoints" class="line max" />
      <polyline :points="minLinePoints" class="line min" />

      <!-- 데이터 포인트 -->
      <circle v-for="(d, i) in daily" :key="'max-' + d.date" :cx="xForIndex(i, daily.length)" :cy="yForTemp(d.max)" r="5" class="dot max" />
      <circle v-for="(d, i) in daily" :key="'min-' + d.date" :cx="xForIndex(i, daily.length)" :cy="yForTemp(d.min)" r="5" class="dot min" />

      <!-- 요일 라벨 -->
      <text v-for="(d, i) in daily" :key="'label-' + d.date" :x="xForIndex(i, daily.length)" :y="CHART.height - 14" class="day-label" text-anchor="middle">
        {{ dayLabel(d.date) }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.trend-chart {
  padding: 4px;
}

.trend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.trend-title {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text);
}

.trend-legend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.74rem;
  color: var(--text-secondary);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 8px;
}
.legend-dot:first-child {
  margin-left: 0;
}
.legend-dot.max {
  background: var(--accent-1);
}
.legend-dot.min {
  background: var(--accent-2);
}
.legend-dot.precip {
  background: #4facfe;
}

.trend-svg {
  width: 100%;
  /* viewBox(800x200)와 같은 비율로 맞춰야 preserveAspectRatio가 왜곡 없이 균일하게 스케일된다 */
  aspect-ratio: 800 / 200;
  display: block;
}

.line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.line.max {
  stroke: var(--accent-1);
}

.line.min {
  stroke: var(--accent-2);
}

.dot.max {
  fill: var(--accent-1);
}

.dot.min {
  fill: var(--accent-2);
}

.precip-bar {
  fill: #4facfe;
  opacity: 0.22;
  rx: 5;
}

.day-label {
  font-size: 15px;
  fill: var(--text-secondary);
}
</style>
