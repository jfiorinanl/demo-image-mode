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

#configure Apache proxy for API routes
cat >> /etc/httpd/conf/httpd.conf << 'EOF'

# Enable mod_proxy and mod_proxy_http
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so

# Proxy API routes to Node.js server
ProxyPreserveHost On
ProxyPass /api/ http://localhost:3001/api/
ProxyPassReverse /api/ http://localhost:3001/api/

EOF

EORUN

#copy NetLabs demo web assets
COPY web/ /usr/share/www/html/

#install npm dependencies and setup metrics server
RUN cd /usr/share/www/html && \
    mkdir -p /tmp/npm-cache && \
    npm config set cache /tmp/npm-cache && \
    npm install express --no-fund --no-audit --unsafe-perm=true

#create systemd service for metrics server
RUN <<EOSERVICE
cat > /etc/systemd/system/metrics-server.service << 'EOF'
[Unit]
Description=NetLabs Demo Metrics Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/usr/share/www/html
ExecStart=/usr/bin/node metrics-server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

systemctl enable metrics-server
EOSERVICE

#clean up caches in the image and lint the container
RUN rm /var/{cache,lib}/dnf /var/lib/rhsm /var/cache/ldconfig /tmp/npm-cache -rf
RUN bootc container lint

EXPOSE 80
