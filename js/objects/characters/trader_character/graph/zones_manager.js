// Менеджер зон графика
import { ConfigManager } from '../../../../managers/config_manager.js';

export class GraphZonesManager {
    constructor(scene, localizationService, configLoader) {
        this.scene = scene;
        this.localizationService = localizationService;
        this.configLoader = configLoader;
        
        // Центр графика и расстояние между уровнями
        this.centerY = 0;
        this.levelSpacing = this.configLoader.getLevelSpacing();
        
        // Кешируем зоны для быстрого доступа
        this.zoneCache = this._buildZoneCache();
    }
    
    // Построение кеша зон для быстрого доступа
    _buildZoneCache() {
        const colors = this.configLoader.graphColors;
        const rules = this.configLoader.graphRules;
        const style = this.configLoader.graphStyle;
        
        if (!colors || !rules || !style) {
            console.error('Не удалось загрузить конфигурации для зон графика');
            return [];
        }
        
        return [
            { 
                level: 0, 
                type: 'loss',
                color: colors.lossZone,
                multiplier: rules.zones.lossMultiplier,
                lineWidth: style.lineWidth.lossZone,
                lineAlpha: style.lineAlpha.lossZone,
                pointSize: style.controlPointSize.lossZone,
                y: this.centerY,
                height: this.levelSpacing,
                label: this.localizationService.getText('graph.zones.loss'),
                labelColor: "#ff0000",
                position: 'bottom'
            },
            { 
                level: 1, 
                type: 'x1',
                color: colors.x1Zone,
                multiplier: rules.zones.x1Multiplier,
                lineWidth: style.lineWidth.x1Zone,
                lineAlpha: style.lineAlpha.x1Zone,
                pointSize: style.controlPointSize.x1Zone,
                y: this.centerY - this.levelSpacing,
                height: this.levelSpacing,
                label: this.localizationService.getText('graph.zones.x1'),
                labelColor: "#00aa00"
            },
            { 
                level: 2, 
                type: 'x2',
                color: colors.x2Zone,
                multiplier: rules.zones.x2Multiplier,
                lineWidth: style.lineWidth.x2Zone,
                lineAlpha: style.lineAlpha.x2Zone,
                pointSize: style.controlPointSize.x2Zone,
                y: this.centerY - this.levelSpacing * 2,
                height: this.levelSpacing,
                label: this.localizationService.getText('graph.zones.x2'),
                labelColor: "#00dd00"
            },
            { 
                level: 3, 
                type: 'x3',
                color: colors.x3Zone,
                multiplier: rules.zones.x3Multiplier,
                lineWidth: style.lineWidth.x3Zone,
                lineAlpha: style.lineAlpha.x3Zone,
                pointSize: style.controlPointSize.x3Zone,
                y: this.centerY - this.levelSpacing * 3,
                height: this.levelSpacing,
                label: this.localizationService.getText('graph.zones.x3'),
                labelColor: "#00ff00"
            }
        ];
    }
    
    // Получение всех зон
    getAllZones() {
        return this.zoneCache;
    }
    
    // Получение зоны по Y-координате
    getZoneByY(y) {
        // Находим первую зону, в которой находится точка
        return this.zoneCache.find(zone => {
            if (zone.level === 0) {
                return y > zone.y;
            } else {
                return y > zone.y && y <= zone.y + zone.height;
            }
        }) || this.zoneCache[0]; // Возвращаем зону убытка по умолчанию
    }
    
    // Получение множителя по Y-координате
    getMultiplierByY(y) {
        const zone = this.getZoneByY(y);
        return zone.multiplier;
    }
    
    // Отрисовка зон на графике
    drawZones(graphics, width = 300) {
        const colors = this.configLoader.graphColors;
        
        // Отрисовка фоновых зон
        this.zoneCache.forEach(zone => {
            // Заливка зоны
            graphics.fillStyle(parseInt(zone.color, 16), 0.15);
            graphics.fillRect(-width/2, zone.y, width, zone.height);
            
            // Линия уровня (кроме нулевой)
            if (zone.level > 0) {
                graphics.lineStyle(1, parseInt(zone.color, 16));
                graphics.strokeLineShape(new Phaser.Geom.Line(-width/2, zone.y, width/2, zone.y));
            }
        });
        
        // Главная ось (нулевая линия)
        graphics.lineStyle(2, parseInt(colors.mainAxis, 16));
        graphics.strokeLineShape(new Phaser.Geom.Line(-width/2, this.centerY, width/2, this.centerY));
    }
    
    // Обновление стилей линии графика в зависимости от зоны
    updateLineStyle(graphics, y) {
        const zone = this.getZoneByY(y);
        graphics.lineStyle(
            zone.lineWidth, 
            parseInt(zone.color, 16), 
            zone.lineAlpha
        );
        return zone;
    }
    
    // Создание меток зон
    createZoneLabels(container, labelConfig) {
        const labels = [];
        
        this.zoneCache.forEach(zone => {
            // Добавляем метку для каждой зоны
            const label = this.scene.add.text(
                labelConfig.x,
                zone.y + zone.height/2,
                zone.label,
                {
                    fontSize: '12px',
                    fill: zone.labelColor,
                    stroke: '#000000',
                    strokeThickness: 1
                }
            ).setOrigin(labelConfig.originX, labelConfig.originY);
            
            container.add(label);
            labels.push(label);
        });
        
        return labels;
    }
    
    // Получение верхней и нижней границы графика
    getGraphBounds() {
        const upperZone = this.zoneCache[this.zoneCache.length - 1];
        const lowerZone = this.zoneCache[0];
        
        return {
            upper: upperZone.y,
            lower: lowerZone.y + lowerZone.height
        };
    }
}

export default GraphZonesManager;