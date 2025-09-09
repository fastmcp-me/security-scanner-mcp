[![Add to Cursor](https://fastmcp.me/badges/cursor_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)
[![Add to VS Code](https://fastmcp.me/badges/vscode_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)
[![Add to Claude](https://fastmcp.me/badges/claude_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)
[![Add to ChatGPT](https://fastmcp.me/badges/chatgpt_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)
[![Add to Codex](https://fastmcp.me/badges/codex_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)
[![Add to Gemini](https://fastmcp.me/badges/gemini_dark.svg)](https://fastmcp.me/MCP/Details/929/security-scanner)

# Security Scanner MCP Server

A comprehensive security scanning tool for code repositories, exposed as an MCP (Model Context Protocol) server. This tool helps developers identify security vulnerabilities, exposed secrets, dependency issues, and configuration problems in their codebases.

## Features

- **Secret Detection**: Scans for exposed API keys, passwords, tokens, and other sensitive information
- **Vulnerability Analysis**: Identifies common security vulnerabilities in code
- **Dependency Auditing**: Checks for outdated or vulnerable dependencies
- **Git Security**: Analyzes .gitignore files and git history for security issues
- **Real-time Scanning**: Check content for secrets before committing
- **Security Best Practices**: Provides actionable security recommendations

## Installation

```bash
npm install -g @rupeshpanwar/security-scanner-mcp
```

Or use with `npx`:

```bash
npx @rupeshpanwar/security-scanner-mcp
```

## CLI Usage (NEW in v1.1.0)

The package now includes a standalone CLI tool for direct command-line scanning:

```bash
# Scan a directory with summary output
security-scan scan /path/to/project

# Scan with detailed output
security-scan scan /path/to/project --format detailed

# Scan specific categories
security-scan scan /path/to/project --categories secrets vulnerabilities

# Output as JSON
security-scan scan /path/to/project --format json

# Save report to file
security-scan scan /path/to/project --format detailed > security-report.txt
```

### CLI Options:
- `--format <format>`: Output format (summary|detailed|json), default: summary
- `--categories <categories...>`: Specific categories to scan (secrets|vulnerabilities|dependencies|gitignore|git-history), default: all

## Usage with Claude Desktop

Add the server to your Claude Desktop configuration:

### macOS
Edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

### Windows
Edit `%APPDATA%\Claude\claude_desktop_config.json`:

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

## Available Tools

### 1. scan_repository
Performs a comprehensive security scan on a repository.

**Parameters:**
- `path` (required): Path to the repository to scan
- `outputFormat` (optional): Output format - "summary", "detailed", or "json" (default: "summary")
- `categories` (optional): Specific categories to scan (default: all)
  - "secrets": API keys, passwords, tokens
  - "vulnerabilities": Code vulnerabilities
  - "dependencies": Dependency issues
  - "gitignore": .gitignore analysis
  - "git-history": Git history scanning

**Example:**
```
Scan the repository at /path/to/repo for all security issues
```

### 2. check_secret
Checks if a piece of content contains potential secrets or sensitive information.

**Parameters:**
- `content` (required): Content to check for secrets
- `fileType` (optional): File type/extension for context-aware scanning

**Example:**
```
Check this content for secrets: AWS_ACCESS_KEY=AKIA1234567890ABCDEF
```

### 3. check_gitignore
Analyzes .gitignore file for missing security patterns.

**Parameters:**
- `path` (required): Path to the repository
- `patterns` (optional): Additional patterns to check for

**Example:**
```
Check if the .gitignore in /path/to/repo has all recommended security patterns
```

### 4. get_security_tips
Get security best practices and tips for a specific topic.

**Parameters:**
- `topic` (required): Security topic
  - "secrets": Secret management best practices
  - "gitignore": .gitignore recommendations
  - "dependencies": Dependency security
  - "docker": Docker security
  - "ci-cd": CI/CD security
  - "general": General security tips

**Example:**
```
Give me security tips about secrets management
```

## Security Patterns Detected

### Secrets
- AWS Access Keys and Secret Keys
- API Keys (OpenAI, Google, GitHub, etc.)
- Private Keys (SSH, SSL certificates)
- Database connection strings
- OAuth tokens
- JWT tokens
- And many more...

### Vulnerabilities
- SQL injection risks
- Command injection risks
- Hardcoded IPs and credentials
- Weak cryptography usage
- Insecure deserialization
- Debug code in production
- Insecure random number generation

### Configuration Issues
- Missing .gitignore patterns
- Exposed configuration files
- Temporary file usage
- HTTP without TLS

## Example Workflow

1. **Initial Repository Scan**
   ```
   Scan the repository at ./my-project and show me a detailed report
   ```

2. **Check Code Before Committing**
   ```
   Check this config file for any secrets:
   [paste your config content]
   ```

3. **Fix .gitignore Issues**
   ```
   Check my .gitignore file and tell me what security patterns I'm missing
   ```

4. **Get Security Recommendations**
   ```
   Give me best practices for managing secrets in my codebase
   ```

## Output Formats

### Summary Format
Quick overview showing count of issues by severity level.

### Detailed Format
Complete listing of all findings with:
- Issue description
- File location and line number
- Severity level
- Remediation recommendations

### JSON Format
Machine-readable format for integration with other tools.

## Best Practices

1. **Run Regular Scans**: Integrate into your CI/CD pipeline
2. **Fix Critical Issues First**: Address high and critical severity findings immediately
3. **Update .gitignore**: Ensure all sensitive file patterns are excluded
4. **Rotate Exposed Secrets**: If any secrets are found, rotate them immediately
5. **Keep Dependencies Updated**: Regular dependency updates reduce vulnerabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

This tool was created after discovering exposed credentials in production code. It aims to help developers prevent similar security incidents by providing proactive scanning and education about security best practices.