import { setProp, createAction, createErrorPayload } from './helper';

export default  {
  namespace: 'node',
  state: {
    mode: 1,        //  widget 类型 1-lineWidget
    visible: false,
  },
  reducers: {
    setVisible: setProp('visible'),
    setPath: setProp('path'),
    setRange: setProp('range'),
    setTitle: setProp('title'),
    setContent: setProp('content'),
    setFileId: setProp('fileId'),
    setCode: setProp('code'),
    setType: setProp('type'),
    setLabels: setProp('labels'),
  },
  effects: {
    *createNode(action, { put }) {
      yield console.warn('create node');
      yield put(createAction('setVisible', false));
    },
    *updateNode(action, { put }) {
      try {
        yield console.warn('update node');
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '更新条目失败'));
      }
    },
  }
}