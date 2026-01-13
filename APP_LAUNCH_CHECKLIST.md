# Stridr App Launch Checklist

Pre-launch checklist for Google Play Store and Apple App Store submission.

---

## 🔐 Legal & Compliance

- [ ] **Privacy Policy** - Host `PRIVACY_POLICY.md` on a public URL
- [ ] **Terms of Service** - Host `TERMS_OF_SERVICE.md` on a public URL
- [ ] **Update contact email** - Replace `support@stridrapp.com` with actual email in legal docs
- [ ] **GDPR compliance** - Verify data deletion flow works (delete account feature)
- [ ] **Age rating** - Prepare for content rating questionnaire

---

## 🎨 App Store Assets

### Icons & Graphics
- [ ] **App Icon** - 1024x1024px (PNG, no transparency for iOS)
- [ ] **Adaptive Icon** - Foreground + background layers for Android
- [ ] **Feature Graphic** - 1024x500px (Play Store)

### Screenshots (per device type)
- [ ] **Phone screenshots** - 6.5" (iPhone) / Phone (Android) - min 2, max 8
- [ ] **Tablet screenshots** - 12.9" iPad / 7" & 10" tablets (if supporting tablets)

### Promotional
- [ ] **App Preview Video** - Optional but recommended (15-30 seconds)

---

## 📝 Store Listing Content

- [ ] **App Name** - "Stridr" (max 30 chars)
- [ ] **Short Description** - Max 80 characters (Play Store)
- [ ] **Full Description** - Up to 4000 characters, highlight key features
- [ ] **Keywords** - Up to 100 characters (App Store only)
- [ ] **Category** - Health & Fitness
- [ ] **Support URL** - Create support/contact page
- [ ] **Marketing URL** - Optional landing page

---

## ⚙️ App Configuration

### app.json / app.config.js
- [ ] **Bundle Identifier** - Set unique `ios.bundleIdentifier` (e.g., `com.yourcompany.stridr`)
- [ ] **Package Name** - Set unique `android.package` (e.g., `com.yourcompany.stridr`)
- [ ] **Version** - Set appropriate `version` (e.g., "1.0.0")
- [ ] **Build Number** - Set `ios.buildNumber` and `android.versionCode`
- [ ] **Splash Screen** - Update with branded splash image

### Permissions
- [ ] **Motion & Fitness** - Verify `NSMotionUsageDescription` (iOS)
- [ ] **Notifications** - Verify permission strings for both platforms
- [ ] **Camera/Photos** - Verify `NSPhotoLibraryUsageDescription` for profile photo

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
- [ ] **Google OAuth** - Verify Client ID is in production mode

### Social Login
- [ ] **Google OAuth** - Move to production (remove "Test mode" restrictions)
- [ ] **Facebook App** - Submit for App Review, switch to "Live" mode
- [ ] **Update OAuth redirect URIs** - Use production bundle ID/package name

---

## 🧪 Testing & Quality

### Functionality
- [ ] **Test on real devices** - iOS and Android physical devices
- [ ] **Pedometer accuracy** - Verify step counting works correctly
- [ ] **Notifications** - Test all notification types
- [ ] **Social login** - Test Google and Facebook sign-in flows
- [ ] **Data persistence** - Verify progress saves and loads correctly
- [ ] **Offline mode** - Test app behavior without internet

### Edge Cases
- [ ] **Fresh install** - Test first-time user experience
- [ ] **App update** - Test data migration from previous versions
- [ ] **Background/foreground** - Test step tracking continuity
- [ ] **Low storage** - Test behavior with limited device storage
- [ ] **Permissions denied** - Test graceful handling of denied permissions

### Performance
- [ ] **App size** - Optimize to under 100MB if possible
- [ ] **Startup time** - Should load within 2-3 seconds
- [ ] **Memory usage** - No memory leaks during extended use
- [ ] **Battery impact** - Background tracking shouldn't drain battery excessively

---

## 🏗️ Build & Deploy

### Production Build
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

*Last updated: January 12, 2026*
