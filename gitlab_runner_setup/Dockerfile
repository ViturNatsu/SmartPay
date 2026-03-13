FROM maven:3.9.9-eclipse-temurin-21

RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    libatomic1 \
    && rm -rf /var/lib/apt/lists/*

# install node
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs

# install playwright chromium system deps (fonts, graphics libs)
# so npx playwright install --with-deps in CI only downloads the browser binary
RUN npx playwright install-deps chromium

# install gitlab runner
RUN curl -L https://gitlab-runner-downloads.s3.amazonaws.com/latest/binaries/gitlab-runner-linux-amd64 \
 -o /usr/local/bin/gitlab-runner \
 && chmod +x /usr/local/bin/gitlab-runner

# install mailhog
RUN curl -L https://github.com/mailhog/MailHog/releases/latest/download/MailHog_linux_amd64 \
 -o /usr/local/bin/mailhog \
 && chmod +x /usr/local/bin/mailhog

COPY fdm-ca.crt /usr/local/share/ca-certificates/fdm-ca.crt

RUN update-ca-certificates

WORKDIR /runner

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]