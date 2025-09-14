# Developer Tools for CPQ

A VS Code extension that brings **snippets, syntax highlighting, and formatting** for BML in Oracle CPQ.  
Boost your productivity with ready-to-use code templates, clean syntax highlighting, and one-click formatting.

---

## ✨ Features

- 🚀 Ready-to-use snippets for **BML functions** (`json`, `dictionary`, `date`, `string`, etc.)  
- ⚡ Quick code templates for **BML control structures** (loops, conditions)  
- 🎨 **Syntax highlighting** for `.bml` files (based on Java grammar)  
- 🧹 **Code formatter** for `.bml` (keeps operators and conditions clean) 
- 📦 Snippets reusable in `.bml`, `.txt`, `.c`, `.java` files  
- 🔍 Optimized for Oracle CPQ developers working daily with BML   

---

## 🛠️ Usage

1. Install the extension.
2. Open a `.bml` file.
3. Start typing a snippet prefix (e.g. `bml-jsonput`) → press **Tab** to expand.
4. Use **Format Document** (`Shift+Alt+F`) to clean up code.

---

## 📖 Snippet Examples

### Example 1: JSON Path Multiple

```bml
str = "{\"key1\":90,\"key2\":[{\"key1\":900}],\"key3\":{\"key1\":9000}}";
jsonObj = json(str);

arrayVals = jsonpathgetmultiple(jsonObj,"$..key1");
print arrayVals;
// Output: [90,900,9000]
```
