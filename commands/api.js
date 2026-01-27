import axios from 'axios';
import logger from '../utils/logger.js';

export async function weatherCommand(city) {
  if (!city) {
    logger.error('Please provide a city name.');
    logger.info('Usage: node index.js weather "<city name>"');
    logger.info('Example: node index.js weather "London"');
    return;
  }

  try {
    logger.info(`Fetching weather for: ${city}`);

    // Step 1: Get coordinates from city name using Open-Meteo Geocoding API
    const geoUrl = 'https://geocoding-api.open-meteo.com/v1/search';
    const geoResponse = await axios.get(geoUrl, {
      params: {
        name: city,
        count: 1,
        language: 'en',
        format: 'json'
      },
      timeout: 10000
    });

    if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
      logger.error('City not found. Please check the city name.');
      return;
    }

    const location = geoResponse.data.results[0];
    const { latitude, longitude, name, country } = location;

    // Step 2: Get weather data using Open-Meteo Weather API
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast';
    const weatherResponse = await axios.get(weatherUrl, {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m',
        timezone: 'auto'
      },
      timeout: 10000
    });

    const current = weatherResponse.data.current;

    // Convert temperatures
    const tempC = current.temperature_2m;
    const tempF = (tempC * 9/5) + 32;
    const feelsLikeC = current.apparent_temperature;
    const feelsLikeF = (feelsLikeC * 9/5) + 32;

    // Get wind direction
    const windDir = current.wind_direction_10m ? getWindDirection(current.wind_direction_10m) : '';

    logger.header('Weather Information');
    logger.log(`Location:    ${name}, ${country}`);
    logger.log(`Temperature: ${tempC.toFixed(1)}°C (${tempF.toFixed(1)}°F)`);
    logger.log(`Feels Like:  ${feelsLikeC.toFixed(1)}°C (${feelsLikeF.toFixed(1)}°F)`);
    logger.log(`Condition:   ${getWeatherDescription(current.weather_code)}`);
    logger.log(`Humidity:    ${current.relative_humidity_2m}%`);
    logger.log(`Wind:        ${current.wind_speed_10m.toFixed(1)} km/h ${windDir ? `(${windDir})` : ''}`);

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
    } else {
      logger.error(`Failed to fetch weather data: ${err.message}`);
    }
  }
}

function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail'
  };
  return weatherCodes[code] || 'Unknown';
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getWindDirection(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export async function jokeCommand(options = {}) {
  try {
    logger.info('Fetching a random joke...');

    // Official Joke API - free, no authentication required
    const url = 'https://official-joke-api.appspot.com/random_joke';
    const response = await axios.get(url, { timeout: 10000 });

    const joke = response.data;

    logger.header('Programming Joke');
    logger.log(`Setup: ${joke.setup}`);
    logger.log('');
    logger.log(`Punchline: ${joke.punchline}`);
    logger.log('');
    logger.log(`Type: ${joke.type}`);

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else {
      logger.error(`Failed to fetch joke: ${err.message}`);
    }
  }
}

export async function jokeCategoryCommand(category) {
  if (!category) {
    logger.error('Please provide a category.');
    logger.info('Usage: node index.js joke-category <type>');
    logger.info('Available types: programming, general');
    return;
  }

  try {
    logger.info(`Fetching a ${category} joke...`);

    // Official Joke API - use /jokes/<type>/ten endpoint
    // The API returns an array of jokes, we'll pick one randomly
    const url = `https://official-joke-api.appspot.com/jokes/${encodeURIComponent(category)}/ten`;
    const response = await axios.get(url, { timeout: 10000 });

    const jokes = response.data;

    // Check if we got any jokes
    if (!jokes || jokes.length === 0) {
      logger.error(`No jokes found for type "${category}".`);
      logger.info('Available types: programming, general');
      return;
    }

    // Pick a random joke from the array
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    logger.header('Joke');
    logger.log(`Setup: ${joke.setup}`);
    logger.log('');
    logger.log(`Punchline: ${joke.punchline}`);
    logger.log('');
    logger.log(`Type: ${joke.type}`);

  } catch (err) {
    if (err.response && err.response.status === 404) {
      logger.error(`Type "${category}" not found.`);
      logger.info('Try: programming, general');
    } else if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else {
      logger.error(`Failed to fetch joke: ${err.message}`);
    }
  }
}

// News category mappings for NewsAPI.org
// Supported categories: business, entertainment, general, health, science, sports, technology
const NEWS_CATEGORIES = {
  'top': 'general',
  'general': 'general',
  'business': 'business',
  'entertainment': 'entertainment',
  'health': 'health',
  'science': 'science',
  'sports': 'sports',
  'sport': 'sports',
  'technology': 'technology',
  'tech': 'technology',
};

export async function newsCommand(limit = 5) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    logger.error('NEWS_API_KEY not found in environment variables.');
    logger.info('Please add your NewsAPI.org key to the .env file.');
    return;
  }

  try {
    logger.info('Fetching latest news...');

    // Use NewsAPI.org top-headlines endpoint
    const apiUrl = 'https://newsapi.org/v2/top-headlines';
    const response = await axios.get(apiUrl, {
      params: {
        apiKey: apiKey,
        country: 'us',
        pageSize: limit,
      },
      timeout: 10000,
    });

    if (response.data.status !== 'ok') {
      logger.error('Failed to fetch news feed.');
      logger.error(`API Error: ${response.data.message || 'Unknown error'}`);
      return;
    }

    const articles = response.data.articles || [];

    if (articles.length === 0) {
      logger.warning('No articles found.');
      return;
    }

    logger.header(`Latest News - Top ${articles.length} Headlines`);

    articles.forEach((article, index) => {
      logger.log(`${(index + 1).toString().padStart(2, '0')}. ${article.title}`);
      logger.log(`    Source: ${article.source?.name || 'Unknown'} | Date: ${new Date(article.publishedAt).toLocaleDateString()}`);
      if (article.description) {
        logger.log(`    ${article.description}`);
      }
      logger.log(`    URL: ${article.url}`);
      logger.log('');
    });

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
      if (err.response.data && err.response.data.message) {
        logger.error(`Message: ${err.response.data.message}`);
      }
    } else {
      logger.error(`Failed to fetch news: ${err.message}`);
    }
  }
}

export async function newsCategoryCommand(category, limit = 5) {
  const apiKey = process.env.NEWS_API_KEY;

  if (!apiKey) {
    logger.error('NEWS_API_KEY not found in environment variables.');
    logger.info('Please add your NewsAPI.org key to the .env file.');
    return;
  }

  if (!category) {
    logger.error('Please provide a category.');
    logger.info('Usage: node index.js news-category <category>');
    logger.info('Available categories: top, general, business, entertainment, health, science, sports, technology, tech');
    return;
  }

  const normalizedCategory = category.toLowerCase();

  if (!NEWS_CATEGORIES[normalizedCategory]) {
    logger.error(`Category "${category}" not found.`);
    logger.info('Available categories: top, general, business, entertainment, health, science, sports, technology, tech');
    return;
  }

  try {
    logger.info(`Fetching latest ${category} news...`);

    // Use NewsAPI.org top-headlines endpoint with category
    const apiUrl = 'https://newsapi.org/v2/top-headlines';
    const response = await axios.get(apiUrl, {
      params: {
        apiKey: apiKey,
        country: 'us',
        category: NEWS_CATEGORIES[normalizedCategory],
        pageSize: limit,
      },
      timeout: 10000,
    });

    if (response.data.status !== 'ok') {
      logger.error('Failed to fetch news feed.');
      logger.error(`API Error: ${response.data.message || 'Unknown error'}`);
      return;
    }

    const articles = response.data.articles || [];

    if (articles.length === 0) {
      logger.warning(`No articles found for category "${category}".`);
      return;
    }

    logger.header(`${category.toUpperCase()} News - Latest ${articles.length} Headlines`);

    articles.forEach((article, index) => {
      logger.log(`${(index + 1).toString().padStart(2, '0')}. ${article.title}`);
      logger.log(`    Source: ${article.source?.name || 'Unknown'} | Date: ${new Date(article.publishedAt).toLocaleDateString()}`);
      if (article.description) {
        logger.log(`    ${article.description}`);
      }
      logger.log(`    URL: ${article.url}`);
      logger.log('');
    });

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
      if (err.response.data && err.response.data.message) {
        logger.error(`Message: ${err.response.data.message}`);
      }
    } else {
      logger.error(`Failed to fetch news: ${err.message}`);
    }
  }
}

export async function quoteCommand() {
  try {
    logger.info('Fetching a random quote...');

    const url = 'https://dummyjson.com/quotes/random';
    const response = await axios.get(url, { timeout: 10000 });

    const quote = response.data;

    logger.header('Random Quote');
    logger.log(`"${quote.quote}"`);
    logger.log(`- ${quote.author}`);

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
    } else {
      logger.error(`Failed to fetch quote: ${err.message}`);
    }
  }
}

export function registerApiCommands(program) {
  // Weather command
  program
    .command('weather <city>')
    .description('Get weather information for a city')
    .action(weatherCommand);

  // Joke command
  program
    .command('joke')
    .description('Get a random programming joke')
    .option('-r, --random', 'Get a random joke (default)')
    .action(jokeCommand);

  // Joke by category command
  program
    .command('joke-category <category>')
    .description('Get a random joke from a specific category')
    .action(jokeCategoryCommand);

  // News command
  program
    .command('news [limit]')
    .description('Get latest news headlines from all categories')
    .option('-l, --limit <number>', 'Number of articles to show', '5')
    .action((limit) => {
      const count = parseInt(limit) || 5;
      newsCommand(count);
    });

  // News by category command
  program
    .command('news-category <category>')
    .description('Get latest news from a specific category')
    .action((category) => {
      newsCategoryCommand(category, 5);
    });

  // Quote command
  program
    .command('quote')
    .description('Get a random quote')
    .action(quoteCommand);
}
