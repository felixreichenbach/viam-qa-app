<script lang="ts">
	export let predictions: any[] = [];
</script>

{#if predictions.length}
	<h1 style="text-align: left; width: 100%; margin: 0 0 0.5em 0;">
		<b>Predictions</b>
	</h1>
	<ul style="width: 100%; list-style: none; padding: 0; margin: 0;">
		{#each predictions as classification}
			<li
				style="display: flex; justify-content: space-between; align-items: center; padding: 0.5em 0; width: 100%;"
			>
				<span style="text-align: left;">{classification.className}</span>
				<span style="text-align: right;">{classification.score}</span>
			</li>
		{/each}
	</ul>
{/if}
