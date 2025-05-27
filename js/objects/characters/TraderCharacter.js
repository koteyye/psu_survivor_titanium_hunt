// Класс персонажа "Кролик-Шнырь Облигац"
import { BaseCharacter } from './BaseCharacter.js';

export class TraderCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'trader');
        
        // Особые характеристики Кролика-Шныря
        this.moneyMultiplier = 1.5;  // Больше денег за предметы
        this.comboCounter = 0;       // Счетчик комбо для бонусов
        this.comboText = null;       // Текст для отображения комбо
    }
    
    getCharacterId() {
        return 'rabbit';
    }
    
    // Переопределяем метод сбора хорошего предмета
    collectGoodItem(item) {
        // Вызываем базовый метод
        super.collectGoodItem(item);
        
        // Увеличиваем счетчик комбо
        this.increaseCombo();
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        // Вызываем базовый метод
        super.collectVeryGoodItem(item);
        
        // Увеличиваем счетчик комбо на 2 (супер-предмет стоит больше)
        this.increaseCombo(2);
    }
    
    // Переопределяем метод столкновения с плохим предметом
    hitBadItem(item) {
        // Вызываем базовый метод
        super.hitBadItem(item);
        
        // Сбрасываем комбо при получении урона
        this.resetCombo();
    }
    
    // Метод увеличения комбо
    increaseCombo(amount = 1) {
        this.comboCounter += amount;
        
        // Если комбо достигло определенного значения, даем бонус
        if (this.comboCounter >= 5) {
            // Каждые 5 комбо даем бонусные очки
            const bonusPoints = Math.floor(this.comboCounter / 5) * 15;
            window.score += bonusPoints;
            
            // Обновляем UI
            if (window.scoreText) {
                window.scoreText.setText('Очки: ' + window.score);
            }
            
            // Создаем эффект бонуса (текст, который исчезает)
            const bonusText = this.scene.add.text(
                this.sprite.x,
                this.sprite.y - 50,
                `КОМБО x${this.comboCounter}! +${bonusPoints}`,
                {
                    fontSize: '24px',
                    fill: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5);
            
            // Анимация исчезновения текста
            this.scene.tweens.add({
                targets: bonusText,
                y: bonusText.y - 100,
                alpha: 0,
                duration: 1500,
                onComplete: () => {
                    bonusText.destroy();
                }
            });
        }
        
        // Обновляем или создаем текст комбо
        this.updateComboText();
    }
    
    // Метод сброса комбо
    resetCombo() {
        this.comboCounter = 0;
        
        // Удаляем текст комбо, если он существует
        if (this.comboText) {
            this.comboText.destroy();
            this.comboText = null;
        }
    }
    
    // Метод обновления текста комбо
    updateComboText() {
        // Если комбо меньше 2, не показываем текст
        if (this.comboCounter < 2) {
            if (this.comboText) {
                this.comboText.destroy();
                this.comboText = null;
            }
            return;
        }
        
        // Если текст уже существует, обновляем его
        if (this.comboText) {
            this.comboText.setText(`Комбо: x${this.comboCounter}`);
        } else {
            // Создаем новый текст
            this.comboText = this.scene.add.text(
                this.sprite.x,
                this.sprite.y - 150,
                `Комбо: x${this.comboCounter}`,
                {
                    fontSize: '20px',
                    fill: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 2
                }
            ).setOrigin(0.5);
        }
    }
    
    // Переопределяем метод update для обновления позиции текста комбо
    update() {
        // Вызываем базовый метод
        super.update();
        
        // Обновляем позицию текста комбо, если он существует
        if (this.comboText) {
            this.comboText.setPosition(this.sprite.x, this.sprite.y - 150);
        }
    }
}