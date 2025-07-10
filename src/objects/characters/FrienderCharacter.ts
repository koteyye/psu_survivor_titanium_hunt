import { BaseCharacter } from './BaseCharacter';
import { GameCharacterConfig, CharacterSkill, Point } from '../../types';

/**
 * Персонаж Friender - специализируется на комбо-системе
 */
export class FrienderCharacter extends BaseCharacter {
  // Специфичные для Friender свойства
  private comboCount: number = 0;
  private comboTimeout?: any; // Phaser.Time.TimerEvent
  private readonly MAX_COMBO = 5;
  private readonly COMBO_DURATION = 3000; // 3 секунды

  constructor(scene: Phaser.Scene, x: number, y: number, config: GameCharacterConfig) {
    super(scene, x, y, config);
  }

  protected initializeCharacter(): void {
    console.log(`Friender character ${this.characterId} initialized`);
    // Специфичная инициализация для Friender
  }

  protected customUpdate(_time: number, _delta: number): void {
    // Обновление комбо-визуалов
    this.updateComboVisuals();
  }

  protected executeSkill(skill: CharacterSkill, _target?: Point | any): boolean {
    // Базовая реализация способностей
    console.log(`Friender uses skill: ${skill.name}`);
    return true;
  }

  protected applySkillUpgrade(skill: CharacterSkill): void {
    // Улучшение способности
    if (skill.damage) {
      skill.damage = Math.floor(skill.damage * 1.1);
    }
  }

  protected getSkillUnlockLevel(skillId: string): number {
    // Уровни разблокировки способностей
    switch (skillId) {
      case 'combo_master': return 1;
      case 'speed_boost': return 3;
      case 'friend_call': return 5;
      default: return 1;
    }
  }

  protected onDeath(): void {
    console.log('Friender has died');
    this.resetCombo();
  }

  public attack(_target: any): boolean {
    // Реализация атаки
    console.log('Friender attacks!');
    return true;
  }

  public canAttack(_target: any): boolean {
    return this.isAlive() && !this.isInvulnerable;
  }

  // Комбо-система
  public incrementCombo(): void {
    this.comboCount = Math.min(this.MAX_COMBO, this.comboCount + 1);
    
    // Сбрасываем таймер комбо
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
    }
    
    this.comboTimeout = this.scene.time.delayedCall(this.COMBO_DURATION, () => {
      this.resetCombo();
    });
    
    // Уведомляем о комбо
    this.eventManager.emit('UI_UPDATE', {
      combo: this.comboCount,
      multiplier: this.getComboMultiplier()
    });
  }

  public resetCombo(): void {
    this.comboCount = 0;
    
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
      this.comboTimeout = undefined;
    }
    
    this.eventManager.emit('UI_UPDATE', {
      combo: 0,
      multiplier: 1
    });
  }

  private getComboMultiplier(): number {
    return 1 + (this.comboCount * 0.2);
  }

  private updateComboVisuals(): void {
    if (this.comboCount > 0) {
      // Эффект свечения при комбо
      const color = 0xffffff - (this.comboCount * 30);
      this.sprite.setTint(color);
      
      // Убираем тинт через время
      this.scene.time.delayedCall(100, () => {
        if (!this.isDead()) {
          this.sprite.clearTint();
        }
      });
    }
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getComboTimeLeft(): number {
    return this.comboTimeout ? this.comboTimeout.getRemaining() : 0;
  }

  public destroy(): void {
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
    }
    super.destroy();
  }
}
