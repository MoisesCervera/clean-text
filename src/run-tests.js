// Casos de prueba para normalizePunctuationSpaces
// Ejecutar con diferentes valores de preferredLanguage: 'en', 'es', 'fr'

const testCases = [
    // CASOS BÁSICOS DE PUNTUACIÓN
    {
        name: "Espacios básicos en puntuación",
        input: "Hola  ,   mundo !  ¿ Cómo   estás   ?",
        expected: {
            en: "Hola, mundo! ¿ Cómo estás?",
            es: "Hola, mundo! ¿Cómo estás?",
            fr: "Hola, mundo\u00A0! ¿ Cómo estás\u00A0?"
        }
    },

    // CASOS ESPECÍFICOS DE FRANCÉS
    {
        name: "Puntuación francesa con espacios no separables",
        input: "Bonjour!Comment allez-vous?Très bien;merci.",
        expected: {
            en: "Bonjour! Comment allez-vous? Très bien; merci.",
            es: "Bonjour! Comment allez-vous? Très bien; merci.",
            fr: "Bonjour\u00A0! Comment allez-vous\u00A0? Très bien\u00A0; merci."
        }
    },

    {
        name: "Guillemets franceses",
        input: "Il a dit«Bonjour»et puis«Au revoir».",
        expected: {
            en: 'Il a dit«Bonjour»et puis«Au revoir».',
            es: "Il a dit«Bonjour»et puis«Au revoir».",
            fr: "Il a dit « Bonjour » et puis « Au revoir »."
        }
    },

    {
        name: "Porcentajes en francés",
        input: "J'ai 50%de batterie.",
        expected: {
            en: "J'ai 50% de batterie.",
            es: "J'ai 50% de batterie.",
            fr: "J'ai 50\u00A0% de batterie."
        }
    },

    // CASOS ESPECÍFICOS DE ESPAÑOL
    {
        name: "Signos invertidos españoles",
        input: "Pero¿cómo estás?¡Qué bueno!",
        expected: {
            en: "Pero¿cómo estás? ¡Qué bueno!",
            es: "Pero ¿cómo estás? ¡Qué bueno!",
            fr: "Pero¿cómo estás\u00A0? ¡Qué bueno\u00A0!"
        }
    },

    {
        name: "Diálogos con raya española",
        input: "Él dijo:  —  Hola  —  y se fue.",
        expected: {
            en: "Él dijo: — Hola — y se fue.",
            es: "Él dijo: —Hola— y se fue.",
            fr: "Él dijo\u00A0: — Hola — y se fue."
        }
    },

    {
        name: "Decimales con coma española",
        input: "El precio es 12 , 50 euros.",
        expected: {
            en: "El precio es 12, 50 euros.",
            es: "El precio es 12,50 euros.",
            fr: "El precio es 12, 50 euros."
        }
    },

    // CASOS ESPECÍFICOS DE INGLÉS
    {
        name: "Decimales con punto inglés",
        input: "The price is $ 12 . 50 dollars.",
        expected: {
            en: "The price is $12.50 dollars.",
            es: "The price is $12. 50 dollars.",
            fr: "The price is $ 12. 50 dollars."
        }
    },

    {
        name: "Comillas inglesas con contexto",
        input: 'He said  "  Hello world  "  and left.',
        expected: {
            en: 'He said "Hello world" and left.',
            es: 'He said "Hello world" and left.',
            fr: 'He said "Hello world" and left.'
        }
    },

    // CASOS COMUNES A TODOS LOS IDIOMAS
    {
        name: "Puntos suspensivos",
        input: "Bueno. . .no sé....tal vez......",
        expected: {
            en: "Bueno...no sé...tal vez...",
            es: "Bueno...no sé...tal vez...",
            fr: "Bueno...no sé...tal vez..."
        }
    },

    {
        name: "Paréntesis y corchetes",
        input: "Texto( con paréntesis )y[ corchetes ] aquí.",
        expected: {
            en: "Texto (con paréntesis) y [corchetes] aquí.",
            es: "Texto (con paréntesis) y [corchetes] aquí.",
            fr: "Texto (con paréntesis) y [corchetes] aquí."
        }
    },

    {
        name: "Apostrofes en contracciones",
        input: "I ' m going to John ' s house.",
        expected: {
            en: "I'm going to John's house.",
            es: "I'm going to John's house.",
            fr: "I'm going to John's house."
        }
    },

    // CASOS CON ABREVIACIONES
    {
        name: "Abreviaciones protegidas",
        input: "El Dr. Smith dijo que etc. era importante.",
        expected: {
            en: "El Dr. Smith dijo que etc. era importante.",
            es: "El Dr. Smith dijo que etc. era importante.",
            fr: "El Dr. Smith dijo que etc. era importante."
        }
    },

    // CASOS CON CONTENIDO PROTEGIDO
    {
        name: "Código protegido",
        input: "Use `console.log(  'hello'  )` para debug.",
        expected: {
            en: "Use `console.log(  'hello'  )` para debug.",
            es: "Use `console.log(  'hello'  )` para debug.",
            fr: "Use `console.log(  'hello'  )` para debug."
        }
    },

    {
        name: "URLs protegidas",
        input: "Visita https://example.com/path?param=value para más info.",
        expected: {
            en: "Visita https://example.com/path?param=value para más info.",
            es: "Visita https://example.com/path?param=value para más info.",
            fr: "Visita https://example.com/path?param=value para más info."
        }
    },

    // CASOS COMPLEJOS MIXTOS
    {
        name: "Texto complejo multiidioma",
        input: "¡Hola! Precio: 12,50€. Pregunta: ¿vienes? Respuesta: \"Sí, a las 3:30 p.m.\"",
        expected: {
            en: '¡Hola! Precio: 12,50€. Pregunta: ¿vienes? Respuesta: "Sí, a las 3:30 p.m."',
            es: '¡Hola! Precio: 12,50€. Pregunta: ¿vienes? Respuesta: "Sí, a las 3:30 p.m."',
            fr: '¡Hola\u00A0! Precio\u00A0: 12,50€. Pregunta\u00A0: ¿vienes\u00A0? Respuesta\u00A0: "Sí, a las 3\u00A0:30 p.m."'
        }
    },

    // CASOS EDGE
    {
        name: "Espacios múltiples y al inicio/final",
        input: "   Inicio   con    espacios   múltiples   al   final   ",
        expected: {
            en: "Inicio con espacios múltiples al final",
            es: "Inicio con espacios múltiples al final",
            fr: "Inicio con espacios múltiples al final"
        }
    },

    {
        name: "Puntuación al final del texto",
        input: "Texto que termina con punto .",
        expected: {
            en: "Texto que termina con punto.",
            es: "Texto que termina con punto.",
            fr: "Texto que termina con punto."
        }
    },

    {
        name: "Números con separadores de miles",
        input: "La población es 1 000 000 de habitantes.",
        expected: {
            en: "La población es 1 000 000 de habitantes.",
            es: "La población es 1 000 000 de habitantes.",
            fr: "La población es 1 000 000 de habitantes."
        }
    }
];

// Función para ejecutar las pruebas
function runTests() {
    const languages = ['en', 'es', 'fr'] as const;

    testCases.forEach((testCase) => {
        console.log(`\n=== ${testCase.name} ===`);
        console.log(`Input: "${testCase.input}"`);

        languages.forEach((lang) => {
            // Simular la llamada con el idioma específico
            const result = normalizePunctuationSpaces(testCase.input, { preferredLanguage: lang });
            const expected = testCase.expected[lang];
            const passed = result === expected;

            console.log(`${lang.toUpperCase()}: "${result}" ${passed ? '✅' : '❌'}`);
            if (!passed) {
                console.log(`     Expected: "${expected}"`);
                console.log(`     Got:      "${result}"`);
            }
        });
    });
}

// Casos específicos para debugging
const debugCases = [
    {
        name: "Debug: Espacio no separable francés",
        input: "Question?",
        test: (result: string) => {
            // Verificar que el espacio antes del ? sea no separable (\u00A0)
            return result.includes('\u00A0?');
        }
    },
    {
        name: "Debug: Signos invertidos español",
        input: "¿Cómo?",
        test: (result: string) => {
            // Verificar que no hay espacio después de ¿
            return result === '¿Cómo?';
        }
    },
    {
        name: "Debug: Decimales por idioma",
        input: "12.50",
        test: (result: string, lang: string) => {
            if (lang === 'es') return result === '12.50'; // En español debería mantener el punto si no hay contexto de coma
            return result === '12.50';
        }
    }
];

export { testCases, runTests, debugCases };