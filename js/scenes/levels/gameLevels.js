// Файл с классами всех игровых уровней
import { GameLevelScene } from '../base/GameLevelScene.js';

// Первый уровень игры
export class MainScene extends GameLevelScene {
    constructor() {
        super({
            key: 'MainScene',
            levelId: 1,
            backgroundPath: 'images/backgrounds/background_level1.png',
            musicPath: 'sounds/level_music/level1_music.wav',
            levelParams: {
                levelDescription: 'Уровень 1: Собирай хорошие блоки и избегай плохих!'
            }
        });
    }
}

// Второй уровень игры
export class Level2Scene extends GameLevelScene {
    constructor() {
        super({
            key: 'Level2Scene',
            levelId: 2,
            backgroundPath: 'images/backgrounds/background_level2.png',
            musicPath: 'sounds/level_music/level2_music.wav',
            levelParams: {
                levelDescription: 'Уровень 2: Больше плохих блоков и быстрее падение!'
            }
        });
    }
}

// Третий уровень игры (заготовка для будущего)
export class Level3Scene extends GameLevelScene {
    constructor() {
        super({
            key: 'Level3Scene',
            levelId: 3,
            backgroundPath: 'images/backgrounds/background_level3.png',
            musicPath: 'sounds/level_music/level3_music.wav',
            levelParams: {
                levelDescription: 'Уровень 3: Максимальная сложность и скорость!'
            }
        });
    }
}