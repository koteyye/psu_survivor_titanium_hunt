// Импортируем необходимые функции
import { createPlayerPlaceholder } from '../utils/assetLoader.js';
import { bounceOffWall, collectGoodItem, collectVeryGoodItem, hitBadItem } from '../objects/items.js';

// Функция создания меню
export function createMenuButton(scene) {
    // Создаем кнопку в верхнем правом углу
    const button = scene.add.rectangle(1820, 60, 150, 70, 0x4a6fa5, 0.8);
    button.setStrokeStyle(2, 0xffffff);
    
    // Добавляем текст на кнопку
    const buttonText = scene.add.text(1820, 60, 'Меню', {
        fontSize: '32px',
        fill: '#ffffff'
    }).setOrigin(0.5);
    
    // Делаем кнопку интерактивной
    button.setInteractive();
    
    // Добавляем эффекты при наведении и клике
    button.on('pointerover', () => {
        button.fillColor = 0x5a8ac5;
        buttonText.setStyle({ fill: '#ffffff' });
    });
    
    button.on('pointerout', () => {
        button.fillColor = 0x4a6fa5;
        buttonText.setStyle({ fill: '#ffffff' });
    });
    
    button.on('pointerdown', () => {
        button.fillColor = 0x3a5f95;
        buttonText.setStyle({ fill: '#cccccc' });
    });
    
    button.on('pointerup', () => {
        button.fillColor = 0x5a8ac5;
        buttonText.setStyle({ fill: '#ffffff' });
        
        // Останавливаем музыку перед переходом в меню
        if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
            window.backgroundMusic.stop();
        }
        
        // Переходим в меню
        scene.scene.start('MenuScene');
    });
    
    return { button, text: buttonText };
}

// Функция создания игровых объектов для MainScene
export function createGameObjects(scene) {
    // Добавляем фоновое изображение
    scene.add.image(960, 540, 'background').setDisplaySize(1920, 1080);
    
    // Останавливаем предыдущую музыку, если она играет
    if (window.backgroundMusic && window.backgroundMusic.isPlaying) {
        window.backgroundMusic.stop();
    }
    
    // Добавляем фоновую музыку
    window.backgroundMusic = scene.sound.add('backgroundMusic', { loop: true, volume: 0.3 });
    
    // Проверяем настройки музыки
    const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
    if (musicEnabled) {
        window.backgroundMusic.play();
    }

    // Добавляем звуковые эффекты
    window.explosionSound = scene.sound.add('explosionSound', { volume: 0.8 });
    window.nyamnyamSound = scene.sound.add('nyamnyamSound', { volume: 0.8 });

    // Создание анимации взрыва с оригинальными параметрами
    try {
        // Удаляем существующую анимацию, если она есть
        if (scene.anims.exists('explode')) {
            scene.anims.remove('explode');
        }
        
        // Создаем анимацию заново
        scene.anims.create({
            key: 'explode',
            frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 16 }),
            frameRate: 20, // Возвращаем оригинальную скорость
            repeat: 0
        });
        console.log('Анимация взрыва успешно создана');
    } catch (e) {
        console.error('Ошибка при создании анимации взрыва:', e);
        console.error(e.stack);
    }

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
    scene.physics.add.collider(window.goodItems, leftWall, bounceOffWall, null, scene);
    scene.physics.add.collider(window.goodItems, rightWall, bounceOffWall, null, scene);
    scene.physics.add.collider(window.badItems, leftWall, bounceOffWall, null, scene);
    scene.physics.add.collider(window.badItems, rightWall, bounceOffWall, null, scene);
    scene.physics.add.collider(window.veryGoodItems, leftWall, bounceOffWall, null, scene);
    scene.physics.add.collider(window.veryGoodItems, rightWall, bounceOffWall, null, scene);

    // Создание игрока с принудительным отображением
    try {
        console.log('Начинаем создание игрока...');
        
        // Проверяем все доступные текстуры
        console.log('Доступные текстуры:', Object.keys(scene.textures.list));
        
        // Проверяем текстуру игрока
        if (scene.textures.exists('player')) {
            const source = scene.textures.get('player').source[0];
            console.log('Текстура player существует!');
            console.log('Размеры текстуры player:', source.width, 'x', source.height);
            
            // Создаем спрайт игрока
            window.player = scene.physics.add.sprite(960, 900, 'player');
            console.log('Спрайт игрока создан с текстурой player');
        } else {
            console.log('Текстура player НЕ существует, создаем заглушку');
            createPlayerPlaceholder(scene);
            window.player = scene.physics.add.sprite(960, 900, 'player');
        }
        
        // Настраиваем спрайт игрока
        window.player.setCollideWorldBounds(true);
        window.player.setScale(0.8);
        
        // Выводим информацию о спрайте
        console.log('Размеры спрайта игрока:', window.player.width, 'x', window.player.height);
        console.log('Видимость спрайта игрока:', window.player.visible);
        
        // Принудительно делаем спрайт видимым и устанавливаем прозрачность
        window.player.setVisible(true);
        window.player.setAlpha(1);
    } catch (e) {
        console.error('Ошибка при создании игрока:', e);
        console.error(e.stack);
    }

    // Создание управления
    window.cursors = scene.input.keyboard.createCursorKeys();

    // Создание текста для счета и здоровья
    window.scoreText = scene.add.text(40, 40, 'Очки: 0', { fontSize: '36px', fill: '#fff' });
    window.healthText = scene.add.text(40, 100, 'Здоровье: 100', { fontSize: '36px', fill: '#fff' });
    window.gameOverText = scene.add.text(960, 540, 'ИГРА ОКОНЧЕНА', { 
        fontSize: '96px', 
        fill: '#ff0000',
        fontStyle: 'bold'
    });
    window.gameOverText.setOrigin(0.5);
    window.gameOverText.visible = false;
    
    // Создание текста для перезапуска игры
    window.restartText = scene.add.text(960, 660, 'Нажмите ПРОБЕЛ для новой игры', { 
        fontSize: '42px', 
        fill: '#ffffff',
        fontStyle: 'bold'
    });
    window.restartText.setOrigin(0.5);
    window.restartText.visible = false;

    // Добавление коллизий
    scene.physics.add.overlap(window.player, window.goodItems, collectGoodItem, null, scene);
    scene.physics.add.overlap(window.player, window.badItems, hitBadItem, null, scene);
    scene.physics.add.overlap(window.player, window.veryGoodItems, collectVeryGoodItem, null, scene);
    
    // Сохраняем ссылку на сцену в глобальной переменной
    window.gameScene = scene;
    
    // Добавляем кнопку возврата в меню
    createMenuButton(scene);
}
