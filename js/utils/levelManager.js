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
                    spawnRate: { min: 250, max: 750 }, // В 2 раза больше объектов (уменьшаем интервал в 2 раза)
                    playerSpeed: 1125, // Увеличиваем скорость игрока на 150% (450 * 2.5)
                    gravity: 400, // В 2 раза быстрее падение (увеличиваем гравитацию в 2 раза)
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
                    spawnRate: { min: 267, max: 800 }, // На 50% больше объектов (уменьшаем интервал на 33%)
                    playerSpeed: 1250, // Увеличиваем скорость игрока на 150% (500 * 2.5)
                    gravity: 250, // Оставляем скорость падения как есть
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
                    goodItemChance: 0.1, // 10% шанс хорошего блока (уменьшаем)
                    badItemChance: 0.8,  // 80% шанс плохого блока (увеличиваем на 100% от начального)
                    veryGoodItemChance: 0.1, // 10% шанс очень хорошего блока
                    spawnRate: { min: 150, max: 500 }, // На 100% больше объектов (уменьшаем интервал на 50%)
                    playerSpeed: 1375, // Увеличиваем скорость игрока на 150% (550 * 2.5)
                    gravity: 750, // На 150% быстрее падение (увеличиваем гравитацию на 150%)
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