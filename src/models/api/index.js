import fetch from 'dva/fetch';

const host = 'http://localhost:8888';

const get = (url) => ({params, queries}) => {
  return fetch(buildUrl(url, params, queries))
    .then(handleResponse);
};
const post = (url) => ({params, queries, body}) => {
  return fetch(buildUrl(url, params, queries), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }).then(handleResponse);
};
const put = (url) => ({params, queries, body}) => {
  return fetch(buildUrl(url, params, queries), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }).then(handleResponse);
};
const del = (url) => ({params, queries}) => {
  return fetch(buildUrl(url, params, queries), {
    method: 'DELETE',
  });
};

function handleResponse(response) {
  try {
    const contentType = response.headers.get('Content-Type') || '';
    const body = contentType.startsWith('application/json') ? response.json() : response.text();
    if (response.ok) {
      return body;
    } else {
      return Promise.reject(body);
    }
  } catch (err) {
      return Promise.reject(err);
  }
}

function buildUrl(url, params, queries) {
  params = params || {};
  queries = queries || {};
  const url2 = url.split('/').map(part => {
    if (part.startsWith(':')) {
      const key = part.substring(1);
      if (params[key] !== undefined) {
        return params[key];
      } else {
        console.error('lack of param: ' + key);
      }
    }
    return part;
  }).join('/');
  const q = Object.keys(queries).length > 0 ?
    '/' + Object.entries(queries).map(([k, v]) => k + '=' + v).join('&') :
    '';
  return host + url2 + q;
}

export const createGitRepository = post('/api/repository');
export const getRepositoryDetail = get('/api/repository/:repoId');
export const getFile = get('/api/repository/:repoId/file/:filePath');
export const getPointDetail = get('/api/point/:pointId');
export const searchPointByTitle = get('/api/point');
export const createPoint = post('/api/point');
export const updatePoint = put('/api/point/:pointId');
export const createNode = post('/api/point/:pointId/node');
export const updateNode = put('/api/point/:pointId/node/:nodeId');
export const deleteNode = del('/api/point/:pointId/node/:nodeId');
export const createLabel = post('/api/label');
export const updateLabel = put('/api/label/:labelId');
export const deleteLabel = del('/api/label/:labelId');