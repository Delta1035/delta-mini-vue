// 把package下的所有包都打包一下
const fs = require("fs");
const PACKAGES = "packages";
const targets = fs.readdirSync(PACKAGES).filter((file) => {
  console.log(file);
  if (fs.statSync(PACKAGES + "/" + file).isDirectory()) {
    return true;
  } else {
    return false;
  }
});
console.log(targets);
