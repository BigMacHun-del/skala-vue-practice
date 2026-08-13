// WeatherHomeView / WeatherDetailView / WeatherRankingView가 공통으로 쓰는 mock 데이터 + 헬퍼 함수
export const rawCities = [
  { id: 'city_01', name: '서울', temp: 28, status: '맑음', lat: 37.57, lon: 126.98, humidity: 55, windSpeed: 3.2, precipitation: 0, updatedAt: '10분 전' },
  { id: 'city_02', name: '수원', temp: 18, status: '비', lat: 37.26, lon: 127.01, humidity: 88, windSpeed: 4.6, precipitation: 12.4, updatedAt: '4분 전' },
  { id: 'city_03', name: '인천', temp: 24, status: '흐림', lat: 37.46, lon: 126.7, humidity: 70, windSpeed: 5.1, precipitation: 0.5, updatedAt: '7분 전' },
  { id: 'city_04', name: '대전', temp: -3, status: '눈', lat: 36.35, lon: 127.38, humidity: 80, windSpeed: 2.8, precipitation: 3.1, updatedAt: '2분 전' },
  { id: 'city_05', name: '대구', temp: 36, status: '맑음', lat: 35.87, lon: 128.6, humidity: 32, windSpeed: 1.9, precipitation: 0, updatedAt: '1분 전' },
  { id: 'city_06', name: '부산', temp: 33, status: '흐림', lat: 35.18, lon: 129.08, humidity: 61, windSpeed: 6.4, precipitation: 0, updatedAt: '5분 전' },
  { id: 'city_07', name: '울산', temp: -8, status: '강풍', lat: 35.54, lon: 129.32, humidity: 40, windSpeed: 13.7, precipitation: 0, updatedAt: '3분 전' },
  { id: 'city_08', name: '거제', temp: 22, status: '구름', lat: 34.88, lon: 128.62, humidity: 58, windSpeed: 3.5, precipitation: 0, updatedAt: '9분 전' },
  { id: 'city_09', name: '강릉', temp: 30, status: '맑음', lat: 37.75, lon: 128.9, humidity: 47, windSpeed: 2.4, precipitation: 0, updatedAt: '6분 전' },
  { id: 'city_10', name: '제주', temp: 19, status: '비', lat: 33.5, lon: 126.53, humidity: 91, windSpeed: 7.8, precipitation: 18.9, updatedAt: '1분 전' },
  { id: 'city_11', name: '평창', temp: -14, status: '폭설', lat: 37.37, lon: 128.39, humidity: 85, windSpeed: 4.1, precipitation: 22.6, updatedAt: '8분 전' },
  { id: 'city_12', name: '포항', temp: 35, status: '맑음', lat: 36.02, lon: 129.37, humidity: 38, windSpeed: 2.1, precipitation: 0, updatedAt: '4분 전' },
]

// southKoreaHigh.svg의 <path d="..." id="KR-xx" data-name="시/도 이름" /> 태그들을 정규식으로 파싱
export const parseProvincePaths = (svgText) => {
  const pattern = /<path\s+d="([^"]+)"[^>]*\bid="([^"]+)"[^>]*\bdata-name="([^"]+)"/g
  const paths = []
  let match
  while ((match = pattern.exec(svgText)) !== null) {
    const [, d, id, name] = match
    paths.push({ id, name, d })
  }
  return paths
}

export const SVG_VIEW_BOX = { x: 79.59, y: -2, width: 800.82, height: 964 }

// 8개 광역시 실측 좌표로 최소제곱회귀한 메르카토르 투영 계수 (WeatherComposition.vue와 동일)
const MERCATOR_FIT = {
  a: 139.99066283955688,
  b: -17465.10548928772,
  c: -8282.041815281516,
  d: 6057.964242923005,
}

export const toMapPosition = (lat, lon) => {
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2))
  const svgX = MERCATOR_FIT.a * lon + MERCATOR_FIT.b
  const svgY = MERCATOR_FIT.c * mercatorY + MERCATOR_FIT.d
  const x = ((svgX - SVG_VIEW_BOX.x) / SVG_VIEW_BOX.width) * 100
  const y = ((svgY - SVG_VIEW_BOX.y) / SVG_VIEW_BOX.height) * 100
  return { x, y }
}

export const getWeatherAlert = (temp) => {
  if (temp >= 35) return { label: '폭염경보', class: 'heat-warning' }
  if (temp >= 33) return { label: '폭염주의보', class: 'heat-caution' }
  if (temp >= 28) return { label: '무더움', class: 'hot' }
  if (temp <= -12) return { label: '한파경보', class: 'cold-warning' }
  if (temp <= -5) return { label: '한파주의보', class: 'cold-caution' }
  if (temp <= 5) return { label: '쌀쌀함', class: 'cold' }
  return { label: '선선함', class: 'cool' }
}

export const SONG_GUIDE = {
  'heat-warning': { emoji: '🥵', mood: '기록적인 폭염, 시원한 곡으로 열을 식혀보세요', tracks: [
    { title: 'Ice Cream', artist: 'BLACKPINK, Selena Gomez' },
    { title: '에어컨 (Feat. pH-1)', artist: '적재' },
  ] },
  'heat-caution': { emoji: '🌞', mood: '뜨거운 태양 아래, 청량한 팝으로 텐션을 올려보세요', tracks: [
    { title: 'Dynamite', artist: '방탄소년단' },
    { title: '여름 안에서', artist: '헤이즈, Colde' },
  ] },
  hot: { emoji: '☀️', mood: '무더운 하루엔 산뜻한 여름 노래 어때요', tracks: [
    { title: 'Beach House', artist: 'NCT DREAM' },
    { title: '여름이 들려주는 말', artist: '볼빨간사춘기' },
  ] },
  cool: { emoji: '🍃', mood: '선선한 날씨엔 편안한 어쿠스틱이 딱이에요', tracks: [
    { title: '밤편지', artist: '아이유' },
    { title: '가을 타나 봐', artist: '오반' },
  ] },
  cold: { emoji: '🧣', mood: '쌀쌀한 날씨엔 포근한 감성 발라드를 추천해요', tracks: [
    { title: '첫눈처럼 너에게 가겠다', artist: '에일리' },
    { title: '겨울잠', artist: '아이유' },
  ] },
  'cold-caution': { emoji: '❄️', mood: '한파주의보! 따뜻한 캐롤 감성 어떠세요', tracks: [
    { title: 'Last Christmas', artist: 'Wham!' },
    { title: '눈사람', artist: '볼빨간사춘기' },
  ] },
  'cold-warning': { emoji: '🥶', mood: '강력한 한파, 집에서 듣기 좋은 잔잔한 곡이에요', tracks: [
    { title: '봄날', artist: '방탄소년단' },
    { title: 'Snow Flower', artist: '방탄소년단, 박지민' },
  ] },
}

export const legendItems = [
  { class: 'heat-warning', label: '폭염경보' },
  { class: 'heat-caution', label: '폭염주의보' },
  { class: 'hot', label: '무더움' },
  { class: 'cool', label: '선선함' },
  { class: 'cold', label: '쌀쌀함' },
  { class: 'cold-caution', label: '한파주의보' },
  { class: 'cold-warning', label: '한파경보' },
]
