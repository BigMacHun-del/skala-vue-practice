# WeatherTune 🌦️🎵

전국 도시의 실시간 날씨와 기상청 특보를 보여주고, 그 날씨 무드에 어울리는 노래를 추천해주는 Vue 3 프로젝트입니다. 1~7일차 과제 요구사항을 순서대로 구현하면서, 매 과제의 결과물을 다음 과제의 베이스로 계속 이어 붙여 하나의 실제 서비스 형태로 완성했습니다.

- 배포 URL: (Vercel 배포 후 URL 입력)
- 로컬 실행: 아래 [실행 방법](#실행-방법) 참고

## 핵심 기능

과제를 순서대로 거치며 최종적으로 아래 기능을 갖춘 서비스로 완성했습니다.

- **실시간 날씨 대시보드**: OpenWeatherMap API(axios)로 34개 도시의 실시간 기온·날씨·강수량을 조회하고, 지도에서 도시를 클릭하면 5일 예보 기온 트렌드 차트를 보여줍니다.
- **기상청 실제 특보 연동**: 공공데이터포털 기상청 특보 API를 axios로 직접 연동했습니다. 헤더 아래엔 전국 특보 발표/해제 현황 배너를, 지도·카드의 도시별 배지에는 그 도시가 속한 광역 권역(10개 권역)의 실제 특보를 반영합니다. 특보가 없으면 기존 기온 기반 문구(무더움/선선함/쌀쌀함)로 자연스럽게 대체됩니다.
- **날씨 기반 추천곡 & 공유 카드**: 선택된 도시의 특보 등급에 맞는 플레이리스트를 추천하고, PrimeVue의 Toast 알림과 함께 카드 이미지를 캔버스로 저장할 수 있습니다.
- **즐겨찾기 & 브라우저 알림**: 즐겨찾기한 도시에 특보가 뜨면 Notification API로 알려줍니다. 즐겨찾기 상태는 Pinia 스토어로 관리되어 메인 화면·상세 페이지 어디서든 동일하게 유지됩니다.
- **°C/°F 단위 전환**: 헤더의 토글 버튼으로 전체 화면의 기온 표시 단위를 즉시 전환합니다(Pinia 스토어).
- **도시 상세 공유 페이지**: 카드의 공유 링크를 누르면 `/city/:cityId`로 이동해 해당 도시 정보만 보여주는 페이지가 열립니다(Vue Router 동적 라우팅).
- **숨겨진 거제도 이스터에그**: 지도에서 "거제"를 5번 연속 클릭하면 히든 트랙이 공개되고, 거제 관광지 추천 페이지(`/geoje`)로 진입할 수 있습니다. 유리질감 카드(`GlassCard.vue`)를 `<slot>` 기반 공용 셸로 만들어 소개/지도/구역별 정보 카드에 재사용했습니다.

## 과제 요구사항 반영 내역

| 과제 | 요구사항 핵심 | 구현 위치 |
|---|---|---|
| 1. (Mockup) | `ref` 배열 + `v-for`/`v-if`, `:value`+`@input` 한글 양방향 바인딩, 이벤트 버블링 제어, `window.alert` | `components/task/WeatherMockup.vue` |
| 2. (Composition) | 반응형 상태, `computed` 연쇄 의존성(도시 목록 → 통계 → 선택 도시 → 추천곡), `watch`로 선택 변화 감지 | `components/task/WeatherComposition.vue` |
| 3. (Component 분리) | `<slot>` 기반 공용 카드(`BaseDashboardCard`) + `props`/`emits`로 통신하는 지도·추천곡·도시카드 컴포넌트 분리 | `components/task/task3/*.vue` (`BaseDashboardCard`, `WeatherMapPanel`, `SongRecommendationPanel`, `WeatherCityCard`, 직접 추가한 `AlertBadge`) |
| 4. (Router) | Lazy Loading, Catch-all Route, `router.push` 프로그래매틱 네비게이션, 동적 세그먼트(`:cityId`) | `router/index.js`, `views/WeatherHomeView.vue`, `WeatherDetailView.vue`, `WeatherAboutView.vue`, `NotFoundView.vue`, 직접 추가한 `WeatherRankingView.vue` |
| 5. (Pinia) | 전역 스토어(state/getters/actions)로 단위 설정 관리, 메인·상세 화면에 동일 적용 | `stores/configStore.js`, `components/project/UnitToggler.vue`, 직접 추가한 `stores/favoritesStore.js`(즐겨찾기) |
| 6. (Axios) | 외부 API로 실제 날씨 데이터 연동, 추가 API로 기능 확장 | `composables/useWeatherApi.js`(OpenWeatherMap), 직접 추가한 `composables/useKmaAlerts.js`(기상청 특보 API) |
| 7. (UI Library) | 외부 UI 라이브러리 자유 적용 | PrimeVue `Button`/`Toast` — `components/project/ShareCardSection.vue` |
| 완성도 다듬기 | 스타일/기능 정비, README 정리 | `components/project/**` 전체를 실제 서비스 수준(WeatherTune)으로 재구성, 이 문서 |
| 소스코드 품질관리 | ESLint 에러 0건, API 키는 환경 변수로 분리해 Git 제외 | `npm run lint` 통과, `.env`(gitignore 처리) / `.env.example` 제공 |
| Build & Deployment | 빌드 후 정적 파일을 서버에 호스팅 | `npm run build` → Vercel 배포 (`vercel.json`으로 SPA 라우팅 처리) |

과제별 실습 코드는 실제 서비스(`components/project/`)와 분리해 `components/task/`, `components/component/`, `components/composition/`, `components/practice/` 아래에 그대로 남겨뒀습니다.

## 기술 스택

- **Framework**: Vue 3 (Composition API, `<script setup>`)
- **Routing**: Vue Router 5 (Lazy Loading, 동적 세그먼트, Catch-all Route)
- **상태 관리**: Pinia
- **HTTP**: Axios (OpenWeatherMap, 기상청 공공데이터포털)
- **UI Library**: PrimeVue
- **빌드 도구**: Vite
- **Lint/Format**: ESLint(+oxlint), Prettier
- **배포**: Vercel

## 폴더 구조

```
src/
├─ components/
│  ├─ project/          # 실제 서비스(WeatherTune) 컴포넌트
│  │  └─ geoje/          # 거제도 이스터에그 페이지
│  └─ task/, component/, composition/, practice/  # 일차별 실습 코드
├─ composables/          # useWeatherApi, useWeatherCities, useKmaAlerts
├─ stores/               # configStore, favoritesStore (Pinia)
├─ router/               # 라우트 정의
└─ views/                # 4일차 과제 전용 페이지
```

## 실행 방법

```sh
npm install
```

### 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고, 아래 두 API 키를 채워주세요.

```
VITE_OPENWEATHER_API_KEY=   # https://openweathermap.org/api 에서 발급
VITE_KMA_API_KEY=           # 공공데이터포털 "기상청_기상특보 조회서비스" 에서 발급 (Decoding 키)
```

### 개발 서버 실행

```sh
npm run dev
```

### 빌드 & 미리보기

```sh
npm run build
npm run preview
```

### Lint

```sh
npm run lint
```
