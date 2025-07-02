import * as VIAM from '@viamrobotics/sdk';

const ORG_ID = import.meta.env.VITE_ORG_ID;
const API_KEY_ID = import.meta.env.VITE_API_KEY_ID;
const API_KEY_SECRET = import.meta.env.VITE_API_KEY_SECRET;

async function connect(): Promise<VIAM.ViamClient> {
	const opts: VIAM.ViamClientOptions = {
		credentials: {
			type: 'api-key',
			authEntity: API_KEY_ID,
			payload: API_KEY_SECRET
		}
	};

	const client = await VIAM.createViamClient(opts);

	return client;
}

async function query(client: VIAM.ViamClient) {
	try {
		const dataList = await client.dataClient.tabularDataBySQL(
			ORG_ID,
			'select * from readings limit 5'
		);
		return dataList;
	} finally {
	}
}

let client: VIAM.ViamClient;
try {
	client = await connect();
	const result = await query(client);
	console.log(result);
} catch (error) {
	console.error(error);
}
