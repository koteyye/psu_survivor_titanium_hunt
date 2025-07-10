import { Point } from './common';

/**
 * Основные статы персонажа
 */
export interface CharacterBaseStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  defense: number;
  experience: number;
  level: number;
}

/**
 * Модификаторы характеристик
 */
export interface CharacterModifiers {
  healthMultiplier: number;
  speedMultiplier: number;
  damageMultiplier: number;
  defenseMultiplier: number;
  experienceMultiplier: number;
}

/**
 * Состояние персонажа
 */
export enum CharacterState {
  IDLE = 'idle',
  MOVING = 'moving',
  ATTACKING = 'attacking',
  STUNNED = 'stunned',
  DEAD = 'dead',
  INTERACTING = 'interacting'
}

/**
 * Тип персонажа
 */
export enum CharacterType {
  FRIENDER = 'friender',
  TRADER = 'trader',
  ZUMMER = 'zummer',
  PLAYER = 'player',
  ENEMY = 'enemy'
}

/**
 * Тип способности
 */
export enum SkillType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  ULTIMATE = 'ultimate'
}

/**
 * Способность персонажа
 */
export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  cooldown: number;
  currentCooldown: number;
  level: number;
  maxLevel: number;
  damage?: number;
  duration?: number;
  range?: number;
  cost?: number;
  unlocked: boolean;
}

/**
 * Анимации персонажа
 */
export interface CharacterAnimations {
  idle: string;
  walk: string;
  attack?: string;
  death?: string;
  interact?: string;
  special?: string;
}

/**
 * Звуки персонажа
 */
export interface CharacterSounds {
  voice?: string[];
  footsteps?: string;
  attack?: string;
  hurt?: string;
  death?: string;
  interact?: string;
}

/**
 * Конфигурация персонажа для игры
 */
export interface GameCharacterConfig {
  id: string;
  name: string;
  type: CharacterType;
  spriteKey: string;
  baseStats: CharacterBaseStats;
  animations: CharacterAnimations;
  sounds?: CharacterSounds;
  skills: CharacterSkill[];
  description?: string;
  portrait?: string;
  scale?: number;
  colliderRadius?: number;
}

/**
 * Информация о персонаже для UI
 */
export interface CharacterUIInfo {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  portrait?: string;
  skills: CharacterSkill[];
}

/**
 * События персонажа
 */
export enum CharacterEvents {
  HEALTH_CHANGED = 'character_health_changed',
  LEVEL_UP = 'character_level_up',
  SKILL_UNLOCKED = 'character_skill_unlocked',
  SKILL_USED = 'character_skill_used',
  STATE_CHANGED = 'character_state_changed',
  DIED = 'character_died',
  EXPERIENCE_GAINED = 'character_experience_gained'
}

/**
 * Данные события изменения здоровья
 */
export interface HealthChangedEventData {
  characterId: string;
  oldHealth: number;
  newHealth: number;
  maxHealth: number;
  damage?: number;
  heal?: number;
}

/**
 * Данные события повышения уровня
 */
export interface LevelUpEventData {
  characterId: string;
  oldLevel: number;
  newLevel: number;
  unlockedSkills: string[];
}

/**
 * Данные события использования способности
 */
export interface SkillUsedEventData {
  characterId: string;
  skillId: string;
  position?: Point;
  target?: string | Point;
  success: boolean;
}

/**
 * Данные события изменения состояния
 */
export interface StateChangedEventData {
  characterId: string;
  oldState: CharacterState;
  newState: CharacterState;
  reason?: string;
}

/**
 * Фабрика персонажей - параметры создания
 */
export interface CharacterFactoryParams {
  scene: Phaser.Scene;
  x: number;
  y: number;
  characterId: string;
  config?: Partial<GameCharacterConfig>;
}

/**
 * Интерфейс для взаимодействия с персонажем
 */
export interface IInteractable {
  canInteract(character: any): boolean;
  interact(character: any): Promise<void>;
  getInteractionPrompt(): string;
}

/**
 * Интерфейс для боевых действий
 */
export interface ICombatable {
  takeDamage(damage: number, source?: any): number;
  heal(amount: number): number;
  attack(target: any): boolean;
  canAttack(target: any): boolean;
}

/**
 * Интерфейс для способностей
 */
export interface ISkillUser {
  useSkill(skillId: string, target?: Point | any): boolean;
  upgradeSkill(skillId: string): boolean;
  canUseSkill(skillId: string): boolean;
  getSkill(skillId: string): CharacterSkill | null;
}
