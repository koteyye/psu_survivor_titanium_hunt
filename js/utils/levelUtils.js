// Утилиты для работы с уровнями
import { levelManager } from './levelManager.js';
import { progressManager, ACHIEVEMENTS } from './progressManager.js';

// Функция для инициализации уровня
export function initializeLevel(scene, levelId = 1) {
    // Получаем конфигурацию уровня
    const levelConfig = levelManager.getLevelConfig(levelId);
    
    // Если конфигурация не найдена, используем значения по умолчанию
    if (!levelConfig) {
        console.warn(`Конфигурация для уровня ${levelId} не найдена, используем значения по умолчанию`);
        return {
            goodItemChance: 0.4,
            badItemChance: 0.5,
            veryGoodItemChance: 0.1,
            spawnRate: { min: 500, max: 1500 },
            playerSpeed: 450,
            gravity: 200,
            scoreToComplete: 200
        };
    }
    
    // Обновляем последний играемый уровень
    progressManager.setLastPlayedLevel(levelId);
    
    // Обновляем гравитацию в физике
    if (scene.physics && scene.physics.world) {
        scene.physics.world.gravity.y = levelConfig.gravity;
    }
    
    return levelConfig;
}

// Функция для проверки завершения уровня
export function checkLevelCompletion(scene, levelId, levelConfig) {
    // Если игра окончена, не проверяем
    if (window.gameOver) return false;
    
    // Проверяем, достигнут ли необходимый счет
    if (window.score >= levelConfig.scoreToComplete) {
        // Отмечаем уровень как пройденный
        levelManager.completeLevel(levelId);
        
        // Увеличиваем счетчик пройденных уровней
        progressManager.incrementLevelsCompleted();
        
        // Проверяем достижение за прохождение первого уровня
        if (levelId === 1) {
            progressManager.addAchievement(ACHIEVEMENTS.FIRST_LEVEL_COMPLETE);
        }
        
        // Проверяем, все ли уровни пройдены
        const allLevels = levelManager.getAllLevels();
        const completedLevels = allLevels.filter(level => level.completed);
        
        if (completedLevels.length === allLevels.length) {
            progressManager.addAchievement(ACHIEVEMENTS.COMPLETE_ALL_LEVELS);
        }
        
        return true;
    }
    
    return false;
}

// Функция для проверки достижений
export function checkAchievements(startTime, currentTime) {
    // Проверяем достижения за набранные очки
    if (window.score >= 100) {
        progressManager.addAchievement(ACHIEVEMENTS.REACH_100_POINTS);
    }
    
    if (window.score >= 500) {
        progressManager.addAchievement(ACHIEVEMENTS.REACH_500_POINTS);
    }
    
    if (window.score >= 1000) {
        progressManager.addAchievement(ACHIEVEMENTS.REACH_1000_POINTS);
    }
    
    // Проверяем достижение за выживание 2 минуты
    const playTime = currentTime - startTime;
    if (playTime >= 120000) { // 2 минуты в миллисекундах
        progressManager.addAchievement(ACHIEVEMENTS.SURVIVE_2_MINUTES);
    }
}

// Функция для отображения информации об уровне
export function showLevelInfo(scene, levelId) {
    // Получаем информацию о уровне
    const levelInfo = levelManager.getLevelById(levelId);
    const levelConfig = levelManager.getLevelConfig(levelId);
    
    if (!levelInfo || !levelConfig) return null;
    
    // Добавляем текст с информацией о текущем уровне
    const levelNameText = scene.add.text(960, 40, levelInfo.name, {
        fontSize: '36px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
    
    // Добавляем текст с целью уровня
    const levelGoalText = scene.add.text(960, 100, `Цель: набрать ${levelConfig.scoreToComplete} очков`, {
        fontSize: '28px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 }
    }).setOrigin(0.5);
    
    // Скрываем текст цели через 5 секунд
    scene.time.delayedCall(5000, () => {
        levelGoalText.destroy();
    });
    
    return { levelNameText, levelGoalText };
}

// Функция для перехода на следующий уровень
export function goToNextLevel(scene, currentLevelId) {
    // Получаем информацию о текущем уровне
    const currentLevel = levelManager.getLevelById(currentLevelId);
    
    if (currentLevel && currentLevel.nextLevelId) {
        // Получаем информацию о следующем уровне
        const nextLevel = levelManager.getLevelById(currentLevel.nextLevelId);
        
        if (nextLevel) {
            // Переходим на следующий уровень
            scene.scene.start(nextLevel.scene, { levelId: nextLevel.id });
            return true;
        }
    }
    
    // Если следующего уровня нет или он не найден, возвращаемся в меню
    scene.scene.start('MenuScene');
    return false;
}

// Функция для спавна предметов с учетом конфигурации уровня
export function spawnLevelItems(scene, levelConfig) {
    const x = Phaser.Math.Between(100, 1820);
    const random = Math.random();
    
    let item;
    
    if (random < levelConfig.badItemChance) {
        // Плохой блок питания
        item = window.badItems.create(x, 0, 'badItem');
    } else if (random < levelConfig.badItemChance + levelConfig.goodItemChance) {
        // Хороший блок питания
        item = window.goodItems.create(x, 0, 'goodItem');
    } else {
        // Очень хороший блок питания
        item = window.veryGoodItems.create(x, 0, 'veryGoodItem');
    }
    
    // Настраиваем предмет
    item.setScale(0.8);
    
    // Уменьшаем коллизионную область, но сохраняем визуальный размер
    const textureWidth = item.width;
    const textureHeight = item.height;
    const collisionWidth = textureWidth * 0.6;
    const collisionHeight = textureHeight * 0.6;
    const offsetX = (textureWidth - collisionWidth) / 2;
    const offsetY = (textureHeight - collisionHeight) / 2;
    
    item.setSize(collisionWidth, collisionHeight);
    item.setOffset(offsetX, offsetY);
    item.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
    item.setAngularVelocity(Phaser.Math.Between(-100, 100));
    item.setBounce(1, 0);
    item.itemText = null;
    item.update = function() { /* Пустая функция обновления */ };
    
    return item;
}

// Функция для создания UI завершения уровня
export function createLevelCompletedUI(scene) {
    // Создаем текст для завершения уровня
    const levelCompletedText = scene.add.text(960, 540, 'УРОВЕНЬ ПРОЙДЕН!', { 
        fontSize: '96px', 
        fill: '#00ff00',
        fontStyle: 'bold'
    });
    levelCompletedText.setOrigin(0.5);
    levelCompletedText.visible = false;
    
    // Создаем текст для перехода на следующий уровень
    const nextLevelText = scene.add.text(960, 660, 'Нажмите ПРОБЕЛ для следующего уровня', { 
        fontSize: '42px', 
        fill: '#ffffff',
        fontStyle: 'bold'
    });
    nextLevelText.setOrigin(0.5);
    nextLevelText.visible = false;
    
    return { levelCompletedText, nextLevelText };
}

// Функция для обновления счетчиков собранных предметов и проверки достижений
export function updateItemCollectionStats(itemType) {
    // Статические счетчики для отслеживания собранных предметов
    if (!window.itemStats) {
        window.itemStats = {
            goodItemsCollected: 0,
            veryGoodItemsCollected: 0
        };
    }
    
    if (itemType === 'good') {
        window.itemStats.goodItemsCollected++;
        
        // Проверяем достижения
        if (window.itemStats.goodItemsCollected >= 50) {
            progressManager.addAchievement(ACHIEVEMENTS.COLLECT_50_GOOD_ITEMS);
        }
    } else if (itemType === 'veryGood') {
        window.itemStats.veryGoodItemsCollected++;
        
        // Проверяем достижения
        if (window.itemStats.veryGoodItemsCollected >= 20) {
            progressManager.addAchievement(ACHIEVEMENTS.COLLECT_20_VERY_GOOD_ITEMS);
        }
    }
}