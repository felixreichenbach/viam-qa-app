<script lang="ts">
	type Classification = {
		className: string;
		score: number;
	};

	export let classifications: Classification[] = [];

	// Map of className to display name
	const nameMap: Record<string, string> = {
		VIAM_UNKNOWN: 'Not seen before',
		NOK: 'Not OK',
		OK: 'OK'
	};

	// Transform predictions to three items with mapped names and percentage scores
	const transformedClassification = Array(3)
		.fill(null)
		.map((_, i) => {
			const pred = classifications[i];
			return {
				className: pred ? nameMap[pred.className] || pred.className : '',
				score: pred ? `${Math.round(pred.score * 100)}%` : ''
			};
		});
</script>

{#if classifications.length}
	<h1 style="text-align: left; width: 100%; margin: 0 0 0.5em 0;">
		<b>Classifications</b>
	</h1>
	<ul style="width: 100%; list-style: none; padding: 0; margin: 0;">
		{#each transformedClassification as classification}
			<li
				style="display: flex; justify-content: space-between; align-items: center; padding: 0.5em 0; width: 100%;"
			>
				<span style="text-align: left;">{classification.className}</span>
				<span style="text-align: right;">{classification.score}</span>
			</li>
		{/each}
	</ul>
{/if}
