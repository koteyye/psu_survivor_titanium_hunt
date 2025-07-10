import { ResourceConfig, LEVEL_RESOURCES_CONFIG, CHARACTER_RESOURCES_CONFIG } from '../config/preload-resources';
import { GameLevelScene } from '../scenes/base/GameLevelScene';

export class ResourceLoader {
  private static getCacheBuster(): string {
    return `?v=${Date.now()}`;
  }

  private static getCorrectPath(path: string): string {
    // Убираем src/ из пути, так как webpack это обрабатывает
    return path.replace(/^src\//, '');
  }

  public static loadLevelResources(scene: GameLevelScene, levelId: number): void {
    console.log(`Loading resources for level ${levelId}...`);
    
    const cacheBuster = this.getCacheBuster();
    const levelKey = `level${levelId}`;
    const commonConfig = LEVEL_RESOURCES_CONFIG.common;
    const levelConfig = LEVEL_RESOURCES_CONFIG[levelKey];

    if (!levelConfig) {
      throw new Error(`Level config not found for level ${levelId}`);
    }

    // Загружаем фон уровня
    this.loadResource(scene, {
      key: `background_level${levelId}`,
      type: 'image',
      path: levelConfig.background
    }, cacheBuster);

    // Загружаем музыку уровня
    this.loadResource(scene, {
      key: `backgroundMusic_level${levelId}`,
      type: 'audio',
      path: levelConfig.music
    }, cacheBuster);

    // Загружаем общие ресурсы
    this.loadResourceArray(scene, commonConfig.images, cacheBuster);
    this.loadResourceArray(scene, commonConfig.sounds, cacheBuster);
    this.loadResourceArray(scene, commonConfig.atlases, cacheBuster);

    // Загружаем специфичные для уровня ресурсы
    this.loadResourceArray(scene, levelConfig.images, cacheBuster);
    this.loadResourceArray(scene, levelConfig.sounds, cacheBuster);
    this.loadResourceArray(scene, levelConfig.atlases, cacheBuster);

    // Загружаем ресурсы персонажей
    this.loadCharacterResources(scene, cacheBuster);
  }

  private static loadResourceArray(scene: GameLevelScene, resources: ResourceConfig[], cacheBuster: string): void {
    resources.forEach(resource => {
      if (!resource.conditional || resource.conditional(scene)) {
        this.loadResource(scene, resource, cacheBuster);
      }
    });
  }

  private static loadResource(scene: GameLevelScene, resource: ResourceConfig, cacheBuster: string): void {
    const path = this.getCorrectPath(resource.path) + cacheBuster;

    switch (resource.type) {
      case 'image':
        scene.load.image(resource.key, path);
        break;
      case 'audio':
        scene.load.audio(resource.key, path);
        break;
      case 'atlas':
        if (resource.atlasConfig) {
          const atlasPath = this.getCorrectPath(resource.atlasConfig) + cacheBuster;
          scene.load.atlas(resource.key, path, atlasPath);
        }
        break;
    }
  }

  private static loadCharacterResources(scene: GameLevelScene, cacheBuster: string): void {
    // Загружаем текстуры персонажей
    CHARACTER_RESOURCES_CONFIG.characters.forEach(characterId => {
      if (!scene.textures.exists(characterId)) {
        const path = this.getCorrectPath(`src/assets/characters/${characterId}.png`) + cacheBuster;
        scene.load.image(characterId, path);
      }
    });

    // Загружаем звуки персонажей
    CHARACTER_RESOURCES_CONFIG.characters.forEach(characterId => {
      CHARACTER_RESOURCES_CONFIG.soundTypes.forEach(soundType => {
        const soundKey = `gameplay/replicas/${characterId}/${soundType}`;
        const path = this.getCorrectPath(`src/assets/sounds/gameplay/replicas/${characterId}/${soundType}.mp3`) + cacheBuster;
        scene.load.audio(soundKey, path);
      });
    });
  }
}