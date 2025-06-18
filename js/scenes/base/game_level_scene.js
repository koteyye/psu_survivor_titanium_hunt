// Универсальный класс для уровней игры

import { preloadLevelResources } from './game_level_preload.js';
import { createLevelObjects } from './game_level_create.js';
import { updateLevel } from './game_level_update.js';
import { 
    togglePause, 
    handleResize, 
    returnToMenu, 
    goToNextLevel,
    bounceOffWall,
    collectGoodItem,
    collectVeryGoodItem,
    hitBadItem
} from './game_level_utils.js';
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
        this.selectedCharacter = null;
        
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
        
        // Если передан выбранный персонаж, сохраняем его
        if (data && data.character) {
            this.selectedCharacter = data.character;
        } else {
            // Если персонаж не передан, пытаемся получить его из localStorage
            this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
        }
        
        // Получаем конфигурацию уровня
        this.levelConfig = initializeLevel(this, this.levelId);
        
        // Сбрасываем флаг завершения уровня
        this.levelCompleted = false;
        
        console.log(`Уровень ${this.levelId} инициализирован с персонажем: ${this.selectedCharacter}`);
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
        // Если используем новую систему персонажей
        if (window.gameCharacter) {
            window.gameCharacter.collectGoodItem(item);
        } else {
            // Запасной вариант - старая функция
            collectGoodItem(this, player, item);
        }
    }
    
    collectVeryGoodItem(player, item) {
        // Если используем новую систему персонажей
        if (window.gameCharacter) {
            window.gameCharacter.collectVeryGoodItem(item);
        } else {
            // Запасной вариант - старая функция
            collectVeryGoodItem(this, player, item);
        }
    }
    
    hitBadItem(player, item) {
        // Если используем новую систему персонажей
        if (window.gameCharacter) {
            window.gameCharacter.hitBadItem(item);
        } else {
            // Запасной вариант - старая функция
            hitBadItem(this, player, item);
        }
    }
    
    // Методы для проверки условий
    checkLevelCompletion(levelId, levelConfig) {
        return utilsCheckLevelCompletion(this, levelId, levelConfig);
    }
    
    checkAchievements(levelStartTime, time) {
        return utilsCheckAchievements(levelStartTime, time, this);
    }
}