// Import @tensorflow-models/tasks.
import * as tfTask from '@tensorflow-models/tasks';
import type { ODCustomModelTFLite } from '@tensorflow-models/tasks/dist/tasks/object_detection/custom_model_tflite';

let model: tfTask.ICCustomModelTFLite | null = null;
//let model: ODCustomModelTFLite | null = null;

export async function loadClassifier() {
	model = await tfTask.ImageClassification.CustomModel.TFLite.load({
		model: 'model.tflite'
	});

	/*
	model1 = await tfTask.ObjectDetection.CustomModel.TFLite.load({
		model: 'model/model.tflite'
	});
	*/
}

export async function classifyImage(image: HTMLImageElement) {
	if (!model) {
		await loadClassifier();
	}
	if (!model) {
		throw new Error('Model not loaded');
	}
	const result = await model.predict(image);
	return result;
}
