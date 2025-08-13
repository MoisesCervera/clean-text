import { getPreferenceValues } from '@raycast/api';

export interface Options {
    prefixCharacters?: string;
    suffixCharacters?: string;
    // Quote unification options
    targetQuoteType?: 'double' | 'single' | 'smart-double' | 'smart-single';
    // Line break format options
    lineBreakFormat?: 'LF' | 'CRLF' | 'auto';
    preferredLanguage?: 'en' | 'es' | 'fr';
    // Whitespace normalization options
    targetWhitespaceType?: 'space' | 'no-break-space' | 'thin-space' | 'custom';
    customWhitespaceChar?: string;
}

interface Preferences {
    defaultQuoteType: 'double' | 'single' | 'smart-double' | 'smart-single';
    defaultLineBreakFormat: 'LF' | 'CRLF' | 'auto';
    defaultLanguage: 'en' | 'es' | 'fr';
    abbreviationExceptions: string;
    defaultWhitespaceType: 'space' | 'no-break-space' | 'thin-space' | 'custom';
}

// Normalize space-like whitespace characters (unify all types of spaces into one selected type)
export function normalizeWhitespace(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetWhitespaceType || preferences.defaultWhitespaceType || 'space';

    // Define target whitespace character
    let targetChar: string;
    switch (targetType) {
        case 'space':
            targetChar = '\u0020'; // Regular space
            break;
        case 'no-break-space':
            targetChar = '\u00A0'; // Non-breaking space
            break;
        case 'thin-space':
            targetChar = '\u2009'; // Thin space
            break;
        case 'custom':
            targetChar = options?.customWhitespaceChar || '\u0020';
            break;
        default:
            targetChar = '\u0020';
    }

    // Category 1: Space-like whitespace characters (excluding line breaks)
    const spacePattern = /[\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g;

    return input
        .replace(spacePattern, targetChar) // Replace all space variants with target
        .replace(new RegExp(`${targetChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+`, 'g'), targetChar) // Collapse consecutive target chars
        .trim(); // Trim leading and trailing whitespace
}

// Remove invisible and zero-width characters
export function removeInvisibleCharacters(input: string, options?: Options): string {
    return input
        // Category 3: Zero-width characters
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
        // Category 4: Script-specific invisible characters
        .replace(/[\u180E\u3164\uFFA0]/g, '')
        // Category 5: Mathematical notation invisible characters
        .replace(/[\u2061-\u2064]/g, '')
        // Category 6: Other invisible and control characters
        .replace(/[\u00AD\u034F\u061C\u115F\u17B4\u17B5\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '');
}

// Trim leading and trailing whitespace
export function trimWhitespace(input: string, options?: Options): string {
    // Trim all types of whitespace including spaces and line breaks
    const allWhitespacePattern = /^[\s\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+|[\s\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+$/g;
    return input.replace(allWhitespacePattern, '');
}

// Smart quote unification with context awareness
export function unifyQuotes(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetQuoteType || preferences.defaultQuoteType || 'double';

    // Define quote mappings
    const smartSingleOpen = '\u2018', smartSingleClose = '\u2019';
    const smartDoubleOpen = '\u201C', smartDoubleClose = '\u201D';
    const straightSingle = "'", straightDouble = '"';

    // Patterns for code blocks and HTML that should be preserved
    const codeBlockPatterns = [
        /```[\s\S]*?```/g,           // Markdown code blocks
        /<code[\s\S]*?<\/code>/gi,   // HTML code tags
        /<pre[\s\S]*?<\/pre>/gi,     // HTML pre tags
        /`[^`\n]*`/g,                // Inline code (backticks)
        /<[^>]*>/g,                  // HTML tags
        /\bhttps?:\/\/[^\s<>]+/gi,   // URLs
    ];

    // Store protected content
    const protectedContent: string[] = [];
    let processedInput = input;

    // Replace protected content with placeholders
    codeBlockPatterns.forEach((pattern, index) => {
        processedInput = processedInput.replace(pattern, (match) => {
            const placeholder = `__PROTECTED_${index}_${protectedContent.length}__`;
            protectedContent.push(match);
            return placeholder;
        });
    });

    // Smart quote replacement with proper pairing
    function replaceQuotesWithPairing(text: string): string {
        // All smart/fancy quotes that need to be unified
        const allQuotes = /[\u2018\u2019\u201A\u201B\u201C\u201D\u201E\u201F\u2039\u203A\u00AB\u00BB]/g;
        const result = [];
        let inQuotes = false;
        let lastIndex = 0;

        text.replace(allQuotes, (match, index) => {
            // Add text before the quote
            result.push(text.slice(lastIndex, index));

            // Determine if this is an opening or closing quote
            const beforeChar = text[index - 1] || ' ';
            const afterChar = text[index + 1] || ' ';

            // Logic for quote pairing: 
            // Opening if: after whitespace/punctuation, before letter/number
            // Closing if: after letter/number/punctuation, before whitespace/punctuation
            const isOpening = /[\s\(\[\{\u00A1\u00BF]/.test(beforeChar) && /[\w\p{L}]/u.test(afterChar);
            const isClosing = /[\w\p{L}.!?\)\]\}]/u.test(beforeChar) && /[\s.,!?;:\)\]\}]/.test(afterChar);

            let replacement = match; // fallback

            switch (targetType) {
                case 'single':
                    replacement = straightSingle;
                    break;
                case 'double':
                    replacement = straightDouble;
                    break;
                case 'smart-single':
                    if (isOpening || (!isClosing && !inQuotes)) {
                        replacement = smartSingleOpen;
                        inQuotes = true;
                    } else {
                        replacement = smartSingleClose;
                        inQuotes = false;
                    }
                    break;
                case 'smart-double':
                    if (isOpening || (!isClosing && !inQuotes)) {
                        replacement = smartDoubleOpen;
                        inQuotes = true;
                    } else {
                        replacement = smartDoubleClose;
                        inQuotes = false;
                    }
                    break;
            }

            result.push(replacement);
            lastIndex = index + match.length;
            return match; // This return is not used, just for replace callback
        });

        // Add remaining text
        result.push(text.slice(lastIndex));
        return result.join('');
    }

    // Apply quote replacement to processed input
    processedInput = replaceQuotesWithPairing(processedInput);

    // Restore protected content
    protectedContent.forEach((content, index) => {
        codeBlockPatterns.forEach((_, patternIndex) => {
            const pattern = new RegExp(`__PROTECTED_${patternIndex}_${index}__`, 'g');
            processedInput = processedInput.replace(pattern, content);
        });
    });

    return processedInput;
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
}


// Single Paragraph Mode (comprehensive text unification: removes line breaks, invisible chars, and normalizes whitespace)
export function singleParagraphMode(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();
    const targetType = options?.targetWhitespaceType || preferences.defaultWhitespaceType || 'space';

    let targetChar: string;
    switch (targetType) {
        case 'space':
            targetChar = '\u0020';
            break;
        case 'no-break-space':
            targetChar = '\u00A0';
            break;
        case 'thin-space':
            targetChar = '\u2009';
            break;
        case 'custom':
            targetChar = options?.customWhitespaceChar || '\u0020';
            break;
        default:
            targetChar = '\u0020';
    }

    return input
        // First remove invisible characters
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF\u180E\u3164\uFFA0\u2061-\u2064\u00AD\u034F\u061C\u115F\u17B4\u17B5\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, '')
        // Replace paragraph breaks (double line breaks) with single space
        .replace(/[\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+\s*[\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+/g, targetChar)
        // Replace remaining line breaks with target character
        .replace(/[\u000A\u000B\u000C\u000D\u0085\u2028\u2029]+/g, targetChar)
        // Normalize all space-like characters to target character
        .replace(/[\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, targetChar)
        // Collapse multiple consecutive target characters into one
        .replace(new RegExp(`${targetChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}+`, 'g'), targetChar)
        // Trim leading and trailing whitespace
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

// Capitalize first letter of each sentence with smart abbreviation handling
export function capitalizeSentences(input: string, options?: Options): string {
    const preferences = getPreferenceValues<Preferences>();

    // Parse abbreviation exceptions from preferences
    const abbreviationsStr = preferences.abbreviationExceptions || "etc., p. ej., vs., e.g., i.e., cf., op. cit., et al., Ph.D., M.D., Dr., Mr., Mrs., Ms., Prof., Sr., Jr.";
    const abbreviations = abbreviationsStr
        .split(',')
        .map(abbr => abbr.trim().toLowerCase())
        .filter(abbr => abbr.length > 0);

    // Create a regex pattern for abbreviations (escape special chars and remove trailing periods)
    const abbreviationPatterns = abbreviations.map(abbr => {
        const cleanAbbr = abbr.replace(/\.$/, ''); // Remove trailing period
        return cleanAbbr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special chars
    });

    // Process the text
    let result = input;

    // First pass: mark abbreviation contexts to protect them
    const protectedRanges: Array<{ start: number; end: number }> = [];

    abbreviationPatterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern}\\.`, 'gi');
        let match;
        while ((match = regex.exec(result)) !== null) {
            protectedRanges.push({
                start: match.index + match[0].length - 1, // Position of the period
                end: match.index + match[0].length + 10   // Give some buffer for following text
            });
        }
    });

    // Sort ranges by start position
    protectedRanges.sort((a, b) => a.start - b.start);

    // Function to check if a position is protected
    const isProtected = (position: number): boolean => {
        return protectedRanges.some(range =>
            position >= range.start && position <= range.end
        );
    };

    // Second pass: capitalize sentences while respecting protected ranges
    result = result.replace(
        /(^|[.!?]\s*)([\u201C\u201D\u2018\u2019"']?\s*)(\p{L})/gu,
        (match, sentenceEnd, quotes, letter, offset) => {
            // Check if this period is part of an abbreviation
            if (sentenceEnd.includes('.') && isProtected(offset + sentenceEnd.length - 1)) {
                return match; // Don't capitalize after abbreviations
            }

            // Capitalize the letter
            return sentenceEnd + quotes + letter.toUpperCase();
        }
    );

    // Handle start of text (first letter should always be capitalized)
    result = result.replace(/^([\u201C\u201D\u2018\u2019"']?\s*)(\p{L})/u,
        (match, quotes, letter) => quotes + letter.toUpperCase()
    );

    // Handle after line breaks
    result = result.replace(/(\n+)([\u201C\u201D\u2018\u2019"']?\s*)(\p{L})/gu,
        (match, newlines, quotes, letter) => newlines + quotes + letter.toUpperCase()
    );

    return result;
}


