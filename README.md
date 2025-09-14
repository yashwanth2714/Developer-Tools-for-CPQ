# Developer Tools for CPQ

A collection of **developer tools and code snippets** to speed up coding in Oracle CPQ.  
Includes ready-to-use snippets for **BML functions, JSON handling, BMQL patterns**, and other common CPQ coding tasks.

---

## ✨ Features
- 🚀 Snippets for **BML JSON functions** (`jsonput`, `jsonget`, `jsonpathgetsingle`, etc.)
- ⚡ Quick code patterns for **BML control structures** (loops, conditions, try/catch)
- 📦 Snippets reusable in `.bml`, `.txt`, `.c`, `.java` files
- 🔍 Optimized for Oracle CPQ developers who work daily with BML
## 🛠️ Usage
1. Install the extension.
2. Open a file (e.g., `.bml`, `.txt`, `.c`, `.java`).
3. Start typing a snippet prefix, for example:
   - `bml-jsonput`
   - `bml-jsonget`
   - `bml-jsonpathgetsingle`
4. Press **Tab** or **Enter** to expand into a full code template.

---

## 📖 Example

```bml
str = "{\"key1\":90,\"key2\":[{\"key1\":900}],\"key3\":{\"key1\":9000}}";
jsonObj = json(str);

arrayVals = jsonpathgetmultiple(jsonObj,"$..key1");
print arrayVals;
// Output: [90,900,9000]
