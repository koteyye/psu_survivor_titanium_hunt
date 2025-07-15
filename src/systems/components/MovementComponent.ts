import { Position, CharacterState } from '../../core/types';
import { PHYSICS_CONSTANTS } from '../../core/constants';

/**
 * Компонент для управления движением персонажа
 * Отвечает за физику, анимации движения, коллизии
 */
export class MovementComponent {
  private sprite: Phaser.GameObjects.Sprite;
  private scene: Phaser.Scene;
  private characterId: string;
  private baseSpeed: number;
  private speedMultiplier: number = 1;
  private currentState: CharacterState = CharacterState.IDLE;

  constructor(
    characterId: string,
    sprite: Phaser.GameObjects.Sprite,
    scene: Phaser.Scene,
    baseSpeed: number
  ) {
    this.characterId = characterId;
    this.sprite = sprite;
    this.scene = scene;
    this.baseSpeed = baseSpeed;
  }

  /**
   * Движение к точке
   */
  public moveToPosition(targetX: number, targetY: number): void {
    if (!this.canMove()) {
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) {
      return;
    }

    // Вычисляем направление
    const dx = targetX - this.sprite.x;
    const dy = targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) { // Минимальное расстояние для движения
      const speed = this.getCurrentSpeed();
      body.setVelocity(
        (dx / distance) * speed,
        (dy / distance) * speed
      );
      
      this.updateState(CharacterState.MOVING);
      this.updateDirection(dx);
    } else {
      this.stop();
    }
  }

  /**
   * Движение в направлении
   */
  public moveInDirection(directionX: number, directionY: number): void {
    if (!this.canMove()) {
      return;
    }

    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) {
      return;
    }

    const speed = this.getCurrentSpeed();
    body.setVelocity(directionX * speed, directionY * speed);
    
    this.updateState(CharacterState.MOVING);
    this.updateDirection(directionX);
  }

  /**
   * Остановка движения
   */
  public stop(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
    }
    
    this.updateState(CharacterState.IDLE);
  }

  /**
   * Телепортация в точку
   */
  public teleport(x: number, y: number): void {
    this.sprite.setPosition(x, y);
    this.stop();
  }

  /**
   * Толчок (от взрыва, атаки и т.д.)
   */
  public applyImpulse(forceX: number, forceY: number): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(
        body.velocity.x + forceX,
        body.velocity.y + forceY
      );
    }
  }

  /**
   * Проверка возможности движения
   */
  private canMove(): boolean {
    return this.currentState !== CharacterState.DEAD && 
           this.currentState !== CharacterState.STUNNED;
  }

  /**
   * Получение текущей скорости с модификаторами
   */
  private getCurrentSpeed(): number {
    return Math.floor(this.baseSpeed * this.speedMultiplier);
  }

  /**
   * Обновление направления спрайта
   */
  private updateDirection(deltaX: number): void {
    if (Math.abs(deltaX) > 0.1) {
      this.sprite.setFlipX(deltaX < 0);
    }
  }

  /**
   * Обновление состояния движения
   */
  private updateState(newState: CharacterState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.updateAnimation();
    }
  }

  /**
   * Обновление анимации в зависимости от состояния
   */
  private updateAnimation(): void {
    const currentAnim = this.sprite.anims.currentAnim;
    
    switch (this.currentState) {
      case CharacterState.IDLE:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_idle`) {
          this.sprite.play(`${this.characterId}_idle`);
        }
        break;
      case CharacterState.MOVING:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_walk`) {
          this.sprite.play(`${this.characterId}_walk`);
        }
        break;
      case CharacterState.ATTACKING:
        if (!currentAnim || currentAnim.key !== `${this.characterId}_attack`) {
          this.sprite.play(`${this.characterId}_attack`);
        }
        break;
    }
  }

  /**
   * Обновление каждый кадр
   */
  public update(): void {
    this.checkMovementState();
  }

  /**
   * Проверка состояния движения
   */
  private checkMovementState(): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (!body) {
      return;
    }

    const velocity = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    
    if (velocity < 10 && this.currentState === CharacterState.MOVING) {
      this.updateState(CharacterState.IDLE);
    } else if (velocity >= 10 && this.currentState === CharacterState.IDLE) {
      this.updateState(CharacterState.MOVING);
    }
  }

  /**
   * Установка границ движения
   */
  public setWorldBounds(enable: boolean = true): void {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setCollideWorldBounds(enable);
    }
  }

  /**
   * Настройка физического тела
   */
  public setupPhysics(colliderRadius?: number): void {
    if (!this.scene.physics || !this.scene.physics.world) {
      console.warn(`Physics not available for character ${this.characterId}`);
      return;
    }

    this.scene.physics.world.enable(this.sprite);
    
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      const radius = colliderRadius || Math.min(this.sprite.width, this.sprite.height) / 2;
      body.setCircle(radius);
      body.setCollideWorldBounds(true);
      
      // Устанавливаем параметры физики
      body.setDrag(400, 400); // Сопротивление для плавной остановки
      body.setBounce(0, 0); // Без отскоков
      body.setMaxVelocity(this.getCurrentSpeed() * 1.5); // Максимальная скорость
    }
  }

  /**
   * Модификаторы скорости
   */
  public setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(0.1, multiplier); // Минимум 10% от базовой скорости
  }

  public getSpeedMultiplier(): number {
    return this.speedMultiplier;
  }

  public setBaseSpeed(speed: number): void {
    this.baseSpeed = Math.max(50, speed); // Минимальная базовая скорость
  }

  public getBaseSpeed(): number {
    return this.baseSpeed;
  }

  /**
   * Геттеры позиции и состояния
   */
  public getPosition(): Position {
    return { x: this.sprite.x, y: this.sprite.y };
  }

  public getVelocity(): Position {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return body ? { x: body.velocity.x, y: body.velocity.y } : { x: 0, y: 0 };
  }

  public isMoving(): boolean {
    return this.currentState === CharacterState.MOVING;
  }

  public getMovementState(): CharacterState {
    return this.currentState;
  }

  /**
   * Проверка коллизий
   */
  public checkCollision(target: Phaser.GameObjects.GameObject): boolean {
    const body1 = this.sprite.body as Phaser.Physics.Arcade.Body;
    const body2 = target.body as Phaser.Physics.Arcade.Body;
    
    if (body1 && body2) {
      // Простая проверка пересечения через расстояние между центрами
      const dx = body1.center.x - body2.center.x;
      const dy = body1.center.y - body2.center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const minDistance = (body1.width + body2.width) / 4; // Примерное расстояние коллизии
      
      return distance < minDistance;
    }
    
    return false;
  }

  /**
   * Расчет расстояния до цели
   */
  public getDistanceTo(target: Position): number {
    const dx = target.x - this.sprite.x;
    const dy = target.y - this.sprite.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Проверка возможности достичь позицию
   */
  public canReachPosition(target: Position, maxDistance: number = 1000): boolean {
    return this.getDistanceTo(target) <= maxDistance;
  }

  /**
   * Принудительная установка состояния (для внешнего управления)
   */
  public forceState(state: CharacterState): void {
    this.currentState = state;
    this.updateAnimation();
  }

  /**
   * Очистка ресурсов
   */
  public destroy(): void {
    this.stop();
    
    // Отключаем физику
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = false;
    }
  }
}