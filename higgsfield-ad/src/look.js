// Display-referred grade, applied per shot after tone mapping.
//  film: lifted blacks, soft highlight roll-off, gentle desaturation, halation, gate weave, grain.
//  ai:   the "default AI video" look we argue against: over-saturated, teal/orange, crushed contrast,
//        over-sharpened halos, no grain, wobbly warping. Used only to demonstrate the tells.
//  split: x position (0..1) of an A/B wipe — left of it gets the ai look. < 0 disables.
export const LookShader = {
  uniforms: {
    tDiffuse: { value: null }, res: { value: [1, 1] }, frame: { value: 0 },
    ai: { value: 0 }, warp: { value: 0 }, split: { value: -1 },
    grain: { value: 0.07 }, halation: { value: 0.5 }, lift: { value: 0.035 }, sat: { value: 0.9 }, weave: { value: 1 }, vign: { value: 0.35 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform vec2 res; uniform float frame, ai, warp, split, grain, halation, lift, sat, weave, vign;
    varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    vec3 sat3(vec3 c, float s){ float l=dot(c, vec3(.2126,.7152,.0722)); return mix(vec3(l), c, s); }
    vec3 aiLook(vec2 uv){
      vec2 w = uv + warp * vec2(sin(uv.y*18.+frame*.11)*.004, sin(uv.x*14.+frame*.09)*.003);
      vec2 px = 1./res;
      vec3 c = texture2D(tDiffuse, w).rgb;
      vec3 b = (texture2D(tDiffuse, w+vec2(px.x*2.,0.)).rgb + texture2D(tDiffuse, w-vec2(px.x*2.,0.)).rgb + texture2D(tDiffuse, w+vec2(0.,px.y*2.)).rgb + texture2D(tDiffuse, w-vec2(0.,px.y*2.)).rgb)*.25;
      c = c + (c-b)*1.6;                                   // over-sharpening halos
      float l = dot(c, vec3(.2126,.7152,.0722));
      c = mix(c, c*vec3(.75,1.0,1.15), smoothstep(.5,.0,l)*.6);   // teal shadows
      c = mix(c, c*vec3(1.2,.98,.8), smoothstep(.45,1.,l)*.6);    // orange highlights
      c = sat3(c, 1.55);
      c = (c-.5)*1.22+.5;                                  // crunchy contrast
      c += vec3(.06,.04,.02)*smoothstep(.6,1.,l);           // plastic glow
      return clamp(c,0.,1.);
    }
    vec3 filmLook(vec2 uv){
      vec2 wv = uv + weave * vec2(h(vec2(floor(frame),1.))-.5, h(vec2(floor(frame),7.))-.5) * vec2(.0007,.0005);
      vec2 px = 1./res;
      vec3 c;
      float ca = .0009*length(uv-.5);
      c.r = texture2D(tDiffuse, wv + (uv-.5)*ca).r; c.g = texture2D(tDiffuse, wv).g; c.b = texture2D(tDiffuse, wv - (uv-.5)*ca).b;
      // halation: warm bleed around highlights
      vec3 hb = vec3(0.);
      for(int i=0;i<8;i++){ float a=float(i)*.785; vec2 o=vec2(cos(a),sin(a))*px*7.; hb += max(texture2D(tDiffuse, wv+o).rgb-.72,0.); }
      c += hb/8.*vec3(1.,.35,.15)*halation*1.6;
      c = sat3(c, sat);
      c = c/(1.+max(c-.85,0.)*1.4);                        // soft shoulder
      c = lift + c*(1.-lift);                              // lifted blacks
      float d = length((uv-.5)*vec2(1.,1.1)); c *= 1.-vign*smoothstep(.35,.85,d);
      float g = h(uv*res + frame*17.13) - .5; float l = dot(c, vec3(.33));
      c += g * grain * (1.2 - l*.8);
      return c;
    }
    void main(){
      vec3 a = aiLook(vUv), f = filmLook(vUv);
      float m = split >= 0. ? step(vUv.x, split) : ai;
      vec3 col = mix(f, a, m);
      if (split >= 0.) col = mix(col, vec3(1.), smoothstep(1.5/res.x, 0., abs(vUv.x-split))*.9);
      gl_FragColor = vec4(col, 1.);
    }`,
};
