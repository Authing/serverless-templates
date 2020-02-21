# 在腾讯云部署 AUthing OIDC 流程后端

![](https://cdn.authing.cn/blog/20200221190154.png)

[Authing](https://authing.cn) 提供适用于 Web、iOS 和 Android 的跨平台无服务器认证和授权平台，兼容 OAuth2.0、OIDC、AD/LDAP、SAML 等各类协议，平台现有数千名开发者用户，分布在美国、欧洲、加拿大、澳大利亚、日本、中国香港、中国台湾等国家和地区，每月处理数十万次身份认证。

OIDC 协议是 Authing 推荐的最佳身份认证实践。

本项目用于使用 [Authing OIDC 流程](https://docs.authing.cn/authing/advanced/oidc/oidc-authorization)进行身份认证时后端接口的快速部署，这些接口包含了「使用 Code 换取  access_token」、「使用 access_token 换取 userInfo」以及进入登录页面 URL 拼接功能。

此项目完全基于腾讯云 Serverless 服务器，可大大缩减使用成本。 如果正在寻找一个低开销的便捷轻量的 Serverless OIDC 服务框架，这是最好的选择。

OIDC 认证流程图如下：

![](https://cdn.authing.cn/blog/20200221190225.png)

更多关于 OIDC 流程的理解请[点击这里查看](https://docs.authing.cn/authing/advanced/oidc/understand-oidc)。

操作步骤：

1. [安装](#1-安装)
2. [部署](#2-部署)


### 1. 安装

首先，通过如下命令安装 [Serverless Framework](https://www.github.com/serverless/serverless):

```console
$ npm i -g serverless
```

之后可以新建一个空的文件夹，使用 `create --template-url`，安装相关 template。

```console
$ serverless create --template-url https://github.com/Authing/serverless-templates/tree/master/oidc
```

使用`cd`命令，进入`serverless-templates\oidc` 文件夹，可以查看到如下目录结构：

```
|- codes
|- serverless.yml      # 使用项目中的 yml 文件
```

在`codes` 文件目录执行 NPM 依赖的安装，如下命令所示：

```console
$ cd codes
$ npm i
```

### 2. 部署

回到`oidc`目录下，直接通过 `sls` 命令来部署应用:

```console
$ sls
```

如果希望查看部署详情，可以通过调试模式的命令 `sls --debug` 进行部署。

如您的账号未[登陆](https://cloud.tencent.com/login)或[注册](https://cloud.tencent.com/register)腾讯云，您可以直接通过微信扫描命令行中的二维码进行授权登陆和注册。

部署成功后，可以直接在浏览器中访问日志中返回的 dashboard url 地址，查看该全栈 Web app 的效果:

```
  dashboard:
    url: https://jcwm1l-myappid.cos-website.ap-guangzhou.myqcloud.com
    env:
      apiUrl: https://service-id-myappid.gz.apigw.tencentcs.com/release/
  api:
    region:              undefined
    functionName:        tencent-fullstack-api
    apiGatewayServiceId: service-id
    url:                 https://service-id-myappid.gz.apigw.tencentcs.com/release/

  15s » dashboard » done
```

&nbsp;

> 注:

1. 首次部署成功后，也可以通过以下命令，在本地运行服务，并与后端腾讯云服务进行通讯：

```console
$ cd dashboard && npm run start
```

2. 目前暂不支持淘宝等第三方 npm 源，如报错`Component "@serverless/tencent-express" was not found on NPM nor could it be resolved locally.`请设置并使用 npm 官方源体验：

```console
$ npm config rm registry
$ npm set registry https://registry.npmjs.org/
```

3. 腾讯云 Component 已支持二维码一键登录，如您希望使用配置秘钥的方式登录，也可以参考如下步骤：
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