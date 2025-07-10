import { 
  GameCharacterConfig, 
  CharacterState, 
  CharacterType, 
  CharacterSkill, 
  CharacterBaseStats,
  CharacterModifiers,
  HealthChangedEventData,
  LevelUpEventData,
  StateChangedEventData,
  SkillUsedEventData,
  ICombatable,
  ISkillUser,
  Point
} from '../../types';
import { EventManager } from '../../managers';

/**
 * Базовый абстрактный класс для всех персонажей игры
 * Использует композицию для работы с Phaser.Sprite
 */
export abstract class BaseCharacter implements ICombatable, ISkillUser {
  protected config: GameCharacterConfig;
  protected stats: CharacterBaseStats;
  protected modifiers: CharacterModifiers;
  protected skills: Map<string, CharacterSkill>;
  protected state: CharacterState;
  protected eventManager: EventManager;
  protected lastSkillUsed: number = 0;
  protected isInvulnerable: boolean = false;
  protected invulnerabilityDuration: number = 500; // мс
  
  // Phaser Sprite и связанные объекты
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
    
    // Инициализация способностей
    this.skills = new Map();
    config.skills.forEach((skill: CharacterSkill) => {
      this.skills.set(skill.id, { ...skill });
    });
    
    this.state = CharacterState.IDLE;
    
    this.setupPhysics();
    this.setupAnimations();
    this.setupAudio();
    
    this.initializeCharacter();
  }

  /**
   * Настройка физики персонажа
   */
  protected setupPhysics(): void {
    if (!this.scene.physics || !this.scene.physics.world) {
      console.warn(`Physics not available for character ${this.characterId}`);
      return;
    }

    this.scene.physics.world.enable(this.sprite);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const radius = this.config.colliderRadius || Math.min(this.sprite.width, this.sprite.height) / 2;
      body.setCircle(radius);
      body.setCollideWorldBounds(true);
    }

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
   * Настройка аудио персонажа
   */
  protected setupAudio(): void {
    // Реализация будет зависеть от конкретного персонажа
  }

  /**
   * Инициализация специфичных для персонажа параметров
   */
  protected abstract initializeCharacter(): void;

  /**
   * Обновление персонажа каждый кадр
   */
  public update(time: number, delta: number): void {
    this.updateSkillCooldowns(delta);
    this.updateModifiers(time, delta);
    this.updateAnimation();
    this.customUpdate(time, delta);
  }

  /**
   * Кастомное обновление для наследников
   */
  protected abstract customUpdate(time: number, delta: number): void;

  /**
   * Обновление кулдаунов способностей
   */
  protected updateSkillCooldowns(delta: number): void {
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - delta);
      }
    });
  }

  /**
   * Обновление модификаторов
   */
  protected updateModifiers(_time: number, _delta: number): void {
    // Сброс временных модификаторов может быть реализован здесь
  }

  /**
   * Обновление анимации в зависимости от состояния
   */
  protected updateAnimation(): void {
    const currentAnim = this.sprite.anims.currentAnim;
    
    switch (this.state) {
      case CharacterState.IDLE:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_idle`) {
          this.sprite.play(`${this.characterId}_idle`);
        }
        break;
      case CharacterState.MOVING:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_walk`) {
          this.sprite.play(`${this.characterId}_walk`);
        }
        break;
      case CharacterState.ATTACKING:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_attack`) {
          this.sprite.play(`${this.characterId}_attack`);
        }
        break;
    }
  }

  // Реализация ICombatable
  public takeDamage(damage: number, _source?: any): number {
    if (this.isInvulnerable || this.state === CharacterState.DEAD) {
      return 0;
    }

    const defense = this.stats.defense * this.modifiers.defenseMultiplier;
    const actualDamage = Math.max(1, Math.floor(damage - defense));
    const oldHealth = this.stats.health;
    
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    
    const eventData: HealthChangedEventData = {
      characterId: this.characterId,
      oldHealth,
      newHealth: this.stats.health,
      maxHealth: this.getMaxHealth(),
      damage: actualDamage
    };
    
    this.eventManager.emit('character_health_changed', eventData);
    
    if (this.stats.health <= 0) {
      this.die();
    } else {
      this.makeInvulnerable();
    }
    
    return actualDamage;
  }

  public heal(amount: number): number {
    if (this.state === CharacterState.DEAD) {
      return 0;
    }

    const oldHealth = this.stats.health;
    const maxHealth = this.getMaxHealth();
    const actualHeal = Math.min(amount, maxHealth - this.stats.health);
    
    this.stats.health = Math.min(maxHealth, this.stats.health + actualHeal);
    
    const eventData: HealthChangedEventData = {
      characterId: this.characterId,
      oldHealth,
      newHealth: this.stats.health,
      maxHealth,
      heal: actualHeal
    };
    
    this.eventManager.emit('character_health_changed', eventData);
    
    return actualHeal;
  }

  public abstract attack(target: any): boolean;
  public abstract canAttack(target: any): boolean;

  // Реализация ISkillUser
  public useSkill(skillId: string, target?: Point | any): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || !this.canUseSkill(skillId)) {
      return false;
    }

    const success = this.executeSkill(skill, target);
    
    if (success) {
      skill.currentCooldown = skill.cooldown;
      this.lastSkillUsed = Date.now();
      
      const eventData: SkillUsedEventData = {
        characterId: this.characterId,
        skillId,
        target: target instanceof Object && 'x' in target && 'y' in target ? target as Point : undefined,
        success
      };
      
      this.eventManager.emit('character_skill_used', eventData);
    }
    
    return success;
  }

  public upgradeSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || skill.level >= skill.maxLevel) {
      return false;
    }
    
    skill.level++;
    // Улучшение характеристик способности
    this.applySkillUpgrade(skill);
    
    return true;
  }

  public canUseSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || !skill.unlocked || skill.currentCooldown > 0) {
      return false;
    }
    
    return this.state !== CharacterState.DEAD && this.state !== CharacterState.STUNNED;
  }

  public getSkill(skillId: string): CharacterSkill | null {
    return this.skills.get(skillId) || null;
  }

  /**
   * Выполнение способности - должно быть реализовано в наследниках
   */
  protected abstract executeSkill(skill: CharacterSkill, target?: Point | any): boolean;

  /**
   * Применение улучшения способности
   */
  protected abstract applySkillUpgrade(skill: CharacterSkill): void;

  /**
   * Смена состояния персонажа
   */
  public setState(newState: CharacterState, reason?: string): void {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    this.state = newState;
    
    const eventData: StateChangedEventData = {
      characterId: this.characterId,
      oldState,
      newState,
      reason
    };
    
    this.eventManager.emit('character_state_changed', eventData);
    
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
    this.eventManager.emit('character_died', { characterId: this.characterId });
    
    // Отключение физики
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }
    
    this.onDeath();
  }

  /**
   * Обработка смерти - может быть переопределена в наследниках
   */
  protected abstract onDeath(): void;

  /**
   * Временная неуязвимость
   */
  protected makeInvulnerable(): void {
    this.isInvulnerable = true;
    this.sprite.setAlpha(0.5);
    
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
      this.sprite.setAlpha(1);
    });
  }

  /**
   * Получение максимального здоровья с учетом модификаторов
   */
  public getMaxHealth(): number {
    return Math.floor(this.stats.maxHealth * this.modifiers.healthMultiplier);
  }

  /**
   * Получение текущей скорости с учетом модификаторов
   */
  public getCurrentSpeed(): number {
    return Math.floor(this.stats.speed * this.modifiers.speedMultiplier);
  }

  /**
   * Получение текущего урона с учетом модификаторов
   */
  public getCurrentDamage(): number {
    return Math.floor(this.stats.damage * this.modifiers.damageMultiplier);
  }

  // Методы доступа к спрайту
  public getSprite(): Phaser.GameObjects.Sprite {
    return this.sprite;
  }

  public getPosition(): Point {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public setPosition(x: number, y: number): void {
    this.sprite.setPosition(x, y);
  }

  public getX(): number {
    return this.sprite.x;
  }

  public getY(): number {
    return this.sprite.y;
  }

  public setX(x: number): void {
    this.sprite.x = x;
  }

  public setY(y: number): void {
    this.sprite.y = y;
  }

  // Геттеры
  public getCharacterId(): string {
    return this.characterId;
  }

  public getCharacterType(): CharacterType {
    return this.characterType;
  }

  public getState(): CharacterState {
    return this.state;
  }

  public getStats(): Readonly<CharacterBaseStats> {
    return { ...this.stats };
  }

  public getModifiers(): Readonly<CharacterModifiers> {
    return { ...this.modifiers };
  }

  public getSkills(): ReadonlyMap<string, CharacterSkill> {
    return new Map(this.skills);
  }

  public getConfig(): Readonly<GameCharacterConfig> {
    return { ...this.config };
  }

  public isAlive(): boolean {
    return this.state !== CharacterState.DEAD;
  }

  public isDead(): boolean {
    return this.state === CharacterState.DEAD;
  }

  /**
   * Получение опыта
   */
  public gainExperience(amount: number): void {
    if (this.isDead()) {
      return;
    }

    const actualExp = Math.floor(amount * this.modifiers.experienceMultiplier);
    const oldLevel = this.stats.level;
    const oldExp = this.stats.experience;
    
    this.stats.experience += actualExp;
    
    // Проверка повышения уровня
    const newLevel = this.calculateLevelFromExperience(this.stats.experience);
    if (newLevel > oldLevel) {
      this.levelUp(newLevel);
    }
    
    this.eventManager.emit('character_experience_gained', {
      characterId: this.characterId,
      oldExperience: oldExp,
      newExperience: this.stats.experience,
      gained: actualExp
    });
  }

  /**
   * Расчет уровня по опыту
   */
  protected calculateLevelFromExperience(exp: number): number {
    // Простая формула: каждый уровень требует level * 100 опыта
    return Math.floor(Math.sqrt(exp / 100)) + 1;
  }

  /**
   * Повышение уровня
   */
  protected levelUp(newLevel: number): void {
    const oldLevel = this.stats.level;
    this.stats.level = newLevel;
    
    // Улучшение характеристик при повышении уровня
    const healthIncrease = Math.floor(this.stats.maxHealth * 0.1);
    this.stats.maxHealth += healthIncrease;
    this.stats.health += healthIncrease; // Также восстанавливаем здоровье
    
    this.stats.damage = Math.floor(this.stats.damage * 1.05);
    this.stats.defense = Math.floor(this.stats.defense * 1.03);
    
    // Разблокировка способностей
    const unlockedSkills: string[] = [];
    this.skills.forEach((skill, skillId) => {
      if (!skill.unlocked && newLevel >= this.getSkillUnlockLevel(skillId)) {
        skill.unlocked = true;
        unlockedSkills.push(skillId);
        this.eventManager.emit('character_skill_unlocked', {
          characterId: this.characterId,
          skillId,
          level: newLevel
        });
      }
    });
    
    const eventData: LevelUpEventData = {
      characterId: this.characterId,
      oldLevel,
      newLevel,
      unlockedSkills
    };
    
    this.eventManager.emit('character_level_up', eventData);
  }

  /**
   * Получение уровня разблокировки способности
   */
  protected abstract getSkillUnlockLevel(skillId: string): number;

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // Очистка таймеров
    this.scene.time.removeAllEvents();
    
    // Уничтожение спрайта
    if (this.sprite) {
      this.sprite.destroy(true);
    }
  }
}
