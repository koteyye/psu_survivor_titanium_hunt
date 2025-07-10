// Типы для игровых конфигураций
export interface CharacterConfig {
  id: string;
  name: string;
  texture: string;
  stats: CharacterStats;
  skills: CharacterSkills;
  sounds: CharacterSounds;
}

export interface CharacterStats {
  health: number;
  speed: number;
  damage: number;
  defense: number;
}

export interface CharacterSkills {
  [skillName: string]: SkillConfig;
}

export interface SkillConfig {
  name: string;
  description: string;
  cooldown: number;
  damage?: number;
  effect?: string;
}

export interface CharacterSounds {
  hit: string[];
  death: string[];
  special?: string[];
}

export interface LevelConfig {
  id: number;
  name: string;
  background: string;
  music: string;
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

export interface LevelObjective {
  type: 'score' | 'survive' | 'collect';
  target: number;
  description: string;
}

export interface AudioConfig {
  music: {
    [key: string]: string;
  };
  sounds: {
    [key: string]: string;
  };
  volume: {
    music: number;
    sounds: number;
  };
}

export interface CharacterInfo {
  id: string;
  name: string;
  texture: string;
  description: string;
  fullDescription?: string;
  shortDescription?: string;
  category: string;
}

export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost?: number;
}
