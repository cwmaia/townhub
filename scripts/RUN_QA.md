# Run QA Agent - Simple Setup

## 🚀 Quick Start (5 minutes)

Since the MCP approach has issues, use this **direct Playwright + Claude API** approach instead.

### Step 1: Install Dependencies

```bash
cd /Users/carlosmaia/townhub

# Install Playwright and Anthropic SDK
npm install --save-dev @playwright/test @anthropic-ai/sdk

# Install Chromium browser
npx playwright install chromium
```

### Step 2: Set Your API Key

```bash
# Get your API key from: https://console.anthropic.com/settings/keys
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Or add to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." >> .env.local
```

### Step 3: Make Sure CMS is Running

```bash
# In one terminal, run the CMS
npm run dev

# Should show: "ready started server on 0.0.0.0:3000"
```

### Step 4: Run QA Agent

```bash
# In another terminal
npx ts-node scripts/qa-agent.ts
```

### What Happens:

1. ✅ Browser opens (you'll see it!)
2. ✅ Navigates to each CMS page
3. ✅ Takes screenshots
4. ✅ Claude analyzes each page for bugs/UX issues
5. ✅ Generates comprehensive report
6. ✅ Updates ISSUE_TRACKER.md

### Results:

```
qa-reports/
├── login-page.png
├── admin-dashboard.png
├── business-management.png
├── notification-center.png
└── QA_REPORT.md  ← Read this!
```

---

## 📊 Expected Output

```
🚀 Initializing QA Agent...
✅ Browser launched

📄 Testing: Login Page
   URL: http://localhost:3000/en/auth/login
   📸 Screenshot saved: qa-reports/login-page.png
   🤖 Analyzing with Claude...
   ✅ No issues found

📄 Testing: Admin Dashboard
   URL: http://localhost:3000/en/admin
   📸 Screenshot saved: qa-reports/admin-dashboard.png
   🤖 Analyzing with Claude...
   ⚠️  Found 3 issues

... (continues for each page)

✅ Test suite complete!
📊 Generating QA Report...
✅ Report saved: qa-reports/QA_REPORT.md
✅ ISSUE_TRACKER.md updated

🎉 QA Agent completed successfully!
📊 Found 8 issues
📁 Reports saved in: qa-reports/
```

---

## 🎯 Customize Testing

### Test Specific Pages

Edit `scripts/qa-agent.ts`, modify the `pages` array:

```typescript
const pages: PageTest[] = [
  {
    name: 'Notification Center',
    url: `${BASE_URL}/en/admin/notifications`,
  },
  // Add more pages...
];
```

### Add Custom Actions

```typescript
{
  name: 'Create Business Flow',
  url: `${BASE_URL}/en/admin/businesses`,
  actions: async (page) => {
    await page.click('button:has-text("Create Business")');
    await page.fill('input[name="name"]', 'Test Business');
    // etc...
  },
}
```

### Change Claude Analysis

Modify the prompt in `analyzePageWithClaude()` method.

---

## 🔄 Daily QA Workflow

### Morning Check (5 min)
```bash
export ANTHROPIC_API_KEY="..."
npx ts-node scripts/qa-agent.ts
cat qa-reports/QA_REPORT.md
```

### After Fixing Bugs
```bash
# Re-run to verify fixes
npx ts-node scripts/qa-agent.ts

# Compare reports
diff qa-reports/QA_REPORT.md qa-reports/QA_REPORT_previous.md
```

### Before Deployment
```bash
# Full test suite
npx ts-node scripts/qa-agent.ts

# Review report
code qa-reports/QA_REPORT.md

# If 0 P0/P1 issues → ✅ Ship it!
```

---

## 💡 Pro Tips

### Tip 1: Headless Mode
For faster testing without seeing browser:

```typescript
// In qa-agent.ts, line ~50
this.browser = await chromium.launch({
  headless: true,  // Change to true
});
```

### Tip 2: CI/CD Integration
Add to `package.json`:

```json
{
  "scripts": {
    "test:qa": "ts-node scripts/qa-agent.ts"
  }
}
```

Then run: `npm run test:qa`

### Tip 3: Slow Down for Debugging
```typescript
this.browser = await chromium.launch({
  headless: false,
  slowMo: 1000,  // 1 second delay between actions
});
```

### Tip 4: Test Mobile Views
```typescript
this.page = await this.browser.newPage({
  viewport: { width: 375, height: 667 },  // iPhone size
  isMobile: true,
});
```

---

## 🆘 Troubleshooting

### "ANTHROPIC_API_KEY is required"
```bash
# Set the environment variable
export ANTHROPIC_API_KEY="sk-ant-..."

# Or create .env.local file
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> .env.local
```

### "Cannot find module @playwright/test"
```bash
npm install --save-dev @playwright/test
```

### "Executable doesn't exist"
```bash
npx playwright install chromium
```

### "Connection refused" on localhost:3000
```bash
# Make sure CMS is running
cd /Users/carlosmaia/townhub
npm run dev
```

---

## ✅ Success Checklist

After running QA Agent:

- ✅ Browser opened and navigated pages
- ✅ Screenshots saved in `qa-reports/`
- ✅ `QA_REPORT.md` generated
- ✅ ISSUE_TRACKER.md updated
- ✅ No P0 (critical) issues found
- ✅ P1 issues documented and assigned

---

## 🎉 You're Ready!

This approach works 100% reliably because:
- ✅ No MCP configuration needed
- ✅ Direct Playwright automation
- ✅ Direct Claude API calls
- ✅ Runs anywhere Node.js runs
- ✅ Easy to customize and extend

**Run it now:**
```bash
export ANTHROPIC_API_KEY="your-key"
npx ts-node scripts/qa-agent.ts
```

Your app is about to get next-level quality! 🚀
