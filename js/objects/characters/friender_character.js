// Класс персонажа "Товарищ С."
import { BaseCharacter } from './base_character.js';
import { ConfigManager } from '../../managers/config_manager.js';

export class FrienderCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'friender_s');
        
        // Получаем конфигурацию персонажа из JSON
        const configManager = ConfigManager.getInstance();
        const characterInfo = configManager.getConfig('characters/info');
        const frienderConfig = characterInfo ? characterInfo.friender : null;
        
        if (frienderConfig && frienderConfig.mechanics) {
            // Используем значения из конфигурации
            this.speed = frienderConfig.mechanics.speed || 1.2;
            this.healthBonus = frienderConfig.mechanics.healthBonus || 5;
            this.luckyFindChance = frienderConfig.mechanics.luckyFindChance || 0.1;
            this.bonusPoints = frienderConfig.mechanics.bonusPoints || 10;
        } else {
            // Fallback значения на случай отсутствия конфигурации
            console.warn('Конфигурация Friender не найдена, используются значения по умолчанию');
            this.speed = 1.2;       // Повышенная скорость передвижения
            this.healthBonus = 5;   // Получает больше здоровья от супер-блоков
            this.luckyFindChance = 0.1;
            this.bonusPoints = 10;
        }
    }
    
    getCharacterId() {
        return 'friender_s';
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        // Вызываем базовый метод
        super.collectVeryGoodItem(item);
          // Дополнительный эффект: шанс получить дополнительные очки (из конфигурации)
        if (Math.random() < this.luckyFindChance) {
            // Получаем текущий счет из Registry
            let score = this.scene.registry.get('score') || 0;
            score += this.bonusPoints;
            this.scene.registry.set('score', score);
            
            // Обновляем UI
            const scoreText = this.scene.registry.get('scoreText');
            if (scoreText) {
                scoreText.setText('Очки: ' + score);
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