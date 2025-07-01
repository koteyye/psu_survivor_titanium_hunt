# ЭТАП 2: МЕНЕДЖЕРЫ

## 📋 TODO - ПЕРЕВОД МЕНЕДЖЕРОВ НА TYPESCRIPT

### 1. CONFIGMANAGER → TYPESCRIPT

#### src/managers/ConfigManager.ts
```typescript
import { IConfigManager } from '../types/manager.types';

export class ConfigManager implements IConfigManager {
  private static instance: ConfigManager;
  private configs: { [key: string]: any } = {};
  private isLoaded: boolean = false;

  private constructor() {}

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  public loadFromCache(scene: Phaser.Scene, key: string, cacheKey: string): any {
    try {
      const config = scene.cache.json.get(cacheKey);
      if (!config) {
        throw new Error(`Config not found in cache: ${cacheKey}`);
      }
      this.configs[key] = config;
      console.log(`Config ${key} loaded successfully from cache`);
      return config;
    } catch (error) {
      console.error(`Error loading config ${key} from cache:`, error);
      return null;
    }
  }

  public setConfig(key: string, config: any): void {
    if (!key || config === undefined) {
      throw new Error('Invalid config key or value');
    }
    this.configs[key] = config;
  }

  public getConfig(key: string): any {
    return this.configs[key] || null;
  }

  public getValue(key: string, path: string, defaultValue: any = null): any {
    const config = this.getConfig(key);
    if (!config) return defaultValue;

    const pathParts = path.split('.');
    let current = config;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return defaultValue;
      }
    }

    return current !== undefined ? current : defaultValue;
  }

  public areConfigsLoaded(): boolean {
    return this.isLoaded;
  }

  public setConfigsLoaded(loaded: boolean): void {
    this.isLoaded = loaded;
  }

  // Валидация конфигурации
  public validateConfig(key: string, schema: any): boolean {
    const config = this.getConfig(key);
    if (!config) return false;
    
    // Простая валидация - можно расширить
    return Object.keys(schema).every(prop => prop in config);
  }
}
```

### 2. AUDIOMANAGER → TYPESCRIPT

#### src/managers/AudioManager.ts
```typescript
import { IAudioManager } from '../types/manager.types';

interface SoundConfig {
  volume?: number;
  loop?: boolean;
  [key: string]: any;
}

export class AudioManager implements IAudioManager {
  private static instance: AudioManager;
  private scene: Phaser.Scene | null = null;
  private sounds: { [key: string]: Phaser.Sound.BaseSound } = {};
  private music: { [key: string]: Phaser.Sound.BaseSound } = {};
  
  public musicEnabled: boolean = true;
  public soundEnabled: boolean = true;
  private musicVolume: number = 0.3;
  private soundVolume: number = 0.5;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.loadSettings();
  }

  private loadSettings(): void {
    const musicEnabled = localStorage.getItem('musicEnabled');
    const soundEnabled = localStorage.getItem('soundEnabled');
    
    this.musicEnabled = musicEnabled === null ? true : (musicEnabled === 'true');
    this.soundEnabled = soundEnabled === null ? true : (soundEnabled === 'true');
  }

  private saveSettings(): void {
    localStorage.setItem('musicEnabled', this.musicEnabled.toString());
    localStorage.setItem('soundEnabled', this.soundEnabled.toString());
  }

  public addSound(key: string, audioKey: string, config: SoundConfig = {}): void {
    if (!this.scene) {
      throw new Error('AudioManager not initialized. Call init() first.');
    }

    try {
      const sound = this.scene.sound.add(audioKey, {
        volume: this.soundVolume,
        ...config
      });
      
      this.sounds[key] = sound;
    } catch (error) {
      console.error(`Error adding sound ${key}:`, error);
      throw error;
    }
  }

  public addMusic(key: string, audioKey: string, config: SoundConfig = {}): void {
    if (!this.scene) {
      throw new Error('AudioManager not initialized. Call init() first.');
    }

    try {
      const music = this.scene.sound.add(audioKey, {
        volume: this.musicVolume,
        loop: true,
        ...config
      });
      
      this.music[key] = music;
    } catch (error) {
      console.error(`Error adding music ${key}:`, error);
      throw error;
    }
  }

  public playSound(key: string): void {
    if (!this.soundEnabled) return;
    
    const sound = this.sounds[key];
    if (sound && !sound.isPlaying) {
      sound.play();
    }
  }

  public playMusic(key: string): void {
    if (!this.musicEnabled) return;
    
    const music = this.music[key];
    if (music && !music.isPlaying) {
      music.play();
    }
  }

  public stopMusic(): void {
    Object.values(this.music).forEach(music => {
      if (music.isPlaying) {
        music.stop();
      }
    });
  }

  public setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    this.saveSettings();
    
    if (!enabled) {
      this.stopMusic();
    }
  }

  public setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.saveSettings();
    
    if (!enabled) {
      Object.values(this.sounds).forEach(sound => {
        if (sound.isPlaying) {
          sound.stop();
        }
      });
    }
  }

  public cleanup(): void {
    this.stopMusic();
    Object.values(this.sounds).forEach(sound => sound.destroy());
    Object.values(this.music).forEach(music => music.destroy());
    
    this.sounds = {};
    this.music = {};
  }
}
```

### 3. EVENTMANAGER → TYPESCRIPT

#### src/managers/EventManager.ts
```typescript
import { IEventManager } from '../types/manager.types';

interface EventSubscription {
  id: string;
  eventName: string;
  callback: Function;
  context?: any;
  once?: boolean;
}

export class EventManager implements IEventManager {
  private static instance: EventManager;
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private subscriptionId: number = 0;

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public subscribe(eventName: string, callback: Function, context?: any): EventSubscription {
    if (!eventName || typeof callback !== 'function') {
      throw new Error('Invalid event name or callback');
    }

    const subscription: EventSubscription = {
      id: (++this.subscriptionId).toString(),
      eventName,
      callback,
      context
    };

    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, []);
    }

    this.subscriptions.get(eventName)!.push(subscription);
    return subscription;
  }

  public once(eventName: string, callback: Function, context?: any): EventSubscription {
    const subscription = this.subscribe(eventName, callback, context);
    subscription.once = true;
    return subscription;
  }

  public unsubscribe(subscription: EventSubscription): void {
    const eventSubscriptions = this.subscriptions.get(subscription.eventName);
    if (eventSubscriptions) {
      const index = eventSubscriptions.findIndex(sub => sub.id === subscription.id);
      if (index !== -1) {
        eventSubscriptions.splice(index, 1);
      }
    }
  }

  public unsubscribeAll(eventName: string): void {
    this.subscriptions.delete(eventName);
  }

  public emit(eventName: string, data?: any): void {
    const eventSubscriptions = this.subscriptions.get(eventName);
    if (!eventSubscriptions) return;

    // Создаем копию массива для безопасной итерации
    const subscriptionsCopy = [...eventSubscriptions];
    
    subscriptionsCopy.forEach(subscription => {
      try {
        if (subscription.context) {
          subscription.callback.call(subscription.context, data);
        } else {
          subscription.callback(data);
        }

        // Удаляем подписку, если она одноразовая
        if (subscription.once) {
          this.unsubscribe(subscription);
        }
      } catch (error) {
        console.error(`Error in event callback for ${eventName}:`, error);
      }
    });
  }

  public subscribeScene(scene: Phaser.Scene, eventName: string, callback: Function): EventSubscription {
    const subscription = this.subscribe(eventName, callback, scene);
    
    // Автоматическая отписка при уничтожении сцены
    scene.events.once('shutdown', () => {
      this.unsubscribe(subscription);
    });

    return subscription;
  }

  public getSubscriptionCount(eventName?: string): number {
    if (eventName) {
      return this.subscriptions.get(eventName)?.length || 0;
    }
    
    let total = 0;
    this.subscriptions.forEach(subs => total += subs.length);
    return total;
  }

  public clear(): void {
    this.subscriptions.clear();
    this.subscriptionId = 0;
  }
}
```

### 4. OBJECTPOOLMANAGER → TYPESCRIPT

#### src/managers/ObjectPoolManager.ts
```typescript
import { IObjectPoolManager } from '../types/manager.types';

interface ObjectPool {
  key: string;
  scene: Phaser.Scene;
  texture: string;
  objects: Phaser.Physics.Arcade.Sprite[];
  activeObjects: Set<Phaser.Physics.Arcade.Sprite>;
  setupCallback?: (object: Phaser.Physics.Arcade.Sprite) => void;
  maxSize: number;
}

export class ObjectPoolManager implements IObjectPoolManager {
  private static instance: ObjectPoolManager;
  private pools: Map<string, ObjectPool> = new Map();

  private constructor() {}

  public static getInstance(): ObjectPoolManager {
    if (!ObjectPoolManager.instance) {
      ObjectPoolManager.instance = new ObjectPoolManager();
    }
    return ObjectPoolManager.instance;
  }

  public createPool(
    key: string, 
    scene: Phaser.Scene, 
    texture: string, 
    setupCallback?: (object: Phaser.Physics.Arcade.Sprite) => void, 
    size: number = 10
  ): void {
    if (this.pools.has(key)) {
      console.warn(`Pool with key ${key} already exists`);
      return;
    }

    const pool: ObjectPool = {
      key,
      scene,
      texture,
      objects: [],
      activeObjects: new Set(),
      setupCallback,
      maxSize: size
    };

    // Предварительно создаем объекты
    for (let i = 0; i < size; i++) {
      const obj = scene.physics.add.sprite(0, 0, texture);
      obj.setActive(false);
      obj.setVisible(false);
      obj.body.enable = false;
      
      if (setupCallback) {
        setupCallback(obj);
      }
      
      pool.objects.push(obj);
    }

    this.pools.set(key, pool);
    console.log(`Object pool '${key}' created with ${size} objects`);
  }

  public getFromPool(key: string): Phaser.Physics.Arcade.Sprite | null {
    const pool = this.pools.get(key);
    if (!pool) {
      console.error(`Pool '${key}' not found`);
      return null;
    }

    // Ищем неактивный объект
    const availableObject = pool.objects.find(obj => !obj.active);
    
    if (availableObject) {
      availableObject.setActive(true);
      availableObject.setVisible(true);
      availableObject.body.enable = true;
      pool.activeObjects.add(availableObject);
      return availableObject;
    }

    // Если нет доступных объектов и не достигли лимита - создаем новый
    if (pool.objects.length < pool.maxSize) {
      const newObj = pool.scene.physics.add.sprite(0, 0, pool.texture);
      if (pool.setupCallback) {
        pool.setupCallback(newObj);
      }
      
      pool.objects.push(newObj);
      pool.activeObjects.add(newObj);
      return newObj;
    }

    console.warn(`Pool '${key}' is full and no objects are available`);
    return null;
  }

  public returnToPool(key: string, object: Phaser.Physics.Arcade.Sprite): void {
    const pool = this.pools.get(key);
    if (!pool) {
      console.error(`Pool '${key}' not found`);
      return;
    }

    if (pool.activeObjects.has(object)) {
      object.setActive(false);
      object.setVisible(false);
      object.body.enable = false;
      object.setPosition(0, 0);
      object.setVelocity(0, 0);
      object.setAngularVelocity(0);
      object.clearTint();
      
      pool.activeObjects.delete(object);
    }
  }

  public destroyPool(key: string): void {
    const pool = this.pools.get(key);
    if (!pool) {
      console.warn(`Pool '${key}' not found`);
      return;
    }

    pool.objects.forEach(obj => obj.destroy());
    pool.activeObjects.clear();
    this.pools.delete(key);
    
    console.log(`Pool '${key}' destroyed`);
  }

  public destroyAllPools(): void {
    this.pools.forEach((_, key) => this.destroyPool(key));
    console.log('All object pools destroyed');
  }

  public getPoolInfo(key: string): { total: number, active: number, available: number } | null {
    const pool = this.pools.get(key);
    if (!pool) return null;

    return {
      total: pool.objects.length,
      active: pool.activeObjects.size,
      available: pool.objects.length - pool.activeObjects.size
    };
  }

  public getAllPoolsInfo(): { [key: string]: { total: number, active: number, available: number } } {
    const info: { [key: string]: { total: number, active: number, available: number } } = {};
    
    this.pools.forEach((pool, key) => {
      info[key] = {
        total: pool.objects.length,
        active: pool.activeObjects.size,
        available: pool.objects.length - pool.activeObjects.size
      };
    });

    return info;
  }
}
```

### 5. ОБНОВИТЬ INDEX.TS

#### src/managers/index.ts
```typescript
export { ConfigManager } from './ConfigManager';
export { AudioManager } from './AudioManager';
export { EventManager } from './EventManager';
export { ObjectPoolManager } from './ObjectPoolManager';

export type { IConfigManager, IAudioManager, IEventManager, IObjectPoolManager } from '../types/manager.types';
```

---

## 🔧 ПРОБЛЕМЫ ИСПРАВЛЕННЫЕ

### 1. ОТСУТСТВИЕ ОБРАБОТКИ ОШИБОК
- ✅ Добавлены try/catch блоки
- ✅ Валидация параметров
- ✅ Логирование ошибок

### 2. ОТСУТСТВИЕ ТИПИЗАЦИИ
- ✅ Все методы типизированы
- ✅ Интерфейсы для контрактов
- ✅ Generics где необходимо

### 3. НЕБЕЗОПАСНЫЕ ОПЕРАЦИИ
- ✅ Проверка на null/undefined
- ✅ Валидация входных данных
- ✅ Безопасная работа с localStorage

### 4. УТЕЧКИ ПАМЯТИ
- ✅ Методы cleanup
- ✅ Автоматическая отписка от событий
- ✅ Правильное уничтожение объектов

---

## ✅ CHECKLIST

- [ ] Создать ConfigManager.ts
- [ ] Создать AudioManager.ts  
- [ ] Создать EventManager.ts
- [ ] Создать ObjectPoolManager.ts
- [ ] Обновить managers/index.ts
- [ ] Написать тесты для менеджеров
- [ ] Проверить совместимость с существующим кодом
- [ ] Обновить импорты в других файлах
- [ ] Протестировать функциональность
- [ ] Добавить JSDoc комментарии

---

## 🎯 РЕЗУЛЬТАТ ЭТАПА

После завершения этого этапа:
- ✅ Все менеджеры типизированы
- ✅ Добавлена обработка ошибок
- ✅ Улучшена производительность
- ✅ Устранены утечки памяти
- ✅ Код стал более надежным

**Время выполнения**: 2-3 дня
