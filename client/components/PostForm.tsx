import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Form, FormGroup, Input, Button, Alert, Spinner } from 'reactstrap';
import { Post } from 'interface.types';
import api from 'lib/api';

const PostForm = () => {
    const [postFormState, setPostFormState] = useState<{
        name: string;
        content: string;
        isPosting: boolean;
        pendingPost: Post;
        paymentRequest: string;
        error: string;
    }>({
        name: '',
        content: '',
        isPosting: false,
        pendingPost: { id: 0, name: '', content: '', time: 0, hasPaid: false },
        paymentRequest: '',
        error: '',
    });

    // const { content, name, isPosting } = postFormState;
    const { name, content, isPosting, error, paymentRequest } = postFormState;
    const disabled = !content.length || !name.length || isPosting;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        event.preventDefault();

        setPostFormState({ ...postFormState, name: event.target.value, content: event.target.value });
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const { name, content } = postFormState;
        setPostFormState({ ...postFormState, isPosting: true, error: '' });

        api.submitPost(name, content)
            .then((post) => {
                setPostFormState({ ...postFormState, isPosting: false, pendingPost: post.post, paymentRequest: post.paymentRequest });
                checkIfPaid();
            })
            .catch((error) => {
                console.log(error);
                setPostFormState({ ...postFormState, error: error.message, isPosting: false });
            });
    };

    const checkIfPaid = () => {
        setTimeout(() => {
            const { pendingPost } = postFormState;
            if (!pendingPost) return;

            api.getPost(pendingPost.id).then((p) => {
                if (p.hasPaid) {
                    window.location.reload();
                } else {
                    checkIfPaid();
                }
            });
        }, 1000);
    };

    let cardContent;
    if (paymentRequest) {
        cardContent = (
            <div className='PostForm-pay'>
                <FormGroup>
                    <Input value={paymentRequest} type='textarea' rows='5' disabled />
                </FormGroup>
                <Button color='primary' block href={`lightning:${paymentRequest}`}>
                    Open in Wallet
                </Button>
            </div>
        );
    } else {
        cardContent = (
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Input name='name' value={name} placeholder='Name' onChange={handleChange} />
                </FormGroup>

                <FormGroup>
                    <Input
                        name='content'
                        value={content}
                        type='textarea'
                        rows='5'
                        placeholder='Content (1 sat per character)'
                        onChange={handleChange}
                    />
                </FormGroup>

                {error && (
                    <Alert color='danger'>
                        <h4 className='alert-heading'>Failed to submit post</h4>
                        <p>{error}</p>
                    </Alert>
                )}

                <Button color='primary' size='lg' type='submit' block disabled={disabled}>
                    {isPosting ? (
                        <Spinner size='sm' />
                    ) : (
                        <>
                            Submit <small>({content.length} sats)</small>
                        </>
                    )}
                </Button>
            </Form>
        );
    }
    return (
        <Card className='mb-4'>
            <CardHeader>Submit a Post</CardHeader>
            <CardBody>{cardContent}</CardBody>
        </Card>
    );
};

export default PostForm;
