// console.log(process.env.TARGET, ">>>>>>>>>>>>>>>>>>>>>>>>>");
// const path = require("path");
// const json = require("@rollup/plugin-json");
// const resolvePlugin = require("@rollup/plugin-ts");
// const ts = require("rollup-plugin-typescript2");
// const {
//   PACKAGES,
//   PACKAGE_JSON,
//   DIST,
//   ESM_BUNDLER_EXT,
//   CJS_EXT,
//   GLOBAL_EXT,
// } = require("./constant");
import json from "@rollup/plugin-json";
import resolvePlugin from "@rollup/plugin-node-resolve";
import fs from "fs";
import path from "path";
import ts from "rollup-plugin-typescript2";
import {
  CJS_EXT,
  DIST,
  ESM_BUNDLER_EXT,
  GLOBAL_EXT,
  PACKAGES,
  PACKAGE_JSON,
} from "./constant.js";
// const __dirname = import.meta.url;
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(__dirname);

// 根据环境变量中的target属性获取对应模块中的package.json
const packagesDir = path.resolve(__dirname, PACKAGES);
console.log("packagesDir", packagesDir);
// 包路径
const packageDir = path.resolve(packagesDir, process.env.TARGET);
console.log("packageDir", packageDir);

const resolve = (p) => path.resolve(packageDir, p);
const fileName = path.basename(packageDir);
// 拿到对应包的package.json配置文件
// const pkg = import(resolve(PACKAGE_JSON));
const jsonPath = resolve(PACKAGE_JSON);
console.log("jsonPath", jsonPath);
const pkg = JSON.parse(fs.readFileSync(jsonPath, { encoding: "utf-8" }));
console.log("pkg 解说", pkg);
const outputConfig = {
  "esm-bundler": {
    file: resolve(`${DIST}/${fileName}${ESM_BUNDLER_EXT}`),
    format: "es",
  },
  cjs: {
    file: resolve(`${DIST}/${fileName}${CJS_EXT}`),
    format: "cjs",
  },
  global: {
    file: resolve(`${DIST}/${fileName}${GLOBAL_EXT}`),
    format: "iife",
  },
};
console.log("pkg :>>>>>>>>>>>>>>>", pkg, typeof pkg);
const buildOptions = pkg.buildOptions;

function createConfig(format, output) {
  output.name = buildOptions.name;
  output.sourcemap = true;

  // rollup的配置
  return {
    input: resolve("src/index.ts"),
    output,
    plugins: [
      json(),
      ts({
        tsConfig: path.resolve(__dirname, "tsconfig.json"),
      }),
      resolvePlugin(),
    ],
  };
}
// rollup需要的打包配置
export default buildOptions.formats.map((format) => {
  console.log("format: >>>>>>>>>>>>>>>>>", format);
  return createConfig(format, outputConfig[format]);
});
