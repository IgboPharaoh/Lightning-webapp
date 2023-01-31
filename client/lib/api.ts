import { stringify } from 'querystring';
import { ApiMethod, Post } from 'interface.types';
import { PostReq, SubmitPost } from './Posts';

class POSTSAPI implements PostReq {
    url: string;

    constructor(url: string) {
        this.url = url;
    }

    submitPost = (name: string, content: string): Promise<SubmitPost> => {
        return this.request<{ post: Post; paymentRequest: string }>('POST', '/posts', { name, content });
    };

    getPost = async (id: number): Promise<Post> => {
        return this.request<Post>('GET', `/posts/${id}`);
    };

    getPosts = (): Promise<Post[]> => {
        return this.request<Post[]>('GET', '/posts');
    };

    getPostsWebSocket() {
        let wsUrl = this.url.replace('https', 'wss').replace('http', 'ws');
        return new WebSocket(`${wsUrl}/posts`)
    }

    request = async <T extends object>(method: ApiMethod, path: string, args?: object): Promise<T> => {
        let body = null;
        let query = '';
        const headers = new Headers();
        headers.append('Accept', 'application/json');

        if (method === 'POST' || method === 'PUT') {
            body = JSON.stringify(args);
            headers.append('Content-Type', 'application/json');
        } else if (args !== undefined) {
            query = `?${stringify(args as any)}`;
        }
        let params = { method, headers, body };
        return fetch(this.url + path + query, params)
            .then(async (res) => {
                if (!res.ok) {
                    let errorMessage;
                    try {
                        const errorBody = await res.json();
                        if (!errorBody.error) throw new Error(`there is no error body`);
                        errorMessage = errorBody.error;
                    } catch (error) {
                        throw new Error(`${res.status} ${res.statusText}`);
                    }
                    throw new Error(errorMessage);
                }
                return res.json();
            })
            .then((res) => res.data as T)
            .catch((e) => {
                console.error(`API error calling ${method} ${path}`, e, 'show me the error');
                throw e;
            });
    };
}

export default new POSTSAPI(process.env.API_PATH as string);
