const fs=require("fs"),E=process.env;
function R(P,N){
let S=[],C=[],M=new Int32Array(256),o=[],p=0,n=0,s=0;
const t=c=>{throw c};
const pu=v=>{if(S.length>255)t(3);S.push(v|0)};
const po=()=>{if(!S.length)t(2);return S.pop()};
const w=b=>{if(o.length+b.length>65536)t(11);o.push(...b)};
const B=f=>{const b=po(),a=po();pu(f(a,b))};
const J=z=>{if(p+1>=P.length)t(9);const v=po();p+=2+((v==0)==z?P.readInt16LE(p):0)};
try{
for(;;){
if(s++>=1e6)t(10);
if(p<0||p>=P.length)t(9);
const k=P[p++];
switch(k){
case 0:return[o,0];
case 1:if(p>=P.length)t(9);pu(P[p++]<<24>>24);break;
case 2:if(p+3>=P.length)t(9);pu(P.readInt32LE(p));p+=4;break;
case 3:po();break;
case 4:pu(S.at(-1)??t(2));break;
case 5:if(S.length<2)t(2);S.push(S.splice(-2,1)[0]);break;
case 6:pu(S.at(-2)??t(2));break;
case 7:if(S.length<3)t(2);S.push(S.splice(-3,1)[0]);break;
case 16:B((a,b)=>a+b);break;
case 17:B((a,b)=>a-b);break;
case 18:B((a,b)=>Math.imul(a,b));break;
case 19:B((a,b)=>b?a/b|0:t(4));break;
case 20:B((a,b)=>b?a%b:t(4));break;
case 21:B((a,b)=>b?(a>>>0)/(b>>>0):t(4));break;
case 22:B((a,b)=>b?(a>>>0)%(b>>>0):t(4));break;
case 23:pu(-po());break;
case 24:B((a,b)=>a&b);break;
case 25:B((a,b)=>a|b);break;
case 26:B((a,b)=>a^b);break;
case 27:pu(~po());break;
case 28:B((a,b)=>a<<b);break;
case 29:B((a,b)=>a>>b);break;
case 30:B((a,b)=>a>>>b);break;
case 32:B((a,b)=>a==b);break;
case 33:B((a,b)=>a<b);break;
case 34:B((a,b)=>(a>>>0)<(b>>>0));break;
case 48:if(p+1>=P.length)t(9);p+=P.readInt16LE(p)+2;break;
case 49:J(1);break;
case 50:J(0);break;
case 51:if(p+1>=P.length)t(9);if(C.length>63)t(7);C.push(p+2);p=P.readUInt16LE(p);break;
case 52:if(!C.length)t(8);p=C.pop();break;
case 64:{const a=po();if(a<0||a>255)t(6);pu(M[a])}break;
case 65:{const a=po(),v=po();if(a<0||a>255)t(6);M[a]=v}break;
case 80:w(Buffer.from(""+po()));break;
case 81:w([po()&255]);break;
case 82:pu(n<N.length?N[n++]:-1);break;
case 83:return[o,po()&255];
default:t(5);
}
}
}catch(x){return[o,x]}
}
const I=E.MAKEFUN_INPUT_DIR||"/input",O=E.MAKEFUN_OUTPUT_DIR||"/output";
for(const d of fs.readdirSync(I).sort()){
const P=fs.readFileSync(I+"/"+d+"/program.bin"),N=fs.readFileSync(I+"/"+d+"/input.bin"),[o,e]=R(P,N);
fs.mkdirSync(O+"/"+d,{recursive:true});
fs.writeFileSync(O+"/"+d+"/stdout.bin",Buffer.from(o));
fs.writeFileSync(O+"/"+d+"/exit.txt",e+"");
}
