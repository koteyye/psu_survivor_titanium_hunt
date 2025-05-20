// Импортируем необходимые функции
import { createPlayerPlaceholder, createGoodItemPlaceholder, createBadItemPlaceholder, createVeryGoodItemPlaceholder, createExplosionPlaceholder } from '../utils/assetLoader.js';

// Функция загрузки ресурсов для MainScene
export function preloadResources(scene) {
    // Отключаем кэширование для всех загрузок
    scene.load.setCORS('anonymous');
    scene.load.crossOrigin = 'anonymous';
    
    // Выводим информацию о начале загрузки
    console.log('Начинаем загрузку изображений...');
    
    // Загрузка изображений с принудительным обновлением
    const cacheBuster = Date.now();
    
    // Отключаем автоматическое создание заглушек
    scene.load.setPath('assets/');
    
    // Пробуем загрузить изображение игрока
    try {
        console.log('Пытаемся загрузить player.png...');
        // Используем абсолютный путь для загрузки изображений
        scene.load.image('player', `player.png?v=${cacheBuster}`);
    } catch (e) {
        console.error('Ошибка при попытке загрузить player:', e);
    }
    
    // Загружаем остальные изображения с абсолютными путями
    scene.load.image('goodItem', `good_psu.png?v=${cacheBuster}`);
    scene.load.image('badItem', `bad_psu.png?v=${cacheBuster}`);
    scene.load.image('veryGoodItem', `very_good_psu.png?v=${cacheBuster}`);
    
    // Загружаем спрайтшит взрыва с размером кадра 256x256 (4x4 кадра в изображении 1024x1024)
    scene.load.spritesheet('explosion', `explosion.png?v=${cacheBuster}`, { 
        frameWidth: 256,  // Размер одного кадра
        frameHeight: 256 
    });
    
    scene.load.image('background', `background.png?v=${cacheBuster}`);
    
    // Загружаем звуки
    scene.load.audio('backgroundMusic', 'sounds/background.wav');
    scene.load.audio('explosionSound', 'sounds/explosion.wav');
    scene.load.audio('nyamnyamSound', 'sounds/nyamnyam.wav');
    
    // Обработчики событий загрузки
    scene.load.on('filecomplete', function(key, type, data) {
        console.log(`Успешно загружено: ${key}, тип: ${type}`);
        
        // Проверяем загруженное изображение
        if (this.textures.exists(key)) {
            const texture = this.textures.get(key);
            const source = texture.source[0];
            console.log(`Текстура ${key} загружена: ${source.width}x${source.height}`);
            
            // Отключаем создание заглушек для успешно загруженных изображений
            if (key === 'player') {
                console.log('Игрок успешно загружен, заглушка не нужна');
            }
        } else {
            console.warn(`Текстура ${key} не существует после загрузки!`);
        }
    }, scene);
    
    scene.load.on('loaderror', function(file) {
        console.error(`Ошибка загрузки файла: ${file.src}`);
        console.error(`Ключ файла: ${file.key}`);
        console.error(`Тип файла: ${file.type}`);
        
        // Создаем заглушки только если изображение не загрузилось
        if (file.key === 'player') {
            console.log('Создаем заглушку для игрока из-за ошибки загрузки');
            createPlayerPlaceholder(this);
        } else if (file.key === 'goodItem') {
            createGoodItemPlaceholder(this);
        } else if (file.key === 'badItem') {
            createBadItemPlaceholder(this);
        } else if (file.key === 'veryGoodItem') {
            createVeryGoodItemPlaceholder(this);
        } else if (file.key === 'explosion') {
            createExplosionPlaceholder(this);
        }
    }, scene);
    
    // Добавляем обработчики для отслеживания процесса загрузки
    scene.load.on('complete', function() {
        console.log('Все ресурсы загружены!');
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
    
    scene.load.on('start', function() {
        console.log('Начало загрузки ресурсов');
    });
    
    scene.load.on('progress', function(value) {
        console.log(`Прогресс загрузки: ${Math.round(value * 100)}%`);
    });
}
