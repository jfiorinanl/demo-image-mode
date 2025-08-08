/**
 * Demo Platform Status Display System
 * Handles dynamic platform information loading and display
 */

class VersionManager {
    constructor() {
        this.versionData = null;
        this.displayElement = document.getElementById('version-display');
        this.headerVersionElement = document.getElementById('header-version');
        this.init();
    }

    async init() {
        await this.loadVersionInfo();
        this.displayVersionInfo();
        this.updateHeaderVersion();
        this.setupAutoRefresh();
    }

    async loadVersionInfo() {
        try {
            // Try to load version.json first (build-time generated) - add cache busting
            const cacheBuster = Date.now();
            const response = await fetch(`/version.json?_cb=${cacheBuster}`);
            if (response.ok) {
                this.versionData = await response.json();
                return;
            }
        } catch (error) {
            console.warn('Could not load version.json:', error);
        }

        // Fallback to generating version info from available data
        this.generateFallbackVersionInfo();
    }

    generateFallbackVersionInfo() {
        // Generate fallback version info when version.json is not available
        const currentTime = new Date();
        const buildDate = currentTime.toISOString().split('T')[0];
        const buildTime = currentTime.toLocaleTimeString('es-ES');
        
        this.versionData = {
            version: "v2.1.0",
            build_sha: this.generateMockSHA(),
            build_date: buildDate,
            build_time: buildTime,
            branch: "production",
            status: "online",
            environment: "production",
            platform_info: {
                service: "Web Application",
                security: "SSL Enabled",
                monitoring: "Active",
                load_balancer: "Optimized"
            }
        };
    }

    generateMockSHA() {
        // Generate a mock git SHA for demo purposes
        const chars = '0123456789abcdef';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    displayVersionInfo() {
        if (!this.versionData || !this.displayElement) {
            console.error('Version data or display element not available');
            return;
        }

        const versionHTML = this.buildVersionHTML();
        this.displayElement.innerHTML = versionHTML;
        
        // Add fade-in animation
        this.displayElement.style.opacity = '0';
        setTimeout(() => {
            this.displayElement.style.transition = 'opacity 0.5s ease';
            this.displayElement.style.opacity = '1';
        }, 100);
    }

    buildVersionHTML() {
        const { version, build_sha, build_date, build_time, branch, status, environment, platform_info } = this.versionData;
        
        return `
            <div class="version-details">
                <div class="row g-2">
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Version:</strong> 
                            <span class="badge bg-primary ms-1">${version}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Status:</strong> 
                            <span class="badge bg-success ms-1">Online</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Environment:</strong> 
                            <span class="badge bg-info ms-1">${environment}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Build:</strong> 
                            <code class="text-muted">${build_sha}</code>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="version-item">
                            <strong>Last Updated:</strong> 
                            <small class="text-muted">${build_date} ${build_time}</small>
                        </div>
                    </div>
                </div>
                
                <hr class="my-3">
                
                <div class="platform-info">
                    <h6 class="mb-2"><i class="bi bi-server me-1"></i>Platform Status</h6>
                    <div class="row g-2">
                        <div class="col-md-6">
                            <small><strong>Service:</strong> <code>${platform_info.service}</code></small>
                        </div>
                        <div class="col-md-6">
                            <small><strong>Security:</strong> <code>${platform_info.security}</code></small>
                        </div>
                        <div class="col-md-6">
                            <small><strong>Monitoring:</strong> <code>${platform_info.monitoring}</code></small>
                        </div>
                        <div class="col-md-6">
                            <small><strong>Load Balancer:</strong> <code>${platform_info.load_balancer}</code></small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateHeaderVersion() {
        if (!this.versionData || !this.headerVersionElement) {
            return;
        }

        const versionBadge = this.headerVersionElement.querySelector('.badge');
        if (versionBadge) {
            versionBadge.textContent = this.versionData.version;
            versionBadge.title = `Environment: ${this.versionData.environment} | Build: ${this.versionData.build_sha}`;
        }
    }

    setupAutoRefresh() {
        // Refresh version info every 5 minutes to catch updates
        setInterval(() => {
            this.loadVersionInfo().then(() => {
                this.displayVersionInfo();
                this.updateHeaderVersion();
            });
        }, 5 * 60 * 1000);
    }

    // Public method to manually refresh version info
    async refresh() {
        await this.loadVersionInfo();
        this.displayVersionInfo();
        this.updateHeaderVersion();
    }
}

/**
 * Dynamic Announcement Banner Manager
 * Handles loading and displaying announcement banners from announcement.json
 */
class AnnouncementManager {
    constructor() {
        this.bannerElement = document.getElementById('announcement-banner');
        this.announcementData = null;
        this.init();
    }

    async init() {
        await this.loadAnnouncementConfig();
        this.displayAnnouncement();
    }

    async loadAnnouncementConfig() {
        console.log('Loading announcement config...');
        try {
            // Try to load announcement.json (pipeline generated)
            const response = await fetch('/announcement.json');
            console.log('Fetch response status:', response.status);
            if (response.ok) {
                this.announcementData = await response.json();
                console.log('Loaded announcement data:', this.announcementData);
                return;
            }
        } catch (error) {
            console.warn('Could not load announcement.json:', error);
        }

        // Fallback: no announcement to show
        console.log('Using fallback (no announcement)');
        this.announcementData = { show: false };
    }

    displayAnnouncement() {
        console.log('displayAnnouncement called with data:', this.announcementData);
        console.log('bannerElement found:', !!this.bannerElement);
        
        if (!this.announcementData || !this.bannerElement) {
            console.log('Banner not displayed - missing data or element');
            return;
        }
        
        if (!this.announcementData.show) {
            console.log('Banner not displayed - show is false');
            return;
        }

        const { type = 'info', icon = '📢', message, link, link_text = 'Learn More' } = this.announcementData;
        
        // Set banner type class
        this.bannerElement.className = `announcement-banner type-${type}`;
        
        // Set content
        const iconElement = this.bannerElement.querySelector('.announcement-icon');
        const textElement = this.bannerElement.querySelector('.announcement-text');
        const linkElement = this.bannerElement.querySelector('.announcement-link');
        
        if (iconElement) iconElement.textContent = icon;
        if (textElement) textElement.textContent = message;
        
        // Handle optional link
        if (link && linkElement) {
            linkElement.href = link;
            linkElement.textContent = link_text;
            linkElement.classList.remove('d-none');
        } else if (linkElement) {
            linkElement.classList.add('d-none');
        }
        
        // Show banner with animation
        console.log('Showing banner with class:', this.bannerElement.className);
        this.bannerElement.classList.remove('d-none');
        
        // Setup close functionality
        this.setupCloseHandler();
    }

    setupCloseHandler() {
        const closeButton = this.bannerElement.querySelector('.announcement-close');
        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideBanner();
            });
        }
    }

    hideBanner() {
        if (this.bannerElement) {
            this.bannerElement.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => {
                this.bannerElement.classList.add('d-none');
            }, 300);
        }
    }

    // Public method to manually refresh announcement
    async refresh() {
        await this.loadAnnouncementConfig();
        this.displayAnnouncement();
    }
}

// Additional utility functions
class DemoUtils {
    static formatUptime() {
        const startTime = performance.timing.navigationStart;
        const currentTime = Date.now();
        const uptimeMs = currentTime - startTime;
        
        const seconds = Math.floor(uptimeMs / 1000) % 60;
        const minutes = Math.floor(uptimeMs / (1000 * 60)) % 60;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    static addContainerStats() {
        // Add container stats to the hero visual if needed
        const containerBody = document.querySelector('.container-body');
        if (containerBody) {
            const uptimeDiv = document.createElement('div');
            uptimeDiv.className = 'code-line';
            uptimeDiv.innerHTML = `<span class="text-info">⏱</span> Uptime: ${this.formatUptime()}`;
            containerBody.appendChild(uptimeDiv);
        }
    }

    static setupSmoothScrolling() {
        // Enhanced smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    static setupAnimations() {
        // Setup intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        // Observe feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });

        // Observe pipeline stages
        document.querySelectorAll('.pipeline-stage').forEach(stage => {
            stage.style.opacity = '0';
            stage.style.transform = 'translateY(30px)';
            stage.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(stage);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize version manager
    window.versionManager = new VersionManager();
    
    // Initialize announcement manager with delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Initializing announcement manager...');
        try {
            window.announcementManager = new AnnouncementManager();
        } catch (error) {
            console.error('Error initializing announcement manager:', error);
            // Fallback: try to show banner anyway
            setTimeout(() => {
                window.testBanner();
            }, 1000);
        }
    }, 1000);
    
    // Setup utilities
    DemoUtils.setupSmoothScrolling();
    DemoUtils.setupAnimations();
    
    // Update container stats periodically
    setInterval(() => {
        DemoUtils.addContainerStats();
    }, 10000);
    
    console.log('Demo Platform initialized');
});

// Export for potential external use
window.DemoApp = {
    VersionManager,
    AnnouncementManager,
    DemoUtils
};

// DEBUG: Test banner function
window.testBanner = function() {
    console.log('Testing banner manually...');
    const banner = document.getElementById('announcement-banner');
    if (!banner) {
        console.error('Banner element not found!');
        return;
    }
    
    banner.className = 'announcement-banner type-success';
    banner.querySelector('.announcement-icon').textContent = '🎉';
    banner.querySelector('.announcement-text').textContent = 'Manual test banner working!';
    banner.classList.remove('d-none');
    console.log('Banner should be visible now');
};