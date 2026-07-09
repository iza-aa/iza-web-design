"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { useTheme } from "@/lib/theme";
import lefttoplogo from "@/assets/logo/lefttoplogo.png";
import lefttoplogolight from "@/assets/logo/lefttoplogolight.png";

/**
 * The site's left-top brand mark, filled with the fluid plasma shader from
 * docs/webgl-plasma.md (trimmed to drop its mouse-follow term — not
 * meaningful for a small decorative mark) instead of a flat color/gradient.
 * A plain <Image> of the same lockup renders underneath at all times as the
 * SSR/no-WebGL fallback (same convention as AmbientCanvas) — the canvas, once
 * mounted, is CSS-masked to the identical logo silhouette and fully occludes it.
 */

const VERTEX_SHADER = `attribute vec4 p;void main(){gl_Position=p;}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

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

    vec3 cCyan  =vec3(0.1799,0.5344,0.8154);
    vec3 cYellow=vec3(0.9184,0.4978,0.1644);
    vec3 cOrange=vec3(0.3533,0.9185,0.3187);
    vec3 cPurple=vec3(0.9062,0.1289,0.9539);
    vec3 cBlue  =vec3(0.4467,0.3328,0.9258);

    float fq=0.7344;
    float wp=0.3213;

    vec2 q=asp*fq;
    float flow=fbm(q + vec2(t*.3, -t*.2));
    float drape=fbm(q*1.7 + vec2(flow*(1.0+wp*1.2), t*.15));

    float folds=sin((drape*4.0 + flow*2.0)*3.14159);
    float shade=folds*0.5+0.5;
    float highlight=pow(max(folds,0.0),6.0);

    vec3 col=mix(cBlue, cPurple, clamp(flow*.5+.5,0.,1.));
    col=mix(col, cCyan, smoothstep(.2,.9,drape*.5+.5));
    col=mix(col, cOrange, smoothstep(.3,1., shade*(1.0-asp.y)));
    col=mix(col, cYellow, highlight*0.8);

    col*=0.55+0.55*shade;
    col+=highlight*0.35;

    float gr=fract(sin(dot(gl_FragCoord.xy+floor(u_time*24.),vec2(12.9898,78.233)))*43758.5453123);
    col+=(gr-.5)*0.0710;

    gl_FragColor=vec4(col,1.);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

export function PlasmaLogoMark({ className = "", alt = "IZA UI" }: { className?: string; alt?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? lefttoplogo : lefttoplogolight;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    if (typeof window.WebGLRenderingContext === "undefined") return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    let disposed = false;
    let raf = 0;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
    gl.linkProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1, -1, -1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, "p");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");

    function resize() {
      if (!canvas || !container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, container.clientWidth * dpr);
      canvas.height = Math.max(1, container.clientHeight * dpr);
      gl!.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    function draw(now: number) {
      if (disposed) return;
      gl!.useProgram(program);
      gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
      gl!.vertexAttribPointer(posLoc, 2, gl!.FLOAT, false, 0, 0);
      gl!.enableVertexAttribArray(posLoc);
      gl!.uniform2f(resLoc, canvas.width, canvas.height);
      gl!.uniform1f(timeLoc, (now - start) / 1000);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      if (!reduced) raf = requestAnimationFrame(draw);
    }
    draw(performance.now());

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteBuffer(buf);
    };
  }, [reduced]);

  return (
    <div ref={containerRef} className={`relative ${className}`} style={{ aspectRatio: "94 / 48" }}>
      <Image src={logoSrc} alt={alt} fill sizes="480px" className="object-contain" priority />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        style={{
          WebkitMaskImage: `url(${logoSrc.src})`,
          maskImage: `url(${logoSrc.src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}
