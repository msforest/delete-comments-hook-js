/**
 * 实现删除行内注释，不支持块状注释
 */

// var t = require("@babel/types");
var { parse } = require("@babel/parser");
var { default: traverse } = require("@babel/traverse");
var { default: generate } = require("@babel/generator");
var fs = require("fs");
var path = require("path");
var { execSync } = require("child_process");
var visitor = {
  enter(path) {
    if (path.node.leadingComments) {
      path.node.leadingComments = path.node.leadingComments.reduce(
        (arr, comment) => {
          if (comment.type === "CommentLine") {
            return arr;
          }
          arr.push(comment);
          return arr;
        },
        []
      );
    }
  }
};

var data = execSync("git diff --name-only --cached -- '*.js'", {
  encoding: "utf8"
});

var files = data.split("\n").filter(Boolean);
for (let file of files) {
  var fileName = path.resolve(__dirname, file);
  var codes = fs.readFileSync(fileName, "utf8");
  var ast = parse(codes);
  traverse(ast, visitor);
  var { code } = generate(ast, {}, codes);
  console.log(code);
  fs.writeFileSync(fileName, code);
}
if (files.length) {
  process.exit(1); // 停止commit
}
