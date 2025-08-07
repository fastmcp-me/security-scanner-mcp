# Contributing to Security Scanner MCP

Thank you for your interest in contributing to Security Scanner MCP! This tool helps developers identify security vulnerabilities in their code, and your contributions can help make it even better.

## How to Contribute

### Reporting Issues

1. Check if the issue already exists in [GitHub Issues](https://github.com/rupeshpanwar/security-scanner-mcp/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version)

### Suggesting Features

1. Open a [Feature Request](https://github.com/rupeshpanwar/security-scanner-mcp/issues/new)
2. Describe the feature and its benefits
3. Provide use cases and examples

### Contributing Code

#### 1. Fork and Clone
```bash
git clone https://github.com/YOUR_USERNAME/security-scanner-mcp.git
cd security-scanner-mcp
npm install
```

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 3. Make Changes
- Follow existing code style
- Add tests for new features
- Update documentation

#### 4. Test Your Changes
```bash
npm run build
npm test
npm run dev  # Test locally
```

#### 5. Commit with Conventional Commits
```bash
git commit -m "feat: add new security pattern for AWS credentials"
git commit -m "fix: correct false positive in JWT detection"
git commit -m "docs: update README with new examples"
```

#### 6. Push and Create PR
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## Adding New Security Patterns

To add new security patterns, edit `src/scanner.ts`:

```typescript
// Example: Adding a new API key pattern
{
  pattern: /new-api-key-pattern/gi,
  type: 'api-key',
  severity: 'high',
  message: 'Potential New API Key exposed'
}
```

### Pattern Guidelines
- Use case-insensitive regex when appropriate
- Avoid overly broad patterns that cause false positives
- Include clear, actionable messages
- Set appropriate severity levels:
  - `critical`: Immediate security risk
  - `high`: Significant vulnerability
  - `medium`: Potential issue
  - `low`: Best practice violation

## Code Style

- Use TypeScript
- Follow existing formatting (2 spaces, no semicolons where optional)
- Add JSDoc comments for public functions
- Keep functions small and focused

## Testing

### Running Tests
```bash
npm test           # Run all tests
npm test -- --watch  # Watch mode
npm test -- --coverage  # With coverage
```

### Writing Tests
- Add tests for new features in `test/`
- Test both positive and negative cases
- Include edge cases

Example test:
```javascript
describe('SecurityScanner', () => {
  test('should detect AWS access keys', () => {
    const content = 'AKIA1234567890ABCDEF';
    const result = scanner.checkContent(content);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].type).toBe('aws-access-key');
  });
});
```

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments for new functions
- Include examples for new features
- Update CHANGELOG.md (if exists)

## Pull Request Process

1. **PR Title**: Use conventional commit format
2. **Description**: Explain what and why
3. **Testing**: Describe how you tested
4. **Screenshots**: Include if UI/output changes
5. **Review**: Address feedback promptly

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Local Development
```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode
npm run dev

# Test with Claude Desktop
# Update your claude_desktop_config.json to point to local build
{
  "mcpServers": {
    "security-scanner": {
      "command": "node",
      "args": ["/path/to/security-scanner-mcp/dist/index.js"]
    }
  }
}
```

## Security Reporting

If you discover a security vulnerability in the tool itself:
1. DO NOT open a public issue
2. Email: rupesh.panwar@laconicglobal.com
3. Include: description, impact, steps to reproduce

## Community

- Be respectful and inclusive
- Help others in issues and discussions
- Share your use cases and success stories
- Spread the word about the tool

## Recognition

Contributors will be recognized in:
- README.md Contributors section
- GitHub contributors page
- Release notes

Thank you for helping make code more secure! 🔒