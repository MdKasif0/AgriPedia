const OPENWEATHER_API_KEY = '9478ff50172fe8457d7532be7ac8aa67';

export interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  icon: string;
  forecast: {
    date: string;
    temperature: number;
    description: string;
  }[];
}

export async function getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    const data = await response.json();

    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${OPENWEATHER_API_KEY}`
    );
    const forecastData = await forecastResponse.json();

    return {
      temperature: data.main.temp,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      forecast: forecastData.list.slice(0, 5).map((item: any) => ({
        date: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        description: item.weather[0].description,
      })),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
}

export function getPlantingRecommendations(weatherData: WeatherData): string[] {
  const recommendations: string[] = [];

  // Temperature-based recommendations
  if (weatherData.temperature < 10) {
    recommendations.push('Consider cold-hardy vegetables like kale and spinach');
  } else if (weatherData.temperature > 25) {
    recommendations.push('Focus on heat-tolerant plants like okra and sweet potatoes');
  }

  // Humidity-based recommendations
  if (weatherData.humidity > 70) {
    recommendations.push('Be cautious of fungal diseases, ensure good air circulation');
  } else if (weatherData.humidity < 40) {
    recommendations.push('Consider drought-resistant plants or increase watering frequency');
  }

  return recommendations;
} 