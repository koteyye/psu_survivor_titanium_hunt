// Типы для менеджеров
export interface IConfigManager {
  getInstance(): IConfigManager;
  loadFromCache(scene: any, key: string, cacheKey: string): any;
  setConfig(key: string, config: any): void;
  getConfig(key: string): any;
  getValue(key: string, path: string, defaultValue?: any): any;
  areConfigsLoaded(): boolean;
  setConfigsLoaded(loaded: boolean): void;
}

export interface IAudioManager {
  getInstance(): IAudioManager;
  init(scene: any): void;
  addSound(key: string, audioKey: string, config?: any): void;
  addMusic(key: string, audioKey: string, config?: any): void;
  playSound(key: SoundKeys | string): void;
  playMusic(key: MusicKeys | string): void;
  stopMusic(): void;
  setMusicEnabled(enabled: boolean): void;
  setSoundEnabled(enabled: boolean): void;
}

// Типы для звуков и музыки
export type SoundKeys = 
  | 'explosionSound'
  | 'gameplay/replicas/friender_s/collect'
  | 'gameplay/replicas/friender_s/hit'
  | 'gameplay/replicas/friender_s/special'
  | 'gameplay/replicas/friender_s/select'
  | 'gameplay/replicas/trader/collect'
  | 'gameplay/replicas/trader/hit'
  | 'gameplay/replicas/trader/special'
  | 'gameplay/replicas/trader/select'
  | 'gameplay/replicas/zummer/collect'
  | 'gameplay/replicas/zummer/hit'
  | 'gameplay/replicas/zummer/special'
  | 'gameplay/replicas/zummer/select'
  | `gameplay/replicas/${string}/${string}`;

export type MusicKeys = 
  | 'menuMusic'
  | 'backgroundMusic_level1'
  | 'backgroundMusic_level2'
  | 'backgroundMusic_level3'
  | `backgroundMusic_level${number}`;

// Типы событий игры
export interface GameEvents {
  GAME_OVER: { reason: string };
  LEVEL_COMPLETED: { levelId: number; score: number };
  SCENE_CLEANUP: { sceneKey: string };
  UI_UPDATE: { score?: number; health?: number; [key: string]: any };
  PLAYER_MOVE: { x: number; y: number };
  ITEM_COLLECTED: { itemType: string; points: number };
}

export interface IEventManager {
  getInstance(): IEventManager;
  subscribe<K extends keyof GameEvents>(eventName: K, callback: (data: GameEvents[K]) => void, context?: any): any;
  unsubscribe(subscription: any): void;
  emit<K extends keyof GameEvents>(eventName: K, data: GameEvents[K]): void;
  subscribeScene<K extends keyof GameEvents>(scene: any, eventName: K, callback: (data: GameEvents[K]) => void): any;
}

export interface IObjectPoolManager {
  getInstance(): IObjectPoolManager;
  createPool(key: string, scene: any, texture: string, setupCallback?: Function, size?: number): void;
  getFromPool(key: string): any | null;
  returnToPool(key: string, object: any): void;
  destroyPool(key: string): void;
  destroyAllPools(): void;
}

export interface ICharacter {
  id: string;
  sprite: any;
  stats: import('./game-config').CharacterStats;
  skills: import('./game-config').CharacterSkill[];
  
  // Методы
  collectGoodItem(item: any): void;
  collectVeryGoodItem(item: any): void;
  hitBadItem(item: any): void;
  update(time: number): void;
  destroy(): void;
}
