# ЭТАП 3: ОЧИСТКА И УДАЛЕНИЕ НЕИСПОЛЬЗУЕМОГО КОДА

## 📋 TODO - НЕМЕДЛЕННАЯ ОЧИСТКА ПРОЕКТА
**Приоритет**: КРИТИЧЕСКИЙ 🔴  
**Время**: 1 день

---

## 🗑️ ФАЙЛЫ ДЛЯ ПОЛНОГО УДАЛЕНИЯ

### 1. js/utils/uiUtils.js - УДАЛИТЬ ПОЛНОСТЬЮ
**Причина**: Полностью устарел, заменен на TypeScript компоненты

```bash
# Команда для удаления
rm js/utils/uiUtils.js
```

**Что заменяет:**
- `createCyberSwitch()` → `CyberSwitch.ts`
- `createCyberButton()` → `CyberButton.ts`  
- `createNeonTitle()` → `CyberTitle.ts`
- `createTechText()` → `CyberTitle.ts`

### 2. js/objects/player.js - УДАЛИТЬ ПОЛНОСТЬЮ
**Причина**: Заменен на BaseCharacter архитектуру

```bash
# Команда для удаления  
rm js/objects/player.js
```

**Что заменяет:**
- `restartGame()` → `StateManager.resetState()`
- Логика игрока → `BaseCharacter.ts`

### 3. js/utils/assetLoader.js - УДАЛИТЬ ПОЛНОСТЬЮ
**Причина**: Функции создания заглушек не используются

```bash
# Команда для удаления
rm js/utils/assetLoader.js
```

---

## ✂️ ЧАСТИЧНАЯ ОЧИСТКА ФАЙЛОВ

### 1. js/scenes/base/game_level_ui.js
**Удалить функции:**
```javascript
// ❌ УДАЛИТЬ - дублирует EventManager
export function updateGameUI(scene, gameData) {
    // ... 50 строк
}

// ❌ УДАЛИТЬ - дублирует новую систему  
export function showGameOverUI(scene, options) {
    // ... 40 строк
}
```

**Оставить только:**
```javascript
// ✅ ОСТАВИТЬ - уникальная логика UI
export function createGameUI(scene, options = {}) {
    // Создание базовых UI элементов уровня
}
```

### 2. js/objects/items.js
**Удалить отладочные console.log:**
```javascript
// ❌ УДАЛИТЬ ВСЕ ЭТИ СТРОКИ:
console.log('Настраиваем коллизии предметов...');
console.log('Player для коллизий:', player);
console.log('Player тип:', typeof player);
console.log('Player конструктор:', player.constructor.name);
console.log('Пулы:', { goodItems, badItems, veryGoodItems });
console.log('Настраиваем коллизии со стенами...');
// И ещё 5+ аналогичных
```

---

## 🧹 ГЛОБАЛЬНАЯ ОЧИСТКА CONSOLE.LOG

### Список файлов для очистки:

#### js/utils/animationUtils.js (15 console.log):
```javascript
// ❌ УДАЛИТЬ ВСЕ:
console.log('Создание анимаций взрывов...');
console.log('Доступные текстуры:', Object.keys(scene.textures.list));
console.log(`Атлас bad_money: ${badMoneyAtlas ? 'загружен' : 'НЕ НАЙДЕН'}`);
console.log(`Атлас good_super: ${goodSuperAtlas ? 'загружен' : 'НЕ НАЙДЕН'}`);
console.log(`Текстура explosion: ${explosionTexture ? 'загружена' : 'НЕ НАЙДЕНА'}`);
console.log('Кадры bad_money:', badMoneyFrames);
console.log('Кадры good_super:', goodSuperFrames);
console.log('Анимация explosion_simple создана');
console.log('Анимация explode создана');
console.log('Анимация good_explode создана');
console.log('Анимация super_explode создана');
console.log('Анимация money_explode создана');
console.log('Анимации взрывов успешно созданы');
```

#### js/managers/config_manager.js (6 console.log):
```javascript
// ❌ УДАЛИТЬ ВСЕ:
console.log(`Конфиг ${key} успешно загружен из кэша`);
console.log('Конфигурации успешно загружены в ConfigManager!');
// И ещё 4 аналогичных
```

#### js/objects/characters/trader_character/trader_skills.js:
```javascript
// ❌ УДАЛИТЬ ВСЕ:
console.log('sellBasket called!');
console.log('Cooldown active:', this.sellCooldown);
console.log('Basket is empty:', this.basket);
console.log('Checking graph...');
console.error('Ошибка при запуске анимации плохого взрыва:', error);
// И ещё 3+ аналогичных
```

#### js/scenes/base/game_level_preload.js:
```javascript
// ❌ УДАЛИТЬ ВСЕ:
console.log(`Начало загрузки ресурсов для уровня ${scene.levelId}`);
console.log(`Прогресс загрузки: ${Math.round(value * 100)}%`);
// И ещё 2 аналогичных
```

#### js/utils/shader_utils.js:
```javascript
// ❌ УДАЛИТЬ ВСЕ:
console.log('Шейдер свечения успешно инициализирован');
console.log('Шейдер свечения уже существует, пропускаем инициализацию');
```

#### js/objects/characters/character_factory.js:
```javascript
// ❌ УДАЛИТЬ:
console.log(`Создаем персонажа с ID: ${characterId}`);
console.warn(`Неизвестный ID персонажа: ${characterId}, используем Friender по умолчанию`);
console.warn(`Неизвестный тип персонажа: ${characterType}, используем Friender по умолчанию`);
console.error('Не удалось загрузить конфиг characters/info');
console.error('Не удалось загрузить конфиги персонажей');
```

---

## 🔧 АВТОМАТИЧЕСКИЙ СКРИПТ ОЧИСТКИ

### cleanup.js
```javascript
const fs = require('fs');
const path = require('path');

// Файлы для полного удаления
const filesToDelete = [
    'js/utils/uiUtils.js',
    'js/objects/player.js', 
    'js/utils/assetLoader.js'
];

// Удаление файлов
filesToDelete.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`✅ Удален: ${file}`);
    } else {
        console.log(`⚠️ Файл не найден: ${file}`);
    }
});

// Функция для удаления console.log из файла
function removeConsoleLogs(filePath) {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️ Файл не найден: ${filePath}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Удаляем различные варианты console.log
    const patterns = [
        /console\.log\([^)]*\);\s*\n?/g,
        /console\.warn\([^)]*\);\s*\n?/g,
        /console\.info\([^)]*\);\s*\n?/g,
    ];
    
    let originalLength = content.length;
    
    patterns.forEach(pattern => {
        content = content.replace(pattern, '');
    });
    
    // Удаляем пустые строки, оставшиеся после удаления console.log
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    if (content.length !== originalLength) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Очищен от console.log: ${filePath}`);
    }
}

// Файлы для очистки от console.log
const filesToClean = [
    'js/utils/animationUtils.js',
    'js/managers/config_manager.js',
    'js/objects/items.js',
    'js/objects/characters/trader_character/trader_skills.js',
    'js/scenes/base/game_level_preload.js',
    'js/utils/shader_utils.js',
    'js/objects/characters/character_factory.js',
    'js/scenes/ui/menuScene.js',
    'js/utils/levelUtils.js',
    'js/utils/progressManager.js'
];

filesToClean.forEach(removeConsoleLogs);

console.log('\n🎉 Очистка завершена!');
```

### Запуск очистки:
```bash
node cleanup.js
```

---

## 📝 ОБНОВЛЕНИЕ ИМПОРТОВ

После удаления файлов нужно обновить импорты:

### js/game.js - удалить импорт player.js:
```javascript
// ❌ УДАЛИТЬ ЭТУ СТРОКУ:
// import './objects/player.js'; // Если есть

// ✅ ОСТАВИТЬ ВСЕ ОСТАЛЬНЫЕ ИМПОРТЫ
```

### js/scenes/base/game_level_scene.js - обновить импорты:
```javascript
// ❌ УДАЛИТЬ:
// import { restartGame } from '../../objects/player.js';

// ✅ ЗАМЕНИТЬ НА:
import { StateManager } from '../../managers/StateManager.js'; // Когда будет создан
```

---

## ✅ ЧЕКЛИСТ ЭТАПА ОЧИСТКИ

### Удаление файлов:
- [ ] Удален `js/utils/uiUtils.js`
- [ ] Удален `js/objects/player.js`  
- [ ] Удален `js/utils/assetLoader.js`

### Очистка console.log:
- [ ] Очищен `js/utils/animationUtils.js` (15 console.log)
- [ ] Очищен `js/managers/config_manager.js` (6 console.log)
- [ ] Очищен `js/objects/items.js` (11 console.log)
- [ ] Очищен `js/objects/characters/trader_character/trader_skills.js` (8 console.log)
- [ ] Очищен `js/scenes/base/game_level_preload.js` (4 console.log)
- [ ] Очищен `js/utils/shader_utils.js` (2 console.log)
- [ ] Очищен `js/objects/characters/character_factory.js` (5 console.log)

### Частичная очистка:
- [ ] Удалены устаревшие функции из `js/scenes/base/game_level_ui.js`
- [ ] Обновлены импорты в затронутых файлах
- [ ] Проверена работоспособность после удаления

### Проверка:
- [ ] Игра запускается без ошибок
- [ ] Все функции работают корректно
- [ ] Импорты не содержат ссылок на удаленные файлы

---

## 📊 РЕЗУЛЬТАТ ОЧИСТКИ

**Удалено файлов:** 3  
**Удалено строк кода:** ~511 строк  
**Удалено console.log:** ~51 вызов  
**Уменьшение размера:** ~15-20%

**Следующий этап:** После очистки можно продолжить с TypeScript миграцией без устаревшего кода.

---

*⚠️ ВНИМАНИЕ: Сделайте резервную копию проекта перед выполнением очистки!*
