#!/usr/bin/env bash
# Frames + soundtrack -> final H.264 master (loudness-normalised to -14 LUFS for web/social).
set -euo pipefail
cd "$(dirname "$0")/.."
FPS=${FPS:-30}
OUT=${1:-out/Showreel_2026.mp4}
ffmpeg -loglevel error -y -framerate "$FPS" -i out/frames/%05d.jpg -i out/soundtrack.wav \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -tune film -g 60 \
  -af "loudnorm=I=-14:TP=-1.0:LRA=9" -c:a aac -b:a 320k -ar 48000 \
  -movflags +faststart -shortest "$OUT"
echo "wrote $OUT"
