/**
 * System Status Manager for RHEL 10 Image Mode Demo
 * Updates version and update status in real-time
 */

class SystemStatusManager {
    constructor() {
        this.updateInterval = null;
        this.init();
    }
    
    init() {
        this.startStatusUpdates();
    }
    
    startStatusUpdates() {
        // Update immediately
        this.updateSystemStatus();
        
        // Then update every 10 seconds
        this.updateInterval = setInterval(() => {
            this.updateSystemStatus();
        }, 10000);
    }
    
    async updateSystemStatus() {
        try {
            const cacheBuster = Date.now();
            const response = await fetch(`/api/update-status?_cb=${cacheBuster}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.warn('System status API not available - using fallback');
                this.showOfflineStatus();
                return;
            }
            
            const status = await response.json();
            this.updateVersionDisplay(status);
            this.updateStatusBadge(status);
            
        } catch (error) {
            console.warn('System status API unavailable:', error.message);
            this.showOfflineStatus();
        }
    }
    
    updateVersionDisplay(status) {
        const versionElement = document.getElementById('current-version');
        if (versionElement && status.current_version) {
            versionElement.textContent = status.current_version;
            
            // Add visual indicator if version changed
            if (versionElement.dataset.lastVersion && 
                versionElement.dataset.lastVersion !== status.current_version) {
                this.animateVersionChange(versionElement);
            }
            
            versionElement.dataset.lastVersion = status.current_version;
        }
    }
    
    updateStatusBadge(status) {
        const statusBadge = document.getElementById('update-status-badge');
        if (!statusBadge) return;
        
        if (status.update_in_progress) {
            statusBadge.textContent = `Updating to ${status.latest_version}`;
            statusBadge.className = 'badge bg-warning text-dark';
            statusBadge.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span>Updating...`;
        } else if (status.update_available) {
            statusBadge.textContent = `${status.latest_version} available`;
            statusBadge.className = 'badge bg-info';
        } else {
            statusBadge.textContent = 'Up to date';
            statusBadge.className = 'badge bg-success';
        }
    }
    
    animateVersionChange(element) {
        element.style.transition = 'all 0.3s ease';
        element.style.background = '#28a745';
        element.style.color = 'white';
        element.style.padding = '2px 6px';
        element.style.borderRadius = '3px';
        
        setTimeout(() => {
            element.style.background = 'transparent';
            element.style.color = 'inherit';
            element.style.padding = '0';
        }, 2000);
    }
    
    showOfflineStatus() {
        const statusBadge = document.getElementById('system-status-badge');
        const updateBadge = document.getElementById('update-status-badge');
        
        if (statusBadge) {
            statusBadge.textContent = 'Offline';
            statusBadge.className = 'badge bg-danger';
        }
        
        if (updateBadge) {
            updateBadge.textContent = 'Unable to check';
            updateBadge.className = 'badge bg-secondary';
        }
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialize when DOM is loaded
let systemStatusManager;
document.addEventListener('DOMContentLoaded', () => {
    systemStatusManager = new SystemStatusManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (systemStatusManager) {
        systemStatusManager.destroy();
    }
});