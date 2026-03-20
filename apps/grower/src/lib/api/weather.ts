// lib/weather.ts
export async function getWeather(lat: number, lon: number) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const res = await fetch(
    `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
  );
  if (!res.ok) throw new Error("Failed to fetch weather");
  return res.json();
}
