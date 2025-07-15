import { ResourceConfig, LEVEL_RESOURCES_CONFIG, CHARACTER_RESOURCES_CONFIG } from '../../config/preload-resources';
import { SPRITE_ANIMATION_COMPONENTS, SpriteAnimationManager } from '../../config/sprite-animations';
import { GameLevelScene } from '../../game/scenes/base/GameLevelScene';
import { RESOURCE_PATHS, PERFORMANCE_CONSTANTS } from '../../core/constants';

/**
 * Оптимизированный загрузчик ресурсов с поддержкой:
 * - Прогресса загрузки
 * - Приоритезации ресурсов
 * - Кеширования
 * - Предзагрузки
 */
export class OptimizedResourceLoader {
  // Один cache buster на всю сессию для лучшей производительности
  private static readonly CACHE_BUSTER = `?v=${Date.now()}`;
  
  // Кеш загруженных ресурсов
  private static loadedResources: Set<string> = new Set();
  
  // Приоритеты загрузки
  private static readonly PRIORITY = {
    CRITICAL: 1,    // UI, основные спрайты
    HIGH: 2,        // Персонажи, звуки действий
    MEDIUM: 3,      // Фоны, дополнительные звуки
    LOW: 4          // Музыка, дополнительные эффекты
  } as const;

  /**
   * Загрузка ресурсов уровня с прогрессом
   */
  public static async loadLevelResourcesWithProgress(
    scene: GameLevelScene, 
    levelId: number,
    onProgress?: (progress: number, loadedCount: number, totalCount: number) => void
  ): Promise<void> {
    console.log(`🔄 Loading resources for level ${levelId} with progress tracking...`);
    
    const levelKey = `level${levelId}`;
    const commonConfig = LEVEL_RESOURCES_CONFIG.common;
    const levelConfig = LEVEL_RESOURCES_CONFIG[levelKey];

    if (!levelConfig) {
      throw new Error(`Level config not found for level ${levelId}`);
    }

    // Собираем все ресурсы для загрузки с приоритетами
    const resourceQueue = this.buildResourceQueue(commonConfig, levelConfig, levelId);
    
    // Сортируем по приоритету
    resourceQueue.sort((a, b) => a.priority - b.priority);
    
    const totalResources = resourceQueue.length;
    let loadedCount = 0;

    // Настройка событий прогресса
    scene.load.on('fileprogress', (file: any) => {
      loadedCount++;
      const progress = (loadedCount / totalResources) * 100;
      
      if (onProgress) {
        onProgress(progress, loadedCount, totalResources);
      }
      
      console.log(`📦 Loaded: ${file.key} (${file.type}) (${loadedCount}/${totalResources}) - ${Math.round(progress)}%`);
    });

    // Добавляем обработчик ошибок загрузки
    scene.load.on('loaderror', (file: any) => {
      console.error(`❌ Failed to load: ${file.key} (${file.type}) from ${file.url}`);
    });

    // Загружаем ресурсы по приоритетам
    await this.loadResourcesInBatches(scene, resourceQueue);
    
    // Загружаем JSON конфигурации
    await this.loadConfigResourcesOptimized(scene);
    
    // Загружаем ресурсы персонажей
    await this.loadCharacterResourcesOptimized(scene);
    
    // Инициализируем спрайт-анимации после загрузки атласов
    this.initializeSpriteAnimations(scene);
    
    console.log(`✅ Level ${levelId} resources loaded successfully!`);
  }

  /**
   * Построение очереди ресурсов с приоритетами
   */
  private static buildResourceQueue(
    commonConfig: any, 
    levelConfig: any, 
    levelId: number
  ): Array<{ resource: any, priority: number, type: string }> {
    const queue: Array<{ resource: any, priority: number, type: string }> = [];

    // Критические ресурсы - фон и основные спрайты
    queue.push({
      resource: {
        key: `background_level${levelId}`,
        type: 'image',
        path: levelConfig.background
      },
      priority: this.PRIORITY.CRITICAL,
      type: 'background'
    });

    // Высокий приоритет - общие игровые ресурсы
    commonConfig.images?.forEach((resource: any) => {
      queue.push({
        resource,
        priority: this.PRIORITY.HIGH,
        type: 'common_image'
      });
    });

    // Высокий приоритет - атласы
    commonConfig.atlases?.forEach((resource: any) => {
      queue.push({
        resource,
        priority: this.PRIORITY.HIGH,
        type: 'common_atlas'
      });
    });

    // Средний приоритет - звуки и дополнительные изображения
    levelConfig.images?.forEach((resource: any) => {
      queue.push({
        resource,
        priority: this.PRIORITY.MEDIUM,
        type: 'level_image'
      });
    });

    commonConfig.sounds?.forEach((resource: any) => {
      queue.push({
        resource,
        priority: this.PRIORITY.MEDIUM,
        type: 'common_sound'
      });
    });

    // Низкий приоритет - музыка
    if (levelConfig.music) {
      queue.push({
        resource: {
          key: `backgroundMusic_level${levelId}`,
          type: 'audio',
          path: levelConfig.music
        },
        priority: this.PRIORITY.LOW,
        type: 'music'
      });
    }

    levelConfig.sounds?.forEach((resource: any) => {
      queue.push({
        resource,
        priority: this.PRIORITY.LOW,
        type: 'level_sound'
      });
    });

    return queue;
  }

  /**
   * Загрузка ресурсов батчами по приоритетам
   */
  private static async loadResourcesInBatches(
    scene: GameLevelScene, 
    resourceQueue: Array<{ resource: any, priority: number, type: string }>
  ): Promise<void> {
    const batchSize = 5; // Загружаем по 5 ресурсов одновременно
    let currentPriority = this.PRIORITY.CRITICAL;

    for (let priority = this.PRIORITY.CRITICAL; priority <= this.PRIORITY.LOW; priority++) {
      const priorityResources = resourceQueue.filter(item => item.priority === priority);
      
      // Загружаем батчами
      for (let i = 0; i < priorityResources.length; i += batchSize) {
        const batch = priorityResources.slice(i, i + batchSize);
        
        batch.forEach(({ resource }) => {
          this.loadSingleResource(scene, resource);
        });

        // Ждем загрузки батча перед переходом к следующему
        if (batch.length > 0) {
          await this.waitForBatchLoad(scene);
        }
      }
    }
  }

  /**
   * Ожидание загрузки текущего батча
   */
  private static waitForBatchLoad(scene: GameLevelScene): Promise<void> {
    return new Promise((resolve) => {
      if (scene.load.totalToLoad === 0) {
        resolve();
        return;
      }

      scene.load.once('complete', () => {
        resolve();
      });

      scene.load.start();
    });
  }

  /**
   * Загрузка одного ресурса
   */
  private static loadSingleResource(scene: GameLevelScene, resource: any): void {
    // Проверяем, не загружен ли уже ресурс
    if (this.loadedResources.has(resource.key)) {
      console.log(`⏭️ Resource ${resource.key} already loaded, skipping`);
      return;
    }

    const path = this.getCorrectPath(resource.path) + this.CACHE_BUSTER;

    try {
      switch (resource.type) {
        case 'image':
          if (!scene.textures.exists(resource.key)) {
            scene.load.image(resource.key, path);
            this.loadedResources.add(resource.key);
          }
          break;
        case 'audio':
          if (!scene.sound.get(resource.key)) {
            scene.load.audio(resource.key, path);
            this.loadedResources.add(resource.key);
          }
          break;
        case 'atlas':
          if (resource.atlasConfig && !scene.textures.exists(resource.key)) {
            const atlasPath = this.getCorrectPath(resource.atlasConfig) + this.CACHE_BUSTER;
            scene.load.atlas(resource.key, path, atlasPath);
            this.loadedResources.add(resource.key);
          }
          break;
        default:
          console.warn(`Unknown resource type: ${resource.type}`);
      }
    } catch (error) {
      console.error(`Error loading resource ${resource.key}:`, error);
    }
  }

  /**
   * Оптимизированная загрузка ресурсов персонажей
   */
  private static async loadCharacterResourcesOptimized(scene: GameLevelScene): Promise<void> {
    console.log('🔄 Loading character resources...');
    
    // Загружаем только активных персонажей
    const activeCharacters = this.getActiveCharacters();
    
    for (const characterId of activeCharacters) {
      // Загружаем специальные атласы для friender_s
      if (characterId === 'friender_s') {
        // Загружаем атлас для idle анимации
        if (!scene.textures.exists('friender_s_stay')) {
          const stayAtlasPath = this.getCorrectPath('assets/atlas/friender/friender_stay.png') + this.CACHE_BUSTER;
          const stayJsonPath = this.getCorrectPath('assets/atlas/friender/friender_stay.json') + this.CACHE_BUSTER;
          scene.load.atlas('friender_s_stay', stayAtlasPath, stayJsonPath);
        }
        
        // Загружаем атлас для анимации бега
        if (!scene.textures.exists('friender_s_run')) {
          const runAtlasPath = this.getCorrectPath('assets/atlas/friender/friender_run.png') + this.CACHE_BUSTER;
          const runJsonPath = this.getCorrectPath('assets/atlas/friender/friender_run.json') + this.CACHE_BUSTER;
          scene.load.atlas('friender_s_run', runAtlasPath, runJsonPath);
        }
        
        // Загружаем атлас для анимации смерти
        if (!scene.textures.exists('friender_s_dead')) {
          const deadAtlasPath = this.getCorrectPath('assets/atlas/friender/friender_dead.png') + this.CACHE_BUSTER;
          const deadJsonPath = this.getCorrectPath('assets/atlas/friender/friender_dead.json') + this.CACHE_BUSTER;
          scene.load.atlas('friender_s_dead', deadAtlasPath, deadJsonPath);
        }
        
        // Также загружаем основную текстуру персонажа
        if (!scene.textures.exists(characterId)) {
          const texturePath = this.getCorrectPath(`assets/characters/${characterId}.png`) + this.CACHE_BUSTER;
          scene.load.image(characterId, texturePath);
        }
      } else {
        // Обычная текстура для других персонажей
        if (!scene.textures.exists(characterId)) {
          const texturePath = this.getCorrectPath(`assets/characters/${characterId}.png`) + this.CACHE_BUSTER;
          scene.load.image(characterId, texturePath);
        }
      }

      // Звуки персонажа (только критичные)
      const criticalSounds = ['select', 'dead']; // Загружаем только важные звуки
      
      for (const soundType of criticalSounds) {
        const soundKey = `gameplay/replicas/${characterId}/${soundType}`;
        if (!scene.sound.get(soundKey)) {
          const soundPath = this.getCorrectPath(`assets/sounds/gameplay/replicas/${characterId}/${soundType}.mp3`) + this.CACHE_BUSTER;
          scene.load.audio(soundKey, soundPath);
        }
      }
    }

    // Ждем загрузки персонажей
    if (scene.load.totalToLoad > 0) {
      await this.waitForBatchLoad(scene);
    }
  }

  /**
   * Загрузка JSON конфигураций персонажей
   */
  private static async loadConfigResourcesOptimized(scene: GameLevelScene): Promise<void> {
    console.log('🔄 Loading character config resources...');
    
    const configsToLoad = [
      {
        key: 'characters_base_stat',
        path: 'assets/configs/characters/base_stat.json'
      },
      {
        key: 'characters_info',
        path: 'assets/characters/info.json'
      },
      {
        key: 'core_config',
        path: 'assets/configs/core.json'
      }
    ];
    
    // Загружаем все JSON конфиги
    for (const config of configsToLoad) {
      if (!scene.cache.json.exists(config.key)) {
        const configPath = this.getCorrectPath(config.path) + this.CACHE_BUSTER;
        scene.load.json(config.key, configPath);
      }
    }
    
    // Ждем загрузки конфигов
    if (scene.load.totalToLoad > 0) {
      await this.waitForBatchLoad(scene);
    }
    
    // Загружаем конфиги в ConfigManager
    this.loadConfigsIntoManager(scene);
    
    console.log('✅ Character configs loaded successfully');
  }

  /**
   * Загрузка конфигов в ConfigManager после загрузки JSON файлов
   */
  private static loadConfigsIntoManager(scene: GameLevelScene): void {
    // Импортируем ConfigManager статически
    const { ConfigManager } = require('../managers');
    const configManager = ConfigManager.getInstance();
    
    if (!configManager) {
      console.error('ConfigManager not found');
      return;
    }
    
    // Загружаем базовые статы персонажей
    const baseStatConfig = configManager.loadFromCache(scene, 'characters/base_stat', 'characters_base_stat');
    
    // Загружаем информацию о персонажах
    const infoConfig = configManager.loadFromCache(scene, 'characters/info', 'characters_info');
    
    // Загружаем основную конфигурацию
    const coreConfig = configManager.loadFromCache(scene, 'core', 'core_config');
    
    if (baseStatConfig && infoConfig && coreConfig) {
      configManager.setConfigsLoaded(true);
      console.log('📦 All configs loaded into ConfigManager');
    } else {
      console.error('Failed to load some configs into ConfigManager');
    }
  }

  /**
   * Предзагрузка ресурсов следующего уровня
   */
  public static preloadNextLevel(scene: GameLevelScene, nextLevelId: number): void {
    console.log(`🔮 Preloading resources for level ${nextLevelId}...`);
    
    const nextLevelConfig = LEVEL_RESOURCES_CONFIG[`level${nextLevelId}`];
    if (!nextLevelConfig) {
      return;
    }

    // Загружаем только критические ресурсы следующего уровня
    const backgroundPath = this.getCorrectPath(nextLevelConfig.background) + this.CACHE_BUSTER;
    const musicPath = this.getCorrectPath(nextLevelConfig.music) + this.CACHE_BUSTER;

    scene.load.image(`background_level${nextLevelId}`, backgroundPath);
    scene.load.audio(`backgroundMusic_level${nextLevelId}`, musicPath);
    
    scene.load.start();
  }

  /**
   * Получение активных персонажей (можно расширить логикой выбора)
   */
  private static getActiveCharacters(): string[] {
    // Пока возвращаем всех, но можно оптимизировать
    return CHARACTER_RESOURCES_CONFIG.characters || ['friender_s', 'trader', 'zummer'];
  }

  /**
   * Получение корректного пути к ресурсу
   */
  private static getCorrectPath(path: string): string {
    return path.replace(/^src\//, '');
  }

  /**
   * Очистка кеша загруженных ресурсов
   */
  public static clearResourceCache(): void {
    this.loadedResources.clear();
    console.log('🗑️ Resource cache cleared');
  }

  /**
   * Получение статистики загрузки
   */
  public static getLoadingStats(): {
    totalLoaded: number;
    cacheHits: number;
    memoryUsage: string;
  } {
    return {
      totalLoaded: this.loadedResources.size,
      cacheHits: 0, // Можно добавить счетчик кеш-хитов
      memoryUsage: `${(this.loadedResources.size * 0.1).toFixed(1)} MB` // Примерная оценка
    };
  }

  /**
   * Проверка доступности ресурса
   */
  public static isResourceLoaded(key: string): boolean {
    return this.loadedResources.has(key);
  }

  /**
   * Принудительная загрузка ресурса
   */
  public static forceLoadResource(scene: GameLevelScene, resource: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.loadSingleResource(scene, resource);
        
        if (scene.load.totalToLoad === 0) {
          resolve();
          return;
        }

        scene.load.once('complete', () => resolve());
        scene.load.once('loaderror', () => reject(new Error(`Failed to load ${resource.key}`)));
        scene.load.start();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Инициализация спрайт-анимаций после загрузки атласов
   */
  private static initializeSpriteAnimations(scene: GameLevelScene): void {
    console.log('🎬 Initializing sprite animations...');
    
    try {
      const animationManager = new SpriteAnimationManager(scene);
      
      // Инициализируем все анимации взрывов
      animationManager.initializeAllExplosions();
      
      console.log('✅ Sprite animations initialized successfully');
    } catch (error) {
      console.error('Error initializing sprite animations:', error);
    }
  }
}