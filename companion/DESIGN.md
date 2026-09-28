# AEGIS Companion — Desktop Application Blueprint

**Status: DESIGN ONLY — nothing here is implemented.** This document is the
buildable architecture for the two capabilities a browser extension cannot
deliver. Build it only after the extension has users who ask for it.

## Why a companion app at all

The extension is bounded by the browser tab. Two high-value defenses live
outside it:

1. **Real-time call screening** — voice-clone fraud happens in phone/Zoom
   calls, not in tabs.
2. **Agent-traffic firewall** — AI agents (desktop apps, CLIs, local agents)
   send data over the network without a tab to inspect.

## Proposed stack

- **Tauri 2** (Rust core + web UI): small binary, native crypto, low memory —
  not Electron. The detection engines (sentinel/injection/vault) are plain JS
  modules today and can be shared with the Rust core via a sidecar Node
  process or reimplemented in Rust later for speed.

## Feature 1: Call screening (the deepfake defense)

**Design: challenge-response + voice fingerprint, all local.**

1. **Canary protocol.** Each family member registers a spoken passphrase with
   the companion app. The app stores a local voice-print embedding (never
   uploaded). During any call flagged as "family", the app asks the caller to
   say a random sentence — a cloned voice replaying old audio fails the
   random challenge; a real family member passes.
2. **Voice-print comparison.** The live embedding is compared against the
   registered print (cosine similarity threshold). Tune per user.
3. **Zero-network guarantee.** All inference runs on-device (whisper-based
   features + a small speaker-verification model, e.g. a quantized ECAPA
   model via ONNX Runtime). No audio ever leaves the machine.
4. **Honest limits.** No system reliably detects every clone. The app's
   verdict is a *risk signal with an explanation*, plus the challenge
   protocol, which is the strongest primitive (clones can't answer random
   personal challenges that aren't in their training data).

## Feature 2: Agent-traffic firewall

**Design: local MITM proxy with an allowlist policy.**

1. A loopback proxy (127.0.0.1) that desktop AI agents can be pointed at.
2. Outbound requests are parsed; payloads are scanned by the same
   sentinel/injection engines; the Identity Vault's values are detected and
   pseudonymized on the fly (the Vault mapping is shared with the proxy).
3. Policy modes: Monitor (log + alert), Guard (pseudonymize PII), Lock
   (block any payload matching vault values or injection patterns unless
   allowlisted).
4. Trust graph integration: destinations the user trusts are allowlisted;
   unknown destinations carrying vault data trigger alerts.

## Feature 3: Unified guardian report

One dashboard across extension + companion: protections, blocked payloads,
call-risk events, trust-graph status. All local; exportable as signed reports.

## Build order (when the time comes)

1. Tauri shell + shared engine loading (2 weeks)
2. Loopback proxy with Monitor mode (2–3 weeks)
3. Vault integration + Guard mode (2 weeks)
4. Voice canary + voice-print MVP (3–4 weeks, the hard part)
5. Lock mode + unified report (1–2 weeks)

## What this will NOT do (keep the promises honest)

- It will not catch every deepfake (no system does).
- It will not protect non-installed devices.
- It will not replace OS security, updates, or judgment.
