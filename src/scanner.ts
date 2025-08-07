import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';
import ignore from 'ignore';

interface Finding {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  details: string;
  file?: string;
  line?: number;
  match?: string;
}

interface ScanResult {
  repository: string;
  scanDate: string;
  version: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  findings: Record<string, Finding[]>;
}

interface SecretMatch {
  type: string;
  match: string;
  line: number;
  severity: string;
}

export class SecurityScanner {
  private repoPath: string;
  private ignoreInstance: ReturnType<typeof ignore>;
  private secretPatterns: Record<string, RegExp> = {
    "AWS Access Key": /AKIA[A-Z0-9]{16}/g,
    "AWS Secret Key": /aws[_-]?secret[_-]?access[_-]?key.*?["']([A-Za-z0-9/+=]{40})["']/gi,
    "API Key Generic": /(api[_-]?key|apikey|api[_-]?secret)["']?\s*[:=]\s*["']([^"'{}$\s]{20,})["']/gi,
    "OpenAI API Key": /sk-[a-zA-Z0-9]{48}/g,
    "GitHub Token": /gh[ps]_[A-Za-z0-9]{36}/g,
    "Google API Key": /AIza[0-9A-Za-z\\-_]{35}/g,
    "Private Key": /-----BEGIN\s+(?:RSA\s+)?PRIVATE\s+KEY-----/g,
    "Firebase URL": /https:\/\/[a-z0-9-]+\.firebaseio\.com/g,
    "Slack Token": /xox[baprs]-[0-9a-zA-Z]{10,48}/g,
    "Generic Secret": /(password|passwd|pwd|secret|token)["']?\s*[:=]\s*["']([^"'{}$\s]{8,})["']/gi,
    "JWT Token": /eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]+/g,
    "Database URL": /(mysql|postgres|postgresql|mongodb):\/\/[^:]+:[^@]+@[^\/]+\/[^\s"']+/gi,
    "Stripe Key": /sk_(?:test|live)_[0-9a-zA-Z]{24}/g,
    "Twilio API Key": /SK[0-9a-fA-F]{32}/g,
    "SendGrid API Key": /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/g,
    "Mailgun API Key": /key-[0-9a-zA-Z]{32}/g,
    "SSH Private Key": /ssh-rsa\s+[A-Za-z0-9+/]+[=]{0,2}/g
  };

  private vulnerabilityPatterns: Record<string, RegExp> = {
    "Hardcoded IP": /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    "SQL Injection Risk": /(execute|query)\s*\([^)]*\+[^)]*\)/gi,
    "Command Injection Risk": /(exec|system|eval|spawn)\s*\([^)]*\$[^)]*\)/g,
    "Unsafe Deserialization": /(pickle\.loads|yaml\.load|eval|exec)\s*\(/gi,
    "Weak Crypto": /(md5|sha1)\s*\(/gi,
    "HTTP without TLS": /http:\/\/[^\s"']+/g,
    "Debugging Code": /(console\.(log|debug|info)|print\s*\(|debugger|pdb\.set_trace)/gi,
    "TODO Security": /TODO.*?(security|password|auth|token|secret)/gi,
    "Temporary Files": /\/tmp\/[^\s"']+/g,
    "Insecure Random": /(math\.random|rand\(\))/gi
  };

  private recommendedGitignorePatterns = [
    '.env',
    '.env.*',
    '!.env.example',
    '!.env.*.example',
    '*.pem',
    '*.key',
    '*.cert',
    '*.p12',
    '*.pfx',
    '.aws/',
    'credentials',
    'aws-exports.js',
    '**/secrets/',
    '**/credentials/',
    '*.log',
    '*.sqlite',
    '*.db',
    'node_modules/',
    '__pycache__/',
    '*.pyc',
    '.vscode/',
    '.idea/',
    '.DS_Store',
    'Thumbs.db',
    '*.bak',
    '*.tmp',
    '*~',
    'config.json',
    'settings.json',
    'docker-compose.override.yml'
  ];

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.ignoreInstance = ignore();
  }

  async scan(categories?: string[]): Promise<ScanResult> {
    const result: ScanResult = {
      repository: path.basename(this.repoPath),
      scanDate: new Date().toISOString(),
      version: '1.0.0',
      summary: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
        total: 0
      },
      findings: {}
    };

    // Load .gitignore
    await this.loadGitignore();

    const scanCategories = categories || ['secrets', 'vulnerabilities', 'dependencies', 'gitignore', 'git-history'];

    for (const category of scanCategories) {
      switch (category) {
        case 'secrets':
          result.findings.secrets = await this.scanSecrets();
          break;
        case 'vulnerabilities':
          result.findings.vulnerabilities = await this.scanVulnerabilities();
          break;
        case 'dependencies':
          result.findings.dependencies = await this.scanDependencies();
          break;
        case 'gitignore':
          result.findings.gitignore = await this.scanGitignore();
          break;
        case 'git-history':
          result.findings.git_history = await this.scanGitHistory();
          break;
      }
    }

    // Calculate summary
    Object.values(result.findings).forEach(categoryFindings => {
      if (Array.isArray(categoryFindings)) {
        categoryFindings.forEach(finding => {
          result.summary[finding.severity]++;
          result.summary.total++;
        });
      }
    });

    return result;
  }

  private async loadGitignore(): Promise<void> {
    try {
      const gitignorePath = path.join(this.repoPath, '.gitignore');
      const content = await fs.readFile(gitignorePath, 'utf-8');
      this.ignoreInstance.add(content);
    } catch {
      // No .gitignore file
    }
  }

  private async scanSecrets(): Promise<Finding[]> {
    const findings: Finding[] = [];
    const files = await glob('**/*', {
      cwd: this.repoPath,
      ignore: ['node_modules/**', '.git/**', '*.jpg', '*.png', '*.gif', '*.pdf', '*.zip'],
      nodir: true
    });

    for (const file of files) {
      if (this.ignoreInstance.ignores(file)) continue;

      try {
        const filePath = path.join(this.repoPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');

        for (const [patternName, pattern] of Object.entries(this.secretPatterns)) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            const lineNumber = this.getLineNumber(content, match.index || 0);
            findings.push({
              severity: this.getSecretSeverity(patternName),
              category: 'secrets',
              title: `Potential ${patternName} found`,
              details: `Found in ${file} at line ${lineNumber}`,
              file,
              line: lineNumber,
              match: match[0].substring(0, 50) + '...'
            });
          }
        }
      } catch {
        // Skip binary or unreadable files
      }
    }

    return findings;
  }

  private async scanVulnerabilities(): Promise<Finding[]> {
    const findings: Finding[] = [];
    const files = await glob('**/*.{js,ts,py,php,java,go,rb,cs}', {
      cwd: this.repoPath,
      ignore: ['node_modules/**', '.git/**'],
      nodir: true
    });

    for (const file of files) {
      if (this.ignoreInstance.ignores(file)) continue;

      try {
        const filePath = path.join(this.repoPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        for (const [vulnName, pattern] of Object.entries(this.vulnerabilityPatterns)) {
          const matches = content.matchAll(pattern);
          for (const match of matches) {
            const lineNumber = this.getLineNumber(content, match.index || 0);
            findings.push({
              severity: this.getVulnerabilitySeverity(vulnName),
              category: 'vulnerabilities',
              title: `Potential ${vulnName}`,
              details: `Found in ${file} at line ${lineNumber}: ${match[0]}`,
              file,
              line: lineNumber,
              match: match[0]
            });
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    return findings;
  }

  private async scanDependencies(): Promise<Finding[]> {
    const findings: Finding[] = [];

    // Check for package.json
    try {
      const packageJsonPath = path.join(this.repoPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      if (!packageJson.dependencies && !packageJson.devDependencies) {
        findings.push({
          severity: 'info',
          category: 'dependencies',
          title: 'No dependencies found',
          details: 'package.json has no dependencies listed'
        });
      }

      // Check for outdated patterns
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      for (const [name, version] of Object.entries(deps)) {
        if (typeof version === 'string' && version.includes('*')) {
          findings.push({
            severity: 'high',
            category: 'dependencies',
            title: 'Wildcard version dependency',
            details: `${name}: ${version} - Using wildcard versions can lead to unexpected breaking changes`
          });
        }
      }
    } catch {
      // No package.json
    }

    // Check for requirements.txt
    try {
      const requirementsPath = path.join(this.repoPath, 'requirements.txt');
      const requirements = await fs.readFile(requirementsPath, 'utf-8');
      const lines = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      
      for (const line of lines) {
        if (!line.includes('==') && !line.includes('>=') && !line.includes('~=')) {
          findings.push({
            severity: 'medium',
            category: 'dependencies',
            title: 'Unpinned Python dependency',
            details: `${line} - Dependencies should be pinned to specific versions`
          });
        }
      }
    } catch {
      // No requirements.txt
    }

    return findings;
  }

  private async scanGitignore(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    try {
      const gitignorePath = path.join(this.repoPath, '.gitignore');
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf-8');
      const existingPatterns = gitignoreContent.split('\n').map(line => line.trim());

      for (const pattern of this.recommendedGitignorePatterns) {
        if (!existingPatterns.some(p => p === pattern || p.startsWith(pattern))) {
          findings.push({
            severity: this.getGitignoreSeverity(pattern),
            category: 'gitignore',
            title: `Missing recommended .gitignore pattern`,
            details: `Pattern '${pattern}' should be added to .gitignore`
          });
        }
      }
    } catch {
      findings.push({
        severity: 'critical',
        category: 'gitignore',
        title: 'Missing .gitignore file',
        details: 'No .gitignore file found in repository root'
      });
    }

    return findings;
  }

  private async scanGitHistory(): Promise<Finding[]> {
    const findings: Finding[] = [];
    
    // This is a simplified version - in production, you'd use git commands
    findings.push({
      severity: 'info',
      category: 'git_history',
      title: 'Git history scan',
      details: 'Full git history scanning requires git command execution'
    });

    return findings;
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getSecretSeverity(patternName: string): Finding['severity'] {
    const criticalPatterns = ['AWS Secret Key', 'Private Key', 'Database URL'];
    const highPatterns = ['AWS Access Key', 'API Key', 'GitHub Token', 'OpenAI API Key'];
    
    if (criticalPatterns.some(p => patternName.includes(p))) return 'critical';
    if (highPatterns.some(p => patternName.includes(p))) return 'high';
    return 'medium';
  }

  private getVulnerabilitySeverity(vulnName: string): Finding['severity'] {
    const highPatterns = ['SQL Injection', 'Command Injection', 'Unsafe Deserialization'];
    const mediumPatterns = ['Weak Crypto', 'HTTP without TLS'];
    
    if (highPatterns.some(p => vulnName.includes(p))) return 'high';
    if (mediumPatterns.some(p => vulnName.includes(p))) return 'medium';
    return 'low';
  }

  private getGitignoreSeverity(pattern: string): Finding['severity'] {
    const criticalPatterns = ['.env', '*.key', '*.pem', 'credentials'];
    const highPatterns = ['.aws/', '**/secrets/', 'config.json'];
    
    if (criticalPatterns.some(p => pattern.includes(p))) return 'high';
    if (highPatterns.some(p => pattern.includes(p))) return 'medium';
    return 'low';
  }

  checkContentForSecrets(content: string, fileType?: string): SecretMatch[] {
    const matches: SecretMatch[] = [];
    const lines = content.split('\n');

    for (const [patternName, pattern] of Object.entries(this.secretPatterns)) {
      const allMatches = content.matchAll(pattern);
      for (const match of allMatches) {
        const lineNumber = this.getLineNumber(content, match.index || 0);
        matches.push({
          type: patternName,
          match: match[0],
          line: lineNumber,
          severity: this.getSecretSeverity(patternName)
        });
      }
    }

    return matches;
  }

  analyzeGitignore(gitignoreContent: string, additionalPatterns?: string[]): {
    missing: string[];
    suggestions: string[];
  } {
    const existingPatterns = gitignoreContent.split('\n').map(line => line.trim());
    const missing: string[] = [];
    const suggestions: string[] = [];

    const allPatterns = [...this.recommendedGitignorePatterns, ...(additionalPatterns || [])];

    for (const pattern of allPatterns) {
      if (!existingPatterns.some(p => p === pattern || p.startsWith(pattern))) {
        missing.push(pattern);
      }
    }

    // Add suggestions based on common issues
    if (!existingPatterns.some(p => p.includes('.env'))) {
      suggestions.push('Add .env and .env.* patterns to prevent credential exposure');
    }

    if (!existingPatterns.some(p => p.includes('node_modules'))) {
      suggestions.push('Add node_modules/ for Node.js projects');
    }

    if (!existingPatterns.some(p => p.includes('__pycache__'))) {
      suggestions.push('Add __pycache__/ and *.pyc for Python projects');
    }

    return { missing, suggestions };
  }
}