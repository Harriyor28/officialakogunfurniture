#!/bin/sh
# Container entrypoint: keep state on the persistent volume, apply migrations,
# then start the server. See Dockerfile / README for the deployment model.
set -eu

DATA_DIR="${DATA_DIR:-/data}"
PUBLIC_UPLOADS="${DATA_DIR}/public-uploads"
PRIVATE_UPLOADS="${DATA_DIR}/data-uploads"

# 1. Runtime-uploaded media lives on the persistent volume.
mkdir -p "$PUBLIC_UPLOADS" "$PRIVATE_UPLOADS" /app/data

# 2. On first boot, copy the media shipped inside the image into the volume.
if [ ! -f "${DATA_DIR}/.uploads-seeded" ]; then
  if [ -d /app/public/uploads ]; then
    cp -a /app/public/uploads/. "$PUBLIC_UPLOADS/" 2>/dev/null || true
  fi
  if [ -d /app/data/uploads ]; then
    cp -a /app/data/uploads/. "$PRIVATE_UPLOADS/" 2>/dev/null || true
  fi
  touch "${DATA_DIR}/.uploads-seeded"
fi

# 3. Point the app's upload directories at the volume. The app writes to and
#    serves these paths relative to the working directory.
rm -rf /app/public/uploads /app/data/uploads
ln -s "$PUBLIC_UPLOADS" /app/public/uploads
ln -s "$PRIVATE_UPLOADS" /app/data/uploads

# 4. Apply pending database migrations before serving traffic.
if [ -n "${DATABASE_URL:-}" ]; then
  echo "Applying database migrations (${DATABASE_URL})..."
  npx prisma migrate deploy
else
  echo "WARNING: DATABASE_URL is not set — skipping migrations."
fi

exec "$@"
