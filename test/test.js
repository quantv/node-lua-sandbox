const {
    run,
    new_state,
} = require('../src/lua');

const L = new_state();
const data = {};
const code = 
`print(data)
`;
run(L, code, data)