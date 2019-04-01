import axios from 'axios'
import QS from 'qs'
import store from './vuex.js'

//环境切换 开发 测试 正式 环境
if(process.env.NODE_ENV == 'development'){			//开发环境
	axios.defaults.baseURL = 'https://www.baidu.com';
}else if(process.env.NODE_ENV == 'debug'){				//测试环境
	axios.defaults.baseURL = 'https://www.ceshi.com';
}else if(process.env.NODE_ENV == 'production'){
	axios.defaults.baseURL = 'https://www.production.com';	//正式环境
}

axios.defaults.timeout = 10000;					//请求超时时间为10秒
axios.defaluts.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';	//post请求时需要设置请求头


//设置拦截器

//添加请求拦截器
axios.interceptors.request.use(
	config => {
		const token = store.state.userinfo;		//每次发送请求之前判断vuex中是否存在token
		token && (config.headers.Authorization = token);	
		//若存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
		return config;
	},
	error => {			//若没登录则抛出错误
		return Promise.error(error);	
	}
)

//添加响应拦截器
axios.interceptors.response.use(
	response => response.status === 200 ? Promise.resolve(response) : Promis.reject(response),
	error => {
		if(error.response.status){
			switch(error.response.status){
				case 401:
					router.replace({
						path : '/login',
						query : {
							redirect : router.currentRouter.fullPath
						}
					});
					break;
				case 403:
					//UI组件的提示方法  登录过期重新登录
					localStorage.removeItem('userinfo');
					store.commit('loginSuccess',null);
					setTimeout(() => {
						router.replace({
							path : '/login',
							query : {
								redirect : router.currentRouter.fullPath
							}
						});
					},1000);
					break;
				case 404:
					//UI组件的提示内容	网络请求不存在
					break;
				default:
					//UI组件提示内容
			}
			return Promise.reject(error.reponse)
		}
	}
)

/**
  * get方法，对应get请求
  * @param {String} url [请求的url地址]
  * @param {Object} params [请求时携带的参数]
  */
export function get(url, params){
    return new Promise((resolve, reject) =>{
        axios.get(url, {
            params: params
        }).then(res => {
            resolve(res.data);
        }).catch(err =>{
            reject(err.data)
    	})
	})
}

/**
  * post方法，对应post请求
  * @param {String} url [请求的url地址]
  * @param {Object} params [请求时携带的参数]
  */
export function post(url, params) {
    return new Promise((resolve, reject) => {
          axios.post(url, QS.stringify(params))
        .then(res => {
            resolve(res.data);
        })
        .catch(err =>{
            reject(err.data)
        })
    })
}