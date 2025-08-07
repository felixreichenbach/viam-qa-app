<script lang="ts">
	export let imageDataURL: string | null = null;
</script>

<div class="preview-container">
	{#if imageDataURL}
		<img src={imageDataURL} alt="Captured Snapshot" class="snapshot-image" />
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
</style>
