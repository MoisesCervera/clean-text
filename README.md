# Clean Text - Raycast Extension

A powerful text cleaning and formatting extension for Raycast that allows you to apply various text modifications to selected text or clipboard content.

## Features

### Single Modifications
Apply individual text modifications from a comprehensive list:

- **Remove Newlines** - Replace newlines with spaces
- **Remove Double Spaces** - Remove extra spaces
- **Trim Whitespace** - Remove leading and trailing whitespace
- **Unify Whitespace** - Convert all whitespace to single spaces
- **Unify Quotes** - Convert all quote types to double quotes
- **Remove Non-Printable Characters** - Remove invisible characters
- **Normalize Punctuation Spaces** - Fix spacing around punctuation
- **Maintain Line Breaks** - Standardize line break format
- **Single Paragraph Mode** - Convert text to single paragraph
- **Remove Numbering** - Remove bullets and numbering
- **Capitalize Sentences** - Capitalize first letter of sentences

### Custom Combos
Configure your own combinations with **Combo 1** and **Combo 2** commands:
- Each combo can be customized in preferences with checkboxes
- **Combo 1** - Default: Basic cleanup (remove newlines, double spaces, trim)
- **Combo 2** - Default: Advanced formatting (unify whitespace/quotes, remove non-printable, normalize punctuation, capitalize)

## Commands

1. **Clean Text** - Main interface with pinned, recent, and all modifications
2. **Combo 1** - Apply your first custom combination instantly
3. **Combo 2** - Apply your second custom combination instantly

## Configuration

### Global Preferences
- **Preferred Source**: Choose between selected text or clipboard
- **Preferred Action**: Copy to clipboard or paste to active app
- **Pop to Root**: Return to Raycast root after action

### Combo Preferences
Each combo command has its own preferences where you can enable/disable specific modifications:
- Go to Raycast Settings → Extensions → Clean Text
- Configure Combo 1 and Combo 2 with your preferred modifications
- Each modification can be toggled on/off independently

## Usage

### Single Modifications
1. Select text or copy to clipboard
2. Launch "Clean Text" command
3. Choose a modification from the list
4. Text is automatically processed and copied/pasted

### Custom Combos
1. Configure your combos in Raycast preferences first
2. Select text or copy to clipboard
3. Launch "Combo 1" or "Combo 2" command
4. All enabled modifications are applied instantly

## Development

Built with TypeScript and the Raycast API.

### File Structure
- `src/clean-text.tsx` - Main command interface
- `src/combo1.tsx` - First custom combo command
- `src/combo2.tsx` - Second custom combo command
- `src/modifications.ts` - Modification definitions and utilities
- `src/clean-text-functions.ts` - Core text processing functions

## License

MIT License