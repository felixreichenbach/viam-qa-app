// This code must be run in a browser environment.
import * as VIAM from '@viamrobotics/sdk';

const main = async () => {
	const host = import.meta.env.VITE_VIAM_HOST as string;
	const apiKey = import.meta.env.VITE_VIAM_API_KEY as string;
	const apiKeyId = import.meta.env.VITE_VIAM_API_KEY_ID as string;

	console.log('Environment variables loaded:');
	console.log('Host:', host);
	console.log('API Key:', apiKey ? 'Present' : 'Missing');
	console.log('API Key ID:', apiKeyId ? 'Present' : 'Missing');
	console.log('API Key ID format:', apiKeyId);

	if (!host || !apiKey || !apiKeyId) {
		console.error('Missing required environment variables');
		return;
	}

	const machine = await VIAM.createRobotClient({
		host,
		credentials: {
			type: 'api-key',
			payload: apiKey,
			authEntity: apiKeyId
		},
		signalingAddress: 'https://app.viam.com:443'
	});

	console.log('Resources:');
	console.log(await machine.resourceNames());

	// sensor
	const sensorClient = new VIAM.SensorClient(machine, 'sensor');
	const sensorReturnValue = await sensorClient.getReadings();
	console.log('sensor getReadings return value:', sensorReturnValue);

	// data_manager
	const dataManagerClient = new VIAM.DataManagerClient(machine, 'data_manager');
	const dataManagerReturnValue = await dataManagerClient.sync();
	console.log('data_manager sync return value:', dataManagerReturnValue);
};

main().catch((error: unknown) => {
	console.error('encountered an error:', error);
});
