import express from 'express';
import { MongoClient } from 'mongodb';
import path from 'path';

const server = express();

server.use(express.static(path.join(__dirname, '../build')))

server.use(express.json());

const start = async () => {
	const client = await MongoClient.connect('mongodb://localhost:27017', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	const db = client.db('react-blog-jun2021');

	server.get('/api/articles/:name', async (req, res) => {
		const { name } = req.params;

		const info = await db.collection('articles').findOne({ name });

		if (info) {
			res.json(info);
		} else {
			res.sendStatus(404);
		}
	});

	server.post('/api/articles/:name/upvotes', async (req, res) => {
		const { name } = req.params;

		await db.collection('articles').updateOne({ name }, {
			$inc: {
				upvotes: 1,
			}
		});

		const updatedInfo = await db.collection('articles').findOne({ name });

		if (updatedInfo) { 
			res.json(updatedInfo);
		} else {
			res.sendStatus(404);
		}	
	});

	server.post('/api/articles/:name/comments', async (req, res) => {
		const { name } = req.params;
		const { author, text } = req.body;

		await db.collection('articles').updateOne({ name }, {
			$push: {
				comments: { author, text },
			}
		});

		const updatedInfo = await db.collection('articles').findOne({ name });

		if (updatedInfo) {
			res.json(updatedInfo) ;
		} else {
			res.sendStatus(404);
		}	
	})

	server.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../build/index.html'));
	})

	server.listen(8080, () => console.log('Server is listening on port 8080'));
}

start();