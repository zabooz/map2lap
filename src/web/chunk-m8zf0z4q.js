var yr="187",Le={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Ie={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Hu=0,$l=1,Vu=2;var Eo=1,Wu=2,Yr=3,pe=0,B=1,w=2,vr=0,wo=1,mt=2,Kl=3,Ql=4,Lt=5;var ke=100,Xu=101,qu=102,Yu=103,Zu=104,Ju=200,It=201,$u=202,Ku=203,Qu=204,ju=205,tf=206,ef=207,nf=208,sf=209,rf=210,of=211,af=212,lf=213,cf=214,hf=0,uf=1,ff=2,jl=3,df=4,pf=5,mf=6,gf=7,_f=0,xf=1,yf=2,Is=0,tc=1,ec=2,nc=3,gt=4,ic=5,sc=6,rc=7;var Ro=301,Zr=302,Ra=303,Ca=304,xe=1000,Oe=1001,kt=1002,oe=1003,Ot=1004;var je=1005;var I=1006,st=1007;var ee=1008;var Ts=1009,vf=1010,Sf=1011,Co=1012,oc=1013,tr=1014,Xs=1015,te=1016,ac=1017,lc=1018,Sr=1020,Mf=35902,bf=35899,Tf=1021,Af=1022,q=1023,Jr=1026,er=1027,Dt=1028,cc=1029,Mr=1030,hc=1031;var uc=1033,ot=33776,Ia=33777,at=33778,lt=33779,fc=35840,dc=35841,pc=35842,mc=35843,vt=36196,gc=37492,_c=37496,xc=37488,yc=37489,Pa=37490,vc=37491,Sc=37808,Mc=37809,bc=37810,Tc=37811,Ac=37812,Ec=37813,wc=37814,Rc=37815,Cc=37816,Ic=37817,Pc=37818,Lc=37819,Nc=37820,Dc=37821,yt=36492,bt=36494,xt=36495,Uc=36283,Fc=36284,La=36285,Oc=36286;var dn=2300,Xt=2301;var hn=0,_t=1,ct=2;var Bc=0,Ef=1,Ee="",_e="srgb",J="srgb-linear",zc="linear",Ti="srgb";var wf=512,Rf=513,Cf=514,Gc=515,If=516,Pf=517,kc=518,Hc=519;var Vc="300 es",Wc=2000,fn=2001;function wp(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function Rp(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Xr(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function Lf(){let t=Xr("canvas");return t.style.display="block",t}var $h={},qr=null;function Ao(...t){let e="THREE."+t.shift();if(qr)qr("log",e,...t);else console.log(e,...t)}function Nf(t){let e=t[0];if(typeof e==="string"&&e.startsWith("TSL:")){let i=t[1];if(i&&i.isStackTrace)t[0]+=" "+i.getLocation();else t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function Yn(...t){t=Nf(t);let e="THREE."+t.shift();if(qr)qr("warn",e,...t);else{let i=t[0];if(i&&i.isStackTrace)console.warn(i.getError(e));else console.warn(e,...t)}}function jn(...t){t=Nf(t);let e="THREE."+t.shift();if(qr)qr("error",e,...t);else{let i=t[0];if(i&&i.isStackTrace)console.error(i.getError(e));else console.error(e,...t)}}function _r(...t){let e=t.join(" ");if(e in $h)return;$h[e]=!0,Yn(...t)}function Df(t,e,i){return new Promise(function(s,r){function a(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:r();break;case t.TIMEOUT_EXPIRED:setTimeout(a,i);break;default:s()}}setTimeout(a,i)})}var Uf={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class Ps{addEventListener(t,e){if(this._listeners===void 0)this._listeners={};let i=this._listeners;if(i[t]===void 0)i[t]=[];if(i[t].indexOf(e)===-1)i[t].push(e)}hasEventListener(t,e){let i=this._listeners;if(i===void 0)return!1;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let r=s.indexOf(e);if(r!==-1)s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}var Ki=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Kh=1234567,bo=Math.PI/180,xr=180/Math.PI;function Ls(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Ki[t&255]+Ki[t>>8&255]+Ki[t>>16&255]+Ki[t>>24&255]+"-"+Ki[e&255]+Ki[e>>8&255]+"-"+Ki[e>>16&15|64]+Ki[e>>24&255]+"-"+Ki[i&63|128]+Ki[i>>8&255]+"-"+Ki[i>>16&255]+Ki[i>>24&255]+Ki[s&255]+Ki[s>>8&255]+Ki[s>>16&255]+Ki[s>>24&255]).toLowerCase()}function ti(t,e,i){return Math.max(e,Math.min(i,t))}function Xc(t,e){return(t%e+e)%e}function Cp(t,e,i,s,r){return s+(t-e)*(r-s)/(i-e)}function Ip(t,e,i){if(t!==e)return(i-t)/(e-t);else return 0}function To(t,e,i){return(1-i)*t+i*e}function Pp(t,e,i,s){return To(t,e,1-Math.exp(-i*s))}function Lp(t,e=1){return e-Math.abs(Xc(t,e*2)-e)}function Np(t,e,i){if(t<=e)return 0;if(t>=i)return 1;return t=(t-e)/(i-e),t*t*(3-2*t)}function Dp(t,e,i){if(t<=e)return 0;if(t>=i)return 1;return t=(t-e)/(i-e),t*t*t*(t*(t*6-15)+10)}function Up(t,e){return t+Math.floor(Math.random()*(e-t+1))}function Fp(t,e){return t+Math.random()*(e-t)}function Op(t){return t*(0.5-Math.random())}function Bp(t){if(t!==void 0)Kh=t;let e=Kh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function zp(t){return t*bo}function Gp(t){return t*xr}function kp(t){return t>0&&Number.isInteger(t)&&2**Math.round(Math.log2(t))===t}function Hp(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function qc(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function Vp(t,e,i,s,r){let{cos:a,sin:u}=Math,f=a(i/2),x=u(i/2),A=a((e+s)/2),L=u((e+s)/2),D=a((e-s)/2),R=u((e-s)/2),V=a((s-e)/2),rt=u((s-e)/2);switch(r){case"XYX":t.set(f*L,x*D,x*R,f*A);break;case"YZY":t.set(x*R,f*L,x*D,f*A);break;case"ZXZ":t.set(x*D,x*R,f*L,f*A);break;case"XZX":t.set(f*L,x*rt,x*V,f*A);break;case"YXY":t.set(x*V,f*L,x*rt,f*A);break;case"ZYZ":t.set(x*rt,x*V,f*L,f*A);break;default:Yn("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Na(t){switch(t.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Yc(t,e){if(e.constructor===Float32Array)return t;let i=Na(e);if(i===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(t/i,-1)}function Zc(t,e){if(e.constructor===Float32Array)return t;let i=Na(e);if(i===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(t*i)}var W={DEG2RAD:bo,RAD2DEG:xr,generateUUID:Ls,clamp:ti,euclideanModulo:Xc,mapLinear:Cp,inverseLerp:Ip,lerp:To,damp:Pp,pingpong:Lp,smoothstep:Np,smootherstep:Dp,randInt:Up,randFloat:Fp,randFloatSpread:Op,seededRandom:Bp,degToRad:zp,radToDeg:Gp,isPowerOfTwo:kp,ceilPowerOfTwo:Hp,floorPowerOfTwo:qc,setQuaternionFromProperEuler:Vp,normalize:Zc,denormalize:Yc};class l{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ti(this.x,t.x,e.x),this.y=ti(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ti(this.x,t,e),this.y=ti(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ti(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ti(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class H{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,u){let f=i[s+0],x=i[s+1],A=i[s+2],L=i[s+3],D=r[a+0],R=r[a+1],V=r[a+2],rt=r[a+3];if(L!==rt||f!==D||x!==R||A!==V){let Ct=f*D+x*R+A*V+L*rt;if(Ct<0)D=-D,R=-R,V=-V,rt=-rt,Ct=-Ct;let j=1-u;if(Ct<0.9995){let it=Math.acos(Ct),ft=Math.sin(it);j=Math.sin(j*it)/ft,u=Math.sin(u*it)/ft,f=f*j+D*u,x=x*j+R*u,A=A*j+V*u,L=L*j+rt*u}else{f=f*j+D*u,x=x*j+R*u,A=A*j+V*u,L=L*j+rt*u;let it=1/Math.sqrt(f*f+x*x+A*A+L*L);f*=it,x*=it,A*=it,L*=it}}t[e]=f,t[e+1]=x,t[e+2]=A,t[e+3]=L}static multiplyQuaternionsFlat(t,e,i,s,r,a){let u=i[s],f=i[s+1],x=i[s+2],A=i[s+3],L=r[a],D=r[a+1],R=r[a+2],V=r[a+3];return t[e]=u*V+A*L+f*R-x*D,t[e+1]=f*V+A*D+x*L-u*R,t[e+2]=x*V+A*R+u*D-f*L,t[e+3]=A*V-u*L-f*D-x*R,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let{_x:i,_y:s,_z:r,_order:a}=t,{cos:u,sin:f}=Math,x=u(i/2),A=u(s/2),L=u(r/2),D=f(i/2),R=f(s/2),V=f(r/2);switch(a){case"XYZ":this._x=D*A*L+x*R*V,this._y=x*R*L-D*A*V,this._z=x*A*V+D*R*L,this._w=x*A*L-D*R*V;break;case"YXZ":this._x=D*A*L+x*R*V,this._y=x*R*L-D*A*V,this._z=x*A*V-D*R*L,this._w=x*A*L+D*R*V;break;case"ZXY":this._x=D*A*L-x*R*V,this._y=x*R*L+D*A*V,this._z=x*A*V+D*R*L,this._w=x*A*L-D*R*V;break;case"ZYX":this._x=D*A*L-x*R*V,this._y=x*R*L+D*A*V,this._z=x*A*V-D*R*L,this._w=x*A*L+D*R*V;break;case"YZX":this._x=D*A*L+x*R*V,this._y=x*R*L+D*A*V,this._z=x*A*V-D*R*L,this._w=x*A*L-D*R*V;break;case"XZY":this._x=D*A*L-x*R*V,this._y=x*R*L-D*A*V,this._z=x*A*V+D*R*L,this._w=x*A*L+D*R*V;break;default:Yn("Quaternion: .setFromEuler() encountered an unknown order: "+a)}if(e===!0)this._onChangeCallback();return this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],u=e[5],f=e[9],x=e[2],A=e[6],L=e[10],D=i+u+L;if(D>0){let R=0.5/Math.sqrt(D+1);this._w=0.25/R,this._x=(A-f)*R,this._y=(r-x)*R,this._z=(a-s)*R}else if(i>u&&i>L){let R=2*Math.sqrt(1+i-u-L);this._w=(A-f)/R,this._x=0.25*R,this._y=(s+a)/R,this._z=(r+x)/R}else if(u>L){let R=2*Math.sqrt(1+u-i-L);this._w=(r-x)/R,this._x=(s+a)/R,this._y=0.25*R,this._z=(f+A)/R}else{let R=2*Math.sqrt(1+L-i-u);this._w=(a-s)/R,this._x=(r+x)/R,this._y=(f+A)/R,this._z=0.25*R}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;if(i<0.00000001)if(i=0,Math.abs(t.x)>Math.abs(t.z))this._x=-t.y,this._y=t.x,this._z=0,this._w=i;else this._x=0,this._y=-t.z,this._z=t.y,this._w=i;else this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i;return this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ti(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();if(t===0)this._x=0,this._y=0,this._z=0,this._w=1;else t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t;return this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let{_x:i,_y:s,_z:r,_w:a}=t,{_x:u,_y:f,_z:x,_w:A}=e;return this._x=i*A+a*u+s*x-r*f,this._y=s*A+a*f+r*u-i*x,this._z=r*A+a*x+i*f-s*u,this._w=a*A-i*u-s*f-r*x,this._onChangeCallback(),this}slerp(t,e){let{_x:i,_y:s,_z:r,_w:a}=t,u=this.dot(t);if(u<0)i=-i,s=-s,r=-r,a=-a,u=-u;let f=1-e;if(u<0.9995){let x=Math.acos(u),A=Math.sin(x);f=Math.sin(f*x)/A,e=Math.sin(e*x)/A,this._x=this._x*f+i*e,this._y=this._y*f+s*e,this._z=this._z*f+r*e,this._w=this._w*f+a*e,this._onChangeCallback()}else this._x=this._x*f+i*e,this._y=this._y*f+s*e,this._z=this._z*f+r*e,this._w=this._w*f+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class n{static{this.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){if(i===void 0)i=this.z;return this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Qh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Qh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,{x:r,y:a,z:u,w:f}=t,x=2*(a*s-u*i),A=2*(u*e-r*s),L=2*(r*i-a*e);return this.x=e+f*x+a*L-u*A,this.y=i+f*A+u*x-r*L,this.z=s+f*L+r*A-a*x,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ti(this.x,t.x,e.x),this.y=ti(this.y,t.y,e.y),this.z=ti(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ti(this.x,t,e),this.y=ti(this.y,t,e),this.z=ti(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ti(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let{x:i,y:s,z:r}=t,{x:a,y:u,z:f}=e;return this.x=s*f-r*u,this.y=r*a-i*f,this.z=i*u-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return vl.copy(this).projectOnVector(t),this.sub(vl)}reflect(t){return this.sub(vl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ti(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var vl=new n,Qh=new H;class ei{static{this.prototype.isMatrix3=!0}constructor(t,e,i,s,r,a,u,f,x){if(this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0)this.set(t,e,i,s,r,a,u,f,x)}set(t,e,i,s,r,a,u,f,x){let A=this.elements;return A[0]=t,A[1]=s,A[2]=u,A[3]=e,A[4]=r,A[5]=f,A[6]=i,A[7]=a,A[8]=x,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],u=i[3],f=i[6],x=i[1],A=i[4],L=i[7],D=i[2],R=i[5],V=i[8],rt=s[0],Ct=s[3],j=s[6],it=s[1],ft=s[4],Pt=s[7],pt=s[2],Nt=s[5],se=s[8];return r[0]=a*rt+u*it+f*pt,r[3]=a*Ct+u*ft+f*Nt,r[6]=a*j+u*Pt+f*se,r[1]=x*rt+A*it+L*pt,r[4]=x*Ct+A*ft+L*Nt,r[7]=x*j+A*Pt+L*se,r[2]=D*rt+R*it+V*pt,r[5]=D*Ct+R*ft+V*Nt,r[8]=D*j+R*Pt+V*se,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],f=t[6],x=t[7],A=t[8];return e*a*A-e*u*x-i*r*A+i*u*f+s*r*x-s*a*f}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],f=t[6],x=t[7],A=t[8],L=A*a-u*x,D=u*f-A*r,R=x*r-a*f,V=e*L+i*D+s*R;if(V===0)return this.set(0,0,0,0,0,0,0,0,0);let rt=1/V;return t[0]=L*rt,t[1]=(s*x-A*i)*rt,t[2]=(u*i-s*a)*rt,t[3]=D*rt,t[4]=(A*e-s*f)*rt,t[5]=(s*r-u*e)*rt,t[6]=R*rt,t[7]=(i*f-x*e)*rt,t[8]=(a*e-i*r)*rt,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,u){let f=Math.cos(r),x=Math.sin(r);return this.set(i*f,i*x,-i*(f*a+x*u)+a+t,-s*x,s*f,-s*(-x*a+f*u)+u+e,0,0,1),this}scale(t,e){return _r("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Sl.makeScale(t,e)),this}rotate(t){return _r("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Sl.makeRotation(-t)),this}translate(t,e){return _r("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Sl.makeTranslation(t,e)),this}makeTranslation(t,e){if(t.isVector2)this.set(1,0,t.x,0,1,t.y,0,0,1);else this.set(1,0,t,0,1,e,0,0,1);return this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}var Sl=new ei,jh=new ei().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),tu=new ei().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Wp(){let t={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(r,a,u){if(this.enabled===!1||a===u||!a||!u)return r;if(this.spaces[a].transfer==="srgb")r.r=Ws(r.r),r.g=Ws(r.g),r.b=Ws(r.b);if(this.spaces[a].primaries!==this.spaces[u].primaries)r.applyMatrix3(this.spaces[a].toXYZ),r.applyMatrix3(this.spaces[u].fromXYZ);if(this.spaces[u].transfer==="srgb")r.r=Wr(r.r),r.g=Wr(r.g),r.b=Wr(r.b);return r},workingToColorSpace:function(r,a){return this.convert(r,this.workingColorSpace,a)},colorSpaceToWorking:function(r,a){return this.convert(r,a,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){if(r==="")return"linear";return this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,a=this.workingColorSpace){return r.fromArray(this.spaces[a].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,a,u){return r.copy(this.spaces[u].fromXYZ).multiply(this.spaces[a].toXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace}},e=[0.64,0.33,0.3,0.6,0.15,0.06],i=[0.2126,0.7152,0.0722],s=[0.3127,0.329];return t.define({["srgb-linear"]:{primaries:e,whitePoint:s,transfer:"linear",toXYZ:jh,fromXYZ:tu,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:e,whitePoint:s,transfer:"srgb",toXYZ:jh,fromXYZ:tu,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),t}var y=Wp();function Ws(t){return t<0.04045?t*0.0773993808:Math.pow(t*0.9478672986+0.0521327014,2.4)}function Wr(t){return t<0.0031308?t*12.92:1.055*Math.pow(t,0.41666)-0.055}var Rr;class Jc{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src))return t.src;if(typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{if(Rr===void 0)Rr=Xr("canvas");Rr.width=t.width,Rr.height=t.height;let s=Rr.getContext("2d");if(t instanceof ImageData)s.putImageData(t,0,0);else s.drawImage(t,0,0,t.width,t.height);i=Rr}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Xr("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ws(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)e[i]=Math.floor(Ws(e[i]/255)*255);else e[i]=Ws(e[i]);return{data:e,width:t.width,height:t.height}}else return Yn("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}var Xp=0;class Io{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Xp++}),this.uuid=Ls(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)t.set(e.videoWidth,e.videoHeight,0);else if(typeof VideoFrame<"u"&&e instanceof VideoFrame)t.set(e.displayWidth,e.displayHeight,0);else if(e!==null)t.set(e.width||0,e.height||0,e.depth||0);else t.set(0,0,0);return t}set needsUpdate(t){if(t===!0)this.version++}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,u=s.length;a<u;a++)if(s[a].isDataTexture)r.push(Ml(s[a].image));else r.push(Ml(s[a]))}else r=Ml(s);i.url=r}if(!e)t.images[this.uuid]=i;return i}}function Ml(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap)return Jc.getDataURL(t);else if(t.data)return{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name};else return Yn("Texture: Unable to serialize Texture."),{}}var qp=0,bl=new n;class S extends Ps{constructor(t=S.DEFAULT_IMAGE,e=S.DEFAULT_MAPPING,i=1001,s=1001,r=1006,a=1008,u=1023,f=1009,x=S.DEFAULT_ANISOTROPY,A=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:qp++}),this.uuid=Ls(),this.name="",this.source=new Io(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=x,this.format=u,this.internalFormat=null,this.type=f,this.offset=new l(0,0),this.repeat=new l(1,1),this.center=new l(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ei,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=A,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=t&&t.depth&&t.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(bl).x}get height(){return this.source.getSize(bl).y}get depth(){return this.source.getSize(bl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Yn(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Yn(`Texture.setValues(): property '${e}' does not exist.`);continue}if(s&&i&&(s.isVector2&&i.isVector2))s.copy(i);else if(s&&i&&(s.isVector3&&i.isVector3))s.copy(i);else if(s&&i&&(s.isMatrix3&&i.isMatrix3))s.copy(i);else this[e]=i}}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)i.userData=this.userData;if(!e)t.textures[this.uuid]=i;return i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case 1000:t.x=t.x-Math.floor(t.x);break;case 1001:t.x=t.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.x)%2)===1)t.x=Math.ceil(t.x)-t.x;else t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case 1000:t.y=t.y-Math.floor(t.y);break;case 1001:t.y=t.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.y)%2)===1)t.y=Math.ceil(t.y)-t.y;else t.y=t.y-Math.floor(t.y);break}if(this.flipY)t.y=1-t.y;return t}set needsUpdate(t){if(t===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(t){if(t===!0)this.pmremVersion++}}S.DEFAULT_IMAGE=null;S.DEFAULT_MAPPING=300;S.DEFAULT_ANISOTROPY=1;class b{static{this.prototype.isVector4=!0}constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);if(e<0.0001)this.x=1,this.y=0,this.z=0;else this.x=t.x/e,this.y=t.y/e,this.z=t.z/e;return this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,a=0.01,u=0.1,f=t.elements,x=f[0],A=f[4],L=f[8],D=f[1],R=f[5],V=f[9],rt=f[2],Ct=f[6],j=f[10];if(Math.abs(A-D)<0.01&&Math.abs(L-rt)<0.01&&Math.abs(V-Ct)<0.01){if(Math.abs(A+D)<0.1&&Math.abs(L+rt)<0.1&&Math.abs(V+Ct)<0.1&&Math.abs(x+R+j-3)<0.1)return this.set(1,0,0,0),this;e=Math.PI;let ft=(x+1)/2,Pt=(R+1)/2,pt=(j+1)/2,Nt=(A+D)/4,se=(L+rt)/4,nt=(V+Ct)/4;if(ft>Pt&&ft>pt)if(ft<0.01)i=0,s=0.707106781,r=0.707106781;else i=Math.sqrt(ft),s=Nt/i,r=se/i;else if(Pt>pt)if(Pt<0.01)i=0.707106781,s=0,r=0.707106781;else s=Math.sqrt(Pt),i=Nt/s,r=nt/s;else if(pt<0.01)i=0.707106781,s=0.707106781,r=0;else r=Math.sqrt(pt),i=se/r,s=nt/r;return this.set(i,s,r,e),this}let it=Math.sqrt((Ct-V)*(Ct-V)+(L-rt)*(L-rt)+(D-A)*(D-A));if(Math.abs(it)<0.001)it=1;return this.x=(Ct-V)/it,this.y=(L-rt)/it,this.z=(D-A)/it,this.w=Math.acos((x+R+j-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ti(this.x,t.x,e.x),this.y=ti(this.y,t.y,e.y),this.z=ti(this.z,t.z,e.z),this.w=ti(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ti(this.x,t,e),this.y=ti(this.y,t,e),this.z=ti(this.z,t,e),this.w=ti(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ti(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class $c extends Ps{constructor(t=1,e=1,i={}){super();i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new b(0,0,t,e),this.scissorTest=!1,this.viewport=new b(0,0,t,e),this.textures=[];let s=i.count;for(let r=0;r<s;r++)this.textures[r]=new S({width:t,height:e,depth:i.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(t.mapping!==void 0)e.mapping=t.mapping;if(t.wrapS!==void 0)e.wrapS=t.wrapS;if(t.wrapT!==void 0)e.wrapT=t.wrapT;if(t.wrapR!==void 0)e.wrapR=t.wrapR;if(t.magFilter!==void 0)e.magFilter=t.magFilter;if(t.minFilter!==void 0)e.minFilter=t.minFilter;if(t.format!==void 0)e.format=t.format;if(t.type!==void 0)e.type=t.type;if(t.anisotropy!==void 0)e.anisotropy=t.anisotropy;if(t.colorSpace!==void 0)e.colorSpace=t.colorSpace;if(t.flipY!==void 0)e.flipY=t.flipY;if(t.generateMipmaps!==void 0)e.generateMipmaps=t.generateMipmaps;if(t.mipmapsAutoUpdate!==void 0)e.mipmapsAutoUpdate=t.mipmapsAutoUpdate;if(t.internalFormat!==void 0)e.internalFormat=t.internalFormat;for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(t!==null&&t.renderTarget===null)t.renderTarget=this;this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)if(this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0)this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Io(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ne extends $c{constructor(t=1,e=1,i={}){super(t,e,i);this.isWebGLRenderTarget=!0}}class Da extends S{constructor(t=null,e=1,i=1,s=1){super(null);this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Kc extends S{constructor(t=null,e=1,i=1,s=1){super(null);this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}class o{static{this.prototype.isMatrix4=!0}constructor(t,e,i,s,r,a,u,f,x,A,L,D,R,V,rt,Ct){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0)this.set(t,e,i,s,r,a,u,f,x,A,L,D,R,V,rt,Ct)}set(t,e,i,s,r,a,u,f,x,A,L,D,R,V,rt,Ct){let j=this.elements;return j[0]=t,j[4]=e,j[8]=i,j[12]=s,j[1]=r,j[5]=a,j[9]=u,j[13]=f,j[2]=x,j[6]=A,j[10]=L,j[14]=D,j[3]=R,j[7]=V,j[11]=rt,j[15]=Ct,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new o().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){if(this.determinantAffine()===0)return t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this;return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,s=1/Cr.setFromMatrixColumn(t,0).length(),r=1/Cr.setFromMatrixColumn(t,1).length(),a=1/Cr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,{x:i,y:s,z:r}=t,a=Math.cos(i),u=Math.sin(i),f=Math.cos(s),x=Math.sin(s),A=Math.cos(r),L=Math.sin(r);if(t.order==="XYZ"){let D=a*A,R=a*L,V=u*A,rt=u*L;e[0]=f*A,e[4]=-f*L,e[8]=x,e[1]=R+V*x,e[5]=D-rt*x,e[9]=-u*f,e[2]=rt-D*x,e[6]=V+R*x,e[10]=a*f}else if(t.order==="YXZ"){let D=f*A,R=f*L,V=x*A,rt=x*L;e[0]=D+rt*u,e[4]=V*u-R,e[8]=a*x,e[1]=a*L,e[5]=a*A,e[9]=-u,e[2]=R*u-V,e[6]=rt+D*u,e[10]=a*f}else if(t.order==="ZXY"){let D=f*A,R=f*L,V=x*A,rt=x*L;e[0]=D-rt*u,e[4]=-a*L,e[8]=V+R*u,e[1]=R+V*u,e[5]=a*A,e[9]=rt-D*u,e[2]=-a*x,e[6]=u,e[10]=a*f}else if(t.order==="ZYX"){let D=a*A,R=a*L,V=u*A,rt=u*L;e[0]=f*A,e[4]=V*x-R,e[8]=D*x+rt,e[1]=f*L,e[5]=rt*x+D,e[9]=R*x-V,e[2]=-x,e[6]=u*f,e[10]=a*f}else if(t.order==="YZX"){let D=a*f,R=a*x,V=u*f,rt=u*x;e[0]=f*A,e[4]=rt-D*L,e[8]=V*L+R,e[1]=L,e[5]=a*A,e[9]=-u*A,e[2]=-x*A,e[6]=R*L+V,e[10]=D-rt*L}else if(t.order==="XZY"){let D=a*f,R=a*x,V=u*f,rt=u*x;e[0]=f*A,e[4]=-L,e[8]=x*A,e[1]=D*L+rt,e[5]=a*A,e[9]=R*L-V,e[2]=V*L-R,e[6]=u*A,e[10]=rt*L+D}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Yp,t,Zp)}lookAt(t,e,i){let s=this.elements;if(us.subVectors(t,e),us.lengthSq()===0)us.z=1;if(us.normalize(),Zs.crossVectors(i,us),Zs.lengthSq()===0){if(Math.abs(i.z)===1)us.x+=0.0001;else us.z+=0.0001;us.normalize(),Zs.crossVectors(i,us)}return Zs.normalize(),Qo.crossVectors(us,Zs),s[0]=Zs.x,s[4]=Qo.x,s[8]=us.x,s[1]=Zs.y,s[5]=Qo.y,s[9]=us.y,s[2]=Zs.z,s[6]=Qo.z,s[10]=us.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],u=i[4],f=i[8],x=i[12],A=i[1],L=i[5],D=i[9],R=i[13],V=i[2],rt=i[6],Ct=i[10],j=i[14],it=i[3],ft=i[7],Pt=i[11],pt=i[15],Nt=s[0],se=s[4],nt=s[8],Rt=s[12],re=s[1],be=s[5],he=s[9],Pe=s[13],$e=s[2],fe=s[6],sn=s[10],un=s[14],rn=s[3],wn=s[7],mn=s[11],Sn=s[15];return r[0]=a*Nt+u*re+f*$e+x*rn,r[4]=a*se+u*be+f*fe+x*wn,r[8]=a*nt+u*he+f*sn+x*mn,r[12]=a*Rt+u*Pe+f*un+x*Sn,r[1]=A*Nt+L*re+D*$e+R*rn,r[5]=A*se+L*be+D*fe+R*wn,r[9]=A*nt+L*he+D*sn+R*mn,r[13]=A*Rt+L*Pe+D*un+R*Sn,r[2]=V*Nt+rt*re+Ct*$e+j*rn,r[6]=V*se+rt*be+Ct*fe+j*wn,r[10]=V*nt+rt*he+Ct*sn+j*mn,r[14]=V*Rt+rt*Pe+Ct*un+j*Sn,r[3]=it*Nt+ft*re+Pt*$e+pt*rn,r[7]=it*se+ft*be+Pt*fe+pt*wn,r[11]=it*nt+ft*he+Pt*sn+pt*mn,r[15]=it*Rt+ft*Pe+Pt*un+pt*Sn,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],u=t[5],f=t[9],x=t[13],A=t[2],L=t[6],D=t[10],R=t[14],V=t[3],rt=t[7],Ct=t[11],j=t[15],it=f*R-x*D,ft=u*R-x*L,Pt=u*D-f*L,pt=a*R-x*A,Nt=a*D-f*A,se=a*L-u*A;return e*(rt*it-Ct*ft+j*Pt)-i*(V*it-Ct*pt+j*Nt)+s*(V*ft-rt*pt+j*se)-r*(V*Pt-rt*Nt+Ct*se)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[1],a=t[5],u=t[9],f=t[2],x=t[6],A=t[10];return e*(a*A-u*x)-i*(r*A-u*f)+s*(r*x-a*f)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;if(t.isVector3)s[12]=t.x,s[13]=t.y,s[14]=t.z;else s[12]=t,s[13]=e,s[14]=i;return this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],u=t[5],f=t[6],x=t[7],A=t[8],L=t[9],D=t[10],R=t[11],V=t[12],rt=t[13],Ct=t[14],j=t[15],it=e*u-i*a,ft=e*f-s*a,Pt=e*x-r*a,pt=i*f-s*u,Nt=i*x-r*u,se=s*x-r*f,nt=A*rt-L*V,Rt=A*Ct-D*V,re=A*j-R*V,be=L*Ct-D*rt,he=L*j-R*rt,Pe=D*j-R*Ct,$e=it*Pe-ft*he+Pt*be+pt*re-Nt*Rt+se*nt;if($e===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let fe=1/$e;return t[0]=(u*Pe-f*he+x*be)*fe,t[1]=(s*he-i*Pe-r*be)*fe,t[2]=(rt*se-Ct*Nt+j*pt)*fe,t[3]=(D*Nt-L*se-R*pt)*fe,t[4]=(f*re-a*Pe-x*Rt)*fe,t[5]=(e*Pe-s*re+r*Rt)*fe,t[6]=(Ct*Pt-V*se-j*ft)*fe,t[7]=(A*se-D*Pt+R*ft)*fe,t[8]=(a*he-u*re+x*nt)*fe,t[9]=(i*re-e*he-r*nt)*fe,t[10]=(V*Nt-rt*Pt+j*it)*fe,t[11]=(L*Pt-A*Nt-R*it)*fe,t[12]=(u*Rt-a*be-f*nt)*fe,t[13]=(e*be-i*Rt+s*nt)*fe,t[14]=(rt*ft-V*pt-Ct*it)*fe,t[15]=(A*pt-L*ft+D*it)*fe,this}scale(t){let e=this.elements,{x:i,y:s,z:r}=t;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){if(t.isVector3)this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1);else this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1);return this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,{x:a,y:u,z:f}=t,x=r*a,A=r*u;return this.set(x*a+i,x*u-s*f,x*f+s*u,0,x*u+s*f,A*u+i,A*f-s*a,0,x*f-s*u,A*f+s*a,r*f*f+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,{_x:r,_y:a,_z:u,_w:f}=e,x=r+r,A=a+a,L=u+u,D=r*x,R=r*A,V=r*L,rt=a*A,Ct=a*L,j=u*L,it=f*x,ft=f*A,Pt=f*L,{x:pt,y:Nt,z:se}=i;return s[0]=(1-(rt+j))*pt,s[1]=(R+Pt)*pt,s[2]=(V-ft)*pt,s[3]=0,s[4]=(R-Pt)*Nt,s[5]=(1-(D+j))*Nt,s[6]=(Ct+it)*Nt,s[7]=0,s[8]=(V+ft)*se,s[9]=(Ct-it)*se,s[10]=(1-(D+rt))*se,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=Cr.set(s[0],s[1],s[2]).length(),u=Cr.set(s[4],s[5],s[6]).length(),f=Cr.set(s[8],s[9],s[10]).length();if(r<0)a=-a;vs.copy(this);let x=1/a,A=1/u,L=1/f;return vs.elements[0]*=x,vs.elements[1]*=x,vs.elements[2]*=x,vs.elements[4]*=A,vs.elements[5]*=A,vs.elements[6]*=A,vs.elements[8]*=L,vs.elements[9]*=L,vs.elements[10]*=L,e.setFromRotationMatrix(vs),i.x=a,i.y=u,i.z=f,this}makePerspective(t,e,i,s,r,a,u=2000,f=!1){let x=this.elements,A=2*r/(e-t),L=2*r/(i-s),D=(e+t)/(e-t),R=(i+s)/(i-s),V,rt;if(f)V=r/(a-r),rt=a*r/(a-r);else if(u===2000)V=-(a+r)/(a-r),rt=-2*a*r/(a-r);else if(u===2001)V=-a/(a-r),rt=-a*r/(a-r);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return x[0]=A,x[4]=0,x[8]=D,x[12]=0,x[1]=0,x[5]=L,x[9]=R,x[13]=0,x[2]=0,x[6]=0,x[10]=V,x[14]=rt,x[3]=0,x[7]=0,x[11]=-1,x[15]=0,this}makeOrthographic(t,e,i,s,r,a,u=2000,f=!1){let x=this.elements,A=2/(e-t),L=2/(i-s),D=-(e+t)/(e-t),R=-(i+s)/(i-s),V,rt;if(f)V=1/(a-r),rt=a/(a-r);else if(u===2000)V=-2/(a-r),rt=-(a+r)/(a-r);else if(u===2001)V=-1/(a-r),rt=-r/(a-r);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return x[0]=A,x[4]=0,x[8]=0,x[12]=D,x[1]=0,x[5]=L,x[9]=0,x[13]=R,x[2]=0,x[6]=0,x[10]=V,x[14]=rt,x[3]=0,x[7]=0,x[11]=0,x[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}var Cr=new n,vs=new o,Yp=new n(0,0,0),Zp=new n(1,1,1),Zs=new n,Qo=new n,us=new n,eu=new o,nu=new H;class bs{constructor(t=0,e=0,i=0,s=bs.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],a=s[4],u=s[8],f=s[1],x=s[5],A=s[9],L=s[2],D=s[6],R=s[10];switch(e){case"XYZ":if(this._y=Math.asin(ti(u,-1,1)),Math.abs(u)<0.9999999)this._x=Math.atan2(-A,R),this._z=Math.atan2(-a,r);else this._x=Math.atan2(D,x),this._z=0;break;case"YXZ":if(this._x=Math.asin(-ti(A,-1,1)),Math.abs(A)<0.9999999)this._y=Math.atan2(u,R),this._z=Math.atan2(f,x);else this._y=Math.atan2(-L,r),this._z=0;break;case"ZXY":if(this._x=Math.asin(ti(D,-1,1)),Math.abs(D)<0.9999999)this._y=Math.atan2(-L,R),this._z=Math.atan2(-a,x);else this._y=0,this._z=Math.atan2(f,r);break;case"ZYX":if(this._y=Math.asin(-ti(L,-1,1)),Math.abs(L)<0.9999999)this._x=Math.atan2(D,R),this._z=Math.atan2(f,r);else this._x=0,this._z=Math.atan2(-a,x);break;case"YZX":if(this._z=Math.asin(ti(f,-1,1)),Math.abs(f)<0.9999999)this._x=Math.atan2(-A,x),this._y=Math.atan2(-L,r);else this._x=0,this._y=Math.atan2(u,R);break;case"XZY":if(this._z=Math.asin(-ti(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(D,x),this._y=Math.atan2(u,r);else this._x=Math.atan2(-A,R),this._y=0;break;default:Yn("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}if(this._order=e,i===!0)this._onChangeCallback();return this}setFromQuaternion(t,e,i){return eu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(eu,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return nu.setFromEuler(this),this.setFromQuaternion(nu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){if(this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0)this._order=t[3];return this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}bs.DEFAULT_ORDER="XYZ";class Po{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}var Jp=0,iu=new n,Ir=new H,Bs=new o,jo=new n,po=new n,$p=new n,Kp=new H,su=new n(1,0,0),ru=new n(0,1,0),ou=new n(0,0,1),au={type:"added"},Qp={type:"removed"},Pr={type:"childadded",child:null},Tl={type:"childremoved",child:null};class M extends Ps{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jp++}),this.uuid=Ls(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=M.DEFAULT_UP.clone();let t=new n,e=new bs,i=new H,s=new n(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new o},normalMatrix:{value:new ei}}),this.matrix=new o,this.matrixWorld=new o,this.matrixAutoUpdate=M.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=M.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Po,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ir.setFromAxisAngle(t,e),this.quaternion.multiply(Ir),this}rotateOnWorldAxis(t,e){return Ir.setFromAxisAngle(t,e),this.quaternion.premultiply(Ir),this}rotateX(t){return this.rotateOnAxis(su,t)}rotateY(t){return this.rotateOnAxis(ru,t)}rotateZ(t){return this.rotateOnAxis(ou,t)}translateOnAxis(t,e){return iu.copy(t).applyQuaternion(this.quaternion),this.position.add(iu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(su,t)}translateY(t){return this.translateOnAxis(ru,t)}translateZ(t){return this.translateOnAxis(ou,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Bs.copy(this.matrixWorld).invert())}lookAt(t,e,i){if(t.isVector3)jo.copy(t);else jo.set(t,e,i);let s=this.parent;if(this.updateWorldMatrix(!0,!1),po.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)Bs.lookAt(po,jo,this.up);else Bs.lookAt(jo,po,this.up);if(this.quaternion.setFromRotationMatrix(Bs),s)Bs.extractRotation(s.matrixWorld),Ir.setFromRotationMatrix(Bs),this.quaternion.premultiply(Ir.invert())}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}if(t===this)return jn("Object3D.add: object can't be added as a child of itself.",t),this;if(t&&t.isObject3D)t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(au),Pr.child=t,this.dispatchEvent(Pr),Pr.child=null;else jn("Object3D.add: object not an instance of THREE.Object3D.",t);return this}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);if(e!==-1)t.parent=null,this.children.splice(e,1),t.dispatchEvent(Qp),Tl.child=t,this.dispatchEvent(Tl),Tl.child=null;return this}removeFromParent(){let t=this.parent;if(t!==null)t.remove(this);return this}clear(){return this.remove(...this.children)}attach(t){if(this.updateWorldMatrix(!0,!1),Bs.copy(this.matrixWorld).invert(),t.parent!==null)t.parent.updateWorldMatrix(!0,!1),Bs.multiply(t.parent.matrixWorld);return t.applyMatrix4(Bs),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(au),Pr.child=t,this.dispatchEvent(Pr),Pr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}return}getObjectsByProperty(t,e,i=[]){if(this[t]===e)i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(po,t,$p),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(po,Kp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;if(e!==null)t(e),e.traverseAncestors(t)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let{x:e,y:i,z:s}=t,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*s,r[13]+=i-r[1]*e-r[5]*i-r[9]*s,r[14]+=s-r[2]*e-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||t){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,t=!0}let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let s=this.parent;if(t===!0&&s!==null)s.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||i){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,i=!0}if(e===!0){let r=this.children;for(let a=0,u=r.length;a<u;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t==="string",i={};if(e)t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let s={};if(s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)s.userData=this.userData;if(s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null)s.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)s.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)s.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map((u)=>({...u,boundingBox:u.boundingBox?u.boundingBox.toJSON():void 0,boundingSphere:u.boundingSphere?u.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map((u)=>({...u})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null)s.colorsTexture=this._colorsTexture.toJSON(t);if(this.boundingSphere!==null)s.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)s.boundingBox=this.boundingBox.toJSON()}function r(u,f){if(u[f.uuid]===void 0)u[f.uuid]=f.toJSON(t);return f.uuid}if(this.isScene){if(this.background){if(this.background.isColor)s.background=this.background.toJSON();else if(this.background.isTexture)s.background=this.background.toJSON(t).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)s.environment=this.environment.toJSON(t).uuid}else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){let f=u.shapes;if(Array.isArray(f))for(let x=0,A=f.length;x<A;x++){let L=f[x];r(t.shapes,L)}else r(t.shapes,f)}}if(this.isSkinnedMesh){if(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let u=[];for(let f=0,x=this.material.length;f<x;f++)u.push(r(t.materials,this.material[f]));s.material=u}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let u=0;u<this.children.length;u++)s.children.push(this.children[u].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let u=0;u<this.animations.length;u++){let f=this.animations[u];s.animations.push(r(t.animations,f))}}if(e){let u=a(t.geometries),f=a(t.materials),x=a(t.textures),A=a(t.images),L=a(t.shapes),D=a(t.skeletons),R=a(t.animations),V=a(t.nodes);if(u.length>0)i.geometries=u;if(f.length>0)i.materials=f;if(x.length>0)i.textures=x;if(A.length>0)i.images=A;if(L.length>0)i.shapes=L;if(D.length>0)i.skeletons=D;if(R.length>0)i.animations=R;if(V.length>0)i.nodes=V}return i.object=s,i;function a(u){let f=[];for(let x in u){let A=u[x];delete A.metadata,f.push(A)}return f}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}M.DEFAULT_UP=new n(0,1,0);M.DEFAULT_MATRIX_AUTO_UPDATE=!0;M.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class C extends M{constructor(){super();this.isGroup=!0,this.type="Group"}}var jp={type:"move"};class Lo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new C,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new C,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new n,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new n;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new C,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new n,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new n,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(t){if(this._targetRay!==null)this._targetRay.dispatchEvent(t);if(this._grip!==null)this._grip.dispatchEvent(t);if(this._hand!==null)this._hand.dispatchEvent(t);return this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){if(this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(t,e,i){let s=null,r=null,a=null,u=this._targetRay,f=this._grip,x=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(x&&t.hand){a=!0;for(let rt of t.hand.values()){let Ct=e.getJointPose(rt,i),j=this._getHandJoint(x,rt);if(Ct!==null)j.matrix.fromArray(Ct.transform.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale),j.matrixWorldNeedsUpdate=!0,j.jointRadius=Ct.radius;j.visible=Ct!==null}let A=x.joints["index-finger-tip"],L=x.joints["thumb-tip"],D=A.position.distanceTo(L.position),R=0.02,V=0.005;if(x.inputState.pinching&&D>R+V)x.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this});else if(!x.inputState.pinching&&D<=R-V)x.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this})}else if(f!==null&&t.gripSpace){if(r=e.getPose(t.gripSpace,i),r!==null){if(f.matrix.fromArray(r.transform.matrix),f.matrix.decompose(f.position,f.quaternion,f.scale),f.matrixWorldNeedsUpdate=!0,r.linearVelocity)f.hasLinearVelocity=!0,f.linearVelocity.copy(r.linearVelocity);else f.hasLinearVelocity=!1;if(r.angularVelocity)f.hasAngularVelocity=!0,f.angularVelocity.copy(r.angularVelocity);else f.hasAngularVelocity=!1;if(f.eventsEnabled)f.dispatchEvent({type:"gripUpdated",data:t,target:this})}}if(u!==null){if(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null)s=r;if(s!==null){if(u.matrix.fromArray(s.transform.matrix),u.matrix.decompose(u.position,u.quaternion,u.scale),u.matrixWorldNeedsUpdate=!0,s.linearVelocity)u.hasLinearVelocity=!0,u.linearVelocity.copy(s.linearVelocity);else u.hasLinearVelocity=!1;if(s.angularVelocity)u.hasAngularVelocity=!0,u.angularVelocity.copy(s.angularVelocity);else u.hasAngularVelocity=!1;this.dispatchEvent(jp)}}}if(u!==null)u.visible=s!==null;if(f!==null)f.visible=r!==null;if(x!==null)x.visible=a!==null;return this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new C;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}var Ff={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Js={h:0,s:0,l:0},ta={h:0,s:0,l:0};function Al(t,e,i){if(i<0)i+=1;if(i>1)i-=1;if(i<0.16666666666666666)return t+(e-t)*6*i;if(i<0.5)return e;if(i<0.6666666666666666)return t+(e-t)*6*(0.6666666666666666-i);return t}class c{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;if(s&&s.isColor)this.copy(s);else if(typeof s==="number")this.setHex(s);else if(typeof s==="string")this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e="srgb"){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,y.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=y.workingColorSpace){return this.r=t,this.g=e,this.b=i,y.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=y.workingColorSpace){if(t=Xc(t,1),e=ti(e,0,1),i=ti(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=0.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=Al(a,r,t+0.3333333333333333),this.g=Al(a,r,t),this.b=Al(a,r,t-0.3333333333333333)}return y.colorSpaceToWorking(this,s),this}setStyle(t,e="srgb"){function i(r){if(r===void 0)return;if(parseFloat(r)<1)Yn("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],u=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(u))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(u))return i(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(u))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Yn("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);else if(a===6)return this.setHex(parseInt(r,16),e);else Yn("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e="srgb"){let i=Ff[t.toLowerCase()];if(i!==void 0)this.setHex(i,e);else Yn("Color: Unknown color "+t);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ws(t.r),this.g=Ws(t.g),this.b=Ws(t.b),this}copyLinearToSRGB(t){return this.r=Wr(t.r),this.g=Wr(t.g),this.b=Wr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t="srgb"){return y.workingToColorSpace(Qi.copy(this),t),Math.round(ti(Qi.r*255,0,255))*65536+Math.round(ti(Qi.g*255,0,255))*256+Math.round(ti(Qi.b*255,0,255))}getHexString(t="srgb"){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=y.workingColorSpace){y.workingToColorSpace(Qi.copy(this),e);let{r:i,g:s,b:r}=Qi,a=Math.max(i,s,r),u=Math.min(i,s,r),f,x,A=(u+a)/2;if(u===a)f=0,x=0;else{let L=a-u;switch(x=A<=0.5?L/(a+u):L/(2-a-u),a){case i:f=(s-r)/L+(s<r?6:0);break;case s:f=(r-i)/L+2;break;case r:f=(i-s)/L+4;break}f/=6}return t.h=f,t.s=x,t.l=A,t}getRGB(t,e=y.workingColorSpace){return y.workingToColorSpace(Qi.copy(this),e),t.r=Qi.r,t.g=Qi.g,t.b=Qi.b,t}getStyle(t="srgb"){y.workingToColorSpace(Qi.copy(this),t);let{r:e,g:i,b:s}=Qi;if(t!=="srgb")return`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`;return`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(Js),this.setHSL(Js.h+t,Js.s+e,Js.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Js),t.getHSL(ta);let i=To(Js.h,ta.h,e),s=To(Js.s,ta.s,e),r=To(Js.l,ta.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var Qi=new c;c.NAMES=Ff;class St{constructor(t,e=0.00025){this.isFogExp2=!0,this.name="",this.color=new c(t),this.density=e}clone(){return new St(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class ce extends M{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new bs,this.environmentIntensity=1,this.environmentRotation=new bs,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);if(this.fog!==null)e.object.fog=this.fog.toJSON();return e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}var Ss=new n,zs=new n,El=new n,Gs=new n,Lr=new n,Nr=new n,lu=new n,wl=new n,Rl=new n,Cl=new n,Il=new b,Pl=new b,Ll=new b;class Oi{constructor(t=new n,e=new n,i=new n){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),Ss.subVectors(t,e),s.cross(Ss);let r=s.lengthSq();if(r>0)return s.multiplyScalar(1/Math.sqrt(r));return s.set(0,0,0)}static getBarycoord(t,e,i,s,r){Ss.subVectors(s,e),zs.subVectors(i,e),El.subVectors(t,e);let a=Ss.dot(Ss),u=Ss.dot(zs),f=Ss.dot(El),x=zs.dot(zs),A=zs.dot(El),L=a*x-u*u;if(L===0)return r.set(0,0,0),null;let D=1/L,R=(x*f-u*A)*D,V=(a*A-u*f)*D;return r.set(1-R-V,V,R)}static containsPoint(t,e,i,s){if(this.getBarycoord(t,e,i,s,Gs)===null)return!1;return Gs.x>=0&&Gs.y>=0&&Gs.x+Gs.y<=1}static getInterpolation(t,e,i,s,r,a,u,f){if(this.getBarycoord(t,e,i,s,Gs)===null){if(f.x=0,f.y=0,"z"in f)f.z=0;if("w"in f)f.w=0;return null}return f.setScalar(0),f.addScaledVector(r,Gs.x),f.addScaledVector(a,Gs.y),f.addScaledVector(u,Gs.z),f}static getInterpolatedAttribute(t,e,i,s,r,a){return Il.setScalar(0),Pl.setScalar(0),Ll.setScalar(0),Il.fromBufferAttribute(t,e),Pl.fromBufferAttribute(t,i),Ll.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Il,r.x),a.addScaledVector(Pl,r.y),a.addScaledVector(Ll,r.z),a}static isFrontFacing(t,e,i,s){return Ss.subVectors(i,e),zs.subVectors(t,e),Ss.cross(zs).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ss.subVectors(this.c,this.b),zs.subVectors(this.a,this.b),Ss.cross(zs).length()*0.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(t){return Oi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Oi.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return Oi.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return Oi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Oi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,a,u;Lr.subVectors(s,i),Nr.subVectors(r,i),wl.subVectors(t,i);let f=Lr.dot(wl),x=Nr.dot(wl);if(f<=0&&x<=0)return e.copy(i);Rl.subVectors(t,s);let A=Lr.dot(Rl),L=Nr.dot(Rl);if(A>=0&&L<=A)return e.copy(s);let D=f*L-A*x;if(D<=0&&f>=0&&A<=0&&f-A>0)return a=f/(f-A),e.copy(i).addScaledVector(Lr,a);Cl.subVectors(t,r);let R=Lr.dot(Cl),V=Nr.dot(Cl);if(V>=0&&R<=V)return e.copy(r);let rt=R*x-f*V;if(rt<=0&&x>=0&&V<=0)return u=x/(x-V),e.copy(i).addScaledVector(Nr,u);let Ct=A*V-R*L;if(Ct<=0&&L-A>=0&&R-V>=0)return lu.subVectors(r,s),u=(L-A)/(L-A+(R-V)),e.copy(s).addScaledVector(lu,u);let j=1/(Ct+rt+D);return a=rt*j,u=D*j,e.copy(i).addScaledVector(Lr,a).addScaledVector(Nr,u)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class p{constructor(t=new n(1/0,1/0,1/0),e=new n(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Ms.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Ms.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Ms.copy(e).multiplyScalar(0.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let a=0,u=r.count;a<u;a++){if(t.isMesh===!0)t.getVertexPosition(a,Ms);else Ms.fromBufferAttribute(r,a);Ms.applyMatrix4(t.matrixWorld),this.expandByPoint(Ms)}else{if(t.boundingBox!==void 0){if(t.boundingBox===null)t.computeBoundingBox();ea.copy(t.boundingBox)}else{if(i.boundingBox===null)i.computeBoundingBox();ea.copy(i.boundingBox)}ea.applyMatrix4(t.matrixWorld),this.union(ea)}}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ms),Ms.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;if(t.normal.x>0)e=t.normal.x*this.min.x,i=t.normal.x*this.max.x;else e=t.normal.x*this.max.x,i=t.normal.x*this.min.x;if(t.normal.y>0)e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y;else e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y;if(t.normal.z>0)e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z;else e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z;return e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(mo),na.subVectors(this.max,mo),Dr.subVectors(t.a,mo),Ur.subVectors(t.b,mo),Fr.subVectors(t.c,mo),$s.subVectors(Ur,Dr),Ks.subVectors(Fr,Ur),fr.subVectors(Dr,Fr);let e=[0,-$s.z,$s.y,0,-Ks.z,Ks.y,0,-fr.z,fr.y,$s.z,0,-$s.x,Ks.z,0,-Ks.x,fr.z,0,-fr.x,-$s.y,$s.x,0,-Ks.y,Ks.x,0,-fr.y,fr.x,0];if(!Nl(e,Dr,Ur,Fr,na))return!1;if(e=[1,0,0,0,1,0,0,0,1],!Nl(e,Dr,Ur,Fr,na))return!1;return ia.crossVectors($s,Ks),e=[ia.x,ia.y,ia.z],Nl(e,Dr,Ur,Fr,na)}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ms).distanceTo(t)}getBoundingSphere(t){if(this.isEmpty())t.makeEmpty();else this.getCenter(t.center),t.radius=this.getSize(Ms).length()*0.5;return t}intersect(t){if(this.min.max(t.min),this.max.min(t.max),this.isEmpty())this.makeEmpty();return this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){if(this.isEmpty())return this;return ks[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ks[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ks[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ks[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ks[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ks[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ks[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ks[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ks),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}var ks=[new n,new n,new n,new n,new n,new n,new n,new n],Ms=new n,ea=new p,Dr=new n,Ur=new n,Fr=new n,$s=new n,Ks=new n,fr=new n,mo=new n,na=new n,ia=new n,dr=new n;function Nl(t,e,i,s,r){for(let a=0,u=t.length-3;a<=u;a+=3){dr.fromArray(t,a);let f=r.x*Math.abs(dr.x)+r.y*Math.abs(dr.y)+r.z*Math.abs(dr.z),x=e.dot(dr),A=i.dot(dr),L=s.dot(dr);if(Math.max(-Math.max(x,A,L),Math.min(x,A,L))>f)return!1}return!0}var Fi=new n,sa=new l,tm=0;class _ extends Ps{constructor(t,e,i=!1){super();if(Array.isArray(t))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:tm++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=t!==void 0?Na(t):void 0}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)sa.fromBufferAttribute(this,e),sa.applyMatrix3(t),this.setXY(e,sa.x,sa.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Fi.fromBufferAttribute(this,e),Fi.applyMatrix3(t),this.setXYZ(e,Fi.x,Fi.y,Fi.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Fi.fromBufferAttribute(this,e),Fi.applyMatrix4(t),this.setXYZ(e,Fi.x,Fi.y,Fi.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Fi.fromBufferAttribute(this,e),Fi.applyNormalMatrix(t),this.setXYZ(e,Fi.x,Fi.y,Fi.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Fi.fromBufferAttribute(this,e),Fi.transformDirection(t),this.setXYZ(e,Fi.x,Fi.y,Fi.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];if(this.normalized)i=this._denormalize(i);return i}setComponent(t,e,i){if(this.normalized)i=this._normalize(i);return this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];if(this.normalized)e=this._denormalize(e);return e}setX(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];if(this.normalized)e=this._denormalize(e);return e}setY(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];if(this.normalized)e=this._denormalize(e);return e}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];if(this.normalized)e=this._denormalize(e);return e}setW(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i);return this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s);return this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r);return this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Yc(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Zc(t,this.array)}}class Ua extends _{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class Fa extends _{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class g extends _{constructor(t,e,i){super(new Float32Array(t),e,i)}}var em=new p,go=new n,Dl=new n;class E{constructor(t=new n,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;if(e!==void 0)i.copy(e);else em.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);if(e.copy(t),i>this.radius*this.radius)e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center);return e}getBoundingBox(t){if(this.isEmpty())return t.makeEmpty(),t;return t.set(this.center,this.center),t.expandByScalar(this.radius),t}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;go.subVectors(t,this.center);let e=go.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*0.5;this.center.addScaledVector(go,s/i),this.radius+=s}return this}union(t){if(t.isEmpty())return this;if(this.isEmpty())return this.copy(t),this;if(this.center.equals(t.center)===!0)this.radius=Math.max(this.radius,t.radius);else Dl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(go.copy(t.center).add(Dl)),this.expandByPoint(go.copy(t.center).sub(Dl));return this}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}var nm=0,ms=new o,Ul=new M,Or=new n,fs=new p,_o=new p,Vi=new n;class m extends Ps{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:nm++}),this.uuid=Ls(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){if(Array.isArray(t))this.index=new((wp(t))?Fa:Ua)(t,1);else this.index=t;return this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;if(e!==void 0)e.applyMatrix4(t),e.needsUpdate=!0;let i=this.attributes.normal;if(i!==void 0){let r=new ei().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;if(s!==void 0)s.transformDirection(t),s.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(t){return ms.makeRotationFromQuaternion(t),this.applyMatrix4(ms),this}rotateX(t){return ms.makeRotationX(t),this.applyMatrix4(ms),this}rotateY(t){return ms.makeRotationY(t),this.applyMatrix4(ms),this}rotateZ(t){return ms.makeRotationZ(t),this.applyMatrix4(ms),this}translate(t,e,i){return ms.makeTranslation(t,e,i),this.applyMatrix4(ms),this}scale(t,e,i){return ms.makeScale(t,e,i),this.applyMatrix4(ms),this}lookAt(t){return Ul.lookAt(t),Ul.updateMatrix(),this.applyMatrix4(Ul.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Or).negate(),this.translate(Or.x,Or.y,Or.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new g(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}if(t.length>e.count)Yn("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");e.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new p;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){jn("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new n(-1/0,-1/0,-1/0),new n(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];if(fs.setFromBufferAttribute(r),this.morphTargetsRelative)Vi.addVectors(this.boundingBox.min,fs.min),this.boundingBox.expandByPoint(Vi),Vi.addVectors(this.boundingBox.max,fs.max),this.boundingBox.expandByPoint(Vi);else this.boundingBox.expandByPoint(fs.min),this.boundingBox.expandByPoint(fs.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))jn('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new E;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){jn("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new n,1/0);return}if(t){let i=this.boundingSphere.center;if(fs.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let u=e[r];if(_o.setFromBufferAttribute(u),this.morphTargetsRelative)Vi.addVectors(fs.min,_o.min),fs.expandByPoint(Vi),Vi.addVectors(fs.max,_o.max),fs.expandByPoint(Vi);else fs.expandByPoint(_o.min),fs.expandByPoint(_o.max)}fs.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)Vi.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Vi));if(e)for(let r=0,a=e.length;r<a;r++){let u=e[r],f=this.morphTargetsRelative;for(let x=0,A=u.count;x<A;x++){if(Vi.fromBufferAttribute(u,x),f)Or.fromBufferAttribute(t,x),Vi.add(Or);s=Math.max(s,i.distanceToSquared(Vi))}}if(this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius))jn('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){jn("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:i,normal:s,uv:r}=e,a=this.getAttribute("tangent");if(a===void 0||a.count!==i.count)a=new _(new Float32Array(4*i.count),4),this.setAttribute("tangent",a);let u=[],f=[],x=new Uint8Array(i.count);for(let Rt=0;Rt<i.count;Rt++)u[Rt]=new n,f[Rt]=new n;let A=new n,L=new n,D=new n,R=new l,V=new l,rt=new l,Ct=new n,j=new n;function it(Rt,re,be){x[Rt]=x[re]=x[be]=1,A.fromBufferAttribute(i,Rt),L.fromBufferAttribute(i,re),D.fromBufferAttribute(i,be),R.fromBufferAttribute(r,Rt),V.fromBufferAttribute(r,re),rt.fromBufferAttribute(r,be),L.sub(A),D.sub(A),V.sub(R),rt.sub(R);let he=1/(V.x*rt.y-rt.x*V.y);if(!isFinite(he))return;Ct.copy(L).multiplyScalar(rt.y).addScaledVector(D,-V.y).multiplyScalar(he),j.copy(D).multiplyScalar(V.x).addScaledVector(L,-rt.x).multiplyScalar(he),u[Rt].add(Ct),u[re].add(Ct),u[be].add(Ct),f[Rt].add(j),f[re].add(j),f[be].add(j)}let ft=this.groups;if(ft.length===0)ft=[{start:0,count:t.count}];for(let Rt=0,re=ft.length;Rt<re;++Rt){let be=ft[Rt],{start:he,count:Pe}=be;for(let $e=he,fe=he+Pe;$e<fe;$e+=3)it(t.getX($e+0),t.getX($e+1),t.getX($e+2))}let Pt=new n,pt=new n,Nt=new n,se=new n;function nt(Rt){Nt.fromBufferAttribute(s,Rt),se.copy(Nt);let re=u[Rt];Pt.copy(re),Pt.sub(Nt.multiplyScalar(Nt.dot(re))).normalize(),pt.crossVectors(se,re);let he=pt.dot(f[Rt])<0?-1:1;a.setXYZW(Rt,Pt.x,Pt.y,Pt.z,he)}for(let Rt=0,re=i.count;Rt<re;++Rt)if(x[Rt])nt(Rt);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new _(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let D=0,R=i.count;D<R;D++)i.setXYZ(D,0,0,0);let s=new n,r=new n,a=new n,u=new n,f=new n,x=new n,A=new n,L=new n;if(t)for(let D=0,R=t.count;D<R;D+=3){let V=t.getX(D+0),rt=t.getX(D+1),Ct=t.getX(D+2);s.fromBufferAttribute(e,V),r.fromBufferAttribute(e,rt),a.fromBufferAttribute(e,Ct),A.subVectors(a,r),L.subVectors(s,r),A.cross(L),u.fromBufferAttribute(i,V),f.fromBufferAttribute(i,rt),x.fromBufferAttribute(i,Ct),u.add(A),f.add(A),x.add(A),i.setXYZ(V,u.x,u.y,u.z),i.setXYZ(rt,f.x,f.y,f.z),i.setXYZ(Ct,x.x,x.y,x.z)}else for(let D=0,R=e.count;D<R;D+=3)s.fromBufferAttribute(e,D+0),r.fromBufferAttribute(e,D+1),a.fromBufferAttribute(e,D+2),A.subVectors(a,r),L.subVectors(s,r),A.cross(L),i.setXYZ(D+0,A.x,A.y,A.z),i.setXYZ(D+1,A.x,A.y,A.z),i.setXYZ(D+2,A.x,A.y,A.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Vi.fromBufferAttribute(t,e),Vi.normalize(),t.setXYZ(e,Vi.x,Vi.y,Vi.z)}toNonIndexed(){function t(u,f){let{array:x,itemSize:A,normalized:L}=u,D=new x.constructor(f.length*A),R=0,V=0;for(let rt=0,Ct=f.length;rt<Ct;rt++){if(u.isInterleavedBufferAttribute)R=f[rt]*u.data.stride+u.offset;else R=f[rt]*A;for(let j=0;j<A;j++)D[V++]=x[R++]}return new _(D,A,L)}if(this.index===null)return Yn("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new m,i=this.index.array,s=this.attributes;for(let u in s){let f=s[u],x=t(f,i);e.setAttribute(u,x)}let r=this.morphAttributes;for(let u in r){let f=[],x=r[u];for(let A=0,L=x.length;A<L;A++){let D=x[A],R=t(D,i);f.push(R)}e.morphAttributes[u]=f}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let u=0,f=a.length;u<f;u++){let x=a[u];e.addGroup(x.start,x.count,x.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0)t.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let f=this.parameters;for(let x in f)if(f[x]!==void 0)t[x]=f[x];return t}t.data={attributes:{}};let e=this.index;if(e!==null)t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)};let i=this.attributes;for(let f in i){let x=i[f];t.data.attributes[f]=x.toJSON(t.data)}let s={},r=!1;for(let f in this.morphAttributes){let x=this.morphAttributes[f],A=[];for(let L=0,D=x.length;L<D;L++){let R=x[L];A.push(R.toJSON(t.data))}if(A.length>0)s[f]=A,r=!0}if(r)t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;if(a.length>0)t.data.groups=JSON.parse(JSON.stringify(a));let u=this.boundingSphere;if(u!==null)t.data.boundingSphere=u.toJSON();return t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;if(i!==null)this.setIndex(i.clone());let s=t.attributes;for(let x in s){let A=s[x];this.setAttribute(x,A.clone(e))}let r=t.morphAttributes;for(let x in r){let A=[],L=r[x];for(let D=0,R=L.length;D<R;D++)A.push(L[D].clone(e));this.morphAttributes[x]=A}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let x=0,A=a.length;x<A;x++){let L=a[x];this.addGroup(L.start,L.count,L.materialIndex)}let u=t.boundingBox;if(u!==null)this.boundingBox=u.clone();let f=t.boundingSphere;if(f!==null)this.boundingSphere=f.clone();return this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class De{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Ls()}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=cu(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=this.array.slice(0).buffer;let i=new this.array.constructor(t.arrayBuffers[e]),s=new this.constructor(i,this.stride);return s.setUsage(this.usage),s}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=cu(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=Array.from(new Uint32Array(this.array.slice(0).buffer));let i={uuid:this.uuid,buffer:e,type:this.array.constructor.name,stride:this.stride};return i.usage=this.usage,i}}function cu(t){if(t.buffer._uuid===void 0)t.buffer._uuid=Ls();if(t.byteOffset===0&&t.byteLength===t.buffer.byteLength)return t.buffer._uuid;return t.buffer._uuid+":"+t.byteOffset+":"+t.byteLength}var ss=new n;class k{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s,this._normalizationScale=t!==void 0?Na(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)ss.fromBufferAttribute(this,e),ss.applyMatrix4(t),this.setXYZ(e,ss.x,ss.y,ss.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)ss.fromBufferAttribute(this,e),ss.applyNormalMatrix(t),this.setXYZ(e,ss.x,ss.y,ss.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)ss.fromBufferAttribute(this,e),ss.transformDirection(t),this.setXYZ(e,ss.x,ss.y,ss.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];if(this.normalized)i=this._denormalize(i);return i}setComponent(t,e,i){if(this.normalized)i=this._normalize(i);return this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];if(this.normalized)e=this._denormalize(e);return e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];if(this.normalized)e=this._denormalize(e);return e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];if(this.normalized)e=this._denormalize(e);return e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];if(this.normalized)e=this._denormalize(e);return e}setXY(t,e,i){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i);return this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s);return this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,r){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),r=this._normalize(r);return this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){Ao("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new _(new this.array.constructor(e),this.itemSize,this.normalized)}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.clone(t);return new k(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(t){if(t===void 0){Ao("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Yc(t,this.data.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Zc(t,this.data.array)}}var Fl=new n,im=new n,sm=new ei;class N{constructor(t=new n(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Fl.subVectors(i,e).cross(im.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Fl),r=this.normal.dot(s);if(r===0){if(this.distanceToPoint(t.start)===0)return e.copy(t.start);return null}let a=-(t.start.dot(this.normal)+this.constant)/r;if(i===!0&&(a<0||a>1))return null;return e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||sm.getNormalMatrix(t),s=this.coplanarPoint(Fl).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}var rm=0;class F extends Ps{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:rm++}),this.uuid=Ls(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new c(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){if(this._alphaTest>0!==t>0)this.version++;this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t===void 0)return;for(let e in t){let i=t[e];if(i===void 0){Yn(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Yn(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}if(s&&s.isColor)s.set(i);else if(s&&s.isVector2&&(i&&i.isVector2)||s&&s.isEuler&&(i&&i.isEuler)||s&&s.isVector3&&(i&&i.isVector3))s.copy(i);else this[e]=i}}toJSON(t){let e=t===void 0||typeof t==="string";if(e)t={textures:{},images:{}};let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor)i.color=this.color.getHex();if(this.roughness!==void 0)i.roughness=this.roughness;if(this.metalness!==void 0)i.metalness=this.metalness;if(this.sheen!==void 0)i.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)i.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)i.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)i.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)i.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)i.specular=this.specular.getHex();if(this.specularIntensity!==void 0)i.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)i.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)i.shininess=this.shininess;if(this.clearcoat!==void 0)i.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)i.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)i.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid;if(this.dispersion!==void 0)i.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)i.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)i.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)i.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid;if(this.anisotropy!==void 0)i.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)i.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid;if(this.map&&this.map.isTexture)i.map=this.map.toJSON(t).uuid;if(this.matcap&&this.matcap.isTexture)i.matcap=this.matcap.toJSON(t).uuid;if(this.alphaMap&&this.alphaMap.isTexture)i.alphaMap=this.alphaMap.toJSON(t).uuid;if(this.lightMap&&this.lightMap.isTexture)i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)i.roughnessMap=this.roughnessMap.toJSON(t).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)i.metalnessMap=this.metalnessMap.toJSON(t).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)i.emissiveMap=this.emissiveMap.toJSON(t).uuid;if(this.specularMap&&this.specularMap.isTexture)i.specularMap=this.specularMap.toJSON(t).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)i.specularColorMap=this.specularColorMap.toJSON(t).uuid;if(this.envMap&&this.envMap.isTexture){if(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0)i.combine=this.combine}if(this.envMapRotation!==void 0)i.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)i.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)i.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)i.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)i.gradientMap=this.gradientMap.toJSON(t).uuid;if(this.transmission!==void 0)i.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)i.transmissionMap=this.transmissionMap.toJSON(t).uuid;if(this.thickness!==void 0)i.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)i.thicknessMap=this.thicknessMap.toJSON(t).uuid;if(this.attenuationDistance!==void 0)i.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)i.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)i.size=this.size;if(this.sizeAttenuation!==void 0)i.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)i.clippingPlanes=this.clippingPlanes.map((r)=>r.toJSON());if(this.rotation!==void 0)i.rotation=this.rotation;if(this.depthPacking!==void 0)i.depthPacking=this.depthPacking;if(this.linewidth!==void 0)i.linewidth=this.linewidth;if(this.linecap!==void 0)i.linecap=this.linecap;if(this.linejoin!==void 0)i.linejoin=this.linejoin;if(this.dashSize!==void 0)i.dashSize=this.dashSize;if(this.gapSize!==void 0)i.gapSize=this.gapSize;if(this.scale!==void 0)i.scale=this.scale;if(this.wireframe!==void 0)i.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)i.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)i.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)i.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)i.flatShading=this.flatShading;if(this.fog!==void 0)i.fog=this.fog;if(Object.keys(this.userData).length>0)i.userData=this.userData;function s(r){let a=[];for(let u in r){let f=r[u];delete f.metadata,a.push(f)}return a}if(e){let r=s(t.textures),a=s(t.images);if(r.length>0)i.textures=r;if(a.length>0)i.images=a}return i}fromJSON(t,e){if(t.uuid!==void 0)this.uuid=t.uuid;if(t.name!==void 0)this.name=t.name;if(t.color!==void 0&&this.color!==void 0)this.color.setHex(t.color);if(t.roughness!==void 0)this.roughness=t.roughness;if(t.metalness!==void 0)this.metalness=t.metalness;if(t.sheen!==void 0)this.sheen=t.sheen;if(t.sheenColor!==void 0)this.sheenColor=new c().setHex(t.sheenColor);if(t.sheenRoughness!==void 0)this.sheenRoughness=t.sheenRoughness;if(t.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(t.emissive);if(t.specular!==void 0&&this.specular!==void 0)this.specular.setHex(t.specular);if(t.specularIntensity!==void 0)this.specularIntensity=t.specularIntensity;if(t.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(t.specularColor);if(t.shininess!==void 0)this.shininess=t.shininess;if(t.clearcoat!==void 0)this.clearcoat=t.clearcoat;if(t.clearcoatRoughness!==void 0)this.clearcoatRoughness=t.clearcoatRoughness;if(t.diffuseRoughness!==void 0)this.diffuseRoughness=t.diffuseRoughness;if(t.dispersion!==void 0)this.dispersion=t.dispersion;if(t.retroreflectivity!==void 0)this.retroreflectivity=t.retroreflectivity;if(t.iridescence!==void 0)this.iridescence=t.iridescence;if(t.iridescenceIOR!==void 0)this.iridescenceIOR=t.iridescenceIOR;if(t.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum;if(t.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum;if(t.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1];if(t.transmission!==void 0)this.transmission=t.transmission;if(t.thickness!==void 0)this.thickness=t.thickness;if(t.attenuationDistance!==void 0)this.attenuationDistance=t.attenuationDistance;if(t.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(t.attenuationColor);if(t.anisotropy!==void 0)this.anisotropy=t.anisotropy;if(t.anisotropyRotation!==void 0)this.anisotropyRotation=t.anisotropyRotation;if(t.fog!==void 0)this.fog=t.fog;if(t.flatShading!==void 0)this.flatShading=t.flatShading;if(t.blending!==void 0)this.blending=t.blending;if(t.combine!==void 0)this.combine=t.combine;if(t.side!==void 0)this.side=t.side;if(t.shadowSide!==void 0)this.shadowSide=t.shadowSide;if(t.opacity!==void 0)this.opacity=t.opacity;if(t.transparent!==void 0)this.transparent=t.transparent;if(t.alphaTest!==void 0)this.alphaTest=t.alphaTest;if(t.alphaHash!==void 0)this.alphaHash=t.alphaHash;if(t.depthFunc!==void 0)this.depthFunc=t.depthFunc;if(t.depthTest!==void 0)this.depthTest=t.depthTest;if(t.depthWrite!==void 0)this.depthWrite=t.depthWrite;if(t.colorWrite!==void 0)this.colorWrite=t.colorWrite;if(t.clippingPlanes!==void 0)this.clippingPlanes=t.clippingPlanes.map((i)=>new N().fromJSON(i));if(t.clipIntersection!==void 0)this.clipIntersection=t.clipIntersection;if(t.clipShadows!==void 0)this.clipShadows=t.clipShadows;if(t.depthPacking!==void 0)this.depthPacking=t.depthPacking;if(t.blendSrc!==void 0)this.blendSrc=t.blendSrc;if(t.blendDst!==void 0)this.blendDst=t.blendDst;if(t.blendEquation!==void 0)this.blendEquation=t.blendEquation;if(t.blendSrcAlpha!==void 0)this.blendSrcAlpha=t.blendSrcAlpha;if(t.blendDstAlpha!==void 0)this.blendDstAlpha=t.blendDstAlpha;if(t.blendEquationAlpha!==void 0)this.blendEquationAlpha=t.blendEquationAlpha;if(t.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(t.blendColor);if(t.blendAlpha!==void 0)this.blendAlpha=t.blendAlpha;if(t.stencilWriteMask!==void 0)this.stencilWriteMask=t.stencilWriteMask;if(t.stencilFunc!==void 0)this.stencilFunc=t.stencilFunc;if(t.stencilRef!==void 0)this.stencilRef=t.stencilRef;if(t.stencilFuncMask!==void 0)this.stencilFuncMask=t.stencilFuncMask;if(t.stencilFail!==void 0)this.stencilFail=t.stencilFail;if(t.stencilZFail!==void 0)this.stencilZFail=t.stencilZFail;if(t.stencilZPass!==void 0)this.stencilZPass=t.stencilZPass;if(t.stencilWrite!==void 0)this.stencilWrite=t.stencilWrite;if(t.wireframe!==void 0)this.wireframe=t.wireframe;if(t.wireframeLinewidth!==void 0)this.wireframeLinewidth=t.wireframeLinewidth;if(t.wireframeLinecap!==void 0)this.wireframeLinecap=t.wireframeLinecap;if(t.wireframeLinejoin!==void 0)this.wireframeLinejoin=t.wireframeLinejoin;if(t.rotation!==void 0)this.rotation=t.rotation;if(t.linewidth!==void 0)this.linewidth=t.linewidth;if(t.linecap!==void 0)this.linecap=t.linecap;if(t.linejoin!==void 0)this.linejoin=t.linejoin;if(t.dashSize!==void 0)this.dashSize=t.dashSize;if(t.gapSize!==void 0)this.gapSize=t.gapSize;if(t.scale!==void 0)this.scale=t.scale;if(t.polygonOffset!==void 0)this.polygonOffset=t.polygonOffset;if(t.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=t.polygonOffsetFactor;if(t.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=t.polygonOffsetUnits;if(t.dithering!==void 0)this.dithering=t.dithering;if(t.alphaToCoverage!==void 0)this.alphaToCoverage=t.alphaToCoverage;if(t.premultipliedAlpha!==void 0)this.premultipliedAlpha=t.premultipliedAlpha;if(t.forceSinglePass!==void 0)this.forceSinglePass=t.forceSinglePass;if(t.allowOverride!==void 0)this.allowOverride=t.allowOverride;if(t.visible!==void 0)this.visible=t.visible;if(t.toneMapped!==void 0)this.toneMapped=t.toneMapped;if(t.userData!==void 0)this.userData=t.userData;if(t.vertexColors!==void 0)if(typeof t.vertexColors==="number")this.vertexColors=t.vertexColors>0;else this.vertexColors=t.vertexColors;if(t.size!==void 0)this.size=t.size;if(t.sizeAttenuation!==void 0)this.sizeAttenuation=t.sizeAttenuation;if(t.map!==void 0)this.map=e[t.map]||null;if(t.matcap!==void 0)this.matcap=e[t.matcap]||null;if(t.alphaMap!==void 0)this.alphaMap=e[t.alphaMap]||null;if(t.bumpMap!==void 0)this.bumpMap=e[t.bumpMap]||null;if(t.bumpScale!==void 0)this.bumpScale=t.bumpScale;if(t.normalMap!==void 0)this.normalMap=e[t.normalMap]||null;if(t.normalMapType!==void 0)this.normalMapType=t.normalMapType;if(t.normalScale!==void 0){let i=t.normalScale;if(Array.isArray(i)===!1)i=[i,i];this.normalScale=new l().fromArray(i)}if(t.displacementMap!==void 0)this.displacementMap=e[t.displacementMap]||null;if(t.displacementScale!==void 0)this.displacementScale=t.displacementScale;if(t.displacementBias!==void 0)this.displacementBias=t.displacementBias;if(t.roughnessMap!==void 0)this.roughnessMap=e[t.roughnessMap]||null;if(t.metalnessMap!==void 0)this.metalnessMap=e[t.metalnessMap]||null;if(t.emissiveMap!==void 0)this.emissiveMap=e[t.emissiveMap]||null;if(t.emissiveIntensity!==void 0)this.emissiveIntensity=t.emissiveIntensity;if(t.specularMap!==void 0)this.specularMap=e[t.specularMap]||null;if(t.specularIntensityMap!==void 0)this.specularIntensityMap=e[t.specularIntensityMap]||null;if(t.specularColorMap!==void 0)this.specularColorMap=e[t.specularColorMap]||null;if(t.envMap!==void 0)this.envMap=e[t.envMap]||null;if(t.envMapRotation!==void 0)this.envMapRotation.fromArray(t.envMapRotation);if(t.envMapIntensity!==void 0)this.envMapIntensity=t.envMapIntensity;if(t.reflectivity!==void 0)this.reflectivity=t.reflectivity;if(t.refractionRatio!==void 0)this.refractionRatio=t.refractionRatio;if(t.lightMap!==void 0)this.lightMap=e[t.lightMap]||null;if(t.lightMapIntensity!==void 0)this.lightMapIntensity=t.lightMapIntensity;if(t.aoMap!==void 0)this.aoMap=e[t.aoMap]||null;if(t.aoMapIntensity!==void 0)this.aoMapIntensity=t.aoMapIntensity;if(t.gradientMap!==void 0)this.gradientMap=e[t.gradientMap]||null;if(t.clearcoatMap!==void 0)this.clearcoatMap=e[t.clearcoatMap]||null;if(t.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null;if(t.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null;if(t.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new l().fromArray(t.clearcoatNormalScale);if(t.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null;if(t.iridescenceMap!==void 0)this.iridescenceMap=e[t.iridescenceMap]||null;if(t.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null;if(t.transmissionMap!==void 0)this.transmissionMap=e[t.transmissionMap]||null;if(t.thicknessMap!==void 0)this.thicknessMap=e[t.thicknessMap]||null;if(t.anisotropyMap!==void 0)this.anisotropyMap=e[t.anisotropyMap]||null;if(t.sheenColorMap!==void 0)this.sheenColorMap=e[t.sheenColorMap]||null;if(t.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){if(t===!0)this.version++}}var Hs=new n,Ol=new n,ra=new n,oa=new n;class me{constructor(t=new n,e=new n(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Hs)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);if(i<0)return e.copy(this.origin);return e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Hs.subVectors(t,this.origin).dot(this.direction);if(e<0)return this.origin.distanceToSquared(t);return Hs.copy(this.origin).addScaledVector(this.direction,e),Hs.distanceToSquared(t)}distanceSqToSegment(t,e,i,s){Ol.copy(t).add(e).multiplyScalar(0.5),ra.copy(e).sub(t).normalize(),oa.copy(this.origin).sub(Ol);let r=t.distanceTo(e)*0.5,a=-this.direction.dot(ra),u=oa.dot(this.direction),f=-oa.dot(ra),x=oa.lengthSq(),A=Math.abs(1-a*a),L,D,R,V;if(A>0)if(L=a*f-u,D=a*u-f,V=r*A,L>=0)if(D>=-V)if(D<=V){let rt=1/A;L*=rt,D*=rt,R=L*(L+a*D+2*u)+D*(a*L+D+2*f)+x}else D=r,L=Math.max(0,-(a*D+u)),R=-L*L+D*(D+2*f)+x;else D=-r,L=Math.max(0,-(a*D+u)),R=-L*L+D*(D+2*f)+x;else if(D<=-V)L=Math.max(0,-(-a*r+u)),D=L>0?-r:Math.min(Math.max(-r,-f),r),R=-L*L+D*(D+2*f)+x;else if(D<=V)L=0,D=Math.min(Math.max(-r,-f),r),R=D*(D+2*f)+x;else L=Math.max(0,-(a*r+u)),D=L>0?r:Math.min(Math.max(-r,-f),r),R=-L*L+D*(D+2*f)+x;else D=a>0?-r:r,L=Math.max(0,-(a*D+u)),R=-L*L+D*(D+2*f)+x;if(i)i.copy(this.origin).addScaledVector(this.direction,L);if(s)s.copy(Ol).addScaledVector(ra,D);return R}intersectSphere(t,e){if(t.radius<0)return null;Hs.subVectors(t.center,this.origin);let i=Hs.dot(this.direction),s=Hs.dot(Hs)-i*i,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),u=i-a,f=i+a;if(f<0)return null;if(u<0)return this.at(f,e);return this.at(u,e)}intersectsSphere(t){if(t.radius<0)return!1;return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0){if(t.distanceToPoint(this.origin)===0)return 0;return null}let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);if(i===null)return null;return this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);if(e===0)return!0;if(t.normal.dot(this.direction)*e<0)return!0;return!1}intersectBox(t,e){let i,s,r,a,u,f,x=1/this.direction.x,A=1/this.direction.y,L=1/this.direction.z,D=this.origin;if(x>=0)i=(t.min.x-D.x)*x,s=(t.max.x-D.x)*x;else i=(t.max.x-D.x)*x,s=(t.min.x-D.x)*x;if(A>=0)r=(t.min.y-D.y)*A,a=(t.max.y-D.y)*A;else r=(t.max.y-D.y)*A,a=(t.min.y-D.y)*A;if(i>a||r>s)return null;if(r>i||isNaN(i))i=r;if(a<s||isNaN(s))s=a;if(L>=0)u=(t.min.z-D.z)*L,f=(t.max.z-D.z)*L;else u=(t.max.z-D.z)*L,f=(t.min.z-D.z)*L;if(i>f||u>s)return null;if(u>i||i!==i)i=u;if(f<s||s!==s)s=f;if(s<0)return null;return this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Hs)!==null}intersectTriangle(t,e,i,s,r){let a=this.origin,u=this.direction,{x:f,y:x,z:A}=u,L=t.x-a.x,D=t.y-a.y,R=t.z-a.z,V=e.x-a.x,rt=e.y-a.y,Ct=e.z-a.z,j=i.x-a.x,it=i.y-a.y,ft=i.z-a.z,Pt=Math.abs(f),pt=Math.abs(x),Nt=Math.abs(A),se,nt,Rt,re,be,he,Pe,$e,fe,sn,un,rn;if(Pt>=pt&&Pt>=Nt)if(Rt=f,he=L,fe=V,rn=j,f>=0)se=x,nt=A,re=D,be=R,Pe=rt,$e=Ct,sn=it,un=ft;else se=A,nt=x,re=R,be=D,Pe=Ct,$e=rt,sn=ft,un=it;else if(pt>=Nt)if(Rt=x,he=D,fe=rt,rn=it,x>=0)se=A,nt=f,re=R,be=L,Pe=Ct,$e=V,sn=ft,un=j;else se=f,nt=A,re=L,be=R,Pe=V,$e=Ct,sn=j,un=ft;else if(Rt=A,he=R,fe=Ct,rn=ft,A>=0)se=f,nt=x,re=L,be=D,Pe=V,$e=rt,sn=j,un=it;else se=x,nt=f,re=D,be=L,Pe=rt,$e=V,sn=it,un=j;if(Rt===0)return null;let wn=se/Rt,mn=nt/Rt,Sn=1/Rt,Tn=re-wn*he,Gn=be-mn*he,vn=Pe-wn*fe,An=$e-mn*fe,zn=sn-wn*rn,Jn=un-mn*rn,Kn=zn*An-Jn*vn,kn=Tn*Jn-Gn*zn,di=vn*Gn-An*Tn;if(s){if(Kn<0||kn<0||di<0)return null}else if((Kn<0||kn<0||di<0)&&(Kn>0||kn>0||di>0))return null;let oi=Kn+kn+di;if(oi===0)return null;let si=Sn*(Kn*he+kn*fe+di*rn);if(oi>0?si<0:si>0)return null;return this.at(si/oi,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Y extends F{constructor(t){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new c(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bs,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}var hu=new o,pr=new me,aa=new E,uu=new n,la=new n,ca=new n,ha=new n,Bl=new n,ua=new n,fu=new n,fa=new n;class h extends M{constructor(t=new m,e=new Y){super();this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let u=this.morphTargetInfluences;if(r&&u){ua.set(0,0,0);for(let f=0,x=r.length;f<x;f++){let A=u[f],L=r[f];if(A===0)continue;if(Bl.fromBufferAttribute(L,t),a)ua.addScaledVector(Bl,A);else ua.addScaledVector(Bl.sub(e),A)}e.add(ua)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;if(s===void 0)return;if(i.boundingSphere===null)i.computeBoundingSphere();if(aa.copy(i.boundingSphere),aa.applyMatrix4(r),pr.copy(t.ray).recast(t.near),aa.containsPoint(pr.origin)===!1){if(pr.intersectSphere(aa,uu)===null)return;if(pr.origin.distanceToSquared(uu)>(t.far-t.near)**2)return}if(hu.copy(r).invert(),pr.copy(t.ray).applyMatrix4(hu),i.boundingBox!==null){if(pr.intersectsBox(i.boundingBox)===!1)return}this._computeIntersections(t,e,pr)}_computeIntersections(t,e,i){let s,r=this.geometry,a=this.material,u=r.index,f=r.attributes.position,x=r.attributes.uv,A=r.attributes.uv1,L=r.attributes.normal,{groups:D,drawRange:R}=r;if(u!==null)if(Array.isArray(a))for(let V=0,rt=D.length;V<rt;V++){let Ct=D[V],j=a[Ct.materialIndex],it=Math.max(Ct.start,R.start),ft=Math.min(u.count,Math.min(Ct.start+Ct.count,R.start+R.count));for(let Pt=it,pt=ft;Pt<pt;Pt+=3){let Nt=u.getX(Pt),se=u.getX(Pt+1),nt=u.getX(Pt+2);if(s=da(this,j,t,i,x,A,L,Nt,se,nt),s)s.faceIndex=Math.floor(Pt/3),s.face.materialIndex=Ct.materialIndex,e.push(s)}}else{let V=Math.max(0,R.start),rt=Math.min(u.count,R.start+R.count);for(let Ct=V,j=rt;Ct<j;Ct+=3){let it=u.getX(Ct),ft=u.getX(Ct+1),Pt=u.getX(Ct+2);if(s=da(this,a,t,i,x,A,L,it,ft,Pt),s)s.faceIndex=Math.floor(Ct/3),e.push(s)}}else if(f!==void 0)if(Array.isArray(a))for(let V=0,rt=D.length;V<rt;V++){let Ct=D[V],j=a[Ct.materialIndex],it=Math.max(Ct.start,R.start),ft=Math.min(f.count,Math.min(Ct.start+Ct.count,R.start+R.count));for(let Pt=it,pt=ft;Pt<pt;Pt+=3){let Nt=Pt,se=Pt+1,nt=Pt+2;if(s=da(this,j,t,i,x,A,L,Nt,se,nt),s)s.faceIndex=Math.floor(Pt/3),s.face.materialIndex=Ct.materialIndex,e.push(s)}}else{let V=Math.max(0,R.start),rt=Math.min(f.count,R.start+R.count);for(let Ct=V,j=rt;Ct<j;Ct+=3){let it=Ct,ft=Ct+1,Pt=Ct+2;if(s=da(this,a,t,i,x,A,L,it,ft,Pt),s)s.faceIndex=Math.floor(Ct/3),e.push(s)}}}}function om(t,e,i,s,r,a,u,f){let x;if(e.side===1)x=s.intersectTriangle(u,a,r,!0,f);else x=s.intersectTriangle(r,a,u,e.side===0,f);if(x===null)return null;fa.copy(f),fa.applyMatrix4(t.matrixWorld);let A=i.ray.origin.distanceTo(fa);if(A<i.near||A>i.far)return null;return{distance:A,point:fa.clone(),object:t}}function da(t,e,i,s,r,a,u,f,x,A){t.getVertexPosition(f,la),t.getVertexPosition(x,ca),t.getVertexPosition(A,ha);let L=om(t,e,i,s,la,ca,ha,fu);if(L){let D=new n;if(Oi.getBarycoord(fu,la,ca,ha,D),r)L.uv=Oi.getInterpolatedAttribute(r,f,x,A,D,new l);if(a)L.uv1=Oi.getInterpolatedAttribute(a,f,x,A,D,new l);if(u){if(L.normal=Oi.getInterpolatedAttribute(u,f,x,A,D,new n),L.normal.dot(s.direction)>0)L.normal.multiplyScalar(-1)}let R={a:f,b:x,c:A,normal:new n,materialIndex:0};Oi.getNormal(la,ca,ha,R.normal),L.face=R,L.barycoord=D}return L}var xo=new b,du=new b,pu=new b,am=new b,mu=new o,pa=new n,zl=new E,gu=new o,Gl=new me;class Vt extends h{constructor(t,e){super(t,e);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new o,this.bindMatrixInverse=new o,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;if(this.boundingBox===null)this.boundingBox=new p;this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,pa),this.boundingBox.expandByPoint(pa)}computeBoundingSphere(){let t=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new E;this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,pa),this.boundingSphere.expandByPoint(pa)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}raycast(t,e){let i=this.material,s=this.matrixWorld;if(i===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(zl.copy(this.boundingSphere),zl.applyMatrix4(s),t.ray.intersectsSphere(zl)===!1)return;if(gu.copy(s).invert(),Gl.copy(t.ray).applyMatrix4(gu),this.boundingBox!==null){if(Gl.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(t,e,Gl)}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){if(this.skeleton=t,e===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld;this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new b,e=this.geometry.attributes.skinWeight;for(let i=0,s=e.count;i<s;i++){t.fromBufferAttribute(e,i);let r=1/t.manhattanLength();if(r!==1/0)t.multiplyScalar(r);else t.set(1,0,0,0);e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else Yn("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,s=this.geometry;if(du.fromBufferAttribute(s.attributes.skinIndex,t),pu.fromBufferAttribute(s.attributes.skinWeight,t),e.isVector4)xo.copy(e),e.set(0,0,0,0);else xo.set(e.x,e.y,e.z,1),e.set(0,0,0);xo.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=pu.getComponent(r);if(a!==0){let u=du.getComponent(r);mu.multiplyMatrices(i.bones[u].matrixWorld,i.boneInverses[u]),e.addScaledVector(am.copy(xo).applyMatrix4(mu),a)}}if(e.isVector4)e.w=xo.w;return e.applyMatrix4(this.bindMatrixInverse)}}class Tt extends M{constructor(){super();this.isBone=!0,this.type="Bone"}}class ge extends S{constructor(t=null,e=1,i=1,s,r,a,u,f,x=1003,A=1003,L,D){super(null,a,u,f,x,A,s,r,L,D);this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var _u=new o,lm=new o;class wt{constructor(t=[],e=[]){this.uuid=Ls(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){Yn("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new o)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new o;if(this.bones[t])i.copy(this.bones[t].matrixWorld).invert();this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];if(i)i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];if(i){if(i.parent&&i.parent.isBone)i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld);else i.matrix.copy(i.matrixWorld);i.matrix.decompose(i.position,i.quaternion,i.scale)}}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,a=t.length;r<a;r++){let u=t[r]?t[r].matrixWorld:lm;_u.multiplyMatrices(u,e[r]),_u.toArray(i,r*16)}if(s!==null)s.needsUpdate=!0}clone(){return new wt(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new ge(e,t,t,1023,1015);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let s=this.bones[e];if(s.name===t)return s}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null;if(this.previousBoneTexture!==null)this.previousBoneTexture.dispose(),this.previousBoneTexture=null}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,s=t.bones.length;i<s;i++){let r=t.bones[i],a=e[r];if(a===void 0)Yn("Skeleton: No bone found with UUID:",r),a=new Tt;this.bones.push(a),this.boneInverses.push(new o().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let s=0,r=e.length;s<r;s++){let a=e[s];t.bones.push(a.uuid);let u=i[s];t.boneInverses.push(u.toArray())}return t}}class Xe extends _{constructor(t,e,i,s=1){super(t,e,i);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}var Br=new o,xu=new o,ma=[],yu=new p,cm=new o,yo=new h,vo=new E;class ue extends h{constructor(t,e,i){super(t,e);this.isInstancedMesh=!0,this.instanceMatrix=new Xe(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,cm)}computeBoundingBox(){let t=this.geometry,e=this.count;if(this.boundingBox===null)this.boundingBox=new p;if(t.boundingBox===null)t.computeBoundingBox();this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Br),yu.copy(t.boundingBox).applyMatrix4(Br),this.boundingBox.union(yu)}computeBoundingSphere(){let t=this.geometry,e=this.count;if(this.boundingSphere===null)this.boundingSphere=new E;if(t.boundingSphere===null)t.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Br),vo.copy(t.boundingSphere).applyMatrix4(Br),this.boundingSphere.union(vo)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){if(this.instanceColor===null)return e.setRGB(1,1,1);else return e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let u=0;u<i.length;u++)i[u]=s[a+u]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(yo.geometry=this.geometry,yo.material=this.material,yo.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(vo.copy(this.boundingSphere),vo.applyMatrix4(i),t.ray.intersectsSphere(vo)===!1)return;for(let r=0;r<s;r++){this.getMatrixAt(r,Br),xu.multiplyMatrices(i,Br),yo.matrixWorld=xu,yo.raycast(t,ma);for(let a=0,u=ma.length;a<u;a++){let f=ma[a];f.instanceId=r,f.object=this,e.push(f)}ma.length=0}}setColorAt(t,e){if(this.instanceColor===null)this.instanceColor=new Xe(new Float32Array(this.instanceMatrix.count*3).fill(1),3);return e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;if(this.morphTexture===null)this.morphTexture=new ge(new Float32Array(s*this.count),s,this.count,1028,1015);let r=this.morphTexture.source.data.data,a=0;for(let x=0;x<i.length;x++)a+=i[x];let u=this.geometry.morphTargetsRelative?1:1-a,f=s*t;return r[f]=u,r.set(i,f+1),this}updateMorphTargets(){}dispose(){if(super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null)this.instanceColor.dispose();if(this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var mr=new E,hm=new l(0.5,0.5),ga=new n;class de{constructor(t=new N,e=new N,i=new N,s=new N,r=new N,a=new N){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){let u=this.planes;return u[0].copy(t),u[1].copy(e),u[2].copy(i),u[3].copy(s),u[4].copy(r),u[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=2000,i=!1){let s=this.planes,r=t.elements,a=r[0],u=r[1],f=r[2],x=r[3],A=r[4],L=r[5],D=r[6],R=r[7],V=r[8],rt=r[9],Ct=r[10],j=r[11],it=r[12],ft=r[13],Pt=r[14],pt=r[15];if(s[0].setComponents(x-a,R-A,j-V,pt-it).normalize(),s[1].setComponents(x+a,R+A,j+V,pt+it).normalize(),s[2].setComponents(x+u,R+L,j+rt,pt+ft).normalize(),s[3].setComponents(x-u,R-L,j-rt,pt-ft).normalize(),i)s[4].setComponents(f,D,Ct,Pt).normalize(),s[5].setComponents(x-f,R-D,j-Ct,pt-Pt).normalize();else if(s[4].setComponents(x-f,R-D,j-Ct,pt-Pt).normalize(),e===2000)s[5].setComponents(x+f,R+D,j+Ct,pt+Pt).normalize();else if(e===2001)s[5].setComponents(f,D,Ct,Pt).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0){if(t.boundingSphere===null)t.computeBoundingSphere();mr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld)}else{let e=t.geometry;if(e.boundingSphere===null)e.computeBoundingSphere();mr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(mr)}intersectsSprite(t){mr.center.set(0,0,0);let e=hm.distanceTo(t.center);return mr.radius=0.7071067811865476+e,mr.applyMatrix4(t.matrixWorld),this.intersectsSphere(mr)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(ga.x=s.normal.x>0?t.max.x:t.min.x,ga.y=s.normal.y>0?t.max.y:t.min.y,ga.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ga)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var vu=new o;class No{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,i=this._frustums;for(let s=0;s<e.length;s++){let r=e[s];if(vu.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[s]===void 0)i[s]=new de;i[s].setFromProjectionMatrix(vu,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,i=t._frustums;for(let s=0;s<t._count;s++){if(e[s]===void 0)e[s]=new de;e[s].copy(i[s])}return this._count=t._count,this}clone(){return new No().copy(this)}}function kl(t,e){return t-e}function um(t,e){return t.z-e.z}function fm(t,e){return e.z-t.z}class Of{constructor(){this.index=0,this.pool=[],this.list=[]}push(t,e,i,s){let r=this.pool,a=this.list;if(this.index>=r.length)r.push({start:-1,count:-1,z:-1,index:-1});let u=r[this.index];a.push(u),this.index++,u.start=t,u.count=e,u.z=i,u.index=s}reset(){this.list.length=0,this.index=0}}var cs=new o,dm=new c(1,1,1),pm=new de,mm=new No,_a=new p,gr=new E,Hl=new n,Su=new n,Mu=new n,gm=new n,Vl=new Of,ji=new h,xa=[];function _m(t,e,i=0){let s=e.itemSize;if(t.isInterleavedBufferAttribute||t.array.constructor!==e.array.constructor){let r=t.count;for(let a=0;a<r;a++)for(let u=0;u<s;u++)e.setComponent(a+i,u,t.getComponent(a,u))}else e.array.set(t.array,i*s);e.needsUpdate=!0}function ws(t,e){if(t.constructor!==e.constructor){let i=Math.min(t.length,e.length);for(let s=0;s<i;s++)e[s]=t[s]}else{let i=Math.min(t.length,e.length);e.set(new t.constructor(t.buffer,0,i))}}class Oa extends h{constructor(t,e,i=e*2,s){super(new m,s);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=t,this._maxVertexCount=e,this._maxIndexCount=i,this._multiDrawCounts=new Int32Array(t),this._multiDrawStarts=new Int32Array(t),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(t),this._mergedDrawStarts=new Int32Array(t),this._mergedDrawInstanceCounts=new Int32Array(t),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let t=Math.sqrt(this._maxInstanceCount*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4),i=new ge(e,t,t,1023,1015);this._matricesTexture=i}_initIndirectTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Uint32Array(t*t),i=new ge(e,t,t,1029,1014);this._indirectTexture=i}_initColorsTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Float32Array(t*t*4).fill(1),i=new ge(e,t,t,1023,1015);i.colorSpace=y.workingColorSpace,this._colorsTexture=i}_initializeGeometry(t){let e=this.geometry,i=this._maxVertexCount,s=this._maxIndexCount;if(this._geometryInitialized===!1){for(let r in t.attributes){let a=t.getAttribute(r),{array:u,itemSize:f,normalized:x}=a,A=new u.constructor(i*f),L=new _(A,f,x);e.setAttribute(r,L)}if(t.getIndex()!==null){let r=i>65535?new Uint32Array(s):new Uint16Array(s);e.setIndex(new _(r,1))}this._geometryInitialized=!0}}_validateGeometry(t){let e=this.geometry;if(Boolean(t.getIndex())!==Boolean(e.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let i in e.attributes){if(!t.hasAttribute(i))throw Error(`THREE.BatchedMesh: Added geometry missing "${i}". All geometries must have consistent attributes.`);let s=t.getAttribute(i),r=e.getAttribute(i);if(s.itemSize!==r.itemSize||s.normalized!==r.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${i}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(t){let e=this._instanceInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${t}. Instance is either out of range or has been deleted.`)}validateGeometryId(t){let e=this._geometryInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${t}. Geometry is either out of range or has been deleted.`)}setCustomSort(t){return this.customSort=t,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new p;let t=this.boundingBox,e=this._instanceInfo;t.makeEmpty();for(let i=0,s=e.length;i<s;i++){if(e[i].active===!1)continue;let r=e[i].geometryIndex;this.getMatrixAt(i,cs),this.getBoundingBoxAt(r,_a).applyMatrix4(cs),t.union(_a)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new E;let t=this.boundingSphere,e=this._instanceInfo;t.makeEmpty();for(let i=0,s=e.length;i<s;i++){if(e[i].active===!1)continue;let r=e[i].geometryIndex;this.getMatrixAt(i,cs),this.getBoundingSphereAt(r,gr).applyMatrix4(cs),t.union(gr)}}addInstance(t){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let i={visible:!0,active:!0,geometryIndex:t},s=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(kl),s=this._availableInstanceIds.shift(),this._instanceInfo[s]=i;else s=this._instanceInfo.length,this._instanceInfo.push(i);let r=this._matricesTexture;cs.identity().toArray(r.image.data,s*16),r.needsUpdate=!0;let a=this._colorsTexture;if(a)dm.toArray(a.image.data,s*4),a.needsUpdate=!0;return this._visibilityChanged=!0,s}addGeometry(t,e=-1,i=-1){this._initializeGeometry(t),this._validateGeometry(t);let s={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},r=this._geometryInfo;s.vertexStart=this._nextVertexStart,s.reservedVertexCount=e===-1?t.getAttribute("position").count:e;let a=t.getIndex();if(a!==null)s.indexStart=this._nextIndexStart,s.reservedIndexCount=i===-1?a.count:i;if(s.indexStart!==-1&&s.indexStart+s.reservedIndexCount>this._maxIndexCount||s.vertexStart+s.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let f;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(kl),f=this._availableGeometryIds.shift(),r[f]=s;else f=this._geometryCount,this._geometryCount++,r.push(s);return this.setGeometryAt(f,t),this._nextIndexStart=s.indexStart+s.reservedIndexCount,this._nextVertexStart=s.vertexStart+s.reservedVertexCount,f}setGeometryAt(t,e){if(t>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(e);let i=this.geometry,s=i.getIndex()!==null,r=i.getIndex(),a=e.getIndex(),u=this._geometryInfo[t];if(s&&a.count>u.reservedIndexCount||e.attributes.position.count>u.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:f,reservedVertexCount:x}=u;u.vertexCount=e.getAttribute("position").count;for(let A in i.attributes){let L=e.getAttribute(A),D=i.getAttribute(A);_m(L,D,f);let R=L.itemSize;for(let V=L.count,rt=x;V<rt;V++){let Ct=f+V;for(let j=0;j<R;j++)D.setComponent(Ct,j,0)}D.needsUpdate=!0,D.addUpdateRange(f*R,x*R)}if(s){let{indexStart:A,reservedIndexCount:L}=u;u.indexCount=e.getIndex().count;for(let D=0;D<a.count;D++)r.setX(A+D,f+a.getX(D));for(let D=a.count,R=L;D<R;D++)r.setX(A+D,f);r.needsUpdate=!0,r.addUpdateRange(A,u.reservedIndexCount)}if(u.start=s?u.indexStart:u.vertexStart,u.count=s?u.indexCount:u.vertexCount,u.boundingBox=null,e.boundingBox!==null)u.boundingBox=e.boundingBox.clone();if(u.boundingSphere=null,e.boundingSphere!==null)u.boundingSphere=e.boundingSphere.clone();return this._visibilityChanged=!0,t}deleteGeometry(t){let e=this._geometryInfo;if(t>=e.length||e[t].active===!1)return this;let i=this._instanceInfo;for(let s=0,r=i.length;s<r;s++)if(i[s].active&&i[s].geometryIndex===t)this.deleteInstance(s);return e[t].active=!1,this._availableGeometryIds.push(t),this._visibilityChanged=!0,this}deleteInstance(t){return this.validateInstanceId(t),this._instanceInfo[t].active=!1,this._availableInstanceIds.push(t),this._visibilityChanged=!0,this}optimize(){let t=0,e=0,i=this._geometryInfo,s=i.map((a,u)=>u).sort((a,u)=>i[a].vertexStart-i[u].vertexStart),r=this.geometry;for(let a=0,u=i.length;a<u;a++){let f=s[a],x=i[f];if(x.active===!1)continue;if(r.index!==null){if(x.indexStart!==e){let{indexStart:A,vertexStart:L,reservedIndexCount:D}=x,R=r.index,V=R.array,rt=t-L;for(let Ct=A;Ct<A+D;Ct++)V[Ct]=V[Ct]+rt;R.array.copyWithin(e,A,A+D),R.addUpdateRange(e,D),R.needsUpdate=!0,x.indexStart=e}e+=x.reservedIndexCount}if(x.vertexStart!==t){let{vertexStart:A,reservedVertexCount:L}=x,D=r.attributes;for(let R in D){let V=D[R],{array:rt,itemSize:Ct}=V;rt.copyWithin(t*Ct,A*Ct,(A+L)*Ct),V.addUpdateRange(t*Ct,L*Ct),V.needsUpdate=!0}x.vertexStart=t}t+=x.reservedVertexCount,x.start=r.index?x.indexStart:x.vertexStart}return this._nextIndexStart=e,this._nextVertexStart=t,this._visibilityChanged=!0,this}getBoundingBoxAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,s=this._geometryInfo[t];if(s.boundingBox===null){let r=new p,a=i.index,u=i.attributes.position;for(let f=s.start,x=s.start+s.count;f<x;f++){let A=f;if(a)A=a.getX(A);r.expandByPoint(Hl.fromBufferAttribute(u,A))}s.boundingBox=r}return e.copy(s.boundingBox),e}getBoundingSphereAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,s=this._geometryInfo[t];if(s.boundingSphere===null){let r=new E;this.getBoundingBoxAt(t,_a),_a.getCenter(r.center);let a=i.index,u=i.attributes.position,f=0;for(let x=s.start,A=s.start+s.count;x<A;x++){let L=x;if(a)L=a.getX(L);Hl.fromBufferAttribute(u,L),f=Math.max(f,r.center.distanceToSquared(Hl))}r.radius=Math.sqrt(f),s.boundingSphere=r}return e.copy(s.boundingSphere),e}setMatrixAt(t,e){this.validateInstanceId(t);let i=this._matricesTexture,s=this._matricesTexture.image.data;return e.toArray(s,t*16),i.needsUpdate=!0,this}getMatrixAt(t,e){return this.validateInstanceId(t),e.fromArray(this._matricesTexture.image.data,t*16)}setColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)this._initColorsTexture();return e.toArray(this._colorsTexture.image.data,t*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)if(e.isVector4)return e.set(1,1,1,1);else return e.setRGB(1,1,1);else return e.fromArray(this._colorsTexture.image.data,t*4)}setVisibleAt(t,e){if(this.validateInstanceId(t),this._instanceInfo[t].visible===e)return this;return this._instanceInfo[t].visible=e,this._visibilityChanged=!0,this}getVisibleAt(t){return this.validateInstanceId(t),this._instanceInfo[t].visible}setGeometryIdAt(t,e){return this.validateInstanceId(t),this.validateGeometryId(e),this._instanceInfo[t].geometryIndex=e,this._visibilityChanged=!0,this}getGeometryIdAt(t){return this.validateInstanceId(t),this._instanceInfo[t].geometryIndex}getGeometryRangeAt(t,e={}){this.validateGeometryId(t);let i=this._geometryInfo[t];return e.vertexStart=i.vertexStart,e.vertexCount=i.vertexCount,e.reservedVertexCount=i.reservedVertexCount,e.indexStart=i.indexStart,e.indexCount=i.indexCount,e.reservedIndexCount=i.reservedIndexCount,e.start=i.start,e.count=i.count,e}setInstanceCount(t){let e=this._availableInstanceIds,i=this._instanceInfo;e.sort(kl);while(e[e.length-1]===i.length-1)i.pop(),e.pop();if(t<i.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${t} are being used. Cannot shrink instance count.`);let s=new Int32Array(t),r=new Int32Array(t);ws(this._multiDrawCounts,s),ws(this._multiDrawStarts,r),this._multiDrawCounts=s,this._multiDrawStarts=r;let a=new Int32Array(t),u=new Int32Array(t),f=new Int32Array(t);ws(this._mergedDrawCounts,a),ws(this._mergedDrawStarts,u),ws(this._mergedDrawInstanceCounts,f),this._mergedDrawCounts=a,this._mergedDrawStarts=u,this._mergedDrawInstanceCounts=f,this._maxInstanceCount=t;let x=this._indirectTexture,A=this._matricesTexture,L=this._colorsTexture;if(x.dispose(),this._initIndirectTexture(),ws(x.image.data,this._indirectTexture.image.data),A.dispose(),this._initMatricesTexture(),ws(A.image.data,this._matricesTexture.image.data),L)L.dispose(),this._initColorsTexture(),ws(L.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(t,e){let i=[...this._geometryInfo].filter((u)=>u.active);if(Math.max(...i.map((u)=>u.vertexStart+u.reservedVertexCount))>t)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...i.map((f)=>f.indexStart+f.reservedIndexCount))>e)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${e}. Cannot shrink further.`)}let r=this.geometry;if(r.dispose(),this._maxVertexCount=t,this._maxIndexCount=e,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new m,this._initializeGeometry(r);let a=this.geometry;if(r.index)ws(r.index.array,a.index.array);for(let u in r.attributes)ws(r.attributes[u].array,a.attributes[u].array);this._visibilityChanged=!0}raycast(t,e){let i=this._instanceInfo,s=this._geometryInfo,r=this.matrixWorld,a=this.geometry;if(ji.material=this.material,ji.geometry.index=a.index,ji.geometry.attributes=a.attributes,ji.geometry.boundingBox===null)ji.geometry.boundingBox=new p;if(ji.geometry.boundingSphere===null)ji.geometry.boundingSphere=new E;for(let u=0,f=i.length;u<f;u++){if(!i[u].visible||!i[u].active)continue;let x=i[u].geometryIndex,A=s[x];ji.geometry.setDrawRange(A.start,A.count),this.getMatrixAt(u,ji.matrixWorld).premultiply(r),this.getBoundingBoxAt(x,ji.geometry.boundingBox),this.getBoundingSphereAt(x,ji.geometry.boundingSphere),ji.raycast(t,xa);for(let L=0,D=xa.length;L<D;L++){let R=xa[L];R.object=this,R.batchId=u,e.push(R)}xa.length=0}ji.material=null,ji.geometry.index=null,ji.geometry.attributes={},ji.geometry.setDrawRange(0,1/0)}copy(t){if(super.copy(t),this.geometry=t.geometry.clone(),this.perObjectFrustumCulled=t.perObjectFrustumCulled,this.sortObjects=t.sortObjects,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this._geometryInfo=t._geometryInfo.map((e)=>({...e,boundingBox:e.boundingBox!==null?e.boundingBox.clone():null,boundingSphere:e.boundingSphere!==null?e.boundingSphere.clone():null})),this._instanceInfo=t._instanceInfo.map((e)=>({...e})),this._availableInstanceIds=t._availableInstanceIds.slice(),this._availableGeometryIds=t._availableGeometryIds.slice(),this._nextIndexStart=t._nextIndexStart,this._nextVertexStart=t._nextVertexStart,this._geometryCount=t._geometryCount,this._maxInstanceCount=t._maxInstanceCount,this._maxVertexCount=t._maxVertexCount,this._maxIndexCount=t._maxIndexCount,this._geometryInitialized=t._geometryInitialized,this._multiDrawCounts=t._multiDrawCounts.slice(),this._multiDrawStarts=t._multiDrawStarts.slice(),this._multiDrawBytesPerElement=t._multiDrawBytesPerElement,this._mergedDrawCounts=t._mergedDrawCounts.slice(),this._mergedDrawStarts=t._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=t._mergedDrawInstanceCounts.slice(),this._indirectTexture=t._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=t._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),t._colorsTexture!==null)this._colorsTexture=t._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(t,e,i,s="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let r=e.getIndex(),a=r===null?1:r.array.BYTES_PER_ELEMENT,u=1;if(i.wireframe)u=2,a=e.attributes.position.count>65535?4:2;let f=this._instanceInfo,x=this._multiDrawStarts,A=this._multiDrawCounts,L=this._mergedDrawStarts,D=this._mergedDrawCounts,R=this._mergedDrawInstanceCounts,V=this._geometryInfo,rt=this.perObjectFrustumCulled,Ct=this._indirectTexture,j=Ct.image.data,it=t.isArrayCamera?mm:pm;if(rt)if(t.isArrayCamera)it.setFromArrayCamera(t);else cs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse).multiply(this.matrixWorld),it.setFromProjectionMatrix(cs,t.coordinateSystem,t.reversedDepth);let ft=0,Pt=0;if(this.sortObjects){cs.copy(this.matrixWorld).invert(),Su.setFromMatrixPosition(t.matrixWorld).applyMatrix4(cs),Mu.set(0,0,-1).transformDirection(t.matrixWorld).transformDirection(cs);for(let se=0,nt=f.length;se<nt;se++)if(f[se].visible&&f[se].active){let Rt=f[se].geometryIndex;this.getMatrixAt(se,cs),this.getBoundingSphereAt(Rt,gr).applyMatrix4(cs);let re=!1;if(rt)re=!it.intersectsSphere(gr);if(!re){let be=V[Rt],he=gm.subVectors(gr.center,Su).dot(Mu);Vl.push(be.start,be.count,he,se)}}let pt=Vl.list,Nt=this.customSort;if(Nt===null)pt.sort(i.transparent?fm:um);else Nt.call(this,pt,t);for(let se=0,nt=pt.length;se<nt;se++){let Rt=pt[se],re=Rt.start*a*u,be=Rt.count*u;if(s==="merged")if(Pt>0&&L[Pt-1]===re&&D[Pt-1]===be)R[Pt-1]++;else L[Pt]=re,D[Pt]=be,R[Pt]=1,Pt++;else x[ft]=re,A[ft]=be;j[ft]=Rt.index,ft++}Vl.reset()}else for(let pt=0,Nt=f.length;pt<Nt;pt++)if(f[pt].visible&&f[pt].active){let se=f[pt].geometryIndex,nt=!1;if(rt)this.getMatrixAt(pt,cs),this.getBoundingSphereAt(se,gr).applyMatrix4(cs),nt=!it.intersectsSphere(gr);if(!nt){let Rt=V[se],re=Rt.start*a*u,be=Rt.count*u;if(s==="merged")if(Pt>0&&L[Pt-1]===re&&D[Pt-1]===be)R[Pt-1]++;else L[Pt]=re,D[Pt]=be,R[Pt]=1,Pt++;else x[ft]=re,A[ft]=be;j[ft]=pt,ft++}}Ct.needsUpdate=!0,this._multiDrawCount=ft,this._mergedDrawCount=Pt,this._multiDrawBytesPerElement=a,this._visibilityChanged=!1}onBeforeRender(t,e,i,s,r){if(t.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(i,s,r)}onBeforeShadow(t,e,i,s,r,a){if(t.isWebGPURenderer!==!0)this._updateDrawParameters(s,r,a)}}class P extends F{constructor(t){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new c(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}var Ea=new n,wa=new n,bu=new o,So=new me,ya=new E,Wl=new n,Tu=new n;class ae extends M{constructor(t=new m,e=new P){super();this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let s=1,r=e.count;s<r;s++)Ea.fromBufferAttribute(e,s-1),wa.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=Ea.distanceTo(wa);t.setAttribute("lineDistance",new g(i,1))}else Yn("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null)i.computeBoundingSphere();if(ya.copy(i.boundingSphere),ya.applyMatrix4(s),ya.radius+=r,t.ray.intersectsSphere(ya)===!1)return;bu.copy(s).invert(),So.copy(t.ray).applyMatrix4(bu);let u=r/((this.scale.x+this.scale.y+this.scale.z)/3),f=u*u,x=this.isLineSegments?2:1,A=i.index,D=i.attributes.position;if(A!==null){let R=Math.max(0,a.start),V=Math.min(A.count,a.start+a.count);for(let rt=R,Ct=V-1;rt<Ct;rt+=x){let j=A.getX(rt),it=A.getX(rt+1),ft=va(this,t,So,f,j,it,rt);if(ft)e.push(ft)}if(this.isLineLoop){let rt=A.getX(V-1),Ct=A.getX(R),j=va(this,t,So,f,rt,Ct,V-1);if(j)e.push(j)}}else{let R=Math.max(0,a.start),V=Math.min(D.count,a.start+a.count);for(let rt=R,Ct=V-1;rt<Ct;rt+=x){let j=va(this,t,So,f,rt,rt+1,rt);if(j)e.push(j)}if(this.isLineLoop){let rt=va(this,t,So,f,V-1,R,V-1);if(rt)e.push(rt)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}}function va(t,e,i,s,r,a,u){let f=t.geometry.attributes.position;if(Ea.fromBufferAttribute(f,r),wa.fromBufferAttribute(f,a),i.distanceSqToSegment(Ea,wa,Wl,Tu)>s)return;Wl.applyMatrix4(t.matrixWorld);let A=e.ray.origin.distanceTo(Wl);if(A<e.near||A>e.far)return;return{distance:A,point:Tu.clone().applyMatrix4(t.matrixWorld),index:u,face:null,faceIndex:null,barycoord:null,object:t}}var Au=new n,Eu=new n;class X extends ae{constructor(t,e){super(t,e);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let s=0,r=e.count;s<r;s+=2)Au.fromBufferAttribute(e,s),Eu.fromBufferAttribute(e,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Au.distanceTo(Eu);t.setAttribute("lineDistance",new g(i,1))}else Yn("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ye extends ae{constructor(t,e){super(t,e);this.isLineLoop=!0,this.type="LineLoop"}}class ve extends F{constructor(t){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new c(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}var wu=new o,Zl=new me,Sa=new E,Ma=new n;class z extends M{constructor(t=new m,e=new ve){super();this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null)i.computeBoundingSphere();if(Sa.copy(i.boundingSphere),Sa.applyMatrix4(s),Sa.radius+=r,t.ray.intersectsSphere(Sa)===!1)return;wu.copy(s).invert(),Zl.copy(t.ray).applyMatrix4(wu);let u=r/((this.scale.x+this.scale.y+this.scale.z)/3),f=u*u,x=i.index,L=i.attributes.position;if(x!==null){let D=Math.max(0,a.start),R=Math.min(x.count,a.start+a.count);for(let V=D,rt=R;V<rt;V++){let Ct=x.getX(V);Ma.fromBufferAttribute(L,Ct),Ru(Ma,Ct,f,s,t,e,this)}}else{let D=Math.max(0,a.start),R=Math.min(L.count,a.start+a.count);for(let V=D,rt=R;V<rt;V++)Ma.fromBufferAttribute(L,V),Ru(Ma,V,f,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let u=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=r}}}}}function Ru(t,e,i,s,r,a,u){let f=Zl.distanceSqToPoint(t);if(f<i){let x=new n;Zl.closestPointToPoint(t,x),x.applyMatrix4(s);let A=r.ray.origin.distanceTo(x);if(A<r.near||A>r.far)return;a.push({distance:A,distanceToRay:Math.sqrt(f),point:x,index:e,face:null,faceIndex:null,barycoord:null,object:u})}}class Mt extends S{constructor(t=[],e,i,s,r,a,u,f,x,A,L,D){super(null,a,u,f,x,A,s,r,L,D);this.isCompressedTexture=!0,this.image={width:e,height:i},this.mipmaps=t,this.flipY=!1,this.generateMipmaps=!1}}class Ba extends S{constructor(t=[],e=301,i,s,r,a,u,f,x,A){super(t,e,i,s,r,a,u,f,x,A);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Bt extends S{constructor(t,e,i,s,r,a,u,f,x){super(t,e,i,s,r,a,u,f,x);this.isCanvasTexture=!0,this.needsUpdate=!0}}class nr extends S{constructor(t,e,i=1014,s,r,a,u=1003,f=1003,x,A=1026,L=1){if(A!==1026&&A!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let D={width:t,height:e,depth:L};super(D,s,r,a,u,f,A,i,x);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Io(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class za extends nr{constructor(t,e=1014,i=301,s,r,a=1003,u=1003,f,x=1026){let A={width:t,height:t,depth:1},L=[A,A,A,A,A,A];super(t,t,e,i,s,r,a,u,f,x);this.image=L,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Ga extends S{constructor(t=null){super();this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Ve extends m{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super();this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let u=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let f=[],x=[],A=[],L=[],D=0,R=0;V("z","y","x",-1,-1,i,e,t,a,r,0),V("z","y","x",1,-1,i,e,-t,a,r,1),V("x","z","y",1,1,t,i,e,s,a,2),V("x","z","y",1,-1,t,i,-e,s,a,3),V("x","y","z",1,-1,t,e,i,s,r,4),V("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(f),this.setAttribute("position",new g(x,3)),this.setAttribute("normal",new g(A,3)),this.setAttribute("uv",new g(L,2));function V(rt,Ct,j,it,ft,Pt,pt,Nt,se,nt,Rt){let re=Pt/se,be=pt/nt,he=Pt/2,Pe=pt/2,$e=Nt/2,fe=se+1,sn=nt+1,un=0,rn=0,wn=new n;for(let mn=0;mn<sn;mn++){let Sn=mn*be-Pe;for(let Tn=0;Tn<fe;Tn++){let Gn=Tn*re-he;wn[rt]=Gn*it,wn[Ct]=Sn*ft,wn[j]=$e,x.push(wn.x,wn.y,wn.z),wn[rt]=0,wn[Ct]=0,wn[j]=Nt>0?1:-1,A.push(wn.x,wn.y,wn.z),L.push(Tn/se),L.push(1-mn/nt),un+=1}}for(let mn=0;mn<nt;mn++)for(let Sn=0;Sn<se;Sn++){let Tn=D+Sn+fe*mn,Gn=D+Sn+fe*(mn+1),vn=D+(Sn+1)+fe*(mn+1),An=D+(Sn+1)+fe*mn;f.push(Tn,Gn,An),f.push(Gn,vn,An),rn+=6}u.addGroup(R,rn,Rt),R+=rn,D+=un}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ve(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class qe extends m{constructor(t=1,e=32,i=0,s=Math.PI*2){super();this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:s},e=Math.max(3,e);let r=[],a=[],u=[],f=[],x=new n,A=new l;a.push(0,0,0),u.push(0,0,1),f.push(0.5,0.5);for(let L=0,D=3;L<=e;L++,D+=3){let R=i+L/e*s;x.x=t*Math.cos(R),x.y=t*Math.sin(R),a.push(x.x,x.y,x.z),u.push(0,0,1),A.x=(a[D]/t+1)/2,A.y=(a[D+1]/t+1)/2,f.push(A.x,A.y)}for(let L=1;L<=e;L++)r.push(L,L+1,0);this.setIndex(r),this.setAttribute("position",new g(a,3)),this.setAttribute("normal",new g(u,3)),this.setAttribute("uv",new g(f,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new qe(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class ka extends m{constructor(t=1,e=1,i=1,s=32,r=1,a=!1,u=0,f=Math.PI*2){super();this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:u,thetaLength:f};let x=this;s=Math.floor(s),r=Math.floor(r);let A=[],L=[],D=[],R=[],V=0,rt=[],Ct=i/2,j=0;if(it(),a===!1){if(t>0)ft(!0);if(e>0)ft(!1)}this.setIndex(A),this.setAttribute("position",new g(L,3)),this.setAttribute("normal",new g(D,3)),this.setAttribute("uv",new g(R,2));function it(){let Pt=new n,pt=new n,Nt=0,se=(e-t)/i;for(let nt=0;nt<=r;nt++){let Rt=[],re=nt/r,be=re*(e-t)+t;for(let he=0;he<=s;he++){let Pe=he/s,$e=Pe*f+u,fe=Math.sin($e),sn=Math.cos($e);pt.x=be*fe,pt.y=-re*i+Ct,pt.z=be*sn,L.push(pt.x,pt.y,pt.z),Pt.set(fe,se,sn).normalize(),D.push(Pt.x,Pt.y,Pt.z),R.push(Pe,1-re),Rt.push(V++)}rt.push(Rt)}for(let nt=0;nt<s;nt++)for(let Rt=0;Rt<r;Rt++){let re=rt[Rt][nt],be=rt[Rt+1][nt],he=rt[Rt+1][nt+1],Pe=rt[Rt][nt+1];if(t>0||Rt!==0)A.push(re,be,Pe),Nt+=3;if(e>0||Rt!==r-1)A.push(be,he,Pe),Nt+=3}x.addGroup(j,Nt,0),j+=Nt}function ft(Pt){let pt=V,Nt=new l,se=new n,nt=0,Rt=Pt===!0?t:e,re=Pt===!0?1:-1;for(let he=1;he<=s;he++)L.push(0,Ct*re,0),D.push(0,re,0),R.push(0.5,0.5),V++;let be=V;for(let he=0;he<=s;he++){let $e=he/s*f+u,fe=Math.cos($e),sn=Math.sin($e);se.x=Rt*sn,se.y=Ct*re,se.z=Rt*fe,L.push(se.x,se.y,se.z),D.push(0,re,0),Nt.x=fe*0.5+0.5,Nt.y=sn*0.5*re+0.5,R.push(Nt.x,Nt.y),V++}for(let he=0;he<s;he++){let Pe=pt+he,$e=be+he;if(Pt===!0)A.push($e,$e+1,Pe);else A.push($e+1,$e,Pe);nt+=3}x.addGroup(j,nt,Pt===!0?1:2),j+=nt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ka(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Et extends ka{constructor(t=1,e=1,i=32,s=1,r=!1,a=0,u=Math.PI*2){super(0,t,e,i,s,r,a,u);this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:u}}static fromJSON(t){return new Et(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Do extends m{constructor(t=1,e=1,i=1,s=1){super();this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,a=e/2,u=Math.floor(i),f=Math.floor(s),x=u+1,A=f+1,L=t/u,D=e/f,R=[],V=[],rt=[],Ct=[];for(let j=0;j<A;j++){let it=j*D-a;for(let ft=0;ft<x;ft++){let Pt=ft*L-r;V.push(Pt,-it,0),rt.push(0,0,1),Ct.push(ft/u),Ct.push(1-j/f)}}for(let j=0;j<f;j++)for(let it=0;it<u;it++){let ft=it+x*j,Pt=it+x*(j+1),pt=it+1+x*(j+1),Nt=it+1+x*j;R.push(ft,Pt,Nt),R.push(Pt,pt,Nt)}this.setIndex(R),this.setAttribute("position",new g(V,3)),this.setAttribute("normal",new g(rt,3)),this.setAttribute("uv",new g(Ct,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Do(t.width,t.height,t.widthSegments,t.heightSegments)}}class Ht extends m{constructor(t=null){super();if(this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],i=new Set,s=new n,r=new n;if(t.index!==null){let a=t.attributes.position,{index:u,groups:f}=t;if(f.length===0)f=[{start:0,count:u.count,materialIndex:0}];for(let x=0,A=f.length;x<A;++x){let L=f[x],{start:D,count:R}=L;for(let V=D,rt=D+R;V<rt;V+=3)for(let Ct=0;Ct<3;Ct++){let j=u.getX(V+Ct),it=u.getX(V+(Ct+1)%3);if(s.fromBufferAttribute(a,j),r.fromBufferAttribute(a,it),Cu(s,r,i)===!0)e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z)}}}else{let a=t.attributes.position;for(let u=0,f=a.count/3;u<f;u++)for(let x=0;x<3;x++){let A=3*u+x,L=3*u+(x+1)%3;if(s.fromBufferAttribute(a,A),r.fromBufferAttribute(a,L),Cu(s,r,i)===!0)e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z)}}this.setAttribute("position",new g(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}function Cu(t,e,i){let s=`${t.x},${t.y},${t.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${t.x},${t.y},${t.z}`;if(i.has(s)===!0||i.has(r)===!0)return!1;else return i.add(s),i.add(r),!0}function br(t){let e={};for(let i in t){e[i]={};for(let s in t[i]){let r=t[i][s];if(Iu(r))if(r.isRenderTargetTexture)Yn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[i][s]=null;else e[i][s]=r.clone();else if(Array.isArray(r))if(Iu(r[0])){let a=[];for(let u=0,f=r.length;u<f;u++)a[u]=r[u].clone();e[i][s]=a}else e[i][s]=r.slice();else e[i][s]=r}}return e}function ts(t){let e={};for(let i=0;i<t.length;i++){let s=br(t[i]);for(let r in s)e[r]=s[r]}return e}function Iu(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function xm(t){let e=[];for(let i=0;i<t.length;i++)e.push(t[i].clone());return e}function Qc(t){let e=t.getRenderTarget();if(e===null)return t.outputColorSpace;if(e.isXRRenderTarget===!0)return e.texture.colorSpace;return y.workingColorSpace}var Yt={clone:br,merge:ts},ym=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,vm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class le extends F{constructor(t){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=ym,this.fragmentShader=vm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0)this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=br(t.uniforms),this.uniformsGroups=xm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;if(a&&a.isTexture)e.uniforms[s]={type:"t",value:a.toJSON(t).uuid};else if(a&&a.isColor)e.uniforms[s]={type:"c",value:a.getHex()};else if(a&&a.isVector2)e.uniforms[s]={type:"v2",value:a.toArray()};else if(a&&a.isVector3)e.uniforms[s]={type:"v3",value:a.toArray()};else if(a&&a.isVector4)e.uniforms[s]={type:"v4",value:a.toArray()};else if(a&&a.isMatrix3)e.uniforms[s]={type:"m3",value:a.toArray()};else if(a&&a.isMatrix4)e.uniforms[s]={type:"m4",value:a.toArray()};else e.uniforms[s]={value:a}}if(Object.keys(this.defines).length>0)e.defines=this.defines;e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)if(this.extensions[s]===!0)i[s]=!0;if(Object.keys(i).length>0)e.extensions=i;return e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new c().setHex(s.value);break;case"v2":this.uniforms[i].value=new l().fromArray(s.value);break;case"v3":this.uniforms[i].value=new n().fromArray(s.value);break;case"v4":this.uniforms[i].value=new b().fromArray(s.value);break;case"m3":this.uniforms[i].value=new ei().fromArray(s.value);break;case"m4":this.uniforms[i].value=new o().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0)this.defines=t.defines;if(t.vertexShader!==void 0)this.vertexShader=t.vertexShader;if(t.fragmentShader!==void 0)this.fragmentShader=t.fragmentShader;if(t.glslVersion!==void 0)this.glslVersion=t.glslVersion;if(t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];if(t.lights!==void 0)this.lights=t.lights;if(t.clipping!==void 0)this.clipping=t.clipping;return this}}class jc extends le{constructor(t){super(t);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class G extends F{constructor(t){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new c(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new c(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new l(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bs,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class ie extends G{constructor(t){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new l(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ti(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+0.4*e)/(1-0.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new c(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new c(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new c(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){if(this._anisotropy>0!==t>0)this.version++;this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){if(this._clearcoat>0!==t>0)this.version++;this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){if(this._diffuseRoughness>0!==t>0)this.version++;this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){if(this._iridescence>0!==t>0)this.version++;this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){if(this._dispersion>0!==t>0)this.version++;this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){if(this._retroreflectivity>0!==t>0)this.version++;this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){if(this._sheen>0!==t>0)this.version++;this._sheen=t}get transmission(){return this._transmission}set transmission(t){if(this._transmission>0!==t>0)this.version++;this._transmission=t}get iridescenceThicknessRange(){return _r('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){_r('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class Ae extends F{constructor(t){super();this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new c(16777215),this.specular=new c(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new c(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new l(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bs,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Be extends F{constructor(t){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new c(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new c(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new l(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new bs,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class th extends F{constructor(t){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class eh extends F{constructor(t){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Ft extends P{constructor(t){super();this.isLineDashedMaterial=!0,this.type="LineDashedMaterial",this.scale=1,this.dashSize=3,this.gapSize=1,this.setValues(t)}copy(t){return super.copy(t),this.scale=t.scale,this.dashSize=t.dashSize,this.gapSize=t.gapSize,this}}function js(t,e){if(!t||t.constructor===e)return t;if(typeof e.BYTES_PER_ELEMENT==="number")return new e(t);return Array.prototype.slice.call(t)}function Mo(t){return t!==void 0&&t.inTangents!==void 0&&t.outTangents!==void 0}function Sm(t){function e(r,a){return t[r]-t[a]}let i=t.length,s=Array(i);for(let r=0;r!==i;++r)s[r]=r;return s.sort(e),s}function Pu(t,e,i){let s=t.length,r=new t.constructor(s);for(let a=0,u=0;u!==s;++a){let f=i[a]*e;for(let x=0;x!==e;++x)r[u++]=t[f+x]}return r}function Mm(t,e,i,s){let r=1,a=t[0];while(a!==void 0&&a[s]===void 0)a=t[r++];if(a===void 0)return;let u=a[s];if(u===void 0)return;if(Array.isArray(u))do{if(u=a[s],u!==void 0)e.push(a.time),i.push(...u);a=t[r++]}while(a!==void 0);else if(u.toArray!==void 0)do{if(u=a[s],u!==void 0)e.push(a.time),u.toArray(i,i.length);a=t[r++]}while(a!==void 0);else do{if(u=a[s],u!==void 0)e.push(a.time),i.push(u);a=t[r++]}while(a!==void 0)}class Re{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];n:{t:{let a;e:{i:if(!(t<s)){for(let u=i+2;;){if(s===void 0){if(t<r)break i;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===u)break;if(r=s,s=e[++i],t<s)break t}a=e.length;break e}if(!(t>=r)){let u=e[1];if(t<u)i=2,r=u;for(let f=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===f)break;if(s=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break n}while(i<a){let u=i+a>>>1;if(t<e[u])a=u;else i=u+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=i[r+a];return e}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class nh extends Re{constructor(t,e,i,s){super(t,e,i,s);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,a=t+1,u=s[r],f=s[a];if(u===void 0)switch(this.getSettings_().endingStart){case 2401:r=t,u=2*e-i;break;case 2402:r=s.length-2,u=e+s[r]-s[r+1];break;default:r=t,u=i}if(f===void 0)switch(this.getSettings_().endingEnd){case 2401:a=t,f=2*i-e;break;case 2402:a=1,f=i+s[1]-s[0];break;default:a=t-1,f=e}let x=(i-e)*0.5,A=this.valueSize;this._weightPrev=x/(e-u),this._weightNext=x/(f-i),this._offsetPrev=r*A,this._offsetNext=a*A}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,f=t*u,x=f-u,A=this._offsetPrev,L=this._offsetNext,D=this._weightPrev,R=this._weightNext,V=(i-e)/(s-e),rt=V*V,Ct=rt*V,j=-D*Ct+2*D*rt-D*V,it=(1+D)*Ct+(-1.5-2*D)*rt+(-0.5+D)*V+1,ft=(-1-R)*Ct+(1.5+R)*rt+0.5*V,Pt=R*Ct-R*rt;for(let pt=0;pt!==u;++pt)r[pt]=j*a[A+pt]+it*a[x+pt]+ft*a[f+pt]+Pt*a[L+pt];return r}}class ih extends Re{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,f=t*u,x=f-u,A=(i-e)/(s-e),L=1-A;for(let D=0;D!==u;++D)r[D]=a[x+D]*L+a[f+D]*A;return r}}class sh extends Re{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}}class rh extends Re{interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,f=t*u,x=f-u,A=this.inTangents,L=this.outTangents;if(!A||!L){let V=(i-e)/(s-e),rt=1-V;for(let Ct=0;Ct!==u;++Ct)r[Ct]=a[x+Ct]*rt+a[f+Ct]*V;return r}let D=u*2,R=t-1;for(let V=0;V!==u;++V){let rt=a[x+V],Ct=a[f+V],j=R*D+V*2,it=L[j],ft=L[j+1],Pt=t*D+V*2,pt=A[Pt],Nt=A[Pt+1],se=Tm(i,e,it,pt,s);r[V]=Bf(se,rt,ft,Nt,Ct)}return r}}function Bf(t,e,i,s,r){let a=1-t;return a*a*a*e+3*a*a*t*i+3*a*t*t*s+t*t*t*r}function bm(t,e,i,s,r){let a=1-t;return 3*a*a*(i-e)+6*a*t*(s-i)+3*t*t*(r-s)}function Tm(t,e,i,s,r){let a=(t-e)/(r-e);for(let u=0;u<8;u++){let f=Bf(a,e,i,s,r)-t;if(Math.abs(f)<0.0000000001)break;let x=bm(a,e,i,s,r);if(Math.abs(x)<0.0000000001)break;a=Math.max(0,Math.min(1,a-f/x))}return a}class ds{constructor(t,e,i,s){if(t===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=js(e,this.TimeBufferType),this.values=js(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:js(t.times,Array),values:js(t.values,Array)};let s=t.getInterpolation();if(s!==t.DefaultInterpolation)i.interpolation=s;if(Mo(t.settings))i.settings={inTangents:js(t.settings.inTangents,Array),outTangents:js(t.settings.outTangents,Array)}}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new sh(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ih(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new nh(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new rh(this.times,this.values,this.getValueSize(),t);if(this.settings)e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents;return e}setInterpolation(t){let e;switch(t){case 2300:e=this.InterpolantFactoryMethodDiscrete;break;case 2301:e=this.InterpolantFactoryMethodLinear;break;case 2302:e=this.InterpolantFactoryMethodSmooth;break;case 2303:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(i);return Yn("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t;if(Mo(this.settings))Lu(this.settings.inTangents,t),Lu(this.settings.outTangents,t)}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t;if(Mo(this.settings))Nu(this.settings.inTangents,t),Nu(this.settings.outTangents,t)}return this}trim(t,e){let i=this.times,s=i.length,r=0,a=s-1;while(r!==s&&i[r]<t)++r;while(a!==-1&&i[a]>e)--a;if(++a,r!==0||a!==s){if(r>=a)a=Math.max(a,1),r=a-1;let u=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*u,a*u)}return this}validate(){let t=!0,e=this.getValueSize();if(e-Math.floor(e)!==0)jn("KeyframeTrack: Invalid value size in track.",this),t=!1;let i=this.times,s=this.values,r=i.length;if(r===0)jn("KeyframeTrack: Track is empty.",this),t=!1;let a=null;for(let u=0;u!==r;u++){let f=i[u];if(typeof f==="number"&&isNaN(f)){jn("KeyframeTrack: Time is not a valid number.",this,u,f),t=!1;break}if(a!==null&&a>f){jn("KeyframeTrack: Out of order keys.",this,u,f,a),t=!1;break}a=f}if(s!==void 0){if(Rp(s))for(let u=0,f=s.length;u!==f;++u){let x=s[u];if(isNaN(x)){jn("KeyframeTrack: Value is not a valid number.",this,u,x),t=!1;break}}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===2302,r=t.length-1,a=1;for(let u=1;u<r;++u){let f=!1,x=t[u],A=t[u+1];if(x!==A&&(u!==1||x!==t[0]))if(!s){let L=u*i,D=L-i,R=L+i;for(let V=0;V!==i;++V){let rt=e[L+V];if(rt!==e[D+V]||rt!==e[R+V]){f=!0;break}}}else f=!0;if(f){if(u!==a){t[a]=t[u];let L=u*i,D=a*i;for(let R=0;R!==i;++R)e[D+R]=e[L+R]}++a}}if(r>0){t[a]=t[r];for(let u=r*i,f=a*i,x=0;x!==i;++x)e[f+x]=e[u+x];++a}if(a!==t.length)this.times=t.slice(0,a),this.values=e.slice(0,a*i);else this.times=t,this.values=e;return this}clone(){let t=this.times.slice(),e=this.values.slice(),s=new this.constructor(this.name,t,e);if(s.createInterpolant=this.createInterpolant,Mo(this.settings))s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return s}}function Lu(t,e){for(let i=0,s=t.length;i!==s;i+=2)t[i]+=e}function Nu(t,e){for(let i=0,s=t.length;i!==s;i+=2)t[i]*=e}ds.prototype.ValueTypeName="";ds.prototype.TimeBufferType=Float32Array;ds.prototype.ValueBufferType=Float32Array;ds.prototype.DefaultInterpolation=2301;class ir extends ds{constructor(t,e,i){super(t,e,i)}}ir.prototype.ValueTypeName="bool";ir.prototype.ValueBufferType=Array;ir.prototype.DefaultInterpolation=2300;ir.prototype.InterpolantFactoryMethodLinear=void 0;ir.prototype.InterpolantFactoryMethodSmooth=void 0;class Ha extends ds{constructor(t,e,i,s){super(t,e,i,s)}}Ha.prototype.ValueTypeName="color";class He extends ds{constructor(t,e,i,s){super(t,e,i,s)}}He.prototype.ValueTypeName="number";class oh extends Re{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,u=this.valueSize,f=(i-e)/(s-e),x=t*u;for(let A=x+u;x!==A;x+=4)H.slerpFlat(r,0,a,x-u,a,x,f);return r}}class Fe extends ds{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new oh(this.times,this.values,this.getValueSize(),t)}}Fe.prototype.ValueTypeName="quaternion";Fe.prototype.InterpolantFactoryMethodSmooth=void 0;class sr extends ds{constructor(t,e,i){super(t,e,i)}}sr.prototype.ValueTypeName="string";sr.prototype.ValueBufferType=Array;sr.prototype.DefaultInterpolation=2300;sr.prototype.InterpolantFactoryMethodLinear=void 0;sr.prototype.InterpolantFactoryMethodSmooth=void 0;class Je extends ds{constructor(t,e,i,s){super(t,e,i,s)}}Je.prototype.ValueTypeName="vector";class zt{constructor(t="",e=-1,i=[],s=2500){if(this.name=t,this.tracks=i,this.duration=e,this.blendMode=s,this.uuid=Ls(),this.userData={},this.duration<0)this.resetDuration()}static parse(t){let e=[],i=t.tracks,s=1/(t.fps||1);for(let a=0,u=i.length;a!==u;++a)e.push(Em(i[a]).scale(s));let r=new this(t.name,t.duration,e,t.blendMode);return r.uuid=t.uuid,r.userData=JSON.parse(t.userData||"{}"),r}static toJSON(t){let e=[],i=t.tracks,s={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode,userData:JSON.stringify(t.userData)};for(let r=0,a=i.length;r!==a;++r)e.push(ds.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(t,e,i,s){let r=e.length,a=[];for(let u=0;u<r;u++){let f=[],x=[];f.push((u+r-1)%r,u,(u+1)%r),x.push(0,1,0);let A=Sm(f);if(f=Pu(f,1,A),x=Pu(x,1,A),!s&&f[0]===0)f.push(r),x.push(x[0]);a.push(new He(".morphTargetInfluences["+e[u].name+"]",f,x).scale(1/i))}return new this(t,-1,a)}static findByName(t,e){let i=t;if(!Array.isArray(t)){let s=t;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===e)return i[s];return null}static CreateClipsFromMorphTargetSequences(t,e,i){let s={},r=/^([\w-]*?)([\d]+)$/;for(let u=0,f=t.length;u<f;u++){let x=t[u],A=x.name.match(r);if(A&&A.length>1){let L=A[1],D=s[L];if(!D)s[L]=D=[];D.push(x)}}let a=[];for(let u in s)a.push(this.CreateFromMorphTargetSequence(u,s[u],e,i));return a}resetDuration(){let t=this.tracks,e=0;for(let i=0,s=t.length;i!==s;++i){let r=this.tracks[i];e=Math.max(e,r.times[r.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let i=0;i<this.tracks.length;i++)t.push(this.tracks[i].clone());let e=new this.constructor(this.name,this.duration,t,this.blendMode);return e.userData=JSON.parse(JSON.stringify(this.userData)),e}toJSON(){return this.constructor.toJSON(this)}}function Am(t){switch(t.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return He;case"vector":case"vector2":case"vector3":case"vector4":return Je;case"color":return Ha;case"quaternion":return Fe;case"bool":case"boolean":return ir;case"string":return sr}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+t)}function Em(t){if(t.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=Am(t.type);if(t.times===void 0){let s=[],r=[];Mm(t.keys,s,r,"value"),t.times=s,t.values=r}let i;if(e.parse!==void 0)i=e.parse(t);else i=new e(t.name,t.times,t.values,t.interpolation);if(Mo(t.settings))i.settings={inTangents:js(t.settings.inTangents,Float32Array),outTangents:js(t.settings.outTangents,Float32Array)};return i}var Cs={enabled:!1,files:{},add:function(t,e){if(this.enabled===!1)return;if(Du(t))return;this.files[t]=e},get:function(t){if(this.enabled===!1)return;if(Du(t))return;return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};function Du(t){try{let e=t.slice(t.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch(e){return!1}}class ah{constructor(t,e,i){let s=this,r=!1,a=0,u=0,f=void 0,x=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(A){if(u++,r===!1){if(s.onStart!==void 0)s.onStart(A,a,u)}r=!0},this.itemEnd=function(A){if(a++,s.onProgress!==void 0)s.onProgress(A,a,u);if(a===u){if(r=!1,s.onLoad!==void 0)s.onLoad()}},this.itemError=function(A){if(s.onError!==void 0)s.onError(A)},this.resolveURL=function(A){if(A=A.normalize("NFC"),f)return f(A);return A},this.setURLModifier=function(A){return f=A,this},this.addHandler=function(A,L){return x.push(A,L),this},this.removeHandler=function(A){let L=x.indexOf(A);if(L!==-1)x.splice(L,2);return this},this.getHandler=function(A){for(let L=0,D=x.length;L<D;L+=2){let R=x[L],V=x[L+1];if(R.global)R.lastIndex=0;if(R.test(A))return V}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var zf=new ah;class Se{constructor(t){if(this.manager=t!==void 0?t:zf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}}Se.DEFAULT_MATERIAL_NAME="__DEFAULT";var Vs={};class Gf extends Error{constructor(t,e){super(t);this.response=e}}class ut extends Se{constructor(t){super(t);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(t,e,i,s){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let r=Cs.get(`file:${t}`);if(r!==void 0){this.manager.itemStart(t),setTimeout(()=>{if(e)e(r);this.manager.itemEnd(t)},0);return}if(Vs[t]!==void 0){Vs[t].push({onLoad:e,onProgress:i,onError:s});return}Vs[t]=[],Vs[t].push({onLoad:e,onProgress:i,onError:s});let a=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),u=this.mimeType,f=this.responseType;fetch(a).then((x)=>{if(x.status===200||x.status===0){if(x.status===0)Yn("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||x.body===void 0||x.body.getReader===void 0)return x;let A=Vs[t],L=x.body.getReader(),D=x.headers.get("X-File-Size")||x.headers.get("Content-Length"),R=D?parseInt(D):0,V=R!==0,rt=0,Ct=new ReadableStream({start(j){it();function it(){L.read().then(({done:ft,value:Pt})=>{if(ft)j.close();else{rt+=Pt.byteLength;let pt=new ProgressEvent("progress",{lengthComputable:V,loaded:rt,total:R});for(let Nt=0,se=A.length;Nt<se;Nt++){let nt=A[Nt];if(nt.onProgress)nt.onProgress(pt)}j.enqueue(Pt),it()}},(ft)=>{j.error(ft)})}}});return new Response(Ct)}else throw new Gf(`fetch for "${x.url}" responded with ${x.status}: ${x.statusText}`,x)}).then((x)=>{switch(f){case"arraybuffer":return x.arrayBuffer();case"blob":return x.blob();case"document":return x.text().then((A)=>new DOMParser().parseFromString(A,u));case"json":return x.json();default:if(u==="")return x.text();else{let L=/charset="?([^;"\s]*)"?/i.exec(u),D=L&&L[1]?L[1].toLowerCase():void 0,R=new TextDecoder(D);return x.arrayBuffer().then((V)=>R.decode(V))}}}).then((x)=>{Cs.add(`file:${t}`,x);let A=Vs[t];delete Vs[t];for(let L=0,D=A.length;L<D;L++){let R=A[L];if(R.onLoad)R.onLoad(x)}}).catch((x)=>{let A=Vs[t];if(A===void 0)throw this.manager.itemError(t),x;delete Vs[t];for(let L=0,D=A.length;L<D;L++){let R=A[L];if(R.onError)R.onError(x)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Gt extends Se{constructor(t){super(t)}load(t,e,i,s){let r=this,a=[],u=new Mt,f=new ut(this.manager);f.setPriority(this.priority),f.setCache(this.cache),f.setPath(this.path),f.setResponseType("arraybuffer"),f.setRequestHeader(this.requestHeader),f.setWithCredentials(r.withCredentials);let x=0;function A(L){f.load(t[L],function(D){let R=r.parse(D,!0);if(a[L]={width:R.width,height:R.height,format:R.format,mipmaps:R.mipmaps},x+=1,x===6){if(R.mipmapCount===1)u.minFilter=1006;if(u.image=a,u.format=R.format,u.needsUpdate=!0,e)e(u)}},i,s)}if(Array.isArray(t))for(let L=0,D=t.length;L<D;++L)A(L);else f.load(t,function(L){let D=r.parse(L,!0);if(D.isCubemap){let R=D.mipmaps.length/D.mipmapCount;for(let V=0;V<R;V++){a[V]={mipmaps:[]};for(let rt=0;rt<D.mipmapCount;rt++)a[V].mipmaps.push(D.mipmaps[V*D.mipmapCount+rt]),a[V].format=D.format,a[V].width=D.width,a[V].height=D.height}u.image=a}else u.image.width=D.width,u.image.height=D.height,u.mipmaps=D.mipmaps;if(D.mipmapCount===1)u.minFilter=1006;if(u.format=D.format,u.needsUpdate=!0,e)e(u)},i,s);return u}}var zr=new WeakMap;class lh extends Se{constructor(t){super(t)}load(t,e,i,s){if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let r=this,a=Cs.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){if(e)e(a);r.manager.itemEnd(t)},0);else{let L=zr.get(a);if(L===void 0)L=[],zr.set(a,L);L.push({onLoad:e,onError:s})}return a}let u=Xr("img");function f(){if(A(),e)e(this);let L=zr.get(this)||[];for(let D=0;D<L.length;D++){let R=L[D];if(R.onLoad)R.onLoad(this)}zr.delete(this),r.manager.itemEnd(t)}function x(L){if(A(),s)s(L);Cs.remove(`image:${t}`);let D=zr.get(this)||[];for(let R=0;R<D.length;R++){let V=D[R];if(V.onError)V.onError(L)}zr.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function A(){u.removeEventListener("load",f,!1),u.removeEventListener("error",x,!1)}if(u.addEventListener("load",f,!1),u.addEventListener("error",x,!1),t.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)u.crossOrigin=this.crossOrigin}return Cs.add(`image:${t}`,u),r.manager.itemStart(t),u.fetchPriority=this.priority,u.src=t,u}}class Zt extends Se{constructor(t){super(t)}load(t,e,i,s){let r=new S,a=new lh(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(u){if(r.image=u,r.needsUpdate=!0,e!==void 0)e(r)},i,s),r}}class ye extends M{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super();this.isLight=!0,this.type="Light",this.color=new c(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class $t extends ye{constructor(t,e,i){super(t,i);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(M.DEFAULT_UP),this.updateMatrix(),this.groundColor=new c(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}var Xl=new o,Uu=new n,Fu=new n;class Qe{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new l(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new o,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new de,this._frameExtents=new l(1,1),this._viewportCount=1,this._viewports=[new b(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Uu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Uu),Fu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Fu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){Xl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Xl,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,u=s?s.w/r.y:1,f=s?s.x/r.x:0,x=s?s.y/r.y:0;if(t.coordinateSystem===2001||t.reversedDepth)e.set(0.5*a,0,0,0.5*a+f,0,0.5*u,0,0.5*u+x,0,0,1,0,0,0,0,1);else e.set(0.5*a,0,0,0.5*a+f,0,0.5*u,0,0.5*u+x,0,0,0.5,0.5,0,0,0,1);e.multiply(Xl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}var ba=new n,Ta=new H,Rs=new n;class Va extends M{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new o,this.projectionMatrix=new o,this.projectionMatrixInverse=new o,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.matrixWorld.decompose(ba,Ta,Rs),Rs.x===1&&Rs.y===1&&Rs.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(ba,Ta,Rs.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){if(super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(ba,Ta,Rs),Rs.x===1&&Rs.y===1&&Rs.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(ba,Ta,Rs.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Qs=new n,Ou=new l,Bu=new l;class U extends Va{constructor(t=50,e=1,i=0.1,s=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=0.5*this.getFilmHeight()/t;this.fov=xr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(bo*0.5*this.fov);return 0.5*this.getFilmHeight()/t}getEffectiveFOV(){return xr*2*Math.atan(Math.tan(bo*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Qs.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),e.set(Qs.x,Qs.y).multiplyScalar(-t/Qs.z),Qs.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),i.set(Qs.x,Qs.y).multiplyScalar(-t/Qs.z)}getViewSize(t,e){return this.getViewBounds(t,Ou,Bu),e.subVectors(Bu,Ou)}setViewOffset(t,e,i,s,r,a){if(this.aspect=t/e,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(bo*0.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-0.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:f,fullHeight:x}=a;r+=a.offsetX*s/f,e-=a.offsetY*i/x,s*=a.width/f,i*=a.height/x}let u=this.filmOffset;if(u!==0)r+=t*u/this.getFilmWidth();this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null)e.object.view=Object.assign({},this.view);return e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class kf extends Qe{constructor(){super(new U(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,i=xr*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;if(i!==e.fov||s!==e.aspect||r!==e.far)e.fov=i,e.aspect=s,e.far=r,e.updateProjectionMatrix();super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}}class Kt extends ye{constructor(t,e,i=0,s=Math.PI/3,r=0,a=2){super(t,e);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(M.DEFAULT_UP),this.updateMatrix(),this.target=new M,this.distance=i,this.angle=s,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new kf}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);if(e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture)e.object.map=this.map.toJSON(t).uuid;return e.object.shadow=this.shadow.toJSON(),e}}class Hf extends Qe{constructor(){super(new U(90,1,0.5,500));this.isPointLightShadow=!0}}class dt extends ye{constructor(t,e,i=0,s=2){super(t,e);this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Hf}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class Ce extends Va{constructor(t=-1,e=1,i=1,s=-1,r=0.1,a=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,a=i+t,u=s+e,f=s-e;if(this.view!==null&&this.view.enabled){let x=(this.right-this.left)/this.view.fullWidth/this.zoom,A=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=x*this.view.offsetX,a=r+x*this.view.width,u-=A*this.view.offsetY,f=u-A*this.view.height}this.projectionMatrix.makeOrthographic(r,a,u,f,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null)e.object.view=Object.assign({},this.view);return e}}class Vf extends Qe{constructor(){super(new Ce(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class ze extends ye{constructor(t,e){super(t,e);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(M.DEFAULT_UP),this.updateMatrix(),this.target=new M,this.shadow=new Vf}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}class jt extends ye{constructor(t,e){super(t,e);this.isAmbientLight=!0,this.type="AmbientLight"}}class Ge{static extractUrlBase(t){let e=t.lastIndexOf("/");if(e===-1)return"./";return t.slice(0,e+1)}static resolveURL(t,e){if(typeof t!=="string"||t==="")return"";if(/^https?:\/\//i.test(e)&&/^\//.test(t))e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(t))return t;if(/^data:.*,.*$/i.test(t))return t;if(/^blob:.*$/i.test(t))return t;return e+t}}class qt extends m{constructor(){super();this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}}var ql=new WeakMap;class Jt extends Se{constructor(t){super(t);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")Yn("ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")Yn("ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(t){return this.options=t,this}load(t,e,i,s){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let r=this,a=Cs.get(`image-bitmap:${t}`);if(a!==void 0){if(r.manager.itemStart(t),a.then){a.then((x)=>{if(ql.has(a)===!0){if(s)s(ql.get(a));r.manager.itemError(t),r.manager.itemEnd(t)}else{if(e)e(x);r.manager.itemEnd(t)}});return}setTimeout(function(){if(e)e(a);r.manager.itemEnd(t)},0);return}let u={};u.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",u.headers=this.requestHeader,u.priority=this.priority,u.cache=this.cache,u.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let f=fetch(t,u).then(function(x){return x.blob()}).then(function(x){return createImageBitmap(x,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(x){if(Cs.add(`image-bitmap:${t}`,x),e)e(x);return r.manager.itemEnd(t),x}).catch(function(x){if(s)s(x);ql.set(f,x),Cs.remove(`image-bitmap:${t}`),r.manager.itemError(t),r.manager.itemEnd(t)});Cs.add(`image-bitmap:${t}`,f),r.manager.itemStart(t)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var Gr=-90,kr=1;class Uo extends M{constructor(t,e,i){super();this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new U(Gr,kr,t,e);s.layers=this.layers,this.add(s);let r=new U(Gr,kr,t,e);r.layers=this.layers,this.add(r);let a=new U(Gr,kr,t,e);a.layers=this.layers,this.add(a);let u=new U(Gr,kr,t,e);u.layers=this.layers,this.add(u);let f=new U(Gr,kr,t,e);f.layers=this.layers,this.add(f);let x=new U(Gr,kr,t,e);x.layers=this.layers,this.add(x)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,u,f]=e;for(let x of e)this.remove(x);if(t===2000)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),f.up.set(0,1,0),f.lookAt(0,0,-1);else if(t===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),f.up.set(0,-1,0),f.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let x of e)this.add(x),x.updateMatrixWorld()}update(t,e){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;if(this.coordinateSystem!==t.coordinateSystem)this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem();let[r,a,u,f,x,A]=this.children,L=t.getRenderTarget(),D=t.getActiveCubeFace(),R=t.getActiveMipmapLevel(),V=t.xr.enabled;t.xr.enabled=!1;let rt=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let Ct=!1;if(t.isWebGLRenderer===!0)Ct=t.state.buffers.depth.getReversed();else Ct=t.reversedDepthBuffer;if(t.setRenderTarget(i,0,s),Ct&&t.autoClear===!1)t.clearDepth();if(t.render(e,r),t.setRenderTarget(i,1,s),Ct&&t.autoClear===!1)t.clearDepth();if(t.render(e,a),t.setRenderTarget(i,2,s),Ct&&t.autoClear===!1)t.clearDepth();if(t.render(e,u),t.setRenderTarget(i,3,s),Ct&&t.autoClear===!1)t.clearDepth();if(t.render(e,f),t.setRenderTarget(i,4,s),Ct&&t.autoClear===!1)t.clearDepth();if(t.render(e,x),i.texture.mipmapsAutoUpdate=rt,t.setRenderTarget(i,5,s),Ct&&t.autoClear===!1)t.clearDepth();t.render(e,A),t.setRenderTarget(L,D,R),t.xr.enabled=V,i.texture.needsPMREMUpdate=!0}}class ch extends U{constructor(t=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}var hh="\\[\\]\\.:\\/",wm=new RegExp("["+hh+"]","g"),uh="[^"+hh+"]",Rm="[^"+hh.replace("\\.","")+"]",Cm=/((?:WC+[\/:])*)/.source.replace("WC",uh),Im=/(WCOD+)?/.source.replace("WCOD",Rm),Pm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",uh),Lm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",uh),Nm=new RegExp("^"+Cm+Im+Pm+Lm+"$"),Dm=["material","materials","bones","map"];class Wf{constructor(t,e,i){let s=i||T.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];if(s!==void 0)s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}}class T{constructor(t,e,i){this.path=e,this.parsedPath=i||T.parseTrackName(e),this.node=T.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){if(!(t&&t.isAnimationObjectGroup))return new T(t,e,i);else return new T.Composite(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(wm,"")}static parseTrackName(t){let e=Nm.exec(t);if(e===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);if(Dm.indexOf(r)!==-1)i.nodeName=i.nodeName.substring(0,s),i.objectName=r}if(i.propertyName===null||i.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let u=r[a];if(u.name===e||u.uuid===e)return u;let f=i(u.children);if(f)return f}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,{objectName:i,propertyName:s,propertyIndex:r}=e;if(!t)t=T.findNode(this.rootNode,e.nodeName),this.node=t;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Yn("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let x=e.objectIndex;switch(i){case"materials":if(!t.material){jn("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){jn("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){jn("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let A=0;A<t.length;A++)if(t[A].name===x){x=A;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){jn("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){jn("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){jn("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(x!==void 0){if(t[x]===void 0){jn("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[x]}}let a=t[s];if(a===void 0){let x=e.nodeName;jn("PropertyBinding: Trying to update property for track: "+x+"."+s+" but it wasn't found.",t);return}let u=this.Versioning.None;if(this.targetObject=t,t.isMaterial===!0)u=this.Versioning.NeedsUpdate;else if(t.isObject3D===!0)u=this.Versioning.MatrixWorldNeedsUpdate;let f=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){jn("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){jn("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(t.morphTargetDictionary[r]!==void 0)r=t.morphTargetDictionary[r]}f=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else if(a.fromArray!==void 0&&a.toArray!==void 0)f=this.BindingType.HasFromToArray,this.resolvedProperty=a;else if(Array.isArray(a))f=this.BindingType.EntireArray,this.resolvedProperty=a;else this.propertyName=s;this.getValue=this.GetterByBindingType[f],this.setValue=this.SetterByBindingTypeAndVersioning[f][u]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}T.Composite=Wf;T.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};T.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};T.prototype.GetterByBindingType=[T.prototype._getValue_direct,T.prototype._getValue_array,T.prototype._getValue_arrayElement,T.prototype._getValue_toArray];T.prototype.SetterByBindingTypeAndVersioning=[[T.prototype._setValue_direct,T.prototype._setValue_direct_setNeedsUpdate,T.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[T.prototype._setValue_array,T.prototype._setValue_array_setNeedsUpdate,T.prototype._setValue_array_setMatrixWorldNeedsUpdate],[T.prototype._setValue_arrayElement,T.prototype._setValue_arrayElement_setNeedsUpdate,T.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[T.prototype._setValue_fromArray,T.prototype._setValue_fromArray_setNeedsUpdate,T.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Jy=new Float32Array(1);class et extends De{constructor(t,e,i=1){super(t,e);this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}clone(t){let e=super.clone(t);return e.meshPerAttribute=this.meshPerAttribute,e}toJSON(t){let e=super.toJSON(t);return e.isInstancedInterleavedBuffer=!0,e.meshPerAttribute=this.meshPerAttribute,e}}var zu=new o;class Z{constructor(t,e,i=0,s=1/0){this.ray=new me(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new Po,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){if(e.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,0.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e;else if(e.isOrthographicCamera)this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e;else jn("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return zu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(zu),this}intersectObject(t,e=!0,i=[]){return Jl(t,this,i,e),i.sort(Gu),i}intersectObjects(t,e=!0,i=[]){for(let s=0,r=t.length;s<r;s++)Jl(t[s],this,i,e);return i.sort(Gu),i}}function Gu(t,e){return t.distance-e.distance}function Jl(t,e,i,s){let r=!0;if(t.layers.test(e.layers)){if(t.raycast(e,i)===!1)r=!1}if(r===!0&&s===!0){let a=t.children;for(let u=0,f=a.length;u<f;u++)Jl(a[u],e,i,!0)}}class tt{constructor(t=1,e=0,i=0){this.radius=t,this.phi=e,this.theta=i}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=ti(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){if(this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(t,i),this.phi=Math.acos(ti(e/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class Xf{static{this.prototype.isMatrix2=!0}constructor(t,e,i,s){if(this.elements=[1,0,0,1],t!==void 0)this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=s,this}}var ku=new n,Aa=new n,Hr=new n,Vr=new n,Yl=new n,Um=new n,Fm=new n;class O{constructor(t=new n,e=new n){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){ku.subVectors(t,this.start),Aa.subVectors(this.end,this.start);let i=Aa.dot(Aa);if(i===0)return 0;let r=Aa.dot(ku)/i;if(e)r=ti(r,0,1);return r}closestPointToPoint(t,e,i){let s=this.closestPointToPointParameter(t,e);return this.delta(i).multiplyScalar(s).add(this.start)}distanceSqToLine3(t,e=Um,i=Fm){let r,a,u=this.start,f=t.start,x=this.end,A=t.end;Hr.subVectors(x,u),Vr.subVectors(A,f),Yl.subVectors(u,f);let L=Hr.dot(Hr),D=Vr.dot(Vr),R=Vr.dot(Yl);if(L<=0.00000000000000010000000000000001&&D<=0.00000000000000010000000000000001)return e.copy(u),i.copy(f),e.distanceToSquared(i);if(L<=0.00000000000000010000000000000001)r=0,a=R/D,a=ti(a,0,1);else{let V=Hr.dot(Yl);if(D<=0.00000000000000010000000000000001)a=0,r=ti(-V/L,0,1);else{let rt=Hr.dot(Vr),Ct=L*D-rt*rt;if(Ct!==0)r=ti((rt*R-V*D)/Ct,0,1);else r=0;if(a=(rt*r+R)/D,a<0)a=0,r=ti(-V/L,0,1);else if(a>1)a=1,r=ti((rt-V)/L,0,1)}}return e.copy(u).addScaledVector(Hr,r),i.copy(f).addScaledVector(Vr,a),e.distanceToSquared(i)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Qt extends X{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],r=new m;r.setIndex(new _(i,1)),r.setAttribute("position",new g(s,3));super(r,new P({color:e,toneMapped:!1}));this.box=t,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(t){let e=this.box;if(e.isEmpty())return;e.getCenter(this.position),e.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(t)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}class en extends Ps{constructor(t,e=null){super();this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(this.domElement!==null)this.disconnect();this.domElement=t}disconnect(){}dispose(){}update(){}}function fh(t,e,i,s){let r=Om(s);switch(i){case 1021:return t*e;case 1028:return t*e/r.components*r.byteLength;case 1029:return t*e/r.components*r.byteLength;case 1030:return t*e*2/r.components*r.byteLength;case 1031:return t*e*2/r.components*r.byteLength;case 1022:return t*e*3/r.components*r.byteLength;case 1023:return t*e*4/r.components*r.byteLength;case 1033:return t*e*4/r.components*r.byteLength;case 33776:case 33777:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(t,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(t,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(t/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(t/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw Error(`Unable to determine texture byte length for ${i} format.`)}function Om(t){switch(t){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${t}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Yn("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function dd(){let t=null,e=!1,i=null,s=null;function r(a,u){s=t.requestAnimationFrame(r),i(a,u)}return{start:function(){if(e===!0)return;if(i===null)return;if(t===null)return;s=t.requestAnimationFrame(r),e=!0},stop:function(){if(t!==null)t.cancelAnimationFrame(s);e=!1},setAnimationLoop:function(a){i=a},setContext:function(a){t=a}}}function Bm(t){let e=new WeakMap;function i(f,x){let{array:A,usage:L}=f,D=A.byteLength,R=t.createBuffer();t.bindBuffer(x,R),t.bufferData(x,A,L),f.onUploadCallback();let V;if(A instanceof Float32Array)V=t.FLOAT;else if(typeof Float16Array<"u"&&A instanceof Float16Array)V=t.HALF_FLOAT;else if(A instanceof Uint16Array)if(f.isFloat16BufferAttribute)V=t.HALF_FLOAT;else V=t.UNSIGNED_SHORT;else if(A instanceof Int16Array)V=t.SHORT;else if(A instanceof Uint32Array)V=t.UNSIGNED_INT;else if(A instanceof Int32Array)V=t.INT;else if(A instanceof Int8Array)V=t.BYTE;else if(A instanceof Uint8Array)V=t.UNSIGNED_BYTE;else if(A instanceof Uint8ClampedArray)V=t.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+A);return{buffer:R,type:V,bytesPerElement:A.BYTES_PER_ELEMENT,version:f.version,size:D}}function s(f,x,A){let{array:L,updateRanges:D}=x;if(t.bindBuffer(A,f),D.length===0)t.bufferSubData(A,0,L);else{D.sort((V,rt)=>V.start-rt.start);let R=0;for(let V=1;V<D.length;V++){let rt=D[R],Ct=D[V];if(Ct.start<=rt.start+rt.count+1)rt.count=Math.max(rt.count,Ct.start+Ct.count-rt.start);else++R,D[R]=Ct}D.length=R+1;for(let V=0,rt=D.length;V<rt;V++){let Ct=D[V];t.bufferSubData(A,Ct.start*L.BYTES_PER_ELEMENT,L,Ct.start,Ct.count)}x.clearUpdateRanges()}x.onUploadCallback()}function r(f){if(f.isInterleavedBufferAttribute)f=f.data;return e.get(f)}function a(f){if(f.isInterleavedBufferAttribute)f=f.data;let x=e.get(f);if(x)t.deleteBuffer(x.buffer),e.delete(f)}function u(f,x){if(f.isInterleavedBufferAttribute)f=f.data;if(f.isGLBufferAttribute){let L=e.get(f);if(!L||L.version<f.version)e.set(f,{buffer:f.buffer,type:f.type,bytesPerElement:f.elementSize,version:f.version});return}let A=e.get(f);if(A===void 0)e.set(f,i(f,x));else if(A.version<f.version){if(A.size!==f.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(A.buffer,f,x),A.version=f.version}}return{get:r,remove:a,update:u}}var zm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Gm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,km=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Hm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Wm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xm=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,qm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ym=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Zm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Jm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$m=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Km=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Qm=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,jm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,tg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,eg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ng=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ig=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,rg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,og=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ag=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,lg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,cg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,hg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ug=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,pg="gl_FragColor = linearToOutputTexel( gl_FragColor );",mg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,gg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,_g=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,xg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,yg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Sg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Mg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Tg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ag=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Eg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Rg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Cg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Ig=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Pg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Lg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ng=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Dg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ug=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Fg=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Og=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Gg=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,kg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Hg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Yg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Zg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Jg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,$g=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Kg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Qg=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,jg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,t_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,e_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,n_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,i_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,s_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,r_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,o_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,a_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,l_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,c_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,h_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,u_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,f_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,d_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,p_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,m_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,g_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,__=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,x_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,y_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,v_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,S_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,M_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,b_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,T_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,A_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,E_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,w_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,R_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,C_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,I_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,P_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,L_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,N_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,D_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,U_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,F_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`;var O_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,B_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,z_=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,G_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,k_=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,V_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,X_=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,q_=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Y_=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Z_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,J_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$_=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,K_=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Q_=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,j_=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,t0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,e0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,i0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,r0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,o0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,a0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,c0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,f0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,d0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,p0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,m0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,g0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,v={alphahash_fragment:zm,alphahash_pars_fragment:Gm,alphamap_fragment:km,alphamap_pars_fragment:Hm,alphatest_fragment:Vm,alphatest_pars_fragment:Wm,aomap_fragment:Xm,aomap_pars_fragment:qm,batching_pars_vertex:Ym,batching_vertex:Zm,begin_vertex:Jm,beginnormal_vertex:$m,bsdfs:Km,iridescence_fragment:Qm,bumpmap_pars_fragment:jm,clipping_planes_fragment:tg,clipping_planes_pars_fragment:eg,clipping_planes_pars_vertex:ng,clipping_planes_vertex:ig,color_fragment:sg,color_pars_fragment:rg,color_pars_vertex:og,color_vertex:ag,common:lg,defaultnormal_vertex:cg,displacementmap_pars_vertex:hg,displacementmap_vertex:ug,emissivemap_fragment:fg,emissivemap_pars_fragment:dg,colorspace_fragment:pg,colorspace_pars_fragment:mg,envmap_fragment:gg,envmap_common_pars_fragment:_g,envmap_pars_fragment:xg,envmap_pars_vertex:yg,envmap_physical_pars_fragment:Ig,envmap_vertex:vg,fog_vertex:Sg,fog_pars_vertex:Mg,fog_fragment:bg,fog_pars_fragment:Tg,gradientmap_pars_fragment:Ag,lightmap_pars_fragment:Eg,lights_lambert_fragment:wg,lights_lambert_pars_fragment:Rg,lights_pars_begin:Cg,lights_toon_fragment:Pg,lights_toon_pars_fragment:Lg,lights_phong_fragment:Ng,lights_phong_pars_fragment:Dg,lights_physical_fragment:Ug,lights_physical_pars_fragment:Fg,lights_fragment_begin:Og,lights_fragment_maps:Bg,lights_fragment_end:zg,lightprobes_pars_fragment:Gg,logdepthbuf_fragment:kg,logdepthbuf_pars_fragment:Hg,logdepthbuf_pars_vertex:Vg,logdepthbuf_vertex:Wg,map_fragment:Xg,map_pars_fragment:qg,map_particle_fragment:Yg,map_particle_pars_fragment:Zg,metalnessmap_fragment:Jg,metalnessmap_pars_fragment:$g,morphinstance_vertex:Kg,morphcolor_vertex:Qg,morphnormal_vertex:jg,morphtarget_pars_vertex:t_,morphtarget_vertex:e_,normal_fragment_begin:n_,normal_fragment_maps:i_,normal_pars_fragment:s_,normal_pars_vertex:r_,normal_vertex:o_,normalmap_pars_fragment:a_,clearcoat_normal_fragment_begin:l_,clearcoat_normal_fragment_maps:c_,clearcoat_pars_fragment:h_,iridescence_pars_fragment:u_,opaque_fragment:f_,packing:d_,premultiplied_alpha_fragment:p_,project_vertex:m_,dithering_fragment:g_,dithering_pars_fragment:__,roughnessmap_fragment:x_,roughnessmap_pars_fragment:y_,shadowmap_pars_fragment:v_,shadowmap_pars_vertex:S_,shadowmap_vertex:M_,shadowmask_pars_fragment:b_,skinbase_vertex:T_,skinning_pars_vertex:A_,skinning_vertex:E_,skinnormal_vertex:w_,specularmap_fragment:R_,specularmap_pars_fragment:C_,tonemapping_fragment:I_,tonemapping_pars_fragment:P_,transmission_fragment:L_,transmission_pars_fragment:N_,uv_pars_fragment:D_,uv_pars_vertex:U_,uv_vertex:F_,worldpos_vertex:O_,background_vert:B_,background_frag:z_,backgroundCube_vert:G_,backgroundCube_frag:k_,cube_vert:H_,cube_frag:V_,depth_vert:W_,depth_frag:X_,distance_vert:q_,distance_frag:Y_,equirect_vert:Z_,equirect_frag:J_,linedashed_vert:$_,linedashed_frag:K_,meshbasic_vert:Q_,meshbasic_frag:j_,meshlambert_vert:t0,meshlambert_frag:e0,meshmatcap_vert:n0,meshmatcap_frag:i0,meshnormal_vert:s0,meshnormal_frag:r0,meshphong_vert:o0,meshphong_frag:a0,meshphysical_vert:l0,meshphysical_frag:c0,meshtoon_vert:h0,meshtoon_frag:u0,points_vert:f0,points_frag:d0,shadow_vert:p0,shadow_frag:m0,sprite_vert:g0,sprite_frag:_0},d={common:{diffuse:{value:new c(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ei},alphaMap:{value:null},alphaMapTransform:{value:new ei},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ei}},envmap:{envMap:{value:null},envMapRotation:{value:new ei},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ei}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ei}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ei},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ei},normalScale:{value:new l(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ei},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ei}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ei}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ei}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new c(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new c(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ei},alphaTest:{value:0},uvTransform:{value:new ei}},sprite:{diffuse:{value:new c(16777215)},opacity:{value:1},center:{value:new l(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ei},alphaMap:{value:null},alphaMapTransform:{value:new ei},alphaTest:{value:0}}},Q={basic:{uniforms:ts([d.common,d.specularmap,d.envmap,d.aomap,d.lightmap,d.fog]),vertexShader:v.meshbasic_vert,fragmentShader:v.meshbasic_frag},lambert:{uniforms:ts([d.common,d.specularmap,d.envmap,d.aomap,d.lightmap,d.emissivemap,d.bumpmap,d.normalmap,d.displacementmap,d.fog,d.lights,{emissive:{value:new c(0)},envMapIntensity:{value:1}}]),vertexShader:v.meshlambert_vert,fragmentShader:v.meshlambert_frag},phong:{uniforms:ts([d.common,d.specularmap,d.envmap,d.aomap,d.lightmap,d.emissivemap,d.bumpmap,d.normalmap,d.displacementmap,d.fog,d.lights,{emissive:{value:new c(0)},specular:{value:new c(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:v.meshphong_vert,fragmentShader:v.meshphong_frag},standard:{uniforms:ts([d.common,d.envmap,d.aomap,d.lightmap,d.emissivemap,d.bumpmap,d.normalmap,d.displacementmap,d.roughnessmap,d.metalnessmap,d.fog,d.lights,{emissive:{value:new c(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:v.meshphysical_vert,fragmentShader:v.meshphysical_frag},toon:{uniforms:ts([d.common,d.aomap,d.lightmap,d.emissivemap,d.bumpmap,d.normalmap,d.displacementmap,d.gradientmap,d.fog,d.lights,{emissive:{value:new c(0)}}]),vertexShader:v.meshtoon_vert,fragmentShader:v.meshtoon_frag},matcap:{uniforms:ts([d.common,d.bumpmap,d.normalmap,d.displacementmap,d.fog,{matcap:{value:null}}]),vertexShader:v.meshmatcap_vert,fragmentShader:v.meshmatcap_frag},points:{uniforms:ts([d.points,d.fog]),vertexShader:v.points_vert,fragmentShader:v.points_frag},dashed:{uniforms:ts([d.common,d.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:v.linedashed_vert,fragmentShader:v.linedashed_frag},depth:{uniforms:ts([d.common,d.displacementmap]),vertexShader:v.depth_vert,fragmentShader:v.depth_frag},normal:{uniforms:ts([d.common,d.bumpmap,d.normalmap,d.displacementmap,{opacity:{value:1}}]),vertexShader:v.meshnormal_vert,fragmentShader:v.meshnormal_frag},sprite:{uniforms:ts([d.sprite,d.fog]),vertexShader:v.sprite_vert,fragmentShader:v.sprite_frag},background:{uniforms:{uvTransform:{value:new ei},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:v.background_vert,fragmentShader:v.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ei}},vertexShader:v.backgroundCube_vert,fragmentShader:v.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:v.cube_vert,fragmentShader:v.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:v.equirect_vert,fragmentShader:v.equirect_frag},distance:{uniforms:ts([d.common,d.displacementmap,{referencePosition:{value:new n},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:v.distance_vert,fragmentShader:v.distance_frag},shadow:{uniforms:ts([d.lights,d.fog,{color:{value:new c(0)},opacity:{value:1}}]),vertexShader:v.shadow_vert,fragmentShader:v.shadow_frag}};Q.physical={uniforms:ts([Q.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ei},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ei},clearcoatNormalScale:{value:new l(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ei},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ei},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ei},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ei},sheen:{value:0},sheenColor:{value:new c(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ei},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ei},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ei},transmissionSamplerSize:{value:new l},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ei},attenuationDistance:{value:0},attenuationColor:{value:new c(0)},specularColor:{value:new c(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ei},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ei},anisotropyVector:{value:new l},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ei}}]),vertexShader:v.meshphysical_vert,fragmentShader:v.meshphysical_frag};var Wa={r:0,b:0,g:0},x0=new o,pd=new ei;pd.set(-1,0,0,0,1,0,0,0,1);function y0(t,e,i,s,r,a){let u=new c(0),f=r===!0?0:1,x,A,L=null,D=0,R=null;function V(ft){let Pt=ft.isScene===!0?ft.background:null;if(Pt&&Pt.isTexture){let pt=ft.backgroundBlurriness>0;Pt=e.get(Pt,pt)}return Pt}function rt(ft){let Pt=!1,pt=V(ft);if(pt===null)j(u,f);else if(pt&&pt.isColor)j(pt,1),Pt=!0;let Nt=t.xr.getEnvironmentBlendMode();if(Nt==="additive")i.buffers.color.setClear(0,0,0,1,a);else if(Nt==="alpha-blend")i.buffers.color.setClear(0,0,0,0,a);if(t.autoClear||Pt)i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil)}function Ct(ft,Pt){let pt=V(Pt);if(pt&&pt.isCubeTexture){if(A===void 0)A=new h(new Ve(1,1,1),new le({name:"BackgroundCubeMaterial",uniforms:br(Q.backgroundCube.uniforms),vertexShader:Q.backgroundCube.vertexShader,fragmentShader:Q.backgroundCube.fragmentShader,side:B,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),A.geometry.deleteAttribute("normal"),A.geometry.deleteAttribute("uv"),A.onBeforeRender=function(Nt,se,nt){this.matrixWorld.copyPosition(nt.matrixWorld)},Object.defineProperty(A.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(A);if(A.material.uniforms.envMap.value=pt,A.material.uniforms.backgroundBlurriness.value=Pt.backgroundBlurriness,A.material.uniforms.backgroundIntensity.value=Pt.backgroundIntensity,A.material.uniforms.backgroundRotation.value.setFromMatrix4(x0.makeRotationFromEuler(Pt.backgroundRotation)).transpose(),pt.isRenderTargetTexture===!1)A.material.uniforms.backgroundRotation.value.premultiply(pd);if(A.material.toneMapped=y.getTransfer(pt.colorSpace)!==Ti,L!==pt||D!==pt.version||R!==t.toneMapping)A.material.needsUpdate=!0,L=pt,D=pt.version,R=t.toneMapping;A.layers.enableAll(),ft.unshift(A,A.geometry,A.material,0,0,null)}else if(pt&&pt.isTexture){if(x===void 0)x=new h(new Do(2,2),new le({name:"BackgroundMaterial",uniforms:br(Q.background.uniforms),vertexShader:Q.background.vertexShader,fragmentShader:Q.background.fragmentShader,side:pe,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),x.geometry.deleteAttribute("normal"),Object.defineProperty(x.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(x);if(x.material.uniforms.t2D.value=pt,x.material.uniforms.backgroundIntensity.value=Pt.backgroundIntensity,x.material.toneMapped=y.getTransfer(pt.colorSpace)!==Ti,pt.matrixAutoUpdate===!0)pt.updateMatrix();if(x.material.uniforms.uvTransform.value.copy(pt.matrix),L!==pt||D!==pt.version||R!==t.toneMapping)x.material.needsUpdate=!0,L=pt,D=pt.version,R=t.toneMapping;x.layers.enableAll(),ft.unshift(x,x.geometry,x.material,0,0,null)}}function j(ft,Pt){ft.getRGB(Wa,Qc(t)),i.buffers.color.setClear(Wa.r,Wa.g,Wa.b,Pt,a)}function it(){if(A!==void 0)A.geometry.dispose(),A.material.dispose(),A=void 0;if(x!==void 0)x.geometry.dispose(),x.material.dispose(),x=void 0}return{getClearColor:function(){return u},setClearColor:function(ft,Pt=1){u.set(ft),f=Pt,j(u,f)},getClearAlpha:function(){return f},setClearAlpha:function(ft){f=ft,j(u,f)},render:rt,addToRenderList:Ct,dispose:it}}function v0(t,e){let i=t.getParameter(t.MAX_VERTEX_ATTRIBS),s={},r=R(null),a=r,u=!1;function f(he,Pe,$e,fe,sn){let un=!1,rn=D(he,fe,$e,Pe);if(a!==rn)a=rn,A(a.object);if(un=V(he,fe,$e,sn),un)rt(he,fe,$e,sn);if(sn!==null)e.update(sn,t.ELEMENT_ARRAY_BUFFER);if(un||u){if(u=!1,pt(he,Pe,$e,fe),sn!==null)t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(sn).buffer)}}function x(){return t.createVertexArray()}function A(he){return t.bindVertexArray(he)}function L(he){return t.deleteVertexArray(he)}function D(he,Pe,$e,fe){let sn=fe.wireframe===!0,un=s[Pe.id];if(un===void 0)un={},s[Pe.id]=un;let rn=he.isInstancedMesh===!0?he.id:0,wn=un[rn];if(wn===void 0)wn={},un[rn]=wn;let mn=wn[$e.id];if(mn===void 0)mn={},wn[$e.id]=mn;let Sn=mn[sn];if(Sn===void 0)Sn=R(x()),mn[sn]=Sn;return Sn}function R(he){let Pe=[],$e=[],fe=[];for(let sn=0;sn<i;sn++)Pe[sn]=0,$e[sn]=0,fe[sn]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:Pe,enabledAttributes:$e,attributeDivisors:fe,object:he,attributes:{},index:null}}function V(he,Pe,$e,fe){let sn=a.attributes,un=Pe.attributes,rn=0,wn=$e.getAttributes();for(let mn in wn)if(wn[mn].location>=0){let Tn=sn[mn],Gn=un[mn];if(Gn===void 0){if(mn==="instanceMatrix"&&he.instanceMatrix)Gn=he.instanceMatrix;if(mn==="instanceColor"&&he.instanceColor)Gn=he.instanceColor}if(Tn===void 0)return!0;if(Tn.attribute!==Gn)return!0;if(Gn&&Tn.data!==Gn.data)return!0;rn++}if(a.attributesNum!==rn)return!0;if(a.index!==fe)return!0;return!1}function rt(he,Pe,$e,fe){let sn={},un=Pe.attributes,rn=0,wn=$e.getAttributes();for(let mn in wn)if(wn[mn].location>=0){let Tn=un[mn];if(Tn===void 0){if(mn==="instanceMatrix"&&he.instanceMatrix)Tn=he.instanceMatrix;if(mn==="instanceColor"&&he.instanceColor)Tn=he.instanceColor}let Gn={};if(Gn.attribute=Tn,Tn&&Tn.data)Gn.data=Tn.data;sn[mn]=Gn,rn++}a.attributes=sn,a.attributesNum=rn,a.index=fe}function Ct(){let he=a.newAttributes;for(let Pe=0,$e=he.length;Pe<$e;Pe++)he[Pe]=0}function j(he){it(he,0)}function it(he,Pe){let $e=a.newAttributes,fe=a.enabledAttributes,sn=a.attributeDivisors;if($e[he]=1,fe[he]===0)t.enableVertexAttribArray(he),fe[he]=1;if(sn[he]!==Pe)t.vertexAttribDivisor(he,Pe),sn[he]=Pe}function ft(){let he=a.newAttributes,Pe=a.enabledAttributes;for(let $e=0,fe=Pe.length;$e<fe;$e++)if(Pe[$e]!==he[$e])t.disableVertexAttribArray($e),Pe[$e]=0}function Pt(he,Pe,$e,fe,sn,un,rn){if(rn===!0)t.vertexAttribIPointer(he,Pe,$e,sn,un);else t.vertexAttribPointer(he,Pe,$e,fe,sn,un)}function pt(he,Pe,$e,fe){Ct();let sn=fe.attributes,un=$e.getAttributes(),rn=Pe.defaultAttributeValues;for(let wn in un){let mn=un[wn];if(mn.location>=0){let Sn=sn[wn];if(Sn===void 0){if(wn==="instanceMatrix"&&he.instanceMatrix)Sn=he.instanceMatrix;if(wn==="instanceColor"&&he.instanceColor)Sn=he.instanceColor}if(Sn!==void 0){let Tn=Sn.normalized,Gn=Sn.itemSize,vn=e.get(Sn);if(vn===void 0)continue;let{buffer:An,type:zn,bytesPerElement:Jn}=vn,Kn=zn===t.INT||zn===t.UNSIGNED_INT||Sn.gpuType===oc;if(Sn.isInterleavedBufferAttribute){let kn=Sn.data,di=kn.isInterleavedBuffer===!0?kn.stride:kn.itemSize,oi=Sn.offset;if(kn.isInstancedInterleavedBuffer||kn.isInstancedBufferAttribute){for(let si=0;si<mn.locationSize;si++)it(mn.location+si,kn.meshPerAttribute);if(he.isInstancedMesh!==!0&&fe._maxInstanceCount===void 0)fe._maxInstanceCount=kn.meshPerAttribute*kn.count}else for(let si=0;si<mn.locationSize;si++)j(mn.location+si);t.bindBuffer(t.ARRAY_BUFFER,An);for(let si=0;si<mn.locationSize;si++)Pt(mn.location+si,Gn/mn.locationSize,zn,Tn,di*Jn,(oi+Gn/mn.locationSize*si)*Jn,Kn)}else{if(Sn.isInstancedBufferAttribute){for(let kn=0;kn<mn.locationSize;kn++)it(mn.location+kn,Sn.meshPerAttribute);if(he.isInstancedMesh!==!0&&fe._maxInstanceCount===void 0)fe._maxInstanceCount=Sn.meshPerAttribute*Sn.count}else for(let kn=0;kn<mn.locationSize;kn++)j(mn.location+kn);t.bindBuffer(t.ARRAY_BUFFER,An);for(let kn=0;kn<mn.locationSize;kn++)Pt(mn.location+kn,Gn/mn.locationSize,zn,Tn,Gn*Jn,Gn/mn.locationSize*kn*Jn,Kn)}}else if(rn!==void 0){let Tn=rn[wn];if(Tn!==void 0)switch(Tn.length){case 2:t.vertexAttrib2fv(mn.location,Tn);break;case 3:t.vertexAttrib3fv(mn.location,Tn);break;case 4:t.vertexAttrib4fv(mn.location,Tn);break;default:t.vertexAttrib1fv(mn.location,Tn)}}}}ft()}function Nt(){re();for(let he in s){let Pe=s[he];for(let $e in Pe){let fe=Pe[$e];for(let sn in fe){let un=fe[sn];for(let rn in un)L(un[rn].object),delete un[rn];delete fe[sn]}}delete s[he]}}function se(he){if(s[he.id]===void 0)return;let Pe=s[he.id];for(let $e in Pe){let fe=Pe[$e];for(let sn in fe){let un=fe[sn];for(let rn in un)L(un[rn].object),delete un[rn];delete fe[sn]}}delete s[he.id]}function nt(he){for(let Pe in s){let $e=s[Pe];for(let fe in $e){let sn=$e[fe];if(sn[he.id]===void 0)continue;let un=sn[he.id];for(let rn in un)L(un[rn].object),delete un[rn];delete sn[he.id]}}}function Rt(he){for(let Pe in s){let $e=s[Pe],fe=he.isInstancedMesh===!0?he.id:0,sn=$e[fe];if(sn===void 0)continue;for(let un in sn){let rn=sn[un];for(let wn in rn)L(rn[wn].object),delete rn[wn];delete sn[un]}if(delete $e[fe],Object.keys($e).length===0)delete s[Pe]}}function re(){if(be(),u=!0,a===r)return;a=r,A(a.object)}function be(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:f,reset:re,resetDefaultState:be,dispose:Nt,releaseStatesOfGeometry:se,releaseStatesOfObject:Rt,releaseStatesOfProgram:nt,initAttributes:Ct,enableAttribute:j,disableUnusedAttributes:ft}}function S0(t,e,i){let s;function r(x){s=x}function a(x,A){t.drawArrays(s,x,A),i.update(A,s,1)}function u(x,A,L){if(L===0)return;t.drawArraysInstanced(s,x,A,L),i.update(A,s,L)}function f(x,A,L){if(L===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,x,0,A,0,L);let R=0;for(let V=0;V<L;V++)R+=A[V];i.update(R,s,1)}this.setMode=r,this.render=a,this.renderInstances=u,this.renderMultiDraw=f}function M0(t,e,i,s){let r;function a(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let nt=e.get("EXT_texture_filter_anisotropic");r=t.getParameter(nt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function u(nt){if(nt!==q&&s.convert(nt)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function f(nt){let Rt=nt===te&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));if(nt!==Ts&&nt!==Xs&&!Rt&&s.convert(nt)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function x(nt){if(nt==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";nt="mediump"}if(nt==="mediump"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let A=i.precision!==void 0?i.precision:"highp",L=x(A);if(L!==A)Yn("WebGLRenderer:",A,"not supported, using",L,"instead."),A=L;let D=i.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),R=i.logarithmicDepthBuffer===!0&&D===!1;if(i.reversedDepthBuffer===!0&&D===!1)Yn("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(i.logarithmicDepthBuffer===!0&&D===!0)Yn("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let V=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),rt=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),Ct=t.getParameter(t.MAX_TEXTURE_SIZE),j=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),it=t.getParameter(t.MAX_VERTEX_ATTRIBS),ft=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),Pt=t.getParameter(t.MAX_VARYING_VECTORS),pt=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),Nt=t.getParameter(t.MAX_SAMPLES),se=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:x,textureFormatReadable:u,textureTypeReadable:f,precision:A,logarithmicDepthBuffer:R,reversedDepthBuffer:D,maxTextures:V,maxVertexTextures:rt,maxTextureSize:Ct,maxCubemapSize:j,maxAttributes:it,maxVertexUniforms:ft,maxVaryings:Pt,maxFragmentUniforms:pt,maxSamples:Nt,samples:se}}function b0(t){let e=this,i=null,s=0,r=!1,a=!1,u=new N,f=new ei,x={value:null,needsUpdate:!1};this.uniform=x,this.numPlanes=0,this.numIntersection=0,this.init=function(D,R){let V=D.length!==0||R||s!==0||r;return r=R,s=D.length,V},this.beginShadows=function(){a=!0,L(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(D,R){i=L(D,R,0)},this.setState=function(D,R,V){let{clippingPlanes:rt,clipIntersection:Ct,clipShadows:j}=D,it=t.get(D);if(!r||rt===null||rt.length===0||a&&!j)if(a)L(null);else A();else{let ft=a?0:s,Pt=ft*4,pt=it.clippingState||null;x.value=pt,pt=L(rt,R,Pt,V);for(let Nt=0;Nt!==Pt;++Nt)pt[Nt]=i[Nt];it.clippingState=pt,this.numIntersection=Ct?this.numPlanes:0,this.numPlanes+=ft}};function A(){if(x.value!==i)x.value=i,x.needsUpdate=s>0;e.numPlanes=s,e.numIntersection=0}function L(D,R,V,rt){let Ct=D!==null?D.length:0,j=null;if(Ct!==0){if(j=x.value,rt!==!0||j===null){let it=V+Ct*4,ft=R.matrixWorldInverse;if(f.getNormalMatrix(ft),j===null||j.length<it)j=new Float32Array(it);for(let Pt=0,pt=V;Pt!==Ct;++Pt,pt+=4)u.copy(D[Pt]).applyMatrix4(ft,f),u.normal.toArray(j,pt),j[pt+3]=u.constant}x.value=j,x.needsUpdate=!0}return e.numPlanes=Ct,e.numIntersection=0,j}}class qa extends ne{constructor(t=1,e={}){super(t,t,e);this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Ba(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ve(5,5,5),r=new le({name:"CubemapFromEquirect",uniforms:br(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:B,blending:vr});r.uniforms.tEquirect.value=e;let a=new h(s,r),u=e.minFilter;if(e.minFilter===ee)e.minFilter=I;return new Uo(1,10,this).update(t,a),e.minFilter=u,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}}var qf=256,T0=3,A0=20,md=256,gd=16,E0=3,w0=new n,R0=new c;class ht{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Uo(1,10,null),this._boxMesh=new h(new Ve(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,i=0.1,s=100,r={}){let{size:a=256,position:u=w0}=r,f=this._renderer;this._setSize(a);let x=this._allocateTarget(),A=this._getSourceTarget(!0);if(e>0)A.texture.mipmapsAutoUpdate=!1;let{autoClear:L,autoClearColor:D,autoClearDepth:R,autoClearStencil:V}=f,rt=t.background;if(f.autoClear=!0,f.autoClearColor=!0,f.autoClearDepth=!0,f.autoClearStencil=!0,rt===null)t.background=f.getClearColor(R0);let Ct=new Uo(i,s,A);if(Ct.position.copy(u),Ct.update(f,t),f.autoClear=L,f.autoClearColor=D,f.autoClearDepth=R,f.autoClearStencil=V,t.background=rt,e>0)A.texture.mipmapsAutoUpdate=!0,this._blur(x,e);return this._applyPMREM(x),x}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Jf(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Zf(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(qf,qc(t))}_fromTexture(t,e){if(t.mapping===Ro||t.mapping===Zr)this._setSize(t.image.length===0?qf:t.image[0].width||t.image[0].image.width);else this._setSize(t.image.width/4);let i=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(i),i}_allocateTarget(){let t=this._cubeSize,e=Yf(t,!1,!1),i=Math.log2(t)-T0;for(let s=0;s<=i;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,i=this._sourceTarget;if(i===null||i.width!==e||t&&i.depthBuffer===!1){if(i!==null)i.dispose();this._sourceTarget=Yf(e,!0,t)}return this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,i){let s=this._boxMesh,r=this._cubeCamera;s.material=i,r.renderTarget=t,r.activeMipmapLevel=e;let a=t.width>>e;t.viewport.set(0,0,a,a),r.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;if(t.mapping===Ro||t.mapping===Zr){if(this._cubemapMaterial===null)this._cubemapMaterial=Jf();e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Zf();e=this._equirectMaterial}e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){if(this._ggxMaterial===null)this._ggxMaterial=C0(),this._integrationMaterial=I0();let e=this._cubeSize,i=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/gd);for(let a=0;a<=i;a++){let u=ht.lodToRoughness(a,i);if(a>i-E0)r.roughness.value=u,this._renderCube(t,a,this._integrationMaterial);else{let f=u>0?Math.log2(e)+0.5*Math.log2(6/(md*Math.pow(u,4)))+0.5:0;s.roughness.value=u,s.lodBias.value=f,this._renderCube(t,a,this._ggxMaterial)}}}_blur(t,e){if(this._blurMaterial===null)this._blurMaterial=P0();let i=this._blurMaterial,s=i.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(t,0,i),s.envMap.value=t.texture,this._renderCube(r,0,i)}}function Yf(t,e,i){return new qa(t,{minFilter:ee,generateMipmaps:e,type:te,colorSpace:J,depthBuffer:i})}function zo(t,e,i){return new le({name:t,uniforms:e,vertexShader:v.cube_vert,fragmentShader:i,side:B,blending:vr,depthTest:!1,depthWrite:!1})}function C0(){return zo("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${md}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function I0(){return zo("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:gd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function P0(){return zo("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${A0}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Zf(){return zo("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Jf(){return zo("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function L0(t){let e=new WeakMap,i=new WeakMap,s=null;function r(R,V=!1){if(R===null||R===void 0)return null;if(V)return u(R);return a(R)}function a(R){if(R&&R.isTexture){let V=R.mapping;if(V===Ra||V===Ca)if(e.has(R)){let rt=e.get(R).texture;return f(rt,R.mapping)}else{let rt=R.image;if(rt&&rt.height>0){let Ct=new qa(rt.height);return Ct.fromEquirectangularTexture(t,R),e.set(R,Ct),R.addEventListener("dispose",A),f(Ct.texture,R.mapping)}else return null}}return R}function u(R){if(R&&R.isTexture&&R.isPMREMTexture!==!0){let V=R.mapping,rt=V===Ra||V===Ca,Ct=V===Ro||V===Zr;if(rt||Ct){let j=i.get(R),it=j!==void 0?j.texture.pmremVersion:0;if(R.isRenderTargetTexture&&R.pmremVersion!==it){if(s===null)s=new ht(t);return j=rt?s.fromEquirectangular(R,j):s.fromCubemap(R,j),j.texture.pmremVersion=R.pmremVersion,i.set(R,j),j.texture}else if(j!==void 0)return j.texture;else{let ft=R.image;if(rt&&ft&&ft.height>0||Ct&&ft&&x(ft)){if(s===null)s=new ht(t);return j=rt?s.fromEquirectangular(R):s.fromCubemap(R),j.texture.pmremVersion=R.pmremVersion,i.set(R,j),R.addEventListener("dispose",L),j.texture}else return null}}}return R}function f(R,V){if(V===Ra)R.mapping=Ro;else if(V===Ca)R.mapping=Zr;return R}function x(R){let V=0,rt=6;for(let Ct=0;Ct<rt;Ct++)if(R[Ct]!==void 0)V++;return V===rt}function A(R){let V=R.target;V.removeEventListener("dispose",A);let rt=e.get(V);if(rt!==void 0)e.delete(V),rt.dispose()}function L(R){let V=R.target;V.removeEventListener("dispose",L);let rt=i.get(V);if(rt!==void 0)i.delete(V),rt.dispose()}function D(){if(e=new WeakMap,i=new WeakMap,s!==null)s.dispose(),s=null}return{get:r,dispose:D}}function N0(t){let e={};function i(s){if(e[s]!==void 0)return e[s];let r=t.getExtension(s);return e[s]=r,r}return{has:function(s){return i(s)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(s){let r=i(s);if(r===null)_r("WebGLRenderer: "+s+" extension not supported.");return r}}}function D0(t,e,i,s){let r={},a=new WeakMap,u=new FinalizationRegistry((rt)=>delete r[rt]);function f(rt){x(rt.target)}function x(rt){if(rt.index!==null)e.remove(rt.index);for(let j in rt.attributes)e.remove(rt.attributes[j]);rt.removeEventListener("dispose",f),delete r[rt.id],u.unregister(rt);let Ct=a.get(rt);if(Ct)e.remove(Ct),a.delete(rt);if(s.releaseStatesOfGeometry(rt),rt.isInstancedBufferGeometry===!0)delete rt._maxInstanceCount;i.memory.geometries--}function A(rt,Ct){if(r[Ct.id]!==void 0)return Ct;return Ct.addEventListener("dispose",f),r[Ct.id]=new WeakRef(Ct),u.register(Ct,Ct.id,Ct),i.memory.geometries++,Ct}function L(rt){let Ct=rt.attributes;for(let j in Ct)e.update(Ct[j],t.ARRAY_BUFFER)}function D(rt){let Ct=rt.index,j=rt.attributes.position,it=0;if(j===void 0)return;let ft=Ct!==null?Ct.array.length:j.array.length/3-1,pt=new(j.count>=65535?Fa:Ua)(Math.ceil(ft/3)*6,1),Nt=pt.array;if(Ct!==null){let nt=Ct.array;it=Ct.version;for(let Rt=0,re=0;Rt<ft;Rt+=3){let be=nt[Rt+0],he=nt[Rt+1],Pe=nt[Rt+2];Nt[re++]=be,Nt[re++]=he,Nt[re++]=he,Nt[re++]=Pe,Nt[re++]=Pe,Nt[re++]=be}}else{it=j.version;for(let nt=0,Rt=0;nt<ft;nt+=3){let re=nt+0,be=nt+1,he=nt+2;Nt[Rt++]=re,Nt[Rt++]=be,Nt[Rt++]=be,Nt[Rt++]=he,Nt[Rt++]=he,Nt[Rt++]=re}}pt.version=it;let se=a.get(rt);if(se)e.remove(se);a.set(rt,pt)}function R(rt){let Ct=a.get(rt);if(Ct){let j=rt.index;if(j!==null){if(Ct.version<j.version)D(rt)}}else D(rt);return a.get(rt)}function V(){for(let rt in r){let Ct=r[rt].deref();if(Ct!==void 0)x(Ct)}}return{get:A,update:L,getWireframeAttribute:R,dispose:V}}function U0(t,e,i){let s;function r(D){s=D}let a,u;function f(D){a=D.type,u=D.bytesPerElement}function x(D,R){t.drawElements(s,R,a,D*u),i.update(R,s,1)}function A(D,R,V){if(V===0)return;t.drawElementsInstanced(s,R,a,D*u,V),i.update(R,s,V)}function L(D,R,V){if(V===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,R,0,a,D,0,V);let Ct=0;for(let j=0;j<V;j++)Ct+=R[j];i.update(Ct,s,1)}this.setMode=r,this.setIndex=f,this.render=x,this.renderInstances=A,this.renderMultiDraw=L}function F0(t){let e={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function s(a,u,f){switch(i.calls++,u){case t.TRIANGLES:i.triangles+=f*(a/3);break;case t.LINES:i.lines+=f*(a/2);break;case t.LINE_STRIP:i.lines+=f*(a-1);break;case t.LINE_LOOP:i.lines+=f*a;break;case t.POINTS:i.points+=f*a;break;default:jn("WebGLInfo: Unknown draw mode:",u);break}}function r(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:e,render:i,programs:null,autoReset:!0,reset:r,update:s}}function O0(t,e,i){let s=new WeakMap,r=new b;function a(u,f,x){let A=u.morphTargetInfluences,L=f.morphAttributes.position||f.morphAttributes.normal||f.morphAttributes.color,D=L!==void 0?L.length:0,R=s.get(f);if(R===void 0||R.count!==D){let re=function(){nt.dispose(),s.delete(f),f.removeEventListener("dispose",re)};if(R!==void 0)R.texture.dispose();let V=f.morphAttributes.position!==void 0,rt=f.morphAttributes.normal!==void 0,Ct=f.morphAttributes.color!==void 0,j=f.morphAttributes.position||[],it=f.morphAttributes.normal||[],ft=f.morphAttributes.color||[],Pt=0;if(V===!0)Pt=1;if(rt===!0)Pt=2;if(Ct===!0)Pt=3;let pt=f.attributes.position.count*Pt,Nt=1;if(pt>e.maxTextureSize)Nt=Math.ceil(pt/e.maxTextureSize),pt=e.maxTextureSize;let se=new Float32Array(pt*Nt*4*D),nt=new Da(se,pt,Nt,D);nt.type=Xs,nt.needsUpdate=!0;let Rt=Pt*4;for(let be=0;be<D;be++){let he=j[be],Pe=it[be],$e=ft[be],fe=pt*Nt*4*be;for(let sn=0;sn<he.count;sn++){let un=sn*Rt;if(V===!0)r.fromBufferAttribute(he,sn),se[fe+un+0]=r.x,se[fe+un+1]=r.y,se[fe+un+2]=r.z,se[fe+un+3]=0;if(rt===!0)r.fromBufferAttribute(Pe,sn),se[fe+un+4]=r.x,se[fe+un+5]=r.y,se[fe+un+6]=r.z,se[fe+un+7]=0;if(Ct===!0)r.fromBufferAttribute($e,sn),se[fe+un+8]=r.x,se[fe+un+9]=r.y,se[fe+un+10]=r.z,se[fe+un+11]=$e.itemSize===4?r.w:1}}R={count:D,texture:nt,size:new l(pt,Nt)},s.set(f,R),f.addEventListener("dispose",re)}if(u.isInstancedMesh===!0&&u.morphTexture!==null)x.getUniforms().setValue(t,"morphTexture",u.morphTexture,i);else{let V=0;for(let Ct=0;Ct<A.length;Ct++)V+=A[Ct];let rt=f.morphTargetsRelative?1:1-V;x.getUniforms().setValue(t,"morphTargetBaseInfluence",rt),x.getUniforms().setValue(t,"morphTargetInfluences",A)}x.getUniforms().setValue(t,"morphTargetsTexture",R.texture,i),x.getUniforms().setValue(t,"morphTargetsTextureSize",R.size)}return{update:a}}function B0(t,e,i,s,r){let a=new WeakMap;function u(A){let L=r.render.frame,D=A.geometry,R=e.get(A,D);if(a.get(R)!==L)e.update(R),a.set(R,L);if(A.isInstancedMesh){if(A.hasEventListener("dispose",x)===!1)A.addEventListener("dispose",x);if(a.get(A)!==L){if(i.update(A.instanceMatrix,t.ARRAY_BUFFER),A.instanceColor!==null)i.update(A.instanceColor,t.ARRAY_BUFFER);a.set(A,L)}}if(A.isSkinnedMesh){let V=A.skeleton;if(a.get(V)!==L)V.update(),a.set(V,L)}return R}function f(){a=new WeakMap}function x(A){let L=A.target;if(L.removeEventListener("dispose",x),s.releaseStatesOfObject(L),i.remove(L.instanceMatrix),L.instanceColor!==null)i.remove(L.instanceColor)}return{update:u,dispose:f}}var z0={[tc]:"LINEAR_TONE_MAPPING",[ec]:"REINHARD_TONE_MAPPING",[nc]:"CINEON_TONE_MAPPING",[gt]:"ACES_FILMIC_TONE_MAPPING",[sc]:"AGX_TONE_MAPPING",[rc]:"NEUTRAL_TONE_MAPPING",[ic]:"CUSTOM_TONE_MAPPING"};function G0(t,e,i,s,r,a){let u=new ne(e,i,{type:t,depthBuffer:r,stencilBuffer:a,samples:s?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),f=null,x=null,A=null,L=new m;L.setAttribute("position",new g([-1,3,0,-1,-1,0,3,-1,0],3)),L.setAttribute("uv",new g([0,2,0,0,2,0],2));let D=new jc({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),R=new h(L,D),V=new Ce(-1,1,1,-1,0,1),rt=null,Ct=null,j=!1,it,ft=null,Pt=[],pt=!1;this.setSize=function(Nt,se){if(u.setSize(Nt,se),f!==null)f.setSize(Nt,se);if(x!==null)x.setSize(Nt,se);for(let nt=0;nt<Pt.length;nt++){let Rt=Pt[nt];if(Rt.setSize)Rt.setSize(Nt,se)}},this.setEffects=function(Nt){Pt=Nt,pt=Pt.length>0&&Pt[0].isRenderPass===!0;let{width:se,height:nt}=u;if(Pt.length>0&&f===null)f=new ne(se,nt,{type:te,depthBuffer:!1,stencilBuffer:!1}),x=new ne(se,nt,{type:te,depthBuffer:!1,stencilBuffer:!1});let Rt=r===!0&&Pt.some((re)=>re.needsDepthTexture===!0);if(Rt!==(u.depthTexture!==null)){if(Rt===!0&&A===null){if(A=new nr(se,nt),a===!0)A.format=er,A.type=Sr}u.dispose(),u.depthTexture=Rt?A:null,u.resolveDepthBuffer=Rt,u.storeMultisampledDepthBuffer=Rt}for(let re=0;re<Pt.length;re++){let be=Pt[re];if(be.setSize)be.setSize(se,nt);if(Rt&&be.needsDepthTexture===!0&&be.setDepthTexture)be.setDepthTexture(A)}},this.begin=function(Nt,se){if(j)return!1;if(Nt.toneMapping===Is&&Pt.length===0)return!1;if(ft=se,se!==null){let{width:nt,height:Rt}=se;if(u.width!==nt||u.height!==Rt)this.setSize(nt,Rt)}if(pt===!1)Nt.setRenderTarget(u);return it=Nt.toneMapping,Nt.toneMapping=Is,!0},this.hasRenderPass=function(){return pt},this.end=function(Nt,se){Nt.toneMapping=it,j=!0;let nt=u,Rt=f;for(let re=0;re<Pt.length;re++){let be=Pt[re];if(be.enabled===!1)continue;if(be.render(Nt,Rt,nt,se),be.needsSwap!==!1)nt=Rt,Rt=Rt===f?x:f}if(rt!==Nt.outputColorSpace||Ct!==Nt.toneMapping){if(rt=Nt.outputColorSpace,Ct=Nt.toneMapping,D.defines={},y.getTransfer(rt)===Ti)D.defines.SRGB_TRANSFER="";let re=z0[Ct];if(re)D.defines[re]="";D.needsUpdate=!0}D.uniforms.tDiffuse.value=nt.texture,Nt.setRenderTarget(ft),Nt.render(R,V),ft=null,j=!1},this.isCompositing=function(){return j},this.dispose=function(){if(u.dispose(),f!==null)f.dispose();if(x!==null)x.dispose();L.dispose(),D.dispose()}}var _d=new S,xd=new nr(1,1),yd=new za(1),vd=new Da,Sd=new Kc,Md=new Ba,$f=[],Kf=[],Qf=new Float32Array(16),jf=new Float32Array(9),td=new Float32Array(4);function $r(t,e,i){let s=t[0];if(s<=0||s>0)return t;let r=e*i,a=$f[r];if(a===void 0)a=new Float32Array(r),$f[r]=a;if(e!==0){s.toArray(a,0);for(let u=1,f=0;u!==e;++u)f+=i,t[u].toArray(a,f)}return a}function Bi(t,e){if(t.length!==e.length)return!1;for(let i=0,s=t.length;i<s;i++)if(t[i]!==e[i])return!1;return!0}function zi(t,e){for(let i=0,s=e.length;i<s;i++)t[i]=e[i]}function Ya(t,e){let i=Kf[e];if(i===void 0)i=new Int32Array(e),Kf[e]=i;for(let s=0;s!==e;++s)i[s]=t.allocateTextureUnit();return i}function k0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1f(this.addr,e),i[0]=e}function H0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2f(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Bi(i,e))return;t.uniform2fv(this.addr,e),zi(i,e)}}function V0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3f(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else if(e.r!==void 0){if(i[0]!==e.r||i[1]!==e.g||i[2]!==e.b)t.uniform3f(this.addr,e.r,e.g,e.b),i[0]=e.r,i[1]=e.g,i[2]=e.b}else{if(Bi(i,e))return;t.uniform3fv(this.addr,e),zi(i,e)}}function W0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4f(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Bi(i,e))return;t.uniform4fv(this.addr,e),zi(i,e)}}function X0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Bi(i,e))return;t.uniformMatrix2fv(this.addr,!1,e),zi(i,e)}else{if(Bi(i,s))return;td.set(s),t.uniformMatrix2fv(this.addr,!1,td),zi(i,s)}}function q0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Bi(i,e))return;t.uniformMatrix3fv(this.addr,!1,e),zi(i,e)}else{if(Bi(i,s))return;jf.set(s),t.uniformMatrix3fv(this.addr,!1,jf),zi(i,s)}}function Y0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Bi(i,e))return;t.uniformMatrix4fv(this.addr,!1,e),zi(i,e)}else{if(Bi(i,s))return;Qf.set(s),t.uniformMatrix4fv(this.addr,!1,Qf),zi(i,s)}}function Z0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1i(this.addr,e),i[0]=e}function J0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2i(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Bi(i,e))return;t.uniform2iv(this.addr,e),zi(i,e)}}function $0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3i(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else{if(Bi(i,e))return;t.uniform3iv(this.addr,e),zi(i,e)}}function K0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4i(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Bi(i,e))return;t.uniform4iv(this.addr,e),zi(i,e)}}function Q0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1ui(this.addr,e),i[0]=e}function j0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2ui(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Bi(i,e))return;t.uniform2uiv(this.addr,e),zi(i,e)}}function tx(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3ui(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else{if(Bi(i,e))return;t.uniform3uiv(this.addr,e),zi(i,e)}}function ex(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Bi(i,e))return;t.uniform4uiv(this.addr,e),zi(i,e)}}function Za(t){if(t.version===0)t.compareFunction=Hc,t.needsUpdate=!0;return t}function nx(t,e,i){let s=this.cache,r=i.allocateTextureUnit();if(s[0]!==r)t.uniform1i(this.addr,r),s[0]=r;let a;if(this.type===t.SAMPLER_2D_SHADOW)a=Za(xd);else a=_d;i.setTexture2D(e||a,r)}function ix(t,e,i){let s=this.cache,r=i.allocateTextureUnit();if(s[0]!==r)t.uniform1i(this.addr,r),s[0]=r;i.setTexture3D(e||Sd,r)}function sx(t,e,i){let s=this.cache,r=i.allocateTextureUnit();if(s[0]!==r)t.uniform1i(this.addr,r),s[0]=r;let a;if(this.type===t.SAMPLER_CUBE_SHADOW)a=Za(yd);else a=Md;i.setTextureCube(e||a,r)}function rx(t,e,i){let s=this.cache,r=i.allocateTextureUnit();if(s[0]!==r)t.uniform1i(this.addr,r),s[0]=r;i.setTexture2DArray(e||vd,r)}function ox(t){switch(t){case 5126:return k0;case 35664:return H0;case 35665:return V0;case 35666:return W0;case 35674:return X0;case 35675:return q0;case 35676:return Y0;case 5124:case 35670:return Z0;case 35667:case 35671:return J0;case 35668:case 35672:return $0;case 35669:case 35673:return K0;case 5125:return Q0;case 36294:return j0;case 36295:return tx;case 36296:return ex;case 35678:case 36198:case 36298:case 36306:case 35682:return nx;case 35679:case 36299:case 36307:return ix;case 35680:case 36300:case 36308:case 36293:return sx;case 36289:case 36303:case 36311:case 36292:return rx}}function ax(t,e){t.uniform1fv(this.addr,e)}function lx(t,e){let i=$r(e,this.size,2);t.uniform2fv(this.addr,i)}function cx(t,e){let i=$r(e,this.size,3);t.uniform3fv(this.addr,i)}function hx(t,e){let i=$r(e,this.size,4);t.uniform4fv(this.addr,i)}function ux(t,e){let i=$r(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,i)}function fx(t,e){let i=$r(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,i)}function dx(t,e){let i=$r(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,i)}function px(t,e){t.uniform1iv(this.addr,e)}function mx(t,e){t.uniform2iv(this.addr,e)}function gx(t,e){t.uniform3iv(this.addr,e)}function _x(t,e){t.uniform4iv(this.addr,e)}function xx(t,e){t.uniform1uiv(this.addr,e)}function yx(t,e){t.uniform2uiv(this.addr,e)}function vx(t,e){t.uniform3uiv(this.addr,e)}function Sx(t,e){t.uniform4uiv(this.addr,e)}function Mx(t,e,i){let s=this.cache,r=e.length,a=Ya(i,r);if(!Bi(s,a))t.uniform1iv(this.addr,a),zi(s,a);let u;if(this.type===t.SAMPLER_2D_SHADOW)u=Za(xd);else u=_d;for(let f=0;f!==r;++f)i.setTexture2D(e[f]||u,a[f])}function bx(t,e,i){let s=this.cache,r=e.length,a=Ya(i,r);if(!Bi(s,a))t.uniform1iv(this.addr,a),zi(s,a);for(let u=0;u!==r;++u)i.setTexture3D(e[u]||Sd,a[u])}function Tx(t,e,i){let s=this.cache,r=e.length,a=Ya(i,r);if(!Bi(s,a))t.uniform1iv(this.addr,a),zi(s,a);let u;if(this.type===t.SAMPLER_CUBE_SHADOW)u=Za(yd);else u=Md;for(let f=0;f!==r;++f)i.setTextureCube(e[f]||u,a[f])}function Ax(t,e,i){let s=this.cache,r=e.length,a=Ya(i,r);if(!Bi(s,a))t.uniform1iv(this.addr,a),zi(s,a);for(let u=0;u!==r;++u)i.setTexture2DArray(e[u]||vd,a[u])}function Ex(t){switch(t){case 5126:return ax;case 35664:return lx;case 35665:return cx;case 35666:return hx;case 35674:return ux;case 35675:return fx;case 35676:return dx;case 5124:case 35670:return px;case 35667:case 35671:return mx;case 35668:case 35672:return gx;case 35669:case 35673:return _x;case 5125:return xx;case 36294:return yx;case 36295:return vx;case 36296:return Sx;case 35678:case 36198:case 36298:case 36306:case 35682:return Mx;case 35679:case 36299:case 36307:return bx;case 35680:case 36300:case 36308:case 36293:return Tx;case 36289:case 36303:case 36311:case 36292:return Ax}}class bd{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=ox(e.type)}}class Td{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Ex(e.type)}}class Ad{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let u=s[r];u.setValue(t,e[u.id],i)}}}var dh=/(\w+)(\])?(\[|\.)?/g;function ed(t,e){t.seq.push(e),t.map[e.id]=e}function wx(t,e,i){let s=t.name,r=s.length;dh.lastIndex=0;while(!0){let a=dh.exec(s),u=dh.lastIndex,f=a[1],x=a[2]==="]",A=a[3];if(x)f=f|0;if(A===void 0||A==="["&&u+2===r){ed(i,A===void 0?new bd(f,t,e):new Td(f,t,e));break}else{let D=i.map[f];if(D===void 0)D=new Ad(f),ed(i,D);i=D}}}class Bo{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let u=t.getActiveUniform(e,a),f=t.getUniformLocation(e,u.name);wx(u,f,this)}let s=[],r=[];for(let a of this.seq)if(a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW)s.push(a);else r.push(a);if(s.length>0)this.seq=s.concat(r)}setValue(t,e,i,s){let r=this.map[e];if(r!==void 0)r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];if(s!==void 0)this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){let u=e[r],f=i[u.id];if(f.needsUpdate!==!1)u.setValue(t,f.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];if(a.id in e)i.push(a)}return i}}function nd(t,e,i){let s=t.createShader(e);return t.shaderSource(s,i),t.compileShader(s),s}var Rx=37297,Cx=0;function Ix(t,e){let i=t.split(`
`),s=[],r=Math.max(e-6,0),a=Math.min(e+6,i.length);for(let u=r;u<a;u++){let f=u+1;s.push(`${f===e?">":" "} ${f}: ${i[u]}`)}return s.join(`
`)}var id=new ei;function Px(t){y._getMatrix(id,y.workingColorSpace,t);let e=`mat3( ${id.elements.map((i)=>i.toFixed(4))} )`;switch(y.getTransfer(t)){case zc:return[e,"LinearTransferOETF"];case Ti:return[e,"sRGBTransferOETF"];default:return Yn("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function sd(t,e,i){let s=t.getShaderParameter(e,t.COMPILE_STATUS),a=(t.getShaderInfoLog(e)||"").trim();if(s&&a==="")return"";let u=/ERROR: 0:(\d+)/.exec(a);if(u){let f=parseInt(u[1]);return i.toUpperCase()+`

`+a+`

`+Ix(t.getShaderSource(e),f)}else return a}function Lx(t,e){let i=Px(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${i[1]}( vec4( ${i[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Nx={[tc]:"Linear",[ec]:"Reinhard",[nc]:"Cineon",[gt]:"ACESFilmic",[sc]:"AgX",[rc]:"Neutral",[ic]:"Custom"};function Dx(t,e){let i=Nx[e];if(i===void 0)return Yn("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+t+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}var Xa=new n;function Ux(){y.getLuminanceCoefficients(Xa);let t=Xa.x.toFixed(4),e=Xa.y.toFixed(4),i=Xa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${i} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Fx(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Oo).join(`
`)}function Ox(t){let e=[];for(let i in t){let s=t[i];if(s===!1)continue;e.push("#define "+i+" "+s)}return e.join(`
`)}function Bx(t,e){let i={},s=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let r=0;r<s;r++){let a=t.getActiveAttrib(e,r),u=a.name,f=1;if(a.type===t.FLOAT_MAT2)f=2;if(a.type===t.FLOAT_MAT3)f=3;if(a.type===t.FLOAT_MAT4)f=4;i[u]={type:a.type,location:t.getAttribLocation(e,u),locationSize:f}}return i}function Oo(t){return t!==""}function rd(t,e){let i=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function od(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var zx=/^[ \t]*#include +<([\w\d./]+)>/gm;function mh(t){return t.replace(zx,Gx)}function Gx(t,e){let i=v[e];if(i===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return mh(i)}var kx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ad(t){return t.replace(kx,Hx)}function Hx(t,e,i,s){let r="";for(let a=parseInt(e);a<parseInt(i);a++)r+=s.replace(/\[\s*i\s*\]/g,"[ "+a+" ]").replace(/UNROLLED_LOOP_INDEX/g,a);return r}function ld(t){let e=`precision ${t.precision} float;
	precision ${t.precision} int;
	precision ${t.precision} sampler2D;
	precision ${t.precision} samplerCube;
	precision ${t.precision} sampler3D;
	precision ${t.precision} sampler2DArray;
	precision ${t.precision} sampler2DShadow;
	precision ${t.precision} samplerCubeShadow;
	precision ${t.precision} sampler2DArrayShadow;
	precision ${t.precision} isampler2D;
	precision ${t.precision} isampler3D;
	precision ${t.precision} isamplerCube;
	precision ${t.precision} isampler2DArray;
	precision ${t.precision} usampler2D;
	precision ${t.precision} usampler3D;
	precision ${t.precision} usamplerCube;
	precision ${t.precision} usampler2DArray;
	`;if(t.precision==="highp")e+=`
#define HIGH_PRECISION`;else if(t.precision==="mediump")e+=`
#define MEDIUM_PRECISION`;else if(t.precision==="lowp")e+=`
#define LOW_PRECISION`;return e}var Vx={[Eo]:"SHADOWMAP_TYPE_PCF",[Yr]:"SHADOWMAP_TYPE_VSM"};function Wx(t){return Vx[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Xx={[Zr]:"ENVMAP_MODE_REFRACTION"};function qx(t){if(t.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Xx[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Yx={[_f]:"ENVMAP_BLENDING_MULTIPLY",[xf]:"ENVMAP_BLENDING_MIX",[yf]:"ENVMAP_BLENDING_ADD"};function Zx(t){if(t.envMap===!1)return"ENVMAP_BLENDING_NONE";return Yx[t.combine]||"ENVMAP_BLENDING_NONE"}function Jx(t,e,i,s){let r=t.getContext(),{defines:a,vertexShader:u,fragmentShader:f}=i,x=Wx(i),A=i.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",L=qx(i),D=Zx(i),R=Fx(i),V=Ox(a),rt=r.createProgram(),Ct,j,it=i.glslVersion?"#version "+i.glslVersion+`
`:"";if(i.isRawShaderMaterial){if(Ct=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,V].filter(Oo).join(`
`),Ct.length>0)Ct+=`
`;if(j=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,V].filter(Oo).join(`
`),j.length>0)j+=`
`}else Ct=[ld(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,V,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+L:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+i.diffuseRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexNormals?"#define HAS_NORMAL":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+x:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(Oo).join(`
`),j=[ld(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,V,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+A:"",i.envMap?"#define "+L:"",i.envMap?"#define "+D:"",i.envMapPMREM?"#define ENVMAP_MAX_LOD "+i.envMapMaxLod+".0":"",i.envMapPMREM?"#define ENVMAP_SIZE "+i.envMapSize+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.retroreflection?"#define USE_RETROREFLECTION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor?"#define USE_COLOR":"",i.vertexAlphas||i.batchingColor?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+x:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==Is?"#define TONE_MAPPING":"",i.toneMapping!==Is?v.tonemapping_pars_fragment:"",i.toneMapping!==Is?Dx("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",v.colorspace_pars_fragment,Lx("linearToOutputTexel",i.outputColorSpace),Ux(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(Oo).join(`
`);if(u=mh(u),u=rd(u,i),u=od(u,i),f=mh(f),f=rd(f,i),f=od(f,i),u=ad(u),f=ad(f),i.isRawShaderMaterial!==!0)it=`#version 300 es
`,Ct=[R,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+Ct,j=["#define varying in",i.glslVersion===Vc?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===Vc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+j;let ft=it+Ct+u,Pt=it+j+f,pt=nd(r,r.VERTEX_SHADER,ft),Nt=nd(r,r.FRAGMENT_SHADER,Pt);if(r.attachShader(rt,pt),r.attachShader(rt,Nt),i.index0AttributeName!==void 0)r.bindAttribLocation(rt,0,i.index0AttributeName);else if(i.hasPositionAttribute===!0)r.bindAttribLocation(rt,0,"position");r.linkProgram(rt);function se(be){if(t.debug.checkShaderErrors){let he=r.getProgramInfoLog(rt)||"",Pe=r.getShaderInfoLog(pt)||"",$e=r.getShaderInfoLog(Nt)||"",fe=he.trim(),sn=Pe.trim(),un=$e.trim(),rn=!0,wn=!0;if(r.getProgramParameter(rt,r.LINK_STATUS)===!1)if(rn=!1,typeof t.debug.onShaderError==="function")t.debug.onShaderError(r,rt,pt,Nt);else{let mn=sd(r,pt,"vertex"),Sn=sd(r,Nt,"fragment");jn("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(rt,r.VALIDATE_STATUS)+`

Material Name: `+be.name+`
Material Type: `+be.type+`

Program Info Log: `+fe+`
`+mn+`
`+Sn)}else if(fe!=="")Yn("WebGLProgram: Program Info Log:",fe);else if(sn===""||un==="")wn=!1;if(wn)be.diagnostics={runnable:rn,programLog:fe,vertexShader:{log:sn,prefix:Ct},fragmentShader:{log:un,prefix:j}}}r.deleteShader(pt),r.deleteShader(Nt),nt=new Bo(r,rt),Rt=Bx(r,rt)}let nt;this.getUniforms=function(){if(nt===void 0)se(this);return nt};let Rt;this.getAttributes=function(){if(Rt===void 0)se(this);return Rt};let re=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(re===!1)re=r.getProgramParameter(rt,Rx);return re},this.destroy=function(){s.releaseStatesOfProgram(this),r.deleteProgram(rt),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=Cx++,this.cacheKey=e,this.usedTimes=1,this.program=rt,this.vertexShader=pt,this.fragmentShader=Nt,this}var $x=0;class Ed{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let s=this._getShaderCacheForMaterial(t);if(s.has(e)===!1)s.add(e),e.usedTimes++;if(s.has(i)===!1)s.add(i),i.usedTimes++;return this}remove(t){let e=this.materialCache.get(t);for(let i of e)if(i.usedTimes--,i.usedTimes===0)this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);if(i===void 0)i=new Set,e.set(t,i);return i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);if(i===void 0)i=new wd(t),e.set(t,i);return i}}class wd{constructor(t){this.id=$x++,this.code=t,this.usedTimes=0}}function Kx(t){return t===Mr||t===Pa||t===La}function Qx(t,e,i,s,r,a){let u=new Po,f=new Ed,x=new Set,A=[],L=new Map,D=s.logarithmicDepthBuffer,R={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function V(nt){if(x.add(nt),nt===0)return"uv";return`uv${nt}`}function rt(nt,Rt,re,be,he,Pe){let $e=be.fog,fe=he.geometry,sn=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial?be.environment:null,un=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial&&!nt.envMap||nt.isMeshPhongMaterial&&!nt.envMap,rn=e.get(nt.envMap||sn,un),wn=R[nt.type],mn=s.precision;if(nt.precision!==null){if(mn=s.getMaxPrecision(nt.precision),mn!==nt.precision)Yn("WebGLProgram.getParameters:",nt.precision,"not supported, using",mn,"instead.")}let Sn=fe.morphAttributes.position||fe.morphAttributes.normal||fe.morphAttributes.color,Tn=Sn!==void 0?Sn.length:0,Gn=0;if(fe.morphAttributes.position!==void 0)Gn=1;if(fe.morphAttributes.normal!==void 0)Gn=2;if(fe.morphAttributes.color!==void 0)Gn=3;let vn,An,zn,Jn;if(wn){let On=Q[wn];vn=On.vertexShader,An=On.fragmentShader}else{vn=nt.vertexShader,An=nt.fragmentShader;let On=f.getVertexShaderStage(nt),vi=f.getFragmentShaderStage(nt);f.update(nt,On,vi),zn=On.id,Jn=vi.id}let Kn=t.getRenderTarget(),kn=t.state.buffers.depth.getReversed(),di=he.isInstancedMesh===!0,oi=he.isBatchedMesh===!0,si=!!nt.map,xi=!!nt.matcap,hi=!!rn,Pi=hi&&rn.isPMREMTexture===!0,Ni=!!nt.aoMap,os=!!nt.lightMap,hs=!!nt.bumpMap&&nt.wireframe===!1,Di=!!nt.normalMap,Yi=!!nt.displacementMap,as=!!nt.emissiveMap,ls=!!nt.metalnessMap,_s=!!nt.roughnessMap,Ke=nt.anisotropy>0,xs=nt.clearcoat>0,yi=nt.diffuseRoughness>0,Gi=nt.dispersion>0,Un=nt.retroreflectivity>0,wi=nt.iridescence>0,Qn=nt.sheen>0,ni=nt.transmission>0,Zi=Ke&&!!nt.anisotropyMap,Me=xs&&!!nt.clearcoatMap,Ut=xs&&!!nt.clearcoatNormalMap,on=xs&&!!nt.clearcoatRoughnessMap,bn=yi&&!!nt.diffuseRoughnessMap,Mn=wi&&!!nt.iridescenceMap,Cn=wi&&!!nt.iridescenceThicknessMap,Ln=Qn&&!!nt.sheenColorMap,pn=Qn&&!!nt.sheenRoughnessMap,yn=!!nt.specularMap,In=!!nt.specularColorMap,Ne=!!nt.specularIntensityMap,xn=ni&&!!nt.transmissionMap,gn=ni&&!!nt.thicknessMap,En=!!nt.gradientMap,Rn=!!nt.alphaMap,Dn=nt.alphaTest>0,Zn=!!nt.alphaHash,qn=!!nt.extensions,Fn=Is;if(nt.toneMapped){if(Kn===null||Kn.isXRRenderTarget===!0)Fn=t.toneMapping}let $n=Pi?rn.isCompressedCubeTexture?rn.image[0].mipmaps:rn.mipmaps:null,ri={shaderID:wn,shaderType:nt.type,shaderName:nt.name,vertexShader:vn,fragmentShader:An,defines:nt.defines,customVertexShaderID:zn,customFragmentShaderID:Jn,isRawShaderMaterial:nt.isRawShaderMaterial===!0,glslVersion:nt.glslVersion,precision:mn,batching:oi,batchingColor:oi&&he._colorsTexture!==null,instancing:di,instancingColor:di&&he.instanceColor!==null,instancingMorph:di&&he.morphTexture!==null,outputColorSpace:Kn===null?t.outputColorSpace:Kn.isXRRenderTarget===!0?Kn.texture.colorSpace:y.workingColorSpace,alphaToCoverage:!!nt.alphaToCoverage,map:si,matcap:xi,envMap:hi,envMapMode:hi&&rn.mapping,envMapPMREM:Pi,envMapMaxLod:Pi?$n.length-1:null,envMapSize:Pi?$n[0].width:null,aoMap:Ni,lightMap:os,bumpMap:hs,normalMap:Di,displacementMap:Yi,emissiveMap:as,normalMapObjectSpace:Di&&nt.normalMapType===Ef,normalMapTangentSpace:Di&&nt.normalMapType===Bc,packedNormalMap:Di&&nt.normalMapType===Bc&&Kx(nt.normalMap.format),metalnessMap:ls,roughnessMap:_s,anisotropy:Ke,anisotropyMap:Zi,clearcoat:xs,clearcoatMap:Me,clearcoatNormalMap:Ut,clearcoatRoughnessMap:on,diffuseRoughness:yi,diffuseRoughnessMap:bn,dispersion:Gi,retroreflection:Un,iridescence:wi,iridescenceMap:Mn,iridescenceThicknessMap:Cn,sheen:Qn,sheenColorMap:Ln,sheenRoughnessMap:pn,specularMap:yn,specularColorMap:In,specularIntensityMap:Ne,transmission:ni,transmissionMap:xn,thicknessMap:gn,gradientMap:En,opaque:nt.transparent===!1&&nt.blending===wo&&nt.alphaToCoverage===!1,alphaMap:Rn,alphaTest:Dn,alphaHash:Zn,combine:nt.combine,mapUv:si&&V(nt.map.channel),aoMapUv:Ni&&V(nt.aoMap.channel),lightMapUv:os&&V(nt.lightMap.channel),bumpMapUv:hs&&V(nt.bumpMap.channel),normalMapUv:Di&&V(nt.normalMap.channel),displacementMapUv:Yi&&V(nt.displacementMap.channel),emissiveMapUv:as&&V(nt.emissiveMap.channel),metalnessMapUv:ls&&V(nt.metalnessMap.channel),roughnessMapUv:_s&&V(nt.roughnessMap.channel),anisotropyMapUv:Zi&&V(nt.anisotropyMap.channel),clearcoatMapUv:Me&&V(nt.clearcoatMap.channel),clearcoatNormalMapUv:Ut&&V(nt.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:on&&V(nt.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:bn&&V(nt.diffuseRoughnessMap.channel),iridescenceMapUv:Mn&&V(nt.iridescenceMap.channel),iridescenceThicknessMapUv:Cn&&V(nt.iridescenceThicknessMap.channel),sheenColorMapUv:Ln&&V(nt.sheenColorMap.channel),sheenRoughnessMapUv:pn&&V(nt.sheenRoughnessMap.channel),specularMapUv:yn&&V(nt.specularMap.channel),specularColorMapUv:In&&V(nt.specularColorMap.channel),specularIntensityMapUv:Ne&&V(nt.specularIntensityMap.channel),transmissionMapUv:xn&&V(nt.transmissionMap.channel),thicknessMapUv:gn&&V(nt.thicknessMap.channel),alphaMapUv:Rn&&V(nt.alphaMap.channel),vertexTangents:!!fe.attributes.tangent&&(Di||Ke),vertexNormals:!!fe.attributes.normal,vertexColors:nt.vertexColors,vertexAlphas:nt.vertexColors===!0&&!!fe.attributes.color&&fe.attributes.color.itemSize===4,pointsUvs:he.isPoints===!0&&!!fe.attributes.uv&&(si||Rn),fog:!!$e,useFog:nt.fog===!0,fogExp2:!!$e&&$e.isFogExp2,flatShading:nt.wireframe===!1&&(nt.flatShading===!0||fe.attributes.normal===void 0&&Di===!1&&(nt.isMeshLambertMaterial||nt.isMeshPhongMaterial||nt.isMeshStandardMaterial||nt.isMeshPhysicalMaterial)),sizeAttenuation:nt.sizeAttenuation===!0,logarithmicDepthBuffer:D,reversedDepthBuffer:kn,skinning:he.isSkinnedMesh===!0,hasPositionAttribute:fe.attributes.position!==void 0,morphTargets:fe.morphAttributes.position!==void 0,morphNormals:fe.morphAttributes.normal!==void 0,morphColors:fe.morphAttributes.color!==void 0,morphTargetsCount:Tn,morphTextureStride:Gn,numSunLights:Rt.sun.length,numDirLights:Rt.directional.length,numPointLights:Rt.point.length,numSpotLights:Rt.spot.length,numSpotLightMaps:Rt.spotLightMap.length,numRectAreaLights:Rt.rectArea.length,numHemiLights:Rt.hemi.length,numSunLightShadows:Rt.sunShadowMap.length,numDirLightShadows:Rt.directionalShadowMap.length,numPointLightShadows:Rt.pointShadowMap.length,numSpotLightShadows:Rt.spotShadowMap.length,numSpotLightShadowsWithMaps:Rt.numSpotLightShadowsWithMaps,numLightProbes:Rt.numLightProbes,numLightProbeGrids:Pe.filter((On)=>On.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:nt.dithering,shadowMapEnabled:t.shadowMap.enabled&&re.length>0,shadowMapType:t.shadowMap.type,toneMapping:Fn,decodeVideoTexture:si&&nt.map.isVideoTexture===!0&&y.getTransfer(nt.map.colorSpace)===Ti,decodeVideoTextureEmissive:as&&nt.emissiveMap.isVideoTexture===!0&&y.getTransfer(nt.emissiveMap.colorSpace)===Ti,premultipliedAlpha:nt.premultipliedAlpha,doubleSided:nt.side===w,flipSided:nt.side===B,useDepthPacking:nt.depthPacking>=0,depthPacking:nt.depthPacking||0,index0AttributeName:nt.index0AttributeName,extensionClipCullDistance:qn&&nt.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(qn&&nt.extensions.multiDraw===!0||oi)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:nt.customProgramCacheKey()};return ri.vertexUv1s=x.has(1),ri.vertexUv2s=x.has(2),ri.vertexUv3s=x.has(3),x.clear(),ri}function Ct(nt){let Rt=[];if(nt.shaderID)Rt.push(nt.shaderID);else Rt.push(nt.customVertexShaderID),Rt.push(nt.customFragmentShaderID);if(nt.defines!==void 0)for(let re in nt.defines)Rt.push(re),Rt.push(nt.defines[re]);if(nt.isRawShaderMaterial===!1)j(Rt,nt),it(Rt,nt),Rt.push(t.outputColorSpace);return Rt.push(nt.customProgramCacheKey),Rt.join()}function j(nt,Rt){nt.push(Rt.precision),nt.push(Rt.outputColorSpace),nt.push(Rt.envMapMode),nt.push(Rt.envMapPMREM),nt.push(Rt.envMapMaxLod),nt.push(Rt.envMapSize),nt.push(Rt.mapUv),nt.push(Rt.alphaMapUv),nt.push(Rt.lightMapUv),nt.push(Rt.aoMapUv),nt.push(Rt.bumpMapUv),nt.push(Rt.normalMapUv),nt.push(Rt.displacementMapUv),nt.push(Rt.emissiveMapUv),nt.push(Rt.metalnessMapUv),nt.push(Rt.roughnessMapUv),nt.push(Rt.anisotropyMapUv),nt.push(Rt.clearcoatMapUv),nt.push(Rt.clearcoatNormalMapUv),nt.push(Rt.clearcoatRoughnessMapUv),nt.push(Rt.diffuseRoughnessMapUv),nt.push(Rt.iridescenceMapUv),nt.push(Rt.iridescenceThicknessMapUv),nt.push(Rt.sheenColorMapUv),nt.push(Rt.sheenRoughnessMapUv),nt.push(Rt.specularMapUv),nt.push(Rt.specularColorMapUv),nt.push(Rt.specularIntensityMapUv),nt.push(Rt.transmissionMapUv),nt.push(Rt.thicknessMapUv),nt.push(Rt.combine),nt.push(Rt.fogExp2),nt.push(Rt.sizeAttenuation),nt.push(Rt.morphTargetsCount),nt.push(Rt.numSunLights),nt.push(Rt.numDirLights),nt.push(Rt.numPointLights),nt.push(Rt.numSpotLights),nt.push(Rt.numSpotLightMaps),nt.push(Rt.numHemiLights),nt.push(Rt.numRectAreaLights),nt.push(Rt.numSunLightShadows),nt.push(Rt.numDirLightShadows),nt.push(Rt.numPointLightShadows),nt.push(Rt.numSpotLightShadows),nt.push(Rt.numSpotLightShadowsWithMaps),nt.push(Rt.numLightProbes),nt.push(Rt.numLightProbeGrids),nt.push(Rt.shadowMapType),nt.push(Rt.toneMapping),nt.push(Rt.numClippingPlanes),nt.push(Rt.numClipIntersection),nt.push(Rt.depthPacking)}function it(nt,Rt){if(u.disableAll(),Rt.instancing)u.enable(0);if(Rt.instancingColor)u.enable(1);if(Rt.instancingMorph)u.enable(2);if(Rt.matcap)u.enable(3);if(Rt.envMap)u.enable(4);if(Rt.normalMapObjectSpace)u.enable(5);if(Rt.normalMapTangentSpace)u.enable(6);if(Rt.clearcoat)u.enable(7);if(Rt.iridescence)u.enable(8);if(Rt.alphaTest)u.enable(9);if(Rt.vertexColors)u.enable(10);if(Rt.vertexAlphas)u.enable(11);if(Rt.vertexUv1s)u.enable(12);if(Rt.vertexUv2s)u.enable(13);if(Rt.vertexUv3s)u.enable(14);if(Rt.vertexTangents)u.enable(15);if(Rt.anisotropy)u.enable(16);if(Rt.alphaHash)u.enable(17);if(Rt.batching)u.enable(18);if(Rt.dispersion)u.enable(19);if(Rt.retroreflection)u.enable(24);if(Rt.diffuseRoughness)u.enable(25);if(Rt.batchingColor)u.enable(20);if(Rt.gradientMap)u.enable(21);if(Rt.packedNormalMap)u.enable(22);if(Rt.vertexNormals)u.enable(23);if(nt.push(u.mask),u.disableAll(),Rt.fog)u.enable(0);if(Rt.useFog)u.enable(1);if(Rt.flatShading)u.enable(2);if(Rt.logarithmicDepthBuffer)u.enable(3);if(Rt.reversedDepthBuffer)u.enable(4);if(Rt.skinning)u.enable(5);if(Rt.morphTargets)u.enable(6);if(Rt.morphNormals)u.enable(7);if(Rt.morphColors)u.enable(8);if(Rt.premultipliedAlpha)u.enable(9);if(Rt.shadowMapEnabled)u.enable(10);if(Rt.doubleSided)u.enable(11);if(Rt.flipSided)u.enable(12);if(Rt.useDepthPacking)u.enable(13);if(Rt.dithering)u.enable(14);if(Rt.transmission)u.enable(15);if(Rt.sheen)u.enable(16);if(Rt.opaque)u.enable(17);if(Rt.pointsUvs)u.enable(18);if(Rt.decodeVideoTexture)u.enable(19);if(Rt.decodeVideoTextureEmissive)u.enable(20);if(Rt.alphaToCoverage)u.enable(21);if(Rt.numLightProbeGrids>0)u.enable(22);if(Rt.hasPositionAttribute)u.enable(23);nt.push(u.mask)}function ft(nt){let Rt=R[nt.type],re;if(Rt){let be=Q[Rt];re=Yt.clone(be.uniforms)}else re=nt.uniforms;return re}function Pt(nt,Rt){let re=L.get(Rt);if(re!==void 0)++re.usedTimes;else re=new Jx(t,Rt,nt,r),A.push(re),L.set(Rt,re);return re}function pt(nt){if(--nt.usedTimes===0){let Rt=A.indexOf(nt);A[Rt]=A[A.length-1],A.pop(),L.delete(nt.cacheKey),nt.destroy()}}function Nt(nt){f.remove(nt)}function se(){f.dispose()}return{getParameters:rt,getProgramCacheKey:Ct,getUniforms:ft,acquireProgram:Pt,releaseProgram:pt,releaseShaderCache:Nt,programs:A,dispose:se}}function jx(){let t=new WeakMap;function e(u){return t.has(u)}function i(u){let f=t.get(u);if(f===void 0)f={},t.set(u,f);return f}function s(u){t.delete(u)}function r(u,f,x){t.get(u)[f]=x}function a(){t=new WeakMap}return{has:e,get:i,remove:s,update:r,dispose:a}}function ty(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.material.id!==e.material.id)return t.material.id-e.material.id;else if(t.materialVariant!==e.materialVariant)return t.materialVariant-e.materialVariant;else if(t.z!==e.z)return t.z-e.z;else return t.id-e.id}function cd(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.z!==e.z)return e.z-t.z;else return t.id-e.id}function hd(){let t=[],e=0,i=[],s=[],r=[];function a(){e=0,i.length=0,s.length=0,r.length=0}function u(R){let V=0;if(R.isInstancedMesh)V+=2;if(R.isSkinnedMesh)V+=1;return V}function f(R,V,rt,Ct,j,it){let ft=t[e];if(ft===void 0)ft={id:R.id,object:R,geometry:V,material:rt,materialVariant:u(R),groupOrder:Ct,renderOrder:R.renderOrder,z:j,group:it},t[e]=ft;else ft.id=R.id,ft.object=R,ft.geometry=V,ft.material=rt,ft.materialVariant=u(R),ft.groupOrder=Ct,ft.renderOrder=R.renderOrder,ft.z=j,ft.group=it;return e++,ft}function x(R,V,rt,Ct,j,it,ft){if(ft.reversedDepth===!0)j=-j;let Pt=f(R,V,rt,Ct,j,it);if(rt.transmission>0)s.push(Pt);else if(rt.transparent===!0)r.push(Pt);else i.push(Pt)}function A(R,V,rt,Ct,j,it){let ft=f(R,V,rt,Ct,j,it);if(rt.transmission>0)s.unshift(ft);else if(rt.transparent===!0)r.unshift(ft);else i.unshift(ft)}function L(R,V){if(i.length>1)i.sort(R||ty);if(s.length>1)s.sort(V||cd);if(r.length>1)r.sort(V||cd)}function D(){for(let R=e,V=t.length;R<V;R++){let rt=t[R];if(rt.id===null)break;rt.id=null,rt.object=null,rt.geometry=null,rt.material=null,rt.group=null}}return{opaque:i,transmissive:s,transparent:r,init:a,push:x,unshift:A,finish:D,sort:L}}function ey(){let t=new WeakMap;function e(s,r){let a=t.get(s),u;if(a===void 0)u=new hd,t.set(s,[u]);else if(r>=a.length)u=new hd,a.push(u);else u=a[r];return u}function i(){t=new WeakMap}return{get:e,dispose:i}}function ny(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let i;switch(e.type){case"SunLight":case"DirectionalLight":i={direction:new n,color:new c};break;case"SpotLight":i={position:new n,direction:new n,color:new c,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new n,color:new c,distance:0,decay:0};break;case"HemisphereLight":i={direction:new n,skyColor:new c,groundColor:new c};break;case"RectAreaLight":i={color:new c,position:new n,halfWidth:new n,halfHeight:new n};break}return t[e.id]=i,i}}}function iy(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let i;switch(e.type){case"SunLight":case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new l};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new l};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new l,shadowCameraNear:1,shadowCameraFar:1000};break}return t[e.id]=i,i}}}var sy=0;function ry(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function oy(t){let e=new ny,i=iy(),s={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let A=0;A<9;A++)s.probe.push(new n);let r=new n,a=new o,u=new o;function f(A){let L=0,D=0,R=0;for(let Pe=0;Pe<9;Pe++)s.probe[Pe].set(0,0,0);let V=0,rt=0,Ct=0,j=0,it=0,ft=0,Pt=0,pt=0,Nt=0,se=0,nt=0,Rt=0,re=0,be=0;A.sort(ry);for(let Pe=0,$e=A.length;Pe<$e;Pe++){let fe=A[Pe],{color:sn,intensity:un,distance:rn}=fe,wn=null;if(fe.shadow&&fe.shadow.map)if(fe.shadow.map.texture.format===Mr)wn=fe.shadow.map.texture;else wn=fe.shadow.map.depthTexture||fe.shadow.map.texture;if(fe.isAmbientLight)L+=sn.r*un,D+=sn.g*un,R+=sn.b*un;else if(fe.isLightProbe){for(let mn=0;mn<9;mn++)s.probe[mn].addScaledVector(fe.sh.coefficients[mn],un);be++}else if(fe.isSunLight){let mn=e.get(fe);if(mn.color.copy(fe.color).multiplyScalar(fe.intensity),fe.castShadow){let Sn=fe.shadow,Tn=i.get(fe);Tn.shadowIntensity=Sn.intensity,Tn.shadowBias=Sn.bias,Tn.shadowNormalBias=Sn.normalBias,Tn.shadowRadius=Sn.radius,Tn.shadowMapSize.copy(Sn.mapSize).multiply(Sn.getFrameExtents()),s.sunShadow[rt]=Tn,s.sunShadowMap[rt]=wn;let Gn=Sn.getViewportCount();for(let vn=0;vn<Gn;vn++)s.sunShadowMatrix[Ct+vn]=Sn.getMatrix(vn),s.sunShadowCascade[Ct+vn]=Sn._cascadeData[vn];Ct+=Gn,rt++}s.sun[V]=mn,V++}else if(fe.isDirectionalLight){let mn=e.get(fe);if(mn.color.copy(fe.color).multiplyScalar(fe.intensity),fe.castShadow){let Sn=fe.shadow,Tn=i.get(fe);Tn.shadowIntensity=Sn.intensity,Tn.shadowBias=Sn.bias,Tn.shadowNormalBias=Sn.normalBias,Tn.shadowRadius=Sn.radius,Tn.shadowMapSize=Sn.mapSize,s.directionalShadow[j]=Tn,s.directionalShadowMap[j]=wn,s.directionalShadowMatrix[j]=fe.shadow.matrix,Nt++}s.directional[j]=mn,j++}else if(fe.isSpotLight){let mn=e.get(fe);mn.position.setFromMatrixPosition(fe.matrixWorld),mn.color.copy(sn).multiplyScalar(un),mn.distance=rn,mn.coneCos=Math.cos(fe.angle),mn.penumbraCos=Math.cos(fe.angle*(1-fe.penumbra)),mn.decay=fe.decay,s.spot[ft]=mn;let Sn=fe.shadow;if(fe.map){if(s.spotLightMap[Rt]=fe.map,Rt++,Sn.updateMatrices(fe),fe.castShadow)re++}if(s.spotLightMatrix[ft]=Sn.matrix,fe.castShadow){let Tn=i.get(fe);Tn.shadowIntensity=Sn.intensity,Tn.shadowBias=Sn.bias,Tn.shadowNormalBias=Sn.normalBias,Tn.shadowRadius=Sn.radius,Tn.shadowMapSize=Sn.mapSize,s.spotShadow[ft]=Tn,s.spotShadowMap[ft]=wn,nt++}ft++}else if(fe.isRectAreaLight){let mn=e.get(fe);mn.color.copy(sn).multiplyScalar(un),mn.halfWidth.set(fe.width*0.5,0,0),mn.halfHeight.set(0,fe.height*0.5,0),s.rectArea[Pt]=mn,Pt++}else if(fe.isPointLight){let mn=e.get(fe);if(mn.color.copy(fe.color).multiplyScalar(fe.intensity),mn.distance=fe.distance,mn.decay=fe.decay,fe.castShadow){let Sn=fe.shadow,Tn=i.get(fe);Tn.shadowIntensity=Sn.intensity,Tn.shadowBias=Sn.bias,Tn.shadowNormalBias=Sn.normalBias,Tn.shadowRadius=Sn.radius,Tn.shadowMapSize=Sn.mapSize,Tn.shadowCameraNear=Sn.camera.near,Tn.shadowCameraFar=Sn.camera.far,s.pointShadow[it]=Tn,s.pointShadowMap[it]=wn,s.pointShadowMatrix[it]=fe.shadow.matrix,se++}s.point[it]=mn,it++}else if(fe.isHemisphereLight){let mn=e.get(fe);mn.skyColor.copy(fe.color).multiplyScalar(un),mn.groundColor.copy(fe.groundColor).multiplyScalar(un),s.hemi[pt]=mn,pt++}}if(Pt>0)if(t.has("OES_texture_float_linear")===!0)s.rectAreaLTC1=d.LTC_FLOAT_1,s.rectAreaLTC2=d.LTC_FLOAT_2;else s.rectAreaLTC1=d.LTC_HALF_1,s.rectAreaLTC2=d.LTC_HALF_2;s.ambient[0]=L,s.ambient[1]=D,s.ambient[2]=R;let he=s.hash;if(he.sunLength!==V||he.directionalLength!==j||he.pointLength!==it||he.spotLength!==ft||he.rectAreaLength!==Pt||he.hemiLength!==pt||he.numSunShadows!==rt||he.numDirectionalShadows!==Nt||he.numPointShadows!==se||he.numSpotShadows!==nt||he.numSpotMaps!==Rt||he.numLightProbes!==be)s.sun.length=V,s.directional.length=j,s.spot.length=ft,s.rectArea.length=Pt,s.point.length=it,s.hemi.length=pt,s.sunShadow.length=rt,s.sunShadowMap.length=rt,s.sunShadowMatrix.length=Ct,s.sunShadowCascade.length=Ct,s.directionalShadow.length=Nt,s.directionalShadowMap.length=Nt,s.directionalShadowMatrix.length=Nt,s.pointShadow.length=se,s.pointShadowMap.length=se,s.pointShadowMatrix.length=se,s.spotShadow.length=nt,s.spotShadowMap.length=nt,s.spotLightMatrix.length=nt+Rt-re,s.spotLightMap.length=Rt,s.numSpotLightShadowsWithMaps=re,s.numLightProbes=be,he.sunLength=V,he.directionalLength=j,he.pointLength=it,he.spotLength=ft,he.rectAreaLength=Pt,he.hemiLength=pt,he.numSunShadows=rt,he.numDirectionalShadows=Nt,he.numPointShadows=se,he.numSpotShadows=nt,he.numSpotMaps=Rt,he.numLightProbes=be,s.version=sy++}function x(A,L){let D=0,R=0,V=0,rt=0,Ct=0,j=0,it=L.matrixWorldInverse;for(let ft=0,Pt=A.length;ft<Pt;ft++){let pt=A[ft];if(pt.isSunLight){let Nt=s.sun[D];Nt.direction.setFromMatrixPosition(pt.matrixWorld),Nt.direction.transformDirection(it),D++}else if(pt.isDirectionalLight){let Nt=s.directional[R];Nt.direction.setFromMatrixPosition(pt.matrixWorld),r.setFromMatrixPosition(pt.target.matrixWorld),Nt.direction.sub(r),Nt.direction.transformDirection(it),R++}else if(pt.isSpotLight){let Nt=s.spot[rt];Nt.position.setFromMatrixPosition(pt.matrixWorld),Nt.position.applyMatrix4(it),Nt.direction.setFromMatrixPosition(pt.matrixWorld),r.setFromMatrixPosition(pt.target.matrixWorld),Nt.direction.sub(r),Nt.direction.transformDirection(it),rt++}else if(pt.isRectAreaLight){let Nt=s.rectArea[Ct];Nt.position.setFromMatrixPosition(pt.matrixWorld),Nt.position.applyMatrix4(it),u.identity(),a.copy(pt.matrixWorld),a.premultiply(it),u.extractRotation(a),Nt.halfWidth.set(pt.width*0.5,0,0),Nt.halfHeight.set(0,pt.height*0.5,0),Nt.halfWidth.applyMatrix4(u),Nt.halfHeight.applyMatrix4(u),Ct++}else if(pt.isPointLight){let Nt=s.point[V];Nt.position.setFromMatrixPosition(pt.matrixWorld),Nt.position.applyMatrix4(it),V++}else if(pt.isHemisphereLight){let Nt=s.hemi[j];Nt.direction.setFromMatrixPosition(pt.matrixWorld),Nt.direction.transformDirection(it),j++}}}return{setup:f,setupView:x,state:s}}function ud(t){let e=new oy(t),i=[],s=[],r=[];function a(D){L.camera=D,i.length=0,s.length=0,r.length=0}function u(D){if(D.isLightProbeGrid)r.push(D);else i.push(D)}function f(D){s.push(D)}function x(){e.setup(i),r.sort((D,R)=>D.priority-R.priority||D.id-R.id)}function A(D){e.setupView(i,D)}let L={lightsArray:i,shadowsArray:s,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:L,setupLights:x,setupLightsView:A,pushLight:u,pushShadow:f}}function ay(t){let e=new WeakMap;function i(r,a=0){let u=e.get(r),f;if(u===void 0)f=new ud(t),e.set(r,[f]);else if(a>=u.length)f=new ud(t),u.push(f);else f=u[a];return f}function s(){e=new WeakMap}return{get:i,dispose:s}}var ly=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,cy=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,hy=[new n(1,0,0),new n(-1,0,0),new n(0,1,0),new n(0,-1,0),new n(0,0,1),new n(0,0,-1)],uy=[new n(0,-1,0),new n(0,-1,0),new n(0,0,1),new n(0,0,-1),new n(0,-1,0),new n(0,-1,0)],fd=new o,Fo=new n,ph=new n;function fy(t,e,i){let s=new de,r=new l,a=new l,u=new b,f=new th,x=new eh,A={},L=i.maxTextureSize,D={[pe]:B,[B]:pe,[w]:w},R=new le({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new l},radius:{value:4}},vertexShader:ly,fragmentShader:cy}),V=R.clone();V.defines.HORIZONTAL_PASS=1;let rt=new m;rt.setAttribute("position",new _(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let Ct=new h(rt,R),j=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Eo;let it=this.type;this.render=function(se,nt,Rt){if(j.enabled===!1)return;if(j.autoUpdate===!1&&j.needsUpdate===!1)return;if(se.length===0)return;if(this.type===Wu)Yn("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Eo;let re=t.getRenderTarget(),be=t.getActiveCubeFace(),he=t.getActiveMipmapLevel(),Pe=t.state;if(Pe.setBlending(vr),Pe.buffers.depth.getReversed()===!0)Pe.buffers.color.setClear(0,0,0,0);else Pe.buffers.color.setClear(1,1,1,1);Pe.buffers.depth.setTest(!0),Pe.setScissorTest(!1);let $e=it!==this.type;if($e)nt.traverse(function(fe){if(fe.material)if(Array.isArray(fe.material))fe.material.forEach((sn)=>sn.needsUpdate=!0);else fe.material.needsUpdate=!0});for(let fe=0,sn=se.length;fe<sn;fe++){let un=se[fe],rn=un.shadow;if(rn===void 0){Yn("WebGLShadowMap:",un,"has no shadow.");continue}if(rn.autoUpdate===!1&&rn.needsUpdate===!1)continue;r.copy(rn.mapSize);let wn=rn.getFrameExtents();if(r.multiply(wn),a.copy(rn.mapSize),r.x>L||r.y>L){if(r.x>L)a.x=Math.floor(L/wn.x),r.x=a.x*wn.x,rn.mapSize.x=a.x;if(r.y>L)a.y=Math.floor(L/wn.y),r.y=a.y*wn.y,rn.mapSize.y=a.y}let mn=t.state.buffers.depth.getReversed();if(rn.camera._reversedDepth=mn,rn.map===null||$e===!0){if(rn.map!==null){if(rn.map.depthTexture!==null)rn.map.depthTexture.dispose(),rn.map.depthTexture=null;rn.map.dispose()}if(this.type===Yr){if(un.isPointLight){Yn("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}rn.map=new ne(r.x,r.y,{format:Mr,type:te,minFilter:I,magFilter:I,generateMipmaps:!1}),rn.map.texture.name=un.name+".shadowMap",rn.map.depthTexture=new nr(r.x,r.y,Xs),rn.map.depthTexture.name=un.name+".shadowMapDepth",rn.map.depthTexture.format=Jr,rn.map.depthTexture.compareFunction=null,rn.map.depthTexture.minFilter=oe,rn.map.depthTexture.magFilter=oe}else{if(un.isPointLight)rn.map=new qa(r.x),rn.map.depthTexture=new za(r.x,tr);else rn.map=new ne(r.x,r.y),rn.map.depthTexture=new nr(r.x,r.y,tr);if(rn.map.depthTexture.name=un.name+".shadowMap",rn.map.depthTexture.format=Jr,this.type===Eo)rn.map.depthTexture.compareFunction=mn?kc:Gc,rn.map.depthTexture.minFilter=I,rn.map.depthTexture.magFilter=I;else rn.map.depthTexture.compareFunction=null,rn.map.depthTexture.minFilter=oe,rn.map.depthTexture.magFilter=oe}rn.camera.updateProjectionMatrix()}if(rn.map.isWebGLCubeRenderTarget!==!0&&(rn.map.width!==r.x||rn.map.height!==r.y))rn.map.setSize(r.x,r.y);let Sn=rn.map.isWebGLCubeRenderTarget?6:rn.getViewportCount();if(un.isPointLight!==!0)rn.updateMatrices(un,Rt);let Tn=(rn.camera.layers.mask&4294967294)!==0?rn.camera.layers:Rt.layers;for(let Gn=0;Gn<Sn;Gn++){let vn=rn.getCamera(Gn);if(un.isPointLight){let{camera:An,matrix:zn}=rn,Jn=un.distance||An.far;if(Jn!==An.far)An.far=Jn,An.updateProjectionMatrix();Fo.setFromMatrixPosition(un.matrixWorld),An.position.copy(Fo),ph.copy(An.position),ph.add(hy[Gn]),An.up.copy(uy[Gn]),An.lookAt(ph),An.updateMatrixWorld(),zn.makeTranslation(-Fo.x,-Fo.y,-Fo.z),fd.multiplyMatrices(An.projectionMatrix,An.matrixWorldInverse),rn._frustum.setFromProjectionMatrix(fd,An.coordinateSystem,An.reversedDepth)}if(rn.map.isWebGLCubeRenderTarget)t.setRenderTarget(rn.map,Gn),t.clear();else{if(Gn===0)t.setRenderTarget(rn.map),t.clear();let An=rn.getViewport(Gn);u.set(a.x*An.x,a.y*An.y,a.x*An.z,a.y*An.w),Pe.viewport(u)}s=rn.getFrustum(Gn),pt(nt,Rt,vn,un,Tn,this.type)}if(rn.isPointLightShadow!==!0&&this.type===Yr)ft(rn,Rt);rn.needsUpdate=!1}it=this.type,j.needsUpdate=!1,t.setRenderTarget(re,be,he)};function ft(se,nt){let Rt=e.update(Ct);if(R.defines.VSM_SAMPLES!==se.blurSamples)R.defines.VSM_SAMPLES=se.blurSamples,V.defines.VSM_SAMPLES=se.blurSamples,R.needsUpdate=!0,V.needsUpdate=!0;if(se.mapPass===null)se.mapPass=new ne(r.x,r.y,{format:Mr,type:te});else if(se.mapPass.width!==se.map.width||se.mapPass.height!==se.map.height)se.mapPass.setSize(se.map.width,se.map.height);R.uniforms.shadow_pass.value=se.map.depthTexture,R.uniforms.resolution.value.set(se.map.width,se.map.height),R.uniforms.radius.value=se.radius,t.setRenderTarget(se.mapPass),t.clear(),t.renderBufferDirect(nt,null,Rt,R,Ct,null),V.uniforms.shadow_pass.value=se.mapPass.texture,V.uniforms.resolution.value.set(se.map.width,se.map.height),V.uniforms.radius.value=se.radius,t.setRenderTarget(se.map),t.clear(),t.renderBufferDirect(nt,null,Rt,V,Ct,null)}function Pt(se,nt,Rt,re){let be=null,he=Rt.isPointLight===!0?se.customDistanceMaterial:se.customDepthMaterial;if(he!==void 0)be=he;else if(be=Rt.isPointLight===!0?x:f,t.localClippingEnabled&&nt.clipShadows===!0&&Array.isArray(nt.clippingPlanes)&&nt.clippingPlanes.length!==0||nt.displacementMap&&nt.displacementScale!==0||nt.alphaMap&&nt.alphaTest>0||nt.map&&nt.alphaTest>0||nt.alphaToCoverage===!0){let Pe=be.uuid,$e=nt.uuid,fe=A[Pe];if(fe===void 0)fe={},A[Pe]=fe;let sn=fe[$e];if(sn===void 0)sn=be.clone(),fe[$e]=sn,nt.addEventListener("dispose",Nt);be=sn}if(be.visible=nt.visible,be.wireframe=nt.wireframe,re===Yr)be.side=nt.shadowSide!==null?nt.shadowSide:nt.side;else be.side=nt.shadowSide!==null?nt.shadowSide:D[nt.side];if(be.alphaMap=nt.alphaMap,be.alphaTest=nt.alphaToCoverage===!0?0.5:nt.alphaTest,be.map=nt.map,be.clipShadows=nt.clipShadows,be.clippingPlanes=nt.clippingPlanes,be.clipIntersection=nt.clipIntersection,be.displacementMap=nt.displacementMap,be.displacementScale=nt.displacementScale,be.displacementBias=nt.displacementBias,be.wireframeLinewidth=nt.wireframeLinewidth,be.linewidth=nt.linewidth,Rt.isPointLight===!0&&be.isMeshDistanceMaterial===!0){let Pe=t.properties.get(be);Pe.light=Rt}return be}function pt(se,nt,Rt,re,be,he){if(se.visible===!1)return;if(se.layers.test(be)&&(se.isMesh||se.isLine||se.isPoints)){if((se.castShadow||se.receiveShadow&&he===Yr)&&(!se.frustumCulled||se.intersectsFrustum(s))){se.modelViewMatrix.multiplyMatrices(Rt.matrixWorldInverse,se.matrixWorld);let fe=e.update(se),sn=se.material;if(Array.isArray(sn)){let un=fe.groups;for(let rn=0,wn=un.length;rn<wn;rn++){let mn=un[rn],Sn=sn[mn.materialIndex];if(Sn&&Sn.visible){let Tn=Pt(se,Sn,re,he);se.onBeforeShadow(t,se,nt,Rt,fe,Tn,mn),t.renderBufferDirect(Rt,null,fe,Tn,se,mn),se.onAfterShadow(t,se,nt,Rt,fe,Tn,mn)}}}else if(sn.visible){let un=Pt(se,sn,re,he);se.onBeforeShadow(t,se,nt,Rt,fe,un,null),t.renderBufferDirect(Rt,null,fe,un,se,null),se.onAfterShadow(t,se,nt,Rt,fe,un,null)}}}let $e=se.children;for(let fe=0,sn=$e.length;fe<sn;fe++)pt($e[fe],nt,Rt,re,be,he)}function Nt(se){se.target.removeEventListener("dispose",Nt);for(let Rt in A){let re=A[Rt],be=se.target.uuid;if(be in re)re[be].dispose(),delete re[be]}}}function dy(t,e){function i(){let Ne=!1,xn=new b,gn=null,En=new b(0,0,0,0);return{setMask:function(Rn){if(gn!==Rn&&!Ne)t.colorMask(Rn,Rn,Rn,Rn),gn=Rn},setLocked:function(Rn){Ne=Rn},setClear:function(Rn,Dn,Zn,qn,Fn){if(Fn===!0)Rn*=qn,Dn*=qn,Zn*=qn;if(xn.set(Rn,Dn,Zn,qn),En.equals(xn)===!1)t.clearColor(Rn,Dn,Zn,qn),En.copy(xn)},reset:function(){Ne=!1,gn=null,En.set(-1,0,0,0)}}}function s(){let Ne=!1,xn=!1,gn=null,En=null,Rn=null;return{setReversed:function(Dn){if(xn!==Dn){let Zn=e.get("EXT_clip_control");if(Dn)Zn.clipControlEXT(Zn.LOWER_LEFT_EXT,Zn.ZERO_TO_ONE_EXT);else Zn.clipControlEXT(Zn.LOWER_LEFT_EXT,Zn.NEGATIVE_ONE_TO_ONE_EXT);xn=Dn;let qn=Rn;Rn=null,this.setClear(qn)}},getReversed:function(){return xn},setTest:function(Dn){if(Dn)kn(t.DEPTH_TEST);else di(t.DEPTH_TEST)},setMask:function(Dn){if(gn!==Dn&&!Ne)t.depthMask(Dn),gn=Dn},setFunc:function(Dn){if(xn)Dn=Uf[Dn];if(En!==Dn){switch(Dn){case hf:t.depthFunc(t.NEVER);break;case uf:t.depthFunc(t.ALWAYS);break;case ff:t.depthFunc(t.LESS);break;case jl:t.depthFunc(t.LEQUAL);break;case df:t.depthFunc(t.EQUAL);break;case pf:t.depthFunc(t.GEQUAL);break;case mf:t.depthFunc(t.GREATER);break;case gf:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}En=Dn}},setLocked:function(Dn){Ne=Dn},setClear:function(Dn){if(Rn!==Dn){if(Rn=Dn,xn)Dn=1-Dn;t.clearDepth(Dn)}},reset:function(){Ne=!1,gn=null,En=null,Rn=null,xn=!1}}}function r(){let Ne=!1,xn=null,gn=null,En=null,Rn=null,Dn=null,Zn=null,qn=null,Fn=null;return{setTest:function($n){if(!Ne)if($n)kn(t.STENCIL_TEST);else di(t.STENCIL_TEST)},setMask:function($n){if(xn!==$n&&!Ne)t.stencilMask($n),xn=$n},setFunc:function($n,ri,On){if(gn!==$n||En!==ri||Rn!==On)t.stencilFunc($n,ri,On),gn=$n,En=ri,Rn=On},setOp:function($n,ri,On){if(Dn!==$n||Zn!==ri||qn!==On)t.stencilOp($n,ri,On),Dn=$n,Zn=ri,qn=On},setLocked:function($n){Ne=$n},setClear:function($n){if(Fn!==$n)t.clearStencil($n),Fn=$n},reset:function(){Ne=!1,xn=null,gn=null,En=null,Rn=null,Dn=null,Zn=null,qn=null,Fn=null}}}let a=new i,u=new s,f=new r,x={},A=new WeakMap,L={},D={},R={},V=new WeakMap,rt=[],Ct=null,j=!1,it=null,ft=null,Pt=null,pt=null,Nt=null,se=null,nt=null,Rt=new c(0,0,0),re=0,be=!1,he=null,Pe=null,$e=null,fe=null,sn=null,un=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),rn=!1,wn=0,mn=t.getParameter(t.VERSION);if(mn.indexOf("WebGL")!==-1)wn=parseFloat(/^WebGL (\d)/.exec(mn)[1]),rn=wn>=1;else if(mn.indexOf("OpenGL ES")!==-1)wn=parseFloat(/^OpenGL ES (\d)/.exec(mn)[1]),rn=wn>=2;let Sn=null,Tn={},Gn=t.getParameter(t.SCISSOR_BOX),vn=t.getParameter(t.VIEWPORT),An=new b().fromArray(Gn),zn=new b().fromArray(vn);function Jn(Ne,xn,gn,En){let Rn=new Uint8Array(4),Dn=t.createTexture();t.bindTexture(Ne,Dn),t.texParameteri(Ne,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(Ne,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let Zn=0;Zn<gn;Zn++)if(Ne===t.TEXTURE_3D||Ne===t.TEXTURE_2D_ARRAY)t.texImage3D(xn,0,t.RGBA,1,1,En,0,t.RGBA,t.UNSIGNED_BYTE,Rn);else t.texImage2D(xn+Zn,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,Rn);return Dn}let Kn={};Kn[t.TEXTURE_2D]=Jn(t.TEXTURE_2D,t.TEXTURE_2D,1),Kn[t.TEXTURE_CUBE_MAP]=Jn(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),Kn[t.TEXTURE_2D_ARRAY]=Jn(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),Kn[t.TEXTURE_3D]=Jn(t.TEXTURE_3D,t.TEXTURE_3D,1,1),a.setClear(0,0,0,1),u.setClear(1),f.setClear(0),kn(t.DEPTH_TEST),u.setFunc(jl),hs(!1),Di($l),kn(t.CULL_FACE),Ni(vr);function kn(Ne){if(L[Ne]!==!0)t.enable(Ne),L[Ne]=!0}function di(Ne){if(L[Ne]!==!1)t.disable(Ne),L[Ne]=!1}function oi(Ne,xn){if(R[Ne]!==xn){if(t.bindFramebuffer(Ne,xn),R[Ne]=xn,Ne===t.DRAW_FRAMEBUFFER)R[t.FRAMEBUFFER]=xn;if(Ne===t.FRAMEBUFFER)R[t.DRAW_FRAMEBUFFER]=xn;return!0}return!1}function si(Ne,xn){let gn=rt,En=!1;if(Ne){if(gn=V.get(xn),gn===void 0)gn=[],V.set(xn,gn);let Rn=Ne.textures;if(gn.length!==Rn.length||gn[0]!==t.COLOR_ATTACHMENT0){for(let Dn=0,Zn=Rn.length;Dn<Zn;Dn++)gn[Dn]=t.COLOR_ATTACHMENT0+Dn;gn.length=Rn.length,En=!0}}else if(gn[0]!==t.BACK)gn[0]=t.BACK,En=!0;if(En)t.drawBuffers(gn)}function xi(Ne){if(Ct!==Ne)return t.useProgram(Ne),Ct=Ne,!0;return!1}let hi={[ke]:t.FUNC_ADD,[Xu]:t.FUNC_SUBTRACT,[qu]:t.FUNC_REVERSE_SUBTRACT};hi[Yu]=t.MIN,hi[Zu]=t.MAX;let Pi={[Ju]:t.ZERO,[It]:t.ONE,[$u]:t.SRC_COLOR,[Qu]:t.SRC_ALPHA,[rf]:t.SRC_ALPHA_SATURATE,[nf]:t.DST_COLOR,[tf]:t.DST_ALPHA,[Ku]:t.ONE_MINUS_SRC_COLOR,[ju]:t.ONE_MINUS_SRC_ALPHA,[sf]:t.ONE_MINUS_DST_COLOR,[ef]:t.ONE_MINUS_DST_ALPHA,[of]:t.CONSTANT_COLOR,[af]:t.ONE_MINUS_CONSTANT_COLOR,[lf]:t.CONSTANT_ALPHA,[cf]:t.ONE_MINUS_CONSTANT_ALPHA};function Ni(Ne,xn,gn,En,Rn,Dn,Zn,qn,Fn,$n){if(Ne===vr){if(j===!0)di(t.BLEND),j=!1;return}if(j===!1)kn(t.BLEND),j=!0;if(Ne!==Lt){if(Ne!==it||$n!==be){if(ft!==ke||Nt!==ke)t.blendEquation(t.FUNC_ADD),ft=ke,Nt=ke;if($n)switch(Ne){case wo:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case mt:t.blendFunc(t.ONE,t.ONE);break;case Kl:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Ql:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:jn("WebGLState: Invalid blending: ",Ne);break}else switch(Ne){case wo:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case mt:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case Kl:jn("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ql:jn("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:jn("WebGLState: Invalid blending: ",Ne);break}Pt=null,pt=null,se=null,nt=null,Rt.set(0,0,0),re=0,it=Ne,be=$n}return}if(Rn=Rn||xn,Dn=Dn||gn,Zn=Zn||En,xn!==ft||Rn!==Nt)t.blendEquationSeparate(hi[xn],hi[Rn]),ft=xn,Nt=Rn;if(gn!==Pt||En!==pt||Dn!==se||Zn!==nt)t.blendFuncSeparate(Pi[gn],Pi[En],Pi[Dn],Pi[Zn]),Pt=gn,pt=En,se=Dn,nt=Zn;if(qn.equals(Rt)===!1||Fn!==re)t.blendColor(qn.r,qn.g,qn.b,Fn),Rt.copy(qn),re=Fn;it=Ne,be=!1}function os(Ne,xn){Ne.side===w?di(t.CULL_FACE):kn(t.CULL_FACE);let gn=Ne.side===B;if(xn)gn=!gn;hs(gn),Ne.blending===wo&&Ne.transparent===!1?Ni(vr):Ni(Ne.blending,Ne.blendEquation,Ne.blendSrc,Ne.blendDst,Ne.blendEquationAlpha,Ne.blendSrcAlpha,Ne.blendDstAlpha,Ne.blendColor,Ne.blendAlpha,Ne.premultipliedAlpha),u.setFunc(Ne.depthFunc),u.setTest(Ne.depthTest),u.setMask(Ne.depthWrite),a.setMask(Ne.colorWrite);let En=Ne.stencilWrite;if(f.setTest(En),En)f.setMask(Ne.stencilWriteMask),f.setFunc(Ne.stencilFunc,Ne.stencilRef,Ne.stencilFuncMask),f.setOp(Ne.stencilFail,Ne.stencilZFail,Ne.stencilZPass);as(Ne.polygonOffset,Ne.polygonOffsetFactor,Ne.polygonOffsetUnits),Ne.alphaToCoverage===!0?kn(t.SAMPLE_ALPHA_TO_COVERAGE):di(t.SAMPLE_ALPHA_TO_COVERAGE)}function hs(Ne){if(he!==Ne){if(Ne)t.frontFace(t.CW);else t.frontFace(t.CCW);he=Ne}}function Di(Ne){if(Ne!==Hu){if(kn(t.CULL_FACE),Ne!==Pe)if(Ne===$l)t.cullFace(t.BACK);else if(Ne===Vu)t.cullFace(t.FRONT);else t.cullFace(t.FRONT_AND_BACK)}else di(t.CULL_FACE);Pe=Ne}function Yi(Ne){if(Ne!==$e){if(rn)t.lineWidth(Ne);$e=Ne}}function as(Ne,xn,gn){if(Ne){if(kn(t.POLYGON_OFFSET_FILL),fe!==xn||sn!==gn){if(fe=xn,sn=gn,u.getReversed())xn=-xn,gn=-gn;t.polygonOffset(xn,gn)}}else di(t.POLYGON_OFFSET_FILL)}function ls(Ne){if(Ne)kn(t.SCISSOR_TEST);else di(t.SCISSOR_TEST)}function _s(Ne){if(Ne===void 0)Ne=t.TEXTURE0+un-1;if(Sn!==Ne)t.activeTexture(Ne),Sn=Ne}function Ke(Ne,xn,gn){if(gn===void 0)if(Sn===null)gn=t.TEXTURE0+un-1;else gn=Sn;let En=Tn[gn];if(En===void 0)En={type:void 0,texture:void 0},Tn[gn]=En;if(En.type!==Ne||En.texture!==xn){if(Sn!==gn)t.activeTexture(gn),Sn=gn;t.bindTexture(Ne,xn||Kn[Ne]),En.type=Ne,En.texture=xn}}function xs(){let Ne=Tn[Sn];if(Ne!==void 0&&Ne.type!==void 0)t.bindTexture(Ne.type,null),Ne.type=void 0,Ne.texture=void 0}function yi(){try{t.compressedTexImage2D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Gi(){try{t.compressedTexImage3D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Un(){try{t.texSubImage2D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function wi(){try{t.texSubImage3D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Qn(){try{t.compressedTexSubImage2D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function ni(){try{t.compressedTexSubImage3D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Zi(){try{t.texStorage2D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Me(){try{t.texStorage3D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function Ut(){try{t.texImage2D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function on(){try{t.texImage3D(...arguments)}catch(Ne){jn("WebGLState:",Ne)}}function bn(Ne){if(D[Ne]!==void 0)return D[Ne];else return t.getParameter(Ne)}function Mn(Ne,xn){if(D[Ne]!==xn)t.pixelStorei(Ne,xn),D[Ne]=xn}function Cn(Ne){if(An.equals(Ne)===!1)t.scissor(Ne.x,Ne.y,Ne.z,Ne.w),An.copy(Ne)}function Ln(Ne){if(zn.equals(Ne)===!1)t.viewport(Ne.x,Ne.y,Ne.z,Ne.w),zn.copy(Ne)}function pn(Ne,xn){let gn=A.get(xn);if(gn===void 0)gn=new WeakMap,A.set(xn,gn);let En=gn.get(Ne);if(En===void 0)En=t.getUniformBlockIndex(xn,Ne.name),t.uniformBlockBinding(xn,En,En),gn.set(Ne,En)}function yn(Ne,xn,gn){let Rn=A.get(xn).get(Ne);if(x[Rn]!==gn)t.bindBufferBase(t.UNIFORM_BUFFER,Rn,gn),x[Rn]=gn}function In(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),u.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),L={},D={},Sn=null,Tn={},R={},x={},V=new WeakMap,rt=[],Ct=null,j=!1,it=null,ft=null,Pt=null,pt=null,Nt=null,se=null,nt=null,Rt=new c(0,0,0),re=0,be=!1,he=null,Pe=null,$e=null,fe=null,sn=null,An.set(0,0,t.canvas.width,t.canvas.height),zn.set(0,0,t.canvas.width,t.canvas.height),a.reset(),u.reset(),f.reset()}return{buffers:{color:a,depth:u,stencil:f},enable:kn,disable:di,bindFramebuffer:oi,drawBuffers:si,useProgram:xi,setBlending:Ni,setMaterial:os,setFlipSided:hs,setCullFace:Di,setLineWidth:Yi,setPolygonOffset:as,setScissorTest:ls,activeTexture:_s,bindTexture:Ke,unbindTexture:xs,compressedTexImage2D:yi,compressedTexImage3D:Gi,texImage2D:Ut,texImage3D:on,pixelStorei:Mn,getParameter:bn,updateUBOMapping:pn,uniformBlockBinding:yn,texStorage2D:Zi,texStorage3D:Me,texSubImage2D:Un,texSubImage3D:wi,compressedTexSubImage2D:Qn,compressedTexSubImage3D:ni,scissor:Cn,viewport:Ln,reset:In}}function py(t,e,i,s,r,a,u){let f=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,x=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),A=new l,L=new WeakMap,D=new Set,R,V=new WeakMap,rt=new Set,Ct=new FinalizationRegistry((Me)=>rt.delete(Me)),j=!1;try{j=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(Me){}function it(Me,Ut){return j?new OffscreenCanvas(Me,Ut):Xr("canvas")}function ft(Me,Ut,on){let bn=1,Mn=Zi(Me);if(Mn.width>on||Mn.height>on)bn=on/Math.max(Mn.width,Mn.height);if(bn<1)if(typeof HTMLImageElement<"u"&&Me instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&Me instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&Me instanceof ImageBitmap||typeof VideoFrame<"u"&&Me instanceof VideoFrame){let Cn=Math.floor(bn*Mn.width),Ln=Math.floor(bn*Mn.height);if(R===void 0)R=it(Cn,Ln);let pn=Ut?it(Cn,Ln):R;return pn.width=Cn,pn.height=Ln,pn.getContext("2d").drawImage(Me,0,0,Cn,Ln),Yn("WebGLRenderer: Texture has been resized from ("+Mn.width+"x"+Mn.height+") to ("+Cn+"x"+Ln+")."),pn}else{if("data"in Me)Yn("WebGLRenderer: Image in DataTexture is too big ("+Mn.width+"x"+Mn.height+").");return Me}return Me}function Pt(Me){return Me.generateMipmaps}function pt(Me){t.generateMipmap(Me)}function Nt(Me){if(Me.isWebGLCubeRenderTarget)return t.TEXTURE_CUBE_MAP;if(Me.isWebGL3DRenderTarget)return t.TEXTURE_3D;if(Me.isWebGLArrayRenderTarget||Me.isCompressedArrayTexture)return t.TEXTURE_2D_ARRAY;return t.TEXTURE_2D}function se(Me,Ut,on,bn,Mn,Cn=!1){if(Me!==null){if(t[Me]!==void 0)return t[Me];Yn("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+Me+"'")}let Ln;if(bn){if(Ln=e.get("EXT_texture_norm16"),!Ln)Yn("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let pn=Ut;if(Ut===t.RED){if(on===t.FLOAT)pn=t.R32F;if(on===t.HALF_FLOAT)pn=t.R16F;if(on===t.UNSIGNED_BYTE)pn=t.R8;if(on===t.UNSIGNED_SHORT&&Ln)pn=Ln.R16_EXT;if(on===t.SHORT&&Ln)pn=Ln.R16_SNORM_EXT}if(Ut===t.RED_INTEGER){if(on===t.UNSIGNED_BYTE)pn=t.R8UI;if(on===t.UNSIGNED_SHORT)pn=t.R16UI;if(on===t.UNSIGNED_INT)pn=t.R32UI;if(on===t.BYTE)pn=t.R8I;if(on===t.SHORT)pn=t.R16I;if(on===t.INT)pn=t.R32I}if(Ut===t.RG){if(on===t.FLOAT)pn=t.RG32F;if(on===t.HALF_FLOAT)pn=t.RG16F;if(on===t.UNSIGNED_BYTE)pn=t.RG8;if(on===t.UNSIGNED_SHORT&&Ln)pn=Ln.RG16_EXT;if(on===t.SHORT&&Ln)pn=Ln.RG16_SNORM_EXT}if(Ut===t.RG_INTEGER){if(on===t.UNSIGNED_BYTE)pn=t.RG8UI;if(on===t.UNSIGNED_SHORT)pn=t.RG16UI;if(on===t.UNSIGNED_INT)pn=t.RG32UI;if(on===t.BYTE)pn=t.RG8I;if(on===t.SHORT)pn=t.RG16I;if(on===t.INT)pn=t.RG32I}if(Ut===t.RGB_INTEGER){if(on===t.UNSIGNED_BYTE)pn=t.RGB8UI;if(on===t.UNSIGNED_SHORT)pn=t.RGB16UI;if(on===t.UNSIGNED_INT)pn=t.RGB32UI;if(on===t.BYTE)pn=t.RGB8I;if(on===t.SHORT)pn=t.RGB16I;if(on===t.INT)pn=t.RGB32I}if(Ut===t.RGBA_INTEGER){if(on===t.UNSIGNED_BYTE)pn=t.RGBA8UI;if(on===t.UNSIGNED_SHORT)pn=t.RGBA16UI;if(on===t.UNSIGNED_INT)pn=t.RGBA32UI;if(on===t.BYTE)pn=t.RGBA8I;if(on===t.SHORT)pn=t.RGBA16I;if(on===t.INT)pn=t.RGBA32I}if(Ut===t.RGB){if(on===t.UNSIGNED_SHORT&&Ln)pn=Ln.RGB16_EXT;if(on===t.SHORT&&Ln)pn=Ln.RGB16_SNORM_EXT;if(on===t.UNSIGNED_INT_5_9_9_9_REV)pn=t.RGB9_E5;if(on===t.UNSIGNED_INT_10F_11F_11F_REV)pn=t.R11F_G11F_B10F}if(Ut===t.RGBA){let yn=Cn?zc:y.getTransfer(Mn);if(on===t.FLOAT)pn=t.RGBA32F;if(on===t.HALF_FLOAT)pn=t.RGBA16F;if(on===t.UNSIGNED_BYTE)pn=yn===Ti?t.SRGB8_ALPHA8:t.RGBA8;if(on===t.UNSIGNED_SHORT&&Ln)pn=Ln.RGBA16_EXT;if(on===t.SHORT&&Ln)pn=Ln.RGBA16_SNORM_EXT;if(on===t.UNSIGNED_SHORT_4_4_4_4)pn=t.RGBA4;if(on===t.UNSIGNED_SHORT_5_5_5_1)pn=t.RGB5_A1}if(pn===t.R16F||pn===t.R32F||pn===t.RG16F||pn===t.RG32F||pn===t.RGBA16F||pn===t.RGBA32F)e.get("EXT_color_buffer_float");return pn}function nt(Me,Ut){let on;if(Me){if(Ut===null||Ut===tr||Ut===Sr)on=t.DEPTH24_STENCIL8;else if(Ut===Xs)on=t.DEPTH32F_STENCIL8;else if(Ut===Co)on=t.DEPTH24_STENCIL8,Yn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(Ut===null||Ut===tr||Ut===Sr)on=t.DEPTH_COMPONENT24;else if(Ut===Xs)on=t.DEPTH_COMPONENT32F;else if(Ut===Co)on=t.DEPTH_COMPONENT16;return on}function Rt(Me,Ut){if(Pt(Me)===!0||Me.isFramebufferTexture&&Me.minFilter!==oe&&Me.minFilter!==I)return Math.log2(Math.max(Ut.width,Ut.height))+1;else if(Me.mipmaps.length>0)return Me.mipmaps.length;else if(Me.isCompressedTexture&&Array.isArray(Me.image))return Ut.mipmaps.length;else return 1}function re(Me){let Ut=new WeakRef(Me);s.get(Me).__ref=Ut,rt.add(Ut),Ct.register(Me,Ut,Ut)}function be(Me){let Ut=s.get(Me).__ref;if(Ut===void 0)return;rt.delete(Ut),Ct.unregister(Ut)}function he(Me){$e(Me.target)}function Pe(Me){fe(Me.target)}function $e(Me){if(Me.removeEventListener("dispose",he),be(Me),un(Me),Me.isVideoTexture)L.delete(Me);if(Me.isHTMLTexture)D.delete(Me)}function fe(Me){Me.removeEventListener("dispose",Pe),be(Me),wn(Me)}function sn(){for(let Me of rt){let Ut=Me.deref();if(Ut===void 0)continue;if(Ut.isRenderTarget===!0)fe(Ut);else $e(Ut)}rt.clear(),D.clear()}function un(Me){let Ut=s.get(Me);if(Ut.__webglInit===void 0)return;let on=Me.source,bn=V.get(on);if(bn){let Mn=bn[Ut.__cacheKey];if(Mn.usedTimes--,Mn.usedTimes===0)rn(Me);if(Object.keys(bn).length===0)V.delete(on)}s.remove(Me)}function rn(Me){let Ut=s.get(Me);t.deleteTexture(Ut.__webglTexture);let on=Me.source,bn=V.get(on);delete bn[Ut.__cacheKey],u.memory.textures--}function wn(Me){let Ut=s.get(Me);if(Ut.__depthDisposeCallback)Ut.__depthDisposeCallback();let on=Me.depthTexture;if(on&&on.renderTarget===Me)$e(on);if(Me.isWebGLCubeRenderTarget)for(let Mn=0;Mn<6;Mn++){if(Array.isArray(Ut.__webglFramebuffer[Mn]))for(let Cn=0;Cn<Ut.__webglFramebuffer[Mn].length;Cn++)t.deleteFramebuffer(Ut.__webglFramebuffer[Mn][Cn]);else t.deleteFramebuffer(Ut.__webglFramebuffer[Mn]);if(Ut.__webglDepthbuffer)t.deleteRenderbuffer(Ut.__webglDepthbuffer[Mn])}else{if(Array.isArray(Ut.__webglFramebuffer))for(let Mn=0;Mn<Ut.__webglFramebuffer.length;Mn++)t.deleteFramebuffer(Ut.__webglFramebuffer[Mn]);else t.deleteFramebuffer(Ut.__webglFramebuffer);if(Ut.__webglDepthbuffer)t.deleteRenderbuffer(Ut.__webglDepthbuffer);if(Ut.__webglMultisampledFramebuffer)t.deleteFramebuffer(Ut.__webglMultisampledFramebuffer);if(Ut.__webglColorRenderbuffer){for(let Mn=0;Mn<Ut.__webglColorRenderbuffer.length;Mn++)if(Ut.__webglColorRenderbuffer[Mn])t.deleteRenderbuffer(Ut.__webglColorRenderbuffer[Mn])}if(Ut.__webglDepthRenderbuffer)t.deleteRenderbuffer(Ut.__webglDepthRenderbuffer)}let bn=Me.textures;for(let Mn=0,Cn=bn.length;Mn<Cn;Mn++){let Ln=s.get(bn[Mn]);if(Ln.__webglTexture)t.deleteTexture(Ln.__webglTexture),u.memory.textures--;s.remove(bn[Mn])}s.remove(Me)}let mn=0;function Sn(){mn=0}function Tn(){return mn}function Gn(Me){mn=Me}function vn(){let Me=mn;if(Me>=r.maxTextures)Yn("WebGLTextures: Trying to use "+(Me+1)+" texture units while this GPU supports only "+r.maxTextures);return mn+=1,Me}function An(Me){let Ut=[];return Ut.push(Me.wrapS),Ut.push(Me.wrapT),Ut.push(Me.wrapR||0),Ut.push(Me.magFilter),Ut.push(Me.minFilter),Ut.push(Me.anisotropy),Ut.push(Me.internalFormat),Ut.push(Me.format),Ut.push(Me.type),Ut.push(Me.generateMipmaps),Ut.push(Me.mipmapsAutoUpdate),Ut.push(Me.premultiplyAlpha),Ut.push(Me.flipY),Ut.push(Me.unpackAlignment),Ut.push(Me.colorSpace),Ut.join()}function zn(Me,Ut){let on=s.get(Me);if(Me.isVideoTexture)Qn(Me);if(Me.isRenderTargetTexture===!1&&Me.isExternalTexture!==!0&&Me.version>0&&on.__version!==Me.version){let bn=Me.image;if(bn===null)Yn("WebGLRenderer: Texture marked for update but no image data found.");else if(bn.complete===!1)Yn("WebGLRenderer: Texture marked for update but image is incomplete");else{os(on,Me,Ut);return}}else if(Me.isExternalTexture)on.__webglTexture=Me.sourceTexture?Me.sourceTexture:null;i.bindTexture(t.TEXTURE_2D,on.__webglTexture,t.TEXTURE0+Ut)}function Jn(Me,Ut){let on=s.get(Me);if(Me.isRenderTargetTexture===!1&&Me.version>0&&on.__version!==Me.version){os(on,Me,Ut);return}else if(Me.isExternalTexture)on.__webglTexture=Me.sourceTexture?Me.sourceTexture:null;i.bindTexture(t.TEXTURE_2D_ARRAY,on.__webglTexture,t.TEXTURE0+Ut)}function Kn(Me,Ut){let on=s.get(Me);if(Me.isRenderTargetTexture===!1&&Me.version>0&&on.__version!==Me.version){os(on,Me,Ut);return}i.bindTexture(t.TEXTURE_3D,on.__webglTexture,t.TEXTURE0+Ut)}function kn(Me,Ut){let on=s.get(Me);if(Me.version>0&&on.__version!==Me.version){hs(on,Me,Ut);return}i.bindTexture(t.TEXTURE_CUBE_MAP,on.__webglTexture,t.TEXTURE0+Ut)}let di={[xe]:t.REPEAT,[Oe]:t.CLAMP_TO_EDGE,[kt]:t.MIRRORED_REPEAT},oi={[oe]:t.NEAREST,[Ot]:t.NEAREST_MIPMAP_NEAREST,[je]:t.NEAREST_MIPMAP_LINEAR,[I]:t.LINEAR,[st]:t.LINEAR_MIPMAP_NEAREST,[ee]:t.LINEAR_MIPMAP_LINEAR},si={[wf]:t.NEVER,[Hc]:t.ALWAYS,[Rf]:t.LESS,[Gc]:t.LEQUAL,[Cf]:t.EQUAL,[kc]:t.GEQUAL,[If]:t.GREATER,[Pf]:t.NOTEQUAL};function xi(Me,Ut){if(Ut.type===Xs&&e.has("OES_texture_float_linear")===!1&&(Ut.magFilter===I||Ut.magFilter===st||Ut.magFilter===je||Ut.magFilter===ee||Ut.minFilter===I||Ut.minFilter===st||Ut.minFilter===je||Ut.minFilter===ee))Yn("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(t.texParameteri(Me,t.TEXTURE_WRAP_S,di[Ut.wrapS]),t.texParameteri(Me,t.TEXTURE_WRAP_T,di[Ut.wrapT]),Me===t.TEXTURE_3D||Me===t.TEXTURE_2D_ARRAY)t.texParameteri(Me,t.TEXTURE_WRAP_R,di[Ut.wrapR]);if(t.texParameteri(Me,t.TEXTURE_MAG_FILTER,oi[Ut.magFilter]),t.texParameteri(Me,t.TEXTURE_MIN_FILTER,oi[Ut.minFilter]),Ut.compareFunction)t.texParameteri(Me,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(Me,t.TEXTURE_COMPARE_FUNC,si[Ut.compareFunction]);if(e.has("EXT_texture_filter_anisotropic")===!0){if(Ut.magFilter===oe)return;if(Ut.minFilter!==je&&Ut.minFilter!==ee)return;if(Ut.type===Xs&&e.has("OES_texture_float_linear")===!1)return;if(Ut.anisotropy>1||s.get(Ut).__currentAnisotropy){let on=e.get("EXT_texture_filter_anisotropic");t.texParameterf(Me,on.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(Ut.anisotropy,r.getMaxAnisotropy())),s.get(Ut).__currentAnisotropy=Ut.anisotropy}}}function hi(Me,Ut){let on=!1;if(Me.__webglInit===void 0)Me.__webglInit=!0,Ut.addEventListener("dispose",he),re(Ut);let bn=Ut.source,Mn=V.get(bn);if(Mn===void 0)Mn={},V.set(bn,Mn);let Cn=An(Ut);if(Cn!==Me.__cacheKey){if(Mn[Cn]===void 0)Mn[Cn]={texture:t.createTexture(),usedTimes:0},u.memory.textures++,on=!0;Mn[Cn].usedTimes++;let Ln=Mn[Me.__cacheKey];if(Ln!==void 0){if(Mn[Me.__cacheKey].usedTimes--,Ln.usedTimes===0)rn(Ut)}Me.__cacheKey=Cn,Me.__webglTexture=Mn[Cn].texture}return on}function Pi(Me,Ut,on){return Math.floor(Math.floor(Me/on)/Ut)}function Ni(Me,Ut,on,bn){let Cn=Me.updateRanges;if(Cn.length===0)i.texSubImage2D(t.TEXTURE_2D,0,0,0,Ut.width,Ut.height,on,bn,Ut.data);else{Cn.sort((Ne,xn)=>Ne.start-xn.start);let Ln=0;for(let Ne=1;Ne<Cn.length;Ne++){let xn=Cn[Ln],gn=Cn[Ne],En=xn.start+xn.count,Rn=Pi(gn.start,Ut.width,4),Dn=Pi(xn.start,Ut.width,4);if(gn.start<=En+1&&Rn===Dn&&Pi(gn.start+gn.count-1,Ut.width,4)===Rn)xn.count=Math.max(xn.count,gn.start+gn.count-xn.start);else++Ln,Cn[Ln]=gn}Cn.length=Ln+1;let pn=i.getParameter(t.UNPACK_ROW_LENGTH),yn=i.getParameter(t.UNPACK_SKIP_PIXELS),In=i.getParameter(t.UNPACK_SKIP_ROWS);i.pixelStorei(t.UNPACK_ROW_LENGTH,Ut.width);for(let Ne=0,xn=Cn.length;Ne<xn;Ne++){let gn=Cn[Ne],En=Math.floor(gn.start/4),Rn=Math.ceil(gn.count/4),Dn=En%Ut.width,Zn=Math.floor(En/Ut.width),qn=Rn,Fn=1;i.pixelStorei(t.UNPACK_SKIP_PIXELS,Dn),i.pixelStorei(t.UNPACK_SKIP_ROWS,Zn),i.texSubImage2D(t.TEXTURE_2D,0,Dn,Zn,qn,1,on,bn,Ut.data)}Me.clearUpdateRanges(),i.pixelStorei(t.UNPACK_ROW_LENGTH,pn),i.pixelStorei(t.UNPACK_SKIP_PIXELS,yn),i.pixelStorei(t.UNPACK_SKIP_ROWS,In)}}function os(Me,Ut,on){let bn=t.TEXTURE_2D;if(Ut.isDataArrayTexture||Ut.isCompressedArrayTexture)bn=t.TEXTURE_2D_ARRAY;if(Ut.isData3DTexture)bn=t.TEXTURE_3D;let Mn=hi(Me,Ut),Cn=Ut.source;i.bindTexture(bn,Me.__webglTexture,t.TEXTURE0+on);let Ln=s.get(Cn);if(Cn.version!==Ln.__version||Mn===!0){if(i.activeTexture(t.TEXTURE0+on),(typeof ImageBitmap<"u"&&Ut.image instanceof ImageBitmap)===!1){let Fn=y.getPrimaries(y.workingColorSpace),$n=Ut.colorSpace===Ee?null:y.getPrimaries(Ut.colorSpace),ri=Ut.colorSpace===Ee||Fn===$n?t.NONE:t.BROWSER_DEFAULT_WEBGL;i.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,Ut.flipY),i.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Ut.premultiplyAlpha),i.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,ri)}i.pixelStorei(t.UNPACK_ALIGNMENT,Ut.unpackAlignment);let yn=ft(Ut.image,!1,r.maxTextureSize);yn=ni(Ut,yn);let In=a.convert(Ut.format,Ut.colorSpace),Ne=a.convert(Ut.type),xn=se(Ut.internalFormat,In,Ne,Ut.normalized,Ut.colorSpace,Ut.isVideoTexture);xi(bn,Ut);let gn,En=Ut.mipmaps,Rn=Ut.isVideoTexture!==!0,Dn=Ln.__version===void 0||Mn===!0,Zn=Cn.dataReady,qn=Rt(Ut,yn);if(Ut.isDepthTexture){if(xn=nt(Ut.format===er,Ut.type),Dn)if(Rn)i.texStorage2D(t.TEXTURE_2D,1,xn,yn.width,yn.height);else i.texImage2D(t.TEXTURE_2D,0,xn,yn.width,yn.height,0,In,Ne,null)}else if(Ut.isDataTexture)if(En.length>0){if(Rn&&Dn)i.texStorage2D(t.TEXTURE_2D,qn,xn,En[0].width,En[0].height);for(let Fn=0,$n=En.length;Fn<$n;Fn++)if(gn=En[Fn],Rn){if(Zn)i.texSubImage2D(t.TEXTURE_2D,Fn,0,0,gn.width,gn.height,In,Ne,gn.data)}else i.texImage2D(t.TEXTURE_2D,Fn,xn,gn.width,gn.height,0,In,Ne,gn.data);Ut.generateMipmaps=!1}else if(Rn){if(Dn)i.texStorage2D(t.TEXTURE_2D,qn,xn,yn.width,yn.height);if(Zn)Ni(Ut,yn,In,Ne)}else i.texImage2D(t.TEXTURE_2D,0,xn,yn.width,yn.height,0,In,Ne,yn.data);else if(Ut.isCompressedTexture)if(Ut.isCompressedArrayTexture){if(Rn&&Dn)i.texStorage3D(t.TEXTURE_2D_ARRAY,qn,xn,En[0].width,En[0].height,yn.depth);for(let Fn=0,$n=En.length;Fn<$n;Fn++)if(gn=En[Fn],Ut.format!==q)if(In!==null)if(Rn){if(Zn)if(Ut.layerUpdates.size>0){let ri=fh(gn.width,gn.height,Ut.format,Ut.type);for(let On of Ut.layerUpdates){let vi=gn.data.subarray(On*ri/gn.data.BYTES_PER_ELEMENT,(On+1)*ri/gn.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Fn,0,0,On,gn.width,gn.height,1,In,vi)}}else i.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Fn,0,0,0,gn.width,gn.height,yn.depth,In,gn.data)}else i.compressedTexImage3D(t.TEXTURE_2D_ARRAY,Fn,xn,gn.width,gn.height,yn.depth,0,gn.data,0,0);else Yn("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(Rn){if(Zn)i.texSubImage3D(t.TEXTURE_2D_ARRAY,Fn,0,0,0,gn.width,gn.height,yn.depth,In,Ne,gn.data)}else i.texImage3D(t.TEXTURE_2D_ARRAY,Fn,xn,gn.width,gn.height,yn.depth,0,In,Ne,gn.data);if(Ut.layerUpdates.size>0)Ut.clearLayerUpdates()}else{if(Rn&&Dn)i.texStorage2D(t.TEXTURE_2D,qn,xn,En[0].width,En[0].height);for(let Fn=0,$n=En.length;Fn<$n;Fn++)if(gn=En[Fn],Ut.format!==q)if(In!==null)if(Rn){if(Zn)i.compressedTexSubImage2D(t.TEXTURE_2D,Fn,0,0,gn.width,gn.height,In,gn.data)}else i.compressedTexImage2D(t.TEXTURE_2D,Fn,xn,gn.width,gn.height,0,gn.data);else Yn("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(Rn){if(Zn)i.texSubImage2D(t.TEXTURE_2D,Fn,0,0,gn.width,gn.height,In,Ne,gn.data)}else i.texImage2D(t.TEXTURE_2D,Fn,xn,gn.width,gn.height,0,In,Ne,gn.data)}else if(Ut.isDataArrayTexture)if(Rn){if(Dn)i.texStorage3D(t.TEXTURE_2D_ARRAY,qn,xn,yn.width,yn.height,yn.depth);if(Zn)if(Ut.layerUpdates.size>0){let Fn=fh(yn.width,yn.height,Ut.format,Ut.type);for(let $n of Ut.layerUpdates){let ri=yn.data.subarray($n*Fn/yn.data.BYTES_PER_ELEMENT,($n+1)*Fn/yn.data.BYTES_PER_ELEMENT);i.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,$n,yn.width,yn.height,1,In,Ne,ri)}Ut.clearLayerUpdates()}else i.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,yn.width,yn.height,yn.depth,In,Ne,yn.data)}else i.texImage3D(t.TEXTURE_2D_ARRAY,0,xn,yn.width,yn.height,yn.depth,0,In,Ne,yn.data);else if(Ut.isData3DTexture)if(Rn){if(Dn)i.texStorage3D(t.TEXTURE_3D,qn,xn,yn.width,yn.height,yn.depth);if(Zn)i.texSubImage3D(t.TEXTURE_3D,0,0,0,0,yn.width,yn.height,yn.depth,In,Ne,yn.data)}else i.texImage3D(t.TEXTURE_3D,0,xn,yn.width,yn.height,yn.depth,0,In,Ne,yn.data);else if(Ut.isFramebufferTexture){if(Dn)if(Rn)i.texStorage2D(t.TEXTURE_2D,qn,xn,yn.width,yn.height);else{let Fn=yn.width,$n=yn.height;for(let ri=0;ri<qn;ri++)i.texImage2D(t.TEXTURE_2D,ri,xn,Fn,$n,0,In,Ne,null),Fn>>=1,$n>>=1}}else if(Ut.isHTMLTexture){if("texElementImage2D"in t){let Fn=t.canvas;if(!Fn.hasAttribute("layoutsubtree"))Fn.setAttribute("layoutsubtree","true");if(yn.parentNode!==Fn){Fn.appendChild(yn),D.add(Ut),Fn.onpaint=($n)=>{let ri=$n.changedElements;for(let On of D)if(ri.includes(On.image))On.needsUpdate=!0},Fn.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,yn);else{let{RGBA:ri,RGBA:On,UNSIGNED_BYTE:vi}=t;t.texElementImage2D(t.TEXTURE_2D,0,ri,On,vi,yn)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(En.length>0){if(Rn&&Dn){let Fn=Zi(En[0]);i.texStorage2D(t.TEXTURE_2D,qn,xn,Fn.width,Fn.height)}for(let Fn=0,$n=En.length;Fn<$n;Fn++)if(gn=En[Fn],Rn){if(Zn)i.texSubImage2D(t.TEXTURE_2D,Fn,0,0,In,Ne,gn)}else i.texImage2D(t.TEXTURE_2D,Fn,xn,In,Ne,gn);Ut.generateMipmaps=!1}else if(Rn){if(Dn){let Fn=Zi(yn);i.texStorage2D(t.TEXTURE_2D,qn,xn,Fn.width,Fn.height)}if(Zn)i.texSubImage2D(t.TEXTURE_2D,0,0,0,In,Ne,yn)}else i.texImage2D(t.TEXTURE_2D,0,xn,In,Ne,yn);if(Pt(Ut)&&Ut.mipmapsAutoUpdate===!0)pt(bn);if(Ln.__version=Cn.version,Ut.onUpdate)Ut.onUpdate(Ut)}Me.__version=Ut.version}function hs(Me,Ut,on){if(Ut.image.length!==6)return;let bn=hi(Me,Ut),Mn=Ut.source;i.bindTexture(t.TEXTURE_CUBE_MAP,Me.__webglTexture,t.TEXTURE0+on);let Cn=s.get(Mn);if(Mn.version!==Cn.__version||bn===!0){i.activeTexture(t.TEXTURE0+on);let Ln=y.getPrimaries(y.workingColorSpace),pn=Ut.colorSpace===Ee?null:y.getPrimaries(Ut.colorSpace),yn=Ut.colorSpace===Ee||Ln===pn?t.NONE:t.BROWSER_DEFAULT_WEBGL;i.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,Ut.flipY),i.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Ut.premultiplyAlpha),i.pixelStorei(t.UNPACK_ALIGNMENT,Ut.unpackAlignment),i.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,yn);let In=Ut.isCompressedTexture||Ut.image[0].isCompressedTexture,Ne=Ut.image[0]&&Ut.image[0].isDataTexture,xn=[];for(let On=0;On<6;On++){if(!In&&!Ne)xn[On]=ft(Ut.image[On],!0,r.maxCubemapSize);else xn[On]=Ne?Ut.image[On].image:Ut.image[On];xn[On]=ni(Ut,xn[On])}let gn=xn[0],En=a.convert(Ut.format,Ut.colorSpace),Rn=a.convert(Ut.type),Dn=se(Ut.internalFormat,En,Rn,Ut.normalized,Ut.colorSpace),Zn=Ut.isVideoTexture!==!0,qn=Cn.__version===void 0||bn===!0,Fn=Mn.dataReady,$n=Rt(Ut,gn);xi(t.TEXTURE_CUBE_MAP,Ut);let ri;if(Ut.isDepthTexture){if(Dn=nt(Ut.format===er,Ut.type),qn)if(Zn)i.texStorage2D(t.TEXTURE_CUBE_MAP,1,Dn,gn.width,gn.height);else for(let On=0;On<6;On++)i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,0,Dn,gn.width,gn.height,0,En,Rn,null)}else if(In){if(Zn&&qn)i.texStorage2D(t.TEXTURE_CUBE_MAP,$n,Dn,gn.width,gn.height);for(let On=0;On<6;On++){ri=xn[On].mipmaps;for(let vi=0;vi<ri.length;vi++){let ki=ri[vi];if(Ut.format!==q)if(En!==null)if(Zn){if(Fn)i.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi,0,0,ki.width,ki.height,En,ki.data)}else i.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi,Dn,ki.width,ki.height,0,ki.data);else Yn("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Zn){if(Fn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi,0,0,ki.width,ki.height,En,Rn,ki.data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi,Dn,ki.width,ki.height,0,En,Rn,ki.data)}}}else{if(ri=Ut.mipmaps,Zn&&qn){if(ri.length>0)$n++;let On=Zi(xn[0]);i.texStorage2D(t.TEXTURE_CUBE_MAP,$n,Dn,On.width,On.height)}for(let On=0;On<6;On++)if(Ne){if(Zn){if(Fn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,0,0,0,xn[On].width,xn[On].height,En,Rn,xn[On].data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,0,Dn,xn[On].width,xn[On].height,0,En,Rn,xn[On].data);for(let vi=0;vi<ri.length;vi++){let Fs=ri[vi].image[On].image;if(Zn){if(Fn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi+1,0,0,Fs.width,Fs.height,En,Rn,Fs.data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi+1,Dn,Fs.width,Fs.height,0,En,Rn,Fs.data)}}else{if(Zn){if(Fn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,0,0,0,En,Rn,xn[On])}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,0,Dn,En,Rn,xn[On]);for(let vi=0;vi<ri.length;vi++){let ki=ri[vi];if(Zn){if(Fn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi+1,0,0,En,Rn,ki.image[On])}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+On,vi+1,Dn,En,Rn,ki.image[On])}}}if(Pt(Ut)&&Ut.mipmapsAutoUpdate===!0)pt(t.TEXTURE_CUBE_MAP);if(Cn.__version=Mn.version,Ut.onUpdate)Ut.onUpdate(Ut)}Me.__version=Ut.version}function Di(Me,Ut,on,bn,Mn,Cn){let Ln=a.convert(on.format,on.colorSpace),pn=a.convert(on.type),yn=se(on.internalFormat,Ln,pn,on.normalized,on.colorSpace),In=s.get(Ut),Ne=s.get(on);if(Ne.__renderTarget=Ut,!In.__hasExternalTextures){let xn=Math.max(1,Ut.width>>Cn),gn=Math.max(1,Ut.height>>Cn);if(Mn===t.TEXTURE_3D||Mn===t.TEXTURE_2D_ARRAY)i.texImage3D(Mn,Cn,yn,xn,gn,Ut.depth,0,Ln,pn,null);else i.texImage2D(Mn,Cn,yn,xn,gn,0,Ln,pn,null)}if(i.bindFramebuffer(t.FRAMEBUFFER,Me),wi(Ut))f.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,bn,Mn,Ne.__webglTexture,0,Un(Ut));else if(Mn===t.TEXTURE_2D||Mn>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&Mn<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)t.framebufferTexture2D(t.FRAMEBUFFER,bn,Mn,Ne.__webglTexture,Cn);i.bindFramebuffer(t.FRAMEBUFFER,null)}function Yi(Me,Ut,on){if(t.bindRenderbuffer(t.RENDERBUFFER,Me),Ut.depthBuffer){let bn=Ut.depthTexture,Mn=bn&&bn.isDepthTexture?bn.type:null,Cn=nt(Ut.stencilBuffer,Mn),Ln=Ut.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(wi(Ut))f.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Un(Ut),Cn,Ut.width,Ut.height);else if(on)t.renderbufferStorageMultisample(t.RENDERBUFFER,Un(Ut),Cn,Ut.width,Ut.height);else t.renderbufferStorage(t.RENDERBUFFER,Cn,Ut.width,Ut.height);t.framebufferRenderbuffer(t.FRAMEBUFFER,Ln,t.RENDERBUFFER,Me)}else{let bn=Ut.textures;for(let Mn=0;Mn<bn.length;Mn++){let Cn=bn[Mn],Ln=a.convert(Cn.format,Cn.colorSpace),pn=a.convert(Cn.type),yn=se(Cn.internalFormat,Ln,pn,Cn.normalized,Cn.colorSpace);if(wi(Ut))f.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,Un(Ut),yn,Ut.width,Ut.height);else if(on)t.renderbufferStorageMultisample(t.RENDERBUFFER,Un(Ut),yn,Ut.width,Ut.height);else t.renderbufferStorage(t.RENDERBUFFER,yn,Ut.width,Ut.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function as(Me,Ut,on){let bn=Ut.isWebGLCubeRenderTarget===!0;if(i.bindFramebuffer(t.FRAMEBUFFER,Me),!(Ut.depthTexture&&Ut.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Mn=s.get(Ut.depthTexture);Mn.__renderTarget=Ut;let Cn=bn?Ut.depthTexture.image[0]:Ut.depthTexture.image;if(!Mn.__webglTexture||Cn.width!==Ut.width||Cn.height!==Ut.height)Cn.width=Ut.width,Cn.height=Ut.height,Ut.depthTexture.needsUpdate=!0;if(bn)kn(Ut.depthTexture,0);else zn(Ut.depthTexture,0);let Ln=Mn.__webglTexture,pn=Un(Ut),yn=bn?t.TEXTURE_CUBE_MAP_POSITIVE_X+on:t.TEXTURE_2D,In=Ut.depthTexture.format===er?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(Ut.depthTexture.format===Jr)if(wi(Ut))f.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,In,yn,Ln,0,pn);else t.framebufferTexture2D(t.FRAMEBUFFER,In,yn,Ln,0);else if(Ut.depthTexture.format===er)if(wi(Ut))f.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,In,yn,Ln,0,pn);else t.framebufferTexture2D(t.FRAMEBUFFER,In,yn,Ln,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ls(Me){let Ut=s.get(Me),on=Me.isWebGLCubeRenderTarget===!0;if(Ut.__boundDepthTexture!==Me.depthTexture){let bn=Me.depthTexture;if(Ut.__depthDisposeCallback)Ut.__depthDisposeCallback();if(bn){let Mn=()=>{delete Ut.__boundDepthTexture,delete Ut.__depthDisposeCallback,bn.removeEventListener("dispose",Mn)};bn.addEventListener("dispose",Mn),Ut.__depthDisposeCallback=Mn}Ut.__boundDepthTexture=bn}if(Me.depthTexture&&!Ut.__autoAllocateDepthBuffer)if(on)for(let bn=0;bn<6;bn++)as(Ut.__webglFramebuffer[bn],Me,bn);else if(Me.texture.mipmaps.length>0)as(Ut.__webglFramebuffer[0],Me,0);else as(Ut.__webglFramebuffer,Me,0);else if(on){Ut.__webglDepthbuffer=[];for(let bn=0;bn<6;bn++)if(i.bindFramebuffer(t.FRAMEBUFFER,Ut.__webglFramebuffer[bn]),Ut.__webglDepthbuffer[bn]===void 0)Ut.__webglDepthbuffer[bn]=t.createRenderbuffer(),Yi(Ut.__webglDepthbuffer[bn],Me,!1);else{let Mn=Me.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Cn=Ut.__webglDepthbuffer[bn];t.bindRenderbuffer(t.RENDERBUFFER,Cn),t.framebufferRenderbuffer(t.FRAMEBUFFER,Mn,t.RENDERBUFFER,Cn)}}else{if(Me.texture.mipmaps.length>0)i.bindFramebuffer(t.FRAMEBUFFER,Ut.__webglFramebuffer[0]);else i.bindFramebuffer(t.FRAMEBUFFER,Ut.__webglFramebuffer);if(Ut.__webglDepthbuffer===void 0)Ut.__webglDepthbuffer=t.createRenderbuffer(),Yi(Ut.__webglDepthbuffer,Me,!1);else{let Mn=Me.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Cn=Ut.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,Cn),t.framebufferRenderbuffer(t.FRAMEBUFFER,Mn,t.RENDERBUFFER,Cn)}}i.bindFramebuffer(t.FRAMEBUFFER,null)}function _s(Me,Ut,on){let bn=s.get(Me);if(Ut!==void 0)Di(bn.__webglFramebuffer,Me,Me.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0);if(on!==void 0)ls(Me)}function Ke(Me){let Ut=Me.texture,on=s.get(Me),bn=s.get(Ut);Me.addEventListener("dispose",Pe),re(Me);let Mn=Me.textures,Cn=Me.isWebGLCubeRenderTarget===!0,Ln=Mn.length>1;if(!Ln){if(bn.__webglTexture===void 0)bn.__webglTexture=t.createTexture();bn.__version=Ut.version,u.memory.textures++}if(Cn){on.__webglFramebuffer=[];for(let pn=0;pn<6;pn++)if(Ut.mipmaps.length>0){on.__webglFramebuffer[pn]=[];for(let yn=0;yn<Ut.mipmaps.length;yn++)on.__webglFramebuffer[pn][yn]=t.createFramebuffer()}else on.__webglFramebuffer[pn]=t.createFramebuffer()}else{if(Ut.mipmaps.length>0){on.__webglFramebuffer=[];for(let pn=0;pn<Ut.mipmaps.length;pn++)on.__webglFramebuffer[pn]=t.createFramebuffer()}else on.__webglFramebuffer=t.createFramebuffer();if(Ln)for(let pn=0,yn=Mn.length;pn<yn;pn++){let In=s.get(Mn[pn]);if(In.__webglTexture===void 0)In.__webglTexture=t.createTexture(),u.memory.textures++}if(Me.samples>0&&wi(Me)===!1){on.__webglMultisampledFramebuffer=t.createFramebuffer(),on.__webglColorRenderbuffer=[],i.bindFramebuffer(t.FRAMEBUFFER,on.__webglMultisampledFramebuffer);for(let pn=0;pn<Mn.length;pn++){let yn=Mn[pn];on.__webglColorRenderbuffer[pn]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,on.__webglColorRenderbuffer[pn]);let In=a.convert(yn.format,yn.colorSpace),Ne=a.convert(yn.type),xn=se(yn.internalFormat,In,Ne,yn.normalized,yn.colorSpace,Me.isXRRenderTarget===!0),gn=Un(Me);t.renderbufferStorageMultisample(t.RENDERBUFFER,gn,xn,Me.width,Me.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+pn,t.RENDERBUFFER,on.__webglColorRenderbuffer[pn])}if(t.bindRenderbuffer(t.RENDERBUFFER,null),Me.depthBuffer)on.__webglDepthRenderbuffer=t.createRenderbuffer(),Yi(on.__webglDepthRenderbuffer,Me,!0);i.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Cn){i.bindTexture(t.TEXTURE_CUBE_MAP,bn.__webglTexture),xi(t.TEXTURE_CUBE_MAP,Ut);for(let pn=0;pn<6;pn++)if(Ut.mipmaps.length>0)for(let yn=0;yn<Ut.mipmaps.length;yn++)Di(on.__webglFramebuffer[pn][yn],Me,Ut,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+pn,yn);else Di(on.__webglFramebuffer[pn],Me,Ut,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+pn,0);if(Pt(Ut))pt(t.TEXTURE_CUBE_MAP);else if(Ut.mipmaps.length>0)t.texParameteri(t.TEXTURE_CUBE_MAP,t.TEXTURE_MAX_LEVEL,Ut.mipmaps.length-1);i.unbindTexture()}else if(Ln){for(let pn=0,yn=Mn.length;pn<yn;pn++){let In=Mn[pn],Ne=s.get(In),xn=t.TEXTURE_2D;if(Me.isWebGL3DRenderTarget||Me.isWebGLArrayRenderTarget)xn=Me.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(i.bindTexture(xn,Ne.__webglTexture),xi(xn,In),Di(on.__webglFramebuffer,Me,In,t.COLOR_ATTACHMENT0+pn,xn,0),Pt(In))pt(xn)}i.unbindTexture()}else{let pn=t.TEXTURE_2D;if(Me.isWebGL3DRenderTarget||Me.isWebGLArrayRenderTarget)pn=Me.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(i.bindTexture(pn,bn.__webglTexture),xi(pn,Ut),Ut.mipmaps.length>0)for(let yn=0;yn<Ut.mipmaps.length;yn++)Di(on.__webglFramebuffer[yn],Me,Ut,t.COLOR_ATTACHMENT0,pn,yn);else Di(on.__webglFramebuffer,Me,Ut,t.COLOR_ATTACHMENT0,pn,0);if(Pt(Ut))pt(pn);else if(Ut.mipmaps.length>0)t.texParameteri(pn,t.TEXTURE_MAX_LEVEL,Ut.mipmaps.length-1);i.unbindTexture()}if(Me.depthBuffer)ls(Me)}function xs(Me){let Ut=Me.textures;for(let on=0,bn=Ut.length;on<bn;on++){let Mn=Ut[on];if(Pt(Mn)&&Mn.mipmapsAutoUpdate===!0){let Cn=Nt(Me),Ln=s.get(Mn).__webglTexture;i.bindTexture(Cn,Ln),pt(Cn),i.unbindTexture()}}}let yi=[];function Gi(Me){if(Me.samples>0){if(wi(Me)===!1){let{textures:Ut,width:on,height:bn}=Me,Mn=t.COLOR_BUFFER_BIT,Cn=Me.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Ln=s.get(Me),pn=Ut.length>1;if(pn)for(let In=0;In<Ut.length;In++)i.bindFramebuffer(t.FRAMEBUFFER,Ln.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+In,t.RENDERBUFFER,null),i.bindFramebuffer(t.FRAMEBUFFER,Ln.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+In,t.TEXTURE_2D,null,0);if(i.bindFramebuffer(t.READ_FRAMEBUFFER,Ln.__webglMultisampledFramebuffer),Me.texture.mipmaps.length>0)i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ln.__webglFramebuffer[0]);else i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ln.__webglFramebuffer);for(let In=0;In<Ut.length;In++){if(Me.resolveDepthBuffer){if(Me.depthBuffer)Mn|=t.DEPTH_BUFFER_BIT;if(Me.stencilBuffer&&Me.resolveStencilBuffer)Mn|=t.STENCIL_BUFFER_BIT}if(pn){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Ln.__webglColorRenderbuffer[In]);let Ne=s.get(Ut[In]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Ne,0)}if(t.blitFramebuffer(0,0,on,bn,0,0,on,bn,Mn,t.NEAREST),x===!0){if(yi.length=0,yi.push(t.COLOR_ATTACHMENT0+In),Me.depthBuffer&&Me.storeMultisampledDepthBuffer===!1)yi.push(Cn);t.invalidateFramebuffer(t.READ_FRAMEBUFFER,yi)}}if(i.bindFramebuffer(t.READ_FRAMEBUFFER,null),i.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),pn)for(let In=0;In<Ut.length;In++){i.bindFramebuffer(t.FRAMEBUFFER,Ln.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+In,t.RENDERBUFFER,Ln.__webglColorRenderbuffer[In]);let Ne=s.get(Ut[In]).__webglTexture;i.bindFramebuffer(t.FRAMEBUFFER,Ln.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+In,t.TEXTURE_2D,Ne,0)}i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Ln.__webglMultisampledFramebuffer)}else if(Me.depthBuffer&&Me.storeMultisampledDepthBuffer===!1&&x){let Ut=Me.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[Ut])}}}function Un(Me){return Math.min(r.maxSamples,Me.samples)}function wi(Me){let Ut=s.get(Me);return Me.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&Ut.__useRenderToTexture!==!1}function Qn(Me){let Ut=u.render.frame;if(L.get(Me)!==Ut)L.set(Me,Ut),Me.update()}function ni(Me,Ut){let{colorSpace:on,format:bn,type:Mn}=Me;if(Me.isCompressedTexture===!0||Me.isVideoTexture===!0)return Ut;if(on!==J&&on!==Ee)if(y.getTransfer(on)===Ti){if(bn!==q||Mn!==Ts)Yn("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else jn("WebGLTextures: Unsupported texture color space:",on);return Ut}function Zi(Me){if(typeof HTMLImageElement<"u"&&Me instanceof HTMLImageElement)A.width=Me.naturalWidth||Me.width,A.height=Me.naturalHeight||Me.height;else if(typeof VideoFrame<"u"&&Me instanceof VideoFrame)A.width=Me.displayWidth,A.height=Me.displayHeight;else A.width=Me.width,A.height=Me.height;return A}this.allocateTextureUnit=vn,this.resetTextureUnits=Sn,this.getTextureUnits=Tn,this.setTextureUnits=Gn,this.setTexture2D=zn,this.setTexture2DArray=Jn,this.setTexture3D=Kn,this.setTextureCube=kn,this.rebindTextures=_s,this.setupRenderTarget=Ke,this.updateRenderTargetMipmap=xs,this.updateMultisampleRenderTarget=Gi,this.setupDepthRenderbuffer=ls,this.setupFrameBufferTexture=Di,this.useMultisampledRTT=wi,this.dispose=sn}function my(t,e){function i(s,r=Ee){let a,u=y.getTransfer(r);if(s===Ts)return t.UNSIGNED_BYTE;if(s===ac)return t.UNSIGNED_SHORT_4_4_4_4;if(s===lc)return t.UNSIGNED_SHORT_5_5_5_1;if(s===Mf)return t.UNSIGNED_INT_5_9_9_9_REV;if(s===bf)return t.UNSIGNED_INT_10F_11F_11F_REV;if(s===vf)return t.BYTE;if(s===Sf)return t.SHORT;if(s===Co)return t.UNSIGNED_SHORT;if(s===oc)return t.INT;if(s===tr)return t.UNSIGNED_INT;if(s===Xs)return t.FLOAT;if(s===te)return t.HALF_FLOAT;if(s===Tf)return t.ALPHA;if(s===Af)return t.RGB;if(s===q)return t.RGBA;if(s===Jr)return t.DEPTH_COMPONENT;if(s===er)return t.DEPTH_STENCIL;if(s===Dt)return t.RED;if(s===cc)return t.RED_INTEGER;if(s===Mr)return t.RG;if(s===hc)return t.RG_INTEGER;if(s===uc)return t.RGBA_INTEGER;if(s===ot||s===Ia||s===at||s===lt)if(u===Ti)if(a=e.get("WEBGL_compressed_texture_s3tc_srgb"),a!==null){if(s===ot)return a.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Ia)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===at)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===lt)return a.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(a=e.get("WEBGL_compressed_texture_s3tc"),a!==null){if(s===ot)return a.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Ia)return a.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===at)return a.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===lt)return a.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===fc||s===dc||s===pc||s===mc)if(a=e.get("WEBGL_compressed_texture_pvrtc"),a!==null){if(s===fc)return a.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===dc)return a.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===pc)return a.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===mc)return a.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===vt||s===gc||s===_c||s===xc||s===yc||s===Pa||s===vc)if(a=e.get("WEBGL_compressed_texture_etc"),a!==null){if(s===vt||s===gc)return u===Ti?a.COMPRESSED_SRGB8_ETC2:a.COMPRESSED_RGB8_ETC2;if(s===_c)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:a.COMPRESSED_RGBA8_ETC2_EAC;if(s===xc)return a.COMPRESSED_R11_EAC;if(s===yc)return a.COMPRESSED_SIGNED_R11_EAC;if(s===Pa)return a.COMPRESSED_RG11_EAC;if(s===vc)return a.COMPRESSED_SIGNED_RG11_EAC}else return null;if(s===Sc||s===Mc||s===bc||s===Tc||s===Ac||s===Ec||s===wc||s===Rc||s===Cc||s===Ic||s===Pc||s===Lc||s===Nc||s===Dc)if(a=e.get("WEBGL_compressed_texture_astc"),a!==null){if(s===Sc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:a.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===Mc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:a.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===bc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:a.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===Tc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:a.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===Ac)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:a.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Ec)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:a.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===wc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:a.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===Rc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:a.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Cc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:a.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Ic)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:a.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Pc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:a.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Lc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:a.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Nc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:a.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Dc)return u===Ti?a.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:a.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===yt||s===bt||s===xt)if(a=e.get("EXT_texture_compression_bptc"),a!==null){if(s===yt)return u===Ti?a.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:a.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===bt)return a.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===xt)return a.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Uc||s===Fc||s===La||s===Oc)if(a=e.get("EXT_texture_compression_rgtc"),a!==null){if(s===Uc)return a.COMPRESSED_RED_RGTC1_EXT;if(s===Fc)return a.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===La)return a.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Oc)return a.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(s===Sr)return t.UNSIGNED_INT_24_8;return t[s]!==void 0?t[s]:null}return{convert:i}}var gy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,_y=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Rd{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Ga(t.texture);if(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)this.depthNear=t.depthNear,this.depthFar=t.depthFar;this.texture=i}}getMesh(t){if(this.texture!==null){if(this.mesh===null){let e=t.cameras[0].viewport,i=new le({vertexShader:gy,fragmentShader:_y,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new h(new Do(20,20),i)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Cd extends Ps{constructor(t,e){super();let i=this,s=null,r=1,a=null,u="local-floor",f=1,x=null,A=null,L=null,D=null,R=null,V=null,rt=typeof XRWebGLBinding<"u",Ct=new Rd,j={},it=e.getContextAttributes(),ft=null,Pt=null,pt=[],Nt=[],se=new l,nt=null,Rt=null,re=new U;re.viewport=new b;let be=new U;be.viewport=new b;let he=[re,be],Pe=new ch,$e=null,fe=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(vn){let An=pt[vn];if(An===void 0)An=new Lo,pt[vn]=An;return An.getTargetRaySpace()},this.getControllerGrip=function(vn){let An=pt[vn];if(An===void 0)An=new Lo,pt[vn]=An;return An.getGripSpace()},this.getHand=function(vn){let An=pt[vn];if(An===void 0)An=new Lo,pt[vn]=An;return An.getHandSpace()};function sn(vn){let An=Nt.indexOf(vn.inputSource);if(An===-1)return;let zn=pt[An];if(zn!==void 0)zn.update(vn.inputSource,vn.frame,x||a),zn.dispatchEvent({type:vn.type,data:vn.inputSource})}function un(){s.removeEventListener("select",sn),s.removeEventListener("selectstart",sn),s.removeEventListener("selectend",sn),s.removeEventListener("squeeze",sn),s.removeEventListener("squeezestart",sn),s.removeEventListener("squeezeend",sn),s.removeEventListener("end",un),s.removeEventListener("inputsourceschange",rn);for(let vn=0;vn<pt.length;vn++){let An=Nt[vn];if(An===null)continue;Nt[vn]=null,pt[vn].disconnect(An)}$e=null,fe=null,Ct.reset();for(let vn in j)delete j[vn];if(t.setRenderTarget(ft),R=null,D=null,L=null,s=null,Pt=null,Gn.stop(),i.isPresenting=!1,t.setPixelRatio(nt),t.setSize(se.width,se.height,!1),Rt!==null){let vn=Rt.camera;vn.fov=Rt.fov,vn.zoom=Rt.zoom,vn.updateProjectionMatrix(),Rt=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(vn){if(r=vn,i.isPresenting===!0)Yn("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(vn){if(u=vn,i.isPresenting===!0)Yn("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return x||a},this.setReferenceSpace=function(vn){x=vn},this.getBaseLayer=function(){return D!==null?D:R},this.getBinding=function(){if(L===null&&rt)L=new XRWebGLBinding(s,e);return L},this.getFrame=function(){return V},this.getSession=function(){return s},this.setSession=async function(vn){if(s=vn,s!==null){if(ft=t.getRenderTarget(),s.addEventListener("select",sn),s.addEventListener("selectstart",sn),s.addEventListener("selectend",sn),s.addEventListener("squeeze",sn),s.addEventListener("squeezestart",sn),s.addEventListener("squeezeend",sn),s.addEventListener("end",un),s.addEventListener("inputsourceschange",rn),it.xrCompatible!==!0)await e.makeXRCompatible();if(nt=t.getPixelRatio(),t.getSize(se),!(rt&&("createProjectionLayer"in XRWebGLBinding.prototype))){let zn={antialias:it.antialias,alpha:!0,depth:it.depth,stencil:it.stencil,framebufferScaleFactor:r};R=new XRWebGLLayer(s,e,zn),s.updateRenderState({baseLayer:R}),t.setPixelRatio(1),t.setSize(R.framebufferWidth,R.framebufferHeight,!1),Pt=new ne(R.framebufferWidth,R.framebufferHeight,{format:q,type:Ts,colorSpace:t.outputColorSpace,stencilBuffer:it.stencil,resolveDepthBuffer:R.ignoreDepthValues===!1,resolveStencilBuffer:R.ignoreDepthValues===!1,storeMultisampledDepthBuffer:R.ignoreDepthValues===!1,storeMultisampledStencilBuffer:R.ignoreDepthValues===!1})}else{let zn=null,Jn=null,Kn=null;if(it.depth)Kn=it.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,zn=it.stencil?er:Jr,Jn=it.stencil?Sr:tr;let kn={colorFormat:e.RGBA8,depthFormat:Kn,scaleFactor:r};L=this.getBinding(),D=L.createProjectionLayer(kn),s.updateRenderState({layers:[D]}),t.setPixelRatio(1),t.setSize(D.textureWidth,D.textureHeight,!1),Pt=new ne(D.textureWidth,D.textureHeight,{format:q,type:Ts,depthTexture:new nr(D.textureWidth,D.textureHeight,Jn,void 0,void 0,void 0,void 0,void 0,void 0,zn),stencilBuffer:it.stencil,colorSpace:t.outputColorSpace,samples:it.antialias?4:0,resolveDepthBuffer:D.ignoreDepthValues===!1,resolveStencilBuffer:D.ignoreDepthValues===!1,storeMultisampledDepthBuffer:D.ignoreDepthValues===!1,storeMultisampledStencilBuffer:D.ignoreDepthValues===!1})}Pt.isXRRenderTarget=!0,this.setFoveation(f),x=null,a=await s.requestReferenceSpace(u),Gn.setContext(s),Gn.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return Ct.getDepthTexture()};function rn(vn){for(let An=0;An<vn.removed.length;An++){let zn=vn.removed[An],Jn=Nt.indexOf(zn);if(Jn>=0)Nt[Jn]=null,pt[Jn].disconnect(zn)}for(let An=0;An<vn.added.length;An++){let zn=vn.added[An],Jn=Nt.indexOf(zn);if(Jn===-1){for(let kn=0;kn<pt.length;kn++)if(kn>=Nt.length){Nt.push(zn),Jn=kn;break}else if(Nt[kn]===null){Nt[kn]=zn,Jn=kn;break}if(Jn===-1)break}let Kn=pt[Jn];if(Kn)Kn.connect(zn)}}function wn(vn,An){if(An===null)vn.matrixWorld.copy(vn.matrix);else vn.matrixWorld.multiplyMatrices(An.matrixWorld,vn.matrix);vn.matrixWorldInverse.copy(vn.matrixWorld).invert()}this.updateCamera=function(vn){if(s===null)return;let{near:An,far:zn}=vn;if(Ct.texture!==null){if(Ct.depthNear>0)An=Ct.depthNear;if(Ct.depthFar>0)zn=Ct.depthFar}if(Pe.near=be.near=re.near=An,Pe.far=be.far=re.far=zn,$e!==Pe.near||fe!==Pe.far)s.updateRenderState({depthNear:Pe.near,depthFar:Pe.far}),$e=Pe.near,fe=Pe.far;Pe.layers.mask=vn.layers.mask|6,re.layers.mask=Pe.layers.mask&-5,be.layers.mask=Pe.layers.mask&-3;let Jn=vn.parent,Kn=Pe.cameras;wn(Pe,Jn);for(let kn=0;kn<Kn.length;kn++)wn(Kn[kn],Jn);if(Pe.projectionMatrix.copy(re.projectionMatrix),Pe.projectionMatrixInverse.copy(re.projectionMatrixInverse),Rt===null&&vn.isPerspectiveCamera)Rt={camera:vn,fov:vn.fov,zoom:vn.zoom};mn(vn,Pe,Jn)};function mn(vn,An,zn){if(zn===null)vn.matrix.copy(An.matrixWorld);else vn.matrix.copy(zn.matrixWorld),vn.matrix.invert(),vn.matrix.multiply(An.matrixWorld);if(vn.matrix.decompose(vn.position,vn.quaternion,vn.scale),vn.updateMatrixWorld(!0),vn.projectionMatrix.copy(An.projectionMatrix),vn.projectionMatrixInverse.copy(An.projectionMatrixInverse),vn.isPerspectiveCamera)vn.fov=xr*2*Math.atan(1/vn.projectionMatrix.elements[5]),vn.zoom=1}this.getCamera=function(){return Pe},this.getFoveation=function(){if(D===null&&R===null)return;return f},this.setFoveation=function(vn){if(f=vn,D!==null)D.fixedFoveation=vn;if(R!==null&&R.fixedFoveation!==void 0)R.fixedFoveation=vn},this.hasDepthSensing=function(){return Ct.texture!==null},this.getDepthSensingMesh=function(){return Ct.getMesh(Pe)},this.getCameraTexture=function(vn){return j[vn]};let Sn=null;function Tn(vn,An){if(A=An.getViewerPose(x||a),V=An,A!==null){let zn=A.views;if(R!==null)t.setRenderTargetFramebuffer(Pt,R.framebuffer),t.setRenderTarget(Pt);let Jn=!1;if(zn.length!==Pe.cameras.length)Pe.cameras.length=0,Jn=!0;for(let oi=0;oi<zn.length;oi++){let si=zn[oi],xi=null;if(R!==null)xi=R.getViewport(si);else{let Pi=L.getViewSubImage(D,si);if(xi=Pi.viewport,oi===0)t.setRenderTargetTextures(Pt,Pi.colorTexture,Pi.depthStencilTexture),t.setRenderTarget(Pt)}let hi=he[oi];if(hi===void 0)hi=new U,hi.layers.enable(oi),hi.viewport=new b,he[oi]=hi;if(hi.matrix.fromArray(si.transform.matrix),hi.matrix.decompose(hi.position,hi.quaternion,hi.scale),hi.projectionMatrix.fromArray(si.projectionMatrix),hi.projectionMatrixInverse.copy(hi.projectionMatrix).invert(),hi.viewport.set(xi.x,xi.y,xi.width,xi.height),oi===0)Pe.matrix.copy(hi.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale);if(Jn===!0)Pe.cameras.push(hi)}let Kn=s.enabledFeatures;if(Kn&&Kn.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&rt){L=i.getBinding();let oi=L.getDepthInformation(zn[0]);if(oi&&oi.isValid&&oi.texture)Ct.init(oi,s.renderState)}if(Kn&&Kn.includes("camera-access")&&rt){t.state.unbindTexture(),L=i.getBinding();for(let oi=0;oi<zn.length;oi++){let si=zn[oi].camera;if(si){let xi=j[si];if(!xi)xi=new Ga,j[si]=xi;let hi=L.getCameraImage(si);xi.sourceTexture=hi}}}}for(let zn=0;zn<pt.length;zn++){let Jn=Nt[zn],Kn=pt[zn];if(Jn!==null&&Kn!==void 0)Kn.update(Jn,An,x||a)}if(Sn)Sn(vn,An);if(An.detectedPlanes)i.dispatchEvent({type:"planesdetected",data:An});V=null}let Gn=new dd;Gn.setAnimationLoop(Tn),this.setAnimationLoop=function(vn){Sn=vn},this.dispose=function(){}}}var xy=new o,Id=new ei;Id.set(-1,0,0,0,1,0,0,0,1);function yy(t,e){function i(j,it){if(j.matrixAutoUpdate===!0)j.updateMatrix();it.value.copy(j.matrix)}function s(j,it){if(it.color.getRGB(j.fogColor.value,Qc(t)),it.isFog)j.fogNear.value=it.near,j.fogFar.value=it.far;else if(it.isFogExp2)j.fogDensity.value=it.density}function r(j,it,ft,Pt,pt){if(it.isNodeMaterial)it.uniformsNeedUpdate=!1;else if(it.isMeshBasicMaterial)a(j,it);else if(it.isMeshLambertMaterial){if(a(j,it),it.envMap)j.envMapIntensity.value=it.envMapIntensity}else if(it.isMeshToonMaterial)a(j,it),D(j,it);else if(it.isMeshPhongMaterial){if(a(j,it),L(j,it),it.envMap)j.envMapIntensity.value=it.envMapIntensity}else if(it.isMeshStandardMaterial){if(a(j,it),R(j,it),it.isMeshPhysicalMaterial)V(j,it,pt)}else if(it.isMeshMatcapMaterial)a(j,it),rt(j,it);else if(it.isMeshDepthMaterial)a(j,it);else if(it.isMeshDistanceMaterial)a(j,it),Ct(j,it);else if(it.isMeshNormalMaterial)a(j,it);else if(it.isLineBasicMaterial){if(u(j,it),it.isLineDashedMaterial)f(j,it)}else if(it.isPointsMaterial)x(j,it,ft,Pt);else if(it.isSpriteMaterial)A(j,it);else if(it.isShadowMaterial)j.color.value.copy(it.color),j.opacity.value=it.opacity;else if(it.isShaderMaterial)it.uniformsNeedUpdate=!1}function a(j,it){if(j.opacity.value=it.opacity,it.color)j.diffuse.value.copy(it.color);if(it.emissive)j.emissive.value.copy(it.emissive).multiplyScalar(it.emissiveIntensity);if(it.map)j.map.value=it.map,i(it.map,j.mapTransform);if(it.alphaMap)j.alphaMap.value=it.alphaMap,i(it.alphaMap,j.alphaMapTransform);if(it.bumpMap){if(j.bumpMap.value=it.bumpMap,i(it.bumpMap,j.bumpMapTransform),j.bumpScale.value=it.bumpScale,it.side===B)j.bumpScale.value*=-1}if(it.normalMap){if(j.normalMap.value=it.normalMap,i(it.normalMap,j.normalMapTransform),j.normalScale.value.copy(it.normalScale),it.side===B)j.normalScale.value.negate()}if(it.displacementMap)j.displacementMap.value=it.displacementMap,i(it.displacementMap,j.displacementMapTransform),j.displacementScale.value=it.displacementScale,j.displacementBias.value=it.displacementBias;if(it.emissiveMap)j.emissiveMap.value=it.emissiveMap,i(it.emissiveMap,j.emissiveMapTransform);if(it.specularMap)j.specularMap.value=it.specularMap,i(it.specularMap,j.specularMapTransform);if(it.alphaTest>0)j.alphaTest.value=it.alphaTest;let ft=e.get(it),{envMap:Pt,envMapRotation:pt}=ft;if(Pt){if(j.envMap.value=Pt,j.envMapRotation.value.setFromMatrix4(xy.makeRotationFromEuler(pt)).transpose(),Pt.isCubeTexture&&Pt.isRenderTargetTexture===!1)j.envMapRotation.value.premultiply(Id);j.reflectivity.value=it.reflectivity,j.ior.value=it.ior,j.refractionRatio.value=it.refractionRatio}if(it.lightMap)j.lightMap.value=it.lightMap,j.lightMapIntensity.value=it.lightMapIntensity,i(it.lightMap,j.lightMapTransform);if(it.aoMap)j.aoMap.value=it.aoMap,j.aoMapIntensity.value=it.aoMapIntensity,i(it.aoMap,j.aoMapTransform)}function u(j,it){if(j.diffuse.value.copy(it.color),j.opacity.value=it.opacity,it.map)j.map.value=it.map,i(it.map,j.mapTransform)}function f(j,it){j.dashSize.value=it.dashSize,j.totalSize.value=it.dashSize+it.gapSize,j.scale.value=it.scale}function x(j,it,ft,Pt){if(j.diffuse.value.copy(it.color),j.opacity.value=it.opacity,j.size.value=it.size*ft,j.scale.value=Pt*0.5,it.map)j.map.value=it.map,i(it.map,j.uvTransform);if(it.alphaMap)j.alphaMap.value=it.alphaMap,i(it.alphaMap,j.alphaMapTransform);if(it.alphaTest>0)j.alphaTest.value=it.alphaTest}function A(j,it){if(j.diffuse.value.copy(it.color),j.opacity.value=it.opacity,j.rotation.value=it.rotation,it.map)j.map.value=it.map,i(it.map,j.mapTransform);if(it.alphaMap)j.alphaMap.value=it.alphaMap,i(it.alphaMap,j.alphaMapTransform);if(it.alphaTest>0)j.alphaTest.value=it.alphaTest}function L(j,it){j.specular.value.copy(it.specular),j.shininess.value=Math.max(it.shininess,0.0001)}function D(j,it){if(it.gradientMap)j.gradientMap.value=it.gradientMap}function R(j,it){if(j.metalness.value=it.metalness,it.metalnessMap)j.metalnessMap.value=it.metalnessMap,i(it.metalnessMap,j.metalnessMapTransform);if(j.roughness.value=it.roughness,it.roughnessMap)j.roughnessMap.value=it.roughnessMap,i(it.roughnessMap,j.roughnessMapTransform);if(it.envMap)j.envMapIntensity.value=it.envMapIntensity}function V(j,it,ft){if(j.ior.value=it.ior,it.diffuseRoughness>0){if(j.diffuseRoughness.value=it.diffuseRoughness,it.diffuseRoughnessMap)j.diffuseRoughnessMap.value=it.diffuseRoughnessMap,i(it.diffuseRoughnessMap,j.diffuseRoughnessMapTransform)}if(it.sheen>0){if(j.sheenColor.value.copy(it.sheenColor).multiplyScalar(it.sheen),j.sheenRoughness.value=it.sheenRoughness,it.sheenColorMap)j.sheenColorMap.value=it.sheenColorMap,i(it.sheenColorMap,j.sheenColorMapTransform);if(it.sheenRoughnessMap)j.sheenRoughnessMap.value=it.sheenRoughnessMap,i(it.sheenRoughnessMap,j.sheenRoughnessMapTransform)}if(it.clearcoat>0){if(j.clearcoat.value=it.clearcoat,j.clearcoatRoughness.value=it.clearcoatRoughness,it.clearcoatMap)j.clearcoatMap.value=it.clearcoatMap,i(it.clearcoatMap,j.clearcoatMapTransform);if(it.clearcoatRoughnessMap)j.clearcoatRoughnessMap.value=it.clearcoatRoughnessMap,i(it.clearcoatRoughnessMap,j.clearcoatRoughnessMapTransform);if(it.clearcoatNormalMap){if(j.clearcoatNormalMap.value=it.clearcoatNormalMap,i(it.clearcoatNormalMap,j.clearcoatNormalMapTransform),j.clearcoatNormalScale.value.copy(it.clearcoatNormalScale),it.side===B)j.clearcoatNormalScale.value.negate()}}if(it.dispersion>0)j.dispersion.value=it.dispersion;if(it.retroreflectivity>0)j.retroreflectivity.value=it.retroreflectivity;if(it.iridescence>0){if(j.iridescence.value=it.iridescence,j.iridescenceIOR.value=it.iridescenceIOR,j.iridescenceThicknessMinimum.value=it.iridescenceThicknessMinimum,j.iridescenceThicknessMaximum.value=it.iridescenceThicknessMaximum,it.iridescenceMap)j.iridescenceMap.value=it.iridescenceMap,i(it.iridescenceMap,j.iridescenceMapTransform);if(it.iridescenceThicknessMap)j.iridescenceThicknessMap.value=it.iridescenceThicknessMap,i(it.iridescenceThicknessMap,j.iridescenceThicknessMapTransform)}if(it.transmission>0){if(j.transmission.value=it.transmission,j.transmissionSamplerMap.value=ft.texture,j.transmissionSamplerSize.value.set(ft.width,ft.height),it.transmissionMap)j.transmissionMap.value=it.transmissionMap,i(it.transmissionMap,j.transmissionMapTransform);if(j.thickness.value=it.thickness,it.thicknessMap)j.thicknessMap.value=it.thicknessMap,i(it.thicknessMap,j.thicknessMapTransform);j.attenuationDistance.value=it.attenuationDistance,j.attenuationColor.value.copy(it.attenuationColor)}if(it.anisotropy>0){if(j.anisotropyVector.value.set(it.anisotropy*Math.cos(it.anisotropyRotation),it.anisotropy*Math.sin(it.anisotropyRotation)),it.anisotropyMap)j.anisotropyMap.value=it.anisotropyMap,i(it.anisotropyMap,j.anisotropyMapTransform)}if(j.specularIntensity.value=it.specularIntensity,j.specularColor.value.copy(it.specularColor),it.specularColorMap)j.specularColorMap.value=it.specularColorMap,i(it.specularColorMap,j.specularColorMapTransform);if(it.specularIntensityMap)j.specularIntensityMap.value=it.specularIntensityMap,i(it.specularIntensityMap,j.specularIntensityMapTransform)}function rt(j,it){if(it.matcap)j.matcap.value=it.matcap}function Ct(j,it){let ft=e.get(it).light;j.referencePosition.value.setFromMatrixPosition(ft.matrixWorld),j.nearDistance.value=ft.shadow.camera.near,j.farDistance.value=ft.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:r}}function vy(t,e,i,s){let r={},a={};function u(ft,Pt){let pt=Pt.program;s.uniformBlockBinding(ft,pt,r[ft.id])}function f(ft,Pt){let pt=r[ft.id];if(pt===void 0)rt(ft),pt=x(ft),r[ft.id]=pt,ft.addEventListener("dispose",j);let Nt=Pt.program;s.updateUBOMapping(ft,Nt);let se=e.render.frame;if(a[ft.id]!==se)A(ft),a[ft.id]=se}function x(ft){let Pt=t.createBuffer(),{__size:pt,usage:Nt}=ft;return t.bindBuffer(t.UNIFORM_BUFFER,Pt),t.bufferData(t.UNIFORM_BUFFER,pt,Nt),t.bindBuffer(t.UNIFORM_BUFFER,null),Pt}function A(ft){let Pt=r[ft.id],{uniforms:pt,__cache:Nt}=ft;t.bindBuffer(t.UNIFORM_BUFFER,Pt);for(let se=0,nt=pt.length;se<nt;se++){let Rt=pt[se];if(Array.isArray(Rt))for(let re=0,be=Rt.length;re<be;re++)L(Rt[re],se,re,Nt);else L(Rt,se,0,Nt)}t.bindBuffer(t.UNIFORM_BUFFER,null)}function L(ft,Pt,pt,Nt){if(R(ft,Pt,pt,Nt)===!0){let{__offset:se,value:nt}=ft;if(Array.isArray(nt)){let Rt=0;for(let re=0;re<nt.length;re++){let be=nt[re],he=Ct(be,!0);D(be,ft.__data,Rt),Rt+=he.storage/Float32Array.BYTES_PER_ELEMENT}}else D(nt,ft.__data,0);t.bufferSubData(t.UNIFORM_BUFFER,se,ft.__data)}}function D(ft,Pt,pt){if(typeof ft==="number"||typeof ft==="boolean")Pt[pt]=ft;else if(ft.isMatrix3)Pt[pt]=ft.elements[0],Pt[pt+1]=ft.elements[1],Pt[pt+2]=ft.elements[2],Pt[pt+3]=0,Pt[pt+4]=ft.elements[3],Pt[pt+5]=ft.elements[4],Pt[pt+6]=ft.elements[5],Pt[pt+7]=0,Pt[pt+8]=ft.elements[6],Pt[pt+9]=ft.elements[7],Pt[pt+10]=ft.elements[8],Pt[pt+11]=0;else if(ArrayBuffer.isView(ft))Pt.set(ft.subarray(0,Pt.length-pt),pt);else ft.toArray(Pt,pt)}function R(ft,Pt,pt,Nt){let se=ft.value,nt=Pt+"_"+pt;if(Array.isArray(se)){if(Nt[nt]===void 0)Nt[nt]=[];let Rt=Nt[nt],re=!1;for(let be=0;be<se.length;be++)if(V(se[be],Rt,be)===!0)re=!0;return re}return V(se,Nt,nt)}function V(ft,Pt,pt){if(Pt[pt]===void 0){if(typeof ft==="number"||typeof ft==="boolean")Pt[pt]=ft;else if(ArrayBuffer.isView(ft))Pt[pt]=ft.slice();else Pt[pt]=ft.clone();return!0}else{let Nt=Pt[pt];if(typeof ft==="number"||typeof ft==="boolean"){if(Nt!==ft)return Pt[pt]=ft,!0}else if(ArrayBuffer.isView(ft))return!0;else if(Nt.equals(ft)===!1)return Nt.copy(ft),!0}return!1}function rt(ft){let Pt=ft.uniforms,pt=0,Nt=16;for(let nt=0,Rt=Pt.length;nt<Rt;nt++){let re=Array.isArray(Pt[nt])?Pt[nt]:[Pt[nt]];for(let be=0,he=re.length;be<he;be++){let Pe=re[be],$e=Array.isArray(Pe.value)?Pe.value:[Pe.value],fe=Array.isArray(Pt[nt])||Array.isArray(Pe.value),sn=pt;for(let rn=0,wn=$e.length;rn<wn;rn++){let mn=$e[rn],Sn=Ct(mn,fe),Tn=pt%Nt,Gn=Tn%Sn.boundary,vn=Tn+Gn;if(pt+=Gn,vn!==0&&Nt-vn<Sn.storage)pt+=Nt-vn;if(rn===0)sn=pt;pt+=Sn.storage}let un=Pe.type==="int"?Int32Array:Pe.type==="uint"?Uint32Array:Float32Array;Pe.__data=new un((pt-sn)/Float32Array.BYTES_PER_ELEMENT),Pe.__offset=sn}}let se=pt%Nt;if(se>0)pt+=Nt-se;return ft.__size=pt,ft.__cache={},this}function Ct(ft,Pt){let pt={boundary:0,storage:0};if(typeof ft==="number"||typeof ft==="boolean")pt.boundary=4,pt.storage=4;else if(ft.isVector2)pt.boundary=8,pt.storage=8;else if(ft.isVector3||ft.isColor)pt.boundary=16,pt.storage=12;else if(ft.isVector4)pt.boundary=16,pt.storage=16;else if(ft.isMatrix3)pt.boundary=16,pt.storage=48;else if(ft.isMatrix4)pt.boundary=16,pt.storage=64;else if(ft.isTexture)Yn("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(ft))pt.boundary=16,pt.storage=ft.byteLength;else Yn("WebGLRenderer: Unsupported uniform value type.",ft);if(Pt===!0)pt.boundary=16,pt.storage=Math.ceil(pt.storage/16)*16;return pt}function j(ft){let Pt=ft.target;Pt.removeEventListener("dispose",j),t.deleteBuffer(r[Pt.id]),delete r[Pt.id],delete a[Pt.id]}function it(){for(let ft in r)t.deleteBuffer(r[ft]);r={},a={}}return{bind:u,update:f,dispose:it}}var Sy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ns=null;function My(){if(Ns===null)Ns=new ge(Sy,16,16,Mr,te),Ns.name="DFG_LUT",Ns.minFilter=I,Ns.magFilter=I,Ns.wrapS=Oe,Ns.wrapT=Oe,Ns.generateMipmaps=!1,Ns.needsUpdate=!0;return Ns}class We{constructor(t={}){let{canvas:e=Lf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:u=!1,premultipliedAlpha:f=!0,preserveDrawingBuffer:x=!1,powerPreference:A="default",failIfMajorPerformanceCaveat:L=!1,reversedDepthBuffer:D=!1,outputBufferType:R=Ts}=t;this.isWebGLRenderer=!0;let V;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");V=i.getContextAttributes().alpha}else V=a;let rt=R,Ct=new Set([uc,hc,cc]),j=new Set([Ts,tr,Co,Sr,ac,lc]),it=new Uint32Array(4),ft=new Int32Array(4),Pt={textures:[],min:[],max:[],resolution:[]},pt=null,Nt=null,se=[],nt=[],Rt=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Is,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let re=this,be=!1,he=null,Pe=null,$e=null,fe=null;this._outputColorSpace=_e;let sn=0,un=0,rn=null,wn=-1,mn=null,Sn=new b,Tn=new b,Gn=null,vn=new c(0),An=0,{width:zn,height:Jn}=e,Kn=1,kn=null,di=null,oi=new b(0,0,zn,Jn),si=new b(0,0,zn,Jn),xi=!1,hi=new de,Pi=new No,Ni=!1,os=!1,hs=new o,Di=new n,Yi=new b,as={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ls=!1;function _s(){return rn===null?Kn:1}let Ke=i;function xs(Wt,Ue){return e.getContext(Wt,Ue)}let yi,Gi,Un,wi,Qn,ni,Zi,Me,Ut,on,bn,Mn,Cn,Ln,pn,yn,In,Ne,xn,gn,En,Rn,Dn;try{let Wt={alpha:!0,depth:s,stencil:r,antialias:u,premultipliedAlpha:f,preserveDrawingBuffer:x,powerPreference:A,failIfMajorPerformanceCaveat:L};if("setAttribute"in e)e.setAttribute("data-engine",`three.js r${yr}`);if(e.addEventListener("webglcontextlost",Fn,!1),e.addEventListener("webglcontextrestored",$n,!1),e.addEventListener("webglcontextcreationerror",ri,!1),Ke===null){if(Ke=xs("webgl2",Wt),Ke===null)if(xs("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Zn()}catch(Wt){throw e.removeEventListener("webglcontextlost",Fn,!1),e.removeEventListener("webglcontextrestored",$n,!1),e.removeEventListener("webglcontextcreationerror",ri,!1),jn("WebGLRenderer: "+Wt.message),Wt}function Zn(){if(yi=new N0(Ke),yi.init(),En=new my(Ke,yi),Gi=new M0(Ke,yi,t,En),Un=new dy(Ke,yi),Gi.reversedDepthBuffer&&D)Un.buffers.depth.setReversed(!0);Pe=Ke.createFramebuffer(),$e=Ke.createFramebuffer(),fe=Ke.createFramebuffer(),wi=new F0(Ke),Qn=new jx,ni=new py(Ke,yi,Un,Qn,Gi,En,wi),Zi=new L0(re),Me=new Bm(Ke),Rn=new v0(Ke,Me),Ut=new D0(Ke,Me,wi,Rn),on=new B0(Ke,Ut,Me,Rn,wi),Ne=new O0(Ke,Gi,ni),pn=new b0(Qn),bn=new Qx(re,Zi,yi,Gi,Rn,pn),Mn=new yy(re,Qn),Cn=new ey,Ln=new ay(yi),In=new y0(re,Zi,Un,on,V,f),yn=new fy(re,on,Gi),Dn=new vy(Ke,wi,Gi,Un),xn=new S0(Ke,yi,wi),gn=new U0(Ke,yi,wi),wi.programs=bn.programs,re.capabilities=Gi,re.extensions=yi,re.properties=Qn,re.renderLists=Cn,re.shadowMap=yn,re.state=Un,re.info=wi}if(rt!==Ts)Rt=new G0(rt,e.width,e.height,u,s,r);let qn=new Cd(re,Ke);this.xr=qn,this.getContext=function(){return Ke},this.getContextAttributes=function(){return Ke.getContextAttributes()},this.forceContextLoss=function(){let Wt=yi.get("WEBGL_lose_context");if(Wt)Wt.loseContext()},this.forceContextRestore=function(){let Wt=yi.get("WEBGL_lose_context");if(Wt)Wt.restoreContext()},this.getPixelRatio=function(){return Kn},this.setPixelRatio=function(Wt){if(Wt===void 0)return;Kn=Wt,this.setSize(zn,Jn,!1)},this.getSize=function(Wt){return Wt.set(zn,Jn)},this.setSize=function(Wt,Ue,cn=!0){if(qn.isPresenting){Yn("WebGLRenderer: Can't change size while VR device is presenting.");return}if(zn=Wt,Jn=Ue,e.width=Math.floor(Wt*Kn),e.height=Math.floor(Ue*Kn),cn===!0)e.style.width=Wt+"px",e.style.height=Ue+"px";if(Rt!==null)Rt.setSize(e.width,e.height);this.setViewport(0,0,Wt,Ue)},this.getDrawingBufferSize=function(Wt){return Wt.set(zn*Kn,Jn*Kn).floor()},this.setDrawingBufferSize=function(Wt,Ue,cn){zn=Wt,Jn=Ue,Kn=cn,e.width=Math.floor(Wt*cn),e.height=Math.floor(Ue*cn),this.setViewport(0,0,Wt,Ue)},this.setEffects=function(Wt){if(rt===Ts){jn("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(Wt){for(let Ue=0;Ue<Wt.length;Ue++)if(Wt[Ue].isOutputPass===!0){Yn("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}Rt.setEffects(Wt||[])},this.getCurrentViewport=function(Wt){return Wt.copy(Sn)},this.getViewport=function(Wt){return Wt.copy(oi)},this.setViewport=function(Wt,Ue,cn,an){if(Wt.isVector4)oi.set(Wt.x,Wt.y,Wt.z,Wt.w);else oi.set(Wt,Ue,cn,an);Un.viewport(Sn.copy(oi).multiplyScalar(_s()).round())},this.getScissor=function(Wt){return Wt.copy(si)},this.setScissor=function(Wt,Ue,cn,an){if(Wt.isVector4)si.set(Wt.x,Wt.y,Wt.z,Wt.w);else si.set(Wt,Ue,cn,an);Un.scissor(Tn.copy(si).multiplyScalar(_s()).round())},this.getScissorTest=function(){return xi},this.setScissorTest=function(Wt){Un.setScissorTest(xi=Wt)},this.setOpaqueSort=function(Wt){kn=Wt},this.setTransparentSort=function(Wt){di=Wt},this.getClearColor=function(Wt){return Wt.copy(In.getClearColor())},this.setClearColor=function(){In.setClearColor(...arguments)},this.getClearAlpha=function(){return In.getClearAlpha()},this.setClearAlpha=function(){In.setClearAlpha(...arguments)},this.clear=function(Wt=!0,Ue=!0,cn=!0){let an=0;if(Wt){let ln=!1;if(rn!==null){let Nn=rn.texture.format;ln=Ct.has(Nn)}if(ln){let Nn=rn.texture.type,Hn=j.has(Nn),Pn=In.getClearColor(),Bn=In.getClearAlpha(),{r:Xn,g:ii,b:li}=Pn;if(Hn)it[0]=Xn,it[1]=ii,it[2]=li,it[3]=Bn,Ke.clearBufferuiv(Ke.COLOR,0,it);else ft[0]=Xn,ft[1]=ii,ft[2]=li,ft[3]=Bn,Ke.clearBufferiv(Ke.COLOR,0,ft)}else an|=Ke.COLOR_BUFFER_BIT}if(Ue)an|=Ke.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(cn)an|=Ke.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(an!==0)Ke.clear(an)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(Wt){Wt.setRenderer(this),he=Wt},this.dispose=function(){e.removeEventListener("webglcontextlost",Fn,!1),e.removeEventListener("webglcontextrestored",$n,!1),e.removeEventListener("webglcontextcreationerror",ri,!1),In.dispose(),Cn.dispose(),Ln.dispose(),ni.dispose(),Qn.dispose(),Zi.dispose(),on.dispose(),Ut.dispose(),Rn.dispose(),Dn.dispose(),bn.dispose(),qn.dispose(),qn.removeEventListener("sessionstart",Gh),qn.removeEventListener("sessionend",kh),cr.stop()};function Fn(Wt){Wt.preventDefault(),Ao("WebGLRenderer: Context Lost."),be=!0}function $n(){Ao("WebGLRenderer: Context Restored."),be=!1;let Wt=wi.autoReset,Ue=yn.enabled,cn=yn.autoUpdate,an=yn.needsUpdate,ln=yn.type;Zn(),wi.autoReset=Wt,yn.enabled=Ue,yn.autoUpdate=cn,yn.needsUpdate=an,yn.type=ln}function ri(Wt){jn("WebGLRenderer: A WebGL context could not be created. Reason: ",Wt.statusMessage)}function On(Wt){let Ue=Wt.target;Ue.removeEventListener("dispose",On),vi(Ue)}function vi(Wt){ki(Wt),Qn.remove(Wt)}function ki(Wt){let Ue=Qn.get(Wt).programs;if(Ue!==void 0){if(Ue.forEach(function(cn){bn.releaseProgram(cn)}),Wt.isShaderMaterial)bn.releaseShaderCache(Wt)}}this.renderBufferDirect=function(Wt,Ue,cn,an,ln,Nn){if(Ue===null)Ue=as;let Hn=ln.isMesh&&ln.matrixWorld.determinantAffine()<0,Pn=Tp(Wt,Ue,cn,an,ln);Un.setMaterial(an,Hn);let Bn=cn.index,Xn=1;if(an.wireframe===!0){if(Bn=Ut.getWireframeAttribute(cn),Bn===void 0)return;Xn=2}let ii=cn.drawRange,li=cn.attributes.position,Vn=ii.start*Xn,ci=(ii.start+ii.count)*Xn;if(Nn!==null)Vn=Math.max(Vn,Nn.start*Xn),ci=Math.min(ci,(Nn.start+Nn.count)*Xn);if(Bn!==null)Vn=Math.max(Vn,0),ci=Math.min(ci,Bn.count);else if(li!==void 0&&li!==null)Vn=Math.max(Vn,0),ci=Math.min(ci,li.count);let Ui=ci-Vn;if(Ui<0||Ui===1/0)return;Rn.setup(ln,an,Pn,cn,Bn);let Ri,bi=xn;if(Bn!==null)Ri=Me.get(Bn),bi=gn,bi.setIndex(Ri);if(ln.isMesh)if(an.wireframe===!0)Un.setLineWidth(an.wireframeLinewidth*_s()),bi.setMode(Ke.LINES);else bi.setMode(Ke.TRIANGLES);else if(ln.isLine){let Ji=an.linewidth;if(Ji===void 0)Ji=1;if(Un.setLineWidth(Ji*_s()),ln.isLineSegments)bi.setMode(Ke.LINES);else if(ln.isLineLoop)bi.setMode(Ke.LINE_LOOP);else bi.setMode(Ke.LINE_STRIP)}else if(ln.isPoints)bi.setMode(Ke.POINTS);else if(ln.isSprite)bi.setMode(Ke.TRIANGLES);if(ln.isBatchedMesh)if(!yi.get("WEBGL_multi_draw")){let{_multiDrawStarts:Ji,_multiDrawCounts:Wn,_multiDrawCount:is}=ln,pi=Bn?Me.get(Bn).bytesPerElement:1,hr=Qn.get(an).currentProgram.getUniforms();for(let $i=0;$i<is;$i++)hr.setValue(Ke,"_gl_DrawID",$i),bi.render(Ji[$i]/pi,Wn[$i])}else bi.renderMultiDraw(ln._multiDrawStarts,ln._multiDrawCounts,ln._multiDrawCount);else if(ln.isInstancedMesh)bi.renderInstances(Vn,Ui,ln.count);else if(cn.isInstancedBufferGeometry){let Ji=cn._maxInstanceCount!==void 0?cn._maxInstanceCount:1/0,Wn=Math.min(cn.instanceCount,Ji);bi.renderInstances(Vn,Ui,Wn)}else bi.render(Vn,Ui)};function Fs(Wt,Ue,cn,an){if(he!==null&&Wt.isNodeMaterial)he.setObject(an,Wt);if(Ni===!0)pn.setState(Wt,cn,!1);if(Wt.transparent===!0&&Wt.side===w&&Wt.forceSinglePass===!1)Wt.side=B,Wt.needsUpdate=!0,fo(Wt,Ue,an),Wt.side=pe,Wt.needsUpdate=!0,fo(Wt,Ue,an),Wt.side=w;else fo(Wt,Ue,an)}this.compile=function(Wt,Ue,cn=null){if(cn===null)cn=Wt;if(he!==null)he.renderStart(Wt,Ue,cn);if(Nt=Ln.get(cn),Nt.init(Ue),nt.push(Nt),cn.traverseVisible(function(ln){if(ln.isLight&&ln.layers.test(Ue.layers)){if(Nt.pushLight(ln),ln.castShadow)Nt.pushShadow(ln)}}),Wt!==cn)Wt.traverseVisible(function(ln){if(ln.isLight&&ln.layers.test(Ue.layers)){if(Nt.pushLight(ln),ln.castShadow)Nt.pushShadow(ln)}});if(Nt.setupLights(),he!==null)he.updateLights(Nt.state.lightsArray);if(os=this.localClippingEnabled,Ni=pn.init(this.clippingPlanes,os),Ni===!0)pn.setGlobalState(this.clippingPlanes,Ue);if(he!==null)yn.render(Nt.state.shadowsArray,cn,Ue);let an=new Set;if(Wt.traverse(function(ln){if(!(ln.isMesh||ln.isPoints||ln.isLine||ln.isSprite))return;let Nn=ln.material;if(Nn)if(Array.isArray(Nn))for(let Hn=0;Hn<Nn.length;Hn++){let Pn=Nn[Hn];Fs(Pn,cn,Ue,ln),an.add(Pn)}else Fs(Nn,cn,Ue,ln),an.add(Nn)}),Nt=nt.pop(),he!==null)he.renderEnd();return an},this.compileAsync=function(Wt,Ue,cn=null){let an=this.compile(Wt,Ue,cn);return new Promise((ln)=>{function Nn(){if(an.forEach(function(Hn){let Bn=Qn.get(Hn).currentProgram;if(Bn===void 0||Bn.isReady())an.delete(Hn)}),an.size===0){ln(Wt);return}setTimeout(Nn,10)}if(yi.get("KHR_parallel_shader_compile")!==null)Nn();else setTimeout(Nn,10)})};let xl=null;function Mp(Wt){if(xl)xl(Wt)}function Gh(){cr.stop()}function kh(){cr.start()}let cr=new dd;if(cr.setAnimationLoop(Mp),typeof self<"u")cr.setContext(self);this.setAnimationLoop=function(Wt){xl=Wt,qn.setAnimationLoop(Wt),Wt===null?cr.stop():cr.start()},qn.addEventListener("sessionstart",Gh),qn.addEventListener("sessionend",kh),this.render=function(Wt,Ue){if(Ue!==void 0&&Ue.isCamera!==!0){jn("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(be===!0)return;if(he!==null)he.renderStart(Wt,Ue);let cn=qn.enabled===!0&&qn.isPresenting===!0,an=Rt!==null&&(rn===null||cn)&&Rt.begin(re,rn);if(Wt.matrixWorldAutoUpdate===!0)Wt.updateMatrixWorld();if(Ue.parent===null&&Ue.matrixWorldAutoUpdate===!0)Ue.updateMatrixWorld();if(qn.enabled===!0&&qn.isPresenting===!0&&(Rt===null||Rt.isCompositing()===!1)){if(qn.cameraAutoUpdate===!0)qn.updateCamera(Ue);Ue=qn.getCamera()}if(Wt.isScene===!0)Wt.onBeforeRender(re,Wt,Ue,rn);if(Nt=Ln.get(Wt,nt.length),Nt.init(Ue),Nt.state.textureUnits=ni.getTextureUnits(),nt.push(Nt),hs.multiplyMatrices(Ue.projectionMatrix,Ue.matrixWorldInverse),Ue.isArrayCamera)Pi.setFromArrayCamera(Ue);else hi.setFromProjectionMatrix(hs,Wc,Ue.reversedDepth);if(os=this.localClippingEnabled,Ni=pn.init(this.clippingPlanes,os),pt=Cn.get(Wt,se.length),pt.init(),se.push(pt),this.info.render.frame++,qn.enabled===!0&&qn.isPresenting===!0){let Hn=re.xr.getDepthSensingMesh();if(Hn!==null)yl(Hn,Ue,-1/0,re.sortObjects)}if(yl(Wt,Ue,0,re.sortObjects),pt.finish(),he!==null)he.updateLights(Nt.state.lightsArray);if(re.sortObjects===!0)pt.sort(kn,di);if(ls=qn.enabled===!1||qn.isPresenting===!1||qn.hasDepthSensing()===!1,ls)In.addToRenderList(pt,Wt);if(this.info.autoReset===!0)this.info.reset();if(Ni===!0)pn.beginShadows();let ln=Nt.state.shadowsArray;if(yn.render(ln,Wt,Ue),Ni===!0)pn.endShadows();if((an&&Rt.hasRenderPass())===!1){let Hn=pt.opaque,Pn=pt.transmissive;if(Nt.setupLights(),Ue.isArrayCamera){let Bn=Ue.cameras;if(Pn.length>0)for(let Xn=0,ii=Bn.length;Xn<ii;Xn++){let li=Bn[Xn];Vh(Hn,Pn,Wt,li)}if(ls)In.render(Wt);for(let Xn=0,ii=Bn.length;Xn<ii;Xn++){let li=Bn[Xn];Hh(pt,Wt,li,li.viewport)}}else{if(Pn.length>0)Vh(Hn,Pn,Wt,Ue);if(ls)In.render(Wt);Hh(pt,Wt,Ue)}}if(rn!==null&&un===0)ni.updateMultisampleRenderTarget(rn),ni.updateRenderTargetMipmap(rn);if(an)Rt.end(re);if(Wt.isScene===!0)Wt.onAfterRender(re,Wt,Ue);if(Rn.resetDefaultState(),wn=-1,mn=null,nt.pop(),nt.length>0){if(Nt=nt[nt.length-1],ni.setTextureUnits(Nt.state.textureUnits),Ni===!0)pn.setGlobalState(re.clippingPlanes,Nt.state.camera)}else Nt=null;if(se.pop(),se.length>0)pt=se[se.length-1];else pt=null;if(he!==null)he.renderEnd()};function yl(Wt,Ue,cn,an){if(Wt.visible===!1)return;if(Wt.layers.test(Ue.layers)){if(Wt.isGroup)cn=Wt.renderOrder;else if(Wt.isLOD){if(Wt.autoUpdate===!0)Wt.update(Ue)}else if(Wt.isLight){if(Nt.pushLight(Wt),Wt.castShadow)Nt.pushShadow(Wt)}else if(Wt.isSprite){let Hn=Ue.isArrayCamera?Pi:hi;if(!Wt.frustumCulled||Wt.intersectsFrustum(Hn)){if(an)Yi.setFromMatrixPosition(Wt.matrixWorld).applyMatrix4(hs);let Pn=on.update(Wt),Bn=Wt.material;if(Bn.visible)pt.push(Wt,Pn,Bn,cn,Yi.z,null,Ue)}}else if(Wt.isMesh||Wt.isLine||Wt.isPoints){let Hn=Ue.isArrayCamera?Pi:hi;if(!Wt.frustumCulled||Wt.intersectsFrustum(Hn)){let Pn=on.update(Wt),Bn=Wt.material;if(an){if(Wt.boundingSphere!==void 0){if(Wt.boundingSphere===null)Wt.computeBoundingSphere();Yi.copy(Wt.boundingSphere.center)}else{if(Pn.boundingSphere===null)Pn.computeBoundingSphere();Yi.copy(Pn.boundingSphere.center)}Yi.applyMatrix4(Wt.matrixWorld).applyMatrix4(hs)}if(Array.isArray(Bn)){let Xn=Pn.groups;for(let ii=0,li=Xn.length;ii<li;ii++){let Vn=Xn[ii],ci=Bn[Vn.materialIndex];if(ci&&ci.visible)pt.push(Wt,Pn,ci,cn,Yi.z,Vn,Ue)}}else if(Bn.visible)pt.push(Wt,Pn,Bn,cn,Yi.z,null,Ue)}}}let Nn=Wt.children;for(let Hn=0,Pn=Nn.length;Hn<Pn;Hn++)yl(Nn[Hn],Ue,cn,an)}function Hh(Wt,Ue,cn,an){let{opaque:ln,transmissive:Nn,transparent:Hn}=Wt;if(Nt.setupLightsView(cn),Ni===!0)pn.setGlobalState(re.clippingPlanes,cn);if(an)Un.viewport(Sn.copy(an));if(ln.length>0)$o(ln,Ue,cn);if(Nn.length>0)$o(Nn,Ue,cn);if(Hn.length>0)$o(Hn,Ue,cn);Un.buffers.depth.setTest(!0),Un.buffers.depth.setMask(!0),Un.buffers.color.setMask(!0),Un.setPolygonOffset(!1)}function Vh(Wt,Ue,cn,an){if((cn.isScene===!0?cn.overrideMaterial:null)!==null)return;if(Nt.state.transmissionRenderTarget[an.id]===void 0){let Vn=yi.has("EXT_color_buffer_half_float")||yi.has("EXT_color_buffer_float");Nt.state.transmissionRenderTarget[an.id]=new ne(1,1,{generateMipmaps:!0,type:Vn?te:Ts,minFilter:ee,samples:Math.max(4,Gi.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:y.workingColorSpace})}let Nn=Nt.state.transmissionRenderTarget[an.id],Hn=an.viewport||Sn;Nn.setSize(Hn.z*re.transmissionResolutionScale,Hn.w*re.transmissionResolutionScale);let Pn=re.getRenderTarget(),Bn=re.getActiveCubeFace(),Xn=re.getActiveMipmapLevel();if(re.setRenderTarget(Nn),re.getClearColor(vn),An=re.getClearAlpha(),An<1)re.setClearColor(16777215,0.5);if(re.clear(),ls)In.render(cn);let ii=re.toneMapping;re.toneMapping=Is;let li=an.viewport;if(an.viewport!==void 0)an.viewport=void 0;if(Nt.setupLightsView(an),Ni===!0)pn.setGlobalState(re.clippingPlanes,an);if($o(Wt,cn,an),ni.updateMultisampleRenderTarget(Nn),ni.updateRenderTargetMipmap(Nn),yi.has("WEBGL_multisampled_render_to_texture")===!1){let Vn=!1;for(let ci=0,Ui=Ue.length;ci<Ui;ci++){let Ri=Ue[ci],{object:bi,geometry:Ji,material:Wn,group:is}=Ri;if(Wn.side===w&&bi.layers.test(an.layers)){let pi=Wn.side;Wn.side=B,Wn.needsUpdate=!0,Wh(bi,cn,an,Ji,Wn,is),Wn.side=pi,Wn.needsUpdate=!0,Vn=!0}}if(Vn===!0)ni.updateMultisampleRenderTarget(Nn),ni.updateRenderTargetMipmap(Nn)}if(re.setRenderTarget(Pn,Bn,Xn),re.setClearColor(vn,An),li!==void 0)an.viewport=li;re.toneMapping=ii}function $o(Wt,Ue,cn){let an=Ue.isScene===!0?Ue.overrideMaterial:null;for(let ln=0,Nn=Wt.length;ln<Nn;ln++){let Hn=Wt[ln],{object:Pn,geometry:Bn,group:Xn}=Hn,ii=Hn.material;if(ii.allowOverride===!0&&an!==null)ii=an;if(Pn.layers.test(cn.layers))Wh(Pn,Ue,cn,Bn,ii,Xn)}}function Wh(Wt,Ue,cn,an,ln,Nn){if(he!==null&&ln.isNodeMaterial)he.setObject(Wt,ln);if(Wt.onBeforeRender(re,Ue,cn,an,ln,Nn),Wt.modelViewMatrix.multiplyMatrices(cn.matrixWorldInverse,Wt.matrixWorld),Wt.normalMatrix.getNormalMatrix(Wt.modelViewMatrix),ln.onBeforeRender(re,Ue,cn,an,Wt,Nn),ln.transparent===!0&&ln.side===w&&ln.forceSinglePass===!1)ln.side=B,ln.needsUpdate=!0,re.renderBufferDirect(cn,Ue,an,ln,Wt,Nn),ln.side=pe,ln.needsUpdate=!0,re.renderBufferDirect(cn,Ue,an,ln,Wt,Nn),ln.side=w;else re.renderBufferDirect(cn,Ue,an,ln,Wt,Nn);Wt.onAfterRender(re,Ue,cn,an,ln,Nn)}function Xh(Wt){let Ue=0;for(let cn of Wt)if(cn.texture!==null)Ue++;return Ue}function fo(Wt,Ue,cn){if(Ue.isScene!==!0)Ue=as;let an=Qn.get(Wt),ln=Nt.state.lights,Nn=Nt.state.shadowsArray,Hn=ln.state.version,Pn=bn.getParameters(Wt,ln.state,Nn,Ue,cn,Nt.state.lightProbeGridArray),Bn=bn.getProgramCacheKey(Pn),Xn=an.programs;an.environment=Wt.isMeshStandardMaterial||Wt.isMeshLambertMaterial||Wt.isMeshPhongMaterial?Ue.environment:null,an.fog=Ue.fog;let ii=Wt.isMeshStandardMaterial||Wt.isMeshLambertMaterial&&!Wt.envMap||Wt.isMeshPhongMaterial&&!Wt.envMap;if(an.envMap=Zi.get(Wt.envMap||an.environment,ii),an.envMapRotation=an.environment!==null&&Wt.envMap===null?Ue.environmentRotation:Wt.envMapRotation,Xn===void 0)Wt.addEventListener("dispose",On),Xn=new Map,an.programs=Xn,an.programVariants=new Map;let li=Xn.get(Bn);if(li!==void 0){if(an.currentProgram===li&&an.lightsStateVersion===Hn)return Yh(Wt,Pn),li}else{if(Pn.uniforms=bn.getUniforms(Wt),he!==null&&Wt.isNodeMaterial)he.build(Wt,cn,Pn);Wt.onBeforeCompile(Pn,re),li=bn.acquireProgram(Pn,Bn),Xn.set(Bn,li),an.uniforms=Pn.uniforms}let Vn=an.uniforms;if(!Wt.isShaderMaterial&&!Wt.isRawShaderMaterial||Wt.clipping===!0)Vn.clippingPlanes=pn.uniform;if(Yh(Wt,Pn),an.needsLights=Ep(Wt),an.lightsStateVersion=Hn,an.needsLights)Vn.ambientLightColor.value=ln.state.ambient,Vn.lightProbe.value=ln.state.probe,Vn.sunLights.value=ln.state.sun,Vn.sunLightShadows.value=ln.state.sunShadow,Vn.directionalLights.value=ln.state.directional,Vn.directionalLightShadows.value=ln.state.directionalShadow,Vn.spotLights.value=ln.state.spot,Vn.spotLightShadows.value=ln.state.spotShadow,Vn.rectAreaLights.value=ln.state.rectArea,Vn.ltc_1.value=ln.state.rectAreaLTC1,Vn.ltc_2.value=ln.state.rectAreaLTC2,Vn.pointLights.value=ln.state.point,Vn.pointLightShadows.value=ln.state.pointShadow,Vn.hemisphereLights.value=ln.state.hemi,Vn.sunShadowMatrix.value=ln.state.sunShadowMatrix,Vn.sunShadowCascade.value=ln.state.sunShadowCascade,Vn.directionalShadowMatrix.value=ln.state.directionalShadowMatrix,Vn.spotLightMatrix.value=ln.state.spotLightMatrix,Vn.spotLightMap.value=ln.state.spotLightMap,Vn.pointShadowMatrix.value=ln.state.pointShadowMatrix;return an.numLightProbeGrids=Xh(Nt.state.lightProbeGridArray),an.currentProgram=li,an.uniformsList=null,li}function bp(Wt,Ue,cn,an,ln){let Nn=Qn.get(Wt),Hn=Nn.currentProgram.id+","+an+","+ln,Pn=Nn.programVariants.get(Hn);if(Pn===void 0)Pn=fo(Wt,Ue,cn),Nn.programVariants.set(Hn,Pn);else Nn.currentProgram=Pn,Nn.uniformsList=null,Nn.outputColorSpace=an,Nn.toneMapping=ln;return Pn}function qh(Wt){if(Wt.uniformsList===null){let Ue=Wt.currentProgram.getUniforms();Wt.uniformsList=Bo.seqWithValue(Ue.seq,Wt.uniforms)}return Wt.uniformsList}function Yh(Wt,Ue){let cn=Qn.get(Wt);cn.outputColorSpace=Ue.outputColorSpace,cn.batching=Ue.batching,cn.batchingColor=Ue.batchingColor,cn.instancing=Ue.instancing,cn.instancingColor=Ue.instancingColor,cn.instancingMorph=Ue.instancingMorph,cn.skinning=Ue.skinning,cn.morphTargets=Ue.morphTargets,cn.morphNormals=Ue.morphNormals,cn.morphColors=Ue.morphColors,cn.morphTargetsCount=Ue.morphTargetsCount,cn.numClippingPlanes=Ue.numClippingPlanes,cn.numIntersection=Ue.numClipIntersection,cn.vertexAlphas=Ue.vertexAlphas,cn.vertexTangents=Ue.vertexTangents,cn.toneMapping=Ue.toneMapping}function Tp(Wt,Ue,cn,an,ln){if(Ue.isScene!==!0)Ue=as;ni.resetTextureUnits();let Nn=Ue.fog,Hn=an.isMeshStandardMaterial||an.isMeshLambertMaterial||an.isMeshPhongMaterial?Ue.environment:null,Pn=rn===null?re.outputColorSpace:rn.isXRRenderTarget===!0?rn.texture.colorSpace:y.workingColorSpace,Bn=an.isMeshStandardMaterial||an.isMeshLambertMaterial&&!an.envMap||an.isMeshPhongMaterial&&!an.envMap,Xn=Zi.get(an.envMap||Hn,Bn),ii=an.vertexColors===!0&&!!cn.attributes.color&&cn.attributes.color.itemSize===4,li=!!cn.attributes.tangent&&(!!an.normalMap||an.anisotropy>0),Vn=!!cn.morphAttributes.position,ci=!!cn.morphAttributes.normal,Ui=!!cn.morphAttributes.color,Ri=Is;if(an.toneMapped){if(rn===null||rn.isXRRenderTarget===!0)Ri=re.toneMapping}let bi=cn.morphAttributes.position||cn.morphAttributes.normal||cn.morphAttributes.color,Ji=bi!==void 0?bi.length:0,Wn=Qn.get(an),is=Nt.state.lights;if(Ni===!0){if(os===!0||Wt!==mn){let Ii=Wt===mn&&an.id===wn;pn.setState(an,Wt,Ii)}}let pi=!1,hr=!1;if(an.version===Wn.__version){if(Wn.needsLights&&Wn.lightsStateVersion!==is.state.version)pi=!0;else if(ln.isBatchedMesh&&Wn.batching===!1)pi=!0;else if(!ln.isBatchedMesh&&Wn.batching===!0)pi=!0;else if(ln.isBatchedMesh&&Wn.batchingColor===!0&&ln._colorsTexture===null)pi=!0;else if(ln.isBatchedMesh&&Wn.batchingColor===!1&&ln._colorsTexture!==null)pi=!0;else if(ln.isInstancedMesh&&Wn.instancing===!1)pi=!0;else if(!ln.isInstancedMesh&&Wn.instancing===!0)pi=!0;else if(ln.isSkinnedMesh&&Wn.skinning===!1)pi=!0;else if(!ln.isSkinnedMesh&&Wn.skinning===!0)pi=!0;else if(ln.isInstancedMesh&&Wn.instancingColor===!0&&ln.instanceColor===null)pi=!0;else if(ln.isInstancedMesh&&Wn.instancingColor===!1&&ln.instanceColor!==null)pi=!0;else if(ln.isInstancedMesh&&Wn.instancingMorph===!0&&ln.morphTexture===null)pi=!0;else if(ln.isInstancedMesh&&Wn.instancingMorph===!1&&ln.morphTexture!==null)pi=!0;else if(Wn.envMap!==Xn)pi=!0;else if(an.fog===!0&&Wn.fog!==Nn)pi=!0;else if(Wn.numClippingPlanes!==void 0&&(Wn.numClippingPlanes!==pn.numPlanes||Wn.numIntersection!==pn.numIntersection))pi=!0;else if(Wn.vertexAlphas!==ii)pi=!0;else if(Wn.vertexTangents!==li)pi=!0;else if(Wn.morphTargets!==Vn)pi=!0;else if(Wn.morphNormals!==ci)pi=!0;else if(Wn.morphColors!==Ui)pi=!0;else if(Wn.morphTargetsCount!==Ji)pi=!0;else if(Wn.numLightProbeGrids!==Xh(Nt.state.lightProbeGridArray))pi=!0;else if(Wn.outputColorSpace!==Pn||Wn.toneMapping!==Ri)hr=!0}else pi=!0,Wn.__version=an.version;let $i=Wn.currentProgram;if(pi===!0||hr===!0){if($i=hr===!0?bp(an,Ue,ln,Pn,Ri):fo(an,Ue,ln),he&&an.isNodeMaterial)he.onUpdateProgram(an,$i,Wn)}let Ko=!1,Ys=!1,ur=!1,fi=$i.getUniforms(),Xi=Wn.uniforms;if(Un.useProgram($i.program))Ko=!0,Ys=!0,ur=!0;if(an.id!==wn)wn=an.id,Ys=!0;if(Ko||mn!==Wt){if(Un.buffers.depth.getReversed()&&Wt.reversedDepth!==!0)Wt._reversedDepth=!0,Wt.updateProjectionMatrix();fi.setValue(Ke,"projectionMatrix",Wt.projectionMatrix),fi.setValue(Ke,"viewMatrix",Wt.matrixWorldInverse);let Hi=fi.map.cameraPosition;if(Hi!==void 0)Hi.setValue(Ke,Di.setFromMatrixPosition(Wt.matrixWorld));if(Gi.logarithmicDepthBuffer)fi.setValue(Ke,"logDepthBufFC",2/(Math.log(Wt.far+1)/Math.LN2));if(an.isMeshPhongMaterial||an.isMeshToonMaterial||an.isMeshLambertMaterial||an.isMeshBasicMaterial||an.isMeshStandardMaterial||an.isShaderMaterial)fi.setValue(Ke,"isOrthographic",Wt.isOrthographicCamera===!0);if(mn!==Wt)mn=Wt,Ys=!0,ur=!0}if(Wn.needsLights){if(is.state.sunShadowMap.length>0)fi.setValue(Ke,"sunShadowMap",is.state.sunShadowMap,ni);if(is.state.directionalShadowMap.length>0)fi.setValue(Ke,"directionalShadowMap",is.state.directionalShadowMap,ni);if(is.state.spotShadowMap.length>0)fi.setValue(Ke,"spotShadowMap",is.state.spotShadowMap,ni);if(is.state.pointShadowMap.length>0)fi.setValue(Ke,"pointShadowMap",is.state.pointShadowMap,ni)}if(ln.isSkinnedMesh){fi.setOptional(Ke,ln,"bindMatrix"),fi.setOptional(Ke,ln,"bindMatrixInverse");let Ii=ln.skeleton;if(Ii){if(Ii.boneTexture===null)Ii.computeBoneTexture();fi.setValue(Ke,"boneTexture",Ii.boneTexture,ni)}}if(ln.isBatchedMesh){if(fi.setOptional(Ke,ln,"batchingTexture"),fi.setValue(Ke,"batchingTexture",ln._matricesTexture,ni),fi.setOptional(Ke,ln,"batchingIdTexture"),fi.setValue(Ke,"batchingIdTexture",ln._indirectTexture,ni),fi.setOptional(Ke,ln,"batchingColorTexture"),ln._colorsTexture!==null)fi.setValue(Ke,"batchingColorTexture",ln._colorsTexture,ni)}let ys=cn.morphAttributes;if(ys.position!==void 0||ys.normal!==void 0||ys.color!==void 0)Ne.update(ln,cn,$i);if(Ys||Wn.receiveShadow!==ln.receiveShadow)Wn.receiveShadow=ln.receiveShadow,fi.setValue(Ke,"receiveShadow",ln.receiveShadow);if((an.isMeshStandardMaterial||an.isMeshLambertMaterial||an.isMeshPhongMaterial)&&an.envMap===null&&Ue.environment!==null)Xi.envMapIntensity.value=Ue.environmentIntensity;if(Xi.dfgLUT!==void 0)Xi.dfgLUT.value=My();if(Ys){if(fi.setValue(Ke,"toneMappingExposure",re.toneMappingExposure),Wn.needsLights)Ap(Xi,ur);if(Nn&&an.fog===!0)Mn.refreshFogUniforms(Xi,Nn);if(Mn.refreshMaterialUniforms(Xi,an,Kn,Jn,Nt.state.transmissionRenderTarget[Wt.id]),Wn.needsLights&&Wn.numLightProbeGrids>0){let Ii=Pt,Hi=0;for(let Os of Nt.state.lightProbeGridArray){if(Os.texture===null)continue;Ii.textures[Hi]=Os.texture,Ii.min[Hi]=Os.boundingBox.min,Ii.max[Hi]=Os.boundingBox.max,Ii.resolution[Hi]=Os.resolution,Hi++}for(let Os in Ii)Ii[Os].length=Hi;Xi.probesSH.value=Ii.textures,Xi.probesMin.value=Ii.min,Xi.probesMax.value=Ii.max,Xi.probesResolution.value=Ii.resolution}Bo.upload(Ke,qh(Wn),Xi,ni)}if(an.isShaderMaterial&&an.uniformsNeedUpdate===!0)Bo.upload(Ke,qh(Wn),Xi,ni),an.uniformsNeedUpdate=!1;if(an.isSpriteMaterial)fi.setValue(Ke,"center",ln.center);if(fi.setValue(Ke,"modelViewMatrix",ln.modelViewMatrix),fi.setValue(Ke,"normalMatrix",ln.normalMatrix),fi.setValue(Ke,"modelMatrix",ln.matrixWorld),an.uniformsGroups!==void 0){let Ii=an.uniformsGroups;for(let Hi=0,Os=Ii.length;Hi<Os;Hi++){let Jh=Ii[Hi];Dn.update(Jh,$i),Dn.bind(Jh,$i)}}return $i}function Ap(Wt,Ue){Wt.ambientLightColor.needsUpdate=Ue,Wt.lightProbe.needsUpdate=Ue,Wt.sunLights.needsUpdate=Ue,Wt.sunLightShadows.needsUpdate=Ue,Wt.directionalLights.needsUpdate=Ue,Wt.directionalLightShadows.needsUpdate=Ue,Wt.pointLights.needsUpdate=Ue,Wt.pointLightShadows.needsUpdate=Ue,Wt.spotLights.needsUpdate=Ue,Wt.spotLightShadows.needsUpdate=Ue,Wt.rectAreaLights.needsUpdate=Ue,Wt.hemisphereLights.needsUpdate=Ue}function Ep(Wt){return Wt.isMeshLambertMaterial||Wt.isMeshToonMaterial||Wt.isMeshPhongMaterial||Wt.isMeshStandardMaterial||Wt.isShadowMaterial||Wt.isShaderMaterial&&Wt.lights===!0}this.getActiveCubeFace=function(){return sn},this.getActiveMipmapLevel=function(){return un},this.getRenderTarget=function(){return rn},this.setRenderTargetTextures=function(Wt,Ue,cn){let an=Qn.get(Wt);if(an.__autoAllocateDepthBuffer=Wt.resolveDepthBuffer===!1,an.__autoAllocateDepthBuffer===!1)an.__useRenderToTexture=!1;Qn.get(Wt.texture).__webglTexture=Ue,Qn.get(Wt.depthTexture).__webglTexture=an.__autoAllocateDepthBuffer?void 0:cn,an.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(Wt,Ue){let cn=Qn.get(Wt);cn.__webglFramebuffer=Ue,cn.__useDefaultFramebuffer=Ue===void 0},this.setRenderTarget=function(Wt,Ue=0,cn=0){rn=Wt,sn=Ue,un=cn;let an=null,ln=!1,Nn=!1;if(Wt){let Pn=Qn.get(Wt);if(Pn.__useDefaultFramebuffer!==void 0){Un.bindFramebuffer(Ke.FRAMEBUFFER,Pn.__webglFramebuffer),Sn.copy(Wt.viewport),Tn.copy(Wt.scissor),Gn=Wt.scissorTest,Un.viewport(Sn),Un.scissor(Tn),Un.setScissorTest(Gn),wn=-1;return}else if(Pn.__webglFramebuffer===void 0)ni.setupRenderTarget(Wt);else if(Pn.__hasExternalTextures)ni.rebindTextures(Wt,Qn.get(Wt.texture).__webglTexture,Qn.get(Wt.depthTexture).__webglTexture);else if(Wt.depthBuffer){let ii=Wt.depthTexture;if(Pn.__boundDepthTexture!==ii){if(ii!==null&&Qn.has(ii)&&(Wt.width!==ii.image.width||Wt.height!==ii.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ni.setupDepthRenderbuffer(Wt)}}let Bn=Wt.texture;if(Bn.isData3DTexture||Bn.isDataArrayTexture||Bn.isCompressedArrayTexture)Nn=!0;let Xn=Qn.get(Wt).__webglFramebuffer;if(Wt.isWebGLCubeRenderTarget){if(Array.isArray(Xn[Ue]))an=Xn[Ue][cn];else an=Xn[Ue];ln=!0}else if(Wt.samples>0&&ni.useMultisampledRTT(Wt)===!1)an=Qn.get(Wt).__webglMultisampledFramebuffer;else if(Array.isArray(Xn))an=Xn[cn];else an=Xn;Sn.copy(Wt.viewport),Tn.copy(Wt.scissor),Gn=Wt.scissorTest}else Sn.copy(oi).multiplyScalar(Kn).floor(),Tn.copy(si).multiplyScalar(Kn).floor(),Gn=xi;if(cn!==0)an=Pe;if(Un.bindFramebuffer(Ke.FRAMEBUFFER,an))Un.drawBuffers(Wt,an);if(Un.viewport(Sn),Un.scissor(Tn),Un.setScissorTest(Gn),ln){let Pn=Qn.get(Wt.texture);Ke.framebufferTexture2D(Ke.FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Ke.TEXTURE_CUBE_MAP_POSITIVE_X+Ue,Pn.__webglTexture,cn)}else if(Nn){let Pn=Ue;for(let Bn=0;Bn<Wt.textures.length;Bn++){let Xn=Qn.get(Wt.textures[Bn]);Ke.framebufferTextureLayer(Ke.FRAMEBUFFER,Ke.COLOR_ATTACHMENT0+Bn,Xn.__webglTexture,cn,Pn)}}else if(Wt!==null&&cn!==0){let Pn=Qn.get(Wt.texture);Ke.framebufferTexture2D(Ke.FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Ke.TEXTURE_2D,Pn.__webglTexture,cn)}wn=-1};function Zh(Wt){let Ue=Qn.get(Wt);if(Ue.__readFormat!==Wt.format||Ue.__readType!==Wt.type)Ue.__readFormat=Wt.format,Ue.__readType=Wt.type,Ue.__formatReadable=Gi.textureFormatReadable(Wt.format),Ue.__typeReadable=Gi.textureTypeReadable(Wt.type);return Ue}if(this.readRenderTargetPixels=function(Wt,Ue,cn,an,ln,Nn,Hn,Pn=0){if(!(Wt&&Wt.isWebGLRenderTarget)){jn("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Bn=Qn.get(Wt).__webglFramebuffer;if(Wt.isWebGLCubeRenderTarget&&Hn!==void 0){if(Bn=Bn[Hn],Array.isArray(Bn))Bn=Bn[0]}if(Bn){Un.bindFramebuffer(Ke.FRAMEBUFFER,Bn);try{let Xn=Wt.textures[Pn],{format:ii,type:li}=Xn;if(Wt.textures.length>1)Ke.readBuffer(Ke.COLOR_ATTACHMENT0+Pn);let Vn=Zh(Xn);if(Vn.__formatReadable===!1){jn("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Vn.__typeReadable===!1){jn("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(Ue>=0&&Ue<=Wt.width-an&&(cn>=0&&cn<=Wt.height-ln))Ke.readPixels(Ue,cn,an,ln,En.convert(ii),En.convert(li),Nn)}finally{let Xn=rn!==null?Qn.get(rn).__webglFramebuffer:null;Un.bindFramebuffer(Ke.FRAMEBUFFER,Xn)}}},this.readRenderTargetPixelsAsync=async function(Wt,Ue,cn,an,ln,Nn,Hn,Pn=0){if(!(Wt&&Wt.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Bn=Qn.get(Wt).__webglFramebuffer;if(Wt.isWebGLCubeRenderTarget&&Hn!==void 0){if(Bn=Bn[Hn],Array.isArray(Bn))Bn=Bn[0]}if(Bn)if(Ue>=0&&Ue<=Wt.width-an&&(cn>=0&&cn<=Wt.height-ln)){Un.bindFramebuffer(Ke.FRAMEBUFFER,Bn);let Xn=Wt.textures[Pn],{format:ii,type:li}=Xn;if(Wt.textures.length>1)Ke.readBuffer(Ke.COLOR_ATTACHMENT0+Pn);let Vn=Zh(Xn);if(Vn.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Vn.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ci=Ke.createBuffer();Ke.bindBuffer(Ke.PIXEL_PACK_BUFFER,ci),Ke.bufferData(Ke.PIXEL_PACK_BUFFER,Nn.byteLength,Ke.STREAM_READ),Ke.readPixels(Ue,cn,an,ln,En.convert(ii),En.convert(li),0),Ke.bindBuffer(Ke.PIXEL_PACK_BUFFER,null);let Ui=rn!==null?Qn.get(rn).__webglFramebuffer:null;Un.bindFramebuffer(Ke.FRAMEBUFFER,Ui);let Ri=Ke.fenceSync(Ke.SYNC_GPU_COMMANDS_COMPLETE,0);return Ke.flush(),await Df(Ke,Ri,4),Ke.bindBuffer(Ke.PIXEL_PACK_BUFFER,ci),Ke.getBufferSubData(Ke.PIXEL_PACK_BUFFER,0,Nn),Ke.bindBuffer(Ke.PIXEL_PACK_BUFFER,null),Ke.deleteBuffer(ci),Ke.deleteSync(Ri),Nn}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(Wt,Ue=null,cn=0){let an=Math.pow(2,-cn),ln=Math.floor(Wt.image.width*an),Nn=Math.floor(Wt.image.height*an),Hn=Ue!==null?Ue.x:0,Pn=Ue!==null?Ue.y:0;ni.setTexture2D(Wt,0),Ke.copyTexSubImage2D(Ke.TEXTURE_2D,cn,0,0,Hn,Pn,ln,Nn),Un.unbindTexture()},this.copyTextureToTexture=function(Wt,Ue,cn=null,an=null,ln=0,Nn=0){let Hn,Pn,Bn,Xn,ii,li,Vn,ci,Ui,Ri=Wt.isCompressedTexture?Wt.mipmaps[Nn]:Wt.image;if(cn!==null)Hn=cn.max.x-cn.min.x,Pn=cn.max.y-cn.min.y,Bn=cn.isBox3?cn.max.z-cn.min.z:1,Xn=cn.min.x,ii=cn.min.y,li=cn.isBox3?cn.min.z:0;else{let fi=Math.pow(2,-ln);if(Hn=Math.floor(Ri.width*fi),Pn=Math.floor(Ri.height*fi),Wt.isDataArrayTexture)Bn=Ri.depth;else if(Wt.isData3DTexture)Bn=Math.floor(Ri.depth*fi);else Bn=1;Xn=0,ii=0,li=0}if(an!==null)Vn=an.x,ci=an.y,Ui=an.z;else Vn=0,ci=0,Ui=0;let bi=En.convert(Ue.format),Ji=En.convert(Ue.type),Wn;if(Ue.isData3DTexture)ni.setTexture3D(Ue,0),Wn=Ke.TEXTURE_3D;else if(Ue.isDataArrayTexture||Ue.isCompressedArrayTexture)ni.setTexture2DArray(Ue,0),Wn=Ke.TEXTURE_2D_ARRAY;else ni.setTexture2D(Ue,0),Wn=Ke.TEXTURE_2D;Un.activeTexture(Ke.TEXTURE0),Un.pixelStorei(Ke.UNPACK_FLIP_Y_WEBGL,Ue.flipY),Un.pixelStorei(Ke.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Ue.premultiplyAlpha),Un.pixelStorei(Ke.UNPACK_ALIGNMENT,Ue.unpackAlignment);let is=Un.getParameter(Ke.UNPACK_ROW_LENGTH),pi=Un.getParameter(Ke.UNPACK_IMAGE_HEIGHT),hr=Un.getParameter(Ke.UNPACK_SKIP_PIXELS),$i=Un.getParameter(Ke.UNPACK_SKIP_ROWS),Ko=Un.getParameter(Ke.UNPACK_SKIP_IMAGES);Un.pixelStorei(Ke.UNPACK_ROW_LENGTH,Ri.width),Un.pixelStorei(Ke.UNPACK_IMAGE_HEIGHT,Ri.height),Un.pixelStorei(Ke.UNPACK_SKIP_PIXELS,Xn),Un.pixelStorei(Ke.UNPACK_SKIP_ROWS,ii),Un.pixelStorei(Ke.UNPACK_SKIP_IMAGES,li);let Ys=Wt.isDataArrayTexture||Wt.isData3DTexture,ur=Ue.isDataArrayTexture||Ue.isData3DTexture;if(Wt.isDepthTexture){let fi=Qn.get(Wt),Xi=Qn.get(Ue),ys=Qn.get(fi.__renderTarget),Ii=Qn.get(Xi.__renderTarget);Un.bindFramebuffer(Ke.READ_FRAMEBUFFER,ys.__webglFramebuffer),Un.bindFramebuffer(Ke.DRAW_FRAMEBUFFER,Ii.__webglFramebuffer);for(let Hi=0;Hi<Bn;Hi++){if(Ys)Ke.framebufferTextureLayer(Ke.READ_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Qn.get(Wt).__webglTexture,ln,li+Hi),Ke.framebufferTextureLayer(Ke.DRAW_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Qn.get(Ue).__webglTexture,Nn,Ui+Hi);Ke.blitFramebuffer(Xn,ii,Xn+Hn,ii+Pn,Vn,ci,Vn+Hn,ci+Pn,Ke.DEPTH_BUFFER_BIT,Ke.NEAREST)}Un.bindFramebuffer(Ke.READ_FRAMEBUFFER,null),Un.bindFramebuffer(Ke.DRAW_FRAMEBUFFER,null)}else if(ln!==0||Wt.isRenderTargetTexture||Qn.has(Wt)){let fi=Qn.get(Wt),Xi=Qn.get(Ue);Un.bindFramebuffer(Ke.READ_FRAMEBUFFER,$e),Un.bindFramebuffer(Ke.DRAW_FRAMEBUFFER,fe);for(let ys=0;ys<Bn;ys++){if(Ys)Ke.framebufferTextureLayer(Ke.READ_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,fi.__webglTexture,ln,li+ys);else Ke.framebufferTexture2D(Ke.READ_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Ke.TEXTURE_2D,fi.__webglTexture,ln);if(ur)Ke.framebufferTextureLayer(Ke.DRAW_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Xi.__webglTexture,Nn,Ui+ys);else Ke.framebufferTexture2D(Ke.DRAW_FRAMEBUFFER,Ke.COLOR_ATTACHMENT0,Ke.TEXTURE_2D,Xi.__webglTexture,Nn);if(ln!==0)Ke.blitFramebuffer(Xn,ii,Xn+Hn,ii+Pn,Vn,ci,Vn+Hn,ci+Pn,Ke.COLOR_BUFFER_BIT,Ke.NEAREST);else if(ur)Ke.copyTexSubImage3D(Wn,Nn,Vn,ci,Ui+ys,Xn,ii,Hn,Pn);else Ke.copyTexSubImage2D(Wn,Nn,Vn,ci,Xn,ii,Hn,Pn)}Un.bindFramebuffer(Ke.READ_FRAMEBUFFER,null),Un.bindFramebuffer(Ke.DRAW_FRAMEBUFFER,null)}else if(ur)if(Wt.isDataTexture||Wt.isData3DTexture)Ke.texSubImage3D(Wn,Nn,Vn,ci,Ui,Hn,Pn,Bn,bi,Ji,Ri.data);else if(Ue.isCompressedArrayTexture)Ke.compressedTexSubImage3D(Wn,Nn,Vn,ci,Ui,Hn,Pn,Bn,bi,Ri.data);else Ke.texSubImage3D(Wn,Nn,Vn,ci,Ui,Hn,Pn,Bn,bi,Ji,Ri);else if(Wt.isDataTexture)Ke.texSubImage2D(Ke.TEXTURE_2D,Nn,Vn,ci,Hn,Pn,bi,Ji,Ri.data);else if(Wt.isCompressedTexture)Ke.compressedTexSubImage2D(Ke.TEXTURE_2D,Nn,Vn,ci,Ri.width,Ri.height,bi,Ri.data);else Ke.texSubImage2D(Ke.TEXTURE_2D,Nn,Vn,ci,Hn,Pn,bi,Ji,Ri);if(Un.pixelStorei(Ke.UNPACK_ROW_LENGTH,is),Un.pixelStorei(Ke.UNPACK_IMAGE_HEIGHT,pi),Un.pixelStorei(Ke.UNPACK_SKIP_PIXELS,hr),Un.pixelStorei(Ke.UNPACK_SKIP_ROWS,$i),Un.pixelStorei(Ke.UNPACK_SKIP_IMAGES,Ko),Nn===0&&Ue.generateMipmaps===!0&&Ue.mipmapsAutoUpdate===!0)Ke.generateMipmap(Wn);Un.unbindTexture()},this.initRenderTarget=function(Wt){if(Qn.get(Wt).__webglFramebuffer===void 0)ni.setupRenderTarget(Wt)},this.initTexture=function(Wt){if(Wt.isCubeTexture)ni.setTextureCube(Wt,0);else if(Wt.isData3DTexture)ni.setTexture3D(Wt,0);else if(Wt.isDataArrayTexture||Wt.isCompressedArrayTexture)ni.setTexture2DArray(Wt,0);else ni.setTexture2D(Wt,0);Un.unbindTexture()},this.resetState=function(){sn=0,un=0,rn=null,Un.reset(),Rn.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Wc}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=y._getDrawingBufferColorSpace(t),e.unpackColorSpace=y._getUnpackColorSpace()}}var Pd=0,Ld=1,Nd=2;var gh=2;var Ja=1.25,_h=1,Wi=32,Si=8,$a=65535;var Kr=Math.pow(2,-24),Go=Symbol("SKIP_GENERATION"),Ka={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Go]:!1};function Ai(t,e,i){return i.min.x=e[t],i.min.y=e[t+1],i.min.z=e[t+2],i.max.x=e[t+3],i.max.y=e[t+4],i.max.z=e[t+5],i}function ko(t){let e=-1,i=-1/0;for(let s=0;s<3;s++){let r=t[s+3]-t[s];if(r>i)i=r,e=s}return e}function xh(t,e,i){for(let s=0;s<3;s++){let r=e[t+2*s],a=e[t+2*s+1],u=r-a,f=r+a;if(u<i[s])i[s]=u;if(f>i[s+3])i[s+3]=f}}function Qa(t){let e=t[3]-t[0],i=t[4]-t[1],s=t[5]-t[2];return 2*(e*i+i*s+s*e)}function ui(t,e){return e[t+15]===$a}function _i(t,e){return e[t+6]}function Mi(t,e){return e[t+14]}function mi(t){return t+Si}function gi(t,e){let i=e[t+6];return t+i*Si}function Qr(t,e){return e[t+7]}function Ci(t){return t}function ja(t,e,i,s,r){let a=1/0,u=1/0,f=1/0,x=-1/0,A=-1/0,L=-1/0,D=1/0,R=1/0,V=1/0,rt=-1/0,Ct=-1/0,j=-1/0,it=t.offset||0;for(let ft=(e-it)*6,Pt=(e+i-it)*6;ft<Pt;ft+=6){let pt=t[ft+0],Nt=t[ft+1],se=pt-Nt,nt=pt+Nt;if(se<a)a=se;if(nt>x)x=nt;if(pt<D)D=pt;if(pt>rt)rt=pt;let Rt=t[ft+2],re=t[ft+3],be=Rt-re,he=Rt+re;if(be<u)u=be;if(he>A)A=he;if(Rt<R)R=Rt;if(Rt>Ct)Ct=Rt;let Pe=t[ft+4],$e=t[ft+5],fe=Pe-$e,sn=Pe+$e;if(fe<f)f=fe;if(sn>L)L=sn;if(Pe<V)V=Pe;if(Pe>j)j=Pe}s[0]=a,s[1]=u,s[2]=f,s[3]=x,s[4]=A,s[5]=L,r[0]=D,r[1]=R,r[2]=V,r[3]=rt,r[4]=Ct,r[5]=j}var Us=8,vh=8,yh=new Int32Array(Us),Ds=new Float32Array(Us*6),jr=new Float32Array(Us*6),As=new Float32Array(6),tl=new Float32Array(6),rr=new Int32Array(vh),Dd=new Float32Array(vh*6);function Ty(t,e,i,s){for(let r=0;r<3;r++){let a=e[t+2*r],u=e[t+2*r+1],f=a-u,x=a+u;if(f<i[s+r])i[s+r]=f;if(x>i[s+r+3])i[s+r+3]=x}}function Ud(t,e){let i=t[e+3]-t[e],s=t[e+4]-t[e+1],r=t[e+5]-t[e+2];return 2*(i*s+s*r+r*i)}function Fd(t,e,i,s,r,a){let u=-1,f=0;if(a===Pd){if(u=ko(e),u!==-1)f=(e[u]+e[u+3])/2}else if(a===Ld){if(u=ko(t),u!==-1)f=Ay(i,s,r,u)}else if(a===Nd){let x=Qa(t),A=Ja*r,L=i.offset||0,D=(s-L)*6,R=(s+r-L)*6;for(let V=0;V<3;V++){let rt=e[V],it=(e[V+3]-rt)/Us;if(r<vh){for(let ft=0;ft<r;ft++){let Pt=D+ft*6,pt=i[Pt+2*V],Nt=ft;while(Nt>0&&i[rr[Nt-1]+2*V]>pt)rr[Nt]=rr[Nt-1],Nt--;rr[Nt]=Pt}for(let ft=0;ft<3;ft++)As[ft]=1/0,As[ft+3]=-1/0,tl[ft]=1/0,tl[ft+3]=-1/0;for(let ft=r-1;ft>=0;ft--)xh(rr[ft],i,tl),Dd.set(tl,ft*6);for(let ft=0;ft<r-1;ft++){xh(rr[ft],i,As);let Pt=i[rr[ft+1]+2*V];if(i[rr[ft]+2*V]===Pt)continue;let pt=ft+1,Nt=r-pt,se=Qa(As)/x,nt=Ud(Dd,pt*6)/x,Rt=_h+Ja*(se*pt+nt*Nt);if(Rt<A)u=V,A=Rt,f=Pt}}else{for(let pt=0;pt<Us;pt++){yh[pt]=0;for(let Nt=0;Nt<3;Nt++)Ds[pt*6+Nt]=1/0,Ds[pt*6+Nt+3]=-1/0}for(let pt=D;pt<R;pt+=6){let nt=~~((i[pt+2*V]-rt)/it);if(nt>=Us)nt=Us-1;yh[nt]++,Ty(pt,i,Ds,nt*6)}let ft=(Us-1)*6;for(let pt=0;pt<6;pt++)jr[ft+pt]=Ds[ft+pt];for(let pt=Us-2;pt>=0;pt--){let Nt=pt*6,se=Nt+6;for(let nt=0;nt<3;nt++)jr[Nt+nt]=Math.min(Ds[Nt+nt],jr[se+nt]),jr[Nt+nt+3]=Math.max(Ds[Nt+nt+3],jr[se+nt+3])}let Pt=0;for(let pt=0;pt<Us-1;pt++){let Nt=pt*6,se=yh[pt];if(se!==0)for(let he=0;he<3;he++)if(Pt===0)As[he]=Ds[Nt+he],As[he+3]=Ds[Nt+he+3];else As[he]=Math.min(As[he],Ds[Nt+he]),As[he+3]=Math.max(As[he+3],Ds[Nt+he+3]);Pt+=se;let nt=0,Rt=0;if(Pt!==0)nt=Qa(As)/x;let re=r-Pt;if(re!==0)Rt=Ud(jr,Nt+6)/x;let be=_h+Ja*(nt*Pt+Rt*re);if(be<A)u=V,A=be,f=rt+it+pt*it}}}}else console.warn(`BVH: Invalid build strategy value ${a} used.`);return{axis:u,pos:f}}function Ay(t,e,i,s){let r=0,a=t.offset;for(let u=e,f=e+i;u<f;u++)r+=t[(u-a)*6+s*2];return r/i}function Od(t,e,i,s,r,a){let u=s,f=s+r-1,x=a.pos,A=a.axis*2,L=i.offset||0;while(!0){while(u<=f&&i[(u-L)*6+A]<x)u++;while(u<=f&&i[(f-L)*6+A]>=x)f--;if(u<f){for(let D=0;D<e;D++){let R=t[u*e+D];t[u*e+D]=t[f*e+D],t[f*e+D]=R}for(let D=0;D<6;D++){let R=u-L,V=f-L,rt=i[R*6+D];i[R*6+D]=i[V*6+D],i[V*6+D]=rt}u++,f--}else return u}}var Ey=Math.pow(2,32),to=new Float32Array(6),el=new Float32Array(6);function wy(t,e,i,s,r,a){let{maxDepth:u,verbose:f,targetLeafSize:x,_strictLeafSize:A=1/0,strategy:L,onProgress:D,useSharedArrayBuffer:R=!1}=r,{primitiveBuffer:V,primitiveBufferStride:rt}=t,j=new(R?SharedArrayBuffer:ArrayBuffer)(Wi*Math.max(1,2*Math.ceil(s)-1)),it=new Float32Array(j),ft=new Uint32Array(j),Pt=new Uint16Array(j),pt=0,Nt=!1;return ja(e,i,s,to,el),Rt(i,s,0),j.slice(0,pt*Wi);function se(re){if(D)D((re-a.offset)/a.count)}function nt(re,be,he){let Pe=re*2;ft[re+6]=be,Pt[Pe+14]=he,Pt[Pe+15]=$a,se(be+he)}function Rt(re,be,he){let Pe=pt++,$e=Pe*Si;if(it.set(to,$e),!Nt&&he>=u){if(Nt=!0,f)console.warn(`BVH: Max depth of ${u} reached when generating BVH. Consider increasing maxDepth.`)}let fe=be>A;if(be<=x&&!fe||he>=u){nt($e,re,be);return}let sn=Fd(to,el,e,re,be,L),un=sn.axis===-1?-1:Od(V,rt,e,re,be,sn);if(sn.axis===-1||un===re||un===re+be){if(!fe){nt($e,re,be);return}sn.axis=Math.max(0,ko(to)),un=re+Math.max(1,Math.floor(be/2))}ft[$e+7]=sn.axis;let rn=un-re;ja(e,re,rn,to,el),Rt(re,rn,he+1);let wn=pt-Pe;if(wn>Ey)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");ft[$e+6]=wn;let mn=be-rn;ja(e,un,mn,to,el),Rt(un,mn,he+1)}}function Bd(t,e){let i=t.getRootRanges(e.range),s=i[0],r=i[i.length-1],a={offset:s.offset,count:r.offset+r.count-s.offset},u=new Float32Array(6*a.count);u.offset=a.offset,t.computePrimitiveBounds(a.offset,a.count,u),t._roots=i.map((f)=>wy(t,u,f.offset,f.count,e,a))}class Tr{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;if(t.length===0)return this._getNewPrimitive();else return t.pop()}releasePrimitive(t){this._primitives.push(t)}}class zd{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=(i)=>{if(e)t.push(e);e=i,this.float32Array=new Float32Array(i),this.uint16Array=new Uint16Array(i),this.uint32Array=new Uint32Array(i)},this.clearBuffer=()=>{if(e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0)this.setBuffer(t.pop())}}}var ai=new zd;var or,no,eo=[],nl=new Tr(()=>new p);function Gd(t,e,i,s,r,a){or=nl.getPrimitive(),no=nl.getPrimitive(),eo.push(or,no),ai.setBuffer(t._roots[e]);let u=Sh(0,t.geometry,i,s,r,a);ai.clearBuffer(),nl.releasePrimitive(or),nl.releasePrimitive(no),eo.pop(),eo.pop();let f=eo.length;if(f>0)no=eo[f-1],or=eo[f-2];return u}function Sh(t,e,i,s,r=null,a=0,u=0){let{float32Array:f,uint16Array:x,uint32Array:A}=ai,L=t*2;if(ui(L,x)){let R=_i(t,A),V=Mi(L,x);return Ai(Ci(t),f,or),s(R,V,!1,u,a+t/Si,or)}else{let be=function(Pe){let{uint16Array:$e,uint32Array:fe}=ai,sn=Pe*2;while(!ui(sn,$e))Pe=mi(Pe),sn=Pe*2;return _i(Pe,fe)},he=function(Pe){let{uint16Array:$e,uint32Array:fe}=ai,sn=Pe*2;while(!ui(sn,$e))Pe=gi(Pe,fe),sn=Pe*2;return _i(Pe,fe)+Mi(sn,$e)},R=mi(t),V=gi(t,A),rt=R,Ct=V,j,it,ft,Pt;if(r){if(ft=or,Pt=no,Ai(Ci(rt),f,ft),Ai(Ci(Ct),f,Pt),j=r(ft),it=r(Pt),it<j){rt=V,Ct=R;let Pe=j;j=it,it=Pe,ft=Pt}}if(!ft)ft=or,Ai(Ci(rt),f,ft);let pt=ui(rt*2,x),Nt=i(ft,pt,j,u+1,a+rt/Si),se;if(Nt===gh){let Pe=be(rt),fe=he(rt)-Pe;se=s(Pe,fe,!0,u+1,a+rt/Si,ft)}else se=Nt&&Sh(rt,e,i,s,r,a,u+1);if(se)return!0;Pt=no,Ai(Ci(Ct),f,Pt);let nt=ui(Ct*2,x),Rt=i(Pt,nt,it,u+1,a+Ct/Si),re;if(Rt===gh){let Pe=be(Ct),fe=he(Ct)-Pe;re=s(Pe,fe,!0,u+1,a+Ct/Si,Pt)}else re=Rt&&Sh(Ct,e,i,s,r,a,u+1);if(re)return!0;return!1}}var Ho=new ai.constructor,il=new ai.constructor,ar=new Tr(()=>new p),io=new p,so=new p,Mh=new p,bh=new p,Th=!1;function kd(t,e,i,s){if(Th)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");Th=!0;let r=t._roots,a=e._roots,u,f=0,x=0,A=new o().copy(i).invert();for(let L=0,D=r.length;L<D;L++){Ho.setBuffer(r[L]),x=0;let R=ar.getPrimitive();Ai(Ci(0),Ho.float32Array,R),R.applyMatrix4(A);for(let V=0,rt=a.length;V<rt;V++)if(il.setBuffer(a[V]),u=Es(0,0,i,A,s,f,x,0,0,R),il.clearBuffer(),x+=a[V].byteLength/Wi,u)break;if(ar.releasePrimitive(R),Ho.clearBuffer(),f+=r[L].byteLength/Wi,u)break}return Th=!1,u}function Es(t,e,i,s,r,a=0,u=0,f=0,x=0,A=null,L=!1){let D,R;if(L)D=il,R=Ho;else D=Ho,R=il;let V=D.float32Array,rt=D.uint32Array,Ct=D.uint16Array,j=R.float32Array,it=R.uint32Array,ft=R.uint16Array,Pt=t*2,pt=e*2,Nt=ui(Pt,Ct),se=ui(pt,ft),nt=!1;if(se&&Nt)if(L)nt=r(_i(e,it),Mi(e*2,ft),_i(t,rt),Mi(t*2,Ct),x,u+e/Si,f,a+t/Si);else nt=r(_i(t,rt),Mi(t*2,Ct),_i(e,it),Mi(e*2,ft),f,a+t/Si,x,u+e/Si);else if(se){let Rt=ar.getPrimitive();Ai(Ci(e),j,Rt),Rt.applyMatrix4(i);let re=mi(t),be=gi(t,rt);Ai(Ci(re),V,io),Ai(Ci(be),V,so);let he=Rt.intersectsBox(io),Pe=Rt.intersectsBox(so);nt=he&&Es(e,re,s,i,r,u,a,x,f+1,Rt,!L)||Pe&&Es(e,be,s,i,r,u,a,x,f+1,Rt,!L),ar.releasePrimitive(Rt)}else{let Rt=mi(e),re=gi(e,it);Ai(Ci(Rt),j,Mh),Ai(Ci(re),j,bh);let be=A.intersectsBox(Mh),he=A.intersectsBox(bh);if(be&&he)nt=Es(t,Rt,i,s,r,a,u,f,x+1,A,L)||Es(t,re,i,s,r,a,u,f,x+1,A,L);else if(be)if(Nt)nt=Es(t,Rt,i,s,r,a,u,f,x+1,A,L);else{let Pe=ar.getPrimitive();Pe.copy(Mh).applyMatrix4(i);let $e=mi(t),fe=gi(t,rt);Ai(Ci($e),V,io),Ai(Ci(fe),V,so);let sn=Pe.intersectsBox(io),un=Pe.intersectsBox(so);nt=sn&&Es(Rt,$e,s,i,r,u,a,x,f+1,Pe,!L)||un&&Es(Rt,fe,s,i,r,u,a,x,f+1,Pe,!L),ar.releasePrimitive(Pe)}else if(he)if(Nt)nt=Es(t,re,i,s,r,a,u,f,x+1,A,L);else{let Pe=ar.getPrimitive();Pe.copy(bh).applyMatrix4(i);let $e=mi(t),fe=gi(t,rt);Ai(Ci($e),V,io),Ai(Ci(fe),V,so);let sn=Pe.intersectsBox(io),un=Pe.intersectsBox(so);nt=sn&&Es(re,$e,s,i,r,u,a,x,f+1,Pe,!L)||un&&Es(re,fe,s,i,r,u,a,x,f+1,Pe,!L),ar.releasePrimitive(Pe)}}return nt}var sl=new class{constructor(){let t=null,e=null,i=null,s=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(a,u)=>{if(s)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=u,this.buffer=t=a._roots[u],this.uint16Array=i=new Uint16Array(t),this.uint32Array=e=new Uint32Array(t)},this.reset=()=>{this.root=null,this.buffer=t=null,this.uint16Array=i=null,this.uint32Array=e=null},this.getRangeStart=(a)=>{let u=a*2;while(!ui(u,i))a=mi(a),u=a*2;return _i(a,e)},this.getRangeEnd=(a)=>{let u=a*2;while(!ui(u,i))a=gi(a,e),u=a*2;return _i(a,e)+Mi(u,i)};let r=(a,u,f)=>{let x=u*2,A=ui(x,i);if(!a(f,A,u)&&!A){let D=mi(u),R=gi(u,e);r(a,D,f+1),r(a,R,f+1)}};this.traverseBuffer=(a)=>{if(s)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");s=!0;try{r(a,0,0)}finally{s=!1}},this.traverse=(a)=>{this.traverseBuffer((u,f,x)=>{if(f){let A=x*2,L=e[x+6],D=i[A+14];return a(u,f,new Float32Array(t,x*4,6),L,D)}else{let A=Qr(x,e);return a(u,f,new Float32Array(t,x*4,6),A)}})}}};var Hd=new p,ro=new Float32Array(6);class Ah{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){if(t={...Ka,...t},"maxLeafSize"in t)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize};Bd(this,t)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,i,s){let r=1/0,a=1/0,u=1/0,f=-1/0,x=-1/0,A=-1/0;for(let L=t,D=t+e;L<D;L++){this.writePrimitiveBounds(L,ro,0);let[R,V,rt,Ct,j,it]=ro;if(R<r)r=R;if(Ct>f)f=Ct;if(V<a)a=V;if(j>x)x=j;if(rt<u)u=rt;if(it>A)A=it}return i[s+0]=r,i[s+1]=a,i[s+2]=u,i[s+3]=f,i[s+4]=x,i[s+5]=A,i}computePrimitiveBounds(t,e,i){let s=i.offset||0;for(let r=t,a=t+e;r<a;r++){this.writePrimitiveBounds(r,ro,0);let[u,f,x,A,L,D]=ro,R=(u+A)/2,V=(f+L)/2,rt=(x+D)/2,Ct=(A-u)/2,j=(L-f)/2,it=(D-x)/2,ft=(r-s)*6;i[ft+0]=R,i[ft+1]=Ct+(Math.abs(R)+Ct)*Kr,i[ft+2]=V,i[ft+3]=j+(Math.abs(V)+j)*Kr,i[ft+4]=rt,i[ft+5]=it+(Math.abs(rt)+it)*Kr}return i}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let i=0,s=e.length;i<s;i++)e[i]+=t;else{let i=this._roots;for(let s=0;s<i.length;s++){let r=i[s],a=new Uint32Array(r),u=new Uint16Array(r),f=r.byteLength/Wi;for(let x=0;x<f;x++){let A=Si*x,L=2*A;if(ui(L,u))a[A+6]+=t}}}}traverse(t,e=0){sl.setBVH(this,e),sl.traverse(t),sl.reset()}refit(){let t=this._roots;for(let e=0,i=t.length;e<i;e++){let s=t[e],r=new Uint32Array(s),a=new Uint16Array(s),u=new Float32Array(s),f=s.byteLength/Wi;for(let x=f-1;x>=0;x--){let A=x*Si,L=A*2;if(ui(L,a)){let R=_i(A,r),V=Mi(L,a);this.writePrimitiveRangeBounds(R,V,ro,0),u.set(ro,A)}else{let R=mi(A),V=gi(A,r);for(let rt=0;rt<3;rt++){let Ct=u[R+rt],j=u[R+rt+3],it=u[V+rt],ft=u[V+rt+3];u[A+rt]=Ct<it?Ct:it,u[A+rt+3]=j>ft?j:ft}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach((i)=>{Ai(0,new Float32Array(i),Hd),t.union(Hd)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:i,intersectsRange:s,intersectsPrimitive:r,scratchPrimitive:a,iterate:u}=t;if(s&&r){let L=s;s=(D,R,V,rt,Ct)=>{if(!L(D,R,V,rt,Ct))return u(D,R,this,r,V,rt,a);return!0}}else if(!s)if(r)s=(L,D,R,V)=>u(L,D,this,r,R,V,a);else s=(L,D,R)=>R;let f=!1,x=0,A=this._roots;for(let L=0,D=A.length;L<D;L++){let R=A[L];if(f=Gd(this,L,i,s,e,x),f)break;x+=R.byteLength/Wi}return f}bvhcast(t,e,i){let{intersectsRanges:s}=i;return kd(this,t,e,s)}}function Vd(){return typeof SharedArrayBuffer<"u"}function Eh(t){return t.index?t.index.count:t.attributes.position.count}function lr(t){return Eh(t)/3}function Ry(t,e=ArrayBuffer){if(t>65535)return new Uint32Array(new e(4*t));else return new Uint16Array(new e(2*t))}function Wd(t,e){if(!t.index){let i=t.attributes.position.count,s=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,r=Ry(i,s);t.setIndex(new _(r,1));for(let a=0;a<i;a++)r[a]=a}}function Cy(t,e,i){let s=Eh(t)/i,r=e?e:t.drawRange,a=r.start/i,u=(r.start+r.count)/i,f=Math.max(0,a),x=Math.min(s,u)-f;return{offset:Math.floor(f),count:Math.floor(x)}}function Iy(t,e){return t.groups.map((i)=>({offset:i.start/e,count:i.count/e}))}function wh(t,e,i){let s=Cy(t,e,i),r=Iy(t,i);if(!r.length)return[s];let a=[],u=s.offset,f=s.offset+s.count,x=Eh(t)/i,A=[];for(let R of r){let{offset:V,count:rt}=R,Ct=V,j=isFinite(rt)?rt:x-V,it=V+j;if(Ct<f&&it>u)A.push({pos:Math.max(u,Ct),isStart:!0}),A.push({pos:Math.min(f,it),isStart:!1})}A.sort((R,V)=>{if(R.pos!==V.pos)return R.pos-V.pos;else return R.type==="end"?-1:1});let L=0,D=null;for(let R of A){let V=R.pos;if(L!==0&&V!==D)a.push({offset:D,count:V-D});L+=R.isStart?1:-1,D=V}return a}function Py(t,e){let i=t[t.length-1],s=i.offset+i.count>65536,r=t.reduce((A,L)=>A+L.count,0),a=s?4:2,u=e?new SharedArrayBuffer(r*a):new ArrayBuffer(r*a),f=s?new Uint32Array(u):new Uint16Array(u),x=0;for(let A=0;A<t.length;A++){let{offset:L,count:D}=t[A];for(let R=0;R<D;R++)f[x+R]=L+R;x+=D}return f}class Rh extends Ah{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(!t.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(t.index&&t.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(e.useSharedArrayBuffer&&!Vd())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=t,this.resolvePrimitiveIndex=e.indirect?(i)=>this._indirectBuffer[i]:(i)=>i,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...Ka,...e},!e[Go])this.init(e)}init(t){let{geometry:e,primitiveStride:i}=this;if(t.indirect){let s=wh(e,t.range,i),r=Py(s,t.useSharedArrayBuffer);this._indirectBuffer=r}else Wd(e,t);if(super.init(t),!e.boundingBox&&t.setBoundingBox)e.boundingBox=this.getBoundingBox(new p)}getRootRanges(t){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return wh(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class ps{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let i=1/0,s=-1/0;for(let r=0,a=t.length;r<a;r++){let f=t[r][e];i=f<i?f:i,s=f>s?f:s}this.min=i,this.max=s}setFromPoints(t,e){let i=1/0,s=-1/0;for(let r=0,a=e.length;r<a;r++){let u=e[r],f=t.dot(u);i=f<i?f:i,s=f>s?f:s}this.min=i,this.max=s}isSeparated(t){return this.min>t.max||t.min>this.max}}ps.prototype.setFromBox=function(){let t=new n;return function(i,s){let{min:r,max:a}=s,u=1/0,f=-1/0;for(let x=0;x<=1;x++)for(let A=0;A<=1;A++)for(let L=0;L<=1;L++){t.x=r.x*x+a.x*(1-x),t.y=r.y*A+a.y*(1-A),t.z=r.z*L+a.z*(1-L);let D=i.dot(t);u=Math.min(D,u),f=Math.max(D,f)}this.min=u,this.max=f}}();var Zb=function(){let t=new ps;return function(i,s){let{points:r,satAxes:a,satBounds:u}=i,{points:f,satAxes:x,satBounds:A}=s;for(let L=0;L<3;L++){let D=u[L],R=a[L];if(t.setFromPoints(R,f),D.isSeparated(t))return!1}for(let L=0;L<3;L++){let D=A[L],R=x[L];if(t.setFromPoints(R,r),D.isSeparated(t))return!1}}}();var Ly=function(){let t=new n,e=new n,i=new n;return function(r,a,u){let f=r.start,x=t,A=a.start,L=e;i.subVectors(f,A),t.subVectors(r.end,r.start),e.subVectors(a.end,a.start);let D=i.dot(L),R=L.dot(x),V=L.dot(L),rt=i.dot(x),j=x.dot(x)*V-R*R,it,ft;if(j!==0)it=(D*R-rt*V)/j;else it=0;ft=(D+it*R)/V,u.x=it,u.y=ft}}(),Vo=function(){let t=new l,e=new n,i=new n;return function(r,a,u,f){Ly(r,a,t);let{x,y:A}=t;if(x>=0&&x<=1&&A>=0&&A<=1){r.at(x,u),a.at(A,f);return}else if(x>=0&&x<=1){if(A<0)a.at(0,f);else a.at(1,f);r.closestPointToPoint(f,!0,u);return}else if(A>=0&&A<=1){if(x<0)r.at(0,u);else r.at(1,u);a.closestPointToPoint(u,!0,f);return}else{let L;if(x<0)L=r.start;else L=r.end;let D;if(A<0)D=a.start;else D=a.end;let R=e,V=i;if(r.closestPointToPoint(D,!0,e),a.closestPointToPoint(L,!0,i),R.distanceToSquared(D)<=V.distanceToSquared(L)){u.copy(R),f.copy(D);return}else{u.copy(L),f.copy(V);return}}}}(),Xd=function(){let t=new n,e=new n,i=new N,s=new O;return function(a,u){let{radius:f,center:x}=a,{a:A,b:L,c:D}=u;if(s.start=A,s.end=L,s.closestPointToPoint(x,!0,t).distanceTo(x)<=f)return!0;if(s.start=A,s.end=D,s.closestPointToPoint(x,!0,t).distanceTo(x)<=f)return!0;if(s.start=L,s.end=D,s.closestPointToPoint(x,!0,t).distanceTo(x)<=f)return!0;let Ct=u.getPlane(i);if(Math.abs(Ct.distanceToPoint(x))<=f){let it=Ct.projectPoint(x,e);if(u.containsPoint(it))return!0}return!1}}();var Ny=["x","y","z"],qs=0.000000000000001,qd=qs*qs;function gs(t){return Math.abs(t)<qs}class es extends Oi{constructor(...t){super(...t);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new n),this.satBounds=[,,,,].fill().map(()=>new ps),this.points=[this.a,this.b,this.c],this.plane=new N,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new O,this.needsUpdate=!0}intersectsSphere(t){return Xd(t,this)}update(){let t=this.a,e=this.b,i=this.c,s=this.points,r=this.satAxes,a=this.satBounds,u=r[0],f=a[0];this.getNormal(u),f.setFromPoints(u,s);let x=r[1],A=a[1];x.subVectors(t,e),A.setFromPoints(x,s);let L=r[2],D=a[2];L.subVectors(e,i),D.setFromPoints(L,s);let R=r[3],V=a[3];R.subVectors(i,t),V.setFromPoints(R,s);let rt=x.length(),Ct=L.length(),j=R.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,rt<qs)if(Ct<qs||j<qs)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(i);else if(Ct<qs)if(j<qs)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t);else if(j<qs)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(i),this.degenerateSegment.end.copy(e);this.plane.setFromNormalAndCoplanarPoint(u,t),this.needsUpdate=!1}}es.prototype.closestPointToSegment=function(){let t=new n,e=new n,i=new O;return function(r,a=null,u=null){if(this.needsUpdate)this.update();let{start:f,end:x}=r,A=this.points,L,D=1/0,R=this.plane.distanceToPoint(f),V=this.plane.distanceToPoint(x);if(R*V<0&&this.plane.intersectLine(r,t)!==null&&this.containsPoint(t)){if(a)a.copy(t);if(u)u.copy(t);return 0}for(let rt=0;rt<3;rt++){let Ct=(rt+1)%3;if(i.start.copy(A[rt]),i.end.copy(A[Ct]),Vo(i,r,t,e),L=t.distanceToSquared(e),L<D){if(D=L,a)a.copy(t);if(u)u.copy(e)}}if(this.closestPointToPoint(f,t),L=f.distanceToSquared(t),L<D){if(D=L,a)a.copy(t);if(u)u.copy(f)}if(this.closestPointToPoint(x,t),L=x.distanceToSquared(t),L<D){if(D=L,a)a.copy(t);if(u)u.copy(x)}return Math.sqrt(D)}}();es.prototype.intersectsTriangle=function(){let t=new es,e=new ps,i=new ps,s=new n,r=new n,a=new n,u=new n,f=new O,x=new O,A=new n,L=new l,D=new l;function R(Pt,pt,Nt,se){let nt=s;if(!Pt.isDegenerateIntoPoint&&!Pt.isDegenerateIntoSegment)nt.copy(Pt.plane.normal);else nt.copy(pt.plane.normal);let{satBounds:Rt,satAxes:re}=Pt;for(let Pe=1;Pe<4;Pe++){let $e=Rt[Pe],fe=re[Pe];if(e.setFromPoints(fe,pt.points),$e.isSeparated(e))return!1;if(u.copy(nt).cross(fe),e.setFromPoints(u,Pt.points),i.setFromPoints(u,pt.points),e.isSeparated(i))return!1}let{satBounds:be,satAxes:he}=pt;for(let Pe=1;Pe<4;Pe++){let $e=be[Pe],fe=he[Pe];if(e.setFromPoints(fe,Pt.points),$e.isSeparated(e))return!1;if(u.crossVectors(nt,fe),e.setFromPoints(u,Pt.points),i.setFromPoints(u,pt.points),e.isSeparated(i))return!1}if(Nt){if(!se)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");Nt.start.set(0,0,0),Nt.end.set(0,0,0)}return!0}function V(Pt,pt,Nt,se,nt,Rt,re,be,he,Pe,$e){let fe=re/(re-be);Pe.x=se+(nt-se)*fe,$e.start.subVectors(pt,Pt).multiplyScalar(fe).add(Pt),fe=re/(re-he),Pe.y=se+(Rt-se)*fe,$e.end.subVectors(Nt,Pt).multiplyScalar(fe).add(Pt)}function rt(Pt,pt,Nt,se,nt,Rt,re,be,he,Pe,$e){if(nt>0)V(Pt.c,Pt.a,Pt.b,se,pt,Nt,he,re,be,Pe,$e);else if(Rt>0)V(Pt.b,Pt.a,Pt.c,Nt,pt,se,be,re,he,Pe,$e);else if(be*he>0||re!=0)V(Pt.a,Pt.b,Pt.c,pt,Nt,se,re,be,he,Pe,$e);else if(be!=0)V(Pt.b,Pt.a,Pt.c,Nt,pt,se,be,re,he,Pe,$e);else if(he!=0)V(Pt.c,Pt.a,Pt.b,se,pt,Nt,he,re,be,Pe,$e);else return!0;return!1}function Ct(Pt,pt,Nt,se){let nt=pt.degenerateSegment,Rt=Pt.plane.distanceToPoint(nt.start),re=Pt.plane.distanceToPoint(nt.end);if(gs(Rt))if(gs(re))return R(Pt,pt,Nt,se);else{if(Nt)Nt.start.copy(nt.start),Nt.end.copy(nt.start);return Pt.containsPoint(nt.start)}else if(gs(re)){if(Nt)Nt.start.copy(nt.end),Nt.end.copy(nt.end);return Pt.containsPoint(nt.end)}else if(Pt.plane.intersectLine(nt,s)!=null){if(Nt)Nt.start.copy(s),Nt.end.copy(s);return Pt.containsPoint(s)}else return!1}function j(Pt,pt,Nt){let se=pt.a;if(gs(Pt.plane.distanceToPoint(se))&&Pt.containsPoint(se)){if(Nt)Nt.start.copy(se),Nt.end.copy(se);return!0}else return!1}function it(Pt,pt,Nt){let se=Pt.degenerateSegment,nt=pt.a;if(se.closestPointToPoint(nt,!0,s),nt.distanceToSquared(s)<qd){if(Nt)Nt.start.copy(nt),Nt.end.copy(nt);return!0}else return!1}function ft(Pt,pt,Nt,se){if(Pt.isDegenerateIntoSegment)if(pt.isDegenerateIntoSegment){let nt=Pt.degenerateSegment,Rt=pt.degenerateSegment,re=r,be=a;nt.delta(re),Rt.delta(be);let he=s.subVectors(Rt.start,nt.start),Pe=re.x*be.y-re.y*be.x;if(gs(Pe))return!1;let $e=(he.x*be.y-he.y*be.x)/Pe,fe=-(re.x*he.y-re.y*he.x)/Pe;if($e<0||$e>1||fe<0||fe>1)return!1;let sn=nt.start.z+re.z*$e,un=Rt.start.z+be.z*fe;if(gs(sn-un)){if(Nt)Nt.start.copy(nt.start).addScaledVector(re,$e),Nt.end.copy(nt.start).addScaledVector(re,$e);return!0}else return!1}else if(pt.isDegenerateIntoPoint)return it(Pt,pt,Nt);else return Ct(pt,Pt,Nt,se);else if(Pt.isDegenerateIntoPoint)if(pt.isDegenerateIntoPoint)if(pt.a.distanceToSquared(Pt.a)<qd){if(Nt)Nt.start.copy(Pt.a),Nt.end.copy(Pt.a);return!0}else return!1;else if(pt.isDegenerateIntoSegment)return it(pt,Pt,Nt);else return j(pt,Pt,Nt);else if(pt.isDegenerateIntoPoint)return j(Pt,pt,Nt);else if(pt.isDegenerateIntoSegment)return Ct(Pt,pt,Nt,se)}return function(pt,Nt=null,se=!1){if(this.needsUpdate)this.update();if(!pt.isExtendedTriangle)t.copy(pt),t.update(),pt=t;else if(pt.needsUpdate)pt.update();let nt=ft(this,pt,Nt,se);if(nt!==void 0)return nt;let Rt=this.plane,re=pt.plane,be=re.distanceToPoint(this.a),he=re.distanceToPoint(this.b),Pe=re.distanceToPoint(this.c);if(gs(be))be=0;if(gs(he))he=0;if(gs(Pe))Pe=0;let $e=be*he,fe=be*Pe;if($e>0&&fe>0)return!1;let sn=Rt.distanceToPoint(pt.a),un=Rt.distanceToPoint(pt.b),rn=Rt.distanceToPoint(pt.c);if(gs(sn))sn=0;if(gs(un))un=0;if(gs(rn))rn=0;let wn=sn*un,mn=sn*rn;if(wn>0&&mn>0)return!1;r.copy(Rt.normal),a.copy(re.normal);let Sn=r.cross(a),Tn=0,Gn=Math.abs(Sn.x),vn=Math.abs(Sn.y);if(vn>Gn)Gn=vn,Tn=1;if(Math.abs(Sn.z)>Gn)Tn=2;let zn=Ny[Tn],Jn=this.a[zn],Kn=this.b[zn],kn=this.c[zn],di=pt.a[zn],oi=pt.b[zn],si=pt.c[zn];if(rt(this,Jn,Kn,kn,$e,fe,be,he,Pe,L,f))return R(this,pt,Nt,se);if(rt(pt,di,oi,si,wn,mn,sn,un,rn,D,x))return R(this,pt,Nt,se);if(L.y<L.x){let xi=L.y;L.y=L.x,L.x=xi,A.copy(f.start),f.start.copy(f.end),f.end.copy(A)}if(D.y<D.x){let xi=D.y;D.y=D.x,D.x=xi,A.copy(x.start),x.start.copy(x.end),x.end.copy(A)}if(L.y<D.x||D.y<L.x)return!1;if(Nt){if(D.x>L.x)Nt.start.copy(x.start);else Nt.start.copy(f.start);if(D.y<L.y)Nt.end.copy(x.end);else Nt.end.copy(f.end)}return!0}}();es.prototype.distanceToPoint=function(){let t=new n;return function(i){return this.closestPointToPoint(i,t),i.distanceTo(t)}}();es.prototype.distanceToTriangle=function(){let t=new n,e=new n,i=["a","b","c"],s=new O,r=new O;return function(u,f=null,x=null){let A=f||x?s:null;if(this.intersectsTriangle(u,A,!0)){if(f||x){if(f)A.getCenter(f);if(x)A.getCenter(x)}return 0}let L=1/0;for(let D=0;D<3;D++){let R,V=i[D],rt=u[V];if(this.closestPointToPoint(rt,t),R=rt.distanceToSquared(t),R<L){if(L=R,f)f.copy(t);if(x)x.copy(rt)}let Ct=this[V];if(u.closestPointToPoint(Ct,t),R=Ct.distanceToSquared(t),R<L){if(L=R,f)f.copy(Ct);if(x)x.copy(t)}}for(let D=0;D<3;D++){let R=i[D],V=i[(D+1)%3];s.set(this[R],this[V]);for(let rt=0;rt<3;rt++){let Ct=i[rt],j=i[(rt+1)%3];r.set(u[Ct],u[j]),Vo(s,r,t,e);let it=t.distanceToSquared(e);if(it<L){if(L=it,f)f.copy(t);if(x)x.copy(e)}}}return Math.sqrt(L)}}();class Li{constructor(t,e,i){if(this.isOrientedBox=!0,this.min=new n,this.max=new n,this.matrix=new o,this.invMatrix=new o,this.points=[,,,,,,,,].fill().map(()=>new n),this.satAxes=[,,,].fill().map(()=>new n),this.satBounds=[,,,].fill().map(()=>new ps),this.alignedSatBounds=[,,,].fill().map(()=>new ps),this.needsUpdate=!1,t)this.min.copy(t);if(e)this.max.copy(e);if(i)this.matrix.copy(i)}set(t,e,i){this.min.copy(t),this.max.copy(e),this.matrix.copy(i),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}}Li.prototype.update=function(){return function(){let e=this.matrix,i=this.min,s=this.max,r=this.points;for(let A=0;A<=1;A++)for(let L=0;L<=1;L++)for(let D=0;D<=1;D++){let R=1*A|2*L|4*D,V=r[R];V.x=A?s.x:i.x,V.y=L?s.y:i.y,V.z=D?s.z:i.z,V.applyMatrix4(e)}let a=this.satBounds,u=this.satAxes,f=r[0];for(let A=0;A<3;A++){let L=u[A],D=a[A],R=1<<A,V=r[R];L.subVectors(f,V),D.setFromPoints(L,r)}let x=this.alignedSatBounds;x[0].setFromPointsField(r,"x"),x[1].setFromPointsField(r,"y"),x[2].setFromPointsField(r,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Li.prototype.intersectsBox=function(){let t=new ps;return function(i){if(this.needsUpdate)this.update();let{min:s,max:r}=i,a=this.satBounds,u=this.satAxes,f=this.alignedSatBounds;if(t.min=s.x,t.max=r.x,f[0].isSeparated(t))return!1;if(t.min=s.y,t.max=r.y,f[1].isSeparated(t))return!1;if(t.min=s.z,t.max=r.z,f[2].isSeparated(t))return!1;for(let x=0;x<3;x++){let A=u[x],L=a[x];if(t.setFromBox(A,i),L.isSeparated(t))return!1}return!0}}();Li.prototype.intersectsTriangle=function(){let t=new es,e=[,,,],i=new ps,s=new ps,r=new n;return function(u){if(this.needsUpdate)this.update();if(!u.isExtendedTriangle)t.copy(u),t.update(),u=t;else if(u.needsUpdate)u.update();let f=this.satBounds,x=this.satAxes;e[0]=u.a,e[1]=u.b,e[2]=u.c;for(let R=0;R<3;R++){let V=f[R],rt=x[R];if(i.setFromPoints(rt,e),V.isSeparated(i))return!1}let A=u.satBounds,L=u.satAxes,D=this.points;for(let R=0;R<3;R++){let V=A[R],rt=L[R];if(i.setFromPoints(rt,D),V.isSeparated(i))return!1}for(let R=0;R<3;R++){let V=x[R];for(let rt=0;rt<4;rt++){let Ct=L[rt];if(r.crossVectors(V,Ct),i.setFromPoints(r,e),s.setFromPoints(r,D),i.isSeparated(s))return!1}}return!0}}();Li.prototype.closestPointToPoint=function(){return function(e,i){if(this.needsUpdate)this.update();return i.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),i}}();Li.prototype.distanceToPoint=function(){let t=new n;return function(i){return this.closestPointToPoint(i,t),i.distanceTo(t)}}();Li.prototype.distanceToBox=function(){let t=["x","y","z"],e=Array(12).fill().map(()=>new O),i=Array(12).fill().map(()=>new O),s=new n,r=new n;return function(u,f=0,x=null,A=null){if(this.needsUpdate)this.update();if(this.intersectsBox(u)){if(x||A){if(u.getCenter(r),this.closestPointToPoint(r,s),u.closestPointToPoint(s,r),x)x.copy(s);if(A)A.copy(r)}return 0}let L=f*f,{min:D,max:R}=u,V=this.points,rt=1/0;for(let j=0;j<8;j++){let it=V[j];r.copy(it).clamp(D,R);let ft=it.distanceToSquared(r);if(ft<rt){if(rt=ft,x)x.copy(it);if(A)A.copy(r);if(ft<L)return Math.sqrt(ft)}}let Ct=0;for(let j=0;j<3;j++)for(let it=0;it<=1;it++)for(let ft=0;ft<=1;ft++){let Pt=(j+1)%3,pt=(j+2)%3,Nt=it<<Pt|ft<<pt,se=1<<j|it<<Pt|ft<<pt,nt=V[Nt],Rt=V[se];e[Ct].set(nt,Rt);let be=t[j],he=t[Pt],Pe=t[pt],$e=i[Ct],{start:fe,end:sn}=$e;fe[be]=D[be],fe[he]=it?D[he]:R[he],fe[Pe]=ft?D[Pe]:R[Pe],sn[be]=R[be],sn[he]=it?D[he]:R[he],sn[Pe]=ft?D[Pe]:R[Pe],Ct++}for(let j=0;j<=1;j++)for(let it=0;it<=1;it++)for(let ft=0;ft<=1;ft++){r.x=j?R.x:D.x,r.y=it?R.y:D.y,r.z=ft?R.z:D.z,this.closestPointToPoint(r,s);let Pt=r.distanceToSquared(s);if(Pt<rt){if(rt=Pt,x)x.copy(s);if(A)A.copy(r);if(Pt<L)return Math.sqrt(Pt)}}for(let j=0;j<12;j++){let it=e[j];for(let ft=0;ft<12;ft++){let Pt=i[ft];Vo(it,Pt,s,r);let pt=s.distanceToSquared(r);if(pt<rt){if(rt=pt,x)x.copy(s);if(A)A.copy(r);if(pt<L)return Math.sqrt(pt)}}}return Math.sqrt(rt)}}();class Yd extends Tr{constructor(){super(()=>new es)}}var rs=new Yd;var Wo=new n,Ch=new n;function Zd(t,e,i={},s=0,r=1/0){let a=s*s,u=r*r,f=1/0,x=null;if(t.shapecast({boundsTraverseOrder:(L)=>(Wo.copy(e).clamp(L.min,L.max),Wo.distanceToSquared(e)),intersectsBounds:(L,D,R)=>R<f&&R<u,intersectsTriangle:(L,D)=>{L.closestPointToPoint(e,Wo);let R=e.distanceToSquared(Wo);if(R<f)Ch.copy(Wo),f=R,x=D;if(R<a)return!0;else return!1}}),f===1/0)return null;let A=Math.sqrt(f);if(!i.point)i.point=Ch.clone();else i.point.copy(Ch);return i.distance=A,i.faceIndex=x,i}var rl=parseInt(yr)>=169,Dy=parseInt(yr)<=161,Ar=new n,Er=new n,wr=new n,ol=new l,al=new l,ll=new l,Jd=new n,$d=new n,Kd=new n,Xo=new n;function Uy(t,e,i,s,r,a,u,f){let x;if(a===B)x=t.intersectTriangle(s,i,e,!0,r);else x=t.intersectTriangle(e,i,s,a!==w,r);if(x===null)return null;let A=t.origin.distanceTo(r);if(A<u||A>f)return null;return{distance:A,point:r.clone()}}function Qd(t,e,i,s,r,a,u,f,x,A,L){Ar.fromBufferAttribute(e,a),Er.fromBufferAttribute(e,u),wr.fromBufferAttribute(e,f);let D=Uy(t,Ar,Er,wr,Xo,x,A,L);if(D){if(s){ol.fromBufferAttribute(s,a),al.fromBufferAttribute(s,u),ll.fromBufferAttribute(s,f),D.uv=new l;let V=Oi.getInterpolation(Xo,Ar,Er,wr,ol,al,ll,D.uv);if(!rl)D.uv=V}if(r){ol.fromBufferAttribute(r,a),al.fromBufferAttribute(r,u),ll.fromBufferAttribute(r,f),D.uv1=new l;let V=Oi.getInterpolation(Xo,Ar,Er,wr,ol,al,ll,D.uv1);if(!rl)D.uv1=V;if(Dy)D.uv2=D.uv1}if(i){Jd.fromBufferAttribute(i,a),$d.fromBufferAttribute(i,u),Kd.fromBufferAttribute(i,f),D.normal=new n;let V=Oi.getInterpolation(Xo,Ar,Er,wr,Jd,$d,Kd,D.normal);if(D.normal.dot(t.direction)>0)D.normal.multiplyScalar(-1);if(!rl)D.normal=V}let R={a,b:u,c:f,normal:new n,materialIndex:0};if(Oi.getNormal(Ar,Er,wr,R.normal),D.face=R,D.faceIndex=a,rl){let V=new n;Oi.getBarycoord(Xo,Ar,Er,wr,V),D.barycoord=V}}return D}function jd(t){return t&&t.isMaterial?t.side:t}function oo(t,e,i,s,r,a,u){let f=s*3,x=f+0,A=f+1,L=f+2,{index:D,groups:R}=t;if(t.index)x=D.getX(x),A=D.getX(A),L=D.getX(L);let{position:V,normal:rt,uv:Ct,uv1:j}=t.attributes;if(Array.isArray(e)){let it=s*3;for(let ft=0,Pt=R.length;ft<Pt;ft++){let{start:pt,count:Nt,materialIndex:se}=R[ft];if(it>=pt&&it<pt+Nt){let nt=jd(e[se]),Rt=Qd(i,V,rt,Ct,j,x,A,L,nt,a,u);if(Rt)if(Rt.faceIndex=s,Rt.face.materialIndex=se,r)r.push(Rt);else return Rt}}}else{let it=jd(e),ft=Qd(i,V,rt,Ct,j,x,A,L,it,a,u);if(ft)if(ft.faceIndex=s,ft.face.materialIndex=0,r)r.push(ft);else return ft}return null}function Ei(t,e,i,s){let{a:r,b:a,c:u}=t,f=e,x=e+1,A=e+2;if(i)f=i.getX(f),x=i.getX(x),A=i.getX(A);r.x=s.getX(f),r.y=s.getY(f),r.z=s.getZ(f),a.x=s.getX(x),a.y=s.getY(x),a.z=s.getZ(x),u.x=s.getX(A),u.y=s.getY(A),u.z=s.getZ(A)}function tp(t,e,i,s,r,a,u,f){let{geometry:x,_indirectBuffer:A}=t;for(let L=s,D=s+r;L<D;L++)oo(x,e,i,L,a,u,f)}function ep(t,e,i,s,r,a,u){let{geometry:f,_indirectBuffer:x}=t,A=1/0,L=null;for(let D=s,R=s+r;D<R;D++){let V;if(V=oo(f,e,i,D,null,a,u),V&&V.distance<A)L=V,A=V.distance}return L}function np(t,e,i,s,r,a,u){let{geometry:f}=i,{index:x}=f,A=f.attributes.position;for(let L=t,D=e+t;L<D;L++){let R;if(R=L,Ei(u,R*3,x,A),u.needsUpdate=!0,s(u,R,r,a))return!0}return!1}function ip(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let i=t.geometry,s=i.index?i.index.array:null,r=i.attributes.position,a,u,f,x,A=0,L=t._roots;for(let R=0,V=L.length;R<V;R++)a=L[R],u=new Uint32Array(a),f=new Uint16Array(a),x=new Float32Array(a),D(0,A),A+=a.byteLength;function D(R,V,rt=!1){let Ct=R*2;if(ui(Ct,f)){let j=_i(R,u),it=Mi(Ct,f),ft=1/0,Pt=1/0,pt=1/0,Nt=-1/0,se=-1/0,nt=-1/0;for(let Rt=3*j,re=3*(j+it);Rt<re;Rt++){let be=s[Rt],he=r.getX(be),Pe=r.getY(be),$e=r.getZ(be);if(he<ft)ft=he;if(he>Nt)Nt=he;if(Pe<Pt)Pt=Pe;if(Pe>se)se=Pe;if($e<pt)pt=$e;if($e>nt)nt=$e}if(x[R+0]!==ft||x[R+1]!==Pt||x[R+2]!==pt||x[R+3]!==Nt||x[R+4]!==se||x[R+5]!==nt)return x[R+0]=ft,x[R+1]=Pt,x[R+2]=pt,x[R+3]=Nt,x[R+4]=se,x[R+5]=nt,!0;else return!1}else{let j=mi(R),it=gi(R,u),ft=rt,Pt=!1,pt=!1;if(e){if(!ft){let be=j/Si+V/Wi,he=it/Si+V/Wi;Pt=e.has(be),pt=e.has(he),ft=!Pt&&!pt}}else Pt=!0,pt=!0;let Nt=ft||Pt,se=ft||pt,nt=!1;if(Nt)nt=D(j,V,ft);let Rt=!1;if(se)Rt=D(it,V,ft);let re=nt||Rt;if(re)for(let be=0;be<3;be++){let he=j+be,Pe=it+be,$e=x[he],fe=x[he+3],sn=x[Pe],un=x[Pe+3];x[R+be]=$e<sn?$e:sn,x[R+be+3]=fe>un?fe:un}return re}}}function ns(t,e,i,s,r){let a,u,f,x,A,L,D=1/i.direction.x,R=1/i.direction.y,V=1/i.direction.z,rt=i.origin.x,Ct=i.origin.y,j=i.origin.z,it=e[t],ft=e[t+3],Pt=e[t+1],pt=e[t+3+1],Nt=e[t+2],se=e[t+3+2];if(D>=0)a=(it-rt)*D,u=(ft-rt)*D;else a=(ft-rt)*D,u=(it-rt)*D;if(R>=0)f=(Pt-Ct)*R,x=(pt-Ct)*R;else f=(pt-Ct)*R,x=(Pt-Ct)*R;if(a>x||f>u)return!1;if(f>a||isNaN(a))a=f;if(x<u||isNaN(u))u=x;if(V>=0)A=(Nt-j)*V,L=(se-j)*V;else A=(se-j)*V,L=(Nt-j)*V;if(a>L||A>u)return!1;if(A>a||a!==a)a=A;if(L<u||u!==u)u=L;return a<=r&&u>=s}function sp(t,e,i,s,r,a,u,f){let{geometry:x,_indirectBuffer:A}=t;for(let L=s,D=s+r;L<D;L++){let R=A?A[L]:L;oo(x,e,i,R,a,u,f)}}function rp(t,e,i,s,r,a,u){let{geometry:f,_indirectBuffer:x}=t,A=1/0,L=null;for(let D=s,R=s+r;D<R;D++){let V;if(V=oo(f,e,i,x?x[D]:D,null,a,u),V&&V.distance<A)L=V,A=V.distance}return L}function op(t,e,i,s,r,a,u){let{geometry:f}=i,{index:x}=f,A=f.attributes.position;for(let L=t,D=e+t;L<D;L++){let R;if(R=i.resolveTriangleIndex(L),Ei(u,R*3,x,A),u.needsUpdate=!0,s(u,R,r,a))return!0}return!1}function ap(t,e,i,s,r,a,u){if(ai.setBuffer(t._roots[e]),ns(0,ai.float32Array,s,a,u))Ih(0,t,i,s,r,a,u);ai.clearBuffer()}function Ih(t,e,i,s,r,a,u){let{float32Array:f,uint16Array:x,uint32Array:A}=ai,L=t*2;if(ui(L,x)){let R=_i(t,A),V=Mi(L,x);tp(e,i,s,R,V,r,a,u)}else{let R=mi(t);if(ns(R,f,s,a,u))Ih(R,e,i,s,r,a,u);let V=gi(t,A);if(ns(V,f,s,a,u))Ih(V,e,i,s,r,a,u)}}var Fy=["x","y","z"];function lp(t,e,i,s,r,a){ai.setBuffer(t._roots[e]);let u=null;if(ns(0,ai.float32Array,s,r,a))u=Ph(0,t,i,s,r,a);return ai.clearBuffer(),u}function Ph(t,e,i,s,r,a){let{float32Array:u,uint16Array:f,uint32Array:x}=ai,A=t*2;if(ui(A,f)){let D=_i(t,x),R=Mi(A,f);return ep(e,i,s,D,R,r,a)}else{let D=Qr(t,x),R=Fy[D],rt=s.direction[R]>=0,Ct,j;if(rt)Ct=mi(t),j=gi(t,x);else Ct=gi(t,x),j=mi(t);let ft=ns(Ct,u,s,r,a)?Ph(Ct,e,i,s,r,a):null;if(ft){let Nt=ft.point[R];if(rt?Nt<=u[j+D]:Nt>=u[j+D+3])return ft}let pt=ns(j,u,s,r,a)?Ph(j,e,i,s,r,a):null;if(ft&&pt)return ft.distance<=pt.distance?ft:pt;else return ft||pt||null}}var cl=new p,ao=new es,lo=new es,qo=new o,cp=new Li,hl=new Li;function hp(t,e,i,s){ai.setBuffer(t._roots[e]);let r=Lh(0,t,i,s);return ai.clearBuffer(),r}function Lh(t,e,i,s,r=null){let{float32Array:a,uint16Array:u,uint32Array:f}=ai,x=t*2;if(r===null){if(!i.boundingBox)i.computeBoundingBox();cp.set(i.boundingBox.min,i.boundingBox.max,s),r=cp}if(ui(x,u)){let L=e.geometry,D=L.index,R=L.attributes.position,V=i.index,rt=i.attributes.position,Ct=_i(t,f),j=Mi(x,u);if(qo.copy(s).invert(),i.boundsTree)return Ai(Ci(t),a,hl),hl.matrix.copy(qo),hl.needsUpdate=!0,i.boundsTree.shapecast({intersectsBounds:(ft)=>hl.intersectsBox(ft),intersectsTriangle:(ft)=>{ft.a.applyMatrix4(s),ft.b.applyMatrix4(s),ft.c.applyMatrix4(s),ft.needsUpdate=!0;for(let Pt=Ct*3,pt=(j+Ct)*3;Pt<pt;Pt+=3)if(Ei(lo,Pt,D,R),lo.needsUpdate=!0,ft.intersectsTriangle(lo))return!0;return!1}});else{let it=lr(i);for(let ft=Ct*3,Pt=(j+Ct)*3;ft<Pt;ft+=3){Ei(ao,ft,D,R),ao.a.applyMatrix4(qo),ao.b.applyMatrix4(qo),ao.c.applyMatrix4(qo),ao.needsUpdate=!0;for(let pt=0,Nt=it*3;pt<Nt;pt+=3)if(Ei(lo,pt,V,rt),lo.needsUpdate=!0,ao.intersectsTriangle(lo))return!0}}}else{let L=mi(t),D=gi(t,f);if(Ai(Ci(L),a,cl),r.intersectsBox(cl)&&Lh(L,e,i,s,r))return!0;if(Ai(Ci(D),a,cl),r.intersectsBox(cl)&&Lh(D,e,i,s,r))return!0;return!1}}var ul=new o,Nh=new Li,Yo=new Li,Oy=new n,By=new n,zy=new n,Gy=new n;function up(t,e,i,s={},r={},a=0,u=1/0){if(!e.boundingBox)e.computeBoundingBox();Nh.set(e.boundingBox.min,e.boundingBox.max,i),Nh.needsUpdate=!0;let f=t.geometry,x=f.attributes.position,A=f.index,L=e.attributes.position,D=e.index,R=rs.getPrimitive(),V=rs.getPrimitive(),rt=Oy,Ct=By,j=null,it=null;if(r)j=zy,it=Gy;let ft=1/0,Pt=null,pt=null;if(ul.copy(i).invert(),Yo.matrix.copy(ul),t.shapecast({boundsTraverseOrder:(Nt)=>Nh.distanceToBox(Nt),intersectsBounds:(Nt,se,nt)=>{if(nt<ft&&nt<u){if(se)Yo.min.copy(Nt.min),Yo.max.copy(Nt.max),Yo.needsUpdate=!0;return!0}return!1},intersectsRange:(Nt,se)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:(Rt)=>Yo.distanceToBox(Rt),intersectsBounds:(Rt,re,be)=>be<ft&&be<u,intersectsRange:(Rt,re)=>{for(let be=Rt,he=Rt+re;be<he;be++){Ei(V,3*be,D,L),V.a.applyMatrix4(i),V.b.applyMatrix4(i),V.c.applyMatrix4(i),V.needsUpdate=!0;for(let Pe=Nt,$e=Nt+se;Pe<$e;Pe++){Ei(R,3*Pe,A,x),R.needsUpdate=!0;let fe=R.distanceToTriangle(V,rt,j);if(fe<ft){if(Ct.copy(rt),it)it.copy(j);ft=fe,Pt=Pe,pt=be}if(fe<a)return!0}}}});else{let nt=lr(e);for(let Rt=0,re=nt;Rt<re;Rt++){Ei(V,3*Rt,D,L),V.a.applyMatrix4(i),V.b.applyMatrix4(i),V.c.applyMatrix4(i),V.needsUpdate=!0;for(let be=Nt,he=Nt+se;be<he;be++){Ei(R,3*be,A,x),R.needsUpdate=!0;let Pe=R.distanceToTriangle(V,rt,j);if(Pe<ft){if(Ct.copy(rt),it)it.copy(j);ft=Pe,Pt=be,pt=Rt}if(Pe<a)return!0}}}}}),rs.releasePrimitive(R),rs.releasePrimitive(V),ft===1/0)return null;if(!s.point)s.point=Ct.clone();else s.point.copy(Ct);if(s.distance=ft,s.faceIndex=Pt,r){if(!r.point)r.point=it.clone();else r.point.copy(it);r.point.applyMatrix4(ul),Ct.applyMatrix4(ul),r.distance=Ct.sub(r.point).length(),r.faceIndex=pt}return s}function fp(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let i=t.geometry,s=i.index?i.index.array:null,r=i.attributes.position,a,u,f,x,A=0,L=t._roots;for(let R=0,V=L.length;R<V;R++)a=L[R],u=new Uint32Array(a),f=new Uint16Array(a),x=new Float32Array(a),D(0,A),A+=a.byteLength;function D(R,V,rt=!1){let Ct=R*2;if(ui(Ct,f)){let j=_i(R,u),it=Mi(Ct,f),ft=1/0,Pt=1/0,pt=1/0,Nt=-1/0,se=-1/0,nt=-1/0;for(let Rt=j,re=j+it;Rt<re;Rt++){let be=3*t.resolveTriangleIndex(Rt);for(let he=0;he<3;he++){let Pe=be+he;Pe=s?s[Pe]:Pe;let $e=r.getX(Pe),fe=r.getY(Pe),sn=r.getZ(Pe);if($e<ft)ft=$e;if($e>Nt)Nt=$e;if(fe<Pt)Pt=fe;if(fe>se)se=fe;if(sn<pt)pt=sn;if(sn>nt)nt=sn}}if(x[R+0]!==ft||x[R+1]!==Pt||x[R+2]!==pt||x[R+3]!==Nt||x[R+4]!==se||x[R+5]!==nt)return x[R+0]=ft,x[R+1]=Pt,x[R+2]=pt,x[R+3]=Nt,x[R+4]=se,x[R+5]=nt,!0;else return!1}else{let j=mi(R),it=gi(R,u),ft=rt,Pt=!1,pt=!1;if(e){if(!ft){let be=j/Si+V/Wi,he=it/Si+V/Wi;Pt=e.has(be),pt=e.has(he),ft=!Pt&&!pt}}else Pt=!0,pt=!0;let Nt=ft||Pt,se=ft||pt,nt=!1;if(Nt)nt=D(j,V,ft);let Rt=!1;if(se)Rt=D(it,V,ft);let re=nt||Rt;if(re)for(let be=0;be<3;be++){let he=j+be,Pe=it+be,$e=x[he],fe=x[he+3],sn=x[Pe],un=x[Pe+3];x[R+be]=$e<sn?$e:sn,x[R+be+3]=fe>un?fe:un}return re}}}function dp(t,e,i,s,r,a,u){if(ai.setBuffer(t._roots[e]),ns(0,ai.float32Array,s,a,u))Dh(0,t,i,s,r,a,u);ai.clearBuffer()}function Dh(t,e,i,s,r,a,u){let{float32Array:f,uint16Array:x,uint32Array:A}=ai,L=t*2;if(ui(L,x)){let R=_i(t,A),V=Mi(L,x);sp(e,i,s,R,V,r,a,u)}else{let R=mi(t);if(ns(R,f,s,a,u))Dh(R,e,i,s,r,a,u);let V=gi(t,A);if(ns(V,f,s,a,u))Dh(V,e,i,s,r,a,u)}}var ky=["x","y","z"];function pp(t,e,i,s,r,a){ai.setBuffer(t._roots[e]);let u=null;if(ns(0,ai.float32Array,s,r,a))u=Uh(0,t,i,s,r,a);return ai.clearBuffer(),u}function Uh(t,e,i,s,r,a){let{float32Array:u,uint16Array:f,uint32Array:x}=ai,A=t*2;if(ui(A,f)){let D=_i(t,x),R=Mi(A,f);return rp(e,i,s,D,R,r,a)}else{let D=Qr(t,x),R=ky[D],rt=s.direction[R]>=0,Ct,j;if(rt)Ct=mi(t),j=gi(t,x);else Ct=gi(t,x),j=mi(t);let ft=ns(Ct,u,s,r,a)?Uh(Ct,e,i,s,r,a):null;if(ft){let Nt=ft.point[R];if(rt?Nt<=u[j+D]:Nt>=u[j+D+3])return ft}let pt=ns(j,u,s,r,a)?Uh(j,e,i,s,r,a):null;if(ft&&pt)return ft.distance<=pt.distance?ft:pt;else return ft||pt||null}}var fl=new p,co=new es,ho=new es,Zo=new o,mp=new Li,dl=new Li;function gp(t,e,i,s){ai.setBuffer(t._roots[e]);let r=Fh(0,t,i,s);return ai.clearBuffer(),r}function Fh(t,e,i,s,r=null){let{float32Array:a,uint16Array:u,uint32Array:f}=ai,x=t*2;if(r===null){if(!i.boundingBox)i.computeBoundingBox();mp.set(i.boundingBox.min,i.boundingBox.max,s),r=mp}if(ui(x,u)){let L=e.geometry,D=L.index,R=L.attributes.position,V=i.index,rt=i.attributes.position,Ct=_i(t,f),j=Mi(x,u);if(Zo.copy(s).invert(),i.boundsTree)return Ai(Ci(t),a,dl),dl.matrix.copy(Zo),dl.needsUpdate=!0,i.boundsTree.shapecast({intersectsBounds:(ft)=>dl.intersectsBox(ft),intersectsTriangle:(ft)=>{ft.a.applyMatrix4(s),ft.b.applyMatrix4(s),ft.c.applyMatrix4(s),ft.needsUpdate=!0;for(let Pt=Ct,pt=j+Ct;Pt<pt;Pt++)if(Ei(ho,3*e.resolveTriangleIndex(Pt),D,R),ho.needsUpdate=!0,ft.intersectsTriangle(ho))return!0;return!1}});else{let it=lr(i);for(let ft=Ct,Pt=j+Ct;ft<Pt;ft++){let pt=e.resolveTriangleIndex(ft);Ei(co,3*pt,D,R),co.a.applyMatrix4(Zo),co.b.applyMatrix4(Zo),co.c.applyMatrix4(Zo),co.needsUpdate=!0;for(let Nt=0,se=it*3;Nt<se;Nt+=3)if(Ei(ho,Nt,V,rt),ho.needsUpdate=!0,co.intersectsTriangle(ho))return!0}}}else{let L=mi(t),D=gi(t,f);if(Ai(Ci(L),a,fl),r.intersectsBox(fl)&&Fh(L,e,i,s,r))return!0;if(Ai(Ci(D),a,fl),r.intersectsBox(fl)&&Fh(D,e,i,s,r))return!0;return!1}}var pl=new o,Oh=new Li,Jo=new Li,Hy=new n,Vy=new n,Wy=new n,Xy=new n;function _p(t,e,i,s={},r={},a=0,u=1/0){if(!e.boundingBox)e.computeBoundingBox();Oh.set(e.boundingBox.min,e.boundingBox.max,i),Oh.needsUpdate=!0;let f=t.geometry,x=f.attributes.position,A=f.index,L=e.attributes.position,D=e.index,R=rs.getPrimitive(),V=rs.getPrimitive(),rt=Hy,Ct=Vy,j=null,it=null;if(r)j=Wy,it=Xy;let ft=1/0,Pt=null,pt=null;if(pl.copy(i).invert(),Jo.matrix.copy(pl),t.shapecast({boundsTraverseOrder:(Nt)=>Oh.distanceToBox(Nt),intersectsBounds:(Nt,se,nt)=>{if(nt<ft&&nt<u){if(se)Jo.min.copy(Nt.min),Jo.max.copy(Nt.max),Jo.needsUpdate=!0;return!0}return!1},intersectsRange:(Nt,se)=>{if(e.boundsTree){let nt=e.boundsTree;return nt.shapecast({boundsTraverseOrder:(Rt)=>Jo.distanceToBox(Rt),intersectsBounds:(Rt,re,be)=>be<ft&&be<u,intersectsRange:(Rt,re)=>{for(let be=Rt,he=Rt+re;be<he;be++){let Pe=nt.resolveTriangleIndex(be);Ei(V,3*Pe,D,L),V.a.applyMatrix4(i),V.b.applyMatrix4(i),V.c.applyMatrix4(i),V.needsUpdate=!0;for(let $e=Nt,fe=Nt+se;$e<fe;$e++){let sn=t.resolveTriangleIndex($e);Ei(R,3*sn,A,x),R.needsUpdate=!0;let un=R.distanceToTriangle(V,rt,j);if(un<ft){if(Ct.copy(rt),it)it.copy(j);ft=un,Pt=$e,pt=be}if(un<a)return!0}}}})}else{let nt=lr(e);for(let Rt=0,re=nt;Rt<re;Rt++){Ei(V,3*Rt,D,L),V.a.applyMatrix4(i),V.b.applyMatrix4(i),V.c.applyMatrix4(i),V.needsUpdate=!0;for(let be=Nt,he=Nt+se;be<he;be++){let Pe=t.resolveTriangleIndex(be);Ei(R,3*Pe,A,x),R.needsUpdate=!0;let $e=R.distanceToTriangle(V,rt,j);if($e<ft){if(Ct.copy(rt),it)it.copy(j);ft=$e,Pt=be,pt=Rt}if($e<a)return!0}}}}}),rs.releasePrimitive(R),rs.releasePrimitive(V),ft===1/0)return null;if(!s.point)s.point=Ct.clone();else s.point.copy(Ct);if(s.distance=ft,s.faceIndex=Pt,r){if(!r.point)r.point=it.clone();else r.point.copy(it);r.point.applyMatrix4(pl),Ct.applyMatrix4(pl),r.distance=Ct.sub(r.point).length(),r.faceIndex=pt}return s}function Bh(t,e,i){if(t===null)return null;return t.point.applyMatrix4(e.matrixWorld),t.distance=t.point.distanceTo(i.ray.origin),t.object=e,t}var ml=new Li,gl=new me,xp=new n,yp=new o,vp=new n,zh=["getX","getY","getZ"];class Te extends Rh{static serialize(t,e={}){e={cloneBuffers:!0,...e};let{geometry:i,_roots:s,_indirectBuffer:r}=t,a=i.getIndex(),u={version:1,roots:null,index:null,indirectBuffer:null};if(e.cloneBuffers)u.roots=s.map((f)=>f.slice()),u.index=a?a.array.slice():null,u.indirectBuffer=r?r.slice():null;else u.roots=s,u.index=a?a.array:null,u.indirectBuffer=r;return u}static deserialize(t,e,i={}){i={setIndex:!0,indirect:Boolean(t.indirectBuffer),...i};let{index:s,roots:r,indirectBuffer:a}=t;if(!t.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),f(r);let u=new Te(e,{...i,[Go]:!0});if(u._roots=r,u._indirectBuffer=a||null,i.setIndex){let x=e.getIndex();if(x===null){let A=new _(t.index,1,!1);e.setIndex(A)}else if(x.array!==s)x.array.set(s),x.needsUpdate=!0}return u;function f(x){for(let A=0;A<x.length;A++){let L=x[A],D=new Uint32Array(L),R=new Uint16Array(L);for(let V=0,rt=L.byteLength/Wi;V<rt;V++){let Ct=Si*V,j=2*Ct;if(!ui(j,R))D[Ct+6]=D[Ct+6]/Si-V}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){if(e.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris};super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,i){let s=this.geometry,r=this._indirectBuffer,a=s.attributes.position,u=s.index?s.index.array:null,x=(r?r[t]:t)*3,A=x+0,L=x+1,D=x+2;if(u)A=u[A],L=u[L],D=u[D];for(let R=0;R<3;R++){let V=a[zh[R]](A),rt=a[zh[R]](L),Ct=a[zh[R]](D),j=V;if(rt<j)j=rt;if(Ct<j)j=Ct;let it=V;if(rt>it)it=rt;if(Ct>it)it=Ct;e[i+R]=j,e[i+R+3]=it}return e}computePrimitiveBounds(t,e,i){let s=this.geometry,r=this._indirectBuffer,a=s.attributes.position,u=s.index?s.index.array:null,f=a.normalized;if(t<0||e+t-i.offset>i.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let x=a.array,A=a.offset||0,L=3;if(a.isInterleavedBufferAttribute)L=a.data.stride;let D=["getX","getY","getZ"],R=i.offset;for(let V=t,rt=t+e;V<rt;V++){let j=(r?r[V]:V)*3,it=(V-R)*6,ft=j+0,Pt=j+1,pt=j+2;if(u)ft=u[ft],Pt=u[Pt],pt=u[pt];if(!f)ft=ft*L+A,Pt=Pt*L+A,pt=pt*L+A;for(let Nt=0;Nt<3;Nt++){let se,nt,Rt;if(f)se=a[D[Nt]](ft),nt=a[D[Nt]](Pt),Rt=a[D[Nt]](pt);else se=x[ft+Nt],nt=x[Pt+Nt],Rt=x[pt+Nt];let re=se;if(nt<re)re=nt;if(Rt<re)re=Rt;let be=se;if(nt>be)be=nt;if(Rt>be)be=Rt;let he=(be-re)/2,Pe=Nt*2;i[it+Pe+0]=re+he,i[it+Pe+1]=he+(Math.abs(re)+he)*Kr}}return i}raycastObject3D(t,e,i=[]){let{material:s}=t;if(s===void 0)return;yp.copy(t.matrixWorld).invert(),gl.copy(e.ray).applyMatrix4(yp),vp.setFromMatrixScale(t.matrixWorld),xp.copy(gl.direction).multiply(vp);let r=xp.length(),a=e.near/r,u=e.far/r;if(e.firstHitOnly===!0){let f=this.raycastFirst(gl,s,a,u);if(f=Bh(f,t,e),f)i.push(f)}else{let f=this.raycast(gl,s,a,u);for(let x=0,A=f.length;x<A;x++){let L=Bh(f[x],t,e);if(L)i.push(L)}}return i}refit(t=null){return(this.indirect?fp:ip)(this,t)}raycast(t,e=pe,i=0,s=1/0){let r=this._roots,a=[],u=this.indirect?dp:ap;for(let f=0,x=r.length;f<x;f++)u(this,f,e,t,a,i,s);return a}raycastFirst(t,e=pe,i=0,s=1/0){let r=this._roots,a=null,u=this.indirect?pp:lp;for(let f=0,x=r.length;f<x;f++){let A=u(this,f,e,t,i,s);if(A!=null&&(a==null||A.distance<a.distance))a=A}return a}intersectsGeometry(t,e){let i=!1,s=this._roots,r=this.indirect?gp:hp;for(let a=0,u=s.length;a<u;a++)if(i=r(this,a,t,e),i)break;return i}shapecast(t){let e=rs.getPrimitive(),i=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?op:np});return rs.releasePrimitive(e),i}bvhcast(t,e,i){let{intersectsRanges:s,intersectsTriangles:r}=i,a=rs.getPrimitive(),u=this.geometry.index,f=this.geometry.attributes.position,x=this.indirect?(V)=>{let rt=this.resolveTriangleIndex(V);Ei(a,rt*3,u,f)}:(V)=>{Ei(a,V*3,u,f)},A=rs.getPrimitive(),L=t.geometry.index,D=t.geometry.attributes.position,R=t.indirect?(V)=>{let rt=t.resolveTriangleIndex(V);Ei(A,rt*3,L,D)}:(V)=>{Ei(A,V*3,L,D)};if(r){if(!(t instanceof Te))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let V=(rt,Ct,j,it,ft,Pt,pt,Nt)=>{for(let se=j,nt=j+it;se<nt;se++){R(se),A.a.applyMatrix4(e),A.b.applyMatrix4(e),A.c.applyMatrix4(e),A.needsUpdate=!0;for(let Rt=rt,re=rt+Ct;Rt<re;Rt++)if(x(Rt),a.needsUpdate=!0,r(a,A,Rt,se,ft,Pt,pt,Nt))return!0}return!1};if(s){let rt=s;s=function(Ct,j,it,ft,Pt,pt,Nt,se){if(!rt(Ct,j,it,ft,Pt,pt,Nt,se))return V(Ct,j,it,ft,Pt,pt,Nt,se);return!0}}else s=V}return super.bvhcast(t,e,{intersectsRanges:s})}intersectsBox(t,e){return ml.set(t.min,t.max,e),ml.needsUpdate=!0,this.shapecast({intersectsBounds:(i)=>ml.intersectsBox(i),intersectsTriangle:(i)=>ml.intersectsTriangle(i)})}intersectsSphere(t){return this.shapecast({intersectsBounds:(e)=>t.intersectsBox(e),intersectsTriangle:(e)=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,i={},s={},r=0,a=1/0){return(this.indirect?_p:up)(this,t,e,i,s,r,a)}closestPointToPoint(t,e={},i=0,s=1/0){return Zd(this,t,e,i,s)}}var ZA=parseInt(yr)>=166,uo={Mesh:h.prototype.raycast,Line:ae.prototype.raycast,LineSegments:X.prototype.raycast,LineLoop:Ye.prototype.raycast,Points:z.prototype.raycast,BatchedMesh:Oa.prototype.raycast},qi=new h,_l=[];function Sp(t,e){if(this.isBatchedMesh)qy.call(this,t,e);else{let{geometry:i}=this;if(i.boundsTree)i.boundsTree.raycastObject3D(this,t,e);else{let s;if(this instanceof h)s=uo.Mesh;else if(this instanceof X)s=uo.LineSegments;else if(this instanceof Ye)s=uo.LineLoop;else if(this instanceof ae)s=uo.Line;else if(this instanceof z)s=uo.Points;else throw Error("BVH: Fallback raycast function not found.");s.call(this,t,e)}}}function qy(t,e){if(this.boundsTrees){let i=this.boundsTrees,s=this._drawInfo||this._instanceInfo,r=this._drawRanges||this._geometryInfo,a=this.matrixWorld;qi.material=this.material,qi.geometry=this.geometry;let u=qi.geometry.boundsTree,f=qi.geometry.drawRange;if(qi.geometry.boundingSphere===null)qi.geometry.boundingSphere=new E;for(let x=0,A=s.length;x<A;x++){if(!this.getVisibleAt(x))continue;let L=s[x].geometryIndex;if(qi.geometry.boundsTree=i[L],this.getMatrixAt(x,qi.matrixWorld).premultiply(a),!qi.geometry.boundsTree){this.getBoundingBoxAt(L,qi.geometry.boundingBox),this.getBoundingSphereAt(L,qi.geometry.boundingSphere);let D=r[L];qi.geometry.setDrawRange(D.start,D.count)}qi.raycast(t,_l);for(let D=0,R=_l.length;D<R;D++){let V=_l[D];V.object=this,V.batchId=x,e.push(V)}_l.length=0}qi.geometry.boundsTree=u,qi.geometry.drawRange=f,qi.material=null,qi.geometry=null}else uo.BatchedMesh.call(this,t,e)}var K=11;function Yy(t){let{roots:e,indirectBuffer:i}=Te.serialize(t,{cloneBuffers:!1});return e.reduce((s,r)=>s+r.byteLength,i?.byteLength??0)}function tn(t,e){let i=performance.now(),s=e?Te.deserialize(e,t.geometry,{setIndex:!1}):new Te(t.geometry,{indirect:!0}),r=Yy(s);return t.geometry.boundsTree=s,t.raycast=Sp,performance.measure("map2lap.bvh",{start:i,detail:r}),r}var we=(t)=>t.vertices*K*4+4+t.indices*2;function _n(t,e){let{vertices:i,indices:s}=t;if(!Number.isInteger(i)||i<0||i>65535||!Number.isInteger(s)||s<0||s%3||e.byteLength!==we(t))throw Error("Invalid track geometry");let r=i*K*4;if(new DataView(e).getUint32(r,!0)!==s||new Uint16Array(e,r+4,s).some((a)=>a>=i))throw Error("Invalid track triangle indices")}function nn(t,e,i){return`/api/editor/${encodeURIComponent(t)}/mesh/${i.i}?r=${e.revision}`+(i.model?`&d=${e.draft??0}`:i.copy?`&c=${e.copy_revision??""}`:"")}function Zy(t,e,i){return Math.hypot(...t.map((s,r)=>Math.max(Math.abs(e[r]-s),Math.abs(i[r]-s))))}function Ze(t,e){t.computeBoundingBox();let i=t.boundingBox;t.boundingSphere=new E(new n(...e.center),Math.max(e.radius,Zy(e.center,i.min.toArray(),i.max.toArray())))}function At(t,e){let i=new m,s=new De(new Float32Array(e,0,t.vertices*K),K);i.setAttribute("position",new k(s,3,0)),i.setAttribute("normal",new k(s,3,3)),i.setAttribute("uv",new k(s,2,6));let r=t.vertices*K*4+4;return i.setIndex(new _(new Uint16Array(e,r,t.indices),1)),Ze(i,t),i}
export{Le,Ie,pe,B,w,mt,Lt,ke,It,gt,xe,Oe,kt,oe,Ot,je,I,st,ee,te,q,Dt,ot,at,lt,vt,yt,bt,xt,dn,Xt,hn,_t,ct,Ee,_e,J,fn,W,l,H,n,y,S,b,ne,o,M,C,c,St,ce,p,_,g,E,m,De,k,N,F,me,Y,h,Vt,Tt,ge,wt,Xe,ue,de,P,ae,X,Ye,ve,z,Mt,Bt,Ve,qe,Et,Ht,Yt,le,G,ie,Ae,Be,Ft,Re,He,Fe,Je,zt,Se,ut,Gt,Zt,ye,$t,Qe,U,Kt,dt,Ce,ze,jt,Ge,qt,Jt,T,et,Z,tt,O,Qt,en,v,d,Q,ht,We,Te,K,tn,we,_n,nn,Ze,At};
