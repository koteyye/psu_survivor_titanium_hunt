// Базовый класс для UI элементов трейдера
import { ConfigManager } from '../../../../managers/config_manager.js';

export class BaseUIElement {
    constructor(scene, character) {
        this.scene = scene;
        this.character = character;
        this.configManager = ConfigManager.getInstance();
        
        // Загружаем конфигурации
        this.loadConfigs();
    }
    
    // Загрузка конфигураций
    loadConfigs() {
        try {
            this.uiConfig = this.configManager.getConfig('characters/trader/ui');
        } catch (error) {
            console.error('Ошибка загрузки конфигураций UI:', error);
        }
    }
    
    // Метод для очистки ресурсов
    destroy() {
        // Переопределяется в дочерних классах
    }
}

export default BaseUIElement;