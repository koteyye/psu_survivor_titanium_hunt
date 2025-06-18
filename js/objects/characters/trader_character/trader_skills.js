// Навыки для персонажа Трейдер
import { ConfigManager } from '../../../managers/config_manager.js';
import { EventManager } from '../../../managers/event_manager.js';

// Класс для управления навыками трейдера
export class TraderSkills {
    constructor(character) {
        this.character = character;
        this.scene = character.scene;
        this.sellCooldown = 0;
        
        // Получаем экземпляры менеджеров
        this.configManager = ConfigManager.getInstance();
        this.eventManager = EventManager.getInstance();
        
        // Загружаем конфигурацию навыков трейдера
        this.skillsConfig = this.configManager.getConfig('characters/skills/trader');
        
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
    
    // Создание эффекта хорошей продажи
    createGoodSellEffect() {
        // Получаем позицию персонажа
        const x = this.character.sprite.x;
        const y = this.character.sprite.y;
        
        // Получаем пул взрывов
        const explosion = this.character.objectPoolManager.get('explosions', x, y, {
            setDisplaySize: [400, 400],
            setOrigin: [0.5, 0.5],
            setFlipY: false
        });
        
        if (!explosion) return null;
        
        // Запускаем анимацию хорошего взрыва
        try {
            explosion.play('good_super_explode');
        } catch (error) {
            console.error('Ошибка при запуске анимации хорошего взрыва:', error);
        }
        
        // Добавляем обработчик завершения анимации
        explosion.once('animationcomplete', () => {
            if (explosion && explosion.active) {
                this.character.objectPoolManager.release('explosions', explosion);
            }
        });
        
        return explosion;
    }
    
    // Создание эффекта плохой продажи
    createBadSellEffect() {
        // Получаем позицию персонажа
        const x = this.character.sprite.x;
        const y = this.character.sprite.y;
        
        // Получаем пул взрывов
        const explosion = this.character.objectPoolManager.get('explosions', x, y, {
            setDisplaySize: [400, 400],
            setOrigin: [0.5, 0.5],
            setFlipY: false
        });
        
        if (!explosion) return null;
        
        // Запускаем анимацию плохого взрыва
        try {
            explosion.play('bad_money_explode');
        } catch (error) {
            console.error('Ошибка при запуске анимации плохого взрыва:', error);
        }
        
        // Добавляем обработчик завершения анимации
        explosion.once('animationcomplete', () => {
            if (explosion && explosion.active) {
                this.character.objectPoolManager.release('explosions', explosion);
            }
        });
        
        return explosion;
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
        
        // Проверяем активность таймера дефолта
        const isDefaultActive = this.character.mechanics.defaultTimer !== null;
        
        // Получаем текущую зону через zonesManager
        const controlPoint = this.character.ui.graphManager.pointsManager.controlPoint;
        const currentZone = this.character.ui.graphManager.zonesManager.getZoneByY(controlPoint.y);
        
        // Определяем, находимся ли мы в зеленой зоне (x1, x2, x3) или в красной (loss)
        const isGreenZone = currentZone.type !== 'loss';
        
        // Если был запущен таймер дефолта, отменяем его
        if (isDefaultActive) {
            this.character.mechanics.defaultTimer.remove();
            this.character.mechanics.defaultTimer = null;
            
            // Если был запущен таймер предупреждения, отменяем его
            if (this.character.mechanics.defaultWarningTimer) {
                this.character.mechanics.defaultWarningTimer.remove();
                this.character.mechanics.defaultWarningTimer = null;
            }
            
            // Сбрасываем счетчик и флаг предупреждения
            this.character.mechanics.defaultCountdown = 5;
            this.character.mechanics.defaultWarningActive = false;
            
            // Создаем текст с сообщением об отмене дефолта
            this.character.ui.createFloatingText(
                'ДЕФОЛТ ОТМЕНЕН!',
                '#00ff00',
                1500,
                -75
            );
        }
        
        // Устанавливаем кулдаун из конфига
        this.sellCooldown = this.skillsConfig.sellCooldown || 5000;
        
        // Определяем множитель в зависимости от положения на графике
        let multiplier = 0;
        let healthBonus = 0;
        
        // Получаем положение контрольной точки
        const controlY = this.character.ui.controlPoint.y;
        const centerY = this.character.ui.centerY;
        const levelSpacing = this.character.ui.levelSpacing;
        
        // Определяем, в какой зоне находится контрольная точка
        if (controlY > centerY) {
            // Отрицательная динамика (красная зона) - потеря здоровья, нет очков
            const healthConfig = this.configManager.getConfig('characters/mechanics/health');
            const sellLossDamage = healthConfig.trader.sellLossDamage || 20;
            
            // Получаем текущее здоровье из Registry
            let health = this.scene.registry.get('health');
            health = Math.max(0, health - sellLossDamage);
            this.scene.registry.set('health', health);
            
            // Создаем текст с сообщением о потере здоровья
            this.character.ui.createFloatingText(
                `УБЫТОК! -${sellLossDamage} ЗДОРОВЬЯ`,
                '#ff0000',
                1500,
                -100
            );
            
            // Создаем визуальный эффект для красной зоны
            this.createBadSellEffect();
            
            // Отправляем событие обновления UI здоровья
            this.eventManager.emit('HEALTH_CHANGED', health);
            
            // Перезагружаем шкалу денег
            const moneyConfig = this.configManager.getConfig('characters/mechanics/money');
            this.character.money = moneyConfig.trader.defaultMoney || 100;
            this.character.ui.updateMoneyBar();
        } else {
            // Положительная динамика (зеленая зона) - получение очков
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
                
                // Создаем визуальный эффект для зеленой зоны
                this.createGoodSellEffect();
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
                
                // Создаем визуальный эффект для зеленой зоны
                this.createGoodSellEffect();
            } else if (relativeHeight > levelSpacing * 2) {
                // Третья зона (66-100%) - очки + 100% и бонус к здоровью
                multiplier = this.skillsConfig.maxMultiplier || 2.0;
                healthBonus = this.skillsConfig.healthBonus || 30;
                
                // Создаем текст с сообщением о продаже
                this.character.ui.createFloatingText(
                    `ПРОДАЖА! +${Math.floor(this.character.basket * multiplier)} ОЧКОВ, +${healthBonus} ЗДОРОВЬЯ`,
                    '#00ff00',
                    1500,
                    -100
                );
                
                // Создаем визуальный эффект для зеленой зоны (супер-эффект)
                this.createGoodSellEffect();
            }
            
            // Начисляем очки
            let score = this.scene.registry.get('score') || 0;
            score += Math.floor(this.character.basket * multiplier);
            this.scene.registry.set('score', score);
            
            // Добавляем бонус к здоровью, если есть
            if (healthBonus > 0) {
                let health = this.scene.registry.get('health');
                const healthConfig = this.configManager.getConfig('characters/mechanics/health');
                const maxHealth = healthConfig.trader.maxHealth || 100;
                health = Math.min(health + healthBonus, maxHealth);
                this.scene.registry.set('health', health);
            }
            
            // Отправляем события обновления UI
            this.eventManager.emit('SCORE_CHANGED', score);
            this.eventManager.emit('HEALTH_CHANGED', this.scene.registry.get('health'));
            
            // Перезагружаем шкалу денег
            const moneyConfig = this.configManager.getConfig('characters/mechanics/money');
            this.character.money = moneyConfig.trader.defaultMoney || 100;
            this.character.ui.updateMoneyBar();
        }
        
        // Сбрасываем корзину
        this.character.basket = 0;
        this.character.ui.updateBasketText();
    }
}