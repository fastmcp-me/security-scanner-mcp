# Security Scanner MCP Examples

## Example 1: Full Repository Scan

**User**: Scan the repository at /Users/rupeshpanwar/Documents/Project/myapp for security issues

**Assistant**: I'll scan your repository for security issues.

```
[Using security scanner to scan /Users/rupeshpanwar/Documents/Project/myapp]

🔍 Security Scan Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Repository: myapp
Scan Date: 2024-08-04T15:30:00.000Z

Issues Found:
  🔴 Critical: 2
  🟠 High: 5
  🟡 Medium: 12
  🔵 Low: 8
  ℹ️  Info: 3
  📊 Total: 30
```

I found 30 security issues in your repository. The 2 critical issues need immediate attention - they appear to be exposed AWS credentials in your .env file.

## Example 2: Check Content for Secrets

**User**: Can you check if this configuration is safe to commit?

```javascript
const config = {
  apiUrl: 'https://api.example.com',
  apiKey: 'sk-1234567890abcdef1234567890abcdef1234567890abcdef',
  database: 'mongodb://admin:password123@localhost:27017/mydb'
};
```

**Assistant**: I'll check this configuration for any security issues.

```
[Using security scanner to check content]

⚠️ Found 3 potential secret(s):

• OpenAI API Key: sk-1234567890abcdef1234567890abcd...
  Line: 3
  Severity: high

• Generic Secret: apiKey: 'sk-1234567890abcdef12345678...
  Line: 3
  Severity: medium

• Database URL: mongodb://admin:password123@localhos...
  Line: 4
  Severity: critical
```

**This configuration is NOT safe to commit!** It contains:
1. An API key that appears to be for OpenAI
2. A MongoDB connection string with credentials

You should use environment variables instead.

## Example 3: Analyze .gitignore

**User**: Check if my .gitignore file has all the necessary security patterns

**Assistant**: I'll analyze your .gitignore file for security patterns.

```
[Using security scanner to check .gitignore]

📋 .gitignore Analysis

⚠️ Missing recommended patterns:
  • .env.*
  • *.pem
  • *.key
  • .aws/
  • **/secrets/
  • config.json

💡 Suggestions:
  • Add .env and .env.* patterns to prevent credential exposure
```

Your .gitignore is missing several important security patterns. I recommend adding these patterns to prevent accidentally committing sensitive files.

## Example 4: Get Security Tips

**User**: Give me best practices for managing secrets in my code

**Assistant**: Here are security best practices for managing secrets:

```
[Using security scanner to get security tips]

🔒 Security Best Practices: SECRETS

1. Never commit API keys, passwords, or tokens to version control
2. Use environment variables for all sensitive configuration
3. Implement pre-commit hooks with tools like git-secrets or pre-commit
4. Rotate credentials immediately if exposed
5. Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
6. Add .env files to .gitignore before creating them
7. Use .env.example files to document required variables without values
8. Scan git history regularly for accidentally committed secrets
9. Use different credentials for development and production
10. Implement least-privilege access for all API keys
```

## Example 5: Detailed Scan with Specific Categories

**User**: Scan just for secrets and dependencies in /path/to/project and give me a detailed report

**Assistant**: I'll perform a focused scan on secrets and dependencies with a detailed report.

```
[Using security scanner with categories: ["secrets", "dependencies"]]

🔒 SECURITY SCAN REPORT
================================================================================
Repository: project
Scan Date: 2024-08-04T15:45:00.000Z
Scanner Version: 1.0.0
================================================================================

📊 SUMMARY
--------------------------------------------------------------------------------
Critical Issues: 1
High Issues: 3
Medium Issues: 5
Low Issues: 2
Info Issues: 0
Total Issues: 11

## SECRETS
--------------------------------------------------------------------------------

### CRITICAL Severity:
• Potential AWS Secret Key found
  Found in config/prod.js at line 15

### HIGH Severity:
• Potential AWS Access Key found
  Found in .env.production at line 3

• Potential API Key Generic found
  Found in src/services/api.js at line 42

## DEPENDENCIES
--------------------------------------------------------------------------------

### HIGH Severity:
• Wildcard version dependency
  lodash: * - Using wildcard versions can lead to unexpected breaking changes

### MEDIUM Severity:
• Unpinned Python dependency
  requests - Dependencies should be pinned to specific versions

## RECOMMENDATIONS
--------------------------------------------------------------------------------
🚨 CRITICAL: Address critical issues immediately!

1. Rotate any exposed credentials immediately
2. Add all sensitive files to .gitignore
3. Remove secrets from git history using git filter-branch
4. Use environment variables or secret management services
5. Run dependency updates regularly
6. Implement pre-commit hooks to prevent secret commits
```

The scan found 11 security issues, with 1 critical issue that needs immediate attention.