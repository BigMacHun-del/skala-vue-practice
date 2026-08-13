<script setup>
import islandMapImage from '@/assets/geoje/geoje-island-map-clean.png'

// 거제 지도 이미지(투명 배경 PNG) 위에 구역 핀을 좌표(%)로 얹는 컴포넌트.
// 래스터 이미지라 내부 경계선을 도형으로 인식시킬 수 없어, WeatherMapSection.vue와 같은 방식으로
// 사진 위에 클릭 가능한 핀 버튼을 배치했다. zone.x/zone.y는 이 이미지 기준 좌표(geojeZones.js).
defineProps({
  zones: { type: Array, required: true },
  activeZoneId: { type: String, default: null },
})

// select-zone: 클릭 시 상세 페이지로 이동, preview-zone: 호버/포커스 시 미리보기 패널에 표시
defineEmits(['select-zone', 'preview-zone'])
</script>

<template>
  <div class="geoje-map-frame">
    <img :src="islandMapImage" alt="거제 지도" class="geoje-map-image" />

    <button
      v-for="zone in zones"
      :key="zone.id"
      class="zone-pin"
      :class="{ 'zone-pin-active': zone.id === activeZoneId }"
      :style="{ left: zone.x + '%', top: zone.y + '%' }"
      @click="$emit('select-zone', zone.id)"
      @mouseenter="$emit('preview-zone', zone.id)"
      @focus="$emit('preview-zone', zone.id)"
    >
      <span class="pin-dot" :style="{ background: zone.accentColor }"></span>
      <span class="pin-label">{{ zone.name }}</span>
    </button>
  </div>
</template>

<style scoped>
.geoje-map-frame {
  position: relative;
  width: 100%;
  /* 크롭한 투명 PNG(geoje-island-map-clean.png) 비율(1005x1476)과 맞춰야 핀 좌표(%)가 어긋나지 않는다 */
  aspect-ratio: 1005 / 1476;
  border-radius: 20px;
  overflow: hidden;
}

.geoje-map-image {
  width: 100%;
  height: 100%;
  /* 배경이 투명해서 cover로 잘려도 잘림 흔적이 안 보이지만, 비율을 frame과 똑같이 맞춰뒀으니
     사실상 contain과 동일하게 전체가 다 보인다 */
  object-fit: contain;
  display: block;
}

.zone-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  transition: transform 0.15s ease;
}

.zone-pin:hover .pin-dot,
.zone-pin-active .pin-dot {
  transform: scale(1.25);
}

.zone-pin-active .pin-label {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 0 0 2px rgba(28, 28, 30, 0.15);
}

.pin-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #1c1c1e;
  background: rgba(255, 255, 255, 0.85);
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
</style>
