# Stridr App Launch Checklist

Pre-launch checklist for Google Play Store and Apple App Store submission.

---

## 🔐 Legal & Compliance

- [x] **Privacy Policy** - `https://newrishav-debug.github.io/Stridr/privacy-policy.html`
- [x] **Terms of Service** - `https://newrishav-debug.github.io/Stridr/terms-of-service.html`
- [x] **Update contact email** - Updated to `quietvibesai@gmail.com` in legal docs
- [x] **GDPR compliance** - Delete Account feature clears all user data ✓
- [x] **Age rating** - App suitable for ages 4+ (no violence, no user-generated content, no social features)

---

## 🎨 App Store Assets

### Icons & Graphics
- [x] **App Icon** - Updated with Stridr logo ✓
- [x] **Adaptive Icon** - Updated with Stridr logo (white background) ✓
- [ ] **Feature Graphic** - 1024x500px (Play Store)

### Screenshots (per device type)
- [ ] **Phone screenshots** - 6.5" (iPhone) / Phone (Android) - min 2, max 8
- [ ] **Tablet screenshots** - 12.9" iPad / 7" & 10" tablets (if supporting tablets)

### Promotional
- [ ] **App Preview Video** - Optional but recommended (15-30 seconds)

---

## 📝 Store Listing Content

- [x] **App Name** - "Stridr" ✓ (configured in app.json)
- [x] **Short Description** - Drafted in STORE_LISTING.md ✓
- [x] **Full Description** - Drafted in STORE_LISTING.md ✓
- [x] **Keywords** - Drafted in STORE_LISTING.md ✓
- [x] **Category** - Health & Fitness
- [x] **Support URL** - Drafted in STORE_LISTING.md ✓
- [x] **Marketing URL** - Drafted in STORE_LISTING.md ✓

---

## ⚙️ App Configuration

### app.json / app.config.js
- [x] **Bundle Identifier** - `com.newrishav.stridr` ✓
- [x] **Package Name** - `com.newrishav.stridr` ✓
- [x] **Version** - Set to "1.0.0" ✓
- [ ] **Build Number** - Set `ios.buildNumber` and `android.versionCode`
- [x] **Splash Screen** - Configured in app.json ✓

### Permissions
- [x] **Motion & Fitness** - Configured `NSMotionUsageDescription` in app.json ✓
- [x] **Notifications** - Verified (System default prompts used) ✓
- [x] **Camera/Photos** - Configured `NSPhotoLibrary/CameraUsageDescription` in app.json ✓

---

## 🔑 Credentials & Accounts

### Apple (App Store)
- [ ] **Apple Developer Account** - $99/year enrollment
- [ ] **App Store Connect** - Create app record
- [ ] **Certificates & Provisioning** - Distribution certificate ready
- [ ] **App-Specific Password** - For EAS Build (if using)

### Google (Play Store)
- [ ] **Google Play Developer Account** - $25 one-time fee
- [ ] **Google Play Console** - Create app listing
- [ ] **Signing Key** - Upload key or use Play App Signing
- [x] ~~**Google OAuth**~~ - Not needed (social login deferred)

### Social Login (Deferred)
- [x] **Google OAuth** - ~~Removed for initial launch~~ (requires development build)
- [x] **Facebook Login** - ~~Removed for initial launch~~ (requires development build)
- [ ] *Future: Add social login with development build for production*

---

## 🧪 Testing & Quality

### Functionality
- [ ] **Test on real devices** - iOS and Android physical devices
- [ ] **Pedometer accuracy** - Verify step counting works correctly
- [ ] **Notifications** - Test all notification types
- [x] ~~**Social login**~~ - Deferred for initial launch
- [ ] **Data persistence** - Verify progress saves and loads correctly
- [ ] **Offline mode** - Test app behavior without internet

### Edge Cases
- [ ] **Fresh install** - Test first-time user experience
- [ ] **App update** - Test data migration from previous versions
- [ ] **Background/foreground** - Test step tracking continuity
- [ ] **Low storage** - Test behavior with limited device storage
- [ ] **Permissions denied** - Test graceful handling of denied permissions

### Performance
- [x] **App size** - Assets ~28MB, total bundle estimated < 50MB ✓
- [x] **Startup time** - Standard Expo startup (optimized asset loading) ✓
- [x] **Memory usage** - Reviewed StorageService and cleanup logic ✓
- [x] **Battery impact** - Efficient background fetch and step tracking ✓

---

## 🏗️ Build & Deploy

### Production Build
- [ ] **Build test APK** - Ready to run: `eas build -p android --profile preview`
- [ ] **Remove debug code** - Remove DebugMenu component from production
- [ ] **Environment variables** - Move API keys to secure config
- [ ] **Build production APK/AAB** - `eas build --platform android`
- [ ] **Build production IPA** - `eas build --platform ios`

### Pre-submission
- [ ] **Test production build** - Install and test the actual submission build
- [ ] **Verify no console logs** - Remove or disable development logging
- [ ] **Check bundle size** - Ensure reasonable download size

---

## 📤 Submission

### Google Play Store
- [ ] **Upload AAB** - Android App Bundle to Play Console
- [ ] **Complete content rating** - Fill out questionnaire
- [ ] **Set pricing** - Free with no in-app purchases
- [ ] **Target audience** - Select appropriate age groups
- [ ] **Data safety form** - Declare data collection practices
- [ ] **Submit for review** - Typically 1-3 days

### Apple App Store
- [ ] **Upload via Xcode/Transporter** - Submit IPA to App Store Connect
- [ ] **Complete App Information** - Age rating, categories
- [ ] **Health & Fitness disclaimer** - Required for health-related apps
- [ ] **Submit for review** - Typically 1-7 days

---

## 📋 Post-Launch

- [ ] **Monitor crash reports** - Set up Sentry or similar
- [ ] **Respond to reviews** - Monitor and respond to user feedback
- [ ] **Analytics** - Consider adding analytics (with privacy disclosure)
- [ ] **Plan first update** - Address any issues found post-launch

---

*Last updated: January 13, 2026*
