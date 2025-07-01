# PSU Survivor Titanium Hunt - План перехода на TypeScript

## 📋 АНАЛИЗ ПРОЕКТА

### Структура проекта:
- **Phaser 3** игра на JavaScript
- **60+ файлов** в сложной архитектуре
- **Менеджеры**: ConfigManager, AudioManager, EventManager, ObjectPoolManager  
- **Персонажи**: 3 персонажа с уникальными способностями
- **UI**: Кастомные UI компоненты (CyberButton, CyberCard, etc.)
- **Сцены**: Игровые уровни + UI сцены

### Основные проблемы:
1. **Глобальные переменные** в `window` объекте
2. **Отсутствует типизация** - много ошибок во время выполнения
3. **Дублирование кода** в персонажах и UI
4. **Неоптимальная архитектура** - смешение логики
5. **Отсутствие интерфейсов** для менеджеров и компонентов
6. **Много console.log** для отладки

---

## 🎯 ПЛАН ПЕРЕХОДА НА TYPESCRIPT

### ЭТАП 1: ПОДГОТОВКА И НАСТРОЙКА (Приоритет: ВЫСОКИЙ)
- [ ] Создать `tsconfig.json`
- [ ] Настроить Webpack/Rollup для TypeScript
- [ ] Установить типы для Phaser 3
- [ ] Создать базовые типы и интерфейсы

### ЭТАП 2: БАЗОВЫЕ ТИПЫ И ИНТЕРФЕЙСЫ (Приоритет: ВЫСОКИЙ)  
- [ ] Создать базовые интерфейсы для всех менеджеров
- [ ] Создать типы для игровых объектов
- [ ] Создать типы для конфигурации

### ЭТАП 3: МЕНЕДЖЕРЫ (Приоритет: ВЫСОКИЙ)
- [ ] ConfigManager → TypeScript
- [ ] AudioManager → TypeScript  
- [ ] EventManager → TypeScript
- [ ] ObjectPoolManager → TypeScript

### ЭТАП 4: UI КОМПОНЕНТЫ (Приоритет: СРЕДНИЙ)
- [ ] CyberUIElement → TypeScript (базовый класс)
- [ ] CyberButton → TypeScript
- [ ] CyberCard → TypeScript
- [ ] CyberTitle → TypeScript
- [ ] CyberSwitch → TypeScript
- [ ] CyberBar → TypeScript

### ЭТАП 5: ИГРОВЫЕ ОБЪЕКТЫ (Приоритет: ВЫСОКИЙ)
- [ ] BaseCharacter → TypeScript
- [ ] CharacterFactory → TypeScript
- [ ] FrienderCharacter → TypeScript
- [ ] TraderCharacter → TypeScript
- [ ] ZummerCharacter → TypeScript

### ЭТАП 6: СЦЕНЫ (Приоритет: СРЕДНИЙ)
- [ ] GameLevelScene → TypeScript
- [ ] MenuScene → TypeScript
- [ ] CharacterSelectScene → TypeScript
- [ ] LevelSelectScene → TypeScript
- [ ] SettingsScene → TypeScript
- [ ] AboutScene → TypeScript

### ЭТАП 7: УТИЛИТЫ (Приоритет: НИЗКИЙ)
- [ ] levelManager → TypeScript
- [ ] progressManager → TypeScript
- [ ] animationUtils → TypeScript
- [ ] shader_utils → TypeScript

---

## 🔧 ОПТИМИЗАЦИЯ И РЕФАКТОРИНГ

### ПРОБЛЕМЫ ДЛЯ ИСПРАВЛЕНИЯ:

#### 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ (js/game.js)
```javascript
// ❌ ПРОБЛЕМА - глобальные переменные
window.player = null;
window.goodItems = null;
window.badItems = null;
window.score = 0;
window.health = 100;
```
**РЕШЕНИЕ**: Перенести в Registry или StateManager

#### 2. ДУБЛИРОВАНИЕ КОДА В ПЕРСОНАЖАХ
```javascript
// ❌ ДУБЛИРОВАНИЕ в каждом персонаже
window.health -= damage;
if (window.health <= 0) {
    window.gameOver = true;
}
```
**РЕШЕНИЕ**: Унифицировать в BaseCharacter

#### 3. НЕИСПОЛЬЗУЕМЫЕ ИМПОРТЫ
- `js/utils/uiUtils.js` - содержит устаревшие функции
- `js/scenes/base/game_level_ui.js` - некоторые функции не используются
- `js/objects/items.js` - избыточные console.log

#### 4. ФАБРИКИ НЕ ВЕЗДЕ ИСПОЛЬЗУЮТСЯ
- `CharacterFactory` используется не везде
- Нет фабрики для UI элементов
- Нет фабрики для предметов

#### 5. ОТСУТСТВИЕ ОБРАБОТКИ ОШИБОК
- Нет try/catch блоков
- Нет валидации конфигураций
- Нет обработки ошибок загрузки ресурсов

---

## 📁 ФАЙЛЫ ДЛЯ СОЗДАНИЯ/ИЗМЕНЕНИЯ

### 1. КОНФИГУРАЦИЯ TYPESCRIPT
```
01_setup/
├── tsconfig.json
├── webpack.config.ts
├── package.json (обновить)
└── .gitignore (обновить)
```

### 2. БАЗОВЫЕ ТИПЫ
```
02_types/
├── game.types.ts
├── character.types.ts
├── ui.types.ts
├── manager.types.ts
├── scene.types.ts
└── config.types.ts
```

### 3. МЕНЕДЖЕРЫ
```
03_managers/
├── ConfigManager.ts (из config_manager.js)
├── AudioManager.ts (из audio_manager.js)
├── EventManager.ts (из event_manager.js)
├── ObjectPoolManager.ts (из object_pool_manager.js)
└── index.ts (обновить)
```

### 4. UI КОМПОНЕНТЫ
```
04_ui/
├── CyberUIElement.ts
├── CyberButton.ts
├── CyberCard.ts
├── CyberTitle.ts
├── CyberSwitch.ts
├── CyberBar.ts
└── index.ts
```

### 5. ИГРОВЫЕ ОБЪЕКТЫ
```
05_objects/
├── characters/
│   ├── BaseCharacter.ts
│   ├── CharacterFactory.ts
│   ├── FrienderCharacter.ts
│   ├── TraderCharacter.ts
│   └── ZummerCharacter.ts
├── items/
│   ├── ItemFactory.ts (новый)
│   └── items.ts
└── player.ts
```

### 6. СЦЕНЫ
```
06_scenes/
├── base/
│   ├── GameLevelScene.ts
│   ├── game_level_create.ts
│   ├── game_level_update.ts
│   └── game_level_utils.ts
├── levels/
│   └── game_levels.ts
└── ui/
    ├── MenuScene.ts
    ├── CharacterSelectScene.ts
    ├── LevelSelectScene.ts
    ├── SettingsScene.ts
    └── AboutScene.ts
```

### 7. УТИЛИТЫ
```
07_utils/
├── levelManager.ts
├── progressManager.ts
├── animationUtils.ts
├── shader_utils.ts
└── uiScaler.ts
```

---

## 🚀 ПОРЯДОК ВЫПОЛНЕНИЯ РЕФАКТОРИНГА

### НЕДЕЛЯ 1: ПОДГОТОВКА
1. Настройка TypeScript окружения
2. Создание базовых типов и интерфейсов
3. Настройка сборки

### НЕДЕЛЯ 2: МЕНЕДЖЕРЫ
1. ConfigManager → TypeScript
2. AudioManager → TypeScript
3. EventManager → TypeScript
4. ObjectPoolManager → TypeScript

### НЕДЕЛЯ 3: UI И БАЗОВЫЕ КЛАССЫ
1. CyberUIElement → TypeScript
2. Все UI компоненты → TypeScript
3. BaseCharacter → TypeScript

### НЕДЕЛЯ 4: ПЕРСОНАЖИ И ФАБРИКИ
1. CharacterFactory → TypeScript
2. Все персонажи → TypeScript
3. ItemFactory (создать новый)

### НЕДЕЛЯ 5: СЦЕНЫ
1. GameLevelScene → TypeScript
2. Все UI сцены → TypeScript
3. Игровые уровни → TypeScript

### НЕДЕЛЯ 6: УТИЛИТЫ И ОПТИМИЗАЦИЯ
1. Все utilities → TypeScript
2. Удаление неиспользуемого кода
3. Оптимизация производительности

---

## 📊 ПРИОРИТЕТЫ ЗАДАЧ

### КРИТИЧЕСКИЙ ПРИОРИТЕТ ⚠️
- [ ] Убрать глобальные переменные
- [ ] Создать типы для всех менеджеров
- [ ] Настроить TypeScript окружение

### ВЫСОКИЙ ПРИОРИТЕТ 🔥
- [ ] Менеджеры → TypeScript
- [ ] BaseCharacter → TypeScript
- [ ] CharacterFactory → TypeScript

### СРЕДНИЙ ПРИОРИТЕТ 📋
- [ ] UI компоненты → TypeScript
- [ ] Сцены → TypeScript
- [ ] Обработка ошибок

### НИЗКИЙ ПРИОРИТЕТ 📝
- [ ] Утилиты → TypeScript
- [ ] Оптимизация performance
- [ ] Удаление console.log

---

## 🔍 НЕИСПОЛЬЗУЕМЫЙ КОД

### ФАЙЛЫ ДЛЯ ПРОВЕРКИ:
1. `js/utils/uiUtils.js` - функция `createCyberSwitch` устарела
2. `js/scenes/base/game_level_ui.js` - некоторые функции не используются
3. `js/objects/items.js` - много отладочного кода
4. `js/utils/shader_utils.js` - избыточные console.log

### ДУБЛИРУЮЩИЙСЯ КОД:
1. Логика урона в каждом персонаже
2. Настройка UI в каждой сцене
3. Загрузка конфигурации в разных местах

---

## 🎯 КОНЕЧНАЯ ЦЕЛЬ

Получить **типобезопасную**, **производительную** и **легко поддерживаемую** кодовую базу с:
- ✅ Полной типизацией TypeScript
- ✅ Современной архитектурой
- ✅ Отсутствием дублирования кода
- ✅ Правильной обработкой ошибок
- ✅ Оптимизированной производительностью
