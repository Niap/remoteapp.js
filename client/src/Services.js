import request from './Request';

export async function RequestStartSession(appid) {
  return request(`/api/startSession/${appid}`, {
    method: 'GET'
  });
}

export async function RequestAppList(userName,password) {
  return request('/api/applist', {
    method: 'GET'
  });
}

export async function RequestAppInfo(appid) {
  return request(`/api/appinfo/${appid}`, {
    method: 'GET'
  });
}
export async function RequestSaveAppInfo(appid,data) {
  return request(`/api/appedit/${appid}`, {
    method: 'POST',
    data
  });
}
export async function RequestDelAppInfo(appid,data) {
  return request(`/api/appdel/${appid}`, {
    method: 'GET',
    data
  });
}

export async function RequestAddAppInfo(data) {
  return request(`/api/appadd`, {
    method: 'POST',
    data
  });
}


export async function RequestListFile(dir) {
  return request(`/api/filelist`,{
    method:"GET"
  })
}

export async function RequestDelFile(pathList) {
  return request(`/api/file/delete`,{
    method:"POST",
    data:pathList
  })
}

export async function RequestUploadFile(file) {
  var forms = new FormData()
  var headers = {'Content-Type':'multipart/form-data'};
  forms.append('file',file);

  return request(`/api/upload/file`,{
    method:"POST",
    headers:headers,
    data: forms
  })
}
