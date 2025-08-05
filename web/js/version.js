/**
 * NetLabs Version Display System
 * Handles dynamic version information loading and display
 */

class VersionManager {
    constructor() {
        this.versionData = null;
        this.displayElement = document.getElementById('version-display');
        this.init();
    }

    async init() {
        await this.loadVersionInfo();
        this.displayVersionInfo();
        this.setupAutoRefresh();
    }

    async loadVersionInfo() {
        try {
            // Try to load version.json first (build-time generated)
            const response = await fetch('/version.json');
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
            version: "demo-1.0.0",
            build_sha: this.generateMockSHA(),
            build_date: buildDate,
            build_time: buildTime,
            branch: "main",
            image_tag: "latest",
            registry: "ghcr.io/netlabs/demo-rhel10-image-mode",
            environment: "demo",
            container_info: {
                base_image: "registry.redhat.io/rhel9/rhel-bootc:9.6",
                user: "bootc-user",
                service: "httpd",
                port: "80"
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
        const { version, build_sha, build_date, build_time, branch, image_tag, registry, environment, container_info } = this.versionData;
        
        return `
            <div class="version-details">
                <div class="row g-2">
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Versión:</strong> 
                            <span class="badge bg-primary ms-1">${version}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Build:</strong> 
                            <code class="text-muted">${build_sha}</code>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Branch:</strong> 
                            <span class="badge bg-success ms-1">${branch}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Tag:</strong> 
                            <code class="text-info">${image_tag}</code>
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="version-item">
                            <strong>Imagen:</strong> 
                            <small class="text-muted d-block">${registry}</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Compilado:</strong> 
                            <small class="text-muted">${build_date} ${build_time}</small>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="version-item">
                            <strong>Entorno:</strong> 
                            <span class="badge bg-info ms-1">${environment}</span>
                        </div>
                    </div>
                </div>
                
                <hr class="my-3">
                
                <div class="container-info">
                    <h6 class="mb-2"><i class="bi bi-box me-1"></i>Información del Contenedor</h6>
                    <div class="row g-2">
                        <div class="col-12">
                            <small><strong>Base:</strong> <code>${container_info.base_image}</code></small>
                        </div>
                        <div class="col-md-4">
                            <small><strong>Usuario:</strong> <code>${container_info.user}</code></small>
                        </div>
                        <div class="col-md-4">
                            <small><strong>Servicio:</strong> <code>${container_info.service}</code></small>
                        </div>
                        <div class="col-md-4">
                            <small><strong>Puerto:</strong> <code>${container_info.port}</code></small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupAutoRefresh() {
        // Refresh version info every 5 minutes to catch updates
        setInterval(() => {
            this.loadVersionInfo().then(() => {
                this.displayVersionInfo();
            });
        }, 5 * 60 * 1000);
    }

    // Public method to manually refresh version info
    async refresh() {
        await this.loadVersionInfo();
        this.displayVersionInfo();
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
    
    // Setup utilities
    DemoUtils.setupSmoothScrolling();
    DemoUtils.setupAnimations();
    
    // Update container stats periodically
    setInterval(() => {
        DemoUtils.addContainerStats();
    }, 10000);
    
    console.log('NetLabs RHEL 10 Image Mode Demo initialized');
});

// Export for potential external use
window.NetLabsDemo = {
    VersionManager,
    DemoUtils
};