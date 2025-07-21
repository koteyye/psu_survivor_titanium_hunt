// Утилиты для работы с анимациями
export { AnimationUtils } from './AnimationUtils';

// Утилиты для работы с шейдерами
export { ShaderUtils } from './ShaderUtils';

// Утилиты для работы с масштабированием UI
export { UIScaler } from './UIScaler';

// Утилиты для работы с шрифтами
export { FontUtils } from './FontUtils';

// Test utilities (for development)
export { testFontUtils } from './FontUtils.test';

// Менеджер уровней
export { LevelManager } from './LevelManager';

// Менеджер прогресса и достижений
export { ProgressManager } from './ProgressManager';

// Temporary exports for compatibility
import { LevelManager } from './LevelManager';
import { ProgressManager } from './ProgressManager';

export const levelManager = LevelManager.getInstance();
export const progressManager = ProgressManager.getInstance();
export const ACHIEVEMENTS = {};
