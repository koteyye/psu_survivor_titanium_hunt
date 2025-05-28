// Фабрика для создания персонажей
import { FrienderCharacter } from './FrienderCharacter.js';
import { TraderCharacter } from './TraderCharacter/index.js';
import { ZummerCharacter } from './ZummerCharacter.js';

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
        
        switch (characterId) {
            case 'friender_s':
                return new FrienderCharacter(scene, x, y);
            case 'trader':
                return new TraderCharacter(scene, x, y);
            case 'zummer':
                return new ZummerCharacter(scene, x, y);
            default:
                console.warn(`Неизвестный тип персонажа: ${characterId}, используем Friender по умолчанию`);
                return new FrienderCharacter(scene, x, y);
        }
    }
}