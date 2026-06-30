import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  speechRate: number;
  autoPlayAudio: boolean;
  darkMode: boolean;
  selectedVoiceName: string;
  setSpeechRate: (rate: number) => void;
  setAutoPlayAudio: (v: boolean) => void;
  setDarkMode: (v: boolean) => void;
  setSelectedVoiceName: (name: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      speechRate: 0.85,
      autoPlayAudio: true,
      darkMode: false,
      selectedVoiceName: '',
      setSpeechRate: (rate) => set({ speechRate: rate }),
      setAutoPlayAudio: (v) => set({ autoPlayAudio: v }),
      setDarkMode: (v) => set({ darkMode: v }),
      setSelectedVoiceName: (name) => set({ selectedVoiceName: name }),
    }),
    { name: 'mandarin-settings' }
  )
);
