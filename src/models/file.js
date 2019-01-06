import * as api from './api';
import { setProp,  createErrorPayload, createAction } from './helper';

export default {
  namespace: 'file',
  state: {},
  reducers: {
    setCode: setProp('code'), //  当前代码
    setTree: setProp('tree'), //  文件树
    setPath: setProp('path'), //  当前文件路径
  },
  effects: {
    *getFile(action, {call, put, select}) {
      try {
        const repoId = yield select(state => state.repository.currentRepo.id);
        const filePath =  action.payload; 
        const body = yield call(api.getFile, { params: { repoId, filePath }});
        yield put(createAction('setCode', body.content));
        yield put(createAction('setPath', filePath));
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取代码文件失败'));
      }
    }
  },
}
