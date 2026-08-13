# WeatherTune 발표 대본 (5분 내외)

이번엔 실제 화면에 보이는 순서(위→아래)대로 기능을 소개하면서, 그 자리에 쓰인 Vue 문법/도구를 짚는 방식으로 다시 짰습니다. 맨 아래 즐겨찾기 설명이 끝나면 자연스럽게 거제 이스터에그로 넘어가는 흐름이에요. 괄호 안 시간은 누적 기준.

---

## 0. 인트로 (~15초)

> "날씨 기반 플레이리스트 추천 서비스 WeatherTune을 만들었습니다. 전국 도시별 실시간 날씨와 기상청 특보를 보여주고, 그 날씨 무드에 맞는 노래를 추천해줘요. 오늘은 화면에 보이는 순서 그대로 위에서부터 내려가면서, 각 기능에 어떤 Vue 문법이 쓰였는지 보여드릴게요."

---

## 1. 헤더 — 다크모드 · 단위 전환 (~25초, 누적 0:40)

**보여줄 화면:** 헤더의 다크/라이트 토글, °C/°F 토글 버튼

- 다크모드는 이 컴포넌트 로컬 `ref` + `watch`로, 값이 바뀔 때마다 localStorage에 저장하는 부수효과만 붙였습니다.
- °C/°F 단위는 헤더와 도시 상세 페이지가 같은 값을 공유해야 해서 Pinia **스토어**로 뺐어요.

```js
// WeatherMusicApp.vue
const isDark = ref(true)
watch(isDark, (value) => localStorage.setItem(THEME_KEY, value ? 'dark' : 'light'))
```

```vue
<!-- UnitToggler.vue: props/emits 없이 스토어에 바로 접근 -->
<script setup>
import { useConfigStore } from '@/stores/configStore'
const configStore = useConfigStore()
</script>
<template>
  <button @click="configStore.toggleUnit()">...</button>
</template>
```

> "다크모드는 컴포넌트 하나짜리 상태라 로컬 ref로 충분했지만, 단위는 헤더에도 상세 페이지에도 같은 값이 보여야 해서 Pinia 스토어로 뺐습니다. UnitToggler는 props도 emit도 없이 스토어에 바로 붙어있어요."

---

## 2. 전국 기상특보 배너 — 외부 API 연동 (axios) (~35초, 누적 1:15)

**보여줄 화면:** 헤더 바로 아래 뜨는 "전국 기상특보" 배너

- 원래는 폭염/한파 배지가 기온 임계값으로 하드코딩돼 있었는데, 이번에 공공데이터포털의 기상청 특보 API를 실제로 붙였습니다.
- 이 API는 도시별이 아니라 발표/해제 이력을 문자열로 주는 구조라, 정규식으로 "가장 최근 상태"만 뽑아내는 파싱 로직이 필요했어요.

```js
// composables/useKmaAlerts.js
const HAZARD_PATTERN = /([가-힣]+(?:주의보|경보))\s*(발표|해제)/g

export const deriveActiveAlerts = (items) => {
  const latestByHazard = new Map()
  for (const item of items) {
    for (const [, hazard, action] of item.title.matchAll(HAZARD_PATTERN)) {
      if (!latestByHazard.has(hazard)) latestByHazard.set(hazard, { hazard, action })
    }
  }
  return [...latestByHazard.values()].filter((e) => e.action === '발표')
}
```

> "'풍랑주의보 해제·폭염주의보 발표'처럼 한 줄에 여러 건이 섞여서 오길래, 정규식으로 특보명·상태를 전부 뽑은 다음 특보별로 가장 최근 것만 남기고 '발표' 상태인 것만 배너에 올렸습니다."

---

## 3. 실시간 특보 지도 — `watch` + 권역별 실제 특보 (~55초, 누적 2:10)

**보여줄 화면:** 메인 지도, 도시를 클릭하면 아래 트렌드 차트가 바뀜

- 지도 위 34개 도시 배지도 이제 기온 기준이 아니라, 각 도시가 속한 광역 권역(10개)의 실제 기상청 특보를 반영합니다.
- 특보가 없는 권역은 기존처럼 기온 기반 문구(무더움/선선함/쌀쌀함)로 자연스럽게 대체돼요.

```js
// composables/useWeatherCities.js
const getCityAlert = (city) => {
  const active = regionAlerts[city.regionCode] ?? []
  return mapAlertsToCityAlert(active) ?? getAmbientBand(city.temp)
}
```

- 도시를 클릭하면(`selectCity`) 선택된 도시가 바뀌는데, 이걸 감시하는 게 **`watch`**입니다.

```js
// WeatherMusicApp.vue
watch(() => selectedCity.value.id, (cityId) => ensureDaily(cityId), { immediate: true })
```

> "selectedCity의 id만 watch하다가 바뀌면 그 도시의 예보를 새로 불러옵니다. immediate: true를 줘서 처음 화면이 뜰 때도 한 번 실행되게 했고요."

---

## 4. 기온 트렌드 차트 — OpenWeatherMap + axios (~35초, 누적 2:45)

**보여줄 화면:** 지도 아래 기온 추이 차트

> "실시간 날씨는 OpenWeatherMap API를 axios로 호출해서 가져옵니다. 도시가 34곳이다 보니 8개씩 묶어서 요청하고, 요청이 몰려서 429로 거절당하면 잠깐 기다렸다 다시 시도하는 로직도 넣었어요. 예전엔 34개 도시 예보를 한꺼번에 불러와서 느렸는데, 지금은 보고 있는 도시 하나만 그때그때 불러오는 구조로 바꿨습니다."

```js
// composables/useWeatherApi.js
const http = axios.create({ baseURL: 'https://api.openweathermap.org/data/2.5', timeout: 8000 })
export const fetchCityCurrent = async (lat, lon) => {
  const { data } = await requestWithRetry(() => http.get('/weather', { params: { lat, lon } }))
  return { temp: data.main.temp, weatherCode: data.weather[0].id, /* ... */ }
}
```

---

## 5. 오늘의 추천곡 · 공유 카드 — PrimeVue (~25초, 누적 3:10)

**보여줄 화면:** 추천곡 카드 아래 "이미지로 저장" 버튼

> "공유 카드 저장 버튼엔 PrimeVue를 적용했어요. 버튼 컴포넌트 하나 쓰는 데서 그치지 않고, 저장이 끝나면 PrimeVue의 Toast로 '저장 완료' 알림도 띄우게 했습니다."

```vue
<Button label="이미지로 저장" icon="pi pi-download" rounded @click="downloadCard" />
<Toast position="bottom-center" />
```

---

## 6. 도시별 현황 카드 — `props` / `emits` (~40초, 누적 3:50)

**보여줄 화면:** 카드 그리드, 카드의 "공유 링크" 클릭

- 부모(`WeatherMusicApp`)가 각 도시 데이터를 `props`로 내려주고, 카드 안에서 일어난 일(즐겨찾기 클릭 등)은 `emit`으로 다시 올려보내는 **"props down, events up"** 구조입니다.

```js
// CityWeatherCard.vue
const props = defineProps({ city: Object, isFavorite: Boolean })
defineEmits(['toggle-favorite', 'view-detail'])
```

```vue
<!-- 부모 쪽 -->
<CityWeatherCard :city="city" :is-favorite="favoritesStore.isFavorite(city.id)" @toggle-favorite="favoritesStore.toggle" />
```

> "카드 자체는 이 도시가 즐겨찾기인지 스스로 판단하지 않아요. 부모가 is-favorite으로 내려주고, 클릭하면 emit만 올려보내죠. 그래서 카드 컴포넌트는 재사용이 쉬워요."

---

## 7. 즐겨찾기 — Pinia 스토어 (~35초, 누적 4:25)

**보여줄 화면:** 맨 아래 즐겨찾기 섹션, 하트 눌러서 추가/삭제

- 즐겨찾기도 메인 화면과 도시 상세 페이지가 같은 상태를 공유해야 해서 Pinia 스토어로 관리합니다.

```js
// stores/favoritesStore.js
export const useFavoritesStore = defineStore('favorites', {
  state: () => ({ ids: loadSavedFavorites() }),
  getters: { isFavorite: (state) => (cityId) => state.ids.has(cityId) },
  actions: { toggle(cityId) { /* ids에 추가/삭제 + localStorage 저장 */ } },
})
```

> "화면 어디서 즐겨찾기를 누르든 같은 스토어를 보고 있어서 바로 반영돼요. 새로고침해도 localStorage에서 다시 불러와서 유지되고요, 폭염경보 같은 특보가 뜬 즐겨찾기 도시는 브라우저 알림(Notification API)으로도 따로 알려줍니다."

---

## 8. (전환) 거제를 5번 클릭 → 이스터에그 → 관광지 추천 — `slot` / 바인딩 (~60초, 누적 5:25)

여기까지가 메인 화면에 보이는 전부고, 지도에서 거제를 5번 연속 클릭하면 숨겨진 이스터에그가 뜹니다.

**보여줄 화면:** 거제 5번 클릭 → 이스터에그 모달 → "관광지 보러가기" → 거제 지도

- 이스터에그를 통해 들어가는 거제 관광지 추천 페이지는 카드 UI를 하나의 껍데기(`GlassCard`)로 만들고, 내용은 `<slot>`으로 갈아 끼울 수 있게 설계했습니다.

```vue
<!-- GlassCard.vue -->
<template>
  <section class="glass-card">
    <header v-if="title">...</header>
    <div class="glass-card-body"><slot /></div>
  </section>
</template>
```

- 지도 위 핀들은 실제 위경도를 계산해서 `%` 좌표로 **바인딩**했어요.

```vue
<!-- GeojeIslandMap.vue -->
<button
  v-for="zone in zones"
  :key="zone.id"
  :style="{ left: zone.x + '%', top: zone.y + '%' }"
  @click="$emit('select-zone', zone.id)"
  @mouseenter="$emit('preview-zone', zone.id)"
/>
```

> "`:style` 바인딩으로 각 핀의 위치를 데이터 값에서 그대로 계산해서 넣었고, 클릭·마우스오버 각각 다른 이벤트를 emit해서 부모가 상세 페이지 이동과 미리보기 패널 표시를 나눠서 처리하게 했습니다."

---

## 마무리 (~10초)

> "정리하면 화면 위에서부터 로컬 상태와 Pinia 스토어, watch로 반응하는 지도·차트, 실제 외부 API 두 개(OpenWeatherMap·기상청 특보), props/emits로 주고받는 카드, 그리고 즐겨찾기 다음에 숨겨진 slot 기반 거제 페이지까지 — 화면 순서 그대로 Vue 기능들을 붙여본 프로젝트였습니다. 감사합니다."

---

## 참고: 시간 배분 요약

| 구간 | 주제 | 길이 |
|---|---|---|
| 0 | 인트로 | 15초 |
| 1 | 헤더(다크모드·단위 전환) | 25초 |
| 2 | 전국 특보 배너(외부 API) | 35초 |
| 3 | 지도(watch + 권역별 특보) | 55초 |
| 4 | 트렌드 차트(OpenWeatherMap axios) | 35초 |
| 5 | 추천곡·공유카드(PrimeVue) | 25초 |
| 6 | 도시 카드(props/emits) | 40초 |
| 7 | 즐겨찾기(Pinia) | 35초 |
| 8 | 거제 이스터에그(slot/바인딩) | 60초 |
| 마무리 | | 10초 |
| **합계** | | **약 5분 35초** |

발표 중 시간이 빠듯하면 2번(특보 배너)이나 4번(OpenWeatherMap axios)을 코드 스니펫 없이 한 문장으로 줄이면 됩니다.
