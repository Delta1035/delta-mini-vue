console.log(process.env.TARGET, ">>>>>>>>>>>>>>>>>>>>>>>>>");
const path = require("path");
const {
  PACKAGES,
  PACKAGE_JSON,
  DIST,
  ESM_BUNDLER_EXT,
  CJS_EXT,
  GLOBAL_EXT,
} = require("./constant");
// 根据环境变量中的target属性获取对应模块中的package.json
const packagesDir = path.resolve(__dirname, PACKAGES);
console.log("packagesDir", packagesDir);
// 包路径
const packageDir = path.resolve(packagesDir, process.env.TARGET);
console.log("packageDir", packageDir);

const resolve = (p) => path.resolve(packageDir, p);
const fileName = path.basename(packageDir);
// 拿到对应包的package.json配置文件
const pkg = require(resolve(PACKAGE_JSON));

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
    format: "global",
  },
};

const buildOptions = pkg.buildOptions;

buildOptions.format.map((format) => {
  console.log("format: >>>>>>>>>>>>>>>>>", format);
});
