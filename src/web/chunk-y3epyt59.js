import{i,s,n,r,t,e,a}from"./chunk-pagfykh0.js";var Ta={scene:"scene_u4kRgA",view:"view_u4kRgA"};var Sh={box:"box_myLiyw"};var Mn=(o,l=2)=>o.toFixed(l);function Xe({label:o,children:l}){return e(r,{children:[t("dt",{children:o}),t("dd",{children:l})]})}function Mh({hovered:o}){if(!o)return null;let l=o.billboard;return e("div",{id:"hover-box",className:Sh.box,children:[e("h4",{children:[o.kind,o.sprite&&` · ${o.sprite}`]}),e("dl",{children:[l&&e(Xe,{label:"ID",children:[o.object,"#",l.number]}),l?.height!=null&&e(Xe,{label:"Height",children:[Mn(l.height,1)," m"]}),l?.width!=null&&e(Xe,{label:"Width",children:[Mn(l.width,1)," m"]}),l?.foot&&e(Xe,{label:"Stands at",children:[Mn(l.foot[0],1),", ",Mn(l.foot[1],1)]}),t(Xe,{label:"Mesh",children:o.object}),t(Xe,{label:"Physics",children:o.physics}),t(Xe,{label:"Material",children:o.material}),t(Xe,{label:"Shader",children:o.shader}),e(Xe,{label:"Texture",children:[o.texture??"none",o.textureBytes!==null&&` (${Math.ceil(o.textureBytes/1024)} KB)`]}),e(Xe,{label:"Size",children:[o.vertices," vertices, ",o.triangles," triangles"]}),t(Xe,{label:"Triangle",children:o.triangle}),o.uv&&e(Xe,{label:"UV",children:[Mn(o.uv[0],3),", ",Mn(o.uv[1],3)]}),e(Xe,{label:"Shown up to",children:[Math.round(o.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(Xe,{label:"AC x, y, z",children:[Mn(o.at[0]),", ",Mn(o.at[1]),", ",Mn(o.at[2])]}),e(Xe,{label:"Tile",children:[o.tile[0],", ",o.tile[1]]}),o.route&&e(Xe,{label:"Route",children:[Math.round(o.route.metre)," m, ",Mn(o.route.off,1)," m off"]}),o.latLon&&e(Xe,{label:"Lat, lon",children:[Mn(o.latLon[0],6),", ",Mn(o.latLon[1],6)]}),e(Xe,{label:"Camera",children:[Mn(o.distance,1)," m away"]})]}),!l&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var zi="187",vi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Si={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ou=0,Qa=1,au=2;var nr=1,lu=2,Ss=3,li=0,on=1,Rn=2,ki=0,ir=1,tl=2,el=3,nl=4,cu=5;var Ms=100,hu=101,uu=102,du=103,fu=104,pu=200,mu=201,gu=202,_u=203,xu=204,yu=205,vu=206,Su=207,Mu=208,bu=209,Tu=210,Eu=211,Au=212,wu=213,Ru=214,Cu=0,Pu=1,Iu=2,il=3,Du=4,Lu=5,Nu=6,Uu=7,Fu=0,Ou=1,Bu=2,Wn=0,sl=1,rl=2,ol=3,al=4,ll=5,cl=6,hl=7;var sr=301,bs=302,mo=303,go=304,_o=1000,xo=1001,zu=1002,Mi=1003,ku=1004;var rr=1005;var yn=1006,yo=1007;var Bn=1008;var zn=1009,Hu=1010,Gu=1011,or=1012,ul=1013,bi=1014,ci=1015,Xn=1016,dl=1017,fl=1018,Hi=1020,Vu=35902,Wu=35899,Xu=1021,qu=1022,Cn=1023,Ts=1026,Ti=1027,Yu=1028,pl=1029,Gi=1030,ml=1031;var gl=1033,Es=33776,vo=33777,As=33778,ws=33779,_l=35840,xl=35841,yl=35842,vl=35843,ar=36196,Sl=37492,Ml=37496,bl=37488,Tl=37489,So=37490,El=37491,Al=37808,wl=37809,Rl=37810,Cl=37811,Pl=37812,Il=37813,Dl=37814,Ll=37815,Nl=37816,Ul=37817,Fl=37818,Ol=37819,Bl=37820,zl=37821,kl=36492,lr=36494,cr=36495,Hl=36283,Gl=36284,Mo=36285,Vl=36286;var Wl=0,Zu=1,Vi="",bo="srgb",Xl="srgb-linear",ql="linear",be="srgb";var Ju=512,Ku=513,$u=514,Yl=515,ju=516,Qu=517,Zl=518,Jl=519;var Kl="300 es",$l=2000;function mp(o){for(let l=o.length-1;l>=0;--l)if(o[l]>=65535)return!0;return!1}function gp(o){return ArrayBuffer.isView(o)&&!(o instanceof DataView)}function tr(o){return document.createElementNS("http://www.w3.org/1999/xhtml",o)}function td(){let o=tr("canvas");return o.style.display="block",o}var bh={},ys=null;function er(...o){let l="THREE."+o.shift();if(ys)ys("log",l,...o);else console.log(l,...o)}function ed(o){let l=o[0];if(typeof l==="string"&&l.startsWith("TSL:")){let c=o[1];if(c&&c.isStackTrace)o[0]+=" "+c.getLocation();else o[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return o}function Bt(...o){o=ed(o);let l="THREE."+o.shift();if(ys)ys("warn",l,...o);else{let c=o[0];if(c&&c.isStackTrace)console.warn(c.getError(l));else console.warn(l,...o)}}function Ht(...o){o=ed(o);let l="THREE."+o.shift();if(ys)ys("error",l,...o);else{let c=o[0];if(c&&c.isStackTrace)console.error(c.getError(l));else console.error(l,...o)}}function $s(...o){let l=o.join(" ");if(l in bh)return;bh[l]=!0,Bt(...o)}function nd(o,l,c){return new Promise(function(h,u){function d(){switch(o.clientWaitSync(l,o.SYNC_FLUSH_COMMANDS_BIT,0)){case o.WAIT_FAILED:u();break;case o.TIMEOUT_EXPIRED:setTimeout(d,c);break;default:h()}}setTimeout(d,c)})}var id={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class qn{addEventListener(o,l){if(this._listeners===void 0)this._listeners={};let c=this._listeners;if(c[o]===void 0)c[o]=[];if(c[o].indexOf(l)===-1)c[o].push(l)}hasEventListener(o,l){let c=this._listeners;if(c===void 0)return!1;return c[o]!==void 0&&c[o].indexOf(l)!==-1}removeEventListener(o,l){let c=this._listeners;if(c===void 0)return;let h=c[o];if(h!==void 0){let u=h.indexOf(l);if(u!==-1)h.splice(u,1)}}dispatchEvent(o){let l=this._listeners;if(l===void 0)return;let c=l[o.type];if(c!==void 0){o.target=this;let h=c.slice(0);for(let u=0,d=h.length;u<d;u++)h[u].call(this,o);o.target=null}}}var en=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Th=1234567,js=Math.PI/180,vs=180/Math.PI;function Ei(){let o=Math.random()*4294967295|0,l=Math.random()*4294967295|0,c=Math.random()*4294967295|0,h=Math.random()*4294967295|0;return(en[o&255]+en[o>>8&255]+en[o>>16&255]+en[o>>24&255]+"-"+en[l&255]+en[l>>8&255]+"-"+en[l>>16&15|64]+en[l>>24&255]+"-"+en[c&63|128]+en[c>>8&255]+"-"+en[c>>16&255]+en[c>>24&255]+en[h&255]+en[h>>8&255]+en[h>>16&255]+en[h>>24&255]).toLowerCase()}function qt(o,l,c){return Math.max(l,Math.min(c,o))}function jl(o,l){return(o%l+l)%l}function _p(o,l,c,h,u){return h+(o-l)*(u-h)/(c-l)}function xp(o,l,c){if(o!==l)return(c-o)/(l-o);else return 0}function Qs(o,l,c){return(1-c)*o+c*l}function yp(o,l,c,h){return Qs(o,l,1-Math.exp(-c*h))}function vp(o,l=1){return l-Math.abs(jl(o,l*2)-l)}function Sp(o,l,c){if(o<=l)return 0;if(o>=c)return 1;return o=(o-l)/(c-l),o*o*(3-2*o)}function Mp(o,l,c){if(o<=l)return 0;if(o>=c)return 1;return o=(o-l)/(c-l),o*o*o*(o*(o*6-15)+10)}function bp(o,l){return o+Math.floor(Math.random()*(l-o+1))}function Tp(o,l){return o+Math.random()*(l-o)}function Ep(o){return o*(0.5-Math.random())}function Ap(o){if(o!==void 0)Th=o;let l=Th+=1831565813;return l=Math.imul(l^l>>>15,l|1),l^=l+Math.imul(l^l>>>7,l|61),((l^l>>>14)>>>0)/4294967296}function wp(o){return o*js}function Rp(o){return o*vs}function Cp(o){return o>0&&Number.isInteger(o)&&2**Math.round(Math.log2(o))===o}function Pp(o){return Math.pow(2,Math.ceil(Math.log(o)/Math.LN2))}function Ql(o){return Math.pow(2,Math.floor(Math.log(o)/Math.LN2))}function Ip(o,l,c,h,u){let{cos:d,sin:f}=Math,p=d(c/2),m=f(c/2),g=d((l+h)/2),x=f((l+h)/2),y=d((l-h)/2),_=f((l-h)/2),v=d((h-l)/2),T=f((h-l)/2);switch(u){case"XYX":o.set(p*x,m*y,m*_,p*g);break;case"YZY":o.set(m*_,p*x,m*y,p*g);break;case"ZXZ":o.set(m*y,m*_,p*x,p*g);break;case"XZX":o.set(p*x,m*T,m*v,p*g);break;case"YXY":o.set(m*v,p*x,m*T,p*g);break;case"ZYZ":o.set(m*T,m*v,p*x,p*g);break;default:Bt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+u)}}function To(o){switch(o.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function tc(o,l){if(l.constructor===Float32Array)return o;let c=To(l);if(c===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(o/c,-1)}function ec(o,l){if(l.constructor===Float32Array)return o;let c=To(l);if(c===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(o*c)}var nc={DEG2RAD:js,RAD2DEG:vs,generateUUID:Ei,clamp:qt,euclideanModulo:jl,mapLinear:_p,inverseLerp:xp,lerp:Qs,damp:yp,pingpong:vp,smoothstep:Sp,smootherstep:Mp,randInt:bp,randFloat:Tp,randFloatSpread:Ep,seededRandom:Ap,degToRad:wp,radToDeg:Rp,isPowerOfTwo:Cp,ceilPowerOfTwo:Pp,floorPowerOfTwo:Ql,setQuaternionFromProperEuler:Ip,normalize:ec,denormalize:tc};class Dt{static{this.prototype.isVector2=!0}constructor(o=0,l=0){this.x=o,this.y=l}get width(){return this.x}set width(o){this.x=o}get height(){return this.y}set height(o){this.y=o}set(o,l){return this.x=o,this.y=l,this}setScalar(o){return this.x=o,this.y=o,this}setX(o){return this.x=o,this}setY(o){return this.y=o,this}setComponent(o,l){switch(o){case 0:this.x=l;break;case 1:this.y=l;break;default:throw Error("THREE.Vector2: index is out of range: "+o)}return this}getComponent(o){switch(o){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+o)}}clone(){return new this.constructor(this.x,this.y)}copy(o){return this.x=o.x,this.y=o.y,this}add(o){return this.x+=o.x,this.y+=o.y,this}addScalar(o){return this.x+=o,this.y+=o,this}addVectors(o,l){return this.x=o.x+l.x,this.y=o.y+l.y,this}addScaledVector(o,l){return this.x+=o.x*l,this.y+=o.y*l,this}sub(o){return this.x-=o.x,this.y-=o.y,this}subScalar(o){return this.x-=o,this.y-=o,this}subVectors(o,l){return this.x=o.x-l.x,this.y=o.y-l.y,this}multiply(o){return this.x*=o.x,this.y*=o.y,this}multiplyScalar(o){return this.x*=o,this.y*=o,this}divide(o){return this.x/=o.x,this.y/=o.y,this}divideScalar(o){return this.multiplyScalar(1/o)}applyMatrix3(o){let l=this.x,c=this.y,h=o.elements;return this.x=h[0]*l+h[3]*c+h[6],this.y=h[1]*l+h[4]*c+h[7],this}min(o){return this.x=Math.min(this.x,o.x),this.y=Math.min(this.y,o.y),this}max(o){return this.x=Math.max(this.x,o.x),this.y=Math.max(this.y,o.y),this}clamp(o,l){return this.x=qt(this.x,o.x,l.x),this.y=qt(this.y,o.y,l.y),this}clampScalar(o,l){return this.x=qt(this.x,o,l),this.y=qt(this.y,o,l),this}clampLength(o,l){let c=this.length();return this.divideScalar(c||1).multiplyScalar(qt(c,o,l))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(o){return this.x*o.x+this.y*o.y}cross(o){return this.x*o.y-this.y*o.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(o){let l=Math.sqrt(this.lengthSq()*o.lengthSq());if(l===0)return Math.PI/2;let c=this.dot(o)/l;return Math.acos(qt(c,-1,1))}distanceTo(o){return Math.sqrt(this.distanceToSquared(o))}distanceToSquared(o){let l=this.x-o.x,c=this.y-o.y;return l*l+c*c}manhattanDistanceTo(o){return Math.abs(this.x-o.x)+Math.abs(this.y-o.y)}setLength(o){return this.normalize().multiplyScalar(o)}lerp(o,l){return this.x+=(o.x-this.x)*l,this.y+=(o.y-this.y)*l,this}lerpVectors(o,l,c){return this.x=o.x+(l.x-o.x)*c,this.y=o.y+(l.y-o.y)*c,this}equals(o){return o.x===this.x&&o.y===this.y}fromArray(o,l=0){return this.x=o[l],this.y=o[l+1],this}toArray(o=[],l=0){return o[l]=this.x,o[l+1]=this.y,o}fromBufferAttribute(o,l){return this.x=o.getX(l),this.y=o.getY(l),this}rotateAround(o,l){let c=Math.cos(l),h=Math.sin(l),u=this.x-o.x,d=this.y-o.y;return this.x=u*c-d*h+o.x,this.y=u*h+d*c+o.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Pn{constructor(o=0,l=0,c=0,h=1){this.isQuaternion=!0,this._x=o,this._y=l,this._z=c,this._w=h}static slerpFlat(o,l,c,h,u,d,f){let p=c[h+0],m=c[h+1],g=c[h+2],x=c[h+3],y=u[d+0],_=u[d+1],v=u[d+2],T=u[d+3];if(x!==T||p!==y||m!==_||g!==v){let w=p*y+m*_+g*v+x*T;if(w<0)y=-y,_=-_,v=-v,T=-T,w=-w;let S=1-f;if(w<0.9995){let M=Math.acos(w),E=Math.sin(M);S=Math.sin(S*M)/E,f=Math.sin(f*M)/E,p=p*S+y*f,m=m*S+_*f,g=g*S+v*f,x=x*S+T*f}else{p=p*S+y*f,m=m*S+_*f,g=g*S+v*f,x=x*S+T*f;let M=1/Math.sqrt(p*p+m*m+g*g+x*x);p*=M,m*=M,g*=M,x*=M}}o[l]=p,o[l+1]=m,o[l+2]=g,o[l+3]=x}static multiplyQuaternionsFlat(o,l,c,h,u,d){let f=c[h],p=c[h+1],m=c[h+2],g=c[h+3],x=u[d],y=u[d+1],_=u[d+2],v=u[d+3];return o[l]=f*v+g*x+p*_-m*y,o[l+1]=p*v+g*y+m*x-f*_,o[l+2]=m*v+g*_+f*y-p*x,o[l+3]=g*v-f*x-p*y-m*_,o}get x(){return this._x}set x(o){this._x=o,this._onChangeCallback()}get y(){return this._y}set y(o){this._y=o,this._onChangeCallback()}get z(){return this._z}set z(o){this._z=o,this._onChangeCallback()}get w(){return this._w}set w(o){this._w=o,this._onChangeCallback()}set(o,l,c,h){return this._x=o,this._y=l,this._z=c,this._w=h,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(o){return this._x=o.x,this._y=o.y,this._z=o.z,this._w=o.w,this._onChangeCallback(),this}setFromEuler(o,l=!0){let{_x:c,_y:h,_z:u,_order:d}=o,{cos:f,sin:p}=Math,m=f(c/2),g=f(h/2),x=f(u/2),y=p(c/2),_=p(h/2),v=p(u/2);switch(d){case"XYZ":this._x=y*g*x+m*_*v,this._y=m*_*x-y*g*v,this._z=m*g*v+y*_*x,this._w=m*g*x-y*_*v;break;case"YXZ":this._x=y*g*x+m*_*v,this._y=m*_*x-y*g*v,this._z=m*g*v-y*_*x,this._w=m*g*x+y*_*v;break;case"ZXY":this._x=y*g*x-m*_*v,this._y=m*_*x+y*g*v,this._z=m*g*v+y*_*x,this._w=m*g*x-y*_*v;break;case"ZYX":this._x=y*g*x-m*_*v,this._y=m*_*x+y*g*v,this._z=m*g*v-y*_*x,this._w=m*g*x+y*_*v;break;case"YZX":this._x=y*g*x+m*_*v,this._y=m*_*x+y*g*v,this._z=m*g*v-y*_*x,this._w=m*g*x-y*_*v;break;case"XZY":this._x=y*g*x-m*_*v,this._y=m*_*x-y*g*v,this._z=m*g*v+y*_*x,this._w=m*g*x+y*_*v;break;default:Bt("Quaternion: .setFromEuler() encountered an unknown order: "+d)}if(l===!0)this._onChangeCallback();return this}setFromAxisAngle(o,l){let c=l/2,h=Math.sin(c);return this._x=o.x*h,this._y=o.y*h,this._z=o.z*h,this._w=Math.cos(c),this._onChangeCallback(),this}setFromRotationMatrix(o){let l=o.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],p=l[9],m=l[2],g=l[6],x=l[10],y=c+f+x;if(y>0){let _=0.5/Math.sqrt(y+1);this._w=0.25/_,this._x=(g-p)*_,this._y=(u-m)*_,this._z=(d-h)*_}else if(c>f&&c>x){let _=2*Math.sqrt(1+c-f-x);this._w=(g-p)/_,this._x=0.25*_,this._y=(h+d)/_,this._z=(u+m)/_}else if(f>x){let _=2*Math.sqrt(1+f-c-x);this._w=(u-m)/_,this._x=(h+d)/_,this._y=0.25*_,this._z=(p+g)/_}else{let _=2*Math.sqrt(1+x-c-f);this._w=(d-h)/_,this._x=(u+m)/_,this._y=(p+g)/_,this._z=0.25*_}return this._onChangeCallback(),this}setFromUnitVectors(o,l){let c=o.dot(l)+1;if(c<0.00000001)if(c=0,Math.abs(o.x)>Math.abs(o.z))this._x=-o.y,this._y=o.x,this._z=0,this._w=c;else this._x=0,this._y=-o.z,this._z=o.y,this._w=c;else this._x=o.y*l.z-o.z*l.y,this._y=o.z*l.x-o.x*l.z,this._z=o.x*l.y-o.y*l.x,this._w=c;return this.normalize()}angleTo(o){return 2*Math.acos(Math.abs(qt(this.dot(o),-1,1)))}rotateTowards(o,l){let c=this.angleTo(o);if(c===0)return this;let h=Math.min(1,l/c);return this.slerp(o,h),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(o){return this._x*o._x+this._y*o._y+this._z*o._z+this._w*o._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let o=this.length();if(o===0)this._x=0,this._y=0,this._z=0,this._w=1;else o=1/o,this._x=this._x*o,this._y=this._y*o,this._z=this._z*o,this._w=this._w*o;return this._onChangeCallback(),this}multiply(o){return this.multiplyQuaternions(this,o)}premultiply(o){return this.multiplyQuaternions(o,this)}multiplyQuaternions(o,l){let{_x:c,_y:h,_z:u,_w:d}=o,{_x:f,_y:p,_z:m,_w:g}=l;return this._x=c*g+d*f+h*m-u*p,this._y=h*g+d*p+u*f-c*m,this._z=u*g+d*m+c*p-h*f,this._w=d*g-c*f-h*p-u*m,this._onChangeCallback(),this}slerp(o,l){let{_x:c,_y:h,_z:u,_w:d}=o,f=this.dot(o);if(f<0)c=-c,h=-h,u=-u,d=-d,f=-f;let p=1-l;if(f<0.9995){let m=Math.acos(f),g=Math.sin(m);p=Math.sin(p*m)/g,l=Math.sin(l*m)/g,this._x=this._x*p+c*l,this._y=this._y*p+h*l,this._z=this._z*p+u*l,this._w=this._w*p+d*l,this._onChangeCallback()}else this._x=this._x*p+c*l,this._y=this._y*p+h*l,this._z=this._z*p+u*l,this._w=this._w*p+d*l,this.normalize();return this}slerpQuaternions(o,l,c){return this.copy(o).slerp(l,c)}random(){let o=2*Math.PI*Math.random(),l=2*Math.PI*Math.random(),c=Math.random(),h=Math.sqrt(1-c),u=Math.sqrt(c);return this.set(h*Math.sin(o),h*Math.cos(o),u*Math.sin(l),u*Math.cos(l))}equals(o){return o._x===this._x&&o._y===this._y&&o._z===this._z&&o._w===this._w}fromArray(o,l=0){return this._x=o[l],this._y=o[l+1],this._z=o[l+2],this._w=o[l+3],this._onChangeCallback(),this}toArray(o=[],l=0){return o[l]=this._x,o[l+1]=this._y,o[l+2]=this._z,o[l+3]=this._w,o}fromBufferAttribute(o,l){return this._x=o.getX(l),this._y=o.getY(l),this._z=o.getZ(l),this._w=o.getW(l),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(o){return this._onChangeCallback=o,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class k{static{this.prototype.isVector3=!0}constructor(o=0,l=0,c=0){this.x=o,this.y=l,this.z=c}set(o,l,c){if(c===void 0)c=this.z;return this.x=o,this.y=l,this.z=c,this}setScalar(o){return this.x=o,this.y=o,this.z=o,this}setX(o){return this.x=o,this}setY(o){return this.y=o,this}setZ(o){return this.z=o,this}setComponent(o,l){switch(o){case 0:this.x=l;break;case 1:this.y=l;break;case 2:this.z=l;break;default:throw Error("THREE.Vector3: index is out of range: "+o)}return this}getComponent(o){switch(o){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+o)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(o){return this.x=o.x,this.y=o.y,this.z=o.z,this}add(o){return this.x+=o.x,this.y+=o.y,this.z+=o.z,this}addScalar(o){return this.x+=o,this.y+=o,this.z+=o,this}addVectors(o,l){return this.x=o.x+l.x,this.y=o.y+l.y,this.z=o.z+l.z,this}addScaledVector(o,l){return this.x+=o.x*l,this.y+=o.y*l,this.z+=o.z*l,this}sub(o){return this.x-=o.x,this.y-=o.y,this.z-=o.z,this}subScalar(o){return this.x-=o,this.y-=o,this.z-=o,this}subVectors(o,l){return this.x=o.x-l.x,this.y=o.y-l.y,this.z=o.z-l.z,this}multiply(o){return this.x*=o.x,this.y*=o.y,this.z*=o.z,this}multiplyScalar(o){return this.x*=o,this.y*=o,this.z*=o,this}multiplyVectors(o,l){return this.x=o.x*l.x,this.y=o.y*l.y,this.z=o.z*l.z,this}applyEuler(o){return this.applyQuaternion(Eh.setFromEuler(o))}applyAxisAngle(o,l){return this.applyQuaternion(Eh.setFromAxisAngle(o,l))}applyMatrix3(o){let l=this.x,c=this.y,h=this.z,u=o.elements;return this.x=u[0]*l+u[3]*c+u[6]*h,this.y=u[1]*l+u[4]*c+u[7]*h,this.z=u[2]*l+u[5]*c+u[8]*h,this}applyNormalMatrix(o){return this.applyMatrix3(o).normalize()}applyMatrix4(o){let l=this.x,c=this.y,h=this.z,u=o.elements,d=1/(u[3]*l+u[7]*c+u[11]*h+u[15]);return this.x=(u[0]*l+u[4]*c+u[8]*h+u[12])*d,this.y=(u[1]*l+u[5]*c+u[9]*h+u[13])*d,this.z=(u[2]*l+u[6]*c+u[10]*h+u[14])*d,this}applyQuaternion(o){let l=this.x,c=this.y,h=this.z,{x:u,y:d,z:f,w:p}=o,m=2*(d*h-f*c),g=2*(f*l-u*h),x=2*(u*c-d*l);return this.x=l+p*m+d*x-f*g,this.y=c+p*g+f*m-u*x,this.z=h+p*x+u*g-d*m,this}project(o){return this.applyMatrix4(o.matrixWorldInverse).applyMatrix4(o.projectionMatrix)}unproject(o){return this.applyMatrix4(o.projectionMatrixInverse).applyMatrix4(o.matrixWorld)}transformDirection(o){let l=this.x,c=this.y,h=this.z,u=o.elements;return this.x=u[0]*l+u[4]*c+u[8]*h,this.y=u[1]*l+u[5]*c+u[9]*h,this.z=u[2]*l+u[6]*c+u[10]*h,this.normalize()}divide(o){return this.x/=o.x,this.y/=o.y,this.z/=o.z,this}divideScalar(o){return this.multiplyScalar(1/o)}min(o){return this.x=Math.min(this.x,o.x),this.y=Math.min(this.y,o.y),this.z=Math.min(this.z,o.z),this}max(o){return this.x=Math.max(this.x,o.x),this.y=Math.max(this.y,o.y),this.z=Math.max(this.z,o.z),this}clamp(o,l){return this.x=qt(this.x,o.x,l.x),this.y=qt(this.y,o.y,l.y),this.z=qt(this.z,o.z,l.z),this}clampScalar(o,l){return this.x=qt(this.x,o,l),this.y=qt(this.y,o,l),this.z=qt(this.z,o,l),this}clampLength(o,l){let c=this.length();return this.divideScalar(c||1).multiplyScalar(qt(c,o,l))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(o){return this.x*o.x+this.y*o.y+this.z*o.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(o){return this.normalize().multiplyScalar(o)}lerp(o,l){return this.x+=(o.x-this.x)*l,this.y+=(o.y-this.y)*l,this.z+=(o.z-this.z)*l,this}lerpVectors(o,l,c){return this.x=o.x+(l.x-o.x)*c,this.y=o.y+(l.y-o.y)*c,this.z=o.z+(l.z-o.z)*c,this}cross(o){return this.crossVectors(this,o)}crossVectors(o,l){let{x:c,y:h,z:u}=o,{x:d,y:f,z:p}=l;return this.x=h*p-u*f,this.y=u*d-c*p,this.z=c*f-h*d,this}projectOnVector(o){let l=o.lengthSq();if(l===0)return this.set(0,0,0);let c=o.dot(this)/l;return this.copy(o).multiplyScalar(c)}projectOnPlane(o){return Ea.copy(this).projectOnVector(o),this.sub(Ea)}reflect(o){return this.sub(Ea.copy(o).multiplyScalar(2*this.dot(o)))}angleTo(o){let l=Math.sqrt(this.lengthSq()*o.lengthSq());if(l===0)return Math.PI/2;let c=this.dot(o)/l;return Math.acos(qt(c,-1,1))}distanceTo(o){return Math.sqrt(this.distanceToSquared(o))}distanceToSquared(o){let l=this.x-o.x,c=this.y-o.y,h=this.z-o.z;return l*l+c*c+h*h}manhattanDistanceTo(o){return Math.abs(this.x-o.x)+Math.abs(this.y-o.y)+Math.abs(this.z-o.z)}setFromSpherical(o){return this.setFromSphericalCoords(o.radius,o.phi,o.theta)}setFromSphericalCoords(o,l,c){let h=Math.sin(l)*o;return this.x=h*Math.sin(c),this.y=Math.cos(l)*o,this.z=h*Math.cos(c),this}setFromCylindrical(o){return this.setFromCylindricalCoords(o.radius,o.theta,o.y)}setFromCylindricalCoords(o,l,c){return this.x=o*Math.sin(l),this.y=c,this.z=o*Math.cos(l),this}setFromMatrixPosition(o){let l=o.elements;return this.x=l[12],this.y=l[13],this.z=l[14],this}setFromMatrixScale(o){let l=this.setFromMatrixColumn(o,0).length(),c=this.setFromMatrixColumn(o,1).length(),h=this.setFromMatrixColumn(o,2).length();return this.x=l,this.y=c,this.z=h,this}setFromMatrixColumn(o,l){return this.fromArray(o.elements,l*4)}setFromMatrix3Column(o,l){return this.fromArray(o.elements,l*3)}setFromEuler(o){return this.x=o._x,this.y=o._y,this.z=o._z,this}setFromColor(o){return this.x=o.r,this.y=o.g,this.z=o.b,this}equals(o){return o.x===this.x&&o.y===this.y&&o.z===this.z}fromArray(o,l=0){return this.x=o[l],this.y=o[l+1],this.z=o[l+2],this}toArray(o=[],l=0){return o[l]=this.x,o[l+1]=this.y,o[l+2]=this.z,o}fromBufferAttribute(o,l){return this.x=o.getX(l),this.y=o.getY(l),this.z=o.getZ(l),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let o=Math.random()*Math.PI*2,l=Math.random()*2-1,c=Math.sqrt(1-l*l);return this.x=c*Math.cos(o),this.y=l,this.z=c*Math.sin(o),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Ea=new k,Eh=new Pn;class Gt{static{this.prototype.isMatrix3=!0}constructor(o,l,c,h,u,d,f,p,m){if(this.elements=[1,0,0,0,1,0,0,0,1],o!==void 0)this.set(o,l,c,h,u,d,f,p,m)}set(o,l,c,h,u,d,f,p,m){let g=this.elements;return g[0]=o,g[1]=h,g[2]=f,g[3]=l,g[4]=u,g[5]=p,g[6]=c,g[7]=d,g[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(o){let l=this.elements,c=o.elements;return l[0]=c[0],l[1]=c[1],l[2]=c[2],l[3]=c[3],l[4]=c[4],l[5]=c[5],l[6]=c[6],l[7]=c[7],l[8]=c[8],this}extractBasis(o,l,c){return o.setFromMatrix3Column(this,0),l.setFromMatrix3Column(this,1),c.setFromMatrix3Column(this,2),this}setFromMatrix4(o){let l=o.elements;return this.set(l[0],l[4],l[8],l[1],l[5],l[9],l[2],l[6],l[10]),this}multiply(o){return this.multiplyMatrices(this,o)}premultiply(o){return this.multiplyMatrices(o,this)}multiplyMatrices(o,l){let c=o.elements,h=l.elements,u=this.elements,d=c[0],f=c[3],p=c[6],m=c[1],g=c[4],x=c[7],y=c[2],_=c[5],v=c[8],T=h[0],w=h[3],S=h[6],M=h[1],E=h[4],C=h[7],A=h[2],P=h[5],L=h[8];return u[0]=d*T+f*M+p*A,u[3]=d*w+f*E+p*P,u[6]=d*S+f*C+p*L,u[1]=m*T+g*M+x*A,u[4]=m*w+g*E+x*P,u[7]=m*S+g*C+x*L,u[2]=y*T+_*M+v*A,u[5]=y*w+_*E+v*P,u[8]=y*S+_*C+v*L,this}multiplyScalar(o){let l=this.elements;return l[0]*=o,l[3]*=o,l[6]*=o,l[1]*=o,l[4]*=o,l[7]*=o,l[2]*=o,l[5]*=o,l[8]*=o,this}determinant(){let o=this.elements,l=o[0],c=o[1],h=o[2],u=o[3],d=o[4],f=o[5],p=o[6],m=o[7],g=o[8];return l*d*g-l*f*m-c*u*g+c*f*p+h*u*m-h*d*p}invert(){let o=this.elements,l=o[0],c=o[1],h=o[2],u=o[3],d=o[4],f=o[5],p=o[6],m=o[7],g=o[8],x=g*d-f*m,y=f*p-g*u,_=m*u-d*p,v=l*x+c*y+h*_;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/v;return o[0]=x*T,o[1]=(h*m-g*c)*T,o[2]=(f*c-h*d)*T,o[3]=y*T,o[4]=(g*l-h*p)*T,o[5]=(h*u-f*l)*T,o[6]=_*T,o[7]=(c*p-m*l)*T,o[8]=(d*l-c*u)*T,this}transpose(){let o,l=this.elements;return o=l[1],l[1]=l[3],l[3]=o,o=l[2],l[2]=l[6],l[6]=o,o=l[5],l[5]=l[7],l[7]=o,this}getNormalMatrix(o){return this.setFromMatrix4(o).invert().transpose()}transposeIntoArray(o){let l=this.elements;return o[0]=l[0],o[1]=l[3],o[2]=l[6],o[3]=l[1],o[4]=l[4],o[5]=l[7],o[6]=l[2],o[7]=l[5],o[8]=l[8],this}setUvTransform(o,l,c,h,u,d,f){let p=Math.cos(u),m=Math.sin(u);return this.set(c*p,c*m,-c*(p*d+m*f)+d+o,-h*m,h*p,-h*(-m*d+p*f)+f+l,0,0,1),this}scale(o,l){return $s("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Aa.makeScale(o,l)),this}rotate(o){return $s("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Aa.makeRotation(-o)),this}translate(o,l){return $s("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Aa.makeTranslation(o,l)),this}makeTranslation(o,l){if(o.isVector2)this.set(1,0,o.x,0,1,o.y,0,0,1);else this.set(1,0,o,0,1,l,0,0,1);return this}makeRotation(o){let l=Math.cos(o),c=Math.sin(o);return this.set(l,-c,0,c,l,0,0,0,1),this}makeScale(o,l){return this.set(o,0,0,0,l,0,0,0,1),this}equals(o){let l=this.elements,c=o.elements;for(let h=0;h<9;h++)if(l[h]!==c[h])return!1;return!0}fromArray(o,l=0){for(let c=0;c<9;c++)this.elements[c]=o[c+l];return this}toArray(o=[],l=0){let c=this.elements;return o[l]=c[0],o[l+1]=c[1],o[l+2]=c[2],o[l+3]=c[3],o[l+4]=c[4],o[l+5]=c[5],o[l+6]=c[6],o[l+7]=c[7],o[l+8]=c[8],o}clone(){return new this.constructor().fromArray(this.elements)}}var Aa=new Gt,Ah=new Gt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),wh=new Gt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Dp(){let o={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(u,d,f){if(this.enabled===!1||d===f||!d||!f)return u;if(this.spaces[d].transfer==="srgb")u.r=oi(u.r),u.g=oi(u.g),u.b=oi(u.b);if(this.spaces[d].primaries!==this.spaces[f].primaries)u.applyMatrix3(this.spaces[d].toXYZ),u.applyMatrix3(this.spaces[f].fromXYZ);if(this.spaces[f].transfer==="srgb")u.r=_s(u.r),u.g=_s(u.g),u.b=_s(u.b);return u},workingToColorSpace:function(u,d){return this.convert(u,this.workingColorSpace,d)},colorSpaceToWorking:function(u,d){return this.convert(u,d,this.workingColorSpace)},getPrimaries:function(u){return this.spaces[u].primaries},getTransfer:function(u){if(u==="")return"linear";return this.spaces[u].transfer},getToneMappingMode:function(u){return this.spaces[u].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(u,d=this.workingColorSpace){return u.fromArray(this.spaces[d].luminanceCoefficients)},define:function(u){Object.assign(this.spaces,u)},_getMatrix:function(u,d,f){return u.copy(this.spaces[f].fromXYZ).multiply(this.spaces[d].toXYZ)},_getDrawingBufferColorSpace:function(u){return this.spaces[u].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(u=this.workingColorSpace){return this.spaces[u].workingColorSpaceConfig.unpackColorSpace}},l=[0.64,0.33,0.3,0.6,0.15,0.06],c=[0.2126,0.7152,0.0722],h=[0.3127,0.329];return o.define({["srgb-linear"]:{primaries:l,whitePoint:h,transfer:"linear",toXYZ:Ah,fromXYZ:wh,luminanceCoefficients:c,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:l,whitePoint:h,transfer:"srgb",toXYZ:Ah,fromXYZ:wh,luminanceCoefficients:c,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),o}var te=Dp();function oi(o){return o<0.04045?o*0.0773993808:Math.pow(o*0.9478672986+0.0521327014,2.4)}function _s(o){return o<0.0031308?o*12.92:1.055*Math.pow(o,0.41666)-0.055}var es;class ic{static getDataURL(o,l="image/png"){if(/^data:/i.test(o.src))return o.src;if(typeof HTMLCanvasElement>"u")return o.src;let c;if(o instanceof HTMLCanvasElement)c=o;else{if(es===void 0)es=tr("canvas");es.width=o.width,es.height=o.height;let h=es.getContext("2d");if(o instanceof ImageData)h.putImageData(o,0,0);else h.drawImage(o,0,0,o.width,o.height);c=es}return c.toDataURL(l)}static sRGBToLinear(o){if(typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap){let l=tr("canvas");l.width=o.width,l.height=o.height;let c=l.getContext("2d");c.drawImage(o,0,0,o.width,o.height);let h=c.getImageData(0,0,o.width,o.height),u=h.data;for(let d=0;d<u.length;d++)u[d]=oi(u[d]/255)*255;return c.putImageData(h,0,0),l}else if(o.data){let l=o.data.slice(0);for(let c=0;c<l.length;c++)if(l instanceof Uint8Array||l instanceof Uint8ClampedArray)l[c]=Math.floor(oi(l[c]/255)*255);else l[c]=oi(l[c]);return{data:l,width:o.width,height:o.height}}else return Bt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),o}}var Lp=0;class hr{constructor(o=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Lp++}),this.uuid=Ei(),this.data=o,this.dataReady=!0,this.version=0}getSize(o){let l=this.data;if(typeof HTMLVideoElement<"u"&&l instanceof HTMLVideoElement)o.set(l.videoWidth,l.videoHeight,0);else if(typeof VideoFrame<"u"&&l instanceof VideoFrame)o.set(l.displayWidth,l.displayHeight,0);else if(l!==null)o.set(l.width||0,l.height||0,l.depth||0);else o.set(0,0,0);return o}set needsUpdate(o){if(o===!0)this.version++}toJSON(o){let l=o===void 0||typeof o==="string";if(!l&&o.images[this.uuid]!==void 0)return o.images[this.uuid];let c={uuid:this.uuid,url:""},h=this.data;if(h!==null){let u;if(Array.isArray(h)){u=[];for(let d=0,f=h.length;d<f;d++)if(h[d].isDataTexture)u.push(wa(h[d].image));else u.push(wa(h[d]))}else u=wa(h);c.url=u}if(!l)o.images[this.uuid]=c;return c}}function wa(o){if(typeof HTMLImageElement<"u"&&o instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&o instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&o instanceof ImageBitmap)return ic.getDataURL(o);else if(o.data)return{data:Array.from(o.data),width:o.width,height:o.height,type:o.data.constructor.name};else return Bt("Texture: Unable to serialize Texture."),{}}var Np=0,Ra=new k;class Oe extends qn{constructor(o=Oe.DEFAULT_IMAGE,l=Oe.DEFAULT_MAPPING,c=1001,h=1001,u=1006,d=1008,f=1023,p=1009,m=Oe.DEFAULT_ANISOTROPY,g=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Np++}),this.uuid=Ei(),this.name="",this.source=new hr(o),this.mipmaps=[],this.mapping=l,this.channel=0,this.wrapS=c,this.wrapT=h,this.magFilter=u,this.minFilter=d,this.anisotropy=m,this.format=f,this.internalFormat=null,this.type=p,this.offset=new Dt(0,0),this.repeat=new Dt(1,1),this.center=new Dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Gt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=g,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=o&&o.depth&&o.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ra).x}get height(){return this.source.getSize(Ra).y}get depth(){return this.source.getSize(Ra).z}get image(){return this.source.data}set image(o){this.source.data=o}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(o,l){this.updateRanges.push({start:o,count:l})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(o){return this.name=o.name,this.source=o.source,this.mipmaps=o.mipmaps.slice(0),this.mapping=o.mapping,this.channel=o.channel,this.wrapS=o.wrapS,this.wrapT=o.wrapT,this.magFilter=o.magFilter,this.minFilter=o.minFilter,this.anisotropy=o.anisotropy,this.format=o.format,this.internalFormat=o.internalFormat,this.type=o.type,this.normalized=o.normalized,this.offset.copy(o.offset),this.repeat.copy(o.repeat),this.center.copy(o.center),this.rotation=o.rotation,this.matrixAutoUpdate=o.matrixAutoUpdate,this.matrix.copy(o.matrix),this.generateMipmaps=o.generateMipmaps,this.mipmapsAutoUpdate=o.mipmapsAutoUpdate,this.premultiplyAlpha=o.premultiplyAlpha,this.flipY=o.flipY,this.unpackAlignment=o.unpackAlignment,this.colorSpace=o.colorSpace,this.renderTarget=o.renderTarget,this.isRenderTargetTexture=o.isRenderTargetTexture,this.isPMREMTexture=o.isPMREMTexture,this.isArrayTexture=o.isArrayTexture,this.userData=JSON.parse(JSON.stringify(o.userData)),this.needsUpdate=!0,this}setValues(o){for(let l in o){let c=o[l];if(c===void 0){Bt(`Texture.setValues(): parameter '${l}' has value of undefined.`);continue}let h=this[l];if(h===void 0){Bt(`Texture.setValues(): property '${l}' does not exist.`);continue}if(h&&c&&(h.isVector2&&c.isVector2))h.copy(c);else if(h&&c&&(h.isVector3&&c.isVector3))h.copy(c);else if(h&&c&&(h.isMatrix3&&c.isMatrix3))h.copy(c);else this[l]=c}}toJSON(o){let l=o===void 0||typeof o==="string";if(!l&&o.textures[this.uuid]!==void 0)return o.textures[this.uuid];let c={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(o).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)c.userData=this.userData;if(!l)o.textures[this.uuid]=c;return c}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(o){if(this.mapping!==300)return o;if(o.applyMatrix3(this.matrix),o.x<0||o.x>1)switch(this.wrapS){case 1000:o.x=o.x-Math.floor(o.x);break;case 1001:o.x=o.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(o.x)%2)===1)o.x=Math.ceil(o.x)-o.x;else o.x=o.x-Math.floor(o.x);break}if(o.y<0||o.y>1)switch(this.wrapT){case 1000:o.y=o.y-Math.floor(o.y);break;case 1001:o.y=o.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(o.y)%2)===1)o.y=Math.ceil(o.y)-o.y;else o.y=o.y-Math.floor(o.y);break}if(this.flipY)o.y=1-o.y;return o}set needsUpdate(o){if(o===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(o){if(o===!0)this.pmremVersion++}}Oe.DEFAULT_IMAGE=null;Oe.DEFAULT_MAPPING=300;Oe.DEFAULT_ANISOTROPY=1;class Pe{static{this.prototype.isVector4=!0}constructor(o=0,l=0,c=0,h=1){this.x=o,this.y=l,this.z=c,this.w=h}get width(){return this.z}set width(o){this.z=o}get height(){return this.w}set height(o){this.w=o}set(o,l,c,h){return this.x=o,this.y=l,this.z=c,this.w=h,this}setScalar(o){return this.x=o,this.y=o,this.z=o,this.w=o,this}setX(o){return this.x=o,this}setY(o){return this.y=o,this}setZ(o){return this.z=o,this}setW(o){return this.w=o,this}setComponent(o,l){switch(o){case 0:this.x=l;break;case 1:this.y=l;break;case 2:this.z=l;break;case 3:this.w=l;break;default:throw Error("THREE.Vector4: index is out of range: "+o)}return this}getComponent(o){switch(o){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+o)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(o){return this.x=o.x,this.y=o.y,this.z=o.z,this.w=o.w!==void 0?o.w:1,this}add(o){return this.x+=o.x,this.y+=o.y,this.z+=o.z,this.w+=o.w,this}addScalar(o){return this.x+=o,this.y+=o,this.z+=o,this.w+=o,this}addVectors(o,l){return this.x=o.x+l.x,this.y=o.y+l.y,this.z=o.z+l.z,this.w=o.w+l.w,this}addScaledVector(o,l){return this.x+=o.x*l,this.y+=o.y*l,this.z+=o.z*l,this.w+=o.w*l,this}sub(o){return this.x-=o.x,this.y-=o.y,this.z-=o.z,this.w-=o.w,this}subScalar(o){return this.x-=o,this.y-=o,this.z-=o,this.w-=o,this}subVectors(o,l){return this.x=o.x-l.x,this.y=o.y-l.y,this.z=o.z-l.z,this.w=o.w-l.w,this}multiply(o){return this.x*=o.x,this.y*=o.y,this.z*=o.z,this.w*=o.w,this}multiplyScalar(o){return this.x*=o,this.y*=o,this.z*=o,this.w*=o,this}applyMatrix4(o){let l=this.x,c=this.y,h=this.z,u=this.w,d=o.elements;return this.x=d[0]*l+d[4]*c+d[8]*h+d[12]*u,this.y=d[1]*l+d[5]*c+d[9]*h+d[13]*u,this.z=d[2]*l+d[6]*c+d[10]*h+d[14]*u,this.w=d[3]*l+d[7]*c+d[11]*h+d[15]*u,this}divide(o){return this.x/=o.x,this.y/=o.y,this.z/=o.z,this.w/=o.w,this}divideScalar(o){return this.multiplyScalar(1/o)}setAxisAngleFromQuaternion(o){this.w=2*Math.acos(o.w);let l=Math.sqrt(1-o.w*o.w);if(l<0.0001)this.x=1,this.y=0,this.z=0;else this.x=o.x/l,this.y=o.y/l,this.z=o.z/l;return this}setAxisAngleFromRotationMatrix(o){let l,c,h,u,d=0.01,f=0.1,p=o.elements,m=p[0],g=p[4],x=p[8],y=p[1],_=p[5],v=p[9],T=p[2],w=p[6],S=p[10];if(Math.abs(g-y)<0.01&&Math.abs(x-T)<0.01&&Math.abs(v-w)<0.01){if(Math.abs(g+y)<0.1&&Math.abs(x+T)<0.1&&Math.abs(v+w)<0.1&&Math.abs(m+_+S-3)<0.1)return this.set(1,0,0,0),this;l=Math.PI;let E=(m+1)/2,C=(_+1)/2,A=(S+1)/2,P=(g+y)/4,L=(x+T)/4,b=(v+w)/4;if(E>C&&E>A)if(E<0.01)c=0,h=0.707106781,u=0.707106781;else c=Math.sqrt(E),h=P/c,u=L/c;else if(C>A)if(C<0.01)c=0.707106781,h=0,u=0.707106781;else h=Math.sqrt(C),c=P/h,u=b/h;else if(A<0.01)c=0.707106781,h=0.707106781,u=0;else u=Math.sqrt(A),c=L/u,h=b/u;return this.set(c,h,u,l),this}let M=Math.sqrt((w-v)*(w-v)+(x-T)*(x-T)+(y-g)*(y-g));if(Math.abs(M)<0.001)M=1;return this.x=(w-v)/M,this.y=(x-T)/M,this.z=(y-g)/M,this.w=Math.acos((m+_+S-1)/2),this}setFromMatrixPosition(o){let l=o.elements;return this.x=l[12],this.y=l[13],this.z=l[14],this.w=l[15],this}min(o){return this.x=Math.min(this.x,o.x),this.y=Math.min(this.y,o.y),this.z=Math.min(this.z,o.z),this.w=Math.min(this.w,o.w),this}max(o){return this.x=Math.max(this.x,o.x),this.y=Math.max(this.y,o.y),this.z=Math.max(this.z,o.z),this.w=Math.max(this.w,o.w),this}clamp(o,l){return this.x=qt(this.x,o.x,l.x),this.y=qt(this.y,o.y,l.y),this.z=qt(this.z,o.z,l.z),this.w=qt(this.w,o.w,l.w),this}clampScalar(o,l){return this.x=qt(this.x,o,l),this.y=qt(this.y,o,l),this.z=qt(this.z,o,l),this.w=qt(this.w,o,l),this}clampLength(o,l){let c=this.length();return this.divideScalar(c||1).multiplyScalar(qt(c,o,l))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(o){return this.x*o.x+this.y*o.y+this.z*o.z+this.w*o.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(o){return this.normalize().multiplyScalar(o)}lerp(o,l){return this.x+=(o.x-this.x)*l,this.y+=(o.y-this.y)*l,this.z+=(o.z-this.z)*l,this.w+=(o.w-this.w)*l,this}lerpVectors(o,l,c){return this.x=o.x+(l.x-o.x)*c,this.y=o.y+(l.y-o.y)*c,this.z=o.z+(l.z-o.z)*c,this.w=o.w+(l.w-o.w)*c,this}equals(o){return o.x===this.x&&o.y===this.y&&o.z===this.z&&o.w===this.w}fromArray(o,l=0){return this.x=o[l],this.y=o[l+1],this.z=o[l+2],this.w=o[l+3],this}toArray(o=[],l=0){return o[l]=this.x,o[l+1]=this.y,o[l+2]=this.z,o[l+3]=this.w,o}fromBufferAttribute(o,l){return this.x=o.getX(l),this.y=o.getY(l),this.z=o.getZ(l),this.w=o.getW(l),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class sc extends qn{constructor(o=1,l=1,c={}){super();c=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},c),this.isRenderTarget=!0,this.width=o,this.height=l,this.depth=c.depth,this.scissor=new Pe(0,0,o,l),this.scissorTest=!1,this.viewport=new Pe(0,0,o,l),this.textures=[];let h=c.count;for(let u=0;u<h;u++)this.textures[u]=new Oe({width:o,height:l,depth:c.depth}),this.textures[u].isRenderTargetTexture=!0,this.textures[u].renderTarget=this;this._setTextureOptions(c),this.depthBuffer=c.depthBuffer,this.stencilBuffer=c.stencilBuffer,this.resolveColorBuffer=c.resolveColorBuffer,this.resolveDepthBuffer=c.resolveDepthBuffer,this.resolveStencilBuffer=c.resolveStencilBuffer,this.storeMultisampledColorBuffer=c.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=c.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=c.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=c.depthTexture,this.samples=c.samples,this.multiview=c.multiview,this.useArrayDepthTexture=c.useArrayDepthTexture}_setTextureOptions(o={}){let l={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(o.mapping!==void 0)l.mapping=o.mapping;if(o.wrapS!==void 0)l.wrapS=o.wrapS;if(o.wrapT!==void 0)l.wrapT=o.wrapT;if(o.wrapR!==void 0)l.wrapR=o.wrapR;if(o.magFilter!==void 0)l.magFilter=o.magFilter;if(o.minFilter!==void 0)l.minFilter=o.minFilter;if(o.format!==void 0)l.format=o.format;if(o.type!==void 0)l.type=o.type;if(o.anisotropy!==void 0)l.anisotropy=o.anisotropy;if(o.colorSpace!==void 0)l.colorSpace=o.colorSpace;if(o.flipY!==void 0)l.flipY=o.flipY;if(o.generateMipmaps!==void 0)l.generateMipmaps=o.generateMipmaps;if(o.mipmapsAutoUpdate!==void 0)l.mipmapsAutoUpdate=o.mipmapsAutoUpdate;if(o.internalFormat!==void 0)l.internalFormat=o.internalFormat;for(let c=0;c<this.textures.length;c++)this.textures[c].setValues(l)}get texture(){return this.textures[0]}set texture(o){this.textures[0]=o}set depthTexture(o){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(o!==null&&o.renderTarget===null)o.renderTarget=this;this._depthTexture=o}get depthTexture(){return this._depthTexture}setSize(o,l,c=1){if(this.width!==o||this.height!==l||this.depth!==c){this.width=o,this.height=l,this.depth=c;for(let h=0,u=this.textures.length;h<u;h++)if(this.textures[h].image.width=o,this.textures[h].image.height=l,this.textures[h].image.depth=c,this.textures[h].isData3DTexture!==!0)this.textures[h].isArrayTexture=this.textures[h].image.depth>1;this.dispose()}this.viewport.set(0,0,o,l),this.scissor.set(0,0,o,l)}clone(){return new this.constructor().copy(this)}copy(o){this.width=o.width,this.height=o.height,this.depth=o.depth,this.scissor.copy(o.scissor),this.scissorTest=o.scissorTest,this.viewport.copy(o.viewport),this.textures.length=0;for(let l=0,c=o.textures.length;l<c;l++){this.textures[l]=o.textures[l].clone(),this.textures[l].isRenderTargetTexture=!0,this.textures[l].renderTarget=this;let h=Object.assign({},o.textures[l].image);this.textures[l].source=new hr(h)}if(this.depthBuffer=o.depthBuffer,this.stencilBuffer=o.stencilBuffer,this.resolveColorBuffer=o.resolveColorBuffer,this.resolveDepthBuffer=o.resolveDepthBuffer,this.resolveStencilBuffer=o.resolveStencilBuffer,this.storeMultisampledColorBuffer=o.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=o.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=o.storeMultisampledStencilBuffer,o.depthTexture!==null)if(o.depthTexture.renderTarget===o){let l=o.depthTexture.clone();l.renderTarget=null,this.depthTexture=l}else this.depthTexture=o.depthTexture;else this.depthTexture=null;return this.samples=o.samples,this.multiview=o.multiview,this.useArrayDepthTexture=o.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class In extends sc{constructor(o=1,l=1,c={}){super(o,l,c);this.isWebGLRenderTarget=!0}}class Eo extends Oe{constructor(o=null,l=1,c=1,h=1){super(null);this.isDataArrayTexture=!0,this.image={data:o,width:l,height:c,depth:h},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(o){return super.copy(o),this.wrapR=o.wrapR,this}addLayerUpdate(o){this.layerUpdates.add(o)}clearLayerUpdates(){this.layerUpdates.clear()}}class rc extends Oe{constructor(o=null,l=1,c=1,h=1){super(null);this.isData3DTexture=!0,this.image={data:o,width:l,height:c,depth:h},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(o){return super.copy(o),this.wrapR=o.wrapR,this}}class Yt{static{this.prototype.isMatrix4=!0}constructor(o,l,c,h,u,d,f,p,m,g,x,y,_,v,T,w){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],o!==void 0)this.set(o,l,c,h,u,d,f,p,m,g,x,y,_,v,T,w)}set(o,l,c,h,u,d,f,p,m,g,x,y,_,v,T,w){let S=this.elements;return S[0]=o,S[4]=l,S[8]=c,S[12]=h,S[1]=u,S[5]=d,S[9]=f,S[13]=p,S[2]=m,S[6]=g,S[10]=x,S[14]=y,S[3]=_,S[7]=v,S[11]=T,S[15]=w,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Yt().fromArray(this.elements)}copy(o){let l=this.elements,c=o.elements;return l[0]=c[0],l[1]=c[1],l[2]=c[2],l[3]=c[3],l[4]=c[4],l[5]=c[5],l[6]=c[6],l[7]=c[7],l[8]=c[8],l[9]=c[9],l[10]=c[10],l[11]=c[11],l[12]=c[12],l[13]=c[13],l[14]=c[14],l[15]=c[15],this}copyPosition(o){let l=this.elements,c=o.elements;return l[12]=c[12],l[13]=c[13],l[14]=c[14],this}setFromMatrix3(o){let l=o.elements;return this.set(l[0],l[3],l[6],0,l[1],l[4],l[7],0,l[2],l[5],l[8],0,0,0,0,1),this}extractBasis(o,l,c){if(this.determinantAffine()===0)return o.set(1,0,0),l.set(0,1,0),c.set(0,0,1),this;return o.setFromMatrixColumn(this,0),l.setFromMatrixColumn(this,1),c.setFromMatrixColumn(this,2),this}makeBasis(o,l,c){return this.set(o.x,l.x,c.x,0,o.y,l.y,c.y,0,o.z,l.z,c.z,0,0,0,0,1),this}extractRotation(o){if(o.determinantAffine()===0)return this.identity();let l=this.elements,c=o.elements,h=1/ns.setFromMatrixColumn(o,0).length(),u=1/ns.setFromMatrixColumn(o,1).length(),d=1/ns.setFromMatrixColumn(o,2).length();return l[0]=c[0]*h,l[1]=c[1]*h,l[2]=c[2]*h,l[3]=0,l[4]=c[4]*u,l[5]=c[5]*u,l[6]=c[6]*u,l[7]=0,l[8]=c[8]*d,l[9]=c[9]*d,l[10]=c[10]*d,l[11]=0,l[12]=0,l[13]=0,l[14]=0,l[15]=1,this}makeRotationFromEuler(o){let l=this.elements,{x:c,y:h,z:u}=o,d=Math.cos(c),f=Math.sin(c),p=Math.cos(h),m=Math.sin(h),g=Math.cos(u),x=Math.sin(u);if(o.order==="XYZ"){let y=d*g,_=d*x,v=f*g,T=f*x;l[0]=p*g,l[4]=-p*x,l[8]=m,l[1]=_+v*m,l[5]=y-T*m,l[9]=-f*p,l[2]=T-y*m,l[6]=v+_*m,l[10]=d*p}else if(o.order==="YXZ"){let y=p*g,_=p*x,v=m*g,T=m*x;l[0]=y+T*f,l[4]=v*f-_,l[8]=d*m,l[1]=d*x,l[5]=d*g,l[9]=-f,l[2]=_*f-v,l[6]=T+y*f,l[10]=d*p}else if(o.order==="ZXY"){let y=p*g,_=p*x,v=m*g,T=m*x;l[0]=y-T*f,l[4]=-d*x,l[8]=v+_*f,l[1]=_+v*f,l[5]=d*g,l[9]=T-y*f,l[2]=-d*m,l[6]=f,l[10]=d*p}else if(o.order==="ZYX"){let y=d*g,_=d*x,v=f*g,T=f*x;l[0]=p*g,l[4]=v*m-_,l[8]=y*m+T,l[1]=p*x,l[5]=T*m+y,l[9]=_*m-v,l[2]=-m,l[6]=f*p,l[10]=d*p}else if(o.order==="YZX"){let y=d*p,_=d*m,v=f*p,T=f*m;l[0]=p*g,l[4]=T-y*x,l[8]=v*x+_,l[1]=x,l[5]=d*g,l[9]=-f*g,l[2]=-m*g,l[6]=_*x+v,l[10]=y-T*x}else if(o.order==="XZY"){let y=d*p,_=d*m,v=f*p,T=f*m;l[0]=p*g,l[4]=-x,l[8]=m*g,l[1]=y*x+T,l[5]=d*g,l[9]=_*x-v,l[2]=v*x-_,l[6]=f*g,l[10]=T*x+y}return l[3]=0,l[7]=0,l[11]=0,l[12]=0,l[13]=0,l[14]=0,l[15]=1,this}makeRotationFromQuaternion(o){return this.compose(Up,o,Fp)}lookAt(o,l,c){let h=this.elements;if(bn.subVectors(o,l),bn.lengthSq()===0)bn.z=1;if(bn.normalize(),pi.crossVectors(c,bn),pi.lengthSq()===0){if(Math.abs(c.z)===1)bn.x+=0.0001;else bn.z+=0.0001;bn.normalize(),pi.crossVectors(c,bn)}return pi.normalize(),zr.crossVectors(bn,pi),h[0]=pi.x,h[4]=zr.x,h[8]=bn.x,h[1]=pi.y,h[5]=zr.y,h[9]=bn.y,h[2]=pi.z,h[6]=zr.z,h[10]=bn.z,this}multiply(o){return this.multiplyMatrices(this,o)}premultiply(o){return this.multiplyMatrices(o,this)}multiplyMatrices(o,l){let c=o.elements,h=l.elements,u=this.elements,d=c[0],f=c[4],p=c[8],m=c[12],g=c[1],x=c[5],y=c[9],_=c[13],v=c[2],T=c[6],w=c[10],S=c[14],M=c[3],E=c[7],C=c[11],A=c[15],P=h[0],L=h[4],b=h[8],R=h[12],N=h[1],B=h[5],U=h[9],z=h[13],W=h[2],O=h[6],q=h[10],j=h[14],X=h[3],ht=h[7],Q=h[11],rt=h[15];return u[0]=d*P+f*N+p*W+m*X,u[4]=d*L+f*B+p*O+m*ht,u[8]=d*b+f*U+p*q+m*Q,u[12]=d*R+f*z+p*j+m*rt,u[1]=g*P+x*N+y*W+_*X,u[5]=g*L+x*B+y*O+_*ht,u[9]=g*b+x*U+y*q+_*Q,u[13]=g*R+x*z+y*j+_*rt,u[2]=v*P+T*N+w*W+S*X,u[6]=v*L+T*B+w*O+S*ht,u[10]=v*b+T*U+w*q+S*Q,u[14]=v*R+T*z+w*j+S*rt,u[3]=M*P+E*N+C*W+A*X,u[7]=M*L+E*B+C*O+A*ht,u[11]=M*b+E*U+C*q+A*Q,u[15]=M*R+E*z+C*j+A*rt,this}multiplyScalar(o){let l=this.elements;return l[0]*=o,l[4]*=o,l[8]*=o,l[12]*=o,l[1]*=o,l[5]*=o,l[9]*=o,l[13]*=o,l[2]*=o,l[6]*=o,l[10]*=o,l[14]*=o,l[3]*=o,l[7]*=o,l[11]*=o,l[15]*=o,this}determinant(){let o=this.elements,l=o[0],c=o[4],h=o[8],u=o[12],d=o[1],f=o[5],p=o[9],m=o[13],g=o[2],x=o[6],y=o[10],_=o[14],v=o[3],T=o[7],w=o[11],S=o[15],M=p*_-m*y,E=f*_-m*x,C=f*y-p*x,A=d*_-m*g,P=d*y-p*g,L=d*x-f*g;return l*(T*M-w*E+S*C)-c*(v*M-w*A+S*P)+h*(v*E-T*A+S*L)-u*(v*C-T*P+w*L)}determinantAffine(){let o=this.elements,l=o[0],c=o[4],h=o[8],u=o[1],d=o[5],f=o[9],p=o[2],m=o[6],g=o[10];return l*(d*g-f*m)-c*(u*g-f*p)+h*(u*m-d*p)}transpose(){let o=this.elements,l;return l=o[1],o[1]=o[4],o[4]=l,l=o[2],o[2]=o[8],o[8]=l,l=o[6],o[6]=o[9],o[9]=l,l=o[3],o[3]=o[12],o[12]=l,l=o[7],o[7]=o[13],o[13]=l,l=o[11],o[11]=o[14],o[14]=l,this}setPosition(o,l,c){let h=this.elements;if(o.isVector3)h[12]=o.x,h[13]=o.y,h[14]=o.z;else h[12]=o,h[13]=l,h[14]=c;return this}invert(){let o=this.elements,l=o[0],c=o[1],h=o[2],u=o[3],d=o[4],f=o[5],p=o[6],m=o[7],g=o[8],x=o[9],y=o[10],_=o[11],v=o[12],T=o[13],w=o[14],S=o[15],M=l*f-c*d,E=l*p-h*d,C=l*m-u*d,A=c*p-h*f,P=c*m-u*f,L=h*m-u*p,b=g*T-x*v,R=g*w-y*v,N=g*S-_*v,B=x*w-y*T,U=x*S-_*T,z=y*S-_*w,W=M*z-E*U+C*B+A*N-P*R+L*b;if(W===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let O=1/W;return o[0]=(f*z-p*U+m*B)*O,o[1]=(h*U-c*z-u*B)*O,o[2]=(T*L-w*P+S*A)*O,o[3]=(y*P-x*L-_*A)*O,o[4]=(p*N-d*z-m*R)*O,o[5]=(l*z-h*N+u*R)*O,o[6]=(w*C-v*L-S*E)*O,o[7]=(g*L-y*C+_*E)*O,o[8]=(d*U-f*N+m*b)*O,o[9]=(c*N-l*U-u*b)*O,o[10]=(v*P-T*C+S*M)*O,o[11]=(x*C-g*P-_*M)*O,o[12]=(f*R-d*B-p*b)*O,o[13]=(l*B-c*R+h*b)*O,o[14]=(T*E-v*A-w*M)*O,o[15]=(g*A-x*E+y*M)*O,this}scale(o){let l=this.elements,{x:c,y:h,z:u}=o;return l[0]*=c,l[4]*=h,l[8]*=u,l[1]*=c,l[5]*=h,l[9]*=u,l[2]*=c,l[6]*=h,l[10]*=u,l[3]*=c,l[7]*=h,l[11]*=u,this}getMaxScaleOnAxis(){let o=this.elements,l=o[0]*o[0]+o[1]*o[1]+o[2]*o[2],c=o[4]*o[4]+o[5]*o[5]+o[6]*o[6],h=o[8]*o[8]+o[9]*o[9]+o[10]*o[10];return Math.sqrt(Math.max(l,c,h))}makeTranslation(o,l,c){if(o.isVector3)this.set(1,0,0,o.x,0,1,0,o.y,0,0,1,o.z,0,0,0,1);else this.set(1,0,0,o,0,1,0,l,0,0,1,c,0,0,0,1);return this}makeRotationX(o){let l=Math.cos(o),c=Math.sin(o);return this.set(1,0,0,0,0,l,-c,0,0,c,l,0,0,0,0,1),this}makeRotationY(o){let l=Math.cos(o),c=Math.sin(o);return this.set(l,0,c,0,0,1,0,0,-c,0,l,0,0,0,0,1),this}makeRotationZ(o){let l=Math.cos(o),c=Math.sin(o);return this.set(l,-c,0,0,c,l,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(o,l){let c=Math.cos(l),h=Math.sin(l),u=1-c,{x:d,y:f,z:p}=o,m=u*d,g=u*f;return this.set(m*d+c,m*f-h*p,m*p+h*f,0,m*f+h*p,g*f+c,g*p-h*d,0,m*p-h*f,g*p+h*d,u*p*p+c,0,0,0,0,1),this}makeScale(o,l,c){return this.set(o,0,0,0,0,l,0,0,0,0,c,0,0,0,0,1),this}makeShear(o,l,c,h,u,d){return this.set(1,c,u,0,o,1,d,0,l,h,1,0,0,0,0,1),this}compose(o,l,c){let h=this.elements,{_x:u,_y:d,_z:f,_w:p}=l,m=u+u,g=d+d,x=f+f,y=u*m,_=u*g,v=u*x,T=d*g,w=d*x,S=f*x,M=p*m,E=p*g,C=p*x,{x:A,y:P,z:L}=c;return h[0]=(1-(T+S))*A,h[1]=(_+C)*A,h[2]=(v-E)*A,h[3]=0,h[4]=(_-C)*P,h[5]=(1-(y+S))*P,h[6]=(w+M)*P,h[7]=0,h[8]=(v+E)*L,h[9]=(w-M)*L,h[10]=(1-(y+T))*L,h[11]=0,h[12]=o.x,h[13]=o.y,h[14]=o.z,h[15]=1,this}decompose(o,l,c){let h=this.elements;o.x=h[12],o.y=h[13],o.z=h[14];let u=this.determinantAffine();if(u===0)return c.set(1,1,1),l.identity(),this;let d=ns.set(h[0],h[1],h[2]).length(),f=ns.set(h[4],h[5],h[6]).length(),p=ns.set(h[8],h[9],h[10]).length();if(u<0)d=-d;Un.copy(this);let m=1/d,g=1/f,x=1/p;return Un.elements[0]*=m,Un.elements[1]*=m,Un.elements[2]*=m,Un.elements[4]*=g,Un.elements[5]*=g,Un.elements[6]*=g,Un.elements[8]*=x,Un.elements[9]*=x,Un.elements[10]*=x,l.setFromRotationMatrix(Un),c.x=d,c.y=f,c.z=p,this}makePerspective(o,l,c,h,u,d,f=2000,p=!1){let m=this.elements,g=2*u/(l-o),x=2*u/(c-h),y=(l+o)/(l-o),_=(c+h)/(c-h),v,T;if(p)v=u/(d-u),T=d*u/(d-u);else if(f===2000)v=-(d+u)/(d-u),T=-2*d*u/(d-u);else if(f===2001)v=-d/(d-u),T=-d*u/(d-u);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+f);return m[0]=g,m[4]=0,m[8]=y,m[12]=0,m[1]=0,m[5]=x,m[9]=_,m[13]=0,m[2]=0,m[6]=0,m[10]=v,m[14]=T,m[3]=0,m[7]=0,m[11]=-1,m[15]=0,this}makeOrthographic(o,l,c,h,u,d,f=2000,p=!1){let m=this.elements,g=2/(l-o),x=2/(c-h),y=-(l+o)/(l-o),_=-(c+h)/(c-h),v,T;if(p)v=1/(d-u),T=d/(d-u);else if(f===2000)v=-2/(d-u),T=-(d+u)/(d-u);else if(f===2001)v=-1/(d-u),T=-u/(d-u);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+f);return m[0]=g,m[4]=0,m[8]=0,m[12]=y,m[1]=0,m[5]=x,m[9]=0,m[13]=_,m[2]=0,m[6]=0,m[10]=v,m[14]=T,m[3]=0,m[7]=0,m[11]=0,m[15]=1,this}equals(o){let l=this.elements,c=o.elements;for(let h=0;h<16;h++)if(l[h]!==c[h])return!1;return!0}fromArray(o,l=0){for(let c=0;c<16;c++)this.elements[c]=o[c+l];return this}toArray(o=[],l=0){let c=this.elements;return o[l]=c[0],o[l+1]=c[1],o[l+2]=c[2],o[l+3]=c[3],o[l+4]=c[4],o[l+5]=c[5],o[l+6]=c[6],o[l+7]=c[7],o[l+8]=c[8],o[l+9]=c[9],o[l+10]=c[10],o[l+11]=c[11],o[l+12]=c[12],o[l+13]=c[13],o[l+14]=c[14],o[l+15]=c[15],o}}var ns=new k,Un=new Yt,Up=new k(0,0,0),Fp=new k(1,1,1),pi=new k,zr=new k,bn=new k,Rh=new Yt,Ch=new Pn;class ai{constructor(o=0,l=0,c=0,h=ai.DEFAULT_ORDER){this.isEuler=!0,this._x=o,this._y=l,this._z=c,this._order=h}get x(){return this._x}set x(o){this._x=o,this._onChangeCallback()}get y(){return this._y}set y(o){this._y=o,this._onChangeCallback()}get z(){return this._z}set z(o){this._z=o,this._onChangeCallback()}get order(){return this._order}set order(o){this._order=o,this._onChangeCallback()}set(o,l,c,h=this._order){return this._x=o,this._y=l,this._z=c,this._order=h,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(o){return this._x=o._x,this._y=o._y,this._z=o._z,this._order=o._order,this._onChangeCallback(),this}setFromRotationMatrix(o,l=this._order,c=!0){let h=o.elements,u=h[0],d=h[4],f=h[8],p=h[1],m=h[5],g=h[9],x=h[2],y=h[6],_=h[10];switch(l){case"XYZ":if(this._y=Math.asin(qt(f,-1,1)),Math.abs(f)<0.9999999)this._x=Math.atan2(-g,_),this._z=Math.atan2(-d,u);else this._x=Math.atan2(y,m),this._z=0;break;case"YXZ":if(this._x=Math.asin(-qt(g,-1,1)),Math.abs(g)<0.9999999)this._y=Math.atan2(f,_),this._z=Math.atan2(p,m);else this._y=Math.atan2(-x,u),this._z=0;break;case"ZXY":if(this._x=Math.asin(qt(y,-1,1)),Math.abs(y)<0.9999999)this._y=Math.atan2(-x,_),this._z=Math.atan2(-d,m);else this._y=0,this._z=Math.atan2(p,u);break;case"ZYX":if(this._y=Math.asin(-qt(x,-1,1)),Math.abs(x)<0.9999999)this._x=Math.atan2(y,_),this._z=Math.atan2(p,u);else this._x=0,this._z=Math.atan2(-d,m);break;case"YZX":if(this._z=Math.asin(qt(p,-1,1)),Math.abs(p)<0.9999999)this._x=Math.atan2(-g,m),this._y=Math.atan2(-x,u);else this._x=0,this._y=Math.atan2(f,_);break;case"XZY":if(this._z=Math.asin(-qt(d,-1,1)),Math.abs(d)<0.9999999)this._x=Math.atan2(y,m),this._y=Math.atan2(f,u);else this._x=Math.atan2(-g,_),this._y=0;break;default:Bt("Euler: .setFromRotationMatrix() encountered an unknown order: "+l)}if(this._order=l,c===!0)this._onChangeCallback();return this}setFromQuaternion(o,l,c){return Rh.makeRotationFromQuaternion(o),this.setFromRotationMatrix(Rh,l,c)}setFromVector3(o,l=this._order){return this.set(o.x,o.y,o.z,l)}reorder(o){return Ch.setFromEuler(this),this.setFromQuaternion(Ch,o)}equals(o){return o._x===this._x&&o._y===this._y&&o._z===this._z&&o._order===this._order}fromArray(o){if(this._x=o[0],this._y=o[1],this._z=o[2],o[3]!==void 0)this._order=o[3];return this._onChangeCallback(),this}toArray(o=[],l=0){return o[l]=this._x,o[l+1]=this._y,o[l+2]=this._z,o[l+3]=this._order,o}_onChange(o){return this._onChangeCallback=o,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}ai.DEFAULT_ORDER="XYZ";class ur{constructor(){this.mask=1}set(o){this.mask=(1<<o|0)>>>0}enable(o){this.mask|=1<<o|0}enableAll(){this.mask=-1}toggle(o){this.mask^=1<<o|0}disable(o){this.mask&=~(1<<o|0)}disableAll(){this.mask=0}test(o){return(this.mask&o.mask)!==0}isEnabled(o){return(this.mask&(1<<o|0))!==0}}var Op=0,Ph=new k,is=new Pn,ti=new Yt,kr=new k,qs=new k,Bp=new k,zp=new Pn,Ih=new k(1,0,0),Dh=new k(0,1,0),Lh=new k(0,0,1),Nh={type:"added"},kp={type:"removed"},ss={type:"childadded",child:null},Ca={type:"childremoved",child:null};class Be extends qn{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Op++}),this.uuid=Ei(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Be.DEFAULT_UP.clone();let o=new k,l=new ai,c=new Pn,h=new k(1,1,1);function u(){c.setFromEuler(l,!1)}function d(){l.setFromQuaternion(c,void 0,!1)}l._onChange(u),c._onChange(d),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:o},rotation:{configurable:!0,enumerable:!0,value:l},quaternion:{configurable:!0,enumerable:!0,value:c},scale:{configurable:!0,enumerable:!0,value:h},modelViewMatrix:{value:new Yt},normalMatrix:{value:new Gt}}),this.matrix=new Yt,this.matrixWorld=new Yt,this.matrixAutoUpdate=Be.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Be.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ur,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(o){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(o),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(o){return this.quaternion.premultiply(o),this}setRotationFromAxisAngle(o,l){this.quaternion.setFromAxisAngle(o,l)}setRotationFromEuler(o){this.quaternion.setFromEuler(o,!0)}setRotationFromMatrix(o){this.quaternion.setFromRotationMatrix(o)}setRotationFromQuaternion(o){this.quaternion.copy(o)}rotateOnAxis(o,l){return is.setFromAxisAngle(o,l),this.quaternion.multiply(is),this}rotateOnWorldAxis(o,l){return is.setFromAxisAngle(o,l),this.quaternion.premultiply(is),this}rotateX(o){return this.rotateOnAxis(Ih,o)}rotateY(o){return this.rotateOnAxis(Dh,o)}rotateZ(o){return this.rotateOnAxis(Lh,o)}translateOnAxis(o,l){return Ph.copy(o).applyQuaternion(this.quaternion),this.position.add(Ph.multiplyScalar(l)),this}translateX(o){return this.translateOnAxis(Ih,o)}translateY(o){return this.translateOnAxis(Dh,o)}translateZ(o){return this.translateOnAxis(Lh,o)}localToWorld(o){return this.updateWorldMatrix(!0,!1),o.applyMatrix4(this.matrixWorld)}worldToLocal(o){return this.updateWorldMatrix(!0,!1),o.applyMatrix4(ti.copy(this.matrixWorld).invert())}lookAt(o,l,c){if(o.isVector3)kr.copy(o);else kr.set(o,l,c);let h=this.parent;if(this.updateWorldMatrix(!0,!1),qs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)ti.lookAt(qs,kr,this.up);else ti.lookAt(kr,qs,this.up);if(this.quaternion.setFromRotationMatrix(ti),h)ti.extractRotation(h.matrixWorld),is.setFromRotationMatrix(ti),this.quaternion.premultiply(is.invert())}add(o){if(arguments.length>1){for(let l=0;l<arguments.length;l++)this.add(arguments[l]);return this}if(o===this)return Ht("Object3D.add: object can't be added as a child of itself.",o),this;if(o&&o.isObject3D)o.removeFromParent(),o.parent=this,this.children.push(o),o.dispatchEvent(Nh),ss.child=o,this.dispatchEvent(ss),ss.child=null;else Ht("Object3D.add: object not an instance of THREE.Object3D.",o);return this}remove(o){if(arguments.length>1){for(let c=0;c<arguments.length;c++)this.remove(arguments[c]);return this}let l=this.children.indexOf(o);if(l!==-1)o.parent=null,this.children.splice(l,1),o.dispatchEvent(kp),Ca.child=o,this.dispatchEvent(Ca),Ca.child=null;return this}removeFromParent(){let o=this.parent;if(o!==null)o.remove(this);return this}clear(){return this.remove(...this.children)}attach(o){if(this.updateWorldMatrix(!0,!1),ti.copy(this.matrixWorld).invert(),o.parent!==null)o.parent.updateWorldMatrix(!0,!1),ti.multiply(o.parent.matrixWorld);return o.applyMatrix4(ti),o.removeFromParent(),o.parent=this,this.children.push(o),o.updateWorldMatrix(!1,!0),o.dispatchEvent(Nh),ss.child=o,this.dispatchEvent(ss),ss.child=null,this}getObjectById(o){return this.getObjectByProperty("id",o)}getObjectByName(o){return this.getObjectByProperty("name",o)}getObjectByProperty(o,l){if(this[o]===l)return this;for(let c=0,h=this.children.length;c<h;c++){let d=this.children[c].getObjectByProperty(o,l);if(d!==void 0)return d}return}getObjectsByProperty(o,l,c=[]){if(this[o]===l)c.push(this);let h=this.children;for(let u=0,d=h.length;u<d;u++)h[u].getObjectsByProperty(o,l,c);return c}getWorldPosition(o){return this.updateWorldMatrix(!0,!1),o.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(o){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,o,Bp),o}getWorldScale(o){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qs,zp,o),o}getWorldDirection(o){this.updateWorldMatrix(!0,!1);let l=this.matrixWorld.elements;return o.set(l[8],l[9],l[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(o){o(this);let l=this.children;for(let c=0,h=l.length;c<h;c++)l[c].traverse(o)}traverseVisible(o){if(this.visible===!1)return;o(this);let l=this.children;for(let c=0,h=l.length;c<h;c++)l[c].traverseVisible(o)}traverseAncestors(o){let l=this.parent;if(l!==null)o(l),l.traverseAncestors(o)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let o=this.pivot;if(o!==null){let{x:l,y:c,z:h}=o,u=this.matrix.elements;u[12]+=l-u[0]*l-u[4]*c-u[8]*h,u[13]+=c-u[1]*l-u[5]*c-u[9]*h,u[14]+=h-u[2]*l-u[6]*c-u[10]*h}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(o){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||o){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,o=!0}let l=this.children;for(let c=0,h=l.length;c<h;c++)l[c].updateMatrixWorld(o)}updateWorldMatrix(o,l,c=!1){let h=this.parent;if(o===!0&&h!==null)h.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||c){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,c=!0}if(l===!0){let u=this.children;for(let d=0,f=u.length;d<f;d++)u[d].updateWorldMatrix(!1,!0,c)}}toJSON(o){let l=o===void 0||typeof o==="string",c={};if(l)o={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},c.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let h={};if(h.uuid=this.uuid,h.type=this.type,h.name=this.name,h.castShadow=this.castShadow,h.receiveShadow=this.receiveShadow,h.visible=this.visible,h.frustumCulled=this.frustumCulled,h.renderOrder=this.renderOrder,h.static=this.static,h.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)h.userData=this.userData;if(h.layers=this.layers.mask,h.matrix=this.matrix.toArray(),h.up=this.up.toArray(),this.pivot!==null)h.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)h.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)h.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(h.type="InstancedMesh",h.count=this.count,h.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)h.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(h.type="BatchedMesh",h.perObjectFrustumCulled=this.perObjectFrustumCulled,h.sortObjects=this.sortObjects,h.drawRanges=this._drawRanges,h.reservedRanges=this._reservedRanges,h.geometryInfo=this._geometryInfo.map((f)=>({...f,boundingBox:f.boundingBox?f.boundingBox.toJSON():void 0,boundingSphere:f.boundingSphere?f.boundingSphere.toJSON():void 0})),h.instanceInfo=this._instanceInfo.map((f)=>({...f})),h.availableInstanceIds=this._availableInstanceIds.slice(),h.availableGeometryIds=this._availableGeometryIds.slice(),h.nextIndexStart=this._nextIndexStart,h.nextVertexStart=this._nextVertexStart,h.geometryCount=this._geometryCount,h.maxInstanceCount=this._maxInstanceCount,h.maxVertexCount=this._maxVertexCount,h.maxIndexCount=this._maxIndexCount,h.geometryInitialized=this._geometryInitialized,h.matricesTexture=this._matricesTexture.toJSON(o),h.indirectTexture=this._indirectTexture.toJSON(o),this._colorsTexture!==null)h.colorsTexture=this._colorsTexture.toJSON(o);if(this.boundingSphere!==null)h.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)h.boundingBox=this.boundingBox.toJSON()}function u(f,p){if(f[p.uuid]===void 0)f[p.uuid]=p.toJSON(o);return p.uuid}if(this.isScene){if(this.background){if(this.background.isColor)h.background=this.background.toJSON();else if(this.background.isTexture)h.background=this.background.toJSON(o).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)h.environment=this.environment.toJSON(o).uuid}else if(this.isMesh||this.isLine||this.isPoints){h.geometry=u(o.geometries,this.geometry);let f=this.geometry.parameters;if(f!==void 0&&f.shapes!==void 0){let p=f.shapes;if(Array.isArray(p))for(let m=0,g=p.length;m<g;m++){let x=p[m];u(o.shapes,x)}else u(o.shapes,p)}}if(this.isSkinnedMesh){if(h.bindMode=this.bindMode,h.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)u(o.skeletons,this.skeleton),h.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let f=[];for(let p=0,m=this.material.length;p<m;p++)f.push(u(o.materials,this.material[p]));h.material=f}else h.material=u(o.materials,this.material);if(this.children.length>0){h.children=[];for(let f=0;f<this.children.length;f++)h.children.push(this.children[f].toJSON(o).object)}if(this.animations.length>0){h.animations=[];for(let f=0;f<this.animations.length;f++){let p=this.animations[f];h.animations.push(u(o.animations,p))}}if(l){let f=d(o.geometries),p=d(o.materials),m=d(o.textures),g=d(o.images),x=d(o.shapes),y=d(o.skeletons),_=d(o.animations),v=d(o.nodes);if(f.length>0)c.geometries=f;if(p.length>0)c.materials=p;if(m.length>0)c.textures=m;if(g.length>0)c.images=g;if(x.length>0)c.shapes=x;if(y.length>0)c.skeletons=y;if(_.length>0)c.animations=_;if(v.length>0)c.nodes=v}return c.object=h,c;function d(f){let p=[];for(let m in f){let g=f[m];delete g.metadata,p.push(g)}return p}}clone(o){return new this.constructor().copy(this,o)}copy(o,l=!0){if(this.name=o.name,this.up.copy(o.up),this.position.copy(o.position),this.rotation.order=o.rotation.order,this.quaternion.copy(o.quaternion),this.scale.copy(o.scale),this.pivot=o.pivot!==null?o.pivot.clone():null,this.matrix.copy(o.matrix),this.matrixWorld.copy(o.matrixWorld),this.matrixAutoUpdate=o.matrixAutoUpdate,this.matrixWorldAutoUpdate=o.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=o.matrixWorldNeedsUpdate,this.layers.mask=o.layers.mask,this.visible=o.visible,this.castShadow=o.castShadow,this.receiveShadow=o.receiveShadow,this.frustumCulled=o.frustumCulled,this.renderOrder=o.renderOrder,this.static=o.static,this.animations=o.animations.slice(),this.userData=JSON.parse(JSON.stringify(o.userData)),l===!0)for(let c=0;c<o.children.length;c++){let h=o.children[c];this.add(h.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Be.DEFAULT_UP=new k(0,1,0);Be.DEFAULT_MATRIX_AUTO_UPDATE=!0;Be.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class gs extends Be{constructor(){super();this.isGroup=!0,this.type="Group"}}var Hp={type:"move"};class dr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new gs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new gs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new gs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(o){if(this._targetRay!==null)this._targetRay.dispatchEvent(o);if(this._grip!==null)this._grip.dispatchEvent(o);if(this._hand!==null)this._hand.dispatchEvent(o);return this}connect(o){if(o&&o.hand){let l=this._hand;if(l)for(let c of o.hand.values())this._getHandJoint(l,c)}return this.dispatchEvent({type:"connected",data:o}),this}disconnect(o){if(this.dispatchEvent({type:"disconnected",data:o}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(o,l,c){let h=null,u=null,d=null,f=this._targetRay,p=this._grip,m=this._hand;if(o&&l.session.visibilityState!=="visible-blurred"){if(m&&o.hand){d=!0;for(let T of o.hand.values()){let w=l.getJointPose(T,c),S=this._getHandJoint(m,T);if(w!==null)S.matrix.fromArray(w.transform.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale),S.matrixWorldNeedsUpdate=!0,S.jointRadius=w.radius;S.visible=w!==null}let g=m.joints["index-finger-tip"],x=m.joints["thumb-tip"],y=g.position.distanceTo(x.position),_=0.02,v=0.005;if(m.inputState.pinching&&y>_+v)m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:o.handedness,target:this});else if(!m.inputState.pinching&&y<=_-v)m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:o.handedness,target:this})}else if(p!==null&&o.gripSpace){if(u=l.getPose(o.gripSpace,c),u!==null){if(p.matrix.fromArray(u.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,u.linearVelocity)p.hasLinearVelocity=!0,p.linearVelocity.copy(u.linearVelocity);else p.hasLinearVelocity=!1;if(u.angularVelocity)p.hasAngularVelocity=!0,p.angularVelocity.copy(u.angularVelocity);else p.hasAngularVelocity=!1;if(p.eventsEnabled)p.dispatchEvent({type:"gripUpdated",data:o,target:this})}}if(f!==null){if(h=l.getPose(o.targetRaySpace,c),h===null&&u!==null)h=u;if(h!==null){if(f.matrix.fromArray(h.transform.matrix),f.matrix.decompose(f.position,f.quaternion,f.scale),f.matrixWorldNeedsUpdate=!0,h.linearVelocity)f.hasLinearVelocity=!0,f.linearVelocity.copy(h.linearVelocity);else f.hasLinearVelocity=!1;if(h.angularVelocity)f.hasAngularVelocity=!0,f.angularVelocity.copy(h.angularVelocity);else f.hasAngularVelocity=!1;this.dispatchEvent(Hp)}}}if(f!==null)f.visible=h!==null;if(p!==null)p.visible=u!==null;if(m!==null)m.visible=d!==null;return this}_getHandJoint(o,l){if(o.joints[l.jointName]===void 0){let c=new gs;c.matrixAutoUpdate=!1,c.visible=!1,o.joints[l.jointName]=c,o.add(c)}return o.joints[l.jointName]}}var sd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},mi={h:0,s:0,l:0},Hr={h:0,s:0,l:0};function Pa(o,l,c){if(c<0)c+=1;if(c>1)c-=1;if(c<0.16666666666666666)return o+(l-o)*6*c;if(c<0.5)return l;if(c<0.6666666666666666)return o+(l-o)*6*(0.6666666666666666-c);return o}class Kt{constructor(o,l,c){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(o,l,c)}set(o,l,c){if(l===void 0&&c===void 0){let h=o;if(h&&h.isColor)this.copy(h);else if(typeof h==="number")this.setHex(h);else if(typeof h==="string")this.setStyle(h)}else this.setRGB(o,l,c);return this}setScalar(o){return this.r=o,this.g=o,this.b=o,this}setHex(o,l="srgb"){return o=Math.floor(o),this.r=(o>>16&255)/255,this.g=(o>>8&255)/255,this.b=(o&255)/255,te.colorSpaceToWorking(this,l),this}setRGB(o,l,c,h=te.workingColorSpace){return this.r=o,this.g=l,this.b=c,te.colorSpaceToWorking(this,h),this}setHSL(o,l,c,h=te.workingColorSpace){if(o=jl(o,1),l=qt(l,0,1),c=qt(c,0,1),l===0)this.r=this.g=this.b=c;else{let u=c<=0.5?c*(1+l):c+l-c*l,d=2*c-u;this.r=Pa(d,u,o+0.3333333333333333),this.g=Pa(d,u,o),this.b=Pa(d,u,o-0.3333333333333333)}return te.colorSpaceToWorking(this,h),this}setStyle(o,l="srgb"){function c(u){if(u===void 0)return;if(parseFloat(u)<1)Bt("Color: Alpha component of "+o+" will be ignored.")}let h;if(h=/^(\w+)\(([^\)]*)\)/.exec(o)){let u,d=h[1],f=h[2];switch(d){case"rgb":case"rgba":if(u=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(f))return c(u[4]),this.setRGB(Math.min(255,parseInt(u[1],10))/255,Math.min(255,parseInt(u[2],10))/255,Math.min(255,parseInt(u[3],10))/255,l);if(u=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(f))return c(u[4]),this.setRGB(Math.min(100,parseFloat(u[1]))/100,Math.min(100,parseFloat(u[2]))/100,Math.min(100,parseFloat(u[3]))/100,l);break;case"hsl":case"hsla":if(u=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(f))return c(u[4]),this.setHSL(parseFloat(u[1])/360,parseFloat(u[2])/100,parseFloat(u[3])/100,l);break;default:Bt("Color: Unknown color model "+o)}}else if(h=/^\#([A-Fa-f\d]+)$/.exec(o)){let u=h[1],d=u.length;if(d===3)return this.setRGB(parseInt(u.charAt(0),16)/15,parseInt(u.charAt(1),16)/15,parseInt(u.charAt(2),16)/15,l);else if(d===6)return this.setHex(parseInt(u,16),l);else Bt("Color: Invalid hex color "+o)}else if(o&&o.length>0)return this.setColorName(o,l);return this}setColorName(o,l="srgb"){let c=sd[o.toLowerCase()];if(c!==void 0)this.setHex(c,l);else Bt("Color: Unknown color "+o);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(o){return this.r=o.r,this.g=o.g,this.b=o.b,this}copySRGBToLinear(o){return this.r=oi(o.r),this.g=oi(o.g),this.b=oi(o.b),this}copyLinearToSRGB(o){return this.r=_s(o.r),this.g=_s(o.g),this.b=_s(o.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(o="srgb"){return te.workingToColorSpace(nn.copy(this),o),Math.round(qt(nn.r*255,0,255))*65536+Math.round(qt(nn.g*255,0,255))*256+Math.round(qt(nn.b*255,0,255))}getHexString(o="srgb"){return("000000"+this.getHex(o).toString(16)).slice(-6)}getHSL(o,l=te.workingColorSpace){te.workingToColorSpace(nn.copy(this),l);let{r:c,g:h,b:u}=nn,d=Math.max(c,h,u),f=Math.min(c,h,u),p,m,g=(f+d)/2;if(f===d)p=0,m=0;else{let x=d-f;switch(m=g<=0.5?x/(d+f):x/(2-d-f),d){case c:p=(h-u)/x+(h<u?6:0);break;case h:p=(u-c)/x+2;break;case u:p=(c-h)/x+4;break}p/=6}return o.h=p,o.s=m,o.l=g,o}getRGB(o,l=te.workingColorSpace){return te.workingToColorSpace(nn.copy(this),l),o.r=nn.r,o.g=nn.g,o.b=nn.b,o}getStyle(o="srgb"){te.workingToColorSpace(nn.copy(this),o);let{r:l,g:c,b:h}=nn;if(o!=="srgb")return`color(${o} ${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`;return`rgb(${Math.round(l*255)},${Math.round(c*255)},${Math.round(h*255)})`}offsetHSL(o,l,c){return this.getHSL(mi),this.setHSL(mi.h+o,mi.s+l,mi.l+c)}add(o){return this.r+=o.r,this.g+=o.g,this.b+=o.b,this}addColors(o,l){return this.r=o.r+l.r,this.g=o.g+l.g,this.b=o.b+l.b,this}addScalar(o){return this.r+=o,this.g+=o,this.b+=o,this}sub(o){return this.r=Math.max(0,this.r-o.r),this.g=Math.max(0,this.g-o.g),this.b=Math.max(0,this.b-o.b),this}multiply(o){return this.r*=o.r,this.g*=o.g,this.b*=o.b,this}multiplyScalar(o){return this.r*=o,this.g*=o,this.b*=o,this}lerp(o,l){return this.r+=(o.r-this.r)*l,this.g+=(o.g-this.g)*l,this.b+=(o.b-this.b)*l,this}lerpColors(o,l,c){return this.r=o.r+(l.r-o.r)*c,this.g=o.g+(l.g-o.g)*c,this.b=o.b+(l.b-o.b)*c,this}lerpHSL(o,l){this.getHSL(mi),o.getHSL(Hr);let c=Qs(mi.h,Hr.h,l),h=Qs(mi.s,Hr.s,l),u=Qs(mi.l,Hr.l,l);return this.setHSL(c,h,u),this}setFromVector3(o){return this.r=o.x,this.g=o.y,this.b=o.z,this}applyMatrix3(o){let l=this.r,c=this.g,h=this.b,u=o.elements;return this.r=u[0]*l+u[3]*c+u[6]*h,this.g=u[1]*l+u[4]*c+u[7]*h,this.b=u[2]*l+u[5]*c+u[8]*h,this}equals(o){return o.r===this.r&&o.g===this.g&&o.b===this.b}fromArray(o,l=0){return this.r=o[l],this.g=o[l+1],this.b=o[l+2],this}toArray(o=[],l=0){return o[l]=this.r,o[l+1]=this.g,o[l+2]=this.b,o}fromBufferAttribute(o,l){return this.r=o.getX(l),this.g=o.getY(l),this.b=o.getZ(l),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var nn=new Kt;Kt.NAMES=sd;class Ao extends Be{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ai,this.environmentIntensity=1,this.environmentRotation=new ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(o,l){return super.copy(o,l),this.background=o.background!==null?o.background.clone():null,this.environment=o.environment!==null?o.environment.clone():null,this.fog=o.fog!==null?o.fog.clone():null,this.backgroundBlurriness=o.backgroundBlurriness,this.backgroundIntensity=o.backgroundIntensity,this.backgroundRotation.copy(o.backgroundRotation),this.environmentIntensity=o.environmentIntensity,this.environmentRotation.copy(o.environmentRotation),this.overrideMaterial=o.overrideMaterial!==null?o.overrideMaterial.clone():null,this.matrixAutoUpdate=o.matrixAutoUpdate,this}toJSON(o){let l=super.toJSON(o);if(this.fog!==null)l.object.fog=this.fog.toJSON();return l.object.backgroundBlurriness=this.backgroundBlurriness,l.object.backgroundIntensity=this.backgroundIntensity,l.object.backgroundRotation=this.backgroundRotation.toArray(),l.object.environmentIntensity=this.environmentIntensity,l.object.environmentRotation=this.environmentRotation.toArray(),l}}var Fn=new k,ei=new k,Ia=new k,ni=new k,rs=new k,os=new k,Uh=new k,Da=new k,La=new k,Na=new k,Ua=new Pe,Fa=new Pe,Oa=new Pe;class Fe{constructor(o=new k,l=new k,c=new k){this.a=o,this.b=l,this.c=c}static getNormal(o,l,c,h){h.subVectors(c,l),Fn.subVectors(o,l),h.cross(Fn);let u=h.lengthSq();if(u>0)return h.multiplyScalar(1/Math.sqrt(u));return h.set(0,0,0)}static getBarycoord(o,l,c,h,u){Fn.subVectors(h,l),ei.subVectors(c,l),Ia.subVectors(o,l);let d=Fn.dot(Fn),f=Fn.dot(ei),p=Fn.dot(Ia),m=ei.dot(ei),g=ei.dot(Ia),x=d*m-f*f;if(x===0)return u.set(0,0,0),null;let y=1/x,_=(m*p-f*g)*y,v=(d*g-f*p)*y;return u.set(1-_-v,v,_)}static containsPoint(o,l,c,h){if(this.getBarycoord(o,l,c,h,ni)===null)return!1;return ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getInterpolation(o,l,c,h,u,d,f,p){if(this.getBarycoord(o,l,c,h,ni)===null){if(p.x=0,p.y=0,"z"in p)p.z=0;if("w"in p)p.w=0;return null}return p.setScalar(0),p.addScaledVector(u,ni.x),p.addScaledVector(d,ni.y),p.addScaledVector(f,ni.z),p}static getInterpolatedAttribute(o,l,c,h,u,d){return Ua.setScalar(0),Fa.setScalar(0),Oa.setScalar(0),Ua.fromBufferAttribute(o,l),Fa.fromBufferAttribute(o,c),Oa.fromBufferAttribute(o,h),d.setScalar(0),d.addScaledVector(Ua,u.x),d.addScaledVector(Fa,u.y),d.addScaledVector(Oa,u.z),d}static isFrontFacing(o,l,c,h){return Fn.subVectors(c,l),ei.subVectors(o,l),Fn.cross(ei).dot(h)<0}set(o,l,c){return this.a.copy(o),this.b.copy(l),this.c.copy(c),this}setFromPointsAndIndices(o,l,c,h){return this.a.copy(o[l]),this.b.copy(o[c]),this.c.copy(o[h]),this}setFromAttributeAndIndices(o,l,c,h){return this.a.fromBufferAttribute(o,l),this.b.fromBufferAttribute(o,c),this.c.fromBufferAttribute(o,h),this}clone(){return new this.constructor().copy(this)}copy(o){return this.a.copy(o.a),this.b.copy(o.b),this.c.copy(o.c),this}getArea(){return Fn.subVectors(this.c,this.b),ei.subVectors(this.a,this.b),Fn.cross(ei).length()*0.5}getMidpoint(o){return o.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(o){return Fe.getNormal(this.a,this.b,this.c,o)}getPlane(o){return o.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(o,l){return Fe.getBarycoord(o,this.a,this.b,this.c,l)}getInterpolation(o,l,c,h,u){return Fe.getInterpolation(o,this.a,this.b,this.c,l,c,h,u)}containsPoint(o){return Fe.containsPoint(o,this.a,this.b,this.c)}isFrontFacing(o){return Fe.isFrontFacing(this.a,this.b,this.c,o)}intersectsBox(o){return o.intersectsTriangle(this)}closestPointToPoint(o,l){let c=this.a,h=this.b,u=this.c,d,f;rs.subVectors(h,c),os.subVectors(u,c),Da.subVectors(o,c);let p=rs.dot(Da),m=os.dot(Da);if(p<=0&&m<=0)return l.copy(c);La.subVectors(o,h);let g=rs.dot(La),x=os.dot(La);if(g>=0&&x<=g)return l.copy(h);let y=p*x-g*m;if(y<=0&&p>=0&&g<=0&&p-g>0)return d=p/(p-g),l.copy(c).addScaledVector(rs,d);Na.subVectors(o,u);let _=rs.dot(Na),v=os.dot(Na);if(v>=0&&_<=v)return l.copy(u);let T=_*m-p*v;if(T<=0&&m>=0&&v<=0)return f=m/(m-v),l.copy(c).addScaledVector(os,f);let w=g*v-_*x;if(w<=0&&x-g>=0&&_-v>=0)return Uh.subVectors(u,h),f=(x-g)/(x-g+(_-v)),l.copy(h).addScaledVector(Uh,f);let S=1/(w+T+y);return d=T*S,f=y*S,l.copy(c).addScaledVector(rs,d).addScaledVector(os,f)}equals(o){return o.a.equals(this.a)&&o.b.equals(this.b)&&o.c.equals(this.c)}}class _e{constructor(o=new k(1/0,1/0,1/0),l=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=o,this.max=l}set(o,l){return this.min.copy(o),this.max.copy(l),this}setFromArray(o){this.makeEmpty();for(let l=0,c=o.length;l<c;l+=3)this.expandByPoint(On.fromArray(o,l));return this}setFromBufferAttribute(o){this.makeEmpty();for(let l=0,c=o.count;l<c;l++)this.expandByPoint(On.fromBufferAttribute(o,l));return this}setFromPoints(o){this.makeEmpty();for(let l=0,c=o.length;l<c;l++)this.expandByPoint(o[l]);return this}setFromCenterAndSize(o,l){let c=On.copy(l).multiplyScalar(0.5);return this.min.copy(o).sub(c),this.max.copy(o).add(c),this}setFromObject(o,l=!1){return this.makeEmpty(),this.expandByObject(o,l)}clone(){return new this.constructor().copy(this)}copy(o){return this.min.copy(o.min),this.max.copy(o.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(o){return this.isEmpty()?o.set(0,0,0):o.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(o){return this.isEmpty()?o.set(0,0,0):o.subVectors(this.max,this.min)}expandByPoint(o){return this.min.min(o),this.max.max(o),this}expandByVector(o){return this.min.sub(o),this.max.add(o),this}expandByScalar(o){return this.min.addScalar(-o),this.max.addScalar(o),this}expandByObject(o,l=!1){o.updateWorldMatrix(!1,!1);let c=o.geometry;if(c!==void 0){let u=c.getAttribute("position");if(l===!0&&u!==void 0&&o.isInstancedMesh!==!0&&o.isBatchedMesh!==!0)for(let d=0,f=u.count;d<f;d++){if(o.isMesh===!0)o.getVertexPosition(d,On);else On.fromBufferAttribute(u,d);On.applyMatrix4(o.matrixWorld),this.expandByPoint(On)}else{if(o.boundingBox!==void 0){if(o.boundingBox===null)o.computeBoundingBox();Gr.copy(o.boundingBox)}else{if(c.boundingBox===null)c.computeBoundingBox();Gr.copy(c.boundingBox)}Gr.applyMatrix4(o.matrixWorld),this.union(Gr)}}let h=o.children;for(let u=0,d=h.length;u<d;u++)this.expandByObject(h[u],l);return this}containsPoint(o){return o.x>=this.min.x&&o.x<=this.max.x&&o.y>=this.min.y&&o.y<=this.max.y&&o.z>=this.min.z&&o.z<=this.max.z}containsBox(o){return this.min.x<=o.min.x&&o.max.x<=this.max.x&&this.min.y<=o.min.y&&o.max.y<=this.max.y&&this.min.z<=o.min.z&&o.max.z<=this.max.z}getParameter(o,l){return l.set((o.x-this.min.x)/(this.max.x-this.min.x),(o.y-this.min.y)/(this.max.y-this.min.y),(o.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(o){return o.max.x>=this.min.x&&o.min.x<=this.max.x&&o.max.y>=this.min.y&&o.min.y<=this.max.y&&o.max.z>=this.min.z&&o.min.z<=this.max.z}intersectsSphere(o){return this.clampPoint(o.center,On),On.distanceToSquared(o.center)<=o.radius*o.radius}intersectsPlane(o){let l,c;if(o.normal.x>0)l=o.normal.x*this.min.x,c=o.normal.x*this.max.x;else l=o.normal.x*this.max.x,c=o.normal.x*this.min.x;if(o.normal.y>0)l+=o.normal.y*this.min.y,c+=o.normal.y*this.max.y;else l+=o.normal.y*this.max.y,c+=o.normal.y*this.min.y;if(o.normal.z>0)l+=o.normal.z*this.min.z,c+=o.normal.z*this.max.z;else l+=o.normal.z*this.max.z,c+=o.normal.z*this.min.z;return l<=-o.constant&&c>=-o.constant}intersectsTriangle(o){if(this.isEmpty())return!1;this.getCenter(Ys),Vr.subVectors(this.max,Ys),as.subVectors(o.a,Ys),ls.subVectors(o.b,Ys),cs.subVectors(o.c,Ys),gi.subVectors(ls,as),_i.subVectors(cs,ls),Ni.subVectors(as,cs);let l=[0,-gi.z,gi.y,0,-_i.z,_i.y,0,-Ni.z,Ni.y,gi.z,0,-gi.x,_i.z,0,-_i.x,Ni.z,0,-Ni.x,-gi.y,gi.x,0,-_i.y,_i.x,0,-Ni.y,Ni.x,0];if(!Ba(l,as,ls,cs,Vr))return!1;if(l=[1,0,0,0,1,0,0,0,1],!Ba(l,as,ls,cs,Vr))return!1;return Wr.crossVectors(gi,_i),l=[Wr.x,Wr.y,Wr.z],Ba(l,as,ls,cs,Vr)}clampPoint(o,l){return l.copy(o).clamp(this.min,this.max)}distanceToPoint(o){return this.clampPoint(o,On).distanceTo(o)}getBoundingSphere(o){if(this.isEmpty())o.makeEmpty();else this.getCenter(o.center),o.radius=this.getSize(On).length()*0.5;return o}intersect(o){if(this.min.max(o.min),this.max.min(o.max),this.isEmpty())this.makeEmpty();return this}union(o){return this.min.min(o.min),this.max.max(o.max),this}applyMatrix4(o){if(this.isEmpty())return this;return ii[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(o),ii[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(o),ii[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(o),ii[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(o),ii[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(o),ii[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(o),ii[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(o),ii[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(o),this.setFromPoints(ii),this}translate(o){return this.min.add(o),this.max.add(o),this}equals(o){return o.min.equals(this.min)&&o.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(o){return this.min.fromArray(o.min),this.max.fromArray(o.max),this}}var ii=[new k,new k,new k,new k,new k,new k,new k,new k],On=new k,Gr=new _e,as=new k,ls=new k,cs=new k,gi=new k,_i=new k,Ni=new k,Ys=new k,Vr=new k,Wr=new k,Ui=new k;function Ba(o,l,c,h,u){for(let d=0,f=o.length-3;d<=f;d+=3){Ui.fromArray(o,d);let p=u.x*Math.abs(Ui.x)+u.y*Math.abs(Ui.y)+u.z*Math.abs(Ui.z),m=l.dot(Ui),g=c.dot(Ui),x=h.dot(Ui);if(Math.max(-Math.max(m,g,x),Math.min(m,g,x))>p)return!1}return!0}var Ue=new k,Xr=new Dt,Gp=0;class Ye extends qn{constructor(o,l,c=!1){super();if(Array.isArray(o))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gp++}),this.name="",this.array=o,this.itemSize=l,this.count=o!==void 0?o.length/l:0,this.normalized=c,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=o!==void 0?To(o):void 0}onUploadCallback(){}set needsUpdate(o){if(o===!0)this.version++}setUsage(o){return this.usage=o,this}addUpdateRange(o,l){this.updateRanges.push({start:o,count:l})}clearUpdateRanges(){this.updateRanges.length=0}copy(o){return this.name=o.name,this.array=new o.array.constructor(o.array),this.itemSize=o.itemSize,this.count=o.count,this.normalized=o.normalized,this.usage=o.usage,this.gpuType=o.gpuType,this._normalizationScale=o._normalizationScale,this}copyAt(o,l,c){o*=this.itemSize,c*=l.itemSize;for(let h=0,u=this.itemSize;h<u;h++)this.array[o+h]=l.array[c+h];return this}copyArray(o){return this.array.set(o),this}applyMatrix3(o){if(this.itemSize===2)for(let l=0,c=this.count;l<c;l++)Xr.fromBufferAttribute(this,l),Xr.applyMatrix3(o),this.setXY(l,Xr.x,Xr.y);else if(this.itemSize===3)for(let l=0,c=this.count;l<c;l++)Ue.fromBufferAttribute(this,l),Ue.applyMatrix3(o),this.setXYZ(l,Ue.x,Ue.y,Ue.z);return this}applyMatrix4(o){for(let l=0,c=this.count;l<c;l++)Ue.fromBufferAttribute(this,l),Ue.applyMatrix4(o),this.setXYZ(l,Ue.x,Ue.y,Ue.z);return this}applyNormalMatrix(o){for(let l=0,c=this.count;l<c;l++)Ue.fromBufferAttribute(this,l),Ue.applyNormalMatrix(o),this.setXYZ(l,Ue.x,Ue.y,Ue.z);return this}transformDirection(o){for(let l=0,c=this.count;l<c;l++)Ue.fromBufferAttribute(this,l),Ue.transformDirection(o),this.setXYZ(l,Ue.x,Ue.y,Ue.z);return this}set(o,l=0){return this.array.set(o,l),this}getComponent(o,l){let c=this.array[o*this.itemSize+l];if(this.normalized)c=this._denormalize(c);return c}setComponent(o,l,c){if(this.normalized)c=this._normalize(c);return this.array[o*this.itemSize+l]=c,this}getX(o){let l=this.array[o*this.itemSize];if(this.normalized)l=this._denormalize(l);return l}setX(o,l){if(this.normalized)l=this._normalize(l);return this.array[o*this.itemSize]=l,this}getY(o){let l=this.array[o*this.itemSize+1];if(this.normalized)l=this._denormalize(l);return l}setY(o,l){if(this.normalized)l=this._normalize(l);return this.array[o*this.itemSize+1]=l,this}getZ(o){let l=this.array[o*this.itemSize+2];if(this.normalized)l=this._denormalize(l);return l}setZ(o,l){if(this.normalized)l=this._normalize(l);return this.array[o*this.itemSize+2]=l,this}getW(o){let l=this.array[o*this.itemSize+3];if(this.normalized)l=this._denormalize(l);return l}setW(o,l){if(this.normalized)l=this._normalize(l);return this.array[o*this.itemSize+3]=l,this}setXY(o,l,c){if(o*=this.itemSize,this.normalized)l=this._normalize(l),c=this._normalize(c);return this.array[o+0]=l,this.array[o+1]=c,this}setXYZ(o,l,c,h){if(o*=this.itemSize,this.normalized)l=this._normalize(l),c=this._normalize(c),h=this._normalize(h);return this.array[o+0]=l,this.array[o+1]=c,this.array[o+2]=h,this}setXYZW(o,l,c,h,u){if(o*=this.itemSize,this.normalized)l=this._normalize(l),c=this._normalize(c),h=this._normalize(h),u=this._normalize(u);return this.array[o+0]=l,this.array[o+1]=c,this.array[o+2]=h,this.array[o+3]=u,this}onUpload(o){return this.onUploadCallback=o,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let o={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return o.name=this.name,o.usage=this.usage,o.gpuType=this.gpuType,o}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(o){let l=this._normalizationScale;return l!==void 0?Math.max(o/l,-1):tc(o,this.array)}_normalize(o){let l=this._normalizationScale;return l!==void 0?Math.round(o*l):ec(o,this.array)}}class wo extends Ye{constructor(o,l,c){super(new Uint16Array(o),l,c)}}class Ro extends Ye{constructor(o,l,c){super(new Uint32Array(o),l,c)}}class En extends Ye{constructor(o,l,c){super(new Float32Array(o),l,c)}}var Vp=new _e,Zs=new k,za=new k;class pn{constructor(o=new k,l=-1){this.isSphere=!0,this.center=o,this.radius=l}set(o,l){return this.center.copy(o),this.radius=l,this}setFromPoints(o,l){let c=this.center;if(l!==void 0)c.copy(l);else Vp.setFromPoints(o).getCenter(c);let h=0;for(let u=0,d=o.length;u<d;u++)h=Math.max(h,c.distanceToSquared(o[u]));return this.radius=Math.sqrt(h),this}copy(o){return this.center.copy(o.center),this.radius=o.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(o){return o.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(o){return o.distanceTo(this.center)-this.radius}intersectsSphere(o){let l=this.radius+o.radius;return o.center.distanceToSquared(this.center)<=l*l}intersectsBox(o){return o.intersectsSphere(this)}intersectsPlane(o){return Math.abs(o.distanceToPoint(this.center))<=this.radius}clampPoint(o,l){let c=this.center.distanceToSquared(o);if(l.copy(o),c>this.radius*this.radius)l.sub(this.center).normalize(),l.multiplyScalar(this.radius).add(this.center);return l}getBoundingBox(o){if(this.isEmpty())return o.makeEmpty(),o;return o.set(this.center,this.center),o.expandByScalar(this.radius),o}applyMatrix4(o){return this.center.applyMatrix4(o),this.radius=this.radius*o.getMaxScaleOnAxis(),this}translate(o){return this.center.add(o),this}expandByPoint(o){if(this.isEmpty())return this.center.copy(o),this.radius=0,this;Zs.subVectors(o,this.center);let l=Zs.lengthSq();if(l>this.radius*this.radius){let c=Math.sqrt(l),h=(c-this.radius)*0.5;this.center.addScaledVector(Zs,h/c),this.radius+=h}return this}union(o){if(o.isEmpty())return this;if(this.isEmpty())return this.copy(o),this;if(this.center.equals(o.center)===!0)this.radius=Math.max(this.radius,o.radius);else za.subVectors(o.center,this.center).setLength(o.radius),this.expandByPoint(Zs.copy(o.center).add(za)),this.expandByPoint(Zs.copy(o.center).sub(za));return this}equals(o){return o.center.equals(this.center)&&o.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(o){return this.radius=o.radius,this.center.fromArray(o.center),this}}var Wp=0,wn=new Yt,ka=new Be,hs=new k,Tn=new _e,Js=new _e,qe=new k;class xn extends qn{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wp++}),this.uuid=Ei(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(o){if(Array.isArray(o))this.index=new((mp(o))?Ro:wo)(o,1);else this.index=o;return this}setIndirect(o,l=0){return this.indirect=o,this.indirectOffset=l,this}getIndirect(){return this.indirect}getAttribute(o){return this.attributes[o]}setAttribute(o,l){return this.attributes[o]=l,this}deleteAttribute(o){return delete this.attributes[o],this}hasAttribute(o){return this.attributes[o]!==void 0}addGroup(o,l,c=0){this.groups.push({start:o,count:l,materialIndex:c})}clearGroups(){this.groups=[]}setDrawRange(o,l){this.drawRange.start=o,this.drawRange.count=l}applyMatrix4(o){let l=this.attributes.position;if(l!==void 0)l.applyMatrix4(o),l.needsUpdate=!0;let c=this.attributes.normal;if(c!==void 0){let u=new Gt().getNormalMatrix(o);c.applyNormalMatrix(u),c.needsUpdate=!0}let h=this.attributes.tangent;if(h!==void 0)h.transformDirection(o),h.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(o){return wn.makeRotationFromQuaternion(o),this.applyMatrix4(wn),this}rotateX(o){return wn.makeRotationX(o),this.applyMatrix4(wn),this}rotateY(o){return wn.makeRotationY(o),this.applyMatrix4(wn),this}rotateZ(o){return wn.makeRotationZ(o),this.applyMatrix4(wn),this}translate(o,l,c){return wn.makeTranslation(o,l,c),this.applyMatrix4(wn),this}scale(o,l,c){return wn.makeScale(o,l,c),this.applyMatrix4(wn),this}lookAt(o){return ka.lookAt(o),ka.updateMatrix(),this.applyMatrix4(ka.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(hs).negate(),this.translate(hs.x,hs.y,hs.z),this}setFromPoints(o){let l=this.getAttribute("position");if(l===void 0){let c=[];for(let h=0,u=o.length;h<u;h++){let d=o[h];c.push(d.x,d.y,d.z||0)}this.setAttribute("position",new En(c,3))}else{let c=Math.min(o.length,l.count);for(let h=0;h<c;h++){let u=o[h];l.setXYZ(h,u.x,u.y,u.z||0)}if(o.length>l.count)Bt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");l.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new _e;let o=this.attributes.position,l=this.morphAttributes.position;if(o&&o.isGLBufferAttribute){Ht("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(o!==void 0){if(this.boundingBox.setFromBufferAttribute(o),l)for(let c=0,h=l.length;c<h;c++){let u=l[c];if(Tn.setFromBufferAttribute(u),this.morphTargetsRelative)qe.addVectors(this.boundingBox.min,Tn.min),this.boundingBox.expandByPoint(qe),qe.addVectors(this.boundingBox.max,Tn.max),this.boundingBox.expandByPoint(qe);else this.boundingBox.expandByPoint(Tn.min),this.boundingBox.expandByPoint(Tn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Ht('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new pn;let o=this.attributes.position,l=this.morphAttributes.position;if(o&&o.isGLBufferAttribute){Ht("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(o){let c=this.boundingSphere.center;if(Tn.setFromBufferAttribute(o),l)for(let u=0,d=l.length;u<d;u++){let f=l[u];if(Js.setFromBufferAttribute(f),this.morphTargetsRelative)qe.addVectors(Tn.min,Js.min),Tn.expandByPoint(qe),qe.addVectors(Tn.max,Js.max),Tn.expandByPoint(qe);else Tn.expandByPoint(Js.min),Tn.expandByPoint(Js.max)}Tn.getCenter(c);let h=0;for(let u=0,d=o.count;u<d;u++)qe.fromBufferAttribute(o,u),h=Math.max(h,c.distanceToSquared(qe));if(l)for(let u=0,d=l.length;u<d;u++){let f=l[u],p=this.morphTargetsRelative;for(let m=0,g=f.count;m<g;m++){if(qe.fromBufferAttribute(f,m),p)hs.fromBufferAttribute(o,m),qe.add(hs);h=Math.max(h,c.distanceToSquared(qe))}}if(this.boundingSphere.radius=Math.sqrt(h),isNaN(this.boundingSphere.radius))Ht('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let o=this.index,l=this.attributes;if(o===null||l.position===void 0||l.normal===void 0||l.uv===void 0){Ht("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:c,normal:h,uv:u}=l,d=this.getAttribute("tangent");if(d===void 0||d.count!==c.count)d=new Ye(new Float32Array(4*c.count),4),this.setAttribute("tangent",d);let f=[],p=[],m=new Uint8Array(c.count);for(let R=0;R<c.count;R++)f[R]=new k,p[R]=new k;let g=new k,x=new k,y=new k,_=new Dt,v=new Dt,T=new Dt,w=new k,S=new k;function M(R,N,B){m[R]=m[N]=m[B]=1,g.fromBufferAttribute(c,R),x.fromBufferAttribute(c,N),y.fromBufferAttribute(c,B),_.fromBufferAttribute(u,R),v.fromBufferAttribute(u,N),T.fromBufferAttribute(u,B),x.sub(g),y.sub(g),v.sub(_),T.sub(_);let U=1/(v.x*T.y-T.x*v.y);if(!isFinite(U))return;w.copy(x).multiplyScalar(T.y).addScaledVector(y,-v.y).multiplyScalar(U),S.copy(y).multiplyScalar(v.x).addScaledVector(x,-T.x).multiplyScalar(U),f[R].add(w),f[N].add(w),f[B].add(w),p[R].add(S),p[N].add(S),p[B].add(S)}let E=this.groups;if(E.length===0)E=[{start:0,count:o.count}];for(let R=0,N=E.length;R<N;++R){let B=E[R],{start:U,count:z}=B;for(let W=U,O=U+z;W<O;W+=3)M(o.getX(W+0),o.getX(W+1),o.getX(W+2))}let C=new k,A=new k,P=new k,L=new k;function b(R){P.fromBufferAttribute(h,R),L.copy(P);let N=f[R];C.copy(N),C.sub(P.multiplyScalar(P.dot(N))).normalize(),A.crossVectors(L,N);let U=A.dot(p[R])<0?-1:1;d.setXYZW(R,C.x,C.y,C.z,U)}for(let R=0,N=c.count;R<N;++R)if(m[R])b(R);this._transformed=!0}computeVertexNormals(){let o=this.index,l=this.getAttribute("position");if(l!==void 0){let c=this.getAttribute("normal");if(c===void 0||c.count!==l.count)c=new Ye(new Float32Array(l.count*3),3),this.setAttribute("normal",c);else for(let y=0,_=c.count;y<_;y++)c.setXYZ(y,0,0,0);let h=new k,u=new k,d=new k,f=new k,p=new k,m=new k,g=new k,x=new k;if(o)for(let y=0,_=o.count;y<_;y+=3){let v=o.getX(y+0),T=o.getX(y+1),w=o.getX(y+2);h.fromBufferAttribute(l,v),u.fromBufferAttribute(l,T),d.fromBufferAttribute(l,w),g.subVectors(d,u),x.subVectors(h,u),g.cross(x),f.fromBufferAttribute(c,v),p.fromBufferAttribute(c,T),m.fromBufferAttribute(c,w),f.add(g),p.add(g),m.add(g),c.setXYZ(v,f.x,f.y,f.z),c.setXYZ(T,p.x,p.y,p.z),c.setXYZ(w,m.x,m.y,m.z)}else for(let y=0,_=l.count;y<_;y+=3)h.fromBufferAttribute(l,y+0),u.fromBufferAttribute(l,y+1),d.fromBufferAttribute(l,y+2),g.subVectors(d,u),x.subVectors(h,u),g.cross(x),c.setXYZ(y+0,g.x,g.y,g.z),c.setXYZ(y+1,g.x,g.y,g.z),c.setXYZ(y+2,g.x,g.y,g.z);this.normalizeNormals(),c.needsUpdate=!0}}normalizeNormals(){let o=this.attributes.normal;for(let l=0,c=o.count;l<c;l++)qe.fromBufferAttribute(o,l),qe.normalize(),o.setXYZ(l,qe.x,qe.y,qe.z)}toNonIndexed(){function o(f,p){let{array:m,itemSize:g,normalized:x}=f,y=new m.constructor(p.length*g),_=0,v=0;for(let T=0,w=p.length;T<w;T++){if(f.isInterleavedBufferAttribute)_=p[T]*f.data.stride+f.offset;else _=p[T]*g;for(let S=0;S<g;S++)y[v++]=m[_++]}return new Ye(y,g,x)}if(this.index===null)return Bt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let l=new xn,c=this.index.array,h=this.attributes;for(let f in h){let p=h[f],m=o(p,c);l.setAttribute(f,m)}let u=this.morphAttributes;for(let f in u){let p=[],m=u[f];for(let g=0,x=m.length;g<x;g++){let y=m[g],_=o(y,c);p.push(_)}l.morphAttributes[f]=p}l.morphTargetsRelative=this.morphTargetsRelative;let d=this.groups;for(let f=0,p=d.length;f<p;f++){let m=d[f];l.addGroup(m.start,m.count,m.materialIndex)}return l}toJSON(){let o={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(o.uuid=this.uuid,o.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,o.name=this.name,Object.keys(this.userData).length>0)o.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let p=this.parameters;for(let m in p)if(p[m]!==void 0)o[m]=p[m];return o}o.data={attributes:{}};let l=this.index;if(l!==null)o.data.index={type:l.array.constructor.name,array:Array.prototype.slice.call(l.array)};let c=this.attributes;for(let p in c){let m=c[p];o.data.attributes[p]=m.toJSON(o.data)}let h={},u=!1;for(let p in this.morphAttributes){let m=this.morphAttributes[p],g=[];for(let x=0,y=m.length;x<y;x++){let _=m[x];g.push(_.toJSON(o.data))}if(g.length>0)h[p]=g,u=!0}if(u)o.data.morphAttributes=h,o.data.morphTargetsRelative=this.morphTargetsRelative;let d=this.groups;if(d.length>0)o.data.groups=JSON.parse(JSON.stringify(d));let f=this.boundingSphere;if(f!==null)o.data.boundingSphere=f.toJSON();return o}clone(){return new this.constructor().copy(this)}copy(o){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let l={};this.name=o.name;let c=o.index;if(c!==null)this.setIndex(c.clone());let h=o.attributes;for(let m in h){let g=h[m];this.setAttribute(m,g.clone(l))}let u=o.morphAttributes;for(let m in u){let g=[],x=u[m];for(let y=0,_=x.length;y<_;y++)g.push(x[y].clone(l));this.morphAttributes[m]=g}this.morphTargetsRelative=o.morphTargetsRelative;let d=o.groups;for(let m=0,g=d.length;m<g;m++){let x=d[m];this.addGroup(x.start,x.count,x.materialIndex)}let f=o.boundingBox;if(f!==null)this.boundingBox=f.clone();let p=o.boundingSphere;if(p!==null)this.boundingSphere=p.clone();return this.drawRange.start=o.drawRange.start,this.drawRange.count=o.drawRange.count,this.userData=o.userData,this._transformed=o._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Co{constructor(o,l){this.isInterleavedBuffer=!0,this.array=o,this.stride=l,this.count=o!==void 0?o.length/l:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Ei()}onUploadCallback(){}set needsUpdate(o){if(o===!0)this.version++}setUsage(o){return this.usage=o,this}addUpdateRange(o,l){this.updateRanges.push({start:o,count:l})}clearUpdateRanges(){this.updateRanges.length=0}copy(o){return this.array=new o.array.constructor(o.array),this.count=o.count,this.stride=o.stride,this.usage=o.usage,this}copyAt(o,l,c){o*=this.stride,c*=l.stride;for(let h=0,u=this.stride;h<u;h++)this.array[o+h]=l.array[c+h];return this}set(o,l=0){return this.array.set(o,l),this}clone(o){if(o.arrayBuffers===void 0)o.arrayBuffers={};let l=Fh(this.array);if(o.arrayBuffers[l]===void 0)o.arrayBuffers[l]=this.array.slice(0).buffer;let c=new this.array.constructor(o.arrayBuffers[l]),h=new this.constructor(c,this.stride);return h.setUsage(this.usage),h}onUpload(o){return this.onUploadCallback=o,this}toJSON(o){if(o.arrayBuffers===void 0)o.arrayBuffers={};let l=Fh(this.array);if(o.arrayBuffers[l]===void 0)o.arrayBuffers[l]=Array.from(new Uint32Array(this.array.slice(0).buffer));let c={uuid:this.uuid,buffer:l,type:this.array.constructor.name,stride:this.stride};return c.usage=this.usage,c}}function Fh(o){if(o.buffer._uuid===void 0)o.buffer._uuid=Ei();if(o.byteOffset===0&&o.byteLength===o.buffer.byteLength)return o.buffer._uuid;return o.buffer._uuid+":"+o.byteOffset+":"+o.byteLength}var fn=new k;class Wi{constructor(o,l,c,h=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=o,this.itemSize=l,this.offset=c,this.normalized=h,this._normalizationScale=o!==void 0?To(o.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(o){this.data.needsUpdate=o}applyMatrix4(o){for(let l=0,c=this.data.count;l<c;l++)fn.fromBufferAttribute(this,l),fn.applyMatrix4(o),this.setXYZ(l,fn.x,fn.y,fn.z);return this}applyNormalMatrix(o){for(let l=0,c=this.count;l<c;l++)fn.fromBufferAttribute(this,l),fn.applyNormalMatrix(o),this.setXYZ(l,fn.x,fn.y,fn.z);return this}transformDirection(o){for(let l=0,c=this.count;l<c;l++)fn.fromBufferAttribute(this,l),fn.transformDirection(o),this.setXYZ(l,fn.x,fn.y,fn.z);return this}getComponent(o,l){let c=this.array[o*this.data.stride+this.offset+l];if(this.normalized)c=this._denormalize(c);return c}setComponent(o,l,c){if(this.normalized)c=this._normalize(c);return this.data.array[o*this.data.stride+this.offset+l]=c,this}setX(o,l){if(this.normalized)l=this._normalize(l);return this.data.array[o*this.data.stride+this.offset]=l,this}setY(o,l){if(this.normalized)l=this._normalize(l);return this.data.array[o*this.data.stride+this.offset+1]=l,this}setZ(o,l){if(this.normalized)l=this._normalize(l);return this.data.array[o*this.data.stride+this.offset+2]=l,this}setW(o,l){if(this.normalized)l=this._normalize(l);return this.data.array[o*this.data.stride+this.offset+3]=l,this}getX(o){let l=this.data.array[o*this.data.stride+this.offset];if(this.normalized)l=this._denormalize(l);return l}getY(o){let l=this.data.array[o*this.data.stride+this.offset+1];if(this.normalized)l=this._denormalize(l);return l}getZ(o){let l=this.data.array[o*this.data.stride+this.offset+2];if(this.normalized)l=this._denormalize(l);return l}getW(o){let l=this.data.array[o*this.data.stride+this.offset+3];if(this.normalized)l=this._denormalize(l);return l}setXY(o,l,c){if(o=o*this.data.stride+this.offset,this.normalized)l=this._normalize(l),c=this._normalize(c);return this.data.array[o+0]=l,this.data.array[o+1]=c,this}setXYZ(o,l,c,h){if(o=o*this.data.stride+this.offset,this.normalized)l=this._normalize(l),c=this._normalize(c),h=this._normalize(h);return this.data.array[o+0]=l,this.data.array[o+1]=c,this.data.array[o+2]=h,this}setXYZW(o,l,c,h,u){if(o=o*this.data.stride+this.offset,this.normalized)l=this._normalize(l),c=this._normalize(c),h=this._normalize(h),u=this._normalize(u);return this.data.array[o+0]=l,this.data.array[o+1]=c,this.data.array[o+2]=h,this.data.array[o+3]=u,this}clone(o){if(o===void 0){er("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let l=[];for(let c=0;c<this.count;c++){let h=c*this.data.stride+this.offset;for(let u=0;u<this.itemSize;u++)l.push(this.data.array[h+u])}return new Ye(new this.array.constructor(l),this.itemSize,this.normalized)}else{if(o.interleavedBuffers===void 0)o.interleavedBuffers={};if(o.interleavedBuffers[this.data.uuid]===void 0)o.interleavedBuffers[this.data.uuid]=this.data.clone(o);return new Wi(o.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(o){if(o===void 0){er("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let l=[];for(let c=0;c<this.count;c++){let h=c*this.data.stride+this.offset;for(let u=0;u<this.itemSize;u++)l.push(this.data.array[h+u])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:l,normalized:this.normalized}}else{if(o.interleavedBuffers===void 0)o.interleavedBuffers={};if(o.interleavedBuffers[this.data.uuid]===void 0)o.interleavedBuffers[this.data.uuid]=this.data.toJSON(o);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(o){let l=this._normalizationScale;return l!==void 0?Math.max(o/l,-1):tc(o,this.data.array)}_normalize(o){let l=this._normalizationScale;return l!==void 0?Math.round(o*l):ec(o,this.data.array)}}var Ha=new k,Xp=new k,qp=new Gt;class rn{constructor(o=new k(1,0,0),l=0){this.isPlane=!0,this.normal=o,this.constant=l}set(o,l){return this.normal.copy(o),this.constant=l,this}setComponents(o,l,c,h){return this.normal.set(o,l,c),this.constant=h,this}setFromNormalAndCoplanarPoint(o,l){return this.normal.copy(o),this.constant=-l.dot(this.normal),this}setFromCoplanarPoints(o,l,c){let h=Ha.subVectors(c,l).cross(Xp.subVectors(o,l)).normalize();return this.setFromNormalAndCoplanarPoint(h,o),this}copy(o){return this.normal.copy(o.normal),this.constant=o.constant,this}normalize(){let o=1/this.normal.length();return this.normal.multiplyScalar(o),this.constant*=o,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(o){return this.normal.dot(o)+this.constant}distanceToSphere(o){return this.distanceToPoint(o.center)-o.radius}projectPoint(o,l){return l.copy(o).addScaledVector(this.normal,-this.distanceToPoint(o))}intersectLine(o,l,c=!0){let h=o.delta(Ha),u=this.normal.dot(h);if(u===0){if(this.distanceToPoint(o.start)===0)return l.copy(o.start);return null}let d=-(o.start.dot(this.normal)+this.constant)/u;if(c===!0&&(d<0||d>1))return null;return l.copy(o.start).addScaledVector(h,d)}intersectsLine(o){let l=this.distanceToPoint(o.start),c=this.distanceToPoint(o.end);return l<0&&c>0||c<0&&l>0}intersectsBox(o){return o.intersectsPlane(this)}intersectsSphere(o){return o.intersectsPlane(this)}coplanarPoint(o){return o.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(o,l){let c=l||qp.getNormalMatrix(o),h=this.coplanarPoint(Ha).applyMatrix4(o),u=this.normal.applyMatrix3(c).normalize();return this.constant=-h.dot(u),this}translate(o){return this.constant-=o.dot(this.normal),this}equals(o){return o.normal.equals(this.normal)&&o.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(o){return this.normal.fromArray(o.normal),this.constant=o.constant,this}}var Yp=0;class hi extends qn{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Yp++}),this.uuid=Ei(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Kt(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(o){if(this._alphaTest>0!==o>0)this.version++;this._alphaTest=o}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(o){if(o===void 0)return;for(let l in o){let c=o[l];if(c===void 0){Bt(`Material: parameter '${l}' has value of undefined.`);continue}let h=this[l];if(h===void 0){Bt(`Material: '${l}' is not a property of THREE.${this.type}.`);continue}if(h&&h.isColor)h.set(c);else if(h&&h.isVector2&&(c&&c.isVector2)||h&&h.isEuler&&(c&&c.isEuler)||h&&h.isVector3&&(c&&c.isVector3))h.copy(c);else this[l]=c}}toJSON(o){let l=o===void 0||typeof o==="string";if(l)o={textures:{},images:{}};let c={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(c.uuid=this.uuid,c.type=this.type,c.blending=this.blending,c.side=this.side,c.shadowSide=this.shadowSide,c.vertexColors=this.vertexColors,c.opacity=this.opacity,c.transparent=this.transparent,c.blendSrc=this.blendSrc,c.blendDst=this.blendDst,c.blendEquation=this.blendEquation,c.blendSrcAlpha=this.blendSrcAlpha,c.blendDstAlpha=this.blendDstAlpha,c.blendEquationAlpha=this.blendEquationAlpha,c.blendColor=this.blendColor.getHex(),c.blendAlpha=this.blendAlpha,c.depthFunc=this.depthFunc,c.depthTest=this.depthTest,c.depthWrite=this.depthWrite,c.colorWrite=this.colorWrite,c.clipIntersection=this.clipIntersection,c.clipShadows=this.clipShadows,c.stencilWriteMask=this.stencilWriteMask,c.stencilFunc=this.stencilFunc,c.stencilRef=this.stencilRef,c.stencilFuncMask=this.stencilFuncMask,c.stencilFail=this.stencilFail,c.stencilZFail=this.stencilZFail,c.stencilZPass=this.stencilZPass,c.stencilWrite=this.stencilWrite,c.polygonOffset=this.polygonOffset,c.polygonOffsetFactor=this.polygonOffsetFactor,c.polygonOffsetUnits=this.polygonOffsetUnits,c.dithering=this.dithering,c.alphaTest=this.alphaTest,c.alphaHash=this.alphaHash,c.alphaToCoverage=this.alphaToCoverage,c.premultipliedAlpha=this.premultipliedAlpha,c.forceSinglePass=this.forceSinglePass,c.allowOverride=this.allowOverride,c.visible=this.visible,c.toneMapped=this.toneMapped,c.name=this.name,this.color&&this.color.isColor)c.color=this.color.getHex();if(this.roughness!==void 0)c.roughness=this.roughness;if(this.metalness!==void 0)c.metalness=this.metalness;if(this.sheen!==void 0)c.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)c.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)c.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)c.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)c.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)c.specular=this.specular.getHex();if(this.specularIntensity!==void 0)c.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)c.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)c.shininess=this.shininess;if(this.clearcoat!==void 0)c.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)c.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)c.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)c.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(o).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)c.clearcoatMap=this.clearcoatMap.toJSON(o).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)c.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(o).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)c.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(o).uuid,c.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)c.sheenColorMap=this.sheenColorMap.toJSON(o).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)c.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(o).uuid;if(this.dispersion!==void 0)c.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)c.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)c.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)c.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)c.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)c.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)c.iridescenceMap=this.iridescenceMap.toJSON(o).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)c.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(o).uuid;if(this.anisotropy!==void 0)c.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)c.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)c.anisotropyMap=this.anisotropyMap.toJSON(o).uuid;if(this.map&&this.map.isTexture)c.map=this.map.toJSON(o).uuid;if(this.matcap&&this.matcap.isTexture)c.matcap=this.matcap.toJSON(o).uuid;if(this.alphaMap&&this.alphaMap.isTexture)c.alphaMap=this.alphaMap.toJSON(o).uuid;if(this.lightMap&&this.lightMap.isTexture)c.lightMap=this.lightMap.toJSON(o).uuid,c.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)c.aoMap=this.aoMap.toJSON(o).uuid,c.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)c.bumpMap=this.bumpMap.toJSON(o).uuid,c.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)c.normalMap=this.normalMap.toJSON(o).uuid,c.normalMapType=this.normalMapType,c.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)c.displacementMap=this.displacementMap.toJSON(o).uuid,c.displacementScale=this.displacementScale,c.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)c.roughnessMap=this.roughnessMap.toJSON(o).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)c.metalnessMap=this.metalnessMap.toJSON(o).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)c.emissiveMap=this.emissiveMap.toJSON(o).uuid;if(this.specularMap&&this.specularMap.isTexture)c.specularMap=this.specularMap.toJSON(o).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)c.specularIntensityMap=this.specularIntensityMap.toJSON(o).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)c.specularColorMap=this.specularColorMap.toJSON(o).uuid;if(this.envMap&&this.envMap.isTexture){if(c.envMap=this.envMap.toJSON(o).uuid,this.combine!==void 0)c.combine=this.combine}if(this.envMapRotation!==void 0)c.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)c.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)c.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)c.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)c.gradientMap=this.gradientMap.toJSON(o).uuid;if(this.transmission!==void 0)c.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)c.transmissionMap=this.transmissionMap.toJSON(o).uuid;if(this.thickness!==void 0)c.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)c.thicknessMap=this.thicknessMap.toJSON(o).uuid;if(this.attenuationDistance!==void 0)c.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)c.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)c.size=this.size;if(this.sizeAttenuation!==void 0)c.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)c.clippingPlanes=this.clippingPlanes.map((u)=>u.toJSON());if(this.rotation!==void 0)c.rotation=this.rotation;if(this.depthPacking!==void 0)c.depthPacking=this.depthPacking;if(this.linewidth!==void 0)c.linewidth=this.linewidth;if(this.linecap!==void 0)c.linecap=this.linecap;if(this.linejoin!==void 0)c.linejoin=this.linejoin;if(this.dashSize!==void 0)c.dashSize=this.dashSize;if(this.gapSize!==void 0)c.gapSize=this.gapSize;if(this.scale!==void 0)c.scale=this.scale;if(this.wireframe!==void 0)c.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)c.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)c.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)c.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)c.flatShading=this.flatShading;if(this.fog!==void 0)c.fog=this.fog;if(Object.keys(this.userData).length>0)c.userData=this.userData;function h(u){let d=[];for(let f in u){let p=u[f];delete p.metadata,d.push(p)}return d}if(l){let u=h(o.textures),d=h(o.images);if(u.length>0)c.textures=u;if(d.length>0)c.images=d}return c}fromJSON(o,l){if(o.uuid!==void 0)this.uuid=o.uuid;if(o.name!==void 0)this.name=o.name;if(o.color!==void 0&&this.color!==void 0)this.color.setHex(o.color);if(o.roughness!==void 0)this.roughness=o.roughness;if(o.metalness!==void 0)this.metalness=o.metalness;if(o.sheen!==void 0)this.sheen=o.sheen;if(o.sheenColor!==void 0)this.sheenColor=new Kt().setHex(o.sheenColor);if(o.sheenRoughness!==void 0)this.sheenRoughness=o.sheenRoughness;if(o.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(o.emissive);if(o.specular!==void 0&&this.specular!==void 0)this.specular.setHex(o.specular);if(o.specularIntensity!==void 0)this.specularIntensity=o.specularIntensity;if(o.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(o.specularColor);if(o.shininess!==void 0)this.shininess=o.shininess;if(o.clearcoat!==void 0)this.clearcoat=o.clearcoat;if(o.clearcoatRoughness!==void 0)this.clearcoatRoughness=o.clearcoatRoughness;if(o.diffuseRoughness!==void 0)this.diffuseRoughness=o.diffuseRoughness;if(o.dispersion!==void 0)this.dispersion=o.dispersion;if(o.retroreflectivity!==void 0)this.retroreflectivity=o.retroreflectivity;if(o.iridescence!==void 0)this.iridescence=o.iridescence;if(o.iridescenceIOR!==void 0)this.iridescenceIOR=o.iridescenceIOR;if(o.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=o.iridescenceThicknessMinimum;if(o.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=o.iridescenceThicknessMaximum;if(o.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=o.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=o.iridescenceThicknessRange[1];if(o.transmission!==void 0)this.transmission=o.transmission;if(o.thickness!==void 0)this.thickness=o.thickness;if(o.attenuationDistance!==void 0)this.attenuationDistance=o.attenuationDistance;if(o.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(o.attenuationColor);if(o.anisotropy!==void 0)this.anisotropy=o.anisotropy;if(o.anisotropyRotation!==void 0)this.anisotropyRotation=o.anisotropyRotation;if(o.fog!==void 0)this.fog=o.fog;if(o.flatShading!==void 0)this.flatShading=o.flatShading;if(o.blending!==void 0)this.blending=o.blending;if(o.combine!==void 0)this.combine=o.combine;if(o.side!==void 0)this.side=o.side;if(o.shadowSide!==void 0)this.shadowSide=o.shadowSide;if(o.opacity!==void 0)this.opacity=o.opacity;if(o.transparent!==void 0)this.transparent=o.transparent;if(o.alphaTest!==void 0)this.alphaTest=o.alphaTest;if(o.alphaHash!==void 0)this.alphaHash=o.alphaHash;if(o.depthFunc!==void 0)this.depthFunc=o.depthFunc;if(o.depthTest!==void 0)this.depthTest=o.depthTest;if(o.depthWrite!==void 0)this.depthWrite=o.depthWrite;if(o.colorWrite!==void 0)this.colorWrite=o.colorWrite;if(o.clippingPlanes!==void 0)this.clippingPlanes=o.clippingPlanes.map((c)=>new rn().fromJSON(c));if(o.clipIntersection!==void 0)this.clipIntersection=o.clipIntersection;if(o.clipShadows!==void 0)this.clipShadows=o.clipShadows;if(o.depthPacking!==void 0)this.depthPacking=o.depthPacking;if(o.blendSrc!==void 0)this.blendSrc=o.blendSrc;if(o.blendDst!==void 0)this.blendDst=o.blendDst;if(o.blendEquation!==void 0)this.blendEquation=o.blendEquation;if(o.blendSrcAlpha!==void 0)this.blendSrcAlpha=o.blendSrcAlpha;if(o.blendDstAlpha!==void 0)this.blendDstAlpha=o.blendDstAlpha;if(o.blendEquationAlpha!==void 0)this.blendEquationAlpha=o.blendEquationAlpha;if(o.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(o.blendColor);if(o.blendAlpha!==void 0)this.blendAlpha=o.blendAlpha;if(o.stencilWriteMask!==void 0)this.stencilWriteMask=o.stencilWriteMask;if(o.stencilFunc!==void 0)this.stencilFunc=o.stencilFunc;if(o.stencilRef!==void 0)this.stencilRef=o.stencilRef;if(o.stencilFuncMask!==void 0)this.stencilFuncMask=o.stencilFuncMask;if(o.stencilFail!==void 0)this.stencilFail=o.stencilFail;if(o.stencilZFail!==void 0)this.stencilZFail=o.stencilZFail;if(o.stencilZPass!==void 0)this.stencilZPass=o.stencilZPass;if(o.stencilWrite!==void 0)this.stencilWrite=o.stencilWrite;if(o.wireframe!==void 0)this.wireframe=o.wireframe;if(o.wireframeLinewidth!==void 0)this.wireframeLinewidth=o.wireframeLinewidth;if(o.wireframeLinecap!==void 0)this.wireframeLinecap=o.wireframeLinecap;if(o.wireframeLinejoin!==void 0)this.wireframeLinejoin=o.wireframeLinejoin;if(o.rotation!==void 0)this.rotation=o.rotation;if(o.linewidth!==void 0)this.linewidth=o.linewidth;if(o.linecap!==void 0)this.linecap=o.linecap;if(o.linejoin!==void 0)this.linejoin=o.linejoin;if(o.dashSize!==void 0)this.dashSize=o.dashSize;if(o.gapSize!==void 0)this.gapSize=o.gapSize;if(o.scale!==void 0)this.scale=o.scale;if(o.polygonOffset!==void 0)this.polygonOffset=o.polygonOffset;if(o.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=o.polygonOffsetFactor;if(o.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=o.polygonOffsetUnits;if(o.dithering!==void 0)this.dithering=o.dithering;if(o.alphaToCoverage!==void 0)this.alphaToCoverage=o.alphaToCoverage;if(o.premultipliedAlpha!==void 0)this.premultipliedAlpha=o.premultipliedAlpha;if(o.forceSinglePass!==void 0)this.forceSinglePass=o.forceSinglePass;if(o.allowOverride!==void 0)this.allowOverride=o.allowOverride;if(o.visible!==void 0)this.visible=o.visible;if(o.toneMapped!==void 0)this.toneMapped=o.toneMapped;if(o.userData!==void 0)this.userData=o.userData;if(o.vertexColors!==void 0)if(typeof o.vertexColors==="number")this.vertexColors=o.vertexColors>0;else this.vertexColors=o.vertexColors;if(o.size!==void 0)this.size=o.size;if(o.sizeAttenuation!==void 0)this.sizeAttenuation=o.sizeAttenuation;if(o.map!==void 0)this.map=l[o.map]||null;if(o.matcap!==void 0)this.matcap=l[o.matcap]||null;if(o.alphaMap!==void 0)this.alphaMap=l[o.alphaMap]||null;if(o.bumpMap!==void 0)this.bumpMap=l[o.bumpMap]||null;if(o.bumpScale!==void 0)this.bumpScale=o.bumpScale;if(o.normalMap!==void 0)this.normalMap=l[o.normalMap]||null;if(o.normalMapType!==void 0)this.normalMapType=o.normalMapType;if(o.normalScale!==void 0){let c=o.normalScale;if(Array.isArray(c)===!1)c=[c,c];this.normalScale=new Dt().fromArray(c)}if(o.displacementMap!==void 0)this.displacementMap=l[o.displacementMap]||null;if(o.displacementScale!==void 0)this.displacementScale=o.displacementScale;if(o.displacementBias!==void 0)this.displacementBias=o.displacementBias;if(o.roughnessMap!==void 0)this.roughnessMap=l[o.roughnessMap]||null;if(o.metalnessMap!==void 0)this.metalnessMap=l[o.metalnessMap]||null;if(o.emissiveMap!==void 0)this.emissiveMap=l[o.emissiveMap]||null;if(o.emissiveIntensity!==void 0)this.emissiveIntensity=o.emissiveIntensity;if(o.specularMap!==void 0)this.specularMap=l[o.specularMap]||null;if(o.specularIntensityMap!==void 0)this.specularIntensityMap=l[o.specularIntensityMap]||null;if(o.specularColorMap!==void 0)this.specularColorMap=l[o.specularColorMap]||null;if(o.envMap!==void 0)this.envMap=l[o.envMap]||null;if(o.envMapRotation!==void 0)this.envMapRotation.fromArray(o.envMapRotation);if(o.envMapIntensity!==void 0)this.envMapIntensity=o.envMapIntensity;if(o.reflectivity!==void 0)this.reflectivity=o.reflectivity;if(o.refractionRatio!==void 0)this.refractionRatio=o.refractionRatio;if(o.lightMap!==void 0)this.lightMap=l[o.lightMap]||null;if(o.lightMapIntensity!==void 0)this.lightMapIntensity=o.lightMapIntensity;if(o.aoMap!==void 0)this.aoMap=l[o.aoMap]||null;if(o.aoMapIntensity!==void 0)this.aoMapIntensity=o.aoMapIntensity;if(o.gradientMap!==void 0)this.gradientMap=l[o.gradientMap]||null;if(o.clearcoatMap!==void 0)this.clearcoatMap=l[o.clearcoatMap]||null;if(o.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=l[o.clearcoatRoughnessMap]||null;if(o.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=l[o.clearcoatNormalMap]||null;if(o.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Dt().fromArray(o.clearcoatNormalScale);if(o.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=l[o.diffuseRoughnessMap]||null;if(o.iridescenceMap!==void 0)this.iridescenceMap=l[o.iridescenceMap]||null;if(o.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=l[o.iridescenceThicknessMap]||null;if(o.transmissionMap!==void 0)this.transmissionMap=l[o.transmissionMap]||null;if(o.thicknessMap!==void 0)this.thicknessMap=l[o.thicknessMap]||null;if(o.anisotropyMap!==void 0)this.anisotropyMap=l[o.anisotropyMap]||null;if(o.sheenColorMap!==void 0)this.sheenColorMap=l[o.sheenColorMap]||null;if(o.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=l[o.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(o){this.name=o.name,this.blending=o.blending,this.side=o.side,this.vertexColors=o.vertexColors,this.opacity=o.opacity,this.transparent=o.transparent,this.blendSrc=o.blendSrc,this.blendDst=o.blendDst,this.blendEquation=o.blendEquation,this.blendSrcAlpha=o.blendSrcAlpha,this.blendDstAlpha=o.blendDstAlpha,this.blendEquationAlpha=o.blendEquationAlpha,this.blendColor.copy(o.blendColor),this.blendAlpha=o.blendAlpha,this.depthFunc=o.depthFunc,this.depthTest=o.depthTest,this.depthWrite=o.depthWrite,this.stencilWriteMask=o.stencilWriteMask,this.stencilFunc=o.stencilFunc,this.stencilRef=o.stencilRef,this.stencilFuncMask=o.stencilFuncMask,this.stencilFail=o.stencilFail,this.stencilZFail=o.stencilZFail,this.stencilZPass=o.stencilZPass,this.stencilWrite=o.stencilWrite;let l=o.clippingPlanes,c=null;if(l!==null){let h=l.length;c=Array(h);for(let u=0;u!==h;++u)c[u]=l[u].clone()}return this.clippingPlanes=c,this.clipIntersection=o.clipIntersection,this.clipShadows=o.clipShadows,this.shadowSide=o.shadowSide,this.colorWrite=o.colorWrite,this.precision=o.precision,this.polygonOffset=o.polygonOffset,this.polygonOffsetFactor=o.polygonOffsetFactor,this.polygonOffsetUnits=o.polygonOffsetUnits,this.dithering=o.dithering,this.alphaTest=o.alphaTest,this.alphaHash=o.alphaHash,this.alphaToCoverage=o.alphaToCoverage,this.premultipliedAlpha=o.premultipliedAlpha,this.forceSinglePass=o.forceSinglePass,this.allowOverride=o.allowOverride,this.visible=o.visible,this.toneMapped=o.toneMapped,this.userData=JSON.parse(JSON.stringify(o.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(o){if(o===!0)this.version++}}var si=new k,Ga=new k,qr=new k,Yr=new k;class Yn{constructor(o=new k,l=new k(0,0,-1)){this.origin=o,this.direction=l}set(o,l){return this.origin.copy(o),this.direction.copy(l),this}copy(o){return this.origin.copy(o.origin),this.direction.copy(o.direction),this}at(o,l){return l.copy(this.origin).addScaledVector(this.direction,o)}lookAt(o){return this.direction.copy(o).sub(this.origin).normalize(),this}recast(o){return this.origin.copy(this.at(o,si)),this}closestPointToPoint(o,l){l.subVectors(o,this.origin);let c=l.dot(this.direction);if(c<0)return l.copy(this.origin);return l.copy(this.origin).addScaledVector(this.direction,c)}distanceToPoint(o){return Math.sqrt(this.distanceSqToPoint(o))}distanceSqToPoint(o){let l=si.subVectors(o,this.origin).dot(this.direction);if(l<0)return this.origin.distanceToSquared(o);return si.copy(this.origin).addScaledVector(this.direction,l),si.distanceToSquared(o)}distanceSqToSegment(o,l,c,h){Ga.copy(o).add(l).multiplyScalar(0.5),qr.copy(l).sub(o).normalize(),Yr.copy(this.origin).sub(Ga);let u=o.distanceTo(l)*0.5,d=-this.direction.dot(qr),f=Yr.dot(this.direction),p=-Yr.dot(qr),m=Yr.lengthSq(),g=Math.abs(1-d*d),x,y,_,v;if(g>0)if(x=d*p-f,y=d*f-p,v=u*g,x>=0)if(y>=-v)if(y<=v){let T=1/g;x*=T,y*=T,_=x*(x+d*y+2*f)+y*(d*x+y+2*p)+m}else y=u,x=Math.max(0,-(d*y+f)),_=-x*x+y*(y+2*p)+m;else y=-u,x=Math.max(0,-(d*y+f)),_=-x*x+y*(y+2*p)+m;else if(y<=-v)x=Math.max(0,-(-d*u+f)),y=x>0?-u:Math.min(Math.max(-u,-p),u),_=-x*x+y*(y+2*p)+m;else if(y<=v)x=0,y=Math.min(Math.max(-u,-p),u),_=y*(y+2*p)+m;else x=Math.max(0,-(d*u+f)),y=x>0?u:Math.min(Math.max(-u,-p),u),_=-x*x+y*(y+2*p)+m;else y=d>0?-u:u,x=Math.max(0,-(d*y+f)),_=-x*x+y*(y+2*p)+m;if(c)c.copy(this.origin).addScaledVector(this.direction,x);if(h)h.copy(Ga).addScaledVector(qr,y);return _}intersectSphere(o,l){if(o.radius<0)return null;si.subVectors(o.center,this.origin);let c=si.dot(this.direction),h=si.dot(si)-c*c,u=o.radius*o.radius;if(h>u)return null;let d=Math.sqrt(u-h),f=c-d,p=c+d;if(p<0)return null;if(f<0)return this.at(p,l);return this.at(f,l)}intersectsSphere(o){if(o.radius<0)return!1;return this.distanceSqToPoint(o.center)<=o.radius*o.radius}distanceToPlane(o){let l=o.normal.dot(this.direction);if(l===0){if(o.distanceToPoint(this.origin)===0)return 0;return null}let c=-(this.origin.dot(o.normal)+o.constant)/l;return c>=0?c:null}intersectPlane(o,l){let c=this.distanceToPlane(o);if(c===null)return null;return this.at(c,l)}intersectsPlane(o){let l=o.distanceToPoint(this.origin);if(l===0)return!0;if(o.normal.dot(this.direction)*l<0)return!0;return!1}intersectBox(o,l){let c,h,u,d,f,p,m=1/this.direction.x,g=1/this.direction.y,x=1/this.direction.z,y=this.origin;if(m>=0)c=(o.min.x-y.x)*m,h=(o.max.x-y.x)*m;else c=(o.max.x-y.x)*m,h=(o.min.x-y.x)*m;if(g>=0)u=(o.min.y-y.y)*g,d=(o.max.y-y.y)*g;else u=(o.max.y-y.y)*g,d=(o.min.y-y.y)*g;if(c>d||u>h)return null;if(u>c||isNaN(c))c=u;if(d<h||isNaN(h))h=d;if(x>=0)f=(o.min.z-y.z)*x,p=(o.max.z-y.z)*x;else f=(o.max.z-y.z)*x,p=(o.min.z-y.z)*x;if(c>p||f>h)return null;if(f>c||c!==c)c=f;if(p<h||h!==h)h=p;if(h<0)return null;return this.at(c>=0?c:h,l)}intersectsBox(o){return this.intersectBox(o,si)!==null}intersectTriangle(o,l,c,h,u){let d=this.origin,f=this.direction,{x:p,y:m,z:g}=f,x=o.x-d.x,y=o.y-d.y,_=o.z-d.z,v=l.x-d.x,T=l.y-d.y,w=l.z-d.z,S=c.x-d.x,M=c.y-d.y,E=c.z-d.z,C=Math.abs(p),A=Math.abs(m),P=Math.abs(g),L,b,R,N,B,U,z,W,O,q,j,X;if(C>=A&&C>=P)if(R=p,U=x,O=v,X=S,p>=0)L=m,b=g,N=y,B=_,z=T,W=w,q=M,j=E;else L=g,b=m,N=_,B=y,z=w,W=T,q=E,j=M;else if(A>=P)if(R=m,U=y,O=T,X=M,m>=0)L=g,b=p,N=_,B=x,z=w,W=v,q=E,j=S;else L=p,b=g,N=x,B=_,z=v,W=w,q=S,j=E;else if(R=g,U=_,O=w,X=E,g>=0)L=p,b=m,N=x,B=y,z=v,W=T,q=S,j=M;else L=m,b=p,N=y,B=x,z=T,W=v,q=M,j=S;if(R===0)return null;let ht=L/R,Q=b/R,rt=1/R,ct=N-ht*U,At=B-Q*U,et=z-ht*O,at=W-Q*O,Tt=q-ht*X,Nt=j-Q*X,Ut=Tt*at-Nt*et,Et=ct*Nt-At*Tt,jt=et*At-at*ct;if(h){if(Ut<0||Et<0||jt<0)return null}else if((Ut<0||Et<0||jt<0)&&(Ut>0||Et>0||jt>0))return null;let Zt=Ut+Et+jt;if(Zt===0)return null;let Pt=rt*(Ut*U+Et*O+jt*X);if(Zt>0?Pt<0:Pt>0)return null;return this.at(Pt/Zt,u)}applyMatrix4(o){return this.origin.applyMatrix4(o),this.direction.transformDirection(o),this}equals(o){return o.origin.equals(this.origin)&&o.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class oc extends hi{constructor(o){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Kt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(o)}copy(o){return super.copy(o),this.color.copy(o.color),this.map=o.map,this.lightMap=o.lightMap,this.lightMapIntensity=o.lightMapIntensity,this.aoMap=o.aoMap,this.aoMapIntensity=o.aoMapIntensity,this.specularMap=o.specularMap,this.alphaMap=o.alphaMap,this.envMap=o.envMap,this.envMapRotation.copy(o.envMapRotation),this.combine=o.combine,this.reflectivity=o.reflectivity,this.refractionRatio=o.refractionRatio,this.wireframe=o.wireframe,this.wireframeLinewidth=o.wireframeLinewidth,this.wireframeLinecap=o.wireframeLinecap,this.wireframeLinejoin=o.wireframeLinejoin,this.fog=o.fog,this}}var Oh=new Yt,Fi=new Yn,Zr=new pn,Bh=new k,Jr=new k,Kr=new k,$r=new k,Va=new k,jr=new k,zh=new k,Qr=new k;class Ke extends Be{constructor(o=new xn,l=new oc){super();this.isMesh=!0,this.type="Mesh",this.geometry=o,this.material=l,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(o,l){if(super.copy(o,l),o.morphTargetInfluences!==void 0)this.morphTargetInfluences=o.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(o.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},o.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(o.material)?o.material.slice():o.material,this.geometry=o.geometry,this}updateMorphTargets(){let l=this.geometry.morphAttributes,c=Object.keys(l);if(c.length>0){let h=l[c[0]];if(h!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,d=h.length;u<d;u++){let f=h[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=u}}}}getVertexPosition(o,l){let c=this.geometry,h=c.attributes.position,u=c.morphAttributes.position,d=c.morphTargetsRelative;l.fromBufferAttribute(h,o);let f=this.morphTargetInfluences;if(u&&f){jr.set(0,0,0);for(let p=0,m=u.length;p<m;p++){let g=f[p],x=u[p];if(g===0)continue;if(Va.fromBufferAttribute(x,o),d)jr.addScaledVector(Va,g);else jr.addScaledVector(Va.sub(l),g)}l.add(jr)}return l}intersectsFrustum(o){return o.intersectsObject(this)}raycast(o,l){let c=this.geometry,h=this.material,u=this.matrixWorld;if(h===void 0)return;if(c.boundingSphere===null)c.computeBoundingSphere();if(Zr.copy(c.boundingSphere),Zr.applyMatrix4(u),Fi.copy(o.ray).recast(o.near),Zr.containsPoint(Fi.origin)===!1){if(Fi.intersectSphere(Zr,Bh)===null)return;if(Fi.origin.distanceToSquared(Bh)>(o.far-o.near)**2)return}if(Oh.copy(u).invert(),Fi.copy(o.ray).applyMatrix4(Oh),c.boundingBox!==null){if(Fi.intersectsBox(c.boundingBox)===!1)return}this._computeIntersections(o,l,Fi)}_computeIntersections(o,l,c){let h,u=this.geometry,d=this.material,f=u.index,p=u.attributes.position,m=u.attributes.uv,g=u.attributes.uv1,x=u.attributes.normal,{groups:y,drawRange:_}=u;if(f!==null)if(Array.isArray(d))for(let v=0,T=y.length;v<T;v++){let w=y[v],S=d[w.materialIndex],M=Math.max(w.start,_.start),E=Math.min(f.count,Math.min(w.start+w.count,_.start+_.count));for(let C=M,A=E;C<A;C+=3){let P=f.getX(C),L=f.getX(C+1),b=f.getX(C+2);if(h=to(this,S,o,c,m,g,x,P,L,b),h)h.faceIndex=Math.floor(C/3),h.face.materialIndex=w.materialIndex,l.push(h)}}else{let v=Math.max(0,_.start),T=Math.min(f.count,_.start+_.count);for(let w=v,S=T;w<S;w+=3){let M=f.getX(w),E=f.getX(w+1),C=f.getX(w+2);if(h=to(this,d,o,c,m,g,x,M,E,C),h)h.faceIndex=Math.floor(w/3),l.push(h)}}else if(p!==void 0)if(Array.isArray(d))for(let v=0,T=y.length;v<T;v++){let w=y[v],S=d[w.materialIndex],M=Math.max(w.start,_.start),E=Math.min(p.count,Math.min(w.start+w.count,_.start+_.count));for(let C=M,A=E;C<A;C+=3){let P=C,L=C+1,b=C+2;if(h=to(this,S,o,c,m,g,x,P,L,b),h)h.faceIndex=Math.floor(C/3),h.face.materialIndex=w.materialIndex,l.push(h)}}else{let v=Math.max(0,_.start),T=Math.min(p.count,_.start+_.count);for(let w=v,S=T;w<S;w+=3){let M=w,E=w+1,C=w+2;if(h=to(this,d,o,c,m,g,x,M,E,C),h)h.faceIndex=Math.floor(w/3),l.push(h)}}}}function Zp(o,l,c,h,u,d,f,p){let m;if(l.side===1)m=h.intersectTriangle(f,d,u,!0,p);else m=h.intersectTriangle(u,d,f,l.side===0,p);if(m===null)return null;Qr.copy(p),Qr.applyMatrix4(o.matrixWorld);let g=c.ray.origin.distanceTo(Qr);if(g<c.near||g>c.far)return null;return{distance:g,point:Qr.clone(),object:o}}function to(o,l,c,h,u,d,f,p,m,g){o.getVertexPosition(p,Jr),o.getVertexPosition(m,Kr),o.getVertexPosition(g,$r);let x=Zp(o,l,c,h,Jr,Kr,$r,zh);if(x){let y=new k;if(Fe.getBarycoord(zh,Jr,Kr,$r,y),u)x.uv=Fe.getInterpolatedAttribute(u,p,m,g,y,new Dt);if(d)x.uv1=Fe.getInterpolatedAttribute(d,p,m,g,y,new Dt);if(f){if(x.normal=Fe.getInterpolatedAttribute(f,p,m,g,y,new k),x.normal.dot(h.direction)>0)x.normal.multiplyScalar(-1)}let _={a:p,b:m,c:g,normal:new k,materialIndex:0};Fe.getNormal(Jr,Kr,$r,_.normal),x.face=_,x.barycoord=y}return x}class xs extends Oe{constructor(o=null,l=1,c=1,h,u,d,f,p,m=1003,g=1003,x,y){super(null,d,f,p,m,g,h,u,x,y);this.isDataTexture=!0,this.image={data:o,width:l,height:c},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var Oi=new pn,Jp=new Dt(0.5,0.5),eo=new k;class yi{constructor(o=new rn,l=new rn,c=new rn,h=new rn,u=new rn,d=new rn){this.planes=[o,l,c,h,u,d]}set(o,l,c,h,u,d){let f=this.planes;return f[0].copy(o),f[1].copy(l),f[2].copy(c),f[3].copy(h),f[4].copy(u),f[5].copy(d),this}copy(o){let l=this.planes;for(let c=0;c<6;c++)l[c].copy(o.planes[c]);return this}setFromProjectionMatrix(o,l=2000,c=!1){let h=this.planes,u=o.elements,d=u[0],f=u[1],p=u[2],m=u[3],g=u[4],x=u[5],y=u[6],_=u[7],v=u[8],T=u[9],w=u[10],S=u[11],M=u[12],E=u[13],C=u[14],A=u[15];if(h[0].setComponents(m-d,_-g,S-v,A-M).normalize(),h[1].setComponents(m+d,_+g,S+v,A+M).normalize(),h[2].setComponents(m+f,_+x,S+T,A+E).normalize(),h[3].setComponents(m-f,_-x,S-T,A-E).normalize(),c)h[4].setComponents(p,y,w,C).normalize(),h[5].setComponents(m-p,_-y,S-w,A-C).normalize();else if(h[4].setComponents(m-p,_-y,S-w,A-C).normalize(),l===2000)h[5].setComponents(m+p,_+y,S+w,A+C).normalize();else if(l===2001)h[5].setComponents(p,y,w,C).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+l);return this}intersectsObject(o){if(o.boundingSphere!==void 0){if(o.boundingSphere===null)o.computeBoundingSphere();Oi.copy(o.boundingSphere).applyMatrix4(o.matrixWorld)}else{let l=o.geometry;if(l.boundingSphere===null)l.computeBoundingSphere();Oi.copy(l.boundingSphere).applyMatrix4(o.matrixWorld)}return this.intersectsSphere(Oi)}intersectsSprite(o){Oi.center.set(0,0,0);let l=Jp.distanceTo(o.center);return Oi.radius=0.7071067811865476+l,Oi.applyMatrix4(o.matrixWorld),this.intersectsSphere(Oi)}intersectsSphere(o){let l=this.planes,c=o.center,h=-o.radius;for(let u=0;u<6;u++)if(l[u].distanceToPoint(c)<h)return!1;return!0}intersectsBox(o){let l=this.planes;for(let c=0;c<6;c++){let h=l[c];if(eo.x=h.normal.x>0?o.max.x:o.min.x,eo.y=h.normal.y>0?o.max.y:o.min.y,eo.z=h.normal.z>0?o.max.z:o.min.z,h.distanceToPoint(eo)<0)return!1}return!0}containsPoint(o){let l=this.planes;for(let c=0;c<6;c++)if(l[c].distanceToPoint(o)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var kh=new Yt;class fr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(o){let l=o.cameras,c=this._frustums;for(let h=0;h<l.length;h++){let u=l[h];if(kh.multiplyMatrices(u.projectionMatrix,u.matrixWorldInverse),c[h]===void 0)c[h]=new yi;c[h].setFromProjectionMatrix(kh,u.coordinateSystem,u.reversedDepth)}return this._count=l.length,this}getFrustum(o){return this._frustums[o]}intersectsObject(o){let l=this._frustums;for(let c=0;c<this._count;c++)if(l[c].intersectsObject(o))return!0;return!1}intersectsSprite(o){let l=this._frustums;for(let c=0;c<this._count;c++)if(l[c].intersectsSprite(o))return!0;return!1}intersectsSphere(o){let l=this._frustums;for(let c=0;c<this._count;c++)if(l[c].intersectsSphere(o))return!0;return!1}intersectsBox(o){let l=this._frustums;for(let c=0;c<this._count;c++)if(l[c].intersectsBox(o))return!0;return!1}containsPoint(o){let l=this._frustums;for(let c=0;c<this._count;c++)if(l[c].containsPoint(o))return!0;return!1}copy(o){this.coordinateSystem=o.coordinateSystem;let l=this._frustums,c=o._frustums;for(let h=0;h<o._count;h++){if(l[h]===void 0)l[h]=new yi;l[h].copy(c[h])}return this._count=o._count,this}clone(){return new fr().copy(this)}}function Wa(o,l){return o-l}function Kp(o,l){return o.z-l.z}function $p(o,l){return l.z-o.z}class rd{constructor(){this.index=0,this.pool=[],this.list=[]}push(o,l,c,h){let u=this.pool,d=this.list;if(this.index>=u.length)u.push({start:-1,count:-1,z:-1,index:-1});let f=u[this.index];d.push(f),this.index++,f.start=o,f.count=l,f.z=c,f.index=h}reset(){this.list.length=0,this.index=0}}var gn=new Yt,jp=new Kt(1,1,1),Qp=new yi,tm=new fr,no=new _e,Bi=new pn,Xa=new k,Hh=new k,Gh=new k,em=new k,qa=new rd,sn=new Ke,io=[];function nm(o,l,c=0){let h=l.itemSize;if(o.isInterleavedBufferAttribute||o.array.constructor!==l.array.constructor){let u=o.count;for(let d=0;d<u;d++)for(let f=0;f<h;f++)l.setComponent(d+c,f,o.getComponent(d,f))}else l.array.set(o.array,c*h);l.needsUpdate=!0}function Gn(o,l){if(o.constructor!==l.constructor){let c=Math.min(o.length,l.length);for(let h=0;h<c;h++)l[h]=o[h]}else{let c=Math.min(o.length,l.length);l.set(new o.constructor(o.buffer,0,c))}}class Po extends Ke{constructor(o,l,c=l*2,h){super(new xn,h);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=o,this._maxVertexCount=l,this._maxIndexCount=c,this._multiDrawCounts=new Int32Array(o),this._multiDrawStarts=new Int32Array(o),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(o),this._mergedDrawStarts=new Int32Array(o),this._mergedDrawInstanceCounts=new Int32Array(o),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let o=Math.sqrt(this._maxInstanceCount*4);o=Math.ceil(o/4)*4,o=Math.max(o,4);let l=new Float32Array(o*o*4),c=new xs(l,o,o,1023,1015);this._matricesTexture=c}_initIndirectTexture(){let o=Math.sqrt(this._maxInstanceCount);o=Math.ceil(o);let l=new Uint32Array(o*o),c=new xs(l,o,o,1029,1014);this._indirectTexture=c}_initColorsTexture(){let o=Math.sqrt(this._maxInstanceCount);o=Math.ceil(o);let l=new Float32Array(o*o*4).fill(1),c=new xs(l,o,o,1023,1015);c.colorSpace=te.workingColorSpace,this._colorsTexture=c}_initializeGeometry(o){let l=this.geometry,c=this._maxVertexCount,h=this._maxIndexCount;if(this._geometryInitialized===!1){for(let u in o.attributes){let d=o.getAttribute(u),{array:f,itemSize:p,normalized:m}=d,g=new f.constructor(c*p),x=new Ye(g,p,m);l.setAttribute(u,x)}if(o.getIndex()!==null){let u=c>65535?new Uint32Array(h):new Uint16Array(h);l.setIndex(new Ye(u,1))}this._geometryInitialized=!0}}_validateGeometry(o){let l=this.geometry;if(Boolean(o.getIndex())!==Boolean(l.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let c in l.attributes){if(!o.hasAttribute(c))throw Error(`THREE.BatchedMesh: Added geometry missing "${c}". All geometries must have consistent attributes.`);let h=o.getAttribute(c),u=l.getAttribute(c);if(h.itemSize!==u.itemSize||h.normalized!==u.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${c}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(o){let l=this._instanceInfo;if(o<0||o>=l.length||l[o].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${o}. Instance is either out of range or has been deleted.`)}validateGeometryId(o){let l=this._geometryInfo;if(o<0||o>=l.length||l[o].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${o}. Geometry is either out of range or has been deleted.`)}setCustomSort(o){return this.customSort=o,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new _e;let o=this.boundingBox,l=this._instanceInfo;o.makeEmpty();for(let c=0,h=l.length;c<h;c++){if(l[c].active===!1)continue;let u=l[c].geometryIndex;this.getMatrixAt(c,gn),this.getBoundingBoxAt(u,no).applyMatrix4(gn),o.union(no)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new pn;let o=this.boundingSphere,l=this._instanceInfo;o.makeEmpty();for(let c=0,h=l.length;c<h;c++){if(l[c].active===!1)continue;let u=l[c].geometryIndex;this.getMatrixAt(c,gn),this.getBoundingSphereAt(u,Bi).applyMatrix4(gn),o.union(Bi)}}addInstance(o){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let c={visible:!0,active:!0,geometryIndex:o},h=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Wa),h=this._availableInstanceIds.shift(),this._instanceInfo[h]=c;else h=this._instanceInfo.length,this._instanceInfo.push(c);let u=this._matricesTexture;gn.identity().toArray(u.image.data,h*16),u.needsUpdate=!0;let d=this._colorsTexture;if(d)jp.toArray(d.image.data,h*4),d.needsUpdate=!0;return this._visibilityChanged=!0,h}addGeometry(o,l=-1,c=-1){this._initializeGeometry(o),this._validateGeometry(o);let h={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},u=this._geometryInfo;h.vertexStart=this._nextVertexStart,h.reservedVertexCount=l===-1?o.getAttribute("position").count:l;let d=o.getIndex();if(d!==null)h.indexStart=this._nextIndexStart,h.reservedIndexCount=c===-1?d.count:c;if(h.indexStart!==-1&&h.indexStart+h.reservedIndexCount>this._maxIndexCount||h.vertexStart+h.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let p;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Wa),p=this._availableGeometryIds.shift(),u[p]=h;else p=this._geometryCount,this._geometryCount++,u.push(h);return this.setGeometryAt(p,o),this._nextIndexStart=h.indexStart+h.reservedIndexCount,this._nextVertexStart=h.vertexStart+h.reservedVertexCount,p}setGeometryAt(o,l){if(o>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(l);let c=this.geometry,h=c.getIndex()!==null,u=c.getIndex(),d=l.getIndex(),f=this._geometryInfo[o];if(h&&d.count>f.reservedIndexCount||l.attributes.position.count>f.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:p,reservedVertexCount:m}=f;f.vertexCount=l.getAttribute("position").count;for(let g in c.attributes){let x=l.getAttribute(g),y=c.getAttribute(g);nm(x,y,p);let _=x.itemSize;for(let v=x.count,T=m;v<T;v++){let w=p+v;for(let S=0;S<_;S++)y.setComponent(w,S,0)}y.needsUpdate=!0,y.addUpdateRange(p*_,m*_)}if(h){let{indexStart:g,reservedIndexCount:x}=f;f.indexCount=l.getIndex().count;for(let y=0;y<d.count;y++)u.setX(g+y,p+d.getX(y));for(let y=d.count,_=x;y<_;y++)u.setX(g+y,p);u.needsUpdate=!0,u.addUpdateRange(g,f.reservedIndexCount)}if(f.start=h?f.indexStart:f.vertexStart,f.count=h?f.indexCount:f.vertexCount,f.boundingBox=null,l.boundingBox!==null)f.boundingBox=l.boundingBox.clone();if(f.boundingSphere=null,l.boundingSphere!==null)f.boundingSphere=l.boundingSphere.clone();return this._visibilityChanged=!0,o}deleteGeometry(o){let l=this._geometryInfo;if(o>=l.length||l[o].active===!1)return this;let c=this._instanceInfo;for(let h=0,u=c.length;h<u;h++)if(c[h].active&&c[h].geometryIndex===o)this.deleteInstance(h);return l[o].active=!1,this._availableGeometryIds.push(o),this._visibilityChanged=!0,this}deleteInstance(o){return this.validateInstanceId(o),this._instanceInfo[o].active=!1,this._availableInstanceIds.push(o),this._visibilityChanged=!0,this}optimize(){let o=0,l=0,c=this._geometryInfo,h=c.map((d,f)=>f).sort((d,f)=>c[d].vertexStart-c[f].vertexStart),u=this.geometry;for(let d=0,f=c.length;d<f;d++){let p=h[d],m=c[p];if(m.active===!1)continue;if(u.index!==null){if(m.indexStart!==l){let{indexStart:g,vertexStart:x,reservedIndexCount:y}=m,_=u.index,v=_.array,T=o-x;for(let w=g;w<g+y;w++)v[w]=v[w]+T;_.array.copyWithin(l,g,g+y),_.addUpdateRange(l,y),_.needsUpdate=!0,m.indexStart=l}l+=m.reservedIndexCount}if(m.vertexStart!==o){let{vertexStart:g,reservedVertexCount:x}=m,y=u.attributes;for(let _ in y){let v=y[_],{array:T,itemSize:w}=v;T.copyWithin(o*w,g*w,(g+x)*w),v.addUpdateRange(o*w,x*w),v.needsUpdate=!0}m.vertexStart=o}o+=m.reservedVertexCount,m.start=u.index?m.indexStart:m.vertexStart}return this._nextIndexStart=l,this._nextVertexStart=o,this._visibilityChanged=!0,this}getBoundingBoxAt(o,l){if(o>=this._geometryCount)return null;let c=this.geometry,h=this._geometryInfo[o];if(h.boundingBox===null){let u=new _e,d=c.index,f=c.attributes.position;for(let p=h.start,m=h.start+h.count;p<m;p++){let g=p;if(d)g=d.getX(g);u.expandByPoint(Xa.fromBufferAttribute(f,g))}h.boundingBox=u}return l.copy(h.boundingBox),l}getBoundingSphereAt(o,l){if(o>=this._geometryCount)return null;let c=this.geometry,h=this._geometryInfo[o];if(h.boundingSphere===null){let u=new pn;this.getBoundingBoxAt(o,no),no.getCenter(u.center);let d=c.index,f=c.attributes.position,p=0;for(let m=h.start,g=h.start+h.count;m<g;m++){let x=m;if(d)x=d.getX(x);Xa.fromBufferAttribute(f,x),p=Math.max(p,u.center.distanceToSquared(Xa))}u.radius=Math.sqrt(p),h.boundingSphere=u}return l.copy(h.boundingSphere),l}setMatrixAt(o,l){this.validateInstanceId(o);let c=this._matricesTexture,h=this._matricesTexture.image.data;return l.toArray(h,o*16),c.needsUpdate=!0,this}getMatrixAt(o,l){return this.validateInstanceId(o),l.fromArray(this._matricesTexture.image.data,o*16)}setColorAt(o,l){if(this.validateInstanceId(o),this._colorsTexture===null)this._initColorsTexture();return l.toArray(this._colorsTexture.image.data,o*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(o,l){if(this.validateInstanceId(o),this._colorsTexture===null)if(l.isVector4)return l.set(1,1,1,1);else return l.setRGB(1,1,1);else return l.fromArray(this._colorsTexture.image.data,o*4)}setVisibleAt(o,l){if(this.validateInstanceId(o),this._instanceInfo[o].visible===l)return this;return this._instanceInfo[o].visible=l,this._visibilityChanged=!0,this}getVisibleAt(o){return this.validateInstanceId(o),this._instanceInfo[o].visible}setGeometryIdAt(o,l){return this.validateInstanceId(o),this.validateGeometryId(l),this._instanceInfo[o].geometryIndex=l,this._visibilityChanged=!0,this}getGeometryIdAt(o){return this.validateInstanceId(o),this._instanceInfo[o].geometryIndex}getGeometryRangeAt(o,l={}){this.validateGeometryId(o);let c=this._geometryInfo[o];return l.vertexStart=c.vertexStart,l.vertexCount=c.vertexCount,l.reservedVertexCount=c.reservedVertexCount,l.indexStart=c.indexStart,l.indexCount=c.indexCount,l.reservedIndexCount=c.reservedIndexCount,l.start=c.start,l.count=c.count,l}setInstanceCount(o){let l=this._availableInstanceIds,c=this._instanceInfo;l.sort(Wa);while(l[l.length-1]===c.length-1)c.pop(),l.pop();if(o<c.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${o} are being used. Cannot shrink instance count.`);let h=new Int32Array(o),u=new Int32Array(o);Gn(this._multiDrawCounts,h),Gn(this._multiDrawStarts,u),this._multiDrawCounts=h,this._multiDrawStarts=u;let d=new Int32Array(o),f=new Int32Array(o),p=new Int32Array(o);Gn(this._mergedDrawCounts,d),Gn(this._mergedDrawStarts,f),Gn(this._mergedDrawInstanceCounts,p),this._mergedDrawCounts=d,this._mergedDrawStarts=f,this._mergedDrawInstanceCounts=p,this._maxInstanceCount=o;let m=this._indirectTexture,g=this._matricesTexture,x=this._colorsTexture;if(m.dispose(),this._initIndirectTexture(),Gn(m.image.data,this._indirectTexture.image.data),g.dispose(),this._initMatricesTexture(),Gn(g.image.data,this._matricesTexture.image.data),x)x.dispose(),this._initColorsTexture(),Gn(x.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(o,l){let c=[...this._geometryInfo].filter((f)=>f.active);if(Math.max(...c.map((f)=>f.vertexStart+f.reservedVertexCount))>o)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${o}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...c.map((p)=>p.indexStart+p.reservedIndexCount))>l)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${l}. Cannot shrink further.`)}let u=this.geometry;if(u.dispose(),this._maxVertexCount=o,this._maxIndexCount=l,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new xn,this._initializeGeometry(u);let d=this.geometry;if(u.index)Gn(u.index.array,d.index.array);for(let f in u.attributes)Gn(u.attributes[f].array,d.attributes[f].array);this._visibilityChanged=!0}raycast(o,l){let c=this._instanceInfo,h=this._geometryInfo,u=this.matrixWorld,d=this.geometry;if(sn.material=this.material,sn.geometry.index=d.index,sn.geometry.attributes=d.attributes,sn.geometry.boundingBox===null)sn.geometry.boundingBox=new _e;if(sn.geometry.boundingSphere===null)sn.geometry.boundingSphere=new pn;for(let f=0,p=c.length;f<p;f++){if(!c[f].visible||!c[f].active)continue;let m=c[f].geometryIndex,g=h[m];sn.geometry.setDrawRange(g.start,g.count),this.getMatrixAt(f,sn.matrixWorld).premultiply(u),this.getBoundingBoxAt(m,sn.geometry.boundingBox),this.getBoundingSphereAt(m,sn.geometry.boundingSphere),sn.raycast(o,io);for(let x=0,y=io.length;x<y;x++){let _=io[x];_.object=this,_.batchId=f,l.push(_)}io.length=0}sn.material=null,sn.geometry.index=null,sn.geometry.attributes={},sn.geometry.setDrawRange(0,1/0)}copy(o){if(super.copy(o),this.geometry=o.geometry.clone(),this.perObjectFrustumCulled=o.perObjectFrustumCulled,this.sortObjects=o.sortObjects,this.boundingBox=o.boundingBox!==null?o.boundingBox.clone():null,this.boundingSphere=o.boundingSphere!==null?o.boundingSphere.clone():null,this._geometryInfo=o._geometryInfo.map((l)=>({...l,boundingBox:l.boundingBox!==null?l.boundingBox.clone():null,boundingSphere:l.boundingSphere!==null?l.boundingSphere.clone():null})),this._instanceInfo=o._instanceInfo.map((l)=>({...l})),this._availableInstanceIds=o._availableInstanceIds.slice(),this._availableGeometryIds=o._availableGeometryIds.slice(),this._nextIndexStart=o._nextIndexStart,this._nextVertexStart=o._nextVertexStart,this._geometryCount=o._geometryCount,this._maxInstanceCount=o._maxInstanceCount,this._maxVertexCount=o._maxVertexCount,this._maxIndexCount=o._maxIndexCount,this._geometryInitialized=o._geometryInitialized,this._multiDrawCounts=o._multiDrawCounts.slice(),this._multiDrawStarts=o._multiDrawStarts.slice(),this._multiDrawBytesPerElement=o._multiDrawBytesPerElement,this._mergedDrawCounts=o._mergedDrawCounts.slice(),this._mergedDrawStarts=o._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=o._mergedDrawInstanceCounts.slice(),this._indirectTexture=o._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=o._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),o._colorsTexture!==null)this._colorsTexture=o._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(o,l,c,h="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let u=l.getIndex(),d=u===null?1:u.array.BYTES_PER_ELEMENT,f=1;if(c.wireframe)f=2,d=l.attributes.position.count>65535?4:2;let p=this._instanceInfo,m=this._multiDrawStarts,g=this._multiDrawCounts,x=this._mergedDrawStarts,y=this._mergedDrawCounts,_=this._mergedDrawInstanceCounts,v=this._geometryInfo,T=this.perObjectFrustumCulled,w=this._indirectTexture,S=w.image.data,M=o.isArrayCamera?tm:Qp;if(T)if(o.isArrayCamera)M.setFromArrayCamera(o);else gn.multiplyMatrices(o.projectionMatrix,o.matrixWorldInverse).multiply(this.matrixWorld),M.setFromProjectionMatrix(gn,o.coordinateSystem,o.reversedDepth);let E=0,C=0;if(this.sortObjects){gn.copy(this.matrixWorld).invert(),Hh.setFromMatrixPosition(o.matrixWorld).applyMatrix4(gn),Gh.set(0,0,-1).transformDirection(o.matrixWorld).transformDirection(gn);for(let L=0,b=p.length;L<b;L++)if(p[L].visible&&p[L].active){let R=p[L].geometryIndex;this.getMatrixAt(L,gn),this.getBoundingSphereAt(R,Bi).applyMatrix4(gn);let N=!1;if(T)N=!M.intersectsSphere(Bi);if(!N){let B=v[R],U=em.subVectors(Bi.center,Hh).dot(Gh);qa.push(B.start,B.count,U,L)}}let A=qa.list,P=this.customSort;if(P===null)A.sort(c.transparent?$p:Kp);else P.call(this,A,o);for(let L=0,b=A.length;L<b;L++){let R=A[L],N=R.start*d*f,B=R.count*f;if(h==="merged")if(C>0&&x[C-1]===N&&y[C-1]===B)_[C-1]++;else x[C]=N,y[C]=B,_[C]=1,C++;else m[E]=N,g[E]=B;S[E]=R.index,E++}qa.reset()}else for(let A=0,P=p.length;A<P;A++)if(p[A].visible&&p[A].active){let L=p[A].geometryIndex,b=!1;if(T)this.getMatrixAt(A,gn),this.getBoundingSphereAt(L,Bi).applyMatrix4(gn),b=!M.intersectsSphere(Bi);if(!b){let R=v[L],N=R.start*d*f,B=R.count*f;if(h==="merged")if(C>0&&x[C-1]===N&&y[C-1]===B)_[C-1]++;else x[C]=N,y[C]=B,_[C]=1,C++;else m[E]=N,g[E]=B;S[E]=A,E++}}w.needsUpdate=!0,this._multiDrawCount=E,this._mergedDrawCount=C,this._multiDrawBytesPerElement=d,this._visibilityChanged=!1}onBeforeRender(o,l,c,h,u){if(o.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(c,h,u)}onBeforeShadow(o,l,c,h,u,d){if(o.isWebGPURenderer!==!0)this._updateDrawParameters(h,u,d)}}class ac extends hi{constructor(o){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Kt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(o)}copy(o){return super.copy(o),this.color.copy(o.color),this.map=o.map,this.linewidth=o.linewidth,this.linecap=o.linecap,this.linejoin=o.linejoin,this.fog=o.fog,this}}var fo=new k,po=new k,Vh=new Yt,Ks=new Yn,so=new pn,Ya=new k,Wh=new k;class Xi extends Be{constructor(o=new xn,l=new ac){super();this.isLine=!0,this.type="Line",this.geometry=o,this.material=l,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(o,l){if(super.copy(o,l),o.morphTargetInfluences!==void 0)this.morphTargetInfluences=o.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(o.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},o.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(o.material)?o.material.slice():o.material,this.geometry=o.geometry,this}computeLineDistances(){let o=this.geometry;if(o.index===null){let l=o.attributes.position,c=[0];for(let h=1,u=l.count;h<u;h++)fo.fromBufferAttribute(l,h-1),po.fromBufferAttribute(l,h),c[h]=c[h-1],c[h]+=fo.distanceTo(po);o.setAttribute("lineDistance",new En(c,1))}else Bt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(o){return o.intersectsObject(this)}raycast(o,l){let c=this.geometry,h=this.matrixWorld,u=o.params.Line.threshold,d=c.drawRange;if(c.boundingSphere===null)c.computeBoundingSphere();if(so.copy(c.boundingSphere),so.applyMatrix4(h),so.radius+=u,o.ray.intersectsSphere(so)===!1)return;Vh.copy(h).invert(),Ks.copy(o.ray).applyMatrix4(Vh);let f=u/((this.scale.x+this.scale.y+this.scale.z)/3),p=f*f,m=this.isLineSegments?2:1,g=c.index,y=c.attributes.position;if(g!==null){let _=Math.max(0,d.start),v=Math.min(g.count,d.start+d.count);for(let T=_,w=v-1;T<w;T+=m){let S=g.getX(T),M=g.getX(T+1),E=ro(this,o,Ks,p,S,M,T);if(E)l.push(E)}if(this.isLineLoop){let T=g.getX(v-1),w=g.getX(_),S=ro(this,o,Ks,p,T,w,v-1);if(S)l.push(S)}}else{let _=Math.max(0,d.start),v=Math.min(y.count,d.start+d.count);for(let T=_,w=v-1;T<w;T+=m){let S=ro(this,o,Ks,p,T,T+1,T);if(S)l.push(S)}if(this.isLineLoop){let T=ro(this,o,Ks,p,v-1,_,v-1);if(T)l.push(T)}}}updateMorphTargets(){let l=this.geometry.morphAttributes,c=Object.keys(l);if(c.length>0){let h=l[c[0]];if(h!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,d=h.length;u<d;u++){let f=h[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=u}}}}}function ro(o,l,c,h,u,d,f){let p=o.geometry.attributes.position;if(fo.fromBufferAttribute(p,u),po.fromBufferAttribute(p,d),c.distanceSqToSegment(fo,po,Ya,Wh)>h)return;Ya.applyMatrix4(o.matrixWorld);let g=l.ray.origin.distanceTo(Ya);if(g<l.near||g>l.far)return;return{distance:g,point:Wh.clone().applyMatrix4(o.matrixWorld),index:f,face:null,faceIndex:null,barycoord:null,object:o}}var Xh=new k,qh=new k;class pr extends Xi{constructor(o,l){super(o,l);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let o=this.geometry;if(o.index===null){let l=o.attributes.position,c=[];for(let h=0,u=l.count;h<u;h+=2)Xh.fromBufferAttribute(l,h),qh.fromBufferAttribute(l,h+1),c[h]=h===0?0:c[h-1],c[h+1]=c[h]+Xh.distanceTo(qh);o.setAttribute("lineDistance",new En(c,1))}else Bt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class mr extends Xi{constructor(o,l){super(o,l);this.isLineLoop=!0,this.type="LineLoop"}}class lc extends hi{constructor(o){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Kt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(o)}copy(o){return super.copy(o),this.color.copy(o.color),this.map=o.map,this.alphaMap=o.alphaMap,this.size=o.size,this.sizeAttenuation=o.sizeAttenuation,this.fog=o.fog,this}}var Yh=new Yt,Ka=new Yn,oo=new pn,ao=new k;class gr extends Be{constructor(o=new xn,l=new lc){super();this.isPoints=!0,this.type="Points",this.geometry=o,this.material=l,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(o,l){if(super.copy(o,l),o.morphTargetInfluences!==void 0)this.morphTargetInfluences=o.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(o.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},o.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(o.material)?o.material.slice():o.material,this.geometry=o.geometry,this}intersectsFrustum(o){return o.intersectsObject(this)}raycast(o,l){let c=this.geometry,h=this.matrixWorld,u=o.params.Points.threshold,d=c.drawRange;if(c.boundingSphere===null)c.computeBoundingSphere();if(oo.copy(c.boundingSphere),oo.applyMatrix4(h),oo.radius+=u,o.ray.intersectsSphere(oo)===!1)return;Yh.copy(h).invert(),Ka.copy(o.ray).applyMatrix4(Yh);let f=u/((this.scale.x+this.scale.y+this.scale.z)/3),p=f*f,m=c.index,x=c.attributes.position;if(m!==null){let y=Math.max(0,d.start),_=Math.min(m.count,d.start+d.count);for(let v=y,T=_;v<T;v++){let w=m.getX(v);ao.fromBufferAttribute(x,w),Zh(ao,w,p,h,o,l,this)}}else{let y=Math.max(0,d.start),_=Math.min(x.count,d.start+d.count);for(let v=y,T=_;v<T;v++)ao.fromBufferAttribute(x,v),Zh(ao,v,p,h,o,l,this)}}updateMorphTargets(){let l=this.geometry.morphAttributes,c=Object.keys(l);if(c.length>0){let h=l[c[0]];if(h!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let u=0,d=h.length;u<d;u++){let f=h[u].name||String(u);this.morphTargetInfluences.push(0),this.morphTargetDictionary[f]=u}}}}}function Zh(o,l,c,h,u,d,f){let p=Ka.distanceSqToPoint(o);if(p<c){let m=new k;Ka.closestPointToPoint(o,m),m.applyMatrix4(h);let g=u.ray.origin.distanceTo(m);if(g<u.near||g>u.far)return;d.push({distance:g,distanceToRay:Math.sqrt(p),point:m,index:l,face:null,faceIndex:null,barycoord:null,object:f})}}class _r extends Oe{constructor(o=[],l,c,h,u,d,f,p,m,g,x,y){super(null,d,f,p,m,g,h,u,x,y);this.isCompressedTexture=!0,this.image={width:l,height:c},this.mipmaps=o,this.flipY=!1,this.generateMipmaps=!1}}class Io extends Oe{constructor(o=[],l=301,c,h,u,d,f,p,m,g){super(o,l,c,h,u,d,f,p,m,g);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(o){this.image=o}}class Ai extends Oe{constructor(o,l,c=1014,h,u,d,f=1003,p=1003,m,g=1026,x=1){if(g!==1026&&g!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let y={width:o,height:l,depth:x};super(y,h,u,d,f,p,g,c,m);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(o){return super.copy(o),this.source=new hr(Object.assign({},o.image)),this.compareFunction=o.compareFunction,this}toJSON(o){let l=super.toJSON(o);return l.compareFunction=this.compareFunction,l}}class Do extends Ai{constructor(o,l=1014,c=301,h,u,d=1003,f=1003,p,m=1026){let g={width:o,height:o,depth:1},x=[g,g,g,g,g,g];super(o,o,l,c,h,u,d,f,p,m);this.image=x,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(o){this.image=o}}class Lo extends Oe{constructor(o=null){super();this.sourceTexture=o,this.isExternalTexture=!0}copy(o){return super.copy(o),this.sourceTexture=o.sourceTexture,this}}class Rs extends xn{constructor(o=1,l=1,c=1,h=1,u=1,d=1){super();this.type="BoxGeometry",this.parameters={width:o,height:l,depth:c,widthSegments:h,heightSegments:u,depthSegments:d};let f=this;h=Math.floor(h),u=Math.floor(u),d=Math.floor(d);let p=[],m=[],g=[],x=[],y=0,_=0;v("z","y","x",-1,-1,c,l,o,d,u,0),v("z","y","x",1,-1,c,l,-o,d,u,1),v("x","z","y",1,1,o,c,l,h,d,2),v("x","z","y",1,-1,o,c,-l,h,d,3),v("x","y","z",1,-1,o,l,c,h,u,4),v("x","y","z",-1,-1,o,l,-c,h,u,5),this.setIndex(p),this.setAttribute("position",new En(m,3)),this.setAttribute("normal",new En(g,3)),this.setAttribute("uv",new En(x,2));function v(T,w,S,M,E,C,A,P,L,b,R){let N=C/L,B=A/b,U=C/2,z=A/2,W=P/2,O=L+1,q=b+1,j=0,X=0,ht=new k;for(let Q=0;Q<q;Q++){let rt=Q*B-z;for(let ct=0;ct<O;ct++){let At=ct*N-U;ht[T]=At*M,ht[w]=rt*E,ht[S]=W,m.push(ht.x,ht.y,ht.z),ht[T]=0,ht[w]=0,ht[S]=P>0?1:-1,g.push(ht.x,ht.y,ht.z),x.push(ct/L),x.push(1-Q/b),j+=1}}for(let Q=0;Q<b;Q++)for(let rt=0;rt<L;rt++){let ct=y+rt+O*Q,At=y+rt+O*(Q+1),et=y+(rt+1)+O*(Q+1),at=y+(rt+1)+O*Q;p.push(ct,At,at),p.push(At,et,at),X+=6}f.addGroup(_,X,R),_+=X,y+=j}}copy(o){return super.copy(o),this.parameters=Object.assign({},o.parameters),this}static fromJSON(o){return new Rs(o.width,o.height,o.depth,o.widthSegments,o.heightSegments,o.depthSegments)}}class xr extends xn{constructor(o=1,l=1,c=1,h=1){super();this.type="PlaneGeometry",this.parameters={width:o,height:l,widthSegments:c,heightSegments:h};let u=o/2,d=l/2,f=Math.floor(c),p=Math.floor(h),m=f+1,g=p+1,x=o/f,y=l/p,_=[],v=[],T=[],w=[];for(let S=0;S<g;S++){let M=S*y-d;for(let E=0;E<m;E++){let C=E*x-u;v.push(C,-M,0),T.push(0,0,1),w.push(E/f),w.push(1-S/p)}}for(let S=0;S<p;S++)for(let M=0;M<f;M++){let E=M+m*S,C=M+m*(S+1),A=M+1+m*(S+1),P=M+1+m*S;_.push(E,C,P),_.push(C,A,P)}this.setIndex(_),this.setAttribute("position",new En(v,3)),this.setAttribute("normal",new En(T,3)),this.setAttribute("uv",new En(w,2))}copy(o){return super.copy(o),this.parameters=Object.assign({},o.parameters),this}static fromJSON(o){return new xr(o.width,o.height,o.widthSegments,o.heightSegments)}}function qi(o){let l={};for(let c in o){l[c]={};for(let h in o[c]){let u=o[c][h];if(Jh(u))if(u.isRenderTargetTexture)Bt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),l[c][h]=null;else l[c][h]=u.clone();else if(Array.isArray(u))if(Jh(u[0])){let d=[];for(let f=0,p=u.length;f<p;f++)d[f]=u[f].clone();l[c][h]=d}else l[c][h]=u.slice();else l[c][h]=u}}return l}function an(o){let l={};for(let c=0;c<o.length;c++){let h=qi(o[c]);for(let u in h)l[u]=h[u]}return l}function Jh(o){return o&&(o.isColor||o.isMatrix3||o.isMatrix4||o.isVector2||o.isVector3||o.isVector4||o.isTexture||o.isQuaternion)}function im(o){let l=[];for(let c=0;c<o.length;c++)l.push(o[c].clone());return l}function cc(o){let l=o.getRenderTarget();if(l===null)return o.outputColorSpace;if(l.isXRRenderTarget===!0)return l.texture.colorSpace;return te.workingColorSpace}var od={clone:qi,merge:an},sm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ui extends hi{constructor(o){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sm,this.fragmentShader=rm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,o!==void 0)this.setValues(o)}copy(o){return super.copy(o),this.fragmentShader=o.fragmentShader,this.vertexShader=o.vertexShader,this.uniforms=qi(o.uniforms),this.uniformsGroups=im(o.uniformsGroups),this.defines=Object.assign({},o.defines),this.wireframe=o.wireframe,this.wireframeLinewidth=o.wireframeLinewidth,this.fog=o.fog,this.lights=o.lights,this.clipping=o.clipping,this.extensions=Object.assign({},o.extensions),this.glslVersion=o.glslVersion,this.defaultAttributeValues=Object.assign({},o.defaultAttributeValues),this.index0AttributeName=o.index0AttributeName,this.uniformsNeedUpdate=o.uniformsNeedUpdate,this}toJSON(o){let l=super.toJSON(o);l.glslVersion=this.glslVersion,l.uniforms={};for(let h in this.uniforms){let d=this.uniforms[h].value;if(d&&d.isTexture)l.uniforms[h]={type:"t",value:d.toJSON(o).uuid};else if(d&&d.isColor)l.uniforms[h]={type:"c",value:d.getHex()};else if(d&&d.isVector2)l.uniforms[h]={type:"v2",value:d.toArray()};else if(d&&d.isVector3)l.uniforms[h]={type:"v3",value:d.toArray()};else if(d&&d.isVector4)l.uniforms[h]={type:"v4",value:d.toArray()};else if(d&&d.isMatrix3)l.uniforms[h]={type:"m3",value:d.toArray()};else if(d&&d.isMatrix4)l.uniforms[h]={type:"m4",value:d.toArray()};else l.uniforms[h]={value:d}}if(Object.keys(this.defines).length>0)l.defines=this.defines;l.vertexShader=this.vertexShader,l.fragmentShader=this.fragmentShader,l.lights=this.lights,l.clipping=this.clipping;let c={};for(let h in this.extensions)if(this.extensions[h]===!0)c[h]=!0;if(Object.keys(c).length>0)l.extensions=c;return l}fromJSON(o,l){if(super.fromJSON(o,l),o.uniforms!==void 0)for(let c in o.uniforms){let h=o.uniforms[c];switch(this.uniforms[c]={},h.type){case"t":this.uniforms[c].value=l[h.value]||null;break;case"c":this.uniforms[c].value=new Kt().setHex(h.value);break;case"v2":this.uniforms[c].value=new Dt().fromArray(h.value);break;case"v3":this.uniforms[c].value=new k().fromArray(h.value);break;case"v4":this.uniforms[c].value=new Pe().fromArray(h.value);break;case"m3":this.uniforms[c].value=new Gt().fromArray(h.value);break;case"m4":this.uniforms[c].value=new Yt().fromArray(h.value);break;default:this.uniforms[c].value=h.value}}if(o.defines!==void 0)this.defines=o.defines;if(o.vertexShader!==void 0)this.vertexShader=o.vertexShader;if(o.fragmentShader!==void 0)this.fragmentShader=o.fragmentShader;if(o.glslVersion!==void 0)this.glslVersion=o.glslVersion;if(o.extensions!==void 0)for(let c in o.extensions)this.extensions[c]=o.extensions[c];if(o.lights!==void 0)this.lights=o.lights;if(o.clipping!==void 0)this.clipping=o.clipping;return this}}class hc extends ui{constructor(o){super(o);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class No extends hi{constructor(o){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Kt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Kt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ai,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(o)}copy(o){return super.copy(o),this.color.copy(o.color),this.map=o.map,this.lightMap=o.lightMap,this.lightMapIntensity=o.lightMapIntensity,this.aoMap=o.aoMap,this.aoMapIntensity=o.aoMapIntensity,this.emissive.copy(o.emissive),this.emissiveMap=o.emissiveMap,this.emissiveIntensity=o.emissiveIntensity,this.bumpMap=o.bumpMap,this.bumpScale=o.bumpScale,this.normalMap=o.normalMap,this.normalMapType=o.normalMapType,this.normalScale.copy(o.normalScale),this.displacementMap=o.displacementMap,this.displacementScale=o.displacementScale,this.displacementBias=o.displacementBias,this.specularMap=o.specularMap,this.alphaMap=o.alphaMap,this.envMap=o.envMap,this.envMapRotation.copy(o.envMapRotation),this.combine=o.combine,this.reflectivity=o.reflectivity,this.envMapIntensity=o.envMapIntensity,this.refractionRatio=o.refractionRatio,this.wireframe=o.wireframe,this.wireframeLinewidth=o.wireframeLinewidth,this.wireframeLinecap=o.wireframeLinecap,this.wireframeLinejoin=o.wireframeLinejoin,this.flatShading=o.flatShading,this.fog=o.fog,this}}class uc extends hi{constructor(o){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(o)}copy(o){return super.copy(o),this.depthPacking=o.depthPacking,this.map=o.map,this.alphaMap=o.alphaMap,this.displacementMap=o.displacementMap,this.displacementScale=o.displacementScale,this.displacementBias=o.displacementBias,this.wireframe=o.wireframe,this.wireframeLinewidth=o.wireframeLinewidth,this}}class dc extends hi{constructor(o){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(o)}copy(o){return super.copy(o),this.map=o.map,this.alphaMap=o.alphaMap,this.displacementMap=o.displacementMap,this.displacementScale=o.displacementScale,this.displacementBias=o.displacementBias,this}}function us(o,l){if(!o||o.constructor===l)return o;if(typeof l.BYTES_PER_ELEMENT==="number")return new l(o);return Array.prototype.slice.call(o)}function lo(o){return o!==void 0&&o.inTangents!==void 0&&o.outTangents!==void 0}class Yi{constructor(o,l,c,h){this.parameterPositions=o,this._cachedIndex=0,this.resultBuffer=h!==void 0?h:new l.constructor(c),this.sampleValues=l,this.valueSize=c,this.settings=null,this.DefaultSettings_={}}evaluate(o){let l=this.parameterPositions,c=this._cachedIndex,h=l[c],u=l[c-1];n:{t:{let d;e:{i:if(!(o<h)){for(let f=c+2;;){if(h===void 0){if(o<u)break i;return c=l.length,this._cachedIndex=c,this.copySampleValue_(c-1)}if(c===f)break;if(u=h,h=l[++c],o<h)break t}d=l.length;break e}if(!(o>=u)){let f=l[1];if(o<f)c=2,u=f;for(let p=c-2;;){if(u===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(c===p)break;if(h=u,u=l[--c-1],o>=u)break t}d=c,c=0;break e}break n}while(c<d){let f=c+d>>>1;if(o<l[f])d=f;else c=f+1}if(h=l[c],u=l[c-1],u===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(h===void 0)return c=l.length,this._cachedIndex=c,this.copySampleValue_(c-1)}this._cachedIndex=c,this.intervalChanged_(c,u,h)}return this.interpolate_(c,u,o,h)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(o){let l=this.resultBuffer,c=this.sampleValues,h=this.valueSize,u=o*h;for(let d=0;d!==h;++d)l[d]=c[u+d];return l}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class fc extends Yi{constructor(o,l,c,h){super(o,l,c,h);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(o,l,c){let h=this.parameterPositions,u=o-2,d=o+1,f=h[u],p=h[d];if(f===void 0)switch(this.getSettings_().endingStart){case 2401:u=o,f=2*l-c;break;case 2402:u=h.length-2,f=l+h[u]-h[u+1];break;default:u=o,f=c}if(p===void 0)switch(this.getSettings_().endingEnd){case 2401:d=o,p=2*c-l;break;case 2402:d=1,p=c+h[1]-h[0];break;default:d=o-1,p=l}let m=(c-l)*0.5,g=this.valueSize;this._weightPrev=m/(l-f),this._weightNext=m/(p-c),this._offsetPrev=u*g,this._offsetNext=d*g}interpolate_(o,l,c,h){let u=this.resultBuffer,d=this.sampleValues,f=this.valueSize,p=o*f,m=p-f,g=this._offsetPrev,x=this._offsetNext,y=this._weightPrev,_=this._weightNext,v=(c-l)/(h-l),T=v*v,w=T*v,S=-y*w+2*y*T-y*v,M=(1+y)*w+(-1.5-2*y)*T+(-0.5+y)*v+1,E=(-1-_)*w+(1.5+_)*T+0.5*v,C=_*w-_*T;for(let A=0;A!==f;++A)u[A]=S*d[g+A]+M*d[m+A]+E*d[p+A]+C*d[x+A];return u}}class pc extends Yi{constructor(o,l,c,h){super(o,l,c,h)}interpolate_(o,l,c,h){let u=this.resultBuffer,d=this.sampleValues,f=this.valueSize,p=o*f,m=p-f,g=(c-l)/(h-l),x=1-g;for(let y=0;y!==f;++y)u[y]=d[m+y]*x+d[p+y]*g;return u}}class mc extends Yi{constructor(o,l,c,h){super(o,l,c,h)}interpolate_(o){return this.copySampleValue_(o-1)}}class gc extends Yi{interpolate_(o,l,c,h){let u=this.resultBuffer,d=this.sampleValues,f=this.valueSize,p=o*f,m=p-f,g=this.inTangents,x=this.outTangents;if(!g||!x){let v=(c-l)/(h-l),T=1-v;for(let w=0;w!==f;++w)u[w]=d[m+w]*T+d[p+w]*v;return u}let y=f*2,_=o-1;for(let v=0;v!==f;++v){let T=d[m+v],w=d[p+v],S=_*y+v*2,M=x[S],E=x[S+1],C=o*y+v*2,A=g[C],P=g[C+1],L=am(c,l,M,A,h);u[v]=ad(L,T,E,P,w)}return u}}function ad(o,l,c,h,u){let d=1-o;return d*d*d*l+3*d*d*o*c+3*d*o*o*h+o*o*o*u}function om(o,l,c,h,u){let d=1-o;return 3*d*d*(c-l)+6*d*o*(h-c)+3*o*o*(u-h)}function am(o,l,c,h,u){let d=(o-l)/(u-l);for(let f=0;f<8;f++){let p=ad(d,l,c,h,u)-o;if(Math.abs(p)<0.0000000001)break;let m=om(d,l,c,h,u);if(Math.abs(m)<0.0000000001)break;d=Math.max(0,Math.min(1,d-p/m))}return d}class Dn{constructor(o,l,c,h){if(o===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(l===void 0||l.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+o);this.name=o,this.times=us(l,this.TimeBufferType),this.values=us(c,this.ValueBufferType),this.setInterpolation(h||this.DefaultInterpolation)}static toJSON(o){let l=o.constructor,c;if(l.toJSON!==this.toJSON)c=l.toJSON(o);else{c={name:o.name,times:us(o.times,Array),values:us(o.values,Array)};let h=o.getInterpolation();if(h!==o.DefaultInterpolation)c.interpolation=h;if(lo(o.settings))c.settings={inTangents:us(o.settings.inTangents,Array),outTangents:us(o.settings.outTangents,Array)}}return c.type=o.ValueTypeName,c}InterpolantFactoryMethodDiscrete(o){return new mc(this.times,this.values,this.getValueSize(),o)}InterpolantFactoryMethodLinear(o){return new pc(this.times,this.values,this.getValueSize(),o)}InterpolantFactoryMethodSmooth(o){return new fc(this.times,this.values,this.getValueSize(),o)}InterpolantFactoryMethodBezier(o){let l=new gc(this.times,this.values,this.getValueSize(),o);if(this.settings)l.inTangents=this.settings.inTangents,l.outTangents=this.settings.outTangents;return l}setInterpolation(o){let l;switch(o){case 2300:l=this.InterpolantFactoryMethodDiscrete;break;case 2301:l=this.InterpolantFactoryMethodLinear;break;case 2302:l=this.InterpolantFactoryMethodSmooth;break;case 2303:l=this.InterpolantFactoryMethodBezier;break}if(l===void 0){let c="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(o!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(c);return Bt("KeyframeTrack:",c),this}return this.createInterpolant=l,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(o){if(o!==0){let l=this.times;for(let c=0,h=l.length;c!==h;++c)l[c]+=o;if(lo(this.settings))Kh(this.settings.inTangents,o),Kh(this.settings.outTangents,o)}return this}scale(o){if(o!==1){let l=this.times;for(let c=0,h=l.length;c!==h;++c)l[c]*=o;if(lo(this.settings))$h(this.settings.inTangents,o),$h(this.settings.outTangents,o)}return this}trim(o,l){let c=this.times,h=c.length,u=0,d=h-1;while(u!==h&&c[u]<o)++u;while(d!==-1&&c[d]>l)--d;if(++d,u!==0||d!==h){if(u>=d)d=Math.max(d,1),u=d-1;let f=this.getValueSize();this.times=c.slice(u,d),this.values=this.values.slice(u*f,d*f)}return this}validate(){let o=!0,l=this.getValueSize();if(l-Math.floor(l)!==0)Ht("KeyframeTrack: Invalid value size in track.",this),o=!1;let c=this.times,h=this.values,u=c.length;if(u===0)Ht("KeyframeTrack: Track is empty.",this),o=!1;let d=null;for(let f=0;f!==u;f++){let p=c[f];if(typeof p==="number"&&isNaN(p)){Ht("KeyframeTrack: Time is not a valid number.",this,f,p),o=!1;break}if(d!==null&&d>p){Ht("KeyframeTrack: Out of order keys.",this,f,p,d),o=!1;break}d=p}if(h!==void 0){if(gp(h))for(let f=0,p=h.length;f!==p;++f){let m=h[f];if(isNaN(m)){Ht("KeyframeTrack: Value is not a valid number.",this,f,m),o=!1;break}}}return o}optimize(){let o=this.times.slice(),l=this.values.slice(),c=this.getValueSize(),h=this.getInterpolation()===2302,u=o.length-1,d=1;for(let f=1;f<u;++f){let p=!1,m=o[f],g=o[f+1];if(m!==g&&(f!==1||m!==o[0]))if(!h){let x=f*c,y=x-c,_=x+c;for(let v=0;v!==c;++v){let T=l[x+v];if(T!==l[y+v]||T!==l[_+v]){p=!0;break}}}else p=!0;if(p){if(f!==d){o[d]=o[f];let x=f*c,y=d*c;for(let _=0;_!==c;++_)l[y+_]=l[x+_]}++d}}if(u>0){o[d]=o[u];for(let f=u*c,p=d*c,m=0;m!==c;++m)l[p+m]=l[f+m];++d}if(d!==o.length)this.times=o.slice(0,d),this.values=l.slice(0,d*c);else this.times=o,this.values=l;return this}clone(){let o=this.times.slice(),l=this.values.slice(),h=new this.constructor(this.name,o,l);if(h.createInterpolant=this.createInterpolant,lo(this.settings))h.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return h}}function Kh(o,l){for(let c=0,h=o.length;c!==h;c+=2)o[c]+=l}function $h(o,l){for(let c=0,h=o.length;c!==h;c+=2)o[c]*=l}Dn.prototype.ValueTypeName="";Dn.prototype.TimeBufferType=Float32Array;Dn.prototype.ValueBufferType=Float32Array;Dn.prototype.DefaultInterpolation=2301;class Zi extends Dn{constructor(o,l,c){super(o,l,c)}}Zi.prototype.ValueTypeName="bool";Zi.prototype.ValueBufferType=Array;Zi.prototype.DefaultInterpolation=2300;Zi.prototype.InterpolantFactoryMethodLinear=void 0;Zi.prototype.InterpolantFactoryMethodSmooth=void 0;class _c extends Dn{constructor(o,l,c,h){super(o,l,c,h)}}_c.prototype.ValueTypeName="color";class xc extends Dn{constructor(o,l,c,h){super(o,l,c,h)}}xc.prototype.ValueTypeName="number";class yc extends Yi{constructor(o,l,c,h){super(o,l,c,h)}interpolate_(o,l,c,h){let u=this.resultBuffer,d=this.sampleValues,f=this.valueSize,p=(c-l)/(h-l),m=o*f;for(let g=m+f;m!==g;m+=4)Pn.slerpFlat(u,0,d,m-f,d,m,p);return u}}class Uo extends Dn{constructor(o,l,c,h){super(o,l,c,h)}InterpolantFactoryMethodLinear(o){return new yc(this.times,this.values,this.getValueSize(),o)}}Uo.prototype.ValueTypeName="quaternion";Uo.prototype.InterpolantFactoryMethodSmooth=void 0;class Ji extends Dn{constructor(o,l,c){super(o,l,c)}}Ji.prototype.ValueTypeName="string";Ji.prototype.ValueBufferType=Array;Ji.prototype.DefaultInterpolation=2300;Ji.prototype.InterpolantFactoryMethodLinear=void 0;Ji.prototype.InterpolantFactoryMethodSmooth=void 0;class vc extends Dn{constructor(o,l,c,h){super(o,l,c,h)}}vc.prototype.ValueTypeName="vector";var $a={enabled:!1,files:{},add:function(o,l){if(this.enabled===!1)return;if(jh(o))return;this.files[o]=l},get:function(o){if(this.enabled===!1)return;if(jh(o))return;return this.files[o]},remove:function(o){delete this.files[o]},clear:function(){this.files={}}};function jh(o){try{let l=o.slice(o.indexOf(":")+1);return new URL(l).protocol==="blob:"}catch(l){return!1}}class Sc{constructor(o,l,c){let h=this,u=!1,d=0,f=0,p=void 0,m=[];this.onStart=void 0,this.onLoad=o,this.onProgress=l,this.onError=c,this._abortController=null,this.itemStart=function(g){if(f++,u===!1){if(h.onStart!==void 0)h.onStart(g,d,f)}u=!0},this.itemEnd=function(g){if(d++,h.onProgress!==void 0)h.onProgress(g,d,f);if(d===f){if(u=!1,h.onLoad!==void 0)h.onLoad()}},this.itemError=function(g){if(h.onError!==void 0)h.onError(g)},this.resolveURL=function(g){if(g=g.normalize("NFC"),p)return p(g);return g},this.setURLModifier=function(g){return p=g,this},this.addHandler=function(g,x){return m.push(g,x),this},this.removeHandler=function(g){let x=m.indexOf(g);if(x!==-1)m.splice(x,2);return this},this.getHandler=function(g){for(let x=0,y=m.length;x<y;x+=2){let _=m[x],v=m[x+1];if(_.global)_.lastIndex=0;if(_.test(g))return v}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var ld=new Sc;class yr{constructor(o){if(this.manager=o!==void 0?o:ld,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(o,l){let c=this;return new Promise(function(h,u){c.load(o,h,l,u)})}parse(){}setCrossOrigin(o){return this.crossOrigin=o,this}setWithCredentials(o){return this.withCredentials=o,this}setPath(o){return this.path=o,this}setResourcePath(o){return this.resourcePath=o,this}setRequestHeader(o){return this.requestHeader=o,this}setPriority(o){return this.priority=o,this}setCache(o){return this.cache=o,this}abort(){return this}}yr.DEFAULT_MATERIAL_NAME="__DEFAULT";var ri={};class cd extends Error{constructor(o,l){super(o);this.response=l}}class Mc extends yr{constructor(o){super(o);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(o,l,c,h){if(o===void 0)o="";if(this.path!==void 0)o=this.path+o;o=this.manager.resolveURL(o);let u=$a.get(`file:${o}`);if(u!==void 0){this.manager.itemStart(o),setTimeout(()=>{if(l)l(u);this.manager.itemEnd(o)},0);return}if(ri[o]!==void 0){ri[o].push({onLoad:l,onProgress:c,onError:h});return}ri[o]=[],ri[o].push({onLoad:l,onProgress:c,onError:h});let d=new Request(o,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),f=this.mimeType,p=this.responseType;fetch(d).then((m)=>{if(m.status===200||m.status===0){if(m.status===0)Bt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||m.body===void 0||m.body.getReader===void 0)return m;let g=ri[o],x=m.body.getReader(),y=m.headers.get("X-File-Size")||m.headers.get("Content-Length"),_=y?parseInt(y):0,v=_!==0,T=0,w=new ReadableStream({start(S){M();function M(){x.read().then(({done:E,value:C})=>{if(E)S.close();else{T+=C.byteLength;let A=new ProgressEvent("progress",{lengthComputable:v,loaded:T,total:_});for(let P=0,L=g.length;P<L;P++){let b=g[P];if(b.onProgress)b.onProgress(A)}S.enqueue(C),M()}},(E)=>{S.error(E)})}}});return new Response(w)}else throw new cd(`fetch for "${m.url}" responded with ${m.status}: ${m.statusText}`,m)}).then((m)=>{switch(p){case"arraybuffer":return m.arrayBuffer();case"blob":return m.blob();case"document":return m.text().then((g)=>new DOMParser().parseFromString(g,f));case"json":return m.json();default:if(f==="")return m.text();else{let x=/charset="?([^;"\s]*)"?/i.exec(f),y=x&&x[1]?x[1].toLowerCase():void 0,_=new TextDecoder(y);return m.arrayBuffer().then((v)=>_.decode(v))}}}).then((m)=>{$a.add(`file:${o}`,m);let g=ri[o];delete ri[o];for(let x=0,y=g.length;x<y;x++){let _=g[x];if(_.onLoad)_.onLoad(m)}}).catch((m)=>{let g=ri[o];if(g===void 0)throw this.manager.itemError(o),m;delete ri[o];for(let x=0,y=g.length;x<y;x++){let _=g[x];if(_.onError)_.onError(m)}this.manager.itemError(o)}).finally(()=>{this.manager.itemEnd(o)}),this.manager.itemStart(o)}setResponseType(o){return this.responseType=o,this}setMimeType(o){return this.mimeType=o,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Fo extends yr{constructor(o){super(o)}load(o,l,c,h){let u=this,d=[],f=new _r,p=new Mc(this.manager);p.setPriority(this.priority),p.setCache(this.cache),p.setPath(this.path),p.setResponseType("arraybuffer"),p.setRequestHeader(this.requestHeader),p.setWithCredentials(u.withCredentials);let m=0;function g(x){p.load(o[x],function(y){let _=u.parse(y,!0);if(d[x]={width:_.width,height:_.height,format:_.format,mipmaps:_.mipmaps},m+=1,m===6){if(_.mipmapCount===1)f.minFilter=1006;if(f.image=d,f.format=_.format,f.needsUpdate=!0,l)l(f)}},c,h)}if(Array.isArray(o))for(let x=0,y=o.length;x<y;++x)g(x);else p.load(o,function(x){let y=u.parse(x,!0);if(y.isCubemap){let _=y.mipmaps.length/y.mipmapCount;for(let v=0;v<_;v++){d[v]={mipmaps:[]};for(let T=0;T<y.mipmapCount;T++)d[v].mipmaps.push(y.mipmaps[v*y.mipmapCount+T]),d[v].format=y.format,d[v].width=y.width,d[v].height=y.height}f.image=d}else f.image.width=y.width,f.image.height=y.height,f.mipmaps=y.mipmaps;if(y.mipmapCount===1)f.minFilter=1006;if(f.format=y.format,f.needsUpdate=!0,l)l(f)},c,h);return f}}class Oo extends Be{static registerNode(o){this.prototype._lightNode=o}constructor(o,l=1){super();this.isLight=!0,this.type="Light",this.color=new Kt(o),this.intensity=l}copy(o,l){return super.copy(o,l),this.color.copy(o.color),this.intensity=o.intensity,this}toJSON(o){let l=super.toJSON(o);return l.object.color=this.color.getHex(),l.object.intensity=this.intensity,l}}var Za=new Yt,Qh=new k,tu=new k;class bc{constructor(o){this.camera=o,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Dt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Yt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new yi,this._frameExtents=new Dt(1,1),this._viewportCount=1,this._viewports=[new Pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(o){let l=this.camera;Qh.setFromMatrixPosition(o.matrixWorld),l.position.copy(Qh),tu.setFromMatrixPosition(o.target.matrixWorld),l.lookAt(tu),l.updateMatrixWorld(),this._updateMatrix(l,this.matrix,this._frustum)}_updateMatrix(o,l,c,h){Za.multiplyMatrices(o.projectionMatrix,o.matrixWorldInverse),c.setFromProjectionMatrix(Za,o.coordinateSystem,o.reversedDepth);let u=this._frameExtents,d=h?h.z/u.x:1,f=h?h.w/u.y:1,p=h?h.x/u.x:0,m=h?h.y/u.y:0;if(o.coordinateSystem===2001||o.reversedDepth)l.set(0.5*d,0,0,0.5*d+p,0,0.5*f,0,0.5*f+m,0,0,1,0,0,0,0,1);else l.set(0.5*d,0,0,0.5*d+p,0,0.5*f,0,0.5*f+m,0,0,0.5,0.5,0,0,0,1);l.multiply(Za)}getViewport(o){return this._viewports[o]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(o){return this.camera=o.camera.clone(),this.intensity=o.intensity,this.bias=o.bias,this.radius=o.radius,this.autoUpdate=o.autoUpdate,this.needsUpdate=o.needsUpdate,this.normalBias=o.normalBias,this.blurSamples=o.blurSamples,this.mapSize.copy(o.mapSize),this.mapType=o.mapType,this.biasNode=o.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let o={};return o.intensity=this.intensity,o.bias=this.bias,o.normalBias=this.normalBias,o.radius=this.radius,o.blurSamples=this.blurSamples,o.mapSize=this.mapSize.toArray(),o.mapType=this.mapType,o.camera=this.camera.toJSON(!1).object,delete o.camera.matrix,o}}var co=new k,ho=new Pn,Vn=new k;class Bo extends Be{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Yt,this.projectionMatrix=new Yt,this.projectionMatrixInverse=new Yt,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(o,l){return super.copy(o,l),this.matrixWorldInverse.copy(o.matrixWorldInverse),this.projectionMatrix.copy(o.projectionMatrix),this.projectionMatrixInverse.copy(o.projectionMatrixInverse),this.coordinateSystem=o.coordinateSystem,this}getWorldDirection(o){return super.getWorldDirection(o).negate()}updateMatrixWorld(o){if(super.updateMatrixWorld(o),this.matrixWorld.decompose(co,ho,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(co,ho,Vn.set(1,1,1)).invert()}updateWorldMatrix(o,l,c=!1){if(super.updateWorldMatrix(o,l,c),this.matrixWorld.decompose(co,ho,Vn),Vn.x===1&&Vn.y===1&&Vn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(co,ho,Vn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var xi=new k,eu=new Dt,nu=new Dt;class _n extends Bo{constructor(o=50,l=1,c=0.1,h=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=o,this.zoom=1,this.near=c,this.far=h,this.focus=10,this.aspect=l,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(o,l){return super.copy(o,l),this.fov=o.fov,this.zoom=o.zoom,this.near=o.near,this.far=o.far,this.focus=o.focus,this.aspect=o.aspect,this.view=o.view===null?null:Object.assign({},o.view),this.filmGauge=o.filmGauge,this.filmOffset=o.filmOffset,this}setFocalLength(o){let l=0.5*this.getFilmHeight()/o;this.fov=vs*2*Math.atan(l),this.updateProjectionMatrix()}getFocalLength(){let o=Math.tan(js*0.5*this.fov);return 0.5*this.getFilmHeight()/o}getEffectiveFOV(){return vs*2*Math.atan(Math.tan(js*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(o,l,c){xi.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),l.set(xi.x,xi.y).multiplyScalar(-o/xi.z),xi.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),c.set(xi.x,xi.y).multiplyScalar(-o/xi.z)}getViewSize(o,l){return this.getViewBounds(o,eu,nu),l.subVectors(nu,eu)}setViewOffset(o,l,c,h,u,d){if(this.aspect=o/l,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=o,this.view.fullHeight=l,this.view.offsetX=c,this.view.offsetY=h,this.view.width=u,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let o=this.near,l=o*Math.tan(js*0.5*this.fov)/this.zoom,c=2*l,h=this.aspect*c,u=-0.5*h,d=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:p,fullHeight:m}=d;u+=d.offsetX*h/p,l-=d.offsetY*c/m,h*=d.width/p,c*=d.height/m}let f=this.filmOffset;if(f!==0)u+=o*f/this.getFilmWidth();this.projectionMatrix.makePerspective(u,u+h,l,l-c,o,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(o){let l=super.toJSON(o);if(l.object.fov=this.fov,l.object.zoom=this.zoom,l.object.near=this.near,l.object.far=this.far,l.object.focus=this.focus,l.object.aspect=this.aspect,this.view!==null)l.object.view=Object.assign({},this.view);return l.object.filmGauge=this.filmGauge,l.object.filmOffset=this.filmOffset,l}}class zo extends Bo{constructor(o=-1,l=1,c=1,h=-1,u=0.1,d=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=o,this.right=l,this.top=c,this.bottom=h,this.near=u,this.far=d,this.updateProjectionMatrix()}copy(o,l){return super.copy(o,l),this.left=o.left,this.right=o.right,this.top=o.top,this.bottom=o.bottom,this.near=o.near,this.far=o.far,this.zoom=o.zoom,this.view=o.view===null?null:Object.assign({},o.view),this}setViewOffset(o,l,c,h,u,d){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=o,this.view.fullHeight=l,this.view.offsetX=c,this.view.offsetY=h,this.view.width=u,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let o=(this.right-this.left)/(2*this.zoom),l=(this.top-this.bottom)/(2*this.zoom),c=(this.right+this.left)/2,h=(this.top+this.bottom)/2,u=c-o,d=c+o,f=h+l,p=h-l;if(this.view!==null&&this.view.enabled){let m=(this.right-this.left)/this.view.fullWidth/this.zoom,g=(this.top-this.bottom)/this.view.fullHeight/this.zoom;u+=m*this.view.offsetX,d=u+m*this.view.width,f-=g*this.view.offsetY,p=f-g*this.view.height}this.projectionMatrix.makeOrthographic(u,d,f,p,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(o){let l=super.toJSON(o);if(l.object.zoom=this.zoom,l.object.left=this.left,l.object.right=this.right,l.object.top=this.top,l.object.bottom=this.bottom,l.object.near=this.near,l.object.far=this.far,this.view!==null)l.object.view=Object.assign({},this.view);return l}}class hd extends bc{constructor(){super(new zo(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class ko extends Oo{constructor(o,l){super(o,l);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Be.DEFAULT_UP),this.updateMatrix(),this.target=new Be,this.shadow=new hd}dispose(){super.dispose(),this.shadow.dispose()}copy(o){return super.copy(o),this.target=o.target.clone(),this.shadow=o.shadow.clone(),this}toJSON(o){let l=super.toJSON(o);return l.object.shadow=this.shadow.toJSON(),l.object.target=this.target.uuid,l}}class Ho extends Oo{constructor(o,l){super(o,l);this.isAmbientLight=!0,this.type="AmbientLight"}}var ds=-90,fs=1;class vr extends Be{constructor(o,l,c){super();this.type="CubeCamera",this.renderTarget=c,this.coordinateSystem=null,this.activeMipmapLevel=0;let h=new _n(ds,fs,o,l);h.layers=this.layers,this.add(h);let u=new _n(ds,fs,o,l);u.layers=this.layers,this.add(u);let d=new _n(ds,fs,o,l);d.layers=this.layers,this.add(d);let f=new _n(ds,fs,o,l);f.layers=this.layers,this.add(f);let p=new _n(ds,fs,o,l);p.layers=this.layers,this.add(p);let m=new _n(ds,fs,o,l);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){let o=this.coordinateSystem,l=this.children.concat(),[c,h,u,d,f,p]=l;for(let m of l)this.remove(m);if(o===2000)c.up.set(0,1,0),c.lookAt(1,0,0),h.up.set(0,1,0),h.lookAt(-1,0,0),u.up.set(0,0,-1),u.lookAt(0,1,0),d.up.set(0,0,1),d.lookAt(0,-1,0),f.up.set(0,1,0),f.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(o===2001)c.up.set(0,-1,0),c.lookAt(-1,0,0),h.up.set(0,-1,0),h.lookAt(1,0,0),u.up.set(0,0,1),u.lookAt(0,1,0),d.up.set(0,0,-1),d.lookAt(0,-1,0),f.up.set(0,-1,0),f.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+o);for(let m of l)this.add(m),m.updateMatrixWorld()}update(o,l){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:c,activeMipmapLevel:h}=this;if(this.coordinateSystem!==o.coordinateSystem)this.coordinateSystem=o.coordinateSystem,this.updateCoordinateSystem();let[u,d,f,p,m,g]=this.children,x=o.getRenderTarget(),y=o.getActiveCubeFace(),_=o.getActiveMipmapLevel(),v=o.xr.enabled;o.xr.enabled=!1;let T=c.texture.mipmapsAutoUpdate;c.texture.mipmapsAutoUpdate=!1;let w=!1;if(o.isWebGLRenderer===!0)w=o.state.buffers.depth.getReversed();else w=o.reversedDepthBuffer;if(o.setRenderTarget(c,0,h),w&&o.autoClear===!1)o.clearDepth();if(o.render(l,u),o.setRenderTarget(c,1,h),w&&o.autoClear===!1)o.clearDepth();if(o.render(l,d),o.setRenderTarget(c,2,h),w&&o.autoClear===!1)o.clearDepth();if(o.render(l,f),o.setRenderTarget(c,3,h),w&&o.autoClear===!1)o.clearDepth();if(o.render(l,p),o.setRenderTarget(c,4,h),w&&o.autoClear===!1)o.clearDepth();if(o.render(l,m),c.texture.mipmapsAutoUpdate=T,o.setRenderTarget(c,5,h),w&&o.autoClear===!1)o.clearDepth();o.render(l,g),o.setRenderTarget(x,y,_),o.xr.enabled=v,c.texture.needsPMREMUpdate=!0}}class Tc extends _n{constructor(o=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=o,this.perCameraFrustumCulled=!1}}var Ec="\\[\\]\\.:\\/",lm=new RegExp("["+Ec+"]","g"),Ac="[^"+Ec+"]",cm="[^"+Ec.replace("\\.","")+"]",hm=/((?:WC+[\/:])*)/.source.replace("WC",Ac),um=/(WCOD+)?/.source.replace("WCOD",cm),dm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ac),fm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ac),pm=new RegExp("^"+hm+um+dm+fm+"$"),mm=["material","materials","bones","map"];class ud{constructor(o,l,c){let h=c||ge.parseTrackName(l);this._targetGroup=o,this._bindings=o.subscribe_(l,h)}getValue(o,l){this.bind();let c=this._targetGroup.nCachedObjects_,h=this._bindings[c];if(h!==void 0)h.getValue(o,l)}setValue(o,l){let c=this._bindings;for(let h=this._targetGroup.nCachedObjects_,u=c.length;h!==u;++h)c[h].setValue(o,l)}bind(){let o=this._bindings;for(let l=this._targetGroup.nCachedObjects_,c=o.length;l!==c;++l)o[l].bind()}unbind(){let o=this._bindings;for(let l=this._targetGroup.nCachedObjects_,c=o.length;l!==c;++l)o[l].unbind()}}class ge{constructor(o,l,c){this.path=l,this.parsedPath=c||ge.parseTrackName(l),this.node=ge.findNode(o,this.parsedPath.nodeName),this.rootNode=o,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(o,l,c){if(!(o&&o.isAnimationObjectGroup))return new ge(o,l,c);else return new ge.Composite(o,l,c)}static sanitizeNodeName(o){return o.replace(/\s/g,"_").replace(lm,"")}static parseTrackName(o){let l=pm.exec(o);if(l===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+o);let c={nodeName:l[2],objectName:l[3],objectIndex:l[4],propertyName:l[5],propertyIndex:l[6]},h=c.nodeName&&c.nodeName.lastIndexOf(".");if(h!==void 0&&h!==-1){let u=c.nodeName.substring(h+1);if(mm.indexOf(u)!==-1)c.nodeName=c.nodeName.substring(0,h),c.objectName=u}if(c.propertyName===null||c.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+o);return c}static findNode(o,l){if(l===void 0||l===""||l==="."||l===-1||l===o.name||l===o.uuid)return o;if(o.skeleton){let c=o.skeleton.getBoneByName(l);if(c!==void 0)return c}if(o.children){let c=function(u){for(let d=0;d<u.length;d++){let f=u[d];if(f.name===l||f.uuid===l)return f;let p=c(f.children);if(p)return p}return null},h=c(o.children);if(h)return h}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(o,l){o[l]=this.targetObject[this.propertyName]}_getValue_array(o,l){let c=this.resolvedProperty;for(let h=0,u=c.length;h!==u;++h)o[l++]=c[h]}_getValue_arrayElement(o,l){o[l]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(o,l){this.resolvedProperty.toArray(o,l)}_setValue_direct(o,l){this.targetObject[this.propertyName]=o[l]}_setValue_direct_setNeedsUpdate(o,l){this.targetObject[this.propertyName]=o[l],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(o,l){this.targetObject[this.propertyName]=o[l],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(o,l){let c=this.resolvedProperty;for(let h=0,u=c.length;h!==u;++h)c[h]=o[l++]}_setValue_array_setNeedsUpdate(o,l){let c=this.resolvedProperty;for(let h=0,u=c.length;h!==u;++h)c[h]=o[l++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(o,l){let c=this.resolvedProperty;for(let h=0,u=c.length;h!==u;++h)c[h]=o[l++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(o,l){this.resolvedProperty[this.propertyIndex]=o[l]}_setValue_arrayElement_setNeedsUpdate(o,l){this.resolvedProperty[this.propertyIndex]=o[l],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(o,l){this.resolvedProperty[this.propertyIndex]=o[l],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(o,l){this.resolvedProperty.fromArray(o,l)}_setValue_fromArray_setNeedsUpdate(o,l){this.resolvedProperty.fromArray(o,l),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(o,l){this.resolvedProperty.fromArray(o,l),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(o,l){this.bind(),this.getValue(o,l)}_setValue_unbound(o,l){this.bind(),this.setValue(o,l)}bind(){let o=this.node,l=this.parsedPath,{objectName:c,propertyName:h,propertyIndex:u}=l;if(!o)o=ge.findNode(this.rootNode,l.nodeName),this.node=o;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!o){Bt("PropertyBinding: No target node found for track: "+this.path+".");return}if(c){let m=l.objectIndex;switch(c){case"materials":if(!o.material){Ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!o.material.materials){Ht("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}o=o.material.materials;break;case"bones":if(!o.skeleton){Ht("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}o=o.skeleton.bones;for(let g=0;g<o.length;g++)if(o[g].name===m){m=g;break}break;case"map":if("map"in o){o=o.map;break}if(!o.material){Ht("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!o.material.map){Ht("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}o=o.material.map;break;default:if(o[c]===void 0){Ht("PropertyBinding: Can not bind to objectName of node undefined.",this);return}o=o[c]}if(m!==void 0){if(o[m]===void 0){Ht("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,o);return}o=o[m]}}let d=o[h];if(d===void 0){let m=l.nodeName;Ht("PropertyBinding: Trying to update property for track: "+m+"."+h+" but it wasn't found.",o);return}let f=this.Versioning.None;if(this.targetObject=o,o.isMaterial===!0)f=this.Versioning.NeedsUpdate;else if(o.isObject3D===!0)f=this.Versioning.MatrixWorldNeedsUpdate;let p=this.BindingType.Direct;if(u!==void 0){if(h==="morphTargetInfluences"){if(!o.geometry){Ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!o.geometry.morphAttributes){Ht("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(o.morphTargetDictionary[u]!==void 0)u=o.morphTargetDictionary[u]}p=this.BindingType.ArrayElement,this.resolvedProperty=d,this.propertyIndex=u}else if(d.fromArray!==void 0&&d.toArray!==void 0)p=this.BindingType.HasFromToArray,this.resolvedProperty=d;else if(Array.isArray(d))p=this.BindingType.EntireArray,this.resolvedProperty=d;else this.propertyName=h;this.getValue=this.GetterByBindingType[p],this.setValue=this.SetterByBindingTypeAndVersioning[p][f]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ge.Composite=ud;ge.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ge.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ge.prototype.GetterByBindingType=[ge.prototype._getValue_direct,ge.prototype._getValue_array,ge.prototype._getValue_arrayElement,ge.prototype._getValue_toArray];ge.prototype.SetterByBindingTypeAndVersioning=[[ge.prototype._setValue_direct,ge.prototype._setValue_direct_setNeedsUpdate,ge.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_array,ge.prototype._setValue_array_setNeedsUpdate,ge.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_arrayElement,ge.prototype._setValue_arrayElement_setNeedsUpdate,ge.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_fromArray,ge.prototype._setValue_fromArray_setNeedsUpdate,ge.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var pv=new Float32Array(1);var iu=new Yt;class Sr{constructor(o,l,c=0,h=1/0){this.ray=new Yn(o,l),this.near=c,this.far=h,this.camera=null,this.layers=new ur,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(o,l){this.ray.set(o,l)}setFromCamera(o,l){if(l.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(l.matrixWorld),this.ray.direction.set(o.x,o.y,0.5).unproject(l).sub(this.ray.origin).normalize(),this.camera=l;else if(l.isOrthographicCamera)this.ray.origin.set(o.x,o.y,l.projectionMatrix.elements[14]).unproject(l),this.ray.direction.set(0,0,-1).transformDirection(l.matrixWorld),this.camera=l;else Ht("Raycaster: Unsupported camera type: "+l.type)}setFromXRController(o){return iu.identity().extractRotation(o.matrixWorld),this.ray.origin.setFromMatrixPosition(o.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(iu),this}intersectObject(o,l=!0,c=[]){return ja(o,this,c,l),c.sort(su),c}intersectObjects(o,l=!0,c=[]){for(let h=0,u=o.length;h<u;h++)ja(o[h],this,c,l);return c.sort(su),c}}function su(o,l){return o.distance-l.distance}function ja(o,l,c,h){let u=!0;if(o.layers.test(l.layers)){if(o.raycast(l,c)===!1)u=!1}if(u===!0&&h===!0){let d=o.children;for(let f=0,p=d.length;f<p;f++)ja(d[f],l,c,!0)}}class Ki{constructor(o=1,l=0,c=0){this.radius=o,this.phi=l,this.theta=c}set(o,l,c){return this.radius=o,this.phi=l,this.theta=c,this}copy(o){return this.radius=o.radius,this.phi=o.phi,this.theta=o.theta,this}makeSafe(){return this.phi=qt(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(o){return this.setFromCartesianCoords(o.x,o.y,o.z)}setFromCartesianCoords(o,l,c){if(this.radius=Math.sqrt(o*o+l*l+c*c),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(o,c),this.phi=Math.acos(qt(l/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class dd{static{this.prototype.isMatrix2=!0}constructor(o,l,c,h){if(this.elements=[1,0,0,1],o!==void 0)this.set(o,l,c,h)}identity(){return this.set(1,0,0,1),this}fromArray(o,l=0){for(let c=0;c<4;c++)this.elements[c]=o[c+l];return this}set(o,l,c,h){let u=this.elements;return u[0]=o,u[2]=l,u[1]=c,u[3]=h,this}}var ru=new k,uo=new k,ps=new k,ms=new k,Ja=new k,gm=new k,_m=new k;class vn{constructor(o=new k,l=new k){this.start=o,this.end=l}set(o,l){return this.start.copy(o),this.end.copy(l),this}copy(o){return this.start.copy(o.start),this.end.copy(o.end),this}getCenter(o){return o.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(o){return o.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(o,l){return this.delta(l).multiplyScalar(o).add(this.start)}closestPointToPointParameter(o,l){ru.subVectors(o,this.start),uo.subVectors(this.end,this.start);let c=uo.dot(uo);if(c===0)return 0;let u=uo.dot(ru)/c;if(l)u=qt(u,0,1);return u}closestPointToPoint(o,l,c){let h=this.closestPointToPointParameter(o,l);return this.delta(c).multiplyScalar(h).add(this.start)}distanceSqToLine3(o,l=gm,c=_m){let u,d,f=this.start,p=o.start,m=this.end,g=o.end;ps.subVectors(m,f),ms.subVectors(g,p),Ja.subVectors(f,p);let x=ps.dot(ps),y=ms.dot(ms),_=ms.dot(Ja);if(x<=0.00000000000000010000000000000001&&y<=0.00000000000000010000000000000001)return l.copy(f),c.copy(p),l.distanceToSquared(c);if(x<=0.00000000000000010000000000000001)u=0,d=_/y,d=qt(d,0,1);else{let v=ps.dot(Ja);if(y<=0.00000000000000010000000000000001)d=0,u=qt(-v/x,0,1);else{let T=ps.dot(ms),w=x*y-T*T;if(w!==0)u=qt((T*_-v*y)/w,0,1);else u=0;if(d=(T*u+_)/y,d<0)d=0,u=qt(-v/x,0,1);else if(d>1)d=1,u=qt((T-v)/x,0,1)}}return l.copy(f).addScaledVector(ps,u),c.copy(p).addScaledVector(ms,d),l.distanceToSquared(c)}applyMatrix4(o){return this.start.applyMatrix4(o),this.end.applyMatrix4(o),this}equals(o){return o.start.equals(this.start)&&o.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Go extends qn{constructor(o,l=null){super();this.object=o,this.domElement=l,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(o){if(this.domElement!==null)this.disconnect();this.domElement=o}disconnect(){}dispose(){}update(){}}function wc(o,l,c,h){let u=xm(h);switch(c){case 1021:return o*l;case 1028:return o*l/u.components*u.byteLength;case 1029:return o*l/u.components*u.byteLength;case 1030:return o*l*2/u.components*u.byteLength;case 1031:return o*l*2/u.components*u.byteLength;case 1022:return o*l*3/u.components*u.byteLength;case 1023:return o*l*4/u.components*u.byteLength;case 1033:return o*l*4/u.components*u.byteLength;case 33776:case 33777:return Math.floor((o+3)/4)*Math.floor((l+3)/4)*8;case 33778:case 33779:return Math.floor((o+3)/4)*Math.floor((l+3)/4)*16;case 35841:case 35843:return Math.max(o,16)*Math.max(l,8)/4;case 35840:case 35842:return Math.max(o,8)*Math.max(l,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((o+3)/4)*Math.floor((l+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((o+3)/4)*Math.floor((l+3)/4)*16;case 37808:return Math.floor((o+3)/4)*Math.floor((l+3)/4)*16;case 37809:return Math.floor((o+4)/5)*Math.floor((l+3)/4)*16;case 37810:return Math.floor((o+4)/5)*Math.floor((l+4)/5)*16;case 37811:return Math.floor((o+5)/6)*Math.floor((l+4)/5)*16;case 37812:return Math.floor((o+5)/6)*Math.floor((l+5)/6)*16;case 37813:return Math.floor((o+7)/8)*Math.floor((l+4)/5)*16;case 37814:return Math.floor((o+7)/8)*Math.floor((l+5)/6)*16;case 37815:return Math.floor((o+7)/8)*Math.floor((l+7)/8)*16;case 37816:return Math.floor((o+9)/10)*Math.floor((l+4)/5)*16;case 37817:return Math.floor((o+9)/10)*Math.floor((l+5)/6)*16;case 37818:return Math.floor((o+9)/10)*Math.floor((l+7)/8)*16;case 37819:return Math.floor((o+9)/10)*Math.floor((l+9)/10)*16;case 37820:return Math.floor((o+11)/12)*Math.floor((l+9)/10)*16;case 37821:return Math.floor((o+11)/12)*Math.floor((l+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(o/4)*Math.ceil(l/4)*16;case 36283:case 36284:return Math.ceil(o/4)*Math.ceil(l/4)*8;case 36285:case 36286:return Math.ceil(o/4)*Math.ceil(l/4)*16}throw Error(`Unable to determine texture byte length for ${c} format.`)}function xm(o){switch(o){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${o}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Bt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function Nd(){let o=null,l=!1,c=null,h=null;function u(d,f){h=o.requestAnimationFrame(u),c(d,f)}return{start:function(){if(l===!0)return;if(c===null)return;if(o===null)return;h=o.requestAnimationFrame(u),l=!0},stop:function(){if(o!==null)o.cancelAnimationFrame(h);l=!1},setAnimationLoop:function(d){c=d},setContext:function(d){o=d}}}function ym(o){let l=new WeakMap;function c(p,m){let{array:g,usage:x}=p,y=g.byteLength,_=o.createBuffer();o.bindBuffer(m,_),o.bufferData(m,g,x),p.onUploadCallback();let v;if(g instanceof Float32Array)v=o.FLOAT;else if(typeof Float16Array<"u"&&g instanceof Float16Array)v=o.HALF_FLOAT;else if(g instanceof Uint16Array)if(p.isFloat16BufferAttribute)v=o.HALF_FLOAT;else v=o.UNSIGNED_SHORT;else if(g instanceof Int16Array)v=o.SHORT;else if(g instanceof Uint32Array)v=o.UNSIGNED_INT;else if(g instanceof Int32Array)v=o.INT;else if(g instanceof Int8Array)v=o.BYTE;else if(g instanceof Uint8Array)v=o.UNSIGNED_BYTE;else if(g instanceof Uint8ClampedArray)v=o.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+g);return{buffer:_,type:v,bytesPerElement:g.BYTES_PER_ELEMENT,version:p.version,size:y}}function h(p,m,g){let{array:x,updateRanges:y}=m;if(o.bindBuffer(g,p),y.length===0)o.bufferSubData(g,0,x);else{y.sort((v,T)=>v.start-T.start);let _=0;for(let v=1;v<y.length;v++){let T=y[_],w=y[v];if(w.start<=T.start+T.count+1)T.count=Math.max(T.count,w.start+w.count-T.start);else++_,y[_]=w}y.length=_+1;for(let v=0,T=y.length;v<T;v++){let w=y[v];o.bufferSubData(g,w.start*x.BYTES_PER_ELEMENT,x,w.start,w.count)}m.clearUpdateRanges()}m.onUploadCallback()}function u(p){if(p.isInterleavedBufferAttribute)p=p.data;return l.get(p)}function d(p){if(p.isInterleavedBufferAttribute)p=p.data;let m=l.get(p);if(m)o.deleteBuffer(m.buffer),l.delete(p)}function f(p,m){if(p.isInterleavedBufferAttribute)p=p.data;if(p.isGLBufferAttribute){let x=l.get(p);if(!x||x.version<p.version)l.set(p,{buffer:p.buffer,type:p.type,bytesPerElement:p.elementSize,version:p.version});return}let g=l.get(p);if(g===void 0)l.set(p,c(p,m));else if(g.version<p.version){if(g.size!==p.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");h(g.buffer,p,m),g.version=p.version}}return{get:u,remove:d,update:f}}var vm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Sm=`#ifdef USE_ALPHAHASH
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
#endif`,Mm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,bm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Tm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Em=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Am=`#ifdef USE_AOMAP
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
#endif`,wm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Rm=`#ifdef USE_BATCHING
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
#endif`,Cm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Pm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Im=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Dm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Lm=`#ifdef USE_IRIDESCENCE
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
#endif`,Nm=`#ifdef USE_BUMPMAP
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
#endif`,Um=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Fm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Om=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,km=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Hm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Vm=`#define PI 3.141592653589793
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
} // validated`,Wm=`vec3 transformedNormal = objectNormal;
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
#endif`,Xm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ym=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Km=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,$m=`#ifdef USE_ENVMAP
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
#endif`,jm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Qm=`#ifdef USE_ENVMAP
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
#endif`,tg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,eg=`#ifdef USE_ENVMAP
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
#endif`,ng=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ig=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,sg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,og=`#ifdef USE_GRADIENTMAP
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
}`,ag=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hg=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,ug=`#ifdef USE_ENVMAP
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
#endif`,dg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,fg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,pg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,mg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gg=`PhysicalMaterial material;
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
#endif`,_g=`uniform sampler2D dfgLUT;
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
}`,xg=`
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
#endif`,yg=`#if defined( RE_IndirectDiffuse )
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
#endif`,vg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sg=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Mg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,bg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Eg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ag=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,wg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Rg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Cg=`#if defined( USE_POINTS_UV )
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
#endif`,Pg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ig=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Dg=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Lg=`#if defined( USE_MORPHCOLORS )
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
#endif`,Ng=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ug=`#ifdef USE_MORPHTARGETS
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
#endif`,Fg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Og=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Bg=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,zg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Gg=`#ifdef USE_NORMALMAP
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
#endif`,Vg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Wg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Xg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Yg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Zg=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Jg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Kg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,$g=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,t_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,e_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,n_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,i_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,s_=`float getShadowMask() {
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
}`,r_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,o_=`#ifdef USE_SKINNING
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
#endif`,a_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,l_=`#ifdef USE_SKINNING
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
#endif`,c_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,h_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,u_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,d_=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,f_=`#ifdef USE_TRANSMISSION
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
#endif`,p_=`#ifdef USE_TRANSMISSION
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
#endif`,m_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,g_=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,__=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var x_=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,y_=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,v_=`uniform sampler2D t2D;
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
}`,S_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,M_=`uniform float backgroundBlurriness;
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
}`,b_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,T_=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,E_=`#include <common>
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
}`,A_=`#if DEPTH_PACKING == 3200
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
}`,w_=`#define DISTANCE
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
}`,R_=`#define DISTANCE
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
}`,C_=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,P_=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,I_=`uniform float scale;
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
}`,D_=`uniform vec3 diffuse;
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
}`,L_=`#include <common>
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
}`,N_=`uniform vec3 diffuse;
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
}`,U_=`#define LAMBERT
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
}`,F_=`#define LAMBERT
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
}`,O_=`#define MATCAP
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
}`,B_=`#define MATCAP
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
}`,z_=`#define NORMAL
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
}`,k_=`#define NORMAL
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
}`,H_=`#define PHONG
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
}`,G_=`#define PHONG
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
}`,V_=`#define STANDARD
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
}`,W_=`#define STANDARD
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
}`,X_=`#define TOON
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
}`,q_=`#define TOON
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
}`,Y_=`uniform float size;
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
}`,Z_=`uniform vec3 diffuse;
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
}`,J_=`#include <common>
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
}`,K_=`uniform vec3 color;
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
}`,$_=`uniform float rotation;
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
}`,j_=`uniform vec3 diffuse;
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
}`,$t={alphahash_fragment:vm,alphahash_pars_fragment:Sm,alphamap_fragment:Mm,alphamap_pars_fragment:bm,alphatest_fragment:Tm,alphatest_pars_fragment:Em,aomap_fragment:Am,aomap_pars_fragment:wm,batching_pars_vertex:Rm,batching_vertex:Cm,begin_vertex:Pm,beginnormal_vertex:Im,bsdfs:Dm,iridescence_fragment:Lm,bumpmap_pars_fragment:Nm,clipping_planes_fragment:Um,clipping_planes_pars_fragment:Fm,clipping_planes_pars_vertex:Om,clipping_planes_vertex:Bm,color_fragment:zm,color_pars_fragment:km,color_pars_vertex:Hm,color_vertex:Gm,common:Vm,defaultnormal_vertex:Wm,displacementmap_pars_vertex:Xm,displacementmap_vertex:qm,emissivemap_fragment:Ym,emissivemap_pars_fragment:Zm,colorspace_fragment:Jm,colorspace_pars_fragment:Km,envmap_fragment:$m,envmap_common_pars_fragment:jm,envmap_pars_fragment:Qm,envmap_pars_vertex:tg,envmap_physical_pars_fragment:ug,envmap_vertex:eg,fog_vertex:ng,fog_pars_vertex:ig,fog_fragment:sg,fog_pars_fragment:rg,gradientmap_pars_fragment:og,lightmap_pars_fragment:ag,lights_lambert_fragment:lg,lights_lambert_pars_fragment:cg,lights_pars_begin:hg,lights_toon_fragment:dg,lights_toon_pars_fragment:fg,lights_phong_fragment:pg,lights_phong_pars_fragment:mg,lights_physical_fragment:gg,lights_physical_pars_fragment:_g,lights_fragment_begin:xg,lights_fragment_maps:yg,lights_fragment_end:vg,lightprobes_pars_fragment:Sg,logdepthbuf_fragment:Mg,logdepthbuf_pars_fragment:bg,logdepthbuf_pars_vertex:Tg,logdepthbuf_vertex:Eg,map_fragment:Ag,map_pars_fragment:wg,map_particle_fragment:Rg,map_particle_pars_fragment:Cg,metalnessmap_fragment:Pg,metalnessmap_pars_fragment:Ig,morphinstance_vertex:Dg,morphcolor_vertex:Lg,morphnormal_vertex:Ng,morphtarget_pars_vertex:Ug,morphtarget_vertex:Fg,normal_fragment_begin:Og,normal_fragment_maps:Bg,normal_pars_fragment:zg,normal_pars_vertex:kg,normal_vertex:Hg,normalmap_pars_fragment:Gg,clearcoat_normal_fragment_begin:Vg,clearcoat_normal_fragment_maps:Wg,clearcoat_pars_fragment:Xg,iridescence_pars_fragment:qg,opaque_fragment:Yg,packing:Zg,premultiplied_alpha_fragment:Jg,project_vertex:Kg,dithering_fragment:$g,dithering_pars_fragment:jg,roughnessmap_fragment:Qg,roughnessmap_pars_fragment:t_,shadowmap_pars_fragment:e_,shadowmap_pars_vertex:n_,shadowmap_vertex:i_,shadowmask_pars_fragment:s_,skinbase_vertex:r_,skinning_pars_vertex:o_,skinning_vertex:a_,skinnormal_vertex:l_,specularmap_fragment:c_,specularmap_pars_fragment:h_,tonemapping_fragment:u_,tonemapping_pars_fragment:d_,transmission_fragment:f_,transmission_pars_fragment:p_,uv_pars_fragment:m_,uv_pars_vertex:g_,uv_vertex:__,worldpos_vertex:x_,background_vert:y_,background_frag:v_,backgroundCube_vert:S_,backgroundCube_frag:M_,cube_vert:b_,cube_frag:T_,depth_vert:E_,depth_frag:A_,distance_vert:w_,distance_frag:R_,equirect_vert:C_,equirect_frag:P_,linedashed_vert:I_,linedashed_frag:D_,meshbasic_vert:L_,meshbasic_frag:N_,meshlambert_vert:U_,meshlambert_frag:F_,meshmatcap_vert:O_,meshmatcap_frag:B_,meshnormal_vert:z_,meshnormal_frag:k_,meshphong_vert:H_,meshphong_frag:G_,meshphysical_vert:V_,meshphysical_frag:W_,meshtoon_vert:X_,meshtoon_frag:q_,points_vert:Y_,points_frag:Z_,shadow_vert:J_,shadow_frag:K_,sprite_vert:$_,sprite_frag:j_},vt={common:{diffuse:{value:new Kt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Gt}},envmap:{envMap:{value:null},envMapRotation:{value:new Gt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Gt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Gt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Gt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Gt},normalScale:{value:new Dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Gt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Gt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Gt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Gt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new Kt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Kt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0},uvTransform:{value:new Gt}},sprite:{diffuse:{value:new Kt(16777215)},opacity:{value:1},center:{value:new Dt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Gt},alphaMap:{value:null},alphaMapTransform:{value:new Gt},alphaTest:{value:0}}},Jn={basic:{uniforms:an([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.fog]),vertexShader:$t.meshbasic_vert,fragmentShader:$t.meshbasic_frag},lambert:{uniforms:an([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Kt(0)},envMapIntensity:{value:1}}]),vertexShader:$t.meshlambert_vert,fragmentShader:$t.meshlambert_frag},phong:{uniforms:an([vt.common,vt.specularmap,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,vt.lights,{emissive:{value:new Kt(0)},specular:{value:new Kt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$t.meshphong_vert,fragmentShader:$t.meshphong_frag},standard:{uniforms:an([vt.common,vt.envmap,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.roughnessmap,vt.metalnessmap,vt.fog,vt.lights,{emissive:{value:new Kt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$t.meshphysical_vert,fragmentShader:$t.meshphysical_frag},toon:{uniforms:an([vt.common,vt.aomap,vt.lightmap,vt.emissivemap,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.gradientmap,vt.fog,vt.lights,{emissive:{value:new Kt(0)}}]),vertexShader:$t.meshtoon_vert,fragmentShader:$t.meshtoon_frag},matcap:{uniforms:an([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,vt.fog,{matcap:{value:null}}]),vertexShader:$t.meshmatcap_vert,fragmentShader:$t.meshmatcap_frag},points:{uniforms:an([vt.points,vt.fog]),vertexShader:$t.points_vert,fragmentShader:$t.points_frag},dashed:{uniforms:an([vt.common,vt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$t.linedashed_vert,fragmentShader:$t.linedashed_frag},depth:{uniforms:an([vt.common,vt.displacementmap]),vertexShader:$t.depth_vert,fragmentShader:$t.depth_frag},normal:{uniforms:an([vt.common,vt.bumpmap,vt.normalmap,vt.displacementmap,{opacity:{value:1}}]),vertexShader:$t.meshnormal_vert,fragmentShader:$t.meshnormal_frag},sprite:{uniforms:an([vt.sprite,vt.fog]),vertexShader:$t.sprite_vert,fragmentShader:$t.sprite_frag},background:{uniforms:{uvTransform:{value:new Gt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$t.background_vert,fragmentShader:$t.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Gt}},vertexShader:$t.backgroundCube_vert,fragmentShader:$t.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$t.cube_vert,fragmentShader:$t.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$t.equirect_vert,fragmentShader:$t.equirect_frag},distance:{uniforms:an([vt.common,vt.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:$t.distance_vert,fragmentShader:$t.distance_frag},shadow:{uniforms:an([vt.lights,vt.fog,{color:{value:new Kt(0)},opacity:{value:1}}]),vertexShader:$t.shadow_vert,fragmentShader:$t.shadow_frag}};Jn.physical={uniforms:an([Jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Gt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Gt},clearcoatNormalScale:{value:new Dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Gt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Gt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Gt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Gt},sheen:{value:0},sheenColor:{value:new Kt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Gt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Gt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Gt},transmissionSamplerSize:{value:new Dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Gt},attenuationDistance:{value:0},attenuationColor:{value:new Kt(0)},specularColor:{value:new Kt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Gt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Gt},anisotropyVector:{value:new Dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Gt}}]),vertexShader:$t.meshphysical_vert,fragmentShader:$t.meshphysical_frag};var Vo={r:0,b:0,g:0},Q_=new Yt,Ud=new Gt;Ud.set(-1,0,0,0,1,0,0,0,1);function t0(o,l,c,h,u,d){let f=new Kt(0),p=u===!0?0:1,m,g,x=null,y=0,_=null;function v(E){let C=E.isScene===!0?E.background:null;if(C&&C.isTexture){let A=E.backgroundBlurriness>0;C=l.get(C,A)}return C}function T(E){let C=!1,A=v(E);if(A===null)S(f,p);else if(A&&A.isColor)S(A,1),C=!0;let P=o.xr.getEnvironmentBlendMode();if(P==="additive")c.buffers.color.setClear(0,0,0,1,d);else if(P==="alpha-blend")c.buffers.color.setClear(0,0,0,0,d);if(o.autoClear||C)c.buffers.depth.setTest(!0),c.buffers.depth.setMask(!0),c.buffers.color.setMask(!0),o.clear(o.autoClearColor,o.autoClearDepth,o.autoClearStencil)}function w(E,C){let A=v(C);if(A&&A.isCubeTexture){if(g===void 0)g=new Ke(new Rs(1,1,1),new ui({name:"BackgroundCubeMaterial",uniforms:qi(Jn.backgroundCube.uniforms),vertexShader:Jn.backgroundCube.vertexShader,fragmentShader:Jn.backgroundCube.fragmentShader,side:on,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),g.geometry.deleteAttribute("normal"),g.geometry.deleteAttribute("uv"),g.onBeforeRender=function(P,L,b){this.matrixWorld.copyPosition(b.matrixWorld)},Object.defineProperty(g.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),h.update(g);if(g.material.uniforms.envMap.value=A,g.material.uniforms.backgroundBlurriness.value=C.backgroundBlurriness,g.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,g.material.uniforms.backgroundRotation.value.setFromMatrix4(Q_.makeRotationFromEuler(C.backgroundRotation)).transpose(),A.isRenderTargetTexture===!1)g.material.uniforms.backgroundRotation.value.premultiply(Ud);if(g.material.toneMapped=te.getTransfer(A.colorSpace)!==be,x!==A||y!==A.version||_!==o.toneMapping)g.material.needsUpdate=!0,x=A,y=A.version,_=o.toneMapping;g.layers.enableAll(),E.unshift(g,g.geometry,g.material,0,0,null)}else if(A&&A.isTexture){if(m===void 0)m=new Ke(new xr(2,2),new ui({name:"BackgroundMaterial",uniforms:qi(Jn.background.uniforms),vertexShader:Jn.background.vertexShader,fragmentShader:Jn.background.fragmentShader,side:li,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),h.update(m);if(m.material.uniforms.t2D.value=A,m.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,m.material.toneMapped=te.getTransfer(A.colorSpace)!==be,A.matrixAutoUpdate===!0)A.updateMatrix();if(m.material.uniforms.uvTransform.value.copy(A.matrix),x!==A||y!==A.version||_!==o.toneMapping)m.material.needsUpdate=!0,x=A,y=A.version,_=o.toneMapping;m.layers.enableAll(),E.unshift(m,m.geometry,m.material,0,0,null)}}function S(E,C){E.getRGB(Vo,cc(o)),c.buffers.color.setClear(Vo.r,Vo.g,Vo.b,C,d)}function M(){if(g!==void 0)g.geometry.dispose(),g.material.dispose(),g=void 0;if(m!==void 0)m.geometry.dispose(),m.material.dispose(),m=void 0}return{getClearColor:function(){return f},setClearColor:function(E,C=1){f.set(E),p=C,S(f,p)},getClearAlpha:function(){return p},setClearAlpha:function(E){p=E,S(f,p)},render:T,addToRenderList:w,dispose:M}}function e0(o,l){let c=o.getParameter(o.MAX_VERTEX_ATTRIBS),h={},u=_(null),d=u,f=!1;function p(U,z,W,O,q){let j=!1,X=y(U,O,W,z);if(d!==X)d=X,g(d.object);if(j=v(U,O,W,q),j)T(U,O,W,q);if(q!==null)l.update(q,o.ELEMENT_ARRAY_BUFFER);if(j||f){if(f=!1,A(U,z,W,O),q!==null)o.bindBuffer(o.ELEMENT_ARRAY_BUFFER,l.get(q).buffer)}}function m(){return o.createVertexArray()}function g(U){return o.bindVertexArray(U)}function x(U){return o.deleteVertexArray(U)}function y(U,z,W,O){let q=O.wireframe===!0,j=h[z.id];if(j===void 0)j={},h[z.id]=j;let X=U.isInstancedMesh===!0?U.id:0,ht=j[X];if(ht===void 0)ht={},j[X]=ht;let Q=ht[W.id];if(Q===void 0)Q={},ht[W.id]=Q;let rt=Q[q];if(rt===void 0)rt=_(m()),Q[q]=rt;return rt}function _(U){let z=[],W=[],O=[];for(let q=0;q<c;q++)z[q]=0,W[q]=0,O[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:W,attributeDivisors:O,object:U,attributes:{},index:null}}function v(U,z,W,O){let q=d.attributes,j=z.attributes,X=0,ht=W.getAttributes();for(let Q in ht)if(ht[Q].location>=0){let ct=q[Q],At=j[Q];if(At===void 0){if(Q==="instanceMatrix"&&U.instanceMatrix)At=U.instanceMatrix;if(Q==="instanceColor"&&U.instanceColor)At=U.instanceColor}if(ct===void 0)return!0;if(ct.attribute!==At)return!0;if(At&&ct.data!==At.data)return!0;X++}if(d.attributesNum!==X)return!0;if(d.index!==O)return!0;return!1}function T(U,z,W,O){let q={},j=z.attributes,X=0,ht=W.getAttributes();for(let Q in ht)if(ht[Q].location>=0){let ct=j[Q];if(ct===void 0){if(Q==="instanceMatrix"&&U.instanceMatrix)ct=U.instanceMatrix;if(Q==="instanceColor"&&U.instanceColor)ct=U.instanceColor}let At={};if(At.attribute=ct,ct&&ct.data)At.data=ct.data;q[Q]=At,X++}d.attributes=q,d.attributesNum=X,d.index=O}function w(){let U=d.newAttributes;for(let z=0,W=U.length;z<W;z++)U[z]=0}function S(U){M(U,0)}function M(U,z){let W=d.newAttributes,O=d.enabledAttributes,q=d.attributeDivisors;if(W[U]=1,O[U]===0)o.enableVertexAttribArray(U),O[U]=1;if(q[U]!==z)o.vertexAttribDivisor(U,z),q[U]=z}function E(){let U=d.newAttributes,z=d.enabledAttributes;for(let W=0,O=z.length;W<O;W++)if(z[W]!==U[W])o.disableVertexAttribArray(W),z[W]=0}function C(U,z,W,O,q,j,X){if(X===!0)o.vertexAttribIPointer(U,z,W,q,j);else o.vertexAttribPointer(U,z,W,O,q,j)}function A(U,z,W,O){w();let q=O.attributes,j=W.getAttributes(),X=z.defaultAttributeValues;for(let ht in j){let Q=j[ht];if(Q.location>=0){let rt=q[ht];if(rt===void 0){if(ht==="instanceMatrix"&&U.instanceMatrix)rt=U.instanceMatrix;if(ht==="instanceColor"&&U.instanceColor)rt=U.instanceColor}if(rt!==void 0){let ct=rt.normalized,At=rt.itemSize,et=l.get(rt);if(et===void 0)continue;let{buffer:at,type:Tt,bytesPerElement:Nt}=et,Ut=Tt===o.INT||Tt===o.UNSIGNED_INT||rt.gpuType===ul;if(rt.isInterleavedBufferAttribute){let Et=rt.data,jt=Et.isInterleavedBuffer===!0?Et.stride:Et.itemSize,Zt=rt.offset;if(Et.isInstancedInterleavedBuffer||Et.isInstancedBufferAttribute){for(let Pt=0;Pt<Q.locationSize;Pt++)M(Q.location+Pt,Et.meshPerAttribute);if(U.isInstancedMesh!==!0&&O._maxInstanceCount===void 0)O._maxInstanceCount=Et.meshPerAttribute*Et.count}else for(let Pt=0;Pt<Q.locationSize;Pt++)S(Q.location+Pt);o.bindBuffer(o.ARRAY_BUFFER,at);for(let Pt=0;Pt<Q.locationSize;Pt++)C(Q.location+Pt,At/Q.locationSize,Tt,ct,jt*Nt,(Zt+At/Q.locationSize*Pt)*Nt,Ut)}else{if(rt.isInstancedBufferAttribute){for(let Et=0;Et<Q.locationSize;Et++)M(Q.location+Et,rt.meshPerAttribute);if(U.isInstancedMesh!==!0&&O._maxInstanceCount===void 0)O._maxInstanceCount=rt.meshPerAttribute*rt.count}else for(let Et=0;Et<Q.locationSize;Et++)S(Q.location+Et);o.bindBuffer(o.ARRAY_BUFFER,at);for(let Et=0;Et<Q.locationSize;Et++)C(Q.location+Et,At/Q.locationSize,Tt,ct,At*Nt,At/Q.locationSize*Et*Nt,Ut)}}else if(X!==void 0){let ct=X[ht];if(ct!==void 0)switch(ct.length){case 2:o.vertexAttrib2fv(Q.location,ct);break;case 3:o.vertexAttrib3fv(Q.location,ct);break;case 4:o.vertexAttrib4fv(Q.location,ct);break;default:o.vertexAttrib1fv(Q.location,ct)}}}}E()}function P(){N();for(let U in h){let z=h[U];for(let W in z){let O=z[W];for(let q in O){let j=O[q];for(let X in j)x(j[X].object),delete j[X];delete O[q]}}delete h[U]}}function L(U){if(h[U.id]===void 0)return;let z=h[U.id];for(let W in z){let O=z[W];for(let q in O){let j=O[q];for(let X in j)x(j[X].object),delete j[X];delete O[q]}}delete h[U.id]}function b(U){for(let z in h){let W=h[z];for(let O in W){let q=W[O];if(q[U.id]===void 0)continue;let j=q[U.id];for(let X in j)x(j[X].object),delete j[X];delete q[U.id]}}}function R(U){for(let z in h){let W=h[z],O=U.isInstancedMesh===!0?U.id:0,q=W[O];if(q===void 0)continue;for(let j in q){let X=q[j];for(let ht in X)x(X[ht].object),delete X[ht];delete q[j]}if(delete W[O],Object.keys(W).length===0)delete h[z]}}function N(){if(B(),f=!0,d===u)return;d=u,g(d.object)}function B(){u.geometry=null,u.program=null,u.wireframe=!1}return{setup:p,reset:N,resetDefaultState:B,dispose:P,releaseStatesOfGeometry:L,releaseStatesOfObject:R,releaseStatesOfProgram:b,initAttributes:w,enableAttribute:S,disableUnusedAttributes:E}}function n0(o,l,c){let h;function u(m){h=m}function d(m,g){o.drawArrays(h,m,g),c.update(g,h,1)}function f(m,g,x){if(x===0)return;o.drawArraysInstanced(h,m,g,x),c.update(g,h,x)}function p(m,g,x){if(x===0)return;l.get("WEBGL_multi_draw").multiDrawArraysWEBGL(h,m,0,g,0,x);let _=0;for(let v=0;v<x;v++)_+=g[v];c.update(_,h,1)}this.setMode=u,this.render=d,this.renderInstances=f,this.renderMultiDraw=p}function i0(o,l,c,h){let u;function d(){if(u!==void 0)return u;if(l.has("EXT_texture_filter_anisotropic")===!0){let b=l.get("EXT_texture_filter_anisotropic");u=o.getParameter(b.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else u=0;return u}function f(b){if(b!==Cn&&h.convert(b)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function p(b){let R=b===Xn&&(l.has("EXT_color_buffer_half_float")||l.has("EXT_color_buffer_float"));if(b!==zn&&b!==ci&&!R&&h.convert(b)!==o.getParameter(o.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function m(b){if(b==="highp"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.HIGH_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.HIGH_FLOAT).precision>0)return"highp";b="mediump"}if(b==="mediump"){if(o.getShaderPrecisionFormat(o.VERTEX_SHADER,o.MEDIUM_FLOAT).precision>0&&o.getShaderPrecisionFormat(o.FRAGMENT_SHADER,o.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let g=c.precision!==void 0?c.precision:"highp",x=m(g);if(x!==g)Bt("WebGLRenderer:",g,"not supported, using",x,"instead."),g=x;let y=c.reversedDepthBuffer===!0&&l.has("EXT_clip_control"),_=c.logarithmicDepthBuffer===!0&&y===!1;if(c.reversedDepthBuffer===!0&&y===!1)Bt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(c.logarithmicDepthBuffer===!0&&y===!0)Bt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let v=o.getParameter(o.MAX_TEXTURE_IMAGE_UNITS),T=o.getParameter(o.MAX_VERTEX_TEXTURE_IMAGE_UNITS),w=o.getParameter(o.MAX_TEXTURE_SIZE),S=o.getParameter(o.MAX_CUBE_MAP_TEXTURE_SIZE),M=o.getParameter(o.MAX_VERTEX_ATTRIBS),E=o.getParameter(o.MAX_VERTEX_UNIFORM_VECTORS),C=o.getParameter(o.MAX_VARYING_VECTORS),A=o.getParameter(o.MAX_FRAGMENT_UNIFORM_VECTORS),P=o.getParameter(o.MAX_SAMPLES),L=o.getParameter(o.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:d,getMaxPrecision:m,textureFormatReadable:f,textureTypeReadable:p,precision:g,logarithmicDepthBuffer:_,reversedDepthBuffer:y,maxTextures:v,maxVertexTextures:T,maxTextureSize:w,maxCubemapSize:S,maxAttributes:M,maxVertexUniforms:E,maxVaryings:C,maxFragmentUniforms:A,maxSamples:P,samples:L}}function s0(o){let l=this,c=null,h=0,u=!1,d=!1,f=new rn,p=new Gt,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(y,_){let v=y.length!==0||_||h!==0||u;return u=_,h=y.length,v},this.beginShadows=function(){d=!0,x(null)},this.endShadows=function(){d=!1},this.setGlobalState=function(y,_){c=x(y,_,0)},this.setState=function(y,_,v){let{clippingPlanes:T,clipIntersection:w,clipShadows:S}=y,M=o.get(y);if(!u||T===null||T.length===0||d&&!S)if(d)x(null);else g();else{let E=d?0:h,C=E*4,A=M.clippingState||null;m.value=A,A=x(T,_,C,v);for(let P=0;P!==C;++P)A[P]=c[P];M.clippingState=A,this.numIntersection=w?this.numPlanes:0,this.numPlanes+=E}};function g(){if(m.value!==c)m.value=c,m.needsUpdate=h>0;l.numPlanes=h,l.numIntersection=0}function x(y,_,v,T){let w=y!==null?y.length:0,S=null;if(w!==0){if(S=m.value,T!==!0||S===null){let M=v+w*4,E=_.matrixWorldInverse;if(p.getNormalMatrix(E),S===null||S.length<M)S=new Float32Array(M);for(let C=0,A=v;C!==w;++C,A+=4)f.copy(y[C]).applyMatrix4(E,p),f.normal.toArray(S,A),S[A+3]=f.constant}m.value=S,m.needsUpdate=!0}return l.numPlanes=w,l.numIntersection=0,S}}class qo extends In{constructor(o=1,l={}){super(o,o,l);this.isWebGLCubeRenderTarget=!0;let c={width:o,height:o,depth:1},h=[c,c,c,c,c,c];this.texture=new Io(h),this._setTextureOptions(l),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(o,l){this.texture.type=l.type,this.texture.colorSpace=l.colorSpace,this.texture.generateMipmaps=l.generateMipmaps,this.texture.minFilter=l.minFilter,this.texture.magFilter=l.magFilter;let c={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},h=new Rs(5,5,5),u=new ui({name:"CubemapFromEquirect",uniforms:qi(c.uniforms),vertexShader:c.vertexShader,fragmentShader:c.fragmentShader,side:on,blending:ki});u.uniforms.tEquirect.value=l;let d=new Ke(h,u),f=l.minFilter;if(l.minFilter===Bn)l.minFilter=yn;return new vr(1,10,this).update(o,d),l.minFilter=f,d.geometry.dispose(),d.material.dispose(),this}clear(o,l=!0,c=!0,h=!0){let u=o.getRenderTarget();for(let d=0;d<6;d++)o.setRenderTarget(this,d),o.clear(l,c,h);o.setRenderTarget(u)}}var fd=256,r0=3,o0=20,Fd=256,Od=16,a0=3,l0=new k,c0=new Kt;class Xo{constructor(o){this._renderer=o,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new vr(1,10,null),this._boxMesh=new Ke(new Rs(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(o,l=0,c=0.1,h=100,u={}){let{size:d=256,position:f=l0}=u,p=this._renderer;this._setSize(d);let m=this._allocateTarget(),g=this._getSourceTarget(!0);if(l>0)g.texture.mipmapsAutoUpdate=!1;let{autoClear:x,autoClearColor:y,autoClearDepth:_,autoClearStencil:v}=p,T=o.background;if(p.autoClear=!0,p.autoClearColor=!0,p.autoClearDepth=!0,p.autoClearStencil=!0,T===null)o.background=p.getClearColor(c0);let w=new vr(c,h,g);if(w.position.copy(f),w.update(p,o),p.autoClear=x,p.autoClearColor=y,p.autoClearDepth=_,p.autoClearStencil=v,o.background=T,l>0)g.texture.mipmapsAutoUpdate=!0,this._blur(m,l);return this._applyPMREM(m),m}fromEquirectangular(o,l=null){return this._fromTexture(o,l)}fromCubemap(o,l=null){return this._fromTexture(o,l)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=gd(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=md(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(o,l){return l>0?1-Math.sqrt(1-o/l):0}_setSize(o){this._cubeSize=Math.max(fd,Ql(o))}_fromTexture(o,l){if(o.mapping===sr||o.mapping===bs)this._setSize(o.image.length===0?fd:o.image[0].width||o.image[0].image.width);else this._setSize(o.image.width/4);let c=l||this._allocateTarget();return this._textureToCubemap(o),this._applyPMREM(c),c}_allocateTarget(){let o=this._cubeSize,l=pd(o,!1,!1),c=Math.log2(o)-r0;for(let h=0;h<=c;h++)l.texture.mipmaps.push({width:o>>h,height:o>>h});return l.texture.name="PMREM",l.texture.isPMREMTexture=!0,l}_getSourceTarget(o=!1){let l=this._cubeSize,c=this._sourceTarget;if(c===null||c.width!==l||o&&c.depthBuffer===!1){if(c!==null)c.dispose();this._sourceTarget=pd(l,!0,o)}return this._sourceTarget}_compileMaterial(o){this._boxMesh.material=o,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(o,l,c){let h=this._boxMesh,u=this._cubeCamera;h.material=c,u.renderTarget=o,u.activeMipmapLevel=l;let d=o.width>>l;o.viewport.set(0,0,d,d),u.update(this._renderer,h),o.viewport.set(0,0,o.width,o.height)}_textureToCubemap(o){let l;if(o.mapping===sr||o.mapping===bs){if(this._cubemapMaterial===null)this._cubemapMaterial=gd();l=this._cubemapMaterial,l.uniforms.flipEnvMap.value=o.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=md();l=this._equirectMaterial}l.uniforms.envMap.value=o,this._renderCube(this._getSourceTarget(),0,l)}_applyPMREM(o){if(this._ggxMaterial===null)this._ggxMaterial=h0(),this._integrationMaterial=u0();let l=this._cubeSize,c=o.texture.mipmaps.length-1,h=this._ggxMaterial.uniforms;h.envMap.value=this._sourceTarget.texture;let u=this._integrationMaterial.uniforms;u.envMap.value=this._sourceTarget.texture,u.sourceLod.value=Math.log2(l/Od);for(let d=0;d<=c;d++){let f=Xo.lodToRoughness(d,c);if(d>c-a0)u.roughness.value=f,this._renderCube(o,d,this._integrationMaterial);else{let p=f>0?Math.log2(l)+0.5*Math.log2(6/(Fd*Math.pow(f,4)))+0.5:0;h.roughness.value=f,h.lodBias.value=p,this._renderCube(o,d,this._ggxMaterial)}}}_blur(o,l){if(this._blurMaterial===null)this._blurMaterial=d0();let c=this._blurMaterial,h=c.uniforms,u=this._sourceTarget;h.sigma.value=Math.min(l,Math.PI)/Math.SQRT2,h.envMap.value=u.texture,this._renderCube(o,0,c),h.envMap.value=o.texture,this._renderCube(u,0,c)}}function pd(o,l,c){return new qo(o,{minFilter:Bn,generateMipmaps:l,type:Xn,colorSpace:Xl,depthBuffer:c})}function Er(o,l,c){return new ui({name:o,uniforms:l,vertexShader:$t.cube_vert,fragmentShader:c,side:on,blending:ki,depthTest:!1,depthWrite:!1})}function h0(){return Er("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Fd}u

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
	`)}function u0(){return Er("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Od}},`

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
	`)}function d0(){return Er("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${o0}
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
	`)}function md(){return Er("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function gd(){return Er("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function f0(o){let l=new WeakMap,c=new WeakMap,h=null;function u(_,v=!1){if(_===null||_===void 0)return null;if(v)return f(_);return d(_)}function d(_){if(_&&_.isTexture){let v=_.mapping;if(v===mo||v===go)if(l.has(_)){let T=l.get(_).texture;return p(T,_.mapping)}else{let T=_.image;if(T&&T.height>0){let w=new qo(T.height);return w.fromEquirectangularTexture(o,_),l.set(_,w),_.addEventListener("dispose",g),p(w.texture,_.mapping)}else return null}}return _}function f(_){if(_&&_.isTexture&&_.isPMREMTexture!==!0){let v=_.mapping,T=v===mo||v===go,w=v===sr||v===bs;if(T||w){let S=c.get(_),M=S!==void 0?S.texture.pmremVersion:0;if(_.isRenderTargetTexture&&_.pmremVersion!==M){if(h===null)h=new Xo(o);return S=T?h.fromEquirectangular(_,S):h.fromCubemap(_,S),S.texture.pmremVersion=_.pmremVersion,c.set(_,S),S.texture}else if(S!==void 0)return S.texture;else{let E=_.image;if(T&&E&&E.height>0||w&&E&&m(E)){if(h===null)h=new Xo(o);return S=T?h.fromEquirectangular(_):h.fromCubemap(_),S.texture.pmremVersion=_.pmremVersion,c.set(_,S),_.addEventListener("dispose",x),S.texture}else return null}}}return _}function p(_,v){if(v===mo)_.mapping=sr;else if(v===go)_.mapping=bs;return _}function m(_){let v=0,T=6;for(let w=0;w<T;w++)if(_[w]!==void 0)v++;return v===T}function g(_){let v=_.target;v.removeEventListener("dispose",g);let T=l.get(v);if(T!==void 0)l.delete(v),T.dispose()}function x(_){let v=_.target;v.removeEventListener("dispose",x);let T=c.get(v);if(T!==void 0)c.delete(v),T.dispose()}function y(){if(l=new WeakMap,c=new WeakMap,h!==null)h.dispose(),h=null}return{get:u,dispose:y}}function p0(o){let l={};function c(h){if(l[h]!==void 0)return l[h];let u=o.getExtension(h);return l[h]=u,u}return{has:function(h){return c(h)!==null},init:function(){c("EXT_color_buffer_float"),c("WEBGL_clip_cull_distance"),c("OES_texture_float_linear"),c("EXT_color_buffer_half_float"),c("WEBGL_multisampled_render_to_texture"),c("WEBGL_render_shared_exponent")},get:function(h){let u=c(h);if(u===null)$s("WebGLRenderer: "+h+" extension not supported.");return u}}}function m0(o,l,c,h){let u={},d=new WeakMap,f=new FinalizationRegistry((T)=>delete u[T]);function p(T){m(T.target)}function m(T){if(T.index!==null)l.remove(T.index);for(let S in T.attributes)l.remove(T.attributes[S]);T.removeEventListener("dispose",p),delete u[T.id],f.unregister(T);let w=d.get(T);if(w)l.remove(w),d.delete(T);if(h.releaseStatesOfGeometry(T),T.isInstancedBufferGeometry===!0)delete T._maxInstanceCount;c.memory.geometries--}function g(T,w){if(u[w.id]!==void 0)return w;return w.addEventListener("dispose",p),u[w.id]=new WeakRef(w),f.register(w,w.id,w),c.memory.geometries++,w}function x(T){let w=T.attributes;for(let S in w)l.update(w[S],o.ARRAY_BUFFER)}function y(T){let w=T.index,S=T.attributes.position,M=0;if(S===void 0)return;let E=w!==null?w.array.length:S.array.length/3-1,A=new(S.count>=65535?Ro:wo)(Math.ceil(E/3)*6,1),P=A.array;if(w!==null){let b=w.array;M=w.version;for(let R=0,N=0;R<E;R+=3){let B=b[R+0],U=b[R+1],z=b[R+2];P[N++]=B,P[N++]=U,P[N++]=U,P[N++]=z,P[N++]=z,P[N++]=B}}else{M=S.version;for(let b=0,R=0;b<E;b+=3){let N=b+0,B=b+1,U=b+2;P[R++]=N,P[R++]=B,P[R++]=B,P[R++]=U,P[R++]=U,P[R++]=N}}A.version=M;let L=d.get(T);if(L)l.remove(L);d.set(T,A)}function _(T){let w=d.get(T);if(w){let S=T.index;if(S!==null){if(w.version<S.version)y(T)}}else y(T);return d.get(T)}function v(){for(let T in u){let w=u[T].deref();if(w!==void 0)m(w)}}return{get:g,update:x,getWireframeAttribute:_,dispose:v}}function g0(o,l,c){let h;function u(y){h=y}let d,f;function p(y){d=y.type,f=y.bytesPerElement}function m(y,_){o.drawElements(h,_,d,y*f),c.update(_,h,1)}function g(y,_,v){if(v===0)return;o.drawElementsInstanced(h,_,d,y*f,v),c.update(_,h,v)}function x(y,_,v){if(v===0)return;l.get("WEBGL_multi_draw").multiDrawElementsWEBGL(h,_,0,d,y,0,v);let w=0;for(let S=0;S<v;S++)w+=_[S];c.update(w,h,1)}this.setMode=u,this.setIndex=p,this.render=m,this.renderInstances=g,this.renderMultiDraw=x}function _0(o){let l={geometries:0,textures:0},c={frame:0,calls:0,triangles:0,points:0,lines:0};function h(d,f,p){switch(c.calls++,f){case o.TRIANGLES:c.triangles+=p*(d/3);break;case o.LINES:c.lines+=p*(d/2);break;case o.LINE_STRIP:c.lines+=p*(d-1);break;case o.LINE_LOOP:c.lines+=p*d;break;case o.POINTS:c.points+=p*d;break;default:Ht("WebGLInfo: Unknown draw mode:",f);break}}function u(){c.calls=0,c.triangles=0,c.points=0,c.lines=0}return{memory:l,render:c,programs:null,autoReset:!0,reset:u,update:h}}function x0(o,l,c){let h=new WeakMap,u=new Pe;function d(f,p,m){let g=f.morphTargetInfluences,x=p.morphAttributes.position||p.morphAttributes.normal||p.morphAttributes.color,y=x!==void 0?x.length:0,_=h.get(p);if(_===void 0||_.count!==y){let N=function(){b.dispose(),h.delete(p),p.removeEventListener("dispose",N)};if(_!==void 0)_.texture.dispose();let v=p.morphAttributes.position!==void 0,T=p.morphAttributes.normal!==void 0,w=p.morphAttributes.color!==void 0,S=p.morphAttributes.position||[],M=p.morphAttributes.normal||[],E=p.morphAttributes.color||[],C=0;if(v===!0)C=1;if(T===!0)C=2;if(w===!0)C=3;let A=p.attributes.position.count*C,P=1;if(A>l.maxTextureSize)P=Math.ceil(A/l.maxTextureSize),A=l.maxTextureSize;let L=new Float32Array(A*P*4*y),b=new Eo(L,A,P,y);b.type=ci,b.needsUpdate=!0;let R=C*4;for(let B=0;B<y;B++){let U=S[B],z=M[B],W=E[B],O=A*P*4*B;for(let q=0;q<U.count;q++){let j=q*R;if(v===!0)u.fromBufferAttribute(U,q),L[O+j+0]=u.x,L[O+j+1]=u.y,L[O+j+2]=u.z,L[O+j+3]=0;if(T===!0)u.fromBufferAttribute(z,q),L[O+j+4]=u.x,L[O+j+5]=u.y,L[O+j+6]=u.z,L[O+j+7]=0;if(w===!0)u.fromBufferAttribute(W,q),L[O+j+8]=u.x,L[O+j+9]=u.y,L[O+j+10]=u.z,L[O+j+11]=W.itemSize===4?u.w:1}}_={count:y,texture:b,size:new Dt(A,P)},h.set(p,_),p.addEventListener("dispose",N)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)m.getUniforms().setValue(o,"morphTexture",f.morphTexture,c);else{let v=0;for(let w=0;w<g.length;w++)v+=g[w];let T=p.morphTargetsRelative?1:1-v;m.getUniforms().setValue(o,"morphTargetBaseInfluence",T),m.getUniforms().setValue(o,"morphTargetInfluences",g)}m.getUniforms().setValue(o,"morphTargetsTexture",_.texture,c),m.getUniforms().setValue(o,"morphTargetsTextureSize",_.size)}return{update:d}}function y0(o,l,c,h,u){let d=new WeakMap;function f(g){let x=u.render.frame,y=g.geometry,_=l.get(g,y);if(d.get(_)!==x)l.update(_),d.set(_,x);if(g.isInstancedMesh){if(g.hasEventListener("dispose",m)===!1)g.addEventListener("dispose",m);if(d.get(g)!==x){if(c.update(g.instanceMatrix,o.ARRAY_BUFFER),g.instanceColor!==null)c.update(g.instanceColor,o.ARRAY_BUFFER);d.set(g,x)}}if(g.isSkinnedMesh){let v=g.skeleton;if(d.get(v)!==x)v.update(),d.set(v,x)}return _}function p(){d=new WeakMap}function m(g){let x=g.target;if(x.removeEventListener("dispose",m),h.releaseStatesOfObject(x),c.remove(x.instanceMatrix),x.instanceColor!==null)c.remove(x.instanceColor)}return{update:f,dispose:p}}var v0={[sl]:"LINEAR_TONE_MAPPING",[rl]:"REINHARD_TONE_MAPPING",[ol]:"CINEON_TONE_MAPPING",[al]:"ACES_FILMIC_TONE_MAPPING",[cl]:"AGX_TONE_MAPPING",[hl]:"NEUTRAL_TONE_MAPPING",[ll]:"CUSTOM_TONE_MAPPING"};function S0(o,l,c,h,u,d){let f=new In(l,c,{type:o,depthBuffer:u,stencilBuffer:d,samples:h?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),p=null,m=null,g=null,x=new xn;x.setAttribute("position",new En([-1,3,0,-1,-1,0,3,-1,0],3)),x.setAttribute("uv",new En([0,2,0,0,2,0],2));let y=new hc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),_=new Ke(x,y),v=new zo(-1,1,1,-1,0,1),T=null,w=null,S=!1,M,E=null,C=[],A=!1;this.setSize=function(P,L){if(f.setSize(P,L),p!==null)p.setSize(P,L);if(m!==null)m.setSize(P,L);for(let b=0;b<C.length;b++){let R=C[b];if(R.setSize)R.setSize(P,L)}},this.setEffects=function(P){C=P,A=C.length>0&&C[0].isRenderPass===!0;let{width:L,height:b}=f;if(C.length>0&&p===null)p=new In(L,b,{type:Xn,depthBuffer:!1,stencilBuffer:!1}),m=new In(L,b,{type:Xn,depthBuffer:!1,stencilBuffer:!1});let R=u===!0&&C.some((N)=>N.needsDepthTexture===!0);if(R!==(f.depthTexture!==null)){if(R===!0&&g===null){if(g=new Ai(L,b),d===!0)g.format=Ti,g.type=Hi}f.dispose(),f.depthTexture=R?g:null,f.resolveDepthBuffer=R,f.storeMultisampledDepthBuffer=R}for(let N=0;N<C.length;N++){let B=C[N];if(B.setSize)B.setSize(L,b);if(R&&B.needsDepthTexture===!0&&B.setDepthTexture)B.setDepthTexture(g)}},this.begin=function(P,L){if(S)return!1;if(P.toneMapping===Wn&&C.length===0)return!1;if(E=L,L!==null){let{width:b,height:R}=L;if(f.width!==b||f.height!==R)this.setSize(b,R)}if(A===!1)P.setRenderTarget(f);return M=P.toneMapping,P.toneMapping=Wn,!0},this.hasRenderPass=function(){return A},this.end=function(P,L){P.toneMapping=M,S=!0;let b=f,R=p;for(let N=0;N<C.length;N++){let B=C[N];if(B.enabled===!1)continue;if(B.render(P,R,b,L),B.needsSwap!==!1)b=R,R=R===p?m:p}if(T!==P.outputColorSpace||w!==P.toneMapping){if(T=P.outputColorSpace,w=P.toneMapping,y.defines={},te.getTransfer(T)===be)y.defines.SRGB_TRANSFER="";let N=v0[w];if(N)y.defines[N]="";y.needsUpdate=!0}y.uniforms.tDiffuse.value=b.texture,P.setRenderTarget(E),P.render(_,v),E=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){if(f.dispose(),p!==null)p.dispose();if(m!==null)m.dispose();x.dispose(),y.dispose()}}var Bd=new Oe,zd=new Ai(1,1),kd=new Do(1),Hd=new Eo,Gd=new rc,Vd=new Io,_d=[],xd=[],yd=new Float32Array(16),vd=new Float32Array(9),Sd=new Float32Array(4);function Cs(o,l,c){let h=o[0];if(h<=0||h>0)return o;let u=l*c,d=_d[u];if(d===void 0)d=new Float32Array(u),_d[u]=d;if(l!==0){h.toArray(d,0);for(let f=1,p=0;f!==l;++f)p+=c,o[f].toArray(d,p)}return d}function ze(o,l){if(o.length!==l.length)return!1;for(let c=0,h=o.length;c<h;c++)if(o[c]!==l[c])return!1;return!0}function ke(o,l){for(let c=0,h=l.length;c<h;c++)o[c]=l[c]}function Yo(o,l){let c=xd[l];if(c===void 0)c=new Int32Array(l),xd[l]=c;for(let h=0;h!==l;++h)c[h]=o.allocateTextureUnit();return c}function M0(o,l){let c=this.cache;if(c[0]===l)return;o.uniform1f(this.addr,l),c[0]=l}function b0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y)o.uniform2f(this.addr,l.x,l.y),c[0]=l.x,c[1]=l.y}else{if(ze(c,l))return;o.uniform2fv(this.addr,l),ke(c,l)}}function T0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z)o.uniform3f(this.addr,l.x,l.y,l.z),c[0]=l.x,c[1]=l.y,c[2]=l.z}else if(l.r!==void 0){if(c[0]!==l.r||c[1]!==l.g||c[2]!==l.b)o.uniform3f(this.addr,l.r,l.g,l.b),c[0]=l.r,c[1]=l.g,c[2]=l.b}else{if(ze(c,l))return;o.uniform3fv(this.addr,l),ke(c,l)}}function E0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z||c[3]!==l.w)o.uniform4f(this.addr,l.x,l.y,l.z,l.w),c[0]=l.x,c[1]=l.y,c[2]=l.z,c[3]=l.w}else{if(ze(c,l))return;o.uniform4fv(this.addr,l),ke(c,l)}}function A0(o,l){let c=this.cache,h=l.elements;if(h===void 0){if(ze(c,l))return;o.uniformMatrix2fv(this.addr,!1,l),ke(c,l)}else{if(ze(c,h))return;Sd.set(h),o.uniformMatrix2fv(this.addr,!1,Sd),ke(c,h)}}function w0(o,l){let c=this.cache,h=l.elements;if(h===void 0){if(ze(c,l))return;o.uniformMatrix3fv(this.addr,!1,l),ke(c,l)}else{if(ze(c,h))return;vd.set(h),o.uniformMatrix3fv(this.addr,!1,vd),ke(c,h)}}function R0(o,l){let c=this.cache,h=l.elements;if(h===void 0){if(ze(c,l))return;o.uniformMatrix4fv(this.addr,!1,l),ke(c,l)}else{if(ze(c,h))return;yd.set(h),o.uniformMatrix4fv(this.addr,!1,yd),ke(c,h)}}function C0(o,l){let c=this.cache;if(c[0]===l)return;o.uniform1i(this.addr,l),c[0]=l}function P0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y)o.uniform2i(this.addr,l.x,l.y),c[0]=l.x,c[1]=l.y}else{if(ze(c,l))return;o.uniform2iv(this.addr,l),ke(c,l)}}function I0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z)o.uniform3i(this.addr,l.x,l.y,l.z),c[0]=l.x,c[1]=l.y,c[2]=l.z}else{if(ze(c,l))return;o.uniform3iv(this.addr,l),ke(c,l)}}function D0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z||c[3]!==l.w)o.uniform4i(this.addr,l.x,l.y,l.z,l.w),c[0]=l.x,c[1]=l.y,c[2]=l.z,c[3]=l.w}else{if(ze(c,l))return;o.uniform4iv(this.addr,l),ke(c,l)}}function L0(o,l){let c=this.cache;if(c[0]===l)return;o.uniform1ui(this.addr,l),c[0]=l}function N0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y)o.uniform2ui(this.addr,l.x,l.y),c[0]=l.x,c[1]=l.y}else{if(ze(c,l))return;o.uniform2uiv(this.addr,l),ke(c,l)}}function U0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z)o.uniform3ui(this.addr,l.x,l.y,l.z),c[0]=l.x,c[1]=l.y,c[2]=l.z}else{if(ze(c,l))return;o.uniform3uiv(this.addr,l),ke(c,l)}}function F0(o,l){let c=this.cache;if(l.x!==void 0){if(c[0]!==l.x||c[1]!==l.y||c[2]!==l.z||c[3]!==l.w)o.uniform4ui(this.addr,l.x,l.y,l.z,l.w),c[0]=l.x,c[1]=l.y,c[2]=l.z,c[3]=l.w}else{if(ze(c,l))return;o.uniform4uiv(this.addr,l),ke(c,l)}}function Zo(o){if(o.version===0)o.compareFunction=Jl,o.needsUpdate=!0;return o}function O0(o,l,c){let h=this.cache,u=c.allocateTextureUnit();if(h[0]!==u)o.uniform1i(this.addr,u),h[0]=u;let d;if(this.type===o.SAMPLER_2D_SHADOW)d=Zo(zd);else d=Bd;c.setTexture2D(l||d,u)}function B0(o,l,c){let h=this.cache,u=c.allocateTextureUnit();if(h[0]!==u)o.uniform1i(this.addr,u),h[0]=u;c.setTexture3D(l||Gd,u)}function z0(o,l,c){let h=this.cache,u=c.allocateTextureUnit();if(h[0]!==u)o.uniform1i(this.addr,u),h[0]=u;let d;if(this.type===o.SAMPLER_CUBE_SHADOW)d=Zo(kd);else d=Vd;c.setTextureCube(l||d,u)}function k0(o,l,c){let h=this.cache,u=c.allocateTextureUnit();if(h[0]!==u)o.uniform1i(this.addr,u),h[0]=u;c.setTexture2DArray(l||Hd,u)}function H0(o){switch(o){case 5126:return M0;case 35664:return b0;case 35665:return T0;case 35666:return E0;case 35674:return A0;case 35675:return w0;case 35676:return R0;case 5124:case 35670:return C0;case 35667:case 35671:return P0;case 35668:case 35672:return I0;case 35669:case 35673:return D0;case 5125:return L0;case 36294:return N0;case 36295:return U0;case 36296:return F0;case 35678:case 36198:case 36298:case 36306:case 35682:return O0;case 35679:case 36299:case 36307:return B0;case 35680:case 36300:case 36308:case 36293:return z0;case 36289:case 36303:case 36311:case 36292:return k0}}function G0(o,l){o.uniform1fv(this.addr,l)}function V0(o,l){let c=Cs(l,this.size,2);o.uniform2fv(this.addr,c)}function W0(o,l){let c=Cs(l,this.size,3);o.uniform3fv(this.addr,c)}function X0(o,l){let c=Cs(l,this.size,4);o.uniform4fv(this.addr,c)}function q0(o,l){let c=Cs(l,this.size,4);o.uniformMatrix2fv(this.addr,!1,c)}function Y0(o,l){let c=Cs(l,this.size,9);o.uniformMatrix3fv(this.addr,!1,c)}function Z0(o,l){let c=Cs(l,this.size,16);o.uniformMatrix4fv(this.addr,!1,c)}function J0(o,l){o.uniform1iv(this.addr,l)}function K0(o,l){o.uniform2iv(this.addr,l)}function $0(o,l){o.uniform3iv(this.addr,l)}function j0(o,l){o.uniform4iv(this.addr,l)}function Q0(o,l){o.uniform1uiv(this.addr,l)}function tx(o,l){o.uniform2uiv(this.addr,l)}function ex(o,l){o.uniform3uiv(this.addr,l)}function nx(o,l){o.uniform4uiv(this.addr,l)}function ix(o,l,c){let h=this.cache,u=l.length,d=Yo(c,u);if(!ze(h,d))o.uniform1iv(this.addr,d),ke(h,d);let f;if(this.type===o.SAMPLER_2D_SHADOW)f=Zo(zd);else f=Bd;for(let p=0;p!==u;++p)c.setTexture2D(l[p]||f,d[p])}function sx(o,l,c){let h=this.cache,u=l.length,d=Yo(c,u);if(!ze(h,d))o.uniform1iv(this.addr,d),ke(h,d);for(let f=0;f!==u;++f)c.setTexture3D(l[f]||Gd,d[f])}function rx(o,l,c){let h=this.cache,u=l.length,d=Yo(c,u);if(!ze(h,d))o.uniform1iv(this.addr,d),ke(h,d);let f;if(this.type===o.SAMPLER_CUBE_SHADOW)f=Zo(kd);else f=Vd;for(let p=0;p!==u;++p)c.setTextureCube(l[p]||f,d[p])}function ox(o,l,c){let h=this.cache,u=l.length,d=Yo(c,u);if(!ze(h,d))o.uniform1iv(this.addr,d),ke(h,d);for(let f=0;f!==u;++f)c.setTexture2DArray(l[f]||Hd,d[f])}function ax(o){switch(o){case 5126:return G0;case 35664:return V0;case 35665:return W0;case 35666:return X0;case 35674:return q0;case 35675:return Y0;case 35676:return Z0;case 5124:case 35670:return J0;case 35667:case 35671:return K0;case 35668:case 35672:return $0;case 35669:case 35673:return j0;case 5125:return Q0;case 36294:return tx;case 36295:return ex;case 36296:return nx;case 35678:case 36198:case 36298:case 36306:case 35682:return ix;case 35679:case 36299:case 36307:return sx;case 35680:case 36300:case 36308:case 36293:return rx;case 36289:case 36303:case 36311:case 36292:return ox}}class Wd{constructor(o,l,c){this.id=o,this.addr=c,this.cache=[],this.type=l.type,this.setValue=H0(l.type)}}class Xd{constructor(o,l,c){this.id=o,this.addr=c,this.cache=[],this.type=l.type,this.size=l.size,this.setValue=ax(l.type)}}class qd{constructor(o){this.id=o,this.seq=[],this.map={}}setValue(o,l,c){let h=this.seq;for(let u=0,d=h.length;u!==d;++u){let f=h[u];f.setValue(o,l[f.id],c)}}}var Rc=/(\w+)(\])?(\[|\.)?/g;function Md(o,l){o.seq.push(l),o.map[l.id]=l}function lx(o,l,c){let h=o.name,u=h.length;Rc.lastIndex=0;while(!0){let d=Rc.exec(h),f=Rc.lastIndex,p=d[1],m=d[2]==="]",g=d[3];if(m)p=p|0;if(g===void 0||g==="["&&f+2===u){Md(c,g===void 0?new Wd(p,o,l):new Xd(p,o,l));break}else{let y=c.map[p];if(y===void 0)y=new qd(p),Md(c,y);c=y}}}class Tr{constructor(o,l){this.seq=[],this.map={};let c=o.getProgramParameter(l,o.ACTIVE_UNIFORMS);for(let d=0;d<c;++d){let f=o.getActiveUniform(l,d),p=o.getUniformLocation(l,f.name);lx(f,p,this)}let h=[],u=[];for(let d of this.seq)if(d.type===o.SAMPLER_2D_SHADOW||d.type===o.SAMPLER_CUBE_SHADOW||d.type===o.SAMPLER_2D_ARRAY_SHADOW)h.push(d);else u.push(d);if(h.length>0)this.seq=h.concat(u)}setValue(o,l,c,h){let u=this.map[l];if(u!==void 0)u.setValue(o,c,h)}setOptional(o,l,c){let h=l[c];if(h!==void 0)this.setValue(o,c,h)}static upload(o,l,c,h){for(let u=0,d=l.length;u!==d;++u){let f=l[u],p=c[f.id];if(p.needsUpdate!==!1)f.setValue(o,p.value,h)}}static seqWithValue(o,l){let c=[];for(let h=0,u=o.length;h!==u;++h){let d=o[h];if(d.id in l)c.push(d)}return c}}function bd(o,l,c){let h=o.createShader(l);return o.shaderSource(h,c),o.compileShader(h),h}var cx=37297,hx=0;function ux(o,l){let c=o.split(`
`),h=[],u=Math.max(l-6,0),d=Math.min(l+6,c.length);for(let f=u;f<d;f++){let p=f+1;h.push(`${p===l?">":" "} ${p}: ${c[f]}`)}return h.join(`
`)}var Td=new Gt;function dx(o){te._getMatrix(Td,te.workingColorSpace,o);let l=`mat3( ${Td.elements.map((c)=>c.toFixed(4))} )`;switch(te.getTransfer(o)){case ql:return[l,"LinearTransferOETF"];case be:return[l,"sRGBTransferOETF"];default:return Bt("WebGLProgram: Unsupported color space: ",o),[l,"LinearTransferOETF"]}}function Ed(o,l,c){let h=o.getShaderParameter(l,o.COMPILE_STATUS),d=(o.getShaderInfoLog(l)||"").trim();if(h&&d==="")return"";let f=/ERROR: 0:(\d+)/.exec(d);if(f){let p=parseInt(f[1]);return c.toUpperCase()+`

`+d+`

`+ux(o.getShaderSource(l),p)}else return d}function fx(o,l){let c=dx(l);return[`vec4 ${o}( vec4 value ) {`,`	return ${c[1]}( vec4( ${c[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var px={[sl]:"Linear",[rl]:"Reinhard",[ol]:"Cineon",[al]:"ACESFilmic",[cl]:"AgX",[hl]:"Neutral",[ll]:"Custom"};function mx(o,l){let c=px[l];if(c===void 0)return Bt("WebGLProgram: Unsupported toneMapping:",l),"vec3 "+o+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+o+"( vec3 color ) { return "+c+"ToneMapping( color ); }"}var Wo=new k;function gx(){te.getLuminanceCoefficients(Wo);let o=Wo.x.toFixed(4),l=Wo.y.toFixed(4),c=Wo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${o}, ${l}, ${c} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function _x(o){return[o.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",o.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(br).join(`
`)}function xx(o){let l=[];for(let c in o){let h=o[c];if(h===!1)continue;l.push("#define "+c+" "+h)}return l.join(`
`)}function yx(o,l){let c={},h=o.getProgramParameter(l,o.ACTIVE_ATTRIBUTES);for(let u=0;u<h;u++){let d=o.getActiveAttrib(l,u),f=d.name,p=1;if(d.type===o.FLOAT_MAT2)p=2;if(d.type===o.FLOAT_MAT3)p=3;if(d.type===o.FLOAT_MAT4)p=4;c[f]={type:d.type,location:o.getAttribLocation(l,f),locationSize:p}}return c}function br(o){return o!==""}function Ad(o,l){let c=l.numSpotLightShadows+l.numSpotLightMaps-l.numSpotLightShadowsWithMaps;return o.replace(/NUM_SUN_LIGHTS/g,l.numSunLights).replace(/NUM_DIR_LIGHTS/g,l.numDirLights).replace(/NUM_SPOT_LIGHTS/g,l.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,l.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,c).replace(/NUM_RECT_AREA_LIGHTS/g,l.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,l.numPointLights).replace(/NUM_HEMI_LIGHTS/g,l.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,l.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,l.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,l.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,l.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,l.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,l.numLightProbeGrids)}function wd(o,l){return o.replace(/NUM_CLIPPING_PLANES/g,l.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,l.numClippingPlanes-l.numClipIntersection)}var vx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Pc(o){return o.replace(vx,Sx)}function Sx(o,l){let c=$t[l];if(c===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+l+">");return Pc(c)}var Mx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rd(o){return o.replace(Mx,bx)}function bx(o,l,c,h){let u="";for(let d=parseInt(l);d<parseInt(c);d++)u+=h.replace(/\[\s*i\s*\]/g,"[ "+d+" ]").replace(/UNROLLED_LOOP_INDEX/g,d);return u}function Cd(o){let l=`precision ${o.precision} float;
	precision ${o.precision} int;
	precision ${o.precision} sampler2D;
	precision ${o.precision} samplerCube;
	precision ${o.precision} sampler3D;
	precision ${o.precision} sampler2DArray;
	precision ${o.precision} sampler2DShadow;
	precision ${o.precision} samplerCubeShadow;
	precision ${o.precision} sampler2DArrayShadow;
	precision ${o.precision} isampler2D;
	precision ${o.precision} isampler3D;
	precision ${o.precision} isamplerCube;
	precision ${o.precision} isampler2DArray;
	precision ${o.precision} usampler2D;
	precision ${o.precision} usampler3D;
	precision ${o.precision} usamplerCube;
	precision ${o.precision} usampler2DArray;
	`;if(o.precision==="highp")l+=`
#define HIGH_PRECISION`;else if(o.precision==="mediump")l+=`
#define MEDIUM_PRECISION`;else if(o.precision==="lowp")l+=`
#define LOW_PRECISION`;return l}var Tx={[nr]:"SHADOWMAP_TYPE_PCF",[Ss]:"SHADOWMAP_TYPE_VSM"};function Ex(o){return Tx[o.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Ax={[bs]:"ENVMAP_MODE_REFRACTION"};function wx(o){if(o.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Ax[o.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Rx={[Fu]:"ENVMAP_BLENDING_MULTIPLY",[Ou]:"ENVMAP_BLENDING_MIX",[Bu]:"ENVMAP_BLENDING_ADD"};function Cx(o){if(o.envMap===!1)return"ENVMAP_BLENDING_NONE";return Rx[o.combine]||"ENVMAP_BLENDING_NONE"}function Px(o,l,c,h){let u=o.getContext(),{defines:d,vertexShader:f,fragmentShader:p}=c,m=Ex(c),g=c.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",x=wx(c),y=Cx(c),_=_x(c),v=xx(d),T=u.createProgram(),w,S,M=c.glslVersion?"#version "+c.glslVersion+`
`:"";if(c.isRawShaderMaterial){if(w=["#define SHADER_TYPE "+c.shaderType,"#define SHADER_NAME "+c.shaderName,v].filter(br).join(`
`),w.length>0)w+=`
`;if(S=["#define SHADER_TYPE "+c.shaderType,"#define SHADER_NAME "+c.shaderName,v].filter(br).join(`
`),S.length>0)S+=`
`}else w=[Cd(c),"#define SHADER_TYPE "+c.shaderType,"#define SHADER_NAME "+c.shaderName,v,c.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",c.batching?"#define USE_BATCHING":"",c.batchingColor?"#define USE_BATCHING_COLOR":"",c.instancing?"#define USE_INSTANCING":"",c.instancingColor?"#define USE_INSTANCING_COLOR":"",c.instancingMorph?"#define USE_INSTANCING_MORPH":"",c.useFog&&c.fog?"#define USE_FOG":"",c.useFog&&c.fogExp2?"#define FOG_EXP2":"",c.map?"#define USE_MAP":"",c.envMap?"#define USE_ENVMAP":"",c.envMap?"#define "+x:"",c.lightMap?"#define USE_LIGHTMAP":"",c.aoMap?"#define USE_AOMAP":"",c.bumpMap?"#define USE_BUMPMAP":"",c.normalMap?"#define USE_NORMALMAP":"",c.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",c.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",c.displacementMap?"#define USE_DISPLACEMENTMAP":"",c.emissiveMap?"#define USE_EMISSIVEMAP":"",c.anisotropy?"#define USE_ANISOTROPY":"",c.anisotropyMap?"#define USE_ANISOTROPYMAP":"",c.clearcoatMap?"#define USE_CLEARCOATMAP":"",c.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",c.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",c.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",c.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",c.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",c.specularMap?"#define USE_SPECULARMAP":"",c.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",c.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",c.roughnessMap?"#define USE_ROUGHNESSMAP":"",c.metalnessMap?"#define USE_METALNESSMAP":"",c.alphaMap?"#define USE_ALPHAMAP":"",c.alphaHash?"#define USE_ALPHAHASH":"",c.transmission?"#define USE_TRANSMISSION":"",c.transmissionMap?"#define USE_TRANSMISSIONMAP":"",c.thicknessMap?"#define USE_THICKNESSMAP":"",c.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",c.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",c.mapUv?"#define MAP_UV "+c.mapUv:"",c.alphaMapUv?"#define ALPHAMAP_UV "+c.alphaMapUv:"",c.lightMapUv?"#define LIGHTMAP_UV "+c.lightMapUv:"",c.aoMapUv?"#define AOMAP_UV "+c.aoMapUv:"",c.emissiveMapUv?"#define EMISSIVEMAP_UV "+c.emissiveMapUv:"",c.bumpMapUv?"#define BUMPMAP_UV "+c.bumpMapUv:"",c.normalMapUv?"#define NORMALMAP_UV "+c.normalMapUv:"",c.displacementMapUv?"#define DISPLACEMENTMAP_UV "+c.displacementMapUv:"",c.metalnessMapUv?"#define METALNESSMAP_UV "+c.metalnessMapUv:"",c.roughnessMapUv?"#define ROUGHNESSMAP_UV "+c.roughnessMapUv:"",c.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+c.anisotropyMapUv:"",c.clearcoatMapUv?"#define CLEARCOATMAP_UV "+c.clearcoatMapUv:"",c.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+c.clearcoatNormalMapUv:"",c.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+c.clearcoatRoughnessMapUv:"",c.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+c.diffuseRoughnessMapUv:"",c.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+c.iridescenceMapUv:"",c.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+c.iridescenceThicknessMapUv:"",c.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+c.sheenColorMapUv:"",c.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+c.sheenRoughnessMapUv:"",c.specularMapUv?"#define SPECULARMAP_UV "+c.specularMapUv:"",c.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+c.specularColorMapUv:"",c.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+c.specularIntensityMapUv:"",c.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+c.transmissionMapUv:"",c.thicknessMapUv?"#define THICKNESSMAP_UV "+c.thicknessMapUv:"",c.vertexTangents&&c.flatShading===!1?"#define USE_TANGENT":"",c.vertexNormals?"#define HAS_NORMAL":"",c.vertexColors?"#define USE_COLOR":"",c.vertexAlphas?"#define USE_COLOR_ALPHA":"",c.vertexUv1s?"#define USE_UV1":"",c.vertexUv2s?"#define USE_UV2":"",c.vertexUv3s?"#define USE_UV3":"",c.pointsUvs?"#define USE_POINTS_UV":"",c.flatShading?"#define FLAT_SHADED":"",c.skinning?"#define USE_SKINNING":"",c.morphTargets?"#define USE_MORPHTARGETS":"",c.morphNormals&&c.flatShading===!1?"#define USE_MORPHNORMALS":"",c.morphColors?"#define USE_MORPHCOLORS":"",c.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+c.morphTextureStride:"",c.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+c.morphTargetsCount:"",c.doubleSided?"#define DOUBLE_SIDED":"",c.flipSided?"#define FLIP_SIDED":"",c.shadowMapEnabled?"#define USE_SHADOWMAP":"",c.shadowMapEnabled?"#define "+m:"",c.sizeAttenuation?"#define USE_SIZEATTENUATION":"",c.numLightProbes>0?"#define USE_LIGHT_PROBES":"",c.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",c.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(br).join(`
`),S=[Cd(c),"#define SHADER_TYPE "+c.shaderType,"#define SHADER_NAME "+c.shaderName,v,c.useFog&&c.fog?"#define USE_FOG":"",c.useFog&&c.fogExp2?"#define FOG_EXP2":"",c.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",c.map?"#define USE_MAP":"",c.matcap?"#define USE_MATCAP":"",c.envMap?"#define USE_ENVMAP":"",c.envMap?"#define "+g:"",c.envMap?"#define "+x:"",c.envMap?"#define "+y:"",c.envMapPMREM?"#define ENVMAP_MAX_LOD "+c.envMapMaxLod+".0":"",c.envMapPMREM?"#define ENVMAP_SIZE "+c.envMapSize+".0":"",c.lightMap?"#define USE_LIGHTMAP":"",c.aoMap?"#define USE_AOMAP":"",c.bumpMap?"#define USE_BUMPMAP":"",c.normalMap?"#define USE_NORMALMAP":"",c.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",c.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",c.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",c.emissiveMap?"#define USE_EMISSIVEMAP":"",c.anisotropy?"#define USE_ANISOTROPY":"",c.anisotropyMap?"#define USE_ANISOTROPYMAP":"",c.clearcoat?"#define USE_CLEARCOAT":"",c.clearcoatMap?"#define USE_CLEARCOATMAP":"",c.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",c.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",c.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",c.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",c.dispersion?"#define USE_DISPERSION":"",c.retroreflection?"#define USE_RETROREFLECTION":"",c.iridescence?"#define USE_IRIDESCENCE":"",c.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",c.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",c.specularMap?"#define USE_SPECULARMAP":"",c.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",c.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",c.roughnessMap?"#define USE_ROUGHNESSMAP":"",c.metalnessMap?"#define USE_METALNESSMAP":"",c.alphaMap?"#define USE_ALPHAMAP":"",c.alphaTest?"#define USE_ALPHATEST":"",c.alphaHash?"#define USE_ALPHAHASH":"",c.sheen?"#define USE_SHEEN":"",c.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",c.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",c.transmission?"#define USE_TRANSMISSION":"",c.transmissionMap?"#define USE_TRANSMISSIONMAP":"",c.thicknessMap?"#define USE_THICKNESSMAP":"",c.vertexTangents&&c.flatShading===!1?"#define USE_TANGENT":"",c.vertexColors||c.instancingColor?"#define USE_COLOR":"",c.vertexAlphas||c.batchingColor?"#define USE_COLOR_ALPHA":"",c.vertexUv1s?"#define USE_UV1":"",c.vertexUv2s?"#define USE_UV2":"",c.vertexUv3s?"#define USE_UV3":"",c.pointsUvs?"#define USE_POINTS_UV":"",c.gradientMap?"#define USE_GRADIENTMAP":"",c.flatShading?"#define FLAT_SHADED":"",c.doubleSided?"#define DOUBLE_SIDED":"",c.flipSided?"#define FLIP_SIDED":"",c.shadowMapEnabled?"#define USE_SHADOWMAP":"",c.shadowMapEnabled?"#define "+m:"",c.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",c.numLightProbes>0?"#define USE_LIGHT_PROBES":"",c.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",c.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",c.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",c.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",c.toneMapping!==Wn?"#define TONE_MAPPING":"",c.toneMapping!==Wn?$t.tonemapping_pars_fragment:"",c.toneMapping!==Wn?mx("toneMapping",c.toneMapping):"",c.dithering?"#define DITHERING":"",c.opaque?"#define OPAQUE":"",$t.colorspace_pars_fragment,fx("linearToOutputTexel",c.outputColorSpace),gx(),c.useDepthPacking?"#define DEPTH_PACKING "+c.depthPacking:"",`
`].filter(br).join(`
`);if(f=Pc(f),f=Ad(f,c),f=wd(f,c),p=Pc(p),p=Ad(p,c),p=wd(p,c),f=Rd(f),p=Rd(p),c.isRawShaderMaterial!==!0)M=`#version 300 es
`,w=[_,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+w,S=["#define varying in",c.glslVersion===Kl?"":"layout(location = 0) out highp vec4 pc_fragColor;",c.glslVersion===Kl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+S;let E=M+w+f,C=M+S+p,A=bd(u,u.VERTEX_SHADER,E),P=bd(u,u.FRAGMENT_SHADER,C);if(u.attachShader(T,A),u.attachShader(T,P),c.index0AttributeName!==void 0)u.bindAttribLocation(T,0,c.index0AttributeName);else if(c.hasPositionAttribute===!0)u.bindAttribLocation(T,0,"position");u.linkProgram(T);function L(B){if(o.debug.checkShaderErrors){let U=u.getProgramInfoLog(T)||"",z=u.getShaderInfoLog(A)||"",W=u.getShaderInfoLog(P)||"",O=U.trim(),q=z.trim(),j=W.trim(),X=!0,ht=!0;if(u.getProgramParameter(T,u.LINK_STATUS)===!1)if(X=!1,typeof o.debug.onShaderError==="function")o.debug.onShaderError(u,T,A,P);else{let Q=Ed(u,A,"vertex"),rt=Ed(u,P,"fragment");Ht("WebGLProgram: Shader Error "+u.getError()+" - VALIDATE_STATUS "+u.getProgramParameter(T,u.VALIDATE_STATUS)+`

Material Name: `+B.name+`
Material Type: `+B.type+`

Program Info Log: `+O+`
`+Q+`
`+rt)}else if(O!=="")Bt("WebGLProgram: Program Info Log:",O);else if(q===""||j==="")ht=!1;if(ht)B.diagnostics={runnable:X,programLog:O,vertexShader:{log:q,prefix:w},fragmentShader:{log:j,prefix:S}}}u.deleteShader(A),u.deleteShader(P),b=new Tr(u,T),R=yx(u,T)}let b;this.getUniforms=function(){if(b===void 0)L(this);return b};let R;this.getAttributes=function(){if(R===void 0)L(this);return R};let N=c.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(N===!1)N=u.getProgramParameter(T,cx);return N},this.destroy=function(){h.releaseStatesOfProgram(this),u.deleteProgram(T),this.program=void 0},this.type=c.shaderType,this.name=c.shaderName,this.id=hx++,this.cacheKey=l,this.usedTimes=1,this.program=T,this.vertexShader=A,this.fragmentShader=P,this}var Ix=0;class Yd{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(o,l,c){let h=this._getShaderCacheForMaterial(o);if(h.has(l)===!1)h.add(l),l.usedTimes++;if(h.has(c)===!1)h.add(c),c.usedTimes++;return this}remove(o){let l=this.materialCache.get(o);for(let c of l)if(c.usedTimes--,c.usedTimes===0)this.shaderCache.delete(c.code);return this.materialCache.delete(o),this}getVertexShaderStage(o){return this._getShaderStage(o.vertexShader)}getFragmentShaderStage(o){return this._getShaderStage(o.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(o){let l=this.materialCache,c=l.get(o);if(c===void 0)c=new Set,l.set(o,c);return c}_getShaderStage(o){let l=this.shaderCache,c=l.get(o);if(c===void 0)c=new Zd(o),l.set(o,c);return c}}class Zd{constructor(o){this.id=Ix++,this.code=o,this.usedTimes=0}}function Dx(o){return o===Gi||o===So||o===Mo}function Lx(o,l,c,h,u,d){let f=new ur,p=new Yd,m=new Set,g=[],x=new Map,y=h.logarithmicDepthBuffer,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(b){if(m.add(b),b===0)return"uv";return`uv${b}`}function T(b,R,N,B,U,z){let W=B.fog,O=U.geometry,q=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?B.environment:null,j=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,X=l.get(b.envMap||q,j),ht=_[b.type],Q=h.precision;if(b.precision!==null){if(Q=h.getMaxPrecision(b.precision),Q!==b.precision)Bt("WebGLProgram.getParameters:",b.precision,"not supported, using",Q,"instead.")}let rt=O.morphAttributes.position||O.morphAttributes.normal||O.morphAttributes.color,ct=rt!==void 0?rt.length:0,At=0;if(O.morphAttributes.position!==void 0)At=1;if(O.morphAttributes.normal!==void 0)At=2;if(O.morphAttributes.color!==void 0)At=3;let et,at,Tt,Nt;if(ht){let Mt=Jn[ht];et=Mt.vertexShader,at=Mt.fragmentShader}else{et=b.vertexShader,at=b.fragmentShader;let Mt=p.getVertexShaderStage(b),xe=p.getFragmentShaderStage(b);p.update(b,Mt,xe),Tt=Mt.id,Nt=xe.id}let Ut=o.getRenderTarget(),Et=o.state.buffers.depth.getReversed(),jt=U.isInstancedMesh===!0,Zt=U.isBatchedMesh===!0,Pt=!!b.map,Vt=!!b.matcap,kt=!!X,ae=kt&&X.isPMREMTexture===!0,le=!!b.aoMap,me=!!b.lightMap,Se=!!b.bumpMap&&b.wireframe===!1,Qt=!!b.normalMap,oe=!!b.displacementMap,De=!!b.emissiveMap,Le=!!b.metalnessMap,hn=!!b.roughnessMap,V=b.anisotropy>0,un=b.clearcoat>0,fe=b.diffuseRoughness>0,Ge=b.dispersion>0,yt=b.retroreflectivity>0,Ae=b.iridescence>0,zt=b.sheen>0,Wt=b.transmission>0,je=V&&!!b.anisotropyMap,F=un&&!!b.clearcoatMap,I=un&&!!b.clearcoatNormalMap,Y=un&&!!b.clearcoatRoughnessMap,lt=fe&&!!b.diffuseRoughnessMap,ot=Ae&&!!b.iridescenceMap,ft=Ae&&!!b.iridescenceThicknessMap,gt=zt&&!!b.sheenColorMap,tt=zt&&!!b.sheenRoughnessMap,st=!!b.specularMap,pt=!!b.specularColorMap,H=!!b.specularIntensityMap,it=Wt&&!!b.transmissionMap,nt=Wt&&!!b.thicknessMap,ut=!!b.gradientMap,dt=!!b.alphaMap,xt=b.alphaTest>0,Ft=!!b.alphaHash,Lt=!!b.extensions,St=Wn;if(b.toneMapped){if(Ut===null||Ut.isXRRenderTarget===!0)St=o.toneMapping}let Ot=ae?X.isCompressedCubeTexture?X.image[0].mipmaps:X.mipmaps:null,Jt={shaderID:ht,shaderType:b.type,shaderName:b.name,vertexShader:et,fragmentShader:at,defines:b.defines,customVertexShaderID:Tt,customFragmentShaderID:Nt,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:Q,batching:Zt,batchingColor:Zt&&U._colorsTexture!==null,instancing:jt,instancingColor:jt&&U.instanceColor!==null,instancingMorph:jt&&U.morphTexture!==null,outputColorSpace:Ut===null?o.outputColorSpace:Ut.isXRRenderTarget===!0?Ut.texture.colorSpace:te.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:Pt,matcap:Vt,envMap:kt,envMapMode:kt&&X.mapping,envMapPMREM:ae,envMapMaxLod:ae?Ot.length-1:null,envMapSize:ae?Ot[0].width:null,aoMap:le,lightMap:me,bumpMap:Se,normalMap:Qt,displacementMap:oe,emissiveMap:De,normalMapObjectSpace:Qt&&b.normalMapType===Zu,normalMapTangentSpace:Qt&&b.normalMapType===Wl,packedNormalMap:Qt&&b.normalMapType===Wl&&Dx(b.normalMap.format),metalnessMap:Le,roughnessMap:hn,anisotropy:V,anisotropyMap:je,clearcoat:un,clearcoatMap:F,clearcoatNormalMap:I,clearcoatRoughnessMap:Y,diffuseRoughness:fe,diffuseRoughnessMap:lt,dispersion:Ge,retroreflection:yt,iridescence:Ae,iridescenceMap:ot,iridescenceThicknessMap:ft,sheen:zt,sheenColorMap:gt,sheenRoughnessMap:tt,specularMap:st,specularColorMap:pt,specularIntensityMap:H,transmission:Wt,transmissionMap:it,thicknessMap:nt,gradientMap:ut,opaque:b.transparent===!1&&b.blending===ir&&b.alphaToCoverage===!1,alphaMap:dt,alphaTest:xt,alphaHash:Ft,combine:b.combine,mapUv:Pt&&v(b.map.channel),aoMapUv:le&&v(b.aoMap.channel),lightMapUv:me&&v(b.lightMap.channel),bumpMapUv:Se&&v(b.bumpMap.channel),normalMapUv:Qt&&v(b.normalMap.channel),displacementMapUv:oe&&v(b.displacementMap.channel),emissiveMapUv:De&&v(b.emissiveMap.channel),metalnessMapUv:Le&&v(b.metalnessMap.channel),roughnessMapUv:hn&&v(b.roughnessMap.channel),anisotropyMapUv:je&&v(b.anisotropyMap.channel),clearcoatMapUv:F&&v(b.clearcoatMap.channel),clearcoatNormalMapUv:I&&v(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Y&&v(b.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:lt&&v(b.diffuseRoughnessMap.channel),iridescenceMapUv:ot&&v(b.iridescenceMap.channel),iridescenceThicknessMapUv:ft&&v(b.iridescenceThicknessMap.channel),sheenColorMapUv:gt&&v(b.sheenColorMap.channel),sheenRoughnessMapUv:tt&&v(b.sheenRoughnessMap.channel),specularMapUv:st&&v(b.specularMap.channel),specularColorMapUv:pt&&v(b.specularColorMap.channel),specularIntensityMapUv:H&&v(b.specularIntensityMap.channel),transmissionMapUv:it&&v(b.transmissionMap.channel),thicknessMapUv:nt&&v(b.thicknessMap.channel),alphaMapUv:dt&&v(b.alphaMap.channel),vertexTangents:!!O.attributes.tangent&&(Qt||V),vertexNormals:!!O.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!O.attributes.color&&O.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!O.attributes.uv&&(Pt||dt),fog:!!W,useFog:b.fog===!0,fogExp2:!!W&&W.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||O.attributes.normal===void 0&&Qt===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:y,reversedDepthBuffer:Et,skinning:U.isSkinnedMesh===!0,hasPositionAttribute:O.attributes.position!==void 0,morphTargets:O.morphAttributes.position!==void 0,morphNormals:O.morphAttributes.normal!==void 0,morphColors:O.morphAttributes.color!==void 0,morphTargetsCount:ct,morphTextureStride:At,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:z.filter((Mt)=>Mt.texture!==null).length,numClippingPlanes:d.numPlanes,numClipIntersection:d.numIntersection,dithering:b.dithering,shadowMapEnabled:o.shadowMap.enabled&&N.length>0,shadowMapType:o.shadowMap.type,toneMapping:St,decodeVideoTexture:Pt&&b.map.isVideoTexture===!0&&te.getTransfer(b.map.colorSpace)===be,decodeVideoTextureEmissive:De&&b.emissiveMap.isVideoTexture===!0&&te.getTransfer(b.emissiveMap.colorSpace)===be,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Rn,flipSided:b.side===on,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Lt&&b.extensions.clipCullDistance===!0&&c.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Lt&&b.extensions.multiDraw===!0||Zt)&&c.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:c.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Jt.vertexUv1s=m.has(1),Jt.vertexUv2s=m.has(2),Jt.vertexUv3s=m.has(3),m.clear(),Jt}function w(b){let R=[];if(b.shaderID)R.push(b.shaderID);else R.push(b.customVertexShaderID),R.push(b.customFragmentShaderID);if(b.defines!==void 0)for(let N in b.defines)R.push(N),R.push(b.defines[N]);if(b.isRawShaderMaterial===!1)S(R,b),M(R,b),R.push(o.outputColorSpace);return R.push(b.customProgramCacheKey),R.join()}function S(b,R){b.push(R.precision),b.push(R.outputColorSpace),b.push(R.envMapMode),b.push(R.envMapPMREM),b.push(R.envMapMaxLod),b.push(R.envMapSize),b.push(R.mapUv),b.push(R.alphaMapUv),b.push(R.lightMapUv),b.push(R.aoMapUv),b.push(R.bumpMapUv),b.push(R.normalMapUv),b.push(R.displacementMapUv),b.push(R.emissiveMapUv),b.push(R.metalnessMapUv),b.push(R.roughnessMapUv),b.push(R.anisotropyMapUv),b.push(R.clearcoatMapUv),b.push(R.clearcoatNormalMapUv),b.push(R.clearcoatRoughnessMapUv),b.push(R.diffuseRoughnessMapUv),b.push(R.iridescenceMapUv),b.push(R.iridescenceThicknessMapUv),b.push(R.sheenColorMapUv),b.push(R.sheenRoughnessMapUv),b.push(R.specularMapUv),b.push(R.specularColorMapUv),b.push(R.specularIntensityMapUv),b.push(R.transmissionMapUv),b.push(R.thicknessMapUv),b.push(R.combine),b.push(R.fogExp2),b.push(R.sizeAttenuation),b.push(R.morphTargetsCount),b.push(R.numSunLights),b.push(R.numDirLights),b.push(R.numPointLights),b.push(R.numSpotLights),b.push(R.numSpotLightMaps),b.push(R.numHemiLights),b.push(R.numRectAreaLights),b.push(R.numSunLightShadows),b.push(R.numDirLightShadows),b.push(R.numPointLightShadows),b.push(R.numSpotLightShadows),b.push(R.numSpotLightShadowsWithMaps),b.push(R.numLightProbes),b.push(R.numLightProbeGrids),b.push(R.shadowMapType),b.push(R.toneMapping),b.push(R.numClippingPlanes),b.push(R.numClipIntersection),b.push(R.depthPacking)}function M(b,R){if(f.disableAll(),R.instancing)f.enable(0);if(R.instancingColor)f.enable(1);if(R.instancingMorph)f.enable(2);if(R.matcap)f.enable(3);if(R.envMap)f.enable(4);if(R.normalMapObjectSpace)f.enable(5);if(R.normalMapTangentSpace)f.enable(6);if(R.clearcoat)f.enable(7);if(R.iridescence)f.enable(8);if(R.alphaTest)f.enable(9);if(R.vertexColors)f.enable(10);if(R.vertexAlphas)f.enable(11);if(R.vertexUv1s)f.enable(12);if(R.vertexUv2s)f.enable(13);if(R.vertexUv3s)f.enable(14);if(R.vertexTangents)f.enable(15);if(R.anisotropy)f.enable(16);if(R.alphaHash)f.enable(17);if(R.batching)f.enable(18);if(R.dispersion)f.enable(19);if(R.retroreflection)f.enable(24);if(R.diffuseRoughness)f.enable(25);if(R.batchingColor)f.enable(20);if(R.gradientMap)f.enable(21);if(R.packedNormalMap)f.enable(22);if(R.vertexNormals)f.enable(23);if(b.push(f.mask),f.disableAll(),R.fog)f.enable(0);if(R.useFog)f.enable(1);if(R.flatShading)f.enable(2);if(R.logarithmicDepthBuffer)f.enable(3);if(R.reversedDepthBuffer)f.enable(4);if(R.skinning)f.enable(5);if(R.morphTargets)f.enable(6);if(R.morphNormals)f.enable(7);if(R.morphColors)f.enable(8);if(R.premultipliedAlpha)f.enable(9);if(R.shadowMapEnabled)f.enable(10);if(R.doubleSided)f.enable(11);if(R.flipSided)f.enable(12);if(R.useDepthPacking)f.enable(13);if(R.dithering)f.enable(14);if(R.transmission)f.enable(15);if(R.sheen)f.enable(16);if(R.opaque)f.enable(17);if(R.pointsUvs)f.enable(18);if(R.decodeVideoTexture)f.enable(19);if(R.decodeVideoTextureEmissive)f.enable(20);if(R.alphaToCoverage)f.enable(21);if(R.numLightProbeGrids>0)f.enable(22);if(R.hasPositionAttribute)f.enable(23);b.push(f.mask)}function E(b){let R=_[b.type],N;if(R){let B=Jn[R];N=od.clone(B.uniforms)}else N=b.uniforms;return N}function C(b,R){let N=x.get(R);if(N!==void 0)++N.usedTimes;else N=new Px(o,R,b,u),g.push(N),x.set(R,N);return N}function A(b){if(--b.usedTimes===0){let R=g.indexOf(b);g[R]=g[g.length-1],g.pop(),x.delete(b.cacheKey),b.destroy()}}function P(b){p.remove(b)}function L(){p.dispose()}return{getParameters:T,getProgramCacheKey:w,getUniforms:E,acquireProgram:C,releaseProgram:A,releaseShaderCache:P,programs:g,dispose:L}}function Nx(){let o=new WeakMap;function l(f){return o.has(f)}function c(f){let p=o.get(f);if(p===void 0)p={},o.set(f,p);return p}function h(f){o.delete(f)}function u(f,p,m){o.get(f)[p]=m}function d(){o=new WeakMap}return{has:l,get:c,remove:h,update:u,dispose:d}}function Ux(o,l){if(o.groupOrder!==l.groupOrder)return o.groupOrder-l.groupOrder;else if(o.renderOrder!==l.renderOrder)return o.renderOrder-l.renderOrder;else if(o.material.id!==l.material.id)return o.material.id-l.material.id;else if(o.materialVariant!==l.materialVariant)return o.materialVariant-l.materialVariant;else if(o.z!==l.z)return o.z-l.z;else return o.id-l.id}function Pd(o,l){if(o.groupOrder!==l.groupOrder)return o.groupOrder-l.groupOrder;else if(o.renderOrder!==l.renderOrder)return o.renderOrder-l.renderOrder;else if(o.z!==l.z)return l.z-o.z;else return o.id-l.id}function Id(){let o=[],l=0,c=[],h=[],u=[];function d(){l=0,c.length=0,h.length=0,u.length=0}function f(_){let v=0;if(_.isInstancedMesh)v+=2;if(_.isSkinnedMesh)v+=1;return v}function p(_,v,T,w,S,M){let E=o[l];if(E===void 0)E={id:_.id,object:_,geometry:v,material:T,materialVariant:f(_),groupOrder:w,renderOrder:_.renderOrder,z:S,group:M},o[l]=E;else E.id=_.id,E.object=_,E.geometry=v,E.material=T,E.materialVariant=f(_),E.groupOrder=w,E.renderOrder=_.renderOrder,E.z=S,E.group=M;return l++,E}function m(_,v,T,w,S,M,E){if(E.reversedDepth===!0)S=-S;let C=p(_,v,T,w,S,M);if(T.transmission>0)h.push(C);else if(T.transparent===!0)u.push(C);else c.push(C)}function g(_,v,T,w,S,M){let E=p(_,v,T,w,S,M);if(T.transmission>0)h.unshift(E);else if(T.transparent===!0)u.unshift(E);else c.unshift(E)}function x(_,v){if(c.length>1)c.sort(_||Ux);if(h.length>1)h.sort(v||Pd);if(u.length>1)u.sort(v||Pd)}function y(){for(let _=l,v=o.length;_<v;_++){let T=o[_];if(T.id===null)break;T.id=null,T.object=null,T.geometry=null,T.material=null,T.group=null}}return{opaque:c,transmissive:h,transparent:u,init:d,push:m,unshift:g,finish:y,sort:x}}function Fx(){let o=new WeakMap;function l(h,u){let d=o.get(h),f;if(d===void 0)f=new Id,o.set(h,[f]);else if(u>=d.length)f=new Id,d.push(f);else f=d[u];return f}function c(){o=new WeakMap}return{get:l,dispose:c}}function Ox(){let o={};return{get:function(l){if(o[l.id]!==void 0)return o[l.id];let c;switch(l.type){case"SunLight":case"DirectionalLight":c={direction:new k,color:new Kt};break;case"SpotLight":c={position:new k,direction:new k,color:new Kt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":c={position:new k,color:new Kt,distance:0,decay:0};break;case"HemisphereLight":c={direction:new k,skyColor:new Kt,groundColor:new Kt};break;case"RectAreaLight":c={color:new Kt,position:new k,halfWidth:new k,halfHeight:new k};break}return o[l.id]=c,c}}}function Bx(){let o={};return{get:function(l){if(o[l.id]!==void 0)return o[l.id];let c;switch(l.type){case"SunLight":case"DirectionalLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"SpotLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"PointLight":c={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt,shadowCameraNear:1,shadowCameraFar:1000};break}return o[l.id]=c,c}}}var zx=0;function kx(o,l){return(l.castShadow?2:0)-(o.castShadow?2:0)+(l.map?1:0)-(o.map?1:0)}function Hx(o){let l=new Ox,c=Bx(),h={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let g=0;g<9;g++)h.probe.push(new k);let u=new k,d=new Yt,f=new Yt;function p(g){let x=0,y=0,_=0;for(let z=0;z<9;z++)h.probe[z].set(0,0,0);let v=0,T=0,w=0,S=0,M=0,E=0,C=0,A=0,P=0,L=0,b=0,R=0,N=0,B=0;g.sort(kx);for(let z=0,W=g.length;z<W;z++){let O=g[z],{color:q,intensity:j,distance:X}=O,ht=null;if(O.shadow&&O.shadow.map)if(O.shadow.map.texture.format===Gi)ht=O.shadow.map.texture;else ht=O.shadow.map.depthTexture||O.shadow.map.texture;if(O.isAmbientLight)x+=q.r*j,y+=q.g*j,_+=q.b*j;else if(O.isLightProbe){for(let Q=0;Q<9;Q++)h.probe[Q].addScaledVector(O.sh.coefficients[Q],j);B++}else if(O.isSunLight){let Q=l.get(O);if(Q.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let rt=O.shadow,ct=c.get(O);ct.shadowIntensity=rt.intensity,ct.shadowBias=rt.bias,ct.shadowNormalBias=rt.normalBias,ct.shadowRadius=rt.radius,ct.shadowMapSize.copy(rt.mapSize).multiply(rt.getFrameExtents()),h.sunShadow[T]=ct,h.sunShadowMap[T]=ht;let At=rt.getViewportCount();for(let et=0;et<At;et++)h.sunShadowMatrix[w+et]=rt.getMatrix(et),h.sunShadowCascade[w+et]=rt._cascadeData[et];w+=At,T++}h.sun[v]=Q,v++}else if(O.isDirectionalLight){let Q=l.get(O);if(Q.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let rt=O.shadow,ct=c.get(O);ct.shadowIntensity=rt.intensity,ct.shadowBias=rt.bias,ct.shadowNormalBias=rt.normalBias,ct.shadowRadius=rt.radius,ct.shadowMapSize=rt.mapSize,h.directionalShadow[S]=ct,h.directionalShadowMap[S]=ht,h.directionalShadowMatrix[S]=O.shadow.matrix,P++}h.directional[S]=Q,S++}else if(O.isSpotLight){let Q=l.get(O);Q.position.setFromMatrixPosition(O.matrixWorld),Q.color.copy(q).multiplyScalar(j),Q.distance=X,Q.coneCos=Math.cos(O.angle),Q.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),Q.decay=O.decay,h.spot[E]=Q;let rt=O.shadow;if(O.map){if(h.spotLightMap[R]=O.map,R++,rt.updateMatrices(O),O.castShadow)N++}if(h.spotLightMatrix[E]=rt.matrix,O.castShadow){let ct=c.get(O);ct.shadowIntensity=rt.intensity,ct.shadowBias=rt.bias,ct.shadowNormalBias=rt.normalBias,ct.shadowRadius=rt.radius,ct.shadowMapSize=rt.mapSize,h.spotShadow[E]=ct,h.spotShadowMap[E]=ht,b++}E++}else if(O.isRectAreaLight){let Q=l.get(O);Q.color.copy(q).multiplyScalar(j),Q.halfWidth.set(O.width*0.5,0,0),Q.halfHeight.set(0,O.height*0.5,0),h.rectArea[C]=Q,C++}else if(O.isPointLight){let Q=l.get(O);if(Q.color.copy(O.color).multiplyScalar(O.intensity),Q.distance=O.distance,Q.decay=O.decay,O.castShadow){let rt=O.shadow,ct=c.get(O);ct.shadowIntensity=rt.intensity,ct.shadowBias=rt.bias,ct.shadowNormalBias=rt.normalBias,ct.shadowRadius=rt.radius,ct.shadowMapSize=rt.mapSize,ct.shadowCameraNear=rt.camera.near,ct.shadowCameraFar=rt.camera.far,h.pointShadow[M]=ct,h.pointShadowMap[M]=ht,h.pointShadowMatrix[M]=O.shadow.matrix,L++}h.point[M]=Q,M++}else if(O.isHemisphereLight){let Q=l.get(O);Q.skyColor.copy(O.color).multiplyScalar(j),Q.groundColor.copy(O.groundColor).multiplyScalar(j),h.hemi[A]=Q,A++}}if(C>0)if(o.has("OES_texture_float_linear")===!0)h.rectAreaLTC1=vt.LTC_FLOAT_1,h.rectAreaLTC2=vt.LTC_FLOAT_2;else h.rectAreaLTC1=vt.LTC_HALF_1,h.rectAreaLTC2=vt.LTC_HALF_2;h.ambient[0]=x,h.ambient[1]=y,h.ambient[2]=_;let U=h.hash;if(U.sunLength!==v||U.directionalLength!==S||U.pointLength!==M||U.spotLength!==E||U.rectAreaLength!==C||U.hemiLength!==A||U.numSunShadows!==T||U.numDirectionalShadows!==P||U.numPointShadows!==L||U.numSpotShadows!==b||U.numSpotMaps!==R||U.numLightProbes!==B)h.sun.length=v,h.directional.length=S,h.spot.length=E,h.rectArea.length=C,h.point.length=M,h.hemi.length=A,h.sunShadow.length=T,h.sunShadowMap.length=T,h.sunShadowMatrix.length=w,h.sunShadowCascade.length=w,h.directionalShadow.length=P,h.directionalShadowMap.length=P,h.directionalShadowMatrix.length=P,h.pointShadow.length=L,h.pointShadowMap.length=L,h.pointShadowMatrix.length=L,h.spotShadow.length=b,h.spotShadowMap.length=b,h.spotLightMatrix.length=b+R-N,h.spotLightMap.length=R,h.numSpotLightShadowsWithMaps=N,h.numLightProbes=B,U.sunLength=v,U.directionalLength=S,U.pointLength=M,U.spotLength=E,U.rectAreaLength=C,U.hemiLength=A,U.numSunShadows=T,U.numDirectionalShadows=P,U.numPointShadows=L,U.numSpotShadows=b,U.numSpotMaps=R,U.numLightProbes=B,h.version=zx++}function m(g,x){let y=0,_=0,v=0,T=0,w=0,S=0,M=x.matrixWorldInverse;for(let E=0,C=g.length;E<C;E++){let A=g[E];if(A.isSunLight){let P=h.sun[y];P.direction.setFromMatrixPosition(A.matrixWorld),P.direction.transformDirection(M),y++}else if(A.isDirectionalLight){let P=h.directional[_];P.direction.setFromMatrixPosition(A.matrixWorld),u.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(u),P.direction.transformDirection(M),_++}else if(A.isSpotLight){let P=h.spot[T];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(M),P.direction.setFromMatrixPosition(A.matrixWorld),u.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(u),P.direction.transformDirection(M),T++}else if(A.isRectAreaLight){let P=h.rectArea[w];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(M),f.identity(),d.copy(A.matrixWorld),d.premultiply(M),f.extractRotation(d),P.halfWidth.set(A.width*0.5,0,0),P.halfHeight.set(0,A.height*0.5,0),P.halfWidth.applyMatrix4(f),P.halfHeight.applyMatrix4(f),w++}else if(A.isPointLight){let P=h.point[v];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(M),v++}else if(A.isHemisphereLight){let P=h.hemi[S];P.direction.setFromMatrixPosition(A.matrixWorld),P.direction.transformDirection(M),S++}}}return{setup:p,setupView:m,state:h}}function Dd(o){let l=new Hx(o),c=[],h=[],u=[];function d(y){x.camera=y,c.length=0,h.length=0,u.length=0}function f(y){if(y.isLightProbeGrid)u.push(y);else c.push(y)}function p(y){h.push(y)}function m(){l.setup(c),u.sort((y,_)=>y.priority-_.priority||y.id-_.id)}function g(y){l.setupView(c,y)}let x={lightsArray:c,shadowsArray:h,lightProbeGridArray:u,camera:null,lights:l,transmissionRenderTarget:{},textureUnits:0};return{init:d,state:x,setupLights:m,setupLightsView:g,pushLight:f,pushShadow:p}}function Gx(o){let l=new WeakMap;function c(u,d=0){let f=l.get(u),p;if(f===void 0)p=new Dd(o),l.set(u,[p]);else if(d>=f.length)p=new Dd(o),f.push(p);else p=f[d];return p}function h(){l=new WeakMap}return{get:c,dispose:h}}var Vx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wx=`uniform sampler2D shadow_pass;
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
}`,Xx=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],qx=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],Ld=new Yt,Mr=new k,Cc=new k;function Yx(o,l,c){let h=new yi,u=new Dt,d=new Dt,f=new Pe,p=new uc,m=new dc,g={},x=c.maxTextureSize,y={[li]:on,[on]:li,[Rn]:Rn},_=new ui({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Dt},radius:{value:4}},vertexShader:Vx,fragmentShader:Wx}),v=_.clone();v.defines.HORIZONTAL_PASS=1;let T=new xn;T.setAttribute("position",new Ye(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let w=new Ke(T,_),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=nr;let M=this.type;this.render=function(L,b,R){if(S.enabled===!1)return;if(S.autoUpdate===!1&&S.needsUpdate===!1)return;if(L.length===0)return;if(this.type===lu)Bt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=nr;let N=o.getRenderTarget(),B=o.getActiveCubeFace(),U=o.getActiveMipmapLevel(),z=o.state;if(z.setBlending(ki),z.buffers.depth.getReversed()===!0)z.buffers.color.setClear(0,0,0,0);else z.buffers.color.setClear(1,1,1,1);z.buffers.depth.setTest(!0),z.setScissorTest(!1);let W=M!==this.type;if(W)b.traverse(function(O){if(O.material)if(Array.isArray(O.material))O.material.forEach((q)=>q.needsUpdate=!0);else O.material.needsUpdate=!0});for(let O=0,q=L.length;O<q;O++){let j=L[O],X=j.shadow;if(X===void 0){Bt("WebGLShadowMap:",j,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;u.copy(X.mapSize);let ht=X.getFrameExtents();if(u.multiply(ht),d.copy(X.mapSize),u.x>x||u.y>x){if(u.x>x)d.x=Math.floor(x/ht.x),u.x=d.x*ht.x,X.mapSize.x=d.x;if(u.y>x)d.y=Math.floor(x/ht.y),u.y=d.y*ht.y,X.mapSize.y=d.y}let Q=o.state.buffers.depth.getReversed();if(X.camera._reversedDepth=Q,X.map===null||W===!0){if(X.map!==null){if(X.map.depthTexture!==null)X.map.depthTexture.dispose(),X.map.depthTexture=null;X.map.dispose()}if(this.type===Ss){if(j.isPointLight){Bt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new In(u.x,u.y,{format:Gi,type:Xn,minFilter:yn,magFilter:yn,generateMipmaps:!1}),X.map.texture.name=j.name+".shadowMap",X.map.depthTexture=new Ai(u.x,u.y,ci),X.map.depthTexture.name=j.name+".shadowMapDepth",X.map.depthTexture.format=Ts,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Mi,X.map.depthTexture.magFilter=Mi}else{if(j.isPointLight)X.map=new qo(u.x),X.map.depthTexture=new Do(u.x,bi);else X.map=new In(u.x,u.y),X.map.depthTexture=new Ai(u.x,u.y,bi);if(X.map.depthTexture.name=j.name+".shadowMap",X.map.depthTexture.format=Ts,this.type===nr)X.map.depthTexture.compareFunction=Q?Zl:Yl,X.map.depthTexture.minFilter=yn,X.map.depthTexture.magFilter=yn;else X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=Mi,X.map.depthTexture.magFilter=Mi}X.camera.updateProjectionMatrix()}if(X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==u.x||X.map.height!==u.y))X.map.setSize(u.x,u.y);let rt=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();if(j.isPointLight!==!0)X.updateMatrices(j,R);let ct=(X.camera.layers.mask&4294967294)!==0?X.camera.layers:R.layers;for(let At=0;At<rt;At++){let et=X.getCamera(At);if(j.isPointLight){let{camera:at,matrix:Tt}=X,Nt=j.distance||at.far;if(Nt!==at.far)at.far=Nt,at.updateProjectionMatrix();Mr.setFromMatrixPosition(j.matrixWorld),at.position.copy(Mr),Cc.copy(at.position),Cc.add(Xx[At]),at.up.copy(qx[At]),at.lookAt(Cc),at.updateMatrixWorld(),Tt.makeTranslation(-Mr.x,-Mr.y,-Mr.z),Ld.multiplyMatrices(at.projectionMatrix,at.matrixWorldInverse),X._frustum.setFromProjectionMatrix(Ld,at.coordinateSystem,at.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)o.setRenderTarget(X.map,At),o.clear();else{if(At===0)o.setRenderTarget(X.map),o.clear();let at=X.getViewport(At);f.set(d.x*at.x,d.y*at.y,d.x*at.z,d.y*at.w),z.viewport(f)}h=X.getFrustum(At),A(b,R,et,j,ct,this.type)}if(X.isPointLightShadow!==!0&&this.type===Ss)E(X,R);X.needsUpdate=!1}M=this.type,S.needsUpdate=!1,o.setRenderTarget(N,B,U)};function E(L,b){let R=l.update(w);if(_.defines.VSM_SAMPLES!==L.blurSamples)_.defines.VSM_SAMPLES=L.blurSamples,v.defines.VSM_SAMPLES=L.blurSamples,_.needsUpdate=!0,v.needsUpdate=!0;if(L.mapPass===null)L.mapPass=new In(u.x,u.y,{format:Gi,type:Xn});else if(L.mapPass.width!==L.map.width||L.mapPass.height!==L.map.height)L.mapPass.setSize(L.map.width,L.map.height);_.uniforms.shadow_pass.value=L.map.depthTexture,_.uniforms.resolution.value.set(L.map.width,L.map.height),_.uniforms.radius.value=L.radius,o.setRenderTarget(L.mapPass),o.clear(),o.renderBufferDirect(b,null,R,_,w,null),v.uniforms.shadow_pass.value=L.mapPass.texture,v.uniforms.resolution.value.set(L.map.width,L.map.height),v.uniforms.radius.value=L.radius,o.setRenderTarget(L.map),o.clear(),o.renderBufferDirect(b,null,R,v,w,null)}function C(L,b,R,N){let B=null,U=R.isPointLight===!0?L.customDistanceMaterial:L.customDepthMaterial;if(U!==void 0)B=U;else if(B=R.isPointLight===!0?m:p,o.localClippingEnabled&&b.clipShadows===!0&&Array.isArray(b.clippingPlanes)&&b.clippingPlanes.length!==0||b.displacementMap&&b.displacementScale!==0||b.alphaMap&&b.alphaTest>0||b.map&&b.alphaTest>0||b.alphaToCoverage===!0){let z=B.uuid,W=b.uuid,O=g[z];if(O===void 0)O={},g[z]=O;let q=O[W];if(q===void 0)q=B.clone(),O[W]=q,b.addEventListener("dispose",P);B=q}if(B.visible=b.visible,B.wireframe=b.wireframe,N===Ss)B.side=b.shadowSide!==null?b.shadowSide:b.side;else B.side=b.shadowSide!==null?b.shadowSide:y[b.side];if(B.alphaMap=b.alphaMap,B.alphaTest=b.alphaToCoverage===!0?0.5:b.alphaTest,B.map=b.map,B.clipShadows=b.clipShadows,B.clippingPlanes=b.clippingPlanes,B.clipIntersection=b.clipIntersection,B.displacementMap=b.displacementMap,B.displacementScale=b.displacementScale,B.displacementBias=b.displacementBias,B.wireframeLinewidth=b.wireframeLinewidth,B.linewidth=b.linewidth,R.isPointLight===!0&&B.isMeshDistanceMaterial===!0){let z=o.properties.get(B);z.light=R}return B}function A(L,b,R,N,B,U){if(L.visible===!1)return;if(L.layers.test(B)&&(L.isMesh||L.isLine||L.isPoints)){if((L.castShadow||L.receiveShadow&&U===Ss)&&(!L.frustumCulled||L.intersectsFrustum(h))){L.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,L.matrixWorld);let O=l.update(L),q=L.material;if(Array.isArray(q)){let j=O.groups;for(let X=0,ht=j.length;X<ht;X++){let Q=j[X],rt=q[Q.materialIndex];if(rt&&rt.visible){let ct=C(L,rt,N,U);L.onBeforeShadow(o,L,b,R,O,ct,Q),o.renderBufferDirect(R,null,O,ct,L,Q),L.onAfterShadow(o,L,b,R,O,ct,Q)}}}else if(q.visible){let j=C(L,q,N,U);L.onBeforeShadow(o,L,b,R,O,j,null),o.renderBufferDirect(R,null,O,j,L,null),L.onAfterShadow(o,L,b,R,O,j,null)}}}let W=L.children;for(let O=0,q=W.length;O<q;O++)A(W[O],b,R,N,B,U)}function P(L){L.target.removeEventListener("dispose",P);for(let R in g){let N=g[R],B=L.target.uuid;if(B in N)N[B].dispose(),delete N[B]}}}function Zx(o,l){function c(){let H=!1,it=new Pe,nt=null,ut=new Pe(0,0,0,0);return{setMask:function(dt){if(nt!==dt&&!H)o.colorMask(dt,dt,dt,dt),nt=dt},setLocked:function(dt){H=dt},setClear:function(dt,xt,Ft,Lt,St){if(St===!0)dt*=Lt,xt*=Lt,Ft*=Lt;if(it.set(dt,xt,Ft,Lt),ut.equals(it)===!1)o.clearColor(dt,xt,Ft,Lt),ut.copy(it)},reset:function(){H=!1,nt=null,ut.set(-1,0,0,0)}}}function h(){let H=!1,it=!1,nt=null,ut=null,dt=null;return{setReversed:function(xt){if(it!==xt){let Ft=l.get("EXT_clip_control");if(xt)Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT);else Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT);it=xt;let Lt=dt;dt=null,this.setClear(Lt)}},getReversed:function(){return it},setTest:function(xt){if(xt)Et(o.DEPTH_TEST);else jt(o.DEPTH_TEST)},setMask:function(xt){if(nt!==xt&&!H)o.depthMask(xt),nt=xt},setFunc:function(xt){if(it)xt=id[xt];if(ut!==xt){switch(xt){case Cu:o.depthFunc(o.NEVER);break;case Pu:o.depthFunc(o.ALWAYS);break;case Iu:o.depthFunc(o.LESS);break;case il:o.depthFunc(o.LEQUAL);break;case Du:o.depthFunc(o.EQUAL);break;case Lu:o.depthFunc(o.GEQUAL);break;case Nu:o.depthFunc(o.GREATER);break;case Uu:o.depthFunc(o.NOTEQUAL);break;default:o.depthFunc(o.LEQUAL)}ut=xt}},setLocked:function(xt){H=xt},setClear:function(xt){if(dt!==xt){if(dt=xt,it)xt=1-xt;o.clearDepth(xt)}},reset:function(){H=!1,nt=null,ut=null,dt=null,it=!1}}}function u(){let H=!1,it=null,nt=null,ut=null,dt=null,xt=null,Ft=null,Lt=null,St=null;return{setTest:function(Ot){if(!H)if(Ot)Et(o.STENCIL_TEST);else jt(o.STENCIL_TEST)},setMask:function(Ot){if(it!==Ot&&!H)o.stencilMask(Ot),it=Ot},setFunc:function(Ot,Jt,Mt){if(nt!==Ot||ut!==Jt||dt!==Mt)o.stencilFunc(Ot,Jt,Mt),nt=Ot,ut=Jt,dt=Mt},setOp:function(Ot,Jt,Mt){if(xt!==Ot||Ft!==Jt||Lt!==Mt)o.stencilOp(Ot,Jt,Mt),xt=Ot,Ft=Jt,Lt=Mt},setLocked:function(Ot){H=Ot},setClear:function(Ot){if(St!==Ot)o.clearStencil(Ot),St=Ot},reset:function(){H=!1,it=null,nt=null,ut=null,dt=null,xt=null,Ft=null,Lt=null,St=null}}}let d=new c,f=new h,p=new u,m={},g=new WeakMap,x={},y={},_={},v=new WeakMap,T=[],w=null,S=!1,M=null,E=null,C=null,A=null,P=null,L=null,b=null,R=new Kt(0,0,0),N=0,B=!1,U=null,z=null,W=null,O=null,q=null,j=o.getParameter(o.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,ht=0,Q=o.getParameter(o.VERSION);if(Q.indexOf("WebGL")!==-1)ht=parseFloat(/^WebGL (\d)/.exec(Q)[1]),X=ht>=1;else if(Q.indexOf("OpenGL ES")!==-1)ht=parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]),X=ht>=2;let rt=null,ct={},At=o.getParameter(o.SCISSOR_BOX),et=o.getParameter(o.VIEWPORT),at=new Pe().fromArray(At),Tt=new Pe().fromArray(et);function Nt(H,it,nt,ut){let dt=new Uint8Array(4),xt=o.createTexture();o.bindTexture(H,xt),o.texParameteri(H,o.TEXTURE_MIN_FILTER,o.NEAREST),o.texParameteri(H,o.TEXTURE_MAG_FILTER,o.NEAREST);for(let Ft=0;Ft<nt;Ft++)if(H===o.TEXTURE_3D||H===o.TEXTURE_2D_ARRAY)o.texImage3D(it,0,o.RGBA,1,1,ut,0,o.RGBA,o.UNSIGNED_BYTE,dt);else o.texImage2D(it+Ft,0,o.RGBA,1,1,0,o.RGBA,o.UNSIGNED_BYTE,dt);return xt}let Ut={};Ut[o.TEXTURE_2D]=Nt(o.TEXTURE_2D,o.TEXTURE_2D,1),Ut[o.TEXTURE_CUBE_MAP]=Nt(o.TEXTURE_CUBE_MAP,o.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ut[o.TEXTURE_2D_ARRAY]=Nt(o.TEXTURE_2D_ARRAY,o.TEXTURE_2D_ARRAY,1,1),Ut[o.TEXTURE_3D]=Nt(o.TEXTURE_3D,o.TEXTURE_3D,1,1),d.setClear(0,0,0,1),f.setClear(1),p.setClear(0),Et(o.DEPTH_TEST),f.setFunc(il),Se(!1),Qt(Qa),Et(o.CULL_FACE),le(ki);function Et(H){if(x[H]!==!0)o.enable(H),x[H]=!0}function jt(H){if(x[H]!==!1)o.disable(H),x[H]=!1}function Zt(H,it){if(_[H]!==it){if(o.bindFramebuffer(H,it),_[H]=it,H===o.DRAW_FRAMEBUFFER)_[o.FRAMEBUFFER]=it;if(H===o.FRAMEBUFFER)_[o.DRAW_FRAMEBUFFER]=it;return!0}return!1}function Pt(H,it){let nt=T,ut=!1;if(H){if(nt=v.get(it),nt===void 0)nt=[],v.set(it,nt);let dt=H.textures;if(nt.length!==dt.length||nt[0]!==o.COLOR_ATTACHMENT0){for(let xt=0,Ft=dt.length;xt<Ft;xt++)nt[xt]=o.COLOR_ATTACHMENT0+xt;nt.length=dt.length,ut=!0}}else if(nt[0]!==o.BACK)nt[0]=o.BACK,ut=!0;if(ut)o.drawBuffers(nt)}function Vt(H){if(w!==H)return o.useProgram(H),w=H,!0;return!1}let kt={[Ms]:o.FUNC_ADD,[hu]:o.FUNC_SUBTRACT,[uu]:o.FUNC_REVERSE_SUBTRACT};kt[du]=o.MIN,kt[fu]=o.MAX;let ae={[pu]:o.ZERO,[mu]:o.ONE,[gu]:o.SRC_COLOR,[xu]:o.SRC_ALPHA,[Tu]:o.SRC_ALPHA_SATURATE,[Mu]:o.DST_COLOR,[vu]:o.DST_ALPHA,[_u]:o.ONE_MINUS_SRC_COLOR,[yu]:o.ONE_MINUS_SRC_ALPHA,[bu]:o.ONE_MINUS_DST_COLOR,[Su]:o.ONE_MINUS_DST_ALPHA,[Eu]:o.CONSTANT_COLOR,[Au]:o.ONE_MINUS_CONSTANT_COLOR,[wu]:o.CONSTANT_ALPHA,[Ru]:o.ONE_MINUS_CONSTANT_ALPHA};function le(H,it,nt,ut,dt,xt,Ft,Lt,St,Ot){if(H===ki){if(S===!0)jt(o.BLEND),S=!1;return}if(S===!1)Et(o.BLEND),S=!0;if(H!==cu){if(H!==M||Ot!==B){if(E!==Ms||P!==Ms)o.blendEquation(o.FUNC_ADD),E=Ms,P=Ms;if(Ot)switch(H){case ir:o.blendFuncSeparate(o.ONE,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case tl:o.blendFunc(o.ONE,o.ONE);break;case el:o.blendFuncSeparate(o.ZERO,o.ONE_MINUS_SRC_COLOR,o.ZERO,o.ONE);break;case nl:o.blendFuncSeparate(o.DST_COLOR,o.ONE_MINUS_SRC_ALPHA,o.ZERO,o.ONE);break;default:Ht("WebGLState: Invalid blending: ",H);break}else switch(H){case ir:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE_MINUS_SRC_ALPHA,o.ONE,o.ONE_MINUS_SRC_ALPHA);break;case tl:o.blendFuncSeparate(o.SRC_ALPHA,o.ONE,o.ONE,o.ONE);break;case el:Ht("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:Ht("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ht("WebGLState: Invalid blending: ",H);break}C=null,A=null,L=null,b=null,R.set(0,0,0),N=0,M=H,B=Ot}return}if(dt=dt||it,xt=xt||nt,Ft=Ft||ut,it!==E||dt!==P)o.blendEquationSeparate(kt[it],kt[dt]),E=it,P=dt;if(nt!==C||ut!==A||xt!==L||Ft!==b)o.blendFuncSeparate(ae[nt],ae[ut],ae[xt],ae[Ft]),C=nt,A=ut,L=xt,b=Ft;if(Lt.equals(R)===!1||St!==N)o.blendColor(Lt.r,Lt.g,Lt.b,St),R.copy(Lt),N=St;M=H,B=!1}function me(H,it){H.side===Rn?jt(o.CULL_FACE):Et(o.CULL_FACE);let nt=H.side===on;if(it)nt=!nt;Se(nt),H.blending===ir&&H.transparent===!1?le(ki):le(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),f.setFunc(H.depthFunc),f.setTest(H.depthTest),f.setMask(H.depthWrite),d.setMask(H.colorWrite);let ut=H.stencilWrite;if(p.setTest(ut),ut)p.setMask(H.stencilWriteMask),p.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),p.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass);De(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?Et(o.SAMPLE_ALPHA_TO_COVERAGE):jt(o.SAMPLE_ALPHA_TO_COVERAGE)}function Se(H){if(U!==H){if(H)o.frontFace(o.CW);else o.frontFace(o.CCW);U=H}}function Qt(H){if(H!==ou){if(Et(o.CULL_FACE),H!==z)if(H===Qa)o.cullFace(o.BACK);else if(H===au)o.cullFace(o.FRONT);else o.cullFace(o.FRONT_AND_BACK)}else jt(o.CULL_FACE);z=H}function oe(H){if(H!==W){if(X)o.lineWidth(H);W=H}}function De(H,it,nt){if(H){if(Et(o.POLYGON_OFFSET_FILL),O!==it||q!==nt){if(O=it,q=nt,f.getReversed())it=-it,nt=-nt;o.polygonOffset(it,nt)}}else jt(o.POLYGON_OFFSET_FILL)}function Le(H){if(H)Et(o.SCISSOR_TEST);else jt(o.SCISSOR_TEST)}function hn(H){if(H===void 0)H=o.TEXTURE0+j-1;if(rt!==H)o.activeTexture(H),rt=H}function V(H,it,nt){if(nt===void 0)if(rt===null)nt=o.TEXTURE0+j-1;else nt=rt;let ut=ct[nt];if(ut===void 0)ut={type:void 0,texture:void 0},ct[nt]=ut;if(ut.type!==H||ut.texture!==it){if(rt!==nt)o.activeTexture(nt),rt=nt;o.bindTexture(H,it||Ut[H]),ut.type=H,ut.texture=it}}function un(){let H=ct[rt];if(H!==void 0&&H.type!==void 0)o.bindTexture(H.type,null),H.type=void 0,H.texture=void 0}function fe(){try{o.compressedTexImage2D(...arguments)}catch(H){Ht("WebGLState:",H)}}function Ge(){try{o.compressedTexImage3D(...arguments)}catch(H){Ht("WebGLState:",H)}}function yt(){try{o.texSubImage2D(...arguments)}catch(H){Ht("WebGLState:",H)}}function Ae(){try{o.texSubImage3D(...arguments)}catch(H){Ht("WebGLState:",H)}}function zt(){try{o.compressedTexSubImage2D(...arguments)}catch(H){Ht("WebGLState:",H)}}function Wt(){try{o.compressedTexSubImage3D(...arguments)}catch(H){Ht("WebGLState:",H)}}function je(){try{o.texStorage2D(...arguments)}catch(H){Ht("WebGLState:",H)}}function F(){try{o.texStorage3D(...arguments)}catch(H){Ht("WebGLState:",H)}}function I(){try{o.texImage2D(...arguments)}catch(H){Ht("WebGLState:",H)}}function Y(){try{o.texImage3D(...arguments)}catch(H){Ht("WebGLState:",H)}}function lt(H){if(y[H]!==void 0)return y[H];else return o.getParameter(H)}function ot(H,it){if(y[H]!==it)o.pixelStorei(H,it),y[H]=it}function ft(H){if(at.equals(H)===!1)o.scissor(H.x,H.y,H.z,H.w),at.copy(H)}function gt(H){if(Tt.equals(H)===!1)o.viewport(H.x,H.y,H.z,H.w),Tt.copy(H)}function tt(H,it){let nt=g.get(it);if(nt===void 0)nt=new WeakMap,g.set(it,nt);let ut=nt.get(H);if(ut===void 0)ut=o.getUniformBlockIndex(it,H.name),o.uniformBlockBinding(it,ut,ut),nt.set(H,ut)}function st(H,it,nt){let dt=g.get(it).get(H);if(m[dt]!==nt)o.bindBufferBase(o.UNIFORM_BUFFER,dt,nt),m[dt]=nt}function pt(){o.disable(o.BLEND),o.disable(o.CULL_FACE),o.disable(o.DEPTH_TEST),o.disable(o.POLYGON_OFFSET_FILL),o.disable(o.SCISSOR_TEST),o.disable(o.STENCIL_TEST),o.disable(o.SAMPLE_ALPHA_TO_COVERAGE),o.blendEquation(o.FUNC_ADD),o.blendFunc(o.ONE,o.ZERO),o.blendFuncSeparate(o.ONE,o.ZERO,o.ONE,o.ZERO),o.blendColor(0,0,0,0),o.colorMask(!0,!0,!0,!0),o.clearColor(0,0,0,0),o.depthMask(!0),o.depthFunc(o.LESS),f.setReversed(!1),o.clearDepth(1),o.stencilMask(4294967295),o.stencilFunc(o.ALWAYS,0,4294967295),o.stencilOp(o.KEEP,o.KEEP,o.KEEP),o.clearStencil(0),o.cullFace(o.BACK),o.frontFace(o.CCW),o.polygonOffset(0,0),o.activeTexture(o.TEXTURE0),o.bindFramebuffer(o.FRAMEBUFFER,null),o.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),o.bindFramebuffer(o.READ_FRAMEBUFFER,null),o.useProgram(null),o.lineWidth(1),o.scissor(0,0,o.canvas.width,o.canvas.height),o.viewport(0,0,o.canvas.width,o.canvas.height),o.pixelStorei(o.PACK_ALIGNMENT,4),o.pixelStorei(o.UNPACK_ALIGNMENT,4),o.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,!1),o.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),o.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,o.BROWSER_DEFAULT_WEBGL),o.pixelStorei(o.PACK_ROW_LENGTH,0),o.pixelStorei(o.PACK_SKIP_PIXELS,0),o.pixelStorei(o.PACK_SKIP_ROWS,0),o.pixelStorei(o.UNPACK_ROW_LENGTH,0),o.pixelStorei(o.UNPACK_IMAGE_HEIGHT,0),o.pixelStorei(o.UNPACK_SKIP_PIXELS,0),o.pixelStorei(o.UNPACK_SKIP_ROWS,0),o.pixelStorei(o.UNPACK_SKIP_IMAGES,0),x={},y={},rt=null,ct={},_={},m={},v=new WeakMap,T=[],w=null,S=!1,M=null,E=null,C=null,A=null,P=null,L=null,b=null,R=new Kt(0,0,0),N=0,B=!1,U=null,z=null,W=null,O=null,q=null,at.set(0,0,o.canvas.width,o.canvas.height),Tt.set(0,0,o.canvas.width,o.canvas.height),d.reset(),f.reset(),p.reset()}return{buffers:{color:d,depth:f,stencil:p},enable:Et,disable:jt,bindFramebuffer:Zt,drawBuffers:Pt,useProgram:Vt,setBlending:le,setMaterial:me,setFlipSided:Se,setCullFace:Qt,setLineWidth:oe,setPolygonOffset:De,setScissorTest:Le,activeTexture:hn,bindTexture:V,unbindTexture:un,compressedTexImage2D:fe,compressedTexImage3D:Ge,texImage2D:I,texImage3D:Y,pixelStorei:ot,getParameter:lt,updateUBOMapping:tt,uniformBlockBinding:st,texStorage2D:je,texStorage3D:F,texSubImage2D:yt,texSubImage3D:Ae,compressedTexSubImage2D:zt,compressedTexSubImage3D:Wt,scissor:ft,viewport:gt,reset:pt}}function Jx(o,l,c,h,u,d,f){let p=l.has("WEBGL_multisampled_render_to_texture")?l.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),g=new Dt,x=new WeakMap,y=new Set,_,v=new WeakMap,T=new Set,w=new FinalizationRegistry((F)=>T.delete(F)),S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(F){}function M(F,I){return S?new OffscreenCanvas(F,I):tr("canvas")}function E(F,I,Y){let lt=1,ot=je(F);if(ot.width>Y||ot.height>Y)lt=Y/Math.max(ot.width,ot.height);if(lt<1)if(typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&F instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&F instanceof ImageBitmap||typeof VideoFrame<"u"&&F instanceof VideoFrame){let ft=Math.floor(lt*ot.width),gt=Math.floor(lt*ot.height);if(_===void 0)_=M(ft,gt);let tt=I?M(ft,gt):_;return tt.width=ft,tt.height=gt,tt.getContext("2d").drawImage(F,0,0,ft,gt),Bt("WebGLRenderer: Texture has been resized from ("+ot.width+"x"+ot.height+") to ("+ft+"x"+gt+")."),tt}else{if("data"in F)Bt("WebGLRenderer: Image in DataTexture is too big ("+ot.width+"x"+ot.height+").");return F}return F}function C(F){return F.generateMipmaps}function A(F){o.generateMipmap(F)}function P(F){if(F.isWebGLCubeRenderTarget)return o.TEXTURE_CUBE_MAP;if(F.isWebGL3DRenderTarget)return o.TEXTURE_3D;if(F.isWebGLArrayRenderTarget||F.isCompressedArrayTexture)return o.TEXTURE_2D_ARRAY;return o.TEXTURE_2D}function L(F,I,Y,lt,ot,ft=!1){if(F!==null){if(o[F]!==void 0)return o[F];Bt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+F+"'")}let gt;if(lt){if(gt=l.get("EXT_texture_norm16"),!gt)Bt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let tt=I;if(I===o.RED){if(Y===o.FLOAT)tt=o.R32F;if(Y===o.HALF_FLOAT)tt=o.R16F;if(Y===o.UNSIGNED_BYTE)tt=o.R8;if(Y===o.UNSIGNED_SHORT&&gt)tt=gt.R16_EXT;if(Y===o.SHORT&&gt)tt=gt.R16_SNORM_EXT}if(I===o.RED_INTEGER){if(Y===o.UNSIGNED_BYTE)tt=o.R8UI;if(Y===o.UNSIGNED_SHORT)tt=o.R16UI;if(Y===o.UNSIGNED_INT)tt=o.R32UI;if(Y===o.BYTE)tt=o.R8I;if(Y===o.SHORT)tt=o.R16I;if(Y===o.INT)tt=o.R32I}if(I===o.RG){if(Y===o.FLOAT)tt=o.RG32F;if(Y===o.HALF_FLOAT)tt=o.RG16F;if(Y===o.UNSIGNED_BYTE)tt=o.RG8;if(Y===o.UNSIGNED_SHORT&&gt)tt=gt.RG16_EXT;if(Y===o.SHORT&&gt)tt=gt.RG16_SNORM_EXT}if(I===o.RG_INTEGER){if(Y===o.UNSIGNED_BYTE)tt=o.RG8UI;if(Y===o.UNSIGNED_SHORT)tt=o.RG16UI;if(Y===o.UNSIGNED_INT)tt=o.RG32UI;if(Y===o.BYTE)tt=o.RG8I;if(Y===o.SHORT)tt=o.RG16I;if(Y===o.INT)tt=o.RG32I}if(I===o.RGB_INTEGER){if(Y===o.UNSIGNED_BYTE)tt=o.RGB8UI;if(Y===o.UNSIGNED_SHORT)tt=o.RGB16UI;if(Y===o.UNSIGNED_INT)tt=o.RGB32UI;if(Y===o.BYTE)tt=o.RGB8I;if(Y===o.SHORT)tt=o.RGB16I;if(Y===o.INT)tt=o.RGB32I}if(I===o.RGBA_INTEGER){if(Y===o.UNSIGNED_BYTE)tt=o.RGBA8UI;if(Y===o.UNSIGNED_SHORT)tt=o.RGBA16UI;if(Y===o.UNSIGNED_INT)tt=o.RGBA32UI;if(Y===o.BYTE)tt=o.RGBA8I;if(Y===o.SHORT)tt=o.RGBA16I;if(Y===o.INT)tt=o.RGBA32I}if(I===o.RGB){if(Y===o.UNSIGNED_SHORT&&gt)tt=gt.RGB16_EXT;if(Y===o.SHORT&&gt)tt=gt.RGB16_SNORM_EXT;if(Y===o.UNSIGNED_INT_5_9_9_9_REV)tt=o.RGB9_E5;if(Y===o.UNSIGNED_INT_10F_11F_11F_REV)tt=o.R11F_G11F_B10F}if(I===o.RGBA){let st=ft?ql:te.getTransfer(ot);if(Y===o.FLOAT)tt=o.RGBA32F;if(Y===o.HALF_FLOAT)tt=o.RGBA16F;if(Y===o.UNSIGNED_BYTE)tt=st===be?o.SRGB8_ALPHA8:o.RGBA8;if(Y===o.UNSIGNED_SHORT&&gt)tt=gt.RGBA16_EXT;if(Y===o.SHORT&&gt)tt=gt.RGBA16_SNORM_EXT;if(Y===o.UNSIGNED_SHORT_4_4_4_4)tt=o.RGBA4;if(Y===o.UNSIGNED_SHORT_5_5_5_1)tt=o.RGB5_A1}if(tt===o.R16F||tt===o.R32F||tt===o.RG16F||tt===o.RG32F||tt===o.RGBA16F||tt===o.RGBA32F)l.get("EXT_color_buffer_float");return tt}function b(F,I){let Y;if(F){if(I===null||I===bi||I===Hi)Y=o.DEPTH24_STENCIL8;else if(I===ci)Y=o.DEPTH32F_STENCIL8;else if(I===or)Y=o.DEPTH24_STENCIL8,Bt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(I===null||I===bi||I===Hi)Y=o.DEPTH_COMPONENT24;else if(I===ci)Y=o.DEPTH_COMPONENT32F;else if(I===or)Y=o.DEPTH_COMPONENT16;return Y}function R(F,I){if(C(F)===!0||F.isFramebufferTexture&&F.minFilter!==Mi&&F.minFilter!==yn)return Math.log2(Math.max(I.width,I.height))+1;else if(F.mipmaps.length>0)return F.mipmaps.length;else if(F.isCompressedTexture&&Array.isArray(F.image))return I.mipmaps.length;else return 1}function N(F){let I=new WeakRef(F);h.get(F).__ref=I,T.add(I),w.register(F,I,I)}function B(F){let I=h.get(F).__ref;if(I===void 0)return;T.delete(I),w.unregister(I)}function U(F){W(F.target)}function z(F){O(F.target)}function W(F){if(F.removeEventListener("dispose",U),B(F),j(F),F.isVideoTexture)x.delete(F);if(F.isHTMLTexture)y.delete(F)}function O(F){F.removeEventListener("dispose",z),B(F),ht(F)}function q(){for(let F of T){let I=F.deref();if(I===void 0)continue;if(I.isRenderTarget===!0)O(I);else W(I)}T.clear(),y.clear()}function j(F){let I=h.get(F);if(I.__webglInit===void 0)return;let Y=F.source,lt=v.get(Y);if(lt){let ot=lt[I.__cacheKey];if(ot.usedTimes--,ot.usedTimes===0)X(F);if(Object.keys(lt).length===0)v.delete(Y)}h.remove(F)}function X(F){let I=h.get(F);o.deleteTexture(I.__webglTexture);let Y=F.source,lt=v.get(Y);delete lt[I.__cacheKey],f.memory.textures--}function ht(F){let I=h.get(F);if(I.__depthDisposeCallback)I.__depthDisposeCallback();let Y=F.depthTexture;if(Y&&Y.renderTarget===F)W(Y);if(F.isWebGLCubeRenderTarget)for(let ot=0;ot<6;ot++){if(Array.isArray(I.__webglFramebuffer[ot]))for(let ft=0;ft<I.__webglFramebuffer[ot].length;ft++)o.deleteFramebuffer(I.__webglFramebuffer[ot][ft]);else o.deleteFramebuffer(I.__webglFramebuffer[ot]);if(I.__webglDepthbuffer)o.deleteRenderbuffer(I.__webglDepthbuffer[ot])}else{if(Array.isArray(I.__webglFramebuffer))for(let ot=0;ot<I.__webglFramebuffer.length;ot++)o.deleteFramebuffer(I.__webglFramebuffer[ot]);else o.deleteFramebuffer(I.__webglFramebuffer);if(I.__webglDepthbuffer)o.deleteRenderbuffer(I.__webglDepthbuffer);if(I.__webglMultisampledFramebuffer)o.deleteFramebuffer(I.__webglMultisampledFramebuffer);if(I.__webglColorRenderbuffer){for(let ot=0;ot<I.__webglColorRenderbuffer.length;ot++)if(I.__webglColorRenderbuffer[ot])o.deleteRenderbuffer(I.__webglColorRenderbuffer[ot])}if(I.__webglDepthRenderbuffer)o.deleteRenderbuffer(I.__webglDepthRenderbuffer)}let lt=F.textures;for(let ot=0,ft=lt.length;ot<ft;ot++){let gt=h.get(lt[ot]);if(gt.__webglTexture)o.deleteTexture(gt.__webglTexture),f.memory.textures--;h.remove(lt[ot])}h.remove(F)}let Q=0;function rt(){Q=0}function ct(){return Q}function At(F){Q=F}function et(){let F=Q;if(F>=u.maxTextures)Bt("WebGLTextures: Trying to use "+(F+1)+" texture units while this GPU supports only "+u.maxTextures);return Q+=1,F}function at(F){let I=[];return I.push(F.wrapS),I.push(F.wrapT),I.push(F.wrapR||0),I.push(F.magFilter),I.push(F.minFilter),I.push(F.anisotropy),I.push(F.internalFormat),I.push(F.format),I.push(F.type),I.push(F.generateMipmaps),I.push(F.mipmapsAutoUpdate),I.push(F.premultiplyAlpha),I.push(F.flipY),I.push(F.unpackAlignment),I.push(F.colorSpace),I.join()}function Tt(F,I){let Y=h.get(F);if(F.isVideoTexture)zt(F);if(F.isRenderTargetTexture===!1&&F.isExternalTexture!==!0&&F.version>0&&Y.__version!==F.version){let lt=F.image;if(lt===null)Bt("WebGLRenderer: Texture marked for update but no image data found.");else if(lt.complete===!1)Bt("WebGLRenderer: Texture marked for update but image is incomplete");else{me(Y,F,I);return}}else if(F.isExternalTexture)Y.__webglTexture=F.sourceTexture?F.sourceTexture:null;c.bindTexture(o.TEXTURE_2D,Y.__webglTexture,o.TEXTURE0+I)}function Nt(F,I){let Y=h.get(F);if(F.isRenderTargetTexture===!1&&F.version>0&&Y.__version!==F.version){me(Y,F,I);return}else if(F.isExternalTexture)Y.__webglTexture=F.sourceTexture?F.sourceTexture:null;c.bindTexture(o.TEXTURE_2D_ARRAY,Y.__webglTexture,o.TEXTURE0+I)}function Ut(F,I){let Y=h.get(F);if(F.isRenderTargetTexture===!1&&F.version>0&&Y.__version!==F.version){me(Y,F,I);return}c.bindTexture(o.TEXTURE_3D,Y.__webglTexture,o.TEXTURE0+I)}function Et(F,I){let Y=h.get(F);if(F.version>0&&Y.__version!==F.version){Se(Y,F,I);return}c.bindTexture(o.TEXTURE_CUBE_MAP,Y.__webglTexture,o.TEXTURE0+I)}let jt={[_o]:o.REPEAT,[xo]:o.CLAMP_TO_EDGE,[zu]:o.MIRRORED_REPEAT},Zt={[Mi]:o.NEAREST,[ku]:o.NEAREST_MIPMAP_NEAREST,[rr]:o.NEAREST_MIPMAP_LINEAR,[yn]:o.LINEAR,[yo]:o.LINEAR_MIPMAP_NEAREST,[Bn]:o.LINEAR_MIPMAP_LINEAR},Pt={[Ju]:o.NEVER,[Jl]:o.ALWAYS,[Ku]:o.LESS,[Yl]:o.LEQUAL,[$u]:o.EQUAL,[Zl]:o.GEQUAL,[ju]:o.GREATER,[Qu]:o.NOTEQUAL};function Vt(F,I){if(I.type===ci&&l.has("OES_texture_float_linear")===!1&&(I.magFilter===yn||I.magFilter===yo||I.magFilter===rr||I.magFilter===Bn||I.minFilter===yn||I.minFilter===yo||I.minFilter===rr||I.minFilter===Bn))Bt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(o.texParameteri(F,o.TEXTURE_WRAP_S,jt[I.wrapS]),o.texParameteri(F,o.TEXTURE_WRAP_T,jt[I.wrapT]),F===o.TEXTURE_3D||F===o.TEXTURE_2D_ARRAY)o.texParameteri(F,o.TEXTURE_WRAP_R,jt[I.wrapR]);if(o.texParameteri(F,o.TEXTURE_MAG_FILTER,Zt[I.magFilter]),o.texParameteri(F,o.TEXTURE_MIN_FILTER,Zt[I.minFilter]),I.compareFunction)o.texParameteri(F,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(F,o.TEXTURE_COMPARE_FUNC,Pt[I.compareFunction]);if(l.has("EXT_texture_filter_anisotropic")===!0){if(I.magFilter===Mi)return;if(I.minFilter!==rr&&I.minFilter!==Bn)return;if(I.type===ci&&l.has("OES_texture_float_linear")===!1)return;if(I.anisotropy>1||h.get(I).__currentAnisotropy){let Y=l.get("EXT_texture_filter_anisotropic");o.texParameterf(F,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(I.anisotropy,u.getMaxAnisotropy())),h.get(I).__currentAnisotropy=I.anisotropy}}}function kt(F,I){let Y=!1;if(F.__webglInit===void 0)F.__webglInit=!0,I.addEventListener("dispose",U),N(I);let lt=I.source,ot=v.get(lt);if(ot===void 0)ot={},v.set(lt,ot);let ft=at(I);if(ft!==F.__cacheKey){if(ot[ft]===void 0)ot[ft]={texture:o.createTexture(),usedTimes:0},f.memory.textures++,Y=!0;ot[ft].usedTimes++;let gt=ot[F.__cacheKey];if(gt!==void 0){if(ot[F.__cacheKey].usedTimes--,gt.usedTimes===0)X(I)}F.__cacheKey=ft,F.__webglTexture=ot[ft].texture}return Y}function ae(F,I,Y){return Math.floor(Math.floor(F/Y)/I)}function le(F,I,Y,lt){let ft=F.updateRanges;if(ft.length===0)c.texSubImage2D(o.TEXTURE_2D,0,0,0,I.width,I.height,Y,lt,I.data);else{ft.sort((H,it)=>H.start-it.start);let gt=0;for(let H=1;H<ft.length;H++){let it=ft[gt],nt=ft[H],ut=it.start+it.count,dt=ae(nt.start,I.width,4),xt=ae(it.start,I.width,4);if(nt.start<=ut+1&&dt===xt&&ae(nt.start+nt.count-1,I.width,4)===dt)it.count=Math.max(it.count,nt.start+nt.count-it.start);else++gt,ft[gt]=nt}ft.length=gt+1;let tt=c.getParameter(o.UNPACK_ROW_LENGTH),st=c.getParameter(o.UNPACK_SKIP_PIXELS),pt=c.getParameter(o.UNPACK_SKIP_ROWS);c.pixelStorei(o.UNPACK_ROW_LENGTH,I.width);for(let H=0,it=ft.length;H<it;H++){let nt=ft[H],ut=Math.floor(nt.start/4),dt=Math.ceil(nt.count/4),xt=ut%I.width,Ft=Math.floor(ut/I.width),Lt=dt,St=1;c.pixelStorei(o.UNPACK_SKIP_PIXELS,xt),c.pixelStorei(o.UNPACK_SKIP_ROWS,Ft),c.texSubImage2D(o.TEXTURE_2D,0,xt,Ft,Lt,1,Y,lt,I.data)}F.clearUpdateRanges(),c.pixelStorei(o.UNPACK_ROW_LENGTH,tt),c.pixelStorei(o.UNPACK_SKIP_PIXELS,st),c.pixelStorei(o.UNPACK_SKIP_ROWS,pt)}}function me(F,I,Y){let lt=o.TEXTURE_2D;if(I.isDataArrayTexture||I.isCompressedArrayTexture)lt=o.TEXTURE_2D_ARRAY;if(I.isData3DTexture)lt=o.TEXTURE_3D;let ot=kt(F,I),ft=I.source;c.bindTexture(lt,F.__webglTexture,o.TEXTURE0+Y);let gt=h.get(ft);if(ft.version!==gt.__version||ot===!0){if(c.activeTexture(o.TEXTURE0+Y),(typeof ImageBitmap<"u"&&I.image instanceof ImageBitmap)===!1){let St=te.getPrimaries(te.workingColorSpace),Ot=I.colorSpace===Vi?null:te.getPrimaries(I.colorSpace),Jt=I.colorSpace===Vi||St===Ot?o.NONE:o.BROWSER_DEFAULT_WEBGL;c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,I.flipY),c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,Jt)}c.pixelStorei(o.UNPACK_ALIGNMENT,I.unpackAlignment);let st=E(I.image,!1,u.maxTextureSize);st=Wt(I,st);let pt=d.convert(I.format,I.colorSpace),H=d.convert(I.type),it=L(I.internalFormat,pt,H,I.normalized,I.colorSpace,I.isVideoTexture);Vt(lt,I);let nt,ut=I.mipmaps,dt=I.isVideoTexture!==!0,xt=gt.__version===void 0||ot===!0,Ft=ft.dataReady,Lt=R(I,st);if(I.isDepthTexture){if(it=b(I.format===Ti,I.type),xt)if(dt)c.texStorage2D(o.TEXTURE_2D,1,it,st.width,st.height);else c.texImage2D(o.TEXTURE_2D,0,it,st.width,st.height,0,pt,H,null)}else if(I.isDataTexture)if(ut.length>0){if(dt&&xt)c.texStorage2D(o.TEXTURE_2D,Lt,it,ut[0].width,ut[0].height);for(let St=0,Ot=ut.length;St<Ot;St++)if(nt=ut[St],dt){if(Ft)c.texSubImage2D(o.TEXTURE_2D,St,0,0,nt.width,nt.height,pt,H,nt.data)}else c.texImage2D(o.TEXTURE_2D,St,it,nt.width,nt.height,0,pt,H,nt.data);I.generateMipmaps=!1}else if(dt){if(xt)c.texStorage2D(o.TEXTURE_2D,Lt,it,st.width,st.height);if(Ft)le(I,st,pt,H)}else c.texImage2D(o.TEXTURE_2D,0,it,st.width,st.height,0,pt,H,st.data);else if(I.isCompressedTexture)if(I.isCompressedArrayTexture){if(dt&&xt)c.texStorage3D(o.TEXTURE_2D_ARRAY,Lt,it,ut[0].width,ut[0].height,st.depth);for(let St=0,Ot=ut.length;St<Ot;St++)if(nt=ut[St],I.format!==Cn)if(pt!==null)if(dt){if(Ft)if(I.layerUpdates.size>0){let Jt=wc(nt.width,nt.height,I.format,I.type);for(let Mt of I.layerUpdates){let xe=nt.data.subarray(Mt*Jt/nt.data.BYTES_PER_ELEMENT,(Mt+1)*Jt/nt.data.BYTES_PER_ELEMENT);c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,St,0,0,Mt,nt.width,nt.height,1,pt,xe)}}else c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,St,0,0,0,nt.width,nt.height,st.depth,pt,nt.data)}else c.compressedTexImage3D(o.TEXTURE_2D_ARRAY,St,it,nt.width,nt.height,st.depth,0,nt.data,0,0);else Bt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(dt){if(Ft)c.texSubImage3D(o.TEXTURE_2D_ARRAY,St,0,0,0,nt.width,nt.height,st.depth,pt,H,nt.data)}else c.texImage3D(o.TEXTURE_2D_ARRAY,St,it,nt.width,nt.height,st.depth,0,pt,H,nt.data);if(I.layerUpdates.size>0)I.clearLayerUpdates()}else{if(dt&&xt)c.texStorage2D(o.TEXTURE_2D,Lt,it,ut[0].width,ut[0].height);for(let St=0,Ot=ut.length;St<Ot;St++)if(nt=ut[St],I.format!==Cn)if(pt!==null)if(dt){if(Ft)c.compressedTexSubImage2D(o.TEXTURE_2D,St,0,0,nt.width,nt.height,pt,nt.data)}else c.compressedTexImage2D(o.TEXTURE_2D,St,it,nt.width,nt.height,0,nt.data);else Bt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(dt){if(Ft)c.texSubImage2D(o.TEXTURE_2D,St,0,0,nt.width,nt.height,pt,H,nt.data)}else c.texImage2D(o.TEXTURE_2D,St,it,nt.width,nt.height,0,pt,H,nt.data)}else if(I.isDataArrayTexture)if(dt){if(xt)c.texStorage3D(o.TEXTURE_2D_ARRAY,Lt,it,st.width,st.height,st.depth);if(Ft)if(I.layerUpdates.size>0){let St=wc(st.width,st.height,I.format,I.type);for(let Ot of I.layerUpdates){let Jt=st.data.subarray(Ot*St/st.data.BYTES_PER_ELEMENT,(Ot+1)*St/st.data.BYTES_PER_ELEMENT);c.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,Ot,st.width,st.height,1,pt,H,Jt)}I.clearLayerUpdates()}else c.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,pt,H,st.data)}else c.texImage3D(o.TEXTURE_2D_ARRAY,0,it,st.width,st.height,st.depth,0,pt,H,st.data);else if(I.isData3DTexture)if(dt){if(xt)c.texStorage3D(o.TEXTURE_3D,Lt,it,st.width,st.height,st.depth);if(Ft)c.texSubImage3D(o.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,pt,H,st.data)}else c.texImage3D(o.TEXTURE_3D,0,it,st.width,st.height,st.depth,0,pt,H,st.data);else if(I.isFramebufferTexture){if(xt)if(dt)c.texStorage2D(o.TEXTURE_2D,Lt,it,st.width,st.height);else{let St=st.width,Ot=st.height;for(let Jt=0;Jt<Lt;Jt++)c.texImage2D(o.TEXTURE_2D,Jt,it,St,Ot,0,pt,H,null),St>>=1,Ot>>=1}}else if(I.isHTMLTexture){if("texElementImage2D"in o){let St=o.canvas;if(!St.hasAttribute("layoutsubtree"))St.setAttribute("layoutsubtree","true");if(st.parentNode!==St){St.appendChild(st),y.add(I),St.onpaint=(Ot)=>{let Jt=Ot.changedElements;for(let Mt of y)if(Jt.includes(Mt.image))Mt.needsUpdate=!0},St.requestPaint();return}if(o.texElementImage2D.length===3)o.texElementImage2D(o.TEXTURE_2D,o.RGBA8,st);else{let{RGBA:Jt,RGBA:Mt,UNSIGNED_BYTE:xe}=o;o.texElementImage2D(o.TEXTURE_2D,0,Jt,Mt,xe,st)}o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE)}}else if(ut.length>0){if(dt&&xt){let St=je(ut[0]);c.texStorage2D(o.TEXTURE_2D,Lt,it,St.width,St.height)}for(let St=0,Ot=ut.length;St<Ot;St++)if(nt=ut[St],dt){if(Ft)c.texSubImage2D(o.TEXTURE_2D,St,0,0,pt,H,nt)}else c.texImage2D(o.TEXTURE_2D,St,it,pt,H,nt);I.generateMipmaps=!1}else if(dt){if(xt){let St=je(st);c.texStorage2D(o.TEXTURE_2D,Lt,it,St.width,St.height)}if(Ft)c.texSubImage2D(o.TEXTURE_2D,0,0,0,pt,H,st)}else c.texImage2D(o.TEXTURE_2D,0,it,pt,H,st);if(C(I)&&I.mipmapsAutoUpdate===!0)A(lt);if(gt.__version=ft.version,I.onUpdate)I.onUpdate(I)}F.__version=I.version}function Se(F,I,Y){if(I.image.length!==6)return;let lt=kt(F,I),ot=I.source;c.bindTexture(o.TEXTURE_CUBE_MAP,F.__webglTexture,o.TEXTURE0+Y);let ft=h.get(ot);if(ot.version!==ft.__version||lt===!0){c.activeTexture(o.TEXTURE0+Y);let gt=te.getPrimaries(te.workingColorSpace),tt=I.colorSpace===Vi?null:te.getPrimaries(I.colorSpace),st=I.colorSpace===Vi||gt===tt?o.NONE:o.BROWSER_DEFAULT_WEBGL;c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,I.flipY),c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),c.pixelStorei(o.UNPACK_ALIGNMENT,I.unpackAlignment),c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);let pt=I.isCompressedTexture||I.image[0].isCompressedTexture,H=I.image[0]&&I.image[0].isDataTexture,it=[];for(let Mt=0;Mt<6;Mt++){if(!pt&&!H)it[Mt]=E(I.image[Mt],!0,u.maxCubemapSize);else it[Mt]=H?I.image[Mt].image:I.image[Mt];it[Mt]=Wt(I,it[Mt])}let nt=it[0],ut=d.convert(I.format,I.colorSpace),dt=d.convert(I.type),xt=L(I.internalFormat,ut,dt,I.normalized,I.colorSpace),Ft=I.isVideoTexture!==!0,Lt=ft.__version===void 0||lt===!0,St=ot.dataReady,Ot=R(I,nt);Vt(o.TEXTURE_CUBE_MAP,I);let Jt;if(I.isDepthTexture){if(xt=b(I.format===Ti,I.type),Lt)if(Ft)c.texStorage2D(o.TEXTURE_CUBE_MAP,1,xt,nt.width,nt.height);else for(let Mt=0;Mt<6;Mt++)c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,xt,nt.width,nt.height,0,ut,dt,null)}else if(pt){if(Ft&&Lt)c.texStorage2D(o.TEXTURE_CUBE_MAP,Ot,xt,nt.width,nt.height);for(let Mt=0;Mt<6;Mt++){Jt=it[Mt].mipmaps;for(let xe=0;xe<Jt.length;xe++){let Ve=Jt[xe];if(I.format!==Cn)if(ut!==null)if(Ft){if(St)c.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe,0,0,Ve.width,Ve.height,ut,Ve.data)}else c.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe,xt,Ve.width,Ve.height,0,Ve.data);else Bt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Ft){if(St)c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe,0,0,Ve.width,Ve.height,ut,dt,Ve.data)}else c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe,xt,Ve.width,Ve.height,0,ut,dt,Ve.data)}}}else{if(Jt=I.mipmaps,Ft&&Lt){if(Jt.length>0)Ot++;let Mt=je(it[0]);c.texStorage2D(o.TEXTURE_CUBE_MAP,Ot,xt,Mt.width,Mt.height)}for(let Mt=0;Mt<6;Mt++)if(H){if(Ft){if(St)c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,0,0,it[Mt].width,it[Mt].height,ut,dt,it[Mt].data)}else c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,xt,it[Mt].width,it[Mt].height,0,ut,dt,it[Mt].data);for(let xe=0;xe<Jt.length;xe++){let jn=Jt[xe].image[Mt].image;if(Ft){if(St)c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe+1,0,0,jn.width,jn.height,ut,dt,jn.data)}else c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe+1,xt,jn.width,jn.height,0,ut,dt,jn.data)}}else{if(Ft){if(St)c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,0,0,ut,dt,it[Mt])}else c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,0,xt,ut,dt,it[Mt]);for(let xe=0;xe<Jt.length;xe++){let Ve=Jt[xe];if(Ft){if(St)c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe+1,0,0,ut,dt,Ve.image[Mt])}else c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+Mt,xe+1,xt,ut,dt,Ve.image[Mt])}}}if(C(I)&&I.mipmapsAutoUpdate===!0)A(o.TEXTURE_CUBE_MAP);if(ft.__version=ot.version,I.onUpdate)I.onUpdate(I)}F.__version=I.version}function Qt(F,I,Y,lt,ot,ft){let gt=d.convert(Y.format,Y.colorSpace),tt=d.convert(Y.type),st=L(Y.internalFormat,gt,tt,Y.normalized,Y.colorSpace),pt=h.get(I),H=h.get(Y);if(H.__renderTarget=I,!pt.__hasExternalTextures){let it=Math.max(1,I.width>>ft),nt=Math.max(1,I.height>>ft);if(ot===o.TEXTURE_3D||ot===o.TEXTURE_2D_ARRAY)c.texImage3D(ot,ft,st,it,nt,I.depth,0,gt,tt,null);else c.texImage2D(ot,ft,st,it,nt,0,gt,tt,null)}if(c.bindFramebuffer(o.FRAMEBUFFER,F),Ae(I))p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,lt,ot,H.__webglTexture,0,yt(I));else if(ot===o.TEXTURE_2D||ot>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&ot<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)o.framebufferTexture2D(o.FRAMEBUFFER,lt,ot,H.__webglTexture,ft);c.bindFramebuffer(o.FRAMEBUFFER,null)}function oe(F,I,Y){if(o.bindRenderbuffer(o.RENDERBUFFER,F),I.depthBuffer){let lt=I.depthTexture,ot=lt&&lt.isDepthTexture?lt.type:null,ft=b(I.stencilBuffer,ot),gt=I.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;if(Ae(I))p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,yt(I),ft,I.width,I.height);else if(Y)o.renderbufferStorageMultisample(o.RENDERBUFFER,yt(I),ft,I.width,I.height);else o.renderbufferStorage(o.RENDERBUFFER,ft,I.width,I.height);o.framebufferRenderbuffer(o.FRAMEBUFFER,gt,o.RENDERBUFFER,F)}else{let lt=I.textures;for(let ot=0;ot<lt.length;ot++){let ft=lt[ot],gt=d.convert(ft.format,ft.colorSpace),tt=d.convert(ft.type),st=L(ft.internalFormat,gt,tt,ft.normalized,ft.colorSpace);if(Ae(I))p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,yt(I),st,I.width,I.height);else if(Y)o.renderbufferStorageMultisample(o.RENDERBUFFER,yt(I),st,I.width,I.height);else o.renderbufferStorage(o.RENDERBUFFER,st,I.width,I.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function De(F,I,Y){let lt=I.isWebGLCubeRenderTarget===!0;if(c.bindFramebuffer(o.FRAMEBUFFER,F),!(I.depthTexture&&I.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ot=h.get(I.depthTexture);ot.__renderTarget=I;let ft=lt?I.depthTexture.image[0]:I.depthTexture.image;if(!ot.__webglTexture||ft.width!==I.width||ft.height!==I.height)ft.width=I.width,ft.height=I.height,I.depthTexture.needsUpdate=!0;if(lt)Et(I.depthTexture,0);else Tt(I.depthTexture,0);let gt=ot.__webglTexture,tt=yt(I),st=lt?o.TEXTURE_CUBE_MAP_POSITIVE_X+Y:o.TEXTURE_2D,pt=I.depthTexture.format===Ti?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;if(I.depthTexture.format===Ts)if(Ae(I))p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,pt,st,gt,0,tt);else o.framebufferTexture2D(o.FRAMEBUFFER,pt,st,gt,0);else if(I.depthTexture.format===Ti)if(Ae(I))p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,pt,st,gt,0,tt);else o.framebufferTexture2D(o.FRAMEBUFFER,pt,st,gt,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Le(F){let I=h.get(F),Y=F.isWebGLCubeRenderTarget===!0;if(I.__boundDepthTexture!==F.depthTexture){let lt=F.depthTexture;if(I.__depthDisposeCallback)I.__depthDisposeCallback();if(lt){let ot=()=>{delete I.__boundDepthTexture,delete I.__depthDisposeCallback,lt.removeEventListener("dispose",ot)};lt.addEventListener("dispose",ot),I.__depthDisposeCallback=ot}I.__boundDepthTexture=lt}if(F.depthTexture&&!I.__autoAllocateDepthBuffer)if(Y)for(let lt=0;lt<6;lt++)De(I.__webglFramebuffer[lt],F,lt);else if(F.texture.mipmaps.length>0)De(I.__webglFramebuffer[0],F,0);else De(I.__webglFramebuffer,F,0);else if(Y){I.__webglDepthbuffer=[];for(let lt=0;lt<6;lt++)if(c.bindFramebuffer(o.FRAMEBUFFER,I.__webglFramebuffer[lt]),I.__webglDepthbuffer[lt]===void 0)I.__webglDepthbuffer[lt]=o.createRenderbuffer(),oe(I.__webglDepthbuffer[lt],F,!1);else{let ot=F.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,ft=I.__webglDepthbuffer[lt];o.bindRenderbuffer(o.RENDERBUFFER,ft),o.framebufferRenderbuffer(o.FRAMEBUFFER,ot,o.RENDERBUFFER,ft)}}else{if(F.texture.mipmaps.length>0)c.bindFramebuffer(o.FRAMEBUFFER,I.__webglFramebuffer[0]);else c.bindFramebuffer(o.FRAMEBUFFER,I.__webglFramebuffer);if(I.__webglDepthbuffer===void 0)I.__webglDepthbuffer=o.createRenderbuffer(),oe(I.__webglDepthbuffer,F,!1);else{let ot=F.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,ft=I.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,ft),o.framebufferRenderbuffer(o.FRAMEBUFFER,ot,o.RENDERBUFFER,ft)}}c.bindFramebuffer(o.FRAMEBUFFER,null)}function hn(F,I,Y){let lt=h.get(F);if(I!==void 0)Qt(lt.__webglFramebuffer,F,F.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0);if(Y!==void 0)Le(F)}function V(F){let I=F.texture,Y=h.get(F),lt=h.get(I);F.addEventListener("dispose",z),N(F);let ot=F.textures,ft=F.isWebGLCubeRenderTarget===!0,gt=ot.length>1;if(!gt){if(lt.__webglTexture===void 0)lt.__webglTexture=o.createTexture();lt.__version=I.version,f.memory.textures++}if(ft){Y.__webglFramebuffer=[];for(let tt=0;tt<6;tt++)if(I.mipmaps.length>0){Y.__webglFramebuffer[tt]=[];for(let st=0;st<I.mipmaps.length;st++)Y.__webglFramebuffer[tt][st]=o.createFramebuffer()}else Y.__webglFramebuffer[tt]=o.createFramebuffer()}else{if(I.mipmaps.length>0){Y.__webglFramebuffer=[];for(let tt=0;tt<I.mipmaps.length;tt++)Y.__webglFramebuffer[tt]=o.createFramebuffer()}else Y.__webglFramebuffer=o.createFramebuffer();if(gt)for(let tt=0,st=ot.length;tt<st;tt++){let pt=h.get(ot[tt]);if(pt.__webglTexture===void 0)pt.__webglTexture=o.createTexture(),f.memory.textures++}if(F.samples>0&&Ae(F)===!1){Y.__webglMultisampledFramebuffer=o.createFramebuffer(),Y.__webglColorRenderbuffer=[],c.bindFramebuffer(o.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let tt=0;tt<ot.length;tt++){let st=ot[tt];Y.__webglColorRenderbuffer[tt]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,Y.__webglColorRenderbuffer[tt]);let pt=d.convert(st.format,st.colorSpace),H=d.convert(st.type),it=L(st.internalFormat,pt,H,st.normalized,st.colorSpace,F.isXRRenderTarget===!0),nt=yt(F);o.renderbufferStorageMultisample(o.RENDERBUFFER,nt,it,F.width,F.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+tt,o.RENDERBUFFER,Y.__webglColorRenderbuffer[tt])}if(o.bindRenderbuffer(o.RENDERBUFFER,null),F.depthBuffer)Y.__webglDepthRenderbuffer=o.createRenderbuffer(),oe(Y.__webglDepthRenderbuffer,F,!0);c.bindFramebuffer(o.FRAMEBUFFER,null)}}if(ft){c.bindTexture(o.TEXTURE_CUBE_MAP,lt.__webglTexture),Vt(o.TEXTURE_CUBE_MAP,I);for(let tt=0;tt<6;tt++)if(I.mipmaps.length>0)for(let st=0;st<I.mipmaps.length;st++)Qt(Y.__webglFramebuffer[tt][st],F,I,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+tt,st);else Qt(Y.__webglFramebuffer[tt],F,I,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0);if(C(I))A(o.TEXTURE_CUBE_MAP);else if(I.mipmaps.length>0)o.texParameteri(o.TEXTURE_CUBE_MAP,o.TEXTURE_MAX_LEVEL,I.mipmaps.length-1);c.unbindTexture()}else if(gt){for(let tt=0,st=ot.length;tt<st;tt++){let pt=ot[tt],H=h.get(pt),it=o.TEXTURE_2D;if(F.isWebGL3DRenderTarget||F.isWebGLArrayRenderTarget)it=F.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY;if(c.bindTexture(it,H.__webglTexture),Vt(it,pt),Qt(Y.__webglFramebuffer,F,pt,o.COLOR_ATTACHMENT0+tt,it,0),C(pt))A(it)}c.unbindTexture()}else{let tt=o.TEXTURE_2D;if(F.isWebGL3DRenderTarget||F.isWebGLArrayRenderTarget)tt=F.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY;if(c.bindTexture(tt,lt.__webglTexture),Vt(tt,I),I.mipmaps.length>0)for(let st=0;st<I.mipmaps.length;st++)Qt(Y.__webglFramebuffer[st],F,I,o.COLOR_ATTACHMENT0,tt,st);else Qt(Y.__webglFramebuffer,F,I,o.COLOR_ATTACHMENT0,tt,0);if(C(I))A(tt);else if(I.mipmaps.length>0)o.texParameteri(tt,o.TEXTURE_MAX_LEVEL,I.mipmaps.length-1);c.unbindTexture()}if(F.depthBuffer)Le(F)}function un(F){let I=F.textures;for(let Y=0,lt=I.length;Y<lt;Y++){let ot=I[Y];if(C(ot)&&ot.mipmapsAutoUpdate===!0){let ft=P(F),gt=h.get(ot).__webglTexture;c.bindTexture(ft,gt),A(ft),c.unbindTexture()}}}let fe=[];function Ge(F){if(F.samples>0){if(Ae(F)===!1){let{textures:I,width:Y,height:lt}=F,ot=o.COLOR_BUFFER_BIT,ft=F.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,gt=h.get(F),tt=I.length>1;if(tt)for(let pt=0;pt<I.length;pt++)c.bindFramebuffer(o.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+pt,o.RENDERBUFFER,null),c.bindFramebuffer(o.FRAMEBUFFER,gt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+pt,o.TEXTURE_2D,null,0);if(c.bindFramebuffer(o.READ_FRAMEBUFFER,gt.__webglMultisampledFramebuffer),F.texture.mipmaps.length>0)c.bindFramebuffer(o.DRAW_FRAMEBUFFER,gt.__webglFramebuffer[0]);else c.bindFramebuffer(o.DRAW_FRAMEBUFFER,gt.__webglFramebuffer);for(let pt=0;pt<I.length;pt++){if(F.resolveDepthBuffer){if(F.depthBuffer)ot|=o.DEPTH_BUFFER_BIT;if(F.stencilBuffer&&F.resolveStencilBuffer)ot|=o.STENCIL_BUFFER_BIT}if(tt){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,gt.__webglColorRenderbuffer[pt]);let H=h.get(I[pt]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,H,0)}if(o.blitFramebuffer(0,0,Y,lt,0,0,Y,lt,ot,o.NEAREST),m===!0){if(fe.length=0,fe.push(o.COLOR_ATTACHMENT0+pt),F.depthBuffer&&F.storeMultisampledDepthBuffer===!1)fe.push(ft);o.invalidateFramebuffer(o.READ_FRAMEBUFFER,fe)}}if(c.bindFramebuffer(o.READ_FRAMEBUFFER,null),c.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),tt)for(let pt=0;pt<I.length;pt++){c.bindFramebuffer(o.FRAMEBUFFER,gt.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+pt,o.RENDERBUFFER,gt.__webglColorRenderbuffer[pt]);let H=h.get(I[pt]).__webglTexture;c.bindFramebuffer(o.FRAMEBUFFER,gt.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+pt,o.TEXTURE_2D,H,0)}c.bindFramebuffer(o.DRAW_FRAMEBUFFER,gt.__webglMultisampledFramebuffer)}else if(F.depthBuffer&&F.storeMultisampledDepthBuffer===!1&&m){let I=F.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[I])}}}function yt(F){return Math.min(u.maxSamples,F.samples)}function Ae(F){let I=h.get(F);return F.samples>0&&l.has("WEBGL_multisampled_render_to_texture")===!0&&I.__useRenderToTexture!==!1}function zt(F){let I=f.render.frame;if(x.get(F)!==I)x.set(F,I),F.update()}function Wt(F,I){let{colorSpace:Y,format:lt,type:ot}=F;if(F.isCompressedTexture===!0||F.isVideoTexture===!0)return I;if(Y!==Xl&&Y!==Vi)if(te.getTransfer(Y)===be){if(lt!==Cn||ot!==zn)Bt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Ht("WebGLTextures: Unsupported texture color space:",Y);return I}function je(F){if(typeof HTMLImageElement<"u"&&F instanceof HTMLImageElement)g.width=F.naturalWidth||F.width,g.height=F.naturalHeight||F.height;else if(typeof VideoFrame<"u"&&F instanceof VideoFrame)g.width=F.displayWidth,g.height=F.displayHeight;else g.width=F.width,g.height=F.height;return g}this.allocateTextureUnit=et,this.resetTextureUnits=rt,this.getTextureUnits=ct,this.setTextureUnits=At,this.setTexture2D=Tt,this.setTexture2DArray=Nt,this.setTexture3D=Ut,this.setTextureCube=Et,this.rebindTextures=hn,this.setupRenderTarget=V,this.updateRenderTargetMipmap=un,this.updateMultisampleRenderTarget=Ge,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=Qt,this.useMultisampledRTT=Ae,this.dispose=q}function Kx(o,l){function c(h,u=Vi){let d,f=te.getTransfer(u);if(h===zn)return o.UNSIGNED_BYTE;if(h===dl)return o.UNSIGNED_SHORT_4_4_4_4;if(h===fl)return o.UNSIGNED_SHORT_5_5_5_1;if(h===Vu)return o.UNSIGNED_INT_5_9_9_9_REV;if(h===Wu)return o.UNSIGNED_INT_10F_11F_11F_REV;if(h===Hu)return o.BYTE;if(h===Gu)return o.SHORT;if(h===or)return o.UNSIGNED_SHORT;if(h===ul)return o.INT;if(h===bi)return o.UNSIGNED_INT;if(h===ci)return o.FLOAT;if(h===Xn)return o.HALF_FLOAT;if(h===Xu)return o.ALPHA;if(h===qu)return o.RGB;if(h===Cn)return o.RGBA;if(h===Ts)return o.DEPTH_COMPONENT;if(h===Ti)return o.DEPTH_STENCIL;if(h===Yu)return o.RED;if(h===pl)return o.RED_INTEGER;if(h===Gi)return o.RG;if(h===ml)return o.RG_INTEGER;if(h===gl)return o.RGBA_INTEGER;if(h===Es||h===vo||h===As||h===ws)if(f===be)if(d=l.get("WEBGL_compressed_texture_s3tc_srgb"),d!==null){if(h===Es)return d.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(h===vo)return d.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(h===As)return d.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(h===ws)return d.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(d=l.get("WEBGL_compressed_texture_s3tc"),d!==null){if(h===Es)return d.COMPRESSED_RGB_S3TC_DXT1_EXT;if(h===vo)return d.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(h===As)return d.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(h===ws)return d.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(h===_l||h===xl||h===yl||h===vl)if(d=l.get("WEBGL_compressed_texture_pvrtc"),d!==null){if(h===_l)return d.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(h===xl)return d.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(h===yl)return d.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(h===vl)return d.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(h===ar||h===Sl||h===Ml||h===bl||h===Tl||h===So||h===El)if(d=l.get("WEBGL_compressed_texture_etc"),d!==null){if(h===ar||h===Sl)return f===be?d.COMPRESSED_SRGB8_ETC2:d.COMPRESSED_RGB8_ETC2;if(h===Ml)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:d.COMPRESSED_RGBA8_ETC2_EAC;if(h===bl)return d.COMPRESSED_R11_EAC;if(h===Tl)return d.COMPRESSED_SIGNED_R11_EAC;if(h===So)return d.COMPRESSED_RG11_EAC;if(h===El)return d.COMPRESSED_SIGNED_RG11_EAC}else return null;if(h===Al||h===wl||h===Rl||h===Cl||h===Pl||h===Il||h===Dl||h===Ll||h===Nl||h===Ul||h===Fl||h===Ol||h===Bl||h===zl)if(d=l.get("WEBGL_compressed_texture_astc"),d!==null){if(h===Al)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:d.COMPRESSED_RGBA_ASTC_4x4_KHR;if(h===wl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:d.COMPRESSED_RGBA_ASTC_5x4_KHR;if(h===Rl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:d.COMPRESSED_RGBA_ASTC_5x5_KHR;if(h===Cl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:d.COMPRESSED_RGBA_ASTC_6x5_KHR;if(h===Pl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:d.COMPRESSED_RGBA_ASTC_6x6_KHR;if(h===Il)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:d.COMPRESSED_RGBA_ASTC_8x5_KHR;if(h===Dl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:d.COMPRESSED_RGBA_ASTC_8x6_KHR;if(h===Ll)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:d.COMPRESSED_RGBA_ASTC_8x8_KHR;if(h===Nl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:d.COMPRESSED_RGBA_ASTC_10x5_KHR;if(h===Ul)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:d.COMPRESSED_RGBA_ASTC_10x6_KHR;if(h===Fl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:d.COMPRESSED_RGBA_ASTC_10x8_KHR;if(h===Ol)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:d.COMPRESSED_RGBA_ASTC_10x10_KHR;if(h===Bl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:d.COMPRESSED_RGBA_ASTC_12x10_KHR;if(h===zl)return f===be?d.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:d.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(h===kl||h===lr||h===cr)if(d=l.get("EXT_texture_compression_bptc"),d!==null){if(h===kl)return f===be?d.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:d.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(h===lr)return d.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(h===cr)return d.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(h===Hl||h===Gl||h===Mo||h===Vl)if(d=l.get("EXT_texture_compression_rgtc"),d!==null){if(h===Hl)return d.COMPRESSED_RED_RGTC1_EXT;if(h===Gl)return d.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(h===Mo)return d.COMPRESSED_RED_GREEN_RGTC2_EXT;if(h===Vl)return d.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(h===Hi)return o.UNSIGNED_INT_24_8;return o[h]!==void 0?o[h]:null}return{convert:c}}var $x=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jx=`
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

}`;class Jd{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(o,l){if(this.texture===null){let c=new Lo(o.texture);if(o.depthNear!==l.depthNear||o.depthFar!==l.depthFar)this.depthNear=o.depthNear,this.depthFar=o.depthFar;this.texture=c}}getMesh(o){if(this.texture!==null){if(this.mesh===null){let l=o.cameras[0].viewport,c=new ui({vertexShader:$x,fragmentShader:jx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:l.z},depthHeight:{value:l.w}}});this.mesh=new Ke(new xr(20,20),c)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Kd extends qn{constructor(o,l){super();let c=this,h=null,u=1,d=null,f="local-floor",p=1,m=null,g=null,x=null,y=null,_=null,v=null,T=typeof XRWebGLBinding<"u",w=new Jd,S={},M=l.getContextAttributes(),E=null,C=null,A=[],P=[],L=new Dt,b=null,R=null,N=new _n;N.viewport=new Pe;let B=new _n;B.viewport=new Pe;let U=[N,B],z=new Tc,W=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(et){let at=A[et];if(at===void 0)at=new dr,A[et]=at;return at.getTargetRaySpace()},this.getControllerGrip=function(et){let at=A[et];if(at===void 0)at=new dr,A[et]=at;return at.getGripSpace()},this.getHand=function(et){let at=A[et];if(at===void 0)at=new dr,A[et]=at;return at.getHandSpace()};function q(et){let at=P.indexOf(et.inputSource);if(at===-1)return;let Tt=A[at];if(Tt!==void 0)Tt.update(et.inputSource,et.frame,m||d),Tt.dispatchEvent({type:et.type,data:et.inputSource})}function j(){h.removeEventListener("select",q),h.removeEventListener("selectstart",q),h.removeEventListener("selectend",q),h.removeEventListener("squeeze",q),h.removeEventListener("squeezestart",q),h.removeEventListener("squeezeend",q),h.removeEventListener("end",j),h.removeEventListener("inputsourceschange",X);for(let et=0;et<A.length;et++){let at=P[et];if(at===null)continue;P[et]=null,A[et].disconnect(at)}W=null,O=null,w.reset();for(let et in S)delete S[et];if(o.setRenderTarget(E),_=null,y=null,x=null,h=null,C=null,At.stop(),c.isPresenting=!1,o.setPixelRatio(b),o.setSize(L.width,L.height,!1),R!==null){let et=R.camera;et.fov=R.fov,et.zoom=R.zoom,et.updateProjectionMatrix(),R=null}c.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(et){if(u=et,c.isPresenting===!0)Bt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(et){if(f=et,c.isPresenting===!0)Bt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||d},this.setReferenceSpace=function(et){m=et},this.getBaseLayer=function(){return y!==null?y:_},this.getBinding=function(){if(x===null&&T)x=new XRWebGLBinding(h,l);return x},this.getFrame=function(){return v},this.getSession=function(){return h},this.setSession=async function(et){if(h=et,h!==null){if(E=o.getRenderTarget(),h.addEventListener("select",q),h.addEventListener("selectstart",q),h.addEventListener("selectend",q),h.addEventListener("squeeze",q),h.addEventListener("squeezestart",q),h.addEventListener("squeezeend",q),h.addEventListener("end",j),h.addEventListener("inputsourceschange",X),M.xrCompatible!==!0)await l.makeXRCompatible();if(b=o.getPixelRatio(),o.getSize(L),!(T&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Tt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:u};_=new XRWebGLLayer(h,l,Tt),h.updateRenderState({baseLayer:_}),o.setPixelRatio(1),o.setSize(_.framebufferWidth,_.framebufferHeight,!1),C=new In(_.framebufferWidth,_.framebufferHeight,{format:Cn,type:zn,colorSpace:o.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:_.ignoreDepthValues===!1,resolveStencilBuffer:_.ignoreDepthValues===!1,storeMultisampledDepthBuffer:_.ignoreDepthValues===!1,storeMultisampledStencilBuffer:_.ignoreDepthValues===!1})}else{let Tt=null,Nt=null,Ut=null;if(M.depth)Ut=M.stencil?l.DEPTH24_STENCIL8:l.DEPTH_COMPONENT24,Tt=M.stencil?Ti:Ts,Nt=M.stencil?Hi:bi;let Et={colorFormat:l.RGBA8,depthFormat:Ut,scaleFactor:u};x=this.getBinding(),y=x.createProjectionLayer(Et),h.updateRenderState({layers:[y]}),o.setPixelRatio(1),o.setSize(y.textureWidth,y.textureHeight,!1),C=new In(y.textureWidth,y.textureHeight,{format:Cn,type:zn,depthTexture:new Ai(y.textureWidth,y.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,Tt),stencilBuffer:M.stencil,colorSpace:o.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1,resolveStencilBuffer:y.ignoreDepthValues===!1,storeMultisampledDepthBuffer:y.ignoreDepthValues===!1,storeMultisampledStencilBuffer:y.ignoreDepthValues===!1})}C.isXRRenderTarget=!0,this.setFoveation(p),m=null,d=await h.requestReferenceSpace(f),At.setContext(h),At.start(),c.isPresenting=!0,c.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(h!==null)return h.environmentBlendMode},this.getDepthTexture=function(){return w.getDepthTexture()};function X(et){for(let at=0;at<et.removed.length;at++){let Tt=et.removed[at],Nt=P.indexOf(Tt);if(Nt>=0)P[Nt]=null,A[Nt].disconnect(Tt)}for(let at=0;at<et.added.length;at++){let Tt=et.added[at],Nt=P.indexOf(Tt);if(Nt===-1){for(let Et=0;Et<A.length;Et++)if(Et>=P.length){P.push(Tt),Nt=Et;break}else if(P[Et]===null){P[Et]=Tt,Nt=Et;break}if(Nt===-1)break}let Ut=A[Nt];if(Ut)Ut.connect(Tt)}}function ht(et,at){if(at===null)et.matrixWorld.copy(et.matrix);else et.matrixWorld.multiplyMatrices(at.matrixWorld,et.matrix);et.matrixWorldInverse.copy(et.matrixWorld).invert()}this.updateCamera=function(et){if(h===null)return;let{near:at,far:Tt}=et;if(w.texture!==null){if(w.depthNear>0)at=w.depthNear;if(w.depthFar>0)Tt=w.depthFar}if(z.near=B.near=N.near=at,z.far=B.far=N.far=Tt,W!==z.near||O!==z.far)h.updateRenderState({depthNear:z.near,depthFar:z.far}),W=z.near,O=z.far;z.layers.mask=et.layers.mask|6,N.layers.mask=z.layers.mask&-5,B.layers.mask=z.layers.mask&-3;let Nt=et.parent,Ut=z.cameras;ht(z,Nt);for(let Et=0;Et<Ut.length;Et++)ht(Ut[Et],Nt);if(z.projectionMatrix.copy(N.projectionMatrix),z.projectionMatrixInverse.copy(N.projectionMatrixInverse),R===null&&et.isPerspectiveCamera)R={camera:et,fov:et.fov,zoom:et.zoom};Q(et,z,Nt)};function Q(et,at,Tt){if(Tt===null)et.matrix.copy(at.matrixWorld);else et.matrix.copy(Tt.matrixWorld),et.matrix.invert(),et.matrix.multiply(at.matrixWorld);if(et.matrix.decompose(et.position,et.quaternion,et.scale),et.updateMatrixWorld(!0),et.projectionMatrix.copy(at.projectionMatrix),et.projectionMatrixInverse.copy(at.projectionMatrixInverse),et.isPerspectiveCamera)et.fov=vs*2*Math.atan(1/et.projectionMatrix.elements[5]),et.zoom=1}this.getCamera=function(){return z},this.getFoveation=function(){if(y===null&&_===null)return;return p},this.setFoveation=function(et){if(p=et,y!==null)y.fixedFoveation=et;if(_!==null&&_.fixedFoveation!==void 0)_.fixedFoveation=et},this.hasDepthSensing=function(){return w.texture!==null},this.getDepthSensingMesh=function(){return w.getMesh(z)},this.getCameraTexture=function(et){return S[et]};let rt=null;function ct(et,at){if(g=at.getViewerPose(m||d),v=at,g!==null){let Tt=g.views;if(_!==null)o.setRenderTargetFramebuffer(C,_.framebuffer),o.setRenderTarget(C);let Nt=!1;if(Tt.length!==z.cameras.length)z.cameras.length=0,Nt=!0;for(let Zt=0;Zt<Tt.length;Zt++){let Pt=Tt[Zt],Vt=null;if(_!==null)Vt=_.getViewport(Pt);else{let ae=x.getViewSubImage(y,Pt);if(Vt=ae.viewport,Zt===0)o.setRenderTargetTextures(C,ae.colorTexture,ae.depthStencilTexture),o.setRenderTarget(C)}let kt=U[Zt];if(kt===void 0)kt=new _n,kt.layers.enable(Zt),kt.viewport=new Pe,U[Zt]=kt;if(kt.matrix.fromArray(Pt.transform.matrix),kt.matrix.decompose(kt.position,kt.quaternion,kt.scale),kt.projectionMatrix.fromArray(Pt.projectionMatrix),kt.projectionMatrixInverse.copy(kt.projectionMatrix).invert(),kt.viewport.set(Vt.x,Vt.y,Vt.width,Vt.height),Zt===0)z.matrix.copy(kt.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale);if(Nt===!0)z.cameras.push(kt)}let Ut=h.enabledFeatures;if(Ut&&Ut.includes("depth-sensing")&&h.depthUsage=="gpu-optimized"&&T){x=c.getBinding();let Zt=x.getDepthInformation(Tt[0]);if(Zt&&Zt.isValid&&Zt.texture)w.init(Zt,h.renderState)}if(Ut&&Ut.includes("camera-access")&&T){o.state.unbindTexture(),x=c.getBinding();for(let Zt=0;Zt<Tt.length;Zt++){let Pt=Tt[Zt].camera;if(Pt){let Vt=S[Pt];if(!Vt)Vt=new Lo,S[Pt]=Vt;let kt=x.getCameraImage(Pt);Vt.sourceTexture=kt}}}}for(let Tt=0;Tt<A.length;Tt++){let Nt=P[Tt],Ut=A[Tt];if(Nt!==null&&Ut!==void 0)Ut.update(Nt,at,m||d)}if(rt)rt(et,at);if(at.detectedPlanes)c.dispatchEvent({type:"planesdetected",data:at});v=null}let At=new Nd;At.setAnimationLoop(ct),this.setAnimationLoop=function(et){rt=et},this.dispose=function(){}}}var Qx=new Yt,$d=new Gt;$d.set(-1,0,0,0,1,0,0,0,1);function ty(o,l){function c(S,M){if(S.matrixAutoUpdate===!0)S.updateMatrix();M.value.copy(S.matrix)}function h(S,M){if(M.color.getRGB(S.fogColor.value,cc(o)),M.isFog)S.fogNear.value=M.near,S.fogFar.value=M.far;else if(M.isFogExp2)S.fogDensity.value=M.density}function u(S,M,E,C,A){if(M.isNodeMaterial)M.uniformsNeedUpdate=!1;else if(M.isMeshBasicMaterial)d(S,M);else if(M.isMeshLambertMaterial){if(d(S,M),M.envMap)S.envMapIntensity.value=M.envMapIntensity}else if(M.isMeshToonMaterial)d(S,M),y(S,M);else if(M.isMeshPhongMaterial){if(d(S,M),x(S,M),M.envMap)S.envMapIntensity.value=M.envMapIntensity}else if(M.isMeshStandardMaterial){if(d(S,M),_(S,M),M.isMeshPhysicalMaterial)v(S,M,A)}else if(M.isMeshMatcapMaterial)d(S,M),T(S,M);else if(M.isMeshDepthMaterial)d(S,M);else if(M.isMeshDistanceMaterial)d(S,M),w(S,M);else if(M.isMeshNormalMaterial)d(S,M);else if(M.isLineBasicMaterial){if(f(S,M),M.isLineDashedMaterial)p(S,M)}else if(M.isPointsMaterial)m(S,M,E,C);else if(M.isSpriteMaterial)g(S,M);else if(M.isShadowMaterial)S.color.value.copy(M.color),S.opacity.value=M.opacity;else if(M.isShaderMaterial)M.uniformsNeedUpdate=!1}function d(S,M){if(S.opacity.value=M.opacity,M.color)S.diffuse.value.copy(M.color);if(M.emissive)S.emissive.value.copy(M.emissive).multiplyScalar(M.emissiveIntensity);if(M.map)S.map.value=M.map,c(M.map,S.mapTransform);if(M.alphaMap)S.alphaMap.value=M.alphaMap,c(M.alphaMap,S.alphaMapTransform);if(M.bumpMap){if(S.bumpMap.value=M.bumpMap,c(M.bumpMap,S.bumpMapTransform),S.bumpScale.value=M.bumpScale,M.side===on)S.bumpScale.value*=-1}if(M.normalMap){if(S.normalMap.value=M.normalMap,c(M.normalMap,S.normalMapTransform),S.normalScale.value.copy(M.normalScale),M.side===on)S.normalScale.value.negate()}if(M.displacementMap)S.displacementMap.value=M.displacementMap,c(M.displacementMap,S.displacementMapTransform),S.displacementScale.value=M.displacementScale,S.displacementBias.value=M.displacementBias;if(M.emissiveMap)S.emissiveMap.value=M.emissiveMap,c(M.emissiveMap,S.emissiveMapTransform);if(M.specularMap)S.specularMap.value=M.specularMap,c(M.specularMap,S.specularMapTransform);if(M.alphaTest>0)S.alphaTest.value=M.alphaTest;let E=l.get(M),{envMap:C,envMapRotation:A}=E;if(C){if(S.envMap.value=C,S.envMapRotation.value.setFromMatrix4(Qx.makeRotationFromEuler(A)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1)S.envMapRotation.value.premultiply($d);S.reflectivity.value=M.reflectivity,S.ior.value=M.ior,S.refractionRatio.value=M.refractionRatio}if(M.lightMap)S.lightMap.value=M.lightMap,S.lightMapIntensity.value=M.lightMapIntensity,c(M.lightMap,S.lightMapTransform);if(M.aoMap)S.aoMap.value=M.aoMap,S.aoMapIntensity.value=M.aoMapIntensity,c(M.aoMap,S.aoMapTransform)}function f(S,M){if(S.diffuse.value.copy(M.color),S.opacity.value=M.opacity,M.map)S.map.value=M.map,c(M.map,S.mapTransform)}function p(S,M){S.dashSize.value=M.dashSize,S.totalSize.value=M.dashSize+M.gapSize,S.scale.value=M.scale}function m(S,M,E,C){if(S.diffuse.value.copy(M.color),S.opacity.value=M.opacity,S.size.value=M.size*E,S.scale.value=C*0.5,M.map)S.map.value=M.map,c(M.map,S.uvTransform);if(M.alphaMap)S.alphaMap.value=M.alphaMap,c(M.alphaMap,S.alphaMapTransform);if(M.alphaTest>0)S.alphaTest.value=M.alphaTest}function g(S,M){if(S.diffuse.value.copy(M.color),S.opacity.value=M.opacity,S.rotation.value=M.rotation,M.map)S.map.value=M.map,c(M.map,S.mapTransform);if(M.alphaMap)S.alphaMap.value=M.alphaMap,c(M.alphaMap,S.alphaMapTransform);if(M.alphaTest>0)S.alphaTest.value=M.alphaTest}function x(S,M){S.specular.value.copy(M.specular),S.shininess.value=Math.max(M.shininess,0.0001)}function y(S,M){if(M.gradientMap)S.gradientMap.value=M.gradientMap}function _(S,M){if(S.metalness.value=M.metalness,M.metalnessMap)S.metalnessMap.value=M.metalnessMap,c(M.metalnessMap,S.metalnessMapTransform);if(S.roughness.value=M.roughness,M.roughnessMap)S.roughnessMap.value=M.roughnessMap,c(M.roughnessMap,S.roughnessMapTransform);if(M.envMap)S.envMapIntensity.value=M.envMapIntensity}function v(S,M,E){if(S.ior.value=M.ior,M.diffuseRoughness>0){if(S.diffuseRoughness.value=M.diffuseRoughness,M.diffuseRoughnessMap)S.diffuseRoughnessMap.value=M.diffuseRoughnessMap,c(M.diffuseRoughnessMap,S.diffuseRoughnessMapTransform)}if(M.sheen>0){if(S.sheenColor.value.copy(M.sheenColor).multiplyScalar(M.sheen),S.sheenRoughness.value=M.sheenRoughness,M.sheenColorMap)S.sheenColorMap.value=M.sheenColorMap,c(M.sheenColorMap,S.sheenColorMapTransform);if(M.sheenRoughnessMap)S.sheenRoughnessMap.value=M.sheenRoughnessMap,c(M.sheenRoughnessMap,S.sheenRoughnessMapTransform)}if(M.clearcoat>0){if(S.clearcoat.value=M.clearcoat,S.clearcoatRoughness.value=M.clearcoatRoughness,M.clearcoatMap)S.clearcoatMap.value=M.clearcoatMap,c(M.clearcoatMap,S.clearcoatMapTransform);if(M.clearcoatRoughnessMap)S.clearcoatRoughnessMap.value=M.clearcoatRoughnessMap,c(M.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform);if(M.clearcoatNormalMap){if(S.clearcoatNormalMap.value=M.clearcoatNormalMap,c(M.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(M.clearcoatNormalScale),M.side===on)S.clearcoatNormalScale.value.negate()}}if(M.dispersion>0)S.dispersion.value=M.dispersion;if(M.retroreflectivity>0)S.retroreflectivity.value=M.retroreflectivity;if(M.iridescence>0){if(S.iridescence.value=M.iridescence,S.iridescenceIOR.value=M.iridescenceIOR,S.iridescenceThicknessMinimum.value=M.iridescenceThicknessMinimum,S.iridescenceThicknessMaximum.value=M.iridescenceThicknessMaximum,M.iridescenceMap)S.iridescenceMap.value=M.iridescenceMap,c(M.iridescenceMap,S.iridescenceMapTransform);if(M.iridescenceThicknessMap)S.iridescenceThicknessMap.value=M.iridescenceThicknessMap,c(M.iridescenceThicknessMap,S.iridescenceThicknessMapTransform)}if(M.transmission>0){if(S.transmission.value=M.transmission,S.transmissionSamplerMap.value=E.texture,S.transmissionSamplerSize.value.set(E.width,E.height),M.transmissionMap)S.transmissionMap.value=M.transmissionMap,c(M.transmissionMap,S.transmissionMapTransform);if(S.thickness.value=M.thickness,M.thicknessMap)S.thicknessMap.value=M.thicknessMap,c(M.thicknessMap,S.thicknessMapTransform);S.attenuationDistance.value=M.attenuationDistance,S.attenuationColor.value.copy(M.attenuationColor)}if(M.anisotropy>0){if(S.anisotropyVector.value.set(M.anisotropy*Math.cos(M.anisotropyRotation),M.anisotropy*Math.sin(M.anisotropyRotation)),M.anisotropyMap)S.anisotropyMap.value=M.anisotropyMap,c(M.anisotropyMap,S.anisotropyMapTransform)}if(S.specularIntensity.value=M.specularIntensity,S.specularColor.value.copy(M.specularColor),M.specularColorMap)S.specularColorMap.value=M.specularColorMap,c(M.specularColorMap,S.specularColorMapTransform);if(M.specularIntensityMap)S.specularIntensityMap.value=M.specularIntensityMap,c(M.specularIntensityMap,S.specularIntensityMapTransform)}function T(S,M){if(M.matcap)S.matcap.value=M.matcap}function w(S,M){let E=l.get(M).light;S.referencePosition.value.setFromMatrixPosition(E.matrixWorld),S.nearDistance.value=E.shadow.camera.near,S.farDistance.value=E.shadow.camera.far}return{refreshFogUniforms:h,refreshMaterialUniforms:u}}function ey(o,l,c,h){let u={},d={};function f(E,C){let A=C.program;h.uniformBlockBinding(E,A,u[E.id])}function p(E,C){let A=u[E.id];if(A===void 0)T(E),A=m(E),u[E.id]=A,E.addEventListener("dispose",S);let P=C.program;h.updateUBOMapping(E,P);let L=l.render.frame;if(d[E.id]!==L)g(E),d[E.id]=L}function m(E){let C=o.createBuffer(),{__size:A,usage:P}=E;return o.bindBuffer(o.UNIFORM_BUFFER,C),o.bufferData(o.UNIFORM_BUFFER,A,P),o.bindBuffer(o.UNIFORM_BUFFER,null),C}function g(E){let C=u[E.id],{uniforms:A,__cache:P}=E;o.bindBuffer(o.UNIFORM_BUFFER,C);for(let L=0,b=A.length;L<b;L++){let R=A[L];if(Array.isArray(R))for(let N=0,B=R.length;N<B;N++)x(R[N],L,N,P);else x(R,L,0,P)}o.bindBuffer(o.UNIFORM_BUFFER,null)}function x(E,C,A,P){if(_(E,C,A,P)===!0){let{__offset:L,value:b}=E;if(Array.isArray(b)){let R=0;for(let N=0;N<b.length;N++){let B=b[N],U=w(B,!0);y(B,E.__data,R),R+=U.storage/Float32Array.BYTES_PER_ELEMENT}}else y(b,E.__data,0);o.bufferSubData(o.UNIFORM_BUFFER,L,E.__data)}}function y(E,C,A){if(typeof E==="number"||typeof E==="boolean")C[A]=E;else if(E.isMatrix3)C[A]=E.elements[0],C[A+1]=E.elements[1],C[A+2]=E.elements[2],C[A+3]=0,C[A+4]=E.elements[3],C[A+5]=E.elements[4],C[A+6]=E.elements[5],C[A+7]=0,C[A+8]=E.elements[6],C[A+9]=E.elements[7],C[A+10]=E.elements[8],C[A+11]=0;else if(ArrayBuffer.isView(E))C.set(E.subarray(0,C.length-A),A);else E.toArray(C,A)}function _(E,C,A,P){let L=E.value,b=C+"_"+A;if(Array.isArray(L)){if(P[b]===void 0)P[b]=[];let R=P[b],N=!1;for(let B=0;B<L.length;B++)if(v(L[B],R,B)===!0)N=!0;return N}return v(L,P,b)}function v(E,C,A){if(C[A]===void 0){if(typeof E==="number"||typeof E==="boolean")C[A]=E;else if(ArrayBuffer.isView(E))C[A]=E.slice();else C[A]=E.clone();return!0}else{let P=C[A];if(typeof E==="number"||typeof E==="boolean"){if(P!==E)return C[A]=E,!0}else if(ArrayBuffer.isView(E))return!0;else if(P.equals(E)===!1)return P.copy(E),!0}return!1}function T(E){let C=E.uniforms,A=0,P=16;for(let b=0,R=C.length;b<R;b++){let N=Array.isArray(C[b])?C[b]:[C[b]];for(let B=0,U=N.length;B<U;B++){let z=N[B],W=Array.isArray(z.value)?z.value:[z.value],O=Array.isArray(C[b])||Array.isArray(z.value),q=A;for(let X=0,ht=W.length;X<ht;X++){let Q=W[X],rt=w(Q,O),ct=A%P,At=ct%rt.boundary,et=ct+At;if(A+=At,et!==0&&P-et<rt.storage)A+=P-et;if(X===0)q=A;A+=rt.storage}let j=z.type==="int"?Int32Array:z.type==="uint"?Uint32Array:Float32Array;z.__data=new j((A-q)/Float32Array.BYTES_PER_ELEMENT),z.__offset=q}}let L=A%P;if(L>0)A+=P-L;return E.__size=A,E.__cache={},this}function w(E,C){let A={boundary:0,storage:0};if(typeof E==="number"||typeof E==="boolean")A.boundary=4,A.storage=4;else if(E.isVector2)A.boundary=8,A.storage=8;else if(E.isVector3||E.isColor)A.boundary=16,A.storage=12;else if(E.isVector4)A.boundary=16,A.storage=16;else if(E.isMatrix3)A.boundary=16,A.storage=48;else if(E.isMatrix4)A.boundary=16,A.storage=64;else if(E.isTexture)Bt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(E))A.boundary=16,A.storage=E.byteLength;else Bt("WebGLRenderer: Unsupported uniform value type.",E);if(C===!0)A.boundary=16,A.storage=Math.ceil(A.storage/16)*16;return A}function S(E){let C=E.target;C.removeEventListener("dispose",S),o.deleteBuffer(u[C.id]),delete u[C.id],delete d[C.id]}function M(){for(let E in u)o.deleteBuffer(u[E]);u={},d={}}return{bind:f,update:p,dispose:M}}var ny=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Zn=null;function iy(){if(Zn===null)Zn=new xs(ny,16,16,Gi,Xn),Zn.name="DFG_LUT",Zn.minFilter=yn,Zn.magFilter=yn,Zn.wrapS=xo,Zn.wrapT=xo,Zn.generateMipmaps=!1,Zn.needsUpdate=!0;return Zn}class Ic{constructor(o={}){let{canvas:l=td(),context:c=null,depth:h=!0,stencil:u=!1,alpha:d=!1,antialias:f=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:g="default",failIfMajorPerformanceCaveat:x=!1,reversedDepthBuffer:y=!1,outputBufferType:_=zn}=o;this.isWebGLRenderer=!0;let v;if(c!==null){if(typeof WebGLRenderingContext<"u"&&c instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=c.getContextAttributes().alpha}else v=d;let T=_,w=new Set([gl,ml,pl]),S=new Set([zn,bi,or,Hi,dl,fl]),M=new Uint32Array(4),E=new Int32Array(4),C={textures:[],min:[],max:[],resolution:[]},A=null,P=null,L=[],b=[],R=null;this.domElement=l,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,B=!1,U=null,z=null,W=null,O=null;this._outputColorSpace=bo;let q=0,j=0,X=null,ht=-1,Q=null,rt=new Pe,ct=new Pe,At=null,et=new Kt(0),at=0,{width:Tt,height:Nt}=l,Ut=1,Et=null,jt=null,Zt=new Pe(0,0,Tt,Nt),Pt=new Pe(0,0,Tt,Nt),Vt=!1,kt=new yi,ae=new fr,le=!1,me=!1,Se=new Yt,Qt=new k,oe=new Pe,De={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Le=!1;function hn(){return X===null?Ut:1}let V=c;function un(D,G){return l.getContext(D,G)}let fe,Ge,yt,Ae,zt,Wt,je,F,I,Y,lt,ot,ft,gt,tt,st,pt,H,it,nt,ut,dt,xt;try{let D={alpha:!0,depth:h,stencil:u,antialias:f,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:g,failIfMajorPerformanceCaveat:x};if("setAttribute"in l)l.setAttribute("data-engine",`three.js r${zi}`);if(l.addEventListener("webglcontextlost",St,!1),l.addEventListener("webglcontextrestored",Ot,!1),l.addEventListener("webglcontextcreationerror",Jt,!1),V===null){if(V=un("webgl2",D),V===null)if(un("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ft()}catch(D){throw l.removeEventListener("webglcontextlost",St,!1),l.removeEventListener("webglcontextrestored",Ot,!1),l.removeEventListener("webglcontextcreationerror",Jt,!1),Ht("WebGLRenderer: "+D.message),D}function Ft(){if(fe=new p0(V),fe.init(),ut=new Kx(V,fe),Ge=new i0(V,fe,o,ut),yt=new Zx(V,fe),Ge.reversedDepthBuffer&&y)yt.buffers.depth.setReversed(!0);z=V.createFramebuffer(),W=V.createFramebuffer(),O=V.createFramebuffer(),Ae=new _0(V),zt=new Nx,Wt=new Jx(V,fe,yt,zt,Ge,ut,Ae),je=new f0(N),F=new ym(V),dt=new e0(V,F),I=new m0(V,F,Ae,dt),Y=new y0(V,I,F,dt,Ae),H=new x0(V,Ge,Wt),tt=new s0(zt),lt=new Lx(N,je,fe,Ge,dt,tt),ot=new ty(N,zt),ft=new Fx,gt=new Gx(fe),pt=new t0(N,je,yt,Y,v,p),st=new Yx(N,Y,Ge),xt=new ey(V,Ae,Ge,yt),it=new n0(V,fe,Ae),nt=new g0(V,fe,Ae),Ae.programs=lt.programs,N.capabilities=Ge,N.extensions=fe,N.properties=zt,N.renderLists=ft,N.shadowMap=st,N.state=yt,N.info=Ae}if(T!==zn)R=new S0(T,l.width,l.height,f,h,u);let Lt=new Kd(N,V);this.xr=Lt,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){let D=fe.get("WEBGL_lose_context");if(D)D.loseContext()},this.forceContextRestore=function(){let D=fe.get("WEBGL_lose_context");if(D)D.restoreContext()},this.getPixelRatio=function(){return Ut},this.setPixelRatio=function(D){if(D===void 0)return;Ut=D,this.setSize(Tt,Nt,!1)},this.getSize=function(D){return D.set(Tt,Nt)},this.setSize=function(D,G,K=!0){if(Lt.isPresenting){Bt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Tt=D,Nt=G,l.width=Math.floor(D*Ut),l.height=Math.floor(G*Ut),K===!0)l.style.width=D+"px",l.style.height=G+"px";if(R!==null)R.setSize(l.width,l.height);this.setViewport(0,0,D,G)},this.getDrawingBufferSize=function(D){return D.set(Tt*Ut,Nt*Ut).floor()},this.setDrawingBufferSize=function(D,G,K){Tt=D,Nt=G,Ut=K,l.width=Math.floor(D*K),l.height=Math.floor(G*K),this.setViewport(0,0,D,G)},this.setEffects=function(D){if(T===zn){Ht("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(D){for(let G=0;G<D.length;G++)if(D[G].isOutputPass===!0){Bt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(D||[])},this.getCurrentViewport=function(D){return D.copy(rt)},this.getViewport=function(D){return D.copy(Zt)},this.setViewport=function(D,G,K,Z){if(D.isVector4)Zt.set(D.x,D.y,D.z,D.w);else Zt.set(D,G,K,Z);yt.viewport(rt.copy(Zt).multiplyScalar(hn()).round())},this.getScissor=function(D){return D.copy(Pt)},this.setScissor=function(D,G,K,Z){if(D.isVector4)Pt.set(D.x,D.y,D.z,D.w);else Pt.set(D,G,K,Z);yt.scissor(ct.copy(Pt).multiplyScalar(hn()).round())},this.getScissorTest=function(){return Vt},this.setScissorTest=function(D){yt.setScissorTest(Vt=D)},this.setOpaqueSort=function(D){Et=D},this.setTransparentSort=function(D){jt=D},this.getClearColor=function(D){return D.copy(pt.getClearColor())},this.setClearColor=function(){pt.setClearColor(...arguments)},this.getClearAlpha=function(){return pt.getClearAlpha()},this.setClearAlpha=function(){pt.setClearAlpha(...arguments)},this.clear=function(D=!0,G=!0,K=!0){let Z=0;if(D){let J=!1;if(X!==null){let _t=X.texture.format;J=w.has(_t)}if(J){let _t=X.texture.type,wt=S.has(_t),mt=pt.getClearColor(),bt=pt.getClearAlpha(),{r:It,g:Xt,b:ne}=mt;if(wt)M[0]=It,M[1]=Xt,M[2]=ne,M[3]=bt,V.clearBufferuiv(V.COLOR,0,M);else E[0]=It,E[1]=Xt,E[2]=ne,E[3]=bt,V.clearBufferiv(V.COLOR,0,E)}else Z|=V.COLOR_BUFFER_BIT}if(G)Z|=V.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(K)Z|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(Z!==0)V.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(D){D.setRenderer(this),U=D},this.dispose=function(){l.removeEventListener("webglcontextlost",St,!1),l.removeEventListener("webglcontextrestored",Ot,!1),l.removeEventListener("webglcontextcreationerror",Jt,!1),pt.dispose(),ft.dispose(),gt.dispose(),Wt.dispose(),zt.dispose(),je.dispose(),Y.dispose(),I.dispose(),dt.dispose(),xt.dispose(),lt.dispose(),Lt.dispose(),Lt.removeEventListener("sessionstart",uh),Lt.removeEventListener("sessionend",dh),Ii.stop()};function St(D){D.preventDefault(),er("WebGLRenderer: Context Lost."),B=!0}function Ot(){er("WebGLRenderer: Context Restored."),B=!1;let D=Ae.autoReset,G=st.enabled,K=st.autoUpdate,Z=st.needsUpdate,J=st.type;Ft(),Ae.autoReset=D,st.enabled=G,st.autoUpdate=K,st.needsUpdate=Z,st.type=J}function Jt(D){Ht("WebGLRenderer: A WebGL context could not be created. Reason: ",D.statusMessage)}function Mt(D){let G=D.target;G.removeEventListener("dispose",Mt),xe(G)}function xe(D){Ve(D),zt.remove(D)}function Ve(D){let G=zt.get(D).programs;if(G!==void 0){if(G.forEach(function(K){lt.releaseProgram(K)}),D.isShaderMaterial)lt.releaseShaderCache(D)}}this.renderBufferDirect=function(D,G,K,Z,J,_t){if(G===null)G=De;let wt=J.isMesh&&J.matrixWorld.determinantAffine()<0,mt=hp(D,G,K,Z,J);yt.setMaterial(Z,wt);let bt=K.index,It=1;if(Z.wireframe===!0){if(bt=I.getWireframeAttribute(K),bt===void 0)return;It=2}let Xt=K.drawRange,ne=K.attributes.position,Rt=Xt.start*It,ie=(Xt.start+Xt.count)*It;if(_t!==null)Rt=Math.max(Rt,_t.start*It),ie=Math.min(ie,(_t.start+_t.count)*It);if(bt!==null)Rt=Math.max(Rt,0),ie=Math.min(ie,bt.count);else if(ne!==void 0&&ne!==null)Rt=Math.max(Rt,0),ie=Math.min(ie,ne.count);let Ne=ie-Rt;if(Ne<0||Ne===1/0)return;dt.setup(J,Z,mt,K,bt);let we,Me=it;if(bt!==null)we=F.get(bt),Me=nt,Me.setIndex(we);if(J.isMesh)if(Z.wireframe===!0)yt.setLineWidth(Z.wireframeLinewidth*hn()),Me.setMode(V.LINES);else Me.setMode(V.TRIANGLES);else if(J.isLine){let Qe=Z.linewidth;if(Qe===void 0)Qe=1;if(yt.setLineWidth(Qe*hn()),J.isLineSegments)Me.setMode(V.LINES);else if(J.isLineLoop)Me.setMode(V.LINE_LOOP);else Me.setMode(V.LINE_STRIP)}else if(J.isPoints)Me.setMode(V.POINTS);else if(J.isSprite)Me.setMode(V.TRIANGLES);if(J.isBatchedMesh)if(!fe.get("WEBGL_multi_draw")){let{_multiDrawStarts:Qe,_multiDrawCounts:Ct,_multiDrawCount:dn}=J,ce=bt?F.get(bt).bytesPerElement:1,Di=zt.get(Z).currentProgram.getUniforms();for(let tn=0;tn<dn;tn++)Di.setValue(V,"_gl_DrawID",tn),Me.render(Qe[tn]/ce,Ct[tn])}else Me.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else if(J.isInstancedMesh)Me.renderInstances(Rt,Ne,J.count);else if(K.isInstancedBufferGeometry){let Qe=K._maxInstanceCount!==void 0?K._maxInstanceCount:1/0,Ct=Math.min(K.instanceCount,Qe);Me.renderInstances(Rt,Ne,Ct)}else Me.render(Rt,Ne)};function jn(D,G,K,Z){if(U!==null&&D.isNodeMaterial)U.setObject(Z,D);if(le===!0)tt.setState(D,K,!1);if(D.transparent===!0&&D.side===Rn&&D.forceSinglePass===!1)D.side=on,D.needsUpdate=!0,Xs(D,G,Z),D.side=li,D.needsUpdate=!0,Xs(D,G,Z),D.side=Rn;else Xs(D,G,Z)}this.compile=function(D,G,K=null){if(K===null)K=D;if(U!==null)U.renderStart(D,G,K);if(P=gt.get(K),P.init(G),b.push(P),K.traverseVisible(function(J){if(J.isLight&&J.layers.test(G.layers)){if(P.pushLight(J),J.castShadow)P.pushShadow(J)}}),D!==K)D.traverseVisible(function(J){if(J.isLight&&J.layers.test(G.layers)){if(P.pushLight(J),J.castShadow)P.pushShadow(J)}});if(P.setupLights(),U!==null)U.updateLights(P.state.lightsArray);if(me=this.localClippingEnabled,le=tt.init(this.clippingPlanes,me),le===!0)tt.setGlobalState(this.clippingPlanes,G);if(U!==null)st.render(P.state.shadowsArray,K,G);let Z=new Set;if(D.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let _t=J.material;if(_t)if(Array.isArray(_t))for(let wt=0;wt<_t.length;wt++){let mt=_t[wt];jn(mt,K,G,J),Z.add(mt)}else jn(_t,K,G,J),Z.add(_t)}),P=b.pop(),U!==null)U.renderEnd();return Z},this.compileAsync=function(D,G,K=null){let Z=this.compile(D,G,K);return new Promise((J)=>{function _t(){if(Z.forEach(function(wt){let bt=zt.get(wt).currentProgram;if(bt===void 0||bt.isReady())Z.delete(wt)}),Z.size===0){J(D);return}setTimeout(_t,10)}if(fe.get("KHR_parallel_shader_compile")!==null)_t();else setTimeout(_t,10)})};let Ma=null;function lp(D){if(Ma)Ma(D)}function uh(){Ii.stop()}function dh(){Ii.start()}let Ii=new Nd;if(Ii.setAnimationLoop(lp),typeof self<"u")Ii.setContext(self);this.setAnimationLoop=function(D){Ma=D,Lt.setAnimationLoop(D),D===null?Ii.stop():Ii.start()},Lt.addEventListener("sessionstart",uh),Lt.addEventListener("sessionend",dh),this.render=function(D,G){if(G!==void 0&&G.isCamera!==!0){Ht("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(B===!0)return;if(U!==null)U.renderStart(D,G);let K=Lt.enabled===!0&&Lt.isPresenting===!0,Z=R!==null&&(X===null||K)&&R.begin(N,X);if(D.matrixWorldAutoUpdate===!0)D.updateMatrixWorld();if(G.parent===null&&G.matrixWorldAutoUpdate===!0)G.updateMatrixWorld();if(Lt.enabled===!0&&Lt.isPresenting===!0&&(R===null||R.isCompositing()===!1)){if(Lt.cameraAutoUpdate===!0)Lt.updateCamera(G);G=Lt.getCamera()}if(D.isScene===!0)D.onBeforeRender(N,D,G,X);if(P=gt.get(D,b.length),P.init(G),P.state.textureUnits=Wt.getTextureUnits(),b.push(P),Se.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),G.isArrayCamera)ae.setFromArrayCamera(G);else kt.setFromProjectionMatrix(Se,$l,G.reversedDepth);if(me=this.localClippingEnabled,le=tt.init(this.clippingPlanes,me),A=ft.get(D,L.length),A.init(),L.push(A),this.info.render.frame++,Lt.enabled===!0&&Lt.isPresenting===!0){let wt=N.xr.getDepthSensingMesh();if(wt!==null)ba(wt,G,-1/0,N.sortObjects)}if(ba(D,G,0,N.sortObjects),A.finish(),U!==null)U.updateLights(P.state.lightsArray);if(N.sortObjects===!0)A.sort(Et,jt);if(Le=Lt.enabled===!1||Lt.isPresenting===!1||Lt.hasDepthSensing()===!1,Le)pt.addToRenderList(A,D);if(this.info.autoReset===!0)this.info.reset();if(le===!0)tt.beginShadows();let J=P.state.shadowsArray;if(st.render(J,D,G),le===!0)tt.endShadows();if((Z&&R.hasRenderPass())===!1){let wt=A.opaque,mt=A.transmissive;if(P.setupLights(),G.isArrayCamera){let bt=G.cameras;if(mt.length>0)for(let It=0,Xt=bt.length;It<Xt;It++){let ne=bt[It];ph(wt,mt,D,ne)}if(Le)pt.render(D);for(let It=0,Xt=bt.length;It<Xt;It++){let ne=bt[It];fh(A,D,ne,ne.viewport)}}else{if(mt.length>0)ph(wt,mt,D,G);if(Le)pt.render(D);fh(A,D,G)}}if(X!==null&&j===0)Wt.updateMultisampleRenderTarget(X),Wt.updateRenderTargetMipmap(X);if(Z)R.end(N);if(D.isScene===!0)D.onAfterRender(N,D,G);if(dt.resetDefaultState(),ht=-1,Q=null,b.pop(),b.length>0){if(P=b[b.length-1],Wt.setTextureUnits(P.state.textureUnits),le===!0)tt.setGlobalState(N.clippingPlanes,P.state.camera)}else P=null;if(L.pop(),L.length>0)A=L[L.length-1];else A=null;if(U!==null)U.renderEnd()};function ba(D,G,K,Z){if(D.visible===!1)return;if(D.layers.test(G.layers)){if(D.isGroup)K=D.renderOrder;else if(D.isLOD){if(D.autoUpdate===!0)D.update(G)}else if(D.isLight){if(P.pushLight(D),D.castShadow)P.pushShadow(D)}else if(D.isSprite){let wt=G.isArrayCamera?ae:kt;if(!D.frustumCulled||D.intersectsFrustum(wt)){if(Z)oe.setFromMatrixPosition(D.matrixWorld).applyMatrix4(Se);let mt=Y.update(D),bt=D.material;if(bt.visible)A.push(D,mt,bt,K,oe.z,null,G)}}else if(D.isMesh||D.isLine||D.isPoints){let wt=G.isArrayCamera?ae:kt;if(!D.frustumCulled||D.intersectsFrustum(wt)){let mt=Y.update(D),bt=D.material;if(Z){if(D.boundingSphere!==void 0){if(D.boundingSphere===null)D.computeBoundingSphere();oe.copy(D.boundingSphere.center)}else{if(mt.boundingSphere===null)mt.computeBoundingSphere();oe.copy(mt.boundingSphere.center)}oe.applyMatrix4(D.matrixWorld).applyMatrix4(Se)}if(Array.isArray(bt)){let It=mt.groups;for(let Xt=0,ne=It.length;Xt<ne;Xt++){let Rt=It[Xt],ie=bt[Rt.materialIndex];if(ie&&ie.visible)A.push(D,mt,ie,K,oe.z,Rt,G)}}else if(bt.visible)A.push(D,mt,bt,K,oe.z,null,G)}}}let _t=D.children;for(let wt=0,mt=_t.length;wt<mt;wt++)ba(_t[wt],G,K,Z)}function fh(D,G,K,Z){let{opaque:J,transmissive:_t,transparent:wt}=D;if(P.setupLightsView(K),le===!0)tt.setGlobalState(N.clippingPlanes,K);if(Z)yt.viewport(rt.copy(Z));if(J.length>0)Or(J,G,K);if(_t.length>0)Or(_t,G,K);if(wt.length>0)Or(wt,G,K);yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function ph(D,G,K,Z){if((K.isScene===!0?K.overrideMaterial:null)!==null)return;if(P.state.transmissionRenderTarget[Z.id]===void 0){let Rt=fe.has("EXT_color_buffer_half_float")||fe.has("EXT_color_buffer_float");P.state.transmissionRenderTarget[Z.id]=new In(1,1,{generateMipmaps:!0,type:Rt?Xn:zn,minFilter:Bn,samples:Math.max(4,Ge.samples),stencilBuffer:u,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:te.workingColorSpace})}let _t=P.state.transmissionRenderTarget[Z.id],wt=Z.viewport||rt;_t.setSize(wt.z*N.transmissionResolutionScale,wt.w*N.transmissionResolutionScale);let mt=N.getRenderTarget(),bt=N.getActiveCubeFace(),It=N.getActiveMipmapLevel();if(N.setRenderTarget(_t),N.getClearColor(et),at=N.getClearAlpha(),at<1)N.setClearColor(16777215,0.5);if(N.clear(),Le)pt.render(K);let Xt=N.toneMapping;N.toneMapping=Wn;let ne=Z.viewport;if(Z.viewport!==void 0)Z.viewport=void 0;if(P.setupLightsView(Z),le===!0)tt.setGlobalState(N.clippingPlanes,Z);if(Or(D,K,Z),Wt.updateMultisampleRenderTarget(_t),Wt.updateRenderTargetMipmap(_t),fe.has("WEBGL_multisampled_render_to_texture")===!1){let Rt=!1;for(let ie=0,Ne=G.length;ie<Ne;ie++){let we=G[ie],{object:Me,geometry:Qe,material:Ct,group:dn}=we;if(Ct.side===Rn&&Me.layers.test(Z.layers)){let ce=Ct.side;Ct.side=on,Ct.needsUpdate=!0,mh(Me,K,Z,Qe,Ct,dn),Ct.side=ce,Ct.needsUpdate=!0,Rt=!0}}if(Rt===!0)Wt.updateMultisampleRenderTarget(_t),Wt.updateRenderTargetMipmap(_t)}if(N.setRenderTarget(mt,bt,It),N.setClearColor(et,at),ne!==void 0)Z.viewport=ne;N.toneMapping=Xt}function Or(D,G,K){let Z=G.isScene===!0?G.overrideMaterial:null;for(let J=0,_t=D.length;J<_t;J++){let wt=D[J],{object:mt,geometry:bt,group:It}=wt,Xt=wt.material;if(Xt.allowOverride===!0&&Z!==null)Xt=Z;if(mt.layers.test(K.layers))mh(mt,G,K,bt,Xt,It)}}function mh(D,G,K,Z,J,_t){if(U!==null&&J.isNodeMaterial)U.setObject(D,J);if(D.onBeforeRender(N,G,K,Z,J,_t),D.modelViewMatrix.multiplyMatrices(K.matrixWorldInverse,D.matrixWorld),D.normalMatrix.getNormalMatrix(D.modelViewMatrix),J.onBeforeRender(N,G,K,Z,D,_t),J.transparent===!0&&J.side===Rn&&J.forceSinglePass===!1)J.side=on,J.needsUpdate=!0,N.renderBufferDirect(K,G,Z,J,D,_t),J.side=li,J.needsUpdate=!0,N.renderBufferDirect(K,G,Z,J,D,_t),J.side=Rn;else N.renderBufferDirect(K,G,Z,J,D,_t);D.onAfterRender(N,G,K,Z,J,_t)}function gh(D){let G=0;for(let K of D)if(K.texture!==null)G++;return G}function Xs(D,G,K){if(G.isScene!==!0)G=De;let Z=zt.get(D),J=P.state.lights,_t=P.state.shadowsArray,wt=J.state.version,mt=lt.getParameters(D,J.state,_t,G,K,P.state.lightProbeGridArray),bt=lt.getProgramCacheKey(mt),It=Z.programs;Z.environment=D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial?G.environment:null,Z.fog=G.fog;let Xt=D.isMeshStandardMaterial||D.isMeshLambertMaterial&&!D.envMap||D.isMeshPhongMaterial&&!D.envMap;if(Z.envMap=je.get(D.envMap||Z.environment,Xt),Z.envMapRotation=Z.environment!==null&&D.envMap===null?G.environmentRotation:D.envMapRotation,It===void 0)D.addEventListener("dispose",Mt),It=new Map,Z.programs=It,Z.programVariants=new Map;let ne=It.get(bt);if(ne!==void 0){if(Z.currentProgram===ne&&Z.lightsStateVersion===wt)return xh(D,mt),ne}else{if(mt.uniforms=lt.getUniforms(D),U!==null&&D.isNodeMaterial)U.build(D,K,mt);D.onBeforeCompile(mt,N),ne=lt.acquireProgram(mt,bt),It.set(bt,ne),Z.uniforms=mt.uniforms}let Rt=Z.uniforms;if(!D.isShaderMaterial&&!D.isRawShaderMaterial||D.clipping===!0)Rt.clippingPlanes=tt.uniform;if(xh(D,mt),Z.needsLights=dp(D),Z.lightsStateVersion=wt,Z.needsLights)Rt.ambientLightColor.value=J.state.ambient,Rt.lightProbe.value=J.state.probe,Rt.sunLights.value=J.state.sun,Rt.sunLightShadows.value=J.state.sunShadow,Rt.directionalLights.value=J.state.directional,Rt.directionalLightShadows.value=J.state.directionalShadow,Rt.spotLights.value=J.state.spot,Rt.spotLightShadows.value=J.state.spotShadow,Rt.rectAreaLights.value=J.state.rectArea,Rt.ltc_1.value=J.state.rectAreaLTC1,Rt.ltc_2.value=J.state.rectAreaLTC2,Rt.pointLights.value=J.state.point,Rt.pointLightShadows.value=J.state.pointShadow,Rt.hemisphereLights.value=J.state.hemi,Rt.sunShadowMatrix.value=J.state.sunShadowMatrix,Rt.sunShadowCascade.value=J.state.sunShadowCascade,Rt.directionalShadowMatrix.value=J.state.directionalShadowMatrix,Rt.spotLightMatrix.value=J.state.spotLightMatrix,Rt.spotLightMap.value=J.state.spotLightMap,Rt.pointShadowMatrix.value=J.state.pointShadowMatrix;return Z.numLightProbeGrids=gh(P.state.lightProbeGridArray),Z.currentProgram=ne,Z.uniformsList=null,ne}function cp(D,G,K,Z,J){let _t=zt.get(D),wt=_t.currentProgram.id+","+Z+","+J,mt=_t.programVariants.get(wt);if(mt===void 0)mt=Xs(D,G,K),_t.programVariants.set(wt,mt);else _t.currentProgram=mt,_t.uniformsList=null,_t.outputColorSpace=Z,_t.toneMapping=J;return mt}function _h(D){if(D.uniformsList===null){let G=D.currentProgram.getUniforms();D.uniformsList=Tr.seqWithValue(G.seq,D.uniforms)}return D.uniformsList}function xh(D,G){let K=zt.get(D);K.outputColorSpace=G.outputColorSpace,K.batching=G.batching,K.batchingColor=G.batchingColor,K.instancing=G.instancing,K.instancingColor=G.instancingColor,K.instancingMorph=G.instancingMorph,K.skinning=G.skinning,K.morphTargets=G.morphTargets,K.morphNormals=G.morphNormals,K.morphColors=G.morphColors,K.morphTargetsCount=G.morphTargetsCount,K.numClippingPlanes=G.numClippingPlanes,K.numIntersection=G.numClipIntersection,K.vertexAlphas=G.vertexAlphas,K.vertexTangents=G.vertexTangents,K.toneMapping=G.toneMapping}function hp(D,G,K,Z,J){if(G.isScene!==!0)G=De;Wt.resetTextureUnits();let _t=G.fog,wt=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial?G.environment:null,mt=X===null?N.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:te.workingColorSpace,bt=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial&&!Z.envMap||Z.isMeshPhongMaterial&&!Z.envMap,It=je.get(Z.envMap||wt,bt),Xt=Z.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,ne=!!K.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),Rt=!!K.morphAttributes.position,ie=!!K.morphAttributes.normal,Ne=!!K.morphAttributes.color,we=Wn;if(Z.toneMapped){if(X===null||X.isXRRenderTarget===!0)we=N.toneMapping}let Me=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Qe=Me!==void 0?Me.length:0,Ct=zt.get(Z),dn=P.state.lights;if(le===!0){if(me===!0||D!==Q){let Ce=D===Q&&Z.id===ht;tt.setState(Z,D,Ce)}}let ce=!1,Di=!1;if(Z.version===Ct.__version){if(Ct.needsLights&&Ct.lightsStateVersion!==dn.state.version)ce=!0;else if(J.isBatchedMesh&&Ct.batching===!1)ce=!0;else if(!J.isBatchedMesh&&Ct.batching===!0)ce=!0;else if(J.isBatchedMesh&&Ct.batchingColor===!0&&J._colorsTexture===null)ce=!0;else if(J.isBatchedMesh&&Ct.batchingColor===!1&&J._colorsTexture!==null)ce=!0;else if(J.isInstancedMesh&&Ct.instancing===!1)ce=!0;else if(!J.isInstancedMesh&&Ct.instancing===!0)ce=!0;else if(J.isSkinnedMesh&&Ct.skinning===!1)ce=!0;else if(!J.isSkinnedMesh&&Ct.skinning===!0)ce=!0;else if(J.isInstancedMesh&&Ct.instancingColor===!0&&J.instanceColor===null)ce=!0;else if(J.isInstancedMesh&&Ct.instancingColor===!1&&J.instanceColor!==null)ce=!0;else if(J.isInstancedMesh&&Ct.instancingMorph===!0&&J.morphTexture===null)ce=!0;else if(J.isInstancedMesh&&Ct.instancingMorph===!1&&J.morphTexture!==null)ce=!0;else if(Ct.envMap!==It)ce=!0;else if(Z.fog===!0&&Ct.fog!==_t)ce=!0;else if(Ct.numClippingPlanes!==void 0&&(Ct.numClippingPlanes!==tt.numPlanes||Ct.numIntersection!==tt.numIntersection))ce=!0;else if(Ct.vertexAlphas!==Xt)ce=!0;else if(Ct.vertexTangents!==ne)ce=!0;else if(Ct.morphTargets!==Rt)ce=!0;else if(Ct.morphNormals!==ie)ce=!0;else if(Ct.morphColors!==Ne)ce=!0;else if(Ct.morphTargetsCount!==Qe)ce=!0;else if(Ct.numLightProbeGrids!==gh(P.state.lightProbeGridArray))ce=!0;else if(Ct.outputColorSpace!==mt||Ct.toneMapping!==we)Di=!0}else ce=!0,Ct.__version=Z.version;let tn=Ct.currentProgram;if(ce===!0||Di===!0){if(tn=Di===!0?cp(Z,G,J,mt,we):Xs(Z,G,J),U&&Z.isNodeMaterial)U.onUpdateProgram(Z,tn,Ct)}let Br=!1,fi=!1,Li=!1,re=tn.getUniforms(),Je=Ct.uniforms;if(yt.useProgram(tn.program))Br=!0,fi=!0,Li=!0;if(Z.id!==ht)ht=Z.id,fi=!0;if(Br||Q!==D){if(yt.buffers.depth.getReversed()&&D.reversedDepth!==!0)D._reversedDepth=!0,D.updateProjectionMatrix();re.setValue(V,"projectionMatrix",D.projectionMatrix),re.setValue(V,"viewMatrix",D.matrixWorldInverse);let We=re.map.cameraPosition;if(We!==void 0)We.setValue(V,Qt.setFromMatrixPosition(D.matrixWorld));if(Ge.logarithmicDepthBuffer)re.setValue(V,"logDepthBufFC",2/(Math.log(D.far+1)/Math.LN2));if(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)re.setValue(V,"isOrthographic",D.isOrthographicCamera===!0);if(Q!==D)Q=D,fi=!0,Li=!0}if(Ct.needsLights){if(dn.state.sunShadowMap.length>0)re.setValue(V,"sunShadowMap",dn.state.sunShadowMap,Wt);if(dn.state.directionalShadowMap.length>0)re.setValue(V,"directionalShadowMap",dn.state.directionalShadowMap,Wt);if(dn.state.spotShadowMap.length>0)re.setValue(V,"spotShadowMap",dn.state.spotShadowMap,Wt);if(dn.state.pointShadowMap.length>0)re.setValue(V,"pointShadowMap",dn.state.pointShadowMap,Wt)}if(J.isSkinnedMesh){re.setOptional(V,J,"bindMatrix"),re.setOptional(V,J,"bindMatrixInverse");let Ce=J.skeleton;if(Ce){if(Ce.boneTexture===null)Ce.computeBoneTexture();re.setValue(V,"boneTexture",Ce.boneTexture,Wt)}}if(J.isBatchedMesh){if(re.setOptional(V,J,"batchingTexture"),re.setValue(V,"batchingTexture",J._matricesTexture,Wt),re.setOptional(V,J,"batchingIdTexture"),re.setValue(V,"batchingIdTexture",J._indirectTexture,Wt),re.setOptional(V,J,"batchingColorTexture"),J._colorsTexture!==null)re.setValue(V,"batchingColorTexture",J._colorsTexture,Wt)}let Nn=K.morphAttributes;if(Nn.position!==void 0||Nn.normal!==void 0||Nn.color!==void 0)H.update(J,K,tn);if(fi||Ct.receiveShadow!==J.receiveShadow)Ct.receiveShadow=J.receiveShadow,re.setValue(V,"receiveShadow",J.receiveShadow);if((Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial)&&Z.envMap===null&&G.environment!==null)Je.envMapIntensity.value=G.environmentIntensity;if(Je.dfgLUT!==void 0)Je.dfgLUT.value=iy();if(fi){if(re.setValue(V,"toneMappingExposure",N.toneMappingExposure),Ct.needsLights)up(Je,Li);if(_t&&Z.fog===!0)ot.refreshFogUniforms(Je,_t);if(ot.refreshMaterialUniforms(Je,Z,Ut,Nt,P.state.transmissionRenderTarget[D.id]),Ct.needsLights&&Ct.numLightProbeGrids>0){let Ce=C,We=0;for(let Qn of P.state.lightProbeGridArray){if(Qn.texture===null)continue;Ce.textures[We]=Qn.texture,Ce.min[We]=Qn.boundingBox.min,Ce.max[We]=Qn.boundingBox.max,Ce.resolution[We]=Qn.resolution,We++}for(let Qn in Ce)Ce[Qn].length=We;Je.probesSH.value=Ce.textures,Je.probesMin.value=Ce.min,Je.probesMax.value=Ce.max,Je.probesResolution.value=Ce.resolution}Tr.upload(V,_h(Ct),Je,Wt)}if(Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0)Tr.upload(V,_h(Ct),Je,Wt),Z.uniformsNeedUpdate=!1;if(Z.isSpriteMaterial)re.setValue(V,"center",J.center);if(re.setValue(V,"modelViewMatrix",J.modelViewMatrix),re.setValue(V,"normalMatrix",J.normalMatrix),re.setValue(V,"modelMatrix",J.matrixWorld),Z.uniformsGroups!==void 0){let Ce=Z.uniformsGroups;for(let We=0,Qn=Ce.length;We<Qn;We++){let vh=Ce[We];xt.update(vh,tn),xt.bind(vh,tn)}}return tn}function up(D,G){D.ambientLightColor.needsUpdate=G,D.lightProbe.needsUpdate=G,D.sunLights.needsUpdate=G,D.sunLightShadows.needsUpdate=G,D.directionalLights.needsUpdate=G,D.directionalLightShadows.needsUpdate=G,D.pointLights.needsUpdate=G,D.pointLightShadows.needsUpdate=G,D.spotLights.needsUpdate=G,D.spotLightShadows.needsUpdate=G,D.rectAreaLights.needsUpdate=G,D.hemisphereLights.needsUpdate=G}function dp(D){return D.isMeshLambertMaterial||D.isMeshToonMaterial||D.isMeshPhongMaterial||D.isMeshStandardMaterial||D.isShadowMaterial||D.isShaderMaterial&&D.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return j},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(D,G,K){let Z=zt.get(D);if(Z.__autoAllocateDepthBuffer=D.resolveDepthBuffer===!1,Z.__autoAllocateDepthBuffer===!1)Z.__useRenderToTexture=!1;zt.get(D.texture).__webglTexture=G,zt.get(D.depthTexture).__webglTexture=Z.__autoAllocateDepthBuffer?void 0:K,Z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(D,G){let K=zt.get(D);K.__webglFramebuffer=G,K.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(D,G=0,K=0){X=D,q=G,j=K;let Z=null,J=!1,_t=!1;if(D){let mt=zt.get(D);if(mt.__useDefaultFramebuffer!==void 0){yt.bindFramebuffer(V.FRAMEBUFFER,mt.__webglFramebuffer),rt.copy(D.viewport),ct.copy(D.scissor),At=D.scissorTest,yt.viewport(rt),yt.scissor(ct),yt.setScissorTest(At),ht=-1;return}else if(mt.__webglFramebuffer===void 0)Wt.setupRenderTarget(D);else if(mt.__hasExternalTextures)Wt.rebindTextures(D,zt.get(D.texture).__webglTexture,zt.get(D.depthTexture).__webglTexture);else if(D.depthBuffer){let Xt=D.depthTexture;if(mt.__boundDepthTexture!==Xt){if(Xt!==null&&zt.has(Xt)&&(D.width!==Xt.image.width||D.height!==Xt.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Wt.setupDepthRenderbuffer(D)}}let bt=D.texture;if(bt.isData3DTexture||bt.isDataArrayTexture||bt.isCompressedArrayTexture)_t=!0;let It=zt.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget){if(Array.isArray(It[G]))Z=It[G][K];else Z=It[G];J=!0}else if(D.samples>0&&Wt.useMultisampledRTT(D)===!1)Z=zt.get(D).__webglMultisampledFramebuffer;else if(Array.isArray(It))Z=It[K];else Z=It;rt.copy(D.viewport),ct.copy(D.scissor),At=D.scissorTest}else rt.copy(Zt).multiplyScalar(Ut).floor(),ct.copy(Pt).multiplyScalar(Ut).floor(),At=Vt;if(K!==0)Z=z;if(yt.bindFramebuffer(V.FRAMEBUFFER,Z))yt.drawBuffers(D,Z);if(yt.viewport(rt),yt.scissor(ct),yt.setScissorTest(At),J){let mt=zt.get(D.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+G,mt.__webglTexture,K)}else if(_t){let mt=G;for(let bt=0;bt<D.textures.length;bt++){let It=zt.get(D.textures[bt]);V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0+bt,It.__webglTexture,K,mt)}}else if(D!==null&&K!==0){let mt=zt.get(D.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,mt.__webglTexture,K)}ht=-1};function yh(D){let G=zt.get(D);if(G.__readFormat!==D.format||G.__readType!==D.type)G.__readFormat=D.format,G.__readType=D.type,G.__formatReadable=Ge.textureFormatReadable(D.format),G.__typeReadable=Ge.textureTypeReadable(D.type);return G}if(this.readRenderTargetPixels=function(D,G,K,Z,J,_t,wt,mt=0){if(!(D&&D.isWebGLRenderTarget)){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let bt=zt.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&wt!==void 0){if(bt=bt[wt],Array.isArray(bt))bt=bt[0]}if(bt){yt.bindFramebuffer(V.FRAMEBUFFER,bt);try{let It=D.textures[mt],{format:Xt,type:ne}=It;if(D.textures.length>1)V.readBuffer(V.COLOR_ATTACHMENT0+mt);let Rt=yh(It);if(Rt.__formatReadable===!1){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Rt.__typeReadable===!1){Ht("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(G>=0&&G<=D.width-Z&&(K>=0&&K<=D.height-J))V.readPixels(G,K,Z,J,ut.convert(Xt),ut.convert(ne),_t)}finally{let It=X!==null?zt.get(X).__webglFramebuffer:null;yt.bindFramebuffer(V.FRAMEBUFFER,It)}}},this.readRenderTargetPixelsAsync=async function(D,G,K,Z,J,_t,wt,mt=0){if(!(D&&D.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let bt=zt.get(D).__webglFramebuffer;if(D.isWebGLCubeRenderTarget&&wt!==void 0){if(bt=bt[wt],Array.isArray(bt))bt=bt[0]}if(bt)if(G>=0&&G<=D.width-Z&&(K>=0&&K<=D.height-J)){yt.bindFramebuffer(V.FRAMEBUFFER,bt);let It=D.textures[mt],{format:Xt,type:ne}=It;if(D.textures.length>1)V.readBuffer(V.COLOR_ATTACHMENT0+mt);let Rt=yh(It);if(Rt.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Rt.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ie=V.createBuffer();V.bindBuffer(V.PIXEL_PACK_BUFFER,ie),V.bufferData(V.PIXEL_PACK_BUFFER,_t.byteLength,V.STREAM_READ),V.readPixels(G,K,Z,J,ut.convert(Xt),ut.convert(ne),0),V.bindBuffer(V.PIXEL_PACK_BUFFER,null);let Ne=X!==null?zt.get(X).__webglFramebuffer:null;yt.bindFramebuffer(V.FRAMEBUFFER,Ne);let we=V.fenceSync(V.SYNC_GPU_COMMANDS_COMPLETE,0);return V.flush(),await nd(V,we,4),V.bindBuffer(V.PIXEL_PACK_BUFFER,ie),V.getBufferSubData(V.PIXEL_PACK_BUFFER,0,_t),V.bindBuffer(V.PIXEL_PACK_BUFFER,null),V.deleteBuffer(ie),V.deleteSync(we),_t}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(D,G=null,K=0){let Z=Math.pow(2,-K),J=Math.floor(D.image.width*Z),_t=Math.floor(D.image.height*Z),wt=G!==null?G.x:0,mt=G!==null?G.y:0;Wt.setTexture2D(D,0),V.copyTexSubImage2D(V.TEXTURE_2D,K,0,0,wt,mt,J,_t),yt.unbindTexture()},this.copyTextureToTexture=function(D,G,K=null,Z=null,J=0,_t=0){let wt,mt,bt,It,Xt,ne,Rt,ie,Ne,we=D.isCompressedTexture?D.mipmaps[_t]:D.image;if(K!==null)wt=K.max.x-K.min.x,mt=K.max.y-K.min.y,bt=K.isBox3?K.max.z-K.min.z:1,It=K.min.x,Xt=K.min.y,ne=K.isBox3?K.min.z:0;else{let re=Math.pow(2,-J);if(wt=Math.floor(we.width*re),mt=Math.floor(we.height*re),D.isDataArrayTexture)bt=we.depth;else if(D.isData3DTexture)bt=Math.floor(we.depth*re);else bt=1;It=0,Xt=0,ne=0}if(Z!==null)Rt=Z.x,ie=Z.y,Ne=Z.z;else Rt=0,ie=0,Ne=0;let Me=ut.convert(G.format),Qe=ut.convert(G.type),Ct;if(G.isData3DTexture)Wt.setTexture3D(G,0),Ct=V.TEXTURE_3D;else if(G.isDataArrayTexture||G.isCompressedArrayTexture)Wt.setTexture2DArray(G,0),Ct=V.TEXTURE_2D_ARRAY;else Wt.setTexture2D(G,0),Ct=V.TEXTURE_2D;yt.activeTexture(V.TEXTURE0),yt.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,G.flipY),yt.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),yt.pixelStorei(V.UNPACK_ALIGNMENT,G.unpackAlignment);let dn=yt.getParameter(V.UNPACK_ROW_LENGTH),ce=yt.getParameter(V.UNPACK_IMAGE_HEIGHT),Di=yt.getParameter(V.UNPACK_SKIP_PIXELS),tn=yt.getParameter(V.UNPACK_SKIP_ROWS),Br=yt.getParameter(V.UNPACK_SKIP_IMAGES);yt.pixelStorei(V.UNPACK_ROW_LENGTH,we.width),yt.pixelStorei(V.UNPACK_IMAGE_HEIGHT,we.height),yt.pixelStorei(V.UNPACK_SKIP_PIXELS,It),yt.pixelStorei(V.UNPACK_SKIP_ROWS,Xt),yt.pixelStorei(V.UNPACK_SKIP_IMAGES,ne);let fi=D.isDataArrayTexture||D.isData3DTexture,Li=G.isDataArrayTexture||G.isData3DTexture;if(D.isDepthTexture){let re=zt.get(D),Je=zt.get(G),Nn=zt.get(re.__renderTarget),Ce=zt.get(Je.__renderTarget);yt.bindFramebuffer(V.READ_FRAMEBUFFER,Nn.__webglFramebuffer),yt.bindFramebuffer(V.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer);for(let We=0;We<bt;We++){if(fi)V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,zt.get(D).__webglTexture,J,ne+We),V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,zt.get(G).__webglTexture,_t,Ne+We);V.blitFramebuffer(It,Xt,It+wt,Xt+mt,Rt,ie,Rt+wt,ie+mt,V.DEPTH_BUFFER_BIT,V.NEAREST)}yt.bindFramebuffer(V.READ_FRAMEBUFFER,null),yt.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(J!==0||D.isRenderTargetTexture||zt.has(D)){let re=zt.get(D),Je=zt.get(G);yt.bindFramebuffer(V.READ_FRAMEBUFFER,W),yt.bindFramebuffer(V.DRAW_FRAMEBUFFER,O);for(let Nn=0;Nn<bt;Nn++){if(fi)V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,re.__webglTexture,J,ne+Nn);else V.framebufferTexture2D(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,re.__webglTexture,J);if(Li)V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Je.__webglTexture,_t,Ne+Nn);else V.framebufferTexture2D(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Je.__webglTexture,_t);if(J!==0)V.blitFramebuffer(It,Xt,It+wt,Xt+mt,Rt,ie,Rt+wt,ie+mt,V.COLOR_BUFFER_BIT,V.NEAREST);else if(Li)V.copyTexSubImage3D(Ct,_t,Rt,ie,Ne+Nn,It,Xt,wt,mt);else V.copyTexSubImage2D(Ct,_t,Rt,ie,It,Xt,wt,mt)}yt.bindFramebuffer(V.READ_FRAMEBUFFER,null),yt.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(Li)if(D.isDataTexture||D.isData3DTexture)V.texSubImage3D(Ct,_t,Rt,ie,Ne,wt,mt,bt,Me,Qe,we.data);else if(G.isCompressedArrayTexture)V.compressedTexSubImage3D(Ct,_t,Rt,ie,Ne,wt,mt,bt,Me,we.data);else V.texSubImage3D(Ct,_t,Rt,ie,Ne,wt,mt,bt,Me,Qe,we);else if(D.isDataTexture)V.texSubImage2D(V.TEXTURE_2D,_t,Rt,ie,wt,mt,Me,Qe,we.data);else if(D.isCompressedTexture)V.compressedTexSubImage2D(V.TEXTURE_2D,_t,Rt,ie,we.width,we.height,Me,we.data);else V.texSubImage2D(V.TEXTURE_2D,_t,Rt,ie,wt,mt,Me,Qe,we);if(yt.pixelStorei(V.UNPACK_ROW_LENGTH,dn),yt.pixelStorei(V.UNPACK_IMAGE_HEIGHT,ce),yt.pixelStorei(V.UNPACK_SKIP_PIXELS,Di),yt.pixelStorei(V.UNPACK_SKIP_ROWS,tn),yt.pixelStorei(V.UNPACK_SKIP_IMAGES,Br),_t===0&&G.generateMipmaps===!0&&G.mipmapsAutoUpdate===!0)V.generateMipmap(Ct);yt.unbindTexture()},this.initRenderTarget=function(D){if(zt.get(D).__webglFramebuffer===void 0)Wt.setupRenderTarget(D)},this.initTexture=function(D){if(D.isCubeTexture)Wt.setTextureCube(D,0);else if(D.isData3DTexture)Wt.setTexture3D(D,0);else if(D.isDataArrayTexture||D.isCompressedArrayTexture)Wt.setTexture2DArray(D,0);else Wt.setTexture2D(D,0);yt.unbindTexture()},this.resetState=function(){q=0,j=0,X=null,yt.reset(),dt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return $l}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(o){this._outputColorSpace=o;let l=this.getContext();l.drawingBufferColorSpace=te._getDrawingBufferColorSpace(o),l.unpackColorSpace=te._getUnpackColorSpace()}}var jd={type:"change"},Lc={type:"start"},tf={type:"end"},Jo=new Yn,Qd=new rn,ry=Math.cos(70*nc.DEG2RAD),He=new k,Sn=2*Math.PI,he={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Dc=0.000001;class Nc extends Go{constructor(o,l=null){super(o,l);if(this.state=he.NONE,this.target=new k,this.cursor=new k,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=0.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:vi.ROTATE,MIDDLE:vi.DOLLY,RIGHT:vi.PAN},this.touches={ONE:Si.ROTATE,TWO:Si.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new k,this._lastQuaternion=new Pn,this._lastTargetPosition=new k,this._quat=new Pn().setFromUnitVectors(o.up,new k(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ki,this._sphericalDelta=new Ki,this._scale=1,this._panOffset=new k,this._rotateStart=new Dt,this._rotateEnd=new Dt,this._rotateDelta=new Dt,this._panStart=new Dt,this._panEnd=new Dt,this._panDelta=new Dt,this._dollyStart=new Dt,this._dollyEnd=new Dt,this._dollyDelta=new Dt,this._dollyDirection=new k,this._mouse=new Dt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=ay.bind(this),this._onPointerDown=oy.bind(this),this._onPointerUp=ly.bind(this),this._onContextMenu=my.bind(this),this._onMouseWheel=uy.bind(this),this._onKeyDown=dy.bind(this),this._onTouchStart=fy.bind(this),this._onTouchMove=py.bind(this),this._onMouseDown=cy.bind(this),this._onMouseMove=hy.bind(this),this._interceptControlDown=gy.bind(this),this._interceptControlUp=_y.bind(this),this.domElement!==null)this.connect(this.domElement);this.update()}set cursorStyle(o){if(this._cursorStyle=o,o==="grab")this.domElement.style.cursor="grab";else this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(o){super.connect(o),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.ownerDocument.addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=he.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.ownerDocument.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(o){o.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=o}stopListenToKeyEvents(){if(this._domElementKeyEvents!==null)this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(jd),this.update(),this.state=he.NONE}pan(o,l){this._pan(o,l),this.update()}dollyIn(o){this._dollyIn(o),this.update()}dollyOut(o){this._dollyOut(o),this.update()}rotateLeft(o){this._rotateLeft(o),this.update()}rotateUp(o){this._rotateUp(o),this.update()}update(o=null){let l=this.object.position;if(He.copy(l).sub(this.target),He.applyQuaternion(this._quat),this._spherical.setFromVector3(He),this.autoRotate&&this.state===he.NONE)this._rotateLeft(this._getAutoRotationAngle(o));if(this.enableDamping)this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor;else this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi;let c=this.minAzimuthAngle,h=this.maxAzimuthAngle;if(isFinite(c)&&isFinite(h)){if(c<-Math.PI)c+=Sn;else if(c>Math.PI)c-=Sn;if(h<-Math.PI)h+=Sn;else if(h>Math.PI)h-=Sn;if(c<=h)this._spherical.theta=Math.max(c,Math.min(h,this._spherical.theta));else this._spherical.theta=this._spherical.theta>(c+h)/2?Math.max(c,this._spherical.theta):Math.min(h,this._spherical.theta)}if(this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0)this.target.addScaledVector(this._panOffset,this.dampingFactor);else this.target.add(this._panOffset);this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let u=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let d=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),u=d!=this._spherical.radius}if(He.setFromSpherical(this._spherical),He.applyQuaternion(this._quatInverse),l.copy(this.target).add(He),this.object.lookAt(this.target),this.enableDamping===!0)this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor);else this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0);if(this.zoomToCursor&&this._performCursorZoom){let d=null;if(this.object.isPerspectiveCamera){let f=He.length();d=this._clampDistance(f*this._scale);let p=f-d;this.object.position.addScaledVector(this._dollyDirection,p),this.object.updateMatrixWorld(),u=!!p}else if(this.object.isOrthographicCamera){let f=new k(this._mouse.x,this._mouse.y,0);f.unproject(this.object);let p=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),u=p!==this.object.zoom;let m=new k(this._mouse.x,this._mouse.y,0);m.unproject(this.object),this.object.position.sub(m).add(f),this.object.updateMatrixWorld(),d=He.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;if(d!==null)if(this.screenSpacePanning)this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(d).add(this.object.position);else if(Jo.origin.copy(this.object.position),Jo.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Jo.direction))<ry)this.object.lookAt(this.target);else Qd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Jo.intersectPlane(Qd,this.target)}else if(this.object.isOrthographicCamera){let d=this.object.zoom;if(this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),d!==this.object.zoom)this.object.updateProjectionMatrix(),u=!0}if(this._scale=1,this._performCursorZoom=!1,u||this._lastPosition.distanceToSquared(this.object.position)>Dc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Dc||this._lastTargetPosition.distanceToSquared(this.target)>Dc)return this.dispatchEvent(jd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0;return!1}_getAutoRotationAngle(o){if(o!==null)return Sn/60*this.autoRotateSpeed*o;else return Sn/60/60*this.autoRotateSpeed}_getZoomScale(o){let l=Math.abs(o*0.01);return Math.pow(0.95,this.zoomSpeed*l)}_rotateLeft(o){this._sphericalDelta.theta-=o}_rotateUp(o){this._sphericalDelta.phi-=o}_panLeft(o,l){He.setFromMatrixColumn(l,0),He.multiplyScalar(-o),this._panOffset.add(He)}_panUp(o,l){if(this.screenSpacePanning===!0)He.setFromMatrixColumn(l,1);else He.setFromMatrixColumn(l,0),He.crossVectors(this.object.up,He);He.multiplyScalar(o),this._panOffset.add(He)}_pan(o,l){let c=this.domElement;if(this.object.isPerspectiveCamera){let h=this.object.position;He.copy(h).sub(this.target);let u=He.length();u*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*o*u/c.clientHeight,this.object.matrix),this._panUp(2*l*u/c.clientHeight,this.object.matrix)}else if(this.object.isOrthographicCamera)this._panLeft(o*(this.object.right-this.object.left)/this.object.zoom/c.clientWidth,this.object.matrix),this._panUp(l*(this.object.top-this.object.bottom)/this.object.zoom/c.clientHeight,this.object.matrix);else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1}_dollyOut(o){if(this.object.isPerspectiveCamera||this.object.isOrthographicCamera)this._scale/=o;else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1}_dollyIn(o){if(this.object.isPerspectiveCamera||this.object.isOrthographicCamera)this._scale*=o;else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1}_updateZoomParameters(o,l){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let c=this.domElement.getBoundingClientRect(),h=o-c.left,u=l-c.top,{width:d,height:f}=c;this._mouse.x=h/d*2-1,this._mouse.y=-(u/f)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(o){return Math.max(this.minDistance,Math.min(this.maxDistance,o))}_handleMouseDownRotate(o){this._rotateStart.set(o.clientX,o.clientY)}_handleMouseDownDolly(o){this._updateZoomParameters(o.clientX,o.clientY),this._dollyStart.set(o.clientX,o.clientY)}_handleMouseDownPan(o){this._panStart.set(o.clientX,o.clientY)}_handleMouseMoveRotate(o){this._rotateEnd.set(o.clientX,o.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let l=this.domElement;this._rotateLeft(Sn*this._rotateDelta.x/l.clientHeight),this._rotateUp(Sn*this._rotateDelta.y/l.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(o){if(this._dollyEnd.set(o.clientX,o.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0)this._dollyOut(this._getZoomScale(this._dollyDelta.y));else if(this._dollyDelta.y<0)this._dollyIn(this._getZoomScale(this._dollyDelta.y));if(this._dollyStart.copy(this._dollyEnd),this.zoomToCursor)this._performCursorZoom=!0,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize();this.update()}_handleMouseMovePan(o){this._panEnd.set(o.clientX,o.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(o){if(this._updateZoomParameters(o.clientX,o.clientY),o.deltaY<0)this._dollyIn(this._getZoomScale(o.deltaY));else if(o.deltaY>0)this._dollyOut(this._getZoomScale(o.deltaY));this.update()}_handleKeyDown(o){let l=!1;switch(o.code){case this.keys.UP:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate)this._rotateUp(Sn*this.keyRotateSpeed/this.domElement.clientHeight)}else if(this.enablePan)this._pan(0,this.keyPanSpeed);l=!0;break;case this.keys.BOTTOM:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate)this._rotateUp(-Sn*this.keyRotateSpeed/this.domElement.clientHeight)}else if(this.enablePan)this._pan(0,-this.keyPanSpeed);l=!0;break;case this.keys.LEFT:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate)this._rotateLeft(Sn*this.keyRotateSpeed/this.domElement.clientHeight)}else if(this.enablePan)this._pan(this.keyPanSpeed,0);l=!0;break;case this.keys.RIGHT:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate)this._rotateLeft(-Sn*this.keyRotateSpeed/this.domElement.clientHeight)}else if(this.enablePan)this._pan(-this.keyPanSpeed,0);l=!0;break}if(l)o.preventDefault(),this.update()}_handleTouchStartRotate(o){if(this._pointers.length===1)this._rotateStart.set(o.pageX,o.pageY);else{let l=this._getSecondPointerPosition(o),c=0.5*(o.pageX+l.x),h=0.5*(o.pageY+l.y);this._rotateStart.set(c,h)}}_handleTouchStartPan(o){if(this._pointers.length===1)this._panStart.set(o.pageX,o.pageY);else{let l=this._getSecondPointerPosition(o),c=0.5*(o.pageX+l.x),h=0.5*(o.pageY+l.y);this._panStart.set(c,h)}}_handleTouchStartDolly(o){let l=this._getSecondPointerPosition(o),c=o.pageX-l.x,h=o.pageY-l.y,u=Math.sqrt(c*c+h*h);this._dollyStart.set(0,u)}_handleTouchStartDollyPan(o){if(this.enableZoom)this._handleTouchStartDolly(o);if(this.enablePan)this._handleTouchStartPan(o)}_handleTouchStartDollyRotate(o){if(this.enableZoom)this._handleTouchStartDolly(o);if(this.enableRotate)this._handleTouchStartRotate(o)}_handleTouchMoveRotate(o){if(this._pointers.length==1)this._rotateEnd.set(o.pageX,o.pageY);else{let c=this._getSecondPointerPosition(o),h=0.5*(o.pageX+c.x),u=0.5*(o.pageY+c.y);this._rotateEnd.set(h,u)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let l=this.domElement;this._rotateLeft(Sn*this._rotateDelta.x/l.clientHeight),this._rotateUp(Sn*this._rotateDelta.y/l.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(o){if(this._pointers.length===1)this._panEnd.set(o.pageX,o.pageY);else{let l=this._getSecondPointerPosition(o),c=0.5*(o.pageX+l.x),h=0.5*(o.pageY+l.y);this._panEnd.set(c,h)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(o){let l=this._getSecondPointerPosition(o),c=o.pageX-l.x,h=o.pageY-l.y,u=Math.sqrt(c*c+h*h);this._dollyEnd.set(0,u),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let d=(o.pageX+l.x)*0.5,f=(o.pageY+l.y)*0.5;this._updateZoomParameters(d,f)}_handleTouchMoveDollyPan(o){if(this.enableZoom)this._handleTouchMoveDolly(o);if(this.enablePan)this._handleTouchMovePan(o)}_handleTouchMoveDollyRotate(o){if(this.enableZoom)this._handleTouchMoveDolly(o);if(this.enableRotate)this._handleTouchMoveRotate(o)}_addPointer(o){this._pointers.push(o.pointerId)}_removePointer(o){delete this._pointerPositions[o.pointerId];for(let l=0;l<this._pointers.length;l++)if(this._pointers[l]==o.pointerId){this._pointers.splice(l,1);return}}_isTrackingPointer(o){for(let l=0;l<this._pointers.length;l++)if(this._pointers[l]==o.pointerId)return!0;return!1}_trackPointer(o){let l=this._pointerPositions[o.pointerId];if(l===void 0)l=new Dt,this._pointerPositions[o.pointerId]=l;l.set(o.pageX,o.pageY)}_getSecondPointerPosition(o){let l=o.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[l]}_customWheelEvent(o){let l=o.deltaMode,c={clientX:o.clientX,clientY:o.clientY,deltaY:o.deltaY};switch(l){case 1:c.deltaY*=16;break;case 2:c.deltaY*=100;break}if(o.ctrlKey&&!this._controlActive)c.deltaY*=10;return c}}function oy(o){if(this.enabled===!1)return;if(this._pointers.length===0)this.domElement.setPointerCapture(o.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp);if(this._isTrackingPointer(o))return;if(this._addPointer(o),o.pointerType==="touch")this._onTouchStart(o);else this._onMouseDown(o);if(this._cursorStyle==="grab")this.domElement.style.cursor="grabbing"}function ay(o){if(this.enabled===!1)return;if(o.pointerType==="touch")this._onTouchMove(o);else this._onMouseMove(o)}function ly(o){switch(this._removePointer(o),this._pointers.length){case 0:if(this.domElement.releasePointerCapture(o.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(tf),this.state=he.NONE,this._cursorStyle==="grab")this.domElement.style.cursor="grab";break;case 1:let l=this._pointers[0],c=this._pointerPositions[l];this._onTouchStart({pointerId:l,pageX:c.x,pageY:c.y});break}}function cy(o){let l;switch(o.button){case 0:l=this.mouseButtons.LEFT;break;case 1:l=this.mouseButtons.MIDDLE;break;case 2:l=this.mouseButtons.RIGHT;break;default:l=-1}switch(l){case vi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(o),this.state=he.DOLLY;break;case vi.ROTATE:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=he.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=he.ROTATE}break;case vi.PAN:if(o.ctrlKey||o.metaKey||o.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(o),this.state=he.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(o),this.state=he.PAN}break;default:this.state=he.NONE}if(this.state!==he.NONE)this.dispatchEvent(Lc)}function hy(o){switch(this.state){case he.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(o);break;case he.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(o);break;case he.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(o);break}}function uy(o){if(this.enabled===!1||this.enableZoom===!1||this.state!==he.NONE)return;o.preventDefault(),this.dispatchEvent(Lc),this._handleMouseWheel(this._customWheelEvent(o)),this.dispatchEvent(tf)}function dy(o){if(this.enabled===!1)return;this._handleKeyDown(o)}function fy(o){switch(this._trackPointer(o),this._pointers.length){case 1:switch(this.touches.ONE){case Si.ROTATE:if(this.enableRotate===!1){this.state=he.NONE;break}this._handleTouchStartRotate(o),this.state=he.TOUCH_ROTATE;break;case Si.PAN:if(this.enablePan===!1){this.state=he.NONE;break}this._handleTouchStartPan(o),this.state=he.TOUCH_PAN;break;default:this.state=he.NONE}break;case 2:switch(this.touches.TWO){case Si.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(o),this.state=he.TOUCH_DOLLY_PAN;break;case Si.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(o),this.state=he.TOUCH_DOLLY_ROTATE;break;default:this.state=he.NONE}break;default:this.state=he.NONE}if(this.state!==he.NONE)this.dispatchEvent(Lc)}function py(o){switch(this._trackPointer(o),this.state){case he.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(o),this.update();break;case he.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(o),this.update();break;case he.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(o),this.update();break;case he.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(o),this.update();break;default:this.state=he.NONE}}function my(o){if(this.enabled===!1)return;o.preventDefault()}function gy(o){if(o.key==="Control")this._controlActive=!0,this.domElement.ownerDocument.addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0})}function _y(o){if(o.key==="Control")this._controlActive=!1,this.domElement.ownerDocument.removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0})}class Uc extends Fo{constructor(o){super(o)}parse(o,l){let c={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},h=542327876,u=131072,d=512,f=1024,p=2048,m=4096,g=8192,x=16384,y=32768,_=95,v=96;function T(Pt){return Pt.charCodeAt(0)+(Pt.charCodeAt(1)<<8)+(Pt.charCodeAt(2)<<16)+(Pt.charCodeAt(3)<<24)}function w(Pt){return String.fromCharCode(Pt&255,Pt>>8&255,Pt>>16&255,Pt>>24&255)}function S(Pt,Vt,kt,ae){let le=kt*ae*4,me=new Uint8Array(Pt,Vt,le),Se=new Uint8Array(le),Qt=0,oe=0;for(let De=0;De<ae;De++)for(let Le=0;Le<kt;Le++){let hn=me[oe];oe++;let V=me[oe];oe++;let un=me[oe];oe++;let fe=me[oe];oe++,Se[Qt]=un,Qt++,Se[Qt]=V,Qt++,Se[Qt]=hn,Qt++,Se[Qt]=fe,Qt++}return Se}function M(Pt,Vt,kt,ae){let le=kt*ae*3,me=new Uint8Array(Pt,Vt,le),Se=new Uint8Array(kt*ae*4),Qt=0,oe=0;for(let De=0;De<ae;De++)for(let Le=0;Le<kt;Le++){let hn=me[oe];oe++;let V=me[oe];oe++;let un=me[oe];oe++,Se[Qt]=un,Qt++,Se[Qt]=V,Qt++,Se[Qt]=hn,Qt++,Se[Qt]=255,Qt++}return Se}let E=T("DXT1"),C=T("DXT3"),A=T("DXT5"),P=T("ETC1"),L=T("DX10"),b=31,R=5,N=0,B=1,U=2,z=3,W=4,O=7,q=21,j=22,X=23,ht=24,Q=25,rt=26,ct=28,At=0,et=new Int32Array(o,0,b);if(et[N]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),c;let at,Tt=et[q],Nt=!1,Ut=!1,Et=et[B]+4;switch(Tt){case E:at=8,c.format=Es;break;case C:at=16,c.format=As;break;case A:at=16,c.format=ws;break;case P:at=8,c.format=ar;break;case L:Et+=R*4;let Vt=new Int32Array(o,(b+1)*4,R)[At];switch(Vt){case 96:{at=16,c.format=lr;break}case 95:{at=16,c.format=cr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",Vt),c}break;default:if(et[j]===32&&et[X]&16711680&&et[ht]&65280&&et[Q]&255&&et[rt]&4278190080)Nt=!0,at=64,c.format=Cn;else if(et[j]===24&&et[X]&16711680&&et[ht]&65280&&et[Q]&255)Ut=!0,at=64,c.format=Cn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",w(Tt)),c}if(c.mipmapCount=1,et[U]&131072&&l!==!1)c.mipmapCount=Math.max(1,et[O]);let jt=et[ct];if(c.isCubemap=jt&512?!0:!1,c.isCubemap&&(!(jt&1024)||!(jt&2048)||!(jt&4096)||!(jt&8192)||!(jt&16384)||!(jt&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),c;c.width=et[W],c.height=et[z];let Zt=c.isCubemap?6:1;for(let Pt=0;Pt<Zt;Pt++){let{width:Vt,height:kt}=c;for(let ae=0;ae<c.mipmapCount;ae++){let le,me;if(Nt)le=S(o,Et,Vt,kt),me=le.length;else if(Ut)le=M(o,Et,Vt,kt),me=Vt*kt*3;else me=Math.ceil(Vt/4)*Math.ceil(kt/4)*at,le=new Uint8Array(o,Et,me);let Se={data:le,width:Vt,height:kt};c.mipmaps.push(Se),Et+=me,Vt=Math.max(Vt>>1,1),kt=Math.max(kt>>1,1)}}return c}}var ef=0,nf=1,sf=2;var Fc=2;var Ko=1.25,Oc=1,Ze=32,ye=8,$o=65535;var Ps=Math.pow(2,-24),Ar=Symbol("SKIP_GENERATION"),jo={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Ar]:!1};function Te(o,l,c){return c.min.x=l[o],c.min.y=l[o+1],c.min.z=l[o+2],c.max.x=l[o+3],c.max.y=l[o+4],c.max.z=l[o+5],c}function wr(o){let l=-1,c=-1/0;for(let h=0;h<3;h++){let u=o[h+3]-o[h];if(u>c)c=u,l=h}return l}function Bc(o,l,c){for(let h=0;h<3;h++){let u=l[o+2*h],d=l[o+2*h+1],f=u-d,p=u+d;if(f<c[h])c[h]=f;if(p>c[h+3])c[h+3]=p}}function Qo(o){let l=o[3]-o[0],c=o[4]-o[1],h=o[5]-o[2];return 2*(l*c+c*h+h*l)}function se(o,l){return l[o+15]===$o}function pe(o,l){return l[o+6]}function ve(o,l){return l[o+14]}function ue(o){return o+ye}function de(o,l){let c=l[o+6];return o+c*ye}function Is(o,l){return l[o+7]}function Re(o){return o}function ta(o,l,c,h,u){let d=1/0,f=1/0,p=1/0,m=-1/0,g=-1/0,x=-1/0,y=1/0,_=1/0,v=1/0,T=-1/0,w=-1/0,S=-1/0,M=o.offset||0;for(let E=(l-M)*6,C=(l+c-M)*6;E<C;E+=6){let A=o[E+0],P=o[E+1],L=A-P,b=A+P;if(L<d)d=L;if(b>m)m=b;if(A<y)y=A;if(A>T)T=A;let R=o[E+2],N=o[E+3],B=R-N,U=R+N;if(B<f)f=B;if(U>g)g=U;if(R<_)_=R;if(R>w)w=R;let z=o[E+4],W=o[E+5],O=z-W,q=z+W;if(O<p)p=O;if(q>x)x=q;if(z<v)v=z;if(z>S)S=z}h[0]=d,h[1]=f,h[2]=p,h[3]=m,h[4]=g,h[5]=x,u[0]=y,u[1]=_,u[2]=v,u[3]=T,u[4]=w,u[5]=S}var $n=8,kc=8,zc=new Int32Array($n),Kn=new Float32Array($n*6),Ds=new Float32Array($n*6),kn=new Float32Array(6),ea=new Float32Array(6),wi=new Int32Array(kc),rf=new Float32Array(kc*6);function xy(o,l,c,h){for(let u=0;u<3;u++){let d=l[o+2*u],f=l[o+2*u+1],p=d-f,m=d+f;if(p<c[h+u])c[h+u]=p;if(m>c[h+u+3])c[h+u+3]=m}}function of(o,l){let c=o[l+3]-o[l],h=o[l+4]-o[l+1],u=o[l+5]-o[l+2];return 2*(c*h+h*u+u*c)}function af(o,l,c,h,u,d){let f=-1,p=0;if(d===ef){if(f=wr(l),f!==-1)p=(l[f]+l[f+3])/2}else if(d===nf){if(f=wr(o),f!==-1)p=yy(c,h,u,f)}else if(d===sf){let m=Qo(o),g=Ko*u,x=c.offset||0,y=(h-x)*6,_=(h+u-x)*6;for(let v=0;v<3;v++){let T=l[v],M=(l[v+3]-T)/$n;if(u<kc){for(let E=0;E<u;E++){let C=y+E*6,A=c[C+2*v],P=E;while(P>0&&c[wi[P-1]+2*v]>A)wi[P]=wi[P-1],P--;wi[P]=C}for(let E=0;E<3;E++)kn[E]=1/0,kn[E+3]=-1/0,ea[E]=1/0,ea[E+3]=-1/0;for(let E=u-1;E>=0;E--)Bc(wi[E],c,ea),rf.set(ea,E*6);for(let E=0;E<u-1;E++){Bc(wi[E],c,kn);let C=c[wi[E+1]+2*v];if(c[wi[E]+2*v]===C)continue;let A=E+1,P=u-A,L=Qo(kn)/m,b=of(rf,A*6)/m,R=Oc+Ko*(L*A+b*P);if(R<g)f=v,g=R,p=C}}else{for(let A=0;A<$n;A++){zc[A]=0;for(let P=0;P<3;P++)Kn[A*6+P]=1/0,Kn[A*6+P+3]=-1/0}for(let A=y;A<_;A+=6){let b=~~((c[A+2*v]-T)/M);if(b>=$n)b=$n-1;zc[b]++,xy(A,c,Kn,b*6)}let E=($n-1)*6;for(let A=0;A<6;A++)Ds[E+A]=Kn[E+A];for(let A=$n-2;A>=0;A--){let P=A*6,L=P+6;for(let b=0;b<3;b++)Ds[P+b]=Math.min(Kn[P+b],Ds[L+b]),Ds[P+b+3]=Math.max(Kn[P+b+3],Ds[L+b+3])}let C=0;for(let A=0;A<$n-1;A++){let P=A*6,L=zc[A];if(L!==0)for(let U=0;U<3;U++)if(C===0)kn[U]=Kn[P+U],kn[U+3]=Kn[P+U+3];else kn[U]=Math.min(kn[U],Kn[P+U]),kn[U+3]=Math.max(kn[U+3],Kn[P+U+3]);C+=L;let b=0,R=0;if(C!==0)b=Qo(kn)/m;let N=u-C;if(N!==0)R=of(Ds,P+6)/m;let B=Oc+Ko*(b*C+R*N);if(B<g)f=v,g=B,p=T+M+A*M}}}}else console.warn(`BVH: Invalid build strategy value ${d} used.`);return{axis:f,pos:p}}function yy(o,l,c,h){let u=0,d=o.offset;for(let f=l,p=l+c;f<p;f++)u+=o[(f-d)*6+h*2];return u/c}function lf(o,l,c,h,u,d){let f=h,p=h+u-1,m=d.pos,g=d.axis*2,x=c.offset||0;while(!0){while(f<=p&&c[(f-x)*6+g]<m)f++;while(f<=p&&c[(p-x)*6+g]>=m)p--;if(f<p){for(let y=0;y<l;y++){let _=o[f*l+y];o[f*l+y]=o[p*l+y],o[p*l+y]=_}for(let y=0;y<6;y++){let _=f-x,v=p-x,T=c[_*6+y];c[_*6+y]=c[v*6+y],c[v*6+y]=T}f++,p--}else return f}}var vy=Math.pow(2,32),Ls=new Float32Array(6),na=new Float32Array(6);function Sy(o,l,c,h,u,d){let{maxDepth:f,verbose:p,targetLeafSize:m,_strictLeafSize:g=1/0,strategy:x,onProgress:y,useSharedArrayBuffer:_=!1}=u,{primitiveBuffer:v,primitiveBufferStride:T}=o,S=new(_?SharedArrayBuffer:ArrayBuffer)(Ze*Math.max(1,2*Math.ceil(h)-1)),M=new Float32Array(S),E=new Uint32Array(S),C=new Uint16Array(S),A=0,P=!1;return ta(l,c,h,Ls,na),R(c,h,0),S.slice(0,A*Ze);function L(N){if(y)y((N-d.offset)/d.count)}function b(N,B,U){let z=N*2;E[N+6]=B,C[z+14]=U,C[z+15]=$o,L(B+U)}function R(N,B,U){let z=A++,W=z*ye;if(M.set(Ls,W),!P&&U>=f){if(P=!0,p)console.warn(`BVH: Max depth of ${f} reached when generating BVH. Consider increasing maxDepth.`)}let O=B>g;if(B<=m&&!O||U>=f){b(W,N,B);return}let q=af(Ls,na,l,N,B,x),j=q.axis===-1?-1:lf(v,T,l,N,B,q);if(q.axis===-1||j===N||j===N+B){if(!O){b(W,N,B);return}q.axis=Math.max(0,wr(Ls)),j=N+Math.max(1,Math.floor(B/2))}E[W+7]=q.axis;let X=j-N;ta(l,N,X,Ls,na),R(N,X,U+1);let ht=A-z;if(ht>vy)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");E[W+6]=ht;let Q=B-X;ta(l,j,Q,Ls,na),R(j,Q,U+1)}}function cf(o,l){let c=o.getRootRanges(l.range),h=c[0],u=c[c.length-1],d={offset:h.offset,count:u.offset+u.count-h.offset},f=new Float32Array(6*d.count);f.offset=d.offset,o.computePrimitiveBounds(d.offset,d.count,f),o._roots=c.map((p)=>Sy(o,f,p.offset,p.count,l,d))}class $i{constructor(o){this._getNewPrimitive=o,this._primitives=[]}getPrimitive(){let o=this._primitives;if(o.length===0)return this._getNewPrimitive();else return o.pop()}releasePrimitive(o){this._primitives.push(o)}}class hf{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let o=[],l=null;this.setBuffer=(c)=>{if(l)o.push(l);l=c,this.float32Array=new Float32Array(c),this.uint16Array=new Uint16Array(c),this.uint32Array=new Uint32Array(c)},this.clearBuffer=()=>{if(l=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,o.length!==0)this.setBuffer(o.pop())}}}var ee=new hf;var Ri,Us,Ns=[],ia=new $i(()=>new _e);function uf(o,l,c,h,u,d){Ri=ia.getPrimitive(),Us=ia.getPrimitive(),Ns.push(Ri,Us),ee.setBuffer(o._roots[l]);let f=Hc(0,o.geometry,c,h,u,d);ee.clearBuffer(),ia.releasePrimitive(Ri),ia.releasePrimitive(Us),Ns.pop(),Ns.pop();let p=Ns.length;if(p>0)Us=Ns[p-1],Ri=Ns[p-2];return f}function Hc(o,l,c,h,u=null,d=0,f=0){let{float32Array:p,uint16Array:m,uint32Array:g}=ee,x=o*2;if(se(x,m)){let _=pe(o,g),v=ve(x,m);return Te(Re(o),p,Ri),h(_,v,!1,f,d+o/ye,Ri)}else{let B=function(z){let{uint16Array:W,uint32Array:O}=ee,q=z*2;while(!se(q,W))z=ue(z),q=z*2;return pe(z,O)},U=function(z){let{uint16Array:W,uint32Array:O}=ee,q=z*2;while(!se(q,W))z=de(z,O),q=z*2;return pe(z,O)+ve(q,W)},_=ue(o),v=de(o,g),T=_,w=v,S,M,E,C;if(u){if(E=Ri,C=Us,Te(Re(T),p,E),Te(Re(w),p,C),S=u(E),M=u(C),M<S){T=v,w=_;let z=S;S=M,M=z,E=C}}if(!E)E=Ri,Te(Re(T),p,E);let A=se(T*2,m),P=c(E,A,S,f+1,d+T/ye),L;if(P===Fc){let z=B(T),O=U(T)-z;L=h(z,O,!0,f+1,d+T/ye,E)}else L=P&&Hc(T,l,c,h,u,d,f+1);if(L)return!0;C=Us,Te(Re(w),p,C);let b=se(w*2,m),R=c(C,b,M,f+1,d+w/ye),N;if(R===Fc){let z=B(w),O=U(w)-z;N=h(z,O,!0,f+1,d+w/ye,C)}else N=R&&Hc(w,l,c,h,u,d,f+1);if(N)return!0;return!1}}var Rr=new ee.constructor,sa=new ee.constructor,Ci=new $i(()=>new _e),Fs=new _e,Os=new _e,Gc=new _e,Vc=new _e,Wc=!1;function df(o,l,c,h){if(Wc)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");Wc=!0;let u=o._roots,d=l._roots,f,p=0,m=0,g=new Yt().copy(c).invert();for(let x=0,y=u.length;x<y;x++){Rr.setBuffer(u[x]),m=0;let _=Ci.getPrimitive();Te(Re(0),Rr.float32Array,_),_.applyMatrix4(g);for(let v=0,T=d.length;v<T;v++)if(sa.setBuffer(d[v]),f=Hn(0,0,c,g,h,p,m,0,0,_),sa.clearBuffer(),m+=d[v].byteLength/Ze,f)break;if(Ci.releasePrimitive(_),Rr.clearBuffer(),p+=u[x].byteLength/Ze,f)break}return Wc=!1,f}function Hn(o,l,c,h,u,d=0,f=0,p=0,m=0,g=null,x=!1){let y,_;if(x)y=sa,_=Rr;else y=Rr,_=sa;let v=y.float32Array,T=y.uint32Array,w=y.uint16Array,S=_.float32Array,M=_.uint32Array,E=_.uint16Array,C=o*2,A=l*2,P=se(C,w),L=se(A,E),b=!1;if(L&&P)if(x)b=u(pe(l,M),ve(l*2,E),pe(o,T),ve(o*2,w),m,f+l/ye,p,d+o/ye);else b=u(pe(o,T),ve(o*2,w),pe(l,M),ve(l*2,E),p,d+o/ye,m,f+l/ye);else if(L){let R=Ci.getPrimitive();Te(Re(l),S,R),R.applyMatrix4(c);let N=ue(o),B=de(o,T);Te(Re(N),v,Fs),Te(Re(B),v,Os);let U=R.intersectsBox(Fs),z=R.intersectsBox(Os);b=U&&Hn(l,N,h,c,u,f,d,m,p+1,R,!x)||z&&Hn(l,B,h,c,u,f,d,m,p+1,R,!x),Ci.releasePrimitive(R)}else{let R=ue(l),N=de(l,M);Te(Re(R),S,Gc),Te(Re(N),S,Vc);let B=g.intersectsBox(Gc),U=g.intersectsBox(Vc);if(B&&U)b=Hn(o,R,c,h,u,d,f,p,m+1,g,x)||Hn(o,N,c,h,u,d,f,p,m+1,g,x);else if(B)if(P)b=Hn(o,R,c,h,u,d,f,p,m+1,g,x);else{let z=Ci.getPrimitive();z.copy(Gc).applyMatrix4(c);let W=ue(o),O=de(o,T);Te(Re(W),v,Fs),Te(Re(O),v,Os);let q=z.intersectsBox(Fs),j=z.intersectsBox(Os);b=q&&Hn(R,W,h,c,u,f,d,m,p+1,z,!x)||j&&Hn(R,O,h,c,u,f,d,m,p+1,z,!x),Ci.releasePrimitive(z)}else if(U)if(P)b=Hn(o,N,c,h,u,d,f,p,m+1,g,x);else{let z=Ci.getPrimitive();z.copy(Vc).applyMatrix4(c);let W=ue(o),O=de(o,T);Te(Re(W),v,Fs),Te(Re(O),v,Os);let q=z.intersectsBox(Fs),j=z.intersectsBox(Os);b=q&&Hn(N,W,h,c,u,f,d,m,p+1,z,!x)||j&&Hn(N,O,h,c,u,f,d,m,p+1,z,!x),Ci.releasePrimitive(z)}}return b}var ra=new class{constructor(){let o=null,l=null,c=null,h=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(d,f)=>{if(h)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=f,this.buffer=o=d._roots[f],this.uint16Array=c=new Uint16Array(o),this.uint32Array=l=new Uint32Array(o)},this.reset=()=>{this.root=null,this.buffer=o=null,this.uint16Array=c=null,this.uint32Array=l=null},this.getRangeStart=(d)=>{let f=d*2;while(!se(f,c))d=ue(d),f=d*2;return pe(d,l)},this.getRangeEnd=(d)=>{let f=d*2;while(!se(f,c))d=de(d,l),f=d*2;return pe(d,l)+ve(f,c)};let u=(d,f,p)=>{let m=f*2,g=se(m,c);if(!d(p,g,f)&&!g){let y=ue(f),_=de(f,l);u(d,y,p+1),u(d,_,p+1)}};this.traverseBuffer=(d)=>{if(h)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");h=!0;try{u(d,0,0)}finally{h=!1}},this.traverse=(d)=>{this.traverseBuffer((f,p,m)=>{if(p){let g=m*2,x=l[m+6],y=c[g+14];return d(f,p,new Float32Array(o,m*4,6),x,y)}else{let g=Is(m,l);return d(f,p,new Float32Array(o,m*4,6),g)}})}}};var ff=new _e,Bs=new Float32Array(6);class Xc{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(o){if(o={...jo,...o},"maxLeafSize"in o)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),o={...o,targetLeafSize:o.maxLeafSize};cf(this,o)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(o,l,c,h){let u=1/0,d=1/0,f=1/0,p=-1/0,m=-1/0,g=-1/0;for(let x=o,y=o+l;x<y;x++){this.writePrimitiveBounds(x,Bs,0);let[_,v,T,w,S,M]=Bs;if(_<u)u=_;if(w>p)p=w;if(v<d)d=v;if(S>m)m=S;if(T<f)f=T;if(M>g)g=M}return c[h+0]=u,c[h+1]=d,c[h+2]=f,c[h+3]=p,c[h+4]=m,c[h+5]=g,c}computePrimitiveBounds(o,l,c){let h=c.offset||0;for(let u=o,d=o+l;u<d;u++){this.writePrimitiveBounds(u,Bs,0);let[f,p,m,g,x,y]=Bs,_=(f+g)/2,v=(p+x)/2,T=(m+y)/2,w=(g-f)/2,S=(x-p)/2,M=(y-m)/2,E=(u-h)*6;c[E+0]=_,c[E+1]=w+(Math.abs(_)+w)*Ps,c[E+2]=v,c[E+3]=S+(Math.abs(v)+S)*Ps,c[E+4]=T,c[E+5]=M+(Math.abs(T)+M)*Ps}return c}shiftPrimitiveOffsets(o){let l=this._indirectBuffer;if(l)for(let c=0,h=l.length;c<h;c++)l[c]+=o;else{let c=this._roots;for(let h=0;h<c.length;h++){let u=c[h],d=new Uint32Array(u),f=new Uint16Array(u),p=u.byteLength/Ze;for(let m=0;m<p;m++){let g=ye*m,x=2*g;if(se(x,f))d[g+6]+=o}}}}traverse(o,l=0){ra.setBVH(this,l),ra.traverse(o),ra.reset()}refit(){let o=this._roots;for(let l=0,c=o.length;l<c;l++){let h=o[l],u=new Uint32Array(h),d=new Uint16Array(h),f=new Float32Array(h),p=h.byteLength/Ze;for(let m=p-1;m>=0;m--){let g=m*ye,x=g*2;if(se(x,d)){let _=pe(g,u),v=ve(x,d);this.writePrimitiveRangeBounds(_,v,Bs,0),f.set(Bs,g)}else{let _=ue(g),v=de(g,u);for(let T=0;T<3;T++){let w=f[_+T],S=f[_+T+3],M=f[v+T],E=f[v+T+3];f[g+T]=w<M?w:M,f[g+T+3]=S>E?S:E}}}}}getBoundingBox(o){return o.makeEmpty(),this._roots.forEach((c)=>{Te(0,new Float32Array(c),ff),o.union(ff)}),o}shapecast(o){let{boundsTraverseOrder:l,intersectsBounds:c,intersectsRange:h,intersectsPrimitive:u,scratchPrimitive:d,iterate:f}=o;if(h&&u){let x=h;h=(y,_,v,T,w)=>{if(!x(y,_,v,T,w))return f(y,_,this,u,v,T,d);return!0}}else if(!h)if(u)h=(x,y,_,v)=>f(x,y,this,u,_,v,d);else h=(x,y,_)=>_;let p=!1,m=0,g=this._roots;for(let x=0,y=g.length;x<y;x++){let _=g[x];if(p=uf(this,x,c,h,l,m),p)break;m+=_.byteLength/Ze}return p}bvhcast(o,l,c){let{intersectsRanges:h}=c;return df(this,o,l,h)}}function oa(){return typeof SharedArrayBuffer<"u"}function qc(o){return o.index?o.index.count:o.attributes.position.count}function Pi(o){return qc(o)/3}function My(o,l=ArrayBuffer){if(o>65535)return new Uint32Array(new l(4*o));else return new Uint16Array(new l(2*o))}function pf(o,l){if(!o.index){let c=o.attributes.position.count,h=l.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,u=My(c,h);o.setIndex(new Ye(u,1));for(let d=0;d<c;d++)u[d]=d}}function by(o,l,c){let h=qc(o)/c,u=l?l:o.drawRange,d=u.start/c,f=(u.start+u.count)/c,p=Math.max(0,d),m=Math.min(h,f)-p;return{offset:Math.floor(p),count:Math.floor(m)}}function Ty(o,l){return o.groups.map((c)=>({offset:c.start/l,count:c.count/l}))}function Yc(o,l,c){let h=by(o,l,c),u=Ty(o,c);if(!u.length)return[h];let d=[],f=h.offset,p=h.offset+h.count,m=qc(o)/c,g=[];for(let _ of u){let{offset:v,count:T}=_,w=v,S=isFinite(T)?T:m-v,M=v+S;if(w<p&&M>f)g.push({pos:Math.max(f,w),isStart:!0}),g.push({pos:Math.min(p,M),isStart:!1})}g.sort((_,v)=>{if(_.pos!==v.pos)return _.pos-v.pos;else return _.type==="end"?-1:1});let x=0,y=null;for(let _ of g){let v=_.pos;if(x!==0&&v!==y)d.push({offset:y,count:v-y});x+=_.isStart?1:-1,y=v}return d}function Ey(o,l){let c=o[o.length-1],h=c.offset+c.count>65536,u=o.reduce((g,x)=>g+x.count,0),d=h?4:2,f=l?new SharedArrayBuffer(u*d):new ArrayBuffer(u*d),p=h?new Uint32Array(f):new Uint16Array(f),m=0;for(let g=0;g<o.length;g++){let{offset:x,count:y}=o[g];for(let _=0;_<y;_++)p[m+_]=x+_;m+=y}return p}class Zc extends Xc{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(o){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(o){}constructor(o,l={}){if(!o.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(o.index&&o.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(l.useSharedArrayBuffer&&!oa())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=o,this.resolvePrimitiveIndex=l.indirect?(c)=>this._indirectBuffer[c]:(c)=>c,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,l={...jo,...l},!l[Ar])this.init(l)}init(o){let{geometry:l,primitiveStride:c}=this;if(o.indirect){let h=Yc(l,o.range,c),u=Ey(h,o.useSharedArrayBuffer);this._indirectBuffer=u}else pf(l,o);if(super.init(o),!l.boundingBox&&o.setBoundingBox)l.boundingBox=this.getBoundingBox(new _e)}getRootRanges(o){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return Yc(this.geometry,o,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class An{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(o,l){let c=1/0,h=-1/0;for(let u=0,d=o.length;u<d;u++){let p=o[u][l];c=p<c?p:c,h=p>h?p:h}this.min=c,this.max=h}setFromPoints(o,l){let c=1/0,h=-1/0;for(let u=0,d=l.length;u<d;u++){let f=l[u],p=o.dot(f);c=p<c?p:c,h=p>h?p:h}this.min=c,this.max=h}isSeparated(o){return this.min>o.max||o.min>this.max}}An.prototype.setFromBox=function(){let o=new k;return function(c,h){let{min:u,max:d}=h,f=1/0,p=-1/0;for(let m=0;m<=1;m++)for(let g=0;g<=1;g++)for(let x=0;x<=1;x++){o.x=u.x*m+d.x*(1-m),o.y=u.y*g+d.y*(1-g),o.z=u.z*x+d.z*(1-x);let y=c.dot(o);f=Math.min(y,f),p=Math.max(y,p)}this.min=f,this.max=p}}();var JT=function(){let o=new An;return function(c,h){let{points:u,satAxes:d,satBounds:f}=c,{points:p,satAxes:m,satBounds:g}=h;for(let x=0;x<3;x++){let y=f[x],_=d[x];if(o.setFromPoints(_,p),y.isSeparated(o))return!1}for(let x=0;x<3;x++){let y=g[x],_=m[x];if(o.setFromPoints(_,u),y.isSeparated(o))return!1}}}();var Ay=function(){let o=new k,l=new k,c=new k;return function(u,d,f){let p=u.start,m=o,g=d.start,x=l;c.subVectors(p,g),o.subVectors(u.end,u.start),l.subVectors(d.end,d.start);let y=c.dot(x),_=x.dot(m),v=x.dot(x),T=c.dot(m),S=m.dot(m)*v-_*_,M,E;if(S!==0)M=(y*_-T*v)/S;else M=0;E=(y+M*_)/v,f.x=M,f.y=E}}(),Cr=function(){let o=new Dt,l=new k,c=new k;return function(u,d,f,p){Ay(u,d,o);let{x:m,y:g}=o;if(m>=0&&m<=1&&g>=0&&g<=1){u.at(m,f),d.at(g,p);return}else if(m>=0&&m<=1){if(g<0)d.at(0,p);else d.at(1,p);u.closestPointToPoint(p,!0,f);return}else if(g>=0&&g<=1){if(m<0)u.at(0,f);else u.at(1,f);d.closestPointToPoint(f,!0,p);return}else{let x;if(m<0)x=u.start;else x=u.end;let y;if(g<0)y=d.start;else y=d.end;let _=l,v=c;if(u.closestPointToPoint(y,!0,l),d.closestPointToPoint(x,!0,c),_.distanceToSquared(y)<=v.distanceToSquared(x)){f.copy(_),p.copy(y);return}else{f.copy(x),p.copy(v);return}}}}(),mf=function(){let o=new k,l=new k,c=new rn,h=new vn;return function(d,f){let{radius:p,center:m}=d,{a:g,b:x,c:y}=f;if(h.start=g,h.end=x,h.closestPointToPoint(m,!0,o).distanceTo(m)<=p)return!0;if(h.start=g,h.end=y,h.closestPointToPoint(m,!0,o).distanceTo(m)<=p)return!0;if(h.start=x,h.end=y,h.closestPointToPoint(m,!0,o).distanceTo(m)<=p)return!0;let w=f.getPlane(c);if(Math.abs(w.distanceToPoint(m))<=p){let M=w.projectPoint(m,l);if(f.containsPoint(M))return!0}return!1}}();var wy=["x","y","z"],di=0.000000000000001,gf=di*di;function Ln(o){return Math.abs(o)<di}class ln extends Fe{constructor(...o){super(...o);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new k),this.satBounds=[,,,,].fill().map(()=>new An),this.points=[this.a,this.b,this.c],this.plane=new rn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new vn,this.needsUpdate=!0}intersectsSphere(o){return mf(o,this)}update(){let o=this.a,l=this.b,c=this.c,h=this.points,u=this.satAxes,d=this.satBounds,f=u[0],p=d[0];this.getNormal(f),p.setFromPoints(f,h);let m=u[1],g=d[1];m.subVectors(o,l),g.setFromPoints(m,h);let x=u[2],y=d[2];x.subVectors(l,c),y.setFromPoints(x,h);let _=u[3],v=d[3];_.subVectors(c,o),v.setFromPoints(_,h);let T=m.length(),w=x.length(),S=_.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,T<di)if(w<di||S<di)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(o),this.degenerateSegment.end.copy(c);else if(w<di)if(S<di)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(l),this.degenerateSegment.end.copy(o);else if(S<di)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(c),this.degenerateSegment.end.copy(l);this.plane.setFromNormalAndCoplanarPoint(f,o),this.needsUpdate=!1}}ln.prototype.closestPointToSegment=function(){let o=new k,l=new k,c=new vn;return function(u,d=null,f=null){if(this.needsUpdate)this.update();let{start:p,end:m}=u,g=this.points,x,y=1/0,_=this.plane.distanceToPoint(p),v=this.plane.distanceToPoint(m);if(_*v<0&&this.plane.intersectLine(u,o)!==null&&this.containsPoint(o)){if(d)d.copy(o);if(f)f.copy(o);return 0}for(let T=0;T<3;T++){let w=(T+1)%3;if(c.start.copy(g[T]),c.end.copy(g[w]),Cr(c,u,o,l),x=o.distanceToSquared(l),x<y){if(y=x,d)d.copy(o);if(f)f.copy(l)}}if(this.closestPointToPoint(p,o),x=p.distanceToSquared(o),x<y){if(y=x,d)d.copy(o);if(f)f.copy(p)}if(this.closestPointToPoint(m,o),x=m.distanceToSquared(o),x<y){if(y=x,d)d.copy(o);if(f)f.copy(m)}return Math.sqrt(y)}}();ln.prototype.intersectsTriangle=function(){let o=new ln,l=new An,c=new An,h=new k,u=new k,d=new k,f=new k,p=new vn,m=new vn,g=new k,x=new Dt,y=new Dt;function _(C,A,P,L){let b=h;if(!C.isDegenerateIntoPoint&&!C.isDegenerateIntoSegment)b.copy(C.plane.normal);else b.copy(A.plane.normal);let{satBounds:R,satAxes:N}=C;for(let z=1;z<4;z++){let W=R[z],O=N[z];if(l.setFromPoints(O,A.points),W.isSeparated(l))return!1;if(f.copy(b).cross(O),l.setFromPoints(f,C.points),c.setFromPoints(f,A.points),l.isSeparated(c))return!1}let{satBounds:B,satAxes:U}=A;for(let z=1;z<4;z++){let W=B[z],O=U[z];if(l.setFromPoints(O,C.points),W.isSeparated(l))return!1;if(f.crossVectors(b,O),l.setFromPoints(f,C.points),c.setFromPoints(f,A.points),l.isSeparated(c))return!1}if(P){if(!L)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");P.start.set(0,0,0),P.end.set(0,0,0)}return!0}function v(C,A,P,L,b,R,N,B,U,z,W){let O=N/(N-B);z.x=L+(b-L)*O,W.start.subVectors(A,C).multiplyScalar(O).add(C),O=N/(N-U),z.y=L+(R-L)*O,W.end.subVectors(P,C).multiplyScalar(O).add(C)}function T(C,A,P,L,b,R,N,B,U,z,W){if(b>0)v(C.c,C.a,C.b,L,A,P,U,N,B,z,W);else if(R>0)v(C.b,C.a,C.c,P,A,L,B,N,U,z,W);else if(B*U>0||N!=0)v(C.a,C.b,C.c,A,P,L,N,B,U,z,W);else if(B!=0)v(C.b,C.a,C.c,P,A,L,B,N,U,z,W);else if(U!=0)v(C.c,C.a,C.b,L,A,P,U,N,B,z,W);else return!0;return!1}function w(C,A,P,L){let b=A.degenerateSegment,R=C.plane.distanceToPoint(b.start),N=C.plane.distanceToPoint(b.end);if(Ln(R))if(Ln(N))return _(C,A,P,L);else{if(P)P.start.copy(b.start),P.end.copy(b.start);return C.containsPoint(b.start)}else if(Ln(N)){if(P)P.start.copy(b.end),P.end.copy(b.end);return C.containsPoint(b.end)}else if(C.plane.intersectLine(b,h)!=null){if(P)P.start.copy(h),P.end.copy(h);return C.containsPoint(h)}else return!1}function S(C,A,P){let L=A.a;if(Ln(C.plane.distanceToPoint(L))&&C.containsPoint(L)){if(P)P.start.copy(L),P.end.copy(L);return!0}else return!1}function M(C,A,P){let L=C.degenerateSegment,b=A.a;if(L.closestPointToPoint(b,!0,h),b.distanceToSquared(h)<gf){if(P)P.start.copy(b),P.end.copy(b);return!0}else return!1}function E(C,A,P,L){if(C.isDegenerateIntoSegment)if(A.isDegenerateIntoSegment){let b=C.degenerateSegment,R=A.degenerateSegment,N=u,B=d;b.delta(N),R.delta(B);let U=h.subVectors(R.start,b.start),z=N.x*B.y-N.y*B.x;if(Ln(z))return!1;let W=(U.x*B.y-U.y*B.x)/z,O=-(N.x*U.y-N.y*U.x)/z;if(W<0||W>1||O<0||O>1)return!1;let q=b.start.z+N.z*W,j=R.start.z+B.z*O;if(Ln(q-j)){if(P)P.start.copy(b.start).addScaledVector(N,W),P.end.copy(b.start).addScaledVector(N,W);return!0}else return!1}else if(A.isDegenerateIntoPoint)return M(C,A,P);else return w(A,C,P,L);else if(C.isDegenerateIntoPoint)if(A.isDegenerateIntoPoint)if(A.a.distanceToSquared(C.a)<gf){if(P)P.start.copy(C.a),P.end.copy(C.a);return!0}else return!1;else if(A.isDegenerateIntoSegment)return M(A,C,P);else return S(A,C,P);else if(A.isDegenerateIntoPoint)return S(C,A,P);else if(A.isDegenerateIntoSegment)return w(C,A,P,L)}return function(A,P=null,L=!1){if(this.needsUpdate)this.update();if(!A.isExtendedTriangle)o.copy(A),o.update(),A=o;else if(A.needsUpdate)A.update();let b=E(this,A,P,L);if(b!==void 0)return b;let R=this.plane,N=A.plane,B=N.distanceToPoint(this.a),U=N.distanceToPoint(this.b),z=N.distanceToPoint(this.c);if(Ln(B))B=0;if(Ln(U))U=0;if(Ln(z))z=0;let W=B*U,O=B*z;if(W>0&&O>0)return!1;let q=R.distanceToPoint(A.a),j=R.distanceToPoint(A.b),X=R.distanceToPoint(A.c);if(Ln(q))q=0;if(Ln(j))j=0;if(Ln(X))X=0;let ht=q*j,Q=q*X;if(ht>0&&Q>0)return!1;u.copy(R.normal),d.copy(N.normal);let rt=u.cross(d),ct=0,At=Math.abs(rt.x),et=Math.abs(rt.y);if(et>At)At=et,ct=1;if(Math.abs(rt.z)>At)ct=2;let Tt=wy[ct],Nt=this.a[Tt],Ut=this.b[Tt],Et=this.c[Tt],jt=A.a[Tt],Zt=A.b[Tt],Pt=A.c[Tt];if(T(this,Nt,Ut,Et,W,O,B,U,z,x,p))return _(this,A,P,L);if(T(A,jt,Zt,Pt,ht,Q,q,j,X,y,m))return _(this,A,P,L);if(x.y<x.x){let Vt=x.y;x.y=x.x,x.x=Vt,g.copy(p.start),p.start.copy(p.end),p.end.copy(g)}if(y.y<y.x){let Vt=y.y;y.y=y.x,y.x=Vt,g.copy(m.start),m.start.copy(m.end),m.end.copy(g)}if(x.y<y.x||y.y<x.x)return!1;if(P){if(y.x>x.x)P.start.copy(m.start);else P.start.copy(p.start);if(y.y<x.y)P.end.copy(m.end);else P.end.copy(p.end)}return!0}}();ln.prototype.distanceToPoint=function(){let o=new k;return function(c){return this.closestPointToPoint(c,o),c.distanceTo(o)}}();ln.prototype.distanceToTriangle=function(){let o=new k,l=new k,c=["a","b","c"],h=new vn,u=new vn;return function(f,p=null,m=null){let g=p||m?h:null;if(this.intersectsTriangle(f,g,!0)){if(p||m){if(p)g.getCenter(p);if(m)g.getCenter(m)}return 0}let x=1/0;for(let y=0;y<3;y++){let _,v=c[y],T=f[v];if(this.closestPointToPoint(T,o),_=T.distanceToSquared(o),_<x){if(x=_,p)p.copy(o);if(m)m.copy(T)}let w=this[v];if(f.closestPointToPoint(w,o),_=w.distanceToSquared(o),_<x){if(x=_,p)p.copy(w);if(m)m.copy(o)}}for(let y=0;y<3;y++){let _=c[y],v=c[(y+1)%3];h.set(this[_],this[v]);for(let T=0;T<3;T++){let w=c[T],S=c[(T+1)%3];u.set(f[w],f[S]),Cr(h,u,o,l);let M=o.distanceToSquared(l);if(M<x){if(x=M,p)p.copy(o);if(m)m.copy(l)}}}return Math.sqrt(x)}}();class Ie{constructor(o,l,c){if(this.isOrientedBox=!0,this.min=new k,this.max=new k,this.matrix=new Yt,this.invMatrix=new Yt,this.points=[,,,,,,,,].fill().map(()=>new k),this.satAxes=[,,,].fill().map(()=>new k),this.satBounds=[,,,].fill().map(()=>new An),this.alignedSatBounds=[,,,].fill().map(()=>new An),this.needsUpdate=!1,o)this.min.copy(o);if(l)this.max.copy(l);if(c)this.matrix.copy(c)}set(o,l,c){this.min.copy(o),this.max.copy(l),this.matrix.copy(c),this.needsUpdate=!0}copy(o){this.min.copy(o.min),this.max.copy(o.max),this.matrix.copy(o.matrix),this.needsUpdate=!0}}Ie.prototype.update=function(){return function(){let l=this.matrix,c=this.min,h=this.max,u=this.points;for(let g=0;g<=1;g++)for(let x=0;x<=1;x++)for(let y=0;y<=1;y++){let _=1*g|2*x|4*y,v=u[_];v.x=g?h.x:c.x,v.y=x?h.y:c.y,v.z=y?h.z:c.z,v.applyMatrix4(l)}let d=this.satBounds,f=this.satAxes,p=u[0];for(let g=0;g<3;g++){let x=f[g],y=d[g],_=1<<g,v=u[_];x.subVectors(p,v),y.setFromPoints(x,u)}let m=this.alignedSatBounds;m[0].setFromPointsField(u,"x"),m[1].setFromPointsField(u,"y"),m[2].setFromPointsField(u,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Ie.prototype.intersectsBox=function(){let o=new An;return function(c){if(this.needsUpdate)this.update();let{min:h,max:u}=c,d=this.satBounds,f=this.satAxes,p=this.alignedSatBounds;if(o.min=h.x,o.max=u.x,p[0].isSeparated(o))return!1;if(o.min=h.y,o.max=u.y,p[1].isSeparated(o))return!1;if(o.min=h.z,o.max=u.z,p[2].isSeparated(o))return!1;for(let m=0;m<3;m++){let g=f[m],x=d[m];if(o.setFromBox(g,c),x.isSeparated(o))return!1}return!0}}();Ie.prototype.intersectsTriangle=function(){let o=new ln,l=[,,,],c=new An,h=new An,u=new k;return function(f){if(this.needsUpdate)this.update();if(!f.isExtendedTriangle)o.copy(f),o.update(),f=o;else if(f.needsUpdate)f.update();let p=this.satBounds,m=this.satAxes;l[0]=f.a,l[1]=f.b,l[2]=f.c;for(let _=0;_<3;_++){let v=p[_],T=m[_];if(c.setFromPoints(T,l),v.isSeparated(c))return!1}let g=f.satBounds,x=f.satAxes,y=this.points;for(let _=0;_<3;_++){let v=g[_],T=x[_];if(c.setFromPoints(T,y),v.isSeparated(c))return!1}for(let _=0;_<3;_++){let v=m[_];for(let T=0;T<4;T++){let w=x[T];if(u.crossVectors(v,w),c.setFromPoints(u,l),h.setFromPoints(u,y),c.isSeparated(h))return!1}}return!0}}();Ie.prototype.closestPointToPoint=function(){return function(l,c){if(this.needsUpdate)this.update();return c.copy(l).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),c}}();Ie.prototype.distanceToPoint=function(){let o=new k;return function(c){return this.closestPointToPoint(c,o),c.distanceTo(o)}}();Ie.prototype.distanceToBox=function(){let o=["x","y","z"],l=Array(12).fill().map(()=>new vn),c=Array(12).fill().map(()=>new vn),h=new k,u=new k;return function(f,p=0,m=null,g=null){if(this.needsUpdate)this.update();if(this.intersectsBox(f)){if(m||g){if(f.getCenter(u),this.closestPointToPoint(u,h),f.closestPointToPoint(h,u),m)m.copy(h);if(g)g.copy(u)}return 0}let x=p*p,{min:y,max:_}=f,v=this.points,T=1/0;for(let S=0;S<8;S++){let M=v[S];u.copy(M).clamp(y,_);let E=M.distanceToSquared(u);if(E<T){if(T=E,m)m.copy(M);if(g)g.copy(u);if(E<x)return Math.sqrt(E)}}let w=0;for(let S=0;S<3;S++)for(let M=0;M<=1;M++)for(let E=0;E<=1;E++){let C=(S+1)%3,A=(S+2)%3,P=M<<C|E<<A,L=1<<S|M<<C|E<<A,b=v[P],R=v[L];l[w].set(b,R);let B=o[S],U=o[C],z=o[A],W=c[w],{start:O,end:q}=W;O[B]=y[B],O[U]=M?y[U]:_[U],O[z]=E?y[z]:_[z],q[B]=_[B],q[U]=M?y[U]:_[U],q[z]=E?y[z]:_[z],w++}for(let S=0;S<=1;S++)for(let M=0;M<=1;M++)for(let E=0;E<=1;E++){u.x=S?_.x:y.x,u.y=M?_.y:y.y,u.z=E?_.z:y.z,this.closestPointToPoint(u,h);let C=u.distanceToSquared(h);if(C<T){if(T=C,m)m.copy(h);if(g)g.copy(u);if(C<x)return Math.sqrt(C)}}for(let S=0;S<12;S++){let M=l[S];for(let E=0;E<12;E++){let C=c[E];Cr(M,C,h,u);let A=h.distanceToSquared(u);if(A<T){if(T=A,m)m.copy(h);if(g)g.copy(u);if(A<x)return Math.sqrt(A)}}}return Math.sqrt(T)}}();class _f extends $i{constructor(){super(()=>new ln)}}var mn=new _f;var Pr=new k,Jc=new k;function xf(o,l,c={},h=0,u=1/0){let d=h*h,f=u*u,p=1/0,m=null;if(o.shapecast({boundsTraverseOrder:(x)=>(Pr.copy(l).clamp(x.min,x.max),Pr.distanceToSquared(l)),intersectsBounds:(x,y,_)=>_<p&&_<f,intersectsTriangle:(x,y)=>{x.closestPointToPoint(l,Pr);let _=l.distanceToSquared(Pr);if(_<p)Jc.copy(Pr),p=_,m=y;if(_<d)return!0;else return!1}}),p===1/0)return null;let g=Math.sqrt(p);if(!c.point)c.point=Jc.clone();else c.point.copy(Jc);return c.distance=g,c.faceIndex=m,c}var aa=parseInt(zi)>=169,Ry=parseInt(zi)<=161,ji=new k,Qi=new k,ts=new k,la=new Dt,ca=new Dt,ha=new Dt,yf=new k,vf=new k,Sf=new k,Ir=new k;function Cy(o,l,c,h,u,d,f,p){let m;if(d===on)m=o.intersectTriangle(h,c,l,!0,u);else m=o.intersectTriangle(l,c,h,d!==Rn,u);if(m===null)return null;let g=o.origin.distanceTo(u);if(g<f||g>p)return null;return{distance:g,point:u.clone()}}function Mf(o,l,c,h,u,d,f,p,m,g,x){ji.fromBufferAttribute(l,d),Qi.fromBufferAttribute(l,f),ts.fromBufferAttribute(l,p);let y=Cy(o,ji,Qi,ts,Ir,m,g,x);if(y){if(h){la.fromBufferAttribute(h,d),ca.fromBufferAttribute(h,f),ha.fromBufferAttribute(h,p),y.uv=new Dt;let v=Fe.getInterpolation(Ir,ji,Qi,ts,la,ca,ha,y.uv);if(!aa)y.uv=v}if(u){la.fromBufferAttribute(u,d),ca.fromBufferAttribute(u,f),ha.fromBufferAttribute(u,p),y.uv1=new Dt;let v=Fe.getInterpolation(Ir,ji,Qi,ts,la,ca,ha,y.uv1);if(!aa)y.uv1=v;if(Ry)y.uv2=y.uv1}if(c){yf.fromBufferAttribute(c,d),vf.fromBufferAttribute(c,f),Sf.fromBufferAttribute(c,p),y.normal=new k;let v=Fe.getInterpolation(Ir,ji,Qi,ts,yf,vf,Sf,y.normal);if(y.normal.dot(o.direction)>0)y.normal.multiplyScalar(-1);if(!aa)y.normal=v}let _={a:d,b:f,c:p,normal:new k,materialIndex:0};if(Fe.getNormal(ji,Qi,ts,_.normal),y.face=_,y.faceIndex=d,aa){let v=new k;Fe.getBarycoord(Ir,ji,Qi,ts,v),y.barycoord=v}}return y}function bf(o){return o&&o.isMaterial?o.side:o}function zs(o,l,c,h,u,d,f){let p=h*3,m=p+0,g=p+1,x=p+2,{index:y,groups:_}=o;if(o.index)m=y.getX(m),g=y.getX(g),x=y.getX(x);let{position:v,normal:T,uv:w,uv1:S}=o.attributes;if(Array.isArray(l)){let M=h*3;for(let E=0,C=_.length;E<C;E++){let{start:A,count:P,materialIndex:L}=_[E];if(M>=A&&M<A+P){let b=bf(l[L]),R=Mf(c,v,T,w,S,m,g,x,b,d,f);if(R)if(R.faceIndex=h,R.face.materialIndex=L,u)u.push(R);else return R}}}else{let M=bf(l),E=Mf(c,v,T,w,S,m,g,x,M,d,f);if(E)if(E.faceIndex=h,E.face.materialIndex=0,u)u.push(E);else return E}return null}function Ee(o,l,c,h){let{a:u,b:d,c:f}=o,p=l,m=l+1,g=l+2;if(c)p=c.getX(p),m=c.getX(m),g=c.getX(g);u.x=h.getX(p),u.y=h.getY(p),u.z=h.getZ(p),d.x=h.getX(m),d.y=h.getY(m),d.z=h.getZ(m),f.x=h.getX(g),f.y=h.getY(g),f.z=h.getZ(g)}function Tf(o,l,c,h,u,d,f,p){let{geometry:m,_indirectBuffer:g}=o;for(let x=h,y=h+u;x<y;x++)zs(m,l,c,x,d,f,p)}function Ef(o,l,c,h,u,d,f){let{geometry:p,_indirectBuffer:m}=o,g=1/0,x=null;for(let y=h,_=h+u;y<_;y++){let v;if(v=zs(p,l,c,y,null,d,f),v&&v.distance<g)x=v,g=v.distance}return x}function Af(o,l,c,h,u,d,f){let{geometry:p}=c,{index:m}=p,g=p.attributes.position;for(let x=o,y=l+o;x<y;x++){let _;if(_=x,Ee(f,_*3,m,g),f.needsUpdate=!0,h(f,_,u,d))return!0}return!1}function wf(o,l=null){if(l&&Array.isArray(l))l=new Set(l);let c=o.geometry,h=c.index?c.index.array:null,u=c.attributes.position,d,f,p,m,g=0,x=o._roots;for(let _=0,v=x.length;_<v;_++)d=x[_],f=new Uint32Array(d),p=new Uint16Array(d),m=new Float32Array(d),y(0,g),g+=d.byteLength;function y(_,v,T=!1){let w=_*2;if(se(w,p)){let S=pe(_,f),M=ve(w,p),E=1/0,C=1/0,A=1/0,P=-1/0,L=-1/0,b=-1/0;for(let R=3*S,N=3*(S+M);R<N;R++){let B=h[R],U=u.getX(B),z=u.getY(B),W=u.getZ(B);if(U<E)E=U;if(U>P)P=U;if(z<C)C=z;if(z>L)L=z;if(W<A)A=W;if(W>b)b=W}if(m[_+0]!==E||m[_+1]!==C||m[_+2]!==A||m[_+3]!==P||m[_+4]!==L||m[_+5]!==b)return m[_+0]=E,m[_+1]=C,m[_+2]=A,m[_+3]=P,m[_+4]=L,m[_+5]=b,!0;else return!1}else{let S=ue(_),M=de(_,f),E=T,C=!1,A=!1;if(l){if(!E){let B=S/ye+v/Ze,U=M/ye+v/Ze;C=l.has(B),A=l.has(U),E=!C&&!A}}else C=!0,A=!0;let P=E||C,L=E||A,b=!1;if(P)b=y(S,v,E);let R=!1;if(L)R=y(M,v,E);let N=b||R;if(N)for(let B=0;B<3;B++){let U=S+B,z=M+B,W=m[U],O=m[U+3],q=m[z],j=m[z+3];m[_+B]=W<q?W:q,m[_+B+3]=O>j?O:j}return N}}}function cn(o,l,c,h,u){let d,f,p,m,g,x,y=1/c.direction.x,_=1/c.direction.y,v=1/c.direction.z,T=c.origin.x,w=c.origin.y,S=c.origin.z,M=l[o],E=l[o+3],C=l[o+1],A=l[o+3+1],P=l[o+2],L=l[o+3+2];if(y>=0)d=(M-T)*y,f=(E-T)*y;else d=(E-T)*y,f=(M-T)*y;if(_>=0)p=(C-w)*_,m=(A-w)*_;else p=(A-w)*_,m=(C-w)*_;if(d>m||p>f)return!1;if(p>d||isNaN(d))d=p;if(m<f||isNaN(f))f=m;if(v>=0)g=(P-S)*v,x=(L-S)*v;else g=(L-S)*v,x=(P-S)*v;if(d>x||g>f)return!1;if(g>d||d!==d)d=g;if(x<f||f!==f)f=x;return d<=u&&f>=h}function Rf(o,l,c,h,u,d,f,p){let{geometry:m,_indirectBuffer:g}=o;for(let x=h,y=h+u;x<y;x++){let _=g?g[x]:x;zs(m,l,c,_,d,f,p)}}function Cf(o,l,c,h,u,d,f){let{geometry:p,_indirectBuffer:m}=o,g=1/0,x=null;for(let y=h,_=h+u;y<_;y++){let v;if(v=zs(p,l,c,m?m[y]:y,null,d,f),v&&v.distance<g)x=v,g=v.distance}return x}function Pf(o,l,c,h,u,d,f){let{geometry:p}=c,{index:m}=p,g=p.attributes.position;for(let x=o,y=l+o;x<y;x++){let _;if(_=c.resolveTriangleIndex(x),Ee(f,_*3,m,g),f.needsUpdate=!0,h(f,_,u,d))return!0}return!1}function If(o,l,c,h,u,d,f){if(ee.setBuffer(o._roots[l]),cn(0,ee.float32Array,h,d,f))Kc(0,o,c,h,u,d,f);ee.clearBuffer()}function Kc(o,l,c,h,u,d,f){let{float32Array:p,uint16Array:m,uint32Array:g}=ee,x=o*2;if(se(x,m)){let _=pe(o,g),v=ve(x,m);Tf(l,c,h,_,v,u,d,f)}else{let _=ue(o);if(cn(_,p,h,d,f))Kc(_,l,c,h,u,d,f);let v=de(o,g);if(cn(v,p,h,d,f))Kc(v,l,c,h,u,d,f)}}var Py=["x","y","z"];function Df(o,l,c,h,u,d){ee.setBuffer(o._roots[l]);let f=null;if(cn(0,ee.float32Array,h,u,d))f=$c(0,o,c,h,u,d);return ee.clearBuffer(),f}function $c(o,l,c,h,u,d){let{float32Array:f,uint16Array:p,uint32Array:m}=ee,g=o*2;if(se(g,p)){let y=pe(o,m),_=ve(g,p);return Ef(l,c,h,y,_,u,d)}else{let y=Is(o,m),_=Py[y],T=h.direction[_]>=0,w,S;if(T)w=ue(o),S=de(o,m);else w=de(o,m),S=ue(o);let E=cn(w,f,h,u,d)?$c(w,l,c,h,u,d):null;if(E){let P=E.point[_];if(T?P<=f[S+y]:P>=f[S+y+3])return E}let A=cn(S,f,h,u,d)?$c(S,l,c,h,u,d):null;if(E&&A)return E.distance<=A.distance?E:A;else return E||A||null}}var ua=new _e,ks=new ln,Hs=new ln,Dr=new Yt,Lf=new Ie,da=new Ie;function Nf(o,l,c,h){ee.setBuffer(o._roots[l]);let u=jc(0,o,c,h);return ee.clearBuffer(),u}function jc(o,l,c,h,u=null){let{float32Array:d,uint16Array:f,uint32Array:p}=ee,m=o*2;if(u===null){if(!c.boundingBox)c.computeBoundingBox();Lf.set(c.boundingBox.min,c.boundingBox.max,h),u=Lf}if(se(m,f)){let x=l.geometry,y=x.index,_=x.attributes.position,v=c.index,T=c.attributes.position,w=pe(o,p),S=ve(m,f);if(Dr.copy(h).invert(),c.boundsTree)return Te(Re(o),d,da),da.matrix.copy(Dr),da.needsUpdate=!0,c.boundsTree.shapecast({intersectsBounds:(E)=>da.intersectsBox(E),intersectsTriangle:(E)=>{E.a.applyMatrix4(h),E.b.applyMatrix4(h),E.c.applyMatrix4(h),E.needsUpdate=!0;for(let C=w*3,A=(S+w)*3;C<A;C+=3)if(Ee(Hs,C,y,_),Hs.needsUpdate=!0,E.intersectsTriangle(Hs))return!0;return!1}});else{let M=Pi(c);for(let E=w*3,C=(S+w)*3;E<C;E+=3){Ee(ks,E,y,_),ks.a.applyMatrix4(Dr),ks.b.applyMatrix4(Dr),ks.c.applyMatrix4(Dr),ks.needsUpdate=!0;for(let A=0,P=M*3;A<P;A+=3)if(Ee(Hs,A,v,T),Hs.needsUpdate=!0,ks.intersectsTriangle(Hs))return!0}}}else{let x=ue(o),y=de(o,p);if(Te(Re(x),d,ua),u.intersectsBox(ua)&&jc(x,l,c,h,u))return!0;if(Te(Re(y),d,ua),u.intersectsBox(ua)&&jc(y,l,c,h,u))return!0;return!1}}var fa=new Yt,Qc=new Ie,Lr=new Ie,Iy=new k,Dy=new k,Ly=new k,Ny=new k;function Uf(o,l,c,h={},u={},d=0,f=1/0){if(!l.boundingBox)l.computeBoundingBox();Qc.set(l.boundingBox.min,l.boundingBox.max,c),Qc.needsUpdate=!0;let p=o.geometry,m=p.attributes.position,g=p.index,x=l.attributes.position,y=l.index,_=mn.getPrimitive(),v=mn.getPrimitive(),T=Iy,w=Dy,S=null,M=null;if(u)S=Ly,M=Ny;let E=1/0,C=null,A=null;if(fa.copy(c).invert(),Lr.matrix.copy(fa),o.shapecast({boundsTraverseOrder:(P)=>Qc.distanceToBox(P),intersectsBounds:(P,L,b)=>{if(b<E&&b<f){if(L)Lr.min.copy(P.min),Lr.max.copy(P.max),Lr.needsUpdate=!0;return!0}return!1},intersectsRange:(P,L)=>{if(l.boundsTree)return l.boundsTree.shapecast({boundsTraverseOrder:(R)=>Lr.distanceToBox(R),intersectsBounds:(R,N,B)=>B<E&&B<f,intersectsRange:(R,N)=>{for(let B=R,U=R+N;B<U;B++){Ee(v,3*B,y,x),v.a.applyMatrix4(c),v.b.applyMatrix4(c),v.c.applyMatrix4(c),v.needsUpdate=!0;for(let z=P,W=P+L;z<W;z++){Ee(_,3*z,g,m),_.needsUpdate=!0;let O=_.distanceToTriangle(v,T,S);if(O<E){if(w.copy(T),M)M.copy(S);E=O,C=z,A=B}if(O<d)return!0}}}});else{let b=Pi(l);for(let R=0,N=b;R<N;R++){Ee(v,3*R,y,x),v.a.applyMatrix4(c),v.b.applyMatrix4(c),v.c.applyMatrix4(c),v.needsUpdate=!0;for(let B=P,U=P+L;B<U;B++){Ee(_,3*B,g,m),_.needsUpdate=!0;let z=_.distanceToTriangle(v,T,S);if(z<E){if(w.copy(T),M)M.copy(S);E=z,C=B,A=R}if(z<d)return!0}}}}}),mn.releasePrimitive(_),mn.releasePrimitive(v),E===1/0)return null;if(!h.point)h.point=w.clone();else h.point.copy(w);if(h.distance=E,h.faceIndex=C,u){if(!u.point)u.point=M.clone();else u.point.copy(M);u.point.applyMatrix4(fa),w.applyMatrix4(fa),u.distance=w.sub(u.point).length(),u.faceIndex=A}return h}function Ff(o,l=null){if(l&&Array.isArray(l))l=new Set(l);let c=o.geometry,h=c.index?c.index.array:null,u=c.attributes.position,d,f,p,m,g=0,x=o._roots;for(let _=0,v=x.length;_<v;_++)d=x[_],f=new Uint32Array(d),p=new Uint16Array(d),m=new Float32Array(d),y(0,g),g+=d.byteLength;function y(_,v,T=!1){let w=_*2;if(se(w,p)){let S=pe(_,f),M=ve(w,p),E=1/0,C=1/0,A=1/0,P=-1/0,L=-1/0,b=-1/0;for(let R=S,N=S+M;R<N;R++){let B=3*o.resolveTriangleIndex(R);for(let U=0;U<3;U++){let z=B+U;z=h?h[z]:z;let W=u.getX(z),O=u.getY(z),q=u.getZ(z);if(W<E)E=W;if(W>P)P=W;if(O<C)C=O;if(O>L)L=O;if(q<A)A=q;if(q>b)b=q}}if(m[_+0]!==E||m[_+1]!==C||m[_+2]!==A||m[_+3]!==P||m[_+4]!==L||m[_+5]!==b)return m[_+0]=E,m[_+1]=C,m[_+2]=A,m[_+3]=P,m[_+4]=L,m[_+5]=b,!0;else return!1}else{let S=ue(_),M=de(_,f),E=T,C=!1,A=!1;if(l){if(!E){let B=S/ye+v/Ze,U=M/ye+v/Ze;C=l.has(B),A=l.has(U),E=!C&&!A}}else C=!0,A=!0;let P=E||C,L=E||A,b=!1;if(P)b=y(S,v,E);let R=!1;if(L)R=y(M,v,E);let N=b||R;if(N)for(let B=0;B<3;B++){let U=S+B,z=M+B,W=m[U],O=m[U+3],q=m[z],j=m[z+3];m[_+B]=W<q?W:q,m[_+B+3]=O>j?O:j}return N}}}function Of(o,l,c,h,u,d,f){if(ee.setBuffer(o._roots[l]),cn(0,ee.float32Array,h,d,f))th(0,o,c,h,u,d,f);ee.clearBuffer()}function th(o,l,c,h,u,d,f){let{float32Array:p,uint16Array:m,uint32Array:g}=ee,x=o*2;if(se(x,m)){let _=pe(o,g),v=ve(x,m);Rf(l,c,h,_,v,u,d,f)}else{let _=ue(o);if(cn(_,p,h,d,f))th(_,l,c,h,u,d,f);let v=de(o,g);if(cn(v,p,h,d,f))th(v,l,c,h,u,d,f)}}var Uy=["x","y","z"];function Bf(o,l,c,h,u,d){ee.setBuffer(o._roots[l]);let f=null;if(cn(0,ee.float32Array,h,u,d))f=eh(0,o,c,h,u,d);return ee.clearBuffer(),f}function eh(o,l,c,h,u,d){let{float32Array:f,uint16Array:p,uint32Array:m}=ee,g=o*2;if(se(g,p)){let y=pe(o,m),_=ve(g,p);return Cf(l,c,h,y,_,u,d)}else{let y=Is(o,m),_=Uy[y],T=h.direction[_]>=0,w,S;if(T)w=ue(o),S=de(o,m);else w=de(o,m),S=ue(o);let E=cn(w,f,h,u,d)?eh(w,l,c,h,u,d):null;if(E){let P=E.point[_];if(T?P<=f[S+y]:P>=f[S+y+3])return E}let A=cn(S,f,h,u,d)?eh(S,l,c,h,u,d):null;if(E&&A)return E.distance<=A.distance?E:A;else return E||A||null}}var pa=new _e,Gs=new ln,Vs=new ln,Nr=new Yt,zf=new Ie,ma=new Ie;function kf(o,l,c,h){ee.setBuffer(o._roots[l]);let u=nh(0,o,c,h);return ee.clearBuffer(),u}function nh(o,l,c,h,u=null){let{float32Array:d,uint16Array:f,uint32Array:p}=ee,m=o*2;if(u===null){if(!c.boundingBox)c.computeBoundingBox();zf.set(c.boundingBox.min,c.boundingBox.max,h),u=zf}if(se(m,f)){let x=l.geometry,y=x.index,_=x.attributes.position,v=c.index,T=c.attributes.position,w=pe(o,p),S=ve(m,f);if(Nr.copy(h).invert(),c.boundsTree)return Te(Re(o),d,ma),ma.matrix.copy(Nr),ma.needsUpdate=!0,c.boundsTree.shapecast({intersectsBounds:(E)=>ma.intersectsBox(E),intersectsTriangle:(E)=>{E.a.applyMatrix4(h),E.b.applyMatrix4(h),E.c.applyMatrix4(h),E.needsUpdate=!0;for(let C=w,A=S+w;C<A;C++)if(Ee(Vs,3*l.resolveTriangleIndex(C),y,_),Vs.needsUpdate=!0,E.intersectsTriangle(Vs))return!0;return!1}});else{let M=Pi(c);for(let E=w,C=S+w;E<C;E++){let A=l.resolveTriangleIndex(E);Ee(Gs,3*A,y,_),Gs.a.applyMatrix4(Nr),Gs.b.applyMatrix4(Nr),Gs.c.applyMatrix4(Nr),Gs.needsUpdate=!0;for(let P=0,L=M*3;P<L;P+=3)if(Ee(Vs,P,v,T),Vs.needsUpdate=!0,Gs.intersectsTriangle(Vs))return!0}}}else{let x=ue(o),y=de(o,p);if(Te(Re(x),d,pa),u.intersectsBox(pa)&&nh(x,l,c,h,u))return!0;if(Te(Re(y),d,pa),u.intersectsBox(pa)&&nh(y,l,c,h,u))return!0;return!1}}var ga=new Yt,ih=new Ie,Ur=new Ie,Fy=new k,Oy=new k,By=new k,zy=new k;function Hf(o,l,c,h={},u={},d=0,f=1/0){if(!l.boundingBox)l.computeBoundingBox();ih.set(l.boundingBox.min,l.boundingBox.max,c),ih.needsUpdate=!0;let p=o.geometry,m=p.attributes.position,g=p.index,x=l.attributes.position,y=l.index,_=mn.getPrimitive(),v=mn.getPrimitive(),T=Fy,w=Oy,S=null,M=null;if(u)S=By,M=zy;let E=1/0,C=null,A=null;if(ga.copy(c).invert(),Ur.matrix.copy(ga),o.shapecast({boundsTraverseOrder:(P)=>ih.distanceToBox(P),intersectsBounds:(P,L,b)=>{if(b<E&&b<f){if(L)Ur.min.copy(P.min),Ur.max.copy(P.max),Ur.needsUpdate=!0;return!0}return!1},intersectsRange:(P,L)=>{if(l.boundsTree){let b=l.boundsTree;return b.shapecast({boundsTraverseOrder:(R)=>Ur.distanceToBox(R),intersectsBounds:(R,N,B)=>B<E&&B<f,intersectsRange:(R,N)=>{for(let B=R,U=R+N;B<U;B++){let z=b.resolveTriangleIndex(B);Ee(v,3*z,y,x),v.a.applyMatrix4(c),v.b.applyMatrix4(c),v.c.applyMatrix4(c),v.needsUpdate=!0;for(let W=P,O=P+L;W<O;W++){let q=o.resolveTriangleIndex(W);Ee(_,3*q,g,m),_.needsUpdate=!0;let j=_.distanceToTriangle(v,T,S);if(j<E){if(w.copy(T),M)M.copy(S);E=j,C=W,A=B}if(j<d)return!0}}}})}else{let b=Pi(l);for(let R=0,N=b;R<N;R++){Ee(v,3*R,y,x),v.a.applyMatrix4(c),v.b.applyMatrix4(c),v.c.applyMatrix4(c),v.needsUpdate=!0;for(let B=P,U=P+L;B<U;B++){let z=o.resolveTriangleIndex(B);Ee(_,3*z,g,m),_.needsUpdate=!0;let W=_.distanceToTriangle(v,T,S);if(W<E){if(w.copy(T),M)M.copy(S);E=W,C=B,A=R}if(W<d)return!0}}}}}),mn.releasePrimitive(_),mn.releasePrimitive(v),E===1/0)return null;if(!h.point)h.point=w.clone();else h.point.copy(w);if(h.distance=E,h.faceIndex=C,u){if(!u.point)u.point=M.clone();else u.point.copy(M);u.point.applyMatrix4(ga),w.applyMatrix4(ga),u.distance=w.sub(u.point).length(),u.faceIndex=A}return h}function sh(o,l,c){if(o===null)return null;return o.point.applyMatrix4(l.matrixWorld),o.distance=o.point.distanceTo(c.ray.origin),o.object=l,o}var _a=new Ie,xa=new Yn,Gf=new k,Vf=new Yt,Wf=new k,rh=["getX","getY","getZ"];class Fr extends Zc{static serialize(o,l={}){l={cloneBuffers:!0,...l};let{geometry:c,_roots:h,_indirectBuffer:u}=o,d=c.getIndex(),f={version:1,roots:null,index:null,indirectBuffer:null};if(l.cloneBuffers)f.roots=h.map((p)=>p.slice()),f.index=d?d.array.slice():null,f.indirectBuffer=u?u.slice():null;else f.roots=h,f.index=d?d.array:null,f.indirectBuffer=u;return f}static deserialize(o,l,c={}){c={setIndex:!0,indirect:Boolean(o.indirectBuffer),...c};let{index:h,roots:u,indirectBuffer:d}=o;if(!o.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),p(u);let f=new Fr(l,{...c,[Ar]:!0});if(f._roots=u,f._indirectBuffer=d||null,c.setIndex){let m=l.getIndex();if(m===null){let g=new Ye(o.index,1,!1);l.setIndex(g)}else if(m.array!==h)m.array.set(h),m.needsUpdate=!0}return f;function p(m){for(let g=0;g<m.length;g++){let x=m[g],y=new Uint32Array(x),_=new Uint16Array(x);for(let v=0,T=x.byteLength/Ze;v<T;v++){let w=ye*v,S=2*w;if(!se(S,_))y[w+6]=y[w+6]/ye-v}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(o,l={}){if(l.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),l={...l,targetLeafSize:l.maxLeafTris};super(o,l)}shiftTriangleOffsets(o){return super.shiftPrimitiveOffsets(o)}writePrimitiveBounds(o,l,c){let h=this.geometry,u=this._indirectBuffer,d=h.attributes.position,f=h.index?h.index.array:null,m=(u?u[o]:o)*3,g=m+0,x=m+1,y=m+2;if(f)g=f[g],x=f[x],y=f[y];for(let _=0;_<3;_++){let v=d[rh[_]](g),T=d[rh[_]](x),w=d[rh[_]](y),S=v;if(T<S)S=T;if(w<S)S=w;let M=v;if(T>M)M=T;if(w>M)M=w;l[c+_]=S,l[c+_+3]=M}return l}computePrimitiveBounds(o,l,c){let h=this.geometry,u=this._indirectBuffer,d=h.attributes.position,f=h.index?h.index.array:null,p=d.normalized;if(o<0||l+o-c.offset>c.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let m=d.array,g=d.offset||0,x=3;if(d.isInterleavedBufferAttribute)x=d.data.stride;let y=["getX","getY","getZ"],_=c.offset;for(let v=o,T=o+l;v<T;v++){let S=(u?u[v]:v)*3,M=(v-_)*6,E=S+0,C=S+1,A=S+2;if(f)E=f[E],C=f[C],A=f[A];if(!p)E=E*x+g,C=C*x+g,A=A*x+g;for(let P=0;P<3;P++){let L,b,R;if(p)L=d[y[P]](E),b=d[y[P]](C),R=d[y[P]](A);else L=m[E+P],b=m[C+P],R=m[A+P];let N=L;if(b<N)N=b;if(R<N)N=R;let B=L;if(b>B)B=b;if(R>B)B=R;let U=(B-N)/2,z=P*2;c[M+z+0]=N+U,c[M+z+1]=U+(Math.abs(N)+U)*Ps}}return c}raycastObject3D(o,l,c=[]){let{material:h}=o;if(h===void 0)return;Vf.copy(o.matrixWorld).invert(),xa.copy(l.ray).applyMatrix4(Vf),Wf.setFromMatrixScale(o.matrixWorld),Gf.copy(xa.direction).multiply(Wf);let u=Gf.length(),d=l.near/u,f=l.far/u;if(l.firstHitOnly===!0){let p=this.raycastFirst(xa,h,d,f);if(p=sh(p,o,l),p)c.push(p)}else{let p=this.raycast(xa,h,d,f);for(let m=0,g=p.length;m<g;m++){let x=sh(p[m],o,l);if(x)c.push(x)}}return c}refit(o=null){return(this.indirect?Ff:wf)(this,o)}raycast(o,l=li,c=0,h=1/0){let u=this._roots,d=[],f=this.indirect?Of:If;for(let p=0,m=u.length;p<m;p++)f(this,p,l,o,d,c,h);return d}raycastFirst(o,l=li,c=0,h=1/0){let u=this._roots,d=null,f=this.indirect?Bf:Df;for(let p=0,m=u.length;p<m;p++){let g=f(this,p,l,o,c,h);if(g!=null&&(d==null||g.distance<d.distance))d=g}return d}intersectsGeometry(o,l){let c=!1,h=this._roots,u=this.indirect?kf:Nf;for(let d=0,f=h.length;d<f;d++)if(c=u(this,d,o,l),c)break;return c}shapecast(o){let l=mn.getPrimitive(),c=super.shapecast({...o,intersectsPrimitive:o.intersectsTriangle,scratchPrimitive:l,iterate:this.indirect?Pf:Af});return mn.releasePrimitive(l),c}bvhcast(o,l,c){let{intersectsRanges:h,intersectsTriangles:u}=c,d=mn.getPrimitive(),f=this.geometry.index,p=this.geometry.attributes.position,m=this.indirect?(v)=>{let T=this.resolveTriangleIndex(v);Ee(d,T*3,f,p)}:(v)=>{Ee(d,v*3,f,p)},g=mn.getPrimitive(),x=o.geometry.index,y=o.geometry.attributes.position,_=o.indirect?(v)=>{let T=o.resolveTriangleIndex(v);Ee(g,T*3,x,y)}:(v)=>{Ee(g,v*3,x,y)};if(u){if(!(o instanceof Fr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let v=(T,w,S,M,E,C,A,P)=>{for(let L=S,b=S+M;L<b;L++){_(L),g.a.applyMatrix4(l),g.b.applyMatrix4(l),g.c.applyMatrix4(l),g.needsUpdate=!0;for(let R=T,N=T+w;R<N;R++)if(m(R),d.needsUpdate=!0,u(d,g,R,L,E,C,A,P))return!0}return!1};if(h){let T=h;h=function(w,S,M,E,C,A,P,L){if(!T(w,S,M,E,C,A,P,L))return v(w,S,M,E,C,A,P,L);return!0}}else h=v}return super.bvhcast(o,l,{intersectsRanges:h})}intersectsBox(o,l){return _a.set(o.min,o.max,l),_a.needsUpdate=!0,this.shapecast({intersectsBounds:(c)=>_a.intersectsBox(c),intersectsTriangle:(c)=>_a.intersectsTriangle(c)})}intersectsSphere(o){return this.shapecast({intersectsBounds:(l)=>o.intersectsBox(l),intersectsTriangle:(l)=>l.intersectsSphere(o)})}closestPointToGeometry(o,l,c={},h={},u=0,d=1/0){return(this.indirect?Hf:Uf)(this,o,l,c,h,u,d)}closestPointToPoint(o,l={},c=0,h=1/0){return xf(this,o,l,c,h)}}function Xf(o){switch(typeof o){case"number":return 8;case"string":return o.length*2;case"boolean":return 4;default:return 0}}function ky(o){return/(Uint|Int|Float)(8|16|32)Array/.test(o.constructor.name)}function oh(o){let l=new Set,c=[o],h=0;while(c.length){let u=c.pop();if(l.has(u))continue;l.add(u);for(let d in u){if(!Object.hasOwn(u,d))continue;h+=Xf(d);let f=u[d];if(f&&(typeof f==="object"||typeof f==="function"))if(ky(f))h+=f.byteLength;else if(oa()&&f instanceof SharedArrayBuffer)h+=f.byteLength;else if(f instanceof ArrayBuffer)h+=f.byteLength;else c.push(f);else h+=Xf(f)}}return h}var $A=parseInt(zi)>=166,Ws={Mesh:Ke.prototype.raycast,Line:Xi.prototype.raycast,LineSegments:pr.prototype.raycast,LineLoop:mr.prototype.raycast,Points:gr.prototype.raycast,BatchedMesh:Po.prototype.raycast},$e=new Ke,ya=[];function qf(o,l){if(this.isBatchedMesh)Hy.call(this,o,l);else{let{geometry:c}=this;if(c.boundsTree)c.boundsTree.raycastObject3D(this,o,l);else{let h;if(this instanceof Ke)h=Ws.Mesh;else if(this instanceof pr)h=Ws.LineSegments;else if(this instanceof mr)h=Ws.LineLoop;else if(this instanceof Xi)h=Ws.Line;else if(this instanceof gr)h=Ws.Points;else throw Error("BVH: Fallback raycast function not found.");h.call(this,o,l)}}}function Hy(o,l){if(this.boundsTrees){let c=this.boundsTrees,h=this._drawInfo||this._instanceInfo,u=this._drawRanges||this._geometryInfo,d=this.matrixWorld;$e.material=this.material,$e.geometry=this.geometry;let f=$e.geometry.boundsTree,p=$e.geometry.drawRange;if($e.geometry.boundingSphere===null)$e.geometry.boundingSphere=new pn;for(let m=0,g=h.length;m<g;m++){if(!this.getVisibleAt(m))continue;let x=h[m].geometryIndex;if($e.geometry.boundsTree=c[x],this.getMatrixAt(m,$e.matrixWorld).premultiply(d),!$e.geometry.boundsTree){this.getBoundingBoxAt(x,$e.geometry.boundingBox),this.getBoundingSphereAt(x,$e.geometry.boundingSphere);let y=u[x];$e.geometry.setDrawRange(y.start,y.count)}$e.raycast(o,ya);for(let y=0,_=ya.length;y<_;y++){let v=ya[y];v.object=this,v.batchId=m,l.push(v)}ya.length=0}$e.geometry.boundsTree=f,$e.geometry.drawRange=p,$e.material=null,$e.geometry=null}else Ws.BatchedMesh.call(this,o,l)}var Yf=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var Zf=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int pointer = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( pointer > - 1 && pointer < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ pointer ];
		pointer --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = currNodeIndex + boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			pointer ++;
			stack[ pointer ] = c2;

			pointer ++;
			stack[ pointer ] = c1;

		}

	}

	return found;

}
`;var ow=`
	${Yf}
	${Zf}
`;function va(o,l,c){return o+l<=c*1073741824}function Jf(o,l){return Math.round(o*l*4*2.333333333333333)}function Kf(o,l){return[Math.floor(o/256),Math.floor(-l/256)]}function $f(o,l,c){if(o.length<2)return null;let h=1/0,u=0,d=0;for(let f=0;f+1<o.length;f++){let[p,m]=o[f],g=o[f+1][0]-p,x=o[f+1][1]-m,y=g*g+x*x,_=Math.sqrt(y),v=y?Math.min(1,Math.max(0,((l-p)*g+(c-m)*x)/y)):0,T=Math.hypot(l-(p+v*g),c-(m+v*x));if(T<h)h=T,u=d+v*_;d+=_}return{metre:u,off:h}}function jf([o,l],c,h,u){let d=Math.PI/180,f=c,p=-u,m=h,g=Math.sin(o*d),x=Math.cos(o*d),y=Math.sin(l*d),_=Math.cos(l*d),v=6378137/Math.sqrt(1-0.0066943799901413165*g*g),T=v*x*_-y*f-g*_*p+x*_*m,w=v*x*y+_*f-g*y*p+x*y*m,S=v*0.9933056200098587*g+x*p+g*m,M=Math.hypot(T,w),E=Math.atan2(S,M*0.9933056200098587);for(let C=0;C<5;C++){let A=Math.sin(E);E=Math.atan2(S+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*A*A))*A,M)}return[E/d,Math.atan2(w,T)/d]}function Qf(o,l){return Math.floor((l+o)/8)}function tp(o,l,c){return[Math.max(0,o*8-l),Math.min(c,(o+1)*8-l)]}function ep(o,l,c){let h=Math.floor((l-Math.floor(l))*o.cols),u=Math.floor((c-Math.floor(c))*o.rows);return o.sprites[u*o.cols+h]??null}var Vy=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],Wy=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function np(o){return Vy.find(([l])=>l.test(o))?.[1]??"Unknown"}function ip(o){return Wy.find(([l])=>l.test(o))?.[1]??o}var Sa=11,Xy=6,ah=2,lh=300000,qy=45,Yy=22,Zy=/^(1ROAD|1GRASS|1GRAVEL)_ground|^nocol_far/,sp=1.5,Jy=0.004,ch=1,Ky=4,$y=2,jy=24,Qy=6000,tv=0.1,ev=new Set(["KeyW","KeyA","KeyS","KeyD"]),nv=60;function rp(o,l){performance.clearMeasures(o);let c=performance.now(),h=l();return performance.measure(o,{start:c}),h}function iv(o){let l=document.createElement("canvas");l.width=o.width,l.height=o.height;let c=l.getContext("2d",{willReadFrequently:!0});return c?.drawImage(o,0,0),c?c.getImageData(0,0,o.width,o.height):null}function sv(o){let l=performance.now(),c=new Fr(o.geometry,{indirect:!0}),h=oh(c);return o.geometry.boundsTree=c,o.raycast=qf,performance.measure("map2lap.bvh",{start:l,detail:h}),h}var op=(o)=>o.vertices*Sa*4+4+o.indices*2;function rv(o,l){let c=0,h=1/0;return o.forEach((u,d)=>{let f=Math.max(0,Math.hypot(u.center[0]-l.x,u.center[1]-l.y,u.center[2]-l.z)-u.radius);if(f<h)h=f,c=d}),o.splice(c,1)[0]}async function ap(o,l){let c=await fetch(o,{signal:l});if(!c.ok)throw Error((await c.json().catch(()=>null))?.error??`${o}: ${c.status}`);return c.arrayBuffer()}async function ov(o,l,c){let h;if(/\.dds$/i.test(l)){let u=new Uc().parse(o,!0);h=new _r(u.mipmaps,u.width,u.height,u.format),h.minFilter=u.mipmapCount>1?Bn:yn}else{let u=await createImageBitmap(new Blob([o]),{imageOrientation:"none",premultiplyAlpha:"none"});h=new Oe(u),h.generateMipmaps=!0,h.minFilter=Bn}return h.flipY=!1,h.wrapS=h.wrapT=_o,h.anisotropy=c,h.colorSpace=bo,h.needsUpdate=!0,h}function av(o,l){let c=new xn,h=new Co(new Float32Array(l,0,o.vertices*Sa),Sa);c.setAttribute("position",new Wi(h,3,0)),c.setAttribute("normal",new Wi(h,3,3)),c.setAttribute("uv",new Wi(h,2,6));let u=o.vertices*Sa*4+4;return c.setIndex(new Ye(new Uint16Array(l,u,o.indices),1)),c.boundingSphere=new pn(new k(...o.center),o.radius),c.computeBoundingBox(),c}class hh{renderer;scene=new Ao;camera=new _n(55,1,0.5,lh);controls;resizing;down=new Sr;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;flyingNow=!1;host;flying=new Set;lastFrame=0;settings=a;data=null;onHover=()=>{};mouse=null;hoverDue=!1;lastHover=0;picker=new Sr;alphaOf=new Map;constructor(o){this.host=o,this.renderer=new Ic({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),o.appendChild(this.renderer.domElement),this.scene.background=new Kt("#a9cfe9"),this.scene.add(new Ho("#ffffff",2));let l=new ko("#fff4e0",1.6);l.position.set(0.5,1,0.35),this.scene.add(l),this.down.firstHitOnly=!0,this.controls=new Nc(this.camera,this.renderer.domElement),this.controls.zoomToCursor=!0,this.controls.minDistance=1,this.controls.maxDistance=lh/2,this.controls.mouseButtons.MIDDLE=null,this.controls.addEventListener("change",()=>{if(!this.flyingNow)this.keepAboveGround();this.dirty=!0,this.hoverDue=!0}),this.lookAround(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(o),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.controls.dispose(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(o){if(this.shown=o,o)this.resize();else this.flying.clear()}setControls(o){this.settings=o,this.controls.rotateSpeed=o.orbit/100,this.controls.panSpeed=o.move/100,this.controls.zoomSpeed=o.zoom/100}setHover(o){this.onHover=o}async open(o,l){let c=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:h}=this.loading;if(this.clear(),this.dirty=!0,this.onHover(null),l(o?"Reading the track …":""),!o)return;try{await this.load(o,c,h,l)}catch(u){if(c!==this.token)return;this.loading.abort(),l(`Could not load this track: ${u.message}`)}}async load(o,l,c,h){let u=await fetch(`/api/editor/${encodeURIComponent(o)}/index`,{signal:c}),d=await u.json();if(l!==this.token)return;if(!u.ok){h(d.error||"Could not read this track");return}this.data=d,this.placeCamera(d),this.renderer.domElement.focus({preventScroll:!0});let f=d.meshes.slice(),p=f.length,m=0;if(await Promise.all(Array.from({length:Xy},async()=>{while(f.length&&l===this.token){let x=rv(f,this.camera.position);if(!va(this.usedBytes,ah*op(x),this.settings.memoryGb)){this.overLimit=!0,f.length=0;return}this.usedBytes+=ah*op(x);let y=await ap(`/api/editor/${encodeURIComponent(o)}/mesh/${x.i}?r=${d.revision}`,c);if(l!==this.token)return;this.addMesh(o,d,x,y),m++,h(`Loading: ${m} of ${p} parts`)}})),l!==this.token)return;if(await Promise.all(this.textures),l!==this.token)return;h(this.overLimit?`Memory limit reached (Settings): ${m} of ${p} parts, the nearest ones`:`${p} parts loaded`)}lookAround(o){let l=null;o.addEventListener("mousedown",(c)=>{if(c.button===ch)c.preventDefault()}),o.addEventListener("pointerdown",(c)=>{if(c.button===ch)l={x:c.clientX,y:c.clientY}}),o.addEventListener("pointermove",(c)=>{if(!l)return;if(!(c.buttons&Ky)){l=null;return}let{look:h,invertLook:u}=this.settings,d=Jy*h/100;this.turn((l.x-c.clientX)*d,(l.y-c.clientY)*d*(u?-1:1)),l={x:c.clientX,y:c.clientY}}),o.addEventListener("pointerup",(c)=>{if(c.button===ch)l=null})}followMouse(o){o.addEventListener("pointermove",(l)=>{let c=o.getBoundingClientRect();if(this.mouse=new Dt((l.clientX-c.left)/c.width*2-1,-(l.clientY-c.top)/c.height*2+1),!l.buttons)this.hoverDue=!0}),o.addEventListener("pointerup",()=>{this.hoverDue=!0}),o.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}solidAt(o){let l=o.object.material;if(!l.alphaTest||!l.map||!o.uv)return!0;let c=this.alphaOf.get(l.map);if(c===void 0){if(c=l.map.image instanceof ImageBitmap?iv(l.map.image):null,this.alphaOf.set(l.map,c),c)this.usedBytes+=c.data.byteLength}if(!c)return!0;let h=Math.floor((o.uv.x-Math.floor(o.uv.x))*c.width),u=Math.floor((o.uv.y-Math.floor(o.uv.y))*c.height);return c.data[(u*c.width+h)*4+3]/255>=l.alphaTest}hover(){if(!this.mouse||!this.data)return;this.picker.setFromCamera(this.mouse,this.camera);let o=rp("map2lap.hover",()=>this.picker.intersectObjects(this.meshes.filter((l)=>l.visible),!1).find((l)=>this.solidAt(l)));this.onHover(o?this.describe(o):null)}describe(o){let l=this.data,c=o.object,h=c.userData.info,u=l.materials[h.material],d=l.textures.find((_)=>_.name===u.texture),{x:f,y:p,z:m}=o.point,g=o.faceIndex??0,x=o.uv?[o.uv.x,o.uv.y]:null,y=h.first_face!==null&&h.first_face!==void 0;return{kind:ip(h.name),sprite:y&&x?ep(l.atlas,x[0],x[1]):null,object:h.name,physics:np(h.name),material:u.name,shader:u.shader,texture:u.texture,textureBytes:d?.size??null,vertices:h.vertices,triangles:h.indices/3,triangle:g,uv:x,shownTo:h.lod_out,billboard:y?this.billboard(c,h,g):null,at:[f,p,m],tile:Kf(f,m),route:$f(l.route,f,m),latLon:l.anchor?jf(l.anchor,f,p,m):null,distance:o.distance}}billboard(o,l,c){let h=l.first_face,u=Qf(c,h),[d,f]=tp(u,h,l.indices/3);if(f-d<8)return{number:u,height:null,width:null,foot:null};let p=o.geometry.getIndex(),m=o.geometry.getAttribute("position"),g=new _e,x=new k,y=new k;for(let v=d*3;v<f*3;v++)if(x.fromBufferAttribute(m,p.getX(v)),g.expandByPoint(x),v===d*3)y.copy(x);x.fromBufferAttribute(m,p.getX(d*3+1));let _=g.getCenter(new k);return{number:u,height:g.max.y-g.min.y,width:y.distanceTo(x),foot:[_.x,_.z]}}flyKeys(o){o.tabIndex=0,o.addEventListener("pointerdown",()=>o.focus({preventScroll:!0})),o.addEventListener("keydown",(l)=>{if(!ev.has(l.code)||l.ctrlKey||l.metaKey||l.altKey)return;l.preventDefault(),this.flying.add(l.code)}),o.addEventListener("keyup",(l)=>this.flying.delete(l.code)),o.addEventListener("blur",()=>this.flying.clear())}fly(o){let l=this.camera.position,c=this.camera.getWorldDirection(new k),h=new k().crossVectors(c,this.camera.up).normalize(),u=new k;if(this.flying.has("KeyW"))u.add(c);if(this.flying.has("KeyS"))u.sub(c);if(this.flying.has("KeyD"))u.add(h);if(this.flying.has("KeyA"))u.sub(h);if(!u.lengthSq())return;let d=Math.min(Qy,Math.max(jy,this.height*$y));u.normalize().multiplyScalar(d*this.settings.fly/100*o),l.add(u),this.controls.target.add(u);let f=l.y;this.keepAboveGround(),this.controls.target.y+=l.y-f,this.flyingNow=!0,this.controls.update(),this.flyingNow=!1,this.dirty=!0}turn(o,l){let c=this.controls.target.clone().sub(this.camera.position),h=new Ki().setFromVector3(c);h.theta+=o,h.phi-=l,h.makeSafe(),this.controls.target.copy(this.camera.position).add(c.setFromSpherical(h)),this.controls.update()}keepAboveGround(){let o=this.camera.position;this.down.set(new k(o.x,o.y+lh,o.z),new k(0,-1,0));let l=rp("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0]);if(l&&o.y<l.point.y+sp)o.y=l.point.y+sp;this.height=l?o.y-l.point.y:o.y}resize(){let o=this.host.clientWidth,l=this.host.clientHeight;if(!o||!l)return;this.renderer.setSize(o,l),this.camera.aspect=o/l,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let o=performance.now(),l=Math.min(tv,(o-this.lastFrame)/1000);if(this.lastFrame=o,this.shown&&this.flying.size)this.fly(l);if(!this.shown)return;if(this.dirty){this.dirty=!1;for(let c of this.meshes){let h=this.camera.position.distanceTo(c.geometry.boundingSphere.center);c.visible=h>=c.userData.lodIn&&h<c.userData.lodOut}this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&o-this.lastHover>=nv)this.hoverDue=!1,this.lastHover=o,this.hover()}clear(){for(let o of this.meshes)this.scene.remove(o),o.geometry.boundsTree=void 0,o.geometry.dispose();for(let o of this.textures)o?.then((l)=>{if(!l)return;let c=l.image;if(l.dispose(),c instanceof ImageBitmap)c.close()},()=>{});for(let o of this.materials)o?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear()}texture(o,l,c){let h=this.textures[c];if(!h){let u=ah*l.textures[c].size,d=this.token;if(!va(this.usedBytes,u,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=u;let f=this.renderer.capabilities.getMaxAnisotropy();h=ap(`/api/editor/${encodeURIComponent(o)}/texture/${c}?r=${l.revision}`,this.loading.signal).then((p)=>ov(p,l.textures[c].name,f)).then((p)=>{if(p.image instanceof ImageBitmap&&d===this.token){let m=Jf(p.image.width,p.image.height)-u;if(!va(this.usedBytes,m,this.settings.memoryGb))return this.usedBytes-=u,this.overLimit=!0,p.dispose(),p.image.close(),null;this.usedBytes+=m}return p}),this.textures[c]=h}return h}material(o,l,c){let h=this.materials[c];if(h)return h;let u=l.materials[c],d=Math.min(1,u.bright),f=new No({color:new Kt(d,d,d)});if(u.alpha_ref>0)f.alphaTest=u.alpha_ref;if(u.blend)f.transparent=!0,f.depthWrite=!1;this.materials[c]=f;let p=l.textures.findIndex((m)=>m.name===u.texture);if(p>=0){let m=this.token;this.texture(o,l,p).then((g)=>{if(!g||m!==this.token)return;f.map=g,f.needsUpdate=!0,this.dirty=!0},()=>{})}return f}addMesh(o,l,c,h){let u=new Ke(av(c,h),this.material(o,l,c.material));if(u.userData={lodIn:c.lod_in,lodOut:c.lod_out,info:c},u.name=c.name,this.scene.add(u),this.meshes.push(u),Zy.test(c.name))this.usedBytes+=sv(u),this.grounds.push(u);this.dirty=!0,this.hoverDue=!0}placeCamera(o){let l=new k,c=new k(0,0,1);if(o.start)l.set(...o.start.pos),c.set(...o.start.forward).normalize();else if(o.meshes.length){for(let h of o.meshes)l.add(new k(...h.center));l.divideScalar(o.meshes.length)}this.controls.target.copy(l),this.camera.position.copy(l).addScaledVector(c,-qy).add(new k(0,Yy,0)),this.controls.update()}}function lv({name:o,built:l,visible:c,controls:h,onStatus:u}){let d=s(null),[f,p]=n(null),[m,g]=n(null);return i(()=>{let x=new hh(d.current);return x.setHover(g),p(x),()=>{x.dispose(),p(null)}},[]),i(()=>{f?.show(c)},[f,c]),i(()=>{f?.setControls(h)},[f,h]),i(()=>{f?.open(o,u)},[f,o,l,u]),e("div",{id:"scene",className:Ta.scene,hidden:!c,children:[t("div",{className:Ta.view,ref:d}),t(Mh,{hovered:m})]})}export{lv as default};
