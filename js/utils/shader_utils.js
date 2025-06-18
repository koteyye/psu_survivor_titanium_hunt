// Утилиты для работы с шейдерами

/**
 * Класс шейдера свечения для супер-взрывов
 */
export class GlowPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    constructor(game) {
        super({
            game,
            fragShader: `
            precision mediump float;

            uniform sampler2D uMainSampler;
            varying vec2 outTexCoord;

            void main() {
                // Основной цвет текстуры
                vec4 color = texture2D(uMainSampler, outTexCoord);
                
                // Параметры свечения
                float glowSize = 0.01; // Размер свечения
                float glowIntensity = 1.2; // Интенсивность свечения
                vec4 glowColor = vec4(0.0, 0.6, 1.0, 1.0); // Синий цвет свечения
                
                // Создаем простое свечение, выходящее за пределы текстуры
                vec4 glow = vec4(0.0);
                
                // Семплируем текстуру вокруг текущего пикселя (упрощенная версия)
                for (float i = -2.0; i <= 2.0; i += 1.0) {
                    for (float j = -2.0; j <= 2.0; j += 1.0) {
                        vec2 offset = vec2(i * glowSize, j * glowSize);
                        vec4 sampleColor = texture2D(uMainSampler, outTexCoord + offset);
                        glow += sampleColor * 0.2; // Добавляем к свечению
                    }
                }
                
                // Смешиваем оригинальный цвет с эффектом свечения
                vec4 finalColor = color + glow * glowColor * glowIntensity * color.a;
                
                // Усиливаем синий канал для более яркого синего свечения
                finalColor.b = min(1.0, finalColor.b * 1.2);
                
                gl_FragColor = finalColor;
            }
            `
        });
    }
}

/**
 * Инициализирует шейдеры в сцене
 * @param {Phaser.Scene} scene - Сцена для инициализации шейдеров
 */
export function initShaders(scene) {
    // Проверяем, существует ли уже пайплайн с именем 'Glow'
    if (!scene.renderer.pipelines.has('Glow')) {
        // Добавляем шейдер свечения только если его еще нет
        scene.renderer.pipelines.add('Glow', new GlowPipeline(scene.game));
        console.log('Шейдер свечения успешно инициализирован');
    } else {
        console.log('Шейдер свечения уже существует, пропускаем инициализацию');
    }
}