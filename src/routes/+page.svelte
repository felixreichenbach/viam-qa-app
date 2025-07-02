<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import VideoFeed from '$lib/VideoFeed.svelte';
	import SnapshotPreview from '$lib/SnapshotPreview.svelte';
	import { classifyImage } from '$lib/classifier';
	import Predictions from '$lib/Predictions.svelte';

	let mediaStream: MediaStream | null = null;
	let videoElement: HTMLVideoElement; // Type as HTMLVideoElement (non-nullable)
	let capturedSnapshot: string | null = null; // Stores the data URL of the captured image
	let predictions: any[] = []; // To store predictions if needed
	let error: string | null = null;

	// Run classification when capturedSnapshot changes
	$: if (capturedSnapshot) {
		const img = new Image();
		img.onload = () => {
			console.log('Image loaded for classification:');
			classifyImage(img)
				.then((result) => {
					console.log('Classification result:', result);
					predictions = result.classes;
				})
				.catch((err) => {
					console.error('Error classifying image:', err);
				});
		};
		img.src = capturedSnapshot; // Set the source to trigger loading
	}

	// Function to request camera access
	async function requestCamera(): Promise<void> {
		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			error = null;
		} catch (err: any) {
			// Type 'err' as 'any' or 'DOMException' if more specific
			console.error('Error accessing camera:', err);
			error = 'Could not access camera. Please check permissions.';
		}
	}

	// CORE CONTROL FUNCTION: Captures a snapshot from the video stream
	async function captureSnapshot(): Promise<void> {
		if (!videoElement) {
			console.warn('Video element not available yet.');
			return;
		}

		// Create a temporary canvas
		const canvas = document.createElement('canvas');
		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;
		const context = canvas.getContext('2d');

		if (!context) {
			console.error('Could not get 2D rendering context for canvas.');
			return;
		}

		// Draw the current video frame onto the canvas
		context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

		// Get the image data URL
		capturedSnapshot = canvas.toDataURL('image/png');
		console.log('Snapshot captured!');

		// Clean up temporary canvas
		canvas.remove();
	}

	async function resetSnapshot(): Promise<void> {
		capturedSnapshot = null; // Reset the captured snapshot
		predictions = []; // Clear predictions
		console.log('Snapshot reset.');
	}

	async function acceptSnapshot(): Promise<void> {
		capturedSnapshot = null; // Reset the captured snapshot
		predictions = []; // Clear predictions
		console.log('Snapshot accepted.');
	}

	// Lifecycle: Request camera on mount, stop stream on destroy
	onMount(requestCamera);

	onDestroy(() => {
		if (mediaStream) {
			mediaStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
		}
	});
</script>

<main style="max-width: 500px; width: 100%; margin: 0 auto;">
	{#if error}
		<p class="error">{error}</p>
	{:else if !mediaStream}
		<p>Loading camera...</p>
	{/if}

	{#if capturedSnapshot}
		<SnapshotPreview imageDataURL={capturedSnapshot} />
		<div style="display: flex; gap: 10px;">
			<button on:click={resetSnapshot}> Reset Image </button>
			<button on:click={acceptSnapshot}> Accept Image </button>
		</div>
	{:else}
		<VideoFeed stream={mediaStream} bind:videoElement />
		<button on:click={captureSnapshot}> Capture Image </button>
	{/if}

	{#if predictions.length > 0}
		<Predictions {predictions}></Predictions>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
		padding: 20px;
	}
	.error {
		color: red;
	}
	button {
		padding: 10px 20px;
		font-size: 1rem;
		cursor: pointer;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
	}
	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
	}
</style>
