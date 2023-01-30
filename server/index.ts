import { Invoice, Readable } from '@radar/lnrpc';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressWs from 'express-ws';
import ws, { WebSocket } from 'ws';
import env from './env';
import { initNode, node } from './node';
import postsManager from './posts';

const app = expressWs(express()).app;
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

// Routes
app.ws('api/posts', (ws) => {
    // send all posts we have initially
    postsManager.getPaidPosts().forEach((post) => {
        console.log(post);
        ws.send(
            JSON.stringify({
                type: 'post',
                data: post,
            })
        );
    });

    // Send each new post as it's paid for. If we error out, just close
    // the connection and stop listening.
    const postListener = (post: any) => {
        ws.send(
            JSON.stringify({
                type: 'post',
                data: post,
            })
        );
    };
    postsManager.addListener('post', postListener);

    // Keep-alive by pinging every 10s
    const pingInterval = setInterval(() => {
        ws.send(JSON.stringify({ type: 'ping' }));
    }, 10000);

    // Stop listening if they close the connection
    ws.addEventListener('close', () => {
        postsManager.removeListener('post', postListener);
        clearInterval(pingInterval);
    });
});

app.get('/api/posts', (req, res) => {
    res.json({ data: postsManager.getPaidPosts() });
});

app.get('/api/posts/:id', (req, res) => {
    const post = postsManager.getPost(parseInt(req.params.id, 10));

    if (post) {
        res.json({ data: post });
    } else {
        res.status(404).json({ error: `No post found with ID ${req.params.id}` });
    }
});

app.get('/api/posts', async (req, res, next) => {
    try {
        const { name, content } = req.body;
        if (!name || !content) {
            throw new Error('Name and content fields are required to make a post');
        }

        const post = postsManager.addPost(name, content);
        const invoice = await node.addInvoice({
            memo: `Lightning Posts post #${post.id}`,
            value: content.length,
            expiry: '120',
        });

        res.json({
            data: {
                post,
                paymentRequest: invoice.paymentRequest,
            },
        });
    } catch (error) {
        next(error);
    }
});

// first route
app.get('/', async (req, res, next) => {
    res.send('You need to load the webpack-dev-server page, not the server page!');
});

// initialize node and server
console.log('Initializing lightnind node');
initNode().then(() => {
    console.log('lightning node initialized');
    console.log('Starting server.........');
    app.listen(env.PORT, () => {
        console.log(`[server]: Server is running at http://localhost:${env.PORT} `);
    });

    // Subscribe to all invoices, mark posts as paid
    const stream = node.subscribeInvoices() as any as Readable<Invoice>;
    stream.on('data', (chunk) => {
        // Skip unpaid / irrelevant invoice updates
        if (!chunk.settled || !chunk.amtPaidSat || !chunk.memo) return;

        // Extract post id from memo, skip if we can't find an id
        const id = parseInt(chunk.memo.replace('Lightning Posts post #', ''), 10);
        if (!id) return;

        // Mark the invoice as paid!
        postsManager.markPostPaid(id);
    });
});
