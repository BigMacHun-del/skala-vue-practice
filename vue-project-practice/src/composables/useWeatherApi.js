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

/**
 * 위경도로 Open-Meteo에서 현재 날씨 + 7일 예보를 가져온다.
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

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`)
  if (!response.ok) {
    throw new Error(`날씨 API 응답 오류: ${response.status}`)
  }
  const data = await response.json()

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

/**
 * 여러 도시를 동시에 조회. 일부가 실패해도 전체가 멈추지 않도록 allSettled 사용.
 * @param {Array<{id:string, lat:number, lon:number}>} cities
 * @returns {Promise<Map<string, {ok:boolean, data?:object, error?:Error}>>}
 */
export const fetchAllCitiesForecast = async (cities) => {
  const results = await Promise.allSettled(cities.map((city) => fetchCityForecast(city.lat, city.lon)))

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
