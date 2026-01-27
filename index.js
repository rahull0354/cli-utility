import { Command } from 'commander';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

import { registerCompressCommands } from './commands/compress.js';
import { registerStringCommands } from './commands/string.js';
import { registerApiCommands } from './commands/api.js';

dotenv.config();

const program = new Command();

program
  .name('cli-utility')
  .description('A beginner-friendly CLI tool with file compression, string manipulation, and API integration')
  .addHelpText('after', `
Examples:
  $ node index.js uppercase "hello world"
  $ node index.js compress examples/sample.txt
  $ node index.js weather "London"
  $ node index.js joke
  `);

// Register file compression commands (compress, decompress, compress-info)
registerCompressCommands(program);

// Register string manipulation commands (uppercase, lowercase, wordcount, etc.)
registerStringCommands(program);

// Register API integration commands (weather, joke, news, quote)
registerApiCommands(program);

program.configureOutput({
  writeErr: (str) => {
    logger.error(str);
  },
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export default program;