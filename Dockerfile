FROM php:8.2-apache

# Fix Apache MPM conflict — this is the key fix for Railway
RUN apt-get update && apt-get install -y apt-utils \
    && a2dismod mpm_event mpm_worker mpm_prefork 2>/dev/null || true \
    && a2enmod mpm_prefork \
    && a2enmod rewrite

# Install system dependencies
RUN apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Configure Apache DocumentRoot to Laravel public directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Explicitly set mpm_prefork in apache2.conf
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Create a clean mpm config
RUN echo '<IfModule mpm_prefork_module>\n\
    StartServers 5\n\
    MinSpareServers 5\n\
    MaxSpareServers 10\n\
    MaxRequestWorkers 150\n\
    MaxConnectionsPerChild 0\n\
</IfModule>' > /etc/apache2/mods-available/mpm_prefork.conf

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy Laravel backend code
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

# Move React build to Laravel public directory
WORKDIR /var/www/html
RUN cp -r client/dist/* public/ && rm -rf client

EXPOSE 80

CMD ["apache2-foreground"]
