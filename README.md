<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mR9QjwnK1bnB8Fw_dFSyvnNPVoAOw1RT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Notes

- Mic and camera permissions are required for real-time voice and video. If you deny permissions, the app will prompt you to allow them.
- Voice can be toggled on/off in the UI (or press V). Audio is always requested from the server for reliability; when voice is off, playback is muted locally.
- You can switch Avatar theme (Light/Dark) in Settings to immediately see a visual change.
 - You can choose your microphone and camera in Settings. Click Refresh Devices to pick new devices, then Apply to switch during a live session.

### Hotkeys
- V: Toggle AI voice playback
- Shift+M: Next microphone
- Shift+C: Next camera
- Shift+V: Toggle video on/off
- Shift+P: Pause/Resume chat
