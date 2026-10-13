# python3 tools/sheet.py out.jpg t1 t2 ...  -> renders stills and tiles them 3 across (640px each)
import subprocess, sys, math
out, ts = sys.argv[1], sys.argv[2:]
subprocess.run(['node', 'tools/stills.js', *ts], check=True, stdout=subprocess.DEVNULL)
files = [f'out/stills/t_{float(t):.2f}.jpg' for t in ts]
cols = 3; rows = math.ceil(len(files) / cols)
args = []; 
for f in files: args += ['-i', f]
n = len(files)
pads = ''.join(f'[{i}]scale=640:360,drawtext=text=\'{float(ts[i]):.2f}\':x=8:y=8:fontsize=18:fontcolor=yellow[v{i}];' for i in range(n))
for i in range(n, rows * cols): pads += f'color=black:640x360:d=1[v{i}];'
layout = '|'.join(f'{(i%cols)*640}_{(i//cols)*360}' for i in range(rows * cols))
fc = pads + ''.join(f'[v{i}]' for i in range(rows * cols)) + f'xstack=inputs={rows*cols}:layout={layout}'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args, '-filter_complex', fc, '-frames:v', '1', out], check=True)
print(out)
