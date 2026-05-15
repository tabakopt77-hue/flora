
#!/bin/bash

# Настройки целевой директории (с учетом пробелов и кириллицы)
TARGET_DIR="/var/www/Aura Flora (цветочный магазин)"

echo "🚀 Начинаем развертывание в: $TARGET_DIR"

# 1. Создаем директорию, если её нет
if [ ! -d "$TARGET_DIR" ]; then
    echo "📂 Создаем директорию..."
    sudo mkdir -p "$TARGET_DIR"
fi

# 2. Копируем файлы проекта (исключая тяжелые папки node_modules и target)
echo "📦 Копируем файлы..."
sudo rsync -av --progress . "$TARGET_DIR" \
    --exclude node_modules \
    --exclude dist \
    --exclude target \
    --exclude .git \
    --exclude backend/target

# 3. Настраиваем права доступа (чтобы Docker и вы могли читать файлы)
echo "🔒 Настраиваем права доступа..."
sudo chown -R $USER:$USER "$TARGET_DIR"
sudo chmod -R 755 "$TARGET_DIR"

# 4. Создаем .env файл, если его нет
if [ ! -f "$TARGET_DIR/.env" ]; then
    echo "📝 Создаем базовый .env файл..."
    cat <<EOT >> "$TARGET_DIR/.env"
# Секретные ключи (Замените на свои!)
JWT_SECRET=$(openssl rand -hex 32)
GEMINI_API_KEY=ваш_ключ_здесь
TELEGRAM_BOT_TOKEN=ваш_токен_здесь
DATABASE_URL=postgres://postgres:password@db:5432/bloom_db
REDIS_URL=redis://redis:6379
QDRANT_URL=http://qdrant:6334
EOT
fi

echo ""
echo "✅ Файлы успешно перенесены!"
echo ""
echo "👉 Следующие шаги:"
echo "1. Перейдите в папку: cd \"$TARGET_DIR\""
echo "2. Отредактируйте .env: nano .env"
echo "3. Запустите магазин: docker compose up -d --build"
