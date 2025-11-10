# Google Analytics Setup

## Setting up Google Analytics 4

To enable analytics in your project, follow these steps:

### 1. Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new account
3. Create a new Property for your website
4. Copy the Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Environment Variable Setup

#### For Local Development

Create `.env.local` file in the `frontend/` directory:

```bash
# Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

You can copy from `.env.example`:

```bash
cp frontend/.env.example frontend/.env.local
```

#### For GitHub Pages/Production

1. Go to your repository **Settings**
2. Navigate to **Secrets and variables** → **Actions**
3. Add new repository secret:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: Your actual GA4 Measurement ID

#### For GitHub Pages Environment Variables

1. Go to **Pages** settings
2. Add environment variable:
   - **Name**: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - **Value**: Your actual GA4 Measurement ID

### 3. Tracked Events

The analytics system tracks the following events:

- **Site visits**: Automatic
- **Theme changes**: `theme_change` (dark/light)
- **File export**: `export` (with format)
- **File import**: `import` (with format)
- **About modal view**: `about_view`
- **AI usage**: `ai_usage` (generate_content/insert_content)
- **Presentation Settings tabs**: `presentation_tab` (general/header-footer/background/plugins)
- **Fullscreen toggle**: `fullscreen_toggle` (on/off)
- **Authentication modal open**: `auth_modal_open` (login/signup)
- **Authentication attempt**: `auth_attempt` (login/signup)
- **Authentication error**: `auth_error` (login_error/signup_error)
- **Authentication mode switch**: `auth_mode_switch` (login/signup)

### 4. Testing Analytics

1. Run the project: `npm run dev`
2. Go to Google Analytics
3. Check Real-time > Events to see events

### 5. Important Notes

#### Technical Requirements

- Analytics only works in production or with correct environment variable
- For local testing, use Google Analytics DebugView
- All events are implemented with user privacy in mind

#### Privacy & Legal Compliance

- **GDPR Compliant**: User consent required before tracking begins
- **Privacy Policy**: Available at `/privacy` page
- **IP Anonymization**: Enabled by default for privacy protection
- **Custom Implementation**: Uses Next.js Script component (not third-party libraries) for full control

#### Performance & Security

- **Conditional Loading**: Analytics scripts only load after user consent
- **No External Dependencies**: Reduces bundle size and security risks
- **Optimized Loading**: Uses Next.js `afterInteractive` strategy

### 6. GDPR Compliance Features

GDPR compliance features:

#### Cookie Consent Management

- **Consent Banner**: Users see a consent banner on first visit
- **Opt-in Required**: Analytics only starts after explicit user consent
- **Opt-out Option**: Users can continue using the site without analytics
- **Persistent Choice**: User's consent choice is remembered

#### Privacy Protection

- **IP Anonymization**: IP addresses are automatically anonymized
- **No Personal Data**: No personal information is collected
- **Local Storage**: User content stays in their browser
- **Transparent Policy**: Clear privacy policy explains data usage
