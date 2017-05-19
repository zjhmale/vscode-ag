//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    // Defines a Mocha unit test
    test("Extract filepath, line number, column number and content from match result", () => {
        let reg = new RegExp("(.*):(\\d+):(\\d+):(.*)", "g");
        let result = reg.exec("src/Capital/Client/REST.hs:41:8:  -- * Investors");
        if (result) {
            let file = result[1];
            let line = parseInt(result[2]);
            let column = parseInt(result[3]);
            assert.equal(file, "src/Capital/Client/REST.hs");
            assert.equal(line, "41");
            assert.equal(column, "8");
        }
    });

    test("url encode", () => {
        assert.equal(encodeURIComponent("src/Capital/Client/REST.hs:41:8:  -- * Investors"), 'src%2FCapital%2FClient%2FREST.hs%3A41%3A8%3A%20%20--%20*%20Investors');
    });
});