#!/usr/bin/env bash
# Render the ad in 4 parallel segments, concat, mux audio at -14 LUFS.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
python3 build.py
FPS=30; N=615; P=4; S=$(( (N + P - 1) / P ))
for i in $(seq 0 $((P-1))); do node engine/render-seg.js dist/ad.html work/seg$i.mp4 $FPS $((i*S)) $(((i+1)*S)) & done; wait
render_concat() {
  : > work/segs.txt; for i in $(seq 0 $((P-1))); do echo "file 'seg$i.mp4'" >> work/segs.txt; done
  ffmpeg -loglevel error -y -f concat -safe 0 -i work/segs.txt -c copy work/video.mp4
  python3 audio.py
  mkdir -p out
  ffmpeg -loglevel error -y -i work/video.mp4 -i work/audio.wav -map 0:v -map 1:a -c:v copy \
    -af "loudnorm=I=-14:TP=-1:LRA=7" -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/flashstacks_tiktok_9x16.mp4
}
render_concat
echo "wrote out/flashstacks_tiktok_9x16.mp4"
