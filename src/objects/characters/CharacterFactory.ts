import { GameCharacterConfig, CharacterType, CharacterSkill, SkillType } from '../../types';
import { ConfigManager, EventManager } from '../../managers';
import { BaseCharacter } from './BaseCharacter';
import { FrienderCharacter } from './FrienderCharacter';
import { TraderCharacter } from './TraderCharacter';
import { ZummerCharacter } from './ZummerCharacter';

/**
 * Фабрика для создания персонажей игры
 */
export class CharacterFactory {
  private static configManager = ConfigManager.getInstance();
  private static eventManager = EventManager.getInstance();

  /**
   * Создает персонажа по ID
   */
  public static createCharacter(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterId: string
  ): BaseCharacter {
    console.log(`Creating character with ID: ${characterId}`);
    
    // Загружаем конфигурацию персонажа
    const config = this.getCharacterConfig(characterId);
    
    if (!config) {
      throw new Error(`Character configuration not found for ID: ${characterId}`);
    }
    
    let character: BaseCharacter;
    
    // Создаем персонажа на основе типа
    switch (config.type) {
      case CharacterType.FRIENDER:
        character = new FrienderCharacter(scene, x, y, config);
        break;
      case CharacterType.TRADER:
        character = new TraderCharacter(scene, x, y, config);
        break;
      case CharacterType.ZUMMER:
        character = new ZummerCharacter(scene, x, y, config);
        break;
      default:
        console.warn(`Unknown character type: ${config.type}, using friender as default`);
        character = new FrienderCharacter(scene, x, y, config);
    }
    
    // Сохраняем персонажа в Registry для совместимости
    (scene as any).registry.set('gameCharacter', character);
    (scene as any).registry.set('playerSprite', character.getSprite());
    
    // Глобальный доступ для совместимости (временно)
    (window as any).gameCharacter = character;
    
    // Уведомляем о создании персонажа
    this.eventManager.emit('CHARACTER_CREATED', { characterId, character });
    
    console.log(`Character ${characterId} created successfully`);
    return character;
  }

  /**
   * Получает конфигурацию персонажа по ID
   */
  private static getCharacterConfig(characterId: string): GameCharacterConfig | null {
    try {
      // Загружаем базовые статы
      const baseStats = this.configManager.getConfig('characters/base_stat');
      const characterInfo = this.configManager.getConfig('characters/info');
      
      if (!baseStats || !characterInfo) {
        console.error('Character configs not loaded');
        return null;
      }
      
      // Ищем конфигурацию персонажа
      let characterType: string | null = null;
      let characterInfoData: any = null;
      
      for (const [characterTypeKey, info] of Object.entries(characterInfo)) {
        if ((info as any).id === characterId) {
          characterType = characterTypeKey;
          characterInfoData = info;
          break;
        }
      }
      
      if (!characterType || !characterInfoData || !baseStats[characterType]) {
        console.error(`Character configuration not found for ID: ${characterId}`);
        return null;
      }
      
      const stats = baseStats[characterType];
      
      // Создаем конфигурацию персонажа
      const config: GameCharacterConfig = {
        id: characterId,
        name: characterInfoData.name || characterId,
        type: this.getCharacterType(characterType),
        spriteKey: characterInfoData.texture || characterId,
        baseStats: {
          health: stats.health || 100,
          maxHealth: stats.health || 100,
          speed: stats.speed || 400,
          damage: stats.damage || 10,
          defense: stats.defense || 0,
          experience: 0,
          level: 1
        },
        animations: {
          idle: `${characterId}_idle`,
          walk: `${characterId}_walk`,
          attack: `${characterId}_attack`
        },
        skills: this.loadCharacterSkills(characterType),
        description: characterInfoData.description || '',
        scale: 1,
        colliderRadius: 50
      };
      
      return config;
    } catch (error) {
      console.error(`Error loading character configuration for ${characterId}:`, error);
      return null;
    }
  }

  /**
   * Преобразует строку типа в enum
   */
  private static getCharacterType(typeString: string): CharacterType {
    switch (typeString.toLowerCase()) {
      case 'friender':
        return CharacterType.FRIENDER;
      case 'trader':
        return CharacterType.TRADER;
      case 'zummer':
      case 'zoomer':
        return CharacterType.ZUMMER;
      default:
        return CharacterType.FRIENDER;
    }
  }

  /**
   * Загружает способности персонажа
   */
  private static loadCharacterSkills(characterType: string): CharacterSkill[] {
    try {
      const skillsConfig = this.configManager.getConfig(`characters/skills/${characterType}`);
      
      if (!skillsConfig) {
        console.warn(`Skills config not found for character type: ${characterType}`);
        return [];
      }
      
      const skills: CharacterSkill[] = [];
      
      Object.entries(skillsConfig).forEach(([skillId, skillData]: [string, any]) => {
        const skill: CharacterSkill = {
          id: skillId,
          name: skillData.name || skillId,
          description: skillData.description || '',
          type: skillData.type === 'active' ? SkillType.ACTIVE : 
                skillData.type === 'ultimate' ? SkillType.ULTIMATE : SkillType.PASSIVE,
          cooldown: skillData.cooldown || 0,
          currentCooldown: 0,
          level: 1,
          maxLevel: skillData.maxLevel || 5,
          damage: skillData.damage,
          duration: skillData.duration,
          range: skillData.range,
          cost: skillData.cost,
          unlocked: skillData.unlocked !== false // По умолчанию разблокировано
        };
        
        skills.push(skill);
      });
      
      return skills;
    } catch (error) {
      console.error(`Error loading skills for character type ${characterType}:`, error);
      return [];
    }
  }

  /**
   * Получает список доступных персонажей
   */
  public static getAvailableCharacters(): Array<{
    id: string;
    name: string;
    type: CharacterType;
    spriteKey: string;
    description: string;
    stats: any;
  }> {
    try {
      const baseStats = this.configManager.getConfig('characters/base_stat');
      const characterInfo = this.configManager.getConfig('characters/info');
      
      if (!baseStats || !characterInfo) {
        console.error('Character configs not loaded');
        return [];
      }
      
      const characters: Array<{
        id: string;
        name: string;
        type: CharacterType;
        spriteKey: string;
        description: string;
        stats: any;
      }> = [];
      
      Object.keys(baseStats).forEach(key => {
        if (characterInfo[key]) {
          characters.push({
            id: characterInfo[key].id,
            name: characterInfo[key].name,
            type: this.getCharacterType(key),
            spriteKey: characterInfo[key].texture,
            description: (characterInfo[key] as any).description || '',
            stats: baseStats[key]
          });
        }
      });
      
      return characters;
    } catch (error) {
      console.error('Error getting available characters:', error);
      return [];
    }
  }

  /**
   * Проверяет валидность ID персонажа
   */
  public static validateCharacterId(characterId: string): boolean {
    try {
      const characterInfo = this.configManager.getConfig('characters/info');
      if (!characterInfo) return false;
      
      return Object.values(characterInfo).some((info: any) => info.id === characterId);
    } catch (error) {
      console.error(`Error validating character ID ${characterId}:`, error);
      return false;
    }
  }

  /**
   * Получает информацию о персонаже по ID
   */
  public static getCharacterInfo(characterId: string): any {
    try {
      const characterInfo = this.configManager.getConfig('characters/info');
      if (!characterInfo) return null;
      
      for (const [type, info] of Object.entries(characterInfo)) {
        if ((info as any).id === characterId) {
          return info;
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error getting character info for ${characterId}:`, error);
      return null;
    }
  }

  /**
   * Создает персонажа по умолчанию (для тестирования)
   */
  public static createDefaultCharacter(scene: Phaser.Scene, x: number, y: number): BaseCharacter {
    return this.createCharacter(scene, x, y, 'friender_s');
  }
}
