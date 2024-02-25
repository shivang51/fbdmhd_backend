import express, { Request, Response } from "express";
import * as firebase from "./handlers/firebase_handler";
import bodyParser from "body-parser";
import * as facebook from "./handlers/facebook_sdk_handler";
import * as functions from "firebase-functions";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (_: Request, res: Response) => {
	res.status(403).send("NOT AUTHORIZED");
});

app.post("/login", bodyParser.json(), async (req: Request, res: Response) => {
	if (!(await firebase.emailExist(req.body.email))) {
		res.status(403).send("Invalid Email");
		return;
	}

	if (!(await firebase.verifyPassword(req.body.password))) {
		res.status(403).send("Invalid Password");
		return;
	}

	res.send("Login Successful");
});

app.get("/get_users", (_: Request, res: Response) => {
	firebase.getUsers().then((users) => {
		res.send(users);
	});
});

app.post(
	"/register_user",
	bodyParser.json(),
	async (req: Request, res: Response) => {
		const emailExists = await firebase.emailExist(req.body.email);
		if (emailExists) {
			res.status(403).send("User already exists");
			return;
		}
		firebase
			.createUser(req.body)
			.then((id) => res.send(id))
			.catch((err) => {
				console.log(err);
				res.status(403).send("failed");
			});
	},
);

app.post("/set_user", bodyParser.json(), (req: Request, res: Response) => {
	firebase
		.setUser(req.body)
		.then((id) => res.send(id))
		.catch((err) => {
			console.log(err);
			res.status(400).send("failed");
		});
});

// app.get("/test", bodyParser.json(), (req: Request, res: Response) => {
// 	facebook.test();
// 	res.send("testing");
// });

app.get("/get_pages", (req: Request, res: Response) => {
	facebook
		.getAvailablePages(
			req.query.userId as string,
			req.query.accessToken as string,
		)
		.then((pages) => {
			res.send({ pages: pages });
		})
		.catch((err) => {
			res.status(400).send(err);
		});
});

app.get(
	"/get_conversations",
	bodyParser.json(),
	(req: Request, res: Response) => {
		console.log("getting");
		facebook
			.getConversations(
				req.query.pageId as string,
				req.query.pageAccessToken as string,
			)
			.then((conversations) => {
				res.send({ conversations: conversations });
			})
			.catch((err) => {
				res.status(400).send(err);
			});
	},
);

app.post("/send_message", bodyParser.json(), (req: Request, res: Response) => {
	const body = req.body;
	facebook
		.sendMessage(
			body.pageId,
			body.recepientId,
			body.content,
			body.pageAccessToken,
		)
		.then((msgId) => res.send({ msgId: msgId }))
		.catch((err) => res.send(err));
});

exports.app = functions.region("asia-east2").https.onRequest(app);
