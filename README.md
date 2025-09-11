# Oracle CPQ BML Snippets

A collection of useful **Oracle CPQ BML + JSON snippets** for faster development.

## Features
- Snippets for JSON functions (jsonput, jsonget, jsonarrayappend, etc.)
- Common BML patterns (if/else, loops, try/catch, BMQL execution)
- Works in `.bml`, `.txt`, `.c`, and `.java` files.

## Usage
1. Install the extension.
2. Open a file (e.g., `.bml`, `.txt`, `.c`, `.java`).
3. Start typing a snippet prefix, e.g.:
   - `bml-jsonput`
   - `bml-jsonarrayappend`
   - `bml-jsonpathgetsingle`
4. Press `Tab` or `Enter` to expand the snippet.

## Example

```bml
str = "{\"key1\":90,\"key2\":[{\"key1\":900}],\"key3\":{\"key1\":9000}}";
jsonObj = json(str);

arrayVals = jsonpathgetmultiple(jsonObj,"$..key1");
print arrayVals;
// Output: [90,900,9000]
