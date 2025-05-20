// Функции для работы с игровыми предметами

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
}

// Функция столкновения с плохим предметом
function hitBadItem(player, item) {
    // Сначала удаляем предмет и его текст
    if (item.active) {
        item.disableBody(true, true);
        
        // Если у предмета есть текст, удаляем его
        if (item.itemText) {
            item.itemText.destroy();
            item.itemText = null;
        }
        
        // Воспроизводим звук взрыва если звуки включены
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        if (soundEnabled && window.explosionSound) {
            try {
                window.explosionSound.play();
            } catch (e) {
                console.error('Ошибка воспроизведения звука взрыва:', e);
            }
        }
        
        try {
            // Создаем анимацию взрыва с улучшенной обработкой ошибок
            const scene = window.gameScene;
            if (scene) {
                console.log('Создаем взрыв...');
                
                // Проверяем наличие анимации
                if (scene.anims.exists('explode')) {
                    console.log('Анимация взрыва найдена');
                } else {
                    console.warn('Анимация взрыва не найдена, пытаемся создать заново');
                    try {
                        scene.anims.create({
                            key: 'explode',
                            frames: scene.anims.generateFrameNumbers('explosion', { start: 0, end: 15 }),
                            frameRate: 20,
                            repeat: 0
                        });
                        console.log('Анимация взрыва успешно создана');
                    } catch (animError) {
                        console.error('Ошибка при создании анимации взрыва:', animError);
                    }
                }
                
                // Ограничиваем позицию взрыва, чтобы он всегда был в пределах экрана
                const explosionY = Math.max(100, player.y - 100);
                
                // Создаем спрайт взрыва
                const explosion = window.explosions.create(player.x, explosionY, 'explosion');
                explosion.setFlipY(true); // Переворачиваем взрыв
                explosion.setDepth(1000); // Устанавливаем высокий z-index
                
                // Выводим информацию о спрайте
                console.log('Спрайт взрыва создан:', explosion);
                console.log('Размеры спрайта взрыва:', explosion.width, 'x', explosion.height);
                console.log('Видимость спрайта взрыва:', explosion.visible);
                
                // Устанавливаем размер спрайта взрыва (немного больше, чем размер кадра)
                explosion.setDisplaySize(350, 350);
                
                // Принудительно делаем спрайт видимым
                explosion.setVisible(true);
                explosion.setAlpha(1);
                
                // Запускаем анимацию
                try {
                    explosion.play('explode');
                    console.log('Анимация взрыва запущена');
                } catch (playError) {
                    console.error('Ошибка при запуске анимации взрыва:', playError);
                }
                
                // Устанавливаем таймер для гарантированного удаления спрайта
                scene.time.delayedCall(1000, () => {
                    if (explosion && explosion.active) {
                        explosion.destroy();
                        console.log('Спрайт взрыва удален по таймеру');
                    }
                });
                
                // Также добавляем обработчик завершения анимации
                explosion.once('animationcomplete', () => {
                    console.log('Анимация взрыва завершена');
                    if (explosion && explosion.active) {
                        explosion.destroy();
                        console.log('Спрайт взрыва удален после завершения анимации');
                    }
                });
            } else {
                console.warn('Сцена не найдена');
            }
        } catch (e) {
            console.error('Ошибка создания эффекта взрыва:', e);
            console.error(e.stack);
        }
    }
    
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

// Функция создания объектов
function spawnItems(scene) {
    const x = Phaser.Math.Between(100, 1820);
    const itemType = Phaser.Math.Between(1, 10);
    
    if (itemType <= 5) {
        // 50% шанс плохого блока
        const badItem = window.badItems.create(x, 0, 'badItem');
        badItem.setScale(0.8);
        // Уменьшаем коллизионную область, но сохраняем визуальный размер
        // Получаем размеры текстуры
        const textureWidth = badItem.width;
        const textureHeight = badItem.height;
        // Устанавливаем коллизионную область на 60% от размера текстуры
        const collisionWidth = textureWidth * 0.6;
        const collisionHeight = textureHeight * 0.6;
        // Устанавливаем смещение, чтобы коллизионная область была по центру
        const offsetX = (textureWidth - collisionWidth) / 2;
        const offsetY = (textureHeight - collisionHeight) / 2;
        badItem.setSize(collisionWidth, collisionHeight);
        badItem.setOffset(offsetX, offsetY);
        
        badItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        badItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        badItem.setBounce(1, 0);
        // Не добавляем текст над блоком
        badItem.itemText = null;
        // Нет необходимости обновлять позицию текста
        badItem.update = function() {
            // Пустая функция обновления
        }
    } else if (itemType <= 9) {
        // 40% шанс хорошего блока
        const goodItem = window.goodItems.create(x, 0, 'goodItem');
        goodItem.setScale(0.8);
        // Уменьшаем коллизионную область, но сохраняем визуальный размер
        // Получаем размеры текстуры
        const textureWidth = goodItem.width;
        const textureHeight = goodItem.height;
        // Устанавливаем коллизионную область на 60% от размера текстуры
        const collisionWidth = textureWidth * 0.6;
        const collisionHeight = textureHeight * 0.6;
        // Устанавливаем смещение, чтобы коллизионная область была по центру
        const offsetX = (textureWidth - collisionWidth) / 2;
        const offsetY = (textureHeight - collisionHeight) / 2;
        goodItem.setSize(collisionWidth, collisionHeight);
        goodItem.setOffset(offsetX, offsetY);
        
        goodItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        goodItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        goodItem.setBounce(1, 0);
        // Не добавляем текст над блоком
        goodItem.itemText = null;
        // Нет необходимости обновлять позицию текста
        goodItem.update = function() {
            // Пустая функция обновления
        }
    } else {
        // 10% шанс очень хорошего блока
        const veryGoodItem = window.veryGoodItems.create(x, 0, 'veryGoodItem');
        veryGoodItem.setScale(0.8);
        // Уменьшаем коллизионную область, но сохраняем визуальный размер
        // Получаем размеры текстуры
        const textureWidth = veryGoodItem.width;
        const textureHeight = veryGoodItem.height;
        // Устанавливаем коллизионную область на 60% от размера текстуры
        const collisionWidth = textureWidth * 0.6;
        const collisionHeight = textureHeight * 0.6;
        // Устанавливаем смещение, чтобы коллизионная область была по центру
        const offsetX = (textureWidth - collisionWidth) / 2;
        const offsetY = (textureHeight - collisionHeight) / 2;
        veryGoodItem.setSize(collisionWidth, collisionHeight);
        veryGoodItem.setOffset(offsetX, offsetY);
        
        veryGoodItem.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(150, 250));
        veryGoodItem.setAngularVelocity(Phaser.Math.Between(-100, 100));
        // Устанавливаем отскок для коллизий
        veryGoodItem.setBounce(1, 0);
        // Не добавляем текст над блоком
        veryGoodItem.itemText = null;
        // Нет необходимости обновлять позицию текста
        veryGoodItem.update = function() {
            // Пустая функция обновления
        }
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
