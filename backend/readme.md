sudo apt update
sudo apt install sshpass
sudo apt install -y mongodb-org-tools


#!/bin/bash

# --- Configuration ---
MONGO_URI="mongodb://your_username:your_password@your_host:27017/your_db"
SB_USER="uXXXXXX"  # Your Storage Box username
SB_HOST="uXXXXXX.your-storagebox.de"
SB_PASS="passsss"

# Local temporary path
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
LOCAL_BACKUP_DIR="/tmp/mongodb_backup_$TIMESTAMP"
ARCHIVE_FILE="/tmp/mongo_backup_$TIMESTAMP.tar.gz"

# 1. Create local dump
echo "Dumping MongoDB data..."
mongodump --uri="$MONGO_URI" --out="$LOCAL_BACKUP_DIR" --gzip

# 2. Compress into a single archive
tar -czf "$ARCHIVE_FILE" -C "$LOCAL_BACKUP_DIR" .

# 3. Upload to Storage Box via SCP
# Use port 23 for better performance on Hetzner Storage Boxes
echo "Uploading to Storage Box..."
if sshpass -p "$SB_PASS" scp -P 23 "$ARCHIVE_FILE" "$SB_USER@$SB_HOST:rehan/"; then
    echo "Upload Successful!"
else
    echo "Upload FAILED!" >&2
    exit 1
fi

# 4. Cleanup local temporary files
rm -rf "$LOCAL_BACKUP_DIR" "$ARCHIVE_FILE"
