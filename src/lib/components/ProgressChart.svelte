<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { LogEntry } from '$lib/storage';
	import { getStartDate } from '$lib/storage';
	import { FRODO_JOURNEY } from '$lib/data';
	import { theme } from '$lib/stores/theme';

	interface Props {
		logs: LogEntry[];
		unit?: 'km' | 'miles';
	}

	let { logs, unit = 'km' }: Props = $props();
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: Chart | null = null;

	const KM_TO_MILES = 0.621371;

	type ScaleOptions = {
		title?: { text: string; color?: string };
		ticks?: { color?: string };
		grid?: { color?: string };
	};

	// Prepare Data
	let chartData = $derived.by(() => {
		// Calculate start date from logs
		const startDate = getStartDate(logs);

		// 1. Process User Data
		// Group logs by day and sort
		const sortedLogs = [...logs].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		// Create cumulative map
		let runningTotal = 0;
		const userDataPoints = sortedLogs.map((log) => {
			// Parse dates and normalize to midnight UTC to avoid timezone issues
			const logDate = new Date(log.date + 'T00:00:00Z');
			const startDateNormalized = new Date(startDate + 'T00:00:00Z');

			// Calculate difference in days
			const diffTime = logDate.getTime() - startDateNormalized.getTime();
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			runningTotal += log.distance;
			const yValue = unit === 'miles' ? runningTotal * KM_TO_MILES : runningTotal;
			return { x: diffDays, y: yValue };
		});

		// Ensure we start at 0,0
		if (userDataPoints.length === 0 || userDataPoints[0].x > 0) {
			userDataPoints.unshift({ x: 0, y: 0 });
		}

		// 2. Process Frodo Data
		const frodoDataPoints = FRODO_JOURNEY.map((p) => ({
			x: p.day,
			y: unit === 'miles' ? p.totalDistance * KM_TO_MILES : p.totalDistance,
			label: p.label
		}));

		const frodoColor = getChartColors().frodoColor;

		return {
			datasets: [
				{
					label: 'You',
					data: userDataPoints,
					borderColor: '#d97706', // Ring-500 (Gold/Amber)
					backgroundColor: 'rgba(217, 119, 6, 0.1)',
					fill: true,
					tension: 0.2
				},
				{
					label: 'Frodo',
					data: frodoDataPoints,
					borderColor: frodoColor,
					borderDash: [5, 5],
					pointRadius: 0,
					fill: false,
					tension: 0.4
				}
			]
		};
	});

	function getChartColors() {
		const isDark = $theme === 'dark';
		return {
			tickColor: isDark ? '#94a3b8' : '#64748b',
			gridColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.1)',
			titleColor: isDark ? '#cbd5e1' : '#334155',
			legendColor: isDark ? '#cbd5e1' : '#334155',
			frodoColor: isDark ? '#94a3b8' : '#2C3E50'
		};
	}

	function initChart() {
		if (!chartCanvas) return;
		if (chartInstance) chartInstance.destroy();

		const colors = getChartColors();

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
							text: 'Days since start',
							color: colors.titleColor
						},
						ticks: { color: colors.tickColor },
						grid: { color: colors.gridColor },
						suggestedMax: 185 // Frodo's journey length
					},
					y: {
						title: {
							display: true,
							text: `Distance (${unit === 'miles' ? 'miles' : 'km'})`,
							color: colors.titleColor
						},
						ticks: { color: colors.tickColor },
						grid: { color: colors.gridColor }
					}
				},
				plugins: {
					legend: {
						labels: {
							color: colors.legendColor,
							usePointStyle: true,
							generateLabels: (chart) => {
								const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
								labels.forEach((label) => {
									label.pointStyle = 'line';
									if (label.datasetIndex !== undefined) {
										const dataset = chart.data.datasets[label.datasetIndex];
										// @ts-expect-error - Line chart datasets allow borderDash but types might be strict
										if (dataset.borderDash) {
											// @ts-expect-error - LegendItem has lineDash in recent Chart.js but types might lag
											label.lineDash = dataset.borderDash;
										}
									}
									label.lineWidth = 4;
								});
								return labels;
							}
						}
					},
					title: {
						display: true,
						text: 'The Fellowship Gap',
						color: colors.titleColor
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const yValue = context.parsed.y !== null ? context.parsed.y.toFixed(1) : '0.0';
								let label = `${context.dataset.label}: ${yValue} ${unit === 'miles' ? 'miles' : 'km'}`;
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

	// React to data changes and theme changes
	$effect(() => {
		if (chartInstance) {
			const colors = getChartColors();
			chartInstance.data = chartData;
			// Update y-axis label dynamically
			const xScale = chartInstance.options.scales?.x as ScaleOptions | undefined;
			const yScale = chartInstance.options.scales?.y as ScaleOptions | undefined;
			if (yScale?.title) {
				yScale.title.text = `Distance (${unit === 'miles' ? 'miles' : 'km'})`;
				yScale.title.color = colors.titleColor;
			}
			if (yScale?.ticks) yScale.ticks.color = colors.tickColor;
			if (yScale?.grid) yScale.grid.color = colors.gridColor;
			if (xScale?.title) {
				xScale.title.color = colors.titleColor;
			}
			if (xScale?.ticks) xScale.ticks.color = colors.tickColor;
			if (xScale?.grid) xScale.grid.color = colors.gridColor;

			// Update legend and title colors
			const plugins = chartInstance.options.plugins as {
				legend?: { labels?: { color?: string } };
				title?: { color?: string };
			};
			if (plugins?.legend?.labels) plugins.legend.labels.color = colors.legendColor;
			if (plugins?.title) plugins.title.color = colors.titleColor;

			chartInstance.update();
		}
	});
</script>

<div
	class="h-80 w-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-700"
>
	<canvas bind:this={chartCanvas}></canvas>
</div>
