// Менеджер прогресса для сохранения и загрузки прогресса игрока

// Класс для управления прогрессом игрока
export class ProgressManager {
    constructor() {
        // Данные о прогрессе игрока
        this.playerData = {
            highScore: 0,
            totalScore: 0,
            levelsCompleted: 0,
            lastPlayedLevel: 1,
            achievements: []
        };
        
        // Загружаем прогресс из localStorage
        this.loadProgress();
    }
    
    // Обновить лучший результат
    updateHighScore(score) {
        if (score > this.playerData.highScore) {
            this.playerData.highScore = score;
            this.saveProgress();
            return true; // Возвращаем true, если установлен новый рекорд
        }
        return false;
    }
    
    // Добавить очки к общему счету
    addToTotalScore(score) {
        this.playerData.totalScore += score;
        this.saveProgress();
    }
    
    // Увеличить количество пройденных уровней
    incrementLevelsCompleted() {
        this.playerData.levelsCompleted++;
        this.saveProgress();
    }
    
    // Установить последний играемый уровень
    setLastPlayedLevel(levelId) {
        this.playerData.lastPlayedLevel = levelId;
        this.saveProgress();
    }
    
    // Добавить достижение
    addAchievement(achievement) {
        // Проверяем, нет ли уже такого достижения
        if (!this.playerData.achievements.includes(achievement)) {
            this.playerData.achievements.push(achievement);
            this.saveProgress();
            return true; // Возвращаем true, если достижение новое
        }
        return false;
    }
    
    // Получить все достижения
    getAchievements() {
        return this.playerData.achievements;
    }
    
    // Проверить, есть ли у игрока определенное достижение
    hasAchievement(achievement) {
        return this.playerData.achievements.includes(achievement);
    }
    
    // Получить лучший результат
    getHighScore() {
        return this.playerData.highScore;
    }
    
    // Получить общий счет
    getTotalScore() {
        return this.playerData.totalScore;
    }
    
    // Получить количество пройденных уровней
    getLevelsCompleted() {
        return this.playerData.levelsCompleted;
    }
    
    // Получить ID последнего играемого уровня
    getLastPlayedLevel() {
        return this.playerData.lastPlayedLevel;
    }
    
    // Сохранить прогресс в localStorage
    saveProgress() {
        localStorage.setItem('playerProgress', JSON.stringify(this.playerData));
    }
    
    // Загрузить прогресс из localStorage
    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('playerProgress');
            
            if (savedProgress) {
                this.playerData = JSON.parse(savedProgress);
            }
        } catch (error) {
            console.error('Ошибка при загрузке прогресса игрока:', error);
        }
    }
    
    // Сбросить весь прогресс
    resetProgress() {
        this.playerData = {
            highScore: 0,
            totalScore: 0,
            levelsCompleted: 0,
            lastPlayedLevel: 1,
            achievements: []
        };
        this.saveProgress();
    }
}

// Список возможных достижений
export const ACHIEVEMENTS = {
    FIRST_LEVEL_COMPLETE: 'first_level_complete',
    REACH_100_POINTS: 'reach_100_points',
    REACH_500_POINTS: 'reach_500_points',
    REACH_1000_POINTS: 'reach_1000_points',
    COLLECT_50_GOOD_ITEMS: 'collect_50_good_items',
    COLLECT_20_VERY_GOOD_ITEMS: 'collect_20_very_good_items',
    SURVIVE_2_MINUTES: 'survive_2_minutes',
    COMPLETE_ALL_LEVELS: 'complete_all_levels'
};

// Информация о достижениях (для отображения)
export const ACHIEVEMENT_INFO = {
    [ACHIEVEMENTS.FIRST_LEVEL_COMPLETE]: {
        title: 'Первые шаги',
        description: 'Завершите первый уровень'
    },
    [ACHIEVEMENTS.REACH_100_POINTS]: {
        title: 'Начинающий коллекционер',
        description: 'Наберите 100 очков за одну игру'
    },
    [ACHIEVEMENTS.REACH_500_POINTS]: {
        title: 'Опытный коллекционер',
        description: 'Наберите 500 очков за одну игру'
    },
    [ACHIEVEMENTS.REACH_1000_POINTS]: {
        title: 'Мастер блоков питания',
        description: 'Наберите 1000 очков за одну игру'
    },
    [ACHIEVEMENTS.COLLECT_50_GOOD_ITEMS]: {
        title: 'Любитель качества',
        description: 'Соберите 50 хороших блоков питания'
    },
    [ACHIEVEMENTS.COLLECT_20_VERY_GOOD_ITEMS]: {
        title: 'Титановый охотник',
        description: 'Соберите 20 блоков питания с титановыми конденсаторами'
    },
    [ACHIEVEMENTS.SURVIVE_2_MINUTES]: {
        title: 'Выживший',
        description: 'Выживите 2 минуты на одном уровне'
    },
    [ACHIEVEMENTS.COMPLETE_ALL_LEVELS]: {
        title: 'Повелитель титана',
        description: 'Пройдите все уровни игры'
    }
};

// Создаем и экспортируем экземпляр менеджера прогресса
export const progressManager = new ProgressManager();