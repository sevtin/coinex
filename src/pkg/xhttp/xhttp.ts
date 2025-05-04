import axios from 'axios';
import JSONbig from 'json-bigint';
import type {AxiosInstance, AxiosRequestConfig} from 'axios'
import {ElMessage} from "element-plus";


// 定义结果接口Result
export interface Result<T = unknown> {
    message: string
    code: number
    data: T
}

class HttpClient {
    private instance: AxiosInstance;

    constructor() {
        this.instance = axios.create({
            baseURL: import.meta.env.VITE_BASE_API,
            timeout: 60000, // 设置请求超时时间,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
            // 使用transformResponse选项将响应数据进行自定义处理
            transformResponse: [(data) => {
                try {
                    // 作用1:把json字符串转为js对象
                    // 作用2:把里面的大数字做安全处理
                    return JSONbig.parse(data)
                } catch (e) {
                    return data
                }
            }]
        });
        this.setupInterceptors()
    }

    private setupInterceptors() {
        this.instance.interceptors.request.use(
            (config) => {
                return config;
            },
            (error) => Promise.reject(error)
        );
        this.instance.interceptors.response.use(
            (response) => {
                /*
                if (response.data.code > 200) {
                    ElMessage({
                        message: data.message || '服务器返回异常',
                        type: 'warning',
                    });
                }
                 */
                return response
            },
            (error) => {
                /*
                ElMessage({
                    message: '网络请求失败，请稍后再试',
                    type: 'error',
                });
                 */
                Promise.reject(error)
            }
        );
    }

    private async request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
        try {
            const response = await this.instance.request<AxiosResponse<Result<T>>>(config);
            return response.data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    get<T = any>(url: string, params?: object): Promise<Result<T>> {
        return this.request<T>({
            method: 'get',
            url,
            params
        });
    }

    post<T = any>(url: string, data?: object): Promise<Result<T>> {
        return this.request<T>({
            method: 'post',
            url,
            data
        });
    }
}

export default new HttpClient();
