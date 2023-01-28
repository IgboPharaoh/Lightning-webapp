export interface Post {
    id: number;
    name: string;
    content: string;
    time: number;
    hasPaid: boolean;
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
