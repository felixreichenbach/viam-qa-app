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
