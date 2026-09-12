// jest-dom adds custom jest matchers for asserting on DOM nodes.
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "util";

// The jsdom that ships with react-scripts predates TextEncoder/TextDecoder
// being globals. react-router v7 reaches for them at import time, so any test
// that renders a route cannot even load the module without these. Browsers and
// Node both provide them; this only fills the gap in the test environment.
if (typeof global.TextEncoder === "undefined") {
    global.TextEncoder = TextEncoder as typeof global.TextEncoder;
    global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}
