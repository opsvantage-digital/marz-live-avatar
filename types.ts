export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'closed';

export interface TranscriptionEntry {
  speaker: 'user' | 'model';
  text: string;
}

export type ModalView = 'welcome' | 'chat' | 'settings' | 'legacy' | 'wallet';

export type EmotionalState = 'Calm' | 'Alert' | 'Celebrating' | 'Thoughtful' | 'Supportive' | 'Curious' | 'Idle';

export type VoiceStyle = 'Zephyr' | 'Kore' | 'Puck';
