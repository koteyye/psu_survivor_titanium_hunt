import { BaseCharacter } from './BaseCharacter';

// Temporary types until we create proper type files
interface Position {
  x: number;
  y: number;
}

interface CharacterSkill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  cooldown: number;
  currentCooldown: number;
  unlocked: boolean;
  damage?: number;
  duration?: number;
  range?: number;
  cost?: number;
}

interface GameCharacterConfig {
  id: string;
  type: any;
  spriteKey: string;
  baseStats: any;
  skills: CharacterSkill[];
  scale?: number;
  colliderRadius?: number;
  animations: any;
}

interface TraderItem {
  type: 'good' | 'bad' | 'veryGood';
  value: number;
  timestamp: number;
}

/**
 * Персонаж Trader - специализируется на торговле и накоплении ресурсов
 */
export class TraderCharacter extends BaseCharacter {
  // Специфичные для Trader свойства
  private basket: TraderItem[] = [];
  private money: number = 0;
  private readonly MAX_BASKET_SIZE = 10;
  private sellCooldown: number = 0;
  private readonly SELL_COOLDOWN_TIME = 2000; // 2 секунды

  constructor(scene: Phaser.Scene, x: number, y: number, config: GameCharacterConfig) {
    super(scene, x, y, config);
  }

  protected initializeCharacter(): void {
    console.log(`Trader character ${this.characterId} initialized`);
    this.setupUI();
  }

  protected customUpdate(time: number, delta: number): void {
    // Обновляем кулдаун продажи
    if (this.sellCooldown > 0) {
      this.sellCooldown = Math.max(0, this.sellCooldown - delta);
    }
    
    // Обновляем UI
    this.updateUI();
    
    // Проверяем нажатие клавиши продажи
    this.checkSellInput();
  }

  protected executeSkill(skill: CharacterSkill, _target?: Position | any): boolean {
    console.log(`Trader uses skill: ${skill.name}`);
    
    switch (skill.id) {
      case 'market_analysis':
        return this.useMarketAnalysisSkill();
      case 'bulk_sell':
        return this.useBulkSellSkill();
      default:
        return true;
    }
  }

  protected applySkillUpgrade(skill: CharacterSkill): void {
    // Улучшение способности
    switch (skill.id) {
      case 'market_analysis':
        // Увеличиваем время действия анализа рынка
        if (skill.duration) {
          skill.duration = Math.floor(skill.duration * 1.2);
        }
        break;
      case 'bulk_sell':
        // Уменьшаем кулдаун массовой продажи
        skill.cooldown = Math.floor(skill.cooldown * 0.9);
        break;
    }
  }

  protected getSkillUnlockLevel(skillId: string): number {
    switch (skillId) {
      case 'market_analysis': return 1;
      case 'bulk_sell': return 3;
      case 'trader_luck': return 5;
      default: return 1;
    }
  }

  protected onDeath(): void {
    console.log('Trader has died');
    this.eventManager.emit('UI_UPDATE', { trader_dead: true });
  }

  public attack(_target: any): boolean {
    console.log('Trader attacks with money!');
    return true;
  }

  public canAttack(_target: any): boolean {
    return this.isAlive() && this.money > 0;
  }

  // Торговая система
  private setupUI(): void {
    this.updateUI();
  }

  private updateUI(): void {
    this.eventManager.emit('UI_UPDATE', {
      basket: this.basket.length,
      money: this.money,
      marketMultiplier: this.getMarketMultiplier(),
      sellCooldown: this.sellCooldown
    });
  }

  public addToBasket(type: 'good' | 'bad' | 'veryGood', value: number): boolean {
    if (this.basket.length >= this.MAX_BASKET_SIZE) {
      return false;
    }

    const item: TraderItem = {
      type,
      value,
      timestamp: Date.now()
    };
    
    this.basket.push(item);
    this.updateUI();
    return true;
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
    this.gainExperience(totalValue);
    
    // Очищаем корзину
    this.basket = [];
    
    // Устанавливаем кулдаун
    this.sellCooldown = this.SELL_COOLDOWN_TIME;
    
    this.updateUI();
    
    console.log(`Sold items for ${totalValue} money. Total money: ${this.money}`);
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

  private checkSellInput(): void {
    // Проверка нажатия клавиши продажи (Space)
    const keyboard = this.scene.input?.keyboard;
    if (keyboard) {
      const spaceKey = keyboard.addKey('SPACE');
      if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
        this.sellBasket();
      }
    }
  }

  private useMarketAnalysisSkill(): boolean {
    // Показывает точный график рынка на некоторое время
    console.log('Market analysis activated!');
    this.eventManager.emit('UI_UPDATE', { market_analysis: true });
    return true;
  }

  private useBulkSellSkill(): boolean {
    // Продает все предметы с бонусом
    if (this.basket.length === 0) {
      return false;
    }

    const bonus = 1.5; // 50% бонус к цене
    const marketMultiplier = this.getMarketMultiplier() * bonus;
    
    let totalValue = 0;
    this.basket.forEach(item => {
      totalValue += Math.floor(item.value * marketMultiplier);
    });
    
    this.money += totalValue;
    this.gainExperience(totalValue);
    this.basket = [];
    
    this.updateUI();
    console.log(`Bulk sell activated! Earned ${totalValue} money with bonus`);
    return true;
  }

  // Геттеры
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
    this.eventManager.emit('UI_UPDATE', { trader_destroyed: true });
    super.destroy();
  }
}
