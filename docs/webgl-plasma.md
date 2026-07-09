<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Fluid Gradient</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:100vw;height:100vh;overflow:hidden;background:#09090b}
canvas{position:absolute;inset:0;width:100%;height:100%}
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const c=document.getElementById('c'),gl=c.getContext('webgl');
const vs=`attribute vec4 p;void main(){gl_Position=p;}`;
const fs=`
    precision highp float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;

    vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec2 mod289(vec2 x){return x-floor(x*(1./289.))*289.;}
    vec3 permute(vec3 x){return mod289(((x*34.)+1.)*x);}
    float snoise(vec2 v){
        const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
        vec2 i=floor(v+dot(v,C.yy));
        vec2 x0=v-i+dot(i,C.xx);
        vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
        vec4 x12=x0.xyxy+C.xxzz;
        x12.xy-=i1;
        i=mod289(i);
        vec3 pv=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
        vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
        m=m*m;m=m*m;
        vec3 x=2.*fract(pv*C.www)-1.;
        vec3 h=abs(x)-.5;
        vec3 ox=floor(x+.5);
        vec3 a0=x-ox;
        m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
        vec3 g;
        g.x=a0.x*x0.x+h.x*x0.y;
        g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.*dot(m,g);
    }

    float fbm(vec2 q){
        float f=0., a=.5;
        for(int i=0;i<5;i++){ f+=a*snoise(q); q*=2.02; a*=.5; }
        return f;
    }

    void main(){
        vec2 st=gl_FragCoord.xy/u_resolution.xy;
        vec2 asp=st; asp.x*=u_resolution.x/u_resolution.y;
        float t=u_time*0.0920;
        
        // Hover interaction: deflect folds of fabric (deflection)
        vec2 m_asp = u_mouse;
        m_asp.x *= u_resolution.x/u_resolution.y;
        vec2 m_dir = asp - m_asp;
        float m_dist = length(m_dir);
        float m_influence = smoothstep(0.45, 0.0, m_dist);
        

        vec3 cCyan  =vec3(0.1799,0.5344,0.8154);
        vec3 cYellow=vec3(0.9184,0.4978,0.1644);
        vec3 cOrange=vec3(0.3533,0.9185,0.3187);
        vec3 cPurple=vec3(0.9062,0.1289,0.9539);
        vec3 cBlue  =vec3(0.4467,0.3328,0.9258);
  
        float fq=0.7344;
        float wp=0.3213;

        // Base flowing field that defines where the folds sit.
        vec2 q=asp*fq;
        q += m_dir * m_influence * 0.35;
        
        float flow=fbm(q + vec2(t*.3, -t*.2));
        float drape=fbm(q*1.7 + vec2(flow*(1.0+wp*1.2), t*.15));

        // Repeating soft folds; the derivative gives us a fabric-like shading term.
        float folds=sin((drape*4.0 + flow*2.0)*3.14159);
        float shade=folds*0.5+0.5;                  // 0..1 fold body
        float highlight=pow(max(folds,0.0),6.0);    // sharp satin sheen on fold crests

        // Blend the palette smoothly across the cloth.
        vec3 col=mix(cBlue, cPurple, clamp(flow*.5+.5,0.,1.));
        col=mix(col, cCyan, smoothstep(.2,.9,drape*.5+.5));
        col=mix(col, cOrange, smoothstep(.3,1., shade*(1.0-asp.y)));
        col=mix(col, cYellow, highlight*0.8);

        // Apply the fold shading so the fabric reads as 3D drapery.
        col*=0.55+0.55*shade;
        col+=highlight*0.35;
        
        // Subtle sheen/glow near cursor (reduced brightness)
        col += cPurple * m_influence * 0.05;

        float gr=fract(sin(dot(gl_FragCoord.xy+floor(u_time*24.),vec2(12.9898,78.233)))*43758.5453123);
        col+=(gr-.5)*0.0710;

        gl_FragColor=vec4(col,1.);
    }
  `;
function sh(t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;}
const prog=gl.createProgram();
gl.attachShader(prog,sh(gl.VERTEX_SHADER,vs));
gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog);
const buf=gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER,buf);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([1,-1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
const ap=gl.getAttribLocation(prog,'p');
const ur=gl.getUniformLocation(prog,'u_resolution');
const ut=gl.getUniformLocation(prog,'u_time');
const um=gl.getUniformLocation(prog,'u_mouse');
let mx=0.5,my=0.5,tx=0.5,ty=0.5;
window.addEventListener('mousemove',e=>{tx=e.clientX/window.innerWidth;ty=1-e.clientY/window.innerHeight;});
window.addEventListener('touchmove',e=>{if(e.touches.length){const t=e.touches[0];tx=t.clientX/window.innerWidth;ty=1-t.clientY/window.innerHeight;}},{passive:true});
const t0=Date.now();
function draw(){
  if(c.width!==c.clientWidth||c.height!==c.clientHeight){c.width=c.clientWidth;c.height=c.clientHeight;}
  gl.viewport(0,0,c.width,c.height);gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
  gl.enableVertexAttribArray(ap);
  gl.uniform2f(ur,c.width,c.height);
  gl.uniform1f(ut,(Date.now()-t0)/1000);
  mx+=(tx-mx)*0.08;my+=(ty-my)*0.08;
  gl.uniform2f(um,mx,my);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  requestAnimationFrame(draw);
}
draw();
</script>
</body>
</html>