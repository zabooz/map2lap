import{o,i,l,s,n,d,c,r,a,t,e,h,u,f}from"./chunk-d3pbw9dp.js";var al={scene:"scene_u4kRgA",view:"view_u4kRgA"};var Mu=1,Eu=2,Tu=4,gg=(p)=>(p.shiftKey?Mu:0)+(p.ctrlKey?Eu:0)+(p.altKey?Tu:0);function _g(p){return{shift:p.shiftKey,ctrl:p.ctrlKey&&!p.altKey,alt:p.altKey&&!p.ctrlKey,ctrlAlt:p.ctrlKey&&p.altKey}}function uo(){let[p,m]=n(0);return i(()=>{let g=(v)=>m(gg(v)),_=()=>m(0),x=["keydown","keyup","pointermove"];for(let v of x)window.addEventListener(v,g);return window.addEventListener("blur",_),()=>{for(let v of x)window.removeEventListener(v,g);window.removeEventListener("blur",_)}},[]),_g({shiftKey:(p&Mu)>0,ctrlKey:(p&Eu)>0,altKey:(p&Tu)>0})}var Un={options:"options_IcC4dw",controls:"controls_IcC4dw",title:"title_IcC4dw",place:"place_IcC4dw",key:"key_IcC4dw",held:"held_IcC4dw",number:"number_IcC4dw",on:"on_IcC4dw",value:"value_IcC4dw",note:"note_IcC4dw"};var Cn=(p,m)=>()=>{m(),p.focus()},ll=[{keys:"Shift",held:"shift"},{keys:"Ctrl",held:"ctrl"},{keys:"Alt",held:"alt"},{keys:"Ctrl+Alt",held:"ctrlAlt"}];function vg({keys:p,held:m,children:g}){return e("span",{className:`${Un.place}${m?` ${Un.held}`:""}`,children:[t("kbd",{className:Un.key,"aria-hidden":"true",children:p}),g]})}function Ri({id:p,title:m,note:g,options:_=[],actions:x}){let v=uo();return e("div",{id:p,className:Un.options,"data-tool-options":"",children:[e("div",{className:Un.controls,children:[t("b",{className:Un.title,children:m}),_.map((y,S)=>t(vg,{keys:ll[S].keys,held:v[ll[S].held],children:y},ll[S].keys)),x]}),g&&t("span",{className:Un.note,children:g})]})}function wu({label:p,hint:m,value:g}){return e("span",{className:Un.number,title:m,children:[p," ",t("b",{className:Un.value,children:g})]})}function pr({id:p,label:m,hint:g,onClick:_}){return t("button",{type:"button",id:p,title:g,onClick:_,children:m})}function cl({label:p,on:m,hint:g,onClick:_}){return t("button",{type:"button",className:m?Un.on:"","aria-pressed":m,title:g,onClick:_,children:p})}function En({label:p,unit:m,hint:g,value:_,min:x,max:v,step:y,onChange:S}){return e("label",{className:Un.number,title:g,children:[p," ",t("input",{type:"number",min:x,max:v,step:y,value:_,onChange:(b)=>S(b.target.valueAsNumber||0)})," ",m]})}var yg=3,Sg=60;function Au({band:p,smoothing:m}){let g=p.points.length;return t(Ri,{id:g?"edit-band":"edit-road-hint",title:m?"Smooth":"Mark road",note:g===0?"Click the road where the stretch begins.":g===1?"A is set: click B further along the road (Esc drops it).":`${m?"Enter takes it, Esc drops it.":"Marked: choose a tool for it, Esc drops it."} A click on the road adds a pin: drag it, right-click takes it away.`,options:m&&p.line?[t(En,{label:"Strength",unit:"%",hint:"From short waves only, the hills stay, up to a calm line from A to B (Shift + wheel)",min:0,max:100,step:5,value:p.strength,onChange:p.setStrength}),t(En,{label:"Width",unit:"m",hint:"How wide the band is: at first the road's own (Ctrl + wheel)",min:yg,max:Sg,value:Math.round(p.width),onChange:(_)=>p.setWidth(_||null)})]:[]})}var hl=2,ul=500,dl=0.5,fl=10,pl=100,bg=5,Mg=25,Eg=0.1,$i=(p,m,g,_,x)=>Math.min(x,Math.max(_,Math.round((p+m*Math.max(g,p*Eg))/g)*g)),Tg=(p)=>`${p} ${p===1?"object stands":"objects stand"} at the edge of it and stayed where ${p===1?"it is":"they are"}: its place lies outside.`;function Ru({view:p,edits:m,url:g,enabled:_,colour:x,turnedColour:v,body:y,onNote:S}){let[b,M]=n(bg),[T,w]=n(Mg);i(()=>{p.setBrush(_?{radius:b,colour:x,turnedColour:v}:null)},[p,_,b,x,v]),i(()=>()=>p.setBrush(null),[p]);let E=(R,P)=>({samples:R,base:m.boundRevision(),radius:b,soft:T/100,...y(P)}),A=l((R,P)=>{let L=E(R,P);m.inTurn(async()=>{let U=await r(g,L),N=U.error||!U.height?U.error??"no answer":m.canEdit()?null:"this track can't be changed now";if(N)return p.dropPreview(),S(`Not changed: ${N}`);m.addHeight(U.height),S(U.standing?Tg(U.standing):null)})}),C=l(async(R,P)=>{let L=await fetch(`${g}/preview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(E(R,P))}).catch(()=>null);if(!L)return null;if(L.ok)return L.arrayBuffer().catch(()=>null);return String((await L.json().catch(()=>null))?.error??L.status)}),D=l((R)=>S(`Not changed: ${R}`));return i(()=>(p.setStroke((R,P)=>A(R,P),(R,P)=>C(R,P),(R)=>D(R)),()=>p.setStroke(()=>{},()=>Promise.resolve(null),()=>{})),[p]),{radius:b,soft:T,setRadius:M,setSoft:w}}var wg=50,ml=10,Pu=300,Iu=10,Ag=3,gl=1.5,Lu=100,Nu=0.5,Rg=20,Cg=0.2777777777777778,Cu="This track has no route to go along";function Du({view:p,enabled:m,onNote:g}){let[_,x]=n(!1),[v,y]=n(null),[S,b]=n(wg),[M,T]=n(Ag);return i(()=>{p.setRide(S*Cg,M)},[p,S,M]),i(()=>(p.setRideWatch(x,y),()=>{p.stopRide(),p.setRideWatch(()=>{},()=>{})}),[p]),i(()=>{if(m)p.tellRideMetre();else p.stopRide()},[p,m]),{moving:_,metre:v,speed:S,height:M,setSpeed:b,setHeight:T,toggle:()=>g(p.toggleRide()?null:Cu),wheel:(w,E)=>{if(w==="shift")g(p.rideBy(E*Rg)?null:Cu);else if(w==="ctrl")T((A)=>$i(A,E,Nu,gl,Lu));else if(w==="alt")b((A)=>$i(A,E,Iu,ml,Pu))}}}function Uu({camera:p,view:m}){return t(Ri,{id:"edit-camera-set",title:"Camera",note:"Shift + wheel goes along the track from the place nearest the camera. W A S D or the mouse leave it, Esc ends it.",options:[t(wu,{label:"Along the track",hint:"How far along the track it is (Shift + wheel: forwards, backwards)",value:p.metre===null?"no route":`${Math.round(p.metre)} m`}),t(En,{label:"Height",unit:"m",hint:"How far above the ground it goes along the track (Ctrl + wheel)",min:gl,max:Lu,step:Nu,value:p.height,onChange:(g)=>p.setHeight(Math.max(gl,g))}),t(En,{label:"Speed",unit:"km/h",hint:"How fast Ride goes (Alt + wheel)",min:ml,max:Pu,step:Iu,value:p.speed,onChange:(g)=>p.setSpeed(Math.max(ml,g))})],actions:e(a,{children:[t(pr,{id:"edit-ride",label:p.moving?"Pause":"Ride",hint:"It rides along the track by itself from where it is",onClick:Cn(m,p.toggle)}),t(pr,{id:"edit-home",label:"Reset",hint:"Back to the first view, behind the start (Home)",onClick:Cn(m,()=>m.home())})]})})}var gr={x:0,y:0,z:0,turn:0,scale:1};var Ou=(p,m,g)=>Math.min(g,Math.max(m,p)),mr=(p,m)=>Math.round(p*10**m)/10**m,fo=(p)=>({id:p,...gr}),Fu=(p)=>!p.x&&!p.y&&!p.z&&!p.turn&&p.scale===1;function po(p,m){let g=p.x+(m.x??0),_=p.z+(m.z??0),x=Math.hypot(g,_);if(x>1000)[g,_]=[g*1000/x,_*1000/x];let v=(p.turn+(m.turn??0))%360;if(v>180)v-=360;if(v<=-180)v+=360;return{id:p.id,x:mr(g,3),y:mr(Ou(p.y+(m.y??0),-100,100),3),z:mr(_,3),turn:mr(v,2),scale:mr(Ou(p.scale*(m.scale??1),0.1,10),4)}}function Bu(p,m){return{x:m.x-p.x,y:m.y-p.y,z:m.z-p.z,turn:m.turn-p.turn,scale:m.scale/p.scale}}function _l(p,m,g,_,x,v){let y=v.turn*Math.PI/180,S=Math.cos(y),b=Math.sin(y),[M,T,w]=x;for(let E=0;E<g.length;E++){let A=E*_,C=g[E]*_;m.set(p.subarray(A,A+_),C);let D=(p[A]-M)*v.scale,R=(p[A+1]-T)*v.scale,P=(p[A+2]-w)*v.scale;m[C]=M+S*D+b*P+v.x,m[C+1]=T+R+v.y,m[C+2]=w-b*D+S*P+v.z;for(let L of[3,8]){let U=p[A+L],N=p[A+L+2];m[C+L]=S*U+b*N,m[C+L+2]=-b*U+S*N}}}var Pg=400,Ig=5000,Lg=200,Ng=60000,Dg=64,Ug=1000,Og="This track was changed elsewhere: another tab or a build.",ku="This track was built again: the view shows the build before.",xl={removed:[],sorts:[],objectSorts:[],heights:[],placed:[]},Qn=(p,m)=>{let g=new Set(p),_=new Set(m);return g.size===_.size&&[...g].every((x)=>_.has(x))},mo=(p)=>p.map((m)=>[m.id,m.x,m.y,m.z,m.turn,m.scale].join(" "));function go(p){let m=p.recipe;return!!m&&Qn(p.removed.map((g)=>g.id),m.deleted)&&Qn(p.sorts,m.sorts)&&Qn(p.objectSorts,m.objectSorts)&&Qn(p.heights.map((g)=>g.id),m.heights)&&Qn(mo(p.placed),mo(m.placed))}var _r=null,Fg=(p,m)=>Qn(p.removed.map((g)=>g.id),m.removed.map((g)=>g.id))&&Qn(p.sorts,m.sorts)&&Qn(p.objectSorts,m.objectSorts)&&Qn(p.heights.map((g)=>g.id),m.heights.map((g)=>g.id))&&Qn(mo(p.placed),mo(m.placed));class vl{now={...xl,keptRevision:0,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];joining=null;listeners=new Set;url;send;name;constructor(p,m=(g,_)=>fetch(g,_)){this.name=p,this.url=`/api/editor/${encodeURIComponent(p)}/edits`,this.send=m}markSaved(){let p=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:p.removed.map((m)=>m.id),sorts:p.sorts,objectSorts:p.objectSorts,heights:p.heights.map((m)=>m.id),placed:p.placed}})}inTurn(p){return this.turns=this.turns.then(p).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(p){this.onMeshes=p}handOver(p){_r={name:p,edits:this.edits(),past:this.past,future:this.future}}subscribe=(p)=>(this.listeners.add(p),()=>{this.listeners.delete(p)});state=()=>this.now;set(p){this.now={...this.now,...p};for(let m of this.listeners)m()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(p){this.held=p,this.set({})}bind(p){this.bound=p,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:ku});else if(this.now.error===ku)this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let p=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let m=await this.send(this.url),g=await m.json();if(p!==this.asked)return;if(!m.ok)throw Error(g.error??`${m.status}`);this.base=g.base,this.revision=g.revision;let _={removed:g.deleted,sorts:g.sorts??[],objectSorts:g.object_sorts??[],heights:g.heights??[],placed:g.placed??[]},x=_r?.name===this.name&&Fg(_r.edits,_)?_r:null;_r=null,this.past=x?.past??[],this.future=x?.future??[],this.onServer=_,this.unanswered=[];let v=g.saved,y=v?{at:v.at,deleted:v.deleted,sorts:v.sorts,objectSorts:v.object_sorts,heights:v.heights??[],placed:v.placed??[]}:null;this.set({..._,keptRevision:g.revision,recipe:y,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:g.outdated,save:"saved"}),this.compare()}catch(m){if(p===this.asked)this.set({save:"stuck",error:m.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((p)=>setTimeout(p,50));return this.isSaved()?this.revision:null}saveNow(p=!1){clearTimeout(this.timer),this.flush(p)}remove(p){let m=new Set(this.now.removed.map((g)=>g.id));this.change({...this.edits(),removed:[...this.now.removed,...p.filter((g)=>!m.has(g.id))]})}removeSort(p){if(!this.now.sorts.includes(p))this.change({...this.edits(),sorts:[...this.now.sorts,p]})}removeObjectSort(p){if(!this.now.objectSorts.includes(p))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,p]})}addHeight(p){this.change({...this.edits(),heights:[...this.now.heights,p]})}place(p,m){let g=new Set(p.map((v)=>v.id)),_=performance.now(),x=[...this.now.placed.filter((v)=>!g.has(v.id)),...p.filter((v)=>!Fu(v))];if(!!m&&this.joining?.key===m&&_-this.joining.at<Ug&&this.past.length>0&&this.canEdit())this.past.pop();this.change({...this.edits(),placed:x},m?{key:m,at:_}:null)}placementOf(p){return this.now.placed.find((m)=>m.id===p)}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0||this.now.placed.length>0}discard(){if(this.changed())this.change(xl)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights,placed:this.now.placed}}discardOutdated(){this.onServer=null,this.set({outdated:0,...xl}),this.saveNow()}undo(){if(!this.canEdit())return;this.joining=null;let p=this.past.pop();if(!p)return;this.future.push(this.edits()),this.apply(p)}redo(){if(!this.canEdit())return;this.joining=null;let p=this.future.pop();if(!p)return;this.past.push(this.edits()),this.apply(p)}change(p,m=null){if(!this.canEdit())return;if(this.joining=m,this.past.push(this.edits()),this.past.length>Lg)this.past.shift();this.future=[],this.apply(p)}apply(p){let m=p.heights===this.now.heights&&p.placed===this.now.placed?Pg:0;this.set({...p,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),m)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights&&this.now.placed===this.onServer?.placed}async flush(p=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!p||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let m=this.edits(),g=++this.sent,_=`${Date.now()}-${g}-${Math.random().toString(36).slice(2,10)}`,x=JSON.stringify({base:this.bound,revision:this.revision,deleted:m.removed,sorts:m.sorts,object_sorts:m.objectSorts,heights:m.heights,placed:m.placed,id:_,unanswered:this.unanswered.map((v)=>v.id)});this.unanswered=[...this.unanswered,{id:_,number:g}].slice(-Dg),this.sending=!0,this.set({save:"saving"});try{let v=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:x,keepalive:p&&x.length<Ng}),y=await v.json().catch(()=>({}));if(g>=this.sent)this.sending=!1;if(g<this.answered)return;if([400,404,409,413].includes(v.status))return this.sending=!1,this.set({save:"stuck",error:v.status===409?Og:y.error??`${v.status}`});if(!v.ok)throw Error(y.error??`${v.status}`);if(this.answered=g,this.revision=y.revision,this.onServer=m,this.unanswered=this.unanswered.filter((S)=>S.number>g),this.onMeshes(y.meshes??[],y.revision),this.set({keptRevision:y.revision}),!this.isSaved())return void this.flush(p);if(!this.sending)this.set({save:"saved",error:null})}catch(v){if(g>=this.sent)this.sending=!1;if(this.set({save:"failed",error:v.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),Ig)}}}var yn={notes:"notes_L1L6kQ",line:"line_L1L6kQ"};function yl(p){let m={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[g,,_],radius:x}of p)m.minX=Math.min(m.minX,g-x),m.maxX=Math.max(m.maxX,g+x),m.minZ=Math.min(m.minZ,_-x),m.maxZ=Math.max(m.maxZ,_+x);return p.length?m:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function Sl(p,m){let g=new Map(p.map((_)=>[_,Math.hypot(_.center[0]-m[0],_.center[1]-m[1],_.center[2]-m[2])-_.radius]));return[...p].sort((_,x)=>g.get(x)-g.get(_))}function _o(p,m,g){return p+m<=g*1073741824}function zu(p,m){return Math.round(p*m*4*2.333333333333333)}function Hu(p,m){return[Math.floor(p/256),Math.floor(-m/256)]}function xo(p,m,g){if(p.length<2)return null;let _=1/0,x=0,v=0;for(let y=0;y+1<p.length;y++){let[S,b]=p[y],M=p[y+1][0]-S,T=p[y+1][1]-b,w=M*M+T*T,E=Math.sqrt(w),A=w?Math.min(1,Math.max(0,((m-S)*M+(g-b)*T)/w)):0,C=Math.hypot(m-(S+A*M),g-(b+A*T));if(C<_)_=C,x=v+A*E;v+=E}return{metre:x,off:_}}function Gu([p,m],g,_,x){let v=Math.PI/180,y=g,S=-x,b=_,M=Math.sin(p*v),T=Math.cos(p*v),w=Math.sin(m*v),E=Math.cos(m*v),A=6378137/Math.sqrt(1-0.0066943799901413165*M*M),C=A*T*E-w*y-M*E*S+T*E*b,D=A*T*w+E*y-M*w*S+T*w*b,R=A*0.9933056200098587*M+T*S+M*b,P=Math.hypot(C,D),L=Math.atan2(R,P*0.9933056200098587);for(let U=0;U<5;U++){let N=Math.sin(L);L=Math.atan2(R+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*N*N))*N,P)}return[L/v,Math.atan2(D,C)/v]}function xr(p,m){return Math.floor((m+p)/8)}function vo(p,m,g){return[Math.max(0,p*8-m),Math.min(g,(p+1)*8-m)]}var kg={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},yo=(p)=>kg[p]??p,zg={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},Ji=(p)=>zg[p]??yo(p),Vu=new Set(["house"]),vr=(p,m)=>p.sorts?.[m]??p.kinds[m];function bl(p,m){let g=[];if(!m.size)return g;for(let[_,x]of Object.entries(p))x.kinds.forEach((v,y)=>{if(m.has(vr(x,y)))g.push(`${_}#${y}`)});return g}function Wu(p,m){let g=new Set,_=[...p];while(_.length){let x=_.pop();if(g.has(x))continue;g.add(x),_.push(...m.get(x)??[])}return g}function Xu(p,m,g){let _=0;for(let[x,v]of Object.entries(p))v.kinds.forEach((y,S)=>{if(vr(v,S)===m&&v.faces[S].length&&!g.has(`${x}#${S}`))_++});return _}function qu(p){let m=new Map;for(let[g,_]of Object.entries(p)){_.parents.forEach((x,v)=>{if(x<0)return;let y=`${g}#${x}`;if(!m.has(y))m.set(y,[]);m.get(y).push(`${g}#${v}`)});for(let[x,v]of Object.entries(_.with??{})){let y=`${g}#${x}`;m.set(y,[...m.get(y)??[],...v])}}return m}function Yu(p){let m=new Map;for(let[g,_]of Object.entries(p))_.faces.forEach((x,v)=>{for(let[y,S,b]of x){if(!m.has(y))m.set(y,[]);m.get(y).push({from:S,end:S+b,id:`${g}#${v}`})}});for(let g of m.values())g.sort((_,x)=>_.from-x.from);return m}function Zu(p,m){let g=0,_=(p?.length??0)-1;while(g<=_){let x=g+_>>1,v=p[x];if(m<v.from)_=x-1;else if(m>=v.end)g=x+1;else return v.id}return null}function Ml(p,m,g){let _=Math.floor((m-Math.floor(m))*p.cols),x=Math.floor((g-Math.floor(g))*p.rows);return p.sprites[x*p.cols+_]??null}var Hg=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],Gg=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function $u(p){return Hg.find(([m])=>m.test(p))?.[1]??"Unknown"}function Ju(p){return Gg.find(([m])=>m.test(p))?.[1]??p}var Vg=(p)=>`${p} ${p===1?"object":"objects"} deleted`,Wg=(p)=>`${p} height ${p===1?"change":"changes"}`,Xg=(p)=>`${p} ${p===1?"object":"objects"} moved`;function Ku({state:p,edits:m,view:g,note:_,viewFailed:x,saveFailed:v,markedName:y,picked:S,sort:b,reopen:M,readAgain:T}){let w=(A)=>Cn(g,A),E=S?.all.length??0;return e("div",{id:"edit-notes",className:yn.notes,children:[p.save==="failed"&&t("p",{id:"edit-kept",className:yn.line,children:"Changes not kept: trying again"}),_&&t("p",{id:"edit-tool-note",className:yn.line,children:_}),x&&e("p",{id:"edit-view-failed",className:yn.line,children:["The view doesn't show the last change, it is kept all the same: ",x," ",t("button",{type:"button",onClick:w(M),children:"Load again"})]}),p.heights.length>0&&t("p",{id:"edit-heights",className:yn.line,children:Wg(p.heights.length)}),p.placed.length>0&&t("p",{id:"edit-placed",className:yn.line,children:Xg(p.placed.length)}),p.removed.length>0&&t("p",{id:"edit-count",className:yn.line,children:Vg(p.removed.length)}),(p.sorts.length>0||p.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:yn.line,children:["All deleted: ",[...p.sorts,...p.objectSorts.map(Ji)].join(", ")]}),y&&e("p",{id:"edit-marked",className:yn.line,children:["All ",y," marked: X or Delete deletes them all, Esc ends it."]}),E>1&&!y&&e("p",{id:"edit-picked",className:yn.line,children:[E," objects picked: X or Delete deletes them all."]}),S&&E<2&&!y&&e("p",{id:"edit-picked",className:yn.line,children:[S.kind,S.sprite&&` · ${S.sprite}`,b&&Ji(b)!==S.kind&&` · ${Ji(b)}`,!S.id&&(S.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),v&&t("p",{id:"edit-made",className:yn.line,children:v}),p.outdated>0&&e("p",{id:"edit-outdated",className:yn.line,children:[p.outdated," older ",p.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",p.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:w(()=>m.discardOutdated()),children:"Give up"})]}),p.save==="stuck"&&e("p",{id:"edit-stuck",className:yn.line,children:[p.error," ",t("button",{type:"button",onClick:w(T),children:"Read again"})]})]})}var ju=10,qg=5,ed=1,nd=1e4,Qu="#ff8a1f",td="#2f8bff",Yg=5;function id({name:p,view:m,edits:g,enabled:_,speed:x,onNote:v}){let[y,S]=n(qg),[b,M]=n(!1),T=Ru({view:m,edits:g,url:`/api/editor/${encodeURIComponent(p)}/brush`,enabled:_,onNote:v,colour:b?td:Qu,turnedColour:b?Qu:td,body:(w)=>({mm:Math.round(y*ju)*(b!==w?-1:1),speed:Math.round(x*ju)})});return{...T,height:y,lower:b,setHeight:S,setLower:M,wheel:(w,E)=>{if(w==="ctrl")T.setRadius((A)=>$i(A,E,dl,hl,ul));else if(w==="alt")S((A)=>$i(A,E,1,ed,nd));else if(w==="ctrlAlt")T.setSoft((A)=>$i(A,E,Yg,fl,pl))}}}function sd({elevation:p,view:m}){let{shift:g}=uo();return t(Ri,{id:"edit-elevation-set",title:"Elevation",options:[e(a,{children:[t(cl,{label:"Raise",on:p.lower===g,hint:"It raises the ground (Shift: the other way)",onClick:Cn(m,()=>p.setLower(!1))}),t(cl,{label:"Lower",on:p.lower!==g,hint:"It lowers the ground (Shift: the other way)",onClick:Cn(m,()=>p.setLower(!0))})]}),t(En,{label:"Radius",unit:"m",hint:"How far it reaches, the ring on the ground (Ctrl + wheel)",min:hl,max:ul,step:dl,value:p.radius,onChange:p.setRadius}),t(En,{label:"Height",unit:"cm",hint:"How far one click moves the ground, at its middle (Alt + wheel)",min:ed,max:nd,value:p.height,onChange:p.setHeight}),t(En,{label:"Soft edge",unit:"%",hint:"How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge (Ctrl + Alt + wheel)",min:fl,max:pl,step:10,value:p.soft,onChange:p.setSoft})]})}var rd=5,od=0.1,Zg=1.05,El=100,ad=100;function ld({view:p,edits:m,state:g,enabled:_,picked:x,onNote:v}){let y=_?(x?.all??[]).map((A)=>A.id).filter((A)=>p.canMove(A)):[],S=(A)=>m.placementOf(A)??fo(A),b=y.length?S(x?.id&&y.includes(x.id)?x.id:y[0]):fo(""),M=(A,C)=>{if(!y.length||!m.canEdit())return;let D=y.map((R)=>A(S(R)));D.forEach((R,P)=>p.nudge([y[P]],Bu(S(y[P]),R))),m.place(D,C&&`${C} ${y.join()}`)},T=l((A,C,D)=>{if(m.canEdit())m.place(A.map((R)=>po(S(R),{x:C,z:D})));v(null)});i(()=>(p.setMove(_,(A,C,D)=>T(A,C,D)),()=>p.setMove(!1,()=>{})),[p,_]),i(()=>{p.setPlaced(g.placed)},[p,g.placed]);let w=(A,C)=>M((D)=>po(D,A),C),E=(A,C)=>M((D)=>po({...D,[A]:C},{}));return{ids:y,shown:b,setTurn:(A)=>E("turn",A),setHeight:(A)=>E("y",A/El),setSize:(A)=>E("scale",A/ad),reset:()=>{if(y.length&&m.canEdit())m.place(y.map(fo))},wheel:(A,C)=>{if(!y.length)return v("Pick an object first: click it, Shift + click adds more");if(A==="shift")w({turn:C*rd},"turn");else if(A==="ctrl")w({y:C*od},"height");else if(A==="alt")w({scale:Zg**C},"size")}}}function cd({move:p,view:m}){let g=!p.ids.length;return t(Ri,{id:"edit-move-set",title:"Move",note:g?"Click an object to pick it, drag it to move it; Shift + click adds more.":void 0,options:[t(En,{label:"Turn",unit:"°",hint:"How far it is turned from how it was built, counter-clockwise (Shift + wheel)",min:-180,max:180,step:rd,value:p.shown.turn,onChange:p.setTurn}),t(En,{label:"Height",unit:"cm",hint:"How far it is raised from where it was built (Ctrl + wheel)",min:-1e4,max:1e4,step:od*El,value:Math.round(p.shown.y*El),onChange:p.setHeight}),t(En,{label:"Size",unit:"%",hint:"Its size, against how it was built (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(p.shown.scale*ad),onChange:(_)=>p.setSize(Math.max(10,_))})],actions:t(pr,{id:"edit-move-reset",label:"Reset",hint:"Back where and as it was built",onClick:Cn(m,p.reset)})})}var Tl=20;function hd(p,m,g){let _=0,x=1/0;return p.forEach(([v,,y],S)=>{let b=(v-m)**2+(y-g)**2;if(b<x)x=b,_=S}),_}function ud(p,m,g,_){return p.slice(1).some(([x,,v],y)=>{let[S,,b]=p[y],M=x-S,T=v-b,w=Math.max(0,Math.min(1,((g-S)*M+(_-b)*T)/(M*M+T*T||1)));return Math.hypot(g-S-w*M,_-b-w*T)<=m/2})}function dd(p,m,g,_){if(p.length<2)return[...p,[g,_]];if(!m?.length)return[...p.slice(0,-1),[g,_],p[p.length-1]];let x=hd(m,g,_);if(x===0)return[[g,_],...p];if(x===m.length-1)return[...p,[g,_]];let v=p.findIndex(([y,S])=>hd(m,y,S)>x);return v<0?[...p,[g,_]]:[...p.slice(0,v),[g,_],...p.slice(v)]}var Ki={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function Jg(p,m){for(let g=1;;g++){let _=`${p} (copy${g>1?` ${g}`:""})`;if(!m.includes(_))return _}}function fd({title:p,taken:m,canOverwrite:g,onOverwrite:_,onSaveNew:x,onCancel:v}){let[y,S]=n(p),b=y.trim(),M=b===p,T=!b?"Give it a name.":!M&&m.includes(b)?`Another track is called “${b}” already.`:null,w=M?Jg(p,m):b;return i(()=>{let E=(A)=>{if(A.key==="Escape")v()};return document.addEventListener("keydown",E),()=>document.removeEventListener("keydown",E)},[v]),t("div",{id:"save-back",className:Ki.back,onMouseDown:(E)=>{if(E.target===E.currentTarget)v()},children:e("form",{id:"save-dialog",className:Ki.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(E)=>{if(E.preventDefault(),!T)x(w)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:Ki.field,children:["Name",t("input",{id:"save-name",type:"text",value:y,maxLength:80,autoFocus:!0,onChange:(E)=>S(E.target.value)})]}),t("p",{id:"save-taken",className:Ki.note,children:T??`Save as new track makes “${w}”. Whatever you delete can be brought back later.`}),e("div",{className:Ki.buttons,children:[t("button",{type:"button",onClick:v,children:"Cancel"}),t("button",{type:"button",disabled:!M||!g,onClick:_,children:"Overwrite"}),t("button",{type:"submit",className:Ki.primary,disabled:!!T,children:"Save as new track"})]})]})})}var On={tools:"tools_oZyV8A",fileButtons:"fileButtons_oZyV8A",group:"group_oZyV8A",title:"title_oZyV8A",row:"row_oZyV8A",split:"split_oZyV8A",on:"on_oZyV8A",picker:"picker_oZyV8A",key:"key_oZyV8A"};var Al=(p)=>p.removed.length>0||p.sorts.length>0||p.objectSorts.length>0||p.heights.length>0||p.placed.length>0,wl=(p)=>!Al(p)&&!p.recipe,jg=(p)=>new Date(p*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function pd({name:p,edits:m,state:g,view:_,onSaved:x}){let[v,y]=n(null),[S,b]=n({busy:!1,text:null}),{starting:M,play:T}=f(),w=go(g),E=wl(g),A=m.canEdit()&&!S.busy&&!w&&!E,C=async(D=null)=>{y(null),b({busy:!0,text:null}),await m.settled(),m.hold(!0),m.saveNow();let R=await m.saved();if(R===null)return m.hold(!1),b({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let P=await r(`/api/editor/${encodeURIComponent(p)}/save`,{copy:D!==null,title:D,revision:R});if(m.hold(!1),P.error||!P.name)return b({busy:!1,text:`Not saved: ${P.error??"no answer"}`}),null;if(b({busy:!1,text:null}),D!==null)m.handOver(P.name);else m.markSaved();return x(P.name),P.name};return{asking:v,canSave:A,starting:M,busy:S.busy,failed:S.text,savedText:S.busy?"Saving …":w?`Saved ${jg(g.recipe.at)}`:E?"":"Not saved",canPlay:!M&&!S.busy&&g.save!=="loading"&&(w||E||A),saveAs:()=>y({play:!1}),chosen:async(D)=>{_.focus();let R=v?.play,P=await C(D);if(P&&R)T(P)},cancel:o(()=>{y(null),_.focus()},[_]),save:async()=>{await m.settled();let D=m.state();if(!m.canEdit()||S.busy||go(D)||wl(D))return;if(D.recipe)C();else y({play:!1})},drive:async()=>{await m.settled();let D=m.state();if(go(D)||wl(D))T(p);else if(!D.recipe)y({play:!0});else if(await C())T(p)}}}var Cl=[{tool:"select",group:"general",id:"edit-select",label:"Select",key:"V",hint:"Click an object to pick it, Shift + click adds more, X or Delete takes them out; a right click marks all of its sort (V)"},{tool:"camera",group:"general",id:"edit-camera",label:"Camera",key:"C",hint:"Go along the track by the wheel or riding by itself, back to the first view (C; Esc ends it)"},{tool:"road",group:"terrain",id:"edit-road",label:"Mark road",key:"R",hint:"Two clicks on the road mark a stretch of it, for Smooth; further clicks are pins (R; Esc ends it)"},{tool:"smooth",group:"terrain",id:"edit-smooth",label:"Smooth",key:"T",hint:"Even out a marked stretch of road: mark it first or after, it shows at once, Enter takes it (T; Esc ends it)"},{tool:"elevation",group:"terrain",id:"edit-elevation",label:"Elevation",key:"H",hint:"Raise or lower the ground: click, or hold and move (H; Esc ends it)"},{tool:"move",group:"objects",id:"edit-move",label:"Move",key:"M",hint:"Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},{tool:"delete",group:"objects",id:"edit-click-deletes",label:"Delete",key:"X",hint:"Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"}];function Rl({title:p,children:m}){return e("section",{className:On.group,children:[t("h3",{className:On.title,children:p}),m]})}function md({state:p,edits:m,view:g,saving:_}){let x=(v)=>Cn(g,v);return e("div",{className:`${On.tools} ${On.fileButtons}`,children:[e("div",{className:On.row,children:[e("span",{className:On.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!_.canSave,onClick:x(()=>void _.save()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!m.canEdit()||_.busy,onClick:_.saveAs,children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!_.canPlay,title:"Save if needed, then drive it in Assetto Corsa",onClick:x(()=>void _.drive()),children:_.starting?"Starting …":"▶ Play"})]}),t("button",{type:"button",disabled:!Al(p)||!m.canEdit()||_.busy,title:"Restore the track as built, taking back all Editor changes",onClick:x(()=>{if(confirm(`Discard all Editor changes and restore the track as built?

This includes previously saved edits. Save to apply it to Assetto Corsa; Undo brings the edits back.`))m.inTurn(()=>m.discard())}),children:"Discard all"})]})}function gd({state:p,edits:m,view:g,tool:_,onTool:x}){let v=m.canEdit(),y=(T)=>Cn(g,T),S=(T)=>T==="select"||T==="camera",b=v||S(_)?_:"select",M=(T)=>t("div",{className:On.picker,children:Cl.filter((w)=>w.group===T).map((w)=>e("button",{type:"button",id:w.id,className:b===w.tool?On.on:"","aria-pressed":b===w.tool,disabled:!v&&!S(w.tool),title:w.hint,onClick:y(()=>x(w.tool)),children:[w.label,t("span",{className:On.key,"aria-hidden":"true",children:w.key})]},w.tool))});return e("div",{id:"edit-bar",className:On.tools,"data-kept":p.save,children:[e(Rl,{title:"General",children:[e("div",{id:"edit-history",className:On.row,children:[t("button",{type:"button",disabled:!p.canUndo||!v,title:"Ctrl+Z",onClick:y(()=>void m.inTurn(()=>m.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!p.canRedo||!v,title:"Ctrl+Shift+Z",onClick:y(()=>void m.inTurn(()=>m.redo())),children:"↷ Redo"})]}),M("general")]}),t(Rl,{title:"Terrain",children:M("terrain")}),t(Rl,{title:"Objects",children:M("objects")})]})}var Qg=60,t_=1,_d=3,e_=60,n_=5;function xd({name:p,view:m,edits:g,enabled:_,previewing:x,revision:v,onNote:y}){let[S,b]=n([]),[M,T]=n([]),[w,E]=n(null),[A,C]=n(null),[D,R]=n(0),[P,L]=n(null),[U,N]=n(50),F=P??D,z=(H="")=>`/api/editor/${encodeURIComponent(p)}/band${H}`,I=()=>{b([]),T([]),E(null),C(null),L(null)};i(()=>{if(S.length<2||S===M)return;let H=!1;return r(z("/way"),{base:g.boundRevision(),points:S}).then((W)=>{if(H)return;if(W.error||!W.line){y(W.error??"No road found"),b((J)=>M.length?M:J.slice(0,1));return}T(S),E(W.line),R(W.width??0),C(null),y(null)}),()=>{H=!0}},[S,g]),i(()=>{if(S.length!==1||!_){m.setMarking(null);return}let H=!1,W=!1,J=null,G=(Q,it)=>{H=!0,r(z("/way"),{base:g.boundRevision(),points:[S[0],[Q,it]]}).then((tt)=>{if(H=!1,W)return;if(C(tt.line??null),J){let[pt,ot]=J;J=null,G(pt,ot)}})};return m.setMarking((Q,it)=>{if(H)J=[Q,it];else G(Q,it)}),()=>{W=!0,m.setMarking(null)}},[m,S,_,g]),i(()=>{let H=S.length?[[S[0][0],m.heightOfGround(S[0][0],S[0][1]),S[0][1]]]:null;return m.drawBand(w??A??H,w||A?F||_d:0),()=>m.drawBand(null,0)},[m,S,w,A,F]),i(()=>(m.drawPins(_?S.map(([H,W])=>[H,m.heightOfGround(H,W),W]):[]),()=>m.drawPins([])),[m,S,_]);let O=l((H,W,J)=>{b(S.map((G,Q)=>Q===H?[W,J]:G)),y(null)}),V=l((H)=>{let W=S.filter((J,G)=>G!==H);if(b(W),W.length<2)T([]),E(null),C(null);y(null)});return i(()=>(m.setPinned((H,W,J)=>O(H,W,J),(H)=>V(H)),()=>m.setPinned(()=>{},()=>{})),[m]),i(()=>{if(!w||!x){m.takeBackPreview();return}let H=!1,W=(G)=>{if(H)return;m.takeBackPreview(),y(G)},J=setTimeout(()=>{fetch(z("/preview"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base:g.boundRevision(),points:M,width:F,strength:U/100})}).then(async(G)=>{if(H)return;if(G.ok){let Q=await G.arrayBuffer();if(!H)m.showPreview(Q)}else W(String((await G.json().catch(()=>null))?.error??G.status))}).catch(()=>W("No preview: the server does not answer"))},Qg);return()=>{H=!0,clearTimeout(J)}},[m,w,x,F,U,v,g]),{points:S,line:w,width:F,strength:U,clear:I,apply:()=>{if(!w)return!1;if(S!==M)return y("The way is still being found: press Enter again in a moment"),!0;let H={base:g.boundRevision(),points:M,width:F,strength:U/100};return m.keepPreview(),I(),g.inTurn(async()=>{let J=await g.saved()===null?{error:"the changes before it could not be kept"}:await r(z(),H);if(J.error||!("height"in J)||!J.height||!g.canEdit())return m.dropPreview(),y(`Not changed: ${J.error??"this track can't be changed now"}`);g.addHeight(J.height),y(J.standing?`${J.standing} objects at the edge of it stayed where they are: their places lie outside.`:null)}),!0},click:(H,W)=>{if(S.length>=Tl)return y(`A band has at most ${Tl} points`);b(dd(S,w,H,W)),y(null)},setWidth:L,setStrength:N,wheel:(H,W)=>{if(H==="shift")N((J)=>Math.min(100,Math.max(0,J+W*n_)));else if(H==="ctrl")L(Math.min(e_,Math.max(_d,Math.round(F)+W*t_)))}}}var Pl={back:"back_vaYpAg",menu:"menu_vaYpAg"};var vd=230,yd=160;function Sd({at:p,mark:m,canDelete:g,onSmooth:_,onMark:x,onDelete:v,onClose:y}){let S=p.x+vd>p.width?Math.max(0,p.x-vd):p.x,b=p.y+yd>p.height?Math.max(0,p.y-yd):p.y,M=(T)=>()=>{y(),T()};return t("div",{className:Pl.back,onPointerDown:(T)=>{if(T.target===T.currentTarget)y()},onContextMenu:(T)=>T.preventDefault(),children:e("div",{id:"view-menu",className:Pl.menu,role:"menu",style:{left:S,top:b},children:[_&&t("button",{type:"button",role:"menuitem",onClick:M(_),children:"Smooth"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Edit…"}),m&&t("button",{type:"button",role:"menuitem",onClick:M(x),children:m}),t("button",{type:"button",role:"menuitem",disabled:!g,onClick:M(v),children:"Delete"})]})})}function bd({name:p,title:m,taken:g,view:_,scene:x,fileHost:v,savedHost:y,toolsHost:S,notesHost:b,elevationSpeed:M,reopen:T,onSaved:w}){let[E]=n(()=>new vl(p)),A=d(E.subscribe,E.state),[C,D]=n(null),[R,P]=n(null),[L,U]=n(null),[N,F]=n("select"),[z,I]=n(null),[O,V]=n(null),q=E.canEdit(),H=N==="elevation"&&q,W=N==="delete"&&q,J=(N==="road"||N==="smooth")&&q,G=N==="smooth"&&q,Q=N==="move"&&q,it=pd({name:p,edits:E,state:A,view:_,onSaved:w}),tt=id({name:p,view:_,edits:E,enabled:H,speed:M,onNote:I}),pt=xd({name:p,view:_,edits:E,enabled:J,previewing:G,revision:A.keptRevision,onNote:I}),ot=Du({view:_,enabled:N==="camera",onNote:I}),dt=ld({view:_,edits:E,state:A,enabled:Q,picked:C,onNote:I}),_t=l((xt)=>{if(J&&xt?.left)return _.unpick();if(D(xt),U(null),W&&xt?.id&&xt.left)E.remove([{id:xt.id,position:xt.position}]),_.unpick()}),Dt=l((xt)=>{if(!J)return;if(xt?.road)pt.click(xt.road[0],xt.road[1]);else if(!xt?.id)pt.clear()});i(()=>(_.setClicked((xt)=>Dt(xt)),()=>_.setClicked(()=>{})),[_]),i(()=>{_.setWheelTaken(pt.line!==null&&G||N==="camera"||Q)},[_,pt.line,G,N,Q]),i(()=>{_.setAdding((N==="select"||N==="camera"||N==="move")&&q)},[_,N,q]),i(()=>{if(N!=="road"&&N!=="smooth")pt.clear()},[N]),i(()=>{E.start();let xt=()=>E.saveNow(!0);return window.addEventListener("pagehide",xt),()=>{window.removeEventListener("pagehide",xt),E.stop()}},[E]),i(()=>(_.setPick((xt)=>_t(xt)),_.setMenu(P),_.setIndexed((xt)=>E.bind(xt)),()=>{_.setPick(()=>{}),_.setMenu(()=>{}),_.setIndexed(()=>{})}),[_,E]),i(()=>{_.setRemoved(A.removed.map((xt)=>xt.id),A.sorts,A.objectSorts)},[_,A.removed,A.sorts,A.objectSorts]),i(()=>(_.setMarked(L),()=>_.setMarked(null)),[_,L]),i(()=>(E.setOnMeshes((xt,Yt)=>_.refreshMeshes(xt,Yt)),_.setViewFailed(V),()=>{E.setOnMeshes(()=>{}),_.setViewFailed(()=>{})}),[_,E]);let at=l((xt,Yt)=>{if(N==="camera")ot.wheel(xt,Yt);else if(N==="move")dt.wheel(xt,Yt);else if(N==="smooth")pt.wheel(xt,Yt);else tt.wheel(xt,Yt)});i(()=>(_.setToolWheel((xt,Yt)=>at(xt,Yt)),()=>_.setToolWheel(()=>{})),[_]);let mt=async()=>{let xt=(ie)=>JSON.stringify([ie.heights.map((se)=>se.id),ie.placed]),Yt=xt(A);if(await E.start(),E.viewBehind()||xt(E.state())!==Yt)T()},At=C?.all??[],Ht=A.removed.map((xt)=>xt.id),Ft=C?.id&&C.sort&&!Vu.has(C.sort)?C.sort:null,Rt=C?.id&&C.sprite?C.sprite:null,ae=!R?null:Ft?`Mark all ${Ji(Ft)} (${_.countOfListed(Ft,Ht,A.objectSorts)})`:Rt?`Mark all ${Rt} (loaded: ${_.countOf(Rt)})`:null,Kt=()=>{if(!q)return;if(L){if(L.tree)E.removeSort(L.sort);else E.removeObjectSort(L.sort);U(null),_.unpick()}else if(At.length)E.remove(At),_.unpick()},Ut=(xt)=>F(N===xt?"select":xt),jt=o(()=>P(null),[]),qt=l((xt)=>{let Yt=xt.ctrlKey||xt.metaKey,ie=xt.key.toLowerCase();if(it.asking){if(Yt&&ie==="s")xt.preventDefault();return}if(xt.key!=="Escape"&&xt.key!=="Enter"&&xt.target.tagName==="INPUT")return;let se=Yt?void 0:Cl.find((pe)=>pe.key.toLowerCase()===ie);if(xt.key==="Delete")Kt();else if(xt.key==="Escape")P(null),U(null),_.cancelStroke(),_.unpick(),F("select"),_.focus();else if(xt.key==="Enter"&&G&&pt.apply())_.focus();else if((L||At.length)&&!Yt&&ie==="x")Kt();else if(se)Ut(se.tool);else if(xt.key==="Home")_.home();else if(Yt&&ie==="z")E.inTurn(()=>xt.shiftKey?E.redo():E.undo());else if(Yt&&ie==="y")E.inTurn(()=>E.redo());else if(Yt&&ie==="s")it.save();else return;xt.preventDefault()});i(()=>{let xt=[x.current,v,S,b],Yt=(ie)=>qt(ie);for(let ie of xt)ie?.addEventListener("keydown",Yt);return()=>{for(let ie of xt)ie?.removeEventListener("keydown",Yt)}},[x,v,S,b]);let ge=N==="road"&&!!pt.line&&!!C&&ud(pt.line,pt.width,C.position[0],C.position[2]);return e(a,{children:[v&&c(t(md,{state:A,edits:E,view:_,saving:it}),v),y&&c(it.savedText,y),S&&c(t(gd,{state:A,edits:E,view:_,tool:N,onTool:(xt)=>{Ut(xt),I(null)}}),S),b&&c(t(Ku,{state:A,edits:E,view:_,note:z,viewFailed:O,saveFailed:it.failed,picked:J&&!C?.id?null:C,sort:Ft,markedName:L&&(L.tree?L.sort:Ji(L.sort)),reopen:T,readAgain:()=>void mt()}),b),H&&t(sd,{elevation:tt,view:_}),J&&t(Au,{band:pt,smoothing:G}),N==="camera"&&t(Uu,{camera:ot,view:_}),Q&&t(cd,{move:dt,view:_}),R&&t(Sd,{at:R,mark:q?ae:null,canDelete:At.length>0&&q,onClose:jt,onSmooth:ge?()=>{F("smooth"),I(null),_.focus()}:null,onMark:()=>{U(Ft?{sort:Ft,tree:!1}:{sort:Rt,tree:!0}),_.focus()},onDelete:()=>{Kt(),_.focus()}}),it.asking&&t(fd,{title:m,taken:g,canOverwrite:it.canSave,onOverwrite:()=>void it.chosen(null),onSaveNew:(xt)=>void it.chosen(xt),onCancel:it.cancel})]})}var Md={box:"box_myLiyw"};var Pn=(p,m=2)=>p.toFixed(m);function je({label:p,children:m}){return e(a,{children:[t("dt",{children:p}),t("dd",{children:m})]})}function Ed({hovered:p}){if(!p)return null;let m=p.billboard;return e("div",{id:"hover-box",className:Md.box,children:[e("h4",{children:[p.kind,p.sprite&&` · ${p.sprite}`]}),e("dl",{children:[p.id&&t(je,{label:"ID",children:p.id}),m?.height!=null&&e(je,{label:"Height",children:[Pn(m.height,1)," m"]}),m?.width!=null&&e(je,{label:"Width",children:[Pn(m.width,1)," m"]}),m?.foot&&e(je,{label:"Stands at",children:[Pn(m.foot[0],1),", ",Pn(m.foot[1],1)]}),t(je,{label:"Mesh",children:p.object}),t(je,{label:"Physics",children:p.physics}),t(je,{label:"Material",children:p.material}),t(je,{label:"Shader",children:p.shader}),e(je,{label:"Texture",children:[p.texture??"none",p.textureBytes!==null&&` (${Math.ceil(p.textureBytes/1024)} KB)`]}),e(je,{label:"Size",children:[p.vertices," vertices, ",p.triangles," triangles"]}),t(je,{label:"Triangle",children:p.triangle}),p.uv&&e(je,{label:"UV",children:[Pn(p.uv[0],3),", ",Pn(p.uv[1],3)]}),e(je,{label:"Shown up to",children:[Math.round(p.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(je,{label:"AC x, y, z",children:[Pn(p.at[0]),", ",Pn(p.at[1]),", ",Pn(p.at[2])]}),e(je,{label:"Tile",children:[p.tile[0],", ",p.tile[1]]}),p.route&&e(je,{label:"Route",children:[Math.round(p.route.metre)," m, ",Pn(p.route.off,1)," m off"]}),p.latLon&&e(je,{label:"Lat, lon",children:[Pn(p.latLon[0],6),", ",Pn(p.latLon[1],6)]}),e(je,{label:"Camera",children:[Pn(p.distance,1)," m away"]})]}),!p.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var is="187";var cf=0,rc=1,hf=2;var Pr=1,uf=2,Hs=3,xi=0,fn=1,Bn=2,ss=0,Ir=1,oc=2,ac=3,lc=4,df=5;var Gs=100,ff=101,pf=102,mf=103,gf=104,_f=200,xf=201,vf=202,yf=203,Sf=204,bf=205,Mf=206,Ef=207,Tf=208,wf=209,Af=210,Rf=211,Cf=212,Pf=213,If=214,Lf=0,Nf=1,Df=2,cc=3,Uf=4,Of=5,Ff=6,Bf=7,kf=0,zf=1,Hf=2,ni=0,hc=1,uc=2,dc=3,fc=4,pc=5,mc=6,gc=7;var Lr=301,Vs=302,Jo=303,Ko=304,jo=1000,Qo=1001,Gf=1002,Ui=1003,Vf=1004;var Nr=1005;var An=1006,ta=1007;var Yn=1008;var Zn=1009,Wf=1010,Xf=1011,Dr=1012,_c=1013,Oi=1014,vi=1015,ii=1016,xc=1017,vc=1018,rs=1020,qf=35902,Yf=35899,Zf=1021,$f=1022,kn=1023,Ws=1026,Fi=1027,Jf=1028,yc=1029,os=1030,Sc=1031;var bc=1033,Xs=33776,ea=33777,qs=33778,Ys=33779,Mc=35840,Ec=35841,Tc=35842,wc=35843,Ur=36196,Ac=37492,Rc=37496,Cc=37488,Pc=37489,na=37490,Ic=37491,Lc=37808,Nc=37809,Dc=37810,Uc=37811,Oc=37812,Fc=37813,Bc=37814,kc=37815,zc=37816,Hc=37817,Gc=37818,Vc=37819,Wc=37820,Xc=37821,qc=36492,Or=36494,Fr=36495,Yc=36283,Zc=36284,ia=36285,$c=36286;var Jc=0,Kf=1,as="",sa="srgb",Kc="srgb-linear",jc="linear",Ce="srgb";var jf=512,Qf=513,tp=514,Qc=515,ep=516,np=517,th=518,eh=519;var nh="300 es",ih=2000;function r_(p){for(let m=p.length-1;m>=0;--m)if(p[m]>=65535)return!0;return!1}function o_(p){return ArrayBuffer.isView(p)&&!(p instanceof DataView)}function Rr(p){return document.createElementNS("http://www.w3.org/1999/xhtml",p)}function ip(){let p=Rr("canvas");return p.style.display="block",p}var Td={},ks=null;function Cr(...p){let m="THREE."+p.shift();if(ks)ks("log",m,...p);else console.log(m,...p)}function sp(p){let m=p[0];if(typeof m==="string"&&m.startsWith("TSL:")){let g=p[1];if(g&&g.isStackTrace)p[0]+=" "+g.getLocation();else p[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return p}function Xt(...p){p=sp(p);let m="THREE."+p.shift();if(ks)ks("warn",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.warn(g.getError(m));else console.warn(m,...p)}}function $t(...p){p=sp(p);let m="THREE."+p.shift();if(ks)ks("error",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.error(g.getError(m));else console.error(m,...p)}}function Tr(...p){let m=p.join(" ");if(m in Td)return;Td[m]=!0,Xt(...p)}function rp(p,m,g){return new Promise(function(_,x){function v(){switch(p.clientWaitSync(m,p.SYNC_FLUSH_COMMANDS_BIT,0)){case p.WAIT_FAILED:x();break;case p.TIMEOUT_EXPIRED:setTimeout(v,g);break;default:_()}}setTimeout(v,g)})}var op={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class yi{addEventListener(p,m){if(this._listeners===void 0)this._listeners={};let g=this._listeners;if(g[p]===void 0)g[p]=[];if(g[p].indexOf(m)===-1)g[p].push(m)}hasEventListener(p,m){let g=this._listeners;if(g===void 0)return!1;return g[p]!==void 0&&g[p].indexOf(m)!==-1}removeEventListener(p,m){let g=this._listeners;if(g===void 0)return;let _=g[p];if(_!==void 0){let x=_.indexOf(m);if(x!==-1)_.splice(x,1)}}dispatchEvent(p){let m=this._listeners;if(m===void 0)return;let g=m[p.type];if(g!==void 0){p.target=this;let _=g.slice(0);for(let x=0,v=_.length;x<v;x++)_[x].call(this,p);p.target=null}}}var hn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],wd=1234567,wr=Math.PI/180,zs=180/Math.PI;function Bi(){let p=Math.random()*4294967295|0,m=Math.random()*4294967295|0,g=Math.random()*4294967295|0,_=Math.random()*4294967295|0;return(hn[p&255]+hn[p>>8&255]+hn[p>>16&255]+hn[p>>24&255]+"-"+hn[m&255]+hn[m>>8&255]+"-"+hn[m>>16&15|64]+hn[m>>24&255]+"-"+hn[g&63|128]+hn[g>>8&255]+"-"+hn[g>>16&255]+hn[g>>24&255]+hn[_&255]+hn[_>>8&255]+hn[_>>16&255]+hn[_>>24&255]).toLowerCase()}function ne(p,m,g){return Math.max(m,Math.min(g,p))}function sh(p,m){return(p%m+m)%m}function a_(p,m,g,_,x){return _+(p-m)*(x-_)/(g-m)}function l_(p,m,g){if(p!==m)return(g-p)/(m-p);else return 0}function Ar(p,m,g){return(1-g)*p+g*m}function c_(p,m,g,_){return Ar(p,m,1-Math.exp(-g*_))}function h_(p,m=1){return m-Math.abs(sh(p,m*2)-m)}function u_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*(3-2*p)}function d_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*p*(p*(p*6-15)+10)}function f_(p,m){return p+Math.floor(Math.random()*(m-p+1))}function p_(p,m){return p+Math.random()*(m-p)}function m_(p){return p*(0.5-Math.random())}function g_(p){if(p!==void 0)wd=p;let m=wd+=1831565813;return m=Math.imul(m^m>>>15,m|1),m^=m+Math.imul(m^m>>>7,m|61),((m^m>>>14)>>>0)/4294967296}function __(p){return p*wr}function x_(p){return p*zs}function v_(p){return p>0&&Number.isInteger(p)&&2**Math.round(Math.log2(p))===p}function y_(p){return Math.pow(2,Math.ceil(Math.log(p)/Math.LN2))}function rh(p){return Math.pow(2,Math.floor(Math.log(p)/Math.LN2))}function S_(p,m,g,_,x){let{cos:v,sin:y}=Math,S=v(g/2),b=y(g/2),M=v((m+_)/2),T=y((m+_)/2),w=v((m-_)/2),E=y((m-_)/2),A=v((_-m)/2),C=y((_-m)/2);switch(x){case"XYX":p.set(S*T,b*w,b*E,S*M);break;case"YZY":p.set(b*E,S*T,b*w,S*M);break;case"ZXZ":p.set(b*w,b*E,S*T,S*M);break;case"XZX":p.set(S*T,b*C,b*A,S*M);break;case"YXY":p.set(b*A,S*T,b*C,S*M);break;case"ZYZ":p.set(b*C,b*A,S*T,S*M);break;default:Xt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+x)}}function ra(p){switch(p.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function oh(p,m){if(m.constructor===Float32Array)return p;let g=ra(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(p/g,-1)}function ah(p,m){if(m.constructor===Float32Array)return p;let g=ra(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(p*g)}var Si={DEG2RAD:wr,RAD2DEG:zs,generateUUID:Bi,clamp:ne,euclideanModulo:sh,mapLinear:a_,inverseLerp:l_,lerp:Ar,damp:c_,pingpong:h_,smoothstep:u_,smootherstep:d_,randInt:f_,randFloat:p_,randFloatSpread:m_,seededRandom:g_,degToRad:__,radToDeg:x_,isPowerOfTwo:v_,ceilPowerOfTwo:y_,floorPowerOfTwo:rh,setQuaternionFromProperEuler:S_,normalize:ah,denormalize:oh};class Jt{static{this.prototype.isVector2=!0}constructor(p=0,m=0){this.x=p,this.y=m}get width(){return this.x}set width(p){this.x=p}get height(){return this.y}set height(p){this.y=p}set(p,m){return this.x=p,this.y=m,this}setScalar(p){return this.x=p,this.y=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;default:throw Error("THREE.Vector2: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y)}copy(p){return this.x=p.x,this.y=p.y,this}add(p){return this.x+=p.x,this.y+=p.y,this}addScalar(p){return this.x+=p,this.y+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this}subScalar(p){return this.x-=p,this.y-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this}multiply(p){return this.x*=p.x,this.y*=p.y,this}multiplyScalar(p){return this.x*=p,this.y*=p,this}divide(p){return this.x/=p.x,this.y/=p.y,this}divideScalar(p){return this.multiplyScalar(1/p)}applyMatrix3(p){let m=this.x,g=this.y,_=p.elements;return this.x=_[0]*m+_[3]*g+_[6],this.y=_[1]*m+_[4]*g+_[7],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this}clamp(p,m){return this.x=ne(this.x,p.x,m.x),this.y=ne(this.y,p.y,m.y),this}clampScalar(p,m){return this.x=ne(this.x,p,m),this.y=ne(this.y,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ne(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(p){return this.x*p.x+this.y*p.y}cross(p){return this.x*p.y-this.y*p.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(ne(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y;return m*m+g*g}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this}equals(p){return p.x===this.x&&p.y===this.y}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this}rotateAround(p,m){let g=Math.cos(m),_=Math.sin(m),x=this.x-p.x,v=this.y-p.y;return this.x=x*g-v*_+p.x,this.y=x*_+v*g+p.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class bi{constructor(p=0,m=0,g=0,_=1){this.isQuaternion=!0,this._x=p,this._y=m,this._z=g,this._w=_}static slerpFlat(p,m,g,_,x,v,y){let S=g[_+0],b=g[_+1],M=g[_+2],T=g[_+3],w=x[v+0],E=x[v+1],A=x[v+2],C=x[v+3];if(T!==C||S!==w||b!==E||M!==A){let D=S*w+b*E+M*A+T*C;if(D<0)w=-w,E=-E,A=-A,C=-C,D=-D;let R=1-y;if(D<0.9995){let P=Math.acos(D),L=Math.sin(P);R=Math.sin(R*P)/L,y=Math.sin(y*P)/L,S=S*R+w*y,b=b*R+E*y,M=M*R+A*y,T=T*R+C*y}else{S=S*R+w*y,b=b*R+E*y,M=M*R+A*y,T=T*R+C*y;let P=1/Math.sqrt(S*S+b*b+M*M+T*T);S*=P,b*=P,M*=P,T*=P}}p[m]=S,p[m+1]=b,p[m+2]=M,p[m+3]=T}static multiplyQuaternionsFlat(p,m,g,_,x,v){let y=g[_],S=g[_+1],b=g[_+2],M=g[_+3],T=x[v],w=x[v+1],E=x[v+2],A=x[v+3];return p[m]=y*A+M*T+S*E-b*w,p[m+1]=S*A+M*w+b*T-y*E,p[m+2]=b*A+M*E+y*w-S*T,p[m+3]=M*A-y*T-S*w-b*E,p}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get w(){return this._w}set w(p){this._w=p,this._onChangeCallback()}set(p,m,g,_){return this._x=p,this._y=m,this._z=g,this._w=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(p){return this._x=p.x,this._y=p.y,this._z=p.z,this._w=p.w,this._onChangeCallback(),this}setFromEuler(p,m=!0){let{_x:g,_y:_,_z:x,_order:v}=p,{cos:y,sin:S}=Math,b=y(g/2),M=y(_/2),T=y(x/2),w=S(g/2),E=S(_/2),A=S(x/2);switch(v){case"XYZ":this._x=w*M*T+b*E*A,this._y=b*E*T-w*M*A,this._z=b*M*A+w*E*T,this._w=b*M*T-w*E*A;break;case"YXZ":this._x=w*M*T+b*E*A,this._y=b*E*T-w*M*A,this._z=b*M*A-w*E*T,this._w=b*M*T+w*E*A;break;case"ZXY":this._x=w*M*T-b*E*A,this._y=b*E*T+w*M*A,this._z=b*M*A+w*E*T,this._w=b*M*T-w*E*A;break;case"ZYX":this._x=w*M*T-b*E*A,this._y=b*E*T+w*M*A,this._z=b*M*A-w*E*T,this._w=b*M*T+w*E*A;break;case"YZX":this._x=w*M*T+b*E*A,this._y=b*E*T+w*M*A,this._z=b*M*A-w*E*T,this._w=b*M*T-w*E*A;break;case"XZY":this._x=w*M*T-b*E*A,this._y=b*E*T-w*M*A,this._z=b*M*A+w*E*T,this._w=b*M*T+w*E*A;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+v)}if(m===!0)this._onChangeCallback();return this}setFromAxisAngle(p,m){let g=m/2,_=Math.sin(g);return this._x=p.x*_,this._y=p.y*_,this._z=p.z*_,this._w=Math.cos(g),this._onChangeCallback(),this}setFromRotationMatrix(p){let m=p.elements,g=m[0],_=m[4],x=m[8],v=m[1],y=m[5],S=m[9],b=m[2],M=m[6],T=m[10],w=g+y+T;if(w>0){let E=0.5/Math.sqrt(w+1);this._w=0.25/E,this._x=(M-S)*E,this._y=(x-b)*E,this._z=(v-_)*E}else if(g>y&&g>T){let E=2*Math.sqrt(1+g-y-T);this._w=(M-S)/E,this._x=0.25*E,this._y=(_+v)/E,this._z=(x+b)/E}else if(y>T){let E=2*Math.sqrt(1+y-g-T);this._w=(x-b)/E,this._x=(_+v)/E,this._y=0.25*E,this._z=(S+M)/E}else{let E=2*Math.sqrt(1+T-g-y);this._w=(v-_)/E,this._x=(x+b)/E,this._y=(S+M)/E,this._z=0.25*E}return this._onChangeCallback(),this}setFromUnitVectors(p,m){let g=p.dot(m)+1;if(g<0.00000001)if(g=0,Math.abs(p.x)>Math.abs(p.z))this._x=-p.y,this._y=p.x,this._z=0,this._w=g;else this._x=0,this._y=-p.z,this._z=p.y,this._w=g;else this._x=p.y*m.z-p.z*m.y,this._y=p.z*m.x-p.x*m.z,this._z=p.x*m.y-p.y*m.x,this._w=g;return this.normalize()}angleTo(p){return 2*Math.acos(Math.abs(ne(this.dot(p),-1,1)))}rotateTowards(p,m){let g=this.angleTo(p);if(g===0)return this;let _=Math.min(1,m/g);return this.slerp(p,_),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(p){return this._x*p._x+this._y*p._y+this._z*p._z+this._w*p._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let p=this.length();if(p===0)this._x=0,this._y=0,this._z=0,this._w=1;else p=1/p,this._x=this._x*p,this._y=this._y*p,this._z=this._z*p,this._w=this._w*p;return this._onChangeCallback(),this}multiply(p){return this.multiplyQuaternions(this,p)}premultiply(p){return this.multiplyQuaternions(p,this)}multiplyQuaternions(p,m){let{_x:g,_y:_,_z:x,_w:v}=p,{_x:y,_y:S,_z:b,_w:M}=m;return this._x=g*M+v*y+_*b-x*S,this._y=_*M+v*S+x*y-g*b,this._z=x*M+v*b+g*S-_*y,this._w=v*M-g*y-_*S-x*b,this._onChangeCallback(),this}slerp(p,m){let{_x:g,_y:_,_z:x,_w:v}=p,y=this.dot(p);if(y<0)g=-g,_=-_,x=-x,v=-v,y=-y;let S=1-m;if(y<0.9995){let b=Math.acos(y),M=Math.sin(b);S=Math.sin(S*b)/M,m=Math.sin(m*b)/M,this._x=this._x*S+g*m,this._y=this._y*S+_*m,this._z=this._z*S+x*m,this._w=this._w*S+v*m,this._onChangeCallback()}else this._x=this._x*S+g*m,this._y=this._y*S+_*m,this._z=this._z*S+x*m,this._w=this._w*S+v*m,this.normalize();return this}slerpQuaternions(p,m,g){return this.copy(p).slerp(m,g)}random(){let p=2*Math.PI*Math.random(),m=2*Math.PI*Math.random(),g=Math.random(),_=Math.sqrt(1-g),x=Math.sqrt(g);return this.set(_*Math.sin(p),_*Math.cos(p),x*Math.sin(m),x*Math.cos(m))}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._w===this._w}fromArray(p,m=0){return this._x=p[m],this._y=p[m+1],this._z=p[m+2],this._w=p[m+3],this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._w,p}fromBufferAttribute(p,m){return this._x=p.getX(m),this._y=p.getY(m),this._z=p.getZ(m),this._w=p.getW(m),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Y{static{this.prototype.isVector3=!0}constructor(p=0,m=0,g=0){this.x=p,this.y=m,this.z=g}set(p,m,g){if(g===void 0)g=this.z;return this.x=p,this.y=m,this.z=g,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;default:throw Error("THREE.Vector3: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this}multiplyVectors(p,m){return this.x=p.x*m.x,this.y=p.y*m.y,this.z=p.z*m.z,this}applyEuler(p){return this.applyQuaternion(Ad.setFromEuler(p))}applyAxisAngle(p,m){return this.applyQuaternion(Ad.setFromAxisAngle(p,m))}applyMatrix3(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[3]*g+x[6]*_,this.y=x[1]*m+x[4]*g+x[7]*_,this.z=x[2]*m+x[5]*g+x[8]*_,this}applyNormalMatrix(p){return this.applyMatrix3(p).normalize()}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=p.elements,v=1/(x[3]*m+x[7]*g+x[11]*_+x[15]);return this.x=(x[0]*m+x[4]*g+x[8]*_+x[12])*v,this.y=(x[1]*m+x[5]*g+x[9]*_+x[13])*v,this.z=(x[2]*m+x[6]*g+x[10]*_+x[14])*v,this}applyQuaternion(p){let m=this.x,g=this.y,_=this.z,{x,y:v,z:y,w:S}=p,b=2*(v*_-y*g),M=2*(y*m-x*_),T=2*(x*g-v*m);return this.x=m+S*b+v*T-y*M,this.y=g+S*M+y*b-x*T,this.z=_+S*T+x*M-v*b,this}project(p){return this.applyMatrix4(p.matrixWorldInverse).applyMatrix4(p.projectionMatrix)}unproject(p){return this.applyMatrix4(p.projectionMatrixInverse).applyMatrix4(p.matrixWorld)}transformDirection(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[4]*g+x[8]*_,this.y=x[1]*m+x[5]*g+x[9]*_,this.z=x[2]*m+x[6]*g+x[10]*_,this.normalize()}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this}divideScalar(p){return this.multiplyScalar(1/p)}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this}clamp(p,m){return this.x=ne(this.x,p.x,m.x),this.y=ne(this.y,p.y,m.y),this.z=ne(this.z,p.z,m.z),this}clampScalar(p,m){return this.x=ne(this.x,p,m),this.y=ne(this.y,p,m),this.z=ne(this.z,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ne(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this}cross(p){return this.crossVectors(this,p)}crossVectors(p,m){let{x:g,y:_,z:x}=p,{x:v,y,z:S}=m;return this.x=_*S-x*y,this.y=x*v-g*S,this.z=g*y-_*v,this}projectOnVector(p){let m=p.lengthSq();if(m===0)return this.set(0,0,0);let g=p.dot(this)/m;return this.copy(p).multiplyScalar(g)}projectOnPlane(p){return Il.copy(this).projectOnVector(p),this.sub(Il)}reflect(p){return this.sub(Il.copy(p).multiplyScalar(2*this.dot(p)))}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(ne(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y,_=this.z-p.z;return m*m+g*g+_*_}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)+Math.abs(this.z-p.z)}setFromSpherical(p){return this.setFromSphericalCoords(p.radius,p.phi,p.theta)}setFromSphericalCoords(p,m,g){let _=Math.sin(m)*p;return this.x=_*Math.sin(g),this.y=Math.cos(m)*p,this.z=_*Math.cos(g),this}setFromCylindrical(p){return this.setFromCylindricalCoords(p.radius,p.theta,p.y)}setFromCylindricalCoords(p,m,g){return this.x=p*Math.sin(m),this.y=g,this.z=p*Math.cos(m),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this}setFromMatrixScale(p){let m=this.setFromMatrixColumn(p,0).length(),g=this.setFromMatrixColumn(p,1).length(),_=this.setFromMatrixColumn(p,2).length();return this.x=m,this.y=g,this.z=_,this}setFromMatrixColumn(p,m){return this.fromArray(p.elements,m*4)}setFromMatrix3Column(p,m){return this.fromArray(p.elements,m*3)}setFromEuler(p){return this.x=p._x,this.y=p._y,this.z=p._z,this}setFromColor(p){return this.x=p.r,this.y=p.g,this.z=p.b,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let p=Math.random()*Math.PI*2,m=Math.random()*2-1,g=Math.sqrt(1-m*m);return this.x=g*Math.cos(p),this.y=m,this.z=g*Math.sin(p),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Il=new Y,Ad=new bi;class Qt{static{this.prototype.isMatrix3=!0}constructor(p,m,g,_,x,v,y,S,b){if(this.elements=[1,0,0,0,1,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,v,y,S,b)}set(p,m,g,_,x,v,y,S,b){let M=this.elements;return M[0]=p,M[1]=_,M[2]=y,M[3]=m,M[4]=x,M[5]=S,M[6]=g,M[7]=v,M[8]=b,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],this}extractBasis(p,m,g){return p.setFromMatrix3Column(this,0),m.setFromMatrix3Column(this,1),g.setFromMatrix3Column(this,2),this}setFromMatrix4(p){let m=p.elements;return this.set(m[0],m[4],m[8],m[1],m[5],m[9],m[2],m[6],m[10]),this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,v=g[0],y=g[3],S=g[6],b=g[1],M=g[4],T=g[7],w=g[2],E=g[5],A=g[8],C=_[0],D=_[3],R=_[6],P=_[1],L=_[4],U=_[7],N=_[2],F=_[5],z=_[8];return x[0]=v*C+y*P+S*N,x[3]=v*D+y*L+S*F,x[6]=v*R+y*U+S*z,x[1]=b*C+M*P+T*N,x[4]=b*D+M*L+T*F,x[7]=b*R+M*U+T*z,x[2]=w*C+E*P+A*N,x[5]=w*D+E*L+A*F,x[8]=w*R+E*U+A*z,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[3]*=p,m[6]*=p,m[1]*=p,m[4]*=p,m[7]*=p,m[2]*=p,m[5]*=p,m[8]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],v=p[4],y=p[5],S=p[6],b=p[7],M=p[8];return m*v*M-m*y*b-g*x*M+g*y*S+_*x*b-_*v*S}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],v=p[4],y=p[5],S=p[6],b=p[7],M=p[8],T=M*v-y*b,w=y*S-M*x,E=b*x-v*S,A=m*T+g*w+_*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0);let C=1/A;return p[0]=T*C,p[1]=(_*b-M*g)*C,p[2]=(y*g-_*v)*C,p[3]=w*C,p[4]=(M*m-_*S)*C,p[5]=(_*x-y*m)*C,p[6]=E*C,p[7]=(g*S-b*m)*C,p[8]=(v*m-g*x)*C,this}transpose(){let p,m=this.elements;return p=m[1],m[1]=m[3],m[3]=p,p=m[2],m[2]=m[6],m[6]=p,p=m[5],m[5]=m[7],m[7]=p,this}getNormalMatrix(p){return this.setFromMatrix4(p).invert().transpose()}transposeIntoArray(p){let m=this.elements;return p[0]=m[0],p[1]=m[3],p[2]=m[6],p[3]=m[1],p[4]=m[4],p[5]=m[7],p[6]=m[2],p[7]=m[5],p[8]=m[8],this}setUvTransform(p,m,g,_,x,v,y){let S=Math.cos(x),b=Math.sin(x);return this.set(g*S,g*b,-g*(S*v+b*y)+v+p,-_*b,_*S,-_*(-b*v+S*y)+y+m,0,0,1),this}scale(p,m){return Tr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ll.makeScale(p,m)),this}rotate(p){return Tr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ll.makeRotation(-p)),this}translate(p,m){return Tr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ll.makeTranslation(p,m)),this}makeTranslation(p,m){if(p.isVector2)this.set(1,0,p.x,0,1,p.y,0,0,1);else this.set(1,0,p,0,1,m,0,0,1);return this}makeRotation(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,g,m,0,0,0,1),this}makeScale(p,m){return this.set(p,0,0,0,m,0,0,0,1),this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<9;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<9;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p}clone(){return new this.constructor().fromArray(this.elements)}}var Ll=new Qt,Rd=new Qt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Cd=new Qt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function b_(){let p={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(x,v,y){if(this.enabled===!1||v===y||!v||!y)return x;if(this.spaces[v].transfer==="srgb")x.r=gi(x.r),x.g=gi(x.g),x.b=gi(x.b);if(this.spaces[v].primaries!==this.spaces[y].primaries)x.applyMatrix3(this.spaces[v].toXYZ),x.applyMatrix3(this.spaces[y].fromXYZ);if(this.spaces[y].transfer==="srgb")x.r=Fs(x.r),x.g=Fs(x.g),x.b=Fs(x.b);return x},workingToColorSpace:function(x,v){return this.convert(x,this.workingColorSpace,v)},colorSpaceToWorking:function(x,v){return this.convert(x,v,this.workingColorSpace)},getPrimaries:function(x){return this.spaces[x].primaries},getTransfer:function(x){if(x==="")return"linear";return this.spaces[x].transfer},getToneMappingMode:function(x){return this.spaces[x].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(x,v=this.workingColorSpace){return x.fromArray(this.spaces[v].luminanceCoefficients)},define:function(x){Object.assign(this.spaces,x)},_getMatrix:function(x,v,y){return x.copy(this.spaces[y].fromXYZ).multiply(this.spaces[v].toXYZ)},_getDrawingBufferColorSpace:function(x){return this.spaces[x].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(x=this.workingColorSpace){return this.spaces[x].workingColorSpaceConfig.unpackColorSpace}},m=[0.64,0.33,0.3,0.6,0.15,0.06],g=[0.2126,0.7152,0.0722],_=[0.3127,0.329];return p.define({["srgb-linear"]:{primaries:m,whitePoint:_,transfer:"linear",toXYZ:Rd,fromXYZ:Cd,luminanceCoefficients:g,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:m,whitePoint:_,transfer:"srgb",toXYZ:Rd,fromXYZ:Cd,luminanceCoefficients:g,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),p}var he=b_();function gi(p){return p<0.04045?p*0.0773993808:Math.pow(p*0.9478672986+0.0521327014,2.4)}function Fs(p){return p<0.0031308?p*12.92:1.055*Math.pow(p,0.41666)-0.055}var Ss;class lh{static getDataURL(p,m="image/png"){if(/^data:/i.test(p.src))return p.src;if(typeof HTMLCanvasElement>"u")return p.src;let g;if(p instanceof HTMLCanvasElement)g=p;else{if(Ss===void 0)Ss=Rr("canvas");Ss.width=p.width,Ss.height=p.height;let _=Ss.getContext("2d");if(p instanceof ImageData)_.putImageData(p,0,0);else _.drawImage(p,0,0,p.width,p.height);g=Ss}return g.toDataURL(m)}static sRGBToLinear(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap){let m=Rr("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d");g.drawImage(p,0,0,p.width,p.height);let _=g.getImageData(0,0,p.width,p.height),x=_.data;for(let v=0;v<x.length;v++)x[v]=gi(x[v]/255)*255;return g.putImageData(_,0,0),m}else if(p.data){let m=p.data.slice(0);for(let g=0;g<m.length;g++)if(m instanceof Uint8Array||m instanceof Uint8ClampedArray)m[g]=Math.floor(gi(m[g]/255)*255);else m[g]=gi(m[g]);return{data:m,width:p.width,height:p.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),p}}var M_=0;class Br{constructor(p=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:M_++}),this.uuid=Bi(),this.data=p,this.dataReady=!0,this.version=0}getSize(p){let m=this.data;if(typeof HTMLVideoElement<"u"&&m instanceof HTMLVideoElement)p.set(m.videoWidth,m.videoHeight,0);else if(typeof VideoFrame<"u"&&m instanceof VideoFrame)p.set(m.displayWidth,m.displayHeight,0);else if(m!==null)p.set(m.width||0,m.height||0,m.depth||0);else p.set(0,0,0);return p}set needsUpdate(p){if(p===!0)this.version++}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.images[this.uuid]!==void 0)return p.images[this.uuid];let g={uuid:this.uuid,url:""},_=this.data;if(_!==null){let x;if(Array.isArray(_)){x=[];for(let v=0,y=_.length;v<y;v++)if(_[v].isDataTexture)x.push(Nl(_[v].image));else x.push(Nl(_[v]))}else x=Nl(_);g.url=x}if(!m)p.images[this.uuid]=g;return g}}function Nl(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap)return lh.getDataURL(p);else if(p.data)return{data:Array.from(p.data),width:p.width,height:p.height,type:p.data.constructor.name};else return Xt("Texture: Unable to serialize Texture."),{}}var E_=0,Dl=new Y;class Ve extends yi{constructor(p=Ve.DEFAULT_IMAGE,m=Ve.DEFAULT_MAPPING,g=1001,_=1001,x=1006,v=1008,y=1023,S=1009,b=Ve.DEFAULT_ANISOTROPY,M=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:E_++}),this.uuid=Bi(),this.name="",this.source=new Br(p),this.mipmaps=[],this.mapping=m,this.channel=0,this.wrapS=g,this.wrapT=_,this.magFilter=x,this.minFilter=v,this.anisotropy=b,this.format=y,this.internalFormat=null,this.type=S,this.offset=new Jt(0,0),this.repeat=new Jt(1,1),this.center=new Jt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=M,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=p&&p.depth&&p.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Dl).x}get height(){return this.source.getSize(Dl).y}get depth(){return this.source.getSize(Dl).z}get image(){return this.source.data}set image(p){this.source.data=p}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(p){return this.name=p.name,this.source=p.source,this.mipmaps=p.mipmaps.slice(0),this.mapping=p.mapping,this.channel=p.channel,this.wrapS=p.wrapS,this.wrapT=p.wrapT,this.magFilter=p.magFilter,this.minFilter=p.minFilter,this.anisotropy=p.anisotropy,this.format=p.format,this.internalFormat=p.internalFormat,this.type=p.type,this.normalized=p.normalized,this.offset.copy(p.offset),this.repeat.copy(p.repeat),this.center.copy(p.center),this.rotation=p.rotation,this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrix.copy(p.matrix),this.generateMipmaps=p.generateMipmaps,this.mipmapsAutoUpdate=p.mipmapsAutoUpdate,this.premultiplyAlpha=p.premultiplyAlpha,this.flipY=p.flipY,this.unpackAlignment=p.unpackAlignment,this.colorSpace=p.colorSpace,this.renderTarget=p.renderTarget,this.isRenderTargetTexture=p.isRenderTargetTexture,this.isPMREMTexture=p.isPMREMTexture,this.isArrayTexture=p.isArrayTexture,this.userData=JSON.parse(JSON.stringify(p.userData)),this.needsUpdate=!0,this}setValues(p){for(let m in p){let g=p[m];if(g===void 0){Xt(`Texture.setValues(): parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Texture.setValues(): property '${m}' does not exist.`);continue}if(_&&g&&(_.isVector2&&g.isVector2))_.copy(g);else if(_&&g&&(_.isVector3&&g.isVector3))_.copy(g);else if(_&&g&&(_.isMatrix3&&g.isMatrix3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.textures[this.uuid]!==void 0)return p.textures[this.uuid];let g={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(p).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)g.userData=this.userData;if(!m)p.textures[this.uuid]=g;return g}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(p){if(this.mapping!==300)return p;if(p.applyMatrix3(this.matrix),p.x<0||p.x>1)switch(this.wrapS){case 1000:p.x=p.x-Math.floor(p.x);break;case 1001:p.x=p.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.x)%2)===1)p.x=Math.ceil(p.x)-p.x;else p.x=p.x-Math.floor(p.x);break}if(p.y<0||p.y>1)switch(this.wrapT){case 1000:p.y=p.y-Math.floor(p.y);break;case 1001:p.y=p.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.y)%2)===1)p.y=Math.ceil(p.y)-p.y;else p.y=p.y-Math.floor(p.y);break}if(this.flipY)p.y=1-p.y;return p}set needsUpdate(p){if(p===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(p){if(p===!0)this.pmremVersion++}}Ve.DEFAULT_IMAGE=null;Ve.DEFAULT_MAPPING=300;Ve.DEFAULT_ANISOTROPY=1;class Oe{static{this.prototype.isVector4=!0}constructor(p=0,m=0,g=0,_=1){this.x=p,this.y=m,this.z=g,this.w=_}get width(){return this.z}set width(p){this.z=p}get height(){return this.w}set height(p){this.w=p}set(p,m,g,_){return this.x=p,this.y=m,this.z=g,this.w=_,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this.w=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setW(p){return this.w=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;case 3:this.w=m;break;default:throw Error("THREE.Vector4: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this.w=p.w!==void 0?p.w:1,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this.w+=p.w,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this.w+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this.w=p.w+m.w,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this.w+=p.w*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this.w-=p.w,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this.w-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this.w=p.w-m.w,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this.w*=p.w,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this.w*=p,this}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=this.w,v=p.elements;return this.x=v[0]*m+v[4]*g+v[8]*_+v[12]*x,this.y=v[1]*m+v[5]*g+v[9]*_+v[13]*x,this.z=v[2]*m+v[6]*g+v[10]*_+v[14]*x,this.w=v[3]*m+v[7]*g+v[11]*_+v[15]*x,this}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this.w/=p.w,this}divideScalar(p){return this.multiplyScalar(1/p)}setAxisAngleFromQuaternion(p){this.w=2*Math.acos(p.w);let m=Math.sqrt(1-p.w*p.w);if(m<0.0001)this.x=1,this.y=0,this.z=0;else this.x=p.x/m,this.y=p.y/m,this.z=p.z/m;return this}setAxisAngleFromRotationMatrix(p){let m,g,_,x,v=0.01,y=0.1,S=p.elements,b=S[0],M=S[4],T=S[8],w=S[1],E=S[5],A=S[9],C=S[2],D=S[6],R=S[10];if(Math.abs(M-w)<0.01&&Math.abs(T-C)<0.01&&Math.abs(A-D)<0.01){if(Math.abs(M+w)<0.1&&Math.abs(T+C)<0.1&&Math.abs(A+D)<0.1&&Math.abs(b+E+R-3)<0.1)return this.set(1,0,0,0),this;m=Math.PI;let L=(b+1)/2,U=(E+1)/2,N=(R+1)/2,F=(M+w)/4,z=(T+C)/4,I=(A+D)/4;if(L>U&&L>N)if(L<0.01)g=0,_=0.707106781,x=0.707106781;else g=Math.sqrt(L),_=F/g,x=z/g;else if(U>N)if(U<0.01)g=0.707106781,_=0,x=0.707106781;else _=Math.sqrt(U),g=F/_,x=I/_;else if(N<0.01)g=0.707106781,_=0.707106781,x=0;else x=Math.sqrt(N),g=z/x,_=I/x;return this.set(g,_,x,m),this}let P=Math.sqrt((D-A)*(D-A)+(T-C)*(T-C)+(w-M)*(w-M));if(Math.abs(P)<0.001)P=1;return this.x=(D-A)/P,this.y=(T-C)/P,this.z=(w-M)/P,this.w=Math.acos((b+E+R-1)/2),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this.w=m[15],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this.w=Math.min(this.w,p.w),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this.w=Math.max(this.w,p.w),this}clamp(p,m){return this.x=ne(this.x,p.x,m.x),this.y=ne(this.y,p.y,m.y),this.z=ne(this.z,p.z,m.z),this.w=ne(this.w,p.w,m.w),this}clampScalar(p,m){return this.x=ne(this.x,p,m),this.y=ne(this.y,p,m),this.z=ne(this.z,p,m),this.w=ne(this.w,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ne(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z+this.w*p.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this.w+=(p.w-this.w)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this.w=p.w+(m.w-p.w)*g,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z&&p.w===this.w}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this.w=p[m+3],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p[m+3]=this.w,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this.w=p.getW(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ch extends yi{constructor(p=1,m=1,g={}){super();g=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},g),this.isRenderTarget=!0,this.width=p,this.height=m,this.depth=g.depth,this.scissor=new Oe(0,0,p,m),this.scissorTest=!1,this.viewport=new Oe(0,0,p,m),this.textures=[];let _=g.count;for(let x=0;x<_;x++)this.textures[x]=new Ve({width:p,height:m,depth:g.depth}),this.textures[x].isRenderTargetTexture=!0,this.textures[x].renderTarget=this;this._setTextureOptions(g),this.depthBuffer=g.depthBuffer,this.stencilBuffer=g.stencilBuffer,this.resolveColorBuffer=g.resolveColorBuffer,this.resolveDepthBuffer=g.resolveDepthBuffer,this.resolveStencilBuffer=g.resolveStencilBuffer,this.storeMultisampledColorBuffer=g.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=g.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=g.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=g.depthTexture,this.samples=g.samples,this.multiview=g.multiview,this.useArrayDepthTexture=g.useArrayDepthTexture}_setTextureOptions(p={}){let m={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(p.mapping!==void 0)m.mapping=p.mapping;if(p.wrapS!==void 0)m.wrapS=p.wrapS;if(p.wrapT!==void 0)m.wrapT=p.wrapT;if(p.wrapR!==void 0)m.wrapR=p.wrapR;if(p.magFilter!==void 0)m.magFilter=p.magFilter;if(p.minFilter!==void 0)m.minFilter=p.minFilter;if(p.format!==void 0)m.format=p.format;if(p.type!==void 0)m.type=p.type;if(p.anisotropy!==void 0)m.anisotropy=p.anisotropy;if(p.colorSpace!==void 0)m.colorSpace=p.colorSpace;if(p.flipY!==void 0)m.flipY=p.flipY;if(p.generateMipmaps!==void 0)m.generateMipmaps=p.generateMipmaps;if(p.mipmapsAutoUpdate!==void 0)m.mipmapsAutoUpdate=p.mipmapsAutoUpdate;if(p.internalFormat!==void 0)m.internalFormat=p.internalFormat;for(let g=0;g<this.textures.length;g++)this.textures[g].setValues(m)}get texture(){return this.textures[0]}set texture(p){this.textures[0]=p}set depthTexture(p){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(p!==null&&p.renderTarget===null)p.renderTarget=this;this._depthTexture=p}get depthTexture(){return this._depthTexture}setSize(p,m,g=1){if(this.width!==p||this.height!==m||this.depth!==g){this.width=p,this.height=m,this.depth=g;for(let _=0,x=this.textures.length;_<x;_++)if(this.textures[_].image.width=p,this.textures[_].image.height=m,this.textures[_].image.depth=g,this.textures[_].isData3DTexture!==!0)this.textures[_].isArrayTexture=this.textures[_].image.depth>1;this.dispose()}this.viewport.set(0,0,p,m),this.scissor.set(0,0,p,m)}clone(){return new this.constructor().copy(this)}copy(p){this.width=p.width,this.height=p.height,this.depth=p.depth,this.scissor.copy(p.scissor),this.scissorTest=p.scissorTest,this.viewport.copy(p.viewport),this.textures.length=0;for(let m=0,g=p.textures.length;m<g;m++){this.textures[m]=p.textures[m].clone(),this.textures[m].isRenderTargetTexture=!0,this.textures[m].renderTarget=this;let _=Object.assign({},p.textures[m].image);this.textures[m].source=new Br(_)}if(this.depthBuffer=p.depthBuffer,this.stencilBuffer=p.stencilBuffer,this.resolveColorBuffer=p.resolveColorBuffer,this.resolveDepthBuffer=p.resolveDepthBuffer,this.resolveStencilBuffer=p.resolveStencilBuffer,this.storeMultisampledColorBuffer=p.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=p.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=p.storeMultisampledStencilBuffer,p.depthTexture!==null)if(p.depthTexture.renderTarget===p){let m=p.depthTexture.clone();m.renderTarget=null,this.depthTexture=m}else this.depthTexture=p.depthTexture;else this.depthTexture=null;return this.samples=p.samples,this.multiview=p.multiview,this.useArrayDepthTexture=p.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class zn extends ch{constructor(p=1,m=1,g={}){super(p,m,g);this.isWebGLRenderTarget=!0}}class oa extends Ve{constructor(p=null,m=1,g=1,_=1){super(null);this.isDataArrayTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}addLayerUpdate(p){this.layerUpdates.add(p)}clearLayerUpdates(){this.layerUpdates.clear()}}class hh extends Ve{constructor(p=null,m=1,g=1,_=1){super(null);this.isData3DTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}}class re{static{this.prototype.isMatrix4=!0}constructor(p,m,g,_,x,v,y,S,b,M,T,w,E,A,C,D){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,v,y,S,b,M,T,w,E,A,C,D)}set(p,m,g,_,x,v,y,S,b,M,T,w,E,A,C,D){let R=this.elements;return R[0]=p,R[4]=m,R[8]=g,R[12]=_,R[1]=x,R[5]=v,R[9]=y,R[13]=S,R[2]=b,R[6]=M,R[10]=T,R[14]=w,R[3]=E,R[7]=A,R[11]=C,R[15]=D,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new re().fromArray(this.elements)}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],m[9]=g[9],m[10]=g[10],m[11]=g[11],m[12]=g[12],m[13]=g[13],m[14]=g[14],m[15]=g[15],this}copyPosition(p){let m=this.elements,g=p.elements;return m[12]=g[12],m[13]=g[13],m[14]=g[14],this}setFromMatrix3(p){let m=p.elements;return this.set(m[0],m[3],m[6],0,m[1],m[4],m[7],0,m[2],m[5],m[8],0,0,0,0,1),this}extractBasis(p,m,g){if(this.determinantAffine()===0)return p.set(1,0,0),m.set(0,1,0),g.set(0,0,1),this;return p.setFromMatrixColumn(this,0),m.setFromMatrixColumn(this,1),g.setFromMatrixColumn(this,2),this}makeBasis(p,m,g){return this.set(p.x,m.x,g.x,0,p.y,m.y,g.y,0,p.z,m.z,g.z,0,0,0,0,1),this}extractRotation(p){if(p.determinantAffine()===0)return this.identity();let m=this.elements,g=p.elements,_=1/bs.setFromMatrixColumn(p,0).length(),x=1/bs.setFromMatrixColumn(p,1).length(),v=1/bs.setFromMatrixColumn(p,2).length();return m[0]=g[0]*_,m[1]=g[1]*_,m[2]=g[2]*_,m[3]=0,m[4]=g[4]*x,m[5]=g[5]*x,m[6]=g[6]*x,m[7]=0,m[8]=g[8]*v,m[9]=g[9]*v,m[10]=g[10]*v,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromEuler(p){let m=this.elements,{x:g,y:_,z:x}=p,v=Math.cos(g),y=Math.sin(g),S=Math.cos(_),b=Math.sin(_),M=Math.cos(x),T=Math.sin(x);if(p.order==="XYZ"){let w=v*M,E=v*T,A=y*M,C=y*T;m[0]=S*M,m[4]=-S*T,m[8]=b,m[1]=E+A*b,m[5]=w-C*b,m[9]=-y*S,m[2]=C-w*b,m[6]=A+E*b,m[10]=v*S}else if(p.order==="YXZ"){let w=S*M,E=S*T,A=b*M,C=b*T;m[0]=w+C*y,m[4]=A*y-E,m[8]=v*b,m[1]=v*T,m[5]=v*M,m[9]=-y,m[2]=E*y-A,m[6]=C+w*y,m[10]=v*S}else if(p.order==="ZXY"){let w=S*M,E=S*T,A=b*M,C=b*T;m[0]=w-C*y,m[4]=-v*T,m[8]=A+E*y,m[1]=E+A*y,m[5]=v*M,m[9]=C-w*y,m[2]=-v*b,m[6]=y,m[10]=v*S}else if(p.order==="ZYX"){let w=v*M,E=v*T,A=y*M,C=y*T;m[0]=S*M,m[4]=A*b-E,m[8]=w*b+C,m[1]=S*T,m[5]=C*b+w,m[9]=E*b-A,m[2]=-b,m[6]=y*S,m[10]=v*S}else if(p.order==="YZX"){let w=v*S,E=v*b,A=y*S,C=y*b;m[0]=S*M,m[4]=C-w*T,m[8]=A*T+E,m[1]=T,m[5]=v*M,m[9]=-y*M,m[2]=-b*M,m[6]=E*T+A,m[10]=w-C*T}else if(p.order==="XZY"){let w=v*S,E=v*b,A=y*S,C=y*b;m[0]=S*M,m[4]=-T,m[8]=b*M,m[1]=w*T+C,m[5]=v*M,m[9]=E*T-A,m[2]=A*T-E,m[6]=y*M,m[10]=C*T+w}return m[3]=0,m[7]=0,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromQuaternion(p){return this.compose(T_,p,w_)}lookAt(p,m,g){let _=this.elements;if(In.subVectors(p,m),In.lengthSq()===0)In.z=1;if(In.normalize(),Ci.crossVectors(g,In),Ci.lengthSq()===0){if(Math.abs(g.z)===1)In.x+=0.0001;else In.z+=0.0001;In.normalize(),Ci.crossVectors(g,In)}return Ci.normalize(),So.crossVectors(In,Ci),_[0]=Ci.x,_[4]=So.x,_[8]=In.x,_[1]=Ci.y,_[5]=So.y,_[9]=In.y,_[2]=Ci.z,_[6]=So.z,_[10]=In.z,this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,v=g[0],y=g[4],S=g[8],b=g[12],M=g[1],T=g[5],w=g[9],E=g[13],A=g[2],C=g[6],D=g[10],R=g[14],P=g[3],L=g[7],U=g[11],N=g[15],F=_[0],z=_[4],I=_[8],O=_[12],V=_[1],q=_[5],H=_[9],W=_[13],J=_[2],G=_[6],Q=_[10],it=_[14],tt=_[3],pt=_[7],ot=_[11],dt=_[15];return x[0]=v*F+y*V+S*J+b*tt,x[4]=v*z+y*q+S*G+b*pt,x[8]=v*I+y*H+S*Q+b*ot,x[12]=v*O+y*W+S*it+b*dt,x[1]=M*F+T*V+w*J+E*tt,x[5]=M*z+T*q+w*G+E*pt,x[9]=M*I+T*H+w*Q+E*ot,x[13]=M*O+T*W+w*it+E*dt,x[2]=A*F+C*V+D*J+R*tt,x[6]=A*z+C*q+D*G+R*pt,x[10]=A*I+C*H+D*Q+R*ot,x[14]=A*O+C*W+D*it+R*dt,x[3]=P*F+L*V+U*J+N*tt,x[7]=P*z+L*q+U*G+N*pt,x[11]=P*I+L*H+U*Q+N*ot,x[15]=P*O+L*W+U*it+N*dt,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[4]*=p,m[8]*=p,m[12]*=p,m[1]*=p,m[5]*=p,m[9]*=p,m[13]*=p,m[2]*=p,m[6]*=p,m[10]*=p,m[14]*=p,m[3]*=p,m[7]*=p,m[11]*=p,m[15]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[12],v=p[1],y=p[5],S=p[9],b=p[13],M=p[2],T=p[6],w=p[10],E=p[14],A=p[3],C=p[7],D=p[11],R=p[15],P=S*E-b*w,L=y*E-b*T,U=y*w-S*T,N=v*E-b*M,F=v*w-S*M,z=v*T-y*M;return m*(C*P-D*L+R*U)-g*(A*P-D*N+R*F)+_*(A*L-C*N+R*z)-x*(A*U-C*F+D*z)}determinantAffine(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[1],v=p[5],y=p[9],S=p[2],b=p[6],M=p[10];return m*(v*M-y*b)-g*(x*M-y*S)+_*(x*b-v*S)}transpose(){let p=this.elements,m;return m=p[1],p[1]=p[4],p[4]=m,m=p[2],p[2]=p[8],p[8]=m,m=p[6],p[6]=p[9],p[9]=m,m=p[3],p[3]=p[12],p[12]=m,m=p[7],p[7]=p[13],p[13]=m,m=p[11],p[11]=p[14],p[14]=m,this}setPosition(p,m,g){let _=this.elements;if(p.isVector3)_[12]=p.x,_[13]=p.y,_[14]=p.z;else _[12]=p,_[13]=m,_[14]=g;return this}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],v=p[4],y=p[5],S=p[6],b=p[7],M=p[8],T=p[9],w=p[10],E=p[11],A=p[12],C=p[13],D=p[14],R=p[15],P=m*y-g*v,L=m*S-_*v,U=m*b-x*v,N=g*S-_*y,F=g*b-x*y,z=_*b-x*S,I=M*C-T*A,O=M*D-w*A,V=M*R-E*A,q=T*D-w*C,H=T*R-E*C,W=w*R-E*D,J=P*W-L*H+U*q+N*V-F*O+z*I;if(J===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let G=1/J;return p[0]=(y*W-S*H+b*q)*G,p[1]=(_*H-g*W-x*q)*G,p[2]=(C*z-D*F+R*N)*G,p[3]=(w*F-T*z-E*N)*G,p[4]=(S*V-v*W-b*O)*G,p[5]=(m*W-_*V+x*O)*G,p[6]=(D*U-A*z-R*L)*G,p[7]=(M*z-w*U+E*L)*G,p[8]=(v*H-y*V+b*I)*G,p[9]=(g*V-m*H-x*I)*G,p[10]=(A*F-C*U+R*P)*G,p[11]=(T*U-M*F-E*P)*G,p[12]=(y*O-v*q-S*I)*G,p[13]=(m*q-g*O+_*I)*G,p[14]=(C*L-A*N-D*P)*G,p[15]=(M*N-T*L+w*P)*G,this}scale(p){let m=this.elements,{x:g,y:_,z:x}=p;return m[0]*=g,m[4]*=_,m[8]*=x,m[1]*=g,m[5]*=_,m[9]*=x,m[2]*=g,m[6]*=_,m[10]*=x,m[3]*=g,m[7]*=_,m[11]*=x,this}getMaxScaleOnAxis(){let p=this.elements,m=p[0]*p[0]+p[1]*p[1]+p[2]*p[2],g=p[4]*p[4]+p[5]*p[5]+p[6]*p[6],_=p[8]*p[8]+p[9]*p[9]+p[10]*p[10];return Math.sqrt(Math.max(m,g,_))}makeTranslation(p,m,g){if(p.isVector3)this.set(1,0,0,p.x,0,1,0,p.y,0,0,1,p.z,0,0,0,1);else this.set(1,0,0,p,0,1,0,m,0,0,1,g,0,0,0,1);return this}makeRotationX(p){let m=Math.cos(p),g=Math.sin(p);return this.set(1,0,0,0,0,m,-g,0,0,g,m,0,0,0,0,1),this}makeRotationY(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,0,g,0,0,1,0,0,-g,0,m,0,0,0,0,1),this}makeRotationZ(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,0,g,m,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(p,m){let g=Math.cos(m),_=Math.sin(m),x=1-g,{x:v,y,z:S}=p,b=x*v,M=x*y;return this.set(b*v+g,b*y-_*S,b*S+_*y,0,b*y+_*S,M*y+g,M*S-_*v,0,b*S-_*y,M*S+_*v,x*S*S+g,0,0,0,0,1),this}makeScale(p,m,g){return this.set(p,0,0,0,0,m,0,0,0,0,g,0,0,0,0,1),this}makeShear(p,m,g,_,x,v){return this.set(1,g,x,0,p,1,v,0,m,_,1,0,0,0,0,1),this}compose(p,m,g){let _=this.elements,{_x:x,_y:v,_z:y,_w:S}=m,b=x+x,M=v+v,T=y+y,w=x*b,E=x*M,A=x*T,C=v*M,D=v*T,R=y*T,P=S*b,L=S*M,U=S*T,{x:N,y:F,z}=g;return _[0]=(1-(C+R))*N,_[1]=(E+U)*N,_[2]=(A-L)*N,_[3]=0,_[4]=(E-U)*F,_[5]=(1-(w+R))*F,_[6]=(D+P)*F,_[7]=0,_[8]=(A+L)*z,_[9]=(D-P)*z,_[10]=(1-(w+C))*z,_[11]=0,_[12]=p.x,_[13]=p.y,_[14]=p.z,_[15]=1,this}decompose(p,m,g){let _=this.elements;p.x=_[12],p.y=_[13],p.z=_[14];let x=this.determinantAffine();if(x===0)return g.set(1,1,1),m.identity(),this;let v=bs.set(_[0],_[1],_[2]).length(),y=bs.set(_[4],_[5],_[6]).length(),S=bs.set(_[8],_[9],_[10]).length();if(x<0)v=-v;Wn.copy(this);let b=1/v,M=1/y,T=1/S;return Wn.elements[0]*=b,Wn.elements[1]*=b,Wn.elements[2]*=b,Wn.elements[4]*=M,Wn.elements[5]*=M,Wn.elements[6]*=M,Wn.elements[8]*=T,Wn.elements[9]*=T,Wn.elements[10]*=T,m.setFromRotationMatrix(Wn),g.x=v,g.y=y,g.z=S,this}makePerspective(p,m,g,_,x,v,y=2000,S=!1){let b=this.elements,M=2*x/(m-p),T=2*x/(g-_),w=(m+p)/(m-p),E=(g+_)/(g-_),A,C;if(S)A=x/(v-x),C=v*x/(v-x);else if(y===2000)A=-(v+x)/(v-x),C=-2*v*x/(v-x);else if(y===2001)A=-v/(v-x),C=-v*x/(v-x);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+y);return b[0]=M,b[4]=0,b[8]=w,b[12]=0,b[1]=0,b[5]=T,b[9]=E,b[13]=0,b[2]=0,b[6]=0,b[10]=A,b[14]=C,b[3]=0,b[7]=0,b[11]=-1,b[15]=0,this}makeOrthographic(p,m,g,_,x,v,y=2000,S=!1){let b=this.elements,M=2/(m-p),T=2/(g-_),w=-(m+p)/(m-p),E=-(g+_)/(g-_),A,C;if(S)A=1/(v-x),C=v/(v-x);else if(y===2000)A=-2/(v-x),C=-(v+x)/(v-x);else if(y===2001)A=-1/(v-x),C=-x/(v-x);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+y);return b[0]=M,b[4]=0,b[8]=0,b[12]=w,b[1]=0,b[5]=T,b[9]=0,b[13]=E,b[2]=0,b[6]=0,b[10]=A,b[14]=C,b[3]=0,b[7]=0,b[11]=0,b[15]=1,this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<16;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<16;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p[m+9]=g[9],p[m+10]=g[10],p[m+11]=g[11],p[m+12]=g[12],p[m+13]=g[13],p[m+14]=g[14],p[m+15]=g[15],p}}var bs=new Y,Wn=new re,T_=new Y(0,0,0),w_=new Y(1,1,1),Ci=new Y,So=new Y,In=new Y,Pd=new re,Id=new bi;class _i{constructor(p=0,m=0,g=0,_=_i.DEFAULT_ORDER){this.isEuler=!0,this._x=p,this._y=m,this._z=g,this._order=_}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get order(){return this._order}set order(p){this._order=p,this._onChangeCallback()}set(p,m,g,_=this._order){return this._x=p,this._y=m,this._z=g,this._order=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(p){return this._x=p._x,this._y=p._y,this._z=p._z,this._order=p._order,this._onChangeCallback(),this}setFromRotationMatrix(p,m=this._order,g=!0){let _=p.elements,x=_[0],v=_[4],y=_[8],S=_[1],b=_[5],M=_[9],T=_[2],w=_[6],E=_[10];switch(m){case"XYZ":if(this._y=Math.asin(ne(y,-1,1)),Math.abs(y)<0.9999999)this._x=Math.atan2(-M,E),this._z=Math.atan2(-v,x);else this._x=Math.atan2(w,b),this._z=0;break;case"YXZ":if(this._x=Math.asin(-ne(M,-1,1)),Math.abs(M)<0.9999999)this._y=Math.atan2(y,E),this._z=Math.atan2(S,b);else this._y=Math.atan2(-T,x),this._z=0;break;case"ZXY":if(this._x=Math.asin(ne(w,-1,1)),Math.abs(w)<0.9999999)this._y=Math.atan2(-T,E),this._z=Math.atan2(-v,b);else this._y=0,this._z=Math.atan2(S,x);break;case"ZYX":if(this._y=Math.asin(-ne(T,-1,1)),Math.abs(T)<0.9999999)this._x=Math.atan2(w,E),this._z=Math.atan2(S,x);else this._x=0,this._z=Math.atan2(-v,b);break;case"YZX":if(this._z=Math.asin(ne(S,-1,1)),Math.abs(S)<0.9999999)this._x=Math.atan2(-M,b),this._y=Math.atan2(-T,x);else this._x=0,this._y=Math.atan2(y,E);break;case"XZY":if(this._z=Math.asin(-ne(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(w,b),this._y=Math.atan2(y,x);else this._x=Math.atan2(-M,E),this._y=0;break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+m)}if(this._order=m,g===!0)this._onChangeCallback();return this}setFromQuaternion(p,m,g){return Pd.makeRotationFromQuaternion(p),this.setFromRotationMatrix(Pd,m,g)}setFromVector3(p,m=this._order){return this.set(p.x,p.y,p.z,m)}reorder(p){return Id.setFromEuler(this),this.setFromQuaternion(Id,p)}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._order===this._order}fromArray(p){if(this._x=p[0],this._y=p[1],this._z=p[2],p[3]!==void 0)this._order=p[3];return this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._order,p}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}_i.DEFAULT_ORDER="XYZ";class kr{constructor(){this.mask=1}set(p){this.mask=(1<<p|0)>>>0}enable(p){this.mask|=1<<p|0}enableAll(){this.mask=-1}toggle(p){this.mask^=1<<p|0}disable(p){this.mask&=~(1<<p|0)}disableAll(){this.mask=0}test(p){return(this.mask&p.mask)!==0}isEnabled(p){return(this.mask&(1<<p|0))!==0}}var A_=0,Ld=new Y,Ms=new bi,hi=new re,bo=new Y,yr=new Y,R_=new Y,C_=new bi,Nd=new Y(1,0,0),Dd=new Y(0,1,0),Ud=new Y(0,0,1),Od={type:"added"},P_={type:"removed"},Es={type:"childadded",child:null},Ul={type:"childremoved",child:null};class Xe extends yi{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:A_++}),this.uuid=Bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xe.DEFAULT_UP.clone();let p=new Y,m=new _i,g=new bi,_=new Y(1,1,1);function x(){g.setFromEuler(m,!1)}function v(){m.setFromQuaternion(g,void 0,!1)}m._onChange(x),g._onChange(v),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:p},rotation:{configurable:!0,enumerable:!0,value:m},quaternion:{configurable:!0,enumerable:!0,value:g},scale:{configurable:!0,enumerable:!0,value:_},modelViewMatrix:{value:new re},normalMatrix:{value:new Qt}}),this.matrix=new re,this.matrixWorld=new re,this.matrixAutoUpdate=Xe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new kr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(p),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(p){return this.quaternion.premultiply(p),this}setRotationFromAxisAngle(p,m){this.quaternion.setFromAxisAngle(p,m)}setRotationFromEuler(p){this.quaternion.setFromEuler(p,!0)}setRotationFromMatrix(p){this.quaternion.setFromRotationMatrix(p)}setRotationFromQuaternion(p){this.quaternion.copy(p)}rotateOnAxis(p,m){return Ms.setFromAxisAngle(p,m),this.quaternion.multiply(Ms),this}rotateOnWorldAxis(p,m){return Ms.setFromAxisAngle(p,m),this.quaternion.premultiply(Ms),this}rotateX(p){return this.rotateOnAxis(Nd,p)}rotateY(p){return this.rotateOnAxis(Dd,p)}rotateZ(p){return this.rotateOnAxis(Ud,p)}translateOnAxis(p,m){return Ld.copy(p).applyQuaternion(this.quaternion),this.position.add(Ld.multiplyScalar(m)),this}translateX(p){return this.translateOnAxis(Nd,p)}translateY(p){return this.translateOnAxis(Dd,p)}translateZ(p){return this.translateOnAxis(Ud,p)}localToWorld(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(this.matrixWorld)}worldToLocal(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(hi.copy(this.matrixWorld).invert())}lookAt(p,m,g){if(p.isVector3)bo.copy(p);else bo.set(p,m,g);let _=this.parent;if(this.updateWorldMatrix(!0,!1),yr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)hi.lookAt(yr,bo,this.up);else hi.lookAt(bo,yr,this.up);if(this.quaternion.setFromRotationMatrix(hi),_)hi.extractRotation(_.matrixWorld),Ms.setFromRotationMatrix(hi),this.quaternion.premultiply(Ms.invert())}add(p){if(arguments.length>1){for(let m=0;m<arguments.length;m++)this.add(arguments[m]);return this}if(p===this)return $t("Object3D.add: object can't be added as a child of itself.",p),this;if(p&&p.isObject3D)p.removeFromParent(),p.parent=this,this.children.push(p),p.dispatchEvent(Od),Es.child=p,this.dispatchEvent(Es),Es.child=null;else $t("Object3D.add: object not an instance of THREE.Object3D.",p);return this}remove(p){if(arguments.length>1){for(let g=0;g<arguments.length;g++)this.remove(arguments[g]);return this}let m=this.children.indexOf(p);if(m!==-1)p.parent=null,this.children.splice(m,1),p.dispatchEvent(P_),Ul.child=p,this.dispatchEvent(Ul),Ul.child=null;return this}removeFromParent(){let p=this.parent;if(p!==null)p.remove(this);return this}clear(){return this.remove(...this.children)}attach(p){if(this.updateWorldMatrix(!0,!1),hi.copy(this.matrixWorld).invert(),p.parent!==null)p.parent.updateWorldMatrix(!0,!1),hi.multiply(p.parent.matrixWorld);return p.applyMatrix4(hi),p.removeFromParent(),p.parent=this,this.children.push(p),p.updateWorldMatrix(!1,!0),p.dispatchEvent(Od),Es.child=p,this.dispatchEvent(Es),Es.child=null,this}getObjectById(p){return this.getObjectByProperty("id",p)}getObjectByName(p){return this.getObjectByProperty("name",p)}getObjectByProperty(p,m){if(this[p]===m)return this;for(let g=0,_=this.children.length;g<_;g++){let v=this.children[g].getObjectByProperty(p,m);if(v!==void 0)return v}return}getObjectsByProperty(p,m,g=[]){if(this[p]===m)g.push(this);let _=this.children;for(let x=0,v=_.length;x<v;x++)_[x].getObjectsByProperty(p,m,g);return g}getWorldPosition(p){return this.updateWorldMatrix(!0,!1),p.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,p,R_),p}getWorldScale(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(yr,C_,p),p}getWorldDirection(p){this.updateWorldMatrix(!0,!1);let m=this.matrixWorld.elements;return p.set(m[8],m[9],m[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(p){p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverse(p)}traverseVisible(p){if(this.visible===!1)return;p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverseVisible(p)}traverseAncestors(p){let m=this.parent;if(m!==null)p(m),m.traverseAncestors(p)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let p=this.pivot;if(p!==null){let{x:m,y:g,z:_}=p,x=this.matrix.elements;x[12]+=m-x[0]*m-x[4]*g-x[8]*_,x[13]+=g-x[1]*m-x[5]*g-x[9]*_,x[14]+=_-x[2]*m-x[6]*g-x[10]*_}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||p){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,p=!0}let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].updateMatrixWorld(p)}updateWorldMatrix(p,m,g=!1){let _=this.parent;if(p===!0&&_!==null)_.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||g){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,g=!0}if(m===!0){let x=this.children;for(let v=0,y=x.length;v<y;v++)x[v].updateWorldMatrix(!1,!0,g)}}toJSON(p){let m=p===void 0||typeof p==="string",g={};if(m)p={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},g.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let _={};if(_.uuid=this.uuid,_.type=this.type,_.name=this.name,_.castShadow=this.castShadow,_.receiveShadow=this.receiveShadow,_.visible=this.visible,_.frustumCulled=this.frustumCulled,_.renderOrder=this.renderOrder,_.static=this.static,_.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)_.userData=this.userData;if(_.layers=this.layers.mask,_.matrix=this.matrix.toArray(),_.up=this.up.toArray(),this.pivot!==null)_.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)_.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)_.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(_.type="InstancedMesh",_.count=this.count,_.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)_.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(_.type="BatchedMesh",_.perObjectFrustumCulled=this.perObjectFrustumCulled,_.sortObjects=this.sortObjects,_.drawRanges=this._drawRanges,_.reservedRanges=this._reservedRanges,_.geometryInfo=this._geometryInfo.map((y)=>({...y,boundingBox:y.boundingBox?y.boundingBox.toJSON():void 0,boundingSphere:y.boundingSphere?y.boundingSphere.toJSON():void 0})),_.instanceInfo=this._instanceInfo.map((y)=>({...y})),_.availableInstanceIds=this._availableInstanceIds.slice(),_.availableGeometryIds=this._availableGeometryIds.slice(),_.nextIndexStart=this._nextIndexStart,_.nextVertexStart=this._nextVertexStart,_.geometryCount=this._geometryCount,_.maxInstanceCount=this._maxInstanceCount,_.maxVertexCount=this._maxVertexCount,_.maxIndexCount=this._maxIndexCount,_.geometryInitialized=this._geometryInitialized,_.matricesTexture=this._matricesTexture.toJSON(p),_.indirectTexture=this._indirectTexture.toJSON(p),this._colorsTexture!==null)_.colorsTexture=this._colorsTexture.toJSON(p);if(this.boundingSphere!==null)_.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)_.boundingBox=this.boundingBox.toJSON()}function x(y,S){if(y[S.uuid]===void 0)y[S.uuid]=S.toJSON(p);return S.uuid}if(this.isScene){if(this.background){if(this.background.isColor)_.background=this.background.toJSON();else if(this.background.isTexture)_.background=this.background.toJSON(p).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)_.environment=this.environment.toJSON(p).uuid}else if(this.isMesh||this.isLine||this.isPoints){_.geometry=x(p.geometries,this.geometry);let y=this.geometry.parameters;if(y!==void 0&&y.shapes!==void 0){let S=y.shapes;if(Array.isArray(S))for(let b=0,M=S.length;b<M;b++){let T=S[b];x(p.shapes,T)}else x(p.shapes,S)}}if(this.isSkinnedMesh){if(_.bindMode=this.bindMode,_.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)x(p.skeletons,this.skeleton),_.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let y=[];for(let S=0,b=this.material.length;S<b;S++)y.push(x(p.materials,this.material[S]));_.material=y}else _.material=x(p.materials,this.material);if(this.children.length>0){_.children=[];for(let y=0;y<this.children.length;y++)_.children.push(this.children[y].toJSON(p).object)}if(this.animations.length>0){_.animations=[];for(let y=0;y<this.animations.length;y++){let S=this.animations[y];_.animations.push(x(p.animations,S))}}if(m){let y=v(p.geometries),S=v(p.materials),b=v(p.textures),M=v(p.images),T=v(p.shapes),w=v(p.skeletons),E=v(p.animations),A=v(p.nodes);if(y.length>0)g.geometries=y;if(S.length>0)g.materials=S;if(b.length>0)g.textures=b;if(M.length>0)g.images=M;if(T.length>0)g.shapes=T;if(w.length>0)g.skeletons=w;if(E.length>0)g.animations=E;if(A.length>0)g.nodes=A}return g.object=_,g;function v(y){let S=[];for(let b in y){let M=y[b];delete M.metadata,S.push(M)}return S}}clone(p){return new this.constructor().copy(this,p)}copy(p,m=!0){if(this.name=p.name,this.up.copy(p.up),this.position.copy(p.position),this.rotation.order=p.rotation.order,this.quaternion.copy(p.quaternion),this.scale.copy(p.scale),this.pivot=p.pivot!==null?p.pivot.clone():null,this.matrix.copy(p.matrix),this.matrixWorld.copy(p.matrixWorld),this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrixWorldAutoUpdate=p.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=p.matrixWorldNeedsUpdate,this.layers.mask=p.layers.mask,this.visible=p.visible,this.castShadow=p.castShadow,this.receiveShadow=p.receiveShadow,this.frustumCulled=p.frustumCulled,this.renderOrder=p.renderOrder,this.static=p.static,this.animations=p.animations.slice(),this.userData=JSON.parse(JSON.stringify(p.userData)),m===!0)for(let g=0;g<p.children.length;g++){let _=p.children[g];this.add(_.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Xe.DEFAULT_UP=new Y(0,1,0);Xe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Os extends Xe{constructor(){super();this.isGroup=!0,this.type="Group"}}var I_={type:"move"};class zr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Os,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Os,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Y,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Y;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Os,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Y,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Y,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(p){if(this._targetRay!==null)this._targetRay.dispatchEvent(p);if(this._grip!==null)this._grip.dispatchEvent(p);if(this._hand!==null)this._hand.dispatchEvent(p);return this}connect(p){if(p&&p.hand){let m=this._hand;if(m)for(let g of p.hand.values())this._getHandJoint(m,g)}return this.dispatchEvent({type:"connected",data:p}),this}disconnect(p){if(this.dispatchEvent({type:"disconnected",data:p}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(p,m,g){let _=null,x=null,v=null,y=this._targetRay,S=this._grip,b=this._hand;if(p&&m.session.visibilityState!=="visible-blurred"){if(b&&p.hand){v=!0;for(let C of p.hand.values()){let D=m.getJointPose(C,g),R=this._getHandJoint(b,C);if(D!==null)R.matrix.fromArray(D.transform.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale),R.matrixWorldNeedsUpdate=!0,R.jointRadius=D.radius;R.visible=D!==null}let M=b.joints["index-finger-tip"],T=b.joints["thumb-tip"],w=M.position.distanceTo(T.position),E=0.02,A=0.005;if(b.inputState.pinching&&w>E+A)b.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:p.handedness,target:this});else if(!b.inputState.pinching&&w<=E-A)b.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:p.handedness,target:this})}else if(S!==null&&p.gripSpace){if(x=m.getPose(p.gripSpace,g),x!==null){if(S.matrix.fromArray(x.transform.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale),S.matrixWorldNeedsUpdate=!0,x.linearVelocity)S.hasLinearVelocity=!0,S.linearVelocity.copy(x.linearVelocity);else S.hasLinearVelocity=!1;if(x.angularVelocity)S.hasAngularVelocity=!0,S.angularVelocity.copy(x.angularVelocity);else S.hasAngularVelocity=!1;if(S.eventsEnabled)S.dispatchEvent({type:"gripUpdated",data:p,target:this})}}if(y!==null){if(_=m.getPose(p.targetRaySpace,g),_===null&&x!==null)_=x;if(_!==null){if(y.matrix.fromArray(_.transform.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale),y.matrixWorldNeedsUpdate=!0,_.linearVelocity)y.hasLinearVelocity=!0,y.linearVelocity.copy(_.linearVelocity);else y.hasLinearVelocity=!1;if(_.angularVelocity)y.hasAngularVelocity=!0,y.angularVelocity.copy(_.angularVelocity);else y.hasAngularVelocity=!1;this.dispatchEvent(I_)}}}if(y!==null)y.visible=_!==null;if(S!==null)S.visible=x!==null;if(b!==null)b.visible=v!==null;return this}_getHandJoint(p,m){if(p.joints[m.jointName]===void 0){let g=new Os;g.matrixAutoUpdate=!1,g.visible=!1,p.joints[m.jointName]=g,p.add(g)}return p.joints[m.jointName]}}var ap={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pi={h:0,s:0,l:0},Mo={h:0,s:0,l:0};function Ol(p,m,g){if(g<0)g+=1;if(g>1)g-=1;if(g<0.16666666666666666)return p+(m-p)*6*g;if(g<0.5)return m;if(g<0.6666666666666666)return p+(m-p)*6*(0.6666666666666666-g);return p}class oe{constructor(p,m,g){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(p,m,g)}set(p,m,g){if(m===void 0&&g===void 0){let _=p;if(_&&_.isColor)this.copy(_);else if(typeof _==="number")this.setHex(_);else if(typeof _==="string")this.setStyle(_)}else this.setRGB(p,m,g);return this}setScalar(p){return this.r=p,this.g=p,this.b=p,this}setHex(p,m="srgb"){return p=Math.floor(p),this.r=(p>>16&255)/255,this.g=(p>>8&255)/255,this.b=(p&255)/255,he.colorSpaceToWorking(this,m),this}setRGB(p,m,g,_=he.workingColorSpace){return this.r=p,this.g=m,this.b=g,he.colorSpaceToWorking(this,_),this}setHSL(p,m,g,_=he.workingColorSpace){if(p=sh(p,1),m=ne(m,0,1),g=ne(g,0,1),m===0)this.r=this.g=this.b=g;else{let x=g<=0.5?g*(1+m):g+m-g*m,v=2*g-x;this.r=Ol(v,x,p+0.3333333333333333),this.g=Ol(v,x,p),this.b=Ol(v,x,p-0.3333333333333333)}return he.colorSpaceToWorking(this,_),this}setStyle(p,m="srgb"){function g(x){if(x===void 0)return;if(parseFloat(x)<1)Xt("Color: Alpha component of "+p+" will be ignored.")}let _;if(_=/^(\w+)\(([^\)]*)\)/.exec(p)){let x,v=_[1],y=_[2];switch(v){case"rgb":case"rgba":if(x=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(y))return g(x[4]),this.setRGB(Math.min(255,parseInt(x[1],10))/255,Math.min(255,parseInt(x[2],10))/255,Math.min(255,parseInt(x[3],10))/255,m);if(x=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(y))return g(x[4]),this.setRGB(Math.min(100,parseFloat(x[1]))/100,Math.min(100,parseFloat(x[2]))/100,Math.min(100,parseFloat(x[3]))/100,m);break;case"hsl":case"hsla":if(x=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(y))return g(x[4]),this.setHSL(parseFloat(x[1])/360,parseFloat(x[2])/100,parseFloat(x[3])/100,m);break;default:Xt("Color: Unknown color model "+p)}}else if(_=/^\#([A-Fa-f\d]+)$/.exec(p)){let x=_[1],v=x.length;if(v===3)return this.setRGB(parseInt(x.charAt(0),16)/15,parseInt(x.charAt(1),16)/15,parseInt(x.charAt(2),16)/15,m);else if(v===6)return this.setHex(parseInt(x,16),m);else Xt("Color: Invalid hex color "+p)}else if(p&&p.length>0)return this.setColorName(p,m);return this}setColorName(p,m="srgb"){let g=ap[p.toLowerCase()];if(g!==void 0)this.setHex(g,m);else Xt("Color: Unknown color "+p);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(p){return this.r=p.r,this.g=p.g,this.b=p.b,this}copySRGBToLinear(p){return this.r=gi(p.r),this.g=gi(p.g),this.b=gi(p.b),this}copyLinearToSRGB(p){return this.r=Fs(p.r),this.g=Fs(p.g),this.b=Fs(p.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(p="srgb"){return he.workingToColorSpace(un.copy(this),p),Math.round(ne(un.r*255,0,255))*65536+Math.round(ne(un.g*255,0,255))*256+Math.round(ne(un.b*255,0,255))}getHexString(p="srgb"){return("000000"+this.getHex(p).toString(16)).slice(-6)}getHSL(p,m=he.workingColorSpace){he.workingToColorSpace(un.copy(this),m);let{r:g,g:_,b:x}=un,v=Math.max(g,_,x),y=Math.min(g,_,x),S,b,M=(y+v)/2;if(y===v)S=0,b=0;else{let T=v-y;switch(b=M<=0.5?T/(v+y):T/(2-v-y),v){case g:S=(_-x)/T+(_<x?6:0);break;case _:S=(x-g)/T+2;break;case x:S=(g-_)/T+4;break}S/=6}return p.h=S,p.s=b,p.l=M,p}getRGB(p,m=he.workingColorSpace){return he.workingToColorSpace(un.copy(this),m),p.r=un.r,p.g=un.g,p.b=un.b,p}getStyle(p="srgb"){he.workingToColorSpace(un.copy(this),p);let{r:m,g,b:_}=un;if(p!=="srgb")return`color(${p} ${m.toFixed(3)} ${g.toFixed(3)} ${_.toFixed(3)})`;return`rgb(${Math.round(m*255)},${Math.round(g*255)},${Math.round(_*255)})`}offsetHSL(p,m,g){return this.getHSL(Pi),this.setHSL(Pi.h+p,Pi.s+m,Pi.l+g)}add(p){return this.r+=p.r,this.g+=p.g,this.b+=p.b,this}addColors(p,m){return this.r=p.r+m.r,this.g=p.g+m.g,this.b=p.b+m.b,this}addScalar(p){return this.r+=p,this.g+=p,this.b+=p,this}sub(p){return this.r=Math.max(0,this.r-p.r),this.g=Math.max(0,this.g-p.g),this.b=Math.max(0,this.b-p.b),this}multiply(p){return this.r*=p.r,this.g*=p.g,this.b*=p.b,this}multiplyScalar(p){return this.r*=p,this.g*=p,this.b*=p,this}lerp(p,m){return this.r+=(p.r-this.r)*m,this.g+=(p.g-this.g)*m,this.b+=(p.b-this.b)*m,this}lerpColors(p,m,g){return this.r=p.r+(m.r-p.r)*g,this.g=p.g+(m.g-p.g)*g,this.b=p.b+(m.b-p.b)*g,this}lerpHSL(p,m){this.getHSL(Pi),p.getHSL(Mo);let g=Ar(Pi.h,Mo.h,m),_=Ar(Pi.s,Mo.s,m),x=Ar(Pi.l,Mo.l,m);return this.setHSL(g,_,x),this}setFromVector3(p){return this.r=p.x,this.g=p.y,this.b=p.z,this}applyMatrix3(p){let m=this.r,g=this.g,_=this.b,x=p.elements;return this.r=x[0]*m+x[3]*g+x[6]*_,this.g=x[1]*m+x[4]*g+x[7]*_,this.b=x[2]*m+x[5]*g+x[8]*_,this}equals(p){return p.r===this.r&&p.g===this.g&&p.b===this.b}fromArray(p,m=0){return this.r=p[m],this.g=p[m+1],this.b=p[m+2],this}toArray(p=[],m=0){return p[m]=this.r,p[m+1]=this.g,p[m+2]=this.b,p}fromBufferAttribute(p,m){return this.r=p.getX(m),this.g=p.getY(m),this.b=p.getZ(m),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var un=new oe;oe.NAMES=ap;class aa extends Xe{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new _i,this.environmentIntensity=1,this.environmentRotation=new _i,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(p,m){return super.copy(p,m),this.background=p.background!==null?p.background.clone():null,this.environment=p.environment!==null?p.environment.clone():null,this.fog=p.fog!==null?p.fog.clone():null,this.backgroundBlurriness=p.backgroundBlurriness,this.backgroundIntensity=p.backgroundIntensity,this.backgroundRotation.copy(p.backgroundRotation),this.environmentIntensity=p.environmentIntensity,this.environmentRotation.copy(p.environmentRotation),this.overrideMaterial=p.overrideMaterial!==null?p.overrideMaterial.clone():null,this.matrixAutoUpdate=p.matrixAutoUpdate,this}toJSON(p){let m=super.toJSON(p);if(this.fog!==null)m.object.fog=this.fog.toJSON();return m.object.backgroundBlurriness=this.backgroundBlurriness,m.object.backgroundIntensity=this.backgroundIntensity,m.object.backgroundRotation=this.backgroundRotation.toArray(),m.object.environmentIntensity=this.environmentIntensity,m.object.environmentRotation=this.environmentRotation.toArray(),m}}var Xn=new Y,ui=new Y,Fl=new Y,di=new Y,Ts=new Y,ws=new Y,Fd=new Y,Bl=new Y,kl=new Y,zl=new Y,Hl=new Oe,Gl=new Oe,Vl=new Oe;class Ge{constructor(p=new Y,m=new Y,g=new Y){this.a=p,this.b=m,this.c=g}static getNormal(p,m,g,_){_.subVectors(g,m),Xn.subVectors(p,m),_.cross(Xn);let x=_.lengthSq();if(x>0)return _.multiplyScalar(1/Math.sqrt(x));return _.set(0,0,0)}static getBarycoord(p,m,g,_,x){Xn.subVectors(_,m),ui.subVectors(g,m),Fl.subVectors(p,m);let v=Xn.dot(Xn),y=Xn.dot(ui),S=Xn.dot(Fl),b=ui.dot(ui),M=ui.dot(Fl),T=v*b-y*y;if(T===0)return x.set(0,0,0),null;let w=1/T,E=(b*S-y*M)*w,A=(v*M-y*S)*w;return x.set(1-E-A,A,E)}static containsPoint(p,m,g,_){if(this.getBarycoord(p,m,g,_,di)===null)return!1;return di.x>=0&&di.y>=0&&di.x+di.y<=1}static getInterpolation(p,m,g,_,x,v,y,S){if(this.getBarycoord(p,m,g,_,di)===null){if(S.x=0,S.y=0,"z"in S)S.z=0;if("w"in S)S.w=0;return null}return S.setScalar(0),S.addScaledVector(x,di.x),S.addScaledVector(v,di.y),S.addScaledVector(y,di.z),S}static getInterpolatedAttribute(p,m,g,_,x,v){return Hl.setScalar(0),Gl.setScalar(0),Vl.setScalar(0),Hl.fromBufferAttribute(p,m),Gl.fromBufferAttribute(p,g),Vl.fromBufferAttribute(p,_),v.setScalar(0),v.addScaledVector(Hl,x.x),v.addScaledVector(Gl,x.y),v.addScaledVector(Vl,x.z),v}static isFrontFacing(p,m,g,_){return Xn.subVectors(g,m),ui.subVectors(p,m),Xn.cross(ui).dot(_)<0}set(p,m,g){return this.a.copy(p),this.b.copy(m),this.c.copy(g),this}setFromPointsAndIndices(p,m,g,_){return this.a.copy(p[m]),this.b.copy(p[g]),this.c.copy(p[_]),this}setFromAttributeAndIndices(p,m,g,_){return this.a.fromBufferAttribute(p,m),this.b.fromBufferAttribute(p,g),this.c.fromBufferAttribute(p,_),this}clone(){return new this.constructor().copy(this)}copy(p){return this.a.copy(p.a),this.b.copy(p.b),this.c.copy(p.c),this}getArea(){return Xn.subVectors(this.c,this.b),ui.subVectors(this.a,this.b),Xn.cross(ui).length()*0.5}getMidpoint(p){return p.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(p){return Ge.getNormal(this.a,this.b,this.c,p)}getPlane(p){return p.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(p,m){return Ge.getBarycoord(p,this.a,this.b,this.c,m)}getInterpolation(p,m,g,_,x){return Ge.getInterpolation(p,this.a,this.b,this.c,m,g,_,x)}containsPoint(p){return Ge.containsPoint(p,this.a,this.b,this.c)}isFrontFacing(p){return Ge.isFrontFacing(this.a,this.b,this.c,p)}intersectsBox(p){return p.intersectsTriangle(this)}closestPointToPoint(p,m){let g=this.a,_=this.b,x=this.c,v,y;Ts.subVectors(_,g),ws.subVectors(x,g),Bl.subVectors(p,g);let S=Ts.dot(Bl),b=ws.dot(Bl);if(S<=0&&b<=0)return m.copy(g);kl.subVectors(p,_);let M=Ts.dot(kl),T=ws.dot(kl);if(M>=0&&T<=M)return m.copy(_);let w=S*T-M*b;if(w<=0&&S>=0&&M<=0&&S-M>0)return v=S/(S-M),m.copy(g).addScaledVector(Ts,v);zl.subVectors(p,x);let E=Ts.dot(zl),A=ws.dot(zl);if(A>=0&&E<=A)return m.copy(x);let C=E*b-S*A;if(C<=0&&b>=0&&A<=0)return y=b/(b-A),m.copy(g).addScaledVector(ws,y);let D=M*A-E*T;if(D<=0&&T-M>=0&&E-A>=0)return Fd.subVectors(x,_),y=(T-M)/(T-M+(E-A)),m.copy(_).addScaledVector(Fd,y);let R=1/(D+C+w);return v=C*R,y=w*R,m.copy(g).addScaledVector(Ts,v).addScaledVector(ws,y)}equals(p){return p.a.equals(this.a)&&p.b.equals(this.b)&&p.c.equals(this.c)}}class ve{constructor(p=new Y(1/0,1/0,1/0),m=new Y(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=p,this.max=m}set(p,m){return this.min.copy(p),this.max.copy(m),this}setFromArray(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m+=3)this.expandByPoint(qn.fromArray(p,m));return this}setFromBufferAttribute(p){this.makeEmpty();for(let m=0,g=p.count;m<g;m++)this.expandByPoint(qn.fromBufferAttribute(p,m));return this}setFromPoints(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m++)this.expandByPoint(p[m]);return this}setFromCenterAndSize(p,m){let g=qn.copy(m).multiplyScalar(0.5);return this.min.copy(p).sub(g),this.max.copy(p).add(g),this}setFromObject(p,m=!1){return this.makeEmpty(),this.expandByObject(p,m)}clone(){return new this.constructor().copy(this)}copy(p){return this.min.copy(p.min),this.max.copy(p.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(p){return this.isEmpty()?p.set(0,0,0):p.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(p){return this.isEmpty()?p.set(0,0,0):p.subVectors(this.max,this.min)}expandByPoint(p){return this.min.min(p),this.max.max(p),this}expandByVector(p){return this.min.sub(p),this.max.add(p),this}expandByScalar(p){return this.min.addScalar(-p),this.max.addScalar(p),this}expandByObject(p,m=!1){p.updateWorldMatrix(!1,!1);let g=p.geometry;if(g!==void 0){let x=g.getAttribute("position");if(m===!0&&x!==void 0&&p.isInstancedMesh!==!0&&p.isBatchedMesh!==!0)for(let v=0,y=x.count;v<y;v++){if(p.isMesh===!0)p.getVertexPosition(v,qn);else qn.fromBufferAttribute(x,v);qn.applyMatrix4(p.matrixWorld),this.expandByPoint(qn)}else{if(p.boundingBox!==void 0){if(p.boundingBox===null)p.computeBoundingBox();Eo.copy(p.boundingBox)}else{if(g.boundingBox===null)g.computeBoundingBox();Eo.copy(g.boundingBox)}Eo.applyMatrix4(p.matrixWorld),this.union(Eo)}}let _=p.children;for(let x=0,v=_.length;x<v;x++)this.expandByObject(_[x],m);return this}containsPoint(p){return p.x>=this.min.x&&p.x<=this.max.x&&p.y>=this.min.y&&p.y<=this.max.y&&p.z>=this.min.z&&p.z<=this.max.z}containsBox(p){return this.min.x<=p.min.x&&p.max.x<=this.max.x&&this.min.y<=p.min.y&&p.max.y<=this.max.y&&this.min.z<=p.min.z&&p.max.z<=this.max.z}getParameter(p,m){return m.set((p.x-this.min.x)/(this.max.x-this.min.x),(p.y-this.min.y)/(this.max.y-this.min.y),(p.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(p){return p.max.x>=this.min.x&&p.min.x<=this.max.x&&p.max.y>=this.min.y&&p.min.y<=this.max.y&&p.max.z>=this.min.z&&p.min.z<=this.max.z}intersectsSphere(p){return this.clampPoint(p.center,qn),qn.distanceToSquared(p.center)<=p.radius*p.radius}intersectsPlane(p){let m,g;if(p.normal.x>0)m=p.normal.x*this.min.x,g=p.normal.x*this.max.x;else m=p.normal.x*this.max.x,g=p.normal.x*this.min.x;if(p.normal.y>0)m+=p.normal.y*this.min.y,g+=p.normal.y*this.max.y;else m+=p.normal.y*this.max.y,g+=p.normal.y*this.min.y;if(p.normal.z>0)m+=p.normal.z*this.min.z,g+=p.normal.z*this.max.z;else m+=p.normal.z*this.max.z,g+=p.normal.z*this.min.z;return m<=-p.constant&&g>=-p.constant}intersectsTriangle(p){if(this.isEmpty())return!1;this.getCenter(Sr),To.subVectors(this.max,Sr),As.subVectors(p.a,Sr),Rs.subVectors(p.b,Sr),Cs.subVectors(p.c,Sr),Ii.subVectors(Rs,As),Li.subVectors(Cs,Rs),ji.subVectors(As,Cs);let m=[0,-Ii.z,Ii.y,0,-Li.z,Li.y,0,-ji.z,ji.y,Ii.z,0,-Ii.x,Li.z,0,-Li.x,ji.z,0,-ji.x,-Ii.y,Ii.x,0,-Li.y,Li.x,0,-ji.y,ji.x,0];if(!Wl(m,As,Rs,Cs,To))return!1;if(m=[1,0,0,0,1,0,0,0,1],!Wl(m,As,Rs,Cs,To))return!1;return wo.crossVectors(Ii,Li),m=[wo.x,wo.y,wo.z],Wl(m,As,Rs,Cs,To)}clampPoint(p,m){return m.copy(p).clamp(this.min,this.max)}distanceToPoint(p){return this.clampPoint(p,qn).distanceTo(p)}getBoundingSphere(p){if(this.isEmpty())p.makeEmpty();else this.getCenter(p.center),p.radius=this.getSize(qn).length()*0.5;return p}intersect(p){if(this.min.max(p.min),this.max.min(p.max),this.isEmpty())this.makeEmpty();return this}union(p){return this.min.min(p.min),this.max.max(p.max),this}applyMatrix4(p){if(this.isEmpty())return this;return fi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(p),fi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(p),fi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(p),fi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(p),fi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(p),fi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(p),fi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(p),fi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(p),this.setFromPoints(fi),this}translate(p){return this.min.add(p),this.max.add(p),this}equals(p){return p.min.equals(this.min)&&p.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(p){return this.min.fromArray(p.min),this.max.fromArray(p.max),this}}var fi=[new Y,new Y,new Y,new Y,new Y,new Y,new Y,new Y],qn=new Y,Eo=new ve,As=new Y,Rs=new Y,Cs=new Y,Ii=new Y,Li=new Y,ji=new Y,Sr=new Y,To=new Y,wo=new Y,Qi=new Y;function Wl(p,m,g,_,x){for(let v=0,y=p.length-3;v<=y;v+=3){Qi.fromArray(p,v);let S=x.x*Math.abs(Qi.x)+x.y*Math.abs(Qi.y)+x.z*Math.abs(Qi.z),b=m.dot(Qi),M=g.dot(Qi),T=_.dot(Qi);if(Math.max(-Math.max(b,M,T),Math.min(b,M,T))>S)return!1}return!0}var He=new Y,Ao=new Jt,L_=0;class We extends yi{constructor(p,m,g=!1){super();if(Array.isArray(p))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:L_++}),this.name="",this.array=p,this.itemSize=m,this.count=p!==void 0?p.length/m:0,this.normalized=g,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=p!==void 0?ra(p):void 0}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.name=p.name,this.array=new p.array.constructor(p.array),this.itemSize=p.itemSize,this.count=p.count,this.normalized=p.normalized,this.usage=p.usage,this.gpuType=p.gpuType,this._normalizationScale=p._normalizationScale,this}copyAt(p,m,g){p*=this.itemSize,g*=m.itemSize;for(let _=0,x=this.itemSize;_<x;_++)this.array[p+_]=m.array[g+_];return this}copyArray(p){return this.array.set(p),this}applyMatrix3(p){if(this.itemSize===2)for(let m=0,g=this.count;m<g;m++)Ao.fromBufferAttribute(this,m),Ao.applyMatrix3(p),this.setXY(m,Ao.x,Ao.y);else if(this.itemSize===3)for(let m=0,g=this.count;m<g;m++)He.fromBufferAttribute(this,m),He.applyMatrix3(p),this.setXYZ(m,He.x,He.y,He.z);return this}applyMatrix4(p){for(let m=0,g=this.count;m<g;m++)He.fromBufferAttribute(this,m),He.applyMatrix4(p),this.setXYZ(m,He.x,He.y,He.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)He.fromBufferAttribute(this,m),He.applyNormalMatrix(p),this.setXYZ(m,He.x,He.y,He.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)He.fromBufferAttribute(this,m),He.transformDirection(p),this.setXYZ(m,He.x,He.y,He.z);return this}set(p,m=0){return this.array.set(p,m),this}getComponent(p,m){let g=this.array[p*this.itemSize+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.array[p*this.itemSize+m]=g,this}getX(p){let m=this.array[p*this.itemSize];if(this.normalized)m=this._denormalize(m);return m}setX(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize]=m,this}getY(p){let m=this.array[p*this.itemSize+1];if(this.normalized)m=this._denormalize(m);return m}setY(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+1]=m,this}getZ(p){let m=this.array[p*this.itemSize+2];if(this.normalized)m=this._denormalize(m);return m}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+2]=m,this}getW(p){let m=this.array[p*this.itemSize+3];if(this.normalized)m=this._denormalize(m);return m}setW(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+3]=m,this}setXY(p,m,g){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.array[p+0]=m,this.array[p+1]=g,this}setXYZ(p,m,g,_){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this.array[p+3]=x,this}onUpload(p){return this.onUploadCallback=p,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let p={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return p.name=this.name,p.usage=this.usage,p.gpuType=this.gpuType,p}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):oh(p,this.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):ah(p,this.array)}}class la extends We{constructor(p,m,g){super(new Uint16Array(p),m,g)}}class ca extends We{constructor(p,m,g){super(new Uint32Array(p),m,g)}}class sn extends We{constructor(p,m,g){super(new Float32Array(p),m,g)}}var N_=new ve,br=new Y,Xl=new Y;class bn{constructor(p=new Y,m=-1){this.isSphere=!0,this.center=p,this.radius=m}set(p,m){return this.center.copy(p),this.radius=m,this}setFromPoints(p,m){let g=this.center;if(m!==void 0)g.copy(m);else N_.setFromPoints(p).getCenter(g);let _=0;for(let x=0,v=p.length;x<v;x++)_=Math.max(_,g.distanceToSquared(p[x]));return this.radius=Math.sqrt(_),this}copy(p){return this.center.copy(p.center),this.radius=p.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(p){return p.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(p){return p.distanceTo(this.center)-this.radius}intersectsSphere(p){let m=this.radius+p.radius;return p.center.distanceToSquared(this.center)<=m*m}intersectsBox(p){return p.intersectsSphere(this)}intersectsPlane(p){return Math.abs(p.distanceToPoint(this.center))<=this.radius}clampPoint(p,m){let g=this.center.distanceToSquared(p);if(m.copy(p),g>this.radius*this.radius)m.sub(this.center).normalize(),m.multiplyScalar(this.radius).add(this.center);return m}getBoundingBox(p){if(this.isEmpty())return p.makeEmpty(),p;return p.set(this.center,this.center),p.expandByScalar(this.radius),p}applyMatrix4(p){return this.center.applyMatrix4(p),this.radius=this.radius*p.getMaxScaleOnAxis(),this}translate(p){return this.center.add(p),this}expandByPoint(p){if(this.isEmpty())return this.center.copy(p),this.radius=0,this;br.subVectors(p,this.center);let m=br.lengthSq();if(m>this.radius*this.radius){let g=Math.sqrt(m),_=(g-this.radius)*0.5;this.center.addScaledVector(br,_/g),this.radius+=_}return this}union(p){if(p.isEmpty())return this;if(this.isEmpty())return this.copy(p),this;if(this.center.equals(p.center)===!0)this.radius=Math.max(this.radius,p.radius);else Xl.subVectors(p.center,this.center).setLength(p.radius),this.expandByPoint(br.copy(p.center).add(Xl)),this.expandByPoint(br.copy(p.center).sub(Xl));return this}equals(p){return p.center.equals(this.center)&&p.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(p){return this.radius=p.radius,this.center.fromArray(p.center),this}}var D_=0,Fn=new re,ql=new Xe,Ps=new Y,Ln=new ve,Mr=new ve,Qe=new Y;class qe extends yi{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:D_++}),this.uuid=Bi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(p){if(Array.isArray(p))this.index=new((r_(p))?ca:la)(p,1);else this.index=p;return this}setIndirect(p,m=0){return this.indirect=p,this.indirectOffset=m,this}getIndirect(){return this.indirect}getAttribute(p){return this.attributes[p]}setAttribute(p,m){return this.attributes[p]=m,this}deleteAttribute(p){return delete this.attributes[p],this}hasAttribute(p){return this.attributes[p]!==void 0}addGroup(p,m,g=0){this.groups.push({start:p,count:m,materialIndex:g})}clearGroups(){this.groups=[]}setDrawRange(p,m){this.drawRange.start=p,this.drawRange.count=m}applyMatrix4(p){let m=this.attributes.position;if(m!==void 0)m.applyMatrix4(p),m.needsUpdate=!0;let g=this.attributes.normal;if(g!==void 0){let x=new Qt().getNormalMatrix(p);g.applyNormalMatrix(x),g.needsUpdate=!0}let _=this.attributes.tangent;if(_!==void 0)_.transformDirection(p),_.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(p){return Fn.makeRotationFromQuaternion(p),this.applyMatrix4(Fn),this}rotateX(p){return Fn.makeRotationX(p),this.applyMatrix4(Fn),this}rotateY(p){return Fn.makeRotationY(p),this.applyMatrix4(Fn),this}rotateZ(p){return Fn.makeRotationZ(p),this.applyMatrix4(Fn),this}translate(p,m,g){return Fn.makeTranslation(p,m,g),this.applyMatrix4(Fn),this}scale(p,m,g){return Fn.makeScale(p,m,g),this.applyMatrix4(Fn),this}lookAt(p){return ql.lookAt(p),ql.updateMatrix(),this.applyMatrix4(ql.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ps).negate(),this.translate(Ps.x,Ps.y,Ps.z),this}setFromPoints(p){let m=this.getAttribute("position");if(m===void 0){let g=[];for(let _=0,x=p.length;_<x;_++){let v=p[_];g.push(v.x,v.y,v.z||0)}this.setAttribute("position",new sn(g,3))}else{let g=Math.min(p.length,m.count);for(let _=0;_<g;_++){let x=p[_];m.setXYZ(_,x.x,x.y,x.z||0)}if(p.length>m.count)Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");m.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new ve;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Y(-1/0,-1/0,-1/0),new Y(1/0,1/0,1/0));return}if(p!==void 0){if(this.boundingBox.setFromBufferAttribute(p),m)for(let g=0,_=m.length;g<_;g++){let x=m[g];if(Ln.setFromBufferAttribute(x),this.morphTargetsRelative)Qe.addVectors(this.boundingBox.min,Ln.min),this.boundingBox.expandByPoint(Qe),Qe.addVectors(this.boundingBox.max,Ln.max),this.boundingBox.expandByPoint(Qe);else this.boundingBox.expandByPoint(Ln.min),this.boundingBox.expandByPoint(Ln.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))$t('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new bn;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Y,1/0);return}if(p){let g=this.boundingSphere.center;if(Ln.setFromBufferAttribute(p),m)for(let x=0,v=m.length;x<v;x++){let y=m[x];if(Mr.setFromBufferAttribute(y),this.morphTargetsRelative)Qe.addVectors(Ln.min,Mr.min),Ln.expandByPoint(Qe),Qe.addVectors(Ln.max,Mr.max),Ln.expandByPoint(Qe);else Ln.expandByPoint(Mr.min),Ln.expandByPoint(Mr.max)}Ln.getCenter(g);let _=0;for(let x=0,v=p.count;x<v;x++)Qe.fromBufferAttribute(p,x),_=Math.max(_,g.distanceToSquared(Qe));if(m)for(let x=0,v=m.length;x<v;x++){let y=m[x],S=this.morphTargetsRelative;for(let b=0,M=y.count;b<M;b++){if(Qe.fromBufferAttribute(y,b),S)Ps.fromBufferAttribute(p,b),Qe.add(Ps);_=Math.max(_,g.distanceToSquared(Qe))}}if(this.boundingSphere.radius=Math.sqrt(_),isNaN(this.boundingSphere.radius))$t('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let p=this.index,m=this.attributes;if(p===null||m.position===void 0||m.normal===void 0||m.uv===void 0){$t("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:g,normal:_,uv:x}=m,v=this.getAttribute("tangent");if(v===void 0||v.count!==g.count)v=new We(new Float32Array(4*g.count),4),this.setAttribute("tangent",v);let y=[],S=[],b=new Uint8Array(g.count);for(let O=0;O<g.count;O++)y[O]=new Y,S[O]=new Y;let M=new Y,T=new Y,w=new Y,E=new Jt,A=new Jt,C=new Jt,D=new Y,R=new Y;function P(O,V,q){b[O]=b[V]=b[q]=1,M.fromBufferAttribute(g,O),T.fromBufferAttribute(g,V),w.fromBufferAttribute(g,q),E.fromBufferAttribute(x,O),A.fromBufferAttribute(x,V),C.fromBufferAttribute(x,q),T.sub(M),w.sub(M),A.sub(E),C.sub(E);let H=1/(A.x*C.y-C.x*A.y);if(!isFinite(H))return;D.copy(T).multiplyScalar(C.y).addScaledVector(w,-A.y).multiplyScalar(H),R.copy(w).multiplyScalar(A.x).addScaledVector(T,-C.x).multiplyScalar(H),y[O].add(D),y[V].add(D),y[q].add(D),S[O].add(R),S[V].add(R),S[q].add(R)}let L=this.groups;if(L.length===0)L=[{start:0,count:p.count}];for(let O=0,V=L.length;O<V;++O){let q=L[O],{start:H,count:W}=q;for(let J=H,G=H+W;J<G;J+=3)P(p.getX(J+0),p.getX(J+1),p.getX(J+2))}let U=new Y,N=new Y,F=new Y,z=new Y;function I(O){F.fromBufferAttribute(_,O),z.copy(F);let V=y[O];U.copy(V),U.sub(F.multiplyScalar(F.dot(V))).normalize(),N.crossVectors(z,V);let H=N.dot(S[O])<0?-1:1;v.setXYZW(O,U.x,U.y,U.z,H)}for(let O=0,V=g.count;O<V;++O)if(b[O])I(O);this._transformed=!0}computeVertexNormals(){let p=this.index,m=this.getAttribute("position");if(m!==void 0){let g=this.getAttribute("normal");if(g===void 0||g.count!==m.count)g=new We(new Float32Array(m.count*3),3),this.setAttribute("normal",g);else for(let w=0,E=g.count;w<E;w++)g.setXYZ(w,0,0,0);let _=new Y,x=new Y,v=new Y,y=new Y,S=new Y,b=new Y,M=new Y,T=new Y;if(p)for(let w=0,E=p.count;w<E;w+=3){let A=p.getX(w+0),C=p.getX(w+1),D=p.getX(w+2);_.fromBufferAttribute(m,A),x.fromBufferAttribute(m,C),v.fromBufferAttribute(m,D),M.subVectors(v,x),T.subVectors(_,x),M.cross(T),y.fromBufferAttribute(g,A),S.fromBufferAttribute(g,C),b.fromBufferAttribute(g,D),y.add(M),S.add(M),b.add(M),g.setXYZ(A,y.x,y.y,y.z),g.setXYZ(C,S.x,S.y,S.z),g.setXYZ(D,b.x,b.y,b.z)}else for(let w=0,E=m.count;w<E;w+=3)_.fromBufferAttribute(m,w+0),x.fromBufferAttribute(m,w+1),v.fromBufferAttribute(m,w+2),M.subVectors(v,x),T.subVectors(_,x),M.cross(T),g.setXYZ(w+0,M.x,M.y,M.z),g.setXYZ(w+1,M.x,M.y,M.z),g.setXYZ(w+2,M.x,M.y,M.z);this.normalizeNormals(),g.needsUpdate=!0}}normalizeNormals(){let p=this.attributes.normal;for(let m=0,g=p.count;m<g;m++)Qe.fromBufferAttribute(p,m),Qe.normalize(),p.setXYZ(m,Qe.x,Qe.y,Qe.z)}toNonIndexed(){function p(y,S){let{array:b,itemSize:M,normalized:T}=y,w=new b.constructor(S.length*M),E=0,A=0;for(let C=0,D=S.length;C<D;C++){if(y.isInterleavedBufferAttribute)E=S[C]*y.data.stride+y.offset;else E=S[C]*M;for(let R=0;R<M;R++)w[A++]=b[E++]}return new We(w,M,T)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let m=new qe,g=this.index.array,_=this.attributes;for(let y in _){let S=_[y],b=p(S,g);m.setAttribute(y,b)}let x=this.morphAttributes;for(let y in x){let S=[],b=x[y];for(let M=0,T=b.length;M<T;M++){let w=b[M],E=p(w,g);S.push(E)}m.morphAttributes[y]=S}m.morphTargetsRelative=this.morphTargetsRelative;let v=this.groups;for(let y=0,S=v.length;y<S;y++){let b=v[y];m.addGroup(b.start,b.count,b.materialIndex)}return m}toJSON(){let p={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(p.uuid=this.uuid,p.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,p.name=this.name,Object.keys(this.userData).length>0)p.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let S=this.parameters;for(let b in S)if(S[b]!==void 0)p[b]=S[b];return p}p.data={attributes:{}};let m=this.index;if(m!==null)p.data.index={type:m.array.constructor.name,array:Array.prototype.slice.call(m.array)};let g=this.attributes;for(let S in g){let b=g[S];p.data.attributes[S]=b.toJSON(p.data)}let _={},x=!1;for(let S in this.morphAttributes){let b=this.morphAttributes[S],M=[];for(let T=0,w=b.length;T<w;T++){let E=b[T];M.push(E.toJSON(p.data))}if(M.length>0)_[S]=M,x=!0}if(x)p.data.morphAttributes=_,p.data.morphTargetsRelative=this.morphTargetsRelative;let v=this.groups;if(v.length>0)p.data.groups=JSON.parse(JSON.stringify(v));let y=this.boundingSphere;if(y!==null)p.data.boundingSphere=y.toJSON();return p}clone(){return new this.constructor().copy(this)}copy(p){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let m={};this.name=p.name;let g=p.index;if(g!==null)this.setIndex(g.clone());let _=p.attributes;for(let b in _){let M=_[b];this.setAttribute(b,M.clone(m))}let x=p.morphAttributes;for(let b in x){let M=[],T=x[b];for(let w=0,E=T.length;w<E;w++)M.push(T[w].clone(m));this.morphAttributes[b]=M}this.morphTargetsRelative=p.morphTargetsRelative;let v=p.groups;for(let b=0,M=v.length;b<M;b++){let T=v[b];this.addGroup(T.start,T.count,T.materialIndex)}let y=p.boundingBox;if(y!==null)this.boundingBox=y.clone();let S=p.boundingSphere;if(S!==null)this.boundingSphere=S.clone();return this.drawRange.start=p.drawRange.start,this.drawRange.count=p.drawRange.count,this.userData=p.userData,this._transformed=p._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ha{constructor(p,m){this.isInterleavedBuffer=!0,this.array=p,this.stride=m,this.count=p!==void 0?p.length/m:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Bi()}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.array=new p.array.constructor(p.array),this.count=p.count,this.stride=p.stride,this.usage=p.usage,this}copyAt(p,m,g){p*=this.stride,g*=m.stride;for(let _=0,x=this.stride;_<x;_++)this.array[p+_]=m.array[g+_];return this}set(p,m=0){return this.array.set(p,m),this}clone(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Bd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=this.array.slice(0).buffer;let g=new this.array.constructor(p.arrayBuffers[m]),_=new this.constructor(g,this.stride);return _.setUsage(this.usage),_}onUpload(p){return this.onUploadCallback=p,this}toJSON(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Bd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=Array.from(new Uint32Array(this.array.slice(0).buffer));let g={uuid:this.uuid,buffer:m,type:this.array.constructor.name,stride:this.stride};return g.usage=this.usage,g}}function Bd(p){if(p.buffer._uuid===void 0)p.buffer._uuid=Bi();if(p.byteOffset===0&&p.byteLength===p.buffer.byteLength)return p.buffer._uuid;return p.buffer._uuid+":"+p.byteOffset+":"+p.byteLength}var Sn=new Y;class ls{constructor(p,m,g,_=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=p,this.itemSize=m,this.offset=g,this.normalized=_,this._normalizationScale=p!==void 0?ra(p.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(p){this.data.needsUpdate=p}applyMatrix4(p){for(let m=0,g=this.data.count;m<g;m++)Sn.fromBufferAttribute(this,m),Sn.applyMatrix4(p),this.setXYZ(m,Sn.x,Sn.y,Sn.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)Sn.fromBufferAttribute(this,m),Sn.applyNormalMatrix(p),this.setXYZ(m,Sn.x,Sn.y,Sn.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)Sn.fromBufferAttribute(this,m),Sn.transformDirection(p),this.setXYZ(m,Sn.x,Sn.y,Sn.z);return this}getComponent(p,m){let g=this.array[p*this.data.stride+this.offset+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.data.array[p*this.data.stride+this.offset+m]=g,this}setX(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset]=m,this}setY(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+1]=m,this}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+2]=m,this}setW(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+3]=m,this}getX(p){let m=this.data.array[p*this.data.stride+this.offset];if(this.normalized)m=this._denormalize(m);return m}getY(p){let m=this.data.array[p*this.data.stride+this.offset+1];if(this.normalized)m=this._denormalize(m);return m}getZ(p){let m=this.data.array[p*this.data.stride+this.offset+2];if(this.normalized)m=this._denormalize(m);return m}getW(p){let m=this.data.array[p*this.data.stride+this.offset+3];if(this.normalized)m=this._denormalize(m);return m}setXY(p,m,g){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.data.array[p+0]=m,this.data.array[p+1]=g,this}setXYZ(p,m,g,_){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this.data.array[p+3]=x,this}clone(p){if(p===void 0){Cr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return new We(new this.array.constructor(m),this.itemSize,this.normalized)}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.clone(p);return new ls(p.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(p){if(p===void 0){Cr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:m,normalized:this.normalized}}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.toJSON(p);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):oh(p,this.data.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):ah(p,this.data.array)}}var Yl=new Y,U_=new Y,O_=new Qt;class nn{constructor(p=new Y(1,0,0),m=0){this.isPlane=!0,this.normal=p,this.constant=m}set(p,m){return this.normal.copy(p),this.constant=m,this}setComponents(p,m,g,_){return this.normal.set(p,m,g),this.constant=_,this}setFromNormalAndCoplanarPoint(p,m){return this.normal.copy(p),this.constant=-m.dot(this.normal),this}setFromCoplanarPoints(p,m,g){let _=Yl.subVectors(g,m).cross(U_.subVectors(p,m)).normalize();return this.setFromNormalAndCoplanarPoint(_,p),this}copy(p){return this.normal.copy(p.normal),this.constant=p.constant,this}normalize(){let p=1/this.normal.length();return this.normal.multiplyScalar(p),this.constant*=p,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(p){return this.normal.dot(p)+this.constant}distanceToSphere(p){return this.distanceToPoint(p.center)-p.radius}projectPoint(p,m){return m.copy(p).addScaledVector(this.normal,-this.distanceToPoint(p))}intersectLine(p,m,g=!0){let _=p.delta(Yl),x=this.normal.dot(_);if(x===0){if(this.distanceToPoint(p.start)===0)return m.copy(p.start);return null}let v=-(p.start.dot(this.normal)+this.constant)/x;if(g===!0&&(v<0||v>1))return null;return m.copy(p.start).addScaledVector(_,v)}intersectsLine(p){let m=this.distanceToPoint(p.start),g=this.distanceToPoint(p.end);return m<0&&g>0||g<0&&m>0}intersectsBox(p){return p.intersectsPlane(this)}intersectsSphere(p){return p.intersectsPlane(this)}coplanarPoint(p){return p.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(p,m){let g=m||O_.getNormalMatrix(p),_=this.coplanarPoint(Yl).applyMatrix4(p),x=this.normal.applyMatrix3(g).normalize();return this.constant=-_.dot(x),this}translate(p){return this.constant-=p.dot(this.normal),this}equals(p){return p.normal.equals(this.normal)&&p.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(p){return this.normal.fromArray(p.normal),this.constant=p.constant,this}}var F_=0;class Mi extends yi{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:F_++}),this.uuid=Bi(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new oe(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(p){if(this._alphaTest>0!==p>0)this.version++;this._alphaTest=p}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(p){if(p===void 0)return;for(let m in p){let g=p[m];if(g===void 0){Xt(`Material: parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Material: '${m}' is not a property of THREE.${this.type}.`);continue}if(_&&_.isColor)_.set(g);else if(_&&_.isVector2&&(g&&g.isVector2)||_&&_.isEuler&&(g&&g.isEuler)||_&&_.isVector3&&(g&&g.isVector3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(m)p={textures:{},images:{}};let g={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(g.uuid=this.uuid,g.type=this.type,g.blending=this.blending,g.side=this.side,g.shadowSide=this.shadowSide,g.vertexColors=this.vertexColors,g.opacity=this.opacity,g.transparent=this.transparent,g.blendSrc=this.blendSrc,g.blendDst=this.blendDst,g.blendEquation=this.blendEquation,g.blendSrcAlpha=this.blendSrcAlpha,g.blendDstAlpha=this.blendDstAlpha,g.blendEquationAlpha=this.blendEquationAlpha,g.blendColor=this.blendColor.getHex(),g.blendAlpha=this.blendAlpha,g.depthFunc=this.depthFunc,g.depthTest=this.depthTest,g.depthWrite=this.depthWrite,g.colorWrite=this.colorWrite,g.clipIntersection=this.clipIntersection,g.clipShadows=this.clipShadows,g.stencilWriteMask=this.stencilWriteMask,g.stencilFunc=this.stencilFunc,g.stencilRef=this.stencilRef,g.stencilFuncMask=this.stencilFuncMask,g.stencilFail=this.stencilFail,g.stencilZFail=this.stencilZFail,g.stencilZPass=this.stencilZPass,g.stencilWrite=this.stencilWrite,g.polygonOffset=this.polygonOffset,g.polygonOffsetFactor=this.polygonOffsetFactor,g.polygonOffsetUnits=this.polygonOffsetUnits,g.dithering=this.dithering,g.alphaTest=this.alphaTest,g.alphaHash=this.alphaHash,g.alphaToCoverage=this.alphaToCoverage,g.premultipliedAlpha=this.premultipliedAlpha,g.forceSinglePass=this.forceSinglePass,g.allowOverride=this.allowOverride,g.visible=this.visible,g.toneMapped=this.toneMapped,g.name=this.name,this.color&&this.color.isColor)g.color=this.color.getHex();if(this.roughness!==void 0)g.roughness=this.roughness;if(this.metalness!==void 0)g.metalness=this.metalness;if(this.sheen!==void 0)g.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)g.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)g.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)g.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)g.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)g.specular=this.specular.getHex();if(this.specularIntensity!==void 0)g.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)g.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)g.shininess=this.shininess;if(this.clearcoat!==void 0)g.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)g.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)g.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)g.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(p).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)g.clearcoatMap=this.clearcoatMap.toJSON(p).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)g.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(p).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)g.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(p).uuid,g.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)g.sheenColorMap=this.sheenColorMap.toJSON(p).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)g.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(p).uuid;if(this.dispersion!==void 0)g.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)g.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)g.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)g.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)g.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)g.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)g.iridescenceMap=this.iridescenceMap.toJSON(p).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)g.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(p).uuid;if(this.anisotropy!==void 0)g.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)g.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)g.anisotropyMap=this.anisotropyMap.toJSON(p).uuid;if(this.map&&this.map.isTexture)g.map=this.map.toJSON(p).uuid;if(this.matcap&&this.matcap.isTexture)g.matcap=this.matcap.toJSON(p).uuid;if(this.alphaMap&&this.alphaMap.isTexture)g.alphaMap=this.alphaMap.toJSON(p).uuid;if(this.lightMap&&this.lightMap.isTexture)g.lightMap=this.lightMap.toJSON(p).uuid,g.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)g.aoMap=this.aoMap.toJSON(p).uuid,g.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)g.bumpMap=this.bumpMap.toJSON(p).uuid,g.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)g.normalMap=this.normalMap.toJSON(p).uuid,g.normalMapType=this.normalMapType,g.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)g.displacementMap=this.displacementMap.toJSON(p).uuid,g.displacementScale=this.displacementScale,g.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)g.roughnessMap=this.roughnessMap.toJSON(p).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)g.metalnessMap=this.metalnessMap.toJSON(p).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)g.emissiveMap=this.emissiveMap.toJSON(p).uuid;if(this.specularMap&&this.specularMap.isTexture)g.specularMap=this.specularMap.toJSON(p).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)g.specularIntensityMap=this.specularIntensityMap.toJSON(p).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)g.specularColorMap=this.specularColorMap.toJSON(p).uuid;if(this.envMap&&this.envMap.isTexture){if(g.envMap=this.envMap.toJSON(p).uuid,this.combine!==void 0)g.combine=this.combine}if(this.envMapRotation!==void 0)g.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)g.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)g.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)g.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)g.gradientMap=this.gradientMap.toJSON(p).uuid;if(this.transmission!==void 0)g.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)g.transmissionMap=this.transmissionMap.toJSON(p).uuid;if(this.thickness!==void 0)g.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)g.thicknessMap=this.thicknessMap.toJSON(p).uuid;if(this.attenuationDistance!==void 0)g.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)g.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)g.size=this.size;if(this.sizeAttenuation!==void 0)g.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)g.clippingPlanes=this.clippingPlanes.map((x)=>x.toJSON());if(this.rotation!==void 0)g.rotation=this.rotation;if(this.depthPacking!==void 0)g.depthPacking=this.depthPacking;if(this.linewidth!==void 0)g.linewidth=this.linewidth;if(this.linecap!==void 0)g.linecap=this.linecap;if(this.linejoin!==void 0)g.linejoin=this.linejoin;if(this.dashSize!==void 0)g.dashSize=this.dashSize;if(this.gapSize!==void 0)g.gapSize=this.gapSize;if(this.scale!==void 0)g.scale=this.scale;if(this.wireframe!==void 0)g.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)g.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)g.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)g.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)g.flatShading=this.flatShading;if(this.fog!==void 0)g.fog=this.fog;if(Object.keys(this.userData).length>0)g.userData=this.userData;function _(x){let v=[];for(let y in x){let S=x[y];delete S.metadata,v.push(S)}return v}if(m){let x=_(p.textures),v=_(p.images);if(x.length>0)g.textures=x;if(v.length>0)g.images=v}return g}fromJSON(p,m){if(p.uuid!==void 0)this.uuid=p.uuid;if(p.name!==void 0)this.name=p.name;if(p.color!==void 0&&this.color!==void 0)this.color.setHex(p.color);if(p.roughness!==void 0)this.roughness=p.roughness;if(p.metalness!==void 0)this.metalness=p.metalness;if(p.sheen!==void 0)this.sheen=p.sheen;if(p.sheenColor!==void 0)this.sheenColor=new oe().setHex(p.sheenColor);if(p.sheenRoughness!==void 0)this.sheenRoughness=p.sheenRoughness;if(p.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(p.emissive);if(p.specular!==void 0&&this.specular!==void 0)this.specular.setHex(p.specular);if(p.specularIntensity!==void 0)this.specularIntensity=p.specularIntensity;if(p.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(p.specularColor);if(p.shininess!==void 0)this.shininess=p.shininess;if(p.clearcoat!==void 0)this.clearcoat=p.clearcoat;if(p.clearcoatRoughness!==void 0)this.clearcoatRoughness=p.clearcoatRoughness;if(p.diffuseRoughness!==void 0)this.diffuseRoughness=p.diffuseRoughness;if(p.dispersion!==void 0)this.dispersion=p.dispersion;if(p.retroreflectivity!==void 0)this.retroreflectivity=p.retroreflectivity;if(p.iridescence!==void 0)this.iridescence=p.iridescence;if(p.iridescenceIOR!==void 0)this.iridescenceIOR=p.iridescenceIOR;if(p.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessMinimum;if(p.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=p.iridescenceThicknessMaximum;if(p.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=p.iridescenceThicknessRange[1];if(p.transmission!==void 0)this.transmission=p.transmission;if(p.thickness!==void 0)this.thickness=p.thickness;if(p.attenuationDistance!==void 0)this.attenuationDistance=p.attenuationDistance;if(p.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(p.attenuationColor);if(p.anisotropy!==void 0)this.anisotropy=p.anisotropy;if(p.anisotropyRotation!==void 0)this.anisotropyRotation=p.anisotropyRotation;if(p.fog!==void 0)this.fog=p.fog;if(p.flatShading!==void 0)this.flatShading=p.flatShading;if(p.blending!==void 0)this.blending=p.blending;if(p.combine!==void 0)this.combine=p.combine;if(p.side!==void 0)this.side=p.side;if(p.shadowSide!==void 0)this.shadowSide=p.shadowSide;if(p.opacity!==void 0)this.opacity=p.opacity;if(p.transparent!==void 0)this.transparent=p.transparent;if(p.alphaTest!==void 0)this.alphaTest=p.alphaTest;if(p.alphaHash!==void 0)this.alphaHash=p.alphaHash;if(p.depthFunc!==void 0)this.depthFunc=p.depthFunc;if(p.depthTest!==void 0)this.depthTest=p.depthTest;if(p.depthWrite!==void 0)this.depthWrite=p.depthWrite;if(p.colorWrite!==void 0)this.colorWrite=p.colorWrite;if(p.clippingPlanes!==void 0)this.clippingPlanes=p.clippingPlanes.map((g)=>new nn().fromJSON(g));if(p.clipIntersection!==void 0)this.clipIntersection=p.clipIntersection;if(p.clipShadows!==void 0)this.clipShadows=p.clipShadows;if(p.depthPacking!==void 0)this.depthPacking=p.depthPacking;if(p.blendSrc!==void 0)this.blendSrc=p.blendSrc;if(p.blendDst!==void 0)this.blendDst=p.blendDst;if(p.blendEquation!==void 0)this.blendEquation=p.blendEquation;if(p.blendSrcAlpha!==void 0)this.blendSrcAlpha=p.blendSrcAlpha;if(p.blendDstAlpha!==void 0)this.blendDstAlpha=p.blendDstAlpha;if(p.blendEquationAlpha!==void 0)this.blendEquationAlpha=p.blendEquationAlpha;if(p.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(p.blendColor);if(p.blendAlpha!==void 0)this.blendAlpha=p.blendAlpha;if(p.stencilWriteMask!==void 0)this.stencilWriteMask=p.stencilWriteMask;if(p.stencilFunc!==void 0)this.stencilFunc=p.stencilFunc;if(p.stencilRef!==void 0)this.stencilRef=p.stencilRef;if(p.stencilFuncMask!==void 0)this.stencilFuncMask=p.stencilFuncMask;if(p.stencilFail!==void 0)this.stencilFail=p.stencilFail;if(p.stencilZFail!==void 0)this.stencilZFail=p.stencilZFail;if(p.stencilZPass!==void 0)this.stencilZPass=p.stencilZPass;if(p.stencilWrite!==void 0)this.stencilWrite=p.stencilWrite;if(p.wireframe!==void 0)this.wireframe=p.wireframe;if(p.wireframeLinewidth!==void 0)this.wireframeLinewidth=p.wireframeLinewidth;if(p.wireframeLinecap!==void 0)this.wireframeLinecap=p.wireframeLinecap;if(p.wireframeLinejoin!==void 0)this.wireframeLinejoin=p.wireframeLinejoin;if(p.rotation!==void 0)this.rotation=p.rotation;if(p.linewidth!==void 0)this.linewidth=p.linewidth;if(p.linecap!==void 0)this.linecap=p.linecap;if(p.linejoin!==void 0)this.linejoin=p.linejoin;if(p.dashSize!==void 0)this.dashSize=p.dashSize;if(p.gapSize!==void 0)this.gapSize=p.gapSize;if(p.scale!==void 0)this.scale=p.scale;if(p.polygonOffset!==void 0)this.polygonOffset=p.polygonOffset;if(p.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=p.polygonOffsetFactor;if(p.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=p.polygonOffsetUnits;if(p.dithering!==void 0)this.dithering=p.dithering;if(p.alphaToCoverage!==void 0)this.alphaToCoverage=p.alphaToCoverage;if(p.premultipliedAlpha!==void 0)this.premultipliedAlpha=p.premultipliedAlpha;if(p.forceSinglePass!==void 0)this.forceSinglePass=p.forceSinglePass;if(p.allowOverride!==void 0)this.allowOverride=p.allowOverride;if(p.visible!==void 0)this.visible=p.visible;if(p.toneMapped!==void 0)this.toneMapped=p.toneMapped;if(p.userData!==void 0)this.userData=p.userData;if(p.vertexColors!==void 0)if(typeof p.vertexColors==="number")this.vertexColors=p.vertexColors>0;else this.vertexColors=p.vertexColors;if(p.size!==void 0)this.size=p.size;if(p.sizeAttenuation!==void 0)this.sizeAttenuation=p.sizeAttenuation;if(p.map!==void 0)this.map=m[p.map]||null;if(p.matcap!==void 0)this.matcap=m[p.matcap]||null;if(p.alphaMap!==void 0)this.alphaMap=m[p.alphaMap]||null;if(p.bumpMap!==void 0)this.bumpMap=m[p.bumpMap]||null;if(p.bumpScale!==void 0)this.bumpScale=p.bumpScale;if(p.normalMap!==void 0)this.normalMap=m[p.normalMap]||null;if(p.normalMapType!==void 0)this.normalMapType=p.normalMapType;if(p.normalScale!==void 0){let g=p.normalScale;if(Array.isArray(g)===!1)g=[g,g];this.normalScale=new Jt().fromArray(g)}if(p.displacementMap!==void 0)this.displacementMap=m[p.displacementMap]||null;if(p.displacementScale!==void 0)this.displacementScale=p.displacementScale;if(p.displacementBias!==void 0)this.displacementBias=p.displacementBias;if(p.roughnessMap!==void 0)this.roughnessMap=m[p.roughnessMap]||null;if(p.metalnessMap!==void 0)this.metalnessMap=m[p.metalnessMap]||null;if(p.emissiveMap!==void 0)this.emissiveMap=m[p.emissiveMap]||null;if(p.emissiveIntensity!==void 0)this.emissiveIntensity=p.emissiveIntensity;if(p.specularMap!==void 0)this.specularMap=m[p.specularMap]||null;if(p.specularIntensityMap!==void 0)this.specularIntensityMap=m[p.specularIntensityMap]||null;if(p.specularColorMap!==void 0)this.specularColorMap=m[p.specularColorMap]||null;if(p.envMap!==void 0)this.envMap=m[p.envMap]||null;if(p.envMapRotation!==void 0)this.envMapRotation.fromArray(p.envMapRotation);if(p.envMapIntensity!==void 0)this.envMapIntensity=p.envMapIntensity;if(p.reflectivity!==void 0)this.reflectivity=p.reflectivity;if(p.refractionRatio!==void 0)this.refractionRatio=p.refractionRatio;if(p.lightMap!==void 0)this.lightMap=m[p.lightMap]||null;if(p.lightMapIntensity!==void 0)this.lightMapIntensity=p.lightMapIntensity;if(p.aoMap!==void 0)this.aoMap=m[p.aoMap]||null;if(p.aoMapIntensity!==void 0)this.aoMapIntensity=p.aoMapIntensity;if(p.gradientMap!==void 0)this.gradientMap=m[p.gradientMap]||null;if(p.clearcoatMap!==void 0)this.clearcoatMap=m[p.clearcoatMap]||null;if(p.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=m[p.clearcoatRoughnessMap]||null;if(p.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=m[p.clearcoatNormalMap]||null;if(p.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Jt().fromArray(p.clearcoatNormalScale);if(p.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=m[p.diffuseRoughnessMap]||null;if(p.iridescenceMap!==void 0)this.iridescenceMap=m[p.iridescenceMap]||null;if(p.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=m[p.iridescenceThicknessMap]||null;if(p.transmissionMap!==void 0)this.transmissionMap=m[p.transmissionMap]||null;if(p.thicknessMap!==void 0)this.thicknessMap=m[p.thicknessMap]||null;if(p.anisotropyMap!==void 0)this.anisotropyMap=m[p.anisotropyMap]||null;if(p.sheenColorMap!==void 0)this.sheenColorMap=m[p.sheenColorMap]||null;if(p.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=m[p.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(p){this.name=p.name,this.blending=p.blending,this.side=p.side,this.vertexColors=p.vertexColors,this.opacity=p.opacity,this.transparent=p.transparent,this.blendSrc=p.blendSrc,this.blendDst=p.blendDst,this.blendEquation=p.blendEquation,this.blendSrcAlpha=p.blendSrcAlpha,this.blendDstAlpha=p.blendDstAlpha,this.blendEquationAlpha=p.blendEquationAlpha,this.blendColor.copy(p.blendColor),this.blendAlpha=p.blendAlpha,this.depthFunc=p.depthFunc,this.depthTest=p.depthTest,this.depthWrite=p.depthWrite,this.stencilWriteMask=p.stencilWriteMask,this.stencilFunc=p.stencilFunc,this.stencilRef=p.stencilRef,this.stencilFuncMask=p.stencilFuncMask,this.stencilFail=p.stencilFail,this.stencilZFail=p.stencilZFail,this.stencilZPass=p.stencilZPass,this.stencilWrite=p.stencilWrite;let m=p.clippingPlanes,g=null;if(m!==null){let _=m.length;g=Array(_);for(let x=0;x!==_;++x)g[x]=m[x].clone()}return this.clippingPlanes=g,this.clipIntersection=p.clipIntersection,this.clipShadows=p.clipShadows,this.shadowSide=p.shadowSide,this.colorWrite=p.colorWrite,this.precision=p.precision,this.polygonOffset=p.polygonOffset,this.polygonOffsetFactor=p.polygonOffsetFactor,this.polygonOffsetUnits=p.polygonOffsetUnits,this.dithering=p.dithering,this.alphaTest=p.alphaTest,this.alphaHash=p.alphaHash,this.alphaToCoverage=p.alphaToCoverage,this.premultipliedAlpha=p.premultipliedAlpha,this.forceSinglePass=p.forceSinglePass,this.allowOverride=p.allowOverride,this.visible=p.visible,this.toneMapped=p.toneMapped,this.userData=JSON.parse(JSON.stringify(p.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(p){if(p===!0)this.version++}}var pi=new Y,Zl=new Y,Ro=new Y,Co=new Y;class ki{constructor(p=new Y,m=new Y(0,0,-1)){this.origin=p,this.direction=m}set(p,m){return this.origin.copy(p),this.direction.copy(m),this}copy(p){return this.origin.copy(p.origin),this.direction.copy(p.direction),this}at(p,m){return m.copy(this.origin).addScaledVector(this.direction,p)}lookAt(p){return this.direction.copy(p).sub(this.origin).normalize(),this}recast(p){return this.origin.copy(this.at(p,pi)),this}closestPointToPoint(p,m){m.subVectors(p,this.origin);let g=m.dot(this.direction);if(g<0)return m.copy(this.origin);return m.copy(this.origin).addScaledVector(this.direction,g)}distanceToPoint(p){return Math.sqrt(this.distanceSqToPoint(p))}distanceSqToPoint(p){let m=pi.subVectors(p,this.origin).dot(this.direction);if(m<0)return this.origin.distanceToSquared(p);return pi.copy(this.origin).addScaledVector(this.direction,m),pi.distanceToSquared(p)}distanceSqToSegment(p,m,g,_){Zl.copy(p).add(m).multiplyScalar(0.5),Ro.copy(m).sub(p).normalize(),Co.copy(this.origin).sub(Zl);let x=p.distanceTo(m)*0.5,v=-this.direction.dot(Ro),y=Co.dot(this.direction),S=-Co.dot(Ro),b=Co.lengthSq(),M=Math.abs(1-v*v),T,w,E,A;if(M>0)if(T=v*S-y,w=v*y-S,A=x*M,T>=0)if(w>=-A)if(w<=A){let C=1/M;T*=C,w*=C,E=T*(T+v*w+2*y)+w*(v*T+w+2*S)+b}else w=x,T=Math.max(0,-(v*w+y)),E=-T*T+w*(w+2*S)+b;else w=-x,T=Math.max(0,-(v*w+y)),E=-T*T+w*(w+2*S)+b;else if(w<=-A)T=Math.max(0,-(-v*x+y)),w=T>0?-x:Math.min(Math.max(-x,-S),x),E=-T*T+w*(w+2*S)+b;else if(w<=A)T=0,w=Math.min(Math.max(-x,-S),x),E=w*(w+2*S)+b;else T=Math.max(0,-(v*x+y)),w=T>0?x:Math.min(Math.max(-x,-S),x),E=-T*T+w*(w+2*S)+b;else w=v>0?-x:x,T=Math.max(0,-(v*w+y)),E=-T*T+w*(w+2*S)+b;if(g)g.copy(this.origin).addScaledVector(this.direction,T);if(_)_.copy(Zl).addScaledVector(Ro,w);return E}intersectSphere(p,m){if(p.radius<0)return null;pi.subVectors(p.center,this.origin);let g=pi.dot(this.direction),_=pi.dot(pi)-g*g,x=p.radius*p.radius;if(_>x)return null;let v=Math.sqrt(x-_),y=g-v,S=g+v;if(S<0)return null;if(y<0)return this.at(S,m);return this.at(y,m)}intersectsSphere(p){if(p.radius<0)return!1;return this.distanceSqToPoint(p.center)<=p.radius*p.radius}distanceToPlane(p){let m=p.normal.dot(this.direction);if(m===0){if(p.distanceToPoint(this.origin)===0)return 0;return null}let g=-(this.origin.dot(p.normal)+p.constant)/m;return g>=0?g:null}intersectPlane(p,m){let g=this.distanceToPlane(p);if(g===null)return null;return this.at(g,m)}intersectsPlane(p){let m=p.distanceToPoint(this.origin);if(m===0)return!0;if(p.normal.dot(this.direction)*m<0)return!0;return!1}intersectBox(p,m){let g,_,x,v,y,S,b=1/this.direction.x,M=1/this.direction.y,T=1/this.direction.z,w=this.origin;if(b>=0)g=(p.min.x-w.x)*b,_=(p.max.x-w.x)*b;else g=(p.max.x-w.x)*b,_=(p.min.x-w.x)*b;if(M>=0)x=(p.min.y-w.y)*M,v=(p.max.y-w.y)*M;else x=(p.max.y-w.y)*M,v=(p.min.y-w.y)*M;if(g>v||x>_)return null;if(x>g||isNaN(g))g=x;if(v<_||isNaN(_))_=v;if(T>=0)y=(p.min.z-w.z)*T,S=(p.max.z-w.z)*T;else y=(p.max.z-w.z)*T,S=(p.min.z-w.z)*T;if(g>S||y>_)return null;if(y>g||g!==g)g=y;if(S<_||_!==_)_=S;if(_<0)return null;return this.at(g>=0?g:_,m)}intersectsBox(p){return this.intersectBox(p,pi)!==null}intersectTriangle(p,m,g,_,x){let v=this.origin,y=this.direction,{x:S,y:b,z:M}=y,T=p.x-v.x,w=p.y-v.y,E=p.z-v.z,A=m.x-v.x,C=m.y-v.y,D=m.z-v.z,R=g.x-v.x,P=g.y-v.y,L=g.z-v.z,U=Math.abs(S),N=Math.abs(b),F=Math.abs(M),z,I,O,V,q,H,W,J,G,Q,it,tt;if(U>=N&&U>=F)if(O=S,H=T,G=A,tt=R,S>=0)z=b,I=M,V=w,q=E,W=C,J=D,Q=P,it=L;else z=M,I=b,V=E,q=w,W=D,J=C,Q=L,it=P;else if(N>=F)if(O=b,H=w,G=C,tt=P,b>=0)z=M,I=S,V=E,q=T,W=D,J=A,Q=L,it=R;else z=S,I=M,V=T,q=E,W=A,J=D,Q=R,it=L;else if(O=M,H=E,G=D,tt=L,M>=0)z=S,I=b,V=T,q=w,W=A,J=C,Q=R,it=P;else z=b,I=S,V=w,q=T,W=C,J=A,Q=P,it=R;if(O===0)return null;let pt=z/O,ot=I/O,dt=1/O,_t=V-pt*H,Dt=q-ot*H,at=W-pt*G,mt=J-ot*G,At=Q-pt*tt,Ht=it-ot*tt,Ft=At*mt-Ht*at,Rt=_t*Ht-Dt*At,ae=at*Dt-mt*_t;if(_){if(Ft<0||Rt<0||ae<0)return null}else if((Ft<0||Rt<0||ae<0)&&(Ft>0||Rt>0||ae>0))return null;let Kt=Ft+Rt+ae;if(Kt===0)return null;let Ut=dt*(Ft*H+Rt*G+ae*tt);if(Kt>0?Ut<0:Ut>0)return null;return this.at(Ut/Kt,x)}applyMatrix4(p){return this.origin.applyMatrix4(p),this.direction.transformDirection(p),this}equals(p){return p.origin.equals(this.origin)&&p.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class uh extends Mi{constructor(p){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.fog=p.fog,this}}var kd=new re,ts=new ki,Po=new bn,zd=new Y,Io=new Y,Lo=new Y,No=new Y,$l=new Y,Do=new Y,Hd=new Y,Uo=new Y;class rn extends Xe{constructor(p=new qe,m=new uh){super();this.isMesh=!0,this.type="Mesh",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,v=_.length;x<v;x++){let y=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[y]=x}}}}getVertexPosition(p,m){let g=this.geometry,_=g.attributes.position,x=g.morphAttributes.position,v=g.morphTargetsRelative;m.fromBufferAttribute(_,p);let y=this.morphTargetInfluences;if(x&&y){Do.set(0,0,0);for(let S=0,b=x.length;S<b;S++){let M=y[S],T=x[S];if(M===0)continue;if($l.fromBufferAttribute(T,p),v)Do.addScaledVector($l,M);else Do.addScaledVector($l.sub(m),M)}m.add(Do)}return m}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.material,x=this.matrixWorld;if(_===void 0)return;if(g.boundingSphere===null)g.computeBoundingSphere();if(Po.copy(g.boundingSphere),Po.applyMatrix4(x),ts.copy(p.ray).recast(p.near),Po.containsPoint(ts.origin)===!1){if(ts.intersectSphere(Po,zd)===null)return;if(ts.origin.distanceToSquared(zd)>(p.far-p.near)**2)return}if(kd.copy(x).invert(),ts.copy(p.ray).applyMatrix4(kd),g.boundingBox!==null){if(ts.intersectsBox(g.boundingBox)===!1)return}this._computeIntersections(p,m,ts)}_computeIntersections(p,m,g){let _,x=this.geometry,v=this.material,y=x.index,S=x.attributes.position,b=x.attributes.uv,M=x.attributes.uv1,T=x.attributes.normal,{groups:w,drawRange:E}=x;if(y!==null)if(Array.isArray(v))for(let A=0,C=w.length;A<C;A++){let D=w[A],R=v[D.materialIndex],P=Math.max(D.start,E.start),L=Math.min(y.count,Math.min(D.start+D.count,E.start+E.count));for(let U=P,N=L;U<N;U+=3){let F=y.getX(U),z=y.getX(U+1),I=y.getX(U+2);if(_=Oo(this,R,p,g,b,M,T,F,z,I),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=D.materialIndex,m.push(_)}}else{let A=Math.max(0,E.start),C=Math.min(y.count,E.start+E.count);for(let D=A,R=C;D<R;D+=3){let P=y.getX(D),L=y.getX(D+1),U=y.getX(D+2);if(_=Oo(this,v,p,g,b,M,T,P,L,U),_)_.faceIndex=Math.floor(D/3),m.push(_)}}else if(S!==void 0)if(Array.isArray(v))for(let A=0,C=w.length;A<C;A++){let D=w[A],R=v[D.materialIndex],P=Math.max(D.start,E.start),L=Math.min(S.count,Math.min(D.start+D.count,E.start+E.count));for(let U=P,N=L;U<N;U+=3){let F=U,z=U+1,I=U+2;if(_=Oo(this,R,p,g,b,M,T,F,z,I),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=D.materialIndex,m.push(_)}}else{let A=Math.max(0,E.start),C=Math.min(S.count,E.start+E.count);for(let D=A,R=C;D<R;D+=3){let P=D,L=D+1,U=D+2;if(_=Oo(this,v,p,g,b,M,T,P,L,U),_)_.faceIndex=Math.floor(D/3),m.push(_)}}}}function B_(p,m,g,_,x,v,y,S){let b;if(m.side===1)b=_.intersectTriangle(y,v,x,!0,S);else b=_.intersectTriangle(x,v,y,m.side===0,S);if(b===null)return null;Uo.copy(S),Uo.applyMatrix4(p.matrixWorld);let M=g.ray.origin.distanceTo(Uo);if(M<g.near||M>g.far)return null;return{distance:M,point:Uo.clone(),object:p}}function Oo(p,m,g,_,x,v,y,S,b,M){p.getVertexPosition(S,Io),p.getVertexPosition(b,Lo),p.getVertexPosition(M,No);let T=B_(p,m,g,_,Io,Lo,No,Hd);if(T){let w=new Y;if(Ge.getBarycoord(Hd,Io,Lo,No,w),x)T.uv=Ge.getInterpolatedAttribute(x,S,b,M,w,new Jt);if(v)T.uv1=Ge.getInterpolatedAttribute(v,S,b,M,w,new Jt);if(y){if(T.normal=Ge.getInterpolatedAttribute(y,S,b,M,w,new Y),T.normal.dot(_.direction)>0)T.normal.multiplyScalar(-1)}let E={a:S,b,c:M,normal:new Y,materialIndex:0};Ge.getNormal(Io,Lo,No,E.normal),T.face=E,T.barycoord=w}return T}class Bs extends Ve{constructor(p=null,m=1,g=1,_,x,v,y,S,b=1003,M=1003,T,w){super(null,v,y,S,b,M,_,x,T,w);this.isDataTexture=!0,this.image={data:p,width:m,height:g},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var es=new bn,k_=new Jt(0.5,0.5),Fo=new Y;class Di{constructor(p=new nn,m=new nn,g=new nn,_=new nn,x=new nn,v=new nn){this.planes=[p,m,g,_,x,v]}set(p,m,g,_,x,v){let y=this.planes;return y[0].copy(p),y[1].copy(m),y[2].copy(g),y[3].copy(_),y[4].copy(x),y[5].copy(v),this}copy(p){let m=this.planes;for(let g=0;g<6;g++)m[g].copy(p.planes[g]);return this}setFromProjectionMatrix(p,m=2000,g=!1){let _=this.planes,x=p.elements,v=x[0],y=x[1],S=x[2],b=x[3],M=x[4],T=x[5],w=x[6],E=x[7],A=x[8],C=x[9],D=x[10],R=x[11],P=x[12],L=x[13],U=x[14],N=x[15];if(_[0].setComponents(b-v,E-M,R-A,N-P).normalize(),_[1].setComponents(b+v,E+M,R+A,N+P).normalize(),_[2].setComponents(b+y,E+T,R+C,N+L).normalize(),_[3].setComponents(b-y,E-T,R-C,N-L).normalize(),g)_[4].setComponents(S,w,D,U).normalize(),_[5].setComponents(b-S,E-w,R-D,N-U).normalize();else if(_[4].setComponents(b-S,E-w,R-D,N-U).normalize(),m===2000)_[5].setComponents(b+S,E+w,R+D,N+U).normalize();else if(m===2001)_[5].setComponents(S,w,D,U).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+m);return this}intersectsObject(p){if(p.boundingSphere!==void 0){if(p.boundingSphere===null)p.computeBoundingSphere();es.copy(p.boundingSphere).applyMatrix4(p.matrixWorld)}else{let m=p.geometry;if(m.boundingSphere===null)m.computeBoundingSphere();es.copy(m.boundingSphere).applyMatrix4(p.matrixWorld)}return this.intersectsSphere(es)}intersectsSprite(p){es.center.set(0,0,0);let m=k_.distanceTo(p.center);return es.radius=0.7071067811865476+m,es.applyMatrix4(p.matrixWorld),this.intersectsSphere(es)}intersectsSphere(p){let m=this.planes,g=p.center,_=-p.radius;for(let x=0;x<6;x++)if(m[x].distanceToPoint(g)<_)return!1;return!0}intersectsBox(p){let m=this.planes;for(let g=0;g<6;g++){let _=m[g];if(Fo.x=_.normal.x>0?p.max.x:p.min.x,Fo.y=_.normal.y>0?p.max.y:p.min.y,Fo.z=_.normal.z>0?p.max.z:p.min.z,_.distanceToPoint(Fo)<0)return!1}return!0}containsPoint(p){let m=this.planes;for(let g=0;g<6;g++)if(m[g].distanceToPoint(p)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var Gd=new re;class Hr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(p){let m=p.cameras,g=this._frustums;for(let _=0;_<m.length;_++){let x=m[_];if(Gd.multiplyMatrices(x.projectionMatrix,x.matrixWorldInverse),g[_]===void 0)g[_]=new Di;g[_].setFromProjectionMatrix(Gd,x.coordinateSystem,x.reversedDepth)}return this._count=m.length,this}getFrustum(p){return this._frustums[p]}intersectsObject(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsObject(p))return!0;return!1}intersectsSprite(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSprite(p))return!0;return!1}intersectsSphere(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSphere(p))return!0;return!1}intersectsBox(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsBox(p))return!0;return!1}containsPoint(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].containsPoint(p))return!0;return!1}copy(p){this.coordinateSystem=p.coordinateSystem;let m=this._frustums,g=p._frustums;for(let _=0;_<p._count;_++){if(m[_]===void 0)m[_]=new Di;m[_].copy(g[_])}return this._count=p._count,this}clone(){return new Hr().copy(this)}}function Jl(p,m){return p-m}function z_(p,m){return p.z-m.z}function H_(p,m){return m.z-p.z}class lp{constructor(){this.index=0,this.pool=[],this.list=[]}push(p,m,g,_){let x=this.pool,v=this.list;if(this.index>=x.length)x.push({start:-1,count:-1,z:-1,index:-1});let y=x[this.index];v.push(y),this.index++,y.start=p,y.count=m,y.z=g,y.index=_}reset(){this.list.length=0,this.index=0}}var Tn=new re,G_=new oe(1,1,1),V_=new Di,W_=new Hr,Bo=new ve,ns=new bn,Kl=new Y,Vd=new Y,Wd=new Y,X_=new Y,jl=new lp,dn=new rn,ko=[];function q_(p,m,g=0){let _=m.itemSize;if(p.isInterleavedBufferAttribute||p.array.constructor!==m.array.constructor){let x=p.count;for(let v=0;v<x;v++)for(let y=0;y<_;y++)m.setComponent(v+g,y,p.getComponent(v,y))}else m.array.set(p.array,g*_);m.needsUpdate=!0}function ti(p,m){if(p.constructor!==m.constructor){let g=Math.min(p.length,m.length);for(let _=0;_<g;_++)m[_]=p[_]}else{let g=Math.min(p.length,m.length);m.set(new p.constructor(p.buffer,0,g))}}class ua extends rn{constructor(p,m,g=m*2,_){super(new qe,_);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=p,this._maxVertexCount=m,this._maxIndexCount=g,this._multiDrawCounts=new Int32Array(p),this._multiDrawStarts=new Int32Array(p),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(p),this._mergedDrawStarts=new Int32Array(p),this._mergedDrawInstanceCounts=new Int32Array(p),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let p=Math.sqrt(this._maxInstanceCount*4);p=Math.ceil(p/4)*4,p=Math.max(p,4);let m=new Float32Array(p*p*4),g=new Bs(m,p,p,1023,1015);this._matricesTexture=g}_initIndirectTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Uint32Array(p*p),g=new Bs(m,p,p,1029,1014);this._indirectTexture=g}_initColorsTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Float32Array(p*p*4).fill(1),g=new Bs(m,p,p,1023,1015);g.colorSpace=he.workingColorSpace,this._colorsTexture=g}_initializeGeometry(p){let m=this.geometry,g=this._maxVertexCount,_=this._maxIndexCount;if(this._geometryInitialized===!1){for(let x in p.attributes){let v=p.getAttribute(x),{array:y,itemSize:S,normalized:b}=v,M=new y.constructor(g*S),T=new We(M,S,b);m.setAttribute(x,T)}if(p.getIndex()!==null){let x=g>65535?new Uint32Array(_):new Uint16Array(_);m.setIndex(new We(x,1))}this._geometryInitialized=!0}}_validateGeometry(p){let m=this.geometry;if(Boolean(p.getIndex())!==Boolean(m.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let g in m.attributes){if(!p.hasAttribute(g))throw Error(`THREE.BatchedMesh: Added geometry missing "${g}". All geometries must have consistent attributes.`);let _=p.getAttribute(g),x=m.getAttribute(g);if(_.itemSize!==x.itemSize||_.normalized!==x.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${g}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(p){let m=this._instanceInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${p}. Instance is either out of range or has been deleted.`)}validateGeometryId(p){let m=this._geometryInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${p}. Geometry is either out of range or has been deleted.`)}setCustomSort(p){return this.customSort=p,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new ve;let p=this.boundingBox,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,Tn),this.getBoundingBoxAt(x,Bo).applyMatrix4(Tn),p.union(Bo)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new bn;let p=this.boundingSphere,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,Tn),this.getBoundingSphereAt(x,ns).applyMatrix4(Tn),p.union(ns)}}addInstance(p){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let g={visible:!0,active:!0,geometryIndex:p},_=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Jl),_=this._availableInstanceIds.shift(),this._instanceInfo[_]=g;else _=this._instanceInfo.length,this._instanceInfo.push(g);let x=this._matricesTexture;Tn.identity().toArray(x.image.data,_*16),x.needsUpdate=!0;let v=this._colorsTexture;if(v)G_.toArray(v.image.data,_*4),v.needsUpdate=!0;return this._visibilityChanged=!0,_}addGeometry(p,m=-1,g=-1){this._initializeGeometry(p),this._validateGeometry(p);let _={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},x=this._geometryInfo;_.vertexStart=this._nextVertexStart,_.reservedVertexCount=m===-1?p.getAttribute("position").count:m;let v=p.getIndex();if(v!==null)_.indexStart=this._nextIndexStart,_.reservedIndexCount=g===-1?v.count:g;if(_.indexStart!==-1&&_.indexStart+_.reservedIndexCount>this._maxIndexCount||_.vertexStart+_.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let S;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Jl),S=this._availableGeometryIds.shift(),x[S]=_;else S=this._geometryCount,this._geometryCount++,x.push(_);return this.setGeometryAt(S,p),this._nextIndexStart=_.indexStart+_.reservedIndexCount,this._nextVertexStart=_.vertexStart+_.reservedVertexCount,S}setGeometryAt(p,m){if(p>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(m);let g=this.geometry,_=g.getIndex()!==null,x=g.getIndex(),v=m.getIndex(),y=this._geometryInfo[p];if(_&&v.count>y.reservedIndexCount||m.attributes.position.count>y.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:S,reservedVertexCount:b}=y;y.vertexCount=m.getAttribute("position").count;for(let M in g.attributes){let T=m.getAttribute(M),w=g.getAttribute(M);q_(T,w,S);let E=T.itemSize;for(let A=T.count,C=b;A<C;A++){let D=S+A;for(let R=0;R<E;R++)w.setComponent(D,R,0)}w.needsUpdate=!0,w.addUpdateRange(S*E,b*E)}if(_){let{indexStart:M,reservedIndexCount:T}=y;y.indexCount=m.getIndex().count;for(let w=0;w<v.count;w++)x.setX(M+w,S+v.getX(w));for(let w=v.count,E=T;w<E;w++)x.setX(M+w,S);x.needsUpdate=!0,x.addUpdateRange(M,y.reservedIndexCount)}if(y.start=_?y.indexStart:y.vertexStart,y.count=_?y.indexCount:y.vertexCount,y.boundingBox=null,m.boundingBox!==null)y.boundingBox=m.boundingBox.clone();if(y.boundingSphere=null,m.boundingSphere!==null)y.boundingSphere=m.boundingSphere.clone();return this._visibilityChanged=!0,p}deleteGeometry(p){let m=this._geometryInfo;if(p>=m.length||m[p].active===!1)return this;let g=this._instanceInfo;for(let _=0,x=g.length;_<x;_++)if(g[_].active&&g[_].geometryIndex===p)this.deleteInstance(_);return m[p].active=!1,this._availableGeometryIds.push(p),this._visibilityChanged=!0,this}deleteInstance(p){return this.validateInstanceId(p),this._instanceInfo[p].active=!1,this._availableInstanceIds.push(p),this._visibilityChanged=!0,this}optimize(){let p=0,m=0,g=this._geometryInfo,_=g.map((v,y)=>y).sort((v,y)=>g[v].vertexStart-g[y].vertexStart),x=this.geometry;for(let v=0,y=g.length;v<y;v++){let S=_[v],b=g[S];if(b.active===!1)continue;if(x.index!==null){if(b.indexStart!==m){let{indexStart:M,vertexStart:T,reservedIndexCount:w}=b,E=x.index,A=E.array,C=p-T;for(let D=M;D<M+w;D++)A[D]=A[D]+C;E.array.copyWithin(m,M,M+w),E.addUpdateRange(m,w),E.needsUpdate=!0,b.indexStart=m}m+=b.reservedIndexCount}if(b.vertexStart!==p){let{vertexStart:M,reservedVertexCount:T}=b,w=x.attributes;for(let E in w){let A=w[E],{array:C,itemSize:D}=A;C.copyWithin(p*D,M*D,(M+T)*D),A.addUpdateRange(p*D,T*D),A.needsUpdate=!0}b.vertexStart=p}p+=b.reservedVertexCount,b.start=x.index?b.indexStart:b.vertexStart}return this._nextIndexStart=m,this._nextVertexStart=p,this._visibilityChanged=!0,this}getBoundingBoxAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingBox===null){let x=new ve,v=g.index,y=g.attributes.position;for(let S=_.start,b=_.start+_.count;S<b;S++){let M=S;if(v)M=v.getX(M);x.expandByPoint(Kl.fromBufferAttribute(y,M))}_.boundingBox=x}return m.copy(_.boundingBox),m}getBoundingSphereAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingSphere===null){let x=new bn;this.getBoundingBoxAt(p,Bo),Bo.getCenter(x.center);let v=g.index,y=g.attributes.position,S=0;for(let b=_.start,M=_.start+_.count;b<M;b++){let T=b;if(v)T=v.getX(T);Kl.fromBufferAttribute(y,T),S=Math.max(S,x.center.distanceToSquared(Kl))}x.radius=Math.sqrt(S),_.boundingSphere=x}return m.copy(_.boundingSphere),m}setMatrixAt(p,m){this.validateInstanceId(p);let g=this._matricesTexture,_=this._matricesTexture.image.data;return m.toArray(_,p*16),g.needsUpdate=!0,this}getMatrixAt(p,m){return this.validateInstanceId(p),m.fromArray(this._matricesTexture.image.data,p*16)}setColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)this._initColorsTexture();return m.toArray(this._colorsTexture.image.data,p*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)if(m.isVector4)return m.set(1,1,1,1);else return m.setRGB(1,1,1);else return m.fromArray(this._colorsTexture.image.data,p*4)}setVisibleAt(p,m){if(this.validateInstanceId(p),this._instanceInfo[p].visible===m)return this;return this._instanceInfo[p].visible=m,this._visibilityChanged=!0,this}getVisibleAt(p){return this.validateInstanceId(p),this._instanceInfo[p].visible}setGeometryIdAt(p,m){return this.validateInstanceId(p),this.validateGeometryId(m),this._instanceInfo[p].geometryIndex=m,this._visibilityChanged=!0,this}getGeometryIdAt(p){return this.validateInstanceId(p),this._instanceInfo[p].geometryIndex}getGeometryRangeAt(p,m={}){this.validateGeometryId(p);let g=this._geometryInfo[p];return m.vertexStart=g.vertexStart,m.vertexCount=g.vertexCount,m.reservedVertexCount=g.reservedVertexCount,m.indexStart=g.indexStart,m.indexCount=g.indexCount,m.reservedIndexCount=g.reservedIndexCount,m.start=g.start,m.count=g.count,m}setInstanceCount(p){let m=this._availableInstanceIds,g=this._instanceInfo;m.sort(Jl);while(m[m.length-1]===g.length-1)g.pop(),m.pop();if(p<g.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${p} are being used. Cannot shrink instance count.`);let _=new Int32Array(p),x=new Int32Array(p);ti(this._multiDrawCounts,_),ti(this._multiDrawStarts,x),this._multiDrawCounts=_,this._multiDrawStarts=x;let v=new Int32Array(p),y=new Int32Array(p),S=new Int32Array(p);ti(this._mergedDrawCounts,v),ti(this._mergedDrawStarts,y),ti(this._mergedDrawInstanceCounts,S),this._mergedDrawCounts=v,this._mergedDrawStarts=y,this._mergedDrawInstanceCounts=S,this._maxInstanceCount=p;let b=this._indirectTexture,M=this._matricesTexture,T=this._colorsTexture;if(b.dispose(),this._initIndirectTexture(),ti(b.image.data,this._indirectTexture.image.data),M.dispose(),this._initMatricesTexture(),ti(M.image.data,this._matricesTexture.image.data),T)T.dispose(),this._initColorsTexture(),ti(T.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(p,m){let g=[...this._geometryInfo].filter((y)=>y.active);if(Math.max(...g.map((y)=>y.vertexStart+y.reservedVertexCount))>p)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${p}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...g.map((S)=>S.indexStart+S.reservedIndexCount))>m)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${m}. Cannot shrink further.`)}let x=this.geometry;if(x.dispose(),this._maxVertexCount=p,this._maxIndexCount=m,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new qe,this._initializeGeometry(x);let v=this.geometry;if(x.index)ti(x.index.array,v.index.array);for(let y in x.attributes)ti(x.attributes[y].array,v.attributes[y].array);this._visibilityChanged=!0}raycast(p,m){let g=this._instanceInfo,_=this._geometryInfo,x=this.matrixWorld,v=this.geometry;if(dn.material=this.material,dn.geometry.index=v.index,dn.geometry.attributes=v.attributes,dn.geometry.boundingBox===null)dn.geometry.boundingBox=new ve;if(dn.geometry.boundingSphere===null)dn.geometry.boundingSphere=new bn;for(let y=0,S=g.length;y<S;y++){if(!g[y].visible||!g[y].active)continue;let b=g[y].geometryIndex,M=_[b];dn.geometry.setDrawRange(M.start,M.count),this.getMatrixAt(y,dn.matrixWorld).premultiply(x),this.getBoundingBoxAt(b,dn.geometry.boundingBox),this.getBoundingSphereAt(b,dn.geometry.boundingSphere),dn.raycast(p,ko);for(let T=0,w=ko.length;T<w;T++){let E=ko[T];E.object=this,E.batchId=y,m.push(E)}ko.length=0}dn.material=null,dn.geometry.index=null,dn.geometry.attributes={},dn.geometry.setDrawRange(0,1/0)}copy(p){if(super.copy(p),this.geometry=p.geometry.clone(),this.perObjectFrustumCulled=p.perObjectFrustumCulled,this.sortObjects=p.sortObjects,this.boundingBox=p.boundingBox!==null?p.boundingBox.clone():null,this.boundingSphere=p.boundingSphere!==null?p.boundingSphere.clone():null,this._geometryInfo=p._geometryInfo.map((m)=>({...m,boundingBox:m.boundingBox!==null?m.boundingBox.clone():null,boundingSphere:m.boundingSphere!==null?m.boundingSphere.clone():null})),this._instanceInfo=p._instanceInfo.map((m)=>({...m})),this._availableInstanceIds=p._availableInstanceIds.slice(),this._availableGeometryIds=p._availableGeometryIds.slice(),this._nextIndexStart=p._nextIndexStart,this._nextVertexStart=p._nextVertexStart,this._geometryCount=p._geometryCount,this._maxInstanceCount=p._maxInstanceCount,this._maxVertexCount=p._maxVertexCount,this._maxIndexCount=p._maxIndexCount,this._geometryInitialized=p._geometryInitialized,this._multiDrawCounts=p._multiDrawCounts.slice(),this._multiDrawStarts=p._multiDrawStarts.slice(),this._multiDrawBytesPerElement=p._multiDrawBytesPerElement,this._mergedDrawCounts=p._mergedDrawCounts.slice(),this._mergedDrawStarts=p._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=p._mergedDrawInstanceCounts.slice(),this._indirectTexture=p._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=p._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),p._colorsTexture!==null)this._colorsTexture=p._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(p,m,g,_="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let x=m.getIndex(),v=x===null?1:x.array.BYTES_PER_ELEMENT,y=1;if(g.wireframe)y=2,v=m.attributes.position.count>65535?4:2;let S=this._instanceInfo,b=this._multiDrawStarts,M=this._multiDrawCounts,T=this._mergedDrawStarts,w=this._mergedDrawCounts,E=this._mergedDrawInstanceCounts,A=this._geometryInfo,C=this.perObjectFrustumCulled,D=this._indirectTexture,R=D.image.data,P=p.isArrayCamera?W_:V_;if(C)if(p.isArrayCamera)P.setFromArrayCamera(p);else Tn.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse).multiply(this.matrixWorld),P.setFromProjectionMatrix(Tn,p.coordinateSystem,p.reversedDepth);let L=0,U=0;if(this.sortObjects){Tn.copy(this.matrixWorld).invert(),Vd.setFromMatrixPosition(p.matrixWorld).applyMatrix4(Tn),Wd.set(0,0,-1).transformDirection(p.matrixWorld).transformDirection(Tn);for(let z=0,I=S.length;z<I;z++)if(S[z].visible&&S[z].active){let O=S[z].geometryIndex;this.getMatrixAt(z,Tn),this.getBoundingSphereAt(O,ns).applyMatrix4(Tn);let V=!1;if(C)V=!P.intersectsSphere(ns);if(!V){let q=A[O],H=X_.subVectors(ns.center,Vd).dot(Wd);jl.push(q.start,q.count,H,z)}}let N=jl.list,F=this.customSort;if(F===null)N.sort(g.transparent?H_:z_);else F.call(this,N,p);for(let z=0,I=N.length;z<I;z++){let O=N[z],V=O.start*v*y,q=O.count*y;if(_==="merged")if(U>0&&T[U-1]===V&&w[U-1]===q)E[U-1]++;else T[U]=V,w[U]=q,E[U]=1,U++;else b[L]=V,M[L]=q;R[L]=O.index,L++}jl.reset()}else for(let N=0,F=S.length;N<F;N++)if(S[N].visible&&S[N].active){let z=S[N].geometryIndex,I=!1;if(C)this.getMatrixAt(N,Tn),this.getBoundingSphereAt(z,ns).applyMatrix4(Tn),I=!P.intersectsSphere(ns);if(!I){let O=A[z],V=O.start*v*y,q=O.count*y;if(_==="merged")if(U>0&&T[U-1]===V&&w[U-1]===q)E[U-1]++;else T[U]=V,w[U]=q,E[U]=1,U++;else b[L]=V,M[L]=q;R[L]=N,L++}}D.needsUpdate=!0,this._multiDrawCount=L,this._mergedDrawCount=U,this._multiDrawBytesPerElement=v,this._visibilityChanged=!1}onBeforeRender(p,m,g,_,x){if(p.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(g,_,x)}onBeforeShadow(p,m,g,_,x,v){if(p.isWebGPURenderer!==!0)this._updateDrawParameters(_,x,v)}}class zi extends Mi{constructor(p){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.linewidth=p.linewidth,this.linecap=p.linecap,this.linejoin=p.linejoin,this.fog=p.fog,this}}var Zo=new Y,$o=new Y,Xd=new re,Er=new ki,zo=new bn,Ql=new Y,qd=new Y;class cs extends Xe{constructor(p=new qe,m=new zi){super();this.isLine=!0,this.type="Line",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[0];for(let _=1,x=m.count;_<x;_++)Zo.fromBufferAttribute(m,_-1),$o.fromBufferAttribute(m,_),g[_]=g[_-1],g[_]+=Zo.distanceTo($o);p.setAttribute("lineDistance",new sn(g,1))}else Xt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Line.threshold,v=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(zo.copy(g.boundingSphere),zo.applyMatrix4(_),zo.radius+=x,p.ray.intersectsSphere(zo)===!1)return;Xd.copy(_).invert(),Er.copy(p.ray).applyMatrix4(Xd);let y=x/((this.scale.x+this.scale.y+this.scale.z)/3),S=y*y,b=this.isLineSegments?2:1,M=g.index,w=g.attributes.position;if(M!==null){let E=Math.max(0,v.start),A=Math.min(M.count,v.start+v.count);for(let C=E,D=A-1;C<D;C+=b){let R=M.getX(C),P=M.getX(C+1),L=Ho(this,p,Er,S,R,P,C);if(L)m.push(L)}if(this.isLineLoop){let C=M.getX(A-1),D=M.getX(E),R=Ho(this,p,Er,S,C,D,A-1);if(R)m.push(R)}}else{let E=Math.max(0,v.start),A=Math.min(w.count,v.start+v.count);for(let C=E,D=A-1;C<D;C+=b){let R=Ho(this,p,Er,S,C,C+1,C);if(R)m.push(R)}if(this.isLineLoop){let C=Ho(this,p,Er,S,A-1,E,A-1);if(C)m.push(C)}}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,v=_.length;x<v;x++){let y=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[y]=x}}}}}function Ho(p,m,g,_,x,v,y){let S=p.geometry.attributes.position;if(Zo.fromBufferAttribute(S,x),$o.fromBufferAttribute(S,v),g.distanceSqToSegment(Zo,$o,Ql,qd)>_)return;Ql.applyMatrix4(p.matrixWorld);let M=m.ray.origin.distanceTo(Ql);if(M<m.near||M>m.far)return;return{distance:M,point:qd.clone().applyMatrix4(p.matrixWorld),index:y,face:null,faceIndex:null,barycoord:null,object:p}}var Yd=new Y,Zd=new Y;class Ei extends cs{constructor(p,m){super(p,m);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[];for(let _=0,x=m.count;_<x;_+=2)Yd.fromBufferAttribute(m,_),Zd.fromBufferAttribute(m,_+1),g[_]=_===0?0:g[_-1],g[_+1]=g[_]+Yd.distanceTo(Zd);p.setAttribute("lineDistance",new sn(g,1))}else Xt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class hs extends cs{constructor(p,m){super(p,m);this.isLineLoop=!0,this.type="LineLoop"}}class Gr extends Mi{constructor(p){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new oe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.alphaMap=p.alphaMap,this.size=p.size,this.sizeAttenuation=p.sizeAttenuation,this.fog=p.fog,this}}var $d=new re,nc=new ki,Go=new bn,Vo=new Y;class us extends Xe{constructor(p=new qe,m=new Gr){super();this.isPoints=!0,this.type="Points",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Points.threshold,v=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(Go.copy(g.boundingSphere),Go.applyMatrix4(_),Go.radius+=x,p.ray.intersectsSphere(Go)===!1)return;$d.copy(_).invert(),nc.copy(p.ray).applyMatrix4($d);let y=x/((this.scale.x+this.scale.y+this.scale.z)/3),S=y*y,b=g.index,T=g.attributes.position;if(b!==null){let w=Math.max(0,v.start),E=Math.min(b.count,v.start+v.count);for(let A=w,C=E;A<C;A++){let D=b.getX(A);Vo.fromBufferAttribute(T,D),Jd(Vo,D,S,_,p,m,this)}}else{let w=Math.max(0,v.start),E=Math.min(T.count,v.start+v.count);for(let A=w,C=E;A<C;A++)Vo.fromBufferAttribute(T,A),Jd(Vo,A,S,_,p,m,this)}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,v=_.length;x<v;x++){let y=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[y]=x}}}}}function Jd(p,m,g,_,x,v,y){let S=nc.distanceSqToPoint(p);if(S<g){let b=new Y;nc.closestPointToPoint(p,b),b.applyMatrix4(_);let M=x.ray.origin.distanceTo(b);if(M<x.near||M>x.far)return;v.push({distance:M,distanceToRay:Math.sqrt(S),point:b,index:m,face:null,faceIndex:null,barycoord:null,object:y})}}class Vr extends Ve{constructor(p=[],m,g,_,x,v,y,S,b,M,T,w){super(null,v,y,S,b,M,_,x,T,w);this.isCompressedTexture=!0,this.image={width:m,height:g},this.mipmaps=p,this.flipY=!1,this.generateMipmaps=!1}}class da extends Ve{constructor(p=[],m=301,g,_,x,v,y,S,b,M){super(p,m,g,_,x,v,y,S,b,M);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(p){this.image=p}}class fa extends Ve{constructor(p,m,g,_,x,v,y,S,b){super(p,m,g,_,x,v,y,S,b);this.isCanvasTexture=!0,this.needsUpdate=!0}}class Hi extends Ve{constructor(p,m,g=1014,_,x,v,y=1003,S=1003,b,M=1026,T=1){if(M!==1026&&M!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let w={width:p,height:m,depth:T};super(w,_,x,v,y,S,M,g,b);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(p){return super.copy(p),this.source=new Br(Object.assign({},p.image)),this.compareFunction=p.compareFunction,this}toJSON(p){let m=super.toJSON(p);return m.compareFunction=this.compareFunction,m}}class pa extends Hi{constructor(p,m=1014,g=301,_,x,v=1003,y=1003,S,b=1026){let M={width:p,height:p,depth:1},T=[M,M,M,M,M,M];super(p,p,m,g,_,x,v,y,S,b);this.image=T,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(p){this.image=p}}class ma extends Ve{constructor(p=null){super();this.sourceTexture=p,this.isExternalTexture=!0}copy(p){return super.copy(p),this.sourceTexture=p.sourceTexture,this}}class Zs extends qe{constructor(p=1,m=1,g=1,_=1,x=1,v=1){super();this.type="BoxGeometry",this.parameters={width:p,height:m,depth:g,widthSegments:_,heightSegments:x,depthSegments:v};let y=this;_=Math.floor(_),x=Math.floor(x),v=Math.floor(v);let S=[],b=[],M=[],T=[],w=0,E=0;A("z","y","x",-1,-1,g,m,p,v,x,0),A("z","y","x",1,-1,g,m,-p,v,x,1),A("x","z","y",1,1,p,g,m,_,v,2),A("x","z","y",1,-1,p,g,-m,_,v,3),A("x","y","z",1,-1,p,m,g,_,x,4),A("x","y","z",-1,-1,p,m,-g,_,x,5),this.setIndex(S),this.setAttribute("position",new sn(b,3)),this.setAttribute("normal",new sn(M,3)),this.setAttribute("uv",new sn(T,2));function A(C,D,R,P,L,U,N,F,z,I,O){let V=U/z,q=N/I,H=U/2,W=N/2,J=F/2,G=z+1,Q=I+1,it=0,tt=0,pt=new Y;for(let ot=0;ot<Q;ot++){let dt=ot*q-W;for(let _t=0;_t<G;_t++){let Dt=_t*V-H;pt[C]=Dt*P,pt[D]=dt*L,pt[R]=J,b.push(pt.x,pt.y,pt.z),pt[C]=0,pt[D]=0,pt[R]=F>0?1:-1,M.push(pt.x,pt.y,pt.z),T.push(_t/z),T.push(1-ot/I),it+=1}}for(let ot=0;ot<I;ot++)for(let dt=0;dt<z;dt++){let _t=w+dt+G*ot,Dt=w+dt+G*(ot+1),at=w+(dt+1)+G*(ot+1),mt=w+(dt+1)+G*ot;S.push(_t,Dt,mt),S.push(Dt,at,mt),tt+=6}y.addGroup(E,tt,O),E+=tt,w+=it}}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new Zs(p.width,p.height,p.depth,p.widthSegments,p.heightSegments,p.depthSegments)}}class Wr extends qe{constructor(p=1,m=1,g=1,_=1){super();this.type="PlaneGeometry",this.parameters={width:p,height:m,widthSegments:g,heightSegments:_};let x=p/2,v=m/2,y=Math.floor(g),S=Math.floor(_),b=y+1,M=S+1,T=p/y,w=m/S,E=[],A=[],C=[],D=[];for(let R=0;R<M;R++){let P=R*w-v;for(let L=0;L<b;L++){let U=L*T-x;A.push(U,-P,0),C.push(0,0,1),D.push(L/y),D.push(1-R/S)}}for(let R=0;R<S;R++)for(let P=0;P<y;P++){let L=P+b*R,U=P+b*(R+1),N=P+1+b*(R+1),F=P+1+b*R;E.push(L,U,F),E.push(U,N,F)}this.setIndex(E),this.setAttribute("position",new sn(A,3)),this.setAttribute("normal",new sn(C,3)),this.setAttribute("uv",new sn(D,2))}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new Wr(p.width,p.height,p.widthSegments,p.heightSegments)}}function ds(p){let m={};for(let g in p){m[g]={};for(let _ in p[g]){let x=p[g][_];if(Kd(x))if(x.isRenderTargetTexture)Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),m[g][_]=null;else m[g][_]=x.clone();else if(Array.isArray(x))if(Kd(x[0])){let v=[];for(let y=0,S=x.length;y<S;y++)v[y]=x[y].clone();m[g][_]=v}else m[g][_]=x.slice();else m[g][_]=x}}return m}function pn(p){let m={};for(let g=0;g<p.length;g++){let _=ds(p[g]);for(let x in _)m[x]=_[x]}return m}function Kd(p){return p&&(p.isColor||p.isMatrix3||p.isMatrix4||p.isVector2||p.isVector3||p.isVector4||p.isTexture||p.isQuaternion)}function Y_(p){let m=[];for(let g=0;g<p.length;g++)m.push(p[g].clone());return m}function dh(p){let m=p.getRenderTarget();if(m===null)return p.outputColorSpace;if(m.isXRRenderTarget===!0)return m.texture.colorSpace;return he.workingColorSpace}var cp={clone:ds,merge:pn},Z_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ti extends Mi{constructor(p){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Z_,this.fragmentShader=$_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,p!==void 0)this.setValues(p)}copy(p){return super.copy(p),this.fragmentShader=p.fragmentShader,this.vertexShader=p.vertexShader,this.uniforms=ds(p.uniforms),this.uniformsGroups=Y_(p.uniformsGroups),this.defines=Object.assign({},p.defines),this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.fog=p.fog,this.lights=p.lights,this.clipping=p.clipping,this.extensions=Object.assign({},p.extensions),this.glslVersion=p.glslVersion,this.defaultAttributeValues=Object.assign({},p.defaultAttributeValues),this.index0AttributeName=p.index0AttributeName,this.uniformsNeedUpdate=p.uniformsNeedUpdate,this}toJSON(p){let m=super.toJSON(p);m.glslVersion=this.glslVersion,m.uniforms={};for(let _ in this.uniforms){let v=this.uniforms[_].value;if(v&&v.isTexture)m.uniforms[_]={type:"t",value:v.toJSON(p).uuid};else if(v&&v.isColor)m.uniforms[_]={type:"c",value:v.getHex()};else if(v&&v.isVector2)m.uniforms[_]={type:"v2",value:v.toArray()};else if(v&&v.isVector3)m.uniforms[_]={type:"v3",value:v.toArray()};else if(v&&v.isVector4)m.uniforms[_]={type:"v4",value:v.toArray()};else if(v&&v.isMatrix3)m.uniforms[_]={type:"m3",value:v.toArray()};else if(v&&v.isMatrix4)m.uniforms[_]={type:"m4",value:v.toArray()};else m.uniforms[_]={value:v}}if(Object.keys(this.defines).length>0)m.defines=this.defines;m.vertexShader=this.vertexShader,m.fragmentShader=this.fragmentShader,m.lights=this.lights,m.clipping=this.clipping;let g={};for(let _ in this.extensions)if(this.extensions[_]===!0)g[_]=!0;if(Object.keys(g).length>0)m.extensions=g;return m}fromJSON(p,m){if(super.fromJSON(p,m),p.uniforms!==void 0)for(let g in p.uniforms){let _=p.uniforms[g];switch(this.uniforms[g]={},_.type){case"t":this.uniforms[g].value=m[_.value]||null;break;case"c":this.uniforms[g].value=new oe().setHex(_.value);break;case"v2":this.uniforms[g].value=new Jt().fromArray(_.value);break;case"v3":this.uniforms[g].value=new Y().fromArray(_.value);break;case"v4":this.uniforms[g].value=new Oe().fromArray(_.value);break;case"m3":this.uniforms[g].value=new Qt().fromArray(_.value);break;case"m4":this.uniforms[g].value=new re().fromArray(_.value);break;default:this.uniforms[g].value=_.value}}if(p.defines!==void 0)this.defines=p.defines;if(p.vertexShader!==void 0)this.vertexShader=p.vertexShader;if(p.fragmentShader!==void 0)this.fragmentShader=p.fragmentShader;if(p.glslVersion!==void 0)this.glslVersion=p.glslVersion;if(p.extensions!==void 0)for(let g in p.extensions)this.extensions[g]=p.extensions[g];if(p.lights!==void 0)this.lights=p.lights;if(p.clipping!==void 0)this.clipping=p.clipping;return this}}class fh extends Ti{constructor(p){super(p);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ga extends Mi{constructor(p){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Jt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new _i,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.emissive.copy(p.emissive),this.emissiveMap=p.emissiveMap,this.emissiveIntensity=p.emissiveIntensity,this.bumpMap=p.bumpMap,this.bumpScale=p.bumpScale,this.normalMap=p.normalMap,this.normalMapType=p.normalMapType,this.normalScale.copy(p.normalScale),this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.envMapIntensity=p.envMapIntensity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.flatShading=p.flatShading,this.fog=p.fog,this}}class ph extends Mi{constructor(p){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(p)}copy(p){return super.copy(p),this.depthPacking=p.depthPacking,this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this}}class mh extends Mi{constructor(p){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(p)}copy(p){return super.copy(p),this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this}}function Is(p,m){if(!p||p.constructor===m)return p;if(typeof m.BYTES_PER_ELEMENT==="number")return new m(p);return Array.prototype.slice.call(p)}function Wo(p){return p!==void 0&&p.inTangents!==void 0&&p.outTangents!==void 0}class fs{constructor(p,m,g,_){this.parameterPositions=p,this._cachedIndex=0,this.resultBuffer=_!==void 0?_:new m.constructor(g),this.sampleValues=m,this.valueSize=g,this.settings=null,this.DefaultSettings_={}}evaluate(p){let m=this.parameterPositions,g=this._cachedIndex,_=m[g],x=m[g-1];n:{t:{let v;e:{i:if(!(p<_)){for(let y=g+2;;){if(_===void 0){if(p<x)break i;return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}if(g===y)break;if(x=_,_=m[++g],p<_)break t}v=m.length;break e}if(!(p>=x)){let y=m[1];if(p<y)g=2,x=y;for(let S=g-2;;){if(x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(g===S)break;if(_=x,x=m[--g-1],p>=x)break t}v=g,g=0;break e}break n}while(g<v){let y=g+v>>>1;if(p<m[y])v=y;else g=y+1}if(_=m[g],x=m[g-1],x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(_===void 0)return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}this._cachedIndex=g,this.intervalChanged_(g,x,_)}return this.interpolate_(g,x,p,_)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(p){let m=this.resultBuffer,g=this.sampleValues,_=this.valueSize,x=p*_;for(let v=0;v!==_;++v)m[v]=g[x+v];return m}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class gh extends fs{constructor(p,m,g,_){super(p,m,g,_);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(p,m,g){let _=this.parameterPositions,x=p-2,v=p+1,y=_[x],S=_[v];if(y===void 0)switch(this.getSettings_().endingStart){case 2401:x=p,y=2*m-g;break;case 2402:x=_.length-2,y=m+_[x]-_[x+1];break;default:x=p,y=g}if(S===void 0)switch(this.getSettings_().endingEnd){case 2401:v=p,S=2*g-m;break;case 2402:v=1,S=g+_[1]-_[0];break;default:v=p-1,S=m}let b=(g-m)*0.5,M=this.valueSize;this._weightPrev=b/(m-y),this._weightNext=b/(S-g),this._offsetPrev=x*M,this._offsetNext=v*M}interpolate_(p,m,g,_){let x=this.resultBuffer,v=this.sampleValues,y=this.valueSize,S=p*y,b=S-y,M=this._offsetPrev,T=this._offsetNext,w=this._weightPrev,E=this._weightNext,A=(g-m)/(_-m),C=A*A,D=C*A,R=-w*D+2*w*C-w*A,P=(1+w)*D+(-1.5-2*w)*C+(-0.5+w)*A+1,L=(-1-E)*D+(1.5+E)*C+0.5*A,U=E*D-E*C;for(let N=0;N!==y;++N)x[N]=R*v[M+N]+P*v[b+N]+L*v[S+N]+U*v[T+N];return x}}class _h extends fs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,v=this.sampleValues,y=this.valueSize,S=p*y,b=S-y,M=(g-m)/(_-m),T=1-M;for(let w=0;w!==y;++w)x[w]=v[b+w]*T+v[S+w]*M;return x}}class xh extends fs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p){return this.copySampleValue_(p-1)}}class vh extends fs{interpolate_(p,m,g,_){let x=this.resultBuffer,v=this.sampleValues,y=this.valueSize,S=p*y,b=S-y,M=this.inTangents,T=this.outTangents;if(!M||!T){let A=(g-m)/(_-m),C=1-A;for(let D=0;D!==y;++D)x[D]=v[b+D]*C+v[S+D]*A;return x}let w=y*2,E=p-1;for(let A=0;A!==y;++A){let C=v[b+A],D=v[S+A],R=E*w+A*2,P=T[R],L=T[R+1],U=p*w+A*2,N=M[U],F=M[U+1],z=K_(g,m,P,N,_);x[A]=hp(z,C,L,F,D)}return x}}function hp(p,m,g,_,x){let v=1-p;return v*v*v*m+3*v*v*p*g+3*v*p*p*_+p*p*p*x}function J_(p,m,g,_,x){let v=1-p;return 3*v*v*(g-m)+6*v*p*(_-g)+3*p*p*(x-_)}function K_(p,m,g,_,x){let v=(p-m)/(x-m);for(let y=0;y<8;y++){let S=hp(v,m,g,_,x)-p;if(Math.abs(S)<0.0000000001)break;let b=J_(v,m,g,_,x);if(Math.abs(b)<0.0000000001)break;v=Math.max(0,Math.min(1,v-S/b))}return v}class Hn{constructor(p,m,g,_){if(p===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(m===void 0||m.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+p);this.name=p,this.times=Is(m,this.TimeBufferType),this.values=Is(g,this.ValueBufferType),this.setInterpolation(_||this.DefaultInterpolation)}static toJSON(p){let m=p.constructor,g;if(m.toJSON!==this.toJSON)g=m.toJSON(p);else{g={name:p.name,times:Is(p.times,Array),values:Is(p.values,Array)};let _=p.getInterpolation();if(_!==p.DefaultInterpolation)g.interpolation=_;if(Wo(p.settings))g.settings={inTangents:Is(p.settings.inTangents,Array),outTangents:Is(p.settings.outTangents,Array)}}return g.type=p.ValueTypeName,g}InterpolantFactoryMethodDiscrete(p){return new xh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodLinear(p){return new _h(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodSmooth(p){return new gh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodBezier(p){let m=new vh(this.times,this.values,this.getValueSize(),p);if(this.settings)m.inTangents=this.settings.inTangents,m.outTangents=this.settings.outTangents;return m}setInterpolation(p){let m;switch(p){case 2300:m=this.InterpolantFactoryMethodDiscrete;break;case 2301:m=this.InterpolantFactoryMethodLinear;break;case 2302:m=this.InterpolantFactoryMethodSmooth;break;case 2303:m=this.InterpolantFactoryMethodBezier;break}if(m===void 0){let g="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(p!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(g);return Xt("KeyframeTrack:",g),this}return this.createInterpolant=m,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(p){if(p!==0){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]+=p;if(Wo(this.settings))jd(this.settings.inTangents,p),jd(this.settings.outTangents,p)}return this}scale(p){if(p!==1){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]*=p;if(Wo(this.settings))Qd(this.settings.inTangents,p),Qd(this.settings.outTangents,p)}return this}trim(p,m){let g=this.times,_=g.length,x=0,v=_-1;while(x!==_&&g[x]<p)++x;while(v!==-1&&g[v]>m)--v;if(++v,x!==0||v!==_){if(x>=v)v=Math.max(v,1),x=v-1;let y=this.getValueSize();this.times=g.slice(x,v),this.values=this.values.slice(x*y,v*y)}return this}validate(){let p=!0,m=this.getValueSize();if(m-Math.floor(m)!==0)$t("KeyframeTrack: Invalid value size in track.",this),p=!1;let g=this.times,_=this.values,x=g.length;if(x===0)$t("KeyframeTrack: Track is empty.",this),p=!1;let v=null;for(let y=0;y!==x;y++){let S=g[y];if(typeof S==="number"&&isNaN(S)){$t("KeyframeTrack: Time is not a valid number.",this,y,S),p=!1;break}if(v!==null&&v>S){$t("KeyframeTrack: Out of order keys.",this,y,S,v),p=!1;break}v=S}if(_!==void 0){if(o_(_))for(let y=0,S=_.length;y!==S;++y){let b=_[y];if(isNaN(b)){$t("KeyframeTrack: Value is not a valid number.",this,y,b),p=!1;break}}}return p}optimize(){let p=this.times.slice(),m=this.values.slice(),g=this.getValueSize(),_=this.getInterpolation()===2302,x=p.length-1,v=1;for(let y=1;y<x;++y){let S=!1,b=p[y],M=p[y+1];if(b!==M&&(y!==1||b!==p[0]))if(!_){let T=y*g,w=T-g,E=T+g;for(let A=0;A!==g;++A){let C=m[T+A];if(C!==m[w+A]||C!==m[E+A]){S=!0;break}}}else S=!0;if(S){if(y!==v){p[v]=p[y];let T=y*g,w=v*g;for(let E=0;E!==g;++E)m[w+E]=m[T+E]}++v}}if(x>0){p[v]=p[x];for(let y=x*g,S=v*g,b=0;b!==g;++b)m[S+b]=m[y+b];++v}if(v!==p.length)this.times=p.slice(0,v),this.values=m.slice(0,v*g);else this.times=p,this.values=m;return this}clone(){let p=this.times.slice(),m=this.values.slice(),_=new this.constructor(this.name,p,m);if(_.createInterpolant=this.createInterpolant,Wo(this.settings))_.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return _}}function jd(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]+=m}function Qd(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]*=m}Hn.prototype.ValueTypeName="";Hn.prototype.TimeBufferType=Float32Array;Hn.prototype.ValueBufferType=Float32Array;Hn.prototype.DefaultInterpolation=2301;class ps extends Hn{constructor(p,m,g){super(p,m,g)}}ps.prototype.ValueTypeName="bool";ps.prototype.ValueBufferType=Array;ps.prototype.DefaultInterpolation=2300;ps.prototype.InterpolantFactoryMethodLinear=void 0;ps.prototype.InterpolantFactoryMethodSmooth=void 0;class yh extends Hn{constructor(p,m,g,_){super(p,m,g,_)}}yh.prototype.ValueTypeName="color";class Sh extends Hn{constructor(p,m,g,_){super(p,m,g,_)}}Sh.prototype.ValueTypeName="number";class bh extends fs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,v=this.sampleValues,y=this.valueSize,S=(g-m)/(_-m),b=p*y;for(let M=b+y;b!==M;b+=4)bi.slerpFlat(x,0,v,b-y,v,b,S);return x}}class _a extends Hn{constructor(p,m,g,_){super(p,m,g,_)}InterpolantFactoryMethodLinear(p){return new bh(this.times,this.values,this.getValueSize(),p)}}_a.prototype.ValueTypeName="quaternion";_a.prototype.InterpolantFactoryMethodSmooth=void 0;class ms extends Hn{constructor(p,m,g){super(p,m,g)}}ms.prototype.ValueTypeName="string";ms.prototype.ValueBufferType=Array;ms.prototype.DefaultInterpolation=2300;ms.prototype.InterpolantFactoryMethodLinear=void 0;ms.prototype.InterpolantFactoryMethodSmooth=void 0;class Mh extends Hn{constructor(p,m,g,_){super(p,m,g,_)}}Mh.prototype.ValueTypeName="vector";var ic={enabled:!1,files:{},add:function(p,m){if(this.enabled===!1)return;if(tf(p))return;this.files[p]=m},get:function(p){if(this.enabled===!1)return;if(tf(p))return;return this.files[p]},remove:function(p){delete this.files[p]},clear:function(){this.files={}}};function tf(p){try{let m=p.slice(p.indexOf(":")+1);return new URL(m).protocol==="blob:"}catch(m){return!1}}class Eh{constructor(p,m,g){let _=this,x=!1,v=0,y=0,S=void 0,b=[];this.onStart=void 0,this.onLoad=p,this.onProgress=m,this.onError=g,this._abortController=null,this.itemStart=function(M){if(y++,x===!1){if(_.onStart!==void 0)_.onStart(M,v,y)}x=!0},this.itemEnd=function(M){if(v++,_.onProgress!==void 0)_.onProgress(M,v,y);if(v===y){if(x=!1,_.onLoad!==void 0)_.onLoad()}},this.itemError=function(M){if(_.onError!==void 0)_.onError(M)},this.resolveURL=function(M){if(M=M.normalize("NFC"),S)return S(M);return M},this.setURLModifier=function(M){return S=M,this},this.addHandler=function(M,T){return b.push(M,T),this},this.removeHandler=function(M){let T=b.indexOf(M);if(T!==-1)b.splice(T,2);return this},this.getHandler=function(M){for(let T=0,w=b.length;T<w;T+=2){let E=b[T],A=b[T+1];if(E.global)E.lastIndex=0;if(E.test(M))return A}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var up=new Eh;class Xr{constructor(p){if(this.manager=p!==void 0?p:up,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(p,m){let g=this;return new Promise(function(_,x){g.load(p,_,m,x)})}parse(){}setCrossOrigin(p){return this.crossOrigin=p,this}setWithCredentials(p){return this.withCredentials=p,this}setPath(p){return this.path=p,this}setResourcePath(p){return this.resourcePath=p,this}setRequestHeader(p){return this.requestHeader=p,this}setPriority(p){return this.priority=p,this}setCache(p){return this.cache=p,this}abort(){return this}}Xr.DEFAULT_MATERIAL_NAME="__DEFAULT";var mi={};class dp extends Error{constructor(p,m){super(p);this.response=m}}class Th extends Xr{constructor(p){super(p);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(p,m,g,_){if(p===void 0)p="";if(this.path!==void 0)p=this.path+p;p=this.manager.resolveURL(p);let x=ic.get(`file:${p}`);if(x!==void 0){this.manager.itemStart(p),setTimeout(()=>{if(m)m(x);this.manager.itemEnd(p)},0);return}if(mi[p]!==void 0){mi[p].push({onLoad:m,onProgress:g,onError:_});return}mi[p]=[],mi[p].push({onLoad:m,onProgress:g,onError:_});let v=new Request(p,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),y=this.mimeType,S=this.responseType;fetch(v).then((b)=>{if(b.status===200||b.status===0){if(b.status===0)Xt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||b.body===void 0||b.body.getReader===void 0)return b;let M=mi[p],T=b.body.getReader(),w=b.headers.get("X-File-Size")||b.headers.get("Content-Length"),E=w?parseInt(w):0,A=E!==0,C=0,D=new ReadableStream({start(R){P();function P(){T.read().then(({done:L,value:U})=>{if(L)R.close();else{C+=U.byteLength;let N=new ProgressEvent("progress",{lengthComputable:A,loaded:C,total:E});for(let F=0,z=M.length;F<z;F++){let I=M[F];if(I.onProgress)I.onProgress(N)}R.enqueue(U),P()}},(L)=>{R.error(L)})}}});return new Response(D)}else throw new dp(`fetch for "${b.url}" responded with ${b.status}: ${b.statusText}`,b)}).then((b)=>{switch(S){case"arraybuffer":return b.arrayBuffer();case"blob":return b.blob();case"document":return b.text().then((M)=>new DOMParser().parseFromString(M,y));case"json":return b.json();default:if(y==="")return b.text();else{let T=/charset="?([^;"\s]*)"?/i.exec(y),w=T&&T[1]?T[1].toLowerCase():void 0,E=new TextDecoder(w);return b.arrayBuffer().then((A)=>E.decode(A))}}}).then((b)=>{ic.add(`file:${p}`,b);let M=mi[p];delete mi[p];for(let T=0,w=M.length;T<w;T++){let E=M[T];if(E.onLoad)E.onLoad(b)}}).catch((b)=>{let M=mi[p];if(M===void 0)throw this.manager.itemError(p),b;delete mi[p];for(let T=0,w=M.length;T<w;T++){let E=M[T];if(E.onError)E.onError(b)}this.manager.itemError(p)}).finally(()=>{this.manager.itemEnd(p)}),this.manager.itemStart(p)}setResponseType(p){return this.responseType=p,this}setMimeType(p){return this.mimeType=p,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class xa extends Xr{constructor(p){super(p)}load(p,m,g,_){let x=this,v=[],y=new Vr,S=new Th(this.manager);S.setPriority(this.priority),S.setCache(this.cache),S.setPath(this.path),S.setResponseType("arraybuffer"),S.setRequestHeader(this.requestHeader),S.setWithCredentials(x.withCredentials);let b=0;function M(T){S.load(p[T],function(w){let E=x.parse(w,!0);if(v[T]={width:E.width,height:E.height,format:E.format,mipmaps:E.mipmaps},b+=1,b===6){if(E.mipmapCount===1)y.minFilter=1006;if(y.image=v,y.format=E.format,y.needsUpdate=!0,m)m(y)}},g,_)}if(Array.isArray(p))for(let T=0,w=p.length;T<w;++T)M(T);else S.load(p,function(T){let w=x.parse(T,!0);if(w.isCubemap){let E=w.mipmaps.length/w.mipmapCount;for(let A=0;A<E;A++){v[A]={mipmaps:[]};for(let C=0;C<w.mipmapCount;C++)v[A].mipmaps.push(w.mipmaps[A*w.mipmapCount+C]),v[A].format=w.format,v[A].width=w.width,v[A].height=w.height}y.image=v}else y.image.width=w.width,y.image.height=w.height,y.mipmaps=w.mipmaps;if(w.mipmapCount===1)y.minFilter=1006;if(y.format=w.format,y.needsUpdate=!0,m)m(y)},g,_);return y}}class va extends Xe{static registerNode(p){this.prototype._lightNode=p}constructor(p,m=1){super();this.isLight=!0,this.type="Light",this.color=new oe(p),this.intensity=m}copy(p,m){return super.copy(p,m),this.color.copy(p.color),this.intensity=p.intensity,this}toJSON(p){let m=super.toJSON(p);return m.object.color=this.color.getHex(),m.object.intensity=this.intensity,m}}var tc=new re,ef=new Y,nf=new Y;class wh{constructor(p){this.camera=p,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Jt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Di,this._frameExtents=new Jt(1,1),this._viewportCount=1,this._viewports=[new Oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(p){let m=this.camera;ef.setFromMatrixPosition(p.matrixWorld),m.position.copy(ef),nf.setFromMatrixPosition(p.target.matrixWorld),m.lookAt(nf),m.updateMatrixWorld(),this._updateMatrix(m,this.matrix,this._frustum)}_updateMatrix(p,m,g,_){tc.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse),g.setFromProjectionMatrix(tc,p.coordinateSystem,p.reversedDepth);let x=this._frameExtents,v=_?_.z/x.x:1,y=_?_.w/x.y:1,S=_?_.x/x.x:0,b=_?_.y/x.y:0;if(p.coordinateSystem===2001||p.reversedDepth)m.set(0.5*v,0,0,0.5*v+S,0,0.5*y,0,0.5*y+b,0,0,1,0,0,0,0,1);else m.set(0.5*v,0,0,0.5*v+S,0,0.5*y,0,0.5*y+b,0,0,0.5,0.5,0,0,0,1);m.multiply(tc)}getViewport(p){return this._viewports[p]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(p){return this.camera=p.camera.clone(),this.intensity=p.intensity,this.bias=p.bias,this.radius=p.radius,this.autoUpdate=p.autoUpdate,this.needsUpdate=p.needsUpdate,this.normalBias=p.normalBias,this.blurSamples=p.blurSamples,this.mapSize.copy(p.mapSize),this.mapType=p.mapType,this.biasNode=p.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let p={};return p.intensity=this.intensity,p.bias=this.bias,p.normalBias=this.normalBias,p.radius=this.radius,p.blurSamples=this.blurSamples,p.mapSize=this.mapSize.toArray(),p.mapType=this.mapType,p.camera=this.camera.toJSON(!1).object,delete p.camera.matrix,p}}var Xo=new Y,qo=new bi,ei=new Y;class ya extends Xe{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new re,this.projectionMatrix=new re,this.projectionMatrixInverse=new re,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(p,m){return super.copy(p,m),this.matrixWorldInverse.copy(p.matrixWorldInverse),this.projectionMatrix.copy(p.projectionMatrix),this.projectionMatrixInverse.copy(p.projectionMatrixInverse),this.coordinateSystem=p.coordinateSystem,this}getWorldDirection(p){return super.getWorldDirection(p).negate()}updateMatrixWorld(p){if(super.updateMatrixWorld(p),this.matrixWorld.decompose(Xo,qo,ei),ei.x===1&&ei.y===1&&ei.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Xo,qo,ei.set(1,1,1)).invert()}updateWorldMatrix(p,m,g=!1){if(super.updateWorldMatrix(p,m,g),this.matrixWorld.decompose(Xo,qo,ei),ei.x===1&&ei.y===1&&ei.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Xo,qo,ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Ni=new Y,sf=new Jt,rf=new Jt;class wn extends ya{constructor(p=50,m=1,g=0.1,_=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=p,this.zoom=1,this.near=g,this.far=_,this.focus=10,this.aspect=m,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.fov=p.fov,this.zoom=p.zoom,this.near=p.near,this.far=p.far,this.focus=p.focus,this.aspect=p.aspect,this.view=p.view===null?null:Object.assign({},p.view),this.filmGauge=p.filmGauge,this.filmOffset=p.filmOffset,this}setFocalLength(p){let m=0.5*this.getFilmHeight()/p;this.fov=zs*2*Math.atan(m),this.updateProjectionMatrix()}getFocalLength(){let p=Math.tan(wr*0.5*this.fov);return 0.5*this.getFilmHeight()/p}getEffectiveFOV(){return zs*2*Math.atan(Math.tan(wr*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(p,m,g){Ni.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),m.set(Ni.x,Ni.y).multiplyScalar(-p/Ni.z),Ni.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),g.set(Ni.x,Ni.y).multiplyScalar(-p/Ni.z)}getViewSize(p,m){return this.getViewBounds(p,sf,rf),m.subVectors(rf,sf)}setViewOffset(p,m,g,_,x,v){if(this.aspect=p/m,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=v,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=this.near,m=p*Math.tan(wr*0.5*this.fov)/this.zoom,g=2*m,_=this.aspect*g,x=-0.5*_,v=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:S,fullHeight:b}=v;x+=v.offsetX*_/S,m-=v.offsetY*g/b,_*=v.width/S,g*=v.height/b}let y=this.filmOffset;if(y!==0)x+=p*y/this.getFilmWidth();this.projectionMatrix.makePerspective(x,x+_,m,m-g,p,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.fov=this.fov,m.object.zoom=this.zoom,m.object.near=this.near,m.object.far=this.far,m.object.focus=this.focus,m.object.aspect=this.aspect,this.view!==null)m.object.view=Object.assign({},this.view);return m.object.filmGauge=this.filmGauge,m.object.filmOffset=this.filmOffset,m}}class Sa extends ya{constructor(p=-1,m=1,g=1,_=-1,x=0.1,v=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=p,this.right=m,this.top=g,this.bottom=_,this.near=x,this.far=v,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.left=p.left,this.right=p.right,this.top=p.top,this.bottom=p.bottom,this.near=p.near,this.far=p.far,this.zoom=p.zoom,this.view=p.view===null?null:Object.assign({},p.view),this}setViewOffset(p,m,g,_,x,v){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=v,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=(this.right-this.left)/(2*this.zoom),m=(this.top-this.bottom)/(2*this.zoom),g=(this.right+this.left)/2,_=(this.top+this.bottom)/2,x=g-p,v=g+p,y=_+m,S=_-m;if(this.view!==null&&this.view.enabled){let b=(this.right-this.left)/this.view.fullWidth/this.zoom,M=(this.top-this.bottom)/this.view.fullHeight/this.zoom;x+=b*this.view.offsetX,v=x+b*this.view.width,y-=M*this.view.offsetY,S=y-M*this.view.height}this.projectionMatrix.makeOrthographic(x,v,y,S,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.zoom=this.zoom,m.object.left=this.left,m.object.right=this.right,m.object.top=this.top,m.object.bottom=this.bottom,m.object.near=this.near,m.object.far=this.far,this.view!==null)m.object.view=Object.assign({},this.view);return m}}class fp extends wh{constructor(){super(new Sa(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class ba extends va{constructor(p,m){super(p,m);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Xe.DEFAULT_UP),this.updateMatrix(),this.target=new Xe,this.shadow=new fp}dispose(){super.dispose(),this.shadow.dispose()}copy(p){return super.copy(p),this.target=p.target.clone(),this.shadow=p.shadow.clone(),this}toJSON(p){let m=super.toJSON(p);return m.object.shadow=this.shadow.toJSON(),m.object.target=this.target.uuid,m}}class Ma extends va{constructor(p,m){super(p,m);this.isAmbientLight=!0,this.type="AmbientLight"}}var Ls=-90,Ns=1;class qr extends Xe{constructor(p,m,g){super();this.type="CubeCamera",this.renderTarget=g,this.coordinateSystem=null,this.activeMipmapLevel=0;let _=new wn(Ls,Ns,p,m);_.layers=this.layers,this.add(_);let x=new wn(Ls,Ns,p,m);x.layers=this.layers,this.add(x);let v=new wn(Ls,Ns,p,m);v.layers=this.layers,this.add(v);let y=new wn(Ls,Ns,p,m);y.layers=this.layers,this.add(y);let S=new wn(Ls,Ns,p,m);S.layers=this.layers,this.add(S);let b=new wn(Ls,Ns,p,m);b.layers=this.layers,this.add(b)}updateCoordinateSystem(){let p=this.coordinateSystem,m=this.children.concat(),[g,_,x,v,y,S]=m;for(let b of m)this.remove(b);if(p===2000)g.up.set(0,1,0),g.lookAt(1,0,0),_.up.set(0,1,0),_.lookAt(-1,0,0),x.up.set(0,0,-1),x.lookAt(0,1,0),v.up.set(0,0,1),v.lookAt(0,-1,0),y.up.set(0,1,0),y.lookAt(0,0,1),S.up.set(0,1,0),S.lookAt(0,0,-1);else if(p===2001)g.up.set(0,-1,0),g.lookAt(-1,0,0),_.up.set(0,-1,0),_.lookAt(1,0,0),x.up.set(0,0,1),x.lookAt(0,1,0),v.up.set(0,0,-1),v.lookAt(0,-1,0),y.up.set(0,-1,0),y.lookAt(0,0,1),S.up.set(0,-1,0),S.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+p);for(let b of m)this.add(b),b.updateMatrixWorld()}update(p,m){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:g,activeMipmapLevel:_}=this;if(this.coordinateSystem!==p.coordinateSystem)this.coordinateSystem=p.coordinateSystem,this.updateCoordinateSystem();let[x,v,y,S,b,M]=this.children,T=p.getRenderTarget(),w=p.getActiveCubeFace(),E=p.getActiveMipmapLevel(),A=p.xr.enabled;p.xr.enabled=!1;let C=g.texture.mipmapsAutoUpdate;g.texture.mipmapsAutoUpdate=!1;let D=!1;if(p.isWebGLRenderer===!0)D=p.state.buffers.depth.getReversed();else D=p.reversedDepthBuffer;if(p.setRenderTarget(g,0,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,x),p.setRenderTarget(g,1,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,v),p.setRenderTarget(g,2,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,y),p.setRenderTarget(g,3,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,S),p.setRenderTarget(g,4,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,b),g.texture.mipmapsAutoUpdate=C,p.setRenderTarget(g,5,_),D&&p.autoClear===!1)p.clearDepth();p.render(m,M),p.setRenderTarget(T,w,E),p.xr.enabled=A,g.texture.needsPMREMUpdate=!0}}class Ah extends wn{constructor(p=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=p,this.perCameraFrustumCulled=!1}}var Rh="\\[\\]\\.:\\/",j_=new RegExp("["+Rh+"]","g"),Ch="[^"+Rh+"]",Q_="[^"+Rh.replace("\\.","")+"]",t0=/((?:WC+[\/:])*)/.source.replace("WC",Ch),e0=/(WCOD+)?/.source.replace("WCOD",Q_),n0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ch),i0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ch),s0=new RegExp("^"+t0+e0+n0+i0+"$"),r0=["material","materials","bones","map"];class pp{constructor(p,m,g){let _=g||Ee.parseTrackName(m);this._targetGroup=p,this._bindings=p.subscribe_(m,_)}getValue(p,m){this.bind();let g=this._targetGroup.nCachedObjects_,_=this._bindings[g];if(_!==void 0)_.getValue(p,m)}setValue(p,m){let g=this._bindings;for(let _=this._targetGroup.nCachedObjects_,x=g.length;_!==x;++_)g[_].setValue(p,m)}bind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].bind()}unbind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].unbind()}}class Ee{constructor(p,m,g){this.path=m,this.parsedPath=g||Ee.parseTrackName(m),this.node=Ee.findNode(p,this.parsedPath.nodeName),this.rootNode=p,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(p,m,g){if(!(p&&p.isAnimationObjectGroup))return new Ee(p,m,g);else return new Ee.Composite(p,m,g)}static sanitizeNodeName(p){return p.replace(/\s/g,"_").replace(j_,"")}static parseTrackName(p){let m=s0.exec(p);if(m===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+p);let g={nodeName:m[2],objectName:m[3],objectIndex:m[4],propertyName:m[5],propertyIndex:m[6]},_=g.nodeName&&g.nodeName.lastIndexOf(".");if(_!==void 0&&_!==-1){let x=g.nodeName.substring(_+1);if(r0.indexOf(x)!==-1)g.nodeName=g.nodeName.substring(0,_),g.objectName=x}if(g.propertyName===null||g.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+p);return g}static findNode(p,m){if(m===void 0||m===""||m==="."||m===-1||m===p.name||m===p.uuid)return p;if(p.skeleton){let g=p.skeleton.getBoneByName(m);if(g!==void 0)return g}if(p.children){let g=function(x){for(let v=0;v<x.length;v++){let y=x[v];if(y.name===m||y.uuid===m)return y;let S=g(y.children);if(S)return S}return null},_=g(p.children);if(_)return _}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(p,m){p[m]=this.targetObject[this.propertyName]}_getValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)p[m++]=g[_]}_getValue_arrayElement(p,m){p[m]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(p,m){this.resolvedProperty.toArray(p,m)}_setValue_direct(p,m){this.targetObject[this.propertyName]=p[m]}_setValue_direct_setNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++]}_setValue_array_setNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(p,m){this.resolvedProperty[this.propertyIndex]=p[m]}_setValue_arrayElement_setNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(p,m){this.resolvedProperty.fromArray(p,m)}_setValue_fromArray_setNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(p,m){this.bind(),this.getValue(p,m)}_setValue_unbound(p,m){this.bind(),this.setValue(p,m)}bind(){let p=this.node,m=this.parsedPath,{objectName:g,propertyName:_,propertyIndex:x}=m;if(!p)p=Ee.findNode(this.rootNode,m.nodeName),this.node=p;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!p){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(g){let b=m.objectIndex;switch(g){case"materials":if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.materials){$t("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}p=p.material.materials;break;case"bones":if(!p.skeleton){$t("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}p=p.skeleton.bones;for(let M=0;M<p.length;M++)if(p[M].name===b){b=M;break}break;case"map":if("map"in p){p=p.map;break}if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.map){$t("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}p=p.material.map;break;default:if(p[g]===void 0){$t("PropertyBinding: Can not bind to objectName of node undefined.",this);return}p=p[g]}if(b!==void 0){if(p[b]===void 0){$t("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,p);return}p=p[b]}}let v=p[_];if(v===void 0){let b=m.nodeName;$t("PropertyBinding: Trying to update property for track: "+b+"."+_+" but it wasn't found.",p);return}let y=this.Versioning.None;if(this.targetObject=p,p.isMaterial===!0)y=this.Versioning.NeedsUpdate;else if(p.isObject3D===!0)y=this.Versioning.MatrixWorldNeedsUpdate;let S=this.BindingType.Direct;if(x!==void 0){if(_==="morphTargetInfluences"){if(!p.geometry){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!p.geometry.morphAttributes){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(p.morphTargetDictionary[x]!==void 0)x=p.morphTargetDictionary[x]}S=this.BindingType.ArrayElement,this.resolvedProperty=v,this.propertyIndex=x}else if(v.fromArray!==void 0&&v.toArray!==void 0)S=this.BindingType.HasFromToArray,this.resolvedProperty=v;else if(Array.isArray(v))S=this.BindingType.EntireArray,this.resolvedProperty=v;else this.propertyName=_;this.getValue=this.GetterByBindingType[S],this.setValue=this.SetterByBindingTypeAndVersioning[S][y]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Ee.Composite=pp;Ee.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ee.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ee.prototype.GetterByBindingType=[Ee.prototype._getValue_direct,Ee.prototype._getValue_array,Ee.prototype._getValue_arrayElement,Ee.prototype._getValue_toArray];Ee.prototype.SetterByBindingTypeAndVersioning=[[Ee.prototype._setValue_direct,Ee.prototype._setValue_direct_setNeedsUpdate,Ee.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_array,Ee.prototype._setValue_array_setNeedsUpdate,Ee.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_arrayElement,Ee.prototype._setValue_arrayElement_setNeedsUpdate,Ee.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_fromArray,Ee.prototype._setValue_fromArray_setNeedsUpdate,Ee.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var jE=new Float32Array(1);var of=new re;class Yr{constructor(p,m,g=0,_=1/0){this.ray=new ki(p,m),this.near=g,this.far=_,this.camera=null,this.layers=new kr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(p,m){this.ray.set(p,m)}setFromCamera(p,m){if(m.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(m.matrixWorld),this.ray.direction.set(p.x,p.y,0.5).unproject(m).sub(this.ray.origin).normalize(),this.camera=m;else if(m.isOrthographicCamera)this.ray.origin.set(p.x,p.y,m.projectionMatrix.elements[14]).unproject(m),this.ray.direction.set(0,0,-1).transformDirection(m.matrixWorld),this.camera=m;else $t("Raycaster: Unsupported camera type: "+m.type)}setFromXRController(p){return of.identity().extractRotation(p.matrixWorld),this.ray.origin.setFromMatrixPosition(p.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(of),this}intersectObject(p,m=!0,g=[]){return sc(p,this,g,m),g.sort(af),g}intersectObjects(p,m=!0,g=[]){for(let _=0,x=p.length;_<x;_++)sc(p[_],this,g,m);return g.sort(af),g}}function af(p,m){return p.distance-m.distance}function sc(p,m,g,_){let x=!0;if(p.layers.test(m.layers)){if(p.raycast(m,g)===!1)x=!1}if(x===!0&&_===!0){let v=p.children;for(let y=0,S=v.length;y<S;y++)sc(v[y],m,g,!0)}}class Ea{constructor(p=1,m=0,g=0){this.radius=p,this.phi=m,this.theta=g}set(p,m,g){return this.radius=p,this.phi=m,this.theta=g,this}copy(p){return this.radius=p.radius,this.phi=p.phi,this.theta=p.theta,this}makeSafe(){return this.phi=ne(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(p){return this.setFromCartesianCoords(p.x,p.y,p.z)}setFromCartesianCoords(p,m,g){if(this.radius=Math.sqrt(p*p+m*m+g*g),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(p,g),this.phi=Math.acos(ne(m/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class mp{static{this.prototype.isMatrix2=!0}constructor(p,m,g,_){if(this.elements=[1,0,0,1],p!==void 0)this.set(p,m,g,_)}identity(){return this.set(1,0,0,1),this}fromArray(p,m=0){for(let g=0;g<4;g++)this.elements[g]=p[g+m];return this}set(p,m,g,_){let x=this.elements;return x[0]=p,x[2]=m,x[1]=g,x[3]=_,this}}var lf=new Y,Yo=new Y,Ds=new Y,Us=new Y,ec=new Y,o0=new Y,a0=new Y;class Rn{constructor(p=new Y,m=new Y){this.start=p,this.end=m}set(p,m){return this.start.copy(p),this.end.copy(m),this}copy(p){return this.start.copy(p.start),this.end.copy(p.end),this}getCenter(p){return p.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(p){return p.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(p,m){return this.delta(m).multiplyScalar(p).add(this.start)}closestPointToPointParameter(p,m){lf.subVectors(p,this.start),Yo.subVectors(this.end,this.start);let g=Yo.dot(Yo);if(g===0)return 0;let x=Yo.dot(lf)/g;if(m)x=ne(x,0,1);return x}closestPointToPoint(p,m,g){let _=this.closestPointToPointParameter(p,m);return this.delta(g).multiplyScalar(_).add(this.start)}distanceSqToLine3(p,m=o0,g=a0){let x,v,y=this.start,S=p.start,b=this.end,M=p.end;Ds.subVectors(b,y),Us.subVectors(M,S),ec.subVectors(y,S);let T=Ds.dot(Ds),w=Us.dot(Us),E=Us.dot(ec);if(T<=0.00000000000000010000000000000001&&w<=0.00000000000000010000000000000001)return m.copy(y),g.copy(S),m.distanceToSquared(g);if(T<=0.00000000000000010000000000000001)x=0,v=E/w,v=ne(v,0,1);else{let A=Ds.dot(ec);if(w<=0.00000000000000010000000000000001)v=0,x=ne(-A/T,0,1);else{let C=Ds.dot(Us),D=T*w-C*C;if(D!==0)x=ne((C*E-A*w)/D,0,1);else x=0;if(v=(C*x+E)/w,v<0)v=0,x=ne(-A/T,0,1);else if(v>1)v=1,x=ne((C-A)/T,0,1)}}return m.copy(y).addScaledVector(Ds,x),g.copy(S).addScaledVector(Us,v),m.distanceToSquared(g)}applyMatrix4(p){return this.start.applyMatrix4(p),this.end.applyMatrix4(p),this}equals(p){return p.start.equals(this.start)&&p.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Ta extends Ei{constructor(p,m=16776960){let g=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),_=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],x=new qe;x.setIndex(new We(g,1)),x.setAttribute("position",new sn(_,3));super(x,new zi({color:m,toneMapped:!1}));this.box=p,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(p){let m=this.box;if(m.isEmpty())return;m.getCenter(this.position),m.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(p)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function Ph(p,m,g,_){let x=l0(_);switch(g){case 1021:return p*m;case 1028:return p*m/x.components*x.byteLength;case 1029:return p*m/x.components*x.byteLength;case 1030:return p*m*2/x.components*x.byteLength;case 1031:return p*m*2/x.components*x.byteLength;case 1022:return p*m*3/x.components*x.byteLength;case 1023:return p*m*4/x.components*x.byteLength;case 1033:return p*m*4/x.components*x.byteLength;case 33776:case 33777:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 33778:case 33779:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 35841:case 35843:return Math.max(p,16)*Math.max(m,8)/4;case 35840:case 35842:return Math.max(p,8)*Math.max(m,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37808:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37809:return Math.floor((p+4)/5)*Math.floor((m+3)/4)*16;case 37810:return Math.floor((p+4)/5)*Math.floor((m+4)/5)*16;case 37811:return Math.floor((p+5)/6)*Math.floor((m+4)/5)*16;case 37812:return Math.floor((p+5)/6)*Math.floor((m+5)/6)*16;case 37813:return Math.floor((p+7)/8)*Math.floor((m+4)/5)*16;case 37814:return Math.floor((p+7)/8)*Math.floor((m+5)/6)*16;case 37815:return Math.floor((p+7)/8)*Math.floor((m+7)/8)*16;case 37816:return Math.floor((p+9)/10)*Math.floor((m+4)/5)*16;case 37817:return Math.floor((p+9)/10)*Math.floor((m+5)/6)*16;case 37818:return Math.floor((p+9)/10)*Math.floor((m+7)/8)*16;case 37819:return Math.floor((p+9)/10)*Math.floor((m+9)/10)*16;case 37820:return Math.floor((p+11)/12)*Math.floor((m+9)/10)*16;case 37821:return Math.floor((p+11)/12)*Math.floor((m+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(p/4)*Math.ceil(m/4)*16;case 36283:case 36284:return Math.ceil(p/4)*Math.ceil(m/4)*8;case 36285:case 36286:return Math.ceil(p/4)*Math.ceil(m/4)*16}throw Error(`Unable to determine texture byte length for ${g} format.`)}function l0(p){switch(p){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${p}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Xt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function Fp(){let p=null,m=!1,g=null,_=null;function x(v,y){_=p.requestAnimationFrame(x),g(v,y)}return{start:function(){if(m===!0)return;if(g===null)return;if(p===null)return;_=p.requestAnimationFrame(x),m=!0},stop:function(){if(p!==null)p.cancelAnimationFrame(_);m=!1},setAnimationLoop:function(v){g=v},setContext:function(v){p=v}}}function c0(p){let m=new WeakMap;function g(S,b){let{array:M,usage:T}=S,w=M.byteLength,E=p.createBuffer();p.bindBuffer(b,E),p.bufferData(b,M,T),S.onUploadCallback();let A;if(M instanceof Float32Array)A=p.FLOAT;else if(typeof Float16Array<"u"&&M instanceof Float16Array)A=p.HALF_FLOAT;else if(M instanceof Uint16Array)if(S.isFloat16BufferAttribute)A=p.HALF_FLOAT;else A=p.UNSIGNED_SHORT;else if(M instanceof Int16Array)A=p.SHORT;else if(M instanceof Uint32Array)A=p.UNSIGNED_INT;else if(M instanceof Int32Array)A=p.INT;else if(M instanceof Int8Array)A=p.BYTE;else if(M instanceof Uint8Array)A=p.UNSIGNED_BYTE;else if(M instanceof Uint8ClampedArray)A=p.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+M);return{buffer:E,type:A,bytesPerElement:M.BYTES_PER_ELEMENT,version:S.version,size:w}}function _(S,b,M){let{array:T,updateRanges:w}=b;if(p.bindBuffer(M,S),w.length===0)p.bufferSubData(M,0,T);else{w.sort((A,C)=>A.start-C.start);let E=0;for(let A=1;A<w.length;A++){let C=w[E],D=w[A];if(D.start<=C.start+C.count+1)C.count=Math.max(C.count,D.start+D.count-C.start);else++E,w[E]=D}w.length=E+1;for(let A=0,C=w.length;A<C;A++){let D=w[A];p.bufferSubData(M,D.start*T.BYTES_PER_ELEMENT,T,D.start,D.count)}b.clearUpdateRanges()}b.onUploadCallback()}function x(S){if(S.isInterleavedBufferAttribute)S=S.data;return m.get(S)}function v(S){if(S.isInterleavedBufferAttribute)S=S.data;let b=m.get(S);if(b)p.deleteBuffer(b.buffer),m.delete(S)}function y(S,b){if(S.isInterleavedBufferAttribute)S=S.data;if(S.isGLBufferAttribute){let T=m.get(S);if(!T||T.version<S.version)m.set(S,{buffer:S.buffer,type:S.type,bytesPerElement:S.elementSize,version:S.version});return}let M=m.get(S);if(M===void 0)m.set(S,g(S,b));else if(M.version<S.version){if(M.size!==S.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");_(M.buffer,S,b),M.version=S.version}}return{get:x,remove:v,update:y}}var h0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,u0=`#ifdef USE_ALPHAHASH
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
#endif`,d0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,f0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,p0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,m0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,g0=`#ifdef USE_AOMAP
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
#endif`,_0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,x0=`#ifdef USE_BATCHING
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
#endif`,v0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,y0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,S0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,b0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,M0=`#ifdef USE_IRIDESCENCE
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
#endif`,E0=`#ifdef USE_BUMPMAP
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
#endif`,T0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,w0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,A0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,R0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,C0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,P0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,I0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,L0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,N0=`#define PI 3.141592653589793
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
} // validated`,D0=`vec3 transformedNormal = objectNormal;
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
#endif`,U0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,O0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,F0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,B0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,k0="gl_FragColor = linearToOutputTexel( gl_FragColor );",z0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,H0=`#ifdef USE_ENVMAP
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
#endif`,G0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,V0=`#ifdef USE_ENVMAP
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
#endif`,W0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,X0=`#ifdef USE_ENVMAP
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
#endif`,q0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Y0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Z0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,$0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,J0=`#ifdef USE_GRADIENTMAP
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
}`,K0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,j0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Q0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,tx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,ex=`#ifdef USE_ENVMAP
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
#endif`,nx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ix=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,sx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,rx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ox=`PhysicalMaterial material;
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
#endif`,ax=`uniform sampler2D dfgLUT;
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
}`,lx=`
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
#endif`,cx=`#if defined( RE_IndirectDiffuse )
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
#endif`,hx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ux=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,dx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,fx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,px=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,mx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,gx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,_x=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,vx=`#if defined( USE_POINTS_UV )
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
#endif`,yx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Sx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,bx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Mx=`#if defined( USE_MORPHCOLORS )
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
#endif`,Ex=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Tx=`#ifdef USE_MORPHTARGETS
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
#endif`,wx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ax=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Rx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Cx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Px=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ix=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Lx=`#ifdef USE_NORMALMAP
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
#endif`,Nx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Dx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ux=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ox=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Fx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,kx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Hx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Gx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Vx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Wx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Xx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,qx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Yx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Zx=`float getShadowMask() {
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
}`,$x=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Jx=`#ifdef USE_SKINNING
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
#endif`,Kx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,jx=`#ifdef USE_SKINNING
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
#endif`,Qx=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,tv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ev=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,nv=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,iv=`#ifdef USE_TRANSMISSION
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
#endif`,sv=`#ifdef USE_TRANSMISSION
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
#endif`,rv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ov=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,av=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var lv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,cv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hv=`uniform sampler2D t2D;
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
}`,uv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,dv=`uniform float backgroundBlurriness;
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
}`,fv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,pv=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,mv=`#include <common>
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
}`,gv=`#if DEPTH_PACKING == 3200
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
}`,_v=`#define DISTANCE
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
}`,xv=`#define DISTANCE
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
}`,vv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,yv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sv=`uniform float scale;
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
}`,bv=`uniform vec3 diffuse;
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
}`,Mv=`#include <common>
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
}`,Ev=`uniform vec3 diffuse;
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
}`,Tv=`#define LAMBERT
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
}`,wv=`#define LAMBERT
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
}`,Av=`#define MATCAP
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
}`,Rv=`#define MATCAP
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
}`,Cv=`#define NORMAL
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
}`,Pv=`#define NORMAL
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
}`,Iv=`#define PHONG
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
}`,Lv=`#define PHONG
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
}`,Nv=`#define STANDARD
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
}`,Dv=`#define STANDARD
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
}`,Uv=`#define TOON
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
}`,Ov=`#define TOON
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
}`,Fv=`uniform float size;
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
}`,Bv=`uniform vec3 diffuse;
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
}`,kv=`#include <common>
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
}`,zv=`uniform vec3 color;
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
}`,Hv=`uniform float rotation;
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
}`,Gv=`uniform vec3 diffuse;
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
}`,ce={alphahash_fragment:h0,alphahash_pars_fragment:u0,alphamap_fragment:d0,alphamap_pars_fragment:f0,alphatest_fragment:p0,alphatest_pars_fragment:m0,aomap_fragment:g0,aomap_pars_fragment:_0,batching_pars_vertex:x0,batching_vertex:v0,begin_vertex:y0,beginnormal_vertex:S0,bsdfs:b0,iridescence_fragment:M0,bumpmap_pars_fragment:E0,clipping_planes_fragment:T0,clipping_planes_pars_fragment:w0,clipping_planes_pars_vertex:A0,clipping_planes_vertex:R0,color_fragment:C0,color_pars_fragment:P0,color_pars_vertex:I0,color_vertex:L0,common:N0,defaultnormal_vertex:D0,displacementmap_pars_vertex:U0,displacementmap_vertex:O0,emissivemap_fragment:F0,emissivemap_pars_fragment:B0,colorspace_fragment:k0,colorspace_pars_fragment:z0,envmap_fragment:H0,envmap_common_pars_fragment:G0,envmap_pars_fragment:V0,envmap_pars_vertex:W0,envmap_physical_pars_fragment:ex,envmap_vertex:X0,fog_vertex:q0,fog_pars_vertex:Y0,fog_fragment:Z0,fog_pars_fragment:$0,gradientmap_pars_fragment:J0,lightmap_pars_fragment:K0,lights_lambert_fragment:j0,lights_lambert_pars_fragment:Q0,lights_pars_begin:tx,lights_toon_fragment:nx,lights_toon_pars_fragment:ix,lights_phong_fragment:sx,lights_phong_pars_fragment:rx,lights_physical_fragment:ox,lights_physical_pars_fragment:ax,lights_fragment_begin:lx,lights_fragment_maps:cx,lights_fragment_end:hx,lightprobes_pars_fragment:ux,logdepthbuf_fragment:dx,logdepthbuf_pars_fragment:fx,logdepthbuf_pars_vertex:px,logdepthbuf_vertex:mx,map_fragment:gx,map_pars_fragment:_x,map_particle_fragment:xx,map_particle_pars_fragment:vx,metalnessmap_fragment:yx,metalnessmap_pars_fragment:Sx,morphinstance_vertex:bx,morphcolor_vertex:Mx,morphnormal_vertex:Ex,morphtarget_pars_vertex:Tx,morphtarget_vertex:wx,normal_fragment_begin:Ax,normal_fragment_maps:Rx,normal_pars_fragment:Cx,normal_pars_vertex:Px,normal_vertex:Ix,normalmap_pars_fragment:Lx,clearcoat_normal_fragment_begin:Nx,clearcoat_normal_fragment_maps:Dx,clearcoat_pars_fragment:Ux,iridescence_pars_fragment:Ox,opaque_fragment:Fx,packing:Bx,premultiplied_alpha_fragment:kx,project_vertex:zx,dithering_fragment:Hx,dithering_pars_fragment:Gx,roughnessmap_fragment:Vx,roughnessmap_pars_fragment:Wx,shadowmap_pars_fragment:Xx,shadowmap_pars_vertex:qx,shadowmap_vertex:Yx,shadowmask_pars_fragment:Zx,skinbase_vertex:$x,skinning_pars_vertex:Jx,skinning_vertex:Kx,skinnormal_vertex:jx,specularmap_fragment:Qx,specularmap_pars_fragment:tv,tonemapping_fragment:ev,tonemapping_pars_fragment:nv,transmission_fragment:iv,transmission_pars_fragment:sv,uv_pars_fragment:rv,uv_pars_vertex:ov,uv_vertex:av,worldpos_vertex:lv,background_vert:cv,background_frag:hv,backgroundCube_vert:uv,backgroundCube_frag:dv,cube_vert:fv,cube_frag:pv,depth_vert:mv,depth_frag:gv,distance_vert:_v,distance_frag:xv,equirect_vert:vv,equirect_frag:yv,linedashed_vert:Sv,linedashed_frag:bv,meshbasic_vert:Mv,meshbasic_frag:Ev,meshlambert_vert:Tv,meshlambert_frag:wv,meshmatcap_vert:Av,meshmatcap_frag:Rv,meshnormal_vert:Cv,meshnormal_frag:Pv,meshphong_vert:Iv,meshphong_frag:Lv,meshphysical_vert:Nv,meshphysical_frag:Dv,meshtoon_vert:Uv,meshtoon_frag:Ov,points_vert:Fv,points_frag:Bv,shadow_vert:kv,shadow_frag:zv,sprite_vert:Hv,sprite_frag:Gv},Pt={common:{diffuse:{value:new oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qt}},envmap:{envMap:{value:null},envMapRotation:{value:new Qt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qt},normalScale:{value:new Jt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0},uvTransform:{value:new Qt}},sprite:{diffuse:{value:new oe(16777215)},opacity:{value:1},center:{value:new Jt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}}},ri={basic:{uniforms:pn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.fog]),vertexShader:ce.meshbasic_vert,fragmentShader:ce.meshbasic_frag},lambert:{uniforms:pn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},envMapIntensity:{value:1}}]),vertexShader:ce.meshlambert_vert,fragmentShader:ce.meshlambert_frag},phong:{uniforms:pn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},specular:{value:new oe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ce.meshphong_vert,fragmentShader:ce.meshphong_frag},standard:{uniforms:pn([Pt.common,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.roughnessmap,Pt.metalnessmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ce.meshphysical_vert,fragmentShader:ce.meshphysical_frag},toon:{uniforms:pn([Pt.common,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.gradientmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)}}]),vertexShader:ce.meshtoon_vert,fragmentShader:ce.meshtoon_frag},matcap:{uniforms:pn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,{matcap:{value:null}}]),vertexShader:ce.meshmatcap_vert,fragmentShader:ce.meshmatcap_frag},points:{uniforms:pn([Pt.points,Pt.fog]),vertexShader:ce.points_vert,fragmentShader:ce.points_frag},dashed:{uniforms:pn([Pt.common,Pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ce.linedashed_vert,fragmentShader:ce.linedashed_frag},depth:{uniforms:pn([Pt.common,Pt.displacementmap]),vertexShader:ce.depth_vert,fragmentShader:ce.depth_frag},normal:{uniforms:pn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,{opacity:{value:1}}]),vertexShader:ce.meshnormal_vert,fragmentShader:ce.meshnormal_frag},sprite:{uniforms:pn([Pt.sprite,Pt.fog]),vertexShader:ce.sprite_vert,fragmentShader:ce.sprite_frag},background:{uniforms:{uvTransform:{value:new Qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ce.background_vert,fragmentShader:ce.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qt}},vertexShader:ce.backgroundCube_vert,fragmentShader:ce.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ce.cube_vert,fragmentShader:ce.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ce.equirect_vert,fragmentShader:ce.equirect_frag},distance:{uniforms:pn([Pt.common,Pt.displacementmap,{referencePosition:{value:new Y},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:ce.distance_vert,fragmentShader:ce.distance_frag},shadow:{uniforms:pn([Pt.lights,Pt.fog,{color:{value:new oe(0)},opacity:{value:1}}]),vertexShader:ce.shadow_vert,fragmentShader:ce.shadow_frag}};ri.physical={uniforms:pn([ri.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qt},clearcoatNormalScale:{value:new Jt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Qt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qt},sheen:{value:0},sheenColor:{value:new oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qt},transmissionSamplerSize:{value:new Jt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qt},attenuationDistance:{value:0},attenuationColor:{value:new oe(0)},specularColor:{value:new oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qt},anisotropyVector:{value:new Jt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qt}}]),vertexShader:ce.meshphysical_vert,fragmentShader:ce.meshphysical_frag};var wa={r:0,b:0,g:0},Vv=new re,Bp=new Qt;Bp.set(-1,0,0,0,1,0,0,0,1);function Wv(p,m,g,_,x,v){let y=new oe(0),S=x===!0?0:1,b,M,T=null,w=0,E=null;function A(L){let U=L.isScene===!0?L.background:null;if(U&&U.isTexture){let N=L.backgroundBlurriness>0;U=m.get(U,N)}return U}function C(L){let U=!1,N=A(L);if(N===null)R(y,S);else if(N&&N.isColor)R(N,1),U=!0;let F=p.xr.getEnvironmentBlendMode();if(F==="additive")g.buffers.color.setClear(0,0,0,1,v);else if(F==="alpha-blend")g.buffers.color.setClear(0,0,0,0,v);if(p.autoClear||U)g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),p.clear(p.autoClearColor,p.autoClearDepth,p.autoClearStencil)}function D(L,U){let N=A(U);if(N&&N.isCubeTexture){if(M===void 0)M=new rn(new Zs(1,1,1),new Ti({name:"BackgroundCubeMaterial",uniforms:ds(ri.backgroundCube.uniforms),vertexShader:ri.backgroundCube.vertexShader,fragmentShader:ri.backgroundCube.fragmentShader,side:fn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),M.geometry.deleteAttribute("normal"),M.geometry.deleteAttribute("uv"),M.onBeforeRender=function(F,z,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(M.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),_.update(M);if(M.material.uniforms.envMap.value=N,M.material.uniforms.backgroundBlurriness.value=U.backgroundBlurriness,M.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,M.material.uniforms.backgroundRotation.value.setFromMatrix4(Vv.makeRotationFromEuler(U.backgroundRotation)).transpose(),N.isRenderTargetTexture===!1)M.material.uniforms.backgroundRotation.value.premultiply(Bp);if(M.material.toneMapped=he.getTransfer(N.colorSpace)!==Ce,T!==N||w!==N.version||E!==p.toneMapping)M.material.needsUpdate=!0,T=N,w=N.version,E=p.toneMapping;M.layers.enableAll(),L.unshift(M,M.geometry,M.material,0,0,null)}else if(N&&N.isTexture){if(b===void 0)b=new rn(new Wr(2,2),new Ti({name:"BackgroundMaterial",uniforms:ds(ri.background.uniforms),vertexShader:ri.background.vertexShader,fragmentShader:ri.background.fragmentShader,side:xi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),b.geometry.deleteAttribute("normal"),Object.defineProperty(b.material,"map",{get:function(){return this.uniforms.t2D.value}}),_.update(b);if(b.material.uniforms.t2D.value=N,b.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,b.material.toneMapped=he.getTransfer(N.colorSpace)!==Ce,N.matrixAutoUpdate===!0)N.updateMatrix();if(b.material.uniforms.uvTransform.value.copy(N.matrix),T!==N||w!==N.version||E!==p.toneMapping)b.material.needsUpdate=!0,T=N,w=N.version,E=p.toneMapping;b.layers.enableAll(),L.unshift(b,b.geometry,b.material,0,0,null)}}function R(L,U){L.getRGB(wa,dh(p)),g.buffers.color.setClear(wa.r,wa.g,wa.b,U,v)}function P(){if(M!==void 0)M.geometry.dispose(),M.material.dispose(),M=void 0;if(b!==void 0)b.geometry.dispose(),b.material.dispose(),b=void 0}return{getClearColor:function(){return y},setClearColor:function(L,U=1){y.set(L),S=U,R(y,S)},getClearAlpha:function(){return S},setClearAlpha:function(L){S=L,R(y,S)},render:C,addToRenderList:D,dispose:P}}function Xv(p,m){let g=p.getParameter(p.MAX_VERTEX_ATTRIBS),_={},x=E(null),v=x,y=!1;function S(H,W,J,G,Q){let it=!1,tt=w(H,G,J,W);if(v!==tt)v=tt,M(v.object);if(it=A(H,G,J,Q),it)C(H,G,J,Q);if(Q!==null)m.update(Q,p.ELEMENT_ARRAY_BUFFER);if(it||y){if(y=!1,N(H,W,J,G),Q!==null)p.bindBuffer(p.ELEMENT_ARRAY_BUFFER,m.get(Q).buffer)}}function b(){return p.createVertexArray()}function M(H){return p.bindVertexArray(H)}function T(H){return p.deleteVertexArray(H)}function w(H,W,J,G){let Q=G.wireframe===!0,it=_[W.id];if(it===void 0)it={},_[W.id]=it;let tt=H.isInstancedMesh===!0?H.id:0,pt=it[tt];if(pt===void 0)pt={},it[tt]=pt;let ot=pt[J.id];if(ot===void 0)ot={},pt[J.id]=ot;let dt=ot[Q];if(dt===void 0)dt=E(b()),ot[Q]=dt;return dt}function E(H){let W=[],J=[],G=[];for(let Q=0;Q<g;Q++)W[Q]=0,J[Q]=0,G[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:J,attributeDivisors:G,object:H,attributes:{},index:null}}function A(H,W,J,G){let Q=v.attributes,it=W.attributes,tt=0,pt=J.getAttributes();for(let ot in pt)if(pt[ot].location>=0){let _t=Q[ot],Dt=it[ot];if(Dt===void 0){if(ot==="instanceMatrix"&&H.instanceMatrix)Dt=H.instanceMatrix;if(ot==="instanceColor"&&H.instanceColor)Dt=H.instanceColor}if(_t===void 0)return!0;if(_t.attribute!==Dt)return!0;if(Dt&&_t.data!==Dt.data)return!0;tt++}if(v.attributesNum!==tt)return!0;if(v.index!==G)return!0;return!1}function C(H,W,J,G){let Q={},it=W.attributes,tt=0,pt=J.getAttributes();for(let ot in pt)if(pt[ot].location>=0){let _t=it[ot];if(_t===void 0){if(ot==="instanceMatrix"&&H.instanceMatrix)_t=H.instanceMatrix;if(ot==="instanceColor"&&H.instanceColor)_t=H.instanceColor}let Dt={};if(Dt.attribute=_t,_t&&_t.data)Dt.data=_t.data;Q[ot]=Dt,tt++}v.attributes=Q,v.attributesNum=tt,v.index=G}function D(){let H=v.newAttributes;for(let W=0,J=H.length;W<J;W++)H[W]=0}function R(H){P(H,0)}function P(H,W){let J=v.newAttributes,G=v.enabledAttributes,Q=v.attributeDivisors;if(J[H]=1,G[H]===0)p.enableVertexAttribArray(H),G[H]=1;if(Q[H]!==W)p.vertexAttribDivisor(H,W),Q[H]=W}function L(){let H=v.newAttributes,W=v.enabledAttributes;for(let J=0,G=W.length;J<G;J++)if(W[J]!==H[J])p.disableVertexAttribArray(J),W[J]=0}function U(H,W,J,G,Q,it,tt){if(tt===!0)p.vertexAttribIPointer(H,W,J,Q,it);else p.vertexAttribPointer(H,W,J,G,Q,it)}function N(H,W,J,G){D();let Q=G.attributes,it=J.getAttributes(),tt=W.defaultAttributeValues;for(let pt in it){let ot=it[pt];if(ot.location>=0){let dt=Q[pt];if(dt===void 0){if(pt==="instanceMatrix"&&H.instanceMatrix)dt=H.instanceMatrix;if(pt==="instanceColor"&&H.instanceColor)dt=H.instanceColor}if(dt!==void 0){let _t=dt.normalized,Dt=dt.itemSize,at=m.get(dt);if(at===void 0)continue;let{buffer:mt,type:At,bytesPerElement:Ht}=at,Ft=At===p.INT||At===p.UNSIGNED_INT||dt.gpuType===_c;if(dt.isInterleavedBufferAttribute){let Rt=dt.data,ae=Rt.isInterleavedBuffer===!0?Rt.stride:Rt.itemSize,Kt=dt.offset;if(Rt.isInstancedInterleavedBuffer||Rt.isInstancedBufferAttribute){for(let Ut=0;Ut<ot.locationSize;Ut++)P(ot.location+Ut,Rt.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=Rt.meshPerAttribute*Rt.count}else for(let Ut=0;Ut<ot.locationSize;Ut++)R(ot.location+Ut);p.bindBuffer(p.ARRAY_BUFFER,mt);for(let Ut=0;Ut<ot.locationSize;Ut++)U(ot.location+Ut,Dt/ot.locationSize,At,_t,ae*Ht,(Kt+Dt/ot.locationSize*Ut)*Ht,Ft)}else{if(dt.isInstancedBufferAttribute){for(let Rt=0;Rt<ot.locationSize;Rt++)P(ot.location+Rt,dt.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=dt.meshPerAttribute*dt.count}else for(let Rt=0;Rt<ot.locationSize;Rt++)R(ot.location+Rt);p.bindBuffer(p.ARRAY_BUFFER,mt);for(let Rt=0;Rt<ot.locationSize;Rt++)U(ot.location+Rt,Dt/ot.locationSize,At,_t,Dt*Ht,Dt/ot.locationSize*Rt*Ht,Ft)}}else if(tt!==void 0){let _t=tt[pt];if(_t!==void 0)switch(_t.length){case 2:p.vertexAttrib2fv(ot.location,_t);break;case 3:p.vertexAttrib3fv(ot.location,_t);break;case 4:p.vertexAttrib4fv(ot.location,_t);break;default:p.vertexAttrib1fv(ot.location,_t)}}}}L()}function F(){V();for(let H in _){let W=_[H];for(let J in W){let G=W[J];for(let Q in G){let it=G[Q];for(let tt in it)T(it[tt].object),delete it[tt];delete G[Q]}}delete _[H]}}function z(H){if(_[H.id]===void 0)return;let W=_[H.id];for(let J in W){let G=W[J];for(let Q in G){let it=G[Q];for(let tt in it)T(it[tt].object),delete it[tt];delete G[Q]}}delete _[H.id]}function I(H){for(let W in _){let J=_[W];for(let G in J){let Q=J[G];if(Q[H.id]===void 0)continue;let it=Q[H.id];for(let tt in it)T(it[tt].object),delete it[tt];delete Q[H.id]}}}function O(H){for(let W in _){let J=_[W],G=H.isInstancedMesh===!0?H.id:0,Q=J[G];if(Q===void 0)continue;for(let it in Q){let tt=Q[it];for(let pt in tt)T(tt[pt].object),delete tt[pt];delete Q[it]}if(delete J[G],Object.keys(J).length===0)delete _[W]}}function V(){if(q(),y=!0,v===x)return;v=x,M(v.object)}function q(){x.geometry=null,x.program=null,x.wireframe=!1}return{setup:S,reset:V,resetDefaultState:q,dispose:F,releaseStatesOfGeometry:z,releaseStatesOfObject:O,releaseStatesOfProgram:I,initAttributes:D,enableAttribute:R,disableUnusedAttributes:L}}function qv(p,m,g){let _;function x(b){_=b}function v(b,M){p.drawArrays(_,b,M),g.update(M,_,1)}function y(b,M,T){if(T===0)return;p.drawArraysInstanced(_,b,M,T),g.update(M,_,T)}function S(b,M,T){if(T===0)return;m.get("WEBGL_multi_draw").multiDrawArraysWEBGL(_,b,0,M,0,T);let E=0;for(let A=0;A<T;A++)E+=M[A];g.update(E,_,1)}this.setMode=x,this.render=v,this.renderInstances=y,this.renderMultiDraw=S}function Yv(p,m,g,_){let x;function v(){if(x!==void 0)return x;if(m.has("EXT_texture_filter_anisotropic")===!0){let I=m.get("EXT_texture_filter_anisotropic");x=p.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else x=0;return x}function y(I){if(I!==kn&&_.convert(I)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function S(I){let O=I===ii&&(m.has("EXT_color_buffer_half_float")||m.has("EXT_color_buffer_float"));if(I!==Zn&&I!==vi&&!O&&_.convert(I)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function b(I){if(I==="highp"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.HIGH_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.HIGH_FLOAT).precision>0)return"highp";I="mediump"}if(I==="mediump"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.MEDIUM_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let M=g.precision!==void 0?g.precision:"highp",T=b(M);if(T!==M)Xt("WebGLRenderer:",M,"not supported, using",T,"instead."),M=T;let w=g.reversedDepthBuffer===!0&&m.has("EXT_clip_control"),E=g.logarithmicDepthBuffer===!0&&w===!1;if(g.reversedDepthBuffer===!0&&w===!1)Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(g.logarithmicDepthBuffer===!0&&w===!0)Xt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let A=p.getParameter(p.MAX_TEXTURE_IMAGE_UNITS),C=p.getParameter(p.MAX_VERTEX_TEXTURE_IMAGE_UNITS),D=p.getParameter(p.MAX_TEXTURE_SIZE),R=p.getParameter(p.MAX_CUBE_MAP_TEXTURE_SIZE),P=p.getParameter(p.MAX_VERTEX_ATTRIBS),L=p.getParameter(p.MAX_VERTEX_UNIFORM_VECTORS),U=p.getParameter(p.MAX_VARYING_VECTORS),N=p.getParameter(p.MAX_FRAGMENT_UNIFORM_VECTORS),F=p.getParameter(p.MAX_SAMPLES),z=p.getParameter(p.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:v,getMaxPrecision:b,textureFormatReadable:y,textureTypeReadable:S,precision:M,logarithmicDepthBuffer:E,reversedDepthBuffer:w,maxTextures:A,maxVertexTextures:C,maxTextureSize:D,maxCubemapSize:R,maxAttributes:P,maxVertexUniforms:L,maxVaryings:U,maxFragmentUniforms:N,maxSamples:F,samples:z}}function Zv(p){let m=this,g=null,_=0,x=!1,v=!1,y=new nn,S=new Qt,b={value:null,needsUpdate:!1};this.uniform=b,this.numPlanes=0,this.numIntersection=0,this.init=function(w,E){let A=w.length!==0||E||_!==0||x;return x=E,_=w.length,A},this.beginShadows=function(){v=!0,T(null)},this.endShadows=function(){v=!1},this.setGlobalState=function(w,E){g=T(w,E,0)},this.setState=function(w,E,A){let{clippingPlanes:C,clipIntersection:D,clipShadows:R}=w,P=p.get(w);if(!x||C===null||C.length===0||v&&!R)if(v)T(null);else M();else{let L=v?0:_,U=L*4,N=P.clippingState||null;b.value=N,N=T(C,E,U,A);for(let F=0;F!==U;++F)N[F]=g[F];P.clippingState=N,this.numIntersection=D?this.numPlanes:0,this.numPlanes+=L}};function M(){if(b.value!==g)b.value=g,b.needsUpdate=_>0;m.numPlanes=_,m.numIntersection=0}function T(w,E,A,C){let D=w!==null?w.length:0,R=null;if(D!==0){if(R=b.value,C!==!0||R===null){let P=A+D*4,L=E.matrixWorldInverse;if(S.getNormalMatrix(L),R===null||R.length<P)R=new Float32Array(P);for(let U=0,N=A;U!==D;++U,N+=4)y.copy(w[U]).applyMatrix4(L,S),y.normal.toArray(R,N),R[N+3]=y.constant}b.value=R,b.needsUpdate=!0}return m.numPlanes=D,m.numIntersection=0,R}}class Ca extends zn{constructor(p=1,m={}){super(p,p,m);this.isWebGLCubeRenderTarget=!0;let g={width:p,height:p,depth:1},_=[g,g,g,g,g,g];this.texture=new da(_),this._setTextureOptions(m),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(p,m){this.texture.type=m.type,this.texture.colorSpace=m.colorSpace,this.texture.generateMipmaps=m.generateMipmaps,this.texture.minFilter=m.minFilter,this.texture.magFilter=m.magFilter;let g={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},_=new Zs(5,5,5),x=new Ti({name:"CubemapFromEquirect",uniforms:ds(g.uniforms),vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,side:fn,blending:ss});x.uniforms.tEquirect.value=m;let v=new rn(_,x),y=m.minFilter;if(m.minFilter===Yn)m.minFilter=An;return new qr(1,10,this).update(p,v),m.minFilter=y,v.geometry.dispose(),v.material.dispose(),this}clear(p,m=!0,g=!0,_=!0){let x=p.getRenderTarget();for(let v=0;v<6;v++)p.setRenderTarget(this,v),p.clear(m,g,_);p.setRenderTarget(x)}}var gp=256,$v=3,Jv=20,kp=256,zp=16,Kv=3,jv=new Y,Qv=new oe;class Ra{constructor(p){this._renderer=p,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new qr(1,10,null),this._boxMesh=new rn(new Zs(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(p,m=0,g=0.1,_=100,x={}){let{size:v=256,position:y=jv}=x,S=this._renderer;this._setSize(v);let b=this._allocateTarget(),M=this._getSourceTarget(!0);if(m>0)M.texture.mipmapsAutoUpdate=!1;let{autoClear:T,autoClearColor:w,autoClearDepth:E,autoClearStencil:A}=S,C=p.background;if(S.autoClear=!0,S.autoClearColor=!0,S.autoClearDepth=!0,S.autoClearStencil=!0,C===null)p.background=S.getClearColor(Qv);let D=new qr(g,_,M);if(D.position.copy(y),D.update(S,p),S.autoClear=T,S.autoClearColor=w,S.autoClearDepth=E,S.autoClearStencil=A,p.background=C,m>0)M.texture.mipmapsAutoUpdate=!0,this._blur(b,m);return this._applyPMREM(b),b}fromEquirectangular(p,m=null){return this._fromTexture(p,m)}fromCubemap(p,m=null){return this._fromTexture(p,m)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=vp(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=xp(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(p,m){return m>0?1-Math.sqrt(1-p/m):0}_setSize(p){this._cubeSize=Math.max(gp,rh(p))}_fromTexture(p,m){if(p.mapping===Lr||p.mapping===Vs)this._setSize(p.image.length===0?gp:p.image[0].width||p.image[0].image.width);else this._setSize(p.image.width/4);let g=m||this._allocateTarget();return this._textureToCubemap(p),this._applyPMREM(g),g}_allocateTarget(){let p=this._cubeSize,m=_p(p,!1,!1),g=Math.log2(p)-$v;for(let _=0;_<=g;_++)m.texture.mipmaps.push({width:p>>_,height:p>>_});return m.texture.name="PMREM",m.texture.isPMREMTexture=!0,m}_getSourceTarget(p=!1){let m=this._cubeSize,g=this._sourceTarget;if(g===null||g.width!==m||p&&g.depthBuffer===!1){if(g!==null)g.dispose();this._sourceTarget=_p(m,!0,p)}return this._sourceTarget}_compileMaterial(p){this._boxMesh.material=p,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(p,m,g){let _=this._boxMesh,x=this._cubeCamera;_.material=g,x.renderTarget=p,x.activeMipmapLevel=m;let v=p.width>>m;p.viewport.set(0,0,v,v),x.update(this._renderer,_),p.viewport.set(0,0,p.width,p.height)}_textureToCubemap(p){let m;if(p.mapping===Lr||p.mapping===Vs){if(this._cubemapMaterial===null)this._cubemapMaterial=vp();m=this._cubemapMaterial,m.uniforms.flipEnvMap.value=p.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=xp();m=this._equirectMaterial}m.uniforms.envMap.value=p,this._renderCube(this._getSourceTarget(),0,m)}_applyPMREM(p){if(this._ggxMaterial===null)this._ggxMaterial=ty(),this._integrationMaterial=ey();let m=this._cubeSize,g=p.texture.mipmaps.length-1,_=this._ggxMaterial.uniforms;_.envMap.value=this._sourceTarget.texture;let x=this._integrationMaterial.uniforms;x.envMap.value=this._sourceTarget.texture,x.sourceLod.value=Math.log2(m/zp);for(let v=0;v<=g;v++){let y=Ra.lodToRoughness(v,g);if(v>g-Kv)x.roughness.value=y,this._renderCube(p,v,this._integrationMaterial);else{let S=y>0?Math.log2(m)+0.5*Math.log2(6/(kp*Math.pow(y,4)))+0.5:0;_.roughness.value=y,_.lodBias.value=S,this._renderCube(p,v,this._ggxMaterial)}}}_blur(p,m){if(this._blurMaterial===null)this._blurMaterial=ny();let g=this._blurMaterial,_=g.uniforms,x=this._sourceTarget;_.sigma.value=Math.min(m,Math.PI)/Math.SQRT2,_.envMap.value=x.texture,this._renderCube(p,0,g),_.envMap.value=p.texture,this._renderCube(x,0,g)}}function _p(p,m,g){return new Ca(p,{minFilter:Yn,generateMipmaps:m,type:ii,colorSpace:Kc,depthBuffer:g})}function Kr(p,m,g){return new Ti({name:p,uniforms:m,vertexShader:ce.cube_vert,fragmentShader:g,side:fn,blending:ss,depthTest:!1,depthWrite:!1})}function ty(){return Kr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${kp}u

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
	`)}function ey(){return Kr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:zp}},`

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
	`)}function ny(){return Kr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Jv}
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
	`)}function xp(){return Kr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function vp(){return Kr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function iy(p){let m=new WeakMap,g=new WeakMap,_=null;function x(E,A=!1){if(E===null||E===void 0)return null;if(A)return y(E);return v(E)}function v(E){if(E&&E.isTexture){let A=E.mapping;if(A===Jo||A===Ko)if(m.has(E)){let C=m.get(E).texture;return S(C,E.mapping)}else{let C=E.image;if(C&&C.height>0){let D=new Ca(C.height);return D.fromEquirectangularTexture(p,E),m.set(E,D),E.addEventListener("dispose",M),S(D.texture,E.mapping)}else return null}}return E}function y(E){if(E&&E.isTexture&&E.isPMREMTexture!==!0){let A=E.mapping,C=A===Jo||A===Ko,D=A===Lr||A===Vs;if(C||D){let R=g.get(E),P=R!==void 0?R.texture.pmremVersion:0;if(E.isRenderTargetTexture&&E.pmremVersion!==P){if(_===null)_=new Ra(p);return R=C?_.fromEquirectangular(E,R):_.fromCubemap(E,R),R.texture.pmremVersion=E.pmremVersion,g.set(E,R),R.texture}else if(R!==void 0)return R.texture;else{let L=E.image;if(C&&L&&L.height>0||D&&L&&b(L)){if(_===null)_=new Ra(p);return R=C?_.fromEquirectangular(E):_.fromCubemap(E),R.texture.pmremVersion=E.pmremVersion,g.set(E,R),E.addEventListener("dispose",T),R.texture}else return null}}}return E}function S(E,A){if(A===Jo)E.mapping=Lr;else if(A===Ko)E.mapping=Vs;return E}function b(E){let A=0,C=6;for(let D=0;D<C;D++)if(E[D]!==void 0)A++;return A===C}function M(E){let A=E.target;A.removeEventListener("dispose",M);let C=m.get(A);if(C!==void 0)m.delete(A),C.dispose()}function T(E){let A=E.target;A.removeEventListener("dispose",T);let C=g.get(A);if(C!==void 0)g.delete(A),C.dispose()}function w(){if(m=new WeakMap,g=new WeakMap,_!==null)_.dispose(),_=null}return{get:x,dispose:w}}function sy(p){let m={};function g(_){if(m[_]!==void 0)return m[_];let x=p.getExtension(_);return m[_]=x,x}return{has:function(_){return g(_)!==null},init:function(){g("EXT_color_buffer_float"),g("WEBGL_clip_cull_distance"),g("OES_texture_float_linear"),g("EXT_color_buffer_half_float"),g("WEBGL_multisampled_render_to_texture"),g("WEBGL_render_shared_exponent")},get:function(_){let x=g(_);if(x===null)Tr("WebGLRenderer: "+_+" extension not supported.");return x}}}function ry(p,m,g,_){let x={},v=new WeakMap,y=new FinalizationRegistry((C)=>delete x[C]);function S(C){b(C.target)}function b(C){if(C.index!==null)m.remove(C.index);for(let R in C.attributes)m.remove(C.attributes[R]);C.removeEventListener("dispose",S),delete x[C.id],y.unregister(C);let D=v.get(C);if(D)m.remove(D),v.delete(C);if(_.releaseStatesOfGeometry(C),C.isInstancedBufferGeometry===!0)delete C._maxInstanceCount;g.memory.geometries--}function M(C,D){if(x[D.id]!==void 0)return D;return D.addEventListener("dispose",S),x[D.id]=new WeakRef(D),y.register(D,D.id,D),g.memory.geometries++,D}function T(C){let D=C.attributes;for(let R in D)m.update(D[R],p.ARRAY_BUFFER)}function w(C){let D=C.index,R=C.attributes.position,P=0;if(R===void 0)return;let L=D!==null?D.array.length:R.array.length/3-1,N=new(R.count>=65535?ca:la)(Math.ceil(L/3)*6,1),F=N.array;if(D!==null){let I=D.array;P=D.version;for(let O=0,V=0;O<L;O+=3){let q=I[O+0],H=I[O+1],W=I[O+2];F[V++]=q,F[V++]=H,F[V++]=H,F[V++]=W,F[V++]=W,F[V++]=q}}else{P=R.version;for(let I=0,O=0;I<L;I+=3){let V=I+0,q=I+1,H=I+2;F[O++]=V,F[O++]=q,F[O++]=q,F[O++]=H,F[O++]=H,F[O++]=V}}N.version=P;let z=v.get(C);if(z)m.remove(z);v.set(C,N)}function E(C){let D=v.get(C);if(D){let R=C.index;if(R!==null){if(D.version<R.version)w(C)}}else w(C);return v.get(C)}function A(){for(let C in x){let D=x[C].deref();if(D!==void 0)b(D)}}return{get:M,update:T,getWireframeAttribute:E,dispose:A}}function oy(p,m,g){let _;function x(w){_=w}let v,y;function S(w){v=w.type,y=w.bytesPerElement}function b(w,E){p.drawElements(_,E,v,w*y),g.update(E,_,1)}function M(w,E,A){if(A===0)return;p.drawElementsInstanced(_,E,v,w*y,A),g.update(E,_,A)}function T(w,E,A){if(A===0)return;m.get("WEBGL_multi_draw").multiDrawElementsWEBGL(_,E,0,v,w,0,A);let D=0;for(let R=0;R<A;R++)D+=E[R];g.update(D,_,1)}this.setMode=x,this.setIndex=S,this.render=b,this.renderInstances=M,this.renderMultiDraw=T}function ay(p){let m={geometries:0,textures:0},g={frame:0,calls:0,triangles:0,points:0,lines:0};function _(v,y,S){switch(g.calls++,y){case p.TRIANGLES:g.triangles+=S*(v/3);break;case p.LINES:g.lines+=S*(v/2);break;case p.LINE_STRIP:g.lines+=S*(v-1);break;case p.LINE_LOOP:g.lines+=S*v;break;case p.POINTS:g.points+=S*v;break;default:$t("WebGLInfo: Unknown draw mode:",y);break}}function x(){g.calls=0,g.triangles=0,g.points=0,g.lines=0}return{memory:m,render:g,programs:null,autoReset:!0,reset:x,update:_}}function ly(p,m,g){let _=new WeakMap,x=new Oe;function v(y,S,b){let M=y.morphTargetInfluences,T=S.morphAttributes.position||S.morphAttributes.normal||S.morphAttributes.color,w=T!==void 0?T.length:0,E=_.get(S);if(E===void 0||E.count!==w){let V=function(){I.dispose(),_.delete(S),S.removeEventListener("dispose",V)};if(E!==void 0)E.texture.dispose();let A=S.morphAttributes.position!==void 0,C=S.morphAttributes.normal!==void 0,D=S.morphAttributes.color!==void 0,R=S.morphAttributes.position||[],P=S.morphAttributes.normal||[],L=S.morphAttributes.color||[],U=0;if(A===!0)U=1;if(C===!0)U=2;if(D===!0)U=3;let N=S.attributes.position.count*U,F=1;if(N>m.maxTextureSize)F=Math.ceil(N/m.maxTextureSize),N=m.maxTextureSize;let z=new Float32Array(N*F*4*w),I=new oa(z,N,F,w);I.type=vi,I.needsUpdate=!0;let O=U*4;for(let q=0;q<w;q++){let H=R[q],W=P[q],J=L[q],G=N*F*4*q;for(let Q=0;Q<H.count;Q++){let it=Q*O;if(A===!0)x.fromBufferAttribute(H,Q),z[G+it+0]=x.x,z[G+it+1]=x.y,z[G+it+2]=x.z,z[G+it+3]=0;if(C===!0)x.fromBufferAttribute(W,Q),z[G+it+4]=x.x,z[G+it+5]=x.y,z[G+it+6]=x.z,z[G+it+7]=0;if(D===!0)x.fromBufferAttribute(J,Q),z[G+it+8]=x.x,z[G+it+9]=x.y,z[G+it+10]=x.z,z[G+it+11]=J.itemSize===4?x.w:1}}E={count:w,texture:I,size:new Jt(N,F)},_.set(S,E),S.addEventListener("dispose",V)}if(y.isInstancedMesh===!0&&y.morphTexture!==null)b.getUniforms().setValue(p,"morphTexture",y.morphTexture,g);else{let A=0;for(let D=0;D<M.length;D++)A+=M[D];let C=S.morphTargetsRelative?1:1-A;b.getUniforms().setValue(p,"morphTargetBaseInfluence",C),b.getUniforms().setValue(p,"morphTargetInfluences",M)}b.getUniforms().setValue(p,"morphTargetsTexture",E.texture,g),b.getUniforms().setValue(p,"morphTargetsTextureSize",E.size)}return{update:v}}function cy(p,m,g,_,x){let v=new WeakMap;function y(M){let T=x.render.frame,w=M.geometry,E=m.get(M,w);if(v.get(E)!==T)m.update(E),v.set(E,T);if(M.isInstancedMesh){if(M.hasEventListener("dispose",b)===!1)M.addEventListener("dispose",b);if(v.get(M)!==T){if(g.update(M.instanceMatrix,p.ARRAY_BUFFER),M.instanceColor!==null)g.update(M.instanceColor,p.ARRAY_BUFFER);v.set(M,T)}}if(M.isSkinnedMesh){let A=M.skeleton;if(v.get(A)!==T)A.update(),v.set(A,T)}return E}function S(){v=new WeakMap}function b(M){let T=M.target;if(T.removeEventListener("dispose",b),_.releaseStatesOfObject(T),g.remove(T.instanceMatrix),T.instanceColor!==null)g.remove(T.instanceColor)}return{update:y,dispose:S}}var hy={[hc]:"LINEAR_TONE_MAPPING",[uc]:"REINHARD_TONE_MAPPING",[dc]:"CINEON_TONE_MAPPING",[fc]:"ACES_FILMIC_TONE_MAPPING",[mc]:"AGX_TONE_MAPPING",[gc]:"NEUTRAL_TONE_MAPPING",[pc]:"CUSTOM_TONE_MAPPING"};function uy(p,m,g,_,x,v){let y=new zn(m,g,{type:p,depthBuffer:x,stencilBuffer:v,samples:_?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),S=null,b=null,M=null,T=new qe;T.setAttribute("position",new sn([-1,3,0,-1,-1,0,3,-1,0],3)),T.setAttribute("uv",new sn([0,2,0,0,2,0],2));let w=new fh({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),E=new rn(T,w),A=new Sa(-1,1,1,-1,0,1),C=null,D=null,R=!1,P,L=null,U=[],N=!1;this.setSize=function(F,z){if(y.setSize(F,z),S!==null)S.setSize(F,z);if(b!==null)b.setSize(F,z);for(let I=0;I<U.length;I++){let O=U[I];if(O.setSize)O.setSize(F,z)}},this.setEffects=function(F){U=F,N=U.length>0&&U[0].isRenderPass===!0;let{width:z,height:I}=y;if(U.length>0&&S===null)S=new zn(z,I,{type:ii,depthBuffer:!1,stencilBuffer:!1}),b=new zn(z,I,{type:ii,depthBuffer:!1,stencilBuffer:!1});let O=x===!0&&U.some((V)=>V.needsDepthTexture===!0);if(O!==(y.depthTexture!==null)){if(O===!0&&M===null){if(M=new Hi(z,I),v===!0)M.format=Fi,M.type=rs}y.dispose(),y.depthTexture=O?M:null,y.resolveDepthBuffer=O,y.storeMultisampledDepthBuffer=O}for(let V=0;V<U.length;V++){let q=U[V];if(q.setSize)q.setSize(z,I);if(O&&q.needsDepthTexture===!0&&q.setDepthTexture)q.setDepthTexture(M)}},this.begin=function(F,z){if(R)return!1;if(F.toneMapping===ni&&U.length===0)return!1;if(L=z,z!==null){let{width:I,height:O}=z;if(y.width!==I||y.height!==O)this.setSize(I,O)}if(N===!1)F.setRenderTarget(y);return P=F.toneMapping,F.toneMapping=ni,!0},this.hasRenderPass=function(){return N},this.end=function(F,z){F.toneMapping=P,R=!0;let I=y,O=S;for(let V=0;V<U.length;V++){let q=U[V];if(q.enabled===!1)continue;if(q.render(F,O,I,z),q.needsSwap!==!1)I=O,O=O===S?b:S}if(C!==F.outputColorSpace||D!==F.toneMapping){if(C=F.outputColorSpace,D=F.toneMapping,w.defines={},he.getTransfer(C)===Ce)w.defines.SRGB_TRANSFER="";let V=hy[D];if(V)w.defines[V]="";w.needsUpdate=!0}w.uniforms.tDiffuse.value=I.texture,F.setRenderTarget(L),F.render(E,A),L=null,R=!1},this.isCompositing=function(){return R},this.dispose=function(){if(y.dispose(),S!==null)S.dispose();if(b!==null)b.dispose();T.dispose(),w.dispose()}}var Hp=new Ve,Gp=new Hi(1,1),Vp=new pa(1),Wp=new oa,Xp=new hh,qp=new da,yp=[],Sp=[],bp=new Float32Array(16),Mp=new Float32Array(9),Ep=new Float32Array(4);function $s(p,m,g){let _=p[0];if(_<=0||_>0)return p;let x=m*g,v=yp[x];if(v===void 0)v=new Float32Array(x),yp[x]=v;if(m!==0){_.toArray(v,0);for(let y=1,S=0;y!==m;++y)S+=g,p[y].toArray(v,S)}return v}function Ye(p,m){if(p.length!==m.length)return!1;for(let g=0,_=p.length;g<_;g++)if(p[g]!==m[g])return!1;return!0}function Ze(p,m){for(let g=0,_=m.length;g<_;g++)p[g]=m[g]}function Pa(p,m){let g=Sp[m];if(g===void 0)g=new Int32Array(m),Sp[m]=g;for(let _=0;_!==m;++_)g[_]=p.allocateTextureUnit();return g}function dy(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1f(this.addr,m),g[0]=m}function fy(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2f(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ye(g,m))return;p.uniform2fv(this.addr,m),Ze(g,m)}}function py(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3f(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else if(m.r!==void 0){if(g[0]!==m.r||g[1]!==m.g||g[2]!==m.b)p.uniform3f(this.addr,m.r,m.g,m.b),g[0]=m.r,g[1]=m.g,g[2]=m.b}else{if(Ye(g,m))return;p.uniform3fv(this.addr,m),Ze(g,m)}}function my(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4f(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ye(g,m))return;p.uniform4fv(this.addr,m),Ze(g,m)}}function gy(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ye(g,m))return;p.uniformMatrix2fv(this.addr,!1,m),Ze(g,m)}else{if(Ye(g,_))return;Ep.set(_),p.uniformMatrix2fv(this.addr,!1,Ep),Ze(g,_)}}function _y(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ye(g,m))return;p.uniformMatrix3fv(this.addr,!1,m),Ze(g,m)}else{if(Ye(g,_))return;Mp.set(_),p.uniformMatrix3fv(this.addr,!1,Mp),Ze(g,_)}}function xy(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ye(g,m))return;p.uniformMatrix4fv(this.addr,!1,m),Ze(g,m)}else{if(Ye(g,_))return;bp.set(_),p.uniformMatrix4fv(this.addr,!1,bp),Ze(g,_)}}function vy(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1i(this.addr,m),g[0]=m}function yy(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2i(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ye(g,m))return;p.uniform2iv(this.addr,m),Ze(g,m)}}function Sy(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3i(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ye(g,m))return;p.uniform3iv(this.addr,m),Ze(g,m)}}function by(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4i(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ye(g,m))return;p.uniform4iv(this.addr,m),Ze(g,m)}}function My(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1ui(this.addr,m),g[0]=m}function Ey(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2ui(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ye(g,m))return;p.uniform2uiv(this.addr,m),Ze(g,m)}}function Ty(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3ui(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ye(g,m))return;p.uniform3uiv(this.addr,m),Ze(g,m)}}function wy(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4ui(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ye(g,m))return;p.uniform4uiv(this.addr,m),Ze(g,m)}}function Ia(p){if(p.version===0)p.compareFunction=eh,p.needsUpdate=!0;return p}function Ay(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let v;if(this.type===p.SAMPLER_2D_SHADOW)v=Ia(Gp);else v=Hp;g.setTexture2D(m||v,x)}function Ry(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture3D(m||Xp,x)}function Cy(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let v;if(this.type===p.SAMPLER_CUBE_SHADOW)v=Ia(Vp);else v=qp;g.setTextureCube(m||v,x)}function Py(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture2DArray(m||Wp,x)}function Iy(p){switch(p){case 5126:return dy;case 35664:return fy;case 35665:return py;case 35666:return my;case 35674:return gy;case 35675:return _y;case 35676:return xy;case 5124:case 35670:return vy;case 35667:case 35671:return yy;case 35668:case 35672:return Sy;case 35669:case 35673:return by;case 5125:return My;case 36294:return Ey;case 36295:return Ty;case 36296:return wy;case 35678:case 36198:case 36298:case 36306:case 35682:return Ay;case 35679:case 36299:case 36307:return Ry;case 35680:case 36300:case 36308:case 36293:return Cy;case 36289:case 36303:case 36311:case 36292:return Py}}function Ly(p,m){p.uniform1fv(this.addr,m)}function Ny(p,m){let g=$s(m,this.size,2);p.uniform2fv(this.addr,g)}function Dy(p,m){let g=$s(m,this.size,3);p.uniform3fv(this.addr,g)}function Uy(p,m){let g=$s(m,this.size,4);p.uniform4fv(this.addr,g)}function Oy(p,m){let g=$s(m,this.size,4);p.uniformMatrix2fv(this.addr,!1,g)}function Fy(p,m){let g=$s(m,this.size,9);p.uniformMatrix3fv(this.addr,!1,g)}function By(p,m){let g=$s(m,this.size,16);p.uniformMatrix4fv(this.addr,!1,g)}function ky(p,m){p.uniform1iv(this.addr,m)}function zy(p,m){p.uniform2iv(this.addr,m)}function Hy(p,m){p.uniform3iv(this.addr,m)}function Gy(p,m){p.uniform4iv(this.addr,m)}function Vy(p,m){p.uniform1uiv(this.addr,m)}function Wy(p,m){p.uniform2uiv(this.addr,m)}function Xy(p,m){p.uniform3uiv(this.addr,m)}function qy(p,m){p.uniform4uiv(this.addr,m)}function Yy(p,m,g){let _=this.cache,x=m.length,v=Pa(g,x);if(!Ye(_,v))p.uniform1iv(this.addr,v),Ze(_,v);let y;if(this.type===p.SAMPLER_2D_SHADOW)y=Ia(Gp);else y=Hp;for(let S=0;S!==x;++S)g.setTexture2D(m[S]||y,v[S])}function Zy(p,m,g){let _=this.cache,x=m.length,v=Pa(g,x);if(!Ye(_,v))p.uniform1iv(this.addr,v),Ze(_,v);for(let y=0;y!==x;++y)g.setTexture3D(m[y]||Xp,v[y])}function $y(p,m,g){let _=this.cache,x=m.length,v=Pa(g,x);if(!Ye(_,v))p.uniform1iv(this.addr,v),Ze(_,v);let y;if(this.type===p.SAMPLER_CUBE_SHADOW)y=Ia(Vp);else y=qp;for(let S=0;S!==x;++S)g.setTextureCube(m[S]||y,v[S])}function Jy(p,m,g){let _=this.cache,x=m.length,v=Pa(g,x);if(!Ye(_,v))p.uniform1iv(this.addr,v),Ze(_,v);for(let y=0;y!==x;++y)g.setTexture2DArray(m[y]||Wp,v[y])}function Ky(p){switch(p){case 5126:return Ly;case 35664:return Ny;case 35665:return Dy;case 35666:return Uy;case 35674:return Oy;case 35675:return Fy;case 35676:return By;case 5124:case 35670:return ky;case 35667:case 35671:return zy;case 35668:case 35672:return Hy;case 35669:case 35673:return Gy;case 5125:return Vy;case 36294:return Wy;case 36295:return Xy;case 36296:return qy;case 35678:case 36198:case 36298:case 36306:case 35682:return Yy;case 35679:case 36299:case 36307:return Zy;case 35680:case 36300:case 36308:case 36293:return $y;case 36289:case 36303:case 36311:case 36292:return Jy}}class Yp{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.setValue=Iy(m.type)}}class Zp{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.size=m.size,this.setValue=Ky(m.type)}}class $p{constructor(p){this.id=p,this.seq=[],this.map={}}setValue(p,m,g){let _=this.seq;for(let x=0,v=_.length;x!==v;++x){let y=_[x];y.setValue(p,m[y.id],g)}}}var Ih=/(\w+)(\])?(\[|\.)?/g;function Tp(p,m){p.seq.push(m),p.map[m.id]=m}function jy(p,m,g){let _=p.name,x=_.length;Ih.lastIndex=0;while(!0){let v=Ih.exec(_),y=Ih.lastIndex,S=v[1],b=v[2]==="]",M=v[3];if(b)S=S|0;if(M===void 0||M==="["&&y+2===x){Tp(g,M===void 0?new Yp(S,p,m):new Zp(S,p,m));break}else{let w=g.map[S];if(w===void 0)w=new $p(S),Tp(g,w);g=w}}}class Jr{constructor(p,m){this.seq=[],this.map={};let g=p.getProgramParameter(m,p.ACTIVE_UNIFORMS);for(let v=0;v<g;++v){let y=p.getActiveUniform(m,v),S=p.getUniformLocation(m,y.name);jy(y,S,this)}let _=[],x=[];for(let v of this.seq)if(v.type===p.SAMPLER_2D_SHADOW||v.type===p.SAMPLER_CUBE_SHADOW||v.type===p.SAMPLER_2D_ARRAY_SHADOW)_.push(v);else x.push(v);if(_.length>0)this.seq=_.concat(x)}setValue(p,m,g,_){let x=this.map[m];if(x!==void 0)x.setValue(p,g,_)}setOptional(p,m,g){let _=m[g];if(_!==void 0)this.setValue(p,g,_)}static upload(p,m,g,_){for(let x=0,v=m.length;x!==v;++x){let y=m[x],S=g[y.id];if(S.needsUpdate!==!1)y.setValue(p,S.value,_)}}static seqWithValue(p,m){let g=[];for(let _=0,x=p.length;_!==x;++_){let v=p[_];if(v.id in m)g.push(v)}return g}}function wp(p,m,g){let _=p.createShader(m);return p.shaderSource(_,g),p.compileShader(_),_}var Qy=37297,tS=0;function eS(p,m){let g=p.split(`
`),_=[],x=Math.max(m-6,0),v=Math.min(m+6,g.length);for(let y=x;y<v;y++){let S=y+1;_.push(`${S===m?">":" "} ${S}: ${g[y]}`)}return _.join(`
`)}var Ap=new Qt;function nS(p){he._getMatrix(Ap,he.workingColorSpace,p);let m=`mat3( ${Ap.elements.map((g)=>g.toFixed(4))} )`;switch(he.getTransfer(p)){case jc:return[m,"LinearTransferOETF"];case Ce:return[m,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",p),[m,"LinearTransferOETF"]}}function Rp(p,m,g){let _=p.getShaderParameter(m,p.COMPILE_STATUS),v=(p.getShaderInfoLog(m)||"").trim();if(_&&v==="")return"";let y=/ERROR: 0:(\d+)/.exec(v);if(y){let S=parseInt(y[1]);return g.toUpperCase()+`

`+v+`

`+eS(p.getShaderSource(m),S)}else return v}function iS(p,m){let g=nS(m);return[`vec4 ${p}( vec4 value ) {`,`	return ${g[1]}( vec4( ${g[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var sS={[hc]:"Linear",[uc]:"Reinhard",[dc]:"Cineon",[fc]:"ACESFilmic",[mc]:"AgX",[gc]:"Neutral",[pc]:"Custom"};function rS(p,m){let g=sS[m];if(g===void 0)return Xt("WebGLProgram: Unsupported toneMapping:",m),"vec3 "+p+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+p+"( vec3 color ) { return "+g+"ToneMapping( color ); }"}var Aa=new Y;function oS(){he.getLuminanceCoefficients(Aa);let p=Aa.x.toFixed(4),m=Aa.y.toFixed(4),g=Aa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${p}, ${m}, ${g} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function aS(p){return[p.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",p.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($r).join(`
`)}function lS(p){let m=[];for(let g in p){let _=p[g];if(_===!1)continue;m.push("#define "+g+" "+_)}return m.join(`
`)}function cS(p,m){let g={},_=p.getProgramParameter(m,p.ACTIVE_ATTRIBUTES);for(let x=0;x<_;x++){let v=p.getActiveAttrib(m,x),y=v.name,S=1;if(v.type===p.FLOAT_MAT2)S=2;if(v.type===p.FLOAT_MAT3)S=3;if(v.type===p.FLOAT_MAT4)S=4;g[y]={type:v.type,location:p.getAttribLocation(m,y),locationSize:S}}return g}function $r(p){return p!==""}function Cp(p,m){let g=m.numSpotLightShadows+m.numSpotLightMaps-m.numSpotLightShadowsWithMaps;return p.replace(/NUM_SUN_LIGHTS/g,m.numSunLights).replace(/NUM_DIR_LIGHTS/g,m.numDirLights).replace(/NUM_SPOT_LIGHTS/g,m.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,m.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,g).replace(/NUM_RECT_AREA_LIGHTS/g,m.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,m.numPointLights).replace(/NUM_HEMI_LIGHTS/g,m.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,m.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,m.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,m.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,m.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,m.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,m.numLightProbeGrids)}function Pp(p,m){return p.replace(/NUM_CLIPPING_PLANES/g,m.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,m.numClippingPlanes-m.numClipIntersection)}var hS=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nh(p){return p.replace(hS,uS)}function uS(p,m){let g=ce[m];if(g===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+m+">");return Nh(g)}var dS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ip(p){return p.replace(dS,fS)}function fS(p,m,g,_){let x="";for(let v=parseInt(m);v<parseInt(g);v++)x+=_.replace(/\[\s*i\s*\]/g,"[ "+v+" ]").replace(/UNROLLED_LOOP_INDEX/g,v);return x}function Lp(p){let m=`precision ${p.precision} float;
	precision ${p.precision} int;
	precision ${p.precision} sampler2D;
	precision ${p.precision} samplerCube;
	precision ${p.precision} sampler3D;
	precision ${p.precision} sampler2DArray;
	precision ${p.precision} sampler2DShadow;
	precision ${p.precision} samplerCubeShadow;
	precision ${p.precision} sampler2DArrayShadow;
	precision ${p.precision} isampler2D;
	precision ${p.precision} isampler3D;
	precision ${p.precision} isamplerCube;
	precision ${p.precision} isampler2DArray;
	precision ${p.precision} usampler2D;
	precision ${p.precision} usampler3D;
	precision ${p.precision} usamplerCube;
	precision ${p.precision} usampler2DArray;
	`;if(p.precision==="highp")m+=`
#define HIGH_PRECISION`;else if(p.precision==="mediump")m+=`
#define MEDIUM_PRECISION`;else if(p.precision==="lowp")m+=`
#define LOW_PRECISION`;return m}var pS={[Pr]:"SHADOWMAP_TYPE_PCF",[Hs]:"SHADOWMAP_TYPE_VSM"};function mS(p){return pS[p.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var gS={[Vs]:"ENVMAP_MODE_REFRACTION"};function _S(p){if(p.envMap===!1)return"ENVMAP_MODE_REFLECTION";return gS[p.envMapMode]||"ENVMAP_MODE_REFLECTION"}var xS={[kf]:"ENVMAP_BLENDING_MULTIPLY",[zf]:"ENVMAP_BLENDING_MIX",[Hf]:"ENVMAP_BLENDING_ADD"};function vS(p){if(p.envMap===!1)return"ENVMAP_BLENDING_NONE";return xS[p.combine]||"ENVMAP_BLENDING_NONE"}function yS(p,m,g,_){let x=p.getContext(),{defines:v,vertexShader:y,fragmentShader:S}=g,b=mS(g),M=g.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",T=_S(g),w=vS(g),E=aS(g),A=lS(v),C=x.createProgram(),D,R,P=g.glslVersion?"#version "+g.glslVersion+`
`:"";if(g.isRawShaderMaterial){if(D=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter($r).join(`
`),D.length>0)D+=`
`;if(R=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter($r).join(`
`),R.length>0)R+=`
`}else D=[Lp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",g.batching?"#define USE_BATCHING":"",g.batchingColor?"#define USE_BATCHING_COLOR":"",g.instancing?"#define USE_INSTANCING":"",g.instancingColor?"#define USE_INSTANCING_COLOR":"",g.instancingMorph?"#define USE_INSTANCING_MORPH":"",g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.map?"#define USE_MAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+T:"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.displacementMap?"#define USE_DISPLACEMENTMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.mapUv?"#define MAP_UV "+g.mapUv:"",g.alphaMapUv?"#define ALPHAMAP_UV "+g.alphaMapUv:"",g.lightMapUv?"#define LIGHTMAP_UV "+g.lightMapUv:"",g.aoMapUv?"#define AOMAP_UV "+g.aoMapUv:"",g.emissiveMapUv?"#define EMISSIVEMAP_UV "+g.emissiveMapUv:"",g.bumpMapUv?"#define BUMPMAP_UV "+g.bumpMapUv:"",g.normalMapUv?"#define NORMALMAP_UV "+g.normalMapUv:"",g.displacementMapUv?"#define DISPLACEMENTMAP_UV "+g.displacementMapUv:"",g.metalnessMapUv?"#define METALNESSMAP_UV "+g.metalnessMapUv:"",g.roughnessMapUv?"#define ROUGHNESSMAP_UV "+g.roughnessMapUv:"",g.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+g.anisotropyMapUv:"",g.clearcoatMapUv?"#define CLEARCOATMAP_UV "+g.clearcoatMapUv:"",g.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+g.clearcoatNormalMapUv:"",g.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+g.clearcoatRoughnessMapUv:"",g.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+g.diffuseRoughnessMapUv:"",g.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+g.iridescenceMapUv:"",g.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+g.iridescenceThicknessMapUv:"",g.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+g.sheenColorMapUv:"",g.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+g.sheenRoughnessMapUv:"",g.specularMapUv?"#define SPECULARMAP_UV "+g.specularMapUv:"",g.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+g.specularColorMapUv:"",g.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+g.specularIntensityMapUv:"",g.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+g.transmissionMapUv:"",g.thicknessMapUv?"#define THICKNESSMAP_UV "+g.thicknessMapUv:"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexNormals?"#define HAS_NORMAL":"",g.vertexColors?"#define USE_COLOR":"",g.vertexAlphas?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.flatShading?"#define FLAT_SHADED":"",g.skinning?"#define USE_SKINNING":"",g.morphTargets?"#define USE_MORPHTARGETS":"",g.morphNormals&&g.flatShading===!1?"#define USE_MORPHNORMALS":"",g.morphColors?"#define USE_MORPHCOLORS":"",g.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+g.morphTextureStride:"",g.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+g.morphTargetsCount:"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+b:"",g.sizeAttenuation?"#define USE_SIZEATTENUATION":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter($r).join(`
`),R=[Lp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",g.map?"#define USE_MAP":"",g.matcap?"#define USE_MATCAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+M:"",g.envMap?"#define "+T:"",g.envMap?"#define "+w:"",g.envMapPMREM?"#define ENVMAP_MAX_LOD "+g.envMapMaxLod+".0":"",g.envMapPMREM?"#define ENVMAP_SIZE "+g.envMapSize+".0":"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoat?"#define USE_CLEARCOAT":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.dispersion?"#define USE_DISPERSION":"",g.retroreflection?"#define USE_RETROREFLECTION":"",g.iridescence?"#define USE_IRIDESCENCE":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaTest?"#define USE_ALPHATEST":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.sheen?"#define USE_SHEEN":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexColors||g.instancingColor?"#define USE_COLOR":"",g.vertexAlphas||g.batchingColor?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.gradientMap?"#define USE_GRADIENTMAP":"",g.flatShading?"#define FLAT_SHADED":"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+b:"",g.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",g.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",g.toneMapping!==ni?"#define TONE_MAPPING":"",g.toneMapping!==ni?ce.tonemapping_pars_fragment:"",g.toneMapping!==ni?rS("toneMapping",g.toneMapping):"",g.dithering?"#define DITHERING":"",g.opaque?"#define OPAQUE":"",ce.colorspace_pars_fragment,iS("linearToOutputTexel",g.outputColorSpace),oS(),g.useDepthPacking?"#define DEPTH_PACKING "+g.depthPacking:"",`
`].filter($r).join(`
`);if(y=Nh(y),y=Cp(y,g),y=Pp(y,g),S=Nh(S),S=Cp(S,g),S=Pp(S,g),y=Ip(y),S=Ip(S),g.isRawShaderMaterial!==!0)P=`#version 300 es
`,D=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+D,R=["#define varying in",g.glslVersion===nh?"":"layout(location = 0) out highp vec4 pc_fragColor;",g.glslVersion===nh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+R;let L=P+D+y,U=P+R+S,N=wp(x,x.VERTEX_SHADER,L),F=wp(x,x.FRAGMENT_SHADER,U);if(x.attachShader(C,N),x.attachShader(C,F),g.index0AttributeName!==void 0)x.bindAttribLocation(C,0,g.index0AttributeName);else if(g.hasPositionAttribute===!0)x.bindAttribLocation(C,0,"position");x.linkProgram(C);function z(q){if(p.debug.checkShaderErrors){let H=x.getProgramInfoLog(C)||"",W=x.getShaderInfoLog(N)||"",J=x.getShaderInfoLog(F)||"",G=H.trim(),Q=W.trim(),it=J.trim(),tt=!0,pt=!0;if(x.getProgramParameter(C,x.LINK_STATUS)===!1)if(tt=!1,typeof p.debug.onShaderError==="function")p.debug.onShaderError(x,C,N,F);else{let ot=Rp(x,N,"vertex"),dt=Rp(x,F,"fragment");$t("WebGLProgram: Shader Error "+x.getError()+" - VALIDATE_STATUS "+x.getProgramParameter(C,x.VALIDATE_STATUS)+`

Material Name: `+q.name+`
Material Type: `+q.type+`

Program Info Log: `+G+`
`+ot+`
`+dt)}else if(G!=="")Xt("WebGLProgram: Program Info Log:",G);else if(Q===""||it==="")pt=!1;if(pt)q.diagnostics={runnable:tt,programLog:G,vertexShader:{log:Q,prefix:D},fragmentShader:{log:it,prefix:R}}}x.deleteShader(N),x.deleteShader(F),I=new Jr(x,C),O=cS(x,C)}let I;this.getUniforms=function(){if(I===void 0)z(this);return I};let O;this.getAttributes=function(){if(O===void 0)z(this);return O};let V=g.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(V===!1)V=x.getProgramParameter(C,Qy);return V},this.destroy=function(){_.releaseStatesOfProgram(this),x.deleteProgram(C),this.program=void 0},this.type=g.shaderType,this.name=g.shaderName,this.id=tS++,this.cacheKey=m,this.usedTimes=1,this.program=C,this.vertexShader=N,this.fragmentShader=F,this}var SS=0;class Jp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(p,m,g){let _=this._getShaderCacheForMaterial(p);if(_.has(m)===!1)_.add(m),m.usedTimes++;if(_.has(g)===!1)_.add(g),g.usedTimes++;return this}remove(p){let m=this.materialCache.get(p);for(let g of m)if(g.usedTimes--,g.usedTimes===0)this.shaderCache.delete(g.code);return this.materialCache.delete(p),this}getVertexShaderStage(p){return this._getShaderStage(p.vertexShader)}getFragmentShaderStage(p){return this._getShaderStage(p.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(p){let m=this.materialCache,g=m.get(p);if(g===void 0)g=new Set,m.set(p,g);return g}_getShaderStage(p){let m=this.shaderCache,g=m.get(p);if(g===void 0)g=new Kp(p),m.set(p,g);return g}}class Kp{constructor(p){this.id=SS++,this.code=p,this.usedTimes=0}}function bS(p){return p===os||p===na||p===ia}function MS(p,m,g,_,x,v){let y=new kr,S=new Jp,b=new Set,M=[],T=new Map,w=_.logarithmicDepthBuffer,E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(I){if(b.add(I),I===0)return"uv";return`uv${I}`}function C(I,O,V,q,H,W){let J=q.fog,G=H.geometry,Q=I.isMeshStandardMaterial||I.isMeshLambertMaterial||I.isMeshPhongMaterial?q.environment:null,it=I.isMeshStandardMaterial||I.isMeshLambertMaterial&&!I.envMap||I.isMeshPhongMaterial&&!I.envMap,tt=m.get(I.envMap||Q,it),pt=E[I.type],ot=_.precision;if(I.precision!==null){if(ot=_.getMaxPrecision(I.precision),ot!==I.precision)Xt("WebGLProgram.getParameters:",I.precision,"not supported, using",ot,"instead.")}let dt=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,_t=dt!==void 0?dt.length:0,Dt=0;if(G.morphAttributes.position!==void 0)Dt=1;if(G.morphAttributes.normal!==void 0)Dt=2;if(G.morphAttributes.color!==void 0)Dt=3;let at,mt,At,Ht;if(pt){let Lt=ri[pt];at=Lt.vertexShader,mt=Lt.fragmentShader}else{at=I.vertexShader,mt=I.fragmentShader;let Lt=S.getVertexShaderStage(I),Te=S.getFragmentShaderStage(I);S.update(I,Lt,Te),At=Lt.id,Ht=Te.id}let Ft=p.getRenderTarget(),Rt=p.state.buffers.depth.getReversed(),ae=H.isInstancedMesh===!0,Kt=H.isBatchedMesh===!0,Ut=!!I.map,jt=!!I.matcap,qt=!!tt,ge=qt&&tt.isPMREMTexture===!0,xt=!!I.aoMap,Yt=!!I.lightMap,ie=!!I.bumpMap&&I.wireframe===!1,se=!!I.normalMap,pe=!!I.displacementMap,Be=!!I.emissiveMap,ke=!!I.metalnessMap,_n=!!I.roughnessMap,j=I.anisotropy>0,xn=I.clearcoat>0,be=I.diffuseRoughness>0,$e=I.dispersion>0,Ct=I.retroreflectivity>0,Le=I.iridescence>0,Zt=I.sheen>0,te=I.transmission>0,an=j&&!!I.anisotropyMap,X=xn&&!!I.clearcoatMap,B=xn&&!!I.clearcoatNormalMap,et=xn&&!!I.clearcoatRoughnessMap,gt=be&&!!I.diffuseRoughnessMap,ft=Le&&!!I.iridescenceMap,St=Le&&!!I.iridescenceThicknessMap,Et=Zt&&!!I.sheenColorMap,lt=Zt&&!!I.sheenRoughnessMap,ut=!!I.specularMap,bt=!!I.specularColorMap,Z=!!I.specularIntensityMap,ht=te&&!!I.transmissionMap,ct=te&&!!I.thicknessMap,vt=!!I.gradientMap,yt=!!I.alphaMap,wt=I.alphaTest>0,Vt=!!I.alphaHash,Gt=!!I.extensions,It=ni;if(I.toneMapped){if(Ft===null||Ft.isXRRenderTarget===!0)It=p.toneMapping}let Wt=ge?tt.isCompressedCubeTexture?tt.image[0].mipmaps:tt.mipmaps:null,le={shaderID:pt,shaderType:I.type,shaderName:I.name,vertexShader:at,fragmentShader:mt,defines:I.defines,customVertexShaderID:At,customFragmentShaderID:Ht,isRawShaderMaterial:I.isRawShaderMaterial===!0,glslVersion:I.glslVersion,precision:ot,batching:Kt,batchingColor:Kt&&H._colorsTexture!==null,instancing:ae,instancingColor:ae&&H.instanceColor!==null,instancingMorph:ae&&H.morphTexture!==null,outputColorSpace:Ft===null?p.outputColorSpace:Ft.isXRRenderTarget===!0?Ft.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!I.alphaToCoverage,map:Ut,matcap:jt,envMap:qt,envMapMode:qt&&tt.mapping,envMapPMREM:ge,envMapMaxLod:ge?Wt.length-1:null,envMapSize:ge?Wt[0].width:null,aoMap:xt,lightMap:Yt,bumpMap:ie,normalMap:se,displacementMap:pe,emissiveMap:Be,normalMapObjectSpace:se&&I.normalMapType===Kf,normalMapTangentSpace:se&&I.normalMapType===Jc,packedNormalMap:se&&I.normalMapType===Jc&&bS(I.normalMap.format),metalnessMap:ke,roughnessMap:_n,anisotropy:j,anisotropyMap:an,clearcoat:xn,clearcoatMap:X,clearcoatNormalMap:B,clearcoatRoughnessMap:et,diffuseRoughness:be,diffuseRoughnessMap:gt,dispersion:$e,retroreflection:Ct,iridescence:Le,iridescenceMap:ft,iridescenceThicknessMap:St,sheen:Zt,sheenColorMap:Et,sheenRoughnessMap:lt,specularMap:ut,specularColorMap:bt,specularIntensityMap:Z,transmission:te,transmissionMap:ht,thicknessMap:ct,gradientMap:vt,opaque:I.transparent===!1&&I.blending===Ir&&I.alphaToCoverage===!1,alphaMap:yt,alphaTest:wt,alphaHash:Vt,combine:I.combine,mapUv:Ut&&A(I.map.channel),aoMapUv:xt&&A(I.aoMap.channel),lightMapUv:Yt&&A(I.lightMap.channel),bumpMapUv:ie&&A(I.bumpMap.channel),normalMapUv:se&&A(I.normalMap.channel),displacementMapUv:pe&&A(I.displacementMap.channel),emissiveMapUv:Be&&A(I.emissiveMap.channel),metalnessMapUv:ke&&A(I.metalnessMap.channel),roughnessMapUv:_n&&A(I.roughnessMap.channel),anisotropyMapUv:an&&A(I.anisotropyMap.channel),clearcoatMapUv:X&&A(I.clearcoatMap.channel),clearcoatNormalMapUv:B&&A(I.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&A(I.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:gt&&A(I.diffuseRoughnessMap.channel),iridescenceMapUv:ft&&A(I.iridescenceMap.channel),iridescenceThicknessMapUv:St&&A(I.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&A(I.sheenColorMap.channel),sheenRoughnessMapUv:lt&&A(I.sheenRoughnessMap.channel),specularMapUv:ut&&A(I.specularMap.channel),specularColorMapUv:bt&&A(I.specularColorMap.channel),specularIntensityMapUv:Z&&A(I.specularIntensityMap.channel),transmissionMapUv:ht&&A(I.transmissionMap.channel),thicknessMapUv:ct&&A(I.thicknessMap.channel),alphaMapUv:yt&&A(I.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(se||j),vertexNormals:!!G.attributes.normal,vertexColors:I.vertexColors,vertexAlphas:I.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!G.attributes.uv&&(Ut||yt),fog:!!J,useFog:I.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:I.wireframe===!1&&(I.flatShading===!0||G.attributes.normal===void 0&&se===!1&&(I.isMeshLambertMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isMeshPhysicalMaterial)),sizeAttenuation:I.sizeAttenuation===!0,logarithmicDepthBuffer:w,reversedDepthBuffer:Rt,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:G.attributes.position!==void 0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:_t,morphTextureStride:Dt,numSunLights:O.sun.length,numDirLights:O.directional.length,numPointLights:O.point.length,numSpotLights:O.spot.length,numSpotLightMaps:O.spotLightMap.length,numRectAreaLights:O.rectArea.length,numHemiLights:O.hemi.length,numSunLightShadows:O.sunShadowMap.length,numDirLightShadows:O.directionalShadowMap.length,numPointLightShadows:O.pointShadowMap.length,numSpotLightShadows:O.spotShadowMap.length,numSpotLightShadowsWithMaps:O.numSpotLightShadowsWithMaps,numLightProbes:O.numLightProbes,numLightProbeGrids:W.filter((Lt)=>Lt.texture!==null).length,numClippingPlanes:v.numPlanes,numClipIntersection:v.numIntersection,dithering:I.dithering,shadowMapEnabled:p.shadowMap.enabled&&V.length>0,shadowMapType:p.shadowMap.type,toneMapping:It,decodeVideoTexture:Ut&&I.map.isVideoTexture===!0&&he.getTransfer(I.map.colorSpace)===Ce,decodeVideoTextureEmissive:Be&&I.emissiveMap.isVideoTexture===!0&&he.getTransfer(I.emissiveMap.colorSpace)===Ce,premultipliedAlpha:I.premultipliedAlpha,doubleSided:I.side===Bn,flipSided:I.side===fn,useDepthPacking:I.depthPacking>=0,depthPacking:I.depthPacking||0,index0AttributeName:I.index0AttributeName,extensionClipCullDistance:Gt&&I.extensions.clipCullDistance===!0&&g.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&I.extensions.multiDraw===!0||Kt)&&g.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:g.has("KHR_parallel_shader_compile"),customProgramCacheKey:I.customProgramCacheKey()};return le.vertexUv1s=b.has(1),le.vertexUv2s=b.has(2),le.vertexUv3s=b.has(3),b.clear(),le}function D(I){let O=[];if(I.shaderID)O.push(I.shaderID);else O.push(I.customVertexShaderID),O.push(I.customFragmentShaderID);if(I.defines!==void 0)for(let V in I.defines)O.push(V),O.push(I.defines[V]);if(I.isRawShaderMaterial===!1)R(O,I),P(O,I),O.push(p.outputColorSpace);return O.push(I.customProgramCacheKey),O.join()}function R(I,O){I.push(O.precision),I.push(O.outputColorSpace),I.push(O.envMapMode),I.push(O.envMapPMREM),I.push(O.envMapMaxLod),I.push(O.envMapSize),I.push(O.mapUv),I.push(O.alphaMapUv),I.push(O.lightMapUv),I.push(O.aoMapUv),I.push(O.bumpMapUv),I.push(O.normalMapUv),I.push(O.displacementMapUv),I.push(O.emissiveMapUv),I.push(O.metalnessMapUv),I.push(O.roughnessMapUv),I.push(O.anisotropyMapUv),I.push(O.clearcoatMapUv),I.push(O.clearcoatNormalMapUv),I.push(O.clearcoatRoughnessMapUv),I.push(O.diffuseRoughnessMapUv),I.push(O.iridescenceMapUv),I.push(O.iridescenceThicknessMapUv),I.push(O.sheenColorMapUv),I.push(O.sheenRoughnessMapUv),I.push(O.specularMapUv),I.push(O.specularColorMapUv),I.push(O.specularIntensityMapUv),I.push(O.transmissionMapUv),I.push(O.thicknessMapUv),I.push(O.combine),I.push(O.fogExp2),I.push(O.sizeAttenuation),I.push(O.morphTargetsCount),I.push(O.numSunLights),I.push(O.numDirLights),I.push(O.numPointLights),I.push(O.numSpotLights),I.push(O.numSpotLightMaps),I.push(O.numHemiLights),I.push(O.numRectAreaLights),I.push(O.numSunLightShadows),I.push(O.numDirLightShadows),I.push(O.numPointLightShadows),I.push(O.numSpotLightShadows),I.push(O.numSpotLightShadowsWithMaps),I.push(O.numLightProbes),I.push(O.numLightProbeGrids),I.push(O.shadowMapType),I.push(O.toneMapping),I.push(O.numClippingPlanes),I.push(O.numClipIntersection),I.push(O.depthPacking)}function P(I,O){if(y.disableAll(),O.instancing)y.enable(0);if(O.instancingColor)y.enable(1);if(O.instancingMorph)y.enable(2);if(O.matcap)y.enable(3);if(O.envMap)y.enable(4);if(O.normalMapObjectSpace)y.enable(5);if(O.normalMapTangentSpace)y.enable(6);if(O.clearcoat)y.enable(7);if(O.iridescence)y.enable(8);if(O.alphaTest)y.enable(9);if(O.vertexColors)y.enable(10);if(O.vertexAlphas)y.enable(11);if(O.vertexUv1s)y.enable(12);if(O.vertexUv2s)y.enable(13);if(O.vertexUv3s)y.enable(14);if(O.vertexTangents)y.enable(15);if(O.anisotropy)y.enable(16);if(O.alphaHash)y.enable(17);if(O.batching)y.enable(18);if(O.dispersion)y.enable(19);if(O.retroreflection)y.enable(24);if(O.diffuseRoughness)y.enable(25);if(O.batchingColor)y.enable(20);if(O.gradientMap)y.enable(21);if(O.packedNormalMap)y.enable(22);if(O.vertexNormals)y.enable(23);if(I.push(y.mask),y.disableAll(),O.fog)y.enable(0);if(O.useFog)y.enable(1);if(O.flatShading)y.enable(2);if(O.logarithmicDepthBuffer)y.enable(3);if(O.reversedDepthBuffer)y.enable(4);if(O.skinning)y.enable(5);if(O.morphTargets)y.enable(6);if(O.morphNormals)y.enable(7);if(O.morphColors)y.enable(8);if(O.premultipliedAlpha)y.enable(9);if(O.shadowMapEnabled)y.enable(10);if(O.doubleSided)y.enable(11);if(O.flipSided)y.enable(12);if(O.useDepthPacking)y.enable(13);if(O.dithering)y.enable(14);if(O.transmission)y.enable(15);if(O.sheen)y.enable(16);if(O.opaque)y.enable(17);if(O.pointsUvs)y.enable(18);if(O.decodeVideoTexture)y.enable(19);if(O.decodeVideoTextureEmissive)y.enable(20);if(O.alphaToCoverage)y.enable(21);if(O.numLightProbeGrids>0)y.enable(22);if(O.hasPositionAttribute)y.enable(23);I.push(y.mask)}function L(I){let O=E[I.type],V;if(O){let q=ri[O];V=cp.clone(q.uniforms)}else V=I.uniforms;return V}function U(I,O){let V=T.get(O);if(V!==void 0)++V.usedTimes;else V=new yS(p,O,I,x),M.push(V),T.set(O,V);return V}function N(I){if(--I.usedTimes===0){let O=M.indexOf(I);M[O]=M[M.length-1],M.pop(),T.delete(I.cacheKey),I.destroy()}}function F(I){S.remove(I)}function z(){S.dispose()}return{getParameters:C,getProgramCacheKey:D,getUniforms:L,acquireProgram:U,releaseProgram:N,releaseShaderCache:F,programs:M,dispose:z}}function ES(){let p=new WeakMap;function m(y){return p.has(y)}function g(y){let S=p.get(y);if(S===void 0)S={},p.set(y,S);return S}function _(y){p.delete(y)}function x(y,S,b){p.get(y)[S]=b}function v(){p=new WeakMap}return{has:m,get:g,remove:_,update:x,dispose:v}}function TS(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.material.id!==m.material.id)return p.material.id-m.material.id;else if(p.materialVariant!==m.materialVariant)return p.materialVariant-m.materialVariant;else if(p.z!==m.z)return p.z-m.z;else return p.id-m.id}function Np(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.z!==m.z)return m.z-p.z;else return p.id-m.id}function Dp(){let p=[],m=0,g=[],_=[],x=[];function v(){m=0,g.length=0,_.length=0,x.length=0}function y(E){let A=0;if(E.isInstancedMesh)A+=2;if(E.isSkinnedMesh)A+=1;return A}function S(E,A,C,D,R,P){let L=p[m];if(L===void 0)L={id:E.id,object:E,geometry:A,material:C,materialVariant:y(E),groupOrder:D,renderOrder:E.renderOrder,z:R,group:P},p[m]=L;else L.id=E.id,L.object=E,L.geometry=A,L.material=C,L.materialVariant=y(E),L.groupOrder=D,L.renderOrder=E.renderOrder,L.z=R,L.group=P;return m++,L}function b(E,A,C,D,R,P,L){if(L.reversedDepth===!0)R=-R;let U=S(E,A,C,D,R,P);if(C.transmission>0)_.push(U);else if(C.transparent===!0)x.push(U);else g.push(U)}function M(E,A,C,D,R,P){let L=S(E,A,C,D,R,P);if(C.transmission>0)_.unshift(L);else if(C.transparent===!0)x.unshift(L);else g.unshift(L)}function T(E,A){if(g.length>1)g.sort(E||TS);if(_.length>1)_.sort(A||Np);if(x.length>1)x.sort(A||Np)}function w(){for(let E=m,A=p.length;E<A;E++){let C=p[E];if(C.id===null)break;C.id=null,C.object=null,C.geometry=null,C.material=null,C.group=null}}return{opaque:g,transmissive:_,transparent:x,init:v,push:b,unshift:M,finish:w,sort:T}}function wS(){let p=new WeakMap;function m(_,x){let v=p.get(_),y;if(v===void 0)y=new Dp,p.set(_,[y]);else if(x>=v.length)y=new Dp,v.push(y);else y=v[x];return y}function g(){p=new WeakMap}return{get:m,dispose:g}}function AS(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={direction:new Y,color:new oe};break;case"SpotLight":g={position:new Y,direction:new Y,color:new oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":g={position:new Y,color:new oe,distance:0,decay:0};break;case"HemisphereLight":g={direction:new Y,skyColor:new oe,groundColor:new oe};break;case"RectAreaLight":g={color:new oe,position:new Y,halfWidth:new Y,halfHeight:new Y};break}return p[m.id]=g,g}}}function RS(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"SpotLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"PointLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt,shadowCameraNear:1,shadowCameraFar:1000};break}return p[m.id]=g,g}}}var CS=0;function PS(p,m){return(m.castShadow?2:0)-(p.castShadow?2:0)+(m.map?1:0)-(p.map?1:0)}function IS(p){let m=new AS,g=RS(),_={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let M=0;M<9;M++)_.probe.push(new Y);let x=new Y,v=new re,y=new re;function S(M){let T=0,w=0,E=0;for(let W=0;W<9;W++)_.probe[W].set(0,0,0);let A=0,C=0,D=0,R=0,P=0,L=0,U=0,N=0,F=0,z=0,I=0,O=0,V=0,q=0;M.sort(PS);for(let W=0,J=M.length;W<J;W++){let G=M[W],{color:Q,intensity:it,distance:tt}=G,pt=null;if(G.shadow&&G.shadow.map)if(G.shadow.map.texture.format===os)pt=G.shadow.map.texture;else pt=G.shadow.map.depthTexture||G.shadow.map.texture;if(G.isAmbientLight)T+=Q.r*it,w+=Q.g*it,E+=Q.b*it;else if(G.isLightProbe){for(let ot=0;ot<9;ot++)_.probe[ot].addScaledVector(G.sh.coefficients[ot],it);q++}else if(G.isSunLight){let ot=m.get(G);if(ot.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let dt=G.shadow,_t=g.get(G);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize.copy(dt.mapSize).multiply(dt.getFrameExtents()),_.sunShadow[C]=_t,_.sunShadowMap[C]=pt;let Dt=dt.getViewportCount();for(let at=0;at<Dt;at++)_.sunShadowMatrix[D+at]=dt.getMatrix(at),_.sunShadowCascade[D+at]=dt._cascadeData[at];D+=Dt,C++}_.sun[A]=ot,A++}else if(G.isDirectionalLight){let ot=m.get(G);if(ot.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let dt=G.shadow,_t=g.get(G);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,_.directionalShadow[R]=_t,_.directionalShadowMap[R]=pt,_.directionalShadowMatrix[R]=G.shadow.matrix,F++}_.directional[R]=ot,R++}else if(G.isSpotLight){let ot=m.get(G);ot.position.setFromMatrixPosition(G.matrixWorld),ot.color.copy(Q).multiplyScalar(it),ot.distance=tt,ot.coneCos=Math.cos(G.angle),ot.penumbraCos=Math.cos(G.angle*(1-G.penumbra)),ot.decay=G.decay,_.spot[L]=ot;let dt=G.shadow;if(G.map){if(_.spotLightMap[O]=G.map,O++,dt.updateMatrices(G),G.castShadow)V++}if(_.spotLightMatrix[L]=dt.matrix,G.castShadow){let _t=g.get(G);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,_.spotShadow[L]=_t,_.spotShadowMap[L]=pt,I++}L++}else if(G.isRectAreaLight){let ot=m.get(G);ot.color.copy(Q).multiplyScalar(it),ot.halfWidth.set(G.width*0.5,0,0),ot.halfHeight.set(0,G.height*0.5,0),_.rectArea[U]=ot,U++}else if(G.isPointLight){let ot=m.get(G);if(ot.color.copy(G.color).multiplyScalar(G.intensity),ot.distance=G.distance,ot.decay=G.decay,G.castShadow){let dt=G.shadow,_t=g.get(G);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,_t.shadowCameraNear=dt.camera.near,_t.shadowCameraFar=dt.camera.far,_.pointShadow[P]=_t,_.pointShadowMap[P]=pt,_.pointShadowMatrix[P]=G.shadow.matrix,z++}_.point[P]=ot,P++}else if(G.isHemisphereLight){let ot=m.get(G);ot.skyColor.copy(G.color).multiplyScalar(it),ot.groundColor.copy(G.groundColor).multiplyScalar(it),_.hemi[N]=ot,N++}}if(U>0)if(p.has("OES_texture_float_linear")===!0)_.rectAreaLTC1=Pt.LTC_FLOAT_1,_.rectAreaLTC2=Pt.LTC_FLOAT_2;else _.rectAreaLTC1=Pt.LTC_HALF_1,_.rectAreaLTC2=Pt.LTC_HALF_2;_.ambient[0]=T,_.ambient[1]=w,_.ambient[2]=E;let H=_.hash;if(H.sunLength!==A||H.directionalLength!==R||H.pointLength!==P||H.spotLength!==L||H.rectAreaLength!==U||H.hemiLength!==N||H.numSunShadows!==C||H.numDirectionalShadows!==F||H.numPointShadows!==z||H.numSpotShadows!==I||H.numSpotMaps!==O||H.numLightProbes!==q)_.sun.length=A,_.directional.length=R,_.spot.length=L,_.rectArea.length=U,_.point.length=P,_.hemi.length=N,_.sunShadow.length=C,_.sunShadowMap.length=C,_.sunShadowMatrix.length=D,_.sunShadowCascade.length=D,_.directionalShadow.length=F,_.directionalShadowMap.length=F,_.directionalShadowMatrix.length=F,_.pointShadow.length=z,_.pointShadowMap.length=z,_.pointShadowMatrix.length=z,_.spotShadow.length=I,_.spotShadowMap.length=I,_.spotLightMatrix.length=I+O-V,_.spotLightMap.length=O,_.numSpotLightShadowsWithMaps=V,_.numLightProbes=q,H.sunLength=A,H.directionalLength=R,H.pointLength=P,H.spotLength=L,H.rectAreaLength=U,H.hemiLength=N,H.numSunShadows=C,H.numDirectionalShadows=F,H.numPointShadows=z,H.numSpotShadows=I,H.numSpotMaps=O,H.numLightProbes=q,_.version=CS++}function b(M,T){let w=0,E=0,A=0,C=0,D=0,R=0,P=T.matrixWorldInverse;for(let L=0,U=M.length;L<U;L++){let N=M[L];if(N.isSunLight){let F=_.sun[w];F.direction.setFromMatrixPosition(N.matrixWorld),F.direction.transformDirection(P),w++}else if(N.isDirectionalLight){let F=_.directional[E];F.direction.setFromMatrixPosition(N.matrixWorld),x.setFromMatrixPosition(N.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(P),E++}else if(N.isSpotLight){let F=_.spot[C];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(P),F.direction.setFromMatrixPosition(N.matrixWorld),x.setFromMatrixPosition(N.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(P),C++}else if(N.isRectAreaLight){let F=_.rectArea[D];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(P),y.identity(),v.copy(N.matrixWorld),v.premultiply(P),y.extractRotation(v),F.halfWidth.set(N.width*0.5,0,0),F.halfHeight.set(0,N.height*0.5,0),F.halfWidth.applyMatrix4(y),F.halfHeight.applyMatrix4(y),D++}else if(N.isPointLight){let F=_.point[A];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(P),A++}else if(N.isHemisphereLight){let F=_.hemi[R];F.direction.setFromMatrixPosition(N.matrixWorld),F.direction.transformDirection(P),R++}}}return{setup:S,setupView:b,state:_}}function Up(p){let m=new IS(p),g=[],_=[],x=[];function v(w){T.camera=w,g.length=0,_.length=0,x.length=0}function y(w){if(w.isLightProbeGrid)x.push(w);else g.push(w)}function S(w){_.push(w)}function b(){m.setup(g),x.sort((w,E)=>w.priority-E.priority||w.id-E.id)}function M(w){m.setupView(g,w)}let T={lightsArray:g,shadowsArray:_,lightProbeGridArray:x,camera:null,lights:m,transmissionRenderTarget:{},textureUnits:0};return{init:v,state:T,setupLights:b,setupLightsView:M,pushLight:y,pushShadow:S}}function LS(p){let m=new WeakMap;function g(x,v=0){let y=m.get(x),S;if(y===void 0)S=new Up(p),m.set(x,[S]);else if(v>=y.length)S=new Up(p),y.push(S);else S=y[v];return S}function _(){m=new WeakMap}return{get:g,dispose:_}}var NS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,DS=`uniform sampler2D shadow_pass;
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
}`,US=[new Y(1,0,0),new Y(-1,0,0),new Y(0,1,0),new Y(0,-1,0),new Y(0,0,1),new Y(0,0,-1)],OS=[new Y(0,-1,0),new Y(0,-1,0),new Y(0,0,1),new Y(0,0,-1),new Y(0,-1,0),new Y(0,-1,0)],Op=new re,Zr=new Y,Lh=new Y;function FS(p,m,g){let _=new Di,x=new Jt,v=new Jt,y=new Oe,S=new ph,b=new mh,M={},T=g.maxTextureSize,w={[xi]:fn,[fn]:xi,[Bn]:Bn},E=new Ti({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Jt},radius:{value:4}},vertexShader:NS,fragmentShader:DS}),A=E.clone();A.defines.HORIZONTAL_PASS=1;let C=new qe;C.setAttribute("position",new We(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let D=new rn(C,E),R=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Pr;let P=this.type;this.render=function(z,I,O){if(R.enabled===!1)return;if(R.autoUpdate===!1&&R.needsUpdate===!1)return;if(z.length===0)return;if(this.type===uf)Xt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Pr;let V=p.getRenderTarget(),q=p.getActiveCubeFace(),H=p.getActiveMipmapLevel(),W=p.state;if(W.setBlending(ss),W.buffers.depth.getReversed()===!0)W.buffers.color.setClear(0,0,0,0);else W.buffers.color.setClear(1,1,1,1);W.buffers.depth.setTest(!0),W.setScissorTest(!1);let J=P!==this.type;if(J)I.traverse(function(G){if(G.material)if(Array.isArray(G.material))G.material.forEach((Q)=>Q.needsUpdate=!0);else G.material.needsUpdate=!0});for(let G=0,Q=z.length;G<Q;G++){let it=z[G],tt=it.shadow;if(tt===void 0){Xt("WebGLShadowMap:",it,"has no shadow.");continue}if(tt.autoUpdate===!1&&tt.needsUpdate===!1)continue;x.copy(tt.mapSize);let pt=tt.getFrameExtents();if(x.multiply(pt),v.copy(tt.mapSize),x.x>T||x.y>T){if(x.x>T)v.x=Math.floor(T/pt.x),x.x=v.x*pt.x,tt.mapSize.x=v.x;if(x.y>T)v.y=Math.floor(T/pt.y),x.y=v.y*pt.y,tt.mapSize.y=v.y}let ot=p.state.buffers.depth.getReversed();if(tt.camera._reversedDepth=ot,tt.map===null||J===!0){if(tt.map!==null){if(tt.map.depthTexture!==null)tt.map.depthTexture.dispose(),tt.map.depthTexture=null;tt.map.dispose()}if(this.type===Hs){if(it.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}tt.map=new zn(x.x,x.y,{format:os,type:ii,minFilter:An,magFilter:An,generateMipmaps:!1}),tt.map.texture.name=it.name+".shadowMap",tt.map.depthTexture=new Hi(x.x,x.y,vi),tt.map.depthTexture.name=it.name+".shadowMapDepth",tt.map.depthTexture.format=Ws,tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Ui,tt.map.depthTexture.magFilter=Ui}else{if(it.isPointLight)tt.map=new Ca(x.x),tt.map.depthTexture=new pa(x.x,Oi);else tt.map=new zn(x.x,x.y),tt.map.depthTexture=new Hi(x.x,x.y,Oi);if(tt.map.depthTexture.name=it.name+".shadowMap",tt.map.depthTexture.format=Ws,this.type===Pr)tt.map.depthTexture.compareFunction=ot?th:Qc,tt.map.depthTexture.minFilter=An,tt.map.depthTexture.magFilter=An;else tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Ui,tt.map.depthTexture.magFilter=Ui}tt.camera.updateProjectionMatrix()}if(tt.map.isWebGLCubeRenderTarget!==!0&&(tt.map.width!==x.x||tt.map.height!==x.y))tt.map.setSize(x.x,x.y);let dt=tt.map.isWebGLCubeRenderTarget?6:tt.getViewportCount();if(it.isPointLight!==!0)tt.updateMatrices(it,O);let _t=(tt.camera.layers.mask&4294967294)!==0?tt.camera.layers:O.layers;for(let Dt=0;Dt<dt;Dt++){let at=tt.getCamera(Dt);if(it.isPointLight){let{camera:mt,matrix:At}=tt,Ht=it.distance||mt.far;if(Ht!==mt.far)mt.far=Ht,mt.updateProjectionMatrix();Zr.setFromMatrixPosition(it.matrixWorld),mt.position.copy(Zr),Lh.copy(mt.position),Lh.add(US[Dt]),mt.up.copy(OS[Dt]),mt.lookAt(Lh),mt.updateMatrixWorld(),At.makeTranslation(-Zr.x,-Zr.y,-Zr.z),Op.multiplyMatrices(mt.projectionMatrix,mt.matrixWorldInverse),tt._frustum.setFromProjectionMatrix(Op,mt.coordinateSystem,mt.reversedDepth)}if(tt.map.isWebGLCubeRenderTarget)p.setRenderTarget(tt.map,Dt),p.clear();else{if(Dt===0)p.setRenderTarget(tt.map),p.clear();let mt=tt.getViewport(Dt);y.set(v.x*mt.x,v.y*mt.y,v.x*mt.z,v.y*mt.w),W.viewport(y)}_=tt.getFrustum(Dt),N(I,O,at,it,_t,this.type)}if(tt.isPointLightShadow!==!0&&this.type===Hs)L(tt,O);tt.needsUpdate=!1}P=this.type,R.needsUpdate=!1,p.setRenderTarget(V,q,H)};function L(z,I){let O=m.update(D);if(E.defines.VSM_SAMPLES!==z.blurSamples)E.defines.VSM_SAMPLES=z.blurSamples,A.defines.VSM_SAMPLES=z.blurSamples,E.needsUpdate=!0,A.needsUpdate=!0;if(z.mapPass===null)z.mapPass=new zn(x.x,x.y,{format:os,type:ii});else if(z.mapPass.width!==z.map.width||z.mapPass.height!==z.map.height)z.mapPass.setSize(z.map.width,z.map.height);E.uniforms.shadow_pass.value=z.map.depthTexture,E.uniforms.resolution.value.set(z.map.width,z.map.height),E.uniforms.radius.value=z.radius,p.setRenderTarget(z.mapPass),p.clear(),p.renderBufferDirect(I,null,O,E,D,null),A.uniforms.shadow_pass.value=z.mapPass.texture,A.uniforms.resolution.value.set(z.map.width,z.map.height),A.uniforms.radius.value=z.radius,p.setRenderTarget(z.map),p.clear(),p.renderBufferDirect(I,null,O,A,D,null)}function U(z,I,O,V){let q=null,H=O.isPointLight===!0?z.customDistanceMaterial:z.customDepthMaterial;if(H!==void 0)q=H;else if(q=O.isPointLight===!0?b:S,p.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let W=q.uuid,J=I.uuid,G=M[W];if(G===void 0)G={},M[W]=G;let Q=G[J];if(Q===void 0)Q=q.clone(),G[J]=Q,I.addEventListener("dispose",F);q=Q}if(q.visible=I.visible,q.wireframe=I.wireframe,V===Hs)q.side=I.shadowSide!==null?I.shadowSide:I.side;else q.side=I.shadowSide!==null?I.shadowSide:w[I.side];if(q.alphaMap=I.alphaMap,q.alphaTest=I.alphaToCoverage===!0?0.5:I.alphaTest,q.map=I.map,q.clipShadows=I.clipShadows,q.clippingPlanes=I.clippingPlanes,q.clipIntersection=I.clipIntersection,q.displacementMap=I.displacementMap,q.displacementScale=I.displacementScale,q.displacementBias=I.displacementBias,q.wireframeLinewidth=I.wireframeLinewidth,q.linewidth=I.linewidth,O.isPointLight===!0&&q.isMeshDistanceMaterial===!0){let W=p.properties.get(q);W.light=O}return q}function N(z,I,O,V,q,H){if(z.visible===!1)return;if(z.layers.test(q)&&(z.isMesh||z.isLine||z.isPoints)){if((z.castShadow||z.receiveShadow&&H===Hs)&&(!z.frustumCulled||z.intersectsFrustum(_))){z.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,z.matrixWorld);let G=m.update(z),Q=z.material;if(Array.isArray(Q)){let it=G.groups;for(let tt=0,pt=it.length;tt<pt;tt++){let ot=it[tt],dt=Q[ot.materialIndex];if(dt&&dt.visible){let _t=U(z,dt,V,H);z.onBeforeShadow(p,z,I,O,G,_t,ot),p.renderBufferDirect(O,null,G,_t,z,ot),z.onAfterShadow(p,z,I,O,G,_t,ot)}}}else if(Q.visible){let it=U(z,Q,V,H);z.onBeforeShadow(p,z,I,O,G,it,null),p.renderBufferDirect(O,null,G,it,z,null),z.onAfterShadow(p,z,I,O,G,it,null)}}}let J=z.children;for(let G=0,Q=J.length;G<Q;G++)N(J[G],I,O,V,q,H)}function F(z){z.target.removeEventListener("dispose",F);for(let O in M){let V=M[O],q=z.target.uuid;if(q in V)V[q].dispose(),delete V[q]}}}function BS(p,m){function g(){let Z=!1,ht=new Oe,ct=null,vt=new Oe(0,0,0,0);return{setMask:function(yt){if(ct!==yt&&!Z)p.colorMask(yt,yt,yt,yt),ct=yt},setLocked:function(yt){Z=yt},setClear:function(yt,wt,Vt,Gt,It){if(It===!0)yt*=Gt,wt*=Gt,Vt*=Gt;if(ht.set(yt,wt,Vt,Gt),vt.equals(ht)===!1)p.clearColor(yt,wt,Vt,Gt),vt.copy(ht)},reset:function(){Z=!1,ct=null,vt.set(-1,0,0,0)}}}function _(){let Z=!1,ht=!1,ct=null,vt=null,yt=null;return{setReversed:function(wt){if(ht!==wt){let Vt=m.get("EXT_clip_control");if(wt)Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT);else Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);ht=wt;let Gt=yt;yt=null,this.setClear(Gt)}},getReversed:function(){return ht},setTest:function(wt){if(wt)Rt(p.DEPTH_TEST);else ae(p.DEPTH_TEST)},setMask:function(wt){if(ct!==wt&&!Z)p.depthMask(wt),ct=wt},setFunc:function(wt){if(ht)wt=op[wt];if(vt!==wt){switch(wt){case Lf:p.depthFunc(p.NEVER);break;case Nf:p.depthFunc(p.ALWAYS);break;case Df:p.depthFunc(p.LESS);break;case cc:p.depthFunc(p.LEQUAL);break;case Uf:p.depthFunc(p.EQUAL);break;case Of:p.depthFunc(p.GEQUAL);break;case Ff:p.depthFunc(p.GREATER);break;case Bf:p.depthFunc(p.NOTEQUAL);break;default:p.depthFunc(p.LEQUAL)}vt=wt}},setLocked:function(wt){Z=wt},setClear:function(wt){if(yt!==wt){if(yt=wt,ht)wt=1-wt;p.clearDepth(wt)}},reset:function(){Z=!1,ct=null,vt=null,yt=null,ht=!1}}}function x(){let Z=!1,ht=null,ct=null,vt=null,yt=null,wt=null,Vt=null,Gt=null,It=null;return{setTest:function(Wt){if(!Z)if(Wt)Rt(p.STENCIL_TEST);else ae(p.STENCIL_TEST)},setMask:function(Wt){if(ht!==Wt&&!Z)p.stencilMask(Wt),ht=Wt},setFunc:function(Wt,le,Lt){if(ct!==Wt||vt!==le||yt!==Lt)p.stencilFunc(Wt,le,Lt),ct=Wt,vt=le,yt=Lt},setOp:function(Wt,le,Lt){if(wt!==Wt||Vt!==le||Gt!==Lt)p.stencilOp(Wt,le,Lt),wt=Wt,Vt=le,Gt=Lt},setLocked:function(Wt){Z=Wt},setClear:function(Wt){if(It!==Wt)p.clearStencil(Wt),It=Wt},reset:function(){Z=!1,ht=null,ct=null,vt=null,yt=null,wt=null,Vt=null,Gt=null,It=null}}}let v=new g,y=new _,S=new x,b={},M=new WeakMap,T={},w={},E={},A=new WeakMap,C=[],D=null,R=!1,P=null,L=null,U=null,N=null,F=null,z=null,I=null,O=new oe(0,0,0),V=0,q=!1,H=null,W=null,J=null,G=null,Q=null,it=p.getParameter(p.MAX_COMBINED_TEXTURE_IMAGE_UNITS),tt=!1,pt=0,ot=p.getParameter(p.VERSION);if(ot.indexOf("WebGL")!==-1)pt=parseFloat(/^WebGL (\d)/.exec(ot)[1]),tt=pt>=1;else if(ot.indexOf("OpenGL ES")!==-1)pt=parseFloat(/^OpenGL ES (\d)/.exec(ot)[1]),tt=pt>=2;let dt=null,_t={},Dt=p.getParameter(p.SCISSOR_BOX),at=p.getParameter(p.VIEWPORT),mt=new Oe().fromArray(Dt),At=new Oe().fromArray(at);function Ht(Z,ht,ct,vt){let yt=new Uint8Array(4),wt=p.createTexture();p.bindTexture(Z,wt),p.texParameteri(Z,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(Z,p.TEXTURE_MAG_FILTER,p.NEAREST);for(let Vt=0;Vt<ct;Vt++)if(Z===p.TEXTURE_3D||Z===p.TEXTURE_2D_ARRAY)p.texImage3D(ht,0,p.RGBA,1,1,vt,0,p.RGBA,p.UNSIGNED_BYTE,yt);else p.texImage2D(ht+Vt,0,p.RGBA,1,1,0,p.RGBA,p.UNSIGNED_BYTE,yt);return wt}let Ft={};Ft[p.TEXTURE_2D]=Ht(p.TEXTURE_2D,p.TEXTURE_2D,1),Ft[p.TEXTURE_CUBE_MAP]=Ht(p.TEXTURE_CUBE_MAP,p.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ft[p.TEXTURE_2D_ARRAY]=Ht(p.TEXTURE_2D_ARRAY,p.TEXTURE_2D_ARRAY,1,1),Ft[p.TEXTURE_3D]=Ht(p.TEXTURE_3D,p.TEXTURE_3D,1,1),v.setClear(0,0,0,1),y.setClear(1),S.setClear(0),Rt(p.DEPTH_TEST),y.setFunc(cc),ie(!1),se(rc),Rt(p.CULL_FACE),xt(ss);function Rt(Z){if(T[Z]!==!0)p.enable(Z),T[Z]=!0}function ae(Z){if(T[Z]!==!1)p.disable(Z),T[Z]=!1}function Kt(Z,ht){if(E[Z]!==ht){if(p.bindFramebuffer(Z,ht),E[Z]=ht,Z===p.DRAW_FRAMEBUFFER)E[p.FRAMEBUFFER]=ht;if(Z===p.FRAMEBUFFER)E[p.DRAW_FRAMEBUFFER]=ht;return!0}return!1}function Ut(Z,ht){let ct=C,vt=!1;if(Z){if(ct=A.get(ht),ct===void 0)ct=[],A.set(ht,ct);let yt=Z.textures;if(ct.length!==yt.length||ct[0]!==p.COLOR_ATTACHMENT0){for(let wt=0,Vt=yt.length;wt<Vt;wt++)ct[wt]=p.COLOR_ATTACHMENT0+wt;ct.length=yt.length,vt=!0}}else if(ct[0]!==p.BACK)ct[0]=p.BACK,vt=!0;if(vt)p.drawBuffers(ct)}function jt(Z){if(D!==Z)return p.useProgram(Z),D=Z,!0;return!1}let qt={[Gs]:p.FUNC_ADD,[ff]:p.FUNC_SUBTRACT,[pf]:p.FUNC_REVERSE_SUBTRACT};qt[mf]=p.MIN,qt[gf]=p.MAX;let ge={[_f]:p.ZERO,[xf]:p.ONE,[vf]:p.SRC_COLOR,[Sf]:p.SRC_ALPHA,[Af]:p.SRC_ALPHA_SATURATE,[Tf]:p.DST_COLOR,[Mf]:p.DST_ALPHA,[yf]:p.ONE_MINUS_SRC_COLOR,[bf]:p.ONE_MINUS_SRC_ALPHA,[wf]:p.ONE_MINUS_DST_COLOR,[Ef]:p.ONE_MINUS_DST_ALPHA,[Rf]:p.CONSTANT_COLOR,[Cf]:p.ONE_MINUS_CONSTANT_COLOR,[Pf]:p.CONSTANT_ALPHA,[If]:p.ONE_MINUS_CONSTANT_ALPHA};function xt(Z,ht,ct,vt,yt,wt,Vt,Gt,It,Wt){if(Z===ss){if(R===!0)ae(p.BLEND),R=!1;return}if(R===!1)Rt(p.BLEND),R=!0;if(Z!==df){if(Z!==P||Wt!==q){if(L!==Gs||F!==Gs)p.blendEquation(p.FUNC_ADD),L=Gs,F=Gs;if(Wt)switch(Z){case Ir:p.blendFuncSeparate(p.ONE,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case oc:p.blendFunc(p.ONE,p.ONE);break;case ac:p.blendFuncSeparate(p.ZERO,p.ONE_MINUS_SRC_COLOR,p.ZERO,p.ONE);break;case lc:p.blendFuncSeparate(p.DST_COLOR,p.ONE_MINUS_SRC_ALPHA,p.ZERO,p.ONE);break;default:$t("WebGLState: Invalid blending: ",Z);break}else switch(Z){case Ir:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case oc:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE,p.ONE,p.ONE);break;case ac:$t("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case lc:$t("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$t("WebGLState: Invalid blending: ",Z);break}U=null,N=null,z=null,I=null,O.set(0,0,0),V=0,P=Z,q=Wt}return}if(yt=yt||ht,wt=wt||ct,Vt=Vt||vt,ht!==L||yt!==F)p.blendEquationSeparate(qt[ht],qt[yt]),L=ht,F=yt;if(ct!==U||vt!==N||wt!==z||Vt!==I)p.blendFuncSeparate(ge[ct],ge[vt],ge[wt],ge[Vt]),U=ct,N=vt,z=wt,I=Vt;if(Gt.equals(O)===!1||It!==V)p.blendColor(Gt.r,Gt.g,Gt.b,It),O.copy(Gt),V=It;P=Z,q=!1}function Yt(Z,ht){Z.side===Bn?ae(p.CULL_FACE):Rt(p.CULL_FACE);let ct=Z.side===fn;if(ht)ct=!ct;ie(ct),Z.blending===Ir&&Z.transparent===!1?xt(ss):xt(Z.blending,Z.blendEquation,Z.blendSrc,Z.blendDst,Z.blendEquationAlpha,Z.blendSrcAlpha,Z.blendDstAlpha,Z.blendColor,Z.blendAlpha,Z.premultipliedAlpha),y.setFunc(Z.depthFunc),y.setTest(Z.depthTest),y.setMask(Z.depthWrite),v.setMask(Z.colorWrite);let vt=Z.stencilWrite;if(S.setTest(vt),vt)S.setMask(Z.stencilWriteMask),S.setFunc(Z.stencilFunc,Z.stencilRef,Z.stencilFuncMask),S.setOp(Z.stencilFail,Z.stencilZFail,Z.stencilZPass);Be(Z.polygonOffset,Z.polygonOffsetFactor,Z.polygonOffsetUnits),Z.alphaToCoverage===!0?Rt(p.SAMPLE_ALPHA_TO_COVERAGE):ae(p.SAMPLE_ALPHA_TO_COVERAGE)}function ie(Z){if(H!==Z){if(Z)p.frontFace(p.CW);else p.frontFace(p.CCW);H=Z}}function se(Z){if(Z!==cf){if(Rt(p.CULL_FACE),Z!==W)if(Z===rc)p.cullFace(p.BACK);else if(Z===hf)p.cullFace(p.FRONT);else p.cullFace(p.FRONT_AND_BACK)}else ae(p.CULL_FACE);W=Z}function pe(Z){if(Z!==J){if(tt)p.lineWidth(Z);J=Z}}function Be(Z,ht,ct){if(Z){if(Rt(p.POLYGON_OFFSET_FILL),G!==ht||Q!==ct){if(G=ht,Q=ct,y.getReversed())ht=-ht,ct=-ct;p.polygonOffset(ht,ct)}}else ae(p.POLYGON_OFFSET_FILL)}function ke(Z){if(Z)Rt(p.SCISSOR_TEST);else ae(p.SCISSOR_TEST)}function _n(Z){if(Z===void 0)Z=p.TEXTURE0+it-1;if(dt!==Z)p.activeTexture(Z),dt=Z}function j(Z,ht,ct){if(ct===void 0)if(dt===null)ct=p.TEXTURE0+it-1;else ct=dt;let vt=_t[ct];if(vt===void 0)vt={type:void 0,texture:void 0},_t[ct]=vt;if(vt.type!==Z||vt.texture!==ht){if(dt!==ct)p.activeTexture(ct),dt=ct;p.bindTexture(Z,ht||Ft[Z]),vt.type=Z,vt.texture=ht}}function xn(){let Z=_t[dt];if(Z!==void 0&&Z.type!==void 0)p.bindTexture(Z.type,null),Z.type=void 0,Z.texture=void 0}function be(){try{p.compressedTexImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function $e(){try{p.compressedTexImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Ct(){try{p.texSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Le(){try{p.texSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Zt(){try{p.compressedTexSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function te(){try{p.compressedTexSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function an(){try{p.texStorage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function X(){try{p.texStorage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function B(){try{p.texImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function et(){try{p.texImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function gt(Z){if(w[Z]!==void 0)return w[Z];else return p.getParameter(Z)}function ft(Z,ht){if(w[Z]!==ht)p.pixelStorei(Z,ht),w[Z]=ht}function St(Z){if(mt.equals(Z)===!1)p.scissor(Z.x,Z.y,Z.z,Z.w),mt.copy(Z)}function Et(Z){if(At.equals(Z)===!1)p.viewport(Z.x,Z.y,Z.z,Z.w),At.copy(Z)}function lt(Z,ht){let ct=M.get(ht);if(ct===void 0)ct=new WeakMap,M.set(ht,ct);let vt=ct.get(Z);if(vt===void 0)vt=p.getUniformBlockIndex(ht,Z.name),p.uniformBlockBinding(ht,vt,vt),ct.set(Z,vt)}function ut(Z,ht,ct){let yt=M.get(ht).get(Z);if(b[yt]!==ct)p.bindBufferBase(p.UNIFORM_BUFFER,yt,ct),b[yt]=ct}function bt(){p.disable(p.BLEND),p.disable(p.CULL_FACE),p.disable(p.DEPTH_TEST),p.disable(p.POLYGON_OFFSET_FILL),p.disable(p.SCISSOR_TEST),p.disable(p.STENCIL_TEST),p.disable(p.SAMPLE_ALPHA_TO_COVERAGE),p.blendEquation(p.FUNC_ADD),p.blendFunc(p.ONE,p.ZERO),p.blendFuncSeparate(p.ONE,p.ZERO,p.ONE,p.ZERO),p.blendColor(0,0,0,0),p.colorMask(!0,!0,!0,!0),p.clearColor(0,0,0,0),p.depthMask(!0),p.depthFunc(p.LESS),y.setReversed(!1),p.clearDepth(1),p.stencilMask(4294967295),p.stencilFunc(p.ALWAYS,0,4294967295),p.stencilOp(p.KEEP,p.KEEP,p.KEEP),p.clearStencil(0),p.cullFace(p.BACK),p.frontFace(p.CCW),p.polygonOffset(0,0),p.activeTexture(p.TEXTURE0),p.bindFramebuffer(p.FRAMEBUFFER,null),p.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),p.bindFramebuffer(p.READ_FRAMEBUFFER,null),p.useProgram(null),p.lineWidth(1),p.scissor(0,0,p.canvas.width,p.canvas.height),p.viewport(0,0,p.canvas.width,p.canvas.height),p.pixelStorei(p.PACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,!1),p.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),p.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,p.BROWSER_DEFAULT_WEBGL),p.pixelStorei(p.PACK_ROW_LENGTH,0),p.pixelStorei(p.PACK_SKIP_PIXELS,0),p.pixelStorei(p.PACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_ROW_LENGTH,0),p.pixelStorei(p.UNPACK_IMAGE_HEIGHT,0),p.pixelStorei(p.UNPACK_SKIP_PIXELS,0),p.pixelStorei(p.UNPACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_SKIP_IMAGES,0),T={},w={},dt=null,_t={},E={},b={},A=new WeakMap,C=[],D=null,R=!1,P=null,L=null,U=null,N=null,F=null,z=null,I=null,O=new oe(0,0,0),V=0,q=!1,H=null,W=null,J=null,G=null,Q=null,mt.set(0,0,p.canvas.width,p.canvas.height),At.set(0,0,p.canvas.width,p.canvas.height),v.reset(),y.reset(),S.reset()}return{buffers:{color:v,depth:y,stencil:S},enable:Rt,disable:ae,bindFramebuffer:Kt,drawBuffers:Ut,useProgram:jt,setBlending:xt,setMaterial:Yt,setFlipSided:ie,setCullFace:se,setLineWidth:pe,setPolygonOffset:Be,setScissorTest:ke,activeTexture:_n,bindTexture:j,unbindTexture:xn,compressedTexImage2D:be,compressedTexImage3D:$e,texImage2D:B,texImage3D:et,pixelStorei:ft,getParameter:gt,updateUBOMapping:lt,uniformBlockBinding:ut,texStorage2D:an,texStorage3D:X,texSubImage2D:Ct,texSubImage3D:Le,compressedTexSubImage2D:Zt,compressedTexSubImage3D:te,scissor:St,viewport:Et,reset:bt}}function kS(p,m,g,_,x,v,y){let S=m.has("WEBGL_multisampled_render_to_texture")?m.get("WEBGL_multisampled_render_to_texture"):null,b=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),M=new Jt,T=new WeakMap,w=new Set,E,A=new WeakMap,C=new Set,D=new FinalizationRegistry((X)=>C.delete(X)),R=!1;try{R=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(X){}function P(X,B){return R?new OffscreenCanvas(X,B):Rr("canvas")}function L(X,B,et){let gt=1,ft=an(X);if(ft.width>et||ft.height>et)gt=et/Math.max(ft.width,ft.height);if(gt<1)if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&X instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&X instanceof ImageBitmap||typeof VideoFrame<"u"&&X instanceof VideoFrame){let St=Math.floor(gt*ft.width),Et=Math.floor(gt*ft.height);if(E===void 0)E=P(St,Et);let lt=B?P(St,Et):E;return lt.width=St,lt.height=Et,lt.getContext("2d").drawImage(X,0,0,St,Et),Xt("WebGLRenderer: Texture has been resized from ("+ft.width+"x"+ft.height+") to ("+St+"x"+Et+")."),lt}else{if("data"in X)Xt("WebGLRenderer: Image in DataTexture is too big ("+ft.width+"x"+ft.height+").");return X}return X}function U(X){return X.generateMipmaps}function N(X){p.generateMipmap(X)}function F(X){if(X.isWebGLCubeRenderTarget)return p.TEXTURE_CUBE_MAP;if(X.isWebGL3DRenderTarget)return p.TEXTURE_3D;if(X.isWebGLArrayRenderTarget||X.isCompressedArrayTexture)return p.TEXTURE_2D_ARRAY;return p.TEXTURE_2D}function z(X,B,et,gt,ft,St=!1){if(X!==null){if(p[X]!==void 0)return p[X];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+X+"'")}let Et;if(gt){if(Et=m.get("EXT_texture_norm16"),!Et)Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let lt=B;if(B===p.RED){if(et===p.FLOAT)lt=p.R32F;if(et===p.HALF_FLOAT)lt=p.R16F;if(et===p.UNSIGNED_BYTE)lt=p.R8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.R16_EXT;if(et===p.SHORT&&Et)lt=Et.R16_SNORM_EXT}if(B===p.RED_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.R8UI;if(et===p.UNSIGNED_SHORT)lt=p.R16UI;if(et===p.UNSIGNED_INT)lt=p.R32UI;if(et===p.BYTE)lt=p.R8I;if(et===p.SHORT)lt=p.R16I;if(et===p.INT)lt=p.R32I}if(B===p.RG){if(et===p.FLOAT)lt=p.RG32F;if(et===p.HALF_FLOAT)lt=p.RG16F;if(et===p.UNSIGNED_BYTE)lt=p.RG8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RG16_EXT;if(et===p.SHORT&&Et)lt=Et.RG16_SNORM_EXT}if(B===p.RG_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RG8UI;if(et===p.UNSIGNED_SHORT)lt=p.RG16UI;if(et===p.UNSIGNED_INT)lt=p.RG32UI;if(et===p.BYTE)lt=p.RG8I;if(et===p.SHORT)lt=p.RG16I;if(et===p.INT)lt=p.RG32I}if(B===p.RGB_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGB8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGB16UI;if(et===p.UNSIGNED_INT)lt=p.RGB32UI;if(et===p.BYTE)lt=p.RGB8I;if(et===p.SHORT)lt=p.RGB16I;if(et===p.INT)lt=p.RGB32I}if(B===p.RGBA_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGBA8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGBA16UI;if(et===p.UNSIGNED_INT)lt=p.RGBA32UI;if(et===p.BYTE)lt=p.RGBA8I;if(et===p.SHORT)lt=p.RGBA16I;if(et===p.INT)lt=p.RGBA32I}if(B===p.RGB){if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RGB16_EXT;if(et===p.SHORT&&Et)lt=Et.RGB16_SNORM_EXT;if(et===p.UNSIGNED_INT_5_9_9_9_REV)lt=p.RGB9_E5;if(et===p.UNSIGNED_INT_10F_11F_11F_REV)lt=p.R11F_G11F_B10F}if(B===p.RGBA){let ut=St?jc:he.getTransfer(ft);if(et===p.FLOAT)lt=p.RGBA32F;if(et===p.HALF_FLOAT)lt=p.RGBA16F;if(et===p.UNSIGNED_BYTE)lt=ut===Ce?p.SRGB8_ALPHA8:p.RGBA8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RGBA16_EXT;if(et===p.SHORT&&Et)lt=Et.RGBA16_SNORM_EXT;if(et===p.UNSIGNED_SHORT_4_4_4_4)lt=p.RGBA4;if(et===p.UNSIGNED_SHORT_5_5_5_1)lt=p.RGB5_A1}if(lt===p.R16F||lt===p.R32F||lt===p.RG16F||lt===p.RG32F||lt===p.RGBA16F||lt===p.RGBA32F)m.get("EXT_color_buffer_float");return lt}function I(X,B){let et;if(X){if(B===null||B===Oi||B===rs)et=p.DEPTH24_STENCIL8;else if(B===vi)et=p.DEPTH32F_STENCIL8;else if(B===Dr)et=p.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(B===null||B===Oi||B===rs)et=p.DEPTH_COMPONENT24;else if(B===vi)et=p.DEPTH_COMPONENT32F;else if(B===Dr)et=p.DEPTH_COMPONENT16;return et}function O(X,B){if(U(X)===!0||X.isFramebufferTexture&&X.minFilter!==Ui&&X.minFilter!==An)return Math.log2(Math.max(B.width,B.height))+1;else if(X.mipmaps.length>0)return X.mipmaps.length;else if(X.isCompressedTexture&&Array.isArray(X.image))return B.mipmaps.length;else return 1}function V(X){let B=new WeakRef(X);_.get(X).__ref=B,C.add(B),D.register(X,B,B)}function q(X){let B=_.get(X).__ref;if(B===void 0)return;C.delete(B),D.unregister(B)}function H(X){J(X.target)}function W(X){G(X.target)}function J(X){if(X.removeEventListener("dispose",H),q(X),it(X),X.isVideoTexture)T.delete(X);if(X.isHTMLTexture)w.delete(X)}function G(X){X.removeEventListener("dispose",W),q(X),pt(X)}function Q(){for(let X of C){let B=X.deref();if(B===void 0)continue;if(B.isRenderTarget===!0)G(B);else J(B)}C.clear(),w.clear()}function it(X){let B=_.get(X);if(B.__webglInit===void 0)return;let et=X.source,gt=A.get(et);if(gt){let ft=gt[B.__cacheKey];if(ft.usedTimes--,ft.usedTimes===0)tt(X);if(Object.keys(gt).length===0)A.delete(et)}_.remove(X)}function tt(X){let B=_.get(X);p.deleteTexture(B.__webglTexture);let et=X.source,gt=A.get(et);delete gt[B.__cacheKey],y.memory.textures--}function pt(X){let B=_.get(X);if(B.__depthDisposeCallback)B.__depthDisposeCallback();let et=X.depthTexture;if(et&&et.renderTarget===X)J(et);if(X.isWebGLCubeRenderTarget)for(let ft=0;ft<6;ft++){if(Array.isArray(B.__webglFramebuffer[ft]))for(let St=0;St<B.__webglFramebuffer[ft].length;St++)p.deleteFramebuffer(B.__webglFramebuffer[ft][St]);else p.deleteFramebuffer(B.__webglFramebuffer[ft]);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer[ft])}else{if(Array.isArray(B.__webglFramebuffer))for(let ft=0;ft<B.__webglFramebuffer.length;ft++)p.deleteFramebuffer(B.__webglFramebuffer[ft]);else p.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer);if(B.__webglMultisampledFramebuffer)p.deleteFramebuffer(B.__webglMultisampledFramebuffer);if(B.__webglColorRenderbuffer){for(let ft=0;ft<B.__webglColorRenderbuffer.length;ft++)if(B.__webglColorRenderbuffer[ft])p.deleteRenderbuffer(B.__webglColorRenderbuffer[ft])}if(B.__webglDepthRenderbuffer)p.deleteRenderbuffer(B.__webglDepthRenderbuffer)}let gt=X.textures;for(let ft=0,St=gt.length;ft<St;ft++){let Et=_.get(gt[ft]);if(Et.__webglTexture)p.deleteTexture(Et.__webglTexture),y.memory.textures--;_.remove(gt[ft])}_.remove(X)}let ot=0;function dt(){ot=0}function _t(){return ot}function Dt(X){ot=X}function at(){let X=ot;if(X>=x.maxTextures)Xt("WebGLTextures: Trying to use "+(X+1)+" texture units while this GPU supports only "+x.maxTextures);return ot+=1,X}function mt(X){let B=[];return B.push(X.wrapS),B.push(X.wrapT),B.push(X.wrapR||0),B.push(X.magFilter),B.push(X.minFilter),B.push(X.anisotropy),B.push(X.internalFormat),B.push(X.format),B.push(X.type),B.push(X.generateMipmaps),B.push(X.mipmapsAutoUpdate),B.push(X.premultiplyAlpha),B.push(X.flipY),B.push(X.unpackAlignment),B.push(X.colorSpace),B.join()}function At(X,B){let et=_.get(X);if(X.isVideoTexture)Zt(X);if(X.isRenderTargetTexture===!1&&X.isExternalTexture!==!0&&X.version>0&&et.__version!==X.version){let gt=X.image;if(gt===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(gt.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{Yt(et,X,B);return}}else if(X.isExternalTexture)et.__webglTexture=X.sourceTexture?X.sourceTexture:null;g.bindTexture(p.TEXTURE_2D,et.__webglTexture,p.TEXTURE0+B)}function Ht(X,B){let et=_.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&et.__version!==X.version){Yt(et,X,B);return}else if(X.isExternalTexture)et.__webglTexture=X.sourceTexture?X.sourceTexture:null;g.bindTexture(p.TEXTURE_2D_ARRAY,et.__webglTexture,p.TEXTURE0+B)}function Ft(X,B){let et=_.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&et.__version!==X.version){Yt(et,X,B);return}g.bindTexture(p.TEXTURE_3D,et.__webglTexture,p.TEXTURE0+B)}function Rt(X,B){let et=_.get(X);if(X.version>0&&et.__version!==X.version){ie(et,X,B);return}g.bindTexture(p.TEXTURE_CUBE_MAP,et.__webglTexture,p.TEXTURE0+B)}let ae={[jo]:p.REPEAT,[Qo]:p.CLAMP_TO_EDGE,[Gf]:p.MIRRORED_REPEAT},Kt={[Ui]:p.NEAREST,[Vf]:p.NEAREST_MIPMAP_NEAREST,[Nr]:p.NEAREST_MIPMAP_LINEAR,[An]:p.LINEAR,[ta]:p.LINEAR_MIPMAP_NEAREST,[Yn]:p.LINEAR_MIPMAP_LINEAR},Ut={[jf]:p.NEVER,[eh]:p.ALWAYS,[Qf]:p.LESS,[Qc]:p.LEQUAL,[tp]:p.EQUAL,[th]:p.GEQUAL,[ep]:p.GREATER,[np]:p.NOTEQUAL};function jt(X,B){if(B.type===vi&&m.has("OES_texture_float_linear")===!1&&(B.magFilter===An||B.magFilter===ta||B.magFilter===Nr||B.magFilter===Yn||B.minFilter===An||B.minFilter===ta||B.minFilter===Nr||B.minFilter===Yn))Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(p.texParameteri(X,p.TEXTURE_WRAP_S,ae[B.wrapS]),p.texParameteri(X,p.TEXTURE_WRAP_T,ae[B.wrapT]),X===p.TEXTURE_3D||X===p.TEXTURE_2D_ARRAY)p.texParameteri(X,p.TEXTURE_WRAP_R,ae[B.wrapR]);if(p.texParameteri(X,p.TEXTURE_MAG_FILTER,Kt[B.magFilter]),p.texParameteri(X,p.TEXTURE_MIN_FILTER,Kt[B.minFilter]),B.compareFunction)p.texParameteri(X,p.TEXTURE_COMPARE_MODE,p.COMPARE_REF_TO_TEXTURE),p.texParameteri(X,p.TEXTURE_COMPARE_FUNC,Ut[B.compareFunction]);if(m.has("EXT_texture_filter_anisotropic")===!0){if(B.magFilter===Ui)return;if(B.minFilter!==Nr&&B.minFilter!==Yn)return;if(B.type===vi&&m.has("OES_texture_float_linear")===!1)return;if(B.anisotropy>1||_.get(B).__currentAnisotropy){let et=m.get("EXT_texture_filter_anisotropic");p.texParameterf(X,et.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(B.anisotropy,x.getMaxAnisotropy())),_.get(B).__currentAnisotropy=B.anisotropy}}}function qt(X,B){let et=!1;if(X.__webglInit===void 0)X.__webglInit=!0,B.addEventListener("dispose",H),V(B);let gt=B.source,ft=A.get(gt);if(ft===void 0)ft={},A.set(gt,ft);let St=mt(B);if(St!==X.__cacheKey){if(ft[St]===void 0)ft[St]={texture:p.createTexture(),usedTimes:0},y.memory.textures++,et=!0;ft[St].usedTimes++;let Et=ft[X.__cacheKey];if(Et!==void 0){if(ft[X.__cacheKey].usedTimes--,Et.usedTimes===0)tt(B)}X.__cacheKey=St,X.__webglTexture=ft[St].texture}return et}function ge(X,B,et){return Math.floor(Math.floor(X/et)/B)}function xt(X,B,et,gt){let St=X.updateRanges;if(St.length===0)g.texSubImage2D(p.TEXTURE_2D,0,0,0,B.width,B.height,et,gt,B.data);else{St.sort((Z,ht)=>Z.start-ht.start);let Et=0;for(let Z=1;Z<St.length;Z++){let ht=St[Et],ct=St[Z],vt=ht.start+ht.count,yt=ge(ct.start,B.width,4),wt=ge(ht.start,B.width,4);if(ct.start<=vt+1&&yt===wt&&ge(ct.start+ct.count-1,B.width,4)===yt)ht.count=Math.max(ht.count,ct.start+ct.count-ht.start);else++Et,St[Et]=ct}St.length=Et+1;let lt=g.getParameter(p.UNPACK_ROW_LENGTH),ut=g.getParameter(p.UNPACK_SKIP_PIXELS),bt=g.getParameter(p.UNPACK_SKIP_ROWS);g.pixelStorei(p.UNPACK_ROW_LENGTH,B.width);for(let Z=0,ht=St.length;Z<ht;Z++){let ct=St[Z],vt=Math.floor(ct.start/4),yt=Math.ceil(ct.count/4),wt=vt%B.width,Vt=Math.floor(vt/B.width),Gt=yt,It=1;g.pixelStorei(p.UNPACK_SKIP_PIXELS,wt),g.pixelStorei(p.UNPACK_SKIP_ROWS,Vt),g.texSubImage2D(p.TEXTURE_2D,0,wt,Vt,Gt,1,et,gt,B.data)}X.clearUpdateRanges(),g.pixelStorei(p.UNPACK_ROW_LENGTH,lt),g.pixelStorei(p.UNPACK_SKIP_PIXELS,ut),g.pixelStorei(p.UNPACK_SKIP_ROWS,bt)}}function Yt(X,B,et){let gt=p.TEXTURE_2D;if(B.isDataArrayTexture||B.isCompressedArrayTexture)gt=p.TEXTURE_2D_ARRAY;if(B.isData3DTexture)gt=p.TEXTURE_3D;let ft=qt(X,B),St=B.source;g.bindTexture(gt,X.__webglTexture,p.TEXTURE0+et);let Et=_.get(St);if(St.version!==Et.__version||ft===!0){if(g.activeTexture(p.TEXTURE0+et),(typeof ImageBitmap<"u"&&B.image instanceof ImageBitmap)===!1){let It=he.getPrimaries(he.workingColorSpace),Wt=B.colorSpace===as?null:he.getPrimaries(B.colorSpace),le=B.colorSpace===as||It===Wt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,le)}g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment);let ut=L(B.image,!1,x.maxTextureSize);ut=te(B,ut);let bt=v.convert(B.format,B.colorSpace),Z=v.convert(B.type),ht=z(B.internalFormat,bt,Z,B.normalized,B.colorSpace,B.isVideoTexture);jt(gt,B);let ct,vt=B.mipmaps,yt=B.isVideoTexture!==!0,wt=Et.__version===void 0||ft===!0,Vt=St.dataReady,Gt=O(B,ut);if(B.isDepthTexture){if(ht=I(B.format===Fi,B.type),wt)if(yt)g.texStorage2D(p.TEXTURE_2D,1,ht,ut.width,ut.height);else g.texImage2D(p.TEXTURE_2D,0,ht,ut.width,ut.height,0,bt,Z,null)}else if(B.isDataTexture)if(vt.length>0){if(yt&&wt)g.texStorage2D(p.TEXTURE_2D,Gt,ht,vt[0].width,vt[0].height);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],yt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,bt,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ht,ct.width,ct.height,0,bt,Z,ct.data);B.generateMipmaps=!1}else if(yt){if(wt)g.texStorage2D(p.TEXTURE_2D,Gt,ht,ut.width,ut.height);if(Vt)xt(B,ut,bt,Z)}else g.texImage2D(p.TEXTURE_2D,0,ht,ut.width,ut.height,0,bt,Z,ut.data);else if(B.isCompressedTexture)if(B.isCompressedArrayTexture){if(yt&&wt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ht,vt[0].width,vt[0].height,ut.depth);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],B.format!==kn)if(bt!==null)if(yt){if(Vt)if(B.layerUpdates.size>0){let le=Ph(ct.width,ct.height,B.format,B.type);for(let Lt of B.layerUpdates){let Te=ct.data.subarray(Lt*le/ct.data.BYTES_PER_ELEMENT,(Lt+1)*le/ct.data.BYTES_PER_ELEMENT);g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,Lt,ct.width,ct.height,1,bt,Te)}}else g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,ut.depth,bt,ct.data)}else g.compressedTexImage3D(p.TEXTURE_2D_ARRAY,It,ht,ct.width,ct.height,ut.depth,0,ct.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(yt){if(Vt)g.texSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,ut.depth,bt,Z,ct.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,It,ht,ct.width,ct.height,ut.depth,0,bt,Z,ct.data);if(B.layerUpdates.size>0)B.clearLayerUpdates()}else{if(yt&&wt)g.texStorage2D(p.TEXTURE_2D,Gt,ht,vt[0].width,vt[0].height);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],B.format!==kn)if(bt!==null)if(yt){if(Vt)g.compressedTexSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,bt,ct.data)}else g.compressedTexImage2D(p.TEXTURE_2D,It,ht,ct.width,ct.height,0,ct.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(yt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,bt,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ht,ct.width,ct.height,0,bt,Z,ct.data)}else if(B.isDataArrayTexture)if(yt){if(wt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ht,ut.width,ut.height,ut.depth);if(Vt)if(B.layerUpdates.size>0){let It=Ph(ut.width,ut.height,B.format,B.type);for(let Wt of B.layerUpdates){let le=ut.data.subarray(Wt*It/ut.data.BYTES_PER_ELEMENT,(Wt+1)*It/ut.data.BYTES_PER_ELEMENT);g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,Wt,ut.width,ut.height,1,bt,Z,le)}B.clearLayerUpdates()}else g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,0,ut.width,ut.height,ut.depth,bt,Z,ut.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,0,ht,ut.width,ut.height,ut.depth,0,bt,Z,ut.data);else if(B.isData3DTexture)if(yt){if(wt)g.texStorage3D(p.TEXTURE_3D,Gt,ht,ut.width,ut.height,ut.depth);if(Vt)g.texSubImage3D(p.TEXTURE_3D,0,0,0,0,ut.width,ut.height,ut.depth,bt,Z,ut.data)}else g.texImage3D(p.TEXTURE_3D,0,ht,ut.width,ut.height,ut.depth,0,bt,Z,ut.data);else if(B.isFramebufferTexture){if(wt)if(yt)g.texStorage2D(p.TEXTURE_2D,Gt,ht,ut.width,ut.height);else{let It=ut.width,Wt=ut.height;for(let le=0;le<Gt;le++)g.texImage2D(p.TEXTURE_2D,le,ht,It,Wt,0,bt,Z,null),It>>=1,Wt>>=1}}else if(B.isHTMLTexture){if("texElementImage2D"in p){let It=p.canvas;if(!It.hasAttribute("layoutsubtree"))It.setAttribute("layoutsubtree","true");if(ut.parentNode!==It){It.appendChild(ut),w.add(B),It.onpaint=(Wt)=>{let le=Wt.changedElements;for(let Lt of w)if(le.includes(Lt.image))Lt.needsUpdate=!0},It.requestPaint();return}if(p.texElementImage2D.length===3)p.texElementImage2D(p.TEXTURE_2D,p.RGBA8,ut);else{let{RGBA:le,RGBA:Lt,UNSIGNED_BYTE:Te}=p;p.texElementImage2D(p.TEXTURE_2D,0,le,Lt,Te,ut)}p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE)}}else if(vt.length>0){if(yt&&wt){let It=an(vt[0]);g.texStorage2D(p.TEXTURE_2D,Gt,ht,It.width,It.height)}for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],yt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,bt,Z,ct)}else g.texImage2D(p.TEXTURE_2D,It,ht,bt,Z,ct);B.generateMipmaps=!1}else if(yt){if(wt){let It=an(ut);g.texStorage2D(p.TEXTURE_2D,Gt,ht,It.width,It.height)}if(Vt)g.texSubImage2D(p.TEXTURE_2D,0,0,0,bt,Z,ut)}else g.texImage2D(p.TEXTURE_2D,0,ht,bt,Z,ut);if(U(B)&&B.mipmapsAutoUpdate===!0)N(gt);if(Et.__version=St.version,B.onUpdate)B.onUpdate(B)}X.__version=B.version}function ie(X,B,et){if(B.image.length!==6)return;let gt=qt(X,B),ft=B.source;g.bindTexture(p.TEXTURE_CUBE_MAP,X.__webglTexture,p.TEXTURE0+et);let St=_.get(ft);if(ft.version!==St.__version||gt===!0){g.activeTexture(p.TEXTURE0+et);let Et=he.getPrimaries(he.workingColorSpace),lt=B.colorSpace===as?null:he.getPrimaries(B.colorSpace),ut=B.colorSpace===as||Et===lt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);let bt=B.isCompressedTexture||B.image[0].isCompressedTexture,Z=B.image[0]&&B.image[0].isDataTexture,ht=[];for(let Lt=0;Lt<6;Lt++){if(!bt&&!Z)ht[Lt]=L(B.image[Lt],!0,x.maxCubemapSize);else ht[Lt]=Z?B.image[Lt].image:B.image[Lt];ht[Lt]=te(B,ht[Lt])}let ct=ht[0],vt=v.convert(B.format,B.colorSpace),yt=v.convert(B.type),wt=z(B.internalFormat,vt,yt,B.normalized,B.colorSpace),Vt=B.isVideoTexture!==!0,Gt=St.__version===void 0||gt===!0,It=ft.dataReady,Wt=O(B,ct);jt(p.TEXTURE_CUBE_MAP,B);let le;if(B.isDepthTexture){if(wt=I(B.format===Fi,B.type),Gt)if(Vt)g.texStorage2D(p.TEXTURE_CUBE_MAP,1,wt,ct.width,ct.height);else for(let Lt=0;Lt<6;Lt++)g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,ct.width,ct.height,0,vt,yt,null)}else if(bt){if(Vt&&Gt)g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,wt,ct.width,ct.height);for(let Lt=0;Lt<6;Lt++){le=ht[Lt].mipmaps;for(let Te=0;Te<le.length;Te++){let Je=le[Te];if(B.format!==kn)if(vt!==null)if(Vt){if(It)g.compressedTexSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te,0,0,Je.width,Je.height,vt,Je.data)}else g.compressedTexImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te,wt,Je.width,Je.height,0,Je.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te,0,0,Je.width,Je.height,vt,yt,Je.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te,wt,Je.width,Je.height,0,vt,yt,Je.data)}}}else{if(le=B.mipmaps,Vt&&Gt){if(le.length>0)Wt++;let Lt=an(ht[0]);g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,wt,Lt.width,Lt.height)}for(let Lt=0;Lt<6;Lt++)if(Z){if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,ht[Lt].width,ht[Lt].height,vt,yt,ht[Lt].data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,ht[Lt].width,ht[Lt].height,0,vt,yt,ht[Lt].data);for(let Te=0;Te<le.length;Te++){let li=le[Te].image[Lt].image;if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te+1,0,0,li.width,li.height,vt,yt,li.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te+1,wt,li.width,li.height,0,vt,yt,li.data)}}else{if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,vt,yt,ht[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,vt,yt,ht[Lt]);for(let Te=0;Te<le.length;Te++){let Je=le[Te];if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te+1,0,0,vt,yt,Je.image[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Te+1,wt,vt,yt,Je.image[Lt])}}}if(U(B)&&B.mipmapsAutoUpdate===!0)N(p.TEXTURE_CUBE_MAP);if(St.__version=ft.version,B.onUpdate)B.onUpdate(B)}X.__version=B.version}function se(X,B,et,gt,ft,St){let Et=v.convert(et.format,et.colorSpace),lt=v.convert(et.type),ut=z(et.internalFormat,Et,lt,et.normalized,et.colorSpace),bt=_.get(B),Z=_.get(et);if(Z.__renderTarget=B,!bt.__hasExternalTextures){let ht=Math.max(1,B.width>>St),ct=Math.max(1,B.height>>St);if(ft===p.TEXTURE_3D||ft===p.TEXTURE_2D_ARRAY)g.texImage3D(ft,St,ut,ht,ct,B.depth,0,Et,lt,null);else g.texImage2D(ft,St,ut,ht,ct,0,Et,lt,null)}if(g.bindFramebuffer(p.FRAMEBUFFER,X),Le(B))S.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,gt,ft,Z.__webglTexture,0,Ct(B));else if(ft===p.TEXTURE_2D||ft>=p.TEXTURE_CUBE_MAP_POSITIVE_X&&ft<=p.TEXTURE_CUBE_MAP_NEGATIVE_Z)p.framebufferTexture2D(p.FRAMEBUFFER,gt,ft,Z.__webglTexture,St);g.bindFramebuffer(p.FRAMEBUFFER,null)}function pe(X,B,et){if(p.bindRenderbuffer(p.RENDERBUFFER,X),B.depthBuffer){let gt=B.depthTexture,ft=gt&&gt.isDepthTexture?gt.type:null,St=I(B.stencilBuffer,ft),Et=B.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(Le(B))S.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,Ct(B),St,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,Ct(B),St,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,St,B.width,B.height);p.framebufferRenderbuffer(p.FRAMEBUFFER,Et,p.RENDERBUFFER,X)}else{let gt=B.textures;for(let ft=0;ft<gt.length;ft++){let St=gt[ft],Et=v.convert(St.format,St.colorSpace),lt=v.convert(St.type),ut=z(St.internalFormat,Et,lt,St.normalized,St.colorSpace);if(Le(B))S.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,Ct(B),ut,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,Ct(B),ut,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,ut,B.width,B.height)}}p.bindRenderbuffer(p.RENDERBUFFER,null)}function Be(X,B,et){let gt=B.isWebGLCubeRenderTarget===!0;if(g.bindFramebuffer(p.FRAMEBUFFER,X),!(B.depthTexture&&B.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ft=_.get(B.depthTexture);ft.__renderTarget=B;let St=gt?B.depthTexture.image[0]:B.depthTexture.image;if(!ft.__webglTexture||St.width!==B.width||St.height!==B.height)St.width=B.width,St.height=B.height,B.depthTexture.needsUpdate=!0;if(gt)Rt(B.depthTexture,0);else At(B.depthTexture,0);let Et=ft.__webglTexture,lt=Ct(B),ut=gt?p.TEXTURE_CUBE_MAP_POSITIVE_X+et:p.TEXTURE_2D,bt=B.depthTexture.format===Fi?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(B.depthTexture.format===Ws)if(Le(B))S.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,bt,ut,Et,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,bt,ut,Et,0);else if(B.depthTexture.format===Fi)if(Le(B))S.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,bt,ut,Et,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,bt,ut,Et,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ke(X){let B=_.get(X),et=X.isWebGLCubeRenderTarget===!0;if(B.__boundDepthTexture!==X.depthTexture){let gt=X.depthTexture;if(B.__depthDisposeCallback)B.__depthDisposeCallback();if(gt){let ft=()=>{delete B.__boundDepthTexture,delete B.__depthDisposeCallback,gt.removeEventListener("dispose",ft)};gt.addEventListener("dispose",ft),B.__depthDisposeCallback=ft}B.__boundDepthTexture=gt}if(X.depthTexture&&!B.__autoAllocateDepthBuffer)if(et)for(let gt=0;gt<6;gt++)Be(B.__webglFramebuffer[gt],X,gt);else if(X.texture.mipmaps.length>0)Be(B.__webglFramebuffer[0],X,0);else Be(B.__webglFramebuffer,X,0);else if(et){B.__webglDepthbuffer=[];for(let gt=0;gt<6;gt++)if(g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[gt]),B.__webglDepthbuffer[gt]===void 0)B.__webglDepthbuffer[gt]=p.createRenderbuffer(),pe(B.__webglDepthbuffer[gt],X,!1);else{let ft=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,St=B.__webglDepthbuffer[gt];p.bindRenderbuffer(p.RENDERBUFFER,St),p.framebufferRenderbuffer(p.FRAMEBUFFER,ft,p.RENDERBUFFER,St)}}else{if(X.texture.mipmaps.length>0)g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[0]);else g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer);if(B.__webglDepthbuffer===void 0)B.__webglDepthbuffer=p.createRenderbuffer(),pe(B.__webglDepthbuffer,X,!1);else{let ft=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,St=B.__webglDepthbuffer;p.bindRenderbuffer(p.RENDERBUFFER,St),p.framebufferRenderbuffer(p.FRAMEBUFFER,ft,p.RENDERBUFFER,St)}}g.bindFramebuffer(p.FRAMEBUFFER,null)}function _n(X,B,et){let gt=_.get(X);if(B!==void 0)se(gt.__webglFramebuffer,X,X.texture,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,0);if(et!==void 0)ke(X)}function j(X){let B=X.texture,et=_.get(X),gt=_.get(B);X.addEventListener("dispose",W),V(X);let ft=X.textures,St=X.isWebGLCubeRenderTarget===!0,Et=ft.length>1;if(!Et){if(gt.__webglTexture===void 0)gt.__webglTexture=p.createTexture();gt.__version=B.version,y.memory.textures++}if(St){et.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0){et.__webglFramebuffer[lt]=[];for(let ut=0;ut<B.mipmaps.length;ut++)et.__webglFramebuffer[lt][ut]=p.createFramebuffer()}else et.__webglFramebuffer[lt]=p.createFramebuffer()}else{if(B.mipmaps.length>0){et.__webglFramebuffer=[];for(let lt=0;lt<B.mipmaps.length;lt++)et.__webglFramebuffer[lt]=p.createFramebuffer()}else et.__webglFramebuffer=p.createFramebuffer();if(Et)for(let lt=0,ut=ft.length;lt<ut;lt++){let bt=_.get(ft[lt]);if(bt.__webglTexture===void 0)bt.__webglTexture=p.createTexture(),y.memory.textures++}if(X.samples>0&&Le(X)===!1){et.__webglMultisampledFramebuffer=p.createFramebuffer(),et.__webglColorRenderbuffer=[],g.bindFramebuffer(p.FRAMEBUFFER,et.__webglMultisampledFramebuffer);for(let lt=0;lt<ft.length;lt++){let ut=ft[lt];et.__webglColorRenderbuffer[lt]=p.createRenderbuffer(),p.bindRenderbuffer(p.RENDERBUFFER,et.__webglColorRenderbuffer[lt]);let bt=v.convert(ut.format,ut.colorSpace),Z=v.convert(ut.type),ht=z(ut.internalFormat,bt,Z,ut.normalized,ut.colorSpace,X.isXRRenderTarget===!0),ct=Ct(X);p.renderbufferStorageMultisample(p.RENDERBUFFER,ct,ht,X.width,X.height),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+lt,p.RENDERBUFFER,et.__webglColorRenderbuffer[lt])}if(p.bindRenderbuffer(p.RENDERBUFFER,null),X.depthBuffer)et.__webglDepthRenderbuffer=p.createRenderbuffer(),pe(et.__webglDepthRenderbuffer,X,!0);g.bindFramebuffer(p.FRAMEBUFFER,null)}}if(St){g.bindTexture(p.TEXTURE_CUBE_MAP,gt.__webglTexture),jt(p.TEXTURE_CUBE_MAP,B);for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0)for(let ut=0;ut<B.mipmaps.length;ut++)se(et.__webglFramebuffer[lt][ut],X,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,ut);else se(et.__webglFramebuffer[lt],X,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);if(U(B))N(p.TEXTURE_CUBE_MAP);else if(B.mipmaps.length>0)p.texParameteri(p.TEXTURE_CUBE_MAP,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}else if(Et){for(let lt=0,ut=ft.length;lt<ut;lt++){let bt=ft[lt],Z=_.get(bt),ht=p.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)ht=X.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(ht,Z.__webglTexture),jt(ht,bt),se(et.__webglFramebuffer,X,bt,p.COLOR_ATTACHMENT0+lt,ht,0),U(bt))N(ht)}g.unbindTexture()}else{let lt=p.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)lt=X.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(lt,gt.__webglTexture),jt(lt,B),B.mipmaps.length>0)for(let ut=0;ut<B.mipmaps.length;ut++)se(et.__webglFramebuffer[ut],X,B,p.COLOR_ATTACHMENT0,lt,ut);else se(et.__webglFramebuffer,X,B,p.COLOR_ATTACHMENT0,lt,0);if(U(B))N(lt);else if(B.mipmaps.length>0)p.texParameteri(lt,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}if(X.depthBuffer)ke(X)}function xn(X){let B=X.textures;for(let et=0,gt=B.length;et<gt;et++){let ft=B[et];if(U(ft)&&ft.mipmapsAutoUpdate===!0){let St=F(X),Et=_.get(ft).__webglTexture;g.bindTexture(St,Et),N(St),g.unbindTexture()}}}let be=[];function $e(X){if(X.samples>0){if(Le(X)===!1){let{textures:B,width:et,height:gt}=X,ft=p.COLOR_BUFFER_BIT,St=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,Et=_.get(X),lt=B.length>1;if(lt)for(let bt=0;bt<B.length;bt++)g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+bt,p.RENDERBUFFER,null),g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+bt,p.TEXTURE_2D,null,0);if(g.bindFramebuffer(p.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),X.texture.mipmaps.length>0)g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglFramebuffer[0]);else g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let bt=0;bt<B.length;bt++){if(X.resolveDepthBuffer){if(X.depthBuffer)ft|=p.DEPTH_BUFFER_BIT;if(X.stencilBuffer&&X.resolveStencilBuffer)ft|=p.STENCIL_BUFFER_BIT}if(lt){p.framebufferRenderbuffer(p.READ_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.RENDERBUFFER,Et.__webglColorRenderbuffer[bt]);let Z=_.get(B[bt]).__webglTexture;p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,Z,0)}if(p.blitFramebuffer(0,0,et,gt,0,0,et,gt,ft,p.NEAREST),b===!0){if(be.length=0,be.push(p.COLOR_ATTACHMENT0+bt),X.depthBuffer&&X.storeMultisampledDepthBuffer===!1)be.push(St);p.invalidateFramebuffer(p.READ_FRAMEBUFFER,be)}}if(g.bindFramebuffer(p.READ_FRAMEBUFFER,null),g.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),lt)for(let bt=0;bt<B.length;bt++){g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+bt,p.RENDERBUFFER,Et.__webglColorRenderbuffer[bt]);let Z=_.get(B[bt]).__webglTexture;g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+bt,p.TEXTURE_2D,Z,0)}g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(X.depthBuffer&&X.storeMultisampledDepthBuffer===!1&&b){let B=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;p.invalidateFramebuffer(p.DRAW_FRAMEBUFFER,[B])}}}function Ct(X){return Math.min(x.maxSamples,X.samples)}function Le(X){let B=_.get(X);return X.samples>0&&m.has("WEBGL_multisampled_render_to_texture")===!0&&B.__useRenderToTexture!==!1}function Zt(X){let B=y.render.frame;if(T.get(X)!==B)T.set(X,B),X.update()}function te(X,B){let{colorSpace:et,format:gt,type:ft}=X;if(X.isCompressedTexture===!0||X.isVideoTexture===!0)return B;if(et!==Kc&&et!==as)if(he.getTransfer(et)===Ce){if(gt!==kn||ft!==Zn)Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else $t("WebGLTextures: Unsupported texture color space:",et);return B}function an(X){if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement)M.width=X.naturalWidth||X.width,M.height=X.naturalHeight||X.height;else if(typeof VideoFrame<"u"&&X instanceof VideoFrame)M.width=X.displayWidth,M.height=X.displayHeight;else M.width=X.width,M.height=X.height;return M}this.allocateTextureUnit=at,this.resetTextureUnits=dt,this.getTextureUnits=_t,this.setTextureUnits=Dt,this.setTexture2D=At,this.setTexture2DArray=Ht,this.setTexture3D=Ft,this.setTextureCube=Rt,this.rebindTextures=_n,this.setupRenderTarget=j,this.updateRenderTargetMipmap=xn,this.updateMultisampleRenderTarget=$e,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=se,this.useMultisampledRTT=Le,this.dispose=Q}function zS(p,m){function g(_,x=as){let v,y=he.getTransfer(x);if(_===Zn)return p.UNSIGNED_BYTE;if(_===xc)return p.UNSIGNED_SHORT_4_4_4_4;if(_===vc)return p.UNSIGNED_SHORT_5_5_5_1;if(_===qf)return p.UNSIGNED_INT_5_9_9_9_REV;if(_===Yf)return p.UNSIGNED_INT_10F_11F_11F_REV;if(_===Wf)return p.BYTE;if(_===Xf)return p.SHORT;if(_===Dr)return p.UNSIGNED_SHORT;if(_===_c)return p.INT;if(_===Oi)return p.UNSIGNED_INT;if(_===vi)return p.FLOAT;if(_===ii)return p.HALF_FLOAT;if(_===Zf)return p.ALPHA;if(_===$f)return p.RGB;if(_===kn)return p.RGBA;if(_===Ws)return p.DEPTH_COMPONENT;if(_===Fi)return p.DEPTH_STENCIL;if(_===Jf)return p.RED;if(_===yc)return p.RED_INTEGER;if(_===os)return p.RG;if(_===Sc)return p.RG_INTEGER;if(_===bc)return p.RGBA_INTEGER;if(_===Xs||_===ea||_===qs||_===Ys)if(y===Ce)if(v=m.get("WEBGL_compressed_texture_s3tc_srgb"),v!==null){if(_===Xs)return v.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(_===ea)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(_===qs)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(_===Ys)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(v=m.get("WEBGL_compressed_texture_s3tc"),v!==null){if(_===Xs)return v.COMPRESSED_RGB_S3TC_DXT1_EXT;if(_===ea)return v.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(_===qs)return v.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(_===Ys)return v.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(_===Mc||_===Ec||_===Tc||_===wc)if(v=m.get("WEBGL_compressed_texture_pvrtc"),v!==null){if(_===Mc)return v.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(_===Ec)return v.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(_===Tc)return v.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(_===wc)return v.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(_===Ur||_===Ac||_===Rc||_===Cc||_===Pc||_===na||_===Ic)if(v=m.get("WEBGL_compressed_texture_etc"),v!==null){if(_===Ur||_===Ac)return y===Ce?v.COMPRESSED_SRGB8_ETC2:v.COMPRESSED_RGB8_ETC2;if(_===Rc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:v.COMPRESSED_RGBA8_ETC2_EAC;if(_===Cc)return v.COMPRESSED_R11_EAC;if(_===Pc)return v.COMPRESSED_SIGNED_R11_EAC;if(_===na)return v.COMPRESSED_RG11_EAC;if(_===Ic)return v.COMPRESSED_SIGNED_RG11_EAC}else return null;if(_===Lc||_===Nc||_===Dc||_===Uc||_===Oc||_===Fc||_===Bc||_===kc||_===zc||_===Hc||_===Gc||_===Vc||_===Wc||_===Xc)if(v=m.get("WEBGL_compressed_texture_astc"),v!==null){if(_===Lc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:v.COMPRESSED_RGBA_ASTC_4x4_KHR;if(_===Nc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:v.COMPRESSED_RGBA_ASTC_5x4_KHR;if(_===Dc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:v.COMPRESSED_RGBA_ASTC_5x5_KHR;if(_===Uc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:v.COMPRESSED_RGBA_ASTC_6x5_KHR;if(_===Oc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:v.COMPRESSED_RGBA_ASTC_6x6_KHR;if(_===Fc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:v.COMPRESSED_RGBA_ASTC_8x5_KHR;if(_===Bc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:v.COMPRESSED_RGBA_ASTC_8x6_KHR;if(_===kc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:v.COMPRESSED_RGBA_ASTC_8x8_KHR;if(_===zc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:v.COMPRESSED_RGBA_ASTC_10x5_KHR;if(_===Hc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:v.COMPRESSED_RGBA_ASTC_10x6_KHR;if(_===Gc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:v.COMPRESSED_RGBA_ASTC_10x8_KHR;if(_===Vc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:v.COMPRESSED_RGBA_ASTC_10x10_KHR;if(_===Wc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:v.COMPRESSED_RGBA_ASTC_12x10_KHR;if(_===Xc)return y===Ce?v.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:v.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(_===qc||_===Or||_===Fr)if(v=m.get("EXT_texture_compression_bptc"),v!==null){if(_===qc)return y===Ce?v.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:v.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(_===Or)return v.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(_===Fr)return v.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(_===Yc||_===Zc||_===ia||_===$c)if(v=m.get("EXT_texture_compression_rgtc"),v!==null){if(_===Yc)return v.COMPRESSED_RED_RGTC1_EXT;if(_===Zc)return v.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(_===ia)return v.COMPRESSED_RED_GREEN_RGTC2_EXT;if(_===$c)return v.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(_===rs)return p.UNSIGNED_INT_24_8;return p[_]!==void 0?p[_]:null}return{convert:g}}var HS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,GS=`
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

}`;class jp{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(p,m){if(this.texture===null){let g=new ma(p.texture);if(p.depthNear!==m.depthNear||p.depthFar!==m.depthFar)this.depthNear=p.depthNear,this.depthFar=p.depthFar;this.texture=g}}getMesh(p){if(this.texture!==null){if(this.mesh===null){let m=p.cameras[0].viewport,g=new Ti({vertexShader:HS,fragmentShader:GS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:m.z},depthHeight:{value:m.w}}});this.mesh=new rn(new Wr(20,20),g)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Qp extends yi{constructor(p,m){super();let g=this,_=null,x=1,v=null,y="local-floor",S=1,b=null,M=null,T=null,w=null,E=null,A=null,C=typeof XRWebGLBinding<"u",D=new jp,R={},P=m.getContextAttributes(),L=null,U=null,N=[],F=[],z=new Jt,I=null,O=null,V=new wn;V.viewport=new Oe;let q=new wn;q.viewport=new Oe;let H=[V,q],W=new Ah,J=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(at){let mt=N[at];if(mt===void 0)mt=new zr,N[at]=mt;return mt.getTargetRaySpace()},this.getControllerGrip=function(at){let mt=N[at];if(mt===void 0)mt=new zr,N[at]=mt;return mt.getGripSpace()},this.getHand=function(at){let mt=N[at];if(mt===void 0)mt=new zr,N[at]=mt;return mt.getHandSpace()};function Q(at){let mt=F.indexOf(at.inputSource);if(mt===-1)return;let At=N[mt];if(At!==void 0)At.update(at.inputSource,at.frame,b||v),At.dispatchEvent({type:at.type,data:at.inputSource})}function it(){_.removeEventListener("select",Q),_.removeEventListener("selectstart",Q),_.removeEventListener("selectend",Q),_.removeEventListener("squeeze",Q),_.removeEventListener("squeezestart",Q),_.removeEventListener("squeezeend",Q),_.removeEventListener("end",it),_.removeEventListener("inputsourceschange",tt);for(let at=0;at<N.length;at++){let mt=F[at];if(mt===null)continue;F[at]=null,N[at].disconnect(mt)}J=null,G=null,D.reset();for(let at in R)delete R[at];if(p.setRenderTarget(L),E=null,w=null,T=null,_=null,U=null,Dt.stop(),g.isPresenting=!1,p.setPixelRatio(I),p.setSize(z.width,z.height,!1),O!==null){let at=O.camera;at.fov=O.fov,at.zoom=O.zoom,at.updateProjectionMatrix(),O=null}g.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(at){if(x=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(at){if(y=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return b||v},this.setReferenceSpace=function(at){b=at},this.getBaseLayer=function(){return w!==null?w:E},this.getBinding=function(){if(T===null&&C)T=new XRWebGLBinding(_,m);return T},this.getFrame=function(){return A},this.getSession=function(){return _},this.setSession=async function(at){if(_=at,_!==null){if(L=p.getRenderTarget(),_.addEventListener("select",Q),_.addEventListener("selectstart",Q),_.addEventListener("selectend",Q),_.addEventListener("squeeze",Q),_.addEventListener("squeezestart",Q),_.addEventListener("squeezeend",Q),_.addEventListener("end",it),_.addEventListener("inputsourceschange",tt),P.xrCompatible!==!0)await m.makeXRCompatible();if(I=p.getPixelRatio(),p.getSize(z),!(C&&("createProjectionLayer"in XRWebGLBinding.prototype))){let At={antialias:P.antialias,alpha:!0,depth:P.depth,stencil:P.stencil,framebufferScaleFactor:x};E=new XRWebGLLayer(_,m,At),_.updateRenderState({baseLayer:E}),p.setPixelRatio(1),p.setSize(E.framebufferWidth,E.framebufferHeight,!1),U=new zn(E.framebufferWidth,E.framebufferHeight,{format:kn,type:Zn,colorSpace:p.outputColorSpace,stencilBuffer:P.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1,storeMultisampledDepthBuffer:E.ignoreDepthValues===!1,storeMultisampledStencilBuffer:E.ignoreDepthValues===!1})}else{let At=null,Ht=null,Ft=null;if(P.depth)Ft=P.stencil?m.DEPTH24_STENCIL8:m.DEPTH_COMPONENT24,At=P.stencil?Fi:Ws,Ht=P.stencil?rs:Oi;let Rt={colorFormat:m.RGBA8,depthFormat:Ft,scaleFactor:x};T=this.getBinding(),w=T.createProjectionLayer(Rt),_.updateRenderState({layers:[w]}),p.setPixelRatio(1),p.setSize(w.textureWidth,w.textureHeight,!1),U=new zn(w.textureWidth,w.textureHeight,{format:kn,type:Zn,depthTexture:new Hi(w.textureWidth,w.textureHeight,Ht,void 0,void 0,void 0,void 0,void 0,void 0,At),stencilBuffer:P.stencil,colorSpace:p.outputColorSpace,samples:P.antialias?4:0,resolveDepthBuffer:w.ignoreDepthValues===!1,resolveStencilBuffer:w.ignoreDepthValues===!1,storeMultisampledDepthBuffer:w.ignoreDepthValues===!1,storeMultisampledStencilBuffer:w.ignoreDepthValues===!1})}U.isXRRenderTarget=!0,this.setFoveation(S),b=null,v=await _.requestReferenceSpace(y),Dt.setContext(_),Dt.start(),g.isPresenting=!0,g.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(_!==null)return _.environmentBlendMode},this.getDepthTexture=function(){return D.getDepthTexture()};function tt(at){for(let mt=0;mt<at.removed.length;mt++){let At=at.removed[mt],Ht=F.indexOf(At);if(Ht>=0)F[Ht]=null,N[Ht].disconnect(At)}for(let mt=0;mt<at.added.length;mt++){let At=at.added[mt],Ht=F.indexOf(At);if(Ht===-1){for(let Rt=0;Rt<N.length;Rt++)if(Rt>=F.length){F.push(At),Ht=Rt;break}else if(F[Rt]===null){F[Rt]=At,Ht=Rt;break}if(Ht===-1)break}let Ft=N[Ht];if(Ft)Ft.connect(At)}}function pt(at,mt){if(mt===null)at.matrixWorld.copy(at.matrix);else at.matrixWorld.multiplyMatrices(mt.matrixWorld,at.matrix);at.matrixWorldInverse.copy(at.matrixWorld).invert()}this.updateCamera=function(at){if(_===null)return;let{near:mt,far:At}=at;if(D.texture!==null){if(D.depthNear>0)mt=D.depthNear;if(D.depthFar>0)At=D.depthFar}if(W.near=q.near=V.near=mt,W.far=q.far=V.far=At,J!==W.near||G!==W.far)_.updateRenderState({depthNear:W.near,depthFar:W.far}),J=W.near,G=W.far;W.layers.mask=at.layers.mask|6,V.layers.mask=W.layers.mask&-5,q.layers.mask=W.layers.mask&-3;let Ht=at.parent,Ft=W.cameras;pt(W,Ht);for(let Rt=0;Rt<Ft.length;Rt++)pt(Ft[Rt],Ht);if(W.projectionMatrix.copy(V.projectionMatrix),W.projectionMatrixInverse.copy(V.projectionMatrixInverse),O===null&&at.isPerspectiveCamera)O={camera:at,fov:at.fov,zoom:at.zoom};ot(at,W,Ht)};function ot(at,mt,At){if(At===null)at.matrix.copy(mt.matrixWorld);else at.matrix.copy(At.matrixWorld),at.matrix.invert(),at.matrix.multiply(mt.matrixWorld);if(at.matrix.decompose(at.position,at.quaternion,at.scale),at.updateMatrixWorld(!0),at.projectionMatrix.copy(mt.projectionMatrix),at.projectionMatrixInverse.copy(mt.projectionMatrixInverse),at.isPerspectiveCamera)at.fov=zs*2*Math.atan(1/at.projectionMatrix.elements[5]),at.zoom=1}this.getCamera=function(){return W},this.getFoveation=function(){if(w===null&&E===null)return;return S},this.setFoveation=function(at){if(S=at,w!==null)w.fixedFoveation=at;if(E!==null&&E.fixedFoveation!==void 0)E.fixedFoveation=at},this.hasDepthSensing=function(){return D.texture!==null},this.getDepthSensingMesh=function(){return D.getMesh(W)},this.getCameraTexture=function(at){return R[at]};let dt=null;function _t(at,mt){if(M=mt.getViewerPose(b||v),A=mt,M!==null){let At=M.views;if(E!==null)p.setRenderTargetFramebuffer(U,E.framebuffer),p.setRenderTarget(U);let Ht=!1;if(At.length!==W.cameras.length)W.cameras.length=0,Ht=!0;for(let Kt=0;Kt<At.length;Kt++){let Ut=At[Kt],jt=null;if(E!==null)jt=E.getViewport(Ut);else{let ge=T.getViewSubImage(w,Ut);if(jt=ge.viewport,Kt===0)p.setRenderTargetTextures(U,ge.colorTexture,ge.depthStencilTexture),p.setRenderTarget(U)}let qt=H[Kt];if(qt===void 0)qt=new wn,qt.layers.enable(Kt),qt.viewport=new Oe,H[Kt]=qt;if(qt.matrix.fromArray(Ut.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Ut.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(jt.x,jt.y,jt.width,jt.height),Kt===0)W.matrix.copy(qt.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale);if(Ht===!0)W.cameras.push(qt)}let Ft=_.enabledFeatures;if(Ft&&Ft.includes("depth-sensing")&&_.depthUsage=="gpu-optimized"&&C){T=g.getBinding();let Kt=T.getDepthInformation(At[0]);if(Kt&&Kt.isValid&&Kt.texture)D.init(Kt,_.renderState)}if(Ft&&Ft.includes("camera-access")&&C){p.state.unbindTexture(),T=g.getBinding();for(let Kt=0;Kt<At.length;Kt++){let Ut=At[Kt].camera;if(Ut){let jt=R[Ut];if(!jt)jt=new ma,R[Ut]=jt;let qt=T.getCameraImage(Ut);jt.sourceTexture=qt}}}}for(let At=0;At<N.length;At++){let Ht=F[At],Ft=N[At];if(Ht!==null&&Ft!==void 0)Ft.update(Ht,mt,b||v)}if(dt)dt(at,mt);if(mt.detectedPlanes)g.dispatchEvent({type:"planesdetected",data:mt});A=null}let Dt=new Fp;Dt.setAnimationLoop(_t),this.setAnimationLoop=function(at){dt=at},this.dispose=function(){}}}var VS=new re,tm=new Qt;tm.set(-1,0,0,0,1,0,0,0,1);function WS(p,m){function g(R,P){if(R.matrixAutoUpdate===!0)R.updateMatrix();P.value.copy(R.matrix)}function _(R,P){if(P.color.getRGB(R.fogColor.value,dh(p)),P.isFog)R.fogNear.value=P.near,R.fogFar.value=P.far;else if(P.isFogExp2)R.fogDensity.value=P.density}function x(R,P,L,U,N){if(P.isNodeMaterial)P.uniformsNeedUpdate=!1;else if(P.isMeshBasicMaterial)v(R,P);else if(P.isMeshLambertMaterial){if(v(R,P),P.envMap)R.envMapIntensity.value=P.envMapIntensity}else if(P.isMeshToonMaterial)v(R,P),w(R,P);else if(P.isMeshPhongMaterial){if(v(R,P),T(R,P),P.envMap)R.envMapIntensity.value=P.envMapIntensity}else if(P.isMeshStandardMaterial){if(v(R,P),E(R,P),P.isMeshPhysicalMaterial)A(R,P,N)}else if(P.isMeshMatcapMaterial)v(R,P),C(R,P);else if(P.isMeshDepthMaterial)v(R,P);else if(P.isMeshDistanceMaterial)v(R,P),D(R,P);else if(P.isMeshNormalMaterial)v(R,P);else if(P.isLineBasicMaterial){if(y(R,P),P.isLineDashedMaterial)S(R,P)}else if(P.isPointsMaterial)b(R,P,L,U);else if(P.isSpriteMaterial)M(R,P);else if(P.isShadowMaterial)R.color.value.copy(P.color),R.opacity.value=P.opacity;else if(P.isShaderMaterial)P.uniformsNeedUpdate=!1}function v(R,P){if(R.opacity.value=P.opacity,P.color)R.diffuse.value.copy(P.color);if(P.emissive)R.emissive.value.copy(P.emissive).multiplyScalar(P.emissiveIntensity);if(P.map)R.map.value=P.map,g(P.map,R.mapTransform);if(P.alphaMap)R.alphaMap.value=P.alphaMap,g(P.alphaMap,R.alphaMapTransform);if(P.bumpMap){if(R.bumpMap.value=P.bumpMap,g(P.bumpMap,R.bumpMapTransform),R.bumpScale.value=P.bumpScale,P.side===fn)R.bumpScale.value*=-1}if(P.normalMap){if(R.normalMap.value=P.normalMap,g(P.normalMap,R.normalMapTransform),R.normalScale.value.copy(P.normalScale),P.side===fn)R.normalScale.value.negate()}if(P.displacementMap)R.displacementMap.value=P.displacementMap,g(P.displacementMap,R.displacementMapTransform),R.displacementScale.value=P.displacementScale,R.displacementBias.value=P.displacementBias;if(P.emissiveMap)R.emissiveMap.value=P.emissiveMap,g(P.emissiveMap,R.emissiveMapTransform);if(P.specularMap)R.specularMap.value=P.specularMap,g(P.specularMap,R.specularMapTransform);if(P.alphaTest>0)R.alphaTest.value=P.alphaTest;let L=m.get(P),{envMap:U,envMapRotation:N}=L;if(U){if(R.envMap.value=U,R.envMapRotation.value.setFromMatrix4(VS.makeRotationFromEuler(N)).transpose(),U.isCubeTexture&&U.isRenderTargetTexture===!1)R.envMapRotation.value.premultiply(tm);R.reflectivity.value=P.reflectivity,R.ior.value=P.ior,R.refractionRatio.value=P.refractionRatio}if(P.lightMap)R.lightMap.value=P.lightMap,R.lightMapIntensity.value=P.lightMapIntensity,g(P.lightMap,R.lightMapTransform);if(P.aoMap)R.aoMap.value=P.aoMap,R.aoMapIntensity.value=P.aoMapIntensity,g(P.aoMap,R.aoMapTransform)}function y(R,P){if(R.diffuse.value.copy(P.color),R.opacity.value=P.opacity,P.map)R.map.value=P.map,g(P.map,R.mapTransform)}function S(R,P){R.dashSize.value=P.dashSize,R.totalSize.value=P.dashSize+P.gapSize,R.scale.value=P.scale}function b(R,P,L,U){if(R.diffuse.value.copy(P.color),R.opacity.value=P.opacity,R.size.value=P.size*L,R.scale.value=U*0.5,P.map)R.map.value=P.map,g(P.map,R.uvTransform);if(P.alphaMap)R.alphaMap.value=P.alphaMap,g(P.alphaMap,R.alphaMapTransform);if(P.alphaTest>0)R.alphaTest.value=P.alphaTest}function M(R,P){if(R.diffuse.value.copy(P.color),R.opacity.value=P.opacity,R.rotation.value=P.rotation,P.map)R.map.value=P.map,g(P.map,R.mapTransform);if(P.alphaMap)R.alphaMap.value=P.alphaMap,g(P.alphaMap,R.alphaMapTransform);if(P.alphaTest>0)R.alphaTest.value=P.alphaTest}function T(R,P){R.specular.value.copy(P.specular),R.shininess.value=Math.max(P.shininess,0.0001)}function w(R,P){if(P.gradientMap)R.gradientMap.value=P.gradientMap}function E(R,P){if(R.metalness.value=P.metalness,P.metalnessMap)R.metalnessMap.value=P.metalnessMap,g(P.metalnessMap,R.metalnessMapTransform);if(R.roughness.value=P.roughness,P.roughnessMap)R.roughnessMap.value=P.roughnessMap,g(P.roughnessMap,R.roughnessMapTransform);if(P.envMap)R.envMapIntensity.value=P.envMapIntensity}function A(R,P,L){if(R.ior.value=P.ior,P.diffuseRoughness>0){if(R.diffuseRoughness.value=P.diffuseRoughness,P.diffuseRoughnessMap)R.diffuseRoughnessMap.value=P.diffuseRoughnessMap,g(P.diffuseRoughnessMap,R.diffuseRoughnessMapTransform)}if(P.sheen>0){if(R.sheenColor.value.copy(P.sheenColor).multiplyScalar(P.sheen),R.sheenRoughness.value=P.sheenRoughness,P.sheenColorMap)R.sheenColorMap.value=P.sheenColorMap,g(P.sheenColorMap,R.sheenColorMapTransform);if(P.sheenRoughnessMap)R.sheenRoughnessMap.value=P.sheenRoughnessMap,g(P.sheenRoughnessMap,R.sheenRoughnessMapTransform)}if(P.clearcoat>0){if(R.clearcoat.value=P.clearcoat,R.clearcoatRoughness.value=P.clearcoatRoughness,P.clearcoatMap)R.clearcoatMap.value=P.clearcoatMap,g(P.clearcoatMap,R.clearcoatMapTransform);if(P.clearcoatRoughnessMap)R.clearcoatRoughnessMap.value=P.clearcoatRoughnessMap,g(P.clearcoatRoughnessMap,R.clearcoatRoughnessMapTransform);if(P.clearcoatNormalMap){if(R.clearcoatNormalMap.value=P.clearcoatNormalMap,g(P.clearcoatNormalMap,R.clearcoatNormalMapTransform),R.clearcoatNormalScale.value.copy(P.clearcoatNormalScale),P.side===fn)R.clearcoatNormalScale.value.negate()}}if(P.dispersion>0)R.dispersion.value=P.dispersion;if(P.retroreflectivity>0)R.retroreflectivity.value=P.retroreflectivity;if(P.iridescence>0){if(R.iridescence.value=P.iridescence,R.iridescenceIOR.value=P.iridescenceIOR,R.iridescenceThicknessMinimum.value=P.iridescenceThicknessMinimum,R.iridescenceThicknessMaximum.value=P.iridescenceThicknessMaximum,P.iridescenceMap)R.iridescenceMap.value=P.iridescenceMap,g(P.iridescenceMap,R.iridescenceMapTransform);if(P.iridescenceThicknessMap)R.iridescenceThicknessMap.value=P.iridescenceThicknessMap,g(P.iridescenceThicknessMap,R.iridescenceThicknessMapTransform)}if(P.transmission>0){if(R.transmission.value=P.transmission,R.transmissionSamplerMap.value=L.texture,R.transmissionSamplerSize.value.set(L.width,L.height),P.transmissionMap)R.transmissionMap.value=P.transmissionMap,g(P.transmissionMap,R.transmissionMapTransform);if(R.thickness.value=P.thickness,P.thicknessMap)R.thicknessMap.value=P.thicknessMap,g(P.thicknessMap,R.thicknessMapTransform);R.attenuationDistance.value=P.attenuationDistance,R.attenuationColor.value.copy(P.attenuationColor)}if(P.anisotropy>0){if(R.anisotropyVector.value.set(P.anisotropy*Math.cos(P.anisotropyRotation),P.anisotropy*Math.sin(P.anisotropyRotation)),P.anisotropyMap)R.anisotropyMap.value=P.anisotropyMap,g(P.anisotropyMap,R.anisotropyMapTransform)}if(R.specularIntensity.value=P.specularIntensity,R.specularColor.value.copy(P.specularColor),P.specularColorMap)R.specularColorMap.value=P.specularColorMap,g(P.specularColorMap,R.specularColorMapTransform);if(P.specularIntensityMap)R.specularIntensityMap.value=P.specularIntensityMap,g(P.specularIntensityMap,R.specularIntensityMapTransform)}function C(R,P){if(P.matcap)R.matcap.value=P.matcap}function D(R,P){let L=m.get(P).light;R.referencePosition.value.setFromMatrixPosition(L.matrixWorld),R.nearDistance.value=L.shadow.camera.near,R.farDistance.value=L.shadow.camera.far}return{refreshFogUniforms:_,refreshMaterialUniforms:x}}function XS(p,m,g,_){let x={},v={};function y(L,U){let N=U.program;_.uniformBlockBinding(L,N,x[L.id])}function S(L,U){let N=x[L.id];if(N===void 0)C(L),N=b(L),x[L.id]=N,L.addEventListener("dispose",R);let F=U.program;_.updateUBOMapping(L,F);let z=m.render.frame;if(v[L.id]!==z)M(L),v[L.id]=z}function b(L){let U=p.createBuffer(),{__size:N,usage:F}=L;return p.bindBuffer(p.UNIFORM_BUFFER,U),p.bufferData(p.UNIFORM_BUFFER,N,F),p.bindBuffer(p.UNIFORM_BUFFER,null),U}function M(L){let U=x[L.id],{uniforms:N,__cache:F}=L;p.bindBuffer(p.UNIFORM_BUFFER,U);for(let z=0,I=N.length;z<I;z++){let O=N[z];if(Array.isArray(O))for(let V=0,q=O.length;V<q;V++)T(O[V],z,V,F);else T(O,z,0,F)}p.bindBuffer(p.UNIFORM_BUFFER,null)}function T(L,U,N,F){if(E(L,U,N,F)===!0){let{__offset:z,value:I}=L;if(Array.isArray(I)){let O=0;for(let V=0;V<I.length;V++){let q=I[V],H=D(q,!0);w(q,L.__data,O),O+=H.storage/Float32Array.BYTES_PER_ELEMENT}}else w(I,L.__data,0);p.bufferSubData(p.UNIFORM_BUFFER,z,L.__data)}}function w(L,U,N){if(typeof L==="number"||typeof L==="boolean")U[N]=L;else if(L.isMatrix3)U[N]=L.elements[0],U[N+1]=L.elements[1],U[N+2]=L.elements[2],U[N+3]=0,U[N+4]=L.elements[3],U[N+5]=L.elements[4],U[N+6]=L.elements[5],U[N+7]=0,U[N+8]=L.elements[6],U[N+9]=L.elements[7],U[N+10]=L.elements[8],U[N+11]=0;else if(ArrayBuffer.isView(L))U.set(L.subarray(0,U.length-N),N);else L.toArray(U,N)}function E(L,U,N,F){let z=L.value,I=U+"_"+N;if(Array.isArray(z)){if(F[I]===void 0)F[I]=[];let O=F[I],V=!1;for(let q=0;q<z.length;q++)if(A(z[q],O,q)===!0)V=!0;return V}return A(z,F,I)}function A(L,U,N){if(U[N]===void 0){if(typeof L==="number"||typeof L==="boolean")U[N]=L;else if(ArrayBuffer.isView(L))U[N]=L.slice();else U[N]=L.clone();return!0}else{let F=U[N];if(typeof L==="number"||typeof L==="boolean"){if(F!==L)return U[N]=L,!0}else if(ArrayBuffer.isView(L))return!0;else if(F.equals(L)===!1)return F.copy(L),!0}return!1}function C(L){let U=L.uniforms,N=0,F=16;for(let I=0,O=U.length;I<O;I++){let V=Array.isArray(U[I])?U[I]:[U[I]];for(let q=0,H=V.length;q<H;q++){let W=V[q],J=Array.isArray(W.value)?W.value:[W.value],G=Array.isArray(U[I])||Array.isArray(W.value),Q=N;for(let tt=0,pt=J.length;tt<pt;tt++){let ot=J[tt],dt=D(ot,G),_t=N%F,Dt=_t%dt.boundary,at=_t+Dt;if(N+=Dt,at!==0&&F-at<dt.storage)N+=F-at;if(tt===0)Q=N;N+=dt.storage}let it=W.type==="int"?Int32Array:W.type==="uint"?Uint32Array:Float32Array;W.__data=new it((N-Q)/Float32Array.BYTES_PER_ELEMENT),W.__offset=Q}}let z=N%F;if(z>0)N+=F-z;return L.__size=N,L.__cache={},this}function D(L,U){let N={boundary:0,storage:0};if(typeof L==="number"||typeof L==="boolean")N.boundary=4,N.storage=4;else if(L.isVector2)N.boundary=8,N.storage=8;else if(L.isVector3||L.isColor)N.boundary=16,N.storage=12;else if(L.isVector4)N.boundary=16,N.storage=16;else if(L.isMatrix3)N.boundary=16,N.storage=48;else if(L.isMatrix4)N.boundary=16,N.storage=64;else if(L.isTexture)Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(L))N.boundary=16,N.storage=L.byteLength;else Xt("WebGLRenderer: Unsupported uniform value type.",L);if(U===!0)N.boundary=16,N.storage=Math.ceil(N.storage/16)*16;return N}function R(L){let U=L.target;U.removeEventListener("dispose",R),p.deleteBuffer(x[U.id]),delete x[U.id],delete v[U.id]}function P(){for(let L in x)p.deleteBuffer(x[L]);x={},v={}}return{bind:y,update:S,dispose:P}}var qS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),si=null;function YS(){if(si===null)si=new Bs(qS,16,16,os,ii),si.name="DFG_LUT",si.minFilter=An,si.magFilter=An,si.wrapS=Qo,si.wrapT=Qo,si.generateMipmaps=!1,si.needsUpdate=!0;return si}class Dh{constructor(p={}){let{canvas:m=ip(),context:g=null,depth:_=!0,stencil:x=!1,alpha:v=!1,antialias:y=!1,premultipliedAlpha:S=!0,preserveDrawingBuffer:b=!1,powerPreference:M="default",failIfMajorPerformanceCaveat:T=!1,reversedDepthBuffer:w=!1,outputBufferType:E=Zn}=p;this.isWebGLRenderer=!0;let A;if(g!==null){if(typeof WebGLRenderingContext<"u"&&g instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");A=g.getContextAttributes().alpha}else A=v;let C=E,D=new Set([bc,Sc,yc]),R=new Set([Zn,Oi,Dr,rs,xc,vc]),P=new Uint32Array(4),L=new Int32Array(4),U={textures:[],min:[],max:[],resolution:[]},N=null,F=null,z=[],I=[],O=null;this.domElement=m,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ni,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let V=this,q=!1,H=null,W=null,J=null,G=null;this._outputColorSpace=sa;let Q=0,it=0,tt=null,pt=-1,ot=null,dt=new Oe,_t=new Oe,Dt=null,at=new oe(0),mt=0,{width:At,height:Ht}=m,Ft=1,Rt=null,ae=null,Kt=new Oe(0,0,At,Ht),Ut=new Oe(0,0,At,Ht),jt=!1,qt=new Di,ge=new Hr,xt=!1,Yt=!1,ie=new re,se=new Y,pe=new Oe,Be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ke=!1;function _n(){return tt===null?Ft:1}let j=g;function xn(k,K){return m.getContext(k,K)}let be,$e,Ct,Le,Zt,te,an,X,B,et,gt,ft,St,Et,lt,ut,bt,Z,ht,ct,vt,yt,wt;try{let k={alpha:!0,depth:_,stencil:x,antialias:y,premultipliedAlpha:S,preserveDrawingBuffer:b,powerPreference:M,failIfMajorPerformanceCaveat:T};if("setAttribute"in m)m.setAttribute("data-engine",`three.js r${is}`);if(m.addEventListener("webglcontextlost",It,!1),m.addEventListener("webglcontextrestored",Wt,!1),m.addEventListener("webglcontextcreationerror",le,!1),j===null){if(j=xn("webgl2",k),j===null)if(xn("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Vt()}catch(k){throw m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",le,!1),$t("WebGLRenderer: "+k.message),k}function Vt(){if(be=new sy(j),be.init(),vt=new zS(j,be),$e=new Yv(j,be,p,vt),Ct=new BS(j,be),$e.reversedDepthBuffer&&w)Ct.buffers.depth.setReversed(!0);W=j.createFramebuffer(),J=j.createFramebuffer(),G=j.createFramebuffer(),Le=new ay(j),Zt=new ES,te=new kS(j,be,Ct,Zt,$e,vt,Le),an=new iy(V),X=new c0(j),yt=new Xv(j,X),B=new ry(j,X,Le,yt),et=new cy(j,B,X,yt,Le),Z=new ly(j,$e,te),lt=new Zv(Zt),gt=new MS(V,an,be,$e,yt,lt),ft=new WS(V,Zt),St=new wS,Et=new LS(be),bt=new Wv(V,an,Ct,et,A,S),ut=new FS(V,et,$e),wt=new XS(j,Le,$e,Ct),ht=new qv(j,be,Le),ct=new oy(j,be,Le),Le.programs=gt.programs,V.capabilities=$e,V.extensions=be,V.properties=Zt,V.renderLists=St,V.shadowMap=ut,V.state=Ct,V.info=Le}if(C!==Zn)O=new uy(C,m.width,m.height,y,_,x);let Gt=new Qp(V,j);this.xr=Gt,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){let k=be.get("WEBGL_lose_context");if(k)k.loseContext()},this.forceContextRestore=function(){let k=be.get("WEBGL_lose_context");if(k)k.restoreContext()},this.getPixelRatio=function(){return Ft},this.setPixelRatio=function(k){if(k===void 0)return;Ft=k,this.setSize(At,Ht,!1)},this.getSize=function(k){return k.set(At,Ht)},this.setSize=function(k,K,rt=!0){if(Gt.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(At=k,Ht=K,m.width=Math.floor(k*Ft),m.height=Math.floor(K*Ft),rt===!0)m.style.width=k+"px",m.style.height=K+"px";if(O!==null)O.setSize(m.width,m.height);this.setViewport(0,0,k,K)},this.getDrawingBufferSize=function(k){return k.set(At*Ft,Ht*Ft).floor()},this.setDrawingBufferSize=function(k,K,rt){At=k,Ht=K,Ft=rt,m.width=Math.floor(k*rt),m.height=Math.floor(K*rt),this.setViewport(0,0,k,K)},this.setEffects=function(k){if(C===Zn){$t("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(k){for(let K=0;K<k.length;K++)if(k[K].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}O.setEffects(k||[])},this.getCurrentViewport=function(k){return k.copy(dt)},this.getViewport=function(k){return k.copy(Kt)},this.setViewport=function(k,K,rt,nt){if(k.isVector4)Kt.set(k.x,k.y,k.z,k.w);else Kt.set(k,K,rt,nt);Ct.viewport(dt.copy(Kt).multiplyScalar(_n()).round())},this.getScissor=function(k){return k.copy(Ut)},this.setScissor=function(k,K,rt,nt){if(k.isVector4)Ut.set(k.x,k.y,k.z,k.w);else Ut.set(k,K,rt,nt);Ct.scissor(_t.copy(Ut).multiplyScalar(_n()).round())},this.getScissorTest=function(){return jt},this.setScissorTest=function(k){Ct.setScissorTest(jt=k)},this.setOpaqueSort=function(k){Rt=k},this.setTransparentSort=function(k){ae=k},this.getClearColor=function(k){return k.copy(bt.getClearColor())},this.setClearColor=function(){bt.setClearColor(...arguments)},this.getClearAlpha=function(){return bt.getClearAlpha()},this.setClearAlpha=function(){bt.setClearAlpha(...arguments)},this.clear=function(k=!0,K=!0,rt=!0){let nt=0;if(k){let st=!1;if(tt!==null){let Tt=tt.texture.format;st=D.has(Tt)}if(st){let Tt=tt.texture.type,Ot=R.has(Tt),Mt=bt.getClearColor(),Nt=bt.getClearAlpha(),{r:zt,g:ee,b:de}=Mt;if(Ot)P[0]=zt,P[1]=ee,P[2]=de,P[3]=Nt,j.clearBufferuiv(j.COLOR,0,P);else L[0]=zt,L[1]=ee,L[2]=de,L[3]=Nt,j.clearBufferiv(j.COLOR,0,L)}else nt|=j.COLOR_BUFFER_BIT}if(K)nt|=j.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(rt)nt|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(nt!==0)j.clear(nt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(k){k.setRenderer(this),H=k},this.dispose=function(){m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",le,!1),bt.dispose(),St.dispose(),Et.dispose(),te.dispose(),Zt.dispose(),an.dispose(),et.dispose(),B.dispose(),yt.dispose(),wt.dispose(),gt.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",fu),Gt.removeEventListener("sessionend",pu),qi.stop()};function It(k){k.preventDefault(),Cr("WebGLRenderer: Context Lost."),q=!0}function Wt(){Cr("WebGLRenderer: Context Restored."),q=!1;let k=Le.autoReset,K=ut.enabled,rt=ut.autoUpdate,nt=ut.needsUpdate,st=ut.type;Vt(),Le.autoReset=k,ut.enabled=K,ut.autoUpdate=rt,ut.needsUpdate=nt,ut.type=st}function le(k){$t("WebGLRenderer: A WebGL context could not be created. Reason: ",k.statusMessage)}function Lt(k){let K=k.target;K.removeEventListener("dispose",Lt),Te(K)}function Te(k){Je(k),Zt.remove(k)}function Je(k){let K=Zt.get(k).programs;if(K!==void 0){if(K.forEach(function(rt){gt.releaseProgram(rt)}),k.isShaderMaterial)gt.releaseShaderCache(k)}}this.renderBufferDirect=function(k,K,rt,nt,st,Tt){if(K===null)K=Be;let Ot=st.isMesh&&st.matrixWorld.determinantAffine()<0,Mt=dg(k,K,rt,nt,st);Ct.setMaterial(nt,Ot);let Nt=rt.index,zt=1;if(nt.wireframe===!0){if(Nt=B.getWireframeAttribute(rt),Nt===void 0)return;zt=2}let ee=rt.drawRange,de=rt.attributes.position,Bt=ee.start*zt,fe=(ee.start+ee.count)*zt;if(Tt!==null)Bt=Math.max(Bt,Tt.start*zt),fe=Math.min(fe,(Tt.start+Tt.count)*zt);if(Nt!==null)Bt=Math.max(Bt,0),fe=Math.min(fe,Nt.count);else if(de!==void 0&&de!==null)Bt=Math.max(Bt,0),fe=Math.min(fe,de.count);let ze=fe-Bt;if(ze<0||ze===1/0)return;yt.setup(st,nt,Mt,rt,Nt);let Ne,Re=ht;if(Nt!==null)Ne=X.get(Nt),Re=ct,Re.setIndex(Ne);if(st.isMesh)if(nt.wireframe===!0)Ct.setLineWidth(nt.wireframeLinewidth*_n()),Re.setMode(j.LINES);else Re.setMode(j.TRIANGLES);else if(st.isLine){let ln=nt.linewidth;if(ln===void 0)ln=1;if(Ct.setLineWidth(ln*_n()),st.isLineSegments)Re.setMode(j.LINES);else if(st.isLineLoop)Re.setMode(j.LINE_LOOP);else Re.setMode(j.LINE_STRIP)}else if(st.isPoints)Re.setMode(j.POINTS);else if(st.isSprite)Re.setMode(j.TRIANGLES);if(st.isBatchedMesh)if(!be.get("WEBGL_multi_draw")){let{_multiDrawStarts:ln,_multiDrawCounts:kt,_multiDrawCount:vn}=st,xe=Nt?X.get(Nt).bytesPerElement:1,Yi=Zt.get(nt).currentProgram.getUniforms();for(let cn=0;cn<vn;cn++)Yi.setValue(j,"_gl_DrawID",cn),Re.render(ln[cn]/xe,kt[cn])}else Re.renderMultiDraw(st._multiDrawStarts,st._multiDrawCounts,st._multiDrawCount);else if(st.isInstancedMesh)Re.renderInstances(Bt,ze,st.count);else if(rt.isInstancedBufferGeometry){let ln=rt._maxInstanceCount!==void 0?rt._maxInstanceCount:1/0,kt=Math.min(rt.instanceCount,ln);Re.renderInstances(Bt,ze,kt)}else Re.render(Bt,ze)};function li(k,K,rt,nt){if(H!==null&&k.isNodeMaterial)H.setObject(nt,k);if(xt===!0)lt.setState(k,rt,!1);if(k.transparent===!0&&k.side===Bn&&k.forceSinglePass===!1)k.side=fn,k.needsUpdate=!0,fr(k,K,nt),k.side=xi,k.needsUpdate=!0,fr(k,K,nt),k.side=Bn;else fr(k,K,nt)}this.compile=function(k,K,rt=null){if(rt===null)rt=k;if(H!==null)H.renderStart(k,K,rt);if(F=Et.get(rt),F.init(K),I.push(F),rt.traverseVisible(function(st){if(st.isLight&&st.layers.test(K.layers)){if(F.pushLight(st),st.castShadow)F.pushShadow(st)}}),k!==rt)k.traverseVisible(function(st){if(st.isLight&&st.layers.test(K.layers)){if(F.pushLight(st),st.castShadow)F.pushShadow(st)}});if(F.setupLights(),H!==null)H.updateLights(F.state.lightsArray);if(Yt=this.localClippingEnabled,xt=lt.init(this.clippingPlanes,Yt),xt===!0)lt.setGlobalState(this.clippingPlanes,K);if(H!==null)ut.render(F.state.shadowsArray,rt,K);let nt=new Set;if(k.traverse(function(st){if(!(st.isMesh||st.isPoints||st.isLine||st.isSprite))return;let Tt=st.material;if(Tt)if(Array.isArray(Tt))for(let Ot=0;Ot<Tt.length;Ot++){let Mt=Tt[Ot];li(Mt,rt,K,st),nt.add(Mt)}else li(Tt,rt,K,st),nt.add(Tt)}),F=I.pop(),H!==null)H.renderEnd();return nt},this.compileAsync=function(k,K,rt=null){let nt=this.compile(k,K,rt);return new Promise((st)=>{function Tt(){if(nt.forEach(function(Ot){let Nt=Zt.get(Ot).currentProgram;if(Nt===void 0||Nt.isReady())nt.delete(Ot)}),nt.size===0){st(k);return}setTimeout(Tt,10)}if(be.get("KHR_parallel_shader_compile")!==null)Tt();else setTimeout(Tt,10)})};let rl=null;function hg(k){if(rl)rl(k)}function fu(){qi.stop()}function pu(){qi.start()}let qi=new Fp;if(qi.setAnimationLoop(hg),typeof self<"u")qi.setContext(self);this.setAnimationLoop=function(k){rl=k,Gt.setAnimationLoop(k),k===null?qi.stop():qi.start()},Gt.addEventListener("sessionstart",fu),Gt.addEventListener("sessionend",pu),this.render=function(k,K){if(K!==void 0&&K.isCamera!==!0){$t("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(q===!0)return;if(H!==null)H.renderStart(k,K);let rt=Gt.enabled===!0&&Gt.isPresenting===!0,nt=O!==null&&(tt===null||rt)&&O.begin(V,tt);if(k.matrixWorldAutoUpdate===!0)k.updateMatrixWorld();if(K.parent===null&&K.matrixWorldAutoUpdate===!0)K.updateMatrixWorld();if(Gt.enabled===!0&&Gt.isPresenting===!0&&(O===null||O.isCompositing()===!1)){if(Gt.cameraAutoUpdate===!0)Gt.updateCamera(K);K=Gt.getCamera()}if(k.isScene===!0)k.onBeforeRender(V,k,K,tt);if(F=Et.get(k,I.length),F.init(K),F.state.textureUnits=te.getTextureUnits(),I.push(F),ie.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),K.isArrayCamera)ge.setFromArrayCamera(K);else qt.setFromProjectionMatrix(ie,ih,K.reversedDepth);if(Yt=this.localClippingEnabled,xt=lt.init(this.clippingPlanes,Yt),N=St.get(k,z.length),N.init(),z.push(N),this.info.render.frame++,Gt.enabled===!0&&Gt.isPresenting===!0){let Ot=V.xr.getDepthSensingMesh();if(Ot!==null)ol(Ot,K,-1/0,V.sortObjects)}if(ol(k,K,0,V.sortObjects),N.finish(),H!==null)H.updateLights(F.state.lightsArray);if(V.sortObjects===!0)N.sort(Rt,ae);if(ke=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,ke)bt.addToRenderList(N,k);if(this.info.autoReset===!0)this.info.reset();if(xt===!0)lt.beginShadows();let st=F.state.shadowsArray;if(ut.render(st,k,K),xt===!0)lt.endShadows();if((nt&&O.hasRenderPass())===!1){let Ot=N.opaque,Mt=N.transmissive;if(F.setupLights(),K.isArrayCamera){let Nt=K.cameras;if(Mt.length>0)for(let zt=0,ee=Nt.length;zt<ee;zt++){let de=Nt[zt];gu(Ot,Mt,k,de)}if(ke)bt.render(k);for(let zt=0,ee=Nt.length;zt<ee;zt++){let de=Nt[zt];mu(N,k,de,de.viewport)}}else{if(Mt.length>0)gu(Ot,Mt,k,K);if(ke)bt.render(k);mu(N,k,K)}}if(tt!==null&&it===0)te.updateMultisampleRenderTarget(tt),te.updateRenderTargetMipmap(tt);if(nt)O.end(V);if(k.isScene===!0)k.onAfterRender(V,k,K);if(yt.resetDefaultState(),pt=-1,ot=null,I.pop(),I.length>0){if(F=I[I.length-1],te.setTextureUnits(F.state.textureUnits),xt===!0)lt.setGlobalState(V.clippingPlanes,F.state.camera)}else F=null;if(z.pop(),z.length>0)N=z[z.length-1];else N=null;if(H!==null)H.renderEnd()};function ol(k,K,rt,nt){if(k.visible===!1)return;if(k.layers.test(K.layers)){if(k.isGroup)rt=k.renderOrder;else if(k.isLOD){if(k.autoUpdate===!0)k.update(K)}else if(k.isLight){if(F.pushLight(k),k.castShadow)F.pushShadow(k)}else if(k.isSprite){let Ot=K.isArrayCamera?ge:qt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){if(nt)pe.setFromMatrixPosition(k.matrixWorld).applyMatrix4(ie);let Mt=et.update(k),Nt=k.material;if(Nt.visible)N.push(k,Mt,Nt,rt,pe.z,null,K)}}else if(k.isMesh||k.isLine||k.isPoints){let Ot=K.isArrayCamera?ge:qt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){let Mt=et.update(k),Nt=k.material;if(nt){if(k.boundingSphere!==void 0){if(k.boundingSphere===null)k.computeBoundingSphere();pe.copy(k.boundingSphere.center)}else{if(Mt.boundingSphere===null)Mt.computeBoundingSphere();pe.copy(Mt.boundingSphere.center)}pe.applyMatrix4(k.matrixWorld).applyMatrix4(ie)}if(Array.isArray(Nt)){let zt=Mt.groups;for(let ee=0,de=zt.length;ee<de;ee++){let Bt=zt[ee],fe=Nt[Bt.materialIndex];if(fe&&fe.visible)N.push(k,Mt,fe,rt,pe.z,Bt,K)}}else if(Nt.visible)N.push(k,Mt,Nt,rt,pe.z,null,K)}}}let Tt=k.children;for(let Ot=0,Mt=Tt.length;Ot<Mt;Ot++)ol(Tt[Ot],K,rt,nt)}function mu(k,K,rt,nt){let{opaque:st,transmissive:Tt,transparent:Ot}=k;if(F.setupLightsView(rt),xt===!0)lt.setGlobalState(V.clippingPlanes,rt);if(nt)Ct.viewport(dt.copy(nt));if(st.length>0)co(st,K,rt);if(Tt.length>0)co(Tt,K,rt);if(Ot.length>0)co(Ot,K,rt);Ct.buffers.depth.setTest(!0),Ct.buffers.depth.setMask(!0),Ct.buffers.color.setMask(!0),Ct.setPolygonOffset(!1)}function gu(k,K,rt,nt){if((rt.isScene===!0?rt.overrideMaterial:null)!==null)return;if(F.state.transmissionRenderTarget[nt.id]===void 0){let Bt=be.has("EXT_color_buffer_half_float")||be.has("EXT_color_buffer_float");F.state.transmissionRenderTarget[nt.id]=new zn(1,1,{generateMipmaps:!0,type:Bt?ii:Zn,minFilter:Yn,samples:Math.max(4,$e.samples),stencilBuffer:x,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:he.workingColorSpace})}let Tt=F.state.transmissionRenderTarget[nt.id],Ot=nt.viewport||dt;Tt.setSize(Ot.z*V.transmissionResolutionScale,Ot.w*V.transmissionResolutionScale);let Mt=V.getRenderTarget(),Nt=V.getActiveCubeFace(),zt=V.getActiveMipmapLevel();if(V.setRenderTarget(Tt),V.getClearColor(at),mt=V.getClearAlpha(),mt<1)V.setClearColor(16777215,0.5);if(V.clear(),ke)bt.render(rt);let ee=V.toneMapping;V.toneMapping=ni;let de=nt.viewport;if(nt.viewport!==void 0)nt.viewport=void 0;if(F.setupLightsView(nt),xt===!0)lt.setGlobalState(V.clippingPlanes,nt);if(co(k,rt,nt),te.updateMultisampleRenderTarget(Tt),te.updateRenderTargetMipmap(Tt),be.has("WEBGL_multisampled_render_to_texture")===!1){let Bt=!1;for(let fe=0,ze=K.length;fe<ze;fe++){let Ne=K[fe],{object:Re,geometry:ln,material:kt,group:vn}=Ne;if(kt.side===Bn&&Re.layers.test(nt.layers)){let xe=kt.side;kt.side=fn,kt.needsUpdate=!0,_u(Re,rt,nt,ln,kt,vn),kt.side=xe,kt.needsUpdate=!0,Bt=!0}}if(Bt===!0)te.updateMultisampleRenderTarget(Tt),te.updateRenderTargetMipmap(Tt)}if(V.setRenderTarget(Mt,Nt,zt),V.setClearColor(at,mt),de!==void 0)nt.viewport=de;V.toneMapping=ee}function co(k,K,rt){let nt=K.isScene===!0?K.overrideMaterial:null;for(let st=0,Tt=k.length;st<Tt;st++){let Ot=k[st],{object:Mt,geometry:Nt,group:zt}=Ot,ee=Ot.material;if(ee.allowOverride===!0&&nt!==null)ee=nt;if(Mt.layers.test(rt.layers))_u(Mt,K,rt,Nt,ee,zt)}}function _u(k,K,rt,nt,st,Tt){if(H!==null&&st.isNodeMaterial)H.setObject(k,st);if(k.onBeforeRender(V,K,rt,nt,st,Tt),k.modelViewMatrix.multiplyMatrices(rt.matrixWorldInverse,k.matrixWorld),k.normalMatrix.getNormalMatrix(k.modelViewMatrix),st.onBeforeRender(V,K,rt,nt,k,Tt),st.transparent===!0&&st.side===Bn&&st.forceSinglePass===!1)st.side=fn,st.needsUpdate=!0,V.renderBufferDirect(rt,K,nt,st,k,Tt),st.side=xi,st.needsUpdate=!0,V.renderBufferDirect(rt,K,nt,st,k,Tt),st.side=Bn;else V.renderBufferDirect(rt,K,nt,st,k,Tt);k.onAfterRender(V,K,rt,nt,st,Tt)}function xu(k){let K=0;for(let rt of k)if(rt.texture!==null)K++;return K}function fr(k,K,rt){if(K.isScene!==!0)K=Be;let nt=Zt.get(k),st=F.state.lights,Tt=F.state.shadowsArray,Ot=st.state.version,Mt=gt.getParameters(k,st.state,Tt,K,rt,F.state.lightProbeGridArray),Nt=gt.getProgramCacheKey(Mt),zt=nt.programs;nt.environment=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?K.environment:null,nt.fog=K.fog;let ee=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap;if(nt.envMap=an.get(k.envMap||nt.environment,ee),nt.envMapRotation=nt.environment!==null&&k.envMap===null?K.environmentRotation:k.envMapRotation,zt===void 0)k.addEventListener("dispose",Lt),zt=new Map,nt.programs=zt,nt.programVariants=new Map;let de=zt.get(Nt);if(de!==void 0){if(nt.currentProgram===de&&nt.lightsStateVersion===Ot)return yu(k,Mt),de}else{if(Mt.uniforms=gt.getUniforms(k),H!==null&&k.isNodeMaterial)H.build(k,rt,Mt);k.onBeforeCompile(Mt,V),de=gt.acquireProgram(Mt,Nt),zt.set(Nt,de),nt.uniforms=Mt.uniforms}let Bt=nt.uniforms;if(!k.isShaderMaterial&&!k.isRawShaderMaterial||k.clipping===!0)Bt.clippingPlanes=lt.uniform;if(yu(k,Mt),nt.needsLights=pg(k),nt.lightsStateVersion=Ot,nt.needsLights)Bt.ambientLightColor.value=st.state.ambient,Bt.lightProbe.value=st.state.probe,Bt.sunLights.value=st.state.sun,Bt.sunLightShadows.value=st.state.sunShadow,Bt.directionalLights.value=st.state.directional,Bt.directionalLightShadows.value=st.state.directionalShadow,Bt.spotLights.value=st.state.spot,Bt.spotLightShadows.value=st.state.spotShadow,Bt.rectAreaLights.value=st.state.rectArea,Bt.ltc_1.value=st.state.rectAreaLTC1,Bt.ltc_2.value=st.state.rectAreaLTC2,Bt.pointLights.value=st.state.point,Bt.pointLightShadows.value=st.state.pointShadow,Bt.hemisphereLights.value=st.state.hemi,Bt.sunShadowMatrix.value=st.state.sunShadowMatrix,Bt.sunShadowCascade.value=st.state.sunShadowCascade,Bt.directionalShadowMatrix.value=st.state.directionalShadowMatrix,Bt.spotLightMatrix.value=st.state.spotLightMatrix,Bt.spotLightMap.value=st.state.spotLightMap,Bt.pointShadowMatrix.value=st.state.pointShadowMatrix;return nt.numLightProbeGrids=xu(F.state.lightProbeGridArray),nt.currentProgram=de,nt.uniformsList=null,de}function ug(k,K,rt,nt,st){let Tt=Zt.get(k),Ot=Tt.currentProgram.id+","+nt+","+st,Mt=Tt.programVariants.get(Ot);if(Mt===void 0)Mt=fr(k,K,rt),Tt.programVariants.set(Ot,Mt);else Tt.currentProgram=Mt,Tt.uniformsList=null,Tt.outputColorSpace=nt,Tt.toneMapping=st;return Mt}function vu(k){if(k.uniformsList===null){let K=k.currentProgram.getUniforms();k.uniformsList=Jr.seqWithValue(K.seq,k.uniforms)}return k.uniformsList}function yu(k,K){let rt=Zt.get(k);rt.outputColorSpace=K.outputColorSpace,rt.batching=K.batching,rt.batchingColor=K.batchingColor,rt.instancing=K.instancing,rt.instancingColor=K.instancingColor,rt.instancingMorph=K.instancingMorph,rt.skinning=K.skinning,rt.morphTargets=K.morphTargets,rt.morphNormals=K.morphNormals,rt.morphColors=K.morphColors,rt.morphTargetsCount=K.morphTargetsCount,rt.numClippingPlanes=K.numClippingPlanes,rt.numIntersection=K.numClipIntersection,rt.vertexAlphas=K.vertexAlphas,rt.vertexTangents=K.vertexTangents,rt.toneMapping=K.toneMapping}function dg(k,K,rt,nt,st){if(K.isScene!==!0)K=Be;te.resetTextureUnits();let Tt=K.fog,Ot=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial?K.environment:null,Mt=tt===null?V.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:he.workingColorSpace,Nt=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial&&!nt.envMap||nt.isMeshPhongMaterial&&!nt.envMap,zt=an.get(nt.envMap||Ot,Nt),ee=nt.vertexColors===!0&&!!rt.attributes.color&&rt.attributes.color.itemSize===4,de=!!rt.attributes.tangent&&(!!nt.normalMap||nt.anisotropy>0),Bt=!!rt.morphAttributes.position,fe=!!rt.morphAttributes.normal,ze=!!rt.morphAttributes.color,Ne=ni;if(nt.toneMapped){if(tt===null||tt.isXRRenderTarget===!0)Ne=V.toneMapping}let Re=rt.morphAttributes.position||rt.morphAttributes.normal||rt.morphAttributes.color,ln=Re!==void 0?Re.length:0,kt=Zt.get(nt),vn=F.state.lights;if(xt===!0){if(Yt===!0||k!==ot){let Ue=k===ot&&nt.id===pt;lt.setState(nt,k,Ue)}}let xe=!1,Yi=!1;if(nt.version===kt.__version){if(kt.needsLights&&kt.lightsStateVersion!==vn.state.version)xe=!0;else if(st.isBatchedMesh&&kt.batching===!1)xe=!0;else if(!st.isBatchedMesh&&kt.batching===!0)xe=!0;else if(st.isBatchedMesh&&kt.batchingColor===!0&&st._colorsTexture===null)xe=!0;else if(st.isBatchedMesh&&kt.batchingColor===!1&&st._colorsTexture!==null)xe=!0;else if(st.isInstancedMesh&&kt.instancing===!1)xe=!0;else if(!st.isInstancedMesh&&kt.instancing===!0)xe=!0;else if(st.isSkinnedMesh&&kt.skinning===!1)xe=!0;else if(!st.isSkinnedMesh&&kt.skinning===!0)xe=!0;else if(st.isInstancedMesh&&kt.instancingColor===!0&&st.instanceColor===null)xe=!0;else if(st.isInstancedMesh&&kt.instancingColor===!1&&st.instanceColor!==null)xe=!0;else if(st.isInstancedMesh&&kt.instancingMorph===!0&&st.morphTexture===null)xe=!0;else if(st.isInstancedMesh&&kt.instancingMorph===!1&&st.morphTexture!==null)xe=!0;else if(kt.envMap!==zt)xe=!0;else if(nt.fog===!0&&kt.fog!==Tt)xe=!0;else if(kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==lt.numPlanes||kt.numIntersection!==lt.numIntersection))xe=!0;else if(kt.vertexAlphas!==ee)xe=!0;else if(kt.vertexTangents!==de)xe=!0;else if(kt.morphTargets!==Bt)xe=!0;else if(kt.morphNormals!==fe)xe=!0;else if(kt.morphColors!==ze)xe=!0;else if(kt.morphTargetsCount!==ln)xe=!0;else if(kt.numLightProbeGrids!==xu(F.state.lightProbeGridArray))xe=!0;else if(kt.outputColorSpace!==Mt||kt.toneMapping!==Ne)Yi=!0}else xe=!0,kt.__version=nt.version;let cn=kt.currentProgram;if(xe===!0||Yi===!0){if(cn=Yi===!0?ug(nt,K,st,Mt,Ne):fr(nt,K,st),H&&nt.isNodeMaterial)H.onUpdateProgram(nt,cn,kt)}let ho=!1,Ai=!1,Zi=!1,_e=cn.getUniforms(),en=kt.uniforms;if(Ct.useProgram(cn.program))ho=!0,Ai=!0,Zi=!0;if(nt.id!==pt)pt=nt.id,Ai=!0;if(ho||ot!==k){if(Ct.buffers.depth.getReversed()&&k.reversedDepth!==!0)k._reversedDepth=!0,k.updateProjectionMatrix();_e.setValue(j,"projectionMatrix",k.projectionMatrix),_e.setValue(j,"viewMatrix",k.matrixWorldInverse);let Ke=_e.map.cameraPosition;if(Ke!==void 0)Ke.setValue(j,se.setFromMatrixPosition(k.matrixWorld));if($e.logarithmicDepthBuffer)_e.setValue(j,"logDepthBufFC",2/(Math.log(k.far+1)/Math.LN2));if(nt.isMeshPhongMaterial||nt.isMeshToonMaterial||nt.isMeshLambertMaterial||nt.isMeshBasicMaterial||nt.isMeshStandardMaterial||nt.isShaderMaterial)_e.setValue(j,"isOrthographic",k.isOrthographicCamera===!0);if(ot!==k)ot=k,Ai=!0,Zi=!0}if(kt.needsLights){if(vn.state.sunShadowMap.length>0)_e.setValue(j,"sunShadowMap",vn.state.sunShadowMap,te);if(vn.state.directionalShadowMap.length>0)_e.setValue(j,"directionalShadowMap",vn.state.directionalShadowMap,te);if(vn.state.spotShadowMap.length>0)_e.setValue(j,"spotShadowMap",vn.state.spotShadowMap,te);if(vn.state.pointShadowMap.length>0)_e.setValue(j,"pointShadowMap",vn.state.pointShadowMap,te)}if(st.isSkinnedMesh){_e.setOptional(j,st,"bindMatrix"),_e.setOptional(j,st,"bindMatrixInverse");let Ue=st.skeleton;if(Ue){if(Ue.boneTexture===null)Ue.computeBoneTexture();_e.setValue(j,"boneTexture",Ue.boneTexture,te)}}if(st.isBatchedMesh){if(_e.setOptional(j,st,"batchingTexture"),_e.setValue(j,"batchingTexture",st._matricesTexture,te),_e.setOptional(j,st,"batchingIdTexture"),_e.setValue(j,"batchingIdTexture",st._indirectTexture,te),_e.setOptional(j,st,"batchingColorTexture"),st._colorsTexture!==null)_e.setValue(j,"batchingColorTexture",st._colorsTexture,te)}let Vn=rt.morphAttributes;if(Vn.position!==void 0||Vn.normal!==void 0||Vn.color!==void 0)Z.update(st,rt,cn);if(Ai||kt.receiveShadow!==st.receiveShadow)kt.receiveShadow=st.receiveShadow,_e.setValue(j,"receiveShadow",st.receiveShadow);if((nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial)&&nt.envMap===null&&K.environment!==null)en.envMapIntensity.value=K.environmentIntensity;if(en.dfgLUT!==void 0)en.dfgLUT.value=YS();if(Ai){if(_e.setValue(j,"toneMappingExposure",V.toneMappingExposure),kt.needsLights)fg(en,Zi);if(Tt&&nt.fog===!0)ft.refreshFogUniforms(en,Tt);if(ft.refreshMaterialUniforms(en,nt,Ft,Ht,F.state.transmissionRenderTarget[k.id]),kt.needsLights&&kt.numLightProbeGrids>0){let Ue=U,Ke=0;for(let ci of F.state.lightProbeGridArray){if(ci.texture===null)continue;Ue.textures[Ke]=ci.texture,Ue.min[Ke]=ci.boundingBox.min,Ue.max[Ke]=ci.boundingBox.max,Ue.resolution[Ke]=ci.resolution,Ke++}for(let ci in Ue)Ue[ci].length=Ke;en.probesSH.value=Ue.textures,en.probesMin.value=Ue.min,en.probesMax.value=Ue.max,en.probesResolution.value=Ue.resolution}Jr.upload(j,vu(kt),en,te)}if(nt.isShaderMaterial&&nt.uniformsNeedUpdate===!0)Jr.upload(j,vu(kt),en,te),nt.uniformsNeedUpdate=!1;if(nt.isSpriteMaterial)_e.setValue(j,"center",st.center);if(_e.setValue(j,"modelViewMatrix",st.modelViewMatrix),_e.setValue(j,"normalMatrix",st.normalMatrix),_e.setValue(j,"modelMatrix",st.matrixWorld),nt.uniformsGroups!==void 0){let Ue=nt.uniformsGroups;for(let Ke=0,ci=Ue.length;Ke<ci;Ke++){let bu=Ue[Ke];wt.update(bu,cn),wt.bind(bu,cn)}}return cn}function fg(k,K){k.ambientLightColor.needsUpdate=K,k.lightProbe.needsUpdate=K,k.sunLights.needsUpdate=K,k.sunLightShadows.needsUpdate=K,k.directionalLights.needsUpdate=K,k.directionalLightShadows.needsUpdate=K,k.pointLights.needsUpdate=K,k.pointLightShadows.needsUpdate=K,k.spotLights.needsUpdate=K,k.spotLightShadows.needsUpdate=K,k.rectAreaLights.needsUpdate=K,k.hemisphereLights.needsUpdate=K}function pg(k){return k.isMeshLambertMaterial||k.isMeshToonMaterial||k.isMeshPhongMaterial||k.isMeshStandardMaterial||k.isShadowMaterial||k.isShaderMaterial&&k.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return it},this.getRenderTarget=function(){return tt},this.setRenderTargetTextures=function(k,K,rt){let nt=Zt.get(k);if(nt.__autoAllocateDepthBuffer=k.resolveDepthBuffer===!1,nt.__autoAllocateDepthBuffer===!1)nt.__useRenderToTexture=!1;Zt.get(k.texture).__webglTexture=K,Zt.get(k.depthTexture).__webglTexture=nt.__autoAllocateDepthBuffer?void 0:rt,nt.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(k,K){let rt=Zt.get(k);rt.__webglFramebuffer=K,rt.__useDefaultFramebuffer=K===void 0},this.setRenderTarget=function(k,K=0,rt=0){tt=k,Q=K,it=rt;let nt=null,st=!1,Tt=!1;if(k){let Mt=Zt.get(k);if(Mt.__useDefaultFramebuffer!==void 0){Ct.bindFramebuffer(j.FRAMEBUFFER,Mt.__webglFramebuffer),dt.copy(k.viewport),_t.copy(k.scissor),Dt=k.scissorTest,Ct.viewport(dt),Ct.scissor(_t),Ct.setScissorTest(Dt),pt=-1;return}else if(Mt.__webglFramebuffer===void 0)te.setupRenderTarget(k);else if(Mt.__hasExternalTextures)te.rebindTextures(k,Zt.get(k.texture).__webglTexture,Zt.get(k.depthTexture).__webglTexture);else if(k.depthBuffer){let ee=k.depthTexture;if(Mt.__boundDepthTexture!==ee){if(ee!==null&&Zt.has(ee)&&(k.width!==ee.image.width||k.height!==ee.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(k)}}let Nt=k.texture;if(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)Tt=!0;let zt=Zt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget){if(Array.isArray(zt[K]))nt=zt[K][rt];else nt=zt[K];st=!0}else if(k.samples>0&&te.useMultisampledRTT(k)===!1)nt=Zt.get(k).__webglMultisampledFramebuffer;else if(Array.isArray(zt))nt=zt[rt];else nt=zt;dt.copy(k.viewport),_t.copy(k.scissor),Dt=k.scissorTest}else dt.copy(Kt).multiplyScalar(Ft).floor(),_t.copy(Ut).multiplyScalar(Ft).floor(),Dt=jt;if(rt!==0)nt=W;if(Ct.bindFramebuffer(j.FRAMEBUFFER,nt))Ct.drawBuffers(k,nt);if(Ct.viewport(dt),Ct.scissor(_t),Ct.setScissorTest(Dt),st){let Mt=Zt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+K,Mt.__webglTexture,rt)}else if(Tt){let Mt=K;for(let Nt=0;Nt<k.textures.length;Nt++){let zt=Zt.get(k.textures[Nt]);j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0+Nt,zt.__webglTexture,rt,Mt)}}else if(k!==null&&rt!==0){let Mt=Zt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,Mt.__webglTexture,rt)}pt=-1};function Su(k){let K=Zt.get(k);if(K.__readFormat!==k.format||K.__readType!==k.type)K.__readFormat=k.format,K.__readType=k.type,K.__formatReadable=$e.textureFormatReadable(k.format),K.__typeReadable=$e.textureTypeReadable(k.type);return K}if(this.readRenderTargetPixels=function(k,K,rt,nt,st,Tt,Ot,Mt=0){if(!(k&&k.isWebGLRenderTarget)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=Zt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt){Ct.bindFramebuffer(j.FRAMEBUFFER,Nt);try{let zt=k.textures[Mt],{format:ee,type:de}=zt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Mt);let Bt=Su(zt);if(Bt.__formatReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Bt.__typeReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(K>=0&&K<=k.width-nt&&(rt>=0&&rt<=k.height-st))j.readPixels(K,rt,nt,st,vt.convert(ee),vt.convert(de),Tt)}finally{let zt=tt!==null?Zt.get(tt).__webglFramebuffer:null;Ct.bindFramebuffer(j.FRAMEBUFFER,zt)}}},this.readRenderTargetPixelsAsync=async function(k,K,rt,nt,st,Tt,Ot,Mt=0){if(!(k&&k.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=Zt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt)if(K>=0&&K<=k.width-nt&&(rt>=0&&rt<=k.height-st)){Ct.bindFramebuffer(j.FRAMEBUFFER,Nt);let zt=k.textures[Mt],{format:ee,type:de}=zt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Mt);let Bt=Su(zt);if(Bt.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Bt.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let fe=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.bufferData(j.PIXEL_PACK_BUFFER,Tt.byteLength,j.STREAM_READ),j.readPixels(K,rt,nt,st,vt.convert(ee),vt.convert(de),0),j.bindBuffer(j.PIXEL_PACK_BUFFER,null);let ze=tt!==null?Zt.get(tt).__webglFramebuffer:null;Ct.bindFramebuffer(j.FRAMEBUFFER,ze);let Ne=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await rp(j,Ne,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,Tt),j.bindBuffer(j.PIXEL_PACK_BUFFER,null),j.deleteBuffer(fe),j.deleteSync(Ne),Tt}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(k,K=null,rt=0){let nt=Math.pow(2,-rt),st=Math.floor(k.image.width*nt),Tt=Math.floor(k.image.height*nt),Ot=K!==null?K.x:0,Mt=K!==null?K.y:0;te.setTexture2D(k,0),j.copyTexSubImage2D(j.TEXTURE_2D,rt,0,0,Ot,Mt,st,Tt),Ct.unbindTexture()},this.copyTextureToTexture=function(k,K,rt=null,nt=null,st=0,Tt=0){let Ot,Mt,Nt,zt,ee,de,Bt,fe,ze,Ne=k.isCompressedTexture?k.mipmaps[Tt]:k.image;if(rt!==null)Ot=rt.max.x-rt.min.x,Mt=rt.max.y-rt.min.y,Nt=rt.isBox3?rt.max.z-rt.min.z:1,zt=rt.min.x,ee=rt.min.y,de=rt.isBox3?rt.min.z:0;else{let _e=Math.pow(2,-st);if(Ot=Math.floor(Ne.width*_e),Mt=Math.floor(Ne.height*_e),k.isDataArrayTexture)Nt=Ne.depth;else if(k.isData3DTexture)Nt=Math.floor(Ne.depth*_e);else Nt=1;zt=0,ee=0,de=0}if(nt!==null)Bt=nt.x,fe=nt.y,ze=nt.z;else Bt=0,fe=0,ze=0;let Re=vt.convert(K.format),ln=vt.convert(K.type),kt;if(K.isData3DTexture)te.setTexture3D(K,0),kt=j.TEXTURE_3D;else if(K.isDataArrayTexture||K.isCompressedArrayTexture)te.setTexture2DArray(K,0),kt=j.TEXTURE_2D_ARRAY;else te.setTexture2D(K,0),kt=j.TEXTURE_2D;Ct.activeTexture(j.TEXTURE0),Ct.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,K.flipY),Ct.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),Ct.pixelStorei(j.UNPACK_ALIGNMENT,K.unpackAlignment);let vn=Ct.getParameter(j.UNPACK_ROW_LENGTH),xe=Ct.getParameter(j.UNPACK_IMAGE_HEIGHT),Yi=Ct.getParameter(j.UNPACK_SKIP_PIXELS),cn=Ct.getParameter(j.UNPACK_SKIP_ROWS),ho=Ct.getParameter(j.UNPACK_SKIP_IMAGES);Ct.pixelStorei(j.UNPACK_ROW_LENGTH,Ne.width),Ct.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Ne.height),Ct.pixelStorei(j.UNPACK_SKIP_PIXELS,zt),Ct.pixelStorei(j.UNPACK_SKIP_ROWS,ee),Ct.pixelStorei(j.UNPACK_SKIP_IMAGES,de);let Ai=k.isDataArrayTexture||k.isData3DTexture,Zi=K.isDataArrayTexture||K.isData3DTexture;if(k.isDepthTexture){let _e=Zt.get(k),en=Zt.get(K),Vn=Zt.get(_e.__renderTarget),Ue=Zt.get(en.__renderTarget);Ct.bindFramebuffer(j.READ_FRAMEBUFFER,Vn.__webglFramebuffer),Ct.bindFramebuffer(j.DRAW_FRAMEBUFFER,Ue.__webglFramebuffer);for(let Ke=0;Ke<Nt;Ke++){if(Ai)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Zt.get(k).__webglTexture,st,de+Ke),j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Zt.get(K).__webglTexture,Tt,ze+Ke);j.blitFramebuffer(zt,ee,zt+Ot,ee+Mt,Bt,fe,Bt+Ot,fe+Mt,j.DEPTH_BUFFER_BIT,j.NEAREST)}Ct.bindFramebuffer(j.READ_FRAMEBUFFER,null),Ct.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(st!==0||k.isRenderTargetTexture||Zt.has(k)){let _e=Zt.get(k),en=Zt.get(K);Ct.bindFramebuffer(j.READ_FRAMEBUFFER,J),Ct.bindFramebuffer(j.DRAW_FRAMEBUFFER,G);for(let Vn=0;Vn<Nt;Vn++){if(Ai)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,_e.__webglTexture,st,de+Vn);else j.framebufferTexture2D(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,_e.__webglTexture,st);if(Zi)j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,en.__webglTexture,Tt,ze+Vn);else j.framebufferTexture2D(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,en.__webglTexture,Tt);if(st!==0)j.blitFramebuffer(zt,ee,zt+Ot,ee+Mt,Bt,fe,Bt+Ot,fe+Mt,j.COLOR_BUFFER_BIT,j.NEAREST);else if(Zi)j.copyTexSubImage3D(kt,Tt,Bt,fe,ze+Vn,zt,ee,Ot,Mt);else j.copyTexSubImage2D(kt,Tt,Bt,fe,zt,ee,Ot,Mt)}Ct.bindFramebuffer(j.READ_FRAMEBUFFER,null),Ct.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(Zi)if(k.isDataTexture||k.isData3DTexture)j.texSubImage3D(kt,Tt,Bt,fe,ze,Ot,Mt,Nt,Re,ln,Ne.data);else if(K.isCompressedArrayTexture)j.compressedTexSubImage3D(kt,Tt,Bt,fe,ze,Ot,Mt,Nt,Re,Ne.data);else j.texSubImage3D(kt,Tt,Bt,fe,ze,Ot,Mt,Nt,Re,ln,Ne);else if(k.isDataTexture)j.texSubImage2D(j.TEXTURE_2D,Tt,Bt,fe,Ot,Mt,Re,ln,Ne.data);else if(k.isCompressedTexture)j.compressedTexSubImage2D(j.TEXTURE_2D,Tt,Bt,fe,Ne.width,Ne.height,Re,Ne.data);else j.texSubImage2D(j.TEXTURE_2D,Tt,Bt,fe,Ot,Mt,Re,ln,Ne);if(Ct.pixelStorei(j.UNPACK_ROW_LENGTH,vn),Ct.pixelStorei(j.UNPACK_IMAGE_HEIGHT,xe),Ct.pixelStorei(j.UNPACK_SKIP_PIXELS,Yi),Ct.pixelStorei(j.UNPACK_SKIP_ROWS,cn),Ct.pixelStorei(j.UNPACK_SKIP_IMAGES,ho),Tt===0&&K.generateMipmaps===!0&&K.mipmapsAutoUpdate===!0)j.generateMipmap(kt);Ct.unbindTexture()},this.initRenderTarget=function(k){if(Zt.get(k).__webglFramebuffer===void 0)te.setupRenderTarget(k)},this.initTexture=function(k){if(k.isCubeTexture)te.setTextureCube(k,0);else if(k.isData3DTexture)te.setTexture3D(k,0);else if(k.isDataArrayTexture||k.isCompressedArrayTexture)te.setTexture2DArray(k,0);else te.setTexture2D(k,0);Ct.unbindTexture()},this.resetState=function(){Q=0,it=0,tt=null,Ct.reset(),yt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ih}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(p){this._outputColorSpace=p;let m=this.getContext();m.drawingBufferColorSpace=he._getDrawingBufferColorSpace(p),m.unpackColorSpace=he._getUnpackColorSpace()}}class Uh extends xa{constructor(p){super(p)}parse(p,m){let g={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},_=542327876,x=131072,v=512,y=1024,S=2048,b=4096,M=8192,T=16384,w=32768,E=95,A=96;function C(Ut){return Ut.charCodeAt(0)+(Ut.charCodeAt(1)<<8)+(Ut.charCodeAt(2)<<16)+(Ut.charCodeAt(3)<<24)}function D(Ut){return String.fromCharCode(Ut&255,Ut>>8&255,Ut>>16&255,Ut>>24&255)}function R(Ut,jt,qt,ge){let xt=qt*ge*4,Yt=new Uint8Array(Ut,jt,xt),ie=new Uint8Array(xt),se=0,pe=0;for(let Be=0;Be<ge;Be++)for(let ke=0;ke<qt;ke++){let _n=Yt[pe];pe++;let j=Yt[pe];pe++;let xn=Yt[pe];pe++;let be=Yt[pe];pe++,ie[se]=xn,se++,ie[se]=j,se++,ie[se]=_n,se++,ie[se]=be,se++}return ie}function P(Ut,jt,qt,ge){let xt=qt*ge*3,Yt=new Uint8Array(Ut,jt,xt),ie=new Uint8Array(qt*ge*4),se=0,pe=0;for(let Be=0;Be<ge;Be++)for(let ke=0;ke<qt;ke++){let _n=Yt[pe];pe++;let j=Yt[pe];pe++;let xn=Yt[pe];pe++,ie[se]=xn,se++,ie[se]=j,se++,ie[se]=_n,se++,ie[se]=255,se++}return ie}let L=C("DXT1"),U=C("DXT3"),N=C("DXT5"),F=C("ETC1"),z=C("DX10"),I=31,O=5,V=0,q=1,H=2,W=3,J=4,G=7,Q=21,it=22,tt=23,pt=24,ot=25,dt=26,_t=28,Dt=0,at=new Int32Array(p,0,I);if(at[V]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),g;let mt,At=at[Q],Ht=!1,Ft=!1,Rt=at[q]+4;switch(At){case L:mt=8,g.format=Xs;break;case U:mt=16,g.format=qs;break;case N:mt=16,g.format=Ys;break;case F:mt=8,g.format=Ur;break;case z:Rt+=O*4;let jt=new Int32Array(p,(I+1)*4,O)[Dt];switch(jt){case 96:{mt=16,g.format=Or;break}case 95:{mt=16,g.format=Fr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",jt),g}break;default:if(at[it]===32&&at[tt]&16711680&&at[pt]&65280&&at[ot]&255&&at[dt]&4278190080)Ht=!0,mt=64,g.format=kn;else if(at[it]===24&&at[tt]&16711680&&at[pt]&65280&&at[ot]&255)Ft=!0,mt=64,g.format=kn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",D(At)),g}if(g.mipmapCount=1,at[H]&131072&&m!==!1)g.mipmapCount=Math.max(1,at[G]);let ae=at[_t];if(g.isCubemap=ae&512?!0:!1,g.isCubemap&&(!(ae&1024)||!(ae&2048)||!(ae&4096)||!(ae&8192)||!(ae&16384)||!(ae&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),g;g.width=at[J],g.height=at[W];let Kt=g.isCubemap?6:1;for(let Ut=0;Ut<Kt;Ut++){let{width:jt,height:qt}=g;for(let ge=0;ge<g.mipmapCount;ge++){let xt,Yt;if(Ht)xt=R(p,Rt,jt,qt),Yt=xt.length;else if(Ft)xt=P(p,Rt,jt,qt),Yt=jt*qt*3;else Yt=Math.ceil(jt/4)*Math.ceil(qt/4)*mt,xt=new Uint8Array(p,Rt,Yt);let ie={data:xt,width:jt,height:qt};g.mipmaps.push(ie),Rt+=Yt,jt=Math.max(jt>>1,1),qt=Math.max(qt>>1,1)}}return g}}var em=0,nm=1,im=2;var Oh=2;var La=1.25,Fh=1,tn=32,we=8,Na=65535;var Js=Math.pow(2,-24),jr=Symbol("SKIP_GENERATION"),Da={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[jr]:!1};function Pe(p,m,g){return g.min.x=m[p],g.min.y=m[p+1],g.min.z=m[p+2],g.max.x=m[p+3],g.max.y=m[p+4],g.max.z=m[p+5],g}function Qr(p){let m=-1,g=-1/0;for(let _=0;_<3;_++){let x=p[_+3]-p[_];if(x>g)g=x,m=_}return m}function Bh(p,m,g){for(let _=0;_<3;_++){let x=m[p+2*_],v=m[p+2*_+1],y=x-v,S=x+v;if(y<g[_])g[_]=y;if(S>g[_+3])g[_+3]=S}}function Ua(p){let m=p[3]-p[0],g=p[4]-p[1],_=p[5]-p[2];return 2*(m*g+g*_+_*m)}function me(p,m){return m[p+15]===Na}function Me(p,m){return m[p+6]}function Ae(p,m){return m[p+14]}function ye(p){return p+we}function Se(p,m){let g=m[p+6];return p+g*we}function Ks(p,m){return m[p+7]}function De(p){return p}function Oa(p,m,g,_,x){let v=1/0,y=1/0,S=1/0,b=-1/0,M=-1/0,T=-1/0,w=1/0,E=1/0,A=1/0,C=-1/0,D=-1/0,R=-1/0,P=p.offset||0;for(let L=(m-P)*6,U=(m+g-P)*6;L<U;L+=6){let N=p[L+0],F=p[L+1],z=N-F,I=N+F;if(z<v)v=z;if(I>b)b=I;if(N<w)w=N;if(N>C)C=N;let O=p[L+2],V=p[L+3],q=O-V,H=O+V;if(q<y)y=q;if(H>M)M=H;if(O<E)E=O;if(O>D)D=O;let W=p[L+4],J=p[L+5],G=W-J,Q=W+J;if(G<S)S=G;if(Q>T)T=Q;if(W<A)A=W;if(W>R)R=W}_[0]=v,_[1]=y,_[2]=S,_[3]=b,_[4]=M,_[5]=T,x[0]=w,x[1]=E,x[2]=A,x[3]=C,x[4]=D,x[5]=R}var ai=8,zh=8,kh=new Int32Array(ai),oi=new Float32Array(ai*6),js=new Float32Array(ai*6),$n=new Float32Array(6),Fa=new Float32Array(6),Gi=new Int32Array(zh),sm=new Float32Array(zh*6);function $S(p,m,g,_){for(let x=0;x<3;x++){let v=m[p+2*x],y=m[p+2*x+1],S=v-y,b=v+y;if(S<g[_+x])g[_+x]=S;if(b>g[_+x+3])g[_+x+3]=b}}function rm(p,m){let g=p[m+3]-p[m],_=p[m+4]-p[m+1],x=p[m+5]-p[m+2];return 2*(g*_+_*x+x*g)}function om(p,m,g,_,x,v){let y=-1,S=0;if(v===em){if(y=Qr(m),y!==-1)S=(m[y]+m[y+3])/2}else if(v===nm){if(y=Qr(p),y!==-1)S=JS(g,_,x,y)}else if(v===im){let b=Ua(p),M=La*x,T=g.offset||0,w=(_-T)*6,E=(_+x-T)*6;for(let A=0;A<3;A++){let C=m[A],P=(m[A+3]-C)/ai;if(x<zh){for(let L=0;L<x;L++){let U=w+L*6,N=g[U+2*A],F=L;while(F>0&&g[Gi[F-1]+2*A]>N)Gi[F]=Gi[F-1],F--;Gi[F]=U}for(let L=0;L<3;L++)$n[L]=1/0,$n[L+3]=-1/0,Fa[L]=1/0,Fa[L+3]=-1/0;for(let L=x-1;L>=0;L--)Bh(Gi[L],g,Fa),sm.set(Fa,L*6);for(let L=0;L<x-1;L++){Bh(Gi[L],g,$n);let U=g[Gi[L+1]+2*A];if(g[Gi[L]+2*A]===U)continue;let N=L+1,F=x-N,z=Ua($n)/b,I=rm(sm,N*6)/b,O=Fh+La*(z*N+I*F);if(O<M)y=A,M=O,S=U}}else{for(let N=0;N<ai;N++){kh[N]=0;for(let F=0;F<3;F++)oi[N*6+F]=1/0,oi[N*6+F+3]=-1/0}for(let N=w;N<E;N+=6){let I=~~((g[N+2*A]-C)/P);if(I>=ai)I=ai-1;kh[I]++,$S(N,g,oi,I*6)}let L=(ai-1)*6;for(let N=0;N<6;N++)js[L+N]=oi[L+N];for(let N=ai-2;N>=0;N--){let F=N*6,z=F+6;for(let I=0;I<3;I++)js[F+I]=Math.min(oi[F+I],js[z+I]),js[F+I+3]=Math.max(oi[F+I+3],js[z+I+3])}let U=0;for(let N=0;N<ai-1;N++){let F=N*6,z=kh[N];if(z!==0)for(let H=0;H<3;H++)if(U===0)$n[H]=oi[F+H],$n[H+3]=oi[F+H+3];else $n[H]=Math.min($n[H],oi[F+H]),$n[H+3]=Math.max($n[H+3],oi[F+H+3]);U+=z;let I=0,O=0;if(U!==0)I=Ua($n)/b;let V=x-U;if(V!==0)O=rm(js,F+6)/b;let q=Fh+La*(I*U+O*V);if(q<M)y=A,M=q,S=C+P+N*P}}}}else console.warn(`BVH: Invalid build strategy value ${v} used.`);return{axis:y,pos:S}}function JS(p,m,g,_){let x=0,v=p.offset;for(let y=m,S=m+g;y<S;y++)x+=p[(y-v)*6+_*2];return x/g}function am(p,m,g,_,x,v){let y=_,S=_+x-1,b=v.pos,M=v.axis*2,T=g.offset||0;while(!0){while(y<=S&&g[(y-T)*6+M]<b)y++;while(y<=S&&g[(S-T)*6+M]>=b)S--;if(y<S){for(let w=0;w<m;w++){let E=p[y*m+w];p[y*m+w]=p[S*m+w],p[S*m+w]=E}for(let w=0;w<6;w++){let E=y-T,A=S-T,C=g[E*6+w];g[E*6+w]=g[A*6+w],g[A*6+w]=C}y++,S--}else return y}}var KS=Math.pow(2,32),Qs=new Float32Array(6),Ba=new Float32Array(6);function jS(p,m,g,_,x,v){let{maxDepth:y,verbose:S,targetLeafSize:b,_strictLeafSize:M=1/0,strategy:T,onProgress:w,useSharedArrayBuffer:E=!1}=x,{primitiveBuffer:A,primitiveBufferStride:C}=p,R=new(E?SharedArrayBuffer:ArrayBuffer)(tn*Math.max(1,2*Math.ceil(_)-1)),P=new Float32Array(R),L=new Uint32Array(R),U=new Uint16Array(R),N=0,F=!1;return Oa(m,g,_,Qs,Ba),O(g,_,0),R.slice(0,N*tn);function z(V){if(w)w((V-v.offset)/v.count)}function I(V,q,H){let W=V*2;L[V+6]=q,U[W+14]=H,U[W+15]=Na,z(q+H)}function O(V,q,H){let W=N++,J=W*we;if(P.set(Qs,J),!F&&H>=y){if(F=!0,S)console.warn(`BVH: Max depth of ${y} reached when generating BVH. Consider increasing maxDepth.`)}let G=q>M;if(q<=b&&!G||H>=y){I(J,V,q);return}let Q=om(Qs,Ba,m,V,q,T),it=Q.axis===-1?-1:am(A,C,m,V,q,Q);if(Q.axis===-1||it===V||it===V+q){if(!G){I(J,V,q);return}Q.axis=Math.max(0,Qr(Qs)),it=V+Math.max(1,Math.floor(q/2))}L[J+7]=Q.axis;let tt=it-V;Oa(m,V,tt,Qs,Ba),O(V,tt,H+1);let pt=N-W;if(pt>KS)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");L[J+6]=pt;let ot=q-tt;Oa(m,it,ot,Qs,Ba),O(it,ot,H+1)}}function lm(p,m){let g=p.getRootRanges(m.range),_=g[0],x=g[g.length-1],v={offset:_.offset,count:x.offset+x.count-_.offset},y=new Float32Array(6*v.count);y.offset=v.offset,p.computePrimitiveBounds(v.offset,v.count,y),p._roots=g.map((S)=>jS(p,y,S.offset,S.count,m,v))}class gs{constructor(p){this._getNewPrimitive=p,this._primitives=[]}getPrimitive(){let p=this._primitives;if(p.length===0)return this._getNewPrimitive();else return p.pop()}releasePrimitive(p){this._primitives.push(p)}}class cm{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let p=[],m=null;this.setBuffer=(g)=>{if(m)p.push(m);m=g,this.float32Array=new Float32Array(g),this.uint16Array=new Uint16Array(g),this.uint32Array=new Uint32Array(g)},this.clearBuffer=()=>{if(m=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,p.length!==0)this.setBuffer(p.pop())}}}var ue=new cm;var Vi,er,tr=[],ka=new gs(()=>new ve);function hm(p,m,g,_,x,v){Vi=ka.getPrimitive(),er=ka.getPrimitive(),tr.push(Vi,er),ue.setBuffer(p._roots[m]);let y=Hh(0,p.geometry,g,_,x,v);ue.clearBuffer(),ka.releasePrimitive(Vi),ka.releasePrimitive(er),tr.pop(),tr.pop();let S=tr.length;if(S>0)er=tr[S-1],Vi=tr[S-2];return y}function Hh(p,m,g,_,x=null,v=0,y=0){let{float32Array:S,uint16Array:b,uint32Array:M}=ue,T=p*2;if(me(T,b)){let E=Me(p,M),A=Ae(T,b);return Pe(De(p),S,Vi),_(E,A,!1,y,v+p/we,Vi)}else{let q=function(W){let{uint16Array:J,uint32Array:G}=ue,Q=W*2;while(!me(Q,J))W=ye(W),Q=W*2;return Me(W,G)},H=function(W){let{uint16Array:J,uint32Array:G}=ue,Q=W*2;while(!me(Q,J))W=Se(W,G),Q=W*2;return Me(W,G)+Ae(Q,J)},E=ye(p),A=Se(p,M),C=E,D=A,R,P,L,U;if(x){if(L=Vi,U=er,Pe(De(C),S,L),Pe(De(D),S,U),R=x(L),P=x(U),P<R){C=A,D=E;let W=R;R=P,P=W,L=U}}if(!L)L=Vi,Pe(De(C),S,L);let N=me(C*2,b),F=g(L,N,R,y+1,v+C/we),z;if(F===Oh){let W=q(C),G=H(C)-W;z=_(W,G,!0,y+1,v+C/we,L)}else z=F&&Hh(C,m,g,_,x,v,y+1);if(z)return!0;U=er,Pe(De(D),S,U);let I=me(D*2,b),O=g(U,I,P,y+1,v+D/we),V;if(O===Oh){let W=q(D),G=H(D)-W;V=_(W,G,!0,y+1,v+D/we,U)}else V=O&&Hh(D,m,g,_,x,v,y+1);if(V)return!0;return!1}}var to=new ue.constructor,za=new ue.constructor,Wi=new gs(()=>new ve),nr=new ve,ir=new ve,Gh=new ve,Vh=new ve,Wh=!1;function um(p,m,g,_){if(Wh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");Wh=!0;let x=p._roots,v=m._roots,y,S=0,b=0,M=new re().copy(g).invert();for(let T=0,w=x.length;T<w;T++){to.setBuffer(x[T]),b=0;let E=Wi.getPrimitive();Pe(De(0),to.float32Array,E),E.applyMatrix4(M);for(let A=0,C=v.length;A<C;A++)if(za.setBuffer(v[A]),y=Jn(0,0,g,M,_,S,b,0,0,E),za.clearBuffer(),b+=v[A].byteLength/tn,y)break;if(Wi.releasePrimitive(E),to.clearBuffer(),S+=x[T].byteLength/tn,y)break}return Wh=!1,y}function Jn(p,m,g,_,x,v=0,y=0,S=0,b=0,M=null,T=!1){let w,E;if(T)w=za,E=to;else w=to,E=za;let A=w.float32Array,C=w.uint32Array,D=w.uint16Array,R=E.float32Array,P=E.uint32Array,L=E.uint16Array,U=p*2,N=m*2,F=me(U,D),z=me(N,L),I=!1;if(z&&F)if(T)I=x(Me(m,P),Ae(m*2,L),Me(p,C),Ae(p*2,D),b,y+m/we,S,v+p/we);else I=x(Me(p,C),Ae(p*2,D),Me(m,P),Ae(m*2,L),S,v+p/we,b,y+m/we);else if(z){let O=Wi.getPrimitive();Pe(De(m),R,O),O.applyMatrix4(g);let V=ye(p),q=Se(p,C);Pe(De(V),A,nr),Pe(De(q),A,ir);let H=O.intersectsBox(nr),W=O.intersectsBox(ir);I=H&&Jn(m,V,_,g,x,y,v,b,S+1,O,!T)||W&&Jn(m,q,_,g,x,y,v,b,S+1,O,!T),Wi.releasePrimitive(O)}else{let O=ye(m),V=Se(m,P);Pe(De(O),R,Gh),Pe(De(V),R,Vh);let q=M.intersectsBox(Gh),H=M.intersectsBox(Vh);if(q&&H)I=Jn(p,O,g,_,x,v,y,S,b+1,M,T)||Jn(p,V,g,_,x,v,y,S,b+1,M,T);else if(q)if(F)I=Jn(p,O,g,_,x,v,y,S,b+1,M,T);else{let W=Wi.getPrimitive();W.copy(Gh).applyMatrix4(g);let J=ye(p),G=Se(p,C);Pe(De(J),A,nr),Pe(De(G),A,ir);let Q=W.intersectsBox(nr),it=W.intersectsBox(ir);I=Q&&Jn(O,J,_,g,x,y,v,b,S+1,W,!T)||it&&Jn(O,G,_,g,x,y,v,b,S+1,W,!T),Wi.releasePrimitive(W)}else if(H)if(F)I=Jn(p,V,g,_,x,v,y,S,b+1,M,T);else{let W=Wi.getPrimitive();W.copy(Vh).applyMatrix4(g);let J=ye(p),G=Se(p,C);Pe(De(J),A,nr),Pe(De(G),A,ir);let Q=W.intersectsBox(nr),it=W.intersectsBox(ir);I=Q&&Jn(V,J,_,g,x,y,v,b,S+1,W,!T)||it&&Jn(V,G,_,g,x,y,v,b,S+1,W,!T),Wi.releasePrimitive(W)}}return I}var Ha=new class{constructor(){let p=null,m=null,g=null,_=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(v,y)=>{if(_)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=y,this.buffer=p=v._roots[y],this.uint16Array=g=new Uint16Array(p),this.uint32Array=m=new Uint32Array(p)},this.reset=()=>{this.root=null,this.buffer=p=null,this.uint16Array=g=null,this.uint32Array=m=null},this.getRangeStart=(v)=>{let y=v*2;while(!me(y,g))v=ye(v),y=v*2;return Me(v,m)},this.getRangeEnd=(v)=>{let y=v*2;while(!me(y,g))v=Se(v,m),y=v*2;return Me(v,m)+Ae(y,g)};let x=(v,y,S)=>{let b=y*2,M=me(b,g);if(!v(S,M,y)&&!M){let w=ye(y),E=Se(y,m);x(v,w,S+1),x(v,E,S+1)}};this.traverseBuffer=(v)=>{if(_)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");_=!0;try{x(v,0,0)}finally{_=!1}},this.traverse=(v)=>{this.traverseBuffer((y,S,b)=>{if(S){let M=b*2,T=m[b+6],w=g[M+14];return v(y,S,new Float32Array(p,b*4,6),T,w)}else{let M=Ks(b,m);return v(y,S,new Float32Array(p,b*4,6),M)}})}}};var dm=new ve,sr=new Float32Array(6);class Xh{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(p){if(p={...Da,...p},"maxLeafSize"in p)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),p={...p,targetLeafSize:p.maxLeafSize};lm(this,p)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(p,m,g,_){let x=1/0,v=1/0,y=1/0,S=-1/0,b=-1/0,M=-1/0;for(let T=p,w=p+m;T<w;T++){this.writePrimitiveBounds(T,sr,0);let[E,A,C,D,R,P]=sr;if(E<x)x=E;if(D>S)S=D;if(A<v)v=A;if(R>b)b=R;if(C<y)y=C;if(P>M)M=P}return g[_+0]=x,g[_+1]=v,g[_+2]=y,g[_+3]=S,g[_+4]=b,g[_+5]=M,g}computePrimitiveBounds(p,m,g){let _=g.offset||0;for(let x=p,v=p+m;x<v;x++){this.writePrimitiveBounds(x,sr,0);let[y,S,b,M,T,w]=sr,E=(y+M)/2,A=(S+T)/2,C=(b+w)/2,D=(M-y)/2,R=(T-S)/2,P=(w-b)/2,L=(x-_)*6;g[L+0]=E,g[L+1]=D+(Math.abs(E)+D)*Js,g[L+2]=A,g[L+3]=R+(Math.abs(A)+R)*Js,g[L+4]=C,g[L+5]=P+(Math.abs(C)+P)*Js}return g}shiftPrimitiveOffsets(p){let m=this._indirectBuffer;if(m)for(let g=0,_=m.length;g<_;g++)m[g]+=p;else{let g=this._roots;for(let _=0;_<g.length;_++){let x=g[_],v=new Uint32Array(x),y=new Uint16Array(x),S=x.byteLength/tn;for(let b=0;b<S;b++){let M=we*b,T=2*M;if(me(T,y))v[M+6]+=p}}}}traverse(p,m=0){Ha.setBVH(this,m),Ha.traverse(p),Ha.reset()}refit(){let p=this._roots;for(let m=0,g=p.length;m<g;m++){let _=p[m],x=new Uint32Array(_),v=new Uint16Array(_),y=new Float32Array(_),S=_.byteLength/tn;for(let b=S-1;b>=0;b--){let M=b*we,T=M*2;if(me(T,v)){let E=Me(M,x),A=Ae(T,v);this.writePrimitiveRangeBounds(E,A,sr,0),y.set(sr,M)}else{let E=ye(M),A=Se(M,x);for(let C=0;C<3;C++){let D=y[E+C],R=y[E+C+3],P=y[A+C],L=y[A+C+3];y[M+C]=D<P?D:P,y[M+C+3]=R>L?R:L}}}}}getBoundingBox(p){return p.makeEmpty(),this._roots.forEach((g)=>{Pe(0,new Float32Array(g),dm),p.union(dm)}),p}shapecast(p){let{boundsTraverseOrder:m,intersectsBounds:g,intersectsRange:_,intersectsPrimitive:x,scratchPrimitive:v,iterate:y}=p;if(_&&x){let T=_;_=(w,E,A,C,D)=>{if(!T(w,E,A,C,D))return y(w,E,this,x,A,C,v);return!0}}else if(!_)if(x)_=(T,w,E,A)=>y(T,w,this,x,E,A,v);else _=(T,w,E)=>E;let S=!1,b=0,M=this._roots;for(let T=0,w=M.length;T<w;T++){let E=M[T];if(S=hm(this,T,g,_,m,b),S)break;b+=E.byteLength/tn}return S}bvhcast(p,m,g){let{intersectsRanges:_}=g;return um(this,p,m,_)}}function fm(){return typeof SharedArrayBuffer<"u"}function qh(p){return p.index?p.index.count:p.attributes.position.count}function Xi(p){return qh(p)/3}function QS(p,m=ArrayBuffer){if(p>65535)return new Uint32Array(new m(4*p));else return new Uint16Array(new m(2*p))}function pm(p,m){if(!p.index){let g=p.attributes.position.count,_=m.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,x=QS(g,_);p.setIndex(new We(x,1));for(let v=0;v<g;v++)x[v]=v}}function tb(p,m,g){let _=qh(p)/g,x=m?m:p.drawRange,v=x.start/g,y=(x.start+x.count)/g,S=Math.max(0,v),b=Math.min(_,y)-S;return{offset:Math.floor(S),count:Math.floor(b)}}function eb(p,m){return p.groups.map((g)=>({offset:g.start/m,count:g.count/m}))}function Yh(p,m,g){let _=tb(p,m,g),x=eb(p,g);if(!x.length)return[_];let v=[],y=_.offset,S=_.offset+_.count,b=qh(p)/g,M=[];for(let E of x){let{offset:A,count:C}=E,D=A,R=isFinite(C)?C:b-A,P=A+R;if(D<S&&P>y)M.push({pos:Math.max(y,D),isStart:!0}),M.push({pos:Math.min(S,P),isStart:!1})}M.sort((E,A)=>{if(E.pos!==A.pos)return E.pos-A.pos;else return E.type==="end"?-1:1});let T=0,w=null;for(let E of M){let A=E.pos;if(T!==0&&A!==w)v.push({offset:w,count:A-w});T+=E.isStart?1:-1,w=A}return v}function nb(p,m){let g=p[p.length-1],_=g.offset+g.count>65536,x=p.reduce((M,T)=>M+T.count,0),v=_?4:2,y=m?new SharedArrayBuffer(x*v):new ArrayBuffer(x*v),S=_?new Uint32Array(y):new Uint16Array(y),b=0;for(let M=0;M<p.length;M++){let{offset:T,count:w}=p[M];for(let E=0;E<w;E++)S[b+E]=T+E;b+=w}return S}class Zh extends Xh{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(p){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(p){}constructor(p,m={}){if(!p.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(p.index&&p.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(m.useSharedArrayBuffer&&!fm())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=p,this.resolvePrimitiveIndex=m.indirect?(g)=>this._indirectBuffer[g]:(g)=>g,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,m={...Da,...m},!m[jr])this.init(m)}init(p){let{geometry:m,primitiveStride:g}=this;if(p.indirect){let _=Yh(m,p.range,g),x=nb(_,p.useSharedArrayBuffer);this._indirectBuffer=x}else pm(m,p);if(super.init(p),!m.boundingBox&&p.setBoundingBox)m.boundingBox=this.getBoundingBox(new ve)}getRootRanges(p){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return Yh(this.geometry,p,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class Nn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(p,m){let g=1/0,_=-1/0;for(let x=0,v=p.length;x<v;x++){let S=p[x][m];g=S<g?S:g,_=S>_?S:_}this.min=g,this.max=_}setFromPoints(p,m){let g=1/0,_=-1/0;for(let x=0,v=m.length;x<v;x++){let y=m[x],S=p.dot(y);g=S<g?S:g,_=S>_?S:_}this.min=g,this.max=_}isSeparated(p){return this.min>p.max||p.min>this.max}}Nn.prototype.setFromBox=function(){let p=new Y;return function(g,_){let{min:x,max:v}=_,y=1/0,S=-1/0;for(let b=0;b<=1;b++)for(let M=0;M<=1;M++)for(let T=0;T<=1;T++){p.x=x.x*b+v.x*(1-b),p.y=x.y*M+v.y*(1-M),p.z=x.z*T+v.z*(1-T);let w=g.dot(p);y=Math.min(w,y),S=Math.max(w,S)}this.min=y,this.max=S}}();var LR=function(){let p=new Nn;return function(g,_){let{points:x,satAxes:v,satBounds:y}=g,{points:S,satAxes:b,satBounds:M}=_;for(let T=0;T<3;T++){let w=y[T],E=v[T];if(p.setFromPoints(E,S),w.isSeparated(p))return!1}for(let T=0;T<3;T++){let w=M[T],E=b[T];if(p.setFromPoints(E,x),w.isSeparated(p))return!1}}}();var ib=function(){let p=new Y,m=new Y,g=new Y;return function(x,v,y){let S=x.start,b=p,M=v.start,T=m;g.subVectors(S,M),p.subVectors(x.end,x.start),m.subVectors(v.end,v.start);let w=g.dot(T),E=T.dot(b),A=T.dot(T),C=g.dot(b),R=b.dot(b)*A-E*E,P,L;if(R!==0)P=(w*E-C*A)/R;else P=0;L=(w+P*E)/A,y.x=P,y.y=L}}(),eo=function(){let p=new Jt,m=new Y,g=new Y;return function(x,v,y,S){ib(x,v,p);let{x:b,y:M}=p;if(b>=0&&b<=1&&M>=0&&M<=1){x.at(b,y),v.at(M,S);return}else if(b>=0&&b<=1){if(M<0)v.at(0,S);else v.at(1,S);x.closestPointToPoint(S,!0,y);return}else if(M>=0&&M<=1){if(b<0)x.at(0,y);else x.at(1,y);v.closestPointToPoint(y,!0,S);return}else{let T;if(b<0)T=x.start;else T=x.end;let w;if(M<0)w=v.start;else w=v.end;let E=m,A=g;if(x.closestPointToPoint(w,!0,m),v.closestPointToPoint(T,!0,g),E.distanceToSquared(w)<=A.distanceToSquared(T)){y.copy(E),S.copy(w);return}else{y.copy(T),S.copy(A);return}}}}(),mm=function(){let p=new Y,m=new Y,g=new nn,_=new Rn;return function(v,y){let{radius:S,center:b}=v,{a:M,b:T,c:w}=y;if(_.start=M,_.end=T,_.closestPointToPoint(b,!0,p).distanceTo(b)<=S)return!0;if(_.start=M,_.end=w,_.closestPointToPoint(b,!0,p).distanceTo(b)<=S)return!0;if(_.start=T,_.end=w,_.closestPointToPoint(b,!0,p).distanceTo(b)<=S)return!0;let D=y.getPlane(g);if(Math.abs(D.distanceToPoint(b))<=S){let P=D.projectPoint(b,m);if(y.containsPoint(P))return!0}return!1}}();var sb=["x","y","z"],wi=0.000000000000001,gm=wi*wi;function Gn(p){return Math.abs(p)<wi}class mn extends Ge{constructor(...p){super(...p);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new Y),this.satBounds=[,,,,].fill().map(()=>new Nn),this.points=[this.a,this.b,this.c],this.plane=new nn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Rn,this.needsUpdate=!0}intersectsSphere(p){return mm(p,this)}update(){let p=this.a,m=this.b,g=this.c,_=this.points,x=this.satAxes,v=this.satBounds,y=x[0],S=v[0];this.getNormal(y),S.setFromPoints(y,_);let b=x[1],M=v[1];b.subVectors(p,m),M.setFromPoints(b,_);let T=x[2],w=v[2];T.subVectors(m,g),w.setFromPoints(T,_);let E=x[3],A=v[3];E.subVectors(g,p),A.setFromPoints(E,_);let C=b.length(),D=T.length(),R=E.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,C<wi)if(D<wi||R<wi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(p),this.degenerateSegment.end.copy(g);else if(D<wi)if(R<wi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(p);else if(R<wi)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(g),this.degenerateSegment.end.copy(m);this.plane.setFromNormalAndCoplanarPoint(y,p),this.needsUpdate=!1}}mn.prototype.closestPointToSegment=function(){let p=new Y,m=new Y,g=new Rn;return function(x,v=null,y=null){if(this.needsUpdate)this.update();let{start:S,end:b}=x,M=this.points,T,w=1/0,E=this.plane.distanceToPoint(S),A=this.plane.distanceToPoint(b);if(E*A<0&&this.plane.intersectLine(x,p)!==null&&this.containsPoint(p)){if(v)v.copy(p);if(y)y.copy(p);return 0}for(let C=0;C<3;C++){let D=(C+1)%3;if(g.start.copy(M[C]),g.end.copy(M[D]),eo(g,x,p,m),T=p.distanceToSquared(m),T<w){if(w=T,v)v.copy(p);if(y)y.copy(m)}}if(this.closestPointToPoint(S,p),T=S.distanceToSquared(p),T<w){if(w=T,v)v.copy(p);if(y)y.copy(S)}if(this.closestPointToPoint(b,p),T=b.distanceToSquared(p),T<w){if(w=T,v)v.copy(p);if(y)y.copy(b)}return Math.sqrt(w)}}();mn.prototype.intersectsTriangle=function(){let p=new mn,m=new Nn,g=new Nn,_=new Y,x=new Y,v=new Y,y=new Y,S=new Rn,b=new Rn,M=new Y,T=new Jt,w=new Jt;function E(U,N,F,z){let I=_;if(!U.isDegenerateIntoPoint&&!U.isDegenerateIntoSegment)I.copy(U.plane.normal);else I.copy(N.plane.normal);let{satBounds:O,satAxes:V}=U;for(let W=1;W<4;W++){let J=O[W],G=V[W];if(m.setFromPoints(G,N.points),J.isSeparated(m))return!1;if(y.copy(I).cross(G),m.setFromPoints(y,U.points),g.setFromPoints(y,N.points),m.isSeparated(g))return!1}let{satBounds:q,satAxes:H}=N;for(let W=1;W<4;W++){let J=q[W],G=H[W];if(m.setFromPoints(G,U.points),J.isSeparated(m))return!1;if(y.crossVectors(I,G),m.setFromPoints(y,U.points),g.setFromPoints(y,N.points),m.isSeparated(g))return!1}if(F){if(!z)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");F.start.set(0,0,0),F.end.set(0,0,0)}return!0}function A(U,N,F,z,I,O,V,q,H,W,J){let G=V/(V-q);W.x=z+(I-z)*G,J.start.subVectors(N,U).multiplyScalar(G).add(U),G=V/(V-H),W.y=z+(O-z)*G,J.end.subVectors(F,U).multiplyScalar(G).add(U)}function C(U,N,F,z,I,O,V,q,H,W,J){if(I>0)A(U.c,U.a,U.b,z,N,F,H,V,q,W,J);else if(O>0)A(U.b,U.a,U.c,F,N,z,q,V,H,W,J);else if(q*H>0||V!=0)A(U.a,U.b,U.c,N,F,z,V,q,H,W,J);else if(q!=0)A(U.b,U.a,U.c,F,N,z,q,V,H,W,J);else if(H!=0)A(U.c,U.a,U.b,z,N,F,H,V,q,W,J);else return!0;return!1}function D(U,N,F,z){let I=N.degenerateSegment,O=U.plane.distanceToPoint(I.start),V=U.plane.distanceToPoint(I.end);if(Gn(O))if(Gn(V))return E(U,N,F,z);else{if(F)F.start.copy(I.start),F.end.copy(I.start);return U.containsPoint(I.start)}else if(Gn(V)){if(F)F.start.copy(I.end),F.end.copy(I.end);return U.containsPoint(I.end)}else if(U.plane.intersectLine(I,_)!=null){if(F)F.start.copy(_),F.end.copy(_);return U.containsPoint(_)}else return!1}function R(U,N,F){let z=N.a;if(Gn(U.plane.distanceToPoint(z))&&U.containsPoint(z)){if(F)F.start.copy(z),F.end.copy(z);return!0}else return!1}function P(U,N,F){let z=U.degenerateSegment,I=N.a;if(z.closestPointToPoint(I,!0,_),I.distanceToSquared(_)<gm){if(F)F.start.copy(I),F.end.copy(I);return!0}else return!1}function L(U,N,F,z){if(U.isDegenerateIntoSegment)if(N.isDegenerateIntoSegment){let I=U.degenerateSegment,O=N.degenerateSegment,V=x,q=v;I.delta(V),O.delta(q);let H=_.subVectors(O.start,I.start),W=V.x*q.y-V.y*q.x;if(Gn(W))return!1;let J=(H.x*q.y-H.y*q.x)/W,G=-(V.x*H.y-V.y*H.x)/W;if(J<0||J>1||G<0||G>1)return!1;let Q=I.start.z+V.z*J,it=O.start.z+q.z*G;if(Gn(Q-it)){if(F)F.start.copy(I.start).addScaledVector(V,J),F.end.copy(I.start).addScaledVector(V,J);return!0}else return!1}else if(N.isDegenerateIntoPoint)return P(U,N,F);else return D(N,U,F,z);else if(U.isDegenerateIntoPoint)if(N.isDegenerateIntoPoint)if(N.a.distanceToSquared(U.a)<gm){if(F)F.start.copy(U.a),F.end.copy(U.a);return!0}else return!1;else if(N.isDegenerateIntoSegment)return P(N,U,F);else return R(N,U,F);else if(N.isDegenerateIntoPoint)return R(U,N,F);else if(N.isDegenerateIntoSegment)return D(U,N,F,z)}return function(N,F=null,z=!1){if(this.needsUpdate)this.update();if(!N.isExtendedTriangle)p.copy(N),p.update(),N=p;else if(N.needsUpdate)N.update();let I=L(this,N,F,z);if(I!==void 0)return I;let O=this.plane,V=N.plane,q=V.distanceToPoint(this.a),H=V.distanceToPoint(this.b),W=V.distanceToPoint(this.c);if(Gn(q))q=0;if(Gn(H))H=0;if(Gn(W))W=0;let J=q*H,G=q*W;if(J>0&&G>0)return!1;let Q=O.distanceToPoint(N.a),it=O.distanceToPoint(N.b),tt=O.distanceToPoint(N.c);if(Gn(Q))Q=0;if(Gn(it))it=0;if(Gn(tt))tt=0;let pt=Q*it,ot=Q*tt;if(pt>0&&ot>0)return!1;x.copy(O.normal),v.copy(V.normal);let dt=x.cross(v),_t=0,Dt=Math.abs(dt.x),at=Math.abs(dt.y);if(at>Dt)Dt=at,_t=1;if(Math.abs(dt.z)>Dt)_t=2;let At=sb[_t],Ht=this.a[At],Ft=this.b[At],Rt=this.c[At],ae=N.a[At],Kt=N.b[At],Ut=N.c[At];if(C(this,Ht,Ft,Rt,J,G,q,H,W,T,S))return E(this,N,F,z);if(C(N,ae,Kt,Ut,pt,ot,Q,it,tt,w,b))return E(this,N,F,z);if(T.y<T.x){let jt=T.y;T.y=T.x,T.x=jt,M.copy(S.start),S.start.copy(S.end),S.end.copy(M)}if(w.y<w.x){let jt=w.y;w.y=w.x,w.x=jt,M.copy(b.start),b.start.copy(b.end),b.end.copy(M)}if(T.y<w.x||w.y<T.x)return!1;if(F){if(w.x>T.x)F.start.copy(b.start);else F.start.copy(S.start);if(w.y<T.y)F.end.copy(b.end);else F.end.copy(S.end)}return!0}}();mn.prototype.distanceToPoint=function(){let p=new Y;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();mn.prototype.distanceToTriangle=function(){let p=new Y,m=new Y,g=["a","b","c"],_=new Rn,x=new Rn;return function(y,S=null,b=null){let M=S||b?_:null;if(this.intersectsTriangle(y,M,!0)){if(S||b){if(S)M.getCenter(S);if(b)M.getCenter(b)}return 0}let T=1/0;for(let w=0;w<3;w++){let E,A=g[w],C=y[A];if(this.closestPointToPoint(C,p),E=C.distanceToSquared(p),E<T){if(T=E,S)S.copy(p);if(b)b.copy(C)}let D=this[A];if(y.closestPointToPoint(D,p),E=D.distanceToSquared(p),E<T){if(T=E,S)S.copy(D);if(b)b.copy(p)}}for(let w=0;w<3;w++){let E=g[w],A=g[(w+1)%3];_.set(this[E],this[A]);for(let C=0;C<3;C++){let D=g[C],R=g[(C+1)%3];x.set(y[D],y[R]),eo(_,x,p,m);let P=p.distanceToSquared(m);if(P<T){if(T=P,S)S.copy(p);if(b)b.copy(m)}}}return Math.sqrt(T)}}();class Fe{constructor(p,m,g){if(this.isOrientedBox=!0,this.min=new Y,this.max=new Y,this.matrix=new re,this.invMatrix=new re,this.points=[,,,,,,,,].fill().map(()=>new Y),this.satAxes=[,,,].fill().map(()=>new Y),this.satBounds=[,,,].fill().map(()=>new Nn),this.alignedSatBounds=[,,,].fill().map(()=>new Nn),this.needsUpdate=!1,p)this.min.copy(p);if(m)this.max.copy(m);if(g)this.matrix.copy(g)}set(p,m,g){this.min.copy(p),this.max.copy(m),this.matrix.copy(g),this.needsUpdate=!0}copy(p){this.min.copy(p.min),this.max.copy(p.max),this.matrix.copy(p.matrix),this.needsUpdate=!0}}Fe.prototype.update=function(){return function(){let m=this.matrix,g=this.min,_=this.max,x=this.points;for(let M=0;M<=1;M++)for(let T=0;T<=1;T++)for(let w=0;w<=1;w++){let E=1*M|2*T|4*w,A=x[E];A.x=M?_.x:g.x,A.y=T?_.y:g.y,A.z=w?_.z:g.z,A.applyMatrix4(m)}let v=this.satBounds,y=this.satAxes,S=x[0];for(let M=0;M<3;M++){let T=y[M],w=v[M],E=1<<M,A=x[E];T.subVectors(S,A),w.setFromPoints(T,x)}let b=this.alignedSatBounds;b[0].setFromPointsField(x,"x"),b[1].setFromPointsField(x,"y"),b[2].setFromPointsField(x,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Fe.prototype.intersectsBox=function(){let p=new Nn;return function(g){if(this.needsUpdate)this.update();let{min:_,max:x}=g,v=this.satBounds,y=this.satAxes,S=this.alignedSatBounds;if(p.min=_.x,p.max=x.x,S[0].isSeparated(p))return!1;if(p.min=_.y,p.max=x.y,S[1].isSeparated(p))return!1;if(p.min=_.z,p.max=x.z,S[2].isSeparated(p))return!1;for(let b=0;b<3;b++){let M=y[b],T=v[b];if(p.setFromBox(M,g),T.isSeparated(p))return!1}return!0}}();Fe.prototype.intersectsTriangle=function(){let p=new mn,m=[,,,],g=new Nn,_=new Nn,x=new Y;return function(y){if(this.needsUpdate)this.update();if(!y.isExtendedTriangle)p.copy(y),p.update(),y=p;else if(y.needsUpdate)y.update();let S=this.satBounds,b=this.satAxes;m[0]=y.a,m[1]=y.b,m[2]=y.c;for(let E=0;E<3;E++){let A=S[E],C=b[E];if(g.setFromPoints(C,m),A.isSeparated(g))return!1}let M=y.satBounds,T=y.satAxes,w=this.points;for(let E=0;E<3;E++){let A=M[E],C=T[E];if(g.setFromPoints(C,w),A.isSeparated(g))return!1}for(let E=0;E<3;E++){let A=b[E];for(let C=0;C<4;C++){let D=T[C];if(x.crossVectors(A,D),g.setFromPoints(x,m),_.setFromPoints(x,w),g.isSeparated(_))return!1}}return!0}}();Fe.prototype.closestPointToPoint=function(){return function(m,g){if(this.needsUpdate)this.update();return g.copy(m).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),g}}();Fe.prototype.distanceToPoint=function(){let p=new Y;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();Fe.prototype.distanceToBox=function(){let p=["x","y","z"],m=Array(12).fill().map(()=>new Rn),g=Array(12).fill().map(()=>new Rn),_=new Y,x=new Y;return function(y,S=0,b=null,M=null){if(this.needsUpdate)this.update();if(this.intersectsBox(y)){if(b||M){if(y.getCenter(x),this.closestPointToPoint(x,_),y.closestPointToPoint(_,x),b)b.copy(_);if(M)M.copy(x)}return 0}let T=S*S,{min:w,max:E}=y,A=this.points,C=1/0;for(let R=0;R<8;R++){let P=A[R];x.copy(P).clamp(w,E);let L=P.distanceToSquared(x);if(L<C){if(C=L,b)b.copy(P);if(M)M.copy(x);if(L<T)return Math.sqrt(L)}}let D=0;for(let R=0;R<3;R++)for(let P=0;P<=1;P++)for(let L=0;L<=1;L++){let U=(R+1)%3,N=(R+2)%3,F=P<<U|L<<N,z=1<<R|P<<U|L<<N,I=A[F],O=A[z];m[D].set(I,O);let q=p[R],H=p[U],W=p[N],J=g[D],{start:G,end:Q}=J;G[q]=w[q],G[H]=P?w[H]:E[H],G[W]=L?w[W]:E[W],Q[q]=E[q],Q[H]=P?w[H]:E[H],Q[W]=L?w[W]:E[W],D++}for(let R=0;R<=1;R++)for(let P=0;P<=1;P++)for(let L=0;L<=1;L++){x.x=R?E.x:w.x,x.y=P?E.y:w.y,x.z=L?E.z:w.z,this.closestPointToPoint(x,_);let U=x.distanceToSquared(_);if(U<C){if(C=U,b)b.copy(_);if(M)M.copy(x);if(U<T)return Math.sqrt(U)}}for(let R=0;R<12;R++){let P=m[R];for(let L=0;L<12;L++){let U=g[L];eo(P,U,_,x);let N=_.distanceToSquared(x);if(N<C){if(C=N,b)b.copy(_);if(M)M.copy(x);if(N<T)return Math.sqrt(N)}}}return Math.sqrt(C)}}();class _m extends gs{constructor(){super(()=>new mn)}}var Mn=new _m;var no=new Y,$h=new Y;function xm(p,m,g={},_=0,x=1/0){let v=_*_,y=x*x,S=1/0,b=null;if(p.shapecast({boundsTraverseOrder:(T)=>(no.copy(m).clamp(T.min,T.max),no.distanceToSquared(m)),intersectsBounds:(T,w,E)=>E<S&&E<y,intersectsTriangle:(T,w)=>{T.closestPointToPoint(m,no);let E=m.distanceToSquared(no);if(E<S)$h.copy(no),S=E,b=w;if(E<v)return!0;else return!1}}),S===1/0)return null;let M=Math.sqrt(S);if(!g.point)g.point=$h.clone();else g.point.copy($h);return g.distance=M,g.faceIndex=b,g}var Ga=parseInt(is)>=169,rb=parseInt(is)<=161,_s=new Y,xs=new Y,vs=new Y,Va=new Jt,Wa=new Jt,Xa=new Jt,vm=new Y,ym=new Y,Sm=new Y,io=new Y;function ob(p,m,g,_,x,v,y,S){let b;if(v===fn)b=p.intersectTriangle(_,g,m,!0,x);else b=p.intersectTriangle(m,g,_,v!==Bn,x);if(b===null)return null;let M=p.origin.distanceTo(x);if(M<y||M>S)return null;return{distance:M,point:x.clone()}}function bm(p,m,g,_,x,v,y,S,b,M,T){_s.fromBufferAttribute(m,v),xs.fromBufferAttribute(m,y),vs.fromBufferAttribute(m,S);let w=ob(p,_s,xs,vs,io,b,M,T);if(w){if(_){Va.fromBufferAttribute(_,v),Wa.fromBufferAttribute(_,y),Xa.fromBufferAttribute(_,S),w.uv=new Jt;let A=Ge.getInterpolation(io,_s,xs,vs,Va,Wa,Xa,w.uv);if(!Ga)w.uv=A}if(x){Va.fromBufferAttribute(x,v),Wa.fromBufferAttribute(x,y),Xa.fromBufferAttribute(x,S),w.uv1=new Jt;let A=Ge.getInterpolation(io,_s,xs,vs,Va,Wa,Xa,w.uv1);if(!Ga)w.uv1=A;if(rb)w.uv2=w.uv1}if(g){vm.fromBufferAttribute(g,v),ym.fromBufferAttribute(g,y),Sm.fromBufferAttribute(g,S),w.normal=new Y;let A=Ge.getInterpolation(io,_s,xs,vs,vm,ym,Sm,w.normal);if(w.normal.dot(p.direction)>0)w.normal.multiplyScalar(-1);if(!Ga)w.normal=A}let E={a:v,b:y,c:S,normal:new Y,materialIndex:0};if(Ge.getNormal(_s,xs,vs,E.normal),w.face=E,w.faceIndex=v,Ga){let A=new Y;Ge.getBarycoord(io,_s,xs,vs,A),w.barycoord=A}}return w}function Mm(p){return p&&p.isMaterial?p.side:p}function rr(p,m,g,_,x,v,y){let S=_*3,b=S+0,M=S+1,T=S+2,{index:w,groups:E}=p;if(p.index)b=w.getX(b),M=w.getX(M),T=w.getX(T);let{position:A,normal:C,uv:D,uv1:R}=p.attributes;if(Array.isArray(m)){let P=_*3;for(let L=0,U=E.length;L<U;L++){let{start:N,count:F,materialIndex:z}=E[L];if(P>=N&&P<N+F){let I=Mm(m[z]),O=bm(g,A,C,D,R,b,M,T,I,v,y);if(O)if(O.faceIndex=_,O.face.materialIndex=z,x)x.push(O);else return O}}}else{let P=Mm(m),L=bm(g,A,C,D,R,b,M,T,P,v,y);if(L)if(L.faceIndex=_,L.face.materialIndex=0,x)x.push(L);else return L}return null}function Ie(p,m,g,_){let{a:x,b:v,c:y}=p,S=m,b=m+1,M=m+2;if(g)S=g.getX(S),b=g.getX(b),M=g.getX(M);x.x=_.getX(S),x.y=_.getY(S),x.z=_.getZ(S),v.x=_.getX(b),v.y=_.getY(b),v.z=_.getZ(b),y.x=_.getX(M),y.y=_.getY(M),y.z=_.getZ(M)}function Em(p,m,g,_,x,v,y,S){let{geometry:b,_indirectBuffer:M}=p;for(let T=_,w=_+x;T<w;T++)rr(b,m,g,T,v,y,S)}function Tm(p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:b}=p,M=1/0,T=null;for(let w=_,E=_+x;w<E;w++){let A;if(A=rr(S,m,g,w,null,v,y),A&&A.distance<M)T=A,M=A.distance}return T}function wm(p,m,g,_,x,v,y){let{geometry:S}=g,{index:b}=S,M=S.attributes.position;for(let T=p,w=m+p;T<w;T++){let E;if(E=T,Ie(y,E*3,b,M),y.needsUpdate=!0,_(y,E,x,v))return!0}return!1}function Am(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,v,y,S,b,M=0,T=p._roots;for(let E=0,A=T.length;E<A;E++)v=T[E],y=new Uint32Array(v),S=new Uint16Array(v),b=new Float32Array(v),w(0,M),M+=v.byteLength;function w(E,A,C=!1){let D=E*2;if(me(D,S)){let R=Me(E,y),P=Ae(D,S),L=1/0,U=1/0,N=1/0,F=-1/0,z=-1/0,I=-1/0;for(let O=3*R,V=3*(R+P);O<V;O++){let q=_[O],H=x.getX(q),W=x.getY(q),J=x.getZ(q);if(H<L)L=H;if(H>F)F=H;if(W<U)U=W;if(W>z)z=W;if(J<N)N=J;if(J>I)I=J}if(b[E+0]!==L||b[E+1]!==U||b[E+2]!==N||b[E+3]!==F||b[E+4]!==z||b[E+5]!==I)return b[E+0]=L,b[E+1]=U,b[E+2]=N,b[E+3]=F,b[E+4]=z,b[E+5]=I,!0;else return!1}else{let R=ye(E),P=Se(E,y),L=C,U=!1,N=!1;if(m){if(!L){let q=R/we+A/tn,H=P/we+A/tn;U=m.has(q),N=m.has(H),L=!U&&!N}}else U=!0,N=!0;let F=L||U,z=L||N,I=!1;if(F)I=w(R,A,L);let O=!1;if(z)O=w(P,A,L);let V=I||O;if(V)for(let q=0;q<3;q++){let H=R+q,W=P+q,J=b[H],G=b[H+3],Q=b[W],it=b[W+3];b[E+q]=J<Q?J:Q,b[E+q+3]=G>it?G:it}return V}}}function gn(p,m,g,_,x){let v,y,S,b,M,T,w=1/g.direction.x,E=1/g.direction.y,A=1/g.direction.z,C=g.origin.x,D=g.origin.y,R=g.origin.z,P=m[p],L=m[p+3],U=m[p+1],N=m[p+3+1],F=m[p+2],z=m[p+3+2];if(w>=0)v=(P-C)*w,y=(L-C)*w;else v=(L-C)*w,y=(P-C)*w;if(E>=0)S=(U-D)*E,b=(N-D)*E;else S=(N-D)*E,b=(U-D)*E;if(v>b||S>y)return!1;if(S>v||isNaN(v))v=S;if(b<y||isNaN(y))y=b;if(A>=0)M=(F-R)*A,T=(z-R)*A;else M=(z-R)*A,T=(F-R)*A;if(v>T||M>y)return!1;if(M>v||v!==v)v=M;if(T<y||y!==y)y=T;return v<=x&&y>=_}function Rm(p,m,g,_,x,v,y,S){let{geometry:b,_indirectBuffer:M}=p;for(let T=_,w=_+x;T<w;T++){let E=M?M[T]:T;rr(b,m,g,E,v,y,S)}}function Cm(p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:b}=p,M=1/0,T=null;for(let w=_,E=_+x;w<E;w++){let A;if(A=rr(S,m,g,b?b[w]:w,null,v,y),A&&A.distance<M)T=A,M=A.distance}return T}function Pm(p,m,g,_,x,v,y){let{geometry:S}=g,{index:b}=S,M=S.attributes.position;for(let T=p,w=m+p;T<w;T++){let E;if(E=g.resolveTriangleIndex(T),Ie(y,E*3,b,M),y.needsUpdate=!0,_(y,E,x,v))return!0}return!1}function Im(p,m,g,_,x,v,y){if(ue.setBuffer(p._roots[m]),gn(0,ue.float32Array,_,v,y))Jh(0,p,g,_,x,v,y);ue.clearBuffer()}function Jh(p,m,g,_,x,v,y){let{float32Array:S,uint16Array:b,uint32Array:M}=ue,T=p*2;if(me(T,b)){let E=Me(p,M),A=Ae(T,b);Em(m,g,_,E,A,x,v,y)}else{let E=ye(p);if(gn(E,S,_,v,y))Jh(E,m,g,_,x,v,y);let A=Se(p,M);if(gn(A,S,_,v,y))Jh(A,m,g,_,x,v,y)}}var ab=["x","y","z"];function Lm(p,m,g,_,x,v){ue.setBuffer(p._roots[m]);let y=null;if(gn(0,ue.float32Array,_,x,v))y=Kh(0,p,g,_,x,v);return ue.clearBuffer(),y}function Kh(p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:b}=ue,M=p*2;if(me(M,S)){let w=Me(p,b),E=Ae(M,S);return Tm(m,g,_,w,E,x,v)}else{let w=Ks(p,b),E=ab[w],C=_.direction[E]>=0,D,R;if(C)D=ye(p),R=Se(p,b);else D=Se(p,b),R=ye(p);let L=gn(D,y,_,x,v)?Kh(D,m,g,_,x,v):null;if(L){let F=L.point[E];if(C?F<=y[R+w]:F>=y[R+w+3])return L}let N=gn(R,y,_,x,v)?Kh(R,m,g,_,x,v):null;if(L&&N)return L.distance<=N.distance?L:N;else return L||N||null}}var qa=new ve,or=new mn,ar=new mn,so=new re,Nm=new Fe,Ya=new Fe;function Dm(p,m,g,_){ue.setBuffer(p._roots[m]);let x=jh(0,p,g,_);return ue.clearBuffer(),x}function jh(p,m,g,_,x=null){let{float32Array:v,uint16Array:y,uint32Array:S}=ue,b=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();Nm.set(g.boundingBox.min,g.boundingBox.max,_),x=Nm}if(me(b,y)){let T=m.geometry,w=T.index,E=T.attributes.position,A=g.index,C=g.attributes.position,D=Me(p,S),R=Ae(b,y);if(so.copy(_).invert(),g.boundsTree)return Pe(De(p),v,Ya),Ya.matrix.copy(so),Ya.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(L)=>Ya.intersectsBox(L),intersectsTriangle:(L)=>{L.a.applyMatrix4(_),L.b.applyMatrix4(_),L.c.applyMatrix4(_),L.needsUpdate=!0;for(let U=D*3,N=(R+D)*3;U<N;U+=3)if(Ie(ar,U,w,E),ar.needsUpdate=!0,L.intersectsTriangle(ar))return!0;return!1}});else{let P=Xi(g);for(let L=D*3,U=(R+D)*3;L<U;L+=3){Ie(or,L,w,E),or.a.applyMatrix4(so),or.b.applyMatrix4(so),or.c.applyMatrix4(so),or.needsUpdate=!0;for(let N=0,F=P*3;N<F;N+=3)if(Ie(ar,N,A,C),ar.needsUpdate=!0,or.intersectsTriangle(ar))return!0}}}else{let T=ye(p),w=Se(p,S);if(Pe(De(T),v,qa),x.intersectsBox(qa)&&jh(T,m,g,_,x))return!0;if(Pe(De(w),v,qa),x.intersectsBox(qa)&&jh(w,m,g,_,x))return!0;return!1}}var Za=new re,Qh=new Fe,ro=new Fe,lb=new Y,cb=new Y,hb=new Y,ub=new Y;function Um(p,m,g,_={},x={},v=0,y=1/0){if(!m.boundingBox)m.computeBoundingBox();Qh.set(m.boundingBox.min,m.boundingBox.max,g),Qh.needsUpdate=!0;let S=p.geometry,b=S.attributes.position,M=S.index,T=m.attributes.position,w=m.index,E=Mn.getPrimitive(),A=Mn.getPrimitive(),C=lb,D=cb,R=null,P=null;if(x)R=hb,P=ub;let L=1/0,U=null,N=null;if(Za.copy(g).invert(),ro.matrix.copy(Za),p.shapecast({boundsTraverseOrder:(F)=>Qh.distanceToBox(F),intersectsBounds:(F,z,I)=>{if(I<L&&I<y){if(z)ro.min.copy(F.min),ro.max.copy(F.max),ro.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree)return m.boundsTree.shapecast({boundsTraverseOrder:(O)=>ro.distanceToBox(O),intersectsBounds:(O,V,q)=>q<L&&q<y,intersectsRange:(O,V)=>{for(let q=O,H=O+V;q<H;q++){Ie(A,3*q,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let W=F,J=F+z;W<J;W++){Ie(E,3*W,M,b),E.needsUpdate=!0;let G=E.distanceToTriangle(A,C,R);if(G<L){if(D.copy(C),P)P.copy(R);L=G,U=W,N=q}if(G<v)return!0}}}});else{let I=Xi(m);for(let O=0,V=I;O<V;O++){Ie(A,3*O,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let q=F,H=F+z;q<H;q++){Ie(E,3*q,M,b),E.needsUpdate=!0;let W=E.distanceToTriangle(A,C,R);if(W<L){if(D.copy(C),P)P.copy(R);L=W,U=q,N=O}if(W<v)return!0}}}}}),Mn.releasePrimitive(E),Mn.releasePrimitive(A),L===1/0)return null;if(!_.point)_.point=D.clone();else _.point.copy(D);if(_.distance=L,_.faceIndex=U,x){if(!x.point)x.point=P.clone();else x.point.copy(P);x.point.applyMatrix4(Za),D.applyMatrix4(Za),x.distance=D.sub(x.point).length(),x.faceIndex=N}return _}function Om(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,v,y,S,b,M=0,T=p._roots;for(let E=0,A=T.length;E<A;E++)v=T[E],y=new Uint32Array(v),S=new Uint16Array(v),b=new Float32Array(v),w(0,M),M+=v.byteLength;function w(E,A,C=!1){let D=E*2;if(me(D,S)){let R=Me(E,y),P=Ae(D,S),L=1/0,U=1/0,N=1/0,F=-1/0,z=-1/0,I=-1/0;for(let O=R,V=R+P;O<V;O++){let q=3*p.resolveTriangleIndex(O);for(let H=0;H<3;H++){let W=q+H;W=_?_[W]:W;let J=x.getX(W),G=x.getY(W),Q=x.getZ(W);if(J<L)L=J;if(J>F)F=J;if(G<U)U=G;if(G>z)z=G;if(Q<N)N=Q;if(Q>I)I=Q}}if(b[E+0]!==L||b[E+1]!==U||b[E+2]!==N||b[E+3]!==F||b[E+4]!==z||b[E+5]!==I)return b[E+0]=L,b[E+1]=U,b[E+2]=N,b[E+3]=F,b[E+4]=z,b[E+5]=I,!0;else return!1}else{let R=ye(E),P=Se(E,y),L=C,U=!1,N=!1;if(m){if(!L){let q=R/we+A/tn,H=P/we+A/tn;U=m.has(q),N=m.has(H),L=!U&&!N}}else U=!0,N=!0;let F=L||U,z=L||N,I=!1;if(F)I=w(R,A,L);let O=!1;if(z)O=w(P,A,L);let V=I||O;if(V)for(let q=0;q<3;q++){let H=R+q,W=P+q,J=b[H],G=b[H+3],Q=b[W],it=b[W+3];b[E+q]=J<Q?J:Q,b[E+q+3]=G>it?G:it}return V}}}function Fm(p,m,g,_,x,v,y){if(ue.setBuffer(p._roots[m]),gn(0,ue.float32Array,_,v,y))tu(0,p,g,_,x,v,y);ue.clearBuffer()}function tu(p,m,g,_,x,v,y){let{float32Array:S,uint16Array:b,uint32Array:M}=ue,T=p*2;if(me(T,b)){let E=Me(p,M),A=Ae(T,b);Rm(m,g,_,E,A,x,v,y)}else{let E=ye(p);if(gn(E,S,_,v,y))tu(E,m,g,_,x,v,y);let A=Se(p,M);if(gn(A,S,_,v,y))tu(A,m,g,_,x,v,y)}}var db=["x","y","z"];function Bm(p,m,g,_,x,v){ue.setBuffer(p._roots[m]);let y=null;if(gn(0,ue.float32Array,_,x,v))y=eu(0,p,g,_,x,v);return ue.clearBuffer(),y}function eu(p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:b}=ue,M=p*2;if(me(M,S)){let w=Me(p,b),E=Ae(M,S);return Cm(m,g,_,w,E,x,v)}else{let w=Ks(p,b),E=db[w],C=_.direction[E]>=0,D,R;if(C)D=ye(p),R=Se(p,b);else D=Se(p,b),R=ye(p);let L=gn(D,y,_,x,v)?eu(D,m,g,_,x,v):null;if(L){let F=L.point[E];if(C?F<=y[R+w]:F>=y[R+w+3])return L}let N=gn(R,y,_,x,v)?eu(R,m,g,_,x,v):null;if(L&&N)return L.distance<=N.distance?L:N;else return L||N||null}}var $a=new ve,lr=new mn,cr=new mn,oo=new re,km=new Fe,Ja=new Fe;function zm(p,m,g,_){ue.setBuffer(p._roots[m]);let x=nu(0,p,g,_);return ue.clearBuffer(),x}function nu(p,m,g,_,x=null){let{float32Array:v,uint16Array:y,uint32Array:S}=ue,b=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();km.set(g.boundingBox.min,g.boundingBox.max,_),x=km}if(me(b,y)){let T=m.geometry,w=T.index,E=T.attributes.position,A=g.index,C=g.attributes.position,D=Me(p,S),R=Ae(b,y);if(oo.copy(_).invert(),g.boundsTree)return Pe(De(p),v,Ja),Ja.matrix.copy(oo),Ja.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(L)=>Ja.intersectsBox(L),intersectsTriangle:(L)=>{L.a.applyMatrix4(_),L.b.applyMatrix4(_),L.c.applyMatrix4(_),L.needsUpdate=!0;for(let U=D,N=R+D;U<N;U++)if(Ie(cr,3*m.resolveTriangleIndex(U),w,E),cr.needsUpdate=!0,L.intersectsTriangle(cr))return!0;return!1}});else{let P=Xi(g);for(let L=D,U=R+D;L<U;L++){let N=m.resolveTriangleIndex(L);Ie(lr,3*N,w,E),lr.a.applyMatrix4(oo),lr.b.applyMatrix4(oo),lr.c.applyMatrix4(oo),lr.needsUpdate=!0;for(let F=0,z=P*3;F<z;F+=3)if(Ie(cr,F,A,C),cr.needsUpdate=!0,lr.intersectsTriangle(cr))return!0}}}else{let T=ye(p),w=Se(p,S);if(Pe(De(T),v,$a),x.intersectsBox($a)&&nu(T,m,g,_,x))return!0;if(Pe(De(w),v,$a),x.intersectsBox($a)&&nu(w,m,g,_,x))return!0;return!1}}var Ka=new re,iu=new Fe,ao=new Fe,fb=new Y,pb=new Y,mb=new Y,gb=new Y;function Hm(p,m,g,_={},x={},v=0,y=1/0){if(!m.boundingBox)m.computeBoundingBox();iu.set(m.boundingBox.min,m.boundingBox.max,g),iu.needsUpdate=!0;let S=p.geometry,b=S.attributes.position,M=S.index,T=m.attributes.position,w=m.index,E=Mn.getPrimitive(),A=Mn.getPrimitive(),C=fb,D=pb,R=null,P=null;if(x)R=mb,P=gb;let L=1/0,U=null,N=null;if(Ka.copy(g).invert(),ao.matrix.copy(Ka),p.shapecast({boundsTraverseOrder:(F)=>iu.distanceToBox(F),intersectsBounds:(F,z,I)=>{if(I<L&&I<y){if(z)ao.min.copy(F.min),ao.max.copy(F.max),ao.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree){let I=m.boundsTree;return I.shapecast({boundsTraverseOrder:(O)=>ao.distanceToBox(O),intersectsBounds:(O,V,q)=>q<L&&q<y,intersectsRange:(O,V)=>{for(let q=O,H=O+V;q<H;q++){let W=I.resolveTriangleIndex(q);Ie(A,3*W,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let J=F,G=F+z;J<G;J++){let Q=p.resolveTriangleIndex(J);Ie(E,3*Q,M,b),E.needsUpdate=!0;let it=E.distanceToTriangle(A,C,R);if(it<L){if(D.copy(C),P)P.copy(R);L=it,U=J,N=q}if(it<v)return!0}}}})}else{let I=Xi(m);for(let O=0,V=I;O<V;O++){Ie(A,3*O,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let q=F,H=F+z;q<H;q++){let W=p.resolveTriangleIndex(q);Ie(E,3*W,M,b),E.needsUpdate=!0;let J=E.distanceToTriangle(A,C,R);if(J<L){if(D.copy(C),P)P.copy(R);L=J,U=q,N=O}if(J<v)return!0}}}}}),Mn.releasePrimitive(E),Mn.releasePrimitive(A),L===1/0)return null;if(!_.point)_.point=D.clone();else _.point.copy(D);if(_.distance=L,_.faceIndex=U,x){if(!x.point)x.point=P.clone();else x.point.copy(P);x.point.applyMatrix4(Ka),D.applyMatrix4(Ka),x.distance=D.sub(x.point).length(),x.faceIndex=N}return _}function su(p,m,g){if(p===null)return null;return p.point.applyMatrix4(m.matrixWorld),p.distance=p.point.distanceTo(g.ray.origin),p.object=m,p}var ja=new Fe,Qa=new ki,Gm=new Y,Vm=new re,Wm=new Y,ru=["getX","getY","getZ"];class hr extends Zh{static serialize(p,m={}){m={cloneBuffers:!0,...m};let{geometry:g,_roots:_,_indirectBuffer:x}=p,v=g.getIndex(),y={version:1,roots:null,index:null,indirectBuffer:null};if(m.cloneBuffers)y.roots=_.map((S)=>S.slice()),y.index=v?v.array.slice():null,y.indirectBuffer=x?x.slice():null;else y.roots=_,y.index=v?v.array:null,y.indirectBuffer=x;return y}static deserialize(p,m,g={}){g={setIndex:!0,indirect:Boolean(p.indirectBuffer),...g};let{index:_,roots:x,indirectBuffer:v}=p;if(!p.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),S(x);let y=new hr(m,{...g,[jr]:!0});if(y._roots=x,y._indirectBuffer=v||null,g.setIndex){let b=m.getIndex();if(b===null){let M=new We(p.index,1,!1);m.setIndex(M)}else if(b.array!==_)b.array.set(_),b.needsUpdate=!0}return y;function S(b){for(let M=0;M<b.length;M++){let T=b[M],w=new Uint32Array(T),E=new Uint16Array(T);for(let A=0,C=T.byteLength/tn;A<C;A++){let D=we*A,R=2*D;if(!me(R,E))w[D+6]=w[D+6]/we-A}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(p,m={}){if(m.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),m={...m,targetLeafSize:m.maxLeafTris};super(p,m)}shiftTriangleOffsets(p){return super.shiftPrimitiveOffsets(p)}writePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,v=_.attributes.position,y=_.index?_.index.array:null,b=(x?x[p]:p)*3,M=b+0,T=b+1,w=b+2;if(y)M=y[M],T=y[T],w=y[w];for(let E=0;E<3;E++){let A=v[ru[E]](M),C=v[ru[E]](T),D=v[ru[E]](w),R=A;if(C<R)R=C;if(D<R)R=D;let P=A;if(C>P)P=C;if(D>P)P=D;m[g+E]=R,m[g+E+3]=P}return m}computePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,v=_.attributes.position,y=_.index?_.index.array:null,S=v.normalized;if(p<0||m+p-g.offset>g.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let b=v.array,M=v.offset||0,T=3;if(v.isInterleavedBufferAttribute)T=v.data.stride;let w=["getX","getY","getZ"],E=g.offset;for(let A=p,C=p+m;A<C;A++){let R=(x?x[A]:A)*3,P=(A-E)*6,L=R+0,U=R+1,N=R+2;if(y)L=y[L],U=y[U],N=y[N];if(!S)L=L*T+M,U=U*T+M,N=N*T+M;for(let F=0;F<3;F++){let z,I,O;if(S)z=v[w[F]](L),I=v[w[F]](U),O=v[w[F]](N);else z=b[L+F],I=b[U+F],O=b[N+F];let V=z;if(I<V)V=I;if(O<V)V=O;let q=z;if(I>q)q=I;if(O>q)q=O;let H=(q-V)/2,W=F*2;g[P+W+0]=V+H,g[P+W+1]=H+(Math.abs(V)+H)*Js}}return g}raycastObject3D(p,m,g=[]){let{material:_}=p;if(_===void 0)return;Vm.copy(p.matrixWorld).invert(),Qa.copy(m.ray).applyMatrix4(Vm),Wm.setFromMatrixScale(p.matrixWorld),Gm.copy(Qa.direction).multiply(Wm);let x=Gm.length(),v=m.near/x,y=m.far/x;if(m.firstHitOnly===!0){let S=this.raycastFirst(Qa,_,v,y);if(S=su(S,p,m),S)g.push(S)}else{let S=this.raycast(Qa,_,v,y);for(let b=0,M=S.length;b<M;b++){let T=su(S[b],p,m);if(T)g.push(T)}}return g}refit(p=null){return(this.indirect?Om:Am)(this,p)}raycast(p,m=xi,g=0,_=1/0){let x=this._roots,v=[],y=this.indirect?Fm:Im;for(let S=0,b=x.length;S<b;S++)y(this,S,m,p,v,g,_);return v}raycastFirst(p,m=xi,g=0,_=1/0){let x=this._roots,v=null,y=this.indirect?Bm:Lm;for(let S=0,b=x.length;S<b;S++){let M=y(this,S,m,p,g,_);if(M!=null&&(v==null||M.distance<v.distance))v=M}return v}intersectsGeometry(p,m){let g=!1,_=this._roots,x=this.indirect?zm:Dm;for(let v=0,y=_.length;v<y;v++)if(g=x(this,v,p,m),g)break;return g}shapecast(p){let m=Mn.getPrimitive(),g=super.shapecast({...p,intersectsPrimitive:p.intersectsTriangle,scratchPrimitive:m,iterate:this.indirect?Pm:wm});return Mn.releasePrimitive(m),g}bvhcast(p,m,g){let{intersectsRanges:_,intersectsTriangles:x}=g,v=Mn.getPrimitive(),y=this.geometry.index,S=this.geometry.attributes.position,b=this.indirect?(A)=>{let C=this.resolveTriangleIndex(A);Ie(v,C*3,y,S)}:(A)=>{Ie(v,A*3,y,S)},M=Mn.getPrimitive(),T=p.geometry.index,w=p.geometry.attributes.position,E=p.indirect?(A)=>{let C=p.resolveTriangleIndex(A);Ie(M,C*3,T,w)}:(A)=>{Ie(M,A*3,T,w)};if(x){if(!(p instanceof hr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let A=(C,D,R,P,L,U,N,F)=>{for(let z=R,I=R+P;z<I;z++){E(z),M.a.applyMatrix4(m),M.b.applyMatrix4(m),M.c.applyMatrix4(m),M.needsUpdate=!0;for(let O=C,V=C+D;O<V;O++)if(b(O),v.needsUpdate=!0,x(v,M,O,z,L,U,N,F))return!0}return!1};if(_){let C=_;_=function(D,R,P,L,U,N,F,z){if(!C(D,R,P,L,U,N,F,z))return A(D,R,P,L,U,N,F,z);return!0}}else _=A}return super.bvhcast(p,m,{intersectsRanges:_})}intersectsBox(p,m){return ja.set(p.min,p.max,m),ja.needsUpdate=!0,this.shapecast({intersectsBounds:(g)=>ja.intersectsBox(g),intersectsTriangle:(g)=>ja.intersectsTriangle(g)})}intersectsSphere(p){return this.shapecast({intersectsBounds:(m)=>p.intersectsBox(m),intersectsTriangle:(m)=>m.intersectsSphere(p)})}closestPointToGeometry(p,m,g={},_={},x=0,v=1/0){return(this.indirect?Hm:Um)(this,p,m,g,_,x,v)}closestPointToPoint(p,m={},g=0,_=1/0){return xm(this,p,m,g,_)}}var LP=parseInt(is)>=166,ur={Mesh:rn.prototype.raycast,Line:cs.prototype.raycast,LineSegments:Ei.prototype.raycast,LineLoop:hs.prototype.raycast,Points:us.prototype.raycast,BatchedMesh:ua.prototype.raycast},on=new rn,tl=[];function Xm(p,m){if(this.isBatchedMesh)_b.call(this,p,m);else{let{geometry:g}=this;if(g.boundsTree)g.boundsTree.raycastObject3D(this,p,m);else{let _;if(this instanceof rn)_=ur.Mesh;else if(this instanceof Ei)_=ur.LineSegments;else if(this instanceof hs)_=ur.LineLoop;else if(this instanceof cs)_=ur.Line;else if(this instanceof us)_=ur.Points;else throw Error("BVH: Fallback raycast function not found.");_.call(this,p,m)}}}function _b(p,m){if(this.boundsTrees){let g=this.boundsTrees,_=this._drawInfo||this._instanceInfo,x=this._drawRanges||this._geometryInfo,v=this.matrixWorld;on.material=this.material,on.geometry=this.geometry;let y=on.geometry.boundsTree,S=on.geometry.drawRange;if(on.geometry.boundingSphere===null)on.geometry.boundingSphere=new bn;for(let b=0,M=_.length;b<M;b++){if(!this.getVisibleAt(b))continue;let T=_[b].geometryIndex;if(on.geometry.boundsTree=g[T],this.getMatrixAt(b,on.matrixWorld).premultiply(v),!on.geometry.boundsTree){this.getBoundingBoxAt(T,on.geometry.boundingBox),this.getBoundingSphereAt(T,on.geometry.boundingSphere);let w=x[T];on.geometry.setDrawRange(w.start,w.count)}on.raycast(p,tl);for(let w=0,E=tl.length;w<E;w++){let A=tl[w];A.object=this,A.batchId=b,m.push(A)}tl.length=0}on.geometry.boundsTree=y,on.geometry.drawRange=S,on.material=null,on.geometry=null}else ur.BatchedMesh.call(this,p,m)}function qm(p){let m=[0];for(let g=1;g<p.length;g++)m.push(m[g-1]+Math.hypot(p[g][0]-p[g-1][0],p[g][1]-p[g-1][1]));return m}function dr(p,m,g){let _=0,x=m.length-1;if(g<=0)return[p[0][0],p[0][1]];if(g>=m[x])return[p[x][0],p[x][1]];while(x-_>1){let y=_+x>>1;if(m[y]<=g)_=y;else x=y}let v=(g-m[_])/(m[x]-m[_]||1);return[p[_][0]+(p[x][0]-p[_][0])*v,p[_][1]+(p[x][1]-p[_][1])*v]}var Dn=11,Ym=6,xb=12,vb=100,yb=500,Sb=3,bb=500,ou=2,au=300000,Mb=45,lu=22,Eb=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,Tb=/^nocol_far/,wb=1.5,Ab=0.004,Zm=0.02,Rb=10,Cb=200,el=1000,cu=1,Pb=4,$m=2,Ib=2,Lb=0.15,Jm=100,Nb=3,Km=3,nl=1,Db=5,Ub=0.1,Ob=0.002,jm=1000,Fb=80000,Bb=2,kb=24,zb=6000,Hb=0.1,Qm=30,Gb=0.6,Vb=0.12,Wb=0.15,Xb=0.05,qb=0.000001,Yb=0.01,Zb=100,tg=0.3,$b=new Set(["KeyW","KeyA","KeyS","KeyD"]),Jb=60,hu=4,eg="#ffd21f",ng=300,Kb=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],jb=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,Qb=/_wire_/,tM=6,eM=8,Kn=0,nM=1,iM=new Set(["power line"]),sM=/^(1ROAD|1GRASS|1GRAVEL)_ground/,rM=/^1ROAD_ground/,ig="#27d3c3",ys=0.3,sg=14,il=1.5,oM=50,aM=0.25,lM=5000,cM=200,uu=4,rg=64;function og(p,m){performance.clearMeasures(p);let g=performance.now(),_=m();return performance.measure(p,{start:g}),_}function hM(p){let m=document.createElement("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d",{willReadFrequently:!0});return g?.drawImage(p,0,0),g?g.getImageData(0,0,p.width,p.height):null}function uM(p){let{roots:m,indirectBuffer:g}=hr.serialize(p,{cloneBuffers:!1});return m.reduce((_,x)=>_+x.byteLength,g?.byteLength??0)}function dM(p){let m=performance.now(),g=new hr(p.geometry,{indirect:!0}),_=uM(g);return p.geometry.boundsTree=g,p.raycast=Xm,performance.measure("map2lap.bvh",{start:m,detail:_}),_}var ag=(p)=>p.vertices*Dn*4+4+p.indices*2;function jn(p,m){let g=m.getBoundingClientRect();return new Jt((p.clientX-g.left)/g.width*2-1,-(p.clientY-g.top)/g.height*2+1)}async function sl(p,m,g=Sb){let _;try{if(_=await fetch(p,{signal:m}),_.ok)return await _.arrayBuffer()}catch(x){if(m.aborted||g<=1)throw x;return await new Promise((v)=>setTimeout(v,bb)),sl(p,m,g-1)}throw Error((await _.json().catch(()=>null))?.error??`${p}: ${_.status}`)}function cg(p){let m=[],g=0;return async(_)=>{if(g>=p)await new Promise((x)=>m.push(x));g++;try{return await _()}finally{g--,m.shift()?.()}}}var fM=cg(xb);async function pM(p,m,g){let _;if(/\.dds$/i.test(m)){let x=new Uh().parse(p,!0);_=new Vr(x.mipmaps,x.width,x.height,x.format),_.minFilter=x.mipmapCount>1?Yn:An}else{let x=await createImageBitmap(new Blob([p]),{imageOrientation:"none",premultiplyAlpha:"none"});_=new Ve(x),_.generateMipmaps=!0,_.minFilter=Yn}return _.flipY=!1,_.wrapS=_.wrapT=jo,_.anisotropy=g,_.colorSpace=sa,_.needsUpdate=!0,_}function lg(p,m,g,_){let x=p.at(-1),v=p.at(-2);if(p.length>=lM)x[2]+=_;else if(Math.hypot(m-x[0],g-x[1])>=aM)p.push([m,g,_]);else if(v&&v[0]===x[0]&&v[1]===x[1])x[2]+=_;else p.push([x[0],x[1],_])}function mM(p,m){let g=[],_=m/2,x=(S)=>{let b=p[Math.max(0,S-1)],M=p[Math.min(p.length-1,S+1)],T=Math.hypot(M[0]-b[0],M[2]-b[2])||1;return[(M[2]-b[2])/T*_,(b[0]-M[0])/T*_]},v=(S)=>{let[b,M]=x(S);return[p[S][0]+b,p[S][1]+ys,p[S][2]+M]},y=(S)=>{let[b,M]=x(S);return[p[S][0]-b,p[S][1]+ys,p[S][2]-M]};for(let S=0;S+1<p.length;S++)g.push(...v(S),...v(S+1),...y(S),...y(S+1));return g.push(...v(0),...y(0),...v(p.length-1),...y(p.length-1)),g}function gM([p,m,g]){let _=m+ys;return[p-il,_,g,p+il,_,g,p,_,g-il,p,_,g+il]}function _M(p,m,g){return Math.hypot(...p.map((_,x)=>Math.max(Math.abs(m[x]-_),Math.abs(g[x]-_))))}function lo(p,m){p.computeBoundingBox();let g=p.boundingBox;p.boundingSphere=new bn(new Y(...m.center),Math.max(m.radius,_M(m.center,g.min.toArray(),g.max.toArray())))}function xM(p,m){let g=new qe,_=new ha(new Float32Array(m,0,p.vertices*Dn),Dn);g.setAttribute("position",new ls(_,3,0)),g.setAttribute("normal",new ls(_,3,3)),g.setAttribute("uv",new ls(_,2,6));let x=p.vertices*Dn*4+4;return g.setIndex(new We(new Uint16Array(m,x,p.indices),1)),lo(g,p),g}class du{renderer;scene=new aa;camera=new wn(55,1,0.5,au);resizing;down=new Yr;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=lu;highest=jm;area=yl([]);lastGround=0;zoomLeft=0;zoomAim=new Y;host;flying=new Set;ride=null;rideSpeed=0;rideHeight=0;rideTold=0;onRideMoving=()=>{};onRideMetre=()=>{};lastFrame=0;settings=u;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new Yr;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=ng;onIndexed=()=>{};picks=new Map;adding=!1;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};draft=0;refreshes=cg(Ym);brush=null;onStroke=()=>{};askPreview=()=>Promise.resolve(null);onStrokeRefused=()=>{};onToolWheel=()=>{};ring=null;stroke=null;previewed=new Set;underPreview=new Map;previewShown=new Map;wheelTaken=!1;marking=null;pins=[];pinMarks=null;pinTexture=null;dragged=null;onPinMoved=()=>{};onPinTaken=()=>{};onClicked=()=>{};band=null;moveTool=!1;onMoved=()=>{};placed=new Map;dragging=null;constructor(p){this.host=p,this.renderer=new Dh({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),p.appendChild(this.renderer.domElement),this.scene.background=new oe("#a9cfe9"),this.scene.add(new Ma("#ffffff",2));let m=new ba("#fff4e0",1.6);m.position.set(0.5,1,0.35),this.scene.add(m),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.moves(this.renderer.domElement),this.dragPins(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(p),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(p){if(this.shown=p,p)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(p){this.settings=p}setHover(p){this.onHover=p}setPick(p){this.onPick=p}setIndexed(p){this.onIndexed=p,p(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.forgetPicks(),this.onPick(null)}setAdding(p){this.adding=p}setRemoved(p,m=[],g=[]){this.named={ids:p,objectSorts:new Set(g)};let _=this.wanted(),x=new Set(m),v=m.length!==this.removedSorts.size||m.some((S)=>!this.removedSorts.has(S)),y=!1;for(let S of this.removed)if(!_.has(S))this.leaveOut(S,!1),y=!0;if(v){this.removedSorts=x;for(let S of this.billboardMeshes())this.restore(S);y=!0}for(let S of _)if(y||!this.removed.has(S))this.leaveOut(S,!0);if(y&&this.removedSorts.size)for(let S of this.billboardMeshes())this.leaveOutSorts(S);if(this.removed=_,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(p=this.named){return new Set([...p.ids,...bl(this.data?.objects??{},p.objectSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let p of this.removed){let m=p.slice(0,p.lastIndexOf("#"));if(!this.data?.objects?.[m]){if(!this.billboardsOut.has(m))this.billboardsOut.set(m,[]);this.billboardsOut.get(m).push(p);continue}for(let g of this.piecesOf(p)){if(!this.listedOut.has(g.mesh))this.listedOut.set(g.mesh,[]);this.listedOut.get(g.mesh).push(g)}}}countOfListed(p,m,g){if(!this.data)return 0;return Xu(this.data.objects,p,Wu(this.wanted({ids:m,objectSorts:new Set(g)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(p){let m=p.userData.indices;if(!m)return;let g=p.geometry.getIndex();g.array.set(m),g.needsUpdate=!0}*billboardsOf(p){let m=p.userData.info,g=m.indices/3,_=m.first_face;for(let x=xr(0,_);x<=xr(Math.max(0,g-1),_);x++){let[v,y]=vo(x,_,g);if(v<y)yield[x,v,y]}}spriteOf(p,m){let g=p.geometry.getAttribute("uv"),_=p.userData.indices??p.geometry.getIndex().array,[x,v,y]=[_[m*3],_[m*3+1],_[m*3+2]];return Ml(this.data.atlas,(g.getX(x)+g.getX(v)+g.getX(y))/3,(g.getY(x)+g.getY(v)+g.getY(y))/3)}leaveOutSorts(p){if(!this.removedSorts.size||!this.data)return;let m=p.userData.info;for(let[,g,_]of this.billboardsOf(p)){let x=this.spriteOf(p,g);if(x&&this.removedSorts.has(x))this.leaveOutIn(p,{mesh:m.i,from:g,end:_},!0)}}countOf(p){let m=new Set;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,v]of this.billboardsOf(g))if(this.spriteOf(g,v)===p)m.add(`${_.base}#${x}`)}return m.size}piecesOf(p){let m=p.lastIndexOf("#"),g=p.slice(0,m),_=Number(p.slice(m+1)),x=this.data?.objects?.[g]?.faces[_];if(x)return[...x.map(([v,y,S])=>({mesh:v,from:y,end:y+S})),...(this.belonging.get(p)??[]).flatMap((v)=>this.piecesOf(v))];return(this.parts.get(g)??[]).map((v)=>{let y=v.userData.info,[S,b]=vo(_,y.first_face,y.indices/3);return{mesh:y.i,from:S,end:b}}).filter((v)=>v.from<v.end)}leaveOut(p,m){for(let g of this.piecesOf(p)){let _=this.byNumber.get(g.mesh);if(_)this.leaveOutIn(_,g,m)}}leaveOutIn(p,{from:m,end:g},_){let x=p.geometry.getIndex(),v=x.array;if(!p.userData.indices)p.userData.indices=v.slice(),this.usedBytes+=v.byteLength;if(_)v.fill(0,m*3,g*3);else v.set(p.userData.indices.subarray(m*3,g*3),m*3);x.needsUpdate=!0}async open(p,m){let g=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:_}=this.loading;if(this.clear(),this.trackName=p,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),m(p?"Reading the track …":""),!p)return;try{await this.load(p,g,_,m)}catch(x){if(g!==this.token)return;this.loading.abort(),m(`Could not load this track: ${x.message}`)}}async load(p,m,g,_){let x=await fetch(`/api/editor/${encodeURIComponent(p)}/index`,{signal:g}),v=await x.json();if(m!==this.token)return;if(!x.ok){_(v.error||"Could not read this track");return}this.data=v,this.objectPieces=Yu(v.objects),this.belonging=qu(v.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(v.revision),this.placeCamera(v),this.renderer.domElement.focus({preventScroll:!0});let y=Sl(v.meshes,this.camera.position.toArray()),S=this.camera.position.clone(),b=performance.now(),M=y.length,T=0;if(await Promise.all(Array.from({length:Ym},async()=>{while(y.length&&m===this.token){if(performance.now()-b>yb&&S.distanceTo(this.camera.position)>vb)y=Sl(y,this.camera.position.toArray()),S=this.camera.position.clone(),b=performance.now();let E=y.pop();if(!_o(this.usedBytes,ou*ag(E),this.settings.memoryGb)){this.overLimit=!0,y.length=0;return}this.usedBytes+=ou*ag(E);let A=this.heightsVersion,C=await sl(`/api/editor/${encodeURIComponent(p)}/mesh/${E.i}?r=${v.revision}&d=${this.draft}`,g);if(m!==this.token)return;if(this.addMesh(p,v,E,C),A!==this.heightsVersion)this.refresh(E.i);T++,_(`Loading: ${T} of ${M} parts`)}})),m!==this.token)return;if(await Promise.all(this.textures),m!==this.token)return;_(this.overLimit?`Memory limit reached (Settings): ${T} of ${M} parts, the nearest ones`:`${M} parts loaded`)}turnAround(p){let m=null,g=new Y,_=0;p.addEventListener("mousedown",(x)=>{if(x.button===cu)x.preventDefault()}),p.addEventListener("pointerdown",(x)=>{if(x.button!==cu)return;this.zoomLeft=0,m={x:x.clientX,y:x.clientY};let v=this.camera.position,y=this.camera.getWorldDirection(new Y);_=Math.max(nl,Math.min(this.reachOfLook(),this.groundAlong(v,y)?.distance??this.wayDown(y))),g=v.clone().addScaledVector(y,_),this.intoArea(g)}),p.addEventListener("pointermove",(x)=>{if(!m)return;if(!(x.buttons&Pb)){m=null;return}let{look:v,invertLook:y}=this.settings,S=Ab*v/h;this.turn(g,_,(m.x-x.clientX)*S,(m.y-x.clientY)*S*(y?-1:1)),m={x:x.clientX,y:x.clientY}}),p.addEventListener("pointerup",(x)=>{if(x.button===cu)m=null})}grabGround(p){let m=null,g=new Y,_=new Y;p.addEventListener("pointerdown",(v)=>{if(v.button!==$m)return;this.zoomLeft=0,this.picker.setFromCamera(jn(v,p),this.camera);let{ray:y}=this.picker,S=this.groundAlong(y.origin,y.direction)?.point.y??this.lastGround;if(m=new nn(new Y(0,1,0),-S),!y.intersectPlane(m,_))m=null});let x=(v,y)=>{if(this.picker.setFromCamera(jn(v,p),this.camera),!this.picker.ray.intersectPlane(y,g)||g.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=_.x-g.x,this.camera.position.z+=_.z-g.z,this.settle(),this.clearance=this.height,this.moved()};p.addEventListener("pointermove",(v)=>{if(!m)return;if(v.buttons&Ib)x(v,m);else m=null}),p.addEventListener("pointerup",(v)=>{if(v.button!==$m)return;if(m)x(v,m);m=null})}zoomWheel(p){p.addEventListener("wheel",(m)=>{m.preventDefault();let g=m.ctrlKey&&m.altKey?"ctrlAlt":m.altKey?"alt":m.ctrlKey?"ctrl":m.shiftKey&&this.wheelTaken?"shift":null;if((this.brush||this.wheelTaken)&&g){let M=m.deltaY||m.deltaX;if(M)this.onToolWheel(g,M<0?1:-1);return}if(this.stopRide(),!this.data||this.held)return;this.mouse=jn(m,p);let _=this.hit(),{ray:x}=this.picker,v=this.camera.position,y=_||x.direction.y<0?x.direction:this.camera.getWorldDirection(new Y),S=Math.min(_?.distance??this.wayDown(y),Math.max(this.height,nl)*Db);this.zoomAim.copy(v).addScaledVector(y,Math.max(S,nl));let b=m.deltaMode===WheelEvent.DOM_DELTA_LINE?m.deltaY/Nb*Jm:m.deltaY;this.zoomLeft+=Si.clamp(b/Jm,-Km,Km)*this.settings.zoom/h},{passive:!1})}glideZoom(p){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let m=this.zoomLeft*(1-Math.exp(-p/Ub));if(Math.abs(this.zoomLeft-m)<Ob)m=this.zoomLeft;this.zoomLeft-=m;let g=this.camera.position,_=g.distanceTo(this.zoomAim);if(!_)return;let x=Math.max(Math.min(_,nl),_*(1-Lb)**-m);g.lerpVectors(this.zoomAim,g,x/_),this.settle(),this.clearance=this.height,this.moved()}followMouse(p){p.addEventListener("pointermove",(m)=>{if(this.mouse=jn(m,p),this.held=m.buttons,!m.buttons)this.hoverDue=!0}),p.addEventListener("pointerdown",(m)=>{this.held=m.buttons}),p.addEventListener("pointerup",(m)=>{this.held=m.buttons,this.hoverDue=!0}),p.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(p){let m=this.brush;if(this.brush=p,!p){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!m)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(p,m,g){this.onStroke=p,this.askPreview=m,this.onStrokeRefused=g}cancelStroke(){if(!this.stroke)return!1;return clearInterval(this.stroke.timer),this.stroke=null,this.takeBackPreview(),!0}takeBackPreview(){for(let[p,m]of this.underPreview){let g=this.byNumber.get(p);if(!g)continue;let _=g.geometry.getAttribute("position").data,x=_.array;for(let[v,y]of m){let S=v*Dn;x[S+1]=y[0],x[S+3]=y[1],x[S+4]=y[2],x[S+5]=y[3]}_.needsUpdate=!0,lo(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.delete(p),this.dirty=!0}this.underPreview.clear(),this.previewShown.clear()}keepPreview(){this.underPreview.clear(),this.previewShown.clear()}dropPreview(){let p=[...this.previewed];this.previewed.clear();for(let m of p)this.refresh(m)}setWheelTaken(p){this.wheelTaken=p}setMove(p,m){if(this.onMoved=m,p===this.moveTool)return;if(this.moveTool=p,!p)this.dropDrag(),this.renderer.domElement.style.cursor=""}setPlaced(p){this.placed=new Map(p.map((m)=>[m.id,m]))}rootOf(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)],_=Number(p.slice(m+1));while(g&&g.parents[_]>=0)_=g.parents[_];return g?`${p.slice(0,m)}#${_}`:p}namesOf(p){let m=p.lastIndexOf("#"),g=this.data.objects[p.slice(0,m)],_=Number(p.slice(m+1));return{id:p,kind:yo(g.kinds[_]),sort:vr(g,_)}}canMove(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)];return!g||!iM.has(g.kinds[Number(p.slice(m+1))])}pivotOf(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)];if(g){let[v,y,S]=g.at[Number(p.slice(m+1))],b=this.placed.get(p);return[v+(b?.x??0),y+(b?.y??0),S+(b?.z??0)]}let _=this.boundsOf(p),x=_.getCenter(new Y);return[x.x,_.min.y,x.z]}grab(p){let m=[];for(let g of p){let _=new Map;for(let{mesh:x,from:v,end:y}of this.piecesOf(g)){let S=this.byNumber.get(x);if(!S)continue;let b=S.userData.indices??S.geometry.getIndex().array;if(!_.has(x))_.set(x,new Set);for(let M=v*3;M<y*3;M++)_.get(x).add(b[M])}for(let[x,v]of _){let y=Uint32Array.from(v),S=this.vertexArray(x),b=new Float32Array(y.length*Dn);y.forEach((M,T)=>b.set(S.subarray(M*Dn,(M+1)*Dn),T*Dn)),m.push({id:g,mesh:x,numbers:y,floats:b})}}return m}vertexArray(p){return this.byNumber.get(p).geometry.getAttribute("position").data.array}nudgeGrabbed(p,m,g){for(let _ of p){_l(_.floats,this.vertexArray(_.mesh),_.numbers,Dn,m.get(_.id),g(_.id));let x=this.byNumber.get(_.mesh);x.geometry.getAttribute("position").data.needsUpdate=!0,lo(x.geometry,x.userData.info),x.geometry.boundsTree?.refit(),this.previewed.add(_.mesh)}this.reframePicks(),this.dirty=!0}nudge(p,m){let g={...gr,...m},_=this.dragging;if(_&&p.every((x)=>_.ids.includes(x))){for(let x of _.grabbed){if(!p.includes(x.id))continue;let v=new Float32Array(x.floats.length);_l(x.floats,v,Array.from(x.numbers,(y,S)=>S),Dn,_.pivots.get(x.id),g),x.floats=v}for(let x of p){let[v,y,S]=_.pivots.get(x);_.pivots.set(x,[v+g.x,y+g.y,S+g.z])}return this.dragOn(_.grabbed)}this.nudgeGrabbed(this.grab(p),new Map(p.map((x)=>[x,this.pivotOf(x)])),()=>g)}dragOn(p){let m=this.dragging;this.nudgeGrabbed(p,m.pivots,()=>({...gr,x:m.way.x,z:m.way.z}))}dropDrag(){let p=this.dragging;if(this.dragging=null,p)this.nudgeGrabbed(p.grabbed,p.pivots,()=>gr)}reframePicks(){for(let[p,{box:m}]of this.picks){let g=this.boundsOf(p);if(!g.isEmpty())m.box.copy(g)}}moves(p){p.addEventListener("pointerdown",(m)=>{if(!this.moveTool||this.brush||m.button!==Kn)return;let g=this.pick(m,p);if(!g?.id||!this.picks.has(g.id))return;let _=[...this.picks.keys()].filter((S)=>this.canMove(S));if(!_.includes(g.id))return;let x=new Map(_.map((S)=>[S,this.pivotOf(S)])),v=new nn(new Y(0,1,0),-x.get(g.id)[1]),y=new Y;if(this.picker.setFromCamera(jn(m,p),this.camera),!this.picker.ray.intersectPlane(v,y))return;this.dragging={ids:_,plane:v,from:y,x:m.clientX,y:m.clientY,grabbed:this.grab(_),pivots:x,way:new Y},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{let g=this.dragging;if(!g)return;if(!(m.buttons&nM))return this.dropDrag();if(!g.way.lengthSq()&&Math.hypot(m.clientX-g.x,m.clientY-g.y)<hu)return;this.picker.setFromCamera(jn(m,p),this.camera);let _=new Y;if(!this.picker.ray.intersectPlane(g.plane,_)||_.distanceTo(this.camera.position)>2*this.highest)return;g.way.set(_.x-g.from.x,0,_.z-g.from.z),p.style.cursor="grabbing",this.dragOn(g.grabbed)}),p.addEventListener("pointerup",(m)=>{let g=this.dragging;if(!g||m.button!==Kn)return;if(this.dragging=null,p.style.cursor="grab",g.way.lengthSq())this.onMoved(g.ids,g.way.x,g.way.z)}),p.addEventListener("pointercancel",()=>this.dropDrag())}setClicked(p){this.onClicked=p}setMarking(p){this.marking=p}heightOfGround(p,m){return this.groundAlong(new Y(p,au,m),new Y(0,-1,0))?.point.y??this.lastGround}drawBand(p,m){if(this.band)this.scene.remove(this.band),this.band.geometry.dispose(),this.band.material.dispose(),this.band=null;if(this.dirty=!0,!p?.length)return;let g=p.length===1?gM(p[0]):mM(p,m);this.band=new Ei(new qe().setAttribute("position",new sn(g,3)),new zi({color:ig,depthTest:!1,transparent:!0})),this.band.renderOrder=10,this.band.frustumCulled=!1,this.scene.add(this.band)}drawPins(p){if(this.pins=p,this.dragged=null,this.pinMarks)this.scene.remove(this.pinMarks),this.pinMarks.geometry.dispose(),this.pinMarks.material.dispose(),this.pinMarks=null;if(this.dirty=!0,!p.length){this.renderer.domElement.style.cursor="";return}this.pinMarks=new us(new qe().setAttribute("position",new sn(p.flatMap(([m,g,_])=>[m,g+ys,_]),3)),new Gr({color:ig,size:sg,sizeAttenuation:!1,map:this.pinImage(),alphaTest:0.5,depthTest:!1,transparent:!0})),this.pinMarks.renderOrder=11,this.pinMarks.frustumCulled=!1,this.scene.add(this.pinMarks)}pinImage(){if(this.pinTexture)return this.pinTexture;let p=document.createElement("canvas");p.width=p.height=32;let m=p.getContext("2d");return m.fillStyle="#ffffff",m.beginPath(),m.arc(16,16,15,0,2*Math.PI),m.fill(),this.pinTexture=new fa(p),this.pinTexture}setPinned(p,m){this.onPinMoved=p,this.onPinTaken=m}pinAt(p,m){let g=m.getBoundingClientRect(),_=new Y,x=-1,v=sg;return this.pins.forEach(([y,S,b],M)=>{_.set(y,S+ys,b).project(this.camera);let T=Math.hypot((_.x+1)/2*g.width+g.left-p.clientX,(1-_.y)/2*g.height+g.top-p.clientY);if(_.z<1&&T<v)v=T,x=M}),x}dropDragged(){let p=this.dragged;if(this.dragged=null,!p||!this.pinMarks)return;this.pins[p.pin]=p.from;let[m,g,_]=p.from;this.pinMarks.geometry.getAttribute("position").setXYZ(p.pin,m,g+ys,_).needsUpdate=!0,this.dirty=!0}dragPins(p){p.addEventListener("pointerdown",(m)=>{if(m.button!==Kn||this.brush)return;let g=this.pinAt(m,p);if(g<0)return;this.dragged={pin:g,x:m.clientX,y:m.clientY,from:this.pins[g]},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{if(!this.dragged){if(this.pins.length)p.style.cursor=this.pinAt(m,p)>=0?"grab":"";return}this.mouse=jn(m,p);let g=this.brushAt();if(!g||!this.pinMarks)return;this.pins[this.dragged.pin]=[g.x,g.y,g.z],this.pinMarks.geometry.getAttribute("position").setXYZ(this.dragged.pin,g.x,g.y+ys,g.z).needsUpdate=!0,this.dirty=!0}),p.addEventListener("pointerup",(m)=>{let g=this.dragged;if(!g||m.button!==Kn)return;if(Math.hypot(m.clientX-g.x,m.clientY-g.y)<hu)return this.dropDragged();this.dragged=null,this.onPinMoved(g.pin,this.pins[g.pin][0],this.pins[g.pin][2])}),p.addEventListener("pointercancel",()=>this.dropDragged())}sample(){let p=this.stroke;if(!p||!this.mouse)return;let m=performance.now(),g=(m-p.at)/1000,_=p.samples.at(-1);p.at=m;let x=`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;if(x===p.look)lg(p.samples,_[0],_[1],g);else{let v=this.brushAt();if(p.look=x,this.placeRing(v,p.turned),v)lg(p.samples,v.x,v.z,g)}if(!p.asking&&m-p.asked>=cM)p.asking=!0,p.asked=m,this.askPreview(p.samples.map((v)=>[...v]),p.turned).then((v)=>{if(p.asking=!1,this.stroke!==p)return;if(typeof v==="string")this.cancelStroke(),this.onStrokeRefused(v);else if(v)this.showPreview(v)},()=>{p.asking=!1})}showPreview(p){this.takeBackPreview();let m=new Uint32Array(p),g=1;for(let _=0;_<m[0];_++){let x=m[g],v=m[g+1];this.previewShown.set(x,{numbers:m.subarray(g+2,g+2+v),values:new Float32Array(p,(g+2+v)*4,v*uu)}),g+=2+v+v*uu,this.laidOver(x)}this.dirty=!0}laidOver(p){let m=this.previewShown.get(p),g=this.byNumber.get(p);if(!m||!g)return;let{numbers:_,values:x}=m,v=g.geometry.getAttribute("position").data,y=v.array,S=new Map;this.underPreview.set(p,S);for(let b=0;b<_.length;b++){let M=_[b]*Dn,T=b*uu;S.set(_[b],[y[M+1],y[M+3],y[M+4],y[M+5]]),y[M+1]=x[T],y[M+3]=x[T+1],y[M+4]=x[T+2],y[M+5]=x[T+3]}v.needsUpdate=!0,lo(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.add(p)}setToolWheel(p){this.onToolWheel=p}refreshMeshes(p,m){this.draft=m;let g=new Set(this.previewShown.size?p:[...p,...this.previewed]);if(!this.previewShown.size)this.previewed.clear();if(!g.size)return;this.heightsVersion++;for(let _ of g)this.refresh(_)}setViewFailed(p){this.onViewFailed=p}async refresh(p){let m=this.token,{signal:g}=this.loading,_=this.byNumber.get(p);if(!_||!this.data)return;let x=_.userData.asked=(_.userData.asked??0)+1;try{let v=await this.refreshes(()=>sl(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${p}?r=${this.data.revision}&d=${this.draft}`,g));if(m===this.token&&_.userData.asked===x)this.takeVertices(_,v)}catch(v){if(m===this.token&&!g.aborted&&_.userData.asked===x)this.onViewFailed(v.message)}}takeVertices(p,m){let g=p.geometry,_=p.userData.info,x=g.getAttribute("position").data;x.array.set(new Float32Array(m,0,_.vertices*Dn)),x.needsUpdate=!0,this.underPreview.delete(_.i);let v=this.dragging?.grabbed.filter((y)=>y.mesh===_.i)??[];if(v.length)this.dragOn(v);if(lo(g,_),g.boundsTree?.refit(),this.laidOver(_.i),this.marked)this.markDue=!0;this.reframePicks(),this.dirty=!0,this.hoverDue=!0}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:p}=this.picker,m=this.groundAlong(p.origin,p.direction);return m&&sM.test(m.object.name)?m.point:null}placeRing(p,m){if(!this.brush)return;if(!this.ring){let g=Array.from({length:rg},(_,x)=>{let v=x/rg*2*Math.PI;return new Y(Math.cos(v),0,Math.sin(v))});this.ring=new hs(new qe().setFromPoints(g),new zi({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!p,p)this.ring.position.copy(p),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(m?this.brush.turnedColour:this.brush.colour);this.dirty=!0}strokes(p){p.addEventListener("pointerdown",(m)=>{if(!this.brush||m.button!==Kn)return;this.mouse=jn(m,p);let g=this.brushAt();if(!g)return;let _=performance.now();this.stroke={samples:[[g.x,g.z,0]],turned:m.shiftKey,at:_,asked:_,asking:!1,look:`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,timer:setInterval(()=>this.sample(),oM)},p.setPointerCapture(m.pointerId)});for(let m of["keydown","keyup"])p.addEventListener(m,(g)=>{if((this.brush||this.wheelTaken)&&g.key==="Alt")g.preventDefault()});p.addEventListener("pointermove",(m)=>{if(!this.brush)return;if(this.mouse=jn(m,p),!this.stroke)this.placeRing(this.brushAt(),m.shiftKey)}),p.addEventListener("pointerup",(m)=>{if(!this.stroke||m.button!==Kn)return;this.mouse=jn(m,p),this.sample();let{samples:g,turned:_,timer:x}=this.stroke;clearInterval(x),this.stroke=null,this.keepPreview(),this.onStroke(g,_)}),p.addEventListener("pointercancel",()=>this.cancelStroke()),p.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(p){let m=null;p.addEventListener("pointerdown",(g)=>{m=g.button===0&&!this.brush&&!this.moveTool&&this.pinAt(g,p)<0||g.button===2?{x:g.clientX,y:g.clientY,button:g.button}:null}),p.addEventListener("pointermove",(g)=>{if(m&&Math.hypot(g.clientX-m.x,g.clientY-m.y)>=hu)m=null}),p.addEventListener("pointerup",(g)=>{let _=m?.button===2&&g.button===2?this.pinAt(g,p):-1;if(_>=0)this.onPinTaken(_);else if(m&&g.button===m.button){let x=this.pick(g,p),v=p.getBoundingClientRect();if(g.button===2&&x)this.onMenu({x:g.clientX-v.left,y:g.clientY-v.top,width:v.width,height:v.height});if(g.button===Kn)this.onClicked(x)}m=null}),p.addEventListener("contextmenu",(g)=>g.preventDefault())}pick(p,m){if(!this.data)return null;this.mouse=jn(p,m);let g=this.hit(),_=g?this.describe(g):null,x=this.adding&&p.shiftKey&&p.button===Kn,v=_?.id&&this.moveTool?this.rootOf(_.id):_?.id??null;if(_&&v&&v!==_.id)Object.assign(_,this.namesOf(v));if(!_){if(!x)this.unpick();return null}if(x&&!v)return null;if(x&&this.picks.has(v))return this.dropPick(v);if(!x&&!(p.button!==Kn&&v&&this.picks.has(v)))this.forgetPicks();let y=v?this.boundsOf(v):null,S=y?.getCenter(new Y).setY(y.min.y),b={id:v,afterBuild:!v&&jb.test(_.object),kind:_.kind,sprite:_.sprite,sort:_.sort,position:S?[S.x,S.y,S.z]:_.at,left:p.button===Kn,road:g&&rM.test(g.object.name)?[g.point.x,g.point.z]:null,all:[]};if(v&&y)this.picks.set(v,{box:this.picks.get(v)?.box??this.frameOf(y),picked:b});return b.all=this.allPicked(),this.onPick(b),b}allPicked(){return[...this.picks.values()].map(({picked:p})=>({id:p.id,position:p.position}))}dropPick(p){this.removeFrame(this.picks.get(p).box),this.picks.delete(p);let m=[...this.picks.values()].at(-1)?.picked??null;if(m)m.all=this.allPicked();return this.onPick(m&&{...m}),m}setMenu(p){this.onMenu=p}setMarked(p){this.marked=p,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let p=this.marked.tree?this.treesOf(this.marked.sort):this.listedOf(this.marked.sort),m=new Float32Array(p.length*24*3),g=new Y;p.forEach((x,v)=>{Kb.forEach(([y,S],b)=>{for(let[M,T]of[y,S].entries())g.set(T&1?x.max.x:x.min.x,T&2?x.max.y:x.min.y,T&4?x.max.z:x.min.z),g.toArray(m,(v*24+b*2+M)*3)})});let _=new qe().setAttribute("position",new We(m,3));this.markedLines=new Ei(_,new zi({color:eg,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(p){let m=[];for(let g of bl(this.data.objects,new Set([p]))){let _=g.lastIndexOf("#"),x=this.data.objects[g.slice(0,_)].faces[Number(g.slice(_+1))],v=this.shownBounds(x.map(([y,S,b])=>({mesh:y,from:S,end:S+b})));if(v)m.push(v)}return m}treesOf(p){let m=new Map;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,v,y]of this.billboardsOf(g)){if(this.spriteOf(g,v)!==p)continue;let S=`${_.base}#${x}`;m.set(S,[...m.get(S)??[],{mesh:_.i,from:v,end:y}])}}return[...m.values()].map((g)=>this.shownBounds(g)).filter((g)=>g!==null)}shownBounds(p){let m=new ve,g=new Y;for(let{mesh:_,from:x,end:v}of p){let y=this.byNumber.get(_),S=y?.geometry.getIndex().array;if(!y||!S||x>=v||S[x*3]===S[x*3+1])continue;let b=y.geometry.getAttribute("position");for(let M=x*3;M<v*3;M++)m.expandByPoint(g.fromBufferAttribute(b,S[M]))}return m.isEmpty()?null:m}frameOf(p){let m=new Ta(p,new oe(eg));return m.material.depthTest=!1,this.scene.add(m),this.dirty=!0,m}removeFrame(p){this.scene.remove(p),p.dispose(),this.dirty=!0}forgetPicks(){for(let{box:p}of this.picks.values())this.removeFrame(p);this.picks.clear()}boundsOf(p){let m=new ve,g=new Y;for(let{mesh:_,from:x,end:v}of this.piecesOf(p)){let y=this.byNumber.get(_);if(!y)continue;let S=y.geometry.getAttribute("position"),b=y.userData.indices??y.geometry.getIndex().array;for(let M=x*3;M<v*3;M++)m.expandByPoint(g.fromBufferAttribute(S,b[M]))}return m}solidAt(p){let m=p.object.material;if(!m.alphaTest||!m.map||!p.uv)return!0;let g=this.alphaOf.get(m.map);if(g===void 0){if(g=m.map.image instanceof ImageBitmap?hM(m.map.image):null,this.alphaOf.set(m.map,g),g)this.usedBytes+=g.data.byteLength}if(!g)return!0;let _=Math.floor((p.uv.x-Math.floor(p.uv.x))*g.width),x=Math.floor((p.uv.y-Math.floor(p.uv.y))*g.height);return g.data[(x*g.width+_)*4+3]/255>=m.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;if(this.marking){let g=this.brushAt();if(g)this.marking(g.x,g.z)}let p=og("map2lap.hover",()=>this.hit()),m=p?this.describe(p):null;if(this.moveTool)this.renderer.domElement.style.cursor=m?.id&&this.canMove(this.rootOf(m.id))?"grab":"";this.onHover(m)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let p=this.picker.intersectObjects(this.meshes.filter((m)=>m.visible),!1).find((m)=>this.solidAt(m));return this.wireNear(p?.distance??1/0)??p}wireNear(p){let{ray:m}=this.picker,g=this.renderer.domElement.clientHeight||1,_=2*Math.tan(Si.degToRad(this.camera.fov)/2)/g*tM,x=new Y,v=new Y,y=new Y,S=new Y,b,M=p;for(let T of this.meshes){if(!T.visible||!Qb.test(T.name))continue;let w=T.geometry.boundingSphere,E=m.direction.dot(w.center.clone().sub(m.origin));if(m.distanceSqToPoint(w.center)>(w.radius+Math.max(E,0)*_)**2)continue;let A=T.geometry.getIndex().array,C=T.geometry.getAttribute("position");for(let D=0;D*3<A.length;D+=eM){if(A[D*3]===A[D*3+1])continue;x.fromBufferAttribute(C,A[D*3]),v.fromBufferAttribute(C,A[D*3+1]);let R=m.distanceSqToSegment(x,v,y,S),P=y.distanceTo(m.origin);if(P<M&&R<=(P*_)**2)M=P,b={distance:P,point:S.clone(),object:T,faceIndex:D}}}return b}describe(p){let m=this.data,g=p.object,_=g.userData.info,x=m.materials[_.material],v=m.textures.find((R)=>R.name===x.texture),{x:y,y:S,z:b}=p.point,M=p.faceIndex??0,T=p.uv?[p.uv.x,p.uv.y]:null,w=_.first_face!==null&&_.first_face!==void 0,E=w?xr(M,_.first_face):null,A=Zu(this.objectPieces.get(_.i),M),C=A?m.objects[A.slice(0,A.lastIndexOf("#"))]:null,D=A?Number(A.slice(A.lastIndexOf("#")+1)):-1;return{id:E!==null?`${_.base}#${E}`:A,kind:A?yo(C.kinds[D]):Ju(_.name),sprite:w&&T?Ml(m.atlas,T[0],T[1]):null,sort:A?vr(C,D):null,object:_.name,physics:$u(_.name),material:x.name,shader:x.shader,texture:x.texture,textureBytes:v?.size??null,vertices:_.vertices,triangles:_.indices/3,triangle:M,uv:T,shownTo:_.lod_out,billboard:w?this.billboard(g,_,M):null,at:[y,S,b],tile:Hu(y,b),route:xo(m.route,y,b),latLon:m.anchor?Gu(m.anchor,y,S,b):null,distance:p.distance}}billboard(p,m,g){let _=m.first_face,x=xr(g,_),[v,y]=vo(x,_,m.indices/3);if(y-v<8)return{number:x,height:null,width:null,foot:null};let S=p.geometry.getIndex(),b=p.geometry.getAttribute("position"),M=new ve,T=new Y,w=new Y;for(let A=v*3;A<y*3;A++)if(T.fromBufferAttribute(b,S.getX(A)),M.expandByPoint(T),A===v*3)w.copy(T);T.fromBufferAttribute(b,S.getX(v*3+1));let E=M.getCenter(new Y);return{number:x,height:M.max.y-M.min.y,width:w.distanceTo(T),foot:[E.x,E.z]}}flyKeys(p){p.tabIndex=0,p.addEventListener("pointerdown",(m)=>{if(p.focus({preventScroll:!0}),m.button!==Kn)this.stopRide()}),p.addEventListener("keydown",(m)=>{if(!$b.has(m.code)||m.ctrlKey||m.metaKey||m.altKey)return;m.preventDefault(),this.stopRide(),this.flying.add(m.code)}),p.addEventListener("keyup",(m)=>this.flying.delete(m.code)),p.addEventListener("blur",()=>this.flying.clear())}fly(p){let m=this.camera.position,g=this.camera.getWorldDirection(new Y).setY(0).normalize(),_=new Y().crossVectors(g,this.camera.up).normalize(),x=new Y;if(this.flying.has("KeyW"))x.add(g);if(this.flying.has("KeyS"))x.sub(g);if(this.flying.has("KeyD"))x.add(_);if(this.flying.has("KeyA"))x.sub(_);if(!x.lengthSq())return;let v=Math.min(zb,Math.max(kb,this.height*Bb));m.add(x.normalize().multiplyScalar(v*this.settings.fly/h*p)),this.keepInArea();let y=this.groundBelow();if(y!==null)m.y+=(y+this.clearance-m.y)*(1-Math.exp(-p/tg));this.settle(y),this.moved()}turn(p,m,g,_){let x=this.camera.getWorldDirection(new Y),v=new Ea().setFromVector3(x);v.theta+=g,v.phi=Si.clamp(v.phi-_,Math.PI/2+Zm,Math.PI-Zm),x.setFromSpherical(v);let y=this.camera.position;y.copy(p).addScaledVector(x,-m),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(y.clone().add(x)),this.moved()}groundAlong(p,m){return this.down.set(p,m),og("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let p=this.camera.position;return this.groundAlong(new Y(p.x,p.y+au,p.z),new Y(0,-1,0))?.point.y??null}wayDown(p){return Math.max(this.camera.position.y-this.lastGround,0)/-p.y}reachOfLook(){return Math.max(Cb,this.height*Rb)}intoArea(p){let{minX:m,maxX:g,minZ:_,maxZ:x}=this.area;p.x=Si.clamp(p.x,m-el,g+el),p.z=Si.clamp(p.z,_-el,x+el)}keepInArea(){let p=this.camera.position,m=this.camera.getWorldDirection(new Y),g=p.clone().addScaledVector(m,Math.min(this.wayDown(m),this.reachOfLook())),_=g.clone();this.intoArea(_),p.x+=_.x-g.x,p.z+=_.z-g.z}settle(p){this.keepInArea(),this.keepHeight(p===void 0?this.groundBelow():p)}keepHeight(p){if(p!==null)this.lastGround=p;let m=this.camera.position;m.y=Si.clamp(m.y,this.lastGround+wb,this.lastGround+this.highest),this.height=m.y-this.lastGround}home(){if(!this.data)return;this.ride=null,this.onRideMoving(!1),this.placeCamera(this.data),this.moved(),this.tellRideMetre()}setRide(p,m){this.rideSpeed=p,this.rideHeight=m}setRideWatch(p,m){this.onRideMoving=p,this.onRideMetre=m}tellRideMetre(){let p=this.camera.position;this.onRideMetre(xo(this.data?.route??[],p.x,p.z)?.metre??null)}rideLook(p,m){let g=this.data.route,[_,x]=dr(g,m,p),[v,y]=dr(g,m,p+Qm),[S,b]=dr(g,m,p-Qm);return(v!==_||y!==x?new Y(v-_,0,y-x):new Y(_-S,0,x-b)).normalize().setY(-Vb).normalize()}onRoute(){if(this.ride)return this.ride;let p=this.data?.route??[],m=this.camera.position,g=qm(p),_=xo(p,m.x,m.z)?.metre;if(_===void 0||!g[g.length-1])return null;this.flying.clear(),this.zoomLeft=0,this.ride={metre:_,metres:g,left:0,moving:!1},[m.x,m.z]=dr(p,g,_);let x=this.groundBelow();if(x!==null)this.lastGround=x;return m.y=this.lastGround+this.rideHeight,this.keepHeight(x),this.camera.lookAt(m.clone().add(this.rideLook(_,g))),this.moved(),this.onRideMetre(_),this.ride}rideBy(p){let m=this.onRoute();if(m)m.left+=p;return!!m}toggleRide(){let p=this.onRoute();if(!p)return!1;if(!p.moving&&p.metre>=p.metres[p.metres.length-1])p.metre=0;return p.moving=!p.moving,this.onRideMoving(p.moving),!0}stopRide(){if(!this.ride)return;this.ride=null,this.clearance=this.height,this.onRideMoving(!1),this.tellRideMetre()}rideOn(p){let m=this.ride,{metres:g}=m,_=g[g.length-1],x=this.camera.position,v=performance.now(),y=Math.abs(m.left)<Xb?m.left:m.left*(1-Math.exp(-p/Wb)),S=m.metre;if(m.left-=y,m.metre=Si.clamp(S+y+(m.moving?this.rideSpeed*p:0),0,_),m.metre<=0||m.metre>=_)m.left=0;if(m.moving&&m.metre>=_)m.moving=!1,this.onRideMoving(!1);let b=this.camera.getWorldDirection(new Y),M=this.rideLook(m.metre,g),T=m.metre!==S,w=b.distanceToSquared(M)>qb,E=Math.abs(x.y-this.lastGround-this.rideHeight)>Yb;if(!T&&!w&&!E)return;if(T||E){[x.x,x.z]=dr(this.data.route,g,m.metre);let A=this.groundBelow();if(A!==null)x.y+=(A+this.rideHeight-x.y)*(1-Math.exp(-p/tg));this.keepHeight(A)}if(this.camera.lookAt(x.clone().add(b.lerp(M,1-Math.exp(-p/Gb)))),this.moved(),v-this.rideTold>=Zb||!m.left&&!m.moving)this.rideTold=v,this.onRideMetre(m.metre)}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let p=this.host.clientWidth,m=this.host.clientHeight;if(!p||!m)return;this.renderer.setSize(p,m),this.camera.aspect=p/m,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let p=performance.now(),m=Math.min(Hb,(p-this.lastFrame)/1000);if(this.lastFrame=p,this.shown&&this.ride)this.rideOn(m);if(this.shown&&this.flying.size)this.fly(m);if(this.shown&&this.zoomLeft)this.glideZoom(m);if(!this.shown)return;if(this.dirty){this.dirty=!1;for(let g of this.meshes){let _=this.camera.position.distanceTo(g.geometry.boundingSphere.center);g.visible=_>=g.userData.lodIn&&_<g.userData.lodOut}this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&p-this.lastHover>=Jb)this.hoverDue=!1,this.lastHover=p,this.hover();if(this.markDue&&p-this.lastMark>=this.markEvery){let g=performance.now();this.frameMarked(),this.lastMark=p,this.markEvery=Math.max(ng,4*(performance.now()-g))}}clear(){this.stopRide();for(let p of this.meshes)this.scene.remove(p),p.geometry.boundsTree=void 0,p.geometry.dispose();for(let p of this.textures)p?.then((m)=>{if(!m)return;let g=m.image;if(m.dispose(),g instanceof ImageBitmap)g.close()},()=>{});for(let p of this.materials)p?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.objectPieces=new Map,this.belonging=new Map,this.forgetPicks()}texture(p,m,g){let _=this.textures[g];if(!_){let x=ou*m.textures[g].size,v=this.token;if(!_o(this.usedBytes,x,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=x;let y=this.renderer.capabilities.getMaxAnisotropy(),S=this.loading.signal;_=fM(()=>sl(`/api/editor/${encodeURIComponent(p)}/texture/${g}?r=${m.revision}`,S).then((b)=>pM(b,m.textures[g].name,y))).then((b)=>{if(b.image instanceof ImageBitmap&&v===this.token){let M=zu(b.image.width,b.image.height)-x;if(!_o(this.usedBytes,M,this.settings.memoryGb))return this.usedBytes-=x,this.overLimit=!0,b.dispose(),b.image.close(),null;this.usedBytes+=M}return b}),this.textures[g]=_}return _}material(p,m,g){let _=this.materials[g];if(_)return _;let x=m.materials[g],v=Math.min(1,x.bright),y=new ga({color:new oe(v,v,v)});if(x.alpha_ref>0)y.alphaTest=x.alpha_ref;if(x.blend)y.transparent=!0,y.depthWrite=!1;this.materials[g]=y;let S=m.textures.findIndex((b)=>b.name===x.texture);if(S>=0){let b=this.token;this.texture(p,m,S).then((M)=>{if(!M||b!==this.token)return;y.map=M,y.needsUpdate=!0,this.dirty=!0},()=>{})}return y}addMesh(p,m,g,_){let x=new rn(xM(g,_),this.material(p,m,g.material));if(x.userData={lodIn:g.lod_in,lodOut:g.lod_out,info:g},x.name=g.name,this.scene.add(x),this.meshes.push(x),g.base!==null&&g.base!==void 0){if(!this.parts.has(g.base))this.parts.set(g.base,[]);this.parts.get(g.base).push(x)}this.byNumber.set(g.i,x),this.laidOver(g.i);for(let v of this.listedOut.get(g.i)??[])this.leaveOutIn(x,v,!0);if(g.base!==null&&g.base!==void 0){for(let v of this.billboardsOut.get(g.base)??[])for(let y of this.piecesOf(v))if(y.mesh===g.i)this.leaveOutIn(x,y,!0);this.leaveOutSorts(x)}if(this.marked)this.markDue=!0;if(Eb.test(g.name)){this.usedBytes+=dM(x),this.grounds.push(x);let v=x.geometry.boundingBox,y=this.camera.position;if(y.x>=v.min.x&&y.x<=v.max.x&&y.z>=v.min.z&&y.z<=v.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(p){let m=new Y,g=new Y(0,0,1);if(p.start)m.set(...p.start.pos),g.set(...p.start.forward).normalize();else if(p.meshes.length){for(let S of p.meshes)m.add(new Y(...S.center));m.divideScalar(p.meshes.length)}this.camera.position.copy(m).addScaledVector(g,-Mb).add(new Y(0,lu,0)),this.camera.lookAt(m),this.camera.updateMatrixWorld(),this.clearance=this.height=lu,this.lastGround=m.y,this.zoomLeft=0,this.area=yl(p.meshes.filter((S)=>!Tb.test(S.name)));let{minX:_,maxX:x,minZ:v,maxZ:y}=this.area;this.highest=Math.min(Fb,Math.max(jm,x-_,y-v))}}function vM({name:p,title:m,taken:g,built:_,visible:x,controls:v,fileHost:y,savedHost:S,toolsHost:b,notesHost:M,onStatus:T,onSaved:w}){let E=s(null),A=s(null),[C,D]=n(null),[R,P]=n(null);return i(()=>{let L=new du(E.current);return L.setHover(P),D(L),()=>{L.dispose(),D(null)}},[]),i(()=>{C?.show(x)},[C,x]),i(()=>{C?.setControls(v)},[C,v]),i(()=>{C?.open(p,T)},[C,p,_,T]),e("div",{id:"scene",className:al.scene,hidden:!x,ref:A,children:[t("div",{className:al.view,ref:E}),C&&p&&t(bd,{name:p,title:m,taken:g,view:C,scene:A,fileHost:y,savedHost:S,toolsHost:b,notesHost:M,elevationSpeed:v.elevationSpeed,reopen:()=>void C.open(p,T),onSaved:w},`${p} ${_}`),t(Ed,{hovered:R})]})}export{vM as default};
