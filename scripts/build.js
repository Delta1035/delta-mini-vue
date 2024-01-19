// 把package下的所有包都打包一下
const fs = require("fs");
const { PACKAGES } = require("../constant");
const execa = require("execa");
const targets = fs.readdirSync(PACKAGES).filter((file) => {
  console.log(file);
  if (fs.statSync(PACKAGES + "/" + file).isDirectory()) {
    return true;
  } else {
    return false;
  }
});
console.log(targets);
async function build(target) {
  // console.log(target);
  // const { execa } = await import("execa");
  await execa("rollup", ["-c", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  }); //把子进程的信息共享给父进程
}

function runParallel(targets, iteratorFn) {
  console.log("start :>>>>>>");
  const res = [];
  for (const target of targets) {
    const p = iteratorFn(target);
    res.push(p);
  }

  return Promise.all(res);
}

runParallel(targets, build);
