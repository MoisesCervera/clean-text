import { getPreferenceValues } from '@raycast/api';

export interface Options {
    prefixCharacters?: string;
    suffixCharacters?: string;
    // Quote unification options
    targetQuoteType?: 'double' | 'single' | 'smart-double' | 'smart-single';
    // Line break format options
    lineBreakFormat?: 'LF' | 'CRLF' | 'auto';
}

interface Preferences {
    defaultQuoteType: 'double' | 'single' | 'smart-double' | 'smart-single';
    defaultLineBreakFormat: 'LF' | 'CRLF' | 'auto';
}

// Normalize whitespace (combines removeNewlines, removeDoubleSpaces, and unifyWhitespace)
export function normalizeWhitespace(input: string, options?: Options): string {
    return input
        .replace(/\r\n/g, ' ')  // Windows line endings
        .replace(/\r/g, ' ')    // Mac line endings
        .replace(/\n/g, ' ')    // Unix line endings
        .replace(/\u2028/g, ' ') // Unicode line separator
        .replace(/\u2029/g, ' ') // Unicode paragraph separator
        .replace(/\s+/g, ' ')   // Collapse multiple spaces into one
        .trim();                // Remove leading/trailing spaces
}

// Trim leading and trailing spaces/tabs
export function trimWhitespace(input: string, options?: Options): string {
    return input.trim();
}

// Unify all types of quotes into a single chosen style
export function unifyQuotes(input: string, style: string): string {
    // Comprehensive set of Unicode quote characters
    const doubleQuotes = /[\u0022\u201C\u201D\u201E\u201F\u2033\u2036]/g; // " “ ” „ ‟ ″ ‶
    const singleQuotes = /[\u0027\u2018\u2019\u201A\u201B\u2032\u2035]/g; // ' ‘ ’ ‚ ‛ ′ ‵

    switch (style) {
        case "single":
            return input.replace(doubleQuotes, "'").replace(singleQuotes, "'");
        case "double":
            return input.replace(singleQuotes, '"').replace(doubleQuotes, '"');
        case "smart-single": {
            // Alternates between opening and closing single quotes
            let open = true;
            return input.replace(singleQuotes, () => open ? "‘" : "’").replace(doubleQuotes, () => open ? "‘" : "’");
        }
        case "smart-double": {
            // Alternates between opening and closing double quotes
            let open = true;
            return input.replace(doubleQuotes, () => open ? "“" : "”").replace(singleQuotes, () => open ? "“" : "”");
        }
        default:
            return input;
    }
}


// Remove non printable characters without removing numbers or normal symbols
export function removeNonPrintableCharacters(input: string): string {
    // Removes control characters, formatting characters, unassigned code points, and private use characters
    // Keeps numbers, letters, punctuation, and emoji
    return input.replace(/[\p{Cc}\p{Cf}\p{Cs}\p{Co}\p{Cn}]+/gu, "");
}


// Normalize spaces around punctuation marks
export function normalizePunctuationSpaces(input: string): string {
    return input
        // Espacios correctos después de .,!?;: (pero no antes de cierre de comillas)
        .replace(/\s*([,.!?;:])\s*(?=(?:["'”’)]|$))/gu, "$1") // si va seguido de cierre, no añade espacio extra
        .replace(/\s*([,.!?;:])\s*/gu, "$1 ") // añade espacio cuando corresponde
        // Elimina espacio antes de puntos suspensivos
        .replace(/\s*\.\.\./g, "...")
        .replace(/\.{3,}/g, "...")
        // Quita espacio antes de comillas o paréntesis de apertura
        .replace(/\s+([“"‘'(])/gu, "$1")
        // Quita espacio antes de comillas de cierre
        .replace(/\s+(?=["'”’)\]])/gu, "")
        // Colapsa espacios múltiples
        .replace(/\s{2,}/g, " ")
        .trim();
}

// Maintain consistent line breaks with configurable format
export function maintainLineBreaks(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const format = options?.lineBreakFormat || preferences.defaultLineBreakFormat || 'LF';

    // First normalize all line breaks to LF
    let result = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Then convert to target format
    switch (format) {
        case 'CRLF':
            return result.replace(/\n/g, '\r\n');
        case 'auto':
            // Detect OS and use appropriate format
            if (typeof process !== 'undefined' && process.platform === 'win32') {
                return result.replace(/\n/g, '\r\n');
            }
            return result; // Default to LF for macOS/Linux
        case 'LF':
        default:
            return result;
    }
}// Single Paragraph Mode (unify all text into a single paragraph)
export function singleParagraphMode(input: string, options?: Options): string {
    return input
        .replace(/\r?\n\s*\r?\n/g, ' ')
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Remove numbering (1., 2., 3.), bullet points (•, –) or (a), (b), (c)
export function removeNumbering(input: string, options?: Options): string {
    return input
        .replace(/^\s*[\d]+\.\s*/gm, '') // Remove "1. "
        .replace(/^\s*\([a-zA-Z]\)\s*/gm, '') // Remove "(a) "
        .replace(/^\s*[•–-]\s+(?=[A-Z0-9])/gm, '') // Bullet only if followed by uppercase or digit
        .replace(/^\s*[\*\+]\s*/gm, '') // Remove "*" or "+"
        .trim();
}

// Capitalize first letter of each sentence
export function capitalizeSentences(input: string): string {
    return input.replace(/(^|[.!?]\s+|\n)(\p{Ll})/gu, (_, prefix, letter) => prefix + letter.toUpperCase());
}

// Legacy functions for backwards compatibility (now using normalizeWhitespace)
export function removeNewlines(input: string, options?: Options): string {
    return normalizeWhitespace(input, options);
}

export function removeDoubleSpaces(input: string, options?: Options): string {
    return normalizeWhitespace(input, options);
}

export function unifyWhitespace(input: string, options?: Options): string {
    return normalizeWhitespace(input, options);
}