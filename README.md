# source-code-blog

## Features
- frontend
  - clone source code from git
  - read source code
  - mark and take notes
  - generate blog using structure notes and source code (like [react-router doc](https://reacttraining.com/react-router/web/guides/quick-start))
  - visualization

## Quick Start
- server
  - dependencies
    - mysql
  - set environment variables 
    - `GITHUB_USERNAME=tensor1014`
    - `GITHUB_TOKEN=ce******`
    - `REPO_DIR=/Users/tensor1014/repositories` // 源码目录
    - `TREE_DIR=/Users/tensor1014/tree`         //  缓存文件树
    - `MYSQL_USER=root`
    - `MYSQL_PASSWORD=vtu123456`
    - `MYSQL_DATABASE=source_code_reader`
  - start
    - `./code-reader-server`
- frontend
  - `yarn intall`
  - `yarn start`

## Todo
- 将 components 定位为 containers, 直接获取 state，将reducer中的一些逻辑抽到 mapStateToProps 中来，减少无谓render调用
- 重新定义state结构，{ editing, current, list }
- state.file.autoScroll 实现好诡异