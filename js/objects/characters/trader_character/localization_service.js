// Сервис для работы с локализацией
import { ConfigManager } from '../../../managers/config_manager.js';

export class LocalizationService {
    constructor(language = 'ru') {
        this.language = language;
        this.configManager = ConfigManager.getInstance();
        this.loadLocalization();
    }
    
    // Загрузка локализации
    loadLocalization() {
        try {
            const localization = this.configManager.getConfig('localization/trader_ui');
            this.localization = localization ? localization[this.language] : null;
            
            if (!this.localization) {
                console.warn(`Локализация для языка ${this.language} не найдена`);
            }
        } catch (error) {
            console.error('Ошибка загрузки локализации:', error);
            this.localization = null;
        }
    }
    
    // Получение локализованного текста
    getText(key, replacements = {}) {
        if (!this.localization) return key;
        
        // Разбиваем ключ на части (например, "graph.title" -> ["graph", "title"])
        const parts = key.split('.');
        
        // Получаем значение из вложенного объекта
        let value = this.localization;
        for (const part of parts) {
            if (!value || !value[part]) return key;
            value = value[part];
        }
        
        // Заменяем плейсхолдеры на значения
        if (typeof value === 'string') {
            return Object.entries(replacements).reduce((text, [placeholder, replacement]) => {
                return text.replace(`{${placeholder}}`, replacement);
            }, value);
        }
        
        return key;
    }
    
    // Смена языка
    setLanguage(language) {
        this.language = language;
        this.loadLocalization();
    }
}

export default LocalizationService;