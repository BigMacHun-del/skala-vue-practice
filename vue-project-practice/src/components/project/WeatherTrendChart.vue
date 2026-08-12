<script setup>
import { computed } from 'vue'

// Chart.js 등 새 라이브러리를 추가하지 않고, 순수 SVG로 직접 그린 7일 기온 추이 차트
// props: 그릴 데이터(daily)를 받아서 좌표만 계산 (차트 자체엔 상태가 없음)
const props = defineProps({
  cityName: { type: String, required: true },
  daily: { type: Array, required: true }, // [{ date, max, min, precipitationSum }, ...]
})

const CHART = { width: 320, height: 170, padLeft: 10, padRight: 10, padTop: 18, padBottom: 30 }
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

// 강수량 막대: 하루 강수량을 차트 하단의 얕은 막대로 표시 (배경 참고용)
const maxPrecip = computed(() => Math.max(...props.daily.map((d) => d.precipitationSum ?? 0), 1))
const precipBarHeight = 22

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

    <svg class="trend-svg" :viewBox="`0 0 ${CHART.width} ${CHART.height}`" preserveAspectRatio="none">
      <!-- 강수량 막대 (배경) -->
      <rect
        v-for="(d, i) in daily"
        :key="'bar-' + d.date"
        :x="xForIndex(i, daily.length) - 8"
        :y="CHART.padTop + plotHeight - ((d.precipitationSum ?? 0) / maxPrecip) * precipBarHeight"
        width="16"
        :height="((d.precipitationSum ?? 0) / maxPrecip) * precipBarHeight"
        class="precip-bar"
      />

      <!-- 최고/최저 기온 라인 -->
      <polyline :points="maxLinePoints" class="line max" />
      <polyline :points="minLinePoints" class="line min" />

      <!-- 데이터 포인트 -->
      <circle v-for="(d, i) in daily" :key="'max-' + d.date" :cx="xForIndex(i, daily.length)" :cy="yForTemp(d.max)" r="2.6" class="dot max" />
      <circle v-for="(d, i) in daily" :key="'min-' + d.date" :cx="xForIndex(i, daily.length)" :cy="yForTemp(d.min)" r="2.6" class="dot min" />

      <!-- 요일 라벨 -->
      <text v-for="(d, i) in daily" :key="'label-' + d.date" :x="xForIndex(i, daily.length)" :y="CHART.height - 8" class="day-label" text-anchor="middle">
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
  height: 170px;
  overflow: visible;
}

.line {
  fill: none;
  stroke-width: 2;
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
  opacity: 0.18;
  rx: 3;
}

.day-label {
  font-size: 8px;
  fill: var(--text-secondary);
}
</style>
