# Firebase Auth + Next.js

This is an example of how to use [firebase-auth-lite](https://github.com/samuelgozi/firebase-auth-lite/) with [Next.js](https://nextjs.org) for client-side authentication.

[Live demo](https://firebase-auth-nextjs.vercel.app)

## Features

- Sign up with e-mail + password
- Login with e-mail + password
- Login with just e-mail (sends you a link)
- Anonymous login
- Login with Google (other Firebase-supported providers should work, but haven't tried them)
- Password reset flow (Firebase sends an email, redirects back to this app to reset the password)

## Running locally

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setting up Firebase Auth

These steps probably need work…

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Create a project if you don't have one
3. Get your API Key from Project Settings
   - You'll need to click Add app if you haven't already
   - There should be an html/javascript snippet that has a `var firebaseConfig = { …` with an `apiKey` in there
4. Navigate to Authentication > Sign-in method and enable the e-mail and Google providers (or whatever you want)
5. In Authentication > Templates you should be able to set the callback url to `https://example.com/auth/callback`.
   This bypasses the Firebase UI for e-mail verification, password resets, and email "magic links" giving you more
   control and performance

## License

MIT
