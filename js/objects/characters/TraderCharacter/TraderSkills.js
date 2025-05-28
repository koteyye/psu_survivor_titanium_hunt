// Навыки для персонажа Трейдер
import { updateGameUI } from '../../../scenes/base/GameLevelUI.js';

// Класс для управления навыками трейдера
export class TraderSkills {
    constructor(character) {
        this.character = character;
        this.scene = character.scene;
        this.sellCooldown = 0;
        
        // Добавляем обработчик клавиши W для продажи корзины
        this.setupSellSkill();
    }
    
    // Настройка навыка продажи корзины
    setupSellSkill() {
        this.sellKey = this.scene.input.keyboard.addKey('W');
        this.sellKey.on('down', () => {
            this.sellBasket();
        });
    }
    
    // Обновление кулдауна навыков
    updateCooldowns(delta) {
        if (this.sellCooldown > 0) {
            this.sellCooldown -= delta;
        }
    }
    
    // Метод продажи корзины
    sellBasket() {
        // Проверяем кулдаун
        if (this.sellCooldown > 0) {
            // Создаем текст с сообщением о кулдауне
            this.character.ui.createFloatingText(
                `КУЛДАУН: ${Math.ceil(this.sellCooldown / 1000)} сек`,
                '#ff0000',
                1000,
                -50
            );
            return;
        }
        
        // Если корзина пуста, ничего не делаем
        if (this.character.basket <= 0) {
            // Создаем текст с сообщением о пустой корзине
            this.character.ui.createFloatingText(
                'КОРЗИНА ПУСТА!',
                '#ff0000',
                1000,
                -50
            );
            return;
        }
        
        // Устанавливаем кулдаун на 5 секунд
        this.sellCooldown = 5000;
        
        // Определяем множитель в зависимости от положения на графике
        let multiplier = 0;
        let healthBonus = 0;
        
        // Получаем положение контрольной точки
        const controlY = this.character.ui.controlPoint.y;
        const centerY = this.character.ui.centerY;
        const levelSpacing = this.character.ui.levelSpacing;
        
        // Определяем, в какой зоне находится контрольная точка
        if (controlY > centerY) {
            // Отрицательная динамика - потеря здоровья, нет очков
            window.health = Math.max(0, window.health - 20);
            
            // Создаем текст с сообщением о потере здоровья
            this.character.ui.createFloatingText(
                'УБЫТОК! -20 ЗДОРОВЬЯ',
                '#ff0000',
                1500,
                -100
            );
        } else {
            // Положительная динамика - получение очков
            // Определяем зону по высоте
            const relativeHeight = centerY - controlY;
            
            if (relativeHeight > 0 && relativeHeight <= levelSpacing) {
                // Первая зона (0-33%) - базовые очки
                multiplier = 1.0;
                
                // Создаем текст с сообщением о продаже
                this.character.ui.createFloatingText(
                    `ПРОДАЖА! +${this.character.basket} ОЧКОВ`,
                    '#00ff00',
                    1500,
                    -100
                );
            } else if (relativeHeight > levelSpacing && relativeHeight <= levelSpacing * 2) {
                // Вторая зона (33-66%) - очки + 50%
                multiplier = 1.5;
                
                // Создаем текст с сообщением о продаже
                this.character.ui.createFloatingText(
                    `ПРОДАЖА! +${Math.floor(this.character.basket * multiplier)} ОЧКОВ`,
                    '#00ff00',
                    1500,
                    -100
                );
            } else if (relativeHeight > levelSpacing * 2) {
                // Третья зона (66-100%) - очки + 100% и бонус к здоровью
                multiplier = 2.0;
                healthBonus = 30;
                
                // Создаем текст с сообщением о продаже
                this.character.ui.createFloatingText(
                    `ПРОДАЖА! +${Math.floor(this.character.basket * multiplier)} ОЧКОВ, +30 ЗДОРОВЬЯ`,
                    '#00ff00',
                    1500,
                    -100
                );
            }
            
            // Начисляем очки
            window.score += Math.floor(this.character.basket * multiplier);
            
            // Добавляем бонус к здоровью, если есть
            if (healthBonus > 0) {
                window.health = Math.min(window.health + healthBonus, 100);
            }
            
            // Обновляем UI
            if (window.scoreText) {
                window.scoreText.setText(window.score.toString());
            }
            
            // Обновляем UI здоровья
            if (window.gameScene) {
                updateGameUI(window.gameScene);
            }
        }
        
        // Сбрасываем корзину
        this.character.basket = 0;
        this.character.ui.updateBasketText();
        
        // Перезагружаем шкалу денег
        this.character.money = 100;
        this.character.ui.updateMoneyBar();
    }
}