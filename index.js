document.addEventListener('DOMContentLoaded', () => {
    fetchData();
});

async function fetchData() {
    try {
        const response = await fetch('https://yields.llama.fi/pools');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        
        // Filter for Morpho Blue on Base
        const pools = data.data.filter(pool => pool.project === 'morpho-blue' && pool.chain === 'Base');
        
        if (pools.length === 0) {
            throw new Error('No pools found for Morpho Blue on Base');
        }

        // Sort by TVL descending
        pools.sort((a, b) => b.tvlUsd - a.tvlUsd);

        document.getElementById('loading').style.display = 'none';
        document.querySelector('.chart-container').style.display = 'block';
        document.querySelector('.stats-grid').style.display = 'grid';

        renderChart(pools);
        renderStats(pools);
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'flex';
        document.getElementById('error').innerHTML = `<p>${error.message || 'Failed to load data. Please try again later.'}</p>`;
    }
}

function renderChart(pools) {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';

    const labels = pools.map(p => p.symbol);
    const tvlData = pools.map(p => p.tvlUsd);
    const apyData = pools.map(p => p.apy);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'TVL (USD)',
                    data: tvlData,
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                    yAxisID: 'y-tvl',
                    borderRadius: 4
                },
                {
                    label: 'APY (%)',
                    data: apyData,
                    type: 'line',
                    backgroundColor: 'rgba(139, 92, 246, 1)',
                    borderColor: 'rgb(139, 92, 246)',
                    borderWidth: 3,
                    pointBackgroundColor: '#0b0f19',
                    pointBorderColor: 'rgb(139, 92, 246)',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y-apy',
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { weight: 600 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.raw);
                            } else {
                                label += context.raw.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                'y-tvl': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'TVL (USD)',
                        color: '#3b82f6'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
                            if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
                            if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
                            return '$' + value;
                        }
                    }
                },
                'y-apy': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'APY (%)',
                        color: '#8b5cf6'
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawBorder: false
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderStats(pools) {
    const statsGrid = document.querySelector('.stats-grid');
    
    const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
    const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length;
    const highestApyPool = pools.reduce((prev, current) => (prev.apy > current.apy) ? prev : current);
    
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val) => val.toFixed(2) + '%';

    const statsHTML = `
        <div class="stat-card">
            <h3>Total TVL</h3>
            <div class="value">${formatCurrency(totalTvl)}</div>
        </div>
        <div class="stat-card">
            <h3>Pools Tracked</h3>
            <div class="value">${pools.length}</div>
        </div>
        <div class="stat-card">
            <h3>Average APY</h3>
            <div class="value">${formatPercent(avgApy)}</div>
        </div>
        <div class="stat-card">
            <h3>Highest APY (${highestApyPool.symbol})</h3>
            <div class="value">${formatPercent(highestApyPool.apy)}</div>
        </div>
    `;
    
    statsGrid.innerHTML = statsHTML;
}
