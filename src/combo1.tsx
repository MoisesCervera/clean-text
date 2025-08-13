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

export default async function Combo1Command() {
    const preferences = getPreferenceValues<Preferences>();
    const combo1Prefs = getPreferenceValues<Preferences.Combo1>();

    try {
        const content = await readContent(preferences.source);

        // Apply all enabled modifications in sequence
        let result = content;

        if (combo1Prefs.normalizeWhitespace) {
            result = convert(result, "Normalize Whitespace");
        }
        if (combo1Prefs.trimWhitespace) {
            result = convert(result, "Trim Whitespace");
        }
        if (combo1Prefs.unifyQuotes) {
            result = convert(result, "Unify Quotes");
        }
        if (combo1Prefs.removeInvisibleCharacters) {
            result = convert(result, "Remove Invisible Characters");
        }
        if (combo1Prefs.maintainLineBreaks) {
            result = convert(result, "Maintain Line Breaks");
        }
        if (combo1Prefs.singleParagraph) {
            result = convert(result, "Single Paragraph Mode");
        }
        if (combo1Prefs.removeNumbering) {
            result = convert(result, "Remove Numbering");
        }
        if (combo1Prefs.capitalizeSentences) {
            result = convert(result, "Capitalize Sentences");
        }

        // Count enabled modifications (excluding popToRoot from count)
        const modificationCount = Object.entries(combo1Prefs)
            .filter(([key, value]) => key !== 'popToRoot' && value === true)
            .length;

        if (modificationCount === 0) {
            await showToast({
                style: Toast.Style.Failure,
                title: "No modifications enabled",
                message: "Enable modifications in Combo 1 preferences",
            });
            return;
        }

        if (preferences.action === "paste") {
            await Clipboard.paste(result);
            await showHUD(`Combo 1: Applied ${modificationCount} modifications and pasted`);
        } else {
            await Clipboard.copy(result);
            await showHUD(`Combo 1: Applied ${modificationCount} modifications and copied`);
        }

        if (combo1Prefs.popToRoot) {
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
