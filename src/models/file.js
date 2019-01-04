import * as api from './api';
import { setProp,  createErrorPayload } from './helper';

export default {
  namespace: 'file',
  state: {},
  reducers: {
    setCode: setProp('code'), //  当前代码
    setTree: setProp('tree'), //  文件树
  },
  effects: {
    *getFile(action, {call, put}) {
      try {
        const { repoId, filePath } =  action.payload; 
        console.warn(action.payload);
        const body = yield call(api.getFile, { params: { repoId, filePath }});
        console.warn(body);
        yield put({ type: 'setCode', payload: body.content });
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取代码文件失败'));
      }
    }
  },
}
