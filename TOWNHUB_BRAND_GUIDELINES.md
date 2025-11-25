# TownHub Brand Guidelines

**Version:** 1.0.0
**Last Updated:** November 20, 2025
**Brand Manager:** TownHub Design Team

---

## Introduction

These brand guidelines ensure TownHub maintains a consistent, professional, and recognizable identity across all touchpoints - from the admin CMS to mobile applications, marketing materials, and community communications.

### Purpose
- Define TownHub's visual and verbal identity
- Ensure consistency across all platforms
- Guide design and content decisions
- Strengthen brand recognition
- Build trust with communities and businesses

### Audience
- Designers and developers
- Content creators and marketers
- Town administrators
- Business partners
- Community managers

---

## Brand Overview

### What is TownHub?

TownHub is a comprehensive platform that connects towns, businesses, and residents through real-time information, event management, and community engagement tools.

### Mission
To empower small towns with modern technology that strengthens local communities, supports businesses, and keeps residents informed and connected.

### Vision
Every town has the digital tools to thrive - engaging residents, celebrating local businesses, and building vibrant, connected communities.

### Values
1. **Community First** - We serve the unique needs of local communities
2. **Trustworthy** - Reliable information and secure communication
3. **Accessible** - Technology for everyone, regardless of technical skill
4. **Empowering** - Tools that amplify local voices
5. **Modern** - Contemporary solutions that respect tradition

---

## Brand Personality

### TownHub is...

**Professional yet Approachable**
- We're official and reliable, but never bureaucratic or cold
- We speak clearly and directly, without jargon
- We're a helpful partner, not a distant authority

**Modern but Timeless**
- We embrace current technology without chasing trends
- Our design is contemporary yet enduring
- We respect tradition while looking forward

**Local and Connected**
- We celebrate community uniqueness
- We bring people together
- We strengthen local bonds while connecting to the wider world

**Empowering and Supportive**
- We give communities the tools they need
- We make complex tasks simple
- We celebrate local success

### TownHub is NOT...

❌ Corporate or impersonal
❌ Overly casual or unprofessional
❌ Trendy or flashy
❌ Complicated or intimidating
❌ Generic or one-size-fits-all

---

## Visual Identity

### Brand Colors

#### Primary Color: Deep Blue (#003580)

```css
--primary: #003580
```

**Meaning & Psychology:**
- **Trust:** Associated with stability and reliability
- **Professionalism:** Official, authoritative communication
- **Calm:** Reassuring and peaceful
- **Depth:** Sophistication and intelligence

**Similar Brands:** Booking.com, Expedia, Government institutions

**When to Use:**
- Primary CTAs (buttons, links)
- Active states and selections
- Brand elements (logos, headers)
- Official communications
- Important information highlights

**When NOT to Use:**
- Large background areas (too dark)
- Body text (poor readability)
- Decorative elements (reserve for meaningful use)

---

#### Secondary Color: Light Blue-Gray (#e2e8f0)

```css
--secondary: #e2e8f0
```

**Meaning:**
- Subtle and supportive
- Calm and neutral
- Professional backdrop

**When to Use:**
- Secondary buttons
- Subtle backgrounds
- Dividers and separators
- Disabled states

---

#### Neutral Palette

```css
--background: #f8fafc   /* Very light blue-gray */
--card: #ffffff         /* Pure white */
--foreground: #0f172a   /* Near black */
--muted: #f1f5f9        /* Subtle gray */
--muted-foreground: #475569 /* Mid gray */
```

**Purpose:** Clean, professional foundation for content

**Usage:**
- Backgrounds: #f8fafc (app shell)
- Cards/surfaces: #ffffff (content areas)
- Primary text: #0f172a (headings, body)
- Secondary text: #475569 (labels, metadata)

---

#### Accent Colors

**Destructive Red (#ef4444)**
- Delete/remove actions
- Error messages
- Critical warnings

**Chart Colors**
- Blue (#2563eb) - Primary data
- Green (#22c55e) - Positive metrics
- Yellow (#facc15) - Warnings
- Pink (#fb7185) - Alerts

**Proposed: Warm Accent (Optional)**
```css
--accent-warm: #FF6B4A  /* Coral/orange */
```
- Community warmth
- Welcome messages
- Event highlights
- Friendly notifications

---

### Typography

#### Primary Typeface: Inter

**Font Family:** Inter
**Designer:** Rasmus Andersson
**License:** Open Font License
**Formats:** Web font, Variable font available

**Why Inter?**
- Designed specifically for user interfaces
- Excellent legibility at all sizes
- Open source and freely available
- Professional and modern
- Wide range of weights

**Fallbacks:**
```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

---

#### Type Hierarchy

**Display Text (Hero, Marketing)**
- Size: 32-40px (2-2.5rem)
- Weight: Bold (700)
- Line height: 1.2
- Use: Landing pages, major announcements

**Page Titles**
- Size: 28-31px (1.75-2rem)
- Weight: Bold (700)
- Line height: 1.25
- Use: Page headers, main headings

**Section Headings**
- Size: 20-25px (1.25-1.5rem)
- Weight: Semibold (600)
- Line height: 1.3
- Use: Card titles, section headers

**Body Text**
- Size: 14-16px (0.875-1rem)
- Weight: Regular (400) or Medium (500)
- Line height: 1.5-1.6
- Use: Paragraphs, descriptions, form content

**Small Text**
- Size: 12-13px (0.75-0.875rem)
- Weight: Regular (400)
- Line height: 1.5
- Use: Captions, metadata, helper text

---

#### Typography Best Practices

**DO:**
✅ Use sentence case for most headings
✅ Maintain clear hierarchy with size and weight
✅ Keep line lengths comfortable (50-75 characters)
✅ Use adequate line height for readability
✅ Left-align most text (better for scanning)

**DON'T:**
❌ Use ALL CAPS for long text
❌ Mix too many font weights on one page
❌ Make text too small (<12px)
❌ Use low-contrast text colors
❌ Center-align body paragraphs

---

### Logo & Identity Marks

**Note:** TownHub currently does not have a defined logo. This section provides guidelines for when a logo is developed.

#### Logo Specifications (To Be Developed)

**Recommended Approach:**
- Wordmark: "TownHub" in Inter Bold
- Icon: Simple, recognizable symbol representing connection/community
- Color: Primary blue (#003580) on light backgrounds
- Alternative: White on dark backgrounds

**Clear Space:**
- Minimum clearance: Height of capital "T" on all sides
- Never crowd the logo with other elements

**Minimum Size:**
- Digital: 120px width minimum
- Print: 1 inch width minimum

**Usage:**
- Left-aligned in headers
- Centered on login/authentication pages
- Small version in app navigation

---

### Iconography

#### Icon Style

**Recommended Library:** Lucide React or Heroicons

**Style Characteristics:**
- Outline style (not filled)
- Consistent stroke width (1.5-2px)
- Rounded corners and terminals
- Simple, geometric forms
- 24×24px base size

**Color:**
- Inherit text color when inline
- Use `text-muted-foreground` for decorative icons
- Use `text-primary` for interactive icons
- Use `text-destructive` for warnings/errors

**Sizing:**
```tsx
size-4  /* 16px - Inline with text */
size-5  /* 20px - Buttons */
size-6  /* 24px - Standard standalone */
size-8  /* 32px - Prominent */
size-12 /* 48px - Empty states, heroes */
```

---

#### Common Icons

**Navigation:**
- Home, Places, Events, Notifications, Settings, User

**Actions:**
- Plus (create), Edit (pencil), Delete (trash), Search, Filter

**Status:**
- CheckCircle (success), AlertTriangle (warning), XCircle (error), Info

**Media:**
- Upload, Download, Image, File, Calendar

**Communication:**
- Bell (notifications), Mail (email), Phone, Link

---

### Photography & Imagery

#### Image Style

**Subject Matter:**
- Local landmarks and scenery
- Community events and gatherings
- Local businesses and products
- Real people (avoid stock photos when possible)
- Authentic, candid moments

**Style:**
- Natural, warm lighting
- Vibrant but realistic colors
- Landscape orientation preferred for heroes
- Square format for avatars/thumbnails
- 16:9 for featured images

**Tone:**
- Welcoming and inclusive
- Authentic and real
- Community-focused
- Seasonal and timely

---

#### Image Specifications

**Place Images:**
- Hero: 1600×900px minimum (16:9)
- Thumbnail: 512×512px (square)
- Gallery: 1200×800px minimum

**Business Images:**
- Logo: 256×256px (square)
- Hero: 1600×600px (wide)
- Gallery: 1200×800px

**Event Images:**
- Featured: 1200×630px (og:image ratio)
- Thumbnail: 400×400px (square)

**Technical Requirements:**
- Format: WebP preferred, JPG/PNG acceptable
- Max file size: 5MB for upload, optimize for web
- Alt text: Always provide descriptive alt text

---

### Design Principles

#### 1. Clarity First

**Principle:** Information should be immediately understandable.

**In Practice:**
- Clear visual hierarchy (size, weight, spacing)
- One primary action per screen/section
- Descriptive labels and headings
- Minimal cognitive load
- Straightforward navigation

**Example:**
```tsx
// Clear hierarchy
<h1 className="text-2xl font-bold">Manage Places</h1>
<p className="text-muted-foreground">View and edit all places in Stykkishólmur</p>

// Primary action is obvious
<Button>Create New Place</Button>
```

---

#### 2. Community Focused

**Principle:** Design celebrates local identity and connection.

**In Practice:**
- Local imagery and photography
- Personalized content (town name visible)
- Community achievements highlighted
- Local language support (EN/IS)
- Residents and businesses featured

**Example:**
```tsx
// Personalized header
<h2>Stykkishólmur snapshot</h2>
<p>30 places, 4 businesses, 4 events in calendar</p>
```

---

#### 3. Modern Simplicity

**Principle:** Contemporary aesthetics without unnecessary complexity.

**In Practice:**
- Clean, minimal interfaces
- Generous whitespace
- Subtle shadows and depth
- Modern rounded corners (12px)
- Simple, effective transitions

**Visual Style:**
- Not flat, not skeuomorphic - balanced
- Subtle gradients acceptable, not bold
- Refined shadows for depth
- Rounded but not overly playful

---

#### 4. Trustworthy

**Principle:** Professional appearance inspires confidence.

**In Practice:**
- Consistent visual language
- Reliable, predictable interactions
- Professional color palette
- Clear error handling
- Secure data presentation

**Trust Signals:**
- Official town branding visible
- Clear data sources
- Transparent processes
- Professional presentation
- Consistent quality

---

#### 5. Delightful

**Principle:** Small touches bring joy without distraction.

**In Practice:**
- Smooth micro-interactions
- Helpful empty states
- Encouraging success messages
- Subtle hover effects
- Thoughtful loading states

**Examples:**
- Button scales slightly on hover
- Success message with checkmark
- Friendly empty state with icon and helpful CTA
- Smooth transitions between states

---

## Voice & Tone

### Brand Voice

**Professional but Approachable**

Our voice is like a knowledgeable, helpful colleague - professional and reliable, but friendly and supportive.

**Characteristics:**
- Clear and direct
- Informative without jargon
- Helpful and supportive
- Confident but humble
- Respectful and inclusive

---

### Tone Guidelines

#### When welcoming users:
**Friendly and inviting**

✅ "Welcome to TownHub! Let's get your community connected."
❌ "Hey there! Ready to rock your town?"
❌ "User authentication successful. Proceed to dashboard."

---

#### When explaining features:
**Clear and educational**

✅ "Send targeted notifications to specific groups, like business owners or event attendees."
❌ "Leverage our advanced segmentation engine to maximize engagement."
❌ "You can send stuff to people."

---

#### When showing errors:
**Helpful and solution-focused**

✅ "We couldn't save your changes. Please check your internet connection and try again."
❌ "Error 500: Internal server error."
❌ "Oops! Something went terribly wrong!"

---

#### When celebrating success:
**Encouraging and positive**

✅ "Place created successfully! It's now visible to the community."
❌ "Record inserted into database."
❌ "Woohoo! You're crushing it!"

---

#### When requesting action:
**Direct and respectful**

✅ "To continue, please enter your email address."
❌ "We need your email to proceed."
❌ "Email required or we can't help you."

---

### Writing Style

#### Grammar & Mechanics

**Capitalization:**
- Sentence case for headings and buttons
- Title case for proper nouns only
- ALL CAPS for emphasis only (sparingly)

**Punctuation:**
- Use periods for complete sentences
- Omit periods in single-line UI labels
- Use commas in lists and clauses
- Exclamation points sparingly (success messages only)

**Numbers:**
- Use numerals for counts (12 places, not twelve places)
- Spell out ordinals (first, second, third)
- Use commas in large numbers (1,234)

---

#### Button & CTA Text

**Action-Oriented:**
✅ "Create Place"
✅ "Save Changes"
✅ "Send Notification"

**Not Passive:**
❌ "Place Creation"
❌ "Saving"
❌ "Notification"

**Specific, Not Generic:**
✅ "Delete Place"
❌ "Confirm"
❌ "Submit"

---

#### Form Labels

**Clear and Descriptive:**
✅ "Business name"
✅ "Contact email"
✅ "Subscription tier"

**Not Technical:**
❌ "businessName (string)"
❌ "email_address"

**Required Indicators:**
✅ "Full name *"
✅ "Email address (required)"

---

#### Error Messages

**Structure:** [What happened] + [Why] + [What to do]

✅ **Good:**
"We couldn't upload your image. The file is too large. Please use an image under 5MB."

❌ **Bad:**
"Upload failed."
"File size exceeds maximum allowed value."

---

#### Empty States

**Structure:** [Current state] + [Why it matters] + [Clear action]

✅ **Good:**
"No events scheduled yet. Create your first event to start engaging with your community. [Create Event]"

❌ **Bad:**
"No data available."
"0 events found."

---

### Localization (EN/IS)

TownHub supports English and Icelandic.

#### Translation Principles

**Respect Cultural Context:**
- Use local terminology and conventions
- Adapt tone for cultural appropriateness
- Consider date/time formats
- Use appropriate formality levels

**Maintain Brand Voice:**
- Translations should feel natural, not literal
- Preserve friendliness and professionalism
- Keep clarity and directness

**Technical Consistency:**
- Use consistent terms for UI elements
- Create translation glossary
- Review by native speakers

---

## Application Guidelines

### Admin CMS

**Purpose:** Professional tool for town administrators and staff

**Tone:** Professional, efficient, informative

**Visual Style:**
- Clean, data-dense layouts
- Emphasis on functionality
- Clear information hierarchy
- Professional blue palette dominant

**Content:**
- Direct, action-oriented
- Comprehensive help text
- Clear labeling and organization
- Detailed analytics and metrics

---

### Mobile App

**Purpose:** Community engagement and information for residents

**Tone:** Friendly, welcoming, community-focused

**Visual Style:**
- Warm and inviting
- Prominent imagery (local photos)
- Generous touch targets
- Scrollable, explorable layouts

**Content:**
- Conversational but clear
- Encouraging engagement
- Local and personal
- Timely and relevant

---

### Notifications

**Purpose:** Important updates and community information

**Tone:** Clear, timely, respectful

**Guidelines:**
- **Subject:** Clear and specific (not clickbait)
- **Body:** Concise with key info up front
- **CTA:** One clear action if applicable
- **Frequency:** Respectful of user time (not spam)

**Example:**
```
🎭 New Event: Breibafjorabur Seafood Festival

Join us July 2nd at Harbor Square for fresh seafood,
local music, and family fun. Free entry!

[View Event Details]
```

---

### Marketing Materials

**Purpose:** Attract new towns and businesses to TownHub

**Tone:** Professional, compelling, benefit-focused

**Visual Style:**
- Hero imagery showcasing communities
- Statistics and social proof
- Clean, modern layouts
- Primary blue with warm accents

**Content:**
- Benefit-driven headlines
- Real examples and case studies
- Clear value propositions
- Professional but approachable tone

---

## Usage Examples

### Login Screen

**Visual:**
- Centered white card on light blue-gray background
- TownHub branding at top
- Clean form with clear labels
- Primary blue CTA button

**Copy:**
```
TownHub admin login
Enter your email and password to continue.

[Email field]
[Password field]
[Sign in with password]
```

---

### Dashboard Welcome

**Visual:**
- Personalized header with town name
- Key metrics in stat cards
- Recent activity feed
- Primary actions prominent

**Copy:**
```
Welcome back, Carlos!

Stykkishólmur snapshot
30 places, 4 businesses, 4 events in calendar
```

---

### Empty State: No Events

**Visual:**
- Calendar icon in muted circle
- Heading and description
- Primary CTA button

**Copy:**
```
No events scheduled yet

Create your first event to engage with your community
and keep everyone informed about what's happening.

[Create Event]
```

---

### Success Message: Place Created

**Visual:**
- Green checkmark icon
- Success message
- Auto-dismiss or close option

**Copy:**
```
✓ Place created successfully!

"Hótel Stykkishólmur" is now visible to the community.
```

---

### Error: Upload Failed

**Visual:**
- Alert with warning icon
- Clear error message
- Helpful next steps

**Copy:**
```
⚠ Upload failed

We couldn't upload your image. The file is too large.
Please use an image under 5MB.

[Try Again]
```

---

## Brand Checklist

Use this checklist when creating new content or designs:

### Visual Design
- [ ] Uses TownHub color palette (primary blue, neutrals)
- [ ] Typography uses Inter font family
- [ ] Spacing follows 4px grid system
- [ ] Border radius is 12px for cards, 6-10px for elements
- [ ] Shadows are subtle (shadow-sm or shadow-md)
- [ ] Icons are consistent style (outline, uniform stroke)
- [ ] Accessible color contrast (WCAG AA minimum)

### Content
- [ ] Voice is professional yet approachable
- [ ] Tone appropriate for context (admin/user/marketing)
- [ ] Writing is clear and jargon-free
- [ ] Button text is action-oriented
- [ ] Error messages are helpful and solution-focused
- [ ] Success messages are encouraging
- [ ] Empty states have clear CTAs

### Accessibility
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Focus states are visible
- [ ] Alt text provided for images
- [ ] Form labels are clear and descriptive
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### Brand Consistency
- [ ] Aligns with design principles
- [ ] Matches existing patterns
- [ ] Uses established components
- [ ] Maintains professional quality
- [ ] Reflects community focus

---

## Resources & References

### Design Files
- [TownHub Design Audit Report](/TOWNHUB_DESIGN_AUDIT_REPORT.md)
- [TownHub Design System](/TOWNHUB_DESIGN_SYSTEM.md)
- Design tokens: `/app/globals.css`

### Tools
- **Typography:** [Inter Font](https://rsms.me/inter/)
- **Icons:** [Lucide React](https://lucide.dev/) or [Heroicons](https://heroicons.com/)
- **Colors:** [Coolors.co](https://coolors.co/) for palette exploration
- **Contrast:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Inspiration
- **Admin Dashboards:** Vercel, Linear, Stripe Dashboard
- **Community Apps:** Airbnb, Eventbrite, Nextdoor
- **Government/Municipal:** Modern government websites for tone

---

## Governance

### Brand Stewardship

**Brand Owner:** TownHub Leadership Team
**Design Lead:** Design Team
**Content Lead:** Content & Marketing Team

### Review Process

**Design Reviews:**
1. All new designs reviewed against brand guidelines
2. Quarterly design system audits
3. User testing for major changes
4. Accessibility audits for new features

**Content Reviews:**
1. All user-facing copy reviewed for voice/tone
2. Translation review by native speakers
3. Consistency check against existing content

### Updates to Guidelines

**Minor Updates:**
- Clarifications and examples
- New component patterns
- Additional use cases
- Approved by Design Lead

**Major Updates:**
- Color palette changes
- Typography system changes
- Brand personality shifts
- Require leadership approval

---

## Version History

### Version 1.0.0 (2025-11-20)
- Initial brand guidelines created
- Visual identity defined
- Voice and tone established
- Design principles documented
- Usage examples provided

---

**Maintained by:** TownHub Design Team
**Last Review:** November 20, 2025
**Next Review:** February 2026

**Questions?** Contact the design team or reference this document for brand decisions.

---

## Quick Reference Card

### Colors
- **Primary:** #003580 (Deep Blue)
- **Background:** #f8fafc (Light Blue-Gray)
- **Text:** #0f172a (Near Black)
- **Destructive:** #ef4444 (Red)

### Typography
- **Font:** Inter
- **Headings:** Semibold (600) or Bold (700)
- **Body:** Regular (400) or Medium (500)
- **Line Height:** 1.5-1.6 for body

### Voice
- Professional yet approachable
- Clear and direct
- Helpful and supportive
- Community-focused

### Principles
1. Clarity First
2. Community Focused
3. Modern Simplicity
4. Trustworthy
5. Delightful
