/**
 * Open-Meteo(https://open-meteo.com) 무료 날씨 API를 사용하는 컴포저블.
 * API 키/백엔드 서버 없이 브라우저에서 바로 fetch할 수 있다.
 */

// WMO Weather Code -> 화면에 보여줄 라벨/아이콘/강수여부 매핑
const WEATHER_CODE_MAP = {
  0: { label: '맑음', icon: '☀️', isRain: false, isSnow: false },
  1: { label: '대체로 맑음', icon: '🌤️', isRain: false, isSnow: false },
  2: { label: '구름 조금', icon: '⛅', isRain: false, isSnow: false },
  3: { label: '흐림', icon: '☁️', isRain: false, isSnow: false },
  45: { label: '안개', icon: '🌫️', isRain: false, isSnow: false },
  48: { label: '안개', icon: '🌫️', isRain: false, isSnow: false },
  51: { label: '약한 이슬비', icon: '🌦️', isRain: true, isSnow: false },
  53: { label: '이슬비', icon: '🌦️', isRain: true, isSnow: false },
  55: { label: '강한 이슬비', icon: '🌧️', isRain: true, isSnow: false },
  56: { label: '어는 이슬비', icon: '🌧️', isRain: true, isSnow: false },
  57: { label: '어는 이슬비', icon: '🌧️', isRain: true, isSnow: false },
  61: { label: '약한 비', icon: '🌦️', isRain: true, isSnow: false },
  63: { label: '비', icon: '🌧️', isRain: true, isSnow: false },
  65: { label: '강한 비', icon: '🌧️', isRain: true, isSnow: false },
  66: { label: '어는 비', icon: '🌧️', isRain: true, isSnow: false },
  67: { label: '어는 비', icon: '🌧️', isRain: true, isSnow: false },
  71: { label: '약한 눈', icon: '🌨️', isRain: false, isSnow: true },
  73: { label: '눈', icon: '❄️', isRain: false, isSnow: true },
  75: { label: '강한 눈', icon: '❄️', isRain: false, isSnow: true },
  77: { label: '싸락눈', icon: '🌨️', isRain: false, isSnow: true },
  80: { label: '약한 소나기', icon: '🌦️', isRain: true, isSnow: false },
  81: { label: '소나기', icon: '🌧️', isRain: true, isSnow: false },
  82: { label: '강한 소나기', icon: '⛈️', isRain: true, isSnow: false },
  85: { label: '약한 눈소나기', icon: '🌨️', isRain: false, isSnow: true },
  86: { label: '눈소나기', icon: '❄️', isRain: false, isSnow: true },
  95: { label: '뇌우', icon: '⛈️', isRain: true, isSnow: false },
  96: { label: '우박 동반 뇌우', icon: '⛈️', isRain: true, isSnow: false },
  99: { label: '우박 동반 뇌우', icon: '⛈️', isRain: true, isSnow: false },
}

/**
 * weather_code로 라벨/아이콘/강수 종류를 조회. 매핑에 없는 코드가 오면 기본값 반환
 * @param {number} code
 */
export const getWeatherCodeInfo = (code) => WEATHER_CODE_MAP[code] ?? { label: '알 수 없음', icon: '❔', isRain: false, isSnow: false }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// fetch가 응답도 실패도 없이 그냥 무한정 매달리는 경우(네트워크 hang)를 막기 위한 타임아웃.
// AbortController로 일정 시간 뒤 강제로 요청을 취소시킨다.
// 429(Too Many Requests)는 서버가 "지금 말고 잠깐 뒤에 다시 해달라"는 뜻이라, 곧바로 실패 처리하지 않고
// Retry-After 헤더(없으면 2초)만큼 기다렸다가 한 번 더 시도한다.
const fetchWithTimeout = async (url, { timeoutMs = 8000, retries = 1 } = {}) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const response = await fetch(url, { signal: controller.signal })
      if (response.status === 429 && attempt < retries) {
        const retryAfterSec = Number(response.headers.get('retry-after')) || 2
        await sleep(retryAfterSec * 1000)
        continue
      }
      if (!response.ok) {
        throw new Error(`날씨 API 응답 오류: ${response.status}`)
      }
      return await response.json()
    } finally {
      clearTimeout(timer)
    }
  }
  throw new Error('날씨 API 응답 오류: 429 (재시도 후에도 실패)')
}

/**
 * 위경도로 "지금 날씨"만 가볍게 가져온다 (7일 예보 없음).
 * 지도 핀/도시 카드처럼 34개 도시를 한 번에 조회할 때는 이 함수를 쓴다 - daily를 안 실어서
 * 응답이 훨씬 가볍고, 도시 수가 많아도 전체 배치가 오래 걸리지 않는다.
 * @param {number} lat
 * @param {number} lon
 */
export const fetchCityCurrent = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
    timezone: 'Asia/Seoul',
  })
  const data = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  return {
    temp: data.current.temperature_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
  }
}

/**
 * 위경도로 현재 날씨 + 7일 예보(daily)를 가져온다. daily가 필요한 건 한 번에 한 도시(선택된 도시)뿐이라
 * 이 함수는 useWeatherCities.js의 ensureDaily()에서 "그 도시 하나"에 대해서만 호출한다.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{temp:number, precipitation:number, weatherCode:number, windSpeed:number, daily:Array}>}
 */
export const fetchCityForecast = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,precipitation,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'Asia/Seoul',
    forecast_days: '7',
  })

  const data = await fetchWithTimeout(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)

  return {
    temp: data.current.temperature_2m,
    precipitation: data.current.precipitation,
    weatherCode: data.current.weather_code,
    windSpeed: data.current.wind_speed_10m,
    daily: data.daily.time.map((date, i) => ({
      date,
      max: data.daily.temperature_2m_max[i],
      min: data.daily.temperature_2m_min[i],
      precipitationSum: data.daily.precipitation_sum[i],
    })),
  }
}

// 34개 도시를 한꺼번에 다 쏘는 대신 이 숫자만큼씩 나눠서 요청한다.
// 브라우저가 한 호스트로 동시에 열 수 있는 연결 수(보통 6개)와도 비슷한 수준으로 맞춰서,
// 서버(Open-Meteo) 입장에서 순간적으로 너무 많은 요청이 몰리는 걸 줄인다.
const BATCH_SIZE = 8

const runInBatches = async (items, worker) => {
  const results = []
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE)
    const settled = await Promise.allSettled(batch.map(worker))
    results.push(...settled)
  }
  return results
}

/**
 * 여러 도시의 "지금 날씨"를 조회. 일부가 실패해도 전체가 멈추지 않도록 allSettled 사용.
 * fetchWithTimeout 덕분에 한 도시 요청이 응답 없이 매달려도 8초 뒤엔 실패 처리되어 전체 배치가 끝난다.
 * @param {Array<{id:string, lat:number, lon:number}>} cities
 * @returns {Promise<Map<string, {ok:boolean, data?:object, error?:Error}>>}
 */
export const fetchAllCitiesCurrent = async (cities) => {
  const results = await runInBatches(cities, (city) => fetchCityCurrent(city.lat, city.lon))

  const resultMap = new Map()
  results.forEach((result, index) => {
    const cityId = cities[index].id
    if (result.status === 'fulfilled') {
      resultMap.set(cityId, { ok: true, data: result.value })
    } else {
      resultMap.set(cityId, { ok: false, error: result.reason })
    }
  })
  return resultMap
}
