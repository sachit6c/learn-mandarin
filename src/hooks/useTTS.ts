import { useCallback, useEffect, useState } from 'react';
import { tts } from '../lib/tts';
import { useSettingsStore } from '../stores/settingsStore';

export function useTTS() {
  const [ready, setReady] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { speechRate, selectedVoiceName, setSelectedVoiceName } = useSettingsStore();

  useEffect(() => {
    tts.init().then(() => {
      setReady(true);
      setVoices(tts.availableVoices);

      if (selectedVoiceName) {
        const v = tts.availableVoices.find((v) => v.name === selectedVoiceName);
        if (v) tts.setVoice(v);
      }
    });
  }, [selectedVoiceName]);

  const speak = useCallback((text: string) => {
    tts.speak(text, speechRate);
  }, [speechRate]);

  const selectVoice = useCallback((name: string) => {
    const v = tts.availableVoices.find((v) => v.name === name);
    if (v) {
      tts.setVoice(v);
      setSelectedVoiceName(name);
    }
  }, [setSelectedVoiceName]);

  return { ready, voices, speak, selectedVoice: tts.selectedVoice, selectVoice, hasVoice: tts.hasVoice };
}
