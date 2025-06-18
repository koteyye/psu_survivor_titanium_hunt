// Класс персонажа "Товарищ С."
import { BaseCharacter } from './base_character.js';

export class FrienderCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'friender_s');
        
        // Особые характеристики Товарища С.
        this.speed = 1.2;       // Повышенная скорость передвижения
        this.healthBonus = 5;   // Получает больше здоровья от супер-блоков
    }
    
    getCharacterId() {
        return 'friender';
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        // Вызываем базовый метод
        super.collectVeryGoodItem(item);
        
        // Дополнительный эффект: шанс 10% получить дополнительные очки
        if (Math.random() < 0.1) {
            window.score += 10;
            
            // Обновляем UI
            if (window.scoreText) {
                window.scoreText.setText('Очки: ' + window.score);
            }
            
            // Создаем эффект бонуса (текст, который исчезает)
            const bonusText = this.scene.add.text(
                this.sprite.x,
                this.sprite.y - 50,
                '+10 БОНУС!',
                {
                    fontSize: '24px',
                    fill: '#ff0000',
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
    }
}