import axios from 'axios'

// 공공데이터포털 "기상청_기상특보 조회서비스" (getWthrWrnList).
// stnId 파라미터로 10개 광역 권역 단위 특보를 조회한다 (REGION_CODES 참고).
const KMA_API_KEY = import.meta.env.VITE_KMA_API_KEY

const http = axios.create({
  baseURL: 'https://apis.data.go.kr/1360000/WthrWrnInfoService',
  timeout: 8000,
  params: { serviceKey: KMA_API_KEY, dataType: 'JSON' },
})

// 기상청 중기예보구역코드와 같은 체계의 10개 광역 특보 권역 (useWeatherCities.js의 regionCode와 매핑)
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

// title 안에서 "폭염주의보 발표", "호우경보 해제" 같은 조각을 뽑는 정규식.
// "풍랑주의보 해제·폭염주의보 발표"처럼 한 줄에 여러 건이 올 수 있어 global 매치로 전부 뽑는다.
const HAZARD_PATTERN = /([가-힣]+(?:주의보|경보))\s*(발표|해제)/g

// tmFc: 202608131000(YYYYMMDDHHmm) -> "08.13 10:00"
const formatTmFc = (tmFc) => {
  const s = String(tmFc)
  return `${s.slice(4, 6)}.${s.slice(6, 8)} ${s.slice(8, 10)}:${s.slice(10, 12)}`
}

// regionCode 기본값 108(서울·인천·경기) - KmaAlertBanner.vue(전국 배너)는 기본값 그대로 쓰고,
// useWeatherCities.js는 10개 권역 각각에 대해 regionCode를 넘겨서 따로 부른다.
export const fetchKmaBulletins = async (numOfRows = 30, regionCode = 108) => {
  const { data } = await http.get('/getWthrWrnList', {
    params: { pageNo: 1, numOfRows, stnId: regionCode },
  })
  if (data?.response?.header?.resultCode !== '00') {
    throw new Error(data?.response?.header?.resultMsg ?? 'KMA API 응답 오류')
  }
  const items = data?.response?.body?.items?.item ?? []
  // 결과 0건이면 item이 배열이 아니라 빈 문자열("")로 오는 경우가 있어 방어적으로 처리
  return Array.isArray(items) ? items : []
}

// items는 최신순 - 특보 종류별로 가장 최근 상태(발표/해제)만 남겨 지금 발효 중인 것만 반환.
// numOfRows개 안에서만 훑기 때문에 그보다 오래된 미해제 특보는 놓칠 수 있어 배너에 "최근 발표 내역 기준"으로 표기.
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

// 특보 이름 -> 배지 class. 폭염/한파/호우는 기존 class를 재사용하고, 나머지(대설/강풍/태풍 등)는
// other-warning/other-caution으로 묶는다.
const HAZARD_TO_CLASS = {
  폭염: { 경보: 'heat-warning', 주의보: 'heat-caution' },
  한파: { 경보: 'cold-warning', 주의보: 'cold-caution' },
  호우: { 경보: 'rain-warning', 주의보: 'rain-caution' },
}

const hazardToClass = (hazard) => {
  // "폭염경보" -> "폭염" + "경보"
  const grade = hazard.endsWith('경보') ? '경보' : '주의보'
  const name = hazard.slice(0, hazard.length - grade.length)
  return HAZARD_TO_CLASS[name]?.[grade] ?? (grade === '경보' ? 'other-warning' : 'other-caution')
}

// 심각도 우선순위 - 여러 특보가 동시에 떠 있으면 카드엔 이 순서로 하나만 골라 보여준다
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

// 발효 중인 특보 목록을 카드에 보여줄 배지 하나(class, label)로 압축. 없으면 null 반환
export const mapAlertsToCityAlert = (activeAlerts) => {
  if (!activeAlerts || activeAlerts.length === 0) return null
  const classes = activeAlerts.map((a) => hazardToClass(a.hazard))
  const bestClass = CLASS_PRIORITY.find((c) => classes.includes(c)) ?? classes[0]
  const matched = activeAlerts[classes.indexOf(bestClass)]
  return { class: bestClass, label: matched?.hazard ?? CLASS_LABELS[bestClass] }
}
