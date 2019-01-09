import * as api from './api';
import { setProp,  createErrorPayload, createAction } from './helper';
import set from 'lodash/set';

export default {
  namespace: 'file',
  state: {
    code: '',
    tree: {},
    path: '',
    files: new Map(),
    autoScroll: false,
  },
  reducers: {
    setCode: setProp('code'), //  当前代码
    setPath: setProp('path'), //  当前文件路径(此处不用id，因为有可能是没有关联 Node 的新文件)
    setFiles: setProp('files'), //  Map<id, file>
    setAutoScroll: setProp('autoScroll'), //  当前是否允许自动滚动
    setTree: (state, action) => {
      let { tree, nodes, files } = action.payload;
      const openTree = buildOpenTree(nodes || {}, files || {});
      tree = toggleTree(tree, openTree);
      return {...state, tree };
    }
  },
  effects: {
    *getFile(action, {call, put, select}) {
      try {
        const repoId = yield select(state => state.repository.current.id);
        const path =  action.payload; 
        const body = yield call(api.getFile, { params: { repoId, path }});
        yield put(createAction('setCode', body.content));
        yield put(createAction('setPath', path));
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取代码文件失败'));
      }
    },
    *scrollToNode(action, { put, select }) {
      const nodeId = action.payload;
      const node = yield select(state => state.node.nodes[nodeId]);
      if (!node) {
        console.error('node not found, nodeId:', nodeId);
        return;
      }
      const path = yield select(state => state.file.path);
      if (path !== node.path) {
        yield put(createAction('getFile', node.path));
      }
      yield put(createAction('node/setCurrent', nodeId));
      yield put(createAction('setAutoScroll', true));
    },
    *scrollDone(action, { put }) {
      yield put(createAction('node/setAutoScroll', false));
    }
  },
}

function buildOpenTree(nodes, files) {
  const root = Object.values(nodes).reduce((tree, node) => {
    let file = files[node.fileId];
    if (file && file.path) {
      set(tree, file.path.split('/'), true);
    }
    return tree;
  }, {});
  return { root };
}

function toggleTree(tree, openTree, parent) {
  let newTree = { name: tree.name };
  newTree.parent = parent;

  if (tree.children) {  // folder
    newTree.children = [];
    newTree = tree.children.reduce((aac, node) => {
      const openTreeNode = openTree && openTree[tree.name] || false;
      node = toggleTree(node, openTreeNode, newTree)
      aac.toggled = aac.toggled || node.toggled;
      aac.children.push(node);
      return aac;
    }, newTree);
  } else {  //  file
    if (openTree[tree.name] === true) {
      newTree.toggled = true;
      newTree.active = true;
    }
  }
  return newTree;
}
