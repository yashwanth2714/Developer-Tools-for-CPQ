# Changelog  
All notable changes to **Developer Tools for CPQ** will be documented here.  

---

## [Unreleased]  
- 🚀 Buckle up—more cool features and surprises are just around the corner!

---

## [0.0.42] - 2025-09-30
### Added  
- Detection of unused variables in BML files. The extension now highlights unused variables to help improve code quality and maintainability.

---

## [0.0.41] - 2025-09-26
### Fixed
- Improved BML formatter to correctly handle the `<>` operator inside conditions, even with nested or multiline parentheses.
- Prevented js-beautify from splitting `<>` into `< >` and from adding unwanted spaces between `<>` and `-1` (e.g., `<> - 1` now formats as `<>-1`).

---

## [0.0.40] - 2025-09-25
### Added  
- Support for formatting, hover, and snippets in plain text, C, and Java files in addition to BML.

---

## [0.0.36 to 0.0.39] - 2025-09-24  
### Improved  
- README file

---

## [0.0.35] - 2025-09-24  
### Added  
- 🖱️ **Hover Help**: Show BML function signatures & descriptions when hovering in the editor  
- 🔍 **Docs Explorer Enhancements**: Searchable sidebar with **Copy** and **Insert** buttons

### Improved  
- Formatter pipeline: preprocess → beautify → postprocess  
  - Handles `for … in …` loops, `elif`, `AND/OR`, `< >`  
  - Respects VS Code indentation settings (tabs vs spaces)  
  - Fixes missing or extra braces from beautify  

---

## [0.0.34] and earlier  
Initial development builds:  
- 🚀 BML snippets (functions + control structures)  
- 🧹 Basic formatter for `.bml` files  
- 🔍 Initial Docs Explorer (searchable list of functions)  
- 🎨 Base color themes (Monokai, Solarized, Dracula, etc.)  
- 🖍️ Syntax highlighting for `.bml`  
