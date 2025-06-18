/**
 * Singleton-менеджер для управления конфигурациями игры
 */
export class ConfigManager {
    constructor() {
        // Приватный объект для хранения конфигураций
        this.configs = {};
        
        // Флаг, указывающий, загружены ли все конфиги
        this.isLoaded = false;
    }
    
    /**
     * Получение экземпляра синглтона
     * @returns {ConfigManager} Экземпляр ConfigManager
     */
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    
    /**
     * Загрузка конфигурации из кэша Phaser
     * @param {Phaser.Scene} scene - Сцена для доступа к кэшу
     * @param {string} key - Ключ конфигурации
     * @param {string} cacheKey - Ключ в кэше Phaser
     */
    loadFromCache(scene, key, cacheKey) {
        try {
            const config = scene.cache.json.get(cacheKey);
            this.configs[key] = config;
            console.log(`Конфиг ${key} успешно загружен из кэша`);
            return config;
        } catch (error) {
            console.error(`Ошибка загрузки конфига ${key} из кэша:`, error);
            return null;
        }
    }
    
    /**
     * Установка конфигурации
     * @param {string} key - Ключ конфигурации
     * @param {Object} config - Объект конфигурации
     */
    setConfig(key, config) {
        this.configs[key] = config;
    }
    
    /**
     * Получение конфигурации
     * @param {string} key - Ключ конфигурации
     * @returns {Object} Объект конфигурации
     */
    getConfig(key) {
        return this.configs[key] || null;
    }
    
    /**
     * Получение значения из конфигурации по пути
     * @param {string} key - Ключ конфигурации
     * @param {string} path - Путь к значению (например, 'player.health')
     * @param {*} defaultValue - Значение по умолчанию, если путь не найден
     * @returns {*} Значение из конфигурации или значение по умолчанию
     */
    getValue(key, path, defaultValue = null) {
        const config = this.getConfig(key);
        if (!config) return defaultValue;
        
        const parts = path.split('.');
        let value = config;
        
        for (const part of parts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return defaultValue;
            }
            value = value[part];
            if (value === undefined) {
                return defaultValue;
            }
        }
        
        return value !== undefined ? value : defaultValue;
    }
    
    /**
     * Проверка, загружены ли все конфиги
     * @returns {boolean} true, если все конфиги загружены
     */
    areConfigsLoaded() {
        return this.isLoaded;
    }
    
    /**
     * Установка флага загрузки конфигов
     * @param {boolean} loaded - Флаг загрузки
     */
    setConfigsLoaded(loaded) {
        this.isLoaded = loaded;
    }
}