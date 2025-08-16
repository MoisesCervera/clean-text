import { getPreferenceValues } from '@raycast/api';

export interface Options {
    prefixCharacters?: string;
    suffixCharacters?: string;
    targetQuoteType?: 'double' | 'single' | 'smart-double' | 'smart-single';
    lineBreakFormat?: 'LF' | 'CRLF' | 'auto';
    targetWhitespaceType?: 'space' | 'no-break-space' | 'thin-space' | 'custom';
    customWhitespaceChar?: string;
}

interface Preferences {
    defaultQuoteType: 'double' | 'single' | 'smart-double' | 'smart-single';
    defaultLineBreakFormat: 'LF' | 'CRLF' | 'auto';
    abbreviationExceptions: string;
    defaultWhitespaceType: 'space' | 'no-break-space' | 'thin-space' | 'custom';
}

export function normalizeWhitespace(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetWhitespaceType || preferences.defaultWhitespaceType || 'space';

    const targetChar = {
        'space': '\u0020',
        'no-break-space': '\u00A0',
        'thin-space': '\u2009',
        'custom': options?.customWhitespaceChar || '\u0020'
    }[targetType] || '\u0020';

    return input
        .replace(/[\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, targetChar)
}

export function removeInvisibleCharacters(input: string, options?: Options): string {
    return input
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
        .replace(/[\u180E\u3164\uFFA0]/g, '')
        .replace(/[\u2061-\u2064]/g, '')
        .replace(/[\u00AD\u034F\u061C\u115F\u17B4\u17B5\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
        .replace(/[\uFE00-\uFE0F]/g, '')
        .replace(/[\uE0100-\uE01EF]/g, '');
}

export function unifyQuotes(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetQuoteType || preferences.defaultQuoteType || 'double';

    const quotes = {
        single: "'",
        double: '"',
        'smart-single': { open: '\u2018', close: '\u2019' },
        'smart-double': { open: '\u201C', close: '\u201D' }
    };

    const protectedContent: string[] = [];
    let processedInput = input.replace(
        /```[\s\S]*?```|<(?:code|pre)[\s\S]*?<\/(?:code|pre)>|`[^`\n]*`|<[^>]*>|\bhttps?:\/\/[^\s<>]+/gi,
        match => {
            protectedContent.push(match);
            return `__P${protectedContent.length - 1}__`;
        }
    );

    const allQuotes = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2039\u203A\u00AB\u00BB]/g;
    let inQuotes = false;

    processedInput = processedInput.replace(allQuotes, (match, index, text) => {
        const before = text[index - 1] || ' ';
        const after = text[index + 1] || ' ';
        const isOpening = /[\s\(\[\{\u00A1\u00BF]/.test(before) && /[\w\p{L}]/u.test(after);
        const isClosing = /[\w\p{L}.!?\)\]\}]/u.test(before) && /[\s.,!?;:\)\]\}]/.test(after);

        if (typeof quotes[targetType] === 'string') {
            return quotes[targetType];
        }

        const smartQuote = quotes[targetType];
        if (isOpening || (!isClosing && !inQuotes)) {
            inQuotes = true;
            return smartQuote.open;
        } else {
            inQuotes = false;
            return smartQuote.close;
        }
    });

    return processedInput.replace(/__P(\d+)__/g, (_, i) => protectedContent[i]);
}

export function maintainLineBreaks(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const format = options?.lineBreakFormat || preferences.defaultLineBreakFormat || 'LF';

    let result = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    switch (format) {
        case 'CRLF':
            return result.replace(/\n/g, '\r\n');
        case 'auto':
            if (typeof process !== 'undefined' && process.platform === 'win32') {
                return result.replace(/\n/g, '\r\n');
            }
            return result;
        case 'LF':
        default:
            return result;
    }
}


export function singleParagraphMode(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetWhitespaceType || preferences.defaultWhitespaceType || 'space';
    const targetLineBreakFormat = options?.lineBreakFormat || preferences.defaultLineBreakFormat || 'LF';

    const targetChar = {
        'space': '\u0020',
        'no-break-space': '\u00A0',
        'thin-space': '\u2009',
        'custom': options?.customWhitespaceChar || '\u0020'
    }[targetType] || '\u0020';

    const lineBreakChar = {
        'CRLF': '\r\n',
        'LF': '\n',
        'auto': (typeof process !== 'undefined' && process.platform === 'win32') ? '\r\n' : '\n'
    }[targetLineBreakFormat] || '\n';

    const processed = maintainLineBreaks(input, { lineBreakFormat: targetLineBreakFormat })
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF\u180E\u3164\uFFA0\u2061-\u2064\u00AD\u034F\u061C\u115F\u17B4\u17B5\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
        .replace(/[\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+/g, targetChar)
        .replace(/[\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, targetChar)
        .replace(new RegExp(`${targetChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+`, 'g'), targetChar)

    return processed + lineBreakChar;
}

export function removeNumbering(input: string, options?: Options): string {
    return input
        .replace(/^\s*[\d]+\.\s*/gm, '')
        .replace(/^\s*\([a-zA-Z]\)\s*/gm, '')
        .replace(/^\s*[•–-]\s*/gm, '')
}
export function capitalizeSentences(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();

    const abbreviations = (preferences.abbreviationExceptions || "etc., p. ej., vs., e.g., i.e., cf., op. cit., et al., Ph.D., M.D., Dr., Mr., Mrs., Ms., Prof., Sr., Jr.")
        .split(',')
        .map(abbr => abbr.trim().toLowerCase())
        .filter(abbr => abbr.length > 0)
        .map(abbr => abbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

    const protectionRegex = new RegExp(`\\b(?:${abbreviations.join('|')})`, 'gi');

    const protectedPhrases: string[] = [];
    let result = input.replace(protectionRegex, match => {
        protectedPhrases.push(match);
        return `__ABB${protectedPhrases.length - 1}__`;
    });

    result = result
        .replace(/(^|[.!?]\s*)([\u201C\u201D\u2018\u2019"']?\s*)(\p{L})/gu, (_, end, quotes, letter) =>
            end + quotes + letter.toUpperCase())
        .replace(/(\n+)([\u201C\u201D\u2018\u2019"']?\s*)(\p{L})/gu, (_, newlines, quotes, letter) =>
            newlines + quotes + letter.toUpperCase());

    return result.replace(/__ABB(\d+)__/g, (_, i) => protectedPhrases[i]);
}