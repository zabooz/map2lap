var Ni="187",op={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ap={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},qh=0,Ba=1,Yh=2;var Js=1,Zh=2,ps=3,Jn=0,Ye=1,pn=2,Di=0,$s=1,za=2,Ga=3,ka=4,Jh=5;var ms=100,$h=101,Kh=102,Qh=103,jh=104,tu=200,eu=201,nu=202,iu=203,su=204,ru=205,ou=206,au=207,lu=208,cu=209,hu=210,uu=211,fu=212,du=213,pu=214,mu=0,gu=1,_u=2,Ha=3,xu=4,yu=5,vu=6,Su=7,Mu=0,bu=1,Tu=2,Ln=0,Va=1,Wa=2,Xa=3,qa=4,Ya=5,Za=6,Ja=7;var Ks=301,gs=302,ro=303,oo=304,Au=1000,ao=1001,Eu=1002,ui=1003,wu=1004;var Qs=1005;var mn=1006,lo=1007;var fi=1008;var An=1009,Ru=1010,Cu=1011,js=1012,$a=1013,di=1014,$n=1015,Nn=1016,Ka=1017,Qa=1018,Ui=1020,Iu=35902,Pu=35899,Lu=1021,Nu=1022,Kn=1023,_s=1026,pi=1027,Du=1028,ja=1029,Fi=1030,tl=1031;var el=1033,co=33776,ho=33777,uo=33778,fo=33779,nl=35840,il=35841,sl=35842,rl=35843,ol=36196,al=37492,ll=37496,cl=37488,hl=37489,po=37490,ul=37491,fl=37808,dl=37809,pl=37810,ml=37811,gl=37812,_l=37813,xl=37814,yl=37815,vl=37816,Sl=37817,Ml=37818,bl=37819,Tl=37820,Al=37821,El=36492,wl=36494,Rl=36495,Cl=36283,Il=36284,mo=36285,Pl=36286;var lp=2300,cp=2301;var hp=0,up=1,fp=2;var Ll=0,Uu=1,Oi="",Fu="srgb",Nl="srgb-linear",Dl="linear",he="srgb";var Ou=512,Bu=513,zu=514,Ul=515,Gu=516,ku=517,Fl=518,Ol=519;var Bl="300 es",zl=2000,dp=2001;function pp(t){for(let e=t.length-1;e>=0;--e)if(t[e]>=65535)return!0;return!1}function mp(t){return ArrayBuffer.isView(t)&&!(t instanceof DataView)}function fs(t){return document.createElementNS("http://www.w3.org/1999/xhtml",t)}function Hu(){let t=fs("canvas");return t.style.display="block",t}var eh={},ds=null;function Zs(...t){let e="THREE."+t.shift();if(ds)ds("log",e,...t);else console.log(e,...t)}function Vu(t){let e=t[0];if(typeof e==="string"&&e.startsWith("TSL:")){let n=t[1];if(n&&n.isStackTrace)t[0]+=" "+n.getLocation();else t[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return t}function At(...t){t=Vu(t);let e="THREE."+t.shift();if(ds)ds("warn",e,...t);else{let n=t[0];if(n&&n.isStackTrace)console.warn(n.getError(e));else console.warn(e,...t)}}function Nt(...t){t=Vu(t);let e="THREE."+t.shift();if(ds)ds("error",e,...t);else{let n=t[0];if(n&&n.isStackTrace)console.error(n.getError(e));else console.error(e,...t)}}function Pi(...t){let e=t.join(" ");if(e in eh)return;eh[e]=!0,At(...t)}function Wu(t,e,n){return new Promise(function(i,s){function r(){switch(t.clientWaitSync(e,t.SYNC_FLUSH_COMMANDS_BIT,0)){case t.WAIT_FAILED:s();break;case t.TIMEOUT_EXPIRED:setTimeout(r,n);break;default:i()}}setTimeout(r,n)})}var Xu={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class Dn{addEventListener(t,e){if(this._listeners===void 0)this._listeners={};let n=this._listeners;if(n[t]===void 0)n[t]=[];if(n[t].indexOf(e)===-1)n[t].push(e)}hasEventListener(t,e){let n=this._listeners;if(n===void 0)return!1;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let s=i.indexOf(e);if(s!==-1)i.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let s=0,r=i.length;s<r;s++)i[s].call(this,t);t.target=null}}}var We=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],nh=1234567,qs=Math.PI/180,Li=180/Math.PI;function Un(){let t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(We[t&255]+We[t>>8&255]+We[t>>16&255]+We[t>>24&255]+"-"+We[e&255]+We[e>>8&255]+"-"+We[e>>16&15|64]+We[e>>24&255]+"-"+We[n&63|128]+We[n>>8&255]+"-"+We[n>>16&255]+We[n>>24&255]+We[i&255]+We[i>>8&255]+We[i>>16&255]+We[i>>24&255]).toLowerCase()}function Ut(t,e,n){return Math.max(e,Math.min(n,t))}function Gl(t,e){return(t%e+e)%e}function gp(t,e,n,i,s){return i+(t-e)*(s-i)/(n-e)}function _p(t,e,n){if(t!==e)return(n-t)/(e-t);else return 0}function Ys(t,e,n){return(1-n)*t+n*e}function xp(t,e,n,i){return Ys(t,e,1-Math.exp(-n*i))}function yp(t,e=1){return e-Math.abs(Gl(t,e*2)-e)}function vp(t,e,n){if(t<=e)return 0;if(t>=n)return 1;return t=(t-e)/(n-e),t*t*(3-2*t)}function Sp(t,e,n){if(t<=e)return 0;if(t>=n)return 1;return t=(t-e)/(n-e),t*t*t*(t*(t*6-15)+10)}function Mp(t,e){return t+Math.floor(Math.random()*(e-t+1))}function bp(t,e){return t+Math.random()*(e-t)}function Tp(t){return t*(0.5-Math.random())}function Ap(t){if(t!==void 0)nh=t;let e=nh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Ep(t){return t*qs}function wp(t){return t*Li}function Rp(t){return t>0&&Number.isInteger(t)&&2**Math.round(Math.log2(t))===t}function Cp(t){return Math.pow(2,Math.ceil(Math.log(t)/Math.LN2))}function kl(t){return Math.pow(2,Math.floor(Math.log(t)/Math.LN2))}function Ip(t,e,n,i,s){let{cos:r,sin:o}=Math,a=r(n/2),l=o(n/2),c=r((e+i)/2),u=o((e+i)/2),f=r((e-i)/2),h=o((e-i)/2),d=r((i-e)/2),_=o((i-e)/2);switch(s){case"XYX":t.set(a*u,l*f,l*h,a*c);break;case"YZY":t.set(l*h,a*u,l*f,a*c);break;case"ZXZ":t.set(l*f,l*h,a*u,a*c);break;case"XZX":t.set(a*u,l*_,l*d,a*c);break;case"YXY":t.set(l*d,a*u,l*_,a*c);break;case"ZYZ":t.set(l*_,l*d,a*u,a*c);break;default:At("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function go(t){switch(t.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Hl(t,e){if(e.constructor===Float32Array)return t;let n=go(e);if(n===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(t/n,-1)}function Vl(t,e){if(e.constructor===Float32Array)return t;let n=go(e);if(n===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(t*n)}var Pp={DEG2RAD:qs,RAD2DEG:Li,generateUUID:Un,clamp:Ut,euclideanModulo:Gl,mapLinear:gp,inverseLerp:_p,lerp:Ys,damp:xp,pingpong:yp,smoothstep:vp,smootherstep:Sp,randInt:Mp,randFloat:bp,randFloatSpread:Tp,seededRandom:Ap,degToRad:Ep,radToDeg:wp,isPowerOfTwo:Rp,ceilPowerOfTwo:Cp,floorPowerOfTwo:kl,setQuaternionFromProperEuler:Ip,normalize:Vl,denormalize:Hl};class Lt{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Ut(this.x,t.x,e.x),this.y=Ut(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Ut(this.x,t,e),this.y=Ut(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ut(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ut(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),s=this.x-t.x,r=this.y-t.y;return this.x=s*n-r*i+t.x,this.y=s*i+r*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Qn{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,s,r,o){let a=n[i+0],l=n[i+1],c=n[i+2],u=n[i+3],f=s[r+0],h=s[r+1],d=s[r+2],_=s[r+3];if(u!==_||a!==f||l!==h||c!==d){let S=a*f+l*h+c*d+u*_;if(S<0)f=-f,h=-h,d=-d,_=-_,S=-S;let p=1-o;if(S<0.9995){let g=Math.acos(S),x=Math.sin(g);p=Math.sin(p*g)/x,o=Math.sin(o*g)/x,a=a*p+f*o,l=l*p+h*o,c=c*p+d*o,u=u*p+_*o}else{a=a*p+f*o,l=l*p+h*o,c=c*p+d*o,u=u*p+_*o;let g=1/Math.sqrt(a*a+l*l+c*c+u*u);a*=g,l*=g,c*=g,u*=g}}t[e]=a,t[e+1]=l,t[e+2]=c,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,i,s,r){let o=n[i],a=n[i+1],l=n[i+2],c=n[i+3],u=s[r],f=s[r+1],h=s[r+2],d=s[r+3];return t[e]=o*d+c*u+a*h-l*f,t[e+1]=a*d+c*f+l*u-o*h,t[e+2]=l*d+c*h+o*f-a*u,t[e+3]=c*d-o*u-a*f-l*h,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let{_x:n,_y:i,_z:s,_order:r}=t,o=Math.cos,a=Math.sin,l=o(n/2),c=o(i/2),u=o(s/2),f=a(n/2),h=a(i/2),d=a(s/2);switch(r){case"XYZ":this._x=f*c*u+l*h*d,this._y=l*h*u-f*c*d,this._z=l*c*d+f*h*u,this._w=l*c*u-f*h*d;break;case"YXZ":this._x=f*c*u+l*h*d,this._y=l*h*u-f*c*d,this._z=l*c*d-f*h*u,this._w=l*c*u+f*h*d;break;case"ZXY":this._x=f*c*u-l*h*d,this._y=l*h*u+f*c*d,this._z=l*c*d+f*h*u,this._w=l*c*u-f*h*d;break;case"ZYX":this._x=f*c*u-l*h*d,this._y=l*h*u+f*c*d,this._z=l*c*d-f*h*u,this._w=l*c*u+f*h*d;break;case"YZX":this._x=f*c*u+l*h*d,this._y=l*h*u+f*c*d,this._z=l*c*d-f*h*u,this._w=l*c*u-f*h*d;break;case"XZY":this._x=f*c*u-l*h*d,this._y=l*h*u-f*c*d,this._z=l*c*d+f*h*u,this._w=l*c*u+f*h*d;break;default:At("Quaternion: .setFromEuler() encountered an unknown order: "+r)}if(e===!0)this._onChangeCallback();return this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],s=e[8],r=e[1],o=e[5],a=e[9],l=e[2],c=e[6],u=e[10],f=n+o+u;if(f>0){let h=0.5/Math.sqrt(f+1);this._w=0.25/h,this._x=(c-a)*h,this._y=(s-l)*h,this._z=(r-i)*h}else if(n>o&&n>u){let h=2*Math.sqrt(1+n-o-u);this._w=(c-a)/h,this._x=0.25*h,this._y=(i+r)/h,this._z=(s+l)/h}else if(o>u){let h=2*Math.sqrt(1+o-n-u);this._w=(s-l)/h,this._x=(i+r)/h,this._y=0.25*h,this._z=(a+c)/h}else{let h=2*Math.sqrt(1+u-n-o);this._w=(r-i)/h,this._x=(s+l)/h,this._y=(a+c)/h,this._z=0.25*h}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;if(n<0.00000001)if(n=0,Math.abs(t.x)>Math.abs(t.z))this._x=-t.y,this._y=t.x,this._z=0,this._w=n;else this._x=0,this._y=-t.z,this._z=t.y,this._w=n;else this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n;return this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ut(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();if(t===0)this._x=0,this._y=0,this._z=0,this._w=1;else t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t;return this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let{_x:n,_y:i,_z:s,_w:r}=t,o=e._x,a=e._y,l=e._z,c=e._w;return this._x=n*c+r*o+i*l-s*a,this._y=i*c+r*a+s*o-n*l,this._z=s*c+r*l+n*a-i*o,this._w=r*c-n*o-i*a-s*l,this._onChangeCallback(),this}slerp(t,e){let{_x:n,_y:i,_z:s,_w:r}=t,o=this.dot(t);if(o<0)n=-n,i=-i,s=-s,r=-r,o=-o;let a=1-e;if(o<0.9995){let l=Math.acos(o),c=Math.sin(l);a=Math.sin(a*l)/c,e=Math.sin(e*l)/c,this._x=this._x*a+n*e,this._y=this._y*a+i*e,this._z=this._z*a+s*e,this._w=this._w*a+r*e,this._onChangeCallback()}else this._x=this._x*a+n*e,this._y=this._y*a+i*e,this._z=this._z*a+s*e,this._w=this._w*a+r*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class N{static{this.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){if(n===void 0)n=this.z;return this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(ih.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(ih.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*i,this.y=s[1]*e+s[4]*n+s[7]*i,this.z=s[2]*e+s[5]*n+s[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=t.elements,r=1/(s[3]*e+s[7]*n+s[11]*i+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*i+s[12])*r,this.y=(s[1]*e+s[5]*n+s[9]*i+s[13])*r,this.z=(s[2]*e+s[6]*n+s[10]*i+s[14])*r,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,s=t.x,r=t.y,o=t.z,a=t.w,l=2*(r*i-o*n),c=2*(o*e-s*i),u=2*(s*n-r*e);return this.x=e+a*l+r*u-o*c,this.y=n+a*c+o*l-s*u,this.z=i+a*u+s*c-r*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*i,this.y=s[1]*e+s[5]*n+s[9]*i,this.z=s[2]*e+s[6]*n+s[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Ut(this.x,t.x,e.x),this.y=Ut(this.y,t.y,e.y),this.z=Ut(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Ut(this.x,t,e),this.y=Ut(this.y,t,e),this.z=Ut(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ut(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let{x:n,y:i,z:s}=t,r=e.x,o=e.y,a=e.z;return this.x=i*a-s*o,this.y=s*r-n*a,this.z=n*o-i*r,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return la.copy(this).projectOnVector(t),this.sub(la)}reflect(t){return this.sub(la.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ut(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var la=new N,ih=new Qn;class Ft{static{this.prototype.isMatrix3=!0}constructor(t,e,n,i,s,r,o,a,l){if(this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0)this.set(t,e,n,i,s,r,o,a,l)}set(t,e,n,i,s,r,o,a,l){let c=this.elements;return c[0]=t,c[1]=i,c[2]=o,c[3]=e,c[4]=s,c[5]=a,c[6]=n,c[7]=r,c[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,r=n[0],o=n[3],a=n[6],l=n[1],c=n[4],u=n[7],f=n[2],h=n[5],d=n[8],_=i[0],S=i[3],p=i[6],g=i[1],x=i[4],M=i[7],y=i[2],b=i[5],E=i[8];return s[0]=r*_+o*g+a*y,s[3]=r*S+o*x+a*b,s[6]=r*p+o*M+a*E,s[1]=l*_+c*g+u*y,s[4]=l*S+c*x+u*b,s[7]=l*p+c*M+u*E,s[2]=f*_+h*g+d*y,s[5]=f*S+h*x+d*b,s[8]=f*p+h*M+d*E,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],o=t[5],a=t[6],l=t[7],c=t[8];return e*r*c-e*o*l-n*s*c+n*o*a+i*s*l-i*r*a}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],o=t[5],a=t[6],l=t[7],c=t[8],u=c*r-o*l,f=o*a-c*s,h=l*s-r*a,d=e*u+n*f+i*h;if(d===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/d;return t[0]=u*_,t[1]=(i*l-c*n)*_,t[2]=(o*n-i*r)*_,t[3]=f*_,t[4]=(c*e-i*a)*_,t[5]=(i*s-o*e)*_,t[6]=h*_,t[7]=(n*a-l*e)*_,t[8]=(r*e-n*s)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,s,r,o){let a=Math.cos(s),l=Math.sin(s);return this.set(n*a,n*l,-n*(a*r+l*o)+r+t,-i*l,i*a,-i*(-l*r+a*o)+o+e,0,0,1),this}scale(t,e){return Pi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ca.makeScale(t,e)),this}rotate(t){return Pi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ca.makeRotation(-t)),this}translate(t,e){return Pi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ca.makeTranslation(t,e)),this}makeTranslation(t,e){if(t.isVector2)this.set(1,0,t.x,0,1,t.y,0,0,1);else this.set(1,0,t,0,1,e,0,0,1);return this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}var ca=new Ft,sh=new Ft().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),rh=new Ft().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Lp(){let t={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(s,r,o){if(this.enabled===!1||r===o||!r||!o)return s;if(this.spaces[r].transfer==="srgb")s.r=Zn(s.r),s.g=Zn(s.g),s.b=Zn(s.b);if(this.spaces[r].primaries!==this.spaces[o].primaries)s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ);if(this.spaces[o].transfer==="srgb")s.r=us(s.r),s.g=us(s.g),s.b=us(s.b);return s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){if(s==="")return"linear";return this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[0.64,0.33,0.3,0.6,0.15,0.06],n=[0.2126,0.7152,0.0722],i=[0.3127,0.329];return t.define({["srgb-linear"]:{primaries:e,whitePoint:i,transfer:"linear",toXYZ:sh,fromXYZ:rh,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:e,whitePoint:i,transfer:"srgb",toXYZ:sh,fromXYZ:rh,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),t}var Vt=Lp();function Zn(t){return t<0.04045?t*0.0773993808:Math.pow(t*0.9478672986+0.0521327014,2.4)}function us(t){return t<0.0031308?t*12.92:1.055*Math.pow(t,0.41666)-0.055}var Zi;class Wl{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src))return t.src;if(typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{if(Zi===void 0)Zi=fs("canvas");Zi.width=t.width,Zi.height=t.height;let i=Zi.getContext("2d");if(t instanceof ImageData)i.putImageData(t,0,0);else i.drawImage(t,0,0,t.width,t.height);n=Zi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=fs("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),s=i.data;for(let r=0;r<s.length;r++)s[r]=Zn(s[r]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)if(e instanceof Uint8Array||e instanceof Uint8ClampedArray)e[n]=Math.floor(Zn(e[n]/255)*255);else e[n]=Zn(e[n]);return{data:e,width:t.width,height:t.height}}else return At("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}var Np=0;class tr{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Np++}),this.uuid=Un(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;if(typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement)t.set(e.videoWidth,e.videoHeight,0);else if(typeof VideoFrame<"u"&&e instanceof VideoFrame)t.set(e.displayWidth,e.displayHeight,0);else if(e!==null)t.set(e.width||0,e.height||0,e.depth||0);else t.set(0,0,0);return t}set needsUpdate(t){if(t===!0)this.version++}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let s;if(Array.isArray(i)){s=[];for(let r=0,o=i.length;r<o;r++)if(i[r].isDataTexture)s.push(ha(i[r].image));else s.push(ha(i[r]))}else s=ha(i);n.url=s}if(!e)t.images[this.uuid]=n;return n}}function ha(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap)return Wl.getDataURL(t);else if(t.data)return{data:Array.from(t.data),width:t.width,height:t.height,type:t.data.constructor.name};else return At("Texture: Unable to serialize Texture."),{}}var Dp=0,ua=new N;class we extends Dn{constructor(t=we.DEFAULT_IMAGE,e=we.DEFAULT_MAPPING,n=1001,i=1001,s=1006,r=1008,o=1023,a=1009,l=we.DEFAULT_ANISOTROPY,c=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Dp++}),this.uuid=Un(),this.name="",this.source=new tr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=s,this.minFilter=r,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=a,this.offset=new Lt(0,0),this.repeat=new Lt(1,1),this.center=new Lt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ft,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=c,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=t&&t.depth&&t.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(ua).x}get height(){return this.source.getSize(ua).y}get depth(){return this.source.getSize(ua).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){At(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){At(`Texture.setValues(): property '${e}' does not exist.`);continue}if(i&&n&&(i.isVector2&&n.isVector2))i.copy(n);else if(i&&n&&(i.isVector3&&n.isVector3))i.copy(n);else if(i&&n&&(i.isMatrix3&&n.isMatrix3))i.copy(n);else this[e]=n}}toJSON(t){let e=t===void 0||typeof t==="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)n.userData=this.userData;if(!e)t.textures[this.uuid]=n;return n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==300)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case 1000:t.x=t.x-Math.floor(t.x);break;case 1001:t.x=t.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.x)%2)===1)t.x=Math.ceil(t.x)-t.x;else t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case 1000:t.y=t.y-Math.floor(t.y);break;case 1001:t.y=t.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(t.y)%2)===1)t.y=Math.ceil(t.y)-t.y;else t.y=t.y-Math.floor(t.y);break}if(this.flipY)t.y=1-t.y;return t}set needsUpdate(t){if(t===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(t){if(t===!0)this.pmremVersion++}}we.DEFAULT_IMAGE=null;we.DEFAULT_MAPPING=300;we.DEFAULT_ANISOTROPY=1;class oe{static{this.prototype.isVector4=!0}constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,s=this.w,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i+r[12]*s,this.y=r[1]*e+r[5]*n+r[9]*i+r[13]*s,this.z=r[2]*e+r[6]*n+r[10]*i+r[14]*s,this.w=r[3]*e+r[7]*n+r[11]*i+r[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);if(e<0.0001)this.x=1,this.y=0,this.z=0;else this.x=t.x/e,this.y=t.y/e,this.z=t.z/e;return this}setAxisAngleFromRotationMatrix(t){let e,n,i,s,r=0.01,o=0.1,a=t.elements,l=a[0],c=a[4],u=a[8],f=a[1],h=a[5],d=a[9],_=a[2],S=a[6],p=a[10];if(Math.abs(c-f)<0.01&&Math.abs(u-_)<0.01&&Math.abs(d-S)<0.01){if(Math.abs(c+f)<0.1&&Math.abs(u+_)<0.1&&Math.abs(d+S)<0.1&&Math.abs(l+h+p-3)<0.1)return this.set(1,0,0,0),this;e=Math.PI;let x=(l+1)/2,M=(h+1)/2,y=(p+1)/2,b=(c+f)/4,E=(u+_)/4,m=(d+S)/4;if(x>M&&x>y)if(x<0.01)n=0,i=0.707106781,s=0.707106781;else n=Math.sqrt(x),i=b/n,s=E/n;else if(M>y)if(M<0.01)n=0.707106781,i=0,s=0.707106781;else i=Math.sqrt(M),n=b/i,s=m/i;else if(y<0.01)n=0.707106781,i=0.707106781,s=0;else s=Math.sqrt(y),n=E/s,i=m/s;return this.set(n,i,s,e),this}let g=Math.sqrt((S-d)*(S-d)+(u-_)*(u-_)+(f-c)*(f-c));if(Math.abs(g)<0.001)g=1;return this.x=(S-d)/g,this.y=(u-_)/g,this.z=(f-c)/g,this.w=Math.acos((l+h+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Ut(this.x,t.x,e.x),this.y=Ut(this.y,t.y,e.y),this.z=Ut(this.z,t.z,e.z),this.w=Ut(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Ut(this.x,t,e),this.y=Ut(this.y,t,e),this.z=Ut(this.z,t,e),this.w=Ut(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ut(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Xl extends Dn{constructor(t=1,e=1,n={}){super();n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new oe(0,0,t,e),this.scissorTest=!1,this.viewport=new oe(0,0,t,e),this.textures=[];let i=n.count;for(let s=0;s<i;s++)this.textures[s]=new we({width:t,height:e,depth:n.depth}),this.textures[s].isRenderTargetTexture=!0,this.textures[s].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(t.mapping!==void 0)e.mapping=t.mapping;if(t.wrapS!==void 0)e.wrapS=t.wrapS;if(t.wrapT!==void 0)e.wrapT=t.wrapT;if(t.wrapR!==void 0)e.wrapR=t.wrapR;if(t.magFilter!==void 0)e.magFilter=t.magFilter;if(t.minFilter!==void 0)e.minFilter=t.minFilter;if(t.format!==void 0)e.format=t.format;if(t.type!==void 0)e.type=t.type;if(t.anisotropy!==void 0)e.anisotropy=t.anisotropy;if(t.colorSpace!==void 0)e.colorSpace=t.colorSpace;if(t.flipY!==void 0)e.flipY=t.flipY;if(t.generateMipmaps!==void 0)e.generateMipmaps=t.generateMipmaps;if(t.mipmapsAutoUpdate!==void 0)e.mipmapsAutoUpdate=t.mipmapsAutoUpdate;if(t.internalFormat!==void 0)e.internalFormat=t.internalFormat;for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(t!==null&&t.renderTarget===null)t.renderTarget=this;this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,s=this.textures.length;i<s;i++)if(this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0)this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let i=Object.assign({},t.textures[e].image);this.textures[e].source=new tr(i)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class gn extends Xl{constructor(t=1,e=1,n={}){super(t,e,n);this.isWebGLRenderTarget=!0}}class _o extends we{constructor(t=null,e=1,n=1,i=1){super(null);this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class ql extends we{constructor(t=null,e=1,n=1,i=1){super(null);this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}class wt{static{this.prototype.isMatrix4=!0}constructor(t,e,n,i,s,r,o,a,l,c,u,f,h,d,_,S){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0)this.set(t,e,n,i,s,r,o,a,l,c,u,f,h,d,_,S)}set(t,e,n,i,s,r,o,a,l,c,u,f,h,d,_,S){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=i,p[1]=s,p[5]=r,p[9]=o,p[13]=a,p[2]=l,p[6]=c,p[10]=u,p[14]=f,p[3]=h,p[7]=d,p[11]=_,p[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new wt().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){if(this.determinantAffine()===0)return t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this;return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/Ji.setFromMatrixColumn(t,0).length(),s=1/Ji.setFromMatrixColumn(t,1).length(),r=1/Ji.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*r,e[9]=n[9]*r,e[10]=n[10]*r,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,s=t.z,r=Math.cos(n),o=Math.sin(n),a=Math.cos(i),l=Math.sin(i),c=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let f=r*c,h=r*u,d=o*c,_=o*u;e[0]=a*c,e[4]=-a*u,e[8]=l,e[1]=h+d*l,e[5]=f-_*l,e[9]=-o*a,e[2]=_-f*l,e[6]=d+h*l,e[10]=r*a}else if(t.order==="YXZ"){let f=a*c,h=a*u,d=l*c,_=l*u;e[0]=f+_*o,e[4]=d*o-h,e[8]=r*l,e[1]=r*u,e[5]=r*c,e[9]=-o,e[2]=h*o-d,e[6]=_+f*o,e[10]=r*a}else if(t.order==="ZXY"){let f=a*c,h=a*u,d=l*c,_=l*u;e[0]=f-_*o,e[4]=-r*u,e[8]=d+h*o,e[1]=h+d*o,e[5]=r*c,e[9]=_-f*o,e[2]=-r*l,e[6]=o,e[10]=r*a}else if(t.order==="ZYX"){let f=r*c,h=r*u,d=o*c,_=o*u;e[0]=a*c,e[4]=d*l-h,e[8]=f*l+_,e[1]=a*u,e[5]=_*l+f,e[9]=h*l-d,e[2]=-l,e[6]=o*a,e[10]=r*a}else if(t.order==="YZX"){let f=r*a,h=r*l,d=o*a,_=o*l;e[0]=a*c,e[4]=_-f*u,e[8]=d*u+h,e[1]=u,e[5]=r*c,e[9]=-o*c,e[2]=-l*c,e[6]=h*u+d,e[10]=f-_*u}else if(t.order==="XZY"){let f=r*a,h=r*l,d=o*a,_=o*l;e[0]=a*c,e[4]=-u,e[8]=l*c,e[1]=f*u+_,e[5]=r*c,e[9]=h*u-d,e[2]=d*u-h,e[6]=o*c,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Up,t,Fp)}lookAt(t,e,n){let i=this.elements;if(cn.subVectors(t,e),cn.lengthSq()===0)cn.z=1;if(cn.normalize(),ii.crossVectors(n,cn),ii.lengthSq()===0){if(Math.abs(n.z)===1)cn.x+=0.0001;else cn.z+=0.0001;cn.normalize(),ii.crossVectors(n,cn)}return ii.normalize(),Rr.crossVectors(cn,ii),i[0]=ii.x,i[4]=Rr.x,i[8]=cn.x,i[1]=ii.y,i[5]=Rr.y,i[9]=cn.y,i[2]=ii.z,i[6]=Rr.z,i[10]=cn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,s=this.elements,r=n[0],o=n[4],a=n[8],l=n[12],c=n[1],u=n[5],f=n[9],h=n[13],d=n[2],_=n[6],S=n[10],p=n[14],g=n[3],x=n[7],M=n[11],y=n[15],b=i[0],E=i[4],m=i[8],v=i[12],w=i[1],P=i[5],R=i[9],L=i[13],F=i[2],C=i[6],B=i[10],W=i[14],z=i[3],st=i[7],q=i[11],Q=i[15];return s[0]=r*b+o*w+a*F+l*z,s[4]=r*E+o*P+a*C+l*st,s[8]=r*m+o*R+a*B+l*q,s[12]=r*v+o*L+a*W+l*Q,s[1]=c*b+u*w+f*F+h*z,s[5]=c*E+u*P+f*C+h*st,s[9]=c*m+u*R+f*B+h*q,s[13]=c*v+u*L+f*W+h*Q,s[2]=d*b+_*w+S*F+p*z,s[6]=d*E+_*P+S*C+p*st,s[10]=d*m+_*R+S*B+p*q,s[14]=d*v+_*L+S*W+p*Q,s[3]=g*b+x*w+M*F+y*z,s[7]=g*E+x*P+M*C+y*st,s[11]=g*m+x*R+M*B+y*q,s[15]=g*v+x*L+M*W+y*Q,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[12],r=t[1],o=t[5],a=t[9],l=t[13],c=t[2],u=t[6],f=t[10],h=t[14],d=t[3],_=t[7],S=t[11],p=t[15],g=a*h-l*f,x=o*h-l*u,M=o*f-a*u,y=r*h-l*c,b=r*f-a*c,E=r*u-o*c;return e*(_*g-S*x+p*M)-n*(d*g-S*y+p*b)+i*(d*x-_*y+p*E)-s*(d*M-_*b+S*E)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],s=t[1],r=t[5],o=t[9],a=t[2],l=t[6],c=t[10];return e*(r*c-o*l)-n*(s*c-o*a)+i*(s*l-r*a)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;if(t.isVector3)i[12]=t.x,i[13]=t.y,i[14]=t.z;else i[12]=t,i[13]=e,i[14]=n;return this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],s=t[3],r=t[4],o=t[5],a=t[6],l=t[7],c=t[8],u=t[9],f=t[10],h=t[11],d=t[12],_=t[13],S=t[14],p=t[15],g=e*o-n*r,x=e*a-i*r,M=e*l-s*r,y=n*a-i*o,b=n*l-s*o,E=i*l-s*a,m=c*_-u*d,v=c*S-f*d,w=c*p-h*d,P=u*S-f*_,R=u*p-h*_,L=f*p-h*S,F=g*L-x*R+M*P+y*w-b*v+E*m;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/F;return t[0]=(o*L-a*R+l*P)*C,t[1]=(i*R-n*L-s*P)*C,t[2]=(_*E-S*b+p*y)*C,t[3]=(f*b-u*E-h*y)*C,t[4]=(a*w-r*L-l*v)*C,t[5]=(e*L-i*w+s*v)*C,t[6]=(S*M-d*E-p*x)*C,t[7]=(c*E-f*M+h*x)*C,t[8]=(r*R-o*w+l*m)*C,t[9]=(n*w-e*R-s*m)*C,t[10]=(d*b-_*M+p*g)*C,t[11]=(u*M-c*b-h*g)*C,t[12]=(o*v-r*P-a*m)*C,t[13]=(e*P-n*v+i*m)*C,t[14]=(_*x-d*y-S*g)*C,t[15]=(c*y-u*x+f*g)*C,this}scale(t){let e=this.elements,n=t.x,i=t.y,s=t.z;return e[0]*=n,e[4]*=i,e[8]*=s,e[1]*=n,e[5]*=i,e[9]*=s,e[2]*=n,e[6]*=i,e[10]*=s,e[3]*=n,e[7]*=i,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){if(t.isVector3)this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1);else this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1);return this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),s=1-n,r=t.x,o=t.y,a=t.z,l=s*r,c=s*o;return this.set(l*r+n,l*o-i*a,l*a+i*o,0,l*o+i*a,c*o+n,c*a-i*r,0,l*a-i*o,c*a+i*r,s*a*a+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,s,r){return this.set(1,n,s,0,t,1,r,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,s=e._x,r=e._y,o=e._z,a=e._w,l=s+s,c=r+r,u=o+o,f=s*l,h=s*c,d=s*u,_=r*c,S=r*u,p=o*u,g=a*l,x=a*c,M=a*u,y=n.x,b=n.y,E=n.z;return i[0]=(1-(_+p))*y,i[1]=(h+M)*y,i[2]=(d-x)*y,i[3]=0,i[4]=(h-M)*b,i[5]=(1-(f+p))*b,i[6]=(S+g)*b,i[7]=0,i[8]=(d+x)*E,i[9]=(S-g)*E,i[10]=(1-(f+_))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let s=this.determinantAffine();if(s===0)return n.set(1,1,1),e.identity(),this;let r=Ji.set(i[0],i[1],i[2]).length(),o=Ji.set(i[4],i[5],i[6]).length(),a=Ji.set(i[8],i[9],i[10]).length();if(s<0)r=-r;Sn.copy(this);let l=1/r,c=1/o,u=1/a;return Sn.elements[0]*=l,Sn.elements[1]*=l,Sn.elements[2]*=l,Sn.elements[4]*=c,Sn.elements[5]*=c,Sn.elements[6]*=c,Sn.elements[8]*=u,Sn.elements[9]*=u,Sn.elements[10]*=u,e.setFromRotationMatrix(Sn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,i,s,r,o=2000,a=!1){let l=this.elements,c=2*s/(e-t),u=2*s/(n-i),f=(e+t)/(e-t),h=(n+i)/(n-i),d,_;if(a)d=s/(r-s),_=r*s/(r-s);else if(o===2000)d=-(r+s)/(r-s),_=-2*r*s/(r-s);else if(o===2001)d=-r/(r-s),_=-r*s/(r-s);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=u,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,s,r,o=2000,a=!1){let l=this.elements,c=2/(e-t),u=2/(n-i),f=-(e+t)/(e-t),h=-(n+i)/(n-i),d,_;if(a)d=1/(r-s),_=r/(r-s);else if(o===2000)d=-2/(r-s),_=-(r+s)/(r-s);else if(o===2001)d=-1/(r-s),_=-s/(r-s);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=u,l[9]=0,l[13]=h,l[2]=0,l[6]=0,l[10]=d,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}var Ji=new N,Sn=new wt,Up=new N(0,0,0),Fp=new N(1,1,1),ii=new N,Rr=new N,cn=new N,oh=new wt,ah=new Qn;class Tn{constructor(t=0,e=0,n=0,i=Tn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,s=i[0],r=i[4],o=i[8],a=i[1],l=i[5],c=i[9],u=i[2],f=i[6],h=i[10];switch(e){case"XYZ":if(this._y=Math.asin(Ut(o,-1,1)),Math.abs(o)<0.9999999)this._x=Math.atan2(-c,h),this._z=Math.atan2(-r,s);else this._x=Math.atan2(f,l),this._z=0;break;case"YXZ":if(this._x=Math.asin(-Ut(c,-1,1)),Math.abs(c)<0.9999999)this._y=Math.atan2(o,h),this._z=Math.atan2(a,l);else this._y=Math.atan2(-u,s),this._z=0;break;case"ZXY":if(this._x=Math.asin(Ut(f,-1,1)),Math.abs(f)<0.9999999)this._y=Math.atan2(-u,h),this._z=Math.atan2(-r,l);else this._y=0,this._z=Math.atan2(a,s);break;case"ZYX":if(this._y=Math.asin(-Ut(u,-1,1)),Math.abs(u)<0.9999999)this._x=Math.atan2(f,h),this._z=Math.atan2(a,s);else this._x=0,this._z=Math.atan2(-r,l);break;case"YZX":if(this._z=Math.asin(Ut(a,-1,1)),Math.abs(a)<0.9999999)this._x=Math.atan2(-c,l),this._y=Math.atan2(-u,s);else this._x=0,this._y=Math.atan2(o,h);break;case"XZY":if(this._z=Math.asin(-Ut(r,-1,1)),Math.abs(r)<0.9999999)this._x=Math.atan2(f,l),this._y=Math.atan2(o,s);else this._x=Math.atan2(-c,h),this._y=0;break;default:At("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}if(this._order=e,n===!0)this._onChangeCallback();return this}setFromQuaternion(t,e,n){return oh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(oh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return ah.setFromEuler(this),this.setFromQuaternion(ah,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){if(this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0)this._order=t[3];return this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Tn.DEFAULT_ORDER="XYZ";class er{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}var Op=0,lh=new N,$i=new Qn,Hn=new wt,Cr=new N,Os=new N,Bp=new N,zp=new Qn,ch=new N(1,0,0),hh=new N(0,1,0),uh=new N(0,0,1),fh={type:"added"},Gp={type:"removed"},Ki={type:"childadded",child:null},fa={type:"childremoved",child:null};class _e extends Dn{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Op++}),this.uuid=Un(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=_e.DEFAULT_UP.clone();let t=new N,e=new Tn,n=new Qn,i=new N(1,1,1);function s(){n.setFromEuler(e,!1)}function r(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(r),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new wt},normalMatrix:{value:new Ft}}),this.matrix=new wt,this.matrixWorld=new wt,this.matrixAutoUpdate=_e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new er,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return $i.setFromAxisAngle(t,e),this.quaternion.multiply($i),this}rotateOnWorldAxis(t,e){return $i.setFromAxisAngle(t,e),this.quaternion.premultiply($i),this}rotateX(t){return this.rotateOnAxis(ch,t)}rotateY(t){return this.rotateOnAxis(hh,t)}rotateZ(t){return this.rotateOnAxis(uh,t)}translateOnAxis(t,e){return lh.copy(t).applyQuaternion(this.quaternion),this.position.add(lh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(ch,t)}translateY(t){return this.translateOnAxis(hh,t)}translateZ(t){return this.translateOnAxis(uh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Hn.copy(this.matrixWorld).invert())}lookAt(t,e,n){if(t.isVector3)Cr.copy(t);else Cr.set(t,e,n);let i=this.parent;if(this.updateWorldMatrix(!0,!1),Os.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)Hn.lookAt(Os,Cr,this.up);else Hn.lookAt(Cr,Os,this.up);if(this.quaternion.setFromRotationMatrix(Hn),i)Hn.extractRotation(i.matrixWorld),$i.setFromRotationMatrix(Hn),this.quaternion.premultiply($i.invert())}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}if(t===this)return Nt("Object3D.add: object can't be added as a child of itself.",t),this;if(t&&t.isObject3D)t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(fh),Ki.child=t,this.dispatchEvent(Ki),Ki.child=null;else Nt("Object3D.add: object not an instance of THREE.Object3D.",t);return this}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);if(e!==-1)t.parent=null,this.children.splice(e,1),t.dispatchEvent(Gp),fa.child=t,this.dispatchEvent(fa),fa.child=null;return this}removeFromParent(){let t=this.parent;if(t!==null)t.remove(this);return this}clear(){return this.remove(...this.children)}attach(t){if(this.updateWorldMatrix(!0,!1),Hn.copy(this.matrixWorld).invert(),t.parent!==null)t.parent.updateWorldMatrix(!0,!1),Hn.multiply(t.parent.matrixWorld);return t.applyMatrix4(Hn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(fh),Ki.child=t,this.dispatchEvent(Ki),Ki.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let r=this.children[n].getObjectByProperty(t,e);if(r!==void 0)return r}return}getObjectsByProperty(t,e,n=[]){if(this[t]===e)n.push(this);let i=this.children;for(let s=0,r=i.length;s<r;s++)i[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Os,t,Bp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Os,zp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;if(e!==null)t(e),e.traverseAncestors(t)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let{x:e,y:n,z:i}=t,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*n-s[8]*i,s[13]+=n-s[1]*e-s[5]*n-s[9]*i,s[14]+=i-s[2]*e-s[6]*n-s[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||t){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,t=!0}let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null)i.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||n){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,n=!0}if(e===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t==="string",n={};if(e)t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let i={};if(i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)i.userData=this.userData;if(i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null)i.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)i.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)i.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map((o)=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map((o)=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null)i.colorsTexture=this._colorsTexture.toJSON(t);if(this.boundingSphere!==null)i.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)i.boundingBox=this.boundingBox.toJSON()}function s(o,a){if(o[a.uuid]===void 0)o[a.uuid]=a.toJSON(t);return a.uuid}if(this.isScene){if(this.background){if(this.background.isColor)i.background=this.background.toJSON();else if(this.background.isTexture)i.background=this.background.toJSON(t).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)i.environment=this.environment.toJSON(t).uuid}else if(this.isMesh||this.isLine||this.isPoints){i.geometry=s(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let a=o.shapes;if(Array.isArray(a))for(let l=0,c=a.length;l<c;l++){let u=a[l];s(t.shapes,u)}else s(t.shapes,a)}}if(this.isSkinnedMesh){if(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)s(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let a=0,l=this.material.length;a<l;a++)o.push(s(t.materials,this.material[a]));i.material=o}else i.material=s(t.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){let a=this.animations[o];i.animations.push(s(t.animations,a))}}if(e){let o=r(t.geometries),a=r(t.materials),l=r(t.textures),c=r(t.images),u=r(t.shapes),f=r(t.skeletons),h=r(t.animations),d=r(t.nodes);if(o.length>0)n.geometries=o;if(a.length>0)n.materials=a;if(l.length>0)n.textures=l;if(c.length>0)n.images=c;if(u.length>0)n.shapes=u;if(f.length>0)n.skeletons=f;if(h.length>0)n.animations=h;if(d.length>0)n.nodes=d}return n.object=i,n;function r(o){let a=[];for(let l in o){let c=o[l];delete c.metadata,a.push(c)}return a}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}_e.DEFAULT_UP=new N(0,1,0);_e.DEFAULT_MATRIX_AUTO_UPDATE=!0;_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class hs extends _e{constructor(){super();this.isGroup=!0,this.type="Group"}}var kp={type:"move"};class nr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new hs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new hs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new hs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(t){if(this._targetRay!==null)this._targetRay.dispatchEvent(t);if(this._grip!==null)this._grip.dispatchEvent(t);if(this._hand!==null)this._hand.dispatchEvent(t);return this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){if(this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(t,e,n){let i=null,s=null,r=null,o=this._targetRay,a=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){r=!0;for(let _ of t.hand.values()){let S=e.getJointPose(_,n),p=this._getHandJoint(l,_);if(S!==null)p.matrix.fromArray(S.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=S.radius;p.visible=S!==null}let c=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=c.position.distanceTo(u.position),h=0.02,d=0.005;if(l.inputState.pinching&&f>h+d)l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this});else if(!l.inputState.pinching&&f<=h-d)l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this})}else if(a!==null&&t.gripSpace){if(s=e.getPose(t.gripSpace,n),s!==null){if(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity)a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity);else a.hasLinearVelocity=!1;if(s.angularVelocity)a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity);else a.hasAngularVelocity=!1;if(a.eventsEnabled)a.dispatchEvent({type:"gripUpdated",data:t,target:this})}}if(o!==null){if(i=e.getPose(t.targetRaySpace,n),i===null&&s!==null)i=s;if(i!==null){if(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity)o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity);else o.hasLinearVelocity=!1;if(i.angularVelocity)o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity);else o.hasAngularVelocity=!1;this.dispatchEvent(kp)}}}if(o!==null)o.visible=i!==null;if(a!==null)a.visible=s!==null;if(l!==null)l.visible=r!==null;return this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new hs;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}var qu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},si={h:0,s:0,l:0},Ir={h:0,s:0,l:0};function da(t,e,n){if(n<0)n+=1;if(n>1)n-=1;if(n<0.16666666666666666)return t+(e-t)*6*n;if(n<0.5)return e;if(n<0.6666666666666666)return t+(e-t)*6*(0.6666666666666666-n);return t}class Dt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;if(i&&i.isColor)this.copy(i);else if(typeof i==="number")this.setHex(i);else if(typeof i==="string")this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e="srgb"){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Vt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=Vt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Vt.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=Vt.workingColorSpace){if(t=Gl(t,1),e=Ut(e,0,1),n=Ut(n,0,1),e===0)this.r=this.g=this.b=n;else{let s=n<=0.5?n*(1+e):n+e-n*e,r=2*n-s;this.r=da(r,s,t+0.3333333333333333),this.g=da(r,s,t),this.b=da(r,s,t-0.3333333333333333)}return Vt.colorSpaceToWorking(this,i),this}setStyle(t,e="srgb"){function n(s){if(s===void 0)return;if(parseFloat(s)<1)At("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,r=i[1],o=i[2];switch(r){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setRGB(Math.min(100,parseFloat(s[1]))/100,Math.min(100,parseFloat(s[2]))/100,Math.min(100,parseFloat(s[3]))/100,e);break;case"hsl":case"hsla":if(s=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:At("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=i[1],r=s.length;if(r===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);else if(r===6)return this.setHex(parseInt(s,16),e);else At("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e="srgb"){let n=qu[t.toLowerCase()];if(n!==void 0)this.setHex(n,e);else At("Color: Unknown color "+t);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Zn(t.r),this.g=Zn(t.g),this.b=Zn(t.b),this}copyLinearToSRGB(t){return this.r=us(t.r),this.g=us(t.g),this.b=us(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t="srgb"){return Vt.workingToColorSpace(Xe.copy(this),t),Math.round(Ut(Xe.r*255,0,255))*65536+Math.round(Ut(Xe.g*255,0,255))*256+Math.round(Ut(Xe.b*255,0,255))}getHexString(t="srgb"){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Vt.workingColorSpace){Vt.workingToColorSpace(Xe.copy(this),e);let{r:n,g:i,b:s}=Xe,r=Math.max(n,i,s),o=Math.min(n,i,s),a,l,c=(o+r)/2;if(o===r)a=0,l=0;else{let u=r-o;switch(l=c<=0.5?u/(r+o):u/(2-r-o),r){case n:a=(i-s)/u+(i<s?6:0);break;case i:a=(s-n)/u+2;break;case s:a=(n-i)/u+4;break}a/=6}return t.h=a,t.s=l,t.l=c,t}getRGB(t,e=Vt.workingColorSpace){return Vt.workingToColorSpace(Xe.copy(this),e),t.r=Xe.r,t.g=Xe.g,t.b=Xe.b,t}getStyle(t="srgb"){Vt.workingToColorSpace(Xe.copy(this),t);let{r:e,g:n,b:i}=Xe;if(t!=="srgb")return`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`;return`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(si),this.setHSL(si.h+t,si.s+e,si.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(si),t.getHSL(Ir);let n=Ys(si.h,Ir.h,e),i=Ys(si.s,Ir.s,e),s=Ys(si.l,Ir.l,e);return this.setHSL(n,i,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*i,this.g=s[1]*e+s[4]*n+s[7]*i,this.b=s[2]*e+s[5]*n+s[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var Xe=new Dt;Dt.NAMES=qu;class Yl{constructor(t,e=0.00025){this.isFogExp2=!0,this.name="",this.color=new Dt(t),this.density=e}clone(){return new Yl(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Yu extends _e{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Tn,this.environmentIntensity=1,this.environmentRotation=new Tn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);if(this.fog!==null)e.object.fog=this.fog.toJSON();return e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}}var Mn=new N,Vn=new N,pa=new N,Wn=new N,Qi=new N,ji=new N,dh=new N,ma=new N,ga=new N,_a=new N,xa=new oe,ya=new oe,va=new oe;class Te{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),Mn.subVectors(t,e),i.cross(Mn);let s=i.lengthSq();if(s>0)return i.multiplyScalar(1/Math.sqrt(s));return i.set(0,0,0)}static getBarycoord(t,e,n,i,s){Mn.subVectors(i,e),Vn.subVectors(n,e),pa.subVectors(t,e);let r=Mn.dot(Mn),o=Mn.dot(Vn),a=Mn.dot(pa),l=Vn.dot(Vn),c=Vn.dot(pa),u=r*l-o*o;if(u===0)return s.set(0,0,0),null;let f=1/u,h=(l*a-o*c)*f,d=(r*c-o*a)*f;return s.set(1-h-d,d,h)}static containsPoint(t,e,n,i){if(this.getBarycoord(t,e,n,i,Wn)===null)return!1;return Wn.x>=0&&Wn.y>=0&&Wn.x+Wn.y<=1}static getInterpolation(t,e,n,i,s,r,o,a){if(this.getBarycoord(t,e,n,i,Wn)===null){if(a.x=0,a.y=0,"z"in a)a.z=0;if("w"in a)a.w=0;return null}return a.setScalar(0),a.addScaledVector(s,Wn.x),a.addScaledVector(r,Wn.y),a.addScaledVector(o,Wn.z),a}static getInterpolatedAttribute(t,e,n,i,s,r){return xa.setScalar(0),ya.setScalar(0),va.setScalar(0),xa.fromBufferAttribute(t,e),ya.fromBufferAttribute(t,n),va.fromBufferAttribute(t,i),r.setScalar(0),r.addScaledVector(xa,s.x),r.addScaledVector(ya,s.y),r.addScaledVector(va,s.z),r}static isFrontFacing(t,e,n,i){return Mn.subVectors(n,e),Vn.subVectors(t,e),Mn.cross(Vn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Mn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),Mn.cross(Vn).length()*0.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(t){return Te.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Te.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,s){return Te.getInterpolation(t,this.a,this.b,this.c,e,n,i,s)}containsPoint(t){return Te.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Te.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,s=this.c,r,o;Qi.subVectors(i,n),ji.subVectors(s,n),ma.subVectors(t,n);let a=Qi.dot(ma),l=ji.dot(ma);if(a<=0&&l<=0)return e.copy(n);ga.subVectors(t,i);let c=Qi.dot(ga),u=ji.dot(ga);if(c>=0&&u<=c)return e.copy(i);let f=a*u-c*l;if(f<=0&&a>=0&&c<=0&&a-c>0)return r=a/(a-c),e.copy(n).addScaledVector(Qi,r);_a.subVectors(t,s);let h=Qi.dot(_a),d=ji.dot(_a);if(d>=0&&h<=d)return e.copy(s);let _=h*l-a*d;if(_<=0&&l>=0&&d<=0)return o=l/(l-d),e.copy(n).addScaledVector(ji,o);let S=c*d-h*u;if(S<=0&&u-c>=0&&h-d>=0)return dh.subVectors(s,i),o=(u-c)/(u-c+(h-d)),e.copy(i).addScaledVector(dh,o);let p=1/(S+_+f);return r=_*p,o=f*p,e.copy(n).addScaledVector(Qi,r).addScaledVector(ji,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class te{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(bn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(bn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=bn.copy(e).multiplyScalar(0.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let r=0,o=s.count;r<o;r++){if(t.isMesh===!0)t.getVertexPosition(r,bn);else bn.fromBufferAttribute(s,r);bn.applyMatrix4(t.matrixWorld),this.expandByPoint(bn)}else{if(t.boundingBox!==void 0){if(t.boundingBox===null)t.computeBoundingBox();Pr.copy(t.boundingBox)}else{if(n.boundingBox===null)n.computeBoundingBox();Pr.copy(n.boundingBox)}Pr.applyMatrix4(t.matrixWorld),this.union(Pr)}}let i=t.children;for(let s=0,r=i.length;s<r;s++)this.expandByObject(i[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,bn),bn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;if(t.normal.x>0)e=t.normal.x*this.min.x,n=t.normal.x*this.max.x;else e=t.normal.x*this.max.x,n=t.normal.x*this.min.x;if(t.normal.y>0)e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y;else e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y;if(t.normal.z>0)e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z;else e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z;return e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Bs),Lr.subVectors(this.max,Bs),ts.subVectors(t.a,Bs),es.subVectors(t.b,Bs),ns.subVectors(t.c,Bs),ri.subVectors(es,ts),oi.subVectors(ns,es),Ei.subVectors(ts,ns);let e=[0,-ri.z,ri.y,0,-oi.z,oi.y,0,-Ei.z,Ei.y,ri.z,0,-ri.x,oi.z,0,-oi.x,Ei.z,0,-Ei.x,-ri.y,ri.x,0,-oi.y,oi.x,0,-Ei.y,Ei.x,0];if(!Sa(e,ts,es,ns,Lr))return!1;if(e=[1,0,0,0,1,0,0,0,1],!Sa(e,ts,es,ns,Lr))return!1;return Nr.crossVectors(ri,oi),e=[Nr.x,Nr.y,Nr.z],Sa(e,ts,es,ns,Lr)}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,bn).distanceTo(t)}getBoundingSphere(t){if(this.isEmpty())t.makeEmpty();else this.getCenter(t.center),t.radius=this.getSize(bn).length()*0.5;return t}intersect(t){if(this.min.max(t.min),this.max.min(t.max),this.isEmpty())this.makeEmpty();return this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){if(this.isEmpty())return this;return Xn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Xn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Xn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Xn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Xn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Xn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Xn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Xn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Xn),this}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}var Xn=[new N,new N,new N,new N,new N,new N,new N,new N],bn=new N,Pr=new te,ts=new N,es=new N,ns=new N,ri=new N,oi=new N,Ei=new N,Bs=new N,Lr=new N,Nr=new N,wi=new N;function Sa(t,e,n,i,s){for(let r=0,o=t.length-3;r<=o;r+=3){wi.fromArray(t,r);let a=s.x*Math.abs(wi.x)+s.y*Math.abs(wi.y)+s.z*Math.abs(wi.z),l=e.dot(wi),c=n.dot(wi),u=i.dot(wi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var be=new N,Dr=new Lt,Hp=0;class Ae extends Dn{constructor(t,e,n=!1){super();if(Array.isArray(t))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Hp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=t!==void 0?go(t):void 0}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,s=this.itemSize;i<s;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Dr.fromBufferAttribute(this,e),Dr.applyMatrix3(t),this.setXY(e,Dr.x,Dr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyMatrix3(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyMatrix4(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyNormalMatrix(t),this.setXYZ(e,be.x,be.y,be.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.transformDirection(t),this.setXYZ(e,be.x,be.y,be.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];if(this.normalized)n=this._denormalize(n);return n}setComponent(t,e,n){if(this.normalized)n=this._normalize(n);return this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];if(this.normalized)e=this._denormalize(e);return e}setX(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];if(this.normalized)e=this._denormalize(e);return e}setY(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];if(this.normalized)e=this._denormalize(e);return e}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];if(this.normalized)e=this._denormalize(e);return e}setW(t,e){if(this.normalized)e=this._normalize(e);return this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){if(t*=this.itemSize,this.normalized)e=this._normalize(e),n=this._normalize(n);return this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){if(t*=this.itemSize,this.normalized)e=this._normalize(e),n=this._normalize(n),i=this._normalize(i);return this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,s){if(t*=this.itemSize,this.normalized)e=this._normalize(e),n=this._normalize(n),i=this._normalize(i),s=this._normalize(s);return this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Hl(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Vl(t,this.array)}}class xo extends Ae{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class yo extends Ae{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class Ee extends Ae{constructor(t,e,n){super(new Float32Array(t),e,n)}}var Vp=new te,zs=new N,Ma=new N;class Re{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;if(e!==void 0)n.copy(e);else Vp.setFromPoints(t).getCenter(n);let i=0;for(let s=0,r=t.length;s<r;s++)i=Math.max(i,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);if(e.copy(t),n>this.radius*this.radius)e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center);return e}getBoundingBox(t){if(this.isEmpty())return t.makeEmpty(),t;return t.set(this.center,this.center),t.expandByScalar(this.radius),t}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;zs.subVectors(t,this.center);let e=zs.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*0.5;this.center.addScaledVector(zs,i/n),this.radius+=i}return this}union(t){if(t.isEmpty())return this;if(this.isEmpty())return this.copy(t),this;if(this.center.equals(t.center)===!0)this.radius=Math.max(this.radius,t.radius);else Ma.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(zs.copy(t.center).add(Ma)),this.expandByPoint(zs.copy(t.center).sub(Ma));return this}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}var Wp=0,dn=new wt,ba=new _e,is=new N,hn=new te,Gs=new te,De=new N;class Be extends Dn{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=Un(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){if(Array.isArray(t))this.index=new((pp(t))?yo:xo)(t,1);else this.index=t;return this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;if(e!==void 0)e.applyMatrix4(t),e.needsUpdate=!0;let n=this.attributes.normal;if(n!==void 0){let s=new Ft().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}let i=this.attributes.tangent;if(i!==void 0)i.transformDirection(t),i.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(t){return dn.makeRotationFromQuaternion(t),this.applyMatrix4(dn),this}rotateX(t){return dn.makeRotationX(t),this.applyMatrix4(dn),this}rotateY(t){return dn.makeRotationY(t),this.applyMatrix4(dn),this}rotateZ(t){return dn.makeRotationZ(t),this.applyMatrix4(dn),this}translate(t,e,n){return dn.makeTranslation(t,e,n),this.applyMatrix4(dn),this}scale(t,e,n){return dn.makeScale(t,e,n),this.applyMatrix4(dn),this}lookAt(t){return ba.lookAt(t),ba.updateMatrix(),this.applyMatrix4(ba.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(is).negate(),this.translate(is.x,is.y,is.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,s=t.length;i<s;i++){let r=t[i];n.push(r.x,r.y,r.z||0)}this.setAttribute("position",new Ee(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let s=t[i];e.setXYZ(i,s.x,s.y,s.z||0)}if(t.length>e.count)At("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");e.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new te;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let s=e[n];if(hn.setFromBufferAttribute(s),this.morphTargetsRelative)De.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(De);else this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Nt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Re;let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(hn.setFromBufferAttribute(t),e)for(let s=0,r=e.length;s<r;s++){let o=e[s];if(Gs.setFromBufferAttribute(o),this.morphTargetsRelative)De.addVectors(hn.min,Gs.min),hn.expandByPoint(De),De.addVectors(hn.max,Gs.max),hn.expandByPoint(De);else hn.expandByPoint(Gs.min),hn.expandByPoint(Gs.max)}hn.getCenter(n);let i=0;for(let s=0,r=t.count;s<r;s++)De.fromBufferAttribute(t,s),i=Math.max(i,n.distanceToSquared(De));if(e)for(let s=0,r=e.length;s<r;s++){let o=e[s],a=this.morphTargetsRelative;for(let l=0,c=o.count;l<c;l++){if(De.fromBufferAttribute(o,l),a)is.fromBufferAttribute(t,l),De.add(is);i=Math.max(i,n.distanceToSquared(De))}}if(this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius))Nt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Nt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:n,normal:i,uv:s}=e,r=this.getAttribute("tangent");if(r===void 0||r.count!==n.count)r=new Ae(new Float32Array(4*n.count),4),this.setAttribute("tangent",r);let o=[],a=[],l=new Uint8Array(n.count);for(let v=0;v<n.count;v++)o[v]=new N,a[v]=new N;let c=new N,u=new N,f=new N,h=new Lt,d=new Lt,_=new Lt,S=new N,p=new N;function g(v,w,P){l[v]=l[w]=l[P]=1,c.fromBufferAttribute(n,v),u.fromBufferAttribute(n,w),f.fromBufferAttribute(n,P),h.fromBufferAttribute(s,v),d.fromBufferAttribute(s,w),_.fromBufferAttribute(s,P),u.sub(c),f.sub(c),d.sub(h),_.sub(h);let R=1/(d.x*_.y-_.x*d.y);if(!isFinite(R))return;S.copy(u).multiplyScalar(_.y).addScaledVector(f,-d.y).multiplyScalar(R),p.copy(f).multiplyScalar(d.x).addScaledVector(u,-_.x).multiplyScalar(R),o[v].add(S),o[w].add(S),o[P].add(S),a[v].add(p),a[w].add(p),a[P].add(p)}let x=this.groups;if(x.length===0)x=[{start:0,count:t.count}];for(let v=0,w=x.length;v<w;++v){let P=x[v],R=P.start,L=P.count;for(let F=R,C=R+L;F<C;F+=3)g(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let M=new N,y=new N,b=new N,E=new N;function m(v){b.fromBufferAttribute(i,v),E.copy(b);let w=o[v];M.copy(w),M.sub(b.multiplyScalar(b.dot(w))).normalize(),y.crossVectors(E,w);let R=y.dot(a[v])<0?-1:1;r.setXYZW(v,M.x,M.y,M.z,R)}for(let v=0,w=n.count;v<w;++v)if(l[v])m(v);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Ae(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,h=n.count;f<h;f++)n.setXYZ(f,0,0,0);let i=new N,s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,u=new N;if(t)for(let f=0,h=t.count;f<h;f+=3){let d=t.getX(f+0),_=t.getX(f+1),S=t.getX(f+2);i.fromBufferAttribute(e,d),s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,S),c.subVectors(r,s),u.subVectors(i,s),c.cross(u),o.fromBufferAttribute(n,d),a.fromBufferAttribute(n,_),l.fromBufferAttribute(n,S),o.add(c),a.add(c),l.add(c),n.setXYZ(d,o.x,o.y,o.z),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(S,l.x,l.y,l.z)}else for(let f=0,h=e.count;f<h;f+=3)i.fromBufferAttribute(e,f+0),s.fromBufferAttribute(e,f+1),r.fromBufferAttribute(e,f+2),c.subVectors(r,s),u.subVectors(i,s),c.cross(u),n.setXYZ(f+0,c.x,c.y,c.z),n.setXYZ(f+1,c.x,c.y,c.z),n.setXYZ(f+2,c.x,c.y,c.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(o,a){let{array:l,itemSize:c,normalized:u}=o,f=new l.constructor(a.length*c),h=0,d=0;for(let _=0,S=a.length;_<S;_++){if(o.isInterleavedBufferAttribute)h=a[_]*o.data.stride+o.offset;else h=a[_]*c;for(let p=0;p<c;p++)f[d++]=l[h++]}return new Ae(f,c,u)}if(this.index===null)return At("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new Be,n=this.index.array,i=this.attributes;for(let o in i){let a=i[o],l=t(a,n);e.setAttribute(o,l)}let s=this.morphAttributes;for(let o in s){let a=[],l=s[o];for(let c=0,u=l.length;c<u;c++){let f=l[c],h=t(f,n);a.push(h)}e.morphAttributes[o]=a}e.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;for(let o=0,a=r.length;o<a;o++){let l=r[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0)t.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let a=this.parameters;for(let l in a)if(a[l]!==void 0)t[l]=a[l];return t}t.data={attributes:{}};let e=this.index;if(e!==null)t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)};let n=this.attributes;for(let a in n){let l=n[a];t.data.attributes[a]=l.toJSON(t.data)}let i={},s=!1;for(let a in this.morphAttributes){let l=this.morphAttributes[a],c=[];for(let u=0,f=l.length;u<f;u++){let h=l[u];c.push(h.toJSON(t.data))}if(c.length>0)i[a]=c,s=!0}if(s)t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative;let r=this.groups;if(r.length>0)t.data.groups=JSON.parse(JSON.stringify(r));let o=this.boundingSphere;if(o!==null)t.data.boundingSphere=o.toJSON();return t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;if(n!==null)this.setIndex(n.clone());let i=t.attributes;for(let l in i){let c=i[l];this.setAttribute(l,c.clone(e))}let s=t.morphAttributes;for(let l in s){let c=[],u=s[l];for(let f=0,h=u.length;f<h;f++)c.push(u[f].clone(e));this.morphAttributes[l]=c}this.morphTargetsRelative=t.morphTargetsRelative;let r=t.groups;for(let l=0,c=r.length;l<c;l++){let u=r[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;if(o!==null)this.boundingBox=o.clone();let a=t.boundingSphere;if(a!==null)this.boundingSphere=a.clone();return this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class vo{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Un()}onUploadCallback(){}set needsUpdate(t){if(t===!0)this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,s=this.stride;i<s;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=ph(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=this.array.slice(0).buffer;let n=new this.array.constructor(t.arrayBuffers[e]),i=new this.constructor(n,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){if(t.arrayBuffers===void 0)t.arrayBuffers={};let e=ph(this.array);if(t.arrayBuffers[e]===void 0)t.arrayBuffers[e]=Array.from(new Uint32Array(this.array.slice(0).buffer));let n={uuid:this.uuid,buffer:e,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}}function ph(t){if(t.buffer._uuid===void 0)t.buffer._uuid=Un();if(t.byteOffset===0&&t.byteLength===t.buffer.byteLength)return t.buffer._uuid;return t.buffer._uuid+":"+t.byteOffset+":"+t.byteLength}var Qe=new N;class Bi{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i,this._normalizationScale=t!==void 0?go(t.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Qe.fromBufferAttribute(this,e),Qe.applyMatrix4(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Qe.fromBufferAttribute(this,e),Qe.applyNormalMatrix(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Qe.fromBufferAttribute(this,e),Qe.transformDirection(t),this.setXYZ(e,Qe.x,Qe.y,Qe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];if(this.normalized)n=this._denormalize(n);return n}setComponent(t,e,n){if(this.normalized)n=this._normalize(n);return this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){if(this.normalized)e=this._normalize(e);return this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];if(this.normalized)e=this._denormalize(e);return e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];if(this.normalized)e=this._denormalize(e);return e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];if(this.normalized)e=this._denormalize(e);return e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];if(this.normalized)e=this._denormalize(e);return e}setXY(t,e,n){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),n=this._normalize(n);return this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),n=this._normalize(n),i=this._normalize(i);return this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,s){if(t=t*this.data.stride+this.offset,this.normalized)e=this._normalize(e),n=this._normalize(n),i=this._normalize(i),s=this._normalize(s);return this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=s,this}clone(t){if(t===void 0){Zs("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return new Ae(new this.array.constructor(e),this.itemSize,this.normalized)}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.clone(t);return new Bi(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(t){if(t===void 0){Zs("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let i=n*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)e.push(this.data.array[i+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else{if(t.interleavedBuffers===void 0)t.interleavedBuffers={};if(t.interleavedBuffers[this.data.uuid]===void 0)t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):Hl(t,this.data.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):Vl(t,this.data.array)}}var Ta=new N,Xp=new N,qp=new Ft;class rn{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=Ta.subVectors(n,e).cross(Xp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(Ta),s=this.normal.dot(i);if(s===0){if(this.distanceToPoint(t.start)===0)return e.copy(t.start);return null}let r=-(t.start.dot(this.normal)+this.constant)/s;if(n===!0&&(r<0||r>1))return null;return e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||qp.getNormalMatrix(t),i=this.coplanarPoint(Ta).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}var Yp=0;class En extends Dn{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Yp++}),this.uuid=Un(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Dt(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){if(this._alphaTest>0!==t>0)this.version++;this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t===void 0)return;for(let e in t){let n=t[e];if(n===void 0){At(`Material: parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){At(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}if(i&&i.isColor)i.set(n);else if(i&&i.isVector2&&(n&&n.isVector2)||i&&i.isEuler&&(n&&n.isEuler)||i&&i.isVector3&&(n&&n.isVector3))i.copy(n);else this[e]=n}}toJSON(t){let e=t===void 0||typeof t==="string";if(e)t={textures:{},images:{}};let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor)n.color=this.color.getHex();if(this.roughness!==void 0)n.roughness=this.roughness;if(this.metalness!==void 0)n.metalness=this.metalness;if(this.sheen!==void 0)n.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)n.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)n.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)n.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)n.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)n.specular=this.specular.getHex();if(this.specularIntensity!==void 0)n.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)n.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)n.shininess=this.shininess;if(this.clearcoat!==void 0)n.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)n.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)n.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid;if(this.dispersion!==void 0)n.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)n.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)n.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)n.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid;if(this.anisotropy!==void 0)n.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)n.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid;if(this.map&&this.map.isTexture)n.map=this.map.toJSON(t).uuid;if(this.matcap&&this.matcap.isTexture)n.matcap=this.matcap.toJSON(t).uuid;if(this.alphaMap&&this.alphaMap.isTexture)n.alphaMap=this.alphaMap.toJSON(t).uuid;if(this.lightMap&&this.lightMap.isTexture)n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)n.roughnessMap=this.roughnessMap.toJSON(t).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)n.metalnessMap=this.metalnessMap.toJSON(t).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)n.emissiveMap=this.emissiveMap.toJSON(t).uuid;if(this.specularMap&&this.specularMap.isTexture)n.specularMap=this.specularMap.toJSON(t).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)n.specularColorMap=this.specularColorMap.toJSON(t).uuid;if(this.envMap&&this.envMap.isTexture){if(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0)n.combine=this.combine}if(this.envMapRotation!==void 0)n.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)n.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)n.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)n.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)n.gradientMap=this.gradientMap.toJSON(t).uuid;if(this.transmission!==void 0)n.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)n.transmissionMap=this.transmissionMap.toJSON(t).uuid;if(this.thickness!==void 0)n.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)n.thicknessMap=this.thicknessMap.toJSON(t).uuid;if(this.attenuationDistance!==void 0)n.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)n.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)n.size=this.size;if(this.sizeAttenuation!==void 0)n.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)n.clippingPlanes=this.clippingPlanes.map((s)=>s.toJSON());if(this.rotation!==void 0)n.rotation=this.rotation;if(this.depthPacking!==void 0)n.depthPacking=this.depthPacking;if(this.linewidth!==void 0)n.linewidth=this.linewidth;if(this.linecap!==void 0)n.linecap=this.linecap;if(this.linejoin!==void 0)n.linejoin=this.linejoin;if(this.dashSize!==void 0)n.dashSize=this.dashSize;if(this.gapSize!==void 0)n.gapSize=this.gapSize;if(this.scale!==void 0)n.scale=this.scale;if(this.wireframe!==void 0)n.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)n.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)n.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)n.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)n.flatShading=this.flatShading;if(this.fog!==void 0)n.fog=this.fog;if(Object.keys(this.userData).length>0)n.userData=this.userData;function i(s){let r=[];for(let o in s){let a=s[o];delete a.metadata,r.push(a)}return r}if(e){let s=i(t.textures),r=i(t.images);if(s.length>0)n.textures=s;if(r.length>0)n.images=r}return n}fromJSON(t,e){if(t.uuid!==void 0)this.uuid=t.uuid;if(t.name!==void 0)this.name=t.name;if(t.color!==void 0&&this.color!==void 0)this.color.setHex(t.color);if(t.roughness!==void 0)this.roughness=t.roughness;if(t.metalness!==void 0)this.metalness=t.metalness;if(t.sheen!==void 0)this.sheen=t.sheen;if(t.sheenColor!==void 0)this.sheenColor=new Dt().setHex(t.sheenColor);if(t.sheenRoughness!==void 0)this.sheenRoughness=t.sheenRoughness;if(t.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(t.emissive);if(t.specular!==void 0&&this.specular!==void 0)this.specular.setHex(t.specular);if(t.specularIntensity!==void 0)this.specularIntensity=t.specularIntensity;if(t.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(t.specularColor);if(t.shininess!==void 0)this.shininess=t.shininess;if(t.clearcoat!==void 0)this.clearcoat=t.clearcoat;if(t.clearcoatRoughness!==void 0)this.clearcoatRoughness=t.clearcoatRoughness;if(t.diffuseRoughness!==void 0)this.diffuseRoughness=t.diffuseRoughness;if(t.dispersion!==void 0)this.dispersion=t.dispersion;if(t.retroreflectivity!==void 0)this.retroreflectivity=t.retroreflectivity;if(t.iridescence!==void 0)this.iridescence=t.iridescence;if(t.iridescenceIOR!==void 0)this.iridescenceIOR=t.iridescenceIOR;if(t.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum;if(t.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum;if(t.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1];if(t.transmission!==void 0)this.transmission=t.transmission;if(t.thickness!==void 0)this.thickness=t.thickness;if(t.attenuationDistance!==void 0)this.attenuationDistance=t.attenuationDistance;if(t.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(t.attenuationColor);if(t.anisotropy!==void 0)this.anisotropy=t.anisotropy;if(t.anisotropyRotation!==void 0)this.anisotropyRotation=t.anisotropyRotation;if(t.fog!==void 0)this.fog=t.fog;if(t.flatShading!==void 0)this.flatShading=t.flatShading;if(t.blending!==void 0)this.blending=t.blending;if(t.combine!==void 0)this.combine=t.combine;if(t.side!==void 0)this.side=t.side;if(t.shadowSide!==void 0)this.shadowSide=t.shadowSide;if(t.opacity!==void 0)this.opacity=t.opacity;if(t.transparent!==void 0)this.transparent=t.transparent;if(t.alphaTest!==void 0)this.alphaTest=t.alphaTest;if(t.alphaHash!==void 0)this.alphaHash=t.alphaHash;if(t.depthFunc!==void 0)this.depthFunc=t.depthFunc;if(t.depthTest!==void 0)this.depthTest=t.depthTest;if(t.depthWrite!==void 0)this.depthWrite=t.depthWrite;if(t.colorWrite!==void 0)this.colorWrite=t.colorWrite;if(t.clippingPlanes!==void 0)this.clippingPlanes=t.clippingPlanes.map((n)=>new rn().fromJSON(n));if(t.clipIntersection!==void 0)this.clipIntersection=t.clipIntersection;if(t.clipShadows!==void 0)this.clipShadows=t.clipShadows;if(t.depthPacking!==void 0)this.depthPacking=t.depthPacking;if(t.blendSrc!==void 0)this.blendSrc=t.blendSrc;if(t.blendDst!==void 0)this.blendDst=t.blendDst;if(t.blendEquation!==void 0)this.blendEquation=t.blendEquation;if(t.blendSrcAlpha!==void 0)this.blendSrcAlpha=t.blendSrcAlpha;if(t.blendDstAlpha!==void 0)this.blendDstAlpha=t.blendDstAlpha;if(t.blendEquationAlpha!==void 0)this.blendEquationAlpha=t.blendEquationAlpha;if(t.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(t.blendColor);if(t.blendAlpha!==void 0)this.blendAlpha=t.blendAlpha;if(t.stencilWriteMask!==void 0)this.stencilWriteMask=t.stencilWriteMask;if(t.stencilFunc!==void 0)this.stencilFunc=t.stencilFunc;if(t.stencilRef!==void 0)this.stencilRef=t.stencilRef;if(t.stencilFuncMask!==void 0)this.stencilFuncMask=t.stencilFuncMask;if(t.stencilFail!==void 0)this.stencilFail=t.stencilFail;if(t.stencilZFail!==void 0)this.stencilZFail=t.stencilZFail;if(t.stencilZPass!==void 0)this.stencilZPass=t.stencilZPass;if(t.stencilWrite!==void 0)this.stencilWrite=t.stencilWrite;if(t.wireframe!==void 0)this.wireframe=t.wireframe;if(t.wireframeLinewidth!==void 0)this.wireframeLinewidth=t.wireframeLinewidth;if(t.wireframeLinecap!==void 0)this.wireframeLinecap=t.wireframeLinecap;if(t.wireframeLinejoin!==void 0)this.wireframeLinejoin=t.wireframeLinejoin;if(t.rotation!==void 0)this.rotation=t.rotation;if(t.linewidth!==void 0)this.linewidth=t.linewidth;if(t.linecap!==void 0)this.linecap=t.linecap;if(t.linejoin!==void 0)this.linejoin=t.linejoin;if(t.dashSize!==void 0)this.dashSize=t.dashSize;if(t.gapSize!==void 0)this.gapSize=t.gapSize;if(t.scale!==void 0)this.scale=t.scale;if(t.polygonOffset!==void 0)this.polygonOffset=t.polygonOffset;if(t.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=t.polygonOffsetFactor;if(t.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=t.polygonOffsetUnits;if(t.dithering!==void 0)this.dithering=t.dithering;if(t.alphaToCoverage!==void 0)this.alphaToCoverage=t.alphaToCoverage;if(t.premultipliedAlpha!==void 0)this.premultipliedAlpha=t.premultipliedAlpha;if(t.forceSinglePass!==void 0)this.forceSinglePass=t.forceSinglePass;if(t.allowOverride!==void 0)this.allowOverride=t.allowOverride;if(t.visible!==void 0)this.visible=t.visible;if(t.toneMapped!==void 0)this.toneMapped=t.toneMapped;if(t.userData!==void 0)this.userData=t.userData;if(t.vertexColors!==void 0)if(typeof t.vertexColors==="number")this.vertexColors=t.vertexColors>0;else this.vertexColors=t.vertexColors;if(t.size!==void 0)this.size=t.size;if(t.sizeAttenuation!==void 0)this.sizeAttenuation=t.sizeAttenuation;if(t.map!==void 0)this.map=e[t.map]||null;if(t.matcap!==void 0)this.matcap=e[t.matcap]||null;if(t.alphaMap!==void 0)this.alphaMap=e[t.alphaMap]||null;if(t.bumpMap!==void 0)this.bumpMap=e[t.bumpMap]||null;if(t.bumpScale!==void 0)this.bumpScale=t.bumpScale;if(t.normalMap!==void 0)this.normalMap=e[t.normalMap]||null;if(t.normalMapType!==void 0)this.normalMapType=t.normalMapType;if(t.normalScale!==void 0){let n=t.normalScale;if(Array.isArray(n)===!1)n=[n,n];this.normalScale=new Lt().fromArray(n)}if(t.displacementMap!==void 0)this.displacementMap=e[t.displacementMap]||null;if(t.displacementScale!==void 0)this.displacementScale=t.displacementScale;if(t.displacementBias!==void 0)this.displacementBias=t.displacementBias;if(t.roughnessMap!==void 0)this.roughnessMap=e[t.roughnessMap]||null;if(t.metalnessMap!==void 0)this.metalnessMap=e[t.metalnessMap]||null;if(t.emissiveMap!==void 0)this.emissiveMap=e[t.emissiveMap]||null;if(t.emissiveIntensity!==void 0)this.emissiveIntensity=t.emissiveIntensity;if(t.specularMap!==void 0)this.specularMap=e[t.specularMap]||null;if(t.specularIntensityMap!==void 0)this.specularIntensityMap=e[t.specularIntensityMap]||null;if(t.specularColorMap!==void 0)this.specularColorMap=e[t.specularColorMap]||null;if(t.envMap!==void 0)this.envMap=e[t.envMap]||null;if(t.envMapRotation!==void 0)this.envMapRotation.fromArray(t.envMapRotation);if(t.envMapIntensity!==void 0)this.envMapIntensity=t.envMapIntensity;if(t.reflectivity!==void 0)this.reflectivity=t.reflectivity;if(t.refractionRatio!==void 0)this.refractionRatio=t.refractionRatio;if(t.lightMap!==void 0)this.lightMap=e[t.lightMap]||null;if(t.lightMapIntensity!==void 0)this.lightMapIntensity=t.lightMapIntensity;if(t.aoMap!==void 0)this.aoMap=e[t.aoMap]||null;if(t.aoMapIntensity!==void 0)this.aoMapIntensity=t.aoMapIntensity;if(t.gradientMap!==void 0)this.gradientMap=e[t.gradientMap]||null;if(t.clearcoatMap!==void 0)this.clearcoatMap=e[t.clearcoatMap]||null;if(t.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null;if(t.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null;if(t.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Lt().fromArray(t.clearcoatNormalScale);if(t.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null;if(t.iridescenceMap!==void 0)this.iridescenceMap=e[t.iridescenceMap]||null;if(t.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null;if(t.transmissionMap!==void 0)this.transmissionMap=e[t.transmissionMap]||null;if(t.thicknessMap!==void 0)this.thicknessMap=e[t.thicknessMap]||null;if(t.anisotropyMap!==void 0)this.anisotropyMap=e[t.anisotropyMap]||null;if(t.sheenColorMap!==void 0)this.sheenColorMap=e[t.sheenColorMap]||null;if(t.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let i=e.length;n=Array(i);for(let s=0;s!==i;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){if(t===!0)this.version++}}var qn=new N,Aa=new N,Ur=new N,Fr=new N;class jn{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,qn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);if(n<0)return e.copy(this.origin);return e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=qn.subVectors(t,this.origin).dot(this.direction);if(e<0)return this.origin.distanceToSquared(t);return qn.copy(this.origin).addScaledVector(this.direction,e),qn.distanceToSquared(t)}distanceSqToSegment(t,e,n,i){Aa.copy(t).add(e).multiplyScalar(0.5),Ur.copy(e).sub(t).normalize(),Fr.copy(this.origin).sub(Aa);let s=t.distanceTo(e)*0.5,r=-this.direction.dot(Ur),o=Fr.dot(this.direction),a=-Fr.dot(Ur),l=Fr.lengthSq(),c=Math.abs(1-r*r),u,f,h,d;if(c>0)if(u=r*a-o,f=r*o-a,d=s*c,u>=0)if(f>=-d)if(f<=d){let _=1/c;u*=_,f*=_,h=u*(u+r*f+2*o)+f*(r*u+f+2*a)+l}else f=s,u=Math.max(0,-(r*f+o)),h=-u*u+f*(f+2*a)+l;else f=-s,u=Math.max(0,-(r*f+o)),h=-u*u+f*(f+2*a)+l;else if(f<=-d)u=Math.max(0,-(-r*s+o)),f=u>0?-s:Math.min(Math.max(-s,-a),s),h=-u*u+f*(f+2*a)+l;else if(f<=d)u=0,f=Math.min(Math.max(-s,-a),s),h=f*(f+2*a)+l;else u=Math.max(0,-(r*s+o)),f=u>0?s:Math.min(Math.max(-s,-a),s),h=-u*u+f*(f+2*a)+l;else f=r>0?-s:s,u=Math.max(0,-(r*f+o)),h=-u*u+f*(f+2*a)+l;if(n)n.copy(this.origin).addScaledVector(this.direction,u);if(i)i.copy(Aa).addScaledVector(Ur,f);return h}intersectSphere(t,e){if(t.radius<0)return null;qn.subVectors(t.center,this.origin);let n=qn.dot(this.direction),i=qn.dot(qn)-n*n,s=t.radius*t.radius;if(i>s)return null;let r=Math.sqrt(s-i),o=n-r,a=n+r;if(a<0)return null;if(o<0)return this.at(a,e);return this.at(o,e)}intersectsSphere(t){if(t.radius<0)return!1;return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0){if(t.distanceToPoint(this.origin)===0)return 0;return null}let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);if(n===null)return null;return this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);if(e===0)return!0;if(t.normal.dot(this.direction)*e<0)return!0;return!1}intersectBox(t,e){let n,i,s,r,o,a,l=1/this.direction.x,c=1/this.direction.y,u=1/this.direction.z,f=this.origin;if(l>=0)n=(t.min.x-f.x)*l,i=(t.max.x-f.x)*l;else n=(t.max.x-f.x)*l,i=(t.min.x-f.x)*l;if(c>=0)s=(t.min.y-f.y)*c,r=(t.max.y-f.y)*c;else s=(t.max.y-f.y)*c,r=(t.min.y-f.y)*c;if(n>r||s>i)return null;if(s>n||isNaN(n))n=s;if(r<i||isNaN(i))i=r;if(u>=0)o=(t.min.z-f.z)*u,a=(t.max.z-f.z)*u;else o=(t.max.z-f.z)*u,a=(t.min.z-f.z)*u;if(n>a||o>i)return null;if(o>n||n!==n)n=o;if(a<i||i!==i)i=a;if(i<0)return null;return this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,qn)!==null}intersectTriangle(t,e,n,i,s){let r=this.origin,o=this.direction,a=o.x,l=o.y,c=o.z,u=t.x-r.x,f=t.y-r.y,h=t.z-r.z,d=e.x-r.x,_=e.y-r.y,S=e.z-r.z,p=n.x-r.x,g=n.y-r.y,x=n.z-r.z,M=Math.abs(a),y=Math.abs(l),b=Math.abs(c),E,m,v,w,P,R,L,F,C,B,W,z;if(M>=y&&M>=b)if(v=a,R=u,C=d,z=p,a>=0)E=l,m=c,w=f,P=h,L=_,F=S,B=g,W=x;else E=c,m=l,w=h,P=f,L=S,F=_,B=x,W=g;else if(y>=b)if(v=l,R=f,C=_,z=g,l>=0)E=c,m=a,w=h,P=u,L=S,F=d,B=x,W=p;else E=a,m=c,w=u,P=h,L=d,F=S,B=p,W=x;else if(v=c,R=h,C=S,z=x,c>=0)E=a,m=l,w=u,P=f,L=d,F=_,B=p,W=g;else E=l,m=a,w=f,P=u,L=_,F=d,B=g,W=p;if(v===0)return null;let st=E/v,q=m/v,Q=1/v,et=w-st*R,xt=P-q*R,K=L-st*C,nt=F-q*C,_t=B-st*z,Rt=W-q*z,It=_t*nt-Rt*K,yt=et*Rt-xt*_t,$t=K*xt-nt*et;if(i){if(It<0||yt<0||$t<0)return null}else if((It<0||yt<0||$t<0)&&(It>0||yt>0||$t>0))return null;let kt=It+yt+$t;if(kt===0)return null;let zt=Q*(It*R+yt*C+$t*z);if(kt>0?zt<0:zt>0)return null;return this.at(zt/kt,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Zl extends En{constructor(t){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}var mh=new wt,Ri=new jn,Or=new Re,gh=new N,Br=new N,zr=new N,Gr=new N,Ea=new N,kr=new N,_h=new N,Hr=new N;class Ue extends _e{constructor(t=new Be,e=new Zl){super();this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}getVertexPosition(t,e){let n=this.geometry,i=n.attributes.position,s=n.morphAttributes.position,r=n.morphTargetsRelative;e.fromBufferAttribute(i,t);let o=this.morphTargetInfluences;if(s&&o){kr.set(0,0,0);for(let a=0,l=s.length;a<l;a++){let c=o[a],u=s[a];if(c===0)continue;if(Ea.fromBufferAttribute(u,t),r)kr.addScaledVector(Ea,c);else kr.addScaledVector(Ea.sub(e),c)}e.add(kr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.material,s=this.matrixWorld;if(i===void 0)return;if(n.boundingSphere===null)n.computeBoundingSphere();if(Or.copy(n.boundingSphere),Or.applyMatrix4(s),Ri.copy(t.ray).recast(t.near),Or.containsPoint(Ri.origin)===!1){if(Ri.intersectSphere(Or,gh)===null)return;if(Ri.origin.distanceToSquared(gh)>(t.far-t.near)**2)return}if(mh.copy(s).invert(),Ri.copy(t.ray).applyMatrix4(mh),n.boundingBox!==null){if(Ri.intersectsBox(n.boundingBox)===!1)return}this._computeIntersections(t,e,Ri)}_computeIntersections(t,e,n){let i,s=this.geometry,r=this.material,o=s.index,a=s.attributes.position,l=s.attributes.uv,c=s.attributes.uv1,u=s.attributes.normal,f=s.groups,h=s.drawRange;if(o!==null)if(Array.isArray(r))for(let d=0,_=f.length;d<_;d++){let S=f[d],p=r[S.materialIndex],g=Math.max(S.start,h.start),x=Math.min(o.count,Math.min(S.start+S.count,h.start+h.count));for(let M=g,y=x;M<y;M+=3){let b=o.getX(M),E=o.getX(M+1),m=o.getX(M+2);if(i=Vr(this,p,t,n,l,c,u,b,E,m),i)i.faceIndex=Math.floor(M/3),i.face.materialIndex=S.materialIndex,e.push(i)}}else{let d=Math.max(0,h.start),_=Math.min(o.count,h.start+h.count);for(let S=d,p=_;S<p;S+=3){let g=o.getX(S),x=o.getX(S+1),M=o.getX(S+2);if(i=Vr(this,r,t,n,l,c,u,g,x,M),i)i.faceIndex=Math.floor(S/3),e.push(i)}}else if(a!==void 0)if(Array.isArray(r))for(let d=0,_=f.length;d<_;d++){let S=f[d],p=r[S.materialIndex],g=Math.max(S.start,h.start),x=Math.min(a.count,Math.min(S.start+S.count,h.start+h.count));for(let M=g,y=x;M<y;M+=3){let b=M,E=M+1,m=M+2;if(i=Vr(this,p,t,n,l,c,u,b,E,m),i)i.faceIndex=Math.floor(M/3),i.face.materialIndex=S.materialIndex,e.push(i)}}else{let d=Math.max(0,h.start),_=Math.min(a.count,h.start+h.count);for(let S=d,p=_;S<p;S+=3){let g=S,x=S+1,M=S+2;if(i=Vr(this,r,t,n,l,c,u,g,x,M),i)i.faceIndex=Math.floor(S/3),e.push(i)}}}}function Zp(t,e,n,i,s,r,o,a){let l;if(e.side===1)l=i.intersectTriangle(o,r,s,!0,a);else l=i.intersectTriangle(s,r,o,e.side===0,a);if(l===null)return null;Hr.copy(a),Hr.applyMatrix4(t.matrixWorld);let c=n.ray.origin.distanceTo(Hr);if(c<n.near||c>n.far)return null;return{distance:c,point:Hr.clone(),object:t}}function Vr(t,e,n,i,s,r,o,a,l,c){t.getVertexPosition(a,Br),t.getVertexPosition(l,zr),t.getVertexPosition(c,Gr);let u=Zp(t,e,n,i,Br,zr,Gr,_h);if(u){let f=new N;if(Te.getBarycoord(_h,Br,zr,Gr,f),s)u.uv=Te.getInterpolatedAttribute(s,a,l,c,f,new Lt);if(r)u.uv1=Te.getInterpolatedAttribute(r,a,l,c,f,new Lt);if(o){if(u.normal=Te.getInterpolatedAttribute(o,a,l,c,f,new N),u.normal.dot(i.direction)>0)u.normal.multiplyScalar(-1)}let h={a,b:l,c,normal:new N,materialIndex:0};Te.getNormal(Br,zr,Gr,h.normal),u.face=h,u.barycoord=f}return u}var ks=new oe,xh=new oe,yh=new oe,Jp=new oe,vh=new wt,Wr=new N,wa=new Re,Sh=new wt,Ra=new jn;class Zu extends Ue{constructor(t,e){super(t,e);this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode="attached",this.bindMatrix=new wt,this.bindMatrixInverse=new wt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;if(this.boundingBox===null)this.boundingBox=new te;this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Wr),this.boundingBox.expandByPoint(Wr)}computeBoundingSphere(){let t=this.geometry;if(this.boundingSphere===null)this.boundingSphere=new Re;this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Wr),this.boundingSphere.expandByPoint(Wr)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}raycast(t,e){let n=this.material,i=this.matrixWorld;if(n===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(wa.copy(this.boundingSphere),wa.applyMatrix4(i),t.ray.intersectsSphere(wa)===!1)return;if(Sh.copy(i).invert(),Ra.copy(t.ray).applyMatrix4(Sh),this.boundingBox!==null){if(Ra.intersectsBox(this.boundingBox)===!1)return}this._computeIntersections(t,e,Ra)}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){if(this.skeleton=t,e===void 0)this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld;this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new oe,e=this.geometry.attributes.skinWeight;for(let n=0,i=e.count;n<i;n++){t.fromBufferAttribute(e,n);let s=1/t.manhattanLength();if(s!==1/0)t.multiplyScalar(s);else t.set(1,0,0,0);e.setXYZW(n,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.bindMode==="attached")this.bindMatrixInverse.copy(this.matrixWorld).invert();else if(this.bindMode==="detached")this.bindMatrixInverse.copy(this.bindMatrix).invert();else At("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let n=this.skeleton,i=this.geometry;if(xh.fromBufferAttribute(i.attributes.skinIndex,t),yh.fromBufferAttribute(i.attributes.skinWeight,t),e.isVector4)ks.copy(e),e.set(0,0,0,0);else ks.set(e.x,e.y,e.z,1),e.set(0,0,0);ks.applyMatrix4(this.bindMatrix);for(let s=0;s<4;s++){let r=yh.getComponent(s);if(r!==0){let o=xh.getComponent(s);vh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),e.addScaledVector(Jp.copy(ks).applyMatrix4(vh),r)}}if(e.isVector4)e.w=ks.w;return e.applyMatrix4(this.bindMatrixInverse)}}class Jl extends _e{constructor(){super();this.isBone=!0,this.type="Bone"}}class ci extends we{constructor(t=null,e=1,n=1,i,s,r,o,a,l=1003,c=1003,u,f){super(null,r,o,a,l,c,i,s,u,f);this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var Mh=new wt,$p=new wt;class $l{constructor(t=[],e=[]){this.uuid=Un(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){At("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new wt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let n=new wt;if(this.bones[t])n.copy(this.bones[t].matrixWorld).invert();this.boneInverses.push(n)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];if(n)n.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let n=this.bones[t];if(n){if(n.parent&&n.parent.isBone)n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld);else n.matrix.copy(n.matrixWorld);n.matrix.decompose(n.position,n.quaternion,n.scale)}}}update(){let t=this.bones,e=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let s=0,r=t.length;s<r;s++){let o=t[s]?t[s].matrixWorld:$p;Mh.multiplyMatrices(o,e[s]),Mh.toArray(n,s*16)}if(i!==null)i.needsUpdate=!0}clone(){return new $l(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let n=new ci(e,t,t,1023,1015);return n.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=n,this}getBoneByName(t){for(let e=0,n=this.bones.length;e<n;e++){let i=this.bones[e];if(i.name===t)return i}return}dispose(){if(this.boneTexture!==null)this.boneTexture.dispose(),this.boneTexture=null;if(this.previousBoneTexture!==null)this.previousBoneTexture.dispose(),this.previousBoneTexture=null}fromJSON(t,e){this.uuid=t.uuid;for(let n=0,i=t.bones.length;n<i;n++){let s=t.bones[n],r=e[s];if(r===void 0)At("Skeleton: No bone found with UUID:",s),r=new Jl;this.bones.push(r),this.boneInverses.push(new wt().fromArray(t.boneInverses[n]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,n=this.boneInverses;for(let i=0,s=e.length;i<s;i++){let r=e[i];t.bones.push(r.uuid);let o=n[i];t.boneInverses.push(o.toArray())}return t}}class no extends Ae{constructor(t,e,n,i=1){super(t,e,n);this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}var ss=new wt,bh=new wt,Xr=[],Th=new te,Kp=new wt,Hs=new Ue,Vs=new Re;class Ju extends Ue{constructor(t,e,n){super(t,e);this.isInstancedMesh=!0,this.instanceMatrix=new no(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Kp)}computeBoundingBox(){let t=this.geometry,e=this.count;if(this.boundingBox===null)this.boundingBox=new te;if(t.boundingBox===null)t.computeBoundingBox();this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ss),Th.copy(t.boundingBox).applyMatrix4(ss),this.boundingBox.union(Th)}computeBoundingSphere(){let t=this.geometry,e=this.count;if(this.boundingSphere===null)this.boundingSphere=new Re;if(t.boundingSphere===null)t.computeBoundingSphere();this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ss),Vs.copy(t.boundingSphere).applyMatrix4(ss),this.boundingSphere.union(Vs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){if(this.instanceColor===null)return e.setRGB(1,1,1);else return e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,s=n.length+1,r=t*s+1;for(let o=0;o<n.length;o++)n[o]=i[r+o]}raycast(t,e){let n=this.matrixWorld,i=this.count;if(Hs.geometry=this.geometry,Hs.material=this.material,Hs.material===void 0)return;if(this.boundingSphere===null)this.computeBoundingSphere();if(Vs.copy(this.boundingSphere),Vs.applyMatrix4(n),t.ray.intersectsSphere(Vs)===!1)return;for(let s=0;s<i;s++){this.getMatrixAt(s,ss),bh.multiplyMatrices(n,ss),Hs.matrixWorld=bh,Hs.raycast(t,Xr);for(let r=0,o=Xr.length;r<o;r++){let a=Xr[r];a.instanceId=s,a.object=this,e.push(a)}Xr.length=0}}setColorAt(t,e){if(this.instanceColor===null)this.instanceColor=new no(new Float32Array(this.instanceMatrix.count*3).fill(1),3);return e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,i=n.length+1;if(this.morphTexture===null)this.morphTexture=new ci(new Float32Array(i*this.count),i,this.count,1028,1015);let s=this.morphTexture.source.data.data,r=0;for(let l=0;l<n.length;l++)r+=n[l];let o=this.geometry.morphTargetsRelative?1:1-r,a=i*t;return s[a]=o,s.set(n,a+1),this}updateMorphTargets(){}dispose(){if(super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null)this.instanceColor.dispose();if(this.morphTexture!==null)this.morphTexture.dispose(),this.morphTexture=null}}var Ci=new Re,Qp=new Lt(0.5,0.5),qr=new N;class hi{constructor(t=new rn,e=new rn,n=new rn,i=new rn,s=new rn,r=new rn){this.planes=[t,e,n,i,s,r]}set(t,e,n,i,s,r){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(i),o[4].copy(s),o[5].copy(r),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=2000,n=!1){let i=this.planes,s=t.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],u=s[5],f=s[6],h=s[7],d=s[8],_=s[9],S=s[10],p=s[11],g=s[12],x=s[13],M=s[14],y=s[15];if(i[0].setComponents(l-r,h-c,p-d,y-g).normalize(),i[1].setComponents(l+r,h+c,p+d,y+g).normalize(),i[2].setComponents(l+o,h+u,p+_,y+x).normalize(),i[3].setComponents(l-o,h-u,p-_,y-x).normalize(),n)i[4].setComponents(a,f,S,M).normalize(),i[5].setComponents(l-a,h-f,p-S,y-M).normalize();else if(i[4].setComponents(l-a,h-f,p-S,y-M).normalize(),e===2000)i[5].setComponents(l+a,h+f,p+S,y+M).normalize();else if(e===2001)i[5].setComponents(a,f,S,M).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0){if(t.boundingSphere===null)t.computeBoundingSphere();Ci.copy(t.boundingSphere).applyMatrix4(t.matrixWorld)}else{let e=t.geometry;if(e.boundingSphere===null)e.computeBoundingSphere();Ci.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ci)}intersectsSprite(t){Ci.center.set(0,0,0);let e=Qp.distanceTo(t.center);return Ci.radius=0.7071067811865476+e,Ci.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ci)}intersectsSphere(t){let e=this.planes,n=t.center,i=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let i=e[n];if(qr.x=i.normal.x>0?t.max.x:t.min.x,qr.y=i.normal.y>0?t.max.y:t.min.y,qr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(qr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var Ah=new wt;class ir{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,n=this._frustums;for(let i=0;i<e.length;i++){let s=e[i];if(Ah.multiplyMatrices(s.projectionMatrix,s.matrixWorldInverse),n[i]===void 0)n[i]=new hi;n[i].setFromProjectionMatrix(Ah,s.coordinateSystem,s.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let n=0;n<this._count;n++)if(e[n].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,n=t._frustums;for(let i=0;i<t._count;i++){if(e[i]===void 0)e[i]=new hi;e[i].copy(n[i])}return this._count=t._count,this}clone(){return new ir().copy(this)}}function Ca(t,e){return t-e}function jp(t,e){return t.z-e.z}function tm(t,e){return e.z-t.z}class $u{constructor(){this.index=0,this.pool=[],this.list=[]}push(t,e,n,i){let s=this.pool,r=this.list;if(this.index>=s.length)s.push({start:-1,count:-1,z:-1,index:-1});let o=s[this.index];r.push(o),this.index++,o.start=t,o.count=e,o.z=n,o.index=i}reset(){this.list.length=0,this.index=0}}var sn=new wt,em=new Dt(1,1,1),nm=new hi,im=new ir,Yr=new te,Ii=new Re,Ia=new N,Eh=new N,wh=new N,sm=new N,Pa=new $u,qe=new Ue,Zr=[];function rm(t,e,n=0){let i=e.itemSize;if(t.isInterleavedBufferAttribute||t.array.constructor!==e.array.constructor){let s=t.count;for(let r=0;r<s;r++)for(let o=0;o<i;o++)e.setComponent(r+n,o,t.getComponent(r,o))}else e.array.set(t.array,n*i);e.needsUpdate=!0}function Cn(t,e){if(t.constructor!==e.constructor){let n=Math.min(t.length,e.length);for(let i=0;i<n;i++)e[i]=t[i]}else{let n=Math.min(t.length,e.length);e.set(new t.constructor(t.buffer,0,n))}}class So extends Ue{constructor(t,e,n=e*2,i){super(new Be,i);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=t,this._maxVertexCount=e,this._maxIndexCount=n,this._multiDrawCounts=new Int32Array(t),this._multiDrawStarts=new Int32Array(t),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(t),this._mergedDrawStarts=new Int32Array(t),this._mergedDrawInstanceCounts=new Int32Array(t),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let t=Math.sqrt(this._maxInstanceCount*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4),n=new ci(e,t,t,1023,1015);this._matricesTexture=n}_initIndirectTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Uint32Array(t*t),n=new ci(e,t,t,1029,1014);this._indirectTexture=n}_initColorsTexture(){let t=Math.sqrt(this._maxInstanceCount);t=Math.ceil(t);let e=new Float32Array(t*t*4).fill(1),n=new ci(e,t,t,1023,1015);n.colorSpace=Vt.workingColorSpace,this._colorsTexture=n}_initializeGeometry(t){let e=this.geometry,n=this._maxVertexCount,i=this._maxIndexCount;if(this._geometryInitialized===!1){for(let s in t.attributes){let r=t.getAttribute(s),{array:o,itemSize:a,normalized:l}=r,c=new o.constructor(n*a),u=new Ae(c,a,l);e.setAttribute(s,u)}if(t.getIndex()!==null){let s=n>65535?new Uint32Array(i):new Uint16Array(i);e.setIndex(new Ae(s,1))}this._geometryInitialized=!0}}_validateGeometry(t){let e=this.geometry;if(Boolean(t.getIndex())!==Boolean(e.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let n in e.attributes){if(!t.hasAttribute(n))throw Error(`THREE.BatchedMesh: Added geometry missing "${n}". All geometries must have consistent attributes.`);let i=t.getAttribute(n),s=e.getAttribute(n);if(i.itemSize!==s.itemSize||i.normalized!==s.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${n}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(t){let e=this._instanceInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${t}. Instance is either out of range or has been deleted.`)}validateGeometryId(t){let e=this._geometryInfo;if(t<0||t>=e.length||e[t].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${t}. Geometry is either out of range or has been deleted.`)}setCustomSort(t){return this.customSort=t,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new te;let t=this.boundingBox,e=this._instanceInfo;t.makeEmpty();for(let n=0,i=e.length;n<i;n++){if(e[n].active===!1)continue;let s=e[n].geometryIndex;this.getMatrixAt(n,sn),this.getBoundingBoxAt(s,Yr).applyMatrix4(sn),t.union(Yr)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Re;let t=this.boundingSphere,e=this._instanceInfo;t.makeEmpty();for(let n=0,i=e.length;n<i;n++){if(e[n].active===!1)continue;let s=e[n].geometryIndex;this.getMatrixAt(n,sn),this.getBoundingSphereAt(s,Ii).applyMatrix4(sn),t.union(Ii)}}addInstance(t){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let n={visible:!0,active:!0,geometryIndex:t},i=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Ca),i=this._availableInstanceIds.shift(),this._instanceInfo[i]=n;else i=this._instanceInfo.length,this._instanceInfo.push(n);let s=this._matricesTexture;sn.identity().toArray(s.image.data,i*16),s.needsUpdate=!0;let r=this._colorsTexture;if(r)em.toArray(r.image.data,i*4),r.needsUpdate=!0;return this._visibilityChanged=!0,i}addGeometry(t,e=-1,n=-1){this._initializeGeometry(t),this._validateGeometry(t);let i={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},s=this._geometryInfo;i.vertexStart=this._nextVertexStart,i.reservedVertexCount=e===-1?t.getAttribute("position").count:e;let r=t.getIndex();if(r!==null)i.indexStart=this._nextIndexStart,i.reservedIndexCount=n===-1?r.count:n;if(i.indexStart!==-1&&i.indexStart+i.reservedIndexCount>this._maxIndexCount||i.vertexStart+i.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let a;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Ca),a=this._availableGeometryIds.shift(),s[a]=i;else a=this._geometryCount,this._geometryCount++,s.push(i);return this.setGeometryAt(a,t),this._nextIndexStart=i.indexStart+i.reservedIndexCount,this._nextVertexStart=i.vertexStart+i.reservedVertexCount,a}setGeometryAt(t,e){if(t>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(e);let n=this.geometry,i=n.getIndex()!==null,s=n.getIndex(),r=e.getIndex(),o=this._geometryInfo[t];if(i&&r.count>o.reservedIndexCount||e.attributes.position.count>o.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:a,reservedVertexCount:l}=o;o.vertexCount=e.getAttribute("position").count;for(let c in n.attributes){let u=e.getAttribute(c),f=n.getAttribute(c);rm(u,f,a);let h=u.itemSize;for(let d=u.count,_=l;d<_;d++){let S=a+d;for(let p=0;p<h;p++)f.setComponent(S,p,0)}f.needsUpdate=!0,f.addUpdateRange(a*h,l*h)}if(i){let{indexStart:c,reservedIndexCount:u}=o;o.indexCount=e.getIndex().count;for(let f=0;f<r.count;f++)s.setX(c+f,a+r.getX(f));for(let f=r.count,h=u;f<h;f++)s.setX(c+f,a);s.needsUpdate=!0,s.addUpdateRange(c,o.reservedIndexCount)}if(o.start=i?o.indexStart:o.vertexStart,o.count=i?o.indexCount:o.vertexCount,o.boundingBox=null,e.boundingBox!==null)o.boundingBox=e.boundingBox.clone();if(o.boundingSphere=null,e.boundingSphere!==null)o.boundingSphere=e.boundingSphere.clone();return this._visibilityChanged=!0,t}deleteGeometry(t){let e=this._geometryInfo;if(t>=e.length||e[t].active===!1)return this;let n=this._instanceInfo;for(let i=0,s=n.length;i<s;i++)if(n[i].active&&n[i].geometryIndex===t)this.deleteInstance(i);return e[t].active=!1,this._availableGeometryIds.push(t),this._visibilityChanged=!0,this}deleteInstance(t){return this.validateInstanceId(t),this._instanceInfo[t].active=!1,this._availableInstanceIds.push(t),this._visibilityChanged=!0,this}optimize(){let t=0,e=0,n=this._geometryInfo,i=n.map((r,o)=>o).sort((r,o)=>n[r].vertexStart-n[o].vertexStart),s=this.geometry;for(let r=0,o=n.length;r<o;r++){let a=i[r],l=n[a];if(l.active===!1)continue;if(s.index!==null){if(l.indexStart!==e){let{indexStart:c,vertexStart:u,reservedIndexCount:f}=l,h=s.index,d=h.array,_=t-u;for(let S=c;S<c+f;S++)d[S]=d[S]+_;h.array.copyWithin(e,c,c+f),h.addUpdateRange(e,f),h.needsUpdate=!0,l.indexStart=e}e+=l.reservedIndexCount}if(l.vertexStart!==t){let{vertexStart:c,reservedVertexCount:u}=l,f=s.attributes;for(let h in f){let d=f[h],{array:_,itemSize:S}=d;_.copyWithin(t*S,c*S,(c+u)*S),d.addUpdateRange(t*S,u*S),d.needsUpdate=!0}l.vertexStart=t}t+=l.reservedVertexCount,l.start=s.index?l.indexStart:l.vertexStart}return this._nextIndexStart=e,this._nextVertexStart=t,this._visibilityChanged=!0,this}getBoundingBoxAt(t,e){if(t>=this._geometryCount)return null;let n=this.geometry,i=this._geometryInfo[t];if(i.boundingBox===null){let s=new te,r=n.index,o=n.attributes.position;for(let a=i.start,l=i.start+i.count;a<l;a++){let c=a;if(r)c=r.getX(c);s.expandByPoint(Ia.fromBufferAttribute(o,c))}i.boundingBox=s}return e.copy(i.boundingBox),e}getBoundingSphereAt(t,e){if(t>=this._geometryCount)return null;let n=this.geometry,i=this._geometryInfo[t];if(i.boundingSphere===null){let s=new Re;this.getBoundingBoxAt(t,Yr),Yr.getCenter(s.center);let r=n.index,o=n.attributes.position,a=0;for(let l=i.start,c=i.start+i.count;l<c;l++){let u=l;if(r)u=r.getX(u);Ia.fromBufferAttribute(o,u),a=Math.max(a,s.center.distanceToSquared(Ia))}s.radius=Math.sqrt(a),i.boundingSphere=s}return e.copy(i.boundingSphere),e}setMatrixAt(t,e){this.validateInstanceId(t);let n=this._matricesTexture,i=this._matricesTexture.image.data;return e.toArray(i,t*16),n.needsUpdate=!0,this}getMatrixAt(t,e){return this.validateInstanceId(t),e.fromArray(this._matricesTexture.image.data,t*16)}setColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)this._initColorsTexture();return e.toArray(this._colorsTexture.image.data,t*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(t,e){if(this.validateInstanceId(t),this._colorsTexture===null)if(e.isVector4)return e.set(1,1,1,1);else return e.setRGB(1,1,1);else return e.fromArray(this._colorsTexture.image.data,t*4)}setVisibleAt(t,e){if(this.validateInstanceId(t),this._instanceInfo[t].visible===e)return this;return this._instanceInfo[t].visible=e,this._visibilityChanged=!0,this}getVisibleAt(t){return this.validateInstanceId(t),this._instanceInfo[t].visible}setGeometryIdAt(t,e){return this.validateInstanceId(t),this.validateGeometryId(e),this._instanceInfo[t].geometryIndex=e,this._visibilityChanged=!0,this}getGeometryIdAt(t){return this.validateInstanceId(t),this._instanceInfo[t].geometryIndex}getGeometryRangeAt(t,e={}){this.validateGeometryId(t);let n=this._geometryInfo[t];return e.vertexStart=n.vertexStart,e.vertexCount=n.vertexCount,e.reservedVertexCount=n.reservedVertexCount,e.indexStart=n.indexStart,e.indexCount=n.indexCount,e.reservedIndexCount=n.reservedIndexCount,e.start=n.start,e.count=n.count,e}setInstanceCount(t){let e=this._availableInstanceIds,n=this._instanceInfo;e.sort(Ca);while(e[e.length-1]===n.length-1)n.pop(),e.pop();if(t<n.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${t} are being used. Cannot shrink instance count.`);let i=new Int32Array(t),s=new Int32Array(t);Cn(this._multiDrawCounts,i),Cn(this._multiDrawStarts,s),this._multiDrawCounts=i,this._multiDrawStarts=s;let r=new Int32Array(t),o=new Int32Array(t),a=new Int32Array(t);Cn(this._mergedDrawCounts,r),Cn(this._mergedDrawStarts,o),Cn(this._mergedDrawInstanceCounts,a),this._mergedDrawCounts=r,this._mergedDrawStarts=o,this._mergedDrawInstanceCounts=a,this._maxInstanceCount=t;let l=this._indirectTexture,c=this._matricesTexture,u=this._colorsTexture;if(l.dispose(),this._initIndirectTexture(),Cn(l.image.data,this._indirectTexture.image.data),c.dispose(),this._initMatricesTexture(),Cn(c.image.data,this._matricesTexture.image.data),u)u.dispose(),this._initColorsTexture(),Cn(u.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(t,e){let n=[...this._geometryInfo].filter((o)=>o.active);if(Math.max(...n.map((o)=>o.vertexStart+o.reservedVertexCount))>t)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${t}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...n.map((a)=>a.indexStart+a.reservedIndexCount))>e)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${e}. Cannot shrink further.`)}let s=this.geometry;if(s.dispose(),this._maxVertexCount=t,this._maxIndexCount=e,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new Be,this._initializeGeometry(s);let r=this.geometry;if(s.index)Cn(s.index.array,r.index.array);for(let o in s.attributes)Cn(s.attributes[o].array,r.attributes[o].array);this._visibilityChanged=!0}raycast(t,e){let n=this._instanceInfo,i=this._geometryInfo,s=this.matrixWorld,r=this.geometry;if(qe.material=this.material,qe.geometry.index=r.index,qe.geometry.attributes=r.attributes,qe.geometry.boundingBox===null)qe.geometry.boundingBox=new te;if(qe.geometry.boundingSphere===null)qe.geometry.boundingSphere=new Re;for(let o=0,a=n.length;o<a;o++){if(!n[o].visible||!n[o].active)continue;let l=n[o].geometryIndex,c=i[l];qe.geometry.setDrawRange(c.start,c.count),this.getMatrixAt(o,qe.matrixWorld).premultiply(s),this.getBoundingBoxAt(l,qe.geometry.boundingBox),this.getBoundingSphereAt(l,qe.geometry.boundingSphere),qe.raycast(t,Zr);for(let u=0,f=Zr.length;u<f;u++){let h=Zr[u];h.object=this,h.batchId=o,e.push(h)}Zr.length=0}qe.material=null,qe.geometry.index=null,qe.geometry.attributes={},qe.geometry.setDrawRange(0,1/0)}copy(t){if(super.copy(t),this.geometry=t.geometry.clone(),this.perObjectFrustumCulled=t.perObjectFrustumCulled,this.sortObjects=t.sortObjects,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this._geometryInfo=t._geometryInfo.map((e)=>({...e,boundingBox:e.boundingBox!==null?e.boundingBox.clone():null,boundingSphere:e.boundingSphere!==null?e.boundingSphere.clone():null})),this._instanceInfo=t._instanceInfo.map((e)=>({...e})),this._availableInstanceIds=t._availableInstanceIds.slice(),this._availableGeometryIds=t._availableGeometryIds.slice(),this._nextIndexStart=t._nextIndexStart,this._nextVertexStart=t._nextVertexStart,this._geometryCount=t._geometryCount,this._maxInstanceCount=t._maxInstanceCount,this._maxVertexCount=t._maxVertexCount,this._maxIndexCount=t._maxIndexCount,this._geometryInitialized=t._geometryInitialized,this._multiDrawCounts=t._multiDrawCounts.slice(),this._multiDrawStarts=t._multiDrawStarts.slice(),this._multiDrawBytesPerElement=t._multiDrawBytesPerElement,this._mergedDrawCounts=t._mergedDrawCounts.slice(),this._mergedDrawStarts=t._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=t._mergedDrawInstanceCounts.slice(),this._indirectTexture=t._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=t._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),t._colorsTexture!==null)this._colorsTexture=t._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(t,e,n,i="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let s=e.getIndex(),r=s===null?1:s.array.BYTES_PER_ELEMENT,o=1;if(n.wireframe)o=2,r=e.attributes.position.count>65535?4:2;let a=this._instanceInfo,l=this._multiDrawStarts,c=this._multiDrawCounts,u=this._mergedDrawStarts,f=this._mergedDrawCounts,h=this._mergedDrawInstanceCounts,d=this._geometryInfo,_=this.perObjectFrustumCulled,S=this._indirectTexture,p=S.image.data,g=t.isArrayCamera?im:nm;if(_)if(t.isArrayCamera)g.setFromArrayCamera(t);else sn.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse).multiply(this.matrixWorld),g.setFromProjectionMatrix(sn,t.coordinateSystem,t.reversedDepth);let x=0,M=0;if(this.sortObjects){sn.copy(this.matrixWorld).invert(),Eh.setFromMatrixPosition(t.matrixWorld).applyMatrix4(sn),wh.set(0,0,-1).transformDirection(t.matrixWorld).transformDirection(sn);for(let E=0,m=a.length;E<m;E++)if(a[E].visible&&a[E].active){let v=a[E].geometryIndex;this.getMatrixAt(E,sn),this.getBoundingSphereAt(v,Ii).applyMatrix4(sn);let w=!1;if(_)w=!g.intersectsSphere(Ii);if(!w){let P=d[v],R=sm.subVectors(Ii.center,Eh).dot(wh);Pa.push(P.start,P.count,R,E)}}let y=Pa.list,b=this.customSort;if(b===null)y.sort(n.transparent?tm:jp);else b.call(this,y,t);for(let E=0,m=y.length;E<m;E++){let v=y[E],w=v.start*r*o,P=v.count*o;if(i==="merged")if(M>0&&u[M-1]===w&&f[M-1]===P)h[M-1]++;else u[M]=w,f[M]=P,h[M]=1,M++;else l[x]=w,c[x]=P;p[x]=v.index,x++}Pa.reset()}else for(let y=0,b=a.length;y<b;y++)if(a[y].visible&&a[y].active){let E=a[y].geometryIndex,m=!1;if(_)this.getMatrixAt(y,sn),this.getBoundingSphereAt(E,Ii).applyMatrix4(sn),m=!g.intersectsSphere(Ii);if(!m){let v=d[E],w=v.start*r*o,P=v.count*o;if(i==="merged")if(M>0&&u[M-1]===w&&f[M-1]===P)h[M-1]++;else u[M]=w,f[M]=P,h[M]=1,M++;else l[x]=w,c[x]=P;p[x]=y,x++}}S.needsUpdate=!0,this._multiDrawCount=x,this._mergedDrawCount=M,this._multiDrawBytesPerElement=r,this._visibilityChanged=!1}onBeforeRender(t,e,n,i,s){if(t.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(n,i,s)}onBeforeShadow(t,e,n,i,s,r){if(t.isWebGPURenderer!==!0)this._updateDrawParameters(i,s,r)}}class Mo extends En{constructor(t){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}var io=new N,so=new N,Rh=new wt,Ws=new jn,Jr=new Re,La=new N,Ch=new N;class zi extends _e{constructor(t=new Be,e=new Mo){super();this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let i=1,s=e.count;i<s;i++)io.fromBufferAttribute(e,i-1),so.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=io.distanceTo(so);t.setAttribute("lineDistance",new Ee(n,1))}else At("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,s=t.params.Line.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(Jr.copy(n.boundingSphere),Jr.applyMatrix4(i),Jr.radius+=s,t.ray.intersectsSphere(Jr)===!1)return;Rh.copy(i).invert(),Ws.copy(t.ray).applyMatrix4(Rh);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),a=o*o,l=this.isLineSegments?2:1,c=n.index,f=n.attributes.position;if(c!==null){let h=Math.max(0,r.start),d=Math.min(c.count,r.start+r.count);for(let _=h,S=d-1;_<S;_+=l){let p=c.getX(_),g=c.getX(_+1),x=$r(this,t,Ws,a,p,g,_);if(x)e.push(x)}if(this.isLineLoop){let _=c.getX(d-1),S=c.getX(h),p=$r(this,t,Ws,a,_,S,d-1);if(p)e.push(p)}}else{let h=Math.max(0,r.start),d=Math.min(f.count,r.start+r.count);for(let _=h,S=d-1;_<S;_+=l){let p=$r(this,t,Ws,a,_,_+1,_);if(p)e.push(p)}if(this.isLineLoop){let _=$r(this,t,Ws,a,d-1,h,d-1);if(_)e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function $r(t,e,n,i,s,r,o){let a=t.geometry.attributes.position;if(io.fromBufferAttribute(a,s),so.fromBufferAttribute(a,r),n.distanceSqToSegment(io,so,La,Ch)>i)return;La.applyMatrix4(t.matrixWorld);let c=e.ray.origin.distanceTo(La);if(c<e.near||c>e.far)return;return{distance:c,point:Ch.clone().applyMatrix4(t.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:t}}var Ih=new N,Ph=new N;class xs extends zi{constructor(t,e){super(t,e);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let i=0,s=e.count;i<s;i+=2)Ih.fromBufferAttribute(e,i),Ph.fromBufferAttribute(e,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ih.distanceTo(Ph);t.setAttribute("lineDistance",new Ee(n,1))}else At("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class sr extends zi{constructor(t,e){super(t,e);this.isLineLoop=!0,this.type="LineLoop"}}class Kl extends En{constructor(t){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}var Lh=new wt,Fa=new jn,Kr=new Re,Qr=new N;class rr extends _e{constructor(t=new Be,e=new Kl){super();this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){if(super.copy(t,e),t.morphTargetInfluences!==void 0)this.morphTargetInfluences=t.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(t.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,i=this.matrixWorld,s=t.params.Points.threshold,r=n.drawRange;if(n.boundingSphere===null)n.computeBoundingSphere();if(Kr.copy(n.boundingSphere),Kr.applyMatrix4(i),Kr.radius+=s,t.ray.intersectsSphere(Kr)===!1)return;Lh.copy(i).invert(),Fa.copy(t.ray).applyMatrix4(Lh);let o=s/((this.scale.x+this.scale.y+this.scale.z)/3),a=o*o,l=n.index,u=n.attributes.position;if(l!==null){let f=Math.max(0,r.start),h=Math.min(l.count,r.start+r.count);for(let d=f,_=h;d<_;d++){let S=l.getX(d);Qr.fromBufferAttribute(u,S),Nh(Qr,S,a,i,t,e,this)}}else{let f=Math.max(0,r.start),h=Math.min(u.count,r.start+r.count);for(let d=f,_=h;d<_;d++)Qr.fromBufferAttribute(u,d),Nh(Qr,d,a,i,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,r=i.length;s<r;s++){let o=i[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=s}}}}}function Nh(t,e,n,i,s,r,o){let a=Fa.distanceSqToPoint(t);if(a<n){let l=new N;Fa.closestPointToPoint(t,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class Ql extends we{constructor(t=[],e,n,i,s,r,o,a,l,c,u,f){super(null,r,o,a,l,c,i,s,u,f);this.isCompressedTexture=!0,this.image={width:e,height:n},this.mipmaps=t,this.flipY=!1,this.generateMipmaps=!1}}class bo extends we{constructor(t=[],e=301,n,i,s,r,o,a,l,c){super(t,e,n,i,s,r,o,a,l,c);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Ku extends we{constructor(t,e,n,i,s,r,o,a,l){super(t,e,n,i,s,r,o,a,l);this.isCanvasTexture=!0,this.needsUpdate=!0}}class mi extends we{constructor(t,e,n=1014,i,s,r,o=1003,a=1003,l,c=1026,u=1){if(c!==1026&&c!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:t,height:e,depth:u};super(f,i,s,r,o,a,c,n,l);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new tr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}}class To extends mi{constructor(t,e=1014,n=301,i,s,r=1003,o=1003,a,l=1026){let c={width:t,height:t,depth:1},u=[c,c,c,c,c,c];super(t,t,e,n,i,s,r,o,a,l);this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class Ao extends we{constructor(t=null){super();this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class ys extends Be{constructor(t=1,e=1,n=1,i=1,s=1,r=1){super();this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:s,depthSegments:r};let o=this;i=Math.floor(i),s=Math.floor(s),r=Math.floor(r);let a=[],l=[],c=[],u=[],f=0,h=0;d("z","y","x",-1,-1,n,e,t,r,s,0),d("z","y","x",1,-1,n,e,-t,r,s,1),d("x","z","y",1,1,t,n,e,i,r,2),d("x","z","y",1,-1,t,n,-e,i,r,3),d("x","y","z",1,-1,t,e,n,i,s,4),d("x","y","z",-1,-1,t,e,-n,i,s,5),this.setIndex(a),this.setAttribute("position",new Ee(l,3)),this.setAttribute("normal",new Ee(c,3)),this.setAttribute("uv",new Ee(u,2));function d(_,S,p,g,x,M,y,b,E,m,v){let w=M/E,P=y/m,R=M/2,L=y/2,F=b/2,C=E+1,B=m+1,W=0,z=0,st=new N;for(let q=0;q<B;q++){let Q=q*P-L;for(let et=0;et<C;et++){let xt=et*w-R;st[_]=xt*g,st[S]=Q*x,st[p]=F,l.push(st.x,st.y,st.z),st[_]=0,st[S]=0,st[p]=b>0?1:-1,c.push(st.x,st.y,st.z),u.push(et/E),u.push(1-q/m),W+=1}}for(let q=0;q<m;q++)for(let Q=0;Q<E;Q++){let et=f+Q+C*q,xt=f+Q+C*(q+1),K=f+(Q+1)+C*(q+1),nt=f+(Q+1)+C*q;a.push(et,xt,nt),a.push(xt,K,nt),z+=6}o.addGroup(h,z,v),h+=z,f+=W}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ys(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class jl extends Be{constructor(t=1,e=32,n=0,i=Math.PI*2){super();this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:i},e=Math.max(3,e);let s=[],r=[],o=[],a=[],l=new N,c=new Lt;r.push(0,0,0),o.push(0,0,1),a.push(0.5,0.5);for(let u=0,f=3;u<=e;u++,f+=3){let h=n+u/e*i;l.x=t*Math.cos(h),l.y=t*Math.sin(h),r.push(l.x,l.y,l.z),o.push(0,0,1),c.x=(r[f]/t+1)/2,c.y=(r[f+1]/t+1)/2,a.push(c.x,c.y)}for(let u=1;u<=e;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new Ee(r,3)),this.setAttribute("normal",new Ee(o,3)),this.setAttribute("uv",new Ee(a,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new jl(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Eo extends Be{constructor(t=1,e=1,n=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super();this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a};let l=this;i=Math.floor(i),s=Math.floor(s);let c=[],u=[],f=[],h=[],d=0,_=[],S=n/2,p=0;if(g(),r===!1){if(t>0)x(!0);if(e>0)x(!1)}this.setIndex(c),this.setAttribute("position",new Ee(u,3)),this.setAttribute("normal",new Ee(f,3)),this.setAttribute("uv",new Ee(h,2));function g(){let M=new N,y=new N,b=0,E=(e-t)/n;for(let m=0;m<=s;m++){let v=[],w=m/s,P=w*(e-t)+t;for(let R=0;R<=i;R++){let L=R/i,F=L*a+o,C=Math.sin(F),B=Math.cos(F);y.x=P*C,y.y=-w*n+S,y.z=P*B,u.push(y.x,y.y,y.z),M.set(C,E,B).normalize(),f.push(M.x,M.y,M.z),h.push(L,1-w),v.push(d++)}_.push(v)}for(let m=0;m<i;m++)for(let v=0;v<s;v++){let w=_[v][m],P=_[v+1][m],R=_[v+1][m+1],L=_[v][m+1];if(t>0||v!==0)c.push(w,P,L),b+=3;if(e>0||v!==s-1)c.push(P,R,L),b+=3}l.addGroup(p,b,0),p+=b}function x(M){let y=d,b=new Lt,E=new N,m=0,v=M===!0?t:e,w=M===!0?1:-1;for(let R=1;R<=i;R++)u.push(0,S*w,0),f.push(0,w,0),h.push(0.5,0.5),d++;let P=d;for(let R=0;R<=i;R++){let F=R/i*a+o,C=Math.cos(F),B=Math.sin(F);E.x=v*B,E.y=S*w,E.z=v*C,u.push(E.x,E.y,E.z),f.push(0,w,0),b.x=C*0.5+0.5,b.y=B*0.5*w+0.5,h.push(b.x,b.y),d++}for(let R=0;R<i;R++){let L=y+R,F=P+R;if(M===!0)c.push(F,F+1,L);else c.push(F+1,F,L);m+=3}l.addGroup(p,m,M===!0?1:2),p+=m}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Eo(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class tc extends Eo{constructor(t=1,e=1,n=32,i=1,s=!1,r=0,o=Math.PI*2){super(0,t,e,n,i,s,r,o);this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:s,thetaStart:r,thetaLength:o}}static fromJSON(t){return new tc(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class or extends Be{constructor(t=1,e=1,n=1,i=1){super();this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let s=t/2,r=e/2,o=Math.floor(n),a=Math.floor(i),l=o+1,c=a+1,u=t/o,f=e/a,h=[],d=[],_=[],S=[];for(let p=0;p<c;p++){let g=p*f-r;for(let x=0;x<l;x++){let M=x*u-s;d.push(M,-g,0),_.push(0,0,1),S.push(x/o),S.push(1-p/a)}}for(let p=0;p<a;p++)for(let g=0;g<o;g++){let x=g+l*p,M=g+l*(p+1),y=g+1+l*(p+1),b=g+1+l*p;h.push(x,M,b),h.push(M,y,b)}this.setIndex(h),this.setAttribute("position",new Ee(d,3)),this.setAttribute("normal",new Ee(_,3)),this.setAttribute("uv",new Ee(S,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new or(t.width,t.height,t.widthSegments,t.heightSegments)}}function Gi(t){let e={};for(let n in t){e[n]={};for(let i in t[n]){let s=t[n][i];if(Dh(s))if(s.isRenderTargetTexture)At("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][i]=null;else e[n][i]=s.clone();else if(Array.isArray(s))if(Dh(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[n][i]=r}else e[n][i]=s.slice();else e[n][i]=s}}return e}function Ze(t){let e={};for(let n=0;n<t.length;n++){let i=Gi(t[n]);for(let s in i)e[s]=i[s]}return e}function Dh(t){return t&&(t.isColor||t.isMatrix3||t.isMatrix4||t.isVector2||t.isVector3||t.isVector4||t.isTexture||t.isQuaternion)}function om(t){let e=[];for(let n=0;n<t.length;n++)e.push(t[n].clone());return e}function ec(t){let e=t.getRenderTarget();if(e===null)return t.outputColorSpace;if(e.isXRRenderTarget===!0)return e.texture.colorSpace;return Vt.workingColorSpace}var Qu={clone:Gi,merge:Ze},am=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,lm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ti extends En{constructor(t){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=am,this.fragmentShader=lm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0)this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Gi(t.uniforms),this.uniformsGroups=om(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let i in this.uniforms){let r=this.uniforms[i].value;if(r&&r.isTexture)e.uniforms[i]={type:"t",value:r.toJSON(t).uuid};else if(r&&r.isColor)e.uniforms[i]={type:"c",value:r.getHex()};else if(r&&r.isVector2)e.uniforms[i]={type:"v2",value:r.toArray()};else if(r&&r.isVector3)e.uniforms[i]={type:"v3",value:r.toArray()};else if(r&&r.isVector4)e.uniforms[i]={type:"v4",value:r.toArray()};else if(r&&r.isMatrix3)e.uniforms[i]={type:"m3",value:r.toArray()};else if(r&&r.isMatrix4)e.uniforms[i]={type:"m4",value:r.toArray()};else e.uniforms[i]={value:r}}if(Object.keys(this.defines).length>0)e.defines=this.defines;e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let i in this.extensions)if(this.extensions[i]===!0)n[i]=!0;if(Object.keys(n).length>0)e.extensions=n;return e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let i=t.uniforms[n];switch(this.uniforms[n]={},i.type){case"t":this.uniforms[n].value=e[i.value]||null;break;case"c":this.uniforms[n].value=new Dt().setHex(i.value);break;case"v2":this.uniforms[n].value=new Lt().fromArray(i.value);break;case"v3":this.uniforms[n].value=new N().fromArray(i.value);break;case"v4":this.uniforms[n].value=new oe().fromArray(i.value);break;case"m3":this.uniforms[n].value=new Ft().fromArray(i.value);break;case"m4":this.uniforms[n].value=new wt().fromArray(i.value);break;default:this.uniforms[n].value=i.value}}if(t.defines!==void 0)this.defines=t.defines;if(t.vertexShader!==void 0)this.vertexShader=t.vertexShader;if(t.fragmentShader!==void 0)this.fragmentShader=t.fragmentShader;if(t.glslVersion!==void 0)this.glslVersion=t.glslVersion;if(t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];if(t.lights!==void 0)this.lights=t.lights;if(t.clipping!==void 0)this.clipping=t.clipping;return this}}class nc extends ti{constructor(t){super(t);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ic extends En{constructor(t){super();this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Dt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class ju extends ic{constructor(t){super();this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Lt(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ut(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+0.4*e)/(1-0.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Dt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Dt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Dt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){if(this._anisotropy>0!==t>0)this.version++;this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){if(this._clearcoat>0!==t>0)this.version++;this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){if(this._diffuseRoughness>0!==t>0)this.version++;this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){if(this._iridescence>0!==t>0)this.version++;this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){if(this._dispersion>0!==t>0)this.version++;this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){if(this._retroreflectivity>0!==t>0)this.version++;this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){if(this._sheen>0!==t>0)this.version++;this._sheen=t}get transmission(){return this._transmission}set transmission(t){if(this._transmission>0!==t>0)this.version++;this._transmission=t}get iridescenceThicknessRange(){return Pi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){Pi('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class tf extends En{constructor(t){super();this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Dt(16777215),this.specular=new Dt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class ef extends En{constructor(t){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Lt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Tn,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class sc extends En{constructor(t){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class rc extends En{constructor(t){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}function li(t,e){if(!t||t.constructor===e)return t;if(typeof e.BYTES_PER_ELEMENT==="number")return new e(t);return Array.prototype.slice.call(t)}function Xs(t){return t!==void 0&&t.inTangents!==void 0&&t.outTangents!==void 0}function cm(t){function e(s,r){return t[s]-t[r]}let n=t.length,i=Array(n);for(let s=0;s!==n;++s)i[s]=s;return i.sort(e),i}function Uh(t,e,n){let i=t.length,s=new t.constructor(i);for(let r=0,o=0;o!==i;++r){let a=n[r]*e;for(let l=0;l!==e;++l)s[o++]=t[a+l]}return s}function hm(t,e,n,i){let s=1,r=t[0];while(r!==void 0&&r[i]===void 0)r=t[s++];if(r===void 0)return;let o=r[i];if(o===void 0)return;if(Array.isArray(o))do{if(o=r[i],o!==void 0)e.push(r.time),n.push(...o);r=t[s++]}while(r!==void 0);else if(o.toArray!==void 0)do{if(o=r[i],o!==void 0)e.push(r.time),o.toArray(n,n.length);r=t[s++]}while(r!==void 0);else do{if(o=r[i],o!==void 0)e.push(r.time),n.push(o);r=t[s++]}while(r!==void 0)}class ki{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],s=e[n-1];n:{t:{let r;e:{i:if(!(t<i)){for(let o=n+2;;){if(i===void 0){if(t<s)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(s=i,i=e[++n],t<i)break t}r=e.length;break e}if(!(t>=s)){let o=e[1];if(t<o)n=2,s=o;for(let a=n-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(i=s,s=e[--n-1],t>=s)break t}r=n,n=0;break e}break n}while(n<r){let o=n+r>>>1;if(t<e[o])r=o;else n=o+1}if(i=e[n],s=e[n-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,s,i)}return this.interpolate_(n,s,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,s=t*i;for(let r=0;r!==i;++r)e[r]=n[s+r];return e}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class oc extends ki{constructor(t,e,n,i){super(t,e,n,i);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(t,e,n){let i=this.parameterPositions,s=t-2,r=t+1,o=i[s],a=i[r];if(o===void 0)switch(this.getSettings_().endingStart){case 2401:s=t,o=2*e-n;break;case 2402:s=i.length-2,o=e+i[s]-i[s+1];break;default:s=t,o=n}if(a===void 0)switch(this.getSettings_().endingEnd){case 2401:r=t,a=2*n-e;break;case 2402:r=1,a=n+i[1]-i[0];break;default:r=t-1,a=e}let l=(n-e)*0.5,c=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(a-n),this._offsetPrev=s*c,this._offsetNext=r*c}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=t*o,l=a-o,c=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,h=this._weightNext,d=(n-e)/(i-e),_=d*d,S=_*d,p=-f*S+2*f*_-f*d,g=(1+f)*S+(-1.5-2*f)*_+(-0.5+f)*d+1,x=(-1-h)*S+(1.5+h)*_+0.5*d,M=h*S-h*_;for(let y=0;y!==o;++y)s[y]=p*r[c+y]+g*r[l+y]+x*r[a+y]+M*r[u+y];return s}}class ac extends ki{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=t*o,l=a-o,c=(n-e)/(i-e),u=1-c;for(let f=0;f!==o;++f)s[f]=r[l+f]*u+r[a+f]*c;return s}}class lc extends ki{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}}class cc extends ki{interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=t*o,l=a-o,c=this.inTangents,u=this.outTangents;if(!c||!u){let d=(n-e)/(i-e),_=1-d;for(let S=0;S!==o;++S)s[S]=r[l+S]*_+r[a+S]*d;return s}let f=o*2,h=t-1;for(let d=0;d!==o;++d){let _=r[l+d],S=r[a+d],p=h*f+d*2,g=u[p],x=u[p+1],M=t*f+d*2,y=c[M],b=c[M+1],E=fm(n,e,g,y,i);s[d]=nf(E,_,x,b,S)}return s}}function nf(t,e,n,i,s){let r=1-t;return r*r*r*e+3*r*r*t*n+3*r*t*t*i+t*t*t*s}function um(t,e,n,i,s){let r=1-t;return 3*r*r*(n-e)+6*r*t*(i-n)+3*t*t*(s-i)}function fm(t,e,n,i,s){let r=(t-e)/(s-e);for(let o=0;o<8;o++){let a=nf(r,e,n,i,s)-t;if(Math.abs(a)<0.0000000001)break;let l=um(r,e,n,i,s);if(Math.abs(l)<0.0000000001)break;r=Math.max(0,Math.min(1,r-a/l))}return r}class un{constructor(t,e,n,i){if(t===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=li(e,this.TimeBufferType),this.values=li(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:li(t.times,Array),values:li(t.values,Array)};let i=t.getInterpolation();if(i!==t.DefaultInterpolation)n.interpolation=i;if(Xs(t.settings))n.settings={inTangents:li(t.settings.inTangents,Array),outTangents:li(t.settings.outTangents,Array)}}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new lc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new ac(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new oc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new cc(this.times,this.values,this.getValueSize(),t);if(this.settings)e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents;return e}setInterpolation(t){let e;switch(t){case 2300:e=this.InterpolantFactoryMethodDiscrete;break;case 2301:e=this.InterpolantFactoryMethodLinear;break;case 2302:e=this.InterpolantFactoryMethodSmooth;break;case 2303:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(n);return At("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t;if(Xs(this.settings))Fh(this.settings.inTangents,t),Fh(this.settings.outTangents,t)}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;if(Xs(this.settings))Oh(this.settings.inTangents,t),Oh(this.settings.outTangents,t)}return this}trim(t,e){let n=this.times,i=n.length,s=0,r=i-1;while(s!==i&&n[s]<t)++s;while(r!==-1&&n[r]>e)--r;if(++r,s!==0||r!==i){if(s>=r)r=Math.max(r,1),s=r-1;let o=this.getValueSize();this.times=n.slice(s,r),this.values=this.values.slice(s*o,r*o)}return this}validate(){let t=!0,e=this.getValueSize();if(e-Math.floor(e)!==0)Nt("KeyframeTrack: Invalid value size in track.",this),t=!1;let n=this.times,i=this.values,s=n.length;if(s===0)Nt("KeyframeTrack: Track is empty.",this),t=!1;let r=null;for(let o=0;o!==s;o++){let a=n[o];if(typeof a==="number"&&isNaN(a)){Nt("KeyframeTrack: Time is not a valid number.",this,o,a),t=!1;break}if(r!==null&&r>a){Nt("KeyframeTrack: Out of order keys.",this,o,a,r),t=!1;break}r=a}if(i!==void 0){if(mp(i))for(let o=0,a=i.length;o!==a;++o){let l=i[o];if(isNaN(l)){Nt("KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===2302,s=t.length-1,r=1;for(let o=1;o<s;++o){let a=!1,l=t[o],c=t[o+1];if(l!==c&&(o!==1||l!==t[0]))if(!i){let u=o*n,f=u-n,h=u+n;for(let d=0;d!==n;++d){let _=e[u+d];if(_!==e[f+d]||_!==e[h+d]){a=!0;break}}}else a=!0;if(a){if(o!==r){t[r]=t[o];let u=o*n,f=r*n;for(let h=0;h!==n;++h)e[f+h]=e[u+h]}++r}}if(s>0){t[r]=t[s];for(let o=s*n,a=r*n,l=0;l!==n;++l)e[a+l]=e[o+l];++r}if(r!==t.length)this.times=t.slice(0,r),this.values=e.slice(0,r*n);else this.times=t,this.values=e;return this}clone(){let t=this.times.slice(),e=this.values.slice(),i=new this.constructor(this.name,t,e);if(i.createInterpolant=this.createInterpolant,Xs(this.settings))i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return i}}function Fh(t,e){for(let n=0,i=t.length;n!==i;n+=2)t[n]+=e}function Oh(t,e){for(let n=0,i=t.length;n!==i;n+=2)t[n]*=e}un.prototype.ValueTypeName="";un.prototype.TimeBufferType=Float32Array;un.prototype.ValueBufferType=Float32Array;un.prototype.DefaultInterpolation=2301;class gi extends un{constructor(t,e,n){super(t,e,n)}}gi.prototype.ValueTypeName="bool";gi.prototype.ValueBufferType=Array;gi.prototype.DefaultInterpolation=2300;gi.prototype.InterpolantFactoryMethodLinear=void 0;gi.prototype.InterpolantFactoryMethodSmooth=void 0;class wo extends un{constructor(t,e,n,i){super(t,e,n,i)}}wo.prototype.ValueTypeName="color";class ar extends un{constructor(t,e,n,i){super(t,e,n,i)}}ar.prototype.ValueTypeName="number";class hc extends ki{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let s=this.resultBuffer,r=this.sampleValues,o=this.valueSize,a=(n-e)/(i-e),l=t*o;for(let c=l+o;l!==c;l+=4)Qn.slerpFlat(s,0,r,l-o,r,l,a);return s}}class lr extends un{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new hc(this.times,this.values,this.getValueSize(),t)}}lr.prototype.ValueTypeName="quaternion";lr.prototype.InterpolantFactoryMethodSmooth=void 0;class _i extends un{constructor(t,e,n){super(t,e,n)}}_i.prototype.ValueTypeName="string";_i.prototype.ValueBufferType=Array;_i.prototype.DefaultInterpolation=2300;_i.prototype.InterpolantFactoryMethodLinear=void 0;_i.prototype.InterpolantFactoryMethodSmooth=void 0;class Ro extends un{constructor(t,e,n,i){super(t,e,n,i)}}Ro.prototype.ValueTypeName="vector";class sf{constructor(t="",e=-1,n=[],i=2500){if(this.name=t,this.tracks=n,this.duration=e,this.blendMode=i,this.uuid=Un(),this.userData={},this.duration<0)this.resetDuration()}static parse(t){let e=[],n=t.tracks,i=1/(t.fps||1);for(let r=0,o=n.length;r!==o;++r)e.push(pm(n[r]).scale(i));let s=new this(t.name,t.duration,e,t.blendMode);return s.uuid=t.uuid,s.userData=JSON.parse(t.userData||"{}"),s}static toJSON(t){let e=[],n=t.tracks,i={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode,userData:JSON.stringify(t.userData)};for(let s=0,r=n.length;s!==r;++s)e.push(un.toJSON(n[s]));return i}static CreateFromMorphTargetSequence(t,e,n,i){let s=e.length,r=[];for(let o=0;o<s;o++){let a=[],l=[];a.push((o+s-1)%s,o,(o+1)%s),l.push(0,1,0);let c=cm(a);if(a=Uh(a,1,c),l=Uh(l,1,c),!i&&a[0]===0)a.push(s),l.push(l[0]);r.push(new ar(".morphTargetInfluences["+e[o].name+"]",a,l).scale(1/n))}return new this(t,-1,r)}static findByName(t,e){let n=t;if(!Array.isArray(t)){let i=t;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===e)return n[i];return null}static CreateClipsFromMorphTargetSequences(t,e,n){let i={},s=/^([\w-]*?)([\d]+)$/;for(let o=0,a=t.length;o<a;o++){let l=t[o],c=l.name.match(s);if(c&&c.length>1){let u=c[1],f=i[u];if(!f)i[u]=f=[];f.push(l)}}let r=[];for(let o in i)r.push(this.CreateFromMorphTargetSequence(o,i[o],e,n));return r}resetDuration(){let t=this.tracks,e=0;for(let n=0,i=t.length;n!==i;++n){let s=this.tracks[n];e=Math.max(e,s.times[s.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){let t=[];for(let n=0;n<this.tracks.length;n++)t.push(this.tracks[n].clone());let e=new this.constructor(this.name,this.duration,t,this.blendMode);return e.userData=JSON.parse(JSON.stringify(this.userData)),e}toJSON(){return this.constructor.toJSON(this)}}function dm(t){switch(t.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return ar;case"vector":case"vector2":case"vector3":case"vector4":return Ro;case"color":return wo;case"quaternion":return lr;case"bool":case"boolean":return gi;case"string":return _i}throw Error("THREE.KeyframeTrack: Unsupported typeName: "+t)}function pm(t){if(t.type===void 0)throw Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=dm(t.type);if(t.times===void 0){let i=[],s=[];hm(t.keys,i,s,"value"),t.times=i,t.values=s}let n;if(e.parse!==void 0)n=e.parse(t);else n=new e(t.name,t.times,t.values,t.interpolation);if(Xs(t.settings))n.settings={inTangents:li(t.settings.inTangents,Float32Array),outTangents:li(t.settings.outTangents,Float32Array)};return n}var Pn={enabled:!1,files:{},add:function(t,e){if(this.enabled===!1)return;if(Bh(t))return;this.files[t]=e},get:function(t){if(this.enabled===!1)return;if(Bh(t))return;return this.files[t]},remove:function(t){delete this.files[t]},clear:function(){this.files={}}};function Bh(t){try{let e=t.slice(t.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch(e){return!1}}class uc{constructor(t,e,n){let i=this,s=!1,r=0,o=0,a=void 0,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(c){if(o++,s===!1){if(i.onStart!==void 0)i.onStart(c,r,o)}s=!0},this.itemEnd=function(c){if(r++,i.onProgress!==void 0)i.onProgress(c,r,o);if(r===o){if(s=!1,i.onLoad!==void 0)i.onLoad()}},this.itemError=function(c){if(i.onError!==void 0)i.onError(c)},this.resolveURL=function(c){if(c=c.normalize("NFC"),a)return a(c);return c},this.setURLModifier=function(c){return a=c,this},this.addHandler=function(c,u){return l.push(c,u),this},this.removeHandler=function(c){let u=l.indexOf(c);if(u!==-1)l.splice(u,2);return this},this.getHandler=function(c){for(let u=0,f=l.length;u<f;u+=2){let h=l[u],d=l[u+1];if(h.global)h.lastIndex=0;if(h.test(c))return d}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var rf=new uc;class xi{constructor(t){if(this.manager=t!==void 0?t:rf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,s){n.load(t,i,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}}xi.DEFAULT_MATERIAL_NAME="__DEFAULT";var Yn={};class of extends Error{constructor(t,e){super(t);this.response=e}}class fc extends xi{constructor(t){super(t);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(t,e,n,i){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let s=Pn.get(`file:${t}`);if(s!==void 0){this.manager.itemStart(t),setTimeout(()=>{if(e)e(s);this.manager.itemEnd(t)},0);return}if(Yn[t]!==void 0){Yn[t].push({onLoad:e,onProgress:n,onError:i});return}Yn[t]=[],Yn[t].push({onLoad:e,onProgress:n,onError:i});let r=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,a=this.responseType;fetch(r).then((l)=>{if(l.status===200||l.status===0){if(l.status===0)At("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let c=Yn[t],u=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),h=f?parseInt(f):0,d=h!==0,_=0,S=new ReadableStream({start(p){g();function g(){u.read().then(({done:x,value:M})=>{if(x)p.close();else{_+=M.byteLength;let y=new ProgressEvent("progress",{lengthComputable:d,loaded:_,total:h});for(let b=0,E=c.length;b<E;b++){let m=c[b];if(m.onProgress)m.onProgress(y)}p.enqueue(M),g()}},(x)=>{p.error(x)})}}});return new Response(S)}else throw new of(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then((l)=>{switch(a){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then((c)=>new DOMParser().parseFromString(c,o));case"json":return l.json();default:if(o==="")return l.text();else{let u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,h=new TextDecoder(f);return l.arrayBuffer().then((d)=>h.decode(d))}}}).then((l)=>{Pn.add(`file:${t}`,l);let c=Yn[t];delete Yn[t];for(let u=0,f=c.length;u<f;u++){let h=c[u];if(h.onLoad)h.onLoad(l)}}).catch((l)=>{let c=Yn[t];if(c===void 0)throw this.manager.itemError(t),l;delete Yn[t];for(let u=0,f=c.length;u<f;u++){let h=c[u];if(h.onError)h.onError(l)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class af extends xi{constructor(t){super(t)}load(t,e,n,i){let s=this,r=[],o=new Ql,a=new fc(this.manager);a.setPriority(this.priority),a.setCache(this.cache),a.setPath(this.path),a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setWithCredentials(s.withCredentials);let l=0;function c(u){a.load(t[u],function(f){let h=s.parse(f,!0);if(r[u]={width:h.width,height:h.height,format:h.format,mipmaps:h.mipmaps},l+=1,l===6){if(h.mipmapCount===1)o.minFilter=1006;if(o.image=r,o.format=h.format,o.needsUpdate=!0,e)e(o)}},n,i)}if(Array.isArray(t))for(let u=0,f=t.length;u<f;++u)c(u);else a.load(t,function(u){let f=s.parse(u,!0);if(f.isCubemap){let h=f.mipmaps.length/f.mipmapCount;for(let d=0;d<h;d++){r[d]={mipmaps:[]};for(let _=0;_<f.mipmapCount;_++)r[d].mipmaps.push(f.mipmaps[d*f.mipmapCount+_]),r[d].format=f.format,r[d].width=f.width,r[d].height=f.height}o.image=r}else o.image.width=f.width,o.image.height=f.height,o.mipmaps=f.mipmaps;if(f.mipmapCount===1)o.minFilter=1006;if(o.format=f.format,o.needsUpdate=!0,e)e(o)},n,i);return o}}var rs=new WeakMap;class dc extends xi{constructor(t){super(t)}load(t,e,n,i){if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let s=this,r=Pn.get(`image:${t}`);if(r!==void 0){if(r.complete===!0)s.manager.itemStart(t),setTimeout(function(){if(e)e(r);s.manager.itemEnd(t)},0);else{let u=rs.get(r);if(u===void 0)u=[],rs.set(r,u);u.push({onLoad:e,onError:i})}return r}let o=fs("img");function a(){if(c(),e)e(this);let u=rs.get(this)||[];for(let f=0;f<u.length;f++){let h=u[f];if(h.onLoad)h.onLoad(this)}rs.delete(this),s.manager.itemEnd(t)}function l(u){if(c(),i)i(u);Pn.remove(`image:${t}`);let f=rs.get(this)||[];for(let h=0;h<f.length;h++){let d=f[h];if(d.onError)d.onError(u)}rs.delete(this),s.manager.itemError(t),s.manager.itemEnd(t)}function c(){o.removeEventListener("load",a,!1),o.removeEventListener("error",l,!1)}if(o.addEventListener("load",a,!1),o.addEventListener("error",l,!1),t.slice(0,5)!=="data:"){if(this.crossOrigin!==void 0)o.crossOrigin=this.crossOrigin}return Pn.add(`image:${t}`,o),s.manager.itemStart(t),o.fetchPriority=this.priority,o.src=t,o}}class lf extends xi{constructor(t){super(t)}load(t,e,n,i){let s=new we,r=new dc(this.manager);return r.setPriority(this.priority),r.setCache(this.cache),r.setCrossOrigin(this.crossOrigin),r.setPath(this.path),r.load(t,function(o){if(s.image=o,s.needsUpdate=!0,e!==void 0)e(s)},n,i),s}}class Hi extends _e{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super();this.isLight=!0,this.type="Light",this.color=new Dt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}}class cf extends Hi{constructor(t,e,n){super(t,n);this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Dt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}}var Na=new wt,zh=new N,Gh=new N;class cr{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Lt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new wt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hi,this._frameExtents=new Lt(1,1),this._viewportCount=1,this._viewports=[new oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;zh.setFromMatrixPosition(t.matrixWorld),e.position.copy(zh),Gh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Gh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,i){Na.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Na,t.coordinateSystem,t.reversedDepth);let s=this._frameExtents,r=i?i.z/s.x:1,o=i?i.w/s.y:1,a=i?i.x/s.x:0,l=i?i.y/s.y:0;if(t.coordinateSystem===2001||t.reversedDepth)e.set(0.5*r,0,0,0.5*r+a,0,0.5*o,0,0.5*o+l,0,0,1,0,0,0,0,1);else e.set(0.5*r,0,0,0.5*r+a,0,0.5*o,0,0.5*o+l,0,0,0.5,0.5,0,0,0,1);e.multiply(Na)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}var jr=new N,to=new Qn,In=new N;class Co extends _e{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new wt,this.projectionMatrix=new wt,this.projectionMatrixInverse=new wt,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){if(super.updateMatrixWorld(t),this.matrixWorld.decompose(jr,to,In),In.x===1&&In.y===1&&In.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(jr,to,In.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){if(super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(jr,to,In),In.x===1&&In.y===1&&In.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(jr,to,In.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var ai=new N,kh=new Lt,Hh=new Lt;class on extends Co{constructor(t=50,e=1,n=0.1,i=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=0.5*this.getFilmHeight()/t;this.fov=Li*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(qs*0.5*this.fov);return 0.5*this.getFilmHeight()/t}getEffectiveFOV(){return Li*2*Math.atan(Math.tan(qs*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ai.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),e.set(ai.x,ai.y).multiplyScalar(-t/ai.z),ai.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),n.set(ai.x,ai.y).multiplyScalar(-t/ai.z)}getViewSize(t,e){return this.getViewBounds(t,kh,Hh),e.subVectors(Hh,kh)}setViewOffset(t,e,n,i,s,r){if(this.aspect=t/e,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(qs*0.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,s=-0.5*i,r=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:a,fullHeight:l}=r;s+=r.offsetX*i/a,e-=r.offsetY*n/l,i*=r.width/a,n*=r.height/l}let o=this.filmOffset;if(o!==0)s+=t*o/this.getFilmWidth();this.projectionMatrix.makePerspective(s,s+i,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null)e.object.view=Object.assign({},this.view);return e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}class hf extends cr{constructor(){super(new on(50,1,0.5,500));this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=Li*2*t.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,s=t.distance||e.far;if(n!==e.fov||i!==e.aspect||s!==e.far)e.fov=n,e.aspect=i,e.far=s,e.updateProjectionMatrix();super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}}class uf extends Hi{constructor(t,e,n=0,i=Math.PI/3,s=0,r=2){super(t,e);this.isSpotLight=!0,this.type="SpotLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.distance=n,this.angle=i,this.penumbra=s,this.decay=r,this.map=null,this.shadow=new hf}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);if(e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture)e.object.map=this.map.toJSON(t).uuid;return e.object.shadow=this.shadow.toJSON(),e}}class ff extends cr{constructor(){super(new on(90,1,0.5,500));this.isPointLightShadow=!0}}class df extends Hi{constructor(t,e,n=0,i=2){super(t,e);this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new ff}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}}class Io extends Co{constructor(t=-1,e=1,n=1,i=-1,s=0.1,r=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=s,this.far=r,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,s,r){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=s,this.view.height=r,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2,s=n-t,r=n+t,o=i+e,a=i-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,c=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,r=s+l*this.view.width,o-=c*this.view.offsetY,a=o-c*this.view.height}this.projectionMatrix.makeOrthographic(s,r,o,a,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);if(e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null)e.object.view=Object.assign({},this.view);return e}}class pf extends cr{constructor(){super(new Io(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class mf extends Hi{constructor(t,e){super(t,e);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.shadow=new pf}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}}class gf extends Hi{constructor(t,e){super(t,e);this.isAmbientLight=!0,this.type="AmbientLight"}}class _f{static extractUrlBase(t){let e=t.lastIndexOf("/");if(e===-1)return"./";return t.slice(0,e+1)}static resolveURL(t,e){if(typeof t!=="string"||t==="")return"";if(/^https?:\/\//i.test(e)&&/^\//.test(t))e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1");if(/^(https?:)?\/\//i.test(t))return t;if(/^data:.*,.*$/i.test(t))return t;if(/^blob:.*$/i.test(t))return t;return e+t}}var Da=new WeakMap;class xf extends xi{constructor(t){super(t);if(this.isImageBitmapLoader=!0,typeof createImageBitmap>"u")At("ImageBitmapLoader: createImageBitmap() not supported.");if(typeof fetch>"u")At("ImageBitmapLoader: fetch() not supported.");this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(t){return this.options=t,this}load(t,e,n,i){if(t===void 0)t="";if(this.path!==void 0)t=this.path+t;t=this.manager.resolveURL(t);let s=this,r=Pn.get(`image-bitmap:${t}`);if(r!==void 0){if(s.manager.itemStart(t),r.then){r.then((l)=>{if(Da.has(r)===!0){if(i)i(Da.get(r));s.manager.itemError(t),s.manager.itemEnd(t)}else{if(e)e(l);s.manager.itemEnd(t)}});return}setTimeout(function(){if(e)e(r);s.manager.itemEnd(t)},0);return}let o={};o.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",o.headers=this.requestHeader,o.priority=this.priority,o.cache=this.cache,o.signal=typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let a=fetch(t,o).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign({},s.options,{colorSpaceConversion:"none"}))}).then(function(l){if(Pn.add(`image-bitmap:${t}`,l),e)e(l);return s.manager.itemEnd(t),l}).catch(function(l){if(i)i(l);Da.set(a,l),Pn.remove(`image-bitmap:${t}`),s.manager.itemError(t),s.manager.itemEnd(t)});Pn.add(`image-bitmap:${t}`,a),s.manager.itemStart(t)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}var os=-90,as=1;class hr extends _e{constructor(t,e,n){super();this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let i=new on(os,as,t,e);i.layers=this.layers,this.add(i);let s=new on(os,as,t,e);s.layers=this.layers,this.add(s);let r=new on(os,as,t,e);r.layers=this.layers,this.add(r);let o=new on(os,as,t,e);o.layers=this.layers,this.add(o);let a=new on(os,as,t,e);a.layers=this.layers,this.add(a);let l=new on(os,as,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,i,s,r,o,a]=e;for(let l of e)this.remove(l);if(t===2000)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),r.up.set(0,0,1),r.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),a.up.set(0,1,0),a.lookAt(0,0,-1);else if(t===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),r.up.set(0,0,-1),r.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),a.up.set(0,-1,0),a.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:i}=this;if(this.coordinateSystem!==t.coordinateSystem)this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem();let[s,r,o,a,l,c]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),h=t.getActiveMipmapLevel(),d=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let S=!1;if(t.isWebGLRenderer===!0)S=t.state.buffers.depth.getReversed();else S=t.reversedDepthBuffer;if(t.setRenderTarget(n,0,i),S&&t.autoClear===!1)t.clearDepth();if(t.render(e,s),t.setRenderTarget(n,1,i),S&&t.autoClear===!1)t.clearDepth();if(t.render(e,r),t.setRenderTarget(n,2,i),S&&t.autoClear===!1)t.clearDepth();if(t.render(e,o),t.setRenderTarget(n,3,i),S&&t.autoClear===!1)t.clearDepth();if(t.render(e,a),t.setRenderTarget(n,4,i),S&&t.autoClear===!1)t.clearDepth();if(t.render(e,l),n.texture.mipmapsAutoUpdate=_,t.setRenderTarget(n,5,i),S&&t.autoClear===!1)t.clearDepth();t.render(e,c),t.setRenderTarget(u,f,h),t.xr.enabled=d,n.texture.needsPMREMUpdate=!0}}class pc extends on{constructor(t=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}}var mc="\\[\\]\\.:\\/",mm=new RegExp("["+mc+"]","g"),gc="[^"+mc+"]",gm="[^"+mc.replace("\\.","")+"]",_m=/((?:WC+[\/:])*)/.source.replace("WC",gc),xm=/(WCOD+)?/.source.replace("WCOD",gm),ym=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",gc),vm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",gc),Sm=new RegExp("^"+_m+xm+ym+vm+"$"),Mm=["material","materials","bones","map"];class yf{constructor(t,e,n){let i=n||ie.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];if(i!==void 0)i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,s=n.length;i!==s;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}}class ie{constructor(t,e,n){this.path=e,this.parsedPath=n||ie.parseTrackName(e),this.node=ie.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){if(!(t&&t.isAnimationObjectGroup))return new ie(t,e,n);else return new ie.Composite(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(mm,"")}static parseTrackName(t){let e=Sm.exec(t);if(e===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let s=n.nodeName.substring(i+1);if(Mm.indexOf(s)!==-1)n.nodeName=n.nodeName.substring(0,i),n.objectName=s}if(n.propertyName===null||n.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(s){for(let r=0;r<s.length;r++){let o=s[r];if(o.name===e||o.uuid===e)return o;let a=n(o.children);if(a)return a}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,s=n.length;i!==s;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,s=e.propertyIndex;if(!t)t=ie.findNode(this.rootNode,e.nodeName),this.node=t;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){At("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Nt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Nt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let c=0;c<t.length;c++)if(t[c].name===l){l=c;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Nt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Nt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){Nt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let r=t[i];if(r===void 0){let l=e.nodeName;Nt("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",t);return}let o=this.Versioning.None;if(this.targetObject=t,t.isMaterial===!0)o=this.Versioning.NeedsUpdate;else if(t.isObject3D===!0)o=this.Versioning.MatrixWorldNeedsUpdate;let a=this.BindingType.Direct;if(s!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(t.morphTargetDictionary[s]!==void 0)s=t.morphTargetDictionary[s]}a=this.BindingType.ArrayElement,this.resolvedProperty=r,this.propertyIndex=s}else if(r.fromArray!==void 0&&r.toArray!==void 0)a=this.BindingType.HasFromToArray,this.resolvedProperty=r;else if(Array.isArray(r))a=this.BindingType.EntireArray,this.resolvedProperty=r;else this.propertyName=i;this.getValue=this.GetterByBindingType[a],this.setValue=this.SetterByBindingTypeAndVersioning[a][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ie.Composite=yf;ie.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ie.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ie.prototype.GetterByBindingType=[ie.prototype._getValue_direct,ie.prototype._getValue_array,ie.prototype._getValue_arrayElement,ie.prototype._getValue_toArray];ie.prototype.SetterByBindingTypeAndVersioning=[[ie.prototype._setValue_direct,ie.prototype._setValue_direct_setNeedsUpdate,ie.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ie.prototype._setValue_array,ie.prototype._setValue_array_setNeedsUpdate,ie.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ie.prototype._setValue_arrayElement,ie.prototype._setValue_arrayElement_setNeedsUpdate,ie.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ie.prototype._setValue_fromArray,ie.prototype._setValue_fromArray_setNeedsUpdate,ie.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Gy=new Float32Array(1);var Vh=new wt;class vf{constructor(t,e,n=0,i=1/0){this.ray=new jn(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new er,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){if(e.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,0.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e;else if(e.isOrthographicCamera)this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e;else Nt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Vh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Vh),this}intersectObject(t,e=!0,n=[]){return Oa(t,this,n,e),n.sort(Wh),n}intersectObjects(t,e=!0,n=[]){for(let i=0,s=t.length;i<s;i++)Oa(t[i],this,n,e);return n.sort(Wh),n}}function Wh(t,e){return t.distance-e.distance}function Oa(t,e,n,i){let s=!0;if(t.layers.test(e.layers)){if(t.raycast(e,n)===!1)s=!1}if(s===!0&&i===!0){let r=t.children;for(let o=0,a=r.length;o<a;o++)Oa(r[o],e,n,!0)}}class Sf{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Ut(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){if(this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(t,n),this.phi=Math.acos(Ut(e/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class Mf{static{this.prototype.isMatrix2=!0}constructor(t,e,n,i){if(this.elements=[1,0,0,1],t!==void 0)this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let s=this.elements;return s[0]=t,s[2]=e,s[1]=n,s[3]=i,this}}var Xh=new N,eo=new N,ls=new N,cs=new N,Ua=new N,bm=new N,Tm=new N;class an{constructor(t=new N,e=new N){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Xh.subVectors(t,this.start),eo.subVectors(this.end,this.start);let n=eo.dot(eo);if(n===0)return 0;let s=eo.dot(Xh)/n;if(e)s=Ut(s,0,1);return s}closestPointToPoint(t,e,n){let i=this.closestPointToPointParameter(t,e);return this.delta(n).multiplyScalar(i).add(this.start)}distanceSqToLine3(t,e=bm,n=Tm){let s,r,o=this.start,a=t.start,l=this.end,c=t.end;ls.subVectors(l,o),cs.subVectors(c,a),Ua.subVectors(o,a);let u=ls.dot(ls),f=cs.dot(cs),h=cs.dot(Ua);if(u<=0.00000000000000010000000000000001&&f<=0.00000000000000010000000000000001)return e.copy(o),n.copy(a),e.distanceToSquared(n);if(u<=0.00000000000000010000000000000001)s=0,r=h/f,r=Ut(r,0,1);else{let d=ls.dot(Ua);if(f<=0.00000000000000010000000000000001)r=0,s=Ut(-d/u,0,1);else{let _=ls.dot(cs),S=u*f-_*_;if(S!==0)s=Ut((_*h-d*f)/S,0,1);else s=0;if(r=(_*s+h)/f,r<0)r=0,s=Ut(-d/u,0,1);else if(r>1)r=1,s=Ut((_-d)/u,0,1)}}return e.copy(o).addScaledVector(ls,s),n.copy(a).addScaledVector(cs,r),e.distanceToSquared(n)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class bf extends xs{constructor(t,e=16776960){let n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],s=new Be;s.setIndex(new Ae(n,1)),s.setAttribute("position",new Ee(i,3));super(s,new Mo({color:e,toneMapped:!1}));this.box=t,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(t){let e=this.box;if(e.isEmpty())return;e.getCenter(this.position),e.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(t)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}class Tf extends Dn{constructor(t,e=null){super();this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(this.domElement!==null)this.disconnect();this.domElement=t}disconnect(){}dispose(){}update(){}}function _c(t,e,n,i){let s=Am(i);switch(n){case 1021:return t*e;case 1028:return t*e/s.components*s.byteLength;case 1029:return t*e/s.components*s.byteLength;case 1030:return t*e*2/s.components*s.byteLength;case 1031:return t*e*2/s.components*s.byteLength;case 1022:return t*e*3/s.components*s.byteLength;case 1023:return t*e*4/s.components*s.byteLength;case 1033:return t*e*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(t,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(t,8)*Math.max(e,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((t+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((t+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((t+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((t+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((t+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((t+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((t+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((t+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((t+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((t+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((t+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((t+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((t+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((t+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(t/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(t/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(t/4)*Math.ceil(e/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Am(t){switch(t){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${t}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)At("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function qf(){let t=null,e=!1,n=null,i=null;function s(r,o){i=t.requestAnimationFrame(s),n(r,o)}return{start:function(){if(e===!0)return;if(n===null)return;if(t===null)return;i=t.requestAnimationFrame(s),e=!0},stop:function(){if(t!==null)t.cancelAnimationFrame(i);e=!1},setAnimationLoop:function(r){n=r},setContext:function(r){t=r}}}function Em(t){let e=new WeakMap;function n(a,l){let{array:c,usage:u}=a,f=c.byteLength,h=t.createBuffer();t.bindBuffer(l,h),t.bufferData(l,c,u),a.onUploadCallback();let d;if(c instanceof Float32Array)d=t.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=t.HALF_FLOAT;else if(c instanceof Uint16Array)if(a.isFloat16BufferAttribute)d=t.HALF_FLOAT;else d=t.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=t.SHORT;else if(c instanceof Uint32Array)d=t.UNSIGNED_INT;else if(c instanceof Int32Array)d=t.INT;else if(c instanceof Int8Array)d=t.BYTE;else if(c instanceof Uint8Array)d=t.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=t.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:f}}function i(a,l,c){let{array:u,updateRanges:f}=l;if(t.bindBuffer(c,a),f.length===0)t.bufferSubData(c,0,u);else{f.sort((d,_)=>d.start-_.start);let h=0;for(let d=1;d<f.length;d++){let _=f[h],S=f[d];if(S.start<=_.start+_.count+1)_.count=Math.max(_.count,S.start+S.count-_.start);else++h,f[h]=S}f.length=h+1;for(let d=0,_=f.length;d<_;d++){let S=f[d];t.bufferSubData(c,S.start*u.BYTES_PER_ELEMENT,u,S.start,S.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){if(a.isInterleavedBufferAttribute)a=a.data;return e.get(a)}function r(a){if(a.isInterleavedBufferAttribute)a=a.data;let l=e.get(a);if(l)t.deleteBuffer(l.buffer),e.delete(a)}function o(a,l){if(a.isInterleavedBufferAttribute)a=a.data;if(a.isGLBufferAttribute){let u=e.get(a);if(!u||u.version<a.version)e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,n(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var wm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Rm=`#ifdef USE_ALPHAHASH
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
#endif`,Cm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Im=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Pm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Lm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Nm=`#ifdef USE_AOMAP
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
#endif`,Dm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Um=`#ifdef USE_BATCHING
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
#endif`,Fm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Om=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,zm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Gm=`#ifdef USE_IRIDESCENCE
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
#endif`,km=`#ifdef USE_BUMPMAP
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
#endif`,Hm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Vm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Wm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Xm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,qm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ym=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Zm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Jm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,$m=`#define PI 3.141592653589793
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
} // validated`,Km=`vec3 transformedNormal = objectNormal;
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
#endif`,Qm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,jm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,tg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,eg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ng="gl_FragColor = linearToOutputTexel( gl_FragColor );",ig=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,sg=`#ifdef USE_ENVMAP
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
#endif`,rg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,og=`#ifdef USE_ENVMAP
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
#endif`,ag=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,lg=`#ifdef USE_ENVMAP
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
#endif`,cg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,hg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,ug=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,dg=`#ifdef USE_GRADIENTMAP
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
}`,pg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,mg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,gg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,_g=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,xg=`#ifdef USE_ENVMAP
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
#endif`,yg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Sg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Mg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,bg=`PhysicalMaterial material;
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
#endif`,Tg=`uniform sampler2D dfgLUT;
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
}`,Ag=`
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
#endif`,Eg=`#if defined( RE_IndirectDiffuse )
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
#endif`,wg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Rg=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Cg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ig=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Pg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Lg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ng=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Dg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ug=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Fg=`#if defined( USE_POINTS_UV )
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
#endif`,Og=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Gg=`#if defined( USE_MORPHCOLORS )
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
#endif`,kg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Hg=`#ifdef USE_MORPHTARGETS
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
#endif`,Vg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Wg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Xg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,qg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Yg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Zg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Jg=`#ifdef USE_NORMALMAP
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
#endif`,$g=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Kg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,jg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,t_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,e_=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,n_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,i_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,s_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,r_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,o_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,a_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,l_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,c_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,h_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,u_=`float getShadowMask() {
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
}`,f_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,d_=`#ifdef USE_SKINNING
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
#endif`,p_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,m_=`#ifdef USE_SKINNING
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
#endif`,g_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,__=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,x_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,y_=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,v_=`#ifdef USE_TRANSMISSION
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
#endif`,S_=`#ifdef USE_TRANSMISSION
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
#endif`,M_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,b_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,T_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,A_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,E_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,w_=`uniform sampler2D t2D;
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
}`,R_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,C_=`uniform float backgroundBlurriness;
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
}`,I_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,P_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,L_=`#include <common>
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
}`,N_=`#if DEPTH_PACKING == 3200
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
}`,D_=`#define DISTANCE
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
}`,U_=`#define DISTANCE
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
}`,F_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,O_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,B_=`uniform float scale;
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
}`,z_=`uniform vec3 diffuse;
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
}`,G_=`#include <common>
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
}`,k_=`uniform vec3 diffuse;
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
}`,H_=`#define LAMBERT
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
}`,V_=`#define LAMBERT
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
}`,W_=`#define MATCAP
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
}`,X_=`#define MATCAP
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
}`,q_=`#define NORMAL
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
}`,Y_=`#define NORMAL
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
}`,Z_=`#define PHONG
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
}`,J_=`#define PHONG
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
}`,$_=`#define STANDARD
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
}`,K_=`#define STANDARD
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
}`,Q_=`#define TOON
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
}`,j_=`#define TOON
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
}`,t0=`uniform float size;
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
}`,e0=`uniform vec3 diffuse;
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
}`,n0=`#include <common>
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
}`,i0=`uniform vec3 color;
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
}`,s0=`uniform float rotation;
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
}`,r0=`uniform vec3 diffuse;
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
}`,Ht={alphahash_fragment:wm,alphahash_pars_fragment:Rm,alphamap_fragment:Cm,alphamap_pars_fragment:Im,alphatest_fragment:Pm,alphatest_pars_fragment:Lm,aomap_fragment:Nm,aomap_pars_fragment:Dm,batching_pars_vertex:Um,batching_vertex:Fm,begin_vertex:Om,beginnormal_vertex:Bm,bsdfs:zm,iridescence_fragment:Gm,bumpmap_pars_fragment:km,clipping_planes_fragment:Hm,clipping_planes_pars_fragment:Vm,clipping_planes_pars_vertex:Wm,clipping_planes_vertex:Xm,color_fragment:qm,color_pars_fragment:Ym,color_pars_vertex:Zm,color_vertex:Jm,common:$m,defaultnormal_vertex:Km,displacementmap_pars_vertex:Qm,displacementmap_vertex:jm,emissivemap_fragment:tg,emissivemap_pars_fragment:eg,colorspace_fragment:ng,colorspace_pars_fragment:ig,envmap_fragment:sg,envmap_common_pars_fragment:rg,envmap_pars_fragment:og,envmap_pars_vertex:ag,envmap_physical_pars_fragment:xg,envmap_vertex:lg,fog_vertex:cg,fog_pars_vertex:hg,fog_fragment:ug,fog_pars_fragment:fg,gradientmap_pars_fragment:dg,lightmap_pars_fragment:pg,lights_lambert_fragment:mg,lights_lambert_pars_fragment:gg,lights_pars_begin:_g,lights_toon_fragment:yg,lights_toon_pars_fragment:vg,lights_phong_fragment:Sg,lights_phong_pars_fragment:Mg,lights_physical_fragment:bg,lights_physical_pars_fragment:Tg,lights_fragment_begin:Ag,lights_fragment_maps:Eg,lights_fragment_end:wg,lightprobes_pars_fragment:Rg,logdepthbuf_fragment:Cg,logdepthbuf_pars_fragment:Ig,logdepthbuf_pars_vertex:Pg,logdepthbuf_vertex:Lg,map_fragment:Ng,map_pars_fragment:Dg,map_particle_fragment:Ug,map_particle_pars_fragment:Fg,metalnessmap_fragment:Og,metalnessmap_pars_fragment:Bg,morphinstance_vertex:zg,morphcolor_vertex:Gg,morphnormal_vertex:kg,morphtarget_pars_vertex:Hg,morphtarget_vertex:Vg,normal_fragment_begin:Wg,normal_fragment_maps:Xg,normal_pars_fragment:qg,normal_pars_vertex:Yg,normal_vertex:Zg,normalmap_pars_fragment:Jg,clearcoat_normal_fragment_begin:$g,clearcoat_normal_fragment_maps:Kg,clearcoat_pars_fragment:Qg,iridescence_pars_fragment:jg,opaque_fragment:t_,packing:e_,premultiplied_alpha_fragment:n_,project_vertex:i_,dithering_fragment:s_,dithering_pars_fragment:r_,roughnessmap_fragment:o_,roughnessmap_pars_fragment:a_,shadowmap_pars_fragment:l_,shadowmap_pars_vertex:c_,shadowmap_vertex:h_,shadowmask_pars_fragment:u_,skinbase_vertex:f_,skinning_pars_vertex:d_,skinning_vertex:p_,skinnormal_vertex:m_,specularmap_fragment:g_,specularmap_pars_fragment:__,tonemapping_fragment:x_,tonemapping_pars_fragment:y_,transmission_fragment:v_,transmission_pars_fragment:S_,uv_pars_fragment:M_,uv_pars_vertex:b_,uv_vertex:T_,worldpos_vertex:A_,background_vert:E_,background_frag:w_,backgroundCube_vert:R_,backgroundCube_frag:C_,cube_vert:I_,cube_frag:P_,depth_vert:L_,depth_frag:N_,distance_vert:D_,distance_frag:U_,equirect_vert:F_,equirect_frag:O_,linedashed_vert:B_,linedashed_frag:z_,meshbasic_vert:G_,meshbasic_frag:k_,meshlambert_vert:H_,meshlambert_frag:V_,meshmatcap_vert:W_,meshmatcap_frag:X_,meshnormal_vert:q_,meshnormal_frag:Y_,meshphong_vert:Z_,meshphong_frag:J_,meshphysical_vert:$_,meshphysical_frag:K_,meshtoon_vert:Q_,meshtoon_frag:j_,points_vert:t0,points_frag:e0,shadow_vert:n0,shadow_frag:i0,sprite_vert:s0,sprite_frag:r0},dt={common:{diffuse:{value:new Dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ft}},envmap:{envMap:{value:null},envMapRotation:{value:new Ft},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ft},normalScale:{value:new Lt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new Dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0},uvTransform:{value:new Ft}},sprite:{diffuse:{value:new Dt(16777215)},opacity:{value:1},center:{value:new Lt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}}},On={basic:{uniforms:Ze([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.fog]),vertexShader:Ht.meshbasic_vert,fragmentShader:Ht.meshbasic_frag},lambert:{uniforms:Ze([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Dt(0)},envMapIntensity:{value:1}}]),vertexShader:Ht.meshlambert_vert,fragmentShader:Ht.meshlambert_frag},phong:{uniforms:Ze([dt.common,dt.specularmap,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,dt.lights,{emissive:{value:new Dt(0)},specular:{value:new Dt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphong_vert,fragmentShader:Ht.meshphong_frag},standard:{uniforms:Ze([dt.common,dt.envmap,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.roughnessmap,dt.metalnessmap,dt.fog,dt.lights,{emissive:{value:new Dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag},toon:{uniforms:Ze([dt.common,dt.aomap,dt.lightmap,dt.emissivemap,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.gradientmap,dt.fog,dt.lights,{emissive:{value:new Dt(0)}}]),vertexShader:Ht.meshtoon_vert,fragmentShader:Ht.meshtoon_frag},matcap:{uniforms:Ze([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,dt.fog,{matcap:{value:null}}]),vertexShader:Ht.meshmatcap_vert,fragmentShader:Ht.meshmatcap_frag},points:{uniforms:Ze([dt.points,dt.fog]),vertexShader:Ht.points_vert,fragmentShader:Ht.points_frag},dashed:{uniforms:Ze([dt.common,dt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ht.linedashed_vert,fragmentShader:Ht.linedashed_frag},depth:{uniforms:Ze([dt.common,dt.displacementmap]),vertexShader:Ht.depth_vert,fragmentShader:Ht.depth_frag},normal:{uniforms:Ze([dt.common,dt.bumpmap,dt.normalmap,dt.displacementmap,{opacity:{value:1}}]),vertexShader:Ht.meshnormal_vert,fragmentShader:Ht.meshnormal_frag},sprite:{uniforms:Ze([dt.sprite,dt.fog]),vertexShader:Ht.sprite_vert,fragmentShader:Ht.sprite_frag},background:{uniforms:{uvTransform:{value:new Ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ht.background_vert,fragmentShader:Ht.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ft}},vertexShader:Ht.backgroundCube_vert,fragmentShader:Ht.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ht.cube_vert,fragmentShader:Ht.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ht.equirect_vert,fragmentShader:Ht.equirect_frag},distance:{uniforms:Ze([dt.common,dt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:Ht.distance_vert,fragmentShader:Ht.distance_frag},shadow:{uniforms:Ze([dt.lights,dt.fog,{color:{value:new Dt(0)},opacity:{value:1}}]),vertexShader:Ht.shadow_vert,fragmentShader:Ht.shadow_frag}};On.physical={uniforms:Ze([On.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ft},clearcoatNormalScale:{value:new Lt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ft},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ft},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ft},sheen:{value:0},sheenColor:{value:new Dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ft},transmissionSamplerSize:{value:new Lt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ft},attenuationDistance:{value:0},attenuationColor:{value:new Dt(0)},specularColor:{value:new Dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ft},anisotropyVector:{value:new Lt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ft}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag};var Po={r:0,b:0,g:0},o0=new wt,Yf=new Ft;Yf.set(-1,0,0,0,1,0,0,0,1);function a0(t,e,n,i,s,r){let o=new Dt(0),a=s===!0?0:1,l,c,u=null,f=0,h=null;function d(x){let M=x.isScene===!0?x.background:null;if(M&&M.isTexture){let y=x.backgroundBlurriness>0;M=e.get(M,y)}return M}function _(x){let M=!1,y=d(x);if(y===null)p(o,a);else if(y&&y.isColor)p(y,1),M=!0;let b=t.xr.getEnvironmentBlendMode();if(b==="additive")n.buffers.color.setClear(0,0,0,1,r);else if(b==="alpha-blend")n.buffers.color.setClear(0,0,0,0,r);if(t.autoClear||M)n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil)}function S(x,M){let y=d(M);if(y&&y.isCubeTexture){if(c===void 0)c=new Ue(new ys(1,1,1),new ti({name:"BackgroundCubeMaterial",uniforms:Gi(On.backgroundCube.uniforms),vertexShader:On.backgroundCube.vertexShader,fragmentShader:On.backgroundCube.fragmentShader,side:Ye,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,E,m){this.matrixWorld.copyPosition(m.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c);if(c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(o0.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isRenderTargetTexture===!1)c.material.uniforms.backgroundRotation.value.premultiply(Yf);if(c.material.toneMapped=Vt.getTransfer(y.colorSpace)!==he,u!==y||f!==y.version||h!==t.toneMapping)c.material.needsUpdate=!0,u=y,f=y.version,h=t.toneMapping;c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)}else if(y&&y.isTexture){if(l===void 0)l=new Ue(new or(2,2),new ti({name:"BackgroundMaterial",uniforms:Gi(On.background.uniforms),vertexShader:On.background.vertexShader,fragmentShader:On.background.fragmentShader,side:Jn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l);if(l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=Vt.getTransfer(y.colorSpace)!==he,y.matrixAutoUpdate===!0)y.updateMatrix();if(l.material.uniforms.uvTransform.value.copy(y.matrix),u!==y||f!==y.version||h!==t.toneMapping)l.material.needsUpdate=!0,u=y,f=y.version,h=t.toneMapping;l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)}}function p(x,M){x.getRGB(Po,ec(t)),n.buffers.color.setClear(Po.r,Po.g,Po.b,M,r)}function g(){if(c!==void 0)c.geometry.dispose(),c.material.dispose(),c=void 0;if(l!==void 0)l.geometry.dispose(),l.material.dispose(),l=void 0}return{getClearColor:function(){return o},setClearColor:function(x,M=1){o.set(x),a=M,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(o,a)},render:_,addToRenderList:S,dispose:g}}function l0(t,e){let n=t.getParameter(t.MAX_VERTEX_ATTRIBS),i={},s=h(null),r=s,o=!1;function a(R,L,F,C,B){let W=!1,z=f(R,C,F,L);if(r!==z)r=z,c(r.object);if(W=d(R,C,F,B),W)_(R,C,F,B);if(B!==null)e.update(B,t.ELEMENT_ARRAY_BUFFER);if(W||o){if(o=!1,y(R,L,F,C),B!==null)t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,e.get(B).buffer)}}function l(){return t.createVertexArray()}function c(R){return t.bindVertexArray(R)}function u(R){return t.deleteVertexArray(R)}function f(R,L,F,C){let B=C.wireframe===!0,W=i[L.id];if(W===void 0)W={},i[L.id]=W;let z=R.isInstancedMesh===!0?R.id:0,st=W[z];if(st===void 0)st={},W[z]=st;let q=st[F.id];if(q===void 0)q={},st[F.id]=q;let Q=q[B];if(Q===void 0)Q=h(l()),q[B]=Q;return Q}function h(R){let L=[],F=[],C=[];for(let B=0;B<n;B++)L[B]=0,F[B]=0,C[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:F,attributeDivisors:C,object:R,attributes:{},index:null}}function d(R,L,F,C){let B=r.attributes,W=L.attributes,z=0,st=F.getAttributes();for(let q in st)if(st[q].location>=0){let et=B[q],xt=W[q];if(xt===void 0){if(q==="instanceMatrix"&&R.instanceMatrix)xt=R.instanceMatrix;if(q==="instanceColor"&&R.instanceColor)xt=R.instanceColor}if(et===void 0)return!0;if(et.attribute!==xt)return!0;if(xt&&et.data!==xt.data)return!0;z++}if(r.attributesNum!==z)return!0;if(r.index!==C)return!0;return!1}function _(R,L,F,C){let B={},W=L.attributes,z=0,st=F.getAttributes();for(let q in st)if(st[q].location>=0){let et=W[q];if(et===void 0){if(q==="instanceMatrix"&&R.instanceMatrix)et=R.instanceMatrix;if(q==="instanceColor"&&R.instanceColor)et=R.instanceColor}let xt={};if(xt.attribute=et,et&&et.data)xt.data=et.data;B[q]=xt,z++}r.attributes=B,r.attributesNum=z,r.index=C}function S(){let R=r.newAttributes;for(let L=0,F=R.length;L<F;L++)R[L]=0}function p(R){g(R,0)}function g(R,L){let{newAttributes:F,enabledAttributes:C,attributeDivisors:B}=r;if(F[R]=1,C[R]===0)t.enableVertexAttribArray(R),C[R]=1;if(B[R]!==L)t.vertexAttribDivisor(R,L),B[R]=L}function x(){let{newAttributes:R,enabledAttributes:L}=r;for(let F=0,C=L.length;F<C;F++)if(L[F]!==R[F])t.disableVertexAttribArray(F),L[F]=0}function M(R,L,F,C,B,W,z){if(z===!0)t.vertexAttribIPointer(R,L,F,B,W);else t.vertexAttribPointer(R,L,F,C,B,W)}function y(R,L,F,C){S();let B=C.attributes,W=F.getAttributes(),z=L.defaultAttributeValues;for(let st in W){let q=W[st];if(q.location>=0){let Q=B[st];if(Q===void 0){if(st==="instanceMatrix"&&R.instanceMatrix)Q=R.instanceMatrix;if(st==="instanceColor"&&R.instanceColor)Q=R.instanceColor}if(Q!==void 0){let{normalized:et,itemSize:xt}=Q,K=e.get(Q);if(K===void 0)continue;let{buffer:nt,type:_t,bytesPerElement:Rt}=K,It=_t===t.INT||_t===t.UNSIGNED_INT||Q.gpuType===$a;if(Q.isInterleavedBufferAttribute){let yt=Q.data,$t=yt.isInterleavedBuffer===!0?yt.stride:yt.itemSize,kt=Q.offset;if(yt.isInstancedInterleavedBuffer||yt.isInstancedBufferAttribute){for(let zt=0;zt<q.locationSize;zt++)g(q.location+zt,yt.meshPerAttribute);if(R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0)C._maxInstanceCount=yt.meshPerAttribute*yt.count}else for(let zt=0;zt<q.locationSize;zt++)p(q.location+zt);t.bindBuffer(t.ARRAY_BUFFER,nt);for(let zt=0;zt<q.locationSize;zt++)M(q.location+zt,xt/q.locationSize,_t,et,$t*Rt,(kt+xt/q.locationSize*zt)*Rt,It)}else{if(Q.isInstancedBufferAttribute){for(let yt=0;yt<q.locationSize;yt++)g(q.location+yt,Q.meshPerAttribute);if(R.isInstancedMesh!==!0&&C._maxInstanceCount===void 0)C._maxInstanceCount=Q.meshPerAttribute*Q.count}else for(let yt=0;yt<q.locationSize;yt++)p(q.location+yt);t.bindBuffer(t.ARRAY_BUFFER,nt);for(let yt=0;yt<q.locationSize;yt++)M(q.location+yt,xt/q.locationSize,_t,et,xt*Rt,xt/q.locationSize*yt*Rt,It)}}else if(z!==void 0){let et=z[st];if(et!==void 0)switch(et.length){case 2:t.vertexAttrib2fv(q.location,et);break;case 3:t.vertexAttrib3fv(q.location,et);break;case 4:t.vertexAttrib4fv(q.location,et);break;default:t.vertexAttrib1fv(q.location,et)}}}}x()}function b(){w();for(let R in i){let L=i[R];for(let F in L){let C=L[F];for(let B in C){let W=C[B];for(let z in W)u(W[z].object),delete W[z];delete C[B]}}delete i[R]}}function E(R){if(i[R.id]===void 0)return;let L=i[R.id];for(let F in L){let C=L[F];for(let B in C){let W=C[B];for(let z in W)u(W[z].object),delete W[z];delete C[B]}}delete i[R.id]}function m(R){for(let L in i){let F=i[L];for(let C in F){let B=F[C];if(B[R.id]===void 0)continue;let W=B[R.id];for(let z in W)u(W[z].object),delete W[z];delete B[R.id]}}}function v(R){for(let L in i){let F=i[L],C=R.isInstancedMesh===!0?R.id:0,B=F[C];if(B===void 0)continue;for(let W in B){let z=B[W];for(let st in z)u(z[st].object),delete z[st];delete B[W]}if(delete F[C],Object.keys(F).length===0)delete i[L]}}function w(){if(P(),o=!0,r===s)return;r=s,c(r.object)}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:P,dispose:b,releaseStatesOfGeometry:E,releaseStatesOfObject:v,releaseStatesOfProgram:m,initAttributes:S,enableAttribute:p,disableUnusedAttributes:x}}function c0(t,e,n){let i;function s(l){i=l}function r(l,c){t.drawArrays(i,l,c),n.update(c,i,1)}function o(l,c,u){if(u===0)return;t.drawArraysInstanced(i,l,c,u),n.update(c,i,u)}function a(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,u);let h=0;for(let d=0;d<u;d++)h+=c[d];n.update(h,i,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function h0(t,e,n,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let m=e.get("EXT_texture_filter_anisotropic");s=t.getParameter(m.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(m){if(m!==Kn&&i.convert(m)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function a(m){let v=m===Nn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));if(m!==An&&m!==$n&&!v&&i.convert(m)!==t.getParameter(t.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function l(m){if(m==="highp"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.HIGH_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.HIGH_FLOAT).precision>0)return"highp";m="mediump"}if(m==="mediump"){if(t.getShaderPrecisionFormat(t.VERTEX_SHADER,t.MEDIUM_FLOAT).precision>0&&t.getShaderPrecisionFormat(t.FRAGMENT_SHADER,t.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let c=n.precision!==void 0?n.precision:"highp",u=l(c);if(u!==c)At("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u;let f=n.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=n.logarithmicDepthBuffer===!0&&f===!1;if(n.reversedDepthBuffer===!0&&f===!1)At("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(n.logarithmicDepthBuffer===!0&&f===!0)At("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let d=t.getParameter(t.MAX_TEXTURE_IMAGE_UNITS),_=t.getParameter(t.MAX_VERTEX_TEXTURE_IMAGE_UNITS),S=t.getParameter(t.MAX_TEXTURE_SIZE),p=t.getParameter(t.MAX_CUBE_MAP_TEXTURE_SIZE),g=t.getParameter(t.MAX_VERTEX_ATTRIBS),x=t.getParameter(t.MAX_VERTEX_UNIFORM_VECTORS),M=t.getParameter(t.MAX_VARYING_VECTORS),y=t.getParameter(t.MAX_FRAGMENT_UNIFORM_VECTORS),b=t.getParameter(t.MAX_SAMPLES),E=t.getParameter(t.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:_,maxTextureSize:S,maxCubemapSize:p,maxAttributes:g,maxVertexUniforms:x,maxVaryings:M,maxFragmentUniforms:y,maxSamples:b,samples:E}}function u0(t){let e=this,n=null,i=0,s=!1,r=!1,o=new rn,a=new Ft,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){let d=f.length!==0||h||i!==0||s;return s=h,i=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){n=u(f,h,0)},this.setState=function(f,h,d){let{clippingPlanes:_,clipIntersection:S,clipShadows:p}=f,g=t.get(f);if(!s||_===null||_.length===0||r&&!p)if(r)u(null);else c();else{let x=r?0:i,M=x*4,y=g.clippingState||null;l.value=y,y=u(_,h,M,d);for(let b=0;b!==M;++b)y[b]=n[b];g.clippingState=y,this.numIntersection=S?this.numPlanes:0,this.numPlanes+=x}};function c(){if(l.value!==n)l.value=n,l.needsUpdate=i>0;e.numPlanes=i,e.numIntersection=0}function u(f,h,d,_){let S=f!==null?f.length:0,p=null;if(S!==0){if(p=l.value,_!==!0||p===null){let g=d+S*4,x=h.matrixWorldInverse;if(a.getNormalMatrix(x),p===null||p.length<g)p=new Float32Array(g);for(let M=0,y=d;M!==S;++M,y+=4)o.copy(f[M]).applyMatrix4(x,a),o.normal.toArray(p,y),p[y+3]=o.constant}l.value=p,l.needsUpdate=!0}return e.numPlanes=S,e.numIntersection=0,p}}class Do extends gn{constructor(t=1,e={}){super(t,t,e);this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new bo(i),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new ys(5,5,5),s=new ti({name:"CubemapFromEquirect",uniforms:Gi(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ye,blending:Di});s.uniforms.tEquirect.value=e;let r=new Ue(i,s),o=e.minFilter;if(e.minFilter===fi)e.minFilter=mn;return new hr(1,10,this).update(t,r),e.minFilter=o,r.geometry.dispose(),r.material.dispose(),this}clear(t,e=!0,n=!0,i=!0){let s=t.getRenderTarget();for(let r=0;r<6;r++)t.setRenderTarget(this,r),t.clear(e,n,i);t.setRenderTarget(s)}}var Af=256,f0=3,d0=20,Zf=256,Jf=16,p0=3,m0=new N,g0=new Dt;class No{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new hr(1,10,null),this._boxMesh=new Ue(new ys(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,n=0.1,i=100,s={}){let{size:r=256,position:o=m0}=s,a=this._renderer;this._setSize(r);let l=this._allocateTarget(),c=this._getSourceTarget(!0);if(e>0)c.texture.mipmapsAutoUpdate=!1;let{autoClear:u,autoClearColor:f,autoClearDepth:h,autoClearStencil:d}=a,_=t.background;if(a.autoClear=!0,a.autoClearColor=!0,a.autoClearDepth=!0,a.autoClearStencil=!0,_===null)t.background=a.getClearColor(g0);let S=new hr(n,i,c);if(S.position.copy(o),S.update(a,t),a.autoClear=u,a.autoClearColor=f,a.autoClearDepth=h,a.autoClearStencil=d,t.background=_,e>0)c.texture.mipmapsAutoUpdate=!0,this._blur(l,e);return this._applyPMREM(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Rf(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=wf(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(Af,kl(t))}_fromTexture(t,e){if(t.mapping===Ks||t.mapping===gs)this._setSize(t.image.length===0?Af:t.image[0].width||t.image[0].image.width);else this._setSize(t.image.width/4);let n=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(n),n}_allocateTarget(){let t=this._cubeSize,e=Ef(t,!1,!1),n=Math.log2(t)-f0;for(let i=0;i<=n;i++)e.texture.mipmaps.push({width:t>>i,height:t>>i});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,n=this._sourceTarget;if(n===null||n.width!==e||t&&n.depthBuffer===!1){if(n!==null)n.dispose();this._sourceTarget=Ef(e,!0,t)}return this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,n){let i=this._boxMesh,s=this._cubeCamera;i.material=n,s.renderTarget=t,s.activeMipmapLevel=e;let r=t.width>>e;t.viewport.set(0,0,r,r),s.update(this._renderer,i),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;if(t.mapping===Ks||t.mapping===gs){if(this._cubemapMaterial===null)this._cubemapMaterial=Rf();e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=wf();e=this._equirectMaterial}e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){if(this._ggxMaterial===null)this._ggxMaterial=_0(),this._integrationMaterial=x0();let e=this._cubeSize,n=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let s=this._integrationMaterial.uniforms;s.envMap.value=this._sourceTarget.texture,s.sourceLod.value=Math.log2(e/Jf);for(let r=0;r<=n;r++){let o=No.lodToRoughness(r,n);if(r>n-p0)s.roughness.value=o,this._renderCube(t,r,this._integrationMaterial);else{let a=o>0?Math.log2(e)+0.5*Math.log2(6/(Zf*Math.pow(o,4)))+0.5:0;i.roughness.value=o,i.lodBias.value=a,this._renderCube(t,r,this._ggxMaterial)}}}_blur(t,e){if(this._blurMaterial===null)this._blurMaterial=y0();let n=this._blurMaterial,i=n.uniforms,s=this._sourceTarget;i.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,i.envMap.value=s.texture,this._renderCube(t,0,n),i.envMap.value=t.texture,this._renderCube(s,0,n)}}function Ef(t,e,n){return new Do(t,{minFilter:fi,generateMipmaps:e,type:Nn,colorSpace:Nl,depthBuffer:n})}function pr(t,e,n){return new ti({name:t,uniforms:e,vertexShader:Ht.cube_vert,fragmentShader:n,side:Ye,blending:Di,depthTest:!1,depthWrite:!1})}function _0(){return pr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Zf}u

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
	`)}function x0(){return pr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Jf}},`

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
	`)}function y0(){return pr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${d0}
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
	`)}function wf(){return pr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Rf(){return pr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function v0(t){let e=new WeakMap,n=new WeakMap,i=null;function s(h,d=!1){if(h===null||h===void 0)return null;if(d)return o(h);return r(h)}function r(h){if(h&&h.isTexture){let d=h.mapping;if(d===ro||d===oo)if(e.has(h)){let _=e.get(h).texture;return a(_,h.mapping)}else{let _=h.image;if(_&&_.height>0){let S=new Do(_.height);return S.fromEquirectangularTexture(t,h),e.set(h,S),h.addEventListener("dispose",c),a(S.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){let d=h.mapping,_=d===ro||d===oo,S=d===Ks||d===gs;if(_||S){let p=n.get(h),g=p!==void 0?p.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==g){if(i===null)i=new No(t);return p=_?i.fromEquirectangular(h,p):i.fromCubemap(h,p),p.texture.pmremVersion=h.pmremVersion,n.set(h,p),p.texture}else if(p!==void 0)return p.texture;else{let x=h.image;if(_&&x&&x.height>0||S&&x&&l(x)){if(i===null)i=new No(t);return p=_?i.fromEquirectangular(h):i.fromCubemap(h),p.texture.pmremVersion=h.pmremVersion,n.set(h,p),h.addEventListener("dispose",u),p.texture}else return null}}}return h}function a(h,d){if(d===ro)h.mapping=Ks;else if(d===oo)h.mapping=gs;return h}function l(h){let d=0,_=6;for(let S=0;S<_;S++)if(h[S]!==void 0)d++;return d===_}function c(h){let d=h.target;d.removeEventListener("dispose",c);let _=e.get(d);if(_!==void 0)e.delete(d),_.dispose()}function u(h){let d=h.target;d.removeEventListener("dispose",u);let _=n.get(d);if(_!==void 0)n.delete(d),_.dispose()}function f(){if(e=new WeakMap,n=new WeakMap,i!==null)i.dispose(),i=null}return{get:s,dispose:f}}function S0(t){let e={};function n(i){if(e[i]!==void 0)return e[i];let s=t.getExtension(i);return e[i]=s,s}return{has:function(i){return n(i)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(i){let s=n(i);if(s===null)Pi("WebGLRenderer: "+i+" extension not supported.");return s}}}function M0(t,e,n,i){let s={},r=new WeakMap,o=new FinalizationRegistry((_)=>delete s[_]);function a(_){l(_.target)}function l(_){if(_.index!==null)e.remove(_.index);for(let p in _.attributes)e.remove(_.attributes[p]);_.removeEventListener("dispose",a),delete s[_.id],o.unregister(_);let S=r.get(_);if(S)e.remove(S),r.delete(_);if(i.releaseStatesOfGeometry(_),_.isInstancedBufferGeometry===!0)delete _._maxInstanceCount;n.memory.geometries--}function c(_,S){if(s[S.id]!==void 0)return S;return S.addEventListener("dispose",a),s[S.id]=new WeakRef(S),o.register(S,S.id,S),n.memory.geometries++,S}function u(_){let S=_.attributes;for(let p in S)e.update(S[p],t.ARRAY_BUFFER)}function f(_){let S=_.index,p=_.attributes.position,g=0;if(p===void 0)return;let x=S!==null?S.array.length:p.array.length/3-1,y=new(p.count>=65535?yo:xo)(Math.ceil(x/3)*6,1),b=y.array;if(S!==null){let m=S.array;g=S.version;for(let v=0,w=0;v<x;v+=3){let P=m[v+0],R=m[v+1],L=m[v+2];b[w++]=P,b[w++]=R,b[w++]=R,b[w++]=L,b[w++]=L,b[w++]=P}}else{g=p.version;for(let m=0,v=0;m<x;m+=3){let w=m+0,P=m+1,R=m+2;b[v++]=w,b[v++]=P,b[v++]=P,b[v++]=R,b[v++]=R,b[v++]=w}}y.version=g;let E=r.get(_);if(E)e.remove(E);r.set(_,y)}function h(_){let S=r.get(_);if(S){let p=_.index;if(p!==null){if(S.version<p.version)f(_)}}else f(_);return r.get(_)}function d(){for(let _ in s){let S=s[_].deref();if(S!==void 0)l(S)}}return{get:c,update:u,getWireframeAttribute:h,dispose:d}}function b0(t,e,n){let i;function s(f){i=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,h){t.drawElements(i,h,r,f*o),n.update(h,i,1)}function c(f,h,d){if(d===0)return;t.drawElementsInstanced(i,h,r,f*o,d),n.update(h,i,d)}function u(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,h,0,r,f,0,d);let S=0;for(let p=0;p<d;p++)S+=h[p];n.update(S,i,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function T0(t){let e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(n.calls++,o){case t.TRIANGLES:n.triangles+=a*(r/3);break;case t.LINES:n.lines+=a*(r/2);break;case t.LINE_STRIP:n.lines+=a*(r-1);break;case t.LINE_LOOP:n.lines+=a*r;break;case t.POINTS:n.points+=a*r;break;default:Nt("WebGLInfo: Unknown draw mode:",o);break}}function s(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:s,update:i}}function A0(t,e,n){let i=new WeakMap,s=new oe;function r(o,a,l){let c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0,h=i.get(a);if(h===void 0||h.count!==f){let w=function(){m.dispose(),i.delete(a),a.removeEventListener("dispose",w)};if(h!==void 0)h.texture.dispose();let d=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,S=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],g=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],M=0;if(d===!0)M=1;if(_===!0)M=2;if(S===!0)M=3;let y=a.attributes.position.count*M,b=1;if(y>e.maxTextureSize)b=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize;let E=new Float32Array(y*b*4*f),m=new _o(E,y,b,f);m.type=$n,m.needsUpdate=!0;let v=M*4;for(let P=0;P<f;P++){let R=p[P],L=g[P],F=x[P],C=y*b*4*P;for(let B=0;B<R.count;B++){let W=B*v;if(d===!0)s.fromBufferAttribute(R,B),E[C+W+0]=s.x,E[C+W+1]=s.y,E[C+W+2]=s.z,E[C+W+3]=0;if(_===!0)s.fromBufferAttribute(L,B),E[C+W+4]=s.x,E[C+W+5]=s.y,E[C+W+6]=s.z,E[C+W+7]=0;if(S===!0)s.fromBufferAttribute(F,B),E[C+W+8]=s.x,E[C+W+9]=s.y,E[C+W+10]=s.z,E[C+W+11]=F.itemSize===4?s.w:1}}h={count:f,texture:m,size:new Lt(y,b)},i.set(a,h),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(t,"morphTexture",o.morphTexture,n);else{let d=0;for(let S=0;S<c.length;S++)d+=c[S];let _=a.morphTargetsRelative?1:1-d;l.getUniforms().setValue(t,"morphTargetBaseInfluence",_),l.getUniforms().setValue(t,"morphTargetInfluences",c)}l.getUniforms().setValue(t,"morphTargetsTexture",h.texture,n),l.getUniforms().setValue(t,"morphTargetsTextureSize",h.size)}return{update:r}}function E0(t,e,n,i,s){let r=new WeakMap;function o(c){let u=s.render.frame,f=c.geometry,h=e.get(c,f);if(r.get(h)!==u)e.update(h),r.set(h,u);if(c.isInstancedMesh){if(c.hasEventListener("dispose",l)===!1)c.addEventListener("dispose",l);if(r.get(c)!==u){if(n.update(c.instanceMatrix,t.ARRAY_BUFFER),c.instanceColor!==null)n.update(c.instanceColor,t.ARRAY_BUFFER);r.set(c,u)}}if(c.isSkinnedMesh){let d=c.skeleton;if(r.get(d)!==u)d.update(),r.set(d,u)}return h}function a(){r=new WeakMap}function l(c){let u=c.target;if(u.removeEventListener("dispose",l),i.releaseStatesOfObject(u),n.remove(u.instanceMatrix),u.instanceColor!==null)n.remove(u.instanceColor)}return{update:o,dispose:a}}var w0={[Va]:"LINEAR_TONE_MAPPING",[Wa]:"REINHARD_TONE_MAPPING",[Xa]:"CINEON_TONE_MAPPING",[qa]:"ACES_FILMIC_TONE_MAPPING",[Za]:"AGX_TONE_MAPPING",[Ja]:"NEUTRAL_TONE_MAPPING",[Ya]:"CUSTOM_TONE_MAPPING"};function R0(t,e,n,i,s,r){let o=new gn(e,n,{type:t,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=null,u=new Be;u.setAttribute("position",new Ee([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Ee([0,2,0,0,2,0],2));let f=new nc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),h=new Ue(u,f),d=new Io(-1,1,1,-1,0,1),_=null,S=null,p=!1,g,x=null,M=[],y=!1;this.setSize=function(b,E){if(o.setSize(b,E),a!==null)a.setSize(b,E);if(l!==null)l.setSize(b,E);for(let m=0;m<M.length;m++){let v=M[m];if(v.setSize)v.setSize(b,E)}},this.setEffects=function(b){M=b,y=M.length>0&&M[0].isRenderPass===!0;let{width:E,height:m}=o;if(M.length>0&&a===null)a=new gn(E,m,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),l=new gn(E,m,{type:Nn,depthBuffer:!1,stencilBuffer:!1});let v=s===!0&&M.some((w)=>w.needsDepthTexture===!0);if(v!==(o.depthTexture!==null)){if(v===!0&&c===null){if(c=new mi(E,m),r===!0)c.format=pi,c.type=Ui}o.dispose(),o.depthTexture=v?c:null,o.resolveDepthBuffer=v,o.storeMultisampledDepthBuffer=v}for(let w=0;w<M.length;w++){let P=M[w];if(P.setSize)P.setSize(E,m);if(v&&P.needsDepthTexture===!0&&P.setDepthTexture)P.setDepthTexture(c)}},this.begin=function(b,E){if(p)return!1;if(b.toneMapping===Ln&&M.length===0)return!1;if(x=E,E!==null){let{width:m,height:v}=E;if(o.width!==m||o.height!==v)this.setSize(m,v)}if(y===!1)b.setRenderTarget(o);return g=b.toneMapping,b.toneMapping=Ln,!0},this.hasRenderPass=function(){return y},this.end=function(b,E){b.toneMapping=g,p=!0;let m=o,v=a;for(let w=0;w<M.length;w++){let P=M[w];if(P.enabled===!1)continue;if(P.render(b,v,m,E),P.needsSwap!==!1)m=v,v=v===a?l:a}if(_!==b.outputColorSpace||S!==b.toneMapping){if(_=b.outputColorSpace,S=b.toneMapping,f.defines={},Vt.getTransfer(_)===he)f.defines.SRGB_TRANSFER="";let w=w0[S];if(w)f.defines[w]="";f.needsUpdate=!0}f.uniforms.tDiffuse.value=m.texture,b.setRenderTarget(x),b.render(h,d),x=null,p=!1},this.isCompositing=function(){return p},this.dispose=function(){if(o.dispose(),a!==null)a.dispose();if(l!==null)l.dispose();u.dispose(),f.dispose()}}var $f=new we,Kf=new mi(1,1),Qf=new To(1),jf=new _o,td=new ql,ed=new bo,Cf=[],If=[],Pf=new Float32Array(16),Lf=new Float32Array(9),Nf=new Float32Array(4);function vs(t,e,n){let i=t[0];if(i<=0||i>0)return t;let s=e*n,r=Cf[s];if(r===void 0)r=new Float32Array(s),Cf[s]=r;if(e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=n,t[o].toArray(r,a)}return r}function Ce(t,e){if(t.length!==e.length)return!1;for(let n=0,i=t.length;n<i;n++)if(t[n]!==e[n])return!1;return!0}function Ie(t,e){for(let n=0,i=e.length;n<i;n++)t[n]=e[n]}function Uo(t,e){let n=If[e];if(n===void 0)n=new Int32Array(e),If[e]=n;for(let i=0;i!==e;++i)n[i]=t.allocateTextureUnit();return n}function C0(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1f(this.addr,e),n[0]=e}function I0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(Ce(n,e))return;t.uniform2fv(this.addr,e),Ie(n,e)}}function P0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else if(e.r!==void 0){if(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)t.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b}else{if(Ce(n,e))return;t.uniform3fv(this.addr,e),Ie(n,e)}}function L0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(Ce(n,e))return;t.uniform4fv(this.addr,e),Ie(n,e)}}function N0(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(Ce(n,e))return;t.uniformMatrix2fv(this.addr,!1,e),Ie(n,e)}else{if(Ce(n,i))return;Nf.set(i),t.uniformMatrix2fv(this.addr,!1,Nf),Ie(n,i)}}function D0(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(Ce(n,e))return;t.uniformMatrix3fv(this.addr,!1,e),Ie(n,e)}else{if(Ce(n,i))return;Lf.set(i),t.uniformMatrix3fv(this.addr,!1,Lf),Ie(n,i)}}function U0(t,e){let n=this.cache,i=e.elements;if(i===void 0){if(Ce(n,e))return;t.uniformMatrix4fv(this.addr,!1,e),Ie(n,e)}else{if(Ce(n,i))return;Pf.set(i),t.uniformMatrix4fv(this.addr,!1,Pf),Ie(n,i)}}function F0(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1i(this.addr,e),n[0]=e}function O0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(Ce(n,e))return;t.uniform2iv(this.addr,e),Ie(n,e)}}function B0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else{if(Ce(n,e))return;t.uniform3iv(this.addr,e),Ie(n,e)}}function z0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(Ce(n,e))return;t.uniform4iv(this.addr,e),Ie(n,e)}}function G0(t,e){let n=this.cache;if(n[0]===e)return;t.uniform1ui(this.addr,e),n[0]=e}function k0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y)t.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y}else{if(Ce(n,e))return;t.uniform2uiv(this.addr,e),Ie(n,e)}}function H0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)t.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z}else{if(Ce(n,e))return;t.uniform3uiv(this.addr,e),Ie(n,e)}}function V0(t,e){let n=this.cache;if(e.x!==void 0){if(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)t.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w}else{if(Ce(n,e))return;t.uniform4uiv(this.addr,e),Ie(n,e)}}function Fo(t){if(t.version===0)t.compareFunction=Ol,t.needsUpdate=!0;return t}function W0(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===t.SAMPLER_2D_SHADOW)r=Fo(Kf);else r=$f;n.setTexture2D(e||r,s)}function X0(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;n.setTexture3D(e||td,s)}function q0(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;let r;if(this.type===t.SAMPLER_CUBE_SHADOW)r=Fo(Qf);else r=ed;n.setTextureCube(e||r,s)}function Y0(t,e,n){let i=this.cache,s=n.allocateTextureUnit();if(i[0]!==s)t.uniform1i(this.addr,s),i[0]=s;n.setTexture2DArray(e||jf,s)}function Z0(t){switch(t){case 5126:return C0;case 35664:return I0;case 35665:return P0;case 35666:return L0;case 35674:return N0;case 35675:return D0;case 35676:return U0;case 5124:case 35670:return F0;case 35667:case 35671:return O0;case 35668:case 35672:return B0;case 35669:case 35673:return z0;case 5125:return G0;case 36294:return k0;case 36295:return H0;case 36296:return V0;case 35678:case 36198:case 36298:case 36306:case 35682:return W0;case 35679:case 36299:case 36307:return X0;case 35680:case 36300:case 36308:case 36293:return q0;case 36289:case 36303:case 36311:case 36292:return Y0}}function J0(t,e){t.uniform1fv(this.addr,e)}function $0(t,e){let n=vs(e,this.size,2);t.uniform2fv(this.addr,n)}function K0(t,e){let n=vs(e,this.size,3);t.uniform3fv(this.addr,n)}function Q0(t,e){let n=vs(e,this.size,4);t.uniform4fv(this.addr,n)}function j0(t,e){let n=vs(e,this.size,4);t.uniformMatrix2fv(this.addr,!1,n)}function tx(t,e){let n=vs(e,this.size,9);t.uniformMatrix3fv(this.addr,!1,n)}function ex(t,e){let n=vs(e,this.size,16);t.uniformMatrix4fv(this.addr,!1,n)}function nx(t,e){t.uniform1iv(this.addr,e)}function ix(t,e){t.uniform2iv(this.addr,e)}function sx(t,e){t.uniform3iv(this.addr,e)}function rx(t,e){t.uniform4iv(this.addr,e)}function ox(t,e){t.uniform1uiv(this.addr,e)}function ax(t,e){t.uniform2uiv(this.addr,e)}function lx(t,e){t.uniform3uiv(this.addr,e)}function cx(t,e){t.uniform4uiv(this.addr,e)}function hx(t,e,n){let i=this.cache,s=e.length,r=Uo(n,s);if(!Ce(i,r))t.uniform1iv(this.addr,r),Ie(i,r);let o;if(this.type===t.SAMPLER_2D_SHADOW)o=Fo(Kf);else o=$f;for(let a=0;a!==s;++a)n.setTexture2D(e[a]||o,r[a])}function ux(t,e,n){let i=this.cache,s=e.length,r=Uo(n,s);if(!Ce(i,r))t.uniform1iv(this.addr,r),Ie(i,r);for(let o=0;o!==s;++o)n.setTexture3D(e[o]||td,r[o])}function fx(t,e,n){let i=this.cache,s=e.length,r=Uo(n,s);if(!Ce(i,r))t.uniform1iv(this.addr,r),Ie(i,r);let o;if(this.type===t.SAMPLER_CUBE_SHADOW)o=Fo(Qf);else o=ed;for(let a=0;a!==s;++a)n.setTextureCube(e[a]||o,r[a])}function dx(t,e,n){let i=this.cache,s=e.length,r=Uo(n,s);if(!Ce(i,r))t.uniform1iv(this.addr,r),Ie(i,r);for(let o=0;o!==s;++o)n.setTexture2DArray(e[o]||jf,r[o])}function px(t){switch(t){case 5126:return J0;case 35664:return $0;case 35665:return K0;case 35666:return Q0;case 35674:return j0;case 35675:return tx;case 35676:return ex;case 5124:case 35670:return nx;case 35667:case 35671:return ix;case 35668:case 35672:return sx;case 35669:case 35673:return rx;case 5125:return ox;case 36294:return ax;case 36295:return lx;case 36296:return cx;case 35678:case 36198:case 36298:case 36306:case 35682:return hx;case 35679:case 36299:case 36307:return ux;case 35680:case 36300:case 36308:case 36293:return fx;case 36289:case 36303:case 36311:case 36292:return dx}}class nd{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Z0(e.type)}}class id{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=px(e.type)}}class sd{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let i=this.seq;for(let s=0,r=i.length;s!==r;++s){let o=i[s];o.setValue(t,e[o.id],n)}}}var xc=/(\w+)(\])?(\[|\.)?/g;function Df(t,e){t.seq.push(e),t.map[e.id]=e}function mx(t,e,n){let i=t.name,s=i.length;xc.lastIndex=0;while(!0){let r=xc.exec(i),o=xc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l)a=a|0;if(c===void 0||c==="["&&o+2===s){Df(n,c===void 0?new nd(a,t,e):new id(a,t,e));break}else{let f=n.map[a];if(f===void 0)f=new sd(a),Df(n,f);n=f}}}class dr{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let o=t.getActiveUniform(e,r),a=t.getUniformLocation(e,o.name);mx(o,a,this)}let i=[],s=[];for(let r of this.seq)if(r.type===t.SAMPLER_2D_SHADOW||r.type===t.SAMPLER_CUBE_SHADOW||r.type===t.SAMPLER_2D_ARRAY_SHADOW)i.push(r);else s.push(r);if(i.length>0)this.seq=i.concat(s)}setValue(t,e,n,i){let s=this.map[e];if(s!==void 0)s.setValue(t,n,i)}setOptional(t,e,n){let i=e[n];if(i!==void 0)this.setValue(t,n,i)}static upload(t,e,n,i){for(let s=0,r=e.length;s!==r;++s){let o=e[s],a=n[o.id];if(a.needsUpdate!==!1)o.setValue(t,a.value,i)}}static seqWithValue(t,e){let n=[];for(let i=0,s=t.length;i!==s;++i){let r=t[i];if(r.id in e)n.push(r)}return n}}function Uf(t,e,n){let i=t.createShader(e);return t.shaderSource(i,n),t.compileShader(i),i}var gx=37297,_x=0;function xx(t,e){let n=t.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,n.length);for(let o=s;o<r;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${n[o]}`)}return i.join(`
`)}var Ff=new Ft;function yx(t){Vt._getMatrix(Ff,Vt.workingColorSpace,t);let e=`mat3( ${Ff.elements.map((n)=>n.toFixed(4))} )`;switch(Vt.getTransfer(t)){case Dl:return[e,"LinearTransferOETF"];case he:return[e,"sRGBTransferOETF"];default:return At("WebGLProgram: Unsupported color space: ",t),[e,"LinearTransferOETF"]}}function Of(t,e,n){let i=t.getShaderParameter(e,t.COMPILE_STATUS),r=(t.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return n.toUpperCase()+`

`+r+`

`+xx(t.getShaderSource(e),a)}else return r}function vx(t,e){let n=yx(e);return[`vec4 ${t}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Sx={[Va]:"Linear",[Wa]:"Reinhard",[Xa]:"Cineon",[qa]:"ACESFilmic",[Za]:"AgX",[Ja]:"Neutral",[Ya]:"Custom"};function Mx(t,e){let n=Sx[e];if(n===void 0)return At("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+t+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+t+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}var Lo=new N;function bx(){Vt.getLuminanceCoefficients(Lo);let t=Lo.x.toFixed(4),e=Lo.y.toFixed(4),n=Lo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${t}, ${e}, ${n} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Tx(t){return[t.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",t.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fr).join(`
`)}function Ax(t){let e=[];for(let n in t){let i=t[n];if(i===!1)continue;e.push("#define "+n+" "+i)}return e.join(`
`)}function Ex(t,e){let n={},i=t.getProgramParameter(e,t.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=t.getActiveAttrib(e,s),o=r.name,a=1;if(r.type===t.FLOAT_MAT2)a=2;if(r.type===t.FLOAT_MAT3)a=3;if(r.type===t.FLOAT_MAT4)a=4;n[o]={type:r.type,location:t.getAttribLocation(e,o),locationSize:a}}return n}function fr(t){return t!==""}function Bf(t,e){let n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return t.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function zf(t,e){return t.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var wx=/^[ \t]*#include +<([\w\d./]+)>/gm;function vc(t){return t.replace(wx,Rx)}function Rx(t,e){let n=Ht[e];if(n===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return vc(n)}var Cx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gf(t){return t.replace(Cx,Ix)}function Ix(t,e,n,i){let s="";for(let r=parseInt(e);r<parseInt(n);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function kf(t){let e=`precision ${t.precision} float;
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
#define LOW_PRECISION`;return e}var Px={[Js]:"SHADOWMAP_TYPE_PCF",[ps]:"SHADOWMAP_TYPE_VSM"};function Lx(t){return Px[t.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Nx={[gs]:"ENVMAP_MODE_REFRACTION"};function Dx(t){if(t.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Nx[t.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Ux={[Mu]:"ENVMAP_BLENDING_MULTIPLY",[bu]:"ENVMAP_BLENDING_MIX",[Tu]:"ENVMAP_BLENDING_ADD"};function Fx(t){if(t.envMap===!1)return"ENVMAP_BLENDING_NONE";return Ux[t.combine]||"ENVMAP_BLENDING_NONE"}function Ox(t,e,n,i){let s=t.getContext(),r=n.defines,o=n.vertexShader,a=n.fragmentShader,l=Lx(n),c=n.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=Dx(n),f=Fx(n),h=Tx(n),d=Ax(r),_=s.createProgram(),S,p,g=n.glslVersion?"#version "+n.glslVersion+`
`:"";if(n.isRawShaderMaterial){if(S=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,d].filter(fr).join(`
`),S.length>0)S+=`
`;if(p=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,d].filter(fr).join(`
`),p.length>0)p+=`
`}else S=[kf(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,d,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+u:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+n.diffuseRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexNormals?"#define HAS_NORMAL":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(fr).join(`
`),p=[kf(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,d,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+c:"",n.envMap?"#define "+u:"",n.envMap?"#define "+f:"",n.envMapPMREM?"#define ENVMAP_MAX_LOD "+n.envMapMaxLod+".0":"",n.envMapPMREM?"#define ENVMAP_SIZE "+n.envMapSize+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",n.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.retroreflection?"#define USE_RETROREFLECTION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor?"#define USE_COLOR":"",n.vertexAlphas||n.batchingColor?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+l:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",n.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ln?"#define TONE_MAPPING":"",n.toneMapping!==Ln?Ht.tonemapping_pars_fragment:"",n.toneMapping!==Ln?Mx("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",Ht.colorspace_pars_fragment,vx("linearToOutputTexel",n.outputColorSpace),bx(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(fr).join(`
`);if(o=vc(o),o=Bf(o,n),o=zf(o,n),a=vc(a),a=Bf(a,n),a=zf(a,n),o=Gf(o),a=Gf(a),n.isRawShaderMaterial!==!0)g=`#version 300 es
`,S=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,p=["#define varying in",n.glslVersion===Bl?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Bl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p;let x=g+S+o,M=g+p+a,y=Uf(s,s.VERTEX_SHADER,x),b=Uf(s,s.FRAGMENT_SHADER,M);if(s.attachShader(_,y),s.attachShader(_,b),n.index0AttributeName!==void 0)s.bindAttribLocation(_,0,n.index0AttributeName);else if(n.hasPositionAttribute===!0)s.bindAttribLocation(_,0,"position");s.linkProgram(_);function E(P){if(t.debug.checkShaderErrors){let R=s.getProgramInfoLog(_)||"",L=s.getShaderInfoLog(y)||"",F=s.getShaderInfoLog(b)||"",C=R.trim(),B=L.trim(),W=F.trim(),z=!0,st=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(z=!1,typeof t.debug.onShaderError==="function")t.debug.onShaderError(s,_,y,b);else{let q=Of(s,y,"vertex"),Q=Of(s,b,"fragment");Nt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+C+`
`+q+`
`+Q)}else if(C!=="")At("WebGLProgram: Program Info Log:",C);else if(B===""||W==="")st=!1;if(st)P.diagnostics={runnable:z,programLog:C,vertexShader:{log:B,prefix:S},fragmentShader:{log:W,prefix:p}}}s.deleteShader(y),s.deleteShader(b),m=new dr(s,_),v=Ex(s,_)}let m;this.getUniforms=function(){if(m===void 0)E(this);return m};let v;this.getAttributes=function(){if(v===void 0)E(this);return v};let w=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(w===!1)w=s.getProgramParameter(_,gx);return w},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=_x++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=y,this.fragmentShader=b,this}var Bx=0;class rd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let i=this._getShaderCacheForMaterial(t);if(i.has(e)===!1)i.add(e),e.usedTimes++;if(i.has(n)===!1)i.add(n),n.usedTimes++;return this}remove(t){let e=this.materialCache.get(t);for(let n of e)if(n.usedTimes--,n.usedTimes===0)this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);if(n===void 0)n=new Set,e.set(t,n);return n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);if(n===void 0)n=new od(t),e.set(t,n);return n}}class od{constructor(t){this.id=Bx++,this.code=t,this.usedTimes=0}}function zx(t){return t===Fi||t===po||t===mo}function Gx(t,e,n,i,s,r){let o=new er,a=new rd,l=new Set,c=[],u=new Map,f=i.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(m){if(l.add(m),m===0)return"uv";return`uv${m}`}function _(m,v,w,P,R,L){let F=P.fog,C=R.geometry,B=m.isMeshStandardMaterial||m.isMeshLambertMaterial||m.isMeshPhongMaterial?P.environment:null,W=m.isMeshStandardMaterial||m.isMeshLambertMaterial&&!m.envMap||m.isMeshPhongMaterial&&!m.envMap,z=e.get(m.envMap||B,W),st=h[m.type],q=i.precision;if(m.precision!==null){if(q=i.getMaxPrecision(m.precision),q!==m.precision)At("WebGLProgram.getParameters:",m.precision,"not supported, using",q,"instead.")}let Q=C.morphAttributes.position||C.morphAttributes.normal||C.morphAttributes.color,et=Q!==void 0?Q.length:0,xt=0;if(C.morphAttributes.position!==void 0)xt=1;if(C.morphAttributes.normal!==void 0)xt=2;if(C.morphAttributes.color!==void 0)xt=3;let K,nt,_t,Rt;if(st){let mt=On[st];K=mt.vertexShader,nt=mt.fragmentShader}else{K=m.vertexShader,nt=m.fragmentShader;let mt=a.getVertexShaderStage(m),re=a.getFragmentShaderStage(m);a.update(m,mt,re),_t=mt.id,Rt=re.id}let It=t.getRenderTarget(),yt=t.state.buffers.depth.getReversed(),$t=R.isInstancedMesh===!0,kt=R.isBatchedMesh===!0,zt=!!m.map,ne=!!m.matcap,Yt=!!z,xe=Yt&&z.isPMREMTexture===!0,ve=!!m.aoMap,tn=!!m.lightMap,ln=!!m.bumpMap&&m.wireframe===!1,Se=!!m.normalMap,Ge=!!m.displacementMap,en=!!m.emissiveMap,nn=!!m.metalnessMap,xn=!!m.roughnessMap,O=m.anisotropy>0,yn=m.clearcoat>0,se=m.diffuseRoughness>0,Pe=m.dispersion>0,ft=m.retroreflectivity>0,de=m.iridescence>0,Pt=m.sheen>0,Ot=m.transmission>0,ke=O&&!!m.anisotropyMap,I=yn&&!!m.clearcoatMap,T=yn&&!!m.clearcoatNormalMap,G=yn&&!!m.clearcoatRoughnessMap,tt=se&&!!m.diffuseRoughnessMap,j=de&&!!m.iridescenceMap,ot=de&&!!m.iridescenceThicknessMap,ct=Pt&&!!m.sheenColorMap,X=Pt&&!!m.sheenRoughnessMap,J=!!m.specularMap,at=!!m.specularColorMap,D=!!m.specularIntensityMap,Z=Ot&&!!m.transmissionMap,Y=Ot&&!!m.thicknessMap,it=!!m.gradientMap,rt=!!m.alphaMap,ut=m.alphaTest>0,Et=!!m.alphaHash,Tt=!!m.extensions,pt=Ln;if(m.toneMapped){if(It===null||It.isXRRenderTarget===!0)pt=t.toneMapping}let Ct=xe?z.isCompressedCubeTexture?z.image[0].mipmaps:z.mipmaps:null,Gt={shaderID:st,shaderType:m.type,shaderName:m.name,vertexShader:K,fragmentShader:nt,defines:m.defines,customVertexShaderID:_t,customFragmentShaderID:Rt,isRawShaderMaterial:m.isRawShaderMaterial===!0,glslVersion:m.glslVersion,precision:q,batching:kt,batchingColor:kt&&R._colorsTexture!==null,instancing:$t,instancingColor:$t&&R.instanceColor!==null,instancingMorph:$t&&R.morphTexture!==null,outputColorSpace:It===null?t.outputColorSpace:It.isXRRenderTarget===!0?It.texture.colorSpace:Vt.workingColorSpace,alphaToCoverage:!!m.alphaToCoverage,map:zt,matcap:ne,envMap:Yt,envMapMode:Yt&&z.mapping,envMapPMREM:xe,envMapMaxLod:xe?Ct.length-1:null,envMapSize:xe?Ct[0].width:null,aoMap:ve,lightMap:tn,bumpMap:ln,normalMap:Se,displacementMap:Ge,emissiveMap:en,normalMapObjectSpace:Se&&m.normalMapType===Uu,normalMapTangentSpace:Se&&m.normalMapType===Ll,packedNormalMap:Se&&m.normalMapType===Ll&&zx(m.normalMap.format),metalnessMap:nn,roughnessMap:xn,anisotropy:O,anisotropyMap:ke,clearcoat:yn,clearcoatMap:I,clearcoatNormalMap:T,clearcoatRoughnessMap:G,diffuseRoughness:se,diffuseRoughnessMap:tt,dispersion:Pe,retroreflection:ft,iridescence:de,iridescenceMap:j,iridescenceThicknessMap:ot,sheen:Pt,sheenColorMap:ct,sheenRoughnessMap:X,specularMap:J,specularColorMap:at,specularIntensityMap:D,transmission:Ot,transmissionMap:Z,thicknessMap:Y,gradientMap:it,opaque:m.transparent===!1&&m.blending===$s&&m.alphaToCoverage===!1,alphaMap:rt,alphaTest:ut,alphaHash:Et,combine:m.combine,mapUv:zt&&d(m.map.channel),aoMapUv:ve&&d(m.aoMap.channel),lightMapUv:tn&&d(m.lightMap.channel),bumpMapUv:ln&&d(m.bumpMap.channel),normalMapUv:Se&&d(m.normalMap.channel),displacementMapUv:Ge&&d(m.displacementMap.channel),emissiveMapUv:en&&d(m.emissiveMap.channel),metalnessMapUv:nn&&d(m.metalnessMap.channel),roughnessMapUv:xn&&d(m.roughnessMap.channel),anisotropyMapUv:ke&&d(m.anisotropyMap.channel),clearcoatMapUv:I&&d(m.clearcoatMap.channel),clearcoatNormalMapUv:T&&d(m.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:G&&d(m.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:tt&&d(m.diffuseRoughnessMap.channel),iridescenceMapUv:j&&d(m.iridescenceMap.channel),iridescenceThicknessMapUv:ot&&d(m.iridescenceThicknessMap.channel),sheenColorMapUv:ct&&d(m.sheenColorMap.channel),sheenRoughnessMapUv:X&&d(m.sheenRoughnessMap.channel),specularMapUv:J&&d(m.specularMap.channel),specularColorMapUv:at&&d(m.specularColorMap.channel),specularIntensityMapUv:D&&d(m.specularIntensityMap.channel),transmissionMapUv:Z&&d(m.transmissionMap.channel),thicknessMapUv:Y&&d(m.thicknessMap.channel),alphaMapUv:rt&&d(m.alphaMap.channel),vertexTangents:!!C.attributes.tangent&&(Se||O),vertexNormals:!!C.attributes.normal,vertexColors:m.vertexColors,vertexAlphas:m.vertexColors===!0&&!!C.attributes.color&&C.attributes.color.itemSize===4,pointsUvs:R.isPoints===!0&&!!C.attributes.uv&&(zt||rt),fog:!!F,useFog:m.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:m.wireframe===!1&&(m.flatShading===!0||C.attributes.normal===void 0&&Se===!1&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial||m.isMeshStandardMaterial||m.isMeshPhysicalMaterial)),sizeAttenuation:m.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:yt,skinning:R.isSkinnedMesh===!0,hasPositionAttribute:C.attributes.position!==void 0,morphTargets:C.morphAttributes.position!==void 0,morphNormals:C.morphAttributes.normal!==void 0,morphColors:C.morphAttributes.color!==void 0,morphTargetsCount:et,morphTextureStride:xt,numSunLights:v.sun.length,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numSunLightShadows:v.sunShadowMap.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numLightProbeGrids:L.filter((mt)=>mt.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:m.dithering,shadowMapEnabled:t.shadowMap.enabled&&w.length>0,shadowMapType:t.shadowMap.type,toneMapping:pt,decodeVideoTexture:zt&&m.map.isVideoTexture===!0&&Vt.getTransfer(m.map.colorSpace)===he,decodeVideoTextureEmissive:en&&m.emissiveMap.isVideoTexture===!0&&Vt.getTransfer(m.emissiveMap.colorSpace)===he,premultipliedAlpha:m.premultipliedAlpha,doubleSided:m.side===pn,flipSided:m.side===Ye,useDepthPacking:m.depthPacking>=0,depthPacking:m.depthPacking||0,index0AttributeName:m.index0AttributeName,extensionClipCullDistance:Tt&&m.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Tt&&m.extensions.multiDraw===!0||kt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:m.customProgramCacheKey()};return Gt.vertexUv1s=l.has(1),Gt.vertexUv2s=l.has(2),Gt.vertexUv3s=l.has(3),l.clear(),Gt}function S(m){let v=[];if(m.shaderID)v.push(m.shaderID);else v.push(m.customVertexShaderID),v.push(m.customFragmentShaderID);if(m.defines!==void 0)for(let w in m.defines)v.push(w),v.push(m.defines[w]);if(m.isRawShaderMaterial===!1)p(v,m),g(v,m),v.push(t.outputColorSpace);return v.push(m.customProgramCacheKey),v.join()}function p(m,v){m.push(v.precision),m.push(v.outputColorSpace),m.push(v.envMapMode),m.push(v.envMapPMREM),m.push(v.envMapMaxLod),m.push(v.envMapSize),m.push(v.mapUv),m.push(v.alphaMapUv),m.push(v.lightMapUv),m.push(v.aoMapUv),m.push(v.bumpMapUv),m.push(v.normalMapUv),m.push(v.displacementMapUv),m.push(v.emissiveMapUv),m.push(v.metalnessMapUv),m.push(v.roughnessMapUv),m.push(v.anisotropyMapUv),m.push(v.clearcoatMapUv),m.push(v.clearcoatNormalMapUv),m.push(v.clearcoatRoughnessMapUv),m.push(v.diffuseRoughnessMapUv),m.push(v.iridescenceMapUv),m.push(v.iridescenceThicknessMapUv),m.push(v.sheenColorMapUv),m.push(v.sheenRoughnessMapUv),m.push(v.specularMapUv),m.push(v.specularColorMapUv),m.push(v.specularIntensityMapUv),m.push(v.transmissionMapUv),m.push(v.thicknessMapUv),m.push(v.combine),m.push(v.fogExp2),m.push(v.sizeAttenuation),m.push(v.morphTargetsCount),m.push(v.numSunLights),m.push(v.numDirLights),m.push(v.numPointLights),m.push(v.numSpotLights),m.push(v.numSpotLightMaps),m.push(v.numHemiLights),m.push(v.numRectAreaLights),m.push(v.numSunLightShadows),m.push(v.numDirLightShadows),m.push(v.numPointLightShadows),m.push(v.numSpotLightShadows),m.push(v.numSpotLightShadowsWithMaps),m.push(v.numLightProbes),m.push(v.numLightProbeGrids),m.push(v.shadowMapType),m.push(v.toneMapping),m.push(v.numClippingPlanes),m.push(v.numClipIntersection),m.push(v.depthPacking)}function g(m,v){if(o.disableAll(),v.instancing)o.enable(0);if(v.instancingColor)o.enable(1);if(v.instancingMorph)o.enable(2);if(v.matcap)o.enable(3);if(v.envMap)o.enable(4);if(v.normalMapObjectSpace)o.enable(5);if(v.normalMapTangentSpace)o.enable(6);if(v.clearcoat)o.enable(7);if(v.iridescence)o.enable(8);if(v.alphaTest)o.enable(9);if(v.vertexColors)o.enable(10);if(v.vertexAlphas)o.enable(11);if(v.vertexUv1s)o.enable(12);if(v.vertexUv2s)o.enable(13);if(v.vertexUv3s)o.enable(14);if(v.vertexTangents)o.enable(15);if(v.anisotropy)o.enable(16);if(v.alphaHash)o.enable(17);if(v.batching)o.enable(18);if(v.dispersion)o.enable(19);if(v.retroreflection)o.enable(24);if(v.diffuseRoughness)o.enable(25);if(v.batchingColor)o.enable(20);if(v.gradientMap)o.enable(21);if(v.packedNormalMap)o.enable(22);if(v.vertexNormals)o.enable(23);if(m.push(o.mask),o.disableAll(),v.fog)o.enable(0);if(v.useFog)o.enable(1);if(v.flatShading)o.enable(2);if(v.logarithmicDepthBuffer)o.enable(3);if(v.reversedDepthBuffer)o.enable(4);if(v.skinning)o.enable(5);if(v.morphTargets)o.enable(6);if(v.morphNormals)o.enable(7);if(v.morphColors)o.enable(8);if(v.premultipliedAlpha)o.enable(9);if(v.shadowMapEnabled)o.enable(10);if(v.doubleSided)o.enable(11);if(v.flipSided)o.enable(12);if(v.useDepthPacking)o.enable(13);if(v.dithering)o.enable(14);if(v.transmission)o.enable(15);if(v.sheen)o.enable(16);if(v.opaque)o.enable(17);if(v.pointsUvs)o.enable(18);if(v.decodeVideoTexture)o.enable(19);if(v.decodeVideoTextureEmissive)o.enable(20);if(v.alphaToCoverage)o.enable(21);if(v.numLightProbeGrids>0)o.enable(22);if(v.hasPositionAttribute)o.enable(23);m.push(o.mask)}function x(m){let v=h[m.type],w;if(v){let P=On[v];w=Qu.clone(P.uniforms)}else w=m.uniforms;return w}function M(m,v){let w=u.get(v);if(w!==void 0)++w.usedTimes;else w=new Ox(t,v,m,s),c.push(w),u.set(v,w);return w}function y(m){if(--m.usedTimes===0){let v=c.indexOf(m);c[v]=c[c.length-1],c.pop(),u.delete(m.cacheKey),m.destroy()}}function b(m){a.remove(m)}function E(){a.dispose()}return{getParameters:_,getProgramCacheKey:S,getUniforms:x,acquireProgram:M,releaseProgram:y,releaseShaderCache:b,programs:c,dispose:E}}function kx(){let t=new WeakMap;function e(o){return t.has(o)}function n(o){let a=t.get(o);if(a===void 0)a={},t.set(o,a);return a}function i(o){t.delete(o)}function s(o,a,l){t.get(o)[a]=l}function r(){t=new WeakMap}return{has:e,get:n,remove:i,update:s,dispose:r}}function Hx(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.material.id!==e.material.id)return t.material.id-e.material.id;else if(t.materialVariant!==e.materialVariant)return t.materialVariant-e.materialVariant;else if(t.z!==e.z)return t.z-e.z;else return t.id-e.id}function Hf(t,e){if(t.groupOrder!==e.groupOrder)return t.groupOrder-e.groupOrder;else if(t.renderOrder!==e.renderOrder)return t.renderOrder-e.renderOrder;else if(t.z!==e.z)return e.z-t.z;else return t.id-e.id}function Vf(){let t=[],e=0,n=[],i=[],s=[];function r(){e=0,n.length=0,i.length=0,s.length=0}function o(h){let d=0;if(h.isInstancedMesh)d+=2;if(h.isSkinnedMesh)d+=1;return d}function a(h,d,_,S,p,g){let x=t[e];if(x===void 0)x={id:h.id,object:h,geometry:d,material:_,materialVariant:o(h),groupOrder:S,renderOrder:h.renderOrder,z:p,group:g},t[e]=x;else x.id=h.id,x.object=h,x.geometry=d,x.material=_,x.materialVariant=o(h),x.groupOrder=S,x.renderOrder=h.renderOrder,x.z=p,x.group=g;return e++,x}function l(h,d,_,S,p,g,x){if(x.reversedDepth===!0)p=-p;let M=a(h,d,_,S,p,g);if(_.transmission>0)i.push(M);else if(_.transparent===!0)s.push(M);else n.push(M)}function c(h,d,_,S,p,g){let x=a(h,d,_,S,p,g);if(_.transmission>0)i.unshift(x);else if(_.transparent===!0)s.unshift(x);else n.unshift(x)}function u(h,d){if(n.length>1)n.sort(h||Hx);if(i.length>1)i.sort(d||Hf);if(s.length>1)s.sort(d||Hf)}function f(){for(let h=e,d=t.length;h<d;h++){let _=t[h];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:n,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:f,sort:u}}function Vx(){let t=new WeakMap;function e(i,s){let r=t.get(i),o;if(r===void 0)o=new Vf,t.set(i,[o]);else if(s>=r.length)o=new Vf,r.push(o);else o=r[s];return o}function n(){t=new WeakMap}return{get:e,dispose:n}}function Wx(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={direction:new N,color:new Dt};break;case"SpotLight":n={position:new N,direction:new N,color:new Dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new N,color:new Dt,distance:0,decay:0};break;case"HemisphereLight":n={direction:new N,skyColor:new Dt,groundColor:new Dt};break;case"RectAreaLight":n={color:new Dt,position:new N,halfWidth:new N,halfHeight:new N};break}return t[e.id]=n,n}}}function Xx(){let t={};return{get:function(e){if(t[e.id]!==void 0)return t[e.id];let n;switch(e.type){case"SunLight":case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Lt,shadowCameraNear:1,shadowCameraFar:1000};break}return t[e.id]=n,n}}}var qx=0;function Yx(t,e){return(e.castShadow?2:0)-(t.castShadow?2:0)+(e.map?1:0)-(t.map?1:0)}function Zx(t){let e=new Wx,n=Xx(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new N);let s=new N,r=new wt,o=new wt;function a(c){let u=0,f=0,h=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let d=0,_=0,S=0,p=0,g=0,x=0,M=0,y=0,b=0,E=0,m=0,v=0,w=0,P=0;c.sort(Yx);for(let L=0,F=c.length;L<F;L++){let C=c[L],B=C.color,W=C.intensity,z=C.distance,st=null;if(C.shadow&&C.shadow.map)if(C.shadow.map.texture.format===Fi)st=C.shadow.map.texture;else st=C.shadow.map.depthTexture||C.shadow.map.texture;if(C.isAmbientLight)u+=B.r*W,f+=B.g*W,h+=B.b*W;else if(C.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(C.sh.coefficients[q],W);P++}else if(C.isSunLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Q=C.shadow,et=n.get(C);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[_]=et,i.sunShadowMap[_]=st;let xt=Q.getViewportCount();for(let K=0;K<xt;K++)i.sunShadowMatrix[S+K]=Q.getMatrix(K),i.sunShadowCascade[S+K]=Q._cascadeData[K];S+=xt,_++}i.sun[d]=q,d++}else if(C.isDirectionalLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){let Q=C.shadow,et=n.get(C);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,i.directionalShadow[p]=et,i.directionalShadowMap[p]=st,i.directionalShadowMatrix[p]=C.shadow.matrix,b++}i.directional[p]=q,p++}else if(C.isSpotLight){let q=e.get(C);q.position.setFromMatrixPosition(C.matrixWorld),q.color.copy(B).multiplyScalar(W),q.distance=z,q.coneCos=Math.cos(C.angle),q.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),q.decay=C.decay,i.spot[x]=q;let Q=C.shadow;if(C.map){if(i.spotLightMap[v]=C.map,v++,Q.updateMatrices(C),C.castShadow)w++}if(i.spotLightMatrix[x]=Q.matrix,C.castShadow){let et=n.get(C);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,i.spotShadow[x]=et,i.spotShadowMap[x]=st,m++}x++}else if(C.isRectAreaLight){let q=e.get(C);q.color.copy(B).multiplyScalar(W),q.halfWidth.set(C.width*0.5,0,0),q.halfHeight.set(0,C.height*0.5,0),i.rectArea[M]=q,M++}else if(C.isPointLight){let q=e.get(C);if(q.color.copy(C.color).multiplyScalar(C.intensity),q.distance=C.distance,q.decay=C.decay,C.castShadow){let Q=C.shadow,et=n.get(C);et.shadowIntensity=Q.intensity,et.shadowBias=Q.bias,et.shadowNormalBias=Q.normalBias,et.shadowRadius=Q.radius,et.shadowMapSize=Q.mapSize,et.shadowCameraNear=Q.camera.near,et.shadowCameraFar=Q.camera.far,i.pointShadow[g]=et,i.pointShadowMap[g]=st,i.pointShadowMatrix[g]=C.shadow.matrix,E++}i.point[g]=q,g++}else if(C.isHemisphereLight){let q=e.get(C);q.skyColor.copy(C.color).multiplyScalar(W),q.groundColor.copy(C.groundColor).multiplyScalar(W),i.hemi[y]=q,y++}}if(M>0)if(t.has("OES_texture_float_linear")===!0)i.rectAreaLTC1=dt.LTC_FLOAT_1,i.rectAreaLTC2=dt.LTC_FLOAT_2;else i.rectAreaLTC1=dt.LTC_HALF_1,i.rectAreaLTC2=dt.LTC_HALF_2;i.ambient[0]=u,i.ambient[1]=f,i.ambient[2]=h;let R=i.hash;if(R.sunLength!==d||R.directionalLength!==p||R.pointLength!==g||R.spotLength!==x||R.rectAreaLength!==M||R.hemiLength!==y||R.numSunShadows!==_||R.numDirectionalShadows!==b||R.numPointShadows!==E||R.numSpotShadows!==m||R.numSpotMaps!==v||R.numLightProbes!==P)i.sun.length=d,i.directional.length=p,i.spot.length=x,i.rectArea.length=M,i.point.length=g,i.hemi.length=y,i.sunShadow.length=_,i.sunShadowMap.length=_,i.sunShadowMatrix.length=S,i.sunShadowCascade.length=S,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=m,i.spotShadowMap.length=m,i.spotLightMatrix.length=m+v-w,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=P,R.sunLength=d,R.directionalLength=p,R.pointLength=g,R.spotLength=x,R.rectAreaLength=M,R.hemiLength=y,R.numSunShadows=_,R.numDirectionalShadows=b,R.numPointShadows=E,R.numSpotShadows=m,R.numSpotMaps=v,R.numLightProbes=P,i.version=qx++}function l(c,u){let f=0,h=0,d=0,_=0,S=0,p=0,g=u.matrixWorldInverse;for(let x=0,M=c.length;x<M;x++){let y=c[x];if(y.isSunLight){let b=i.sun[f];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),f++}else if(y.isDirectionalLight){let b=i.directional[h];b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(g),h++}else if(y.isSpotLight){let b=i.spot[_];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),b.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),b.direction.sub(s),b.direction.transformDirection(g),_++}else if(y.isRectAreaLight){let b=i.rectArea[S];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),o.identity(),r.copy(y.matrixWorld),r.premultiply(g),o.extractRotation(r),b.halfWidth.set(y.width*0.5,0,0),b.halfHeight.set(0,y.height*0.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),S++}else if(y.isPointLight){let b=i.point[d];b.position.setFromMatrixPosition(y.matrixWorld),b.position.applyMatrix4(g),d++}else if(y.isHemisphereLight){let b=i.hemi[p];b.direction.setFromMatrixPosition(y.matrixWorld),b.direction.transformDirection(g),p++}}}return{setup:a,setupView:l,state:i}}function Wf(t){let e=new Zx(t),n=[],i=[],s=[];function r(f){u.camera=f,n.length=0,i.length=0,s.length=0}function o(f){if(f.isLightProbeGrid)s.push(f);else n.push(f)}function a(f){i.push(f)}function l(){e.setup(n),s.sort((f,h)=>f.priority-h.priority||f.id-h.id)}function c(f){e.setupView(n,f)}let u={lightsArray:n,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:c,pushLight:o,pushShadow:a}}function Jx(t){let e=new WeakMap;function n(s,r=0){let o=e.get(s),a;if(o===void 0)a=new Wf(t),e.set(s,[a]);else if(r>=o.length)a=new Wf(t),o.push(a);else a=o[r];return a}function i(){e=new WeakMap}return{get:n,dispose:i}}var $x=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Kx=`uniform sampler2D shadow_pass;
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
}`,Qx=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],jx=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Xf=new wt,ur=new N,yc=new N;function ty(t,e,n){let i=new hi,s=new Lt,r=new Lt,o=new oe,a=new sc,l=new rc,c={},u=n.maxTextureSize,f={[Jn]:Ye,[Ye]:Jn,[pn]:pn},h=new ti({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Lt},radius:{value:4}},vertexShader:$x,fragmentShader:Kx}),d=h.clone();d.defines.HORIZONTAL_PASS=1;let _=new Be;_.setAttribute("position",new Ae(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let S=new Ue(_,h),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Js;let g=this.type;this.render=function(E,m,v){if(p.enabled===!1)return;if(p.autoUpdate===!1&&p.needsUpdate===!1)return;if(E.length===0)return;if(this.type===Zh)At("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Js;let w=t.getRenderTarget(),P=t.getActiveCubeFace(),R=t.getActiveMipmapLevel(),L=t.state;if(L.setBlending(Di),L.buffers.depth.getReversed()===!0)L.buffers.color.setClear(0,0,0,0);else L.buffers.color.setClear(1,1,1,1);L.buffers.depth.setTest(!0),L.setScissorTest(!1);let F=g!==this.type;if(F)m.traverse(function(C){if(C.material)if(Array.isArray(C.material))C.material.forEach((B)=>B.needsUpdate=!0);else C.material.needsUpdate=!0});for(let C=0,B=E.length;C<B;C++){let W=E[C],z=W.shadow;if(z===void 0){At("WebGLShadowMap:",W,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let st=z.getFrameExtents();if(s.multiply(st),r.copy(z.mapSize),s.x>u||s.y>u){if(s.x>u)r.x=Math.floor(u/st.x),s.x=r.x*st.x,z.mapSize.x=r.x;if(s.y>u)r.y=Math.floor(u/st.y),s.y=r.y*st.y,z.mapSize.y=r.y}let q=t.state.buffers.depth.getReversed();if(z.camera._reversedDepth=q,z.map===null||F===!0){if(z.map!==null){if(z.map.depthTexture!==null)z.map.depthTexture.dispose(),z.map.depthTexture=null;z.map.dispose()}if(this.type===ps){if(W.isPointLight){At("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new gn(s.x,s.y,{format:Fi,type:Nn,minFilter:mn,magFilter:mn,generateMipmaps:!1}),z.map.texture.name=W.name+".shadowMap",z.map.depthTexture=new mi(s.x,s.y,$n),z.map.depthTexture.name=W.name+".shadowMapDepth",z.map.depthTexture.format=_s,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=ui,z.map.depthTexture.magFilter=ui}else{if(W.isPointLight)z.map=new Do(s.x),z.map.depthTexture=new To(s.x,di);else z.map=new gn(s.x,s.y),z.map.depthTexture=new mi(s.x,s.y,di);if(z.map.depthTexture.name=W.name+".shadowMap",z.map.depthTexture.format=_s,this.type===Js)z.map.depthTexture.compareFunction=q?Fl:Ul,z.map.depthTexture.minFilter=mn,z.map.depthTexture.magFilter=mn;else z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=ui,z.map.depthTexture.magFilter=ui}z.camera.updateProjectionMatrix()}if(z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y))z.map.setSize(s.x,s.y);let Q=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();if(W.isPointLight!==!0)z.updateMatrices(W,v);let et=(z.camera.layers.mask&4294967294)!==0?z.camera.layers:v.layers;for(let xt=0;xt<Q;xt++){let K=z.getCamera(xt);if(W.isPointLight){let{camera:nt,matrix:_t}=z,Rt=W.distance||nt.far;if(Rt!==nt.far)nt.far=Rt,nt.updateProjectionMatrix();ur.setFromMatrixPosition(W.matrixWorld),nt.position.copy(ur),yc.copy(nt.position),yc.add(Qx[xt]),nt.up.copy(jx[xt]),nt.lookAt(yc),nt.updateMatrixWorld(),_t.makeTranslation(-ur.x,-ur.y,-ur.z),Xf.multiplyMatrices(nt.projectionMatrix,nt.matrixWorldInverse),z._frustum.setFromProjectionMatrix(Xf,nt.coordinateSystem,nt.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)t.setRenderTarget(z.map,xt),t.clear();else{if(xt===0)t.setRenderTarget(z.map),t.clear();let nt=z.getViewport(xt);o.set(r.x*nt.x,r.y*nt.y,r.x*nt.z,r.y*nt.w),L.viewport(o)}i=z.getFrustum(xt),y(m,v,K,W,et,this.type)}if(z.isPointLightShadow!==!0&&this.type===ps)x(z,v);z.needsUpdate=!1}g=this.type,p.needsUpdate=!1,t.setRenderTarget(w,P,R)};function x(E,m){let v=e.update(S);if(h.defines.VSM_SAMPLES!==E.blurSamples)h.defines.VSM_SAMPLES=E.blurSamples,d.defines.VSM_SAMPLES=E.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0;if(E.mapPass===null)E.mapPass=new gn(s.x,s.y,{format:Fi,type:Nn});else if(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)E.mapPass.setSize(E.map.width,E.map.height);h.uniforms.shadow_pass.value=E.map.depthTexture,h.uniforms.resolution.value.set(E.map.width,E.map.height),h.uniforms.radius.value=E.radius,t.setRenderTarget(E.mapPass),t.clear(),t.renderBufferDirect(m,null,v,h,S,null),d.uniforms.shadow_pass.value=E.mapPass.texture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,t.setRenderTarget(E.map),t.clear(),t.renderBufferDirect(m,null,v,d,S,null)}function M(E,m,v,w){let P=null,R=v.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(R!==void 0)P=R;else if(P=v.isPointLight===!0?l:a,t.localClippingEnabled&&m.clipShadows===!0&&Array.isArray(m.clippingPlanes)&&m.clippingPlanes.length!==0||m.displacementMap&&m.displacementScale!==0||m.alphaMap&&m.alphaTest>0||m.map&&m.alphaTest>0||m.alphaToCoverage===!0){let L=P.uuid,F=m.uuid,C=c[L];if(C===void 0)C={},c[L]=C;let B=C[F];if(B===void 0)B=P.clone(),C[F]=B,m.addEventListener("dispose",b);P=B}if(P.visible=m.visible,P.wireframe=m.wireframe,w===ps)P.side=m.shadowSide!==null?m.shadowSide:m.side;else P.side=m.shadowSide!==null?m.shadowSide:f[m.side];if(P.alphaMap=m.alphaMap,P.alphaTest=m.alphaToCoverage===!0?0.5:m.alphaTest,P.map=m.map,P.clipShadows=m.clipShadows,P.clippingPlanes=m.clippingPlanes,P.clipIntersection=m.clipIntersection,P.displacementMap=m.displacementMap,P.displacementScale=m.displacementScale,P.displacementBias=m.displacementBias,P.wireframeLinewidth=m.wireframeLinewidth,P.linewidth=m.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let L=t.properties.get(P);L.light=v}return P}function y(E,m,v,w,P,R){if(E.visible===!1)return;if(E.layers.test(P)&&(E.isMesh||E.isLine||E.isPoints)){if((E.castShadow||E.receiveShadow&&R===ps)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,E.matrixWorld);let C=e.update(E),B=E.material;if(Array.isArray(B)){let W=C.groups;for(let z=0,st=W.length;z<st;z++){let q=W[z],Q=B[q.materialIndex];if(Q&&Q.visible){let et=M(E,Q,w,R);E.onBeforeShadow(t,E,m,v,C,et,q),t.renderBufferDirect(v,null,C,et,E,q),E.onAfterShadow(t,E,m,v,C,et,q)}}}else if(B.visible){let W=M(E,B,w,R);E.onBeforeShadow(t,E,m,v,C,W,null),t.renderBufferDirect(v,null,C,W,E,null),E.onAfterShadow(t,E,m,v,C,W,null)}}}let F=E.children;for(let C=0,B=F.length;C<B;C++)y(F[C],m,v,w,P,R)}function b(E){E.target.removeEventListener("dispose",b);for(let v in c){let w=c[v],P=E.target.uuid;if(P in w)w[P].dispose(),delete w[P]}}}function ey(t,e){function n(){let D=!1,Z=new oe,Y=null,it=new oe(0,0,0,0);return{setMask:function(rt){if(Y!==rt&&!D)t.colorMask(rt,rt,rt,rt),Y=rt},setLocked:function(rt){D=rt},setClear:function(rt,ut,Et,Tt,pt){if(pt===!0)rt*=Tt,ut*=Tt,Et*=Tt;if(Z.set(rt,ut,Et,Tt),it.equals(Z)===!1)t.clearColor(rt,ut,Et,Tt),it.copy(Z)},reset:function(){D=!1,Y=null,it.set(-1,0,0,0)}}}function i(){let D=!1,Z=!1,Y=null,it=null,rt=null;return{setReversed:function(ut){if(Z!==ut){let Et=e.get("EXT_clip_control");if(ut)Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.ZERO_TO_ONE_EXT);else Et.clipControlEXT(Et.LOWER_LEFT_EXT,Et.NEGATIVE_ONE_TO_ONE_EXT);Z=ut;let Tt=rt;rt=null,this.setClear(Tt)}},getReversed:function(){return Z},setTest:function(ut){if(ut)yt(t.DEPTH_TEST);else $t(t.DEPTH_TEST)},setMask:function(ut){if(Y!==ut&&!D)t.depthMask(ut),Y=ut},setFunc:function(ut){if(Z)ut=Xu[ut];if(it!==ut){switch(ut){case mu:t.depthFunc(t.NEVER);break;case gu:t.depthFunc(t.ALWAYS);break;case _u:t.depthFunc(t.LESS);break;case Ha:t.depthFunc(t.LEQUAL);break;case xu:t.depthFunc(t.EQUAL);break;case yu:t.depthFunc(t.GEQUAL);break;case vu:t.depthFunc(t.GREATER);break;case Su:t.depthFunc(t.NOTEQUAL);break;default:t.depthFunc(t.LEQUAL)}it=ut}},setLocked:function(ut){D=ut},setClear:function(ut){if(rt!==ut){if(rt=ut,Z)ut=1-ut;t.clearDepth(ut)}},reset:function(){D=!1,Y=null,it=null,rt=null,Z=!1}}}function s(){let D=!1,Z=null,Y=null,it=null,rt=null,ut=null,Et=null,Tt=null,pt=null;return{setTest:function(Ct){if(!D)if(Ct)yt(t.STENCIL_TEST);else $t(t.STENCIL_TEST)},setMask:function(Ct){if(Z!==Ct&&!D)t.stencilMask(Ct),Z=Ct},setFunc:function(Ct,Gt,mt){if(Y!==Ct||it!==Gt||rt!==mt)t.stencilFunc(Ct,Gt,mt),Y=Ct,it=Gt,rt=mt},setOp:function(Ct,Gt,mt){if(ut!==Ct||Et!==Gt||Tt!==mt)t.stencilOp(Ct,Gt,mt),ut=Ct,Et=Gt,Tt=mt},setLocked:function(Ct){D=Ct},setClear:function(Ct){if(pt!==Ct)t.clearStencil(Ct),pt=Ct},reset:function(){D=!1,Z=null,Y=null,it=null,rt=null,ut=null,Et=null,Tt=null,pt=null}}}let r=new n,o=new i,a=new s,l={},c=new WeakMap,u={},f={},h={},d=new WeakMap,_=[],S=null,p=!1,g=null,x=null,M=null,y=null,b=null,E=null,m=null,v=new Dt(0,0,0),w=0,P=!1,R=null,L=null,F=null,C=null,B=null,W=t.getParameter(t.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,st=0,q=t.getParameter(t.VERSION);if(q.indexOf("WebGL")!==-1)st=parseFloat(/^WebGL (\d)/.exec(q)[1]),z=st>=1;else if(q.indexOf("OpenGL ES")!==-1)st=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),z=st>=2;let Q=null,et={},xt=t.getParameter(t.SCISSOR_BOX),K=t.getParameter(t.VIEWPORT),nt=new oe().fromArray(xt),_t=new oe().fromArray(K);function Rt(D,Z,Y,it){let rt=new Uint8Array(4),ut=t.createTexture();t.bindTexture(D,ut),t.texParameteri(D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(D,t.TEXTURE_MAG_FILTER,t.NEAREST);for(let Et=0;Et<Y;Et++)if(D===t.TEXTURE_3D||D===t.TEXTURE_2D_ARRAY)t.texImage3D(Z,0,t.RGBA,1,1,it,0,t.RGBA,t.UNSIGNED_BYTE,rt);else t.texImage2D(Z+Et,0,t.RGBA,1,1,0,t.RGBA,t.UNSIGNED_BYTE,rt);return ut}let It={};It[t.TEXTURE_2D]=Rt(t.TEXTURE_2D,t.TEXTURE_2D,1),It[t.TEXTURE_CUBE_MAP]=Rt(t.TEXTURE_CUBE_MAP,t.TEXTURE_CUBE_MAP_POSITIVE_X,6),It[t.TEXTURE_2D_ARRAY]=Rt(t.TEXTURE_2D_ARRAY,t.TEXTURE_2D_ARRAY,1,1),It[t.TEXTURE_3D]=Rt(t.TEXTURE_3D,t.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),yt(t.DEPTH_TEST),o.setFunc(Ha),ln(!1),Se(Ba),yt(t.CULL_FACE),ve(Di);function yt(D){if(u[D]!==!0)t.enable(D),u[D]=!0}function $t(D){if(u[D]!==!1)t.disable(D),u[D]=!1}function kt(D,Z){if(h[D]!==Z){if(t.bindFramebuffer(D,Z),h[D]=Z,D===t.DRAW_FRAMEBUFFER)h[t.FRAMEBUFFER]=Z;if(D===t.FRAMEBUFFER)h[t.DRAW_FRAMEBUFFER]=Z;return!0}return!1}function zt(D,Z){let Y=_,it=!1;if(D){if(Y=d.get(Z),Y===void 0)Y=[],d.set(Z,Y);let rt=D.textures;if(Y.length!==rt.length||Y[0]!==t.COLOR_ATTACHMENT0){for(let ut=0,Et=rt.length;ut<Et;ut++)Y[ut]=t.COLOR_ATTACHMENT0+ut;Y.length=rt.length,it=!0}}else if(Y[0]!==t.BACK)Y[0]=t.BACK,it=!0;if(it)t.drawBuffers(Y)}function ne(D){if(S!==D)return t.useProgram(D),S=D,!0;return!1}let Yt={[ms]:t.FUNC_ADD,[$h]:t.FUNC_SUBTRACT,[Kh]:t.FUNC_REVERSE_SUBTRACT};Yt[Qh]=t.MIN,Yt[jh]=t.MAX;let xe={[tu]:t.ZERO,[eu]:t.ONE,[nu]:t.SRC_COLOR,[su]:t.SRC_ALPHA,[hu]:t.SRC_ALPHA_SATURATE,[lu]:t.DST_COLOR,[ou]:t.DST_ALPHA,[iu]:t.ONE_MINUS_SRC_COLOR,[ru]:t.ONE_MINUS_SRC_ALPHA,[cu]:t.ONE_MINUS_DST_COLOR,[au]:t.ONE_MINUS_DST_ALPHA,[uu]:t.CONSTANT_COLOR,[fu]:t.ONE_MINUS_CONSTANT_COLOR,[du]:t.CONSTANT_ALPHA,[pu]:t.ONE_MINUS_CONSTANT_ALPHA};function ve(D,Z,Y,it,rt,ut,Et,Tt,pt,Ct){if(D===Di){if(p===!0)$t(t.BLEND),p=!1;return}if(p===!1)yt(t.BLEND),p=!0;if(D!==Jh){if(D!==g||Ct!==P){if(x!==ms||b!==ms)t.blendEquation(t.FUNC_ADD),x=ms,b=ms;if(Ct)switch(D){case $s:t.blendFuncSeparate(t.ONE,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case za:t.blendFunc(t.ONE,t.ONE);break;case Ga:t.blendFuncSeparate(t.ZERO,t.ONE_MINUS_SRC_COLOR,t.ZERO,t.ONE);break;case ka:t.blendFuncSeparate(t.DST_COLOR,t.ONE_MINUS_SRC_ALPHA,t.ZERO,t.ONE);break;default:Nt("WebGLState: Invalid blending: ",D);break}else switch(D){case $s:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA,t.ONE,t.ONE_MINUS_SRC_ALPHA);break;case za:t.blendFuncSeparate(t.SRC_ALPHA,t.ONE,t.ONE,t.ONE);break;case Ga:Nt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case ka:Nt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Nt("WebGLState: Invalid blending: ",D);break}M=null,y=null,E=null,m=null,v.set(0,0,0),w=0,g=D,P=Ct}return}if(rt=rt||Z,ut=ut||Y,Et=Et||it,Z!==x||rt!==b)t.blendEquationSeparate(Yt[Z],Yt[rt]),x=Z,b=rt;if(Y!==M||it!==y||ut!==E||Et!==m)t.blendFuncSeparate(xe[Y],xe[it],xe[ut],xe[Et]),M=Y,y=it,E=ut,m=Et;if(Tt.equals(v)===!1||pt!==w)t.blendColor(Tt.r,Tt.g,Tt.b,pt),v.copy(Tt),w=pt;g=D,P=!1}function tn(D,Z){D.side===pn?$t(t.CULL_FACE):yt(t.CULL_FACE);let Y=D.side===Ye;if(Z)Y=!Y;ln(Y),D.blending===$s&&D.transparent===!1?ve(Di):ve(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);let it=D.stencilWrite;if(a.setTest(it),it)a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass);en(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?yt(t.SAMPLE_ALPHA_TO_COVERAGE):$t(t.SAMPLE_ALPHA_TO_COVERAGE)}function ln(D){if(R!==D){if(D)t.frontFace(t.CW);else t.frontFace(t.CCW);R=D}}function Se(D){if(D!==qh){if(yt(t.CULL_FACE),D!==L)if(D===Ba)t.cullFace(t.BACK);else if(D===Yh)t.cullFace(t.FRONT);else t.cullFace(t.FRONT_AND_BACK)}else $t(t.CULL_FACE);L=D}function Ge(D){if(D!==F){if(z)t.lineWidth(D);F=D}}function en(D,Z,Y){if(D){if(yt(t.POLYGON_OFFSET_FILL),C!==Z||B!==Y){if(C=Z,B=Y,o.getReversed())Z=-Z,Y=-Y;t.polygonOffset(Z,Y)}}else $t(t.POLYGON_OFFSET_FILL)}function nn(D){if(D)yt(t.SCISSOR_TEST);else $t(t.SCISSOR_TEST)}function xn(D){if(D===void 0)D=t.TEXTURE0+W-1;if(Q!==D)t.activeTexture(D),Q=D}function O(D,Z,Y){if(Y===void 0)if(Q===null)Y=t.TEXTURE0+W-1;else Y=Q;let it=et[Y];if(it===void 0)it={type:void 0,texture:void 0},et[Y]=it;if(it.type!==D||it.texture!==Z){if(Q!==Y)t.activeTexture(Y),Q=Y;t.bindTexture(D,Z||It[D]),it.type=D,it.texture=Z}}function yn(){let D=et[Q];if(D!==void 0&&D.type!==void 0)t.bindTexture(D.type,null),D.type=void 0,D.texture=void 0}function se(){try{t.compressedTexImage2D(...arguments)}catch(D){Nt("WebGLState:",D)}}function Pe(){try{t.compressedTexImage3D(...arguments)}catch(D){Nt("WebGLState:",D)}}function ft(){try{t.texSubImage2D(...arguments)}catch(D){Nt("WebGLState:",D)}}function de(){try{t.texSubImage3D(...arguments)}catch(D){Nt("WebGLState:",D)}}function Pt(){try{t.compressedTexSubImage2D(...arguments)}catch(D){Nt("WebGLState:",D)}}function Ot(){try{t.compressedTexSubImage3D(...arguments)}catch(D){Nt("WebGLState:",D)}}function ke(){try{t.texStorage2D(...arguments)}catch(D){Nt("WebGLState:",D)}}function I(){try{t.texStorage3D(...arguments)}catch(D){Nt("WebGLState:",D)}}function T(){try{t.texImage2D(...arguments)}catch(D){Nt("WebGLState:",D)}}function G(){try{t.texImage3D(...arguments)}catch(D){Nt("WebGLState:",D)}}function tt(D){if(f[D]!==void 0)return f[D];else return t.getParameter(D)}function j(D,Z){if(f[D]!==Z)t.pixelStorei(D,Z),f[D]=Z}function ot(D){if(nt.equals(D)===!1)t.scissor(D.x,D.y,D.z,D.w),nt.copy(D)}function ct(D){if(_t.equals(D)===!1)t.viewport(D.x,D.y,D.z,D.w),_t.copy(D)}function X(D,Z){let Y=c.get(Z);if(Y===void 0)Y=new WeakMap,c.set(Z,Y);let it=Y.get(D);if(it===void 0)it=t.getUniformBlockIndex(Z,D.name),t.uniformBlockBinding(Z,it,it),Y.set(D,it)}function J(D,Z,Y){let rt=c.get(Z).get(D);if(l[rt]!==Y)t.bindBufferBase(t.UNIFORM_BUFFER,rt,Y),l[rt]=Y}function at(){t.disable(t.BLEND),t.disable(t.CULL_FACE),t.disable(t.DEPTH_TEST),t.disable(t.POLYGON_OFFSET_FILL),t.disable(t.SCISSOR_TEST),t.disable(t.STENCIL_TEST),t.disable(t.SAMPLE_ALPHA_TO_COVERAGE),t.blendEquation(t.FUNC_ADD),t.blendFunc(t.ONE,t.ZERO),t.blendFuncSeparate(t.ONE,t.ZERO,t.ONE,t.ZERO),t.blendColor(0,0,0,0),t.colorMask(!0,!0,!0,!0),t.clearColor(0,0,0,0),t.depthMask(!0),t.depthFunc(t.LESS),o.setReversed(!1),t.clearDepth(1),t.stencilMask(4294967295),t.stencilFunc(t.ALWAYS,0,4294967295),t.stencilOp(t.KEEP,t.KEEP,t.KEEP),t.clearStencil(0),t.cullFace(t.BACK),t.frontFace(t.CCW),t.polygonOffset(0,0),t.activeTexture(t.TEXTURE0),t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.bindFramebuffer(t.READ_FRAMEBUFFER,null),t.useProgram(null),t.lineWidth(1),t.scissor(0,0,t.canvas.width,t.canvas.height),t.viewport(0,0,t.canvas.width,t.canvas.height),t.pixelStorei(t.PACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_ALIGNMENT,4),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!1),t.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),t.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,t.BROWSER_DEFAULT_WEBGL),t.pixelStorei(t.PACK_ROW_LENGTH,0),t.pixelStorei(t.PACK_SKIP_PIXELS,0),t.pixelStorei(t.PACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_ROW_LENGTH,0),t.pixelStorei(t.UNPACK_IMAGE_HEIGHT,0),t.pixelStorei(t.UNPACK_SKIP_PIXELS,0),t.pixelStorei(t.UNPACK_SKIP_ROWS,0),t.pixelStorei(t.UNPACK_SKIP_IMAGES,0),u={},f={},Q=null,et={},h={},l={},d=new WeakMap,_=[],S=null,p=!1,g=null,x=null,M=null,y=null,b=null,E=null,m=null,v=new Dt(0,0,0),w=0,P=!1,R=null,L=null,F=null,C=null,B=null,nt.set(0,0,t.canvas.width,t.canvas.height),_t.set(0,0,t.canvas.width,t.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:yt,disable:$t,bindFramebuffer:kt,drawBuffers:zt,useProgram:ne,setBlending:ve,setMaterial:tn,setFlipSided:ln,setCullFace:Se,setLineWidth:Ge,setPolygonOffset:en,setScissorTest:nn,activeTexture:xn,bindTexture:O,unbindTexture:yn,compressedTexImage2D:se,compressedTexImage3D:Pe,texImage2D:T,texImage3D:G,pixelStorei:j,getParameter:tt,updateUBOMapping:X,uniformBlockBinding:J,texStorage2D:ke,texStorage3D:I,texSubImage2D:ft,texSubImage3D:de,compressedTexSubImage2D:Pt,compressedTexSubImage3D:Ot,scissor:ot,viewport:ct,reset:at}}function ny(t,e,n,i,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Lt,u=new WeakMap,f=new Set,h,d=new WeakMap,_=new Set,S=new FinalizationRegistry((I)=>_.delete(I)),p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(I){}function g(I,T){return p?new OffscreenCanvas(I,T):fs("canvas")}function x(I,T,G){let tt=1,j=ke(I);if(j.width>G||j.height>G)tt=G/Math.max(j.width,j.height);if(tt<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let ot=Math.floor(tt*j.width),ct=Math.floor(tt*j.height);if(h===void 0)h=g(ot,ct);let X=T?g(ot,ct):h;return X.width=ot,X.height=ct,X.getContext("2d").drawImage(I,0,0,ot,ct),At("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+ot+"x"+ct+")."),X}else{if("data"in I)At("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+").");return I}return I}function M(I){return I.generateMipmaps}function y(I){t.generateMipmap(I)}function b(I){if(I.isWebGLCubeRenderTarget)return t.TEXTURE_CUBE_MAP;if(I.isWebGL3DRenderTarget)return t.TEXTURE_3D;if(I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture)return t.TEXTURE_2D_ARRAY;return t.TEXTURE_2D}function E(I,T,G,tt,j,ot=!1){if(I!==null){if(t[I]!==void 0)return t[I];At("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let ct;if(tt){if(ct=e.get("EXT_texture_norm16"),!ct)At("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let X=T;if(T===t.RED){if(G===t.FLOAT)X=t.R32F;if(G===t.HALF_FLOAT)X=t.R16F;if(G===t.UNSIGNED_BYTE)X=t.R8;if(G===t.UNSIGNED_SHORT&&ct)X=ct.R16_EXT;if(G===t.SHORT&&ct)X=ct.R16_SNORM_EXT}if(T===t.RED_INTEGER){if(G===t.UNSIGNED_BYTE)X=t.R8UI;if(G===t.UNSIGNED_SHORT)X=t.R16UI;if(G===t.UNSIGNED_INT)X=t.R32UI;if(G===t.BYTE)X=t.R8I;if(G===t.SHORT)X=t.R16I;if(G===t.INT)X=t.R32I}if(T===t.RG){if(G===t.FLOAT)X=t.RG32F;if(G===t.HALF_FLOAT)X=t.RG16F;if(G===t.UNSIGNED_BYTE)X=t.RG8;if(G===t.UNSIGNED_SHORT&&ct)X=ct.RG16_EXT;if(G===t.SHORT&&ct)X=ct.RG16_SNORM_EXT}if(T===t.RG_INTEGER){if(G===t.UNSIGNED_BYTE)X=t.RG8UI;if(G===t.UNSIGNED_SHORT)X=t.RG16UI;if(G===t.UNSIGNED_INT)X=t.RG32UI;if(G===t.BYTE)X=t.RG8I;if(G===t.SHORT)X=t.RG16I;if(G===t.INT)X=t.RG32I}if(T===t.RGB_INTEGER){if(G===t.UNSIGNED_BYTE)X=t.RGB8UI;if(G===t.UNSIGNED_SHORT)X=t.RGB16UI;if(G===t.UNSIGNED_INT)X=t.RGB32UI;if(G===t.BYTE)X=t.RGB8I;if(G===t.SHORT)X=t.RGB16I;if(G===t.INT)X=t.RGB32I}if(T===t.RGBA_INTEGER){if(G===t.UNSIGNED_BYTE)X=t.RGBA8UI;if(G===t.UNSIGNED_SHORT)X=t.RGBA16UI;if(G===t.UNSIGNED_INT)X=t.RGBA32UI;if(G===t.BYTE)X=t.RGBA8I;if(G===t.SHORT)X=t.RGBA16I;if(G===t.INT)X=t.RGBA32I}if(T===t.RGB){if(G===t.UNSIGNED_SHORT&&ct)X=ct.RGB16_EXT;if(G===t.SHORT&&ct)X=ct.RGB16_SNORM_EXT;if(G===t.UNSIGNED_INT_5_9_9_9_REV)X=t.RGB9_E5;if(G===t.UNSIGNED_INT_10F_11F_11F_REV)X=t.R11F_G11F_B10F}if(T===t.RGBA){let J=ot?Dl:Vt.getTransfer(j);if(G===t.FLOAT)X=t.RGBA32F;if(G===t.HALF_FLOAT)X=t.RGBA16F;if(G===t.UNSIGNED_BYTE)X=J===he?t.SRGB8_ALPHA8:t.RGBA8;if(G===t.UNSIGNED_SHORT&&ct)X=ct.RGBA16_EXT;if(G===t.SHORT&&ct)X=ct.RGBA16_SNORM_EXT;if(G===t.UNSIGNED_SHORT_4_4_4_4)X=t.RGBA4;if(G===t.UNSIGNED_SHORT_5_5_5_1)X=t.RGB5_A1}if(X===t.R16F||X===t.R32F||X===t.RG16F||X===t.RG32F||X===t.RGBA16F||X===t.RGBA32F)e.get("EXT_color_buffer_float");return X}function m(I,T){let G;if(I){if(T===null||T===di||T===Ui)G=t.DEPTH24_STENCIL8;else if(T===$n)G=t.DEPTH32F_STENCIL8;else if(T===js)G=t.DEPTH24_STENCIL8,At("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(T===null||T===di||T===Ui)G=t.DEPTH_COMPONENT24;else if(T===$n)G=t.DEPTH_COMPONENT32F;else if(T===js)G=t.DEPTH_COMPONENT16;return G}function v(I,T){if(M(I)===!0||I.isFramebufferTexture&&I.minFilter!==ui&&I.minFilter!==mn)return Math.log2(Math.max(T.width,T.height))+1;else if(I.mipmaps.length>0)return I.mipmaps.length;else if(I.isCompressedTexture&&Array.isArray(I.image))return T.mipmaps.length;else return 1}function w(I){let T=new WeakRef(I);i.get(I).__ref=T,_.add(T),S.register(I,T,T)}function P(I){let T=i.get(I).__ref;if(T===void 0)return;_.delete(T),S.unregister(T)}function R(I){F(I.target)}function L(I){C(I.target)}function F(I){if(I.removeEventListener("dispose",R),P(I),W(I),I.isVideoTexture)u.delete(I);if(I.isHTMLTexture)f.delete(I)}function C(I){I.removeEventListener("dispose",L),P(I),st(I)}function B(){for(let I of _){let T=I.deref();if(T===void 0)continue;if(T.isRenderTarget===!0)C(T);else F(T)}_.clear(),f.clear()}function W(I){let T=i.get(I);if(T.__webglInit===void 0)return;let G=I.source,tt=d.get(G);if(tt){let j=tt[T.__cacheKey];if(j.usedTimes--,j.usedTimes===0)z(I);if(Object.keys(tt).length===0)d.delete(G)}i.remove(I)}function z(I){let T=i.get(I);t.deleteTexture(T.__webglTexture);let G=I.source,tt=d.get(G);delete tt[T.__cacheKey],o.memory.textures--}function st(I){let T=i.get(I);if(T.__depthDisposeCallback)T.__depthDisposeCallback();let G=I.depthTexture;if(G&&G.renderTarget===I)F(G);if(I.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(T.__webglFramebuffer[j]))for(let ot=0;ot<T.__webglFramebuffer[j].length;ot++)t.deleteFramebuffer(T.__webglFramebuffer[j][ot]);else t.deleteFramebuffer(T.__webglFramebuffer[j]);if(T.__webglDepthbuffer)t.deleteRenderbuffer(T.__webglDepthbuffer[j])}else{if(Array.isArray(T.__webglFramebuffer))for(let j=0;j<T.__webglFramebuffer.length;j++)t.deleteFramebuffer(T.__webglFramebuffer[j]);else t.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer)t.deleteRenderbuffer(T.__webglDepthbuffer);if(T.__webglMultisampledFramebuffer)t.deleteFramebuffer(T.__webglMultisampledFramebuffer);if(T.__webglColorRenderbuffer){for(let j=0;j<T.__webglColorRenderbuffer.length;j++)if(T.__webglColorRenderbuffer[j])t.deleteRenderbuffer(T.__webglColorRenderbuffer[j])}if(T.__webglDepthRenderbuffer)t.deleteRenderbuffer(T.__webglDepthRenderbuffer)}let tt=I.textures;for(let j=0,ot=tt.length;j<ot;j++){let ct=i.get(tt[j]);if(ct.__webglTexture)t.deleteTexture(ct.__webglTexture),o.memory.textures--;i.remove(tt[j])}i.remove(I)}let q=0;function Q(){q=0}function et(){return q}function xt(I){q=I}function K(){let I=q;if(I>=s.maxTextures)At("WebGLTextures: Trying to use "+(I+1)+" texture units while this GPU supports only "+s.maxTextures);return q+=1,I}function nt(I){let T=[];return T.push(I.wrapS),T.push(I.wrapT),T.push(I.wrapR||0),T.push(I.magFilter),T.push(I.minFilter),T.push(I.anisotropy),T.push(I.internalFormat),T.push(I.format),T.push(I.type),T.push(I.generateMipmaps),T.push(I.mipmapsAutoUpdate),T.push(I.premultiplyAlpha),T.push(I.flipY),T.push(I.unpackAlignment),T.push(I.colorSpace),T.join()}function _t(I,T){let G=i.get(I);if(I.isVideoTexture)Pt(I);if(I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&G.__version!==I.version){let tt=I.image;if(tt===null)At("WebGLRenderer: Texture marked for update but no image data found.");else if(tt.complete===!1)At("WebGLRenderer: Texture marked for update but image is incomplete");else{tn(G,I,T);return}}else if(I.isExternalTexture)G.__webglTexture=I.sourceTexture?I.sourceTexture:null;n.bindTexture(t.TEXTURE_2D,G.__webglTexture,t.TEXTURE0+T)}function Rt(I,T){let G=i.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&G.__version!==I.version){tn(G,I,T);return}else if(I.isExternalTexture)G.__webglTexture=I.sourceTexture?I.sourceTexture:null;n.bindTexture(t.TEXTURE_2D_ARRAY,G.__webglTexture,t.TEXTURE0+T)}function It(I,T){let G=i.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&G.__version!==I.version){tn(G,I,T);return}n.bindTexture(t.TEXTURE_3D,G.__webglTexture,t.TEXTURE0+T)}function yt(I,T){let G=i.get(I);if(I.version>0&&G.__version!==I.version){ln(G,I,T);return}n.bindTexture(t.TEXTURE_CUBE_MAP,G.__webglTexture,t.TEXTURE0+T)}let $t={[Au]:t.REPEAT,[ao]:t.CLAMP_TO_EDGE,[Eu]:t.MIRRORED_REPEAT},kt={[ui]:t.NEAREST,[wu]:t.NEAREST_MIPMAP_NEAREST,[Qs]:t.NEAREST_MIPMAP_LINEAR,[mn]:t.LINEAR,[lo]:t.LINEAR_MIPMAP_NEAREST,[fi]:t.LINEAR_MIPMAP_LINEAR},zt={[Ou]:t.NEVER,[Ol]:t.ALWAYS,[Bu]:t.LESS,[Ul]:t.LEQUAL,[zu]:t.EQUAL,[Fl]:t.GEQUAL,[Gu]:t.GREATER,[ku]:t.NOTEQUAL};function ne(I,T){if(T.type===$n&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===mn||T.magFilter===lo||T.magFilter===Qs||T.magFilter===fi||T.minFilter===mn||T.minFilter===lo||T.minFilter===Qs||T.minFilter===fi))At("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(t.texParameteri(I,t.TEXTURE_WRAP_S,$t[T.wrapS]),t.texParameteri(I,t.TEXTURE_WRAP_T,$t[T.wrapT]),I===t.TEXTURE_3D||I===t.TEXTURE_2D_ARRAY)t.texParameteri(I,t.TEXTURE_WRAP_R,$t[T.wrapR]);if(t.texParameteri(I,t.TEXTURE_MAG_FILTER,kt[T.magFilter]),t.texParameteri(I,t.TEXTURE_MIN_FILTER,kt[T.minFilter]),T.compareFunction)t.texParameteri(I,t.TEXTURE_COMPARE_MODE,t.COMPARE_REF_TO_TEXTURE),t.texParameteri(I,t.TEXTURE_COMPARE_FUNC,zt[T.compareFunction]);if(e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===ui)return;if(T.minFilter!==Qs&&T.minFilter!==fi)return;if(T.type===$n&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||i.get(T).__currentAnisotropy){let G=e.get("EXT_texture_filter_anisotropic");t.texParameterf(I,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),i.get(T).__currentAnisotropy=T.anisotropy}}}function Yt(I,T){let G=!1;if(I.__webglInit===void 0)I.__webglInit=!0,T.addEventListener("dispose",R),w(T);let tt=T.source,j=d.get(tt);if(j===void 0)j={},d.set(tt,j);let ot=nt(T);if(ot!==I.__cacheKey){if(j[ot]===void 0)j[ot]={texture:t.createTexture(),usedTimes:0},o.memory.textures++,G=!0;j[ot].usedTimes++;let ct=j[I.__cacheKey];if(ct!==void 0){if(j[I.__cacheKey].usedTimes--,ct.usedTimes===0)z(T)}I.__cacheKey=ot,I.__webglTexture=j[ot].texture}return G}function xe(I,T,G){return Math.floor(Math.floor(I/G)/T)}function ve(I,T,G,tt){let ot=I.updateRanges;if(ot.length===0)n.texSubImage2D(t.TEXTURE_2D,0,0,0,T.width,T.height,G,tt,T.data);else{ot.sort((D,Z)=>D.start-Z.start);let ct=0;for(let D=1;D<ot.length;D++){let Z=ot[ct],Y=ot[D],it=Z.start+Z.count,rt=xe(Y.start,T.width,4),ut=xe(Z.start,T.width,4);if(Y.start<=it+1&&rt===ut&&xe(Y.start+Y.count-1,T.width,4)===rt)Z.count=Math.max(Z.count,Y.start+Y.count-Z.start);else++ct,ot[ct]=Y}ot.length=ct+1;let X=n.getParameter(t.UNPACK_ROW_LENGTH),J=n.getParameter(t.UNPACK_SKIP_PIXELS),at=n.getParameter(t.UNPACK_SKIP_ROWS);n.pixelStorei(t.UNPACK_ROW_LENGTH,T.width);for(let D=0,Z=ot.length;D<Z;D++){let Y=ot[D],it=Math.floor(Y.start/4),rt=Math.ceil(Y.count/4),ut=it%T.width,Et=Math.floor(it/T.width),Tt=rt,pt=1;n.pixelStorei(t.UNPACK_SKIP_PIXELS,ut),n.pixelStorei(t.UNPACK_SKIP_ROWS,Et),n.texSubImage2D(t.TEXTURE_2D,0,ut,Et,Tt,1,G,tt,T.data)}I.clearUpdateRanges(),n.pixelStorei(t.UNPACK_ROW_LENGTH,X),n.pixelStorei(t.UNPACK_SKIP_PIXELS,J),n.pixelStorei(t.UNPACK_SKIP_ROWS,at)}}function tn(I,T,G){let tt=t.TEXTURE_2D;if(T.isDataArrayTexture||T.isCompressedArrayTexture)tt=t.TEXTURE_2D_ARRAY;if(T.isData3DTexture)tt=t.TEXTURE_3D;let j=Yt(I,T),ot=T.source;n.bindTexture(tt,I.__webglTexture,t.TEXTURE0+G);let ct=i.get(ot);if(ot.version!==ct.__version||j===!0){if(n.activeTexture(t.TEXTURE0+G),(typeof ImageBitmap<"u"&&T.image instanceof ImageBitmap)===!1){let pt=Vt.getPrimaries(Vt.workingColorSpace),Ct=T.colorSpace===Oi?null:Vt.getPrimaries(T.colorSpace),Gt=T.colorSpace===Oi||pt===Ct?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,Gt)}n.pixelStorei(t.UNPACK_ALIGNMENT,T.unpackAlignment);let J=x(T.image,!1,s.maxTextureSize);J=Ot(T,J);let at=r.convert(T.format,T.colorSpace),D=r.convert(T.type),Z=E(T.internalFormat,at,D,T.normalized,T.colorSpace,T.isVideoTexture);ne(tt,T);let Y,it=T.mipmaps,rt=T.isVideoTexture!==!0,ut=ct.__version===void 0||j===!0,Et=ot.dataReady,Tt=v(T,J);if(T.isDepthTexture){if(Z=m(T.format===pi,T.type),ut)if(rt)n.texStorage2D(t.TEXTURE_2D,1,Z,J.width,J.height);else n.texImage2D(t.TEXTURE_2D,0,Z,J.width,J.height,0,at,D,null)}else if(T.isDataTexture)if(it.length>0){if(rt&&ut)n.texStorage2D(t.TEXTURE_2D,Tt,Z,it[0].width,it[0].height);for(let pt=0,Ct=it.length;pt<Ct;pt++)if(Y=it[pt],rt){if(Et)n.texSubImage2D(t.TEXTURE_2D,pt,0,0,Y.width,Y.height,at,D,Y.data)}else n.texImage2D(t.TEXTURE_2D,pt,Z,Y.width,Y.height,0,at,D,Y.data);T.generateMipmaps=!1}else if(rt){if(ut)n.texStorage2D(t.TEXTURE_2D,Tt,Z,J.width,J.height);if(Et)ve(T,J,at,D)}else n.texImage2D(t.TEXTURE_2D,0,Z,J.width,J.height,0,at,D,J.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){if(rt&&ut)n.texStorage3D(t.TEXTURE_2D_ARRAY,Tt,Z,it[0].width,it[0].height,J.depth);for(let pt=0,Ct=it.length;pt<Ct;pt++)if(Y=it[pt],T.format!==Kn)if(at!==null)if(rt){if(Et)if(T.layerUpdates.size>0){let Gt=_c(Y.width,Y.height,T.format,T.type);for(let mt of T.layerUpdates){let re=Y.data.subarray(mt*Gt/Y.data.BYTES_PER_ELEMENT,(mt+1)*Gt/Y.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,pt,0,0,mt,Y.width,Y.height,1,at,re)}}else n.compressedTexSubImage3D(t.TEXTURE_2D_ARRAY,pt,0,0,0,Y.width,Y.height,J.depth,at,Y.data)}else n.compressedTexImage3D(t.TEXTURE_2D_ARRAY,pt,Z,Y.width,Y.height,J.depth,0,Y.data,0,0);else At("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(rt){if(Et)n.texSubImage3D(t.TEXTURE_2D_ARRAY,pt,0,0,0,Y.width,Y.height,J.depth,at,D,Y.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,pt,Z,Y.width,Y.height,J.depth,0,at,D,Y.data);if(T.layerUpdates.size>0)T.clearLayerUpdates()}else{if(rt&&ut)n.texStorage2D(t.TEXTURE_2D,Tt,Z,it[0].width,it[0].height);for(let pt=0,Ct=it.length;pt<Ct;pt++)if(Y=it[pt],T.format!==Kn)if(at!==null)if(rt){if(Et)n.compressedTexSubImage2D(t.TEXTURE_2D,pt,0,0,Y.width,Y.height,at,Y.data)}else n.compressedTexImage2D(t.TEXTURE_2D,pt,Z,Y.width,Y.height,0,Y.data);else At("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(rt){if(Et)n.texSubImage2D(t.TEXTURE_2D,pt,0,0,Y.width,Y.height,at,D,Y.data)}else n.texImage2D(t.TEXTURE_2D,pt,Z,Y.width,Y.height,0,at,D,Y.data)}else if(T.isDataArrayTexture)if(rt){if(ut)n.texStorage3D(t.TEXTURE_2D_ARRAY,Tt,Z,J.width,J.height,J.depth);if(Et)if(T.layerUpdates.size>0){let pt=_c(J.width,J.height,T.format,T.type);for(let Ct of T.layerUpdates){let Gt=J.data.subarray(Ct*pt/J.data.BYTES_PER_ELEMENT,(Ct+1)*pt/J.data.BYTES_PER_ELEMENT);n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,Ct,J.width,J.height,1,at,D,Gt)}T.clearLayerUpdates()}else n.texSubImage3D(t.TEXTURE_2D_ARRAY,0,0,0,0,J.width,J.height,J.depth,at,D,J.data)}else n.texImage3D(t.TEXTURE_2D_ARRAY,0,Z,J.width,J.height,J.depth,0,at,D,J.data);else if(T.isData3DTexture)if(rt){if(ut)n.texStorage3D(t.TEXTURE_3D,Tt,Z,J.width,J.height,J.depth);if(Et)n.texSubImage3D(t.TEXTURE_3D,0,0,0,0,J.width,J.height,J.depth,at,D,J.data)}else n.texImage3D(t.TEXTURE_3D,0,Z,J.width,J.height,J.depth,0,at,D,J.data);else if(T.isFramebufferTexture){if(ut)if(rt)n.texStorage2D(t.TEXTURE_2D,Tt,Z,J.width,J.height);else{let{width:pt,height:Ct}=J;for(let Gt=0;Gt<Tt;Gt++)n.texImage2D(t.TEXTURE_2D,Gt,Z,pt,Ct,0,at,D,null),pt>>=1,Ct>>=1}}else if(T.isHTMLTexture){if("texElementImage2D"in t){let pt=t.canvas;if(!pt.hasAttribute("layoutsubtree"))pt.setAttribute("layoutsubtree","true");if(J.parentNode!==pt){pt.appendChild(J),f.add(T),pt.onpaint=(Ct)=>{let Gt=Ct.changedElements;for(let mt of f)if(Gt.includes(mt.image))mt.needsUpdate=!0},pt.requestPaint();return}if(t.texElementImage2D.length===3)t.texElementImage2D(t.TEXTURE_2D,t.RGBA8,J);else{let{RGBA:Gt,RGBA:mt,UNSIGNED_BYTE:re}=t;t.texElementImage2D(t.TEXTURE_2D,0,Gt,mt,re,J)}t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}}else if(it.length>0){if(rt&&ut){let pt=ke(it[0]);n.texStorage2D(t.TEXTURE_2D,Tt,Z,pt.width,pt.height)}for(let pt=0,Ct=it.length;pt<Ct;pt++)if(Y=it[pt],rt){if(Et)n.texSubImage2D(t.TEXTURE_2D,pt,0,0,at,D,Y)}else n.texImage2D(t.TEXTURE_2D,pt,Z,at,D,Y);T.generateMipmaps=!1}else if(rt){if(ut){let pt=ke(J);n.texStorage2D(t.TEXTURE_2D,Tt,Z,pt.width,pt.height)}if(Et)n.texSubImage2D(t.TEXTURE_2D,0,0,0,at,D,J)}else n.texImage2D(t.TEXTURE_2D,0,Z,at,D,J);if(M(T)&&T.mipmapsAutoUpdate===!0)y(tt);if(ct.__version=ot.version,T.onUpdate)T.onUpdate(T)}I.__version=T.version}function ln(I,T,G){if(T.image.length!==6)return;let tt=Yt(I,T),j=T.source;n.bindTexture(t.TEXTURE_CUBE_MAP,I.__webglTexture,t.TEXTURE0+G);let ot=i.get(j);if(j.version!==ot.__version||tt===!0){n.activeTexture(t.TEXTURE0+G);let ct=Vt.getPrimaries(Vt.workingColorSpace),X=T.colorSpace===Oi?null:Vt.getPrimaries(T.colorSpace),J=T.colorSpace===Oi||ct===X?t.NONE:t.BROWSER_DEFAULT_WEBGL;n.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(t.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(t.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(t.UNPACK_COLORSPACE_CONVERSION_WEBGL,J);let at=T.isCompressedTexture||T.image[0].isCompressedTexture,D=T.image[0]&&T.image[0].isDataTexture,Z=[];for(let mt=0;mt<6;mt++){if(!at&&!D)Z[mt]=x(T.image[mt],!0,s.maxCubemapSize);else Z[mt]=D?T.image[mt].image:T.image[mt];Z[mt]=Ot(T,Z[mt])}let Y=Z[0],it=r.convert(T.format,T.colorSpace),rt=r.convert(T.type),ut=E(T.internalFormat,it,rt,T.normalized,T.colorSpace),Et=T.isVideoTexture!==!0,Tt=ot.__version===void 0||tt===!0,pt=j.dataReady,Ct=v(T,Y);ne(t.TEXTURE_CUBE_MAP,T);let Gt;if(T.isDepthTexture){if(ut=m(T.format===pi,T.type),Tt)if(Et)n.texStorage2D(t.TEXTURE_CUBE_MAP,1,ut,Y.width,Y.height);else for(let mt=0;mt<6;mt++)n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,ut,Y.width,Y.height,0,it,rt,null)}else if(at){if(Et&&Tt)n.texStorage2D(t.TEXTURE_CUBE_MAP,Ct,ut,Y.width,Y.height);for(let mt=0;mt<6;mt++){Gt=Z[mt].mipmaps;for(let re=0;re<Gt.length;re++){let Le=Gt[re];if(T.format!==Kn)if(it!==null)if(Et){if(pt)n.compressedTexSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re,0,0,Le.width,Le.height,it,Le.data)}else n.compressedTexImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re,ut,Le.width,Le.height,0,Le.data);else At("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Et){if(pt)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re,0,0,Le.width,Le.height,it,rt,Le.data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re,ut,Le.width,Le.height,0,it,rt,Le.data)}}}else{if(Gt=T.mipmaps,Et&&Tt){if(Gt.length>0)Ct++;let mt=ke(Z[0]);n.texStorage2D(t.TEXTURE_CUBE_MAP,Ct,ut,mt.width,mt.height)}for(let mt=0;mt<6;mt++)if(D){if(Et){if(pt)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,Z[mt].width,Z[mt].height,it,rt,Z[mt].data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,ut,Z[mt].width,Z[mt].height,0,it,rt,Z[mt].data);for(let re=0;re<Gt.length;re++){let Gn=Gt[re].image[mt].image;if(Et){if(pt)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re+1,0,0,Gn.width,Gn.height,it,rt,Gn.data)}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re+1,ut,Gn.width,Gn.height,0,it,rt,Gn.data)}}else{if(Et){if(pt)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,0,0,it,rt,Z[mt])}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,ut,it,rt,Z[mt]);for(let re=0;re<Gt.length;re++){let Le=Gt[re];if(Et){if(pt)n.texSubImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re+1,0,0,it,rt,Le.image[mt])}else n.texImage2D(t.TEXTURE_CUBE_MAP_POSITIVE_X+mt,re+1,ut,it,rt,Le.image[mt])}}}if(M(T)&&T.mipmapsAutoUpdate===!0)y(t.TEXTURE_CUBE_MAP);if(ot.__version=j.version,T.onUpdate)T.onUpdate(T)}I.__version=T.version}function Se(I,T,G,tt,j,ot){let ct=r.convert(G.format,G.colorSpace),X=r.convert(G.type),J=E(G.internalFormat,ct,X,G.normalized,G.colorSpace),at=i.get(T),D=i.get(G);if(D.__renderTarget=T,!at.__hasExternalTextures){let Z=Math.max(1,T.width>>ot),Y=Math.max(1,T.height>>ot);if(j===t.TEXTURE_3D||j===t.TEXTURE_2D_ARRAY)n.texImage3D(j,ot,J,Z,Y,T.depth,0,ct,X,null);else n.texImage2D(j,ot,J,Z,Y,0,ct,X,null)}if(n.bindFramebuffer(t.FRAMEBUFFER,I),de(T))a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,tt,j,D.__webglTexture,0,ft(T));else if(j===t.TEXTURE_2D||j>=t.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=t.TEXTURE_CUBE_MAP_NEGATIVE_Z)t.framebufferTexture2D(t.FRAMEBUFFER,tt,j,D.__webglTexture,ot);n.bindFramebuffer(t.FRAMEBUFFER,null)}function Ge(I,T,G){if(t.bindRenderbuffer(t.RENDERBUFFER,I),T.depthBuffer){let tt=T.depthTexture,j=tt&&tt.isDepthTexture?tt.type:null,ot=m(T.stencilBuffer,j),ct=T.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(de(T))a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ft(T),ot,T.width,T.height);else if(G)t.renderbufferStorageMultisample(t.RENDERBUFFER,ft(T),ot,T.width,T.height);else t.renderbufferStorage(t.RENDERBUFFER,ot,T.width,T.height);t.framebufferRenderbuffer(t.FRAMEBUFFER,ct,t.RENDERBUFFER,I)}else{let tt=T.textures;for(let j=0;j<tt.length;j++){let ot=tt[j],ct=r.convert(ot.format,ot.colorSpace),X=r.convert(ot.type),J=E(ot.internalFormat,ct,X,ot.normalized,ot.colorSpace);if(de(T))a.renderbufferStorageMultisampleEXT(t.RENDERBUFFER,ft(T),J,T.width,T.height);else if(G)t.renderbufferStorageMultisample(t.RENDERBUFFER,ft(T),J,T.width,T.height);else t.renderbufferStorage(t.RENDERBUFFER,J,T.width,T.height)}}t.bindRenderbuffer(t.RENDERBUFFER,null)}function en(I,T,G){let tt=T.isWebGLCubeRenderTarget===!0;if(n.bindFramebuffer(t.FRAMEBUFFER,I),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let j=i.get(T.depthTexture);j.__renderTarget=T;let ot=tt?T.depthTexture.image[0]:T.depthTexture.image;if(!j.__webglTexture||ot.width!==T.width||ot.height!==T.height)ot.width=T.width,ot.height=T.height,T.depthTexture.needsUpdate=!0;if(tt)yt(T.depthTexture,0);else _t(T.depthTexture,0);let ct=j.__webglTexture,X=ft(T),J=tt?t.TEXTURE_CUBE_MAP_POSITIVE_X+G:t.TEXTURE_2D,at=T.depthTexture.format===pi?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;if(T.depthTexture.format===_s)if(de(T))a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,at,J,ct,0,X);else t.framebufferTexture2D(t.FRAMEBUFFER,at,J,ct,0);else if(T.depthTexture.format===pi)if(de(T))a.framebufferTexture2DMultisampleEXT(t.FRAMEBUFFER,at,J,ct,0,X);else t.framebufferTexture2D(t.FRAMEBUFFER,at,J,ct,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function nn(I){let T=i.get(I),G=I.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==I.depthTexture){let tt=I.depthTexture;if(T.__depthDisposeCallback)T.__depthDisposeCallback();if(tt){let j=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,tt.removeEventListener("dispose",j)};tt.addEventListener("dispose",j),T.__depthDisposeCallback=j}T.__boundDepthTexture=tt}if(I.depthTexture&&!T.__autoAllocateDepthBuffer)if(G)for(let tt=0;tt<6;tt++)en(T.__webglFramebuffer[tt],I,tt);else if(I.texture.mipmaps.length>0)en(T.__webglFramebuffer[0],I,0);else en(T.__webglFramebuffer,I,0);else if(G){T.__webglDepthbuffer=[];for(let tt=0;tt<6;tt++)if(n.bindFramebuffer(t.FRAMEBUFFER,T.__webglFramebuffer[tt]),T.__webglDepthbuffer[tt]===void 0)T.__webglDepthbuffer[tt]=t.createRenderbuffer(),Ge(T.__webglDepthbuffer[tt],I,!1);else{let j=I.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ot=T.__webglDepthbuffer[tt];t.bindRenderbuffer(t.RENDERBUFFER,ot),t.framebufferRenderbuffer(t.FRAMEBUFFER,j,t.RENDERBUFFER,ot)}}else{if(I.texture.mipmaps.length>0)n.bindFramebuffer(t.FRAMEBUFFER,T.__webglFramebuffer[0]);else n.bindFramebuffer(t.FRAMEBUFFER,T.__webglFramebuffer);if(T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=t.createRenderbuffer(),Ge(T.__webglDepthbuffer,I,!1);else{let j=I.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ot=T.__webglDepthbuffer;t.bindRenderbuffer(t.RENDERBUFFER,ot),t.framebufferRenderbuffer(t.FRAMEBUFFER,j,t.RENDERBUFFER,ot)}}n.bindFramebuffer(t.FRAMEBUFFER,null)}function xn(I,T,G){let tt=i.get(I);if(T!==void 0)Se(tt.__webglFramebuffer,I,I.texture,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,0);if(G!==void 0)nn(I)}function O(I){let T=I.texture,G=i.get(I),tt=i.get(T);I.addEventListener("dispose",L),w(I);let j=I.textures,ot=I.isWebGLCubeRenderTarget===!0,ct=j.length>1;if(!ct){if(tt.__webglTexture===void 0)tt.__webglTexture=t.createTexture();tt.__version=T.version,o.memory.textures++}if(ot){G.__webglFramebuffer=[];for(let X=0;X<6;X++)if(T.mipmaps.length>0){G.__webglFramebuffer[X]=[];for(let J=0;J<T.mipmaps.length;J++)G.__webglFramebuffer[X][J]=t.createFramebuffer()}else G.__webglFramebuffer[X]=t.createFramebuffer()}else{if(T.mipmaps.length>0){G.__webglFramebuffer=[];for(let X=0;X<T.mipmaps.length;X++)G.__webglFramebuffer[X]=t.createFramebuffer()}else G.__webglFramebuffer=t.createFramebuffer();if(ct)for(let X=0,J=j.length;X<J;X++){let at=i.get(j[X]);if(at.__webglTexture===void 0)at.__webglTexture=t.createTexture(),o.memory.textures++}if(I.samples>0&&de(I)===!1){G.__webglMultisampledFramebuffer=t.createFramebuffer(),G.__webglColorRenderbuffer=[],n.bindFramebuffer(t.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let X=0;X<j.length;X++){let J=j[X];G.__webglColorRenderbuffer[X]=t.createRenderbuffer(),t.bindRenderbuffer(t.RENDERBUFFER,G.__webglColorRenderbuffer[X]);let at=r.convert(J.format,J.colorSpace),D=r.convert(J.type),Z=E(J.internalFormat,at,D,J.normalized,J.colorSpace,I.isXRRenderTarget===!0),Y=ft(I);t.renderbufferStorageMultisample(t.RENDERBUFFER,Y,Z,I.width,I.height),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+X,t.RENDERBUFFER,G.__webglColorRenderbuffer[X])}if(t.bindRenderbuffer(t.RENDERBUFFER,null),I.depthBuffer)G.__webglDepthRenderbuffer=t.createRenderbuffer(),Ge(G.__webglDepthRenderbuffer,I,!0);n.bindFramebuffer(t.FRAMEBUFFER,null)}}if(ot){n.bindTexture(t.TEXTURE_CUBE_MAP,tt.__webglTexture),ne(t.TEXTURE_CUBE_MAP,T);for(let X=0;X<6;X++)if(T.mipmaps.length>0)for(let J=0;J<T.mipmaps.length;J++)Se(G.__webglFramebuffer[X][J],I,T,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+X,J);else Se(G.__webglFramebuffer[X],I,T,t.COLOR_ATTACHMENT0,t.TEXTURE_CUBE_MAP_POSITIVE_X+X,0);if(M(T))y(t.TEXTURE_CUBE_MAP);else if(T.mipmaps.length>0)t.texParameteri(t.TEXTURE_CUBE_MAP,t.TEXTURE_MAX_LEVEL,T.mipmaps.length-1);n.unbindTexture()}else if(ct){for(let X=0,J=j.length;X<J;X++){let at=j[X],D=i.get(at),Z=t.TEXTURE_2D;if(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)Z=I.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(n.bindTexture(Z,D.__webglTexture),ne(Z,at),Se(G.__webglFramebuffer,I,at,t.COLOR_ATTACHMENT0+X,Z,0),M(at))y(Z)}n.unbindTexture()}else{let X=t.TEXTURE_2D;if(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)X=I.isWebGL3DRenderTarget?t.TEXTURE_3D:t.TEXTURE_2D_ARRAY;if(n.bindTexture(X,tt.__webglTexture),ne(X,T),T.mipmaps.length>0)for(let J=0;J<T.mipmaps.length;J++)Se(G.__webglFramebuffer[J],I,T,t.COLOR_ATTACHMENT0,X,J);else Se(G.__webglFramebuffer,I,T,t.COLOR_ATTACHMENT0,X,0);if(M(T))y(X);else if(T.mipmaps.length>0)t.texParameteri(X,t.TEXTURE_MAX_LEVEL,T.mipmaps.length-1);n.unbindTexture()}if(I.depthBuffer)nn(I)}function yn(I){let T=I.textures;for(let G=0,tt=T.length;G<tt;G++){let j=T[G];if(M(j)&&j.mipmapsAutoUpdate===!0){let ot=b(I),ct=i.get(j).__webglTexture;n.bindTexture(ot,ct),y(ot),n.unbindTexture()}}}let se=[];function Pe(I){if(I.samples>0){if(de(I)===!1){let{textures:T,width:G,height:tt}=I,j=t.COLOR_BUFFER_BIT,ot=I.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT,ct=i.get(I),X=T.length>1;if(X)for(let at=0;at<T.length;at++)n.bindFramebuffer(t.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+at,t.RENDERBUFFER,null),n.bindFramebuffer(t.FRAMEBUFFER,ct.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+at,t.TEXTURE_2D,null,0);if(n.bindFramebuffer(t.READ_FRAMEBUFFER,ct.__webglMultisampledFramebuffer),I.texture.mipmaps.length>0)n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ct.__webglFramebuffer[0]);else n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let at=0;at<T.length;at++){if(I.resolveDepthBuffer){if(I.depthBuffer)j|=t.DEPTH_BUFFER_BIT;if(I.stencilBuffer&&I.resolveStencilBuffer)j|=t.STENCIL_BUFFER_BIT}if(X){t.framebufferRenderbuffer(t.READ_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.RENDERBUFFER,ct.__webglColorRenderbuffer[at]);let D=i.get(T[at]).__webglTexture;t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,D,0)}if(t.blitFramebuffer(0,0,G,tt,0,0,G,tt,j,t.NEAREST),l===!0){if(se.length=0,se.push(t.COLOR_ATTACHMENT0+at),I.depthBuffer&&I.storeMultisampledDepthBuffer===!1)se.push(ot);t.invalidateFramebuffer(t.READ_FRAMEBUFFER,se)}}if(n.bindFramebuffer(t.READ_FRAMEBUFFER,null),n.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),X)for(let at=0;at<T.length;at++){n.bindFramebuffer(t.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0+at,t.RENDERBUFFER,ct.__webglColorRenderbuffer[at]);let D=i.get(T[at]).__webglTexture;n.bindFramebuffer(t.FRAMEBUFFER,ct.__webglFramebuffer),t.framebufferTexture2D(t.DRAW_FRAMEBUFFER,t.COLOR_ATTACHMENT0+at,t.TEXTURE_2D,D,0)}n.bindFramebuffer(t.DRAW_FRAMEBUFFER,ct.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&l){let T=I.stencilBuffer?t.DEPTH_STENCIL_ATTACHMENT:t.DEPTH_ATTACHMENT;t.invalidateFramebuffer(t.DRAW_FRAMEBUFFER,[T])}}}function ft(I){return Math.min(s.maxSamples,I.samples)}function de(I){let T=i.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Pt(I){let T=o.render.frame;if(u.get(I)!==T)u.set(I,T),I.update()}function Ot(I,T){let{colorSpace:G,format:tt,type:j}=I;if(I.isCompressedTexture===!0||I.isVideoTexture===!0)return T;if(G!==Nl&&G!==Oi)if(Vt.getTransfer(G)===he){if(tt!==Kn||j!==An)At("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Nt("WebGLTextures: Unsupported texture color space:",G);return T}function ke(I){if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement)c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height;else if(typeof VideoFrame<"u"&&I instanceof VideoFrame)c.width=I.displayWidth,c.height=I.displayHeight;else c.width=I.width,c.height=I.height;return c}this.allocateTextureUnit=K,this.resetTextureUnits=Q,this.getTextureUnits=et,this.setTextureUnits=xt,this.setTexture2D=_t,this.setTexture2DArray=Rt,this.setTexture3D=It,this.setTextureCube=yt,this.rebindTextures=xn,this.setupRenderTarget=O,this.updateRenderTargetMipmap=yn,this.updateMultisampleRenderTarget=Pe,this.setupDepthRenderbuffer=nn,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=de,this.dispose=B}function iy(t,e){function n(i,s=Oi){let r,o=Vt.getTransfer(s);if(i===An)return t.UNSIGNED_BYTE;if(i===Ka)return t.UNSIGNED_SHORT_4_4_4_4;if(i===Qa)return t.UNSIGNED_SHORT_5_5_5_1;if(i===Iu)return t.UNSIGNED_INT_5_9_9_9_REV;if(i===Pu)return t.UNSIGNED_INT_10F_11F_11F_REV;if(i===Ru)return t.BYTE;if(i===Cu)return t.SHORT;if(i===js)return t.UNSIGNED_SHORT;if(i===$a)return t.INT;if(i===di)return t.UNSIGNED_INT;if(i===$n)return t.FLOAT;if(i===Nn)return t.HALF_FLOAT;if(i===Lu)return t.ALPHA;if(i===Nu)return t.RGB;if(i===Kn)return t.RGBA;if(i===_s)return t.DEPTH_COMPONENT;if(i===pi)return t.DEPTH_STENCIL;if(i===Du)return t.RED;if(i===ja)return t.RED_INTEGER;if(i===Fi)return t.RG;if(i===tl)return t.RG_INTEGER;if(i===el)return t.RGBA_INTEGER;if(i===co||i===ho||i===uo||i===fo)if(o===he)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===co)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ho)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===uo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===fo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===co)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ho)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===uo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===fo)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===nl||i===il||i===sl||i===rl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===nl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===il)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===sl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===rl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ol||i===al||i===ll||i===cl||i===hl||i===po||i===ul)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===ol||i===al)return o===he?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===ll)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===cl)return r.COMPRESSED_R11_EAC;if(i===hl)return r.COMPRESSED_SIGNED_R11_EAC;if(i===po)return r.COMPRESSED_RG11_EAC;if(i===ul)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===fl||i===dl||i===pl||i===ml||i===gl||i===_l||i===xl||i===yl||i===vl||i===Sl||i===Ml||i===bl||i===Tl||i===Al)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===fl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===dl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===pl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ml)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===gl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===_l)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===xl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===yl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===vl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Sl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ml)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===bl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Tl)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Al)return o===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===El||i===wl||i===Rl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===El)return o===he?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===wl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Rl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Cl||i===Il||i===mo||i===Pl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Cl)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===mo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Pl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(i===Ui)return t.UNSIGNED_INT_24_8;return t[i]!==void 0?t[i]:null}return{convert:n}}var sy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ry=`
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

}`;class ad{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Ao(t.texture);if(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)this.depthNear=t.depthNear,this.depthFar=t.depthFar;this.texture=n}}getMesh(t){if(this.texture!==null){if(this.mesh===null){let e=t.cameras[0].viewport,n=new ti({vertexShader:sy,fragmentShader:ry,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ue(new or(20,20),n)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class ld extends Dn{constructor(t,e){super();let n=this,i=null,s=1,r=null,o="local-floor",a=1,l=null,c=null,u=null,f=null,h=null,d=null,_=typeof XRWebGLBinding<"u",S=new ad,p={},g=e.getContextAttributes(),x=null,M=null,y=[],b=[],E=new Lt,m=null,v=null,w=new on;w.viewport=new oe;let P=new on;P.viewport=new oe;let R=[w,P],L=new pc,F=null,C=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let nt=y[K];if(nt===void 0)nt=new nr,y[K]=nt;return nt.getTargetRaySpace()},this.getControllerGrip=function(K){let nt=y[K];if(nt===void 0)nt=new nr,y[K]=nt;return nt.getGripSpace()},this.getHand=function(K){let nt=y[K];if(nt===void 0)nt=new nr,y[K]=nt;return nt.getHandSpace()};function B(K){let nt=b.indexOf(K.inputSource);if(nt===-1)return;let _t=y[nt];if(_t!==void 0)_t.update(K.inputSource,K.frame,l||r),_t.dispatchEvent({type:K.type,data:K.inputSource})}function W(){i.removeEventListener("select",B),i.removeEventListener("selectstart",B),i.removeEventListener("selectend",B),i.removeEventListener("squeeze",B),i.removeEventListener("squeezestart",B),i.removeEventListener("squeezeend",B),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",z);for(let K=0;K<y.length;K++){let nt=b[K];if(nt===null)continue;b[K]=null,y[K].disconnect(nt)}F=null,C=null,S.reset();for(let K in p)delete p[K];if(t.setRenderTarget(x),h=null,f=null,u=null,i=null,M=null,xt.stop(),n.isPresenting=!1,t.setPixelRatio(m),t.setSize(E.width,E.height,!1),v!==null){let K=v.camera;K.fov=v.fov,K.zoom=v.zoom,K.updateProjectionMatrix(),v=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){if(s=K,n.isPresenting===!0)At("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){if(o=K,n.isPresenting===!0)At("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||r},this.setReferenceSpace=function(K){l=K},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){if(u===null&&_)u=new XRWebGLBinding(i,e);return u},this.getFrame=function(){return d},this.getSession=function(){return i},this.setSession=async function(K){if(i=K,i!==null){if(x=t.getRenderTarget(),i.addEventListener("select",B),i.addEventListener("selectstart",B),i.addEventListener("selectend",B),i.addEventListener("squeeze",B),i.addEventListener("squeezestart",B),i.addEventListener("squeezeend",B),i.addEventListener("end",W),i.addEventListener("inputsourceschange",z),g.xrCompatible!==!0)await e.makeXRCompatible();if(m=t.getPixelRatio(),t.getSize(E),!(_&&("createProjectionLayer"in XRWebGLBinding.prototype))){let _t={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:s};h=new XRWebGLLayer(i,e,_t),i.updateRenderState({baseLayer:h}),t.setPixelRatio(1),t.setSize(h.framebufferWidth,h.framebufferHeight,!1),M=new gn(h.framebufferWidth,h.framebufferHeight,{format:Kn,type:An,colorSpace:t.outputColorSpace,stencilBuffer:g.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let _t=null,Rt=null,It=null;if(g.depth)It=g.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,_t=g.stencil?pi:_s,Rt=g.stencil?Ui:di;let yt={colorFormat:e.RGBA8,depthFormat:It,scaleFactor:s};u=this.getBinding(),f=u.createProjectionLayer(yt),i.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),M=new gn(f.textureWidth,f.textureHeight,{format:Kn,type:An,depthTexture:new mi(f.textureWidth,f.textureHeight,Rt,void 0,void 0,void 0,void 0,void 0,void 0,_t),stencilBuffer:g.stencil,colorSpace:t.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(a),l=null,r=await i.requestReferenceSpace(o),xt.setContext(i),xt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return S.getDepthTexture()};function z(K){for(let nt=0;nt<K.removed.length;nt++){let _t=K.removed[nt],Rt=b.indexOf(_t);if(Rt>=0)b[Rt]=null,y[Rt].disconnect(_t)}for(let nt=0;nt<K.added.length;nt++){let _t=K.added[nt],Rt=b.indexOf(_t);if(Rt===-1){for(let yt=0;yt<y.length;yt++)if(yt>=b.length){b.push(_t),Rt=yt;break}else if(b[yt]===null){b[yt]=_t,Rt=yt;break}if(Rt===-1)break}let It=y[Rt];if(It)It.connect(_t)}}function st(K,nt){if(nt===null)K.matrixWorld.copy(K.matrix);else K.matrixWorld.multiplyMatrices(nt.matrixWorld,K.matrix);K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(i===null)return;let{near:nt,far:_t}=K;if(S.texture!==null){if(S.depthNear>0)nt=S.depthNear;if(S.depthFar>0)_t=S.depthFar}if(L.near=P.near=w.near=nt,L.far=P.far=w.far=_t,F!==L.near||C!==L.far)i.updateRenderState({depthNear:L.near,depthFar:L.far}),F=L.near,C=L.far;L.layers.mask=K.layers.mask|6,w.layers.mask=L.layers.mask&-5,P.layers.mask=L.layers.mask&-3;let Rt=K.parent,It=L.cameras;st(L,Rt);for(let yt=0;yt<It.length;yt++)st(It[yt],Rt);if(L.projectionMatrix.copy(w.projectionMatrix),L.projectionMatrixInverse.copy(w.projectionMatrixInverse),v===null&&K.isPerspectiveCamera)v={camera:K,fov:K.fov,zoom:K.zoom};q(K,L,Rt)};function q(K,nt,_t){if(_t===null)K.matrix.copy(nt.matrixWorld);else K.matrix.copy(_t.matrixWorld),K.matrix.invert(),K.matrix.multiply(nt.matrixWorld);if(K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(nt.projectionMatrix),K.projectionMatrixInverse.copy(nt.projectionMatrixInverse),K.isPerspectiveCamera)K.fov=Li*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1}this.getCamera=function(){return L},this.getFoveation=function(){if(f===null&&h===null)return;return a},this.setFoveation=function(K){if(a=K,f!==null)f.fixedFoveation=K;if(h!==null&&h.fixedFoveation!==void 0)h.fixedFoveation=K},this.hasDepthSensing=function(){return S.texture!==null},this.getDepthSensingMesh=function(){return S.getMesh(L)},this.getCameraTexture=function(K){return p[K]};let Q=null;function et(K,nt){if(c=nt.getViewerPose(l||r),d=nt,c!==null){let _t=c.views;if(h!==null)t.setRenderTargetFramebuffer(M,h.framebuffer),t.setRenderTarget(M);let Rt=!1;if(_t.length!==L.cameras.length)L.cameras.length=0,Rt=!0;for(let kt=0;kt<_t.length;kt++){let zt=_t[kt],ne=null;if(h!==null)ne=h.getViewport(zt);else{let xe=u.getViewSubImage(f,zt);if(ne=xe.viewport,kt===0)t.setRenderTargetTextures(M,xe.colorTexture,xe.depthStencilTexture),t.setRenderTarget(M)}let Yt=R[kt];if(Yt===void 0)Yt=new on,Yt.layers.enable(kt),Yt.viewport=new oe,R[kt]=Yt;if(Yt.matrix.fromArray(zt.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(zt.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(ne.x,ne.y,ne.width,ne.height),kt===0)L.matrix.copy(Yt.matrix),L.matrix.decompose(L.position,L.quaternion,L.scale);if(Rt===!0)L.cameras.push(Yt)}let It=i.enabledFeatures;if(It&&It.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let kt=u.getDepthInformation(_t[0]);if(kt&&kt.isValid&&kt.texture)S.init(kt,i.renderState)}if(It&&It.includes("camera-access")&&_){t.state.unbindTexture(),u=n.getBinding();for(let kt=0;kt<_t.length;kt++){let zt=_t[kt].camera;if(zt){let ne=p[zt];if(!ne)ne=new Ao,p[zt]=ne;let Yt=u.getCameraImage(zt);ne.sourceTexture=Yt}}}}for(let _t=0;_t<y.length;_t++){let Rt=b[_t],It=y[_t];if(Rt!==null&&It!==void 0)It.update(Rt,nt,l||r)}if(Q)Q(K,nt);if(nt.detectedPlanes)n.dispatchEvent({type:"planesdetected",data:nt});d=null}let xt=new qf;xt.setAnimationLoop(et),this.setAnimationLoop=function(K){Q=K},this.dispose=function(){}}}var oy=new wt,cd=new Ft;cd.set(-1,0,0,0,1,0,0,0,1);function ay(t,e){function n(p,g){if(p.matrixAutoUpdate===!0)p.updateMatrix();g.value.copy(p.matrix)}function i(p,g){if(g.color.getRGB(p.fogColor.value,ec(t)),g.isFog)p.fogNear.value=g.near,p.fogFar.value=g.far;else if(g.isFogExp2)p.fogDensity.value=g.density}function s(p,g,x,M,y){if(g.isNodeMaterial)g.uniformsNeedUpdate=!1;else if(g.isMeshBasicMaterial)r(p,g);else if(g.isMeshLambertMaterial){if(r(p,g),g.envMap)p.envMapIntensity.value=g.envMapIntensity}else if(g.isMeshToonMaterial)r(p,g),f(p,g);else if(g.isMeshPhongMaterial){if(r(p,g),u(p,g),g.envMap)p.envMapIntensity.value=g.envMapIntensity}else if(g.isMeshStandardMaterial){if(r(p,g),h(p,g),g.isMeshPhysicalMaterial)d(p,g,y)}else if(g.isMeshMatcapMaterial)r(p,g),_(p,g);else if(g.isMeshDepthMaterial)r(p,g);else if(g.isMeshDistanceMaterial)r(p,g),S(p,g);else if(g.isMeshNormalMaterial)r(p,g);else if(g.isLineBasicMaterial){if(o(p,g),g.isLineDashedMaterial)a(p,g)}else if(g.isPointsMaterial)l(p,g,x,M);else if(g.isSpriteMaterial)c(p,g);else if(g.isShadowMaterial)p.color.value.copy(g.color),p.opacity.value=g.opacity;else if(g.isShaderMaterial)g.uniformsNeedUpdate=!1}function r(p,g){if(p.opacity.value=g.opacity,g.color)p.diffuse.value.copy(g.color);if(g.emissive)p.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity);if(g.map)p.map.value=g.map,n(g.map,p.mapTransform);if(g.alphaMap)p.alphaMap.value=g.alphaMap,n(g.alphaMap,p.alphaMapTransform);if(g.bumpMap){if(p.bumpMap.value=g.bumpMap,n(g.bumpMap,p.bumpMapTransform),p.bumpScale.value=g.bumpScale,g.side===Ye)p.bumpScale.value*=-1}if(g.normalMap){if(p.normalMap.value=g.normalMap,n(g.normalMap,p.normalMapTransform),p.normalScale.value.copy(g.normalScale),g.side===Ye)p.normalScale.value.negate()}if(g.displacementMap)p.displacementMap.value=g.displacementMap,n(g.displacementMap,p.displacementMapTransform),p.displacementScale.value=g.displacementScale,p.displacementBias.value=g.displacementBias;if(g.emissiveMap)p.emissiveMap.value=g.emissiveMap,n(g.emissiveMap,p.emissiveMapTransform);if(g.specularMap)p.specularMap.value=g.specularMap,n(g.specularMap,p.specularMapTransform);if(g.alphaTest>0)p.alphaTest.value=g.alphaTest;let x=e.get(g),M=x.envMap,y=x.envMapRotation;if(M){if(p.envMap.value=M,p.envMapRotation.value.setFromMatrix4(oy.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1)p.envMapRotation.value.premultiply(cd);p.reflectivity.value=g.reflectivity,p.ior.value=g.ior,p.refractionRatio.value=g.refractionRatio}if(g.lightMap)p.lightMap.value=g.lightMap,p.lightMapIntensity.value=g.lightMapIntensity,n(g.lightMap,p.lightMapTransform);if(g.aoMap)p.aoMap.value=g.aoMap,p.aoMapIntensity.value=g.aoMapIntensity,n(g.aoMap,p.aoMapTransform)}function o(p,g){if(p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,g.map)p.map.value=g.map,n(g.map,p.mapTransform)}function a(p,g){p.dashSize.value=g.dashSize,p.totalSize.value=g.dashSize+g.gapSize,p.scale.value=g.scale}function l(p,g,x,M){if(p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.size.value=g.size*x,p.scale.value=M*0.5,g.map)p.map.value=g.map,n(g.map,p.uvTransform);if(g.alphaMap)p.alphaMap.value=g.alphaMap,n(g.alphaMap,p.alphaMapTransform);if(g.alphaTest>0)p.alphaTest.value=g.alphaTest}function c(p,g){if(p.diffuse.value.copy(g.color),p.opacity.value=g.opacity,p.rotation.value=g.rotation,g.map)p.map.value=g.map,n(g.map,p.mapTransform);if(g.alphaMap)p.alphaMap.value=g.alphaMap,n(g.alphaMap,p.alphaMapTransform);if(g.alphaTest>0)p.alphaTest.value=g.alphaTest}function u(p,g){p.specular.value.copy(g.specular),p.shininess.value=Math.max(g.shininess,0.0001)}function f(p,g){if(g.gradientMap)p.gradientMap.value=g.gradientMap}function h(p,g){if(p.metalness.value=g.metalness,g.metalnessMap)p.metalnessMap.value=g.metalnessMap,n(g.metalnessMap,p.metalnessMapTransform);if(p.roughness.value=g.roughness,g.roughnessMap)p.roughnessMap.value=g.roughnessMap,n(g.roughnessMap,p.roughnessMapTransform);if(g.envMap)p.envMapIntensity.value=g.envMapIntensity}function d(p,g,x){if(p.ior.value=g.ior,g.diffuseRoughness>0){if(p.diffuseRoughness.value=g.diffuseRoughness,g.diffuseRoughnessMap)p.diffuseRoughnessMap.value=g.diffuseRoughnessMap,n(g.diffuseRoughnessMap,p.diffuseRoughnessMapTransform)}if(g.sheen>0){if(p.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),p.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap)p.sheenColorMap.value=g.sheenColorMap,n(g.sheenColorMap,p.sheenColorMapTransform);if(g.sheenRoughnessMap)p.sheenRoughnessMap.value=g.sheenRoughnessMap,n(g.sheenRoughnessMap,p.sheenRoughnessMapTransform)}if(g.clearcoat>0){if(p.clearcoat.value=g.clearcoat,p.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap)p.clearcoatMap.value=g.clearcoatMap,n(g.clearcoatMap,p.clearcoatMapTransform);if(g.clearcoatRoughnessMap)p.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,n(g.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform);if(g.clearcoatNormalMap){if(p.clearcoatNormalMap.value=g.clearcoatNormalMap,n(g.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Ye)p.clearcoatNormalScale.value.negate()}}if(g.dispersion>0)p.dispersion.value=g.dispersion;if(g.retroreflectivity>0)p.retroreflectivity.value=g.retroreflectivity;if(g.iridescence>0){if(p.iridescence.value=g.iridescence,p.iridescenceIOR.value=g.iridescenceIOR,p.iridescenceThicknessMinimum.value=g.iridescenceThicknessMinimum,p.iridescenceThicknessMaximum.value=g.iridescenceThicknessMaximum,g.iridescenceMap)p.iridescenceMap.value=g.iridescenceMap,n(g.iridescenceMap,p.iridescenceMapTransform);if(g.iridescenceThicknessMap)p.iridescenceThicknessMap.value=g.iridescenceThicknessMap,n(g.iridescenceThicknessMap,p.iridescenceThicknessMapTransform)}if(g.transmission>0){if(p.transmission.value=g.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),g.transmissionMap)p.transmissionMap.value=g.transmissionMap,n(g.transmissionMap,p.transmissionMapTransform);if(p.thickness.value=g.thickness,g.thicknessMap)p.thicknessMap.value=g.thicknessMap,n(g.thicknessMap,p.thicknessMapTransform);p.attenuationDistance.value=g.attenuationDistance,p.attenuationColor.value.copy(g.attenuationColor)}if(g.anisotropy>0){if(p.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap)p.anisotropyMap.value=g.anisotropyMap,n(g.anisotropyMap,p.anisotropyMapTransform)}if(p.specularIntensity.value=g.specularIntensity,p.specularColor.value.copy(g.specularColor),g.specularColorMap)p.specularColorMap.value=g.specularColorMap,n(g.specularColorMap,p.specularColorMapTransform);if(g.specularIntensityMap)p.specularIntensityMap.value=g.specularIntensityMap,n(g.specularIntensityMap,p.specularIntensityMapTransform)}function _(p,g){if(g.matcap)p.matcap.value=g.matcap}function S(p,g){let x=e.get(g).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function ly(t,e,n,i){let s={},r={};function o(x,M){let y=M.program;i.uniformBlockBinding(x,y,s[x.id])}function a(x,M){let y=s[x.id];if(y===void 0)_(x),y=l(x),s[x.id]=y,x.addEventListener("dispose",p);let b=M.program;i.updateUBOMapping(x,b);let E=e.render.frame;if(r[x.id]!==E)c(x),r[x.id]=E}function l(x){let M=t.createBuffer(),y=x.__size,b=x.usage;return t.bindBuffer(t.UNIFORM_BUFFER,M),t.bufferData(t.UNIFORM_BUFFER,y,b),t.bindBuffer(t.UNIFORM_BUFFER,null),M}function c(x){let M=s[x.id],y=x.uniforms,b=x.__cache;t.bindBuffer(t.UNIFORM_BUFFER,M);for(let E=0,m=y.length;E<m;E++){let v=y[E];if(Array.isArray(v))for(let w=0,P=v.length;w<P;w++)u(v[w],E,w,b);else u(v,E,0,b)}t.bindBuffer(t.UNIFORM_BUFFER,null)}function u(x,M,y,b){if(h(x,M,y,b)===!0){let{__offset:E,value:m}=x;if(Array.isArray(m)){let v=0;for(let w=0;w<m.length;w++){let P=m[w],R=S(P,!0);f(P,x.__data,v),v+=R.storage/Float32Array.BYTES_PER_ELEMENT}}else f(m,x.__data,0);t.bufferSubData(t.UNIFORM_BUFFER,E,x.__data)}}function f(x,M,y){if(typeof x==="number"||typeof x==="boolean")M[y]=x;else if(x.isMatrix3)M[y]=x.elements[0],M[y+1]=x.elements[1],M[y+2]=x.elements[2],M[y+3]=0,M[y+4]=x.elements[3],M[y+5]=x.elements[4],M[y+6]=x.elements[5],M[y+7]=0,M[y+8]=x.elements[6],M[y+9]=x.elements[7],M[y+10]=x.elements[8],M[y+11]=0;else if(ArrayBuffer.isView(x))M.set(x.subarray(0,M.length-y),y);else x.toArray(M,y)}function h(x,M,y,b){let E=x.value,m=M+"_"+y;if(Array.isArray(E)){if(b[m]===void 0)b[m]=[];let v=b[m],w=!1;for(let P=0;P<E.length;P++)if(d(E[P],v,P)===!0)w=!0;return w}return d(E,b,m)}function d(x,M,y){if(M[y]===void 0){if(typeof x==="number"||typeof x==="boolean")M[y]=x;else if(ArrayBuffer.isView(x))M[y]=x.slice();else M[y]=x.clone();return!0}else{let b=M[y];if(typeof x==="number"||typeof x==="boolean"){if(b!==x)return M[y]=x,!0}else if(ArrayBuffer.isView(x))return!0;else if(b.equals(x)===!1)return b.copy(x),!0}return!1}function _(x){let M=x.uniforms,y=0,b=16;for(let m=0,v=M.length;m<v;m++){let w=Array.isArray(M[m])?M[m]:[M[m]];for(let P=0,R=w.length;P<R;P++){let L=w[P],F=Array.isArray(L.value)?L.value:[L.value],C=Array.isArray(M[m])||Array.isArray(L.value),B=y;for(let z=0,st=F.length;z<st;z++){let q=F[z],Q=S(q,C),et=y%b,xt=et%Q.boundary,K=et+xt;if(y+=xt,K!==0&&b-K<Q.storage)y+=b-K;if(z===0)B=y;y+=Q.storage}let W=L.type==="int"?Int32Array:L.type==="uint"?Uint32Array:Float32Array;L.__data=new W((y-B)/Float32Array.BYTES_PER_ELEMENT),L.__offset=B}}let E=y%b;if(E>0)y+=b-E;return x.__size=y,x.__cache={},this}function S(x,M){let y={boundary:0,storage:0};if(typeof x==="number"||typeof x==="boolean")y.boundary=4,y.storage=4;else if(x.isVector2)y.boundary=8,y.storage=8;else if(x.isVector3||x.isColor)y.boundary=16,y.storage=12;else if(x.isVector4)y.boundary=16,y.storage=16;else if(x.isMatrix3)y.boundary=16,y.storage=48;else if(x.isMatrix4)y.boundary=16,y.storage=64;else if(x.isTexture)At("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(x))y.boundary=16,y.storage=x.byteLength;else At("WebGLRenderer: Unsupported uniform value type.",x);if(M===!0)y.boundary=16,y.storage=Math.ceil(y.storage/16)*16;return y}function p(x){let M=x.target;M.removeEventListener("dispose",p),t.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function g(){for(let x in s)t.deleteBuffer(s[x]);s={},r={}}return{bind:o,update:a,dispose:g}}var cy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Fn=null;function hy(){if(Fn===null)Fn=new ci(cy,16,16,Fi,Nn),Fn.name="DFG_LUT",Fn.minFilter=mn,Fn.magFilter=mn,Fn.wrapS=ao,Fn.wrapT=ao,Fn.generateMipmaps=!1,Fn.needsUpdate=!0;return Fn}class uy{constructor(t={}){let{canvas:e=Hu(),context:n=null,depth:i=!0,stencil:s=!1,alpha:r=!1,antialias:o=!1,premultipliedAlpha:a=!0,preserveDrawingBuffer:l=!1,powerPreference:c="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1,outputBufferType:h=An}=t;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=r;let _=h,S=new Set([el,tl,ja]),p=new Set([An,di,js,Ui,Ka,Qa]),g=new Uint32Array(4),x=new Int32Array(4),M={textures:[],min:[],max:[],resolution:[]},y=null,b=null,E=[],m=[],v=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let w=this,P=!1,R=null,L=null,F=null,C=null;this._outputColorSpace=Fu;let B=0,W=0,z=null,st=-1,q=null,Q=new oe,et=new oe,xt=null,K=new Dt(0),nt=0,_t=e.width,Rt=e.height,It=1,yt=null,$t=null,kt=new oe(0,0,_t,Rt),zt=new oe(0,0,_t,Rt),ne=!1,Yt=new hi,xe=new ir,ve=!1,tn=!1,ln=new wt,Se=new N,Ge=new oe,en={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},nn=!1;function xn(){return z===null?It:1}let O=n;function yn(A,U){return e.getContext(A,U)}let se,Pe,ft,de,Pt,Ot,ke,I,T,G,tt,j,ot,ct,X,J,at,D,Z,Y,it,rt,ut;try{let A={alpha:!0,depth:i,stencil:s,antialias:o,premultipliedAlpha:a,preserveDrawingBuffer:l,powerPreference:c,failIfMajorPerformanceCaveat:u};if("setAttribute"in e)e.setAttribute("data-engine",`three.js r${Ni}`);if(e.addEventListener("webglcontextlost",pt,!1),e.addEventListener("webglcontextrestored",Ct,!1),e.addEventListener("webglcontextcreationerror",Gt,!1),O===null){if(O=yn("webgl2",A),O===null)if(yn("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Et()}catch(A){throw e.removeEventListener("webglcontextlost",pt,!1),e.removeEventListener("webglcontextrestored",Ct,!1),e.removeEventListener("webglcontextcreationerror",Gt,!1),Nt("WebGLRenderer: "+A.message),A}function Et(){if(se=new S0(O),se.init(),it=new iy(O,se),Pe=new h0(O,se,t,it),ft=new ey(O,se),Pe.reversedDepthBuffer&&f)ft.buffers.depth.setReversed(!0);L=O.createFramebuffer(),F=O.createFramebuffer(),C=O.createFramebuffer(),de=new T0(O),Pt=new kx,Ot=new ny(O,se,ft,Pt,Pe,it,de),ke=new v0(w),I=new Em(O),rt=new l0(O,I),T=new M0(O,I,de,rt),G=new E0(O,T,I,rt,de),D=new A0(O,Pe,Ot),X=new u0(Pt),tt=new Gx(w,ke,se,Pe,rt,X),j=new ay(w,Pt),ot=new Vx,ct=new Jx(se),at=new a0(w,ke,ft,G,d,a),J=new ty(w,G,Pe),ut=new ly(O,de,Pe,ft),Z=new c0(O,se,de),Y=new b0(O,se,de),de.programs=tt.programs,w.capabilities=Pe,w.extensions=se,w.properties=Pt,w.renderLists=ot,w.shadowMap=J,w.state=ft,w.info=de}if(_!==An)v=new R0(_,e.width,e.height,o,i,s);let Tt=new ld(w,O);this.xr=Tt,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let A=se.get("WEBGL_lose_context");if(A)A.loseContext()},this.forceContextRestore=function(){let A=se.get("WEBGL_lose_context");if(A)A.restoreContext()},this.getPixelRatio=function(){return It},this.setPixelRatio=function(A){if(A===void 0)return;It=A,this.setSize(_t,Rt,!1)},this.getSize=function(A){return A.set(_t,Rt)},this.setSize=function(A,U,V=!0){if(Tt.isPresenting){At("WebGLRenderer: Can't change size while VR device is presenting.");return}if(_t=A,Rt=U,e.width=Math.floor(A*It),e.height=Math.floor(U*It),V===!0)e.style.width=A+"px",e.style.height=U+"px";if(v!==null)v.setSize(e.width,e.height);this.setViewport(0,0,A,U)},this.getDrawingBufferSize=function(A){return A.set(_t*It,Rt*It).floor()},this.setDrawingBufferSize=function(A,U,V){_t=A,Rt=U,It=V,e.width=Math.floor(A*V),e.height=Math.floor(U*V),this.setViewport(0,0,A,U)},this.setEffects=function(A){if(_===An){Nt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let U=0;U<A.length;U++)if(A[U].isOutputPass===!0){At("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}v.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(Q)},this.getViewport=function(A){return A.copy(kt)},this.setViewport=function(A,U,V,k){if(A.isVector4)kt.set(A.x,A.y,A.z,A.w);else kt.set(A,U,V,k);ft.viewport(Q.copy(kt).multiplyScalar(xn()).round())},this.getScissor=function(A){return A.copy(zt)},this.setScissor=function(A,U,V,k){if(A.isVector4)zt.set(A.x,A.y,A.z,A.w);else zt.set(A,U,V,k);ft.scissor(et.copy(zt).multiplyScalar(xn()).round())},this.getScissorTest=function(){return ne},this.setScissorTest=function(A){ft.setScissorTest(ne=A)},this.setOpaqueSort=function(A){yt=A},this.setTransparentSort=function(A){$t=A},this.getClearColor=function(A){return A.copy(at.getClearColor())},this.setClearColor=function(){at.setClearColor(...arguments)},this.getClearAlpha=function(){return at.getClearAlpha()},this.setClearAlpha=function(){at.setClearAlpha(...arguments)},this.clear=function(A=!0,U=!0,V=!0){let k=0;if(A){let H=!1;if(z!==null){let ht=z.texture.format;H=S.has(ht)}if(H){let ht=z.texture.type,vt=p.has(ht),lt=at.getClearColor(),gt=at.getClearAlpha(),bt=lt.r,Bt=lt.g,Xt=lt.b;if(vt)g[0]=bt,g[1]=Bt,g[2]=Xt,g[3]=gt,O.clearBufferuiv(O.COLOR,0,g);else x[0]=bt,x[1]=Bt,x[2]=Xt,x[3]=gt,O.clearBufferiv(O.COLOR,0,x)}else k|=O.COLOR_BUFFER_BIT}if(U)k|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(V)k|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(k!==0)O.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),R=A},this.dispose=function(){e.removeEventListener("webglcontextlost",pt,!1),e.removeEventListener("webglcontextrestored",Ct,!1),e.removeEventListener("webglcontextcreationerror",Gt,!1),at.dispose(),ot.dispose(),ct.dispose(),Ot.dispose(),Pt.dispose(),ke.dispose(),G.dispose(),T.dispose(),rt.dispose(),ut.dispose(),tt.dispose(),Tt.dispose(),Tt.removeEventListener("sessionstart",Xc),Tt.removeEventListener("sessionend",qc),bi.stop()};function pt(A){A.preventDefault(),Zs("WebGLRenderer: Context Lost."),P=!0}function Ct(){Zs("WebGLRenderer: Context Restored."),P=!1;let A=de.autoReset,U=J.enabled,V=J.autoUpdate,k=J.needsUpdate,H=J.type;Et(),de.autoReset=A,J.enabled=U,J.autoUpdate=V,J.needsUpdate=k,J.type=H}function Gt(A){Nt("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function mt(A){let U=A.target;U.removeEventListener("dispose",mt),re(U)}function re(A){Le(A),Pt.remove(A)}function Le(A){let U=Pt.get(A).programs;if(U!==void 0){if(U.forEach(function(V){tt.releaseProgram(V)}),A.isShaderMaterial)tt.releaseShaderCache(A)}}this.renderBufferDirect=function(A,U,V,k,H,ht){if(U===null)U=en;let vt=H.isMesh&&H.matrixWorld.determinantAffine()<0,lt=ip(A,U,V,k,H);ft.setMaterial(k,vt);let gt=V.index,bt=1;if(k.wireframe===!0){if(gt=T.getWireframeAttribute(V),gt===void 0)return;bt=2}let Bt=V.drawRange,Xt=V.attributes.position,St=Bt.start*bt,qt=(Bt.start+Bt.count)*bt;if(ht!==null)St=Math.max(St,ht.start*bt),qt=Math.min(qt,(ht.start+ht.count)*bt);if(gt!==null)St=Math.max(St,0),qt=Math.min(qt,gt.count);else if(Xt!==void 0&&Xt!==null)St=Math.max(St,0),qt=Math.min(qt,Xt.count);let Me=qt-St;if(Me<0||Me===1/0)return;rt.setup(H,k,lt,V,gt);let pe,ce=Z;if(gt!==null)pe=I.get(gt),ce=Y,ce.setIndex(pe);if(H.isMesh)if(k.wireframe===!0)ft.setLineWidth(k.wireframeLinewidth*xn()),ce.setMode(O.LINES);else ce.setMode(O.TRIANGLES);else if(H.isLine){let He=k.linewidth;if(He===void 0)He=1;if(ft.setLineWidth(He*xn()),H.isLineSegments)ce.setMode(O.LINES);else if(H.isLineLoop)ce.setMode(O.LINE_LOOP);else ce.setMode(O.LINE_STRIP)}else if(H.isPoints)ce.setMode(O.POINTS);else if(H.isSprite)ce.setMode(O.TRIANGLES);if(H.isBatchedMesh)if(!se.get("WEBGL_multi_draw")){let{_multiDrawStarts:He,_multiDrawCounts:Mt,_multiDrawCount:Ke}=H,Kt=gt?I.get(gt).bytesPerElement:1,Ti=Pt.get(k).currentProgram.getUniforms();for(let Ve=0;Ve<Ke;Ve++)Ti.setValue(O,"_gl_DrawID",Ve),ce.render(He[Ve]/Kt,Mt[Ve])}else ce.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else if(H.isInstancedMesh)ce.renderInstances(St,Me,H.count);else if(V.isInstancedBufferGeometry){let He=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,Mt=Math.min(V.instanceCount,He);ce.renderInstances(St,Me,Mt)}else ce.render(St,Me)};function Gn(A,U,V,k){if(R!==null&&A.isNodeMaterial)R.setObject(k,A);if(ve===!0)X.setState(A,V,!1);if(A.transparent===!0&&A.side===pn&&A.forceSinglePass===!1)A.side=Ye,A.needsUpdate=!0,Fs(A,U,k),A.side=Jn,A.needsUpdate=!0,Fs(A,U,k),A.side=pn;else Fs(A,U,k)}this.compile=function(A,U,V=null){if(V===null)V=A;if(R!==null)R.renderStart(A,U,V);if(b=ct.get(V),b.init(U),m.push(b),V.traverseVisible(function(H){if(H.isLight&&H.layers.test(U.layers)){if(b.pushLight(H),H.castShadow)b.pushShadow(H)}}),A!==V)A.traverseVisible(function(H){if(H.isLight&&H.layers.test(U.layers)){if(b.pushLight(H),H.castShadow)b.pushShadow(H)}});if(b.setupLights(),R!==null)R.updateLights(b.state.lightsArray);if(tn=this.localClippingEnabled,ve=X.init(this.clippingPlanes,tn),ve===!0)X.setGlobalState(this.clippingPlanes,U);if(R!==null)J.render(b.state.shadowsArray,V,U);let k=new Set;if(A.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;let ht=H.material;if(ht)if(Array.isArray(ht))for(let vt=0;vt<ht.length;vt++){let lt=ht[vt];Gn(lt,V,U,H),k.add(lt)}else Gn(ht,V,U,H),k.add(ht)}),b=m.pop(),R!==null)R.renderEnd();return k},this.compileAsync=function(A,U,V=null){let k=this.compile(A,U,V);return new Promise((H)=>{function ht(){if(k.forEach(function(vt){let gt=Pt.get(vt).currentProgram;if(gt===void 0||gt.isReady())k.delete(vt)}),k.size===0){H(A);return}setTimeout(ht,10)}if(se.get("KHR_parallel_shader_compile")!==null)ht();else setTimeout(ht,10)})};let oa=null;function ep(A){if(oa)oa(A)}function Xc(){bi.stop()}function qc(){bi.start()}let bi=new qf;if(bi.setAnimationLoop(ep),typeof self<"u")bi.setContext(self);this.setAnimationLoop=function(A){oa=A,Tt.setAnimationLoop(A),A===null?bi.stop():bi.start()},Tt.addEventListener("sessionstart",Xc),Tt.addEventListener("sessionend",qc),this.render=function(A,U){if(U!==void 0&&U.isCamera!==!0){Nt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(R!==null)R.renderStart(A,U);let V=Tt.enabled===!0&&Tt.isPresenting===!0,k=v!==null&&(z===null||V)&&v.begin(w,z);if(A.matrixWorldAutoUpdate===!0)A.updateMatrixWorld();if(U.parent===null&&U.matrixWorldAutoUpdate===!0)U.updateMatrixWorld();if(Tt.enabled===!0&&Tt.isPresenting===!0&&(v===null||v.isCompositing()===!1)){if(Tt.cameraAutoUpdate===!0)Tt.updateCamera(U);U=Tt.getCamera()}if(A.isScene===!0)A.onBeforeRender(w,A,U,z);if(b=ct.get(A,m.length),b.init(U),b.state.textureUnits=Ot.getTextureUnits(),m.push(b),ln.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),U.isArrayCamera)xe.setFromArrayCamera(U);else Yt.setFromProjectionMatrix(ln,zl,U.reversedDepth);if(tn=this.localClippingEnabled,ve=X.init(this.clippingPlanes,tn),y=ot.get(A,E.length),y.init(),E.push(y),this.info.render.frame++,Tt.enabled===!0&&Tt.isPresenting===!0){let vt=w.xr.getDepthSensingMesh();if(vt!==null)aa(vt,U,-1/0,w.sortObjects)}if(aa(A,U,0,w.sortObjects),y.finish(),R!==null)R.updateLights(b.state.lightsArray);if(w.sortObjects===!0)y.sort(yt,$t);if(nn=Tt.enabled===!1||Tt.isPresenting===!1||Tt.hasDepthSensing()===!1,nn)at.addToRenderList(y,A);if(this.info.autoReset===!0)this.info.reset();if(ve===!0)X.beginShadows();let H=b.state.shadowsArray;if(J.render(H,A,U),ve===!0)X.endShadows();if((k&&v.hasRenderPass())===!1){let{opaque:vt,transmissive:lt}=y;if(b.setupLights(),U.isArrayCamera){let gt=U.cameras;if(lt.length>0)for(let bt=0,Bt=gt.length;bt<Bt;bt++){let Xt=gt[bt];Zc(vt,lt,A,Xt)}if(nn)at.render(A);for(let bt=0,Bt=gt.length;bt<Bt;bt++){let Xt=gt[bt];Yc(y,A,Xt,Xt.viewport)}}else{if(lt.length>0)Zc(vt,lt,A,U);if(nn)at.render(A);Yc(y,A,U)}}if(z!==null&&W===0)Ot.updateMultisampleRenderTarget(z),Ot.updateRenderTargetMipmap(z);if(k)v.end(w);if(A.isScene===!0)A.onAfterRender(w,A,U);if(rt.resetDefaultState(),st=-1,q=null,m.pop(),m.length>0){if(b=m[m.length-1],Ot.setTextureUnits(b.state.textureUnits),ve===!0)X.setGlobalState(w.clippingPlanes,b.state.camera)}else b=null;if(E.pop(),E.length>0)y=E[E.length-1];else y=null;if(R!==null)R.renderEnd()};function aa(A,U,V,k){if(A.visible===!1)return;if(A.layers.test(U.layers)){if(A.isGroup)V=A.renderOrder;else if(A.isLOD){if(A.autoUpdate===!0)A.update(U)}else if(A.isLight){if(b.pushLight(A),A.castShadow)b.pushShadow(A)}else if(A.isSprite){let vt=U.isArrayCamera?xe:Yt;if(!A.frustumCulled||A.intersectsFrustum(vt)){if(k)Ge.setFromMatrixPosition(A.matrixWorld).applyMatrix4(ln);let lt=G.update(A),gt=A.material;if(gt.visible)y.push(A,lt,gt,V,Ge.z,null,U)}}else if(A.isMesh||A.isLine||A.isPoints){let vt=U.isArrayCamera?xe:Yt;if(!A.frustumCulled||A.intersectsFrustum(vt)){let lt=G.update(A),gt=A.material;if(k){if(A.boundingSphere!==void 0){if(A.boundingSphere===null)A.computeBoundingSphere();Ge.copy(A.boundingSphere.center)}else{if(lt.boundingSphere===null)lt.computeBoundingSphere();Ge.copy(lt.boundingSphere.center)}Ge.applyMatrix4(A.matrixWorld).applyMatrix4(ln)}if(Array.isArray(gt)){let bt=lt.groups;for(let Bt=0,Xt=bt.length;Bt<Xt;Bt++){let St=bt[Bt],qt=gt[St.materialIndex];if(qt&&qt.visible)y.push(A,lt,qt,V,Ge.z,St,U)}}else if(gt.visible)y.push(A,lt,gt,V,Ge.z,null,U)}}}let ht=A.children;for(let vt=0,lt=ht.length;vt<lt;vt++)aa(ht[vt],U,V,k)}function Yc(A,U,V,k){let{opaque:H,transmissive:ht,transparent:vt}=A;if(b.setupLightsView(V),ve===!0)X.setGlobalState(w.clippingPlanes,V);if(k)ft.viewport(Q.copy(k));if(H.length>0)Er(H,U,V);if(ht.length>0)Er(ht,U,V);if(vt.length>0)Er(vt,U,V);ft.buffers.depth.setTest(!0),ft.buffers.depth.setMask(!0),ft.buffers.color.setMask(!0),ft.setPolygonOffset(!1)}function Zc(A,U,V,k){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[k.id]===void 0){let St=se.has("EXT_color_buffer_half_float")||se.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[k.id]=new gn(1,1,{generateMipmaps:!0,type:St?Nn:An,minFilter:fi,samples:Math.max(4,Pe.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Vt.workingColorSpace})}let ht=b.state.transmissionRenderTarget[k.id],vt=k.viewport||Q;ht.setSize(vt.z*w.transmissionResolutionScale,vt.w*w.transmissionResolutionScale);let lt=w.getRenderTarget(),gt=w.getActiveCubeFace(),bt=w.getActiveMipmapLevel();if(w.setRenderTarget(ht),w.getClearColor(K),nt=w.getClearAlpha(),nt<1)w.setClearColor(16777215,0.5);if(w.clear(),nn)at.render(V);let Bt=w.toneMapping;w.toneMapping=Ln;let Xt=k.viewport;if(k.viewport!==void 0)k.viewport=void 0;if(b.setupLightsView(k),ve===!0)X.setGlobalState(w.clippingPlanes,k);if(Er(A,V,k),Ot.updateMultisampleRenderTarget(ht),Ot.updateRenderTargetMipmap(ht),se.has("WEBGL_multisampled_render_to_texture")===!1){let St=!1;for(let qt=0,Me=U.length;qt<Me;qt++){let pe=U[qt],{object:ce,geometry:He,material:Mt,group:Ke}=pe;if(Mt.side===pn&&ce.layers.test(k.layers)){let Kt=Mt.side;Mt.side=Ye,Mt.needsUpdate=!0,Jc(ce,V,k,He,Mt,Ke),Mt.side=Kt,Mt.needsUpdate=!0,St=!0}}if(St===!0)Ot.updateMultisampleRenderTarget(ht),Ot.updateRenderTargetMipmap(ht)}if(w.setRenderTarget(lt,gt,bt),w.setClearColor(K,nt),Xt!==void 0)k.viewport=Xt;w.toneMapping=Bt}function Er(A,U,V){let k=U.isScene===!0?U.overrideMaterial:null;for(let H=0,ht=A.length;H<ht;H++){let vt=A[H],{object:lt,geometry:gt,group:bt}=vt,Bt=vt.material;if(Bt.allowOverride===!0&&k!==null)Bt=k;if(lt.layers.test(V.layers))Jc(lt,U,V,gt,Bt,bt)}}function Jc(A,U,V,k,H,ht){if(R!==null&&H.isNodeMaterial)R.setObject(A,H);if(A.onBeforeRender(w,U,V,k,H,ht),A.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),H.onBeforeRender(w,U,V,k,A,ht),H.transparent===!0&&H.side===pn&&H.forceSinglePass===!1)H.side=Ye,H.needsUpdate=!0,w.renderBufferDirect(V,U,k,H,A,ht),H.side=Jn,H.needsUpdate=!0,w.renderBufferDirect(V,U,k,H,A,ht),H.side=pn;else w.renderBufferDirect(V,U,k,H,A,ht);A.onAfterRender(w,U,V,k,H,ht)}function $c(A){let U=0;for(let V of A)if(V.texture!==null)U++;return U}function Fs(A,U,V){if(U.isScene!==!0)U=en;let k=Pt.get(A),H=b.state.lights,ht=b.state.shadowsArray,vt=H.state.version,lt=tt.getParameters(A,H.state,ht,U,V,b.state.lightProbeGridArray),gt=tt.getProgramCacheKey(lt),bt=k.programs;k.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?U.environment:null,k.fog=U.fog;let Bt=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;if(k.envMap=ke.get(A.envMap||k.environment,Bt),k.envMapRotation=k.environment!==null&&A.envMap===null?U.environmentRotation:A.envMapRotation,bt===void 0)A.addEventListener("dispose",mt),bt=new Map,k.programs=bt,k.programVariants=new Map;let Xt=bt.get(gt);if(Xt!==void 0){if(k.currentProgram===Xt&&k.lightsStateVersion===vt)return Qc(A,lt),Xt}else{if(lt.uniforms=tt.getUniforms(A),R!==null&&A.isNodeMaterial)R.build(A,V,lt);A.onBeforeCompile(lt,w),Xt=tt.acquireProgram(lt,gt),bt.set(gt,Xt),k.uniforms=lt.uniforms}let St=k.uniforms;if(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)St.clippingPlanes=X.uniform;if(Qc(A,lt),k.needsLights=rp(A),k.lightsStateVersion=vt,k.needsLights)St.ambientLightColor.value=H.state.ambient,St.lightProbe.value=H.state.probe,St.sunLights.value=H.state.sun,St.sunLightShadows.value=H.state.sunShadow,St.directionalLights.value=H.state.directional,St.directionalLightShadows.value=H.state.directionalShadow,St.spotLights.value=H.state.spot,St.spotLightShadows.value=H.state.spotShadow,St.rectAreaLights.value=H.state.rectArea,St.ltc_1.value=H.state.rectAreaLTC1,St.ltc_2.value=H.state.rectAreaLTC2,St.pointLights.value=H.state.point,St.pointLightShadows.value=H.state.pointShadow,St.hemisphereLights.value=H.state.hemi,St.sunShadowMatrix.value=H.state.sunShadowMatrix,St.sunShadowCascade.value=H.state.sunShadowCascade,St.directionalShadowMatrix.value=H.state.directionalShadowMatrix,St.spotLightMatrix.value=H.state.spotLightMatrix,St.spotLightMap.value=H.state.spotLightMap,St.pointShadowMatrix.value=H.state.pointShadowMatrix;return k.numLightProbeGrids=$c(b.state.lightProbeGridArray),k.currentProgram=Xt,k.uniformsList=null,Xt}function np(A,U,V,k,H){let ht=Pt.get(A),vt=ht.currentProgram.id+","+k+","+H,lt=ht.programVariants.get(vt);if(lt===void 0)lt=Fs(A,U,V),ht.programVariants.set(vt,lt);else ht.currentProgram=lt,ht.uniformsList=null,ht.outputColorSpace=k,ht.toneMapping=H;return lt}function Kc(A){if(A.uniformsList===null){let U=A.currentProgram.getUniforms();A.uniformsList=dr.seqWithValue(U.seq,A.uniforms)}return A.uniformsList}function Qc(A,U){let V=Pt.get(A);V.outputColorSpace=U.outputColorSpace,V.batching=U.batching,V.batchingColor=U.batchingColor,V.instancing=U.instancing,V.instancingColor=U.instancingColor,V.instancingMorph=U.instancingMorph,V.skinning=U.skinning,V.morphTargets=U.morphTargets,V.morphNormals=U.morphNormals,V.morphColors=U.morphColors,V.morphTargetsCount=U.morphTargetsCount,V.numClippingPlanes=U.numClippingPlanes,V.numIntersection=U.numClipIntersection,V.vertexAlphas=U.vertexAlphas,V.vertexTangents=U.vertexTangents,V.toneMapping=U.toneMapping}function ip(A,U,V,k,H){if(U.isScene!==!0)U=en;Ot.resetTextureUnits();let ht=U.fog,vt=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?U.environment:null,lt=z===null?w.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:Vt.workingColorSpace,gt=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap,bt=ke.get(k.envMap||vt,gt),Bt=k.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Xt=!!V.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),St=!!V.morphAttributes.position,qt=!!V.morphAttributes.normal,Me=!!V.morphAttributes.color,pe=Ln;if(k.toneMapped){if(z===null||z.isXRRenderTarget===!0)pe=w.toneMapping}let ce=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,He=ce!==void 0?ce.length:0,Mt=Pt.get(k),Ke=b.state.lights;if(ve===!0){if(tn===!0||A!==q){let ge=A===q&&k.id===st;X.setState(k,A,ge)}}let Kt=!1,Ti=!1;if(k.version===Mt.__version){if(Mt.needsLights&&Mt.lightsStateVersion!==Ke.state.version)Kt=!0;else if(H.isBatchedMesh&&Mt.batching===!1)Kt=!0;else if(!H.isBatchedMesh&&Mt.batching===!0)Kt=!0;else if(H.isBatchedMesh&&Mt.batchingColor===!0&&H._colorsTexture===null)Kt=!0;else if(H.isBatchedMesh&&Mt.batchingColor===!1&&H._colorsTexture!==null)Kt=!0;else if(H.isInstancedMesh&&Mt.instancing===!1)Kt=!0;else if(!H.isInstancedMesh&&Mt.instancing===!0)Kt=!0;else if(H.isSkinnedMesh&&Mt.skinning===!1)Kt=!0;else if(!H.isSkinnedMesh&&Mt.skinning===!0)Kt=!0;else if(H.isInstancedMesh&&Mt.instancingColor===!0&&H.instanceColor===null)Kt=!0;else if(H.isInstancedMesh&&Mt.instancingColor===!1&&H.instanceColor!==null)Kt=!0;else if(H.isInstancedMesh&&Mt.instancingMorph===!0&&H.morphTexture===null)Kt=!0;else if(H.isInstancedMesh&&Mt.instancingMorph===!1&&H.morphTexture!==null)Kt=!0;else if(Mt.envMap!==bt)Kt=!0;else if(k.fog===!0&&Mt.fog!==ht)Kt=!0;else if(Mt.numClippingPlanes!==void 0&&(Mt.numClippingPlanes!==X.numPlanes||Mt.numIntersection!==X.numIntersection))Kt=!0;else if(Mt.vertexAlphas!==Bt)Kt=!0;else if(Mt.vertexTangents!==Xt)Kt=!0;else if(Mt.morphTargets!==St)Kt=!0;else if(Mt.morphNormals!==qt)Kt=!0;else if(Mt.morphColors!==Me)Kt=!0;else if(Mt.morphTargetsCount!==He)Kt=!0;else if(Mt.numLightProbeGrids!==$c(b.state.lightProbeGridArray))Kt=!0;else if(Mt.outputColorSpace!==lt||Mt.toneMapping!==pe)Ti=!0}else Kt=!0,Mt.__version=k.version;let Ve=Mt.currentProgram;if(Kt===!0||Ti===!0){if(Ve=Ti===!0?np(k,U,H,lt,pe):Fs(k,U,H),R&&k.isNodeMaterial)R.onUpdateProgram(k,Ve,Mt)}let wr=!1,ni=!1,Ai=!1,Jt=Ve.getUniforms(),Oe=Mt.uniforms;if(ft.useProgram(Ve.program))wr=!0,ni=!0,Ai=!0;if(k.id!==st)st=k.id,ni=!0;if(wr||q!==A){if(ft.buffers.depth.getReversed()&&A.reversedDepth!==!0)A._reversedDepth=!0,A.updateProjectionMatrix();Jt.setValue(O,"projectionMatrix",A.projectionMatrix),Jt.setValue(O,"viewMatrix",A.matrixWorldInverse);let Ne=Jt.map.cameraPosition;if(Ne!==void 0)Ne.setValue(O,Se.setFromMatrixPosition(A.matrixWorld));if(Pe.logarithmicDepthBuffer)Jt.setValue(O,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2));if(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)Jt.setValue(O,"isOrthographic",A.isOrthographicCamera===!0);if(q!==A)q=A,ni=!0,Ai=!0}if(Mt.needsLights){if(Ke.state.sunShadowMap.length>0)Jt.setValue(O,"sunShadowMap",Ke.state.sunShadowMap,Ot);if(Ke.state.directionalShadowMap.length>0)Jt.setValue(O,"directionalShadowMap",Ke.state.directionalShadowMap,Ot);if(Ke.state.spotShadowMap.length>0)Jt.setValue(O,"spotShadowMap",Ke.state.spotShadowMap,Ot);if(Ke.state.pointShadowMap.length>0)Jt.setValue(O,"pointShadowMap",Ke.state.pointShadowMap,Ot)}if(H.isSkinnedMesh){Jt.setOptional(O,H,"bindMatrix"),Jt.setOptional(O,H,"bindMatrixInverse");let ge=H.skeleton;if(ge){if(ge.boneTexture===null)ge.computeBoneTexture();Jt.setValue(O,"boneTexture",ge.boneTexture,Ot)}}if(H.isBatchedMesh){if(Jt.setOptional(O,H,"batchingTexture"),Jt.setValue(O,"batchingTexture",H._matricesTexture,Ot),Jt.setOptional(O,H,"batchingIdTexture"),Jt.setValue(O,"batchingIdTexture",H._indirectTexture,Ot),Jt.setOptional(O,H,"batchingColorTexture"),H._colorsTexture!==null)Jt.setValue(O,"batchingColorTexture",H._colorsTexture,Ot)}let vn=V.morphAttributes;if(vn.position!==void 0||vn.normal!==void 0||vn.color!==void 0)D.update(H,V,Ve);if(ni||Mt.receiveShadow!==H.receiveShadow)Mt.receiveShadow=H.receiveShadow,Jt.setValue(O,"receiveShadow",H.receiveShadow);if((k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial)&&k.envMap===null&&U.environment!==null)Oe.envMapIntensity.value=U.environmentIntensity;if(Oe.dfgLUT!==void 0)Oe.dfgLUT.value=hy();if(ni){if(Jt.setValue(O,"toneMappingExposure",w.toneMappingExposure),Mt.needsLights)sp(Oe,Ai);if(ht&&k.fog===!0)j.refreshFogUniforms(Oe,ht);if(j.refreshMaterialUniforms(Oe,k,It,Rt,b.state.transmissionRenderTarget[A.id]),Mt.needsLights&&Mt.numLightProbeGrids>0){let ge=M,Ne=0;for(let kn of b.state.lightProbeGridArray){if(kn.texture===null)continue;ge.textures[Ne]=kn.texture,ge.min[Ne]=kn.boundingBox.min,ge.max[Ne]=kn.boundingBox.max,ge.resolution[Ne]=kn.resolution,Ne++}for(let kn in ge)ge[kn].length=Ne;Oe.probesSH.value=ge.textures,Oe.probesMin.value=ge.min,Oe.probesMax.value=ge.max,Oe.probesResolution.value=ge.resolution}dr.upload(O,Kc(Mt),Oe,Ot)}if(k.isShaderMaterial&&k.uniformsNeedUpdate===!0)dr.upload(O,Kc(Mt),Oe,Ot),k.uniformsNeedUpdate=!1;if(k.isSpriteMaterial)Jt.setValue(O,"center",H.center);if(Jt.setValue(O,"modelViewMatrix",H.modelViewMatrix),Jt.setValue(O,"normalMatrix",H.normalMatrix),Jt.setValue(O,"modelMatrix",H.matrixWorld),k.uniformsGroups!==void 0){let ge=k.uniformsGroups;for(let Ne=0,kn=ge.length;Ne<kn;Ne++){let th=ge[Ne];ut.update(th,Ve),ut.bind(th,Ve)}}return Ve}function sp(A,U){A.ambientLightColor.needsUpdate=U,A.lightProbe.needsUpdate=U,A.sunLights.needsUpdate=U,A.sunLightShadows.needsUpdate=U,A.directionalLights.needsUpdate=U,A.directionalLightShadows.needsUpdate=U,A.pointLights.needsUpdate=U,A.pointLightShadows.needsUpdate=U,A.spotLights.needsUpdate=U,A.spotLightShadows.needsUpdate=U,A.rectAreaLights.needsUpdate=U,A.hemisphereLights.needsUpdate=U}function rp(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(A,U,V){let k=Pt.get(A);if(k.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1)k.__useRenderToTexture=!1;Pt.get(A.texture).__webglTexture=U,Pt.get(A.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:V,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,U){let V=Pt.get(A);V.__webglFramebuffer=U,V.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(A,U=0,V=0){z=A,B=U,W=V;let k=null,H=!1,ht=!1;if(A){let lt=Pt.get(A);if(lt.__useDefaultFramebuffer!==void 0){ft.bindFramebuffer(O.FRAMEBUFFER,lt.__webglFramebuffer),Q.copy(A.viewport),et.copy(A.scissor),xt=A.scissorTest,ft.viewport(Q),ft.scissor(et),ft.setScissorTest(xt),st=-1;return}else if(lt.__webglFramebuffer===void 0)Ot.setupRenderTarget(A);else if(lt.__hasExternalTextures)Ot.rebindTextures(A,Pt.get(A.texture).__webglTexture,Pt.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let Bt=A.depthTexture;if(lt.__boundDepthTexture!==Bt){if(Bt!==null&&Pt.has(Bt)&&(A.width!==Bt.image.width||A.height!==Bt.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Ot.setupDepthRenderbuffer(A)}}let gt=A.texture;if(gt.isData3DTexture||gt.isDataArrayTexture||gt.isCompressedArrayTexture)ht=!0;let bt=Pt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget){if(Array.isArray(bt[U]))k=bt[U][V];else k=bt[U];H=!0}else if(A.samples>0&&Ot.useMultisampledRTT(A)===!1)k=Pt.get(A).__webglMultisampledFramebuffer;else if(Array.isArray(bt))k=bt[V];else k=bt;Q.copy(A.viewport),et.copy(A.scissor),xt=A.scissorTest}else Q.copy(kt).multiplyScalar(It).floor(),et.copy(zt).multiplyScalar(It).floor(),xt=ne;if(V!==0)k=L;if(ft.bindFramebuffer(O.FRAMEBUFFER,k))ft.drawBuffers(A,k);if(ft.viewport(Q),ft.scissor(et),ft.setScissorTest(xt),H){let lt=Pt.get(A.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+U,lt.__webglTexture,V)}else if(ht){let lt=U;for(let gt=0;gt<A.textures.length;gt++){let bt=Pt.get(A.textures[gt]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+gt,bt.__webglTexture,V,lt)}}else if(A!==null&&V!==0){let lt=Pt.get(A.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,lt.__webglTexture,V)}st=-1};function jc(A){let U=Pt.get(A);if(U.__readFormat!==A.format||U.__readType!==A.type)U.__readFormat=A.format,U.__readType=A.type,U.__formatReadable=Pe.textureFormatReadable(A.format),U.__typeReadable=Pe.textureTypeReadable(A.type);return U}if(this.readRenderTargetPixels=function(A,U,V,k,H,ht,vt,lt=0){if(!(A&&A.isWebGLRenderTarget)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let gt=Pt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&vt!==void 0){if(gt=gt[vt],Array.isArray(gt))gt=gt[0]}if(gt){ft.bindFramebuffer(O.FRAMEBUFFER,gt);try{let bt=A.textures[lt],Bt=bt.format,Xt=bt.type;if(A.textures.length>1)O.readBuffer(O.COLOR_ATTACHMENT0+lt);let St=jc(bt);if(St.__formatReadable===!1){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(St.__typeReadable===!1){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(U>=0&&U<=A.width-k&&(V>=0&&V<=A.height-H))O.readPixels(U,V,k,H,it.convert(Bt),it.convert(Xt),ht)}finally{let bt=z!==null?Pt.get(z).__webglFramebuffer:null;ft.bindFramebuffer(O.FRAMEBUFFER,bt)}}},this.readRenderTargetPixelsAsync=async function(A,U,V,k,H,ht,vt,lt=0){if(!(A&&A.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let gt=Pt.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&vt!==void 0){if(gt=gt[vt],Array.isArray(gt))gt=gt[0]}if(gt)if(U>=0&&U<=A.width-k&&(V>=0&&V<=A.height-H)){ft.bindFramebuffer(O.FRAMEBUFFER,gt);let bt=A.textures[lt],Bt=bt.format,Xt=bt.type;if(A.textures.length>1)O.readBuffer(O.COLOR_ATTACHMENT0+lt);let St=jc(bt);if(St.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(St.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let qt=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,qt),O.bufferData(O.PIXEL_PACK_BUFFER,ht.byteLength,O.STREAM_READ),O.readPixels(U,V,k,H,it.convert(Bt),it.convert(Xt),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let Me=z!==null?Pt.get(z).__webglFramebuffer:null;ft.bindFramebuffer(O.FRAMEBUFFER,Me);let pe=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await Wu(O,pe,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,qt),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,ht),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(qt),O.deleteSync(pe),ht}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,U=null,V=0){let k=Math.pow(2,-V),H=Math.floor(A.image.width*k),ht=Math.floor(A.image.height*k),vt=U!==null?U.x:0,lt=U!==null?U.y:0;Ot.setTexture2D(A,0),O.copyTexSubImage2D(O.TEXTURE_2D,V,0,0,vt,lt,H,ht),ft.unbindTexture()},this.copyTextureToTexture=function(A,U,V=null,k=null,H=0,ht=0){let vt,lt,gt,bt,Bt,Xt,St,qt,Me,pe=A.isCompressedTexture?A.mipmaps[ht]:A.image;if(V!==null)vt=V.max.x-V.min.x,lt=V.max.y-V.min.y,gt=V.isBox3?V.max.z-V.min.z:1,bt=V.min.x,Bt=V.min.y,Xt=V.isBox3?V.min.z:0;else{let Jt=Math.pow(2,-H);if(vt=Math.floor(pe.width*Jt),lt=Math.floor(pe.height*Jt),A.isDataArrayTexture)gt=pe.depth;else if(A.isData3DTexture)gt=Math.floor(pe.depth*Jt);else gt=1;bt=0,Bt=0,Xt=0}if(k!==null)St=k.x,qt=k.y,Me=k.z;else St=0,qt=0,Me=0;let ce=it.convert(U.format),He=it.convert(U.type),Mt;if(U.isData3DTexture)Ot.setTexture3D(U,0),Mt=O.TEXTURE_3D;else if(U.isDataArrayTexture||U.isCompressedArrayTexture)Ot.setTexture2DArray(U,0),Mt=O.TEXTURE_2D_ARRAY;else Ot.setTexture2D(U,0),Mt=O.TEXTURE_2D;ft.activeTexture(O.TEXTURE0),ft.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,U.flipY),ft.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),ft.pixelStorei(O.UNPACK_ALIGNMENT,U.unpackAlignment);let Ke=ft.getParameter(O.UNPACK_ROW_LENGTH),Kt=ft.getParameter(O.UNPACK_IMAGE_HEIGHT),Ti=ft.getParameter(O.UNPACK_SKIP_PIXELS),Ve=ft.getParameter(O.UNPACK_SKIP_ROWS),wr=ft.getParameter(O.UNPACK_SKIP_IMAGES);ft.pixelStorei(O.UNPACK_ROW_LENGTH,pe.width),ft.pixelStorei(O.UNPACK_IMAGE_HEIGHT,pe.height),ft.pixelStorei(O.UNPACK_SKIP_PIXELS,bt),ft.pixelStorei(O.UNPACK_SKIP_ROWS,Bt),ft.pixelStorei(O.UNPACK_SKIP_IMAGES,Xt);let ni=A.isDataArrayTexture||A.isData3DTexture,Ai=U.isDataArrayTexture||U.isData3DTexture;if(A.isDepthTexture){let Jt=Pt.get(A),Oe=Pt.get(U),vn=Pt.get(Jt.__renderTarget),ge=Pt.get(Oe.__renderTarget);ft.bindFramebuffer(O.READ_FRAMEBUFFER,vn.__webglFramebuffer),ft.bindFramebuffer(O.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let Ne=0;Ne<gt;Ne++){if(ni)O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Pt.get(A).__webglTexture,H,Xt+Ne),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Pt.get(U).__webglTexture,ht,Me+Ne);O.blitFramebuffer(bt,Bt,bt+vt,Bt+lt,St,qt,St+vt,qt+lt,O.DEPTH_BUFFER_BIT,O.NEAREST)}ft.bindFramebuffer(O.READ_FRAMEBUFFER,null),ft.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(H!==0||A.isRenderTargetTexture||Pt.has(A)){let Jt=Pt.get(A),Oe=Pt.get(U);ft.bindFramebuffer(O.READ_FRAMEBUFFER,F),ft.bindFramebuffer(O.DRAW_FRAMEBUFFER,C);for(let vn=0;vn<gt;vn++){if(ni)O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Jt.__webglTexture,H,Xt+vn);else O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Jt.__webglTexture,H);if(Ai)O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Oe.__webglTexture,ht,Me+vn);else O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Oe.__webglTexture,ht);if(H!==0)O.blitFramebuffer(bt,Bt,bt+vt,Bt+lt,St,qt,St+vt,qt+lt,O.COLOR_BUFFER_BIT,O.NEAREST);else if(Ai)O.copyTexSubImage3D(Mt,ht,St,qt,Me+vn,bt,Bt,vt,lt);else O.copyTexSubImage2D(Mt,ht,St,qt,bt,Bt,vt,lt)}ft.bindFramebuffer(O.READ_FRAMEBUFFER,null),ft.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(Ai)if(A.isDataTexture||A.isData3DTexture)O.texSubImage3D(Mt,ht,St,qt,Me,vt,lt,gt,ce,He,pe.data);else if(U.isCompressedArrayTexture)O.compressedTexSubImage3D(Mt,ht,St,qt,Me,vt,lt,gt,ce,pe.data);else O.texSubImage3D(Mt,ht,St,qt,Me,vt,lt,gt,ce,He,pe);else if(A.isDataTexture)O.texSubImage2D(O.TEXTURE_2D,ht,St,qt,vt,lt,ce,He,pe.data);else if(A.isCompressedTexture)O.compressedTexSubImage2D(O.TEXTURE_2D,ht,St,qt,pe.width,pe.height,ce,pe.data);else O.texSubImage2D(O.TEXTURE_2D,ht,St,qt,vt,lt,ce,He,pe);if(ft.pixelStorei(O.UNPACK_ROW_LENGTH,Ke),ft.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Kt),ft.pixelStorei(O.UNPACK_SKIP_PIXELS,Ti),ft.pixelStorei(O.UNPACK_SKIP_ROWS,Ve),ft.pixelStorei(O.UNPACK_SKIP_IMAGES,wr),ht===0&&U.generateMipmaps===!0&&U.mipmapsAutoUpdate===!0)O.generateMipmap(Mt);ft.unbindTexture()},this.initRenderTarget=function(A){if(Pt.get(A).__webglFramebuffer===void 0)Ot.setupRenderTarget(A)},this.initTexture=function(A){if(A.isCubeTexture)Ot.setTextureCube(A,0);else if(A.isData3DTexture)Ot.setTexture3D(A,0);else if(A.isDataArrayTexture||A.isCompressedArrayTexture)Ot.setTexture2DArray(A,0);else Ot.setTexture2D(A,0);ft.unbindTexture()},this.resetState=function(){B=0,W=0,z=null,ft.reset(),rt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return zl}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Vt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Vt._getUnpackColorSpace()}}var hd=0,ud=1,fd=2;var Sc=2;var Oo=1.25,Mc=1,Fe=32,ae=8,Bo=65535;var Ss=Math.pow(2,-24),mr=Symbol("SKIP_GENERATION"),zo={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[mr]:!1};class fn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let n=1/0,i=-1/0;for(let s=0,r=t.length;s<r;s++){let a=t[s][e];n=a<n?a:n,i=a>i?a:i}this.min=n,this.max=i}setFromPoints(t,e){let n=1/0,i=-1/0;for(let s=0,r=e.length;s<r;s++){let o=e[s],a=t.dot(o);n=a<n?a:n,i=a>i?a:i}this.min=n,this.max=i}isSeparated(t){return this.min>t.max||t.min>this.max}}fn.prototype.setFromBox=function(){let t=new N;return function(n,i){let{min:s,max:r}=i,o=1/0,a=-1/0;for(let l=0;l<=1;l++)for(let c=0;c<=1;c++)for(let u=0;u<=1;u++){t.x=s.x*l+r.x*(1-l),t.y=s.y*c+r.y*(1-c),t.z=s.z*u+r.z*(1-u);let f=n.dot(t);o=Math.min(f,o),a=Math.max(f,a)}this.min=o,this.max=a}}();var qM=function(){let t=new fn;return function(n,i){let{points:s,satAxes:r,satBounds:o}=n,a=i.points,l=i.satAxes,c=i.satBounds;for(let u=0;u<3;u++){let f=o[u],h=r[u];if(t.setFromPoints(h,a),f.isSeparated(t))return!1}for(let u=0;u<3;u++){let f=c[u],h=l[u];if(t.setFromPoints(h,s),f.isSeparated(t))return!1}}}();var dy=function(){let t=new N,e=new N,n=new N;return function(s,r,o){let a=s.start,l=t,c=r.start,u=e;n.subVectors(a,c),t.subVectors(s.end,s.start),e.subVectors(r.end,r.start);let f=n.dot(u),h=u.dot(l),d=u.dot(u),_=n.dot(l),p=l.dot(l)*d-h*h,g,x;if(p!==0)g=(f*h-_*d)/p;else g=0;x=(f+g*h)/d,o.x=g,o.y=x}}(),gr=function(){let t=new Lt,e=new N,n=new N;return function(s,r,o,a){dy(s,r,t);let{x:l,y:c}=t;if(l>=0&&l<=1&&c>=0&&c<=1){s.at(l,o),r.at(c,a);return}else if(l>=0&&l<=1){if(c<0)r.at(0,a);else r.at(1,a);s.closestPointToPoint(a,!0,o);return}else if(c>=0&&c<=1){if(l<0)s.at(0,o);else s.at(1,o);r.closestPointToPoint(o,!0,a);return}else{let u;if(l<0)u=s.start;else u=s.end;let f;if(c<0)f=r.start;else f=r.end;let h=e,d=n;if(s.closestPointToPoint(f,!0,e),r.closestPointToPoint(u,!0,n),h.distanceToSquared(f)<=d.distanceToSquared(u)){o.copy(h),a.copy(f);return}else{o.copy(u),a.copy(d);return}}}}(),dd=function(){let t=new N,e=new N,n=new rn,i=new an;return function(r,o){let{radius:a,center:l}=r,{a:c,b:u,c:f}=o;if(i.start=c,i.end=u,i.closestPointToPoint(l,!0,t).distanceTo(l)<=a)return!0;if(i.start=c,i.end=f,i.closestPointToPoint(l,!0,t).distanceTo(l)<=a)return!0;if(i.start=u,i.end=f,i.closestPointToPoint(l,!0,t).distanceTo(l)<=a)return!0;let S=o.getPlane(n);if(Math.abs(S.distanceToPoint(l))<=a){let g=S.projectPoint(l,e);if(o.containsPoint(g))return!0}return!1}}();var py=["x","y","z"],ei=0.000000000000001,pd=ei*ei;function _n(t){return Math.abs(t)<ei}class Je extends Te{constructor(...t){super(...t);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new N),this.satBounds=[,,,,].fill().map(()=>new fn),this.points=[this.a,this.b,this.c],this.plane=new rn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new an,this.needsUpdate=!0}intersectsSphere(t){return dd(t,this)}update(){let t=this.a,e=this.b,n=this.c,i=this.points,s=this.satAxes,r=this.satBounds,o=s[0],a=r[0];this.getNormal(o),a.setFromPoints(o,i);let l=s[1],c=r[1];l.subVectors(t,e),c.setFromPoints(l,i);let u=s[2],f=r[2];u.subVectors(e,n),f.setFromPoints(u,i);let h=s[3],d=r[3];h.subVectors(n,t),d.setFromPoints(h,i);let _=l.length(),S=u.length(),p=h.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,_<ei)if(S<ei||p<ei)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(n);else if(S<ei)if(p<ei)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t);else if(p<ei)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(e);this.plane.setFromNormalAndCoplanarPoint(o,t),this.needsUpdate=!1}}Je.prototype.closestPointToSegment=function(){let t=new N,e=new N,n=new an;return function(s,r=null,o=null){if(this.needsUpdate)this.update();let{start:a,end:l}=s,c=this.points,u,f=1/0,h=this.plane.distanceToPoint(a),d=this.plane.distanceToPoint(l);if(h*d<0&&this.plane.intersectLine(s,t)!==null&&this.containsPoint(t)){if(r)r.copy(t);if(o)o.copy(t);return 0}for(let _=0;_<3;_++){let S=(_+1)%3;if(n.start.copy(c[_]),n.end.copy(c[S]),gr(n,s,t,e),u=t.distanceToSquared(e),u<f){if(f=u,r)r.copy(t);if(o)o.copy(e)}}if(this.closestPointToPoint(a,t),u=a.distanceToSquared(t),u<f){if(f=u,r)r.copy(t);if(o)o.copy(a)}if(this.closestPointToPoint(l,t),u=l.distanceToSquared(t),u<f){if(f=u,r)r.copy(t);if(o)o.copy(l)}return Math.sqrt(f)}}();Je.prototype.intersectsTriangle=function(){let t=new Je,e=new fn,n=new fn,i=new N,s=new N,r=new N,o=new N,a=new an,l=new an,c=new N,u=new Lt,f=new Lt;function h(M,y,b,E){let m=i;if(!M.isDegenerateIntoPoint&&!M.isDegenerateIntoSegment)m.copy(M.plane.normal);else m.copy(y.plane.normal);let{satBounds:v,satAxes:w}=M;for(let L=1;L<4;L++){let F=v[L],C=w[L];if(e.setFromPoints(C,y.points),F.isSeparated(e))return!1;if(o.copy(m).cross(C),e.setFromPoints(o,M.points),n.setFromPoints(o,y.points),e.isSeparated(n))return!1}let{satBounds:P,satAxes:R}=y;for(let L=1;L<4;L++){let F=P[L],C=R[L];if(e.setFromPoints(C,M.points),F.isSeparated(e))return!1;if(o.crossVectors(m,C),e.setFromPoints(o,M.points),n.setFromPoints(o,y.points),e.isSeparated(n))return!1}if(b){if(!E)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");b.start.set(0,0,0),b.end.set(0,0,0)}return!0}function d(M,y,b,E,m,v,w,P,R,L,F){let C=w/(w-P);L.x=E+(m-E)*C,F.start.subVectors(y,M).multiplyScalar(C).add(M),C=w/(w-R),L.y=E+(v-E)*C,F.end.subVectors(b,M).multiplyScalar(C).add(M)}function _(M,y,b,E,m,v,w,P,R,L,F){if(m>0)d(M.c,M.a,M.b,E,y,b,R,w,P,L,F);else if(v>0)d(M.b,M.a,M.c,b,y,E,P,w,R,L,F);else if(P*R>0||w!=0)d(M.a,M.b,M.c,y,b,E,w,P,R,L,F);else if(P!=0)d(M.b,M.a,M.c,b,y,E,P,w,R,L,F);else if(R!=0)d(M.c,M.a,M.b,E,y,b,R,w,P,L,F);else return!0;return!1}function S(M,y,b,E){let m=y.degenerateSegment,v=M.plane.distanceToPoint(m.start),w=M.plane.distanceToPoint(m.end);if(_n(v))if(_n(w))return h(M,y,b,E);else{if(b)b.start.copy(m.start),b.end.copy(m.start);return M.containsPoint(m.start)}else if(_n(w)){if(b)b.start.copy(m.end),b.end.copy(m.end);return M.containsPoint(m.end)}else if(M.plane.intersectLine(m,i)!=null){if(b)b.start.copy(i),b.end.copy(i);return M.containsPoint(i)}else return!1}function p(M,y,b){let E=y.a;if(_n(M.plane.distanceToPoint(E))&&M.containsPoint(E)){if(b)b.start.copy(E),b.end.copy(E);return!0}else return!1}function g(M,y,b){let E=M.degenerateSegment,m=y.a;if(E.closestPointToPoint(m,!0,i),m.distanceToSquared(i)<pd){if(b)b.start.copy(m),b.end.copy(m);return!0}else return!1}function x(M,y,b,E){if(M.isDegenerateIntoSegment)if(y.isDegenerateIntoSegment){let m=M.degenerateSegment,v=y.degenerateSegment,w=s,P=r;m.delta(w),v.delta(P);let R=i.subVectors(v.start,m.start),L=w.x*P.y-w.y*P.x;if(_n(L))return!1;let F=(R.x*P.y-R.y*P.x)/L,C=-(w.x*R.y-w.y*R.x)/L;if(F<0||F>1||C<0||C>1)return!1;let B=m.start.z+w.z*F,W=v.start.z+P.z*C;if(_n(B-W)){if(b)b.start.copy(m.start).addScaledVector(w,F),b.end.copy(m.start).addScaledVector(w,F);return!0}else return!1}else if(y.isDegenerateIntoPoint)return g(M,y,b);else return S(y,M,b,E);else if(M.isDegenerateIntoPoint)if(y.isDegenerateIntoPoint)if(y.a.distanceToSquared(M.a)<pd){if(b)b.start.copy(M.a),b.end.copy(M.a);return!0}else return!1;else if(y.isDegenerateIntoSegment)return g(y,M,b);else return p(y,M,b);else if(y.isDegenerateIntoPoint)return p(M,y,b);else if(y.isDegenerateIntoSegment)return S(M,y,b,E)}return function(y,b=null,E=!1){if(this.needsUpdate)this.update();if(!y.isExtendedTriangle)t.copy(y),t.update(),y=t;else if(y.needsUpdate)y.update();let m=x(this,y,b,E);if(m!==void 0)return m;let v=this.plane,w=y.plane,P=w.distanceToPoint(this.a),R=w.distanceToPoint(this.b),L=w.distanceToPoint(this.c);if(_n(P))P=0;if(_n(R))R=0;if(_n(L))L=0;let F=P*R,C=P*L;if(F>0&&C>0)return!1;let B=v.distanceToPoint(y.a),W=v.distanceToPoint(y.b),z=v.distanceToPoint(y.c);if(_n(B))B=0;if(_n(W))W=0;if(_n(z))z=0;let st=B*W,q=B*z;if(st>0&&q>0)return!1;s.copy(v.normal),r.copy(w.normal);let Q=s.cross(r),et=0,xt=Math.abs(Q.x),K=Math.abs(Q.y);if(K>xt)xt=K,et=1;if(Math.abs(Q.z)>xt)et=2;let _t=py[et],Rt=this.a[_t],It=this.b[_t],yt=this.c[_t],$t=y.a[_t],kt=y.b[_t],zt=y.c[_t];if(_(this,Rt,It,yt,F,C,P,R,L,u,a))return h(this,y,b,E);if(_(y,$t,kt,zt,st,q,B,W,z,f,l))return h(this,y,b,E);if(u.y<u.x){let ne=u.y;u.y=u.x,u.x=ne,c.copy(a.start),a.start.copy(a.end),a.end.copy(c)}if(f.y<f.x){let ne=f.y;f.y=f.x,f.x=ne,c.copy(l.start),l.start.copy(l.end),l.end.copy(c)}if(u.y<f.x||f.y<u.x)return!1;if(b){if(f.x>u.x)b.start.copy(l.start);else b.start.copy(a.start);if(f.y<u.y)b.end.copy(l.end);else b.end.copy(a.end)}return!0}}();Je.prototype.distanceToPoint=function(){let t=new N;return function(n){return this.closestPointToPoint(n,t),n.distanceTo(t)}}();Je.prototype.distanceToTriangle=function(){let t=new N,e=new N,n=["a","b","c"],i=new an,s=new an;return function(o,a=null,l=null){let c=a||l?i:null;if(this.intersectsTriangle(o,c,!0)){if(a||l){if(a)c.getCenter(a);if(l)c.getCenter(l)}return 0}let u=1/0;for(let f=0;f<3;f++){let h,d=n[f],_=o[d];if(this.closestPointToPoint(_,t),h=_.distanceToSquared(t),h<u){if(u=h,a)a.copy(t);if(l)l.copy(_)}let S=this[d];if(o.closestPointToPoint(S,t),h=S.distanceToSquared(t),h<u){if(u=h,a)a.copy(S);if(l)l.copy(t)}}for(let f=0;f<3;f++){let h=n[f],d=n[(f+1)%3];i.set(this[h],this[d]);for(let _=0;_<3;_++){let S=n[_],p=n[(_+1)%3];s.set(o[S],o[p]),gr(i,s,t,e);let g=t.distanceToSquared(e);if(g<u){if(u=g,a)a.copy(t);if(l)l.copy(e)}}}return Math.sqrt(u)}}();class ye{constructor(t,e,n){if(this.isOrientedBox=!0,this.min=new N,this.max=new N,this.matrix=new wt,this.invMatrix=new wt,this.points=[,,,,,,,,].fill().map(()=>new N),this.satAxes=[,,,].fill().map(()=>new N),this.satBounds=[,,,].fill().map(()=>new fn),this.alignedSatBounds=[,,,].fill().map(()=>new fn),this.needsUpdate=!1,t)this.min.copy(t);if(e)this.max.copy(e);if(n)this.matrix.copy(n)}set(t,e,n){this.min.copy(t),this.max.copy(e),this.matrix.copy(n),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}}ye.prototype.update=function(){return function(){let e=this.matrix,n=this.min,i=this.max,s=this.points;for(let c=0;c<=1;c++)for(let u=0;u<=1;u++)for(let f=0;f<=1;f++){let h=1*c|2*u|4*f,d=s[h];d.x=c?i.x:n.x,d.y=u?i.y:n.y,d.z=f?i.z:n.z,d.applyMatrix4(e)}let r=this.satBounds,o=this.satAxes,a=s[0];for(let c=0;c<3;c++){let u=o[c],f=r[c],h=1<<c,d=s[h];u.subVectors(a,d),f.setFromPoints(u,s)}let l=this.alignedSatBounds;l[0].setFromPointsField(s,"x"),l[1].setFromPointsField(s,"y"),l[2].setFromPointsField(s,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();ye.prototype.intersectsBox=function(){let t=new fn;return function(n){if(this.needsUpdate)this.update();let{min:i,max:s}=n,r=this.satBounds,o=this.satAxes,a=this.alignedSatBounds;if(t.min=i.x,t.max=s.x,a[0].isSeparated(t))return!1;if(t.min=i.y,t.max=s.y,a[1].isSeparated(t))return!1;if(t.min=i.z,t.max=s.z,a[2].isSeparated(t))return!1;for(let l=0;l<3;l++){let c=o[l],u=r[l];if(t.setFromBox(c,n),u.isSeparated(t))return!1}return!0}}();ye.prototype.intersectsTriangle=function(){let t=new Je,e=[,,,],n=new fn,i=new fn,s=new N;return function(o){if(this.needsUpdate)this.update();if(!o.isExtendedTriangle)t.copy(o),t.update(),o=t;else if(o.needsUpdate)o.update();let a=this.satBounds,l=this.satAxes;e[0]=o.a,e[1]=o.b,e[2]=o.c;for(let h=0;h<3;h++){let d=a[h],_=l[h];if(n.setFromPoints(_,e),d.isSeparated(n))return!1}let{satBounds:c,satAxes:u}=o,f=this.points;for(let h=0;h<3;h++){let d=c[h],_=u[h];if(n.setFromPoints(_,f),d.isSeparated(n))return!1}for(let h=0;h<3;h++){let d=l[h];for(let _=0;_<4;_++){let S=u[_];if(s.crossVectors(d,S),n.setFromPoints(s,e),i.setFromPoints(s,f),n.isSeparated(i))return!1}}return!0}}();ye.prototype.closestPointToPoint=function(){return function(e,n){if(this.needsUpdate)this.update();return n.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),n}}();ye.prototype.distanceToPoint=function(){let t=new N;return function(n){return this.closestPointToPoint(n,t),n.distanceTo(t)}}();ye.prototype.distanceToBox=function(){let t=["x","y","z"],e=Array(12).fill().map(()=>new an),n=Array(12).fill().map(()=>new an),i=new N,s=new N;return function(o,a=0,l=null,c=null){if(this.needsUpdate)this.update();if(this.intersectsBox(o)){if(l||c){if(o.getCenter(s),this.closestPointToPoint(s,i),o.closestPointToPoint(i,s),l)l.copy(i);if(c)c.copy(s)}return 0}let u=a*a,f=o.min,h=o.max,d=this.points,_=1/0;for(let p=0;p<8;p++){let g=d[p];s.copy(g).clamp(f,h);let x=g.distanceToSquared(s);if(x<_){if(_=x,l)l.copy(g);if(c)c.copy(s);if(x<u)return Math.sqrt(x)}}let S=0;for(let p=0;p<3;p++)for(let g=0;g<=1;g++)for(let x=0;x<=1;x++){let M=(p+1)%3,y=(p+2)%3,b=g<<M|x<<y,E=1<<p|g<<M|x<<y,m=d[b],v=d[E];e[S].set(m,v);let P=t[p],R=t[M],L=t[y],F=n[S],C=F.start,B=F.end;C[P]=f[P],C[R]=g?f[R]:h[R],C[L]=x?f[L]:h[L],B[P]=h[P],B[R]=g?f[R]:h[R],B[L]=x?f[L]:h[L],S++}for(let p=0;p<=1;p++)for(let g=0;g<=1;g++)for(let x=0;x<=1;x++){s.x=p?h.x:f.x,s.y=g?h.y:f.y,s.z=x?h.z:f.z,this.closestPointToPoint(s,i);let M=s.distanceToSquared(i);if(M<_){if(_=M,l)l.copy(i);if(c)c.copy(s);if(M<u)return Math.sqrt(M)}}for(let p=0;p<12;p++){let g=e[p];for(let x=0;x<12;x++){let M=n[x];gr(g,M,i,s);let y=i.distanceToSquared(s);if(y<_){if(_=y,l)l.copy(i);if(c)c.copy(s);if(y<u)return Math.sqrt(y)}}}return Math.sqrt(_)}}();class Vi{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;if(t.length===0)return this._getNewPrimitive();else return t.pop()}releasePrimitive(t){this._primitives.push(t)}}class md extends Vi{constructor(){super(()=>new Je)}}var je=new md;var _r=new N,bc=new N;function gd(t,e,n={},i=0,s=1/0){let r=i*i,o=s*s,a=1/0,l=null;if(t.shapecast({boundsTraverseOrder:(u)=>(_r.copy(e).clamp(u.min,u.max),_r.distanceToSquared(e)),intersectsBounds:(u,f,h)=>h<a&&h<o,intersectsTriangle:(u,f)=>{u.closestPointToPoint(e,_r);let h=e.distanceToSquared(_r);if(h<a)bc.copy(_r),a=h,l=f;if(h<r)return!0;else return!1}}),a===1/0)return null;let c=Math.sqrt(a);if(!n.point)n.point=bc.clone();else n.point.copy(bc);return n.distance=c,n.faceIndex=l,n}function Zt(t,e){return e[t+15]===Bo}function ee(t,e){return e[t+6]}function le(t,e){return e[t+14]}function Qt(t){return t+ae}function jt(t,e){let n=e[t+6];return t+n*ae}function Ms(t,e){return e[t+7]}function me(t){return t}var Go=parseInt(Ni)>=169,my=parseInt(Ni)<=161,Wi=new N,Xi=new N,qi=new N,ko=new Lt,Ho=new Lt,Vo=new Lt,_d=new N,xd=new N,yd=new N,xr=new N;function gy(t,e,n,i,s,r,o,a){let l;if(r===Ye)l=t.intersectTriangle(i,n,e,!0,s);else l=t.intersectTriangle(e,n,i,r!==pn,s);if(l===null)return null;let c=t.origin.distanceTo(s);if(c<o||c>a)return null;return{distance:c,point:s.clone()}}function vd(t,e,n,i,s,r,o,a,l,c,u){Wi.fromBufferAttribute(e,r),Xi.fromBufferAttribute(e,o),qi.fromBufferAttribute(e,a);let f=gy(t,Wi,Xi,qi,xr,l,c,u);if(f){if(i){ko.fromBufferAttribute(i,r),Ho.fromBufferAttribute(i,o),Vo.fromBufferAttribute(i,a),f.uv=new Lt;let d=Te.getInterpolation(xr,Wi,Xi,qi,ko,Ho,Vo,f.uv);if(!Go)f.uv=d}if(s){ko.fromBufferAttribute(s,r),Ho.fromBufferAttribute(s,o),Vo.fromBufferAttribute(s,a),f.uv1=new Lt;let d=Te.getInterpolation(xr,Wi,Xi,qi,ko,Ho,Vo,f.uv1);if(!Go)f.uv1=d;if(my)f.uv2=f.uv1}if(n){_d.fromBufferAttribute(n,r),xd.fromBufferAttribute(n,o),yd.fromBufferAttribute(n,a),f.normal=new N;let d=Te.getInterpolation(xr,Wi,Xi,qi,_d,xd,yd,f.normal);if(f.normal.dot(t.direction)>0)f.normal.multiplyScalar(-1);if(!Go)f.normal=d}let h={a:r,b:o,c:a,normal:new N,materialIndex:0};if(Te.getNormal(Wi,Xi,qi,h.normal),f.face=h,f.faceIndex=r,Go){let d=new N;Te.getBarycoord(xr,Wi,Xi,qi,d),f.barycoord=d}}return f}function Sd(t){return t&&t.isMaterial?t.side:t}function bs(t,e,n,i,s,r,o){let a=i*3,l=a+0,c=a+1,u=a+2,{index:f,groups:h}=t;if(t.index)l=f.getX(l),c=f.getX(c),u=f.getX(u);let{position:d,normal:_,uv:S,uv1:p}=t.attributes;if(Array.isArray(e)){let g=i*3;for(let x=0,M=h.length;x<M;x++){let{start:y,count:b,materialIndex:E}=h[x];if(g>=y&&g<y+b){let m=Sd(e[E]),v=vd(n,d,_,S,p,l,c,u,m,r,o);if(v)if(v.faceIndex=i,v.face.materialIndex=E,s)s.push(v);else return v}}}else{let g=Sd(e),x=vd(n,d,_,S,p,l,c,u,g,r,o);if(x)if(x.faceIndex=i,x.face.materialIndex=0,s)s.push(x);else return x}return null}function ue(t,e,n,i){let{a:s,b:r,c:o}=t,a=e,l=e+1,c=e+2;if(n)a=n.getX(a),l=n.getX(l),c=n.getX(c);s.x=i.getX(a),s.y=i.getY(a),s.z=i.getZ(a),r.x=i.getX(l),r.y=i.getY(l),r.z=i.getZ(l),o.x=i.getX(c),o.y=i.getY(c),o.z=i.getZ(c)}function Md(t,e,n,i,s,r,o,a){let{geometry:l,_indirectBuffer:c}=t;for(let u=i,f=i+s;u<f;u++)bs(l,e,n,u,r,o,a)}function bd(t,e,n,i,s,r,o){let{geometry:a,_indirectBuffer:l}=t,c=1/0,u=null;for(let f=i,h=i+s;f<h;f++){let d;if(d=bs(a,e,n,f,null,r,o),d&&d.distance<c)u=d,c=d.distance}return u}function Td(t,e,n,i,s,r,o){let{geometry:a}=n,{index:l}=a,c=a.attributes.position;for(let u=t,f=e+t;u<f;u++){let h;if(h=u,ue(o,h*3,l,c),o.needsUpdate=!0,i(o,h,s,r))return!0}return!1}function Ad(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let n=t.geometry,i=n.index?n.index.array:null,s=n.attributes.position,r,o,a,l,c=0,u=t._roots;for(let h=0,d=u.length;h<d;h++)r=u[h],o=new Uint32Array(r),a=new Uint16Array(r),l=new Float32Array(r),f(0,c),c+=r.byteLength;function f(h,d,_=!1){let S=h*2;if(Zt(S,a)){let p=ee(h,o),g=le(S,a),x=1/0,M=1/0,y=1/0,b=-1/0,E=-1/0,m=-1/0;for(let v=3*p,w=3*(p+g);v<w;v++){let P=i[v],R=s.getX(P),L=s.getY(P),F=s.getZ(P);if(R<x)x=R;if(R>b)b=R;if(L<M)M=L;if(L>E)E=L;if(F<y)y=F;if(F>m)m=F}if(l[h+0]!==x||l[h+1]!==M||l[h+2]!==y||l[h+3]!==b||l[h+4]!==E||l[h+5]!==m)return l[h+0]=x,l[h+1]=M,l[h+2]=y,l[h+3]=b,l[h+4]=E,l[h+5]=m,!0;else return!1}else{let p=Qt(h),g=jt(h,o),x=_,M=!1,y=!1;if(e){if(!x){let P=p/ae+d/Fe,R=g/ae+d/Fe;M=e.has(P),y=e.has(R),x=!M&&!y}}else M=!0,y=!0;let b=x||M,E=x||y,m=!1;if(b)m=f(p,d,x);let v=!1;if(E)v=f(g,d,x);let w=m||v;if(w)for(let P=0;P<3;P++){let R=p+P,L=g+P,F=l[R],C=l[R+3],B=l[L],W=l[L+3];l[h+P]=F<B?F:B,l[h+P+3]=C>W?C:W}return w}}}function $e(t,e,n,i,s){let r,o,a,l,c,u,f=1/n.direction.x,h=1/n.direction.y,d=1/n.direction.z,_=n.origin.x,S=n.origin.y,p=n.origin.z,g=e[t],x=e[t+3],M=e[t+1],y=e[t+3+1],b=e[t+2],E=e[t+3+2];if(f>=0)r=(g-_)*f,o=(x-_)*f;else r=(x-_)*f,o=(g-_)*f;if(h>=0)a=(M-S)*h,l=(y-S)*h;else a=(y-S)*h,l=(M-S)*h;if(r>l||a>o)return!1;if(a>r||isNaN(r))r=a;if(l<o||isNaN(o))o=l;if(d>=0)c=(b-p)*d,u=(E-p)*d;else c=(E-p)*d,u=(b-p)*d;if(r>u||c>o)return!1;if(c>r||r!==r)r=c;if(u<o||o!==o)o=u;return r<=s&&o>=i}class Ed{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=(n)=>{if(e)t.push(e);e=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{if(e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0)this.setBuffer(t.pop())}}}var Wt=new Ed;function wd(t,e,n,i,s,r,o,a){let{geometry:l,_indirectBuffer:c}=t;for(let u=i,f=i+s;u<f;u++){let h=c?c[u]:u;bs(l,e,n,h,r,o,a)}}function Rd(t,e,n,i,s,r,o){let{geometry:a,_indirectBuffer:l}=t,c=1/0,u=null;for(let f=i,h=i+s;f<h;f++){let d;if(d=bs(a,e,n,l?l[f]:f,null,r,o),d&&d.distance<c)u=d,c=d.distance}return u}function Cd(t,e,n,i,s,r,o){let{geometry:a}=n,{index:l}=a,c=a.attributes.position;for(let u=t,f=e+t;u<f;u++){let h;if(h=n.resolveTriangleIndex(u),ue(o,h*3,l,c),o.needsUpdate=!0,i(o,h,s,r))return!0}return!1}function Id(t,e,n,i,s,r,o){if(Wt.setBuffer(t._roots[e]),$e(0,Wt.float32Array,i,r,o))Tc(0,t,n,i,s,r,o);Wt.clearBuffer()}function Tc(t,e,n,i,s,r,o){let{float32Array:a,uint16Array:l,uint32Array:c}=Wt,u=t*2;if(Zt(u,l)){let h=ee(t,c),d=le(u,l);Md(e,n,i,h,d,s,r,o)}else{let h=Qt(t);if($e(h,a,i,r,o))Tc(h,e,n,i,s,r,o);let d=jt(t,c);if($e(d,a,i,r,o))Tc(d,e,n,i,s,r,o)}}var _y=["x","y","z"];function Pd(t,e,n,i,s,r){Wt.setBuffer(t._roots[e]);let o=null;if($e(0,Wt.float32Array,i,s,r))o=Ac(0,t,n,i,s,r);return Wt.clearBuffer(),o}function Ac(t,e,n,i,s,r){let{float32Array:o,uint16Array:a,uint32Array:l}=Wt,c=t*2;if(Zt(c,a)){let f=ee(t,l),h=le(c,a);return bd(e,n,i,f,h,s,r)}else{let f=Ms(t,l),h=_y[f],_=i.direction[h]>=0,S,p;if(_)S=Qt(t),p=jt(t,l);else S=jt(t,l),p=Qt(t);let x=$e(S,o,i,s,r)?Ac(S,e,n,i,s,r):null;if(x){let b=x.point[h];if(_?b<=o[p+f]:b>=o[p+f+3])return x}let y=$e(p,o,i,s,r)?Ac(p,e,n,i,s,r):null;if(x&&y)return x.distance<=y.distance?x:y;else return x||y||null}}function fe(t,e,n){return n.min.x=e[t],n.min.y=e[t+1],n.min.z=e[t+2],n.max.x=e[t+3],n.max.y=e[t+4],n.max.z=e[t+5],n}function yr(t){let e=-1,n=-1/0;for(let i=0;i<3;i++){let s=t[i+3]-t[i];if(s>n)n=s,e=i}return e}function Ec(t,e,n){for(let i=0;i<3;i++){let s=e[t+2*i],r=e[t+2*i+1],o=s-r,a=s+r;if(o<n[i])n[i]=o;if(a>n[i+3])n[i+3]=a}}function Wo(t){let e=t[3]-t[0],n=t[4]-t[1],i=t[5]-t[2];return 2*(e*n+n*i+i*e)}function wc(t){return t.index?t.index.count:t.attributes.position.count}function yi(t){return wc(t)/3}function xy(t,e=ArrayBuffer){if(t>65535)return new Uint32Array(new e(4*t));else return new Uint16Array(new e(2*t))}function Ld(t,e){if(!t.index){let n=t.attributes.position.count,i=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=xy(n,i);t.setIndex(new Ae(s,1));for(let r=0;r<n;r++)s[r]=r}}function yy(t,e,n){let i=wc(t)/n,s=e?e:t.drawRange,r=s.start/n,o=(s.start+s.count)/n,a=Math.max(0,r),l=Math.min(i,o)-a;return{offset:Math.floor(a),count:Math.floor(l)}}function vy(t,e){return t.groups.map((n)=>({offset:n.start/e,count:n.count/e}))}function Rc(t,e,n){let i=yy(t,e,n),s=vy(t,n);if(!s.length)return[i];let r=[],o=i.offset,a=i.offset+i.count,l=wc(t)/n,c=[];for(let h of s){let{offset:d,count:_}=h,S=d,p=isFinite(_)?_:l-d,g=d+p;if(S<a&&g>o)c.push({pos:Math.max(o,S),isStart:!0}),c.push({pos:Math.min(a,g),isStart:!1})}c.sort((h,d)=>{if(h.pos!==d.pos)return h.pos-d.pos;else return h.type==="end"?-1:1});let u=0,f=null;for(let h of c){let d=h.pos;if(u!==0&&d!==f)r.push({offset:f,count:d-f});u+=h.isStart?1:-1,f=d}return r}var Xo=new te,Ts=new Je,As=new Je,vr=new wt,Nd=new ye,qo=new ye;function Dd(t,e,n,i){Wt.setBuffer(t._roots[e]);let s=Cc(0,t,n,i);return Wt.clearBuffer(),s}function Cc(t,e,n,i,s=null){let{float32Array:r,uint16Array:o,uint32Array:a}=Wt,l=t*2;if(s===null){if(!n.boundingBox)n.computeBoundingBox();Nd.set(n.boundingBox.min,n.boundingBox.max,i),s=Nd}if(Zt(l,o)){let u=e.geometry,f=u.index,h=u.attributes.position,d=n.index,_=n.attributes.position,S=ee(t,a),p=le(l,o);if(vr.copy(i).invert(),n.boundsTree)return fe(me(t),r,qo),qo.matrix.copy(vr),qo.needsUpdate=!0,n.boundsTree.shapecast({intersectsBounds:(x)=>qo.intersectsBox(x),intersectsTriangle:(x)=>{x.a.applyMatrix4(i),x.b.applyMatrix4(i),x.c.applyMatrix4(i),x.needsUpdate=!0;for(let M=S*3,y=(p+S)*3;M<y;M+=3)if(ue(As,M,f,h),As.needsUpdate=!0,x.intersectsTriangle(As))return!0;return!1}});else{let g=yi(n);for(let x=S*3,M=(p+S)*3;x<M;x+=3){ue(Ts,x,f,h),Ts.a.applyMatrix4(vr),Ts.b.applyMatrix4(vr),Ts.c.applyMatrix4(vr),Ts.needsUpdate=!0;for(let y=0,b=g*3;y<b;y+=3)if(ue(As,y,d,_),As.needsUpdate=!0,Ts.intersectsTriangle(As))return!0}}}else{let u=Qt(t),f=jt(t,a);if(fe(me(u),r,Xo),s.intersectsBox(Xo)&&Cc(u,e,n,i,s))return!0;if(fe(me(f),r,Xo),s.intersectsBox(Xo)&&Cc(f,e,n,i,s))return!0;return!1}}var Yo=new wt,Ic=new ye,Sr=new ye,Sy=new N,My=new N,by=new N,Ty=new N;function Ud(t,e,n,i={},s={},r=0,o=1/0){if(!e.boundingBox)e.computeBoundingBox();Ic.set(e.boundingBox.min,e.boundingBox.max,n),Ic.needsUpdate=!0;let a=t.geometry,l=a.attributes.position,c=a.index,u=e.attributes.position,f=e.index,h=je.getPrimitive(),d=je.getPrimitive(),_=Sy,S=My,p=null,g=null;if(s)p=by,g=Ty;let x=1/0,M=null,y=null;if(Yo.copy(n).invert(),Sr.matrix.copy(Yo),t.shapecast({boundsTraverseOrder:(b)=>Ic.distanceToBox(b),intersectsBounds:(b,E,m)=>{if(m<x&&m<o){if(E)Sr.min.copy(b.min),Sr.max.copy(b.max),Sr.needsUpdate=!0;return!0}return!1},intersectsRange:(b,E)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:(v)=>Sr.distanceToBox(v),intersectsBounds:(v,w,P)=>P<x&&P<o,intersectsRange:(v,w)=>{for(let P=v,R=v+w;P<R;P++){ue(d,3*P,f,u),d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let L=b,F=b+E;L<F;L++){ue(h,3*L,c,l),h.needsUpdate=!0;let C=h.distanceToTriangle(d,_,p);if(C<x){if(S.copy(_),g)g.copy(p);x=C,M=L,y=P}if(C<r)return!0}}}});else{let m=yi(e);for(let v=0,w=m;v<w;v++){ue(d,3*v,f,u),d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let P=b,R=b+E;P<R;P++){ue(h,3*P,c,l),h.needsUpdate=!0;let L=h.distanceToTriangle(d,_,p);if(L<x){if(S.copy(_),g)g.copy(p);x=L,M=P,y=v}if(L<r)return!0}}}}}),je.releasePrimitive(h),je.releasePrimitive(d),x===1/0)return null;if(!i.point)i.point=S.clone();else i.point.copy(S);if(i.distance=x,i.faceIndex=M,s){if(!s.point)s.point=g.clone();else s.point.copy(g);s.point.applyMatrix4(Yo),S.applyMatrix4(Yo),s.distance=S.sub(s.point).length(),s.faceIndex=y}return i}function Fd(t,e=null){if(e&&Array.isArray(e))e=new Set(e);let n=t.geometry,i=n.index?n.index.array:null,s=n.attributes.position,r,o,a,l,c=0,u=t._roots;for(let h=0,d=u.length;h<d;h++)r=u[h],o=new Uint32Array(r),a=new Uint16Array(r),l=new Float32Array(r),f(0,c),c+=r.byteLength;function f(h,d,_=!1){let S=h*2;if(Zt(S,a)){let p=ee(h,o),g=le(S,a),x=1/0,M=1/0,y=1/0,b=-1/0,E=-1/0,m=-1/0;for(let v=p,w=p+g;v<w;v++){let P=3*t.resolveTriangleIndex(v);for(let R=0;R<3;R++){let L=P+R;L=i?i[L]:L;let F=s.getX(L),C=s.getY(L),B=s.getZ(L);if(F<x)x=F;if(F>b)b=F;if(C<M)M=C;if(C>E)E=C;if(B<y)y=B;if(B>m)m=B}}if(l[h+0]!==x||l[h+1]!==M||l[h+2]!==y||l[h+3]!==b||l[h+4]!==E||l[h+5]!==m)return l[h+0]=x,l[h+1]=M,l[h+2]=y,l[h+3]=b,l[h+4]=E,l[h+5]=m,!0;else return!1}else{let p=Qt(h),g=jt(h,o),x=_,M=!1,y=!1;if(e){if(!x){let P=p/ae+d/Fe,R=g/ae+d/Fe;M=e.has(P),y=e.has(R),x=!M&&!y}}else M=!0,y=!0;let b=x||M,E=x||y,m=!1;if(b)m=f(p,d,x);let v=!1;if(E)v=f(g,d,x);let w=m||v;if(w)for(let P=0;P<3;P++){let R=p+P,L=g+P,F=l[R],C=l[R+3],B=l[L],W=l[L+3];l[h+P]=F<B?F:B,l[h+P+3]=C>W?C:W}return w}}}function Od(t,e,n,i,s,r,o){if(Wt.setBuffer(t._roots[e]),$e(0,Wt.float32Array,i,r,o))Pc(0,t,n,i,s,r,o);Wt.clearBuffer()}function Pc(t,e,n,i,s,r,o){let{float32Array:a,uint16Array:l,uint32Array:c}=Wt,u=t*2;if(Zt(u,l)){let h=ee(t,c),d=le(u,l);wd(e,n,i,h,d,s,r,o)}else{let h=Qt(t);if($e(h,a,i,r,o))Pc(h,e,n,i,s,r,o);let d=jt(t,c);if($e(d,a,i,r,o))Pc(d,e,n,i,s,r,o)}}var Ay=["x","y","z"];function Bd(t,e,n,i,s,r){Wt.setBuffer(t._roots[e]);let o=null;if($e(0,Wt.float32Array,i,s,r))o=Lc(0,t,n,i,s,r);return Wt.clearBuffer(),o}function Lc(t,e,n,i,s,r){let{float32Array:o,uint16Array:a,uint32Array:l}=Wt,c=t*2;if(Zt(c,a)){let f=ee(t,l),h=le(c,a);return Rd(e,n,i,f,h,s,r)}else{let f=Ms(t,l),h=Ay[f],_=i.direction[h]>=0,S,p;if(_)S=Qt(t),p=jt(t,l);else S=jt(t,l),p=Qt(t);let x=$e(S,o,i,s,r)?Lc(S,e,n,i,s,r):null;if(x){let b=x.point[h];if(_?b<=o[p+f]:b>=o[p+f+3])return x}let y=$e(p,o,i,s,r)?Lc(p,e,n,i,s,r):null;if(x&&y)return x.distance<=y.distance?x:y;else return x||y||null}}var Zo=new te,Es=new Je,ws=new Je,Mr=new wt,zd=new ye,Jo=new ye;function Gd(t,e,n,i){Wt.setBuffer(t._roots[e]);let s=Nc(0,t,n,i);return Wt.clearBuffer(),s}function Nc(t,e,n,i,s=null){let{float32Array:r,uint16Array:o,uint32Array:a}=Wt,l=t*2;if(s===null){if(!n.boundingBox)n.computeBoundingBox();zd.set(n.boundingBox.min,n.boundingBox.max,i),s=zd}if(Zt(l,o)){let u=e.geometry,f=u.index,h=u.attributes.position,d=n.index,_=n.attributes.position,S=ee(t,a),p=le(l,o);if(Mr.copy(i).invert(),n.boundsTree)return fe(me(t),r,Jo),Jo.matrix.copy(Mr),Jo.needsUpdate=!0,n.boundsTree.shapecast({intersectsBounds:(x)=>Jo.intersectsBox(x),intersectsTriangle:(x)=>{x.a.applyMatrix4(i),x.b.applyMatrix4(i),x.c.applyMatrix4(i),x.needsUpdate=!0;for(let M=S,y=p+S;M<y;M++)if(ue(ws,3*e.resolveTriangleIndex(M),f,h),ws.needsUpdate=!0,x.intersectsTriangle(ws))return!0;return!1}});else{let g=yi(n);for(let x=S,M=p+S;x<M;x++){let y=e.resolveTriangleIndex(x);ue(Es,3*y,f,h),Es.a.applyMatrix4(Mr),Es.b.applyMatrix4(Mr),Es.c.applyMatrix4(Mr),Es.needsUpdate=!0;for(let b=0,E=g*3;b<E;b+=3)if(ue(ws,b,d,_),ws.needsUpdate=!0,Es.intersectsTriangle(ws))return!0}}}else{let u=Qt(t),f=jt(t,a);if(fe(me(u),r,Zo),s.intersectsBox(Zo)&&Nc(u,e,n,i,s))return!0;if(fe(me(f),r,Zo),s.intersectsBox(Zo)&&Nc(f,e,n,i,s))return!0;return!1}}var $o=new wt,Dc=new ye,br=new ye,Ey=new N,wy=new N,Ry=new N,Cy=new N;function kd(t,e,n,i={},s={},r=0,o=1/0){if(!e.boundingBox)e.computeBoundingBox();Dc.set(e.boundingBox.min,e.boundingBox.max,n),Dc.needsUpdate=!0;let a=t.geometry,l=a.attributes.position,c=a.index,u=e.attributes.position,f=e.index,h=je.getPrimitive(),d=je.getPrimitive(),_=Ey,S=wy,p=null,g=null;if(s)p=Ry,g=Cy;let x=1/0,M=null,y=null;if($o.copy(n).invert(),br.matrix.copy($o),t.shapecast({boundsTraverseOrder:(b)=>Dc.distanceToBox(b),intersectsBounds:(b,E,m)=>{if(m<x&&m<o){if(E)br.min.copy(b.min),br.max.copy(b.max),br.needsUpdate=!0;return!0}return!1},intersectsRange:(b,E)=>{if(e.boundsTree){let m=e.boundsTree;return m.shapecast({boundsTraverseOrder:(v)=>br.distanceToBox(v),intersectsBounds:(v,w,P)=>P<x&&P<o,intersectsRange:(v,w)=>{for(let P=v,R=v+w;P<R;P++){let L=m.resolveTriangleIndex(P);ue(d,3*L,f,u),d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let F=b,C=b+E;F<C;F++){let B=t.resolveTriangleIndex(F);ue(h,3*B,c,l),h.needsUpdate=!0;let W=h.distanceToTriangle(d,_,p);if(W<x){if(S.copy(_),g)g.copy(p);x=W,M=F,y=P}if(W<r)return!0}}}})}else{let m=yi(e);for(let v=0,w=m;v<w;v++){ue(d,3*v,f,u),d.a.applyMatrix4(n),d.b.applyMatrix4(n),d.c.applyMatrix4(n),d.needsUpdate=!0;for(let P=b,R=b+E;P<R;P++){let L=t.resolveTriangleIndex(P);ue(h,3*L,c,l),h.needsUpdate=!0;let F=h.distanceToTriangle(d,_,p);if(F<x){if(S.copy(_),g)g.copy(p);x=F,M=P,y=v}if(F<r)return!0}}}}}),je.releasePrimitive(h),je.releasePrimitive(d),x===1/0)return null;if(!i.point)i.point=S.clone();else i.point.copy(S);if(i.distance=x,i.faceIndex=M,s){if(!s.point)s.point=g.clone();else s.point.copy(g);s.point.applyMatrix4($o),S.applyMatrix4($o),s.distance=S.sub(s.point).length(),s.faceIndex=y}return i}function Uc(t,e,n){if(t===null)return null;return t.point.applyMatrix4(e.matrixWorld),t.distance=t.point.distanceTo(n.ray.origin),t.object=e,t}function Hd(){return typeof SharedArrayBuffer<"u"}function Ko(t,e,n,i,s){let r=1/0,o=1/0,a=1/0,l=-1/0,c=-1/0,u=-1/0,f=1/0,h=1/0,d=1/0,_=-1/0,S=-1/0,p=-1/0,g=t.offset||0;for(let x=(e-g)*6,M=(e+n-g)*6;x<M;x+=6){let y=t[x+0],b=t[x+1],E=y-b,m=y+b;if(E<r)r=E;if(m>l)l=m;if(y<f)f=y;if(y>_)_=y;let v=t[x+2],w=t[x+3],P=v-w,R=v+w;if(P<o)o=P;if(R>c)c=R;if(v<h)h=v;if(v>S)S=v;let L=t[x+4],F=t[x+5],C=L-F,B=L+F;if(C<a)a=C;if(B>u)u=B;if(L<d)d=L;if(L>p)p=L}i[0]=r,i[1]=o,i[2]=a,i[3]=l,i[4]=c,i[5]=u,s[0]=f,s[1]=h,s[2]=d,s[3]=_,s[4]=S,s[5]=p}var zn=8,Oc=8,Fc=new Int32Array(zn),Bn=new Float32Array(zn*6),Rs=new Float32Array(zn*6),wn=new Float32Array(6),Qo=new Float32Array(6),vi=new Int32Array(Oc),Vd=new Float32Array(Oc*6);function Iy(t,e,n,i){for(let s=0;s<3;s++){let r=e[t+2*s],o=e[t+2*s+1],a=r-o,l=r+o;if(a<n[i+s])n[i+s]=a;if(l>n[i+s+3])n[i+s+3]=l}}function Wd(t,e){let n=t[e+3]-t[e],i=t[e+4]-t[e+1],s=t[e+5]-t[e+2];return 2*(n*i+i*s+s*n)}function Xd(t,e,n,i,s,r){let o=-1,a=0;if(r===hd){if(o=yr(e),o!==-1)a=(e[o]+e[o+3])/2}else if(r===ud){if(o=yr(t),o!==-1)a=Py(n,i,s,o)}else if(r===fd){let l=Wo(t),c=Oo*s,u=n.offset||0,f=(i-u)*6,h=(i+s-u)*6;for(let d=0;d<3;d++){let _=e[d],g=(e[d+3]-_)/zn;if(s<Oc){for(let x=0;x<s;x++){let M=f+x*6,y=n[M+2*d],b=x;while(b>0&&n[vi[b-1]+2*d]>y)vi[b]=vi[b-1],b--;vi[b]=M}for(let x=0;x<3;x++)wn[x]=1/0,wn[x+3]=-1/0,Qo[x]=1/0,Qo[x+3]=-1/0;for(let x=s-1;x>=0;x--)Ec(vi[x],n,Qo),Vd.set(Qo,x*6);for(let x=0;x<s-1;x++){Ec(vi[x],n,wn);let M=n[vi[x+1]+2*d];if(n[vi[x]+2*d]===M)continue;let y=x+1,b=s-y,E=Wo(wn)/l,m=Wd(Vd,y*6)/l,v=Mc+Oo*(E*y+m*b);if(v<c)o=d,c=v,a=M}}else{for(let y=0;y<zn;y++){Fc[y]=0;for(let b=0;b<3;b++)Bn[y*6+b]=1/0,Bn[y*6+b+3]=-1/0}for(let y=f;y<h;y+=6){let m=~~((n[y+2*d]-_)/g);if(m>=zn)m=zn-1;Fc[m]++,Iy(y,n,Bn,m*6)}let x=(zn-1)*6;for(let y=0;y<6;y++)Rs[x+y]=Bn[x+y];for(let y=zn-2;y>=0;y--){let b=y*6,E=b+6;for(let m=0;m<3;m++)Rs[b+m]=Math.min(Bn[b+m],Rs[E+m]),Rs[b+m+3]=Math.max(Bn[b+m+3],Rs[E+m+3])}let M=0;for(let y=0;y<zn-1;y++){let b=y*6,E=Fc[y];if(E!==0)for(let R=0;R<3;R++)if(M===0)wn[R]=Bn[b+R],wn[R+3]=Bn[b+R+3];else wn[R]=Math.min(wn[R],Bn[b+R]),wn[R+3]=Math.max(wn[R+3],Bn[b+R+3]);M+=E;let m=0,v=0;if(M!==0)m=Wo(wn)/l;let w=s-M;if(w!==0)v=Wd(Rs,b+6)/l;let P=Mc+Oo*(m*M+v*w);if(P<c)o=d,c=P,a=_+g+y*g}}}}else console.warn(`BVH: Invalid build strategy value ${r} used.`);return{axis:o,pos:a}}function Py(t,e,n,i){let s=0,r=t.offset;for(let o=e,a=e+n;o<a;o++)s+=t[(o-r)*6+i*2];return s/n}function qd(t,e,n,i,s,r){let o=i,a=i+s-1,l=r.pos,c=r.axis*2,u=n.offset||0;while(!0){while(o<=a&&n[(o-u)*6+c]<l)o++;while(o<=a&&n[(a-u)*6+c]>=l)a--;if(o<a){for(let f=0;f<e;f++){let h=t[o*e+f];t[o*e+f]=t[a*e+f],t[a*e+f]=h}for(let f=0;f<6;f++){let h=o-u,d=a-u,_=n[h*6+f];n[h*6+f]=n[d*6+f],n[d*6+f]=_}o++,a--}else return o}}var Ly=Math.pow(2,32),Cs=new Float32Array(6),jo=new Float32Array(6);function Ny(t,e,n,i,s,r){let{maxDepth:o,verbose:a,targetLeafSize:l,_strictLeafSize:c=1/0,strategy:u,onProgress:f,useSharedArrayBuffer:h=!1}=s,d=t.primitiveBuffer,_=t.primitiveBufferStride,p=new(h?SharedArrayBuffer:ArrayBuffer)(Fe*Math.max(1,2*Math.ceil(i)-1)),g=new Float32Array(p),x=new Uint32Array(p),M=new Uint16Array(p),y=0,b=!1;return Ko(e,n,i,Cs,jo),v(n,i,0),p.slice(0,y*Fe);function E(w){if(f)f((w-r.offset)/r.count)}function m(w,P,R){let L=w*2;x[w+6]=P,M[L+14]=R,M[L+15]=Bo,E(P+R)}function v(w,P,R){let L=y++,F=L*ae;if(g.set(Cs,F),!b&&R>=o){if(b=!0,a)console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`)}let C=P>c;if(P<=l&&!C||R>=o){m(F,w,P);return}let B=Xd(Cs,jo,e,w,P,u),W=B.axis===-1?-1:qd(d,_,e,w,P,B);if(B.axis===-1||W===w||W===w+P){if(!C){m(F,w,P);return}B.axis=Math.max(0,yr(Cs)),W=w+Math.max(1,Math.floor(P/2))}x[F+7]=B.axis;let z=W-w;Ko(e,w,z,Cs,jo),v(w,z,R+1);let st=y-L;if(st>Ly)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");x[F+6]=st;let q=P-z;Ko(e,W,q,Cs,jo),v(W,q,R+1)}}function Yd(t,e){let n=t.getRootRanges(e.range),i=n[0],s=n[n.length-1],r={offset:i.offset,count:s.offset+s.count-i.offset},o=new Float32Array(6*r.count);o.offset=r.offset,t.computePrimitiveBounds(r.offset,r.count,o),t._roots=n.map((a)=>Ny(t,o,a.offset,a.count,e,r))}var Si,Ps,Is=[],ta=new Vi(()=>new te);function Zd(t,e,n,i,s,r){Si=ta.getPrimitive(),Ps=ta.getPrimitive(),Is.push(Si,Ps),Wt.setBuffer(t._roots[e]);let o=Bc(0,t.geometry,n,i,s,r);Wt.clearBuffer(),ta.releasePrimitive(Si),ta.releasePrimitive(Ps),Is.pop(),Is.pop();let a=Is.length;if(a>0)Ps=Is[a-1],Si=Is[a-2];return o}function Bc(t,e,n,i,s=null,r=0,o=0){let{float32Array:a,uint16Array:l,uint32Array:c}=Wt,u=t*2;if(Zt(u,l)){let h=ee(t,c),d=le(u,l);return fe(me(t),a,Si),i(h,d,!1,o,r+t/ae,Si)}else{let P=function(L){let{uint16Array:F,uint32Array:C}=Wt,B=L*2;while(!Zt(B,F))L=Qt(L),B=L*2;return ee(L,C)},R=function(L){let{uint16Array:F,uint32Array:C}=Wt,B=L*2;while(!Zt(B,F))L=jt(L,C),B=L*2;return ee(L,C)+le(B,F)},h=Qt(t),d=jt(t,c),_=h,S=d,p,g,x,M;if(s){if(x=Si,M=Ps,fe(me(_),a,x),fe(me(S),a,M),p=s(x),g=s(M),g<p){_=d,S=h;let L=p;p=g,g=L,x=M}}if(!x)x=Si,fe(me(_),a,x);let y=Zt(_*2,l),b=n(x,y,p,o+1,r+_/ae),E;if(b===Sc){let L=P(_),C=R(_)-L;E=i(L,C,!0,o+1,r+_/ae,x)}else E=b&&Bc(_,e,n,i,s,r,o+1);if(E)return!0;M=Ps,fe(me(S),a,M);let m=Zt(S*2,l),v=n(M,m,g,o+1,r+S/ae),w;if(v===Sc){let L=P(S),C=R(S)-L;w=i(L,C,!0,o+1,r+S/ae,M)}else w=v&&Bc(S,e,n,i,s,r,o+1);if(w)return!0;return!1}}var Tr=new Wt.constructor,ea=new Wt.constructor,Mi=new Vi(()=>new te),Ls=new te,Ns=new te,zc=new te,Gc=new te,kc=!1;function Jd(t,e,n,i){if(kc)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");kc=!0;let s=t._roots,r=e._roots,o,a=0,l=0,c=new wt().copy(n).invert();for(let u=0,f=s.length;u<f;u++){Tr.setBuffer(s[u]),l=0;let h=Mi.getPrimitive();fe(me(0),Tr.float32Array,h),h.applyMatrix4(c);for(let d=0,_=r.length;d<_;d++)if(ea.setBuffer(r[d]),o=Rn(0,0,n,c,i,a,l,0,0,h),ea.clearBuffer(),l+=r[d].byteLength/Fe,o)break;if(Mi.releasePrimitive(h),Tr.clearBuffer(),a+=s[u].byteLength/Fe,o)break}return kc=!1,o}function Rn(t,e,n,i,s,r=0,o=0,a=0,l=0,c=null,u=!1){let f,h;if(u)f=ea,h=Tr;else f=Tr,h=ea;let{float32Array:d,uint32Array:_,uint16Array:S}=f,p=h.float32Array,g=h.uint32Array,x=h.uint16Array,M=t*2,y=e*2,b=Zt(M,S),E=Zt(y,x),m=!1;if(E&&b)if(u)m=s(ee(e,g),le(e*2,x),ee(t,_),le(t*2,S),l,o+e/ae,a,r+t/ae);else m=s(ee(t,_),le(t*2,S),ee(e,g),le(e*2,x),a,r+t/ae,l,o+e/ae);else if(E){let v=Mi.getPrimitive();fe(me(e),p,v),v.applyMatrix4(n);let w=Qt(t),P=jt(t,_);fe(me(w),d,Ls),fe(me(P),d,Ns);let R=v.intersectsBox(Ls),L=v.intersectsBox(Ns);m=R&&Rn(e,w,i,n,s,o,r,l,a+1,v,!u)||L&&Rn(e,P,i,n,s,o,r,l,a+1,v,!u),Mi.releasePrimitive(v)}else{let v=Qt(e),w=jt(e,g);fe(me(v),p,zc),fe(me(w),p,Gc);let P=c.intersectsBox(zc),R=c.intersectsBox(Gc);if(P&&R)m=Rn(t,v,n,i,s,r,o,a,l+1,c,u)||Rn(t,w,n,i,s,r,o,a,l+1,c,u);else if(P)if(b)m=Rn(t,v,n,i,s,r,o,a,l+1,c,u);else{let L=Mi.getPrimitive();L.copy(zc).applyMatrix4(n);let F=Qt(t),C=jt(t,_);fe(me(F),d,Ls),fe(me(C),d,Ns);let B=L.intersectsBox(Ls),W=L.intersectsBox(Ns);m=B&&Rn(v,F,i,n,s,o,r,l,a+1,L,!u)||W&&Rn(v,C,i,n,s,o,r,l,a+1,L,!u),Mi.releasePrimitive(L)}else if(R)if(b)m=Rn(t,w,n,i,s,r,o,a,l+1,c,u);else{let L=Mi.getPrimitive();L.copy(Gc).applyMatrix4(n);let F=Qt(t),C=jt(t,_);fe(me(F),d,Ls),fe(me(C),d,Ns);let B=L.intersectsBox(Ls),W=L.intersectsBox(Ns);m=B&&Rn(w,F,i,n,s,o,r,l,a+1,L,!u)||W&&Rn(w,C,i,n,s,o,r,l,a+1,L,!u),Mi.releasePrimitive(L)}}return m}var na=new class{constructor(){let t=null,e=null,n=null,i=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(r,o)=>{if(i)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=t=r._roots[o],this.uint16Array=n=new Uint16Array(t),this.uint32Array=e=new Uint32Array(t)},this.reset=()=>{this.root=null,this.buffer=t=null,this.uint16Array=n=null,this.uint32Array=e=null},this.getRangeStart=(r)=>{let o=r*2;while(!Zt(o,n))r=Qt(r),o=r*2;return ee(r,e)},this.getRangeEnd=(r)=>{let o=r*2;while(!Zt(o,n))r=jt(r,e),o=r*2;return ee(r,e)+le(o,n)};let s=(r,o,a)=>{let l=o*2,c=Zt(l,n);if(!r(a,c,o)&&!c){let f=Qt(o),h=jt(o,e);s(r,f,a+1),s(r,h,a+1)}};this.traverseBuffer=(r)=>{if(i)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");i=!0;try{s(r,0,0)}finally{i=!1}},this.traverse=(r)=>{this.traverseBuffer((o,a,l)=>{if(a){let c=l*2,u=e[l+6],f=n[c+14];return r(o,a,new Float32Array(t,l*4,6),u,f)}else{let c=Ms(l,e);return r(o,a,new Float32Array(t,l*4,6),c)}})}}};var $d=new te,Ds=new Float32Array(6);class Hc{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){if(t={...zo,...t},"maxLeafSize"in t)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize};Yd(this,t)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,n,i){let s=1/0,r=1/0,o=1/0,a=-1/0,l=-1/0,c=-1/0;for(let u=t,f=t+e;u<f;u++){this.writePrimitiveBounds(u,Ds,0);let[h,d,_,S,p,g]=Ds;if(h<s)s=h;if(S>a)a=S;if(d<r)r=d;if(p>l)l=p;if(_<o)o=_;if(g>c)c=g}return n[i+0]=s,n[i+1]=r,n[i+2]=o,n[i+3]=a,n[i+4]=l,n[i+5]=c,n}computePrimitiveBounds(t,e,n){let i=n.offset||0;for(let s=t,r=t+e;s<r;s++){this.writePrimitiveBounds(s,Ds,0);let[o,a,l,c,u,f]=Ds,h=(o+c)/2,d=(a+u)/2,_=(l+f)/2,S=(c-o)/2,p=(u-a)/2,g=(f-l)/2,x=(s-i)*6;n[x+0]=h,n[x+1]=S+(Math.abs(h)+S)*Ss,n[x+2]=d,n[x+3]=p+(Math.abs(d)+p)*Ss,n[x+4]=_,n[x+5]=g+(Math.abs(_)+g)*Ss}return n}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let n=0,i=e.length;n<i;n++)e[n]+=t;else{let n=this._roots;for(let i=0;i<n.length;i++){let s=n[i],r=new Uint32Array(s),o=new Uint16Array(s),a=s.byteLength/Fe;for(let l=0;l<a;l++){let c=ae*l,u=2*c;if(Zt(u,o))r[c+6]+=t}}}}traverse(t,e=0){na.setBVH(this,e),na.traverse(t),na.reset()}refit(){let t=this._roots;for(let e=0,n=t.length;e<n;e++){let i=t[e],s=new Uint32Array(i),r=new Uint16Array(i),o=new Float32Array(i),a=i.byteLength/Fe;for(let l=a-1;l>=0;l--){let c=l*ae,u=c*2;if(Zt(u,r)){let h=ee(c,s),d=le(u,r);this.writePrimitiveRangeBounds(h,d,Ds,0),o.set(Ds,c)}else{let h=Qt(c),d=jt(c,s);for(let _=0;_<3;_++){let S=o[h+_],p=o[h+_+3],g=o[d+_],x=o[d+_+3];o[c+_]=S<g?S:g,o[c+_+3]=p>x?p:x}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach((n)=>{fe(0,new Float32Array(n),$d),t.union($d)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:n,intersectsRange:i,intersectsPrimitive:s,scratchPrimitive:r,iterate:o}=t;if(i&&s){let u=i;i=(f,h,d,_,S)=>{if(!u(f,h,d,_,S))return o(f,h,this,s,d,_,r);return!0}}else if(!i)if(s)i=(u,f,h,d)=>o(u,f,this,s,h,d,r);else i=(u,f,h)=>h;let a=!1,l=0,c=this._roots;for(let u=0,f=c.length;u<f;u++){let h=c[u];if(a=Zd(this,u,n,i,e,l),a)break;l+=h.byteLength/Fe}return a}bvhcast(t,e,n){let{intersectsRanges:i}=n;return Jd(this,t,e,i)}}function Dy(t,e){let n=t[t.length-1],i=n.offset+n.count>65536,s=t.reduce((c,u)=>c+u.count,0),r=i?4:2,o=e?new SharedArrayBuffer(s*r):new ArrayBuffer(s*r),a=i?new Uint32Array(o):new Uint16Array(o),l=0;for(let c=0;c<t.length;c++){let{offset:u,count:f}=t[c];for(let h=0;h<f;h++)a[l+h]=u+h;l+=f}return a}class Vc extends Hc{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(!t.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(t.index&&t.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(e.useSharedArrayBuffer&&!Hd())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=t,this.resolvePrimitiveIndex=e.indirect?(n)=>this._indirectBuffer[n]:(n)=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...zo,...e},!e[mr])this.init(e)}init(t){let{geometry:e,primitiveStride:n}=this;if(t.indirect){let i=Rc(e,t.range,n),s=Dy(i,t.useSharedArrayBuffer);this._indirectBuffer=s}else Ld(e,t);if(super.init(t),!e.boundingBox&&t.setBoundingBox)e.boundingBox=this.getBoundingBox(new te)}getRootRanges(t){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return Rc(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}var ia=new ye,sa=new jn,Kd=new N,Qd=new wt,jd=new N,Wc=["getX","getY","getZ"];class Yi extends Vc{static serialize(t,e={}){e={cloneBuffers:!0,...e};let{geometry:n,_roots:i,_indirectBuffer:s}=t,r=n.getIndex(),o={version:1,roots:null,index:null,indirectBuffer:null};if(e.cloneBuffers)o.roots=i.map((a)=>a.slice()),o.index=r?r.array.slice():null,o.indirectBuffer=s?s.slice():null;else o.roots=i,o.index=r?r.array:null,o.indirectBuffer=s;return o}static deserialize(t,e,n={}){n={setIndex:!0,indirect:Boolean(t.indirectBuffer),...n};let{index:i,roots:s,indirectBuffer:r}=t;if(!t.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),a(s);let o=new Yi(e,{...n,[mr]:!0});if(o._roots=s,o._indirectBuffer=r||null,n.setIndex){let l=e.getIndex();if(l===null){let c=new Ae(t.index,1,!1);e.setIndex(c)}else if(l.array!==i)l.array.set(i),l.needsUpdate=!0}return o;function a(l){for(let c=0;c<l.length;c++){let u=l[c],f=new Uint32Array(u),h=new Uint16Array(u);for(let d=0,_=u.byteLength/Fe;d<_;d++){let S=ae*d,p=2*S;if(!Zt(p,h))f[S+6]=f[S+6]/ae-d}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){if(e.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris};super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,n){let i=this.geometry,s=this._indirectBuffer,r=i.attributes.position,o=i.index?i.index.array:null,l=(s?s[t]:t)*3,c=l+0,u=l+1,f=l+2;if(o)c=o[c],u=o[u],f=o[f];for(let h=0;h<3;h++){let d=r[Wc[h]](c),_=r[Wc[h]](u),S=r[Wc[h]](f),p=d;if(_<p)p=_;if(S<p)p=S;let g=d;if(_>g)g=_;if(S>g)g=S;e[n+h]=p,e[n+h+3]=g}return e}computePrimitiveBounds(t,e,n){let i=this.geometry,s=this._indirectBuffer,r=i.attributes.position,o=i.index?i.index.array:null,a=r.normalized;if(t<0||e+t-n.offset>n.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let l=r.array,c=r.offset||0,u=3;if(r.isInterleavedBufferAttribute)u=r.data.stride;let f=["getX","getY","getZ"],h=n.offset;for(let d=t,_=t+e;d<_;d++){let p=(s?s[d]:d)*3,g=(d-h)*6,x=p+0,M=p+1,y=p+2;if(o)x=o[x],M=o[M],y=o[y];if(!a)x=x*u+c,M=M*u+c,y=y*u+c;for(let b=0;b<3;b++){let E,m,v;if(a)E=r[f[b]](x),m=r[f[b]](M),v=r[f[b]](y);else E=l[x+b],m=l[M+b],v=l[y+b];let w=E;if(m<w)w=m;if(v<w)w=v;let P=E;if(m>P)P=m;if(v>P)P=v;let R=(P-w)/2,L=b*2;n[g+L+0]=w+R,n[g+L+1]=R+(Math.abs(w)+R)*Ss}}return n}raycastObject3D(t,e,n=[]){let{material:i}=t;if(i===void 0)return;Qd.copy(t.matrixWorld).invert(),sa.copy(e.ray).applyMatrix4(Qd),jd.setFromMatrixScale(t.matrixWorld),Kd.copy(sa.direction).multiply(jd);let s=Kd.length(),r=e.near/s,o=e.far/s;if(e.firstHitOnly===!0){let a=this.raycastFirst(sa,i,r,o);if(a=Uc(a,t,e),a)n.push(a)}else{let a=this.raycast(sa,i,r,o);for(let l=0,c=a.length;l<c;l++){let u=Uc(a[l],t,e);if(u)n.push(u)}}return n}refit(t=null){return(this.indirect?Fd:Ad)(this,t)}raycast(t,e=Jn,n=0,i=1/0){let s=this._roots,r=[],o=this.indirect?Od:Id;for(let a=0,l=s.length;a<l;a++)o(this,a,e,t,r,n,i);return r}raycastFirst(t,e=Jn,n=0,i=1/0){let s=this._roots,r=null,o=this.indirect?Bd:Pd;for(let a=0,l=s.length;a<l;a++){let c=o(this,a,e,t,n,i);if(c!=null&&(r==null||c.distance<r.distance))r=c}return r}intersectsGeometry(t,e){let n=!1,i=this._roots,s=this.indirect?Gd:Dd;for(let r=0,o=i.length;r<o;r++)if(n=s(this,r,t,e),n)break;return n}shapecast(t){let e=je.getPrimitive(),n=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?Cd:Td});return je.releasePrimitive(e),n}bvhcast(t,e,n){let{intersectsRanges:i,intersectsTriangles:s}=n,r=je.getPrimitive(),o=this.geometry.index,a=this.geometry.attributes.position,l=this.indirect?(d)=>{let _=this.resolveTriangleIndex(d);ue(r,_*3,o,a)}:(d)=>{ue(r,d*3,o,a)},c=je.getPrimitive(),u=t.geometry.index,f=t.geometry.attributes.position,h=t.indirect?(d)=>{let _=t.resolveTriangleIndex(d);ue(c,_*3,u,f)}:(d)=>{ue(c,d*3,u,f)};if(s){if(!(t instanceof Yi))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let d=(_,S,p,g,x,M,y,b)=>{for(let E=p,m=p+g;E<m;E++){h(E),c.a.applyMatrix4(e),c.b.applyMatrix4(e),c.c.applyMatrix4(e),c.needsUpdate=!0;for(let v=_,w=_+S;v<w;v++)if(l(v),r.needsUpdate=!0,s(r,c,v,E,x,M,y,b))return!0}return!1};if(i){let _=i;i=function(S,p,g,x,M,y,b,E){if(!_(S,p,g,x,M,y,b,E))return d(S,p,g,x,M,y,b,E);return!0}}else i=d}return super.bvhcast(t,e,{intersectsRanges:i})}intersectsBox(t,e){return ia.set(t.min,t.max,e),ia.needsUpdate=!0,this.shapecast({intersectsBounds:(n)=>ia.intersectsBox(n),intersectsTriangle:(n)=>ia.intersectsTriangle(n)})}intersectsSphere(t){return this.shapecast({intersectsBounds:(e)=>t.intersectsBox(e),intersectsTriangle:(e)=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,n={},i={},s=0,r=1/0){return(this.indirect?kd:Ud)(this,t,e,n,i,s,r)}closestPointToPoint(t,e={},n=0,i=1/0){return gd(this,t,e,n,i)}}var VA=parseInt(Ni)>=166,Us={Mesh:Ue.prototype.raycast,Line:zi.prototype.raycast,LineSegments:xs.prototype.raycast,LineLoop:sr.prototype.raycast,Points:rr.prototype.raycast,BatchedMesh:So.prototype.raycast},ze=new Ue,ra=[];function tp(t,e){if(this.isBatchedMesh)Uy.call(this,t,e);else{let{geometry:n}=this;if(n.boundsTree)n.boundsTree.raycastObject3D(this,t,e);else{let i;if(this instanceof Ue)i=Us.Mesh;else if(this instanceof xs)i=Us.LineSegments;else if(this instanceof sr)i=Us.LineLoop;else if(this instanceof zi)i=Us.Line;else if(this instanceof rr)i=Us.Points;else throw Error("BVH: Fallback raycast function not found.");i.call(this,t,e)}}}function Uy(t,e){if(this.boundsTrees){let n=this.boundsTrees,i=this._drawInfo||this._instanceInfo,s=this._drawRanges||this._geometryInfo,r=this.matrixWorld;ze.material=this.material,ze.geometry=this.geometry;let o=ze.geometry.boundsTree,a=ze.geometry.drawRange;if(ze.geometry.boundingSphere===null)ze.geometry.boundingSphere=new Re;for(let l=0,c=i.length;l<c;l++){if(!this.getVisibleAt(l))continue;let u=i[l].geometryIndex;if(ze.geometry.boundsTree=n[u],this.getMatrixAt(l,ze.matrixWorld).premultiply(r),!ze.geometry.boundsTree){this.getBoundingBoxAt(u,ze.geometry.boundingBox),this.getBoundingSphereAt(u,ze.geometry.boundingSphere);let f=s[u];ze.geometry.setDrawRange(f.start,f.count)}ze.raycast(t,ra);for(let f=0,h=ra.length;f<h;f++){let d=ra[f];d.object=this,d.batchId=l,e.push(d)}ra.length=0}ze.geometry.boundsTree=o,ze.geometry.drawRange=a,ze.material=null,ze.geometry=null}else Us.BatchedMesh.call(this,t,e)}var Ar=11;function Fy(t){let{roots:e,indirectBuffer:n}=Yi.serialize(t,{cloneBuffers:!1});return e.reduce((i,s)=>i+s.byteLength,n?.byteLength??0)}function qA(t,e){let n=performance.now(),i=e?Yi.deserialize(e,t.geometry,{setIndex:!1}):new Yi(t.geometry,{indirect:!0}),s=Fy(i);return t.geometry.boundsTree=i,t.raycast=tp,performance.measure("map2lap.bvh",{start:n,detail:s}),s}var Oy=(t)=>t.vertices*Ar*4+4+t.indices*2;function YA(t,e){let{vertices:n,indices:i}=t;if(!Number.isInteger(n)||n<0||n>65535||!Number.isInteger(i)||i<0||i%3||e.byteLength!==Oy(t))throw Error("Invalid track geometry");let s=n*Ar*4;if(new DataView(e).getUint32(s,!0)!==i||new Uint16Array(e,s+4,i).some((r)=>r>=n))throw Error("Invalid track triangle indices")}function ZA(t,e,n){return`/api/editor/${encodeURIComponent(t)}/mesh/${n.i}?r=${e.revision}`+(n.model?`&d=${e.draft??0}`:n.copy?`&c=${e.copy_revision??""}`:"")}function By(t,e,n){return Math.hypot(...t.map((i,s)=>Math.max(Math.abs(e[s]-i),Math.abs(n[s]-i))))}function zy(t,e){t.computeBoundingBox();let n=t.boundingBox;t.boundingSphere=new Re(new N(...e.center),Math.max(e.radius,By(e.center,n.min.toArray(),n.max.toArray())))}function JA(t,e){let n=new Be,i=new vo(new Float32Array(e,0,t.vertices*Ar),Ar);n.setAttribute("position",new Bi(i,3,0)),n.setAttribute("normal",new Bi(i,3,3)),n.setAttribute("uv",new Bi(i,2,6));let s=t.vertices*Ar*4+4;return n.setIndex(new Ae(new Uint16Array(e,s,t.indices),1)),zy(n,t),n}
export{op as I,ap as J,Jn as K,Ye as L,pn as M,za as N,Jh as O,ms as P,eu as Q,qa as R,Au as S,ao as T,Eu as U,ui as V,wu as W,Qs as X,mn as Y,lo as Z,fi as _,Nn as $,Kn as aa,Du as ba,co as ca,uo as da,fo as ea,ol as fa,El as ga,wl as ha,Rl as ia,lp as ja,cp as ka,hp as la,up as ma,fp as na,Oi as oa,Fu as pa,Nl as qa,dp as ra,Pp as sa,Lt as ta,Qn as ua,N as va,Vt as wa,we as xa,oe as ya,gn as za,wt as Aa,_e as Ba,hs as Ca,Dt as Da,Yl as Ea,Yu as Fa,te as Ga,Ae as Ha,Ee as Ia,Re as Ja,Be as Ka,vo as La,Bi as Ma,rn as Na,En as Oa,jn as Pa,Zl as Qa,Ue as Ra,Zu as Sa,Jl as Ta,ci as Ua,$l as Va,no as Wa,Ju as Xa,hi as Ya,Mo as Za,zi as _a,xs as $a,sr as ab,Kl as bb,rr as cb,Ql as db,Ku as eb,ys as fb,jl as gb,tc as hb,ti as ib,ic as jb,ju as kb,tf as lb,ef as mb,ki as nb,ar as ob,lr as pb,Ro as qb,sf as rb,xi as sb,fc as tb,af as ub,lf as vb,Hi as wb,cf as xb,cr as yb,on as zb,uf as Ab,df as Bb,Io as Cb,mf as Db,gf as Eb,_f as Fb,xf as Gb,ie as Hb,vf as Ib,Sf as Jb,bf as Kb,Tf as Lb,Ht as Mb,No as Nb,uy as Ob,Yi as Pb,Ar as Qb,qA as Rb,Oy as Sb,YA as Tb,ZA as Ub,zy as Vb,JA as Wb};
