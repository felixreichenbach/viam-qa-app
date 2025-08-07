export function resizeImageTo256(image: HTMLImageElement): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get canvas context');
	}
	ctx.drawImage(image, 0, 0, 256, 256);
	return canvas;
}

function cropCenter(image: ImageBitmap, targetSize: number = 512): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = targetSize;
	canvas.height = targetSize;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get canvas context');
	}

	// Calculate the center crop coordinates from the source image
	const x = (image.width - targetSize) / 2;
	const y = (image.height - targetSize) / 2;

	console.log('Crop debug:', {
		originalSize: `${image.width}x${image.height}`,
		cropSize: targetSize,
		cropPosition: `${x}, ${y}`
	});

	ctx.drawImage(image, x, y, targetSize, targetSize, 0, 0, targetSize, targetSize);
	return canvas;
}

export function rotateImageCounterClock90(image: HTMLImageElement): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = image.height;
	canvas.height = image.width;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Could not get canvas context');
	}
	ctx.save();
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.drawImage(image, -image.width / 2, -image.height / 2);
	ctx.restore();
	return canvas;
}

export async function getSnapshot(blob: Blob): Promise<string> {
	const imageBitmap = await createImageBitmap(blob);
	console.log(`Photo resolution: ${imageBitmap.width}x${imageBitmap.height}`);
	console.log(`File size: ${blob.size} bytes`);
	// Create a temporary canvas
	const canvas = document.createElement('canvas');
	canvas.width = imageBitmap.width;
	canvas.height = imageBitmap.height;
	const context = canvas.getContext('2d');
	if (!context) {
		console.error('Could not get 2D rendering context for canvas.');
		throw new Error('Could not get 2D rendering context for canvas.');
	}
	context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
	const snapshot = canvas.toDataURL('image/png');
	canvas.remove();
	return snapshot;
}
