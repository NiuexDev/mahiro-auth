# 更新日志

> 本文档记录了本项目所有重要的变更。
>
> 项目版本号遵循[语义化版本（Semantic Versioning）](http://semver.org/)规范。
> Commit 信息格式遵循[约定式提交（Conventional Commits）](http://conventionalcommits.org)标准。
> 本变更日志遵循 [Keep a Changelog](http://keepachangelog.com/) 格式编写。

## 1.2.0
<!-- Unreleased -->
### 新增
- 支持了`public`配置项
### 优化
- 优化了`pack`子命令复制资源的方法
<!--/ Unreleased -->


## 1.1.0
### 新增
- 支持了在配置文件中指定资源文件

## 1.0.3
### 修复
- 修复了下载源码和构建时加载动画显示不正常的问题
### 变更
- 更改了构建web时commitHash的获取方式

## 1.0.2
### 新增
- 新增了构建web时的commitHash替换
### 变更
- 微调了启动时版本号的显示

## 1.0.1
### 新增
- 新增了更完善的日志提示
### 修复
- 修复了验证配置文件不通过时依然会进行打包的问题

## 1.0.0
### 新增
- 增加了`init` `clone` `initConfig` `build` `verifyConfig` `pack` `help` 命令
- 增加了`config.yml`的覆盖警告
### 变更
- `configBuilder.ts`改为从release的assets中获取
### 修复
- 修复创建`config.yml`时正确无法移除已存在的`config.yml`的问题
### 依赖变更
- 新增了`ora ^8.2.0`

## 0.2.0
初步编写中。完成了`clone`，`initConfig`的函数体
### 新增
- 新增了`clone`函数
- 新增了`initConfig`函数
### 依赖变更
- 新增了`adm-zip ^0.5.16`
- 新增了`yaml ^2.7.1`