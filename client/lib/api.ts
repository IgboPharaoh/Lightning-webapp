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

        try {
            const res = await fetch(this.url + path + query, {
                method,
                headers,
                body,
            });

            if (!res.ok) {
                let errorMessage;
                try {
                    const errorBody = await res.json();
                    if (!errorBody.error) throw new Error();
                    errorMessage = errorBody.error;
                } catch (error) {
                    throw new Error(`${res.status}: ${res.statusText}`);
                }
                throw new Error(errorMessage);
            }

            const resp = await res.json();
            return resp.data as T;
        } catch (error) {
            console.error(`APi error calling ${method} ${path}`, error);
            throw error;
        }
    };
}

export default new POSTSAPI(process.env.API_PATH as string);
