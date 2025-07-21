// Temporary types until we create proper type files
export type SoundKeys = string;
export type MusicKeys = string;

interface IAudioManager {
  init(scene: Phaser.Scene): void;
  playSound(key: SoundKeys | string, config?: any): void;
  playMusic(key: MusicKeys | string, config?: any): void;
  stopMusic(): void;
  setMusicEnabled(enabled: boolean): void;
  setSoundEnabled(enabled: boolean): void;
}

export interface SoundConfig {
  volume?: number;
  rate?: number;
  loop?: boolean;
}

export interface AudioSettings {
  musicEnabled: boolean;
  soundEnabled: boolean;
  musicVolume: number;
  soundVolume: number;
}

export class AudioManager implements IAudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music: Map<string, Phaser.Sound.BaseSound> = new Map();
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private settings: AudioSettings;
  private initialized: boolean = false;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.initialized = true;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  private loadSettings(): AudioSettings {
    return {
      musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
      soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
      musicVolume: parseFloat(localStorage.getItem('musicVolume') || '0.3'),
      soundVolume: parseFloat(localStorage.getItem('soundVolume') || '0.8')
    };
  }

  private saveSettings(): void {
    localStorage.setItem('musicEnabled', this.settings.musicEnabled.toString());
    localStorage.setItem('soundEnabled', this.settings.soundEnabled.toString());
    localStorage.setItem('musicVolume', this.settings.musicVolume.toString());
    localStorage.setItem('soundVolume', this.settings.soundVolume.toString());
  }

  public playSound(key: SoundKeys | string, config: SoundConfig = {}): void {
    if (!this.settings.soundEnabled || !this.scene) return;

    try {
      // Проверяем, что звук загружен
      if (!this.scene.cache.audio.exists(key)) {
        console.warn(`Sound ${key} not found in cache, skipping playback`);
        return;
      }

      const sound = this.scene.sound.add(key, {
        volume: (config.volume || 1) * this.settings.soundVolume,
        rate: config.rate || 1,
        loop: config.loop || false
      });

      sound.play();
      this.sounds.set(key, sound);

      if (!config.loop) {
        sound.once('complete', () => {
          this.sounds.delete(key);
          if (sound.destroy) {
            sound.destroy();
          }
        });
      }
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }

  public playMusic(key: MusicKeys | string, config: SoundConfig = {}): void {
    if (!this.settings.musicEnabled || !this.scene) return;

    try {
      // Проверяем, что звук загружен
      if (!this.scene.cache.audio.exists(key)) {
        console.warn(`Music ${key} not found in cache, skipping playback`);
        return;
      }

      // Проверяем, не играет ли уже эта же музыка
      if (this.currentMusic && this.currentMusic.key === key && this.currentMusic.isPlaying) {
        console.log(`Music ${key} is already playing, skipping duplicate playback`);
        return;
      }

      // Останавливаем текущую музыку
      this.stopMusic();

      const music = this.scene.sound.add(key, {
        volume: (config.volume || 1) * this.settings.musicVolume,
        loop: config.loop !== false // По умолчанию музыка зациклена
      });

      music.play();
      this.currentMusic = music;
      this.music.set(key, music);
      
      // Добавляем обработчик завершения для очистки ссылки
      music.once('complete', () => {
        if (this.currentMusic === music) {
          this.currentMusic = null;
        }
        this.music.delete(key);
      });
      
      console.log(`Music ${key} started successfully`);
    } catch (error) {
      console.error(`Error playing music ${key}:`, error);
    }
  }

  public stopMusic(): void {
    if (this.currentMusic) {
      console.log(`Stopping current music: ${this.currentMusic.key}`);
      
      if (this.currentMusic.stop) {
        this.currentMusic.stop();
      }
      
      // Очищаем из коллекции музыки
      if (this.currentMusic.key) {
        this.music.delete(this.currentMusic.key);
      }
      
      // Уничтожаем объект если возможно
      if (this.currentMusic.destroy) {
        this.currentMusic.destroy();
      }
      
      this.currentMusic = null;
    }
  }

  public pauseMusic(): void {
    if (this.currentMusic && this.currentMusic.pause) {
      this.currentMusic.pause();
    }
  }

  public resumeMusic(): void {
    if (this.currentMusic && this.currentMusic.resume) {
      this.currentMusic.resume();
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.settings.musicEnabled = enabled;
    this.saveSettings();
    
    if (!enabled) {
      this.stopMusic();
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    this.saveSettings();
    
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  public setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
    
    if (this.currentMusic) {
      // Правильный API Phaser для установки громкости
      (this.currentMusic as any).volume = this.settings.musicVolume;
    }
  }

  public setSoundVolume(volume: number): void {
    this.settings.soundVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public getSettings(): Readonly<AudioSettings> {
    return { ...this.settings };
  }

  /**
   * Проверяет, играет ли в данный момент указанная музыка
   */
  public isMusicPlaying(key?: string): boolean {
    if (!this.currentMusic) {
      return false;
    }

    if (key) {
      return this.currentMusic.key === key && this.currentMusic.isPlaying;
    }

    return this.currentMusic.isPlaying;
  }

  private stopAllSounds(): void {
    this.sounds.forEach(sound => {
      if (sound.stop) {
        sound.stop();
      }
      if (sound.destroy) {
        sound.destroy();
      }
    });
    this.sounds.clear();
  }

  public destroy(): void {
    this.stopMusic();
    this.stopAllSounds();
    this.music.clear();
    this.scene = null;
    this.initialized = false;
  }

  // Совместимость со старым API
  public addSound(key: string, audioKey: string, config: SoundConfig = {}): void {
    // Метод для добавления звука в кеш - будет использоваться при загрузке
    console.warn(`Sound ${key} mapped to ${audioKey}`, config);
  }

  public addMusic(key: string, audioKey: string, config: SoundConfig = {}): void {
    // Метод для добавления музыки в кеш - будет использоваться при загрузке
    console.warn(`Music ${key} mapped to ${audioKey}`, config);
  }
}
