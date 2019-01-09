import * as api from './api';
import { setProp, createAction, createErrorPayload } from './helper';
import yaml from 'js-yaml';
import { parseRawPoint } from './point';
import forEach from 'lodash/forEach';

export default {
  namespace: 'repository',
  state: {
    current: undefined,
  },
  reducers: {
    setCurrent: setProp('current'), // @fixme 暂时是 repo object
  },
  effects: {
    *getRepositoryDetail(action, { call, put }) {
      try {
        const params = { repoId: action.payload };
        const body = yield call(api.getRepositoryDetail, { params });
        let { fileTree, points, repository } = body;
        let firstPointId = undefined;
        forEach(points, (p) => {
          if (!firstPointId) {
            firstPointId = p.id;
          }
          parseRawPoint(p)
        })
        fileTree = yaml.load(fileTree);
        yield put(createAction('setCurrent', repository))
        yield put(createAction('point/setCurrent', firstPointId));
        yield put(createAction('point/setPoints', points));
        if (firstPointId) {
          yield put(createAction('point/getPointDetail', { pointId: firstPointId, tree: fileTree }));
        } else {
          yield put(createAction('file/setTree', { tree: { name: 'root', children: fileTree }}));
        }
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取仓库信息情失败'));
      }
    },
  }
};


