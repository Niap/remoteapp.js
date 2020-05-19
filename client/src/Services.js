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
  return request(`/api/appedel/${appid}`, {
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



export async function RequestListPath(dir) {
  return request(`/api/document/list?path=${dir}&dirOnly=false`,{
    method:"GET"
  })
}

export async function RequestNewFolder(dirName,parentPath) {
  return request(`/api/document/create`,{
    method:"POST",
    data:{
      dirName,
      parentPath
    }
  })
}

export async function RequestDelPath(pathList) {
  return request(`/api/document/delete`,{
    method:"POST",
    data:{
      pathList
    }
  })
}

export async function RequestUpload(parentPath,filename,file) {
  var forms = new FormData()
  var headers = {'Content-Type':'multipart/form-data'};
  forms.append('file',file);

  return request(`/api/document/upload`,{
    method:"POST",
    headers:headers,
    data: forms
  })
}






