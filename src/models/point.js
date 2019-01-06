import { setProp, createErrorPayload, createAction } from './helper';
import * as api from './api';
import set from 'lodash/set';

export default {
  namespace: 'point',
  state: {
    mode: 1,            //  1-create 2-update
    realtionType: 1,    //   1-顺序结构
    visible: false,
    userId: 0,
  },
  reducers: {
    setVisible: setProp('visible'),
    setTitle: setProp('title'),
    setContent: setProp('content'),
    setRelations: setProp('relations'),
    setLabels: setProp('labels'),
    setRepoId: setProp('repoId'),
    setRepoName: setProp('repoName'),
    setCurrentPoint: setProp('currentPoint'),
    setPoints: setProp('points'),
  },
  effects: {
    *setCurrentRepo(action, { put, select }) {
      const repo = yield select(state => state.repository.currentRepo);
      yield put(createAction('setRepoId', repo.id));
      yield put(createAction('setRepoName', repo.url));
    },
    *createPoint(action, { put }) {
      try {
        yield console.warn(action);
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '创建知识点失败'));
      }
    },
    *updatePoint(action, { put }) {
      try {
        yield console.warn(action);
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '更新知识点失败'));
      }
    },
    *getPointDetail(action, {call, put, select}) {
      try {
        const params = { pointId: action.payload.pointId };
        const pointDetail = yield call(api.getPointDetail, { params });
        const { point, nodes, files } = pointDetail;
        yield put(createAction('setCurrentPoint', point));
        const currentNode = getDefaultNode(point, nodes);
        if (currentNode) {
          yield put(createAction('node/setCurrentNode', currentNode));
          const file = files && files[currentNode.fileId];
          if (file) {
            yield put(createAction('file/getFile', file.path));
          } else {
            console.warn('current file not found');
          }
        } else {
          console.warn('current node not found');
        }
        let start = +new Date();
        let tree = { name: 'root', children: action.payload.tree };
        if (!action.payload.tree) {
          tree = yield select(state => state.file.tree);
        }
        if (tree && files) {
          const openTree = buildOpenTree(nodes, files);
          const newTree = toggleTree(tree, openTree);
          yield  put(createAction('file/setTree', newTree));
        }
        console.warn('compute tree duration', +new Date() - start);
      } catch (err) {
        console.error(err)
        yield put(createErrorPayload(err, '获取知识点详情失败'));
      }
    },
    setCurrentPointWithEffec(action, { select, put } ) {
      const pointId = action.payload;
      const point = select(state => state.point.points[pointId]);
      put(createAction('setCurrentPoint', point));
    }

  }
}

function getDefaultNode(point, nodes) {
  if (point.relationType === 1)  {
    const relations = JSON.parse(point.relations)
    if (relations.length > 0) {
      const nodeId = relations[0];
      return nodes[nodeId];
    }
  }
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
