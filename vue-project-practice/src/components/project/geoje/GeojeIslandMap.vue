<script setup>
import islandMapImage from '@/assets/geoje/geoje-island-map-clean.png'

// 거제 실제 행정구역 윤곽 이미지(사용자가 올려준 지도 사진) 위에 구역 핀을 얹는 컴포넌트.
// geoje-island-map-clean.png는 원본 사진(geoje-island-map.png)에서 흰 배경/주변 회색 육지(통영 등
// 거제가 아닌 지역)와 제목·워터마크 텍스트를 Python(PIL)으로 제거하고 거제 윤곽선만 남겨
// 투명 배경 PNG로 만든 것 - "지도 배경 없이 거제만 보이게" 요청으로 다시 만들었다.
// (밝기 임계값으로 흰/회색 배경을 지우고, 연결된 선 덩어리 중 거제 영역 밖에 있는 것들
//  - 제목 글자, 워터마크, 남은 잡티 - 은 좌표 범위로 걸러냈다.)
// ⚠️ 이 이미지는 SVG 벡터가 아니라 사진(래스터)이라 내부 경계선 각각을 클릭 가능한 도형으로
// 인식시킬 수는 없다. 그래서 WeatherMapSection.vue와 똑같은 방식으로, 사진 위에 좌표(%)로
// 위치를 잡은 핀 버튼을 얹어서 "그 근처를 클릭하면 그 구역으로 이동"하게 만들었다.
// zone.x/zone.y(geojeZones.js)는 이 새 크롭 이미지 기준으로 다시 계산한 값이라, 원본 이미지를
// 또 바꾸게 되면 geojeZones.js 상단 주석의 계산식도 같이 맞춰야 한다.
defineProps({
  zones: { type: Array, required: true },
  activeZoneId: { type: String, default: null },
})

// select-zone: 클릭 시 상세 페이지로 이동(기존 그대로).
// preview-zone: 마우스를 올리거나(mouseenter) 키보드로 포커스했을 때(focus) 올려보내서,
// 부모(GeojeHomeView.vue)가 오른쪽 미리보기 패널에 그 구역 정보 + 실시간 날씨를 띄우게 한다.
defineEmits(['select-zone', 'preview-zone'])
</script>

<template>
  <div class="geoje-map-frame">
    <img :src="islandMapImage" alt="거제 지도" class="geoje-map-image" />

    <!-- v-for + :key로 구역 핀을 반복 렌더링. 클릭은 select-zone(상세 페이지 이동),
         마우스 오버/포커스는 preview-zone(오른쪽 패널 미리보기)으로 서로 다른 이벤트를 올려보낸다. -->
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
