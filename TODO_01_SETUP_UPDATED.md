# ЭТАП 1: НАСТРОЙКА TYPESCRIPT ОКРУЖЕНИЯ

## 📋 TODO - ПОДГОТОВКА И БАЗОВАЯ ИНФРАСТРУКТУРА
**Приоритет**: КРИТИЧЕСКИЙ 🔴  
**Время**: 2-3 дня

---

### 1. НАСТРОЙКА TYPESCRIPT

#### Установка зависимостей:
```bash
npm init -y
npm install --save-dev typescript @types/node webpack webpack-cli ts-loader html-webpack-plugin
npm install phaser
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@managers/*": ["managers/*"],
      "@ui/*": ["ui/*"],
      "@objects/*": ["objects/*"],
      "@scenes/*": ["scenes/*"],
      "@utils/*": ["utils/*"],
      "@types/*": ["types/*"],
      "@assets/*": ["../assets/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "js/**/*"
  ]
}
```

---

### 2. СОЗДАНИЕ БАЗОВЫХ ТИПОВ

#### src/types/common.ts
```typescript
// Базовые типы для всего проекта
export interface GameConfig {
  width: number;
  height: number;
  physics: {
    default: string;
    arcade: {
      gravity: { y: number };
      debug: boolean;
    };
  };
  scale: {
    mode: number;
    autoCenter: number;
  };
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rectangle extends Position, Size {}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type EventCallback<T = any> = (data?: T) => void;

export interface GameStats {
  score: number;
  health: number;
  maxHealth: number;
  gameOver: boolean;
  level: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}
```

#### src/types/phaser-extensions.ts
```typescript
// Расширения для Phaser 3
import * as Phaser from 'phaser';

declare global {
  namespace Phaser {
    interface Scene {
      // Расширения для сцен
      uiElements: any[];
      levelId?: number;
      selectedCharacter?: string;
    }

    interface GameObjects {
      // Расширения для игровых объектов
      interface Sprite {
        characterType?: string;
      }
    }
  }
}

export interface PhaserConfig extends Phaser.Types.Core.GameConfig {
  // Дополнительные настройки
}

export interface SceneTransitionData {
  previousScene?: string;
  data?: Record<string, any>;
}
```

#### src/types/ui-types.ts
```typescript
// Типы для UI компонентов
export interface UIElementOptions {
  visible?: boolean;
  interactive?: boolean;
  alpha?: number;
}

export interface ButtonOptions extends UIElementOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  backgroundColor?: number;
  textColor?: number;
  hoverColor?: number;
  clickColor?: number;
  pulseAnimation?: boolean;
}

export interface BarOptions extends UIElementOptions {
  width?: number;
  height?: number;
  maxValue?: number;
  currentValue?: number;
  barColor?: number;
  backgroundColor?: number;
  borderColor?: number;
  showValue?: boolean;
  iconKey?: string;
}

export interface TitleOptions extends UIElementOptions {
  fontSize?: number;
  color?: number;
  glowColor?: number;
  pulseAnimation?: boolean;
  typewriterEffect?: boolean;
}

export interface SwitchOptions extends UIElementOptions {
  width?: number;
  height?: number;
  initialState?: boolean;
  onTexture?: string;
  offTexture?: string;
}
```

#### src/types/game-config.ts
```typescript
// Типы для игровых конфигураций
export interface CharacterConfig {
  id: string;
  name: string;
  texture: string;
  stats: CharacterStats;
  skills: CharacterSkills;
  sounds: CharacterSounds;
}

export interface CharacterStats {
  health: number;
  speed: number;
  damage: number;
  defense: number;
}

export interface CharacterSkills {
  [skillName: string]: SkillConfig;
}

export interface SkillConfig {
  name: string;
  description: string;
  cooldown: number;
  damage?: number;
  effect?: string;
}

export interface CharacterSounds {
  hit: string[];
  death: string[];
  special?: string[];
}

export interface LevelConfig {
  id: number;
  name: string;
  background: string;
  music: string;
  duration: number;
  spawnRate: {
    good: number;
    bad: number;
    veryGood: number;
  };
  objectives: LevelObjective[];
}

export interface LevelObjective {
  type: 'score' | 'survive' | 'collect';
  target: number;
  description: string;
}

export interface AudioConfig {
  music: {
    [key: string]: string;
  };
  sounds: {
    [key: string]: string;
  };
  volume: {
    music: number;
    sounds: number;
  };
}
```

---

### 3. СТРУКТУРА ДИРЕКТОРИЙ

#### Создание папок:
```
src/
├── types/
│   ├── common.ts
│   ├── phaser-extensions.ts
│   ├── ui-types.ts
│   └── game-config.ts
├── managers/
├── ui/
│   ├── base/
│   └── components/
├── objects/
│   └── characters/
├── scenes/
│   ├── base/
│   ├── levels/
│   └── ui/
├── utils/
├── config.ts
└── game.ts
```

---

### 4. WEBPACK КОНФИГУРАЦИЯ

#### webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/game.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|wav|mp3)$/i,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@managers': path.resolve(__dirname, 'src/managers'),
      '@ui': path.resolve(__dirname, 'src/ui'),
      '@objects': path.resolve(__dirname, 'src/objects'),
      '@scenes': path.resolve(__dirname, 'src/scenes'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@types': path.resolve(__dirname, 'src/types'),
      '@assets': path.resolve(__dirname, 'assets'),
    },
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    static: './dist',
    hot: true,
  },
  mode: 'development',
  devtool: 'source-map',
};
```

---

### 5. ESLINT КОНФИГУРАЦИЯ

#### .eslintrc.js
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  env: {
    browser: true,
    es2020: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

---

### 6. PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "type-check": "tsc --noEmit",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "clean": "rimraf dist"
  }
}
```

---

### 7. БАЗОВЫЙ src/config.ts

```typescript
import type { GameConfig } from '@types/common';

export const gameConfig: GameConfig = {
  width: 1920,
  height: 1080,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export const GAME_CONSTANTS = {
  MAX_HEALTH: 100,
  DEFAULT_SPEED: 200,
  ITEM_SPAWN_RATE: 2000,
  EXPLOSION_DURATION: 1000,
} as const;
```

---

### 8. БАЗОВЫЙ src/game.ts

```typescript
import * as Phaser from 'phaser';
import { gameConfig } from '@/config';

// TODO: Импорты сцен будут добавлены на следующих этапах
// import { MenuScene } from '@scenes/ui/MenuScene';

class Game {
  private phaserGame: Phaser.Game;

  constructor() {
    const config: Phaser.Types.Core.GameConfig = {
      ...gameConfig,
      type: Phaser.AUTO,
      dom: {
        createContainer: true
      },
      // scene: [] // Сцены будут добавлены позже
    };

    this.phaserGame = new Phaser.Game(config);
  }

  public getGame(): Phaser.Game {
    return this.phaserGame;
  }
}

// Инициализация игры
const game = new Game();

export { game };
```

---

## ✅ ЧЕКЛИСТ ЭТАПА 1

- [ ] Установлены все зависимости TypeScript
- [ ] Создан tsconfig.json с правильными настройками
- [ ] Настроен webpack для сборки TypeScript
- [ ] Созданы базовые типы в src/types/
- [ ] Настроен eslint для TypeScript
- [ ] Создана структура директорий src/
- [ ] Создан базовый config.ts
- [ ] Создан базовый game.ts
- [ ] Проверена сборка без ошибок: `npm run build`
- [ ] Проверен type checking: `npm run type-check`
- [ ] Проверен linting: `npm run lint`

---

## 🔄 СЛЕДУЮЩИЙ ЭТАП

После завершения этого этапа переходим к **ЭТАП 2: МЕНЕДЖЕРЫ → TYPESCRIPT** (`TODO_02_MANAGERS.md`)

**Важно**: Не удаляйте пока js/ папку - она понадобится для постепенной миграции!

---

## 📝 ЗАМЕТКИ

- Все console.log заменены на console.warn/console.error где необходимо
- Настроен строгий режим TypeScript для максимальной типобезопасности  
- Созданы alias для удобного импорта модулей
- Добавлена поддержка source maps для отладки
- Настроена горячая перезагрузка для разработки
