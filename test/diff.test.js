let { h, diff } = require("../dist/atomico-diff");
describe("diff in root tag", () => {
    test("set simple attribute", () => {
        let div = document.createElement("div"),
            id = "#id";

        diff(false, div, <host id={id} />);

        expect(div.id).toBe(id);
    });

    test("set attribute style", () => {
        let div = document.createElement("div"),
            style = { background: "black" };
        diff(false, div, <host style={style} />);

        expect(div.style.background).toBe(style.background);
    });

    test("set attribute object style multiple", () => {
        let div = document.createElement("div"),
            style = { background: "black", color: "red" };
        diff(false, div, <host style={style} />);

        expect(div.style).toMatchObject(style);
    });

    test("register event", () => {
        let div = document.createElement("div"),
            handler = ({ target }) => {
                expect(div).toBe(target);
            };

        diff(false, div, <host click={handler} />);

        div.dispatchEvent(new CustomEvent("click"));
    });
});
describe("diff in children", () => {
    test("children slot exist", () => {
        let div = document.createElement("div"),
            slots = {
                img: new Image()
            };

        diff(
            false,
            div,
            <host>
                <slot name="img" />
            </host>,
            slots
        );

        expect(div.querySelector("img")).toBe(slots.img);
    });

    test("children slot add attribute", () => {
        let div = document.createElement("div"),
            slots = {
                img: new Image()
            },
            img = "sample.jpg";

        diff(
            false,
            div,
            <host>
                <slot name="img" src={img} />
            </host>,
            slots
        );

        expect(div.querySelector("img").getAttribute("src")).toBe(img);
    });
});
