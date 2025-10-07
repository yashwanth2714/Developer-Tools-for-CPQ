# Changelog  
All notable changes to **Developer Tools for CPQ** will be documented here.  

---

## [Unreleased]  
- 🚀 Buckle up—more cool features and surprises are just around the corner!

---

## [0.0.52] - 2025-10-07
### Improved  
- README file

---

## [0.0.49 to 0.0.51] - 2025-10-06
### Added
- Added unreachable code detection — highlights and marks code appearing after return or throwError statements.

---

## [0.0.44 to 0.0.48] - 2025-10-06
### Fixed
- Multiple statements on one line rule: now ignores semicolons inside string literals to prevent false positives. (Severity: Error)
- Unused variable detection: now ignores variable names appearing inside strings (e.g., in BMQL queries or log messages), avoiding false “declared but never used” warnings. (Severity: Information)
- Missing semicolon rule: updated to handle multi-line statements and string concatenations; only reports a missing semicolon at the actual end of a logical statement. (Severity: Error)
- Warns when a single statement exceeds 200 characters instead of 120 to improve readability.

---

## [0.0.43] - 2025-10-04
### Added
- Unused variable detection in BML files: highlights variables that are declared but never used to help remove dead code and improve maintainability. (Severity: Information)
- Empty-block detection: flags empty `{ ... }` blocks (including multi-line empty blocks) so you can remove or add logic where needed. (Severity: Information)
- Missing-semicolon check: errors when statements that require a semicolon are missing one. (Severity: Error)
- Nested-loop depth warning: warns when nested loop depth exceeds 2 levels to encourage refactoring for performance and readability. (Severity: Warning)
- Variable naming convention checks: enforces BML naming rules (constants ALL_CAPS, camelCase for vars, array suffixes like `Arr|Array|List`, dictionary suffix `Dict|Dictionary`, record suffix `Records`, boolean prefixes `is|has`). (Severity: Warning)
- One-statement-per-line check: errors when multiple statements are placed on the same line. (Severity: Error)
- Print statements must be debug-guarded: hints when `print` appears without an `if (debug)` guard. (Severity: Hint)
- Single-argument function parentheses rule: errors when functions that expect one argument (e.g., `not`, `isnull`, `upper`, `lower`) are used without parentheses. (Severity: Error)
- Very-long-statement warning: warns when a single statement exceeds 120 characters to improve readability. (Severity: Warning)

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
