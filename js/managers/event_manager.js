/**
 * Singleton-менеджер для управления событиями в игре (Event Bus)
 */
export class EventManager {
    constructor() {
        // Объект для хранения подписчиков на события
        this.subscribers = {};
        
        // Объект для хранения последних значений событий
        this.lastValues = {};
    }
    
    /**
     * Получение экземпляра синглтона
     * @returns {EventManager} Экземпляр EventManager
     */
    static getInstance() {
        if (!EventManager.instance) {
            EventManager.instance = new EventManager();
        }
        return EventManager.instance;
    }
    
    /**
     * Подписка на событие
     * @param {string} eventName - Имя события
     * @param {Function} callback - Функция обратного вызова
     * @param {Object} context - Контекст выполнения функции
     * @returns {Object} Объект подписки для отписки
     */
    subscribe(eventName, callback, context = null) {
        if (!this.subscribers[eventName]) {
            this.subscribers[eventName] = [];
        }
        
        const subscriber = { callback, context };
        this.subscribers[eventName].push(subscriber);
        
        // Если есть последнее значение для этого события, сразу вызываем callback
        if (this.lastValues[eventName] !== undefined) {
            callback.call(context, this.lastValues[eventName]);
        }
        
        // Возвращаем объект подписки для возможности отписки
        return { eventName, subscriber };
    }
    
    /**
     * Отписка от события
     * @param {Object} subscription - Объект подписки, возвращенный методом subscribe
     */
    unsubscribe(subscription) {
        const { eventName, subscriber } = subscription;
        
        if (!this.subscribers[eventName]) return;
        
        const index = this.subscribers[eventName].indexOf(subscriber);
        if (index !== -1) {
            this.subscribers[eventName].splice(index, 1);
        }
        
        // Если подписчиков больше нет, удаляем массив
        if (this.subscribers[eventName].length === 0) {
            delete this.subscribers[eventName];
        }
    }
    
    /**
     * Отписка всех подписчиков от события
     * @param {string} eventName - Имя события
     */
    unsubscribeAll(eventName) {
        delete this.subscribers[eventName];
    }
    
    /**
     * Отправка события всем подписчикам
     * @param {string} eventName - Имя события
     * @param {*} data - Данные события
     * @param {boolean} store - Сохранять ли последнее значение
     */
    emit(eventName, data = null, store = false) {
        // Сохраняем последнее значение, если нужно
        if (store) {
            this.lastValues[eventName] = data;
        }
        
        // Если нет подписчиков, просто выходим
        if (!this.subscribers[eventName]) return;
        
        // Вызываем все колбэки подписчиков
        this.subscribers[eventName].forEach(subscriber => {
            const { callback, context } = subscriber;
            try {
                callback.call(context, data);
            } catch (error) {
                console.error(`Ошибка при обработке события ${eventName}:`, error);
            }
        });
    }
    
    /**
     * Получение последнего значения события
     * @param {string} eventName - Имя события
     * @returns {*} Последнее значение события или undefined
     */
    getLastValue(eventName) {
        return this.lastValues[eventName];
    }
    
    /**
     * Очистка всех подписчиков и последних значений
     */
    clear() {
        this.subscribers = {};
        this.lastValues = {};
    }
    
    /**
     * Подписка на событие с автоматической отпиской при уничтожении сцены
     * @param {Phaser.Scene} scene - Сцена
     * @param {string} eventName - Имя события
     * @param {Function} callback - Функция обратного вызова
     * @returns {Object} Объект подписки для отписки
     */
    subscribeScene(scene, eventName, callback) {
        const subscription = this.subscribe(eventName, callback, scene);
        
        // Добавляем обработчик события shutdown для автоматической отписки
        scene.events.once('shutdown', () => {
            this.unsubscribe(subscription);
        });
        
        return subscription;
    }
}