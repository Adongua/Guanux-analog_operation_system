# Tp5_template

河北大学易班学生工作站 / 技术开发部 

易班轻应用开发框架

## 简介

河北大学易班学生工作站 目前使用的开发框架，其中集成了：

- 易班授权
- 微信公众号授权

其中，后端基于 `ThinkPHP 5.1` 实现，

前端模板使用基于 `Bootstrap` 开发的 `SBAdmin前端框架`。

## 开始使用

1. 将项目clone到服务器根目录。
2. 将 `runtime` 文件夹授予 `777` 权限。
3. 填写 `config` 文件夹中的配置。

`config` 文件夹中用于填写线上配置，开发时的配置可以写在 `.env` 文件中

### 目录结构

基本符合 `ThinkPHP 5` 的文件结构，有修改的地方会用中括号标出。

```
www  WEB部署目录（或者子目录）
├─application           应用目录
│  ├─common                 公共模块目录（可以更改）
│  │  └─AppException.php    [新增]异常处理
│  │
│  ├─module_name        模块目录
│  │  ├─common.php      模块函数文件
│  │  ├─controller      控制器目录
│  │  ├─model           模型目录
│  │  ├─view            视图目录
│  │  ├─config          配置目录
│  │  └─ ...            更多类库目录
│  ├─index              [新增]易班/微信授权
│  ├─admin              [新增]后台管理
│  ├─user_index         [新增]用户首页
│  │
│  ├─command.php        命令行定义文件
│  ├─common.php         公共函数文件
│  └─tags.php           应用行为扩展定义文件
│
├─config                应用配置目录
│  ├─module_name        模块配置目录
│  │  ├─database.php    数据库配置
│  │  ├─cache           缓存配置
│  │  └─ ...            
│  │
│  ├─app.php            应用配置
│  ├─cache.php          缓存配置
│  ├─cookie.php         Cookie配置
│  ├─database.php       数据库配置
│  ├─log.php            日志配置
│  ├─session.php        Session配置
│  ├─template.php       模板引擎配置
│  ├─trace.php          Trace配置
│  ├─consts.php         [新增]常量配置
│  ├─err_page.php       [新增]错误页配置
│  ├─wechat_auth.php    [新增]微信授权配置
│  └─yiban_auth.php     [新增]易班授权配置
│
├─route                 路由定义目录
│  ├─route.php          路由定义
│  └─...                更多
│
├─public                WEB目录（对外访问目录）
│  ├─index.php          入口文件
│  ├─router.php         快速测试文件
│  └─.htaccess          用于apache的重写
│
├─thinkphp              框架系统目录
│  ├─lang               语言文件目录
│  ├─library            框架类库目录
│  │  ├─think           Think类库包目录
│  │  └─traits          系统Trait目录
│  │
│  ├─tpl                系统模板目录
│  ├─base.php           基础定义文件
│  ├─convention.php     框架惯例配置文件
│  ├─helper.php         助手函数文件
│  └─logo.png           框架LOGO文件
│
├─extend                扩展类库目录
│  ├─weixinApi          微信授权扩展类
│  └─yibanApi           易班授权扩展类
│
├─.env                  开发时临时配置文件 (优先级 > config)
├─runtime               应用的运行时目录（可写，可定制）
├─vendor                第三方类库目录（Composer依赖库）
├─build.php             自动生成定义文件（参考）
├─composer.json         composer 定义文件
├─LICENSE.txt           授权说明文件
├─README.md             README 文件
└─think                 命令行入口文件
```

### 注意事项

1. 上线前关闭ThinkPHP的调试模式
2. 日志等级建议 > `INFO` ，请在 `config/log.php` 中配置

## 其他

1. ThinkPHP 5.1 开发文档：https://www.kancloud.cn/manual/thinkphp5_1/353946
2. 易班授权API文档：https://o.yiban.cn/wiki/index.php?page=%E6%98%93%E7%8F%ADapi
3. 微信授权API文档：https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html

## LICENSE

本项目遵循 Apache License 2.0 开源。