// Менеджер шкалы денег
import { BaseUIElement } from './base_ui_element.js';
import { CyberBar } from '../../../../ui/index.js';

export class MoneyBarManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        
        // UI элементы
        this.moneyBar = null;
        
        // Время последнего обновления шкалы денег
        this.lastUpdateTime = 0;
        
        // Загружаем дополнительные конфигурации
        this.moneyConfig = this.configManager.getConfig('characters/mechanics/money');
    }
    
    // Создание шкалы денег
    createMoneyBar() {
        try {
            // Проверяем, загружена ли иконка денег
            if (!this.scene.textures.exists('moneyIcon')) {
                console.warn('Отсутствует текстура иконки денег');
                return null;
            }
            
            const positions = this.uiConfig && this.uiConfig.moneyBar && this.uiConfig.moneyBar.position 
                ? this.uiConfig.moneyBar.position 
                : { x: 300, y: 150, width: 400, height: 30 };
            
            // Создаем шкалу денег с помощью CyberBar
            this.moneyBar = new CyberBar(
                this.scene,
                positions.x,
                positions.y,
                this.character.money,
                {
                    width: positions.width,
                    height: positions.height,
                    iconKey: 'moneyIcon',
                    barColor: parseInt(this.uiConfig.moneyBar.colors.normal, 16),
                    showValue: false // Убираем значение в процентах
                }
            );
            
            return this.moneyBar;
        } catch (error) {
            console.error('Ошибка создания шкалы денег:', error);
            this.scene.events.emit('uiError', error);
            return null;
        }
    }
    
    // Обновление шкалы денег
    updateMoneyBar() {
        if (!this.moneyBar) return;
        
        // Обновляем шкалу денег только с заданным интервалом
        const currentTime = this.scene.time.now;
        if (currentTime - this.lastUpdateTime < this.uiConfig.moneyBar.updateInterval) {
            return;
        }
        this.lastUpdateTime = currentTime;
        
        // Обновляем значение
        this.moneyBar.setValue(this.character.money);
        
        // Обновляем цвет в зависимости от количества денег
        const moneyPercent = (this.character.money / this.moneyConfig.trader.defaultMoney) * 100;
        if (moneyPercent <= this.uiConfig.moneyBar.thresholds.critical) {
            this.moneyBar.setBarColor(parseInt(this.uiConfig.moneyBar.colors.critical, 16));
        } else if (moneyPercent <= this.uiConfig.moneyBar.thresholds.warning) {
            this.moneyBar.setBarColor(parseInt(this.uiConfig.moneyBar.colors.warning, 16));
        } else {
            this.moneyBar.setBarColor(parseInt(this.uiConfig.moneyBar.colors.normal, 16));
        }
    }
    
    // Очистка ресурсов
    destroy() {
        if (this.moneyBar) {
            this.moneyBar.destroy();
            this.moneyBar = null;
        }
    }
}

export default MoneyBarManager;