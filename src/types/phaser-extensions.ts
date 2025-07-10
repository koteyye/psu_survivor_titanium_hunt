// Расширения для Phaser 3 - только дополнительные типы

export interface PhaserConfig {
  // Дополнительные настройки для конфига игры
  type?: number;
  width?: number;
  height?: number;
  parent?: string;
  backgroundColor?: string;
  scene?: any[];
  physics?: any;
  scale?: any;
  dom?: any;
}

export interface SceneTransitionData {
  previousScene?: string;
  data?: Record<string, any>;
}

// Типы для совместимости с Phaser
export interface PhaserSprite {
  x: number;
  y: number;
  width: number;
  height: number;
  scene: Phaser.Scene;
  body?: Phaser.Physics.Arcade.Body | null;
  characterType?: string;
  setScale(scale: number): this;
  play(key: string): this;
  setAlpha(alpha: number): this;
  destroy(fromScene?: boolean): void;
}
