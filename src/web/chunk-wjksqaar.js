var pr="187",Re={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},We={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Fu=0,Xl=1,Ou=2;var So=1,Bu=2,Hr=3,ne=0,C=1,Y=2,mr=0,Mo=1,it=2,ql=3,Yl=4,_t=5;var Ce=100,zu=101,Gu=102,ku=103,Hu=104,Vu=200,bt=201,Wu=202,Xu=203,qu=204,Yu=205,Zu=206,Ju=207,$u=208,Ku=209,Qu=210,ju=211,tf=212,ef=213,nf=214,sf=0,rf=1,of=2,Zl=3,af=4,lf=5,cf=6,hf=7,uf=0,ff=1,df=2,Ts=0,Jl=1,$l=2,Kl=3,st=4,Ql=5,jl=6,tc=7;var bo=301,Vr=302,ba=303,Ta=304,ce=1000,Ue=1001,St=1002,G=1003,Tt=1004;var ke=1005;var A=1006,Ge=1007;var F=1008;var xs=1009,pf=1010,mf=1011,To=1012,ec=1013,Js=1014,Gs=1015,H=1016,nc=1017,ic=1018,gr=1020,gf=35902,_f=35899,xf=1021,yf=1022,V=1023,Wr=1026,$s=1027,xt=1028,sc=1029,_r=1030,rc=1031;var oc=1033,$e=33776,Aa=33777,Ke=33778,je=33779,ac=35840,lc=35841,cc=35842,hc=35843,rt=36196,uc=37492,fc=37496,dc=37488,pc=37489,Ea=37490,mc=37491,gc=37808,_c=37809,xc=37810,yc=37811,vc=37812,Sc=37813,Mc=37814,bc=37815,Tc=37816,Ac=37817,Ec=37818,wc=37819,Rc=37820,Cc=37821,ot=36492,at=36494,lt=36495,Ic=36283,Pc=36284,wa=36285,Lc=36286;var Vt=2300,Mt=2301;var kt=0,ct=1,qe=2;var Nc=0,vf=1,ge="",ue="srgb",k="srgb-linear",Dc="linear",_i="srgb";var Sf=512,Mf=513,bf=514,Uc=515,Tf=516,Af=517,Fc=518,Oc=519;var Bc="300 es",zc=2000,Bt=2001;function Mp(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function bp(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function Gr(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function Ef(){let t=Gr("canvas");return t.style.display="block",t}var Xh={},kr=null;function vo(...t){let e="THREE."+t.shift();if(kr)kr("log",e,...t);else console.log(e,...t)}function wf(t){let e=t[0];if(typeof e==="string"&&e.startsWith("TSL:")){let i=t[1];if(i&&i.isStackTrace)t[0]+=" "+i.getLocation();else t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function Gn(...t){t=wf(t);let e="THREE."+t.shift();if(kr)kr("warn",e,...t);else{let i=t[0];if(i&&i.isStackTrace)console.warn(i.getError(e));else console.warn(e,...t)}}function qn(...t){t=wf(t);let e="THREE."+t.shift();if(kr)kr("error",e,...t);else{let i=t[0];if(i&&i.isStackTrace)console.error(i.getError(e));else console.error(e,...t)}}function fr(...t){let e=t.join(" ");if(e in Xh)return;Xh[e]=!0,Gn(...t)}function Rf(t,e,i){return new Promise(function(s,a){function c(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:a();break;case t.TIMEOUT_EXPIRED:setTimeout(c,i);break;default:s()}}setTimeout(c,i)})}var Cf={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class As{addEventListener(t,e){if(this._listeners===void 0)this._listeners={};let i=this._listeners;if(i[t]===void 0)i[t]=[];if(i[t].indexOf(e)===-1)i[t].push(e)}hasEventListener(t,e){let i=this._listeners;if(i===void 0)return!1;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let a=s.indexOf(e);if(a!==-1)s.splice(a,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let a=0,c=s.length;a<c;a++)s[a].call(this,t);t.target=null}}}var Wi=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],qh=1234567,xo=Math.PI/180,dr=180/Math.PI;function Es(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Wi[t&255]+Wi[t>>8&255]+Wi[t>>16&255]+Wi[t>>24&255]+"-"+Wi[e&255]+Wi[e>>8&255]+"-"+Wi[e>>16&15|64]+Wi[e>>24&255]+"-"+Wi[i&63|128]+Wi[i>>8&255]+"-"+Wi[i>>16&255]+Wi[i>>24&255]+Wi[s&255]+Wi[s>>8&255]+Wi[s>>16&255]+Wi[s>>24&255]).toLowerCase()}function Yn(t,e,i){return Math.max(e,Math.min(i,t))}function Gc(t,e){return(t%e+e)%e}function Tp(t,e,i,s,a){return s+(t-e)*(a-s)/(i-e)}function Ap(t,e,i){if(t!==e)return(i-t)/(e-t);else return 0}function yo(t,e,i){return(1-i)*t+i*e}function Ep(t,e,i,s){return yo(t,e,1-Math.exp(-i*s))}function wp(t,e=1){return e-Math.abs(Gc(t,e*2)-e)}function Rp(t,e,i){if(t<=e)return 0;if(t>=i)return 1;return t=(t-e)/(i-e),t*t*(3-2*t)}function Cp(t,e,i){if(t<=e)return 0;if(t>=i)return 1;return t=(t-e)/(i-e),t*t*t*(t*(t*6-15)+10)}function Ip(t,e){return t+Math.floor(Math.random()*(e-t+1))}function Pp(t,e){return t+Math.random()*(e-t)}function Lp(t){return t*(0.5-Math.random())}function Np(t){if(t!==void 0)qh=t;let e=qh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Dp(t){return t*xo}function Up(t){return t*dr}function Fp(t){return t>0&&Number.isInteger(t)&&2**Math.round(Math.log2(t))===t}function Op(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function kc(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function Bp(t,e,i,s,a){let{cos:c,sin:d}=Math,p=c(i/2),S=d(i/2),E=c((e+s)/2),N=d((e+s)/2),D=c((e-s)/2),L=d((e-s)/2),tt=c((s-e)/2),vt=d((s-e)/2);switch(a){case"XYX":t.set(p*N,S*D,S*L,p*E);break;case"YZY":t.set(S*L,p*N,S*D,p*E);break;case"ZXZ":t.set(S*D,S*L,p*N,p*E);break;case"XZX":t.set(p*N,S*vt,S*tt,p*E);break;case"YXY":t.set(S*tt,p*N,S*vt,p*E);break;case"ZYZ":t.set(S*vt,S*tt,p*N,p*E);break;default:Gn("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+a)}}function Ra(t){switch(t.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Hc(t,e){if(e.constructor===Float32Array)return t;let i=Ra(e);if(i===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(t/i,-1)}function Vc(t,e){if(e.constructor===Float32Array)return t;let i=Ra(e);if(i===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(t*i)}var B={DEG2RAD:xo,RAD2DEG:dr,generateUUID:Es,clamp:Yn,euclideanModulo:Gc,mapLinear:Tp,inverseLerp:Ap,lerp:yo,damp:Ep,pingpong:wp,smoothstep:Rp,smootherstep:Cp,randInt:Ip,randFloat:Pp,randFloatSpread:Lp,seededRandom:Np,degToRad:Dp,radToDeg:Up,isPowerOfTwo:Fp,ceilPowerOfTwo:Op,floorPowerOfTwo:kc,setQuaternionFromProperEuler:Bp,normalize:Vc,denormalize:Hc};class o{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Yn(this.x,t.x,e.x),this.y=Yn(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Yn(this.x,t,e),this.y=Yn(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yn(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Yn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),a=this.x-t.x,c=this.y-t.y;return this.x=a*i-c*s+t.x,this.y=a*s+c*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class P{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,a,c,d){let p=i[s+0],S=i[s+1],E=i[s+2],N=i[s+3],D=a[c+0],L=a[c+1],tt=a[c+2],vt=a[c+3];if(N!==vt||p!==D||S!==L||E!==tt){let zt=p*D+S*L+E*tt+N*vt;if(zt<0)D=-D,L=-L,tt=-tt,vt=-vt,zt=-zt;let nt=1-d;if(zt<0.9995){let yt=Math.acos(zt),Dt=Math.sin(yt);nt=Math.sin(nt*yt)/Dt,d=Math.sin(d*yt)/Dt,p=p*nt+D*d,S=S*nt+L*d,E=E*nt+tt*d,N=N*nt+vt*d}else{p=p*nt+D*d,S=S*nt+L*d,E=E*nt+tt*d,N=N*nt+vt*d;let yt=1/Math.sqrt(p*p+S*S+E*E+N*N);p*=yt,S*=yt,E*=yt,N*=yt}}t[e]=p,t[e+1]=S,t[e+2]=E,t[e+3]=N}static multiplyQuaternionsFlat(t,e,i,s,a,c){let d=i[s],p=i[s+1],S=i[s+2],E=i[s+3],N=a[c],D=a[c+1],L=a[c+2],tt=a[c+3];return t[e]=d*tt+E*N+p*L-S*D,t[e+1]=p*tt+E*D+S*N-d*L,t[e+2]=S*tt+E*L+d*D-p*N,t[e+3]=E*tt-d*N-p*D-S*L,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let{_x:i,_y:s,_z:a,_order:c}=t,{cos:d,sin:p}=Math,S=d(i/2),E=d(s/2),N=d(a/2),D=p(i/2),L=p(s/2),tt=p(a/2);switch(c){case"XYZ":this._x=D*E*N+S*L*tt,this._y=S*L*N-D*E*tt,this._z=S*E*tt+D*L*N,this._w=S*E*N-D*L*tt;break;case"YXZ":this._x=D*E*N+S*L*tt,this._y=S*L*N-D*E*tt,this._z=S*E*tt-D*L*N,this._w=S*E*N+D*L*tt;break;case"ZXY":this._x=D*E*N-S*L*tt,this._y=S*L*N+D*E*tt,this._z=S*E*tt+D*L*N,this._w=S*E*N-D*L*tt;break;case"ZYX":this._x=D*E*N-S*L*tt,this._y=S*L*N+D*E*tt,this._z=S*E*tt-D*L*N,this._w=S*E*N+D*L*tt;break;case"YZX":this._x=D*E*N+S*L*tt,this._y=S*L*N+D*E*tt,this._z=S*E*tt-D*L*N,this._w=S*E*N-D*L*tt;break;case"XZY":this._x=D*E*N-S*L*tt,this._y=S*L*N-D*E*tt,this._z=S*E*tt+D*L*N,this._w=S*E*N+D*L*tt;break;default:Gn("Quaternion: .setFromEuler() encountered an unknown order: "+c)}if(e===!0)this._onChangeCallback();return this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],a=e[8],c=e[1],d=e[5],p=e[9],S=e[2],E=e[6],N=e[10],D=i+d+N;if(D>0){let L=0.5/Math.sqrt(D+1);this._w=0.25/L,this._x=(E-p)*L,this._y=(a-S)*L,this._z=(c-s)*L}else if(i>d&&i>N){let L=2*Math.sqrt(1+i-d-N);this._w=(E-p)/L,this._x=0.25*L,this._y=(s+c)/L,this._z=(a+S)/L}else if(d>N){let L=2*Math.sqrt(1+d-i-N);this._w=(a-S)/L,this._x=(s+c)/L,this._y=0.25*L,this._z=(p+E)/L}else{let L=2*Math.sqrt(1+N-i-d);this._w=(c-s)/L,this._x=(a+S)/L,this._y=(p+E)/L,this._z=0.25*L}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;if(i<0.00000001)if(i=0,Math.abs(t.x)>Math.abs(t.z))this._x=-t.y,this._y=t.x,this._z=0,this._w=i;else this._x=0,this._y=-t.z,this._z=t.y,this._w=i;else this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i;return this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Yn(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();if(t===0)this._x=0,this._y=0,this._z=0,this._w=1;else t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t;return this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let{_x:i,_y:s,_z:a,_w:c}=t,{_x:d,_y:p,_z:S,_w:E}=e;return this._x=i*E+c*d+s*S-a*p,this._y=s*E+c*p+a*d-i*S,this._z=a*E+c*S+i*p-s*d,this._w=c*E-i*d-s*p-a*S,this._onChangeCallback(),this}slerp(t,e){let{_x:i,_y:s,_z:a,_w:c}=t,d=this.dot(t);if(d<0)i=-i,s=-s,a=-a,c=-c,d=-d;let p=1-e;if(d<0.9995){let S=Math.acos(d),E=Math.sin(S);p=Math.sin(p*S)/E,e=Math.sin(e*S)/E,this._x=this._x*p+i*e,this._y=this._y*p+s*e,this._z=this._z*p+a*e,this._w=this._w*p+c*e,this._onChangeCallback()}else this._x=this._x*p+i*e,this._y=this._y*p+s*e,this._z=this._z*p+a*e,this._w=this._w*p+c*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),a=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),a*Math.sin(e),a*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class n{static{this.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){if(i===void 0)i=this.z;return this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Yh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Yh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[3]*i+a[6]*s,this.y=a[1]*e+a[4]*i+a[7]*s,this.z=a[2]*e+a[5]*i+a[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,a=t.elements,c=1/(a[3]*e+a[7]*i+a[11]*s+a[15]);return this.x=(a[0]*e+a[4]*i+a[8]*s+a[12])*c,this.y=(a[1]*e+a[5]*i+a[9]*s+a[13])*c,this.z=(a[2]*e+a[6]*i+a[10]*s+a[14])*c,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,{x:a,y:c,z:d,w:p}=t,S=2*(c*s-d*i),E=2*(d*e-a*s),N=2*(a*i-c*e);return this.x=e+p*S+c*N-d*E,this.y=i+p*E+d*S-a*N,this.z=s+p*N+a*E-c*S,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s,this.y=a[1]*e+a[5]*i+a[9]*s,this.z=a[2]*e+a[6]*i+a[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Yn(this.x,t.x,e.x),this.y=Yn(this.y,t.y,e.y),this.z=Yn(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Yn(this.x,t,e),this.y=Yn(this.y,t,e),this.z=Yn(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yn(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let{x:i,y:s,z:a}=t,{x:c,y:d,z:p}=e;return this.x=s*p-a*d,this.y=a*c-i*p,this.z=i*d-s*c,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ml.copy(this).projectOnVector(t),this.sub(ml)}reflect(t){return this.sub(ml.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Yn(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var ml=new n,Yh=new P;class Zn{static{this.prototype.isMatrix3=!0}constructor(t,e,i,s,a,c,d,p,S){if(this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0)this.set(t,e,i,s,a,c,d,p,S)}set(t,e,i,s,a,c,d,p,S){let E=this.elements;return E[0]=t,E[1]=s,E[2]=d,E[3]=e,E[4]=a,E[5]=p,E[6]=i,E[7]=c,E[8]=S,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,a=this.elements,c=i[0],d=i[3],p=i[6],S=i[1],E=i[4],N=i[7],D=i[2],L=i[5],tt=i[8],vt=s[0],zt=s[3],nt=s[6],yt=s[1],Dt=s[4],Ht=s[7],Ft=s[2],Xt=s[5],Jt=s[8];return a[0]=c*vt+d*yt+p*Ft,a[3]=c*zt+d*Dt+p*Xt,a[6]=c*nt+d*Ht+p*Jt,a[1]=S*vt+E*yt+N*Ft,a[4]=S*zt+E*Dt+N*Xt,a[7]=S*nt+E*Ht+N*Jt,a[2]=D*vt+L*yt+tt*Ft,a[5]=D*zt+L*Dt+tt*Xt,a[8]=D*nt+L*Ht+tt*Jt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],c=t[4],d=t[5],p=t[6],S=t[7],E=t[8];return e*c*E-e*d*S-i*a*E+i*d*p+s*a*S-s*c*p}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],c=t[4],d=t[5],p=t[6],S=t[7],E=t[8],N=E*c-d*S,D=d*p-E*a,L=S*a-c*p,tt=e*N+i*D+s*L;if(tt===0)return this.set(0,0,0,0,0,0,0,0,0);let vt=1/tt;return t[0]=N*vt,t[1]=(s*S-E*i)*vt,t[2]=(d*i-s*c)*vt,t[3]=D*vt,t[4]=(E*e-s*p)*vt,t[5]=(s*a-d*e)*vt,t[6]=L*vt,t[7]=(i*p-S*e)*vt,t[8]=(c*e-i*a)*vt,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,a,c,d){let p=Math.cos(a),S=Math.sin(a);return this.set(i*p,i*S,-i*(p*c+S*d)+c+t,-s*S,s*p,-s*(-S*c+p*d)+d+e,0,0,1),this}scale(t,e){return fr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(gl.makeScale(t,e)),this}rotate(t){return fr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(gl.makeRotation(-t)),this}translate(t,e){return fr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(gl.makeTranslation(t,e)),this}makeTranslation(t,e){if(t.isVector2)this.set(1,0,t.x,0,1,t.y,0,0,1);else this.set(1,0,t,0,1,e,0,0,1);return this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}var gl=new Zn,Zh=new Zn().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Jh=new Zn().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function zp(){let t={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(a,c,d){if(this.enabled===!1||c===d||!c||!d)return a;if(this.spaces[c].transfer==="srgb")a.r=zs(a.r),a.g=zs(a.g),a.b=zs(a.b);if(this.spaces[c].primaries!==this.spaces[d].primaries)a.applyMatrix3(this.spaces[c].toXYZ),a.applyMatrix3(this.spaces[d].fromXYZ);if(this.spaces[d].transfer==="srgb")a.r=zr(a.r),a.g=zr(a.g),a.b=zr(a.b);return a},workingToColorSpace:function(a,c){return this.convert(a,this.workingColorSpace,c)},colorSpaceToWorking:function(a,c){return this.convert(a,c,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){if(a==="")return"linear";return this.spaces[a].transfer},getToneMappingMode:function(a){return this.spaces[a].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(a,c=this.workingColorSpace){return a.fromArray(this.spaces[c].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,c,d){return a.copy(this.spaces[d].fromXYZ).multiply(this.spaces[c].toXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace}},e=[0.64,0.33,0.3,0.6,0.15,0.06],i=[0.2126,0.7152,0.0722],s=[0.3127,0.329];return t.define({["srgb-linear"]:{primaries:e,whitePoint:s,transfer:"linear",toXYZ:Zh,fromXYZ:Jh,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:e,whitePoint:s,transfer:"srgb",toXYZ:Zh,fromXYZ:Jh,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),t}var m=zp();function zs(t){return t<0.04045?t*0.0773993808:Math.pow(t*0.9478672986+0.0521327014,2.4)}function zr(t){return t<0.0031308?t*12.92:1.055*Math.pow(t,0.41666)-0.055}var br;class Wc{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src))return t.src;if(typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{if(br===void 0)br=Gr("canvas");br.width=t.width,br.height=t.height;let s=br.getContext("2d");if(t instanceof ImageData)s.putImageData(t,0,0);else s.drawImage(t,0,0,t.width,t.height);i=br}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Gr("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),a=s.data;for(let c=0;c<a.length;c++)a[c]=zs(a[c]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)e[i]=Math.floor(zs(e[i]/255)*255);else e[i]=zs(e[i]);return{data:e,width:t.width,height:t.height}}else return Gn("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}var Gp=0;class Ao{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Gp++}),this.uuid=Es(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)t.set(e.videoWidth,e.videoHeight,0);else if(typeof VideoFrame<"u"&&e instanceof VideoFrame)t.set(e.displayWidth,e.displayHeight,0);else if(e!==null)t.set(e.width||0,e.height||0,e.depth||0);else t.set(0,0,0);return t}set needsUpdate(t){if(t===!0)this.version++}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let a;if(Array.isArray(s)){a=[];for(let c=0,d=s.length;c<d;c++)if(s[c].isDataTexture)a.push(_l(s[c].image));else a.push(_l(s[c]))}else a=_l(s);i.url=a}if(!e)t.images[this.uuid]=i;return i}}function _l(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap)return Wc.getDataURL(t);else if(t.data)return{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name};else return Gn("Texture: Unable to serialize Texture."),{}}var kp=0,xl=new n;class v extends As{constructor(t=v.DEFAULT_IMAGE,e=v.DEFAULT_MAPPING,i=1001,s=1001,a=1006,c=1008,d=1023,p=1009,S=v.DEFAULT_ANISOTROPY,E=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:kp++}),this.uuid=Es(),this.name="",this.source=new Ao(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=a,this.minFilter=c,this.anisotropy=S,this.format=d,this.internalFormat=null,this.type=p,this.offset=new o(0,0),this.repeat=new o(1,1),this.center=new o(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zn,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=E,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=t&&t.depth&&t.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(xl).x}get height(){return this.source.getSize(xl).y}get depth(){return this.source.getSize(xl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Gn(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gn(`Texture.setValues(): property '${e}' does not exist.`);continue}if(s&&i&&(s.isVector2&&i.isVector2))s.copy(i);else if(s&&i&&(s.isVector3&&i.isVector3))s.copy(i);else if(s&&i&&(s.isMatrix3&&i.isMatrix3))s.copy(i);else this[e]=i}}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)i.userData=this.userData;if(!e)t.textures[this.uuid]=i;return i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case 1000:t.x=t.x-Math.floor(t.x);break;case 1001:t.x=t.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.x)%2)===1)t.x=Math.ceil(t.x)-t.x;else t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case 1000:t.y=t.y-Math.floor(t.y);break;case 1001:t.y=t.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.y)%2)===1)t.y=Math.ceil(t.y)-t.y;else t.y=t.y-Math.floor(t.y);break}if(this.flipY)t.y=1-t.y;return t}set needsUpdate(t){if(t===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(t){if(t===!0)this.pmremVersion++}}v.DEFAULT_IMAGE=null;v.DEFAULT_MAPPING=300;v.DEFAULT_ANISOTROPY=1;class y{static{this.prototype.isVector4=!0}constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,a=this.w,c=t.elements;return this.x=c[0]*e+c[4]*i+c[8]*s+c[12]*a,this.y=c[1]*e+c[5]*i+c[9]*s+c[13]*a,this.z=c[2]*e+c[6]*i+c[10]*s+c[14]*a,this.w=c[3]*e+c[7]*i+c[11]*s+c[15]*a,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);if(e<0.0001)this.x=1,this.y=0,this.z=0;else this.x=t.x/e,this.y=t.y/e,this.z=t.z/e;return this}setAxisAngleFromRotationMatrix(t){let e,i,s,a,c=0.01,d=0.1,p=t.elements,S=p[0],E=p[4],N=p[8],D=p[1],L=p[5],tt=p[9],vt=p[2],zt=p[6],nt=p[10];if(Math.abs(E-D)<0.01&&Math.abs(N-vt)<0.01&&Math.abs(tt-zt)<0.01){if(Math.abs(E+D)<0.1&&Math.abs(N+vt)<0.1&&Math.abs(tt+zt)<0.1&&Math.abs(S+L+nt-3)<0.1)return this.set(1,0,0,0),this;e=Math.PI;let Dt=(S+1)/2,Ht=(L+1)/2,Ft=(nt+1)/2,Xt=(E+D)/4,Jt=(N+vt)/4,gt=(tt+zt)/4;if(Dt>Ht&&Dt>Ft)if(Dt<0.01)i=0,s=0.707106781,a=0.707106781;else i=Math.sqrt(Dt),s=Xt/i,a=Jt/i;else if(Ht>Ft)if(Ht<0.01)i=0.707106781,s=0,a=0.707106781;else s=Math.sqrt(Ht),i=Xt/s,a=gt/s;else if(Ft<0.01)i=0.707106781,s=0.707106781,a=0;else a=Math.sqrt(Ft),i=Jt/a,s=gt/a;return this.set(i,s,a,e),this}let yt=Math.sqrt((zt-tt)*(zt-tt)+(N-vt)*(N-vt)+(D-E)*(D-E));if(Math.abs(yt)<0.001)yt=1;return this.x=(zt-tt)/yt,this.y=(N-vt)/yt,this.z=(D-E)/yt,this.w=Math.acos((S+L+nt-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Yn(this.x,t.x,e.x),this.y=Yn(this.y,t.y,e.y),this.z=Yn(this.z,t.z,e.z),this.w=Yn(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Yn(this.x,t,e),this.y=Yn(this.y,t,e),this.z=Yn(this.z,t,e),this.w=Yn(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yn(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xc extends As{constructor(t=1,e=1,i={}){super();i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new y(0,0,t,e),this.scissorTest=!1,this.viewport=new y(0,0,t,e),this.textures=[];let s=i.count;for(let a=0;a<s;a++)this.textures[a]=new v({width:t,height:e,depth:i.depth}),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(t.mapping!==void 0)e.mapping=t.mapping;if(t.wrapS!==void 0)e.wrapS=t.wrapS;if(t.wrapT!==void 0)e.wrapT=t.wrapT;if(t.wrapR!==void 0)e.wrapR=t.wrapR;if(t.magFilter!==void 0)e.magFilter=t.magFilter;if(t.minFilter!==void 0)e.minFilter=t.minFilter;if(t.format!==void 0)e.format=t.format;if(t.type!==void 0)e.type=t.type;if(t.anisotropy!==void 0)e.anisotropy=t.anisotropy;if(t.colorSpace!==void 0)e.colorSpace=t.colorSpace;if(t.flipY!==void 0)e.flipY=t.flipY;if(t.generateMipmaps!==void 0)e.generateMipmaps=t.generateMipmaps;if(t.mipmapsAutoUpdate!==void 0)e.mipmapsAutoUpdate=t.mipmapsAutoUpdate;if(t.internalFormat!==void 0)e.internalFormat=t.internalFormat;for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(t!==null&&t.renderTarget===null)t.renderTarget=this;this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,a=this.textures.length;s<a;s++)if(this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0)this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ao(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class z extends Xc{constructor(t=1,e=1,i={}){super(t,e,i);this.isWebGLRenderTarget=!0}}class Ca extends v{constructor(t=null,e=1,i=1,s=1){super(null);this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class qc extends v{constructor(t=null,e=1,i=1,s=1){super(null);this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}class r{static{this.prototype.isMatrix4=!0}constructor(t,e,i,s,a,c,d,p,S,E,N,D,L,tt,vt,zt){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0)this.set(t,e,i,s,a,c,d,p,S,E,N,D,L,tt,vt,zt)}set(t,e,i,s,a,c,d,p,S,E,N,D,L,tt,vt,zt){let nt=this.elements;return nt[0]=t,nt[4]=e,nt[8]=i,nt[12]=s,nt[1]=a,nt[5]=c,nt[9]=d,nt[13]=p,nt[2]=S,nt[6]=E,nt[10]=N,nt[14]=D,nt[3]=L,nt[7]=tt,nt[11]=vt,nt[15]=zt,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new r().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){if(this.determinantAffine()===0)return t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this;return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,s=1/Tr.setFromMatrixColumn(t,0).length(),a=1/Tr.setFromMatrixColumn(t,1).length(),c=1/Tr.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*a,e[5]=i[5]*a,e[6]=i[6]*a,e[7]=0,e[8]=i[8]*c,e[9]=i[9]*c,e[10]=i[10]*c,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,{x:i,y:s,z:a}=t,c=Math.cos(i),d=Math.sin(i),p=Math.cos(s),S=Math.sin(s),E=Math.cos(a),N=Math.sin(a);if(t.order==="XYZ"){let D=c*E,L=c*N,tt=d*E,vt=d*N;e[0]=p*E,e[4]=-p*N,e[8]=S,e[1]=L+tt*S,e[5]=D-vt*S,e[9]=-d*p,e[2]=vt-D*S,e[6]=tt+L*S,e[10]=c*p}else if(t.order==="YXZ"){let D=p*E,L=p*N,tt=S*E,vt=S*N;e[0]=D+vt*d,e[4]=tt*d-L,e[8]=c*S,e[1]=c*N,e[5]=c*E,e[9]=-d,e[2]=L*d-tt,e[6]=vt+D*d,e[10]=c*p}else if(t.order==="ZXY"){let D=p*E,L=p*N,tt=S*E,vt=S*N;e[0]=D-vt*d,e[4]=-c*N,e[8]=tt+L*d,e[1]=L+tt*d,e[5]=c*E,e[9]=vt-D*d,e[2]=-c*S,e[6]=d,e[10]=c*p}else if(t.order==="ZYX"){let D=c*E,L=c*N,tt=d*E,vt=d*N;e[0]=p*E,e[4]=tt*S-L,e[8]=D*S+vt,e[1]=p*N,e[5]=vt*S+D,e[9]=L*S-tt,e[2]=-S,e[6]=d*p,e[10]=c*p}else if(t.order==="YZX"){let D=c*p,L=c*S,tt=d*p,vt=d*S;e[0]=p*E,e[4]=vt-D*N,e[8]=tt*N+L,e[1]=N,e[5]=c*E,e[9]=-d*E,e[2]=-S*E,e[6]=L*N+tt,e[10]=D-vt*N}else if(t.order==="XZY"){let D=c*p,L=c*S,tt=d*p,vt=d*S;e[0]=p*E,e[4]=-N,e[8]=S*E,e[1]=D*N+vt,e[5]=c*E,e[9]=L*N-tt,e[2]=tt*N-L,e[6]=d*E,e[10]=vt*N+D}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Hp,t,Vp)}lookAt(t,e,i){let s=this.elements;if(rs.subVectors(t,e),rs.lengthSq()===0)rs.z=1;if(rs.normalize(),Vs.crossVectors(i,rs),Vs.lengthSq()===0){if(Math.abs(i.z)===1)rs.x+=0.0001;else rs.z+=0.0001;rs.normalize(),Vs.crossVectors(i,rs)}return Vs.normalize(),Yo.crossVectors(rs,Vs),s[0]=Vs.x,s[4]=Yo.x,s[8]=rs.x,s[1]=Vs.y,s[5]=Yo.y,s[9]=rs.y,s[2]=Vs.z,s[6]=Yo.z,s[10]=rs.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,a=this.elements,c=i[0],d=i[4],p=i[8],S=i[12],E=i[1],N=i[5],D=i[9],L=i[13],tt=i[2],vt=i[6],zt=i[10],nt=i[14],yt=i[3],Dt=i[7],Ht=i[11],Ft=i[15],Xt=s[0],Jt=s[4],gt=s[8],Ot=s[12],Kt=s[1],pe=s[5],Qt=s[9],me=s[13],Ee=s[2],jt=s[6],Ye=s[10],on=s[14],tn=s[3],yn=s[7],ln=s[11],dn=s[15];return a[0]=c*Xt+d*Kt+p*Ee+S*tn,a[4]=c*Jt+d*pe+p*jt+S*yn,a[8]=c*gt+d*Qt+p*Ye+S*ln,a[12]=c*Ot+d*me+p*on+S*dn,a[1]=E*Xt+N*Kt+D*Ee+L*tn,a[5]=E*Jt+N*pe+D*jt+L*yn,a[9]=E*gt+N*Qt+D*Ye+L*ln,a[13]=E*Ot+N*me+D*on+L*dn,a[2]=tt*Xt+vt*Kt+zt*Ee+nt*tn,a[6]=tt*Jt+vt*pe+zt*jt+nt*yn,a[10]=tt*gt+vt*Qt+zt*Ye+nt*ln,a[14]=tt*Ot+vt*me+zt*on+nt*dn,a[3]=yt*Xt+Dt*Kt+Ht*Ee+Ft*tn,a[7]=yt*Jt+Dt*pe+Ht*jt+Ft*yn,a[11]=yt*gt+Dt*Qt+Ht*Ye+Ft*ln,a[15]=yt*Ot+Dt*me+Ht*on+Ft*dn,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],a=t[12],c=t[1],d=t[5],p=t[9],S=t[13],E=t[2],N=t[6],D=t[10],L=t[14],tt=t[3],vt=t[7],zt=t[11],nt=t[15],yt=p*L-S*D,Dt=d*L-S*N,Ht=d*D-p*N,Ft=c*L-S*E,Xt=c*D-p*E,Jt=c*N-d*E;return e*(vt*yt-zt*Dt+nt*Ht)-i*(tt*yt-zt*Ft+nt*Xt)+s*(tt*Dt-vt*Ft+nt*Jt)-a*(tt*Ht-vt*Xt+zt*Jt)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],s=t[8],a=t[1],c=t[5],d=t[9],p=t[2],S=t[6],E=t[10];return e*(c*E-d*S)-i*(a*E-d*p)+s*(a*S-c*p)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;if(t.isVector3)s[12]=t.x,s[13]=t.y,s[14]=t.z;else s[12]=t,s[13]=e,s[14]=i;return this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],a=t[3],c=t[4],d=t[5],p=t[6],S=t[7],E=t[8],N=t[9],D=t[10],L=t[11],tt=t[12],vt=t[13],zt=t[14],nt=t[15],yt=e*d-i*c,Dt=e*p-s*c,Ht=e*S-a*c,Ft=i*p-s*d,Xt=i*S-a*d,Jt=s*S-a*p,gt=E*vt-N*tt,Ot=E*zt-D*tt,Kt=E*nt-L*tt,pe=N*zt-D*vt,Qt=N*nt-L*vt,me=D*nt-L*zt,Ee=yt*me-Dt*Qt+Ht*pe+Ft*Kt-Xt*Ot+Jt*gt;if(Ee===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let jt=1/Ee;return t[0]=(d*me-p*Qt+S*pe)*jt,t[1]=(s*Qt-i*me-a*pe)*jt,t[2]=(vt*Jt-zt*Xt+nt*Ft)*jt,t[3]=(D*Xt-N*Jt-L*Ft)*jt,t[4]=(p*Kt-c*me-S*Ot)*jt,t[5]=(e*me-s*Kt+a*Ot)*jt,t[6]=(zt*Ht-tt*Jt-nt*Dt)*jt,t[7]=(E*Jt-D*Ht+L*Dt)*jt,t[8]=(c*Qt-d*Kt+S*gt)*jt,t[9]=(i*Kt-e*Qt-a*gt)*jt,t[10]=(tt*Xt-vt*Ht+nt*yt)*jt,t[11]=(N*Ht-E*Xt-L*yt)*jt,t[12]=(d*Ot-c*pe-p*gt)*jt,t[13]=(e*pe-i*Ot+s*gt)*jt,t[14]=(vt*Dt-tt*Ft-zt*yt)*jt,t[15]=(E*Ft-N*Dt+D*yt)*jt,this}scale(t){let e=this.elements,{x:i,y:s,z:a}=t;return e[0]*=i,e[4]*=s,e[8]*=a,e[1]*=i,e[5]*=s,e[9]*=a,e[2]*=i,e[6]*=s,e[10]*=a,e[3]*=i,e[7]*=s,e[11]*=a,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){if(t.isVector3)this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1);else this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1);return this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),a=1-i,{x:c,y:d,z:p}=t,S=a*c,E=a*d;return this.set(S*c+i,S*d-s*p,S*p+s*d,0,S*d+s*p,E*d+i,E*p-s*c,0,S*p-s*d,E*p+s*c,a*p*p+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,a,c){return this.set(1,i,a,0,t,1,c,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,{_x:a,_y:c,_z:d,_w:p}=e,S=a+a,E=c+c,N=d+d,D=a*S,L=a*E,tt=a*N,vt=c*E,zt=c*N,nt=d*N,yt=p*S,Dt=p*E,Ht=p*N,{x:Ft,y:Xt,z:Jt}=i;return s[0]=(1-(vt+nt))*Ft,s[1]=(L+Ht)*Ft,s[2]=(tt-Dt)*Ft,s[3]=0,s[4]=(L-Ht)*Xt,s[5]=(1-(D+nt))*Xt,s[6]=(zt+yt)*Xt,s[7]=0,s[8]=(tt+Dt)*Jt,s[9]=(zt-yt)*Jt,s[10]=(1-(D+vt))*Jt,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let a=this.determinantAffine();if(a===0)return i.set(1,1,1),e.identity(),this;let c=Tr.set(s[0],s[1],s[2]).length(),d=Tr.set(s[4],s[5],s[6]).length(),p=Tr.set(s[8],s[9],s[10]).length();if(a<0)c=-c;ps.copy(this);let S=1/c,E=1/d,N=1/p;return ps.elements[0]*=S,ps.elements[1]*=S,ps.elements[2]*=S,ps.elements[4]*=E,ps.elements[5]*=E,ps.elements[6]*=E,ps.elements[8]*=N,ps.elements[9]*=N,ps.elements[10]*=N,e.setFromRotationMatrix(ps),i.x=c,i.y=d,i.z=p,this}makePerspective(t,e,i,s,a,c,d=2000,p=!1){let S=this.elements,E=2*a/(e-t),N=2*a/(i-s),D=(e+t)/(e-t),L=(i+s)/(i-s),tt,vt;if(p)tt=a/(c-a),vt=c*a/(c-a);else if(d===2000)tt=-(c+a)/(c-a),vt=-2*c*a/(c-a);else if(d===2001)tt=-c/(c-a),vt=-c*a/(c-a);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return S[0]=E,S[4]=0,S[8]=D,S[12]=0,S[1]=0,S[5]=N,S[9]=L,S[13]=0,S[2]=0,S[6]=0,S[10]=tt,S[14]=vt,S[3]=0,S[7]=0,S[11]=-1,S[15]=0,this}makeOrthographic(t,e,i,s,a,c,d=2000,p=!1){let S=this.elements,E=2/(e-t),N=2/(i-s),D=-(e+t)/(e-t),L=-(i+s)/(i-s),tt,vt;if(p)tt=1/(c-a),vt=c/(c-a);else if(d===2000)tt=-2/(c-a),vt=-(c+a)/(c-a);else if(d===2001)tt=-1/(c-a),vt=-a/(c-a);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return S[0]=E,S[4]=0,S[8]=0,S[12]=D,S[1]=0,S[5]=N,S[9]=0,S[13]=L,S[2]=0,S[6]=0,S[10]=tt,S[14]=vt,S[3]=0,S[7]=0,S[11]=0,S[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}var Tr=new n,ps=new r,Hp=new n(0,0,0),Vp=new n(1,1,1),Vs=new n,Yo=new n,rs=new n,$h=new r,Kh=new P;class _s{constructor(t=0,e=0,i=0,s=_s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,a=s[0],c=s[4],d=s[8],p=s[1],S=s[5],E=s[9],N=s[2],D=s[6],L=s[10];switch(e){case"XYZ":if(this._y=Math.asin(Yn(d,-1,1)),Math.abs(d)<0.9999999)this._x=Math.atan2(-E,L),this._z=Math.atan2(-c,a);else this._x=Math.atan2(D,S),this._z=0;break;case"YXZ":if(this._x=Math.asin(-Yn(E,-1,1)),Math.abs(E)<0.9999999)this._y=Math.atan2(d,L),this._z=Math.atan2(p,S);else this._y=Math.atan2(-N,a),this._z=0;break;case"ZXY":if(this._x=Math.asin(Yn(D,-1,1)),Math.abs(D)<0.9999999)this._y=Math.atan2(-N,L),this._z=Math.atan2(-c,S);else this._y=0,this._z=Math.atan2(p,a);break;case"ZYX":if(this._y=Math.asin(-Yn(N,-1,1)),Math.abs(N)<0.9999999)this._x=Math.atan2(D,L),this._z=Math.atan2(p,a);else this._x=0,this._z=Math.atan2(-c,S);break;case"YZX":if(this._z=Math.asin(Yn(p,-1,1)),Math.abs(p)<0.9999999)this._x=Math.atan2(-E,S),this._y=Math.atan2(-N,a);else this._x=0,this._y=Math.atan2(d,L);break;case"XZY":if(this._z=Math.asin(-Yn(c,-1,1)),Math.abs(c)<0.9999999)this._x=Math.atan2(D,S),this._y=Math.atan2(d,a);else this._x=Math.atan2(-E,L),this._y=0;break;default:Gn("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}if(this._order=e,i===!0)this._onChangeCallback();return this}setFromQuaternion(t,e,i){return $h.makeRotationFromQuaternion(t),this.setFromRotationMatrix($h,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Kh.setFromEuler(this),this.setFromQuaternion(Kh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){if(this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0)this._order=t[3];return this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_s.DEFAULT_ORDER="XYZ";class Eo{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}var Wp=0,Qh=new n,Ar=new P,Ns=new r,Zo=new n,lo=new n,Xp=new n,qp=new P,jh=new n(1,0,0),tu=new n(0,1,0),eu=new n(0,0,1),nu={type:"added"},Yp={type:"removed"},Er={type:"childadded",child:null},yl={type:"childremoved",child:null};class T extends As{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=Es(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=T.DEFAULT_UP.clone();let t=new n,e=new _s,i=new P,s=new n(1,1,1);function a(){i.setFromEuler(e,!1)}function c(){e.setFromQuaternion(i,void 0,!1)}e._onChange(a),i._onChange(c),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new r},normalMatrix:{value:new Zn}}),this.matrix=new r,this.matrixWorld=new r,this.matrixAutoUpdate=T.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=T.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Eo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ar.setFromAxisAngle(t,e),this.quaternion.multiply(Ar),this}rotateOnWorldAxis(t,e){return Ar.setFromAxisAngle(t,e),this.quaternion.premultiply(Ar),this}rotateX(t){return this.rotateOnAxis(jh,t)}rotateY(t){return this.rotateOnAxis(tu,t)}rotateZ(t){return this.rotateOnAxis(eu,t)}translateOnAxis(t,e){return Qh.copy(t).applyQuaternion(this.quaternion),this.position.add(Qh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(jh,t)}translateY(t){return this.translateOnAxis(tu,t)}translateZ(t){return this.translateOnAxis(eu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ns.copy(this.matrixWorld).invert())}lookAt(t,e,i){if(t.isVector3)Zo.copy(t);else Zo.set(t,e,i);let s=this.parent;if(this.updateWorldMatrix(!0,!1),lo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)Ns.lookAt(lo,Zo,this.up);else Ns.lookAt(Zo,lo,this.up);if(this.quaternion.setFromRotationMatrix(Ns),s)Ns.extractRotation(s.matrixWorld),Ar.setFromRotationMatrix(Ns),this.quaternion.premultiply(Ar.invert())}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}if(t===this)return qn("Object3D.add: object can't be added as a child of itself.",t),this;if(t&&t.isObject3D)t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(nu),Er.child=t,this.dispatchEvent(Er),Er.child=null;else qn("Object3D.add: object not an instance of THREE.Object3D.",t);return this}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);if(e!==-1)t.parent=null,this.children.splice(e,1),t.dispatchEvent(Yp),yl.child=t,this.dispatchEvent(yl),yl.child=null;return this}removeFromParent(){let t=this.parent;if(t!==null)t.remove(this);return this}clear(){return this.remove(...this.children)}attach(t){if(this.updateWorldMatrix(!0,!1),Ns.copy(this.matrixWorld).invert(),t.parent!==null)t.parent.updateWorldMatrix(!0,!1),Ns.multiply(t.parent.matrixWorld);return t.applyMatrix4(Ns),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(nu),Er.child=t,this.dispatchEvent(Er),Er.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let c=this.children[i].getObjectByProperty(t,e);if(c!==void 0)return c}return}getObjectsByProperty(t,e,i=[]){if(this[t]===e)i.push(this);let s=this.children;for(let a=0,c=s.length;a<c;a++)s[a].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,t,Xp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lo,qp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;if(e!==null)t(e),e.traverseAncestors(t)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let{x:e,y:i,z:s}=t,a=this.matrix.elements;a[12]+=e-a[0]*e-a[4]*i-a[8]*s,a[13]+=i-a[1]*e-a[5]*i-a[9]*s,a[14]+=s-a[2]*e-a[6]*i-a[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||t){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,t=!0}let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let s=this.parent;if(t===!0&&s!==null)s.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||i){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,i=!0}if(e===!0){let a=this.children;for(let c=0,d=a.length;c<d;c++)a[c].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t==="string",i={};if(e)t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let s={};if(s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)s.userData=this.userData;if(s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null)s.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)s.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)s.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map((d)=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map((d)=>({...d})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null)s.colorsTexture=this._colorsTexture.toJSON(t);if(this.boundingSphere!==null)s.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)s.boundingBox=this.boundingBox.toJSON()}function a(d,p){if(d[p.uuid]===void 0)d[p.uuid]=p.toJSON(t);return p.uuid}if(this.isScene){if(this.background){if(this.background.isColor)s.background=this.background.toJSON();else if(this.background.isTexture)s.background=this.background.toJSON(t).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)s.environment=this.environment.toJSON(t).uuid}else if(this.isMesh||this.isLine||this.isPoints){s.geometry=a(t.geometries,this.geometry);let d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){let p=d.shapes;if(Array.isArray(p))for(let S=0,E=p.length;S<E;S++){let N=p[S];a(t.shapes,N)}else a(t.shapes,p)}}if(this.isSkinnedMesh){if(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)a(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let d=[];for(let p=0,S=this.material.length;p<S;p++)d.push(a(t.materials,this.material[p]));s.material=d}else s.material=a(t.materials,this.material);if(this.children.length>0){s.children=[];for(let d=0;d<this.children.length;d++)s.children.push(this.children[d].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let d=0;d<this.animations.length;d++){let p=this.animations[d];s.animations.push(a(t.animations,p))}}if(e){let d=c(t.geometries),p=c(t.materials),S=c(t.textures),E=c(t.images),N=c(t.shapes),D=c(t.skeletons),L=c(t.animations),tt=c(t.nodes);if(d.length>0)i.geometries=d;if(p.length>0)i.materials=p;if(S.length>0)i.textures=S;if(E.length>0)i.images=E;if(N.length>0)i.shapes=N;if(D.length>0)i.skeletons=D;if(L.length>0)i.animations=L;if(tt.length>0)i.nodes=tt}return i.object=s,i;function c(d){let p=[];for(let S in d){let E=d[S];delete E.metadata,p.push(E)}return p}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}T.DEFAULT_UP=new n(0,1,0);T.DEFAULT_MATRIX_AUTO_UPDATE=!0;T.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class W extends T{constructor(){super();this.isGroup=!0,this.type="Group"}}var Zp={type:"move"};class wo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new W,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new W,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new n,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new n;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new W,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new n,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new n,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(t){if(this._targetRay!==null)this._targetRay.dispatchEvent(t);if(this._grip!==null)this._grip.dispatchEvent(t);if(this._hand!==null)this._hand.dispatchEvent(t);return this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){if(this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(t,e,i){let s=null,a=null,c=null,d=this._targetRay,p=this._grip,S=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(S&&t.hand){c=!0;for(let vt of t.hand.values()){let zt=e.getJointPose(vt,i),nt=this._getHandJoint(S,vt);if(zt!==null)nt.matrix.fromArray(zt.transform.matrix),nt.matrix.decompose(nt.position,nt.quaternion,nt.scale),nt.matrixWorldNeedsUpdate=!0,nt.jointRadius=zt.radius;nt.visible=zt!==null}let E=S.joints["index-finger-tip"],N=S.joints["thumb-tip"],D=E.position.distanceTo(N.position),L=0.02,tt=0.005;if(S.inputState.pinching&&D>L+tt)S.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this});else if(!S.inputState.pinching&&D<=L-tt)S.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this})}else if(p!==null&&t.gripSpace){if(a=e.getPose(t.gripSpace,i),a!==null){if(p.matrix.fromArray(a.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,a.linearVelocity)p.hasLinearVelocity=!0,p.linearVelocity.copy(a.linearVelocity);else p.hasLinearVelocity=!1;if(a.angularVelocity)p.hasAngularVelocity=!0,p.angularVelocity.copy(a.angularVelocity);else p.hasAngularVelocity=!1;if(p.eventsEnabled)p.dispatchEvent({type:"gripUpdated",data:t,target:this})}}if(d!==null){if(s=e.getPose(t.targetRaySpace,i),s===null&&a!==null)s=a;if(s!==null){if(d.matrix.fromArray(s.transform.matrix),d.matrix.decompose(d.position,d.quaternion,d.scale),d.matrixWorldNeedsUpdate=!0,s.linearVelocity)d.hasLinearVelocity=!0,d.linearVelocity.copy(s.linearVelocity);else d.hasLinearVelocity=!1;if(s.angularVelocity)d.hasAngularVelocity=!0,d.angularVelocity.copy(s.angularVelocity);else d.hasAngularVelocity=!1;this.dispatchEvent(Zp)}}}if(d!==null)d.visible=s!==null;if(p!==null)p.visible=a!==null;if(S!==null)S.visible=c!==null;return this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new W;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}var If={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ws={h:0,s:0,l:0},Jo={h:0,s:0,l:0};function vl(t,e,i){if(i<0)i+=1;if(i>1)i-=1;if(i<0.16666666666666666)return t+(e-t)*6*i;if(i<0.5)return e;if(i<0.6666666666666666)return t+(e-t)*6*(0.6666666666666666-i);return t}class l{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;if(s&&s.isColor)this.copy(s);else if(typeof s==="number")this.setHex(s);else if(typeof s==="string")this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e="srgb"){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,m.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=m.workingColorSpace){return this.r=t,this.g=e,this.b=i,m.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=m.workingColorSpace){if(t=Gc(t,1),e=Yn(e,0,1),i=Yn(i,0,1),e===0)this.r=this.g=this.b=i;else{let a=i<=0.5?i*(1+e):i+e-i*e,c=2*i-a;this.r=vl(c,a,t+0.3333333333333333),this.g=vl(c,a,t),this.b=vl(c,a,t-0.3333333333333333)}return m.colorSpaceToWorking(this,s),this}setStyle(t,e="srgb"){function i(a){if(a===void 0)return;if(parseFloat(a)<1)Gn("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let a,c=s[1],d=s[2];switch(c){case"rgb":case"rgba":if(a=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return i(a[4]),this.setRGB(Math.min(255,parseInt(a[1],10))/255,Math.min(255,parseInt(a[2],10))/255,Math.min(255,parseInt(a[3],10))/255,e);if(a=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return i(a[4]),this.setRGB(Math.min(100,parseFloat(a[1]))/100,Math.min(100,parseFloat(a[2]))/100,Math.min(100,parseFloat(a[3]))/100,e);break;case"hsl":case"hsla":if(a=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(d))return i(a[4]),this.setHSL(parseFloat(a[1])/360,parseFloat(a[2])/100,parseFloat(a[3])/100,e);break;default:Gn("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let a=s[1],c=a.length;if(c===3)return this.setRGB(parseInt(a.charAt(0),16)/15,parseInt(a.charAt(1),16)/15,parseInt(a.charAt(2),16)/15,e);else if(c===6)return this.setHex(parseInt(a,16),e);else Gn("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e="srgb"){let i=If[t.toLowerCase()];if(i!==void 0)this.setHex(i,e);else Gn("Color: Unknown color "+t);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=zs(t.r),this.g=zs(t.g),this.b=zs(t.b),this}copyLinearToSRGB(t){return this.r=zr(t.r),this.g=zr(t.g),this.b=zr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t="srgb"){return m.workingToColorSpace(Xi.copy(this),t),Math.round(Yn(Xi.r*255,0,255))*65536+Math.round(Yn(Xi.g*255,0,255))*256+Math.round(Yn(Xi.b*255,0,255))}getHexString(t="srgb"){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=m.workingColorSpace){m.workingToColorSpace(Xi.copy(this),e);let{r:i,g:s,b:a}=Xi,c=Math.max(i,s,a),d=Math.min(i,s,a),p,S,E=(d+c)/2;if(d===c)p=0,S=0;else{let N=c-d;switch(S=E<=0.5?N/(c+d):N/(2-c-d),c){case i:p=(s-a)/N+(s<a?6:0);break;case s:p=(a-i)/N+2;break;case a:p=(i-s)/N+4;break}p/=6}return t.h=p,t.s=S,t.l=E,t}getRGB(t,e=m.workingColorSpace){return m.workingToColorSpace(Xi.copy(this),e),t.r=Xi.r,t.g=Xi.g,t.b=Xi.b,t}getStyle(t="srgb"){m.workingToColorSpace(Xi.copy(this),t);let{r:e,g:i,b:s}=Xi;if(t!=="srgb")return`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`;return`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(Ws),this.setHSL(Ws.h+t,Ws.s+e,Ws.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Ws),t.getHSL(Jo);let i=yo(Ws.h,Jo.h,e),s=yo(Ws.s,Jo.s,e),a=yo(Ws.l,Jo.l,e);return this.setHSL(i,s,a),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,a=t.elements;return this.r=a[0]*e+a[3]*i+a[6]*s,this.g=a[1]*e+a[4]*i+a[7]*s,this.b=a[2]*e+a[5]*i+a[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var Xi=new l;l.NAMES=If;class ut{constructor(t,e=0.00025){this.isFogExp2=!0,this.name="",this.color=new l(t),this.density=e}clone(){return new ut(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class q extends T{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _s,this.environmentIntensity=1,this.environmentRotation=new _s,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);if(this.fog!==null)e.object.fog=this.fog.toJSON();return e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}var ms=new n,Ds=new n,Sl=new n,Us=new n,wr=new n,Rr=new n,iu=new n,Ml=new n,bl=new n,Tl=new n,Al=new y,El=new y,wl=new y;class Ii{constructor(t=new n,e=new n,i=new n){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),ms.subVectors(t,e),s.cross(ms);let a=s.lengthSq();if(a>0)return s.multiplyScalar(1/Math.sqrt(a));return s.set(0,0,0)}static getBarycoord(t,e,i,s,a){ms.subVectors(s,e),Ds.subVectors(i,e),Sl.subVectors(t,e);let c=ms.dot(ms),d=ms.dot(Ds),p=ms.dot(Sl),S=Ds.dot(Ds),E=Ds.dot(Sl),N=c*S-d*d;if(N===0)return a.set(0,0,0),null;let D=1/N,L=(S*p-d*E)*D,tt=(c*E-d*p)*D;return a.set(1-L-tt,tt,L)}static containsPoint(t,e,i,s){if(this.getBarycoord(t,e,i,s,Us)===null)return!1;return Us.x>=0&&Us.y>=0&&Us.x+Us.y<=1}static getInterpolation(t,e,i,s,a,c,d,p){if(this.getBarycoord(t,e,i,s,Us)===null){if(p.x=0,p.y=0,"z"in p)p.z=0;if("w"in p)p.w=0;return null}return p.setScalar(0),p.addScaledVector(a,Us.x),p.addScaledVector(c,Us.y),p.addScaledVector(d,Us.z),p}static getInterpolatedAttribute(t,e,i,s,a,c){return Al.setScalar(0),El.setScalar(0),wl.setScalar(0),Al.fromBufferAttribute(t,e),El.fromBufferAttribute(t,i),wl.fromBufferAttribute(t,s),c.setScalar(0),c.addScaledVector(Al,a.x),c.addScaledVector(El,a.y),c.addScaledVector(wl,a.z),c}static isFrontFacing(t,e,i,s){return ms.subVectors(i,e),Ds.subVectors(t,e),ms.cross(Ds).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ms.subVectors(this.c,this.b),Ds.subVectors(this.a,this.b),ms.cross(Ds).length()*0.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(t){return Ii.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Ii.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,a){return Ii.getInterpolation(t,this.a,this.b,this.c,e,i,s,a)}containsPoint(t){return Ii.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Ii.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,a=this.c,c,d;wr.subVectors(s,i),Rr.subVectors(a,i),Ml.subVectors(t,i);let p=wr.dot(Ml),S=Rr.dot(Ml);if(p<=0&&S<=0)return e.copy(i);bl.subVectors(t,s);let E=wr.dot(bl),N=Rr.dot(bl);if(E>=0&&N<=E)return e.copy(s);let D=p*N-E*S;if(D<=0&&p>=0&&E<=0&&p-E>0)return c=p/(p-E),e.copy(i).addScaledVector(wr,c);Tl.subVectors(t,a);let L=wr.dot(Tl),tt=Rr.dot(Tl);if(tt>=0&&L<=tt)return e.copy(a);let vt=L*S-p*tt;if(vt<=0&&S>=0&&tt<=0)return d=S/(S-tt),e.copy(i).addScaledVector(Rr,d);let zt=E*tt-L*N;if(zt<=0&&N-E>=0&&L-tt>=0)return iu.subVectors(a,s),d=(N-E)/(N-E+(L-tt)),e.copy(s).addScaledVector(iu,d);let nt=1/(zt+vt+D);return c=vt*nt,d=D*nt,e.copy(i).addScaledVector(wr,c).addScaledVector(Rr,d)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class h{constructor(t=new n(1/0,1/0,1/0),e=new n(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(gs.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(gs.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=gs.copy(e).multiplyScalar(0.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let a=i.getAttribute("position");if(e===!0&&a!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let c=0,d=a.count;c<d;c++){if(t.isMesh===!0)t.getVertexPosition(c,gs);else gs.fromBufferAttribute(a,c);gs.applyMatrix4(t.matrixWorld),this.expandByPoint(gs)}else{if(t.boundingBox!==void 0){if(t.boundingBox===null)t.computeBoundingBox();$o.copy(t.boundingBox)}else{if(i.boundingBox===null)i.computeBoundingBox();$o.copy(i.boundingBox)}$o.applyMatrix4(t.matrixWorld),this.union($o)}}let s=t.children;for(let a=0,c=s.length;a<c;a++)this.expandByObject(s[a],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,gs),gs.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;if(t.normal.x>0)e=t.normal.x*this.min.x,i=t.normal.x*this.max.x;else e=t.normal.x*this.max.x,i=t.normal.x*this.min.x;if(t.normal.y>0)e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y;else e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y;if(t.normal.z>0)e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z;else e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z;return e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(co),Ko.subVectors(this.max,co),Cr.subVectors(t.a,co),Ir.subVectors(t.b,co),Pr.subVectors(t.c,co),Xs.subVectors(Ir,Cr),qs.subVectors(Pr,Ir),ar.subVectors(Cr,Pr);let e=[0,-Xs.z,Xs.y,0,-qs.z,qs.y,0,-ar.z,ar.y,Xs.z,0,-Xs.x,qs.z,0,-qs.x,ar.z,0,-ar.x,-Xs.y,Xs.x,0,-qs.y,qs.x,0,-ar.y,ar.x,0];if(!Rl(e,Cr,Ir,Pr,Ko))return!1;if(e=[1,0,0,0,1,0,0,0,1],!Rl(e,Cr,Ir,Pr,Ko))return!1;return Qo.crossVectors(Xs,qs),e=[Qo.x,Qo.y,Qo.z],Rl(e,Cr,Ir,Pr,Ko)}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,gs).distanceTo(t)}getBoundingSphere(t){if(this.isEmpty())t.makeEmpty();else this.getCenter(t.center),t.radius=this.getSize(gs).length()*0.5;return t}intersect(t){if(this.min.max(t.min),this.max.min(t.max),this.isEmpty())this.makeEmpty();return this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){if(this.isEmpty())return this;return Fs[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Fs[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Fs[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Fs[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Fs[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Fs[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Fs[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Fs[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Fs),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}var Fs=[new n,new n,new n,new n,new n,new n,new n,new n],gs=new n,$o=new h,Cr=new n,Ir=new n,Pr=new n,Xs=new n,qs=new n,ar=new n,co=new n,Ko=new n,Qo=new n,lr=new n;function Rl(t,e,i,s,a){for(let c=0,d=t.length-3;c<=d;c+=3){lr.fromArray(t,c);let p=a.x*Math.abs(lr.x)+a.y*Math.abs(lr.y)+a.z*Math.abs(lr.z),S=e.dot(lr),E=i.dot(lr),N=s.dot(lr);if(Math.max(-Math.max(S,E,N),Math.min(S,E,N))>p)return!1}return!0}var Ci=new n,jo=new o,Jp=0;class _ extends As{constructor(t,e,i=!1){super();if(Array.isArray(t))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Jp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=t!==void 0?Ra(t):void 0}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,a=this.itemSize;s<a;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)jo.fromBufferAttribute(this,e),jo.applyMatrix3(t),this.setXY(e,jo.x,jo.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Ci.fromBufferAttribute(this,e),Ci.applyMatrix3(t),this.setXYZ(e,Ci.x,Ci.y,Ci.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Ci.fromBufferAttribute(this,e),Ci.applyMatrix4(t),this.setXYZ(e,Ci.x,Ci.y,Ci.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ci.fromBufferAttribute(this,e),Ci.applyNormalMatrix(t),this.setXYZ(e,Ci.x,Ci.y,Ci.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ci.fromBufferAttribute(this,e),Ci.transformDirection(t),this.setXYZ(e,Ci.x,Ci.y,Ci.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];if(this.normalized)i=this._denormalize(i);return i}setComponent(t,e,i){if(this.normalized)i=this._normalize(i);return this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];if(this.normalized)e=this._denormalize(e);return e}setX(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];if(this.normalized)e=this._denormalize(e);return e}setY(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];if(this.normalized)e=this._denormalize(e);return e}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];if(this.normalized)e=this._denormalize(e);return e}setW(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i);return this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s);return this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,a){if(t*=this.itemSize,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),a=this._normalize(a);return this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=a,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Hc(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Vc(t,this.array)}}class Ia extends _{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class Pa extends _{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class x extends _{constructor(t,e,i){super(new Float32Array(t),e,i)}}var $p=new h,ho=new n,Cl=new n;class M{constructor(t=new n,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;if(e!==void 0)i.copy(e);else $p.setFromPoints(t).getCenter(i);let s=0;for(let a=0,c=t.length;a<c;a++)s=Math.max(s,i.distanceToSquared(t[a]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);if(e.copy(t),i>this.radius*this.radius)e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center);return e}getBoundingBox(t){if(this.isEmpty())return t.makeEmpty(),t;return t.set(this.center,this.center),t.expandByScalar(this.radius),t}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ho.subVectors(t,this.center);let e=ho.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*0.5;this.center.addScaledVector(ho,s/i),this.radius+=s}return this}union(t){if(t.isEmpty())return this;if(this.isEmpty())return this.copy(t),this;if(this.center.equals(t.center)===!0)this.radius=Math.max(this.radius,t.radius);else Cl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ho.copy(t.center).add(Cl)),this.expandByPoint(ho.copy(t.center).sub(Cl));return this}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}var Kp=0,cs=new r,Il=new T,Lr=new n,os=new h,uo=new h,Fi=new n;class g extends As{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kp++}),this.uuid=Es(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){if(Array.isArray(t))this.index=new((Mp(t))?Pa:Ia)(t,1);else this.index=t;return this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;if(e!==void 0)e.applyMatrix4(t),e.needsUpdate=!0;let i=this.attributes.normal;if(i!==void 0){let a=new Zn().getNormalMatrix(t);i.applyNormalMatrix(a),i.needsUpdate=!0}let s=this.attributes.tangent;if(s!==void 0)s.transformDirection(t),s.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(t){return cs.makeRotationFromQuaternion(t),this.applyMatrix4(cs),this}rotateX(t){return cs.makeRotationX(t),this.applyMatrix4(cs),this}rotateY(t){return cs.makeRotationY(t),this.applyMatrix4(cs),this}rotateZ(t){return cs.makeRotationZ(t),this.applyMatrix4(cs),this}translate(t,e,i){return cs.makeTranslation(t,e,i),this.applyMatrix4(cs),this}scale(t,e,i){return cs.makeScale(t,e,i),this.applyMatrix4(cs),this}lookAt(t){return Il.lookAt(t),Il.updateMatrix(),this.applyMatrix4(Il.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Lr).negate(),this.translate(Lr.x,Lr.y,Lr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,a=t.length;s<a;s++){let c=t[s];i.push(c.x,c.y,c.z||0)}this.setAttribute("position",new x(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let a=t[s];e.setXYZ(s,a.x,a.y,a.z||0)}if(t.length>e.count)Gn("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");e.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new h;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){qn("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new n(-1/0,-1/0,-1/0),new n(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let a=e[i];if(os.setFromBufferAttribute(a),this.morphTargetsRelative)Fi.addVectors(this.boundingBox.min,os.min),this.boundingBox.expandByPoint(Fi),Fi.addVectors(this.boundingBox.max,os.max),this.boundingBox.expandByPoint(Fi);else this.boundingBox.expandByPoint(os.min),this.boundingBox.expandByPoint(os.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))qn('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new M;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){qn("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new n,1/0);return}if(t){let i=this.boundingSphere.center;if(os.setFromBufferAttribute(t),e)for(let a=0,c=e.length;a<c;a++){let d=e[a];if(uo.setFromBufferAttribute(d),this.morphTargetsRelative)Fi.addVectors(os.min,uo.min),os.expandByPoint(Fi),Fi.addVectors(os.max,uo.max),os.expandByPoint(Fi);else os.expandByPoint(uo.min),os.expandByPoint(uo.max)}os.getCenter(i);let s=0;for(let a=0,c=t.count;a<c;a++)Fi.fromBufferAttribute(t,a),s=Math.max(s,i.distanceToSquared(Fi));if(e)for(let a=0,c=e.length;a<c;a++){let d=e[a],p=this.morphTargetsRelative;for(let S=0,E=d.count;S<E;S++){if(Fi.fromBufferAttribute(d,S),p)Lr.fromBufferAttribute(t,S),Fi.add(Lr);s=Math.max(s,i.distanceToSquared(Fi))}}if(this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius))qn('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){qn("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:i,normal:s,uv:a}=e,c=this.getAttribute("tangent");if(c===void 0||c.count!==i.count)c=new _(new Float32Array(4*i.count),4),this.setAttribute("tangent",c);let d=[],p=[],S=new Uint8Array(i.count);for(let Ot=0;Ot<i.count;Ot++)d[Ot]=new n,p[Ot]=new n;let E=new n,N=new n,D=new n,L=new o,tt=new o,vt=new o,zt=new n,nt=new n;function yt(Ot,Kt,pe){S[Ot]=S[Kt]=S[pe]=1,E.fromBufferAttribute(i,Ot),N.fromBufferAttribute(i,Kt),D.fromBufferAttribute(i,pe),L.fromBufferAttribute(a,Ot),tt.fromBufferAttribute(a,Kt),vt.fromBufferAttribute(a,pe),N.sub(E),D.sub(E),tt.sub(L),vt.sub(L);let Qt=1/(tt.x*vt.y-vt.x*tt.y);if(!isFinite(Qt))return;zt.copy(N).multiplyScalar(vt.y).addScaledVector(D,-tt.y).multiplyScalar(Qt),nt.copy(D).multiplyScalar(tt.x).addScaledVector(N,-vt.x).multiplyScalar(Qt),d[Ot].add(zt),d[Kt].add(zt),d[pe].add(zt),p[Ot].add(nt),p[Kt].add(nt),p[pe].add(nt)}let Dt=this.groups;if(Dt.length===0)Dt=[{start:0,count:t.count}];for(let Ot=0,Kt=Dt.length;Ot<Kt;++Ot){let pe=Dt[Ot],{start:Qt,count:me}=pe;for(let Ee=Qt,jt=Qt+me;Ee<jt;Ee+=3)yt(t.getX(Ee+0),t.getX(Ee+1),t.getX(Ee+2))}let Ht=new n,Ft=new n,Xt=new n,Jt=new n;function gt(Ot){Xt.fromBufferAttribute(s,Ot),Jt.copy(Xt);let Kt=d[Ot];Ht.copy(Kt),Ht.sub(Xt.multiplyScalar(Xt.dot(Kt))).normalize(),Ft.crossVectors(Jt,Kt);let Qt=Ft.dot(p[Ot])<0?-1:1;c.setXYZW(Ot,Ht.x,Ht.y,Ht.z,Qt)}for(let Ot=0,Kt=i.count;Ot<Kt;++Ot)if(S[Ot])gt(Ot);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new _(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let D=0,L=i.count;D<L;D++)i.setXYZ(D,0,0,0);let s=new n,a=new n,c=new n,d=new n,p=new n,S=new n,E=new n,N=new n;if(t)for(let D=0,L=t.count;D<L;D+=3){let tt=t.getX(D+0),vt=t.getX(D+1),zt=t.getX(D+2);s.fromBufferAttribute(e,tt),a.fromBufferAttribute(e,vt),c.fromBufferAttribute(e,zt),E.subVectors(c,a),N.subVectors(s,a),E.cross(N),d.fromBufferAttribute(i,tt),p.fromBufferAttribute(i,vt),S.fromBufferAttribute(i,zt),d.add(E),p.add(E),S.add(E),i.setXYZ(tt,d.x,d.y,d.z),i.setXYZ(vt,p.x,p.y,p.z),i.setXYZ(zt,S.x,S.y,S.z)}else for(let D=0,L=e.count;D<L;D+=3)s.fromBufferAttribute(e,D+0),a.fromBufferAttribute(e,D+1),c.fromBufferAttribute(e,D+2),E.subVectors(c,a),N.subVectors(s,a),E.cross(N),i.setXYZ(D+0,E.x,E.y,E.z),i.setXYZ(D+1,E.x,E.y,E.z),i.setXYZ(D+2,E.x,E.y,E.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Fi.fromBufferAttribute(t,e),Fi.normalize(),t.setXYZ(e,Fi.x,Fi.y,Fi.z)}toNonIndexed(){function t(d,p){let{array:S,itemSize:E,normalized:N}=d,D=new S.constructor(p.length*E),L=0,tt=0;for(let vt=0,zt=p.length;vt<zt;vt++){if(d.isInterleavedBufferAttribute)L=p[vt]*d.data.stride+d.offset;else L=p[vt]*E;for(let nt=0;nt<E;nt++)D[tt++]=S[L++]}return new _(D,E,N)}if(this.index===null)return Gn("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new g,i=this.index.array,s=this.attributes;for(let d in s){let p=s[d],S=t(p,i);e.setAttribute(d,S)}let a=this.morphAttributes;for(let d in a){let p=[],S=a[d];for(let E=0,N=S.length;E<N;E++){let D=S[E],L=t(D,i);p.push(L)}e.morphAttributes[d]=p}e.morphTargetsRelative=this.morphTargetsRelative;let c=this.groups;for(let d=0,p=c.length;d<p;d++){let S=c[d];e.addGroup(S.start,S.count,S.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0)t.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let p=this.parameters;for(let S in p)if(p[S]!==void 0)t[S]=p[S];return t}t.data={attributes:{}};let e=this.index;if(e!==null)t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)};let i=this.attributes;for(let p in i){let S=i[p];t.data.attributes[p]=S.toJSON(t.data)}let s={},a=!1;for(let p in this.morphAttributes){let S=this.morphAttributes[p],E=[];for(let N=0,D=S.length;N<D;N++){let L=S[N];E.push(L.toJSON(t.data))}if(E.length>0)s[p]=E,a=!0}if(a)t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative;let c=this.groups;if(c.length>0)t.data.groups=JSON.parse(JSON.stringify(c));let d=this.boundingSphere;if(d!==null)t.data.boundingSphere=d.toJSON();return t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;if(i!==null)this.setIndex(i.clone());let s=t.attributes;for(let S in s){let E=s[S];this.setAttribute(S,E.clone(e))}let a=t.morphAttributes;for(let S in a){let E=[],N=a[S];for(let D=0,L=N.length;D<L;D++)E.push(N[D].clone(e));this.morphAttributes[S]=E}this.morphTargetsRelative=t.morphTargetsRelative;let c=t.groups;for(let S=0,E=c.length;S<E;S++){let N=c[S];this.addGroup(N.start,N.count,N.materialIndex)}let d=t.boundingBox;if(d!==null)this.boundingBox=d.clone();let p=t.boundingSphere;if(p!==null)this.boundingSphere=p.clone();return this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Be{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Es()}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,a=this.stride;s<a;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=su(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=this.array.slice(0).buffer;let i=new this.array.constructor(t.arrayBuffers[e]),s=new this.constructor(i,this.stride);return s.setUsage(this.usage),s}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=su(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=Array.from(new Uint32Array(this.array.slice(0).buffer));let i={uuid:this.uuid,buffer:e,type:this.array.constructor.name,stride:this.stride};return i.usage=this.usage,i}}function su(t){if(t.buffer._uuid===void 0)t.buffer._uuid=Es();if(t.byteOffset===0&&t.byteLength===t.buffer.byteLength)return t.buffer._uuid;return t.buffer._uuid+":"+t.byteOffset+":"+t.byteLength}var Ki=new n;class K{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s,this._normalizationScale=t!==void 0?Ra(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Ki.fromBufferAttribute(this,e),Ki.applyMatrix4(t),this.setXYZ(e,Ki.x,Ki.y,Ki.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Ki.fromBufferAttribute(this,e),Ki.applyNormalMatrix(t),this.setXYZ(e,Ki.x,Ki.y,Ki.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Ki.fromBufferAttribute(this,e),Ki.transformDirection(t),this.setXYZ(e,Ki.x,Ki.y,Ki.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];if(this.normalized)i=this._denormalize(i);return i}setComponent(t,e,i){if(this.normalized)i=this._normalize(i);return this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];if(this.normalized)e=this._denormalize(e);return e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];if(this.normalized)e=this._denormalize(e);return e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];if(this.normalized)e=this._denormalize(e);return e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];if(this.normalized)e=this._denormalize(e);return e}setXY(t,e,i){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i);return this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s);return this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,a){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),i=this._normalize(i),s=this._normalize(s),a=this._normalize(a);return this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=a,this}clone(t){if(t===void 0){vo("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[s+a])}return new _(new this.array.constructor(e),this.itemSize,this.normalized)}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.clone(t);return new K(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(t){if(t===void 0){vo("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let a=0;a<this.itemSize;a++)e.push(this.data.array[s+a])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Hc(t,this.data.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Vc(t,this.data.array)}}var Pl=new n,Qp=new n,jp=new Zn;class R{constructor(t=new n(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Pl.subVectors(i,e).cross(Qp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Pl),a=this.normal.dot(s);if(a===0){if(this.distanceToPoint(t.start)===0)return e.copy(t.start);return null}let c=-(t.start.dot(this.normal)+this.constant)/a;if(i===!0&&(c<0||c>1))return null;return e.copy(t.start).addScaledVector(s,c)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||jp.getNormalMatrix(t),s=this.coplanarPoint(Pl).applyMatrix4(t),a=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(a),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}var tm=0;class I extends As{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:tm++}),this.uuid=Es(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new l(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){if(this._alphaTest>0!==t>0)this.version++;this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t===void 0)return;for(let e in t){let i=t[e];if(i===void 0){Gn(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gn(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}if(s&&s.isColor)s.set(i);else if(s&&s.isVector2&&(i&&i.isVector2)||s&&s.isEuler&&(i&&i.isEuler)||s&&s.isVector3&&(i&&i.isVector3))s.copy(i);else this[e]=i}}toJSON(t){let e=t===void 0||typeof t==="string";if(e)t={textures:{},images:{}};let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor)i.color=this.color.getHex();if(this.roughness!==void 0)i.roughness=this.roughness;if(this.metalness!==void 0)i.metalness=this.metalness;if(this.sheen!==void 0)i.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)i.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)i.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)i.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)i.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)i.specular=this.specular.getHex();if(this.specularIntensity!==void 0)i.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)i.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)i.shininess=this.shininess;if(this.clearcoat!==void 0)i.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)i.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)i.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid;if(this.dispersion!==void 0)i.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)i.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)i.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)i.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid;if(this.anisotropy!==void 0)i.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)i.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid;if(this.map&&this.map.isTexture)i.map=this.map.toJSON(t).uuid;if(this.matcap&&this.matcap.isTexture)i.matcap=this.matcap.toJSON(t).uuid;if(this.alphaMap&&this.alphaMap.isTexture)i.alphaMap=this.alphaMap.toJSON(t).uuid;if(this.lightMap&&this.lightMap.isTexture)i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)i.roughnessMap=this.roughnessMap.toJSON(t).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)i.metalnessMap=this.metalnessMap.toJSON(t).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)i.emissiveMap=this.emissiveMap.toJSON(t).uuid;if(this.specularMap&&this.specularMap.isTexture)i.specularMap=this.specularMap.toJSON(t).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)i.specularColorMap=this.specularColorMap.toJSON(t).uuid;if(this.envMap&&this.envMap.isTexture){if(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0)i.combine=this.combine}if(this.envMapRotation!==void 0)i.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)i.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)i.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)i.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)i.gradientMap=this.gradientMap.toJSON(t).uuid;if(this.transmission!==void 0)i.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)i.transmissionMap=this.transmissionMap.toJSON(t).uuid;if(this.thickness!==void 0)i.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)i.thicknessMap=this.thicknessMap.toJSON(t).uuid;if(this.attenuationDistance!==void 0)i.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)i.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)i.size=this.size;if(this.sizeAttenuation!==void 0)i.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)i.clippingPlanes=this.clippingPlanes.map((a)=>a.toJSON());if(this.rotation!==void 0)i.rotation=this.rotation;if(this.depthPacking!==void 0)i.depthPacking=this.depthPacking;if(this.linewidth!==void 0)i.linewidth=this.linewidth;if(this.linecap!==void 0)i.linecap=this.linecap;if(this.linejoin!==void 0)i.linejoin=this.linejoin;if(this.dashSize!==void 0)i.dashSize=this.dashSize;if(this.gapSize!==void 0)i.gapSize=this.gapSize;if(this.scale!==void 0)i.scale=this.scale;if(this.wireframe!==void 0)i.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)i.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)i.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)i.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)i.flatShading=this.flatShading;if(this.fog!==void 0)i.fog=this.fog;if(Object.keys(this.userData).length>0)i.userData=this.userData;function s(a){let c=[];for(let d in a){let p=a[d];delete p.metadata,c.push(p)}return c}if(e){let a=s(t.textures),c=s(t.images);if(a.length>0)i.textures=a;if(c.length>0)i.images=c}return i}fromJSON(t,e){if(t.uuid!==void 0)this.uuid=t.uuid;if(t.name!==void 0)this.name=t.name;if(t.color!==void 0&&this.color!==void 0)this.color.setHex(t.color);if(t.roughness!==void 0)this.roughness=t.roughness;if(t.metalness!==void 0)this.metalness=t.metalness;if(t.sheen!==void 0)this.sheen=t.sheen;if(t.sheenColor!==void 0)this.sheenColor=new l().setHex(t.sheenColor);if(t.sheenRoughness!==void 0)this.sheenRoughness=t.sheenRoughness;if(t.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(t.emissive);if(t.specular!==void 0&&this.specular!==void 0)this.specular.setHex(t.specular);if(t.specularIntensity!==void 0)this.specularIntensity=t.specularIntensity;if(t.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(t.specularColor);if(t.shininess!==void 0)this.shininess=t.shininess;if(t.clearcoat!==void 0)this.clearcoat=t.clearcoat;if(t.clearcoatRoughness!==void 0)this.clearcoatRoughness=t.clearcoatRoughness;if(t.diffuseRoughness!==void 0)this.diffuseRoughness=t.diffuseRoughness;if(t.dispersion!==void 0)this.dispersion=t.dispersion;if(t.retroreflectivity!==void 0)this.retroreflectivity=t.retroreflectivity;if(t.iridescence!==void 0)this.iridescence=t.iridescence;if(t.iridescenceIOR!==void 0)this.iridescenceIOR=t.iridescenceIOR;if(t.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum;if(t.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum;if(t.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1];if(t.transmission!==void 0)this.transmission=t.transmission;if(t.thickness!==void 0)this.thickness=t.thickness;if(t.attenuationDistance!==void 0)this.attenuationDistance=t.attenuationDistance;if(t.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(t.attenuationColor);if(t.anisotropy!==void 0)this.anisotropy=t.anisotropy;if(t.anisotropyRotation!==void 0)this.anisotropyRotation=t.anisotropyRotation;if(t.fog!==void 0)this.fog=t.fog;if(t.flatShading!==void 0)this.flatShading=t.flatShading;if(t.blending!==void 0)this.blending=t.blending;if(t.combine!==void 0)this.combine=t.combine;if(t.side!==void 0)this.side=t.side;if(t.shadowSide!==void 0)this.shadowSide=t.shadowSide;if(t.opacity!==void 0)this.opacity=t.opacity;if(t.transparent!==void 0)this.transparent=t.transparent;if(t.alphaTest!==void 0)this.alphaTest=t.alphaTest;if(t.alphaHash!==void 0)this.alphaHash=t.alphaHash;if(t.depthFunc!==void 0)this.depthFunc=t.depthFunc;if(t.depthTest!==void 0)this.depthTest=t.depthTest;if(t.depthWrite!==void 0)this.depthWrite=t.depthWrite;if(t.colorWrite!==void 0)this.colorWrite=t.colorWrite;if(t.clippingPlanes!==void 0)this.clippingPlanes=t.clippingPlanes.map((i)=>new R().fromJSON(i));if(t.clipIntersection!==void 0)this.clipIntersection=t.clipIntersection;if(t.clipShadows!==void 0)this.clipShadows=t.clipShadows;if(t.depthPacking!==void 0)this.depthPacking=t.depthPacking;if(t.blendSrc!==void 0)this.blendSrc=t.blendSrc;if(t.blendDst!==void 0)this.blendDst=t.blendDst;if(t.blendEquation!==void 0)this.blendEquation=t.blendEquation;if(t.blendSrcAlpha!==void 0)this.blendSrcAlpha=t.blendSrcAlpha;if(t.blendDstAlpha!==void 0)this.blendDstAlpha=t.blendDstAlpha;if(t.blendEquationAlpha!==void 0)this.blendEquationAlpha=t.blendEquationAlpha;if(t.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(t.blendColor);if(t.blendAlpha!==void 0)this.blendAlpha=t.blendAlpha;if(t.stencilWriteMask!==void 0)this.stencilWriteMask=t.stencilWriteMask;if(t.stencilFunc!==void 0)this.stencilFunc=t.stencilFunc;if(t.stencilRef!==void 0)this.stencilRef=t.stencilRef;if(t.stencilFuncMask!==void 0)this.stencilFuncMask=t.stencilFuncMask;if(t.stencilFail!==void 0)this.stencilFail=t.stencilFail;if(t.stencilZFail!==void 0)this.stencilZFail=t.stencilZFail;if(t.stencilZPass!==void 0)this.stencilZPass=t.stencilZPass;if(t.stencilWrite!==void 0)this.stencilWrite=t.stencilWrite;if(t.wireframe!==void 0)this.wireframe=t.wireframe;if(t.wireframeLinewidth!==void 0)this.wireframeLinewidth=t.wireframeLinewidth;if(t.wireframeLinecap!==void 0)this.wireframeLinecap=t.wireframeLinecap;if(t.wireframeLinejoin!==void 0)this.wireframeLinejoin=t.wireframeLinejoin;if(t.rotation!==void 0)this.rotation=t.rotation;if(t.linewidth!==void 0)this.linewidth=t.linewidth;if(t.linecap!==void 0)this.linecap=t.linecap;if(t.linejoin!==void 0)this.linejoin=t.linejoin;if(t.dashSize!==void 0)this.dashSize=t.dashSize;if(t.gapSize!==void 0)this.gapSize=t.gapSize;if(t.scale!==void 0)this.scale=t.scale;if(t.polygonOffset!==void 0)this.polygonOffset=t.polygonOffset;if(t.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=t.polygonOffsetFactor;if(t.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=t.polygonOffsetUnits;if(t.dithering!==void 0)this.dithering=t.dithering;if(t.alphaToCoverage!==void 0)this.alphaToCoverage=t.alphaToCoverage;if(t.premultipliedAlpha!==void 0)this.premultipliedAlpha=t.premultipliedAlpha;if(t.forceSinglePass!==void 0)this.forceSinglePass=t.forceSinglePass;if(t.allowOverride!==void 0)this.allowOverride=t.allowOverride;if(t.visible!==void 0)this.visible=t.visible;if(t.toneMapped!==void 0)this.toneMapped=t.toneMapped;if(t.userData!==void 0)this.userData=t.userData;if(t.vertexColors!==void 0)if(typeof t.vertexColors==="number")this.vertexColors=t.vertexColors>0;else this.vertexColors=t.vertexColors;if(t.size!==void 0)this.size=t.size;if(t.sizeAttenuation!==void 0)this.sizeAttenuation=t.sizeAttenuation;if(t.map!==void 0)this.map=e[t.map]||null;if(t.matcap!==void 0)this.matcap=e[t.matcap]||null;if(t.alphaMap!==void 0)this.alphaMap=e[t.alphaMap]||null;if(t.bumpMap!==void 0)this.bumpMap=e[t.bumpMap]||null;if(t.bumpScale!==void 0)this.bumpScale=t.bumpScale;if(t.normalMap!==void 0)this.normalMap=e[t.normalMap]||null;if(t.normalMapType!==void 0)this.normalMapType=t.normalMapType;if(t.normalScale!==void 0){let i=t.normalScale;if(Array.isArray(i)===!1)i=[i,i];this.normalScale=new o().fromArray(i)}if(t.displacementMap!==void 0)this.displacementMap=e[t.displacementMap]||null;if(t.displacementScale!==void 0)this.displacementScale=t.displacementScale;if(t.displacementBias!==void 0)this.displacementBias=t.displacementBias;if(t.roughnessMap!==void 0)this.roughnessMap=e[t.roughnessMap]||null;if(t.metalnessMap!==void 0)this.metalnessMap=e[t.metalnessMap]||null;if(t.emissiveMap!==void 0)this.emissiveMap=e[t.emissiveMap]||null;if(t.emissiveIntensity!==void 0)this.emissiveIntensity=t.emissiveIntensity;if(t.specularMap!==void 0)this.specularMap=e[t.specularMap]||null;if(t.specularIntensityMap!==void 0)this.specularIntensityMap=e[t.specularIntensityMap]||null;if(t.specularColorMap!==void 0)this.specularColorMap=e[t.specularColorMap]||null;if(t.envMap!==void 0)this.envMap=e[t.envMap]||null;if(t.envMapRotation!==void 0)this.envMapRotation.fromArray(t.envMapRotation);if(t.envMapIntensity!==void 0)this.envMapIntensity=t.envMapIntensity;if(t.reflectivity!==void 0)this.reflectivity=t.reflectivity;if(t.refractionRatio!==void 0)this.refractionRatio=t.refractionRatio;if(t.lightMap!==void 0)this.lightMap=e[t.lightMap]||null;if(t.lightMapIntensity!==void 0)this.lightMapIntensity=t.lightMapIntensity;if(t.aoMap!==void 0)this.aoMap=e[t.aoMap]||null;if(t.aoMapIntensity!==void 0)this.aoMapIntensity=t.aoMapIntensity;if(t.gradientMap!==void 0)this.gradientMap=e[t.gradientMap]||null;if(t.clearcoatMap!==void 0)this.clearcoatMap=e[t.clearcoatMap]||null;if(t.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null;if(t.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null;if(t.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new o().fromArray(t.clearcoatNormalScale);if(t.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null;if(t.iridescenceMap!==void 0)this.iridescenceMap=e[t.iridescenceMap]||null;if(t.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null;if(t.transmissionMap!==void 0)this.transmissionMap=e[t.transmissionMap]||null;if(t.thicknessMap!==void 0)this.thicknessMap=e[t.thicknessMap]||null;if(t.anisotropyMap!==void 0)this.anisotropyMap=e[t.anisotropyMap]||null;if(t.sheenColorMap!==void 0)this.sheenColorMap=e[t.sheenColorMap]||null;if(t.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=Array(s);for(let a=0;a!==s;++a)i[a]=e[a].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){if(t===!0)this.version++}}var Os=new n,Ll=new n,ta=new n,ea=new n;class ie{constructor(t=new n,e=new n(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Os)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);if(i<0)return e.copy(this.origin);return e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Os.subVectors(t,this.origin).dot(this.direction);if(e<0)return this.origin.distanceToSquared(t);return Os.copy(this.origin).addScaledVector(this.direction,e),Os.distanceToSquared(t)}distanceSqToSegment(t,e,i,s){Ll.copy(t).add(e).multiplyScalar(0.5),ta.copy(e).sub(t).normalize(),ea.copy(this.origin).sub(Ll);let a=t.distanceTo(e)*0.5,c=-this.direction.dot(ta),d=ea.dot(this.direction),p=-ea.dot(ta),S=ea.lengthSq(),E=Math.abs(1-c*c),N,D,L,tt;if(E>0)if(N=c*p-d,D=c*d-p,tt=a*E,N>=0)if(D>=-tt)if(D<=tt){let vt=1/E;N*=vt,D*=vt,L=N*(N+c*D+2*d)+D*(c*N+D+2*p)+S}else D=a,N=Math.max(0,-(c*D+d)),L=-N*N+D*(D+2*p)+S;else D=-a,N=Math.max(0,-(c*D+d)),L=-N*N+D*(D+2*p)+S;else if(D<=-tt)N=Math.max(0,-(-c*a+d)),D=N>0?-a:Math.min(Math.max(-a,-p),a),L=-N*N+D*(D+2*p)+S;else if(D<=tt)N=0,D=Math.min(Math.max(-a,-p),a),L=D*(D+2*p)+S;else N=Math.max(0,-(c*a+d)),D=N>0?a:Math.min(Math.max(-a,-p),a),L=-N*N+D*(D+2*p)+S;else D=c>0?-a:a,N=Math.max(0,-(c*D+d)),L=-N*N+D*(D+2*p)+S;if(i)i.copy(this.origin).addScaledVector(this.direction,N);if(s)s.copy(Ll).addScaledVector(ta,D);return L}intersectSphere(t,e){if(t.radius<0)return null;Os.subVectors(t.center,this.origin);let i=Os.dot(this.direction),s=Os.dot(Os)-i*i,a=t.radius*t.radius;if(s>a)return null;let c=Math.sqrt(a-s),d=i-c,p=i+c;if(p<0)return null;if(d<0)return this.at(p,e);return this.at(d,e)}intersectsSphere(t){if(t.radius<0)return!1;return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0){if(t.distanceToPoint(this.origin)===0)return 0;return null}let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);if(i===null)return null;return this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);if(e===0)return!0;if(t.normal.dot(this.direction)*e<0)return!0;return!1}intersectBox(t,e){let i,s,a,c,d,p,S=1/this.direction.x,E=1/this.direction.y,N=1/this.direction.z,D=this.origin;if(S>=0)i=(t.min.x-D.x)*S,s=(t.max.x-D.x)*S;else i=(t.max.x-D.x)*S,s=(t.min.x-D.x)*S;if(E>=0)a=(t.min.y-D.y)*E,c=(t.max.y-D.y)*E;else a=(t.max.y-D.y)*E,c=(t.min.y-D.y)*E;if(i>c||a>s)return null;if(a>i||isNaN(i))i=a;if(c<s||isNaN(s))s=c;if(N>=0)d=(t.min.z-D.z)*N,p=(t.max.z-D.z)*N;else d=(t.max.z-D.z)*N,p=(t.min.z-D.z)*N;if(i>p||d>s)return null;if(d>i||i!==i)i=d;if(p<s||s!==s)s=p;if(s<0)return null;return this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Os)!==null}intersectTriangle(t,e,i,s,a){let c=this.origin,d=this.direction,{x:p,y:S,z:E}=d,N=t.x-c.x,D=t.y-c.y,L=t.z-c.z,tt=e.x-c.x,vt=e.y-c.y,zt=e.z-c.z,nt=i.x-c.x,yt=i.y-c.y,Dt=i.z-c.z,Ht=Math.abs(p),Ft=Math.abs(S),Xt=Math.abs(E),Jt,gt,Ot,Kt,pe,Qt,me,Ee,jt,Ye,on,tn;if(Ht>=Ft&&Ht>=Xt)if(Ot=p,Qt=N,jt=tt,tn=nt,p>=0)Jt=S,gt=E,Kt=D,pe=L,me=vt,Ee=zt,Ye=yt,on=Dt;else Jt=E,gt=S,Kt=L,pe=D,me=zt,Ee=vt,Ye=Dt,on=yt;else if(Ft>=Xt)if(Ot=S,Qt=D,jt=vt,tn=yt,S>=0)Jt=E,gt=p,Kt=L,pe=N,me=zt,Ee=tt,Ye=Dt,on=nt;else Jt=p,gt=E,Kt=N,pe=L,me=tt,Ee=zt,Ye=nt,on=Dt;else if(Ot=E,Qt=L,jt=zt,tn=Dt,E>=0)Jt=p,gt=S,Kt=N,pe=D,me=tt,Ee=vt,Ye=nt,on=yt;else Jt=S,gt=p,Kt=D,pe=N,me=vt,Ee=tt,Ye=yt,on=nt;if(Ot===0)return null;let yn=Jt/Ot,ln=gt/Ot,dn=1/Ot,gn=Kt-yn*Qt,Nn=pe-ln*Qt,fn=me-yn*jt,_n=Ee-ln*jt,Ln=Ye-yn*tn,Hn=on-ln*tn,Wn=Ln*_n-Hn*fn,Dn=gn*Hn-Nn*Ln,oi=fn*Nn-_n*gn;if(s){if(Wn<0||Dn<0||oi<0)return null}else if((Wn<0||Dn<0||oi<0)&&(Wn>0||Dn>0||oi>0))return null;let jn=Wn+Dn+oi;if(jn===0)return null;let Kn=dn*(Wn*Qt+Dn*jt+oi*tn);if(jn>0?Kn<0:Kn>0)return null;return this.at(Kn/jn,a)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class U extends I{constructor(t){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new l(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _s,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}var ru=new r,cr=new ie,na=new M,ou=new n,ia=new n,sa=new n,ra=new n,Nl=new n,oa=new n,au=new n,aa=new n;class u extends T{constructor(t=new g,e=new U){super();this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=s.length;a<c;a++){let d=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=a}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,a=i.morphAttributes.position,c=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let d=this.morphTargetInfluences;if(a&&d){oa.set(0,0,0);for(let p=0,S=a.length;p<S;p++){let E=d[p],N=a[p];if(E===0)continue;if(Nl.fromBufferAttribute(N,t),c)oa.addScaledVector(Nl,E);else oa.addScaledVector(Nl.sub(e),E)}e.add(oa)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.material,a=this.matrixWorld;if(s===void 0)return;if(i.boundingSphere===null)i.computeBoundingSphere();if(na.copy(i.boundingSphere),na.applyMatrix4(a),cr.copy(t.ray).recast(t.near),na.containsPoint(cr.origin)===!1){if(cr.intersectSphere(na,ou)===null)return;if(cr.origin.distanceToSquared(ou)>(t.far-t.near)**2)return}if(ru.copy(a).invert(),cr.copy(t.ray).applyMatrix4(ru),i.boundingBox!==null){if(cr.intersectsBox(i.boundingBox)===!1)return}this._computeIntersections(t,e,cr)}_computeIntersections(t,e,i){let s,a=this.geometry,c=this.material,d=a.index,p=a.attributes.position,S=a.attributes.uv,E=a.attributes.uv1,N=a.attributes.normal,{groups:D,drawRange:L}=a;if(d!==null)if(Array.isArray(c))for(let tt=0,vt=D.length;tt<vt;tt++){let zt=D[tt],nt=c[zt.materialIndex],yt=Math.max(zt.start,L.start),Dt=Math.min(d.count,Math.min(zt.start+zt.count,L.start+L.count));for(let Ht=yt,Ft=Dt;Ht<Ft;Ht+=3){let Xt=d.getX(Ht),Jt=d.getX(Ht+1),gt=d.getX(Ht+2);if(s=la(this,nt,t,i,S,E,N,Xt,Jt,gt),s)s.faceIndex=Math.floor(Ht/3),s.face.materialIndex=zt.materialIndex,e.push(s)}}else{let tt=Math.max(0,L.start),vt=Math.min(d.count,L.start+L.count);for(let zt=tt,nt=vt;zt<nt;zt+=3){let yt=d.getX(zt),Dt=d.getX(zt+1),Ht=d.getX(zt+2);if(s=la(this,c,t,i,S,E,N,yt,Dt,Ht),s)s.faceIndex=Math.floor(zt/3),e.push(s)}}else if(p!==void 0)if(Array.isArray(c))for(let tt=0,vt=D.length;tt<vt;tt++){let zt=D[tt],nt=c[zt.materialIndex],yt=Math.max(zt.start,L.start),Dt=Math.min(p.count,Math.min(zt.start+zt.count,L.start+L.count));for(let Ht=yt,Ft=Dt;Ht<Ft;Ht+=3){let Xt=Ht,Jt=Ht+1,gt=Ht+2;if(s=la(this,nt,t,i,S,E,N,Xt,Jt,gt),s)s.faceIndex=Math.floor(Ht/3),s.face.materialIndex=zt.materialIndex,e.push(s)}}else{let tt=Math.max(0,L.start),vt=Math.min(p.count,L.start+L.count);for(let zt=tt,nt=vt;zt<nt;zt+=3){let yt=zt,Dt=zt+1,Ht=zt+2;if(s=la(this,c,t,i,S,E,N,yt,Dt,Ht),s)s.faceIndex=Math.floor(zt/3),e.push(s)}}}}function em(t,e,i,s,a,c,d,p){let S;if(e.side===1)S=s.intersectTriangle(d,c,a,!0,p);else S=s.intersectTriangle(a,c,d,e.side===0,p);if(S===null)return null;aa.copy(p),aa.applyMatrix4(t.matrixWorld);let E=i.ray.origin.distanceTo(aa);if(E<i.near||E>i.far)return null;return{distance:E,point:aa.clone(),object:t}}function la(t,e,i,s,a,c,d,p,S,E){t.getVertexPosition(p,ia),t.getVertexPosition(S,sa),t.getVertexPosition(E,ra);let N=em(t,e,i,s,ia,sa,ra,au);if(N){let D=new n;if(Ii.getBarycoord(au,ia,sa,ra,D),a)N.uv=Ii.getInterpolatedAttribute(a,p,S,E,D,new o);if(c)N.uv1=Ii.getInterpolatedAttribute(c,p,S,E,D,new o);if(d){if(N.normal=Ii.getInterpolatedAttribute(d,p,S,E,D,new n),N.normal.dot(s.direction)>0)N.normal.multiplyScalar(-1)}let L={a:p,b:S,c:E,normal:new n,materialIndex:0};Ii.getNormal(ia,sa,ra,L.normal),N.face=L,N.barycoord=D}return N}var fo=new y,lu=new y,cu=new y,nm=new y,hu=new r,ca=new n,Dl=new M,uu=new r,Ul=new ie;class wt extends u{constructor(t,e){super(t,e);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new r,this.bindMatrixInverse=new r,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;if(this.boundingBox===null)this.boundingBox=new h;this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,ca),this.boundingBox.expandByPoint(ca)}computeBoundingSphere(){let t=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new M;this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,ca),this.boundingSphere.expandByPoint(ca)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}raycast(t,e){let i=this.material,s=this.matrixWorld;if(i===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(Dl.copy(this.boundingSphere),Dl.applyMatrix4(s),t.ray.intersectsSphere(Dl)===!1)return;if(uu.copy(s).invert(),Ul.copy(t.ray).applyMatrix4(uu),this.boundingBox!==null){if(Ul.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(t,e,Ul)}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){if(this.skeleton=t,e===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld;this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new y,e=this.geometry.attributes.skinWeight;for(let i=0,s=e.count;i<s;i++){t.fromBufferAttribute(e,i);let a=1/t.manhattanLength();if(a!==1/0)t.multiplyScalar(a);else t.set(1,0,0,0);e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else Gn("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,s=this.geometry;if(lu.fromBufferAttribute(s.attributes.skinIndex,t),cu.fromBufferAttribute(s.attributes.skinWeight,t),e.isVector4)fo.copy(e),e.set(0,0,0,0);else fo.set(e.x,e.y,e.z,1),e.set(0,0,0);fo.applyMatrix4(this.bindMatrix);for(let a=0;a<4;a++){let c=cu.getComponent(a);if(c!==0){let d=lu.getComponent(a);hu.multiplyMatrices(i.bones[d].matrixWorld,i.boneInverses[d]),e.addScaledVector(nm.copy(fo).applyMatrix4(hu),c)}}if(e.isVector4)e.w=fo.w;return e.applyMatrix4(this.bindMatrixInverse)}}class ht extends T{constructor(){super();this.isBone=!0,this.type="Bone"}}class se extends v{constructor(t=null,e=1,i=1,s,a,c,d,p,S=1003,E=1003,N,D){super(null,c,d,p,S,E,s,a,N,D);this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var fu=new r,im=new r;class dt{constructor(t=[],e=[]){this.uuid=Es(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){Gn("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new r)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new r;if(this.bones[t])i.copy(this.bones[t].matrixWorld).invert();this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];if(i)i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];if(i){if(i.parent&&i.parent.isBone)i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld);else i.matrix.copy(i.matrixWorld);i.matrix.decompose(i.position,i.quaternion,i.scale)}}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let a=0,c=t.length;a<c;a++){let d=t[a]?t[a].matrixWorld:im;fu.multiplyMatrices(d,e[a]),fu.toArray(i,a*16)}if(s!==null)s.needsUpdate=!0}clone(){return new dt(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new se(e,t,t,1023,1015);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let s=this.bones[e];if(s.name===t)return s}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null;if(this.previousBoneTexture!==null)this.previousBoneTexture.dispose(),this.previousBoneTexture=null}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,s=t.bones.length;i<s;i++){let a=t.bones[i],c=e[a];if(c===void 0)Gn("Skeleton: No bone found with UUID:",a),c=new ht;this.bones.push(c),this.boneInverses.push(new r().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let s=0,a=e.length;s<a;s++){let c=e[s];t.bones.push(c.uuid);let d=i[s];t.boneInverses.push(d.toArray())}return t}}class Ne extends _{constructor(t,e,i,s=1){super(t,e,i);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}var Nr=new r,du=new r,ha=[],pu=new h,sm=new r,po=new u,mo=new M;class J extends u{constructor(t,e,i){super(t,e);this.isInstancedMesh=!0,this.instanceMatrix=new Ne(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,sm)}computeBoundingBox(){let t=this.geometry,e=this.count;if(this.boundingBox===null)this.boundingBox=new h;if(t.boundingBox===null)t.computeBoundingBox();this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Nr),pu.copy(t.boundingBox).applyMatrix4(Nr),this.boundingBox.union(pu)}computeBoundingSphere(){let t=this.geometry,e=this.count;if(this.boundingSphere===null)this.boundingSphere=new M;if(t.boundingSphere===null)t.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Nr),mo.copy(t.boundingSphere).applyMatrix4(Nr),this.boundingSphere.union(mo)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){if(this.instanceColor===null)return e.setRGB(1,1,1);else return e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,a=i.length+1,c=t*a+1;for(let d=0;d<i.length;d++)i[d]=s[c+d]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(po.geometry=this.geometry,po.material=this.material,po.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(mo.copy(this.boundingSphere),mo.applyMatrix4(i),t.ray.intersectsSphere(mo)===!1)return;for(let a=0;a<s;a++){this.getMatrixAt(a,Nr),du.multiplyMatrices(i,Nr),po.matrixWorld=du,po.raycast(t,ha);for(let c=0,d=ha.length;c<d;c++){let p=ha[c];p.instanceId=a,p.object=this,e.push(p)}ha.length=0}}setColorAt(t,e){if(this.instanceColor===null)this.instanceColor=new Ne(new Float32Array(this.instanceMatrix.count*3).fill(1),3);return e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;if(this.morphTexture===null)this.morphTexture=new se(new Float32Array(s*this.count),s,this.count,1028,1015);let a=this.morphTexture.source.data.data,c=0;for(let S=0;S<i.length;S++)c+=i[S];let d=this.geometry.morphTargetsRelative?1:1-c,p=s*t;return a[p]=d,a.set(i,p+1),this}updateMorphTargets(){}dispose(){if(super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null)this.instanceColor.dispose();if(this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var hr=new M,rm=new o(0.5,0.5),ua=new n;class Q{constructor(t=new R,e=new R,i=new R,s=new R,a=new R,c=new R){this.planes=[t,e,i,s,a,c]}set(t,e,i,s,a,c){let d=this.planes;return d[0].copy(t),d[1].copy(e),d[2].copy(i),d[3].copy(s),d[4].copy(a),d[5].copy(c),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=2000,i=!1){let s=this.planes,a=t.elements,c=a[0],d=a[1],p=a[2],S=a[3],E=a[4],N=a[5],D=a[6],L=a[7],tt=a[8],vt=a[9],zt=a[10],nt=a[11],yt=a[12],Dt=a[13],Ht=a[14],Ft=a[15];if(s[0].setComponents(S-c,L-E,nt-tt,Ft-yt).normalize(),s[1].setComponents(S+c,L+E,nt+tt,Ft+yt).normalize(),s[2].setComponents(S+d,L+N,nt+vt,Ft+Dt).normalize(),s[3].setComponents(S-d,L-N,nt-vt,Ft-Dt).normalize(),i)s[4].setComponents(p,D,zt,Ht).normalize(),s[5].setComponents(S-p,L-D,nt-zt,Ft-Ht).normalize();else if(s[4].setComponents(S-p,L-D,nt-zt,Ft-Ht).normalize(),e===2000)s[5].setComponents(S+p,L+D,nt+zt,Ft+Ht).normalize();else if(e===2001)s[5].setComponents(p,D,zt,Ht).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0){if(t.boundingSphere===null)t.computeBoundingSphere();hr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld)}else{let e=t.geometry;if(e.boundingSphere===null)e.computeBoundingSphere();hr.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(hr)}intersectsSprite(t){hr.center.set(0,0,0);let e=rm.distanceTo(t.center);return hr.radius=0.7071067811865476+e,hr.applyMatrix4(t.matrixWorld),this.intersectsSphere(hr)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let a=0;a<6;a++)if(e[a].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(ua.x=s.normal.x>0?t.max.x:t.min.x,ua.y=s.normal.y>0?t.max.y:t.min.y,ua.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ua)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var mu=new r;class Ro{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,i=this._frustums;for(let s=0;s<e.length;s++){let a=e[s];if(mu.multiplyMatrices(a.projectionMatrix,a.matrixWorldInverse),i[s]===void 0)i[s]=new Q;i[s].setFromProjectionMatrix(mu,a.coordinateSystem,a.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,i=t._frustums;for(let s=0;s<t._count;s++){if(e[s]===void 0)e[s]=new Q;e[s].copy(i[s])}return this._count=t._count,this}clone(){return new Ro().copy(this)}}function Fl(t,e){return t-e}function om(t,e){return t.z-e.z}function am(t,e){return e.z-t.z}class Pf{constructor(){this.index=0,this.pool=[],this.list=[]}push(t,e,i,s){let a=this.pool,c=this.list;if(this.index>=a.length)a.push({start:-1,count:-1,z:-1,index:-1});let d=a[this.index];c.push(d),this.index++,d.start=t,d.count=e,d.z=i,d.index=s}reset(){this.list.length=0,this.index=0}}var ns=new r,lm=new l(1,1,1),cm=new Q,hm=new Ro,fa=new h,ur=new M,Ol=new n,gu=new n,_u=new n,um=new n,Bl=new Pf,qi=new u,da=[];function fm(t,e,i=0){let s=e.itemSize;if(t.isInterleavedBufferAttribute||t.array.constructor!==e.array.constructor){let a=t.count;for(let c=0;c<a;c++)for(let d=0;d<s;d++)e.setComponent(c+i,d,t.getComponent(c,d))}else e.array.set(t.array,i*s);e.needsUpdate=!0}function Ss(t,e){if(t.constructor!==e.constructor){let i=Math.min(t.length,e.length);for(let s=0;s<i;s++)e[s]=t[s]}else{let i=Math.min(t.length,e.length);e.set(new t.constructor(t.buffer,0,i))}}class La extends u{constructor(t,e,i=e*2,s){super(new g,s);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=t,this._maxVertexCount=e,this._maxIndexCount=i,this._multiDrawCounts=new Int32Array(t),this._multiDrawStarts=new Int32Array(t),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(t),this._mergedDrawStarts=new Int32Array(t),this._mergedDrawInstanceCounts=new Int32Array(t),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let t=Math.sqrt(this._maxInstanceCount*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4),i=new se(e,t,t,1023,1015);this._matricesTexture=i}_initIndirectTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Uint32Array(t*t),i=new se(e,t,t,1029,1014);this._indirectTexture=i}_initColorsTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Float32Array(t*t*4).fill(1),i=new se(e,t,t,1023,1015);i.colorSpace=m.workingColorSpace,this._colorsTexture=i}_initializeGeometry(t){let e=this.geometry,i=this._maxVertexCount,s=this._maxIndexCount;if(this._geometryInitialized===!1){for(let a in t.attributes){let c=t.getAttribute(a),{array:d,itemSize:p,normalized:S}=c,E=new d.constructor(i*p),N=new _(E,p,S);e.setAttribute(a,N)}if(t.getIndex()!==null){let a=i>65535?new Uint32Array(s):new Uint16Array(s);e.setIndex(new _(a,1))}this._geometryInitialized=!0}}_validateGeometry(t){let e=this.geometry;if(Boolean(t.getIndex())!==Boolean(e.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let i in e.attributes){if(!t.hasAttribute(i))throw Error(`THREE.BatchedMesh: Added geometry missing "${i}". All geometries must have consistent attributes.`);let s=t.getAttribute(i),a=e.getAttribute(i);if(s.itemSize!==a.itemSize||s.normalized!==a.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${i}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(t){let e=this._instanceInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${t}. Instance is either out of range or has been deleted.`)}validateGeometryId(t){let e=this._geometryInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${t}. Geometry is either out of range or has been deleted.`)}setCustomSort(t){return this.customSort=t,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new h;let t=this.boundingBox,e=this._instanceInfo;t.makeEmpty();for(let i=0,s=e.length;i<s;i++){if(e[i].active===!1)continue;let a=e[i].geometryIndex;this.getMatrixAt(i,ns),this.getBoundingBoxAt(a,fa).applyMatrix4(ns),t.union(fa)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new M;let t=this.boundingSphere,e=this._instanceInfo;t.makeEmpty();for(let i=0,s=e.length;i<s;i++){if(e[i].active===!1)continue;let a=e[i].geometryIndex;this.getMatrixAt(i,ns),this.getBoundingSphereAt(a,ur).applyMatrix4(ns),t.union(ur)}}addInstance(t){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let i={visible:!0,active:!0,geometryIndex:t},s=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Fl),s=this._availableInstanceIds.shift(),this._instanceInfo[s]=i;else s=this._instanceInfo.length,this._instanceInfo.push(i);let a=this._matricesTexture;ns.identity().toArray(a.image.data,s*16),a.needsUpdate=!0;let c=this._colorsTexture;if(c)lm.toArray(c.image.data,s*4),c.needsUpdate=!0;return this._visibilityChanged=!0,s}addGeometry(t,e=-1,i=-1){this._initializeGeometry(t),this._validateGeometry(t);let s={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},a=this._geometryInfo;s.vertexStart=this._nextVertexStart,s.reservedVertexCount=e===-1?t.getAttribute("position").count:e;let c=t.getIndex();if(c!==null)s.indexStart=this._nextIndexStart,s.reservedIndexCount=i===-1?c.count:i;if(s.indexStart!==-1&&s.indexStart+s.reservedIndexCount>this._maxIndexCount||s.vertexStart+s.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let p;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Fl),p=this._availableGeometryIds.shift(),a[p]=s;else p=this._geometryCount,this._geometryCount++,a.push(s);return this.setGeometryAt(p,t),this._nextIndexStart=s.indexStart+s.reservedIndexCount,this._nextVertexStart=s.vertexStart+s.reservedVertexCount,p}setGeometryAt(t,e){if(t>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(e);let i=this.geometry,s=i.getIndex()!==null,a=i.getIndex(),c=e.getIndex(),d=this._geometryInfo[t];if(s&&c.count>d.reservedIndexCount||e.attributes.position.count>d.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:p,reservedVertexCount:S}=d;d.vertexCount=e.getAttribute("position").count;for(let E in i.attributes){let N=e.getAttribute(E),D=i.getAttribute(E);fm(N,D,p);let L=N.itemSize;for(let tt=N.count,vt=S;tt<vt;tt++){let zt=p+tt;for(let nt=0;nt<L;nt++)D.setComponent(zt,nt,0)}D.needsUpdate=!0,D.addUpdateRange(p*L,S*L)}if(s){let{indexStart:E,reservedIndexCount:N}=d;d.indexCount=e.getIndex().count;for(let D=0;D<c.count;D++)a.setX(E+D,p+c.getX(D));for(let D=c.count,L=N;D<L;D++)a.setX(E+D,p);a.needsUpdate=!0,a.addUpdateRange(E,d.reservedIndexCount)}if(d.start=s?d.indexStart:d.vertexStart,d.count=s?d.indexCount:d.vertexCount,d.boundingBox=null,e.boundingBox!==null)d.boundingBox=e.boundingBox.clone();if(d.boundingSphere=null,e.boundingSphere!==null)d.boundingSphere=e.boundingSphere.clone();return this._visibilityChanged=!0,t}deleteGeometry(t){let e=this._geometryInfo;if(t>=e.length||e[t].active===!1)return this;let i=this._instanceInfo;for(let s=0,a=i.length;s<a;s++)if(i[s].active&&i[s].geometryIndex===t)this.deleteInstance(s);return e[t].active=!1,this._availableGeometryIds.push(t),this._visibilityChanged=!0,this}deleteInstance(t){return this.validateInstanceId(t),this._instanceInfo[t].active=!1,this._availableInstanceIds.push(t),this._visibilityChanged=!0,this}optimize(){let t=0,e=0,i=this._geometryInfo,s=i.map((c,d)=>d).sort((c,d)=>i[c].vertexStart-i[d].vertexStart),a=this.geometry;for(let c=0,d=i.length;c<d;c++){let p=s[c],S=i[p];if(S.active===!1)continue;if(a.index!==null){if(S.indexStart!==e){let{indexStart:E,vertexStart:N,reservedIndexCount:D}=S,L=a.index,tt=L.array,vt=t-N;for(let zt=E;zt<E+D;zt++)tt[zt]=tt[zt]+vt;L.array.copyWithin(e,E,E+D),L.addUpdateRange(e,D),L.needsUpdate=!0,S.indexStart=e}e+=S.reservedIndexCount}if(S.vertexStart!==t){let{vertexStart:E,reservedVertexCount:N}=S,D=a.attributes;for(let L in D){let tt=D[L],{array:vt,itemSize:zt}=tt;vt.copyWithin(t*zt,E*zt,(E+N)*zt),tt.addUpdateRange(t*zt,N*zt),tt.needsUpdate=!0}S.vertexStart=t}t+=S.reservedVertexCount,S.start=a.index?S.indexStart:S.vertexStart}return this._nextIndexStart=e,this._nextVertexStart=t,this._visibilityChanged=!0,this}getBoundingBoxAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,s=this._geometryInfo[t];if(s.boundingBox===null){let a=new h,c=i.index,d=i.attributes.position;for(let p=s.start,S=s.start+s.count;p<S;p++){let E=p;if(c)E=c.getX(E);a.expandByPoint(Ol.fromBufferAttribute(d,E))}s.boundingBox=a}return e.copy(s.boundingBox),e}getBoundingSphereAt(t,e){if(t>=this._geometryCount)return null;let i=this.geometry,s=this._geometryInfo[t];if(s.boundingSphere===null){let a=new M;this.getBoundingBoxAt(t,fa),fa.getCenter(a.center);let c=i.index,d=i.attributes.position,p=0;for(let S=s.start,E=s.start+s.count;S<E;S++){let N=S;if(c)N=c.getX(N);Ol.fromBufferAttribute(d,N),p=Math.max(p,a.center.distanceToSquared(Ol))}a.radius=Math.sqrt(p),s.boundingSphere=a}return e.copy(s.boundingSphere),e}setMatrixAt(t,e){this.validateInstanceId(t);let i=this._matricesTexture,s=this._matricesTexture.image.data;return e.toArray(s,t*16),i.needsUpdate=!0,this}getMatrixAt(t,e){return this.validateInstanceId(t),e.fromArray(this._matricesTexture.image.data,t*16)}setColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)this._initColorsTexture();return e.toArray(this._colorsTexture.image.data,t*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)if(e.isVector4)return e.set(1,1,1,1);else return e.setRGB(1,1,1);else return e.fromArray(this._colorsTexture.image.data,t*4)}setVisibleAt(t,e){if(this.validateInstanceId(t),this._instanceInfo[t].visible===e)return this;return this._instanceInfo[t].visible=e,this._visibilityChanged=!0,this}getVisibleAt(t){return this.validateInstanceId(t),this._instanceInfo[t].visible}setGeometryIdAt(t,e){return this.validateInstanceId(t),this.validateGeometryId(e),this._instanceInfo[t].geometryIndex=e,this._visibilityChanged=!0,this}getGeometryIdAt(t){return this.validateInstanceId(t),this._instanceInfo[t].geometryIndex}getGeometryRangeAt(t,e={}){this.validateGeometryId(t);let i=this._geometryInfo[t];return e.vertexStart=i.vertexStart,e.vertexCount=i.vertexCount,e.reservedVertexCount=i.reservedVertexCount,e.indexStart=i.indexStart,e.indexCount=i.indexCount,e.reservedIndexCount=i.reservedIndexCount,e.start=i.start,e.count=i.count,e}setInstanceCount(t){let e=this._availableInstanceIds,i=this._instanceInfo;e.sort(Fl);while(e[e.length-1]===i.length-1)i.pop(),e.pop();if(t<i.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${t} are being used. Cannot shrink instance count.`);let s=new Int32Array(t),a=new Int32Array(t);Ss(this._multiDrawCounts,s),Ss(this._multiDrawStarts,a),this._multiDrawCounts=s,this._multiDrawStarts=a;let c=new Int32Array(t),d=new Int32Array(t),p=new Int32Array(t);Ss(this._mergedDrawCounts,c),Ss(this._mergedDrawStarts,d),Ss(this._mergedDrawInstanceCounts,p),this._mergedDrawCounts=c,this._mergedDrawStarts=d,this._mergedDrawInstanceCounts=p,this._maxInstanceCount=t;let S=this._indirectTexture,E=this._matricesTexture,N=this._colorsTexture;if(S.dispose(),this._initIndirectTexture(),Ss(S.image.data,this._indirectTexture.image.data),E.dispose(),this._initMatricesTexture(),Ss(E.image.data,this._matricesTexture.image.data),N)N.dispose(),this._initColorsTexture(),Ss(N.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(t,e){let i=[...this._geometryInfo].filter((d)=>d.active);if(Math.max(...i.map((d)=>d.vertexStart+d.reservedVertexCount))>t)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...i.map((p)=>p.indexStart+p.reservedIndexCount))>e)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${e}. Cannot shrink further.`)}let a=this.geometry;if(a.dispose(),this._maxVertexCount=t,this._maxIndexCount=e,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new g,this._initializeGeometry(a);let c=this.geometry;if(a.index)Ss(a.index.array,c.index.array);for(let d in a.attributes)Ss(a.attributes[d].array,c.attributes[d].array);this._visibilityChanged=!0}raycast(t,e){let i=this._instanceInfo,s=this._geometryInfo,a=this.matrixWorld,c=this.geometry;if(qi.material=this.material,qi.geometry.index=c.index,qi.geometry.attributes=c.attributes,qi.geometry.boundingBox===null)qi.geometry.boundingBox=new h;if(qi.geometry.boundingSphere===null)qi.geometry.boundingSphere=new M;for(let d=0,p=i.length;d<p;d++){if(!i[d].visible||!i[d].active)continue;let S=i[d].geometryIndex,E=s[S];qi.geometry.setDrawRange(E.start,E.count),this.getMatrixAt(d,qi.matrixWorld).premultiply(a),this.getBoundingBoxAt(S,qi.geometry.boundingBox),this.getBoundingSphereAt(S,qi.geometry.boundingSphere),qi.raycast(t,da);for(let N=0,D=da.length;N<D;N++){let L=da[N];L.object=this,L.batchId=d,e.push(L)}da.length=0}qi.material=null,qi.geometry.index=null,qi.geometry.attributes={},qi.geometry.setDrawRange(0,1/0)}copy(t){if(super.copy(t),this.geometry=t.geometry.clone(),this.perObjectFrustumCulled=t.perObjectFrustumCulled,this.sortObjects=t.sortObjects,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this._geometryInfo=t._geometryInfo.map((e)=>({...e,boundingBox:e.boundingBox!==null?e.boundingBox.clone():null,boundingSphere:e.boundingSphere!==null?e.boundingSphere.clone():null})),this._instanceInfo=t._instanceInfo.map((e)=>({...e})),this._availableInstanceIds=t._availableInstanceIds.slice(),this._availableGeometryIds=t._availableGeometryIds.slice(),this._nextIndexStart=t._nextIndexStart,this._nextVertexStart=t._nextVertexStart,this._geometryCount=t._geometryCount,this._maxInstanceCount=t._maxInstanceCount,this._maxVertexCount=t._maxVertexCount,this._maxIndexCount=t._maxIndexCount,this._geometryInitialized=t._geometryInitialized,this._multiDrawCounts=t._multiDrawCounts.slice(),this._multiDrawStarts=t._multiDrawStarts.slice(),this._multiDrawBytesPerElement=t._multiDrawBytesPerElement,this._mergedDrawCounts=t._mergedDrawCounts.slice(),this._mergedDrawStarts=t._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=t._mergedDrawInstanceCounts.slice(),this._indirectTexture=t._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=t._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),t._colorsTexture!==null)this._colorsTexture=t._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(t,e,i,s="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let a=e.getIndex(),c=a===null?1:a.array.BYTES_PER_ELEMENT,d=1;if(i.wireframe)d=2,c=e.attributes.position.count>65535?4:2;let p=this._instanceInfo,S=this._multiDrawStarts,E=this._multiDrawCounts,N=this._mergedDrawStarts,D=this._mergedDrawCounts,L=this._mergedDrawInstanceCounts,tt=this._geometryInfo,vt=this.perObjectFrustumCulled,zt=this._indirectTexture,nt=zt.image.data,yt=t.isArrayCamera?hm:cm;if(vt)if(t.isArrayCamera)yt.setFromArrayCamera(t);else ns.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse).multiply(this.matrixWorld),yt.setFromProjectionMatrix(ns,t.coordinateSystem,t.reversedDepth);let Dt=0,Ht=0;if(this.sortObjects){ns.copy(this.matrixWorld).invert(),gu.setFromMatrixPosition(t.matrixWorld).applyMatrix4(ns),_u.set(0,0,-1).transformDirection(t.matrixWorld).transformDirection(ns);for(let Jt=0,gt=p.length;Jt<gt;Jt++)if(p[Jt].visible&&p[Jt].active){let Ot=p[Jt].geometryIndex;this.getMatrixAt(Jt,ns),this.getBoundingSphereAt(Ot,ur).applyMatrix4(ns);let Kt=!1;if(vt)Kt=!yt.intersectsSphere(ur);if(!Kt){let pe=tt[Ot],Qt=um.subVectors(ur.center,gu).dot(_u);Bl.push(pe.start,pe.count,Qt,Jt)}}let Ft=Bl.list,Xt=this.customSort;if(Xt===null)Ft.sort(i.transparent?am:om);else Xt.call(this,Ft,t);for(let Jt=0,gt=Ft.length;Jt<gt;Jt++){let Ot=Ft[Jt],Kt=Ot.start*c*d,pe=Ot.count*d;if(s==="merged")if(Ht>0&&N[Ht-1]===Kt&&D[Ht-1]===pe)L[Ht-1]++;else N[Ht]=Kt,D[Ht]=pe,L[Ht]=1,Ht++;else S[Dt]=Kt,E[Dt]=pe;nt[Dt]=Ot.index,Dt++}Bl.reset()}else for(let Ft=0,Xt=p.length;Ft<Xt;Ft++)if(p[Ft].visible&&p[Ft].active){let Jt=p[Ft].geometryIndex,gt=!1;if(vt)this.getMatrixAt(Ft,ns),this.getBoundingSphereAt(Jt,ur).applyMatrix4(ns),gt=!yt.intersectsSphere(ur);if(!gt){let Ot=tt[Jt],Kt=Ot.start*c*d,pe=Ot.count*d;if(s==="merged")if(Ht>0&&N[Ht-1]===Kt&&D[Ht-1]===pe)L[Ht-1]++;else N[Ht]=Kt,D[Ht]=pe,L[Ht]=1,Ht++;else S[Dt]=Kt,E[Dt]=pe;nt[Dt]=Ft,Dt++}}zt.needsUpdate=!0,this._multiDrawCount=Dt,this._mergedDrawCount=Ht,this._multiDrawBytesPerElement=c,this._visibilityChanged=!1}onBeforeRender(t,e,i,s,a){if(t.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(i,s,a)}onBeforeShadow(t,e,i,s,a,c){if(t.isWebGPURenderer!==!0)this._updateDrawParameters(s,a,c)}}class ee extends I{constructor(t){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new l(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}var Sa=new n,Ma=new n,xu=new r,go=new ie,pa=new M,zl=new n,yu=new n;class ve extends T{constructor(t=new g,e=new ee){super();this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let s=1,a=e.count;s<a;s++)Sa.fromBufferAttribute(e,s-1),Ma.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=Sa.distanceTo(Ma);t.setAttribute("lineDistance",new x(i,1))}else Gn("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,a=t.params.Line.threshold,c=i.drawRange;if(i.boundingSphere===null)i.computeBoundingSphere();if(pa.copy(i.boundingSphere),pa.applyMatrix4(s),pa.radius+=a,t.ray.intersectsSphere(pa)===!1)return;xu.copy(s).invert(),go.copy(t.ray).applyMatrix4(xu);let d=a/((this.scale.x+this.scale.y+this.scale.z)/3),p=d*d,S=this.isLineSegments?2:1,E=i.index,D=i.attributes.position;if(E!==null){let L=Math.max(0,c.start),tt=Math.min(E.count,c.start+c.count);for(let vt=L,zt=tt-1;vt<zt;vt+=S){let nt=E.getX(vt),yt=E.getX(vt+1),Dt=ma(this,t,go,p,nt,yt,vt);if(Dt)e.push(Dt)}if(this.isLineLoop){let vt=E.getX(tt-1),zt=E.getX(L),nt=ma(this,t,go,p,vt,zt,tt-1);if(nt)e.push(nt)}}else{let L=Math.max(0,c.start),tt=Math.min(D.count,c.start+c.count);for(let vt=L,zt=tt-1;vt<zt;vt+=S){let nt=ma(this,t,go,p,vt,vt+1,vt);if(nt)e.push(nt)}if(this.isLineLoop){let vt=ma(this,t,go,p,tt-1,L,tt-1);if(vt)e.push(vt)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=s.length;a<c;a++){let d=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=a}}}}}function ma(t,e,i,s,a,c,d){let p=t.geometry.attributes.position;if(Sa.fromBufferAttribute(p,a),Ma.fromBufferAttribute(p,c),i.distanceSqToSegment(Sa,Ma,zl,yu)>s)return;zl.applyMatrix4(t.matrixWorld);let E=e.ray.origin.distanceTo(zl);if(E<e.near||E>e.far)return;return{distance:E,point:yu.clone().applyMatrix4(t.matrixWorld),index:d,face:null,faceIndex:null,barycoord:null,object:t}}var vu=new n,Su=new n;class te extends ve{constructor(t,e){super(t,e);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let s=0,a=e.count;s<a;s+=2)vu.fromBufferAttribute(e,s),Su.fromBufferAttribute(e,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+vu.distanceTo(Su);t.setAttribute("lineDistance",new x(i,1))}else Gn("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ye extends ve{constructor(t,e){super(t,e);this.isLineLoop=!0,this.type="LineLoop"}}class _e extends I{constructor(t){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new l(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}var Mu=new r,Vl=new ie,ga=new M,_a=new n;class j extends T{constructor(t=new g,e=new _e){super();this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,a=t.params.Points.threshold,c=i.drawRange;if(i.boundingSphere===null)i.computeBoundingSphere();if(ga.copy(i.boundingSphere),ga.applyMatrix4(s),ga.radius+=a,t.ray.intersectsSphere(ga)===!1)return;Mu.copy(s).invert(),Vl.copy(t.ray).applyMatrix4(Mu);let d=a/((this.scale.x+this.scale.y+this.scale.z)/3),p=d*d,S=i.index,N=i.attributes.position;if(S!==null){let D=Math.max(0,c.start),L=Math.min(S.count,c.start+c.count);for(let tt=D,vt=L;tt<vt;tt++){let zt=S.getX(tt);_a.fromBufferAttribute(N,zt),bu(_a,zt,p,s,t,e,this)}}else{let D=Math.max(0,c.start),L=Math.min(N.count,c.start+c.count);for(let tt=D,vt=L;tt<vt;tt++)_a.fromBufferAttribute(N,tt),bu(_a,tt,p,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let a=0,c=s.length;a<c;a++){let d=s[a].name||String(a);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=a}}}}}function bu(t,e,i,s,a,c,d){let p=Vl.distanceSqToPoint(t);if(p<i){let S=new n;Vl.closestPointToPoint(t,S),S.applyMatrix4(s);let E=a.ray.origin.distanceTo(S);if(E<a.near||E>a.far)return;c.push({distance:E,distanceToRay:Math.sqrt(p),point:S,index:e,face:null,faceIndex:null,barycoord:null,object:d})}}class ft extends v{constructor(t=[],e,i,s,a,c,d,p,S,E,N,D){super(null,c,d,p,S,E,s,a,N,D);this.isCompressedTexture=!0,this.image={width:e,height:i},this.mipmaps=t,this.flipY=!1,this.generateMipmaps=!1}}class Na extends v{constructor(t=[],e=301,i,s,a,c,d,p,S,E){super(t,e,i,s,a,c,d,p,S,E);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Et extends v{constructor(t,e,i,s,a,c,d,p,S){super(t,e,i,s,a,c,d,p,S);this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ks extends v{constructor(t,e,i=1014,s,a,c,d=1003,p=1003,S,E=1026,N=1){if(E!==1026&&E!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let D={width:t,height:e,depth:N};super(D,s,a,c,d,p,E,i,S);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ao(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class Da extends Ks{constructor(t,e=1014,i=301,s,a,c=1003,d=1003,p,S=1026){let E={width:t,height:t,depth:1},N=[E,E,E,E,E,E];super(t,t,e,i,s,a,c,d,p,S);this.image=N,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Ua extends v{constructor(t=null){super();this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Pe extends g{constructor(t=1,e=1,i=1,s=1,a=1,c=1){super();this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:a,depthSegments:c};let d=this;s=Math.floor(s),a=Math.floor(a),c=Math.floor(c);let p=[],S=[],E=[],N=[],D=0,L=0;tt("z","y","x",-1,-1,i,e,t,c,a,0),tt("z","y","x",1,-1,i,e,-t,c,a,1),tt("x","z","y",1,1,t,i,e,s,c,2),tt("x","z","y",1,-1,t,i,-e,s,c,3),tt("x","y","z",1,-1,t,e,i,s,a,4),tt("x","y","z",-1,-1,t,e,-i,s,a,5),this.setIndex(p),this.setAttribute("position",new x(S,3)),this.setAttribute("normal",new x(E,3)),this.setAttribute("uv",new x(N,2));function tt(vt,zt,nt,yt,Dt,Ht,Ft,Xt,Jt,gt,Ot){let Kt=Ht/Jt,pe=Ft/gt,Qt=Ht/2,me=Ft/2,Ee=Xt/2,jt=Jt+1,Ye=gt+1,on=0,tn=0,yn=new n;for(let ln=0;ln<Ye;ln++){let dn=ln*pe-me;for(let gn=0;gn<jt;gn++){let Nn=gn*Kt-Qt;yn[vt]=Nn*yt,yn[zt]=dn*Dt,yn[nt]=Ee,S.push(yn.x,yn.y,yn.z),yn[vt]=0,yn[zt]=0,yn[nt]=Xt>0?1:-1,E.push(yn.x,yn.y,yn.z),N.push(gn/Jt),N.push(1-ln/gt),on+=1}}for(let ln=0;ln<gt;ln++)for(let dn=0;dn<Jt;dn++){let gn=D+dn+jt*ln,Nn=D+dn+jt*(ln+1),fn=D+(dn+1)+jt*(ln+1),_n=D+(dn+1)+jt*ln;p.push(gn,Nn,_n),p.push(Nn,fn,_n),tn+=6}d.addGroup(L,tn,Ot),L+=tn,D+=on}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Pe(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Fe extends g{constructor(t=1,e=32,i=0,s=Math.PI*2){super();this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:s},e=Math.max(3,e);let a=[],c=[],d=[],p=[],S=new n,E=new o;c.push(0,0,0),d.push(0,0,1),p.push(0.5,0.5);for(let N=0,D=3;N<=e;N++,D+=3){let L=i+N/e*s;S.x=t*Math.cos(L),S.y=t*Math.sin(L),c.push(S.x,S.y,S.z),d.push(0,0,1),E.x=(c[D]/t+1)/2,E.y=(c[D+1]/t+1)/2,p.push(E.x,E.y)}for(let N=1;N<=e;N++)a.push(N,N+1,0);this.setIndex(a),this.setAttribute("position",new x(c,3)),this.setAttribute("normal",new x(d,3)),this.setAttribute("uv",new x(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Fe(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Fa extends g{constructor(t=1,e=1,i=1,s=32,a=1,c=!1,d=0,p=Math.PI*2){super();this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:a,openEnded:c,thetaStart:d,thetaLength:p};let S=this;s=Math.floor(s),a=Math.floor(a);let E=[],N=[],D=[],L=[],tt=0,vt=[],zt=i/2,nt=0;if(yt(),c===!1){if(t>0)Dt(!0);if(e>0)Dt(!1)}this.setIndex(E),this.setAttribute("position",new x(N,3)),this.setAttribute("normal",new x(D,3)),this.setAttribute("uv",new x(L,2));function yt(){let Ht=new n,Ft=new n,Xt=0,Jt=(e-t)/i;for(let gt=0;gt<=a;gt++){let Ot=[],Kt=gt/a,pe=Kt*(e-t)+t;for(let Qt=0;Qt<=s;Qt++){let me=Qt/s,Ee=me*p+d,jt=Math.sin(Ee),Ye=Math.cos(Ee);Ft.x=pe*jt,Ft.y=-Kt*i+zt,Ft.z=pe*Ye,N.push(Ft.x,Ft.y,Ft.z),Ht.set(jt,Jt,Ye).normalize(),D.push(Ht.x,Ht.y,Ht.z),L.push(me,1-Kt),Ot.push(tt++)}vt.push(Ot)}for(let gt=0;gt<s;gt++)for(let Ot=0;Ot<a;Ot++){let Kt=vt[Ot][gt],pe=vt[Ot+1][gt],Qt=vt[Ot+1][gt+1],me=vt[Ot][gt+1];if(t>0||Ot!==0)E.push(Kt,pe,me),Xt+=3;if(e>0||Ot!==a-1)E.push(pe,Qt,me),Xt+=3}S.addGroup(nt,Xt,0),nt+=Xt}function Dt(Ht){let Ft=tt,Xt=new o,Jt=new n,gt=0,Ot=Ht===!0?t:e,Kt=Ht===!0?1:-1;for(let Qt=1;Qt<=s;Qt++)N.push(0,zt*Kt,0),D.push(0,Kt,0),L.push(0.5,0.5),tt++;let pe=tt;for(let Qt=0;Qt<=s;Qt++){let Ee=Qt/s*p+d,jt=Math.cos(Ee),Ye=Math.sin(Ee);Jt.x=Ot*Ye,Jt.y=zt*Kt,Jt.z=Ot*jt,N.push(Jt.x,Jt.y,Jt.z),D.push(0,Kt,0),Xt.x=jt*0.5+0.5,Xt.y=Ye*0.5*Kt+0.5,L.push(Xt.x,Xt.y),tt++}for(let Qt=0;Qt<s;Qt++){let me=Ft+Qt,Ee=pe+Qt;if(Ht===!0)E.push(Ee,Ee+1,me);else E.push(Ee+1,Ee,me);gt+=3}S.addGroup(nt,gt,Ht===!0?1:2),nt+=gt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Fa(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class pt extends Fa{constructor(t=1,e=1,i=32,s=1,a=!1,c=0,d=Math.PI*2){super(0,t,e,i,s,a,c,d);this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:a,thetaStart:c,thetaLength:d}}static fromJSON(t){return new pt(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Co extends g{constructor(t=1,e=1,i=1,s=1){super();this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let a=t/2,c=e/2,d=Math.floor(i),p=Math.floor(s),S=d+1,E=p+1,N=t/d,D=e/p,L=[],tt=[],vt=[],zt=[];for(let nt=0;nt<E;nt++){let yt=nt*D-c;for(let Dt=0;Dt<S;Dt++){let Ht=Dt*N-a;tt.push(Ht,-yt,0),vt.push(0,0,1),zt.push(Dt/d),zt.push(1-nt/p)}}for(let nt=0;nt<p;nt++)for(let yt=0;yt<d;yt++){let Dt=yt+S*nt,Ht=yt+S*(nt+1),Ft=yt+1+S*(nt+1),Xt=yt+1+S*nt;L.push(Dt,Ht,Xt),L.push(Ht,Ft,Xt)}this.setIndex(L),this.setAttribute("position",new x(tt,3)),this.setAttribute("normal",new x(vt,3)),this.setAttribute("uv",new x(zt,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Co(t.width,t.height,t.widthSegments,t.heightSegments)}}function xr(t){let e={};for(let i in t){e[i]={};for(let s in t[i]){let a=t[i][s];if(Tu(a))if(a.isRenderTargetTexture)Gn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[i][s]=null;else e[i][s]=a.clone();else if(Array.isArray(a))if(Tu(a[0])){let c=[];for(let d=0,p=a.length;d<p;d++)c[d]=a[d].clone();e[i][s]=c}else e[i][s]=a.slice();else e[i][s]=a}}return e}function Yi(t){let e={};for(let i=0;i<t.length;i++){let s=xr(t[i]);for(let a in s)e[a]=s[a]}return e}function Tu(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function dm(t){let e=[];for(let i=0;i<t.length;i++)e.push(t[i].clone());return e}function Yc(t){let e=t.getRenderTarget();if(e===null)return t.outputColorSpace;if(e.isXRRenderTarget===!0)return e.texture.colorSpace;return m.workingColorSpace}var Lf={clone:xr,merge:Yi},pm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,mm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class re extends I{constructor(t){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pm,this.fragmentShader=mm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0)this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=xr(t.uniforms),this.uniformsGroups=dm(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let c=this.uniforms[s].value;if(c&&c.isTexture)e.uniforms[s]={type:"t",value:c.toJSON(t).uuid};else if(c&&c.isColor)e.uniforms[s]={type:"c",value:c.getHex()};else if(c&&c.isVector2)e.uniforms[s]={type:"v2",value:c.toArray()};else if(c&&c.isVector3)e.uniforms[s]={type:"v3",value:c.toArray()};else if(c&&c.isVector4)e.uniforms[s]={type:"v4",value:c.toArray()};else if(c&&c.isMatrix3)e.uniforms[s]={type:"m3",value:c.toArray()};else if(c&&c.isMatrix4)e.uniforms[s]={type:"m4",value:c.toArray()};else e.uniforms[s]={value:c}}if(Object.keys(this.defines).length>0)e.defines=this.defines;e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)if(this.extensions[s]===!0)i[s]=!0;if(Object.keys(i).length>0)e.extensions=i;return e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new l().setHex(s.value);break;case"v2":this.uniforms[i].value=new o().fromArray(s.value);break;case"v3":this.uniforms[i].value=new n().fromArray(s.value);break;case"v4":this.uniforms[i].value=new y().fromArray(s.value);break;case"m3":this.uniforms[i].value=new Zn().fromArray(s.value);break;case"m4":this.uniforms[i].value=new r().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0)this.defines=t.defines;if(t.vertexShader!==void 0)this.vertexShader=t.vertexShader;if(t.fragmentShader!==void 0)this.fragmentShader=t.fragmentShader;if(t.glslVersion!==void 0)this.glslVersion=t.glslVersion;if(t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];if(t.lights!==void 0)this.lights=t.lights;if(t.clipping!==void 0)this.clipping=t.clipping;return this}}class Zc extends re{constructor(t){super(t);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class O extends I{constructor(t){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new l(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new l(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new o(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _s,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Z extends O{constructor(t){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new o(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Yn(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+0.4*e)/(1-0.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new l(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new l(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new l(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){if(this._anisotropy>0!==t>0)this.version++;this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){if(this._clearcoat>0!==t>0)this.version++;this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){if(this._diffuseRoughness>0!==t>0)this.version++;this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){if(this._iridescence>0!==t>0)this.version++;this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){if(this._dispersion>0!==t>0)this.version++;this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){if(this._retroreflectivity>0!==t>0)this.version++;this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){if(this._sheen>0!==t>0)this.version++;this._sheen=t}get transmission(){return this._transmission}set transmission(t){if(this._transmission>0!==t>0)this.version++;this._transmission=t}get iridescenceThicknessRange(){return fr('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){fr('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class be extends I{constructor(t){super();this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new l(16777215),this.specular=new l(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new l(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new o(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _s,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Le extends I{constructor(t){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new l(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new l(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new o(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _s,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Jc extends I{constructor(t){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class $c extends I{constructor(t){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}function Zs(t,e){if(!t||t.constructor===e)return t;if(typeof e.BYTES_PER_ELEMENT==="number")return new e(t);return Array.prototype.slice.call(t)}function _o(t){return t!==void 0&&t.inTangents!==void 0&&t.outTangents!==void 0}function gm(t){function e(a,c){return t[a]-t[c]}let i=t.length,s=Array(i);for(let a=0;a!==i;++a)s[a]=a;return s.sort(e),s}function Au(t,e,i){let s=t.length,a=new t.constructor(s);for(let c=0,d=0;d!==s;++c){let p=i[c]*e;for(let S=0;S!==e;++S)a[d++]=t[p+S]}return a}function _m(t,e,i,s){let a=1,c=t[0];while(c!==void 0&&c[s]===void 0)c=t[a++];if(c===void 0)return;let d=c[s];if(d===void 0)return;if(Array.isArray(d))do{if(d=c[s],d!==void 0)e.push(c.time),i.push(...d);c=t[a++]}while(c!==void 0);else if(d.toArray!==void 0)do{if(d=c[s],d!==void 0)e.push(c.time),d.toArray(i,i.length);c=t[a++]}while(c!==void 0);else do{if(d=c[s],d!==void 0)e.push(c.time),i.push(d);c=t[a++]}while(c!==void 0)}class Se{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],a=e[i-1];n:{t:{let c;e:{i:if(!(t<s)){for(let d=i+2;;){if(s===void 0){if(t<a)break i;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===d)break;if(a=s,s=e[++i],t<s)break t}c=e.length;break e}if(!(t>=a)){let d=e[1];if(t<d)i=2,a=d;for(let p=i-2;;){if(a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===p)break;if(s=a,a=e[--i-1],t>=a)break t}c=i,i=0;break e}break n}while(i<c){let d=i+c>>>1;if(t<e[d])c=d;else i=d+1}if(s=e[i],a=e[i-1],a===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,a,s)}return this.interpolate_(i,a,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,a=t*s;for(let c=0;c!==s;++c)e[c]=i[a+c];return e}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Kc extends Se{constructor(t,e,i,s){super(t,e,i,s);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(t,e,i){let s=this.parameterPositions,a=t-2,c=t+1,d=s[a],p=s[c];if(d===void 0)switch(this.getSettings_().endingStart){case 2401:a=t,d=2*e-i;break;case 2402:a=s.length-2,d=e+s[a]-s[a+1];break;default:a=t,d=i}if(p===void 0)switch(this.getSettings_().endingEnd){case 2401:c=t,p=2*i-e;break;case 2402:c=1,p=i+s[1]-s[0];break;default:c=t-1,p=e}let S=(i-e)*0.5,E=this.valueSize;this._weightPrev=S/(e-d),this._weightNext=S/(p-i),this._offsetPrev=a*E,this._offsetNext=c*E}interpolate_(t,e,i,s){let a=this.resultBuffer,c=this.sampleValues,d=this.valueSize,p=t*d,S=p-d,E=this._offsetPrev,N=this._offsetNext,D=this._weightPrev,L=this._weightNext,tt=(i-e)/(s-e),vt=tt*tt,zt=vt*tt,nt=-D*zt+2*D*vt-D*tt,yt=(1+D)*zt+(-1.5-2*D)*vt+(-0.5+D)*tt+1,Dt=(-1-L)*zt+(1.5+L)*vt+0.5*tt,Ht=L*zt-L*vt;for(let Ft=0;Ft!==d;++Ft)a[Ft]=nt*c[E+Ft]+yt*c[S+Ft]+Dt*c[p+Ft]+Ht*c[N+Ft];return a}}class Qc extends Se{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let a=this.resultBuffer,c=this.sampleValues,d=this.valueSize,p=t*d,S=p-d,E=(i-e)/(s-e),N=1-E;for(let D=0;D!==d;++D)a[D]=c[S+D]*N+c[p+D]*E;return a}}class jc extends Se{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}}class th extends Se{interpolate_(t,e,i,s){let a=this.resultBuffer,c=this.sampleValues,d=this.valueSize,p=t*d,S=p-d,E=this.inTangents,N=this.outTangents;if(!E||!N){let tt=(i-e)/(s-e),vt=1-tt;for(let zt=0;zt!==d;++zt)a[zt]=c[S+zt]*vt+c[p+zt]*tt;return a}let D=d*2,L=t-1;for(let tt=0;tt!==d;++tt){let vt=c[S+tt],zt=c[p+tt],nt=L*D+tt*2,yt=N[nt],Dt=N[nt+1],Ht=t*D+tt*2,Ft=E[Ht],Xt=E[Ht+1],Jt=ym(i,e,yt,Ft,s);a[tt]=Nf(Jt,vt,Dt,Xt,zt)}return a}}function Nf(t,e,i,s,a){let c=1-t;return c*c*c*e+3*c*c*t*i+3*c*t*t*s+t*t*t*a}function xm(t,e,i,s,a){let c=1-t;return 3*c*c*(i-e)+6*c*t*(s-i)+3*t*t*(a-s)}function ym(t,e,i,s,a){let c=(t-e)/(a-e);for(let d=0;d<8;d++){let p=Nf(c,e,i,s,a)-t;if(Math.abs(p)<0.0000000001)break;let S=xm(c,e,i,s,a);if(Math.abs(S)<0.0000000001)break;c=Math.max(0,Math.min(1,c-p/S))}return c}class as{constructor(t,e,i,s){if(t===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Zs(e,this.TimeBufferType),this.values=Zs(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Zs(t.times,Array),values:Zs(t.values,Array)};let s=t.getInterpolation();if(s!==t.DefaultInterpolation)i.interpolation=s;if(_o(t.settings))i.settings={inTangents:Zs(t.settings.inTangents,Array),outTangents:Zs(t.settings.outTangents,Array)}}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new jc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Qc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Kc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new th(this.times,this.values,this.getValueSize(),t);if(this.settings)e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents;return e}setInterpolation(t){let e;switch(t){case 2300:e=this.InterpolantFactoryMethodDiscrete;break;case 2301:e=this.InterpolantFactoryMethodLinear;break;case 2302:e=this.InterpolantFactoryMethodSmooth;break;case 2303:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(i);return Gn("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t;if(_o(this.settings))Eu(this.settings.inTangents,t),Eu(this.settings.outTangents,t)}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t;if(_o(this.settings))wu(this.settings.inTangents,t),wu(this.settings.outTangents,t)}return this}trim(t,e){let i=this.times,s=i.length,a=0,c=s-1;while(a!==s&&i[a]<t)++a;while(c!==-1&&i[c]>e)--c;if(++c,a!==0||c!==s){if(a>=c)c=Math.max(c,1),a=c-1;let d=this.getValueSize();this.times=i.slice(a,c),this.values=this.values.slice(a*d,c*d)}return this}validate(){let t=!0,e=this.getValueSize();if(e-Math.floor(e)!==0)qn("KeyframeTrack: Invalid value size in track.",this),t=!1;let i=this.times,s=this.values,a=i.length;if(a===0)qn("KeyframeTrack: Track is empty.",this),t=!1;let c=null;for(let d=0;d!==a;d++){let p=i[d];if(typeof p==="number"&&isNaN(p)){qn("KeyframeTrack: Time is not a valid number.",this,d,p),t=!1;break}if(c!==null&&c>p){qn("KeyframeTrack: Out of order keys.",this,d,p,c),t=!1;break}c=p}if(s!==void 0){if(bp(s))for(let d=0,p=s.length;d!==p;++d){let S=s[d];if(isNaN(S)){qn("KeyframeTrack: Value is not a valid number.",this,d,S),t=!1;break}}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===2302,a=t.length-1,c=1;for(let d=1;d<a;++d){let p=!1,S=t[d],E=t[d+1];if(S!==E&&(d!==1||S!==t[0]))if(!s){let N=d*i,D=N-i,L=N+i;for(let tt=0;tt!==i;++tt){let vt=e[N+tt];if(vt!==e[D+tt]||vt!==e[L+tt]){p=!0;break}}}else p=!0;if(p){if(d!==c){t[c]=t[d];let N=d*i,D=c*i;for(let L=0;L!==i;++L)e[D+L]=e[N+L]}++c}}if(a>0){t[c]=t[a];for(let d=a*i,p=c*i,S=0;S!==i;++S)e[p+S]=e[d+S];++c}if(c!==t.length)this.times=t.slice(0,c),this.values=e.slice(0,c*i);else this.times=t,this.values=e;return this}clone(){let t=this.times.slice(),e=this.values.slice(),s=new this.constructor(this.name,t,e);if(s.createInterpolant=this.createInterpolant,_o(this.settings))s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return s}}function Eu(t,e){for(let i=0,s=t.length;i!==s;i+=2)t[i]+=e}function wu(t,e){for(let i=0,s=t.length;i!==s;i+=2)t[i]*=e}as.prototype.ValueTypeName="";as.prototype.TimeBufferType=Float32Array;as.prototype.ValueBufferType=Float32Array;as.prototype.DefaultInterpolation=2301;class Qs extends as{constructor(t,e,i){super(t,e,i)}}Qs.prototype.ValueTypeName="bool";Qs.prototype.ValueBufferType=Array;Qs.prototype.DefaultInterpolation=2300;Qs.prototype.InterpolantFactoryMethodLinear=void 0;Qs.prototype.InterpolantFactoryMethodSmooth=void 0;class Oa extends as{constructor(t,e,i,s){super(t,e,i,s)}}Oa.prototype.ValueTypeName="color";class Ie extends as{constructor(t,e,i,s){super(t,e,i,s)}}Ie.prototype.ValueTypeName="number";class eh extends Se{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let a=this.resultBuffer,c=this.sampleValues,d=this.valueSize,p=(i-e)/(s-e),S=t*d;for(let E=S+d;S!==E;S+=4)P.slerpFlat(a,0,c,S-d,c,S,p);return a}}class Oe extends as{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new eh(this.times,this.values,this.getValueSize(),t)}}Oe.prototype.ValueTypeName="quaternion";Oe.prototype.InterpolantFactoryMethodSmooth=void 0;class js extends as{constructor(t,e,i){super(t,e,i)}}js.prototype.ValueTypeName="string";js.prototype.ValueBufferType=Array;js.prototype.DefaultInterpolation=2300;js.prototype.InterpolantFactoryMethodLinear=void 0;js.prototype.InterpolantFactoryMethodSmooth=void 0;class He extends as{constructor(t,e,i,s){super(t,e,i,s)}}He.prototype.ValueTypeName="vector";class Yt{constructor(t="",e=-1,i=[],s=2500){if(this.name=t,this.tracks=i,this.duration=e,this.blendMode=s,this.uuid=Es(),this.userData={},this.duration<0)this.resetDuration()}static parse(t){let e=[],i=t.tracks,s=1/(t.fps||1);for(let c=0,d=i.length;c!==d;++c)e.push(Sm(i[c]).scale(s));let a=new this(t.name,t.duration,e,t.blendMode);return a.uuid=t.uuid,a.userData=JSON.parse(t.userData||"{}"),a}static toJSON(t){let e=[],i=t.tracks,s={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode,userData:JSON.stringify(t.userData)};for(let a=0,c=i.length;a!==c;++a)e.push(as.toJSON(i[a]));return s}static CreateFromMorphTargetSequence(t,e,i,s){let a=e.length,c=[];for(let d=0;d<a;d++){let p=[],S=[];p.push((d+a-1)%a,d,(d+1)%a),S.push(0,1,0);let E=gm(p);if(p=Au(p,1,E),S=Au(S,1,E),!s&&p[0]===0)p.push(a),S.push(S[0]);c.push(new Ie(".morphTargetInfluences["+e[d].name+"]",p,S).scale(1/i))}return new this(t,-1,c)}static findByName(t,e){let i=t;if(!Array.isArray(t)){let s=t;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===e)return i[s];return null}static CreateClipsFromMorphTargetSequences(t,e,i){let s={},a=/^([\w-]*?)([\d]+)$/;for(let d=0,p=t.length;d<p;d++){let S=t[d],E=S.name.match(a);if(E&&E.length>1){let N=E[1],D=s[N];if(!D)s[N]=D=[];D.push(S)}}let c=[];for(let d in s)c.push(this.CreateFromMorphTargetSequence(d,s[d],e,i));return c}resetDuration(){let t=this.tracks,e=0;for(let i=0,s=t.length;i!==s;++i){let a=this.tracks[i];e=Math.max(e,a.times[a.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let i=0;i<this.tracks.length;i++)t.push(this.tracks[i].clone());let e=new this.constructor(this.name,this.duration,t,this.blendMode);return e.userData=JSON.parse(JSON.stringify(this.userData)),e}toJSON(){return this.constructor.toJSON(this)}}function vm(t){switch(t.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ie;case"vector":case"vector2":case"vector3":case"vector4":return He;case"color":return Oa;case"quaternion":return Oe;case"bool":case"boolean":return Qs;case"string":return js}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+t)}function Sm(t){if(t.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=vm(t.type);if(t.times===void 0){let s=[],a=[];_m(t.keys,s,a,"value"),t.times=s,t.values=a}let i;if(e.parse!==void 0)i=e.parse(t);else i=new e(t.name,t.times,t.values,t.interpolation);if(_o(t.settings))i.settings={inTangents:Zs(t.settings.inTangents,Float32Array),outTangents:Zs(t.settings.outTangents,Float32Array)};return i}var bs={enabled:!1,files:{},add:function(t,e){if(this.enabled===!1)return;if(Ru(t))return;this.files[t]=e},get:function(t){if(this.enabled===!1)return;if(Ru(t))return;return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};function Ru(t){try{let e=t.slice(t.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch(e){return!1}}class nh{constructor(t,e,i){let s=this,a=!1,c=0,d=0,p=void 0,S=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(E){if(d++,a===!1){if(s.onStart!==void 0)s.onStart(E,c,d)}a=!0},this.itemEnd=function(E){if(c++,s.onProgress!==void 0)s.onProgress(E,c,d);if(c===d){if(a=!1,s.onLoad!==void 0)s.onLoad()}},this.itemError=function(E){if(s.onError!==void 0)s.onError(E)},this.resolveURL=function(E){if(E=E.normalize("NFC"),p)return p(E);return E},this.setURLModifier=function(E){return p=E,this},this.addHandler=function(E,N){return S.push(E,N),this},this.removeHandler=function(E){let N=S.indexOf(E);if(N!==-1)S.splice(N,2);return this},this.getHandler=function(E){for(let N=0,D=S.length;N<D;N+=2){let L=S[N],tt=S[N+1];if(L.global)L.lastIndex=0;if(L.test(E))return tt}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Df=new nh;class he{constructor(t){if(this.manager=t!==void 0?t:Df,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,a){i.load(t,s,e,a)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}}he.DEFAULT_MATERIAL_NAME="__DEFAULT";var Bs={};class Uf extends Error{constructor(t,e){super(t);this.response=e}}class Je extends he{constructor(t){super(t);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(t,e,i,s){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let a=bs.get(`file:${t}`);if(a!==void 0){this.manager.itemStart(t),setTimeout(()=>{if(e)e(a);this.manager.itemEnd(t)},0);return}if(Bs[t]!==void 0){Bs[t].push({onLoad:e,onProgress:i,onError:s});return}Bs[t]=[],Bs[t].push({onLoad:e,onProgress:i,onError:s});let c=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),d=this.mimeType,p=this.responseType;fetch(c).then((S)=>{if(S.status===200||S.status===0){if(S.status===0)Gn("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||S.body===void 0||S.body.getReader===void 0)return S;let E=Bs[t],N=S.body.getReader(),D=S.headers.get("X-File-Size")||S.headers.get("Content-Length"),L=D?parseInt(D):0,tt=L!==0,vt=0,zt=new ReadableStream({start(nt){yt();function yt(){N.read().then(({done:Dt,value:Ht})=>{if(Dt)nt.close();else{vt+=Ht.byteLength;let Ft=new ProgressEvent("progress",{lengthComputable:tt,loaded:vt,total:L});for(let Xt=0,Jt=E.length;Xt<Jt;Xt++){let gt=E[Xt];if(gt.onProgress)gt.onProgress(Ft)}nt.enqueue(Ht),yt()}},(Dt)=>{nt.error(Dt)})}}});return new Response(zt)}else throw new Uf(`fetch for "${S.url}" responded with ${S.status}: ${S.statusText}`,S)}).then((S)=>{switch(p){case"arraybuffer":return S.arrayBuffer();case"blob":return S.blob();case"document":return S.text().then((E)=>new DOMParser().parseFromString(E,d));case"json":return S.json();default:if(d==="")return S.text();else{let N=/charset="?([^;"\s]*)"?/i.exec(d),D=N&&N[1]?N[1].toLowerCase():void 0,L=new TextDecoder(D);return S.arrayBuffer().then((tt)=>L.decode(tt))}}}).then((S)=>{bs.add(`file:${t}`,S);let E=Bs[t];delete Bs[t];for(let N=0,D=E.length;N<D;N++){let L=E[N];if(L.onLoad)L.onLoad(S)}}).catch((S)=>{let E=Bs[t];if(E===void 0)throw this.manager.itemError(t),S;delete Bs[t];for(let N=0,D=E.length;N<D;N++){let L=E[N];if(L.onError)L.onError(S)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class At extends he{constructor(t){super(t)}load(t,e,i,s){let a=this,c=[],d=new ft,p=new Je(this.manager);p.setPriority(this.priority),p.setCache(this.cache),p.setPath(this.path),p.setResponseType("arraybuffer"),p.setRequestHeader(this.requestHeader),p.setWithCredentials(a.withCredentials);let S=0;function E(N){p.load(t[N],function(D){let L=a.parse(D,!0);if(c[N]={width:L.width,height:L.height,format:L.format,mipmaps:L.mipmaps},S+=1,S===6){if(L.mipmapCount===1)d.minFilter=1006;if(d.image=c,d.format=L.format,d.needsUpdate=!0,e)e(d)}},i,s)}if(Array.isArray(t))for(let N=0,D=t.length;N<D;++N)E(N);else p.load(t,function(N){let D=a.parse(N,!0);if(D.isCubemap){let L=D.mipmaps.length/D.mipmapCount;for(let tt=0;tt<L;tt++){c[tt]={mipmaps:[]};for(let vt=0;vt<D.mipmapCount;vt++)c[tt].mipmaps.push(D.mipmaps[tt*D.mipmapCount+vt]),c[tt].format=D.format,c[tt].width=D.width,c[tt].height=D.height}d.image=c}else d.image.width=D.width,d.image.height=D.height,d.mipmaps=D.mipmaps;if(D.mipmapCount===1)d.minFilter=1006;if(d.format=D.format,d.needsUpdate=!0,e)e(d)},i,s);return d}}var Dr=new WeakMap;class ih extends he{constructor(t){super(t)}load(t,e,i,s){if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let a=this,c=bs.get(`image:${t}`);if(c!==void 0){if(c.complete===!0)a.manager.itemStart(t),setTimeout(function(){if(e)e(c);a.manager.itemEnd(t)},0);else{let N=Dr.get(c);if(N===void 0)N=[],Dr.set(c,N);N.push({onLoad:e,onError:s})}return c}let d=Gr("img");function p(){if(E(),e)e(this);let N=Dr.get(this)||[];for(let D=0;D<N.length;D++){let L=N[D];if(L.onLoad)L.onLoad(this)}Dr.delete(this),a.manager.itemEnd(t)}function S(N){if(E(),s)s(N);bs.remove(`image:${t}`);let D=Dr.get(this)||[];for(let L=0;L<D.length;L++){let tt=D[L];if(tt.onError)tt.onError(N)}Dr.delete(this),a.manager.itemError(t),a.manager.itemEnd(t)}function E(){d.removeEventListener("load",p,!1),d.removeEventListener("error",S,!1)}if(d.addEventListener("load",p,!1),d.addEventListener("error",S,!1),t.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)d.crossOrigin=this.crossOrigin}return bs.add(`image:${t}`,d),a.manager.itemStart(t),d.fetchPriority=this.priority,d.src=t,d}}class Rt extends he{constructor(t){super(t)}load(t,e,i,s){let a=new v,c=new ih(this.manager);return c.setPriority(this.priority),c.setCache(this.cache),c.setCrossOrigin(this.crossOrigin),c.setPath(this.path),c.load(t,function(d){if(a.image=d,a.needsUpdate=!0,e!==void 0)e(a)},i,s),a}}class oe extends T{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super();this.isLight=!0,this.type="Light",this.color=new l(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class Wt extends oe{constructor(t,e,i){super(t,i);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(T.DEFAULT_UP),this.updateMatrix(),this.groundColor=new l(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}var Gl=new r,Cu=new n,Iu=new n;class ze{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new o(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new r,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Q,this._frameExtents=new o(1,1),this._viewportCount=1,this._viewports=[new y(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Cu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Cu),Iu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Iu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){Gl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Gl,t.coordinateSystem,t.reversedDepth);let a=this._frameExtents,c=s?s.z/a.x:1,d=s?s.w/a.y:1,p=s?s.x/a.x:0,S=s?s.y/a.y:0;if(t.coordinateSystem===2001||t.reversedDepth)e.set(0.5*c,0,0,0.5*c+p,0,0.5*d,0,0.5*d+S,0,0,1,0,0,0,0,1);else e.set(0.5*c,0,0,0.5*c+p,0,0.5*d,0,0.5*d+S,0,0,0.5,0.5,0,0,0,1);e.multiply(Gl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}var xa=new n,ya=new P,Ms=new n;class Ba extends T{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new r,this.projectionMatrix=new r,this.projectionMatrixInverse=new r,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.matrixWorld.decompose(xa,ya,Ms),Ms.x===1&&Ms.y===1&&Ms.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(xa,ya,Ms.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){if(super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(xa,ya,Ms),Ms.x===1&&Ms.y===1&&Ms.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(xa,ya,Ms.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Ys=new n,Pu=new o,Lu=new o;class w extends Ba{constructor(t=50,e=1,i=0.1,s=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=0.5*this.getFilmHeight()/t;this.fov=dr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(xo*0.5*this.fov);return 0.5*this.getFilmHeight()/t}getEffectiveFOV(){return dr*2*Math.atan(Math.tan(xo*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Ys.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),e.set(Ys.x,Ys.y).multiplyScalar(-t/Ys.z),Ys.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ys.x,Ys.y).multiplyScalar(-t/Ys.z)}getViewSize(t,e){return this.getViewBounds(t,Pu,Lu),e.subVectors(Lu,Pu)}setViewOffset(t,e,i,s,a,c){if(this.aspect=t/e,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(xo*0.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,a=-0.5*s,c=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:p,fullHeight:S}=c;a+=c.offsetX*s/p,e-=c.offsetY*i/S,s*=c.width/p,i*=c.height/S}let d=this.filmOffset;if(d!==0)a+=t*d/this.getFilmWidth();this.projectionMatrix.makePerspective(a,a+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null)e.object.view=Object.assign({},this.view);return e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class Ff extends ze{constructor(){super(new w(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,i=dr*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,a=t.distance||e.far;if(i!==e.fov||s!==e.aspect||a!==e.far)e.fov=i,e.aspect=s,e.far=a,e.updateProjectionMatrix();super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}}class Ct extends oe{constructor(t,e,i=0,s=Math.PI/3,a=0,c=2){super(t,e);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(T.DEFAULT_UP),this.updateMatrix(),this.target=new T,this.distance=i,this.angle=s,this.penumbra=a,this.decay=c,this.map=null,this.shadow=new Ff}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);if(e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture)e.object.map=this.map.toJSON(t).uuid;return e.object.shadow=this.shadow.toJSON(),e}}class Of extends ze{constructor(){super(new w(90,1,0.5,500));this.isPointLightShadow=!0}}class Qe extends oe{constructor(t,e,i=0,s=2){super(t,e);this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Of}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class Te extends Ba{constructor(t=-1,e=1,i=1,s=-1,a=0.1,c=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=a,this.far=c,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,a,c){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=a,this.view.height=c,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,a=i-t,c=i+t,d=s+e,p=s-e;if(this.view!==null&&this.view.enabled){let S=(this.right-this.left)/this.view.fullWidth/this.zoom,E=(this.top-this.bottom)/this.view.fullHeight/this.zoom;a+=S*this.view.offsetX,c=a+S*this.view.width,d-=E*this.view.offsetY,p=d-E*this.view.height}this.projectionMatrix.makeOrthographic(a,c,d,p,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null)e.object.view=Object.assign({},this.view);return e}}class Bf extends ze{constructor(){super(new Te(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class Xe extends oe{constructor(t,e){super(t,e);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(T.DEFAULT_UP),this.updateMatrix(),this.target=new T,this.shadow=new Bf}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}class Ut extends oe{constructor(t,e){super(t,e);this.isAmbientLight=!0,this.type="AmbientLight"}}class De{static extractUrlBase(t){let e=t.lastIndexOf("/");if(e===-1)return"./";return t.slice(0,e+1)}static resolveURL(t,e){if(typeof t!=="string"||t==="")return"";if(/^https?:\/\//i.test(e)&&/^\//.test(t))e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(t))return t;if(/^data:.*,.*$/i.test(t))return t;if(/^blob:.*$/i.test(t))return t;return e+t}}var kl=new WeakMap;class Nt extends he{constructor(t){super(t);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")Gn("ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")Gn("ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(t){return this.options=t,this}load(t,e,i,s){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let a=this,c=bs.get(`image-bitmap:${t}`);if(c!==void 0){if(a.manager.itemStart(t),c.then){c.then((S)=>{if(kl.has(c)===!0){if(s)s(kl.get(c));a.manager.itemError(t),a.manager.itemEnd(t)}else{if(e)e(S);a.manager.itemEnd(t)}});return}setTimeout(function(){if(e)e(c);a.manager.itemEnd(t)},0);return}let d={};d.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",d.headers=this.requestHeader,d.priority=this.priority,d.cache=this.cache,d.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let p=fetch(t,d).then(function(S){return S.blob()}).then(function(S){return createImageBitmap(S,Object.assign({},a.options,{colorSpaceConversion:"none"}))}).then(function(S){if(bs.add(`image-bitmap:${t}`,S),e)e(S);return a.manager.itemEnd(t),S}).catch(function(S){if(s)s(S);kl.set(p,S),bs.remove(`image-bitmap:${t}`),a.manager.itemError(t),a.manager.itemEnd(t)});bs.add(`image-bitmap:${t}`,p),a.manager.itemStart(t)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var Ur=-90,Fr=1;class Io extends T{constructor(t,e,i){super();this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new w(Ur,Fr,t,e);s.layers=this.layers,this.add(s);let a=new w(Ur,Fr,t,e);a.layers=this.layers,this.add(a);let c=new w(Ur,Fr,t,e);c.layers=this.layers,this.add(c);let d=new w(Ur,Fr,t,e);d.layers=this.layers,this.add(d);let p=new w(Ur,Fr,t,e);p.layers=this.layers,this.add(p);let S=new w(Ur,Fr,t,e);S.layers=this.layers,this.add(S)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,a,c,d,p]=e;for(let S of e)this.remove(S);if(t===2000)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),a.up.set(0,0,-1),a.lookAt(0,1,0),c.up.set(0,0,1),c.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(t===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),a.up.set(0,0,1),a.lookAt(0,1,0),c.up.set(0,0,-1),c.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let S of e)this.add(S),S.updateMatrixWorld()}update(t,e){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;if(this.coordinateSystem!==t.coordinateSystem)this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem();let[a,c,d,p,S,E]=this.children,N=t.getRenderTarget(),D=t.getActiveCubeFace(),L=t.getActiveMipmapLevel(),tt=t.xr.enabled;t.xr.enabled=!1;let vt=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let zt=!1;if(t.isWebGLRenderer===!0)zt=t.state.buffers.depth.getReversed();else zt=t.reversedDepthBuffer;if(t.setRenderTarget(i,0,s),zt&&t.autoClear===!1)t.clearDepth();if(t.render(e,a),t.setRenderTarget(i,1,s),zt&&t.autoClear===!1)t.clearDepth();if(t.render(e,c),t.setRenderTarget(i,2,s),zt&&t.autoClear===!1)t.clearDepth();if(t.render(e,d),t.setRenderTarget(i,3,s),zt&&t.autoClear===!1)t.clearDepth();if(t.render(e,p),t.setRenderTarget(i,4,s),zt&&t.autoClear===!1)t.clearDepth();if(t.render(e,S),i.texture.mipmapsAutoUpdate=vt,t.setRenderTarget(i,5,s),zt&&t.autoClear===!1)t.clearDepth();t.render(e,E),t.setRenderTarget(N,D,L),t.xr.enabled=tt,i.texture.needsPMREMUpdate=!0}}class sh extends w{constructor(t=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}var rh="\\[\\]\\.:\\/",Mm=new RegExp("["+rh+"]","g"),oh="[^"+rh+"]",bm="[^"+rh.replace("\\.","")+"]",Tm=/((?:WC+[\/:])*)/.source.replace("WC",oh),Am=/(WCOD+)?/.source.replace("WCOD",bm),Em=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",oh),wm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",oh),Rm=new RegExp("^"+Tm+Am+Em+wm+"$"),Cm=["material","materials","bones","map"];class zf{constructor(t,e,i){let s=i||b.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];if(s!==void 0)s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,a=i.length;s!==a;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}}class b{constructor(t,e,i){this.path=e,this.parsedPath=i||b.parseTrackName(e),this.node=b.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){if(!(t&&t.isAnimationObjectGroup))return new b(t,e,i);else return new b.Composite(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Mm,"")}static parseTrackName(t){let e=Rm.exec(t);if(e===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let a=i.nodeName.substring(s+1);if(Cm.indexOf(a)!==-1)i.nodeName=i.nodeName.substring(0,s),i.objectName=a}if(i.propertyName===null||i.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(a){for(let c=0;c<a.length;c++){let d=a[c];if(d.name===e||d.uuid===e)return d;let p=i(d.children);if(p)return p}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,a=i.length;s!==a;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,{objectName:i,propertyName:s,propertyIndex:a}=e;if(!t)t=b.findNode(this.rootNode,e.nodeName),this.node=t;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gn("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let S=e.objectIndex;switch(i){case"materials":if(!t.material){qn("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){qn("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){qn("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let E=0;E<t.length;E++)if(t[E].name===S){S=E;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){qn("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){qn("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){qn("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(S!==void 0){if(t[S]===void 0){qn("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[S]}}let c=t[s];if(c===void 0){let S=e.nodeName;qn("PropertyBinding: Trying to update property for track: "+S+"."+s+" but it wasn't found.",t);return}let d=this.Versioning.None;if(this.targetObject=t,t.isMaterial===!0)d=this.Versioning.NeedsUpdate;else if(t.isObject3D===!0)d=this.Versioning.MatrixWorldNeedsUpdate;let p=this.BindingType.Direct;if(a!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){qn("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){qn("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(t.morphTargetDictionary[a]!==void 0)a=t.morphTargetDictionary[a]}p=this.BindingType.ArrayElement,this.resolvedProperty=c,this.propertyIndex=a}else if(c.fromArray!==void 0&&c.toArray!==void 0)p=this.BindingType.HasFromToArray,this.resolvedProperty=c;else if(Array.isArray(c))p=this.BindingType.EntireArray,this.resolvedProperty=c;else this.propertyName=s;this.getValue=this.GetterByBindingType[p],this.setValue=this.SetterByBindingTypeAndVersioning[p][d]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}b.Composite=zf;b.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};b.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};b.prototype.GetterByBindingType=[b.prototype._getValue_direct,b.prototype._getValue_array,b.prototype._getValue_arrayElement,b.prototype._getValue_toArray];b.prototype.SetterByBindingTypeAndVersioning=[[b.prototype._setValue_direct,b.prototype._setValue_direct_setNeedsUpdate,b.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[b.prototype._setValue_array,b.prototype._setValue_array_setNeedsUpdate,b.prototype._setValue_array_setMatrixWorldNeedsUpdate],[b.prototype._setValue_arrayElement,b.prototype._setValue_arrayElement_setNeedsUpdate,b.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[b.prototype._setValue_fromArray,b.prototype._setValue_fromArray_setNeedsUpdate,b.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Wy=new Float32Array(1);var Nu=new r;class ae{constructor(t,e,i=0,s=1/0){this.ray=new ie(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new Eo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){if(e.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,0.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e;else if(e.isOrthographicCamera)this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e;else qn("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Nu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nu),this}intersectObject(t,e=!0,i=[]){return Wl(t,this,i,e),i.sort(Du),i}intersectObjects(t,e=!0,i=[]){for(let s=0,a=t.length;s<a;s++)Wl(t[s],this,i,e);return i.sort(Du),i}}function Du(t,e){return t.distance-e.distance}function Wl(t,e,i,s){let a=!0;if(t.layers.test(e.layers)){if(t.raycast(e,i)===!1)a=!1}if(a===!0&&s===!0){let c=t.children;for(let d=0,p=c.length;d<p;d++)Wl(c[d],e,i,!0)}}class Ze{constructor(t=1,e=0,i=0){this.radius=t,this.phi=e,this.theta=i}set(t,e,i){return this.radius=t,this.phi=e,this.theta=i,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Yn(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,i){if(this.radius=Math.sqrt(t*t+e*e+i*i),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(t,i),this.phi=Math.acos(Yn(e/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class Gf{static{this.prototype.isMatrix2=!0}constructor(t,e,i,s){if(this.elements=[1,0,0,1],t!==void 0)this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let a=this.elements;return a[0]=t,a[2]=e,a[1]=i,a[3]=s,this}}var Uu=new n,va=new n,Or=new n,Br=new n,Hl=new n,Im=new n,Pm=new n;class is{constructor(t=new n,e=new n){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Uu.subVectors(t,this.start),va.subVectors(this.end,this.start);let i=va.dot(va);if(i===0)return 0;let a=va.dot(Uu)/i;if(e)a=Yn(a,0,1);return a}closestPointToPoint(t,e,i){let s=this.closestPointToPointParameter(t,e);return this.delta(i).multiplyScalar(s).add(this.start)}distanceSqToLine3(t,e=Im,i=Pm){let a,c,d=this.start,p=t.start,S=this.end,E=t.end;Or.subVectors(S,d),Br.subVectors(E,p),Hl.subVectors(d,p);let N=Or.dot(Or),D=Br.dot(Br),L=Br.dot(Hl);if(N<=0.00000000000000010000000000000001&&D<=0.00000000000000010000000000000001)return e.copy(d),i.copy(p),e.distanceToSquared(i);if(N<=0.00000000000000010000000000000001)a=0,c=L/D,c=Yn(c,0,1);else{let tt=Or.dot(Hl);if(D<=0.00000000000000010000000000000001)c=0,a=Yn(-tt/N,0,1);else{let vt=Or.dot(Br),zt=N*D-vt*vt;if(zt!==0)a=Yn((vt*L-tt*D)/zt,0,1);else a=0;if(c=(vt*a+L)/D,c<0)c=0,a=Yn(-tt/N,0,1);else if(c>1)c=1,a=Yn((vt-tt)/N,0,1)}}return e.copy(d).addScaledVector(Or,a),i.copy(p).addScaledVector(Br,c),e.distanceToSquared(i)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Pt extends te{constructor(t,e=16776960){let i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),s=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],a=new g;a.setIndex(new _(i,1)),a.setAttribute("position",new x(s,3));super(a,new ee({color:e,toneMapped:!1}));this.box=t,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(t){let e=this.box;if(e.isEmpty())return;e.getCenter(this.position),e.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(t)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}class Lt extends As{constructor(t,e=null){super();this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(this.domElement!==null)this.disconnect();this.domElement=t}disconnect(){}dispose(){}update(){}}function ah(t,e,i,s){let a=Lm(s);switch(i){case 1021:return t*e;case 1028:return t*e/a.components*a.byteLength;case 1029:return t*e/a.components*a.byteLength;case 1030:return t*e*2/a.components*a.byteLength;case 1031:return t*e*2/a.components*a.byteLength;case 1022:return t*e*3/a.components*a.byteLength;case 1023:return t*e*4/a.components*a.byteLength;case 1033:return t*e*4/a.components*a.byteLength;case 33776:case 33777:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(t,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(t,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(t/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(t/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw Error(`Unable to determine texture byte length for ${i} format.`)}function Lm(t){switch(t){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${t}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Gn("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function ld(){let t=null,e=!1,i=null,s=null;function a(c,d){s=t.requestAnimationFrame(a),i(c,d)}return{start:function(){if(e===!0)return;if(i===null)return;if(t===null)return;s=t.requestAnimationFrame(a),e=!0},stop:function(){if(t!==null)t.cancelAnimationFrame(s);e=!1},setAnimationLoop:function(c){i=c},setContext:function(c){t=c}}}function Nm(t){let e=new WeakMap;function i(p,S){let{array:E,usage:N}=p,D=E.byteLength,L=t.createBuffer();t.bindBuffer(S,L),t.bufferData(S,E,N),p.onUploadCallback();let tt;if(E instanceof Float32Array)tt=t.FLOAT;else if(typeof Float16Array<"u"&&E instanceof Float16Array)tt=t.HALF_FLOAT;else if(E instanceof Uint16Array)if(p.isFloat16BufferAttribute)tt=t.HALF_FLOAT;else tt=t.UNSIGNED_SHORT;else if(E instanceof Int16Array)tt=t.SHORT;else if(E instanceof Uint32Array)tt=t.UNSIGNED_INT;else if(E instanceof Int32Array)tt=t.INT;else if(E instanceof Int8Array)tt=t.BYTE;else if(E instanceof Uint8Array)tt=t.UNSIGNED_BYTE;else if(E instanceof Uint8ClampedArray)tt=t.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+E);return{buffer:L,type:tt,bytesPerElement:E.BYTES_PER_ELEMENT,version:p.version,size:D}}function s(p,S,E){let{array:N,updateRanges:D}=S;if(t.bindBuffer(E,p),D.length===0)t.bufferSubData(E,0,N);else{D.sort((tt,vt)=>tt.start-vt.start);let L=0;for(let tt=1;tt<D.length;tt++){let vt=D[L],zt=D[tt];if(zt.start<=vt.start+vt.count+1)vt.count=Math.max(vt.count,zt.start+zt.count-vt.start);else++L,D[L]=zt}D.length=L+1;for(let tt=0,vt=D.length;tt<vt;tt++){let zt=D[tt];t.bufferSubData(E,zt.start*N.BYTES_PER_ELEMENT,N,zt.start,zt.count)}S.clearUpdateRanges()}S.onUploadCallback()}function a(p){if(p.isInterleavedBufferAttribute)p=p.data;return e.get(p)}function c(p){if(p.isInterleavedBufferAttribute)p=p.data;let S=e.get(p);if(S)t.deleteBuffer(S.buffer),e.delete(p)}function d(p,S){if(p.isInterleavedBufferAttribute)p=p.data;if(p.isGLBufferAttribute){let N=e.get(p);if(!N||N.version<p.version)e.set(p,{buffer:p.buffer,type:p.type,bytesPerElement:p.elementSize,version:p.version});return}let E=e.get(p);if(E===void 0)e.set(p,i(p,S));else if(E.version<p.version){if(E.size!==p.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(E.buffer,p,S),E.version=p.version}}return{get:a,remove:c,update:d}}var Dm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Um=`#ifdef USE_ALPHAHASH
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
#endif`,Fm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Om=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Bm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,zm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Gm=`#ifdef USE_AOMAP
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
#endif`,km=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Hm=`#ifdef USE_BATCHING
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
#endif`,Vm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Wm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Xm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,qm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ym=`#ifdef USE_IRIDESCENCE
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
#endif`,Zm=`#ifdef USE_BUMPMAP
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
#endif`,Jm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,$m=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Km=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Qm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,tg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,eg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,ng=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,ig=`#define PI 3.141592653589793
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
} // validated`,sg=`vec3 transformedNormal = objectNormal;
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
#endif`,rg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,og=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ag=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,lg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,cg="gl_FragColor = linearToOutputTexel( gl_FragColor );",hg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ug=`#ifdef USE_ENVMAP
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
#endif`,fg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,dg=`#ifdef USE_ENVMAP
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
#endif`,pg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,mg=`#ifdef USE_ENVMAP
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
#endif`,gg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,_g=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,xg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,yg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,vg=`#ifdef USE_GRADIENTMAP
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
}`,Sg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Mg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,bg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Tg=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Ag=`#ifdef USE_ENVMAP
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
#endif`,Eg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,wg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Rg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Cg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ig=`PhysicalMaterial material;
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
#endif`,Pg=`uniform sampler2D dfgLUT;
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
}`,Lg=`
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
#endif`,Ng=`#if defined( RE_IndirectDiffuse )
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
#endif`,Dg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ug=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Fg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Og=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Gg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,kg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Hg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Vg=`#if defined( USE_POINTS_UV )
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
#endif`,Wg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Yg=`#if defined( USE_MORPHCOLORS )
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
#endif`,Zg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jg=`#ifdef USE_MORPHTARGETS
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
#endif`,$g=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Kg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Qg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,jg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,t_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,e_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,n_=`#ifdef USE_NORMALMAP
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
#endif`,i_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,s_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,r_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,o_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,a_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,l_=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,c_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,h_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,u_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,f_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,d_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,p_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,m_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,g_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,__=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,x_=`float getShadowMask() {
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
}`,y_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,v_=`#ifdef USE_SKINNING
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
#endif`,S_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,M_=`#ifdef USE_SKINNING
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
#endif`,b_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,T_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,E_=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,w_=`#ifdef USE_TRANSMISSION
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
#endif`,R_=`#ifdef USE_TRANSMISSION
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
#endif`,C_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,I_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,P_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var L_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,N_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,D_=`uniform sampler2D t2D;
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
}`,U_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F_=`uniform float backgroundBlurriness;
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
}`,O_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,z_=`#include <common>
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
}`,G_=`#if DEPTH_PACKING == 3200
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
}`,k_=`#define DISTANCE
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
}`,H_=`#define DISTANCE
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
}`,V_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,W_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,X_=`uniform float scale;
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
}`,q_=`uniform vec3 diffuse;
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
}`,Y_=`#include <common>
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
}`,Z_=`uniform vec3 diffuse;
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
}`,J_=`#define LAMBERT
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
}`,$_=`#define LAMBERT
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
}`,K_=`#define MATCAP
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
}`,Q_=`#define MATCAP
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
}`,j_=`#define NORMAL
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
}`,t0=`#define NORMAL
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
}`,e0=`#define PHONG
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
}`,n0=`#define PHONG
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
}`,i0=`#define STANDARD
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
}`,s0=`#define STANDARD
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
}`,r0=`#define TOON
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
}`,o0=`#define TOON
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
}`,a0=`uniform float size;
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
}`,l0=`uniform vec3 diffuse;
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
}`,c0=`#include <common>
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
}`,h0=`uniform vec3 color;
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
}`,u0=`uniform float rotation;
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
}`,f0=`uniform vec3 diffuse;
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
}`,f={alphahash_fragment:Dm,alphahash_pars_fragment:Um,alphamap_fragment:Fm,alphamap_pars_fragment:Om,alphatest_fragment:Bm,alphatest_pars_fragment:zm,aomap_fragment:Gm,aomap_pars_fragment:km,batching_pars_vertex:Hm,batching_vertex:Vm,begin_vertex:Wm,beginnormal_vertex:Xm,bsdfs:qm,iridescence_fragment:Ym,bumpmap_pars_fragment:Zm,clipping_planes_fragment:Jm,clipping_planes_pars_fragment:$m,clipping_planes_pars_vertex:Km,clipping_planes_vertex:Qm,color_fragment:jm,color_pars_fragment:tg,color_pars_vertex:eg,color_vertex:ng,common:ig,defaultnormal_vertex:sg,displacementmap_pars_vertex:rg,displacementmap_vertex:og,emissivemap_fragment:ag,emissivemap_pars_fragment:lg,colorspace_fragment:cg,colorspace_pars_fragment:hg,envmap_fragment:ug,envmap_common_pars_fragment:fg,envmap_pars_fragment:dg,envmap_pars_vertex:pg,envmap_physical_pars_fragment:Ag,envmap_vertex:mg,fog_vertex:gg,fog_pars_vertex:_g,fog_fragment:xg,fog_pars_fragment:yg,gradientmap_pars_fragment:vg,lightmap_pars_fragment:Sg,lights_lambert_fragment:Mg,lights_lambert_pars_fragment:bg,lights_pars_begin:Tg,lights_toon_fragment:Eg,lights_toon_pars_fragment:wg,lights_phong_fragment:Rg,lights_phong_pars_fragment:Cg,lights_physical_fragment:Ig,lights_physical_pars_fragment:Pg,lights_fragment_begin:Lg,lights_fragment_maps:Ng,lights_fragment_end:Dg,lightprobes_pars_fragment:Ug,logdepthbuf_fragment:Fg,logdepthbuf_pars_fragment:Og,logdepthbuf_pars_vertex:Bg,logdepthbuf_vertex:zg,map_fragment:Gg,map_pars_fragment:kg,map_particle_fragment:Hg,map_particle_pars_fragment:Vg,metalnessmap_fragment:Wg,metalnessmap_pars_fragment:Xg,morphinstance_vertex:qg,morphcolor_vertex:Yg,morphnormal_vertex:Zg,morphtarget_pars_vertex:Jg,morphtarget_vertex:$g,normal_fragment_begin:Kg,normal_fragment_maps:Qg,normal_pars_fragment:jg,normal_pars_vertex:t_,normal_vertex:e_,normalmap_pars_fragment:n_,clearcoat_normal_fragment_begin:i_,clearcoat_normal_fragment_maps:s_,clearcoat_pars_fragment:r_,iridescence_pars_fragment:o_,opaque_fragment:a_,packing:l_,premultiplied_alpha_fragment:c_,project_vertex:h_,dithering_fragment:u_,dithering_pars_fragment:f_,roughnessmap_fragment:d_,roughnessmap_pars_fragment:p_,shadowmap_pars_fragment:m_,shadowmap_pars_vertex:g_,shadowmap_vertex:__,shadowmask_pars_fragment:x_,skinbase_vertex:y_,skinning_pars_vertex:v_,skinning_vertex:S_,skinnormal_vertex:M_,specularmap_fragment:b_,specularmap_pars_fragment:T_,tonemapping_fragment:A_,tonemapping_pars_fragment:E_,transmission_fragment:w_,transmission_pars_fragment:R_,uv_pars_fragment:C_,uv_pars_vertex:I_,uv_vertex:P_,worldpos_vertex:L_,background_vert:N_,background_frag:D_,backgroundCube_vert:U_,backgroundCube_frag:F_,cube_vert:O_,cube_frag:B_,depth_vert:z_,depth_frag:G_,distance_vert:k_,distance_frag:H_,equirect_vert:V_,equirect_frag:W_,linedashed_vert:X_,linedashed_frag:q_,meshbasic_vert:Y_,meshbasic_frag:Z_,meshlambert_vert:J_,meshlambert_frag:$_,meshmatcap_vert:K_,meshmatcap_frag:Q_,meshnormal_vert:j_,meshnormal_frag:t0,meshphong_vert:e0,meshphong_frag:n0,meshphysical_vert:i0,meshphysical_frag:s0,meshtoon_vert:r0,meshtoon_frag:o0,points_vert:a0,points_frag:l0,shadow_vert:c0,shadow_frag:h0,sprite_vert:u0,sprite_frag:f0},Rn={common:{diffuse:{value:new l(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zn},alphaMap:{value:null},alphaMapTransform:{value:new Zn},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zn}},envmap:{envMap:{value:null},envMapRotation:{value:new Zn},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zn}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zn}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zn},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zn},normalScale:{value:new o(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zn},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zn}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zn}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zn}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new l(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new l(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zn},alphaTest:{value:0},uvTransform:{value:new Zn}},sprite:{diffuse:{value:new l(16777215)},opacity:{value:1},center:{value:new o(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zn},alphaMap:{value:null},alphaMapTransform:{value:new Zn},alphaTest:{value:0}}},Rs={basic:{uniforms:Yi([Rn.common,Rn.specularmap,Rn.envmap,Rn.aomap,Rn.lightmap,Rn.fog]),vertexShader:f.meshbasic_vert,fragmentShader:f.meshbasic_frag},lambert:{uniforms:Yi([Rn.common,Rn.specularmap,Rn.envmap,Rn.aomap,Rn.lightmap,Rn.emissivemap,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,Rn.fog,Rn.lights,{emissive:{value:new l(0)},envMapIntensity:{value:1}}]),vertexShader:f.meshlambert_vert,fragmentShader:f.meshlambert_frag},phong:{uniforms:Yi([Rn.common,Rn.specularmap,Rn.envmap,Rn.aomap,Rn.lightmap,Rn.emissivemap,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,Rn.fog,Rn.lights,{emissive:{value:new l(0)},specular:{value:new l(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:f.meshphong_vert,fragmentShader:f.meshphong_frag},standard:{uniforms:Yi([Rn.common,Rn.envmap,Rn.aomap,Rn.lightmap,Rn.emissivemap,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,Rn.roughnessmap,Rn.metalnessmap,Rn.fog,Rn.lights,{emissive:{value:new l(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:f.meshphysical_vert,fragmentShader:f.meshphysical_frag},toon:{uniforms:Yi([Rn.common,Rn.aomap,Rn.lightmap,Rn.emissivemap,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,Rn.gradientmap,Rn.fog,Rn.lights,{emissive:{value:new l(0)}}]),vertexShader:f.meshtoon_vert,fragmentShader:f.meshtoon_frag},matcap:{uniforms:Yi([Rn.common,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,Rn.fog,{matcap:{value:null}}]),vertexShader:f.meshmatcap_vert,fragmentShader:f.meshmatcap_frag},points:{uniforms:Yi([Rn.points,Rn.fog]),vertexShader:f.points_vert,fragmentShader:f.points_frag},dashed:{uniforms:Yi([Rn.common,Rn.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:f.linedashed_vert,fragmentShader:f.linedashed_frag},depth:{uniforms:Yi([Rn.common,Rn.displacementmap]),vertexShader:f.depth_vert,fragmentShader:f.depth_frag},normal:{uniforms:Yi([Rn.common,Rn.bumpmap,Rn.normalmap,Rn.displacementmap,{opacity:{value:1}}]),vertexShader:f.meshnormal_vert,fragmentShader:f.meshnormal_frag},sprite:{uniforms:Yi([Rn.sprite,Rn.fog]),vertexShader:f.sprite_vert,fragmentShader:f.sprite_frag},background:{uniforms:{uvTransform:{value:new Zn},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:f.background_vert,fragmentShader:f.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zn}},vertexShader:f.backgroundCube_vert,fragmentShader:f.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:f.cube_vert,fragmentShader:f.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:f.equirect_vert,fragmentShader:f.equirect_frag},distance:{uniforms:Yi([Rn.common,Rn.displacementmap,{referencePosition:{value:new n},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:f.distance_vert,fragmentShader:f.distance_frag},shadow:{uniforms:Yi([Rn.lights,Rn.fog,{color:{value:new l(0)},opacity:{value:1}}]),vertexShader:f.shadow_vert,fragmentShader:f.shadow_frag}};Rs.physical={uniforms:Yi([Rs.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zn},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zn},clearcoatNormalScale:{value:new o(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zn},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Zn},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zn},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zn},sheen:{value:0},sheenColor:{value:new l(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zn},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zn},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zn},transmissionSamplerSize:{value:new o},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zn},attenuationDistance:{value:0},attenuationColor:{value:new l(0)},specularColor:{value:new l(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zn},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zn},anisotropyVector:{value:new o},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zn}}]),vertexShader:f.meshphysical_vert,fragmentShader:f.meshphysical_frag};var za={r:0,b:0,g:0},d0=new r,cd=new Zn;cd.set(-1,0,0,0,1,0,0,0,1);function p0(t,e,i,s,a,c){let d=new l(0),p=a===!0?0:1,S,E,N=null,D=0,L=null;function tt(Dt){let Ht=Dt.isScene===!0?Dt.background:null;if(Ht&&Ht.isTexture){let Ft=Dt.backgroundBlurriness>0;Ht=e.get(Ht,Ft)}return Ht}function vt(Dt){let Ht=!1,Ft=tt(Dt);if(Ft===null)nt(d,p);else if(Ft&&Ft.isColor)nt(Ft,1),Ht=!0;let Xt=t.xr.getEnvironmentBlendMode();if(Xt==="additive")i.buffers.color.setClear(0,0,0,1,c);else if(Xt==="alpha-blend")i.buffers.color.setClear(0,0,0,0,c);if(t.autoClear||Ht)i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil)}function zt(Dt,Ht){let Ft=tt(Ht);if(Ft&&Ft.isCubeTexture){if(E===void 0)E=new u(new Pe(1,1,1),new re({name:"BackgroundCubeMaterial",uniforms:xr(Rs.backgroundCube.uniforms),vertexShader:Rs.backgroundCube.vertexShader,fragmentShader:Rs.backgroundCube.fragmentShader,side:C,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),E.geometry.deleteAttribute("normal"),E.geometry.deleteAttribute("uv"),E.onBeforeRender=function(Xt,Jt,gt){this.matrixWorld.copyPosition(gt.matrixWorld)},Object.defineProperty(E.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(E);if(E.material.uniforms.envMap.value=Ft,E.material.uniforms.backgroundBlurriness.value=Ht.backgroundBlurriness,E.material.uniforms.backgroundIntensity.value=Ht.backgroundIntensity,E.material.uniforms.backgroundRotation.value.setFromMatrix4(d0.makeRotationFromEuler(Ht.backgroundRotation)).transpose(),Ft.isRenderTargetTexture===!1)E.material.uniforms.backgroundRotation.value.premultiply(cd);if(E.material.toneMapped=m.getTransfer(Ft.colorSpace)!==_i,N!==Ft||D!==Ft.version||L!==t.toneMapping)E.material.needsUpdate=!0,N=Ft,D=Ft.version,L=t.toneMapping;E.layers.enableAll(),Dt.unshift(E,E.geometry,E.material,0,0,null)}else if(Ft&&Ft.isTexture){if(S===void 0)S=new u(new Co(2,2),new re({name:"BackgroundMaterial",uniforms:xr(Rs.background.uniforms),vertexShader:Rs.background.vertexShader,fragmentShader:Rs.background.fragmentShader,side:ne,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),Object.defineProperty(S.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(S);if(S.material.uniforms.t2D.value=Ft,S.material.uniforms.backgroundIntensity.value=Ht.backgroundIntensity,S.material.toneMapped=m.getTransfer(Ft.colorSpace)!==_i,Ft.matrixAutoUpdate===!0)Ft.updateMatrix();if(S.material.uniforms.uvTransform.value.copy(Ft.matrix),N!==Ft||D!==Ft.version||L!==t.toneMapping)S.material.needsUpdate=!0,N=Ft,D=Ft.version,L=t.toneMapping;S.layers.enableAll(),Dt.unshift(S,S.geometry,S.material,0,0,null)}}function nt(Dt,Ht){Dt.getRGB(za,Yc(t)),i.buffers.color.setClear(za.r,za.g,za.b,Ht,c)}function yt(){if(E!==void 0)E.geometry.dispose(),E.material.dispose(),E=void 0;if(S!==void 0)S.geometry.dispose(),S.material.dispose(),S=void 0}return{getClearColor:function(){return d},setClearColor:function(Dt,Ht=1){d.set(Dt),p=Ht,nt(d,p)},getClearAlpha:function(){return p},setClearAlpha:function(Dt){p=Dt,nt(d,p)},render:vt,addToRenderList:zt,dispose:yt}}function m0(t,e){let i=t.getParameter(t.MAX_VERTEX_ATTRIBS),s={},a=L(null),c=a,d=!1;function p(Qt,me,Ee,jt,Ye){let on=!1,tn=D(Qt,jt,Ee,me);if(c!==tn)c=tn,E(c.object);if(on=tt(Qt,jt,Ee,Ye),on)vt(Qt,jt,Ee,Ye);if(Ye!==null)e.update(Ye,t.ELEMENT_ARRAY_BUFFER);if(on||d){if(d=!1,Ft(Qt,me,Ee,jt),Ye!==null)t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(Ye).buffer)}}function S(){return t.createVertexArray()}function E(Qt){return t.bindVertexArray(Qt)}function N(Qt){return t.deleteVertexArray(Qt)}function D(Qt,me,Ee,jt){let Ye=jt.wireframe===!0,on=s[me.id];if(on===void 0)on={},s[me.id]=on;let tn=Qt.isInstancedMesh===!0?Qt.id:0,yn=on[tn];if(yn===void 0)yn={},on[tn]=yn;let ln=yn[Ee.id];if(ln===void 0)ln={},yn[Ee.id]=ln;let dn=ln[Ye];if(dn===void 0)dn=L(S()),ln[Ye]=dn;return dn}function L(Qt){let me=[],Ee=[],jt=[];for(let Ye=0;Ye<i;Ye++)me[Ye]=0,Ee[Ye]=0,jt[Ye]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:me,enabledAttributes:Ee,attributeDivisors:jt,object:Qt,attributes:{},index:null}}function tt(Qt,me,Ee,jt){let Ye=c.attributes,on=me.attributes,tn=0,yn=Ee.getAttributes();for(let ln in yn)if(yn[ln].location>=0){let gn=Ye[ln],Nn=on[ln];if(Nn===void 0){if(ln==="instanceMatrix"&&Qt.instanceMatrix)Nn=Qt.instanceMatrix;if(ln==="instanceColor"&&Qt.instanceColor)Nn=Qt.instanceColor}if(gn===void 0)return!0;if(gn.attribute!==Nn)return!0;if(Nn&&gn.data!==Nn.data)return!0;tn++}if(c.attributesNum!==tn)return!0;if(c.index!==jt)return!0;return!1}function vt(Qt,me,Ee,jt){let Ye={},on=me.attributes,tn=0,yn=Ee.getAttributes();for(let ln in yn)if(yn[ln].location>=0){let gn=on[ln];if(gn===void 0){if(ln==="instanceMatrix"&&Qt.instanceMatrix)gn=Qt.instanceMatrix;if(ln==="instanceColor"&&Qt.instanceColor)gn=Qt.instanceColor}let Nn={};if(Nn.attribute=gn,gn&&gn.data)Nn.data=gn.data;Ye[ln]=Nn,tn++}c.attributes=Ye,c.attributesNum=tn,c.index=jt}function zt(){let Qt=c.newAttributes;for(let me=0,Ee=Qt.length;me<Ee;me++)Qt[me]=0}function nt(Qt){yt(Qt,0)}function yt(Qt,me){let Ee=c.newAttributes,jt=c.enabledAttributes,Ye=c.attributeDivisors;if(Ee[Qt]=1,jt[Qt]===0)t.enableVertexAttribArray(Qt),jt[Qt]=1;if(Ye[Qt]!==me)t.vertexAttribDivisor(Qt,me),Ye[Qt]=me}function Dt(){let Qt=c.newAttributes,me=c.enabledAttributes;for(let Ee=0,jt=me.length;Ee<jt;Ee++)if(me[Ee]!==Qt[Ee])t.disableVertexAttribArray(Ee),me[Ee]=0}function Ht(Qt,me,Ee,jt,Ye,on,tn){if(tn===!0)t.vertexAttribIPointer(Qt,me,Ee,Ye,on);else t.vertexAttribPointer(Qt,me,Ee,jt,Ye,on)}function Ft(Qt,me,Ee,jt){zt();let Ye=jt.attributes,on=Ee.getAttributes(),tn=me.defaultAttributeValues;for(let yn in on){let ln=on[yn];if(ln.location>=0){let dn=Ye[yn];if(dn===void 0){if(yn==="instanceMatrix"&&Qt.instanceMatrix)dn=Qt.instanceMatrix;if(yn==="instanceColor"&&Qt.instanceColor)dn=Qt.instanceColor}if(dn!==void 0){let gn=dn.normalized,Nn=dn.itemSize,fn=e.get(dn);if(fn===void 0)continue;let{buffer:_n,type:Ln,bytesPerElement:Hn}=fn,Wn=Ln===t.INT||Ln===t.UNSIGNED_INT||dn.gpuType===ec;if(dn.isInterleavedBufferAttribute){let Dn=dn.data,oi=Dn.isInterleavedBuffer===!0?Dn.stride:Dn.itemSize,jn=dn.offset;if(Dn.isInstancedInterleavedBuffer||Dn.isInstancedBufferAttribute){for(let Kn=0;Kn<ln.locationSize;Kn++)yt(ln.location+Kn,Dn.meshPerAttribute);if(Qt.isInstancedMesh!==!0&&jt._maxInstanceCount===void 0)jt._maxInstanceCount=Dn.meshPerAttribute*Dn.count}else for(let Kn=0;Kn<ln.locationSize;Kn++)nt(ln.location+Kn);t.bindBuffer(t.ARRAY_BUFFER,_n);for(let Kn=0;Kn<ln.locationSize;Kn++)Ht(ln.location+Kn,Nn/ln.locationSize,Ln,gn,oi*Hn,(jn+Nn/ln.locationSize*Kn)*Hn,Wn)}else{if(dn.isInstancedBufferAttribute){for(let Dn=0;Dn<ln.locationSize;Dn++)yt(ln.location+Dn,dn.meshPerAttribute);if(Qt.isInstancedMesh!==!0&&jt._maxInstanceCount===void 0)jt._maxInstanceCount=dn.meshPerAttribute*dn.count}else for(let Dn=0;Dn<ln.locationSize;Dn++)nt(ln.location+Dn);t.bindBuffer(t.ARRAY_BUFFER,_n);for(let Dn=0;Dn<ln.locationSize;Dn++)Ht(ln.location+Dn,Nn/ln.locationSize,Ln,gn,Nn*Hn,Nn/ln.locationSize*Dn*Hn,Wn)}}else if(tn!==void 0){let gn=tn[yn];if(gn!==void 0)switch(gn.length){case 2:t.vertexAttrib2fv(ln.location,gn);break;case 3:t.vertexAttrib3fv(ln.location,gn);break;case 4:t.vertexAttrib4fv(ln.location,gn);break;default:t.vertexAttrib1fv(ln.location,gn)}}}}Dt()}function Xt(){Kt();for(let Qt in s){let me=s[Qt];for(let Ee in me){let jt=me[Ee];for(let Ye in jt){let on=jt[Ye];for(let tn in on)N(on[tn].object),delete on[tn];delete jt[Ye]}}delete s[Qt]}}function Jt(Qt){if(s[Qt.id]===void 0)return;let me=s[Qt.id];for(let Ee in me){let jt=me[Ee];for(let Ye in jt){let on=jt[Ye];for(let tn in on)N(on[tn].object),delete on[tn];delete jt[Ye]}}delete s[Qt.id]}function gt(Qt){for(let me in s){let Ee=s[me];for(let jt in Ee){let Ye=Ee[jt];if(Ye[Qt.id]===void 0)continue;let on=Ye[Qt.id];for(let tn in on)N(on[tn].object),delete on[tn];delete Ye[Qt.id]}}}function Ot(Qt){for(let me in s){let Ee=s[me],jt=Qt.isInstancedMesh===!0?Qt.id:0,Ye=Ee[jt];if(Ye===void 0)continue;for(let on in Ye){let tn=Ye[on];for(let yn in tn)N(tn[yn].object),delete tn[yn];delete Ye[on]}if(delete Ee[jt],Object.keys(Ee).length===0)delete s[me]}}function Kt(){if(pe(),d=!0,c===a)return;c=a,E(c.object)}function pe(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:p,reset:Kt,resetDefaultState:pe,dispose:Xt,releaseStatesOfGeometry:Jt,releaseStatesOfObject:Ot,releaseStatesOfProgram:gt,initAttributes:zt,enableAttribute:nt,disableUnusedAttributes:Dt}}function g0(t,e,i){let s;function a(S){s=S}function c(S,E){t.drawArrays(s,S,E),i.update(E,s,1)}function d(S,E,N){if(N===0)return;t.drawArraysInstanced(s,S,E,N),i.update(E,s,N)}function p(S,E,N){if(N===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,S,0,E,0,N);let L=0;for(let tt=0;tt<N;tt++)L+=E[tt];i.update(L,s,1)}this.setMode=a,this.render=c,this.renderInstances=d,this.renderMultiDraw=p}function _0(t,e,i,s){let a;function c(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){let gt=e.get("EXT_texture_filter_anisotropic");a=t.getParameter(gt.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function d(gt){if(gt!==V&&s.convert(gt)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function p(gt){let Ot=gt===H&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));if(gt!==xs&&gt!==Gs&&!Ot&&s.convert(gt)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function S(gt){if(gt==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";gt="mediump"}if(gt==="mediump"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let E=i.precision!==void 0?i.precision:"highp",N=S(E);if(N!==E)Gn("WebGLRenderer:",E,"not supported, using",N,"instead."),E=N;let D=i.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),L=i.logarithmicDepthBuffer===!0&&D===!1;if(i.reversedDepthBuffer===!0&&D===!1)Gn("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(i.logarithmicDepthBuffer===!0&&D===!0)Gn("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let tt=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),vt=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),zt=t.getParameter(t.MAX_TEXTURE_SIZE),nt=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),yt=t.getParameter(t.MAX_VERTEX_ATTRIBS),Dt=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),Ht=t.getParameter(t.MAX_VARYING_VECTORS),Ft=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),Xt=t.getParameter(t.MAX_SAMPLES),Jt=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:S,textureFormatReadable:d,textureTypeReadable:p,precision:E,logarithmicDepthBuffer:L,reversedDepthBuffer:D,maxTextures:tt,maxVertexTextures:vt,maxTextureSize:zt,maxCubemapSize:nt,maxAttributes:yt,maxVertexUniforms:Dt,maxVaryings:Ht,maxFragmentUniforms:Ft,maxSamples:Xt,samples:Jt}}function x0(t){let e=this,i=null,s=0,a=!1,c=!1,d=new R,p=new Zn,S={value:null,needsUpdate:!1};this.uniform=S,this.numPlanes=0,this.numIntersection=0,this.init=function(D,L){let tt=D.length!==0||L||s!==0||a;return a=L,s=D.length,tt},this.beginShadows=function(){c=!0,N(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(D,L){i=N(D,L,0)},this.setState=function(D,L,tt){let{clippingPlanes:vt,clipIntersection:zt,clipShadows:nt}=D,yt=t.get(D);if(!a||vt===null||vt.length===0||c&&!nt)if(c)N(null);else E();else{let Dt=c?0:s,Ht=Dt*4,Ft=yt.clippingState||null;S.value=Ft,Ft=N(vt,L,Ht,tt);for(let Xt=0;Xt!==Ht;++Xt)Ft[Xt]=i[Xt];yt.clippingState=Ft,this.numIntersection=zt?this.numPlanes:0,this.numPlanes+=Dt}};function E(){if(S.value!==i)S.value=i,S.needsUpdate=s>0;e.numPlanes=s,e.numIntersection=0}function N(D,L,tt,vt){let zt=D!==null?D.length:0,nt=null;if(zt!==0){if(nt=S.value,vt!==!0||nt===null){let yt=tt+zt*4,Dt=L.matrixWorldInverse;if(p.getNormalMatrix(Dt),nt===null||nt.length<yt)nt=new Float32Array(yt);for(let Ht=0,Ft=tt;Ht!==zt;++Ht,Ft+=4)d.copy(D[Ht]).applyMatrix4(Dt,p),d.normal.toArray(nt,Ft),nt[Ft+3]=d.constant}S.value=nt,S.needsUpdate=!0}return e.numPlanes=zt,e.numIntersection=0,nt}}class ka extends z{constructor(t=1,e={}){super(t,t,e);this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Na(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Pe(5,5,5),a=new re({name:"CubemapFromEquirect",uniforms:xr(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:C,blending:mr});a.uniforms.tEquirect.value=e;let c=new u(s,a),d=e.minFilter;if(e.minFilter===F)e.minFilter=A;return new Io(1,10,this).update(t,c),e.minFilter=d,c.geometry.dispose(),c.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let a=t.getRenderTarget();for(let c=0;c<6;c++)t.setRenderTarget(this,c),t.clear(e,i,s);t.setRenderTarget(a)}}var kf=256,y0=3,v0=20,hd=256,ud=16,S0=3,M0=new n,b0=new l;class et{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Io(1,10,null),this._boxMesh=new u(new Pe(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,i=0.1,s=100,a={}){let{size:c=256,position:d=M0}=a,p=this._renderer;this._setSize(c);let S=this._allocateTarget(),E=this._getSourceTarget(!0);if(e>0)E.texture.mipmapsAutoUpdate=!1;let{autoClear:N,autoClearColor:D,autoClearDepth:L,autoClearStencil:tt}=p,vt=t.background;if(p.autoClear=!0,p.autoClearColor=!0,p.autoClearDepth=!0,p.autoClearStencil=!0,vt===null)t.background=p.getClearColor(b0);let zt=new Io(i,s,E);if(zt.position.copy(d),zt.update(p,t),p.autoClear=N,p.autoClearColor=D,p.autoClearDepth=L,p.autoClearStencil=tt,t.background=vt,e>0)E.texture.mipmapsAutoUpdate=!0,this._blur(S,e);return this._applyPMREM(S),S}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Wf(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Vf(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(kf,kc(t))}_fromTexture(t,e){if(t.mapping===bo||t.mapping===Vr)this._setSize(t.image.length===0?kf:t.image[0].width||t.image[0].image.width);else this._setSize(t.image.width/4);let i=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(i),i}_allocateTarget(){let t=this._cubeSize,e=Hf(t,!1,!1),i=Math.log2(t)-y0;for(let s=0;s<=i;s++)e.texture.mipmaps.push({width:t>>s,height:t>>s});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,i=this._sourceTarget;if(i===null||i.width!==e||t&&i.depthBuffer===!1){if(i!==null)i.dispose();this._sourceTarget=Hf(e,!0,t)}return this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,i){let s=this._boxMesh,a=this._cubeCamera;s.material=i,a.renderTarget=t,a.activeMipmapLevel=e;let c=t.width>>e;t.viewport.set(0,0,c,c),a.update(this._renderer,s),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;if(t.mapping===bo||t.mapping===Vr){if(this._cubemapMaterial===null)this._cubemapMaterial=Wf();e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Vf();e=this._equirectMaterial}e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){if(this._ggxMaterial===null)this._ggxMaterial=T0(),this._integrationMaterial=A0();let e=this._cubeSize,i=t.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(e/ud);for(let c=0;c<=i;c++){let d=et.lodToRoughness(c,i);if(c>i-S0)a.roughness.value=d,this._renderCube(t,c,this._integrationMaterial);else{let p=d>0?Math.log2(e)+0.5*Math.log2(6/(hd*Math.pow(d,4)))+0.5:0;s.roughness.value=d,s.lodBias.value=p,this._renderCube(t,c,this._ggxMaterial)}}}_blur(t,e){if(this._blurMaterial===null)this._blurMaterial=E0();let i=this._blurMaterial,s=i.uniforms,a=this._sourceTarget;s.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,s.envMap.value=a.texture,this._renderCube(t,0,i),s.envMap.value=t.texture,this._renderCube(a,0,i)}}function Hf(t,e,i){return new ka(t,{minFilter:F,generateMipmaps:e,type:H,colorSpace:k,depthBuffer:i})}function Do(t,e,i){return new re({name:t,uniforms:e,vertexShader:f.cube_vert,fragmentShader:i,side:C,blending:mr,depthTest:!1,depthWrite:!1})}function T0(){return Do("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${hd}u

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
	`)}function A0(){return Do("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:ud}},`

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
	`)}function E0(){return Do("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${v0}
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
	`)}function Vf(){return Do("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Wf(){return Do("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function w0(t){let e=new WeakMap,i=new WeakMap,s=null;function a(L,tt=!1){if(L===null||L===void 0)return null;if(tt)return d(L);return c(L)}function c(L){if(L&&L.isTexture){let tt=L.mapping;if(tt===ba||tt===Ta)if(e.has(L)){let vt=e.get(L).texture;return p(vt,L.mapping)}else{let vt=L.image;if(vt&&vt.height>0){let zt=new ka(vt.height);return zt.fromEquirectangularTexture(t,L),e.set(L,zt),L.addEventListener("dispose",E),p(zt.texture,L.mapping)}else return null}}return L}function d(L){if(L&&L.isTexture&&L.isPMREMTexture!==!0){let tt=L.mapping,vt=tt===ba||tt===Ta,zt=tt===bo||tt===Vr;if(vt||zt){let nt=i.get(L),yt=nt!==void 0?nt.texture.pmremVersion:0;if(L.isRenderTargetTexture&&L.pmremVersion!==yt){if(s===null)s=new et(t);return nt=vt?s.fromEquirectangular(L,nt):s.fromCubemap(L,nt),nt.texture.pmremVersion=L.pmremVersion,i.set(L,nt),nt.texture}else if(nt!==void 0)return nt.texture;else{let Dt=L.image;if(vt&&Dt&&Dt.height>0||zt&&Dt&&S(Dt)){if(s===null)s=new et(t);return nt=vt?s.fromEquirectangular(L):s.fromCubemap(L),nt.texture.pmremVersion=L.pmremVersion,i.set(L,nt),L.addEventListener("dispose",N),nt.texture}else return null}}}return L}function p(L,tt){if(tt===ba)L.mapping=bo;else if(tt===Ta)L.mapping=Vr;return L}function S(L){let tt=0,vt=6;for(let zt=0;zt<vt;zt++)if(L[zt]!==void 0)tt++;return tt===vt}function E(L){let tt=L.target;tt.removeEventListener("dispose",E);let vt=e.get(tt);if(vt!==void 0)e.delete(tt),vt.dispose()}function N(L){let tt=L.target;tt.removeEventListener("dispose",N);let vt=i.get(tt);if(vt!==void 0)i.delete(tt),vt.dispose()}function D(){if(e=new WeakMap,i=new WeakMap,s!==null)s.dispose(),s=null}return{get:a,dispose:D}}function R0(t){let e={};function i(s){if(e[s]!==void 0)return e[s];let a=t.getExtension(s);return e[s]=a,a}return{has:function(s){return i(s)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(s){let a=i(s);if(a===null)fr("WebGLRenderer: "+s+" extension not supported.");return a}}}function C0(t,e,i,s){let a={},c=new WeakMap,d=new FinalizationRegistry((vt)=>delete a[vt]);function p(vt){S(vt.target)}function S(vt){if(vt.index!==null)e.remove(vt.index);for(let nt in vt.attributes)e.remove(vt.attributes[nt]);vt.removeEventListener("dispose",p),delete a[vt.id],d.unregister(vt);let zt=c.get(vt);if(zt)e.remove(zt),c.delete(vt);if(s.releaseStatesOfGeometry(vt),vt.isInstancedBufferGeometry===!0)delete vt._maxInstanceCount;i.memory.geometries--}function E(vt,zt){if(a[zt.id]!==void 0)return zt;return zt.addEventListener("dispose",p),a[zt.id]=new WeakRef(zt),d.register(zt,zt.id,zt),i.memory.geometries++,zt}function N(vt){let zt=vt.attributes;for(let nt in zt)e.update(zt[nt],t.ARRAY_BUFFER)}function D(vt){let zt=vt.index,nt=vt.attributes.position,yt=0;if(nt===void 0)return;let Dt=zt!==null?zt.array.length:nt.array.length/3-1,Ft=new(nt.count>=65535?Pa:Ia)(Math.ceil(Dt/3)*6,1),Xt=Ft.array;if(zt!==null){let gt=zt.array;yt=zt.version;for(let Ot=0,Kt=0;Ot<Dt;Ot+=3){let pe=gt[Ot+0],Qt=gt[Ot+1],me=gt[Ot+2];Xt[Kt++]=pe,Xt[Kt++]=Qt,Xt[Kt++]=Qt,Xt[Kt++]=me,Xt[Kt++]=me,Xt[Kt++]=pe}}else{yt=nt.version;for(let gt=0,Ot=0;gt<Dt;gt+=3){let Kt=gt+0,pe=gt+1,Qt=gt+2;Xt[Ot++]=Kt,Xt[Ot++]=pe,Xt[Ot++]=pe,Xt[Ot++]=Qt,Xt[Ot++]=Qt,Xt[Ot++]=Kt}}Ft.version=yt;let Jt=c.get(vt);if(Jt)e.remove(Jt);c.set(vt,Ft)}function L(vt){let zt=c.get(vt);if(zt){let nt=vt.index;if(nt!==null){if(zt.version<nt.version)D(vt)}}else D(vt);return c.get(vt)}function tt(){for(let vt in a){let zt=a[vt].deref();if(zt!==void 0)S(zt)}}return{get:E,update:N,getWireframeAttribute:L,dispose:tt}}function I0(t,e,i){let s;function a(D){s=D}let c,d;function p(D){c=D.type,d=D.bytesPerElement}function S(D,L){t.drawElements(s,L,c,D*d),i.update(L,s,1)}function E(D,L,tt){if(tt===0)return;t.drawElementsInstanced(s,L,c,D*d,tt),i.update(L,s,tt)}function N(D,L,tt){if(tt===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,L,0,c,D,0,tt);let zt=0;for(let nt=0;nt<tt;nt++)zt+=L[nt];i.update(zt,s,1)}this.setMode=a,this.setIndex=p,this.render=S,this.renderInstances=E,this.renderMultiDraw=N}function P0(t){let e={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function s(c,d,p){switch(i.calls++,d){case t.TRIANGLES:i.triangles+=p*(c/3);break;case t.LINES:i.lines+=p*(c/2);break;case t.LINE_STRIP:i.lines+=p*(c-1);break;case t.LINE_LOOP:i.lines+=p*c;break;case t.POINTS:i.points+=p*c;break;default:qn("WebGLInfo: Unknown draw mode:",d);break}}function a(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:e,render:i,programs:null,autoReset:!0,reset:a,update:s}}function L0(t,e,i){let s=new WeakMap,a=new y;function c(d,p,S){let E=d.morphTargetInfluences,N=p.morphAttributes.position||p.morphAttributes.normal||p.morphAttributes.color,D=N!==void 0?N.length:0,L=s.get(p);if(L===void 0||L.count!==D){let Kt=function(){gt.dispose(),s.delete(p),p.removeEventListener("dispose",Kt)};if(L!==void 0)L.texture.dispose();let tt=p.morphAttributes.position!==void 0,vt=p.morphAttributes.normal!==void 0,zt=p.morphAttributes.color!==void 0,nt=p.morphAttributes.position||[],yt=p.morphAttributes.normal||[],Dt=p.morphAttributes.color||[],Ht=0;if(tt===!0)Ht=1;if(vt===!0)Ht=2;if(zt===!0)Ht=3;let Ft=p.attributes.position.count*Ht,Xt=1;if(Ft>e.maxTextureSize)Xt=Math.ceil(Ft/e.maxTextureSize),Ft=e.maxTextureSize;let Jt=new Float32Array(Ft*Xt*4*D),gt=new Ca(Jt,Ft,Xt,D);gt.type=Gs,gt.needsUpdate=!0;let Ot=Ht*4;for(let pe=0;pe<D;pe++){let Qt=nt[pe],me=yt[pe],Ee=Dt[pe],jt=Ft*Xt*4*pe;for(let Ye=0;Ye<Qt.count;Ye++){let on=Ye*Ot;if(tt===!0)a.fromBufferAttribute(Qt,Ye),Jt[jt+on+0]=a.x,Jt[jt+on+1]=a.y,Jt[jt+on+2]=a.z,Jt[jt+on+3]=0;if(vt===!0)a.fromBufferAttribute(me,Ye),Jt[jt+on+4]=a.x,Jt[jt+on+5]=a.y,Jt[jt+on+6]=a.z,Jt[jt+on+7]=0;if(zt===!0)a.fromBufferAttribute(Ee,Ye),Jt[jt+on+8]=a.x,Jt[jt+on+9]=a.y,Jt[jt+on+10]=a.z,Jt[jt+on+11]=Ee.itemSize===4?a.w:1}}L={count:D,texture:gt,size:new o(Ft,Xt)},s.set(p,L),p.addEventListener("dispose",Kt)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)S.getUniforms().setValue(t,"morphTexture",d.morphTexture,i);else{let tt=0;for(let zt=0;zt<E.length;zt++)tt+=E[zt];let vt=p.morphTargetsRelative?1:1-tt;S.getUniforms().setValue(t,"morphTargetBaseInfluence",vt),S.getUniforms().setValue(t,"morphTargetInfluences",E)}S.getUniforms().setValue(t,"morphTargetsTexture",L.texture,i),S.getUniforms().setValue(t,"morphTargetsTextureSize",L.size)}return{update:c}}function N0(t,e,i,s,a){let c=new WeakMap;function d(E){let N=a.render.frame,D=E.geometry,L=e.get(E,D);if(c.get(L)!==N)e.update(L),c.set(L,N);if(E.isInstancedMesh){if(E.hasEventListener("dispose",S)===!1)E.addEventListener("dispose",S);if(c.get(E)!==N){if(i.update(E.instanceMatrix,t.ARRAY_BUFFER),E.instanceColor!==null)i.update(E.instanceColor,t.ARRAY_BUFFER);c.set(E,N)}}if(E.isSkinnedMesh){let tt=E.skeleton;if(c.get(tt)!==N)tt.update(),c.set(tt,N)}return L}function p(){c=new WeakMap}function S(E){let N=E.target;if(N.removeEventListener("dispose",S),s.releaseStatesOfObject(N),i.remove(N.instanceMatrix),N.instanceColor!==null)i.remove(N.instanceColor)}return{update:d,dispose:p}}var D0={[Jl]:"LINEAR_TONE_MAPPING",[$l]:"REINHARD_TONE_MAPPING",[Kl]:"CINEON_TONE_MAPPING",[st]:"ACES_FILMIC_TONE_MAPPING",[jl]:"AGX_TONE_MAPPING",[tc]:"NEUTRAL_TONE_MAPPING",[Ql]:"CUSTOM_TONE_MAPPING"};function U0(t,e,i,s,a,c){let d=new z(e,i,{type:t,depthBuffer:a,stencilBuffer:c,samples:s?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),p=null,S=null,E=null,N=new g;N.setAttribute("position",new x([-1,3,0,-1,-1,0,3,-1,0],3)),N.setAttribute("uv",new x([0,2,0,0,2,0],2));let D=new Zc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),L=new u(N,D),tt=new Te(-1,1,1,-1,0,1),vt=null,zt=null,nt=!1,yt,Dt=null,Ht=[],Ft=!1;this.setSize=function(Xt,Jt){if(d.setSize(Xt,Jt),p!==null)p.setSize(Xt,Jt);if(S!==null)S.setSize(Xt,Jt);for(let gt=0;gt<Ht.length;gt++){let Ot=Ht[gt];if(Ot.setSize)Ot.setSize(Xt,Jt)}},this.setEffects=function(Xt){Ht=Xt,Ft=Ht.length>0&&Ht[0].isRenderPass===!0;let{width:Jt,height:gt}=d;if(Ht.length>0&&p===null)p=new z(Jt,gt,{type:H,depthBuffer:!1,stencilBuffer:!1}),S=new z(Jt,gt,{type:H,depthBuffer:!1,stencilBuffer:!1});let Ot=a===!0&&Ht.some((Kt)=>Kt.needsDepthTexture===!0);if(Ot!==(d.depthTexture!==null)){if(Ot===!0&&E===null){if(E=new Ks(Jt,gt),c===!0)E.format=$s,E.type=gr}d.dispose(),d.depthTexture=Ot?E:null,d.resolveDepthBuffer=Ot,d.storeMultisampledDepthBuffer=Ot}for(let Kt=0;Kt<Ht.length;Kt++){let pe=Ht[Kt];if(pe.setSize)pe.setSize(Jt,gt);if(Ot&&pe.needsDepthTexture===!0&&pe.setDepthTexture)pe.setDepthTexture(E)}},this.begin=function(Xt,Jt){if(nt)return!1;if(Xt.toneMapping===Ts&&Ht.length===0)return!1;if(Dt=Jt,Jt!==null){let{width:gt,height:Ot}=Jt;if(d.width!==gt||d.height!==Ot)this.setSize(gt,Ot)}if(Ft===!1)Xt.setRenderTarget(d);return yt=Xt.toneMapping,Xt.toneMapping=Ts,!0},this.hasRenderPass=function(){return Ft},this.end=function(Xt,Jt){Xt.toneMapping=yt,nt=!0;let gt=d,Ot=p;for(let Kt=0;Kt<Ht.length;Kt++){let pe=Ht[Kt];if(pe.enabled===!1)continue;if(pe.render(Xt,Ot,gt,Jt),pe.needsSwap!==!1)gt=Ot,Ot=Ot===p?S:p}if(vt!==Xt.outputColorSpace||zt!==Xt.toneMapping){if(vt=Xt.outputColorSpace,zt=Xt.toneMapping,D.defines={},m.getTransfer(vt)===_i)D.defines.SRGB_TRANSFER="";let Kt=D0[zt];if(Kt)D.defines[Kt]="";D.needsUpdate=!0}D.uniforms.tDiffuse.value=gt.texture,Xt.setRenderTarget(Dt),Xt.render(L,tt),Dt=null,nt=!1},this.isCompositing=function(){return nt},this.dispose=function(){if(d.dispose(),p!==null)p.dispose();if(S!==null)S.dispose();N.dispose(),D.dispose()}}var fd=new v,dd=new Ks(1,1),pd=new Da(1),md=new Ca,gd=new qc,_d=new Na,Xf=[],qf=[],Yf=new Float32Array(16),Zf=new Float32Array(9),Jf=new Float32Array(4);function Xr(t,e,i){let s=t[0];if(s<=0||s>0)return t;let a=e*i,c=Xf[a];if(c===void 0)c=new Float32Array(a),Xf[a]=c;if(e!==0){s.toArray(c,0);for(let d=1,p=0;d!==e;++d)p+=i,t[d].toArray(c,p)}return c}function Pi(t,e){if(t.length!==e.length)return!1;for(let i=0,s=t.length;i<s;i++)if(t[i]!==e[i])return!1;return!0}function Li(t,e){for(let i=0,s=e.length;i<s;i++)t[i]=e[i]}function Ha(t,e){let i=qf[e];if(i===void 0)i=new Int32Array(e),qf[e]=i;for(let s=0;s!==e;++s)i[s]=t.allocateTextureUnit();return i}function F0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1f(this.addr,e),i[0]=e}function O0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2f(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Pi(i,e))return;t.uniform2fv(this.addr,e),Li(i,e)}}function B0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3f(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else if(e.r!==void 0){if(i[0]!==e.r||i[1]!==e.g||i[2]!==e.b)t.uniform3f(this.addr,e.r,e.g,e.b),i[0]=e.r,i[1]=e.g,i[2]=e.b}else{if(Pi(i,e))return;t.uniform3fv(this.addr,e),Li(i,e)}}function z0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4f(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Pi(i,e))return;t.uniform4fv(this.addr,e),Li(i,e)}}function G0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Pi(i,e))return;t.uniformMatrix2fv(this.addr,!1,e),Li(i,e)}else{if(Pi(i,s))return;Jf.set(s),t.uniformMatrix2fv(this.addr,!1,Jf),Li(i,s)}}function k0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Pi(i,e))return;t.uniformMatrix3fv(this.addr,!1,e),Li(i,e)}else{if(Pi(i,s))return;Zf.set(s),t.uniformMatrix3fv(this.addr,!1,Zf),Li(i,s)}}function H0(t,e){let i=this.cache,s=e.elements;if(s===void 0){if(Pi(i,e))return;t.uniformMatrix4fv(this.addr,!1,e),Li(i,e)}else{if(Pi(i,s))return;Yf.set(s),t.uniformMatrix4fv(this.addr,!1,Yf),Li(i,s)}}function V0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1i(this.addr,e),i[0]=e}function W0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2i(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Pi(i,e))return;t.uniform2iv(this.addr,e),Li(i,e)}}function X0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3i(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else{if(Pi(i,e))return;t.uniform3iv(this.addr,e),Li(i,e)}}function q0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4i(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Pi(i,e))return;t.uniform4iv(this.addr,e),Li(i,e)}}function Y0(t,e){let i=this.cache;if(i[0]===e)return;t.uniform1ui(this.addr,e),i[0]=e}function Z0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y)t.uniform2ui(this.addr,e.x,e.y),i[0]=e.x,i[1]=e.y}else{if(Pi(i,e))return;t.uniform2uiv(this.addr,e),Li(i,e)}}function J0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z)t.uniform3ui(this.addr,e.x,e.y,e.z),i[0]=e.x,i[1]=e.y,i[2]=e.z}else{if(Pi(i,e))return;t.uniform3uiv(this.addr,e),Li(i,e)}}function $0(t,e){let i=this.cache;if(e.x!==void 0){if(i[0]!==e.x||i[1]!==e.y||i[2]!==e.z||i[3]!==e.w)t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),i[0]=e.x,i[1]=e.y,i[2]=e.z,i[3]=e.w}else{if(Pi(i,e))return;t.uniform4uiv(this.addr,e),Li(i,e)}}function Va(t){if(t.version===0)t.compareFunction=Oc,t.needsUpdate=!0;return t}function K0(t,e,i){let s=this.cache,a=i.allocateTextureUnit();if(s[0]!==a)t.uniform1i(this.addr,a),s[0]=a;let c;if(this.type===t.SAMPLER_2D_SHADOW)c=Va(dd);else c=fd;i.setTexture2D(e||c,a)}function Q0(t,e,i){let s=this.cache,a=i.allocateTextureUnit();if(s[0]!==a)t.uniform1i(this.addr,a),s[0]=a;i.setTexture3D(e||gd,a)}function j0(t,e,i){let s=this.cache,a=i.allocateTextureUnit();if(s[0]!==a)t.uniform1i(this.addr,a),s[0]=a;let c;if(this.type===t.SAMPLER_CUBE_SHADOW)c=Va(pd);else c=_d;i.setTextureCube(e||c,a)}function tx(t,e,i){let s=this.cache,a=i.allocateTextureUnit();if(s[0]!==a)t.uniform1i(this.addr,a),s[0]=a;i.setTexture2DArray(e||md,a)}function ex(t){switch(t){case 5126:return F0;case 35664:return O0;case 35665:return B0;case 35666:return z0;case 35674:return G0;case 35675:return k0;case 35676:return H0;case 5124:case 35670:return V0;case 35667:case 35671:return W0;case 35668:case 35672:return X0;case 35669:case 35673:return q0;case 5125:return Y0;case 36294:return Z0;case 36295:return J0;case 36296:return $0;case 35678:case 36198:case 36298:case 36306:case 35682:return K0;case 35679:case 36299:case 36307:return Q0;case 35680:case 36300:case 36308:case 36293:return j0;case 36289:case 36303:case 36311:case 36292:return tx}}function nx(t,e){t.uniform1fv(this.addr,e)}function ix(t,e){let i=Xr(e,this.size,2);t.uniform2fv(this.addr,i)}function sx(t,e){let i=Xr(e,this.size,3);t.uniform3fv(this.addr,i)}function rx(t,e){let i=Xr(e,this.size,4);t.uniform4fv(this.addr,i)}function ox(t,e){let i=Xr(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,i)}function ax(t,e){let i=Xr(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,i)}function lx(t,e){let i=Xr(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,i)}function cx(t,e){t.uniform1iv(this.addr,e)}function hx(t,e){t.uniform2iv(this.addr,e)}function ux(t,e){t.uniform3iv(this.addr,e)}function fx(t,e){t.uniform4iv(this.addr,e)}function dx(t,e){t.uniform1uiv(this.addr,e)}function px(t,e){t.uniform2uiv(this.addr,e)}function mx(t,e){t.uniform3uiv(this.addr,e)}function gx(t,e){t.uniform4uiv(this.addr,e)}function _x(t,e,i){let s=this.cache,a=e.length,c=Ha(i,a);if(!Pi(s,c))t.uniform1iv(this.addr,c),Li(s,c);let d;if(this.type===t.SAMPLER_2D_SHADOW)d=Va(dd);else d=fd;for(let p=0;p!==a;++p)i.setTexture2D(e[p]||d,c[p])}function xx(t,e,i){let s=this.cache,a=e.length,c=Ha(i,a);if(!Pi(s,c))t.uniform1iv(this.addr,c),Li(s,c);for(let d=0;d!==a;++d)i.setTexture3D(e[d]||gd,c[d])}function yx(t,e,i){let s=this.cache,a=e.length,c=Ha(i,a);if(!Pi(s,c))t.uniform1iv(this.addr,c),Li(s,c);let d;if(this.type===t.SAMPLER_CUBE_SHADOW)d=Va(pd);else d=_d;for(let p=0;p!==a;++p)i.setTextureCube(e[p]||d,c[p])}function vx(t,e,i){let s=this.cache,a=e.length,c=Ha(i,a);if(!Pi(s,c))t.uniform1iv(this.addr,c),Li(s,c);for(let d=0;d!==a;++d)i.setTexture2DArray(e[d]||md,c[d])}function Sx(t){switch(t){case 5126:return nx;case 35664:return ix;case 35665:return sx;case 35666:return rx;case 35674:return ox;case 35675:return ax;case 35676:return lx;case 5124:case 35670:return cx;case 35667:case 35671:return hx;case 35668:case 35672:return ux;case 35669:case 35673:return fx;case 5125:return dx;case 36294:return px;case 36295:return mx;case 36296:return gx;case 35678:case 36198:case 36298:case 36306:case 35682:return _x;case 35679:case 36299:case 36307:return xx;case 35680:case 36300:case 36308:case 36293:return yx;case 36289:case 36303:case 36311:case 36292:return vx}}class xd{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=ex(e.type)}}class yd{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Sx(e.type)}}class vd{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let a=0,c=s.length;a!==c;++a){let d=s[a];d.setValue(t,e[d.id],i)}}}var lh=/(\w+)(\])?(\[|\.)?/g;function $f(t,e){t.seq.push(e),t.map[e.id]=e}function Mx(t,e,i){let s=t.name,a=s.length;lh.lastIndex=0;while(!0){let c=lh.exec(s),d=lh.lastIndex,p=c[1],S=c[2]==="]",E=c[3];if(S)p=p|0;if(E===void 0||E==="["&&d+2===a){$f(i,E===void 0?new xd(p,t,e):new yd(p,t,e));break}else{let D=i.map[p];if(D===void 0)D=new vd(p),$f(i,D);i=D}}}class No{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let c=0;c<i;++c){let d=t.getActiveUniform(e,c),p=t.getUniformLocation(e,d.name);Mx(d,p,this)}let s=[],a=[];for(let c of this.seq)if(c.type===t.SAMPLER_2D_SHADOW||c.type===t.SAMPLER_CUBE_SHADOW||c.type===t.SAMPLER_2D_ARRAY_SHADOW)s.push(c);else a.push(c);if(s.length>0)this.seq=s.concat(a)}setValue(t,e,i,s){let a=this.map[e];if(a!==void 0)a.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];if(s!==void 0)this.setValue(t,i,s)}static upload(t,e,i,s){for(let a=0,c=e.length;a!==c;++a){let d=e[a],p=i[d.id];if(p.needsUpdate!==!1)d.setValue(t,p.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,a=t.length;s!==a;++s){let c=t[s];if(c.id in e)i.push(c)}return i}}function Kf(t,e,i){let s=t.createShader(e);return t.shaderSource(s,i),t.compileShader(s),s}var bx=37297,Tx=0;function Ax(t,e){let i=t.split(`
`),s=[],a=Math.max(e-6,0),c=Math.min(e+6,i.length);for(let d=a;d<c;d++){let p=d+1;s.push(`${p===e?">":" "} ${p}: ${i[d]}`)}return s.join(`
`)}var Qf=new Zn;function Ex(t){m._getMatrix(Qf,m.workingColorSpace,t);let e=`mat3( ${Qf.elements.map((i)=>i.toFixed(4))} )`;switch(m.getTransfer(t)){case Dc:return[e,"LinearTransferOETF"];case _i:return[e,"sRGBTransferOETF"];default:return Gn("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function jf(t,e,i){let s=t.getShaderParameter(e,t.COMPILE_STATUS),c=(t.getShaderInfoLog(e)||"").trim();if(s&&c==="")return"";let d=/ERROR: 0:(\d+)/.exec(c);if(d){let p=parseInt(d[1]);return i.toUpperCase()+`

`+c+`

`+Ax(t.getShaderSource(e),p)}else return c}function wx(t,e){let i=Ex(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${i[1]}( vec4( ${i[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Rx={[Jl]:"Linear",[$l]:"Reinhard",[Kl]:"Cineon",[st]:"ACESFilmic",[jl]:"AgX",[tc]:"Neutral",[Ql]:"Custom"};function Cx(t,e){let i=Rx[e];if(i===void 0)return Gn("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+t+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}var Ga=new n;function Ix(){m.getLuminanceCoefficients(Ga);let t=Ga.x.toFixed(4),e=Ga.y.toFixed(4),i=Ga.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${i} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Px(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Lo).join(`
`)}function Lx(t){let e=[];for(let i in t){let s=t[i];if(s===!1)continue;e.push("#define "+i+" "+s)}return e.join(`
`)}function Nx(t,e){let i={},s=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let a=0;a<s;a++){let c=t.getActiveAttrib(e,a),d=c.name,p=1;if(c.type===t.FLOAT_MAT2)p=2;if(c.type===t.FLOAT_MAT3)p=3;if(c.type===t.FLOAT_MAT4)p=4;i[d]={type:c.type,location:t.getAttribLocation(e,d),locationSize:p}}return i}function Lo(t){return t!==""}function td(t,e){let i=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function ed(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Dx=/^[ \t]*#include +<([\w\d./]+)>/gm;function hh(t){return t.replace(Dx,Ux)}function Ux(t,e){let i=f[e];if(i===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return hh(i)}var Fx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function nd(t){return t.replace(Fx,Ox)}function Ox(t,e,i,s){let a="";for(let c=parseInt(e);c<parseInt(i);c++)a+=s.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return a}function id(t){let e=`precision ${t.precision} float;
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
#define LOW_PRECISION`;return e}var Bx={[So]:"SHADOWMAP_TYPE_PCF",[Hr]:"SHADOWMAP_TYPE_VSM"};function zx(t){return Bx[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Gx={[Vr]:"ENVMAP_MODE_REFRACTION"};function kx(t){if(t.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Gx[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Hx={[uf]:"ENVMAP_BLENDING_MULTIPLY",[ff]:"ENVMAP_BLENDING_MIX",[df]:"ENVMAP_BLENDING_ADD"};function Vx(t){if(t.envMap===!1)return"ENVMAP_BLENDING_NONE";return Hx[t.combine]||"ENVMAP_BLENDING_NONE"}function Wx(t,e,i,s){let a=t.getContext(),{defines:c,vertexShader:d,fragmentShader:p}=i,S=zx(i),E=i.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",N=kx(i),D=Vx(i),L=Px(i),tt=Lx(c),vt=a.createProgram(),zt,nt,yt=i.glslVersion?"#version "+i.glslVersion+`
`:"";if(i.isRawShaderMaterial){if(zt=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,tt].filter(Lo).join(`
`),zt.length>0)zt+=`
`;if(nt=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,tt].filter(Lo).join(`
`),nt.length>0)nt+=`
`}else zt=[id(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,tt,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+N:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+i.diffuseRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexNormals?"#define HAS_NORMAL":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+S:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(Lo).join(`
`),nt=[id(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,tt,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+E:"",i.envMap?"#define "+N:"",i.envMap?"#define "+D:"",i.envMapPMREM?"#define ENVMAP_MAX_LOD "+i.envMapMaxLod+".0":"",i.envMapPMREM?"#define ENVMAP_SIZE "+i.envMapSize+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",i.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.retroreflection?"#define USE_RETROREFLECTION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor?"#define USE_COLOR":"",i.vertexAlphas||i.batchingColor?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+S:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==Ts?"#define TONE_MAPPING":"",i.toneMapping!==Ts?f.tonemapping_pars_fragment:"",i.toneMapping!==Ts?Cx("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",f.colorspace_pars_fragment,wx("linearToOutputTexel",i.outputColorSpace),Ix(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(Lo).join(`
`);if(d=hh(d),d=td(d,i),d=ed(d,i),p=hh(p),p=td(p,i),p=ed(p,i),d=nd(d),p=nd(p),i.isRawShaderMaterial!==!0)yt=`#version 300 es
`,zt=[L,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+zt,nt=["#define varying in",i.glslVersion===Bc?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===Bc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+nt;let Dt=yt+zt+d,Ht=yt+nt+p,Ft=Kf(a,a.VERTEX_SHADER,Dt),Xt=Kf(a,a.FRAGMENT_SHADER,Ht);if(a.attachShader(vt,Ft),a.attachShader(vt,Xt),i.index0AttributeName!==void 0)a.bindAttribLocation(vt,0,i.index0AttributeName);else if(i.hasPositionAttribute===!0)a.bindAttribLocation(vt,0,"position");a.linkProgram(vt);function Jt(pe){if(t.debug.checkShaderErrors){let Qt=a.getProgramInfoLog(vt)||"",me=a.getShaderInfoLog(Ft)||"",Ee=a.getShaderInfoLog(Xt)||"",jt=Qt.trim(),Ye=me.trim(),on=Ee.trim(),tn=!0,yn=!0;if(a.getProgramParameter(vt,a.LINK_STATUS)===!1)if(tn=!1,typeof t.debug.onShaderError==="function")t.debug.onShaderError(a,vt,Ft,Xt);else{let ln=jf(a,Ft,"vertex"),dn=jf(a,Xt,"fragment");qn("WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(vt,a.VALIDATE_STATUS)+`

Material Name: `+pe.name+`
Material Type: `+pe.type+`

Program Info Log: `+jt+`
`+ln+`
`+dn)}else if(jt!=="")Gn("WebGLProgram: Program Info Log:",jt);else if(Ye===""||on==="")yn=!1;if(yn)pe.diagnostics={runnable:tn,programLog:jt,vertexShader:{log:Ye,prefix:zt},fragmentShader:{log:on,prefix:nt}}}a.deleteShader(Ft),a.deleteShader(Xt),gt=new No(a,vt),Ot=Nx(a,vt)}let gt;this.getUniforms=function(){if(gt===void 0)Jt(this);return gt};let Ot;this.getAttributes=function(){if(Ot===void 0)Jt(this);return Ot};let Kt=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(Kt===!1)Kt=a.getProgramParameter(vt,bx);return Kt},this.destroy=function(){s.releaseStatesOfProgram(this),a.deleteProgram(vt),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=Tx++,this.cacheKey=e,this.usedTimes=1,this.program=vt,this.vertexShader=Ft,this.fragmentShader=Xt,this}var Xx=0;class Sd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let s=this._getShaderCacheForMaterial(t);if(s.has(e)===!1)s.add(e),e.usedTimes++;if(s.has(i)===!1)s.add(i),i.usedTimes++;return this}remove(t){let e=this.materialCache.get(t);for(let i of e)if(i.usedTimes--,i.usedTimes===0)this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);if(i===void 0)i=new Set,e.set(t,i);return i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);if(i===void 0)i=new Md(t),e.set(t,i);return i}}class Md{constructor(t){this.id=Xx++,this.code=t,this.usedTimes=0}}function qx(t){return t===_r||t===Ea||t===wa}function Yx(t,e,i,s,a,c){let d=new Eo,p=new Sd,S=new Set,E=[],N=new Map,D=s.logarithmicDepthBuffer,L={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function tt(gt){if(S.add(gt),gt===0)return"uv";return`uv${gt}`}function vt(gt,Ot,Kt,pe,Qt,me){let Ee=pe.fog,jt=Qt.geometry,Ye=gt.isMeshStandardMaterial||gt.isMeshLambertMaterial||gt.isMeshPhongMaterial?pe.environment:null,on=gt.isMeshStandardMaterial||gt.isMeshLambertMaterial&&!gt.envMap||gt.isMeshPhongMaterial&&!gt.envMap,tn=e.get(gt.envMap||Ye,on),yn=L[gt.type],ln=s.precision;if(gt.precision!==null){if(ln=s.getMaxPrecision(gt.precision),ln!==gt.precision)Gn("WebGLProgram.getParameters:",gt.precision,"not supported, using",ln,"instead.")}let dn=jt.morphAttributes.position||jt.morphAttributes.normal||jt.morphAttributes.color,gn=dn!==void 0?dn.length:0,Nn=0;if(jt.morphAttributes.position!==void 0)Nn=1;if(jt.morphAttributes.normal!==void 0)Nn=2;if(jt.morphAttributes.color!==void 0)Nn=3;let fn,_n,Ln,Hn;if(yn){let In=Rs[yn];fn=In.vertexShader,_n=In.fragmentShader}else{fn=gt.vertexShader,_n=gt.fragmentShader;let In=p.getVertexShaderStage(gt),di=p.getFragmentShaderStage(gt);p.update(gt,In,di),Ln=In.id,Hn=di.id}let Wn=t.getRenderTarget(),Dn=t.state.buffers.depth.getReversed(),oi=Qt.isInstancedMesh===!0,jn=Qt.isBatchedMesh===!0,Kn=!!gt.map,ui=!!gt.matcap,ii=!!tn,Ti=ii&&tn.isPMREMTexture===!0,Ei=!!gt.aoMap,ji=!!gt.lightMap,ss=!!gt.bumpMap&&gt.wireframe===!1,wi=!!gt.normalMap,Gi=!!gt.displacementMap,ts=!!gt.emissiveMap,es=!!gt.metalnessMap,us=!!gt.roughnessMap,we=gt.anisotropy>0,fs=gt.clearcoat>0,fi=gt.diffuseRoughness>0,Ni=gt.dispersion>0,wn=gt.retroreflectivity>0,vi=gt.iridescence>0,Xn=gt.sheen>0,Jn=gt.transmission>0,ki=we&&!!gt.anisotropyMap,le=fs&&!!gt.clearcoatMap,qt=fs&&!!gt.clearcoatNormalMap,en=fs&&!!gt.clearcoatRoughnessMap,mn=fi&&!!gt.diffuseRoughnessMap,pn=vi&&!!gt.iridescenceMap,Sn=vi&&!!gt.iridescenceThicknessMap,Tn=Xn&&!!gt.sheenColorMap,an=Xn&&!!gt.sheenRoughnessMap,un=!!gt.specularMap,Mn=!!gt.specularColorMap,Me=!!gt.specularIntensityMap,hn=Jn&&!!gt.transmissionMap,cn=Jn&&!!gt.thicknessMap,xn=!!gt.gradientMap,vn=!!gt.alphaMap,En=gt.alphaTest>0,kn=!!gt.alphaHash,zn=!!gt.extensions,Cn=Ts;if(gt.toneMapped){if(Wn===null||Wn.isXRRenderTarget===!0)Cn=t.toneMapping}let Vn=Ti?tn.isCompressedCubeTexture?tn.image[0].mipmaps:tn.mipmaps:null,Qn={shaderID:yn,shaderType:gt.type,shaderName:gt.name,vertexShader:fn,fragmentShader:_n,defines:gt.defines,customVertexShaderID:Ln,customFragmentShaderID:Hn,isRawShaderMaterial:gt.isRawShaderMaterial===!0,glslVersion:gt.glslVersion,precision:ln,batching:jn,batchingColor:jn&&Qt._colorsTexture!==null,instancing:oi,instancingColor:oi&&Qt.instanceColor!==null,instancingMorph:oi&&Qt.morphTexture!==null,outputColorSpace:Wn===null?t.outputColorSpace:Wn.isXRRenderTarget===!0?Wn.texture.colorSpace:m.workingColorSpace,alphaToCoverage:!!gt.alphaToCoverage,map:Kn,matcap:ui,envMap:ii,envMapMode:ii&&tn.mapping,envMapPMREM:Ti,envMapMaxLod:Ti?Vn.length-1:null,envMapSize:Ti?Vn[0].width:null,aoMap:Ei,lightMap:ji,bumpMap:ss,normalMap:wi,displacementMap:Gi,emissiveMap:ts,normalMapObjectSpace:wi&&gt.normalMapType===vf,normalMapTangentSpace:wi&&gt.normalMapType===Nc,packedNormalMap:wi&&gt.normalMapType===Nc&&qx(gt.normalMap.format),metalnessMap:es,roughnessMap:us,anisotropy:we,anisotropyMap:ki,clearcoat:fs,clearcoatMap:le,clearcoatNormalMap:qt,clearcoatRoughnessMap:en,diffuseRoughness:fi,diffuseRoughnessMap:mn,dispersion:Ni,retroreflection:wn,iridescence:vi,iridescenceMap:pn,iridescenceThicknessMap:Sn,sheen:Xn,sheenColorMap:Tn,sheenRoughnessMap:an,specularMap:un,specularColorMap:Mn,specularIntensityMap:Me,transmission:Jn,transmissionMap:hn,thicknessMap:cn,gradientMap:xn,opaque:gt.transparent===!1&&gt.blending===Mo&&gt.alphaToCoverage===!1,alphaMap:vn,alphaTest:En,alphaHash:kn,combine:gt.combine,mapUv:Kn&&tt(gt.map.channel),aoMapUv:Ei&&tt(gt.aoMap.channel),lightMapUv:ji&&tt(gt.lightMap.channel),bumpMapUv:ss&&tt(gt.bumpMap.channel),normalMapUv:wi&&tt(gt.normalMap.channel),displacementMapUv:Gi&&tt(gt.displacementMap.channel),emissiveMapUv:ts&&tt(gt.emissiveMap.channel),metalnessMapUv:es&&tt(gt.metalnessMap.channel),roughnessMapUv:us&&tt(gt.roughnessMap.channel),anisotropyMapUv:ki&&tt(gt.anisotropyMap.channel),clearcoatMapUv:le&&tt(gt.clearcoatMap.channel),clearcoatNormalMapUv:qt&&tt(gt.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:en&&tt(gt.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:mn&&tt(gt.diffuseRoughnessMap.channel),iridescenceMapUv:pn&&tt(gt.iridescenceMap.channel),iridescenceThicknessMapUv:Sn&&tt(gt.iridescenceThicknessMap.channel),sheenColorMapUv:Tn&&tt(gt.sheenColorMap.channel),sheenRoughnessMapUv:an&&tt(gt.sheenRoughnessMap.channel),specularMapUv:un&&tt(gt.specularMap.channel),specularColorMapUv:Mn&&tt(gt.specularColorMap.channel),specularIntensityMapUv:Me&&tt(gt.specularIntensityMap.channel),transmissionMapUv:hn&&tt(gt.transmissionMap.channel),thicknessMapUv:cn&&tt(gt.thicknessMap.channel),alphaMapUv:vn&&tt(gt.alphaMap.channel),vertexTangents:!!jt.attributes.tangent&&(wi||we),vertexNormals:!!jt.attributes.normal,vertexColors:gt.vertexColors,vertexAlphas:gt.vertexColors===!0&&!!jt.attributes.color&&jt.attributes.color.itemSize===4,pointsUvs:Qt.isPoints===!0&&!!jt.attributes.uv&&(Kn||vn),fog:!!Ee,useFog:gt.fog===!0,fogExp2:!!Ee&&Ee.isFogExp2,flatShading:gt.wireframe===!1&&(gt.flatShading===!0||jt.attributes.normal===void 0&&wi===!1&&(gt.isMeshLambertMaterial||gt.isMeshPhongMaterial||gt.isMeshStandardMaterial||gt.isMeshPhysicalMaterial)),sizeAttenuation:gt.sizeAttenuation===!0,logarithmicDepthBuffer:D,reversedDepthBuffer:Dn,skinning:Qt.isSkinnedMesh===!0,hasPositionAttribute:jt.attributes.position!==void 0,morphTargets:jt.morphAttributes.position!==void 0,morphNormals:jt.morphAttributes.normal!==void 0,morphColors:jt.morphAttributes.color!==void 0,morphTargetsCount:gn,morphTextureStride:Nn,numSunLights:Ot.sun.length,numDirLights:Ot.directional.length,numPointLights:Ot.point.length,numSpotLights:Ot.spot.length,numSpotLightMaps:Ot.spotLightMap.length,numRectAreaLights:Ot.rectArea.length,numHemiLights:Ot.hemi.length,numSunLightShadows:Ot.sunShadowMap.length,numDirLightShadows:Ot.directionalShadowMap.length,numPointLightShadows:Ot.pointShadowMap.length,numSpotLightShadows:Ot.spotShadowMap.length,numSpotLightShadowsWithMaps:Ot.numSpotLightShadowsWithMaps,numLightProbes:Ot.numLightProbes,numLightProbeGrids:me.filter((In)=>In.texture!==null).length,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:gt.dithering,shadowMapEnabled:t.shadowMap.enabled&&Kt.length>0,shadowMapType:t.shadowMap.type,toneMapping:Cn,decodeVideoTexture:Kn&&gt.map.isVideoTexture===!0&&m.getTransfer(gt.map.colorSpace)===_i,decodeVideoTextureEmissive:ts&&gt.emissiveMap.isVideoTexture===!0&&m.getTransfer(gt.emissiveMap.colorSpace)===_i,premultipliedAlpha:gt.premultipliedAlpha,doubleSided:gt.side===Y,flipSided:gt.side===C,useDepthPacking:gt.depthPacking>=0,depthPacking:gt.depthPacking||0,index0AttributeName:gt.index0AttributeName,extensionClipCullDistance:zn&&gt.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(zn&&gt.extensions.multiDraw===!0||jn)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:gt.customProgramCacheKey()};return Qn.vertexUv1s=S.has(1),Qn.vertexUv2s=S.has(2),Qn.vertexUv3s=S.has(3),S.clear(),Qn}function zt(gt){let Ot=[];if(gt.shaderID)Ot.push(gt.shaderID);else Ot.push(gt.customVertexShaderID),Ot.push(gt.customFragmentShaderID);if(gt.defines!==void 0)for(let Kt in gt.defines)Ot.push(Kt),Ot.push(gt.defines[Kt]);if(gt.isRawShaderMaterial===!1)nt(Ot,gt),yt(Ot,gt),Ot.push(t.outputColorSpace);return Ot.push(gt.customProgramCacheKey),Ot.join()}function nt(gt,Ot){gt.push(Ot.precision),gt.push(Ot.outputColorSpace),gt.push(Ot.envMapMode),gt.push(Ot.envMapPMREM),gt.push(Ot.envMapMaxLod),gt.push(Ot.envMapSize),gt.push(Ot.mapUv),gt.push(Ot.alphaMapUv),gt.push(Ot.lightMapUv),gt.push(Ot.aoMapUv),gt.push(Ot.bumpMapUv),gt.push(Ot.normalMapUv),gt.push(Ot.displacementMapUv),gt.push(Ot.emissiveMapUv),gt.push(Ot.metalnessMapUv),gt.push(Ot.roughnessMapUv),gt.push(Ot.anisotropyMapUv),gt.push(Ot.clearcoatMapUv),gt.push(Ot.clearcoatNormalMapUv),gt.push(Ot.clearcoatRoughnessMapUv),gt.push(Ot.diffuseRoughnessMapUv),gt.push(Ot.iridescenceMapUv),gt.push(Ot.iridescenceThicknessMapUv),gt.push(Ot.sheenColorMapUv),gt.push(Ot.sheenRoughnessMapUv),gt.push(Ot.specularMapUv),gt.push(Ot.specularColorMapUv),gt.push(Ot.specularIntensityMapUv),gt.push(Ot.transmissionMapUv),gt.push(Ot.thicknessMapUv),gt.push(Ot.combine),gt.push(Ot.fogExp2),gt.push(Ot.sizeAttenuation),gt.push(Ot.morphTargetsCount),gt.push(Ot.numSunLights),gt.push(Ot.numDirLights),gt.push(Ot.numPointLights),gt.push(Ot.numSpotLights),gt.push(Ot.numSpotLightMaps),gt.push(Ot.numHemiLights),gt.push(Ot.numRectAreaLights),gt.push(Ot.numSunLightShadows),gt.push(Ot.numDirLightShadows),gt.push(Ot.numPointLightShadows),gt.push(Ot.numSpotLightShadows),gt.push(Ot.numSpotLightShadowsWithMaps),gt.push(Ot.numLightProbes),gt.push(Ot.numLightProbeGrids),gt.push(Ot.shadowMapType),gt.push(Ot.toneMapping),gt.push(Ot.numClippingPlanes),gt.push(Ot.numClipIntersection),gt.push(Ot.depthPacking)}function yt(gt,Ot){if(d.disableAll(),Ot.instancing)d.enable(0);if(Ot.instancingColor)d.enable(1);if(Ot.instancingMorph)d.enable(2);if(Ot.matcap)d.enable(3);if(Ot.envMap)d.enable(4);if(Ot.normalMapObjectSpace)d.enable(5);if(Ot.normalMapTangentSpace)d.enable(6);if(Ot.clearcoat)d.enable(7);if(Ot.iridescence)d.enable(8);if(Ot.alphaTest)d.enable(9);if(Ot.vertexColors)d.enable(10);if(Ot.vertexAlphas)d.enable(11);if(Ot.vertexUv1s)d.enable(12);if(Ot.vertexUv2s)d.enable(13);if(Ot.vertexUv3s)d.enable(14);if(Ot.vertexTangents)d.enable(15);if(Ot.anisotropy)d.enable(16);if(Ot.alphaHash)d.enable(17);if(Ot.batching)d.enable(18);if(Ot.dispersion)d.enable(19);if(Ot.retroreflection)d.enable(24);if(Ot.diffuseRoughness)d.enable(25);if(Ot.batchingColor)d.enable(20);if(Ot.gradientMap)d.enable(21);if(Ot.packedNormalMap)d.enable(22);if(Ot.vertexNormals)d.enable(23);if(gt.push(d.mask),d.disableAll(),Ot.fog)d.enable(0);if(Ot.useFog)d.enable(1);if(Ot.flatShading)d.enable(2);if(Ot.logarithmicDepthBuffer)d.enable(3);if(Ot.reversedDepthBuffer)d.enable(4);if(Ot.skinning)d.enable(5);if(Ot.morphTargets)d.enable(6);if(Ot.morphNormals)d.enable(7);if(Ot.morphColors)d.enable(8);if(Ot.premultipliedAlpha)d.enable(9);if(Ot.shadowMapEnabled)d.enable(10);if(Ot.doubleSided)d.enable(11);if(Ot.flipSided)d.enable(12);if(Ot.useDepthPacking)d.enable(13);if(Ot.dithering)d.enable(14);if(Ot.transmission)d.enable(15);if(Ot.sheen)d.enable(16);if(Ot.opaque)d.enable(17);if(Ot.pointsUvs)d.enable(18);if(Ot.decodeVideoTexture)d.enable(19);if(Ot.decodeVideoTextureEmissive)d.enable(20);if(Ot.alphaToCoverage)d.enable(21);if(Ot.numLightProbeGrids>0)d.enable(22);if(Ot.hasPositionAttribute)d.enable(23);gt.push(d.mask)}function Dt(gt){let Ot=L[gt.type],Kt;if(Ot){let pe=Rs[Ot];Kt=Lf.clone(pe.uniforms)}else Kt=gt.uniforms;return Kt}function Ht(gt,Ot){let Kt=N.get(Ot);if(Kt!==void 0)++Kt.usedTimes;else Kt=new Wx(t,Ot,gt,a),E.push(Kt),N.set(Ot,Kt);return Kt}function Ft(gt){if(--gt.usedTimes===0){let Ot=E.indexOf(gt);E[Ot]=E[E.length-1],E.pop(),N.delete(gt.cacheKey),gt.destroy()}}function Xt(gt){p.remove(gt)}function Jt(){p.dispose()}return{getParameters:vt,getProgramCacheKey:zt,getUniforms:Dt,acquireProgram:Ht,releaseProgram:Ft,releaseShaderCache:Xt,programs:E,dispose:Jt}}function Zx(){let t=new WeakMap;function e(d){return t.has(d)}function i(d){let p=t.get(d);if(p===void 0)p={},t.set(d,p);return p}function s(d){t.delete(d)}function a(d,p,S){t.get(d)[p]=S}function c(){t=new WeakMap}return{has:e,get:i,remove:s,update:a,dispose:c}}function Jx(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.material.id!==e.material.id)return t.material.id-e.material.id;else if(t.materialVariant!==e.materialVariant)return t.materialVariant-e.materialVariant;else if(t.z!==e.z)return t.z-e.z;else return t.id-e.id}function sd(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.z!==e.z)return e.z-t.z;else return t.id-e.id}function rd(){let t=[],e=0,i=[],s=[],a=[];function c(){e=0,i.length=0,s.length=0,a.length=0}function d(L){let tt=0;if(L.isInstancedMesh)tt+=2;if(L.isSkinnedMesh)tt+=1;return tt}function p(L,tt,vt,zt,nt,yt){let Dt=t[e];if(Dt===void 0)Dt={id:L.id,object:L,geometry:tt,material:vt,materialVariant:d(L),groupOrder:zt,renderOrder:L.renderOrder,z:nt,group:yt},t[e]=Dt;else Dt.id=L.id,Dt.object=L,Dt.geometry=tt,Dt.material=vt,Dt.materialVariant=d(L),Dt.groupOrder=zt,Dt.renderOrder=L.renderOrder,Dt.z=nt,Dt.group=yt;return e++,Dt}function S(L,tt,vt,zt,nt,yt,Dt){if(Dt.reversedDepth===!0)nt=-nt;let Ht=p(L,tt,vt,zt,nt,yt);if(vt.transmission>0)s.push(Ht);else if(vt.transparent===!0)a.push(Ht);else i.push(Ht)}function E(L,tt,vt,zt,nt,yt){let Dt=p(L,tt,vt,zt,nt,yt);if(vt.transmission>0)s.unshift(Dt);else if(vt.transparent===!0)a.unshift(Dt);else i.unshift(Dt)}function N(L,tt){if(i.length>1)i.sort(L||Jx);if(s.length>1)s.sort(tt||sd);if(a.length>1)a.sort(tt||sd)}function D(){for(let L=e,tt=t.length;L<tt;L++){let vt=t[L];if(vt.id===null)break;vt.id=null,vt.object=null,vt.geometry=null,vt.material=null,vt.group=null}}return{opaque:i,transmissive:s,transparent:a,init:c,push:S,unshift:E,finish:D,sort:N}}function $x(){let t=new WeakMap;function e(s,a){let c=t.get(s),d;if(c===void 0)d=new rd,t.set(s,[d]);else if(a>=c.length)d=new rd,c.push(d);else d=c[a];return d}function i(){t=new WeakMap}return{get:e,dispose:i}}function Kx(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let i;switch(e.type){case"SunLight":case"DirectionalLight":i={direction:new n,color:new l};break;case"SpotLight":i={position:new n,direction:new n,color:new l,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new n,color:new l,distance:0,decay:0};break;case"HemisphereLight":i={direction:new n,skyColor:new l,groundColor:new l};break;case"RectAreaLight":i={color:new l,position:new n,halfWidth:new n,halfHeight:new n};break}return t[e.id]=i,i}}}function Qx(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let i;switch(e.type){case"SunLight":case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new o};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new o};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new o,shadowCameraNear:1,shadowCameraFar:1000};break}return t[e.id]=i,i}}}var jx=0;function ty(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function ey(t){let e=new Kx,i=Qx(),s={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let E=0;E<9;E++)s.probe.push(new n);let a=new n,c=new r,d=new r;function p(E){let N=0,D=0,L=0;for(let me=0;me<9;me++)s.probe[me].set(0,0,0);let tt=0,vt=0,zt=0,nt=0,yt=0,Dt=0,Ht=0,Ft=0,Xt=0,Jt=0,gt=0,Ot=0,Kt=0,pe=0;E.sort(ty);for(let me=0,Ee=E.length;me<Ee;me++){let jt=E[me],{color:Ye,intensity:on,distance:tn}=jt,yn=null;if(jt.shadow&&jt.shadow.map)if(jt.shadow.map.texture.format===_r)yn=jt.shadow.map.texture;else yn=jt.shadow.map.depthTexture||jt.shadow.map.texture;if(jt.isAmbientLight)N+=Ye.r*on,D+=Ye.g*on,L+=Ye.b*on;else if(jt.isLightProbe){for(let ln=0;ln<9;ln++)s.probe[ln].addScaledVector(jt.sh.coefficients[ln],on);pe++}else if(jt.isSunLight){let ln=e.get(jt);if(ln.color.copy(jt.color).multiplyScalar(jt.intensity),jt.castShadow){let dn=jt.shadow,gn=i.get(jt);gn.shadowIntensity=dn.intensity,gn.shadowBias=dn.bias,gn.shadowNormalBias=dn.normalBias,gn.shadowRadius=dn.radius,gn.shadowMapSize.copy(dn.mapSize).multiply(dn.getFrameExtents()),s.sunShadow[vt]=gn,s.sunShadowMap[vt]=yn;let Nn=dn.getViewportCount();for(let fn=0;fn<Nn;fn++)s.sunShadowMatrix[zt+fn]=dn.getMatrix(fn),s.sunShadowCascade[zt+fn]=dn._cascadeData[fn];zt+=Nn,vt++}s.sun[tt]=ln,tt++}else if(jt.isDirectionalLight){let ln=e.get(jt);if(ln.color.copy(jt.color).multiplyScalar(jt.intensity),jt.castShadow){let dn=jt.shadow,gn=i.get(jt);gn.shadowIntensity=dn.intensity,gn.shadowBias=dn.bias,gn.shadowNormalBias=dn.normalBias,gn.shadowRadius=dn.radius,gn.shadowMapSize=dn.mapSize,s.directionalShadow[nt]=gn,s.directionalShadowMap[nt]=yn,s.directionalShadowMatrix[nt]=jt.shadow.matrix,Xt++}s.directional[nt]=ln,nt++}else if(jt.isSpotLight){let ln=e.get(jt);ln.position.setFromMatrixPosition(jt.matrixWorld),ln.color.copy(Ye).multiplyScalar(on),ln.distance=tn,ln.coneCos=Math.cos(jt.angle),ln.penumbraCos=Math.cos(jt.angle*(1-jt.penumbra)),ln.decay=jt.decay,s.spot[Dt]=ln;let dn=jt.shadow;if(jt.map){if(s.spotLightMap[Ot]=jt.map,Ot++,dn.updateMatrices(jt),jt.castShadow)Kt++}if(s.spotLightMatrix[Dt]=dn.matrix,jt.castShadow){let gn=i.get(jt);gn.shadowIntensity=dn.intensity,gn.shadowBias=dn.bias,gn.shadowNormalBias=dn.normalBias,gn.shadowRadius=dn.radius,gn.shadowMapSize=dn.mapSize,s.spotShadow[Dt]=gn,s.spotShadowMap[Dt]=yn,gt++}Dt++}else if(jt.isRectAreaLight){let ln=e.get(jt);ln.color.copy(Ye).multiplyScalar(on),ln.halfWidth.set(jt.width*0.5,0,0),ln.halfHeight.set(0,jt.height*0.5,0),s.rectArea[Ht]=ln,Ht++}else if(jt.isPointLight){let ln=e.get(jt);if(ln.color.copy(jt.color).multiplyScalar(jt.intensity),ln.distance=jt.distance,ln.decay=jt.decay,jt.castShadow){let dn=jt.shadow,gn=i.get(jt);gn.shadowIntensity=dn.intensity,gn.shadowBias=dn.bias,gn.shadowNormalBias=dn.normalBias,gn.shadowRadius=dn.radius,gn.shadowMapSize=dn.mapSize,gn.shadowCameraNear=dn.camera.near,gn.shadowCameraFar=dn.camera.far,s.pointShadow[yt]=gn,s.pointShadowMap[yt]=yn,s.pointShadowMatrix[yt]=jt.shadow.matrix,Jt++}s.point[yt]=ln,yt++}else if(jt.isHemisphereLight){let ln=e.get(jt);ln.skyColor.copy(jt.color).multiplyScalar(on),ln.groundColor.copy(jt.groundColor).multiplyScalar(on),s.hemi[Ft]=ln,Ft++}}if(Ht>0)if(t.has("OES_texture_float_linear")===!0)s.rectAreaLTC1=Rn.LTC_FLOAT_1,s.rectAreaLTC2=Rn.LTC_FLOAT_2;else s.rectAreaLTC1=Rn.LTC_HALF_1,s.rectAreaLTC2=Rn.LTC_HALF_2;s.ambient[0]=N,s.ambient[1]=D,s.ambient[2]=L;let Qt=s.hash;if(Qt.sunLength!==tt||Qt.directionalLength!==nt||Qt.pointLength!==yt||Qt.spotLength!==Dt||Qt.rectAreaLength!==Ht||Qt.hemiLength!==Ft||Qt.numSunShadows!==vt||Qt.numDirectionalShadows!==Xt||Qt.numPointShadows!==Jt||Qt.numSpotShadows!==gt||Qt.numSpotMaps!==Ot||Qt.numLightProbes!==pe)s.sun.length=tt,s.directional.length=nt,s.spot.length=Dt,s.rectArea.length=Ht,s.point.length=yt,s.hemi.length=Ft,s.sunShadow.length=vt,s.sunShadowMap.length=vt,s.sunShadowMatrix.length=zt,s.sunShadowCascade.length=zt,s.directionalShadow.length=Xt,s.directionalShadowMap.length=Xt,s.directionalShadowMatrix.length=Xt,s.pointShadow.length=Jt,s.pointShadowMap.length=Jt,s.pointShadowMatrix.length=Jt,s.spotShadow.length=gt,s.spotShadowMap.length=gt,s.spotLightMatrix.length=gt+Ot-Kt,s.spotLightMap.length=Ot,s.numSpotLightShadowsWithMaps=Kt,s.numLightProbes=pe,Qt.sunLength=tt,Qt.directionalLength=nt,Qt.pointLength=yt,Qt.spotLength=Dt,Qt.rectAreaLength=Ht,Qt.hemiLength=Ft,Qt.numSunShadows=vt,Qt.numDirectionalShadows=Xt,Qt.numPointShadows=Jt,Qt.numSpotShadows=gt,Qt.numSpotMaps=Ot,Qt.numLightProbes=pe,s.version=jx++}function S(E,N){let D=0,L=0,tt=0,vt=0,zt=0,nt=0,yt=N.matrixWorldInverse;for(let Dt=0,Ht=E.length;Dt<Ht;Dt++){let Ft=E[Dt];if(Ft.isSunLight){let Xt=s.sun[D];Xt.direction.setFromMatrixPosition(Ft.matrixWorld),Xt.direction.transformDirection(yt),D++}else if(Ft.isDirectionalLight){let Xt=s.directional[L];Xt.direction.setFromMatrixPosition(Ft.matrixWorld),a.setFromMatrixPosition(Ft.target.matrixWorld),Xt.direction.sub(a),Xt.direction.transformDirection(yt),L++}else if(Ft.isSpotLight){let Xt=s.spot[vt];Xt.position.setFromMatrixPosition(Ft.matrixWorld),Xt.position.applyMatrix4(yt),Xt.direction.setFromMatrixPosition(Ft.matrixWorld),a.setFromMatrixPosition(Ft.target.matrixWorld),Xt.direction.sub(a),Xt.direction.transformDirection(yt),vt++}else if(Ft.isRectAreaLight){let Xt=s.rectArea[zt];Xt.position.setFromMatrixPosition(Ft.matrixWorld),Xt.position.applyMatrix4(yt),d.identity(),c.copy(Ft.matrixWorld),c.premultiply(yt),d.extractRotation(c),Xt.halfWidth.set(Ft.width*0.5,0,0),Xt.halfHeight.set(0,Ft.height*0.5,0),Xt.halfWidth.applyMatrix4(d),Xt.halfHeight.applyMatrix4(d),zt++}else if(Ft.isPointLight){let Xt=s.point[tt];Xt.position.setFromMatrixPosition(Ft.matrixWorld),Xt.position.applyMatrix4(yt),tt++}else if(Ft.isHemisphereLight){let Xt=s.hemi[nt];Xt.direction.setFromMatrixPosition(Ft.matrixWorld),Xt.direction.transformDirection(yt),nt++}}}return{setup:p,setupView:S,state:s}}function od(t){let e=new ey(t),i=[],s=[],a=[];function c(D){N.camera=D,i.length=0,s.length=0,a.length=0}function d(D){if(D.isLightProbeGrid)a.push(D);else i.push(D)}function p(D){s.push(D)}function S(){e.setup(i),a.sort((D,L)=>D.priority-L.priority||D.id-L.id)}function E(D){e.setupView(i,D)}let N={lightsArray:i,shadowsArray:s,lightProbeGridArray:a,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:c,state:N,setupLights:S,setupLightsView:E,pushLight:d,pushShadow:p}}function ny(t){let e=new WeakMap;function i(a,c=0){let d=e.get(a),p;if(d===void 0)p=new od(t),e.set(a,[p]);else if(c>=d.length)p=new od(t),d.push(p);else p=d[c];return p}function s(){e=new WeakMap}return{get:i,dispose:s}}var iy=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,sy=`uniform sampler2D shadow_pass;
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
}`,ry=[new n(1,0,0),new n(-1,0,0),new n(0,1,0),new n(0,-1,0),new n(0,0,1),new n(0,0,-1)],oy=[new n(0,-1,0),new n(0,-1,0),new n(0,0,1),new n(0,0,-1),new n(0,-1,0),new n(0,-1,0)],ad=new r,Po=new n,ch=new n;function ay(t,e,i){let s=new Q,a=new o,c=new o,d=new y,p=new Jc,S=new $c,E={},N=i.maxTextureSize,D={[ne]:C,[C]:ne,[Y]:Y},L=new re({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new o},radius:{value:4}},vertexShader:iy,fragmentShader:sy}),tt=L.clone();tt.defines.HORIZONTAL_PASS=1;let vt=new g;vt.setAttribute("position",new _(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let zt=new u(vt,L),nt=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=So;let yt=this.type;this.render=function(Jt,gt,Ot){if(nt.enabled===!1)return;if(nt.autoUpdate===!1&&nt.needsUpdate===!1)return;if(Jt.length===0)return;if(this.type===Bu)Gn("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=So;let Kt=t.getRenderTarget(),pe=t.getActiveCubeFace(),Qt=t.getActiveMipmapLevel(),me=t.state;if(me.setBlending(mr),me.buffers.depth.getReversed()===!0)me.buffers.color.setClear(0,0,0,0);else me.buffers.color.setClear(1,1,1,1);me.buffers.depth.setTest(!0),me.setScissorTest(!1);let Ee=yt!==this.type;if(Ee)gt.traverse(function(jt){if(jt.material)if(Array.isArray(jt.material))jt.material.forEach((Ye)=>Ye.needsUpdate=!0);else jt.material.needsUpdate=!0});for(let jt=0,Ye=Jt.length;jt<Ye;jt++){let on=Jt[jt],tn=on.shadow;if(tn===void 0){Gn("WebGLShadowMap:",on,"has no shadow.");continue}if(tn.autoUpdate===!1&&tn.needsUpdate===!1)continue;a.copy(tn.mapSize);let yn=tn.getFrameExtents();if(a.multiply(yn),c.copy(tn.mapSize),a.x>N||a.y>N){if(a.x>N)c.x=Math.floor(N/yn.x),a.x=c.x*yn.x,tn.mapSize.x=c.x;if(a.y>N)c.y=Math.floor(N/yn.y),a.y=c.y*yn.y,tn.mapSize.y=c.y}let ln=t.state.buffers.depth.getReversed();if(tn.camera._reversedDepth=ln,tn.map===null||Ee===!0){if(tn.map!==null){if(tn.map.depthTexture!==null)tn.map.depthTexture.dispose(),tn.map.depthTexture=null;tn.map.dispose()}if(this.type===Hr){if(on.isPointLight){Gn("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}tn.map=new z(a.x,a.y,{format:_r,type:H,minFilter:A,magFilter:A,generateMipmaps:!1}),tn.map.texture.name=on.name+".shadowMap",tn.map.depthTexture=new Ks(a.x,a.y,Gs),tn.map.depthTexture.name=on.name+".shadowMapDepth",tn.map.depthTexture.format=Wr,tn.map.depthTexture.compareFunction=null,tn.map.depthTexture.minFilter=G,tn.map.depthTexture.magFilter=G}else{if(on.isPointLight)tn.map=new ka(a.x),tn.map.depthTexture=new Da(a.x,Js);else tn.map=new z(a.x,a.y),tn.map.depthTexture=new Ks(a.x,a.y,Js);if(tn.map.depthTexture.name=on.name+".shadowMap",tn.map.depthTexture.format=Wr,this.type===So)tn.map.depthTexture.compareFunction=ln?Fc:Uc,tn.map.depthTexture.minFilter=A,tn.map.depthTexture.magFilter=A;else tn.map.depthTexture.compareFunction=null,tn.map.depthTexture.minFilter=G,tn.map.depthTexture.magFilter=G}tn.camera.updateProjectionMatrix()}if(tn.map.isWebGLCubeRenderTarget!==!0&&(tn.map.width!==a.x||tn.map.height!==a.y))tn.map.setSize(a.x,a.y);let dn=tn.map.isWebGLCubeRenderTarget?6:tn.getViewportCount();if(on.isPointLight!==!0)tn.updateMatrices(on,Ot);let gn=(tn.camera.layers.mask&4294967294)!==0?tn.camera.layers:Ot.layers;for(let Nn=0;Nn<dn;Nn++){let fn=tn.getCamera(Nn);if(on.isPointLight){let{camera:_n,matrix:Ln}=tn,Hn=on.distance||_n.far;if(Hn!==_n.far)_n.far=Hn,_n.updateProjectionMatrix();Po.setFromMatrixPosition(on.matrixWorld),_n.position.copy(Po),ch.copy(_n.position),ch.add(ry[Nn]),_n.up.copy(oy[Nn]),_n.lookAt(ch),_n.updateMatrixWorld(),Ln.makeTranslation(-Po.x,-Po.y,-Po.z),ad.multiplyMatrices(_n.projectionMatrix,_n.matrixWorldInverse),tn._frustum.setFromProjectionMatrix(ad,_n.coordinateSystem,_n.reversedDepth)}if(tn.map.isWebGLCubeRenderTarget)t.setRenderTarget(tn.map,Nn),t.clear();else{if(Nn===0)t.setRenderTarget(tn.map),t.clear();let _n=tn.getViewport(Nn);d.set(c.x*_n.x,c.y*_n.y,c.x*_n.z,c.y*_n.w),me.viewport(d)}s=tn.getFrustum(Nn),Ft(gt,Ot,fn,on,gn,this.type)}if(tn.isPointLightShadow!==!0&&this.type===Hr)Dt(tn,Ot);tn.needsUpdate=!1}yt=this.type,nt.needsUpdate=!1,t.setRenderTarget(Kt,pe,Qt)};function Dt(Jt,gt){let Ot=e.update(zt);if(L.defines.VSM_SAMPLES!==Jt.blurSamples)L.defines.VSM_SAMPLES=Jt.blurSamples,tt.defines.VSM_SAMPLES=Jt.blurSamples,L.needsUpdate=!0,tt.needsUpdate=!0;if(Jt.mapPass===null)Jt.mapPass=new z(a.x,a.y,{format:_r,type:H});else if(Jt.mapPass.width!==Jt.map.width||Jt.mapPass.height!==Jt.map.height)Jt.mapPass.setSize(Jt.map.width,Jt.map.height);L.uniforms.shadow_pass.value=Jt.map.depthTexture,L.uniforms.resolution.value.set(Jt.map.width,Jt.map.height),L.uniforms.radius.value=Jt.radius,t.setRenderTarget(Jt.mapPass),t.clear(),t.renderBufferDirect(gt,null,Ot,L,zt,null),tt.uniforms.shadow_pass.value=Jt.mapPass.texture,tt.uniforms.resolution.value.set(Jt.map.width,Jt.map.height),tt.uniforms.radius.value=Jt.radius,t.setRenderTarget(Jt.map),t.clear(),t.renderBufferDirect(gt,null,Ot,tt,zt,null)}function Ht(Jt,gt,Ot,Kt){let pe=null,Qt=Ot.isPointLight===!0?Jt.customDistanceMaterial:Jt.customDepthMaterial;if(Qt!==void 0)pe=Qt;else if(pe=Ot.isPointLight===!0?S:p,t.localClippingEnabled&&gt.clipShadows===!0&&Array.isArray(gt.clippingPlanes)&&gt.clippingPlanes.length!==0||gt.displacementMap&&gt.displacementScale!==0||gt.alphaMap&&gt.alphaTest>0||gt.map&&gt.alphaTest>0||gt.alphaToCoverage===!0){let me=pe.uuid,Ee=gt.uuid,jt=E[me];if(jt===void 0)jt={},E[me]=jt;let Ye=jt[Ee];if(Ye===void 0)Ye=pe.clone(),jt[Ee]=Ye,gt.addEventListener("dispose",Xt);pe=Ye}if(pe.visible=gt.visible,pe.wireframe=gt.wireframe,Kt===Hr)pe.side=gt.shadowSide!==null?gt.shadowSide:gt.side;else pe.side=gt.shadowSide!==null?gt.shadowSide:D[gt.side];if(pe.alphaMap=gt.alphaMap,pe.alphaTest=gt.alphaToCoverage===!0?0.5:gt.alphaTest,pe.map=gt.map,pe.clipShadows=gt.clipShadows,pe.clippingPlanes=gt.clippingPlanes,pe.clipIntersection=gt.clipIntersection,pe.displacementMap=gt.displacementMap,pe.displacementScale=gt.displacementScale,pe.displacementBias=gt.displacementBias,pe.wireframeLinewidth=gt.wireframeLinewidth,pe.linewidth=gt.linewidth,Ot.isPointLight===!0&&pe.isMeshDistanceMaterial===!0){let me=t.properties.get(pe);me.light=Ot}return pe}function Ft(Jt,gt,Ot,Kt,pe,Qt){if(Jt.visible===!1)return;if(Jt.layers.test(pe)&&(Jt.isMesh||Jt.isLine||Jt.isPoints)){if((Jt.castShadow||Jt.receiveShadow&&Qt===Hr)&&(!Jt.frustumCulled||Jt.intersectsFrustum(s))){Jt.modelViewMatrix.multiplyMatrices(Ot.matrixWorldInverse,Jt.matrixWorld);let jt=e.update(Jt),Ye=Jt.material;if(Array.isArray(Ye)){let on=jt.groups;for(let tn=0,yn=on.length;tn<yn;tn++){let ln=on[tn],dn=Ye[ln.materialIndex];if(dn&&dn.visible){let gn=Ht(Jt,dn,Kt,Qt);Jt.onBeforeShadow(t,Jt,gt,Ot,jt,gn,ln),t.renderBufferDirect(Ot,null,jt,gn,Jt,ln),Jt.onAfterShadow(t,Jt,gt,Ot,jt,gn,ln)}}}else if(Ye.visible){let on=Ht(Jt,Ye,Kt,Qt);Jt.onBeforeShadow(t,Jt,gt,Ot,jt,on,null),t.renderBufferDirect(Ot,null,jt,on,Jt,null),Jt.onAfterShadow(t,Jt,gt,Ot,jt,on,null)}}}let Ee=Jt.children;for(let jt=0,Ye=Ee.length;jt<Ye;jt++)Ft(Ee[jt],gt,Ot,Kt,pe,Qt)}function Xt(Jt){Jt.target.removeEventListener("dispose",Xt);for(let Ot in E){let Kt=E[Ot],pe=Jt.target.uuid;if(pe in Kt)Kt[pe].dispose(),delete Kt[pe]}}}function ly(t,e){function i(){let Me=!1,hn=new y,cn=null,xn=new y(0,0,0,0);return{setMask:function(vn){if(cn!==vn&&!Me)t.colorMask(vn,vn,vn,vn),cn=vn},setLocked:function(vn){Me=vn},setClear:function(vn,En,kn,zn,Cn){if(Cn===!0)vn*=zn,En*=zn,kn*=zn;if(hn.set(vn,En,kn,zn),xn.equals(hn)===!1)t.clearColor(vn,En,kn,zn),xn.copy(hn)},reset:function(){Me=!1,cn=null,xn.set(-1,0,0,0)}}}function s(){let Me=!1,hn=!1,cn=null,xn=null,vn=null;return{setReversed:function(En){if(hn!==En){let kn=e.get("EXT_clip_control");if(En)kn.clipControlEXT(kn.LOWER_LEFT_EXT,kn.ZERO_TO_ONE_EXT);else kn.clipControlEXT(kn.LOWER_LEFT_EXT,kn.NEGATIVE_ONE_TO_ONE_EXT);hn=En;let zn=vn;vn=null,this.setClear(zn)}},getReversed:function(){return hn},setTest:function(En){if(En)Dn(t.DEPTH_TEST);else oi(t.DEPTH_TEST)},setMask:function(En){if(cn!==En&&!Me)t.depthMask(En),cn=En},setFunc:function(En){if(hn)En=Cf[En];if(xn!==En){switch(En){case sf:t.depthFunc(t.NEVER);break;case rf:t.depthFunc(t.ALWAYS);break;case of:t.depthFunc(t.LESS);break;case Zl:t.depthFunc(t.LEQUAL);break;case af:t.depthFunc(t.EQUAL);break;case lf:t.depthFunc(t.GEQUAL);break;case cf:t.depthFunc(t.GREATER);break;case hf:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}xn=En}},setLocked:function(En){Me=En},setClear:function(En){if(vn!==En){if(vn=En,hn)En=1-En;t.clearDepth(En)}},reset:function(){Me=!1,cn=null,xn=null,vn=null,hn=!1}}}function a(){let Me=!1,hn=null,cn=null,xn=null,vn=null,En=null,kn=null,zn=null,Cn=null;return{setTest:function(Vn){if(!Me)if(Vn)Dn(t.STENCIL_TEST);else oi(t.STENCIL_TEST)},setMask:function(Vn){if(hn!==Vn&&!Me)t.stencilMask(Vn),hn=Vn},setFunc:function(Vn,Qn,In){if(cn!==Vn||xn!==Qn||vn!==In)t.stencilFunc(Vn,Qn,In),cn=Vn,xn=Qn,vn=In},setOp:function(Vn,Qn,In){if(En!==Vn||kn!==Qn||zn!==In)t.stencilOp(Vn,Qn,In),En=Vn,kn=Qn,zn=In},setLocked:function(Vn){Me=Vn},setClear:function(Vn){if(Cn!==Vn)t.clearStencil(Vn),Cn=Vn},reset:function(){Me=!1,hn=null,cn=null,xn=null,vn=null,En=null,kn=null,zn=null,Cn=null}}}let c=new i,d=new s,p=new a,S={},E=new WeakMap,N={},D={},L={},tt=new WeakMap,vt=[],zt=null,nt=!1,yt=null,Dt=null,Ht=null,Ft=null,Xt=null,Jt=null,gt=null,Ot=new l(0,0,0),Kt=0,pe=!1,Qt=null,me=null,Ee=null,jt=null,Ye=null,on=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),tn=!1,yn=0,ln=t.getParameter(t.VERSION);if(ln.indexOf("WebGL")!==-1)yn=parseFloat(/^WebGL (\d)/.exec(ln)[1]),tn=yn>=1;else if(ln.indexOf("OpenGL ES")!==-1)yn=parseFloat(/^OpenGL ES (\d)/.exec(ln)[1]),tn=yn>=2;let dn=null,gn={},Nn=t.getParameter(t.SCISSOR_BOX),fn=t.getParameter(t.VIEWPORT),_n=new y().fromArray(Nn),Ln=new y().fromArray(fn);function Hn(Me,hn,cn,xn){let vn=new Uint8Array(4),En=t.createTexture();t.bindTexture(Me,En),t.texParameteri(Me,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(Me,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let kn=0;kn<cn;kn++)if(Me===t.TEXTURE_3D||Me===t.TEXTURE_2D_ARRAY)t.texImage3D(hn,0,t.RGBA,1,1,xn,0,t.RGBA,t.UNSIGNED_BYTE,vn);else t.texImage2D(hn+kn,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,vn);return En}let Wn={};Wn[t.TEXTURE_2D]=Hn(t.TEXTURE_2D,t.TEXTURE_2D,1),Wn[t.TEXTURE_CUBE_MAP]=Hn(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),Wn[t.TEXTURE_2D_ARRAY]=Hn(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),Wn[t.TEXTURE_3D]=Hn(t.TEXTURE_3D,t.TEXTURE_3D,1,1),c.setClear(0,0,0,1),d.setClear(1),p.setClear(0),Dn(t.DEPTH_TEST),d.setFunc(Zl),ss(!1),wi(Xl),Dn(t.CULL_FACE),Ei(mr);function Dn(Me){if(N[Me]!==!0)t.enable(Me),N[Me]=!0}function oi(Me){if(N[Me]!==!1)t.disable(Me),N[Me]=!1}function jn(Me,hn){if(L[Me]!==hn){if(t.bindFramebuffer(Me,hn),L[Me]=hn,Me===t.DRAW_FRAMEBUFFER)L[t.FRAMEBUFFER]=hn;if(Me===t.FRAMEBUFFER)L[t.DRAW_FRAMEBUFFER]=hn;return!0}return!1}function Kn(Me,hn){let cn=vt,xn=!1;if(Me){if(cn=tt.get(hn),cn===void 0)cn=[],tt.set(hn,cn);let vn=Me.textures;if(cn.length!==vn.length||cn[0]!==t.COLOR_ATTACHMENT0){for(let En=0,kn=vn.length;En<kn;En++)cn[En]=t.COLOR_ATTACHMENT0+En;cn.length=vn.length,xn=!0}}else if(cn[0]!==t.BACK)cn[0]=t.BACK,xn=!0;if(xn)t.drawBuffers(cn)}function ui(Me){if(zt!==Me)return t.useProgram(Me),zt=Me,!0;return!1}let ii={[Ce]:t.FUNC_ADD,[zu]:t.FUNC_SUBTRACT,[Gu]:t.FUNC_REVERSE_SUBTRACT};ii[ku]=t.MIN,ii[Hu]=t.MAX;let Ti={[Vu]:t.ZERO,[bt]:t.ONE,[Wu]:t.SRC_COLOR,[qu]:t.SRC_ALPHA,[Qu]:t.SRC_ALPHA_SATURATE,[$u]:t.DST_COLOR,[Zu]:t.DST_ALPHA,[Xu]:t.ONE_MINUS_SRC_COLOR,[Yu]:t.ONE_MINUS_SRC_ALPHA,[Ku]:t.ONE_MINUS_DST_COLOR,[Ju]:t.ONE_MINUS_DST_ALPHA,[ju]:t.CONSTANT_COLOR,[tf]:t.ONE_MINUS_CONSTANT_COLOR,[ef]:t.CONSTANT_ALPHA,[nf]:t.ONE_MINUS_CONSTANT_ALPHA};function Ei(Me,hn,cn,xn,vn,En,kn,zn,Cn,Vn){if(Me===mr){if(nt===!0)oi(t.BLEND),nt=!1;return}if(nt===!1)Dn(t.BLEND),nt=!0;if(Me!==_t){if(Me!==yt||Vn!==pe){if(Dt!==Ce||Xt!==Ce)t.blendEquation(t.FUNC_ADD),Dt=Ce,Xt=Ce;if(Vn)switch(Me){case Mo:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case it:t.blendFunc(t.ONE,t.ONE);break;case ql:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case Yl:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:qn("WebGLState: Invalid blending: ",Me);break}else switch(Me){case Mo:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case it:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case ql:qn("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Yl:qn("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:qn("WebGLState: Invalid blending: ",Me);break}Ht=null,Ft=null,Jt=null,gt=null,Ot.set(0,0,0),Kt=0,yt=Me,pe=Vn}return}if(vn=vn||hn,En=En||cn,kn=kn||xn,hn!==Dt||vn!==Xt)t.blendEquationSeparate(ii[hn],ii[vn]),Dt=hn,Xt=vn;if(cn!==Ht||xn!==Ft||En!==Jt||kn!==gt)t.blendFuncSeparate(Ti[cn],Ti[xn],Ti[En],Ti[kn]),Ht=cn,Ft=xn,Jt=En,gt=kn;if(zn.equals(Ot)===!1||Cn!==Kt)t.blendColor(zn.r,zn.g,zn.b,Cn),Ot.copy(zn),Kt=Cn;yt=Me,pe=!1}function ji(Me,hn){Me.side===Y?oi(t.CULL_FACE):Dn(t.CULL_FACE);let cn=Me.side===C;if(hn)cn=!cn;ss(cn),Me.blending===Mo&&Me.transparent===!1?Ei(mr):Ei(Me.blending,Me.blendEquation,Me.blendSrc,Me.blendDst,Me.blendEquationAlpha,Me.blendSrcAlpha,Me.blendDstAlpha,Me.blendColor,Me.blendAlpha,Me.premultipliedAlpha),d.setFunc(Me.depthFunc),d.setTest(Me.depthTest),d.setMask(Me.depthWrite),c.setMask(Me.colorWrite);let xn=Me.stencilWrite;if(p.setTest(xn),xn)p.setMask(Me.stencilWriteMask),p.setFunc(Me.stencilFunc,Me.stencilRef,Me.stencilFuncMask),p.setOp(Me.stencilFail,Me.stencilZFail,Me.stencilZPass);ts(Me.polygonOffset,Me.polygonOffsetFactor,Me.polygonOffsetUnits),Me.alphaToCoverage===!0?Dn(t.SAMPLE_ALPHA_TO_COVERAGE):oi(t.SAMPLE_ALPHA_TO_COVERAGE)}function ss(Me){if(Qt!==Me){if(Me)t.frontFace(t.CW);else t.frontFace(t.CCW);Qt=Me}}function wi(Me){if(Me!==Fu){if(Dn(t.CULL_FACE),Me!==me)if(Me===Xl)t.cullFace(t.BACK);else if(Me===Ou)t.cullFace(t.FRONT);else t.cullFace(t.FRONT_AND_BACK)}else oi(t.CULL_FACE);me=Me}function Gi(Me){if(Me!==Ee){if(tn)t.lineWidth(Me);Ee=Me}}function ts(Me,hn,cn){if(Me){if(Dn(t.POLYGON_OFFSET_FILL),jt!==hn||Ye!==cn){if(jt=hn,Ye=cn,d.getReversed())hn=-hn,cn=-cn;t.polygonOffset(hn,cn)}}else oi(t.POLYGON_OFFSET_FILL)}function es(Me){if(Me)Dn(t.SCISSOR_TEST);else oi(t.SCISSOR_TEST)}function us(Me){if(Me===void 0)Me=t.TEXTURE0+on-1;if(dn!==Me)t.activeTexture(Me),dn=Me}function we(Me,hn,cn){if(cn===void 0)if(dn===null)cn=t.TEXTURE0+on-1;else cn=dn;let xn=gn[cn];if(xn===void 0)xn={type:void 0,texture:void 0},gn[cn]=xn;if(xn.type!==Me||xn.texture!==hn){if(dn!==cn)t.activeTexture(cn),dn=cn;t.bindTexture(Me,hn||Wn[Me]),xn.type=Me,xn.texture=hn}}function fs(){let Me=gn[dn];if(Me!==void 0&&Me.type!==void 0)t.bindTexture(Me.type,null),Me.type=void 0,Me.texture=void 0}function fi(){try{t.compressedTexImage2D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function Ni(){try{t.compressedTexImage3D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function wn(){try{t.texSubImage2D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function vi(){try{t.texSubImage3D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function Xn(){try{t.compressedTexSubImage2D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function Jn(){try{t.compressedTexSubImage3D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function ki(){try{t.texStorage2D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function le(){try{t.texStorage3D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function qt(){try{t.texImage2D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function en(){try{t.texImage3D(...arguments)}catch(Me){qn("WebGLState:",Me)}}function mn(Me){if(D[Me]!==void 0)return D[Me];else return t.getParameter(Me)}function pn(Me,hn){if(D[Me]!==hn)t.pixelStorei(Me,hn),D[Me]=hn}function Sn(Me){if(_n.equals(Me)===!1)t.scissor(Me.x,Me.y,Me.z,Me.w),_n.copy(Me)}function Tn(Me){if(Ln.equals(Me)===!1)t.viewport(Me.x,Me.y,Me.z,Me.w),Ln.copy(Me)}function an(Me,hn){let cn=E.get(hn);if(cn===void 0)cn=new WeakMap,E.set(hn,cn);let xn=cn.get(Me);if(xn===void 0)xn=t.getUniformBlockIndex(hn,Me.name),t.uniformBlockBinding(hn,xn,xn),cn.set(Me,xn)}function un(Me,hn,cn){let vn=E.get(hn).get(Me);if(S[vn]!==cn)t.bindBufferBase(t.UNIFORM_BUFFER,vn,cn),S[vn]=cn}function Mn(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),d.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),N={},D={},dn=null,gn={},L={},S={},tt=new WeakMap,vt=[],zt=null,nt=!1,yt=null,Dt=null,Ht=null,Ft=null,Xt=null,Jt=null,gt=null,Ot=new l(0,0,0),Kt=0,pe=!1,Qt=null,me=null,Ee=null,jt=null,Ye=null,_n.set(0,0,t.canvas.width,t.canvas.height),Ln.set(0,0,t.canvas.width,t.canvas.height),c.reset(),d.reset(),p.reset()}return{buffers:{color:c,depth:d,stencil:p},enable:Dn,disable:oi,bindFramebuffer:jn,drawBuffers:Kn,useProgram:ui,setBlending:Ei,setMaterial:ji,setFlipSided:ss,setCullFace:wi,setLineWidth:Gi,setPolygonOffset:ts,setScissorTest:es,activeTexture:us,bindTexture:we,unbindTexture:fs,compressedTexImage2D:fi,compressedTexImage3D:Ni,texImage2D:qt,texImage3D:en,pixelStorei:pn,getParameter:mn,updateUBOMapping:an,uniformBlockBinding:un,texStorage2D:ki,texStorage3D:le,texSubImage2D:wn,texSubImage3D:vi,compressedTexSubImage2D:Xn,compressedTexSubImage3D:Jn,scissor:Sn,viewport:Tn,reset:Mn}}function cy(t,e,i,s,a,c,d){let p=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,S=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),E=new o,N=new WeakMap,D=new Set,L,tt=new WeakMap,vt=new Set,zt=new FinalizationRegistry((le)=>vt.delete(le)),nt=!1;try{nt=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(le){}function yt(le,qt){return nt?new OffscreenCanvas(le,qt):Gr("canvas")}function Dt(le,qt,en){let mn=1,pn=ki(le);if(pn.width>en||pn.height>en)mn=en/Math.max(pn.width,pn.height);if(mn<1)if(typeof HTMLImageElement<"u"&&le instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&le instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&le instanceof ImageBitmap||typeof VideoFrame<"u"&&le instanceof VideoFrame){let Sn=Math.floor(mn*pn.width),Tn=Math.floor(mn*pn.height);if(L===void 0)L=yt(Sn,Tn);let an=qt?yt(Sn,Tn):L;return an.width=Sn,an.height=Tn,an.getContext("2d").drawImage(le,0,0,Sn,Tn),Gn("WebGLRenderer: Texture has been resized from ("+pn.width+"x"+pn.height+") to ("+Sn+"x"+Tn+")."),an}else{if("data"in le)Gn("WebGLRenderer: Image in DataTexture is too big ("+pn.width+"x"+pn.height+").");return le}return le}function Ht(le){return le.generateMipmaps}function Ft(le){t.generateMipmap(le)}function Xt(le){if(le.isWebGLCubeRenderTarget)return t.TEXTURE_CUBE_MAP;if(le.isWebGL3DRenderTarget)return t.TEXTURE_3D;if(le.isWebGLArrayRenderTarget||le.isCompressedArrayTexture)return t.TEXTURE_2D_ARRAY;return t.TEXTURE_2D}function Jt(le,qt,en,mn,pn,Sn=!1){if(le!==null){if(t[le]!==void 0)return t[le];Gn("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+le+"'")}let Tn;if(mn){if(Tn=e.get("EXT_texture_norm16"),!Tn)Gn("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let an=qt;if(qt===t.RED){if(en===t.FLOAT)an=t.R32F;if(en===t.HALF_FLOAT)an=t.R16F;if(en===t.UNSIGNED_BYTE)an=t.R8;if(en===t.UNSIGNED_SHORT&&Tn)an=Tn.R16_EXT;if(en===t.SHORT&&Tn)an=Tn.R16_SNORM_EXT}if(qt===t.RED_INTEGER){if(en===t.UNSIGNED_BYTE)an=t.R8UI;if(en===t.UNSIGNED_SHORT)an=t.R16UI;if(en===t.UNSIGNED_INT)an=t.R32UI;if(en===t.BYTE)an=t.R8I;if(en===t.SHORT)an=t.R16I;if(en===t.INT)an=t.R32I}if(qt===t.RG){if(en===t.FLOAT)an=t.RG32F;if(en===t.HALF_FLOAT)an=t.RG16F;if(en===t.UNSIGNED_BYTE)an=t.RG8;if(en===t.UNSIGNED_SHORT&&Tn)an=Tn.RG16_EXT;if(en===t.SHORT&&Tn)an=Tn.RG16_SNORM_EXT}if(qt===t.RG_INTEGER){if(en===t.UNSIGNED_BYTE)an=t.RG8UI;if(en===t.UNSIGNED_SHORT)an=t.RG16UI;if(en===t.UNSIGNED_INT)an=t.RG32UI;if(en===t.BYTE)an=t.RG8I;if(en===t.SHORT)an=t.RG16I;if(en===t.INT)an=t.RG32I}if(qt===t.RGB_INTEGER){if(en===t.UNSIGNED_BYTE)an=t.RGB8UI;if(en===t.UNSIGNED_SHORT)an=t.RGB16UI;if(en===t.UNSIGNED_INT)an=t.RGB32UI;if(en===t.BYTE)an=t.RGB8I;if(en===t.SHORT)an=t.RGB16I;if(en===t.INT)an=t.RGB32I}if(qt===t.RGBA_INTEGER){if(en===t.UNSIGNED_BYTE)an=t.RGBA8UI;if(en===t.UNSIGNED_SHORT)an=t.RGBA16UI;if(en===t.UNSIGNED_INT)an=t.RGBA32UI;if(en===t.BYTE)an=t.RGBA8I;if(en===t.SHORT)an=t.RGBA16I;if(en===t.INT)an=t.RGBA32I}if(qt===t.RGB){if(en===t.UNSIGNED_SHORT&&Tn)an=Tn.RGB16_EXT;if(en===t.SHORT&&Tn)an=Tn.RGB16_SNORM_EXT;if(en===t.UNSIGNED_INT_5_9_9_9_REV)an=t.RGB9_E5;if(en===t.UNSIGNED_INT_10F_11F_11F_REV)an=t.R11F_G11F_B10F}if(qt===t.RGBA){let un=Sn?Dc:m.getTransfer(pn);if(en===t.FLOAT)an=t.RGBA32F;if(en===t.HALF_FLOAT)an=t.RGBA16F;if(en===t.UNSIGNED_BYTE)an=un===_i?t.SRGB8_ALPHA8:t.RGBA8;if(en===t.UNSIGNED_SHORT&&Tn)an=Tn.RGBA16_EXT;if(en===t.SHORT&&Tn)an=Tn.RGBA16_SNORM_EXT;if(en===t.UNSIGNED_SHORT_4_4_4_4)an=t.RGBA4;if(en===t.UNSIGNED_SHORT_5_5_5_1)an=t.RGB5_A1}if(an===t.R16F||an===t.R32F||an===t.RG16F||an===t.RG32F||an===t.RGBA16F||an===t.RGBA32F)e.get("EXT_color_buffer_float");return an}function gt(le,qt){let en;if(le){if(qt===null||qt===Js||qt===gr)en=t.DEPTH24_STENCIL8;else if(qt===Gs)en=t.DEPTH32F_STENCIL8;else if(qt===To)en=t.DEPTH24_STENCIL8,Gn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(qt===null||qt===Js||qt===gr)en=t.DEPTH_COMPONENT24;else if(qt===Gs)en=t.DEPTH_COMPONENT32F;else if(qt===To)en=t.DEPTH_COMPONENT16;return en}function Ot(le,qt){if(Ht(le)===!0||le.isFramebufferTexture&&le.minFilter!==G&&le.minFilter!==A)return Math.log2(Math.max(qt.width,qt.height))+1;else if(le.mipmaps.length>0)return le.mipmaps.length;else if(le.isCompressedTexture&&Array.isArray(le.image))return qt.mipmaps.length;else return 1}function Kt(le){let qt=new WeakRef(le);s.get(le).__ref=qt,vt.add(qt),zt.register(le,qt,qt)}function pe(le){let qt=s.get(le).__ref;if(qt===void 0)return;vt.delete(qt),zt.unregister(qt)}function Qt(le){Ee(le.target)}function me(le){jt(le.target)}function Ee(le){if(le.removeEventListener("dispose",Qt),pe(le),on(le),le.isVideoTexture)N.delete(le);if(le.isHTMLTexture)D.delete(le)}function jt(le){le.removeEventListener("dispose",me),pe(le),yn(le)}function Ye(){for(let le of vt){let qt=le.deref();if(qt===void 0)continue;if(qt.isRenderTarget===!0)jt(qt);else Ee(qt)}vt.clear(),D.clear()}function on(le){let qt=s.get(le);if(qt.__webglInit===void 0)return;let en=le.source,mn=tt.get(en);if(mn){let pn=mn[qt.__cacheKey];if(pn.usedTimes--,pn.usedTimes===0)tn(le);if(Object.keys(mn).length===0)tt.delete(en)}s.remove(le)}function tn(le){let qt=s.get(le);t.deleteTexture(qt.__webglTexture);let en=le.source,mn=tt.get(en);delete mn[qt.__cacheKey],d.memory.textures--}function yn(le){let qt=s.get(le);if(qt.__depthDisposeCallback)qt.__depthDisposeCallback();let en=le.depthTexture;if(en&&en.renderTarget===le)Ee(en);if(le.isWebGLCubeRenderTarget)for(let pn=0;pn<6;pn++){if(Array.isArray(qt.__webglFramebuffer[pn]))for(let Sn=0;Sn<qt.__webglFramebuffer[pn].length;Sn++)t.deleteFramebuffer(qt.__webglFramebuffer[pn][Sn]);else t.deleteFramebuffer(qt.__webglFramebuffer[pn]);if(qt.__webglDepthbuffer)t.deleteRenderbuffer(qt.__webglDepthbuffer[pn])}else{if(Array.isArray(qt.__webglFramebuffer))for(let pn=0;pn<qt.__webglFramebuffer.length;pn++)t.deleteFramebuffer(qt.__webglFramebuffer[pn]);else t.deleteFramebuffer(qt.__webglFramebuffer);if(qt.__webglDepthbuffer)t.deleteRenderbuffer(qt.__webglDepthbuffer);if(qt.__webglMultisampledFramebuffer)t.deleteFramebuffer(qt.__webglMultisampledFramebuffer);if(qt.__webglColorRenderbuffer){for(let pn=0;pn<qt.__webglColorRenderbuffer.length;pn++)if(qt.__webglColorRenderbuffer[pn])t.deleteRenderbuffer(qt.__webglColorRenderbuffer[pn])}if(qt.__webglDepthRenderbuffer)t.deleteRenderbuffer(qt.__webglDepthRenderbuffer)}let mn=le.textures;for(let pn=0,Sn=mn.length;pn<Sn;pn++){let Tn=s.get(mn[pn]);if(Tn.__webglTexture)t.deleteTexture(Tn.__webglTexture),d.memory.textures--;s.remove(mn[pn])}s.remove(le)}let ln=0;function dn(){ln=0}function gn(){return ln}function Nn(le){ln=le}function fn(){let le=ln;if(le>=a.maxTextures)Gn("WebGLTextures: Trying to use "+(le+1)+" texture units while this GPU supports only "+a.maxTextures);return ln+=1,le}function _n(le){let qt=[];return qt.push(le.wrapS),qt.push(le.wrapT),qt.push(le.wrapR||0),qt.push(le.magFilter),qt.push(le.minFilter),qt.push(le.anisotropy),qt.push(le.internalFormat),qt.push(le.format),qt.push(le.type),qt.push(le.generateMipmaps),qt.push(le.mipmapsAutoUpdate),qt.push(le.premultiplyAlpha),qt.push(le.flipY),qt.push(le.unpackAlignment),qt.push(le.colorSpace),qt.join()}function Ln(le,qt){let en=s.get(le);if(le.isVideoTexture)Xn(le);if(le.isRenderTargetTexture===!1&&le.isExternalTexture!==!0&&le.version>0&&en.__version!==le.version){let mn=le.image;if(mn===null)Gn("WebGLRenderer: Texture marked for update but no image data found.");else if(mn.complete===!1)Gn("WebGLRenderer: Texture marked for update but image is incomplete");else{ji(en,le,qt);return}}else if(le.isExternalTexture)en.__webglTexture=le.sourceTexture?le.sourceTexture:null;i.bindTexture(t.TEXTURE_2D,en.__webglTexture,t.TEXTURE0+qt)}function Hn(le,qt){let en=s.get(le);if(le.isRenderTargetTexture===!1&&le.version>0&&en.__version!==le.version){ji(en,le,qt);return}else if(le.isExternalTexture)en.__webglTexture=le.sourceTexture?le.sourceTexture:null;i.bindTexture(t.TEXTURE_2D_ARRAY,en.__webglTexture,t.TEXTURE0+qt)}function Wn(le,qt){let en=s.get(le);if(le.isRenderTargetTexture===!1&&le.version>0&&en.__version!==le.version){ji(en,le,qt);return}i.bindTexture(t.TEXTURE_3D,en.__webglTexture,t.TEXTURE0+qt)}function Dn(le,qt){let en=s.get(le);if(le.version>0&&en.__version!==le.version){ss(en,le,qt);return}i.bindTexture(t.TEXTURE_CUBE_MAP,en.__webglTexture,t.TEXTURE0+qt)}let oi={[ce]:t.REPEAT,[Ue]:t.CLAMP_TO_EDGE,[St]:t.MIRRORED_REPEAT},jn={[G]:t.NEAREST,[Tt]:t.NEAREST_MIPMAP_NEAREST,[ke]:t.NEAREST_MIPMAP_LINEAR,[A]:t.LINEAR,[Ge]:t.LINEAR_MIPMAP_NEAREST,[F]:t.LINEAR_MIPMAP_LINEAR},Kn={[Sf]:t.NEVER,[Oc]:t.ALWAYS,[Mf]:t.LESS,[Uc]:t.LEQUAL,[bf]:t.EQUAL,[Fc]:t.GEQUAL,[Tf]:t.GREATER,[Af]:t.NOTEQUAL};function ui(le,qt){if(qt.type===Gs&&e.has("OES_texture_float_linear")===!1&&(qt.magFilter===A||qt.magFilter===Ge||qt.magFilter===ke||qt.magFilter===F||qt.minFilter===A||qt.minFilter===Ge||qt.minFilter===ke||qt.minFilter===F))Gn("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(t.texParameteri(le,t.TEXTURE_WRAP_S,oi[qt.wrapS]),t.texParameteri(le,t.TEXTURE_WRAP_T,oi[qt.wrapT]),le===t.TEXTURE_3D||le===t.TEXTURE_2D_ARRAY)t.texParameteri(le,t.TEXTURE_WRAP_R,oi[qt.wrapR]);if(t.texParameteri(le,t.TEXTURE_MAG_FILTER,jn[qt.magFilter]),t.texParameteri(le,t.TEXTURE_MIN_FILTER,jn[qt.minFilter]),qt.compareFunction)t.texParameteri(le,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(le,t.TEXTURE_COMPARE_FUNC,Kn[qt.compareFunction]);if(e.has("EXT_texture_filter_anisotropic")===!0){if(qt.magFilter===G)return;if(qt.minFilter!==ke&&qt.minFilter!==F)return;if(qt.type===Gs&&e.has("OES_texture_float_linear")===!1)return;if(qt.anisotropy>1||s.get(qt).__currentAnisotropy){let en=e.get("EXT_texture_filter_anisotropic");t.texParameterf(le,en.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(qt.anisotropy,a.getMaxAnisotropy())),s.get(qt).__currentAnisotropy=qt.anisotropy}}}function ii(le,qt){let en=!1;if(le.__webglInit===void 0)le.__webglInit=!0,qt.addEventListener("dispose",Qt),Kt(qt);let mn=qt.source,pn=tt.get(mn);if(pn===void 0)pn={},tt.set(mn,pn);let Sn=_n(qt);if(Sn!==le.__cacheKey){if(pn[Sn]===void 0)pn[Sn]={texture:t.createTexture(),usedTimes:0},d.memory.textures++,en=!0;pn[Sn].usedTimes++;let Tn=pn[le.__cacheKey];if(Tn!==void 0){if(pn[le.__cacheKey].usedTimes--,Tn.usedTimes===0)tn(qt)}le.__cacheKey=Sn,le.__webglTexture=pn[Sn].texture}return en}function Ti(le,qt,en){return Math.floor(Math.floor(le/en)/qt)}function Ei(le,qt,en,mn){let Sn=le.updateRanges;if(Sn.length===0)i.texSubImage2D(t.TEXTURE_2D,0,0,0,qt.width,qt.height,en,mn,qt.data);else{Sn.sort((Me,hn)=>Me.start-hn.start);let Tn=0;for(let Me=1;Me<Sn.length;Me++){let hn=Sn[Tn],cn=Sn[Me],xn=hn.start+hn.count,vn=Ti(cn.start,qt.width,4),En=Ti(hn.start,qt.width,4);if(cn.start<=xn+1&&vn===En&&Ti(cn.start+cn.count-1,qt.width,4)===vn)hn.count=Math.max(hn.count,cn.start+cn.count-hn.start);else++Tn,Sn[Tn]=cn}Sn.length=Tn+1;let an=i.getParameter(t.UNPACK_ROW_LENGTH),un=i.getParameter(t.UNPACK_SKIP_PIXELS),Mn=i.getParameter(t.UNPACK_SKIP_ROWS);i.pixelStorei(t.UNPACK_ROW_LENGTH,qt.width);for(let Me=0,hn=Sn.length;Me<hn;Me++){let cn=Sn[Me],xn=Math.floor(cn.start/4),vn=Math.ceil(cn.count/4),En=xn%qt.width,kn=Math.floor(xn/qt.width),zn=vn,Cn=1;i.pixelStorei(t.UNPACK_SKIP_PIXELS,En),i.pixelStorei(t.UNPACK_SKIP_ROWS,kn),i.texSubImage2D(t.TEXTURE_2D,0,En,kn,zn,1,en,mn,qt.data)}le.clearUpdateRanges(),i.pixelStorei(t.UNPACK_ROW_LENGTH,an),i.pixelStorei(t.UNPACK_SKIP_PIXELS,un),i.pixelStorei(t.UNPACK_SKIP_ROWS,Mn)}}function ji(le,qt,en){let mn=t.TEXTURE_2D;if(qt.isDataArrayTexture||qt.isCompressedArrayTexture)mn=t.TEXTURE_2D_ARRAY;if(qt.isData3DTexture)mn=t.TEXTURE_3D;let pn=ii(le,qt),Sn=qt.source;i.bindTexture(mn,le.__webglTexture,t.TEXTURE0+en);let Tn=s.get(Sn);if(Sn.version!==Tn.__version||pn===!0){if(i.activeTexture(t.TEXTURE0+en),(typeof ImageBitmap<"u"&&qt.image instanceof ImageBitmap)===!1){let Cn=m.getPrimaries(m.workingColorSpace),Vn=qt.colorSpace===ge?null:m.getPrimaries(qt.colorSpace),Qn=qt.colorSpace===ge||Cn===Vn?t.NONE:t.BROWSER_DEFAULT_WEBGL;i.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,qt.flipY),i.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,qt.premultiplyAlpha),i.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Qn)}i.pixelStorei(t.UNPACK_ALIGNMENT,qt.unpackAlignment);let un=Dt(qt.image,!1,a.maxTextureSize);un=Jn(qt,un);let Mn=c.convert(qt.format,qt.colorSpace),Me=c.convert(qt.type),hn=Jt(qt.internalFormat,Mn,Me,qt.normalized,qt.colorSpace,qt.isVideoTexture);ui(mn,qt);let cn,xn=qt.mipmaps,vn=qt.isVideoTexture!==!0,En=Tn.__version===void 0||pn===!0,kn=Sn.dataReady,zn=Ot(qt,un);if(qt.isDepthTexture){if(hn=gt(qt.format===$s,qt.type),En)if(vn)i.texStorage2D(t.TEXTURE_2D,1,hn,un.width,un.height);else i.texImage2D(t.TEXTURE_2D,0,hn,un.width,un.height,0,Mn,Me,null)}else if(qt.isDataTexture)if(xn.length>0){if(vn&&En)i.texStorage2D(t.TEXTURE_2D,zn,hn,xn[0].width,xn[0].height);for(let Cn=0,Vn=xn.length;Cn<Vn;Cn++)if(cn=xn[Cn],vn){if(kn)i.texSubImage2D(t.TEXTURE_2D,Cn,0,0,cn.width,cn.height,Mn,Me,cn.data)}else i.texImage2D(t.TEXTURE_2D,Cn,hn,cn.width,cn.height,0,Mn,Me,cn.data);qt.generateMipmaps=!1}else if(vn){if(En)i.texStorage2D(t.TEXTURE_2D,zn,hn,un.width,un.height);if(kn)Ei(qt,un,Mn,Me)}else i.texImage2D(t.TEXTURE_2D,0,hn,un.width,un.height,0,Mn,Me,un.data);else if(qt.isCompressedTexture)if(qt.isCompressedArrayTexture){if(vn&&En)i.texStorage3D(t.TEXTURE_2D_ARRAY,zn,hn,xn[0].width,xn[0].height,un.depth);for(let Cn=0,Vn=xn.length;Cn<Vn;Cn++)if(cn=xn[Cn],qt.format!==V)if(Mn!==null)if(vn){if(kn)if(qt.layerUpdates.size>0){let Qn=ah(cn.width,cn.height,qt.format,qt.type);for(let In of qt.layerUpdates){let di=cn.data.subarray(In*Qn/cn.data.BYTES_PER_ELEMENT,(In+1)*Qn/cn.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Cn,0,0,In,cn.width,cn.height,1,Mn,di)}}else i.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,Cn,0,0,0,cn.width,cn.height,un.depth,Mn,cn.data)}else i.compressedTexImage3D(t.TEXTURE_2D_ARRAY,Cn,hn,cn.width,cn.height,un.depth,0,cn.data,0,0);else Gn("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vn){if(kn)i.texSubImage3D(t.TEXTURE_2D_ARRAY,Cn,0,0,0,cn.width,cn.height,un.depth,Mn,Me,cn.data)}else i.texImage3D(t.TEXTURE_2D_ARRAY,Cn,hn,cn.width,cn.height,un.depth,0,Mn,Me,cn.data);if(qt.layerUpdates.size>0)qt.clearLayerUpdates()}else{if(vn&&En)i.texStorage2D(t.TEXTURE_2D,zn,hn,xn[0].width,xn[0].height);for(let Cn=0,Vn=xn.length;Cn<Vn;Cn++)if(cn=xn[Cn],qt.format!==V)if(Mn!==null)if(vn){if(kn)i.compressedTexSubImage2D(t.TEXTURE_2D,Cn,0,0,cn.width,cn.height,Mn,cn.data)}else i.compressedTexImage2D(t.TEXTURE_2D,Cn,hn,cn.width,cn.height,0,cn.data);else Gn("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vn){if(kn)i.texSubImage2D(t.TEXTURE_2D,Cn,0,0,cn.width,cn.height,Mn,Me,cn.data)}else i.texImage2D(t.TEXTURE_2D,Cn,hn,cn.width,cn.height,0,Mn,Me,cn.data)}else if(qt.isDataArrayTexture)if(vn){if(En)i.texStorage3D(t.TEXTURE_2D_ARRAY,zn,hn,un.width,un.height,un.depth);if(kn)if(qt.layerUpdates.size>0){let Cn=ah(un.width,un.height,qt.format,qt.type);for(let Vn of qt.layerUpdates){let Qn=un.data.subarray(Vn*Cn/un.data.BYTES_PER_ELEMENT,(Vn+1)*Cn/un.data.BYTES_PER_ELEMENT);i.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Vn,un.width,un.height,1,Mn,Me,Qn)}qt.clearLayerUpdates()}else i.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,un.width,un.height,un.depth,Mn,Me,un.data)}else i.texImage3D(t.TEXTURE_2D_ARRAY,0,hn,un.width,un.height,un.depth,0,Mn,Me,un.data);else if(qt.isData3DTexture)if(vn){if(En)i.texStorage3D(t.TEXTURE_3D,zn,hn,un.width,un.height,un.depth);if(kn)i.texSubImage3D(t.TEXTURE_3D,0,0,0,0,un.width,un.height,un.depth,Mn,Me,un.data)}else i.texImage3D(t.TEXTURE_3D,0,hn,un.width,un.height,un.depth,0,Mn,Me,un.data);else if(qt.isFramebufferTexture){if(En)if(vn)i.texStorage2D(t.TEXTURE_2D,zn,hn,un.width,un.height);else{let Cn=un.width,Vn=un.height;for(let Qn=0;Qn<zn;Qn++)i.texImage2D(t.TEXTURE_2D,Qn,hn,Cn,Vn,0,Mn,Me,null),Cn>>=1,Vn>>=1}}else if(qt.isHTMLTexture){if("texElementImage2D"in t){let Cn=t.canvas;if(!Cn.hasAttribute("layoutsubtree"))Cn.setAttribute("layoutsubtree","true");if(un.parentNode!==Cn){Cn.appendChild(un),D.add(qt),Cn.onpaint=(Vn)=>{let Qn=Vn.changedElements;for(let In of D)if(Qn.includes(In.image))In.needsUpdate=!0},Cn.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,un);else{let{RGBA:Qn,RGBA:In,UNSIGNED_BYTE:di}=t;t.texElementImage2D(t.TEXTURE_2D,0,Qn,In,di,un)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(xn.length>0){if(vn&&En){let Cn=ki(xn[0]);i.texStorage2D(t.TEXTURE_2D,zn,hn,Cn.width,Cn.height)}for(let Cn=0,Vn=xn.length;Cn<Vn;Cn++)if(cn=xn[Cn],vn){if(kn)i.texSubImage2D(t.TEXTURE_2D,Cn,0,0,Mn,Me,cn)}else i.texImage2D(t.TEXTURE_2D,Cn,hn,Mn,Me,cn);qt.generateMipmaps=!1}else if(vn){if(En){let Cn=ki(un);i.texStorage2D(t.TEXTURE_2D,zn,hn,Cn.width,Cn.height)}if(kn)i.texSubImage2D(t.TEXTURE_2D,0,0,0,Mn,Me,un)}else i.texImage2D(t.TEXTURE_2D,0,hn,Mn,Me,un);if(Ht(qt)&&qt.mipmapsAutoUpdate===!0)Ft(mn);if(Tn.__version=Sn.version,qt.onUpdate)qt.onUpdate(qt)}le.__version=qt.version}function ss(le,qt,en){if(qt.image.length!==6)return;let mn=ii(le,qt),pn=qt.source;i.bindTexture(t.TEXTURE_CUBE_MAP,le.__webglTexture,t.TEXTURE0+en);let Sn=s.get(pn);if(pn.version!==Sn.__version||mn===!0){i.activeTexture(t.TEXTURE0+en);let Tn=m.getPrimaries(m.workingColorSpace),an=qt.colorSpace===ge?null:m.getPrimaries(qt.colorSpace),un=qt.colorSpace===ge||Tn===an?t.NONE:t.BROWSER_DEFAULT_WEBGL;i.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,qt.flipY),i.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,qt.premultiplyAlpha),i.pixelStorei(t.UNPACK_ALIGNMENT,qt.unpackAlignment),i.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,un);let Mn=qt.isCompressedTexture||qt.image[0].isCompressedTexture,Me=qt.image[0]&&qt.image[0].isDataTexture,hn=[];for(let In=0;In<6;In++){if(!Mn&&!Me)hn[In]=Dt(qt.image[In],!0,a.maxCubemapSize);else hn[In]=Me?qt.image[In].image:qt.image[In];hn[In]=Jn(qt,hn[In])}let cn=hn[0],xn=c.convert(qt.format,qt.colorSpace),vn=c.convert(qt.type),En=Jt(qt.internalFormat,xn,vn,qt.normalized,qt.colorSpace),kn=qt.isVideoTexture!==!0,zn=Sn.__version===void 0||mn===!0,Cn=pn.dataReady,Vn=Ot(qt,cn);ui(t.TEXTURE_CUBE_MAP,qt);let Qn;if(qt.isDepthTexture){if(En=gt(qt.format===$s,qt.type),zn)if(kn)i.texStorage2D(t.TEXTURE_CUBE_MAP,1,En,cn.width,cn.height);else for(let In=0;In<6;In++)i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,0,En,cn.width,cn.height,0,xn,vn,null)}else if(Mn){if(kn&&zn)i.texStorage2D(t.TEXTURE_CUBE_MAP,Vn,En,cn.width,cn.height);for(let In=0;In<6;In++){Qn=hn[In].mipmaps;for(let di=0;di<Qn.length;di++){let Di=Qn[di];if(qt.format!==V)if(xn!==null)if(kn){if(Cn)i.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di,0,0,Di.width,Di.height,xn,Di.data)}else i.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di,En,Di.width,Di.height,0,Di.data);else Gn("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(kn){if(Cn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di,0,0,Di.width,Di.height,xn,vn,Di.data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di,En,Di.width,Di.height,0,xn,vn,Di.data)}}}else{if(Qn=qt.mipmaps,kn&&zn){if(Qn.length>0)Vn++;let In=ki(hn[0]);i.texStorage2D(t.TEXTURE_CUBE_MAP,Vn,En,In.width,In.height)}for(let In=0;In<6;In++)if(Me){if(kn){if(Cn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,0,0,0,hn[In].width,hn[In].height,xn,vn,hn[In].data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,0,En,hn[In].width,hn[In].height,0,xn,vn,hn[In].data);for(let di=0;di<Qn.length;di++){let Ps=Qn[di].image[In].image;if(kn){if(Cn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di+1,0,0,Ps.width,Ps.height,xn,vn,Ps.data)}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di+1,En,Ps.width,Ps.height,0,xn,vn,Ps.data)}}else{if(kn){if(Cn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,0,0,0,xn,vn,hn[In])}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,0,En,xn,vn,hn[In]);for(let di=0;di<Qn.length;di++){let Di=Qn[di];if(kn){if(Cn)i.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di+1,0,0,xn,vn,Di.image[In])}else i.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+In,di+1,En,xn,vn,Di.image[In])}}}if(Ht(qt)&&qt.mipmapsAutoUpdate===!0)Ft(t.TEXTURE_CUBE_MAP);if(Sn.__version=pn.version,qt.onUpdate)qt.onUpdate(qt)}le.__version=qt.version}function wi(le,qt,en,mn,pn,Sn){let Tn=c.convert(en.format,en.colorSpace),an=c.convert(en.type),un=Jt(en.internalFormat,Tn,an,en.normalized,en.colorSpace),Mn=s.get(qt),Me=s.get(en);if(Me.__renderTarget=qt,!Mn.__hasExternalTextures){let hn=Math.max(1,qt.width>>Sn),cn=Math.max(1,qt.height>>Sn);if(pn===t.TEXTURE_3D||pn===t.TEXTURE_2D_ARRAY)i.texImage3D(pn,Sn,un,hn,cn,qt.depth,0,Tn,an,null);else i.texImage2D(pn,Sn,un,hn,cn,0,Tn,an,null)}if(i.bindFramebuffer(t.FRAMEBUFFER,le),vi(qt))p.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,mn,pn,Me.__webglTexture,0,wn(qt));else if(pn===t.TEXTURE_2D||pn>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&pn<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)t.framebufferTexture2D(t.FRAMEBUFFER,mn,pn,Me.__webglTexture,Sn);i.bindFramebuffer(t.FRAMEBUFFER,null)}function Gi(le,qt,en){if(t.bindRenderbuffer(t.RENDERBUFFER,le),qt.depthBuffer){let mn=qt.depthTexture,pn=mn&&mn.isDepthTexture?mn.type:null,Sn=gt(qt.stencilBuffer,pn),Tn=qt.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(vi(qt))p.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,wn(qt),Sn,qt.width,qt.height);else if(en)t.renderbufferStorageMultisample(t.RENDERBUFFER,wn(qt),Sn,qt.width,qt.height);else t.renderbufferStorage(t.RENDERBUFFER,Sn,qt.width,qt.height);t.framebufferRenderbuffer(t.FRAMEBUFFER,Tn,t.RENDERBUFFER,le)}else{let mn=qt.textures;for(let pn=0;pn<mn.length;pn++){let Sn=mn[pn],Tn=c.convert(Sn.format,Sn.colorSpace),an=c.convert(Sn.type),un=Jt(Sn.internalFormat,Tn,an,Sn.normalized,Sn.colorSpace);if(vi(qt))p.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,wn(qt),un,qt.width,qt.height);else if(en)t.renderbufferStorageMultisample(t.RENDERBUFFER,wn(qt),un,qt.width,qt.height);else t.renderbufferStorage(t.RENDERBUFFER,un,qt.width,qt.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function ts(le,qt,en){let mn=qt.isWebGLCubeRenderTarget===!0;if(i.bindFramebuffer(t.FRAMEBUFFER,le),!(qt.depthTexture&&qt.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let pn=s.get(qt.depthTexture);pn.__renderTarget=qt;let Sn=mn?qt.depthTexture.image[0]:qt.depthTexture.image;if(!pn.__webglTexture||Sn.width!==qt.width||Sn.height!==qt.height)Sn.width=qt.width,Sn.height=qt.height,qt.depthTexture.needsUpdate=!0;if(mn)Dn(qt.depthTexture,0);else Ln(qt.depthTexture,0);let Tn=pn.__webglTexture,an=wn(qt),un=mn?t.TEXTURE_CUBE_MAP_POSITIVE_X+en:t.TEXTURE_2D,Mn=qt.depthTexture.format===$s?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(qt.depthTexture.format===Wr)if(vi(qt))p.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Mn,un,Tn,0,an);else t.framebufferTexture2D(t.FRAMEBUFFER,Mn,un,Tn,0);else if(qt.depthTexture.format===$s)if(vi(qt))p.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,Mn,un,Tn,0,an);else t.framebufferTexture2D(t.FRAMEBUFFER,Mn,un,Tn,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function es(le){let qt=s.get(le),en=le.isWebGLCubeRenderTarget===!0;if(qt.__boundDepthTexture!==le.depthTexture){let mn=le.depthTexture;if(qt.__depthDisposeCallback)qt.__depthDisposeCallback();if(mn){let pn=()=>{delete qt.__boundDepthTexture,delete qt.__depthDisposeCallback,mn.removeEventListener("dispose",pn)};mn.addEventListener("dispose",pn),qt.__depthDisposeCallback=pn}qt.__boundDepthTexture=mn}if(le.depthTexture&&!qt.__autoAllocateDepthBuffer)if(en)for(let mn=0;mn<6;mn++)ts(qt.__webglFramebuffer[mn],le,mn);else if(le.texture.mipmaps.length>0)ts(qt.__webglFramebuffer[0],le,0);else ts(qt.__webglFramebuffer,le,0);else if(en){qt.__webglDepthbuffer=[];for(let mn=0;mn<6;mn++)if(i.bindFramebuffer(t.FRAMEBUFFER,qt.__webglFramebuffer[mn]),qt.__webglDepthbuffer[mn]===void 0)qt.__webglDepthbuffer[mn]=t.createRenderbuffer(),Gi(qt.__webglDepthbuffer[mn],le,!1);else{let pn=le.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Sn=qt.__webglDepthbuffer[mn];t.bindRenderbuffer(t.RENDERBUFFER,Sn),t.framebufferRenderbuffer(t.FRAMEBUFFER,pn,t.RENDERBUFFER,Sn)}}else{if(le.texture.mipmaps.length>0)i.bindFramebuffer(t.FRAMEBUFFER,qt.__webglFramebuffer[0]);else i.bindFramebuffer(t.FRAMEBUFFER,qt.__webglFramebuffer);if(qt.__webglDepthbuffer===void 0)qt.__webglDepthbuffer=t.createRenderbuffer(),Gi(qt.__webglDepthbuffer,le,!1);else{let pn=le.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Sn=qt.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,Sn),t.framebufferRenderbuffer(t.FRAMEBUFFER,pn,t.RENDERBUFFER,Sn)}}i.bindFramebuffer(t.FRAMEBUFFER,null)}function us(le,qt,en){let mn=s.get(le);if(qt!==void 0)wi(mn.__webglFramebuffer,le,le.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0);if(en!==void 0)es(le)}function we(le){let qt=le.texture,en=s.get(le),mn=s.get(qt);le.addEventListener("dispose",me),Kt(le);let pn=le.textures,Sn=le.isWebGLCubeRenderTarget===!0,Tn=pn.length>1;if(!Tn){if(mn.__webglTexture===void 0)mn.__webglTexture=t.createTexture();mn.__version=qt.version,d.memory.textures++}if(Sn){en.__webglFramebuffer=[];for(let an=0;an<6;an++)if(qt.mipmaps.length>0){en.__webglFramebuffer[an]=[];for(let un=0;un<qt.mipmaps.length;un++)en.__webglFramebuffer[an][un]=t.createFramebuffer()}else en.__webglFramebuffer[an]=t.createFramebuffer()}else{if(qt.mipmaps.length>0){en.__webglFramebuffer=[];for(let an=0;an<qt.mipmaps.length;an++)en.__webglFramebuffer[an]=t.createFramebuffer()}else en.__webglFramebuffer=t.createFramebuffer();if(Tn)for(let an=0,un=pn.length;an<un;an++){let Mn=s.get(pn[an]);if(Mn.__webglTexture===void 0)Mn.__webglTexture=t.createTexture(),d.memory.textures++}if(le.samples>0&&vi(le)===!1){en.__webglMultisampledFramebuffer=t.createFramebuffer(),en.__webglColorRenderbuffer=[],i.bindFramebuffer(t.FRAMEBUFFER,en.__webglMultisampledFramebuffer);for(let an=0;an<pn.length;an++){let un=pn[an];en.__webglColorRenderbuffer[an]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,en.__webglColorRenderbuffer[an]);let Mn=c.convert(un.format,un.colorSpace),Me=c.convert(un.type),hn=Jt(un.internalFormat,Mn,Me,un.normalized,un.colorSpace,le.isXRRenderTarget===!0),cn=wn(le);t.renderbufferStorageMultisample(t.RENDERBUFFER,cn,hn,le.width,le.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+an,t.RENDERBUFFER,en.__webglColorRenderbuffer[an])}if(t.bindRenderbuffer(t.RENDERBUFFER,null),le.depthBuffer)en.__webglDepthRenderbuffer=t.createRenderbuffer(),Gi(en.__webglDepthRenderbuffer,le,!0);i.bindFramebuffer(t.FRAMEBUFFER,null)}}if(Sn){i.bindTexture(t.TEXTURE_CUBE_MAP,mn.__webglTexture),ui(t.TEXTURE_CUBE_MAP,qt);for(let an=0;an<6;an++)if(qt.mipmaps.length>0)for(let un=0;un<qt.mipmaps.length;un++)wi(en.__webglFramebuffer[an][un],le,qt,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+an,un);else wi(en.__webglFramebuffer[an],le,qt,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+an,0);if(Ht(qt))Ft(t.TEXTURE_CUBE_MAP);else if(qt.mipmaps.length>0)t.texParameteri(t.TEXTURE_CUBE_MAP,t.TEXTURE_MAX_LEVEL,qt.mipmaps.length-1);i.unbindTexture()}else if(Tn){for(let an=0,un=pn.length;an<un;an++){let Mn=pn[an],Me=s.get(Mn),hn=t.TEXTURE_2D;if(le.isWebGL3DRenderTarget||le.isWebGLArrayRenderTarget)hn=le.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(i.bindTexture(hn,Me.__webglTexture),ui(hn,Mn),wi(en.__webglFramebuffer,le,Mn,t.COLOR_ATTACHMENT0+an,hn,0),Ht(Mn))Ft(hn)}i.unbindTexture()}else{let an=t.TEXTURE_2D;if(le.isWebGL3DRenderTarget||le.isWebGLArrayRenderTarget)an=le.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(i.bindTexture(an,mn.__webglTexture),ui(an,qt),qt.mipmaps.length>0)for(let un=0;un<qt.mipmaps.length;un++)wi(en.__webglFramebuffer[un],le,qt,t.COLOR_ATTACHMENT0,an,un);else wi(en.__webglFramebuffer,le,qt,t.COLOR_ATTACHMENT0,an,0);if(Ht(qt))Ft(an);else if(qt.mipmaps.length>0)t.texParameteri(an,t.TEXTURE_MAX_LEVEL,qt.mipmaps.length-1);i.unbindTexture()}if(le.depthBuffer)es(le)}function fs(le){let qt=le.textures;for(let en=0,mn=qt.length;en<mn;en++){let pn=qt[en];if(Ht(pn)&&pn.mipmapsAutoUpdate===!0){let Sn=Xt(le),Tn=s.get(pn).__webglTexture;i.bindTexture(Sn,Tn),Ft(Sn),i.unbindTexture()}}}let fi=[];function Ni(le){if(le.samples>0){if(vi(le)===!1){let{textures:qt,width:en,height:mn}=le,pn=t.COLOR_BUFFER_BIT,Sn=le.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,Tn=s.get(le),an=qt.length>1;if(an)for(let Mn=0;Mn<qt.length;Mn++)i.bindFramebuffer(t.FRAMEBUFFER,Tn.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Mn,t.RENDERBUFFER,null),i.bindFramebuffer(t.FRAMEBUFFER,Tn.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Mn,t.TEXTURE_2D,null,0);if(i.bindFramebuffer(t.READ_FRAMEBUFFER,Tn.__webglMultisampledFramebuffer),le.texture.mipmaps.length>0)i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer[0]);else i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Tn.__webglFramebuffer);for(let Mn=0;Mn<qt.length;Mn++){if(le.resolveDepthBuffer){if(le.depthBuffer)pn|=t.DEPTH_BUFFER_BIT;if(le.stencilBuffer&&le.resolveStencilBuffer)pn|=t.STENCIL_BUFFER_BIT}if(an){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,Tn.__webglColorRenderbuffer[Mn]);let Me=s.get(qt[Mn]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,Me,0)}if(t.blitFramebuffer(0,0,en,mn,0,0,en,mn,pn,t.NEAREST),S===!0){if(fi.length=0,fi.push(t.COLOR_ATTACHMENT0+Mn),le.depthBuffer&&le.storeMultisampledDepthBuffer===!1)fi.push(Sn);t.invalidateFramebuffer(t.READ_FRAMEBUFFER,fi)}}if(i.bindFramebuffer(t.READ_FRAMEBUFFER,null),i.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),an)for(let Mn=0;Mn<qt.length;Mn++){i.bindFramebuffer(t.FRAMEBUFFER,Tn.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+Mn,t.RENDERBUFFER,Tn.__webglColorRenderbuffer[Mn]);let Me=s.get(qt[Mn]).__webglTexture;i.bindFramebuffer(t.FRAMEBUFFER,Tn.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+Mn,t.TEXTURE_2D,Me,0)}i.bindFramebuffer(t.DRAW_FRAMEBUFFER,Tn.__webglMultisampledFramebuffer)}else if(le.depthBuffer&&le.storeMultisampledDepthBuffer===!1&&S){let qt=le.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[qt])}}}function wn(le){return Math.min(a.maxSamples,le.samples)}function vi(le){let qt=s.get(le);return le.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&qt.__useRenderToTexture!==!1}function Xn(le){let qt=d.render.frame;if(N.get(le)!==qt)N.set(le,qt),le.update()}function Jn(le,qt){let{colorSpace:en,format:mn,type:pn}=le;if(le.isCompressedTexture===!0||le.isVideoTexture===!0)return qt;if(en!==k&&en!==ge)if(m.getTransfer(en)===_i){if(mn!==V||pn!==xs)Gn("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else qn("WebGLTextures: Unsupported texture color space:",en);return qt}function ki(le){if(typeof HTMLImageElement<"u"&&le instanceof HTMLImageElement)E.width=le.naturalWidth||le.width,E.height=le.naturalHeight||le.height;else if(typeof VideoFrame<"u"&&le instanceof VideoFrame)E.width=le.displayWidth,E.height=le.displayHeight;else E.width=le.width,E.height=le.height;return E}this.allocateTextureUnit=fn,this.resetTextureUnits=dn,this.getTextureUnits=gn,this.setTextureUnits=Nn,this.setTexture2D=Ln,this.setTexture2DArray=Hn,this.setTexture3D=Wn,this.setTextureCube=Dn,this.rebindTextures=us,this.setupRenderTarget=we,this.updateRenderTargetMipmap=fs,this.updateMultisampleRenderTarget=Ni,this.setupDepthRenderbuffer=es,this.setupFrameBufferTexture=wi,this.useMultisampledRTT=vi,this.dispose=Ye}function hy(t,e){function i(s,a=ge){let c,d=m.getTransfer(a);if(s===xs)return t.UNSIGNED_BYTE;if(s===nc)return t.UNSIGNED_SHORT_4_4_4_4;if(s===ic)return t.UNSIGNED_SHORT_5_5_5_1;if(s===gf)return t.UNSIGNED_INT_5_9_9_9_REV;if(s===_f)return t.UNSIGNED_INT_10F_11F_11F_REV;if(s===pf)return t.BYTE;if(s===mf)return t.SHORT;if(s===To)return t.UNSIGNED_SHORT;if(s===ec)return t.INT;if(s===Js)return t.UNSIGNED_INT;if(s===Gs)return t.FLOAT;if(s===H)return t.HALF_FLOAT;if(s===xf)return t.ALPHA;if(s===yf)return t.RGB;if(s===V)return t.RGBA;if(s===Wr)return t.DEPTH_COMPONENT;if(s===$s)return t.DEPTH_STENCIL;if(s===xt)return t.RED;if(s===sc)return t.RED_INTEGER;if(s===_r)return t.RG;if(s===rc)return t.RG_INTEGER;if(s===oc)return t.RGBA_INTEGER;if(s===$e||s===Aa||s===Ke||s===je)if(d===_i)if(c=e.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(s===$e)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===Aa)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===Ke)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===je)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=e.get("WEBGL_compressed_texture_s3tc"),c!==null){if(s===$e)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===Aa)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===Ke)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===je)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===ac||s===lc||s===cc||s===hc)if(c=e.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(s===ac)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===lc)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===cc)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===hc)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===rt||s===uc||s===fc||s===dc||s===pc||s===Ea||s===mc)if(c=e.get("WEBGL_compressed_texture_etc"),c!==null){if(s===rt||s===uc)return d===_i?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(s===fc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC;if(s===dc)return c.COMPRESSED_R11_EAC;if(s===pc)return c.COMPRESSED_SIGNED_R11_EAC;if(s===Ea)return c.COMPRESSED_RG11_EAC;if(s===mc)return c.COMPRESSED_SIGNED_RG11_EAC}else return null;if(s===gc||s===_c||s===xc||s===yc||s===vc||s===Sc||s===Mc||s===bc||s===Tc||s===Ac||s===Ec||s===wc||s===Rc||s===Cc)if(c=e.get("WEBGL_compressed_texture_astc"),c!==null){if(s===gc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===_c)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===xc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===yc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===vc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===Sc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===Mc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===bc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===Tc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===Ac)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===Ec)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===wc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===Rc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Cc)return d===_i?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===ot||s===at||s===lt)if(c=e.get("EXT_texture_compression_bptc"),c!==null){if(s===ot)return d===_i?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===at)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===lt)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Ic||s===Pc||s===wa||s===Lc)if(c=e.get("EXT_texture_compression_rgtc"),c!==null){if(s===Ic)return c.COMPRESSED_RED_RGTC1_EXT;if(s===Pc)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===wa)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===Lc)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(s===gr)return t.UNSIGNED_INT_24_8;return t[s]!==void 0?t[s]:null}return{convert:i}}var uy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fy=`
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

}`;class bd{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Ua(t.texture);if(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)this.depthNear=t.depthNear,this.depthFar=t.depthFar;this.texture=i}}getMesh(t){if(this.texture!==null){if(this.mesh===null){let e=t.cameras[0].viewport,i=new re({vertexShader:uy,fragmentShader:fy,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new u(new Co(20,20),i)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Td extends As{constructor(t,e){super();let i=this,s=null,a=1,c=null,d="local-floor",p=1,S=null,E=null,N=null,D=null,L=null,tt=null,vt=typeof XRWebGLBinding<"u",zt=new bd,nt={},yt=e.getContextAttributes(),Dt=null,Ht=null,Ft=[],Xt=[],Jt=new o,gt=null,Ot=null,Kt=new w;Kt.viewport=new y;let pe=new w;pe.viewport=new y;let Qt=[Kt,pe],me=new sh,Ee=null,jt=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(fn){let _n=Ft[fn];if(_n===void 0)_n=new wo,Ft[fn]=_n;return _n.getTargetRaySpace()},this.getControllerGrip=function(fn){let _n=Ft[fn];if(_n===void 0)_n=new wo,Ft[fn]=_n;return _n.getGripSpace()},this.getHand=function(fn){let _n=Ft[fn];if(_n===void 0)_n=new wo,Ft[fn]=_n;return _n.getHandSpace()};function Ye(fn){let _n=Xt.indexOf(fn.inputSource);if(_n===-1)return;let Ln=Ft[_n];if(Ln!==void 0)Ln.update(fn.inputSource,fn.frame,S||c),Ln.dispatchEvent({type:fn.type,data:fn.inputSource})}function on(){s.removeEventListener("select",Ye),s.removeEventListener("selectstart",Ye),s.removeEventListener("selectend",Ye),s.removeEventListener("squeeze",Ye),s.removeEventListener("squeezestart",Ye),s.removeEventListener("squeezeend",Ye),s.removeEventListener("end",on),s.removeEventListener("inputsourceschange",tn);for(let fn=0;fn<Ft.length;fn++){let _n=Xt[fn];if(_n===null)continue;Xt[fn]=null,Ft[fn].disconnect(_n)}Ee=null,jt=null,zt.reset();for(let fn in nt)delete nt[fn];if(t.setRenderTarget(Dt),L=null,D=null,N=null,s=null,Ht=null,Nn.stop(),i.isPresenting=!1,t.setPixelRatio(gt),t.setSize(Jt.width,Jt.height,!1),Ot!==null){let fn=Ot.camera;fn.fov=Ot.fov,fn.zoom=Ot.zoom,fn.updateProjectionMatrix(),Ot=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(fn){if(a=fn,i.isPresenting===!0)Gn("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(fn){if(d=fn,i.isPresenting===!0)Gn("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||c},this.setReferenceSpace=function(fn){S=fn},this.getBaseLayer=function(){return D!==null?D:L},this.getBinding=function(){if(N===null&&vt)N=new XRWebGLBinding(s,e);return N},this.getFrame=function(){return tt},this.getSession=function(){return s},this.setSession=async function(fn){if(s=fn,s!==null){if(Dt=t.getRenderTarget(),s.addEventListener("select",Ye),s.addEventListener("selectstart",Ye),s.addEventListener("selectend",Ye),s.addEventListener("squeeze",Ye),s.addEventListener("squeezestart",Ye),s.addEventListener("squeezeend",Ye),s.addEventListener("end",on),s.addEventListener("inputsourceschange",tn),yt.xrCompatible!==!0)await e.makeXRCompatible();if(gt=t.getPixelRatio(),t.getSize(Jt),!(vt&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Ln={antialias:yt.antialias,alpha:!0,depth:yt.depth,stencil:yt.stencil,framebufferScaleFactor:a};L=new XRWebGLLayer(s,e,Ln),s.updateRenderState({baseLayer:L}),t.setPixelRatio(1),t.setSize(L.framebufferWidth,L.framebufferHeight,!1),Ht=new z(L.framebufferWidth,L.framebufferHeight,{format:V,type:xs,colorSpace:t.outputColorSpace,stencilBuffer:yt.stencil,resolveDepthBuffer:L.ignoreDepthValues===!1,resolveStencilBuffer:L.ignoreDepthValues===!1,storeMultisampledDepthBuffer:L.ignoreDepthValues===!1,storeMultisampledStencilBuffer:L.ignoreDepthValues===!1})}else{let Ln=null,Hn=null,Wn=null;if(yt.depth)Wn=yt.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Ln=yt.stencil?$s:Wr,Hn=yt.stencil?gr:Js;let Dn={colorFormat:e.RGBA8,depthFormat:Wn,scaleFactor:a};N=this.getBinding(),D=N.createProjectionLayer(Dn),s.updateRenderState({layers:[D]}),t.setPixelRatio(1),t.setSize(D.textureWidth,D.textureHeight,!1),Ht=new z(D.textureWidth,D.textureHeight,{format:V,type:xs,depthTexture:new Ks(D.textureWidth,D.textureHeight,Hn,void 0,void 0,void 0,void 0,void 0,void 0,Ln),stencilBuffer:yt.stencil,colorSpace:t.outputColorSpace,samples:yt.antialias?4:0,resolveDepthBuffer:D.ignoreDepthValues===!1,resolveStencilBuffer:D.ignoreDepthValues===!1,storeMultisampledDepthBuffer:D.ignoreDepthValues===!1,storeMultisampledStencilBuffer:D.ignoreDepthValues===!1})}Ht.isXRRenderTarget=!0,this.setFoveation(p),S=null,c=await s.requestReferenceSpace(d),Nn.setContext(s),Nn.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return zt.getDepthTexture()};function tn(fn){for(let _n=0;_n<fn.removed.length;_n++){let Ln=fn.removed[_n],Hn=Xt.indexOf(Ln);if(Hn>=0)Xt[Hn]=null,Ft[Hn].disconnect(Ln)}for(let _n=0;_n<fn.added.length;_n++){let Ln=fn.added[_n],Hn=Xt.indexOf(Ln);if(Hn===-1){for(let Dn=0;Dn<Ft.length;Dn++)if(Dn>=Xt.length){Xt.push(Ln),Hn=Dn;break}else if(Xt[Dn]===null){Xt[Dn]=Ln,Hn=Dn;break}if(Hn===-1)break}let Wn=Ft[Hn];if(Wn)Wn.connect(Ln)}}function yn(fn,_n){if(_n===null)fn.matrixWorld.copy(fn.matrix);else fn.matrixWorld.multiplyMatrices(_n.matrixWorld,fn.matrix);fn.matrixWorldInverse.copy(fn.matrixWorld).invert()}this.updateCamera=function(fn){if(s===null)return;let{near:_n,far:Ln}=fn;if(zt.texture!==null){if(zt.depthNear>0)_n=zt.depthNear;if(zt.depthFar>0)Ln=zt.depthFar}if(me.near=pe.near=Kt.near=_n,me.far=pe.far=Kt.far=Ln,Ee!==me.near||jt!==me.far)s.updateRenderState({depthNear:me.near,depthFar:me.far}),Ee=me.near,jt=me.far;me.layers.mask=fn.layers.mask|6,Kt.layers.mask=me.layers.mask&-5,pe.layers.mask=me.layers.mask&-3;let Hn=fn.parent,Wn=me.cameras;yn(me,Hn);for(let Dn=0;Dn<Wn.length;Dn++)yn(Wn[Dn],Hn);if(me.projectionMatrix.copy(Kt.projectionMatrix),me.projectionMatrixInverse.copy(Kt.projectionMatrixInverse),Ot===null&&fn.isPerspectiveCamera)Ot={camera:fn,fov:fn.fov,zoom:fn.zoom};ln(fn,me,Hn)};function ln(fn,_n,Ln){if(Ln===null)fn.matrix.copy(_n.matrixWorld);else fn.matrix.copy(Ln.matrixWorld),fn.matrix.invert(),fn.matrix.multiply(_n.matrixWorld);if(fn.matrix.decompose(fn.position,fn.quaternion,fn.scale),fn.updateMatrixWorld(!0),fn.projectionMatrix.copy(_n.projectionMatrix),fn.projectionMatrixInverse.copy(_n.projectionMatrixInverse),fn.isPerspectiveCamera)fn.fov=dr*2*Math.atan(1/fn.projectionMatrix.elements[5]),fn.zoom=1}this.getCamera=function(){return me},this.getFoveation=function(){if(D===null&&L===null)return;return p},this.setFoveation=function(fn){if(p=fn,D!==null)D.fixedFoveation=fn;if(L!==null&&L.fixedFoveation!==void 0)L.fixedFoveation=fn},this.hasDepthSensing=function(){return zt.texture!==null},this.getDepthSensingMesh=function(){return zt.getMesh(me)},this.getCameraTexture=function(fn){return nt[fn]};let dn=null;function gn(fn,_n){if(E=_n.getViewerPose(S||c),tt=_n,E!==null){let Ln=E.views;if(L!==null)t.setRenderTargetFramebuffer(Ht,L.framebuffer),t.setRenderTarget(Ht);let Hn=!1;if(Ln.length!==me.cameras.length)me.cameras.length=0,Hn=!0;for(let jn=0;jn<Ln.length;jn++){let Kn=Ln[jn],ui=null;if(L!==null)ui=L.getViewport(Kn);else{let Ti=N.getViewSubImage(D,Kn);if(ui=Ti.viewport,jn===0)t.setRenderTargetTextures(Ht,Ti.colorTexture,Ti.depthStencilTexture),t.setRenderTarget(Ht)}let ii=Qt[jn];if(ii===void 0)ii=new w,ii.layers.enable(jn),ii.viewport=new y,Qt[jn]=ii;if(ii.matrix.fromArray(Kn.transform.matrix),ii.matrix.decompose(ii.position,ii.quaternion,ii.scale),ii.projectionMatrix.fromArray(Kn.projectionMatrix),ii.projectionMatrixInverse.copy(ii.projectionMatrix).invert(),ii.viewport.set(ui.x,ui.y,ui.width,ui.height),jn===0)me.matrix.copy(ii.matrix),me.matrix.decompose(me.position,me.quaternion,me.scale);if(Hn===!0)me.cameras.push(ii)}let Wn=s.enabledFeatures;if(Wn&&Wn.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&vt){N=i.getBinding();let jn=N.getDepthInformation(Ln[0]);if(jn&&jn.isValid&&jn.texture)zt.init(jn,s.renderState)}if(Wn&&Wn.includes("camera-access")&&vt){t.state.unbindTexture(),N=i.getBinding();for(let jn=0;jn<Ln.length;jn++){let Kn=Ln[jn].camera;if(Kn){let ui=nt[Kn];if(!ui)ui=new Ua,nt[Kn]=ui;let ii=N.getCameraImage(Kn);ui.sourceTexture=ii}}}}for(let Ln=0;Ln<Ft.length;Ln++){let Hn=Xt[Ln],Wn=Ft[Ln];if(Hn!==null&&Wn!==void 0)Wn.update(Hn,_n,S||c)}if(dn)dn(fn,_n);if(_n.detectedPlanes)i.dispatchEvent({type:"planesdetected",data:_n});tt=null}let Nn=new ld;Nn.setAnimationLoop(gn),this.setAnimationLoop=function(fn){dn=fn},this.dispose=function(){}}}var dy=new r,Ad=new Zn;Ad.set(-1,0,0,0,1,0,0,0,1);function py(t,e){function i(nt,yt){if(nt.matrixAutoUpdate===!0)nt.updateMatrix();yt.value.copy(nt.matrix)}function s(nt,yt){if(yt.color.getRGB(nt.fogColor.value,Yc(t)),yt.isFog)nt.fogNear.value=yt.near,nt.fogFar.value=yt.far;else if(yt.isFogExp2)nt.fogDensity.value=yt.density}function a(nt,yt,Dt,Ht,Ft){if(yt.isNodeMaterial)yt.uniformsNeedUpdate=!1;else if(yt.isMeshBasicMaterial)c(nt,yt);else if(yt.isMeshLambertMaterial){if(c(nt,yt),yt.envMap)nt.envMapIntensity.value=yt.envMapIntensity}else if(yt.isMeshToonMaterial)c(nt,yt),D(nt,yt);else if(yt.isMeshPhongMaterial){if(c(nt,yt),N(nt,yt),yt.envMap)nt.envMapIntensity.value=yt.envMapIntensity}else if(yt.isMeshStandardMaterial){if(c(nt,yt),L(nt,yt),yt.isMeshPhysicalMaterial)tt(nt,yt,Ft)}else if(yt.isMeshMatcapMaterial)c(nt,yt),vt(nt,yt);else if(yt.isMeshDepthMaterial)c(nt,yt);else if(yt.isMeshDistanceMaterial)c(nt,yt),zt(nt,yt);else if(yt.isMeshNormalMaterial)c(nt,yt);else if(yt.isLineBasicMaterial){if(d(nt,yt),yt.isLineDashedMaterial)p(nt,yt)}else if(yt.isPointsMaterial)S(nt,yt,Dt,Ht);else if(yt.isSpriteMaterial)E(nt,yt);else if(yt.isShadowMaterial)nt.color.value.copy(yt.color),nt.opacity.value=yt.opacity;else if(yt.isShaderMaterial)yt.uniformsNeedUpdate=!1}function c(nt,yt){if(nt.opacity.value=yt.opacity,yt.color)nt.diffuse.value.copy(yt.color);if(yt.emissive)nt.emissive.value.copy(yt.emissive).multiplyScalar(yt.emissiveIntensity);if(yt.map)nt.map.value=yt.map,i(yt.map,nt.mapTransform);if(yt.alphaMap)nt.alphaMap.value=yt.alphaMap,i(yt.alphaMap,nt.alphaMapTransform);if(yt.bumpMap){if(nt.bumpMap.value=yt.bumpMap,i(yt.bumpMap,nt.bumpMapTransform),nt.bumpScale.value=yt.bumpScale,yt.side===C)nt.bumpScale.value*=-1}if(yt.normalMap){if(nt.normalMap.value=yt.normalMap,i(yt.normalMap,nt.normalMapTransform),nt.normalScale.value.copy(yt.normalScale),yt.side===C)nt.normalScale.value.negate()}if(yt.displacementMap)nt.displacementMap.value=yt.displacementMap,i(yt.displacementMap,nt.displacementMapTransform),nt.displacementScale.value=yt.displacementScale,nt.displacementBias.value=yt.displacementBias;if(yt.emissiveMap)nt.emissiveMap.value=yt.emissiveMap,i(yt.emissiveMap,nt.emissiveMapTransform);if(yt.specularMap)nt.specularMap.value=yt.specularMap,i(yt.specularMap,nt.specularMapTransform);if(yt.alphaTest>0)nt.alphaTest.value=yt.alphaTest;let Dt=e.get(yt),{envMap:Ht,envMapRotation:Ft}=Dt;if(Ht){if(nt.envMap.value=Ht,nt.envMapRotation.value.setFromMatrix4(dy.makeRotationFromEuler(Ft)).transpose(),Ht.isCubeTexture&&Ht.isRenderTargetTexture===!1)nt.envMapRotation.value.premultiply(Ad);nt.reflectivity.value=yt.reflectivity,nt.ior.value=yt.ior,nt.refractionRatio.value=yt.refractionRatio}if(yt.lightMap)nt.lightMap.value=yt.lightMap,nt.lightMapIntensity.value=yt.lightMapIntensity,i(yt.lightMap,nt.lightMapTransform);if(yt.aoMap)nt.aoMap.value=yt.aoMap,nt.aoMapIntensity.value=yt.aoMapIntensity,i(yt.aoMap,nt.aoMapTransform)}function d(nt,yt){if(nt.diffuse.value.copy(yt.color),nt.opacity.value=yt.opacity,yt.map)nt.map.value=yt.map,i(yt.map,nt.mapTransform)}function p(nt,yt){nt.dashSize.value=yt.dashSize,nt.totalSize.value=yt.dashSize+yt.gapSize,nt.scale.value=yt.scale}function S(nt,yt,Dt,Ht){if(nt.diffuse.value.copy(yt.color),nt.opacity.value=yt.opacity,nt.size.value=yt.size*Dt,nt.scale.value=Ht*0.5,yt.map)nt.map.value=yt.map,i(yt.map,nt.uvTransform);if(yt.alphaMap)nt.alphaMap.value=yt.alphaMap,i(yt.alphaMap,nt.alphaMapTransform);if(yt.alphaTest>0)nt.alphaTest.value=yt.alphaTest}function E(nt,yt){if(nt.diffuse.value.copy(yt.color),nt.opacity.value=yt.opacity,nt.rotation.value=yt.rotation,yt.map)nt.map.value=yt.map,i(yt.map,nt.mapTransform);if(yt.alphaMap)nt.alphaMap.value=yt.alphaMap,i(yt.alphaMap,nt.alphaMapTransform);if(yt.alphaTest>0)nt.alphaTest.value=yt.alphaTest}function N(nt,yt){nt.specular.value.copy(yt.specular),nt.shininess.value=Math.max(yt.shininess,0.0001)}function D(nt,yt){if(yt.gradientMap)nt.gradientMap.value=yt.gradientMap}function L(nt,yt){if(nt.metalness.value=yt.metalness,yt.metalnessMap)nt.metalnessMap.value=yt.metalnessMap,i(yt.metalnessMap,nt.metalnessMapTransform);if(nt.roughness.value=yt.roughness,yt.roughnessMap)nt.roughnessMap.value=yt.roughnessMap,i(yt.roughnessMap,nt.roughnessMapTransform);if(yt.envMap)nt.envMapIntensity.value=yt.envMapIntensity}function tt(nt,yt,Dt){if(nt.ior.value=yt.ior,yt.diffuseRoughness>0){if(nt.diffuseRoughness.value=yt.diffuseRoughness,yt.diffuseRoughnessMap)nt.diffuseRoughnessMap.value=yt.diffuseRoughnessMap,i(yt.diffuseRoughnessMap,nt.diffuseRoughnessMapTransform)}if(yt.sheen>0){if(nt.sheenColor.value.copy(yt.sheenColor).multiplyScalar(yt.sheen),nt.sheenRoughness.value=yt.sheenRoughness,yt.sheenColorMap)nt.sheenColorMap.value=yt.sheenColorMap,i(yt.sheenColorMap,nt.sheenColorMapTransform);if(yt.sheenRoughnessMap)nt.sheenRoughnessMap.value=yt.sheenRoughnessMap,i(yt.sheenRoughnessMap,nt.sheenRoughnessMapTransform)}if(yt.clearcoat>0){if(nt.clearcoat.value=yt.clearcoat,nt.clearcoatRoughness.value=yt.clearcoatRoughness,yt.clearcoatMap)nt.clearcoatMap.value=yt.clearcoatMap,i(yt.clearcoatMap,nt.clearcoatMapTransform);if(yt.clearcoatRoughnessMap)nt.clearcoatRoughnessMap.value=yt.clearcoatRoughnessMap,i(yt.clearcoatRoughnessMap,nt.clearcoatRoughnessMapTransform);if(yt.clearcoatNormalMap){if(nt.clearcoatNormalMap.value=yt.clearcoatNormalMap,i(yt.clearcoatNormalMap,nt.clearcoatNormalMapTransform),nt.clearcoatNormalScale.value.copy(yt.clearcoatNormalScale),yt.side===C)nt.clearcoatNormalScale.value.negate()}}if(yt.dispersion>0)nt.dispersion.value=yt.dispersion;if(yt.retroreflectivity>0)nt.retroreflectivity.value=yt.retroreflectivity;if(yt.iridescence>0){if(nt.iridescence.value=yt.iridescence,nt.iridescenceIOR.value=yt.iridescenceIOR,nt.iridescenceThicknessMinimum.value=yt.iridescenceThicknessMinimum,nt.iridescenceThicknessMaximum.value=yt.iridescenceThicknessMaximum,yt.iridescenceMap)nt.iridescenceMap.value=yt.iridescenceMap,i(yt.iridescenceMap,nt.iridescenceMapTransform);if(yt.iridescenceThicknessMap)nt.iridescenceThicknessMap.value=yt.iridescenceThicknessMap,i(yt.iridescenceThicknessMap,nt.iridescenceThicknessMapTransform)}if(yt.transmission>0){if(nt.transmission.value=yt.transmission,nt.transmissionSamplerMap.value=Dt.texture,nt.transmissionSamplerSize.value.set(Dt.width,Dt.height),yt.transmissionMap)nt.transmissionMap.value=yt.transmissionMap,i(yt.transmissionMap,nt.transmissionMapTransform);if(nt.thickness.value=yt.thickness,yt.thicknessMap)nt.thicknessMap.value=yt.thicknessMap,i(yt.thicknessMap,nt.thicknessMapTransform);nt.attenuationDistance.value=yt.attenuationDistance,nt.attenuationColor.value.copy(yt.attenuationColor)}if(yt.anisotropy>0){if(nt.anisotropyVector.value.set(yt.anisotropy*Math.cos(yt.anisotropyRotation),yt.anisotropy*Math.sin(yt.anisotropyRotation)),yt.anisotropyMap)nt.anisotropyMap.value=yt.anisotropyMap,i(yt.anisotropyMap,nt.anisotropyMapTransform)}if(nt.specularIntensity.value=yt.specularIntensity,nt.specularColor.value.copy(yt.specularColor),yt.specularColorMap)nt.specularColorMap.value=yt.specularColorMap,i(yt.specularColorMap,nt.specularColorMapTransform);if(yt.specularIntensityMap)nt.specularIntensityMap.value=yt.specularIntensityMap,i(yt.specularIntensityMap,nt.specularIntensityMapTransform)}function vt(nt,yt){if(yt.matcap)nt.matcap.value=yt.matcap}function zt(nt,yt){let Dt=e.get(yt).light;nt.referencePosition.value.setFromMatrixPosition(Dt.matrixWorld),nt.nearDistance.value=Dt.shadow.camera.near,nt.farDistance.value=Dt.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:a}}function my(t,e,i,s){let a={},c={};function d(Dt,Ht){let Ft=Ht.program;s.uniformBlockBinding(Dt,Ft,a[Dt.id])}function p(Dt,Ht){let Ft=a[Dt.id];if(Ft===void 0)vt(Dt),Ft=S(Dt),a[Dt.id]=Ft,Dt.addEventListener("dispose",nt);let Xt=Ht.program;s.updateUBOMapping(Dt,Xt);let Jt=e.render.frame;if(c[Dt.id]!==Jt)E(Dt),c[Dt.id]=Jt}function S(Dt){let Ht=t.createBuffer(),{__size:Ft,usage:Xt}=Dt;return t.bindBuffer(t.UNIFORM_BUFFER,Ht),t.bufferData(t.UNIFORM_BUFFER,Ft,Xt),t.bindBuffer(t.UNIFORM_BUFFER,null),Ht}function E(Dt){let Ht=a[Dt.id],{uniforms:Ft,__cache:Xt}=Dt;t.bindBuffer(t.UNIFORM_BUFFER,Ht);for(let Jt=0,gt=Ft.length;Jt<gt;Jt++){let Ot=Ft[Jt];if(Array.isArray(Ot))for(let Kt=0,pe=Ot.length;Kt<pe;Kt++)N(Ot[Kt],Jt,Kt,Xt);else N(Ot,Jt,0,Xt)}t.bindBuffer(t.UNIFORM_BUFFER,null)}function N(Dt,Ht,Ft,Xt){if(L(Dt,Ht,Ft,Xt)===!0){let{__offset:Jt,value:gt}=Dt;if(Array.isArray(gt)){let Ot=0;for(let Kt=0;Kt<gt.length;Kt++){let pe=gt[Kt],Qt=zt(pe,!0);D(pe,Dt.__data,Ot),Ot+=Qt.storage/Float32Array.BYTES_PER_ELEMENT}}else D(gt,Dt.__data,0);t.bufferSubData(t.UNIFORM_BUFFER,Jt,Dt.__data)}}function D(Dt,Ht,Ft){if(typeof Dt==="number"||typeof Dt==="boolean")Ht[Ft]=Dt;else if(Dt.isMatrix3)Ht[Ft]=Dt.elements[0],Ht[Ft+1]=Dt.elements[1],Ht[Ft+2]=Dt.elements[2],Ht[Ft+3]=0,Ht[Ft+4]=Dt.elements[3],Ht[Ft+5]=Dt.elements[4],Ht[Ft+6]=Dt.elements[5],Ht[Ft+7]=0,Ht[Ft+8]=Dt.elements[6],Ht[Ft+9]=Dt.elements[7],Ht[Ft+10]=Dt.elements[8],Ht[Ft+11]=0;else if(ArrayBuffer.isView(Dt))Ht.set(Dt.subarray(0,Ht.length-Ft),Ft);else Dt.toArray(Ht,Ft)}function L(Dt,Ht,Ft,Xt){let Jt=Dt.value,gt=Ht+"_"+Ft;if(Array.isArray(Jt)){if(Xt[gt]===void 0)Xt[gt]=[];let Ot=Xt[gt],Kt=!1;for(let pe=0;pe<Jt.length;pe++)if(tt(Jt[pe],Ot,pe)===!0)Kt=!0;return Kt}return tt(Jt,Xt,gt)}function tt(Dt,Ht,Ft){if(Ht[Ft]===void 0){if(typeof Dt==="number"||typeof Dt==="boolean")Ht[Ft]=Dt;else if(ArrayBuffer.isView(Dt))Ht[Ft]=Dt.slice();else Ht[Ft]=Dt.clone();return!0}else{let Xt=Ht[Ft];if(typeof Dt==="number"||typeof Dt==="boolean"){if(Xt!==Dt)return Ht[Ft]=Dt,!0}else if(ArrayBuffer.isView(Dt))return!0;else if(Xt.equals(Dt)===!1)return Xt.copy(Dt),!0}return!1}function vt(Dt){let Ht=Dt.uniforms,Ft=0,Xt=16;for(let gt=0,Ot=Ht.length;gt<Ot;gt++){let Kt=Array.isArray(Ht[gt])?Ht[gt]:[Ht[gt]];for(let pe=0,Qt=Kt.length;pe<Qt;pe++){let me=Kt[pe],Ee=Array.isArray(me.value)?me.value:[me.value],jt=Array.isArray(Ht[gt])||Array.isArray(me.value),Ye=Ft;for(let tn=0,yn=Ee.length;tn<yn;tn++){let ln=Ee[tn],dn=zt(ln,jt),gn=Ft%Xt,Nn=gn%dn.boundary,fn=gn+Nn;if(Ft+=Nn,fn!==0&&Xt-fn<dn.storage)Ft+=Xt-fn;if(tn===0)Ye=Ft;Ft+=dn.storage}let on=me.type==="int"?Int32Array:me.type==="uint"?Uint32Array:Float32Array;me.__data=new on((Ft-Ye)/Float32Array.BYTES_PER_ELEMENT),me.__offset=Ye}}let Jt=Ft%Xt;if(Jt>0)Ft+=Xt-Jt;return Dt.__size=Ft,Dt.__cache={},this}function zt(Dt,Ht){let Ft={boundary:0,storage:0};if(typeof Dt==="number"||typeof Dt==="boolean")Ft.boundary=4,Ft.storage=4;else if(Dt.isVector2)Ft.boundary=8,Ft.storage=8;else if(Dt.isVector3||Dt.isColor)Ft.boundary=16,Ft.storage=12;else if(Dt.isVector4)Ft.boundary=16,Ft.storage=16;else if(Dt.isMatrix3)Ft.boundary=16,Ft.storage=48;else if(Dt.isMatrix4)Ft.boundary=16,Ft.storage=64;else if(Dt.isTexture)Gn("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(Dt))Ft.boundary=16,Ft.storage=Dt.byteLength;else Gn("WebGLRenderer: Unsupported uniform value type.",Dt);if(Ht===!0)Ft.boundary=16,Ft.storage=Math.ceil(Ft.storage/16)*16;return Ft}function nt(Dt){let Ht=Dt.target;Ht.removeEventListener("dispose",nt),t.deleteBuffer(a[Ht.id]),delete a[Ht.id],delete c[Ht.id]}function yt(){for(let Dt in a)t.deleteBuffer(a[Dt]);a={},c={}}return{bind:d,update:p,dispose:yt}}var gy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ws=null;function _y(){if(ws===null)ws=new se(gy,16,16,_r,H),ws.name="DFG_LUT",ws.minFilter=A,ws.magFilter=A,ws.wrapS=Ue,ws.wrapT=Ue,ws.generateMipmaps=!1,ws.needsUpdate=!0;return ws}class xe{constructor(t={}){let{canvas:e=Ef(),context:i=null,depth:s=!0,stencil:a=!1,alpha:c=!1,antialias:d=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:S=!1,powerPreference:E="default",failIfMajorPerformanceCaveat:N=!1,reversedDepthBuffer:D=!1,outputBufferType:L=xs}=t;this.isWebGLRenderer=!0;let tt;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");tt=i.getContextAttributes().alpha}else tt=c;let vt=L,zt=new Set([oc,rc,sc]),nt=new Set([xs,Js,To,gr,nc,ic]),yt=new Uint32Array(4),Dt=new Int32Array(4),Ht={textures:[],min:[],max:[],resolution:[]},Ft=null,Xt=null,Jt=[],gt=[],Ot=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ts,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let Kt=this,pe=!1,Qt=null,me=null,Ee=null,jt=null;this._outputColorSpace=ue;let Ye=0,on=0,tn=null,yn=-1,ln=null,dn=new y,gn=new y,Nn=null,fn=new l(0),_n=0,{width:Ln,height:Hn}=e,Wn=1,Dn=null,oi=null,jn=new y(0,0,Ln,Hn),Kn=new y(0,0,Ln,Hn),ui=!1,ii=new Q,Ti=new Ro,Ei=!1,ji=!1,ss=new r,wi=new n,Gi=new y,ts={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},es=!1;function us(){return tn===null?Wn:1}let we=i;function fs(Zt,Ae){return e.getContext(Zt,Ae)}let fi,Ni,wn,vi,Xn,Jn,ki,le,qt,en,mn,pn,Sn,Tn,an,un,Mn,Me,hn,cn,xn,vn,En;try{let Zt={alpha:!0,depth:s,stencil:a,antialias:d,premultipliedAlpha:p,preserveDrawingBuffer:S,powerPreference:E,failIfMajorPerformanceCaveat:N};if("setAttribute"in e)e.setAttribute("data-engine",`three.js r${pr}`);if(e.addEventListener("webglcontextlost",Cn,!1),e.addEventListener("webglcontextrestored",Vn,!1),e.addEventListener("webglcontextcreationerror",Qn,!1),we===null){if(we=fs("webgl2",Zt),we===null)if(fs("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}kn()}catch(Zt){throw e.removeEventListener("webglcontextlost",Cn,!1),e.removeEventListener("webglcontextrestored",Vn,!1),e.removeEventListener("webglcontextcreationerror",Qn,!1),qn("WebGLRenderer: "+Zt.message),Zt}function kn(){if(fi=new R0(we),fi.init(),xn=new hy(we,fi),Ni=new _0(we,fi,t,xn),wn=new ly(we,fi),Ni.reversedDepthBuffer&&D)wn.buffers.depth.setReversed(!0);me=we.createFramebuffer(),Ee=we.createFramebuffer(),jt=we.createFramebuffer(),vi=new P0(we),Xn=new Zx,Jn=new cy(we,fi,wn,Xn,Ni,xn,vi),ki=new w0(Kt),le=new Nm(we),vn=new m0(we,le),qt=new C0(we,le,vi,vn),en=new N0(we,qt,le,vn,vi),Me=new L0(we,Ni,Jn),an=new x0(Xn),mn=new Yx(Kt,ki,fi,Ni,vn,an),pn=new py(Kt,Xn),Sn=new $x,Tn=new ny(fi),Mn=new p0(Kt,ki,wn,en,tt,p),un=new ay(Kt,en,Ni),En=new my(we,vi,Ni,wn),hn=new g0(we,fi,vi),cn=new I0(we,fi,vi),vi.programs=mn.programs,Kt.capabilities=Ni,Kt.extensions=fi,Kt.properties=Xn,Kt.renderLists=Sn,Kt.shadowMap=un,Kt.state=wn,Kt.info=vi}if(vt!==xs)Ot=new U0(vt,e.width,e.height,d,s,a);let zn=new Td(Kt,we);this.xr=zn,this.getContext=function(){return we},this.getContextAttributes=function(){return we.getContextAttributes()},this.forceContextLoss=function(){let Zt=fi.get("WEBGL_lose_context");if(Zt)Zt.loseContext()},this.forceContextRestore=function(){let Zt=fi.get("WEBGL_lose_context");if(Zt)Zt.restoreContext()},this.getPixelRatio=function(){return Wn},this.setPixelRatio=function(Zt){if(Zt===void 0)return;Wn=Zt,this.setSize(Ln,Hn,!1)},this.getSize=function(Zt){return Zt.set(Ln,Hn)},this.setSize=function(Zt,Ae,rn=!0){if(zn.isPresenting){Gn("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Ln=Zt,Hn=Ae,e.width=Math.floor(Zt*Wn),e.height=Math.floor(Ae*Wn),rn===!0)e.style.width=Zt+"px",e.style.height=Ae+"px";if(Ot!==null)Ot.setSize(e.width,e.height);this.setViewport(0,0,Zt,Ae)},this.getDrawingBufferSize=function(Zt){return Zt.set(Ln*Wn,Hn*Wn).floor()},this.setDrawingBufferSize=function(Zt,Ae,rn){Ln=Zt,Hn=Ae,Wn=rn,e.width=Math.floor(Zt*rn),e.height=Math.floor(Ae*rn),this.setViewport(0,0,Zt,Ae)},this.setEffects=function(Zt){if(vt===xs){qn("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(Zt){for(let Ae=0;Ae<Zt.length;Ae++)if(Zt[Ae].isOutputPass===!0){Gn("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}Ot.setEffects(Zt||[])},this.getCurrentViewport=function(Zt){return Zt.copy(dn)},this.getViewport=function(Zt){return Zt.copy(jn)},this.setViewport=function(Zt,Ae,rn,nn){if(Zt.isVector4)jn.set(Zt.x,Zt.y,Zt.z,Zt.w);else jn.set(Zt,Ae,rn,nn);wn.viewport(dn.copy(jn).multiplyScalar(us()).round())},this.getScissor=function(Zt){return Zt.copy(Kn)},this.setScissor=function(Zt,Ae,rn,nn){if(Zt.isVector4)Kn.set(Zt.x,Zt.y,Zt.z,Zt.w);else Kn.set(Zt,Ae,rn,nn);wn.scissor(gn.copy(Kn).multiplyScalar(us()).round())},this.getScissorTest=function(){return ui},this.setScissorTest=function(Zt){wn.setScissorTest(ui=Zt)},this.setOpaqueSort=function(Zt){Dn=Zt},this.setTransparentSort=function(Zt){oi=Zt},this.getClearColor=function(Zt){return Zt.copy(Mn.getClearColor())},this.setClearColor=function(){Mn.setClearColor(...arguments)},this.getClearAlpha=function(){return Mn.getClearAlpha()},this.setClearAlpha=function(){Mn.setClearAlpha(...arguments)},this.clear=function(Zt=!0,Ae=!0,rn=!0){let nn=0;if(Zt){let sn=!1;if(tn!==null){let An=tn.texture.format;sn=zt.has(An)}if(sn){let An=tn.texture.type,Un=nt.has(An),bn=Mn.getClearColor(),Pn=Mn.getClearAlpha(),{r:Bn,g:$n,b:ei}=bn;if(Un)yt[0]=Bn,yt[1]=$n,yt[2]=ei,yt[3]=Pn,we.clearBufferuiv(we.COLOR,0,yt);else Dt[0]=Bn,Dt[1]=$n,Dt[2]=ei,Dt[3]=Pn,we.clearBufferiv(we.COLOR,0,Dt)}else nn|=we.COLOR_BUFFER_BIT}if(Ae)nn|=we.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(rn)nn|=we.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(nn!==0)we.clear(nn)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(Zt){Zt.setRenderer(this),Qt=Zt},this.dispose=function(){e.removeEventListener("webglcontextlost",Cn,!1),e.removeEventListener("webglcontextrestored",Vn,!1),e.removeEventListener("webglcontextcreationerror",Qn,!1),Mn.dispose(),Sn.dispose(),Tn.dispose(),Jn.dispose(),Xn.dispose(),ki.dispose(),en.dispose(),qt.dispose(),vn.dispose(),En.dispose(),mn.dispose(),zn.dispose(),zn.removeEventListener("sessionstart",Uh),zn.removeEventListener("sessionend",Fh),sr.stop()};function Cn(Zt){Zt.preventDefault(),vo("WebGLRenderer: Context Lost."),pe=!0}function Vn(){vo("WebGLRenderer: Context Restored."),pe=!1;let Zt=vi.autoReset,Ae=un.enabled,rn=un.autoUpdate,nn=un.needsUpdate,sn=un.type;kn(),vi.autoReset=Zt,un.enabled=Ae,un.autoUpdate=rn,un.needsUpdate=nn,un.type=sn}function Qn(Zt){qn("WebGLRenderer: A WebGL context could not be created. Reason: ",Zt.statusMessage)}function In(Zt){let Ae=Zt.target;Ae.removeEventListener("dispose",In),di(Ae)}function di(Zt){Di(Zt),Xn.remove(Zt)}function Di(Zt){let Ae=Xn.get(Zt).programs;if(Ae!==void 0){if(Ae.forEach(function(rn){mn.releaseProgram(rn)}),Zt.isShaderMaterial)mn.releaseShaderCache(Zt)}}this.renderBufferDirect=function(Zt,Ae,rn,nn,sn,An){if(Ae===null)Ae=ts;let Un=sn.isMesh&&sn.matrixWorld.determinantAffine()<0,bn=yp(Zt,Ae,rn,nn,sn);wn.setMaterial(nn,Un);let Pn=rn.index,Bn=1;if(nn.wireframe===!0){if(Pn=qt.getWireframeAttribute(rn),Pn===void 0)return;Bn=2}let $n=rn.drawRange,ei=rn.attributes.position,Fn=$n.start*Bn,ni=($n.start+$n.count)*Bn;if(An!==null)Fn=Math.max(Fn,An.start*Bn),ni=Math.min(ni,(An.start+An.count)*Bn);if(Pn!==null)Fn=Math.max(Fn,0),ni=Math.min(ni,Pn.count);else if(ei!==void 0&&ei!==null)Fn=Math.max(Fn,0),ni=Math.min(ni,ei.count);let Ri=ni-Fn;if(Ri<0||Ri===1/0)return;vn.setup(sn,nn,bn,rn,Pn);let Si,gi=hn;if(Pn!==null)Si=le.get(Pn),gi=cn,gi.setIndex(Si);if(sn.isMesh)if(nn.wireframe===!0)wn.setLineWidth(nn.wireframeLinewidth*us()),gi.setMode(we.LINES);else gi.setMode(we.TRIANGLES);else if(sn.isLine){let Hi=nn.linewidth;if(Hi===void 0)Hi=1;if(wn.setLineWidth(Hi*us()),sn.isLineSegments)gi.setMode(we.LINES);else if(sn.isLineLoop)gi.setMode(we.LINE_LOOP);else gi.setMode(we.LINE_STRIP)}else if(sn.isPoints)gi.setMode(we.POINTS);else if(sn.isSprite)gi.setMode(we.TRIANGLES);if(sn.isBatchedMesh)if(!fi.get("WEBGL_multi_draw")){let{_multiDrawStarts:Hi,_multiDrawCounts:On,_multiDrawCount:$i}=sn,ai=Pn?le.get(Pn).bytesPerElement:1,rr=Xn.get(nn).currentProgram.getUniforms();for(let Vi=0;Vi<$i;Vi++)rr.setValue(we,"_gl_DrawID",Vi),gi.render(Hi[Vi]/ai,On[Vi])}else gi.renderMultiDraw(sn._multiDrawStarts,sn._multiDrawCounts,sn._multiDrawCount);else if(sn.isInstancedMesh)gi.renderInstances(Fn,Ri,sn.count);else if(rn.isInstancedBufferGeometry){let Hi=rn._maxInstanceCount!==void 0?rn._maxInstanceCount:1/0,On=Math.min(rn.instanceCount,Hi);gi.renderInstances(Fn,Ri,On)}else gi.render(Fn,Ri)};function Ps(Zt,Ae,rn,nn){if(Qt!==null&&Zt.isNodeMaterial)Qt.setObject(nn,Zt);if(Ei===!0)an.setState(Zt,rn,!1);if(Zt.transparent===!0&&Zt.side===Y&&Zt.forceSinglePass===!1)Zt.side=C,Zt.needsUpdate=!0,ao(Zt,Ae,nn),Zt.side=ne,Zt.needsUpdate=!0,ao(Zt,Ae,nn),Zt.side=Y;else ao(Zt,Ae,nn)}this.compile=function(Zt,Ae,rn=null){if(rn===null)rn=Zt;if(Qt!==null)Qt.renderStart(Zt,Ae,rn);if(Xt=Tn.get(rn),Xt.init(Ae),gt.push(Xt),rn.traverseVisible(function(sn){if(sn.isLight&&sn.layers.test(Ae.layers)){if(Xt.pushLight(sn),sn.castShadow)Xt.pushShadow(sn)}}),Zt!==rn)Zt.traverseVisible(function(sn){if(sn.isLight&&sn.layers.test(Ae.layers)){if(Xt.pushLight(sn),sn.castShadow)Xt.pushShadow(sn)}});if(Xt.setupLights(),Qt!==null)Qt.updateLights(Xt.state.lightsArray);if(ji=this.localClippingEnabled,Ei=an.init(this.clippingPlanes,ji),Ei===!0)an.setGlobalState(this.clippingPlanes,Ae);if(Qt!==null)un.render(Xt.state.shadowsArray,rn,Ae);let nn=new Set;if(Zt.traverse(function(sn){if(!(sn.isMesh||sn.isPoints||sn.isLine||sn.isSprite))return;let An=sn.material;if(An)if(Array.isArray(An))for(let Un=0;Un<An.length;Un++){let bn=An[Un];Ps(bn,rn,Ae,sn),nn.add(bn)}else Ps(An,rn,Ae,sn),nn.add(An)}),Xt=gt.pop(),Qt!==null)Qt.renderEnd();return nn},this.compileAsync=function(Zt,Ae,rn=null){let nn=this.compile(Zt,Ae,rn);return new Promise((sn)=>{function An(){if(nn.forEach(function(Un){let Pn=Xn.get(Un).currentProgram;if(Pn===void 0||Pn.isReady())nn.delete(Un)}),nn.size===0){sn(Zt);return}setTimeout(An,10)}if(fi.get("KHR_parallel_shader_compile")!==null)An();else setTimeout(An,10)})};let dl=null;function _p(Zt){if(dl)dl(Zt)}function Uh(){sr.stop()}function Fh(){sr.start()}let sr=new ld;if(sr.setAnimationLoop(_p),typeof self<"u")sr.setContext(self);this.setAnimationLoop=function(Zt){dl=Zt,zn.setAnimationLoop(Zt),Zt===null?sr.stop():sr.start()},zn.addEventListener("sessionstart",Uh),zn.addEventListener("sessionend",Fh),this.render=function(Zt,Ae){if(Ae!==void 0&&Ae.isCamera!==!0){qn("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(pe===!0)return;if(Qt!==null)Qt.renderStart(Zt,Ae);let rn=zn.enabled===!0&&zn.isPresenting===!0,nn=Ot!==null&&(tn===null||rn)&&Ot.begin(Kt,tn);if(Zt.matrixWorldAutoUpdate===!0)Zt.updateMatrixWorld();if(Ae.parent===null&&Ae.matrixWorldAutoUpdate===!0)Ae.updateMatrixWorld();if(zn.enabled===!0&&zn.isPresenting===!0&&(Ot===null||Ot.isCompositing()===!1)){if(zn.cameraAutoUpdate===!0)zn.updateCamera(Ae);Ae=zn.getCamera()}if(Zt.isScene===!0)Zt.onBeforeRender(Kt,Zt,Ae,tn);if(Xt=Tn.get(Zt,gt.length),Xt.init(Ae),Xt.state.textureUnits=Jn.getTextureUnits(),gt.push(Xt),ss.multiplyMatrices(Ae.projectionMatrix,Ae.matrixWorldInverse),Ae.isArrayCamera)Ti.setFromArrayCamera(Ae);else ii.setFromProjectionMatrix(ss,zc,Ae.reversedDepth);if(ji=this.localClippingEnabled,Ei=an.init(this.clippingPlanes,ji),Ft=Sn.get(Zt,Jt.length),Ft.init(),Jt.push(Ft),this.info.render.frame++,zn.enabled===!0&&zn.isPresenting===!0){let Un=Kt.xr.getDepthSensingMesh();if(Un!==null)pl(Un,Ae,-1/0,Kt.sortObjects)}if(pl(Zt,Ae,0,Kt.sortObjects),Ft.finish(),Qt!==null)Qt.updateLights(Xt.state.lightsArray);if(Kt.sortObjects===!0)Ft.sort(Dn,oi);if(es=zn.enabled===!1||zn.isPresenting===!1||zn.hasDepthSensing()===!1,es)Mn.addToRenderList(Ft,Zt);if(this.info.autoReset===!0)this.info.reset();if(Ei===!0)an.beginShadows();let sn=Xt.state.shadowsArray;if(un.render(sn,Zt,Ae),Ei===!0)an.endShadows();if((nn&&Ot.hasRenderPass())===!1){let Un=Ft.opaque,bn=Ft.transmissive;if(Xt.setupLights(),Ae.isArrayCamera){let Pn=Ae.cameras;if(bn.length>0)for(let Bn=0,$n=Pn.length;Bn<$n;Bn++){let ei=Pn[Bn];Bh(Un,bn,Zt,ei)}if(es)Mn.render(Zt);for(let Bn=0,$n=Pn.length;Bn<$n;Bn++){let ei=Pn[Bn];Oh(Ft,Zt,ei,ei.viewport)}}else{if(bn.length>0)Bh(Un,bn,Zt,Ae);if(es)Mn.render(Zt);Oh(Ft,Zt,Ae)}}if(tn!==null&&on===0)Jn.updateMultisampleRenderTarget(tn),Jn.updateRenderTargetMipmap(tn);if(nn)Ot.end(Kt);if(Zt.isScene===!0)Zt.onAfterRender(Kt,Zt,Ae);if(vn.resetDefaultState(),yn=-1,ln=null,gt.pop(),gt.length>0){if(Xt=gt[gt.length-1],Jn.setTextureUnits(Xt.state.textureUnits),Ei===!0)an.setGlobalState(Kt.clippingPlanes,Xt.state.camera)}else Xt=null;if(Jt.pop(),Jt.length>0)Ft=Jt[Jt.length-1];else Ft=null;if(Qt!==null)Qt.renderEnd()};function pl(Zt,Ae,rn,nn){if(Zt.visible===!1)return;if(Zt.layers.test(Ae.layers)){if(Zt.isGroup)rn=Zt.renderOrder;else if(Zt.isLOD){if(Zt.autoUpdate===!0)Zt.update(Ae)}else if(Zt.isLight){if(Xt.pushLight(Zt),Zt.castShadow)Xt.pushShadow(Zt)}else if(Zt.isSprite){let Un=Ae.isArrayCamera?Ti:ii;if(!Zt.frustumCulled||Zt.intersectsFrustum(Un)){if(nn)Gi.setFromMatrixPosition(Zt.matrixWorld).applyMatrix4(ss);let bn=en.update(Zt),Pn=Zt.material;if(Pn.visible)Ft.push(Zt,bn,Pn,rn,Gi.z,null,Ae)}}else if(Zt.isMesh||Zt.isLine||Zt.isPoints){let Un=Ae.isArrayCamera?Ti:ii;if(!Zt.frustumCulled||Zt.intersectsFrustum(Un)){let bn=en.update(Zt),Pn=Zt.material;if(nn){if(Zt.boundingSphere!==void 0){if(Zt.boundingSphere===null)Zt.computeBoundingSphere();Gi.copy(Zt.boundingSphere.center)}else{if(bn.boundingSphere===null)bn.computeBoundingSphere();Gi.copy(bn.boundingSphere.center)}Gi.applyMatrix4(Zt.matrixWorld).applyMatrix4(ss)}if(Array.isArray(Pn)){let Bn=bn.groups;for(let $n=0,ei=Bn.length;$n<ei;$n++){let Fn=Bn[$n],ni=Pn[Fn.materialIndex];if(ni&&ni.visible)Ft.push(Zt,bn,ni,rn,Gi.z,Fn,Ae)}}else if(Pn.visible)Ft.push(Zt,bn,Pn,rn,Gi.z,null,Ae)}}}let An=Zt.children;for(let Un=0,bn=An.length;Un<bn;Un++)pl(An[Un],Ae,rn,nn)}function Oh(Zt,Ae,rn,nn){let{opaque:sn,transmissive:An,transparent:Un}=Zt;if(Xt.setupLightsView(rn),Ei===!0)an.setGlobalState(Kt.clippingPlanes,rn);if(nn)wn.viewport(dn.copy(nn));if(sn.length>0)Xo(sn,Ae,rn);if(An.length>0)Xo(An,Ae,rn);if(Un.length>0)Xo(Un,Ae,rn);wn.buffers.depth.setTest(!0),wn.buffers.depth.setMask(!0),wn.buffers.color.setMask(!0),wn.setPolygonOffset(!1)}function Bh(Zt,Ae,rn,nn){if((rn.isScene===!0?rn.overrideMaterial:null)!==null)return;if(Xt.state.transmissionRenderTarget[nn.id]===void 0){let Fn=fi.has("EXT_color_buffer_half_float")||fi.has("EXT_color_buffer_float");Xt.state.transmissionRenderTarget[nn.id]=new z(1,1,{generateMipmaps:!0,type:Fn?H:xs,minFilter:F,samples:Math.max(4,Ni.samples),stencilBuffer:a,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:m.workingColorSpace})}let An=Xt.state.transmissionRenderTarget[nn.id],Un=nn.viewport||dn;An.setSize(Un.z*Kt.transmissionResolutionScale,Un.w*Kt.transmissionResolutionScale);let bn=Kt.getRenderTarget(),Pn=Kt.getActiveCubeFace(),Bn=Kt.getActiveMipmapLevel();if(Kt.setRenderTarget(An),Kt.getClearColor(fn),_n=Kt.getClearAlpha(),_n<1)Kt.setClearColor(16777215,0.5);if(Kt.clear(),es)Mn.render(rn);let $n=Kt.toneMapping;Kt.toneMapping=Ts;let ei=nn.viewport;if(nn.viewport!==void 0)nn.viewport=void 0;if(Xt.setupLightsView(nn),Ei===!0)an.setGlobalState(Kt.clippingPlanes,nn);if(Xo(Zt,rn,nn),Jn.updateMultisampleRenderTarget(An),Jn.updateRenderTargetMipmap(An),fi.has("WEBGL_multisampled_render_to_texture")===!1){let Fn=!1;for(let ni=0,Ri=Ae.length;ni<Ri;ni++){let Si=Ae[ni],{object:gi,geometry:Hi,material:On,group:$i}=Si;if(On.side===Y&&gi.layers.test(nn.layers)){let ai=On.side;On.side=C,On.needsUpdate=!0,zh(gi,rn,nn,Hi,On,$i),On.side=ai,On.needsUpdate=!0,Fn=!0}}if(Fn===!0)Jn.updateMultisampleRenderTarget(An),Jn.updateRenderTargetMipmap(An)}if(Kt.setRenderTarget(bn,Pn,Bn),Kt.setClearColor(fn,_n),ei!==void 0)nn.viewport=ei;Kt.toneMapping=$n}function Xo(Zt,Ae,rn){let nn=Ae.isScene===!0?Ae.overrideMaterial:null;for(let sn=0,An=Zt.length;sn<An;sn++){let Un=Zt[sn],{object:bn,geometry:Pn,group:Bn}=Un,$n=Un.material;if($n.allowOverride===!0&&nn!==null)$n=nn;if(bn.layers.test(rn.layers))zh(bn,Ae,rn,Pn,$n,Bn)}}function zh(Zt,Ae,rn,nn,sn,An){if(Qt!==null&&sn.isNodeMaterial)Qt.setObject(Zt,sn);if(Zt.onBeforeRender(Kt,Ae,rn,nn,sn,An),Zt.modelViewMatrix.multiplyMatrices(rn.matrixWorldInverse,Zt.matrixWorld),Zt.normalMatrix.getNormalMatrix(Zt.modelViewMatrix),sn.onBeforeRender(Kt,Ae,rn,nn,Zt,An),sn.transparent===!0&&sn.side===Y&&sn.forceSinglePass===!1)sn.side=C,sn.needsUpdate=!0,Kt.renderBufferDirect(rn,Ae,nn,sn,Zt,An),sn.side=ne,sn.needsUpdate=!0,Kt.renderBufferDirect(rn,Ae,nn,sn,Zt,An),sn.side=Y;else Kt.renderBufferDirect(rn,Ae,nn,sn,Zt,An);Zt.onAfterRender(Kt,Ae,rn,nn,sn,An)}function Gh(Zt){let Ae=0;for(let rn of Zt)if(rn.texture!==null)Ae++;return Ae}function ao(Zt,Ae,rn){if(Ae.isScene!==!0)Ae=ts;let nn=Xn.get(Zt),sn=Xt.state.lights,An=Xt.state.shadowsArray,Un=sn.state.version,bn=mn.getParameters(Zt,sn.state,An,Ae,rn,Xt.state.lightProbeGridArray),Pn=mn.getProgramCacheKey(bn),Bn=nn.programs;nn.environment=Zt.isMeshStandardMaterial||Zt.isMeshLambertMaterial||Zt.isMeshPhongMaterial?Ae.environment:null,nn.fog=Ae.fog;let $n=Zt.isMeshStandardMaterial||Zt.isMeshLambertMaterial&&!Zt.envMap||Zt.isMeshPhongMaterial&&!Zt.envMap;if(nn.envMap=ki.get(Zt.envMap||nn.environment,$n),nn.envMapRotation=nn.environment!==null&&Zt.envMap===null?Ae.environmentRotation:Zt.envMapRotation,Bn===void 0)Zt.addEventListener("dispose",In),Bn=new Map,nn.programs=Bn,nn.programVariants=new Map;let ei=Bn.get(Pn);if(ei!==void 0){if(nn.currentProgram===ei&&nn.lightsStateVersion===Un)return Hh(Zt,bn),ei}else{if(bn.uniforms=mn.getUniforms(Zt),Qt!==null&&Zt.isNodeMaterial)Qt.build(Zt,rn,bn);Zt.onBeforeCompile(bn,Kt),ei=mn.acquireProgram(bn,Pn),Bn.set(Pn,ei),nn.uniforms=bn.uniforms}let Fn=nn.uniforms;if(!Zt.isShaderMaterial&&!Zt.isRawShaderMaterial||Zt.clipping===!0)Fn.clippingPlanes=an.uniform;if(Hh(Zt,bn),nn.needsLights=Sp(Zt),nn.lightsStateVersion=Un,nn.needsLights)Fn.ambientLightColor.value=sn.state.ambient,Fn.lightProbe.value=sn.state.probe,Fn.sunLights.value=sn.state.sun,Fn.sunLightShadows.value=sn.state.sunShadow,Fn.directionalLights.value=sn.state.directional,Fn.directionalLightShadows.value=sn.state.directionalShadow,Fn.spotLights.value=sn.state.spot,Fn.spotLightShadows.value=sn.state.spotShadow,Fn.rectAreaLights.value=sn.state.rectArea,Fn.ltc_1.value=sn.state.rectAreaLTC1,Fn.ltc_2.value=sn.state.rectAreaLTC2,Fn.pointLights.value=sn.state.point,Fn.pointLightShadows.value=sn.state.pointShadow,Fn.hemisphereLights.value=sn.state.hemi,Fn.sunShadowMatrix.value=sn.state.sunShadowMatrix,Fn.sunShadowCascade.value=sn.state.sunShadowCascade,Fn.directionalShadowMatrix.value=sn.state.directionalShadowMatrix,Fn.spotLightMatrix.value=sn.state.spotLightMatrix,Fn.spotLightMap.value=sn.state.spotLightMap,Fn.pointShadowMatrix.value=sn.state.pointShadowMatrix;return nn.numLightProbeGrids=Gh(Xt.state.lightProbeGridArray),nn.currentProgram=ei,nn.uniformsList=null,ei}function xp(Zt,Ae,rn,nn,sn){let An=Xn.get(Zt),Un=An.currentProgram.id+","+nn+","+sn,bn=An.programVariants.get(Un);if(bn===void 0)bn=ao(Zt,Ae,rn),An.programVariants.set(Un,bn);else An.currentProgram=bn,An.uniformsList=null,An.outputColorSpace=nn,An.toneMapping=sn;return bn}function kh(Zt){if(Zt.uniformsList===null){let Ae=Zt.currentProgram.getUniforms();Zt.uniformsList=No.seqWithValue(Ae.seq,Zt.uniforms)}return Zt.uniformsList}function Hh(Zt,Ae){let rn=Xn.get(Zt);rn.outputColorSpace=Ae.outputColorSpace,rn.batching=Ae.batching,rn.batchingColor=Ae.batchingColor,rn.instancing=Ae.instancing,rn.instancingColor=Ae.instancingColor,rn.instancingMorph=Ae.instancingMorph,rn.skinning=Ae.skinning,rn.morphTargets=Ae.morphTargets,rn.morphNormals=Ae.morphNormals,rn.morphColors=Ae.morphColors,rn.morphTargetsCount=Ae.morphTargetsCount,rn.numClippingPlanes=Ae.numClippingPlanes,rn.numIntersection=Ae.numClipIntersection,rn.vertexAlphas=Ae.vertexAlphas,rn.vertexTangents=Ae.vertexTangents,rn.toneMapping=Ae.toneMapping}function yp(Zt,Ae,rn,nn,sn){if(Ae.isScene!==!0)Ae=ts;Jn.resetTextureUnits();let An=Ae.fog,Un=nn.isMeshStandardMaterial||nn.isMeshLambertMaterial||nn.isMeshPhongMaterial?Ae.environment:null,bn=tn===null?Kt.outputColorSpace:tn.isXRRenderTarget===!0?tn.texture.colorSpace:m.workingColorSpace,Pn=nn.isMeshStandardMaterial||nn.isMeshLambertMaterial&&!nn.envMap||nn.isMeshPhongMaterial&&!nn.envMap,Bn=ki.get(nn.envMap||Un,Pn),$n=nn.vertexColors===!0&&!!rn.attributes.color&&rn.attributes.color.itemSize===4,ei=!!rn.attributes.tangent&&(!!nn.normalMap||nn.anisotropy>0),Fn=!!rn.morphAttributes.position,ni=!!rn.morphAttributes.normal,Ri=!!rn.morphAttributes.color,Si=Ts;if(nn.toneMapped){if(tn===null||tn.isXRRenderTarget===!0)Si=Kt.toneMapping}let gi=rn.morphAttributes.position||rn.morphAttributes.normal||rn.morphAttributes.color,Hi=gi!==void 0?gi.length:0,On=Xn.get(nn),$i=Xt.state.lights;if(Ei===!0){if(ji===!0||Zt!==ln){let bi=Zt===ln&&nn.id===yn;an.setState(nn,Zt,bi)}}let ai=!1,rr=!1;if(nn.version===On.__version){if(On.needsLights&&On.lightsStateVersion!==$i.state.version)ai=!0;else if(sn.isBatchedMesh&&On.batching===!1)ai=!0;else if(!sn.isBatchedMesh&&On.batching===!0)ai=!0;else if(sn.isBatchedMesh&&On.batchingColor===!0&&sn._colorsTexture===null)ai=!0;else if(sn.isBatchedMesh&&On.batchingColor===!1&&sn._colorsTexture!==null)ai=!0;else if(sn.isInstancedMesh&&On.instancing===!1)ai=!0;else if(!sn.isInstancedMesh&&On.instancing===!0)ai=!0;else if(sn.isSkinnedMesh&&On.skinning===!1)ai=!0;else if(!sn.isSkinnedMesh&&On.skinning===!0)ai=!0;else if(sn.isInstancedMesh&&On.instancingColor===!0&&sn.instanceColor===null)ai=!0;else if(sn.isInstancedMesh&&On.instancingColor===!1&&sn.instanceColor!==null)ai=!0;else if(sn.isInstancedMesh&&On.instancingMorph===!0&&sn.morphTexture===null)ai=!0;else if(sn.isInstancedMesh&&On.instancingMorph===!1&&sn.morphTexture!==null)ai=!0;else if(On.envMap!==Bn)ai=!0;else if(nn.fog===!0&&On.fog!==An)ai=!0;else if(On.numClippingPlanes!==void 0&&(On.numClippingPlanes!==an.numPlanes||On.numIntersection!==an.numIntersection))ai=!0;else if(On.vertexAlphas!==$n)ai=!0;else if(On.vertexTangents!==ei)ai=!0;else if(On.morphTargets!==Fn)ai=!0;else if(On.morphNormals!==ni)ai=!0;else if(On.morphColors!==Ri)ai=!0;else if(On.morphTargetsCount!==Hi)ai=!0;else if(On.numLightProbeGrids!==Gh(Xt.state.lightProbeGridArray))ai=!0;else if(On.outputColorSpace!==bn||On.toneMapping!==Si)rr=!0}else ai=!0,On.__version=nn.version;let Vi=On.currentProgram;if(ai===!0||rr===!0){if(Vi=rr===!0?xp(nn,Ae,sn,bn,Si):ao(nn,Ae,sn),Qt&&nn.isNodeMaterial)Qt.onUpdateProgram(nn,Vi,On)}let qo=!1,Hs=!1,or=!1,ri=Vi.getUniforms(),Bi=On.uniforms;if(wn.useProgram(Vi.program))qo=!0,Hs=!0,or=!0;if(nn.id!==yn)yn=nn.id,Hs=!0;if(qo||ln!==Zt){if(wn.buffers.depth.getReversed()&&Zt.reversedDepth!==!0)Zt._reversedDepth=!0,Zt.updateProjectionMatrix();ri.setValue(we,"projectionMatrix",Zt.projectionMatrix),ri.setValue(we,"viewMatrix",Zt.matrixWorldInverse);let Ui=ri.map.cameraPosition;if(Ui!==void 0)Ui.setValue(we,wi.setFromMatrixPosition(Zt.matrixWorld));if(Ni.logarithmicDepthBuffer)ri.setValue(we,"logDepthBufFC",2/(Math.log(Zt.far+1)/Math.LN2));if(nn.isMeshPhongMaterial||nn.isMeshToonMaterial||nn.isMeshLambertMaterial||nn.isMeshBasicMaterial||nn.isMeshStandardMaterial||nn.isShaderMaterial)ri.setValue(we,"isOrthographic",Zt.isOrthographicCamera===!0);if(ln!==Zt)ln=Zt,Hs=!0,or=!0}if(On.needsLights){if($i.state.sunShadowMap.length>0)ri.setValue(we,"sunShadowMap",$i.state.sunShadowMap,Jn);if($i.state.directionalShadowMap.length>0)ri.setValue(we,"directionalShadowMap",$i.state.directionalShadowMap,Jn);if($i.state.spotShadowMap.length>0)ri.setValue(we,"spotShadowMap",$i.state.spotShadowMap,Jn);if($i.state.pointShadowMap.length>0)ri.setValue(we,"pointShadowMap",$i.state.pointShadowMap,Jn)}if(sn.isSkinnedMesh){ri.setOptional(we,sn,"bindMatrix"),ri.setOptional(we,sn,"bindMatrixInverse");let bi=sn.skeleton;if(bi){if(bi.boneTexture===null)bi.computeBoneTexture();ri.setValue(we,"boneTexture",bi.boneTexture,Jn)}}if(sn.isBatchedMesh){if(ri.setOptional(we,sn,"batchingTexture"),ri.setValue(we,"batchingTexture",sn._matricesTexture,Jn),ri.setOptional(we,sn,"batchingIdTexture"),ri.setValue(we,"batchingIdTexture",sn._indirectTexture,Jn),ri.setOptional(we,sn,"batchingColorTexture"),sn._colorsTexture!==null)ri.setValue(we,"batchingColorTexture",sn._colorsTexture,Jn)}let ds=rn.morphAttributes;if(ds.position!==void 0||ds.normal!==void 0||ds.color!==void 0)Me.update(sn,rn,Vi);if(Hs||On.receiveShadow!==sn.receiveShadow)On.receiveShadow=sn.receiveShadow,ri.setValue(we,"receiveShadow",sn.receiveShadow);if((nn.isMeshStandardMaterial||nn.isMeshLambertMaterial||nn.isMeshPhongMaterial)&&nn.envMap===null&&Ae.environment!==null)Bi.envMapIntensity.value=Ae.environmentIntensity;if(Bi.dfgLUT!==void 0)Bi.dfgLUT.value=_y();if(Hs){if(ri.setValue(we,"toneMappingExposure",Kt.toneMappingExposure),On.needsLights)vp(Bi,or);if(An&&nn.fog===!0)pn.refreshFogUniforms(Bi,An);if(pn.refreshMaterialUniforms(Bi,nn,Wn,Hn,Xt.state.transmissionRenderTarget[Zt.id]),On.needsLights&&On.numLightProbeGrids>0){let bi=Ht,Ui=0;for(let Ls of Xt.state.lightProbeGridArray){if(Ls.texture===null)continue;bi.textures[Ui]=Ls.texture,bi.min[Ui]=Ls.boundingBox.min,bi.max[Ui]=Ls.boundingBox.max,bi.resolution[Ui]=Ls.resolution,Ui++}for(let Ls in bi)bi[Ls].length=Ui;Bi.probesSH.value=bi.textures,Bi.probesMin.value=bi.min,Bi.probesMax.value=bi.max,Bi.probesResolution.value=bi.resolution}No.upload(we,kh(On),Bi,Jn)}if(nn.isShaderMaterial&&nn.uniformsNeedUpdate===!0)No.upload(we,kh(On),Bi,Jn),nn.uniformsNeedUpdate=!1;if(nn.isSpriteMaterial)ri.setValue(we,"center",sn.center);if(ri.setValue(we,"modelViewMatrix",sn.modelViewMatrix),ri.setValue(we,"normalMatrix",sn.normalMatrix),ri.setValue(we,"modelMatrix",sn.matrixWorld),nn.uniformsGroups!==void 0){let bi=nn.uniformsGroups;for(let Ui=0,Ls=bi.length;Ui<Ls;Ui++){let Wh=bi[Ui];En.update(Wh,Vi),En.bind(Wh,Vi)}}return Vi}function vp(Zt,Ae){Zt.ambientLightColor.needsUpdate=Ae,Zt.lightProbe.needsUpdate=Ae,Zt.sunLights.needsUpdate=Ae,Zt.sunLightShadows.needsUpdate=Ae,Zt.directionalLights.needsUpdate=Ae,Zt.directionalLightShadows.needsUpdate=Ae,Zt.pointLights.needsUpdate=Ae,Zt.pointLightShadows.needsUpdate=Ae,Zt.spotLights.needsUpdate=Ae,Zt.spotLightShadows.needsUpdate=Ae,Zt.rectAreaLights.needsUpdate=Ae,Zt.hemisphereLights.needsUpdate=Ae}function Sp(Zt){return Zt.isMeshLambertMaterial||Zt.isMeshToonMaterial||Zt.isMeshPhongMaterial||Zt.isMeshStandardMaterial||Zt.isShadowMaterial||Zt.isShaderMaterial&&Zt.lights===!0}this.getActiveCubeFace=function(){return Ye},this.getActiveMipmapLevel=function(){return on},this.getRenderTarget=function(){return tn},this.setRenderTargetTextures=function(Zt,Ae,rn){let nn=Xn.get(Zt);if(nn.__autoAllocateDepthBuffer=Zt.resolveDepthBuffer===!1,nn.__autoAllocateDepthBuffer===!1)nn.__useRenderToTexture=!1;Xn.get(Zt.texture).__webglTexture=Ae,Xn.get(Zt.depthTexture).__webglTexture=nn.__autoAllocateDepthBuffer?void 0:rn,nn.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(Zt,Ae){let rn=Xn.get(Zt);rn.__webglFramebuffer=Ae,rn.__useDefaultFramebuffer=Ae===void 0},this.setRenderTarget=function(Zt,Ae=0,rn=0){tn=Zt,Ye=Ae,on=rn;let nn=null,sn=!1,An=!1;if(Zt){let bn=Xn.get(Zt);if(bn.__useDefaultFramebuffer!==void 0){wn.bindFramebuffer(we.FRAMEBUFFER,bn.__webglFramebuffer),dn.copy(Zt.viewport),gn.copy(Zt.scissor),Nn=Zt.scissorTest,wn.viewport(dn),wn.scissor(gn),wn.setScissorTest(Nn),yn=-1;return}else if(bn.__webglFramebuffer===void 0)Jn.setupRenderTarget(Zt);else if(bn.__hasExternalTextures)Jn.rebindTextures(Zt,Xn.get(Zt.texture).__webglTexture,Xn.get(Zt.depthTexture).__webglTexture);else if(Zt.depthBuffer){let $n=Zt.depthTexture;if(bn.__boundDepthTexture!==$n){if($n!==null&&Xn.has($n)&&(Zt.width!==$n.image.width||Zt.height!==$n.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Jn.setupDepthRenderbuffer(Zt)}}let Pn=Zt.texture;if(Pn.isData3DTexture||Pn.isDataArrayTexture||Pn.isCompressedArrayTexture)An=!0;let Bn=Xn.get(Zt).__webglFramebuffer;if(Zt.isWebGLCubeRenderTarget){if(Array.isArray(Bn[Ae]))nn=Bn[Ae][rn];else nn=Bn[Ae];sn=!0}else if(Zt.samples>0&&Jn.useMultisampledRTT(Zt)===!1)nn=Xn.get(Zt).__webglMultisampledFramebuffer;else if(Array.isArray(Bn))nn=Bn[rn];else nn=Bn;dn.copy(Zt.viewport),gn.copy(Zt.scissor),Nn=Zt.scissorTest}else dn.copy(jn).multiplyScalar(Wn).floor(),gn.copy(Kn).multiplyScalar(Wn).floor(),Nn=ui;if(rn!==0)nn=me;if(wn.bindFramebuffer(we.FRAMEBUFFER,nn))wn.drawBuffers(Zt,nn);if(wn.viewport(dn),wn.scissor(gn),wn.setScissorTest(Nn),sn){let bn=Xn.get(Zt.texture);we.framebufferTexture2D(we.FRAMEBUFFER,we.COLOR_ATTACHMENT0,we.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,bn.__webglTexture,rn)}else if(An){let bn=Ae;for(let Pn=0;Pn<Zt.textures.length;Pn++){let Bn=Xn.get(Zt.textures[Pn]);we.framebufferTextureLayer(we.FRAMEBUFFER,we.COLOR_ATTACHMENT0+Pn,Bn.__webglTexture,rn,bn)}}else if(Zt!==null&&rn!==0){let bn=Xn.get(Zt.texture);we.framebufferTexture2D(we.FRAMEBUFFER,we.COLOR_ATTACHMENT0,we.TEXTURE_2D,bn.__webglTexture,rn)}yn=-1};function Vh(Zt){let Ae=Xn.get(Zt);if(Ae.__readFormat!==Zt.format||Ae.__readType!==Zt.type)Ae.__readFormat=Zt.format,Ae.__readType=Zt.type,Ae.__formatReadable=Ni.textureFormatReadable(Zt.format),Ae.__typeReadable=Ni.textureTypeReadable(Zt.type);return Ae}if(this.readRenderTargetPixels=function(Zt,Ae,rn,nn,sn,An,Un,bn=0){if(!(Zt&&Zt.isWebGLRenderTarget)){qn("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pn=Xn.get(Zt).__webglFramebuffer;if(Zt.isWebGLCubeRenderTarget&&Un!==void 0){if(Pn=Pn[Un],Array.isArray(Pn))Pn=Pn[0]}if(Pn){wn.bindFramebuffer(we.FRAMEBUFFER,Pn);try{let Bn=Zt.textures[bn],{format:$n,type:ei}=Bn;if(Zt.textures.length>1)we.readBuffer(we.COLOR_ATTACHMENT0+bn);let Fn=Vh(Bn);if(Fn.__formatReadable===!1){qn("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Fn.__typeReadable===!1){qn("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(Ae>=0&&Ae<=Zt.width-nn&&(rn>=0&&rn<=Zt.height-sn))we.readPixels(Ae,rn,nn,sn,xn.convert($n),xn.convert(ei),An)}finally{let Bn=tn!==null?Xn.get(tn).__webglFramebuffer:null;wn.bindFramebuffer(we.FRAMEBUFFER,Bn)}}},this.readRenderTargetPixelsAsync=async function(Zt,Ae,rn,nn,sn,An,Un,bn=0){if(!(Zt&&Zt.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pn=Xn.get(Zt).__webglFramebuffer;if(Zt.isWebGLCubeRenderTarget&&Un!==void 0){if(Pn=Pn[Un],Array.isArray(Pn))Pn=Pn[0]}if(Pn)if(Ae>=0&&Ae<=Zt.width-nn&&(rn>=0&&rn<=Zt.height-sn)){wn.bindFramebuffer(we.FRAMEBUFFER,Pn);let Bn=Zt.textures[bn],{format:$n,type:ei}=Bn;if(Zt.textures.length>1)we.readBuffer(we.COLOR_ATTACHMENT0+bn);let Fn=Vh(Bn);if(Fn.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Fn.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ni=we.createBuffer();we.bindBuffer(we.PIXEL_PACK_BUFFER,ni),we.bufferData(we.PIXEL_PACK_BUFFER,An.byteLength,we.STREAM_READ),we.readPixels(Ae,rn,nn,sn,xn.convert($n),xn.convert(ei),0),we.bindBuffer(we.PIXEL_PACK_BUFFER,null);let Ri=tn!==null?Xn.get(tn).__webglFramebuffer:null;wn.bindFramebuffer(we.FRAMEBUFFER,Ri);let Si=we.fenceSync(we.SYNC_GPU_COMMANDS_COMPLETE,0);return we.flush(),await Rf(we,Si,4),we.bindBuffer(we.PIXEL_PACK_BUFFER,ni),we.getBufferSubData(we.PIXEL_PACK_BUFFER,0,An),we.bindBuffer(we.PIXEL_PACK_BUFFER,null),we.deleteBuffer(ni),we.deleteSync(Si),An}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(Zt,Ae=null,rn=0){let nn=Math.pow(2,-rn),sn=Math.floor(Zt.image.width*nn),An=Math.floor(Zt.image.height*nn),Un=Ae!==null?Ae.x:0,bn=Ae!==null?Ae.y:0;Jn.setTexture2D(Zt,0),we.copyTexSubImage2D(we.TEXTURE_2D,rn,0,0,Un,bn,sn,An),wn.unbindTexture()},this.copyTextureToTexture=function(Zt,Ae,rn=null,nn=null,sn=0,An=0){let Un,bn,Pn,Bn,$n,ei,Fn,ni,Ri,Si=Zt.isCompressedTexture?Zt.mipmaps[An]:Zt.image;if(rn!==null)Un=rn.max.x-rn.min.x,bn=rn.max.y-rn.min.y,Pn=rn.isBox3?rn.max.z-rn.min.z:1,Bn=rn.min.x,$n=rn.min.y,ei=rn.isBox3?rn.min.z:0;else{let ri=Math.pow(2,-sn);if(Un=Math.floor(Si.width*ri),bn=Math.floor(Si.height*ri),Zt.isDataArrayTexture)Pn=Si.depth;else if(Zt.isData3DTexture)Pn=Math.floor(Si.depth*ri);else Pn=1;Bn=0,$n=0,ei=0}if(nn!==null)Fn=nn.x,ni=nn.y,Ri=nn.z;else Fn=0,ni=0,Ri=0;let gi=xn.convert(Ae.format),Hi=xn.convert(Ae.type),On;if(Ae.isData3DTexture)Jn.setTexture3D(Ae,0),On=we.TEXTURE_3D;else if(Ae.isDataArrayTexture||Ae.isCompressedArrayTexture)Jn.setTexture2DArray(Ae,0),On=we.TEXTURE_2D_ARRAY;else Jn.setTexture2D(Ae,0),On=we.TEXTURE_2D;wn.activeTexture(we.TEXTURE0),wn.pixelStorei(we.UNPACK_FLIP_Y_WEBGL,Ae.flipY),wn.pixelStorei(we.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Ae.premultiplyAlpha),wn.pixelStorei(we.UNPACK_ALIGNMENT,Ae.unpackAlignment);let $i=wn.getParameter(we.UNPACK_ROW_LENGTH),ai=wn.getParameter(we.UNPACK_IMAGE_HEIGHT),rr=wn.getParameter(we.UNPACK_SKIP_PIXELS),Vi=wn.getParameter(we.UNPACK_SKIP_ROWS),qo=wn.getParameter(we.UNPACK_SKIP_IMAGES);wn.pixelStorei(we.UNPACK_ROW_LENGTH,Si.width),wn.pixelStorei(we.UNPACK_IMAGE_HEIGHT,Si.height),wn.pixelStorei(we.UNPACK_SKIP_PIXELS,Bn),wn.pixelStorei(we.UNPACK_SKIP_ROWS,$n),wn.pixelStorei(we.UNPACK_SKIP_IMAGES,ei);let Hs=Zt.isDataArrayTexture||Zt.isData3DTexture,or=Ae.isDataArrayTexture||Ae.isData3DTexture;if(Zt.isDepthTexture){let ri=Xn.get(Zt),Bi=Xn.get(Ae),ds=Xn.get(ri.__renderTarget),bi=Xn.get(Bi.__renderTarget);wn.bindFramebuffer(we.READ_FRAMEBUFFER,ds.__webglFramebuffer),wn.bindFramebuffer(we.DRAW_FRAMEBUFFER,bi.__webglFramebuffer);for(let Ui=0;Ui<Pn;Ui++){if(Hs)we.framebufferTextureLayer(we.READ_FRAMEBUFFER,we.COLOR_ATTACHMENT0,Xn.get(Zt).__webglTexture,sn,ei+Ui),we.framebufferTextureLayer(we.DRAW_FRAMEBUFFER,we.COLOR_ATTACHMENT0,Xn.get(Ae).__webglTexture,An,Ri+Ui);we.blitFramebuffer(Bn,$n,Bn+Un,$n+bn,Fn,ni,Fn+Un,ni+bn,we.DEPTH_BUFFER_BIT,we.NEAREST)}wn.bindFramebuffer(we.READ_FRAMEBUFFER,null),wn.bindFramebuffer(we.DRAW_FRAMEBUFFER,null)}else if(sn!==0||Zt.isRenderTargetTexture||Xn.has(Zt)){let ri=Xn.get(Zt),Bi=Xn.get(Ae);wn.bindFramebuffer(we.READ_FRAMEBUFFER,Ee),wn.bindFramebuffer(we.DRAW_FRAMEBUFFER,jt);for(let ds=0;ds<Pn;ds++){if(Hs)we.framebufferTextureLayer(we.READ_FRAMEBUFFER,we.COLOR_ATTACHMENT0,ri.__webglTexture,sn,ei+ds);else we.framebufferTexture2D(we.READ_FRAMEBUFFER,we.COLOR_ATTACHMENT0,we.TEXTURE_2D,ri.__webglTexture,sn);if(or)we.framebufferTextureLayer(we.DRAW_FRAMEBUFFER,we.COLOR_ATTACHMENT0,Bi.__webglTexture,An,Ri+ds);else we.framebufferTexture2D(we.DRAW_FRAMEBUFFER,we.COLOR_ATTACHMENT0,we.TEXTURE_2D,Bi.__webglTexture,An);if(sn!==0)we.blitFramebuffer(Bn,$n,Bn+Un,$n+bn,Fn,ni,Fn+Un,ni+bn,we.COLOR_BUFFER_BIT,we.NEAREST);else if(or)we.copyTexSubImage3D(On,An,Fn,ni,Ri+ds,Bn,$n,Un,bn);else we.copyTexSubImage2D(On,An,Fn,ni,Bn,$n,Un,bn)}wn.bindFramebuffer(we.READ_FRAMEBUFFER,null),wn.bindFramebuffer(we.DRAW_FRAMEBUFFER,null)}else if(or)if(Zt.isDataTexture||Zt.isData3DTexture)we.texSubImage3D(On,An,Fn,ni,Ri,Un,bn,Pn,gi,Hi,Si.data);else if(Ae.isCompressedArrayTexture)we.compressedTexSubImage3D(On,An,Fn,ni,Ri,Un,bn,Pn,gi,Si.data);else we.texSubImage3D(On,An,Fn,ni,Ri,Un,bn,Pn,gi,Hi,Si);else if(Zt.isDataTexture)we.texSubImage2D(we.TEXTURE_2D,An,Fn,ni,Un,bn,gi,Hi,Si.data);else if(Zt.isCompressedTexture)we.compressedTexSubImage2D(we.TEXTURE_2D,An,Fn,ni,Si.width,Si.height,gi,Si.data);else we.texSubImage2D(we.TEXTURE_2D,An,Fn,ni,Un,bn,gi,Hi,Si);if(wn.pixelStorei(we.UNPACK_ROW_LENGTH,$i),wn.pixelStorei(we.UNPACK_IMAGE_HEIGHT,ai),wn.pixelStorei(we.UNPACK_SKIP_PIXELS,rr),wn.pixelStorei(we.UNPACK_SKIP_ROWS,Vi),wn.pixelStorei(we.UNPACK_SKIP_IMAGES,qo),An===0&&Ae.generateMipmaps===!0&&Ae.mipmapsAutoUpdate===!0)we.generateMipmap(On);wn.unbindTexture()},this.initRenderTarget=function(Zt){if(Xn.get(Zt).__webglFramebuffer===void 0)Jn.setupRenderTarget(Zt)},this.initTexture=function(Zt){if(Zt.isCubeTexture)Jn.setTextureCube(Zt,0);else if(Zt.isData3DTexture)Jn.setTexture3D(Zt,0);else if(Zt.isDataArrayTexture||Zt.isCompressedArrayTexture)Jn.setTexture2DArray(Zt,0);else Jn.setTexture2D(Zt,0);wn.unbindTexture()},this.resetState=function(){Ye=0,on=0,tn=null,wn.reset(),vn.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zc}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=m._getDrawingBufferColorSpace(t),e.unpackColorSpace=m._getUnpackColorSpace()}}var Ed=0,wd=1,Rd=2;var uh=2;var Wa=1.25,fh=1,Oi=32,pi=8,Xa=65535;var qr=Math.pow(2,-24),Uo=Symbol("SKIP_GENERATION"),qa={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Uo]:!1};function xi(t,e,i){return i.min.x=e[t],i.min.y=e[t+1],i.min.z=e[t+2],i.max.x=e[t+3],i.max.y=e[t+4],i.max.z=e[t+5],i}function Fo(t){let e=-1,i=-1/0;for(let s=0;s<3;s++){let a=t[s+3]-t[s];if(a>i)i=a,e=s}return e}function dh(t,e,i){for(let s=0;s<3;s++){let a=e[t+2*s],c=e[t+2*s+1],d=a-c,p=a+c;if(d<i[s])i[s]=d;if(p>i[s+3])i[s+3]=p}}function Ya(t){let e=t[3]-t[0],i=t[4]-t[1],s=t[5]-t[2];return 2*(e*i+i*s+s*e)}function si(t,e){return e[t+15]===Xa}function hi(t,e){return e[t+6]}function mi(t,e){return e[t+14]}function li(t){return t+pi}function ci(t,e){let i=e[t+6];return t+i*pi}function Yr(t,e){return e[t+7]}function Mi(t){return t}function Za(t,e,i,s,a){let c=1/0,d=1/0,p=1/0,S=-1/0,E=-1/0,N=-1/0,D=1/0,L=1/0,tt=1/0,vt=-1/0,zt=-1/0,nt=-1/0,yt=t.offset||0;for(let Dt=(e-yt)*6,Ht=(e+i-yt)*6;Dt<Ht;Dt+=6){let Ft=t[Dt+0],Xt=t[Dt+1],Jt=Ft-Xt,gt=Ft+Xt;if(Jt<c)c=Jt;if(gt>S)S=gt;if(Ft<D)D=Ft;if(Ft>vt)vt=Ft;let Ot=t[Dt+2],Kt=t[Dt+3],pe=Ot-Kt,Qt=Ot+Kt;if(pe<d)d=pe;if(Qt>E)E=Qt;if(Ot<L)L=Ot;if(Ot>zt)zt=Ot;let me=t[Dt+4],Ee=t[Dt+5],jt=me-Ee,Ye=me+Ee;if(jt<p)p=jt;if(Ye>N)N=Ye;if(me<tt)tt=me;if(me>nt)nt=me}s[0]=c,s[1]=d,s[2]=p,s[3]=S,s[4]=E,s[5]=N,a[0]=D,a[1]=L,a[2]=tt,a[3]=vt,a[4]=zt,a[5]=nt}var Is=8,mh=8,ph=new Int32Array(Is),Cs=new Float32Array(Is*6),Zr=new Float32Array(Is*6),ys=new Float32Array(6),Ja=new Float32Array(6),tr=new Int32Array(mh),Cd=new Float32Array(mh*6);function yy(t,e,i,s){for(let a=0;a<3;a++){let c=e[t+2*a],d=e[t+2*a+1],p=c-d,S=c+d;if(p<i[s+a])i[s+a]=p;if(S>i[s+a+3])i[s+a+3]=S}}function Id(t,e){let i=t[e+3]-t[e],s=t[e+4]-t[e+1],a=t[e+5]-t[e+2];return 2*(i*s+s*a+a*i)}function Pd(t,e,i,s,a,c){let d=-1,p=0;if(c===Ed){if(d=Fo(e),d!==-1)p=(e[d]+e[d+3])/2}else if(c===wd){if(d=Fo(t),d!==-1)p=vy(i,s,a,d)}else if(c===Rd){let S=Ya(t),E=Wa*a,N=i.offset||0,D=(s-N)*6,L=(s+a-N)*6;for(let tt=0;tt<3;tt++){let vt=e[tt],yt=(e[tt+3]-vt)/Is;if(a<mh){for(let Dt=0;Dt<a;Dt++){let Ht=D+Dt*6,Ft=i[Ht+2*tt],Xt=Dt;while(Xt>0&&i[tr[Xt-1]+2*tt]>Ft)tr[Xt]=tr[Xt-1],Xt--;tr[Xt]=Ht}for(let Dt=0;Dt<3;Dt++)ys[Dt]=1/0,ys[Dt+3]=-1/0,Ja[Dt]=1/0,Ja[Dt+3]=-1/0;for(let Dt=a-1;Dt>=0;Dt--)dh(tr[Dt],i,Ja),Cd.set(Ja,Dt*6);for(let Dt=0;Dt<a-1;Dt++){dh(tr[Dt],i,ys);let Ht=i[tr[Dt+1]+2*tt];if(i[tr[Dt]+2*tt]===Ht)continue;let Ft=Dt+1,Xt=a-Ft,Jt=Ya(ys)/S,gt=Id(Cd,Ft*6)/S,Ot=fh+Wa*(Jt*Ft+gt*Xt);if(Ot<E)d=tt,E=Ot,p=Ht}}else{for(let Ft=0;Ft<Is;Ft++){ph[Ft]=0;for(let Xt=0;Xt<3;Xt++)Cs[Ft*6+Xt]=1/0,Cs[Ft*6+Xt+3]=-1/0}for(let Ft=D;Ft<L;Ft+=6){let gt=~~((i[Ft+2*tt]-vt)/yt);if(gt>=Is)gt=Is-1;ph[gt]++,yy(Ft,i,Cs,gt*6)}let Dt=(Is-1)*6;for(let Ft=0;Ft<6;Ft++)Zr[Dt+Ft]=Cs[Dt+Ft];for(let Ft=Is-2;Ft>=0;Ft--){let Xt=Ft*6,Jt=Xt+6;for(let gt=0;gt<3;gt++)Zr[Xt+gt]=Math.min(Cs[Xt+gt],Zr[Jt+gt]),Zr[Xt+gt+3]=Math.max(Cs[Xt+gt+3],Zr[Jt+gt+3])}let Ht=0;for(let Ft=0;Ft<Is-1;Ft++){let Xt=Ft*6,Jt=ph[Ft];if(Jt!==0)for(let Qt=0;Qt<3;Qt++)if(Ht===0)ys[Qt]=Cs[Xt+Qt],ys[Qt+3]=Cs[Xt+Qt+3];else ys[Qt]=Math.min(ys[Qt],Cs[Xt+Qt]),ys[Qt+3]=Math.max(ys[Qt+3],Cs[Xt+Qt+3]);Ht+=Jt;let gt=0,Ot=0;if(Ht!==0)gt=Ya(ys)/S;let Kt=a-Ht;if(Kt!==0)Ot=Id(Zr,Xt+6)/S;let pe=fh+Wa*(gt*Ht+Ot*Kt);if(pe<E)d=tt,E=pe,p=vt+yt+Ft*yt}}}}else console.warn(`BVH: Invalid build strategy value ${c} used.`);return{axis:d,pos:p}}function vy(t,e,i,s){let a=0,c=t.offset;for(let d=e,p=e+i;d<p;d++)a+=t[(d-c)*6+s*2];return a/i}function Ld(t,e,i,s,a,c){let d=s,p=s+a-1,S=c.pos,E=c.axis*2,N=i.offset||0;while(!0){while(d<=p&&i[(d-N)*6+E]<S)d++;while(d<=p&&i[(p-N)*6+E]>=S)p--;if(d<p){for(let D=0;D<e;D++){let L=t[d*e+D];t[d*e+D]=t[p*e+D],t[p*e+D]=L}for(let D=0;D<6;D++){let L=d-N,tt=p-N,vt=i[L*6+D];i[L*6+D]=i[tt*6+D],i[tt*6+D]=vt}d++,p--}else return d}}var Sy=Math.pow(2,32),Jr=new Float32Array(6),$a=new Float32Array(6);function My(t,e,i,s,a,c){let{maxDepth:d,verbose:p,targetLeafSize:S,_strictLeafSize:E=1/0,strategy:N,onProgress:D,useSharedArrayBuffer:L=!1}=a,{primitiveBuffer:tt,primitiveBufferStride:vt}=t,nt=new(L?SharedArrayBuffer:ArrayBuffer)(Oi*Math.max(1,2*Math.ceil(s)-1)),yt=new Float32Array(nt),Dt=new Uint32Array(nt),Ht=new Uint16Array(nt),Ft=0,Xt=!1;return Za(e,i,s,Jr,$a),Ot(i,s,0),nt.slice(0,Ft*Oi);function Jt(Kt){if(D)D((Kt-c.offset)/c.count)}function gt(Kt,pe,Qt){let me=Kt*2;Dt[Kt+6]=pe,Ht[me+14]=Qt,Ht[me+15]=Xa,Jt(pe+Qt)}function Ot(Kt,pe,Qt){let me=Ft++,Ee=me*pi;if(yt.set(Jr,Ee),!Xt&&Qt>=d){if(Xt=!0,p)console.warn(`BVH: Max depth of ${d} reached when generating BVH. Consider increasing maxDepth.`)}let jt=pe>E;if(pe<=S&&!jt||Qt>=d){gt(Ee,Kt,pe);return}let Ye=Pd(Jr,$a,e,Kt,pe,N),on=Ye.axis===-1?-1:Ld(tt,vt,e,Kt,pe,Ye);if(Ye.axis===-1||on===Kt||on===Kt+pe){if(!jt){gt(Ee,Kt,pe);return}Ye.axis=Math.max(0,Fo(Jr)),on=Kt+Math.max(1,Math.floor(pe/2))}Dt[Ee+7]=Ye.axis;let tn=on-Kt;Za(e,Kt,tn,Jr,$a),Ot(Kt,tn,Qt+1);let yn=Ft-me;if(yn>Sy)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");Dt[Ee+6]=yn;let ln=pe-tn;Za(e,on,ln,Jr,$a),Ot(on,ln,Qt+1)}}function Nd(t,e){let i=t.getRootRanges(e.range),s=i[0],a=i[i.length-1],c={offset:s.offset,count:a.offset+a.count-s.offset},d=new Float32Array(6*c.count);d.offset=c.offset,t.computePrimitiveBounds(c.offset,c.count,d),t._roots=i.map((p)=>My(t,d,p.offset,p.count,e,c))}class yr{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;if(t.length===0)return this._getNewPrimitive();else return t.pop()}releasePrimitive(t){this._primitives.push(t)}}class Dd{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=(i)=>{if(e)t.push(e);e=i,this.float32Array=new Float32Array(i),this.uint16Array=new Uint16Array(i),this.uint32Array=new Uint32Array(i)},this.clearBuffer=()=>{if(e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0)this.setBuffer(t.pop())}}}var ti=new Dd;var er,Kr,$r=[],Ka=new yr(()=>new h);function Ud(t,e,i,s,a,c){er=Ka.getPrimitive(),Kr=Ka.getPrimitive(),$r.push(er,Kr),ti.setBuffer(t._roots[e]);let d=gh(0,t.geometry,i,s,a,c);ti.clearBuffer(),Ka.releasePrimitive(er),Ka.releasePrimitive(Kr),$r.pop(),$r.pop();let p=$r.length;if(p>0)Kr=$r[p-1],er=$r[p-2];return d}function gh(t,e,i,s,a=null,c=0,d=0){let{float32Array:p,uint16Array:S,uint32Array:E}=ti,N=t*2;if(si(N,S)){let L=hi(t,E),tt=mi(N,S);return xi(Mi(t),p,er),s(L,tt,!1,d,c+t/pi,er)}else{let pe=function(me){let{uint16Array:Ee,uint32Array:jt}=ti,Ye=me*2;while(!si(Ye,Ee))me=li(me),Ye=me*2;return hi(me,jt)},Qt=function(me){let{uint16Array:Ee,uint32Array:jt}=ti,Ye=me*2;while(!si(Ye,Ee))me=ci(me,jt),Ye=me*2;return hi(me,jt)+mi(Ye,Ee)},L=li(t),tt=ci(t,E),vt=L,zt=tt,nt,yt,Dt,Ht;if(a){if(Dt=er,Ht=Kr,xi(Mi(vt),p,Dt),xi(Mi(zt),p,Ht),nt=a(Dt),yt=a(Ht),yt<nt){vt=tt,zt=L;let me=nt;nt=yt,yt=me,Dt=Ht}}if(!Dt)Dt=er,xi(Mi(vt),p,Dt);let Ft=si(vt*2,S),Xt=i(Dt,Ft,nt,d+1,c+vt/pi),Jt;if(Xt===uh){let me=pe(vt),jt=Qt(vt)-me;Jt=s(me,jt,!0,d+1,c+vt/pi,Dt)}else Jt=Xt&&gh(vt,e,i,s,a,c,d+1);if(Jt)return!0;Ht=Kr,xi(Mi(zt),p,Ht);let gt=si(zt*2,S),Ot=i(Ht,gt,yt,d+1,c+zt/pi),Kt;if(Ot===uh){let me=pe(zt),jt=Qt(zt)-me;Kt=s(me,jt,!0,d+1,c+zt/pi,Ht)}else Kt=Ot&&gh(zt,e,i,s,a,c,d+1);if(Kt)return!0;return!1}}var Oo=new ti.constructor,Qa=new ti.constructor,nr=new yr(()=>new h),Qr=new h,jr=new h,_h=new h,xh=new h,yh=!1;function Fd(t,e,i,s){if(yh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");yh=!0;let a=t._roots,c=e._roots,d,p=0,S=0,E=new r().copy(i).invert();for(let N=0,D=a.length;N<D;N++){Oo.setBuffer(a[N]),S=0;let L=nr.getPrimitive();xi(Mi(0),Oo.float32Array,L),L.applyMatrix4(E);for(let tt=0,vt=c.length;tt<vt;tt++)if(Qa.setBuffer(c[tt]),d=vs(0,0,i,E,s,p,S,0,0,L),Qa.clearBuffer(),S+=c[tt].byteLength/Oi,d)break;if(nr.releasePrimitive(L),Oo.clearBuffer(),p+=a[N].byteLength/Oi,d)break}return yh=!1,d}function vs(t,e,i,s,a,c=0,d=0,p=0,S=0,E=null,N=!1){let D,L;if(N)D=Qa,L=Oo;else D=Oo,L=Qa;let tt=D.float32Array,vt=D.uint32Array,zt=D.uint16Array,nt=L.float32Array,yt=L.uint32Array,Dt=L.uint16Array,Ht=t*2,Ft=e*2,Xt=si(Ht,zt),Jt=si(Ft,Dt),gt=!1;if(Jt&&Xt)if(N)gt=a(hi(e,yt),mi(e*2,Dt),hi(t,vt),mi(t*2,zt),S,d+e/pi,p,c+t/pi);else gt=a(hi(t,vt),mi(t*2,zt),hi(e,yt),mi(e*2,Dt),p,c+t/pi,S,d+e/pi);else if(Jt){let Ot=nr.getPrimitive();xi(Mi(e),nt,Ot),Ot.applyMatrix4(i);let Kt=li(t),pe=ci(t,vt);xi(Mi(Kt),tt,Qr),xi(Mi(pe),tt,jr);let Qt=Ot.intersectsBox(Qr),me=Ot.intersectsBox(jr);gt=Qt&&vs(e,Kt,s,i,a,d,c,S,p+1,Ot,!N)||me&&vs(e,pe,s,i,a,d,c,S,p+1,Ot,!N),nr.releasePrimitive(Ot)}else{let Ot=li(e),Kt=ci(e,yt);xi(Mi(Ot),nt,_h),xi(Mi(Kt),nt,xh);let pe=E.intersectsBox(_h),Qt=E.intersectsBox(xh);if(pe&&Qt)gt=vs(t,Ot,i,s,a,c,d,p,S+1,E,N)||vs(t,Kt,i,s,a,c,d,p,S+1,E,N);else if(pe)if(Xt)gt=vs(t,Ot,i,s,a,c,d,p,S+1,E,N);else{let me=nr.getPrimitive();me.copy(_h).applyMatrix4(i);let Ee=li(t),jt=ci(t,vt);xi(Mi(Ee),tt,Qr),xi(Mi(jt),tt,jr);let Ye=me.intersectsBox(Qr),on=me.intersectsBox(jr);gt=Ye&&vs(Ot,Ee,s,i,a,d,c,S,p+1,me,!N)||on&&vs(Ot,jt,s,i,a,d,c,S,p+1,me,!N),nr.releasePrimitive(me)}else if(Qt)if(Xt)gt=vs(t,Kt,i,s,a,c,d,p,S+1,E,N);else{let me=nr.getPrimitive();me.copy(xh).applyMatrix4(i);let Ee=li(t),jt=ci(t,vt);xi(Mi(Ee),tt,Qr),xi(Mi(jt),tt,jr);let Ye=me.intersectsBox(Qr),on=me.intersectsBox(jr);gt=Ye&&vs(Kt,Ee,s,i,a,d,c,S,p+1,me,!N)||on&&vs(Kt,jt,s,i,a,d,c,S,p+1,me,!N),nr.releasePrimitive(me)}}return gt}var ja=new class{constructor(){let t=null,e=null,i=null,s=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(c,d)=>{if(s)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=d,this.buffer=t=c._roots[d],this.uint16Array=i=new Uint16Array(t),this.uint32Array=e=new Uint32Array(t)},this.reset=()=>{this.root=null,this.buffer=t=null,this.uint16Array=i=null,this.uint32Array=e=null},this.getRangeStart=(c)=>{let d=c*2;while(!si(d,i))c=li(c),d=c*2;return hi(c,e)},this.getRangeEnd=(c)=>{let d=c*2;while(!si(d,i))c=ci(c,e),d=c*2;return hi(c,e)+mi(d,i)};let a=(c,d,p)=>{let S=d*2,E=si(S,i);if(!c(p,E,d)&&!E){let D=li(d),L=ci(d,e);a(c,D,p+1),a(c,L,p+1)}};this.traverseBuffer=(c)=>{if(s)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");s=!0;try{a(c,0,0)}finally{s=!1}},this.traverse=(c)=>{this.traverseBuffer((d,p,S)=>{if(p){let E=S*2,N=e[S+6],D=i[E+14];return c(d,p,new Float32Array(t,S*4,6),N,D)}else{let E=Yr(S,e);return c(d,p,new Float32Array(t,S*4,6),E)}})}}};var Od=new h,to=new Float32Array(6);class vh{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){if(t={...qa,...t},"maxLeafSize"in t)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize};Nd(this,t)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,i,s){let a=1/0,c=1/0,d=1/0,p=-1/0,S=-1/0,E=-1/0;for(let N=t,D=t+e;N<D;N++){this.writePrimitiveBounds(N,to,0);let[L,tt,vt,zt,nt,yt]=to;if(L<a)a=L;if(zt>p)p=zt;if(tt<c)c=tt;if(nt>S)S=nt;if(vt<d)d=vt;if(yt>E)E=yt}return i[s+0]=a,i[s+1]=c,i[s+2]=d,i[s+3]=p,i[s+4]=S,i[s+5]=E,i}computePrimitiveBounds(t,e,i){let s=i.offset||0;for(let a=t,c=t+e;a<c;a++){this.writePrimitiveBounds(a,to,0);let[d,p,S,E,N,D]=to,L=(d+E)/2,tt=(p+N)/2,vt=(S+D)/2,zt=(E-d)/2,nt=(N-p)/2,yt=(D-S)/2,Dt=(a-s)*6;i[Dt+0]=L,i[Dt+1]=zt+(Math.abs(L)+zt)*qr,i[Dt+2]=tt,i[Dt+3]=nt+(Math.abs(tt)+nt)*qr,i[Dt+4]=vt,i[Dt+5]=yt+(Math.abs(vt)+yt)*qr}return i}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let i=0,s=e.length;i<s;i++)e[i]+=t;else{let i=this._roots;for(let s=0;s<i.length;s++){let a=i[s],c=new Uint32Array(a),d=new Uint16Array(a),p=a.byteLength/Oi;for(let S=0;S<p;S++){let E=pi*S,N=2*E;if(si(N,d))c[E+6]+=t}}}}traverse(t,e=0){ja.setBVH(this,e),ja.traverse(t),ja.reset()}refit(){let t=this._roots;for(let e=0,i=t.length;e<i;e++){let s=t[e],a=new Uint32Array(s),c=new Uint16Array(s),d=new Float32Array(s),p=s.byteLength/Oi;for(let S=p-1;S>=0;S--){let E=S*pi,N=E*2;if(si(N,c)){let L=hi(E,a),tt=mi(N,c);this.writePrimitiveRangeBounds(L,tt,to,0),d.set(to,E)}else{let L=li(E),tt=ci(E,a);for(let vt=0;vt<3;vt++){let zt=d[L+vt],nt=d[L+vt+3],yt=d[tt+vt],Dt=d[tt+vt+3];d[E+vt]=zt<yt?zt:yt,d[E+vt+3]=nt>Dt?nt:Dt}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach((i)=>{xi(0,new Float32Array(i),Od),t.union(Od)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:i,intersectsRange:s,intersectsPrimitive:a,scratchPrimitive:c,iterate:d}=t;if(s&&a){let N=s;s=(D,L,tt,vt,zt)=>{if(!N(D,L,tt,vt,zt))return d(D,L,this,a,tt,vt,c);return!0}}else if(!s)if(a)s=(N,D,L,tt)=>d(N,D,this,a,L,tt,c);else s=(N,D,L)=>L;let p=!1,S=0,E=this._roots;for(let N=0,D=E.length;N<D;N++){let L=E[N];if(p=Ud(this,N,i,s,e,S),p)break;S+=L.byteLength/Oi}return p}bvhcast(t,e,i){let{intersectsRanges:s}=i;return Fd(this,t,e,s)}}function Bd(){return typeof SharedArrayBuffer<"u"}function Sh(t){return t.index?t.index.count:t.attributes.position.count}function ir(t){return Sh(t)/3}function by(t,e=ArrayBuffer){if(t>65535)return new Uint32Array(new e(4*t));else return new Uint16Array(new e(2*t))}function zd(t,e){if(!t.index){let i=t.attributes.position.count,s=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,a=by(i,s);t.setIndex(new _(a,1));for(let c=0;c<i;c++)a[c]=c}}function Ty(t,e,i){let s=Sh(t)/i,a=e?e:t.drawRange,c=a.start/i,d=(a.start+a.count)/i,p=Math.max(0,c),S=Math.min(s,d)-p;return{offset:Math.floor(p),count:Math.floor(S)}}function Ay(t,e){return t.groups.map((i)=>({offset:i.start/e,count:i.count/e}))}function Mh(t,e,i){let s=Ty(t,e,i),a=Ay(t,i);if(!a.length)return[s];let c=[],d=s.offset,p=s.offset+s.count,S=Sh(t)/i,E=[];for(let L of a){let{offset:tt,count:vt}=L,zt=tt,nt=isFinite(vt)?vt:S-tt,yt=tt+nt;if(zt<p&&yt>d)E.push({pos:Math.max(d,zt),isStart:!0}),E.push({pos:Math.min(p,yt),isStart:!1})}E.sort((L,tt)=>{if(L.pos!==tt.pos)return L.pos-tt.pos;else return L.type==="end"?-1:1});let N=0,D=null;for(let L of E){let tt=L.pos;if(N!==0&&tt!==D)c.push({offset:D,count:tt-D});N+=L.isStart?1:-1,D=tt}return c}function Ey(t,e){let i=t[t.length-1],s=i.offset+i.count>65536,a=t.reduce((E,N)=>E+N.count,0),c=s?4:2,d=e?new SharedArrayBuffer(a*c):new ArrayBuffer(a*c),p=s?new Uint32Array(d):new Uint16Array(d),S=0;for(let E=0;E<t.length;E++){let{offset:N,count:D}=t[E];for(let L=0;L<D;L++)p[S+L]=N+L;S+=D}return p}class bh extends vh{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(!t.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(t.index&&t.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(e.useSharedArrayBuffer&&!Bd())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=t,this.resolvePrimitiveIndex=e.indirect?(i)=>this._indirectBuffer[i]:(i)=>i,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...qa,...e},!e[Uo])this.init(e)}init(t){let{geometry:e,primitiveStride:i}=this;if(t.indirect){let s=Mh(e,t.range,i),a=Ey(s,t.useSharedArrayBuffer);this._indirectBuffer=a}else zd(e,t);if(super.init(t),!e.boundingBox&&t.setBoundingBox)e.boundingBox=this.getBoundingBox(new h)}getRootRanges(t){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return Mh(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class ls{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let i=1/0,s=-1/0;for(let a=0,c=t.length;a<c;a++){let p=t[a][e];i=p<i?p:i,s=p>s?p:s}this.min=i,this.max=s}setFromPoints(t,e){let i=1/0,s=-1/0;for(let a=0,c=e.length;a<c;a++){let d=e[a],p=t.dot(d);i=p<i?p:i,s=p>s?p:s}this.min=i,this.max=s}isSeparated(t){return this.min>t.max||t.min>this.max}}ls.prototype.setFromBox=function(){let t=new n;return function(i,s){let{min:a,max:c}=s,d=1/0,p=-1/0;for(let S=0;S<=1;S++)for(let E=0;E<=1;E++)for(let N=0;N<=1;N++){t.x=a.x*S+c.x*(1-S),t.y=a.y*E+c.y*(1-E),t.z=a.z*N+c.z*(1-N);let D=i.dot(t);d=Math.min(D,d),p=Math.max(D,p)}this.min=d,this.max=p}}();var Yb=function(){let t=new ls;return function(i,s){let{points:a,satAxes:c,satBounds:d}=i,{points:p,satAxes:S,satBounds:E}=s;for(let N=0;N<3;N++){let D=d[N],L=c[N];if(t.setFromPoints(L,p),D.isSeparated(t))return!1}for(let N=0;N<3;N++){let D=E[N],L=S[N];if(t.setFromPoints(L,a),D.isSeparated(t))return!1}}}();var wy=function(){let t=new n,e=new n,i=new n;return function(a,c,d){let p=a.start,S=t,E=c.start,N=e;i.subVectors(p,E),t.subVectors(a.end,a.start),e.subVectors(c.end,c.start);let D=i.dot(N),L=N.dot(S),tt=N.dot(N),vt=i.dot(S),nt=S.dot(S)*tt-L*L,yt,Dt;if(nt!==0)yt=(D*L-vt*tt)/nt;else yt=0;Dt=(D+yt*L)/tt,d.x=yt,d.y=Dt}}(),Bo=function(){let t=new o,e=new n,i=new n;return function(a,c,d,p){wy(a,c,t);let{x:S,y:E}=t;if(S>=0&&S<=1&&E>=0&&E<=1){a.at(S,d),c.at(E,p);return}else if(S>=0&&S<=1){if(E<0)c.at(0,p);else c.at(1,p);a.closestPointToPoint(p,!0,d);return}else if(E>=0&&E<=1){if(S<0)a.at(0,d);else a.at(1,d);c.closestPointToPoint(d,!0,p);return}else{let N;if(S<0)N=a.start;else N=a.end;let D;if(E<0)D=c.start;else D=c.end;let L=e,tt=i;if(a.closestPointToPoint(D,!0,e),c.closestPointToPoint(N,!0,i),L.distanceToSquared(D)<=tt.distanceToSquared(N)){d.copy(L),p.copy(D);return}else{d.copy(N),p.copy(tt);return}}}}(),Gd=function(){let t=new n,e=new n,i=new R,s=new is;return function(c,d){let{radius:p,center:S}=c,{a:E,b:N,c:D}=d;if(s.start=E,s.end=N,s.closestPointToPoint(S,!0,t).distanceTo(S)<=p)return!0;if(s.start=E,s.end=D,s.closestPointToPoint(S,!0,t).distanceTo(S)<=p)return!0;if(s.start=N,s.end=D,s.closestPointToPoint(S,!0,t).distanceTo(S)<=p)return!0;let zt=d.getPlane(i);if(Math.abs(zt.distanceToPoint(S))<=p){let yt=zt.projectPoint(S,e);if(d.containsPoint(yt))return!0}return!1}}();var Ry=["x","y","z"],ks=0.000000000000001,kd=ks*ks;function hs(t){return Math.abs(t)<ks}class Zi extends Ii{constructor(...t){super(...t);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new n),this.satBounds=[,,,,].fill().map(()=>new ls),this.points=[this.a,this.b,this.c],this.plane=new R,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new is,this.needsUpdate=!0}intersectsSphere(t){return Gd(t,this)}update(){let t=this.a,e=this.b,i=this.c,s=this.points,a=this.satAxes,c=this.satBounds,d=a[0],p=c[0];this.getNormal(d),p.setFromPoints(d,s);let S=a[1],E=c[1];S.subVectors(t,e),E.setFromPoints(S,s);let N=a[2],D=c[2];N.subVectors(e,i),D.setFromPoints(N,s);let L=a[3],tt=c[3];L.subVectors(i,t),tt.setFromPoints(L,s);let vt=S.length(),zt=N.length(),nt=L.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,vt<ks)if(zt<ks||nt<ks)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(i);else if(zt<ks)if(nt<ks)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t);else if(nt<ks)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(i),this.degenerateSegment.end.copy(e);this.plane.setFromNormalAndCoplanarPoint(d,t),this.needsUpdate=!1}}Zi.prototype.closestPointToSegment=function(){let t=new n,e=new n,i=new is;return function(a,c=null,d=null){if(this.needsUpdate)this.update();let{start:p,end:S}=a,E=this.points,N,D=1/0,L=this.plane.distanceToPoint(p),tt=this.plane.distanceToPoint(S);if(L*tt<0&&this.plane.intersectLine(a,t)!==null&&this.containsPoint(t)){if(c)c.copy(t);if(d)d.copy(t);return 0}for(let vt=0;vt<3;vt++){let zt=(vt+1)%3;if(i.start.copy(E[vt]),i.end.copy(E[zt]),Bo(i,a,t,e),N=t.distanceToSquared(e),N<D){if(D=N,c)c.copy(t);if(d)d.copy(e)}}if(this.closestPointToPoint(p,t),N=p.distanceToSquared(t),N<D){if(D=N,c)c.copy(t);if(d)d.copy(p)}if(this.closestPointToPoint(S,t),N=S.distanceToSquared(t),N<D){if(D=N,c)c.copy(t);if(d)d.copy(S)}return Math.sqrt(D)}}();Zi.prototype.intersectsTriangle=function(){let t=new Zi,e=new ls,i=new ls,s=new n,a=new n,c=new n,d=new n,p=new is,S=new is,E=new n,N=new o,D=new o;function L(Ht,Ft,Xt,Jt){let gt=s;if(!Ht.isDegenerateIntoPoint&&!Ht.isDegenerateIntoSegment)gt.copy(Ht.plane.normal);else gt.copy(Ft.plane.normal);let{satBounds:Ot,satAxes:Kt}=Ht;for(let me=1;me<4;me++){let Ee=Ot[me],jt=Kt[me];if(e.setFromPoints(jt,Ft.points),Ee.isSeparated(e))return!1;if(d.copy(gt).cross(jt),e.setFromPoints(d,Ht.points),i.setFromPoints(d,Ft.points),e.isSeparated(i))return!1}let{satBounds:pe,satAxes:Qt}=Ft;for(let me=1;me<4;me++){let Ee=pe[me],jt=Qt[me];if(e.setFromPoints(jt,Ht.points),Ee.isSeparated(e))return!1;if(d.crossVectors(gt,jt),e.setFromPoints(d,Ht.points),i.setFromPoints(d,Ft.points),e.isSeparated(i))return!1}if(Xt){if(!Jt)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");Xt.start.set(0,0,0),Xt.end.set(0,0,0)}return!0}function tt(Ht,Ft,Xt,Jt,gt,Ot,Kt,pe,Qt,me,Ee){let jt=Kt/(Kt-pe);me.x=Jt+(gt-Jt)*jt,Ee.start.subVectors(Ft,Ht).multiplyScalar(jt).add(Ht),jt=Kt/(Kt-Qt),me.y=Jt+(Ot-Jt)*jt,Ee.end.subVectors(Xt,Ht).multiplyScalar(jt).add(Ht)}function vt(Ht,Ft,Xt,Jt,gt,Ot,Kt,pe,Qt,me,Ee){if(gt>0)tt(Ht.c,Ht.a,Ht.b,Jt,Ft,Xt,Qt,Kt,pe,me,Ee);else if(Ot>0)tt(Ht.b,Ht.a,Ht.c,Xt,Ft,Jt,pe,Kt,Qt,me,Ee);else if(pe*Qt>0||Kt!=0)tt(Ht.a,Ht.b,Ht.c,Ft,Xt,Jt,Kt,pe,Qt,me,Ee);else if(pe!=0)tt(Ht.b,Ht.a,Ht.c,Xt,Ft,Jt,pe,Kt,Qt,me,Ee);else if(Qt!=0)tt(Ht.c,Ht.a,Ht.b,Jt,Ft,Xt,Qt,Kt,pe,me,Ee);else return!0;return!1}function zt(Ht,Ft,Xt,Jt){let gt=Ft.degenerateSegment,Ot=Ht.plane.distanceToPoint(gt.start),Kt=Ht.plane.distanceToPoint(gt.end);if(hs(Ot))if(hs(Kt))return L(Ht,Ft,Xt,Jt);else{if(Xt)Xt.start.copy(gt.start),Xt.end.copy(gt.start);return Ht.containsPoint(gt.start)}else if(hs(Kt)){if(Xt)Xt.start.copy(gt.end),Xt.end.copy(gt.end);return Ht.containsPoint(gt.end)}else if(Ht.plane.intersectLine(gt,s)!=null){if(Xt)Xt.start.copy(s),Xt.end.copy(s);return Ht.containsPoint(s)}else return!1}function nt(Ht,Ft,Xt){let Jt=Ft.a;if(hs(Ht.plane.distanceToPoint(Jt))&&Ht.containsPoint(Jt)){if(Xt)Xt.start.copy(Jt),Xt.end.copy(Jt);return!0}else return!1}function yt(Ht,Ft,Xt){let Jt=Ht.degenerateSegment,gt=Ft.a;if(Jt.closestPointToPoint(gt,!0,s),gt.distanceToSquared(s)<kd){if(Xt)Xt.start.copy(gt),Xt.end.copy(gt);return!0}else return!1}function Dt(Ht,Ft,Xt,Jt){if(Ht.isDegenerateIntoSegment)if(Ft.isDegenerateIntoSegment){let gt=Ht.degenerateSegment,Ot=Ft.degenerateSegment,Kt=a,pe=c;gt.delta(Kt),Ot.delta(pe);let Qt=s.subVectors(Ot.start,gt.start),me=Kt.x*pe.y-Kt.y*pe.x;if(hs(me))return!1;let Ee=(Qt.x*pe.y-Qt.y*pe.x)/me,jt=-(Kt.x*Qt.y-Kt.y*Qt.x)/me;if(Ee<0||Ee>1||jt<0||jt>1)return!1;let Ye=gt.start.z+Kt.z*Ee,on=Ot.start.z+pe.z*jt;if(hs(Ye-on)){if(Xt)Xt.start.copy(gt.start).addScaledVector(Kt,Ee),Xt.end.copy(gt.start).addScaledVector(Kt,Ee);return!0}else return!1}else if(Ft.isDegenerateIntoPoint)return yt(Ht,Ft,Xt);else return zt(Ft,Ht,Xt,Jt);else if(Ht.isDegenerateIntoPoint)if(Ft.isDegenerateIntoPoint)if(Ft.a.distanceToSquared(Ht.a)<kd){if(Xt)Xt.start.copy(Ht.a),Xt.end.copy(Ht.a);return!0}else return!1;else if(Ft.isDegenerateIntoSegment)return yt(Ft,Ht,Xt);else return nt(Ft,Ht,Xt);else if(Ft.isDegenerateIntoPoint)return nt(Ht,Ft,Xt);else if(Ft.isDegenerateIntoSegment)return zt(Ht,Ft,Xt,Jt)}return function(Ft,Xt=null,Jt=!1){if(this.needsUpdate)this.update();if(!Ft.isExtendedTriangle)t.copy(Ft),t.update(),Ft=t;else if(Ft.needsUpdate)Ft.update();let gt=Dt(this,Ft,Xt,Jt);if(gt!==void 0)return gt;let Ot=this.plane,Kt=Ft.plane,pe=Kt.distanceToPoint(this.a),Qt=Kt.distanceToPoint(this.b),me=Kt.distanceToPoint(this.c);if(hs(pe))pe=0;if(hs(Qt))Qt=0;if(hs(me))me=0;let Ee=pe*Qt,jt=pe*me;if(Ee>0&&jt>0)return!1;let Ye=Ot.distanceToPoint(Ft.a),on=Ot.distanceToPoint(Ft.b),tn=Ot.distanceToPoint(Ft.c);if(hs(Ye))Ye=0;if(hs(on))on=0;if(hs(tn))tn=0;let yn=Ye*on,ln=Ye*tn;if(yn>0&&ln>0)return!1;a.copy(Ot.normal),c.copy(Kt.normal);let dn=a.cross(c),gn=0,Nn=Math.abs(dn.x),fn=Math.abs(dn.y);if(fn>Nn)Nn=fn,gn=1;if(Math.abs(dn.z)>Nn)gn=2;let Ln=Ry[gn],Hn=this.a[Ln],Wn=this.b[Ln],Dn=this.c[Ln],oi=Ft.a[Ln],jn=Ft.b[Ln],Kn=Ft.c[Ln];if(vt(this,Hn,Wn,Dn,Ee,jt,pe,Qt,me,N,p))return L(this,Ft,Xt,Jt);if(vt(Ft,oi,jn,Kn,yn,ln,Ye,on,tn,D,S))return L(this,Ft,Xt,Jt);if(N.y<N.x){let ui=N.y;N.y=N.x,N.x=ui,E.copy(p.start),p.start.copy(p.end),p.end.copy(E)}if(D.y<D.x){let ui=D.y;D.y=D.x,D.x=ui,E.copy(S.start),S.start.copy(S.end),S.end.copy(E)}if(N.y<D.x||D.y<N.x)return!1;if(Xt){if(D.x>N.x)Xt.start.copy(S.start);else Xt.start.copy(p.start);if(D.y<N.y)Xt.end.copy(S.end);else Xt.end.copy(p.end)}return!0}}();Zi.prototype.distanceToPoint=function(){let t=new n;return function(i){return this.closestPointToPoint(i,t),i.distanceTo(t)}}();Zi.prototype.distanceToTriangle=function(){let t=new n,e=new n,i=["a","b","c"],s=new is,a=new is;return function(d,p=null,S=null){let E=p||S?s:null;if(this.intersectsTriangle(d,E,!0)){if(p||S){if(p)E.getCenter(p);if(S)E.getCenter(S)}return 0}let N=1/0;for(let D=0;D<3;D++){let L,tt=i[D],vt=d[tt];if(this.closestPointToPoint(vt,t),L=vt.distanceToSquared(t),L<N){if(N=L,p)p.copy(t);if(S)S.copy(vt)}let zt=this[tt];if(d.closestPointToPoint(zt,t),L=zt.distanceToSquared(t),L<N){if(N=L,p)p.copy(zt);if(S)S.copy(t)}}for(let D=0;D<3;D++){let L=i[D],tt=i[(D+1)%3];s.set(this[L],this[tt]);for(let vt=0;vt<3;vt++){let zt=i[vt],nt=i[(vt+1)%3];a.set(d[zt],d[nt]),Bo(s,a,t,e);let yt=t.distanceToSquared(e);if(yt<N){if(N=yt,p)p.copy(t);if(S)S.copy(e)}}}return Math.sqrt(N)}}();class Ai{constructor(t,e,i){if(this.isOrientedBox=!0,this.min=new n,this.max=new n,this.matrix=new r,this.invMatrix=new r,this.points=[,,,,,,,,].fill().map(()=>new n),this.satAxes=[,,,].fill().map(()=>new n),this.satBounds=[,,,].fill().map(()=>new ls),this.alignedSatBounds=[,,,].fill().map(()=>new ls),this.needsUpdate=!1,t)this.min.copy(t);if(e)this.max.copy(e);if(i)this.matrix.copy(i)}set(t,e,i){this.min.copy(t),this.max.copy(e),this.matrix.copy(i),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}}Ai.prototype.update=function(){return function(){let e=this.matrix,i=this.min,s=this.max,a=this.points;for(let E=0;E<=1;E++)for(let N=0;N<=1;N++)for(let D=0;D<=1;D++){let L=1*E|2*N|4*D,tt=a[L];tt.x=E?s.x:i.x,tt.y=N?s.y:i.y,tt.z=D?s.z:i.z,tt.applyMatrix4(e)}let c=this.satBounds,d=this.satAxes,p=a[0];for(let E=0;E<3;E++){let N=d[E],D=c[E],L=1<<E,tt=a[L];N.subVectors(p,tt),D.setFromPoints(N,a)}let S=this.alignedSatBounds;S[0].setFromPointsField(a,"x"),S[1].setFromPointsField(a,"y"),S[2].setFromPointsField(a,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Ai.prototype.intersectsBox=function(){let t=new ls;return function(i){if(this.needsUpdate)this.update();let{min:s,max:a}=i,c=this.satBounds,d=this.satAxes,p=this.alignedSatBounds;if(t.min=s.x,t.max=a.x,p[0].isSeparated(t))return!1;if(t.min=s.y,t.max=a.y,p[1].isSeparated(t))return!1;if(t.min=s.z,t.max=a.z,p[2].isSeparated(t))return!1;for(let S=0;S<3;S++){let E=d[S],N=c[S];if(t.setFromBox(E,i),N.isSeparated(t))return!1}return!0}}();Ai.prototype.intersectsTriangle=function(){let t=new Zi,e=[,,,],i=new ls,s=new ls,a=new n;return function(d){if(this.needsUpdate)this.update();if(!d.isExtendedTriangle)t.copy(d),t.update(),d=t;else if(d.needsUpdate)d.update();let p=this.satBounds,S=this.satAxes;e[0]=d.a,e[1]=d.b,e[2]=d.c;for(let L=0;L<3;L++){let tt=p[L],vt=S[L];if(i.setFromPoints(vt,e),tt.isSeparated(i))return!1}let E=d.satBounds,N=d.satAxes,D=this.points;for(let L=0;L<3;L++){let tt=E[L],vt=N[L];if(i.setFromPoints(vt,D),tt.isSeparated(i))return!1}for(let L=0;L<3;L++){let tt=S[L];for(let vt=0;vt<4;vt++){let zt=N[vt];if(a.crossVectors(tt,zt),i.setFromPoints(a,e),s.setFromPoints(a,D),i.isSeparated(s))return!1}}return!0}}();Ai.prototype.closestPointToPoint=function(){return function(e,i){if(this.needsUpdate)this.update();return i.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),i}}();Ai.prototype.distanceToPoint=function(){let t=new n;return function(i){return this.closestPointToPoint(i,t),i.distanceTo(t)}}();Ai.prototype.distanceToBox=function(){let t=["x","y","z"],e=Array(12).fill().map(()=>new is),i=Array(12).fill().map(()=>new is),s=new n,a=new n;return function(d,p=0,S=null,E=null){if(this.needsUpdate)this.update();if(this.intersectsBox(d)){if(S||E){if(d.getCenter(a),this.closestPointToPoint(a,s),d.closestPointToPoint(s,a),S)S.copy(s);if(E)E.copy(a)}return 0}let N=p*p,{min:D,max:L}=d,tt=this.points,vt=1/0;for(let nt=0;nt<8;nt++){let yt=tt[nt];a.copy(yt).clamp(D,L);let Dt=yt.distanceToSquared(a);if(Dt<vt){if(vt=Dt,S)S.copy(yt);if(E)E.copy(a);if(Dt<N)return Math.sqrt(Dt)}}let zt=0;for(let nt=0;nt<3;nt++)for(let yt=0;yt<=1;yt++)for(let Dt=0;Dt<=1;Dt++){let Ht=(nt+1)%3,Ft=(nt+2)%3,Xt=yt<<Ht|Dt<<Ft,Jt=1<<nt|yt<<Ht|Dt<<Ft,gt=tt[Xt],Ot=tt[Jt];e[zt].set(gt,Ot);let pe=t[nt],Qt=t[Ht],me=t[Ft],Ee=i[zt],{start:jt,end:Ye}=Ee;jt[pe]=D[pe],jt[Qt]=yt?D[Qt]:L[Qt],jt[me]=Dt?D[me]:L[me],Ye[pe]=L[pe],Ye[Qt]=yt?D[Qt]:L[Qt],Ye[me]=Dt?D[me]:L[me],zt++}for(let nt=0;nt<=1;nt++)for(let yt=0;yt<=1;yt++)for(let Dt=0;Dt<=1;Dt++){a.x=nt?L.x:D.x,a.y=yt?L.y:D.y,a.z=Dt?L.z:D.z,this.closestPointToPoint(a,s);let Ht=a.distanceToSquared(s);if(Ht<vt){if(vt=Ht,S)S.copy(s);if(E)E.copy(a);if(Ht<N)return Math.sqrt(Ht)}}for(let nt=0;nt<12;nt++){let yt=e[nt];for(let Dt=0;Dt<12;Dt++){let Ht=i[Dt];Bo(yt,Ht,s,a);let Ft=s.distanceToSquared(a);if(Ft<vt){if(vt=Ft,S)S.copy(s);if(E)E.copy(a);if(Ft<N)return Math.sqrt(Ft)}}}return Math.sqrt(vt)}}();class Hd extends yr{constructor(){super(()=>new Zi)}}var Qi=new Hd;var zo=new n,Th=new n;function Vd(t,e,i={},s=0,a=1/0){let c=s*s,d=a*a,p=1/0,S=null;if(t.shapecast({boundsTraverseOrder:(N)=>(zo.copy(e).clamp(N.min,N.max),zo.distanceToSquared(e)),intersectsBounds:(N,D,L)=>L<p&&L<d,intersectsTriangle:(N,D)=>{N.closestPointToPoint(e,zo);let L=e.distanceToSquared(zo);if(L<p)Th.copy(zo),p=L,S=D;if(L<c)return!0;else return!1}}),p===1/0)return null;let E=Math.sqrt(p);if(!i.point)i.point=Th.clone();else i.point.copy(Th);return i.distance=E,i.faceIndex=S,i}var tl=parseInt(pr)>=169,Cy=parseInt(pr)<=161,vr=new n,Sr=new n,Mr=new n,el=new o,nl=new o,il=new o,Wd=new n,Xd=new n,qd=new n,Go=new n;function Iy(t,e,i,s,a,c,d,p){let S;if(c===C)S=t.intersectTriangle(s,i,e,!0,a);else S=t.intersectTriangle(e,i,s,c!==Y,a);if(S===null)return null;let E=t.origin.distanceTo(a);if(E<d||E>p)return null;return{distance:E,point:a.clone()}}function Yd(t,e,i,s,a,c,d,p,S,E,N){vr.fromBufferAttribute(e,c),Sr.fromBufferAttribute(e,d),Mr.fromBufferAttribute(e,p);let D=Iy(t,vr,Sr,Mr,Go,S,E,N);if(D){if(s){el.fromBufferAttribute(s,c),nl.fromBufferAttribute(s,d),il.fromBufferAttribute(s,p),D.uv=new o;let tt=Ii.getInterpolation(Go,vr,Sr,Mr,el,nl,il,D.uv);if(!tl)D.uv=tt}if(a){el.fromBufferAttribute(a,c),nl.fromBufferAttribute(a,d),il.fromBufferAttribute(a,p),D.uv1=new o;let tt=Ii.getInterpolation(Go,vr,Sr,Mr,el,nl,il,D.uv1);if(!tl)D.uv1=tt;if(Cy)D.uv2=D.uv1}if(i){Wd.fromBufferAttribute(i,c),Xd.fromBufferAttribute(i,d),qd.fromBufferAttribute(i,p),D.normal=new n;let tt=Ii.getInterpolation(Go,vr,Sr,Mr,Wd,Xd,qd,D.normal);if(D.normal.dot(t.direction)>0)D.normal.multiplyScalar(-1);if(!tl)D.normal=tt}let L={a:c,b:d,c:p,normal:new n,materialIndex:0};if(Ii.getNormal(vr,Sr,Mr,L.normal),D.face=L,D.faceIndex=c,tl){let tt=new n;Ii.getBarycoord(Go,vr,Sr,Mr,tt),D.barycoord=tt}}return D}function Zd(t){return t&&t.isMaterial?t.side:t}function eo(t,e,i,s,a,c,d){let p=s*3,S=p+0,E=p+1,N=p+2,{index:D,groups:L}=t;if(t.index)S=D.getX(S),E=D.getX(E),N=D.getX(N);let{position:tt,normal:vt,uv:zt,uv1:nt}=t.attributes;if(Array.isArray(e)){let yt=s*3;for(let Dt=0,Ht=L.length;Dt<Ht;Dt++){let{start:Ft,count:Xt,materialIndex:Jt}=L[Dt];if(yt>=Ft&&yt<Ft+Xt){let gt=Zd(e[Jt]),Ot=Yd(i,tt,vt,zt,nt,S,E,N,gt,c,d);if(Ot)if(Ot.faceIndex=s,Ot.face.materialIndex=Jt,a)a.push(Ot);else return Ot}}}else{let yt=Zd(e),Dt=Yd(i,tt,vt,zt,nt,S,E,N,yt,c,d);if(Dt)if(Dt.faceIndex=s,Dt.face.materialIndex=0,a)a.push(Dt);else return Dt}return null}function yi(t,e,i,s){let{a,b:c,c:d}=t,p=e,S=e+1,E=e+2;if(i)p=i.getX(p),S=i.getX(S),E=i.getX(E);a.x=s.getX(p),a.y=s.getY(p),a.z=s.getZ(p),c.x=s.getX(S),c.y=s.getY(S),c.z=s.getZ(S),d.x=s.getX(E),d.y=s.getY(E),d.z=s.getZ(E)}function Jd(t,e,i,s,a,c,d,p){let{geometry:S,_indirectBuffer:E}=t;for(let N=s,D=s+a;N<D;N++)eo(S,e,i,N,c,d,p)}function $d(t,e,i,s,a,c,d){let{geometry:p,_indirectBuffer:S}=t,E=1/0,N=null;for(let D=s,L=s+a;D<L;D++){let tt;if(tt=eo(p,e,i,D,null,c,d),tt&&tt.distance<E)N=tt,E=tt.distance}return N}function Kd(t,e,i,s,a,c,d){let{geometry:p}=i,{index:S}=p,E=p.attributes.position;for(let N=t,D=e+t;N<D;N++){let L;if(L=N,yi(d,L*3,S,E),d.needsUpdate=!0,s(d,L,a,c))return!0}return!1}function Qd(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let i=t.geometry,s=i.index?i.index.array:null,a=i.attributes.position,c,d,p,S,E=0,N=t._roots;for(let L=0,tt=N.length;L<tt;L++)c=N[L],d=new Uint32Array(c),p=new Uint16Array(c),S=new Float32Array(c),D(0,E),E+=c.byteLength;function D(L,tt,vt=!1){let zt=L*2;if(si(zt,p)){let nt=hi(L,d),yt=mi(zt,p),Dt=1/0,Ht=1/0,Ft=1/0,Xt=-1/0,Jt=-1/0,gt=-1/0;for(let Ot=3*nt,Kt=3*(nt+yt);Ot<Kt;Ot++){let pe=s[Ot],Qt=a.getX(pe),me=a.getY(pe),Ee=a.getZ(pe);if(Qt<Dt)Dt=Qt;if(Qt>Xt)Xt=Qt;if(me<Ht)Ht=me;if(me>Jt)Jt=me;if(Ee<Ft)Ft=Ee;if(Ee>gt)gt=Ee}if(S[L+0]!==Dt||S[L+1]!==Ht||S[L+2]!==Ft||S[L+3]!==Xt||S[L+4]!==Jt||S[L+5]!==gt)return S[L+0]=Dt,S[L+1]=Ht,S[L+2]=Ft,S[L+3]=Xt,S[L+4]=Jt,S[L+5]=gt,!0;else return!1}else{let nt=li(L),yt=ci(L,d),Dt=vt,Ht=!1,Ft=!1;if(e){if(!Dt){let pe=nt/pi+tt/Oi,Qt=yt/pi+tt/Oi;Ht=e.has(pe),Ft=e.has(Qt),Dt=!Ht&&!Ft}}else Ht=!0,Ft=!0;let Xt=Dt||Ht,Jt=Dt||Ft,gt=!1;if(Xt)gt=D(nt,tt,Dt);let Ot=!1;if(Jt)Ot=D(yt,tt,Dt);let Kt=gt||Ot;if(Kt)for(let pe=0;pe<3;pe++){let Qt=nt+pe,me=yt+pe,Ee=S[Qt],jt=S[Qt+3],Ye=S[me],on=S[me+3];S[L+pe]=Ee<Ye?Ee:Ye,S[L+pe+3]=jt>on?jt:on}return Kt}}}function Ji(t,e,i,s,a){let c,d,p,S,E,N,D=1/i.direction.x,L=1/i.direction.y,tt=1/i.direction.z,vt=i.origin.x,zt=i.origin.y,nt=i.origin.z,yt=e[t],Dt=e[t+3],Ht=e[t+1],Ft=e[t+3+1],Xt=e[t+2],Jt=e[t+3+2];if(D>=0)c=(yt-vt)*D,d=(Dt-vt)*D;else c=(Dt-vt)*D,d=(yt-vt)*D;if(L>=0)p=(Ht-zt)*L,S=(Ft-zt)*L;else p=(Ft-zt)*L,S=(Ht-zt)*L;if(c>S||p>d)return!1;if(p>c||isNaN(c))c=p;if(S<d||isNaN(d))d=S;if(tt>=0)E=(Xt-nt)*tt,N=(Jt-nt)*tt;else E=(Jt-nt)*tt,N=(Xt-nt)*tt;if(c>N||E>d)return!1;if(E>c||c!==c)c=E;if(N<d||d!==d)d=N;return c<=a&&d>=s}function jd(t,e,i,s,a,c,d,p){let{geometry:S,_indirectBuffer:E}=t;for(let N=s,D=s+a;N<D;N++){let L=E?E[N]:N;eo(S,e,i,L,c,d,p)}}function tp(t,e,i,s,a,c,d){let{geometry:p,_indirectBuffer:S}=t,E=1/0,N=null;for(let D=s,L=s+a;D<L;D++){let tt;if(tt=eo(p,e,i,S?S[D]:D,null,c,d),tt&&tt.distance<E)N=tt,E=tt.distance}return N}function ep(t,e,i,s,a,c,d){let{geometry:p}=i,{index:S}=p,E=p.attributes.position;for(let N=t,D=e+t;N<D;N++){let L;if(L=i.resolveTriangleIndex(N),yi(d,L*3,S,E),d.needsUpdate=!0,s(d,L,a,c))return!0}return!1}function np(t,e,i,s,a,c,d){if(ti.setBuffer(t._roots[e]),Ji(0,ti.float32Array,s,c,d))Ah(0,t,i,s,a,c,d);ti.clearBuffer()}function Ah(t,e,i,s,a,c,d){let{float32Array:p,uint16Array:S,uint32Array:E}=ti,N=t*2;if(si(N,S)){let L=hi(t,E),tt=mi(N,S);Jd(e,i,s,L,tt,a,c,d)}else{let L=li(t);if(Ji(L,p,s,c,d))Ah(L,e,i,s,a,c,d);let tt=ci(t,E);if(Ji(tt,p,s,c,d))Ah(tt,e,i,s,a,c,d)}}var Py=["x","y","z"];function ip(t,e,i,s,a,c){ti.setBuffer(t._roots[e]);let d=null;if(Ji(0,ti.float32Array,s,a,c))d=Eh(0,t,i,s,a,c);return ti.clearBuffer(),d}function Eh(t,e,i,s,a,c){let{float32Array:d,uint16Array:p,uint32Array:S}=ti,E=t*2;if(si(E,p)){let D=hi(t,S),L=mi(E,p);return $d(e,i,s,D,L,a,c)}else{let D=Yr(t,S),L=Py[D],vt=s.direction[L]>=0,zt,nt;if(vt)zt=li(t),nt=ci(t,S);else zt=ci(t,S),nt=li(t);let Dt=Ji(zt,d,s,a,c)?Eh(zt,e,i,s,a,c):null;if(Dt){let Xt=Dt.point[L];if(vt?Xt<=d[nt+D]:Xt>=d[nt+D+3])return Dt}let Ft=Ji(nt,d,s,a,c)?Eh(nt,e,i,s,a,c):null;if(Dt&&Ft)return Dt.distance<=Ft.distance?Dt:Ft;else return Dt||Ft||null}}var sl=new h,no=new Zi,io=new Zi,ko=new r,sp=new Ai,rl=new Ai;function rp(t,e,i,s){ti.setBuffer(t._roots[e]);let a=wh(0,t,i,s);return ti.clearBuffer(),a}function wh(t,e,i,s,a=null){let{float32Array:c,uint16Array:d,uint32Array:p}=ti,S=t*2;if(a===null){if(!i.boundingBox)i.computeBoundingBox();sp.set(i.boundingBox.min,i.boundingBox.max,s),a=sp}if(si(S,d)){let N=e.geometry,D=N.index,L=N.attributes.position,tt=i.index,vt=i.attributes.position,zt=hi(t,p),nt=mi(S,d);if(ko.copy(s).invert(),i.boundsTree)return xi(Mi(t),c,rl),rl.matrix.copy(ko),rl.needsUpdate=!0,i.boundsTree.shapecast({intersectsBounds:(Dt)=>rl.intersectsBox(Dt),intersectsTriangle:(Dt)=>{Dt.a.applyMatrix4(s),Dt.b.applyMatrix4(s),Dt.c.applyMatrix4(s),Dt.needsUpdate=!0;for(let Ht=zt*3,Ft=(nt+zt)*3;Ht<Ft;Ht+=3)if(yi(io,Ht,D,L),io.needsUpdate=!0,Dt.intersectsTriangle(io))return!0;return!1}});else{let yt=ir(i);for(let Dt=zt*3,Ht=(nt+zt)*3;Dt<Ht;Dt+=3){yi(no,Dt,D,L),no.a.applyMatrix4(ko),no.b.applyMatrix4(ko),no.c.applyMatrix4(ko),no.needsUpdate=!0;for(let Ft=0,Xt=yt*3;Ft<Xt;Ft+=3)if(yi(io,Ft,tt,vt),io.needsUpdate=!0,no.intersectsTriangle(io))return!0}}}else{let N=li(t),D=ci(t,p);if(xi(Mi(N),c,sl),a.intersectsBox(sl)&&wh(N,e,i,s,a))return!0;if(xi(Mi(D),c,sl),a.intersectsBox(sl)&&wh(D,e,i,s,a))return!0;return!1}}var ol=new r,Rh=new Ai,Ho=new Ai,Ly=new n,Ny=new n,Dy=new n,Uy=new n;function op(t,e,i,s={},a={},c=0,d=1/0){if(!e.boundingBox)e.computeBoundingBox();Rh.set(e.boundingBox.min,e.boundingBox.max,i),Rh.needsUpdate=!0;let p=t.geometry,S=p.attributes.position,E=p.index,N=e.attributes.position,D=e.index,L=Qi.getPrimitive(),tt=Qi.getPrimitive(),vt=Ly,zt=Ny,nt=null,yt=null;if(a)nt=Dy,yt=Uy;let Dt=1/0,Ht=null,Ft=null;if(ol.copy(i).invert(),Ho.matrix.copy(ol),t.shapecast({boundsTraverseOrder:(Xt)=>Rh.distanceToBox(Xt),intersectsBounds:(Xt,Jt,gt)=>{if(gt<Dt&&gt<d){if(Jt)Ho.min.copy(Xt.min),Ho.max.copy(Xt.max),Ho.needsUpdate=!0;return!0}return!1},intersectsRange:(Xt,Jt)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:(Ot)=>Ho.distanceToBox(Ot),intersectsBounds:(Ot,Kt,pe)=>pe<Dt&&pe<d,intersectsRange:(Ot,Kt)=>{for(let pe=Ot,Qt=Ot+Kt;pe<Qt;pe++){yi(tt,3*pe,D,N),tt.a.applyMatrix4(i),tt.b.applyMatrix4(i),tt.c.applyMatrix4(i),tt.needsUpdate=!0;for(let me=Xt,Ee=Xt+Jt;me<Ee;me++){yi(L,3*me,E,S),L.needsUpdate=!0;let jt=L.distanceToTriangle(tt,vt,nt);if(jt<Dt){if(zt.copy(vt),yt)yt.copy(nt);Dt=jt,Ht=me,Ft=pe}if(jt<c)return!0}}}});else{let gt=ir(e);for(let Ot=0,Kt=gt;Ot<Kt;Ot++){yi(tt,3*Ot,D,N),tt.a.applyMatrix4(i),tt.b.applyMatrix4(i),tt.c.applyMatrix4(i),tt.needsUpdate=!0;for(let pe=Xt,Qt=Xt+Jt;pe<Qt;pe++){yi(L,3*pe,E,S),L.needsUpdate=!0;let me=L.distanceToTriangle(tt,vt,nt);if(me<Dt){if(zt.copy(vt),yt)yt.copy(nt);Dt=me,Ht=pe,Ft=Ot}if(me<c)return!0}}}}}),Qi.releasePrimitive(L),Qi.releasePrimitive(tt),Dt===1/0)return null;if(!s.point)s.point=zt.clone();else s.point.copy(zt);if(s.distance=Dt,s.faceIndex=Ht,a){if(!a.point)a.point=yt.clone();else a.point.copy(yt);a.point.applyMatrix4(ol),zt.applyMatrix4(ol),a.distance=zt.sub(a.point).length(),a.faceIndex=Ft}return s}function ap(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let i=t.geometry,s=i.index?i.index.array:null,a=i.attributes.position,c,d,p,S,E=0,N=t._roots;for(let L=0,tt=N.length;L<tt;L++)c=N[L],d=new Uint32Array(c),p=new Uint16Array(c),S=new Float32Array(c),D(0,E),E+=c.byteLength;function D(L,tt,vt=!1){let zt=L*2;if(si(zt,p)){let nt=hi(L,d),yt=mi(zt,p),Dt=1/0,Ht=1/0,Ft=1/0,Xt=-1/0,Jt=-1/0,gt=-1/0;for(let Ot=nt,Kt=nt+yt;Ot<Kt;Ot++){let pe=3*t.resolveTriangleIndex(Ot);for(let Qt=0;Qt<3;Qt++){let me=pe+Qt;me=s?s[me]:me;let Ee=a.getX(me),jt=a.getY(me),Ye=a.getZ(me);if(Ee<Dt)Dt=Ee;if(Ee>Xt)Xt=Ee;if(jt<Ht)Ht=jt;if(jt>Jt)Jt=jt;if(Ye<Ft)Ft=Ye;if(Ye>gt)gt=Ye}}if(S[L+0]!==Dt||S[L+1]!==Ht||S[L+2]!==Ft||S[L+3]!==Xt||S[L+4]!==Jt||S[L+5]!==gt)return S[L+0]=Dt,S[L+1]=Ht,S[L+2]=Ft,S[L+3]=Xt,S[L+4]=Jt,S[L+5]=gt,!0;else return!1}else{let nt=li(L),yt=ci(L,d),Dt=vt,Ht=!1,Ft=!1;if(e){if(!Dt){let pe=nt/pi+tt/Oi,Qt=yt/pi+tt/Oi;Ht=e.has(pe),Ft=e.has(Qt),Dt=!Ht&&!Ft}}else Ht=!0,Ft=!0;let Xt=Dt||Ht,Jt=Dt||Ft,gt=!1;if(Xt)gt=D(nt,tt,Dt);let Ot=!1;if(Jt)Ot=D(yt,tt,Dt);let Kt=gt||Ot;if(Kt)for(let pe=0;pe<3;pe++){let Qt=nt+pe,me=yt+pe,Ee=S[Qt],jt=S[Qt+3],Ye=S[me],on=S[me+3];S[L+pe]=Ee<Ye?Ee:Ye,S[L+pe+3]=jt>on?jt:on}return Kt}}}function lp(t,e,i,s,a,c,d){if(ti.setBuffer(t._roots[e]),Ji(0,ti.float32Array,s,c,d))Ch(0,t,i,s,a,c,d);ti.clearBuffer()}function Ch(t,e,i,s,a,c,d){let{float32Array:p,uint16Array:S,uint32Array:E}=ti,N=t*2;if(si(N,S)){let L=hi(t,E),tt=mi(N,S);jd(e,i,s,L,tt,a,c,d)}else{let L=li(t);if(Ji(L,p,s,c,d))Ch(L,e,i,s,a,c,d);let tt=ci(t,E);if(Ji(tt,p,s,c,d))Ch(tt,e,i,s,a,c,d)}}var Fy=["x","y","z"];function cp(t,e,i,s,a,c){ti.setBuffer(t._roots[e]);let d=null;if(Ji(0,ti.float32Array,s,a,c))d=Ih(0,t,i,s,a,c);return ti.clearBuffer(),d}function Ih(t,e,i,s,a,c){let{float32Array:d,uint16Array:p,uint32Array:S}=ti,E=t*2;if(si(E,p)){let D=hi(t,S),L=mi(E,p);return tp(e,i,s,D,L,a,c)}else{let D=Yr(t,S),L=Fy[D],vt=s.direction[L]>=0,zt,nt;if(vt)zt=li(t),nt=ci(t,S);else zt=ci(t,S),nt=li(t);let Dt=Ji(zt,d,s,a,c)?Ih(zt,e,i,s,a,c):null;if(Dt){let Xt=Dt.point[L];if(vt?Xt<=d[nt+D]:Xt>=d[nt+D+3])return Dt}let Ft=Ji(nt,d,s,a,c)?Ih(nt,e,i,s,a,c):null;if(Dt&&Ft)return Dt.distance<=Ft.distance?Dt:Ft;else return Dt||Ft||null}}var al=new h,so=new Zi,ro=new Zi,Vo=new r,hp=new Ai,ll=new Ai;function up(t,e,i,s){ti.setBuffer(t._roots[e]);let a=Ph(0,t,i,s);return ti.clearBuffer(),a}function Ph(t,e,i,s,a=null){let{float32Array:c,uint16Array:d,uint32Array:p}=ti,S=t*2;if(a===null){if(!i.boundingBox)i.computeBoundingBox();hp.set(i.boundingBox.min,i.boundingBox.max,s),a=hp}if(si(S,d)){let N=e.geometry,D=N.index,L=N.attributes.position,tt=i.index,vt=i.attributes.position,zt=hi(t,p),nt=mi(S,d);if(Vo.copy(s).invert(),i.boundsTree)return xi(Mi(t),c,ll),ll.matrix.copy(Vo),ll.needsUpdate=!0,i.boundsTree.shapecast({intersectsBounds:(Dt)=>ll.intersectsBox(Dt),intersectsTriangle:(Dt)=>{Dt.a.applyMatrix4(s),Dt.b.applyMatrix4(s),Dt.c.applyMatrix4(s),Dt.needsUpdate=!0;for(let Ht=zt,Ft=nt+zt;Ht<Ft;Ht++)if(yi(ro,3*e.resolveTriangleIndex(Ht),D,L),ro.needsUpdate=!0,Dt.intersectsTriangle(ro))return!0;return!1}});else{let yt=ir(i);for(let Dt=zt,Ht=nt+zt;Dt<Ht;Dt++){let Ft=e.resolveTriangleIndex(Dt);yi(so,3*Ft,D,L),so.a.applyMatrix4(Vo),so.b.applyMatrix4(Vo),so.c.applyMatrix4(Vo),so.needsUpdate=!0;for(let Xt=0,Jt=yt*3;Xt<Jt;Xt+=3)if(yi(ro,Xt,tt,vt),ro.needsUpdate=!0,so.intersectsTriangle(ro))return!0}}}else{let N=li(t),D=ci(t,p);if(xi(Mi(N),c,al),a.intersectsBox(al)&&Ph(N,e,i,s,a))return!0;if(xi(Mi(D),c,al),a.intersectsBox(al)&&Ph(D,e,i,s,a))return!0;return!1}}var cl=new r,Lh=new Ai,Wo=new Ai,Oy=new n,By=new n,zy=new n,Gy=new n;function fp(t,e,i,s={},a={},c=0,d=1/0){if(!e.boundingBox)e.computeBoundingBox();Lh.set(e.boundingBox.min,e.boundingBox.max,i),Lh.needsUpdate=!0;let p=t.geometry,S=p.attributes.position,E=p.index,N=e.attributes.position,D=e.index,L=Qi.getPrimitive(),tt=Qi.getPrimitive(),vt=Oy,zt=By,nt=null,yt=null;if(a)nt=zy,yt=Gy;let Dt=1/0,Ht=null,Ft=null;if(cl.copy(i).invert(),Wo.matrix.copy(cl),t.shapecast({boundsTraverseOrder:(Xt)=>Lh.distanceToBox(Xt),intersectsBounds:(Xt,Jt,gt)=>{if(gt<Dt&&gt<d){if(Jt)Wo.min.copy(Xt.min),Wo.max.copy(Xt.max),Wo.needsUpdate=!0;return!0}return!1},intersectsRange:(Xt,Jt)=>{if(e.boundsTree){let gt=e.boundsTree;return gt.shapecast({boundsTraverseOrder:(Ot)=>Wo.distanceToBox(Ot),intersectsBounds:(Ot,Kt,pe)=>pe<Dt&&pe<d,intersectsRange:(Ot,Kt)=>{for(let pe=Ot,Qt=Ot+Kt;pe<Qt;pe++){let me=gt.resolveTriangleIndex(pe);yi(tt,3*me,D,N),tt.a.applyMatrix4(i),tt.b.applyMatrix4(i),tt.c.applyMatrix4(i),tt.needsUpdate=!0;for(let Ee=Xt,jt=Xt+Jt;Ee<jt;Ee++){let Ye=t.resolveTriangleIndex(Ee);yi(L,3*Ye,E,S),L.needsUpdate=!0;let on=L.distanceToTriangle(tt,vt,nt);if(on<Dt){if(zt.copy(vt),yt)yt.copy(nt);Dt=on,Ht=Ee,Ft=pe}if(on<c)return!0}}}})}else{let gt=ir(e);for(let Ot=0,Kt=gt;Ot<Kt;Ot++){yi(tt,3*Ot,D,N),tt.a.applyMatrix4(i),tt.b.applyMatrix4(i),tt.c.applyMatrix4(i),tt.needsUpdate=!0;for(let pe=Xt,Qt=Xt+Jt;pe<Qt;pe++){let me=t.resolveTriangleIndex(pe);yi(L,3*me,E,S),L.needsUpdate=!0;let Ee=L.distanceToTriangle(tt,vt,nt);if(Ee<Dt){if(zt.copy(vt),yt)yt.copy(nt);Dt=Ee,Ht=pe,Ft=Ot}if(Ee<c)return!0}}}}}),Qi.releasePrimitive(L),Qi.releasePrimitive(tt),Dt===1/0)return null;if(!s.point)s.point=zt.clone();else s.point.copy(zt);if(s.distance=Dt,s.faceIndex=Ht,a){if(!a.point)a.point=yt.clone();else a.point.copy(yt);a.point.applyMatrix4(cl),zt.applyMatrix4(cl),a.distance=zt.sub(a.point).length(),a.faceIndex=Ft}return s}function Nh(t,e,i){if(t===null)return null;return t.point.applyMatrix4(e.matrixWorld),t.distance=t.point.distanceTo(i.ray.origin),t.object=e,t}var hl=new Ai,ul=new ie,dp=new n,pp=new r,mp=new n,Dh=["getX","getY","getZ"];class de extends bh{static serialize(t,e={}){e={cloneBuffers:!0,...e};let{geometry:i,_roots:s,_indirectBuffer:a}=t,c=i.getIndex(),d={version:1,roots:null,index:null,indirectBuffer:null};if(e.cloneBuffers)d.roots=s.map((p)=>p.slice()),d.index=c?c.array.slice():null,d.indirectBuffer=a?a.slice():null;else d.roots=s,d.index=c?c.array:null,d.indirectBuffer=a;return d}static deserialize(t,e,i={}){i={setIndex:!0,indirect:Boolean(t.indirectBuffer),...i};let{index:s,roots:a,indirectBuffer:c}=t;if(!t.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),p(a);let d=new de(e,{...i,[Uo]:!0});if(d._roots=a,d._indirectBuffer=c||null,i.setIndex){let S=e.getIndex();if(S===null){let E=new _(t.index,1,!1);e.setIndex(E)}else if(S.array!==s)S.array.set(s),S.needsUpdate=!0}return d;function p(S){for(let E=0;E<S.length;E++){let N=S[E],D=new Uint32Array(N),L=new Uint16Array(N);for(let tt=0,vt=N.byteLength/Oi;tt<vt;tt++){let zt=pi*tt,nt=2*zt;if(!si(nt,L))D[zt+6]=D[zt+6]/pi-tt}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){if(e.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris};super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,i){let s=this.geometry,a=this._indirectBuffer,c=s.attributes.position,d=s.index?s.index.array:null,S=(a?a[t]:t)*3,E=S+0,N=S+1,D=S+2;if(d)E=d[E],N=d[N],D=d[D];for(let L=0;L<3;L++){let tt=c[Dh[L]](E),vt=c[Dh[L]](N),zt=c[Dh[L]](D),nt=tt;if(vt<nt)nt=vt;if(zt<nt)nt=zt;let yt=tt;if(vt>yt)yt=vt;if(zt>yt)yt=zt;e[i+L]=nt,e[i+L+3]=yt}return e}computePrimitiveBounds(t,e,i){let s=this.geometry,a=this._indirectBuffer,c=s.attributes.position,d=s.index?s.index.array:null,p=c.normalized;if(t<0||e+t-i.offset>i.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let S=c.array,E=c.offset||0,N=3;if(c.isInterleavedBufferAttribute)N=c.data.stride;let D=["getX","getY","getZ"],L=i.offset;for(let tt=t,vt=t+e;tt<vt;tt++){let nt=(a?a[tt]:tt)*3,yt=(tt-L)*6,Dt=nt+0,Ht=nt+1,Ft=nt+2;if(d)Dt=d[Dt],Ht=d[Ht],Ft=d[Ft];if(!p)Dt=Dt*N+E,Ht=Ht*N+E,Ft=Ft*N+E;for(let Xt=0;Xt<3;Xt++){let Jt,gt,Ot;if(p)Jt=c[D[Xt]](Dt),gt=c[D[Xt]](Ht),Ot=c[D[Xt]](Ft);else Jt=S[Dt+Xt],gt=S[Ht+Xt],Ot=S[Ft+Xt];let Kt=Jt;if(gt<Kt)Kt=gt;if(Ot<Kt)Kt=Ot;let pe=Jt;if(gt>pe)pe=gt;if(Ot>pe)pe=Ot;let Qt=(pe-Kt)/2,me=Xt*2;i[yt+me+0]=Kt+Qt,i[yt+me+1]=Qt+(Math.abs(Kt)+Qt)*qr}}return i}raycastObject3D(t,e,i=[]){let{material:s}=t;if(s===void 0)return;pp.copy(t.matrixWorld).invert(),ul.copy(e.ray).applyMatrix4(pp),mp.setFromMatrixScale(t.matrixWorld),dp.copy(ul.direction).multiply(mp);let a=dp.length(),c=e.near/a,d=e.far/a;if(e.firstHitOnly===!0){let p=this.raycastFirst(ul,s,c,d);if(p=Nh(p,t,e),p)i.push(p)}else{let p=this.raycast(ul,s,c,d);for(let S=0,E=p.length;S<E;S++){let N=Nh(p[S],t,e);if(N)i.push(N)}}return i}refit(t=null){return(this.indirect?ap:Qd)(this,t)}raycast(t,e=ne,i=0,s=1/0){let a=this._roots,c=[],d=this.indirect?lp:np;for(let p=0,S=a.length;p<S;p++)d(this,p,e,t,c,i,s);return c}raycastFirst(t,e=ne,i=0,s=1/0){let a=this._roots,c=null,d=this.indirect?cp:ip;for(let p=0,S=a.length;p<S;p++){let E=d(this,p,e,t,i,s);if(E!=null&&(c==null||E.distance<c.distance))c=E}return c}intersectsGeometry(t,e){let i=!1,s=this._roots,a=this.indirect?up:rp;for(let c=0,d=s.length;c<d;c++)if(i=a(this,c,t,e),i)break;return i}shapecast(t){let e=Qi.getPrimitive(),i=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?ep:Kd});return Qi.releasePrimitive(e),i}bvhcast(t,e,i){let{intersectsRanges:s,intersectsTriangles:a}=i,c=Qi.getPrimitive(),d=this.geometry.index,p=this.geometry.attributes.position,S=this.indirect?(tt)=>{let vt=this.resolveTriangleIndex(tt);yi(c,vt*3,d,p)}:(tt)=>{yi(c,tt*3,d,p)},E=Qi.getPrimitive(),N=t.geometry.index,D=t.geometry.attributes.position,L=t.indirect?(tt)=>{let vt=t.resolveTriangleIndex(tt);yi(E,vt*3,N,D)}:(tt)=>{yi(E,tt*3,N,D)};if(a){if(!(t instanceof de))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let tt=(vt,zt,nt,yt,Dt,Ht,Ft,Xt)=>{for(let Jt=nt,gt=nt+yt;Jt<gt;Jt++){L(Jt),E.a.applyMatrix4(e),E.b.applyMatrix4(e),E.c.applyMatrix4(e),E.needsUpdate=!0;for(let Ot=vt,Kt=vt+zt;Ot<Kt;Ot++)if(S(Ot),c.needsUpdate=!0,a(c,E,Ot,Jt,Dt,Ht,Ft,Xt))return!0}return!1};if(s){let vt=s;s=function(zt,nt,yt,Dt,Ht,Ft,Xt,Jt){if(!vt(zt,nt,yt,Dt,Ht,Ft,Xt,Jt))return tt(zt,nt,yt,Dt,Ht,Ft,Xt,Jt);return!0}}else s=tt}return super.bvhcast(t,e,{intersectsRanges:s})}intersectsBox(t,e){return hl.set(t.min,t.max,e),hl.needsUpdate=!0,this.shapecast({intersectsBounds:(i)=>hl.intersectsBox(i),intersectsTriangle:(i)=>hl.intersectsTriangle(i)})}intersectsSphere(t){return this.shapecast({intersectsBounds:(e)=>t.intersectsBox(e),intersectsTriangle:(e)=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,i={},s={},a=0,c=1/0){return(this.indirect?fp:op)(this,t,e,i,s,a,c)}closestPointToPoint(t,e={},i=0,s=1/0){return Vd(this,t,e,i,s)}}var YA=parseInt(pr)>=166,oo={Mesh:u.prototype.raycast,Line:ve.prototype.raycast,LineSegments:te.prototype.raycast,LineLoop:ye.prototype.raycast,Points:j.prototype.raycast,BatchedMesh:La.prototype.raycast},zi=new u,fl=[];function gp(t,e){if(this.isBatchedMesh)ky.call(this,t,e);else{let{geometry:i}=this;if(i.boundsTree)i.boundsTree.raycastObject3D(this,t,e);else{let s;if(this instanceof u)s=oo.Mesh;else if(this instanceof te)s=oo.LineSegments;else if(this instanceof ye)s=oo.LineLoop;else if(this instanceof ve)s=oo.Line;else if(this instanceof j)s=oo.Points;else throw Error("BVH: Fallback raycast function not found.");s.call(this,t,e)}}}function ky(t,e){if(this.boundsTrees){let i=this.boundsTrees,s=this._drawInfo||this._instanceInfo,a=this._drawRanges||this._geometryInfo,c=this.matrixWorld;zi.material=this.material,zi.geometry=this.geometry;let d=zi.geometry.boundsTree,p=zi.geometry.drawRange;if(zi.geometry.boundingSphere===null)zi.geometry.boundingSphere=new M;for(let S=0,E=s.length;S<E;S++){if(!this.getVisibleAt(S))continue;let N=s[S].geometryIndex;if(zi.geometry.boundsTree=i[N],this.getMatrixAt(S,zi.matrixWorld).premultiply(c),!zi.geometry.boundsTree){this.getBoundingBoxAt(N,zi.geometry.boundingBox),this.getBoundingSphereAt(N,zi.geometry.boundingSphere);let D=a[N];zi.geometry.setDrawRange(D.start,D.count)}zi.raycast(t,fl);for(let D=0,L=fl.length;D<L;D++){let tt=fl[D];tt.object=this,tt.batchId=S,e.push(tt)}fl.length=0}zi.geometry.boundsTree=d,zi.geometry.drawRange=p,zi.material=null,zi.geometry=null}else oo.BatchedMesh.call(this,t,e)}var X=11;function Hy(t){let{roots:e,indirectBuffer:i}=de.serialize(t,{cloneBuffers:!1});return e.reduce((s,a)=>s+a.byteLength,i?.byteLength??0)}function Gt(t,e){let i=performance.now(),s=e?de.deserialize(e,t.geometry,{setIndex:!1}):new de(t.geometry,{indirect:!0}),a=Hy(s);return t.geometry.boundsTree=s,t.raycast=gp,performance.measure("map2lap.bvh",{start:i,detail:a}),a}var fe=(t)=>t.vertices*X*4+4+t.indices*2;function $t(t,e){let{vertices:i,indices:s}=t;if(!Number.isInteger(i)||i<0||i>65535||!Number.isInteger(s)||s<0||s%3||e.byteLength!==fe(t))throw Error("Invalid track geometry");let a=i*X*4;if(new DataView(e).getUint32(a,!0)!==s||new Uint16Array(e,a+4,s).some((c)=>c>=i))throw Error("Invalid track triangle indices")}function It(t,e,i){return`/api/editor/${encodeURIComponent(t)}/mesh/${i.i}?r=${e.revision}`+(i.model?`&d=${e.draft??0}`:i.copy?`&c=${e.copy_revision??""}`:"")}function Vy(t,e,i){return Math.hypot(...t.map((s,a)=>Math.max(Math.abs(e[a]-s),Math.abs(i[a]-s))))}function Ve(t,e){t.computeBoundingBox();let i=t.boundingBox;t.boundingSphere=new M(new n(...e.center),Math.max(e.radius,Vy(e.center,i.min.toArray(),i.max.toArray())))}function mt(t,e){let i=new g,s=new Be(new Float32Array(e,0,t.vertices*X),X);i.setAttribute("position",new K(s,3,0)),i.setAttribute("normal",new K(s,3,3)),i.setAttribute("uv",new K(s,2,6));let a=t.vertices*X*4+4;return i.setIndex(new _(new Uint16Array(e,a,t.indices),1)),Ve(i,t),i}
export{Re,We,ne,C,Y,it,_t,Ce,bt,st,ce,Ue,St,G,Tt,ke,A,Ge,F,H,V,xt,$e,Ke,je,rt,ot,at,lt,Vt,Mt,kt,ct,qe,ge,ue,k,Bt,B,o,P,n,m,v,y,z,r,T,W,l,ut,q,h,_,x,M,g,Be,K,R,I,ie,U,u,wt,ht,se,dt,Ne,J,Q,ee,ve,te,ye,_e,j,ft,Et,Pe,Fe,pt,re,O,Z,be,Le,Se,Ie,Oe,He,Yt,he,Je,At,Rt,oe,Wt,ze,w,Ct,Qe,Te,Xe,Ut,De,Nt,b,ae,Ze,Pt,Lt,f,et,xe,de,X,Gt,fe,$t,It,Ve,mt};
