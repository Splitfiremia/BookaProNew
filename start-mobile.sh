#!/bin/bash

echo "🚀 Starting BookerPro for Mobile Development"
echo "============================================"
echo ""
echo "📱 To access on your mobile device:"
echo "1. Install 'Expo Go' app from App Store or Google Play"
echo "2. Make sure your phone and computer are on the same network"
echo "3. Run this command and scan the QR code that appears"
echo ""
echo "Starting server with tunnel..."
echo ""

# Start the server with tunnel for mobile access
bunx rork start -p bnzosb5k9h7o8z8m16cxk --tunnel

# Alternative command if the above doesn't work:
# npx expo start --tunnel