#!/usr/bin/env bash
# Render the rebuild (1920x1080, 30 fps) in 4 parallel segments, then mux the reference audio as a timing guide.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH="${NODE_PATH:-$(npm root -g)}"
export SUB="${SUB:-8}"
FPS=30; N=885; P=4; S=$(( (N + P - 1) / P ))
mkdir -p work out
for i in $(seq 0 $((P-1))); do node engine/render-seg.js ad.html work/seg$i.mp4 $FPS $((i*S)) $(((i+1)*S)) > work/seg$i.log 2>&1 & done; wait
: > work/segs.txt; for i in $(seq 0 $((P-1))); do echo "file 'seg$i.mp4'" >> work/segs.txt; done
ffmpeg -loglevel error -y -f concat -safe 0 -i work/segs.txt -c copy out/rebuild_16x9_silent.mp4
ffmpeg -loglevel error -y -i out/rebuild_16x9_silent.mp4 -i reference.mp4 -map 0:v -map 1:a -c:v copy -af "atrim=0:29.5,afade=t=out:st=29.2:d=0.3" -c:a aac -b:a 192k -shortest -movflags +faststart out/rebuild_16x9_guide-audio.mp4
ffmpeg -loglevel error -y -i reference.mp4 -i out/rebuild_16x9_silent.mp4 -filter_complex "[0:v]trim=0:29.5,setpts=PTS-STARTPTS,scale=960:540,drawtext=text='Referenz':x=20:y=20:fontsize=30:fontcolor=white:box=1:boxcolor=black@.6[a];[1:v]scale=960:540,drawtext=text='Nachbau':x=20:y=20:fontsize=30:fontcolor=white:box=1:boxcolor=black@.6[b];[a][b]vstack[v]" -map "[v]" -map 0:a -af "atrim=0:29.5" -c:v libx264 -crf 18 -c:a aac -b:a 160k -shortest out/compare_ref_vs_rebuild.mp4
echo done
