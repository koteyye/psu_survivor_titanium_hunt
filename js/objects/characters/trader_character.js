// Основной файл персонажа "Кролик-Шнырь Облигац" - Трейдер
import { BaseCharacter } from './base_character.js';
import { TraderUI } from './trader_character/ui/index.js';
import { TraderMechanics } from './trader_character/trader_mechanics.js';
import { TraderSkills } from './trader_character/trader_skills.js';
import { LocalizationService } from './trader_character/localization_service.js';
import { ConfigManager } from '../../managers/config_manager.js';
import { EventManager } from '../../managers/event_manager.js';

export class TraderCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'trader');
        
        // Получаем экземпляры менеджеров через Singleton
        this.configManager = ConfigManager.getInstance();
        this.eventManager = EventManager.getInstance();
        
        // Загружаем конфигурацию трейдера
        const traderConfig = this.configManager.getConfig('characters/skills/trader');
        const moneyConfig = this.configManager.getConfig('characters/mechanics/money');
        
        // Особые характеристики Трейдера
        this.moneyMultiplier = traderConfig.moneyMultiplier || 1.0;
        
        // Инициализация параметров трейдера
        this.money = moneyConfig.trader.defaultMoney || 100;
        this.basket = 0;
        this.defaultCooldown = false;
        
        // Инвестиционный график
        this.graphValue = 0;
        this.graphDirection = 1;
        
        // Создаем сервис локализации
        this.localizationService = new LocalizationService();
        
        // Инициализация компонентов через Component-based паттерн
        this.ui = new TraderUI(this.scene, this, this.localizationService);
        this.mechanics = new TraderMechanics(this);
        this.skills = new TraderSkills(this);
        
        // Создаем UI компоненты
        this.ui.createMoneyBar();
        this.ui.createBasketUI();
        this.ui.createInvestmentGraph();
        
        // Подписываемся на события через Event Bus
        this.setupEventListeners();
    }
    
    // Настройка слушателей событий
    setupEventListeners() {
        // Подписываемся на событие изменения здоровья через Event Bus
        this.eventManager.subscribe('HEALTH_CHANGED', (health) => {
            // Обновляем UI здоровья
            // Это будет обрабатываться в GameScene
        });
        
        // Подписываемся на событие окончания игры
        this.eventManager.subscribe('GAME_OVER', () => {
            // Обработка окончания игры
            // Это будет обрабатываться в GameScene
        });
    }
    
    getCharacterId() {
        return 'trader'; // Исправлено с 'rabbit' на 'trader'
    }
    
    // Переопределяем методы для делегирования в компоненты
    // Переопределяем методы базового класса для использования механики трейдера
    collectGoodItem(item) {
        // Полностью отключаем базовую логику и используем механику трейдера
        this.mechanics.processItem(item, 'good');
    }
    
    collectVeryGoodItem(item) {
        // Полностью отключаем базовую логику и используем механику трейдера
        this.mechanics.processItem(item, 'veryGood');
    }
    
    hitBadItem(item) {
        // Полностью отключаем базовую логику и используем механику трейдера
        this.mechanics.processItem(item, 'bad');
    }
    
    update() {
        // Вызываем базовый метод
        super.update();
        
        // Обновляем инвестиционный график
        this.ui.updateInvestmentGraph();
        
        // Обновляем кулдауны навыков
        this.skills.updateCooldowns(this.scene.sys.game.loop.delta);
    }
    
    // Метод для очистки ресурсов при уничтожении объекта
    destroy() {
        // Отписываемся от событий через Event Bus
        this.eventManager.unsubscribeAll('HEALTH_CHANGED');
        this.eventManager.unsubscribeAll('GAME_OVER');
        
        // Вызываем базовый метод
        super.destroy();
    }
}