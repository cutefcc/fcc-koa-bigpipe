# Koa bigpipe demo

- 打开百度的控制台可以在 response heaer 中看到 Transfer-Encoding: chunked，表示开启了 bigpipe
- 分块传输编码（Chunked transfer encoding）是超文本传输协议（HTTP）中的一种数据传输机制，允许 HTTP 由网页服务器发送给客户端应用（ 通常是网页浏览器）的数据可以分成多个部分。分块传输编码只在 HTTP 协议 1.1 版本（HTTP/1.1）中提供。
- 第一种 bigpipe 的方式
  > 页面表现 404，但是内容出来了

```
server.get("/", async (ctx, next) => {
  // 非常简单的一种bigpipe
  const file = fs.readFileSync(resolve(join(__dirname, "index.html")));
  ctx.res.write(file);
  ctx.res.end();
});
```
