import { ConfigManager, AudioManager, EventManager } from '../../../systems/managers';
import { CharacterFactory } from '../../entities/characters';
import { CharacterState } from '../../entities/characters/BaseCharacter';
import { AnimationUtils, ShaderUtils } from '../../../utils';
import { ProgressManager } from '../../../utils/ProgressManager';
import { LevelManager } from '../../../utils/LevelManager';
import { OptimizedResourceLoader } from '../../../systems/services/OptimizedResourceLoader';

// Temporary types until we create proper type files
interface LevelData {
  levelId?: number;
  character?: string;
}

interface LevelConfig {
  id: number;
  name: string;
  unlocked: boolean;
  targetScore: number;
  timeLimit?: number;
  backgroundPath: string;
  musicPath: string;
}

interface IGameLevel {
  levelId: number;
  selectedCharacter: string;
  levelConfig: LevelConfig | null;
}

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
  protected progressManager: ProgressManager;
  protected levelManager: LevelManager;

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

    // Инициализируем утилиты
    this.progressManager = ProgressManager.getInstance();
    this.levelManager = LevelManager.getInstance();
  }

  public init(data: LevelData): void {
    console.log(`🎯 Initializing level ${this.levelId}...`);
    console.log('📦 Init data received:', data);

    // Если передан ID уровня, используем его
    if (data?.levelId) {
      this.levelId = data.levelId;
      console.log(`📝 Level ID set to: ${this.levelId}`);
    }

    // Если передан выбранный персонаж, сохраняем его
    if (data?.character) {
      this.selectedCharacter = data.character;
      console.log(`👤 Character from data: ${this.selectedCharacter}`);
    } else {
      // Если персонаж не передан, пытаемся получить его из localStorage
      this.selectedCharacter = localStorage.getItem('selectedCharacter') || 'friender_s';
      console.log(`👤 Character from localStorage: ${this.selectedCharacter}`);
    }

    // Получаем конфигурацию уровня
    this.levelConfig = this.initializeLevel();
    console.log('⚙️ Level config:', this.levelConfig);

    // Сбрасываем флаг завершения уровня
    this.levelCompleted = false;

    console.log(`✅ Level ${this.levelId} initialized with character: ${this.selectedCharacter}`);
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
    console.log(`🔄 Preload called for level ${this.levelId}`);
    try {
      this.preloadLevelResources();
      console.log(`✅ Preload completed for level ${this.levelId}`);
    } catch (error) {
      console.error(`❌ Preload failed for level ${this.levelId}:`, error);
      throw error;
    }
  }

  private async preloadLevelResources(): Promise<void> {
    console.log(`📦 Starting resource loading for level ${this.levelId}...`);
    try {
      await OptimizedResourceLoader.loadLevelResourcesWithProgress(
        this,
        this.levelId,
        (progress, loaded, total) => {
          console.log(`📊 Loading progress: ${Math.round(progress)}% (${loaded}/${total})`);
        }
      );
      console.log(`✅ All resources loaded successfully for level ${this.levelId}`);
    } catch (error) {
      console.error(`❌ Error loading level resources for level ${this.levelId}:`, error);
      throw error;
    }
  }

  public create(): void {
    console.log(`🎨 Create called for level ${this.levelId}...`);

    try {
      // Запоминаем время начала уровня
      this.levelStartTime = this.time.now;
      console.log(`⏰ Level start time: ${this.levelStartTime}`);

      // Создаем игровые объекты
      console.log(`🏗️ Creating level objects...`);
      this.createLevelObjects();
      console.log(`✅ Level objects created successfully`);

      // Настраиваем подписки на события
      console.log(`📡 Setting up event listeners...`);
      this.setupEventListeners();
      console.log(`✅ Event listeners set up successfully`);

      console.log(`🎉 Level ${this.levelId} created successfully!`);
    } catch (error) {
      console.error(`❌ Error creating level ${this.levelId}:`, error);
      throw error;
    }
  }

  private createLevelObjects(): void {
    console.log(`🎵 Initializing AudioManager...`);
    this.audioManager.init(this);
    console.log(`✅ AudioManager initialized`);

    console.log(`🎨 Initializing shaders and animations...`);
    ShaderUtils.initShaders(this);
    AnimationUtils.createExplosionAnimations(this);
    console.log(`✅ Shaders and animations initialized`);

    console.log(`🖼️ Creating background...`);
    this.createBackground();
    console.log(`✅ Background created`);

    console.log(`🎵 Starting background music...`);
    this.audioManager.playMusic(`backgroundMusic_level${this.levelId}`);
    console.log(`✅ Background music started`);

    console.log(`⚙️ Initializing game state...`);
    this.initializeGameState();
    console.log(`✅ Game state initialized`);

    console.log(`🎮 Creating game entities...`);
    this.createGameEntities();
    console.log(`✅ Game entities created`);

    console.log(`🖥️ Creating UI elements...`);
    this.createUIElements();
    console.log(`✅ UI elements created`);

    console.log(`⌨️ Setting up input handlers...`);
    this.setupInputHandlers();
    console.log(`✅ Input handlers set up`);
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
      console.log('👤 Creating player...');

      const characterTexture = this.selectedCharacter || 'friender_s';
      console.log(`🎭 Creating player with texture: ${characterTexture}`);

      // Проверяем доступные текстуры
      const availableTextures = Object.keys(this.textures.list);
      console.log('🖼️ Available textures:', availableTextures);

      // Проверяем конкретно нужную текстуру
      const textureExists = this.textures.exists(characterTexture);
      console.log(`🔍 Texture '${characterTexture}' exists: ${textureExists}`);

      if (textureExists) {
        console.log('🏭 Calling CharacterFactory.createCharacter...');
        const gameCharacter = CharacterFactory.createCharacter(this, 960, 900, characterTexture);

        console.log('✅ Character created successfully:', gameCharacter);
        console.log('📊 Character stats:', gameCharacter.getStats());
        console.log('🎮 Character sprite:', gameCharacter.getSprite());

        // Проверяем, что персонаж добавлен в registry
        const registryCharacter = this.registry.get('gameCharacter');
        console.log('📝 Character in registry:', registryCharacter);

        const registrySprite = this.registry.get('playerSprite');
        console.log('🎭 Player sprite in registry:', registrySprite);

      } else {
        console.error(`❌ Character texture '${characterTexture}' not found in available textures`);
        console.log('💡 Available character textures:', availableTextures.filter(t => t.includes('friender') || t.includes('trader') || t.includes('zummer')));
        throw new Error(`Character texture '${characterTexture}' not found`);
      }
    } catch (error) {
      console.error('❌ Error creating player:', error);
      if (error instanceof Error) {
        console.error('📍 Stack trace:', error.stack);
      }
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
    console.log('🖥️ Creating UI elements...');

    // Создаем UI для счета
    this.add.text(50, 50, 'СЧЕТ:', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    });

    const scoreText = this.add.text(150, 50, '0', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#00ff00'
    });

    // Создаем UI для здоровья
    this.add.text(50, 100, 'ЗДОРОВЬЕ:', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff'
    });

    const healthText = this.add.text(200, 100, '100', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ff0000'
    });

    // Сохраняем ссылки на UI элементы в registry для обновления
    this.registry.set('scoreText', scoreText);
    this.registry.set('healthText', healthText);

    console.log('✅ UI elements created: score and health displays');
  }

  private setupInputHandlers(): void {
    console.log('⌨️ Setting up keyboard input...');

    // Создаем курсорные клавиши для управления персонажем
    const cursors = this.input.keyboard?.createCursorKeys();
    this.registry.set('cursors', cursors);

    // Создаем WASD клавиши как альтернативу
    const wasdKeys = this.input.keyboard?.addKeys('W,S,A,D');
    this.registry.set('wasdKeys', wasdKeys);

    console.log('🎮 Player controls set up: Arrow keys and WASD');

    // Обработчик клавиши паузы (P)
    this.input.keyboard?.on('keydown-P', () => {
      console.log('⏸️ Pause key pressed');
      this.togglePause();
    });

    // Обработчик клавиши меню (M)
    this.input.keyboard?.on('keydown-M', () => {
      console.log('📋 Menu key pressed');
      this.returnToMenu();
    });

    // Обработчик клавиши пробел для перехода на следующий уровень
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (this.levelCompleted) {
        console.log('🚀 Next level key pressed');
        this.hideCompletionTexts();
        this.goToNextLevel();
      }
    });

    // Обработчик клавиши R для перезапуска
    this.input.keyboard?.on('keydown-R', () => {
      if (this.registry.get('gameOver')) {
        console.log('🔄 Restart key pressed');
        this.scene.restart();
      }
    });

    console.log('✅ All input handlers set up successfully');
  }

  private setupEventListeners(): void {
    // Подписываемся на игровые события
    this.eventManager.onSceneEvent(this, 'GAME_OVER', (data) => {
      this.handleGameOver();
    });

    this.eventManager.onSceneEvent(this, 'LEVEL_COMPLETE', (data) => {
      this.handleLevelCompleted();
    });

    this.eventManager.onSceneEvent(this, 'UI_UPDATE', (data) => {
      this.updateUI(data);
    });
  }

  public update(time: number): void {
    // Логируем первые несколько вызовов update для диагностики
    if (time < this.levelStartTime + 5000) { // Первые 5 секунд
      console.log(`🔄 Update called at time: ${time}, delta: ${time - this.levelStartTime}`);
    }

    if (this.isPaused || this.registry.get('gameOver')) {
      return;
    }

    // Обрабатываем ввод игрока
    this.handlePlayerInput();

    // Обновляем персонажа
    const gameCharacter = this.registry.get('gameCharacter');
    if (gameCharacter && typeof gameCharacter.update === 'function') {
      gameCharacter.update(time, time - this.levelStartTime);
    } else if (time < this.levelStartTime + 5000) {
      console.warn('⚠️ Game character not found in registry or update method missing');
    }

    // Обновляем UI
    this.updateGameUI();

    // Обновляем спавн предметов
    this.updateItemSpawning(time);

    // Проверяем условия завершения уровня
    this.checkLevelCompletion();
  }

  private updateItemSpawning(time: number): void {
    const lastSpawnTime = this.registry.get('itemSpawnTime') || 0;
    const spawnRate = this.registry.get('itemSpawnRate') || 2000; // 2 секунды по умолчанию

    // Проверяем, пора ли создать новый предмет
    if (time - lastSpawnTime > spawnRate) {
      this.spawnRandomItem();
      this.registry.set('itemSpawnTime', time);
    }
  }

  private spawnRandomItem(): void {
    // Случайная позиция по X
    const x = Phaser.Math.Between(100, 1820);
    const y = 0; // Спавним сверху

    // Случайный тип предмета
    const itemTypes = ['goodItem', 'badItem', 'veryGoodItem'];
    const randomType = Phaser.Utils.Array.GetRandom(itemTypes);

    // Проверяем, что текстура существует
    if (this.textures.exists(randomType)) {
      // Создаем предмет
      const item = this.physics.add.sprite(x, y, randomType);
      item.setScale(0.5);
      item.setVelocityY(200); // Падает вниз

      // Добавляем данные о типе предмета
      item.setData('itemType', randomType);
      item.setData('points', this.getItemPoints(randomType));

      // Настраиваем коллизию с игроком
      const gameCharacter = this.registry.get('gameCharacter');
      if (gameCharacter && gameCharacter.getSprite()) {
        this.physics.add.overlap(gameCharacter.getSprite(), item, (player, item) => {
          this.collectItem(item as Phaser.Physics.Arcade.Sprite);
        });
      }

      // Удаляем предмет, если он упал за экран
      item.setData('destroyTimer', this.time.delayedCall(5000, () => {
        if (item.active) {
          item.destroy();
        }
      }));

      console.log(`📦 Spawned item: ${randomType} at (${x}, ${y})`);
    } else {
      console.warn(`⚠️ Item texture '${randomType}' not found`);
    }
  }

  private getItemPoints(itemType: string): number {
    switch (itemType) {
      case 'goodItem': return 10;
      case 'veryGoodItem': return 50;
      case 'badItem': return -20;
      default: return 0;
    }
  }

  private collectItem(item: Phaser.Physics.Arcade.Sprite): void {
    const itemType = item.getData('itemType');
    const points = item.getData('points');

    // Обновляем счет
    const currentScore = this.registry.get('score') || 0;
    const newScore = Math.max(0, currentScore + points);
    this.registry.set('score', newScore);

    // Обновляем здоровье для плохих предметов
    if (itemType === 'badItem') {
      const currentHealth = this.registry.get('health') || 100;
      const newHealth = Math.max(0, currentHealth - 25);
      this.registry.set('health', newHealth);

      // Проверяем game over
      if (newHealth <= 0) {
        this.registry.set('gameOver', true);
        this.eventManager.emit('GAME_OVER', { score: newScore, reason: 'health_depleted' });
      }
    } else if (itemType === 'veryGoodItem') {
      // Лечим игрока
      const currentHealth = this.registry.get('health') || 100;
      const newHealth = Math.min(100, currentHealth + 10);
      this.registry.set('health', newHealth);
    }

    // Уничтожаем предмет
    const destroyTimer = item.getData('destroyTimer');
    if (destroyTimer) {
      destroyTimer.destroy();
    }
    item.destroy();

    console.log(`✨ Collected ${itemType}: ${points} points, Score: ${newScore}`);
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
    this.progressManager.addItemCollected(1);

    // Добавляем очки, если предмет дает их
    if (points > 0) {
      this.progressManager.addScore(points);
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
      this.progressManager.recordSpeedRun(playTime);
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

    this.progressManager.recordGameEnd(false, currentScore, playTime, false);

    this.showGameOverUI();
  }

  private handleLevelCompleted(): void {
    // Записываем статистику успешного завершения
    const playTime = this.time.now - this.levelStartTime;
    const currentScore = this.registry.get('score') || 0;
    const perfectGame = this.registry.get('health') === this.registry.get('maxHealth');

    // Обновляем прогресс
    this.progressManager.recordGameEnd(true, currentScore, playTime, perfectGame);

    // Проверяем спидран
    this.progressManager.recordSpeedRun(playTime);

    // Завершаем уровень в LevelManager
    const levelCompleted = this.levelManager.completeLevel(this.levelId, currentScore);

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

  private handlePlayerInput(): void {
    const cursors = this.registry.get('cursors');
    const wasdKeys = this.registry.get('wasdKeys');
    const gameCharacter = this.registry.get('gameCharacter');

    if (!gameCharacter || !gameCharacter.getSprite()) {
      return;
    }

    const playerSprite = gameCharacter.getSprite();
    const speed = gameCharacter.getCurrentSpeed() || 200;

    // Сбрасываем скорость
    playerSprite.setVelocity(0);

    // Обработка горизонтального движения
    if (cursors?.left.isDown || wasdKeys?.A.isDown) {
      playerSprite.setVelocityX(-speed);
      // Устанавливаем состояние движения
      if (gameCharacter.getState() !== CharacterState.MOVING) {
        gameCharacter.setState(CharacterState.MOVING);
      }
    } else if (cursors?.right.isDown || wasdKeys?.D.isDown) {
      playerSprite.setVelocityX(speed);
      if (gameCharacter.getState() !== CharacterState.MOVING) {
        gameCharacter.setState(CharacterState.MOVING);
      }
    } else {
      if (gameCharacter.getState() !== CharacterState.IDLE) {
        gameCharacter.setState(CharacterState.IDLE);
      }
    }

    // Обработка вертикального движения (если нужно)
    if (cursors?.up.isDown || wasdKeys?.W.isDown) {
      playerSprite.setVelocityY(-speed);
    } else if (cursors?.down.isDown || wasdKeys?.S.isDown) {
      playerSprite.setVelocityY(speed);
    }
  }

  private updateGameUI(): void {
    const scoreText = this.registry.get('scoreText');
    const healthText = this.registry.get('healthText');
    const currentScore = this.registry.get('score') || 0;
    const currentHealth = this.registry.get('health') || 100;

    if (scoreText) {
      scoreText.setText(currentScore.toString());
    }

    if (healthText) {
      healthText.setText(currentHealth.toString());

      // Меняем цвет в зависимости от здоровья
      if (currentHealth > 70) {
        healthText.setColor('#00ff00'); // Зеленый
      } else if (currentHealth > 30) {
        healthText.setColor('#ffff00'); // Желтый
      } else {
        healthText.setColor('#ff0000'); // Красный
      }
    }
  }

  private updateUI(data: { score?: number; health?: number }): void {
    // Обновляем registry с новыми значениями
    if (data.score !== undefined) {
      this.registry.set('score', data.score);
    }

    if (data.health !== undefined) {
      this.registry.set('health', data.health);
    }

    // UI будет обновлен в updateGameUI()
  }

  private cleanup(): void {
    // Очистка ресурсов при переходе на другую сцену
    console.log('Cleaning up scene resources...');
  }

  // Абстрактные методы для переопределения в наследниках
  protected abstract getCustomLevelLogic(): void;
}
