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
  ///////////////////////////////////////////////
  // 两个task 模拟我们的异步任务
  const task1 = function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`<script>addHtml('part1', '第一次传输<br />')</script>`);
      }, 2000);
    });
  };
  const task2 = function () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(`<script>addHtml('part2', '第二次传输<br />')</script>`);
      }, 3000);
    });
  };
  ///////////////////////////////////////////////demo1 非常简单的一种bigpipe
  //   const file = fs.readFileSync(resolve(join(__dirname, "index.html")));
  //   ctx.status = 200;
  //   ctx.type = "html";
  //   ctx.res.write(file);
  //   ctx.res.end();
  ///////////////////////////////////////////////demo2 比较常见的一种bigpipe 但是这种方式会导致页面的闪烁
  //   ctx.status = 200;
  //   ctx.type = "html";
  //   const filename = resolve(join(__dirname, "index.html"));

  //   function createSsrStreamPromise() {
  //     return new Promise((resolve, reject) => {
  //       const stream = fs.createReadStream(filename);
  //       stream.on("error", reject).pipe(ctx.res);
  //     });
  //   }
  //   await createSsrStreamPromise();
  ///////////////////////////////////////////////demo3 stream.on("data") 一点点读取
  //   ctx.status = 200;
  //   ctx.type = "html";
  //   const filename = resolve(join(__dirname, "index.html"));

  //   function createSsrStreamPromise() {
  //     return new Promise((resolve, reject) => {
  //       const stream = fs.createReadStream(filename);
  //       stream
  //         .on("data", (chunk) => {
  //           ctx.res.write(chunk);
  //         })
  //         .on("end", () => {
  //           ctx.res.end();
  //         });
  //     });
  //   }
  //   await createSsrStreamPromise();
  ///////////////////////////////////////////////demo4 MPA 该同步的同步，该异步的异步，解决MPA过大问题
  const file = fs.readFileSync(resolve(join(__dirname, "index.html")));
  ctx.status = 200;
  ctx.type = "html";
  ctx.res.write(file);

  const res1 = await task1();
  ctx.res.write(res1);
  const res2 = await task2();
  ctx.res.write(res2);
  ctx.res.end();
  ///////////////////////////////////////////////demo5
  // 如果是经过了前端模板的 render 的 -- html
  //   function createSsrStreamPromise() {
  //     return new Promise((resolve, reject) => {
  //       const htmlStream = new Readable();
  //       htmlStream.push(html);
  //       htmlStream.push(null);
  //       htmlStream
  //         .on("error", (err) => {
  //           reject(err);
  //         })
  //         .pipe(ctx.res);
  //     });
  //   }

  //   await createSsrStreamPromise();
});

app.use(server.routes()).use(server.allowedMethods());

app.listen(3001, () => {
  console.log("Server is running at port 3001");
});
