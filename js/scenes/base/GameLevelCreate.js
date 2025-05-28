// Функции для создания игровых объектов

import { showLevelInfo } from '../../utils/levelUtils.js';
import { createExplosionAnimation } from '../../utils/animationUtils.js';
import { createGameUI, showLevelCompletedUI, updateGameUI } from './GameLevelUI.js';
import { CharacterFactory } from '../../objects/characters/index.js';
import { CyberTitle } from '../../ui/index.js';

// Основная функция создания игровых объектов
export function createLevelObjects(scene) {
    // Добавляем фоновое изображение с уникальным ключом для каждого уровня
    scene.add.image(960, 540, `background_level${scene.levelId}`).setDisplaySize(1920, 1080);
    
    // Останавливаем предыдущую музыку, если она играет
    if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
        window.backgroundMusic.stop();
    }
    
    // Добавляем фоновую музыку с уникальным ключом для каждого уровня
    window.backgroundMusic = scene.sound.add(`backgroundMusic_level${scene.levelId}`, { loop: true, volume: 0.3 });
    
    // Проверяем настройки музыки
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    if (musicEnabled) {
        window.backgroundMusic.play();
    }
    
    // Инициализируем время спавна предметов
    window.itemSpawnTime = 0;
    
    // Инициализируем счет и здоровье при начале нового уровня
    window.score = 0;
    window.health = 100;
    
    // Создаем игровые объекты
    createGameEntities(scene);
    
    // Создаем UI элементы
    createUIElements(scene);
    
    // Настраиваем обработчики ввода
    setupInputHandlers(scene);
}

// Создание игровых сущностей (игрок, предметы, стены)
function createGameEntities(scene) {
    // Добавляем звуковые эффекты
    window.explosionSound = scene.sound.add('explosionSound', { volume: 0.8 });
    // Звук nyamnyamSound больше не используется
    
    // Создание анимации взрыва
    createExplosionAnimation(scene);
    
    // Создание групп объектов
    window.goodItems = scene.physics.add.group();
    window.badItems = scene.physics.add.group();
    window.veryGoodItems = scene.physics.add.group();
    window.explosions = scene.physics.add.group();
    
    // Создаем невидимые стены по бокам
    const leftWall = scene.physics.add.staticGroup();
    const rightWall = scene.physics.add.staticGroup();
    
    // Добавляем стены
    leftWall.create(0, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    rightWall.create(1920, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    
    // Настраиваем коллизии со стенами
    scene.physics.add.collider(window.goodItems, leftWall, scene.bounceOffWall, null, scene);
    scene.physics.add.collider(window.goodItems, rightWall, scene.bounceOffWall, null, scene);
    scene.physics.add.collider(window.badItems, leftWall, scene.bounceOffWall, null, scene);
    scene.physics.add.collider(window.badItems, rightWall, scene.bounceOffWall, null, scene);
    scene.physics.add.collider(window.veryGoodItems, leftWall, scene.bounceOffWall, null, scene);
    scene.physics.add.collider(window.veryGoodItems, rightWall, scene.bounceOffWall, null, scene);
    
    // Создание игрока
    createPlayer(scene);
    
    // Добавление коллизий
    scene.physics.add.overlap(window.player, window.goodItems, scene.collectGoodItem, null, scene);
    scene.physics.add.overlap(window.player, window.badItems, scene.hitBadItem, null, scene);
    scene.physics.add.overlap(window.player, window.veryGoodItems, scene.collectVeryGoodItem, null, scene);
    
    // Сохраняем ссылку на сцену в глобальной переменной
    window.gameScene = scene;
}

// Создание игрока
function createPlayer(scene) {
    try {
        console.log('Начинаем создание игрока...');
        
        // Получаем выбранного персонажа
        const characterTexture = scene.selectedCharacter || localStorage.getItem('selectedCharacter') || 'friender_s';
        console.log(`Создаем игрока с текстурой: ${characterTexture}`);
        
        // Проверяем все доступные текстуры
        console.log('Доступные текстуры:', Object.keys(scene.textures.list));
        
        // Проверяем текстуру выбранного персонажа
        if (scene.textures.exists(characterTexture)) {
            const source = scene.textures.get(characterTexture).source[0];
            console.log(`Текстура ${characterTexture} существует!`);
            console.log(`Размеры текстуры ${characterTexture}:`, source.width, 'x', source.height);
            
            // Создаем персонажа с помощью фабрики
            window.gameCharacter = CharacterFactory.createCharacter(scene, 960, 900, characterTexture);
            console.log(`Персонаж создан с текстурой ${characterTexture}`);
            
            // Воспроизводим звук выбора персонажа
            window.gameCharacter.playSelectSound();
        } else {
            console.log(`Текстура ${characterTexture} НЕ существует, используем запасную текстуру player`);
            // Создаем спрайт игрока напрямую (запасной вариант)
            window.player = scene.physics.add.sprite(960, 900, 'player');
            window.player.setCollideWorldBounds(true);
            window.player.setDisplaySize(200, 300);
        }
        
        // Выводим информацию о спрайте
        if (window.player) {
            console.log('Размеры спрайта игрока:', window.player.width, 'x', window.player.height);
            console.log('Видимость спрайта игрока:', window.player.visible);
            
            // Принудительно делаем спрайт видимым и устанавливаем прозрачность
            window.player.setVisible(true);
            window.player.setAlpha(1);
        }
    } catch (e) {
        console.error('Ошибка при создании игрока:', e);
        console.error(e.stack);
    }
    
    // Создание управления
    window.cursors = scene.input.keyboard.createCursorKeys();
}

// Создание UI элементов
function createUIElements(scene) {
    // Создаем UI элементы с использованием нашего нового модуля
    const gameUI = createGameUI(scene, {
        showHealthBar: true, // Показываем только шкалу здоровья
        showMoneyBar: false,
        showRageBar: false
    });
    
    // Сохраняем ссылки на глобальные переменные для совместимости
    window.scoreText = gameUI.scoreText;
    window.healthText = null; // Больше не используем отдельный текст для здоровья
    window.gameOverText = gameUI.gameOverTitle;
    window.restartText = gameUI.restartButton;
    
    // Показываем информацию об уровне
    const levelUI = showLevelInfo(scene, scene.levelId);
    scene.levelNameText = levelUI.levelNameText;
    scene.levelGoalText = levelUI.levelGoalText;
    
    // Создаем UI для завершения уровня
    const completedUI = showLevelCompletedUI(scene);
    scene.levelCompletedText = completedUI.levelCompletedTitle;
    scene.nextLevelText = completedUI.nextLevelButton;
    
    // Добавляем специфические элементы для уровня в киберпанк-стиле
    if (scene.levelParams && scene.levelParams.levelDescription) {
        const levelDescText = new CyberTitle(
            scene,
            960,
            200, // Размещаем ниже названия уровня и цели
            scene.levelParams.levelDescription,
            {
                fontSize: 24,
                fontFamily: 'Orbitron, sans-serif',
                color: '#ff9900',
                glowIntensity: 1,
                backgroundColor: '#0a0f1c80', // Полупрозрачный фон
                padding: { x: 20, y: 10 }
            }
        );
        scene.uiElements.push(levelDescText);
        
        // Скрываем текст через 5 секунд
        scene.time.delayedCall(5000, () => {
            levelDescText.setVisible(false);
        });
    }
    
    // Добавляем обновление UI в цикл обновления сцены
    scene.events.on('update', () => {
        updateGameUI(scene);
    });
}

// Настройка обработчиков ввода
function setupInputHandlers(scene) {
    // Добавляем обработчик клавиши паузы (P)
    scene.input.keyboard.on('keydown-P', () => {
        scene.togglePause();
    });
    
    // Добавляем обработчик клавиши меню (M)
    scene.input.keyboard.on('keydown-M', () => {
        scene.returnToMenu();
    });
    
    // Добавляем обработчик клавиши пробел для перехода на следующий уровень
    scene.input.keyboard.on('keydown-SPACE', () => {
        if (scene.levelCompleted) {
            // Скрываем тексты
            scene.levelCompletedText.setVisible(false);
            scene.nextLevelText.setVisible(false);
            
            // Переходим на следующий уровень
            scene.goToNextLevel();
        }
    });
    
    // Добавляем обработчик изменения размера окна
    scene.scale.on('resize', scene.handleResize, scene);
}