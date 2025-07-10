import { IGameLevel, LevelData, LevelConfig } from '../../types/scene-types';
import { ConfigManager, AudioManager, EventManager } from '../../managers';
import { CharacterFactory } from '../../objects/characters';
import { ResourceLoader } from '../../utils/ResourceLoader';
import { AnimationUtils, ShaderUtils, progressManager, levelManager, ACHIEVEMENTS } from '../../utils';

/**
 * Абстрактный базовый класс для всех игровых уровней
 * Предоставляет общую функциональность для управления уровнями
 */
export abstract class GameLevelScene extends Phaser.Scene implements IGameLevel {
  // Свойства уровня
  public levelId: number;
  public selectedCharacter: string = '';
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
    const levelSettings = this.configManager.getValue('core', `levels.level${this.levelId}`, {}) as any;
    
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
    try {
      ResourceLoader.loadLevelResources(this, this.levelId);
    } catch (error) {
      console.error('Error loading level resources:', error);
      throw error;
    }
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
    
    // Инициализируем утилиты
    ShaderUtils.initShaders(this);
    AnimationUtils.createExplosionAnimations(this);
    
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
    this.eventManager.subscribeScene(this, 'GAME_OVER', (data) => {
      this.handleGameOver();
    });
    
    this.eventManager.subscribeScene(this, 'LEVEL_COMPLETE', (data) => {
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
      this.eventManager.emit('LEVEL_COMPLETE', { 
        levelId: this.levelId, 
        score: score 
      });
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
    
    this.pauseText?.setVisible(true);
    this.resumeText?.setVisible(true);
  }

  private hidePauseUI(): void {
    this.pauseText?.setVisible(false);
    this.resumeText?.setVisible(false);
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

  // Методы для интеграции с системой прогресса
  protected recordItemCollected(itemType: string, points: number = 0): void {
    // Обновляем статистику сбора предметов
    progressManager.addItemCollected(1);
    
    // Добавляем очки, если предмет дает их
    if (points > 0) {
      progressManager.addScore(points);
    }
    
    console.log(`Item collected: ${itemType}, points: ${points}`);
  }

  protected recordLevelStats(): void {
    const currentScore = this.registry.get('score') || 0;
    const playTime = this.time.now - this.levelStartTime;
    
    console.log(`Level ${this.levelId} stats: Score ${currentScore}, Time ${playTime}ms`);
  }

  // Методы для работы с достижениями
  protected checkSpeedRunAchievement(): void {
    const playTime = this.time.now - this.levelStartTime;
    if (playTime <= 60000) { // 60 секунд
      progressManager.recordSpeedRun(playTime);
    }
  }

  protected checkPerfectGameAchievement(): boolean {
    const currentHealth = this.registry.get('health') || 0;
    const maxHealth = this.registry.get('maxHealth') || 100;
    return currentHealth === maxHealth;
  }

  // Обработчики событий
  private handleGameOver(): void {
    // Записываем статистику игры
    const playTime = this.time.now - this.levelStartTime;
    const currentScore = this.registry.get('score') || 0;
    
    progressManager.recordGameEnd(false, currentScore, playTime, false);
    
    this.showGameOverUI();
  }

  private handleLevelCompleted(): void {
    // Записываем статистику успешного завершения
    const playTime = this.time.now - this.levelStartTime;
    const currentScore = this.registry.get('score') || 0;
    const perfectGame = this.registry.get('health') === this.registry.get('maxHealth');
    
    // Обновляем прогресс
    progressManager.recordGameEnd(true, currentScore, playTime, perfectGame);
    
    // Проверяем спидран
    progressManager.recordSpeedRun(playTime);
    
    // Завершаем уровень в LevelManager
    const levelCompleted = levelManager.completeLevel(this.levelId, currentScore);
    
    if (levelCompleted) {
      console.log(`Level ${this.levelId} completed successfully!`);
    }
    
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
    
    this.gameOverBackground?.setVisible(true);
    this.gameOverTitle?.setVisible(true);
    this.restartText?.setVisible(true);
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
    
    this.levelCompletedText?.setVisible(true);
    this.nextLevelText?.setVisible(true);
  }

  private hideCompletionTexts(): void {
    this.levelCompletedText?.setVisible(false);
    this.nextLevelText?.setVisible(false);
  }

  private updateUI(data: { score?: number; health?: number }): void {
    // Обновление UI элементов
  }

  private cleanup(): void {
    // Очистка ресурсов при переходе на другую сцену
    console.log('Cleaning up scene resources...');
  }

  // Абстрактные методы для переопределения в наследниках
  protected abstract getCustomLevelLogic(): void;
}
