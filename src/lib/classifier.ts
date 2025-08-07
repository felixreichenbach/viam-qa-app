import * as tfTask from '@tensorflow-models/tasks';
import { resizeImageTo256 } from './utils';

let model: tfTask.ICCustomModelTFLite | null = null;

export async function loadClassifier() {
	model = await tfTask.ImageClassification.CustomModel.TFLite.load({
		model: 'model.tflite'
	});
}

export async function classifyImage(image: HTMLImageElement) {
	if (!model) {
		await loadClassifier();
	}
	if (!model) {
		throw new Error('Model not loaded');
	}
	const preprocessed = resizeImageTo256(image);
	console.log('Preprocessed image size:', preprocessed.width, 'x', preprocessed.height);
	const result = await model.predict(preprocessed);
	return result;
}
