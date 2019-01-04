import * as api from './api';
import { setProp, createErrorPayload } from './helper';
import set from 'lodash/set';
import yaml from 'js-yaml';

export default {
  namespace: 'repository',
  state: {},
  reducers: {
    setCurrentRepo: setProp('currentRepo'),
    setPoints: setProp('points'),
    setCurrentPoint: setProp('currentPoint'),
    setCurrentNode: setProp('currentNode'),
  },
  effects: {
    *getReposotoryDetail(action, { call, put }) {
      try {
        const params = { repoId: action.payload };
        const body = yield call(api.getRepositoryDetail, { params });
        console.log(body);
        let { fileTree, points, repository } = body;
        fileTree = yaml.load(fileTree);

        yield put({ type: 'setCurrentRepo', payload: repository })
        yield put({ type: 'file/setTree', payload: { name: 'root', children: fileTree } });
        yield put({ type: 'setPoints', payload: points });
        if (points.length > 0) {
          yield put({ type: 'getPointDetail', payload: points[0].id });
        }
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取仓库信息情失败'));
      }
    },
    *getPointDetail(action, {call, put, select}) {
      try {
        const params = { pointId: action.payload };
        const pointDetail = yield call(api.getPointDetail, { params });
        console.log(pointDetail);
        yield put({ type: 'setCurrentPoint', payload: pointDetail});
        const { point, nodes, files } = pointDetail;
        const currentNode = getDefaultNode(point, nodes);
        if (currentNode) {
          yield put({ type: 'setCurrentNode', payload: currentNode });
          const file = files && files[currentNode.fileId];
          if (file) {
            yield put({ type: 'file/getFile', payload: {repoId: point.repoId, filePath: file.path}});
          } else {
            console.warn('current file not found');
          }
        } else {
          console.warn('current node not found');
        }
        let startT = +new Date();
        const tree = yield select(state => state.file.tree);
        if (tree && files) {
          const openTree = buildOpenTree(nodes, files);
          console.warn(openTree);
          const newTree = toggleTree(tree, openTree);
          yield  put({ type: 'file/setTree', payload: newTree });
        }
        console.warn('compute tree duration', +new Date() - startT);
      } catch (err) {
        console.error(err)
        yield put(createErrorPayload(err, '获取知识点详情失败'));
      }
    }
  }
};

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

function toggleTree(tree, openTree) {
  let newTree = { name: tree.name };

  if (tree.children) {  // folder
    newTree.children = [];
    newTree = tree.children.reduce((aac, node) => {
      const openTreeNode = openTree && openTree[tree.name] || false;
      node = toggleTree(node, openTreeNode)
      aac.toggled = aac.toggled || node.toggled;
      aac.children.push(node);
      return aac;
    }, newTree);
  } else {  //  file
    newTree.toggled = openTree[tree.name] === true;
  }
  return newTree;
}
