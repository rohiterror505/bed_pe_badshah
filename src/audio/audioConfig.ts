export interface AudioAssetDef {
  key: string;
  path: string;
  volume?: number;
}

export const audioAssets: AudioAssetDef[] = [
  { key: 'shoot', path: '/audio/effects/shoot.wav', volume: 0.6 },
  { key: 'hit', path: '/audio/effects/hit.wav', volume: 0.8 },
  { key: 'explosion', path: '/audio/effects/explosion.wav', volume: 0.9 },
  { key: 'combo', path: '/audio/effects/combo.wav', volume: 0.7 },
  { key: 'background', path: '/audio/music/background.mp3', volume: 0.4 },
  // Character voice clips (real recordings supplied by user)
  { key: 'amitabh:kill', path: '/audio/amitabh/kill-01.mp3', volume: 1 },
  { key: 'puneet:voice', path: '/audio/puneet/voice.mp3', volume: 1 },
  { key: 'rakhi:voice', path: '/audio/rakhi/voice.mp3', volume: 1 },
  { key: 'mcstan:voice', path: '/audio/mc-stan/voice.mp3', volume: 1 },
];

// Map dialogue event -> preloaded audio key. When a clip exists it plays;
// otherwise the DialogueManager falls back to Web Speech API TTS.
export const dialogueAudioKeys: Record<string, string> = {
  'amitabh:kill-01': '/audio/amitabh/kill-01.mp3',
  'amitabh:kill-02': '/audio/amitabh/kill-01.mp3',
  'puneet:entrance-01': '/audio/puneet/voice.mp3',
  'puneet:miss-01': '/audio/puneet/voice.mp3',
  'rakhi:entrance-01': '/audio/rakhi/voice.mp3',
  'rakhi:miss-01': '/audio/rakhi/voice.mp3',
  'mcstan:entrance-01': '/audio/mc-stan/voice.mp3',
  'mcstan:taunt-01': '/audio/mc-stan/voice.mp3',
};