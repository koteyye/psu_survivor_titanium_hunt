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
    
    // Воспроизводим звук "ням-ням"
    window.nyamnyamSound.play();
    
    // Увеличиваем счет больше, чем за обычный хороший предмет
    window.score += 25;
    window.scoreText.setText('Очки: ' + window.score);
    
    // Восстанавливаем здоровье
    window.health = Math.min(window.health + 15, 100);
    window.healthText.setText('Здоровье: ' + window.health);
}

// Функция столкновения с плохим предметом
function hitBadItem(player, item) {
    item.disableBody(true, true);
    
    // Если у предмета есть текст, удаляем его
    if (item.itemText) {
        item.itemText.destroy();
    }
    
    // Воспроизводим звук взрыва
    window.explosionSound.play();
    
    // Создаем анимацию взрыва выше персонажа и переворачиваем ее
    const explosion = window.explosions.create(player.x, player.y - 100, 'explosion');
    explosion.setFlipY(true); // Переворачиваем взрыв
    explosion.setDepth(1000); // Устанавливаем высокий z-index, чтобы взрыв был поверх всех объектов
    explosion.play('explode');
    explosion.once('animationcomplete', () => {
        explosion.destroy();
    });
    
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
    const x = Phaser.Math.Between(50, 750);
    const itemType = Phaser.Math.Between(1, 10);
    
    if (itemType <= 5) {
        // 50% шанс плохого блока
        const badItem = window.badItems.create(x, 0, 'badItem');
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
        const goodItem = window.goodItems.create(x, 0, 'goodItem');
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
        const veryGoodItem = window.veryGoodItems.create(x, 0, 'veryGoodItem');
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

// Экспортируем функции
export {
    bounceOffWall,
    collectGoodItem,
    collectVeryGoodItem,
    hitBadItem,
    spawnItems
};
