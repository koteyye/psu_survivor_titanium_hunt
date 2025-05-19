// Конфигурация игры
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Глобальные переменные
let player;
let goodItems;
let badItems;
let veryGoodItems;
let cursors;
let scoreText;
let healthText;
let gameOverText;
let restartText;
let score = 0;
let health = 100;
let gameOver = false;
let itemSpawnTime = 0;
let explosions;
let backgroundMusic;
let explosionSound;
let nyamnyamSound;

// Создание игры
const game = new Phaser.Game(config);

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

// Создание заглушек для изображений
function createPlayerPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x3498db);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture('player', 64, 64);
    graphics.destroy();
}

function createGoodItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2ecc71);
    graphics.fillRect(0, 0, 48, 48);
    graphics.generateTexture('goodItem', 48, 48);
    graphics.destroy();
}

function createBadItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(0, 0, 48, 48);
    graphics.generateTexture('badItem', 48, 48);
    graphics.destroy();
}

function createVeryGoodItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xf1c40f);
    graphics.fillRect(0, 0, 48, 48);
    graphics.generateTexture('veryGoodItem', 48, 48);
    graphics.destroy();
}

function createExplosionPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff9900);
    graphics.fillCircle(95, 95, 95); // Центр и радиус соответствуют размеру 190x190
    graphics.generateTexture('explosion', 190, 190);
    graphics.destroy();
}

// Создание игровых объектов
function create() {
    // Добавляем фоновое изображение
    this.add.image(400, 300, 'background').setDisplaySize(800, 600);
    
    // Добавляем и запускаем фоновую музыку
    backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.3 });
    backgroundMusic.play();
    
    // Добавляем звуковые эффекты
    explosionSound = this.sound.add('explosionSound', { volume: 0.8 });
    nyamnyamSound = this.sound.add('nyamnyamSound', { volume: 0.8 });
    
    // Создание анимации взрыва
    this.anims.create({
        key: 'explode',
        frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 16 }),
        frameRate: 20,
        repeat: 0
    });

    // Создание групп объектов
    goodItems = this.physics.add.group();
    badItems = this.physics.add.group();
    veryGoodItems = this.physics.add.group();
    explosions = this.physics.add.group();
    
    // Создаем невидимые стены по бокам
    const leftWall = this.physics.add.staticGroup();
    const rightWall = this.physics.add.staticGroup();
    
    // Добавляем стены
    leftWall.create(0, 300, 'player').setScale(0.1, 10).refreshBody().setVisible(false);
    rightWall.create(800, 300, 'player').setScale(0.1, 10).refreshBody().setVisible(false);
    
    // Настраиваем коллизии со стенами
    this.physics.add.collider(goodItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(goodItems, rightWall, bounceOffWall, null, this);
    this.physics.add.collider(badItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(badItems, rightWall, bounceOffWall, null, this);
    this.physics.add.collider(veryGoodItems, leftWall, bounceOffWall, null, this);
    this.physics.add.collider(veryGoodItems, rightWall, bounceOffWall, null, this);

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
            player = this.physics.add.sprite(400, 550, 'player');
            console.log('Спрайт игрока создан с текстурой player');
        } else {
            console.log('Текстура player НЕ существует, создаем заглушку');
            createPlayerPlaceholder(this);
            player = this.physics.add.sprite(400, 550, 'player');
        }
        
        // Настраиваем спрайт игрока
        player.setCollideWorldBounds(true);
        player.setScale(0.8);
        
        // Выводим информацию о спрайте
        console.log('Размеры спрайта игрока:', player.width, 'x', player.height);
        console.log('Видимость спрайта игрока:', player.visible);
        
        // Принудительно делаем спрайт видимым и устанавливаем прозрачность
        player.setVisible(true);
        player.setAlpha(1);
    } catch (e) {
        console.error('Ошибка при создании игрока:', e);
        console.error(e.stack);
    }

    // Создание управления
    cursors = this.input.keyboard.createCursorKeys();

    // Создание текста для счета и здоровья
    scoreText = this.add.text(16, 16, 'Очки: 0', { fontSize: '24px', fill: '#fff' });
    healthText = this.add.text(16, 50, 'Здоровье: 100', { fontSize: '24px', fill: '#fff' });
    gameOverText = this.add.text(400, 300, 'ИГРА ОКОНЧЕНА', { 
        fontSize: '64px', 
        fill: '#ff0000',
        fontStyle: 'bold'
    });
    gameOverText.setOrigin(0.5);
    gameOverText.visible = false;
    
    // Создание текста для перезапуска игры
    restartText = this.add.text(400, 380, 'Нажмите ПРОБЕЛ для новой игры', { 
        fontSize: '24px', 
        fill: '#ffffff',
        fontStyle: 'bold'
    });
    restartText.setOrigin(0.5);
    restartText.visible = false;

    // Добавление коллизий
    this.physics.add.overlap(player, goodItems, collectGoodItem, null, this);
    this.physics.add.overlap(player, badItems, hitBadItem, null, this);
    this.physics.add.overlap(player, veryGoodItems, collectVeryGoodItem, null, this);
    
    // Сохраняем ссылку на сцену в глобальной переменной
    window.gameScene = this;
}

// Обновление игры
function update(time) {
    if (gameOver) {
        // Проверяем нажатие пробела для перезапуска игры
        if (cursors.space.isDown) {
            restartGame(this);
        }
        return;
    }

    // Управление игроком
    if (cursors.left.isDown) {
        player.setVelocityX(-300);
    } else if (cursors.right.isDown) {
        player.setVelocityX(300);
    } else {
        player.setVelocityX(0);
    }

    // Создание новых объектов
    if (time > itemSpawnTime) {
        spawnItems(this);
        itemSpawnTime = time + Phaser.Math.Between(500, 1500);
    }
    
    // Обновление позиции текста для всех объектов
    goodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    badItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
    
    veryGoodItems.getChildren().forEach(item => {
        if (item.update) item.update();
    });
}

// Функция отскока от стены
function bounceOffWall(item, wall) {
    // Просто отскакиваем, физика Arcade сама обрабатывает отскок
    // Можно добавить дополнительную логику при необходимости
}

// Функция сбора хорошего предмета
function collectGoodItem(player, item) {
    item.disableBody(true, true);
    
    // Если у предмета есть текст, удаляем его
    if (item.itemText) {
        item.itemText.destroy();
    }
    
    // Увеличиваем счет
    score += 10;
    scoreText.setText('Очки: ' + score);
}

// Функция сбора очень хорошего предмета
function collectVeryGoodItem(player, item) {
    item.disableBody(true, true);
    
    // Если у предмета есть текст, удаляем его
    if (item.itemText) {
        item.itemText.destroy();
    }
    
    // Воспроизводим звук "ням-ням"
    nyamnyamSound.play();
    
    // Увеличиваем счет больше, чем за обычный хороший предмет
    score += 25;
    scoreText.setText('Очки: ' + score);
    
    // Восстанавливаем здоровье
    health = Math.min(health + 15, 100);
    healthText.setText('Здоровье: ' + health);
}

// Функция столкновения с плохим предметом
function hitBadItem(player, item) {
    item.disableBody(true, true);
    
    // Если у предмета есть текст, удаляем его
    if (item.itemText) {
        item.itemText.destroy();
    }
    
    // Воспроизводим звук взрыва
    explosionSound.play();
    
    // Создаем анимацию взрыва выше персонажа и переворачиваем ее
    const explosion = explosions.create(player.x, player.y - 100, 'explosion');
    explosion.setFlipY(true); // Переворачиваем взрыв
    explosion.setDepth(1000); // Устанавливаем высокий z-index, чтобы взрыв был поверх всех объектов
    explosion.play('explode');
    explosion.once('animationcomplete', () => {
        explosion.destroy();
    });
    
    // Уменьшаем здоровье
    health -= 20;
    healthText.setText('Здоровье: ' + health);
    
    // Проверяем, не закончилась ли игра
    if (health <= 0) {
        gameOver = true;
        player.setTint(0xff0000);
        gameOverText.visible = true;
        restartText.visible = true;
    }
}

// Функция перезапуска игры
function restartGame(scene) {
    // Сбрасываем переменные
    score = 0;
    health = 100;
    gameOver = false;
    
    // Обновляем текст
    scoreText.setText('Очки: 0');
    healthText.setText('Здоровье: 100');
    gameOverText.visible = false;
    restartText.visible = false;
    
    // Восстанавливаем игрока
    player.clearTint();
    player.setPosition(400, 550);
    
    // Очищаем все предметы
    goodItems.clear(true, true);
    badItems.clear(true, true);
    veryGoodItems.clear(true, true);
    explosions.clear(true, true);
    
    // Перезапускаем фоновую музыку, если она остановлена
    if (!backgroundMusic.isPlaying) {
        backgroundMusic.play();
    }
}

// Функция создания объектов
function spawnItems(scene) {
    const x = Phaser.Math.Between(50, 750);
    const itemType = Phaser.Math.Between(1, 10);
    
    if (itemType <= 5) {
        // 50% шанс плохого блока
        const badItem = badItems.create(x, 0, 'badItem');
        badItem.setScale(0.8);
        badItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        badItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        badItem.setBounce(1, 0);
        // Добавляем текст "kcas" над блоком
        const badText = scene.add.text(badItem.x, badItem.y - 20, 'kcas', { fontSize: '16px', fill: '#ff0000' });
        badText.setOrigin(0.5);
        // Сохраняем ссылку на текст в самом блоке
        badItem.itemText = badText;
        // Обновляем позицию текста вместе с блоком
        badItem.update = function() {
            if (this.itemText) {
                this.itemText.x = this.x;
                this.itemText.y = this.y - 30;
                // Удаляем текст, если блок исчезает
                if (!this.active) {
                    badText.destroy();
                }
            }
        }
    } else if (itemType <= 9) {
        // 40% шанс хорошего блока
        const goodItem = goodItems.create(x, 0, 'goodItem');
        goodItem.setScale(0.8);
        goodItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        goodItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        goodItem.setBounce(1, 0);
        // Добавляем текст "good" над блоком
        const goodText = scene.add.text(goodItem.x, goodItem.y - 20, 'good', { fontSize: '16px', fill: '#00ff00' });
        goodText.setOrigin(0.5);
        // Сохраняем ссылку на текст в самом блоке
        goodItem.itemText = goodText;
        // Обновляем позицию текста вместе с блоком
        goodItem.update = function() {
            if (this.itemText) {
                this.itemText.x = this.x;
                this.itemText.y = this.y - 30;
                // Удаляем текст, если блок исчезает
                if (!this.active) {
                    goodText.destroy();
                }
            }
        }
    } else {
        // 10% шанс очень хорошего блока
        const veryGoodItem = veryGoodItems.create(x, 0, 'veryGoodItem');
        veryGoodItem.setScale(0.8);
        veryGoodItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        veryGoodItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        veryGoodItem.setBounce(1, 0);
        // Добавляем текст "titanium" над блоком
        const veryGoodText = scene.add.text(veryGoodItem.x, veryGoodItem.y - 20, 'titanium', { fontSize: '16px', fill: '#ffff00' });
        veryGoodText.setOrigin(0.5);
        // Сохраняем ссылку на текст в самом блоке
        veryGoodItem.itemText = veryGoodText;
        // Обновляем позицию текста вместе с блоком
        veryGoodItem.update = function() {
            if (this.itemText) {
                this.itemText.x = this.x;
                this.itemText.y = this.y - 30;
                // Удаляем текст, если блок исчезает
                if (!this.active) {
                    veryGoodText.destroy();
                }
            }
        }
    }
}
