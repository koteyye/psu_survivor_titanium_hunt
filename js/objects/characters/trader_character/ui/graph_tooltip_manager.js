// Менеджер подсказок для графика
import { BaseUIElement } from './base_ui_element.js';

export class GraphTooltipManager extends BaseUIElement {
    constructor(scene, character) {
        super(scene, character);
        
        // UI элементы
        this.tooltipContainer = null;
        this.tooltipBackground = null;
        this.tooltipText = null;
        
        // Состояние
        this.isTooltipVisible = false;
        this.currentTooltipTarget = null;
    }
    
    // Инициализация подсказок
    init() {
        // Создаем контейнер для подсказки
        this.createTooltipContainer();
        
        // Добавляем подсказки к элементам графика
        this.addTooltipsToGraphElements();
    }
    
    // Создание контейнера для подсказки
    createTooltipContainer() {
        const tooltipConfig = this.uiConfig.graph.tooltips;
        
        // Создаем фон подсказки
        this.tooltipBackground = this.scene.add.rectangle(
            0, 0, 200, 80,
            parseInt(tooltipConfig.backgroundColor, 16)
        ).setOrigin(0.5);
        
        // Добавляем границу
        this.tooltipBackground.setStrokeStyle(
            tooltipConfig.borderWidth,
            parseInt(tooltipConfig.borderColor, 16)
        );
        
        // Создаем текст подсказки
        this.tooltipText = this.scene.add.text(
            0, 0, '',
            {
                fontSize: '16px',
                fill: tooltipConfig.textColor,
                align: 'center',
                wordWrap: { width: 180 }
            }
        ).setOrigin(0.5);
        
        // Создаем контейнер и добавляем в него элементы
        this.tooltipContainer = this.scene.add.container(0, 0, [
            this.tooltipBackground,
            this.tooltipText
        ]);
        
        // Скрываем контейнер
        this.tooltipContainer.setAlpha(0);
        this.tooltipContainer.visible = false;
    }
    
    // Добавление подсказок к элементам графика
    addTooltipsToGraphElements() {
        // Получаем элементы графика
        const graphManager = this.character.ui.graphManager;
        if (!graphManager) return;
        
        // Добавляем подсказки к зонам графика
        const zones = graphManager.zonesManager.getZones();
        if (zones) {
            // Красная зона
            this.addTooltipToElement(
                zones.redZone, 
                this.uiConfig.graph.tooltipTexts.redZone
            );
            
            // Желтая зона
            this.addTooltipToElement(
                zones.yellowZone, 
                this.uiConfig.graph.tooltipTexts.yellowZone
            );
            
            // Зеленая зона
            this.addTooltipToElement(
                zones.greenZone, 
                this.uiConfig.graph.tooltipTexts.greenZone
            );
        }
        
        // Добавляем подсказку к контрольной точке
        const controlPoint = graphManager.pointsManager.getControlPoint();
        if (controlPoint) {
            this.addTooltipToElement(
                controlPoint,
                this.uiConfig.graph.tooltipTexts.controlPoint.replace(
                    '{value}', 
                    graphManager.getCurrentMultiplier().toFixed(2)
                ),
                true // Динамическое обновление
            );
        }
    }
    
    // Добавление подсказки к элементу
    addTooltipToElement(element, text, isDynamic = false) {
        if (!element || !this.uiConfig.graph.tooltips.enabled) return;
        
        // Делаем элемент интерактивным
        element.setInteractive();
        
        // Добавляем обработчики событий
        element.on('pointerover', () => {
            // Обновляем текст для динамических подсказок
            if (isDynamic && element === this.character.ui.graphManager.pointsManager.getControlPoint()) {
                text = this.uiConfig.graph.tooltipTexts.controlPoint.replace(
                    '{value}', 
                    this.character.ui.graphManager.getCurrentMultiplier().toFixed(2)
                );
            }
            
            this.showTooltip(element, text);
        });
        
        element.on('pointerout', () => {
            this.hideTooltip();
        });
        
        element.on('pointermove', (pointer) => {
            this.updateTooltipPosition(pointer.x, pointer.y);
        });
    }
    
    // Показать подсказку
    showTooltip(target, text) {
        if (!this.tooltipContainer) return;
        
        // Сохраняем текущую цель
        this.currentTooltipTarget = target;
        
        // Обновляем текст
        this.tooltipText.setText(text);
        
        // Обновляем размер фона
        const padding = this.uiConfig.graph.tooltips.padding;
        const textBounds = this.tooltipText.getBounds();
        this.tooltipBackground.width = textBounds.width + padding * 2;
        this.tooltipBackground.height = textBounds.height + padding * 2;
        
        // Позиционируем подсказку
        const targetBounds = target.getBounds();
        this.tooltipContainer.x = targetBounds.centerX;
        this.tooltipContainer.y = targetBounds.top - 20;
        
        // Показываем подсказку с анимацией
        this.tooltipContainer.visible = true;
        this.scene.tweens.add({
            targets: this.tooltipContainer,
            alpha: this.uiConfig.graph.tooltips.alpha,
            duration: this.uiConfig.graph.tooltips.fadeInDuration,
            ease: 'Power2'
        });
        
        this.isTooltipVisible = true;
    }
    
    // Скрыть подсказку
    hideTooltip() {
        if (!this.tooltipContainer || !this.isTooltipVisible) return;
        
        // Скрываем подсказку с анимацией
        this.scene.tweens.add({
            targets: this.tooltipContainer,
            alpha: 0,
            duration: this.uiConfig.graph.tooltips.fadeOutDuration,
            ease: 'Power2',
            onComplete: () => {
                this.tooltipContainer.visible = false;
                this.currentTooltipTarget = null;
            }
        });
        
        this.isTooltipVisible = false;
    }
    
    // Обновление позиции подсказки
    updateTooltipPosition(x, y) {
        if (!this.tooltipContainer || !this.isTooltipVisible) return;
        
        // Обновляем позицию подсказки
        this.tooltipContainer.x = x;
        this.tooltipContainer.y = y - 40; // Смещаем вверх от курсора
    }
    
    // Обновление подсказок
    update() {
        // Обновляем текст для динамических подсказок
        if (this.isTooltipVisible && this.currentTooltipTarget === this.character.ui.graphManager.pointsManager.getControlPoint()) {
            const text = this.uiConfig.graph.tooltipTexts.controlPoint.replace(
                '{value}', 
                this.character.ui.graphManager.getCurrentMultiplier().toFixed(2)
            );
            this.tooltipText.setText(text);
            
            // Обновляем размер фона
            const padding = this.uiConfig.graph.tooltips.padding;
            const textBounds = this.tooltipText.getBounds();
            this.tooltipBackground.width = textBounds.width + padding * 2;
            this.tooltipBackground.height = textBounds.height + padding * 2;
        }
    }
    
    // Очистка ресурсов
    destroy() {
        if (this.tooltipContainer) {
            this.tooltipContainer.destroy();
            this.tooltipContainer = null;
            this.tooltipBackground = null;
            this.tooltipText = null;
        }
    }
}

export default GraphTooltipManager;