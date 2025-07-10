interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward?: {
    type: 'character' | 'level' | 'cosmetic';
    value: string;
  };
}

interface PlayerStats {
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  bestScore: number;
  totalPlayTime: number;
  levelsCompleted: number;
  itemsCollected: number;
  perfectGames: number;
}

export class ProgressManager {
  private static instance: ProgressManager;
  private achievements: Map<string, Achievement> = new Map();
  private stats: PlayerStats;
  private readonly STORAGE_KEY = 'gameProgress';

  private constructor() {
    this.initializeAchievements();
    this.stats = this.getDefaultStats();
    this.loadProgress();
  }

  public static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager();
    }
    return ProgressManager.instance;
  }

  private getDefaultStats(): PlayerStats {
    return {
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore: 0,
      totalPlayTime: 0,
      levelsCompleted: 0,
      itemsCollected: 0,
      perfectGames: 0
    };
  }

  private initializeAchievements(): void {
    const achievements: Achievement[] = [
      {
        id: 'first_win',
        name: 'Первая Победа',
        description: 'Пройдите любой уровень',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'score_master',
        name: 'Мастер Очков',
        description: 'Наберите 1000 очков за игру',
        unlocked: false,
        progress: 0,
        maxProgress: 1000
      },
      {
        id: 'item_collector',
        name: 'Коллекционер',
        description: 'Соберите 100 предметов',
        unlocked: false,
        progress: 0,
        maxProgress: 100
      },
      {
        id: 'speed_runner',
        name: 'Спидраннер',
        description: 'Пройдите уровень за 60 секунд',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'perfect_game',
        name: 'Идеальная Игра',
        description: 'Пройдите уровень без получения урона',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'all_levels',
        name: 'Завершитель',
        description: 'Пройдите все уровни',
        unlocked: false,
        progress: 0,
        maxProgress: 3
      }
    ];

    achievements.forEach(achievement => {
      this.achievements.set(achievement.id, achievement);
    });
  }

  public updateStats(updates: Partial<PlayerStats>): void {
    Object.assign(this.stats, updates);
    this.checkAchievements();
    this.saveProgress();
  }

  public addScore(score: number): void {
    this.stats.totalScore += score;
    this.stats.bestScore = Math.max(this.stats.bestScore, score);
    this.checkAchievements();
  }

  public addItemCollected(count: number = 1): void {
    this.stats.itemsCollected += count;
    this.updateAchievementProgress('item_collector', this.stats.itemsCollected);
  }

  public recordGameEnd(won: boolean, score: number, playTime: number, perfectGame: boolean = false): void {
    this.stats.gamesPlayed++;
    this.stats.totalPlayTime += playTime;
    
    if (won) {
      this.stats.gamesWon++;
      this.updateAchievementProgress('first_win', 1);
      this.updateAchievementProgress('all_levels', this.stats.levelsCompleted);
    }

    if (score >= 1000) {
      this.updateAchievementProgress('score_master', score);
    }

    if (perfectGame) {
      this.stats.perfectGames++;
      this.updateAchievementProgress('perfect_game', 1);
    }

    this.addScore(score);
    this.saveProgress();
  }

  public recordSpeedRun(timeMs: number): void {
    if (timeMs <= 60000) { // 60 секунд
      this.updateAchievementProgress('speed_runner', 1);
    }
  }

  private updateAchievementProgress(id: string, progress: number): void {
    const achievement = this.achievements.get(id);
    if (achievement && !achievement.unlocked) {
      achievement.progress = Math.min(progress, achievement.maxProgress);
      
      if (achievement.progress >= achievement.maxProgress) {
        this.unlockAchievement(id);
      }
    }
  }

  private unlockAchievement(id: string): void {
    const achievement = this.achievements.get(id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      console.log(`Achievement unlocked: ${achievement.name}`);
      
      // Уведомляем о разблокировке
      this.notifyAchievementUnlocked(achievement);
    }
  }

  private notifyAchievementUnlocked(achievement: Achievement): void {
    // Можно добавить visual notification
    // EventManager.getInstance().emit('ACHIEVEMENT_UNLOCKED', achievement);
  }

  private checkAchievements(): void {
    // Проверяем все достижения
    if (this.stats.bestScore >= 1000) {
      this.updateAchievementProgress('score_master', this.stats.bestScore);
    }
    
    this.updateAchievementProgress('item_collector', this.stats.itemsCollected);
    this.updateAchievementProgress('all_levels', this.stats.levelsCompleted);
  }

  public getStats(): PlayerStats {
    return { ...this.stats };
  }

  public getAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  public getUnlockedAchievements(): Achievement[] {
    return this.getAchievements().filter(a => a.unlocked);
  }

  public getAchievementProgress(id: string): number {
    const achievement = this.achievements.get(id);
    return achievement ? achievement.progress / achievement.maxProgress : 0;
  }

  private saveProgress(): void {
    const data = {
      stats: this.stats,
      achievements: Array.from(this.achievements.entries())
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        
        if (data.stats) {
          this.stats = { ...this.getDefaultStats(), ...data.stats };
        }
        
        if (data.achievements) {
          data.achievements.forEach(([id, achievement]: [string, Achievement]) => {
            this.achievements.set(id, achievement);
          });
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  }

  public resetProgress(): void {
    this.stats = this.getDefaultStats();
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.progress = 0;
    });
    this.saveProgress();
  }

  public exportProgress(): string {
    return JSON.stringify({
      stats: this.stats,
      achievements: Array.from(this.achievements.entries()),
      exportDate: new Date().toISOString()
    });
  }

  public importProgress(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      
      if (imported.stats) {
        this.stats = { ...this.getDefaultStats(), ...imported.stats };
      }
      
      if (imported.achievements) {
        imported.achievements.forEach(([id, achievement]: [string, Achievement]) => {
          if (this.achievements.has(id)) {
            this.achievements.set(id, achievement);
          }
        });
      }
      
      this.saveProgress();
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}

export const progressManager = ProgressManager.getInstance();

// Константы достижений для экспорта
export const ACHIEVEMENTS = {
  FIRST_WIN: 'first_win',
  SCORE_MASTER: 'score_master',
  ITEM_COLLECTOR: 'item_collector',
  SPEED_RUNNER: 'speed_runner',
  PERFECT_GAME: 'perfect_game',
  ALL_LEVELS: 'all_levels'
} as const;
