import { EventManager } from '../managers';

// Temporary types until we create proper type files
interface CharacterStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  defense: number;
  level: number;
  experience: number;
}

interface HealthChangedEventData {
  characterId: string;
  oldHealth: number;
  newHealth: number;
  maxHealth: number;
  damage?: number;
  heal?: number;
}

/**
 * Компонент для управления здоровьем персонажа
 * Отвечает за получение урона, лечение, смерть
 */
export class HealthComponent {
  private currentHealth: number;
  private maxHealth: number;
  private isInvulnerable: boolean = false;
  private invulnerabilityDuration: number = 500; // мс
  private eventManager: EventManager;
  private characterId: string;
  private scene: Phaser.Scene;

  constructor(
    characterId: string,
    stats: CharacterStats,
    scene: Phaser.Scene
  ) {
    this.characterId = characterId;
    this.currentHealth = stats.health;
    this.maxHealth = stats.maxHealth;
    this.scene = scene;
    this.eventManager = EventManager.getInstance();
  }

  /**
   * Получение урона
   */
  public takeDamage(damage: number, defense: number = 0, source?: unknown): number {
    if (this.isInvulnerable || this.isDead()) {
      return 0;
    }

    const actualDamage = Math.max(1, Math.floor(damage - defense));
    const oldHealth = this.currentHealth;
    
    this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
    
    this.emitHealthChangedEvent(oldHealth, actualDamage, undefined);
    
    if (this.isDead()) {
      this.emitDeathEvent();
    } else {
      this.makeInvulnerable();
    }
    
    return actualDamage;
  }

  /**
   * Лечение
   */
  public heal(amount: number): number {
    if (this.isDead()) {
      return 0;
    }

    const oldHealth = this.currentHealth;
    const actualHeal = Math.min(amount, this.maxHealth - this.currentHealth);
    
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + actualHeal);
    
    this.emitHealthChangedEvent(oldHealth, undefined, actualHeal);
    
    return actualHeal;
  }

  /**
   * Временная неуязвимость
   */
  private makeInvulnerable(): void {
    this.isInvulnerable = true;
    
    this.scene.time.delayedCall(this.invulnerabilityDuration, () => {
      this.isInvulnerable = false;
    });
  }

  /**
   * Увеличение максимального здоровья (при левел апе)
   */
  public increaseMaxHealth(amount: number, healToo: boolean = false): void {
    const oldHealth = this.currentHealth;
    this.maxHealth += amount;
    
    if (healToo) {
      this.currentHealth += amount;
      this.emitHealthChangedEvent(oldHealth, undefined, amount);
    }
  }

  /**
   * Установка максимального здоровья с учетом модификаторов
   */
  public updateMaxHealth(baseMaxHealth: number, healthMultiplier: number): void {
    const oldMaxHealth = this.maxHealth;
    this.maxHealth = Math.floor(baseMaxHealth * healthMultiplier);
    
    // Если максимальное здоровье уменьшилось, корректируем текущее
    if (this.currentHealth > this.maxHealth) {
      const oldHealth = this.currentHealth;
      this.currentHealth = this.maxHealth;
      this.emitHealthChangedEvent(oldHealth, oldHealth - this.currentHealth, undefined);
    }
  }

  /**
   * Проверки состояния
   */
  public isAlive(): boolean {
    return this.currentHealth > 0;
  }

  public isDead(): boolean {
    return this.currentHealth <= 0;
  }

  public isInvulnerabilityActive(): boolean {
    return this.isInvulnerable;
  }

  /**
   * Геттеры
   */
  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public getHealthPercentage(): number {
    return this.maxHealth > 0 ? (this.currentHealth / this.maxHealth) * 100 : 0;
  }

  /**
   * Полное восстановление здоровья
   */
  public fullHeal(): void {
    const oldHealth = this.currentHealth;
    const healAmount = this.maxHealth - this.currentHealth;
    this.currentHealth = this.maxHealth;
    
    if (healAmount > 0) {
      this.emitHealthChangedEvent(oldHealth, undefined, healAmount);
    }
  }

  /**
   * События
   */
  private emitHealthChangedEvent(oldHealth: number, damage?: number, heal?: number): void {
    const eventData: HealthChangedEventData = {
      characterId: this.characterId,
      oldHealth,
      newHealth: this.currentHealth,
      maxHealth: this.maxHealth,
      damage,
      heal
    };
    
    this.eventManager.emit('UI_UPDATE', {
      health: this.currentHealth
    });
  }

  private emitDeathEvent(): void {
    this.scene.events.emit('characterDied', { characterId: this.characterId });
  }

  /**
   * Настройка продолжительности неуязвимости
   */
  public setInvulnerabilityDuration(duration: number): void {
    this.invulnerabilityDuration = duration;
  }

  /**
   * Принудительная установка здоровья (для дебага/читов)
   */
  public setHealth(health: number): void {
    const oldHealth = this.currentHealth;
    this.currentHealth = Math.max(0, Math.min(this.maxHealth, health));
    
    if (oldHealth !== this.currentHealth) {
      this.emitHealthChangedEvent(oldHealth, 
        this.currentHealth < oldHealth ? oldHealth - this.currentHealth : undefined,
        this.currentHealth > oldHealth ? this.currentHealth - oldHealth : undefined
      );
    }
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    // Очищаем таймеры неуязвимости если они активны
    if (this.scene && this.scene.time) {
      this.scene.time.removeAllEvents();
    }
  }
}