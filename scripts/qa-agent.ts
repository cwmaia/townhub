/**
 * Autonomous QA Agent using Playwright + Claude API
 *
 * This script browses the TownHub CMS, takes screenshots,
 * and uses Claude to analyze for bugs and UX issues.
 */

import { chromium, Browser, Page } from '@playwright/test';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs/promises';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const REPORT_DIR = './qa-reports';

interface Issue {
  id: number;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  title: string;
  description: string;
  component: string;
  screenshot?: string;
  stepsToReproduce: string[];
  expectedBehavior: string;
  actualBehavior: string;
  impact: string;
}

interface PageTest {
  name: string;
  url: string;
  actions?: (page: Page) => Promise<void>;
}

class QAAgent {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private anthropic: Anthropic;
  private issues: Issue[] = [];
  private issueCounter = 1;
  private screenshots: string[] = [];

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  async initialize() {
    console.log('🚀 Initializing QA Agent...');

    // Create reports directory
    await fs.mkdir(REPORT_DIR, { recursive: true });

    // Launch browser
    this.browser = await chromium.launch({
      headless: false, // Show browser for debugging
      slowMo: 500, // Slow down actions to see what's happening
    });

    this.page = await this.browser.newPage();

    // Setup console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`❌ Console Error: ${msg.text()}`);
      }
    });

    console.log('✅ Browser launched');
  }

  async testPage(pageTest: PageTest) {
    if (!this.page) throw new Error('Page not initialized');

    console.log(`\n📄 Testing: ${pageTest.name}`);
    console.log(`   URL: ${pageTest.url}`);

    try {
      // Navigate to page
      await this.page.goto(pageTest.url, { waitUntil: 'networkidle' });

      // Wait for page to be interactive
      await this.page.waitForLoadState('domcontentloaded');

      // Run custom actions if provided
      if (pageTest.actions) {
        await pageTest.actions(this.page);
      }

      // Take screenshot
      const screenshotPath = path.join(
        REPORT_DIR,
        `${pageTest.name.toLowerCase().replace(/\s+/g, '-')}.png`
      );
      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });
      this.screenshots.push(screenshotPath);
      console.log(`   📸 Screenshot saved: ${screenshotPath}`);

      // Get page content
      const html = await this.page.content();
      const title = await this.page.title();

      // Check for console errors
      const errors: string[] = [];
      this.page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Analyze with Claude
      console.log(`   🤖 Analyzing with Claude...`);
      const issues = await this.analyzePageWithClaude(
        pageTest.name,
        title,
        screenshotPath,
        errors
      );

      if (issues.length > 0) {
        console.log(`   ⚠️  Found ${issues.length} issues`);
        this.issues.push(...issues);
      } else {
        console.log(`   ✅ No issues found`);
      }

    } catch (error) {
      console.error(`   ❌ Error testing ${pageTest.name}:`, error);
      this.issues.push({
        id: this.issueCounter++,
        priority: 'P0',
        title: `Page Failed to Load: ${pageTest.name}`,
        description: `Error: ${error}`,
        component: pageTest.name,
        stepsToReproduce: [`Navigate to ${pageTest.url}`],
        expectedBehavior: 'Page loads successfully',
        actualBehavior: 'Page failed to load or threw error',
        impact: 'Critical - page is completely broken',
      });
    }
  }

  async analyzePageWithClaude(
    pageName: string,
    pageTitle: string,
    screenshotPath: string,
    errors: string[]
  ): Promise<Issue[]> {
    try {
      // Read screenshot as base64
      const imageBuffer = await fs.readFile(screenshotPath);
      const base64Image = imageBuffer.toString('base64');

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `You are a QA Engineer analyzing the "${pageName}" page of TownHub CMS.

Page Title: ${pageTitle}
Console Errors: ${errors.length > 0 ? errors.join(', ') : 'None'}

Analyze this screenshot for:
1. **Visual Bugs**: Misalignment, spacing issues, broken UI elements
2. **UX Issues**: Confusing flows, unclear labels, poor hierarchy
3. **Functionality**: Missing features, broken buttons, form issues
4. **Accessibility**: Poor contrast, missing labels, keyboard navigation
5. **Design**: Inconsistent styling, unprofessional appearance

Return a JSON array of issues. Each issue should have:
- priority: "P0" (critical) | "P1" (high) | "P2" (medium) | "P3" (low)
- title: Brief descriptive title
- description: Detailed explanation
- expectedBehavior: What should happen
- actualBehavior: What actually happens
- impact: How this affects users

If the page looks good, return an empty array [].

Format:
\`\`\`json
[
  {
    "priority": "P1",
    "title": "Submit button not visible",
    "description": "The submit button...",
    "expectedBehavior": "Button should be...",
    "actualBehavior": "Button is...",
    "impact": "Users cannot..."
  }
]
\`\`\``,
            },
          ],
        }],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        // Extract JSON from code blocks
        const jsonMatch = content.text.match(/```json\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : content.text;

        try {
          const aiIssues = JSON.parse(jsonText);

          // Convert to our Issue format
          return aiIssues.map((ai: any) => ({
            id: this.issueCounter++,
            priority: ai.priority || 'P2',
            title: ai.title,
            description: ai.description,
            component: pageName,
            screenshot: screenshotPath,
            stepsToReproduce: [`Navigate to ${pageName}`],
            expectedBehavior: ai.expectedBehavior || 'Not specified',
            actualBehavior: ai.actualBehavior || 'Not specified',
            impact: ai.impact || 'Not specified',
          }));
        } catch (parseError) {
          console.error('   ⚠️  Failed to parse Claude response as JSON');
          return [];
        }
      }

      return [];
    } catch (error) {
      console.error('   ⚠️  Error analyzing with Claude:', error);
      return [];
    }
  }

  async runFullTest() {
    console.log('\n🔍 Starting comprehensive QA test suite...\n');

    const pages: PageTest[] = [
      {
        name: 'Login Page',
        url: `${BASE_URL}/en/auth/login`,
      },
      {
        name: 'Admin Dashboard',
        url: `${BASE_URL}/en/admin`,
        actions: async (page) => {
          // Try to login if on login page
          if (page.url().includes('/auth/login')) {
            await page.fill('input[type="email"]', 'admin@example.com');
            await page.fill('input[type="password"]', 'password');
            await page.click('button[type="submit"]');
            await page.waitForNavigation({ waitUntil: 'networkidle' });
          }
        },
      },
      {
        name: 'Business Management',
        url: `${BASE_URL}/en/admin/businesses`,
      },
      {
        name: 'Notification Center',
        url: `${BASE_URL}/en/admin/notifications`,
      },
    ];

    for (const pageTest of pages) {
      await this.testPage(pageTest);
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Test suite complete!');
  }

  async generateReport() {
    console.log('\n📊 Generating QA Report...');

    const report = this.buildMarkdownReport();
    const reportPath = path.join(REPORT_DIR, 'QA_REPORT.md');

    await fs.writeFile(reportPath, report);
    console.log(`✅ Report saved: ${reportPath}`);

    // Also update ISSUE_TRACKER.md
    await this.updateIssueTracker();
  }

  buildMarkdownReport(): string {
    const timestamp = new Date().toISOString();
    const criticalCount = this.issues.filter(i => i.priority === 'P0').length;
    const highCount = this.issues.filter(i => i.priority === 'P1').length;
    const mediumCount = this.issues.filter(i => i.priority === 'P2').length;
    const lowCount = this.issues.filter(i => i.priority === 'P3').length;

    let report = `# QA Test Report - TownHub CMS\n\n`;
    report += `**Date:** ${timestamp}\n`;
    report += `**Total Issues Found:** ${this.issues.length}\n\n`;

    report += `## Summary\n\n`;
    report += `- 🔴 **Critical (P0):** ${criticalCount}\n`;
    report += `- 🟠 **High (P1):** ${highCount}\n`;
    report += `- 🟡 **Medium (P2):** ${mediumCount}\n`;
    report += `- 🟢 **Low (P3):** ${lowCount}\n\n`;

    if (this.issues.length === 0) {
      report += `✅ **No issues found!** The application is in excellent shape.\n\n`;
    } else {
      report += `## Issues by Priority\n\n`;

      for (const priority of ['P0', 'P1', 'P2', 'P3']) {
        const priorityIssues = this.issues.filter(i => i.priority === priority);

        if (priorityIssues.length > 0) {
          report += `### ${priority} Issues\n\n`;

          for (const issue of priorityIssues) {
            report += `#### Issue #${issue.id}: ${issue.title}\n\n`;
            report += `**Component:** ${issue.component}\n`;
            report += `**Priority:** ${issue.priority}\n\n`;
            report += `**Description:**\n${issue.description}\n\n`;
            report += `**Expected Behavior:**\n${issue.expectedBehavior}\n\n`;
            report += `**Actual Behavior:**\n${issue.actualBehavior}\n\n`;
            report += `**Impact:**\n${issue.impact}\n\n`;

            if (issue.screenshot) {
              report += `**Screenshot:** \`${issue.screenshot}\`\n\n`;
            }

            report += `---\n\n`;
          }
        }
      }
    }

    report += `## Screenshots\n\n`;
    for (const screenshot of this.screenshots) {
      report += `- \`${screenshot}\`\n`;
    }

    return report;
  }

  async updateIssueTracker() {
    const trackerPath = '/Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md';

    try {
      let tracker = await fs.readFile(trackerPath, 'utf-8');
      const timestamp = new Date().toISOString().split('T')[0];

      // Add new section for today's QA session
      const newSection = `\n\n---\n\n## QA Agent Session - ${timestamp}\n\n`;
      tracker += newSection;
      tracker += `**Automated testing session completed**\n`;
      tracker += `**Issues Found:** ${this.issues.length}\n\n`;

      if (this.issues.length > 0) {
        tracker += `**New Issues:**\n`;
        for (const issue of this.issues) {
          tracker += `- [${issue.priority}] ${issue.title} (${issue.component})\n`;
        }
      }

      tracker += `\n**Full Report:** See \`${REPORT_DIR}/QA_REPORT.md\`\n`;

      await fs.writeFile(trackerPath, tracker);
      console.log(`✅ ISSUE_TRACKER.md updated`);
    } catch (error) {
      console.error('⚠️  Could not update ISSUE_TRACKER.md:', error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    if (this.browser) {
      await this.browser.close();
    }
    console.log('✅ Browser closed');
  }

  async run() {
    try {
      await this.initialize();
      await this.runFullTest();
      await this.generateReport();

      console.log('\n🎉 QA Agent completed successfully!');
      console.log(`📊 Found ${this.issues.length} issues`);
      console.log(`📁 Reports saved in: ${REPORT_DIR}/`);

    } catch (error) {
      console.error('\n❌ QA Agent failed:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Main execution
async function main() {
  const agent = new QAAgent();
  await agent.run();
}

main().catch(console.error);
