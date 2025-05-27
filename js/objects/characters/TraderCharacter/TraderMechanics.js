// Механики для персонажа Трейдер
import { updateGameUI, showGameOverUI } from '../../../scenes/base/GameLevelUI.js';

// Класс для управления механиками трейдера
export class TraderMechanics {
    constructor(character) {
        this.character = character;
        this.scene = character.scene;
        this.basketDecayTimer = null;
    }
    
    // Запуск таймера уменьшения корзины
    startBasketDecay() {
        // Если таймер уже запущен, останавливаем его
        if (this.basketDecayTimer) {
            this.basketDecayTimer.remove();
        }
        
        // Создаем новый таймер для уменьшения корзины каждую секунду
        this.basketDecayTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                // Проверяем условия дефолта
                if (this.character.money <= 0) {
                    // Если денег нет, уменьшаем корзину
                    if (this.character.basket > 0) {
                        this.character.basket = Math.max(0, this.character.basket - 5);
                        this.character.ui.updateBasketText();
                        
                        // Если корзина опустела, вызываем дефолт
                        if (this.character.basket <= 0) {
                            this.triggerDefault();
                        }
                    } else {
                        // Если и денег и корзина пусты, вызываем дефолт
                        this.triggerDefault();
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    // Вызов дефолта (когда корзина опустела при отсутствии денег)
    triggerDefault() {
        // Наносим урон
        window.health = Math.max(0, window.health - 30);
        
        // Перезагружаем шкалу денег
        this.character.money = 100;
        this.character.ui.updateMoneyBar();
        
        // Создаем эффект дефолта
        this.character.ui.createFloatingText('ДЕФОЛТ! -30 ЗДОРОВЬЯ', '#ff0000', 2000, -100);
        
        // Обновляем UI здоровья
        if (window.gameScene) {
            updateGameUI(window.gameScene);
        }
        
        // Проверяем, не закончилась ли игра
        this.checkGameOver();
    }
    
    // Обработка сбора хорошего предмета
    collectGoodItem(item) {
        item.disableBody(true, true);
        
        // Если денег нет, получаем урон
        if (this.character.money <= 0) {
            // Наносим урон
            window.health = Math.max(0, window.health - 15);
            
            // Уменьшаем корзину
            this.character.basket = Math.max(0, this.character.basket - 15);
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением об уроне
            this.character.ui.createFloatingText('-15 ЗДОРОВЬЯ', '#ff0000', 1000, -50);
            
            // Обновляем UI здоровья
            if (window.gameScene) {
                updateGameUI(window.gameScene);
            }
            
            // Если корзина пуста, вызываем дефолт
            if (this.character.basket <= 0) {
                this.triggerDefault();
                return;
            }
            
            // Проверяем, не закончилась ли игра
            this.checkGameOver();
        } else {
            // Тратим деньги
            this.character.money = Math.max(0, this.character.money - 10);
            this.character.ui.updateMoneyBar();
            
            // Пополняем корзину
            this.character.basket += 10;
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением о сборе блока
            this.character.ui.createFloatingText('+10 В КОРЗИНУ', '#ffff00', 1000, -50);
        }
    }
    
    // Обработка сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        item.disableBody(true, true);
        
        // Проигрываем реплику персонажа с шансом 70%
        this.character.playSuperPsuSound();
        
        // Если денег нет, получаем урон
        if (this.character.money <= 0) {
            // Наносим урон
            window.health = Math.max(0, window.health - 10);
            
            // Уменьшаем корзину
            this.character.basket = Math.max(0, this.character.basket - 10);
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением об уроне
            this.character.ui.createFloatingText('-10 ЗДОРОВЬЯ', '#ff0000', 1000, -50);
            
            // Обновляем UI здоровья
            if (window.gameScene) {
                updateGameUI(window.gameScene);
            }
            
            // Если корзина пуста, вызываем дефолт
            if (this.character.basket <= 0) {
                this.triggerDefault();
                return;
            }
            
            // Проверяем, не закончилась ли игра
            this.checkGameOver();
        } else {
            // Тратим деньги
            this.character.money = Math.max(0, this.character.money - 20);
            this.character.ui.updateMoneyBar();
            
            // Пополняем корзину
            this.character.basket += 20;
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением о сборе блока
            this.character.ui.createFloatingText('+20 В КОРЗИНУ', '#ffff00', 1000, -50);
        }
    }
    
    // Обработка столкновения с плохим предметом
    hitBadItem(item) {
        // Проигрываем реплику персонажа с шансом 20%
        this.character.playBadPsuSound();
        
        // Отключаем физическое тело предмета
        item.disableBody(true, true);
        
        // Если денег нет, получаем урон
        if (this.character.money <= 0) {
            // Наносим урон
            window.health = Math.max(0, window.health - 20);
            
            // Уменьшаем корзину
            this.character.basket = Math.max(0, this.character.basket - 20);
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением об уроне
            this.character.ui.createFloatingText('-20 ЗДОРОВЬЯ', '#ff0000', 1000, -50);
            
            // Обновляем UI здоровья
            if (window.gameScene) {
                updateGameUI(window.gameScene);
            }
            
            // Если корзина пуста, вызываем дефолт
            if (this.character.basket <= 0) {
                this.triggerDefault();
                return;
            }
            
            // Проверяем, не закончилась ли игра
            this.checkGameOver();
        } else {
            // Тратим деньги
            this.character.money = Math.max(0, this.character.money - 5);
            this.character.ui.updateMoneyBar();
            
            // Пополняем корзину
            this.character.basket += 5;
            this.character.ui.updateBasketText();
            
            // Создаем текст с сообщением о сборе блока
            this.character.ui.createFloatingText('+5 В КОРЗИНУ', '#ffff00', 1000, -50);
        }
    }
    
    // Проверка на окончание игры
    checkGameOver() {
        if (window.health <= 0) {
            window.health = 0;
            window.gameOver = true;
            
            // Проигрываем реплику смерти
            this.character.playDeadSound();
            
            // Показываем UI окончания игры
            if (window.gameScene) {
                // Сначала скрываем предыдущие элементы Game Over, если они есть
                if (window.gameScene.gameOverTitle) {
                    window.gameScene.gameOverTitle.setVisible(false);
                }
                if (window.gameScene.restartText) {
                    window.gameScene.restartText.setVisible(false);
                }
                
                // Затем показываем новые элементы
                showGameOverUI(window.gameScene);
            }
            
            // Останавливаем игру
            this.scene.physics.pause();
            this.character.sprite.setTint(0xff0000);
        }
    }
}