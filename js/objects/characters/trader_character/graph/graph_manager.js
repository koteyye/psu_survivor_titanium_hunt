// Основной менеджер графика
import { GraphConfigLoader } from './config_loader.js';
import { GraphZonesManager } from './zones_manager.js';
import { GraphPointsManager } from './points_manager.js';
import { GraphInteractionManager } from './interaction_manager.js';
import { GraphRenderer } from './renderer.js';

export class GraphManager {
    constructor(scene, character, localizationService) {
        this.scene = scene;
        this.character = character;
        this.localizationService = localizationService;
        
        // Создаем компоненты графика
        this.configLoader = new GraphConfigLoader();
        this.renderer = new GraphRenderer(scene, this.configLoader, localizationService);
        this.zonesManager = new GraphZonesManager(scene, localizationService, this.configLoader);
        this.pointsManager = new GraphPointsManager(scene, character, this.configLoader, this.zonesManager, localizationService);
        this.interactionManager = new GraphInteractionManager(scene, localizationService, this.zonesManager);
        
        // Таймер для обновления графика
        this.lastUpdateTime = 0;
        this.updateInterval = this.configLoader.getUpdateInterval();
    }
    
    // Создание графика
    create() {
        try {
            // Расчет позиции графика
            const position = this.configLoader.calculateGraphPosition(this.scene);
            
            // Создаем контейнер для графика
            const container = this.renderer.createContainer(position);
            
            // Создаем фон графика
            this.renderer.createBackground();
            
            // Создаем графику для зон и линии графика
            const zonesGraphics = this.renderer.createZonesGraphics();
            const graphGraphics = this.renderer.createGraphGraphics();
            
            // Отрисовываем зоны
            this.zonesManager.drawZones(zonesGraphics, this.renderer.getGraphDimensions().width);
            
            // Создаем метки графика
            this.renderer.createLabels();
            
            // Создаем метки зон
            this.zonesManager.createZoneLabels(container, this.configLoader.uiPositions.graph.labels.zoneLabel);
            
            // Создаем точки графика
            const points = this.pointsManager.createPoints(container, this.configLoader.uiPositions);
            
            // Инициализируем интерактивность
            this.interactionManager.init(
                points.controlPoint, 
                container, 
                this.configLoader.animations
            );
            
            return container;
        } catch (error) {
            console.error('Ошибка создания графика:', error);
            this.scene.events.emit('uiError', error);
            return null;
        }
    }
    
    // Обновление графика
    update() {
        try {
            // Обновляем график только с интервалом из конфига
            const currentTime = this.scene.time.now;
            if (currentTime - this.lastUpdateTime < this.updateInterval) {
                return this.getCurrentMultiplier();
            }
            this.lastUpdateTime = currentTime;
            
            // Обновляем точки графика
            this.pointsManager.updatePoints();
            
            // Отрисовка графика
            this.pointsManager.drawGraph(
                this.renderer.graphGraphics, 
                this.renderer.getGraphDimensions().width
            );
            
            // Обновление контрольной точки
            this.pointsManager.updateControlPoint();
            
            // Обновление интерактивности
            this.interactionManager.update();
            
            return this.getCurrentMultiplier();
        } catch (error) {
            console.error('Ошибка обновления графика:', error);
            return 0;
        }
    }
    
    // Получение текущего множителя
    getCurrentMultiplier() {
        return this.pointsManager.getCurrentMultiplier();
    }
    
    // Очистка ресурсов
    destroy() {
        try {
            // Уничтожаем компоненты в обратном порядке
            this.interactionManager.destroy();
            this.renderer.destroy();
        } catch (error) {
            console.error('Ошибка при уничтожении графика:', error);
        }
    }
}

export default GraphManager;