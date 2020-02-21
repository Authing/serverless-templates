# 在腾讯云部署 Authing OIDC 认证流程后端

![](https://cdn.authing.cn/blog/20200221190154.png)

[Authing](https://authing.cn) 提供适用于 Web、iOS 和 Android 的跨平台无服务器认证和授权平台，兼容 OAuth2.0、OIDC、AD/LDAP、SAML 等各类协议，平台现有数千名开发者用户，分布在美国、欧洲、加拿大、澳大利亚、日本、中国香港、中国台湾等国家和地区，每月处理数十万次身份认证。

**[OIDC 协议](https://docs.authing.cn/authing/advanced/oidc/understand-oidc)是 Authing 推荐的最佳身份认证实践。**

本项目用于使用 [Authing OIDC 流程](https://docs.authing.cn/authing/advanced/oidc/oidc-authorization)进行身份认证时后端接口的快速部署，这些接口包含了「使用 Code 换取  access_token」、「使用 access_token 换取 userInfo」以及进入登录页面 URL 拼接功能。

此项目完全基于腾讯云 Serverless 服务器，可大大缩减使用成本。 如果正在寻找一个低开销的便捷轻量的 Serverless OIDC 服务框架，这是最好的选择。

在 使用本项目前你 需要拥有 OIDC 认证[背景知识](https://docs.authing.cn/authing/advanced/oidc/understand-oidc)。

[本项目演示 Demo](http://service-pzh0ikw7-1255785256.sh.apigw.tencentcs.com/release/login)。

操作步骤：

1. [安装](#1-安装)
2. [部署](#2-部署)
3. [测试](#3-测试)

## 1. 安装

首先，通过如下命令安装 [Serverless Framework](https://www.github.com/serverless/serverless):

```console
$ npm i -g serverless
```

之后可以新建一个空的文件夹，使用 `create --template-url`，安装相关 template。

```console
$ serverless create --template-url https://github.com/Authing/serverless-templates/tree/master/oidc
```

使用`cd`命令，进入`serverless-templates/oidc` 文件夹，可以查看到如下目录结构：

```
|- codes
|- serverless.yml      # 使用项目中的 yml 文件
```

`codes` 文件夹的结构如下所示：

```
|- app.js      # OIDC 后端主文件，基于 express 
|- packae.json
```

在 `codes` 文件目录执行 NPM 依赖的安装，如下命令所示：

```console
$ cd codes
$ npm i
```

## 2. 部署

### 获取 Authing 必须信息
<p>
1. 首先注册一个 <a href="https://sign.authing.cn/login" target="_blank">Authing 账号</a>。

<p>
2. 注册完成后在控制台中依次点击 <strong>第三方登录</strong> -> <strong>OIDC 应用</strong>后，可以看到OIDC 应用列表，点击应用名即可看到该应用信息。
</p>

![](https://cdn.authing.cn/blog/20200221220348.png)

<p>
3. 在应用信息中可以看到 <strong>AppID</strong>、<strong>Secret</strong>和<strong>认证地址</strong>。
</p>

![](https://cdn.authing.cn/blog/20200221220448.png)

### 修改配置

进入 `codes` 目录，新建 `.env` 文件：

```shell
$ touch .env
```

然后填充以下配置：

```shell
# .env

CLIENT_ID=YOUR_OIDC_CLIENTID # Authing OIDC 应用中的 AppID
CLIENT_SECRET=YOUR_OIDC_CLIENR_SECRET # Authing OIDC 应用中的 Secret
DOMAIN=YOUR_OIDC_DOMAIN.authing.cn # Authing OIDC 应用中的认证地址
```

### 执行部署

修改完配置后回到`oidc`目录下，直接通过 `sls` 命令来部署应用:

```console
$ sls
```

如果希望查看部署详情，可以通过调试模式的命令 `sls --debug` 进行部署。

如您的账号未[登陆](https://cloud.tencent.com/login)或[注册](https://cloud.tencent.com/register)腾讯云，您可以直接通过微信扫描命令行中的二维码进行授权登陆和注册。

```
  express: 
    region:              ap-shanghai
    functionName:        ExpressComponent_2x6bsx
    apiGatewayServiceId: service-pzh0ikw7
    url:                 http://service-pzh0ikw7-1255785256.sh.apigw.tencentcs.com/release/

  15s » dashboard » done
```

部署完成后将返回的地址拼接「/authing/oidc/redirect」填写到 Authing OIDC 应用中的「回调 URL 中」，如：

```
http://service-pzh0ikw7-1255785256.sh.apigw.tencentcs.com/release/authing/oidc/redirect
```

![](https://cdn.authing.cn/blog/20200221220546.png)

## 3. 测试

部署成功后你可访问返回链接中的 `/login` 路由进行登录，登录成功后你将看到返回了 access_token 和用户信息，如：

 ```
http://service-pzh0ikw7-1255785256.sh.apigw.tencentcs.com/release/login
```

[点击查看本项目演示](http://service-pzh0ikw7-1255785256.sh.apigw.tencentcs.com/release/login)。

### 路由说明

部署成功后的后端会拥有三个路由：

1. [/login](#/login-路由)
2. [/authing/oidc/redirect](#/authing/oidc/redirect-路由)
3. [/userinfo](#/userinfo-路由)

#### /login 路由

`/login` 路由用来执行登录，该路由会将用户重定向到在 `serverless.yml` 文件中配置的 `domain`。

![](https://cdn.authing.cn/blog/20200221191659.png)

#### /authing/oidc/redirect 路由

`/authing/oidc/redirect` 路由是登录成功后的业务回调地址，该地址会返回用户的 `access_token` 和 `userinfo`信息。

你可以在这个路由中处理你具体的业务信息，比如设置 cookie、发送数据到你的其他项目中。

`access_token` 和 `userinfo` 示例：

```
{
	"token": {
		"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJfVkRFaWhYME4yUnIxX3RKQ1Z1UTciLCJzdWIiOiI1Yjg4YWFlYTM0OWUyZDAwMDFhNWI3MTgiLCJpc3MiOiJodHRwczovL29hdXRoLmF1dGhpbmcuY24vb2F1dGgvb2lkYyIsImlhdCI6MTU4MjI4NDA3MSwiZXhwIjoxNTgyMjg3NjcxLCJzY29wZSI6InVuaW9uaWQgZW1haWwgcGhvbmUgb3BlbmlkIiwiYXVkIjoiNWU0ZWJlMjVmYTkyMThmMDU5ODQ0MTc0In0.b5-gZQXxRrhnNIcz3LmQFChwytfO97un__MeGhbFOQ0",
		"expires_in": 3600,
		"id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlvbmlkIjoiMjQ2OTY4OCIsImVtYWlsIjoieGlleWFuZ0Bkb2RvcmEuY24iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX251bWJlciI6IiIsInBob25lX251bWJlcl92ZXJpZmllZCI6ZmFsc2UsInN1YiI6IjViODhhYWVhMzQ5ZTJkMDAwMWE1YjcxOCIsImF1dGhfdGltZSI6MTU4MjI4NDA3MSwiYXRfaGFzaCI6IkR4b3haa2pOWEhGZi04M0lGQkxsQWciLCJzaWQiOiI0ZjI1OTE3Yi1jMTIxLTQzYjctYjI5MC1lYzgzY2Q3ZjA1ZTYiLCJhdWQiOiI1ZTRlYmUyNWZhOTIxOGYwNTk4NDQxNzQiLCJleHAiOjE1ODIyODc2NzEsImlhdCI6MTU4MjI4NDA3MSwiaXNzIjoiaHR0cHM6Ly9vYXV0aC5hdXRoaW5nLmNuL29hdXRoL29pZGMifQ.W5xip0pzxLiUhTlGlvvhm4NkClLotgKBEgXMSRA8qKk",
		"scope": "unionid email phone openid",
		"token_type": "Bearer"
	},
	"userInfo": {
		"unionid": "xxxxxxxx",
		"email": "xxxx@xxxxx.cn",
		"email_verified": false,
		"phone_number": "",
		"phone_number_verified": false,
		"sub": "5b88aaea349e2d0001a5b718"
	}
}
```

#### /userinfo 路由

`/userinfo` 路由是用 `access_token` 换取 `userinfo` 的路由，若你需要重新获取 userinfo 请以 `userinfo?access_token=从 /authing/oidc/redirect 中获取的 access_token` 形式发送 access_token 重新获取。

&nbsp;

## 注

腾讯云 Component 已支持二维码一键登录，如您希望使用配置秘钥的方式登录，也可以参考如下步骤：
   在`tencent-fullstack-react-application` 文件夹根目录创建 `.env` 文件

```console
$ touch .env # 腾讯云的配置信息
```

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存
如果没有腾讯云账号，可以在此[注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在[API 密钥管理](https://console.cloud.tencent.com/cam/capi)中获取 `SecretId` 和`SecretKey`

```
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```