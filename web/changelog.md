# 更新日志

> 本文档记录了本项目所有重要的变更。
>
> 项目版本号遵循[语义化版本（Semantic Versioning）](http://semver.org/)规范。
> Commit 信息格式遵循[约定式提交（Conventional Commits）](http://conventionalcommits.org)标准。
> 本变更日志遵循 [Keep a Changelog](http://keepachangelog.com/) 格式编写。

## 0.3.1
<!-- Unreleased -->
### 变更
- 优化了打包时写入`commitHash`的方式：将`commitHash`写入config.ts中，生产环境中由`web builder`写入
<!--/ Unreleased -->

## 0.3.0
### 变更
- `config.ts`更改为使用`util/schema`创建和校验
- 确定ui方面上项目名应写为"まひろ"

## 0.2.0
仅测试，非可用版本。当前登录、注册界面已基本完成