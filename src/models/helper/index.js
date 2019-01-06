export const setProp = (prop) => (state, action) => {
  return {...state, [prop]: action.payload };
}

export const createErrorPayload = (err, defaultMsg) => ({
  type: 'error/message',
  payload: (err && err.message) || defaultMsg || '获取数据失败, 请检查网络',
})

export const createAction = (type, payload) => ({ type, payload });