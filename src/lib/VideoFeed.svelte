<script lang="ts">
	// The 'stream' prop receives the MediaStream from the parent
	export let stream: MediaStream | null;

	// The 'videoElement' prop is bound by the parent, allowing the parent
	// to get a reference to this <video> DOM node.
	export let videoElement: HTMLVideoElement; // This will be the actual HTMLVideoElement

	$: if (videoElement && stream) {
		videoElement.srcObject = stream;
		// Autoplay is important for the stream to start
		// Catch the promise to avoid unhandled promise rejections
		videoElement.play().catch((e: DOMException) => console.error('Error playing video:', e));
	}
</script>

<div class="video-container">
	<video bind:this={videoElement} autoplay muted playsinline></video>
</div>

<style>
	.video-container {
		width: 640px; /* Or responsive width */
		max-width: 100%;
		border: 1px solid #ccc;
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	video {
		width: 100%;
		height: auto;
		display: block;
	}
</style>
