# Quick Start Guide

## Installation

1. **Install globally:**
   ```bash
   npm install -g @rupeshpanwar/security-scanner-mcp
   ```

2. **Or use with npx (no installation required):**
   ```bash
   npx @rupeshpanwar/security-scanner-mcp
   ```

## Configure Claude Desktop

### macOS
1. Open Terminal
2. Edit the configuration file:
   ```bash
   nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

3. Add the security scanner server:
   ```json
   {
     "mcpServers": {
       "security-scanner": {
         "command": "npx",
         "args": ["@rupeshpanwar/security-scanner-mcp"]
       }
     }
   }
   ```

4. Save and restart Claude Desktop

### Windows
1. Open the configuration file at:
   ```
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. Add the same configuration as above

3. Save and restart Claude Desktop

## First Scan

Once configured, you can start using the security scanner in Claude:

1. **Basic scan:**
   ```
   Scan my current project directory for security issues
   ```

2. **Check for secrets:**
   ```
   Check if this code contains any secrets:
   [paste your code]
   ```

3. **Get security tips:**
   ```
   Give me security best practices for handling API keys
   ```

## Common Commands

- `Scan /path/to/repo` - Full security scan
- `Check this content for secrets: [content]` - Quick secret check
- `Analyze my .gitignore file` - Check for missing patterns
- `Get security tips about docker` - Best practices

## Troubleshooting

If the server doesn't appear in Claude:

1. Check the configuration file path is correct
2. Ensure JSON syntax is valid (no trailing commas)
3. Restart Claude Desktop completely
4. Check if npx is in your PATH

## Next Steps

- Run a full scan on your most important repository
- Set up pre-commit hooks to prevent secret commits
- Review all HIGH and CRITICAL findings immediately
- Add recommended patterns to your .gitignore