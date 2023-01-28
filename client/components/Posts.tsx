import React, { useEffect, useState } from 'react';
import { Spinner, Card, CardTitle, CardBody, CardText, Alert, Jumbotron } from 'reactstrap';
import { Post } from 'interface.types';
import api from 'lib/api';

const Posts = () => {
    const [postState, setPostState] = useState<{ posts: Post[]; isFetching: boolean; error: string }>({
        posts: [],
        isFetching: false,
        error: '',
    });

    useEffect(() => {
        getPosts();
    }, []);

    const getPosts = () => {
        setPostState({
            ...postState,
            isFetching: true,
        });

        api.getPosts()
            .then((posts) => {
                setPostState({ ...postState, posts: posts, isFetching: false });
            })
            .catch((error) => {
                setPostState({
                    error: error.message,
                    isFetching: false,
                    posts: [],
                });
            });
    };

    const { posts, isFetching, error } = postState;
    let content;
    if (posts) {
        if (posts.length) {
            content = posts.map((p) => (
                <Card key={p.id} className='mb-3'>
                    <CardBody>
                        <CardTitle tag='h4'>{p.name} says:</CardTitle>
                        <CardText>{p.content}</CardText>
                    </CardBody>
                </Card>
            ));
        } else {
            content = (
                <Jumbotron>
                    <h2 className='text-center'>No posts yet.</h2>
                    <p className='text-center'>Why not be the first?</p>
                </Jumbotron>
            );
        }
    } else if (isFetching) {
        content = <Spinner size='lg' />;
    } else if (error) {
        content = (
            <Alert color='danger'>
                <h4 className='alert-heading'>Failed to fetch posts</h4>
                <p>
                    {error}. <a onClick={getPosts}>Click here</a> to try again.
                </p>
            </Alert>
        );
    }

    return (
        <>
            <h2>Latest Posts</h2>
            {content}
        </>
    );
};

export default Posts;
