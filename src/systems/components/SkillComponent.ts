import { EventManager } from '../managers';

// Temporary types until we create proper type files
interface Position {
  x: number;
  y: number;
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

interface SkillUsedEventData {
  characterId: string;
  skillId: string;
  target?: Position;
  success: boolean;
}

/**
 * Компонент для управления способностями персонажа
 * Отвечает за использование, улучшение и кулдауны скиллов
 */
export class SkillComponent {
  private skills: Map<string, CharacterSkill>;
  private lastSkillUsed: number = 0;
  private eventManager: EventManager;
  private characterId: string;

  constructor(characterId: string, initialSkills: CharacterSkill[]) {
    this.characterId = characterId;
    this.eventManager = EventManager.getInstance();
    
    // Инициализация способностей
    this.skills = new Map();
    initialSkills.forEach((skill: CharacterSkill) => {
      this.skills.set(skill.id, { ...skill });
    });
  }

  /**
   * Использование способности
   */
  public useSkill(
    skillId: string, 
    target?: Position | unknown,
    executeCallback?: (skill: CharacterSkill, target?: Position | unknown) => boolean
  ): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || !this.canUseSkill(skillId)) {
      return false;
    }

    // Выполняем способность через callback
    const success = executeCallback ? executeCallback(skill, target) : true;
    
    if (success) {
      // Устанавливаем кулдаун
      skill.currentCooldown = skill.cooldown;
      this.lastSkillUsed = Date.now();
      
      // Уведомляем о использовании способности
      this.emitSkillUsedEvent(skillId, target, success);
    }
    
    return success;
  }

  /**
   * Проверка возможности использования способности
   */
  public canUseSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || !skill.unlocked || skill.currentCooldown > 0) {
      return false;
    }
    
    return true;
  }

  /**
   * Улучшение способности
   */
  public upgradeSkill(
    skillId: string,
    applyUpgradeCallback?: (skill: CharacterSkill) => void
  ): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || skill.level >= skill.maxLevel) {
      return false;
    }
    
    skill.level++;
    
    // Применяем улучшение через callback
    if (applyUpgradeCallback) {
      applyUpgradeCallback(skill);
    }
    
    return true;
  }

  /**
   * Разблокировка способности
   */
  public unlockSkill(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    
    if (!skill || skill.unlocked) {
      return false;
    }
    
    skill.unlocked = true;
    this.emitSkillUnlockedEvent(skillId);
    return true;
  }

  /**
   * Обновление кулдаунов способностей
   */
  public updateCooldowns(delta: number): void {
    this.skills.forEach(skill => {
      if (skill.currentCooldown > 0) {
        skill.currentCooldown = Math.max(0, skill.currentCooldown - delta);
      }
    });
  }

  /**
   * Получение способности
   */
  public getSkill(skillId: string): CharacterSkill | null {
    return this.skills.get(skillId) || null;
  }

  /**
   * Получение всех способностей
   */
  public getAllSkills(): ReadonlyMap<string, CharacterSkill> {
    return new Map(this.skills);
  }

  /**
   * Получение разблокированных способностей
   */
  public getUnlockedSkills(): CharacterSkill[] {
    return Array.from(this.skills.values()).filter(skill => skill.unlocked);
  }

  /**
   * Получение способностей на кулдауне
   */
  public getSkillsOnCooldown(): CharacterSkill[] {
    return Array.from(this.skills.values()).filter(skill => skill.currentCooldown > 0);
  }

  /**
   * Проверка доступности любой способности
   */
  public hasAvailableSkills(): boolean {
    return Array.from(this.skills.values()).some(skill => 
      skill.unlocked && skill.currentCooldown <= 0
    );
  }

  /**
   * Сброс всех кулдаунов (для дебага/читов)
   */
  public resetAllCooldowns(): void {
    this.skills.forEach(skill => {
      skill.currentCooldown = 0;
    });
  }

  /**
   * Сброс кулдауна конкретной способности
   */
  public resetCooldown(skillId: string): boolean {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.currentCooldown = 0;
      return true;
    }
    return false;
  }

  /**
   * Добавление новой способности
   */
  public addSkill(skill: CharacterSkill): void {
    this.skills.set(skill.id, { ...skill });
  }

  /**
   * Удаление способности
   */
  public removeSkill(skillId: string): boolean {
    return this.skills.delete(skillId);
  }

  /**
   * Получение времени с последнего использования способности
   */
  public getTimeSinceLastSkill(): number {
    return Date.now() - this.lastSkillUsed;
  }

  /**
   * Модификация кулдауна способности
   */
  public modifySkillCooldown(skillId: string, multiplier: number): boolean {
    const skill = this.skills.get(skillId);
    if (skill) {
      skill.cooldown = Math.floor(skill.cooldown * multiplier);
      return true;
    }
    return false;
  }

  /**
   * Модификация урона способности
   */
  public modifySkillDamage(skillId: string, multiplier: number): boolean {
    const skill = this.skills.get(skillId);
    if (skill && skill.damage !== undefined) {
      skill.damage = Math.floor(skill.damage * multiplier);
      return true;
    }
    return false;
  }

  /**
   * Проверка разблокировки способностей по уровню
   */
  public checkSkillUnlocks(
    level: number, 
    getUnlockLevelCallback: (skillId: string) => number
  ): string[] {
    const unlockedSkills: string[] = [];
    
    this.skills.forEach((skill, skillId) => {
      if (!skill.unlocked && level >= getUnlockLevelCallback(skillId)) {
        skill.unlocked = true;
        unlockedSkills.push(skillId);
        this.emitSkillUnlockedEvent(skillId);
      }
    });
    
    return unlockedSkills;
  }

  /**
   * События
   */
  private emitSkillUsedEvent(skillId: string, target?: Position | unknown, success: boolean = true): void {
    // Используем scene events для кастомных событий
    const eventData = {
      characterId: this.characterId,
      skillId,
      target: target instanceof Object && 'x' in target && 'y' in target ? target as Position : undefined,
      success
    };
    
    // Можно добавить логирование или другие действия
    console.log(`Skill used: ${skillId} by ${this.characterId}`);
  }

  private emitSkillUnlockedEvent(skillId: string): void {
    console.log(`Skill unlocked: ${skillId} for ${this.characterId}`);
  }

  /**
   * Получение статистики способностей
   */
  public getSkillStats(): {
    total: number;
    unlocked: number;
    onCooldown: number;
    maxLevel: number;
    averageLevel: number;
  } {
    const skillsArray = Array.from(this.skills.values());
    const unlockedSkills = skillsArray.filter(s => s.unlocked);
    
    return {
      total: skillsArray.length,
      unlocked: unlockedSkills.length,
      onCooldown: skillsArray.filter(s => s.currentCooldown > 0).length,
      maxLevel: Math.max(...skillsArray.map(s => s.maxLevel), 0),
      averageLevel: unlockedSkills.length > 0 
        ? unlockedSkills.reduce((sum, s) => sum + s.level, 0) / unlockedSkills.length 
        : 0
    };
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    this.skills.clear();
  }
}