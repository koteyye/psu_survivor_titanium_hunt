export type EventCallback<T = any> = (data: T) => void;

export interface GameEvents {
  // Состояние игры
  'STATE_CHANGED': { prevState: any; currentState: any; updates: any };
  'GAME_OVER': { score: number; reason: string };
  'GAME_RESTART': void;
  'LEVEL_COMPLETE': { levelId: number; score: number };
  
  // UI события
  'UI_UPDATE': { 
    score?: number; 
    health?: number;
    combo?: number;
    multiplier?: number;
    basket?: number;
    money?: number;
    marketMultiplier?: number;
    sellCooldown?: number;
    rage?: number;
    maxRage?: number;
    rageMode?: boolean;
    rageTimer?: number;
    trader_dead?: boolean;
    trader_destroyed?: boolean;
    market_analysis?: boolean;
    rage_mode?: boolean;
  };
  'BUTTON_CLICKED': { buttonId: string };
  
  // Персонажи - основные события
  'CHARACTER_CREATED': { characterId: string; character: any };
  'CHARACTER_SELECTED': { characterId: string };
  'CHARACTER_DAMAGED': { damage: number; health: number };
  
  // Персонажи - детальные события
  'character_health_changed': { characterId: string; oldHealth: number; newHealth: number; maxHealth: number; damage?: number; heal?: number };
  'character_level_up': { characterId: string; oldLevel: number; newLevel: number; unlockedSkills: string[] };
  'character_skill_unlocked': { characterId: string; skillId: string; level: number };
  'character_skill_used': { characterId: string; skillId: string; success: boolean };
  'character_state_changed': { characterId: string; oldState: any; newState: any; reason?: string };
  'character_died': { characterId: string };
  'character_experience_gained': { characterId: string; oldExperience: number; newExperience: number; gained: number };
  
  // Предметы
  'ITEM_COLLECTED': { itemType: string; value: number };
  'EXPLOSION_CREATED': { x: number; y: number; type: string };
  
  // Аудио
  'SOUND_PLAY': { key: string; config?: any };
  'MUSIC_CHANGE': { key: string };
}

export class EventManager {
  private static instance: EventManager;
  private listeners: Map<keyof GameEvents, Set<EventCallback>> = new Map();

  private constructor() {}

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  public on<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  public off<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  public emit<K extends keyof GameEvents>(
    event: K,
    data: GameEvents[K]
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public once<K extends keyof GameEvents>(
    event: K,
    callback: EventCallback<GameEvents[K]>
  ): void {
    const onceCallback = (data: GameEvents[K]) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  public removeAllListeners(event?: keyof GameEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  public getListenerCount(event: keyof GameEvents): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Подписка с автоматическим контекстом
   */
  public onWithContext<K extends keyof GameEvents>(
    eventName: K,
    callback: EventCallback<GameEvents[K]>,
    context?: unknown
  ): () => void {
    const boundCallback = context ? callback.bind(context) : callback;
    this.on(eventName, boundCallback);
    
    // Возвращаем функцию для отписки
    return () => this.off(eventName, boundCallback);
  }

  /**
   * Подписка на события сцены с автоматической очисткой
   */
  public onSceneEvent<K extends keyof GameEvents>(
    scene: Phaser.Scene,
    eventName: K,
    callback: EventCallback<GameEvents[K]>
  ): () => void {
    const unsubscribe = this.onWithContext(eventName, callback);
    
    // Автоматическая отписка при уничтожении сцены
    if (scene && scene.events && typeof scene.events.once === 'function') {
      scene.events.once('shutdown', unsubscribe);
      scene.events.once('destroy', unsubscribe);
    }

    return unsubscribe;
  }
}
