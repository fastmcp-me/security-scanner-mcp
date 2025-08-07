#!/usr/bin/env node

import { SecurityScanner } from './dist/scanner.js';
import { program } from 'commander';
import chalk from 'chalk';

program
  .name('security-scanner')
  .description('CLI for security scanning')
  .version('1.0.0');

program
  .command('scan <path>')
  .description('Scan a repository for security issues')
  .option('-f, --format <format>', 'Output format (summary|detailed|json)', 'summary')
  .option('-c, --categories <categories...>', 'Categories to scan', ['all'])
  .action(async (path, options) => {
    try {
      console.log(chalk.blue(`🔍 Scanning ${path}...`));
      
      const scanner = new SecurityScanner(path);
      const results = await scanner.scan(options.categories[0] === 'all' ? undefined : options.categories);
      
      if (options.format === 'json') {
        console.log(JSON.stringify(results, null, 2));
      } else {
        // Format and display results
        console.log(chalk.green('\n📊 Security Scan Summary'));
        console.log('━'.repeat(50));
        console.log(`Repository: ${results.repository}`);
        console.log(`Critical: ${results.summary.critical}`);
        console.log(`High: ${results.summary.high}`);
        console.log(`Medium: ${results.summary.medium}`);
        console.log(`Low: ${results.summary.low}`);
        console.log(`Total: ${results.summary.total}`);
        
        if (options.format === 'detailed') {
          // Show detailed findings
          Object.entries(results.findings).forEach(([category, findings]) => {
            if (findings.length > 0) {
              console.log(chalk.yellow(`\n${category.toUpperCase()}`));
              findings.forEach(f => {
                console.log(`  • ${f.title}: ${f.details}`);
              });
            }
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('Error:', error.message));
      process.exit(1);
    }
  });

program.parse();