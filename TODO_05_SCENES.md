# ЭТАП 5: СЦЕНЫ И ИГРОВАЯ ЛОГИКА

## 📋 TODO - ПЕРЕВОД СЦЕН НА TYPESCRIPT

### 1. GAMELEVELSCENE → TYPESCRIPT (БАЗОВЫЙ КЛАСС)

#### src/scenes/base/GameLevelScene.ts
```typescript
import { IGameLevel, LevelData, LevelConfig } from '../../types/scene.types';
import { ConfigManager, AudioManager, EventManager } from '../../managers';
import { CharacterFactory } from '../../objects/characters';

export abstract class GameLevelScene extends Phaser.Scene implements IGameLevel {
  // Свойства уровня
  public levelId: number;
  public selectedCharacter: string;
  public levelConfig: LevelConfig | null = null;
  public levelStartTime: number = 0;
  public levelCompleted: boolean = false;
  public isPaused: boolean = false;
  
  // Менеджеры
  protected configManager: ConfigManager;
  protected audioManager: AudioManager;
  protected eventManager: EventManager;
  
  // Параметры уровня
  protected levelParams: { [key: string]: any } = {};
  protected backgroundPath: string;
  protected musicPath: string;
  
  // UI элементы
  protected pauseText?: Phaser.GameObjects.Text;
  protected resumeText?: Phaser.GameObjects.Text;
  protected levelCompletedText?: Phaser.GameObjects.Text;
  protected nextLevelText?: Phaser.GameObjects.Text;
  protected gameOverTitle?: Phaser.GameObjects.Text;
  protected restartText?: Phaser.GameObjects.Text;
  protected gameOverBackground?: Phaser.GameObjects.Rectangle;

  constructor(config: {
    key: string;
    levelId: number;
    levelParams?: { [key: string]: any };
    backgroundPath?: string;
    musicPath?: string;
  }) {
    super({ key: config.key });
    
    this.levelId = config.levelId;
    this.levelParams = config.levelParams || {};
    this.backgroundPath = config.backgroundPath || `images/backgrounds/background_level${this.levelId}.png`;
    this.musicPath = config.musicPath || `sounds/level_music/level${this.levelId}_music.wav`;
    
    // Инициализируем менеджеры
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.eventManager = EventManager.getInstance();
  }

  public init(data: LevelData): void {
    console.log(`Initializing level ${this.levelId}...`);
    
    // Если передан ID уровня, используем его
    if (data?.levelId) {
      this.levelId = data.levelId;
    }
    
    // Если передан выбранный персонаж, сохраняем его
    if (data?.character) {
      this.selectedCharacter = data.character;
    } else {
      // Если персонаж не передан, пытаемся получить его из localStorage
      this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
    }
    
    // Получаем конфигурацию уровня
    this.levelConfig = this.initializeLevel();
    
    // Сбрасываем флаг завершения уровня
    this.levelCompleted = false;
    
    console.log(`Level ${this.levelId} initialized with character: ${this.selectedCharacter}`);
  }

  private initializeLevel(): LevelConfig {
    // Получаем базовые настройки уровня
    const levelSettings = this.configManager.getValue('core', `levels.level${this.levelId}`, {});
    
    return {
      id: this.levelId,
      name: levelSettings.name || `Level ${this.levelId}`,
      unlocked: true,
      targetScore: levelSettings.targetScore || 1000,
      timeLimit: levelSettings.timeLimit,
      backgroundPath: this.backgroundPath,
      musicPath: this.musicPath
    };
  }

  public preload(): void {
    this.preloadLevelResources();
  }

  private preloadLevelResources(): void {
    console.log(`Loading resources for level ${this.levelId}...`);
    
    const cacheBuster = Date.now();
    
    // Загружаем фон уровня
    this.load.image(`background_level${this.levelId}`, `assets/${this.backgroundPath}?v=${cacheBuster}`);
    
    // Загружаем музыку для уровня
    this.load.audio(`backgroundMusic_level${this.levelId}`, `assets/${this.musicPath}?v=${cacheBuster}`);
    
    // Загружаем звуки
    this.load.audio('explosionSound', `assets/sounds/gameplay/effects/explosion.wav?v=${cacheBuster}`);
    
    // Загружаем игровые объекты
    this.load.image('player', `assets/images/gameplay/player.png?v=${cacheBuster}`);
    this.load.image('goodItem', `assets/images/gameplay/good_psu.png?v=${cacheBuster}`);
    this.load.image('badItem', `assets/images/gameplay/bad_psu.png?v=${cacheBuster}`);
    this.load.image('veryGoodItem', `assets/images/gameplay/very_good_psu.png?v=${cacheBuster}`);
    
    // Загружаем иконки для UI
    this.load.image('healthIcon', `assets/game_icons/health.png?v=${cacheBuster}`);
    this.load.image('scoreIcon', `assets/game_icons/score.png?v=${cacheBuster}`);
    this.load.image('moneyIcon', `assets/game_icons/money.png?v=${cacheBuster}`);
    this.load.image('rageIcon', `assets/game_icons/rage.png?v=${cacheBuster}`);
    this.load.image('basketIcon', `assets/game_icons/backet.png?v=${cacheBuster}`);
    
    // Загружаем атласы для взрывов
    this.load.atlas('good_super', `assets/images/gameplay/explosions/good_super.png?v=${cacheBuster}`, `assets/configs/sprites/good_super.json?v=${cacheBuster}`);
    this.load.atlas('bad_money', `assets/images/gameplay/explosions/bad_money.png?v=${cacheBuster}`, `assets/configs/sprites/bad_money.json?v=${cacheBuster}`);
    
    // Загружаем изображения персонажей если их нет
    this.preloadCharacterTextures(cacheBuster);
    
    // Загружаем звуки персонажей
    this.preloadCharacterSounds(cacheBuster);
    
    // Создание заглушки для основного взрыва
    this.load.image('explosion', `assets/images/gameplay/explosion.png?v=${cacheBuster}`);
  }

  private preloadCharacterTextures(cacheBuster: number): void {
    const characters = ['friender_s', 'trader', 'zummer'];
    
    characters.forEach(characterId => {
      if (!this.textures.exists(characterId)) {
        this.load.image(characterId, `assets/characters/${characterId}.png?v=${cacheBuster}`);
      }
    });
  }

  private preloadCharacterSounds(cacheBuster: number): void {
    const characters = ['friender_s', 'trader', 'zummer'];
    const soundTypes = ['collect', 'hit', 'special', 'select'];
    
    characters.forEach(characterId => {
      soundTypes.forEach(soundType => {
        const soundKey = `gameplay/replicas/${characterId}/${soundType}`;
        this.load.audio(soundKey, `assets/sounds/gameplay/replicas/${characterId}/${soundType}.mp3?v=${cacheBuster}`);
      });
    });
  }

  public create(): void {
    console.log(`Creating level ${this.levelId}...`);
    
    // Запоминаем время начала уровня
    this.levelStartTime = this.time.now;
    
    // Создаем игровые объекты
    this.createLevelObjects();
    
    // Настраиваем подписки на события
    this.setupEventListeners();
  }

  private createLevelObjects(): void {
    // Инициализируем AudioManager
    this.audioManager.init(this);
    
    // Создаем фон
    this.createBackground();
    
    // Воспроизводим музыку
    this.audioManager.playMusic(`backgroundMusic_level${this.levelId}`);
    
    // Инициализируем игровое состояние
    this.initializeGameState();
    
    // Создаем игровые сущности
    this.createGameEntities();
    
    // Создаем UI элементы
    this.createUIElements();
    
    // Настраиваем обработчики ввода
    this.setupInputHandlers();
  }

  private createBackground(): void {
    const bg = this.add.image(960, 540, `background_level${this.levelId}`);
    bg.setDisplaySize(1920, 1080);
  }

  private initializeGameState(): void {
    // Инициализируем счет и здоровье при начале нового уровня
    this.registry.set('score', 0);
    this.registry.set('health', 100);
    this.registry.set('gameOver', false);
    this.registry.set('itemSpawnTime', 0);
  }

  private createGameEntities(): void {
    // Создание игрока
    this.createPlayer();
    
    // Инициализация пулов предметов
    this.initializeItemPools();
    
    // Создаем невидимые стены
    this.createWalls();
    
    // Настраиваем коллизии
    this.setupCollisions();
  }

  private createPlayer(): void {
    try {
      console.log('Creating player...');
      
      const characterTexture = this.selectedCharacter || 'friender_s';
      console.log(`Creating player with texture: ${characterTexture}`);
      
      // Проверяем доступные текстуры
      console.log('Available textures:', Object.keys(this.textures.list));
      
      if (this.textures.exists(characterTexture)) {
        // Создаем персонажа с помощью фабрики
        const gameCharacter = CharacterFactory.createCharacter(this, 960, 900, characterTexture);
        
        console.log('Character created successfully:', gameCharacter);
      } else {
        throw new Error(`Character texture '${characterTexture}' not found`);
      }
    } catch (error) {
      console.error('Error creating player:', error);
      throw error;
    }
  }

  private initializeItemPools(): void {
    // Инициализация пулов предметов через ObjectPoolManager
    // Эта логика будет реализована в отдельном файле
  }

  private createWalls(): void {
    // Создаем невидимые стены по бокам для отскока предметов
    const leftWall = this.physics.add.staticGroup();
    const rightWall = this.physics.add.staticGroup();
    
    leftWall.create(0, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    rightWall.create(1920, 540, 'player').setScale(0.1, 18).refreshBody().setVisible(false);
    
    this.registry.set('leftWall', leftWall);
    this.registry.set('rightWall', rightWall);
  }

  private setupCollisions(): void {
    // Настройка коллизий будет реализована в отдельном методе
  }

  private createUIElements(): void {
    // Создание UI элементов (счет, здоровье, и т.д.)
  }

  private setupInputHandlers(): void {
    // Обработчик клавиши паузы (P)
    this.input.keyboard?.on('keydown-P', () => {
      this.togglePause();
    });
    
    // Обработчик клавиши меню (M)
    this.input.keyboard?.on('keydown-M', () => {
      this.returnToMenu();
    });
    
    // Обработчик клавиши пробел для перехода на следующий уровень
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.levelCompleted) {
        this.hideCompletionTexts();
        this.goToNextLevel();
      }
    });
  }

  private setupEventListeners(): void {
    // Подписываемся на игровые события
    this.eventManager.subscribeScene(this, 'GAME_OVER', () => {
      this.handleGameOver();
    });
    
    this.eventManager.subscribeScene(this, 'LEVEL_COMPLETED', () => {
      this.handleLevelCompleted();
    });
    
    this.eventManager.subscribeScene(this, 'UI_UPDATE', (data) => {
      this.updateUI(data);
    });
  }

  public update(time: number): void {
    if (this.isPaused || this.registry.get('gameOver')) {
      return;
    }
    
    // Обновляем персонажа
    const gameCharacter = this.registry.get('gameCharacter');
    if (gameCharacter && typeof gameCharacter.update === 'function') {
      gameCharacter.update(time);
    }
    
    // Обновляем спавн предметов
    this.updateItemSpawning(time);
    
    // Проверяем условия завершения уровня
    this.checkLevelCompletion();
  }

  private updateItemSpawning(time: number): void {
    // Логика спавна предметов
  }

  private checkLevelCompletion(): void {
    const score = this.registry.get('score') || 0;
    const targetScore = this.levelConfig?.targetScore || 1000;
    
    if (score >= targetScore && !this.levelCompleted) {
      this.levelCompleted = true;
      this.eventManager.emit('LEVEL_COMPLETED');
    }
  }

  // Методы управления игрой
  public togglePause(): void {
    this.isPaused = !this.isPaused;
    
    if (this.isPaused) {
      this.physics.pause();
      this.showPauseUI();
    } else {
      this.physics.resume();
      this.hidePauseUI();
    }
  }

  private showPauseUI(): void {
    if (!this.pauseText) {
      this.pauseText = this.add.text(960, 400, 'ИГРА НА ПАУЗЕ', {
        fontSize: '64px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#00f7ff',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    if (!this.resumeText) {
      this.resumeText = this.add.text(960, 500, 'Нажмите P для продолжения', {
        fontSize: '32px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    this.pauseText.setVisible(true);
    this.resumeText.setVisible(true);
  }

  private hidePauseUI(): void {
    if (this.pauseText) {
      this.pauseText.setVisible(false);
    }
    if (this.resumeText) {
      this.resumeText.setVisible(false);
    }
  }

  public returnToMenu(): void {
    this.audioManager.stopMusic();
    this.cleanup();
    this.scene.start('MenuScene');
  }

  public goToNextLevel(): void {
    const nextLevelId = this.levelId + 1;
    
    // Проверяем существование следующего уровня
    if (nextLevelId <= 3) { // Максимум 3 уровня
      this.audioManager.stopMusic();
      this.cleanup();
      this.scene.start(`Level${nextLevelId}Scene`, { 
        levelId: nextLevelId, 
        character: this.selectedCharacter 
      });
    } else {
      // Все уровни пройдены
      this.returnToMenu();
    }
  }

  // Обработчики событий
  private handleGameOver(): void {
    this.showGameOverUI();
  }

  private handleLevelCompleted(): void {
    this.showLevelCompletedUI();
  }

  private showGameOverUI(): void {
    if (!this.gameOverBackground) {
      this.gameOverBackground = this.add.rectangle(960, 540, 1920, 1080, 0x000000, 0.7);
    }
    
    if (!this.gameOverTitle) {
      this.gameOverTitle = this.add.text(960, 400, 'ИГРА ОКОНЧЕНА', {
        fontSize: '64px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#ff0000',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    if (!this.restartText) {
      this.restartText = this.add.text(960, 500, 'Нажмите R для перезапуска или M для меню', {
        fontSize: '32px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    this.gameOverBackground.setVisible(true);
    this.gameOverTitle.setVisible(true);
    this.restartText.setVisible(true);
  }

  private showLevelCompletedUI(): void {
    if (!this.levelCompletedText) {
      this.levelCompletedText = this.add.text(960, 400, 'УРОВЕНЬ ПРОЙДЕН!', {
        fontSize: '64px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#00ff00',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    if (!this.nextLevelText) {
      this.nextLevelText = this.add.text(960, 500, 'Нажмите ПРОБЕЛ для следующего уровня', {
        fontSize: '32px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
    }
    
    this.levelCompletedText.setVisible(true);
    this.nextLevelText.setVisible(true);
  }

  private hideCompletionTexts(): void {
    if (this.levelCompletedText) {
      this.levelCompletedText.setVisible(false);
    }
    if (this.nextLevelText) {
      this.nextLevelText.setVisible(false);
    }
  }

  private updateUI(data: { score?: number; health?: number }): void {
    // Обновление UI элементов
  }

  private cleanup(): void {
    // Очистка ресурсов при переходе на другую сцену
    this.eventManager.emit('SCENE_CLEANUP');
  }

  // Абстрактные методы для переопределения в наследниках
  protected abstract getCustomLevelLogic(): void;
}
```

### 2. КОНКРЕТНЫЕ УРОВНИ → TYPESCRIPT

#### src/scenes/levels/GameLevels.ts
```typescript
import { GameLevelScene } from '../base/GameLevelScene';

export class MainScene extends GameLevelScene {
  constructor() {
    super({
      key: 'MainScene',
      levelId: 1,
      backgroundPath: 'images/backgrounds/background_level1.png',
      musicPath: 'sounds/level_music/level1_music.wav'
    });
  }

  protected getCustomLevelLogic(): void {
    // Специфичная логика для уровня 1
    console.log('Level 1 custom logic initialized');
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
  }
}

export class Level2Scene extends GameLevelScene {
  constructor() {
    super({
      key: 'Level2Scene',
      levelId: 2,
      backgroundPath: 'images/backgrounds/background_level2.png',
      musicPath: 'sounds/level_music/level2_music.wav'
    });
  }

  protected getCustomLevelLogic(): void {
    // Специфичная логика для уровня 2
    console.log('Level 2 custom logic initialized');
    
    // Уровень 2 может иметь увеличенную сложность
    this.levelParams.itemSpawnRate = 0.8; // Быстрее спавн
    this.levelParams.badItemChance = 0.6; // Больше плохих предметов
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
  }
}

export class Level3Scene extends GameLevelScene {
  constructor() {
    super({
      key: 'Level3Scene',
      levelId: 3,
      backgroundPath: 'images/backgrounds/background_level3.png',
      musicPath: 'sounds/level_music/level3_music.wav'
    });
  }

  protected getCustomLevelLogic(): void {
    // Специфичная логика для уровня 3
    console.log('Level 3 custom logic initialized');
    
    // Уровень 3 - максимальная сложность
    this.levelParams.itemSpawnRate = 0.6; // Очень быстрый спавн
    this.levelParams.badItemChance = 0.7; // Много плохих предметов
    this.levelParams.timeLimit = 120000; // Ограничение по времени (2 минуты)
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
    
    // Добавляем таймер для уровня 3
    this.setupTimeLimit();
  }

  private setupTimeLimit(): void {
    if (this.levelParams.timeLimit) {
      this.time.delayedCall(this.levelParams.timeLimit, () => {
        if (!this.levelCompleted) {
          this.registry.set('gameOver', true);
          this.eventManager.emit('GAME_OVER');
        }
      });
    }
  }
}
```

### 3. UI СЦЕНЫ → TYPESCRIPT

#### src/scenes/ui/MenuScene.ts
```typescript
import { ConfigManager, AudioManager } from '../../managers';
import { CyberButton, CyberTitle } from '../../ui';

export class MenuScene extends Phaser.Scene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private uiElements: any[] = [];

  constructor() {
    super({ key: 'MenuScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
  }

  public preload(): void {
    // Загружаем ресурсы для главного меню
    this.load.image('menuBackground', 'assets/ui/menu_background.png');
    this.load.audio('menuMusic', 'assets/sounds/menu/menu_background.wav');
    
    // Загружаем все JSON-конфиги
    this.loadAllConfigs();
  }

  private loadAllConfigs(): void {
    console.log('Loading all JSON configs...');
    
    // Загружаем основные конфиги
    this.load.json('core', 'assets/configs/core.json');
    this.load.json('characters/base_stat', 'assets/configs/characters/base_stat.json');
    this.load.json('characters/info', 'assets/configs/characters/info.json');
    
    // Загружаем конфиги механик
    this.load.json('characters/mechanics/health', 'assets/configs/characters/mechanics/health.json');
    this.load.json('characters/mechanics/graph', 'assets/configs/characters/mechanics/graph.json');
    this.load.json('characters/mechanics/money', 'assets/configs/characters/mechanics/money.json');
    this.load.json('characters/mechanics/rage', 'assets/configs/characters/mechanics/rage.json');
    
    // Загружаем конфиги навыков
    this.load.json('characters/skills/friender', 'assets/configs/characters/skills/friender.json');
    this.load.json('characters/skills/trader', 'assets/configs/characters/skills/trader.json');
    this.load.json('characters/skills/zoomer', 'assets/configs/characters/skills/zoomer.json');
    
    // Загружаем конфиги трейдера
    this.load.json('localization/trader_ui', 'assets/configs/localization/trader_ui.json');
    // ... остальные конфиги
  }

  public create(): void {
    // Инициализируем AudioManager
    this.audioManager.init(this);
    
    // Добавляем фоновое изображение
    this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080);
    
    // Останавливаем предыдущую музыку
    this.audioManager.stopMusic();
    
    // Загружаем все конфиги в ConfigManager
    this.initializeConfigManager();
    
    // Добавляем и запускаем фоновую музыку для меню
    this.audioManager.addMusic('menuMusic', 'menuMusic', { loop: true, volume: 0.10 });
    this.audioManager.playMusic('menuMusic');
    
    // Создаем UI элементы
    this.createUIElements();
  }

  private createUIElements(): void {
    // Добавляем заголовок игры
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
    
    // Создаем кнопки меню
    const startButton = new CyberButton(
      this,
      960,
      380,
      'Начать игру',
      () => {
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
      480,
      'Настройки',
      () => {
        this.scene.start('SettingsScene');
      },
      {
        width: 400,
        height: 80,
        fontSize: 32
      }
    );
    this.uiElements.push(settingsButton);
    
    const aboutButton = new CyberButton(
      this,
      960,
      580,
      'Об игре',
      () => {
        this.scene.start('AboutScene');
      },
      {
        width: 400,
        height: 80,
        fontSize: 32
      }
    );
    this.uiElements.push(aboutButton);
  }

  private initializeConfigManager(): void {
    console.log('Initializing ConfigManager...');
    
    try {
      // Загружаем основной конфиг
      this.configManager.loadFromCache(this, 'core', 'core');
      
      // Загружаем конфиги персонажей
      this.configManager.loadFromCache(this, 'characters/base_stat', 'characters/base_stat');
      this.configManager.loadFromCache(this, 'characters/info', 'characters/info');
      
      // ... остальные конфиги
      
      // Устанавливаем флаг, что все конфиги загружены
      this.configManager.setConfigsLoaded(true);
      
      console.log('All configs successfully loaded into ConfigManager!');
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  }

  public shutdown(): void {
    // Очищаем ресурсы при уничтожении сцены
    this.uiElements.forEach(element => {
      if (element && typeof element.destroy === 'function') {
        element.destroy();
      }
    });
    this.uiElements = [];
  }
}
```

### 4. ОСТАЛЬНЫЕ UI СЦЕНЫ

#### src/scenes/ui/CharacterSelectScene.ts
```typescript
import { ConfigManager, AudioManager } from '../../managers';
import { CyberButton, CyberTitle, CyberCard } from '../../ui';

export class CharacterSelectScene extends Phaser.Scene {
  private configManager: ConfigManager;
  private audioManager: AudioManager;
  private uiElements: any[] = [];
  private characters: any[] = [];
  private selectedCharacter: any = null;
  private characterCards: any[] = [];

  constructor() {
    super({ key: 'CharacterSelectScene' });
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
  }

  public preload(): void {
    // Загружаем ресурсы
    this.load.image('menuBackground', 'assets/ui/menu_background.png');
    this.load.json('characters/info', 'assets/configs/characters/info.json');
    
    // Загружаем изображения персонажей
    this.loadCharacterImages();
    
    // Загружаем звуки выбора персонажей
    this.loadCharacterSounds();
  }

  private loadCharacterImages(): void {
    const characterIds = ['friender_s', 'trader', 'zummer'];
    
    characterIds.forEach(characterId => {
      if (!this.textures.exists(characterId)) {
        this.load.image(characterId, `assets/characters/${characterId}.png`);
      }
    });
  }

  private loadCharacterSounds(): void {
    const cacheBuster = Date.now();
    const characterIds = ['friender_s', 'trader', 'zummer'];
    
    characterIds.forEach(characterId => {
      const basePath = `assets/sounds/gameplay/replicas/${characterId}`;
      this.load.audio(`gameplay/replicas/${characterId}/select`, `${basePath}/select.mp3?v=${cacheBuster}`);
    });
  }

  public create(): void {
    // Инициализируем менеджеры
    this.audioManager.init(this);
    this.configManager.loadFromCache(this, 'characters/info', 'characters/info');
    
    // Получаем данные персонажей
    const characterInfo = this.configManager.getConfig('characters/info');
    if (!characterInfo) {
      console.error('Failed to load character configuration');
      return;
    }
    
    this.characters = Object.values(characterInfo).map((char: any) => ({
      id: char.id,
      name: char.name,
      image: char.texture,
      description: char.fullDescription || char.shortDescription,
      category: char.category
    }));
    
    this.createUI();
  }

  private createUI(): void {
    // Фон
    this.add.rectangle(960, 540, 1920, 1080, 0x0a0f1c).setAlpha(0.9);
    this.add.image(960, 540, 'menuBackground').setDisplaySize(1920, 1080).setAlpha(0.3);
    
    // Заголовок
    const title = new CyberTitle(
      this,
      960,
      150,
      'Выбор персонажа',
      {
        fontSize: 64,
        glowIntensity: 1.8,
        pulseAnimation: true
      }
    );
    this.uiElements.push(title);
    
    // Создаем карточки персонажей
    this.createCharacterCards();
    
    // Кнопки навигации
    this.createNavigationButtons();
  }

  private createCharacterCards(): void {
    this.characterCards = [];
    const startX = 960 - ((this.characters.length - 1) * 250);
    
    this.characters.forEach((character, index) => {
      const x = startX + (index * 500);
      const y = 400;
      
      const card = new CyberCard(
        this,
        x,
        y,
        character.image,
        (selectedCard) => {
          this.selectCharacter(character, selectedCard);
        },
        {
          cardWidth: 200,
          cardHeight: 300,
          imageScale: 0.8
        }
      );
      
      this.characterCards.push(card);
      this.uiElements.push(card);
      
      // Добавляем текст с именем персонажа
      const nameText = this.add.text(x, y + 180, character.name, {
        fontSize: '24px',
        fontFamily: 'Orbitron, sans-serif',
        color: '#00f7ff',
        align: 'center'
      }).setOrigin(0.5);
      
      this.uiElements.push({ destroy: () => nameText.destroy() });
    });
  }

  private selectCharacter(character: any, card: any): void {
    // Сбрасываем выбор у всех карточек
    this.characterCards.forEach(c => c.setSelected(false));
    
    // Выбираем текущую карточку
    card.setSelected(true);
    this.selectedCharacter = character;
    
    // Воспроизводим звук выбора
    const soundKey = `gameplay/replicas/${character.id}/select`;
    this.audioManager.playSound(soundKey);
    
    // Показываем описание персонажа
    this.showCharacterDescription(character);
  }

  private showCharacterDescription(character: any): void {
    // Удаляем предыдущее описание
    const existingDesc = this.uiElements.find(el => el.isDescription);
    if (existingDesc) {
      existingDesc.destroy();
      this.uiElements = this.uiElements.filter(el => el !== existingDesc);
    }
    
    // Создаем новое описание
    const descText = this.add.text(960, 650, character.description, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 800 }
    }).setOrigin(0.5);
    
    const descElement = { 
      destroy: () => descText.destroy(),
      isDescription: true
    };
    
    this.uiElements.push(descElement);
  }

  private createNavigationButtons(): void {
    // Кнопка "Назад"
    const backButton = new CyberButton(
      this,
      400,
      950,
      'Назад',
      () => {
        this.scene.start('MenuScene');
      },
      {
        width: 200,
        height: 60,
        fontSize: 24
      }
    );
    this.uiElements.push(backButton);
    
    // Кнопка "Выбрать"
    const selectButton = new CyberButton(
      this,
      1520,
      950,
      'Выбрать',
      () => {
        if (this.selectedCharacter) {
          localStorage.setItem('selectedCharacter', this.selectedCharacter.id);
          this.scene.start('LevelSelectScene');
        } else {
          this.showWarning('Сначала выберите персонажа!');
        }
      },
      {
        width: 200,
        height: 60,
        fontSize: 24,
        pulseAnimation: true
      }
    );
    this.uiElements.push(selectButton);
  }

  private showWarning(message: string): void {
    const warningText = this.add.text(960, 800, message, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);
    
    // Удаляем предупреждение через 3 секунды
    this.time.delayedCall(3000, () => {
      warningText.destroy();
    });
  }

  public shutdown(): void {
    this.uiElements.forEach(element => {
      if (element && typeof element.destroy === 'function') {
        element.destroy();
      }
    });
    this.uiElements = [];
  }
}
```

---

## ✅ CHECKLIST

- [ ] Создать GameLevelScene.ts (базовый класс)
- [ ] Создать GameLevels.ts (конкретные уровни)
- [ ] Создать MenuScene.ts
- [ ] Создать CharacterSelectScene.ts
- [ ] Создать LevelSelectScene.ts
- [ ] Создать SettingsScene.ts
- [ ] Создать AboutScene.ts
- [ ] Добавить тесты для сцен
- [ ] Протестировать переходы между сценами
- [ ] Обновить импорты в game.ts
- [ ] Добавить JSDoc комментарии

---

## 🎯 РЕЗУЛЬТАТ ЭТАПА

После завершения этого этапа:
- ✅ Все сцены типизированы
- ✅ Единая архитектура сцен
- ✅ Устранено дублирование кода
- ✅ Улучшена обработка событий
- ✅ Добавлена типобезопасность

**Время выполнения**: 3-4 дня
