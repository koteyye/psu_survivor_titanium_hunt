// Менеджер индикатора таймера дефолта
import { BaseUIElement } from './base_ui_element.js';

export class DefaultTimerManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        
        // UI элементы
        this.defaultTimerBar = null;
    }
    
    // Создание индикатора таймера дефолта
    createDefaultTimerBar() {
        if (this.defaultTimerBar) {
            this.defaultTimerBar.destroy();
        }
        
        const timerConfig = this.uiConfig.defaultTimer.indicator;
        
        // Создаем фон индикатора
        const background = this.scene.add.rectangle(
            timerConfig.x,
            timerConfig.y,
            timerConfig.width,
            timerConfig.height,
            parseInt(timerConfig.backgroundColor, 16)
        ).setOrigin(0.5);
        
        // Создаем заполнение индикатора
        const fill = this.scene.add.rectangle(
            timerConfig.x - timerConfig.width / 2 + timerConfig.borderWidth,
            timerConfig.y,
            timerConfig.width - timerConfig.borderWidth * 2,
            timerConfig.height - timerConfig.borderWidth * 2,
            parseInt(timerConfig.fillColor, 16)
        ).setOrigin(0, 0.5);
        
        // Создаем границу индикатора
        const border = this.scene.add.rectangle(
            timerConfig.x,
            timerConfig.y,
            timerConfig.width,
            timerConfig.height,
            parseInt(timerConfig.borderColor, 16)
        ).setOrigin(0.5).setStrokeStyle(timerConfig.borderWidth, parseInt(timerConfig.borderColor, 16));
        
        // Группируем элементы индикатора
        this.defaultTimerBar = this.scene.add.container(0, 0, [background, fill, border]);
        this.defaultTimerBar.fill = fill;
        this.defaultTimerBar.setAlpha(timerConfig.alpha);
        this.defaultTimerBar.visible = false;
        
        return this.defaultTimerBar;
    }
    
    // Обновление индикатора таймера дефолта
    updateDefaultTimerBar(progress) {
        if (!this.defaultTimerBar || !this.defaultTimerBar.visible) return;
        
        const timerConfig = this.uiConfig.defaultTimer.indicator;
        const fillWidth = (timerConfig.width - timerConfig.borderWidth * 2) * progress;
        
        this.defaultTimerBar.fill.width = fillWidth;
    }
    
    // Показать индикатор таймера дефолта
    showDefaultTimerBar() {
        if (!this.defaultTimerBar) {
            this.createDefaultTimerBar();
        }
        
        this.defaultTimerBar.visible = true;
        this.updateDefaultTimerBar(1); // Начинаем с полной шкалы
    }
    
    // Скрыть индикатор таймера дефолта
    hideDefaultTimerBar() {
        if (this.defaultTimerBar) {
            this.defaultTimerBar.visible = false;
        }
    }
    
    // Очистка ресурсов
    destroy() {
        if (this.defaultTimerBar) {
            this.defaultTimerBar.destroy();
            this.defaultTimerBar = null;
        }
    }
}

export default DefaultTimerManager;