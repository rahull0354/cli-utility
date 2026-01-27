import chalk from 'chalk';

export function info(message) {
  console.log(chalk.blue('ℹ'), chalk.blue(message));
}

export function success(message) {
  console.log(chalk.green('✓'), chalk.green(message));
}

export function error(message) {
  console.error(chalk.red('✗'), chalk.red(message));
}

export function warning(message) {
  console.log(chalk.yellow('⚠'), chalk.yellow(message));
}

export function log(message) {
  console.log(message);
}

export function header(title) {
  console.log('\n' + chalk.bold.cyan(`=== ${title} ===`));
}

export default {
  info,
  success,
  error,
  warning,
  log,
  header
};