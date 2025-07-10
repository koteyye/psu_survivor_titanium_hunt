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
      return this.pools.get(key) as ObjectPool<T>;
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

  // Совместимость со старым API для Phaser объектов
  public createPhaserPool(
    key: string, 
    scene: any, 
    texture: string, 
    setupCallback?: (object: any) => void, 
    size: number = 10
  ): void {
    const factory = () => {
      if (!scene || !scene.physics || !scene.physics.add) {
        console.error('Invalid scene for Phaser pool creation');
        return null;
      }
      
      const obj = scene.physics.add.sprite(0, 0, texture);
      obj.setActive(false);
      obj.setVisible(false);
      if (obj.body) {
        obj.body.enable = false;
      }
      
      if (setupCallback) {
        setupCallback(obj);
      }
      
      return obj;
    };

    const reset = (obj: any) => {
      if (obj) {
        obj.setActive(false);
        obj.setVisible(false);
        obj.setPosition(0, 0);
        if (obj.setVelocity) {
          obj.setVelocity(0, 0);
        }
        if (obj.setAngularVelocity) {
          obj.setAngularVelocity(0);
        }
        if (obj.clearTint) {
          obj.clearTint();
        }
        if (obj.body) {
          obj.body.enable = false;
        }
      }
    };

    this.createPool(key, {
      factory,
      reset,
      initialSize: size,
      maxSize: size * 2
    });
  }

  public getFromPool(key: string): any | null {
    return this.acquire(key);
  }

  public returnToPool(key: string, object: any): void {
    this.release(key, object);
  }
}
