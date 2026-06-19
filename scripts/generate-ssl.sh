#!/bin/bash
# ============================================
# MoneyShop — SSL Certificate Generator (Dev/Test)
# ============================================
# Production'da Let's Encrypt veya kurumsal SSL kullanın
# ============================================

set -e

SSL_DIR="./nginx/ssl"
DOMAIN="${1:-moneyshop.iq}"

echo "[ssl] Generating SSL certificates for: $DOMAIN"

mkdir -p "$SSL_DIR"

# Self-signed certificate (development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$SSL_DIR/privkey.pem" \
  -out "$SSL_DIR/fullchain.pem" \
  -subj "/C=IQ/ST=Erbil/L=Erbil/O=MoneyShop/CN=$DOMAIN" \
  2>/dev/null

echo "[ssl] Certificates generated:"
echo "  - $SSL_DIR/fullchain.pem"
echo "  - $SSL_DIR/privkey.pem"
echo ""
echo "Production'da Let's Encrypt kullanın:"
echo "  certbot certonly --nginx -d $DOMAIN"
