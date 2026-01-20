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

    // wttr.in provides weather data in multiple formats
    // We use format=j1 to get JSON data
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const response = await axios.get(url, { timeout: 10000 });

    const data = response.data;

    // Check if nearest_area exists
    if (!data.nearest_area || data.nearest_area.length === 0) {
      logger.error('Location not found.');
      return;
    }

    const location = data.nearest_area[0];

    // Try to get current conditions (available for some locations)
    let current;
    if (data.current_condition && data.current_condition.length > 0) {
      current = data.current_condition[0];
    } else if (data.weather && data.weather.length > 0 && data.weather[0].hourly) {
      // For locations without current_condition, use hourly data from weather array
      const hourly = data.weather[0].hourly;
      // Get current hour to find closest data point
      const currentHour = new Date().getHours();
      // Each hourly entry has a 'time' field in minutes from midnight (0, 300, 600, etc.)
      // Find the entry closest to current time
      const currentMinutes = currentHour * 60;
      let closestHour = hourly[0];
      let minDiff = Infinity;

      for (const h of hourly) {
        const diff = Math.abs(parseInt(h.time) - currentMinutes);
        if (diff < minDiff) {
          minDiff = diff;
          closestHour = h;
        }
      }
      current = closestHour;
    } else {
      logger.error('Weather data not available for this location.');
      return;
    }

    logger.header('Weather Information');
    logger.log(`Location:    ${location.areaName[0].value}, ${location.country[0].value}`);

    // Handle both current_condition and hourly data structures
    // Note: hourly data uses 'tempC' while current_condition uses 'temp_C'
    const tempC = current.temp_C || current.tempC || current.avgtempC || 'N/A';
    const tempF = current.temp_F || current.tempF || current.avgtempF || 'N/A';
    const feelsLikeC = current.FeelsLikeC || current.HeatIndexC || current.chillometerC || tempC;
    const feelsLikeF = current.FeelsLikeF || current.HeatIndexF || current.chillometerF || tempF;
    const condition = current.weatherDesc ? (Array.isArray(current.weatherDesc) ? current.weatherDesc[0].value : current.weatherDesc) : 'N/A';
    const humidity = current.humidity || 'N/A';
    const windSpeed = current.windspeedKmph || current.windspeedMiles || 'N/A';
    const windDir = current.winddir16Point || current.winddir || '';

    logger.log(`Temperature: ${tempC}°C (${tempF}°F)`);
    logger.log(`Feels Like:  ${feelsLikeC}°C (${feelsLikeF}°F)`);
    logger.log(`Condition:   ${condition}`);
    logger.log(`Humidity:    ${humidity}%`);
    logger.log(`Wind:        ${windSpeed} km/h ${windDir ? `(${windDir})` : ''}`);

    if (current.uvIndex !== undefined) {
      logger.log(`UV Index:    ${current.uvIndex}`);
    }

    if (current.observation_time) {
      logger.log('');
      logger.log(`Last updated: ${current.observation_time}`);
    }

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

// News category mappings for different RSS feeds
const NEWS_CATEGORIES = {
  'top': 'http://rss.cnn.com/rss/cnn_topstories.rss',
  'us': 'http://rss.cnn.com/rss/cnn_us.rss',
  'world': 'http://rss.cnn.com/rss/cnn_world.rss',
  'technology': 'http://rss.cnn.com/rss/cnn_tech.rss',
  'tech': 'http://rss.cnn.com/rss/cnn_tech.rss',
  'health': 'http://rss.cnn.com/rss/cnn_health.rss',
  'entertainment': 'http://rss.cnn.com/rss/cnn_showbiz.rss',
  'showbiz': 'http://rss.cnn.com/rss/cnn_showbiz.rss',
  'politics': 'http://rss.cnn.com/rss/cnn_allpolitics.rss',
  'travel': 'http://rss.cnn.com/rss/cnn_travel.rss',
  'business': 'http://rss.cnn.com/rss/money_latest.rss',
  'sport': 'http://feeds.bbci.co.uk/sport/rss.xml',
  'sports': 'http://feeds.bbci.co.uk/sport/rss.xml',
  'science': 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'music': 'https://www.nme.com/news/music/feed',
};

export async function newsCommand(limit = 5) {
  try {
    logger.info('Fetching latest news from all categories...');

    // Get top stories using rss2json
    const rssUrl = NEWS_CATEGORIES['top'];
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });

    if (response.data.status !== 'ok') {
      logger.error('Failed to fetch news feed.');
      return;
    }

    const items = response.data.items || [];
    const articles = items.slice(0, limit);

    if (articles.length === 0) {
      logger.warning('No articles found.');
      return;
    }

    logger.header(`Latest News - Top ${articles.length} Headlines (All Categories)`);

    articles.forEach((article, index) => {
      logger.log(`${(index + 1).toString().padStart(2, '0')}. ${article.title}`);
      logger.log(`    Source: CNN | Date: ${new Date(article.pubDate).toLocaleDateString()}`);
      logger.log(`    URL: ${article.link}`);
      logger.log('');
    });

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
    } else {
      logger.error(`Failed to fetch news: ${err.message}`);
    }
  }
}

export async function newsCategoryCommand(category, limit = 5) {
  if (!category) {
    logger.error('Please provide a category.');
    logger.info('Usage: node index.js news-category <category>');
    logger.info('Available categories: top, us, world, technology, tech, health, entertainment, showbiz, politics, travel, business, sport, sports, science, music');
    return;
  }

  const normalizedCategory = category.toLowerCase();

  if (!NEWS_CATEGORIES[normalizedCategory]) {
    logger.error(`Category "${category}" not found.`);
    logger.info('Available categories: top, us, world, technology, tech, health, entertainment, showbiz, politics, travel, business, sport, sports, science, music');
    return;
  }

  try {
    logger.info(`Fetching latest ${category} news...`);

    // Get category-specific news using rss2json
    const rssUrl = NEWS_CATEGORIES[normalizedCategory];
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });

    if (response.data.status !== 'ok') {
      logger.error('Failed to fetch news feed.');
      return;
    }

    const items = response.data.items || [];
    const articles = items.slice(0, limit);

    if (articles.length === 0) {
      logger.warning(`No articles found for category "${category}".`);
      return;
    }

    // Determine source based on RSS URL
    let source = 'News';
    if (rssUrl.includes('cnn')) source = 'CNN';
    else if (rssUrl.includes('bbci')) source = 'BBC';
    else if (rssUrl.includes('nme')) source = 'NME';

    logger.header(`${category.toUpperCase()} News - Latest ${articles.length} Headlines`);

    articles.forEach((article, index) => {
      logger.log(`${(index + 1).toString().padStart(2, '0')}. ${article.title}`);
      logger.log(`    Source: ${source} | Date: ${new Date(article.pubDate).toLocaleDateString()}`);
      logger.log(`    URL: ${article.link}`);
      logger.log('');
    });

  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      logger.error('Request timed out. Please check your internet connection.');
    } else if (err.response) {
      logger.error(`API error: ${err.response.status} ${err.response.statusText}`);
    } else {
      logger.error(`Failed to fetch news: ${err.message}`);
    }
  }
}

export async function quoteCommand() {
  try {
    logger.info('Fetching a random quote...');

    // Using DummyJSON Quotes API - free, no authentication required
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
