# Clean Text - Raycast Extension

A powerful text cleaning and formatting extension for Raycast with **configurable global settings** and **intelligent text processing**. Apply various text modifications to selected text or clipboard content with smart defaults and customizable preferences.

## ✨ Features

### 🎛️ Global Configuration
**New in latest version**: Configure default behaviors globally in Raycast settings:

- **Default Quote Type**: Choose your preferred quote style for all quote unification
  - Double Quotes (`"`)
  - Single Quotes (`'`)
  - Smart Double Quotes (`""`)
  - Smart Single Quotes (`''`)

- **Default Line Break Format**: Set your preferred line ending format
  - Auto (detects your OS automatically)
  - LF (Unix/Linux/macOS)
  - CRLF (Windows)

### 🔧 Optimized Text Modifications
**Consolidated and improved functions**:

- **Normalize Whitespace** - Unified function that removes newlines, double spaces, and standardizes all whitespace
- **Trim Whitespace** - Remove leading and trailing whitespace
- **Unify Quotes** - Convert quotes using your global preference settings
- **Remove Non-Printable Characters** - Remove invisible characters and emojis
- **Normalize Punctuation Spaces** - Fix spacing around punctuation marks
- **Maintain Line Breaks** - Standardize line breaks using your global format preference
- **Single Paragraph Mode** - Convert text to single paragraph
- **Remove Numbering** - Remove bullets, numbering, and list formatting
- **Capitalize Sentences** - Capitalize first letter of sentences

### ⚡ Smart Combo Commands
Configure powerful combinations with **Combo 1** and **Combo 2**:
- **Streamlined preferences** with consolidated options
- **Global settings integration** - Quote and line break preferences are applied automatically
- **Instant processing** - Apply multiple modifications with a single command
- **Customizable per combo** - Each combo maintains its own modification set

## 🎯 Commands

1. **Clean Text** - Interactive interface with pinned, recent, and all modifications
2. **Combo 1** - Apply your first custom combination instantly (no-view mode)
3. **Combo 2** - Apply your second custom combination instantly (no-view mode)

## ⚙️ Configuration

### Global Extension Preferences
Access via **Raycast Settings → Extensions → Clean Text**:

- **Preferred Source**: Selected text or clipboard
- **Preferred Action**: Copy to clipboard or paste to active app
- **Pop to Root**: Return to Raycast root after action
- **Default Quote Type**: Global preference for quote unification
- **Default Line Break Format**: Global preference for line endings

### Combo Command Preferences
Each combo has streamlined settings:

**Available Options**:
- ✅ Normalize Whitespace (combines newline removal, double space removal, and whitespace unification)
- ✅ Trim Whitespace
- ✅ Unify Quotes (uses global quote type preference)
- ✅ Remove Non-Printable Characters
- ✅ Normalize Punctuation Spaces
- ✅ Maintain Line Breaks (uses global line break format)
- ✅ Single Paragraph Mode
- ✅ Remove Numbering
- ✅ Capitalize Sentences

## 🚀 Usage

### Single Modifications
1. Select text or copy to clipboard
2. Launch **"Clean Text"** command
3. Choose from pinned favorites, recent, or browse all modifications
4. Text is processed and copied/pasted according to your preferences

### Smart Combos
1. Configure your combos in Raycast preferences
2. Set global quote and line break preferences once
3. Select text or copy to clipboard  
4. Launch **"Combo 1"** or **"Combo 2"** 
5. All enabled modifications apply instantly with your global settings

## 🏗️ Architecture

### Modern TypeScript Implementation
- **Type-safe preferences** with proper interfaces
- **Consolidated functions** reducing code duplication
- **Global settings integration** with fallback defaults
- **Efficient text processing** with whole-text operations

### File Structure
- `src/clean-text.tsx` - Main interactive command interface
- `src/combo1.tsx` - First custom combo (no-view command)
- `src/combo2.tsx` - Second custom combo (no-view command)  
- `src/modifications.ts` - Function registry and conversion utilities
- `src/clean-text-functions.ts` - Core text processing with global settings support

### Key Improvements
- **🔄 Function Consolidation**: Removed redundant functions (removeNewlines, removeDoubleSpaces, unifyWhitespace → normalizeWhitespace)
- **⚙️ Global Configuration**: Quote types and line break formats configurable at extension level
- **🎯 Smart Defaults**: Functions automatically use global preferences with option overrides
- **📦 Backward Compatibility**: Legacy function names maintained as aliases

## 📄 License

MIT License