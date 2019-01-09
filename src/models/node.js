import { setProp, createAction, createErrorPayload } from './helper';
import * as api from './api';

const emptyEditing = {
  mode: 1,  //   1-create 2-update
  path: '',
  range: [[0, 0], [0, 0]],
  title: '',
  content: '',
  fileId: 0,
  code: '',
  type: 1,  // 1-line widget
  labels: [],
};

export default  {
  namespace: 'node',
  state: {
    editing: undefined,
    nodes: {},  //  {id, node}
    current: 0, //  current id
  },
  reducers: {
    editing: undefined,
    setNodes: setProp('nodes'),
    setCurrent: setProp('current'),
    setEditing: (state, action) => {
      return { ...state, editing: {...state.editing, ...action.payload }}
    },
    finishEditing: (state, action) => {
      return { ...state, editing: undefined }
    },
    beginEditing: (state, action) => {
      return { ...state, editing: {...emptyEditing, ...action.payload }}
    }
  },
  effects: {
    *createNode(action, { put, select, call }) {
      try {
        yield console.warn('create node');
        const node = yield select(state => state.node.editing);
        const { title, content, range, fileId, code, type, labels } = node;
        const pointId = yield select(state => state.point.current);
        const path = yield (node.path || select(state => state.file.path));
        const body = yield call(api.createNode, {
          params: { pointId },
          body: { title, content, path, 
            range: JSON.stringify(range), 
            fileId, code, type, 
            labels: JSON.stringify(labels) 
          },
        });
        console.warn(body);
        yield put(createAction('point/getPointDetail', { pointId }));
        yield put(createAction('finishEditing', undefined));
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '创建条目失败'));
      }
    },
    *openNodeEditor(action, { put, select }) {
      const { code, range, mode } = action.payload;
      const path = yield select(action => action.file.path);
      yield put(createAction('beginEditing', { path, code, range, mode }));
    },
  }
}

export function parseRawNode(node) {
  node.range = JSON.parse(node.range);
  node.lables = JSON.parse(node.labels);
  return node;
}