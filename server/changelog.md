# 更新日志

> 本文档记录了本项目所有重要的变更。
>
> 项目版本号遵循[语义化版本（Semantic Versioning）](http://semver.org/)规范。
> Commit 信息格式遵循[约定式提交（Conventional Commits）](http://conventionalcommits.org)标准。
> 本变更日志遵循 [Keep a Changelog](http://keepachangelog.com/) 格式编写。

<!-- Unreleased -->
## [Unreleased]
### 新增
- 新增了作为命令行的使用方式
  - 新增了`version`子命令，用以查看版本及当前构建的提交完整hash

<!--/ Unreleased -->

## 0.0.42
### 优化
- 优化了配置文件验证结果的输出格式
- 优化了编译时附加`commitHash`的方式

## 0.0.41
当前`server`、`config`、`logger`模块已基本完成