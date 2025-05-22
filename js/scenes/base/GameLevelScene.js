// Универсальный класс для уровней игры

import { preloadLevelResources } from './GameLevelPreload.js';
import { createLevelObjects } from './GameLevelCreate.js';
import { updateLevel } from './GameLevelUpdate.js';
import { 
    togglePause, 
    handleResize, 
    returnToMenu, 
    goToNextLevel,
    bounceOffWall,
    collectGoodItem,
    collectVeryGoodItem,
    hitBadItem
} from './GameLevelUtils.js';
import { 
    initializeLevel, 
    checkLevelCompletion as utilsCheckLevelCompletion, 
    checkAchievements as utilsCheckAchievements
} from '../../utils/levelUtils.js';

// Универсальный класс для уровней игры
export class GameLevelScene extends Phaser.Scene {
    constructor(config) {
        super(config);
        
        // Базовые свойства
        this.isPaused = false;
        this.levelId = config.levelId || 1;
        this.levelConfig = null;
        this.levelStartTime = 0;
        this.levelCompleted = false;
        
        // Параметры уровня
        this.levelParams = config.levelParams || {};
        
        // Пути к ресурсам
        this.backgroundPath = config.backgroundPath || 'images/backgrounds/background_level1.png';
        this.musicPath = config.musicPath || 'sounds/level_music/level1_music.wav';
    }

    // Инициализация уровня
    init(data) {
        // Если передан ID уровня, используем его
        if (data && data.levelId) {
            this.levelId = data.levelId;
        }
        
        // Получаем конфигурацию уровня
        this.levelConfig = initializeLevel(this, this.levelId);
        
        // Сбрасываем флаг завершения уровня
        this.levelCompleted = false;
    }

    // Загрузка ресурсов
    preload() {
        preloadLevelResources(this);
    }

    // Создание игровых объектов
    create() {
        // Запоминаем время начала уровня
        this.levelStartTime = this.time.now;
        
        // Создаем игровые объекты
        createLevelObjects(this);
    }

    // Обновление игры
    update(time) {
        updateLevel(this, time);
    }
    
    // Методы для управления игрой
    togglePause() {
        togglePause(this);
    }
    
    handleResize(gameSize) {
        handleResize(this, gameSize);
    }
    
    returnToMenu() {
        returnToMenu(this);
    }
    
    goToNextLevel() {
        goToNextLevel(this);
    }
    
    // Методы для обработки коллизий
    bounceOffWall(item, wall) {
        bounceOffWall(item, wall);
    }
    
    collectGoodItem(player, item) {
        collectGoodItem(player, item);
    }
    
    collectVeryGoodItem(player, item) {
        collectVeryGoodItem(player, item);
    }
    
    hitBadItem(player, item) {
        hitBadItem(this, player, item);
    }
    
    // Методы для проверки условий
    checkLevelCompletion(levelId, levelConfig) {
        return utilsCheckLevelCompletion(this, levelId, levelConfig);
    }
    
    checkAchievements(levelStartTime, time) {
        return utilsCheckAchievements(levelStartTime, time);
    }
}