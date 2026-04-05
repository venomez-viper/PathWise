

I have now viewed all 53 screens. Here is the comprehensive, detailed description of every screen.

---

# PATHWISE iOS UI MOCKUP -- COMPLETE DESIGN SPECIFICATION

## GLOBAL DESIGN SYSTEM

### Brand Colors (derived across all screens)
- **Primary Purple**: ~#7C3AED (vibrant purple, used on all primary CTAs, brand logo text, active tab icons)
- **Dark Purple**: ~#5B21B6 (used on splash background, premium banners, gradient bases)
- **Deep Purple Splash BG**: ~#7E22CE to #6B21A8 (solid/gradient for splash)
- **Teal/Cyan Accent**: ~#2DD4BF / #14B8A6 (used for sparkle icons on logo, selected chip accents, progress bars, streak icons, "CURRENT" badges)
- **White**: #FFFFFF (card backgrounds, primary text on purple backgrounds)
- **Off-White/Light Gray BG**: ~#F8F7FC / #F5F3FF (main screen background, very subtle lavender tint)
- **Light Purple Tint**: ~#EDE9FE (card hover states, subtle section backgrounds)
- **Gray Text**: ~#6B7280 (secondary body text, placeholders)
- **Dark Text**: ~#1F2937 / #111827 (headings, primary body)
- **Amber/Gold**: ~#D4A017 (Ethereal Mentor Tip card background, gold achievement badges)
- **Green (Success)**: ~#059669 / #10B981 (checkmarks, verification badges, "VERIFIED" tags, "COMPLETED" labels)
- **Red/Coral (High Priority)**: ~#EF4444 / #DC2626 (HIGH PRIORITY badges, delete account)
- **Orange (Medium Priority)**: ~#F59E0B (MEDIUM PRIORITY badges)
- **Light Teal (Low Priority)**: ~#5EEAD4 (LOW PRIORITY badges)

### Typography
- **App Name "PathWise"**: Bold serif-like or heavy sans-serif, approximately 22-28pt in headers. Always accompanied by the rocket icon to the left.
- **Large Headings (H1)**: Bold, approximately 28-32pt, dark near-black (#1F2937). Examples: "Welcome, Emily!", "Tell us about yourself", "Your Career Matches"
- **Section Headings (H2)**: Semibold, approximately 20-24pt, dark. Examples: "My Learning Path", "Top Career Matches"
- **Card Titles (H3)**: Semibold, approximately 16-18pt.
- **Body Text**: Regular weight, approximately 14-16pt, gray (#6B7280).
- **Label Text (ALL CAPS)**: Spaced tracking, approximately 10-12pt, semibold, all-caps. Examples: "STEP 1 OF 2", "EMAIL ADDRESS", "FULL NAME", "CAREER ROADMAP", "SYNTHESIZING DATA"
- **Button Text**: Semibold, approximately 16-18pt, white on purple buttons, purple on outlined buttons.
- **Tab Bar Labels**: Approximately 10pt, all-caps, spaced.

### Corner Radius
- **Cards**: Large radius, approximately 16-20px.
- **Buttons (primary CTA)**: Fully rounded / pill-shaped (border-radius ~28-32px).
- **Input Fields**: Medium radius, approximately 12-16px.
- **Chips/Tags**: Fully rounded pill shape.
- **Bottom Tab Bar**: Top corners rounded ~20px.

### Shadows & Elevation
- Cards have a very subtle drop shadow, approximately 0 2px 8px rgba(0,0,0,0.06).
- Primary CTA buttons have a slightly deeper shadow, approximately 0 4px 12px rgba(124,58,237,0.3).
- The bottom sheet (Adjust Timeline) uses a stronger shadow with a drag handle indicator.

### Spacing Patterns
- **Screen horizontal padding**: ~20-24px left/right.
- **Card internal padding**: ~16-20px.
- **Section spacing (vertical)**: ~16-24px between major sections.
- **Input field height**: ~48-52px.
- **Primary CTA button height**: ~52-56px.
- **Bottom tab bar height**: ~60-64px plus safe area.

---

## SCREEN-BY-SCREEN DESCRIPTIONS

---

### 1.1 SPLASH SCREEN

**Background**: Solid deep purple (#7E22CE / #7C3AED), completely fills the screen edge to edge.

**Center Content (vertically centered)**:
- **App Icon**: A rounded square (~56x56px) with a slightly lighter purple background containing a white open-book icon (left page white, right page has horizontal lines suggesting text). To the upper-right of the book is a sparkle/star cluster in cyan/teal (#2DD4BF) -- two small diamond stars.
- **App Name**: "PathWise" in white, bold, approximately 32pt, centered below the icon with ~12px gap.
- **Tagline**: "Your AI-powered career co-pilot." in white, regular weight, approximately 16pt, centered below the name with ~8px gap.

**Bottom**: Near the very bottom of the screen (above safe area), the text "INITIALIZING INTELLIGENCE" in all-caps, spaced tracking, approximately 10pt, in a muted light purple/lavender (#C4B5FD or similar), centered.

**Animation Hints (from prototyped variants)**:
- Prototyped_1 and _2 are nearly identical to the main splash -- the icon and text appear in place suggesting a fade-in animation.
- Prototyped_3 shows a transitional state where the icon elements ("menu_book" and "auto_awesome" as Material Design icon names) are displayed as large placeholder text in white and cyan, suggesting the splash assembles these icon elements before they coalesce into the final icon. This implies: (1) The book icon fades/scales in, (2) The sparkle animates in separately, (3) The name and tagline fade in sequentially, (4) "INITIALIZING INTELLIGENCE" appears last as a loading state.

---

### 1.2 ONBOARDING CAROUSEL

**Background**: White (#FFFFFF) with very subtle lavender gradient at the top.

**Top Bar**: "PathWise" logo with rocket icon on the left (~16pt, purple). "SKIP" text link on the upper right in dark gray/purple.

**Hero Illustration (upper half)**: 
- A circular dark frame (~140px diameter) containing a grayscale professional headshot photo of a man in a suit.
- Floating around this circle are small UI element cards:
  - Upper left: A small lilac/lavender angled card shape.
  - Upper right: A small card labeled "Professional Profile" with a person icon, plus a pink/magenta circle with a chat/person icon.
  - These floating elements are rotated slightly for a dynamic, playful feel.

**Text Content (lower half)**:
- **Heading**: Two lines, centered. "Discover Your" in bold black (~28pt), "Career Identity" in bold italic purple (#7C3AED, ~28pt).
- **Body**: "Take a quick assessment and uncover the career paths that match your unique strengths." -- Regular weight, gray (#6B7280), ~14pt, centered, ~3 lines.

**CTA Section**:
- **Primary Button**: "Get Started" -- pill-shaped, solid purple (#7C3AED) background, white text, ~52px tall, full width minus padding. Has a subtle shadow.
- **Secondary Text**: "Already have an account? Log In" -- "Log In" is a bold/underlined purple link.

**Prototyped variants** (_1 and _2): Visually identical to the main screen, confirming this is a single carousel page or the animation between pages is not captured differently. The carousel likely has multiple pages indicated by page dots (not visible in this frame -- may be hidden or off-screen).

---

### 1.3 SIGN UP SCREEN

**Background**: Very light lavender/off-white (#F8F7FC) with a subtle gradient -- slightly more purple-tinted at the very bottom edges.

**Top**: "PathWise" logo centered with rocket icon, purple text (~20pt).

**Card Container**: A large white card with ~20px corner radius, slight shadow, takes up most of the screen. Internal padding ~24px.

**Card Content**:
- **Heading**: "Create your account" -- Bold, dark, ~28pt, centered.
- **Subtitle**: "Join the professional growth ecosystem." -- Regular, gray, ~14pt, centered.

**Social Auth Buttons** (horizontal row, 3 buttons):
- Google (colorful G icon), Apple ("iOS" text), and a third service (monitor/desktop icon). Each is a rounded rectangle (~60x48px), light gray border, white fill. Evenly spaced.

**Divider**: A horizontal line with "OR CONTINUE WITH EMAIL" centered in all-caps, spaced tracking, gray, ~10pt.

**Form Fields** (stacked vertically, ~16px gap):
1. **FULL NAME** (label in all-caps, ~10pt, semibold, dark):
   - Input field with person icon (gray) on left, placeholder "John Doe" in gray, light gray background (#F3F4F6), rounded ~12px, ~48px height.
2. **EMAIL** (same label style):
   - Input field with envelope icon on left, placeholder "john@company.com".
3. **PASSWORD** (same label style):
   - Input field with lock icon on left, dots for password mask, eye icon on the right for toggle visibility.

**Primary CTA**: "Sign Up" -- pill-shaped purple button, full card width, white text, ~52px tall.

**Toggle Text**: "Already have an account? Log In" -- "Log In" is a purple bold link.

**Footer (below card)**: Small text: "By creating an account, you agree to PathWise's Terms of Service and Privacy Policy. We use your data to personalize your career roadmap." -- ~10pt, gray, centered. "Terms of Service" and "Privacy Policy" are underlined links.

**Prototyped variant _2** (larger/desktop view): Same layout scaled up, social buttons are larger squares, input fields taller, same structure. All-caps legal text at the bottom.

---

### 1.4 LOG IN SCREEN

**Background**: Same light lavender tint.

**Top**: "PathWise" logo with rocket icon, centered, purple, ~24pt.

**Card Container**: White card with rounded corners, shadow, starts slightly below the logo.

**Card Content**:
- **Heading**: "Welcome back" -- Bold, dark, ~30pt, left-aligned.
- **Subtitle**: "Continue your journey to career mastery." -- Regular, gray, ~14pt, left-aligned.

**Form Fields**:
1. **EMAIL ADDRESS** (all-caps label, semibold):
   - Input with envelope icon, placeholder "name@example.com", rounded light gray background.
2. **PASSWORD** (all-caps label, with "Forgot password?" as a purple link aligned to the right of the label):
   - Input with lock icon, password dots, eye icon on right.

**Primary CTA**: "Log In" with right arrow icon -- pill-shaped, purple gradient (slightly lighter on left, deeper on right, or solid purple with shadow), white text, ~56px tall, full width.

**Divider**: Line with "OR CONTINUE WITH" centered, all-caps, gray.

**Social Auth** (2 buttons side by side):
- "Google" with Google icon -- rounded rectangle, light gray border/fill.
- "Apple" with iOS icon -- same style.

**Toggle**: "Don't have an account? Sign Up" -- "Sign Up" is purple bold link.

**Footer**: Three links in a row at the very bottom: "PRIVACY POLICY", "TERMS OF SERVICE", "SUPPORT" -- all-caps, spaced, gray, ~9pt.

**Prototyped variants** (_1, _2): Identical to the main login screen, confirming the static state.

---

### 1.5 FORGOT PASSWORD

**Background**: Soft abstract gradient -- warm pastel tones (peach, pink, light lavender) at the bottom half, white/light at the top.

**Top Left**: A circular back arrow button (~36px, purple outline on white/light fill, left-pointing arrow icon).

**Top Center**: A purple circle icon (~48px) containing a shield or lock symbol.

**Heading**: "Reset your password" -- Bold, dark, ~26pt, centered.

**Body**: "Enter the email associated with your PathWise account and we'll send a secure reset link." -- Regular, gray, ~14pt, centered.

**Form Card** (white card with rounded corners, floating above the gradient):
- **EMAIL ADDRESS** label (all-caps).
- Input with envelope icon, placeholder "name@career.com", gray background.
- **CTA**: "Send Reset Link" -- pill-shaped purple button, white text, full width.

**Footer Link**: "Back to Log In" with a left arrow icon, centered, dark text, ~14pt.

---

### 1.6 RESET EMAIL SENT

**Background**: White top, very subtle lavender/light gray gradient at bottom edges.

**Top Left**: "PathWise" logo with rocket icon, purple.

**Illustration**: A purple/indigo envelope icon (~64px) with a small green check circle badge at the bottom-right of the envelope.

**Heading**: "Check your inbox" -- Bold, dark, ~26pt, centered.

**Body**: "We've sent a password reset link to **emily@email.com**" -- email is bold/dark. Regular gray text, centered.

**Primary CTA**: "Open Email App" -- outlined button (purple border, white fill, purple text), pill-shaped, full width, ~48px tall.

**Secondary Links**:
- "Didn't receive the email? Resend" -- "Resend" is a purple link.
- "Back to Log In" with left arrow, centered.

**Footer**: "CAREER COACHING SIMPLIFIED" in all-caps, spaced, light gray, ~9pt.

---

### 1.7 EMAIL VERIFICATION

**Background**: White with subtle lavender tint at the bottom.

**Top Left**: "PathWise" logo with rocket icon.

**Illustration**: A white rounded-square container with a purple/indigo envelope icon and a small teal/cyan sparkle dot.

**Heading**: "Verify your email" -- Bold, dark, ~24pt, centered.

**Body**: "We've sent a magic link to **sarah.j@design.co** to confirm your account." -- email is purple/teal link color. Gray body text.

**Primary CTA**: "Open Email App" -- outlined button, purple border, white fill, purple text, pill-shaped.

**Secondary Links**:
- "Didn't receive the email?" -- gray text.
- "Resend Verification" -- purple bold underlined link.
- "+ Back to sign in" -- small text with plus/arrow, dark.

---

### 2.1 PROFILE SETUP -- ABOUT YOU (Steps 1 & 2 are identical)

**Background**: Light lavender/off-white (#F5F3FF).

**Top Bar**: "PathWise" rocket logo on left, purple. Help icon (circle with "?" ) on right, gray outline.

**Progress Section**:
- "STEP 1 OF 2" -- purple all-caps label, ~10pt.
- "50% Complete" -- right-aligned, gray text, ~12pt.
- Progress bar: full width, ~6px height. Left half is a gradient from teal (#14B8A6) to purple (#7C3AED). Right half is light gray (#E5E7EB). Rounded ends.

**Card Container**: White card, ~20px radius, shadow, padding ~24px.

**Heading**: "Tell us about yourself" -- Bold, dark, ~26pt.
**Subtitle**: "Help us customize your career roadmap by sharing your professional background." -- Regular, gray, ~14pt.

**Form Fields** (stacked, ~16px vertical gap):
1. **Current role** (bold label, ~14pt):
   - Input with briefcase icon, placeholder "e.g. Product Designer", gray bg, rounded.
2. **Experience** (bold label):
   - Dropdown selector, "Select years" placeholder, chevron-down icon on right, gray bg.
3. **Education** (bold label):
   - Dropdown selector, "Highest level", graduation-cap icon on right, gray bg.
4. **Industry** (bold label):
   - Multi-select chip group, 2-column flow layout:
     - "Tech" -- selected state: solid purple/teal fill (#7C3AED or muted purple), white text, white checkmark.
     - "Marketing" -- unselected: light gray border, gray text.
     - "Finance" -- selected state: lighter teal/mint outline with checkmark, slight green tint.
     - "Healthcare" -- unselected.
     - "Education" -- unselected.
     - "Design" -- unselected.
   - Chips are pill-shaped, ~36px height, ~8px gap between.

**Primary CTA**: "Continue" with right arrow -- pill-shaped purple button, white text, full card width, ~52px.

**Secondary**: "Skip for now" -- purple text link, centered below button.

**Mentor Tip Card** (below the main card, ~16px gap):
- Beige/amber background (~#FDF6E3), rounded ~12px.
- Left: small green circle icon.
- **Title**: "Ethereal Mentor Tip" -- bold, dark, ~14pt.
- **Body**: "Completing your profile now increases career match accuracy by 85%. You can always update this later." -- regular, dark, ~12pt.

**Footer**: "DIGITAL ATELIER 2024" -- light gray, centered, ~9pt, all-caps.

---

### 2.2 PROFILE SETUP -- YOUR GOALS

**Background**: Light lavender, fading to a more purple-tinted gradient at the very bottom.

**Top Bar**: PathWise logo left, profile avatar (small circle, teal border with dark photo) on the right.

**Progress**: "STEP 2 OF 2", "COMPLETION: 100%" in teal/green text. Progress bar fully filled with purple-to-teal gradient.

**Heading**: "What are your career goals?" -- Bold, dark, ~26pt, centered.
**Subtitle**: "Let's map out where you want to go. We'll use this to tailor your daily roadmap." -- regular, gray, centered.

**Section 01: "I want to become a..."** (numbered "01." in purple):
- Chip group, flowing 2-column:
  - "Product Manager" -- selected (solid dark purple #5B21B6, white text).
  - "UX Designer" -- unselected (gray border, gray text).
  - "Data Scientist", "Marketing Lead", "Software Architect" -- unselected.
  - "+ Other" -- chip with plus icon, gray.

**Section 02: "Target timeline"** (numbered "02." in purple):
- Horizontal selector, 4 options in a row:
  - "3m", "6m" (selected -- circular border, purple outline, bold), "1y", "Not sure".
  - Selected state: text inside a circle or with a circular purple border.

**Section 03: "What matters most?"** (numbered "03." in purple):
- 2x2 grid of square-ish cards (~80x80px each):
  - "SALARY" -- icon (money/dollar), label below. Unselected: white bg, gray icon/text.
  - "GROWTH" -- icon (upward trend line), label. Selected: teal/purple outline, teal icon.
  - "BALANCE" -- icon (scales), label. Selected: light teal bg tint, teal text.
  - "IMPACT" -- icon (star/burst), label. Unselected.
- Selection seems to allow multiple. Selected cards have a colored border/tint.

**Primary CTA**: "Start My Assessment" with right arrow -- pill-shaped purple button, white text, full width, prominent at the bottom.

**Secondary**: "Skip for now" -- purple text link.

---

### 2.3 PROFILE PHOTO UPLOAD

**Background**: White top, very subtle cyan/lavender gradient at bottom.

**Top**: "PathWise" with rocket icon, centered, plus "PROFILE SETUP" in all-caps gray below it.

**Photo Area**: 
- Large circular placeholder (~140px diameter), light gray background.
- Default person silhouette icon in darker gray.
- Small purple circle (~32px) with white camera icon overlapping the bottom-right of the circle.

**Heading**: "Add a profile photo" -- Bold, dark, ~22pt, centered.
**Body**: "Personalize your journey. A photo helps mentors and peers recognize you in the workspace." -- regular, gray, centered.

**Buttons (stacked)**:
1. "Take Photo" -- pill-shaped purple solid button, camera icon on left, white text, ~48px.
2. "Choose from Library" -- pill-shaped outlined button (purple border, white fill, purple text), image icon on left, ~48px.

**Skip**: "Skip for now" -- dark text, centered, underlined or plain.

---

### 3.1 ASSESSMENT INTRO (both _1 and _2 are identical)

**Background**: White, subtle lavender tint.

**Top Bar**: PathWise rocket logo left. Small profile avatar circle on the upper right.

**Illustration**: A circular light lavender/purple background (~80px) containing a purple brain/gear icon (a stylized head with gear, or puzzle-piece brain in purple).

**Heading**: "Let's find your career fit" -- Bold, dark, ~26pt, centered.
**Body**: "This quick assessment evaluates your skills, interests, and personality to match you with the right career paths." -- regular, gray, centered.

**Info Badges** (horizontal row, 3 items):
- Green dot + "~5 minutes"
- Document icon + "32 questions"
- Sparkle icon + "AI-analyzed"
- Each in gray text, ~12pt, spaced evenly.

**Primary CTA**: "Begin Assessment" -- pill-shaped purple button, white text, ~48px, full width.

**Bottom Tab Bar** (5 tabs):
- HOME (house icon), ROADMAP (branching path icon -- active/highlighted with purple fill and purple text), TASKS (clipboard icon), PROGRESS (bar chart icon), SETTINGS (gear icon).
- Active tab: purple icon, purple text. Inactive: gray icon, gray text.
- Tab bar has a white background with a slight top border/shadow.

**Prototyped variant**: Identical but with "I'LL DO THIS LATER" text below the CTA instead of the tab bar being the only difference, suggesting an alternate dismissal option.

---

### 3.2 ASSESSMENT QUESTION

**Background**: White with very subtle lavender gradient on the left edge.

**Top Bar**: Left arrow "BACK" text, centered "PathWise" logo, "SKIP" text on right.

**Progress Section**:
- "Skills -- Question 4" in bold dark text left, "12 OF 32" right-aligned in gray.
- Progress bar below: ~37% filled with purple-to-teal gradient, remainder gray. ~4px height.

**Question**: "Which of these activities energizes you most?" -- Bold, dark, ~24pt, left-aligned.

**Answer Options** (4 stacked cards, ~16px gap):
Each is a white card with rounded corners (~16px radius), subtle shadow, ~64px height, full width:
1. **"Analyzing trends in data"** -- left icon: blue/purple bar-chart icon on a light purple square background (~40px). Text is regular dark, ~16pt.
2. **"Presenting ideas to a team"** -- left icon: purple people/presentation icon on light purple bg. **Selected state**: The card has a purple border (~2px), and a teal/green filled checkmark circle on the right side.
3. **"Designing visual layouts"** -- left icon: pink/purple palette icon on light bg.
4. **"Writing strategic plans"** -- left icon: purple clipboard icon on light bg.

**Primary CTA**: "Continue" with right arrow -- pill-shaped purple button at bottom, full width. In the unselected prototyped variant, the button appears grayed out / lower opacity, suggesting it is disabled until an answer is selected.

---

### 3.4 ASSESSMENT PROCESSING

**Background**: White with a very subtle gradient (light cyan/lavender at edges).

**Center Illustration**:
- A large thin-stroke circle (~180px diameter) in light cyan/teal (#B2F5EA or similar).
- Inside the circle: a white filled circle (~80px) containing the purple PathWise rocket icon.
- This circle likely animates (spinning ring).

**Brand Text**: "PathWise" in purple, ~24pt, centered below the circle. "ETHEREAL MENTOR AI" in all-caps, spaced, gray, ~10pt.

**Processing Steps** (stacked list, centered):
1. Green dot + "Analyzing your skill profile..." -- active/in-progress, bold dark text.
2. Gray chat-bubble icon + "Mapping personality traits..." -- pending, gray text.
3. Gray chat-bubble icon + "Matching career paths..." -- pending, gray text.

**Progress Bar**: Full width near the bottom, ~6px. Partially filled with a multi-color gradient (teal to green to purple). "SYNTHESIZING DATA" left-aligned below, "65% COMPLETE" (or "85% COMPLETE" in prototyped variant) right-aligned, purple text.

**Bottom Icons** (3 items, evenly spaced):
- Brain icon + "COGNITIVE"
- Shield/badge icon + "EXPERIENCE"  
- Sparkle/trajectory icon + "TRAJECTORY"
- All in gray/purple, small ~10pt labels.

**Prototyped variant**: Same layout but at 85% complete, with "Mapping personality traits..." as the active step and "TAP ANYWHERE TO VIEW RESULTS" text at the bottom, suggesting the processing animation advances through the three steps sequentially.

---

### 3.5 ASSESSMENT RESULTS

**Background**: White/light gray.

**Top Bar**: PathWise logo left, profile avatar right.

**Heading**: "Your Career Matches" in bold with a purple sparkle icon before it, ~24pt. Text appears to have a slight purple tint/gradient.

**Subtitle**: "Based on your cognitive strengths and professional experience, we've identified the paths where you'll thrive most." -- regular, gray, ~14pt.

**Top Match Card** (prominent, centered):
- A donut/ring chart (~100px) in teal/dark-green, showing approximately 88% filled.
- Green badge below chart: "BEST MATCH" in all-caps, white text on green (#059669) pill.
- **Role Name**: "Marketing Analyst" -- Bold, dark, ~22pt, centered.
- **Description**: "Strategic thinking & data visualization expertise." -- gray, centered.
- **Tags**: Two light gray chips: "Data Science", "Market Trends".

**Primary CTA**: "View My Roadmap" -- pill-shaped button with a teal-to-purple gradient background, white text, roadmap icon on the left. ~48px tall, full width.

**Secondary**: "Retake Assessment" with a refresh icon -- purple text link, centered.

**Other Strong Paths Section**:
- Heading: "Other Strong Paths" -- bold, ~18pt.
- Two list items, each as a card/row:
  1. Purple icon + "Data Analyst" (bold) + "Technical analysis & SQL mastery" (gray) + "84% MATCH" (teal, right-aligned).
  2. Purple icon + "Product Manager" (bold) + "Visionary leadership & roadmapping" (gray) + "72% MATCH" (purple, right-aligned).

**Bottom Tab Bar**: Same 5-tab structure. TASKS tab is highlighted/active.

---

### 4.2 HOME -- PRE-ASSESSMENT

**Background**: White/off-white.

**Top Bar**: PathWise logo left, profile avatar (dark circle with photo) right.

**Welcome Section**:
- "Welcome, Emily!" in bold dark, ~28pt.
- "Let's get started." in bold purple (#7C3AED), ~28pt.
- Body paragraph explaining the journey, regular gray text.
- **CTA**: "Start Assessment" with right arrow -- dark/near-black pill button, white text, ~40px, compact width (not full-width).

**Compass Illustration**: A large card with a realistic 3D compass image (gold/brass compass on dark background). White card, rounded corners, shadow. ~200px tall.

**Locked Content Area**: 
- Grayed-out / faded cards suggesting locked sections.
- Lock icon (purple) with text "Complete assessment to unlock" in bold purple.
- "Gain access to your career analytics and AI matching" -- gray text.

**Methodology Section**:
- **Title**: "The PathWise Methodology" with a play/info icon.
- **Body**: "Our AI analyzes over 15,000 career trajectories to map your unique professional DNA."
- Two info pills: purple icon + "Cognitive Assessment", purple icon + "Skill Validation".

**Fast-Track Banner**: Dark purple/violet card at bottom:
- Lightning bolt icon.
- "Fast-Track Your Growth" -- bold white, ~20pt.
- "Assessment takes less than 10 minutes and unlocks 100% of PathWise features." -- white/light text.

**Bottom Tab Bar**: 5 tabs, HOME is active (filled purple house icon).

---

### REFINED HOME DASHBOARD (Post-Assessment)

**Background**: Light lavender/off-white.

**Top Bar**: PathWise logo left, notification bell icon center, profile avatar right.

**Welcome Banner**: A card with purple gradient background (deep purple #5B21B6 to purple #7C3AED):
- "Welcome back, Emily!" -- bold white, ~22pt.
- "Your journey to the top of your career is accelerating." -- white, ~14pt.
- Green checkmark + "CAREER ASSESSMENT 100% COMPLETED" -- all-caps, white, ~10pt.
- "VIEW MY ROADMAP" -- small outlined white button/pill, ~10pt, all-caps.

**Metric Cards** (3 stacked cards, white bg, rounded, shadow):
1. **Roadmap Completion**: Purple branching-path icon in a light lavender circle. "32%" in bold purple, right-aligned. "Roadmap Completion" label. Blue progress bar below (~32% filled).
2. **Tasks Finished**: Document icon in light lavender circle. "05" in bold teal/green. "Tasks Finished" label. "3 tasks remaining this week" in gray.
3. **Job Readiness**: Star/badge icon in light amber circle. "45%" in bold dark text. "Job Readiness" label. Yellow/amber progress bar below (~45% filled).

**Top Career Matches Section**:
- Heading: "Top Career Matches" -- bold, ~20pt.
- Subtitle: "Based on your skills and personality assessment" -- gray.
- Three career match cards (stacked vertically, white bg, rounded), each containing:
  - A circular donut/ring chart (teal, showing the percentage).
  - Percentage in bold teal inside the ring: "88%", "84%", "72%".
  - Role name bold below chart.
  - Short description in gray.
  - "View Details" outlined button at the bottom.

**Bottom Tab Bar**: 5 tabs, HOME active.

---

### REFINED HOME MOBILE

Nearly identical to the Refined Home Dashboard. Differences:
- No notification bell icon (just logo and avatar).
- Career match cards show the donut chart centered above the text rather than to the side, making a more vertical card layout.
- Otherwise same metric cards, same welcome banner, same structure.

---

### UPDATED ROADMAP PATH

**Background**: White/light gray.

**Top Bar**: PathWise logo left, profile avatar right.

**Target Header Card** (white card, rounded):
- "CURRENT TARGET" -- all-caps, gray, ~10pt.
- "Marketing Analyst" -- bold purple, ~28pt.
- Circular progress ring (small, ~40px) showing 32%, right-aligned.
- Two chips below: calendar icon + "6 Months Timeline", brain icon + "Advanced Track" (green/teal bg).
- Two action chips: purple pencil icon + "Adjust Timeline" (purple bg, white text), plus icon + "Add Custom Task" (gray outlined).

**Skill Gap Indicator Card** (white bg, rounded):
- "Skill Gap Indicator" -- bold, ~18pt, with a sparkle icon.
- "2 MISSING SKILLS IDENTIFIED" -- all-caps, gray, right-aligned.
- Two sub-cards listing missing certifications:
  1. Google icon + "Google Data Analytics Professional Certificate" + "Recommended for core technical foundation" + right arrow.
  2. Meta icon + "Meta Marketing Analytics Certificate" + "Advanced tracking and attribution mastery" + right arrow.

**My Learning Path Section**:
- Three sub-sections with icons and headings:

**COURSES** (graduation cap icon):
- Cards with colored left border:
  - "Learn SQL basics" -- "HIGH PRIORITY" red badge, "4 of 12 modules completed", three-dot menu.
  - "Marketing Analytics Fundamentals" -- "MEDIUM PRIORITY" orange badge, "Course by Google Analytics Academy".

**PROJECTS** (rocket icon):
- "Portfolio Audit" -- "LOW PRIORITY" teal badge, description text.
- "E-commerce Data Project" -- "HIGH PRIORITY" red badge, description.

**NETWORKING** (people icon):
- "Industry Coffee Chat" -- "MEDIUM PRIORITY" orange badge, description.
- "+ New Networking Task" button at the bottom (light gray, plus icon).

**Bottom Tab Bar**: ROADMAP tab is active (purple filled branching-path icon).

---

### 5.2 ADJUST TIMELINE (Bottom Sheet)

**Background**: The roadmap screen is dimmed/blurred behind a white bottom sheet.

**Bottom Sheet**:
- Drag handle indicator (small gray bar, ~40px wide, centered at top).
- **Heading**: "Adjust your timeline" -- bold, ~24pt.
- **Subtitle**: "Current: 6 months (Jan 2024 -- July 2024)" -- purple text.

**Timeline Options** (4 stacked cards, white bg, rounded, border):
1. **3m** -- "Accelerated" bold, "~16 hrs/week effort" gray. Lightning bolt icon right. Unselected: gray border.
2. **6m** -- "Standard Pace" bold, "~8 hrs/week effort" gray. "RECOMMENDED" teal/green badge, right-aligned. **Selected**: purple border (~2px).
3. **9m** -- "Relaxed" bold, "~5 hrs/week effort". Leaf icon right. Unselected.
4. **12m** -- "Extended" bold, "~3 hrs/week effort". Calendar icon right. Unselected.

**Info Line**: Blue info circle + "Estimated weekly time: ~8 hrs/week" -- gray with bold "~8 hrs/week".

**Primary CTA**: "Update Timeline" -- pill-shaped purple button, white text, full width, ~52px.
**Secondary**: "Keep Current Settings" -- dark bold text link, centered.

---

### 5.4 COURSE DETAIL

**Background**: White.

**Top Bar**: Back arrow left, "Learn SQL Basics" title, "HIGH PRIORITY" red badge, bookmark icon right.

**Course Header Card** (dark/gradient bg, purple-tinted, rounded):
- Coursera logo (teal circle with "C").
- "Mastering Database Foundations" -- bold white, ~22pt.
- Description text in lighter white/gray.
- Progress pill: "YOUR PROGRESS 33%" -- white text on semi-transparent bg. Progress bar below (~33% filled, teal/green).
- "4 of 12 modules completed" -- white text.

**Curriculum Section**:
- "Course Curriculum" -- bold, ~18pt. "12 Modules" and "18h Total" as gray pills.
- Module list (vertical):
  1. "01. Introduction to Relational Databases" -- green checkmark circle, "COMPLETED" label, strikethrough text, gray description.
  2. "05. Filtering & Aggregating Data" -- "CURRENT" teal badge, with a "Continue" purple button on the right. Highlighted with a subtle purple left border.
  3. "06. Advanced Table Joins" -- lock icon, gray text (locked).
  4. "07. Subqueries and Common Table Expressions" -- three-dot menu, gray (locked).

**Bottom CTA**: "Continue Learning" -- pill-shaped purple button, full width, ~48px.

---

### 5.5 PROJECT DETAIL

**Background**: White.

**Top Bar**: Profile avatar left, "PathWise" text, microphone/podcast icon right.

**Project Header Card** (gradient/abstract purple-pink-white textured background):
- "HIGH PRIORITY" badge (red with exclamation icon).
- "E-commerce Data Project" -- bold dark, ~24pt.
- Long description text in gray.

**Project Objectives Section**:
- Purple checkmark icon + "Project Objectives" heading.
- Checklist with empty square checkboxes:
  1. "Source dataset from Kaggle Marketplace Analytics"
  2. "Perform Python-based data cleaning and ETL"
  3. "Create 3 interactive visualizations (Tableau or Seaborn)"
  4. "Publish Summary Report on GitHub Portfolio"

**Info Cards**:
- **Estimated Time**: Clock icon, "12-15 Hours of focused work" -- light bg card.
- **Skills Gained**: Green pin icon, "Pandas, Matplotlib, Data Wrangling" -- light teal bg card.

**Resources Section**:
- "Resources" heading with document icon.
- Three resource list items (link icon + title + source):
  1. "Dataset: E-comm 2024" -- kaggle.com link
  2. "Python Cleaning Tutorial" -- Course Module 4.2
  3. "Viz Best Practices" -- PDF Guide, 2.4MB

**Bottom CTA**: "Mark as Complete" -- pill-shaped purple button with double-checkmark icon, full width.

**Help Link**: "Stuck on the cleaning phase? Ask a Mentor" -- purple link.

**Bottom Tab Bar**: 5 tabs (PATH, LEARN, PROJECTS active, STREAKS, PROFILE).

---

### 5.6 NETWORKING DETAIL

**Background**: White.

**Top Bar**: Profile avatar, "PathWise", microphone icon.

**Header**:
- "CAREER ROADMAP - PHASE 5.6" in all-caps gray.
- "Industry Coffee Chat" -- bold, ~24pt.
- Description paragraph in gray.

**Contact Tracker** (section heading with green "0/3 COMPLETED" badge):
- Three repeating contact entry forms, each containing:
  - **FULL NAME** -- text input, placeholder "e.g. Sarah Jenkins".
  - **COMPANY** -- text input, placeholder "e.g. Goldman Sachs".
  - **STATUS** -- dropdown, "To Contact" in purple, chevron-down.
  - **DATE** -- date picker input, "mm/dd/yyyy", calendar icon right.
- Each form block is separated by a light divider. Left border accent on the first entry (purple line).

**Conversation Starter Card** (teal/green bg, rounded):
- "Need a conversation starter?" -- bold white.
- "Use our proven Outreach Template." -- white text.
- "Copy Message Template" -- outlined white button.

**Pro Tips Card** (light amber/yellow bg, rounded):
- Lightbulb icon + "Pro Tips" heading.
- Numbered list (01, 02, 03) of networking advice tips.

**Your Progress** (bottom section):
- Blue progress bar showing partial completion.
- "You've completed 14/24 tasks in this career path. Keep the momentum!"
- "View Full Roadmap" outlined button.

**Bottom Tab Bar**: PATH active.

---

### TASKS WITH DAILY/WEEKLY TOGGLE

**Background**: White/off-white.

**Top Bar**: PathWise logo left, profile avatar right.

**Heading**: "Stay on track with today's priorities" -- bold, dark, ~24pt.

**Target Info Bar** (light gray bg, rounded, compact):
- "TARGETING" label + "Marketing Analyst" in purple.
- "PROGRESS" label + "32%" in purple.

**Progress Bar**: Full width, ~6px. Teal portion (~32%) with gray remainder.

**Toggle**: Two-segment control (pill shape, full width):
- "Daily" -- selected: white bg, bold dark text, slight shadow/elevation.
- "Weekly" -- unselected: transparent bg, gray text.
- The toggle container has a light gray background.

**Task List** (3 stacked cards, white bg, rounded, shadow):
1. Circle checkbox (empty/gray) + "Complete 'SQL Basics Module 1'" bold + clock icon + "30 mins" gray + right chevron.
2. Circle checkbox + "Connect with 1 Marketing Analyst on LinkedIn" bold + network icon + "Networking" label + right chevron.
3. Circle checkbox + "Review 2 Job Descriptions" bold + document icon + "Market Research" label + right chevron.

**Primary CTA**: "COMPLETE TASKS" with sparkle icon -- pill-shaped purple button, all-caps white text, full width, ~56px. Prominent and bold.

**Footer Text**: "ESTIMATED TIME: 45 MINUTES" -- all-caps, gray, centered.

**Bottom Tab Bar**: TASKS is active (highlighted with purple bg circle behind the icon).

---

### 6.3 TASK COMPLETION CELEBRATION

**Background**: White with subtle gradient.

**Illustration**: A teal/green trophy icon (~56px) centered at top.

**Heading**: "Great work, Emily!" -- bold, dark, ~26pt, centered. Party popper emoji below.

**Body**: "You've completed all 3 tasks for today." -- regular, gray, centered.

**Stat Cards** (2 side-by-side cards):
- **GROWTH**: Trend-up icon, "+5% job readiness" bold teal.
- **CONSISTENCY**: Fire icon, "4 day streak" bold.
- Both cards: white bg, rounded, ~120px wide, light shadow.

**Weekly Goal Card** (white bg, slight purple tint, rounded):
- "WEEKLY GOAL" all-caps label.
- "Mid-Week Milestone" bold, "85%" in teal right-aligned.
- Progress bar: ~85% filled (teal/green gradient, remainder gray).
- "Only 2 more tasks to reach your weekly personal best!" italic gray.

**Primary CTA**: "View Tomorrow's Tasks" -- pill-shaped purple button, full width.
**Secondary**: "Back to Home" -- purple text link.

---

### 6.4 TASKS EMPTY STATE

**Background**: White.

**Top Bar**: PathWise logo, profile avatar.

**Illustration**: A floating white card at center with two completed task rows (green checkmarks on gray lines) and a teal star badge -- gives the impression of a completed checklist. Small sparkle icons around it (gold).

**Heading**: "You're all caught up!" -- bold, dark, ~26pt, centered.
**Body**: "No tasks for today. Enjoy the break or explore your roadmap to see what's coming up next in your career journey." -- regular, gray, centered.

**Primary CTA**: "Explore Roadmap" -- pill-shaped purple button, ~48px, not full-width (centered, compact).
**Secondary**: "Add a Custom Task" -- purple underlined text link.

**Bottom Tab Bar**: TASKS active.

---

### SIMPLIFIED PROGRESS DASHBOARD

**Background**: Light lavender/off-white.

**Top Bar**: PathWise logo, profile avatar.

**Hero Card** (white bg, large, rounded):
- Large donut/ring chart (~160px), teal/dark-green stroke, showing 73%.
- "73%" bold, ~36pt, centered inside the ring.
- "READY" all-caps gray label below the number.
- **Heading below chart**: "Overall Job Readiness" -- bold purple, ~24pt, centered.
- **Body**: "You're making exceptional progress! Your profile strength is in the top 15% of aspiring Marketing Analysts this month." -- regular, gray, centered.
- **Trend Badge**: Purple pill with trend-up icon + "+12% from last week" -- purple text on light purple bg.

**Tasks Summary Card** (white bg, rounded):
- Document icon in light lavender circle.
- "24 / 32" bold, right-aligned (~24pt).
- "Tasks Summary" label, "8 tasks remaining this week" gray subtitle.
- Progress bar: ~75% filled (purple), remainder gray.

**Roadmap Completion Card** (white bg, light teal left accent):
- Branching-path icon in light teal circle.
- "32%" bold, right-aligned.
- "Roadmap Completion" label, "Level 2: Strategic Specialist" subtitle.
- Blue/purple progress bar ~32%.

**Skill Roadmap Progress Section**:
- Heading: "Skill Roadmap Progress" -- bold, ~18pt.
- Four skill bars (stacked, white bg cards):
  1. "Data Analysis (SQL)" -- "85%" purple. Progress bar 85% filled (purple).
  2. "Market Research" -- "60%". Progress bar 60% (blue/purple).
  3. "Visualization (Tableau)" -- "40%". Progress bar 40%.
  4. "Digital Marketing" -- "25%". Progress bar 25%.

**Bottom Tab Bar**: PROGRESS active (purple filled bar-chart icon).

---

### UPDATED SETTINGS / PROFILE

**Background**: Light lavender.

**Top Bar**: PathWise logo, profile avatar (photo in circle).

**Profile Card** (white bg, rounded):
- "PREMIUM MEMBER" -- all-caps purple label, ~10pt.
- "Emily Carter" -- bold, ~26pt.
- Target icon + "Marketing Analyst goal" -- gray text.
- **"Edit Profile"** -- dark purple button, pill-shaped, white pen icon, full width inside the card.

**Goal Timeline Card** (nested in profile card or separate):
- "Goal Timeline" bold, "6 Months remaining" in teal/green.
- Progress bar: ~50% filled (blue-to-teal gradient). 
- "STARTED JAN 2024" left, "TARGET JULY 2024" right -- all-caps, gray, ~9pt.

**Assessment Card** (white bg, rounded):
- Purple bar-chart icon in light lavender square.
- "Assessment" heading.
- "Your latest skills evaluation shows strong analytical potential with growth areas in digital strategy." -- gray body.
- "Retake Assessment" purple arrow link.

**Premium Plan Card** (purple gradient bg, rounded):
- "Premium Plan" -- bold white, ~18pt.
- "Access all advanced roadmaps, AI career coaching, and priority support." -- white text.
- Large faded star icon in background (decorative).
- "Upgrade Plan" -- small outlined white button.

**Preferences Section**:
- Heading: "Preferences" -- bold, ~18pt.
- Three toggle rows:
  1. Bell icon + "Push Notifications" + "Real-time alerts for task updates" -- teal toggle ON.
  2. Clock icon + "Daily Reminders" + "Stay on track with 9:00 AM nudges" -- teal toggle ON.
  3. Document icon + "Weekly Reports" + "Detailed progress insights via email" -- gray toggle OFF.

**Navigation Links** (list items with right chevron):
- Target icon + "Change Target Role" + "Current: Marketing Analyst" -- right chevron.
- Shield icon + "Security & Privacy" -- right chevron.

**Log Out**: Red/orange exit-door icon + "Log Out" in red/coral text.

**Bottom Tab Bar**: SETTINGS active (purple gear icon).

---

### 8.2 EDIT PROFILE

**Background**: White.

**Top Bar**: Back arrow left, "Edit Profile" bold center, "Save" teal/purple button right (small pill).

**Photo**: Circular profile photo (~100px) of a woman (blonde), with a purple camera-icon overlay circle at bottom-right.
- "EMILY CARTER" all-caps label below, gray, ~10pt.

**Form Fields** (stacked, each with all-caps label):
1. **FULL NAME**: "Emily Carter" -- text input, underline border style, gray bg.
2. **EMAIL ADDRESS**: "emily.carter@pathwise.ai" -- text input.
3. **CURRENT ROLE**: "Senior Product Designer" -- text input.
4. **INDUSTRY**: "Technology & SaaS" -- dropdown with chevron-down.
5. **YEARS OF EXPERIENCE**: A horizontal slider with a blue/purple track, positioned at "8 Years" (labeled in teal/purple right of slider). Thumb is a circle on the track.
6. **PROFESSIONAL BIO**: Multi-line text area with long bio text. Purple left border accent on the text area.

**Primary CTA**: "Save Changes" -- pill-shaped dark purple button, full width, ~52px.

**Danger Zone**: 
- Red square icon + "Delete Account" in red bold.
- Warning text: "Deleting your account will permanently remove all your progress, milestones, and career roadmap data. This action cannot be undone." -- small gray text.

**Bottom Tab Bar**: PROFILE active (different tab set: PATH, LEARN, PROJECTS, STREAKS, PROFILE).

---

### 8.3 CHANGE TARGET ROLE

**Background**: White/light gray.

**Top Bar**: PathWise logo, bell icon, profile avatar.

**Header**: Back arrow + "Change Target Role" -- bold, ~20pt.
**Subtitle**: "Pivot your career trajectory by selecting a new target role from your assessment matches." -- gray.

**Warning Card** (light amber/yellow bg, rounded):
- Yellow triangle warning icon.
- "Changing role will reset roadmap" -- bold.
- "Switching roles will archive your current progress and generate a completely new learning path based on the selected role's requirements." -- gray body.

**CURRENT ROLE** (all-caps label):
- Card with purple left border:
  - Target icon + "Marketing Analyst" bold.
  - "Active Roadmap - 45% Complete" gray.
  - "CURRENT" teal badge, right-aligned.

**SELECT NEW ROLE** (all-caps label):
- Two role option cards (white bg, rounded, radio-button style):
  1. Purple analytics icon + "Data Analyst" bold + "92% Match with your skills" gray + empty radio circle right.
  2. Purple people icon + "Product Manager" bold + "85% Match with your skills" gray + empty radio circle right.

**CTA**: "Change Target Role" with right chevron -- outlined purple button (border, white fill, purple text), full width, ~44px.

**Disclaimer**: "By confirming, you agree to reset your current dashboard and start a new training sequence for the selected role." -- small gray, centered.

**Bottom Tab Bar**: SETTINGS active.

---

### 9.1 CAREER MATCH DETAIL

**Background**: White/light.

**Top Bar**: PathWise logo, profile avatar.

**Hero Card** (white bg, rounded, large):
- Donut ring chart (~120px) in teal, showing 88%.
- "88%" bold inside, "MATCH" all-caps below.
- Green "BEST MATCH" pill badge.
- "Marketing Analyst" -- bold, ~28pt.
- "Harness the power of data to drive consumer engagement and brand growth." -- gray.

**Why This Fits You** section:
- Purple circle icon + "Why this fits you" heading.
- Three bullet points with green checkmarks:
  1. "Your strong foundation in **analytical skills** aligns perfectly with the diagnostic nature of this role."
  2. "Demonstrated ability in **data-driven marketing** strategies observed in your recent projects."
  3. "The role's focus on trend forecasting matches your interest in predictive consumer behavior."

**Salary Benchmarks Card** (light lavender bg, rounded):
- "Salary Benchmarks" heading.
- Three tiers: LOW "$55K", MEDIAN "$72K" (bold, large), HIGH "$95K".
- "Based on national market data" -- small gray.

**Skills Readiness Section**:
- "Skills Readiness" heading.
- Three skill cards:
  1. Bar-chart icon + "Excel" + "Ready for advanced modeling." + "EXPERT" green badge. Green bottom border.
  2. Stacked-lines icon + "SQL" + "Basic queries mastered." + "MODERATE" amber badge. Amber bottom border.
  3. Code icon + "Python" + "Automation path required." + "GAP" red badge. Red bottom border.

**Primary CTA**: "Set as My Target Role" -- pill-shaped purple button, full width.
**Secondary**: "Compare with another role" -- purple text link.

**Bottom Tab Bar**: ROADMAP active.

---

### 10.1 NOTIFICATIONS CENTER

**Background**: White/light.

**Top Bar**: Back arrow left, "Notifications" bold center, "MARK ALL AS READ" purple text right (~10pt, all-caps).

**Today Section** ("Today" bold heading, "3 NEW" teal badge right):
Three notification cards, each white bg, rounded, with colored left-side accent and icon:
1. **Task Reminder**: Purple bell icon in purple circle. "Task Reminder" bold. "Your 'Resume Polishing' session starts in 15 minutes. Ready to shine?" -- gray body. "15M AGO" gray timestamp. Blue unread dot on right.
2. **New Achievement!**: Yellow/gold trophy icon in amber circle. "New Achievement!" bold. "You've unlocked the 'Interview Pro' badge. Keep building that momentum." "2H AGO". Blue unread dot.
3. **7-Day Streak**: Orange/fire flame icon in orange circle. "7-Day Streak" bold. "Incredible! You haven't missed a beat all week. One more day for the bonus." "5H AGO". Blue unread dot.

**Earlier Section** ("Earlier" bold heading):
Two notification cards (no unread dots):
1. Gray checkmark-circle icon. "Pathway Updated" bold. "Based on your recent progress, your Career Roadmap has been refined." "YESTERDAY".
2. Gray document icon. "Weekly Wrap-up" bold. "Your performance report for last week is ready for review." "2 DAYS AGO".

**End-of-Feed Indicator**: Small gray bell icon with "END OF FEED" text.

---

### 11.1 STREAK TRACKER

**Background**: White/light.

**Top Bar**: PathWise logo (purple), profile avatar (red-haired character).

**Heading**: "Momentum" -- bold, dark, ~32pt, centered.
**Subtitle**: "You're building momentum!" -- gray, centered.

**Streak Card** (white bg, rounded, shadow):
- Teal circle with flame/fire icon.
- Fire emoji + "4-day streak" -- bold, ~28pt.
- "YOUR BEST: 12 DAYS" -- all-caps, gray.

**Weekly Progress Section** (inside the card):
- "WEEKLY PROGRESS" bold, "75% Complete" in teal right-aligned.
- Day-of-week circles (M T W T F S S):
  - M, T: Teal filled with white checkmark (completed).
  - W: Gray empty circle (missed).
  - T (today): Larger, teal with lightning bolt and white ring highlight (active/current).
  - F, S: Teal filled with checkmarks (completed).
  - S: Gray empty (upcoming).

**Power Hour Card** (purple gradient bg, rounded):
- "Power Hour" bold white.
- "You're most active at 9:00 AM. Keep the morning momentum!" -- white text.
- Large faded clock icon in background (decorative).

**Consistency Card** (white bg, rounded):
- "Consistency" heading, trend-up icon.
- "Consistency Score" label, "88%" right-aligned.
- Progress bar: teal, ~88% filled.

**Primary CTA**: "Complete Today's Tasks" with sparkle icon -- pill-shaped teal/dark-green (#0D9488) button, white text, full width.

**Bottom Tab Bar**: PROGRESS active.

---

### 11.2 ACHIEVEMENTS SCREEN

**Background**: Light lavender.

**Top Bar**: PathWise logo, lock/profile icon.

**Heading**: "Your Achievements" -- bold, dark, ~24pt.
**Subtitle**: "Celebrating your growth and professional milestones. Each badge represents a step closer to your career goals." -- gray.

**Season Progress Card** (dark purple/violet gradient bg, rounded):
- "SEASON PROGRESS" all-caps label.
- "Expert Tier Achieved" -- bold white, ~20pt.
- "1,250 / 2,000 XP to next level" -- white text.
- Green progress bar showing ~62%.

**Badge Count**: Large "12" bold, ~36pt, centered. Pin/badge icon above. "TOTAL BADGES" all-caps gray below.

**Badges Grid** (2-column grid of cards):
Earned badges (full color, white bg, shadow):
1. **First Steps**: Blue circle badge icon. "Completed the career orientation module." "EARNED AUG 12" green text.
2. **Roadmap Starter**: Teal/green diamond badge. "Created your first customized career path." "EARNED AUG 15".
3. **7-Day Streak**: Gold/dark circle badge. "Used PathWise for seven consecutive days." "EARNED AUG 22".

Locked/in-progress badges (grayed-out/faded):
4. **Skill Master**: "REQUIREMENT" label. "Complete 5 technical assessment tasks." Progress: "3 / 5 TASKS".
5. **Networker**: "REQUIREMENT". "Connect with 3 industry mentors." Progress: "1 / 3 MENTORS".
6. **Interview Ready**: "REQUIREMENT". "Complete the AI interview simulation." "0 / 1 MODULE".
7. **Path Finisher**: "Complete your entire career roadmap." "45% COMPLETE".
8. **Top Contributor**: "Share 10 helpful resources in forums." "8 / 10 SHARES".

**Bottom Tab Bar**: PROGRESS active.

---

### 12.1 SEARCH SCREEN

**Background**: White.

**Top Bar**: PathWise logo, profile avatar.

**Search Bar** (prominent, full width, white bg, purple border when active, rounded ~16px):
- Magnifying glass icon left.
- Search text: "Data Analyst" (typed).
- X/clear button right.

**Roles Section**:
- "Roles" heading bold, "MATCHES" teal badge.
- Card: Analytics icon + "Data Analyst" bold + "3,420 open opportunities" + right chevron. Purple dotted border.

**Courses Section**:
- "Courses" heading bold, "GROWTH" teal badge.
- Two course cards:
  1. Teal database icon + "SQL Basics for Analysis" + "12 modules - PathWise Academy" + right chevron.
  2. Purple chart icon + "Data Visualization Masterclass" + "8 modules - Expert Level" + right chevron.

**Skills Section**:
- "Skills" heading bold, "REQUIRED" gray badge.
- Chip tags: code icon + "Python", grid icon + "Tableau", square icon + "Pandas".
- Additional small filter chips at bottom: "Py", "Data", "SQL", with "Done" text link right-aligned.

**Bottom Tab Bar**: ROADMAP active.

---

### 13.1 MY CERTIFICATES

**Background**: White/light.

**Top Bar**: Profile avatar, "PathWise", pen/edit icon.

**Heading**: "My Certificates" -- bold, ~24pt.
**Subtitle**: "Your verified achievements and professional milestones." -- gray.

**Add Button**: "Add Certificate" -- pill-shaped teal/purple button, full width, plus-circle icon, white text.

**Certificate Cards** (3 stacked, white bg, rounded, shadow):
Each card contains:
- Provider logo (Google logo, Meta logo, Coursera logo).
- Certificate name (bold, ~16pt).
- "Issued [date] - [Provider]" gray text.
- "VERIFIED" teal badge (right-aligned).
- "View Certificate" purple link + share icon + "Share" link.

1. "Google Data Analytics" -- "Issued Oct 2023 - Google Professional", VERIFIED.
2. "Meta Marketing Analytics" -- "Issued Aug 2023 - Meta Certified", VERIFIED.
3. "Project Management Foundations" -- "Issued May 2023 - Coursera", VERIFIED.

**Promo Card** (purple gradient bg, rounded):
- "Boost your career credibility" -- bold white.
- "Verified certificates increase your profile visibility to top mentors by 45%. Connect your LinkedIn to sync automatically." -- white.
- "Connect Profiles" -- small white outlined button.

**Bottom Tab Bar**: PROFILE active (PATH, LEARN, PROJECTS, STREAKS, PROFILE tabs).

---

### 15.1 HELP & FAQ

**Background**: White.

**Top Bar**: Back arrow left, "Help & FAQ" bold center, profile avatar right.

**Heading**: "How can we help?" -- bold, ~28pt.
**Subtitle**: "Search for articles or browse categories below." -- gray.

**Search Bar**: Magnifying glass + placeholder "Search for 'Career Roadmaps'..." -- rounded, light gray bg.

**GETTING STARTED** (all-caps purple section label):
- Accordion items (white bg cards, expandable):
  1. "How do I create my first Career Roadmap?" + chevron-down.
  2. "Synchronizing your LinkedIn profile" + chevron-down.

**ROADMAP & TASKS** (all-caps purple section label):
- Expanded accordion:
  - "Can I customize my skill milestones?" + chevron-up (expanded).
  - Answer text: "Yes! Every PathWise roadmap is fully editable. Simply click the 'Edit' icon on any milestone to adjust the target date, add specific sub-tasks, or link personal portfolio projects." 
  - "Read more" purple arrow link.
- "Tracking daily task streaks" + chevron-down (collapsed).

**BILLING** (all-caps purple section label):
- "Changing your subscription plan" + chevron-down.
- "Refund policy for PathWise Premium" + chevron-down.

**Support Card** (light purple/lavender bg, rounded):
- Purple question-mark circle icon.
- "Still have questions?" -- bold.
- "Our dedicated PathFinder support team is ready to help you navigate your journey." -- gray.
- "Contact Support" -- purple outlined pill button.

**Bottom Tab Bar**: PROFILE active.

---

## PROTOTYPED VARIANT SUMMARY (Animation/Interaction Hints)

Most prototyped variants are identical to their static counterparts, confirming the final visual state. Key animation insights:

1. **Splash Screen**: Three prototype frames suggest a sequential reveal animation -- icon elements assemble (book icon + sparkle), then text fades in, then "INITIALIZING INTELLIGENCE" loading text appears.

2. **Onboarding**: Two identical frames suggest the carousel has page-transition animations (likely horizontal swipe with crossfade).

3. **Sign Up / Log In**: Prototyped frames match the static designs, confirming form fields animate into view (likely slide-up or fade-in).

4. **Assessment Processing**: The prototyped variant shows the progress at 85% (vs 65% in the static), with the active step advanced to "Mapping personality traits...", confirming a sequential step-through animation. The addition of "TAP ANYWHERE TO VIEW RESULTS" indicates the processing screen becomes tappable when complete.

5. **Assessment Question (prototyped)**: Shows the unselected state -- no answer highlighted, "Continue" button appears disabled/grayed (lower opacity), confirming the button enables only after selection.

---

## TAB BAR VARIANTS OBSERVED

Two distinct tab bar configurations are used across the app:

**Primary Tab Bar** (most screens): HOME | ROADMAP | TASKS | PROGRESS | SETTINGS

**Alternate Tab Bar** (some detail screens): PATH | LEARN | PROJECTS | STREAKS | PROFILE

The active tab uses a filled purple icon and purple label text. Some screens show the active tab with a purple-filled circular background behind the icon (e.g., TASKS on the tasks screen). Inactive tabs use gray outlined icons and gray text.

---

This completes the full 53-screen design specification. Every screen has been viewed and documented with detailed attention to layout, colors, typography, spacing, component patterns, and interaction hints.