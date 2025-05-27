// Основной файл персонажа "Кролик-Шнырь Облигац" - Трейдер
import { BaseCharacter } from '../BaseCharacter.js';
import { TraderUI } from './TraderUI.js';
import { TraderMechanics } from './TraderMechanics.js';
import { TraderSkills } from './TraderSkills.js';

export class TraderCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'trader');
        
        // Особые характеристики Трейдера
        this.moneyMultiplier = 1.0;  // Стандартный множитель денег
        
        // Инициализация параметров трейдера
        this.money = 100;            // Начальное количество денег (шкала)
        this.basket = 0;             // Корзина (накопленные блоки для продажи)
        this.defaultCooldown = false; // Флаг кулдауна после дефолта
        
        // Инвестиционный график
        this.graphValue = 0;          // Текущее значение графика (-100 до 100)
        this.graphDirection = 1;      // Направление движения точки по вертикали
        
        // Инициализация компонентов
        this.ui = new TraderUI(this);
        this.mechanics = new TraderMechanics(this);
        this.skills = new TraderSkills(this);
        
        // Создаем UI компоненты
        this.ui.createMoneyBar();
        this.ui.createInvestmentGraph();
        
        // Запускаем таймер уменьшения корзины при пустой шкале денег
        this.mechanics.startBasketDecay();
    }
    
    getCharacterId() {
        return 'rabbit';
    }
    
    // Переопределяем метод сбора хорошего предмета
    collectGoodItem(item) {
        this.mechanics.collectGoodItem(item);
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        this.mechanics.collectVeryGoodItem(item);
    }
    
    // Переопределяем метод столкновения с плохим предметом
    hitBadItem(item) {
        this.mechanics.hitBadItem(item);
    }
    
    // Переопределяем метод update
    update() {
        // Вызываем базовый метод
        super.update();
        
        // Обновляем инвестиционный график
        this.ui.updateInvestmentGraph();
        
        // Обновляем кулдауны навыков
        this.skills.updateCooldowns(this.scene.sys.game.loop.delta);
    }
}