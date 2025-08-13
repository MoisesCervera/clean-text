import {
    Clipboard,
    getPreferenceValues,
    getSelectedText,
    showHUD,
    popToRoot,
    closeMainWindow,
    showToast,
    Toast,
} from "@raycast/api";
import { convert } from "./modifications";

async function getSelection() {
    try {
        return await getSelectedText();
    } catch (error) {
        return "";
    }
}

class NoTextError extends Error {
    constructor() {
        super("No text");
        Object.setPrototypeOf(this, NoTextError.prototype);
    }
}

async function readContent(preferredSource: string) {
    const clipboard = await Clipboard.readText();
    const selected = await getSelection();

    if (preferredSource === "clipboard") {
        if (clipboard) return clipboard;
        if (selected) return selected;
    } else {
        if (selected) return selected;
        if (clipboard) return clipboard;
    }

    throw new NoTextError();
}

export default async function Combo2Command() {
    const preferences = getPreferenceValues<Preferences>();
    const combo2Prefs = getPreferenceValues<Preferences.Combo2>();

    try {
        const content = await readContent(preferences.source);

        // Apply all enabled modifications in sequence
        let result = content;

        if (combo2Prefs.normalizeWhitespace) {
            result = convert(result, "Normalize Whitespace");
        }
        if (combo2Prefs.trimWhitespace) {
            result = convert(result, "Trim Whitespace");
        }
        if (combo2Prefs.unifyQuotes) {
            result = convert(result, "Unify Quotes");
        }
        if (combo2Prefs.removeNonPrintable) {
            result = convert(result, "Remove Non-Printable Characters");
        }
        if (combo2Prefs.normalizePunctuation) {
            result = convert(result, "Normalize Punctuation Spaces");
        }
        if (combo2Prefs.maintainLineBreaks) {
            result = convert(result, "Maintain Line Breaks");
        }
        if (combo2Prefs.singleParagraph) {
            result = convert(result, "Single Paragraph Mode");
        }
        if (combo2Prefs.removeNumbering) {
            result = convert(result, "Remove Numbering");
        }
        if (combo2Prefs.capitalizeSentences) {
            result = convert(result, "Capitalize Sentences");
        }

        // Count enabled modifications (excluding popToRoot from count)
        const modificationCount = Object.entries(combo2Prefs)
            .filter(([key, value]) => key !== 'popToRoot' && value === true)
            .length;

        if (modificationCount === 0) {
            await showToast({
                style: Toast.Style.Failure,
                title: "No modifications enabled",
                message: "Enable modifications in Combo 2 preferences",
            });
            return;
        }

        if (preferences.action === "paste") {
            await Clipboard.paste(result);
            await showHUD(`Combo 2: Applied ${modificationCount} modifications and pasted`);
        } else {
            await Clipboard.copy(result);
            await showHUD(`Combo 2: Applied ${modificationCount} modifications and copied`);
        }

        if (combo2Prefs.popToRoot) {
            await popToRoot();
        } else {
            await closeMainWindow();
        }
    } catch (error) {
        if (error instanceof NoTextError) {
            await showToast({
                style: Toast.Style.Failure,
                title: "Nothing to modify",
                message: "Ensure that text is either selected or copied",
            });
        } else {
            await showToast({
                style: Toast.Style.Failure,
                title: "Error",
                message: "An unexpected error occurred",
            });
        }
    }
}
