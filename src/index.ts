#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { SecurityScanner } from './scanner.js';
import { promises as fs } from 'fs';
import path from 'path';

// Tool schemas
const ScanRepositorySchema = z.object({
  path: z.string().describe('Path to the repository to scan'),
  outputFormat: z.enum(['summary', 'detailed', 'json']).optional().default('summary').describe('Output format for the scan results'),
  categories: z.array(z.enum(['secrets', 'vulnerabilities', 'dependencies', 'gitignore', 'git-history'])).optional().describe('Specific categories to scan (default: all)')
});

const CheckSecretSchema = z.object({
  content: z.string().describe('Content to check for secrets'),
  fileType: z.string().optional().describe('File type/extension for context-aware scanning')
});

const CheckGitignoreSchema = z.object({
  path: z.string().describe('Path to the repository'),
  patterns: z.array(z.string()).optional().describe('Additional patterns to check for in .gitignore')
});

const GetSecurityTipsSchema = z.object({
  topic: z.enum(['secrets', 'gitignore', 'dependencies', 'docker', 'ci-cd', 'general']).describe('Security topic to get tips for')
});

// Server setup
const server = new Server({
  name: 'security-scanner-mcp',
  version: '1.0.0',
  description: 'Comprehensive security scanning for code repositories'
}, {
  capabilities: {
    tools: {}
  }
});

// Helper function to format scan results
function formatScanResults(results: any, format: string): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }
  
  let output = '';
  const { summary, findings } = results;
  
  if (format === 'summary') {
    output += `🔍 Security Scan Summary\n`;
    output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    output += `Repository: ${results.repository}\n`;
    output += `Scan Date: ${results.scanDate}\n\n`;
    output += `Issues Found:\n`;
    output += `  🔴 Critical: ${summary.critical}\n`;
    output += `  🟠 High: ${summary.high}\n`;
    output += `  🟡 Medium: ${summary.medium}\n`;
    output += `  🔵 Low: ${summary.low}\n`;
    output += `  ℹ️  Info: ${summary.info}\n`;
    output += `  📊 Total: ${summary.total}\n`;
  } else { // detailed
    output = formatDetailedResults(results);
  }
  
  return output;
}

function formatDetailedResults(results: any): string {
  let output = '';
  output += `🔒 SECURITY SCAN REPORT\n`;
  output += `${'='.repeat(80)}\n`;
  output += `Repository: ${results.repository}\n`;
  output += `Scan Date: ${results.scanDate}\n`;
  output += `Scanner Version: ${results.version}\n`;
  output += `${'='.repeat(80)}\n\n`;
  
  const { summary, findings } = results;
  
  // Summary section
  output += `📊 SUMMARY\n`;
  output += `${'-'.repeat(80)}\n`;
  output += `Critical Issues: ${summary.critical}\n`;
  output += `High Issues: ${summary.high}\n`;
  output += `Medium Issues: ${summary.medium}\n`;
  output += `Low Issues: ${summary.low}\n`;
  output += `Info Issues: ${summary.info}\n`;
  output += `Total Issues: ${summary.total}\n\n`;
  
  // Detailed findings by category
  for (const [category, categoryFindings] of Object.entries(findings)) {
    if (Array.isArray(categoryFindings) && categoryFindings.length > 0) {
      output += `\n## ${category.toUpperCase().replace(/_/g, ' ')}\n`;
      output += `${'-'.repeat(80)}\n`;
      
      // Group by severity
      const bySeverity: Record<string, any[]> = {};
      categoryFindings.forEach((finding: any) => {
        if (!bySeverity[finding.severity]) {
          bySeverity[finding.severity] = [];
        }
        bySeverity[finding.severity].push(finding);
      });
      
      // Output by severity level
      ['critical', 'high', 'medium', 'low', 'info'].forEach(severity => {
        if (bySeverity[severity] && bySeverity[severity].length > 0) {
          output += `\n### ${severity.toUpperCase()} Severity:\n`;
          bySeverity[severity].forEach(finding => {
            output += `• ${finding.title}\n`;
            output += `  ${finding.details}\n\n`;
          });
        }
      });
    }
  }
  
  // Recommendations
  output += `\n## RECOMMENDATIONS\n`;
  output += `${'-'.repeat(80)}\n`;
  if (summary.critical > 0) {
    output += `🚨 CRITICAL: Address critical issues immediately!\n\n`;
  }
  output += `1. Rotate any exposed credentials immediately\n`;
  output += `2. Add all sensitive files to .gitignore\n`;
  output += `3. Remove secrets from git history using git filter-branch\n`;
  output += `4. Use environment variables or secret management services\n`;
  output += `5. Run dependency updates regularly\n`;
  output += `6. Implement pre-commit hooks to prevent secret commits\n`;
  
  return output;
}

// Security tips database
const securityTips: Record<string, string[]> = {
  secrets: [
    "Never commit API keys, passwords, or tokens to version control",
    "Use environment variables for all sensitive configuration",
    "Implement pre-commit hooks with tools like git-secrets or pre-commit",
    "Rotate credentials immediately if exposed",
    "Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)",
    "Add .env files to .gitignore before creating them",
    "Use .env.example files to document required variables without values",
    "Scan git history regularly for accidentally committed secrets",
    "Use different credentials for development and production",
    "Implement least-privilege access for all API keys"
  ],
  gitignore: [
    "Always include .env and .env.* patterns",
    "Add *.pem, *.key, *.cert for certificate files",
    "Include .aws/ directory for AWS credentials",
    "Add node_modules/ for Node.js projects",
    "Include IDE-specific files (.vscode/, .idea/)",
    "Add build outputs (dist/, build/, *.pyc)",
    "Include OS-specific files (.DS_Store, Thumbs.db)",
    "Add backup files (*.bak, *.tmp, *~)",
    "Review .gitignore before first commit",
    "Use gitignore.io to generate comprehensive .gitignore files"
  ],
  dependencies: [
    "Run security audits regularly (npm audit, pip-audit, etc.)",
    "Keep dependencies up to date with automated tools",
    "Use lock files to ensure consistent installations",
    "Review dependency licenses for compatibility",
    "Monitor for security advisories on your dependencies",
    "Use tools like Dependabot or Renovate for automated updates",
    "Audit both direct and transitive dependencies",
    "Remove unused dependencies regularly",
    "Use security scanning in CI/CD pipelines",
    "Consider using private registries for internal packages"
  ],
  docker: [
    "Never put secrets in Dockerfile",
    "Use multi-stage builds to minimize final image size",
    "Run containers as non-root user",
    "Scan images for vulnerabilities with tools like Trivy",
    "Use specific version tags, not 'latest'",
    "Keep base images updated",
    "Use .dockerignore to exclude sensitive files",
    "Sign and verify images in production",
    "Use secrets management for runtime configuration",
    "Implement health checks in containers"
  ],
  "ci-cd": [
    "Use secure secret storage in CI/CD platforms",
    "Implement security scanning in pipelines",
    "Use least-privilege service accounts",
    "Enable audit logging for all deployments",
    "Implement approval workflows for production",
    "Scan for secrets before deployment",
    "Use ephemeral credentials when possible",
    "Implement rollback procedures",
    "Monitor for configuration drift",
    "Use infrastructure as code with security reviews"
  ],
  general: [
    "Implement defense in depth strategy",
    "Follow the principle of least privilege",
    "Regular security training for developers",
    "Implement code review process",
    "Use static analysis security testing (SAST)",
    "Implement dynamic application security testing (DAST)",
    "Regular penetration testing",
    "Maintain security incident response plan",
    "Document security policies and procedures",
    "Stay updated on security best practices"
  ]
};

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'scan_repository',
        description: 'Perform a comprehensive security scan on a repository',
        inputSchema: ScanRepositorySchema
      },
      {
        name: 'check_secret',
        description: 'Check if a piece of content contains potential secrets or sensitive information',
        inputSchema: CheckSecretSchema
      },
      {
        name: 'check_gitignore',
        description: 'Analyze .gitignore file for missing security patterns',
        inputSchema: CheckGitignoreSchema
      },
      {
        name: 'get_security_tips',
        description: 'Get security best practices and tips for a specific topic',
        inputSchema: GetSecurityTipsSchema
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'scan_repository': {
        const { path: repoPath, outputFormat, categories } = ScanRepositorySchema.parse(args);
        
        // Check if path exists
        try {
          await fs.access(repoPath);
        } catch {
          throw new Error(`Repository path does not exist: ${repoPath}`);
        }
        
        const scanner = new SecurityScanner(repoPath);
        const results = await scanner.scan(categories);
        const formatted = formatScanResults(results, outputFormat || 'summary');
        
        return {
          content: [{
            type: 'text',
            text: formatted
          }]
        };
      }
      
      case 'check_secret': {
        const { content, fileType } = CheckSecretSchema.parse(args);
        const scanner = new SecurityScanner('');
        const secrets = scanner.checkContentForSecrets(content, fileType);
        
        if (secrets.length === 0) {
          return {
            content: [{
              type: 'text',
              text: '✅ No secrets detected in the provided content.'
            }]
          };
        }
        
        let output = `⚠️ Found ${secrets.length} potential secret(s):\n\n`;
        secrets.forEach(secret => {
          output += `• ${secret.type}: ${secret.match.substring(0, 20)}...\n`;
          output += `  Line: ${secret.line}\n`;
          output += `  Severity: ${secret.severity}\n\n`;
        });
        
        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      }
      
      case 'check_gitignore': {
        const { path: repoPath, patterns } = CheckGitignoreSchema.parse(args);
        
        const gitignorePath = path.join(repoPath, '.gitignore');
        let gitignoreContent = '';
        
        try {
          gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
        } catch {
          return {
            content: [{
              type: 'text',
              text: '❌ No .gitignore file found in the repository!'
            }]
          };
        }
        
        const scanner = new SecurityScanner(repoPath);
        const analysis = scanner.analyzeGitignore(gitignoreContent, patterns);
        
        let output = '📋 .gitignore Analysis\n\n';
        
        if (analysis.missing.length > 0) {
          output += `⚠️ Missing recommended patterns:\n`;
          analysis.missing.forEach(pattern => {
            output += `  • ${pattern}\n`;
          });
          output += '\n';
        } else {
          output += '✅ All recommended security patterns are present!\n\n';
        }
        
        if (analysis.suggestions.length > 0) {
          output += `💡 Suggestions:\n`;
          analysis.suggestions.forEach(suggestion => {
            output += `  • ${suggestion}\n`;
          });
        }
        
        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      }
      
      case 'get_security_tips': {
        const { topic } = GetSecurityTipsSchema.parse(args);
        const tips = securityTips[topic] || [];
        
        let output = `🔒 Security Best Practices: ${topic.toUpperCase()}\n\n`;
        tips.forEach((tip, index) => {
          output += `${index + 1}. ${tip}\n`;
        });
        
        return {
          content: [{
            type: 'text',
            text: output
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      }]
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Security Scanner MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});