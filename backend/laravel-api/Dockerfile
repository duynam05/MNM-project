FROM php:8.2-cli AS build

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction --no-scripts

FROM php:8.2-cli AS runtime

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libzip-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app /app

RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chmod +x docker/start.sh

CMD ["./docker/start.sh"]
