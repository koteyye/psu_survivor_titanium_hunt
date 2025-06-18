// Главный модуль UI для трейдера
import { FloatingTextManager } from './floating_text_manager.js';
import { EffectsManager } from './effects_manager.js';
import { MoneyBarManager } from './money_bar_manager.js';
import { BasketManager } from './basket_manager.js';
import { DefaultTimerManager } from './default_timer_manager.js';
import { GraphTooltipManager } from './graph_tooltip_manager.js';
import { GraphManager } from '../graph/index.js';

export class TraderUI {
    constructor(scene, character, localizationService) {
        this.scene = scene;
        this.character = character;
        this.localizationService = localizationService;
        
        // Инициализируем компоненты UI
        this.floatingTextManager = new FloatingTextManager(scene, character);
        this.effectsManager = new EffectsManager(scene, character);
        this.moneyBarManager = new MoneyBarManager(scene, character);
        this.basketManager = new BasketManager(scene, character);
        this.defaultTimerManager = new DefaultTimerManager(scene, character);
        
        // Создаем менеджер графика
        this.graphManager = new GraphManager(scene, character, localizationService);
        
        // Инициализируем подсказки для графика
        this.graphTooltipManager = new GraphTooltipManager(scene, character);
    }
    
    // Создание шкалы денег
    createMoneyBar() {
        return this.moneyBarManager.createMoneyBar();
    }
    
    // Создание UI корзины
    createBasketUI() {
        return this.basketManager.createBasketUI();
    }
    
    // Создание инвестиционного графика
    createInvestmentGraph() {
        // Создаем график
        const graph = this.graphManager.create();
        
        // Инициализируем подсказки для графика
        if (graph) {
            this.graphTooltipManager.init();
        }
        
        return graph;
    }
    
    // Обновление инвестиционного графика
    updateInvestmentGraph() {
        // Обновляем график и получаем текущий множитель
        const multiplier = this.graphManager.update();
        
        // Обновляем подсказки
        this.graphTooltipManager.update();
        
        return multiplier;
    }
    
    // Обновление текста корзины
    updateBasketText() {
        this.basketManager.updateBasketText();
    }
    
    // Обновление шкалы денег
    updateMoneyBar() {
        this.moneyBarManager.updateMoneyBar();
    }
    
    // Создание текста с эффектом исчезновения
    createFloatingText(text, color = '#ff0000', duration = 1500, yOffset = -100, animationType = 'default') {
        return this.floatingTextManager.createFloatingText(text, color, duration, yOffset, animationType);
    }
    
    // Создание эффекта взрыва
    createExplosionEffect(x, y, type = 'money') {
        return this.effectsManager.createExplosionEffect(x, y, type);
    }
    
    // Создание анимации для персонажа
    createCharacterAnimation(type = 'default') {
        return this.effectsManager.createCharacterAnimation(type);
    }
    
    // Показать индикатор таймера дефолта
    showDefaultTimerBar() {
        this.defaultTimerManager.showDefaultTimerBar();
    }
    
    // Скрыть индикатор таймера дефолта
    hideDefaultTimerBar() {
        this.defaultTimerManager.hideDefaultTimerBar();
    }
    
    // Обновление индикатора таймера дефолта
    updateDefaultTimerBar(progress) {
        this.defaultTimerManager.updateDefaultTimerBar(progress);
    }
    
    // Метод для очистки ресурсов при уничтожении объекта
    destroy() {
        try {
            // Уничтожаем компоненты
            this.floatingTextManager.destroy();
            this.effectsManager.destroy();
            this.moneyBarManager.destroy();
            this.basketManager.destroy();
            this.defaultTimerManager.destroy();
            this.graphManager.destroy();
            this.graphTooltipManager.destroy();
        } catch (error) {
            console.error('Ошибка при уничтожении UI трейдера:', error);
        }
    }
}

export default TraderUI;