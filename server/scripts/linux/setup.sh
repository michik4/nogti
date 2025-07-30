#!/bin/bash

# Скрипт для развертывания сервера с помощью PM2
# Автор: Nogotochki Team
# Версия: 1.0.0

set -e  # Остановка при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка наличия Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        log_error "Node.js не установлен. Установите Node.js версии 18 или выше."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Требуется Node.js версии 18 или выше. Текущая версия: $(node --version)"
        exit 1
    fi
    
    log_success "Node.js версии $(node --version) найден"
}

# Проверка наличия npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        log_error "npm не установлен"
        exit 1
    fi
    
    log_success "npm версии $(npm --version) найден"
}

# Установка PM2 глобально
install_pm2() {
    log_info "Проверка установки PM2..."
    
    if ! command -v pm2 &> /dev/null; then
        log_info "Установка PM2..."
        npm install -g pm2
        log_success "PM2 установлен"
    else
        log_success "PM2 уже установлен"
    fi
}

# Установка зависимостей
install_dependencies() {
    log_info "Установка зависимостей..."
    
    if [ ! -f "package.json" ]; then
        log_error "package.json не найден. Убедитесь, что вы находитесь в корневой папке сервера."
        exit 1
    fi
    
    npm install
    log_success "Зависимости установлены"
}

# Сборка проекта
build_project() {
    log_info "Сборка проекта..."
    
    # Очистка предыдущей сборки
    if [ -d "dist" ]; then
        rm -rf dist
        log_info "Предыдущая сборка удалена"
    fi
    
    # Сборка TypeScript
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Ошибка сборки проекта. Папка dist не создана."
        exit 1
    fi
    
    log_success "Проект собран успешно"
}

# Создание конфигурации PM2
create_pm2_config() {
    log_info "Создание конфигурации PM2..."
    
    cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'nogotochki-server',
    script: 'dist/index.js',
    cwd: __dirname,
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    // Логирование
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Автоперезапуск
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Graceful shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    
    // Мониторинг
    min_uptime: '10s',
    max_restarts: 10,
    
    // Переменные окружения
    env_file: '.env'
  }]
};
EOF

    log_success "Конфигурация PM2 создана"
}

# Создание папки для логов
create_logs_directory() {
    log_info "Создание папки для логов..."
    
    mkdir -p logs
    log_success "Папка logs создана"
}

# Проверка файла .env
check_env_file() {
    log_info "Проверка файла .env..."
    
    if [ ! -f ".env" ]; then
        log_warning "Файл .env не найден. Создайте файл .env с необходимыми переменными окружения."
        log_info "Пример содержимого .env файла:"
        echo "NODE_ENV=production"
        echo "PORT=3000"
        echo "DB_HOST=localhost"
        echo "DB_PORT=5432"
        echo "DB_NAME=your_database"
        echo "DB_USER=your_user"
        echo "DB_PASSWORD=your_password"
        echo "JWT_SECRET=your_jwt_secret"
    else
        log_success "Файл .env найден"
    fi
}

# Запуск приложения через PM2
start_application() {
    log_info "Запуск приложения через PM2..."
    
    # Остановка существующих процессов
    pm2 delete nogotochki-server 2>/dev/null || true
    
    # Запуск приложения
    pm2 start ecosystem.config.js --env production
    
    # Сохранение конфигурации PM2
    pm2 save
    
    # Настройка автозапуска
    pm2 startup
    
    log_success "Приложение запущено через PM2"
}

# Показ статуса
show_status() {
    log_info "Статус приложения:"
    pm2 status
    
    log_info "Логи приложения:"
    pm2 logs nogotochki-server --lines 10
}

# Основная функция
main() {
    log_info "Начало развертывания сервера Nogotochki..."
    
    # Проверки
    check_node
    check_npm
    install_pm2
    
    # Установка и сборка
    install_dependencies
    build_project
    
    # Настройка
    create_pm2_config
    create_logs_directory
    check_env_file
    
    # Запуск
    start_application
    
    # Статус
    show_status
    
    log_success "Развертывание завершено успешно!"
    log_info "Полезные команды PM2:"
    echo "  pm2 status                    - показать статус приложений"
    echo "  pm2 logs nogotochki-server    - показать логи"
    echo "  pm2 restart nogotochki-server - перезапустить приложение"
    echo "  pm2 stop nogotochki-server    - остановить приложение"
    echo "  pm2 delete nogotochki-server  - удалить приложение из PM2"
    echo "  pm2 monit                     - мониторинг в реальном времени"
}

# Обработка аргументов командной строки
case "${1:-}" in
    "status")
        show_status
        ;;
    "restart")
        log_info "Перезапуск приложения..."
        pm2 restart nogotochki-server
        show_status
        ;;
    "stop")
        log_info "Остановка приложения..."
        pm2 stop nogotochki-server
        ;;
    "logs")
        pm2 logs nogotochki-server
        ;;
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  (без аргументов) - полное развертывание"
        echo "  status           - показать статус"
        echo "  restart          - перезапустить приложение"
        echo "  stop             - остановить приложение"
        echo "  logs             - показать логи"
        echo "  help             - показать эту справку"
        ;;
    *)
        main
        ;;
esac
