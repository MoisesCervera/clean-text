interface Preferences {
    source: "selection" | "clipboard";
    action: "copy" | "paste";
    popToRoot: boolean;
}

interface ExtensionPreferences extends Preferences {
    [key: string]: any;
}
