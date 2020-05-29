import axios from 'axios'

export const api = window.location.protocol + "//" + window.location.host;

export function getImagePath(image){
    return api+'icon/'+image;
}
export function getFilesPath(image){
    return api+'files/'+image;
}

const service = axios.create({
    baseURL: api, // url = base url + request url
    withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout
})

export default service