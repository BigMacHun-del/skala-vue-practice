/**
 * OpenWeatherMap(https://openweathermap.org) API를 axios로 사용하는 컴포저블.
 * API 키는 소스코드에 직접 적지 않고 .env(VITE_OPENWEATHER_API_KEY)에서 읽는다 - Vite는
 * import.meta.env.VITE_* 형태의 변수를 빌드 시점에 자동으로 주입해준다.

 */
import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const http = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
  params: {
    appid: API_KEY,
    units: 'metric', // 섭씨로 받는다 (configStore의 화씨 변환은 이 값을 기준으로 계산됨)
    lang: 'kr',
  },
})

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * axios 요청을 감싸서, 429(Too Many Requests)를 받으면 잠깐 기다렸다가 한 번 더 시도한다.
 * @param {() => Promise<import('axios').AxiosResponse>} request
 */
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
        // 새로 발급한 키는 활성화까지 최대 몇 시간 걸릴 수 있어서, 초반엔 401이 정상적으로도 뜰 수 있다.
        // cause: err로 원래 axios 에러(응답 본문 등)를 그대로 달아둬서, 콘솔에서 원인 추적이 가능하게 한다.
        throw new Error('OpenWeatherMap API 키 인증 실패 (401) - 새로 발급한 키라면 활성화까지 시간이 걸릴 수 있어요.', {
          cause: err,
        })
      }
      throw err
    }
  }
}

// OpenWeatherMap의 weather condition id(https://openweathermap.org/weather-conditions)를
// 화면에서 쓰는 라벨/아이콘/강수여부로 변환. Open-Meteo의 WMO 코드 대신 이걸 쓰는 것으로 바뀐 것 외에
// getWeatherCodeInfo()를 호출하는 useWeatherCities.js 쪽 코드는 그대로다 (반환 모양이 같기 때문).
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

/**
 * 위경도로 "지금 날씨"만 가져온다 (OpenWeatherMap의 기본 Current Weather 엔드포인트, 무료).
 * @param {number} lat
 * @param {number} lon
 */
export const fetchCityCurrent = async (lat, lon) => {
  const { data } = await requestWithRetry(() => http.get('/weather', { params: { lat, lon } }))
  return {
    temp: data.main.temp,
    precipitation: (data.rain?.['1h'] ?? 0) + (data.snow?.['1h'] ?? 0),
    weatherCode: data.weather[0].id,
    windSpeed: data.wind.speed,
  }
}

/**
 * 위경도로 현재 날씨 + 예보(daily)를 가져온다.
 * OpenWeatherMap 무료 요금제는 "5 Day / 3 Hour Forecast" 엔드포인트를 제공하는데, 하루를 3시간
 * 간격으로 쪼갠 데이터를 준다. WeatherTrendChart.vue는 하루 단위 {date, max, min, precipitationSum}
 * 형태를 기대하니까, 같은 날짜(YYYY-MM-DD)끼리 묶어서 그날의 최고/최저/강수량 합으로 집계한다.
 * (Open-Meteo 때는 7일이었지만 무료 요금제 기준 최대 5일치만 나온다)
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{temp:number, precipitation:number, weatherCode:number, windSpeed:number, daily:Array}>}
 */
export const fetchCityForecast = async (lat, lon) => {
  const [current, forecast] = await Promise.all([
    requestWithRetry(() => http.get('/weather', { params: { lat, lon } })),
    requestWithRetry(() => http.get('/forecast', { params: { lat, lon } })),
  ])

  // forecast.data.list: 3시간 간격 항목이 최대 40개(5일치) - 날짜별로 묶어서 하루 단위로 집계
  const byDate = new Map()
  for (const item of forecast.data.list) {
    const date = item.dt_txt.slice(0, 10) // "2026-08-13 15:00:00" → "2026-08-13"
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

// 34개 도시를 한꺼번에 다 쏘는 대신 이 숫자만큼씩 나눠서 요청한다.
// 브라우저가 한 호스트로 동시에 열 수 있는 연결 수(보통 6개)와도 비슷한 수준으로 맞춰서,
// 서버(OpenWeatherMap) 입장에서 순간적으로 너무 많은 요청이 몰리는 걸 줄인다.
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
