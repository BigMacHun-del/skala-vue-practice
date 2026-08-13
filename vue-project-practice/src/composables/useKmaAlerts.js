import axios from 'axios'

// 공공데이터포털 "기상청_기상특보 조회서비스" (getWthrWrnList).
// 처음엔 stnId=108만 테스트해보고 "전국 단위 통보문 목록"인 줄 알았는데, stnId=143(대구·경북)으로
// 다시 불러보니 완전히 다른 통보문 번호 체계(제08-45호 vs 제08-108호)로 따로 나와서, stnId가 실제로
// 권역별 발표 계통을 가리킨다는 걸 확인했다. 다만 178개 시군구 단위는 아니고, 예전 "중기예보구역코드"와
// 같은 10개 광역 권역 단위로 보인다 (REGION_CODES 참고).
const KMA_API_KEY = import.meta.env.VITE_KMA_API_KEY

const http = axios.create({
  baseURL: 'https://apis.data.go.kr/1360000/WthrWrnInfoService',
  timeout: 8000,
  params: { serviceKey: KMA_API_KEY, dataType: 'JSON' },
})

// 기상청 중기예보구역코드와 같은 체계의 10개 광역 특보 권역. 34개 도시를 여기 코드 중 하나로
// 매핑해두면(useWeatherCities.js의 rawCities.regionCode), 도시마다 매번 API를 부르는 대신
// 이 10개 코드에 대해서만 한 번씩 불러서 캐시해 쓸 수 있다.
export const REGION_CODES = {
  108: '서울·인천·경기',
  109: '강원영서',
  105: '강원영동',
  131: '충북',
  133: '대전·세종·충남',
  146: '전북',
  156: '광주·전남',
  143: '대구·경북',
  159: '부산·울산·경남',
  184: '제주',
}

// title 안에서 "폭염주의보 발표", "호우경보 해제" 같은 조각을 뽑아내는 정규식.
// 한 줄에 "풍랑주의보 해제·폭염주의보 발표"처럼 여러 건이 '·'로 묶여 올 때도 있어서 global 매치로 전부 뽑는다.
const HAZARD_PATTERN = /([가-힣]+(?:주의보|경보))\s*(발표|해제)/g

// tmFc: 202608131000(YYYYMMDDHHmm, 숫자) -> "08.13 10:00"
const formatTmFc = (tmFc) => {
  const s = String(tmFc)
  return `${s.slice(4, 6)}.${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}`
}

// regionCode를 안 주면 예전처럼 108(서울·인천·경기)만 조회한다 - KmaAlertBanner.vue(전국 요약 배너)는
// 이 기본값 그대로 쓰고, useWeatherCities.js는 10개 권역 각각에 대해 regionCode를 넘겨서 따로 부른다.
export const fetchKmaBulletins = async (numOfRows = 30, regionCode = 108) => {
  const { data } = await http.get('/getWthrWrnList', {
    params: { pageNo: 1, numOfRows, stnId: regionCode },
  })
  if (data?.response?.header?.resultCode !== '00') {
    throw new Error(data?.response?.header?.resultMsg ?? 'KMA API 응답 오류')
  }
  const items = data?.response?.body?.items?.item ?? []
  // 결과가 0건이면 item이 배열이 아니라 빈 문자열("")로 오는 경우가 있어서 방어적으로 처리
  return Array.isArray(items) ? items : []
}

// items는 최신순으로 온다고 가정하고, 특보 종류별로 "가장 최근 상태(발표/해제)"만 남겨서
// 지금 발효 중(마지막 상태가 '발표')인 것만 돌려준다.
// ⚠️ numOfRows개 안에서만 훑기 때문에, 그보다 훨씬 전에 발표돼서 아직 안 풀린 특보가 있으면 놓칠 수 있다 -
// 그래서 배너 문구에 "최근 발표 내역 기준"이라고 명시해뒀다 (완벽한 실시간 전수조사가 아님을 밝히는 것).
export const deriveActiveAlerts = (items) => {
  const latestByHazard = new Map()
  for (const item of items) {
    const matches = [...(item.title ?? '').matchAll(HAZARD_PATTERN)]
    for (const [, hazard, action] of matches) {
      if (!latestByHazard.has(hazard)) {
        latestByHazard.set(hazard, { hazard, action, tmFc: item.tmFc })
      }
    }
  }
  return [...latestByHazard.values()]
    .filter((entry) => entry.action === '발표')
    .map((entry) => ({ ...entry, time: formatTmFc(entry.tmFc) }))
}

// 실제 특보 이름 -> 기존에 쓰던 배지 class로 매핑. 폭염/한파/호우는 카드·지도·플레이리스트가 이미
// 대응하는 class(heat-warning 등)가 있어서 그대로 재사용하고, 그 외(대설·강풍·태풍·안개·건조·황사 등
// 12종 특보 중 나머지)는 색만 다른 공용 class(other-warning/other-caution)로 뭉뚱그렸다.
const HAZARD_TO_CLASS = {
  폭염: { 경보: 'heat-warning', 주의보: 'heat-caution' },
  한파: { 경보: 'cold-warning', 주의보: 'cold-caution' },
  호우: { 경보: 'rain-warning', 주의보: 'rain-caution' },
}

const hazardToClass = (hazard) => {
  // "폭염경보" -> 이름 "폭염" + 등급 "경보"로 분리
  const grade = hazard.endsWith('경보') ? '경보' : '주의보'
  const name = hazard.slice(0, hazard.length - grade.length)
  return HAZARD_TO_CLASS[name]?.[grade] ?? (grade === '경보' ? 'other-warning' : 'other-caution')
}

// 심각도 우선순위: 경보(-warning류)가 주의보(-caution류)보다 항상 먼저, 그 안에서는 폭염/한파/호우처럼
// 기존에 곡 추천(SONG_GUIDE)까지 갖춰진 걸 우선하고 other는 맨 뒤로 - 카드에는 하나만 보여줘야 해서
// 여러 특보가 동시에 떠 있으면 이 순서로 가장 "보여줄 만한" 하나를 고른다.
const CLASS_PRIORITY = [
  'heat-warning', 'cold-warning', 'rain-warning', 'other-warning',
  'heat-caution', 'cold-caution', 'rain-caution', 'other-caution',
]

const CLASS_LABELS = {
  'heat-warning': '폭염경보', 'heat-caution': '폭염주의보',
  'cold-warning': '한파경보', 'cold-caution': '한파주의보',
  'rain-warning': '호우경보', 'rain-caution': '호우주의보',
  'other-warning': '기상경보', 'other-caution': '기상주의보',
}

// deriveActiveAlerts()가 돌려준 "지금 발효 중인 특보 목록"(그 권역 전체, 여러 개일 수 있음)을 받아서
// 카드에 보여줄 배지 하나(class, label)로 압축한다. 발효 중인 게 하나도 없으면 null - 그럼 호출하는
// 쪽(useWeatherCities.js)이 기온 기반 평상시 문구(무더움/선선함/쌀쌀함)로 대신 채운다.
export const mapAlertsToCityAlert = (activeAlerts) => {
  if (!activeAlerts || activeAlerts.length === 0) return null
  const classes = activeAlerts.map((a) => hazardToClass(a.hazard))
  const bestClass = CLASS_PRIORITY.find((c) => classes.includes(c)) ?? classes[0]
  const matched = activeAlerts[classes.indexOf(bestClass)]
  return { class: bestClass, label: matched?.hazard ?? CLASS_LABELS[bestClass] }
}
