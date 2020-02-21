  
const express = require("express");
const app = express();
const serverlessOIDC = require("./node_modules/@authing/serverless-oidc");
const yaml = require('js-yaml');
const fs   = require('fs');

let inputs = null;
try {
  inputs = yaml.safeLoad(fs.readFileSync('../serverless.yml', 'utf8'));
  inputs = inputs.express.inputs;
} catch (e) {
  console.log(e);
}

const authingOIDC = inputs.authing.oidc;
const serverless = new serverlessOIDC();

const serverlessConstructorParams = {
  client_id: authingOIDC.clientId,
  domain: authingOIDC.domain,
  scope: authingOIDC.scope,
  response_type: authingOIDC.responseType,
  prompt: authingOIDC.prompt
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
        client_secret: authingOIDC.clientSecret,
        grant_type: authingOIDC.grantType,
        redirect_uri: redirect_uri
      });

      let userInfo;
      try {
        userInfo = await serverless.getUserInfoByAccessToken(token.access_token);
      } catch (err) {
        console.log(err);
      }
    
      res.send(400, {
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