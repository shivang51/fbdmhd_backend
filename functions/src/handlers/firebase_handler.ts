import * as admin from "firebase-admin";
import * as firestore from "firebase-admin/firestore";
import serviceAccount from "./firebaseConfig.json";
import User, { PartUser, userFromJson } from "../models/User";

const app = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
const db = firestore.getFirestore(app);
const usersRef = db.collection("users");

export async function getUsers(): Promise<User[]> {
	const usersRef = db.collection("users");
	const snapshot = await usersRef.get();
	let users: User[] = [];
	snapshot.forEach((res) => {
		users.push(userFromJson({ id: res.id, ...res.data() }));
	});
	return users;
}

export async function createUser(data: any): Promise<string> {
	try {
		const user = userFromJson(data);
		const docRef = usersRef.doc();
		const pUser: PartUser = user;
		delete pUser.id;
		await docRef.set({ ...pUser, password: data.password });
		return docRef.id;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export async function setUser(data: any): Promise<string> {
	try {
		const docRef = usersRef.doc(data.id);
		const pUser: PartUser = data;
		delete pUser.id;
		await docRef.update(pUser);
		return docRef.id;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export async function emailExist(email: string): Promise<boolean> {
	try {
		const snapshot = await usersRef.where("email", "==", email).get();
		return snapshot.size != 0;
	} catch (err) {
		console.log(err);
		throw err;
	}
}

export async function verifyPassword(password: string): Promise<boolean> {
	try {
		const snapshot = await usersRef.where("password", "==", password).get();
		console.log(snapshot.size);
		return snapshot.size != 0;
	} catch (err) {
		console.log(err);
		throw err;
	}
}
