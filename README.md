# CLI Utility Tool

A beginner-friendly command-line interface tool built with Node.js that provides file compression, string manipulation, and API integration features.

## Features

- **File Compression**: Compress and decompress files using gzip
- **String Manipulation**: Transform and analyze text with various utilities
- **API Integration**: Fetch data from public APIs (weather, jokes, news)

## Prerequisites

- Node.js version 14.0.0 or higher
- npm (comes with Node.js)

## Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd cli-utility
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the CLI tool using Node.js:

```bash
node index.js [command] [options]
```

### Available Commands

#### File Compression

```bash
# Compress a file to .gz format
node index.js compress <filename>

# Decompress a .gz file
node index.js decompress <filename>
```

**Examples:**
```bash
node index.js compress examples/sample.txt
node index.js decompress examples/sample.txt.gz
```

#### String Manipulation

```bash
# Convert text to uppercase
node index.js uppercase <text>

# Convert text to lowercase
node index.js lowercase <text>

# Count words in text
node index.js wordcount <text>

# Check if text is a palindrome
node index.js palindrome <text>

# Reverse text
node index.js reverse <text>
```

**Examples:**
```bash
node index.js uppercase "hello world"
node index.js wordcount "The quick brown fox"
node index.js palindrome "racecar"
node index.js reverse "hello world"
```

#### API Integration

```bash
# Get weather information for a city
node index.js weather <city>

# Get a random joke
node index.js joke

# Get latest space news headlines
node index.js news
```

**Examples:**
```bash
node index.js weather London
node index.js joke
node index.js news
```

### Help

```bash
# Show all available commands
node index.js --help

# Show help for a specific command
node index.js compress --help
node index.js weather --help
```

## Project Structure

```
cli-utility/
├── package.json          # Project configuration and dependencies
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment variables template
├── .gitignore           # Files to exclude from Git
├── README.md            # This file
├── index.js             # Main entry point (CLI router)
├── utils/
│   ├── logger.js        # Logging utility with colors
│   └── helpers.js       # Helper functions for file operations
├── commands/
│   ├── compress.js      # File compression/decompression commands
│   ├── string.js        # String manipulation commands
│   └── api.js           # API integration commands
└── examples/            # Example files for testing
    ├── sample.txt       # Sample text file
    └── test.json        # Sample JSON file
```

## Learning Objectives

This project is designed to teach:
- Node.js project setup and configuration
- Working with npm packages and dependencies
- File system operations in Node.js
- Command-line argument parsing with Commander.js
- Making HTTP requests to APIs with Axios
- Environment configuration with .env files
- Error handling and logging
- Working with streams for file compression

## Dependencies

- **commander**: CLI argument parsing library
- **axios**: HTTP client for making API requests
- **chalk**: Terminal string styling (colors)
- **dotenv**: Loads environment variables from .env file

## Configuration

Copy `.env.example` to `.env` and customize as needed:

```bash
cp .env.example .env
```

## Error Handling

The tool includes comprehensive error handling:
- File existence validation
- API error handling with helpful messages
- Input validation for all commands
- Clear error messages with suggestions

## Examples

Test the tool with provided example files:

```bash
# Test compression
node index.js compress examples/sample.txt
node index.js decompress examples/sample.txt.gz

# Test string operations
node index.js uppercase "hello world"
node index.js palindrome "racecar"
node index.js wordcount "The quick brown fox jumps over the lazy dog"

# Test API commands
node index.js weather "New York"
node index.js joke
```

## License

MIT

## Contributing

This is a learning project. Feel free to fork, modify, and use it for educational purposes!
