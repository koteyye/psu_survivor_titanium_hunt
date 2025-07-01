# ЭТАП 2: МЕНЕДЖЕРЫ → TYPESCRIPT

## 📋 TODO - ПЕРЕВОД МЕНЕДЖЕРОВ НА TYPESCRIPT
**Приоритет**: ВЫСОКИЙ 🟠  
**Время**: 3-4 дня

---

## 🚨 ПРОБЛЕМЫ В ТЕКУЩИХ МЕНЕДЖЕРАХ

### ConfigManager (js/managers/config_manager.js):
- ❌ Отсутствует типизация конфигураций
- ❌ Много console.log для отладки
- ❌ Нет валидации загружаемых данных
- ❌ Метод getValue может вернуть undefined без предупреждения

### AudioManager (js/managers/audio_manager.js):
- ❌ Нет enum для ключей звуков
- ❌ Отсутствует типизация параметров
- ❌ Нет обработки ошибок загрузки звуков

### EventManager (js/managers/event_manager.js):
- ❌ События не типизированы
- ❌ Нет проверки валидности событий
- ❌ Утечки памяти при не отписанных обработчиках

### ObjectPoolManager (js/managers/object_pool_manager.js):
- ❌ Нет generic типов для объектов
- ❌ Отсутствует типизация фабричных функций

---

### 1. STATEMANAGER ДЛЯ ЗАМЕНЫ WINDOW.*

#### src/managers/StateManager.ts
```typescript
import { EventManager } from './EventManager';
import type { GameStats } from '@types/common';

export interface GameState extends GameStats {
  itemSpawnTime: number;
  selectedCharacter: string | null;
  currentLevel: number;
  paused: boolean;
}

export class StateManager {
  private static instance: StateManager;
  private eventManager: EventManager;
  private state: GameState;

  private constructor() {
    this.eventManager = EventManager.getInstance();
    this.state = this.getInitialState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): GameState {
    return {
      score: 0,
      health: 100,
      maxHealth: 100,
      gameOver: false,
      level: 1,
      itemSpawnTime: 0,
      selectedCharacter: null,
      currentLevel: 1,
      paused: false
    };
  }

  public getState(): Readonly<GameState> {
    return { ...this.state };
  }

  public setState(updates: Partial<GameState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Уведомляем подписчиков об изменении состояния
    this.eventManager.emit('STATE_CHANGED', {
      prevState,
      currentState: this.state,
      updates
    });
  }

  public resetState(): void {
    this.setState(this.getInitialState());
  }

  // Удобные методы для часто используемых операций
  public addScore(points: number): void {
    this.setState({ score: this.state.score + points });
  }

  public takeDamage(damage: number): void {
    const newHealth = Math.max(0, this.state.health - damage);
    const gameOver = newHealth <= 0;
    this.setState({ health: newHealth, gameOver });
  }

  public restoreHealth(amount: number): void {
    const newHealth = Math.min(this.state.maxHealth, this.state.health + amount);
    this.setState({ health: newHealth });
  }

  public setGameOver(gameOver: boolean): void {
    this.setState({ gameOver });
  }
}
```

---

### 2. CONFIGMANAGER → TYPESCRIPT

#### src/managers/ConfigManager.ts
```typescript
import type { CharacterConfig, LevelConfig, AudioConfig } from '@types/game-config';

export interface ConfigData {
  'core': {
    player: {
      defaultHealth: number;
      speed: number;
    };
    game: {
      itemSpawnRate: number;
      maxItems: number;
    };
  };
  'characters/info': Record<string, CharacterConfig>;
  'characters/base_stat': Record<string, any>;
  'levels': Record<string, LevelConfig>;
  'audio': AudioConfig;
  [key: string]: any;
}

export class ConfigManager {
  private static instance: ConfigManager;
  private configs: Map<keyof ConfigData, any> = new Map();
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public loadFromCache<K extends keyof ConfigData>(
    scene: Phaser.Scene, 
    key: K, 
    cacheKey: string
  ): ConfigData[K] | null {
    try {
      const config = scene.cache.json.get(cacheKey);
      if (!config) {
        console.error(`Config ${key} not found in cache with key ${cacheKey}`);
        return null;
      }
      
      this.configs.set(key, config);
      return config;
    } catch (error) {
      console.error(`Error loading config ${key} from cache:`, error);
      return null;
    }
  }

  public setConfig<K extends keyof ConfigData>(key: K, config: ConfigData[K]): void {
    this.configs.set(key, config);
  }

  public getConfig<K extends keyof ConfigData>(key: K): ConfigData[K] | null {
    return this.configs.get(key) || null;
  }

  public getValue<T = any>(
    key: keyof ConfigData, 
    path: string, 
    defaultValue: T
  ): T {
    const config = this.getConfig(key);
    if (!config) return defaultValue;

    const parts = path.split('.');
    let value: any = config;

    for (const part of parts) {
      if (value === null || value === undefined || typeof value !== 'object') {
        return defaultValue;
      }
      value = value[part];
    }

    return value !== undefined ? value : defaultValue;
  }

  public areConfigsLoaded(): boolean {
    return this.isLoaded;
  }

  public setConfigsLoaded(loaded: boolean): void {
    this.isLoaded = loaded;
  }

  public validateConfig<K extends keyof ConfigData>(
    key: K, 
    validator: (config: any) => config is ConfigData[K]
  ): boolean {
    const config = this.getConfig(key);
    return config !== null && validator(config);
  }
}

// Валидаторы конфигураций
export const configValidators = {
  isCharacterConfig: (config: any): config is CharacterConfig => {
    return config && 
           typeof config.id === 'string' &&
           typeof config.name === 'string' &&
           typeof config.texture === 'string' &&
           config.stats &&
           typeof config.stats.health === 'number';
  },

  isLevelConfig: (config: any): config is LevelConfig => {
    return config &&
           typeof config.id === 'number' &&
           typeof config.name === 'string' &&
           typeof config.background === 'string';
  }
};
```

---

### 3. AUDIOMANAGER → TYPESCRIPT

#### src/managers/AudioManager.ts  
```typescript
export enum SoundKeys {
  // UI звуки
  BUTTON_HOVER = 'button_hover',
  BUTTON_CLICK = 'button_click',
  
  // Игровые звуки
  ITEM_COLLECT = 'item_collect',
  ITEM_BAD = 'item_bad',
  EXPLOSION = 'explosion',
  
  // Персонажи
  FRIENDER_HIT = 'friender_hit',
  TRADER_SELL = 'trader_sell',
  ZUMMER_RAGE = 'zummer_rage'
}

export enum MusicKeys {
  MENU = 'menu_music',
  LEVEL1 = 'level1_music',
  LEVEL2 = 'level2_music',
  LEVEL3 = 'level3_music'
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

export class AudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  private sounds: Map<string, Phaser.Sound.BaseSound> = new Map();
  private music: Map<string, Phaser.Sound.BaseSound> = new Map();
  private currentMusic: Phaser.Sound.BaseSound | null = null;
  private settings: AudioSettings;

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
  }

  private loadSettings(): AudioSettings {
    return {
      musicEnabled: localStorage.getItem('musicEnabled') !== 'false',
      soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
      musicVolume: parseFloat(localStorage.getItem('musicVolume') || '0.3'),
      soundVolume: parseFloat(localStorage.getItem('soundVolume') || '0.8')
    };
  }

  public playSound(key: SoundKeys, config: SoundConfig = {}): void {
    if (!this.settings.soundEnabled || !this.scene) return;

    try {
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
          sound.destroy();
        });
      }
    } catch (error) {
      console.error(`Error playing sound ${key}:`, error);
    }
  }

  public playMusic(key: MusicKeys, config: SoundConfig = {}): void {
    if (!this.settings.musicEnabled || !this.scene) return;

    try {
      // Останавливаем текущую музыку
      this.stopMusic();

      const music = this.scene.sound.add(key, {
        volume: (config.volume || 1) * this.settings.musicVolume,
        loop: config.loop !== false // По умолчанию музыка зациклена
      });

      music.play();
      this.currentMusic = music;
      this.music.set(key, music);
    } catch (error) {
      console.error(`Error playing music ${key}:`, error);
    }
  }

  public stopMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  public pauseMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.pause();
    }
  }

  public resumeMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.resume();
    }
  }

  public setMusicEnabled(enabled: boolean): void {
    this.settings.musicEnabled = enabled;
    localStorage.setItem('musicEnabled', enabled.toString());
    
    if (!enabled) {
      this.stopMusic();
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.settings.soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled.toString());
    
    if (!enabled) {
      this.stopAllSounds();
    }
  }

  public setMusicVolume(volume: number): void {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('musicVolume', this.settings.musicVolume.toString());
    
    if (this.currentMusic) {
      this.currentMusic.setVolume(this.settings.musicVolume);
    }
  }

  public setSoundVolume(volume: number): void {
    this.settings.soundVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.settings.soundVolume.toString());
  }

  public getSettings(): Readonly<AudioSettings> {
    return { ...this.settings };
  }

  private stopAllSounds(): void {
    this.sounds.forEach(sound => {
      sound.stop();
      sound.destroy();
    });
    this.sounds.clear();
  }

  public destroy(): void {
    this.stopMusic();
    this.stopAllSounds();
    this.music.clear();
    this.scene = null;
  }
}
```

---

### 4. EVENTMANAGER → TYPESCRIPT

#### src/managers/EventManager.ts
```typescript
export type EventCallback<T = any> = (data: T) => void;

export interface GameEvents {
  // Состояние игры
  'STATE_CHANGED': { prevState: any; currentState: any; updates: any };
  'GAME_OVER': { score: number; reason: string };
  'GAME_RESTART': void;
  'LEVEL_COMPLETE': { levelId: number; score: number };
  
  // UI события
  'UI_UPDATE': { score?: number; health?: number };
  'BUTTON_CLICKED': { buttonId: string };
  
  // Персонажи
  'CHARACTER_CREATED': { characterId: string; character: any };
  'CHARACTER_SELECTED': { characterId: string };
  'CHARACTER_DAMAGED': { damage: number; health: number };
  
  // Предметы
  'ITEM_COLLECTED': { itemType: string; value: number };
  'EXPLOSION_CREATED': { x: number; y: number; type: string };
  
  // Аудио
  'SOUND_PLAY': { key: string; config?: any };
  'MUSIC_CHANGE': { key: string };
}

export class EventManager {
  private static instance: EventManager;
  private listeners: Map<keyof GameEvents, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public on<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit<K extends keyof GameEvents>(
    event: K,
    data: GameEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public once<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    const onceCallback = (data: GameEvents[K]) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  public removeAllListeners(event?: keyof GameEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  public getListenerCount(event: keyof GameEvents): number {
    return this.listeners.get(event)?.size || 0;
  }
}
```

---

### 5. OBJECTPOOLMANAGER → TYPESCRIPT

#### src/managers/ObjectPoolManager.ts
```typescript
export type PoolObjectFactory<T> = () => T;
export type PoolObjectReset<T> = (obj: T) => void;

export interface PoolConfig<T> {
  factory: PoolObjectFactory<T>;
  reset?: PoolObjectReset<T>;
  initialSize?: number;
  maxSize?: number;
}

export class ObjectPool<T> {
  private available: T[] = [];
  private used: Set<T> = new Set();
  private factory: PoolObjectFactory<T>;
  private resetFn?: PoolObjectReset<T>;
  private maxSize: number;

  constructor(config: PoolConfig<T>) {
    this.factory = config.factory;
    this.resetFn = config.reset;
    this.maxSize = config.maxSize || 100;

    // Предварительно создаем объекты
    const initialSize = config.initialSize || 10;
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.factory());
    }
  }

  public acquire(): T {
    let obj: T;

    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else {
      obj = this.factory();
    }

    this.used.add(obj);
    return obj;
  }

  public release(obj: T): void {
    if (!this.used.has(obj)) {
      console.warn('Attempting to release object not from this pool');
      return;
    }

    this.used.delete(obj);

    // Сбрасываем состояние объекта
    if (this.resetFn) {
      this.resetFn(obj);
    }

    // Возвращаем в пул, если не превышен лимит
    if (this.available.length < this.maxSize) {
      this.available.push(obj);
    }
  }

  public clear(): void {
    this.available = [];
    this.used.clear();
  }

  public getStats(): { available: number; used: number; total: number } {
    return {
      available: this.available.length,
      used: this.used.size,
      total: this.available.length + this.used.size
    };
  }
}

export class ObjectPoolManager {
  private static instance: ObjectPoolManager;
  private pools: Map<string, ObjectPool<any>> = new Map();

  private constructor() {}

  public static getInstance(): ObjectPoolManager {
    if (!ObjectPoolManager.instance) {
      ObjectPoolManager.instance = new ObjectPoolManager();
    }
    return ObjectPoolManager.instance;
  }

  public createPool<T>(
    key: string, 
    config: PoolConfig<T>
  ): ObjectPool<T> {
    if (this.pools.has(key)) {
      console.warn(`Pool '${key}' already exists`);
      return this.pools.get(key);
    }

    const pool = new ObjectPool(config);
    this.pools.set(key, pool);
    return pool;
  }

  public getPool<T>(key: string): ObjectPool<T> | null {
    return this.pools.get(key) || null;
  }

  public acquire<T>(key: string): T | null {
    const pool = this.getPool<T>(key);
    return pool ? pool.acquire() : null;
  }

  public release<T>(key: string, obj: T): void {
    const pool = this.getPool<T>(key);
    if (pool) {
      pool.release(obj);
    }
  }

  public destroyPool(key: string): void {
    const pool = this.pools.get(key);
    if (pool) {
      pool.clear();
      this.pools.delete(key);
    }
  }

  public destroyAllPools(): void {
    this.pools.forEach(pool => pool.clear());
    this.pools.clear();
  }

  public getPoolStats(key: string) {
    const pool = this.pools.get(key);
    return pool ? pool.getStats() : null;
  }

  public getAllPoolsStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    this.pools.forEach((pool, key) => {
      stats[key] = pool.getStats();
    });
    return stats;
  }
}
```

---

### 6. МЕНЕДЖЕР ИНДЕКСОВ

#### src/managers/index.ts
```typescript
export { ConfigManager } from './ConfigManager';
export { AudioManager, SoundKeys, MusicKeys } from './AudioManager';
export { EventManager } from './EventManager';
export { ObjectPoolManager } from './ObjectPoolManager';
export { StateManager } from './StateManager';

export type { GameEvents } from './EventManager';
export type { AudioSettings } from './AudioManager';
export type { GameState } from './StateManager';
```

---

## ✅ ЧЕКЛИСТ ЭТАПА 2

- [ ] Создан StateManager для замены window.* переменных
- [ ] ConfigManager переведен на TypeScript с типизацией
- [ ] AudioManager с enum для звуков и строгой типизацией
- [ ] EventManager с типизированными событиями
- [ ] ObjectPoolManager с generic типами
- [ ] Создан src/managers/index.ts для экспортов
- [ ] Убраны все console.log (оставлены только ошибки)
- [ ] Добавлена обработка ошибок во все методы
- [ ] Проверена сборка: `npm run build`
- [ ] Проверен type-check: `npm run type-check`

---

## 🔄 СЛЕДУЮЩИЙ ЭТАП

После завершения переходим к **ЭТАП 3: UI КОМПОНЕНТЫ → TYPESCRIPT** (`TODO_03_UI_COMPONENTS.md`)

---

## 📝 ЗАМЕТКИ

- Все менеджеры теперь singleton с типобезопасностью
- StateManager заменяет глобальные window.* переменные  
- EventManager предотвращает утечки памяти
- ObjectPoolManager поддерживает generic типы
- Добавлена валидация конфигураций
- Убраны избыточные console.log вызовы
