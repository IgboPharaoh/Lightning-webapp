import { ApiMethod, Post } from 'interface.types';

export interface PostReq {
    submitPost: (name: string, content: string) => Promise<SubmitPost>;
    getPost: (id: number) => Promise<Post>;
    getPosts: () => Promise<Post[]>;
    request: <T extends object>(method: ApiMethod, path: string, args?: object) => Promise<T>;
    url: string;
}

export interface SubmitPost {
    post: Post;
    paymentRequest: string;
}
