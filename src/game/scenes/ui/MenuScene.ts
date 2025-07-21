import { ConfigManager, AudioManager, EventManager } from '../../../systems/managers';
import { CyberButton, CyberTitle } from '../../ui';
import { FontUtils } from '../../../utils';
import { BaseMenuScene } from '../base/BaseMenuScene';

/**
 * Главное меню игры
 */
export class MenuScene extends BaseMenuScene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private eventManager: EventManager;
  private fontUtils: FontUtils;
  
  private titleText?: CyberTitle;
  private startButton?: CyberButton;
  private levelSelectButton?: CyberButton;
  private settingsButton?: CyberButton;
  private aboutButton?: CyberButton;

  constructor() {
    super({ key: 'MenuScene' });
    
    // Инициализируем менеджеры
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.eventManager = EventManager.getInstance();
    this.fontUtils = FontUtils.getInstance();
  }

  public init(): void {
    console.log('MenuScene: Initializing...');
  }

  public preload(): void {
    console.log('MenuScene: Loading resources...');
    
    const cacheBuster = Date.now();
    
    // Загружаем JSON конфигурации сначала
    this.load.json('characters_base_stat', `assets/configs/characters/base_stat.json?v=${cacheBuster}`);
    this.load.json('characters_info', `assets/characters/info.json?v=${cacheBuster}`);
    this.load.json('core_config', `assets/configs/core.json?v=${cacheBuster}`);
    
    // Загружаем ресурсы для меню
    this.load.image('menuBackground', `assets/images/backgrounds/menu_background.png?v=${cacheBuster}`);
    this.load.audio('menuMusic', `assets/sounds/menu/menu_background.wav?v=${cacheBuster}`);
    
    // Загружаем иконки настроек
    this.load.image('soundIcon', `assets/ui/sound.png?v=${cacheBuster}`);
    this.load.image('musicIcon', `assets/ui/music.png?v=${cacheBuster}`);
    this.load.image('checkboxOn', `assets/ui/checkbox_on.png?v=${cacheBuster}`);
    this.load.image('checkboxOff', `assets/ui/checkbox_off.png?v=${cacheBuster}`);
    
    // Загружаем изображения персонажей для предпросмотра
    this.load.image('friender_s', `assets/characters/friender_s.png?v=${cacheBuster}`);
    this.load.image('trader', `assets/characters/trader.png?v=${cacheBuster}`);
    this.load.image('zummer', `assets/characters/zummer.png?v=${cacheBuster}`);
    
    // Загружаем шрифты
    this.loadFonts();
  }

  public create(): void {
    console.log('MenuScene: Creating menu...');
    
    // Загружаем конфигурации в ConfigManager
    this.loadConfigsIntoManager();
    
    // Инициализируем AudioManager
    this.audioManager.init(this);
    
    // Создаем фон
    this.createBackground();
    
    // Воспроизводим музыку меню только если она еще не играет
    this.playMenuMusicIfNeeded();
    
    // Проверяем статус загрузки шрифтов
    this.checkFontLoadingStatus();
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем кнопки меню
    this.createMenuButtons();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private loadConfigsIntoManager(): void {
    console.log('📦 Loading configs into ConfigManager...');
    
    // Загружаем базовые статы персонажей
    const baseStatConfig = this.configManager.loadFromCache(this, 'characters/base_stat', 'characters_base_stat');
    
    // Загружаем информацию о персонажах
    const infoConfig = this.configManager.loadFromCache(this, 'characters/info', 'characters_info');
    
    // Загружаем основную конфигурацию
    const coreConfig = this.configManager.loadFromCache(this, 'core', 'core_config');
    
    if (baseStatConfig && infoConfig && coreConfig) {
      this.configManager.setConfigsLoaded(true);
      console.log('✅ All configs loaded into ConfigManager from MenuScene');
    } else {
      console.error('❌ Failed to load some configs into ConfigManager from MenuScene');
    }
  }

  private createBackground(): void {
    // Use the shared menu background system
    this.createMenuBackground();
  }

  private createTitle(): void {
    this.titleText = new CyberTitle(this, 960, 200, 'PSU SURVIVOR\nTITANIUM HUNT', {
      fontSize: 72
    });
    
    // Добавляем эффект свечения для заголовка - оранжевый цвет как у кнопок
    this.titleText.setStroke('#ff6600', 4);
    this.titleText.setShadow(0, 0, '#ff6600', 10, true, true);
  }

  private createMenuButtons(): void {
    const buttonConfig = {
      width: 400,
      height: 80,
      fontSize: 32
    };

    // Кнопка "Начать игру"
    this.startButton = new CyberButton(this, 960, 450, 'НАЧАТЬ ИГРУ', () => {
      this.audioManager.stopMusic();
      this.scene.start('CharacterSelectScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "Выбор уровня"
    this.levelSelectButton = new CyberButton(this, 960, 550, 'ВЫБОР УРОВНЯ', () => {
      this.audioManager.stopMusic();
      this.scene.start('LevelSelectScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "Настройки"
    this.settingsButton = new CyberButton(this, 960, 650, 'НАСТРОЙКИ', () => {
      this.scene.start('SettingsScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "О игре"
    this.aboutButton = new CyberButton(this, 960, 750, 'О ИГРЕ', () => {
      this.scene.start('AboutScene');
    }, {
      ...buttonConfig
    });
  }

  private setupEventListeners(): void {
    // Обработчик клавиш
    this.input.keyboard?.on('keydown-ENTER', () => {
      // Быстрый старт с последним выбранным персонажем
      const lastCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      this.audioManager.stopMusic();
      this.scene.start('MainScene', { character: lastCharacter });
    });
  }



  /**
   * Загружает шрифты с обработкой ошибок и fallback
   */
  private loadFonts(): void {
    console.log('MenuScene: Loading fonts...');
    
    try {
      // Используем FontUtils для загрузки шрифтов
      this.fontUtils.preloadFonts(this);
    } catch (error) {
      console.warn('MenuScene: Error initializing font loading:', error);
    }
  }

  /**
   * Проверяет статус загрузки шрифтов и выводит отладочную информацию
   */
  private checkFontLoadingStatus(): void {
    console.log('MenuScene: Checking font loading status...');
    
    const fontStatus = this.fontUtils.getFontLoadingStatus();
    console.log('Font loading status:', fontStatus);
    
    console.log('Title font family:', this.fontUtils.getTitleFont());
    console.log('UI font family:', this.fontUtils.getUIFont());
    
    if (this.fontUtils.areAllFontsLoaded()) {
      console.log('✅ All fonts loaded successfully');
    } else {
      console.log('⚠️ Some fonts are still loading or failed to load, using fallbacks');
    }
  }

  /**
   * Воспроизводит музыку меню только если она еще не играет
   */
  private playMenuMusicIfNeeded(): void {
    // Проверяем, что музыка включена в настройках
    const settings = this.audioManager.getSettings();
    if (!settings.musicEnabled) {
      console.log('MenuScene: Music is disabled, skipping menu music playback');
      return;
    }

    // Проверяем, что аудио файл загружен
    if (!this.cache.audio.exists('menuMusic')) {
      console.warn('MenuScene: menuMusic not found in cache, skipping playback');
      return;
    }

    // Проверяем, играет ли уже музыка меню
    if (this.isMenuMusicPlaying()) {
      console.log('MenuScene: Menu music is already playing, skipping duplicate playback');
      return;
    }

    // Воспроизводим музыку меню
    console.log('MenuScene: Starting menu music');
    this.audioManager.playMusic('menuMusic');
  }

  /**
   * Проверяет, играет ли в данный момент музыка меню
   */
  private isMenuMusicPlaying(): boolean {
    return this.audioManager.isMusicPlaying('menuMusic');
  }

  /**
   * Метод вызывается при завершении сцены
   */
  public shutdown(): void {
    console.log('MenuScene: Shutting down...');
    // Очищаем обработчики событий клавиатуры
    this.input.keyboard?.removeAllListeners();
  }

  /**
   * Метод вызывается при уничтожении сцены
   */
  public destroy(): void {
    console.log('MenuScene: Destroying...');
    // Останавливаем музыку при уничтожении сцены
    this.audioManager.stopMusic();
    
    // Очищаем ссылки на объекты
    this.titleText = undefined;
    this.startButton = undefined;
    this.levelSelectButton = undefined;
    this.settingsButton = undefined;
    this.aboutButton = undefined;
    
    // Call parent destroy to handle background cleanup
    super.destroy();
  }

  public update(): void {
    // Обновление меню (если необходимо)
  }
}

/**
 * Сцена выбора персонажа
 */
export class CharacterSelectScene extends BaseMenuScene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private fontUtils: FontUtils;
  private characters: Array<{
    id: string;
    name: string;
    description: string;
    frame?: Phaser.GameObjects.Container;
    sprite?: Phaser.GameObjects.Image;
  }> = [];
  public selectedCharacter: string = '';
  private characterInfo?: Phaser.GameObjects.Text;
  private characterInfoPanel?: Phaser.GameObjects.Container;
  private confirmButton?: CyberButton;
  private backButton?: CyberButton;

  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.fontUtils = FontUtils.getInstance();
  }

  public preload(): void {
    console.log('CharacterSelectScene: Loading resources...');
    // Preload the menu background
    this.preloadMenuBackground();
  }

  public init(): void {
    console.log('CharacterSelectScene: Initializing...');
    
    // Получаем данные персонажей из конфигурации
    this.initializeCharacters();
    
    // No character selected by default as per requirements
    this.selectedCharacter = '';
  }

  private initializeCharacters(): void {
    // Загружаем конфигурацию персонажей
    const charactersConfig = this.configManager.getValue('characters', 'info', {}) as any;
    
    this.characters = [
      {
        id: 'friender_s',
        name: charactersConfig.friender_s?.name || 'Friender',
        description: charactersConfig.friender_s?.description || 'Быстрый и ловкий персонаж'
      },
      {
        id: 'trader', 
        name: charactersConfig.trader?.name || 'Trader',
        description: charactersConfig.trader?.description || 'Опытный торговец'
      },
      {
        id: 'zummer',
        name: charactersConfig.zummer?.name || 'Zummer',
        description: charactersConfig.zummer?.description || 'Мощный воин'
      }
    ];
  }

  public create(): void {
    console.log('CharacterSelectScene: Creating character selection...');
    
    // Создаем фон
    this.createBackground();
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем персонажей
    this.createCharacterSelection();
    
    // Создаем информационную панель (всегда видимую)
    this.createCharacterInfoPanel();
    
    // Создаем кнопки управления
    this.createControlButtons();
    
    // Показываем информацию о выбранном персонаже
    this.updateCharacterInfo();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Use the shared menu background system
    this.createMenuBackground();
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'ВЫБОР ПЕРСОНАЖА', {
      fontSize: 64
    });
    title.setStroke('#00f7ff', 3);
  }

  private createCharacterSelection(): void {
    const frameWidth = 300;
    const frameHeight = 350;
    const spacing = 350;
    const startX = 960 - (spacing * (this.characters.length - 1)) / 2; // Center-aligned
    const frameY = 400;
    
    this.characters.forEach((character, index) => {
      const x = startX + (index * spacing);
      
      // Create container for the character frame
      character.frame = this.add.container(x, frameY);
      
      // Create border rectangle
      const border = this.add.rectangle(0, 0, frameWidth, frameHeight);
      border.setStrokeStyle(3, 0xffffff, 0.8);
      border.setFillStyle(0x000000, 0.3);
      
      // Create character sprite if texture exists
      if (this.textures.exists(character.id)) {
        character.sprite = this.add.image(0, -20, character.id);
        if (character.sprite) {
          character.sprite.setScale(1.2);
          
          // Apply black-and-white filter for default state
          character.sprite.setTint(0x808080); // Gray tint for black-and-white effect
        }
      }
      
      // Add elements to the frame container
      const frameElements: Phaser.GameObjects.GameObject[] = [border];
      if (character.sprite) {
        frameElements.push(character.sprite);
      }
      character.frame.add(frameElements);
      
      // Make frame interactive
      character.frame.setSize(frameWidth, frameHeight);
      character.frame.setInteractive();
      
      // Add hover effects
      character.frame.on('pointerover', () => {
        // Restore color on hover (remove black-and-white filter)
        if (character.sprite) {
          character.sprite.clearTint();
        }
      });
      
      character.frame.on('pointerout', () => {
        // Restore black-and-white filter when not hovering (unless selected)
        if (character.sprite && character.id !== this.selectedCharacter) {
          character.sprite.setTint(0x808080);
        }
      });
      
      // Add click handler
      character.frame.on('pointerdown', () => {
        this.selectCharacter(character.id);
      });
    });
  }

  private createControlButtons(): void {
    // Кнопка подтверждения - только работает если персонаж выбран
    // Перемещена ниже информационного блока
    this.confirmButton = new CyberButton(this, 960, 850, 'НАЧАТЬ ИГРУ', () => {
      if (this.selectedCharacter) {
        localStorage.setItem('selectedCharacter', this.selectedCharacter);
        this.scene.start('MainScene', { character: this.selectedCharacter });
      }
    }, {
      width: 300,
      height: 80,
      fontSize: 28
    });
    
    // Кнопка возврата - перемещена ниже кнопки "Начать игру"
    this.backButton = new CyberButton(this, 960, 950, 'НАЗАД', () => {
      this.scene.start('MenuScene');
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
  }

  private setupEventListeners(): void {
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.start('MenuScene');
    });
    
    this.input.keyboard?.on('keydown-ENTER', () => {
      if (this.selectedCharacter) {
        localStorage.setItem('selectedCharacter', this.selectedCharacter);
        this.scene.start('MainScene', { character: this.selectedCharacter });
      }
    });
    
    // Клавиши для быстрого выбора персонажа
    this.input.keyboard?.on('keydown-ONE', () => {
      this.selectCharacter('friender_s');
    });
    
    this.input.keyboard?.on('keydown-TWO', () => {
      this.selectCharacter('trader');
    });
    
    this.input.keyboard?.on('keydown-THREE', () => {
      this.selectCharacter('zummer');
    });
  }

  private selectCharacter(characterId: string): void {
    // Remove highlight from previous character frame
    const previousChar = this.characters.find(c => c.id === this.selectedCharacter);
    if (previousChar?.frame) {
      // Remove orange neon highlight from previous selection
      const previousBorder = previousChar.frame.list[0] as Phaser.GameObjects.Rectangle;
      if (previousBorder) {
        previousBorder.setStrokeStyle(3, 0xffffff, 0.8);
        previousBorder.clearFX();
      }
      // Restore black-and-white filter to previous character sprite
      if (previousChar.sprite) {
        previousChar.sprite.setTint(0x808080);
      }
    }
    
    // Select new character
    this.selectedCharacter = characterId;
    const newChar = this.characters.find(c => c.id === characterId);
    if (newChar?.frame) {
      // Add bright orange neon highlight to selected frame
      const border = newChar.frame.list[0] as Phaser.GameObjects.Rectangle;
      if (border) {
        border.setStrokeStyle(4, 0xff6600, 1.0); // Orange neon color
        // Add glow effect
        const glow = border.preFX?.addGlow(0xff6600, 2, 0, false, 0.1, 32);
      }
      // Keep selected character in full color
      if (newChar.sprite) {
        newChar.sprite.clearTint();
      }
    }
    
    // Update character information
    this.updateCharacterInfo();
    
    // Play selection sound
    this.audioManager.playSound(`gameplay/replicas/${characterId}/select`);
  }

  private updateCharacterInfo(): void {
    // Clear existing character info text
    if (this.characterInfo) {
      this.characterInfo.destroy();
      this.characterInfo = undefined;
    }
    
    // Create character information text based on selection
    let infoText = '';
    if (this.selectedCharacter) {
      const character = this.characters.find(c => c.id === this.selectedCharacter);
      if (character) {
        infoText = `${character.name}\n\n${character.description}`;
      }
    }
    // If no character selected, text remains empty but panel is still visible
    
    this.characterInfo = this.add.text(960, 690, infoText, {
      fontSize: '28px',
      fontFamily: this.fontUtils.getRegularFont(),
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 700 },
      stroke: '#ff6600',
      strokeThickness: 1
    }).setOrigin(0.5);
  }

  private createCharacterInfoPanel(): void {
    // Create always-visible character information display panel below frames
    // Frames are at y=400 with height=350, so bottom is at 575
    // Adding 75px gap: 575 + 75 = 650
    this.characterInfoPanel = this.add.container(960, 690);
    
    // Create background for the info panel - larger size as shown in the image
    const panelBackground = this.add.rectangle(0, 0, 1200, 200);
    panelBackground.setStrokeStyle(3, 0xff6600, 0.9);
    panelBackground.setFillStyle(0x000000, 0.8);
    
    // Add background to the panel container
    this.characterInfoPanel.add([panelBackground]);
  }
}
