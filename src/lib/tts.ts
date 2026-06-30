const PREFERRED_VOICES = [
  'Microsoft Huihui',
  'Google 普通话',
  'Ting-Ting',
  'Mei-Jia',
  'Sinji',
];

class TTSService {
  private voice: SpeechSynthesisVoice | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  init(): Promise<void> {
    if (this.initPromise) return this.initPromise;
    this.initPromise = new Promise((resolve) => {
      const tryLoad = () => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          this.voice = this.selectBestVoice(voices);
          this.initialized = true;
          resolve();
        }
      };
      tryLoad();
      speechSynthesis.addEventListener('voiceschanged', tryLoad, { once: true });
      // Fallback timeout: one last attempt to grab voices, then resolve regardless
      // so the service is usable (e.g. via manual voice selection) even if the
      // 'voiceschanged' event never fired.
      setTimeout(() => {
        tryLoad();
        this.initialized = true;
        resolve();
      }, 3000);
    });
    return this.initPromise;
  }

  private selectBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    const zhVoices = voices.filter((v) => v.lang.startsWith('zh'));
    for (const name of PREFERRED_VOICES) {
      const found = zhVoices.find((v) => v.name.includes(name));
      if (found) return found;
    }
    return zhVoices[0] ?? null;
  }

  get availableVoices(): SpeechSynthesisVoice[] {
    return speechSynthesis.getVoices().filter((v) => v.lang.startsWith('zh'));
  }

  get selectedVoice(): SpeechSynthesisVoice | null {
    return this.voice;
  }

  setVoice(voice: SpeechSynthesisVoice): void {
    this.voice = voice;
  }

  speak(text: string, rate = 0.85): void {
    if (!this.initialized || !this.voice) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.voice = this.voice;
    utt.lang = 'zh-CN';
    utt.rate = rate;
    utt.pitch = 1.0;
    speechSynthesis.speak(utt);
  }

  get hasVoice(): boolean {
    return this.voice !== null;
  }
}

export const tts = new TTSService();
