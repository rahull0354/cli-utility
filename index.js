import { Command } from 'commander';
import dotenv from 'dotenv';
import logger from './utils/logger.js';

// Import command registration functions from each module
// These functions register their commands with the Commander program
import { registerCompressCommands } from './commands/compress.js';
import { registerStringCommands } from './commands/string.js';
import { registerApiCommands } from './commands/api.js';

// Load environment variables from .env file (if it exists)
// This allows configuration without hardcoding values
dotenv.config();

const program = new Command();

program
  .name('cli-utility')              // Name of the CLI tool
  .description('A beginner-friendly CLI tool with file compression, string manipulation, and API integration')  // Description shown in help
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
    // Custom error output using our logger
    logger.error(str);
  },
});

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

export default program;