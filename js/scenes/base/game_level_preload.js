// Функции для загрузки ресурсов уровня

import { getExplosionSpriteConfig } from '../../utils/animationUtils.js';

// Основная функция загрузки ресурсов
export function preloadLevelResources(scene) {
    // Отключаем кэширование для всех загрузок
    scene.load.setCORS('anonymous');
    scene.load.crossOrigin = 'anonymous';
    
    // Выводим информацию о начале загрузки
    console.log(`Начинаем загрузку изображений для уровня ${scene.levelId}...`);
    
    // Загрузка изображений с принудительным обновлением
    const cacheBuster = Date.now();
    
    // Отключаем автоматическое создание заглушек
    scene.load.setPath('assets/');
    
    // Загружаем фон для уровня с уникальным ключом для каждого уровня
    scene.load.image(`background_level${scene.levelId}`, `${scene.backgroundPath}?v=${cacheBuster}`);
    
    // Загружаем музыку для уровня с уникальным ключом для каждого уровня
    scene.load.audio(`backgroundMusic_level${scene.levelId}`, scene.musicPath);
      // Загружаем звуки
    scene.load.audio('explosionSound', `sounds/gameplay/effects/explosion.wav?v=${cacheBuster}`);

    
    // Загружаем звуки персонажей
    preloadCharacterSounds(scene, cacheBuster);
      // Загружаем игровые объекты
    scene.load.image('player', `images/gameplay/player.png?v=${cacheBuster}`);
    scene.load.image('goodItem', `images/gameplay/good_psu.png?v=${cacheBuster}`);
    scene.load.image('badItem', `images/gameplay/bad_psu.png?v=${cacheBuster}`);
    scene.load.image('veryGoodItem', `images/gameplay/very_good_psu.png?v=${cacheBuster}`);//Загружаем иконки для UI
    scene.load.image('healthIcon', `game_icons/health.png?v=${cacheBuster}`);
    scene.load.image('scoreIcon', `game_icons/score.png?v=${cacheBuster}`);
    scene.load.image('moneyIcon', `game_icons/money.png?v=${cacheBuster}`);
    scene.load.image('rageIcon', `game_icons/rage.png?v=${cacheBuster}`);
    scene.load.image('basketIcon', `game_icons/backet.png?v=${cacheBuster}`);
      // Загружаем атлас текстур для новых взрывов (хорошие и супер блоки)
    scene.load.atlas('good_super', `images/gameplay/explosions/good_super.png?v=${cacheBuster}`, `configs/sprites/good_super.json?v=${cacheBuster}`);
    
    // Загружаем атлас текстур для плохих блоков и денег
    scene.load.atlas('bad_money', `images/gameplay/explosions/bad_money.png?v=${cacheBuster}`, `configs/sprites/bad_money.json?v=${cacheBuster}`);
    
    // Создаем заглушку для основного взрыва, если нужно
    scene.load.image('explosion', `images/gameplay/explosion.png?v=${cacheBuster}`);
    
    // Добавляем обработчики событий загрузки
    setupLoadHandlers(scene);
}

// Настройка обработчиков событий загрузки
function setupLoadHandlers(scene) {
    // Обработчик успешной загрузки файла
    scene.load.on('filecomplete', function(key, type, data) {
        console.log(`Успешно загружено: ${key}, тип: ${type}`);
        
        // Проверяем загруженное изображение
        if (this.textures.exists(key)) {
            const texture = this.textures.get(key);
            const source = texture.source[0];
            console.log(`Текстура ${key} загружена: ${source.width}x${source.height}`);
        } else {
            console.warn(`Текстура ${key} не существует после загрузки!`);
        }
    }, scene);
    
    // Обработчик ошибки загрузки
    scene.load.on('loaderror', function(file) {
        console.error(`Ошибка загрузки файла: ${file.src}`);
        console.error(`Ключ файла: ${file.key}`);
        console.error(`Тип файла: ${file.type}`);
    }, scene);
    
    // Обработчик завершения загрузки
    scene.load.on('complete', function() {
        console.log(`Все ресурсы для уровня ${scene.levelId} загружены!`);
        console.log('Доступные текстуры:', Object.keys(this.textures.list));
        
        // Проверяем все загруженные текстуры
        Object.keys(this.textures.list).forEach(key => {
            if (key !== '__DEFAULT' && key !== '__MISSING') {
                const texture = this.textures.get(key);
                const source = texture.source[0];
                console.log(`Текстура ${key}: ${source.width}x${source.height}`);
            }
        });
    }, scene);
    
    // Обработчик начала загрузки
    scene.load.on('start', function() {
        console.log(`Начало загрузки ресурсов для уровня ${scene.levelId}`);
    });
    
    // Обработчик прогресса загрузки
    scene.load.on('progress', function(value) {
        console.log(`Прогресс загрузки: ${Math.round(value * 100)}%`);
    });
}

// Функция загрузки звуков персонажей
function preloadCharacterSounds(scene, cacheBuster) {
    // Получаем выбранного персонажа
    const selectedCharacter = scene.selectedCharacter || localStorage.getItem('selectedCharacter') || 'friender_s';
    
    // Определяем ID персонажа для звуков
    let characterSoundId;
    if (selectedCharacter === 'friender_s') {
        characterSoundId = 'friender_s';
    } else if (selectedCharacter === 'trader') {
        characterSoundId = 'trader';
    } else if (selectedCharacter === 'zummer') {
        characterSoundId = 'zummer';
    } else {
        characterSoundId = 'friender_s'; // По умолчанию
    }
      console.log(`Загружаем звуки для персонажа: ${characterSoundId}`);
    
    // Загружаем звуки для выбранного персонажа
    const basePath = `sounds/gameplay/replicas/${characterSoundId}`;
    scene.load.audio(`gameplay/replicas/${characterSoundId}/select`, `${basePath}/select.mp3?v=${cacheBuster}`);
    scene.load.audio(`gameplay/replicas/${characterSoundId}/bad_psu_1`, `${basePath}/bad_psu_1.mp3?v=${cacheBuster}`);
    scene.load.audio(`gameplay/replicas/${characterSoundId}/bad_psu_2`, `${basePath}/bad_psu_2.mp3?v=${cacheBuster}`);
    scene.load.audio(`gameplay/replicas/${characterSoundId}/super_psu_1`, `${basePath}/super_psu_1.mp3?v=${cacheBuster}`);
    scene.load.audio(`gameplay/replicas/${characterSoundId}/super_psu_2`, `${basePath}/super_psu_2.mp3?v=${cacheBuster}`);
    scene.load.audio(`gameplay/replicas/${characterSoundId}/dead`, `${basePath}/dead.mp3?v=${cacheBuster}`);
}