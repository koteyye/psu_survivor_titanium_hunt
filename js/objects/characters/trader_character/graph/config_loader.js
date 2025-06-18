// Загрузчик конфигураций для графика
import { ConfigManager } from '../../../../managers/config_manager.js';

export class GraphConfigLoader {
    constructor() {
        this.configManager = ConfigManager.getInstance();
        
        // Конфигурации
        this.graphColors = null;
        this.graphRules = null;
        this.graphStyle = null;
        this.uiPositions = null;
        this.animations = null;
        
        // Загружаем конфигурации
        this.loadConfigs();
    }
    
    // Загрузка всех конфигураций
    loadConfigs() {
        try {
            // Загружаем конфигурации трейдера
            this.graphColors = this.configManager.getConfig('characters/trader/graph_colors');
            this.graphRules = this.configManager.getConfig('characters/trader/graph_rules');
            this.graphStyle = this.configManager.getConfig('characters/trader/graph_style');
            this.uiPositions = this.configManager.getConfig('characters/trader/ui_positions');
            this.animations = this.configManager.getConfig('characters/trader/animations');
            
            // Проверяем наличие всех конфигов
            if (!this.graphColors || !this.graphRules || !this.graphStyle) {
                console.warn('Не все конфиги графика загружены, используются значения по умолчанию');
                this.loadDefaultConfigs();
            }
            
            // Создаем объединенный конфиг для обратной совместимости
            this.graphConfig = {
                colors: this.graphColors || {},
                zones: this.graphRules ? this.graphRules.zones : {},
                display: this.graphStyle || {}
            };
        } catch (error) {
            console.error('Ошибка загрузки конфигураций графика:', error);
            this.loadDefaultConfigs();
        }
    }
    
    // Загрузка конфигураций по умолчанию
    loadDefaultConfigs() {
        // Значения по умолчанию на случай отсутствия конфигов
        this.graphColors = {
            background: "0x000000",
            border: "0x00ff00",
            mainAxis: "0xffffff",
            lossZone: "0xff0000",
            x1Zone: "0x00aa00",
            x2Zone: "0x00dd00",
            x3Zone: "0x00ff00",
            startPoint: "0xffff00",
            controlPoint: "0x00ffff"
        };
        
        this.graphRules = {
            zones: {
                lossMultiplier: 0,
                x1Multiplier: 1,
                x2Multiplier: 2,
                x3Multiplier: 3
            },
            updateInterval: 100,
            graphBehavior: {
                directionChangeChance: 0.05,
                downwardTrendInPositiveZone: 0.3,
                downwardTrendInHighZone: 0.6,
                upwardTrendInNegativeZone: 0.2,
                randomMovementRange: {
                    min: 2,
                    max: 9
                }
            }
        };
        
        this.graphStyle = {
            levelSpacing: 25,
            maxPoints: 60,
            lineWidth: {
                lossZone: 2,
                x1Zone: 2,
                x2Zone: 2,
                x3Zone: 3
            },
            lineAlpha: {
                lossZone: 0.8,
                x1Zone: 0.7,
                x2Zone: 0.9,
                x3Zone: 1.0
            },
            controlPointSize: {
                lossZone: 8,
                x1Zone: 8,
                x2Zone: 9,
                x3Zone: 10
            },
            graphDimensions: {
                width: 300,
                height: 200
            }
        };
        
        this.animations = {
            controlPoint: {
                pulseEnabled: true,
                pulseRate: 600,
                minScale: 0.9,
                maxScale: 1.1
            }
        };
        
        // Обновляем объединенный конфиг
        this.graphConfig = {
            colors: this.graphColors,
            zones: this.graphRules.zones,
            display: this.graphStyle
        };
    }
    
    // Получение размеров графика
    getGraphDimensions() {
        return this.graphStyle && this.graphStyle.graphDimensions 
            ? this.graphStyle.graphDimensions 
            : { width: 300, height: 200 };
    }
    
    // Получение интервала обновления
    getUpdateInterval() {
        return this.graphRules && this.graphRules.updateInterval 
            ? this.graphRules.updateInterval 
            : 100;
    }
    
    // Получение расстояния между уровнями
    getLevelSpacing() {
        return this.graphStyle && this.graphStyle.levelSpacing 
            ? this.graphStyle.levelSpacing 
            : 25;
    }
    
    // Получение максимального количества точек
    getMaxPoints() {
        return this.graphStyle && this.graphStyle.maxPoints 
            ? this.graphStyle.maxPoints 
            : 60;
    }
    
    // Получение параметров поведения графика
    getGraphBehavior() {
        return this.graphRules && this.graphRules.graphBehavior 
            ? this.graphRules.graphBehavior 
            : {
                directionChangeChance: 0.05,
                downwardTrendInPositiveZone: 0.3,
                downwardTrendInHighZone: 0.6,
                upwardTrendInNegativeZone: 0.2,
                randomMovementRange: {
                    min: 2,
                    max: 9
                }
            };
    }
    
    // Расчет позиции графика на основе размера экрана
    calculateGraphPosition(scene) {
        if (this.uiPositions && this.uiPositions.graph) {
            const x = this.uiPositions.graph.x === "SCREEN_WIDTH-200" 
                ? scene.cameras.main.width - 200 
                : this.uiPositions.graph.x;
                
            return { 
                x: x, 
                y: this.uiPositions.graph.y 
            };
        }
        
        // Позиция по умолчанию
        return { 
            x: scene.cameras.main.width - 200, 
            y: 300 
        };
    }
}

export default GraphConfigLoader;