FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    nginx \
    supervisor \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy Laravel code
COPY server/ /var/www/html/
COPY client/ /var/www/html/client/

# Install Laravel dependencies
RUN composer install --no-interaction --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Build React client
ARG VITE_BACKEND_ENDPOINT
ENV VITE_BACKEND_ENDPOINT=${VITE_BACKEND_ENDPOINT}

WORKDIR /var/www/html/client
RUN npm install && npm run build

# Move React build to Laravel public
WORKDIR /var/www/html
RUN cp -r client/dist/* public/ && rm -rf client

# Copy Nginx config
COPY docker/nginx.conf /etc/nginx/sites-available/default

# Copy Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Disable default nginx site and re-enable ours
RUN rm -f /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Final permissions
RUN chown -R www-data:www-data /var/www/html

# Verify nginx config is valid during build
RUN nginx -t

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
