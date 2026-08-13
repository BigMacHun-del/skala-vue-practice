<script setup>
import { ref, onMounted, watch } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

// 이 섹션에는 PrimeVue Button/Toast를 적용했다 (저장 완료 시 Toast 알림)
const toast = useToast()

// 선택된 도시 + 추천곡을 canvas에 그려서 이미지로 내려받는 공유 카드 기능
const props = defineProps({
  city: { type: Object, required: true },
  song: { type: Object, required: true },
  accentFrom: { type: String, default: '#ff7e5f' },
  accentTo: { type: String, default: '#7c5cff' },
})

const configStore = useConfigStore()
const formatTemp = (temp) => {
  const value = configStore.unit === 'fahrenheit' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)
  return `${value}${configStore.unitSymbol}`
}

const canvasRef = ref(null)
const CARD_WIDTH = 640
const CARD_HEIGHT = 360

const drawCard = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  // 배경 그라디언트
  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
  gradient.addColorStop(0, props.accentFrom)
  gradient.addColorStop(1, props.accentTo)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

  // 은은한 원형 장식
  ctx.globalAlpha = 0.15
  ctx.beginPath()
  ctx.arc(CARD_WIDTH - 60, 60, 140, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.globalAlpha = 1

  // 상단 브랜드 텍스트
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = '600 18px -apple-system, sans-serif'
  ctx.fillText('WeatherTune', 36, 46)

  // 날씨 이모지
  ctx.font = '64px -apple-system, sans-serif'
  ctx.fillText(props.city.weatherIcon ?? '☀️', 36, 130)

  // 도시명 + 기온
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 44px -apple-system, sans-serif'
  ctx.fillText(`${props.city.name} ${formatTemp(props.city.temp)}`, 130, 118)

  // 무드 문구
  ctx.font = '600 20px -apple-system, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  wrapText(ctx, props.song.mood, 36, 175, CARD_WIDTH - 72, 28)

  // 추천곡
  const track = props.song.tracks[0]
  if (track) {
    ctx.font = '800 24px -apple-system, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`🎵 ${track.title}`, 36, 260)
    ctx.font = '500 16px -apple-system, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText(track.artist, 36, 286)
  }

  ctx.font = '400 13px -apple-system, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  ctx.fillText('오늘 날씨에 어울리는 노래 · weathertune', 36, CARD_HEIGHT - 24)
}

// canvas 기본 API는 자동 줄바꿈을 지원하지 않아서 직접 구현
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let currentY = y
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = word
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, currentY)
}

const downloadCard = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const link = document.createElement('a')
  link.download = `weathertune-${props.city.name}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()

  toast.add({
    severity: 'success',
    summary: '저장 완료',
    detail: `${props.city.name} 공유 카드를 이미지로 저장했어요.`,
    life: 2500,
  })
}

onMounted(drawCard)
// city/song/accent/단위 중 하나라도 바뀌면 canvas를 다시 그린다
watch(() => [props.city, props.song, props.accentFrom, props.accentTo, configStore.unit], drawCard, { deep: true })
</script>

<template>
  <div class="share-section">
    <Toast position="bottom-center" />
    <canvas ref="canvasRef" class="share-canvas" :width="CARD_WIDTH" :height="CARD_HEIGHT"></canvas>
    <Button class="download-btn" label="이미지로 저장" icon="pi pi-download" rounded @click="downloadCard" />
  </div>
</template>

<style scoped>
.share-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.share-canvas {
  width: 100%;
  max-width: 560px;
  height: auto;
  border-radius: 18px;
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.35);
}

/* PrimeVue Button의 p-button 클래스와 합쳐서 우선순위를 높여 이 앱 톤으로 덮어썼다 */
.download-btn.p-button {
  border: none;
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
  color: #ffffff;
  font-weight: 700;
  font-size: 0.88rem;
  padding: 10px 24px;
  box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.5);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.download-btn.p-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.55);
  background: linear-gradient(135deg, var(--accent-1), var(--accent-2));
}
</style>
