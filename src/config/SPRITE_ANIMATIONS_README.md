# Документация по спрайт-анимациям

## Обзор

Система спрайт-анимаций предоставляет удобный способ создания и управления анимациями взрывов в игре PSU Survivor. Система основана на атласах, расположенных в `assets/atlas/`.

## Доступные анимации

### Из атласа `bad_money.json`:

1. **bad_explosion** - Взрыв плохих объектов
   - 9 кадров
   - Частота: 12 fps
   - Длительность: 750ms

2. **money_explosion** - Взрыв денег
   - 8 кадров
   - Частота: 10 fps
   - Длительность: 800ms

### Из атласа `good_super.json`:

1. **good_explosion** - Взрыв хороших объектов
   - 6 кадров
   - Частота: 12 fps
   - Длительность: 500ms

2. **super_explosion** - Супер взрыв
   - 8 кадров
   - Частота: 16 fps
   - Длительность: 500ms

3. **aero_cerberus_explosion** - Взрыв Аэро Цербера
   - 9 кадров
   - Частота: 15 fps
   - Длительность: 600ms

## Использование

### Базовое использование

```typescript
import { SpriteAnimationManager, ANIMATION_KEYS } from '../config/sprite-animations';

export class MyGameScene extends Phaser.Scene {
  private animationManager!: SpriteAnimationManager;

  preload(): void {
    // Загрузка атласов
    this.load.atlas('bad_money', 'assets/atlas/bad_money.png', 'assets/atlas/bad_money.json');
    this.load.atlas('good_super', 'assets/atlas/good_super.png', 'assets/atlas/good_super.json');
  }

  create(): void {
    // Инициализация менеджера анимаций
    this.animationManager = new SpriteAnimationManager(this);
    this.animationManager.initializeAllExplosions();
  }

  // Создание эффекта взрыва
  private createExplosion(x: number, y: number): void {
    this.animationManager.createExplosionEffect(x, y, 'GOOD_EXPLOSION', () => {
      console.log('Взрыв завершен!');
    });
  }
}
```

### Использование с базовым классом

```typescript
import { AnimatedScene } from '../config/animation-examples';

export class MyGameScene extends AnimatedScene {
  preload(): void {
    this.load.atlas('bad_money', 'assets/atlas/bad_money.png', 'assets/atlas/bad_money.json');
    this.load.atlas('good_super', 'assets/atlas/good_super.png', 'assets/atlas/good_super.json');
  }

  create(): void {
    super.create(); // Инициализирует анимации

    // Теперь можно использовать встроенные методы
    this.input.on('pointerdown', (pointer) => {
      this.createSuperExplosion(pointer.x, pointer.y);
    });
  }
}
```

### Создание цепочки взрывов

```typescript
import { AnimationHelpers } from '../config/animation-examples';

// В методе create сцены:
AnimationHelpers.createExplosionChain(
  this,                    // сцена
  this.animationManager,   // менеджер анимаций
  100, 100,               // начальная позиция
  500, 300,               // конечная позиция
  5,                      // количество взрывов
  'SUPER_EXPLOSION',      // тип взрыва
  200                     // задержка между взрывами (мс)
);
```

### Создание последовательности взрывов

```typescript
const positions = [
  { x: 100, y: 100 },
  { x: 200, y: 150 },
  { x: 300, y: 100 }
];

AnimationHelpers.createExplosionSequence(
  this,
  this.animationManager,
  positions,
  'GOOD_EXPLOSION',
  300 // задержка между взрывами
);
```

## API Reference

### SpriteAnimationManager

#### Методы:

- `constructor(scene: Phaser.Scene)` - Создает экземпляр менеджера
- `initializeAllExplosions()` - Инициализирует все анимации взрывов
- `createExplosionEffect(x, y, type, onComplete?)` - Создает эффект взрыва
- `createAnimatedSprite(x, y, atlas, frame?, animationKey?)` - Создает анимированный спрайт

### AnimatedScene

Базовый класс для сцен с поддержкой анимаций.

#### Методы:

- `createExplosion(x, y, type?)` - Создает общий взрыв
- `createBadExplosion(x, y)` - Создает взрыв плохого объекта
- `createMoneyExplosion(x, y)` - Создает взрыв денег
- `createSuperExplosion(x, y)` - Создает супер взрыв

### AnimationHelpers

Утилитарные функции для создания сложных анимационных эффектов.

#### Статические методы:

- `createExplosionSequence()` - Создает последовательность взрывов
- `createExplosionChain()` - Создает цепочку взрывов по линии

## Константы

```typescript
// Ключи анимаций
export const ANIMATION_KEYS = {
  BAD_EXPLOSION: 'bad_explosion',
  MONEY_EXPLOSION: 'money_explosion',
  AERO_CERBERUS_EXPLOSION: 'aero_cerberus_explosion',
  GOOD_EXPLOSION: 'good_explosion',
  SUPER_EXPLOSION: 'super_explosion'
};
```

## Типы

```typescript
type ExplosionType = 'BAD_EXPLOSION' | 'MONEY_EXPLOSION' | 'AERO_CERBERUS_EXPLOSION' | 'GOOD_EXPLOSION' | 'SUPER_EXPLOSION';
type AnimationKey = 'bad_explosion' | 'money_explosion' | 'aero_cerberus_explosion' | 'good_explosion' | 'super_explosion';
```

## Примеры интеграции в существующие сцены

### Добавление в GameLevelScene

```typescript
import { SpriteAnimationManager } from '../config/sprite-animations';

export class GameLevelScene extends Phaser.Scene {
  private animationManager!: SpriteAnimationManager;

  preload(): void {
    // ...существующий код...
    this.load.atlas('bad_money', 'assets/atlas/bad_money.png', 'assets/atlas/bad_money.json');
    this.load.atlas('good_super', 'assets/atlas/good_super.png', 'assets/atlas/good_super.json');
  }

  create(): void {
    // ...существующий код...
    this.animationManager = new SpriteAnimationManager(this);
    this.animationManager.initializeAllExplosions();
  }

  // Использование в логике игры
  private onObjectDestroy(x: number, y: number, objectType: string): void {
    switch (objectType) {
      case 'bad':
        this.animationManager.createExplosionEffect(x, y, 'BAD_EXPLOSION');
        break;
      case 'good':
        this.animationManager.createExplosionEffect(x, y, 'GOOD_EXPLOSION');
        break;
      case 'super':
        this.animationManager.createExplosionEffect(x, y, 'SUPER_EXPLOSION');
        break;
    }
  }
}
```
