// Механики для персонажа Трейдер
import { updateGameUI, showGameOverUI } from '../../../scenes/base/game_level_ui.js';
import { ConfigManager } from '../../../managers/config_manager.js';
import { EventManager } from '../../../managers/event_manager.js';
import { ObjectPoolManager } from '../../../managers/object_pool_manager.js';

// Класс для управления механиками трейдера
export class TraderMechanics {
    constructor(character) {
        this.character = character;
        this.scene = character.scene;
        this.defaultTimer = null;
        this.defaultWarningTimer = null;
        this.configManager = ConfigManager.getInstance();
        this.eventManager = EventManager.getInstance();
        this.objectPoolManager = ObjectPoolManager.getInstance();
        this.defaultWarningActive = false;
        this.defaultCountdown = 5; // 5 секунд до дефолта
        
        // Загружаем конфигурацию UI
        this.uiConfig = this.configManager.getConfig('characters/trader/ui');
    }
    
    // Запуск таймера дефолта после истощения денег
    startDefaultTimer() {
        // Если таймер уже запущен, не создаем новый
        if (this.defaultTimer) {
            return;
        }
        
        // Получаем время дефолта из конфига
        const defaultTime = this.uiConfig.defaultTimer.duration || 5000; // 5 секунд
        
        // Показываем индикатор таймера дефолта
        this.character.ui.showDefaultTimerBar();
        
        // Создаем текст с предупреждением
        const message = this.uiConfig.defaultTimer.messages.start.replace('{time}', this.defaultCountdown);
        this.character.ui.createFloatingText(
            message,
            this.uiConfig.floatingText.colors.warning,
            2000,
            -100,
            'critical'
        );
        
        // Запускаем таймер обратного отсчета
        this.defaultWarningActive = true;
        this.defaultWarningTimer = this.scene.time.addEvent({
            delay: this.uiConfig.defaultTimer.warningInterval || 1000,
            callback: () => {
                this.defaultCountdown--;
                
                // Обновляем индикатор таймера
                const progress = this.defaultCountdown / 5; // 5 секунд всего
                this.character.ui.updateDefaultTimerBar(progress);
                
                if (this.defaultCountdown > 0) {
                    // Показываем обратный отсчет
                    const message = this.uiConfig.defaultTimer.messages.countdown.replace('{time}', this.defaultCountdown);
                    this.character.ui.createFloatingText(
                        message,
                        this.uiConfig.floatingText.colors.warning,
                        1000,
                        -50
                    );
                }
            },
            callbackScope: this,
            repeat: 4 // 5 раз (от 5 до 1)
        });
        
        // Создаем таймер для вызова дефолта через 5 секунд
        this.defaultTimer = this.scene.time.delayedCall(defaultTime, () => {
            // Вызываем дефолт независимо от наполненности корзины
            this.triggerDefault();
            
            // Сбрасываем таймер и счетчик
            this.defaultTimer = null;
            this.defaultCountdown = 5;
            this.defaultWarningActive = false;
            
            // Скрываем индикатор таймера
            this.character.ui.hideDefaultTimerBar();
        }, [], this);
    }
    
    // Вызов дефолта (когда закончились деньги)
    triggerDefault() {
        // Наносим урон
        const healthConfig = this.configManager.getConfig('characters/mechanics/health');
        const defaultDamage = healthConfig.trader.defaultDamage || 40;
        
        // Получаем текущее здоровье из Registry
        let health = this.scene.registry.get('health');
        health = Math.max(0, health - defaultDamage);
        this.scene.registry.set('health', health);
        
        // Перезагружаем шкалу денег
        const moneyConfig = this.configManager.getConfig('characters/mechanics/money');
        this.character.money = moneyConfig.trader.defaultMoney || 100;
        this.character.ui.updateMoneyBar();
        
        // Сбрасываем таймер
        if (this.defaultWarningTimer) {
            this.defaultWarningTimer.remove();
            this.defaultWarningTimer = null;
        }
        
        // Скрываем индикатор таймера
        this.character.ui.hideDefaultTimerBar();
        
        // Создаем визуальную индикацию дефолта
        // Текст с эффектом
        const message = this.uiConfig.defaultTimer.messages.triggered.replace('{damage}', defaultDamage);
        this.character.ui.createFloatingText(
            message,
            this.uiConfig.floatingText.colors.warning,
            2000,
            -100,
            'critical'
        );
        
        // Создаем эффект взрыва дефолта
        this.character.ui.createExplosionEffect(
            this.character.sprite.x,
            this.character.sprite.y,
            'default'
        );
        
        // Добавляем анимацию персонажа
        this.character.ui.createCharacterAnimation('default');
        
        // Отправляем событие обновления UI здоровья
        this.eventManager.emit('HEALTH_CHANGED', health);
        
        // Проверяем, не закончилась ли игра
        this.checkGameOver();
    }
    
    // Основной метод обработки предметов для трейдера
    processItem(item, itemType) {
        // Получаем конфигурацию для данного типа предмета
        const moneyConfig = this.configManager.getConfig('characters/mechanics/money');
        const itemConfig = moneyConfig.trader.items[itemType];
        
        if (!itemConfig) {
            console.error(`Неизвестный тип предмета: ${itemType}`);
            return;
        }
        
        // Проверяем, достаточно ли денег для сбора предмета
        if (this.character.money < itemConfig.cost) {
            // Если денег недостаточно, показываем сообщение и не собираем предмет
            this.character.ui.createFloatingText('НЕДОСТАТОЧНО ДЕНЕГ!', '#ff0000', 1000, -50);
            return;
        }
        
        // Создаем эффект взрыва денег
        this.character.ui.createExplosionEffect(item.x, item.y, 'money');
        
        // Отключаем физическое тело предмета
        item.disableBody(true, true);
        
        // Проигрываем соответствующую реплику персонажа в зависимости от типа предмета
        if (itemType === 'veryGood') {
            this.character.playSuperPsuSound();
        } else if (itemType === 'bad') {
            this.character.playBadPsuSound();
        }
        
        // Тратим деньги
        const prevMoney = this.character.money;
        this.character.money = Math.max(0, this.character.money - itemConfig.cost);
        this.character.ui.updateMoneyBar();
        
        // Пополняем корзину
        this.character.basket += itemConfig.basketValue;
        this.character.ui.updateBasketText();
        
        // Создаем текст с сообщением о сборе блока
        const animationType = itemType === 'veryGood' ? 'sale' : 'default';
        this.character.ui.createFloatingText(
            itemConfig.message,
            itemConfig.messageColor,
            1000,
            -50,
            animationType
        );
        
        // Если это очень хороший предмет, добавляем анимацию продажи
        if (itemType === 'veryGood') {
            // Создаем эффект взрыва продажи
            this.character.ui.createExplosionEffect(
                this.character.sprite.x,
                this.character.sprite.y,
                'sale'
            );
            
            // Добавляем анимацию персонажа
            this.character.ui.createCharacterAnimation('sale');
        }
        
        // Если деньги только что закончились, запускаем таймер дефолта
        if (prevMoney > 0 && this.character.money <= 0) {
            this.startDefaultTimer();
        }
        
        // Возвращаем предмет в пул
        this.objectPoolManager.release(`${itemType}Items`, item);
        
        // Оповещаем о сборе предмета через Event Bus
        this.eventManager.emit('ITEM_COLLECTED', {
            type: itemType,
            cost: itemConfig.cost,
            basketValue: itemConfig.basketValue
        });
    }
    
    // Проверка на окончание игры
    checkGameOver() {
        const health = this.scene.registry.get('health');
        
        if (health <= 0) {
            this.scene.registry.set('health', 0);
            this.scene.registry.set('gameOver', true);
            
            // Проигрываем реплику смерти
            this.character.playDeadSound();
            
            // Отправляем событие окончания игры
            this.eventManager.emit('GAME_OVER');
            
            // Останавливаем игру
            this.scene.physics.pause();
            this.character.sprite.setTint(0xff0000);
        }
    }
    
}