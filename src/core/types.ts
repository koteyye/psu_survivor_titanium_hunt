/**
 * Единый файл типов для всего проекта PSU Survivor: Titanium Hunt
 * Убираем дублирование и добавляем строгую типизацию
 */

// ========== БАЗОВЫЕ ГЕОМЕТРИЧЕСКИЕ ТИПЫ ==========

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface VelocityRange {
  x: [number, number];
  y: [number, number];
}

// ========== PHASER КОНФИГУРАЦИЯ (строгая типизация) ==========

export interface PhaserPhysicsConfig {
  default: 'arcade' | 'matter';
  arcade?: Phaser.Types.Physics.Arcade.ArcadeWorldConfig;
  matter?: Phaser.Types.Physics.Matter.MatterWorldConfig;
}

export interface PhaserScaleConfig {
  mode: Phaser.Scale.ScaleModes;
  autoCenter: Phaser.Scale.Center;
  width?: number;
  height?: number;
  parent?: string;
  min?: Size;
  max?: Size;
}

export interface PhaserConfig {
  type: number;
  width: number;
  height: number;
  parent: string;
  backgroundColor: string;
  scene: Phaser.Types.Scenes.SceneType[];
  physics: PhaserPhysicsConfig;
  scale: PhaserScaleConfig;
  dom?: {
    createContainer?: boolean;
  };
  render?: {
    pixelArt?: boolean;
    antialias?: boolean;
  };
}

// ========== ИГРОВАЯ КОНФИГУРАЦИЯ ==========

export interface GameConfig {
  width: number;
  height: number;
  physics: PhaserPhysicsConfig;
  scale: PhaserScaleConfig;
}

export interface GameStats {
  score: number;
  health: number;
  maxHealth: number;
  gameOver: boolean;
  level: number;
}

export interface GameState {
  score: number;
  health: number;
  gameOver: boolean;
  isPaused: boolean;
  levelId: number;
  selectedCharacter: string;
}

// ========== АУДИО ТИПЫ ==========

export type SoundKeys = 
  | 'explosionSound'
  | 'gameplay/replicas/friender_s/bad_psu_1'
  | 'gameplay/replicas/friender_s/bad_psu_2'
  | 'gameplay/replicas/friender_s/dead'
  | 'gameplay/replicas/friender_s/select'
  | 'gameplay/replicas/friender_s/super_psu_1'
  | 'gameplay/replicas/friender_s/super_psu_2'
  | 'gameplay/replicas/trader/bad_psu_1'
  | 'gameplay/replicas/trader/bad_psu_2'
  | 'gameplay/replicas/trader/dead'
  | 'gameplay/replicas/trader/select'
  | 'gameplay/replicas/trader/super_psu_1'
  | 'gameplay/replicas/trader/super_psu_2'
  | 'gameplay/replicas/zummer/bad_psu_1'
  | 'gameplay/replicas/zummer/bad_psu_2'
  | 'gameplay/replicas/zummer/dead'
  | 'gameplay/replicas/zummer/select'
  | 'gameplay/replicas/zummer/super_psu_1'
  | 'gameplay/replicas/zummer/super_psu_2';

export type MusicKeys = 
  | 'menuMusic'
  | 'backgroundMusic_level1'
  | 'backgroundMusic_level2'
  | 'backgroundMusic_level3';

export interface AudioConfig {
  volume: number;
  defaultEnabled: boolean;
}

// ========== ПЕРСОНАЖИ ==========

export enum CharacterType {
  FRIENDER = 'friender',
  TRADER = 'trader',
  ZUMMER = 'zummer',
  PLAYER = 'player',
  ENEMY = 'enemy'
}

export enum CharacterState {
  IDLE = 'idle',
  MOVING = 'moving',
  ATTACKING = 'attacking',
  STUNNED = 'stunned',
  DEAD = 'dead',
  INTERACTING = 'interacting'
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  defense: number;
  experience: number;
  level: number;
}

export interface CharacterModifiers {
  healthMultiplier: number;
  speedMultiplier: number;
  damageMultiplier: number;
  defenseMultiplier: number;
  experienceMultiplier: number;
}

export enum SkillType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  ULTIMATE = 'ultimate'
}

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

export interface CharacterAnimations {
  idle: string;
  walk: string;
  attack?: string;
  death?: string;
  interact?: string;
  special?: string;
}

export interface CharacterSounds {
  voice?: SoundKeys[];
  footsteps?: SoundKeys;
  attack?: SoundKeys;
  hurt?: SoundKeys;
  death?: SoundKeys;
  interact?: SoundKeys;
}

export interface GameCharacterConfig {
  id: string;
  name: string;
  type: CharacterType;
  spriteKey: string;
  baseStats: CharacterStats;
  animations: CharacterAnimations;
  sounds?: CharacterSounds;
  skills: CharacterSkill[];
  description?: string;
  portrait?: string;
  scale?: number;
  colliderRadius?: number;
}

export interface CharacterUIInfo {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  experience: number;
  portrait?: string;
  skills: CharacterSkill[];
}

export interface CharacterFactoryParams {
  scene: Phaser.Scene;
  x: number;
  y: number;
  characterId: string;
  config?: Partial<GameCharacterConfig>;
}

// ========== СОБЫТИЯ ==========

export enum CharacterEvents {
  HEALTH_CHANGED = 'character_health_changed',
  LEVEL_UP = 'character_level_up',
  SKILL_UNLOCKED = 'character_skill_unlocked',
  SKILL_USED = 'character_skill_used',
  STATE_CHANGED = 'character_state_changed',
  DIED = 'character_died',
  EXPERIENCE_GAINED = 'character_experience_gained'
}

export interface HealthChangedEventData {
  characterId: string;
  oldHealth: number;
  newHealth: number;
  maxHealth: number;
  damage?: number;
  heal?: number;
}

export interface LevelUpEventData {
  characterId: string;
  oldLevel: number;
  newLevel: number;
  unlockedSkills: string[];
}

export interface SkillUsedEventData {
  characterId: string;
  skillId: string;
  position?: Position;
  target?: string | Position;
  success: boolean;
}

export interface StateChangedEventData {
  characterId: string;
  oldState: CharacterState;
  newState: CharacterState;
  reason?: string;
}

export interface GameEvents {
  GAME_OVER: { reason: string };
  LEVEL_COMPLETED: { levelId: number; score: number };
  SCENE_CLEANUP: { sceneKey: string };
  UI_UPDATE: { score?: number; health?: number; [key: string]: any };
  PLAYER_MOVE: Position;
  ITEM_COLLECTED: { itemType: string; points: number };
  CHARACTER_HEALTH_CHANGED: HealthChangedEventData;
  CHARACTER_LEVEL_UP: LevelUpEventData;
  CHARACTER_SKILL_USED: SkillUsedEventData;
  CHARACTER_STATE_CHANGED: StateChangedEventData;
}

// ========== УРОВНИ ==========

export interface LevelObjective {
  type: 'score' | 'survive' | 'collect';
  target: number;
  description: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  background: string;
  music: MusicKeys;
  duration: number;
  spawnRate: {
    good: number;
    bad: number;
    veryGood: number;
  };
  objectives: LevelObjective[];
  unlocked?: boolean;
  targetScore?: number;
  timeLimit?: number;
  backgroundPath?: string;
  musicPath?: string;
}

// ========== ПРЕДМЕТЫ ==========

export interface ItemConfig {
  points?: number;
  damage?: number;
  healthBonus?: number;
  spawnChance: number;
  displaySize: Size;
  collisionSize: Size;
  velocityRange: VelocityRange;
  angularVelocityRange: [number, number];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

// ========== СЦЕНЫ ==========

export interface SceneTransitionData {
  previousScene?: string;
  data?: Record<string, any>;
}

// ========== ИНТЕРФЕЙСЫ ==========

export interface IInteractable {
  canInteract(character: unknown): boolean;
  interact(character: unknown): Promise<void>;
  getInteractionPrompt(): string;
}

export interface ICombatable {
  takeDamage(damage: number, source?: unknown): number;
  heal(amount: number): number;
  attack(target: unknown): boolean;
  canAttack(target: unknown): boolean;
}

export interface ISkillUser {
  useSkill(skillId: string, target?: Position | unknown): boolean;
  upgradeSkill(skillId: string): boolean;
  canUseSkill(skillId: string): boolean;
  getSkill(skillId: string): CharacterSkill | null;
}

// ========== МЕНЕДЖЕРЫ ==========

export interface IManager {
  destroy(): void;
  isInitialized?(): boolean;
}

export interface IConfigManager extends IManager {
  init(): Promise<void> | void;
  loadFromCache(scene: Phaser.Scene, key: string, cacheKey: string): unknown;
  setConfig(key: string, config: unknown): void;
  getConfig(key: string): unknown;
  getValue(key: string, path: string, defaultValue?: unknown): unknown;
  areConfigsLoaded(): boolean;
  setConfigsLoaded(loaded: boolean): void;
}

export interface IAudioManager extends IManager {
  init(scene: Phaser.Scene): void;
  addSound(key: string, audioKey: string, config?: Phaser.Types.Sound.SoundConfig): void;
  addMusic(key: string, audioKey: string, config?: Phaser.Types.Sound.SoundConfig): void;
  playSound(key: SoundKeys | string): void;
  playMusic(key: MusicKeys | string): void;
  stopMusic(): void;
  setMusicEnabled(enabled: boolean): void;
  setSoundEnabled(enabled: boolean): void;
}

export interface IEventManager extends IManager {
  getInstance(): IEventManager;
  on<K extends keyof GameEvents>(eventName: K, callback: (data: GameEvents[K]) => void, context?: unknown): unknown;
  off<K extends keyof GameEvents>(eventName: K, callback?: (data: GameEvents[K]) => void): void;
  emit<K extends keyof GameEvents>(eventName: K, data: GameEvents[K]): void;
}

export interface IObjectPoolManager extends IManager {
  createPool(key: string, scene: Phaser.Scene, texture: string, setupCallback?: Function, size?: number): void;
  getFromPool(key: string): Phaser.GameObjects.GameObject | null;
  returnToPool(key: string, object: Phaser.GameObjects.GameObject): void;
  destroyPool(key: string): void;
  destroyAllPools(): void;
}

export interface ICharacter extends ICombatable, ISkillUser {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  stats: CharacterStats;
  skills: CharacterSkill[];
  
  // Методы
  collectGoodItem(item: unknown): void;
  collectVeryGoodItem(item: unknown): void;
  hitBadItem(item: unknown): void;
  update(time: number): void;
  destroy(): void;
}

// ========== УТИЛИТЫ ==========

export type EventCallback<T = unknown> = (data?: T) => void;

// ========== КОНСТАНТЫ ==========

export const GAME_CONSTANTS = {
  PHYSICS: {
    GRAVITY_Y: 350,
    DEBUG: false
  },
  SCALE: {
    MODE: Phaser.Scale.FIT,
    AUTO_CENTER: Phaser.Scale.CENTER_BOTH
  },
  AUDIO: {
    DEFAULT_VOLUME: 0.7,
    MUSIC_VOLUME: 0.5
  }
} as const;