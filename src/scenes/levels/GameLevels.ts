import { GameLevelScene } from '../base/GameLevelScene';

/**
 * Главная сцена (первый уровень)
 */
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
    // Настройки для первого уровня
    this.registry.set('itemSpawnRate', 1500); // Частота появления предметов (мс)
    this.registry.set('itemSpeed', 200); // Скорость падения предметов
    this.registry.set('difficultyMultiplier', 1.0); // Множитель сложности
    
    console.log('MainScene: Custom level logic initialized for Level 1');
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
    
    // Добавляем специфичную для первого уровня логику
    this.setupLevel1Physics();
    this.setupLevel1Items();
  }

  private setupLevel1Physics(): void {
    // Настройки физики для первого уровня
    this.physics.world.gravity.y = 300;
    this.physics.world.setBounds(0, 0, 1920, 1080);
  }

  private setupLevel1Items(): void {
    // Настройки предметов для первого уровня
    const itemConfig = {
      goodItemChance: 0.6, // 60% хороших предметов
      badItemChance: 0.3,  // 30% плохих предметов
      veryGoodItemChance: 0.1 // 10% очень хороших предметов
    };
    
    this.registry.set('itemConfig', itemConfig);
  }

  public update(time: number): void {
    super.update(time);
    
    // Специфичная логика обновления для первого уровня
    this.updateLevel1Difficulty(time);
  }

  private updateLevel1Difficulty(time: number): void {
    // Постепенно увеличиваем сложность
    const elapsedTime = time - this.levelStartTime;
    const difficultyIncrease = Math.floor(elapsedTime / 30000); // Каждые 30 секунд
    
    if (difficultyIncrease > 0) {
      const newSpawnRate = Math.max(800, 1500 - (difficultyIncrease * 100));
      this.registry.set('itemSpawnRate', newSpawnRate);
    }
  }
}

/**
 * Вторая сцена (второй уровень)
 */
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
    // Настройки для второго уровня - увеличенная сложность
    this.registry.set('itemSpawnRate', 1200); // Быстрее появление предметов
    this.registry.set('itemSpeed', 250); // Быстрее падение
    this.registry.set('difficultyMultiplier', 1.3); // Больший множитель сложности
    
    console.log('Level2Scene: Custom level logic initialized for Level 2');
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
    
    // Добавляем специфичную для второго уровня логику
    this.setupLevel2Physics();
    this.setupLevel2Items();
  }

  private setupLevel2Physics(): void {
    // Увеличенная гравитация для второго уровня
    this.physics.world.gravity.y = 350;
    this.physics.world.setBounds(0, 0, 1920, 1080);
  }

  private setupLevel2Items(): void {
    // Более сложное распределение предметов
    const itemConfig = {
      goodItemChance: 0.5,  // 50% хороших предметов
      badItemChance: 0.4,   // 40% плохих предметов
      veryGoodItemChance: 0.1 // 10% очень хороших предметов
    };
    
    this.registry.set('itemConfig', itemConfig);
  }

  public update(time: number): void {
    super.update(time);
    
    // Специфичная логика обновления для второго уровня
    this.updateLevel2Difficulty(time);
  }

  private updateLevel2Difficulty(time: number): void {
    // Быстрое увеличение сложности
    const elapsedTime = time - this.levelStartTime;
    const difficultyIncrease = Math.floor(elapsedTime / 25000); // Каждые 25 секунд
    
    if (difficultyIncrease > 0) {
      const newSpawnRate = Math.max(600, 1200 - (difficultyIncrease * 120));
      this.registry.set('itemSpawnRate', newSpawnRate);
      
      // Также увеличиваем скорость падения
      const newItemSpeed = Math.min(400, 250 + (difficultyIncrease * 20));
      this.registry.set('itemSpeed', newItemSpeed);
    }
  }
}

/**
 * Третья сцена (третий уровень)
 */
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
    // Настройки для третьего уровня - максимальная сложность
    this.registry.set('itemSpawnRate', 1000); // Очень быстрое появление предметов
    this.registry.set('itemSpeed', 300); // Очень быстрое падение
    this.registry.set('difficultyMultiplier', 1.5); // Максимальный множитель сложности
    
    console.log('Level3Scene: Custom level logic initialized for Level 3');
  }

  public create(): void {
    super.create();
    this.getCustomLevelLogic();
    
    // Добавляем специфичную для третьего уровня логику
    this.setupLevel3Physics();
    this.setupLevel3Items();
    this.setupLevel3SpecialMechanics();
  }

  private setupLevel3Physics(): void {
    // Максимальная гравитация для третьего уровня
    this.physics.world.gravity.y = 400;
    this.physics.world.setBounds(0, 0, 1920, 1080);
  }

  private setupLevel3Items(): void {
    // Самое сложное распределение предметов
    const itemConfig = {
      goodItemChance: 0.4,  // 40% хороших предметов
      badItemChance: 0.5,   // 50% плохих предметов
      veryGoodItemChance: 0.1 // 10% очень хороших предметов
    };
    
    this.registry.set('itemConfig', itemConfig);
  }

  private setupLevel3SpecialMechanics(): void {
    // Специальные механики для финального уровня
    this.registry.set('hasSpecialItems', true); // Включаем специальные предметы
    this.registry.set('bossMode', false); // Изначально нет босс-режима
    
    // Запускаем проверку на активацию босс-режима
    this.time.addEvent({
      delay: 60000, // Через минуту игры
      callback: this.activateBossMode,
      callbackScope: this
    });
  }

  private activateBossMode(): void {
    console.log('Level3Scene: Activating boss mode!');
    this.registry.set('bossMode', true);
    this.registry.set('itemSpawnRate', 800); // Еще быстрее
    this.registry.set('itemSpeed', 350); // Еще быстрее падение
    
    // Показываем уведомление о босс-режиме
    const bossWarning = this.add.text(960, 200, 'БОСС РЕЖИМ АКТИВИРОВАН!', {
      fontSize: '48px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);
    
    // Убираем уведомление через 3 секунды
    this.tweens.add({
      targets: bossWarning,
      alpha: 0,
      duration: 3000,
      onComplete: () => {
        bossWarning.destroy();
      }
    });
  }

  public update(time: number): void {
    super.update(time);
    
    // Специфичная логика обновления для третьего уровня
    this.updateLevel3Difficulty(time);
  }

  private updateLevel3Difficulty(time: number): void {
    // Экстремальное увеличение сложности
    const elapsedTime = time - this.levelStartTime;
    const difficultyIncrease = Math.floor(elapsedTime / 20000); // Каждые 20 секунд
    
    if (difficultyIncrease > 0) {
      const isBossMode = this.registry.get('bossMode');
      const baseSpawnRate = isBossMode ? 800 : 1000;
      const baseSpeed = isBossMode ? 350 : 300;
      
      const newSpawnRate = Math.max(500, baseSpawnRate - (difficultyIncrease * 100));
      this.registry.set('itemSpawnRate', newSpawnRate);
      
      const newItemSpeed = Math.min(500, baseSpeed + (difficultyIncrease * 25));
      this.registry.set('itemSpeed', newItemSpeed);
    }
  }

  public goToNextLevel(): void {
    // На третьем уровне нет следующего уровня, возвращаемся в меню
    this.showVictoryScreen();
  }

  private showVictoryScreen(): void {
    // Показываем экран победы
    const victoryText = this.add.text(960, 400, 'ПОЗДРАВЛЯЕМ!', {
      fontSize: '64px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#gold',
      align: 'center'
    }).setOrigin(0.5);
    
    const completionText = this.add.text(960, 500, 'ВЫ ПРОШЛИ ВСЕ УРОВНИ!', {
      fontSize: '32px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    const menuText = this.add.text(960, 600, 'Нажмите M для возврата в меню', {
      fontSize: '24px',
      fontFamily: 'Orbitron, sans-serif',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Автоматический возврат в меню через 10 секунд
    this.time.delayedCall(10000, () => {
      this.returnToMenu();
    });
  }
}
