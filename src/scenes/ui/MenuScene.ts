import { ConfigManager, AudioManager, EventManager, MusicKeys, SoundKeys } from '../../managers';
import { CyberButton, CyberTitle } from '../../ui';

/**
 * Главное меню игры
 */
export class MenuScene extends Phaser.Scene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private eventManager: EventManager;
  
  private backgroundImage?: Phaser.GameObjects.Image;
  private titleText?: CyberTitle;
  private startButton?: CyberButton;
  private levelSelectButton?: CyberButton;
  private settingsButton?: CyberButton;
  private aboutButton?: CyberButton;
  private exitButton?: CyberButton;

  constructor() {
    super({ key: 'MenuScene' });
    
    // Инициализируем менеджеры
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.eventManager = EventManager.getInstance();
  }

  public init(): void {
    console.log('MenuScene: Initializing...');
  }

  public preload(): void {
    console.log('MenuScene: Loading resources...');
    
    const cacheBuster = Date.now();
    
    // Загружаем ресурсы для меню
    this.load.image('menuBackground', `assets/ui/menu_background.png?v=${cacheBuster}`);
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
  }

  public create(): void {
    console.log('MenuScene: Creating menu...');
    
    // Инициализируем AudioManager
    this.audioManager.init(this);
    
    // Создаем фон
    this.createBackground();
    
    // Воспроизводим музыку меню
    this.audioManager.playMusic('menuMusic');
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем кнопки меню
    this.createMenuButtons();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Проверяем наличие изображения фона
    if (this.textures.exists('menuBackground')) {
      this.backgroundImage = this.add.image(960, 540, 'menuBackground');
      if (this.backgroundImage) {
        this.backgroundImage.setDisplaySize(1920, 1080);
      }
    } else {
      // Создаем градиентный фон как запасной вариант
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
      graphics.fillRect(0, 0, 1920, 1080);
    }
  }

  private createTitle(): void {
    this.titleText = new CyberTitle(this, 960, 200, 'PSU SURVIVOR\nTITANIUM HUNT', {
      fontSize: 72
    });
    
    // Добавляем эффект свечения для заголовка
    this.titleText.setStroke('#00f7ff', 4);
    this.titleText.setShadow(0, 0, '#00f7ff', 10, true, true);
  }

  private createMenuButtons(): void {
    const buttonConfig = {
      width: 400,
      height: 80,
      fontSize: 32
    };

    // Кнопка "Начать игру"
    this.startButton = new CyberButton(this, 960, 400, 'НАЧАТЬ ИГРУ', () => {
      this.audioManager.stopMusic();
      this.scene.start('CharacterSelectScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "Выбор уровня"
    this.levelSelectButton = new CyberButton(this, 960, 500, 'ВЫБОР УРОВНЯ', () => {
      this.audioManager.stopMusic();
      this.scene.start('LevelSelectScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "Настройки"
    this.settingsButton = new CyberButton(this, 960, 600, 'НАСТРОЙКИ', () => {
      this.scene.start('SettingsScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "О игре"
    this.aboutButton = new CyberButton(this, 960, 700, 'О ИГРЕ', () => {
      this.scene.start('AboutScene');
    }, {
      ...buttonConfig
    });

    // Кнопка "Выход"
    this.exitButton = new CyberButton(this, 960, 800, 'ВЫХОД', () => {
      this.confirmExit();
    }, {
      ...buttonConfig
    });
  }

  private setupEventListeners(): void {
    // Обработчик клавиш
    this.input.keyboard?.on('keydown-ESC', () => {
      this.confirmExit();
    });
    
    this.input.keyboard?.on('keydown-ENTER', () => {
      // Быстрый старт с последним выбранным персонажем
      const lastCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      this.audioManager.stopMusic();
      this.scene.start('MainScene', { character: lastCharacter });
    });
  }

  private confirmExit(): void {
    // Создаем диалог подтверждения выхода
    const overlay = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.7);
    
    const confirmText = this.add.text(960, 400, 'ВЫЙТИ ИЗ ИГРЫ?', {
      fontSize: '48px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    const yesButton = new CyberButton(this, 760, 500, 'ДА', () => {
      // Закрываем игру (в браузере это просто закрывает вкладку)
      window.close();
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
    
    const noButton = new CyberButton(this, 1160, 500, 'НЕТ', () => {
      // Убираем диалог
      overlay.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
  }

  public update(): void {
    // Обновление меню (если необходимо)
  }
}

/**
 * Сцена выбора персонажа
 */
export class CharacterSelectScene extends Phaser.Scene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private characters: Array<{
    id: string;
    name: string;
    description: string;
    sprite?: Phaser.GameObjects.Image;
    button?: CyberButton;
  }> = [];
  public selectedCharacter: string = '';
  private characterInfo?: Phaser.GameObjects.Text;
  private confirmButton?: CyberButton;
  private backButton?: CyberButton;

  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
  }

  public init(): void {
    console.log('CharacterSelectScene: Initializing...');
    
    // Получаем данные персонажей из конфигурации
    this.initializeCharacters();
    
    // Получаем последний выбранный персонаж
    this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
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
    
    // Создаем кнопки управления
    this.createControlButtons();
    
    // Показываем информацию о выбранном персонаже
    this.updateCharacterInfo();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Создаем фон (аналогично MenuScene)
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
    graphics.fillRect(0, 0, 1920, 1080);
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'ВЫБОР ПЕРСОНАЖА', {
      fontSize: 64
    });
    title.setStroke('#00f7ff', 3);
  }

  private createCharacterSelection(): void {
    const startX = 480;
    const spacing = 480;
    
    this.characters.forEach((character, index) => {
      const x = startX + (index * spacing);
      const y = 400;
      
      // Создаем изображение персонажа
      if (this.textures.exists(character.id)) {
        character.sprite = this.add.image(x, y, character.id);
        if (character.sprite) {
          character.sprite.setScale(1.5);
          
          // Добавляем рамку для выбранного персонажа
          if (character.id === this.selectedCharacter) {
            character.sprite.setTint(0x00ff00);
          }
        }
      }
      
      // Создаем кнопку выбора
      character.button = new CyberButton(this, x, y + 150, character.name, () => {
        this.selectCharacter(character.id);
      }, {
        width: 300,
        height: 60,
        fontSize: 24
      });
    });
  }

  private createControlButtons(): void {
    // Кнопка подтверждения
    this.confirmButton = new CyberButton(this, 960, 700, 'НАЧАТЬ ИГРУ', () => {
      localStorage.setItem('selectedCharacter', this.selectedCharacter);
      this.scene.start('MainScene', { character: this.selectedCharacter });
    }, {
      width: 300,
      height: 80,
      fontSize: 28
    });
    
    // Кнопка возврата
    this.backButton = new CyberButton(this, 960, 800, 'НАЗАД', () => {
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
      localStorage.setItem('selectedCharacter', this.selectedCharacter);
      this.scene.start('MainScene', { character: this.selectedCharacter });
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
    // Убираем выделение с предыдущего персонажа
    const previousChar = this.characters.find(c => c.id === this.selectedCharacter);
    if (previousChar?.sprite) {
      previousChar.sprite.clearTint();
    }
    
    // Выделяем новый персонаж
    this.selectedCharacter = characterId;
    const newChar = this.characters.find(c => c.id === characterId);
    if (newChar?.sprite) {
      newChar.sprite.setTint(0x00ff00);
    }
    
    // Обновляем информацию о персонаже
    this.updateCharacterInfo();
    
    // Воспроизводим звук выбора
    this.audioManager.playSound(`gameplay/replicas/${characterId}/select`);
  }

  private updateCharacterInfo(): void {
    const character = this.characters.find(c => c.id === this.selectedCharacter);
    if (!character) return;
    
    if (this.characterInfo) {
      this.characterInfo.destroy();
    }
    
    this.characterInfo = this.add.text(960, 600, 
      `${character.name}\n\n${character.description}`, {
      fontSize: '24px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
  }
}
