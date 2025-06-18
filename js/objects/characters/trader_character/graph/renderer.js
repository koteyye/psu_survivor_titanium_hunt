// Рендерер графика
export class GraphRenderer {
    constructor(scene, configLoader, localizationService) {
        this.scene = scene;
        this.configLoader = configLoader;
        this.localizationService = localizationService;
        
        // Контейнер графика
        this.container = null;
        
        // Графические элементы
        this.background = null;
        this.graphGraphics = null;
        this.zonesGraphics = null;
        this.labels = [];
    }
    
    // Создание контейнера графика
    createContainer(position) {
        this.container = this.scene.add.container(position.x, position.y);
        return this.container;
    }
    
    // Создание фона графика
    createBackground() {
        const colors = this.configLoader.graphColors;
        const dimensions = this.configLoader.getGraphDimensions();
        
        // Фон графика
        this.background = this.scene.add.rectangle(
            0, 0, 
            dimensions.width, 
            dimensions.height, 
            parseInt(colors.background, 16), 
            0.7
        );
        this.background.setStrokeStyle(2, parseInt(colors.border, 16));
        this.container.add(this.background);
        
        return this.background;
    }
    
    // Создание графики для зон
    createZonesGraphics() {
        this.zonesGraphics = this.scene.add.graphics();
        this.container.add(this.zonesGraphics);
        return this.zonesGraphics;
    }
    
    // Создание графики для линии графика
    createGraphGraphics() {
        this.graphGraphics = this.scene.add.graphics();
        this.container.add(this.graphGraphics);
        return this.graphGraphics;
    }
    
    // Создание меток графика
    createLabels() {
        const uiPositions = this.configLoader.uiPositions;
        if (!uiPositions || !uiPositions.graph || !uiPositions.graph.labels) {
            console.warn('Не удалось загрузить конфигурацию позиций меток графика');
            return [];
        }
        
        const labelsConfig = uiPositions.graph.labels;
        
        // Заголовок графика
        const titleConfig = labelsConfig.title;
        const graphTitle = this.scene.add.text(
            titleConfig.x, 
            titleConfig.y, 
            this.localizationService.getText('graph.title'), 
            {
                fontSize: '18px',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(titleConfig.originX, titleConfig.originY);
        this.container.add(graphTitle);
        this.labels.push(graphTitle);
        
        // Подсказка по управлению
        const hintConfig = labelsConfig.sellHint;
        const sellHint = this.scene.add.text(
            hintConfig.x, 
            hintConfig.y, 
            this.localizationService.getText('graph.sellHint'), 
            {
                fontSize: '16px',
                fill: '#ffffff'
            }
        ).setOrigin(hintConfig.originX, hintConfig.originY);
        this.container.add(sellHint);
        this.labels.push(sellHint);
        
        return this.labels;
    }
    
    // Получение размеров графика
    getGraphDimensions() {
        return this.configLoader.getGraphDimensions();
    }
    
    // Очистка ресурсов
    destroy() {
        // Уничтожаем метки
        this.labels.forEach(label => {
            if (label) {
                label.destroy();
            }
        });
        this.labels = [];
        
        // Уничтожаем графику
        if (this.graphGraphics) {
            this.graphGraphics.destroy();
            this.graphGraphics = null;
        }
        
        if (this.zonesGraphics) {
            this.zonesGraphics.destroy();
            this.zonesGraphics = null;
        }
        
        // Уничтожаем фон
        if (this.background) {
            this.background.destroy();
            this.background = null;
        }
        
        // Уничтожаем контейнер
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}

export default GraphRenderer;