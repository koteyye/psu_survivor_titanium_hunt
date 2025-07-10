import type { CharacterConfig, LevelConfig, AudioConfig } from '../types/game-config';

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
    scene: any, 
    key: K, 
    cacheKey: string
  ): ConfigData[K] | null {
    try {
      if (!scene || !scene.cache || !scene.cache.json) {
        console.error('Invalid scene object or cache not available');
        return null;
      }

      const config = scene.cache.json.get(cacheKey);
      if (!config) {
        console.error(`Config ${String(key)} not found in cache with key ${cacheKey}`);
        return null;
      }
      
      this.configs.set(key, config);
      console.warn(`Config ${String(key)} loaded successfully from cache`);
      return config;
    } catch (error) {
      console.error(`Error loading config ${String(key)} from cache:`, error);
      return null;
    }
  }

  public setConfig<K extends keyof ConfigData>(key: K, config: ConfigData[K]): void {
    if (!key || config === undefined || config === null) {
      console.error('Invalid config key or value');
      return;
    }
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

  public hasConfig(key: keyof ConfigData): boolean {
    return this.configs.has(key);
  }

  public getAllConfigs(): Record<string, any> {
    const result: Record<string, any> = {};
    this.configs.forEach((value, key) => {
      result[String(key)] = value;
    });
    return result;
  }

  public clearConfigs(): void {
    this.configs.clear();
    this.isLoaded = false;
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
  },

  isAudioConfig: (config: any): config is AudioConfig => {
    return config &&
           typeof config === 'object' &&
           config.music &&
           config.sounds &&
           config.volume;
  }
};
