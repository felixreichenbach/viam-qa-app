<script lang="ts">
	// The 'stream' prop receives the MediaStream from the parent
	export let stream: MediaStream | null;

	// The 'videoElement' prop is bound by the parent, allowing the parent
	// to get a reference to this <video> DOM node.
	export let videoElement: HTMLVideoElement; // This will be the actual HTMLVideoElement

	// Zoom level for the video
	export let zoomLevel: number = 1;

	$: if (videoElement && stream) {
		videoElement.srcObject = stream;
		// Autoplay is important for the stream to start
		// Catch the promise to avoid unhandled promise rejections
		videoElement.play().catch((e: DOMException) => console.error('Error playing video:', e));
	}
</script>

<div class="video-container">
	<video bind:this={videoElement} autoplay muted playsinline style="transform: scale({zoomLevel});"
	></video>
</div>

<style>
	.video-container {
		width: 100%; /* Make it fully responsive */
		max-width: 100%; /* Ensure it doesn't exceed parent */
		border: 1px solid #ccc;
		background-color: black;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden; /* Hide overflow when zoomed */
		aspect-ratio: 16 / 9; /* Maintain aspect ratio for consistent layout */
	}
	video {
		width: 100%;
		height: 100%;
		object-fit: cover; /* Cover the container while maintaining aspect ratio */
		display: block;
		transform-origin: center center; /* Scale from center */
	}
</style>
