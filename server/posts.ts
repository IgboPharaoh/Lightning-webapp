import { EventEmitter } from 'events';

export interface Post {
    id: number;
    time: number;
    name: string;
    content: string;
    hasPaid: boolean;
}

class PostsManager extends EventEmitter {
    posts: Post[] = [];

    // adds a post to the list
    addPost(name: string, content: string): Post {
        const post = {
            id: Math.floor(Math.random() * 1000000) + 1000,
            time: Date.now(),
            name,
            content,
            hasPaid: false,
        };

        this.posts.push(post);
        return post;
    }

    // get single post based on id
    getPost(id: number): Post | undefined {
        return this.posts.find((p) => p.id === id);
    }

    // mark paid posts
    markPostPaid(id: number) {
        let updatedPost;
        this.posts = this.posts.map((p) => {
            if (p.id === id) {
                updatedPost = { ...p, hasPaid: true };
                return updatedPost;
            }
            return p;
        });

        if (updatedPost) {
            this.emit(updatedPost);
        }
    }

    // get paid posts
    getPaidPosts() {
        return this.posts.filter((p) => p.hasPaid && true).sort((a, b) => b.time - a.time);
    }
}

export default new PostsManager();
