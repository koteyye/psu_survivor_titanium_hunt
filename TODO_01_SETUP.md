# ЭТАП 1: ПОДГОТОВКА И НАСТРОЙКА

## 📋 TODO - НАСТРОЙКА TYPESCRIPT ОКРУЖЕНИЯ

### 1. СОЗДАТЬ КОНФИГУРАЦИОННЫЕ ФАЙЛЫ

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "js/**/*"
  ]
}
```

#### package.json (обновления)
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "phaser": "^3.70.0",
    "webpack": "^5.88.0",
    "webpack-cli": "^5.1.0",
    "ts-loader": "^9.4.0",
    "html-webpack-plugin": "^5.5.0",
    "copy-webpack-plugin": "^11.0.0"
  },
  "scripts": {
    "build": "webpack --mode production",
    "dev": "webpack serve --mode development",
    "type-check": "tsc --noEmit"
  }
}
```

#### webpack.config.js
```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/game.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'game.js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets', to: 'assets' }
      ]
    })
  ],
  devServer: {
    static: './dist',
    port: 8080
  }
};
```

### 2. СОЗДАТЬ БАЗОВЫЕ ТИПЫ

#### types/game.types.ts
```typescript
export interface GameConfig {
  width: number;
  height: number;
  gravity: number;
  debug: boolean;
}

export interface PlayerConfig {
  defaultSpeed: number;
  defaultHealth: number;
  collisionSize: Size;
  displaySize: Size;
}

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface VelocityRange {
  x: [number, number];
  y: [number, number];
}

export interface ItemConfig {
  points?: number;
  damage?: number;
  healthBonus?: number;
  spawnChance: number;
  displaySize: Size;
  collisionSize: Size;
  velocityRange: VelocityRange;
  angularVelocityRange: [number, number];
}

export interface AudioConfig {
  volume: number;
  defaultEnabled: boolean;
}

export interface GameState {
  score: number;
  health: number;
  gameOver: boolean;
  isPaused: boolean;
  levelId: number;
  selectedCharacter: string;
}
```

#### types/character.types.ts
```typescript
export interface CharacterInfo {
  id: string;
  name: string;
  texture: string;
  description: string;
  fullDescription?: string;
  shortDescription?: string;
  category: string;
}

export interface CharacterStats {
  health: number;
  speed: number;
  damage: number;
  defense: number;
}

export interface CharacterSkill {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  cost?: number;
}

export interface ICharacter {
  id: string;
  sprite: Phaser.Physics.Arcade.Sprite;
  stats: CharacterStats;
  skills: CharacterSkill[];
  
  // Методы
  collectGoodItem(item: Phaser.Physics.Arcade.Sprite): void;
  collectVeryGoodItem(item: Phaser.Physics.Arcade.Sprite): void;
  hitBadItem(item: Phaser.Physics.Arcade.Sprite): void;
  update(time: number): void;
  destroy(): void;
}
```

#### types/manager.types.ts
```typescript
export interface IConfigManager {
  getInstance(): IConfigManager;
  loadFromCache(scene: Phaser.Scene, key: string, cacheKey: string): any;
  setConfig(key: string, config: any): void;
  getConfig(key: string): any;
  getValue(key: string, path: string, defaultValue?: any): any;
  areConfigsLoaded(): boolean;
  setConfigsLoaded(loaded: boolean): void;
}

export interface IAudioManager {
  getInstance(): IAudioManager;
  init(scene: Phaser.Scene): void;
  addSound(key: string, audioKey: string, config?: any): void;
  addMusic(key: string, audioKey: string, config?: any): void;
  playSound(key: string): void;
  playMusic(key: string): void;
  stopMusic(): void;
  setMusicEnabled(enabled: boolean): void;
  setSoundEnabled(enabled: boolean): void;
}

export interface IEventManager {
  getInstance(): IEventManager;
  subscribe(eventName: string, callback: Function, context?: any): any;
  unsubscribe(subscription: any): void;
  emit(eventName: string, data?: any): void;
  subscribeScene(scene: Phaser.Scene, eventName: string, callback: Function): any;
}

export interface IObjectPoolManager {
  getInstance(): IObjectPoolManager;
  createPool(key: string, scene: Phaser.Scene, texture: string, setupCallback?: Function, size?: number): void;
  getFromPool(key: string): Phaser.Physics.Arcade.Sprite | null;
  returnToPool(key: string, object: Phaser.Physics.Arcade.Sprite): void;
  destroyPool(key: string): void;
  destroyAllPools(): void;
}
```

#### types/ui.types.ts
```typescript
export interface ICyberUIElement {
  scene: Phaser.Scene;
  x: number;
  y: number;
  visible: boolean;
  
  setVisible(visible: boolean): void;
  destroy(): void;
}

export interface CyberButtonOptions {
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  hoverColor?: string;
  pulseAnimation?: boolean;
}

export interface CyberCardOptions extends CyberButtonOptions {
  cardWidth?: number;
  cardHeight?: number;
  imageScale?: number;
}

export interface CyberTitleOptions {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  glowIntensity?: number;
  pulseAnimation?: boolean;
}
```

#### types/scene.types.ts
```typescript
export interface IGameLevel {
  levelId: number;
  selectedCharacter: string;
  levelConfig: any;
  levelStartTime: number;
  levelCompleted: boolean;
  isPaused: boolean;
  
  init(data: any): void;
  preload(): void;
  create(): void;
  update(time: number): void;
  
  togglePause(): void;
  returnToMenu(): void;
  goToNextLevel(): void;
}

export interface LevelData {
  levelId: number;
  character: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  unlocked: boolean;
  targetScore: number;
  timeLimit?: number;
  backgroundPath: string;
  musicPath: string;
}
```

### 3. УСТАНОВИТЬ ЗАВИСИМОСТИ

```bash
npm install --save-dev typescript @types/node
npm install --save phaser
npm install --save-dev webpack webpack-cli ts-loader html-webpack-plugin copy-webpack-plugin
```

### 4. СОЗДАТЬ СТРУКТУРУ ПАПОК

```
src/
├── types/
│   ├── game.types.ts
│   ├── character.types.ts
│   ├── manager.types.ts
│   ├── ui.types.ts
│   └── scene.types.ts
├── managers/
├── ui/
├── objects/
├── scenes/
├── utils/
└── game.ts
```

### 5. ОБНОВИТЬ .gitignore

```
# TypeScript
dist/
*.tsbuildinfo

# Build artifacts
build/
out/

# IDE
.vscode/
.idea/

# Dependencies
node_modules/
```

---

## ✅ CHECKLIST

- [ ] Создать tsconfig.json
- [ ] Обновить package.json
- [ ] Создать webpack.config.js
- [ ] Создать все типы в types/
- [ ] Установить зависимости
- [ ] Создать структуру папок src/
- [ ] Обновить .gitignore
- [ ] Протестировать сборку
- [ ] Настроить VS Code для TypeScript
- [ ] Создать npm scripts для разработки

---

## 🎯 РЕЗУЛЬТАТ ЭТАПА

После завершения этого этапа:
- ✅ TypeScript окружение настроено
- ✅ Базовые типы созданы
- ✅ Структура проекта подготовлена
- ✅ Сборка работает
- ✅ VS Code поддерживает автодополнение

**Время выполнения**: 1-2 дня
