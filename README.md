# chat_server

#### 介绍
chat聊天项目服务端

#### 技术栈
<div>
   <span style="margin:.5rem 0;display:inline-block;padding:.5rem;background-color: #4158D0; background-image: linear-gradient(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%); color:#fff;font-weight:bold;text-decoration: underline;">node + express + socket.io + ioredis + mysql + gm</span>
</div>

#### 安装教程
1. `git clone`指令克隆项目
```shell
git clone https://github.com/zchengfa/chat_server.git
```
2. `npm install`指令安装项目依赖
```shell
npm install
```
3. 在电脑中安装`imageMagick`
[imageMagick链接](https://imagemagick.org/script/download.php#windows)
`项目中的gm依赖包需要imageMagick软件的支持，imageMagick是一款创建、编辑、合成图片的软件，项目中用到了gm来对用户头像进行拼接，所以您需要再电脑中安装该软件`


4. 本项目已配置了`pkg`脚本指令，若您不想每次执行`npm指令`来启动项目，可以根据指令来`打包`对应环境的`.exe应用程序`
* 1. 执行`tsc`指令将ts文件转换成js
```shell
npm run tsc
```

* 2. `windows`环境请执行
```shell
npm run pkgwin
```
* 3. `linux`环境请执行
```shell
npm run pkglinux
```

* 4. `macos`环境请执行
```shell
npm run pkgmacos
```
若在使用pkg打包过程中遇到问题请点击[使用pkg打包node服务项目](https://note.youdao.com/s/Y6pyHc3H)

#### 使用说明
<h6 style="color:#e0be29;" >注意：运行前还需在项目的根目录下创建一个`.env`文件，为了保护一些数据，采用了环境变量的方式进行引用，所以请在`.env`文件中设置好以下变量 </ h6 >
<div style="padding: 2rem;display: flex;flex-direction: column;justify-content: center;align-items: flex-start;background-color: transparent;color: #e850e1">
    <span style="padding:.5rem;background-color: #000">SQL_HOST(mysql主机)</span>
    <span style="margin-top:1rem;padding:.5rem;background-color: #000">SQL_USER(mysql用户名)</span>
    <span style="margin-top:1rem;padding:.5rem;background-color: #000">SQL_PASS(mysql密码)</span>
    <span style="margin-top:1rem;padding:.5rem;background-color: #000">SQL_DATABASE(mysql数据库)</span>
</div>

#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
