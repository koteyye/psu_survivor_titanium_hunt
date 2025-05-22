// Менеджер уровней для управления уровнями игры

// Класс для управления уровнями
export class LevelManager {
    constructor() {
        // Массив с информацией об уровнях
        this.levels = [
            {
                id: 1,
                name: 'Уровень 1: Начало пути',
                scene: 'MainScene',
                description: 'Собирайте хорошие блоки питания и избегайте плохих.',
                unlocked: true,
                completed: false,
                scoreToUnlock: 0, // Очки, необходимые для разблокировки (0 - начальный уровень)
                nextLevelId: 2,
                config: {
                    goodItemChance: 0.4, // 40% шанс хорошего блока
                    badItemChance: 0.5,  // 50% шанс плохого блока
                    veryGoodItemChance: 0.1, // 10% шанс очень хорошего блока
                    spawnRate: { min: 500, max: 1500 }, // Интервал спавна предметов
                    playerSpeed: 450, // Скорость игрока
                    gravity: 200, // Гравитация
                    scoreToComplete: 200 // Очки для завершения уровня
                }
            },
            {
                id: 2,
                name: 'Уровень 2: Титановый вызов',
                scene: 'Level2Scene', // Будущая сцена для второго уровня
                description: 'Больше плохих блоков питания и быстрее падение.',
                unlocked: false,
                completed: false,
                scoreToUnlock: 200, // Нужно набрать 200 очков на первом уровне
                nextLevelId: 3,
                config: {
                    goodItemChance: 0.3, // 30% шанс хорошего блока
                    badItemChance: 0.6,  // 60% шанс плохого блока
                    veryGoodItemChance: 0.1, // 10% шанс очень хорошего блока
                    spawnRate: { min: 400, max: 1200 }, // Быстрее спавн
                    playerSpeed: 500, // Быстрее игрок
                    gravity: 250, // Сильнее гравитация
                    scoreToComplete: 300 // Очки для завершения уровня
                }
            },
            {
                id: 3,
                name: 'Уровень 3: Мощь титана',
                scene: 'Level3Scene', // Будущая сцена для третьего уровня
                description: 'Максимальная сложность и скорость.',
                unlocked: false,
                completed: false,
                scoreToUnlock: 500, // Нужно набрать 500 очков на втором уровне
                nextLevelId: null, // Последний уровень
                config: {
                    goodItemChance: 0.2, // 20% шанс хорошего блока
                    badItemChance: 0.7,  // 70% шанс плохого блока
                    veryGoodItemChance: 0.1, // 10% шанс очень хорошего блока
                    spawnRate: { min: 300, max: 1000 }, // Ещё быстрее спавн
                    playerSpeed: 550, // Ещё быстрее игрок
                    gravity: 300, // Ещё сильнее гравитация
                    scoreToComplete: 400 // Очки для завершения уровня
                }
            }
        ];
        
        // Загружаем прогресс из localStorage
        this.loadProgress();
    }
    
    // Получить информацию о конкретном уровне
    getLevelById(id) {
        return this.levels.find(level => level.id === id);
    }
    
    // Получить текущий уровень (первый незавершенный)
    getCurrentLevel() {
        return this.levels.find(level => level.unlocked && !level.completed) || this.levels[0];
    }
    
    // Получить все уровни
    getAllLevels() {
        return this.levels;
    }
    
    // Получить разблокированные уровни
    getUnlockedLevels() {
        return this.levels.filter(level => level.unlocked);
    }
    
    // Разблокировать уровень
    unlockLevel(id) {
        const level = this.getLevelById(id);
        if (level) {
            level.unlocked = true;
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Отметить уровень как завершенный
    completeLevel(id) {
        const level = this.getLevelById(id);
        if (level) {
            level.completed = true;
            
            // Разблокируем следующий уровень, если он существует
            if (level.nextLevelId) {
                this.unlockLevel(level.nextLevelId);
            }
            
            this.saveProgress();
            return true;
        }
        return false;
    }
    
    // Сбросить прогресс всех уровней
    resetProgress() {
        this.levels.forEach((level, index) => {
            level.completed = false;
            level.unlocked = index === 0; // Только первый уровень разблокирован
        });
        this.saveProgress();
    }
    
    // Сохранить прогресс в localStorage
    saveProgress() {
        const progress = this.levels.map(level => ({
            id: level.id,
            unlocked: level.unlocked,
            completed: level.completed
        }));
        
        localStorage.setItem('levelProgress', JSON.stringify(progress));
    }
    
    // Загрузить прогресс из localStorage
    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('levelProgress');
            
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                
                // Обновляем информацию о уровнях
                progress.forEach(savedLevel => {
                    const level = this.getLevelById(savedLevel.id);
                    if (level) {
                        level.unlocked = savedLevel.unlocked;
                        level.completed = savedLevel.completed;
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка при загрузке прогресса уровней:', error);
        }
    }
    
    // Получить конфигурацию для конкретного уровня
    getLevelConfig(id) {
        const level = this.getLevelById(id);
        return level ? level.config : null;
    }
}

// Создаем и экспортируем экземпляр менеджера уровней
export const levelManager = new LevelManager();