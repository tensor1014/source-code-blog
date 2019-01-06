import * as api from './api';
import { setProp, createAction, createErrorPayload } from './helper';
import yaml from 'js-yaml';

export default {
  namespace: 'repository',
  state: {},
  reducers: {
    setCurrentRepo: setProp('currentRepo'),
    setCurrentNode: setProp('currentNode'),
  },
  effects: {
    *getReposotoryDetail(action, { call, put }) {
      try {
        const params = { repoId: action.payload };
        const body = yield call(api.getRepositoryDetail, { params });
        let { fileTree, points, repository } = body;
        fileTree = yaml.load(fileTree);
        yield put(createAction('setCurrentRepo', repository))
        yield put(createAction('point/setPoints', points));
        const pointList = Object.values(points);
        if (pointList) {
          yield put(createAction('point/getPointDetail', { pointId: pointList[0].id, tree: fileTree }));
        } else {
          yield put(createAction('file/setTree', { name: 'root', children: fileTree }));
        }
      } catch (err) {
        console.error(err);
        yield put(createErrorPayload(err, '获取仓库信息情失败'));
      }
    },
  }
};


