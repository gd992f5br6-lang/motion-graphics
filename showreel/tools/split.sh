#!/usr/bin/env bash
# Export every chapter as its own spot (picture + matching slice of the soundtrack, soft fade-out).
set -euo pipefail
cd "$(dirname "$0")/.."
FPS=30
mkdir -p out/spots
# name start(s) duration(s)
while read -r NAME START DUR; do
  S=$((START * FPS)); N=$((DUR * FPS)); FO=$(echo "$DUR - 0.5" | bc)
  ffmpeg -nostdin -loglevel error -y -framerate $FPS -start_number $S -i out/frames/%05d.jpg -ss "$START" -t "$DUR" -i out/soundtrack.wav \
    -frames:v $N -vf "fade=t=out:st=$FO:d=0.5" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -tune film -g 60 \
    -af "afade=t=in:d=0.02,afade=t=out:st=$(echo "$DUR - 0.8" | bc):d=0.8,loudnorm=I=-14:TP=-1.0:LRA=9" -c:a aac -b:a 320k -ar 48000 \
    -movflags +faststart -t "$DUR" "out/spots/$NAME.mp4"
  echo "wrote out/spots/$NAME.mp4"
done <<'LIST'
01_Fitness-Health_VYTA 4 12
02_Finance-Commerce_VELORA 16 12
03_Technology_QORE 28 12
04_Family_hearth 40 12
05_Media-Entertainment_NOCTIS 52 12
LIST
