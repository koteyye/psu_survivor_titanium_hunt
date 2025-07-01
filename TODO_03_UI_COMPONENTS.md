# ЭТАП 3: UI КОМПОНЕНТЫ

## 📋 TODO - ПЕРЕВОД UI КОМПОНЕНТОВ НА TYPESCRIPT

### 1. CYBERUIELEMENT → TYPESCRIPT (БАЗОВЫЙ КЛАСС)

#### src/ui/CyberUIElement.ts
```typescript
import { ICyberUIElement } from '../types/ui.types';

export abstract class CyberUIElement implements ICyberUIElement {
  public scene: Phaser.Scene;
  public x: number;
  public y: number;
  public visible: boolean = true;
  
  protected elements: Phaser.GameObjects.GameObject[] = [];
  protected destroyed: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.init();
  }

  protected abstract init(): void;

  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.elements.forEach(element => {
      if ('setVisible' in element) {
        (element as any).setVisible(visible);
      }
    });
  }

  public setPosition(x: number, y: number): void {
    const deltaX = x - this.x;
    const deltaY = y - this.y;
    
    this.x = x;
    this.y = y;
    
    this.elements.forEach(element => {
      if ('x' in element && 'y' in element) {
        (element as any).x += deltaX;
        (element as any).y += deltaY;
      }
    });
  }

  public setAlpha(alpha: number): void {
    this.elements.forEach(element => {
      if ('setAlpha' in element) {
        (element as any).setAlpha(alpha);
      }
    });
  }

  public destroy(): void {
    if (this.destroyed) return;
    
    this.elements.forEach(element => {
      if (element && 'destroy' in element) {
        (element as any).destroy();
      }
    });
    
    this.elements = [];
    this.destroyed = true;
  }

  protected addElement(element: Phaser.GameObjects.GameObject): void {
    if (!this.destroyed) {
      this.elements.push(element);
    }
  }

  protected createGlowEffect(target: Phaser.GameObjects.GameObject, color: number = 0x00ffff, alpha: number = 0.3): Phaser.GameObjects.GameObject {
    const glow = this.scene.add.existing(target.scene.add.clone(target));
    if ('setTint' in glow) {
      (glow as any).setTint(color);
    }
    if ('setAlpha' in glow) {
      (glow as any).setAlpha(alpha);
    }
    if ('setBlendMode' in glow) {
      (glow as any).setBlendMode(Phaser.BlendModes.ADD);
    }
    return glow;
  }

  public isDestroyed(): boolean {
    return this.destroyed;
  }
}
```

### 2. CYBERBUTTON → TYPESCRIPT

#### src/ui/CyberButton.ts
```typescript
import { CyberUIElement } from './CyberUIElement';
import { CyberButtonOptions } from '../types/ui.types';

export class CyberButton extends CyberUIElement {
  private text: string;
  private callback: () => void;
  private options: Required<CyberButtonOptions>;
  
  private background: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private textObject: Phaser.GameObjects.Text;
  private glowEffect?: Phaser.GameObjects.Rectangle;
  private icon?: Phaser.GameObjects.Text;
  
  private isHovered: boolean = false;
  private isPressed: boolean = false;
  private pulseAnimation?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    options: CyberButtonOptions = {}
  ) {
    // Устанавливаем значения по умолчанию
    const defaultOptions: Required<CyberButtonOptions> = {
      width: 300,
      height: 60,
      fontSize: 24,
      fontFamily: 'Orbitron, sans-serif',
      color: '#00f7ff',
      backgroundColor: '#0a0f1c',
      borderColor: '#00f7ff',
      hoverColor: '#ff4081',
      pulseAnimation: false
    };

    super(scene, x, y);
    this.text = text;
    this.callback = callback;
    this.options = { ...defaultOptions, ...options };
  }

  protected init(): void {
    this.createBackground();
    this.createBorder();
    this.createText();
    this.createGlow();
    this.setupInteractivity();
    
    if (this.options.pulseAnimation) {
      this.startPulseAnimation();
    }
  }

  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width,
      this.options.height,
      Phaser.Display.Color.HexStringToColor(this.options.backgroundColor).color
    );
    this.background.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color);
    this.addElement(this.background);
  }

  private createBorder(): void {
    this.border = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width + 4,
      this.options.height + 4
    );
    this.border.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0.6);
    this.border.setFillStyle(0x000000, 0);
    this.addElement(this.border);
  }

  private createText(): void {
    this.textObject = this.scene.add.text(this.x, this.y, this.text, {
      fontSize: `${this.options.fontSize}px`,
      fontFamily: this.options.fontFamily,
      color: this.options.color,
      align: 'center'
    });
    this.textObject.setOrigin(0.5);
    this.addElement(this.textObject);
  }

  private createGlow(): void {
    this.glowEffect = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width + 10,
      this.options.height + 10,
      Phaser.Display.Color.HexStringToColor(this.options.borderColor).color,
      0
    );
    this.glowEffect.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0);
    this.addElement(this.glowEffect);
  }

  private setupInteractivity(): void {
    this.background.setInteractive({ useHandCursor: true });
    
    this.background.on('pointerover', () => this.onHover());
    this.background.on('pointerout', () => this.onHoverOut());
    this.background.on('pointerdown', () => this.onPointerDown());
    this.background.on('pointerup', () => this.onPointerUp());
    this.background.on('pointerupoutside', () => this.onPointerUp());
  }

  private onHover(): void {
    if (this.isPressed) return;
    
    this.isHovered = true;
    this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.hoverColor).color);
    this.textObject.setColor(this.options.hoverColor);
    
    // Эффект свечения
    this.glowEffect?.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.hoverColor).color, 0.8);
    
    // Легкое увеличение
    this.scene.tweens.add({
      targets: [this.background, this.border, this.textObject],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2'
    });
  }

  private onHoverOut(): void {
    if (this.isPressed) return;
    
    this.isHovered = false;
    this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color);
    this.textObject.setColor(this.options.color);
    this.glowEffect?.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0);
    
    // Возврат к нормальному размеру
    this.scene.tweens.add({
      targets: [this.background, this.border, this.textObject],
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Power2'
    });
  }

  private onPointerDown(): void {
    this.isPressed = true;
    
    // Эффект нажатия
    this.scene.tweens.add({
      targets: [this.background, this.border, this.textObject],
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      ease: 'Power2'
    });
  }

  private onPointerUp(): void {
    if (!this.isPressed) return;
    
    this.isPressed = false;
    
    // Возврат к hover состоянию или нормальному
    const targetScale = this.isHovered ? 1.05 : 1;
    this.scene.tweens.add({
      targets: [this.background, this.border, this.textObject],
      scaleX: targetScale,
      scaleY: targetScale,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        if (this.isHovered) {
          this.callback();
        }
      }
    });
  }

  private startPulseAnimation(): void {
    this.pulseAnimation = this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public addIcon(iconText: string): void {
    this.icon = this.scene.add.text(
      this.x - this.options.width / 2 + 30,
      this.y,
      iconText,
      {
        fontSize: `${this.options.fontSize}px`,
        color: this.options.color
      }
    );
    this.icon.setOrigin(0.5);
    this.addElement(this.icon);
    
    // Сдвигаем основной текст вправо
    this.textObject.x = this.x + 15;
  }

  public setText(newText: string): void {
    this.text = newText;
    this.textObject.setText(newText);
  }

  public setEnabled(enabled: boolean): void {
    this.background.setInteractive(enabled);
    this.setAlpha(enabled ? 1 : 0.5);
  }

  public destroy(): void {
    if (this.pulseAnimation) {
      this.pulseAnimation.destroy();
    }
    super.destroy();
  }
}
```

### 3. CYBERCARD → TYPESCRIPT

#### src/ui/CyberCard.ts
```typescript
import { CyberUIElement } from './CyberUIElement';
import { CyberCardOptions } from '../types/ui.types';

export class CyberCard extends CyberUIElement {
  private imageKey: string;
  private callback: (card: CyberCard) => void;
  private options: Required<CyberCardOptions>;
  
  private background: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private image: Phaser.GameObjects.Image;
  private glowEffect: Phaser.GameObjects.Rectangle;
  
  private isSelected: boolean = false;
  private isHovered: boolean = false;
  private pulseAnimation?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    imageKey: string,
    callback: (card: CyberCard) => void,
    options: CyberCardOptions = {}
  ) {
    const defaultOptions: Required<CyberCardOptions> = {
      cardWidth: 200,
      cardHeight: 300,
      imageScale: 0.8,
      width: 200,
      height: 300,
      fontSize: 16,
      fontFamily: 'Orbitron, sans-serif',
      color: '#00f7ff',
      backgroundColor: '#0a0f1c',
      borderColor: '#00f7ff',
      hoverColor: '#ff4081',
      pulseAnimation: false
    };

    super(scene, x, y);
    this.imageKey = imageKey;
    this.callback = callback;
    this.options = { ...defaultOptions, ...options };
  }

  protected init(): void {
    this.createBackground();
    this.createBorder();
    this.createImage();
    this.createGlow();
    this.setupInteractivity();
  }

  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.cardWidth,
      this.options.cardHeight,
      Phaser.Display.Color.HexStringToColor(this.options.backgroundColor).color,
      0.9
    );
    this.addElement(this.background);
  }

  private createBorder(): void {
    this.border = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.cardWidth,
      this.options.cardHeight
    );
    this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color);
    this.border.setFillStyle(0x000000, 0);
    this.addElement(this.border);
  }

  private createImage(): void {
    this.image = this.scene.add.image(this.x, this.y, this.imageKey);
    this.image.setScale(this.options.imageScale);
    this.addElement(this.image);
  }

  private createGlow(): void {
    this.glowEffect = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.cardWidth + 10,
      this.options.cardHeight + 10,
      Phaser.Display.Color.HexStringToColor(this.options.borderColor).color,
      0
    );
    this.glowEffect.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0);
    this.addElement(this.glowEffect);
  }

  private setupInteractivity(): void {
    this.background.setInteractive({ useHandCursor: true });
    
    this.background.on('pointerover', () => this.onHover());
    this.background.on('pointerout', () => this.onHoverOut());
    this.background.on('pointerdown', () => this.onClick());
  }

  private onHover(): void {
    if (this.isSelected) return;
    
    this.isHovered = true;
    this.border.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(this.options.hoverColor).color);
    this.glowEffect.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(this.options.hoverColor).color, 0.6);
    
    // Анимация hover
    this.scene.tweens.add({
      targets: [this.background, this.border, this.image],
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 200,
      ease: 'Power2'
    });
  }

  private onHoverOut(): void {
    if (this.isSelected) return;
    
    this.isHovered = false;
    this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color);
    this.glowEffect.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0);
    
    // Возврат к нормальному размеру
    this.scene.tweens.add({
      targets: [this.background, this.border, this.image],
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });
  }

  private onClick(): void {
    this.callback(this);
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    
    if (selected) {
      this.border.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor('#00ff00').color);
      this.glowEffect.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor('#00ff00').color, 0.8);
      
      // Пульсация для выбранной карточки
      this.pulseAnimation = this.scene.tweens.add({
        targets: this.glowEffect,
        alpha: 0.8,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      this.border.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color);
      this.glowEffect.setStrokeStyle(3, Phaser.Display.Color.HexStringToColor(this.options.borderColor).color, 0);
      
      if (this.pulseAnimation) {
        this.pulseAnimation.destroy();
        this.pulseAnimation = undefined;
      }
    }
  }

  public isCardSelected(): boolean {
    return this.isSelected;
  }

  public destroy(): void {
    if (this.pulseAnimation) {
      this.pulseAnimation.destroy();
    }
    super.destroy();
  }
}
```

### 4. CYBERTITLE → TYPESCRIPT

#### src/ui/CyberTitle.ts
```typescript
import { CyberUIElement } from './CyberUIElement';
import { CyberTitleOptions } from '../types/ui.types';

export class CyberTitle extends CyberUIElement {
  private text: string;
  private options: Required<CyberTitleOptions>;
  
  private titleText: Phaser.GameObjects.Text;
  private glowText: Phaser.GameObjects.Text;
  private pulseAnimation?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    options: CyberTitleOptions = {}
  ) {
    const defaultOptions: Required<CyberTitleOptions> = {
      fontSize: 48,
      fontFamily: 'Orbitron, sans-serif',
      color: '#00f7ff',
      glowIntensity: 1.0,
      pulseAnimation: false
    };

    super(scene, x, y);
    this.text = text;
    this.options = { ...defaultOptions, ...options };
  }

  protected init(): void {
    this.createGlowText();
    this.createMainText();
    
    if (this.options.pulseAnimation) {
      this.startPulseAnimation();
    }
  }

  private createGlowText(): void {
    this.glowText = this.scene.add.text(this.x, this.y, this.text, {
      fontSize: `${this.options.fontSize + 4}px`,
      fontFamily: this.options.fontFamily,
      color: this.options.color
    });
    this.glowText.setOrigin(0.5);
    this.glowText.setAlpha(this.options.glowIntensity * 0.6);
    this.glowText.setBlendMode(Phaser.BlendModes.ADD);
    this.addElement(this.glowText);
  }

  private createMainText(): void {
    this.titleText = this.scene.add.text(this.x, this.y, this.text, {
      fontSize: `${this.options.fontSize}px`,
      fontFamily: this.options.fontFamily,
      color: this.options.color,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        fill: true
      }
    });
    this.titleText.setOrigin(0.5);
    this.addElement(this.titleText);
  }

  private startPulseAnimation(): void {
    this.pulseAnimation = this.scene.tweens.add({
      targets: [this.titleText, this.glowText],
      alpha: 0.7,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  public setText(newText: string): void {
    this.text = newText;
    this.titleText.setText(newText);
    this.glowText.setText(newText);
  }

  public setGlowIntensity(intensity: number): void {
    this.options.glowIntensity = Math.max(0, Math.min(2, intensity));
    this.glowText.setAlpha(this.options.glowIntensity * 0.6);
  }

  public destroy(): void {
    if (this.pulseAnimation) {
      this.pulseAnimation.destroy();
    }
    super.destroy();
  }
}
```

### 5. CYBERSWITCH → TYPESCRIPT

#### src/ui/CyberSwitch.ts
```typescript
import { CyberUIElement } from './CyberUIElement';

export class CyberSwitch extends CyberUIElement {
  private label: string;
  private state: boolean;
  private callback: (enabled: boolean) => void;
  private options: {
    width: number;
    height: number;
    fontSize: number;
  };
  
  private labelText?: Phaser.GameObjects.Text;
  private switchBackground: Phaser.GameObjects.Rectangle;
  private switchIndicator: Phaser.GameObjects.Rectangle;
  private switchBorder: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    initialState: boolean,
    callback: (enabled: boolean) => void,
    options: { width?: number; height?: number; fontSize?: number } = {}
  ) {
    super(scene, x, y);
    this.label = label;
    this.state = initialState;
    this.callback = callback;
    this.options = {
      width: options.width || 80,
      height: options.height || 40,
      fontSize: options.fontSize || 16
    };
  }

  protected init(): void {
    this.createLabel();
    this.createSwitch();
    this.setupInteractivity();
    this.updateVisualState();
  }

  private createLabel(): void {
    if (this.label) {
      this.labelText = this.scene.add.text(
        this.x - this.options.width - 20,
        this.y,
        this.label,
        {
          fontSize: `${this.options.fontSize}px`,
          fontFamily: 'Orbitron, sans-serif',
          color: '#00f7ff'
        }
      );
      this.labelText.setOrigin(1, 0.5);
      this.addElement(this.labelText);
    }
  }

  private createSwitch(): void {
    // Фон переключателя
    this.switchBackground = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width,
      this.options.height,
      0x333333
    );
    this.addElement(this.switchBackground);

    // Рамка переключателя
    this.switchBorder = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width,
      this.options.height
    );
    this.switchBorder.setStrokeStyle(2, 0x00f7ff);
    this.switchBorder.setFillStyle(0x000000, 0);
    this.addElement(this.switchBorder);

    // Индикатор
    this.switchIndicator = this.scene.add.rectangle(
      this.x - this.options.width / 4,
      this.y,
      this.options.width / 2 - 4,
      this.options.height - 4,
      0x00f7ff
    );
    this.addElement(this.switchIndicator);
  }

  private setupInteractivity(): void {
    this.switchBackground.setInteractive({ useHandCursor: true });
    this.switchBackground.on('pointerdown', () => this.toggle());
  }

  private updateVisualState(): void {
    const targetX = this.state 
      ? this.x + this.options.width / 4 
      : this.x - this.options.width / 4;
    
    const targetColor = this.state ? 0x00ff00 : 0xff0000;
    
    this.scene.tweens.add({
      targets: this.switchIndicator,
      x: targetX,
      duration: 200,
      ease: 'Power2'
    });

    this.switchIndicator.setFillStyle(targetColor);
  }

  public toggle(): void {
    this.setState(!this.state);
  }

  public setState(newState: boolean): void {
    if (this.state !== newState) {
      this.state = newState;
      this.updateVisualState();
      this.callback(this.state);
    }
  }

  public getState(): boolean {
    return this.state;
  }
}
```

### 6. CYBERBAR → TYPESCRIPT

#### src/ui/CyberBar.ts
```typescript
import { CyberUIElement } from './CyberUIElement';

export interface CyberBarOptions {
  width?: number;
  height?: number;
  backgroundColor?: number;
  barColor?: number;
  borderColor?: number;
  showText?: boolean;
  textColor?: string;
  fontSize?: number;
}

export class CyberBar extends CyberUIElement {
  private maxValue: number;
  private currentValue: number;
  private options: Required<CyberBarOptions>;
  
  private background: Phaser.GameObjects.Rectangle;
  private bar: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private valueText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxValue: number,
    currentValue: number = maxValue,
    options: CyberBarOptions = {}
  ) {
    const defaultOptions: Required<CyberBarOptions> = {
      width: 200,
      height: 20,
      backgroundColor: 0x333333,
      barColor: 0x00ff00,
      borderColor: 0x00f7ff,
      showText: true,
      textColor: '#ffffff',
      fontSize: 14
    };

    super(scene, x, y);
    this.maxValue = maxValue;
    this.currentValue = Math.max(0, Math.min(maxValue, currentValue));
    this.options = { ...defaultOptions, ...options };
  }

  protected init(): void {
    this.createBackground();
    this.createBar();
    this.createBorder();
    
    if (this.options.showText) {
      this.createText();
    }
    
    this.updateBar();
  }

  private createBackground(): void {
    this.background = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width,
      this.options.height,
      this.options.backgroundColor
    );
    this.addElement(this.background);
  }

  private createBar(): void {
    this.bar = this.scene.add.rectangle(
      this.x - this.options.width / 2,
      this.y,
      0,
      this.options.height - 2,
      this.options.barColor
    );
    this.bar.setOrigin(0, 0.5);
    this.addElement(this.bar);
  }

  private createBorder(): void {
    this.border = this.scene.add.rectangle(
      this.x,
      this.y,
      this.options.width,
      this.options.height
    );
    this.border.setStrokeStyle(1, this.options.borderColor);
    this.border.setFillStyle(0x000000, 0);
    this.addElement(this.border);
  }

  private createText(): void {
    this.valueText = this.scene.add.text(
      this.x,
      this.y,
      `${this.currentValue}/${this.maxValue}`,
      {
        fontSize: `${this.options.fontSize}px`,
        fontFamily: 'Arial',
        color: this.options.textColor,
        align: 'center'
      }
    );
    this.valueText.setOrigin(0.5);
    this.addElement(this.valueText);
  }

  private updateBar(): void {
    const percentage = this.currentValue / this.maxValue;
    const barWidth = this.options.width * percentage;
    
    this.scene.tweens.add({
      targets: this.bar,
      width: barWidth,
      duration: 300,
      ease: 'Power2'
    });

    // Изменяем цвет в зависимости от процента
    let barColor = this.options.barColor;
    if (percentage < 0.25) {
      barColor = 0xff0000; // Красный
    } else if (percentage < 0.5) {
      barColor = 0xff8800; // Оранжевый
    } else if (percentage < 0.75) {
      barColor = 0xffff00; // Желтый
    }
    
    this.bar.setFillStyle(barColor);

    if (this.valueText) {
      this.valueText.setText(`${this.currentValue}/${this.maxValue}`);
    }
  }

  public setValue(value: number, animate: boolean = true): void {
    const newValue = Math.max(0, Math.min(this.maxValue, value));
    
    if (animate) {
      this.scene.tweens.add({
        targets: this,
        currentValue: newValue,
        duration: 500,
        onUpdate: () => {
          this.currentValue = Math.round(this.currentValue);
          this.updateBar();
        }
      });
    } else {
      this.currentValue = newValue;
      this.updateBar();
    }
  }

  public addValue(delta: number): void {
    this.setValue(this.currentValue + delta);
  }

  public setMaxValue(newMaxValue: number): void {
    this.maxValue = newMaxValue;
    this.currentValue = Math.min(this.currentValue, this.maxValue);
    this.updateBar();
  }

  public getCurrentValue(): number {
    return this.currentValue;
  }

  public getMaxValue(): number {
    return this.maxValue;
  }

  public getPercentage(): number {
    return this.currentValue / this.maxValue;
  }
}
```

### 7. ОБНОВИТЬ INDEX.TS

#### src/ui/index.ts
```typescript
export { CyberUIElement } from './CyberUIElement';
export { CyberButton } from './CyberButton';
export { CyberCard } from './CyberCard';
export { CyberTitle } from './CyberTitle';
export { CyberSwitch } from './CyberSwitch';
export { CyberBar } from './CyberBar';

export type { 
  ICyberUIElement, 
  CyberButtonOptions, 
  CyberCardOptions, 
  CyberTitleOptions 
} from '../types/ui.types';
```

---

## 🔧 ПРОБЛЕМЫ ИСПРАВЛЕННЫЕ

### 1. ДУБЛИРОВАНИЕ КОДА UI
- ✅ Базовый класс CyberUIElement
- ✅ Общие методы в базовом классе
- ✅ Единообразный стиль

### 2. ОТСУТСТВИЕ ТИПИЗАЦИИ
- ✅ Строгая типизация всех свойств
- ✅ Интерфейсы для опций
- ✅ Типобезопасные колбеки

### 3. УТЕЧКИ ПАМЯТИ
- ✅ Правильное уничтожение элементов
- ✅ Очистка анимаций
- ✅ Удаление обработчиков событий

### 4. НЕТ ОБРАБОТКИ ОШИБОК
- ✅ Валидация параметров
- ✅ Проверка на null/undefined
- ✅ Безопасное уничтожение

---

## ✅ CHECKLIST

- [ ] Создать CyberUIElement.ts (базовый класс)
- [ ] Создать CyberButton.ts
- [ ] Создать CyberCard.ts
- [ ] Создать CyberTitle.ts
- [ ] Создать CyberSwitch.ts
- [ ] Создать CyberBar.ts
- [ ] Обновить ui/index.ts
- [ ] Добавить тесты для UI компонентов
- [ ] Протестировать совместимость
- [ ] Обновить импорты в сценах
- [ ] Добавить JSDoc комментарии

---

## 🎯 РЕЗУЛЬТАТ ЭТАПА

После завершения этого этапа:
- ✅ Все UI компоненты типизированы
- ✅ Единая архитектура UI
- ✅ Устранены утечки памяти
- ✅ Улучшена производительность
- ✅ Добавлена валидация

**Время выполнения**: 2-3 дня
