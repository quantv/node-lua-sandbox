### Library

Only following libraries are available:

- os: date, difftime, setlocale, time and clock are available
- _G: assert, error, ipairs, next, pairs, pcall, print, select, tonumber, tostrnig, type, xpcall
- table
- string
- math
- js

### Example

```javascript
const {
    run,
    new_state,
} = require('lua-sandbox');

const L = new_state();
const data = {};
const code = "return data";
run(L, code, data)
```