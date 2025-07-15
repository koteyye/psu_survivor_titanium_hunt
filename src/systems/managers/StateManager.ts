import { EventManager } from './EventManager';

// Temporary types until we create proper type files
interface GameStats {
  score: number;
  health: number;
  maxHealth: number;
  gameOver: boolean;
  level: number;
}

export interface GameState extends GameStats {
  itemSpawnTime: number;
  selectedCharacter: string | null;
  currentLevel: number;
  paused: boolean;
}

export class StateManager {
  private static instance: StateManager;
  private eventManager: EventManager;
  private state: GameState;

  private constructor() {
    this.eventManager = EventManager.getInstance();
    this.state = this.getInitialState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private getInitialState(): GameState {
    return {
      score: 0,
      health: 100,
      maxHealth: 100,
      gameOver: false,
      level: 1,
      itemSpawnTime: 0,
      selectedCharacter: null,
      currentLevel: 1,
      paused: false
    };
  }

  public getState(): Readonly<GameState> {
    return { ...this.state };
  }

  public setState(updates: Partial<GameState>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Уведомляем подписчиков об изменении состояния
    this.eventManager.emit('STATE_CHANGED', {
      prevState,
      currentState: this.state,
      updates
    });
  }

  public resetState(): void {
    this.setState(this.getInitialState());
  }

  // Удобные методы для часто используемых операций
  public addScore(points: number): void {
    this.setState({ score: this.state.score + points });
  }

  public takeDamage(damage: number): void {
    const newHealth = Math.max(0, this.state.health - damage);
    const gameOver = newHealth <= 0;
    this.setState({ health: newHealth, gameOver });
  }

  public restoreHealth(amount: number): void {
    const newHealth = Math.min(this.state.maxHealth, this.state.health + amount);
    this.setState({ health: newHealth });
  }

  public setGameOver(gameOver: boolean): void {
    this.setState({ gameOver });
  }

  public togglePause(): void {
    this.setState({ paused: !this.state.paused });
  }

  public selectCharacter(characterId: string): void {
    this.setState({ selectedCharacter: characterId });
  }

  public setLevel(level: number): void {
    this.setState({ level, currentLevel: level });
  }

  public updateItemSpawnTime(time: number): void {
    this.setState({ itemSpawnTime: time });
  }
}
