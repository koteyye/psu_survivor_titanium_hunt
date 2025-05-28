// Класс персонажа "Вован - Алиэксперсс"
import { BaseCharacter } from './BaseCharacter.js';
import { updateGameUI, showGameOverUI } from '../../scenes/base/GameLevelUI.js';
import { CyberBar } from '../../ui/index.js';

export class ZummerCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'zummer');
        
        // Особые характеристики Вована
        this.damageReduction = 5;  // Получает меньше урона
        this.rageMode = false;     // Режим ярости
        this.rageMeter = 0;        // Счетчик ярости
        this.rageBar = null;       // Полоса ярости
        this.rageDecayTimer = null; // Таймер для снижения ярости
        this.rageDamageTimer = null; // Таймер для получения урона в режиме ярости
        this.badItemExplosionChance = 0.05; // Шанс взрыва плохого блока (5%)
        this.canHeal = false; // Запрет на восстановление здоровья
        
        // Проверяем, загружена ли иконка ярости
        if (this.scene.textures.exists('rageIcon')) {
            // Создаем полосу ярости
            this.createRageBar();
        } else {
            console.warn('Текстура rageIcon не найдена, полоса ярости не будет отображаться');
        }
        
        // Запускаем таймер снижения ярости
        this.startRageDecay();
    }
    
    getCharacterId() {
        return 'zoomer';
    }
    
    // Создание полосы ярости
    createRageBar() {
        // Создаем шкалу ярости с помощью CyberBar
        this.rageBar = new CyberBar(
            this.scene,
            300,
            150, // Изменено с 200 на 140, чтобы было ближе к шкале здоровья (которая на 100)
            this.rageMeter,
            {
                width: 400,
                height: 30,
                iconKey: 'rageIcon',
                barColor: 0xff6600, // Оранжевый цвет
                showValue: false // Убираем значение в процентах
            }
        );
    }
    
    // Обновление полосы ярости
    updateRageBar() {
        if (!this.rageBar) return;
        
        // Обновляем значение шкалы ярости
        this.rageBar.setValue(this.rageMeter);
        
        // Если ярость достигла 100%, активируем режим ярости
        if (this.rageMeter >= 100 && !this.rageMode) {
            this.activateRageMode();
        }
    }
    
    // Активация режима ярости
    activateRageMode() {
        this.rageMode = true;
        
        // Визуальный эффект
        this.sprite.setTint(0xff4444);
        
        // Создаем затемненный красный слой поверх всего экрана
        const gameWidth = this.scene.cameras.main.width;
        const gameHeight = this.scene.cameras.main.height;
        
        // Создаем красный полупрозрачный прямоугольник
        this.rageOverlay = this.scene.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0xff0000,
            0.3 // Полупрозрачность
        );
        
        // Устанавливаем высокий z-index, чтобы слой был поверх всего
        this.rageOverlay.setDepth(1000);
        
        // Создаем эффект активации
        const rageText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 50,
            'РЕЖИМ БЕШЕНСТВА!',
            {
                fontSize: '32px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Анимация текста
        this.scene.tweens.add({
            targets: rageText,
            y: rageText.y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                rageText.destroy();
            }
        });
        
        // Останавливаем таймер снижения ярости
        if (this.rageDecayTimer) {
            this.rageDecayTimer.remove();
            this.rageDecayTimer = null;
        }
        
        // Создаем таймер для получения урона каждую секунду
        this.rageDamageTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                window.health -= 5;
                
                // Обновляем UI здоровья
                if (window.gameScene) {
                    updateGameUI(window.gameScene);
                }
                
                // Проверяем, не закончилась ли игра
                if (window.health <= 0) {
                    this.deactivateRageMode();
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
            },
            callbackScope: this,
            loop: true
        });
        
        // Таймер деактивации режима ярости (5 секунд)
        this.scene.time.delayedCall(5000, () => {
            this.deactivateRageMode();
        });
    }
    
    // Деактивация режима ярости
    deactivateRageMode() {
        this.rageMode = false;
        this.rageMeter = 0;
        this.updateRageBar();
        
        // Убираем визуальный эффект
        this.sprite.clearTint();
        
        // Убираем красный слой
        if (this.rageOverlay) {
            this.rageOverlay.destroy();
            this.rageOverlay = null;
        }
        
        // Останавливаем таймер получения урона
        if (this.rageDamageTimer) {
            this.rageDamageTimer.remove();
            this.rageDamageTimer = null;
        }
        
        // Запускаем таймер снижения ярости
        this.startRageDecay();
    }
    
    // Запуск таймера снижения ярости
    startRageDecay() {
        // Если таймер уже запущен, останавливаем его
        if (this.rageDecayTimer) {
            this.rageDecayTimer.remove();
        }
        
        // Создаем новый таймер для снижения ярости каждую секунду
        this.rageDecayTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.rageMode && this.rageMeter > 0) {
                    this.rageMeter = Math.max(0, this.rageMeter - 5);
                    this.updateRageBar();
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // Переопределяем метод сбора хорошего предмета
    collectGoodItem(item) {
        if (this.rageMode) {
            // В режиме ярости получаем урон и не получаем очки
            item.disableBody(true, true);
            window.health -= 10;
            
            // Обновляем UI здоровья
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
        } else {
            // Сохраняем оригинальное значение множителя денег
            const originalMoneyMultiplier = this.moneyMultiplier;
            
            // Устанавливаем множитель для получения 15 очков
            this.moneyMultiplier = 1.5;
            
            // Вызываем базовый метод
            super.collectGoodItem(item);
            
            // Восстанавливаем оригинальное значение
            this.moneyMultiplier = originalMoneyMultiplier;
            
            // Увеличиваем ярость
            this.increaseRage(10);
        }
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        if (this.rageMode) {
            // В режиме ярости получаем урон и не получаем очки
            item.disableBody(true, true);
            window.health -= 5;
            
            // Обновляем UI здоровья
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
        } else {
            // Сохраняем оригинальные значения
            const originalMoneyMultiplier = this.moneyMultiplier;
            const originalHealthBonus = this.healthBonus;
            
            // Устанавливаем значения для получения 25 очков и запрета лечения
            this.moneyMultiplier = 1.25;
            this.healthBonus = -10; // Чтобы нейтрализовать базовое лечение
            
            // Вызываем базовый метод
            super.collectVeryGoodItem(item);
            
            // Восстанавливаем оригинальные значения
            this.moneyMultiplier = originalMoneyMultiplier;
            this.healthBonus = originalHealthBonus;
            
            // Увеличиваем ярость
            this.increaseRage(5);
        }
    }
    
    // Переопределяем метод столкновения с плохим предметом
    hitBadItem(item) {
        // Проверяем, взорвется ли блок
        const willExplode = Math.random() < this.badItemExplosionChance;
        
        // Отключаем физическое тело предмета
        item.disableBody(true, true);
        
        if (willExplode) {
            // Если блок взорвался, создаем анимацию взрыва
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
            
            // Наносим 20 урона
            window.health -= 20;
            
            // Удаляем взрыв после окончания анимации
            explosion.on('animationcomplete', function() {
                explosion.destroy();
            });
        } else if (this.rageMode) {
            // В режиме ярости получаем урон и не получаем очки
            window.health -= 20;
        } else {
            // В обычном режиме получаем очки и увеличиваем ярость
            window.score += 5;
            
            // Обновляем UI
            if (window.scoreText) {
                window.scoreText.setText('Очки: ' + window.score);
            }
            
            this.increaseRage(30);
        }
        
        // Проигрываем реплику персонажа с шансом 20%
        this.playBadPsuSound();
        
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
    }
    
    // Метод увеличения ярости
    increaseRage(amount) {
        // Если режим ярости уже активен, не увеличиваем счетчик
        if (this.rageMode) return;
        
        // Увеличиваем счетчик ярости
        this.rageMeter = Math.min(this.rageMeter + amount, 100);
        
        // Обновляем полосу ярости
        this.updateRageBar();
    }
    
    // Переопределяем метод восстановления здоровья
    heal(amount) {
        // Персонаж не может восстанавливать здоровье
        if (this.canHeal) {
            super.heal(amount);
        } else {
            console.log('Персонаж Zummer не может восстанавливать здоровье');
        }
    }
    
    // Переопределяем метод update
    update() {
        // Вызываем базовый метод
        super.update();
        
        // Запускаем таймер снижения ярости при первом обновлении
        if (!this.rageDecayTimer && !this.rageMode) {
            this.startRageDecay();
        }
    }
}