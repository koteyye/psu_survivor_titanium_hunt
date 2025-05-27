// Класс персонажа "Вован - Алиэксперсс"
import { BaseCharacter } from './BaseCharacter.js';

export class ZummerCharacter extends BaseCharacter {
    constructor(scene, x, y) {
        super(scene, x, y, 'zummer');
        
        // Особые характеристики Вована
        this.damageReduction = 5;  // Получает меньше урона
        this.rageMode = false;     // Режим ярости
        this.rageMeter = 0;        // Счетчик ярости
        this.rageBar = null;       // Полоса ярости
        
        // Проверяем, загружена ли иконка ярости
        if (this.scene.textures.exists('rageIcon')) {
            // Создаем полосу ярости
            this.createRageBar();
        } else {
            console.warn('Текстура rageIcon не найдена, полоса ярости не будет отображаться');
        }
    }
    
    getCharacterId() {
        return 'zoomer';
    }
    
    // Создание полосы ярости
    createRageBar() {
        // Создаем контейнер для полосы ярости
        const rageContainer = this.scene.add.container(100, 140);
        
        // Иконка ярости (используем запасной вариант, если текстура не найдена)
        let rageIcon;
        if (this.scene.textures.exists('rageIcon')) {
            rageIcon = this.scene.add.image(0, 0, 'rageIcon').setDisplaySize(40, 40);
        } else {
            // Создаем красный квадрат как запасной вариант
            rageIcon = this.scene.add.rectangle(0, 0, 40, 40, 0xff0000);
        }
        rageContainer.add(rageIcon);
        
        // Фон полосы ярости
        const rageBarBg = this.scene.add.rectangle(70, 0, 200, 20, 0x222222);
        rageContainer.add(rageBarBg);
        
        // Полоса ярости
        this.rageBar = this.scene.add.rectangle(70, 0, 0, 16, 0xff0000);
        this.rageBar.setOrigin(0, 0.5);
        this.rageBar.x = rageBarBg.x - rageBarBg.width / 2 + 2;
        rageContainer.add(this.rageBar);
        
        // Текст ярости
        this.rageText = this.scene.add.text(70, 0, 'Ярость: 0%', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setOrigin(0.5);
        rageContainer.add(this.rageText);
        
        // Сохраняем контейнер
        this.rageContainer = rageContainer;
    }
    
    // Обновление полосы ярости
    updateRageBar() {
        if (!this.rageBar) return;
        
        // Обновляем ширину полосы в зависимости от уровня ярости
        const maxWidth = 196; // Максимальная ширина полосы
        const width = (this.rageMeter / 100) * maxWidth;
        this.rageBar.width = width;
        
        // Обновляем текст
        this.rageText.setText(`Ярость: ${Math.floor(this.rageMeter)}%`);
        
        // Если ярость достигла 100%, активируем режим ярости
        if (this.rageMeter >= 100 && !this.rageMode) {
            this.activateRageMode();
        }
    }
    
    // Активация режима ярости
    activateRageMode() {
        this.rageMode = true;
        
        // Визуальный эффект
        this.sprite.setTint(0xff4444);
        
        // Создаем эффект активации
        const rageText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 50,
            'РЕЖИМ ЯРОСТИ!',
            {
                fontSize: '32px',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);
        
        // Анимация текста
        this.scene.tweens.add({
            targets: rageText,
            y: rageText.y - 100,
            alpha: 0,
            duration: 2000,
            onComplete: () => {
                rageText.destroy();
            }
        });
        
        // Таймер деактивации режима ярости (10 секунд)
        this.scene.time.delayedCall(10000, () => {
            this.deactivateRageMode();
        });
    }
    
    // Деактивация режима ярости
    deactivateRageMode() {
        this.rageMode = false;
        this.rageMeter = 0;
        this.updateRageBar();
        
        // Убираем визуальный эффект
        this.sprite.clearTint();
    }
    
    // Переопределяем метод сбора хорошего предмета
    collectGoodItem(item) {
        // Вызываем базовый метод
        super.collectGoodItem(item);
        
        // Увеличиваем ярость
        this.increaseRage(5);
    }
    
    // Переопределяем метод сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        // Вызываем базовый метод
        super.collectVeryGoodItem(item);
        
        // Увеличиваем ярость
        this.increaseRage(10);
    }
    
    // Переопределяем метод столкновения с плохим предметом
    hitBadItem(item) {
        // В режиме ярости получаем меньше урона
        if (this.rageMode) {
            // Временно увеличиваем уменьшение урона
            const originalDamageReduction = this.damageReduction;
            this.damageReduction = 15;
            
            // Вызываем базовый метод
            super.hitBadItem(item);
            
            // Возвращаем исходное значение
            this.damageReduction = originalDamageReduction;
        } else {
            // Вызываем базовый метод
            super.hitBadItem(item);
            
            // Увеличиваем ярость при получении урона
            this.increaseRage(20);
        }
    }
    
    // Метод увеличения ярости
    increaseRage(amount) {
        // Если режим ярости уже активен, не увеличиваем счетчик
        if (this.rageMode) return;
        
        // Увеличиваем счетчик ярости
        this.rageMeter = Math.min(this.rageMeter + amount, 100);
        
        // Обновляем полосу ярости
        this.updateRageBar();
    }
    
    // Переопределяем метод update
    update() {
        // Вызываем базовый метод
        super.update();
        
        // В режиме ярости увеличиваем скорость
        if (this.rageMode) {
            // Базовая скорость движения
            const baseSpeed = 400;
            
            // Применяем множитель скорости персонажа с бонусом ярости
            const moveSpeed = baseSpeed * this.speed * 1.5;
            
            // Сбрасываем скорость
            this.sprite.setVelocity(0);
            
            // Обрабатываем нажатия клавиш
            if (window.cursors.left.isDown) {
                this.sprite.setVelocityX(-moveSpeed);
            } else if (window.cursors.right.isDown) {
                this.sprite.setVelocityX(moveSpeed);
            }
        }
    }
}