let { h, diff, Context } = require("../dist/atomico-diff");

describe("diff in children", () => {
    test("create context", () => {
        let div = document.createElement("div");

        new Context(div, context => {
            return {
                property: true
            };
        });

        diff(false, div, <host />);
    });
});
