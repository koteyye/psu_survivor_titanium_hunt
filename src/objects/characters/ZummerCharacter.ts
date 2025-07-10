import { BaseCharacter } from './BaseCharacter';
import { GameCharacterConfig, CharacterSkill, Point } from '../../types';

/**
 * Персонаж Zummer - специализируется на ярости и агрессивном стиле игры
 */
export class ZummerCharacter extends BaseCharacter {
  // Специфичные для Zummer свойства
  private rage: number = 0;
  private maxRage: number = 100;
  private rageMode: boolean = false;
  private rageTimer: number = 0;
  private readonly RAGE_MODE_DURATION = 5000; // 5 секунд
  private readonly RAGE_SPEED_MULTIPLIER = 1.5;

  constructor(scene: Phaser.Scene, x: number, y: number, config: GameCharacterConfig) {
    super(scene, x, y, config);
  }

  protected initializeCharacter(): void {
    console.log(`Zummer character ${this.characterId} initialized`);
    this.setupRageSystem();
  }

  protected customUpdate(time: number, delta: number): void {
    // Обновляем таймер режима ярости
    if (this.rageMode && this.rageTimer > 0) {
      this.rageTimer -= delta;
      
      if (this.rageTimer <= 0) {
        this.deactivateRageMode();
      }
    }
    
    // Постепенно уменьшаем ярость если не в режиме ярости
    if (!this.rageMode && this.rage > 0) {
      this.rage = Math.max(0, this.rage - (delta * 0.01));
      this.updateRageUI();
    }
    
    // Обновляем визуальные эффекты движения
    this.updateMovementEffects();
  }

  protected executeSkill(skill: CharacterSkill, target?: Point | any): boolean {
    console.log(`Zummer uses skill: ${skill.name}`);
    
    switch (skill.id) {
      case 'berserker_rage':
        return this.useBerserkerRage();
      case 'rage_strike':
        return this.useRageStrike(target);
      case 'unstoppable':
        return this.useUnstoppable();
      default:
        return true;
    }
  }

  protected applySkillUpgrade(skill: CharacterSkill): void {
    // Улучшение способности
    switch (skill.id) {
      case 'berserker_rage':
        // Увеличиваем время действия ярости
        if (skill.duration) {
          skill.duration = Math.floor(skill.duration * 1.1);
        }
        break;
      case 'rage_strike':
        // Увеличиваем урон удара ярости
        if (skill.damage) {
          skill.damage = Math.floor(skill.damage * 1.2);
        }
        break;
    }
  }

  protected getSkillUnlockLevel(skillId: string): number {
    switch (skillId) {
      case 'berserker_rage': return 1;
      case 'rage_strike': return 3;
      case 'unstoppable': return 5;
      default: return 1;
    }
  }

  protected onDeath(): void {
    console.log('Zummer has died in rage');
    if (this.rageMode) {
      this.deactivateRageMode();
    }
  }

  public attack(_target: any): boolean {
    console.log('Zummer attacks with fury!');
    
    const damage = this.getCurrentDamage();
    const rageBonus = this.rageMode ? 2 : 1;
    const totalDamage = damage * rageBonus;
    
    console.log(`Zummer deals ${totalDamage} damage (rage bonus: ${rageBonus}x)`);
    
    // Добавляем ярость при атаке
    this.addRage(5);
    
    return true;
  }

  public canAttack(_target: any): boolean {
    return this.isAlive() && !this.isInvulnerable;
  }

  // Система ярости
  private setupRageSystem(): void {
    this.updateRageUI();
  }

  public addRage(amount: number): void {
    this.rage = Math.min(this.maxRage, this.rage + amount);
    
    if (this.rage >= this.maxRage && !this.rageMode) {
      this.activateRageMode();
    }
    
    this.updateRageUI();
  }

  private activateRageMode(): void {
    this.rageMode = true;
    this.rageTimer = this.RAGE_MODE_DURATION;
    
    // Визуальные эффекты
    this.sprite.setTint(0xff0000);
    
    // Увеличиваем скорость
    this.modifiers.speedMultiplier *= this.RAGE_SPEED_MULTIPLIER;
    this.modifiers.damageMultiplier *= 2;
    
    this.eventManager.emit('UI_UPDATE', { rage_mode: true });
    
    console.log('Zummer rage mode activated!');
  }

  private deactivateRageMode(): void {
    this.rageMode = false;
    this.rage = 0;
    this.rageTimer = 0;
    
    // Убираем визуальные эффекты
    this.sprite.clearTint();
    
    // Восстанавливаем характеристики
    this.modifiers.speedMultiplier /= this.RAGE_SPEED_MULTIPLIER;
    this.modifiers.damageMultiplier /= 2;
    
    this.updateRageUI();
    this.eventManager.emit('UI_UPDATE', { rage_mode: false });
    
    console.log('Zummer rage mode deactivated');
  }

  private updateRageUI(): void {
    this.eventManager.emit('UI_UPDATE', {
      rage: this.rage,
      maxRage: this.maxRage,
      rageMode: this.rageMode,
      rageTimer: this.rageTimer
    });
  }

  private updateMovementEffects(): void {
    // Дополнительные эффекты движения в режиме ярости
    if (this.rageMode) {
      this.createRageTrail();
    }
  }

  private createRageTrail(): void {
    // Простой эффект следа
    const trail = this.scene.add.circle(this.sprite.x, this.sprite.y, 10, 0xff0000, 0.3);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }

  // Способности
  private useBerserkerRage(): boolean {
    if (this.rageMode) {
      return false; // Уже в режиме ярости
    }
    
    this.rage = this.maxRage;
    this.activateRageMode();
    return true;
  }

  private useRageStrike(_target?: any): boolean {
    if (!this.rageMode) {
      return false; // Работает только в режиме ярости
    }
    
    console.log('Zummer uses Rage Strike!');
    
    // Мощная атака с большим уроном
    const damage = this.getCurrentDamage() * 3;
    console.log(`Rage Strike deals ${damage} damage!`);
    
    // Тратим немного ярости
    this.rage = Math.max(0, this.rage - 20);
    this.updateRageUI();
    
    return true;
  }

  private useUnstoppable(): boolean {
    console.log('Zummer becomes Unstoppable!');
    
    // Временная неуязвимость и увеличение скорости
    this.isInvulnerable = true;
    this.modifiers.speedMultiplier *= 2;
    
    this.scene.time.delayedCall(2000, () => {
      this.isInvulnerable = false;
      this.modifiers.speedMultiplier /= 2;
      console.log('Unstoppable effect ended');
    });
    
    return true;
  }

  // Переопределяем takeDamage для системы ярости
  public takeDamage(damage: number, source?: any): number {
    const actualDamage = super.takeDamage(damage, source);
    
    if (actualDamage > 0) {
      // Получение урона добавляет ярость
      this.addRage(actualDamage);
    }
    
    return actualDamage;
  }

  // Геттеры
  public getRage(): number {
    return this.rage;
  }

  public getMaxRage(): number {
    return this.maxRage;
  }

  public isInRageMode(): boolean {
    return this.rageMode;
  }

  public getRageTimeLeft(): number {
    return this.rageTimer;
  }

  public forceRageMode(): void {
    this.rage = this.maxRage;
    this.activateRageMode();
  }

  public resetRage(): void {
    if (this.rageMode) {
      this.deactivateRageMode();
    } else {
      this.rage = 0;
      this.updateRageUI();
    }
  }

  public destroy(): void {
    if (this.rageMode) {
      this.deactivateRageMode();
    }
    super.destroy();
  }
}
