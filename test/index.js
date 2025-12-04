import { describe, it } from "node:test";
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import main from "../lib/index.js";

chai.use(chaiAsPromised);
chai.use(chaiString);

const expect = chai.expect;

describe("index", () => {
});
