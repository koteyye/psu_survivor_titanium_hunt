// Функции для работы с игровыми предметами
import { updateItemCollectionStats } from '../utils/levelUtils.js';
import { createExplosionAnimation } from '../utils/animationUtils.js';
import { ConfigManager, EventManager, AudioManager, ObjectPoolManager } from '../managers/index.js';

/**
 * Инициализация пулов предметов
 * @param {Phaser.Scene} scene - Сцена игры
 */
function initItemPools(scene) {
    // Получаем менеджеры
    const configManager = ConfigManager.getInstance();
    const objectPoolManager = ObjectPoolManager.getInstance();
    
    // Получаем конфигурации предметов
    const goodItemConfig = configManager.getValue('core', 'items.good', {});
    const badItemConfig = configManager.getValue('core', 'items.bad', {});
    const veryGoodItemConfig = configManager.getValue('core', 'items.veryGood', {});
    
    // Создаем пул хороших предметов
    objectPoolManager.createPool('goodItems', scene, 'goodItem', (item) => {
        setupItem(item, 'good');
    }, 20);
    
    // Создаем пул плохих предметов
    objectPoolManager.createPool('badItems', scene, 'badItem', (item) => {
        setupItem(item, 'bad');
    }, 20);
    
    // Создаем пул очень хороших предметов
    objectPoolManager.createPool('veryGoodItems', scene, 'veryGoodItem', (item) => {
        setupItem(item, 'veryGood');
    }, 10);
    
    // Создаем пул взрывов
    objectPoolManager.createPool('explosions', scene, 'explosion', (explosion) => {
        explosion.setDisplaySize(600, 600);
        explosion.setOrigin(0.5, 0.5);
        explosion.setFlipY(false);
    }, 5);
    
    // Создаем анимацию взрыва
    createExplosionAnimation(scene);
}

/**
 * Функция отскока от стены
 * @param {Phaser.Physics.Arcade.Sprite} item - Предмет
 * @param {Phaser.Physics.Arcade.Sprite} wall - Стена
 */
function bounceOffWall(item, wall) {
    // Просто отскакиваем, физика Arcade сама обрабатывает отскок
    // Можно добавить дополнительную логику при необходимости
}

/**
 * Функция настройки предмета
 * @param {Phaser.Physics.Arcade.Sprite} item - Предмет
 * @param {string} type - Тип предмета (good, bad, veryGood)
 * @returns {Phaser.Physics.Arcade.Sprite} Настроенный предмет
 */
function setupItem(item, type) {
    // Получаем менеджер конфигураций
    const configManager = ConfigManager.getInstance();
    
    // Получаем конфигурацию предмета
    const itemConfig = configManager.getValue('core', `items.${type}`, {});
    
    // Настраиваем размеры
    const displaySize = itemConfig.displaySize || { width: 150, height: 225 };
    const collisionSize = itemConfig.collisionSize || { width: 90, height: 135 };
    
    item.setDisplaySize(displaySize.width, displaySize.height);
    
    // Уменьшаем коллизионную область, но сохраняем визуальный размер
    const offsetX = (displaySize.width - collisionSize.width) / 2;
    const offsetY = (displaySize.height - collisionSize.height) / 2;
    
    item.setSize(collisionSize.width, collisionSize.height);
    item.setOffset(offsetX, offsetY);
    
    // Настраиваем физические свойства
    const velocityRange = itemConfig.velocityRange || { x: [-100, 100], y: [150, 250] };
    const angularVelocityRange = itemConfig.angularVelocityRange || [-100, 100];
    
    item.setVelocity(
        Phaser.Math.Between(velocityRange.x[0], velocityRange.x[1]),
        Phaser.Math.Between(velocityRange.y[0], velocityRange.y[1])
    );
    
    item.setAngularVelocity(Phaser.Math.Between(angularVelocityRange[0], angularVelocityRange[1]));
    item.setBounce(1, 0);
    item.itemText = null;
    
    return item;
}

/**
 * Функция создания объектов
 * @param {Phaser.Scene} scene - Сцена
 */
function spawnItems(scene) {
    // Получаем менеджеры
    const configManager = ConfigManager.getInstance();
    const objectPoolManager = ObjectPoolManager.getInstance();
    const eventManager = EventManager.getInstance();
    
    // Получаем конфигурацию предметов
    const itemsConfig = configManager.getValue('core', 'items', {});
    
    // Определяем позицию спавна
    const x = Phaser.Math.Between(100, 1820);
    
    // Определяем тип предмета на основе шансов из конфига
    const rand = Math.random();
    let itemType;
    let poolName;
    
    const badChance = itemsConfig.bad?.spawnChance || 0.5;
    const goodChance = itemsConfig.good?.spawnChance || 0.4;
    const veryGoodChance = itemsConfig.veryGood?.spawnChance || 0.1;
    
    // Нормализуем шансы
    const totalChance = badChance + goodChance + veryGoodChance;
    const normalizedBadChance = badChance / totalChance;
    const normalizedGoodChance = goodChance / totalChance;
    
    if (rand < normalizedBadChance) {
        itemType = 'bad';
        poolName = 'badItems';
    } else if (rand < normalizedBadChance + normalizedGoodChance) {
        itemType = 'good';
        poolName = 'goodItems';
    } else {
        itemType = 'veryGood';
        poolName = 'veryGoodItems';
    }
    
    // Получаем предмет из пула
    const item = objectPoolManager.get(poolName, x, 0);
    
    // Если не удалось получить предмет, выходим
    if (!item) return;
    
    // Настраиваем предмет
    setupItem(item, itemType);
    
    // Оповещаем о создании предмета через Event Bus
    eventManager.emit('ITEM_SPAWNED', { type: itemType, item });
}

/**
 * Настройка коллизий для предметов
 * @param {Phaser.Scene} scene - Сцена
 * @param {Phaser.Physics.Arcade.Sprite} player - Спрайт игрока
 * @param {Array} walls - Массив стен
 */
function setupItemCollisions(scene, player, walls) {
    // Получаем менеджеры
    const objectPoolManager = ObjectPoolManager.getInstance();
    
    // Получаем пулы предметов
    const goodItems = objectPoolManager.getPool('goodItems');
    const badItems = objectPoolManager.getPool('badItems');
    const veryGoodItems = objectPoolManager.getPool('veryGoodItems');
    
    // Если пулы не созданы, выходим
    if (!goodItems || !badItems || !veryGoodItems) return;
    
    // Настраиваем коллизии со стенами
    walls.forEach(wall => {
        scene.physics.add.collider(goodItems, wall, bounceOffWall, null, scene);
        scene.physics.add.collider(badItems, wall, bounceOffWall, null, scene);
        scene.physics.add.collider(veryGoodItems, wall, bounceOffWall, null, scene);
    });
    
    // Получаем персонажа из Registry
    const gameCharacter = scene.registry.get('gameCharacter');
    
    // Настраиваем перекрытия с игроком
    scene.physics.add.overlap(player, goodItems, (player, item) => {
        if (gameCharacter && gameCharacter.collectGoodItem) {
            gameCharacter.collectGoodItem(item);
        }
    }, null, scene);
    
    scene.physics.add.overlap(player, badItems, (player, item) => {
        if (gameCharacter && gameCharacter.hitBadItem) {
            gameCharacter.hitBadItem(item);
        }
    }, null, scene);
    
    scene.physics.add.overlap(player, veryGoodItems, (player, item) => {
        if (gameCharacter && gameCharacter.collectVeryGoodItem) {
            gameCharacter.collectVeryGoodItem(item);
        }
    }, null, scene);
}

/**
 * Очистка всех предметов
 * @param {Phaser.Scene} scene - Сцена
 */
function clearAllItems(scene) {
    // Получаем менеджер пулов объектов
    const objectPoolManager = ObjectPoolManager.getInstance();
    
    // Очищаем все пулы предметов
    objectPoolManager.clearPool('goodItems');
    objectPoolManager.clearPool('badItems');
    objectPoolManager.clearPool('veryGoodItems');
    objectPoolManager.clearPool('explosions');
}

// Экспортируем функции
export {
    initItemPools,
    bounceOffWall,
    spawnItems,
    setupItemCollisions,
    clearAllItems
};
