// Менеджер интерактивности графика
export class GraphInteractionManager {
    constructor(scene, localizationService, zonesManager) {
        this.scene = scene;
        this.localizationService = localizationService;
        this.zonesManager = zonesManager;
        
        // Элементы интерактивности
        this.multiplierTooltip = null;
        this.controlPoint = null;
        
        // Анимации
        this.animations = [];
    }
    
    // Инициализация интерактивности
    init(controlPoint, container, animations) {
        this.controlPoint = controlPoint;
        this.animations = [];
        
        // Создаем подсказку с множителем
        this._createMultiplierTooltip(container);
        
        // Добавляем интерактивность к контрольной точке
        this._setupControlPointInteraction();
        
        // Добавляем анимации
        if (animations && animations.controlPoint && animations.controlPoint.pulseEnabled) {
            this._setupControlPointAnimation(animations.controlPoint);
        }
    }
    
    // Создание подсказки с множителем
    _createMultiplierTooltip(container) {
        this.multiplierTooltip = this.scene.add.text(0, 0, '', {
            fontSize: '14px',
            fontFamily: 'Orbitron',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 },
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.multiplierTooltip.setVisible(false);
        container.add(this.multiplierTooltip);
    }
    
    // Настройка интерактивности контрольной точки
    _setupControlPointInteraction() {
        if (!this.controlPoint) return;
        
        this.controlPoint.setInteractive({ useHandCursor: true });
        this.controlPoint.on('pointerover', () => {
            this.updateMultiplierTooltip();
            this.multiplierTooltip.setVisible(true);
        });
        this.controlPoint.on('pointerout', () => {
            this.multiplierTooltip.setVisible(false);
        });
    }
    
    // Настройка анимации контрольной точки
    _setupControlPointAnimation(animConfig) {
        if (!this.controlPoint) return;
        
        const animation = this.scene.tweens.add({
            targets: this.controlPoint,
            scale: { from: animConfig.minScale, to: animConfig.maxScale },
            duration: animConfig.pulseRate,
            yoyo: true,
            repeat: -1
        });
        
        this.animations.push(animation);
    }
    
    // Обновление подсказки с множителем
    updateMultiplierTooltip() {
        if (!this.controlPoint || !this.multiplierTooltip) return;
        
        const y = this.controlPoint.y;
        const multiplier = this.zonesManager.getMultiplierByY(y);
        const zone = this.zonesManager.getZoneByY(y);
        
        this.multiplierTooltip.setText(
            this.localizationService.getText('graph.multiplierTooltip', { value: multiplier })
        );
        this.multiplierTooltip.setFill(zone.labelColor);
        this.multiplierTooltip.x = this.controlPoint.x;
        this.multiplierTooltip.y = this.controlPoint.y - 25;
    }
    
    // Обновление интерактивности
    update() {
        // Обновление подсказки если видна
        if (this.multiplierTooltip && this.multiplierTooltip.visible) {
            this.updateMultiplierTooltip();
        }
    }
    
    // Очистка ресурсов
    destroy() {
        // Отписываемся от событий
        if (this.controlPoint) {
            this.controlPoint.removeAllListeners();
        }
        
        // Останавливаем анимации
        this.animations.forEach(animation => {
            if (animation && animation.isPlaying) {
                animation.stop();
            }
        });
        
        // Очищаем ссылки
        this.animations = [];
        this.controlPoint = null;
        
        // Уничтожаем подсказку
        if (this.multiplierTooltip) {
            this.multiplierTooltip.destroy();
            this.multiplierTooltip = null;
        }
    }
}

export default GraphInteractionManager;