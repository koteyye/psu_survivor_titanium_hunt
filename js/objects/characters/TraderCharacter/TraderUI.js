// UI компоненты для персонажа Трейдер
import { CyberBar } from '../../../ui/index.js';

// Класс для управления UI компонентами трейдера
export class TraderUI {
    constructor(character) {
        this.character = character;
        this.scene = character.scene;
        
        // UI элементы
        this.moneyBar = null;
        this.basketText = null;
        this.investmentGraph = null;
        this.graphPoint = null;
    }
    
    // Создание шкалы денег
    createMoneyBar() {
        // Проверяем, загружена ли иконка денег
        if (this.scene.textures.exists('moneyIcon')) {
            // Создаем шкалу денег с помощью CyberBar
            this.moneyBar = new CyberBar(
                this.scene,
                300,
                150, // Позиция под шкалой здоровья
                this.character.money,
                {
                    width: 400,
                    height: 30,
                    iconKey: 'moneyIcon',
                    barColor: 0x00ff00, // Зеленый цвет
                    showValue: false // Убираем значение в процентах
                }
            );
        } else {
            console.warn('Текстура moneyIcon не найдена, шкала денег не будет отображаться');
        }
        
        // Создаем иконку корзины
        if (this.scene.textures.exists('basketIcon')) {
            this.basketIcon = this.scene.add.image(250, 200, 'basketIcon');
            this.basketIcon.setDisplaySize(48, 48);
            this.basketIcon.setOrigin(0.5);
            
            // Добавляем свечение для иконки
            const basketGlow = this.scene.add.image(250, 200, 'basketIcon');
            basketGlow.setDisplaySize(54, 54);
            basketGlow.setTint(0xffff00);
            basketGlow.setAlpha(0.5);
            basketGlow.setBlendMode(Phaser.BlendModes.ADD);
        } else {
            console.warn('Текстура basketIcon не найдена, иконка корзины не будет отображаться');
        }
        
        // Создаем текст для отображения значения корзины (без слова "Корзина")
        this.basketText = this.scene.add.text(
            300,
            200, // Позиция под шкалой денег
            `${this.character.basket}`,
            {
                fontFamily: 'Orbitron',
                fontSize: '24px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0, 0.5);
    }
    
    // Создание инвестиционного графика
    createInvestmentGraph() {
        // Создаем контейнер для графика
        this.investmentGraph = this.scene.add.container(1600, 300);
        
        // Фон графика
        const graphBg = this.scene.add.rectangle(0, 0, 300, 200, 0x000000, 0.7);
        graphBg.setStrokeStyle(2, 0x00ff00);
        this.investmentGraph.add(graphBg);
        
        // Определяем центр и расстояние между уровнями
        this.centerY = 0;
        this.levelSpacing = 25;
        
        // Создаем сетку
        this.createGraphGrid();
        
        // Создаём массив точек графика
        this.maxPoints = 60; // Количество точек в графике
        this.graphPoints = new Array(this.maxPoints).fill(this.centerY);
        
        // Графика линии
        this.graphGraphics = this.scene.add.graphics();
        this.investmentGraph.add(this.graphGraphics);
        
        // Добавляем начальную точку (точка отсчета)
        this.startPoint = this.scene.add.circle(-150, this.centerY, 6, 0xffff00);
        this.startPoint.setStrokeStyle(2, 0x000000);
        this.investmentGraph.add(this.startPoint);
        
        // Добавляем текст для начальной точки
        const startPointText = this.scene.add.text(-150, this.centerY - 15, 'СТАРТ', {
            fontSize: '12px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.investmentGraph.add(startPointText);
        
        // Добавляем контрольную точку (текущее положение)
        this.controlPoint = this.scene.add.circle(150, this.centerY, 8, 0x00ffff);
        this.controlPoint.setStrokeStyle(2, 0x000000);
        this.investmentGraph.add(this.controlPoint);
        
        // Заголовок графика
        const graphTitle = this.scene.add.text(0, -120, 'ИНВЕСТИЦИОННЫЙ ГРАФИК', {
            fontSize: '18px',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.investmentGraph.add(graphTitle);
        
        // Подсказка по управлению
        const sellHint = this.scene.add.text(0, 120, 'Нажмите W для продажи', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.investmentGraph.add(sellHint);
    }
    
    // Создание сетки графика
    createGraphGrid() {
        const graphics = this.scene.add.graphics();
        this.investmentGraph.add(graphics);
        
        // Главная ось (нулевая линия)
        graphics.lineStyle(2, 0xffffff);
        graphics.strokeLineShape(new Phaser.Geom.Line(-150, this.centerY, 150, this.centerY));
        
        // Положительные уровни (зеленые)
        graphics.lineStyle(1, 0x00ff00);
        for (let i = 1; i <= 3; i++) {
            const y = this.centerY - i * this.levelSpacing;
            graphics.strokeLineShape(new Phaser.Geom.Line(-150, y, 150, y));
        }
        
        // Отрицательный уровень (красный)
        graphics.lineStyle(1, 0xff0000);
        graphics.strokeLineShape(new Phaser.Geom.Line(-150, this.centerY + this.levelSpacing, 150, this.centerY + this.levelSpacing));
    }
    
    // Обновление инвестиционного графика
    updateInvestmentGraph() {
        // Удаляем первую точку
        this.graphPoints.shift();
        
        // Получаем последнюю точку
        let lastY = this.graphPoints[this.graphPoints.length - 1];
        
        // Случайное изменение направления с вероятностью 5%
        if (Math.random() < 0.05) {
            this.character.graphDirection *= -1;
        }
        
        // Если график находится в положительной зоне, увеличиваем вероятность
        // движения вниз до 30%
        if (lastY <= this.centerY && Math.random() < 0.3) {
            this.character.graphDirection = 1;
        }
        
        // Если график находится в высокой положительной зоне (x3),
        // увеличиваем вероятность движения вниз до 60%
        if (lastY < this.centerY - this.levelSpacing * 2 && Math.random() < 0.6) {
            this.character.graphDirection = 1;
        }
        
        // Если график находится в отрицательной зоне, увеличиваем вероятность
        // движения вверх до 20%
        if (lastY > this.centerY && Math.random() < 0.2) {
            this.character.graphDirection = -1;
        }
        
        // Создаем новую точку с небольшим случайным отклонением
        let newY = lastY + (Math.random() * 7 + 2) * this.character.graphDirection;
        
        // Ограничиваем значение в пределах графика
        const upper = this.centerY - this.levelSpacing * 3; // Верхняя граница
        const lower = this.centerY + this.levelSpacing;     // Нижняя граница
        newY = Phaser.Math.Clamp(newY, upper, lower);
        
        // Добавляем новую точку в конец массива
        this.graphPoints.push(newY);
        
        // Обновляем значение графика для использования в других методах
        this.character.graphValue = (this.centerY - newY) / (this.levelSpacing * 3) * 100;
        
        // Обновляем положение контрольной точки
        if (this.controlPoint) {
            this.controlPoint.y = newY;
            
            // Обновляем цвет контрольной точки в зависимости от значения
            if (newY <= this.centerY) {
                // Положительная зона - зеленый
                this.controlPoint.fillColor = 0x00ff00;
            } else {
                // Отрицательная зона - красный
                this.controlPoint.fillColor = 0xff0000;
            }
        }
        
        // Очищаем графику
        this.graphGraphics.clear();
        
        // Рисуем линию, соединяющую все точки
        for (let i = 0; i < this.graphPoints.length - 1; i++) {
            const x1 = -150 + i * 5;
            const x2 = x1 + 5;
            const y1 = this.graphPoints[i];
            const y2 = this.graphPoints[i + 1];
            
            // Определяем цвет в зависимости от высоты
            let color;
            if (y1 <= this.centerY) {
                // Положительная зона - зеленый
                const intensity = (this.centerY - y1) / (this.levelSpacing * 3);
                
                // Делаем цвет более ярким для высоких значений (x3)
                if (y1 < this.centerY - this.levelSpacing * 2) {
                    // Зона x3 - яркий зеленый
                    color = 0x00ff00;
                    this.graphGraphics.lineStyle(3, color, 1.0); // Толще и ярче
                } else if (y1 < this.centerY - this.levelSpacing) {
                    // Зона x2 - обычный зеленый
                    color = 0x00dd00;
                    this.graphGraphics.lineStyle(2, color, 0.9);
                } else {
                    // Зона x1 - тусклый зеленый
                    color = 0x00aa00;
                    this.graphGraphics.lineStyle(2, color, 0.7);
                }
            } else {
                // Отрицательная зона - красный
                color = 0xff0000;
                this.graphGraphics.lineStyle(2, color, 0.8);
            }
            
            // Рисуем отрезок линии
            this.graphGraphics.beginPath();
            this.graphGraphics.moveTo(x1, y1);
            this.graphGraphics.lineTo(x2, y2);
            this.graphGraphics.strokePath();
        }
    }
    
    // Обновление текста корзины
    updateBasketText() {
        if (this.basketText) {
            this.basketText.setText(`${this.character.basket}`);
        }
    }
    
    // Обновление шкалы денег
    updateMoneyBar() {
        if (this.moneyBar) {
            this.moneyBar.setValue(this.character.money);
        }
    }
    
    // Создание текста с эффектом исчезновения
    createFloatingText(text, color = '#ff0000', duration = 1500, yOffset = -100) {
        const floatingText = this.scene.add.text(
            this.character.sprite.x,
            this.character.sprite.y - 50,
            text,
            {
                fontSize: '24px',
                fill: color,
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Анимация исчезновения текста
        this.scene.tweens.add({
            targets: floatingText,
            y: floatingText.y + yOffset,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                floatingText.destroy();
            }
        });
        
        return floatingText;
    }
}