This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## How to Play

Lantern Hollow is a 3D village shopkeeper survival game. You run the village shop and must serve all NPCs before nightfall each day.

### Controls
- **WASD** — Move your character
- **E** — Interact (talk to NPCs, open shop popup, sleep in bed, buy food)
- **Click doors** — Open/close building doors
- **Joystick** (mobile) — On-screen joystick for movement

### Gameplay Loop
1. **Serve customers** — NPCs come to your shop one at a time asking for a specific item. Press E near them to open the item popup, then give them the correct item to earn gold.
2. **Buy food** — Visit the food stall and press E to buy meals. Your hunger drains fast — if it hits zero you start losing health.
3. **Sleep at home** — Go to your house, open the door, walk to the bed, and press E to sleep. Sleeping restores energy and skips to the next morning. If energy hits zero you lose health.
4. **Survive the day** — You must serve every NPC before night falls. If anyone is left unserved, they leave angry and it's game over.

### Day/Night Cycle
- Each day lasts about 6 minutes real time (~3.75 min of daytime)
- NPCs wander the village during the day and go home at night
- At dawn, NPCs come back out and a new day begins

### Win Condition
Complete all NPC quests to trigger the Village Festival celebration.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
