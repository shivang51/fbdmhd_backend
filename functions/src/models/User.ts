interface User {
	id: string;
	name: string;
	email: string;
	fid: string;
	accessToken: string;
}

export function userFromJson(data: any): User {
	if (!("id" in data)) data["id"] = "";

	return {
		id: data.id ?? "",
		fid: data.fid ?? "",
		name: data.name,
		accessToken: data.accessToken ?? "",
		email: data.email,
	} as User;
}

export type PartUser = Partial<User>;

export default User;
