"""Inline the font and the motion engine into one self-contained page: python3 build.py -> dist/ad.html"""
import base64, pathlib
D = pathlib.Path(__file__).resolve().parent
src = (D/'ad.src.html').read_text(encoding='utf-8')
src = src.replace('__ARCHIVO__', base64.b64encode((D/'fonts/Archivo.ttf').read_bytes()).decode())
src = src.replace('__MOTION__', (D/'engine/motion.js').read_text(encoding='utf-8'))
(D/'dist').mkdir(exist_ok=True); (D/'dist/ad.html').write_text(src, encoding='utf-8'); print('built dist/ad.html')
