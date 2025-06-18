/**
 * Singleton-менеджер для управления пулами объектов
 */
export class ObjectPoolManager {
    constructor() {
        // Объект для хранения пулов объектов
        this.pools = {};
    }
    
    /**
     * Получение экземпляра синглтона
     * @returns {ObjectPoolManager} Экземпляр ObjectPoolManager
     */
    static getInstance() {
        if (!ObjectPoolManager.instance) {
            ObjectPoolManager.instance = new ObjectPoolManager();
        }
        return ObjectPoolManager.instance;
    }
    
    /**
     * Создание нового пула объектов
     * @param {string} poolName - Имя пула
     * @param {Phaser.Scene} scene - Сцена
     * @param {string} textureKey - Ключ текстуры
     * @param {Function} configCallback - Функция для настройки объекта при создании
     * @param {number} initialSize - Начальный размер пула
     */
    createPool(poolName, scene, textureKey, configCallback = null, initialSize = 20) {
        // Проверяем, существует ли уже пул с таким именем
        if (this.pools[poolName]) {
            console.warn(`Пул с именем ${poolName} уже существует`);
            return;
        }
        
        // Создаем группу объектов
        const pool = scene.physics.add.group({
            defaultKey: textureKey,
            maxSize: 1000, // Максимальный размер пула
            active: false,
            visible: false
        });
        
        // Добавляем функцию настройки
        pool.configCallback = configCallback;
        
        // Создаем начальное количество объектов
        for (let i = 0; i < initialSize; i++) {
            const obj = pool.create(0, 0);
            obj.setActive(false).setVisible(false);
            
            // Применяем функцию настройки, если она есть
            if (configCallback) {
                configCallback(obj);
            }
        }
        
        // Сохраняем пул
        this.pools[poolName] = pool;
        
        return pool;
    }
    
    /**
     * Получение объекта из пула
     * @param {string} poolName - Имя пула
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {Object} config - Дополнительная конфигурация
     * @returns {Phaser.GameObjects.GameObject} Объект из пула
     */
    get(poolName, x, y, config = {}) {
        const pool = this.pools[poolName];
        
        if (!pool) {
            console.error(`Пул с именем ${poolName} не найден`);
            return null;
        }
        
        // Получаем объект из пула
        const obj = pool.get(x, y);
        
        // Если объект не получен (пул переполнен), возвращаем null
        if (!obj) {
            console.warn(`Не удалось получить объект из пула ${poolName} (пул переполнен)`);
            return null;
        }
        
        // Активируем объект
        obj.setActive(true).setVisible(true);
        
        // Применяем функцию настройки, если она есть
        if (pool.configCallback) {
            pool.configCallback(obj, config);
        }
        
        // Применяем дополнительные настройки из config
        Object.entries(config).forEach(([key, value]) => {
            if (typeof obj[key] === 'function') {
                obj[key](value);
            } else {
                obj[key] = value;
            }
        });
        
        return obj;
    }
    
    /**
     * Возврат объекта в пул
     * @param {string} poolName - Имя пула
     * @param {Phaser.GameObjects.GameObject} obj - Объект для возврата
     */
    release(poolName, obj) {
        const pool = this.pools[poolName];
        
        if (!pool) {
            console.error(`Пул с именем ${poolName} не найден`);
            return;
        }
        
        // Деактивируем объект и возвращаем в пул
        obj.setActive(false).setVisible(false);
        
        // Сбрасываем физические свойства
        if (obj.body) {
            obj.body.reset(0, 0);
            obj.body.setVelocity(0, 0);
            obj.body.setAcceleration(0, 0);
            obj.body.setAngularVelocity(0);
        }
        
        // Сбрасываем альфу и тинт
        obj.setAlpha(1);
        obj.clearTint();
        
        // Если объект не в пуле, добавляем его
        if (!pool.contains(obj)) {
            pool.add(obj);
        }
    }
    
    /**
     * Очистка пула (деактивация всех объектов)
     * @param {string} poolName - Имя пула
     */
    clearPool(poolName) {
        const pool = this.pools[poolName];
        
        if (!pool) {
            console.error(`Пул с именем ${poolName} не найден`);
            return;
        }
        
        // Деактивируем все объекты
        pool.getChildren().forEach(obj => {
            obj.setActive(false).setVisible(false);
            
            // Сбрасываем физические свойства
            if (obj.body) {
                obj.body.reset(0, 0);
            }
        });
    }
    
    /**
     * Удаление пула
     * @param {string} poolName - Имя пула
     */
    destroyPool(poolName) {
        const pool = this.pools[poolName];
        
        if (!pool) {
            console.error(`Пул с именем ${poolName} не найден`);
            return;
        }
        
        // Уничтожаем группу
        pool.destroy(true);
        
        // Удаляем ссылку на пул
        delete this.pools[poolName];
    }
    
    /**
     * Получение пула по имени
     * @param {string} poolName - Имя пула
     * @returns {Phaser.Physics.Arcade.Group} Пул объектов
     */
    getPool(poolName) {
        return this.pools[poolName] || null;
    }
    
    /**
     * Получение всех активных объектов из пула
     * @param {string} poolName - Имя пула
     * @returns {Array} Массив активных объектов
     */
    getActiveObjects(poolName) {
        const pool = this.pools[poolName];
        
        if (!pool) {
            console.error(`Пул с именем ${poolName} не найден`);
            return [];
        }
        
        return pool.getChildren().filter(obj => obj.active);
    }
    
    /**
     * Очистка всех пулов
     */
    clearAllPools() {
        Object.keys(this.pools).forEach(poolName => {
            this.clearPool(poolName);
        });
    }
    
    /**
     * Уничтожение всех пулов
     */
    destroyAllPools() {
        Object.keys(this.pools).forEach(poolName => {
            this.destroyPool(poolName);
        });
    }
}