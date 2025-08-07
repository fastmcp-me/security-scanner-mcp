# Publishing Security Scanner MCP to NPM

## Prerequisites

1. **NPM Account**: Create an account at https://www.npmjs.com/signup
2. **Authenticate**: Login to npm from terminal:
   ```bash
   npm login
   ```

## Pre-Publishing Checklist

### 1. Initialize Git Repository
```bash
cd /Users/rupeshpanwar/Documents/Project/Bundle/security-scanner-mcp
git init
git add .
git commit -m "Initial commit: Security Scanner MCP v1.0.0"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Create repository named `security-scanner-mcp`
3. Push your code:
   ```bash
   git remote add origin https://github.com/rupeshpanwar/security-scanner-mcp.git
   git branch -M main
   git push -u origin main
   ```

### 3. Update package.json
Add the following fields to your package.json:
```json
{
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rupeshpanwar/security-scanner-mcp.git"
  },
  "bugs": {
    "url": "https://github.com/rupeshpanwar/security-scanner-mcp/issues"
  },
  "homepage": "https://github.com/rupeshpanwar/security-scanner-mcp#readme",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 4. Build the Project
```bash
npm run build
```

### 5. Test Locally
```bash
# Test the built package
npm link
npx security-scanner-mcp

# Run tests
npm test
```

### 6. Create .npmignore
```bash
cat > .npmignore << 'EOF'
src/
test/
examples/
scripts/
jest.config.js
tsconfig.json
.git/
.gitignore
*.log
.DS_Store
node_modules/
*.test.js
*.test.ts
PUBLISHING.md
EOF
```

## Publishing to NPM

### First-time Publishing

1. **Check package name availability**:
   ```bash
   npm view @rupeshpanwar/security-scanner-mcp
   ```
   If it returns "404 Not Found", the name is available.

2. **Publish as public package**:
   ```bash
   npm publish --access public
   ```

### Updating the Package

1. **Update version** (following semantic versioning):
   ```bash
   # For bug fixes
   npm version patch  # 1.0.0 → 1.0.1
   
   # For new features (backward compatible)
   npm version minor  # 1.0.0 → 1.1.0
   
   # For breaking changes
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Commit version update**:
   ```bash
   git add package.json package-lock.json
   git commit -m "Release v$(node -p "require('./package.json').version")"
   git push origin main
   ```

3. **Create GitHub release tag**:
   ```bash
   git tag v$(node -p "require('./package.json').version")
   git push origin --tags
   ```

4. **Publish update to NPM**:
   ```bash
   npm publish --access public
   ```

## Post-Publishing

### 1. Verify Installation
```bash
# Test global installation
npm install -g @rupeshpanwar/security-scanner-mcp
security-scanner-mcp

# Test npx usage
npx @rupeshpanwar/security-scanner-mcp
```

### 2. Update MCP Directory
Submit your tool to the official MCP directory:
1. Go to https://github.com/modelcontextprotocol/servers
2. Fork the repository
3. Add your server to the appropriate category in README.md
4. Submit a pull request

### 3. Create Demo & Documentation

Create a demo video or GIF showing:
- Installation process
- Claude Desktop configuration
- Running security scans
- Example outputs

### 4. Announce on Social Media

Example announcement:
```
🚀 Just published Security Scanner MCP - a comprehensive security tool for code repositories!

✅ Detect exposed secrets & API keys
✅ Find security vulnerabilities
✅ Audit dependencies
✅ Analyze git history for issues

Works seamlessly with @ClaudeAI Desktop!

npm: npmjs.com/package/@rupeshpanwar/security-scanner-mcp
GitHub: github.com/rupeshpanwar/security-scanner-mcp

#MCP #Security #OpenSource #DevSecOps
```

## Maintenance

### Regular Updates
1. **Monitor issues**: Check GitHub issues regularly
2. **Update dependencies**: Run `npm audit` and update packages
3. **Add new patterns**: Update security patterns as new threats emerge

### Version Management
- **Patch releases** (1.0.x): Bug fixes, pattern updates
- **Minor releases** (1.x.0): New features, additional scanners
- **Major releases** (x.0.0): Breaking changes, API modifications

## Troubleshooting

### Common Issues

1. **"402 Payment Required"**: 
   - Ensure you're using `--access public` flag
   - Scoped packages (@username/package) are private by default

2. **"403 Forbidden"**:
   - Verify npm authentication: `npm whoami`
   - Check package name conflicts

3. **Build errors**:
   ```bash
   # Clean and rebuild
   rm -rf dist/ node_modules/
   npm install
   npm run build
   ```

4. **Testing MCP connection**:
   ```bash
   # Test the MCP server directly
   echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npx @rupeshpanwar/security-scanner-mcp
   ```

## Community Engagement

1. **Documentation**: Keep README.md updated with examples
2. **Respond to issues**: Address GitHub issues promptly
3. **Accept contributions**: Create CONTRIBUTING.md guidelines
4. **Security updates**: Use GitHub's security advisories for vulnerabilities

## License Considerations

Your package uses MIT license, which:
- Allows commercial use
- Allows modification
- Requires license and copyright notice
- Provides no warranty

This is ideal for open-source developer tools.

---

## Quick Commands Reference

```bash
# First time setup
npm login
git init
npm run build
npm publish --access public

# Updates
npm version patch
git push origin main --tags
npm publish

# Maintenance
npm audit
npm update
npm test
```

Good luck with publishing your security scanner! This tool will help many developers identify and fix security issues in their code. 🚀