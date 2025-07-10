// Типы для сцен
export interface IGameLevel {
  levelId: number;
  selectedCharacter: string;
  levelConfig: any;
  levelStartTime: number;
  levelCompleted: boolean;
  isPaused: boolean;
  
  init(data: any): void;
  preload(): void;
  create(): void;
  update(time: number): void;
  
  togglePause(): void;
  returnToMenu(): void;
  goToNextLevel(): void;
}

export interface LevelData {
  levelId: number;
  character: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  unlocked: boolean;
  targetScore: number;
  timeLimit?: number;
  backgroundPath: string;
  musicPath: string;
}

export interface SceneData {
  [key: string]: any;
}
