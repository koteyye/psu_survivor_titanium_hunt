// Функции для загрузки ресурсов уровня

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
    scene.load.audio('explosionSound', 'sounds/gameplay/explosion.wav');
    scene.load.audio('nyamnyamSound', 'sounds/gameplay/nyamnyam.wav');
    
    // Загружаем игровые объекты
    scene.load.image('player', `images/gameplay/player.png?v=${cacheBuster}`);
    scene.load.image('goodItem', `images/gameplay/good_psu.png?v=${cacheBuster}`);
    scene.load.image('badItem', `images/gameplay/bad_psu.png?v=${cacheBuster}`);
    scene.load.image('veryGoodItem', `images/gameplay/very_good_psu.png?v=${cacheBuster}`);
    
    // Загружаем спрайтшит взрыва
    scene.load.spritesheet('explosion', `images/gameplay/explosion.png?v=${cacheBuster}`, { 
        frameWidth: 256,
        frameHeight: 256 
    });
    
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