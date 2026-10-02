"use client";
import {useEffect,useRef} from "react";

const COLORS=["#ff3158","#ff7a1a","#ffd22e","#00c9a7","#12bce5","#3977ff","#8a4dff","#ff55ad"];
const clamp=(value:number,min=0,max=1)=>Math.max(min,Math.min(max,value));
const ease=(value:number)=>1-Math.pow(1-value,3);
const seeded=(seed:number)=>{const value=Math.sin(seed*127.1+311.7)*43758.5453;return value-Math.floor(value)};

export default function TrussFestival(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const context=element.getContext("2d");if(!context)return;
  let frame=0,start=performance.now(),width=0,height=0,ratio=1;
  const resize=()=>{width=window.innerWidth;height=window.innerHeight;ratio=Math.min(window.devicePixelRatio||1,2);element.width=Math.round(width*ratio);element.height=Math.round(height*ratio);element.style.width=width+"px";element.style.height=height+"px";context.setTransform(ratio,0,0,ratio,0,0)};
  resize();window.addEventListener("resize",resize);
  const balloons=Array.from({length:26},(_,index)=>{const angle=index*2.39996,radius=8+Math.sqrt(index)*12;return{index,size:48+seeded(index+2)*30,bundleX:Math.cos(angle)*radius,bundleY:Math.sin(angle)*radius*.64,targetX:.035+(index/25)*.93,targetY:-90-seeded(index+9)*95,wobble:seeded(index+17)*Math.PI*2,color:COLORS[index%COLORS.length],depth:seeded(index+25)}});
  const confetti=Array.from({length:330},(_,index)=>({x:seeded(index+31),y:seeded(index+67),speed:75+seeded(index+91)*190,size:4+seeded(index+121)*8,spin:seeded(index+151)*Math.PI*2,rate:2+seeded(index+181)*7,color:COLORS[index%COLORS.length],shape:index%4}));
  const balloon=(x:number,y:number,w:number,color:string,rotation:number,opacity:number,stringLength:number)=>{
   context.save();context.globalAlpha=opacity;context.translate(x,y);context.rotate(rotation);
   context.beginPath();context.moveTo(0,w*.62);context.bezierCurveTo(-w*.58,w*.3,-w*.57,-w*.42,0,-w*.55);context.bezierCurveTo(w*.57,-w*.42,w*.58,w*.3,0,w*.62);context.closePath();
   const gradient=context.createRadialGradient(-w*.19,-w*.27,w*.03,0,0,w*.7);gradient.addColorStop(0,"#ffffff");gradient.addColorStop(.12,color);gradient.addColorStop(.72,color);gradient.addColorStop(1,"rgba(38,45,58,.72)");context.fillStyle=gradient;context.fill();
   context.strokeStyle="rgba(255,255,255,.34)";context.lineWidth=1.2;context.stroke();
   context.beginPath();context.ellipse(-w*.17,-w*.25,w*.09,w*.19,-.45,0,Math.PI*2);context.fillStyle="rgba(255,255,255,.5)";context.fill();
   context.beginPath();context.moveTo(-5,w*.61);context.lineTo(0,w*.72);context.lineTo(6,w*.61);context.closePath();context.fillStyle=color;context.fill();
   context.beginPath();context.moveTo(0,w*.7);context.bezierCurveTo(-10,w*.95,10,w*1.18,0,w*1.42);context.bezierCurveTo(-8,w*1.62,7,w*1.82,0,w*.72+stringLength);context.strokeStyle="rgba(49,58,68,.58)";context.lineWidth=1.2;context.stroke();context.restore();
  };
  const draw=(now:number)=>{
   const seconds=(now-start)/1000,progress=clamp(seconds/7.4),rise=ease(clamp(progress/.43)),scatter=ease(clamp((progress-.43)/.5));
   context.clearRect(0,0,width,height);
   const glow=context.createRadialGradient(width*.5,height*.5,20,width*.5,height*.5,width*.65);glow.addColorStop(0,"rgba(101,218,242,.16)");glow.addColorStop(1,"rgba(101,218,242,0)");context.fillStyle=glow;context.fillRect(0,0,width,height);
   for(const particle of confetti){const y=((particle.y*height+seconds*particle.speed)%(height+80))-40,x=particle.x*width+Math.sin(seconds*particle.rate+particle.spin)*28,angle=seconds*particle.rate+particle.spin;context.save();context.translate(x,y);context.rotate(angle);context.fillStyle=particle.color;context.globalAlpha=.9;if(particle.shape===0){context.beginPath();context.arc(0,0,particle.size*.48,0,Math.PI*2);context.fill()}else{context.fillRect(-particle.size*.65,-particle.size*.22,particle.size*1.3,particle.size*.44)}context.restore()}
   [...balloons].sort((a,b)=>a.depth-b.depth).forEach(item=>{const bundleX=width*.5+item.bundleX,bundleY=height*.53+item.bundleY,startY=height+145;let x=width*.5+(item.bundleX*.15)*rise,y=startY+(bundleY-startY)*rise;if(scatter>0){x=bundleX+(width*item.targetX-bundleX)*scatter;y=bundleY+(item.targetY-bundleY)*scatter}x+=Math.sin(seconds*2.2+item.wobble)*(3+scatter*10);y+=Math.cos(seconds*1.7+item.wobble)*3;const alpha=progress>.91?clamp((1-progress)/.09):clamp(progress/.06);balloon(x,y,item.size,item.color,Math.sin(seconds*1.6+item.wobble)*.08,alpha,95+item.depth*75)});
   if(progress<1)frame=requestAnimationFrame(draw);
  };
  frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize)};
 },[]);
 return <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true"/>;
}