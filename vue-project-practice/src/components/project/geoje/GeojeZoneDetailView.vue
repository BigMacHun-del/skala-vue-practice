<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { GEOJE_ZONES } from './geojeZones'
import GlassCard from './GlassCard.vue'
import GeojeAttractionsCard from './GeojeAttractionsCard.vue'
import GeojeFoodCard from './GeojeFoodCard.vue'
import GeojeFishingCard from './GeojeFishingCard.vue'

// /geoje/:zoneId 라우트. 지도에서 구역 핀을 클릭하면 여기로 온다.
const route = useRoute()
const zone = computed(() => GEOJE_ZONES.find((z) => z.id === route.params.zoneId) ?? null)

// heroImage가 있으면 그 사진을, 없으면 accentColor로 만든 그라디언트를 배경으로 쓴다
const backgroundStyle = computed(() => {
  if (!zone.value) return { background: '#1c1c1e' }
  if (zone.value.heroImage) {
    return {
      backgroundImage: `linear-gradient(rgba(4, 10, 24, 0.3), rgba(4, 10, 24, 0.65)), url(${zone.value.heroImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { background: `linear-gradient(160deg, ${zone.value.accentColor} 0%, #1c1c1e 100%)` }
})
</script>

<template>
  <div class="zone-detail" :style="backgroundStyle">
    <div class="zone-inner">
      <RouterLink to="/geoje" class="back-link">← 거제 지도로 돌아가기</RouterLink>

      <template v-if="zone">
        <header class="zone-header">
          <p class="zone-tagline">{{ zone.tagline }}</p>
          <h1 class="zone-title">{{ zone.name }}</h1>
        </header>

        <GeojeAttractionsCard :attractions="zone.attractions" />
        <GeojeFoodCard :food="zone.food" />
        <GeojeFishingCard :fishing="zone.fishing" />
      </template>

      <GlassCard v-else title="구역을 찾을 수 없어요">
        <p class="not-found-desc">"{{ route.params.zoneId }}"에 해당하는 구역이 없어요.</p>
      </GlassCard>
    </div>
  </div>
</template>

<style scoped>
.zone-detail {
  min-height: 100vh;
  transition: background 0.3s ease;
}

.zone-inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.back-link {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  padding: 8px 16px;
  border-radius: 999px;
}

.zone-header {
  padding: 4px 4px 8px;
}

.zone-tagline {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 6px;
}

.zone-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.not-found-desc {
  font-size: 0.85rem;
  color: #48484a;
}
</style>
