// Менеджер точек графика
export class GraphPointsManager {
    constructor(scene, character, configLoader, zonesManager, localizationService) {
        this.scene = scene;
        this.character = character;
        this.configLoader = configLoader;
        this.zonesManager = zonesManager;
        this.localizationService = localizationService;
        
        // Параметры графика
        this.centerY = 0;
        this.levelSpacing = this.configLoader.getLevelSpacing();
        this.maxPoints = this.configLoader.getMaxPoints();
        
        // Массив точек графика
        this.points = new Array(this.maxPoints).fill(this.centerY);
        
        // Геометрические объекты для переиспользования
        this._graphLine = new Phaser.Geom.Line();
        
        // Элементы графика
        this.controlPoint = null;
        this.startPoint = null;
        this.multiplierTooltip = null;
    }
    
    // Создание точек графика
    createPoints(container, uiPositions) {
        const colors = this.configLoader.graphColors;
        const pointsConfig = uiPositions.graph.points;
        const startConfig = pointsConfig.start;
        const controlConfig = pointsConfig.control;
        
        // Добавляем начальную точку (точка отсчета)
        this.startPoint = this.scene.add.circle(
            startConfig.x, 
            this.centerY, 
            startConfig.radius, 
            parseInt(colors.startPoint, 16)
        );
        this.startPoint.setStrokeStyle(
            startConfig.strokeWidth, 
            parseInt(startConfig.strokeColor, 16)
        );
        container.add(this.startPoint);
        
        // Добавляем текст для начальной точки
        const startTextConfig = uiPositions.graph.labels.startPoint;
        const startPointText = this.scene.add.text(
            startConfig.x, 
            this.centerY + startTextConfig.y, 
            this.localizationService.getText('graph.startPointText'), 
            {
                fontSize: '12px',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(startTextConfig.originX, startTextConfig.originY);
        container.add(startPointText);
        
        // Добавляем контрольную точку (текущее положение)
        this.controlPoint = this.scene.add.circle(
            controlConfig.x, 
            this.centerY, 
            controlConfig.radius, 
            parseInt(colors.controlPoint, 16)
        );
        this.controlPoint.setStrokeStyle(
            controlConfig.strokeWidth, 
            parseInt(controlConfig.strokeColor, 16)
        );
        container.add(this.controlPoint);
        
        return {
            startPoint: this.startPoint,
            startPointText: startPointText,
            controlPoint: this.controlPoint
        };
    }
    
    // Обновление точек графика
    updatePoints() {
        // Удаляем первую точку
        this.points.shift();
        
        // Получаем последнюю точку
        let lastY = this.points[this.points.length - 1];
        
        // Получаем параметры поведения графика
        const behavior = this.configLoader.getGraphBehavior();
        
        // Случайное изменение направления с вероятностью из конфига
        if (Math.random() < behavior.directionChangeChance) {
            this.character.graphDirection *= -1;
        }
        
        // Если график находится в положительной зоне, увеличиваем вероятность
        // движения вниз
        if (lastY <= this.centerY && Math.random() < behavior.downwardTrendInPositiveZone) {
            this.character.graphDirection = 1;
        }
        
        // Если график находится в высокой положительной зоне (x3),
        // увеличиваем вероятность движения вниз
        if (lastY < this.centerY - this.levelSpacing * 2 && Math.random() < behavior.downwardTrendInHighZone) {
            this.character.graphDirection = 1;
        }
        
        // Если график находится в отрицательной зоне, увеличиваем вероятность
        // движения вверх
        if (lastY > this.centerY && Math.random() < behavior.upwardTrendInNegativeZone) {
            this.character.graphDirection = -1;
        }
        
        // Создаем новую точку с небольшим случайным отклонением
        const randomRange = behavior.randomMovementRange;
        const randomMovement = Math.random() * (randomRange.max - randomRange.min) + randomRange.min;
        let newY = lastY + randomMovement * this.character.graphDirection;
        
        // Ограничиваем значение в пределах графика
        const bounds = this.zonesManager.getGraphBounds();
        newY = Phaser.Math.Clamp(newY, bounds.upper, bounds.lower);
        
        // Добавляем новую точку в конец массива
        this.points.push(newY);
        
        // Обновляем значение графика для использования в других методах
        this.character.graphValue = this._calculateGraphValue(newY);
        
        return newY;
    }
    
    // Отрисовка линии графика
    drawGraph(graphics, width = 300) {
        // Очищаем графику
        graphics.clear();
        
        // Рисуем линию, соединяющую все точки
        for (let i = 0; i < this.points.length - 1; i++) {
            const x1 = -width/2 + i * (width / this.maxPoints);
            const x2 = -width/2 + (i + 1) * (width / this.maxPoints);
            const y1 = this.points[i];
            const y2 = this.points[i + 1];
            
            // Определяем стиль линии в зависимости от зоны
            this.zonesManager.updateLineStyle(graphics, y1);
            
            // Используем переиспользуемый объект линии
            this._graphLine.setTo(x1, y1, x2, y2);
            graphics.strokeLineShape(this._graphLine);
        }
    }
    
    // Обновление контрольной точки
    updateControlPoint() {
        if (!this.controlPoint) return;
        
        const newY = this.points[this.points.length - 1];
        
        // Обновляем положение контрольной точки
        this.controlPoint.y = newY;
        
        // Получаем зону для текущей позиции
        const zone = this.zonesManager.getZoneByY(newY);
        
        // Обновляем цвет и размер контрольной точки
        this.controlPoint.fillColor = parseInt(zone.color, 16);
        this.controlPoint.radius = zone.pointSize;
    }
    
    // Расчет значения графика в процентах (0-100)
    _calculateGraphValue(y) {
        const bounds = this.zonesManager.getGraphBounds();
        const range = bounds.lower - bounds.upper;
        return (bounds.lower - y) / range * 100;
    }
    
    // Получение текущего множителя
    getCurrentMultiplier() {
        if (!this.controlPoint) return 0;
        return this.zonesManager.getMultiplierByY(this.controlPoint.y);
    }
    
    // Получение текущих точек графика
    getPoints() {
        return this.points;
    }
}

export default GraphPointsManager;