# Firestore Security Rules

Copy and paste these rules into your Firebase Console:

**Firebase Console → Firestore Database → Rules tab**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection - users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // User progress - users can only access their own progress
    match /userProgress/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Daily logs - users can only access their own logs
    match /dailyLogs/{userId}/{document=**} {
      allow read, write: if isOwner(userId);
    }
    
    // Preferences - users can only access their own preferences
    match /preferences/{userId} {
      allow read, write: if isOwner(userId);
    }
  }
}
```

## How to Apply

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "Stridr" project
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab at the top
5. **Replace** the existing rules with the code above
6. Click **Publish**

## What These Rules Do

- **Authentication Required**: All database access requires a logged-in user
- **User Isolation**: Users can only read/write their own data (based on user ID)
- **Security**: Prevents users from accessing or modifying other users' data

These rules are essential for production security.
