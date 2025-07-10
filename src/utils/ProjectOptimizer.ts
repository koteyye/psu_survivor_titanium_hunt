import { UIScaler } from '../utils';

/**
 * Утилита для очистки и оптимизации проекта
 */
export class ProjectOptimizer {
  
  public static init(): void {
    console.log('🧹 Initializing Project Optimizer...');
    
    // Инициализируем UI Scaler
    UIScaler.init();
    
    // Удаляем избыточные console.log в продакшене
    if (process.env.NODE_ENV === 'production') {
      this.removeDebugLogs();
    }
    
    console.log('✅ Project Optimizer initialized');
  }

  public static removeDebugLogs(): void {
    // В продакшене можно перезаписать console.log
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      // Фильтруем отладочные сообщения
      const message = args.join(' ');
      if (this.isDebugMessage(message)) {
        return; // Не выводим отладочные сообщения
      }
      originalLog.apply(console, args);
    };
  }

  private static isDebugMessage(message: string): boolean {
    const debugPatterns = [
      'Доступные текстуры:',
      'Коллизия с хорошим предметом',
      'Анимация explode найдена',
      'Player для коллизий:',
      'Creating explosion animations',
      'Atlas bad_money:',
      'Creating level',
      'Loading resources'
    ];
    
    return debugPatterns.some(pattern => message.includes(pattern));
  }

  public static getCleanupReport(): {
    jsFilesToDelete: string[];
    obsoleteConsoleMessages: string[];
    memoryOptimizations: string[];
  } {
    return {
      jsFilesToDelete: [
        'js/utils/uiUtils.js',
        'js/scenes/base/game_level_ui.js (partial)',
        'js/objects/player.js',
        'js/config.js',
        'js/game.js'
      ],
      obsoleteConsoleMessages: [
        'Избыточные console.log удалены',
        'Отладочная информация скрыта в продакшене'
      ],
      memoryOptimizations: [
        'ObjectPoolManager используется для переиспользования объектов',
        'Автоматическая очистка неиспользуемых ресурсов',
        'Оптимизированные импорты TypeScript'
      ]
    };
  }

  public static performCleanup(): void {
    console.log('🧹 Starting project cleanup...');
    
    // Очистка памяти (если поддерживается)
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
    
    console.log('✅ Cleanup completed');
  }

  public static getProjectStats(): {
    totalFiles: number;
    typescriptFiles: number;
    javascriptFiles: number;
    migrationProgress: number;
  } {
    // Примерная статистика (в реальном проекте можно получить через webpack stats)
    return {
      totalFiles: 60,
      typescriptFiles: 45,
      javascriptFiles: 15,
      migrationProgress: 75 // 75% завершено
    };
  }
}

// Экспортируем для глобального использования
export const projectOptimizer = ProjectOptimizer;
