import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'reactstrap';
import PostForm from 'components/PostForm';
import Posts from 'components/Posts';
import { Post } from 'interface.types';
import api from 'lib/api';

const App = () => {
    interface State {
        posts: Post[];
        isConnecting: boolean;
        error: Error | null;
    }

    // Starting state, can be used for "resetting" as well
    const [initialState, setInitialState] = useState<State>({
        posts: [],
        isConnecting: true,
        error: null,
    });

    useEffect(() => {
        connect();
    }, []);

    const connect = () => {
        setInitialState({ ...initialState });
        const socket = api.getPostsWebSocket();

        socket.addEventListener('open', () => {
            setInitialState({ ...initialState, isConnecting: false });
        });

        // Add new posts when they're sent
        socket.addEventListener('message', (event) => {
            try {
                const msg = JSON.parse(event.data.toString());
                if (msg && msg.type === 'post') {
                    // Add new post, sort them by most recent
                    const posts = [initialState.posts, msg.data].sort((a, b) => b.time - a.time);
                    setInitialState({ ...initialState, posts: posts });
                }
            } catch (err) {
                console.error(err);
            }
        });

        // Handle closes and errors
        socket.addEventListener('close', () => {
            setInitialState({ ...initialState, error: new Error('Connection to server closed unexpectedly.') });
        });

        socket.addEventListener('error', (ev) => {
            setInitialState({ ...initialState, error: new Error('There was an error, see your console for more information.') });
            console.error(ev);
        });
    };

    const { posts, isConnecting, error } = initialState;
    let content;
    if (isConnecting) {
        content = (
            <div className='d-flex justify-content-center p-5'>
                <Spinner color='warning' style={{ width: '3rem', height: '3rem' }} />
            </div>
        );
    } else if (error) {
        content = (
            <Alert color='danger'>
                <h4 className='alert-heading'>Something went wrong!</h4>
                <p>{error.message}</p>
                <Button block outline color='danger' onClick={connect}>
                    Try to reconnect
                </Button>
            </Alert>
        );
    } else {
        content = (
            <>
                <PostForm posts={posts} />
                <Posts posts={posts} />
            </>
        );
    }

    return (
        <div className='App'>
            <Container>
                <h1 className='App-title'>Lightning Posts</h1>
                <Row className='justify-content-md-center'>
                    <Col xs={12} sm={8}>
                        {content}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default App;
