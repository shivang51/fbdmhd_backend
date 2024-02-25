interface Conversation {
	id: string;
	senderId: string;
	senderName: string;
	senderEmail: string;
	messages: Message[];
}

interface Message {
	messageId: string;
	content: string;
	time: string;
	recieved: boolean;
}

interface SenderInfo {
	id: string;
	name: string;
	email: string;
}
