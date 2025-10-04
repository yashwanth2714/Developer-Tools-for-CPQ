# Developer Tools for CPQ  

A collection of productivity tools for Oracle CPQ developers — including **BML code snippets, formatter, syntax highlighting, documentation explorer, built-in themes, inline code quality validation, and inline hover help** — all in one extension.  

---

## ✨ Features  

- 🚀 **Snippets for BML functions**  
  - Covers core functions (`json`, `dictionary`, `date`, `string`, etc.)  
  - Quick code patterns for **control structures** (`if/elif`, loops, array handling)  

- 🔍 **BML Docs Explorer (Sidebar)**  
  - Searchable list of functions with **signatures + descriptions + examples**  
  - 📋 **Copy** or ➕ **Insert** snippets directly into the editor  
  - Organized by category for faster lookup  

- 🧹 **Formatter for `.bml` code**
  - Auto-indents multi-line snippets with your **VS Code indentation settings**  
  - Cleans up inconsistent spacing for readable, production-ready BML  

- 🖱️ **Hover Help**  
  - Hover over a BML function → see **signature and description instantly**  
  - Eliminates constant context-switching to Oracle docs  

- 🎨 **Built-in Color Themes**  
  - Includes popular **dark and light themes** (Monokai, Nord, GitHub Dark Dimmed, Notepad++-like, etc.)  
  - Optimized for CPQ developers who spend all day in BML  

 - ✅ **Inline Code Quality Validation**  
    - Provides a SonarLint-like experience for Oracle CPQ BML language and surfaces common code-quality issues inline as diagnostics.  
    - Detects and warns/errors on a range of issues including:  
        - Unused variables (Information)  
        - Empty `{ ... }` blocks (Information)  
        - Missing semicolons at statement end (Error)  
        - Excessive nested loop depth (>2) (Warning)  
        - Variable naming convention violations (arrays/dicts/records/booleans) (Warning)  
        - Multiple statements on a single line (Error)  
        - `print` statements not wrapped in `if (debug)` guards (Hint)  
        - Single-argument functions used without parentheses (Error)  
        - Very long statements (>150 chars) (Warning)  

- 🖍️ **Syntax highlighting** for `.bml` files (based on Java grammar)  

- 📦 Works in `.bml`, `.txt`, `.c`, `.java` files (so you can draft anywhere)  

---

## 📽 Demo

### ✂️ Code Snippets
Insert ready-to-use BML snippets for functions, arrays, dates, JSON, and more.

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/snippet.gif" width="800"/>

---

### 📄 Hover Help
Get instant documentation and function signature while hovering. 

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/hover.gif" width="800"/>

---

### 🔮 Signature Help
Inline function parameter hints while coding.  

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/signature.gif" width="800"/>

---

### 🧹 Code Formatter
Clean and properly indented BML code with one command.  

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/formatter.gif" width="800"/>

---

### 📚 Sidebar Docs Explorer
Browse, search, copy, and insert BML snippets directly from the sidebar.

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/sidebar.gif" width="800"/>

---

### 📂 Use in Plaintext Files
Use BML snippets and features inside plain text files.  

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/selection.gif" width="800"/>

---

### 🎨 Themes
Switch between built-in dark/light themes for better readability. 

<img src="https://raw.githubusercontent.com/yashwanth2714/Developer-Tools-for-CPQ/master/images/themes.gif" width="800"/>

---

## 🚀 Usage  

1. Open a `.bml` file.  
2. Use snippets via autocomplete (`bml-json`, `bml-date-addmonths`, etc.).  
3. Format your code with `Shift+Alt+F` (or right-click → Format Document).  
4. Open the **CPQ Docs Explorer** sidebar (from Activity Bar) to search snippets.  
   - 📋 **Copy snippet** → copies to clipboard  
   - ➕ **Insert snippet** → inserts at cursor, respecting indentation  
5. Hover on a BML function → see **signature + description** instantly.  

---

## ⚙️ Commands & Settings  

- `Format Document` → formats `.bml` code with CPQ-aware rules.  
- `Developer Tools for CPQ: Open Docs Explorer` → open sidebar manually.  
- Uses your **VS Code settings** for indentation (tabs vs spaces).  

---

## 🛠️ Installation  

1. Open **Visual Studio Code**.  
2. Click on the **Extensions** icon in the Activity Bar (or press `Ctrl+Shift+X`).  
3. In the search box, type **Developer Tools for CPQ**.  
4. Locate the extension in the results list.  
5. Click **Install**.  
6. Reload VS Code if prompted.  

You’re ready to start using snippets, formatting, hover help, docs explorer, and themes 🚀. 

---

## 🙌 Contributing  

Issues, feature requests, and PRs are welcome!  

---


