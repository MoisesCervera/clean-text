import * as cleanText from './clean-text-functions';
import { getPreferenceValues } from '@raycast/api';

export type ModificationFunction = (input: string, options?: cleanText.Options) => string;
export type Modifications = Record<string, ModificationFunction>;

export const functions: Modifications = {
    "Normalize Whitespace": cleanText.normalizeWhitespace,
    "Trim Whitespace": cleanText.trimWhitespace,
    "Unify Quotes": cleanText.unifyQuotes,
    "Remove Invisible Characters": cleanText.removeInvisibleCharacters,
    "Maintain Line Breaks": cleanText.maintainLineBreaks,
    "Single Paragraph Mode": cleanText.singleParagraphMode,
    "Remove Numbering": cleanText.removeNumbering,
    "Capitalize Sentences": cleanText.capitalizeSentences
};


export const modifications = Object.keys(functions);
export type ModificationType = (typeof modifications)[number];

export const aliases: Record<ModificationType, string[]> = {
    "Normalize Whitespace": ["normalize-whitespace", "remove-newlines", "remove-double-spaces", "unify-whitespace", "whitespace-normalization"],
    "Trim Whitespace": ["trim-whitespace", "whitespace-trimming"],
    "Unify Quotes": ["unify-quotes", "quote-unification"],
    "Remove Invisible Characters": ["remove-invisible", "invisible-removal", "remove-non-printable", "non-printable-removal"],
    "Maintain Line Breaks": ["maintain-line-breaks", "line-break-maintenance"],
    "Single Paragraph Mode": ["single-paragraph-mode", "paragraph-unification", "remove-line-breaks"],
    "Remove Numbering": ["remove-numbering", "numbering-removal"],
    "Capitalize Sentences": ["capitalize-sentences", "sentence-capitalization"]
};

export function convert(input: string, modification: string) {
    const modified = functions[modification](input);
    return modified;
}

export function modifyTextWrapper(input: string, modification: string) {
    // Process all text as a whole - no need to split by lines
    const modified = convert(input, modification);

    // For markdown preview, we need to preserve line breaks properly
    // Convert single line breaks to markdown line breaks (double space + newline)
    // and preserve paragraph breaks
    let markdownText = modified;
    if (modified.length > 0) {
        // Replace single newlines with markdown line breaks (two spaces + newline)
        // but preserve paragraph breaks (double newlines)
        markdownText = modified
            .replace(/\n\n/g, '###PARAGRAPH_BREAK###') // Temporarily mark paragraph breaks
            .replace(/\n/g, '  \n') // Convert single newlines to markdown line breaks
            .replace(/###PARAGRAPH_BREAK###/g, '\n\n'); // Restore paragraph breaks
    }

    return {
        rawText: modified,
        markdown: (modified.length === 0 ? "\u200B" : markdownText) + "\n"
    };
}
