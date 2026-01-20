import logger from '../utils/logger.js';

export function uppercaseCommand(text) {
  if (!text) {
    logger.error('Please provide text to convert.');
    logger.info('Usage: node index.js uppercase "<text>"');
    return;
  }

  const result = text.toUpperCase();
  logger.success('Converted to uppercase:');
  logger.log(result);
}

export function lowercaseCommand(text) {
  if (!text) {
    logger.error('Please provide text to convert.');
    logger.info('Usage: node index.js lowercase "<text>"');
    return;
  }

  const result = text.toLowerCase();
  logger.success('Converted to lowercase:');
  logger.log(result);
}

export function titlecaseCommand(text) {
  if (!text) {
    logger.error('Please provide text to convert.');
    logger.info('Usage: node index.js titlecase "<text>"');
    return;
  }

  const result = text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  logger.success('Converted to title case:');
  logger.log(result);
}

export function wordcountCommand(text) {
  if (!text) {
    logger.error('Please provide text to analyze.');
    logger.info('Usage: node index.js wordcount "<text>"');
    return;
  }

  // Remove extra whitespace and split into words
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Count characters (with and without spaces)
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  // Count sentences (ends with . ! or ?)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  // Calculate average word length
  const totalLetters = words.join('').length;
  const avgWordLength = wordCount > 0 ? (totalLetters / wordCount).toFixed(2) : 0;

  // Find the longest word
  const longestWord = words.reduce((longest, current) =>
    current.length > longest.length ? current : longest, '');

  logger.header('Word Count Statistics');
  logger.log(`Words:         ${wordCount}`);
  logger.log(`Characters:    ${charCount}`);
  logger.log(`No Spaces:     ${charCountNoSpaces}`);
  logger.log(`Sentences:     ${sentenceCount}`);
  logger.log(`Avg Word Len:  ${avgWordLength}`);
  logger.log(`Longest Word:  ${longestWord} (${longestWord.length} letters)`);
}

export function palindromeCommand(text) {
  if (!text) {
    logger.error('Please provide text to check.');
    logger.info('Usage: node index.js palindrome "<text>"');
    return;
  }

  // Remove non-alphanumeric characters and convert to lowercase
  const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');

  if (cleaned === reversed) {
    logger.success(`"${text}" is a palindrome!`);
    logger.log(`Normalized: ${cleaned}`);
  } else {
    logger.warning(`"${text}" is NOT a palindrome.`);
    logger.log(`Normalized: ${cleaned}`);
    logger.log(`Reversed:   ${reversed}`);
  }
}

export function reverseCommand(text) {
  if (!text) {
    logger.error('Please provide text to reverse.');
    logger.info('Usage: node index.js reverse "<text>"');
    return;
  }

  const reversed = text.split('').reverse().join('');
  logger.success('Reversed text:');
  logger.log(reversed);
}

export function registerStringCommands(program) {
  // Uppercase command
  program
    .command('uppercase <text>')
    .description('Convert text to UPPERCASE')
    .action(uppercaseCommand);

  // Lowercase command
  program
    .command('lowercase <text>')
    .description('Convert text to lowercase')
    .action(lowercaseCommand);

  // Title case command
  program
    .command('titlecase <text>')
    .description('Convert text to Title Case')
    .action(titlecaseCommand);

  // Word count command
  program
    .command('wordcount <text>')
    .description('Count words and show statistics')
    .action(wordcountCommand);

  // Palindrome check command
  program
    .command('palindrome <text>')
    .description('Check if text is a palindrome')
    .action(palindromeCommand);

  // Reverse command
  program
    .command('reverse <text>')
    .description('Reverse the text')
    .action(reverseCommand);
}