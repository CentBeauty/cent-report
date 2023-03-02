import axios from "axios";

const API_URL = (import.meta.env.VITE_API_BACKEND !== undefined) ? import.meta.env.VITE_API_BACKEND : "https://api.we.cent.beauty";


axios.interceptors.request.use(
    config => {
        const authToken = localStorage.getItem('access_token');
        if (authToken !== undefined) {
            config.headers.Authorization = `Bearer ${authToken}`;
            config.timeout = 800000;
        }
        return config;
    }, (err) => {
        console.log("er",err)
        return Promise.reject(err);
    }
);

axios.interceptors.response.use(response => {
    return response;
}, error => {
    const { config, response: { status } } = error;
    const originalRequest = config;
    console.log("err",error)
    console.log("status",status)
    if(status === 401){
        localStorage.clear()
        window.location.replace('/login')
    }
    // return Promise.reject(error)
    // if (status === 401) {
    //     const retryOrigReq = new Promise(async (resolve, reject) => {
    //         const token = localStorage.getItem('access_token');
    //         console.log("token", token)
    //         const { data } = await axiosService(`api/refresh-token?token=${token}`, "POST")
    //         console.log("data", data)
    //         if (data.code === 200) {
    //             localStorage.setItem("access_token", data.data.token)
    //             originalRequest.headers['Authorization'] = 'Bearer ' + data.data.token;
    //         } else {
    //             localStorage.clear();
    //             window.location.replace('/')
    //             return Promise.reject(error);
    //         }
    //         resolve(axios(originalRequest));
    //     });
    //     return retryOrigReq;
    // } else {
    //     localStorage.clear();
    //     return Promise.reject(error);
    // }
});

export default function axiosService(uri, method, data) {
    return axios({
        url: `${API_URL}/${uri}`,
        method,
        data,
    });
}
