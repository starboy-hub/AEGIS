# Security Policy

## Reporting a vulnerability

**Do NOT open a public issue for security vulnerabilities.**

Report privately through GitHub's **Security Advisories** (Repository → Security → Report a vulnerability) or by contacting the repository owner (**starboy-hub**) directly.

- You will receive an acknowledgment within **72 hours**.
- Fixes for confirmed vulnerabilities ship in the next patch release, and you will be credited in the release notes if you wish.

## Scope

In scope: the extension code in this repository (`src/`, `build.js`, `scripts/`, `evaluation/`) — including the Identity Vault's encryption, message-passing security, detection engines, and build integrity.

Out of scope: the Ollama project itself, Chromium/WebView vulnerabilities, attacks requiring full-disk access or physical possession of an unlocked device (these are documented limitations in the threat model — see [docs/SECURITY-MODEL.md](docs/SECURITY-MODEL.md)).

## Supported versions

Only the latest release on `main` receives security fixes.
