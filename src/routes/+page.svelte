<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import VideoFeed from '$lib/VideoFeed.svelte';
	import SnapshotPreview from '$lib/SnapshotPreview.svelte';
	import { classifyImage } from '$lib/classifier';
	import Predictions from '$lib/Classifications.svelte';
	import { getViamClient, uploadData } from '$lib/viamclient';

	let mediaStream: MediaStream | null = null;
	let videoElement: HTMLVideoElement; // Type as HTMLVideoElement (non-nullable)
	let capturedSnapshot: string | null = null; // Stores the data URL of the captured image
	let classifications: any[] = []; // To store predictions if needed
	let error: string | null = null;

	let disabled = false; // Control button state
	let user_classification: string = '';

	// Run classification when capturedSnapshot changes
	$: if (capturedSnapshot) {
		const img = new Image();
		img.onload = () => {
			classifyImage(img)
				.then((result) => {
					classifications = result.classes;
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
		// Clean up temporary canvas
		canvas.remove();
	}

	async function resetSnapshot(): Promise<void> {
		capturedSnapshot = null;
		classifications = [];
		user_classification = '';
	}

	async function acceptSnapshot(): Promise<void> {
		if (user_classification === '') {
			error = 'Please classify the image a classification before uploading.';
			return;
		}
		error = null;
		disabled = true; // Disable button to prevent multiple uploads
		getViamClient()
			.then(() => {
				// Convert data URL to Uint8Array
				if (!capturedSnapshot) {
					throw new Error('No snapshot to upload');
				}
				const base64 = capturedSnapshot.split(',')[1];
				const binary = atob(base64);
				const uint8Array = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i++) {
					uint8Array[i] = binary.charCodeAt(i);
				}
				// Only provide the classname attribute for each prediction
				let tags = [];
				if (classifications.length > 0) {
					const top = classifications.reduce((a, b) => (a.score > b.score ? a : b));
					tags.push(top.className);
				}
				tags.push(user_classification);
				return uploadData(uint8Array, tags);
			})
			.then((id) => {
				console.log('Data uploaded with ID:', id);
				resetSnapshot(); // Reset snapshot after upload
				disabled = false; // Re-enable button after upload
			})
			.catch((err) => {
				error = err;
			});
	}

	function scoreOK(classifications: any[]): boolean {
		const ok = classifications.find((c) => c.className === 'OK');
		const nok = classifications.find((c) => c.className === 'NOK');
		const unknown = classifications.find((c) => c.className === 'VIAM_UNKNOWN');

		const okScore = ok ? ok.score : 0;
		const nokScore = nok ? nok.score : 0;
		const unknownScore = unknown ? unknown.score : 0;

		return okScore > nokScore && unknownScore < 0.5;
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
		<div
			style="border: 4px solid {scoreOK(classifications)
				? 'green'
				: 'red'}; border-radius: 8px; display: inline-block; padding: 4px;"
		>
			<SnapshotPreview imageDataURL={capturedSnapshot} />
		</div>
		<div style="display: flex; gap: 10px;">
			<button
				on:click={() => {
					user_classification = 'USER_OK';
				}}
				{disabled}
				class="classification-btn {user_classification === 'USER_OK' ? 'selected-ok' : ''}"
			>
				OK
			</button>
			<button
				on:click={() => {
					user_classification = 'USER_NOK';
				}}
				{disabled}
				class="classification-btn {user_classification === 'USER_NOK' ? 'selected-nok' : ''}"
			>
				NOK
			</button>
		</div>
		<div style="display: flex; gap: 10px;">
			<button on:click={acceptSnapshot} {disabled}> Accept Image </button>
			<button on:click={resetSnapshot} {disabled}> Reset Image </button>
		</div>
	{:else}
		<VideoFeed stream={mediaStream} bind:videoElement />
		<button on:click={captureSnapshot}> Capture Image </button>
	{/if}

	{#if classifications.length > 0}
		<Predictions {classifications}></Predictions>
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
	.classification-btn {
		background-color: #007bff;
	}
	.classification-btn.selected-ok {
		background-color: green;
	}
	.classification-btn.selected-nok {
		background-color: red;
	}
</style>
