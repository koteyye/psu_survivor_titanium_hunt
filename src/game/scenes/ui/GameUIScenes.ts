import { ConfigManager, AudioManager } from '../../../systems/managers';
import { CyberButton, CyberTitle } from '../../ui';
import { LevelManager } from '../../../utils/LevelManager';
import { BaseMenuScene } from '../base/BaseMenuScene';

/**
 * Сцена выбора уровня
 */
export class LevelSelectScene extends BaseMenuScene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private levelManager: LevelManager;
  private levelButtons: CyberButton[] = [];
  private backButton?: CyberButton;

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.levelManager = LevelManager.getInstance();
  }

  public preload(): void {
    console.log('LevelSelectScene: Loading resources...');
    // Preload the menu background
    this.preloadMenuBackground();
  }

  public create(): void {
    console.log('LevelSelectScene: Creating level selection...');
    
    // Создаем фон
    this.createBackground();
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем кнопки уровней
    this.createLevelButtons();
    
    // Создаем кнопку возврата
    this.createBackButton();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Use the shared menu background system
    this.createMenuBackground();
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'ВЫБОР УРОВНЯ', {
      fontSize: 64
    });
  }

  private createLevelButtons(): void {
    // Получаем уровни из LevelManager
    const allLevels = this.levelManager.getAllLevels();
    const levelScenes = ['MainScene', 'Level2Scene', 'Level3Scene'];

    allLevels.forEach((level: any, index: number) => {
      const x = 960;
      const y = 300 + (index * 150);
      
      const button = new CyberButton(this, x, y, level.name.toUpperCase(), () => {
        if (level.unlocked) {
          const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
          const sceneKey = levelScenes[index] || 'MainScene';
          this.scene.start(sceneKey, { 
            levelId: level.id,
            character: selectedCharacter 
          });
        } else {
          console.log(`Level ${level.id} is locked!`);
        }
      }, {
        width: 400,
        height: 80,
        fontSize: 32
      });
      
      // Если уровень заблокирован, делаем кнопку серой
      if (!level.unlocked) {
        button.setAlpha(0.5);
        // Можно добавить замочек или другую индикацию
      }
      
      // Добавляем информацию о сложности и целевом счете
      const infoText = this.add.text(x, y + 50, 
        `Сложность: ${level.difficulty} | Цель: ${level.targetScore} очков`, {
        fontSize: '18px',
        fontFamily: 'Orbitron, sans-serif',
        color: level.unlocked ? '#ffffff' : '#666666',
        align: 'center'
      }).setOrigin(0.5);
      
      this.levelButtons.push(button);
    });
  }

  private createBackButton(): void {
    this.backButton = new CyberButton(this, 960, 750, 'НАЗАД', () => {
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
    
    // Быстрый выбор уровней
    this.input.keyboard?.on('keydown-ONE', () => {
      const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      this.scene.start('MainScene', { levelId: 1, character: selectedCharacter });
    });
    
    this.input.keyboard?.on('keydown-TWO', () => {
      const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      this.scene.start('Level2Scene', { levelId: 2, character: selectedCharacter });
    });
    
    this.input.keyboard?.on('keydown-THREE', () => {
      const selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      this.scene.start('Level3Scene', { levelId: 3, character: selectedCharacter });
    });
  }
}

/**
 * Сцена настроек
 */
export class SettingsScene extends BaseMenuScene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private backButton?: CyberButton;
  private musicButton?: CyberButton;
  private soundButton?: CyberButton;
  private musicEnabled: boolean = true;
  private soundEnabled: boolean = true;

  constructor() {
    super({ key: 'SettingsScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
  }

  public init(): void {
    // Загружаем текущие настройки
    this.musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
  }

  public preload(): void {
    console.log('SettingsScene: Loading resources...');
    // Preload the menu background
    this.preloadMenuBackground();
    
    // Load settings icons
    this.load.image('musicIcon', 'assets/ui/music.png');
    this.load.image('soundIcon', 'assets/ui/sound.png');
  }

  public create(): void {
    console.log('SettingsScene: Creating settings...');
    
    // Создаем фон
    this.createBackground();
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем настройки
    this.createSettingsControls();
    
    // Создаем кнопку возврата
    this.createBackButton();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Use the shared menu background system
    this.createMenuBackground();
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'НАСТРОЙКИ', {
      fontSize: 64
    });
  }

  private createSettingsControls(): void {
    // Music setting with icon - правый край иконки на уровне левого края кнопки "Назад"
    const musicIcon = this.add.image(780, 320, 'musicIcon'); // Сдвинута левее, чтобы правый край был на уровне 860
    musicIcon.setScale(0.2); // Значительно уменьшенный масштаб для компактного размера
    
    this.musicButton = new CyberButton(this, 1130, 320, this.musicEnabled ? 'ВКЛ' : 'ВЫКЛ', () => {
      this.toggleMusic();
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
    
    // Sound setting with icon - правый край иконки на уровне левого края кнопки "Назад"
    const soundIcon = this.add.image(780, 450, 'soundIcon'); // Сдвинута левее + небольшая корректировка для выравнивания центра
    soundIcon.setScale(0.2); // Значительно уменьшенный масштаб для компактного размера
    
    this.soundButton = new CyberButton(this, 1130, 450, this.soundEnabled ? 'ВКЛ' : 'ВЫКЛ', () => {
      this.toggleSound();
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
  }

  private createBackButton(): void {
    this.backButton = new CyberButton(this, 960, 600, 'НАЗАД', () => {
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
  }

  private toggleMusic(): void {
    this.musicEnabled = !this.musicEnabled;
    localStorage.setItem('musicEnabled', this.musicEnabled.toString());
    this.audioManager.setMusicEnabled(this.musicEnabled);
    
    if (this.musicButton) {
      // this.musicButton.setText(this.musicEnabled ? 'ВКЛ' : 'ВЫКЛ');
    }
  }

  private toggleSound(): void {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('soundEnabled', this.soundEnabled.toString());
    this.audioManager.setSoundEnabled(this.soundEnabled);
    
    if (this.soundButton) {
      // this.soundButton.setText(this.soundEnabled ? 'ВКЛ' : 'ВЫКЛ');
    }
  }
}

/**
 * Interface for about game configuration
 */
interface AboutGameConfig {
  pageTitle: string;
  gameInfo: string;
  author: string;
  version: string;
}

/**
 * Сцена "О игре"
 */
export class AboutScene extends BaseMenuScene {
  private backButton?: CyberButton;
  private aboutConfig?: AboutGameConfig;
  private configLoadError: boolean = false;

  constructor() {
    super({ key: 'AboutScene' });
  }

  public preload(): void {
    console.log('AboutScene: Loading resources...');
    // Preload the menu background
    this.preloadMenuBackground();
    
    // Load about game configuration
    this.load.json('aboutGameConfig', 'assets/configs/about-game.json');
    
    // Handle configuration loading success
    this.load.on('filecomplete-json-aboutGameConfig', () => {
      console.log('AboutScene: Configuration file loaded successfully');
    });
    
    // Handle configuration loading errors
    this.load.on('loaderror', (file: any) => {
      if (file.key === 'aboutGameConfig') {
        console.error('AboutScene: Failed to load about-game.json configuration');
        this.configLoadError = true;
      }
    });
  }

  public create(): void {
    console.log('AboutScene: Creating about screen...');
    
    // Load configuration data if available
    if (!this.configLoadError) {
      try {
        this.aboutConfig = this.cache.json.get('aboutGameConfig') as AboutGameConfig;
        if (this.aboutConfig) {
          console.log('AboutScene: Configuration loaded successfully:', this.aboutConfig);
        } else {
          console.warn('AboutScene: Configuration is null or undefined');
          this.configLoadError = true;
        }
      } catch (error) {
        console.error('AboutScene: Error parsing configuration data:', error);
        this.configLoadError = true;
      }
    } else {
      console.log('AboutScene: Using fallback content due to config load error');
    }
    
    // Создаем фон
    this.createBackground();
    
    // Создаем заголовок
    this.createTitle();
    
    // Создаем информацию об игре
    this.createGameInfo();
    
    // Создаем кнопку возврата
    this.createBackButton();
    
    // Настраиваем обработчики событий
    this.setupEventListeners();
  }

  private createBackground(): void {
    // Use the shared menu background system
    this.createMenuBackground();
  }

  private createTitle(): void {
    // Use title from configuration if available, otherwise use fallback
    const titleText = this.aboutConfig?.pageTitle || 'О ИГРЕ';
    
    const title = new CyberTitle(this, 960, 120, titleText, {
      fontSize: 64
    });
  }

  private createGameInfo(): void {
    let gameInfo: string;
    let authorInfo: string = '';
    let versionInfo: string = '';

    if (this.aboutConfig && !this.configLoadError) {
      // Use information from loaded configuration
      gameInfo = this.aboutConfig.gameInfo;
      authorInfo = `\n\nАвтор: ${this.aboutConfig.author}`;
      versionInfo = `\nВерсия: ${this.aboutConfig.version}`;
    } else {
      // Fallback information when configuration fails to load
      gameInfo = `PSU SURVIVOR: TITANIUM HUNT

Добро пожаловать в мир высоких технологий и опасных приключений!

В этой игре вы играете за одного из трех уникальных персонажей,
каждый из которых обладает особыми способностями:

• FRIENDER - Быстрый и ловкий, специализируется на скорости
• TRADER - Опытный торговец с финансовыми навыками  
• ZUMMER - Мощный воин с боевыми способностями

ЦЕЛЬ ИГРЫ:
Собирайте хорошие предметы и избегайте плохих, чтобы набрать 
максимальное количество очков и пройти все уровни.

УПРАВЛЕНИЕ:
- Стрелки или WASD для движения
- P - пауза
- M - возврат в меню
- ESC - выход

Удачи в охоте за титаном!`;
      
      // Show error message if configuration failed to load
      if (this.configLoadError) {
        authorInfo = '\n\n[Ошибка загрузки конфигурации]';
      }
    }

    const fullText = gameInfo + authorInfo + versionInfo;

    this.add.text(960, 450, fullText, {
      fontSize: '20px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 1200 }
    }).setOrigin(0.5);
  }

  private createBackButton(): void {
    this.backButton = new CyberButton(this, 960, 750, 'НАЗАД', () => {
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
  }
}
