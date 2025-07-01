<script lang="ts">
	export let imageDataURL: string | null = null;
</script>

<div class="preview-container">
	{#if imageDataURL}
		<img src={imageDataURL} alt="Captured Snapshot" class="snapshot-image" />
		<!-- <a href={imageDataURL} download="snapshot.png" class="download-link">Download Snapshot</a> -->
	{:else}
		<p>No snapshot captured yet.</p>
	{/if}
</div>

<style>
	.preview-container {
		text-align: center;
	}
	.snapshot-image {
		max-width: 100%;
		height: auto;
		border: 1px solid #ddd;
	}
	.download-link {
		display: inline-block;
		margin-top: 10px;
		padding: 8px 15px;
		background-color: #28a745;
		color: white;
		text-decoration: none;
		border-radius: 5px;
	}
</style>
