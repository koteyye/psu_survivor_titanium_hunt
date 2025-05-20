// Функции для создания заглушек изображений
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

// Экспортируем функции
export {
    createPlayerPlaceholder,
    createGoodItemPlaceholder,
    createBadItemPlaceholder,
    createVeryGoodItemPlaceholder,
    createExplosionPlaceholder
};
