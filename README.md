# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm run start
   ```

   If you're developing from WSL2 and the Android emulator cannot reach the dev server, use:

   ```bash
   npm run start:tunnel
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Environment

The qibla map uses Google Maps on native builds. Create a local `.env` with:

```bash
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

After adding or changing that key, rebuild the native app so the generated Android and iOS projects pick up the config:

```bash
npm run android
```

or

```bash
npm run ios
```

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## WSL troubleshooting

If the Android emulator shows a timeout while connecting to a `172.x.x.x` address, the Expo dev server is usually advertising a WSL2 NAT IP that the emulator cannot reach.

Quick recovery:

```bash
npm run start:tunnel
```

If you want to keep using LAN mode from WSL2, enable mirrored networking in `C:\Users\<you>\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
```

Then restart WSL:

```bash
wsl --shutdown
```

If the emulator still cannot connect, forward the common Expo ports:

```bash
adb reverse tcp:8081 tcp:8081
adb reverse tcp:19000 tcp:19000
adb reverse tcp:19001 tcp:19001
```

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
