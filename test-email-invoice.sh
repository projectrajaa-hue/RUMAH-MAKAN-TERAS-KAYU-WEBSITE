#!/bin/bash

# Email Invoice Test Script
# Usage: ./test-email-invoice.sh

set -e

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║       Email Invoice Feature - Integration Test             ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:5000}"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="admin123"

echo ""
echo -e "${BLUE}[1/5] Checking environment variables...${NC}"

if [ -z "$EMAIL_USER" ] || [ -z "$EMAIL_PASSWORD" ]; then
  echo -e "${RED}❌ Email credentials not found in .env${NC}"
  echo "Please set EMAIL_USER and EMAIL_PASSWORD in .env"
  exit 1
fi

echo -e "${GREEN}✅ Email credentials found${NC}"
echo "   From: $EMAIL_USER"

echo ""
echo -e "${BLUE}[2/5] Testing database connection...${NC}"

# Check if DB has orders
DB_CHECK=$(mysql -h localhost -u root -p"" warung_makan -e "SELECT COUNT(*) as count FROM Orders;" 2>/dev/null | tail -1)

if [ -z "$DB_CHECK" ]; then
  echo -e "${YELLOW}⚠️  Could not verify database${NC}"
else
  echo -e "${GREEN}✅ Database connected${NC}"
  echo "   Total orders: $DB_CHECK"
fi

echo ""
echo -e "${BLUE}[3/5] Testing API server...${NC}"

HEALTH_CHECK=$(curl -s -w "%{http_code}" -o /dev/null "$API_URL/api/settings")

if [ "$HEALTH_CHECK" != "200" ]; then
  echo -e "${RED}❌ API server not responding (HTTP $HEALTH_CHECK)${NC}"
  echo "Make sure server is running: npm start"
  exit 1
fi

echo -e "${GREEN}✅ API server is running${NC}"

echo ""
echo -e "${BLUE}[4/5] Attempting login...${NC}"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed${NC}"
  echo "Response: $LOGIN_RESPONSE"
  echo ""
  echo "Try with actual credentials:"
  echo "  EMAIL='your-email@example.com' PASSWORD='your-password' ./test-email-invoice.sh"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "   Token: ${TOKEN:0:20}..."

echo ""
echo -e "${BLUE}[5/5] Testing order status update with email...${NC}"

# Get first order
ORDERS=$(curl -s -X GET "$API_URL/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

ORDER_ID=$(echo $ORDERS | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')

if [ -z "$ORDER_ID" ]; then
  echo -e "${YELLOW}⚠️  No orders found in database${NC}"
  echo ""
  echo "To test the email feature:"
  echo "1. Create an order via the web app or API"
  echo "2. Make sure the order has a valid customerEmail"
  echo "3. Then run: ORDER_ID=1 ./test-email-invoice.sh"
  exit 0
fi

echo "Testing with Order ID: $ORDER_ID"

# Update order status to confirmed
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/orders/$ORDER_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}')

UPDATED_STATUS=$(echo $UPDATE_RESPONSE | grep -o '"status":"[^"]*' | grep -o '[^"]*$')

if [ "$UPDATED_STATUS" = "confirmed" ]; then
  echo -e "${GREEN}✅ Order status updated to: $UPDATED_STATUS${NC}"
  echo ""
  echo -e "${GREEN}✨ Email invoice should be sent!${NC}"
  echo ""
  echo "Check server logs for:"
  echo "  [EMAIL] ✅ Invoice email sent successfully for order #$ORDER_ID"
else
  echo -e "${RED}❌ Failed to update order status${NC}"
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Email Invoice Feature Test Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo "1. Check your email inbox for the invoice"
echo "2. Check server logs: tail -f server.log | grep EMAIL"
echo "3. Review EMAIL_INVOICE_FEATURE.md for more details"
echo ""
