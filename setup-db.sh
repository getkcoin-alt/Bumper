#!/bin/bash

echo "🚀 DumperTrack Database Setup Helper"
echo "===================================="
echo ""
echo "📋 The SQL schema has been copied to your clipboard!"
echo ""
echo "Next steps:"
echo "1. Open Supabase Dashboard: https://supabase.com/dashboard/project/afedbnmsltwifwrcvnrn/editor"
echo "2. Click 'SQL Editor' in the left sidebar"
echo "3. Click 'New Query'"
echo "4. Press Cmd+V to paste the SQL"
echo "5. Click 'Run' (or press Cmd+Enter)"
echo ""
echo "✅ Your database will be ready in seconds!"
echo ""

# Copy SQL to clipboard
cat supabase-schema.sql | pbcopy

echo "Press any key to open Supabase Dashboard in your browser..."
read -n 1 -s

open "https://supabase.com/dashboard/project/afedbnmsltwifwrcvnrn/editor"
