# ChatGPT Web Desktop

Lightweight Electron wrapper for ChatGPT web, providing a native desktop experience with Chromium performance.

## Why?

Safari's Web App mode has performance issues with ChatGPT (input lag, slow streaming). This wrapper uses Chromium (via Electron) which handles ChatGPT's JavaScript better.

## Installation

Download the latest DMG from [Releases](https://github.com/lennondotw/chatgpt-web-desktop/releases).

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm run dev

# Build DMG (simple)
pnpm run build

# Build with scripts (verbose)
pnpm run build:script
```

## Release (Local)

```bash
# One-time setup: store notarization credentials in keychain
pnpm run notarize:setup

# Full release: build + sign + notarize
pnpm run release

# Release without notarization (for testing)
pnpm run release:skip-notarize

# Verify signature and Gatekeeper status
pnpm run verify

# Notarize existing build
pnpm run notarize
```

## CI/CD Code Signing Setup

To enable code signing and notarization in CI, set the following GitHub Secrets:

| Secret                        | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `CSC_LINK`                    | Base64-encoded `.p12` certificate file            |
| `CSC_KEY_PASSWORD`            | Password for the `.p12` certificate               |
| `APPLE_ID`                    | Apple ID email for notarization                   |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password from appleid.apple.com      |
| `APPLE_TEAM_ID`               | Your Apple Developer Team ID (e.g., `9Y8RKHXVNC`) |

### Export Certificate

```bash
# Export from Keychain Access and base64 encode
base64 -i certificate.p12 | pbcopy
```

## Tech Stack

- Electron
- TypeScript
- electron-builder (packaging)

## License

MIT
