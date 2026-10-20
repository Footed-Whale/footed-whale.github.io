#!/usr/bin/env bash
# Uploads the site to the cPanel host's public_html over FTPS (explicit TLS) with rclone.
# usage: tools/deploy.sh [--dry-run] [any other rclone flags]
# Credentials come from .env.local (FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR).
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f .env.local ] || { echo "missing .env.local" >&2; exit 1; }
set -a; . ./.env.local; set +a

remote=":ftp,host=$FTP_HOST,user=$FTP_USER,pass=$(rclone obscure "$FTP_PASS"),explicit_tls=true:${FTP_REMOTE_DIR:-/}"

# copy (not sync) so server-managed files like cgi-bin/ and .well-known/ are left alone
rclone copy . "$remote" \
  --include '/index.html' \
  --include '/llms.txt' \
  --include '/assets/**' \
  --progress "$@"
