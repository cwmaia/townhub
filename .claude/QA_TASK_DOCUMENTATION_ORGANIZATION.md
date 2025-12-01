# QA Task: Documentation Organization

**Date:** 2025-11-25
**Priority:** Medium
**Status:** Not Started

---

## Overview

Organize and consolidate all documentation across TownApp repositories. Currently, markdown files are scattered throughout the codebase with overlapping content, outdated information, and no clear structure.

## Current State

### townhub/.claude/ (44 files!)
```
ARCHITECT_RULES.md
CONTINUATION_SESSION_2025-11-25.md
DESIGNER_AGENT_PROMPT.md
DESIGNER_DEMO_READY_TASK.md
DESIGNER_MAP_PROMPT.md
DESIGNER_SETUP_SUMMARY.md
DESIGNER_TASK_ADMIN_AUDIT.md
DESIGNER_TASK_DASHBOARD_POLISH.md
DESIGNER_TASK_IMPLEMENT_DASHBOARD.md
DESIGNER_TASK_SUPER_ADMIN_COMPONENTS.md
DESIGNER_TASK_TOWNAPP_BRANDING.md (NEW - active)
DESIGNER_UNIFIED_PROMPT.md
E2E_NOTIFICATION_TEST_PLAN.md
ENGINEER_RULES.md
ENGINEER_TASK_APPLY_DESIGNER_UI.md
ENGINEER_TASK_EVENT_FILTERS.md
ENGINEER_TASK_FIX_MOBILE_APP.md
ENGINEER_TASK_MAP_PHASE_1_ANDROID.md
ENGINEER_TASK_MAP_PHASE_1_UPDATED.md
ENGINEER_TASK_MAP_PHASE_1.md
ENGINEER_TASK_PLACE_FILTERS.md
ENGINEER_TASK_SECURITY_AUDIT_DATABASE.md (NEW - active)
INTEGRATED_DEVELOPMENT_PLAN.md
INTERACTIVE_MAP_ARCHITECTURE.md
INTERACTIVE_MAP_FEATURE_PLAN.md
ISSUE_TRACKER.md
PHASE_1_COMPLETION_REPORT.md
PHASE_2_PLAN.md
QA_AGENT_PROMPT.md
QA_AGENT_SETUP_PROMPT.md
QA_AGENT_SETUP.md
QA_QUICK_START.md
QA_UI_UX_FOCUS.md
QA_UNIFIED_PROMPT.md
QUICK_START_NEXT_SESSION.md
QUICK_START_SESSION_3.md
QUICK_START_SESSION_4.md
SESSION_CHECKPOINT_2025-11-24_ADMIN.md
SESSION_CHECKPOINT_2025-11-24.md
SESSION_CHECKPOINT.md
SESSION_SUMMARY_INTERACTIVE_MAP.md
VISUAL_IMPROVEMENTS_STATUS.md
WIDGET_ENHANCEMENT_PLAN.md
```

### townhub/ root (7 files)
```
DEMO_VISUAL_IMPROVEMENTS.md
DASHBOARD_LAYOUT_REDESIGN.md
TOWNHUB_DESIGN_SYSTEM.md
SETUP.md
MOBILE_APP_PLAN.md
CODEX_PROMPT.md
TOWNAPP_CMS_PLAN.md
```

### townhub-mobile/ (1 file)
```
CODEX_PROMPT.md
```

---

## Target Structure

### Proposed Organization

```
townhub/.claude/
├── README.md                    # Index of all documentation
├── CLAUDE.md                    # Main context file (if not in root)
│
├── active/                      # Currently active tasks
│   ├── DESIGNER_TASK_TOWNAPP_BRANDING.md
│   ├── ENGINEER_TASK_SECURITY_AUDIT_DATABASE.md
│   └── QA_TASK_DOCUMENTATION_ORGANIZATION.md
│
├── agents/                      # Agent role definitions
│   ├── ARCHITECT_RULES.md
│   ├── DESIGNER_RULES.md
│   ├── ENGINEER_RULES.md
│   └── QA_RULES.md
│
├── architecture/                # Technical documentation
│   ├── INTERACTIVE_MAP_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── API_REFERENCE.md
│
├── plans/                       # Feature plans
│   ├── MOBILE_APP_PLAN.md
│   ├── NOTIFICATIONS_PLAN.md
│   └── CMS_PLAN.md
│
├── sessions/                    # Session continuity
│   ├── CURRENT_SESSION.md       # Always the latest
│   └── archive/                 # Old sessions
│       ├── 2025-11-24-admin.md
│       └── 2025-11-24-map.md
│
├── completed/                   # Completed tasks (archive)
│   ├── PHASE_1_COMPLETION_REPORT.md
│   └── ... (old tasks)
│
└── archive/                     # Deprecated docs
    └── ... (outdated files)
```

### townhub/ root
```
townhub/
├── README.md                    # Project overview, setup
├── SETUP.md                     # Detailed setup instructions
└── CONTRIBUTING.md              # How to contribute (optional)
```

### townhub-mobile/
```
townhub-mobile/
├── README.md                    # Mobile app overview
└── SETUP.md                     # Mobile setup instructions
```

---

## Tasks

### Phase 1: Audit & Categorize

1. **Read every .md file** in both repos
2. **Categorize each file**:
   - Active (currently in use)
   - Reference (useful documentation)
   - Outdated (superseded by newer docs)
   - Duplicate (redundant content)
   - Delete (no longer relevant)
3. **Create inventory spreadsheet/list**

### Phase 2: Consolidate

1. **Merge duplicates** - Many files cover similar topics
2. **Update outdated info** - TownHub → TownApp, etc.
3. **Remove completed tasks** that are no longer relevant
4. **Create unified documents** from fragmented pieces

### Phase 3: Restructure

1. **Create folder structure** as proposed above
2. **Move files** to appropriate locations
3. **Update cross-references** between documents
4. **Create README.md index** for .claude directory

### Phase 4: Create Key Documents

1. **CLAUDE.md** - Main context file:
   - Project overview
   - Tech stack
   - Directory structure
   - Common commands
   - Current priorities

2. **README.md for .claude/** - Index of all documentation:
   - What each folder contains
   - How to find things
   - When to update what

---

## Files to Definitely Keep

### Active Tasks
- `DESIGNER_TASK_TOWNAPP_BRANDING.md`
- `ENGINEER_TASK_SECURITY_AUDIT_DATABASE.md`
- `QA_TASK_DOCUMENTATION_ORGANIZATION.md`

### Important Reference
- `ARCHITECT_RULES.md`
- `ENGINEER_RULES.md`
- `INTERACTIVE_MAP_ARCHITECTURE.md`
- `PHASE_2_PLAN.md`

### Session Continuity
- `CONTINUATION_SESSION_2025-11-25.md` (current)

---

## Files to Review for Deletion/Archive

- Multiple `QUICK_START_SESSION_*.md` files (consolidate)
- Multiple `SESSION_CHECKPOINT*.md` files (archive old)
- Multiple `DESIGNER_TASK_*.md` for completed tasks
- Multiple `ENGINEER_TASK_*.md` for completed tasks
- Old prompts that have been superseded

---

## Deliverables

1. **Documentation inventory** - List of all files with status
2. **Organized folder structure** - As proposed above
3. **README.md for .claude/** - Navigation index
4. **Updated CLAUDE.md** - Main context file
5. **Archive folder** - Old/completed docs moved here
6. **Cleanup summary** - What was done, what was removed

---

## Acceptance Criteria

- [ ] All .md files in both repos audited
- [ ] Folder structure created
- [ ] Active tasks clearly identified
- [ ] Completed/outdated tasks archived
- [ ] No duplicate documentation
- [ ] README.md index created
- [ ] CLAUDE.md updated with current state
- [ ] Name changed from TownHub to TownApp throughout docs

---

## Notes

- **Don't delete anything without archiving first**
- **Preserve git history** - use `git mv` when moving files
- **Update any hardcoded paths** in remaining docs
- **Be conservative** - when in doubt, archive don't delete

---

**Note to QA:** This is a documentation cleanup task, not code testing. Take time to read and understand each document before categorizing. The goal is to make it easy for any AI agent to quickly understand the project state.
