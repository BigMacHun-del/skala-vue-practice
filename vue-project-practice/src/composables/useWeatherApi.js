// OpenWeatherMap API를 axios로 호출하는 컴포저블. 키는 .env(VITE_OPENWEATHER_API_KEY)에서 읽는다.
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const http = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
  params: {
    appid: API_KEY,
    units: 'metric',
    lang: 'kr',
  },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 429(Too Many Requests)면 잠깐 기다렸다가 한 번 더 시도
const requestWithRetry = async (request, retries = 1) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await request()
    } catch (err) {
      const status = err.response?.status
      if (status === 429 && attempt < retries) {
        const retryAfterSec = Number(err.response.headers['retry-after']) || 2
        await sleep(retryAfterSec * 1000)
        continue
      }
      if (status === 401) {
        throw new Error('OpenWeatherMap API 키 인증 실패 (401) - 새로 발급한 키라면 활성화까지 시간이 걸릴 수 있어요.', {
          cause: err,
        })
      }
      throw err
    }
  }
}

// OpenWeatherMap weather condition id -> 화면용 라벨/아이콘/강수여부
export const getWeatherCodeInfo = (id) => {
  if (id >= 200 && id < 300) return { label: '뇌우', icon: '⛈️', isRain: true, isSnow: false }
  if (id >= 300 && id < 400) return { label: '이슬비', icon: '🌦️', isRain: true, isSnow: false }
  if (id >= 500 && id < 600) return { label: '비', icon: '🌧️', isRain: true, isSnow: false }
  if (id >= 600 && id < 700) return { label: '눈', icon: '❄️', isRain: false, isSnow: true }
  if (id >= 700 && id < 800) return { label: '안개', icon: '🌫️', isRain: false, isSnow: false }
  if (id === 800) return { label: '맑음', icon: '☀️', isRain: false, isSnow: false }
  if (id === 801 || id === 802) return { label: '구름 조금', icon: '⛅', isRain: false, isSnow: false }
  if (id >= 803) return { label: '흐림', icon: '☁️', isRain: false, isSnow: false }
  return { label: '알 수 없음', icon: '❔', isRain: false, isSnow: false }
}

// 위경도로 현재 날씨만 조회
export const fetchCityCurrent = async (lat, lon) => {
  const { data } = await requestWithRetry(() => http.get('/weather', { params: { lat, lon } }))
  return {
    temp: data.main.temp,
    precipitation: (data.rain?.['1h'] ?? 0) + (data.snow?.['1h'] ?? 0),
    weatherCode: data.weather[0].id,
    windSpeed: data.wind.speed,
  }
}

// 위경도로 현재 날씨 + 5일 예보(3시간 간격 데이터를 날짜별로 묶어 하루 단위로 집계)
export const fetchCityForecast = async (lat, lon) => {
  const [current, forecast] = await Promise.all([
    requestWithRetry(() => http.get('/weather', { params: { lat, lon } })),
    requestWithRetry(() => http.get('/forecast', { params: { lat, lon } })),
  ])

  const byDate = new Map()
  for (const item of forecast.data.list) {
    const date = item.dt_txt.slice(0, 10) // "2026-08-13 15:00:00" -> "2026-08-13"
    const entry = byDate.get(date) ?? { max: -Infinity, min: Infinity, precipitationSum: 0 }
    entry.max = Math.max(entry.max, item.main.temp_max)
    entry.min = Math.min(entry.min, item.main.temp_min)
    entry.precipitationSum += (item.rain?.['3h'] ?? 0) + (item.snow?.['3h'] ?? 0)
    byDate.set(date, entry)
  }
  const daily = [...byDate.entries()].map(([date, values]) => ({ date, ...values }))

  return {
    temp: current.data.main.temp,
    precipitation: (current.data.rain?.['1h'] ?? 0) + (current.data.snow?.['1h'] ?? 0),
    weatherCode: current.data.weather[0].id,
    windSpeed: current.data.wind.speed,
    daily,
  }
}

// 34개 도시를 한꺼번에 안 쏘고 이 숫자씩 나눠서 요청
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

// 여러 도시의 현재 날씨 조회. 일부 실패해도 전체가 멈추지 않도록 allSettled 사용
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
