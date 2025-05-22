// Функции для работы с игровыми предметами
import { updateItemCollectionStats } from '../utils/levelUtils.js';

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
    window.score += 10;
    window.scoreText.setText('Очки: ' + window.score);
    
    // Обновляем статистику собранных предметов для достижений
    updateItemCollectionStats('good');
}

// Функция сбора очень хорошего предмета
function collectVeryGoodItem(player, item) {
    item.disableBody(true, true);
    
    // Если у предмета есть текст, удаляем его
    if (item.itemText) {
        item.itemText.destroy();
    }
    
    // Воспроизводим звук "ням-ням" если звуки включены
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundEnabled && window.nyamnyamSound) {
        window.nyamnyamSound.play();
    }
    
    // Увеличиваем счет больше, чем за обычный хороший предмет
    window.score += 25;
    window.scoreText.setText('Очки: ' + window.score);
    
    // Восстанавливаем здоровье
    window.health = Math.min(window.health + 15, 100);
    window.healthText.setText('Здоровье: ' + window.health);
    
    // Обновляем статистику собранных предметов для достижений
    updateItemCollectionStats('veryGood');
}

// Функция создания эффекта взрыва
function createExplosionEffect(scene, x, y) {
    if (!scene) {
        console.warn('Сцена не найдена');
        return null;
    }
    
    // Проверяем и создаем анимацию при необходимости
    if (!scene.anims.exists('explode')) {
        try {
            scene.anims.create({
                key: 'explode',
                frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
                frameRate: 20,
                repeat: 0
            });
        } catch (error) {
            console.error('Ошибка при создании анимации взрыва:', error);
            return null;
        }
    }
    
    // Ограничиваем позицию взрыва
    const safeY = Math.max(100, y - 100);
    
    // Создаем спрайт взрыва
    const explosion = window.explosions.create(x, safeY, 'explosion');
    
    // Настраиваем спрайт
    explosion.setFlipY(true)
             .setDepth(1000)
             .setDisplaySize(350, 350)
             .setVisible(true)
             .setAlpha(1);
    
    // Запускаем анимацию
    try {
        explosion.play('explode');
    } catch (error) {
        console.error('Ошибка при запуске анимации взрыва:', error);
    }
    
    // Настраиваем автоматическое удаление
    scene.time.delayedCall(1000, () => {
        if (explosion && explosion.active) {
            explosion.destroy();
        }
    });
    
    // Добавляем обработчик завершения анимации
    explosion.once('animationcomplete', () => {
        if (explosion && explosion.active) {
            explosion.destroy();
        }
    });
    
    return explosion;
}

// Функция воспроизведения звука
function playSound(sound) {
    if (!sound) return;
    
    const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    if (soundEnabled) {
        try {
            sound.play();
        } catch (error) {
            console.error('Ошибка воспроизведения звука:', error);
        }
    }
}

// Функция столкновения с плохим предметом
function hitBadItem(player, item) {
    // Проверяем активность предмета
    if (!item.active) return;
    
    // Удаляем предмет
    item.disableBody(true, true);
    
    // Удаляем текст предмета, если есть
    if (item.itemText) {
        item.itemText.destroy();
        item.itemText = null;
    }
    
    // Воспроизводим звук взрыва
    playSound(window.explosionSound);
    
    // Создаем эффект взрыва
    createExplosionEffect(window.gameScene, player.x, player.y);
    
    // Уменьшаем здоровье
    window.health -= 20;
    window.healthText.setText('Здоровье: ' + window.health);
    
    // Проверяем, не закончилась ли игра
    if (window.health <= 0) {
        window.gameOver = true;
        player.setTint(0xff0000);
        window.gameOverText.visible = true;
        window.restartText.visible = true;
    }
}

// Функция настройки предмета
function setupItem(item) {
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

// Функция создания объектов
function spawnItems(scene) {
    const x = Phaser.Math.Between(100, 1820);
    const itemType = Phaser.Math.Between(1, 10);
    
    let item;
    
    if (itemType <= 5) {
        // 50% шанс плохого блока
        item = setupItem(window.badItems.create(x, 0, 'badItem'));
    } else if (itemType <= 9) {
        // 40% шанс хорошего блока
        item = setupItem(window.goodItems.create(x, 0, 'goodItem'));
    } else {
        // 10% шанс очень хорошего блока
        item = setupItem(window.veryGoodItems.create(x, 0, 'veryGoodItem'));
    }
}

// Экспортируем функции
export {
    bounceOffWall,
    collectGoodItem,
    collectVeryGoodItem,
    hitBadItem,
    spawnItems
};
