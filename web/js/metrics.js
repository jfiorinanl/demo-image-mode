class MetricsDashboard {
    constructor() {
        this.isActive = true; // Always active now
        this.currentState = 'monitoring';
        this.metricsData = [];
        this.charts = {};
        this.updateStatus = {
            available: false,
            in_progress: false,
            current_version: 'v2.1.0',
            latest_version: 'v2.1.0'
        };
        
        this.init();
        this.setupEventListeners();
    }
    
    init() {
        // Dashboard is now directly in HTML, just setup uptime chart
        this.setupUptimeChart();
    }
    
    setupUptimeChart() {
        const canvas = document.getElementById('uptime-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Create uptime chart with Chart.js
        this.uptimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'System Uptime %',
                    data: [],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 2,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 99,
                        max: 100,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2) + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        backgroundColor: '#28a745'
                    }
                }
            }
        });
        
        // Initialize with some data points showing high uptime
        this.initializeUptimeData();
    }
    
    initializeUptimeData() {
        const now = new Date();
        const labels = [];
        const data = [];
        
        // Generate last 24 hours of uptime data
        for (let i = 23; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 60 * 60 * 1000));
            labels.push(time.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }));
            // Simulate near-perfect uptime with occasional tiny dips
            data.push(99.95 + Math.random() * 0.05);
        }
        
        this.uptimeChart.data.labels = labels;
        this.uptimeChart.data.datasets[0].data = data;
        this.uptimeChart.update();
    }
    
    setupEventListeners() {
        // Auto-start metrics collection when dashboard is shown
        this.startMetricsCollection();
    }
    
    updateUptimeDisplay() {
        // Update current uptime
        const uptimeElement = document.getElementById('current-uptime');
        if (uptimeElement) {
            const uptime = this.metricsData.length > 0 
                ? this.metricsData[this.metricsData.length - 1].uptime 
                : { app: 0 };
            
            const seconds = Math.floor(uptime.app);
            const days = Math.floor(seconds / 86400);
            const hours = Math.floor((seconds % 86400) / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            uptimeElement.textContent = `${days}d ${hours}h ${minutes}m`;
        }
        
        // Update total requests
        const totalRequestsElement = document.getElementById('total-requests');
        if (totalRequestsElement) {
            totalRequestsElement.textContent = this.metricsData.length > 0 
                ? this.metricsData[this.metricsData.length - 1].requests.total 
                : 0;
        }
        
        // Update last update time if there was a version change
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement && this.updateStatus.current_version !== 'v2.1.0') {
            lastUpdateElement.textContent = 'Recent';
        }
        
        // Update uptime chart with new data point
        if (this.uptimeChart && this.metricsData.length > 0) {
            const now = new Date();
            const timeLabel = now.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // Add new data point (simulating high uptime)
            const uptimePercentage = 99.95 + Math.random() * 0.05;
            
            this.uptimeChart.data.labels.push(timeLabel);
            this.uptimeChart.data.datasets[0].data.push(uptimePercentage);
            
            // Keep only last 24 points
            if (this.uptimeChart.data.labels.length > 24) {
                this.uptimeChart.data.labels.shift();
                this.uptimeChart.data.datasets[0].data.shift();
            }
            
            this.uptimeChart.update('none'); // No animation for smooth updates
        }
    }
    
    startMetricsCollection() {
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        
        this.metricsInterval = setInterval(() => {
            this.fetchMetrics();
            this.checkForUpdates();
        }, 5000); // Update every 5 seconds
        
        // Initial fetch
        this.fetchMetrics();
    }
    
    async fetchMetrics() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            
            this.metricsData.push({
                ...data,
                timestamp: Date.now()
            });
            
            // Keep only last 20 data points
            if (this.metricsData.length > 20) {
                this.metricsData = this.metricsData.slice(-20);
            }
            
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        }
    }
    
    updateDashboard(data) {
        if (!this.isActive) return;
        
        // Update CPU gauge
        this.updateGauge('cpu', data.cpu.usage);
        
        // Update Memory gauge
        this.updateGauge('memory', data.memory.percent);
        
        // Update Response Time
        document.getElementById('response-value').textContent = data.requests.avgResponseTime;
        
        // Update Requests/sec
        document.getElementById('requests-value').textContent = data.requests.perSecond;
        
        // Update Network I/O
        document.getElementById('network-in').textContent = data.network.in;
        document.getElementById('network-out').textContent = data.network.out;
        
        // Update Performance metrics
        document.getElementById('connections-value').textContent = data.performance.activeConnections;
        document.getElementById('cache-value').textContent = data.performance.cacheHitRatio + '%';
        
        // Update system load
        const systemLoadElement = document.getElementById('system-load');
        if (systemLoadElement && data.load) {
            systemLoadElement.textContent = data.load['1min'];
        }
        
        // Update version displays in all locations
        const elements = ['version-badge', 'current-version-display'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.updateStatus.current_version;
            }
        });
        
        // Update available version display
        const availableVersionElement = document.getElementById('available-version-display');
        if (availableVersionElement) {
            if (this.updateStatus.update_available) {
                availableVersionElement.textContent = this.updateStatus.latest_version;
            } else if (this.updateStatus.update_in_progress) {
                availableVersionElement.textContent = `Installing ${this.updateStatus.latest_version}`;
            } else {
                availableVersionElement.textContent = 'Up to date';
            }
        }
        
        // Update last check time
        const lastCheckElement = document.getElementById('last-check-time');
        if (lastCheckElement) {
            lastCheckElement.textContent = 'Just now';
        }
        
        // Update card states
        this.updateCardStates(data);
        
        // Update change indicators
        this.updateChangeIndicators(data);
        
        // Update version display
        this.updateVersionDisplay();
        
        // Update uptime display and chart
        this.updateUptimeDisplay();
    }
    
    updateGauge(type, value) {
        const gauge = document.querySelector(`.gauge-progress.${type}`);
        const valueEl = document.getElementById(`${type}-value`);
        
        const circumference = 2 * Math.PI * 40; // radius = 40
        const offset = circumference - (value / 100) * circumference;
        
        gauge.style.strokeDasharray = circumference;
        gauge.style.strokeDashoffset = offset;
        
        valueEl.textContent = Math.round(value) + '%';
        
        // Change color based on value
        if (value > 80) {
            gauge.style.stroke = '#ff6b6b';
        } else if (value > 60) {
            gauge.style.stroke = '#ffd93d';
        } else {
            gauge.style.stroke = type === 'cpu' ? '#69BFD3' : '#BCE3CC';
        }
    }
    
    updateCardStates(data) {
        const cpuCard = document.getElementById('cpu-card');
        const memoryCard = document.getElementById('memory-card');
        const responseCard = document.getElementById('response-card');
        
        // Reset classes
        [cpuCard, memoryCard, responseCard].forEach(card => {
            card.classList.remove('critical', 'optimal');
        });
        
        // Add states based on metrics
        if (data.cpu.usage > 80) cpuCard.classList.add('critical');
        else if (data.cpu.usage < 20) cpuCard.classList.add('optimal');
        
        if (data.memory.percent > 85) memoryCard.classList.add('critical');
        else if (data.memory.percent < 40) memoryCard.classList.add('optimal');
        
        if (data.requests.avgResponseTime > 200) responseCard.classList.add('critical');
        else if (data.requests.avgResponseTime < 50) responseCard.classList.add('optimal');
    }
    
    updateChangeIndicators(data) {
        const indicators = {
            'cpu-change': this.getChangeText(data.cpu.usage, 'cpu'),
            'memory-change': this.getChangeText(data.memory.percent, 'memory'),
            'response-change': this.getChangeText(data.requests.avgResponseTime, 'response'),
            'requests-change': this.getChangeText(data.requests.perSecond, 'requests'),
            'network-change': 'I/O: ' + (data.network.in + data.network.out) + ' KB/s',
            'performance-change': data.performance.cacheHitRatio > 85 ? 'High efficiency' : 'Normal operation'
        };
        
        Object.entries(indicators).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });
    }
    
    getChangeText(value, type) {
        switch (type) {
            case 'cpu':
                if (value > 80) return '🔴 High load';
                if (value < 20) return '🟢 Low usage';
                return '🟡 Normal';
            case 'memory':
                if (value > 85) return '🔴 High usage';
                if (value < 40) return '🟢 Available';
                return '🟡 Moderate';
            case 'response':
                if (value > 200) return '🔴 Slow';
                if (value < 50) return '🟢 Fast';
                return '🟡 Normal';
            case 'requests':
                if (value > 100) return '🔴 Heavy load';
                if (value < 10) return '🟢 Light load';
                return '🟡 Moderate';
        }
    }
    
    async checkForUpdates() {
        try {
            const response = await fetch('/api/update-status');
            const status = await response.json();
            
            this.updateStatus = status;
            
            if (status.update_available && !status.update_in_progress) {
                this.showBanner(`🔄 Update available: ${status.latest_version}`, 5000);
            } else if (status.update_in_progress) {
                this.showBanner(`🔄 System updating to ${status.latest_version}...`, 10000);
            } else if (status.update_completed) {
                this.showBanner(`✅ System updated to ${status.current_version} successfully!`, 5000);
            }
            
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }
    
    updateVersionDisplay() {
        // Update version info in the dashboard if needed
        if (this.isActive && this.updateStatus) {
            const versionElement = document.querySelector('.metrics-header .metrics-subtitle');
            if (versionElement) {
                const statusText = this.updateStatus.update_in_progress 
                    ? `Updating to ${this.updateStatus.latest_version}...`
                    : `Running ${this.updateStatus.current_version}`;
                versionElement.textContent = `Real-time metrics from RHEL 10 Image Mode - ${statusText}`;
            }
        }
    }
    
    showBanner(message, duration = 3000) {
        const banner = document.getElementById('system-banner');
        banner.textContent = message;
        banner.classList.add('active');
        
        setTimeout(() => {
            banner.classList.remove('active');
        }, duration);
    }
    
    showComparison(result) {
        const modal = document.getElementById('performance-comparison');
        const content = document.getElementById('comparison-content');
        
        if (result.baseline && result.current) {
            content.innerHTML = `
                <div class="comparison-item before">
                    <div class="comparison-label">Before Optimization</div>
                    <div class="comparison-value">CPU: ${result.baseline.cpu.toFixed(1)}%</div>
                    <div class="comparison-value">Memory: ${result.baseline.memory.toFixed(1)}%</div>
                    <div class="comparison-value">Response: ${result.baseline.responseTime.toFixed(0)}ms</div>
                </div>
                <div class="comparison-item after">
                    <div class="comparison-label">After Optimization</div>
                    <div class="comparison-value">CPU: ${result.current.cpu.toFixed(1)}%</div>
                    <div class="comparison-value">Memory: ${result.current.memory.toFixed(1)}%</div>
                    <div class="comparison-value">Response: ${result.current.responseTime.toFixed(0)}ms</div>
                </div>
                <div style="grid-column: 1 / -1;">
                    <div class="comparison-improvement">
                        🎯 Performance Improvements:
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
                        <div style="text-align: center;">
                            <div style="color: #BCE3CC; font-weight: 600;">CPU</div>
                            <div>${result.improvements.cpu_reduction || 'N/A'}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #BCE3CC; font-weight: 600;">Memory</div>
                            <div>${result.improvements.memory_cleanup || 'N/A'}</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="color: #BCE3CC; font-weight: 600;">Speed</div>
                            <div>${result.improvements.response_time_improvement || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        modal.classList.add('active');
    }
    
    hideComparison() {
        document.getElementById('performance-comparison').classList.remove('active');
    }
}

// Initialize metrics manager when page loads
let metricsManager;
document.addEventListener('DOMContentLoaded', () => {
    metricsManager = new MetricsDashboard();
});