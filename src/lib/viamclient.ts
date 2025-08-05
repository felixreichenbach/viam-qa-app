import type { Class } from '@tensorflow-models/tasks/dist/tasks/common';
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

export async function uploadData(
	binaryData: Uint8Array,
	classifications: Class[],
	user_classification: string
): Promise<string> {
	// Get the label with the highest score, excluding 'VIAM_UNKNOWN'
	let tags = [];
	const filtered = classifications.filter((c) => c.className !== 'VIAM_UNKNOWN');
	if (filtered.length > 0) {
		const top = filtered.reduce((a, b) => (a.score > b.score ? a : b));
		tags.push('MODEL_' + top.className);
	}
	// Add user classification and other tags
	tags.push(user_classification);
	tags.push('qa-app');

	if (!viamClient) {
		// If the client is not initialized, create a new one
		viamClient = await connect();
	}

	console.log('Uploading data with tags:', tags);
	console.log(classifications);
	console.log(user_classification);

	const id = await viamClient.dataClient.binaryDataCaptureUpload(
		binaryData,
		PART_ID,
		'rdk:component:camera',
		'camera',
		'ReadImage',
		'.jpg',
		[new Date(), new Date()],
		tags
	);
	await viamClient.dataClient.addTagsToBinaryDataByIds(tags, [id]);

	const inferenceResult: Record<string, VIAM.JsonValue> = {
		classifications: classifications.map((c) => ({
			className: c.className,
			score: c.score
		})),
		user_classification: user_classification,
		image_id: id
	};

	await viamClient.dataClient.tabularDataCaptureUpload(
		[{ readings: inferenceResult }],
		PART_ID,
		'rdk:component:sensor',
		'qa-app',
		'Readings',
		[[new Date(), new Date()]]
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
