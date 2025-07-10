import { ConfigManager, AudioManager } from '../../managers';
import { CyberButton, CyberTitle } from '../../ui';
import { levelManager } from '../../utils';

/**
 * Сцена выбора уровня
 */
export class LevelSelectScene extends Phaser.Scene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private levelButtons: CyberButton[] = [];
  private backButton?: CyberButton;

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
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
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
    graphics.fillRect(0, 0, 1920, 1080);
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'ВЫБОР УРОВНЯ', {
      fontSize: 64
    });
  }

  private createLevelButtons(): void {
    // Получаем уровни из LevelManager
    const allLevels = levelManager.getAllLevels();
    const levelScenes = ['MainScene', 'Level2Scene', 'Level3Scene'];

    allLevels.forEach((level, index) => {
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
export class SettingsScene extends Phaser.Scene {
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
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
    graphics.fillRect(0, 0, 1920, 1080);
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 150, 'НАСТРОЙКИ', {
      fontSize: 64
    });
  }

  private createSettingsControls(): void {
    // Настройка музыки
    this.add.text(600, 300, 'Музыка:', {
      fontSize: '32px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff'
    });
    
    this.musicButton = new CyberButton(this, 1200, 300, this.musicEnabled ? 'ВКЛ' : 'ВЫКЛ', () => {
      this.toggleMusic();
    }, {
      width: 200,
      height: 60,
      fontSize: 24
    });
    
    // Настройка звуков
    this.add.text(600, 400, 'Звуки:', {
      fontSize: '32px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff'
    });
    
    this.soundButton = new CyberButton(this, 1200, 400, this.soundEnabled ? 'ВКЛ' : 'ВЫКЛ', () => {
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
 * Сцена "О игре"
 */
export class AboutScene extends Phaser.Scene {
  private backButton?: CyberButton;

  constructor() {
    super({ key: 'AboutScene' });
  }

  public create(): void {
    console.log('AboutScene: Creating about screen...');
    
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
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x000033, 0x000033, 1);
    graphics.fillRect(0, 0, 1920, 1080);
  }

  private createTitle(): void {
    const title = new CyberTitle(this, 960, 120, 'О ИГРЕ', {
      fontSize: 64
    });
  }

  private createGameInfo(): void {
    const gameInfo = `
PSU SURVIVOR: TITANIUM HUNT

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

Удачи в охоте за титаном!
    `;

    this.add.text(960, 450, gameInfo, {
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
