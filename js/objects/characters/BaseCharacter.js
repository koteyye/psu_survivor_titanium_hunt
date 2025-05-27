// Базовый класс для всех персонажей игры
export class BaseCharacter {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.texture = texture;
        
        // Создаем спрайт персонажа
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDisplaySize(200, 300);
        
        // Базовые характеристики
        this.speed = 2;
        this.moneyMultiplier = 1.0;
        this.healthBonus = 0;
        this.damageReduction = 0;
        
        // Звуки персонажа
        this.sounds = {
            select: null,
            bad_psu_1: null,
            bad_psu_2: null,
            super_psu_1: null,
            super_psu_2: null,
            dead: null
        };
        
        // Инициализируем звуки
        this.initSounds();
        
        // Сохраняем ссылку на персонажа в спрайте для доступа в коллбэках
        this.sprite.character = this;
        
        // Делаем спрайт доступным глобально (для совместимости со старым кодом)
        window.player = this.sprite;
    }
    
    // Инициализация звуков персонажа
    initSounds() {
        const characterId = this.getCharacterId();
        
        // Загружаем звуки, если они еще не загружены
        try {
            this.sounds.select = this.scene.sound.add(`gameplay/replicas/${characterId}/select`, { volume: 0.8 });
            this.sounds.bad_psu_1 = this.scene.sound.add(`gameplay/replicas/${characterId}/bad_psu_1`, { volume: 0.8 });
            this.sounds.bad_psu_2 = this.scene.sound.add(`gameplay/replicas/${characterId}/bad_psu_2`, { volume: 0.8 });
            this.sounds.super_psu_1 = this.scene.sound.add(`gameplay/replicas/${characterId}/super_psu_1`, { volume: 0.8 });
            this.sounds.super_psu_2 = this.scene.sound.add(`gameplay/replicas/${characterId}/super_psu_2`, { volume: 0.8 });
            this.sounds.dead = this.scene.sound.add(`gameplay/replicas/${characterId}/dead`, { volume: 0.8 });
            console.log(`Звуки для персонажа ${characterId} успешно загружены`);
        } catch (error) {
            console.error(`Ошибка при загрузке звуков для персонажа ${characterId}:`, error);
        }
    }
    
    // Получение ID персонажа (переопределяется в дочерних классах)
    getCharacterId() {
        return 'base';
    }
    
    // Воспроизведение звука выбора персонажа
    playSelectSound() {
        this.playSound(this.sounds.select);
    }
    
    // Воспроизведение звука при сборе плохого блока питания
    playBadPsuSound() {
        // Воспроизводим с шансом 20%
        if (Math.random() < 0.2) {
            // Случайно выбираем между двумя репликами
            const sound = Math.random() < 0.5 ? this.sounds.bad_psu_1 : this.sounds.bad_psu_2;
            this.playSound(sound);
        }
    }
    
    // Воспроизведение звука при сборе супер блока питания
    playSuperPsuSound() {
        // Воспроизводим с шансом 70%
        if (Math.random() < 0.7) {
            // Случайно выбираем между двумя репликами
            const sound = Math.random() < 0.5 ? this.sounds.super_psu_1 : this.sounds.super_psu_2;
            this.playSound(sound);
        }
    }
    
    // Воспроизведение звука при смерти
    playDeadSound() {
        this.playSound(this.sounds.dead);
    }
    
    // Общий метод воспроизведения звука с проверкой настроек
    playSound(sound) {
        if (!sound) return;
        
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        if (soundEnabled) {
            try {
                sound.play();
            } catch (error) {
                console.error('Ошибка воспроизведения звука:', error);
                console.error('Звук:', sound);
            }
        }
    }
    
    // Обработка сбора хорошего предмета
    collectGoodItem(item) {
        item.disableBody(true, true);
        
        // Базовые очки за предмет
        let points = 10;
        
        // Применяем множитель денег
        points = Math.floor(points * this.moneyMultiplier);
        
        // Увеличиваем счет
        window.score += points;
        
        // Обновляем UI
        if (window.scoreText) {
            window.scoreText.setText('Очки: ' + window.score);
        }
    }
    
    // Обработка сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        item.disableBody(true, true);
        
        // Звук "нямням" больше не используется
        
        // Проигрываем реплику персонажа с шансом 70%
        this.playSuperPsuSound();
        
        // Базовые очки и здоровье за предмет
        let points = 20;
        let healthBonus = 10 + this.healthBonus;
        
        // Применяем множитель денег
        points = Math.floor(points * this.moneyMultiplier);
        
        // Увеличиваем счет и здоровье
        window.score += points;
        window.health = Math.min(window.health + healthBonus, 100);
        
        // Обновляем UI
        if (window.scoreText) {
            window.scoreText.setText('Очки: ' + window.score);
        }
        
        // Обновляем UI здоровья через функцию updateGameUI
        if (window.gameScene) {
            updateGameUI(window.gameScene);
        }
    }
    
    // Обработка столкновения с плохим предметом
    hitBadItem(item) {
        item.disableBody(true, true);
        
        // Создаем анимацию взрыва
        const explosion = window.explosions.create(item.x, item.y, 'explosion');
        explosion.setDisplaySize(600, 600);
        explosion.setOrigin(0.5, 0.5);
        explosion.setFlipY(false);
        explosion.anims.play('explode');
        
        // Проигрываем звук взрыва
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        if (soundEnabled && window.explosionSound) {
            try {
                window.explosionSound.play();
            } catch (error) {
                console.error('Ошибка при воспроизведении звука взрыва:', error);
            }
        }
        
        // Проигрываем реплику персонажа с шансом 20%
        this.playBadPsuSound();
        
        // Базовый урон с учетом уменьшения урона персонажа
        let damage = Math.max(5, 20 - this.damageReduction);
        
        // Уменьшаем здоровье
        window.health -= damage;
        
        // Обновляем UI здоровья через функцию updateGameUI
        if (window.gameScene) {
            updateGameUI(window.gameScene);
        }
        
        // Проверяем, не закончилась ли игра
        if (window.health <= 0) {
            window.health = 0;
            window.gameOver = true;
            
            // Проигрываем реплику смерти
            this.playDeadSound();
            
            // Показываем UI окончания игры
            if (window.gameScene) {
                showGameOverUI(window.gameScene);
            }
            
            // Останавливаем игру
            this.scene.physics.pause();
            this.sprite.setTint(0xff0000);
        }
        
        // Удаляем взрыв после окончания анимации
        explosion.on('animationcomplete', function() {
            explosion.destroy();
        });
    }
    
    // Обновление движения персонажа
    update() {
        // Базовая скорость движения
        const baseSpeed = 400;
        
        // Применяем множитель скорости персонажа
        const moveSpeed = baseSpeed * this.speed;
        
        // Сбрасываем скорость
        this.sprite.setVelocity(0);
        
        // Обрабатываем нажатия клавиш
        if (window.cursors.left.isDown) {
            this.sprite.setVelocityX(-moveSpeed);
        } else if (window.cursors.right.isDown) {
            this.sprite.setVelocityX(moveSpeed);
        }
    }
}

// Импортируем функции для обновления UI
import { updateGameUI, showGameOverUI } from '../../scenes/base/GameLevelUI.js';