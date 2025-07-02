import * as VIAM from '@viamrobotics/sdk';

const API_KEY_ID = import.meta.env.VITE_API_KEY_ID;
const API_KEY_SECRET = import.meta.env.VITE_API_KEY_SECRET;
const PART_ID = import.meta.env.VITE_PART_ID;

let viamClient: VIAM.ViamClient | null = null;

export async function connect(): Promise<VIAM.ViamClient> {
	const opts: VIAM.ViamClientOptions = {
		credentials: {
			type: 'api-key',
			authEntity: API_KEY_ID,
			payload: API_KEY_SECRET
		}
	};
	return await VIAM.createViamClient(opts);
}

export async function uploadData(binaryData: Uint8Array): Promise<string> {
	if (!viamClient) {
		// If the client is not initialized, create a new one
		viamClient = await connect();
	}
	const id = await viamClient.dataClient.binaryDataCaptureUpload(
		binaryData,
		PART_ID,
		'rdk:component:camera',
		'camera',
		'ReadImage',
		'.jpg',
		[new Date(), new Date()]
	);
	return id;
}

export async function getViamClient(): Promise<VIAM.ViamClient> {
	if (!viamClient) {
		// If the client is not initialized, create a new one
		viamClient = await connect();
	}
	return viamClient as VIAM.ViamClient;
}
