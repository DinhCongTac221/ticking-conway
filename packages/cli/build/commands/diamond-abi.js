"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.desc = exports.command = void 0;
const fs_1 = __importDefault(require("fs"));
const glob_1 = __importDefault(require("glob"));
const utils_1 = require("../utils");
exports.command = "diamond-abi";
exports.desc = "Merges the abis of different facets of a diamond to a single diamond abi";
const builder = (yargs) => yargs.options({
    include: { type: "array" },
    exclude: { type: "array" },
    out: { type: "string" },
});
exports.builder = builder;
const handler = (argv) => __awaiter(void 0, void 0, void 0, function* () {
    const { include: _include, exclude: _exclude, out: _out } = argv;
    const wd = process.cwd();
    console.log("Current working directory:", wd);
    const include = _include || [`${wd}/abi/*Facet.json`];
    const exclude = _exclude ||
        ["DiamondCutFacet", "DiamondLoupeFacet", "OwnershipFacet"].map((file) => `./abi/${file}.json`);
    const out = _out || `${wd}/abi/CombinedFacets.json`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const abi = [];
    for (const path of include) {
        const [resolve, , promise] = (0, utils_1.deferred)();
        (0, glob_1.default)(path, {}, (_, facets) => {
            // Merge all abis matching the path glob
            const pathAbi = facets
                .filter((facet) => !exclude.includes(facet))
                .map((facet) => require(facet))
                .map((abis) => abis.abi)
                .flat(1);
            abi.push(...pathAbi);
            resolve();
        });
        // Make the callback syncronous
        yield promise;
    }
    fs_1.default.writeFileSync(out, JSON.stringify({ abi }));
    console.log(`Created diamond abi at ${out}`);
    process.exit(0);
});
exports.handler = handler;
