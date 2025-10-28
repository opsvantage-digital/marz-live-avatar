# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2025-10-28

### Added
- Avatar theme support (Light/Dark) with immediate visual feedback.
- Documentation updates detailing voice toggle behavior, permissions, and avatar theme.

### Changed
- Stabilized Gemini Live API session by always requesting audio; local playback respects voice toggle.
- Improved cleanup: stop and clear all queued audio buffers on end call.

### Fixed
- Resolved stale state closure causing emotional state to sometimes update incorrectly.
- Mic mute now applies immediately during audio processing via a ref.

### Dev
- ESM-safe `__dirname` handling in `vite.config.ts` using `import.meta.url`.

