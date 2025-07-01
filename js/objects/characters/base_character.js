// Базовый класс для всех персонажей игры
import { ConfigManager, EventManager, AudioManager, ObjectPoolManager } from '../../managers/index.js';

export class BaseCharacter {
    constructor(scene, x, y, texture) {
        this.scene = scene;
        this.texture = texture;
        
        // Получаем менеджеры
        this.configManager = ConfigManager.getInstance();
        this.eventManager = EventManager.getInstance();
        this.audioManager = AudioManager.getInstance();
        this.objectPoolManager = ObjectPoolManager.getInstance();
        
        // Создаем спрайт персонажа
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setCollideWorldBounds(true);
        
        // Проверяем создание физического тела
        console.log(`Спрайт персонажа создан: ${texture}`);
        console.log('Физическое тело спрайта:', this.sprite.body);
        
        // Получаем размеры из конфига
        const displaySize = this.configManager.getValue('core', 'player.displaySize', { width: 200, height: 300 });
        this.sprite.setDisplaySize(displaySize.width, displaySize.height);
        
        // Загружаем базовые характеристики из конфига
        const characterId = this.getCharacterId();
        const baseStats = this.configManager.getValue('characters/base_stat', characterId, {});
        
        // Базовые характеристики
        this.speed = baseStats.speed ? baseStats.speed / 100 : 1.0;
        this.moneyMultiplier = 1.0;
        this.healthBonus = 0;
        this.damageReduction = 0;
        
        // Загружаем механики персонажа, если они есть
        if (baseStats.mechanics) {
            this.loadMechanics(baseStats.mechanics);
        }
        
        // Загружаем навыки персонажа, если они есть
        if (baseStats.skills) {
            this.loadSkills(baseStats.skills);
        }
        
        // Звуки персонажа
        this.sounds = {
            select: null,
            bad_psu_1: null,
            bad_psu_2: null,
            super_psu_1: null,
            super_psu_2: null,
            dead: null
        };
        
        // Инициализируем звуки
        this.initSounds();
        
        // Сохраняем ссылку на персонажа в спрайте для доступа в коллбэках
        this.sprite.character = this;
        
        // Сохраняем спрайт в Registry вместо window.*
        scene.registry.set('playerSprite', this.sprite);
        scene.registry.set('gameCharacter', this);
    }
    
    // Загрузка механик персонажа
    loadMechanics(mechanicsPath) {
        try {
            // Загружаем механики из конфига
            const mechanicsConfig = this.configManager.getConfig(`characters/${mechanicsPath}`);
            if (!mechanicsConfig) return;
            
            const characterId = this.getCharacterId();
            const mechanics = mechanicsConfig[characterId];
            if (!mechanics) return;
            
            // Применяем механики
            if (mechanics.damageReduction !== undefined) {
                this.damageReduction = mechanics.damageReduction;
            }
            
            if (mechanics.healthBonus !== undefined) {
                this.healthBonus = mechanics.healthBonus;
            }
            
            if (mechanics.moneyMultiplier !== undefined) {
                this.moneyMultiplier = mechanics.moneyMultiplier;
            }
            
            // Другие механики могут быть добавлены в дочерних классах
        } catch (error) {
            console.error(`Ошибка загрузки механик для персонажа ${this.getCharacterId()}:`, error);
        }
    }
    
    // Загрузка навыков персонажа
    loadSkills(skillsPath) {
        try {
            // Загружаем навыки из конфига
            const skillsConfig = this.configManager.getConfig(`characters/${skillsPath}`);
            if (!skillsConfig) return;
            
            // Навыки обрабатываются в дочерних классах
        } catch (error) {
            console.error(`Ошибка загрузки навыков для персонажа ${this.getCharacterId()}:`, error);
        }
    }
    
    // Инициализация звуков персонажа
    initSounds() {
        const characterId = this.getCharacterId();
        
        // Загружаем звуки через AudioManager
        try {
            this.audioManager.addSound(`${characterId}_select`, `gameplay/replicas/${characterId}/select`, { volume: 0.8 });
            this.audioManager.addSound(`${characterId}_bad_psu_1`, `gameplay/replicas/${characterId}/bad_psu_1`, { volume: 0.8 });
            this.audioManager.addSound(`${characterId}_bad_psu_2`, `gameplay/replicas/${characterId}/bad_psu_2`, { volume: 0.8 });
            this.audioManager.addSound(`${characterId}_super_psu_1`, `gameplay/replicas/${characterId}/super_psu_1`, { volume: 0.8 });
            this.audioManager.addSound(`${characterId}_super_psu_2`, `gameplay/replicas/${characterId}/super_psu_2`, { volume: 0.8 });
            this.audioManager.addSound(`${characterId}_dead`, `gameplay/replicas/${characterId}/dead`, { volume: 0.8 });
            console.log(`Звуки для персонажа ${characterId} успешно загружены через AudioManager`);
        } catch (error) {
            console.error(`Ошибка при загрузке звуков для персонажа ${characterId}:`, error);
        }
    }
    
    // Получение ID персонажа (переопределяется в дочерних классах)
    getCharacterId() {
        return 'base';
    }
    
    // Воспроизведение звука выбора персонажа
    playSelectSound() {
        const characterId = this.getCharacterId();
        this.audioManager.playSound(`${characterId}_select`);
    }
    
    // Воспроизведение звука при сборе плохого блока питания
    playBadPsuSound() {
        // Воспроизводим с шансом 20%
        if (Math.random() < 0.2) {
            const characterId = this.getCharacterId();
            // Случайно выбираем между двумя репликами
            const soundKey = Math.random() < 0.5 ? `${characterId}_bad_psu_1` : `${characterId}_bad_psu_2`;
            this.audioManager.playSound(soundKey);
        }
    }
    
    // Воспроизведение звука при сборе супер блока питания
    playSuperPsuSound() {
        // Воспроизводим с шансом 70%
        if (Math.random() < 0.7) {
            const characterId = this.getCharacterId();
            // Случайно выбираем между двумя репликами
            const soundKey = Math.random() < 0.5 ? `${characterId}_super_psu_1` : `${characterId}_super_psu_2`;
            this.audioManager.playSound(soundKey);
        }
    }
    
    // Воспроизведение звука при смерти
    playDeadSound() {
        const characterId = this.getCharacterId();
        this.audioManager.playSound(`${characterId}_dead`);
    }
    
    // Обработка сбора хорошего предмета
    collectGoodItem(item) {
        // Базовая реализация для обычных персонажей
        this._processGoodItem(item);
    }
    
    // Обработка сбора очень хорошего предмета
    collectVeryGoodItem(item) {
        // Базовая реализация для обычных персонажей
        this._processVeryGoodItem(item);
    }
    
    // Обработка столкновения с плохим предметом
    hitBadItem(item) {
        // Базовая реализация для обычных персонажей
        this._processBadItem(item);
    }
    
    // Защищенные методы для обработки предметов (могут быть переопределены)
    
    // Обработка хорошего предмета (базовая реализация)
    _processGoodItem(item) {
        // Получаем конфигурацию предмета
        const itemConfig = this.configManager.getValue('core', 'items.good', {});
        const points = itemConfig.points || 10;
        
        // Применяем множитель денег
        const finalPoints = Math.floor(points * this.moneyMultiplier);
        
        // Получаем текущий счет из Registry
        let score = this.scene.registry.get('score') || 0;
        
        // Увеличиваем счет
        score += finalPoints;
        this.scene.registry.set('score', score);
        
        // Оповещаем об изменении счета через Event Bus
        this.eventManager.emit('SCORE_UPDATE', score);
        
        // Возвращаем предмет в пул
        this.objectPoolManager.release('goodItems', item);
        
        // Оповещаем о сборе предмета через Event Bus
        this.eventManager.emit('ITEM_COLLECTED', { type: 'good', points: finalPoints });
    }
    
    // Обработка очень хорошего предмета (базовая реализация)
    _processVeryGoodItem(item) {
        // Получаем конфигурацию предмета
        const itemConfig = this.configManager.getValue('core', 'items.veryGood', {});
        const points = itemConfig.points || 20;
        const baseHealthBonus = itemConfig.healthBonus || 10;
        
        // Проигрываем реплику персонажа
        this.playSuperPsuSound();
        
        // Применяем множитель денег и бонус здоровья
        const finalPoints = Math.floor(points * this.moneyMultiplier);
        const healthBonus = baseHealthBonus + this.healthBonus;
        
        // Получаем текущий счет и здоровье из Registry
        let score = this.scene.registry.get('score') || 0;
        let health = this.scene.registry.get('health') || 100;
        
        // Увеличиваем счет и здоровье
        score += finalPoints;
        health = Math.min(health + healthBonus, 100);
        
        // Обновляем Registry
        this.scene.registry.set('score', score);
        this.scene.registry.set('health', health);
        
        // Оповещаем об изменении счета и здоровья через Event Bus
        this.eventManager.emit('SCORE_UPDATE', score);
        this.eventManager.emit('HEALTH_UPDATE', health);
        
        // Возвращаем предмет в пул
        this.objectPoolManager.release('veryGoodItems', item);
        
        // Оповещаем о сборе предмета через Event Bus
        this.eventManager.emit('ITEM_COLLECTED', { type: 'veryGood', points: finalPoints, healthBonus });
    }
    
    // Обработка плохого предмета (базовая реализация)
    _processBadItem(item) {
        // Получаем конфигурацию предмета
        const itemConfig = this.configManager.getValue('core', 'items.bad', {});
        const baseDamage = itemConfig.damage || 20;
        
        // Создаем эффект взрыва
        this.createExplosionEffect(item.x, item.y);
        
        // Проигрываем звук взрыва
        this.audioManager.playSound('explosionSound');
        
        // Проигрываем реплику персонажа
        this.playBadPsuSound();
        
        // Базовый урон с учетом уменьшения урона персонажа
        const damage = Math.max(5, baseDamage - this.damageReduction);
        
        // Получаем текущее здоровье из Registry
        let health = this.scene.registry.get('health') || 100;
        
        // Уменьшаем здоровье
        health -= damage;
        
        // Обновляем Registry
        this.scene.registry.set('health', health);
        
        // Оповещаем об изменении здоровья через Event Bus
        this.eventManager.emit('HEALTH_UPDATE', health);
        
        // Проверяем, не закончилась ли игра
        if (health <= 0) {
            this.scene.registry.set('health', 0);
            this.scene.registry.set('gameOver', true);
            
            // Проигрываем реплику смерти
            this.playDeadSound();
            
            // Оповещаем о конце игры через Event Bus
            this.eventManager.emit('GAME_OVER');
            
            // Останавливаем игру
            this.scene.physics.pause();
            this.sprite.setTint(0xff0000);
        }
        
        // Возвращаем предмет в пул
        this.objectPoolManager.release('badItems', item);
        
        // Оповещаем о столкновении с предметом через Event Bus
        this.eventManager.emit('ITEM_HIT', { type: 'bad', damage });
    }
    
    // Создание эффекта взрыва
    createExplosionEffect(x, y) {
        console.log('Создаем эффект взрыва в позиции:', x, y);
        
        // Получаем пул взрывов
        const explosion = this.objectPoolManager.get('explosions', x, y, {
            setDisplaySize: [600, 600],
            setOrigin: [0.5, 0.5],
            setFlipY: false
        });
        
        if (!explosion) {
            console.error('Не удалось получить объект взрыва из пула!');
            return null;
        }
        
        console.log('Объект взрыва получен:', explosion);
        
        // Проверяем доступность анимации
        if (!this.scene.anims.exists('explode')) {
            console.error('Анимация explode не найдена!');
            return explosion;
        }
        
        console.log('Анимация explode найдена, запускаем...');
        
        // Запускаем анимацию
        try {
            explosion.play('explode');
            console.log('Анимация explode запущена');
        } catch (error) {
            console.error('Ошибка при запуске анимации взрыва:', error);
        }
        
        // Добавляем обработчик завершения анимации
        explosion.once('animationcomplete', () => {
            console.log('Анимация взрыва завершена');
            if (explosion && explosion.active) {
                this.objectPoolManager.release('explosions', explosion);
            }
        });
        
        return explosion;
    }
    
    // Обновление движения персонажа
    update() {
        // Получаем базовую скорость из конфига
        const baseSpeed = this.configManager.getValue('core', 'player.defaultSpeed', 400);
        
        // Применяем множитель скорости персонажа
        const moveSpeed = baseSpeed * this.speed;
        
        // Сбрасываем скорость
        this.sprite.setVelocity(0);
        
        // Получаем курсоры из Registry
        const cursors = this.scene.registry.get('cursors');
        if (!cursors) return;
        
        // Обрабатываем нажатия клавиш
        if (cursors.left.isDown) {
            this.sprite.setVelocityX(-moveSpeed);
        } else if (cursors.right.isDown) {
            this.sprite.setVelocityX(moveSpeed);
        }
    }
}