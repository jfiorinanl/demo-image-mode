const express = require('express');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const app = express();
const port = 3001;

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Metrics tracking
let requestCount = 0;
let startTime = Date.now();
let responseTimes = [];

// Update tracking
let currentVersion = 'v2.1.0';
let lastUpdateCheck = Date.now();
let updateCache = null;

// Uptime tracking
let serverStartTime = Date.now();
let uptimeHistory = [];
let lastVersionUpdate = null;

// Middleware to track requests
app.use((req, res, next) => {
    const start = Date.now();
    requestCount++;
    
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        responseTimes.push(responseTime);
        // Keep only last 100 response times
        if (responseTimes.length > 100) {
            responseTimes = responseTimes.slice(-100);
        }
    });
    
    next();
});

// CPU usage calculation
function getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
        for (let type in cpu.times) {
            totalTick += cpu.times[type];
        }
        totalIdle += cpu.times.idle;
    });
    
    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    let usage = 100 - ~~(100 * idle / total);
    
    // Add small variation for demo purposes
    usage = Math.max(5, usage + Math.random() * 10);
    
    return Math.round(usage * 100) / 100;
}

// Memory usage calculation
function getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usagePercent = (used / total) * 100;
    
    return {
        total: Math.round(total / 1024 / 1024), // MB
        used: Math.round(used / 1024 / 1024),   // MB
        free: Math.round(free / 1024 / 1024),   // MB
        percent: Math.round(usagePercent * 100) / 100
    };
}

// Response time calculation
function getAverageResponseTime() {
    if (responseTimes.length === 0) return 35;
    
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    
    return Math.round(avgTime * 100) / 100;
}

// Get system uptime
function getSystemUptime() {
    return {
        system: Math.round(os.uptime()),
        app: Math.round((Date.now() - startTime) / 1000)
    };
}

// Get load average
function getLoadAverage() {
    const loads = os.loadavg();
    return {
        '1min': loads[0].toFixed(2),
        '5min': loads[1].toFixed(2),
        '15min': loads[2].toFixed(2)
    };
}

// Variable metrics calculation
function getVariableMetrics() {
    const baseTime = Date.now();
    const variationFactor = Math.sin(baseTime / 10000) * 0.3 + 0.7;
    
    const requestsPerSecond = Math.round((requestCount / ((baseTime - startTime) / 1000)) * variationFactor);
    const networkIn = Math.round(Math.random() * 500 + 100);
    const networkOut = Math.round(Math.random() * 250 + 50);
    const activeConnections = Math.round(Math.random() * 30 + 10);
    const cacheHitRatio = Math.round((Math.random() * 15 + 80) * 100) / 100;
    
    return {
        requestsPerSecond: Math.max(1, requestsPerSecond),
        networkIn,
        networkOut,
        activeConnections,
        cacheHitRatio
    };
}

// Calculate uptime percentage for demo
function getUptimePercentage() {
    // For demo purposes, show high uptime with tiny variations
    const baseUptime = 99.95;
    const variation = Math.random() * 0.05; // 0-0.05%
    return Math.round((baseUptime + variation) * 100) / 100;
}

// Track version updates for uptime demo
function trackVersionUpdate(newVersion) {
    const now = Date.now();
    lastVersionUpdate = {
        from: currentVersion,
        to: newVersion,
        timestamp: now,
        downtime_seconds: 0 // Zero downtime!
    };
    currentVersion = newVersion;
    
    // Add to uptime history
    uptimeHistory.push({
        timestamp: now,
        event: 'version_update',
        uptime_maintained: true
    });
}

// Main metrics endpoint
app.get('/api/metrics', (req, res) => {
    const cpu = getCPUUsage();
    const memory = getMemoryUsage();
    const uptime = getSystemUptime();
    const load = getLoadAverage();
    const variable = getVariableMetrics();
    
    const metrics = {
        timestamp: Date.now(),
        cpu: {
            usage: cpu,
            cores: os.cpus().length
        },
        memory: memory,
        requests: {
            total: requestCount,
            avgResponseTime: getAverageResponseTime(),
            perSecond: variable.requestsPerSecond
        },
        uptime: uptime,
        load: load,
        network: {
            in: variable.networkIn,
            out: variable.networkOut
        },
        performance: {
            activeConnections: variable.activeConnections,
            cacheHitRatio: variable.cacheHitRatio
        },
        system: {
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname(),
            nodeVersion: process.version
        },
        version: {
            current: currentVersion,
            uptime: uptime.app
        },
        uptime_tracking: {
            server_start: serverStartTime,
            current_uptime_seconds: Math.floor((Date.now() - serverStartTime) / 1000),
            uptime_percentage: getUptimePercentage(),
            last_update: lastVersionUpdate,
            zero_downtime: true
        }
    };
    
    res.json(metrics);
});

// Helper function to get current version from version.json
function getCurrentVersion() {
    try {
        const versionPath = path.join(__dirname, 'version.json');
        if (fs.existsSync(versionPath)) {
            const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
            return versionData.version || currentVersion;
        }
    } catch (error) {
        console.error('Error reading version.json:', error);
    }
    return currentVersion;
}

// Demo simulation for GitHub releases
function simulateGitHubRelease() {
    // For demo purposes, simulate an update becoming available after some time
    const uptime = process.uptime();
    const shouldHaveUpdate = uptime > 60; // After 1 minute of uptime
    
    let latestVersion = currentVersion;
    if (shouldHaveUpdate) {
        // Simulate progression: v2.1.0 -> v2.2.0 -> v2.3.0
        if (currentVersion === 'v2.1.0') {
            latestVersion = 'v2.2.0';
        } else if (currentVersion === 'v2.2.0') {
            latestVersion = 'v2.3.0';
        }
    }
    
    return {
        tag_name: latestVersion,
        published_at: new Date().toISOString(),
        html_url: `https://github.com/jfiorinanl/demo-image-mode/releases/tag/${latestVersion}`
    };
}

// Helper function to check bootc status
async function getBootcStatus() {
    try {
        const { stdout } = await execAsync('bootc status --json 2>/dev/null || echo \'{"spec":{"image":"v2.1.0"},"status":{"staged":null}}\'');
        const status = JSON.parse(stdout.trim());
        
        return {
            current_image: status.spec?.image || currentVersion,
            staged_image: status.status?.staged?.image || null,
            update_pending: !!status.status?.staged
        };
    } catch (error) {
        console.error('Error getting bootc status:', error);
        // Fallback for systems without bootc
        return {
            current_image: currentVersion,
            staged_image: null,
            update_pending: false
        };
    }
}

// Update status endpoint - checks for available updates
app.get('/api/update-status', async (req, res) => {
    try {
        // Update current version from file
        currentVersion = getCurrentVersion();
        
        // Get bootc status
        const bootcStatus = await getBootcStatus();
        
        // Check for latest release (with cache)
        const now = Date.now();
        if (!updateCache || (now - lastUpdateCheck > 30000)) { // Cache for 30 seconds
            updateCache = simulateGitHubRelease();
            lastUpdateCheck = now;
        }
        
        const latestVersion = updateCache.tag_name;
        const updateAvailable = latestVersion !== currentVersion && !bootcStatus.update_pending;
        const updateInProgress = bootcStatus.update_pending;
        
        res.json({
            current_version: currentVersion,
            latest_version: latestVersion,
            update_available: updateAvailable,
            update_in_progress: updateInProgress,
            update_completed: false, // This would be set by a webhook or polling mechanism
            bootc_status: bootcStatus,
            github_release: updateCache
        });
        
    } catch (error) {
        console.error('Error checking update status:', error);
        res.status(500).json({
            error: error.message,
            current_version: currentVersion,
            latest_version: currentVersion,
            update_available: false,
            update_in_progress: false
        });
    }
});

// Bootc status endpoint
app.get('/api/bootc-status', async (req, res) => {
    try {
        const status = await getBootcStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting bootc status:', error);
        res.status(500).json({ error: error.message });
    }
});

// Configuration endpoint for demo states
app.get('/api/demo-config', (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'demo-config.json'), 'utf8'));
        res.json(config);
    } catch (error) {
        res.json({
            show_metrics: false,
            banner: { show: false },
            theme: "minimal",
            panels: []
        });
    }
});

app.post('/api/demo-config', (req, res) => {
    try {
        fs.writeFileSync(path.join(__dirname, 'demo-config.json'), JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        version: currentVersion,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Initialize version on startup
currentVersion = getCurrentVersion();

app.listen(port, () => {
    console.log(`🚀 Metrics server running at http://localhost:${port}`);
    console.log(`📊 Metrics endpoint: http://localhost:${port}/api/metrics`);
});