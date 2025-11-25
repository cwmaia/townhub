# QA Agent Setup Guide - Complete Implementation

## 🎯 Goal
Set up an autonomous AI QA agent that can browse, test, and document issues in the TownHub CMS and mobile app.

---

## 📋 Setup Options

### Option 1: Claude Desktop + MCP (RECOMMENDED)
**Best for:** Autonomous, intelligent testing with screenshots
**Complexity:** Medium
**Setup Time:** 15 minutes

### Option 2: Custom Playwright Script + Claude API
**Best for:** Automated regression testing
**Complexity:** High
**Setup Time:** 1-2 hours

### Option 3: Manual Testing with Claude Code
**Best for:** Quick testing without additional setup
**Complexity:** Low
**Setup Time:** 5 minutes

---

## 🚀 Option 1: Claude Desktop + MCP Setup (RECOMMENDED)

### Step 1: Install Claude Desktop

1. Download from https://claude.ai/download
2. Sign in with your Anthropic account
3. Verify Claude Desktop is running

### Step 2: Install Puppeteer MCP Server

```bash
# Navigate to a global directory
cd ~

# Install the MCP server
npm install -g @modelcontextprotocol/server-puppeteer

# Verify installation
which @modelcontextprotocol/server-puppeteer
```

### Step 3: Configure Claude Desktop

1. Open Claude Desktop configuration:
   ```bash
   # macOS
   open ~/Library/Application\ Support/Claude/claude_desktop_config.json

   # Linux
   nano ~/.config/Claude/claude_desktop_config.json
   ```

2. Add this configuration:
   ```json
   {
     "mcpServers": {
       "puppeteer": {
         "command": "npx",
         "args": [
           "-y",
           "@modelcontextprotocol/server-puppeteer"
         ],
         "env": {
           "PUPPETEER_HEADLESS": "false"
         }
       }
     }
   }
   ```

3. Save and restart Claude Desktop

### Step 4: Verify MCP Connection

1. Open Claude Desktop
2. Start a new conversation
3. Type: "Can you browse to http://localhost:3000?"
4. If MCP is working, Claude will confirm it can access browser tools

### Step 5: Load QA Agent Prompt

In Claude Desktop, paste this instruction:

```
I need you to act as a QA Agent for the TownHub application.

Please read the following files to understand your role:
1. /Users/carlosmaia/townhub/.claude/QA_AGENT_PROMPT.md (Your testing instructions)
2. /Users/carlosmaia/townhub/.claude/ISSUE_TRACKER.md (Known issues)
3. /Users/carlosmaia/townhub/.claude/ARCHITECT_RULES.md (Project context)

Then begin comprehensive testing of the CMS at http://localhost:3000, following the checklist in the QA_AGENT_PROMPT.md file.

Document all findings in the ISSUE_TRACKER.md format.
```

### Step 6: Start Testing

The QA Agent will:
- ✅ Open browser to http://localhost:3000
- ✅ Navigate through all CMS pages
- ✅ Take screenshots of issues
- ✅ Document bugs in standardized format
- ✅ Provide UX recommendations
- ✅ Generate a comprehensive report

---

## 🔧 Option 2: Custom Playwright Script (Advanced)

If you want programmatic control, create an automated testing script:

### Install Dependencies

```bash
cd /Users/carlosmaia/townhub
npm install --save-dev @playwright/test @anthropic-ai/sdk
npx playwright install chromium
```

### Create QA Script

```bash
mkdir -p scripts/qa
touch scripts/qa/autonomous-qa.ts
```

### Script Implementation

```typescript
// scripts/qa/autonomous-qa.ts
import { chromium, Page } from '@playwright/test';
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TestResult {
  page: string;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    screenshot?: string;
  }>;
}

async function runQASession() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results: TestResult[] = [];

  // Test pages
  const pagesToTest = [
    { url: 'http://localhost:3000/en/auth/login', name: 'Login' },
    { url: 'http://localhost:3000/en/admin', name: 'Dashboard' },
    { url: 'http://localhost:3000/en/admin/businesses', name: 'Businesses' },
    { url: 'http://localhost:3000/en/admin/notifications', name: 'Notifications' },
  ];

  for (const pageInfo of pagesToTest) {
    console.log(`Testing: ${pageInfo.name}`);

    await page.goto(pageInfo.url);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    const screenshot = await page.screenshot({ fullPage: true });

    // Get page HTML
    const html = await page.content();

    // Get console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Use Claude to analyze
    const analysis = await analyzePageWithClaude(
      pageInfo.name,
      html,
      errors,
      screenshot
    );

    results.push({
      page: pageInfo.name,
      issues: analysis,
    });
  }

  await browser.close();

  // Generate report
  generateReport(results);
}

async function analyzePageWithClaude(
  pageName: string,
  html: string,
  errors: string[],
  screenshot: Buffer
) {
  const message = await anthropic.messages.create({
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
            data: screenshot.toString('base64'),
          },
        },
        {
          type: 'text',
          text: `Analyze this ${pageName} page for bugs and UX issues.

Console errors: ${errors.join(', ') || 'None'}

Look for:
1. Visual bugs (alignment, spacing, broken UI)
2. Missing or broken functionality
3. UX problems (confusing flows, poor labels)
4. Accessibility issues
5. Performance problems

Return a JSON array of issues with format:
[{
  "severity": "critical|high|medium|low",
  "title": "Brief issue title",
  "description": "Detailed description"
}]`,
        },
      ],
    }],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    try {
      return JSON.parse(content.text);
    } catch {
      return [];
    }
  }
  return [];
}

function generateReport(results: TestResult[]) {
  let report = '# QA Test Report\n\n';
  report += `**Date:** ${new Date().toISOString()}\n\n`;

  for (const result of results) {
    report += `## ${result.page}\n\n`;

    if (result.issues.length === 0) {
      report += '✅ No issues found\n\n';
    } else {
      for (const issue of result.issues) {
        report += `### ${issue.severity.toUpperCase()}: ${issue.title}\n`;
        report += `${issue.description}\n\n`;
      }
    }
  }

  fs.writeFileSync('QA_REPORT.md', report);
  console.log('Report generated: QA_REPORT.md');
}

// Run
runQASession().catch(console.error);
```

### Run the Script

```bash
export ANTHROPIC_API_KEY="your-api-key"
npx ts-node scripts/qa/autonomous-qa.ts
```

---

## 🎨 Option 3: Manual Testing with AI Assistance

If you want to start immediately without additional setup:

1. Run your CMS: `npm run dev`
2. Open browser to http://localhost:3000
3. Use Claude Code (this session) to guide you:

```
I'll walk you through testing the CMS step-by-step.
For each page, I'll tell you what to check, and you paste
screenshots or describe what you see. I'll document issues.
```

---

## 📊 Expected Output

After QA session, you'll have:

1. **Updated ISSUE_TRACKER.md** with new findings
2. **Screenshots** of all major pages
3. **Bug Reports** in standardized format
4. **UX Recommendations** document
5. **Priority Fix List** for developers

---

## 🔄 Regular QA Workflow

### Daily QA (Quick Check)
```bash
# Run automated tests
npm run test:qa

# Review results
cat QA_REPORT.md
```

### Weekly QA (Comprehensive)
1. Launch Claude Desktop with QA Agent prompt
2. Run full test suite on all pages
3. Update ISSUE_TRACKER.md
4. Create prioritized fix tickets
5. Re-test after fixes

### Pre-Release QA (Critical)
1. Full manual testing with QA Agent
2. Cross-browser testing (Chrome, Safari, Firefox)
3. Mobile device testing
4. Performance testing
5. Security audit
6. Sign-off checklist

---

## 🎯 Success Metrics

Your QA setup is working when:
- ✅ Agent can autonomously browse and test
- ✅ Issues are consistently documented
- ✅ Screenshots captured automatically
- ✅ Reports generated without manual work
- ✅ Regression testing catches old bugs
- ✅ New features tested immediately

---

## 🆘 Troubleshooting

### MCP Not Connecting
```bash
# Check Claude Desktop logs
tail -f ~/Library/Logs/Claude/mcp*.log

# Verify MCP server installed
npm list -g @modelcontextprotocol/server-puppeteer
```

### Browser Automation Fails
```bash
# Install browser binaries
npx playwright install chromium

# Check headless mode setting
# Set PUPPETEER_HEADLESS=false to see browser
```

### API Key Issues
```bash
# Verify API key
echo $ANTHROPIC_API_KEY

# Set in environment
export ANTHROPIC_API_KEY="sk-ant-..."
```

---

## 📚 Resources

- **Puppeteer MCP:** https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer
- **Playwright Docs:** https://playwright.dev
- **Claude API Docs:** https://docs.anthropic.com
- **MCP Documentation:** https://modelcontextprotocol.io

---

## 🎉 Next Steps

1. Choose your setup option (Option 1 recommended)
2. Follow setup steps
3. Run first QA session
4. Review generated reports
5. Create fix tickets
6. Re-test after fixes
7. Automate for CI/CD

**Your application will be production-ready with professional QA coverage!**
