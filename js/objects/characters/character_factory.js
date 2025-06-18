// Фабрика для создания персонажей
import { FrienderCharacter } from './friender_character.js';
import { TraderCharacter } from './trader_character.js';
import { ZummerCharacter } from './zummer_character.js';
import { ConfigManager, EventManager } from '../../managers/index.js';

export class CharacterFactory {
    /**
     * Создает персонажа в зависимости от выбранного типа
     * @param {Phaser.Scene} scene - Сцена, в которой создается персонаж
     * @param {number} x - Координата X
     * @param {number} y - Координата Y
     * @param {string} characterId - ID персонажа (friender_s, trader, zummer)
     * @returns {BaseCharacter} - Созданный персонаж
     */
    static createCharacter(scene, x, y, characterId) {
        console.log(`Создаем персонажа с ID: ${characterId}`);
        
        // Получаем менеджеры
        const configManager = ConfigManager.getInstance();
        const eventManager = EventManager.getInstance();
        
        // Получаем информацию о персонажах
        const characterInfo = configManager.getConfig('characters/info');
        
        // Проверяем, что конфиг загружен
        if (!characterInfo) {
            console.error('Не удалось загрузить конфиг characters/info');
            return null;
        }
        
        // Находим тип персонажа по ID
        let characterType = null;
        for (const [type, info] of Object.entries(characterInfo)) {
            if (info.id === characterId) {
                characterType = type;
                break;
            }
        }
        
        // Если тип не найден, используем friender по умолчанию
        if (!characterType) {
            console.warn(`Неизвестный ID персонажа: ${characterId}, используем Friender по умолчанию`);
            characterType = 'friender';
        }
        
        // Создаем персонажа в зависимости от типа
        let character;
        
        switch (characterType) {
            case 'friender':
                character = new FrienderCharacter(scene, x, y);
                break;
            case 'trader':
                character = new TraderCharacter(scene, x, y);
                break;
            case 'zummer':
                character = new ZummerCharacter(scene, x, y);
                break;
            default:
                console.warn(`Неизвестный тип персонажа: ${characterType}, используем Friender по умолчанию`);
                character = new FrienderCharacter(scene, x, y);
        }
        
        // Сохраняем персонажа в Registry
        scene.registry.set('gameCharacter', character);
        
        // Оповещаем о создании персонажа через Event Bus
        eventManager.emit('CHARACTER_CREATED', { characterId, character });
        
        return character;
    }
    
    /**
     * Получение списка доступных персонажей
     * @returns {Array} - Массив объектов с информацией о персонажах
     */
    static getAvailableCharacters() {
        // Получаем менеджер конфигураций
        const configManager = ConfigManager.getInstance();
        
        // Получаем базовые статы персонажей
        const baseStats = configManager.getConfig('characters/base_stat');
        
        // Получаем информацию о персонажах
        const characterInfo = configManager.getConfig('characters/info');
        
        if (!baseStats || !characterInfo) {
            console.error('Не удалось загрузить конфиги персонажей');
            return [];
        }
        
        // Формируем список персонажей
        const characters = [];
        
        // Проходим по всем персонажам в базовых статах
        Object.keys(baseStats).forEach(key => {
            // Проверяем, что у нас есть информация о персонаже
            if (characterInfo[key]) {
                characters.push({
                    id: characterInfo[key].id,
                    name: characterInfo[key].name,
                    texture: characterInfo[key].texture,
                    description: characterInfo[key].description,
                    stats: baseStats[key]
                });
            }
        });
        
        return characters;
    }
}