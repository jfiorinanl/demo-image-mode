FROM registry.redhat.io/rhel9/rhel-bootc:9.6

#install software
RUN dnf -y install tmux mkpasswd podman buildah skopeo curl jq nodejs npm --allowerasing

#configure bootc-user
RUN pass=$(mkpasswd --method=SHA-512 --rounds=4096 netlabs) && useradd -m -G wheel bootc-user -p $pass

#setup sudo to not require password
RUN echo "%wheel        ALL=(ALL)       NOPASSWD: ALL" > /etc/sudoers.d/wheel-sudo

#Using the optional heredoc format to help simplify the number of times we call RUN
RUN <<EORUN
set -xeuo pipefail

#configure web server and relocate the webroot to be read-only and managed by this container image
dnf -y install httpd && dnf clean all
systemctl enable httpd
mv /var/www /usr/share/www
sed -ie 's,/var/www,/usr/share/www,' /etc/httpd/conf/httpd.conf

#configure Apache proxy for API routes and disable caching
cat >> /etc/httpd/conf/httpd.conf << 'EOF'

# Enable required modules
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
LoadModule expires_module modules/mod_expires.so

# Proxy API routes to Node.js server
ProxyPreserveHost On
ProxyPass /api/ http://localhost:3001/api/
ProxyPassReverse /api/ http://localhost:3001/api/

# Disable caching for demo updates - important for bootc image mode updates
<Directory "/usr/share/www/html">
    # Disable browser caching
    ExpiresActive On
    ExpiresDefault "access plus 0 seconds"
    
    # Set cache-control headers to prevent caching
    Header always set Cache-Control "no-cache, no-store, must-revalidate, max-age=0"
    Header always set Pragma "no-cache"
    Header always set Expires "Thu, 01 Jan 1970 00:00:00 GMT"
    
    # Add ETag based on file modification time for proper cache busting
    FileETag MTime Size
</Directory>

# Special handling for CSS, JS, and other static assets
<FilesMatch "\.(css|js|html|json|svg|png|jpg|jpeg|gif|ico)$">
    # Force revalidation
    Header always set Cache-Control "no-cache, must-revalidate, max-age=0"
    Header always set Pragma "no-cache"
    
    # Add version headers for debugging
    Header always set X-Bootc-Demo "image-mode-v2"
</FilesMatch>

EOF

EORUN

#copy NetLabs demo web assets
COPY web/ /usr/share/www/html/

#install npm dependencies and setup metrics server
RUN cd /usr/share/www/html && \
    echo '{"name":"netlabs-demo","version":"1.0.0","dependencies":{"express":"^4.18.0"}}' > package.json && \
    HOME=/tmp npm_config_cache=/tmp/npm-cache npm_config_prefix=/tmp/npm-prefix \
    npm install --no-fund --no-audit --unsafe-perm=true

#create systemd service for metrics server
RUN <<EOSERVICE
cat > /etc/systemd/system/metrics-server.service << 'EOF'
[Unit]
Description=NetLabs Demo Metrics Server
After=network.target httpd.service
Wants=httpd.service

[Service]
Type=simple
User=root
WorkingDirectory=/usr/share/www/html
Environment=NODE_ENV=production
Environment=PORT=3001
ExecStart=/usr/bin/node metrics-server.js
ExecStartPre=/bin/sleep 5
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
KillMode=mixed
TimeoutStopSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl enable metrics-server
EOSERVICE

#clean up caches in the image and lint the container
RUN rm /var/{cache,lib}/dnf /var/lib/rhsm /var/cache/ldconfig /tmp/npm-cache /tmp/npm-prefix -rf
RUN bootc container lint

EXPOSE 80
