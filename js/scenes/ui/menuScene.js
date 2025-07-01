// Сцена главного меню
import { levelManager } from '../../utils/levelManager.js';
import { CyberButton, CyberTitle } from '../../ui/index.js';
import { ConfigManager } from '../../managers/config_manager.js';
import { AudioManager } from '../../managers/index.js';

export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.uiElements = []; // Массив для хранения UI элементов
    }

    preload() {
        // Загружаем ресурсы для меню
        this.load.image('menuBackground', 'assets/ui/menu_background.png');
        
        // Загружаем музыку для меню
        this.load.audio('menuMusic', 'assets/sounds/menu/menu_background.wav');
          // Загружаем иконки для UI
        this.load.image('soundIcon', 'assets/ui/sound.png');
        
        // Загружаем все JSON-конфиги
        this.loadAllConfigs();
    }
    
    // Метод для загрузки всех JSON-конфигов
    loadAllConfigs() {
        console.log('Загружаем все JSON-конфиги...');
        
        // Загружаем основной конфиг
        this.load.json('core', 'assets/configs/core.json');
        
        // Загружаем конфиги персонажей
        this.load.json('characters/base_stat', 'assets/configs/characters/base_stat.json');
        this.load.json('characters/info', 'assets/configs/characters/info.json');
        
        // Загружаем конфиги механик
        this.load.json('characters/mechanics/health', 'assets/configs/characters/mechanics/health.json');
        this.load.json('characters/mechanics/money', 'assets/configs/characters/mechanics/money.json');
        this.load.json('characters/mechanics/rage', 'assets/configs/characters/mechanics/rage.json');
        this.load.json('characters/mechanics/graph', 'assets/configs/characters/mechanics/graph.json');
        
        // Загружаем конфиги навыков
        this.load.json('characters/skills/friender', 'assets/configs/characters/skills/friender.json');
        this.load.json('characters/skills/trader', 'assets/configs/characters/skills/trader.json');
        this.load.json('characters/skills/zoomer', 'assets/configs/characters/skills/zoomer.json');
        
        // Загружаем конфиги трейдера
        this.load.json('localization/trader_ui', 'assets/configs/localization/trader_ui.json');
        this.load.json('characters/trader/graph_colors', 'assets/configs/characters/trader/graph_colors.json');
        this.load.json('characters/trader/graph_rules', 'assets/configs/characters/trader/graph_rules.json');
        this.load.json('characters/trader/graph_style', 'assets/configs/characters/trader/graph_style.json');
        this.load.json('characters/trader/ui_positions', 'assets/configs/characters/trader/ui_positions.json');
        this.load.json('characters/trader/animations', 'assets/configs/characters/trader/animations.json');
        this.load.json('characters/trader/ui', 'assets/configs/characters/trader/ui.json');
        
        // Загружаем конфиги врагов
        this.load.json('enemies/base_stats', 'assets/configs/enemies/base_stats.json');
    }

    create() {
        // Инициализируем AudioManager
        const audioManager = AudioManager.getInstance();
        audioManager.init(this);
        
        // Добавляем фоновое изображение
        this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
        
        // Останавливаем предыдущую музыку через AudioManager
        audioManager.stopMusic();
        
        // Загружаем все конфиги в ConfigManager
        this.initializeConfigManager();
        
        // Добавляем и запускаем фоновую музыку для меню через AudioManager
        audioManager.addMusic('menuMusic', 'menuMusic', { loop: true, volume: 0.10 });
        audioManager.playMusic('menuMusic');
        
        // Добавляем заголовок игры с использованием CyberTitle
        const title = new CyberTitle(
            this, 
            960, 
            200, 
            'PSU Survivor: Titanium Hunt', 
            { 
                fontSize: 64,
                glowIntensity: 1.5,
                pulseAnimation: true
            }
        );
        this.uiElements.push(title);
        
        // Создаем кнопки меню с использованием CyberButton
        const startButton = new CyberButton(
            this,
            960,
            380, // Уменьшаем Y-координату для первой кнопки
            'Начать игру',
            () => {
                // Переходим на сцену выбора персонажа БЕЗ остановки музыки
                this.scene.start('CharacterSelectScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32,
                pulseAnimation: true
            }
        );
        this.uiElements.push(startButton);
        
        const settingsButton = new CyberButton(
            this,
            960,
            520, // Увеличиваем Y-координату для второй кнопки
            'Настройки',
            () => {
                // Переходим на сцену настроек БЕЗ остановки музыки
                this.scene.start('SettingsScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        // Добавляем иконку к кнопке настроек
        settingsButton.addIcon('⚙️');
        this.uiElements.push(settingsButton);
        
        const aboutButton = new CyberButton(
            this,
            960,
            660, // Увеличиваем Y-координату для третьей кнопки
            'Об игре',
            () => {
                // Переходим на сцену "Об игре" БЕЗ остановки музыки
                this.scene.start('AboutScene');
            },
            {
                width: 400,
                height: 80,
                fontSize: 32
            }
        );
        // Добавляем иконку к кнопке "Об игре"
        aboutButton.addIcon('ℹ️');
        this.uiElements.push(aboutButton);
    }
    
    // Очищаем ресурсы при уничтожении сцены
    shutdown() {
        // Уничтожаем все UI элементы
        this.uiElements.forEach(element => {
            if (element && element.destroy) {
                element.destroy();
            }
        });
        this.uiElements = [];
    }
    
    // Инициализация ConfigManager
    initializeConfigManager() {
        console.log('Инициализация ConfigManager...');
        
        // Получаем экземпляр ConfigManager
        const configManager = ConfigManager.getInstance();
        
        // Загружаем все конфиги из кэша в ConfigManager
        try {
            // Загружаем основной конфиг
            configManager.loadFromCache(this, 'core', 'core');
            
            // Загружаем конфиги персонажей
            configManager.loadFromCache(this, 'characters/base_stat', 'characters/base_stat');
            configManager.loadFromCache(this, 'characters/info', 'characters/info');
            
            // Загружаем конфиги механик
            configManager.loadFromCache(this, 'characters/mechanics/health', 'characters/mechanics/health');
            configManager.loadFromCache(this, 'characters/mechanics/money', 'characters/mechanics/money');
            configManager.loadFromCache(this, 'characters/mechanics/rage', 'characters/mechanics/rage');
            
            // Загружаем конфиги навыков
            configManager.loadFromCache(this, 'characters/skills/friender', 'characters/skills/friender');
            configManager.loadFromCache(this, 'characters/skills/trader', 'characters/skills/trader');
            configManager.loadFromCache(this, 'characters/skills/zoomer', 'characters/skills/zoomer');
            
            // Загружаем конфиги трейдера
            configManager.loadFromCache(this, 'localization/trader_ui', 'localization/trader_ui');
            configManager.loadFromCache(this, 'characters/trader/graph_colors', 'characters/trader/graph_colors');
            configManager.loadFromCache(this, 'characters/trader/graph_rules', 'characters/trader/graph_rules');
            configManager.loadFromCache(this, 'characters/trader/graph_style', 'characters/trader/graph_style');
            configManager.loadFromCache(this, 'characters/trader/ui_positions', 'characters/trader/ui_positions');
            configManager.loadFromCache(this, 'characters/trader/animations', 'characters/trader/animations');
            configManager.loadFromCache(this, 'characters/trader/ui', 'characters/trader/ui');
            
            // Загружаем конфиги врагов
            configManager.loadFromCache(this, 'enemies/base_stats', 'enemies/base_stats');
            
            // Устанавливаем флаг, что все конфиги загружены
            configManager.setConfigsLoaded(true);
            
            console.log('Все конфиги успешно загружены в ConfigManager!');
        } catch (error) {
            console.error('Ошибка при загрузке конфигов:', error);
        }
    }
}