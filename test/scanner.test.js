import { SecurityScanner } from '../dist/scanner.js';
import { jest } from '@jest/globals';

describe('SecurityScanner', () => {
  describe('checkContentForSecrets', () => {
    it('should detect AWS access keys', () => {
      const scanner = new SecurityScanner('');
      const content = 'AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF';
      const secrets = scanner.checkContentForSecrets(content);
      
      expect(secrets).toHaveLength(1);
      expect(secrets[0].type).toBe('AWS Access Key');
    });

    it('should detect OpenAI API keys', () => {
      const scanner = new SecurityScanner('');
      const content = 'OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef';
      const secrets = scanner.checkContentForSecrets(content);
      
      expect(secrets.length).toBeGreaterThan(0);
      expect(secrets.some(s => s.type === 'OpenAI API Key')).toBe(true);
    });

    it('should detect multiple secrets in content', () => {
      const scanner = new SecurityScanner('');
      const content = `
        AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
        AWS_SECRET_ACCESS_KEY=abcdef1234567890abcdef1234567890abcdef12
        GITHUB_TOKEN=ghp_1234567890abcdef1234567890abcdef1234
      `;
      const secrets = scanner.checkContentForSecrets(content);
      
      expect(secrets.length).toBeGreaterThanOrEqual(3);
    });

    it('should not detect false positives', () => {
      const scanner = new SecurityScanner('');
      const content = 'This is just regular text without any secrets';
      const secrets = scanner.checkContentForSecrets(content);
      
      expect(secrets).toHaveLength(0);
    });
  });

  describe('analyzeGitignore', () => {
    it('should detect missing .env pattern', () => {
      const scanner = new SecurityScanner('');
      const gitignoreContent = 'node_modules/\n*.log';
      const analysis = scanner.analyzeGitignore(gitignoreContent);
      
      expect(analysis.missing).toContain('.env');
      expect(analysis.suggestions.length).toBeGreaterThan(0);
    });

    it('should recognize existing patterns', () => {
      const scanner = new SecurityScanner('');
      const gitignoreContent = '.env\n.env.*\nnode_modules/\n*.pem\n*.key';
      const analysis = scanner.analyzeGitignore(gitignoreContent);
      
      expect(analysis.missing).not.toContain('.env');
      expect(analysis.missing).not.toContain('*.pem');
      expect(analysis.missing).not.toContain('*.key');
    });

    it('should check custom patterns', () => {
      const scanner = new SecurityScanner('');
      const gitignoreContent = '.env\nnode_modules/';
      const customPatterns = ['custom-secret.json', 'private-config/'];
      const analysis = scanner.analyzeGitignore(gitignoreContent, customPatterns);
      
      expect(analysis.missing).toContain('custom-secret.json');
      expect(analysis.missing).toContain('private-config/');
    });
  });
});