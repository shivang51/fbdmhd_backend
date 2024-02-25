import FacebookPage from "../models/FacebookPage";
import axios from "axios";

const baseUrl = "https://graph.facebook.com/v19.0/";

export function test() {
	console.log("testing");
}

export async function getAvailablePages(
	userId: string,
	accessToken: string,
): Promise<Partial<FacebookPage>[]> {
	let pages: Partial<FacebookPage>[] = [];
	const res = await _getPages(userId, accessToken);
	for (let page of res) {
		pages.push({ id: page.id, name: page.name, accessToken: page.accessToken });
	}
	return pages;
}

export async function getConversations(
	pageId: string,
	pageAccessToken: string,
): Promise<Conversation[]> {
	const ids = await _getConversationIds(pageId, pageAccessToken);
	let conversations: Conversation[] = [];
	for (let id of ids) {
		let [messages, sender] = await _getMessages(pageId, id, pageAccessToken);
		let conv: Conversation = {
			id: id,
			senderId: sender.id,
			senderName: sender.name,
			senderEmail: sender.email,
			messages: messages,
		};

		conversations.push(conv);
	}
	return conversations;
}

export async function sendMessage(
	pageId: string,
	recipientId: string,
	content: string,
	pageAccessToken: string,
): Promise<string> {
	const url = baseUrl + `${pageId}/messages`;
	const params = {
		recipient: { id: recipientId },
		messaging_type: "RESPONSE",
		message: { text: content },
		access_token: pageAccessToken,
	};
	const res = await axios.post(url, {}, { params: params });

	return res.data.message_id as string;
}

// privates
export async function _getMessages(
	pageId: string,
	conversationId: string,
	pageAccessToken: string,
): Promise<[Message[], SenderInfo]> {
	let url = `${baseUrl}${conversationId}/messages?platform=Messenger&access_token=${pageAccessToken}&fields=participants,messages,id,created_time,from,to,message`;

	let messages: Message[] = [];
	let senderInfo: SenderInfo = undefined;

	const res = await axios.get(url);
	let data = res.data.data;

	for (let msg of data) {
		if (senderInfo == undefined) {
			if (msg.from.id != pageId) {
				senderInfo = {
					id: msg.from.id,
					name: msg.from.name,
					email: msg.from.email,
				};
			} else {
				senderInfo = {
					id: msg.to.data[0].id,
					name: msg.to.data[0].name,
					email: msg.to.data[0].email,
				};
			}
		}

		let message: Message = {
			time: msg.created_time,
			content: msg.message,
			recieved: msg.from.id != pageId,
			messageId: msg.id,
		};

		messages.push(message);
	}

	return [messages, senderInfo];
}

async function _getPages(
	userId: string,
	accessToken: string,
): Promise<FacebookPage[]> {
	const url = baseUrl + `${userId}/accounts`;

	let data: any = undefined;

	try {
		const res = await axios.get(url, { params: { access_token: accessToken } });
		if (res.status != 200) {
			console.log("[-] ERROR IN getPages", res.data);
			throw res.data;
		}
		data = res.data.data;
	} catch (err) {
		console.log("[-] ERROR in getPages", err);
		throw err;
	}

	let pages: FacebookPage[] = [];

	for (let entry of data) {
		let page: FacebookPage = {
			id: entry.id,
			name: entry.name,
			accessToken: entry.access_token,
		};
		pages.push(page);
	}

	return pages;
}

async function _getConversationIds(
	pageId: string,
	pageAccessToken: string,
): Promise<string[]> {
	const url = baseUrl + `${pageId}/conversations`;
	const res = await axios.get(url, {
		params: { access_token: pageAccessToken, platform: "Messenger" },
	});

	if (res.status != 200) {
		console.log(res.data);
	}

	const data = res.data.data;
	let ids: string[] = [];
	for (let entry of data) {
		ids.push(entry.id);
	}

	return ids;
}
