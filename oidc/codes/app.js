  
const express = require("express");
const app = express();
const serverlessOIDC = require("@authing/serverless-oidc");
const path = require('path');
const env = require('dotenv').config({
  path: path.resolve(process.cwd(), '../.env')
})

const authingOIDC = env.parsed;

const serverless = new serverlessOIDC();

authingOIDC.PROMPT = authingOIDC.PROMPT || 'login';
authingOIDC.SCOPE = authingOIDC.SCOPE || 'unionid email phone offline_access openid';
authingOIDC.GRANT_TYPE = authingOIDC.GRANT_TYPE || 'authorization_code';
authingOIDC.RESPONSE_TYPE = authingOIDC.RESPONSE_TYPE || 'code';

const serverlessConstructorParams = {
  client_id: authingOIDC.CLIENT_ID,
  domain: authingOIDC.DOMAIN,
  scope: authingOIDC.SCOPE,
  response_type: authingOIDC.RESPONSE_TYPE,
  prompt: authingOIDC.PROMPT
}

app.use(express.json());
app.get("/authing/oidc/redirect", async (req, res) => {
  redirect_uri = `http://${req.headers.host}/authing/oidc/redirect`;
  let query = req.query;
  if (query && query["code"]) {
    await serverless.default({
      redirect_uri: redirect_uri,
      ...serverlessConstructorParams
    });
    try {
      let token = await serverless.getTokenByCode({
        code: query["code"],
        client_secret: authingOIDC.CLIENT_SECRET,
        grant_type: authingOIDC.GRANT_TYPE,
        redirect_uri: redirect_uri
      });

      let userInfo;
      try {
        userInfo = await serverless.getUserInfoByAccessToken(token.access_token);
      } catch (err) {
        console.log(err);
      }
    
      res.send(200, {
        token,
        userInfo
      });

    } catch (err) {
      console.log(err);
      res.send(400, err);
    }
  }
  return;
});

app.get("/userinfo", async (req, res) => {
  try {
    let userInfo = await serverless.getUserInfoByAccessToken(req.query.access_token);
    res.send(200, userInfo)
  } catch (err) {
    console.log(err);
    res.send(400, err);
  }
});

app.get("/login", async (req, res) => {
  let host = req.headers.host;
  redirect_uri = `http://${host}/authing/oidc/redirect`;
  const oidcUrl = await new serverlessOIDC().default({
    redirect_uri: redirect_uri,
    ...serverlessConstructorParams
  });
  res.redirect(302, oidcUrl);
});

app.listen(3000, function() {
  console.log("listening on port 3000");
});
module.exports = app;