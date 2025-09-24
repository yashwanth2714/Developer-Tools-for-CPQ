# Changelog  
All notable changes to **Developer Tools for CPQ** will be documented here.  

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  

---

## [Unreleased]  
- 🚧 Planned features  

---

## [0.0.36] - 2025-09-24  
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
