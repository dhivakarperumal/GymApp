# Android Build & Signing Configuration Guide

## Overview
This guide documents the complete process for managing passwords, keys, signing certificates, and building Android APK and AAB (Android App Bundle) files for the GymApp project. This configuration can be replicated in other projects.

---

## Table of Contents
1. [Current Configuration](#current-configuration)
2. [Keystore Management](#keystore-management)
3. [Gradle Properties Setup](#gradle-properties-setup)
4. [Password Change Procedures](#password-change-procedures)
5. [Building Signed APK](#building-signed-apk)
6. [Building AAB (Android App Bundle)](#building-aab)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Current Configuration

### File Structure
```
android/
├── build.gradle                 # Top-level build file
├── gradle.properties            # Gradle configuration & credentials
└── app/
    ├── build.gradle             # App-level build configuration
    ├── debug.keystore           # Debug signing certificate
    └── proguard-rules.pro       # ProGuard obfuscation rules
```

### Current Signing Setup

#### Debug Configuration (in `android/app/build.gradle`)
```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    ...
}
```
**Debug credentials are hardcoded** (standard for all Android projects - safe for development only)

#### Release Configuration (in `android/app/build.gradle`)
```gradle
release {
    if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword MYAPP_RELEASE_STORE_PASSWORD
        keyAlias MYAPP_RELEASE_KEY_ALIAS
        keyPassword MYAPP_RELEASE_KEY_PASSWORD
    }
}
```
**Release credentials are stored in `gradle.properties`** (external, secure approach)

---

## Keystore Management

### What is a Keystore?
A keystore is a binary file containing:
- A private key (kept secret)
- A certificate (public key + metadata)
- Password protection
- Validity period

Your app must be signed with the **same keystore** for all releases to maintain Play Store identity.

### Current Keys/Passwords in This Project

#### Location: `android/gradle.properties`
```properties
# Release signing configuration
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_STORE_PASSWORD=<PASSWORD_HERE>
MYAPP_RELEASE_KEY_ALIAS=<KEY_ALIAS>
MYAPP_RELEASE_KEY_PASSWORD=<KEY_PASSWORD_HERE>
```

> ⚠️ **IMPORTANT**: This file should NOT be committed to git. Add it to `.gitignore`.

---

## Gradle Properties Setup

### Step 1: Create/Update `gradle.properties`

Navigate to `android/` directory and create/edit `gradle.properties`:

```bash
# Windows
cd android
# Open or create gradle.properties
```

### Step 2: Add Release Credentials

Add these lines to `android/gradle.properties`:

```properties
# Release Signing Configuration
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_STORE_PASSWORD=YourSecureStorePassword123
MYAPP_RELEASE_KEY_ALIAS=your-key-alias
MYAPP_RELEASE_KEY_PASSWORD=YourSecureKeyPassword123
```

### Step 3: Protect Sensitive Data

**Add to `.gitignore`:**
```gitignore
# Gradle
/android/gradle.properties
/android/*.keystore
/android/release.keystore
```

**Alternative: Use Environment Variables**
```bash
# Instead of storing in gradle.properties, use environment variables
$env:MYAPP_RELEASE_STORE_PASSWORD = "YourPassword"
$env:MYAPP_RELEASE_KEY_PASSWORD = "YourPassword"
```

Then reference in build.gradle:
```gradle
release {
    if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
        storeFile file(MYAPP_RELEASE_STORE_FILE)
        storePassword System.getenv("MYAPP_RELEASE_STORE_PASSWORD") ?: project.MYAPP_RELEASE_STORE_PASSWORD
        keyAlias project.MYAPP_RELEASE_KEY_ALIAS
        keyPassword System.getenv("MYAPP_RELEASE_KEY_PASSWORD") ?: project.MYAPP_RELEASE_KEY_PASSWORD
    }
}
```

---

## Password Change Procedures

### Scenario 1: Change Release Keystore Password

**What you're changing:** The password that protects your entire keystore file

#### Steps:

1. **Backup your keystore**
   ```bash
   cd android
   cp release.keystore release.keystore.backup
   ```

2. **Use keytool to change storepass**
   ```bash
   keytool -storepasswd -keystore release.keystore
   ```
   - Enter old password: `[current password]`
   - Enter new password: `[new secure password]`
   - Confirm new password: `[new secure password]`

3. **Update gradle.properties**
   ```properties
   MYAPP_RELEASE_STORE_PASSWORD=NewSecurePassword123
   ```

4. **Test the build**
   ```bash
   cd android
   gradlew assembleRelease
   ```

5. **If successful, delete backup**
   ```bash
   rm release.keystore.backup
   ```

---

### Scenario 2: Change Key Password (Inside Keystore)

**What you're changing:** The password for the private key inside the keystore

#### Steps:

1. **Backup your keystore**
   ```bash
   cd android
   cp release.keystore release.keystore.backup
   ```

2. **Use keytool to change keypass**
   ```bash
   keytool -keypasswd -keystore release.keystore -alias your-key-alias
   ```
   - Keystore password: `[your keystore password]`
   - Old key password: `[current key password]`
   - New key password: `[new key password]`
   - Confirm new key password: `[new key password]`

3. **Update gradle.properties**
   ```properties
   MYAPP_RELEASE_KEY_PASSWORD=NewKeyPassword123
   ```

4. **Test the build**
   ```bash
   cd android
   gradlew assembleRelease
   ```

5. **If successful, delete backup**
   ```bash
   rm release.keystore.backup
   ```

---

### Scenario 3: Change Key Alias

**What you're changing:** The identifier name for your key (less common)

#### Steps:

1. **Backup your keystore**
   ```bash
   cd android
   cp release.keystore release.keystore.backup
   ```

2. **List current aliases to verify**
   ```bash
   keytool -list -v -keystore release.keystore
   ```

3. **Use keytool to change alias**
   ```bash
   keytool -changealias -keystore release.keystore -alias old-alias -destalias new-alias
   ```
   - Keystore password: `[your keystore password]`

4. **Update gradle.properties**
   ```properties
   MYAPP_RELEASE_KEY_ALIAS=new-alias
   ```

5. **Test the build**
   ```bash
   cd android
   gradlew assembleRelease
   ```

6. **If successful, delete backup**
   ```bash
   rm release.keystore.backup
   ```

---

### Scenario 4: Create a New Keystore (Complete Reset)

**Use this if:** You've lost the old keystore or need a completely fresh signing key

⚠️ **WARNING**: If you create a new keystore, you cannot update existing Play Store apps. You must publish as a new app.

#### Steps:

1. **Backup old keystore (for reference)**
   ```bash
   cd android
   cp release.keystore release.keystore.old
   ```

2. **Generate new keystore**
   ```bash
   keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias gymapp-key
   ```

   You'll be prompted for:
   ```
   Enter keystore password: [create strong password]
   Re-enter keystore password: [confirm]
   First and Last Name: GymApp
   Organizational Unit: Development
   Organization: DAP Fitness Studio
   City: [Your City]
   State: [Your State]
   Country: US
   Is this correct? (yes/no): yes
   Enter key password for <gymapp-key>: [create strong password]
   Re-enter key password: [confirm]
   ```

3. **Update gradle.properties**
   ```properties
   MYAPP_RELEASE_STORE_FILE=release.keystore
   MYAPP_RELEASE_STORE_PASSWORD=YourNewStorePassword
   MYAPP_RELEASE_KEY_ALIAS=gymapp-key
   MYAPP_RELEASE_KEY_PASSWORD=YourNewKeyPassword
   ```

4. **Test the build**
   ```bash
   cd android
   gradlew assembleRelease
   ```

5. **Upload to Play Store as new app**

---

## Building Signed APK

### Step 1: Ensure gradle.properties is Configured

Verify `android/gradle.properties` contains:
```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_STORE_PASSWORD=YourPassword
MYAPP_RELEASE_KEY_ALIAS=your-key-alias
MYAPP_RELEASE_KEY_PASSWORD=YourKeyPassword
```

### Step 2: Build Release APK

Navigate to the android directory and run:

```bash
# Windows PowerShell
cd android
.\gradlew assembleRelease
```

**Expected Output:**
```
BUILD SUCCESSFUL in 2m 45s
1 actionable task: 1 executed
```

### Step 3: Locate Generated APK

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Verify APK Signing

```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

Expected output:
```
s = signature was verified
m = entry is listed in manifest
k = at least one certificate was found in keystore
i = at least one certificate was found in identity scope
jar verified.
```

### Step 5: Test on Device

```bash
# Windows PowerShell
adb install .\android\app\build\outputs\apk\release\app-release.apk
```

---

## Building AAB (Android App Bundle)

An **AAB (Android App Bundle)** is the modern format required by Google Play Store. It's smaller than APK and supports dynamic feature delivery.

### Step 1: Prerequisites

- Same setup as APK build (gradle.properties configured)
- Release keystore available

### Step 2: Build AAB

```bash
# Windows PowerShell
cd android
.\gradlew bundleRelease
```

**Expected Output:**
```
BUILD SUCCESSFUL in 3m 12s
1 actionable task: 1 executed
```

### Step 3: Locate Generated AAB

The signed AAB will be at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Step 4: Verify AAB Contents (Optional)

```bash
# Use bundletool to inspect AAB
bundletool dump manifest --bundle=android/app/build/outputs/bundle/release/app-release.aab
```

### Step 5: Generate APK Set from AAB (Optional - for testing)

```bash
# Create APK set from AAB
bundletool build-apks --bundle=app-release.aab --output=app-release.apks --mode=universal
```

Then install:
```bash
bundletool install-apks --apks=app-release.apks
```

---

## Comparison: APK vs AAB

| Feature | APK | AAB |
|---------|-----|-----|
| **Size** | Larger (contains all resources) | Smaller (optimized) |
| **Play Store** | Optional | Required (since Aug 2021) |
| **Installation** | Direct, any device | Must use Play Store or bundletool |
| **Device Variants** | Single file for all devices | Generates device-specific APKs |
| **Best For** | Testing, Side-loading | Production Play Store release |

---

## Complete Build Workflow Example

### Full Release Build Process

```bash
# 1. Navigate to Android directory
cd android

# 2. Clean previous builds
.\gradlew clean

# 3. Build AAB for Play Store (Primary)
.\gradlew bundleRelease

# 4. Build APK for backup/testing
.\gradlew assembleRelease

# 5. Verify outputs
ls .\app\build\outputs\bundle\release\
ls .\app\build\outputs\apk\release\

# 6. Sign and verify AAB manually (if needed)
jarsigner -verify -verbose -certs .\app\build\outputs\bundle\release\app-release.aab
```

**Output Files:**
```
android/app/build/outputs/
├── bundle/
│   └── release/
│       └── app-release.aab          ← Upload to Play Store
└── apk/
    └── release/
        └── app-release.apk          ← For backup/distribution
```

---

## Security Best Practices

### 1. Keystore Security
- ✅ Keep keystore file in version control `.gitignore`
- ✅ Use strong passwords (16+ characters, mixed case, numbers, symbols)
- ✅ Store passwords in secure password manager
- ✅ Backup keystore in secure location
- ❌ Never commit keystore to git
- ❌ Never share keystore file via email/chat

### 2. gradle.properties Security
- ✅ Add to `.gitignore`
- ✅ Use environment variables for CI/CD
- ✅ Restrict file permissions (chmod 600 on Linux/Mac)
- ❌ Never commit credentials to git
- ❌ Never hardcode passwords in build.gradle

### 3. CI/CD Integration

**GitHub Actions Example:**
```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up environment
        env:
          MYAPP_RELEASE_STORE_PASSWORD: ${{ secrets.MYAPP_RELEASE_STORE_PASSWORD }}
          MYAPP_RELEASE_KEY_PASSWORD: ${{ secrets.MYAPP_RELEASE_KEY_PASSWORD }}
        run: |
          cd android
          ./gradlew bundleRelease
```

### 4. Play Store Credentials
- Keep account credentials separate from app signing credentials
- Use Google Play Console's service account for automated uploads
- Enable 2FA on Play Store account
- Review upload history regularly

---

## File Changes Summary

### Modified Files in This Project

| File | Change |
|------|--------|
| `android/app/build.gradle` | Signing configuration with release credentials |
| `android/gradle.properties` | Release keystore location and credentials |
| `android/release.keystore` | Binary signing certificate (not in git) |
| `android/.gitignore` | Added gradle.properties and keystore files |

### What Should Be in Git
```
✓ android/build.gradle
✓ android/app/build.gradle
✓ android/gradle.properties.example (template without credentials)
✓ .gitignore
```

### What Should NOT Be in Git
```
✗ android/gradle.properties (actual file with passwords)
✗ android/*.keystore (signing certificates)
✗ android/app/build/ (generated files)
```

### Create a Template File

**File: `android/gradle.properties.example`**
```properties
# Release Signing Configuration
# Copy this file to gradle.properties and fill in your values
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_STORE_PASSWORD=YOUR_PASSWORD_HERE
MYAPP_RELEASE_KEY_ALIAS=YOUR_KEY_ALIAS_HERE
MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD_HERE
```

Then developers can:
```bash
cp android/gradle.properties.example android/gradle.properties
# Edit with their actual credentials
```

---

## Troubleshooting

### Issue 1: "Keystore was tampered with, or password was incorrect"

**Cause:** Incorrect keystore or store password

**Solution:**
```bash
# Verify keystore exists
ls android/release.keystore

# Verify credentials in gradle.properties
cat android/gradle.properties

# Test keystore manually
keytool -list -keystore android/release.keystore
```

---

### Issue 2: "Could not find keystore"

**Cause:** Wrong path or missing file

**Solution:**
```bash
# Ensure you're in correct directory
cd android
ls -la

# Check gradle.properties path format
# Should be relative: release.keystore
# Not absolute: /path/to/release.keystore
```

---

### Issue 3: "BUILD FAILED: minSdkVersion"

**Cause:** Minimum SDK version mismatch

**Solution:**
In `android/app/build.gradle`:
```gradle
defaultConfig {
    minSdkVersion 21  // At least 21 for most apps
    targetSdkVersion 34
}
```

---

### Issue 4: "BUILD FAILED: permission denied"

**Cause:** gradle wrapper isn't executable

**Solution:**
```bash
# Make gradlew executable
chmod +x android/gradlew

# Or use batch file on Windows
android/gradlew.bat assembleRelease
```

---

### Issue 5: "Out of memory" during build

**Cause:** Gradle JVM needs more memory

**Solution in `gradle.properties`:**
```properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
```

---

## Quick Reference Commands

```bash
# Navigate to android folder
cd android

# Clean build
./gradlew clean

# Debug APK
./gradlew assembleDebug

# Release APK (signed)
./gradlew assembleRelease

# Release AAB (signed)
./gradlew bundleRelease

# Check what tasks available
./gradlew tasks

# List keystore contents
keytool -list -v -keystore release.keystore

# Verify signed APK
jarsigner -verify -verbose android/app/build/outputs/apk/release/app-release.apk

# Get keystore info
keytool -v -list -keystore release.keystore
```

---

## Implementation in Other Projects

To replicate this setup in another project:

1. **Copy keystore file** (if reusing same signing key)
   ```bash
   cp /path/to/release.keystore /new/project/android/
   ```

2. **Copy build.gradle signing config** from this project

3. **Create gradle.properties** with credentials

4. **Update .gitignore** to exclude gradle.properties and keystores

5. **Test the build**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

---

## Support Resources

- [Android Developer - App Signing](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console - Your keystore](https://support.google.com/googleplay/android-developer/answer/7384423)
- [Gradle Documentation](https://docs.gradle.org/)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-05-22 | Initial guide creation | Development Team |

---

**Last Updated:** May 22, 2026
**Project:** GymApp (DAP Fitness Studio)
**Version:** 1.0
