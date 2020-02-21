  
const express = require("express");
const app = express();
const serverlessOIDC = require("./node_modules/@authing/serverless-oidc");
const tencentExpress = require('./node_modules/@serverless/tencent-express');
const client_id = "5e3eb1f9df538284ec6a3911";
const secert = "38f70e8ed63070f5ce21dc4feb806562";

console.log(tencentExpress);//////

const path = require("path");
const serverless = new serverlessOIDC();
app.use(express.json());
app.get("/", async (req, res) => {
  redirect_uri = `http://${req.headers.host}/`;
  let query = req.query;
  if (query && query["code"]) {
    await serverless.default({
      client_id: client_id,
      redirect_uri: redirect_uri,
      domain: "tmptest.authing.cn",
      scope: "unionid email phone offline_access openid",
      response_type: "code",
      state: "xx1x",
      nonce: "xxxx",
      prompt: "login"
    });
    try {
      let token = await serverless.getTokenByCode({
        code: query["code"],
        client_secret: secert,
        grant_type: "authorization_code",
        redirect_uri: redirect_uri
      });

      res
        .cookie("access_token", "Bearer " + token.access_token, {
          expires: new Date(Date.now() + 60 * 3600000) // cookie will be removed after 8 hours
        })
        .redirect(302, "/");
    } catch (err) {
      console.log(err);
      res.send(400, "换取Token失败");
    }
  }
  res.sendFile(path.join(__dirname + "/index.html"));
  return;
});

app.post("/userinfo", async (req, res) => {
  if (!(req.body && req.body.token)) {
    res.send(403, "Unauthorized");
    return;
  }
  let token = req.body.token;
  let user_info = "";
  try {
    user_info = await serverless.getUserInfoByAccessToken(
      token.split("%20")[1]
    );
  } catch (err) {
    console.log(err);
    user_info = "查询失败 请退出重试";
  }

  res.send(200, user_info);
});

app.get("/login", async (req, res) => {
  let host = req.headers.host;
  redirect_uri = `http://${host}/`;
  const oidcUrl = await new serverlessOIDC().default({
    client_id: client_id,
    redirect_uri: redirect_uri,
    domain: "tmptest.authing.cn",
    scope: "unionid email phone offline_access openid",
    response_type: "code",
    state: "xx1x",
    nonce: "xxxx",
    prompt: "login"
  });
  res.redirect(302, oidcUrl);
});

app.listen(3000, function() {
  console.log("listening on port 3000");
});
module.exports = app;