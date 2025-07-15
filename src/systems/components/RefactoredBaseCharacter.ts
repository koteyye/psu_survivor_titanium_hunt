import { EventManager } from '../managers';
import { HealthComponent } from './HealthComponent';
import { SkillComponent } from './SkillComponent';
import { MovementComponent } from './MovementComponent';

// Temporary types until we create proper type files
interface Position {
  x: number;
  y: number;
}

enum CharacterState {
  IDLE = 'idle',
  MOVING = 'moving',
  ATTACKING = 'attacking',
  DEAD = 'dead',
  STUNNED = 'stunned'
}

enum CharacterType {
  FRIENDER = 'friender',
  TRADER = 'trader',
  ZUMMER = 'zummer'
}

interface CharacterStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  defense: number;
  level: number;
  experience: number;
}

interface CharacterModifiers {
  healthMultiplier: number;
  speedMultiplier: number;
  damageMultiplier: number;
  defenseMultiplier: number;
  experienceMultiplier: number;
}

interface CharacterSkill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cooldown: number;
  currentCooldown: number;
  unlocked: boolean;
  damage?: number;
  duration?: number;
  range?: number;
  cost?: number;
}

interface GameCharacterConfig {
  id: string;
  type: CharacterType;
  spriteKey: string;
  baseStats: CharacterStats;
  skills: CharacterSkill[];
  scale?: number;
  colliderRadius?: number;
  animations: any;
}

interface ICombatable {
  takeDamage(damage: number, source?: any): number;
  heal(amount: number): number;
  attack(target: any): boolean;
  canAttack(target: any): boolean;
}

interface ISkillUser {
  useSkill(skillId: string, target?: Position | any): boolean;
  upgradeSkill(skillId: string): boolean;
  canUseSkill(skillId: string): boolean;
  getSkill(skillId: string): CharacterSkill | null;
}

/**
 * Рефакторенный BaseCharacter с использованием ECS компонентов
 * Теперь гораздо меньше кода и каждая система отвечает за свою область
 */
export abstract class RefactoredBaseCharacter implements ICombatable, ISkillUser {
  // Основные данные персонажа
  protected config: GameCharacterConfig;
  protected stats: CharacterStats;
  protected modifiers: CharacterModifiers;
  protected state: CharacterState;
  protected eventManager: EventManager;
  
  // ECS Компоненты
  protected healthComponent!: HealthComponent;
  protected skillComponent!: SkillComponent;
  protected movementComponent!: MovementComponent;
  
  // Phaser объекты
  protected sprite: Phaser.GameObjects.Sprite;
  protected scene: Phaser.Scene;

  public readonly characterId: string;
  public readonly characterType: CharacterType;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: GameCharacterConfig
  ) {
    this.scene = scene;
    this.config = config;
    this.characterId = config.id;
    this.characterType = config.type;
    this.eventManager = EventManager.getInstance();
    
    // Создание Phaser спрайта
    this.sprite = scene.add.sprite(x, y, config.spriteKey);
    
    // Инициализация характеристик
    this.stats = { ...config.baseStats };
    this.modifiers = {
      healthMultiplier: 1,
      speedMultiplier: 1,
      damageMultiplier: 1,
      defenseMultiplier: 1,
      experienceMultiplier: 1
    };
    
    this.state = CharacterState.IDLE;
    
    // Создание компонентов
    this.initializeComponents();
    
    // Настройка физики и анимаций
    this.setupPhysics();
    this.setupAnimations();
    
    // Инициализация для наследников
    this.initializeCharacter();
  }

  /**
   * Инициализация ECS компонентов
   */
  private initializeComponents(): void {
    // Компонент здоровья
    this.healthComponent = new HealthComponent(
      this.characterId,
      this.stats,
      this.scene
    );

    // Компонент способностей
    this.skillComponent = new SkillComponent(
      this.characterId,
      this.config.skills
    );

    // Компонент движения
    this.movementComponent = new MovementComponent(
      this.characterId,
      this.sprite,
      this.scene,
      this.stats.speed
    );
  }

  /**
   * Настройка физики персонажа
   */
  protected setupPhysics(): void {
    this.movementComponent.setupPhysics(this.config.colliderRadius);
    
    if (this.config.scale) {
      this.sprite.setScale(this.config.scale);
    }
  }

  /**
   * Настройка анимаций персонажа
   */
  protected setupAnimations(): void {
    const anims = this.scene.anims;
    const animConfig = this.config.animations;
    
    // Создание анимации idle
    if (animConfig.idle && !anims.exists(`${this.characterId}_idle`)) {
      anims.create({
        key: `${this.characterId}_idle`,
        frames: anims.generateFrameNumbers(this.config.spriteKey, { start: 0, end: 3 }),
        frameRate: 8,
        repeat: -1
      });
    }
    
    // Создание анимации ходьбы
    if (animConfig.walk && !anims.exists(`${this.characterId}_walk`)) {
      anims.create({
        key: `${this.characterId}_walk`,
        frames: anims.generateFrameNumbers(this.config.spriteKey, { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    
    // Создание анимации атаки (если есть)
    if (animConfig.attack && !anims.exists(`${this.characterId}_attack`)) {
      anims.create({
        key: `${this.characterId}_attack`,
        frames: anims.generateFrameNumbers(this.config.spriteKey, { start: 8, end: 11 }),
        frameRate: 12,
        repeat: 0
      });
    }
    
    // Запуск анимации idle по умолчанию
    this.sprite.play(`${this.characterId}_idle`);
  }

  /**
   * Инициализация специфичных для персонажа параметров
   */
  protected abstract initializeCharacter(): void;

  /**
   * Обновление персонажа каждый кадр - теперь намного проще!
   */
  public update(time: number, delta: number): void {
    // Обновляем компоненты
    this.skillComponent.updateCooldowns(delta);
    this.movementComponent.update();
    
    // Обновляем модификаторы
    this.updateModifiers();
    
    // Кастомное обновление для наследников
    this.customUpdate(time, delta);
  }

  /**
   * Кастомное обновление для наследников
   */
  protected abstract customUpdate(time: number, delta: number): void;

  /**
   * Обновление модификаторов
   */
  protected updateModifiers(): void {
    // Обновляем максимальное здоровье в HealthComponent
    this.healthComponent.updateMaxHealth(this.stats.maxHealth, this.modifiers.healthMultiplier);
    
    // Обновляем скорость в MovementComponent
    this.movementComponent.setSpeedMultiplier(this.modifiers.speedMultiplier);
  }

  // ========== РЕАЛИЗАЦИЯ ICombatable ==========
  public takeDamage(damage: number, source?: unknown): number {
    const defense = this.stats.defense * this.modifiers.defenseMultiplier;
    const actualDamage = this.healthComponent.takeDamage(damage, defense, source);
    
    if (this.healthComponent.isDead()) {
      this.die();
    }
    
    return actualDamage;
  }

  public heal(amount: number): number {
    return this.healthComponent.heal(amount);
  }

  public abstract attack(target: unknown): boolean;
  public abstract canAttack(target: unknown): boolean;

  // ========== РЕАЛИЗАЦИЯ ISkillUser ==========
  public useSkill(skillId: string, target?: Position | unknown): boolean {
    return this.skillComponent.useSkill(skillId, target, (skill, skillTarget) => {
      return this.executeSkill(skill, skillTarget);
    });
  }

  public upgradeSkill(skillId: string): boolean {
    return this.skillComponent.upgradeSkill(skillId, (skill) => {
      this.applySkillUpgrade(skill);
    });
  }

  public canUseSkill(skillId: string): boolean {
    return this.skillComponent.canUseSkill(skillId) && 
           this.state !== CharacterState.DEAD && 
           this.state !== CharacterState.STUNNED;
  }

  public getSkill(skillId: string): CharacterSkill | null {
    return this.skillComponent.getSkill(skillId);
  }

  /**
   * Выполнение способности - должно быть реализовано в наследниках
   */
  protected abstract executeSkill(skill: CharacterSkill, target?: Position | unknown): boolean;

  /**
   * Применение улучшения способности
   */
  protected abstract applySkillUpgrade(skill: CharacterSkill): void;

  // ========== МЕТОДЫ СОСТОЯНИЯ ==========
  public setState(newState: CharacterState, reason?: string): void {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;
    
    // Принудительно устанавливаем состояние в MovementComponent
    this.movementComponent.forceState(newState);
    
    // Уведомляем о смене состояния
    this.scene.events.emit('characterStateChanged', {
      characterId: this.characterId,
      oldState,
      newState,
      reason
    });
    
    this.onStateChanged(oldState, newState);
  }

  /**
   * Обработка смены состояния - может быть переопределена в наследниках
   */
  protected onStateChanged(_oldState: CharacterState, _newState: CharacterState): void {
    // Базовая реализация
  }

  /**
   * Смерть персонажа
   */
  protected die(): void {
    this.setState(CharacterState.DEAD, 'health_depleted');
    this.movementComponent.stop();
    this.onDeath();
  }

  /**
   * Обработка смерти - должна быть реализована в наследниках
   */
  protected abstract onDeath(): void;

  // ========== ОПЫТ И УРОВНИ ==========
  public gainExperience(amount: number): void {
    if (this.healthComponent.isDead()) {
      return;
    }

    const actualExp = Math.floor(amount * this.modifiers.experienceMultiplier);
    const oldLevel = this.stats.level;
    
    this.stats.experience += actualExp;
    
    // Проверка повышения уровня
    const newLevel = this.calculateLevelFromExperience(this.stats.experience);
    if (newLevel > oldLevel) {
      this.levelUp(newLevel);
    }
  }

  /**
   * Расчет уровня по опыту
   */
  protected calculateLevelFromExperience(exp: number): number {
    return Math.floor(Math.sqrt(exp / 100)) + 1;
  }

  /**
   * Повышение уровня
   */
  protected levelUp(newLevel: number): void {
    const oldLevel = this.stats.level;
    this.stats.level = newLevel;
    
    // Улучшение характеристик
    const healthIncrease = Math.floor(this.stats.maxHealth * 0.1);
    this.stats.maxHealth += healthIncrease;
    this.healthComponent.increaseMaxHealth(healthIncrease, true);
    
    this.stats.damage = Math.floor(this.stats.damage * 1.05);
    this.stats.defense = Math.floor(this.stats.defense * 1.03);
    
    // Разблокировка способностей
    const unlockedSkills = this.skillComponent.checkSkillUnlocks(
      newLevel, 
      (skillId) => this.getSkillUnlockLevel(skillId)
    );
    
    console.log(`${this.characterId} leveled up! ${oldLevel} -> ${newLevel}, unlocked: ${unlockedSkills.join(', ')}`);
  }

  /**
   * Получение уровня разблокировки способности
   */
  protected abstract getSkillUnlockLevel(skillId: string): number;

  // ========== ГЕТТЕРЫ ==========
  public getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  public getPosition(): Position {
    return this.movementComponent.getPosition();
  }

  public setPosition(x: number, y: number): void {
    this.movementComponent.teleport(x, y);
  }

  public getCharacterId(): string {
    return this.characterId;
  }

  public getCharacterType(): CharacterType {
    return this.characterType;
  }

  public getState(): CharacterState {
    return this.state;
  }

  public getStats(): Readonly<CharacterStats> {
    return { 
      ...this.stats,
      health: this.healthComponent.getCurrentHealth(),
      maxHealth: this.healthComponent.getMaxHealth()
    };
  }

  public isAlive(): boolean {
    return this.healthComponent.isAlive();
  }

  public isDead(): boolean {
    return this.healthComponent.isDead();
  }

  // ========== МЕТОДЫ ДВИЖЕНИЯ ==========
  public moveToPosition(x: number, y: number): void {
    this.movementComponent.moveToPosition(x, y);
  }

  public stop(): void {
    this.movementComponent.stop();
  }

  // ========== ОЧИСТКА РЕСУРСОВ ==========
  public destroy(): void {
    // Очищаем компоненты
    this.healthComponent.destroy();
    this.skillComponent.destroy();
    this.movementComponent.destroy();
    
    // Уничтожаем спрайт
    if (this.sprite) {
      this.sprite.destroy(true);
    }
  }
}