import { IObjectPoolManager } from '../../core/types';
import { PERFORMANCE_CONSTANTS } from '../../core/constants';

/**
 * Оптимизированный менеджер пула объектов
 * Уменьшает garbage collection и улучшает производительность
 */
export class OptimizedObjectPool implements IObjectPoolManager {
  private static instance: OptimizedObjectPool;
  private pools: Map<string, ObjectPool> = new Map();
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): OptimizedObjectPool {
    if (!OptimizedObjectPool.instance) {
      OptimizedObjectPool.instance = new OptimizedObjectPool();
    }
    return OptimizedObjectPool.instance;
  }

  public init(): void {
    this.initialized = true;
    console.log('🎱 ObjectPool initialized');
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Создание пула объектов
   */
  public createPool(
    key: string, 
    scene: Phaser.Scene, 
    texture: string, 
    setupCallback?: Function, 
    size?: number
  ): void {
    if (this.pools.has(key)) {
      console.warn(`Pool ${key} already exists`);
      return;
    }

    const poolSize = size || this.getDefaultPoolSize(key);
    const pool = new ObjectPool(key, scene, texture, setupCallback, poolSize);
    
    this.pools.set(key, pool);
    console.log(`🎱 Created pool '${key}' with ${poolSize} objects`);
  }

  /**
   * Получение объекта из пула
   */
  public getFromPool(key: string): Phaser.GameObjects.GameObject | null {
    const pool = this.pools.get(key);
    if (!pool) {
      console.warn(`Pool ${key} does not exist`);
      return null;
    }

    return pool.get();
  }

  /**
   * Возврат объекта в пул
   */
  public returnToPool(key: string, object: Phaser.GameObjects.GameObject): void {
    const pool = this.pools.get(key);
    if (!pool) {
      console.warn(`Pool ${key} does not exist`);
      return;
    }

    pool.return(object);
  }

  /**
   * Уничтожение пула
   */
  public destroyPool(key: string): void {
    const pool = this.pools.get(key);
    if (pool) {
      pool.destroy();
      this.pools.delete(key);
      console.log(`🗑️ Destroyed pool '${key}'`);
    }
  }

  /**
   * Уничтожение всех пулов
   */
  public destroyAllPools(): void {
    this.pools.forEach((pool, key) => {
      pool.destroy();
      console.log(`🗑️ Destroyed pool '${key}'`);
    });
    this.pools.clear();
  }

  /**
   * Создание предустановленных пулов для игры
   */
  public createGamePools(scene: Phaser.Scene): void {
    // Пул для взрывов
    this.createPool('explosions', scene, 'explosion', (obj: Phaser.GameObjects.Sprite) => {
      obj.setScale(1);
      obj.setAlpha(1);
      obj.setVisible(false);
      obj.setActive(false);
    }, PERFORMANCE_CONSTANTS.OBJECT_POOL.EXPLOSION_POOL_SIZE);

    // Пул для эффектов
    this.createPool('effects', scene, 'particle_effect', (obj: Phaser.GameObjects.Sprite) => {
      obj.setScale(0.5);
      obj.setAlpha(1);
      obj.setVisible(false);
      obj.setActive(false);
    }, PERFORMANCE_CONSTANTS.OBJECT_POOL.EFFECT_POOL_SIZE);

    // Пул для предметов PSU
    this.createPool('good_psu', scene, 'good_psu', (obj: Phaser.GameObjects.Sprite) => {
      obj.setScale(1);
      obj.setAlpha(1);
      obj.setVisible(false);
      obj.setActive(false);
      // Добавляем физику если нужно
      if (scene.physics && scene.physics.world) {
        scene.physics.world.enable(obj);
      }
    }, PERFORMANCE_CONSTANTS.OBJECT_POOL.DEFAULT_SIZE);

    this.createPool('bad_psu', scene, 'bad_psu', (obj: Phaser.GameObjects.Sprite) => {
      obj.setScale(1);
      obj.setAlpha(1);
      obj.setVisible(false);
      obj.setActive(false);
      if (scene.physics && scene.physics.world) {
        scene.physics.world.enable(obj);
      }
    }, PERFORMANCE_CONSTANTS.OBJECT_POOL.DEFAULT_SIZE);

    this.createPool('very_good_psu', scene, 'very_good_psu', (obj: Phaser.GameObjects.Sprite) => {
      obj.setScale(1);
      obj.setAlpha(1);
      obj.setVisible(false);
      obj.setActive(false);
      if (scene.physics && scene.physics.world) {
        scene.physics.world.enable(obj);
      }
    }, 10); // Меньше, так как реже появляются

    console.log('🎱 Game pools created successfully');
  }

  /**
   * Получение размера пула по умолчанию
   */
  private getDefaultPoolSize(key: string): number {
    switch (key) {
      case 'explosions':
        return PERFORMANCE_CONSTANTS.OBJECT_POOL.EXPLOSION_POOL_SIZE;
      case 'effects':
        return PERFORMANCE_CONSTANTS.OBJECT_POOL.EFFECT_POOL_SIZE;
      default:
        return PERFORMANCE_CONSTANTS.OBJECT_POOL.DEFAULT_SIZE;
    }
  }

  /**
   * Получение статистики пулов
   */
  public getPoolStats(): Record<string, PoolStats> {
    const stats: Record<string, PoolStats> = {};
    
    this.pools.forEach((pool, key) => {
      stats[key] = pool.getStats();
    });
    
    return stats;
  }

  /**
   * Очистка неиспользуемых объектов во всех пулах
   */
  public cleanupPools(): void {
    this.pools.forEach(pool => {
      pool.cleanup();
    });
    console.log('🧹 Pool cleanup completed');
  }

  public destroy(): void {
    this.destroyAllPools();
    this.initialized = false;
  }
}

/**
 * Класс для отдельного пула объектов
 */
class ObjectPool {
  private available: Phaser.GameObjects.GameObject[] = [];
  private inUse: Set<Phaser.GameObjects.GameObject> = new Set();
  private scene: Phaser.Scene;
  private texture: string;
  private setupCallback?: Function;
  private key: string;
  private maxSize: number;

  constructor(
    key: string,
    scene: Phaser.Scene, 
    texture: string, 
    setupCallback?: Function, 
    size: number = 10
  ) {
    this.key = key;
    this.scene = scene;
    this.texture = texture;
    this.setupCallback = setupCallback;
    this.maxSize = size;
    
    // Предварительно создаем объекты
    for (let i = 0; i < size; i++) {
      this.createObject();
    }
  }

  /**
   * Создание нового объекта
   */
  private createObject(): Phaser.GameObjects.GameObject {
    const obj = this.scene.add.sprite(0, 0, this.texture);
    
    // Применяем настройки
    if (this.setupCallback) {
      this.setupCallback(obj);
    }
    
    obj.setVisible(false);
    obj.setActive(false);
    
    this.available.push(obj);
    return obj;
  }

  /**
   * Получение объекта из пула
   */
  public get(): Phaser.GameObjects.GameObject | null {
    let obj: Phaser.GameObjects.GameObject;
    
    if (this.available.length > 0) {
      obj = this.available.pop()!;
    } else if (this.inUse.size < this.maxSize) {
      // Создаем новый объект если не достигли лимита
      obj = this.createObject();
      this.available.pop(); // Убираем из available, так как сразу используем
    } else {
      console.warn(`Pool ${this.key} is exhausted`);
      return null;
    }
    
    // Активируем объект
    (obj as any).setVisible(true);
    (obj as any).setActive(true);
    this.inUse.add(obj);
    
    return obj;
  }

  /**
   * Возврат объекта в пул
   */
  public return(obj: Phaser.GameObjects.GameObject): void {
    if (!this.inUse.has(obj)) {
      console.warn(`Object not in use for pool ${this.key}`);
      return;
    }
    
    // Деактивируем объект
    (obj as any).setVisible(false);
    (obj as any).setActive(false);
    
    // Сброс позиции и состояния
    if (obj instanceof Phaser.GameObjects.Sprite) {
      obj.setPosition(0, 0);
      obj.setScale(1);
      obj.setAlpha(1);
      obj.setRotation(0);
      
      // Остановка анимации если есть
      if (obj.anims && obj.anims.currentAnim) {
        obj.anims.stop();
      }
      
      // Сброс физики
      const body = obj.body as Phaser.Physics.Arcade.Body;
      if (body) {
        body.setVelocity(0, 0);
        body.setAngularVelocity(0);
      }
    }
    
    this.inUse.delete(obj);
    this.available.push(obj);
  }

  /**
   * Получение статистики пула
   */
  public getStats(): PoolStats {
    return {
      key: this.key,
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
      maxSize: this.maxSize,
      utilization: (this.inUse.size / this.maxSize) * 100
    };
  }

  /**
   * Очистка неиспользуемых объектов
   */
  public cleanup(): void {
    // Уничтожаем излишки доступных объектов если их больше половины максимума
    const targetSize = Math.floor(this.maxSize / 2);
    
    while (this.available.length > targetSize) {
      const obj = this.available.pop();
      if (obj) {
        obj.destroy();
      }
    }
  }

  /**
   * Уничтожение всех объектов пула
   */
  public destroy(): void {
    // Уничтожаем все доступные объекты
    this.available.forEach(obj => {
      if (obj && !obj.scene) { // Проверяем что объект еще существует
        obj.destroy();
      }
    });
    
    // Уничтожаем используемые объекты
    this.inUse.forEach(obj => {
      if (obj && !obj.scene) {
        obj.destroy();
      }
    });
    
    this.available = [];
    this.inUse.clear();
  }
}

/**
 * Интерфейс статистики пула
 */
interface PoolStats {
  key: string;
  available: number;
  inUse: number;
  total: number;
  maxSize: number;
  utilization: number;
}