import React, { useEffect, useState } from 'react';
import { Spinner, Card, CardTitle, CardBody, CardText, Alert, Jumbotron } from 'reactstrap';
import { Post } from 'interface.types';
import api from 'lib/api';

interface Props {
    posts: Post[];
}

const Posts = ({ posts }: Props) => {
    let content;
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

    return (
        <>
            <h2>Latest Posts</h2>
            {content}
        </>
    );
};

export default Posts;
