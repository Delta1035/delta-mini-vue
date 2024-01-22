// 只针对具体的某个包
// 把package下的所有包都打包一下
// const fs = require("fs");
// const { PACKAGES } = require("../constant");
// const execa = require("execa");
import execa from "execa";
// import { PACKAGES } from "../constant";
const target = "reactivity";
async function build(target) {
  // console.log(target);
  // const { execa } = await import("execa");
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  }); //把子进程的信息共享给父进程
}
build(target);
