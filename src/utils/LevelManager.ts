interface Level {
  id: number;
  name: string;
  unlocked: boolean;
  targetScore: number;
  timeLimit?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    experience: number;
    unlocks?: string[];
  };
}

export class LevelManager {
  private static instance: LevelManager;
  private levels: Map<number, Level> = new Map();
  private readonly STORAGE_KEY = 'levelProgress';

  private constructor() {
    this.initializeLevels();
    this.loadProgress();
  }

  public static getInstance(): LevelManager {
    if (!LevelManager.instance) {
      LevelManager.instance = new LevelManager();
    }
    return LevelManager.instance;
  }

  private initializeLevels(): void {
    const defaultLevels: Level[] = [
      {
        id: 1,
        name: 'Первый День',
        unlocked: true,
        targetScore: 500,
        difficulty: 'easy',
        rewards: { experience: 100, unlocks: ['level2'] }
      },
      {
        id: 2,
        name: 'Испытание',
        unlocked: false,
        targetScore: 1000,
        difficulty: 'medium',
        rewards: { experience: 200, unlocks: ['level3'] }
      },
      {
        id: 3,
        name: 'Финальная Битва',
        unlocked: false,
        targetScore: 1500,
        timeLimit: 120000,
        difficulty: 'hard',
        rewards: { experience: 300 }
      }
    ];

    defaultLevels.forEach(level => this.levels.set(level.id, level));
  }

  public getLevel(id: number): Level | undefined {
    return this.levels.get(id);
  }

  public getAllLevels(): Level[] {
    return Array.from(this.levels.values()).sort((a, b) => a.id - b.id);
  }

  public getUnlockedLevels(): Level[] {
    return this.getAllLevels().filter(level => level.unlocked);
  }

  public unlockLevel(id: number): boolean {
    const level = this.levels.get(id);
    if (level && !level.unlocked) {
      level.unlocked = true;
      this.saveProgress();
      return true;
    }
    return false;
  }

  public completeLevel(id: number, score: number): boolean {
    const level = this.levels.get(id);
    if (!level) return false;

    const completed = score >= level.targetScore;
    
    if (completed && level.rewards.unlocks) {
      level.rewards.unlocks.forEach(unlockId => {
        const levelId = parseInt(unlockId.replace('level', ''));
        this.unlockLevel(levelId);
      });
    }

    this.saveProgress();
    return completed;
  }

  private saveProgress(): void {
    const progress = {
      levels: Array.from(this.levels.entries()).map(([id, level]) => ({
        id,
        unlocked: level.unlocked
      }))
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        progress.levels?.forEach((levelData: any) => {
          const level = this.levels.get(levelData.id);
          if (level) {
            level.unlocked = levelData.unlocked;
          }
        });
      }
    } catch (error) {
      console.error('Error loading level progress:', error);
    }
  }

  public resetProgress(): void {
    this.levels.forEach(level => {
      level.unlocked = level.id === 1;
    });
    this.saveProgress();
  }

  public getLevelInfo(id: number): {
    name: string;
    difficulty: string;
    targetScore: number;
    timeLimit?: number;
  } | null {
    const level = this.levels.get(id);
    if (!level) return null;

    return {
      name: level.name,
      difficulty: level.difficulty,
      targetScore: level.targetScore,
      timeLimit: level.timeLimit
    };
  }
}

// Экспортируем синглтон
export const levelManager = LevelManager.getInstance();
