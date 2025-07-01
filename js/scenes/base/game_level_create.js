// Функции для создания игровых объектов

import { showLevelInfo } from '../../utils/levelUtils.js';
import { createExplosionAnimation } from '../../utils/animationUtils.js';
import { createGameUI, showLevelCompletedUI, updateGameUI } from './game_level_ui.js';
import { CharacterFactory } from '../../objects/characters/index.js';
import { CyberTitle } from '../../ui/index.js';
import { initShaders } from '../../utils/shader_utils.js';
import { initItemPools, setupItemCollisions } from '../../objects/items.js';
import { AudioManager } from '../../managers/index.js';

// Основная функция создания игровых объектов
export function createLevelObjects(scene) {
    // Инициализируем AudioManager
    const audioManager = AudioManager.getInstance();
    audioManager.init(scene);
    
    // Добавляем фоновое изображение с уникальным ключом для каждого уровня
    scene.add.image(960, 540, `background_level${scene.levelId}`).setDisplaySize(1920, 1080);
    
    // Останавливаем предыдущую музыку через AudioManager
    audioManager.stopMusic();
    
    // Добавляем фоновую музыку с уникальным ключом для каждого уровня через AudioManager
    audioManager.addMusic(`backgroundMusic_level${scene.levelId}`, `backgroundMusic_level${scene.levelId}`, { loop: true, volume: 0.3 });
    
    // Воспроизводим музыку через AudioManager (он сам проверит настройки)
    audioManager.playMusic(`backgroundMusic_level${scene.levelId}`);
    
    // Инициализируем время спавна предметов
    scene.registry.set('itemSpawnTime', 0);
    
    // Инициализируем счет и здоровье при начале нового уровня
    scene.registry.set('score', 0);
    scene.registry.set('health', 100);
    
    // Создаем игровые объекты
    createGameEntities(scene);
    
    // Создаем UI элементы
    createUIElements(scene);
    
    // Настраиваем обработчики ввода
    setupInputHandlers(scene);
}

// Создание игровых сущностей (игрок, предметы, стены)
function createGameEntities(scene) {
    // Добавляем звуковые эффекты только если они загружены
    if (scene.cache.audio.exists('explosionSound')) {
        // Добавляем звук взрыва через AudioManager
        const audioManager = AudioManager.getInstance();
        audioManager.addSound('explosionSound', 'explosionSound', { volume: 0.8 });
    } else {
        console.warn('Звук взрыва не найден в кэше!');
    }
    // Звук nyamnyamSound больше не используется
      // Инициализация шейдеров
    initShaders(scene);
    
    // Создание анимации взрыва
    createExplosionAnimation(scene);    // Инициализация пулов предметов
    initItemPools(scene);
    
    // Создание игрока
    createPlayer(scene);
    
    // Создаем невидимые стены по бокам для отскока предметов
    const leftWall = scene.physics.add.staticGroup();
    const rightWall = scene.physics.add.staticGroup();
    
    // Добавляем стены
    leftWall.create(0, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    rightWall.create(1920, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    
    // Сохраняем стены в Registry для последующего использования
    scene.registry.set('leftWall', leftWall);
    scene.registry.set('rightWall', rightWall);
    
    // ТЕПЕРЬ настраиваем коллизии после создания и игрока, и стен
    const gameCharacter = scene.registry.get('gameCharacter');
    const playerSprite = scene.registry.get('playerSprite');
    
    if (gameCharacter && playerSprite) {
        console.log('Финальная настройка коллизий...');
        setupItemCollisions(scene, playerSprite, [leftWall, rightWall]);
    } else {
        console.error('Не удалось настроить коллизии - персонаж или спрайт не найден!');
    }
    
    // Сохраняем ссылку на сцену в Registry
    scene.registry.set('gameScene', scene);
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
            // Создаем персонажа с помощью фабрики
            // CharacterFactory автоматически сохраняет персонажа в Registry как 'gameCharacter'
            const gameCharacter = CharacterFactory.createCharacter(scene, 960, 900, characterTexture);
            
            // Воспроизводим звук выбора персонажа
            gameCharacter.playSelectSound();
            
            console.log('Персонаж создан через CharacterFactory:', gameCharacter);
            console.log('Спрайт персонажа:', gameCharacter.sprite);
        } else {
            // Создаем спрайт игрока напрямую (запасной вариант)
            const player = scene.physics.add.sprite(960, 900, 'player');
            player.setCollideWorldBounds(true);
            player.setDisplaySize(200, 300);
            
            // Сохраняем игрока в Registry
            scene.registry.set('gameCharacter', { sprite: player });
            console.log('Создан запасной игрок:', player);
        }
        
        // Настраиваем спрайт игрока
        const currentGameCharacter = scene.registry.get('gameCharacter');
        if (currentGameCharacter && currentGameCharacter.sprite) {
            const playerSprite = currentGameCharacter.sprite;
            
            // Принудительно делаем спрайт видимым и устанавливаем прозрачность
            playerSprite.setVisible(true);
            playerSprite.setAlpha(1);
            
            // Сохраняем правильный спрайт игрока для коллизий
            scene.registry.set('playerSprite', playerSprite);
            console.log('Спрайт игрока сохранен для коллизий:', playerSprite);
            console.log('У спрайта есть физическое тело:', !!playerSprite.body);
        } else {
            console.error('Персонаж не создан или у него отсутствует спрайт!');
        }
        
    } catch (e) {
        console.error('Ошибка при создании игрока:', e);
        console.error(e.stack);
    }
    
    // Создание управления
    const cursors = scene.input.keyboard.createCursorKeys();
    scene.registry.set('cursors', cursors);
}

// Создание UI элементов
function createUIElements(scene) {
    // Создаем UI элементы с использованием нашего нового модуля
    const gameUI = createGameUI(scene, {
        showHealthBar: true, // Показываем только шкалу здоровья
        showMoneyBar: false,
        showRageBar: false
    });
    
    // Сохраняем ссылки на UI элементы в Registry
    scene.registry.set('scoreText', gameUI.scoreText);
    scene.registry.set('healthText', null); // Больше не используем отдельный текст для здоровья
    scene.registry.set('gameOverText', gameUI.gameOverTitle);
    scene.registry.set('restartText', gameUI.restartButton);
    
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