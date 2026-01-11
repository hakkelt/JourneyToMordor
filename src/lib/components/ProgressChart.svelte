<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { LogEntry } from '$lib/storage';
	import { FRODO_JOURNEY } from '$lib/data';

	interface Props {
		logs: LogEntry[];
		startDate: string; // YYYY-MM-DD
	}

	let { logs, startDate }: Props = $props();
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	// Prepare Data
	let chartData = $derived.by(() => {
		// 1. Process User Data
		// Group logs by day and sort
		const start = new Date(startDate);
		const sortedLogs = [...logs].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		// Create cumulative map
		// We need points for every day? Or just the days where logs exist?
		// Chart.js scatter or line chart works with X,Y points nicely.

		let runningTotal = 0;
		const userDataPoints = sortedLogs.map((log) => {
			const logDate = new Date(log.date);
			// Diff in days
			const diffTime = logDate.getTime() - start.getTime();
			const diffDays = diffTime / (1000 * 60 * 60 * 24); // Floating point days relative to start

			runningTotal += log.distance;
			return { x: diffDays, y: runningTotal };
		});

		// Ensure we start at 0,0
		if (userDataPoints.length === 0 || userDataPoints[0].x > 0) {
			userDataPoints.unshift({ x: 0, y: 0 });
		}

		// 2. Process Frodo Data
		const frodoDataPoints = FRODO_JOURNEY.map((p) => ({
			x: p.day,
			y: p.totalDistance,
			label: p.label
		}));

		return {
			datasets: [
				{
					label: 'You',
					data: userDataPoints,
					borderColor: '#D35400', // Pumpkin
					backgroundColor: 'rgba(211, 84, 0, 0.1)',
					fill: true,
					tension: 0.2
				},
				{
					label: 'Frodo',
					data: frodoDataPoints,
					borderColor: '#2C3E50', // Dark Slate
					borderDash: [5, 5],
					pointRadius: 0,
					fill: false,
					tension: 0.4
				}
			]
		};
	});

	function initChart() {
		if (!chartCanvas) return;
		if (chartInstance) chartInstance.destroy();

		chartInstance = new Chart(chartCanvas, {
			type: 'line',
			data: chartData,
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: {
					mode: 'nearest', // Only show the closest point (separate tooltips)
					intersect: false
				},
				scales: {
					x: {
						type: 'linear',
						title: {
							display: true,
							text: 'Days since start'
						},
						suggestedMax: 185 // Frodo's journey length
					},
					y: {
						title: {
							display: true,
							text: 'Distance (km)'
						}
					}
				},
				plugins: {
					title: {
						display: true,
						text: 'The Fellowship Gap'
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const yValue = context.parsed.y !== null ? context.parsed.y.toFixed(1) : '0.0';
								let label = `${context.dataset.label}: ${yValue} km`;
								const raw = context.raw as { label?: string };
								if (raw && raw.label) {
									label += ` (${raw.label})`;
								}
								return label;
							}
						}
					}
				}
			}
		});
	}

	onMount(() => {
		initChart();

		return () => {
			if (chartInstance) chartInstance.destroy();
		};
	});

	// React to data changes
	$effect(() => {
		if (chartInstance) {
			chartInstance.data = chartData;
			chartInstance.update();
		}
	});
</script>

<div class="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
	<canvas bind:this={chartCanvas}></canvas>
</div>
