// Функции для создания заглушек изображений
function createPlayerPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x3498db);
    graphics.fillRect(0, 0, 450, 450);
    graphics.generateTexture('player', 450, 450);
    graphics.destroy();
}

function createGoodItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x2ecc71);
    graphics.fillRect(0, 0, 400, 400);
    graphics.generateTexture('goodItem', 400, 400);
    graphics.destroy();
}

function createBadItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(0, 0, 400, 400);
    graphics.generateTexture('badItem', 400, 400);
    graphics.destroy();
}

function createVeryGoodItemPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xf1c40f);
    graphics.fillRect(0, 0, 400, 400);
    graphics.generateTexture('veryGoodItem', 400, 400);
    graphics.destroy();
}

function createExplosionPlaceholder(scene) {
    const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff9900);
    graphics.fillCircle(200, 200, 200); // Центр и радиус соответствуют размеру 400x400
    graphics.generateTexture('explosion', 400, 400);
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
