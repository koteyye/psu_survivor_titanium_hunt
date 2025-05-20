// Импортируем необходимые функции
import { createPlayerPlaceholder, createGoodItemPlaceholder, createBadItemPlaceholder, createVeryGoodItemPlaceholder, createExplosionPlaceholder } from '../utils/assetLoader.js';
import { bounceOffWall, collectGoodItem, collectVeryGoodItem, hitBadItem, spawnItems } from '../objects/items.js';
import { restartGame } from '../objects/player.js';

// Загрузка ресурсов
function preload() {
    // Отключаем кэширование для всех загрузок
    this.load.setCORS('anonymous');
    this.load.crossOrigin = 'anonymous';
    
    // Выводим информацию о начале загрузки
    console.log('Начинаем загрузку изображений...');
    
    // Загрузка изображений с принудительным обновлением
    const cacheBuster = Date.now();
    
    // Отключаем автоматическое создание заглушек
    this.load.setPath('assets/');
    
    // Пробуем загрузить изображение игрока
    try {
        console.log('Пытаемся загрузить player.png...');
        // Используем абсолютный путь для загрузки изображений
        this.load.image('player', `player.png?v=${cacheBuster}`);
    } catch (e) {
        console.error('Ошибка при попытке загрузить player:', e);
    }
    
    // Загружаем остальные изображения с абсолютными путями
    this.load.image('goodItem', `good_psu.png?v=${cacheBuster}`);
    this.load.image('badItem', `bad_psu.png?v=${cacheBuster}`);
    this.load.image('veryGoodItem', `very_good_psu.png?v=${cacheBuster}`);
    this.load.spritesheet('explosion', `explosion.png?v=${cacheBuster}`, { frameWidth: 190, frameHeight: 190 });
    this.load.image('background', `background.jpeg?v=${cacheBuster}`);
    
    // Загружаем звуки
    this.load.audio('backgroundMusic', 'sounds/background.wav');
    this.load.audio('explosionSound', 'sounds/explosion.wav');
    this.load.audio('nyamnyamSound', 'sounds/nyamnyam.wav');
    
    // Обработчики событий загрузки
    this.load.on('filecomplete', function(key, type, data) {
        console.log(`Успешно загружено: ${key}, тип: ${type}`);
        
        // Проверяем загруженное изображение
        if (this.textures.exists(key)) {
            const texture = this.textures.get(key);
            const source = texture.source[0];
            console.log(`Текстура ${key} загружена: ${source.width}x${source.height}`);
            
            // Отключаем создание заглушек для успешно загруженных изображений
            if (key === 'player') {
                console.log('Игрок успешно загружен, заглушка не нужна');
            }
        } else {
            console.warn(`Текстура ${key} не существует после загрузки!`);
        }
    }, this);
    
    this.load.on('loaderror', function(file) {
        console.error(`Ошибка загрузки файла: ${file.src}`);
        console.error(`Ключ файла: ${file.key}`);
        console.error(`Тип файла: ${file.type}`);
        
        // Создаем заглушки только если изображение не загрузилось
        if (file.key === 'player') {
            console.log('Создаем заглушку для игрока из-за ошибки загрузки');
            createPlayerPlaceholder(this);
        } else if (file.key === 'goodItem') {
            createGoodItemPlaceholder(this);
        } else if (file.key === 'badItem') {
            createBadItemPlaceholder(this);
        } else if (file.key === 'veryGoodItem') {
            createVeryGoodItemPlaceholder(this);
        } else if (file.key === 'explosion') {
            createExplosionPlaceholder(this);
        }
    }, this);
    
    // Добавляем обработчики для отслеживания процесса загрузки
    this.load.on('complete', function() {
        console.log('Все ресурсы загружены!');
        console.log('Доступные текстуры:', Object.keys(this.textures.list));
        
        // Проверяем все загруженные текстуры
        Object.keys(this.textures.list).forEach(key => {
            if (key !== '__DEFAULT' && key !== '__MISSING') {
                const texture = this.textures.get(key);
                const source = texture.source[0];
                console.log(`Текстура ${key}: ${source.width}x${source.height}`);
            }
        });
    }, this);
    
    this.load.on('start', function() {
        console.log('Начало загрузки ресурсов');
    });
    
    this.load.on('progress', function(value) {
        console.log(`Прогресс загрузки: ${Math.round(value * 100)}%`);
    });
}

// Создание игровых объектов
function create() {
    // Добавляем фоновое изображение
    this.add.image(400, 300, 'background').setDisplaySize(800, 600);
    
    // Добавляем и запускаем фоновую музыку
    window.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.3 });
    window.backgroundMusic.play();
    
    // Добавляем звуковые эффекты
    window.explosionSound = this.sound.add('explosionSound', { volume: 0.8 });
    window.nyamnyamSound = this.sound.add('nyamnyamSound', { volume: 0.8 });
    
    // Создание анимации взрыва
    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 16 }),
        frameRate: 20,
        repeat: 0
    });

    // Создание групп объектов
    window.goodItems = this.physics.add.group();
    window.badItems = this.physics.add.group();
    window.veryGoodItems = this.physics.add.group();
    window.explosions = this.physics.add.group();
    
    // Создаем невидимые стены по бокам
    const leftWall = this.physics.add.staticGroup();
    const rightWall = this.physics.add.staticGroup();
    
    // Добавляем стены
    leftWall.create(0, 300, 'player').setScale(0.1, 10).refreshBody().setVisible(false);
    rightWall.create(800, 300, 'player').setScale(0.1, 10).refreshBody().setVisible(false);
    
    // Настраиваем коллизии со стенами
    this.physics.add.collider(window.goodItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(window.goodItems, rightWall, bounceOffWall, null, this);
    this.physics.add.collider(window.badItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(window.badItems, rightWall, bounceOffWall, null, this);
    this.physics.add.collider(window.veryGoodItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(window.veryGoodItems, rightWall, bounceOffWall, null, this);

    // Создание игрока с принудительным отображением
    try {
        console.log('Начинаем создание игрока...');
        
        // Проверяем все доступные текстуры
        console.log('Доступные текстуры:', Object.keys(this.textures.list));
        
        // Проверяем текстуру игрока
        if (this.textures.exists('player')) {
            const source = this.textures.get('player').source[0];
            console.log('Текстура player существует!');
            console.log('Размеры текстуры player:', source.width, 'x', source.height);
            
            // Создаем спрайт игрока
            window.player = this.physics.add.sprite(400, 550, 'player');
            console.log('Спрайт игрока создан с текстурой player');
        } else {
            console.log('Текстура player НЕ существует, создаем заглушку');
            createPlayerPlaceholder(this);
            window.player = this.physics.add.sprite(400, 550, 'player');
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
    window.cursors = this.input.keyboard.createCursorKeys();

    // Создание текста для счета и здоровья
    window.scoreText = this.add.text(16, 16, 'Очки: 0', { fontSize: '24px', fill: '#fff' });
    window.healthText = this.add.text(16, 50, 'Здоровье: 100', { fontSize: '24px', fill: '#fff' });
    window.gameOverText = this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { 
        fontSize: '64px', 
        fill: '#ff0000',
        fontStyle: 'bold'
    });
    window.gameOverText.setOrigin(0.5);
    window.gameOverText.visible = false;
    
    // Создание текста для перезапуска игры
    window.restartText = this.add.text(400, 380, 'Нажмите ПРОБЕЛ для новой игры', { 
        fontSize: '24px', 
        fill: '#ffffff',
        fontStyle: 'bold'
    });
    window.restartText.setOrigin(0.5);
    window.restartText.visible = false;

    // Добавление коллизий
    this.physics.add.overlap(window.player, window.goodItems, collectGoodItem, null, this);
    this.physics.add.overlap(window.player, window.badItems, hitBadItem, null, this);
    this.physics.add.overlap(window.player, window.veryGoodItems, collectVeryGoodItem, null, this);
    
    // Сохраняем ссылку на сцену в глобальной переменной
    window.gameScene = this;
}

// Обновление игры
function update(time) {
    if (window.gameOver) {
        // Проверяем нажатие пробела для перезапуска игры
        if (window.cursors.space.isDown) {
            restartGame(this);
        }
        return;
    }

    // Управление игроком
    if (window.cursors.left.isDown) {
        window.player.setVelocityX(-300);
    } else if (window.cursors.right.isDown) {
        window.player.setVelocityX(300);
    } else {
        window.player.setVelocityX(0);
    }

    // Создание новых объектов
    if (time > window.itemSpawnTime) {
        spawnItems(this);
        window.itemSpawnTime = time + Phaser.Math.Between(500, 1500);
    }
    
    // Обновление позиции текста для всех объектов
    window.goodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    window.badItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    window.veryGoodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
}

// Экспортируем функции
export {
    preload,
    create,
    update
};
