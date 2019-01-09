import { setProp, createErrorPayload, createAction } from './helper';
import * as api from './api';
import forEach from 'lodash/forEach';
import { parseRawNode } from './node';

export const openFromNode = 1;
export const openFromContent = 2;

const emptyEditing = {
  mode: 1,  //  1-create 2-update
  relationType: 1, //  1-顺序结构
  userId: 0,
  title: '',
  content: '',
  relations: [],
  labels: [],
  repoId: 0,
  repoName: '',
  openFrom: 0,  //  1 - from node editing 2- from content page
};

export default {
  namespace: 'point',
  state: {
    visible: false,
    points: {},
    editing: undefined,
    current: 0,
  },
  reducers: {
    setCurrent: setProp('current'),
    setPoints: setProp('points'),
    setEditing: (state, action) => {
      return { ...state, editing: { ...state.editing, ...action.payload }}; 
    },
    finishEditing: (state, action) => {
      return { ...state, editing: undefined }
    },
    beginEditing: (state, action) => {
      return { ...state, editing: {...emptyEditing, ...action.payload }}
    }
  },
  effects: {
    *createPoint(action, { put, call, select }) {
      try {
        const { title, content, relations, labels, repoId } = yield select(state => state.point.editing);
        const resp = yield call(api.createPoint, {
          params: { repId: repoId },
          body: { 
            title, content, 
            relations: JSON.stringify(relations), 
            labels: JSON.stringify(labels), 
            repoId
          },
        });
        yield put(createAction('getPointDetail', { pointId: resp.id }));
        yield put(createAction('finishEditing', undefined));
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '创建知识点失败'));
      }
    },
    *openPointEditor(action, { put, select }) {
      const repo = yield select(state => state.repository.current);
      if (repo) {
        yield put(createAction('beginEditing', { 
          repoId: repo.id, 
          repoName: repo.url, 
          openFrom: action.payload 
        }));
      } else {
        console.error('repo not found: currentRepo');
      }
    },
    *getPointDetail(action, {call, put, select}) {
      try {
        const params = { pointId: action.payload.pointId };
        const pointDetail = yield call(api.getPointDetail, { params });
        let { point, nodes, files } = pointDetail;
        point = parseRawPoint(point);
        forEach(nodes, (node) => parseRawNode(node));
        yield put(createAction('setCurrent', point.id));
        const currentNode = getDefaultNode(point, nodes);
        yield put(createAction('node/setNodes', nodes));
        yield put(createAction('file/files', files));
        if (currentNode) {
          yield put(createAction('node/setCurrent', currentNode.id));
          yield put(createAction('file/setCurrent', currentNode.fileId));
          yield put(createAction('file/getFile', currentNode.path));
          const file = Object.keys(files).length > 0 && files[currentNode.fileId];
          if (!file) {
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
        tree = tree || {};
        yield put(createAction('file/setTree', { tree, nodes, files }));
        console.warn('compute tree duration', +new Date() - start);
      } catch (err) {
        console.error(err)
        yield put(createErrorPayload(err, '获取知识点详情失败'));
      }
    },
  }
}

function getDefaultNode(point, nodes) {
  if (point.relationType === 1)  {
    if (point.relations.length > 0) {
      const nodeId = point.relations[0];
      return nodes[nodeId];
    }
  }
}


export function parseRawPoint(point) {
  point.relations = JSON.parse(point.relations);
  point.labels = JSON.parse(point.labels);
  return point;
}
