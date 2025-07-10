// Экспорт всех типов
export * from './common';
export * from './phaser-extensions';
export * from './ui-types';
export * from './manager-types';
export * from './scene-types';
export * from './character-types';

// Переименованные экспорты для избежания конфликтов
export { 
  CharacterConfig, 
  CharacterStats, 
  CharacterSkills, 
  SkillConfig,
  CharacterSounds,
  LevelConfig,
  LevelObjective,
  CharacterInfo,
  CharacterSkill as GameCharacterSkill,  // переименовываем для избежания конфликта
  AudioConfig as GameAudioConfig  // переименовываем для избежания конфликта
} from './game-config';
