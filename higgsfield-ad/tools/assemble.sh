#!/usr/bin/env bash
# Frames + soundtrack -> TikTok master (1080x1920, H.264 High, AAC, -14 LUFS) + a <30 MB preview.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/Higgsfield_TikTok_55s.mp4}
ffmpeg -nostdin -loglevel error -y -framerate 30 -i out/frames/%05d.jpg -i out/soundtrack.wav \
  -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -level 4.2 -g 60 \
  -af "loudnorm=I=-14:TP=-1.0:LRA=9" -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$OUT"
echo "wrote $OUT ($(du -h "$OUT" | cut -f1))"
