<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import VideoFeed from '$lib/VideoFeed.svelte';
	import SnapshotPreview from '$lib/SnapshotPreview.svelte';
	import { classifyImage, loadClassifier } from '$lib/classifier';
	import { getViamClient, uploadData } from '$lib/viamclient';
	import { getSnapshot } from '$lib/utils';

	let mediaStream: MediaStream | null = null;
	let videoElement: HTMLVideoElement;
	let capturedSnapshot: string = '';
	let imageCapture: ImageCapture | null = null;
	let error: string | null = null;

	interface Class {
		className: string;
		score: number;
	}
	let classifications: Class[] = [];

	let disabled = false; // Control button state
	let user_classification: string = '';

	async function requestCamera(): Promise<void> {
		try {
			mediaStream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' }
			});
			const track = mediaStream.getVideoTracks()[0];
			imageCapture = new ImageCapture(track);
			error = null;
		} catch (err: any) {
			console.error('Error accessing camera:', err);
			error = 'Could not access camera. Please check permissions.';
		}
	}

	async function onTakePhotoButtonClick() {
		if (!imageCapture) {
			console.warn('ImageCapture is not initialized.');
			return;
		}
		try {
			const blob = await imageCapture.takePhoto();
			capturedSnapshot = await getSnapshot(blob);
		} catch (err) {
			console.error('Error capturing photo:', err);
			error = 'Could not capture photo. Please try again.';
		}
	}

	// Run classification when capturedSnapshot changes
	$: if (capturedSnapshot) {
		const img = new Image();
		img.onload = () => {
			classifyImage(img)
				.then((result) => {
					console.log('Classifications:', result.classes);
					classifications = result.classes;
				})
				.catch((err) => {
					console.error('Error classifying image:', err);
				});
		};
		img.src = capturedSnapshot;
	}

	async function resetSnapshot(): Promise<void> {
		capturedSnapshot = '';
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
				if (!capturedSnapshot) {
					throw new Error('No snapshot to upload');
				}
				const base64 = capturedSnapshot.split(',')[1];
				const binary = atob(base64);
				const uint8Array = new Uint8Array(binary.length);
				for (let i = 0; i < binary.length; i++) {
					uint8Array[i] = binary.charCodeAt(i);
				}
				return uploadData(uint8Array, classifications, user_classification);
			})
			.then((id) => {
				console.log('Data uploaded with ID:', id);
				resetSnapshot();
				disabled = false;
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

	onMount(requestCamera);
	onMount(loadClassifier);

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
		<button on:click={onTakePhotoButtonClick}> Capture Image </button>
	{/if}
	<!--Uncomment if you want to display classifications
	{#if classifications.length > 0}
		<Predictions {classifications}></Predictions>
	{/if}
	-->
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
