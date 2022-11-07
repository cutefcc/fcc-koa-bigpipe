const koa = require("koa");
const router = require("koa-router");
const render = require("koa-swig");
const { resolve, join } = require("path");
const co = require("co");
const fs = require("fs");

const app = new koa();
const server = new router();

app.context.render = co.wrap(
  render({
    root: join(__dirname, "views"),
    autoescape: true,
    // ssr 最关键的地方
    cache: false,
    // cache: "memory",
    ext: "html",
    writeBody: false,
  })
);

// 基础页面
server.get("/test", async (ctx, next) => {
  ctx.body = await ctx.render("index");
});

server.get("/", async (ctx, next) => {
  //   const filename = resolve(join(__dirname, "index.html"));
  //   const stream = fs.createReadStream(filename);
  // 非常简单的一种bigpipe
  const file = fs.readFileSync(resolve(join(__dirname, "index.html")));
  ctx.res.write(file);
  ctx.res.end();
});

app.use(server.routes()).use(server.allowedMethods());

app.listen(3001, () => {
  console.log("Server is running at port 3001");
});
