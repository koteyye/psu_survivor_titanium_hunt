# ЭТАП 4: ИГРОВЫЕ ОБЪЕКТЫ И ПЕРСОНАЖИ

## 📋 TODO - ПЕРЕВОД ПЕРСОНАЖЕЙ НА TYPESCRIPT

### 1. BASECHARACTER → TYPESCRIPT

#### src/objects/characters/BaseCharacter.ts
```typescript
import { ICharacter, CharacterStats, CharacterSkill } from '../../types/character.types';
import { ConfigManager, AudioManager, EventManager } from '../../managers';

export abstract class BaseCharacter implements ICharacter {
  public abstract readonly id: string;
  public sprite: Phaser.Physics.Arcade.Sprite;
  public stats: CharacterStats;
  public skills: CharacterSkill[] = [];
  
  protected scene: Phaser.Scene;
  protected configManager: ConfigManager;
  protected audioManager: AudioManager;
  protected eventManager: EventManager;
  
  // Состояние персонажа
  protected currentHealth: number;
  protected isDestroyed: boolean = false;
  
  // Настройки
  protected readonly DEFAULT_SPEED = 400;
  protected readonly DEFAULT_HEALTH = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    this.scene = scene;
    this.configManager = ConfigManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.eventManager = EventManager.getInstance();
    
    this.initializeSprite(x, y, texture);
    this.loadStats();
    this.loadSounds();
    this.setupPhysics();
    
    // Сохраняем спрайт в Registry
    this.scene.registry.set('playerSprite', this.sprite);
    
    console.log(`Character sprite created: ${texture}`);
  }

  private initializeSprite(x: number, y: number, texture: string): void {
    if (!this.scene.textures.exists(texture)) {
      throw new Error(`Texture '${texture}' not found`);
    }
    
    this.sprite = this.scene.physics.add.sprite(x, y, texture);
    
    if (!this.sprite.body) {
      throw new Error('Failed to create physics body for character sprite');
    }
    
    console.log('Character physics body:', this.sprite.body);
  }

  private loadStats(): void {
    const baseStats = this.configManager.getConfig('characters/base_stat');
    const characterStats = baseStats?.[this.getConfigKey()];
    
    if (characterStats) {
      this.stats = {
        health: characterStats.health || this.DEFAULT_HEALTH,
        speed: characterStats.speed || this.DEFAULT_SPEED,
        damage: characterStats.damage || 10,
        defense: characterStats.defense || 0
      };
    } else {
      this.stats = {
        health: this.DEFAULT_HEALTH,
        speed: this.DEFAULT_SPEED,
        damage: 10,
        defense: 0
      };
      console.warn(`Stats not found for character ${this.id}, using defaults`);
    }
    
    this.currentHealth = this.stats.health;
  }

  private loadSounds(): void {
    try {
      const sounds = ['collect', 'hit', 'special'];
      sounds.forEach(soundType => {
        const soundKey = `gameplay/replicas/${this.id}/${soundType}`;
        if (this.scene.cache.audio.exists(soundKey)) {
          this.audioManager.addSound(`${this.id}_${soundType}`, soundKey, { volume: 0.7 });
        }
      });
      
      console.log(`Sounds for character ${this.id} loaded successfully`);
    } catch (error) {
      console.error(`Error loading sounds for character ${this.id}:`, error);
    }
  }

  private setupPhysics(): void {
    const config = this.configManager.getValue('core', 'player', {});
    
    const collisionSize = config.collisionSize || { width: 120, height: 180 };
    const displaySize = config.displaySize || { width: 200, height: 300 };
    
    // Настройка физического тела
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setBounce(0.2);
    this.sprite.setDragX(300);
    
    // Настройка размеров
    this.sprite.setSize(collisionSize.width, collisionSize.height);
    this.sprite.setDisplaySize(displaySize.width, displaySize.height);
    
    // Отключаем гравитацию по Y для игрока
    this.sprite.body.setGravityY(-200);
  }

  // Абстрактные методы для переопределения в наследниках
  protected abstract getConfigKey(): string;
  protected abstract getSpecialAbilityConfig(): any;

  // Общие методы для всех персонажей
  public collectGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    this.playSound('collect');
    this.createExplosion(item.x, item.y, 'good_explode');
    this.addScore(this.configManager.getValue('core', 'items.good.points', 10));
    this.returnItemToPool(item, 'goodItems');
  }

  public collectVeryGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    this.playSound('collect');
    this.createExplosion(item.x, item.y, 'super_explode');
    
    const points = this.configManager.getValue('core', 'items.veryGood.points', 20);
    const healthBonus = this.configManager.getValue('core', 'items.veryGood.healthBonus', 10);
    
    this.addScore(points);
    this.addHealth(healthBonus);
    this.returnItemToPool(item, 'veryGoodItems');
  }

  public hitBadItem(item: Phaser.Physics.Arcade.Sprite): void {
    this.playSound('hit');
    this.createExplosion(item.x, item.y, 'money_explode');
    
    const damage = this.configManager.getValue('core', 'items.bad.damage', 20);
    this.takeDamage(damage);
    this.returnItemToPool(item, 'badItems');
  }

  protected addScore(points: number): void {
    const currentScore = this.scene.registry.get('score') || 0;
    this.scene.registry.set('score', currentScore + points);
    
    this.eventManager.emit('UI_UPDATE', {
      score: currentScore + points,
      health: this.currentHealth
    });
  }

  protected addHealth(amount: number): void {
    this.currentHealth = Math.min(this.stats.health, this.currentHealth + amount);
    this.scene.registry.set('health', this.currentHealth);
    
    this.eventManager.emit('UI_UPDATE', {
      score: this.scene.registry.get('score'),
      health: this.currentHealth
    });
  }

  protected takeDamage(damage: number): void {
    const actualDamage = Math.max(1, damage - this.stats.defense);
    this.currentHealth = Math.max(0, this.currentHealth - actualDamage);
    this.scene.registry.set('health', this.currentHealth);
    
    // Эффект получения урона
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      if (!this.isDestroyed) {
        this.sprite.clearTint();
      }
    });
    
    this.eventManager.emit('UI_UPDATE', {
      score: this.scene.registry.get('score'),
      health: this.currentHealth
    });
    
    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  protected die(): void {
    this.scene.registry.set('gameOver', true);
    this.eventManager.emit('GAME_OVER');
  }

  protected playSound(soundType: string): void {
    const soundKey = `${this.id}_${soundType}`;
    this.audioManager.playSound(soundKey);
  }

  protected createExplosion(x: number, y: number, animationKey: string = 'explode'): void {
    console.log(`Creating explosion at position: ${x}, ${y}`);
    
    try {
      const explosion = this.scene.add.sprite(x, y, 'explosion');
      console.log('Explosion object created:', explosion);
      
      if (!explosion) {
        console.error('Failed to create explosion sprite');
        return;
      }
      
      explosion.setScale(2);
      
      // Проверяем наличие анимации
      if (this.scene.anims.exists(animationKey)) {
        console.log(`Animation ${animationKey} found, playing...`);
        
        try {
          explosion.play(animationKey);
          console.log(`Animation ${animationKey} started`);
          
          explosion.on('animationcomplete', () => {
            console.log('Explosion animation completed');
            explosion.destroy();
          });
        } catch (error) {
          console.error('Error playing explosion animation:', error);
          explosion.destroy();
        }
      } else {
        console.warn(`Animation ${animationKey} not found, using timed destruction`);
        this.scene.time.delayedCall(500, () => explosion.destroy());
      }
    } catch (error) {
      console.error('Error creating explosion:', error);
    }
  }

  protected returnItemToPool(item: Phaser.Physics.Arcade.Sprite, poolKey: string): void {
    const objectPoolManager = this.scene.registry.get('objectPoolManager');
    if (objectPoolManager) {
      objectPoolManager.returnToPool(poolKey, item);
    }
  }

  public update(time: number): void {
    // Базовая логика обновления - переопределяется в наследниках
    this.updateMovement();
  }

  protected updateMovement(): void {
    const cursors = this.scene.registry.get('cursors');
    if (!cursors) return;
    
    const speed = this.stats.speed;
    
    if (cursors.left.isDown) {
      this.sprite.setVelocityX(-speed);
    } else if (cursors.right.isDown) {
      this.sprite.setVelocityX(speed);
    } else {
      this.sprite.setVelocityX(0);
    }
    
    if (cursors.up.isDown) {
      this.sprite.setVelocityY(-speed);
    } else if (cursors.down.isDown) {
      this.sprite.setVelocityY(speed);
    } else {
      this.sprite.setVelocityY(0);
    }
  }

  public getCurrentHealth(): number {
    return this.currentHealth;
  }

  public getMaxHealth(): number {
    return this.stats.health;
  }

  public getHealthPercentage(): number {
    return this.currentHealth / this.stats.health;
  }

  public resetHealth(): void {
    this.currentHealth = this.stats.health;
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    if (this.sprite && this.sprite.active) {
      this.sprite.destroy();
    }
    
    console.log(`Character ${this.id} destroyed`);
  }
}
```

### 2. CHARACTERFACTORY → TYPESCRIPT

#### src/objects/characters/CharacterFactory.ts
```typescript
import { ICharacter } from '../../types/character.types';
import { ConfigManager, EventManager } from '../../managers';
import { FrienderCharacter } from './FrienderCharacter';
import { TraderCharacter } from './TraderCharacter';
import { ZummerCharacter } from './ZummerCharacter';

export class CharacterFactory {
  private static configManager = ConfigManager.getInstance();
  private static eventManager = EventManager.getInstance();

  public static createCharacter(
    scene: Phaser.Scene,
    x: number,
    y: number,
    characterId: string
  ): ICharacter {
    console.log(`Creating character with ID: ${characterId}`);
    
    const characterInfo = this.configManager.getConfig('characters/info');
    
    if (!characterInfo) {
      throw new Error('Character info config not loaded');
    }
    
    // Находим тип персонажа по ID
    let characterType: string | null = null;
    for (const [type, info] of Object.entries(characterInfo)) {
      if ((info as any).id === characterId) {
        characterType = type;
        break;
      }
    }
    
    if (!characterType) {
      console.warn(`Unknown character ID: ${characterId}, using friender as default`);
      characterType = 'friender';
    }
    
    let character: ICharacter;
    
    switch (characterType) {
      case 'friender':
        character = new FrienderCharacter(scene, x, y);
        break;
      case 'trader':
        character = new TraderCharacter(scene, x, y);
        break;
      case 'zummer':
        character = new ZummerCharacter(scene, x, y);
        break;
      default:
        console.warn(`Unknown character type: ${characterType}, using friender as default`);
        character = new FrienderCharacter(scene, x, y);
    }
    
    // Сохраняем персонажа в Registry
    scene.registry.set('gameCharacter', character);
    
    // Глобальный доступ для совместимости (временно)
    (window as any).gameCharacter = character;
    
    // Уведомляем о создании персонажа
    this.eventManager.emit('CHARACTER_CREATED', { characterId, character });
    
    return character;
  }

  public static getAvailableCharacters(): Array<{
    id: string;
    name: string;
    texture: string;
    description: string;
    stats: any;
  }> {
    const baseStats = this.configManager.getConfig('characters/base_stat');
    const characterInfo = this.configManager.getConfig('characters/info');
    
    if (!baseStats || !characterInfo) {
      console.error('Character configs not loaded');
      return [];
    }
    
    const characters: Array<{
      id: string;
      name: string;
      texture: string;
      description: string;
      stats: any;
    }> = [];
    
    Object.keys(baseStats).forEach(key => {
      if (characterInfo[key]) {
        characters.push({
          id: characterInfo[key].id,
          name: characterInfo[key].name,
          texture: characterInfo[key].texture,
          description: characterInfo[key].description,
          stats: baseStats[key]
        });
      }
    });
    
    return characters;
  }

  public static validateCharacterId(characterId: string): boolean {
    const characterInfo = this.configManager.getConfig('characters/info');
    if (!characterInfo) return false;
    
    return Object.values(characterInfo).some((info: any) => info.id === characterId);
  }

  public static getCharacterInfo(characterId: string): any {
    const characterInfo = this.configManager.getConfig('characters/info');
    if (!characterInfo) return null;
    
    for (const [type, info] of Object.entries(characterInfo)) {
      if ((info as any).id === characterId) {
        return info;
      }
    }
    
    return null;
  }
}
```

### 3. FRIENDERCHARACTER → TYPESCRIPT

#### src/objects/characters/FrienderCharacter.ts
```typescript
import { BaseCharacter } from './BaseCharacter';

export class FrienderCharacter extends BaseCharacter {
  public readonly id = 'friender_s';
  
  // Специфичные для Friender свойства
  private comboCount: number = 0;
  private comboTimeout?: Phaser.Time.TimerEvent;
  private readonly MAX_COMBO = 5;
  private readonly COMBO_DURATION = 3000; // 3 секунды

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'friender_s');
    this.setupSpecialAbilities();
  }

  protected getConfigKey(): string {
    return 'friender';
  }

  protected getSpecialAbilityConfig(): any {
    return this.configManager.getConfig('characters/skills/friender');
  }

  private setupSpecialAbilities(): void {
    // Настройка специальных способностей Friender
    const skillConfig = this.getSpecialAbilityConfig();
    if (skillConfig) {
      this.skills = Object.values(skillConfig).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        cooldown: skill.cooldown || 0,
        cost: skill.cost || 0
      }));
    }
  }

  public collectGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    super.collectGoodItem(item);
    this.incrementCombo();
  }

  public collectVeryGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    super.collectVeryGoodItem(item);
    this.incrementCombo();
    
    // Дополнительный бонус для супер предметов
    this.addScore(this.comboCount * 5);
  }

  public hitBadItem(item: Phaser.Physics.Arcade.Sprite): void {
    super.hitBadItem(item);
    this.resetCombo();
  }

  private incrementCombo(): void {
    this.comboCount = Math.min(this.MAX_COMBO, this.comboCount + 1);
    
    // Сбрасываем таймер комбо
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
    }
    
    this.comboTimeout = this.scene.time.delayedCall(this.COMBO_DURATION, () => {
      this.resetCombo();
    });
    
    // Уведомляем о комбо
    this.eventManager.emit('COMBO_UPDATE', {
      count: this.comboCount,
      multiplier: this.getComboMultiplier()
    });
    
    // Звуковой эффект комбо
    if (this.comboCount >= 3) {
      this.playSound('special');
    }
  }

  public resetCombo(): void {
    this.comboCount = 0;
    
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
      this.comboTimeout = undefined;
    }
    
    this.eventManager.emit('COMBO_UPDATE', {
      count: 0,
      multiplier: 1
    });
  }

  private getComboMultiplier(): number {
    return 1 + (this.comboCount * 0.2);
  }

  protected addScore(points: number): void {
    const multiplier = this.getComboMultiplier();
    const bonusPoints = Math.floor(points * multiplier);
    super.addScore(bonusPoints);
  }

  public update(time: number): void {
    super.update(time);
    
    // Специфичная логика обновления для Friender
    this.updateComboVisuals();
  }

  private updateComboVisuals(): void {
    if (this.comboCount > 0) {
      // Эффект свечения при комбо
      const glowIntensity = 0.3 + (this.comboCount * 0.1);
      this.sprite.setTint(Phaser.Display.Color.GetColor(255, 255 - this.comboCount * 30, 0));
      
      // Убираем тинт через время
      this.scene.time.delayedCall(100, () => {
        if (!this.isDestroyed) {
          this.sprite.clearTint();
        }
      });
    }
  }

  public getComboCount(): number {
    return this.comboCount;
  }

  public getComboTimeLeft(): number {
    return this.comboTimeout ? this.comboTimeout.getRemaining() : 0;
  }

  public destroy(): void {
    if (this.comboTimeout) {
      this.comboTimeout.destroy();
    }
    super.destroy();
  }
}
```

### 4. TRADERCHARACTER → TYPESCRIPT

#### src/objects/characters/TraderCharacter.ts
```typescript
import { BaseCharacter } from './BaseCharacter';

interface TraderItem {
  type: 'good' | 'bad' | 'veryGood';
  value: number;
  timestamp: number;
}

export class TraderCharacter extends BaseCharacter {
  public readonly id = 'trader';
  
  // Специфичные для Trader свойства
  private basket: TraderItem[] = [];
  private money: number = 0;
  private readonly MAX_BASKET_SIZE = 10;
  private sellCooldown: number = 0;
  private readonly SELL_COOLDOWN_TIME = 2000; // 2 секунды

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'trader');
    this.setupSpecialAbilities();
    this.setupUI();
  }

  protected getConfigKey(): string {
    return 'trader';
  }

  protected getSpecialAbilityConfig(): any {
    return this.configManager.getConfig('characters/skills/trader');
  }

  private setupSpecialAbilities(): void {
    const skillConfig = this.getSpecialAbilityConfig();
    if (skillConfig) {
      this.skills = Object.values(skillConfig).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        cooldown: skill.cooldown || 0,
        cost: skill.cost || 0
      }));
    }
  }

  private setupUI(): void {
    // Настройка UI для трейдера (корзина, деньги, график)
    this.eventManager.emit('TRADER_UI_INIT', {
      basket: this.basket,
      money: this.money
    });
  }

  public collectGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    if (this.basket.length < this.MAX_BASKET_SIZE) {
      this.addToBasket('good', this.configManager.getValue('core', 'items.good.points', 10));
      this.createExplosion(item.x, item.y, 'good_explode');
      this.returnItemToPool(item, 'goodItems');
      this.playSound('collect');
    } else {
      // Корзина полна, получаем очки как обычно
      super.collectGoodItem(item);
    }
  }

  public collectVeryGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    if (this.basket.length < this.MAX_BASKET_SIZE) {
      this.addToBasket('veryGood', this.configManager.getValue('core', 'items.veryGood.points', 20));
      this.createExplosion(item.x, item.y, 'super_explode');
      this.returnItemToPool(item, 'veryGoodItems');
      this.playSound('collect');
    } else {
      super.collectVeryGoodItem(item);
    }
  }

  public hitBadItem(item: Phaser.Physics.Arcade.Sprite): void {
    // Трейдер теряет деньги вместо здоровья от плохих предметов
    const moneyLoss = this.configManager.getValue('core', 'items.bad.damage', 20);
    this.money = Math.max(0, this.money - moneyLoss);
    
    this.createExplosion(item.x, item.y, 'money_explode');
    this.returnItemToPool(item, 'badItems');
    this.playSound('hit');
    
    this.updateUI();
  }

  private addToBasket(type: 'good' | 'bad' | 'veryGood', value: number): void {
    const item: TraderItem = {
      type,
      value,
      timestamp: Date.now()
    };
    
    this.basket.push(item);
    this.updateUI();
  }

  public sellBasket(): boolean {
    console.log('sellBasket called!');
    
    if (this.sellCooldown > 0) {
      console.log('Cooldown active:', this.sellCooldown);
      return false;
    }
    
    if (this.basket.length === 0) {
      console.log('Basket is empty:', this.basket);
      return false;
    }
    
    // Проверяем график (упрощенная версия)
    console.log('Checking graph...');
    const marketMultiplier = this.getMarketMultiplier();
    
    let totalValue = 0;
    this.basket.forEach(item => {
      totalValue += Math.floor(item.value * marketMultiplier);
    });
    
    this.money += totalValue;
    this.addScore(totalValue);
    
    // Очищаем корзину
    this.basket = [];
    
    // Устанавливаем кулдаун
    this.sellCooldown = this.SELL_COOLDOWN_TIME;
    
    this.updateUI();
    this.playSound('special');
    
    return true;
  }

  private getMarketMultiplier(): number {
    // Упрощенная система рыночных колебаний
    const time = Date.now();
    const cycleTime = 10000; // 10 секунд цикл
    const phase = (time % cycleTime) / cycleTime;
    
    // Колебания от 0.5 до 1.5
    return 0.5 + Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
  }

  private updateUI(): void {
    this.eventManager.emit('TRADER_UI_UPDATE', {
      basket: this.basket,
      money: this.money,
      marketMultiplier: this.getMarketMultiplier(),
      sellCooldown: this.sellCooldown
    });
  }

  public update(time: number): void {
    super.update(time);
    
    // Обновляем кулдаун продажи
    if (this.sellCooldown > 0) {
      this.sellCooldown = Math.max(0, this.sellCooldown - this.scene.game.loop.delta);
    }
    
    // Обновляем UI
    this.updateUI();
    
    // Проверяем нажатие клавиши продажи
    this.checkSellInput();
  }

  private checkSellInput(): void {
    const spaceKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    if (spaceKey?.isDown) {
      this.sellBasket();
    }
  }

  public getBasket(): TraderItem[] {
    return [...this.basket];
  }

  public getMoney(): number {
    return this.money;
  }

  public getBasketValue(): number {
    return this.basket.reduce((sum, item) => sum + item.value, 0);
  }

  public isBasketFull(): boolean {
    return this.basket.length >= this.MAX_BASKET_SIZE;
  }

  public destroy(): void {
    this.eventManager.emit('TRADER_UI_DESTROY');
    super.destroy();
  }
}
```

### 5. ZUMMERCHARACTER → TYPESCRIPT

#### src/objects/characters/ZummerCharacter.ts
```typescript
import { BaseCharacter } from './BaseCharacter';

export class ZummerCharacter extends BaseCharacter {
  public readonly id = 'zummer';
  
  // Специфичные для Zummer свойства
  private rage: number = 0;
  private maxRage: number = 100;
  private rageMode: boolean = false;
  private rageTimer: number = 0;
  private readonly RAGE_MODE_DURATION = 5000; // 5 секунд
  private readonly RAGE_SPEED_MULTIPLIER = 1.5;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'zummer');
    this.setupSpecialAbilities();
  }

  protected getConfigKey(): string {
    return 'zummer';
  }

  protected getSpecialAbilityConfig(): any {
    return this.configManager.getConfig('characters/skills/zoomer'); // Обратите внимание на 'zoomer'
  }

  private setupSpecialAbilities(): void {
    const skillConfig = this.getSpecialAbilityConfig();
    if (skillConfig) {
      this.skills = Object.values(skillConfig).map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        cooldown: skill.cooldown || 0,
        cost: skill.cost || 0
      }));
    }
  }

  public collectGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    super.collectGoodItem(item);
    this.addRage(10);
  }

  public collectVeryGoodItem(item: Phaser.Physics.Arcade.Sprite): void {
    super.collectVeryGoodItem(item);
    this.addRage(20);
  }

  public hitBadItem(item: Phaser.Physics.Arcade.Sprite): void {
    if (this.rageMode) {
      // В режиме ярости Zummer получает меньше урона
      const reducedDamage = Math.floor(this.configManager.getValue('core', 'items.bad.damage', 20) * 0.5);
      this.takeDamage(reducedDamage);
    } else {
      super.hitBadItem(item);
    }
    
    this.addRage(30); // Получение урона добавляет ярость
  }

  private addRage(amount: number): void {
    this.rage = Math.min(this.maxRage, this.rage + amount);
    
    if (this.rage >= this.maxRage && !this.rageMode) {
      this.activateRageMode();
    }
    
    this.updateRageUI();
  }

  private activateRageMode(): void {
    this.rageMode = true;
    this.rageTimer = this.RAGE_MODE_DURATION;
    
    // Визуальные эффекты
    this.sprite.setTint(0xff0000);
    
    // Увеличиваем скорость
    this.stats.speed = Math.floor(this.stats.speed * this.RAGE_SPEED_MULTIPLIER);
    
    this.playSound('special');
    this.eventManager.emit('RAGE_MODE_ACTIVATED');
    
    console.log('Zummer rage mode activated!');
  }

  private deactivateRageMode(): void {
    this.rageMode = false;
    this.rage = 0;
    this.rageTimer = 0;
    
    // Убираем визуальные эффекты
    this.sprite.clearTint();
    
    // Восстанавливаем скорость
    this.stats.speed = Math.floor(this.stats.speed / this.RAGE_SPEED_MULTIPLIER);
    
    this.updateRageUI();
    this.eventManager.emit('RAGE_MODE_DEACTIVATED');
    
    console.log('Zummer rage mode deactivated');
  }

  private updateRageUI(): void {
    this.eventManager.emit('RAGE_UI_UPDATE', {
      rage: this.rage,
      maxRage: this.maxRage,
      rageMode: this.rageMode,
      rageTimer: this.rageTimer
    });
  }

  protected takeDamage(damage: number): void {
    // Zummer не может восстанавливать здоровье, но имеет дополнительную защиту в режиме ярости
    const actualDamage = this.rageMode ? Math.floor(damage * 0.5) : damage;
    
    super.takeDamage(actualDamage);
    
    if (this.currentHealth <= 0) {
      console.log('Zummer character cannot restore health');
    }
  }

  public update(time: number): void {
    super.update(time);
    
    // Обновляем таймер режима ярости
    if (this.rageMode && this.rageTimer > 0) {
      this.rageTimer -= this.scene.game.loop.delta;
      
      if (this.rageTimer <= 0) {
        this.deactivateRageMode();
      }
    }
    
    // Постепенно уменьшаем ярость если не в режиме ярости
    if (!this.rageMode && this.rage > 0) {
      this.rage = Math.max(0, this.rage - 0.5);
      this.updateRageUI();
    }
  }

  protected updateMovement(): void {
    super.updateMovement();
    
    // Дополнительные эффекты движения в режиме ярости
    if (this.rageMode) {
      // Создаем эффект следа
      this.createRageTrail();
    }
  }

  private createRageTrail(): void {
    // Простой эффект следа
    const trail = this.scene.add.circle(this.sprite.x, this.sprite.y, 10, 0xff0000, 0.3);
    
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scaleX: 0,
      scaleY: 0,
      duration: 200,
      onComplete: () => trail.destroy()
    });
  }

  public getRage(): number {
    return this.rage;
  }

  public getMaxRage(): number {
    return this.maxRage;
  }

  public isInRageMode(): boolean {
    return this.rageMode;
  }

  public getRageTimeLeft(): number {
    return this.rageTimer;
  }

  public forceRageMode(): void {
    this.rage = this.maxRage;
    this.activateRageMode();
  }

  public resetRage(): void {
    if (this.rageMode) {
      this.deactivateRageMode();
    } else {
      this.rage = 0;
      this.updateRageUI();
    }
  }

  public destroy(): void {
    if (this.rageMode) {
      this.deactivateRageMode();
    }
    super.destroy();
  }
}
```

### 6. ОБНОВИТЬ INDEX.TS

#### src/objects/characters/index.ts
```typescript
export { BaseCharacter } from './BaseCharacter';
export { CharacterFactory } from './CharacterFactory';
export { FrienderCharacter } from './FrienderCharacter';
export { TraderCharacter } from './TraderCharacter';
export { ZummerCharacter } from './ZummerCharacter';

export type { ICharacter, CharacterStats, CharacterSkill } from '../../types/character.types';
```

---

## 🔧 ПРОБЛЕМЫ ИСПРАВЛЕННЫЕ

### 1. ДУБЛИРОВАНИЕ КОДА В ПЕРСОНАЖАХ
- ✅ Базовый класс BaseCharacter
- ✅ Общая логика в базовом классе
- ✅ Специфичные особенности в наследниках

### 2. ОТСУТСТВИЕ ТИПИЗАЦИИ
- ✅ Строгая типизация всех свойств
- ✅ Интерфейсы для персонажей
- ✅ Типобезопасные методы

### 3. НЕПРАВИЛЬНОЕ ИСПОЛЬЗОВАНИЕ ГЛОБАЛЬНЫХ ПЕРЕМЕННЫХ
- ✅ Использование Registry вместо window
- ✅ Правильное управление состоянием
- ✅ Event-driven архитектура

### 4. ОТСУТСТВИЕ ОБРАБОТКИ ОШИБОК
- ✅ Валидация параметров
- ✅ Проверка существования ресурсов
- ✅ Безопасное уничтожение

---

## ✅ CHECKLIST

- [ ] Создать BaseCharacter.ts
- [ ] Создать CharacterFactory.ts
- [ ] Создать FrienderCharacter.ts
- [ ] Создать TraderCharacter.ts
- [ ] Создать ZummerCharacter.ts
- [ ] Обновить characters/index.ts
- [ ] Добавить тесты для персонажей
- [ ] Протестировать все способности
- [ ] Обновить импорты в сценах
- [ ] Добавить JSDoc комментарии

---

## 🎯 РЕЗУЛЬТАТ ЭТАПА

После завершения этого этапа:
- ✅ Все персонажи типизированы
- ✅ Единая архитектура персонажей
- ✅ Устранено дублирование кода
- ✅ Улучшена производительность
- ✅ Добавлена обработка ошибок

**Время выполнения**: 3-4 дня
