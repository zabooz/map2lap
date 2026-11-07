import{o,i,l,s,n,d,c,r,a,t,e,h,u,f}from"./chunk-bg366c54.js";var gl={scene:"scene_u4kRgA",view:"view_u4kRgA"};var Uu=1,Ou=2,Fu=4,Ag=(p)=>(p.shiftKey?Uu:0)+(p.ctrlKey?Ou:0)+(p.altKey?Fu:0);function Rg(p){return{shift:p.shiftKey,ctrl:p.ctrlKey&&!p.altKey,alt:p.altKey&&!p.ctrlKey,ctrlAlt:p.ctrlKey&&p.altKey}}function To(){let[p,m]=n(0);return i(()=>{let g=(y)=>m(Ag(y)),_=()=>m(0),x=["keydown","keyup","pointermove"];for(let y of x)window.addEventListener(y,g);return window.addEventListener("blur",_),()=>{for(let y of x)window.removeEventListener(y,g);window.removeEventListener("blur",_)}},[]),Rg({shiftKey:(p&Uu)>0,ctrlKey:(p&Ou)>0,altKey:(p&Fu)>0})}var Fn={options:"options_IcC4dw",controls:"controls_IcC4dw",title:"title_IcC4dw",place:"place_IcC4dw",key:"key_IcC4dw",held:"held_IcC4dw",number:"number_IcC4dw",on:"on_IcC4dw",value:"value_IcC4dw",note:"note_IcC4dw"};var Qe=(p,m)=>()=>{m(),p.focus()},_l=[{keys:"Shift",held:"shift"},{keys:"Ctrl",held:"ctrl"},{keys:"Alt",held:"alt"},{keys:"Ctrl+Alt",held:"ctrlAlt"}];function Pg({keys:p,held:m,children:g}){return e("span",{className:`${Fn.place}${m?` ${Fn.held}`:""}`,children:[t("kbd",{className:Fn.key,"aria-hidden":"true",children:p}),g]})}function Bn({id:p,title:m,note:g,options:_=[],actions:x}){let y=To();return e("div",{id:p,className:Fn.options,"data-tool-options":"",children:[e("div",{className:Fn.controls,children:[t("b",{className:Fn.title,children:m}),_.map((v,b)=>t(Pg,{keys:_l[b].keys,held:y[_l[b].held],children:v},_l[b].keys)),x]}),g&&t("span",{className:Fn.note,children:g})]})}function Bu({label:p,hint:m,value:g}){return e("span",{className:Fn.number,title:m,children:[p," ",t("b",{className:Fn.value,children:g})]})}function ji({id:p,label:m,hint:g,onClick:_}){return t("button",{type:"button",id:p,title:g,onClick:_,children:m})}function As({label:p,on:m,hint:g,onClick:_}){return t("button",{type:"button",className:m?Fn.on:"","aria-pressed":m,title:g,onClick:_,children:p})}function tn({label:p,unit:m,hint:g,value:_,min:x,max:y,step:v,onChange:b}){return e("label",{className:Fn.number,title:g,children:[p," ",t("input",{type:"number",min:x,max:y,step:v,value:_,onChange:(S)=>b(S.target.valueAsNumber||0)})," ",m]})}var Ig=3,Lg=60;function ku({band:p,smoothing:m}){let g=p.points.length;return t(Bn,{id:g?"edit-band":"edit-road-hint",title:m?"Smooth":"Mark road",note:g===0?"Click the road where the stretch begins.":g===1?"A is set: click B further along the road (Esc drops it).":`${m?"Enter takes it, Esc drops it.":"Marked: choose a tool for it, Esc drops it."} A click on the road adds a pin: drag it, right-click takes it away.`,options:m&&p.line?[t(tn,{label:"Strength",unit:"%",hint:"From short waves only, the hills stay, up to a calm line from A to B (Shift + wheel)",min:0,max:100,step:5,value:p.strength,onChange:p.setStrength}),t(tn,{label:"Width",unit:"m",hint:"How wide the band is: at first the road's own (Ctrl + wheel)",min:Ig,max:Lg,value:Math.round(p.width),onChange:(_)=>p.setWidth(_||null)})]:[]})}var xl=2,yl=500,vl=0.5,bl=10,Sl=100,Ng=5,Dg=25,Ug=0.1,Qi=(p,m,g,_,x)=>Math.min(x,Math.max(_,Math.round((p+m*Math.max(g,p*Ug))/g)*g)),Og=(p)=>`${p} ${p===1?"object stands":"objects stand"} at the edge of it and stayed where ${p===1?"it is":"they are"}: its place lies outside.`;function zu({view:p,edits:m,url:g,enabled:_,colour:x,turnedColour:y,body:v,onNote:b}){let[S,M]=n(Ng),[E,w]=n(Dg);i(()=>{p.setBrush(_?{radius:S,colour:x,turnedColour:y}:null)},[p,_,S,x,y]),i(()=>()=>p.setBrush(null),[p]);let T=(C,P)=>({samples:C,base:m.boundRevision(),radius:S,soft:E/100,...v(P)}),A=l((C,P)=>{let I=T(C,P);m.inTurn(async()=>{let U=await r(g,I),D=U.error||!U.height?U.error??"no answer":m.canEdit()?null:"this track can't be changed now";if(D)return p.dropPreview(),b(`Not changed: ${D}`);m.addHeight(U.height),b(U.standing?Og(U.standing):null)})}),R=l(async(C,P)=>{let I=await fetch(`${g}/preview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(T(C,P))}).catch(()=>null);if(!I)return null;if(I.ok)return I.arrayBuffer().catch(()=>null);return String((await I.json().catch(()=>null))?.error??I.status)}),N=l((C)=>b(`Not changed: ${C}`));return i(()=>(p.setStroke((C,P)=>A(C,P),(C,P)=>R(C,P),(C)=>N(C)),()=>p.setStroke(()=>{},()=>Promise.resolve(null),()=>{})),[p]),{radius:S,soft:E,setRadius:M,setSoft:w}}var Fg=50,Ml=10,Gu=300,Vu=10,Bg=3,El=1.5,Wu=100,Xu=0.5,kg=20,zg=0.2777777777777778,Hu="This track has no route to go along";function qu({view:p,enabled:m,onNote:g}){let[_,x]=n(!1),[y,v]=n(null),[b,S]=n(Fg),[M,E]=n(Bg);return i(()=>{p.setRide(b*zg,M)},[p,b,M]),i(()=>(p.setRideWatch(x,v),()=>{p.stopRide(),p.setRideWatch(()=>{},()=>{})}),[p]),i(()=>{if(m)p.tellRideMetre();else p.stopRide()},[p,m]),{moving:_,metre:y,speed:b,height:M,setSpeed:S,setHeight:E,toggle:()=>g(p.toggleRide()?null:Hu),wheel:(w,T)=>{if(w==="shift")g(p.rideBy(T*kg)?null:Hu);else if(w==="ctrl")E((A)=>Qi(A,T,Xu,El,Wu));else if(w==="alt")S((A)=>Qi(A,T,Vu,Ml,Gu))}}}function Yu({camera:p,view:m}){return t(Bn,{id:"edit-camera-set",title:"Camera",note:"Shift + wheel goes along the track from the place nearest the camera. W A S D or the mouse leave it, Esc ends it.",options:[t(Bu,{label:"Along the track",hint:"How far along the track it is (Shift + wheel: forwards, backwards)",value:p.metre===null?"no route":`${Math.round(p.metre)} m`}),t(tn,{label:"Height",unit:"m",hint:"How far above the ground it goes along the track (Ctrl + wheel)",min:El,max:Wu,step:Xu,value:p.height,onChange:(g)=>p.setHeight(Math.max(El,g))}),t(tn,{label:"Speed",unit:"km/h",hint:"How fast Ride goes (Alt + wheel)",min:Ml,max:Gu,step:Vu,value:p.speed,onChange:(g)=>p.setSpeed(Math.max(Ml,g))})],actions:e(a,{children:[t(ji,{id:"edit-ride",label:p.moving?"Pause":"Ride",hint:"It rides along the track by itself from where it is",onClick:Qe(m,p.toggle)}),t(ji,{id:"edit-home",label:"Reset",hint:"Back to the first view, behind the start (Home)",onClick:Qe(m,()=>m.home())})]})})}var Ar={x:0,y:0,z:0,turn:0,scale:1};var $u=(p,m,g)=>Math.min(g,Math.max(m,p)),wr=(p,m)=>Math.round(p*10**m)/10**m,Rs=(p)=>({id:p,...Ar}),Zu=(p)=>!p.x&&!p.y&&!p.z&&!p.turn&&p.scale===1;function ei(p,m){let g=p.x+(m.x??0),_=p.z+(m.z??0),x=Math.hypot(g,_);if(x>1000)[g,_]=[g*1000/x,_*1000/x];let y=(p.turn+(m.turn??0))%360;if(y>180)y-=360;if(y<=-180)y+=360;return{id:p.id,x:wr(g,3),y:wr($u(p.y+(m.y??0),-100,100),3),z:wr(_,3),turn:wr(y,2),scale:wr($u(p.scale*(m.scale??1),0.1,10),4)}}function Ju(p,m){return{x:m.x-p.x,y:m.y-p.y,z:m.z-p.z,turn:m.turn-p.turn,scale:m.scale/p.scale}}function Tl(p,m,g,_,x,y){let v=y.turn*Math.PI/180,b=Math.cos(v),S=Math.sin(v),[M,E,w]=x;for(let T=0;T<g.length;T++){let A=T*_,R=g[T]*_;m.set(p.subarray(A,A+_),R);let N=(p[A]-M)*y.scale,C=(p[A+1]-E)*y.scale,P=(p[A+2]-w)*y.scale;m[R]=M+b*N+S*P+y.x,m[R+1]=E+C+y.y,m[R+2]=w-S*N+b*P+y.z;for(let I of[3,8]){let U=p[A+I],D=p[A+I+2];m[R+I]=b*U+S*D,m[R+I+2]=-S*U+b*D}}}function Ku({name:p,edits:m,view:g,picked:_,onWheel:x}){let[y,v]=n(null),[b,S]=n(null),[M,E]=n(()=>Rs(""));i(()=>(x((R,N)=>E((C)=>ei(C,R==="shift"?{turn:N*5}:R==="ctrl"?{y:N*0.1}:R==="alt"?{scale:1.05**N}:{}))),()=>x(()=>{})),[x]);let w=_?.id??null;i(()=>{if(y||!w||!g.canMove(w))return;let R=!0;return m.inTurn(async()=>{m.saveNow();let N=await m.saved();if(!R||N===null||!m.canEdit())return;let C=await r(`/api/editor/${encodeURIComponent(p)}/copy`,{base:m.boundRevision(),revision:N,object:w});if(!R)return;if(C.error||!C.template||!C.at||!C.kind)S(C.error??"Could not copy this object");else v({template:C.template,at:C.at,kind:C.kind,source:w}),S(null),g.unpick()}),()=>{R=!1}},[p,w,m,g,y]);let T=l((R)=>{if(!y)return;let N=y.template,C={turn:M.turn,y:M.y,scale:M.scale};m.inTurn(async()=>{if(!m.canEdit())return;m.saveNow();let P=await m.saved();if(P===null)return;let I=await r(`/api/editor/${encodeURIComponent(p)}/copy`,{base:m.boundRevision(),revision:P,template:N,at:R,pose:C});if(I.error||!I.copy)S(I.error??"Could not place the copy");else m.addCopy(I.copy),S(null)})});i(()=>(g.setCopy(y?.source??null,y?(R)=>T(R):null,y?.at),()=>g.setCopy(null,null)),[g,y]),i(()=>{g.setCopyPose(M)},[g,M,y]);let A=b??(y?`Click to place ${y.kind}; keep clicking for more copies. Esc ends Copy.`:w&&!g.canMove(w)?"A power line goes with its poles; pick an object to copy.":w?"Preparing the copy …":"Click an object to copy it, then click where to place it. Esc ends Copy.");return t(Bn,{id:"edit-copy-set",title:"Copy",note:A,options:[t(tn,{label:"Turn",unit:"°",hint:"Turn each copy from the source (Shift + wheel)",min:-180,max:180,step:5,value:M.turn,onChange:(R)=>E((N)=>ei({...N,turn:R},{}))}),t(tn,{label:"Height",unit:"cm",hint:"Raise each copy above the clicked ground (Ctrl + wheel)",min:-1e4,max:1e4,step:10,value:Math.round(M.y*100),onChange:(R)=>E((N)=>ei({...N,y:R/100},{}))}),t(tn,{label:"Size",unit:"%",hint:"Size of each copy against its source (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(M.scale*100),onChange:(R)=>E((N)=>ei({...N,scale:R/100},{}))})],actions:y&&t(ji,{label:"Choose another",hint:"Pick a different source object",onClick:Qe(g,()=>{v(null),S(null),g.unpick()})})})}var Rr=(p)=>p.map((m)=>JSON.stringify(m));var Hg=400,Gg=5000,Vg=200,Wg=60000,Xg=64,qg=1000,Yg="This track was changed elsewhere: another tab or a build.",ju="This track was built again: the view shows the build before.",wl={removed:[],sorts:[],objectSorts:[],heights:[],placed:[],copies:[]},kn=(p,m)=>{let g=new Set(p),_=new Set(m);return g.size===_.size&&[...g].every((x)=>_.has(x))},wo=(p)=>p.map((m)=>[m.id,m.x,m.y,m.z,m.turn,m.scale].join(" "));function Ao(p){let m=p.recipe;return!!m&&kn(p.removed.map((g)=>g.id),m.deleted)&&kn(p.sorts,m.sorts)&&kn(p.objectSorts,m.objectSorts)&&kn(p.heights.map((g)=>g.id),m.heights)&&kn(wo(p.placed),wo(m.placed))&&kn(Rr(p.copies),Rr(m.copies??[]))}var Cr=null,$g=(p,m)=>kn(p.removed.map((g)=>g.id),m.removed.map((g)=>g.id))&&kn(p.sorts,m.sorts)&&kn(p.objectSorts,m.objectSorts)&&kn(p.heights.map((g)=>g.id),m.heights.map((g)=>g.id))&&kn(wo(p.placed),wo(m.placed))&&kn(Rr(p.copies),Rr(m.copies));class Al{now={...wl,keptRevision:0,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];joining=null;listeners=new Set;url;send;name;constructor(p,m=(g,_)=>fetch(g,_)){this.name=p,this.url=`/api/editor/${encodeURIComponent(p)}/edits`,this.send=m}markSaved(){let p=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:p.removed.map((m)=>m.id),sorts:p.sorts,objectSorts:p.objectSorts,heights:p.heights.map((m)=>m.id),placed:p.placed,copies:p.copies}})}inTurn(p){return this.turns=this.turns.then(p).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(p){this.onMeshes=p}handOver(p){Cr={name:p,edits:this.edits(),past:this.past,future:this.future}}subscribe=(p)=>(this.listeners.add(p),()=>{this.listeners.delete(p)});state=()=>this.now;set(p){this.now={...this.now,...p};for(let m of this.listeners)m()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(p){this.held=p,this.set({})}bind(p){this.bound=p,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:ju});else if(this.now.error===ju)this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let p=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let m=await this.send(this.url),g=await m.json();if(p!==this.asked)return;if(!m.ok)throw Error(g.error??`${m.status}`);this.base=g.base,this.revision=g.revision;let _={removed:g.deleted,sorts:g.sorts??[],objectSorts:g.object_sorts??[],heights:g.heights??[],placed:g.placed??[],copies:g.copies??[]},x=Cr?.name===this.name&&$g(Cr.edits,_)?Cr:null;Cr=null,this.past=x?.past??[],this.future=x?.future??[],this.onServer=_,this.unanswered=[];let y=g.saved,v=y?{at:y.at,deleted:y.deleted,sorts:y.sorts,objectSorts:y.object_sorts,heights:y.heights??[],placed:y.placed??[],copies:y.copies??[]}:null;this.set({..._,keptRevision:g.revision,recipe:v,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:g.outdated,save:"saved"}),this.compare()}catch(m){if(p===this.asked)this.set({save:"stuck",error:m.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((p)=>setTimeout(p,50));return this.isSaved()?this.revision:null}saveNow(p=!1){clearTimeout(this.timer),this.flush(p)}remove(p){let m=new Set(this.now.removed.map((g)=>g.id));this.change({...this.edits(),removed:[...this.now.removed,...p.filter((g)=>!m.has(g.id))]})}removeSelected(p,m){let g=new Set(this.now.removed.map((_)=>_.id));this.change({...this.edits(),removed:[...this.now.removed,...p.filter((_)=>!g.has(_.id))],sorts:[...new Set([...this.now.sorts,...m.filter((_)=>_.tree).map((_)=>_.sort)])],objectSorts:[...new Set([...this.now.objectSorts,...m.filter((_)=>!_.tree).map((_)=>_.sort)])]})}removeSort(p){if(!this.now.sorts.includes(p))this.change({...this.edits(),sorts:[...this.now.sorts,p]})}removeObjectSort(p){if(!this.now.objectSorts.includes(p))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,p]})}addHeight(p){this.change({...this.edits(),heights:[...this.now.heights,p]})}addCopy(p){this.change({...this.edits(),copies:[...this.now.copies,p]})}place(p,m){let g=new Set(p.map((y)=>y.id)),_=performance.now(),x=[...this.now.placed.filter((y)=>!g.has(y.id)),...p.filter((y)=>!Zu(y))];if(!!m&&this.joining?.key===m&&_-this.joining.at<qg&&this.past.length>0&&this.canEdit())this.past.pop();this.change({...this.edits(),placed:x},m?{key:m,at:_}:null)}placementOf(p){return this.now.placed.find((m)=>m.id===p)}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0||this.now.placed.length>0||this.now.copies.length>0}discard(){if(this.changed())this.change(wl)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights,placed:this.now.placed,copies:this.now.copies}}discardOutdated(){this.onServer=null,this.set({outdated:0,...wl}),this.saveNow()}undo(){if(!this.canEdit())return;this.joining=null;let p=this.past.pop();if(!p)return;this.future.push(this.edits()),this.apply(p)}redo(){if(!this.canEdit())return;this.joining=null;let p=this.future.pop();if(!p)return;this.past.push(this.edits()),this.apply(p)}change(p,m=null){if(!this.canEdit())return;if(this.joining=m,this.past.push(this.edits()),this.past.length>Vg)this.past.shift();this.future=[],this.apply(p)}apply(p){let m=p.heights===this.now.heights&&p.placed===this.now.placed&&p.copies===this.now.copies?Hg:0;this.set({...p,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),m)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights&&this.now.placed===this.onServer?.placed&&this.now.copies===this.onServer?.copies}async flush(p=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!p||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let m=this.edits(),g=++this.sent,_=`${Date.now()}-${g}-${Math.random().toString(36).slice(2,10)}`,x=JSON.stringify({base:this.bound,revision:this.revision,deleted:m.removed,sorts:m.sorts,object_sorts:m.objectSorts,heights:m.heights,placed:m.placed,copies:m.copies,id:_,unanswered:this.unanswered.map((y)=>y.id)});this.unanswered=[...this.unanswered,{id:_,number:g}].slice(-Xg),this.sending=!0,this.set({save:"saving"});try{let y=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:x,keepalive:p&&x.length<Wg}),v=await y.json().catch(()=>({}));if(g>=this.sent)this.sending=!1;if(g<this.answered)return;if([400,404,409,413].includes(y.status))return this.sending=!1,this.set({save:"stuck",error:y.status===409?Yg:v.error??`${y.status}`});if(!y.ok)throw Error(v.error??`${y.status}`);if(this.answered=g,this.revision=v.revision,this.onServer=m,this.unanswered=this.unanswered.filter((b)=>b.number>g),this.onMeshes(v.meshes??[],v.revision),this.set({keptRevision:v.revision}),!this.isSaved())return void this.flush(p);if(!this.sending)this.set({save:"saved",error:null})}catch(y){if(g>=this.sent)this.sending=!1;if(this.set({save:"failed",error:y.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),Gg)}}}var pn={notes:"notes_L1L6kQ",line:"line_L1L6kQ"};function Rl(p){let m={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[g,,_],radius:x}of p)m.minX=Math.min(m.minX,g-x),m.maxX=Math.max(m.maxX,g+x),m.minZ=Math.min(m.minZ,_-x),m.maxZ=Math.max(m.maxZ,_+x);return p.length?m:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function Cl(p,m){let g=new Map(p.map((_)=>[_,Math.hypot(_.center[0]-m[0],_.center[1]-m[1],_.center[2]-m[2])-_.radius]));return[...p].sort((_,x)=>g.get(x)-g.get(_))}function ts(p,m,g){return p+m<=g*1073741824}function Qu(p,m){return Math.round(p*m*4*2.333333333333333)}function td(p,m){return[Math.floor(p/256),Math.floor(-m/256)]}function Ro(p,m,g){if(p.length<2)return null;let _=1/0,x=0,y=0;for(let v=0;v+1<p.length;v++){let[b,S]=p[v],M=p[v+1][0]-b,E=p[v+1][1]-S,w=M*M+E*E,T=Math.sqrt(w),A=w?Math.min(1,Math.max(0,((m-b)*M+(g-S)*E)/w)):0,R=Math.hypot(m-(b+A*M),g-(S+A*E));if(R<_)_=R,x=y+A*T;y+=T}return{metre:x,off:_}}function ed([p,m],g,_,x){let y=Math.PI/180,v=g,b=-x,S=_,M=Math.sin(p*y),E=Math.cos(p*y),w=Math.sin(m*y),T=Math.cos(m*y),A=6378137/Math.sqrt(1-0.0066943799901413165*M*M),R=A*E*T-w*v-M*T*b+E*T*S,N=A*E*w+T*v-M*w*b+E*w*S,C=A*0.9933056200098587*M+E*b+M*S,P=Math.hypot(R,N),I=Math.atan2(C,P*0.9933056200098587);for(let U=0;U<5;U++){let D=Math.sin(I);I=Math.atan2(C+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*D*D))*D,P)}return[I/y,Math.atan2(N,R)/y]}function Pr(p,m){return Math.floor((m+p)/8)}function Co(p,m,g){return[Math.max(0,p*8-m),Math.min(g,(p+1)*8-m)]}var Jg={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},Po=(p)=>Jg[p]??p,Kg={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},es=(p)=>Kg[p]??Po(p),Pl=new Set(["house"]),Ir=(p,m)=>p.sorts?.[m]??p.kinds[m];function Cs(p,m){let g=[];if(!m.size)return g;for(let[_,x]of Object.entries(p))x.kinds.forEach((y,v)=>{if(m.has(Ir(x,v)))g.push(`${_}#${v}`)});return g}function Il(p,m){let g=new Set,_=[...p];while(_.length){let x=_.pop();if(g.has(x))continue;g.add(x),_.push(...m.get(x)??[])}return g}function nd(p,m,g){let _=0;for(let[x,y]of Object.entries(p))y.kinds.forEach((v,b)=>{if(Ir(y,b)===m&&y.faces[b].length&&!g.has(`${x}#${b}`))_++});return _}function Ll(p){let m=new Map;for(let[g,_]of Object.entries(p)){_.parents.forEach((x,y)=>{if(x<0)return;let v=`${g}#${x}`;if(!m.has(v))m.set(v,[]);m.get(v).push(`${g}#${y}`)});for(let[x,y]of Object.entries(_.with??{})){let v=`${g}#${x}`;m.set(v,[...m.get(v)??[],...y])}}return m}function Nl(p){let m=new Map;for(let[g,_]of Object.entries(p))_.faces.forEach((x,y)=>{for(let[v,b,S]of x){if(!m.has(v))m.set(v,[]);m.get(v).push({from:b,end:b+S,id:`${g}#${y}`})}});for(let g of m.values())g.sort((_,x)=>_.from-x.from);return m}function id(p,m){let g=0,_=(p?.length??0)-1;while(g<=_){let x=g+_>>1,y=p[x];if(m<y.from)_=x-1;else if(m>=y.end)g=x+1;else return y.id}return null}function Dl(p,m,g){let _=Math.floor((m-Math.floor(m))*p.cols),x=Math.floor((g-Math.floor(g))*p.rows);return p.sprites[x*p.cols+_]??null}var jg=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],Qg=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function sd(p){return jg.find(([m])=>m.test(p))?.[1]??"Unknown"}function rd(p){return Qg.find(([m])=>m.test(p))?.[1]??p}var t_=(p)=>`${p} ${p===1?"object":"objects"} deleted`,e_=(p)=>`${p} height ${p===1?"change":"changes"}`,n_=(p)=>`${p} ${p===1?"object":"objects"} moved`;function od({state:p,edits:m,view:g,note:_,viewFailed:x,saveFailed:y,markedName:v,picked:b,sort:S,reopen:M,readAgain:E}){let w=(A)=>Qe(g,A),T=b?.all.length??0;return e("div",{id:"edit-notes",className:pn.notes,children:[p.save==="failed"&&t("p",{id:"edit-kept",className:pn.line,children:"Changes not kept: trying again"}),_&&t("p",{id:"edit-tool-note",className:pn.line,children:_}),x&&e("p",{id:"edit-view-failed",className:pn.line,children:["The view doesn't show the last change, it is kept all the same: ",x," ",t("button",{type:"button",onClick:w(M),children:"Load again"})]}),p.heights.length>0&&t("p",{id:"edit-heights",className:pn.line,children:e_(p.heights.length)}),p.placed.length>0&&t("p",{id:"edit-placed",className:pn.line,children:n_(p.placed.length)}),p.removed.length>0&&t("p",{id:"edit-count",className:pn.line,children:t_(p.removed.length)}),p.copies.length>0&&e("p",{id:"edit-copies",className:pn.line,children:[p.copies.length," ",p.copies.length===1?"copy":"copies"]}),(p.sorts.length>0||p.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:pn.line,children:["All deleted: ",[...p.sorts,...p.objectSorts.map(es)].join(", ")]}),v&&e("p",{id:"edit-marked",className:pn.line,children:["All ",v," marked: X or Delete deletes them all, Esc ends it."]}),T>1&&!v&&e("p",{id:"edit-picked",className:pn.line,children:[T," objects picked: X or Delete deletes them all."]}),b&&T<2&&!v&&e("p",{id:"edit-picked",className:pn.line,children:[b.kind,b.sprite&&` · ${b.sprite}`,S&&es(S)!==b.kind&&` · ${es(S)}`,!b.id&&(b.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),y&&t("p",{id:"edit-made",className:pn.line,children:y}),p.outdated>0&&e("p",{id:"edit-outdated",className:pn.line,children:[p.outdated," older ",p.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",p.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:w(()=>m.discardOutdated()),children:"Give up"})]}),p.save==="stuck"&&e("p",{id:"edit-stuck",className:pn.line,children:[p.error," ",t("button",{type:"button",onClick:w(E),children:"Read again"})]})]})}var ad=10,i_=5,hd=1,ud=1e4,ld="#ff8a1f",cd="#2f8bff",s_=5;function dd({name:p,view:m,edits:g,enabled:_,speed:x,onNote:y}){let[v,b]=n(i_),[S,M]=n(!1),E=zu({view:m,edits:g,url:`/api/editor/${encodeURIComponent(p)}/brush`,enabled:_,onNote:y,colour:S?cd:ld,turnedColour:S?ld:cd,body:(w)=>({mm:Math.round(v*ad)*(S!==w?-1:1),speed:Math.round(x*ad)})});return{...E,height:v,lower:S,setHeight:b,setLower:M,wheel:(w,T)=>{if(w==="ctrl")E.setRadius((A)=>Qi(A,T,vl,xl,yl));else if(w==="alt")b((A)=>Qi(A,T,1,hd,ud));else if(w==="ctrlAlt")E.setSoft((A)=>Qi(A,T,s_,bl,Sl))}}}function fd({elevation:p,view:m}){let{shift:g}=To();return t(Bn,{id:"edit-elevation-set",title:"Elevation",options:[e(a,{children:[t(As,{label:"Raise",on:p.lower===g,hint:"It raises the ground (Shift: the other way)",onClick:Qe(m,()=>p.setLower(!1))}),t(As,{label:"Lower",on:p.lower!==g,hint:"It lowers the ground (Shift: the other way)",onClick:Qe(m,()=>p.setLower(!0))})]}),t(tn,{label:"Radius",unit:"m",hint:"How far it reaches, the ring on the ground (Ctrl + wheel)",min:xl,max:yl,step:vl,value:p.radius,onChange:p.setRadius}),t(tn,{label:"Height",unit:"cm",hint:"How far one click moves the ground, at its middle (Alt + wheel)",min:hd,max:ud,value:p.height,onChange:p.setHeight}),t(tn,{label:"Soft edge",unit:"%",hint:"How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge (Ctrl + Alt + wheel)",min:bl,max:Sl,step:10,value:p.soft,onChange:p.setSoft})]})}var pd=5,md=0.1,r_=1.05,Ul=100,gd=100;function _d({name:p,view:m,edits:g,state:_,enabled:x,picked:y,onNote:v}){let b=x?(y?.all??[]).map((R)=>R.id).filter((R)=>m.canMove(R)):[],S=(R)=>g.placementOf(R)??Rs(R),M=b.length?S(y?.id&&b.includes(y.id)?y.id:b[0]):Rs(""),E=(R,N)=>{if(!b.length||!g.canEdit())return;g.inTurn(()=>{if(!g.canEdit())return;let C=b.map((P)=>R(S(P)));C.forEach((P,I)=>m.nudge([b[I]],Ju(S(b[I]),P))),g.place(C,N&&`${N} ${b.join()}`)})},w=l((R)=>{let N=R.map((C)=>C.id);if(!g.canEdit())return m.rejectMove(N);if(!_.heights.length){g.place(R.map(({id:C,...P})=>ei(S(C),P))),v(null);return}g.inTurn(async()=>{let C=!1;try{if(!g.canEdit())return;g.saveNow();let P=await g.saved();if(P===null||!g.canEdit())return;let I=R.map(({id:D,...F})=>ei(S(D),F)),U=await r(`/api/editor/${encodeURIComponent(p)}/move`,{base:g.boundRevision(),revision:P,placed:I});if(U.error||!U.placed)v(U.error??"Could not move the objects");else if(g.canEdit())g.place(U.placed),C=!0,v(null)}finally{if(!C)m.rejectMove(N)}})});i(()=>(m.setMove(x,(R)=>w(R)),()=>m.setMove(!1,()=>{})),[m,x]),i(()=>{m.setPlaced(_.placed)},[m,_.placed]);let T=(R,N)=>E((C)=>ei(C,R),N),A=(R,N)=>E((C)=>ei({...C,[R]:N},{}));return{ids:b,shown:M,setTurn:(R)=>A("turn",R),setHeight:(R)=>A("y",R/Ul),setSize:(R)=>A("scale",R/gd),reset:()=>{g.inTurn(()=>{if(b.length&&g.canEdit())g.place(b.map(Rs))})},wheel:(R,N)=>{if(!b.length)return v("Pick an object first: click it, Ctrl + click adds more");if(R==="shift")T({turn:N*pd},"turn");else if(R==="ctrl")T({y:N*md},"height");else if(R==="alt")T({scale:r_**N},"size")}}}function xd({move:p,view:m}){let g=!p.ids.length;return t(Bn,{id:"edit-move-set",title:"Move",note:g?"Click an object to pick it, drag it to move it; Ctrl + click adds more.":void 0,options:[t(tn,{label:"Turn",unit:"°",hint:"How far it is turned from how it was built, counter-clockwise (Shift + wheel)",min:-180,max:180,step:pd,value:p.shown.turn,onChange:p.setTurn}),t(tn,{label:"Height",unit:"cm",hint:"How far it is raised from where it was built (Ctrl + wheel)",min:-1e4,max:1e4,step:md*Ul,value:Math.round(p.shown.y*Ul),onChange:p.setHeight}),t(tn,{label:"Size",unit:"%",hint:"Its size, against how it was built (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(p.shown.scale*gd),onChange:(_)=>p.setSize(Math.max(10,_))})],actions:t(ji,{id:"edit-move-reset",label:"Reset",hint:"Back where and as it was built",onClick:Qe(m,p.reset)})})}var Ol=20;function yd(p,m,g){let _=0,x=1/0;return p.forEach(([y,,v],b)=>{let S=(y-m)**2+(v-g)**2;if(S<x)x=S,_=b}),_}function vd(p,m,g,_){return p.slice(1).some(([x,,y],v)=>{let[b,,S]=p[v],M=x-b,E=y-S,w=Math.max(0,Math.min(1,((g-b)*M+(_-S)*E)/(M*M+E*E||1)));return Math.hypot(g-b-w*M,_-S-w*E)<=m/2})}function bd(p,m,g,_){if(p.length<2)return[...p,[g,_]];if(!m?.length)return[...p.slice(0,-1),[g,_],p[p.length-1]];let x=yd(m,g,_);if(x===0)return[[g,_],...p];if(x===m.length-1)return[...p,[g,_]];let y=p.findIndex(([v,b])=>yd(m,v,b)>x);return y<0?[...p,[g,_]]:[...p.slice(0,y),[g,_],...p.slice(y)]}var ns={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function a_(p,m){for(let g=1;;g++){let _=`${p} (copy${g>1?` ${g}`:""})`;if(!m.includes(_))return _}}function Sd({title:p,taken:m,canOverwrite:g,onOverwrite:_,onSaveNew:x,onCancel:y}){let[v,b]=n(p),S=v.trim(),M=S===p,E=!S?"Give it a name.":!M&&m.includes(S)?`Another track is called “${S}” already.`:null,w=M?a_(p,m):S;return i(()=>{let T=(A)=>{if(A.key==="Escape")y()};return document.addEventListener("keydown",T),()=>document.removeEventListener("keydown",T)},[y]),t("div",{id:"save-back",className:ns.back,onMouseDown:(T)=>{if(T.target===T.currentTarget)y()},children:e("form",{id:"save-dialog",className:ns.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(T)=>{if(T.preventDefault(),!E)x(w)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:ns.field,children:["Name",t("input",{id:"save-name",type:"text",value:v,maxLength:80,autoFocus:!0,onChange:(T)=>b(T.target.value)})]}),t("p",{id:"save-taken",className:ns.note,children:E??`Save as new track makes “${w}”. Whatever you delete can be brought back later.`}),e("div",{className:ns.buttons,children:[t("button",{type:"button",onClick:y,children:"Cancel"}),t("button",{type:"button",disabled:!M||!g,onClick:_,children:"Overwrite"}),t("button",{type:"submit",className:ns.primary,disabled:!!E,children:"Save as new track"})]})]})})}var zn={tools:"tools_oZyV8A",fileButtons:"fileButtons_oZyV8A",group:"group_oZyV8A",title:"title_oZyV8A",row:"row_oZyV8A",split:"split_oZyV8A",on:"on_oZyV8A",picker:"picker_oZyV8A",key:"key_oZyV8A"};var Bl=(p)=>p.removed.length>0||p.sorts.length>0||p.objectSorts.length>0||p.heights.length>0||p.placed.length>0||p.copies.length>0,Fl=(p)=>!Bl(p)&&!p.recipe,c_=(p)=>new Date(p*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function Md({name:p,edits:m,state:g,view:_,onSaved:x}){let[y,v]=n(null),[b,S]=n({busy:!1,text:null}),{starting:M,play:E}=f(),w=Ao(g),T=Fl(g),A=m.canEdit()&&!b.busy&&!w&&!T,R=async(N=null)=>{v(null),S({busy:!0,text:null}),await m.settled(),m.hold(!0),m.saveNow();let C=await m.saved();if(C===null)return m.hold(!1),S({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let P=await r(`/api/editor/${encodeURIComponent(p)}/save`,{copy:N!==null,title:N,revision:C});if(m.hold(!1),P.error||!P.name)return S({busy:!1,text:`Not saved: ${P.error??"no answer"}`}),null;if(S({busy:!1,text:null}),N!==null)m.handOver(P.name);else m.markSaved();return x(P.name),P.name};return{asking:y,canSave:A,starting:M,busy:b.busy,failed:b.text,savedText:b.busy?"Saving …":w?`Saved ${c_(g.recipe.at)}`:T?"":"Not saved",canPlay:!M&&!b.busy&&g.save!=="loading"&&(w||T||A),saveAs:()=>v({play:!1}),chosen:async(N)=>{_.focus();let C=y?.play,P=await R(N);if(P&&C)E(P)},cancel:o(()=>{v(null),_.focus()},[_]),save:async()=>{await m.settled();let N=m.state();if(!m.canEdit()||b.busy||Ao(N)||Fl(N))return;if(N.recipe)R();else v({play:!1})},drive:async()=>{await m.settled();let N=m.state();if(Ao(N)||Fl(N))E(p);else if(!N.recipe)v({play:!0});else if(await R())E(p)}}}var zl=[{tool:"select",group:"general",id:"edit-select",label:"Select",key:"V",hint:"Click an object to pick it, Ctrl + click adds more, Shift + click selects all matching, X or Delete takes them out; a right click marks all of its sort (V)"},{tool:"camera",group:"general",id:"edit-camera",label:"Camera",key:"K",hint:"Go along the track by the wheel or riding by itself, back to the first view (K; Esc ends it)"},{tool:"road",group:"terrain",id:"edit-road",label:"Mark road",key:"R",hint:"Two clicks on the road mark a stretch of it, for Smooth; further clicks are pins (R; Esc ends it)"},{tool:"smooth",group:"terrain",id:"edit-smooth",label:"Smooth",key:"T",hint:"Even out a marked stretch of road: mark it first or after, it shows at once, Enter takes it (T; Esc ends it)"},{tool:"elevation",group:"terrain",id:"edit-elevation",label:"Elevation",key:"H",hint:"Raise or lower the ground: click, or hold and move (H; Esc ends it)"},{tool:"move",group:"objects",id:"edit-move",label:"Move",key:"M",hint:"Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},{tool:"copy",group:"objects",id:"edit-copy",label:"Copy",key:"C",hint:"Pick an object, then click to place copies repeatedly (C; Esc ends it)"},{tool:"delete",group:"objects",id:"edit-click-deletes",label:"Delete",key:"X",hint:"Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"}];function kl({title:p,children:m}){return e("section",{className:zn.group,children:[t("h3",{className:zn.title,children:p}),m]})}function Ed({state:p,edits:m,view:g,saving:_}){let x=(y)=>Qe(g,y);return e("div",{className:`${zn.tools} ${zn.fileButtons}`,children:[e("div",{className:zn.row,children:[e("span",{className:zn.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!_.canSave,onClick:x(()=>void _.save()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!m.canEdit()||_.busy,onClick:_.saveAs,children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!_.canPlay,title:"Save if needed, then drive it in Assetto Corsa",onClick:x(()=>void _.drive()),children:_.starting?"Starting …":"▶ Play"})]}),t("button",{type:"button",disabled:!Bl(p)||!m.canEdit()||_.busy,title:"Restore the track as built, taking back all Editor changes",onClick:x(()=>{if(confirm(`Discard all Editor changes and restore the track as built?

This includes previously saved edits. Save to apply it to Assetto Corsa; Undo brings the edits back.`))m.inTurn(()=>m.discard())}),children:"Discard all"})]})}function Td({state:p,edits:m,view:g,tool:_,onTool:x}){let y=m.canEdit(),v=(E)=>Qe(g,E),b=(E)=>E==="select"||E==="camera",S=y||b(_)?_:"select",M=(E)=>t("div",{className:zn.picker,children:zl.filter((w)=>w.group===E).map((w)=>e("button",{type:"button",id:w.id,className:S===w.tool?zn.on:"","aria-pressed":S===w.tool,disabled:!y&&!b(w.tool),title:w.hint,onClick:v(()=>x(w.tool)),children:[w.label,t("span",{className:zn.key,"aria-hidden":"true",children:w.key})]},w.tool))});return e("div",{id:"edit-bar",className:zn.tools,"data-kept":p.save,children:[e(kl,{title:"General",children:[e("div",{id:"edit-history",className:zn.row,children:[t("button",{type:"button",disabled:!p.canUndo||!y,title:"Ctrl+Z",onClick:v(()=>void m.inTurn(()=>m.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!p.canRedo||!y,title:"Ctrl+Shift+Z",onClick:v(()=>void m.inTurn(()=>m.redo())),children:"↷ Redo"})]}),M("general")]}),t(kl,{title:"Terrain",children:M("terrain")}),t(kl,{title:"Objects",children:M("objects")})]})}var h_=60,u_=1,wd=3,d_=60,f_=5;function Ad({name:p,view:m,edits:g,enabled:_,previewing:x,revision:y,onNote:v}){let[b,S]=n([]),[M,E]=n([]),[w,T]=n(null),[A,R]=n(null),[N,C]=n(0),[P,I]=n(null),[U,D]=n(50),F=P??N,z=(G="")=>`/api/editor/${encodeURIComponent(p)}/band${G}`,L=()=>{S([]),E([]),T(null),R(null),I(null)};i(()=>{if(b.length<2||b===M)return;let G=!1;return r(z("/way"),{base:g.boundRevision(),points:b}).then((W)=>{if(G)return;if(W.error||!W.line){v(W.error??"No road found"),S((J)=>M.length?M:J.slice(0,1));return}E(b),T(W.line),C(W.width??0),R(null),v(null)}),()=>{G=!0}},[b,g]),i(()=>{if(b.length!==1||!_){m.setMarking(null);return}let G=!1,W=!1,J=null,X=(Q,st)=>{G=!0,r(z("/way"),{base:g.boundRevision(),points:[b[0],[Q,st]]}).then((tt)=>{if(G=!1,W)return;if(R(tt.line??null),J){let[_t,ot]=J;J=null,X(_t,ot)}})};return m.setMarking((Q,st)=>{if(G)J=[Q,st];else X(Q,st)}),()=>{W=!0,m.setMarking(null)}},[m,b,_,g]),i(()=>{let G=b.length?[[b[0][0],m.heightOfGround(b[0][0],b[0][1]),b[0][1]]]:null;return m.drawBand(w??A??G,w||A?F||wd:0),()=>m.drawBand(null,0)},[m,b,w,A,F]),i(()=>(m.drawPins(_?b.map(([G,W])=>[G,m.heightOfGround(G,W),W]):[]),()=>m.drawPins([])),[m,b,_]);let O=l((G,W,J)=>{S(b.map((X,Q)=>Q===G?[W,J]:X)),v(null)}),H=l((G)=>{let W=b.filter((J,X)=>X!==G);if(S(W),W.length<2)E([]),T(null),R(null);v(null)});return i(()=>(m.setPinned((G,W,J)=>O(G,W,J),(G)=>H(G)),()=>m.setPinned(()=>{},()=>{})),[m]),i(()=>{if(!w||!x){m.takeBackPreview();return}let G=!1,W=(X)=>{if(G)return;m.takeBackPreview(),v(X)},J=setTimeout(()=>{fetch(z("/preview"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base:g.boundRevision(),points:M,width:F,strength:U/100})}).then(async(X)=>{if(G)return;if(X.ok){let Q=await X.arrayBuffer();if(!G)m.showPreview(Q)}else W(String((await X.json().catch(()=>null))?.error??X.status))}).catch(()=>W("No preview: the server does not answer"))},h_);return()=>{G=!0,clearTimeout(J)}},[m,w,x,F,U,y,g]),{points:b,line:w,width:F,strength:U,clear:L,apply:()=>{if(!w)return!1;if(b!==M)return v("The way is still being found: press Enter again in a moment"),!0;let G={base:g.boundRevision(),points:M,width:F,strength:U/100};return m.keepPreview(),L(),g.inTurn(async()=>{let J=await g.saved()===null?{error:"the changes before it could not be kept"}:await r(z(),G);if(J.error||!("height"in J)||!J.height||!g.canEdit())return m.dropPreview(),v(`Not changed: ${J.error??"this track can't be changed now"}`);g.addHeight(J.height),v(J.standing?`${J.standing} objects at the edge of it stayed where they are: their places lie outside.`:null)}),!0},click:(G,W)=>{if(b.length>=Ol)return v(`A band has at most ${Ol} points`);S(bd(b,w,G,W)),v(null)},setWidth:I,setStrength:D,wheel:(G,W)=>{if(G==="shift")D((J)=>Math.min(100,Math.max(0,J+W*f_)));else if(G==="ctrl")I(Math.min(d_,Math.max(wd,Math.round(F)+W*u_)))}}}var Hl={back:"back_vaYpAg",menu:"menu_vaYpAg"};var Rd=230,Cd=230;function Pd({at:p,mark:m,canDelete:g,onMove:_,onDuplicate:x,onSmooth:y,onMark:v,onDelete:b,onClose:S}){let M=p.x+Rd>p.width?Math.max(0,p.x-Rd):p.x,E=p.y+Cd>p.height?Math.max(0,p.y-Cd):p.y,w=(T)=>()=>{S(),T()};return t("div",{className:Hl.back,onPointerDown:(T)=>{if(T.target===T.currentTarget)S()},onContextMenu:(T)=>T.preventDefault(),children:e("div",{id:"view-menu",className:Hl.menu,role:"menu",style:{left:M,top:E},children:[y&&t("button",{type:"button",role:"menuitem",onClick:w(y),children:"Smooth"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Edit…"}),t("button",{type:"button",role:"menuitem",disabled:!_,onClick:w(()=>_?.()),children:"Move"}),t("button",{type:"button",role:"menuitem",disabled:!x,onClick:w(()=>x?.()),children:"Duplicate"}),m&&t("button",{type:"button",role:"menuitem",onClick:w(v),children:m}),t("button",{type:"button",role:"menuitem",disabled:!g,onClick:w(b),children:"Delete"})]})})}var ls="187";var mf=0,gc=1,gf=2;var Gr=1,_f=2,Zs=3,vi=0,xn=1,wn=2,cs=0,Vr=1,_c=2,xc=3,yc=4,xf=5;var Js=100,yf=101,vf=102,bf=103,Sf=104,Mf=200,Ef=201,Tf=202,wf=203,Af=204,Rf=205,Cf=206,Pf=207,If=208,Lf=209,Nf=210,Df=211,Uf=212,Of=213,Ff=214,Bf=0,kf=1,zf=2,vc=3,Hf=4,Gf=5,Vf=6,Wf=7,Xf=0,qf=1,Yf=2,si=0,bc=1,Sc=2,Mc=3,Ec=4,Tc=5,wc=6,Ac=7;var Wr=301,Ks=302,oa=303,aa=304,js=1000,la=1001,$f=1002,Fi=1003,Zf=1004;var Xr=1005;var yn=1006,ca=1007;var Kn=1008;var jn=1009,Jf=1010,Kf=1011,qr=1012,Rc=1013,Bi=1014,bi=1015,ri=1016,Cc=1017,Pc=1018,hs=1020,jf=35902,Qf=35899,tp=1021,ep=1022,Gn=1023,Qs=1026,ki=1027,np=1028,Ic=1029,us=1030,Lc=1031;var Nc=1033,tr=33776,ha=33777,er=33778,nr=33779,Dc=35840,Uc=35841,Oc=35842,Fc=35843,Yr=36196,Bc=37492,kc=37496,zc=37488,Hc=37489,ua=37490,Gc=37491,Vc=37808,Wc=37809,Xc=37810,qc=37811,Yc=37812,$c=37813,Zc=37814,Jc=37815,Kc=37816,jc=37817,Qc=37818,th=37819,eh=37820,nh=37821,ih=36492,$r=36494,Zr=36495,sh=36283,rh=36284,da=36285,oh=36286;var ah=0,ip=1,ds="",fa="srgb",lh="srgb-linear",ch="linear",Ie="srgb";var sp=512,rp=513,op=514,hh=515,ap=516,lp=517,uh=518,dh=519;var fh="300 es",ph=2000;function m_(p){for(let m=p.length-1;m>=0;--m)if(p[m]>=65535)return!0;return!1}function g_(p){return ArrayBuffer.isView(p)&&!(p instanceof DataView)}function zr(p){return document.createElementNS("http://www.w3.org/1999/xhtml",p)}function cp(){let p=zr("canvas");return p.style.display="block",p}var Id={},Ys=null;function Hr(...p){let m="THREE."+p.shift();if(Ys)Ys("log",m,...p);else console.log(m,...p)}function hp(p){let m=p[0];if(typeof m==="string"&&m.startsWith("TSL:")){let g=p[1];if(g&&g.isStackTrace)p[0]+=" "+g.getLocation();else p[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return p}function Xt(...p){p=hp(p);let m="THREE."+p.shift();if(Ys)Ys("warn",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.warn(g.getError(m));else console.warn(m,...p)}}function $t(...p){p=hp(p);let m="THREE."+p.shift();if(Ys)Ys("error",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.error(g.getError(m));else console.error(m,...p)}}function Fr(...p){let m=p.join(" ");if(m in Id)return;Id[m]=!0,Xt(...p)}function up(p,m,g){return new Promise(function(_,x){function y(){switch(p.clientWaitSync(m,p.SYNC_FLUSH_COMMANDS_BIT,0)){case p.WAIT_FAILED:x();break;case p.TIMEOUT_EXPIRED:setTimeout(y,g);break;default:_()}}setTimeout(y,g)})}var dp={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class Si{addEventListener(p,m){if(this._listeners===void 0)this._listeners={};let g=this._listeners;if(g[p]===void 0)g[p]=[];if(g[p].indexOf(m)===-1)g[p].push(m)}hasEventListener(p,m){let g=this._listeners;if(g===void 0)return!1;return g[p]!==void 0&&g[p].indexOf(m)!==-1}removeEventListener(p,m){let g=this._listeners;if(g===void 0)return;let _=g[p];if(_!==void 0){let x=_.indexOf(m);if(x!==-1)_.splice(x,1)}}dispatchEvent(p){let m=this._listeners;if(m===void 0)return;let g=m[p.type];if(g!==void 0){p.target=this;let _=g.slice(0);for(let x=0,y=_.length;x<y;x++)_[x].call(this,p);p.target=null}}}var mn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ld=1234567,Br=Math.PI/180,$s=180/Math.PI;function zi(){let p=Math.random()*4294967295|0,m=Math.random()*4294967295|0,g=Math.random()*4294967295|0,_=Math.random()*4294967295|0;return(mn[p&255]+mn[p>>8&255]+mn[p>>16&255]+mn[p>>24&255]+"-"+mn[m&255]+mn[m>>8&255]+"-"+mn[m>>16&15|64]+mn[m>>24&255]+"-"+mn[g&63|128]+mn[g>>8&255]+"-"+mn[g>>16&255]+mn[g>>24&255]+mn[_&255]+mn[_>>8&255]+mn[_>>16&255]+mn[_>>24&255]).toLowerCase()}function se(p,m,g){return Math.max(m,Math.min(g,p))}function mh(p,m){return(p%m+m)%m}function __(p,m,g,_,x){return _+(p-m)*(x-_)/(g-m)}function x_(p,m,g){if(p!==m)return(g-p)/(m-p);else return 0}function kr(p,m,g){return(1-g)*p+g*m}function y_(p,m,g,_){return kr(p,m,1-Math.exp(-g*_))}function v_(p,m=1){return m-Math.abs(mh(p,m*2)-m)}function b_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*(3-2*p)}function S_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*p*(p*(p*6-15)+10)}function M_(p,m){return p+Math.floor(Math.random()*(m-p+1))}function E_(p,m){return p+Math.random()*(m-p)}function T_(p){return p*(0.5-Math.random())}function w_(p){if(p!==void 0)Ld=p;let m=Ld+=1831565813;return m=Math.imul(m^m>>>15,m|1),m^=m+Math.imul(m^m>>>7,m|61),((m^m>>>14)>>>0)/4294967296}function A_(p){return p*Br}function R_(p){return p*$s}function C_(p){return p>0&&Number.isInteger(p)&&2**Math.round(Math.log2(p))===p}function P_(p){return Math.pow(2,Math.ceil(Math.log(p)/Math.LN2))}function gh(p){return Math.pow(2,Math.floor(Math.log(p)/Math.LN2))}function I_(p,m,g,_,x){let{cos:y,sin:v}=Math,b=y(g/2),S=v(g/2),M=y((m+_)/2),E=v((m+_)/2),w=y((m-_)/2),T=v((m-_)/2),A=y((_-m)/2),R=v((_-m)/2);switch(x){case"XYX":p.set(b*E,S*w,S*T,b*M);break;case"YZY":p.set(S*T,b*E,S*w,b*M);break;case"ZXZ":p.set(S*w,S*T,b*E,b*M);break;case"XZX":p.set(b*E,S*R,S*A,b*M);break;case"YXY":p.set(S*A,b*E,S*R,b*M);break;case"ZYZ":p.set(S*R,S*A,b*E,b*M);break;default:Xt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+x)}}function pa(p){switch(p.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function _h(p,m){if(m.constructor===Float32Array)return p;let g=pa(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(p/g,-1)}function xh(p,m){if(m.constructor===Float32Array)return p;let g=pa(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(p*g)}var Mi={DEG2RAD:Br,RAD2DEG:$s,generateUUID:zi,clamp:se,euclideanModulo:mh,mapLinear:__,inverseLerp:x_,lerp:kr,damp:y_,pingpong:v_,smoothstep:b_,smootherstep:S_,randInt:M_,randFloat:E_,randFloatSpread:T_,seededRandom:w_,degToRad:A_,radToDeg:R_,isPowerOfTwo:C_,ceilPowerOfTwo:P_,floorPowerOfTwo:gh,setQuaternionFromProperEuler:I_,normalize:xh,denormalize:_h};class Jt{static{this.prototype.isVector2=!0}constructor(p=0,m=0){this.x=p,this.y=m}get width(){return this.x}set width(p){this.x=p}get height(){return this.y}set height(p){this.y=p}set(p,m){return this.x=p,this.y=m,this}setScalar(p){return this.x=p,this.y=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;default:throw Error("THREE.Vector2: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y)}copy(p){return this.x=p.x,this.y=p.y,this}add(p){return this.x+=p.x,this.y+=p.y,this}addScalar(p){return this.x+=p,this.y+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this}subScalar(p){return this.x-=p,this.y-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this}multiply(p){return this.x*=p.x,this.y*=p.y,this}multiplyScalar(p){return this.x*=p,this.y*=p,this}divide(p){return this.x/=p.x,this.y/=p.y,this}divideScalar(p){return this.multiplyScalar(1/p)}applyMatrix3(p){let m=this.x,g=this.y,_=p.elements;return this.x=_[0]*m+_[3]*g+_[6],this.y=_[1]*m+_[4]*g+_[7],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this}clamp(p,m){return this.x=se(this.x,p.x,m.x),this.y=se(this.y,p.y,m.y),this}clampScalar(p,m){return this.x=se(this.x,p,m),this.y=se(this.y,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(se(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(p){return this.x*p.x+this.y*p.y}cross(p){return this.x*p.y-this.y*p.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(se(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y;return m*m+g*g}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this}equals(p){return p.x===this.x&&p.y===this.y}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this}rotateAround(p,m){let g=Math.cos(m),_=Math.sin(m),x=this.x-p.x,y=this.y-p.y;return this.x=x*g-y*_+p.x,this.y=x*_+y*g+p.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ei{constructor(p=0,m=0,g=0,_=1){this.isQuaternion=!0,this._x=p,this._y=m,this._z=g,this._w=_}static slerpFlat(p,m,g,_,x,y,v){let b=g[_+0],S=g[_+1],M=g[_+2],E=g[_+3],w=x[y+0],T=x[y+1],A=x[y+2],R=x[y+3];if(E!==R||b!==w||S!==T||M!==A){let N=b*w+S*T+M*A+E*R;if(N<0)w=-w,T=-T,A=-A,R=-R,N=-N;let C=1-v;if(N<0.9995){let P=Math.acos(N),I=Math.sin(P);C=Math.sin(C*P)/I,v=Math.sin(v*P)/I,b=b*C+w*v,S=S*C+T*v,M=M*C+A*v,E=E*C+R*v}else{b=b*C+w*v,S=S*C+T*v,M=M*C+A*v,E=E*C+R*v;let P=1/Math.sqrt(b*b+S*S+M*M+E*E);b*=P,S*=P,M*=P,E*=P}}p[m]=b,p[m+1]=S,p[m+2]=M,p[m+3]=E}static multiplyQuaternionsFlat(p,m,g,_,x,y){let v=g[_],b=g[_+1],S=g[_+2],M=g[_+3],E=x[y],w=x[y+1],T=x[y+2],A=x[y+3];return p[m]=v*A+M*E+b*T-S*w,p[m+1]=b*A+M*w+S*E-v*T,p[m+2]=S*A+M*T+v*w-b*E,p[m+3]=M*A-v*E-b*w-S*T,p}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get w(){return this._w}set w(p){this._w=p,this._onChangeCallback()}set(p,m,g,_){return this._x=p,this._y=m,this._z=g,this._w=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(p){return this._x=p.x,this._y=p.y,this._z=p.z,this._w=p.w,this._onChangeCallback(),this}setFromEuler(p,m=!0){let{_x:g,_y:_,_z:x,_order:y}=p,{cos:v,sin:b}=Math,S=v(g/2),M=v(_/2),E=v(x/2),w=b(g/2),T=b(_/2),A=b(x/2);switch(y){case"XYZ":this._x=w*M*E+S*T*A,this._y=S*T*E-w*M*A,this._z=S*M*A+w*T*E,this._w=S*M*E-w*T*A;break;case"YXZ":this._x=w*M*E+S*T*A,this._y=S*T*E-w*M*A,this._z=S*M*A-w*T*E,this._w=S*M*E+w*T*A;break;case"ZXY":this._x=w*M*E-S*T*A,this._y=S*T*E+w*M*A,this._z=S*M*A+w*T*E,this._w=S*M*E-w*T*A;break;case"ZYX":this._x=w*M*E-S*T*A,this._y=S*T*E+w*M*A,this._z=S*M*A-w*T*E,this._w=S*M*E+w*T*A;break;case"YZX":this._x=w*M*E+S*T*A,this._y=S*T*E+w*M*A,this._z=S*M*A-w*T*E,this._w=S*M*E-w*T*A;break;case"XZY":this._x=w*M*E-S*T*A,this._y=S*T*E-w*M*A,this._z=S*M*A+w*T*E,this._w=S*M*E+w*T*A;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+y)}if(m===!0)this._onChangeCallback();return this}setFromAxisAngle(p,m){let g=m/2,_=Math.sin(g);return this._x=p.x*_,this._y=p.y*_,this._z=p.z*_,this._w=Math.cos(g),this._onChangeCallback(),this}setFromRotationMatrix(p){let m=p.elements,g=m[0],_=m[4],x=m[8],y=m[1],v=m[5],b=m[9],S=m[2],M=m[6],E=m[10],w=g+v+E;if(w>0){let T=0.5/Math.sqrt(w+1);this._w=0.25/T,this._x=(M-b)*T,this._y=(x-S)*T,this._z=(y-_)*T}else if(g>v&&g>E){let T=2*Math.sqrt(1+g-v-E);this._w=(M-b)/T,this._x=0.25*T,this._y=(_+y)/T,this._z=(x+S)/T}else if(v>E){let T=2*Math.sqrt(1+v-g-E);this._w=(x-S)/T,this._x=(_+y)/T,this._y=0.25*T,this._z=(b+M)/T}else{let T=2*Math.sqrt(1+E-g-v);this._w=(y-_)/T,this._x=(x+S)/T,this._y=(b+M)/T,this._z=0.25*T}return this._onChangeCallback(),this}setFromUnitVectors(p,m){let g=p.dot(m)+1;if(g<0.00000001)if(g=0,Math.abs(p.x)>Math.abs(p.z))this._x=-p.y,this._y=p.x,this._z=0,this._w=g;else this._x=0,this._y=-p.z,this._z=p.y,this._w=g;else this._x=p.y*m.z-p.z*m.y,this._y=p.z*m.x-p.x*m.z,this._z=p.x*m.y-p.y*m.x,this._w=g;return this.normalize()}angleTo(p){return 2*Math.acos(Math.abs(se(this.dot(p),-1,1)))}rotateTowards(p,m){let g=this.angleTo(p);if(g===0)return this;let _=Math.min(1,m/g);return this.slerp(p,_),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(p){return this._x*p._x+this._y*p._y+this._z*p._z+this._w*p._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let p=this.length();if(p===0)this._x=0,this._y=0,this._z=0,this._w=1;else p=1/p,this._x=this._x*p,this._y=this._y*p,this._z=this._z*p,this._w=this._w*p;return this._onChangeCallback(),this}multiply(p){return this.multiplyQuaternions(this,p)}premultiply(p){return this.multiplyQuaternions(p,this)}multiplyQuaternions(p,m){let{_x:g,_y:_,_z:x,_w:y}=p,{_x:v,_y:b,_z:S,_w:M}=m;return this._x=g*M+y*v+_*S-x*b,this._y=_*M+y*b+x*v-g*S,this._z=x*M+y*S+g*b-_*v,this._w=y*M-g*v-_*b-x*S,this._onChangeCallback(),this}slerp(p,m){let{_x:g,_y:_,_z:x,_w:y}=p,v=this.dot(p);if(v<0)g=-g,_=-_,x=-x,y=-y,v=-v;let b=1-m;if(v<0.9995){let S=Math.acos(v),M=Math.sin(S);b=Math.sin(b*S)/M,m=Math.sin(m*S)/M,this._x=this._x*b+g*m,this._y=this._y*b+_*m,this._z=this._z*b+x*m,this._w=this._w*b+y*m,this._onChangeCallback()}else this._x=this._x*b+g*m,this._y=this._y*b+_*m,this._z=this._z*b+x*m,this._w=this._w*b+y*m,this.normalize();return this}slerpQuaternions(p,m,g){return this.copy(p).slerp(m,g)}random(){let p=2*Math.PI*Math.random(),m=2*Math.PI*Math.random(),g=Math.random(),_=Math.sqrt(1-g),x=Math.sqrt(g);return this.set(_*Math.sin(p),_*Math.cos(p),x*Math.sin(m),x*Math.cos(m))}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._w===this._w}fromArray(p,m=0){return this._x=p[m],this._y=p[m+1],this._z=p[m+2],this._w=p[m+3],this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._w,p}fromBufferAttribute(p,m){return this._x=p.getX(m),this._y=p.getY(m),this._z=p.getZ(m),this._w=p.getW(m),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Y{static{this.prototype.isVector3=!0}constructor(p=0,m=0,g=0){this.x=p,this.y=m,this.z=g}set(p,m,g){if(g===void 0)g=this.z;return this.x=p,this.y=m,this.z=g,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;default:throw Error("THREE.Vector3: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this}multiplyVectors(p,m){return this.x=p.x*m.x,this.y=p.y*m.y,this.z=p.z*m.z,this}applyEuler(p){return this.applyQuaternion(Nd.setFromEuler(p))}applyAxisAngle(p,m){return this.applyQuaternion(Nd.setFromAxisAngle(p,m))}applyMatrix3(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[3]*g+x[6]*_,this.y=x[1]*m+x[4]*g+x[7]*_,this.z=x[2]*m+x[5]*g+x[8]*_,this}applyNormalMatrix(p){return this.applyMatrix3(p).normalize()}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=p.elements,y=1/(x[3]*m+x[7]*g+x[11]*_+x[15]);return this.x=(x[0]*m+x[4]*g+x[8]*_+x[12])*y,this.y=(x[1]*m+x[5]*g+x[9]*_+x[13])*y,this.z=(x[2]*m+x[6]*g+x[10]*_+x[14])*y,this}applyQuaternion(p){let m=this.x,g=this.y,_=this.z,{x,y,z:v,w:b}=p,S=2*(y*_-v*g),M=2*(v*m-x*_),E=2*(x*g-y*m);return this.x=m+b*S+y*E-v*M,this.y=g+b*M+v*S-x*E,this.z=_+b*E+x*M-y*S,this}project(p){return this.applyMatrix4(p.matrixWorldInverse).applyMatrix4(p.projectionMatrix)}unproject(p){return this.applyMatrix4(p.projectionMatrixInverse).applyMatrix4(p.matrixWorld)}transformDirection(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[4]*g+x[8]*_,this.y=x[1]*m+x[5]*g+x[9]*_,this.z=x[2]*m+x[6]*g+x[10]*_,this.normalize()}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this}divideScalar(p){return this.multiplyScalar(1/p)}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this}clamp(p,m){return this.x=se(this.x,p.x,m.x),this.y=se(this.y,p.y,m.y),this.z=se(this.z,p.z,m.z),this}clampScalar(p,m){return this.x=se(this.x,p,m),this.y=se(this.y,p,m),this.z=se(this.z,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(se(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this}cross(p){return this.crossVectors(this,p)}crossVectors(p,m){let{x:g,y:_,z:x}=p,{x:y,y:v,z:b}=m;return this.x=_*b-x*v,this.y=x*y-g*b,this.z=g*v-_*y,this}projectOnVector(p){let m=p.lengthSq();if(m===0)return this.set(0,0,0);let g=p.dot(this)/m;return this.copy(p).multiplyScalar(g)}projectOnPlane(p){return Gl.copy(this).projectOnVector(p),this.sub(Gl)}reflect(p){return this.sub(Gl.copy(p).multiplyScalar(2*this.dot(p)))}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(se(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y,_=this.z-p.z;return m*m+g*g+_*_}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)+Math.abs(this.z-p.z)}setFromSpherical(p){return this.setFromSphericalCoords(p.radius,p.phi,p.theta)}setFromSphericalCoords(p,m,g){let _=Math.sin(m)*p;return this.x=_*Math.sin(g),this.y=Math.cos(m)*p,this.z=_*Math.cos(g),this}setFromCylindrical(p){return this.setFromCylindricalCoords(p.radius,p.theta,p.y)}setFromCylindricalCoords(p,m,g){return this.x=p*Math.sin(m),this.y=g,this.z=p*Math.cos(m),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this}setFromMatrixScale(p){let m=this.setFromMatrixColumn(p,0).length(),g=this.setFromMatrixColumn(p,1).length(),_=this.setFromMatrixColumn(p,2).length();return this.x=m,this.y=g,this.z=_,this}setFromMatrixColumn(p,m){return this.fromArray(p.elements,m*4)}setFromMatrix3Column(p,m){return this.fromArray(p.elements,m*3)}setFromEuler(p){return this.x=p._x,this.y=p._y,this.z=p._z,this}setFromColor(p){return this.x=p.r,this.y=p.g,this.z=p.b,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let p=Math.random()*Math.PI*2,m=Math.random()*2-1,g=Math.sqrt(1-m*m);return this.x=g*Math.cos(p),this.y=m,this.z=g*Math.sin(p),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Gl=new Y,Nd=new Ei;class ee{static{this.prototype.isMatrix3=!0}constructor(p,m,g,_,x,y,v,b,S){if(this.elements=[1,0,0,0,1,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,y,v,b,S)}set(p,m,g,_,x,y,v,b,S){let M=this.elements;return M[0]=p,M[1]=_,M[2]=v,M[3]=m,M[4]=x,M[5]=b,M[6]=g,M[7]=y,M[8]=S,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],this}extractBasis(p,m,g){return p.setFromMatrix3Column(this,0),m.setFromMatrix3Column(this,1),g.setFromMatrix3Column(this,2),this}setFromMatrix4(p){let m=p.elements;return this.set(m[0],m[4],m[8],m[1],m[5],m[9],m[2],m[6],m[10]),this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,y=g[0],v=g[3],b=g[6],S=g[1],M=g[4],E=g[7],w=g[2],T=g[5],A=g[8],R=_[0],N=_[3],C=_[6],P=_[1],I=_[4],U=_[7],D=_[2],F=_[5],z=_[8];return x[0]=y*R+v*P+b*D,x[3]=y*N+v*I+b*F,x[6]=y*C+v*U+b*z,x[1]=S*R+M*P+E*D,x[4]=S*N+M*I+E*F,x[7]=S*C+M*U+E*z,x[2]=w*R+T*P+A*D,x[5]=w*N+T*I+A*F,x[8]=w*C+T*U+A*z,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[3]*=p,m[6]*=p,m[1]*=p,m[4]*=p,m[7]*=p,m[2]*=p,m[5]*=p,m[8]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8];return m*y*M-m*v*S-g*x*M+g*v*b+_*x*S-_*y*b}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8],E=M*y-v*S,w=v*b-M*x,T=S*x-y*b,A=m*E+g*w+_*T;if(A===0)return this.set(0,0,0,0,0,0,0,0,0);let R=1/A;return p[0]=E*R,p[1]=(_*S-M*g)*R,p[2]=(v*g-_*y)*R,p[3]=w*R,p[4]=(M*m-_*b)*R,p[5]=(_*x-v*m)*R,p[6]=T*R,p[7]=(g*b-S*m)*R,p[8]=(y*m-g*x)*R,this}transpose(){let p,m=this.elements;return p=m[1],m[1]=m[3],m[3]=p,p=m[2],m[2]=m[6],m[6]=p,p=m[5],m[5]=m[7],m[7]=p,this}getNormalMatrix(p){return this.setFromMatrix4(p).invert().transpose()}transposeIntoArray(p){let m=this.elements;return p[0]=m[0],p[1]=m[3],p[2]=m[6],p[3]=m[1],p[4]=m[4],p[5]=m[7],p[6]=m[2],p[7]=m[5],p[8]=m[8],this}setUvTransform(p,m,g,_,x,y,v){let b=Math.cos(x),S=Math.sin(x);return this.set(g*b,g*S,-g*(b*y+S*v)+y+p,-_*S,_*b,-_*(-S*y+b*v)+v+m,0,0,1),this}scale(p,m){return Fr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Vl.makeScale(p,m)),this}rotate(p){return Fr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Vl.makeRotation(-p)),this}translate(p,m){return Fr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Vl.makeTranslation(p,m)),this}makeTranslation(p,m){if(p.isVector2)this.set(1,0,p.x,0,1,p.y,0,0,1);else this.set(1,0,p,0,1,m,0,0,1);return this}makeRotation(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,g,m,0,0,0,1),this}makeScale(p,m){return this.set(p,0,0,0,m,0,0,0,1),this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<9;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<9;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p}clone(){return new this.constructor().fromArray(this.elements)}}var Vl=new ee,Dd=new ee().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Ud=new ee().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function L_(){let p={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(x,y,v){if(this.enabled===!1||y===v||!y||!v)return x;if(this.spaces[y].transfer==="srgb")x.r=xi(x.r),x.g=xi(x.g),x.b=xi(x.b);if(this.spaces[y].primaries!==this.spaces[v].primaries)x.applyMatrix3(this.spaces[y].toXYZ),x.applyMatrix3(this.spaces[v].fromXYZ);if(this.spaces[v].transfer==="srgb")x.r=Xs(x.r),x.g=Xs(x.g),x.b=Xs(x.b);return x},workingToColorSpace:function(x,y){return this.convert(x,this.workingColorSpace,y)},colorSpaceToWorking:function(x,y){return this.convert(x,y,this.workingColorSpace)},getPrimaries:function(x){return this.spaces[x].primaries},getTransfer:function(x){if(x==="")return"linear";return this.spaces[x].transfer},getToneMappingMode:function(x){return this.spaces[x].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(x,y=this.workingColorSpace){return x.fromArray(this.spaces[y].luminanceCoefficients)},define:function(x){Object.assign(this.spaces,x)},_getMatrix:function(x,y,v){return x.copy(this.spaces[v].fromXYZ).multiply(this.spaces[y].toXYZ)},_getDrawingBufferColorSpace:function(x){return this.spaces[x].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(x=this.workingColorSpace){return this.spaces[x].workingColorSpaceConfig.unpackColorSpace}},m=[0.64,0.33,0.3,0.6,0.15,0.06],g=[0.2126,0.7152,0.0722],_=[0.3127,0.329];return p.define({["srgb-linear"]:{primaries:m,whitePoint:_,transfer:"linear",toXYZ:Dd,fromXYZ:Ud,luminanceCoefficients:g,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:m,whitePoint:_,transfer:"srgb",toXYZ:Dd,fromXYZ:Ud,luminanceCoefficients:g,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),p}var ce=L_();function xi(p){return p<0.04045?p*0.0773993808:Math.pow(p*0.9478672986+0.0521327014,2.4)}function Xs(p){return p<0.0031308?p*12.92:1.055*Math.pow(p,0.41666)-0.055}var Ps;class yh{static getDataURL(p,m="image/png"){if(/^data:/i.test(p.src))return p.src;if(typeof HTMLCanvasElement>"u")return p.src;let g;if(p instanceof HTMLCanvasElement)g=p;else{if(Ps===void 0)Ps=zr("canvas");Ps.width=p.width,Ps.height=p.height;let _=Ps.getContext("2d");if(p instanceof ImageData)_.putImageData(p,0,0);else _.drawImage(p,0,0,p.width,p.height);g=Ps}return g.toDataURL(m)}static sRGBToLinear(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap){let m=zr("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d");g.drawImage(p,0,0,p.width,p.height);let _=g.getImageData(0,0,p.width,p.height),x=_.data;for(let y=0;y<x.length;y++)x[y]=xi(x[y]/255)*255;return g.putImageData(_,0,0),m}else if(p.data){let m=p.data.slice(0);for(let g=0;g<m.length;g++)if(m instanceof Uint8Array||m instanceof Uint8ClampedArray)m[g]=Math.floor(xi(m[g]/255)*255);else m[g]=xi(m[g]);return{data:m,width:p.width,height:p.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),p}}var N_=0;class Jr{constructor(p=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:N_++}),this.uuid=zi(),this.data=p,this.dataReady=!0,this.version=0}getSize(p){let m=this.data;if(typeof HTMLVideoElement<"u"&&m instanceof HTMLVideoElement)p.set(m.videoWidth,m.videoHeight,0);else if(typeof VideoFrame<"u"&&m instanceof VideoFrame)p.set(m.displayWidth,m.displayHeight,0);else if(m!==null)p.set(m.width||0,m.height||0,m.depth||0);else p.set(0,0,0);return p}set needsUpdate(p){if(p===!0)this.version++}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.images[this.uuid]!==void 0)return p.images[this.uuid];let g={uuid:this.uuid,url:""},_=this.data;if(_!==null){let x;if(Array.isArray(_)){x=[];for(let y=0,v=_.length;y<v;y++)if(_[y].isDataTexture)x.push(Wl(_[y].image));else x.push(Wl(_[y]))}else x=Wl(_);g.url=x}if(!m)p.images[this.uuid]=g;return g}}function Wl(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap)return yh.getDataURL(p);else if(p.data)return{data:Array.from(p.data),width:p.width,height:p.height,type:p.data.constructor.name};else return Xt("Texture: Unable to serialize Texture."),{}}var D_=0,Xl=new Y;class ze extends Si{constructor(p=ze.DEFAULT_IMAGE,m=ze.DEFAULT_MAPPING,g=1001,_=1001,x=1006,y=1008,v=1023,b=1009,S=ze.DEFAULT_ANISOTROPY,M=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:D_++}),this.uuid=zi(),this.name="",this.source=new Jr(p),this.mipmaps=[],this.mapping=m,this.channel=0,this.wrapS=g,this.wrapT=_,this.magFilter=x,this.minFilter=y,this.anisotropy=S,this.format=v,this.internalFormat=null,this.type=b,this.offset=new Jt(0,0),this.repeat=new Jt(1,1),this.center=new Jt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ee,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=M,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=p&&p.depth&&p.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Xl).x}get height(){return this.source.getSize(Xl).y}get depth(){return this.source.getSize(Xl).z}get image(){return this.source.data}set image(p){this.source.data=p}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(p){return this.name=p.name,this.source=p.source,this.mipmaps=p.mipmaps.slice(0),this.mapping=p.mapping,this.channel=p.channel,this.wrapS=p.wrapS,this.wrapT=p.wrapT,this.magFilter=p.magFilter,this.minFilter=p.minFilter,this.anisotropy=p.anisotropy,this.format=p.format,this.internalFormat=p.internalFormat,this.type=p.type,this.normalized=p.normalized,this.offset.copy(p.offset),this.repeat.copy(p.repeat),this.center.copy(p.center),this.rotation=p.rotation,this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrix.copy(p.matrix),this.generateMipmaps=p.generateMipmaps,this.mipmapsAutoUpdate=p.mipmapsAutoUpdate,this.premultiplyAlpha=p.premultiplyAlpha,this.flipY=p.flipY,this.unpackAlignment=p.unpackAlignment,this.colorSpace=p.colorSpace,this.renderTarget=p.renderTarget,this.isRenderTargetTexture=p.isRenderTargetTexture,this.isPMREMTexture=p.isPMREMTexture,this.isArrayTexture=p.isArrayTexture,this.userData=JSON.parse(JSON.stringify(p.userData)),this.needsUpdate=!0,this}setValues(p){for(let m in p){let g=p[m];if(g===void 0){Xt(`Texture.setValues(): parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Texture.setValues(): property '${m}' does not exist.`);continue}if(_&&g&&(_.isVector2&&g.isVector2))_.copy(g);else if(_&&g&&(_.isVector3&&g.isVector3))_.copy(g);else if(_&&g&&(_.isMatrix3&&g.isMatrix3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.textures[this.uuid]!==void 0)return p.textures[this.uuid];let g={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(p).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)g.userData=this.userData;if(!m)p.textures[this.uuid]=g;return g}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(p){if(this.mapping!==300)return p;if(p.applyMatrix3(this.matrix),p.x<0||p.x>1)switch(this.wrapS){case 1000:p.x=p.x-Math.floor(p.x);break;case 1001:p.x=p.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.x)%2)===1)p.x=Math.ceil(p.x)-p.x;else p.x=p.x-Math.floor(p.x);break}if(p.y<0||p.y>1)switch(this.wrapT){case 1000:p.y=p.y-Math.floor(p.y);break;case 1001:p.y=p.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.y)%2)===1)p.y=Math.ceil(p.y)-p.y;else p.y=p.y-Math.floor(p.y);break}if(this.flipY)p.y=1-p.y;return p}set needsUpdate(p){if(p===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(p){if(p===!0)this.pmremVersion++}}ze.DEFAULT_IMAGE=null;ze.DEFAULT_MAPPING=300;ze.DEFAULT_ANISOTROPY=1;class ke{static{this.prototype.isVector4=!0}constructor(p=0,m=0,g=0,_=1){this.x=p,this.y=m,this.z=g,this.w=_}get width(){return this.z}set width(p){this.z=p}get height(){return this.w}set height(p){this.w=p}set(p,m,g,_){return this.x=p,this.y=m,this.z=g,this.w=_,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this.w=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setW(p){return this.w=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;case 3:this.w=m;break;default:throw Error("THREE.Vector4: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this.w=p.w!==void 0?p.w:1,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this.w+=p.w,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this.w+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this.w=p.w+m.w,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this.w+=p.w*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this.w-=p.w,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this.w-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this.w=p.w-m.w,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this.w*=p.w,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this.w*=p,this}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=this.w,y=p.elements;return this.x=y[0]*m+y[4]*g+y[8]*_+y[12]*x,this.y=y[1]*m+y[5]*g+y[9]*_+y[13]*x,this.z=y[2]*m+y[6]*g+y[10]*_+y[14]*x,this.w=y[3]*m+y[7]*g+y[11]*_+y[15]*x,this}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this.w/=p.w,this}divideScalar(p){return this.multiplyScalar(1/p)}setAxisAngleFromQuaternion(p){this.w=2*Math.acos(p.w);let m=Math.sqrt(1-p.w*p.w);if(m<0.0001)this.x=1,this.y=0,this.z=0;else this.x=p.x/m,this.y=p.y/m,this.z=p.z/m;return this}setAxisAngleFromRotationMatrix(p){let m,g,_,x,y=0.01,v=0.1,b=p.elements,S=b[0],M=b[4],E=b[8],w=b[1],T=b[5],A=b[9],R=b[2],N=b[6],C=b[10];if(Math.abs(M-w)<0.01&&Math.abs(E-R)<0.01&&Math.abs(A-N)<0.01){if(Math.abs(M+w)<0.1&&Math.abs(E+R)<0.1&&Math.abs(A+N)<0.1&&Math.abs(S+T+C-3)<0.1)return this.set(1,0,0,0),this;m=Math.PI;let I=(S+1)/2,U=(T+1)/2,D=(C+1)/2,F=(M+w)/4,z=(E+R)/4,L=(A+N)/4;if(I>U&&I>D)if(I<0.01)g=0,_=0.707106781,x=0.707106781;else g=Math.sqrt(I),_=F/g,x=z/g;else if(U>D)if(U<0.01)g=0.707106781,_=0,x=0.707106781;else _=Math.sqrt(U),g=F/_,x=L/_;else if(D<0.01)g=0.707106781,_=0.707106781,x=0;else x=Math.sqrt(D),g=z/x,_=L/x;return this.set(g,_,x,m),this}let P=Math.sqrt((N-A)*(N-A)+(E-R)*(E-R)+(w-M)*(w-M));if(Math.abs(P)<0.001)P=1;return this.x=(N-A)/P,this.y=(E-R)/P,this.z=(w-M)/P,this.w=Math.acos((S+T+C-1)/2),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this.w=m[15],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this.w=Math.min(this.w,p.w),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this.w=Math.max(this.w,p.w),this}clamp(p,m){return this.x=se(this.x,p.x,m.x),this.y=se(this.y,p.y,m.y),this.z=se(this.z,p.z,m.z),this.w=se(this.w,p.w,m.w),this}clampScalar(p,m){return this.x=se(this.x,p,m),this.y=se(this.y,p,m),this.z=se(this.z,p,m),this.w=se(this.w,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(se(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z+this.w*p.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this.w+=(p.w-this.w)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this.w=p.w+(m.w-p.w)*g,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z&&p.w===this.w}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this.w=p[m+3],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p[m+3]=this.w,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this.w=p.getW(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class vh extends Si{constructor(p=1,m=1,g={}){super();g=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},g),this.isRenderTarget=!0,this.width=p,this.height=m,this.depth=g.depth,this.scissor=new ke(0,0,p,m),this.scissorTest=!1,this.viewport=new ke(0,0,p,m),this.textures=[];let _=g.count;for(let x=0;x<_;x++)this.textures[x]=new ze({width:p,height:m,depth:g.depth}),this.textures[x].isRenderTargetTexture=!0,this.textures[x].renderTarget=this;this._setTextureOptions(g),this.depthBuffer=g.depthBuffer,this.stencilBuffer=g.stencilBuffer,this.resolveColorBuffer=g.resolveColorBuffer,this.resolveDepthBuffer=g.resolveDepthBuffer,this.resolveStencilBuffer=g.resolveStencilBuffer,this.storeMultisampledColorBuffer=g.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=g.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=g.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=g.depthTexture,this.samples=g.samples,this.multiview=g.multiview,this.useArrayDepthTexture=g.useArrayDepthTexture}_setTextureOptions(p={}){let m={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(p.mapping!==void 0)m.mapping=p.mapping;if(p.wrapS!==void 0)m.wrapS=p.wrapS;if(p.wrapT!==void 0)m.wrapT=p.wrapT;if(p.wrapR!==void 0)m.wrapR=p.wrapR;if(p.magFilter!==void 0)m.magFilter=p.magFilter;if(p.minFilter!==void 0)m.minFilter=p.minFilter;if(p.format!==void 0)m.format=p.format;if(p.type!==void 0)m.type=p.type;if(p.anisotropy!==void 0)m.anisotropy=p.anisotropy;if(p.colorSpace!==void 0)m.colorSpace=p.colorSpace;if(p.flipY!==void 0)m.flipY=p.flipY;if(p.generateMipmaps!==void 0)m.generateMipmaps=p.generateMipmaps;if(p.mipmapsAutoUpdate!==void 0)m.mipmapsAutoUpdate=p.mipmapsAutoUpdate;if(p.internalFormat!==void 0)m.internalFormat=p.internalFormat;for(let g=0;g<this.textures.length;g++)this.textures[g].setValues(m)}get texture(){return this.textures[0]}set texture(p){this.textures[0]=p}set depthTexture(p){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(p!==null&&p.renderTarget===null)p.renderTarget=this;this._depthTexture=p}get depthTexture(){return this._depthTexture}setSize(p,m,g=1){if(this.width!==p||this.height!==m||this.depth!==g){this.width=p,this.height=m,this.depth=g;for(let _=0,x=this.textures.length;_<x;_++)if(this.textures[_].image.width=p,this.textures[_].image.height=m,this.textures[_].image.depth=g,this.textures[_].isData3DTexture!==!0)this.textures[_].isArrayTexture=this.textures[_].image.depth>1;this.dispose()}this.viewport.set(0,0,p,m),this.scissor.set(0,0,p,m)}clone(){return new this.constructor().copy(this)}copy(p){this.width=p.width,this.height=p.height,this.depth=p.depth,this.scissor.copy(p.scissor),this.scissorTest=p.scissorTest,this.viewport.copy(p.viewport),this.textures.length=0;for(let m=0,g=p.textures.length;m<g;m++){this.textures[m]=p.textures[m].clone(),this.textures[m].isRenderTargetTexture=!0,this.textures[m].renderTarget=this;let _=Object.assign({},p.textures[m].image);this.textures[m].source=new Jr(_)}if(this.depthBuffer=p.depthBuffer,this.stencilBuffer=p.stencilBuffer,this.resolveColorBuffer=p.resolveColorBuffer,this.resolveDepthBuffer=p.resolveDepthBuffer,this.resolveStencilBuffer=p.resolveStencilBuffer,this.storeMultisampledColorBuffer=p.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=p.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=p.storeMultisampledStencilBuffer,p.depthTexture!==null)if(p.depthTexture.renderTarget===p){let m=p.depthTexture.clone();m.renderTarget=null,this.depthTexture=m}else this.depthTexture=p.depthTexture;else this.depthTexture=null;return this.samples=p.samples,this.multiview=p.multiview,this.useArrayDepthTexture=p.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Vn extends vh{constructor(p=1,m=1,g={}){super(p,m,g);this.isWebGLRenderTarget=!0}}class ma extends ze{constructor(p=null,m=1,g=1,_=1){super(null);this.isDataArrayTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}addLayerUpdate(p){this.layerUpdates.add(p)}clearLayerUpdates(){this.layerUpdates.clear()}}class bh extends ze{constructor(p=null,m=1,g=1,_=1){super(null);this.isData3DTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}}class Kt{static{this.prototype.isMatrix4=!0}constructor(p,m,g,_,x,y,v,b,S,M,E,w,T,A,R,N){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,y,v,b,S,M,E,w,T,A,R,N)}set(p,m,g,_,x,y,v,b,S,M,E,w,T,A,R,N){let C=this.elements;return C[0]=p,C[4]=m,C[8]=g,C[12]=_,C[1]=x,C[5]=y,C[9]=v,C[13]=b,C[2]=S,C[6]=M,C[10]=E,C[14]=w,C[3]=T,C[7]=A,C[11]=R,C[15]=N,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Kt().fromArray(this.elements)}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],m[9]=g[9],m[10]=g[10],m[11]=g[11],m[12]=g[12],m[13]=g[13],m[14]=g[14],m[15]=g[15],this}copyPosition(p){let m=this.elements,g=p.elements;return m[12]=g[12],m[13]=g[13],m[14]=g[14],this}setFromMatrix3(p){let m=p.elements;return this.set(m[0],m[3],m[6],0,m[1],m[4],m[7],0,m[2],m[5],m[8],0,0,0,0,1),this}extractBasis(p,m,g){if(this.determinantAffine()===0)return p.set(1,0,0),m.set(0,1,0),g.set(0,0,1),this;return p.setFromMatrixColumn(this,0),m.setFromMatrixColumn(this,1),g.setFromMatrixColumn(this,2),this}makeBasis(p,m,g){return this.set(p.x,m.x,g.x,0,p.y,m.y,g.y,0,p.z,m.z,g.z,0,0,0,0,1),this}extractRotation(p){if(p.determinantAffine()===0)return this.identity();let m=this.elements,g=p.elements,_=1/Is.setFromMatrixColumn(p,0).length(),x=1/Is.setFromMatrixColumn(p,1).length(),y=1/Is.setFromMatrixColumn(p,2).length();return m[0]=g[0]*_,m[1]=g[1]*_,m[2]=g[2]*_,m[3]=0,m[4]=g[4]*x,m[5]=g[5]*x,m[6]=g[6]*x,m[7]=0,m[8]=g[8]*y,m[9]=g[9]*y,m[10]=g[10]*y,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromEuler(p){let m=this.elements,{x:g,y:_,z:x}=p,y=Math.cos(g),v=Math.sin(g),b=Math.cos(_),S=Math.sin(_),M=Math.cos(x),E=Math.sin(x);if(p.order==="XYZ"){let w=y*M,T=y*E,A=v*M,R=v*E;m[0]=b*M,m[4]=-b*E,m[8]=S,m[1]=T+A*S,m[5]=w-R*S,m[9]=-v*b,m[2]=R-w*S,m[6]=A+T*S,m[10]=y*b}else if(p.order==="YXZ"){let w=b*M,T=b*E,A=S*M,R=S*E;m[0]=w+R*v,m[4]=A*v-T,m[8]=y*S,m[1]=y*E,m[5]=y*M,m[9]=-v,m[2]=T*v-A,m[6]=R+w*v,m[10]=y*b}else if(p.order==="ZXY"){let w=b*M,T=b*E,A=S*M,R=S*E;m[0]=w-R*v,m[4]=-y*E,m[8]=A+T*v,m[1]=T+A*v,m[5]=y*M,m[9]=R-w*v,m[2]=-y*S,m[6]=v,m[10]=y*b}else if(p.order==="ZYX"){let w=y*M,T=y*E,A=v*M,R=v*E;m[0]=b*M,m[4]=A*S-T,m[8]=w*S+R,m[1]=b*E,m[5]=R*S+w,m[9]=T*S-A,m[2]=-S,m[6]=v*b,m[10]=y*b}else if(p.order==="YZX"){let w=y*b,T=y*S,A=v*b,R=v*S;m[0]=b*M,m[4]=R-w*E,m[8]=A*E+T,m[1]=E,m[5]=y*M,m[9]=-v*M,m[2]=-S*M,m[6]=T*E+A,m[10]=w-R*E}else if(p.order==="XZY"){let w=y*b,T=y*S,A=v*b,R=v*S;m[0]=b*M,m[4]=-E,m[8]=S*M,m[1]=w*E+R,m[5]=y*M,m[9]=T*E-A,m[2]=A*E-T,m[6]=v*M,m[10]=R*E+w}return m[3]=0,m[7]=0,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromQuaternion(p){return this.compose(U_,p,O_)}lookAt(p,m,g){let _=this.elements;if(In.subVectors(p,m),In.lengthSq()===0)In.z=1;if(In.normalize(),Pi.crossVectors(g,In),Pi.lengthSq()===0){if(Math.abs(g.z)===1)In.x+=0.0001;else In.z+=0.0001;In.normalize(),Pi.crossVectors(g,In)}return Pi.normalize(),Io.crossVectors(In,Pi),_[0]=Pi.x,_[4]=Io.x,_[8]=In.x,_[1]=Pi.y,_[5]=Io.y,_[9]=In.y,_[2]=Pi.z,_[6]=Io.z,_[10]=In.z,this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,y=g[0],v=g[4],b=g[8],S=g[12],M=g[1],E=g[5],w=g[9],T=g[13],A=g[2],R=g[6],N=g[10],C=g[14],P=g[3],I=g[7],U=g[11],D=g[15],F=_[0],z=_[4],L=_[8],O=_[12],H=_[1],V=_[5],G=_[9],W=_[13],J=_[2],X=_[6],Q=_[10],st=_[14],tt=_[3],_t=_[7],ot=_[11],ht=_[15];return x[0]=y*F+v*H+b*J+S*tt,x[4]=y*z+v*V+b*X+S*_t,x[8]=y*L+v*G+b*Q+S*ot,x[12]=y*O+v*W+b*st+S*ht,x[1]=M*F+E*H+w*J+T*tt,x[5]=M*z+E*V+w*X+T*_t,x[9]=M*L+E*G+w*Q+T*ot,x[13]=M*O+E*W+w*st+T*ht,x[2]=A*F+R*H+N*J+C*tt,x[6]=A*z+R*V+N*X+C*_t,x[10]=A*L+R*G+N*Q+C*ot,x[14]=A*O+R*W+N*st+C*ht,x[3]=P*F+I*H+U*J+D*tt,x[7]=P*z+I*V+U*X+D*_t,x[11]=P*L+I*G+U*Q+D*ot,x[15]=P*O+I*W+U*st+D*ht,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[4]*=p,m[8]*=p,m[12]*=p,m[1]*=p,m[5]*=p,m[9]*=p,m[13]*=p,m[2]*=p,m[6]*=p,m[10]*=p,m[14]*=p,m[3]*=p,m[7]*=p,m[11]*=p,m[15]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[12],y=p[1],v=p[5],b=p[9],S=p[13],M=p[2],E=p[6],w=p[10],T=p[14],A=p[3],R=p[7],N=p[11],C=p[15],P=b*T-S*w,I=v*T-S*E,U=v*w-b*E,D=y*T-S*M,F=y*w-b*M,z=y*E-v*M;return m*(R*P-N*I+C*U)-g*(A*P-N*D+C*F)+_*(A*I-R*D+C*z)-x*(A*U-R*F+N*z)}determinantAffine(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[1],y=p[5],v=p[9],b=p[2],S=p[6],M=p[10];return m*(y*M-v*S)-g*(x*M-v*b)+_*(x*S-y*b)}transpose(){let p=this.elements,m;return m=p[1],p[1]=p[4],p[4]=m,m=p[2],p[2]=p[8],p[8]=m,m=p[6],p[6]=p[9],p[9]=m,m=p[3],p[3]=p[12],p[12]=m,m=p[7],p[7]=p[13],p[13]=m,m=p[11],p[11]=p[14],p[14]=m,this}setPosition(p,m,g){let _=this.elements;if(p.isVector3)_[12]=p.x,_[13]=p.y,_[14]=p.z;else _[12]=p,_[13]=m,_[14]=g;return this}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8],E=p[9],w=p[10],T=p[11],A=p[12],R=p[13],N=p[14],C=p[15],P=m*v-g*y,I=m*b-_*y,U=m*S-x*y,D=g*b-_*v,F=g*S-x*v,z=_*S-x*b,L=M*R-E*A,O=M*N-w*A,H=M*C-T*A,V=E*N-w*R,G=E*C-T*R,W=w*C-T*N,J=P*W-I*G+U*V+D*H-F*O+z*L;if(J===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let X=1/J;return p[0]=(v*W-b*G+S*V)*X,p[1]=(_*G-g*W-x*V)*X,p[2]=(R*z-N*F+C*D)*X,p[3]=(w*F-E*z-T*D)*X,p[4]=(b*H-y*W-S*O)*X,p[5]=(m*W-_*H+x*O)*X,p[6]=(N*U-A*z-C*I)*X,p[7]=(M*z-w*U+T*I)*X,p[8]=(y*G-v*H+S*L)*X,p[9]=(g*H-m*G-x*L)*X,p[10]=(A*F-R*U+C*P)*X,p[11]=(E*U-M*F-T*P)*X,p[12]=(v*O-y*V-b*L)*X,p[13]=(m*V-g*O+_*L)*X,p[14]=(R*I-A*D-N*P)*X,p[15]=(M*D-E*I+w*P)*X,this}scale(p){let m=this.elements,{x:g,y:_,z:x}=p;return m[0]*=g,m[4]*=_,m[8]*=x,m[1]*=g,m[5]*=_,m[9]*=x,m[2]*=g,m[6]*=_,m[10]*=x,m[3]*=g,m[7]*=_,m[11]*=x,this}getMaxScaleOnAxis(){let p=this.elements,m=p[0]*p[0]+p[1]*p[1]+p[2]*p[2],g=p[4]*p[4]+p[5]*p[5]+p[6]*p[6],_=p[8]*p[8]+p[9]*p[9]+p[10]*p[10];return Math.sqrt(Math.max(m,g,_))}makeTranslation(p,m,g){if(p.isVector3)this.set(1,0,0,p.x,0,1,0,p.y,0,0,1,p.z,0,0,0,1);else this.set(1,0,0,p,0,1,0,m,0,0,1,g,0,0,0,1);return this}makeRotationX(p){let m=Math.cos(p),g=Math.sin(p);return this.set(1,0,0,0,0,m,-g,0,0,g,m,0,0,0,0,1),this}makeRotationY(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,0,g,0,0,1,0,0,-g,0,m,0,0,0,0,1),this}makeRotationZ(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,0,g,m,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(p,m){let g=Math.cos(m),_=Math.sin(m),x=1-g,{x:y,y:v,z:b}=p,S=x*y,M=x*v;return this.set(S*y+g,S*v-_*b,S*b+_*v,0,S*v+_*b,M*v+g,M*b-_*y,0,S*b-_*v,M*b+_*y,x*b*b+g,0,0,0,0,1),this}makeScale(p,m,g){return this.set(p,0,0,0,0,m,0,0,0,0,g,0,0,0,0,1),this}makeShear(p,m,g,_,x,y){return this.set(1,g,x,0,p,1,y,0,m,_,1,0,0,0,0,1),this}compose(p,m,g){let _=this.elements,{_x:x,_y:y,_z:v,_w:b}=m,S=x+x,M=y+y,E=v+v,w=x*S,T=x*M,A=x*E,R=y*M,N=y*E,C=v*E,P=b*S,I=b*M,U=b*E,{x:D,y:F,z}=g;return _[0]=(1-(R+C))*D,_[1]=(T+U)*D,_[2]=(A-I)*D,_[3]=0,_[4]=(T-U)*F,_[5]=(1-(w+C))*F,_[6]=(N+P)*F,_[7]=0,_[8]=(A+I)*z,_[9]=(N-P)*z,_[10]=(1-(w+R))*z,_[11]=0,_[12]=p.x,_[13]=p.y,_[14]=p.z,_[15]=1,this}decompose(p,m,g){let _=this.elements;p.x=_[12],p.y=_[13],p.z=_[14];let x=this.determinantAffine();if(x===0)return g.set(1,1,1),m.identity(),this;let y=Is.set(_[0],_[1],_[2]).length(),v=Is.set(_[4],_[5],_[6]).length(),b=Is.set(_[8],_[9],_[10]).length();if(x<0)y=-y;$n.copy(this);let S=1/y,M=1/v,E=1/b;return $n.elements[0]*=S,$n.elements[1]*=S,$n.elements[2]*=S,$n.elements[4]*=M,$n.elements[5]*=M,$n.elements[6]*=M,$n.elements[8]*=E,$n.elements[9]*=E,$n.elements[10]*=E,m.setFromRotationMatrix($n),g.x=y,g.y=v,g.z=b,this}makePerspective(p,m,g,_,x,y,v=2000,b=!1){let S=this.elements,M=2*x/(m-p),E=2*x/(g-_),w=(m+p)/(m-p),T=(g+_)/(g-_),A,R;if(b)A=x/(y-x),R=y*x/(y-x);else if(v===2000)A=-(y+x)/(y-x),R=-2*y*x/(y-x);else if(v===2001)A=-y/(y-x),R=-y*x/(y-x);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=w,S[12]=0,S[1]=0,S[5]=E,S[9]=T,S[13]=0,S[2]=0,S[6]=0,S[10]=A,S[14]=R,S[3]=0,S[7]=0,S[11]=-1,S[15]=0,this}makeOrthographic(p,m,g,_,x,y,v=2000,b=!1){let S=this.elements,M=2/(m-p),E=2/(g-_),w=-(m+p)/(m-p),T=-(g+_)/(g-_),A,R;if(b)A=1/(y-x),R=y/(y-x);else if(v===2000)A=-2/(y-x),R=-(y+x)/(y-x);else if(v===2001)A=-1/(y-x),R=-x/(y-x);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=0,S[12]=w,S[1]=0,S[5]=E,S[9]=0,S[13]=T,S[2]=0,S[6]=0,S[10]=A,S[14]=R,S[3]=0,S[7]=0,S[11]=0,S[15]=1,this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<16;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<16;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p[m+9]=g[9],p[m+10]=g[10],p[m+11]=g[11],p[m+12]=g[12],p[m+13]=g[13],p[m+14]=g[14],p[m+15]=g[15],p}}var Is=new Y,$n=new Kt,U_=new Y(0,0,0),O_=new Y(1,1,1),Pi=new Y,Io=new Y,In=new Y,Od=new Kt,Fd=new Ei;class yi{constructor(p=0,m=0,g=0,_=yi.DEFAULT_ORDER){this.isEuler=!0,this._x=p,this._y=m,this._z=g,this._order=_}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get order(){return this._order}set order(p){this._order=p,this._onChangeCallback()}set(p,m,g,_=this._order){return this._x=p,this._y=m,this._z=g,this._order=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(p){return this._x=p._x,this._y=p._y,this._z=p._z,this._order=p._order,this._onChangeCallback(),this}setFromRotationMatrix(p,m=this._order,g=!0){let _=p.elements,x=_[0],y=_[4],v=_[8],b=_[1],S=_[5],M=_[9],E=_[2],w=_[6],T=_[10];switch(m){case"XYZ":if(this._y=Math.asin(se(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(-M,T),this._z=Math.atan2(-y,x);else this._x=Math.atan2(w,S),this._z=0;break;case"YXZ":if(this._x=Math.asin(-se(M,-1,1)),Math.abs(M)<0.9999999)this._y=Math.atan2(v,T),this._z=Math.atan2(b,S);else this._y=Math.atan2(-E,x),this._z=0;break;case"ZXY":if(this._x=Math.asin(se(w,-1,1)),Math.abs(w)<0.9999999)this._y=Math.atan2(-E,T),this._z=Math.atan2(-y,S);else this._y=0,this._z=Math.atan2(b,x);break;case"ZYX":if(this._y=Math.asin(-se(E,-1,1)),Math.abs(E)<0.9999999)this._x=Math.atan2(w,T),this._z=Math.atan2(b,x);else this._x=0,this._z=Math.atan2(-y,S);break;case"YZX":if(this._z=Math.asin(se(b,-1,1)),Math.abs(b)<0.9999999)this._x=Math.atan2(-M,S),this._y=Math.atan2(-E,x);else this._x=0,this._y=Math.atan2(v,T);break;case"XZY":if(this._z=Math.asin(-se(y,-1,1)),Math.abs(y)<0.9999999)this._x=Math.atan2(w,S),this._y=Math.atan2(v,x);else this._x=Math.atan2(-M,T),this._y=0;break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+m)}if(this._order=m,g===!0)this._onChangeCallback();return this}setFromQuaternion(p,m,g){return Od.makeRotationFromQuaternion(p),this.setFromRotationMatrix(Od,m,g)}setFromVector3(p,m=this._order){return this.set(p.x,p.y,p.z,m)}reorder(p){return Fd.setFromEuler(this),this.setFromQuaternion(Fd,p)}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._order===this._order}fromArray(p){if(this._x=p[0],this._y=p[1],this._z=p[2],p[3]!==void 0)this._order=p[3];return this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._order,p}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}yi.DEFAULT_ORDER="XYZ";class Kr{constructor(){this.mask=1}set(p){this.mask=(1<<p|0)>>>0}enable(p){this.mask|=1<<p|0}enableAll(){this.mask=-1}toggle(p){this.mask^=1<<p|0}disable(p){this.mask&=~(1<<p|0)}disableAll(){this.mask=0}test(p){return(this.mask&p.mask)!==0}isEnabled(p){return(this.mask&(1<<p|0))!==0}}var F_=0,Bd=new Y,Ls=new Ei,di=new Kt,Lo=new Y,Lr=new Y,B_=new Y,k_=new Ei,kd=new Y(1,0,0),zd=new Y(0,1,0),Hd=new Y(0,0,1),Gd={type:"added"},z_={type:"removed"},Ns={type:"childadded",child:null},ql={type:"childremoved",child:null};class Ye extends Si{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:F_++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ye.DEFAULT_UP.clone();let p=new Y,m=new yi,g=new Ei,_=new Y(1,1,1);function x(){g.setFromEuler(m,!1)}function y(){m.setFromQuaternion(g,void 0,!1)}m._onChange(x),g._onChange(y),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:p},rotation:{configurable:!0,enumerable:!0,value:m},quaternion:{configurable:!0,enumerable:!0,value:g},scale:{configurable:!0,enumerable:!0,value:_},modelViewMatrix:{value:new Kt},normalMatrix:{value:new ee}}),this.matrix=new Kt,this.matrixWorld=new Kt,this.matrixAutoUpdate=Ye.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Kr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(p),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(p){return this.quaternion.premultiply(p),this}setRotationFromAxisAngle(p,m){this.quaternion.setFromAxisAngle(p,m)}setRotationFromEuler(p){this.quaternion.setFromEuler(p,!0)}setRotationFromMatrix(p){this.quaternion.setFromRotationMatrix(p)}setRotationFromQuaternion(p){this.quaternion.copy(p)}rotateOnAxis(p,m){return Ls.setFromAxisAngle(p,m),this.quaternion.multiply(Ls),this}rotateOnWorldAxis(p,m){return Ls.setFromAxisAngle(p,m),this.quaternion.premultiply(Ls),this}rotateX(p){return this.rotateOnAxis(kd,p)}rotateY(p){return this.rotateOnAxis(zd,p)}rotateZ(p){return this.rotateOnAxis(Hd,p)}translateOnAxis(p,m){return Bd.copy(p).applyQuaternion(this.quaternion),this.position.add(Bd.multiplyScalar(m)),this}translateX(p){return this.translateOnAxis(kd,p)}translateY(p){return this.translateOnAxis(zd,p)}translateZ(p){return this.translateOnAxis(Hd,p)}localToWorld(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(this.matrixWorld)}worldToLocal(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(p,m,g){if(p.isVector3)Lo.copy(p);else Lo.set(p,m,g);let _=this.parent;if(this.updateWorldMatrix(!0,!1),Lr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)di.lookAt(Lr,Lo,this.up);else di.lookAt(Lo,Lr,this.up);if(this.quaternion.setFromRotationMatrix(di),_)di.extractRotation(_.matrixWorld),Ls.setFromRotationMatrix(di),this.quaternion.premultiply(Ls.invert())}add(p){if(arguments.length>1){for(let m=0;m<arguments.length;m++)this.add(arguments[m]);return this}if(p===this)return $t("Object3D.add: object can't be added as a child of itself.",p),this;if(p&&p.isObject3D)p.removeFromParent(),p.parent=this,this.children.push(p),p.dispatchEvent(Gd),Ns.child=p,this.dispatchEvent(Ns),Ns.child=null;else $t("Object3D.add: object not an instance of THREE.Object3D.",p);return this}remove(p){if(arguments.length>1){for(let g=0;g<arguments.length;g++)this.remove(arguments[g]);return this}let m=this.children.indexOf(p);if(m!==-1)p.parent=null,this.children.splice(m,1),p.dispatchEvent(z_),ql.child=p,this.dispatchEvent(ql),ql.child=null;return this}removeFromParent(){let p=this.parent;if(p!==null)p.remove(this);return this}clear(){return this.remove(...this.children)}attach(p){if(this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),p.parent!==null)p.parent.updateWorldMatrix(!0,!1),di.multiply(p.parent.matrixWorld);return p.applyMatrix4(di),p.removeFromParent(),p.parent=this,this.children.push(p),p.updateWorldMatrix(!1,!0),p.dispatchEvent(Gd),Ns.child=p,this.dispatchEvent(Ns),Ns.child=null,this}getObjectById(p){return this.getObjectByProperty("id",p)}getObjectByName(p){return this.getObjectByProperty("name",p)}getObjectByProperty(p,m){if(this[p]===m)return this;for(let g=0,_=this.children.length;g<_;g++){let y=this.children[g].getObjectByProperty(p,m);if(y!==void 0)return y}return}getObjectsByProperty(p,m,g=[]){if(this[p]===m)g.push(this);let _=this.children;for(let x=0,y=_.length;x<y;x++)_[x].getObjectsByProperty(p,m,g);return g}getWorldPosition(p){return this.updateWorldMatrix(!0,!1),p.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lr,p,B_),p}getWorldScale(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Lr,k_,p),p}getWorldDirection(p){this.updateWorldMatrix(!0,!1);let m=this.matrixWorld.elements;return p.set(m[8],m[9],m[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(p){p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverse(p)}traverseVisible(p){if(this.visible===!1)return;p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverseVisible(p)}traverseAncestors(p){let m=this.parent;if(m!==null)p(m),m.traverseAncestors(p)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let p=this.pivot;if(p!==null){let{x:m,y:g,z:_}=p,x=this.matrix.elements;x[12]+=m-x[0]*m-x[4]*g-x[8]*_,x[13]+=g-x[1]*m-x[5]*g-x[9]*_,x[14]+=_-x[2]*m-x[6]*g-x[10]*_}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||p){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,p=!0}let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].updateMatrixWorld(p)}updateWorldMatrix(p,m,g=!1){let _=this.parent;if(p===!0&&_!==null)_.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||g){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,g=!0}if(m===!0){let x=this.children;for(let y=0,v=x.length;y<v;y++)x[y].updateWorldMatrix(!1,!0,g)}}toJSON(p){let m=p===void 0||typeof p==="string",g={};if(m)p={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},g.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let _={};if(_.uuid=this.uuid,_.type=this.type,_.name=this.name,_.castShadow=this.castShadow,_.receiveShadow=this.receiveShadow,_.visible=this.visible,_.frustumCulled=this.frustumCulled,_.renderOrder=this.renderOrder,_.static=this.static,_.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)_.userData=this.userData;if(_.layers=this.layers.mask,_.matrix=this.matrix.toArray(),_.up=this.up.toArray(),this.pivot!==null)_.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)_.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)_.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(_.type="InstancedMesh",_.count=this.count,_.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)_.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(_.type="BatchedMesh",_.perObjectFrustumCulled=this.perObjectFrustumCulled,_.sortObjects=this.sortObjects,_.drawRanges=this._drawRanges,_.reservedRanges=this._reservedRanges,_.geometryInfo=this._geometryInfo.map((v)=>({...v,boundingBox:v.boundingBox?v.boundingBox.toJSON():void 0,boundingSphere:v.boundingSphere?v.boundingSphere.toJSON():void 0})),_.instanceInfo=this._instanceInfo.map((v)=>({...v})),_.availableInstanceIds=this._availableInstanceIds.slice(),_.availableGeometryIds=this._availableGeometryIds.slice(),_.nextIndexStart=this._nextIndexStart,_.nextVertexStart=this._nextVertexStart,_.geometryCount=this._geometryCount,_.maxInstanceCount=this._maxInstanceCount,_.maxVertexCount=this._maxVertexCount,_.maxIndexCount=this._maxIndexCount,_.geometryInitialized=this._geometryInitialized,_.matricesTexture=this._matricesTexture.toJSON(p),_.indirectTexture=this._indirectTexture.toJSON(p),this._colorsTexture!==null)_.colorsTexture=this._colorsTexture.toJSON(p);if(this.boundingSphere!==null)_.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)_.boundingBox=this.boundingBox.toJSON()}function x(v,b){if(v[b.uuid]===void 0)v[b.uuid]=b.toJSON(p);return b.uuid}if(this.isScene){if(this.background){if(this.background.isColor)_.background=this.background.toJSON();else if(this.background.isTexture)_.background=this.background.toJSON(p).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)_.environment=this.environment.toJSON(p).uuid}else if(this.isMesh||this.isLine||this.isPoints){_.geometry=x(p.geometries,this.geometry);let v=this.geometry.parameters;if(v!==void 0&&v.shapes!==void 0){let b=v.shapes;if(Array.isArray(b))for(let S=0,M=b.length;S<M;S++){let E=b[S];x(p.shapes,E)}else x(p.shapes,b)}}if(this.isSkinnedMesh){if(_.bindMode=this.bindMode,_.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)x(p.skeletons,this.skeleton),_.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let v=[];for(let b=0,S=this.material.length;b<S;b++)v.push(x(p.materials,this.material[b]));_.material=v}else _.material=x(p.materials,this.material);if(this.children.length>0){_.children=[];for(let v=0;v<this.children.length;v++)_.children.push(this.children[v].toJSON(p).object)}if(this.animations.length>0){_.animations=[];for(let v=0;v<this.animations.length;v++){let b=this.animations[v];_.animations.push(x(p.animations,b))}}if(m){let v=y(p.geometries),b=y(p.materials),S=y(p.textures),M=y(p.images),E=y(p.shapes),w=y(p.skeletons),T=y(p.animations),A=y(p.nodes);if(v.length>0)g.geometries=v;if(b.length>0)g.materials=b;if(S.length>0)g.textures=S;if(M.length>0)g.images=M;if(E.length>0)g.shapes=E;if(w.length>0)g.skeletons=w;if(T.length>0)g.animations=T;if(A.length>0)g.nodes=A}return g.object=_,g;function y(v){let b=[];for(let S in v){let M=v[S];delete M.metadata,b.push(M)}return b}}clone(p){return new this.constructor().copy(this,p)}copy(p,m=!0){if(this.name=p.name,this.up.copy(p.up),this.position.copy(p.position),this.rotation.order=p.rotation.order,this.quaternion.copy(p.quaternion),this.scale.copy(p.scale),this.pivot=p.pivot!==null?p.pivot.clone():null,this.matrix.copy(p.matrix),this.matrixWorld.copy(p.matrixWorld),this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrixWorldAutoUpdate=p.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=p.matrixWorldNeedsUpdate,this.layers.mask=p.layers.mask,this.visible=p.visible,this.castShadow=p.castShadow,this.receiveShadow=p.receiveShadow,this.frustumCulled=p.frustumCulled,this.renderOrder=p.renderOrder,this.static=p.static,this.animations=p.animations.slice(),this.userData=JSON.parse(JSON.stringify(p.userData)),m===!0)for(let g=0;g<p.children.length;g++){let _=p.children[g];this.add(_.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Ye.DEFAULT_UP=new Y(0,1,0);Ye.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ye.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ui extends Ye{constructor(){super();this.isGroup=!0,this.type="Group"}}var H_={type:"move"};class jr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Ui,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Ui,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Y,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Y;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Ui,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Y,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Y,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(p){if(this._targetRay!==null)this._targetRay.dispatchEvent(p);if(this._grip!==null)this._grip.dispatchEvent(p);if(this._hand!==null)this._hand.dispatchEvent(p);return this}connect(p){if(p&&p.hand){let m=this._hand;if(m)for(let g of p.hand.values())this._getHandJoint(m,g)}return this.dispatchEvent({type:"connected",data:p}),this}disconnect(p){if(this.dispatchEvent({type:"disconnected",data:p}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(p,m,g){let _=null,x=null,y=null,v=this._targetRay,b=this._grip,S=this._hand;if(p&&m.session.visibilityState!=="visible-blurred"){if(S&&p.hand){y=!0;for(let R of p.hand.values()){let N=m.getJointPose(R,g),C=this._getHandJoint(S,R);if(N!==null)C.matrix.fromArray(N.transform.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale),C.matrixWorldNeedsUpdate=!0,C.jointRadius=N.radius;C.visible=N!==null}let M=S.joints["index-finger-tip"],E=S.joints["thumb-tip"],w=M.position.distanceTo(E.position),T=0.02,A=0.005;if(S.inputState.pinching&&w>T+A)S.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:p.handedness,target:this});else if(!S.inputState.pinching&&w<=T-A)S.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:p.handedness,target:this})}else if(b!==null&&p.gripSpace){if(x=m.getPose(p.gripSpace,g),x!==null){if(b.matrix.fromArray(x.transform.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale),b.matrixWorldNeedsUpdate=!0,x.linearVelocity)b.hasLinearVelocity=!0,b.linearVelocity.copy(x.linearVelocity);else b.hasLinearVelocity=!1;if(x.angularVelocity)b.hasAngularVelocity=!0,b.angularVelocity.copy(x.angularVelocity);else b.hasAngularVelocity=!1;if(b.eventsEnabled)b.dispatchEvent({type:"gripUpdated",data:p,target:this})}}if(v!==null){if(_=m.getPose(p.targetRaySpace,g),_===null&&x!==null)_=x;if(_!==null){if(v.matrix.fromArray(_.transform.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale),v.matrixWorldNeedsUpdate=!0,_.linearVelocity)v.hasLinearVelocity=!0,v.linearVelocity.copy(_.linearVelocity);else v.hasLinearVelocity=!1;if(_.angularVelocity)v.hasAngularVelocity=!0,v.angularVelocity.copy(_.angularVelocity);else v.hasAngularVelocity=!1;this.dispatchEvent(H_)}}}if(v!==null)v.visible=_!==null;if(b!==null)b.visible=x!==null;if(S!==null)S.visible=y!==null;return this}_getHandJoint(p,m){if(p.joints[m.jointName]===void 0){let g=new Ui;g.matrixAutoUpdate=!1,g.visible=!1,p.joints[m.jointName]=g,p.add(g)}return p.joints[m.jointName]}}var fp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},No={h:0,s:0,l:0};function Yl(p,m,g){if(g<0)g+=1;if(g>1)g-=1;if(g<0.16666666666666666)return p+(m-p)*6*g;if(g<0.5)return m;if(g<0.6666666666666666)return p+(m-p)*6*(0.6666666666666666-g);return p}class oe{constructor(p,m,g){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(p,m,g)}set(p,m,g){if(m===void 0&&g===void 0){let _=p;if(_&&_.isColor)this.copy(_);else if(typeof _==="number")this.setHex(_);else if(typeof _==="string")this.setStyle(_)}else this.setRGB(p,m,g);return this}setScalar(p){return this.r=p,this.g=p,this.b=p,this}setHex(p,m="srgb"){return p=Math.floor(p),this.r=(p>>16&255)/255,this.g=(p>>8&255)/255,this.b=(p&255)/255,ce.colorSpaceToWorking(this,m),this}setRGB(p,m,g,_=ce.workingColorSpace){return this.r=p,this.g=m,this.b=g,ce.colorSpaceToWorking(this,_),this}setHSL(p,m,g,_=ce.workingColorSpace){if(p=mh(p,1),m=se(m,0,1),g=se(g,0,1),m===0)this.r=this.g=this.b=g;else{let x=g<=0.5?g*(1+m):g+m-g*m,y=2*g-x;this.r=Yl(y,x,p+0.3333333333333333),this.g=Yl(y,x,p),this.b=Yl(y,x,p-0.3333333333333333)}return ce.colorSpaceToWorking(this,_),this}setStyle(p,m="srgb"){function g(x){if(x===void 0)return;if(parseFloat(x)<1)Xt("Color: Alpha component of "+p+" will be ignored.")}let _;if(_=/^(\w+)\(([^\)]*)\)/.exec(p)){let x,y=_[1],v=_[2];switch(y){case"rgb":case"rgba":if(x=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setRGB(Math.min(255,parseInt(x[1],10))/255,Math.min(255,parseInt(x[2],10))/255,Math.min(255,parseInt(x[3],10))/255,m);if(x=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setRGB(Math.min(100,parseFloat(x[1]))/100,Math.min(100,parseFloat(x[2]))/100,Math.min(100,parseFloat(x[3]))/100,m);break;case"hsl":case"hsla":if(x=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setHSL(parseFloat(x[1])/360,parseFloat(x[2])/100,parseFloat(x[3])/100,m);break;default:Xt("Color: Unknown color model "+p)}}else if(_=/^\#([A-Fa-f\d]+)$/.exec(p)){let x=_[1],y=x.length;if(y===3)return this.setRGB(parseInt(x.charAt(0),16)/15,parseInt(x.charAt(1),16)/15,parseInt(x.charAt(2),16)/15,m);else if(y===6)return this.setHex(parseInt(x,16),m);else Xt("Color: Invalid hex color "+p)}else if(p&&p.length>0)return this.setColorName(p,m);return this}setColorName(p,m="srgb"){let g=fp[p.toLowerCase()];if(g!==void 0)this.setHex(g,m);else Xt("Color: Unknown color "+p);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(p){return this.r=p.r,this.g=p.g,this.b=p.b,this}copySRGBToLinear(p){return this.r=xi(p.r),this.g=xi(p.g),this.b=xi(p.b),this}copyLinearToSRGB(p){return this.r=Xs(p.r),this.g=Xs(p.g),this.b=Xs(p.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(p="srgb"){return ce.workingToColorSpace(gn.copy(this),p),Math.round(se(gn.r*255,0,255))*65536+Math.round(se(gn.g*255,0,255))*256+Math.round(se(gn.b*255,0,255))}getHexString(p="srgb"){return("000000"+this.getHex(p).toString(16)).slice(-6)}getHSL(p,m=ce.workingColorSpace){ce.workingToColorSpace(gn.copy(this),m);let{r:g,g:_,b:x}=gn,y=Math.max(g,_,x),v=Math.min(g,_,x),b,S,M=(v+y)/2;if(v===y)b=0,S=0;else{let E=y-v;switch(S=M<=0.5?E/(y+v):E/(2-y-v),y){case g:b=(_-x)/E+(_<x?6:0);break;case _:b=(x-g)/E+2;break;case x:b=(g-_)/E+4;break}b/=6}return p.h=b,p.s=S,p.l=M,p}getRGB(p,m=ce.workingColorSpace){return ce.workingToColorSpace(gn.copy(this),m),p.r=gn.r,p.g=gn.g,p.b=gn.b,p}getStyle(p="srgb"){ce.workingToColorSpace(gn.copy(this),p);let{r:m,g,b:_}=gn;if(p!=="srgb")return`color(${p} ${m.toFixed(3)} ${g.toFixed(3)} ${_.toFixed(3)})`;return`rgb(${Math.round(m*255)},${Math.round(g*255)},${Math.round(_*255)})`}offsetHSL(p,m,g){return this.getHSL(Ii),this.setHSL(Ii.h+p,Ii.s+m,Ii.l+g)}add(p){return this.r+=p.r,this.g+=p.g,this.b+=p.b,this}addColors(p,m){return this.r=p.r+m.r,this.g=p.g+m.g,this.b=p.b+m.b,this}addScalar(p){return this.r+=p,this.g+=p,this.b+=p,this}sub(p){return this.r=Math.max(0,this.r-p.r),this.g=Math.max(0,this.g-p.g),this.b=Math.max(0,this.b-p.b),this}multiply(p){return this.r*=p.r,this.g*=p.g,this.b*=p.b,this}multiplyScalar(p){return this.r*=p,this.g*=p,this.b*=p,this}lerp(p,m){return this.r+=(p.r-this.r)*m,this.g+=(p.g-this.g)*m,this.b+=(p.b-this.b)*m,this}lerpColors(p,m,g){return this.r=p.r+(m.r-p.r)*g,this.g=p.g+(m.g-p.g)*g,this.b=p.b+(m.b-p.b)*g,this}lerpHSL(p,m){this.getHSL(Ii),p.getHSL(No);let g=kr(Ii.h,No.h,m),_=kr(Ii.s,No.s,m),x=kr(Ii.l,No.l,m);return this.setHSL(g,_,x),this}setFromVector3(p){return this.r=p.x,this.g=p.y,this.b=p.z,this}applyMatrix3(p){let m=this.r,g=this.g,_=this.b,x=p.elements;return this.r=x[0]*m+x[3]*g+x[6]*_,this.g=x[1]*m+x[4]*g+x[7]*_,this.b=x[2]*m+x[5]*g+x[8]*_,this}equals(p){return p.r===this.r&&p.g===this.g&&p.b===this.b}fromArray(p,m=0){return this.r=p[m],this.g=p[m+1],this.b=p[m+2],this}toArray(p=[],m=0){return p[m]=this.r,p[m+1]=this.g,p[m+2]=this.b,p}fromBufferAttribute(p,m){return this.r=p.getX(m),this.g=p.getY(m),this.b=p.getZ(m),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var gn=new oe;oe.NAMES=fp;class ga extends Ye{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yi,this.environmentIntensity=1,this.environmentRotation=new yi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(p,m){return super.copy(p,m),this.background=p.background!==null?p.background.clone():null,this.environment=p.environment!==null?p.environment.clone():null,this.fog=p.fog!==null?p.fog.clone():null,this.backgroundBlurriness=p.backgroundBlurriness,this.backgroundIntensity=p.backgroundIntensity,this.backgroundRotation.copy(p.backgroundRotation),this.environmentIntensity=p.environmentIntensity,this.environmentRotation.copy(p.environmentRotation),this.overrideMaterial=p.overrideMaterial!==null?p.overrideMaterial.clone():null,this.matrixAutoUpdate=p.matrixAutoUpdate,this}toJSON(p){let m=super.toJSON(p);if(this.fog!==null)m.object.fog=this.fog.toJSON();return m.object.backgroundBlurriness=this.backgroundBlurriness,m.object.backgroundIntensity=this.backgroundIntensity,m.object.backgroundRotation=this.backgroundRotation.toArray(),m.object.environmentIntensity=this.environmentIntensity,m.object.environmentRotation=this.environmentRotation.toArray(),m}}var Zn=new Y,fi=new Y,$l=new Y,pi=new Y,Ds=new Y,Us=new Y,Vd=new Y,Zl=new Y,Jl=new Y,Kl=new Y,jl=new ke,Ql=new ke,tc=new ke;class Xe{constructor(p=new Y,m=new Y,g=new Y){this.a=p,this.b=m,this.c=g}static getNormal(p,m,g,_){_.subVectors(g,m),Zn.subVectors(p,m),_.cross(Zn);let x=_.lengthSq();if(x>0)return _.multiplyScalar(1/Math.sqrt(x));return _.set(0,0,0)}static getBarycoord(p,m,g,_,x){Zn.subVectors(_,m),fi.subVectors(g,m),$l.subVectors(p,m);let y=Zn.dot(Zn),v=Zn.dot(fi),b=Zn.dot($l),S=fi.dot(fi),M=fi.dot($l),E=y*S-v*v;if(E===0)return x.set(0,0,0),null;let w=1/E,T=(S*b-v*M)*w,A=(y*M-v*b)*w;return x.set(1-T-A,A,T)}static containsPoint(p,m,g,_){if(this.getBarycoord(p,m,g,_,pi)===null)return!1;return pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(p,m,g,_,x,y,v,b){if(this.getBarycoord(p,m,g,_,pi)===null){if(b.x=0,b.y=0,"z"in b)b.z=0;if("w"in b)b.w=0;return null}return b.setScalar(0),b.addScaledVector(x,pi.x),b.addScaledVector(y,pi.y),b.addScaledVector(v,pi.z),b}static getInterpolatedAttribute(p,m,g,_,x,y){return jl.setScalar(0),Ql.setScalar(0),tc.setScalar(0),jl.fromBufferAttribute(p,m),Ql.fromBufferAttribute(p,g),tc.fromBufferAttribute(p,_),y.setScalar(0),y.addScaledVector(jl,x.x),y.addScaledVector(Ql,x.y),y.addScaledVector(tc,x.z),y}static isFrontFacing(p,m,g,_){return Zn.subVectors(g,m),fi.subVectors(p,m),Zn.cross(fi).dot(_)<0}set(p,m,g){return this.a.copy(p),this.b.copy(m),this.c.copy(g),this}setFromPointsAndIndices(p,m,g,_){return this.a.copy(p[m]),this.b.copy(p[g]),this.c.copy(p[_]),this}setFromAttributeAndIndices(p,m,g,_){return this.a.fromBufferAttribute(p,m),this.b.fromBufferAttribute(p,g),this.c.fromBufferAttribute(p,_),this}clone(){return new this.constructor().copy(this)}copy(p){return this.a.copy(p.a),this.b.copy(p.b),this.c.copy(p.c),this}getArea(){return Zn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Zn.cross(fi).length()*0.5}getMidpoint(p){return p.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(p){return Xe.getNormal(this.a,this.b,this.c,p)}getPlane(p){return p.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(p,m){return Xe.getBarycoord(p,this.a,this.b,this.c,m)}getInterpolation(p,m,g,_,x){return Xe.getInterpolation(p,this.a,this.b,this.c,m,g,_,x)}containsPoint(p){return Xe.containsPoint(p,this.a,this.b,this.c)}isFrontFacing(p){return Xe.isFrontFacing(this.a,this.b,this.c,p)}intersectsBox(p){return p.intersectsTriangle(this)}closestPointToPoint(p,m){let g=this.a,_=this.b,x=this.c,y,v;Ds.subVectors(_,g),Us.subVectors(x,g),Zl.subVectors(p,g);let b=Ds.dot(Zl),S=Us.dot(Zl);if(b<=0&&S<=0)return m.copy(g);Jl.subVectors(p,_);let M=Ds.dot(Jl),E=Us.dot(Jl);if(M>=0&&E<=M)return m.copy(_);let w=b*E-M*S;if(w<=0&&b>=0&&M<=0&&b-M>0)return y=b/(b-M),m.copy(g).addScaledVector(Ds,y);Kl.subVectors(p,x);let T=Ds.dot(Kl),A=Us.dot(Kl);if(A>=0&&T<=A)return m.copy(x);let R=T*S-b*A;if(R<=0&&S>=0&&A<=0)return v=S/(S-A),m.copy(g).addScaledVector(Us,v);let N=M*A-T*E;if(N<=0&&E-M>=0&&T-A>=0)return Vd.subVectors(x,_),v=(E-M)/(E-M+(T-A)),m.copy(_).addScaledVector(Vd,v);let C=1/(N+R+w);return y=R*C,v=w*C,m.copy(g).addScaledVector(Ds,y).addScaledVector(Us,v)}equals(p){return p.a.equals(this.a)&&p.b.equals(this.b)&&p.c.equals(this.c)}}class ve{constructor(p=new Y(1/0,1/0,1/0),m=new Y(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=p,this.max=m}set(p,m){return this.min.copy(p),this.max.copy(m),this}setFromArray(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m+=3)this.expandByPoint(Jn.fromArray(p,m));return this}setFromBufferAttribute(p){this.makeEmpty();for(let m=0,g=p.count;m<g;m++)this.expandByPoint(Jn.fromBufferAttribute(p,m));return this}setFromPoints(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m++)this.expandByPoint(p[m]);return this}setFromCenterAndSize(p,m){let g=Jn.copy(m).multiplyScalar(0.5);return this.min.copy(p).sub(g),this.max.copy(p).add(g),this}setFromObject(p,m=!1){return this.makeEmpty(),this.expandByObject(p,m)}clone(){return new this.constructor().copy(this)}copy(p){return this.min.copy(p.min),this.max.copy(p.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(p){return this.isEmpty()?p.set(0,0,0):p.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(p){return this.isEmpty()?p.set(0,0,0):p.subVectors(this.max,this.min)}expandByPoint(p){return this.min.min(p),this.max.max(p),this}expandByVector(p){return this.min.sub(p),this.max.add(p),this}expandByScalar(p){return this.min.addScalar(-p),this.max.addScalar(p),this}expandByObject(p,m=!1){p.updateWorldMatrix(!1,!1);let g=p.geometry;if(g!==void 0){let x=g.getAttribute("position");if(m===!0&&x!==void 0&&p.isInstancedMesh!==!0&&p.isBatchedMesh!==!0)for(let y=0,v=x.count;y<v;y++){if(p.isMesh===!0)p.getVertexPosition(y,Jn);else Jn.fromBufferAttribute(x,y);Jn.applyMatrix4(p.matrixWorld),this.expandByPoint(Jn)}else{if(p.boundingBox!==void 0){if(p.boundingBox===null)p.computeBoundingBox();Do.copy(p.boundingBox)}else{if(g.boundingBox===null)g.computeBoundingBox();Do.copy(g.boundingBox)}Do.applyMatrix4(p.matrixWorld),this.union(Do)}}let _=p.children;for(let x=0,y=_.length;x<y;x++)this.expandByObject(_[x],m);return this}containsPoint(p){return p.x>=this.min.x&&p.x<=this.max.x&&p.y>=this.min.y&&p.y<=this.max.y&&p.z>=this.min.z&&p.z<=this.max.z}containsBox(p){return this.min.x<=p.min.x&&p.max.x<=this.max.x&&this.min.y<=p.min.y&&p.max.y<=this.max.y&&this.min.z<=p.min.z&&p.max.z<=this.max.z}getParameter(p,m){return m.set((p.x-this.min.x)/(this.max.x-this.min.x),(p.y-this.min.y)/(this.max.y-this.min.y),(p.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(p){return p.max.x>=this.min.x&&p.min.x<=this.max.x&&p.max.y>=this.min.y&&p.min.y<=this.max.y&&p.max.z>=this.min.z&&p.min.z<=this.max.z}intersectsSphere(p){return this.clampPoint(p.center,Jn),Jn.distanceToSquared(p.center)<=p.radius*p.radius}intersectsPlane(p){let m,g;if(p.normal.x>0)m=p.normal.x*this.min.x,g=p.normal.x*this.max.x;else m=p.normal.x*this.max.x,g=p.normal.x*this.min.x;if(p.normal.y>0)m+=p.normal.y*this.min.y,g+=p.normal.y*this.max.y;else m+=p.normal.y*this.max.y,g+=p.normal.y*this.min.y;if(p.normal.z>0)m+=p.normal.z*this.min.z,g+=p.normal.z*this.max.z;else m+=p.normal.z*this.max.z,g+=p.normal.z*this.min.z;return m<=-p.constant&&g>=-p.constant}intersectsTriangle(p){if(this.isEmpty())return!1;this.getCenter(Nr),Uo.subVectors(this.max,Nr),Os.subVectors(p.a,Nr),Fs.subVectors(p.b,Nr),Bs.subVectors(p.c,Nr),Li.subVectors(Fs,Os),Ni.subVectors(Bs,Fs),is.subVectors(Os,Bs);let m=[0,-Li.z,Li.y,0,-Ni.z,Ni.y,0,-is.z,is.y,Li.z,0,-Li.x,Ni.z,0,-Ni.x,is.z,0,-is.x,-Li.y,Li.x,0,-Ni.y,Ni.x,0,-is.y,is.x,0];if(!ec(m,Os,Fs,Bs,Uo))return!1;if(m=[1,0,0,0,1,0,0,0,1],!ec(m,Os,Fs,Bs,Uo))return!1;return Oo.crossVectors(Li,Ni),m=[Oo.x,Oo.y,Oo.z],ec(m,Os,Fs,Bs,Uo)}clampPoint(p,m){return m.copy(p).clamp(this.min,this.max)}distanceToPoint(p){return this.clampPoint(p,Jn).distanceTo(p)}getBoundingSphere(p){if(this.isEmpty())p.makeEmpty();else this.getCenter(p.center),p.radius=this.getSize(Jn).length()*0.5;return p}intersect(p){if(this.min.max(p.min),this.max.min(p.max),this.isEmpty())this.makeEmpty();return this}union(p){return this.min.min(p.min),this.max.max(p.max),this}applyMatrix4(p){if(this.isEmpty())return this;return mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(p),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(p),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(p),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(p),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(p),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(p),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(p),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(p),this.setFromPoints(mi),this}translate(p){return this.min.add(p),this.max.add(p),this}equals(p){return p.min.equals(this.min)&&p.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(p){return this.min.fromArray(p.min),this.max.fromArray(p.max),this}}var mi=[new Y,new Y,new Y,new Y,new Y,new Y,new Y,new Y],Jn=new Y,Do=new ve,Os=new Y,Fs=new Y,Bs=new Y,Li=new Y,Ni=new Y,is=new Y,Nr=new Y,Uo=new Y,Oo=new Y,ss=new Y;function ec(p,m,g,_,x){for(let y=0,v=p.length-3;y<=v;y+=3){ss.fromArray(p,y);let b=x.x*Math.abs(ss.x)+x.y*Math.abs(ss.y)+x.z*Math.abs(ss.z),S=m.dot(ss),M=g.dot(ss),E=_.dot(ss);if(Math.max(-Math.max(S,M,E),Math.min(S,M,E))>b)return!1}return!0}var We=new Y,Fo=new Jt,G_=0;class qe extends Si{constructor(p,m,g=!1){super();if(Array.isArray(p))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:G_++}),this.name="",this.array=p,this.itemSize=m,this.count=p!==void 0?p.length/m:0,this.normalized=g,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=p!==void 0?pa(p):void 0}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.name=p.name,this.array=new p.array.constructor(p.array),this.itemSize=p.itemSize,this.count=p.count,this.normalized=p.normalized,this.usage=p.usage,this.gpuType=p.gpuType,this._normalizationScale=p._normalizationScale,this}copyAt(p,m,g){p*=this.itemSize,g*=m.itemSize;for(let _=0,x=this.itemSize;_<x;_++)this.array[p+_]=m.array[g+_];return this}copyArray(p){return this.array.set(p),this}applyMatrix3(p){if(this.itemSize===2)for(let m=0,g=this.count;m<g;m++)Fo.fromBufferAttribute(this,m),Fo.applyMatrix3(p),this.setXY(m,Fo.x,Fo.y);else if(this.itemSize===3)for(let m=0,g=this.count;m<g;m++)We.fromBufferAttribute(this,m),We.applyMatrix3(p),this.setXYZ(m,We.x,We.y,We.z);return this}applyMatrix4(p){for(let m=0,g=this.count;m<g;m++)We.fromBufferAttribute(this,m),We.applyMatrix4(p),this.setXYZ(m,We.x,We.y,We.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)We.fromBufferAttribute(this,m),We.applyNormalMatrix(p),this.setXYZ(m,We.x,We.y,We.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)We.fromBufferAttribute(this,m),We.transformDirection(p),this.setXYZ(m,We.x,We.y,We.z);return this}set(p,m=0){return this.array.set(p,m),this}getComponent(p,m){let g=this.array[p*this.itemSize+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.array[p*this.itemSize+m]=g,this}getX(p){let m=this.array[p*this.itemSize];if(this.normalized)m=this._denormalize(m);return m}setX(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize]=m,this}getY(p){let m=this.array[p*this.itemSize+1];if(this.normalized)m=this._denormalize(m);return m}setY(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+1]=m,this}getZ(p){let m=this.array[p*this.itemSize+2];if(this.normalized)m=this._denormalize(m);return m}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+2]=m,this}getW(p){let m=this.array[p*this.itemSize+3];if(this.normalized)m=this._denormalize(m);return m}setW(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+3]=m,this}setXY(p,m,g){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.array[p+0]=m,this.array[p+1]=g,this}setXYZ(p,m,g,_){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this.array[p+3]=x,this}onUpload(p){return this.onUploadCallback=p,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let p={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return p.name=this.name,p.usage=this.usage,p.gpuType=this.gpuType,p}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):_h(p,this.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):xh(p,this.array)}}class _a extends qe{constructor(p,m,g){super(new Uint16Array(p),m,g)}}class xa extends qe{constructor(p,m,g){super(new Uint32Array(p),m,g)}}class cn extends qe{constructor(p,m,g){super(new Float32Array(p),m,g)}}var V_=new ve,Dr=new Y,nc=new Y;class Tn{constructor(p=new Y,m=-1){this.isSphere=!0,this.center=p,this.radius=m}set(p,m){return this.center.copy(p),this.radius=m,this}setFromPoints(p,m){let g=this.center;if(m!==void 0)g.copy(m);else V_.setFromPoints(p).getCenter(g);let _=0;for(let x=0,y=p.length;x<y;x++)_=Math.max(_,g.distanceToSquared(p[x]));return this.radius=Math.sqrt(_),this}copy(p){return this.center.copy(p.center),this.radius=p.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(p){return p.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(p){return p.distanceTo(this.center)-this.radius}intersectsSphere(p){let m=this.radius+p.radius;return p.center.distanceToSquared(this.center)<=m*m}intersectsBox(p){return p.intersectsSphere(this)}intersectsPlane(p){return Math.abs(p.distanceToPoint(this.center))<=this.radius}clampPoint(p,m){let g=this.center.distanceToSquared(p);if(m.copy(p),g>this.radius*this.radius)m.sub(this.center).normalize(),m.multiplyScalar(this.radius).add(this.center);return m}getBoundingBox(p){if(this.isEmpty())return p.makeEmpty(),p;return p.set(this.center,this.center),p.expandByScalar(this.radius),p}applyMatrix4(p){return this.center.applyMatrix4(p),this.radius=this.radius*p.getMaxScaleOnAxis(),this}translate(p){return this.center.add(p),this}expandByPoint(p){if(this.isEmpty())return this.center.copy(p),this.radius=0,this;Dr.subVectors(p,this.center);let m=Dr.lengthSq();if(m>this.radius*this.radius){let g=Math.sqrt(m),_=(g-this.radius)*0.5;this.center.addScaledVector(Dr,_/g),this.radius+=_}return this}union(p){if(p.isEmpty())return this;if(this.isEmpty())return this.copy(p),this;if(this.center.equals(p.center)===!0)this.radius=Math.max(this.radius,p.radius);else nc.subVectors(p.center,this.center).setLength(p.radius),this.expandByPoint(Dr.copy(p.center).add(nc)),this.expandByPoint(Dr.copy(p.center).sub(nc));return this}equals(p){return p.center.equals(this.center)&&p.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(p){return this.radius=p.radius,this.center.fromArray(p.center),this}}var W_=0,Hn=new Kt,ic=new Ye,ks=new Y,Ln=new ve,Ur=new ve,en=new Y;class $e extends Si{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:W_++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(p){if(Array.isArray(p))this.index=new((m_(p))?xa:_a)(p,1);else this.index=p;return this}setIndirect(p,m=0){return this.indirect=p,this.indirectOffset=m,this}getIndirect(){return this.indirect}getAttribute(p){return this.attributes[p]}setAttribute(p,m){return this.attributes[p]=m,this}deleteAttribute(p){return delete this.attributes[p],this}hasAttribute(p){return this.attributes[p]!==void 0}addGroup(p,m,g=0){this.groups.push({start:p,count:m,materialIndex:g})}clearGroups(){this.groups=[]}setDrawRange(p,m){this.drawRange.start=p,this.drawRange.count=m}applyMatrix4(p){let m=this.attributes.position;if(m!==void 0)m.applyMatrix4(p),m.needsUpdate=!0;let g=this.attributes.normal;if(g!==void 0){let x=new ee().getNormalMatrix(p);g.applyNormalMatrix(x),g.needsUpdate=!0}let _=this.attributes.tangent;if(_!==void 0)_.transformDirection(p),_.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(p){return Hn.makeRotationFromQuaternion(p),this.applyMatrix4(Hn),this}rotateX(p){return Hn.makeRotationX(p),this.applyMatrix4(Hn),this}rotateY(p){return Hn.makeRotationY(p),this.applyMatrix4(Hn),this}rotateZ(p){return Hn.makeRotationZ(p),this.applyMatrix4(Hn),this}translate(p,m,g){return Hn.makeTranslation(p,m,g),this.applyMatrix4(Hn),this}scale(p,m,g){return Hn.makeScale(p,m,g),this.applyMatrix4(Hn),this}lookAt(p){return ic.lookAt(p),ic.updateMatrix(),this.applyMatrix4(ic.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ks).negate(),this.translate(ks.x,ks.y,ks.z),this}setFromPoints(p){let m=this.getAttribute("position");if(m===void 0){let g=[];for(let _=0,x=p.length;_<x;_++){let y=p[_];g.push(y.x,y.y,y.z||0)}this.setAttribute("position",new cn(g,3))}else{let g=Math.min(p.length,m.count);for(let _=0;_<g;_++){let x=p[_];m.setXYZ(_,x.x,x.y,x.z||0)}if(p.length>m.count)Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");m.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new ve;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Y(-1/0,-1/0,-1/0),new Y(1/0,1/0,1/0));return}if(p!==void 0){if(this.boundingBox.setFromBufferAttribute(p),m)for(let g=0,_=m.length;g<_;g++){let x=m[g];if(Ln.setFromBufferAttribute(x),this.morphTargetsRelative)en.addVectors(this.boundingBox.min,Ln.min),this.boundingBox.expandByPoint(en),en.addVectors(this.boundingBox.max,Ln.max),this.boundingBox.expandByPoint(en);else this.boundingBox.expandByPoint(Ln.min),this.boundingBox.expandByPoint(Ln.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))$t('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Tn;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Y,1/0);return}if(p){let g=this.boundingSphere.center;if(Ln.setFromBufferAttribute(p),m)for(let x=0,y=m.length;x<y;x++){let v=m[x];if(Ur.setFromBufferAttribute(v),this.morphTargetsRelative)en.addVectors(Ln.min,Ur.min),Ln.expandByPoint(en),en.addVectors(Ln.max,Ur.max),Ln.expandByPoint(en);else Ln.expandByPoint(Ur.min),Ln.expandByPoint(Ur.max)}Ln.getCenter(g);let _=0;for(let x=0,y=p.count;x<y;x++)en.fromBufferAttribute(p,x),_=Math.max(_,g.distanceToSquared(en));if(m)for(let x=0,y=m.length;x<y;x++){let v=m[x],b=this.morphTargetsRelative;for(let S=0,M=v.count;S<M;S++){if(en.fromBufferAttribute(v,S),b)ks.fromBufferAttribute(p,S),en.add(ks);_=Math.max(_,g.distanceToSquared(en))}}if(this.boundingSphere.radius=Math.sqrt(_),isNaN(this.boundingSphere.radius))$t('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let p=this.index,m=this.attributes;if(p===null||m.position===void 0||m.normal===void 0||m.uv===void 0){$t("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:g,normal:_,uv:x}=m,y=this.getAttribute("tangent");if(y===void 0||y.count!==g.count)y=new qe(new Float32Array(4*g.count),4),this.setAttribute("tangent",y);let v=[],b=[],S=new Uint8Array(g.count);for(let O=0;O<g.count;O++)v[O]=new Y,b[O]=new Y;let M=new Y,E=new Y,w=new Y,T=new Jt,A=new Jt,R=new Jt,N=new Y,C=new Y;function P(O,H,V){S[O]=S[H]=S[V]=1,M.fromBufferAttribute(g,O),E.fromBufferAttribute(g,H),w.fromBufferAttribute(g,V),T.fromBufferAttribute(x,O),A.fromBufferAttribute(x,H),R.fromBufferAttribute(x,V),E.sub(M),w.sub(M),A.sub(T),R.sub(T);let G=1/(A.x*R.y-R.x*A.y);if(!isFinite(G))return;N.copy(E).multiplyScalar(R.y).addScaledVector(w,-A.y).multiplyScalar(G),C.copy(w).multiplyScalar(A.x).addScaledVector(E,-R.x).multiplyScalar(G),v[O].add(N),v[H].add(N),v[V].add(N),b[O].add(C),b[H].add(C),b[V].add(C)}let I=this.groups;if(I.length===0)I=[{start:0,count:p.count}];for(let O=0,H=I.length;O<H;++O){let V=I[O],{start:G,count:W}=V;for(let J=G,X=G+W;J<X;J+=3)P(p.getX(J+0),p.getX(J+1),p.getX(J+2))}let U=new Y,D=new Y,F=new Y,z=new Y;function L(O){F.fromBufferAttribute(_,O),z.copy(F);let H=v[O];U.copy(H),U.sub(F.multiplyScalar(F.dot(H))).normalize(),D.crossVectors(z,H);let G=D.dot(b[O])<0?-1:1;y.setXYZW(O,U.x,U.y,U.z,G)}for(let O=0,H=g.count;O<H;++O)if(S[O])L(O);this._transformed=!0}computeVertexNormals(){let p=this.index,m=this.getAttribute("position");if(m!==void 0){let g=this.getAttribute("normal");if(g===void 0||g.count!==m.count)g=new qe(new Float32Array(m.count*3),3),this.setAttribute("normal",g);else for(let w=0,T=g.count;w<T;w++)g.setXYZ(w,0,0,0);let _=new Y,x=new Y,y=new Y,v=new Y,b=new Y,S=new Y,M=new Y,E=new Y;if(p)for(let w=0,T=p.count;w<T;w+=3){let A=p.getX(w+0),R=p.getX(w+1),N=p.getX(w+2);_.fromBufferAttribute(m,A),x.fromBufferAttribute(m,R),y.fromBufferAttribute(m,N),M.subVectors(y,x),E.subVectors(_,x),M.cross(E),v.fromBufferAttribute(g,A),b.fromBufferAttribute(g,R),S.fromBufferAttribute(g,N),v.add(M),b.add(M),S.add(M),g.setXYZ(A,v.x,v.y,v.z),g.setXYZ(R,b.x,b.y,b.z),g.setXYZ(N,S.x,S.y,S.z)}else for(let w=0,T=m.count;w<T;w+=3)_.fromBufferAttribute(m,w+0),x.fromBufferAttribute(m,w+1),y.fromBufferAttribute(m,w+2),M.subVectors(y,x),E.subVectors(_,x),M.cross(E),g.setXYZ(w+0,M.x,M.y,M.z),g.setXYZ(w+1,M.x,M.y,M.z),g.setXYZ(w+2,M.x,M.y,M.z);this.normalizeNormals(),g.needsUpdate=!0}}normalizeNormals(){let p=this.attributes.normal;for(let m=0,g=p.count;m<g;m++)en.fromBufferAttribute(p,m),en.normalize(),p.setXYZ(m,en.x,en.y,en.z)}toNonIndexed(){function p(v,b){let{array:S,itemSize:M,normalized:E}=v,w=new S.constructor(b.length*M),T=0,A=0;for(let R=0,N=b.length;R<N;R++){if(v.isInterleavedBufferAttribute)T=b[R]*v.data.stride+v.offset;else T=b[R]*M;for(let C=0;C<M;C++)w[A++]=S[T++]}return new qe(w,M,E)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let m=new $e,g=this.index.array,_=this.attributes;for(let v in _){let b=_[v],S=p(b,g);m.setAttribute(v,S)}let x=this.morphAttributes;for(let v in x){let b=[],S=x[v];for(let M=0,E=S.length;M<E;M++){let w=S[M],T=p(w,g);b.push(T)}m.morphAttributes[v]=b}m.morphTargetsRelative=this.morphTargetsRelative;let y=this.groups;for(let v=0,b=y.length;v<b;v++){let S=y[v];m.addGroup(S.start,S.count,S.materialIndex)}return m}toJSON(){let p={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(p.uuid=this.uuid,p.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,p.name=this.name,Object.keys(this.userData).length>0)p.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let b=this.parameters;for(let S in b)if(b[S]!==void 0)p[S]=b[S];return p}p.data={attributes:{}};let m=this.index;if(m!==null)p.data.index={type:m.array.constructor.name,array:Array.prototype.slice.call(m.array)};let g=this.attributes;for(let b in g){let S=g[b];p.data.attributes[b]=S.toJSON(p.data)}let _={},x=!1;for(let b in this.morphAttributes){let S=this.morphAttributes[b],M=[];for(let E=0,w=S.length;E<w;E++){let T=S[E];M.push(T.toJSON(p.data))}if(M.length>0)_[b]=M,x=!0}if(x)p.data.morphAttributes=_,p.data.morphTargetsRelative=this.morphTargetsRelative;let y=this.groups;if(y.length>0)p.data.groups=JSON.parse(JSON.stringify(y));let v=this.boundingSphere;if(v!==null)p.data.boundingSphere=v.toJSON();return p}clone(){return new this.constructor().copy(this)}copy(p){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let m={};this.name=p.name;let g=p.index;if(g!==null)this.setIndex(g.clone());let _=p.attributes;for(let S in _){let M=_[S];this.setAttribute(S,M.clone(m))}let x=p.morphAttributes;for(let S in x){let M=[],E=x[S];for(let w=0,T=E.length;w<T;w++)M.push(E[w].clone(m));this.morphAttributes[S]=M}this.morphTargetsRelative=p.morphTargetsRelative;let y=p.groups;for(let S=0,M=y.length;S<M;S++){let E=y[S];this.addGroup(E.start,E.count,E.materialIndex)}let v=p.boundingBox;if(v!==null)this.boundingBox=v.clone();let b=p.boundingSphere;if(b!==null)this.boundingSphere=b.clone();return this.drawRange.start=p.drawRange.start,this.drawRange.count=p.drawRange.count,this.userData=p.userData,this._transformed=p._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ya{constructor(p,m){this.isInterleavedBuffer=!0,this.array=p,this.stride=m,this.count=p!==void 0?p.length/m:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=zi()}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.array=new p.array.constructor(p.array),this.count=p.count,this.stride=p.stride,this.usage=p.usage,this}copyAt(p,m,g){p*=this.stride,g*=m.stride;for(let _=0,x=this.stride;_<x;_++)this.array[p+_]=m.array[g+_];return this}set(p,m=0){return this.array.set(p,m),this}clone(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Wd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=this.array.slice(0).buffer;let g=new this.array.constructor(p.arrayBuffers[m]),_=new this.constructor(g,this.stride);return _.setUsage(this.usage),_}onUpload(p){return this.onUploadCallback=p,this}toJSON(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Wd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=Array.from(new Uint32Array(this.array.slice(0).buffer));let g={uuid:this.uuid,buffer:m,type:this.array.constructor.name,stride:this.stride};return g.usage=this.usage,g}}function Wd(p){if(p.buffer._uuid===void 0)p.buffer._uuid=zi();if(p.byteOffset===0&&p.byteLength===p.buffer.byteLength)return p.buffer._uuid;return p.buffer._uuid+":"+p.byteOffset+":"+p.byteLength}var En=new Y;class fs{constructor(p,m,g,_=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=p,this.itemSize=m,this.offset=g,this.normalized=_,this._normalizationScale=p!==void 0?pa(p.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(p){this.data.needsUpdate=p}applyMatrix4(p){for(let m=0,g=this.data.count;m<g;m++)En.fromBufferAttribute(this,m),En.applyMatrix4(p),this.setXYZ(m,En.x,En.y,En.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)En.fromBufferAttribute(this,m),En.applyNormalMatrix(p),this.setXYZ(m,En.x,En.y,En.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)En.fromBufferAttribute(this,m),En.transformDirection(p),this.setXYZ(m,En.x,En.y,En.z);return this}getComponent(p,m){let g=this.array[p*this.data.stride+this.offset+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.data.array[p*this.data.stride+this.offset+m]=g,this}setX(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset]=m,this}setY(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+1]=m,this}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+2]=m,this}setW(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+3]=m,this}getX(p){let m=this.data.array[p*this.data.stride+this.offset];if(this.normalized)m=this._denormalize(m);return m}getY(p){let m=this.data.array[p*this.data.stride+this.offset+1];if(this.normalized)m=this._denormalize(m);return m}getZ(p){let m=this.data.array[p*this.data.stride+this.offset+2];if(this.normalized)m=this._denormalize(m);return m}getW(p){let m=this.data.array[p*this.data.stride+this.offset+3];if(this.normalized)m=this._denormalize(m);return m}setXY(p,m,g){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.data.array[p+0]=m,this.data.array[p+1]=g,this}setXYZ(p,m,g,_){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this.data.array[p+3]=x,this}clone(p){if(p===void 0){Hr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return new qe(new this.array.constructor(m),this.itemSize,this.normalized)}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.clone(p);return new fs(p.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(p){if(p===void 0){Hr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:m,normalized:this.normalized}}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.toJSON(p);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):_h(p,this.data.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):xh(p,this.data.array)}}var sc=new Y,X_=new Y,q_=new ee;class ln{constructor(p=new Y(1,0,0),m=0){this.isPlane=!0,this.normal=p,this.constant=m}set(p,m){return this.normal.copy(p),this.constant=m,this}setComponents(p,m,g,_){return this.normal.set(p,m,g),this.constant=_,this}setFromNormalAndCoplanarPoint(p,m){return this.normal.copy(p),this.constant=-m.dot(this.normal),this}setFromCoplanarPoints(p,m,g){let _=sc.subVectors(g,m).cross(X_.subVectors(p,m)).normalize();return this.setFromNormalAndCoplanarPoint(_,p),this}copy(p){return this.normal.copy(p.normal),this.constant=p.constant,this}normalize(){let p=1/this.normal.length();return this.normal.multiplyScalar(p),this.constant*=p,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(p){return this.normal.dot(p)+this.constant}distanceToSphere(p){return this.distanceToPoint(p.center)-p.radius}projectPoint(p,m){return m.copy(p).addScaledVector(this.normal,-this.distanceToPoint(p))}intersectLine(p,m,g=!0){let _=p.delta(sc),x=this.normal.dot(_);if(x===0){if(this.distanceToPoint(p.start)===0)return m.copy(p.start);return null}let y=-(p.start.dot(this.normal)+this.constant)/x;if(g===!0&&(y<0||y>1))return null;return m.copy(p.start).addScaledVector(_,y)}intersectsLine(p){let m=this.distanceToPoint(p.start),g=this.distanceToPoint(p.end);return m<0&&g>0||g<0&&m>0}intersectsBox(p){return p.intersectsPlane(this)}intersectsSphere(p){return p.intersectsPlane(this)}coplanarPoint(p){return p.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(p,m){let g=m||q_.getNormalMatrix(p),_=this.coplanarPoint(sc).applyMatrix4(p),x=this.normal.applyMatrix3(g).normalize();return this.constant=-_.dot(x),this}translate(p){return this.constant-=p.dot(this.normal),this}equals(p){return p.normal.equals(this.normal)&&p.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(p){return this.normal.fromArray(p.normal),this.constant=p.constant,this}}var Y_=0;class Ti extends Si{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Y_++}),this.uuid=zi(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new oe(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(p){if(this._alphaTest>0!==p>0)this.version++;this._alphaTest=p}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(p){if(p===void 0)return;for(let m in p){let g=p[m];if(g===void 0){Xt(`Material: parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Material: '${m}' is not a property of THREE.${this.type}.`);continue}if(_&&_.isColor)_.set(g);else if(_&&_.isVector2&&(g&&g.isVector2)||_&&_.isEuler&&(g&&g.isEuler)||_&&_.isVector3&&(g&&g.isVector3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(m)p={textures:{},images:{}};let g={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(g.uuid=this.uuid,g.type=this.type,g.blending=this.blending,g.side=this.side,g.shadowSide=this.shadowSide,g.vertexColors=this.vertexColors,g.opacity=this.opacity,g.transparent=this.transparent,g.blendSrc=this.blendSrc,g.blendDst=this.blendDst,g.blendEquation=this.blendEquation,g.blendSrcAlpha=this.blendSrcAlpha,g.blendDstAlpha=this.blendDstAlpha,g.blendEquationAlpha=this.blendEquationAlpha,g.blendColor=this.blendColor.getHex(),g.blendAlpha=this.blendAlpha,g.depthFunc=this.depthFunc,g.depthTest=this.depthTest,g.depthWrite=this.depthWrite,g.colorWrite=this.colorWrite,g.clipIntersection=this.clipIntersection,g.clipShadows=this.clipShadows,g.stencilWriteMask=this.stencilWriteMask,g.stencilFunc=this.stencilFunc,g.stencilRef=this.stencilRef,g.stencilFuncMask=this.stencilFuncMask,g.stencilFail=this.stencilFail,g.stencilZFail=this.stencilZFail,g.stencilZPass=this.stencilZPass,g.stencilWrite=this.stencilWrite,g.polygonOffset=this.polygonOffset,g.polygonOffsetFactor=this.polygonOffsetFactor,g.polygonOffsetUnits=this.polygonOffsetUnits,g.dithering=this.dithering,g.alphaTest=this.alphaTest,g.alphaHash=this.alphaHash,g.alphaToCoverage=this.alphaToCoverage,g.premultipliedAlpha=this.premultipliedAlpha,g.forceSinglePass=this.forceSinglePass,g.allowOverride=this.allowOverride,g.visible=this.visible,g.toneMapped=this.toneMapped,g.name=this.name,this.color&&this.color.isColor)g.color=this.color.getHex();if(this.roughness!==void 0)g.roughness=this.roughness;if(this.metalness!==void 0)g.metalness=this.metalness;if(this.sheen!==void 0)g.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)g.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)g.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)g.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)g.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)g.specular=this.specular.getHex();if(this.specularIntensity!==void 0)g.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)g.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)g.shininess=this.shininess;if(this.clearcoat!==void 0)g.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)g.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)g.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)g.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(p).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)g.clearcoatMap=this.clearcoatMap.toJSON(p).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)g.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(p).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)g.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(p).uuid,g.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)g.sheenColorMap=this.sheenColorMap.toJSON(p).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)g.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(p).uuid;if(this.dispersion!==void 0)g.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)g.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)g.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)g.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)g.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)g.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)g.iridescenceMap=this.iridescenceMap.toJSON(p).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)g.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(p).uuid;if(this.anisotropy!==void 0)g.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)g.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)g.anisotropyMap=this.anisotropyMap.toJSON(p).uuid;if(this.map&&this.map.isTexture)g.map=this.map.toJSON(p).uuid;if(this.matcap&&this.matcap.isTexture)g.matcap=this.matcap.toJSON(p).uuid;if(this.alphaMap&&this.alphaMap.isTexture)g.alphaMap=this.alphaMap.toJSON(p).uuid;if(this.lightMap&&this.lightMap.isTexture)g.lightMap=this.lightMap.toJSON(p).uuid,g.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)g.aoMap=this.aoMap.toJSON(p).uuid,g.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)g.bumpMap=this.bumpMap.toJSON(p).uuid,g.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)g.normalMap=this.normalMap.toJSON(p).uuid,g.normalMapType=this.normalMapType,g.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)g.displacementMap=this.displacementMap.toJSON(p).uuid,g.displacementScale=this.displacementScale,g.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)g.roughnessMap=this.roughnessMap.toJSON(p).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)g.metalnessMap=this.metalnessMap.toJSON(p).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)g.emissiveMap=this.emissiveMap.toJSON(p).uuid;if(this.specularMap&&this.specularMap.isTexture)g.specularMap=this.specularMap.toJSON(p).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)g.specularIntensityMap=this.specularIntensityMap.toJSON(p).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)g.specularColorMap=this.specularColorMap.toJSON(p).uuid;if(this.envMap&&this.envMap.isTexture){if(g.envMap=this.envMap.toJSON(p).uuid,this.combine!==void 0)g.combine=this.combine}if(this.envMapRotation!==void 0)g.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)g.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)g.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)g.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)g.gradientMap=this.gradientMap.toJSON(p).uuid;if(this.transmission!==void 0)g.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)g.transmissionMap=this.transmissionMap.toJSON(p).uuid;if(this.thickness!==void 0)g.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)g.thicknessMap=this.thicknessMap.toJSON(p).uuid;if(this.attenuationDistance!==void 0)g.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)g.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)g.size=this.size;if(this.sizeAttenuation!==void 0)g.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)g.clippingPlanes=this.clippingPlanes.map((x)=>x.toJSON());if(this.rotation!==void 0)g.rotation=this.rotation;if(this.depthPacking!==void 0)g.depthPacking=this.depthPacking;if(this.linewidth!==void 0)g.linewidth=this.linewidth;if(this.linecap!==void 0)g.linecap=this.linecap;if(this.linejoin!==void 0)g.linejoin=this.linejoin;if(this.dashSize!==void 0)g.dashSize=this.dashSize;if(this.gapSize!==void 0)g.gapSize=this.gapSize;if(this.scale!==void 0)g.scale=this.scale;if(this.wireframe!==void 0)g.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)g.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)g.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)g.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)g.flatShading=this.flatShading;if(this.fog!==void 0)g.fog=this.fog;if(Object.keys(this.userData).length>0)g.userData=this.userData;function _(x){let y=[];for(let v in x){let b=x[v];delete b.metadata,y.push(b)}return y}if(m){let x=_(p.textures),y=_(p.images);if(x.length>0)g.textures=x;if(y.length>0)g.images=y}return g}fromJSON(p,m){if(p.uuid!==void 0)this.uuid=p.uuid;if(p.name!==void 0)this.name=p.name;if(p.color!==void 0&&this.color!==void 0)this.color.setHex(p.color);if(p.roughness!==void 0)this.roughness=p.roughness;if(p.metalness!==void 0)this.metalness=p.metalness;if(p.sheen!==void 0)this.sheen=p.sheen;if(p.sheenColor!==void 0)this.sheenColor=new oe().setHex(p.sheenColor);if(p.sheenRoughness!==void 0)this.sheenRoughness=p.sheenRoughness;if(p.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(p.emissive);if(p.specular!==void 0&&this.specular!==void 0)this.specular.setHex(p.specular);if(p.specularIntensity!==void 0)this.specularIntensity=p.specularIntensity;if(p.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(p.specularColor);if(p.shininess!==void 0)this.shininess=p.shininess;if(p.clearcoat!==void 0)this.clearcoat=p.clearcoat;if(p.clearcoatRoughness!==void 0)this.clearcoatRoughness=p.clearcoatRoughness;if(p.diffuseRoughness!==void 0)this.diffuseRoughness=p.diffuseRoughness;if(p.dispersion!==void 0)this.dispersion=p.dispersion;if(p.retroreflectivity!==void 0)this.retroreflectivity=p.retroreflectivity;if(p.iridescence!==void 0)this.iridescence=p.iridescence;if(p.iridescenceIOR!==void 0)this.iridescenceIOR=p.iridescenceIOR;if(p.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessMinimum;if(p.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=p.iridescenceThicknessMaximum;if(p.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=p.iridescenceThicknessRange[1];if(p.transmission!==void 0)this.transmission=p.transmission;if(p.thickness!==void 0)this.thickness=p.thickness;if(p.attenuationDistance!==void 0)this.attenuationDistance=p.attenuationDistance;if(p.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(p.attenuationColor);if(p.anisotropy!==void 0)this.anisotropy=p.anisotropy;if(p.anisotropyRotation!==void 0)this.anisotropyRotation=p.anisotropyRotation;if(p.fog!==void 0)this.fog=p.fog;if(p.flatShading!==void 0)this.flatShading=p.flatShading;if(p.blending!==void 0)this.blending=p.blending;if(p.combine!==void 0)this.combine=p.combine;if(p.side!==void 0)this.side=p.side;if(p.shadowSide!==void 0)this.shadowSide=p.shadowSide;if(p.opacity!==void 0)this.opacity=p.opacity;if(p.transparent!==void 0)this.transparent=p.transparent;if(p.alphaTest!==void 0)this.alphaTest=p.alphaTest;if(p.alphaHash!==void 0)this.alphaHash=p.alphaHash;if(p.depthFunc!==void 0)this.depthFunc=p.depthFunc;if(p.depthTest!==void 0)this.depthTest=p.depthTest;if(p.depthWrite!==void 0)this.depthWrite=p.depthWrite;if(p.colorWrite!==void 0)this.colorWrite=p.colorWrite;if(p.clippingPlanes!==void 0)this.clippingPlanes=p.clippingPlanes.map((g)=>new ln().fromJSON(g));if(p.clipIntersection!==void 0)this.clipIntersection=p.clipIntersection;if(p.clipShadows!==void 0)this.clipShadows=p.clipShadows;if(p.depthPacking!==void 0)this.depthPacking=p.depthPacking;if(p.blendSrc!==void 0)this.blendSrc=p.blendSrc;if(p.blendDst!==void 0)this.blendDst=p.blendDst;if(p.blendEquation!==void 0)this.blendEquation=p.blendEquation;if(p.blendSrcAlpha!==void 0)this.blendSrcAlpha=p.blendSrcAlpha;if(p.blendDstAlpha!==void 0)this.blendDstAlpha=p.blendDstAlpha;if(p.blendEquationAlpha!==void 0)this.blendEquationAlpha=p.blendEquationAlpha;if(p.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(p.blendColor);if(p.blendAlpha!==void 0)this.blendAlpha=p.blendAlpha;if(p.stencilWriteMask!==void 0)this.stencilWriteMask=p.stencilWriteMask;if(p.stencilFunc!==void 0)this.stencilFunc=p.stencilFunc;if(p.stencilRef!==void 0)this.stencilRef=p.stencilRef;if(p.stencilFuncMask!==void 0)this.stencilFuncMask=p.stencilFuncMask;if(p.stencilFail!==void 0)this.stencilFail=p.stencilFail;if(p.stencilZFail!==void 0)this.stencilZFail=p.stencilZFail;if(p.stencilZPass!==void 0)this.stencilZPass=p.stencilZPass;if(p.stencilWrite!==void 0)this.stencilWrite=p.stencilWrite;if(p.wireframe!==void 0)this.wireframe=p.wireframe;if(p.wireframeLinewidth!==void 0)this.wireframeLinewidth=p.wireframeLinewidth;if(p.wireframeLinecap!==void 0)this.wireframeLinecap=p.wireframeLinecap;if(p.wireframeLinejoin!==void 0)this.wireframeLinejoin=p.wireframeLinejoin;if(p.rotation!==void 0)this.rotation=p.rotation;if(p.linewidth!==void 0)this.linewidth=p.linewidth;if(p.linecap!==void 0)this.linecap=p.linecap;if(p.linejoin!==void 0)this.linejoin=p.linejoin;if(p.dashSize!==void 0)this.dashSize=p.dashSize;if(p.gapSize!==void 0)this.gapSize=p.gapSize;if(p.scale!==void 0)this.scale=p.scale;if(p.polygonOffset!==void 0)this.polygonOffset=p.polygonOffset;if(p.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=p.polygonOffsetFactor;if(p.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=p.polygonOffsetUnits;if(p.dithering!==void 0)this.dithering=p.dithering;if(p.alphaToCoverage!==void 0)this.alphaToCoverage=p.alphaToCoverage;if(p.premultipliedAlpha!==void 0)this.premultipliedAlpha=p.premultipliedAlpha;if(p.forceSinglePass!==void 0)this.forceSinglePass=p.forceSinglePass;if(p.allowOverride!==void 0)this.allowOverride=p.allowOverride;if(p.visible!==void 0)this.visible=p.visible;if(p.toneMapped!==void 0)this.toneMapped=p.toneMapped;if(p.userData!==void 0)this.userData=p.userData;if(p.vertexColors!==void 0)if(typeof p.vertexColors==="number")this.vertexColors=p.vertexColors>0;else this.vertexColors=p.vertexColors;if(p.size!==void 0)this.size=p.size;if(p.sizeAttenuation!==void 0)this.sizeAttenuation=p.sizeAttenuation;if(p.map!==void 0)this.map=m[p.map]||null;if(p.matcap!==void 0)this.matcap=m[p.matcap]||null;if(p.alphaMap!==void 0)this.alphaMap=m[p.alphaMap]||null;if(p.bumpMap!==void 0)this.bumpMap=m[p.bumpMap]||null;if(p.bumpScale!==void 0)this.bumpScale=p.bumpScale;if(p.normalMap!==void 0)this.normalMap=m[p.normalMap]||null;if(p.normalMapType!==void 0)this.normalMapType=p.normalMapType;if(p.normalScale!==void 0){let g=p.normalScale;if(Array.isArray(g)===!1)g=[g,g];this.normalScale=new Jt().fromArray(g)}if(p.displacementMap!==void 0)this.displacementMap=m[p.displacementMap]||null;if(p.displacementScale!==void 0)this.displacementScale=p.displacementScale;if(p.displacementBias!==void 0)this.displacementBias=p.displacementBias;if(p.roughnessMap!==void 0)this.roughnessMap=m[p.roughnessMap]||null;if(p.metalnessMap!==void 0)this.metalnessMap=m[p.metalnessMap]||null;if(p.emissiveMap!==void 0)this.emissiveMap=m[p.emissiveMap]||null;if(p.emissiveIntensity!==void 0)this.emissiveIntensity=p.emissiveIntensity;if(p.specularMap!==void 0)this.specularMap=m[p.specularMap]||null;if(p.specularIntensityMap!==void 0)this.specularIntensityMap=m[p.specularIntensityMap]||null;if(p.specularColorMap!==void 0)this.specularColorMap=m[p.specularColorMap]||null;if(p.envMap!==void 0)this.envMap=m[p.envMap]||null;if(p.envMapRotation!==void 0)this.envMapRotation.fromArray(p.envMapRotation);if(p.envMapIntensity!==void 0)this.envMapIntensity=p.envMapIntensity;if(p.reflectivity!==void 0)this.reflectivity=p.reflectivity;if(p.refractionRatio!==void 0)this.refractionRatio=p.refractionRatio;if(p.lightMap!==void 0)this.lightMap=m[p.lightMap]||null;if(p.lightMapIntensity!==void 0)this.lightMapIntensity=p.lightMapIntensity;if(p.aoMap!==void 0)this.aoMap=m[p.aoMap]||null;if(p.aoMapIntensity!==void 0)this.aoMapIntensity=p.aoMapIntensity;if(p.gradientMap!==void 0)this.gradientMap=m[p.gradientMap]||null;if(p.clearcoatMap!==void 0)this.clearcoatMap=m[p.clearcoatMap]||null;if(p.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=m[p.clearcoatRoughnessMap]||null;if(p.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=m[p.clearcoatNormalMap]||null;if(p.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Jt().fromArray(p.clearcoatNormalScale);if(p.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=m[p.diffuseRoughnessMap]||null;if(p.iridescenceMap!==void 0)this.iridescenceMap=m[p.iridescenceMap]||null;if(p.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=m[p.iridescenceThicknessMap]||null;if(p.transmissionMap!==void 0)this.transmissionMap=m[p.transmissionMap]||null;if(p.thicknessMap!==void 0)this.thicknessMap=m[p.thicknessMap]||null;if(p.anisotropyMap!==void 0)this.anisotropyMap=m[p.anisotropyMap]||null;if(p.sheenColorMap!==void 0)this.sheenColorMap=m[p.sheenColorMap]||null;if(p.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=m[p.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(p){this.name=p.name,this.blending=p.blending,this.side=p.side,this.vertexColors=p.vertexColors,this.opacity=p.opacity,this.transparent=p.transparent,this.blendSrc=p.blendSrc,this.blendDst=p.blendDst,this.blendEquation=p.blendEquation,this.blendSrcAlpha=p.blendSrcAlpha,this.blendDstAlpha=p.blendDstAlpha,this.blendEquationAlpha=p.blendEquationAlpha,this.blendColor.copy(p.blendColor),this.blendAlpha=p.blendAlpha,this.depthFunc=p.depthFunc,this.depthTest=p.depthTest,this.depthWrite=p.depthWrite,this.stencilWriteMask=p.stencilWriteMask,this.stencilFunc=p.stencilFunc,this.stencilRef=p.stencilRef,this.stencilFuncMask=p.stencilFuncMask,this.stencilFail=p.stencilFail,this.stencilZFail=p.stencilZFail,this.stencilZPass=p.stencilZPass,this.stencilWrite=p.stencilWrite;let m=p.clippingPlanes,g=null;if(m!==null){let _=m.length;g=Array(_);for(let x=0;x!==_;++x)g[x]=m[x].clone()}return this.clippingPlanes=g,this.clipIntersection=p.clipIntersection,this.clipShadows=p.clipShadows,this.shadowSide=p.shadowSide,this.colorWrite=p.colorWrite,this.precision=p.precision,this.polygonOffset=p.polygonOffset,this.polygonOffsetFactor=p.polygonOffsetFactor,this.polygonOffsetUnits=p.polygonOffsetUnits,this.dithering=p.dithering,this.alphaTest=p.alphaTest,this.alphaHash=p.alphaHash,this.alphaToCoverage=p.alphaToCoverage,this.premultipliedAlpha=p.premultipliedAlpha,this.forceSinglePass=p.forceSinglePass,this.allowOverride=p.allowOverride,this.visible=p.visible,this.toneMapped=p.toneMapped,this.userData=JSON.parse(JSON.stringify(p.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(p){if(p===!0)this.version++}}var gi=new Y,rc=new Y,Bo=new Y,ko=new Y;class Hi{constructor(p=new Y,m=new Y(0,0,-1)){this.origin=p,this.direction=m}set(p,m){return this.origin.copy(p),this.direction.copy(m),this}copy(p){return this.origin.copy(p.origin),this.direction.copy(p.direction),this}at(p,m){return m.copy(this.origin).addScaledVector(this.direction,p)}lookAt(p){return this.direction.copy(p).sub(this.origin).normalize(),this}recast(p){return this.origin.copy(this.at(p,gi)),this}closestPointToPoint(p,m){m.subVectors(p,this.origin);let g=m.dot(this.direction);if(g<0)return m.copy(this.origin);return m.copy(this.origin).addScaledVector(this.direction,g)}distanceToPoint(p){return Math.sqrt(this.distanceSqToPoint(p))}distanceSqToPoint(p){let m=gi.subVectors(p,this.origin).dot(this.direction);if(m<0)return this.origin.distanceToSquared(p);return gi.copy(this.origin).addScaledVector(this.direction,m),gi.distanceToSquared(p)}distanceSqToSegment(p,m,g,_){rc.copy(p).add(m).multiplyScalar(0.5),Bo.copy(m).sub(p).normalize(),ko.copy(this.origin).sub(rc);let x=p.distanceTo(m)*0.5,y=-this.direction.dot(Bo),v=ko.dot(this.direction),b=-ko.dot(Bo),S=ko.lengthSq(),M=Math.abs(1-y*y),E,w,T,A;if(M>0)if(E=y*b-v,w=y*v-b,A=x*M,E>=0)if(w>=-A)if(w<=A){let R=1/M;E*=R,w*=R,T=E*(E+y*w+2*v)+w*(y*E+w+2*b)+S}else w=x,E=Math.max(0,-(y*w+v)),T=-E*E+w*(w+2*b)+S;else w=-x,E=Math.max(0,-(y*w+v)),T=-E*E+w*(w+2*b)+S;else if(w<=-A)E=Math.max(0,-(-y*x+v)),w=E>0?-x:Math.min(Math.max(-x,-b),x),T=-E*E+w*(w+2*b)+S;else if(w<=A)E=0,w=Math.min(Math.max(-x,-b),x),T=w*(w+2*b)+S;else E=Math.max(0,-(y*x+v)),w=E>0?x:Math.min(Math.max(-x,-b),x),T=-E*E+w*(w+2*b)+S;else w=y>0?-x:x,E=Math.max(0,-(y*w+v)),T=-E*E+w*(w+2*b)+S;if(g)g.copy(this.origin).addScaledVector(this.direction,E);if(_)_.copy(rc).addScaledVector(Bo,w);return T}intersectSphere(p,m){if(p.radius<0)return null;gi.subVectors(p.center,this.origin);let g=gi.dot(this.direction),_=gi.dot(gi)-g*g,x=p.radius*p.radius;if(_>x)return null;let y=Math.sqrt(x-_),v=g-y,b=g+y;if(b<0)return null;if(v<0)return this.at(b,m);return this.at(v,m)}intersectsSphere(p){if(p.radius<0)return!1;return this.distanceSqToPoint(p.center)<=p.radius*p.radius}distanceToPlane(p){let m=p.normal.dot(this.direction);if(m===0){if(p.distanceToPoint(this.origin)===0)return 0;return null}let g=-(this.origin.dot(p.normal)+p.constant)/m;return g>=0?g:null}intersectPlane(p,m){let g=this.distanceToPlane(p);if(g===null)return null;return this.at(g,m)}intersectsPlane(p){let m=p.distanceToPoint(this.origin);if(m===0)return!0;if(p.normal.dot(this.direction)*m<0)return!0;return!1}intersectBox(p,m){let g,_,x,y,v,b,S=1/this.direction.x,M=1/this.direction.y,E=1/this.direction.z,w=this.origin;if(S>=0)g=(p.min.x-w.x)*S,_=(p.max.x-w.x)*S;else g=(p.max.x-w.x)*S,_=(p.min.x-w.x)*S;if(M>=0)x=(p.min.y-w.y)*M,y=(p.max.y-w.y)*M;else x=(p.max.y-w.y)*M,y=(p.min.y-w.y)*M;if(g>y||x>_)return null;if(x>g||isNaN(g))g=x;if(y<_||isNaN(_))_=y;if(E>=0)v=(p.min.z-w.z)*E,b=(p.max.z-w.z)*E;else v=(p.max.z-w.z)*E,b=(p.min.z-w.z)*E;if(g>b||v>_)return null;if(v>g||g!==g)g=v;if(b<_||_!==_)_=b;if(_<0)return null;return this.at(g>=0?g:_,m)}intersectsBox(p){return this.intersectBox(p,gi)!==null}intersectTriangle(p,m,g,_,x){let y=this.origin,v=this.direction,{x:b,y:S,z:M}=v,E=p.x-y.x,w=p.y-y.y,T=p.z-y.z,A=m.x-y.x,R=m.y-y.y,N=m.z-y.z,C=g.x-y.x,P=g.y-y.y,I=g.z-y.z,U=Math.abs(b),D=Math.abs(S),F=Math.abs(M),z,L,O,H,V,G,W,J,X,Q,st,tt;if(U>=D&&U>=F)if(O=b,G=E,X=A,tt=C,b>=0)z=S,L=M,H=w,V=T,W=R,J=N,Q=P,st=I;else z=M,L=S,H=T,V=w,W=N,J=R,Q=I,st=P;else if(D>=F)if(O=S,G=w,X=R,tt=P,S>=0)z=M,L=b,H=T,V=E,W=N,J=A,Q=I,st=C;else z=b,L=M,H=E,V=T,W=A,J=N,Q=C,st=I;else if(O=M,G=T,X=N,tt=I,M>=0)z=b,L=S,H=E,V=w,W=A,J=R,Q=C,st=P;else z=S,L=b,H=w,V=E,W=R,J=A,Q=P,st=C;if(O===0)return null;let _t=z/O,ot=L/O,ht=1/O,xt=H-_t*G,Dt=V-ot*G,at=W-_t*X,mt=J-ot*X,Ct=Q-_t*tt,Ut=st-ot*tt,Ht=Ct*mt-Ut*at,Et=xt*Ut-Dt*Ct,re=at*Dt-mt*xt;if(_){if(Ht<0||Et<0||re<0)return null}else if((Ht<0||Et<0||re<0)&&(Ht>0||Et>0||re>0))return null;let te=Ht+Et+re;if(te===0)return null;let Ft=ht*(Ht*G+Et*X+re*tt);if(te>0?Ft<0:Ft>0)return null;return this.at(Ft/te,x)}applyMatrix4(p){return this.origin.applyMatrix4(p),this.direction.transformDirection(p),this}equals(p){return p.origin.equals(this.origin)&&p.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ir extends Ti{constructor(p){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yi,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.fog=p.fog,this}}var Xd=new Kt,rs=new Hi,zo=new Tn,qd=new Y,Ho=new Y,Go=new Y,Vo=new Y,oc=new Y,Wo=new Y,Yd=new Y,Xo=new Y;class He extends Ye{constructor(p=new $e,m=new ir){super();this.isMesh=!0,this.type="Mesh",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}getVertexPosition(p,m){let g=this.geometry,_=g.attributes.position,x=g.morphAttributes.position,y=g.morphTargetsRelative;m.fromBufferAttribute(_,p);let v=this.morphTargetInfluences;if(x&&v){Wo.set(0,0,0);for(let b=0,S=x.length;b<S;b++){let M=v[b],E=x[b];if(M===0)continue;if(oc.fromBufferAttribute(E,p),y)Wo.addScaledVector(oc,M);else Wo.addScaledVector(oc.sub(m),M)}m.add(Wo)}return m}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.material,x=this.matrixWorld;if(_===void 0)return;if(g.boundingSphere===null)g.computeBoundingSphere();if(zo.copy(g.boundingSphere),zo.applyMatrix4(x),rs.copy(p.ray).recast(p.near),zo.containsPoint(rs.origin)===!1){if(rs.intersectSphere(zo,qd)===null)return;if(rs.origin.distanceToSquared(qd)>(p.far-p.near)**2)return}if(Xd.copy(x).invert(),rs.copy(p.ray).applyMatrix4(Xd),g.boundingBox!==null){if(rs.intersectsBox(g.boundingBox)===!1)return}this._computeIntersections(p,m,rs)}_computeIntersections(p,m,g){let _,x=this.geometry,y=this.material,v=x.index,b=x.attributes.position,S=x.attributes.uv,M=x.attributes.uv1,E=x.attributes.normal,{groups:w,drawRange:T}=x;if(v!==null)if(Array.isArray(y))for(let A=0,R=w.length;A<R;A++){let N=w[A],C=y[N.materialIndex],P=Math.max(N.start,T.start),I=Math.min(v.count,Math.min(N.start+N.count,T.start+T.count));for(let U=P,D=I;U<D;U+=3){let F=v.getX(U),z=v.getX(U+1),L=v.getX(U+2);if(_=qo(this,C,p,g,S,M,E,F,z,L),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=N.materialIndex,m.push(_)}}else{let A=Math.max(0,T.start),R=Math.min(v.count,T.start+T.count);for(let N=A,C=R;N<C;N+=3){let P=v.getX(N),I=v.getX(N+1),U=v.getX(N+2);if(_=qo(this,y,p,g,S,M,E,P,I,U),_)_.faceIndex=Math.floor(N/3),m.push(_)}}else if(b!==void 0)if(Array.isArray(y))for(let A=0,R=w.length;A<R;A++){let N=w[A],C=y[N.materialIndex],P=Math.max(N.start,T.start),I=Math.min(b.count,Math.min(N.start+N.count,T.start+T.count));for(let U=P,D=I;U<D;U+=3){let F=U,z=U+1,L=U+2;if(_=qo(this,C,p,g,S,M,E,F,z,L),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=N.materialIndex,m.push(_)}}else{let A=Math.max(0,T.start),R=Math.min(b.count,T.start+T.count);for(let N=A,C=R;N<C;N+=3){let P=N,I=N+1,U=N+2;if(_=qo(this,y,p,g,S,M,E,P,I,U),_)_.faceIndex=Math.floor(N/3),m.push(_)}}}}function $_(p,m,g,_,x,y,v,b){let S;if(m.side===1)S=_.intersectTriangle(v,y,x,!0,b);else S=_.intersectTriangle(x,y,v,m.side===0,b);if(S===null)return null;Xo.copy(b),Xo.applyMatrix4(p.matrixWorld);let M=g.ray.origin.distanceTo(Xo);if(M<g.near||M>g.far)return null;return{distance:M,point:Xo.clone(),object:p}}function qo(p,m,g,_,x,y,v,b,S,M){p.getVertexPosition(b,Ho),p.getVertexPosition(S,Go),p.getVertexPosition(M,Vo);let E=$_(p,m,g,_,Ho,Go,Vo,Yd);if(E){let w=new Y;if(Xe.getBarycoord(Yd,Ho,Go,Vo,w),x)E.uv=Xe.getInterpolatedAttribute(x,b,S,M,w,new Jt);if(y)E.uv1=Xe.getInterpolatedAttribute(y,b,S,M,w,new Jt);if(v){if(E.normal=Xe.getInterpolatedAttribute(v,b,S,M,w,new Y),E.normal.dot(_.direction)>0)E.normal.multiplyScalar(-1)}let T={a:b,b:S,c:M,normal:new Y,materialIndex:0};Xe.getNormal(Ho,Go,Vo,T.normal),E.face=T,E.barycoord=w}return E}class qs extends ze{constructor(p=null,m=1,g=1,_,x,y,v,b,S=1003,M=1003,E,w){super(null,y,v,b,S,M,_,x,E,w);this.isDataTexture=!0,this.image={data:p,width:m,height:g},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var os=new Tn,Z_=new Jt(0.5,0.5),Yo=new Y;class Oi{constructor(p=new ln,m=new ln,g=new ln,_=new ln,x=new ln,y=new ln){this.planes=[p,m,g,_,x,y]}set(p,m,g,_,x,y){let v=this.planes;return v[0].copy(p),v[1].copy(m),v[2].copy(g),v[3].copy(_),v[4].copy(x),v[5].copy(y),this}copy(p){let m=this.planes;for(let g=0;g<6;g++)m[g].copy(p.planes[g]);return this}setFromProjectionMatrix(p,m=2000,g=!1){let _=this.planes,x=p.elements,y=x[0],v=x[1],b=x[2],S=x[3],M=x[4],E=x[5],w=x[6],T=x[7],A=x[8],R=x[9],N=x[10],C=x[11],P=x[12],I=x[13],U=x[14],D=x[15];if(_[0].setComponents(S-y,T-M,C-A,D-P).normalize(),_[1].setComponents(S+y,T+M,C+A,D+P).normalize(),_[2].setComponents(S+v,T+E,C+R,D+I).normalize(),_[3].setComponents(S-v,T-E,C-R,D-I).normalize(),g)_[4].setComponents(b,w,N,U).normalize(),_[5].setComponents(S-b,T-w,C-N,D-U).normalize();else if(_[4].setComponents(S-b,T-w,C-N,D-U).normalize(),m===2000)_[5].setComponents(S+b,T+w,C+N,D+U).normalize();else if(m===2001)_[5].setComponents(b,w,N,U).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+m);return this}intersectsObject(p){if(p.boundingSphere!==void 0){if(p.boundingSphere===null)p.computeBoundingSphere();os.copy(p.boundingSphere).applyMatrix4(p.matrixWorld)}else{let m=p.geometry;if(m.boundingSphere===null)m.computeBoundingSphere();os.copy(m.boundingSphere).applyMatrix4(p.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(p){os.center.set(0,0,0);let m=Z_.distanceTo(p.center);return os.radius=0.7071067811865476+m,os.applyMatrix4(p.matrixWorld),this.intersectsSphere(os)}intersectsSphere(p){let m=this.planes,g=p.center,_=-p.radius;for(let x=0;x<6;x++)if(m[x].distanceToPoint(g)<_)return!1;return!0}intersectsBox(p){let m=this.planes;for(let g=0;g<6;g++){let _=m[g];if(Yo.x=_.normal.x>0?p.max.x:p.min.x,Yo.y=_.normal.y>0?p.max.y:p.min.y,Yo.z=_.normal.z>0?p.max.z:p.min.z,_.distanceToPoint(Yo)<0)return!1}return!0}containsPoint(p){let m=this.planes;for(let g=0;g<6;g++)if(m[g].distanceToPoint(p)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var $d=new Kt;class Qr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(p){let m=p.cameras,g=this._frustums;for(let _=0;_<m.length;_++){let x=m[_];if($d.multiplyMatrices(x.projectionMatrix,x.matrixWorldInverse),g[_]===void 0)g[_]=new Oi;g[_].setFromProjectionMatrix($d,x.coordinateSystem,x.reversedDepth)}return this._count=m.length,this}getFrustum(p){return this._frustums[p]}intersectsObject(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsObject(p))return!0;return!1}intersectsSprite(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSprite(p))return!0;return!1}intersectsSphere(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSphere(p))return!0;return!1}intersectsBox(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsBox(p))return!0;return!1}containsPoint(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].containsPoint(p))return!0;return!1}copy(p){this.coordinateSystem=p.coordinateSystem;let m=this._frustums,g=p._frustums;for(let _=0;_<p._count;_++){if(m[_]===void 0)m[_]=new Oi;m[_].copy(g[_])}return this._count=p._count,this}clone(){return new Qr().copy(this)}}function ac(p,m){return p-m}function J_(p,m){return p.z-m.z}function K_(p,m){return m.z-p.z}class pp{constructor(){this.index=0,this.pool=[],this.list=[]}push(p,m,g,_){let x=this.pool,y=this.list;if(this.index>=x.length)x.push({start:-1,count:-1,z:-1,index:-1});let v=x[this.index];y.push(v),this.index++,v.start=p,v.count=m,v.z=g,v.index=_}reset(){this.list.length=0,this.index=0}}var Rn=new Kt,j_=new oe(1,1,1),Q_=new Oi,t0=new Qr,$o=new ve,as=new Tn,lc=new Y,Zd=new Y,Jd=new Y,e0=new Y,cc=new pp,_n=new He,Zo=[];function n0(p,m,g=0){let _=m.itemSize;if(p.isInterleavedBufferAttribute||p.array.constructor!==m.array.constructor){let x=p.count;for(let y=0;y<x;y++)for(let v=0;v<_;v++)m.setComponent(y+g,v,p.getComponent(y,v))}else m.array.set(p.array,g*_);m.needsUpdate=!0}function ni(p,m){if(p.constructor!==m.constructor){let g=Math.min(p.length,m.length);for(let _=0;_<g;_++)m[_]=p[_]}else{let g=Math.min(p.length,m.length);m.set(new p.constructor(p.buffer,0,g))}}class va extends He{constructor(p,m,g=m*2,_){super(new $e,_);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=p,this._maxVertexCount=m,this._maxIndexCount=g,this._multiDrawCounts=new Int32Array(p),this._multiDrawStarts=new Int32Array(p),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(p),this._mergedDrawStarts=new Int32Array(p),this._mergedDrawInstanceCounts=new Int32Array(p),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let p=Math.sqrt(this._maxInstanceCount*4);p=Math.ceil(p/4)*4,p=Math.max(p,4);let m=new Float32Array(p*p*4),g=new qs(m,p,p,1023,1015);this._matricesTexture=g}_initIndirectTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Uint32Array(p*p),g=new qs(m,p,p,1029,1014);this._indirectTexture=g}_initColorsTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Float32Array(p*p*4).fill(1),g=new qs(m,p,p,1023,1015);g.colorSpace=ce.workingColorSpace,this._colorsTexture=g}_initializeGeometry(p){let m=this.geometry,g=this._maxVertexCount,_=this._maxIndexCount;if(this._geometryInitialized===!1){for(let x in p.attributes){let y=p.getAttribute(x),{array:v,itemSize:b,normalized:S}=y,M=new v.constructor(g*b),E=new qe(M,b,S);m.setAttribute(x,E)}if(p.getIndex()!==null){let x=g>65535?new Uint32Array(_):new Uint16Array(_);m.setIndex(new qe(x,1))}this._geometryInitialized=!0}}_validateGeometry(p){let m=this.geometry;if(Boolean(p.getIndex())!==Boolean(m.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let g in m.attributes){if(!p.hasAttribute(g))throw Error(`THREE.BatchedMesh: Added geometry missing "${g}". All geometries must have consistent attributes.`);let _=p.getAttribute(g),x=m.getAttribute(g);if(_.itemSize!==x.itemSize||_.normalized!==x.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${g}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(p){let m=this._instanceInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${p}. Instance is either out of range or has been deleted.`)}validateGeometryId(p){let m=this._geometryInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${p}. Geometry is either out of range or has been deleted.`)}setCustomSort(p){return this.customSort=p,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new ve;let p=this.boundingBox,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,Rn),this.getBoundingBoxAt(x,$o).applyMatrix4(Rn),p.union($o)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Tn;let p=this.boundingSphere,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,Rn),this.getBoundingSphereAt(x,as).applyMatrix4(Rn),p.union(as)}}addInstance(p){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let g={visible:!0,active:!0,geometryIndex:p},_=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(ac),_=this._availableInstanceIds.shift(),this._instanceInfo[_]=g;else _=this._instanceInfo.length,this._instanceInfo.push(g);let x=this._matricesTexture;Rn.identity().toArray(x.image.data,_*16),x.needsUpdate=!0;let y=this._colorsTexture;if(y)j_.toArray(y.image.data,_*4),y.needsUpdate=!0;return this._visibilityChanged=!0,_}addGeometry(p,m=-1,g=-1){this._initializeGeometry(p),this._validateGeometry(p);let _={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},x=this._geometryInfo;_.vertexStart=this._nextVertexStart,_.reservedVertexCount=m===-1?p.getAttribute("position").count:m;let y=p.getIndex();if(y!==null)_.indexStart=this._nextIndexStart,_.reservedIndexCount=g===-1?y.count:g;if(_.indexStart!==-1&&_.indexStart+_.reservedIndexCount>this._maxIndexCount||_.vertexStart+_.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let b;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(ac),b=this._availableGeometryIds.shift(),x[b]=_;else b=this._geometryCount,this._geometryCount++,x.push(_);return this.setGeometryAt(b,p),this._nextIndexStart=_.indexStart+_.reservedIndexCount,this._nextVertexStart=_.vertexStart+_.reservedVertexCount,b}setGeometryAt(p,m){if(p>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(m);let g=this.geometry,_=g.getIndex()!==null,x=g.getIndex(),y=m.getIndex(),v=this._geometryInfo[p];if(_&&y.count>v.reservedIndexCount||m.attributes.position.count>v.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:b,reservedVertexCount:S}=v;v.vertexCount=m.getAttribute("position").count;for(let M in g.attributes){let E=m.getAttribute(M),w=g.getAttribute(M);n0(E,w,b);let T=E.itemSize;for(let A=E.count,R=S;A<R;A++){let N=b+A;for(let C=0;C<T;C++)w.setComponent(N,C,0)}w.needsUpdate=!0,w.addUpdateRange(b*T,S*T)}if(_){let{indexStart:M,reservedIndexCount:E}=v;v.indexCount=m.getIndex().count;for(let w=0;w<y.count;w++)x.setX(M+w,b+y.getX(w));for(let w=y.count,T=E;w<T;w++)x.setX(M+w,b);x.needsUpdate=!0,x.addUpdateRange(M,v.reservedIndexCount)}if(v.start=_?v.indexStart:v.vertexStart,v.count=_?v.indexCount:v.vertexCount,v.boundingBox=null,m.boundingBox!==null)v.boundingBox=m.boundingBox.clone();if(v.boundingSphere=null,m.boundingSphere!==null)v.boundingSphere=m.boundingSphere.clone();return this._visibilityChanged=!0,p}deleteGeometry(p){let m=this._geometryInfo;if(p>=m.length||m[p].active===!1)return this;let g=this._instanceInfo;for(let _=0,x=g.length;_<x;_++)if(g[_].active&&g[_].geometryIndex===p)this.deleteInstance(_);return m[p].active=!1,this._availableGeometryIds.push(p),this._visibilityChanged=!0,this}deleteInstance(p){return this.validateInstanceId(p),this._instanceInfo[p].active=!1,this._availableInstanceIds.push(p),this._visibilityChanged=!0,this}optimize(){let p=0,m=0,g=this._geometryInfo,_=g.map((y,v)=>v).sort((y,v)=>g[y].vertexStart-g[v].vertexStart),x=this.geometry;for(let y=0,v=g.length;y<v;y++){let b=_[y],S=g[b];if(S.active===!1)continue;if(x.index!==null){if(S.indexStart!==m){let{indexStart:M,vertexStart:E,reservedIndexCount:w}=S,T=x.index,A=T.array,R=p-E;for(let N=M;N<M+w;N++)A[N]=A[N]+R;T.array.copyWithin(m,M,M+w),T.addUpdateRange(m,w),T.needsUpdate=!0,S.indexStart=m}m+=S.reservedIndexCount}if(S.vertexStart!==p){let{vertexStart:M,reservedVertexCount:E}=S,w=x.attributes;for(let T in w){let A=w[T],{array:R,itemSize:N}=A;R.copyWithin(p*N,M*N,(M+E)*N),A.addUpdateRange(p*N,E*N),A.needsUpdate=!0}S.vertexStart=p}p+=S.reservedVertexCount,S.start=x.index?S.indexStart:S.vertexStart}return this._nextIndexStart=m,this._nextVertexStart=p,this._visibilityChanged=!0,this}getBoundingBoxAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingBox===null){let x=new ve,y=g.index,v=g.attributes.position;for(let b=_.start,S=_.start+_.count;b<S;b++){let M=b;if(y)M=y.getX(M);x.expandByPoint(lc.fromBufferAttribute(v,M))}_.boundingBox=x}return m.copy(_.boundingBox),m}getBoundingSphereAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingSphere===null){let x=new Tn;this.getBoundingBoxAt(p,$o),$o.getCenter(x.center);let y=g.index,v=g.attributes.position,b=0;for(let S=_.start,M=_.start+_.count;S<M;S++){let E=S;if(y)E=y.getX(E);lc.fromBufferAttribute(v,E),b=Math.max(b,x.center.distanceToSquared(lc))}x.radius=Math.sqrt(b),_.boundingSphere=x}return m.copy(_.boundingSphere),m}setMatrixAt(p,m){this.validateInstanceId(p);let g=this._matricesTexture,_=this._matricesTexture.image.data;return m.toArray(_,p*16),g.needsUpdate=!0,this}getMatrixAt(p,m){return this.validateInstanceId(p),m.fromArray(this._matricesTexture.image.data,p*16)}setColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)this._initColorsTexture();return m.toArray(this._colorsTexture.image.data,p*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)if(m.isVector4)return m.set(1,1,1,1);else return m.setRGB(1,1,1);else return m.fromArray(this._colorsTexture.image.data,p*4)}setVisibleAt(p,m){if(this.validateInstanceId(p),this._instanceInfo[p].visible===m)return this;return this._instanceInfo[p].visible=m,this._visibilityChanged=!0,this}getVisibleAt(p){return this.validateInstanceId(p),this._instanceInfo[p].visible}setGeometryIdAt(p,m){return this.validateInstanceId(p),this.validateGeometryId(m),this._instanceInfo[p].geometryIndex=m,this._visibilityChanged=!0,this}getGeometryIdAt(p){return this.validateInstanceId(p),this._instanceInfo[p].geometryIndex}getGeometryRangeAt(p,m={}){this.validateGeometryId(p);let g=this._geometryInfo[p];return m.vertexStart=g.vertexStart,m.vertexCount=g.vertexCount,m.reservedVertexCount=g.reservedVertexCount,m.indexStart=g.indexStart,m.indexCount=g.indexCount,m.reservedIndexCount=g.reservedIndexCount,m.start=g.start,m.count=g.count,m}setInstanceCount(p){let m=this._availableInstanceIds,g=this._instanceInfo;m.sort(ac);while(m[m.length-1]===g.length-1)g.pop(),m.pop();if(p<g.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${p} are being used. Cannot shrink instance count.`);let _=new Int32Array(p),x=new Int32Array(p);ni(this._multiDrawCounts,_),ni(this._multiDrawStarts,x),this._multiDrawCounts=_,this._multiDrawStarts=x;let y=new Int32Array(p),v=new Int32Array(p),b=new Int32Array(p);ni(this._mergedDrawCounts,y),ni(this._mergedDrawStarts,v),ni(this._mergedDrawInstanceCounts,b),this._mergedDrawCounts=y,this._mergedDrawStarts=v,this._mergedDrawInstanceCounts=b,this._maxInstanceCount=p;let S=this._indirectTexture,M=this._matricesTexture,E=this._colorsTexture;if(S.dispose(),this._initIndirectTexture(),ni(S.image.data,this._indirectTexture.image.data),M.dispose(),this._initMatricesTexture(),ni(M.image.data,this._matricesTexture.image.data),E)E.dispose(),this._initColorsTexture(),ni(E.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(p,m){let g=[...this._geometryInfo].filter((v)=>v.active);if(Math.max(...g.map((v)=>v.vertexStart+v.reservedVertexCount))>p)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${p}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...g.map((b)=>b.indexStart+b.reservedIndexCount))>m)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${m}. Cannot shrink further.`)}let x=this.geometry;if(x.dispose(),this._maxVertexCount=p,this._maxIndexCount=m,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new $e,this._initializeGeometry(x);let y=this.geometry;if(x.index)ni(x.index.array,y.index.array);for(let v in x.attributes)ni(x.attributes[v].array,y.attributes[v].array);this._visibilityChanged=!0}raycast(p,m){let g=this._instanceInfo,_=this._geometryInfo,x=this.matrixWorld,y=this.geometry;if(_n.material=this.material,_n.geometry.index=y.index,_n.geometry.attributes=y.attributes,_n.geometry.boundingBox===null)_n.geometry.boundingBox=new ve;if(_n.geometry.boundingSphere===null)_n.geometry.boundingSphere=new Tn;for(let v=0,b=g.length;v<b;v++){if(!g[v].visible||!g[v].active)continue;let S=g[v].geometryIndex,M=_[S];_n.geometry.setDrawRange(M.start,M.count),this.getMatrixAt(v,_n.matrixWorld).premultiply(x),this.getBoundingBoxAt(S,_n.geometry.boundingBox),this.getBoundingSphereAt(S,_n.geometry.boundingSphere),_n.raycast(p,Zo);for(let E=0,w=Zo.length;E<w;E++){let T=Zo[E];T.object=this,T.batchId=v,m.push(T)}Zo.length=0}_n.material=null,_n.geometry.index=null,_n.geometry.attributes={},_n.geometry.setDrawRange(0,1/0)}copy(p){if(super.copy(p),this.geometry=p.geometry.clone(),this.perObjectFrustumCulled=p.perObjectFrustumCulled,this.sortObjects=p.sortObjects,this.boundingBox=p.boundingBox!==null?p.boundingBox.clone():null,this.boundingSphere=p.boundingSphere!==null?p.boundingSphere.clone():null,this._geometryInfo=p._geometryInfo.map((m)=>({...m,boundingBox:m.boundingBox!==null?m.boundingBox.clone():null,boundingSphere:m.boundingSphere!==null?m.boundingSphere.clone():null})),this._instanceInfo=p._instanceInfo.map((m)=>({...m})),this._availableInstanceIds=p._availableInstanceIds.slice(),this._availableGeometryIds=p._availableGeometryIds.slice(),this._nextIndexStart=p._nextIndexStart,this._nextVertexStart=p._nextVertexStart,this._geometryCount=p._geometryCount,this._maxInstanceCount=p._maxInstanceCount,this._maxVertexCount=p._maxVertexCount,this._maxIndexCount=p._maxIndexCount,this._geometryInitialized=p._geometryInitialized,this._multiDrawCounts=p._multiDrawCounts.slice(),this._multiDrawStarts=p._multiDrawStarts.slice(),this._multiDrawBytesPerElement=p._multiDrawBytesPerElement,this._mergedDrawCounts=p._mergedDrawCounts.slice(),this._mergedDrawStarts=p._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=p._mergedDrawInstanceCounts.slice(),this._indirectTexture=p._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=p._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),p._colorsTexture!==null)this._colorsTexture=p._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(p,m,g,_="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let x=m.getIndex(),y=x===null?1:x.array.BYTES_PER_ELEMENT,v=1;if(g.wireframe)v=2,y=m.attributes.position.count>65535?4:2;let b=this._instanceInfo,S=this._multiDrawStarts,M=this._multiDrawCounts,E=this._mergedDrawStarts,w=this._mergedDrawCounts,T=this._mergedDrawInstanceCounts,A=this._geometryInfo,R=this.perObjectFrustumCulled,N=this._indirectTexture,C=N.image.data,P=p.isArrayCamera?t0:Q_;if(R)if(p.isArrayCamera)P.setFromArrayCamera(p);else Rn.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse).multiply(this.matrixWorld),P.setFromProjectionMatrix(Rn,p.coordinateSystem,p.reversedDepth);let I=0,U=0;if(this.sortObjects){Rn.copy(this.matrixWorld).invert(),Zd.setFromMatrixPosition(p.matrixWorld).applyMatrix4(Rn),Jd.set(0,0,-1).transformDirection(p.matrixWorld).transformDirection(Rn);for(let z=0,L=b.length;z<L;z++)if(b[z].visible&&b[z].active){let O=b[z].geometryIndex;this.getMatrixAt(z,Rn),this.getBoundingSphereAt(O,as).applyMatrix4(Rn);let H=!1;if(R)H=!P.intersectsSphere(as);if(!H){let V=A[O],G=e0.subVectors(as.center,Zd).dot(Jd);cc.push(V.start,V.count,G,z)}}let D=cc.list,F=this.customSort;if(F===null)D.sort(g.transparent?K_:J_);else F.call(this,D,p);for(let z=0,L=D.length;z<L;z++){let O=D[z],H=O.start*y*v,V=O.count*v;if(_==="merged")if(U>0&&E[U-1]===H&&w[U-1]===V)T[U-1]++;else E[U]=H,w[U]=V,T[U]=1,U++;else S[I]=H,M[I]=V;C[I]=O.index,I++}cc.reset()}else for(let D=0,F=b.length;D<F;D++)if(b[D].visible&&b[D].active){let z=b[D].geometryIndex,L=!1;if(R)this.getMatrixAt(D,Rn),this.getBoundingSphereAt(z,as).applyMatrix4(Rn),L=!P.intersectsSphere(as);if(!L){let O=A[z],H=O.start*y*v,V=O.count*v;if(_==="merged")if(U>0&&E[U-1]===H&&w[U-1]===V)T[U-1]++;else E[U]=H,w[U]=V,T[U]=1,U++;else S[I]=H,M[I]=V;C[I]=D,I++}}N.needsUpdate=!0,this._multiDrawCount=I,this._mergedDrawCount=U,this._multiDrawBytesPerElement=y,this._visibilityChanged=!1}onBeforeRender(p,m,g,_,x){if(p.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(g,_,x)}onBeforeShadow(p,m,g,_,x,y){if(p.isWebGPURenderer!==!0)this._updateDrawParameters(_,x,y)}}class Gi extends Ti{constructor(p){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.linewidth=p.linewidth,this.linecap=p.linecap,this.linejoin=p.linejoin,this.fog=p.fog,this}}var sa=new Y,ra=new Y,Kd=new Kt,Or=new Hi,Jo=new Tn,hc=new Y,jd=new Y;class ps extends Ye{constructor(p=new $e,m=new Gi){super();this.isLine=!0,this.type="Line",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[0];for(let _=1,x=m.count;_<x;_++)sa.fromBufferAttribute(m,_-1),ra.fromBufferAttribute(m,_),g[_]=g[_-1],g[_]+=sa.distanceTo(ra);p.setAttribute("lineDistance",new cn(g,1))}else Xt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Line.threshold,y=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(Jo.copy(g.boundingSphere),Jo.applyMatrix4(_),Jo.radius+=x,p.ray.intersectsSphere(Jo)===!1)return;Kd.copy(_).invert(),Or.copy(p.ray).applyMatrix4(Kd);let v=x/((this.scale.x+this.scale.y+this.scale.z)/3),b=v*v,S=this.isLineSegments?2:1,M=g.index,w=g.attributes.position;if(M!==null){let T=Math.max(0,y.start),A=Math.min(M.count,y.start+y.count);for(let R=T,N=A-1;R<N;R+=S){let C=M.getX(R),P=M.getX(R+1),I=Ko(this,p,Or,b,C,P,R);if(I)m.push(I)}if(this.isLineLoop){let R=M.getX(A-1),N=M.getX(T),C=Ko(this,p,Or,b,R,N,A-1);if(C)m.push(C)}}else{let T=Math.max(0,y.start),A=Math.min(w.count,y.start+y.count);for(let R=T,N=A-1;R<N;R+=S){let C=Ko(this,p,Or,b,R,R+1,R);if(C)m.push(C)}if(this.isLineLoop){let R=Ko(this,p,Or,b,A-1,T,A-1);if(R)m.push(R)}}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}}function Ko(p,m,g,_,x,y,v){let b=p.geometry.attributes.position;if(sa.fromBufferAttribute(b,x),ra.fromBufferAttribute(b,y),g.distanceSqToSegment(sa,ra,hc,jd)>_)return;hc.applyMatrix4(p.matrixWorld);let M=m.ray.origin.distanceTo(hc);if(M<m.near||M>m.far)return;return{distance:M,point:jd.clone().applyMatrix4(p.matrixWorld),index:v,face:null,faceIndex:null,barycoord:null,object:p}}var Qd=new Y,tf=new Y;class wi extends ps{constructor(p,m){super(p,m);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[];for(let _=0,x=m.count;_<x;_+=2)Qd.fromBufferAttribute(m,_),tf.fromBufferAttribute(m,_+1),g[_]=_===0?0:g[_-1],g[_+1]=g[_]+Qd.distanceTo(tf);p.setAttribute("lineDistance",new cn(g,1))}else Xt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ms extends ps{constructor(p,m){super(p,m);this.isLineLoop=!0,this.type="LineLoop"}}class to extends Ti{constructor(p){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new oe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.alphaMap=p.alphaMap,this.size=p.size,this.sizeAttenuation=p.sizeAttenuation,this.fog=p.fog,this}}var ef=new Kt,fc=new Hi,jo=new Tn,Qo=new Y;class gs extends Ye{constructor(p=new $e,m=new to){super();this.isPoints=!0,this.type="Points",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Points.threshold,y=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(jo.copy(g.boundingSphere),jo.applyMatrix4(_),jo.radius+=x,p.ray.intersectsSphere(jo)===!1)return;ef.copy(_).invert(),fc.copy(p.ray).applyMatrix4(ef);let v=x/((this.scale.x+this.scale.y+this.scale.z)/3),b=v*v,S=g.index,E=g.attributes.position;if(S!==null){let w=Math.max(0,y.start),T=Math.min(S.count,y.start+y.count);for(let A=w,R=T;A<R;A++){let N=S.getX(A);Qo.fromBufferAttribute(E,N),nf(Qo,N,b,_,p,m,this)}}else{let w=Math.max(0,y.start),T=Math.min(E.count,y.start+y.count);for(let A=w,R=T;A<R;A++)Qo.fromBufferAttribute(E,A),nf(Qo,A,b,_,p,m,this)}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}}function nf(p,m,g,_,x,y,v){let b=fc.distanceSqToPoint(p);if(b<g){let S=new Y;fc.closestPointToPoint(p,S),S.applyMatrix4(_);let M=x.ray.origin.distanceTo(S);if(M<x.near||M>x.far)return;y.push({distance:M,distanceToRay:Math.sqrt(b),point:S,index:m,face:null,faceIndex:null,barycoord:null,object:v})}}class eo extends ze{constructor(p=[],m,g,_,x,y,v,b,S,M,E,w){super(null,y,v,b,S,M,_,x,E,w);this.isCompressedTexture=!0,this.image={width:m,height:g},this.mipmaps=p,this.flipY=!1,this.generateMipmaps=!1}}class ba extends ze{constructor(p=[],m=301,g,_,x,y,v,b,S,M){super(p,m,g,_,x,y,v,b,S,M);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(p){this.image=p}}class Sa extends ze{constructor(p,m,g,_,x,y,v,b,S){super(p,m,g,_,x,y,v,b,S);this.isCanvasTexture=!0,this.needsUpdate=!0}}class Vi extends ze{constructor(p,m,g=1014,_,x,y,v=1003,b=1003,S,M=1026,E=1){if(M!==1026&&M!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let w={width:p,height:m,depth:E};super(w,_,x,y,v,b,M,g,S);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(p){return super.copy(p),this.source=new Jr(Object.assign({},p.image)),this.compareFunction=p.compareFunction,this}toJSON(p){let m=super.toJSON(p);return m.compareFunction=this.compareFunction,m}}class Ma extends Vi{constructor(p,m=1014,g=301,_,x,y=1003,v=1003,b,S=1026){let M={width:p,height:p,depth:1},E=[M,M,M,M,M,M];super(p,p,m,g,_,x,y,v,b,S);this.image=E,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(p){this.image=p}}class Ea extends ze{constructor(p=null){super();this.sourceTexture=p,this.isExternalTexture=!0}copy(p){return super.copy(p),this.sourceTexture=p.sourceTexture,this}}class sr extends $e{constructor(p=1,m=1,g=1,_=1,x=1,y=1){super();this.type="BoxGeometry",this.parameters={width:p,height:m,depth:g,widthSegments:_,heightSegments:x,depthSegments:y};let v=this;_=Math.floor(_),x=Math.floor(x),y=Math.floor(y);let b=[],S=[],M=[],E=[],w=0,T=0;A("z","y","x",-1,-1,g,m,p,y,x,0),A("z","y","x",1,-1,g,m,-p,y,x,1),A("x","z","y",1,1,p,g,m,_,y,2),A("x","z","y",1,-1,p,g,-m,_,y,3),A("x","y","z",1,-1,p,m,g,_,x,4),A("x","y","z",-1,-1,p,m,-g,_,x,5),this.setIndex(b),this.setAttribute("position",new cn(S,3)),this.setAttribute("normal",new cn(M,3)),this.setAttribute("uv",new cn(E,2));function A(R,N,C,P,I,U,D,F,z,L,O){let H=U/z,V=D/L,G=U/2,W=D/2,J=F/2,X=z+1,Q=L+1,st=0,tt=0,_t=new Y;for(let ot=0;ot<Q;ot++){let ht=ot*V-W;for(let xt=0;xt<X;xt++){let Dt=xt*H-G;_t[R]=Dt*P,_t[N]=ht*I,_t[C]=J,S.push(_t.x,_t.y,_t.z),_t[R]=0,_t[N]=0,_t[C]=F>0?1:-1,M.push(_t.x,_t.y,_t.z),E.push(xt/z),E.push(1-ot/L),st+=1}}for(let ot=0;ot<L;ot++)for(let ht=0;ht<z;ht++){let xt=w+ht+X*ot,Dt=w+ht+X*(ot+1),at=w+(ht+1)+X*(ot+1),mt=w+(ht+1)+X*ot;b.push(xt,Dt,mt),b.push(Dt,at,mt),tt+=6}v.addGroup(T,tt,O),T+=tt,w+=st}}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new sr(p.width,p.height,p.depth,p.widthSegments,p.heightSegments,p.depthSegments)}}class no extends $e{constructor(p=1,m=1,g=1,_=1){super();this.type="PlaneGeometry",this.parameters={width:p,height:m,widthSegments:g,heightSegments:_};let x=p/2,y=m/2,v=Math.floor(g),b=Math.floor(_),S=v+1,M=b+1,E=p/v,w=m/b,T=[],A=[],R=[],N=[];for(let C=0;C<M;C++){let P=C*w-y;for(let I=0;I<S;I++){let U=I*E-x;A.push(U,-P,0),R.push(0,0,1),N.push(I/v),N.push(1-C/b)}}for(let C=0;C<b;C++)for(let P=0;P<v;P++){let I=P+S*C,U=P+S*(C+1),D=P+1+S*(C+1),F=P+1+S*C;T.push(I,U,F),T.push(U,D,F)}this.setIndex(T),this.setAttribute("position",new cn(A,3)),this.setAttribute("normal",new cn(R,3)),this.setAttribute("uv",new cn(N,2))}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new no(p.width,p.height,p.widthSegments,p.heightSegments)}}function _s(p){let m={};for(let g in p){m[g]={};for(let _ in p[g]){let x=p[g][_];if(sf(x))if(x.isRenderTargetTexture)Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),m[g][_]=null;else m[g][_]=x.clone();else if(Array.isArray(x))if(sf(x[0])){let y=[];for(let v=0,b=x.length;v<b;v++)y[v]=x[v].clone();m[g][_]=y}else m[g][_]=x.slice();else m[g][_]=x}}return m}function vn(p){let m={};for(let g=0;g<p.length;g++){let _=_s(p[g]);for(let x in _)m[x]=_[x]}return m}function sf(p){return p&&(p.isColor||p.isMatrix3||p.isMatrix4||p.isVector2||p.isVector3||p.isVector4||p.isTexture||p.isQuaternion)}function i0(p){let m=[];for(let g=0;g<p.length;g++)m.push(p[g].clone());return m}function Sh(p){let m=p.getRenderTarget();if(m===null)return p.outputColorSpace;if(m.isXRRenderTarget===!0)return m.texture.colorSpace;return ce.workingColorSpace}var mp={clone:_s,merge:vn},s0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,r0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ai extends Ti{constructor(p){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=s0,this.fragmentShader=r0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,p!==void 0)this.setValues(p)}copy(p){return super.copy(p),this.fragmentShader=p.fragmentShader,this.vertexShader=p.vertexShader,this.uniforms=_s(p.uniforms),this.uniformsGroups=i0(p.uniformsGroups),this.defines=Object.assign({},p.defines),this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.fog=p.fog,this.lights=p.lights,this.clipping=p.clipping,this.extensions=Object.assign({},p.extensions),this.glslVersion=p.glslVersion,this.defaultAttributeValues=Object.assign({},p.defaultAttributeValues),this.index0AttributeName=p.index0AttributeName,this.uniformsNeedUpdate=p.uniformsNeedUpdate,this}toJSON(p){let m=super.toJSON(p);m.glslVersion=this.glslVersion,m.uniforms={};for(let _ in this.uniforms){let y=this.uniforms[_].value;if(y&&y.isTexture)m.uniforms[_]={type:"t",value:y.toJSON(p).uuid};else if(y&&y.isColor)m.uniforms[_]={type:"c",value:y.getHex()};else if(y&&y.isVector2)m.uniforms[_]={type:"v2",value:y.toArray()};else if(y&&y.isVector3)m.uniforms[_]={type:"v3",value:y.toArray()};else if(y&&y.isVector4)m.uniforms[_]={type:"v4",value:y.toArray()};else if(y&&y.isMatrix3)m.uniforms[_]={type:"m3",value:y.toArray()};else if(y&&y.isMatrix4)m.uniforms[_]={type:"m4",value:y.toArray()};else m.uniforms[_]={value:y}}if(Object.keys(this.defines).length>0)m.defines=this.defines;m.vertexShader=this.vertexShader,m.fragmentShader=this.fragmentShader,m.lights=this.lights,m.clipping=this.clipping;let g={};for(let _ in this.extensions)if(this.extensions[_]===!0)g[_]=!0;if(Object.keys(g).length>0)m.extensions=g;return m}fromJSON(p,m){if(super.fromJSON(p,m),p.uniforms!==void 0)for(let g in p.uniforms){let _=p.uniforms[g];switch(this.uniforms[g]={},_.type){case"t":this.uniforms[g].value=m[_.value]||null;break;case"c":this.uniforms[g].value=new oe().setHex(_.value);break;case"v2":this.uniforms[g].value=new Jt().fromArray(_.value);break;case"v3":this.uniforms[g].value=new Y().fromArray(_.value);break;case"v4":this.uniforms[g].value=new ke().fromArray(_.value);break;case"m3":this.uniforms[g].value=new ee().fromArray(_.value);break;case"m4":this.uniforms[g].value=new Kt().fromArray(_.value);break;default:this.uniforms[g].value=_.value}}if(p.defines!==void 0)this.defines=p.defines;if(p.vertexShader!==void 0)this.vertexShader=p.vertexShader;if(p.fragmentShader!==void 0)this.fragmentShader=p.fragmentShader;if(p.glslVersion!==void 0)this.glslVersion=p.glslVersion;if(p.extensions!==void 0)for(let g in p.extensions)this.extensions[g]=p.extensions[g];if(p.lights!==void 0)this.lights=p.lights;if(p.clipping!==void 0)this.clipping=p.clipping;return this}}class Mh extends Ai{constructor(p){super(p);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ta extends Ti{constructor(p){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Jt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yi,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.emissive.copy(p.emissive),this.emissiveMap=p.emissiveMap,this.emissiveIntensity=p.emissiveIntensity,this.bumpMap=p.bumpMap,this.bumpScale=p.bumpScale,this.normalMap=p.normalMap,this.normalMapType=p.normalMapType,this.normalScale.copy(p.normalScale),this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.envMapIntensity=p.envMapIntensity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.flatShading=p.flatShading,this.fog=p.fog,this}}class Eh extends Ti{constructor(p){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(p)}copy(p){return super.copy(p),this.depthPacking=p.depthPacking,this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this}}class Th extends Ti{constructor(p){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(p)}copy(p){return super.copy(p),this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this}}function zs(p,m){if(!p||p.constructor===m)return p;if(typeof m.BYTES_PER_ELEMENT==="number")return new m(p);return Array.prototype.slice.call(p)}function ta(p){return p!==void 0&&p.inTangents!==void 0&&p.outTangents!==void 0}class xs{constructor(p,m,g,_){this.parameterPositions=p,this._cachedIndex=0,this.resultBuffer=_!==void 0?_:new m.constructor(g),this.sampleValues=m,this.valueSize=g,this.settings=null,this.DefaultSettings_={}}evaluate(p){let m=this.parameterPositions,g=this._cachedIndex,_=m[g],x=m[g-1];n:{t:{let y;e:{i:if(!(p<_)){for(let v=g+2;;){if(_===void 0){if(p<x)break i;return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}if(g===v)break;if(x=_,_=m[++g],p<_)break t}y=m.length;break e}if(!(p>=x)){let v=m[1];if(p<v)g=2,x=v;for(let b=g-2;;){if(x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(g===b)break;if(_=x,x=m[--g-1],p>=x)break t}y=g,g=0;break e}break n}while(g<y){let v=g+y>>>1;if(p<m[v])y=v;else g=v+1}if(_=m[g],x=m[g-1],x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(_===void 0)return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}this._cachedIndex=g,this.intervalChanged_(g,x,_)}return this.interpolate_(g,x,p,_)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(p){let m=this.resultBuffer,g=this.sampleValues,_=this.valueSize,x=p*_;for(let y=0;y!==_;++y)m[y]=g[x+y];return m}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class wh extends xs{constructor(p,m,g,_){super(p,m,g,_);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(p,m,g){let _=this.parameterPositions,x=p-2,y=p+1,v=_[x],b=_[y];if(v===void 0)switch(this.getSettings_().endingStart){case 2401:x=p,v=2*m-g;break;case 2402:x=_.length-2,v=m+_[x]-_[x+1];break;default:x=p,v=g}if(b===void 0)switch(this.getSettings_().endingEnd){case 2401:y=p,b=2*g-m;break;case 2402:y=1,b=g+_[1]-_[0];break;default:y=p-1,b=m}let S=(g-m)*0.5,M=this.valueSize;this._weightPrev=S/(m-v),this._weightNext=S/(b-g),this._offsetPrev=x*M,this._offsetNext=y*M}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=this._offsetPrev,E=this._offsetNext,w=this._weightPrev,T=this._weightNext,A=(g-m)/(_-m),R=A*A,N=R*A,C=-w*N+2*w*R-w*A,P=(1+w)*N+(-1.5-2*w)*R+(-0.5+w)*A+1,I=(-1-T)*N+(1.5+T)*R+0.5*A,U=T*N-T*R;for(let D=0;D!==v;++D)x[D]=C*y[M+D]+P*y[S+D]+I*y[b+D]+U*y[E+D];return x}}class Ah extends xs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=(g-m)/(_-m),E=1-M;for(let w=0;w!==v;++w)x[w]=y[S+w]*E+y[b+w]*M;return x}}class Rh extends xs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p){return this.copySampleValue_(p-1)}}class Ch extends xs{interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=this.inTangents,E=this.outTangents;if(!M||!E){let A=(g-m)/(_-m),R=1-A;for(let N=0;N!==v;++N)x[N]=y[S+N]*R+y[b+N]*A;return x}let w=v*2,T=p-1;for(let A=0;A!==v;++A){let R=y[S+A],N=y[b+A],C=T*w+A*2,P=E[C],I=E[C+1],U=p*w+A*2,D=M[U],F=M[U+1],z=a0(g,m,P,D,_);x[A]=gp(z,R,I,F,N)}return x}}function gp(p,m,g,_,x){let y=1-p;return y*y*y*m+3*y*y*p*g+3*y*p*p*_+p*p*p*x}function o0(p,m,g,_,x){let y=1-p;return 3*y*y*(g-m)+6*y*p*(_-g)+3*p*p*(x-_)}function a0(p,m,g,_,x){let y=(p-m)/(x-m);for(let v=0;v<8;v++){let b=gp(y,m,g,_,x)-p;if(Math.abs(b)<0.0000000001)break;let S=o0(y,m,g,_,x);if(Math.abs(S)<0.0000000001)break;y=Math.max(0,Math.min(1,y-b/S))}return y}class Wn{constructor(p,m,g,_){if(p===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(m===void 0||m.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+p);this.name=p,this.times=zs(m,this.TimeBufferType),this.values=zs(g,this.ValueBufferType),this.setInterpolation(_||this.DefaultInterpolation)}static toJSON(p){let m=p.constructor,g;if(m.toJSON!==this.toJSON)g=m.toJSON(p);else{g={name:p.name,times:zs(p.times,Array),values:zs(p.values,Array)};let _=p.getInterpolation();if(_!==p.DefaultInterpolation)g.interpolation=_;if(ta(p.settings))g.settings={inTangents:zs(p.settings.inTangents,Array),outTangents:zs(p.settings.outTangents,Array)}}return g.type=p.ValueTypeName,g}InterpolantFactoryMethodDiscrete(p){return new Rh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodLinear(p){return new Ah(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodSmooth(p){return new wh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodBezier(p){let m=new Ch(this.times,this.values,this.getValueSize(),p);if(this.settings)m.inTangents=this.settings.inTangents,m.outTangents=this.settings.outTangents;return m}setInterpolation(p){let m;switch(p){case 2300:m=this.InterpolantFactoryMethodDiscrete;break;case 2301:m=this.InterpolantFactoryMethodLinear;break;case 2302:m=this.InterpolantFactoryMethodSmooth;break;case 2303:m=this.InterpolantFactoryMethodBezier;break}if(m===void 0){let g="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(p!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(g);return Xt("KeyframeTrack:",g),this}return this.createInterpolant=m,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(p){if(p!==0){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]+=p;if(ta(this.settings))rf(this.settings.inTangents,p),rf(this.settings.outTangents,p)}return this}scale(p){if(p!==1){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]*=p;if(ta(this.settings))of(this.settings.inTangents,p),of(this.settings.outTangents,p)}return this}trim(p,m){let g=this.times,_=g.length,x=0,y=_-1;while(x!==_&&g[x]<p)++x;while(y!==-1&&g[y]>m)--y;if(++y,x!==0||y!==_){if(x>=y)y=Math.max(y,1),x=y-1;let v=this.getValueSize();this.times=g.slice(x,y),this.values=this.values.slice(x*v,y*v)}return this}validate(){let p=!0,m=this.getValueSize();if(m-Math.floor(m)!==0)$t("KeyframeTrack: Invalid value size in track.",this),p=!1;let g=this.times,_=this.values,x=g.length;if(x===0)$t("KeyframeTrack: Track is empty.",this),p=!1;let y=null;for(let v=0;v!==x;v++){let b=g[v];if(typeof b==="number"&&isNaN(b)){$t("KeyframeTrack: Time is not a valid number.",this,v,b),p=!1;break}if(y!==null&&y>b){$t("KeyframeTrack: Out of order keys.",this,v,b,y),p=!1;break}y=b}if(_!==void 0){if(g_(_))for(let v=0,b=_.length;v!==b;++v){let S=_[v];if(isNaN(S)){$t("KeyframeTrack: Value is not a valid number.",this,v,S),p=!1;break}}}return p}optimize(){let p=this.times.slice(),m=this.values.slice(),g=this.getValueSize(),_=this.getInterpolation()===2302,x=p.length-1,y=1;for(let v=1;v<x;++v){let b=!1,S=p[v],M=p[v+1];if(S!==M&&(v!==1||S!==p[0]))if(!_){let E=v*g,w=E-g,T=E+g;for(let A=0;A!==g;++A){let R=m[E+A];if(R!==m[w+A]||R!==m[T+A]){b=!0;break}}}else b=!0;if(b){if(v!==y){p[y]=p[v];let E=v*g,w=y*g;for(let T=0;T!==g;++T)m[w+T]=m[E+T]}++y}}if(x>0){p[y]=p[x];for(let v=x*g,b=y*g,S=0;S!==g;++S)m[b+S]=m[v+S];++y}if(y!==p.length)this.times=p.slice(0,y),this.values=m.slice(0,y*g);else this.times=p,this.values=m;return this}clone(){let p=this.times.slice(),m=this.values.slice(),_=new this.constructor(this.name,p,m);if(_.createInterpolant=this.createInterpolant,ta(this.settings))_.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return _}}function rf(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]+=m}function of(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]*=m}Wn.prototype.ValueTypeName="";Wn.prototype.TimeBufferType=Float32Array;Wn.prototype.ValueBufferType=Float32Array;Wn.prototype.DefaultInterpolation=2301;class ys extends Wn{constructor(p,m,g){super(p,m,g)}}ys.prototype.ValueTypeName="bool";ys.prototype.ValueBufferType=Array;ys.prototype.DefaultInterpolation=2300;ys.prototype.InterpolantFactoryMethodLinear=void 0;ys.prototype.InterpolantFactoryMethodSmooth=void 0;class Ph extends Wn{constructor(p,m,g,_){super(p,m,g,_)}}Ph.prototype.ValueTypeName="color";class Ih extends Wn{constructor(p,m,g,_){super(p,m,g,_)}}Ih.prototype.ValueTypeName="number";class Lh extends xs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=(g-m)/(_-m),S=p*v;for(let M=S+v;S!==M;S+=4)Ei.slerpFlat(x,0,y,S-v,y,S,b);return x}}class wa extends Wn{constructor(p,m,g,_){super(p,m,g,_)}InterpolantFactoryMethodLinear(p){return new Lh(this.times,this.values,this.getValueSize(),p)}}wa.prototype.ValueTypeName="quaternion";wa.prototype.InterpolantFactoryMethodSmooth=void 0;class vs extends Wn{constructor(p,m,g){super(p,m,g)}}vs.prototype.ValueTypeName="string";vs.prototype.ValueBufferType=Array;vs.prototype.DefaultInterpolation=2300;vs.prototype.InterpolantFactoryMethodLinear=void 0;vs.prototype.InterpolantFactoryMethodSmooth=void 0;class Nh extends Wn{constructor(p,m,g,_){super(p,m,g,_)}}Nh.prototype.ValueTypeName="vector";var pc={enabled:!1,files:{},add:function(p,m){if(this.enabled===!1)return;if(af(p))return;this.files[p]=m},get:function(p){if(this.enabled===!1)return;if(af(p))return;return this.files[p]},remove:function(p){delete this.files[p]},clear:function(){this.files={}}};function af(p){try{let m=p.slice(p.indexOf(":")+1);return new URL(m).protocol==="blob:"}catch(m){return!1}}class Dh{constructor(p,m,g){let _=this,x=!1,y=0,v=0,b=void 0,S=[];this.onStart=void 0,this.onLoad=p,this.onProgress=m,this.onError=g,this._abortController=null,this.itemStart=function(M){if(v++,x===!1){if(_.onStart!==void 0)_.onStart(M,y,v)}x=!0},this.itemEnd=function(M){if(y++,_.onProgress!==void 0)_.onProgress(M,y,v);if(y===v){if(x=!1,_.onLoad!==void 0)_.onLoad()}},this.itemError=function(M){if(_.onError!==void 0)_.onError(M)},this.resolveURL=function(M){if(M=M.normalize("NFC"),b)return b(M);return M},this.setURLModifier=function(M){return b=M,this},this.addHandler=function(M,E){return S.push(M,E),this},this.removeHandler=function(M){let E=S.indexOf(M);if(E!==-1)S.splice(E,2);return this},this.getHandler=function(M){for(let E=0,w=S.length;E<w;E+=2){let T=S[E],A=S[E+1];if(T.global)T.lastIndex=0;if(T.test(M))return A}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var _p=new Dh;class io{constructor(p){if(this.manager=p!==void 0?p:_p,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(p,m){let g=this;return new Promise(function(_,x){g.load(p,_,m,x)})}parse(){}setCrossOrigin(p){return this.crossOrigin=p,this}setWithCredentials(p){return this.withCredentials=p,this}setPath(p){return this.path=p,this}setResourcePath(p){return this.resourcePath=p,this}setRequestHeader(p){return this.requestHeader=p,this}setPriority(p){return this.priority=p,this}setCache(p){return this.cache=p,this}abort(){return this}}io.DEFAULT_MATERIAL_NAME="__DEFAULT";var _i={};class xp extends Error{constructor(p,m){super(p);this.response=m}}class Uh extends io{constructor(p){super(p);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(p,m,g,_){if(p===void 0)p="";if(this.path!==void 0)p=this.path+p;p=this.manager.resolveURL(p);let x=pc.get(`file:${p}`);if(x!==void 0){this.manager.itemStart(p),setTimeout(()=>{if(m)m(x);this.manager.itemEnd(p)},0);return}if(_i[p]!==void 0){_i[p].push({onLoad:m,onProgress:g,onError:_});return}_i[p]=[],_i[p].push({onLoad:m,onProgress:g,onError:_});let y=new Request(p,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),v=this.mimeType,b=this.responseType;fetch(y).then((S)=>{if(S.status===200||S.status===0){if(S.status===0)Xt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||S.body===void 0||S.body.getReader===void 0)return S;let M=_i[p],E=S.body.getReader(),w=S.headers.get("X-File-Size")||S.headers.get("Content-Length"),T=w?parseInt(w):0,A=T!==0,R=0,N=new ReadableStream({start(C){P();function P(){E.read().then(({done:I,value:U})=>{if(I)C.close();else{R+=U.byteLength;let D=new ProgressEvent("progress",{lengthComputable:A,loaded:R,total:T});for(let F=0,z=M.length;F<z;F++){let L=M[F];if(L.onProgress)L.onProgress(D)}C.enqueue(U),P()}},(I)=>{C.error(I)})}}});return new Response(N)}else throw new xp(`fetch for "${S.url}" responded with ${S.status}: ${S.statusText}`,S)}).then((S)=>{switch(b){case"arraybuffer":return S.arrayBuffer();case"blob":return S.blob();case"document":return S.text().then((M)=>new DOMParser().parseFromString(M,v));case"json":return S.json();default:if(v==="")return S.text();else{let E=/charset="?([^;"\s]*)"?/i.exec(v),w=E&&E[1]?E[1].toLowerCase():void 0,T=new TextDecoder(w);return S.arrayBuffer().then((A)=>T.decode(A))}}}).then((S)=>{pc.add(`file:${p}`,S);let M=_i[p];delete _i[p];for(let E=0,w=M.length;E<w;E++){let T=M[E];if(T.onLoad)T.onLoad(S)}}).catch((S)=>{let M=_i[p];if(M===void 0)throw this.manager.itemError(p),S;delete _i[p];for(let E=0,w=M.length;E<w;E++){let T=M[E];if(T.onError)T.onError(S)}this.manager.itemError(p)}).finally(()=>{this.manager.itemEnd(p)}),this.manager.itemStart(p)}setResponseType(p){return this.responseType=p,this}setMimeType(p){return this.mimeType=p,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Aa extends io{constructor(p){super(p)}load(p,m,g,_){let x=this,y=[],v=new eo,b=new Uh(this.manager);b.setPriority(this.priority),b.setCache(this.cache),b.setPath(this.path),b.setResponseType("arraybuffer"),b.setRequestHeader(this.requestHeader),b.setWithCredentials(x.withCredentials);let S=0;function M(E){b.load(p[E],function(w){let T=x.parse(w,!0);if(y[E]={width:T.width,height:T.height,format:T.format,mipmaps:T.mipmaps},S+=1,S===6){if(T.mipmapCount===1)v.minFilter=1006;if(v.image=y,v.format=T.format,v.needsUpdate=!0,m)m(v)}},g,_)}if(Array.isArray(p))for(let E=0,w=p.length;E<w;++E)M(E);else b.load(p,function(E){let w=x.parse(E,!0);if(w.isCubemap){let T=w.mipmaps.length/w.mipmapCount;for(let A=0;A<T;A++){y[A]={mipmaps:[]};for(let R=0;R<w.mipmapCount;R++)y[A].mipmaps.push(w.mipmaps[A*w.mipmapCount+R]),y[A].format=w.format,y[A].width=w.width,y[A].height=w.height}v.image=y}else v.image.width=w.width,v.image.height=w.height,v.mipmaps=w.mipmaps;if(w.mipmapCount===1)v.minFilter=1006;if(v.format=w.format,v.needsUpdate=!0,m)m(v)},g,_);return v}}class Ra extends Ye{static registerNode(p){this.prototype._lightNode=p}constructor(p,m=1){super();this.isLight=!0,this.type="Light",this.color=new oe(p),this.intensity=m}copy(p,m){return super.copy(p,m),this.color.copy(p.color),this.intensity=p.intensity,this}toJSON(p){let m=super.toJSON(p);return m.object.color=this.color.getHex(),m.object.intensity=this.intensity,m}}var uc=new Kt,lf=new Y,cf=new Y;class Oh{constructor(p){this.camera=p,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Jt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Kt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oi,this._frameExtents=new Jt(1,1),this._viewportCount=1,this._viewports=[new ke(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(p){let m=this.camera;lf.setFromMatrixPosition(p.matrixWorld),m.position.copy(lf),cf.setFromMatrixPosition(p.target.matrixWorld),m.lookAt(cf),m.updateMatrixWorld(),this._updateMatrix(m,this.matrix,this._frustum)}_updateMatrix(p,m,g,_){uc.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse),g.setFromProjectionMatrix(uc,p.coordinateSystem,p.reversedDepth);let x=this._frameExtents,y=_?_.z/x.x:1,v=_?_.w/x.y:1,b=_?_.x/x.x:0,S=_?_.y/x.y:0;if(p.coordinateSystem===2001||p.reversedDepth)m.set(0.5*y,0,0,0.5*y+b,0,0.5*v,0,0.5*v+S,0,0,1,0,0,0,0,1);else m.set(0.5*y,0,0,0.5*y+b,0,0.5*v,0,0.5*v+S,0,0,0.5,0.5,0,0,0,1);m.multiply(uc)}getViewport(p){return this._viewports[p]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(p){return this.camera=p.camera.clone(),this.intensity=p.intensity,this.bias=p.bias,this.radius=p.radius,this.autoUpdate=p.autoUpdate,this.needsUpdate=p.needsUpdate,this.normalBias=p.normalBias,this.blurSamples=p.blurSamples,this.mapSize.copy(p.mapSize),this.mapType=p.mapType,this.biasNode=p.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let p={};return p.intensity=this.intensity,p.bias=this.bias,p.normalBias=this.normalBias,p.radius=this.radius,p.blurSamples=this.blurSamples,p.mapSize=this.mapSize.toArray(),p.mapType=this.mapType,p.camera=this.camera.toJSON(!1).object,delete p.camera.matrix,p}}var ea=new Y,na=new Ei,ii=new Y;class Ca extends Ye{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Kt,this.projectionMatrix=new Kt,this.projectionMatrixInverse=new Kt,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(p,m){return super.copy(p,m),this.matrixWorldInverse.copy(p.matrixWorldInverse),this.projectionMatrix.copy(p.projectionMatrix),this.projectionMatrixInverse.copy(p.projectionMatrixInverse),this.coordinateSystem=p.coordinateSystem,this}getWorldDirection(p){return super.getWorldDirection(p).negate()}updateMatrixWorld(p){if(super.updateMatrixWorld(p),this.matrixWorld.decompose(ea,na,ii),ii.x===1&&ii.y===1&&ii.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(ea,na,ii.set(1,1,1)).invert()}updateWorldMatrix(p,m,g=!1){if(super.updateWorldMatrix(p,m,g),this.matrixWorld.decompose(ea,na,ii),ii.x===1&&ii.y===1&&ii.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(ea,na,ii.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Di=new Y,hf=new Jt,uf=new Jt;class Cn extends Ca{constructor(p=50,m=1,g=0.1,_=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=p,this.zoom=1,this.near=g,this.far=_,this.focus=10,this.aspect=m,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.fov=p.fov,this.zoom=p.zoom,this.near=p.near,this.far=p.far,this.focus=p.focus,this.aspect=p.aspect,this.view=p.view===null?null:Object.assign({},p.view),this.filmGauge=p.filmGauge,this.filmOffset=p.filmOffset,this}setFocalLength(p){let m=0.5*this.getFilmHeight()/p;this.fov=$s*2*Math.atan(m),this.updateProjectionMatrix()}getFocalLength(){let p=Math.tan(Br*0.5*this.fov);return 0.5*this.getFilmHeight()/p}getEffectiveFOV(){return $s*2*Math.atan(Math.tan(Br*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(p,m,g){Di.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),m.set(Di.x,Di.y).multiplyScalar(-p/Di.z),Di.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),g.set(Di.x,Di.y).multiplyScalar(-p/Di.z)}getViewSize(p,m){return this.getViewBounds(p,hf,uf),m.subVectors(uf,hf)}setViewOffset(p,m,g,_,x,y){if(this.aspect=p/m,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=y,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=this.near,m=p*Math.tan(Br*0.5*this.fov)/this.zoom,g=2*m,_=this.aspect*g,x=-0.5*_,y=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:b,fullHeight:S}=y;x+=y.offsetX*_/b,m-=y.offsetY*g/S,_*=y.width/b,g*=y.height/S}let v=this.filmOffset;if(v!==0)x+=p*v/this.getFilmWidth();this.projectionMatrix.makePerspective(x,x+_,m,m-g,p,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.fov=this.fov,m.object.zoom=this.zoom,m.object.near=this.near,m.object.far=this.far,m.object.focus=this.focus,m.object.aspect=this.aspect,this.view!==null)m.object.view=Object.assign({},this.view);return m.object.filmGauge=this.filmGauge,m.object.filmOffset=this.filmOffset,m}}class Pa extends Ca{constructor(p=-1,m=1,g=1,_=-1,x=0.1,y=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=p,this.right=m,this.top=g,this.bottom=_,this.near=x,this.far=y,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.left=p.left,this.right=p.right,this.top=p.top,this.bottom=p.bottom,this.near=p.near,this.far=p.far,this.zoom=p.zoom,this.view=p.view===null?null:Object.assign({},p.view),this}setViewOffset(p,m,g,_,x,y){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=y,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=(this.right-this.left)/(2*this.zoom),m=(this.top-this.bottom)/(2*this.zoom),g=(this.right+this.left)/2,_=(this.top+this.bottom)/2,x=g-p,y=g+p,v=_+m,b=_-m;if(this.view!==null&&this.view.enabled){let S=(this.right-this.left)/this.view.fullWidth/this.zoom,M=(this.top-this.bottom)/this.view.fullHeight/this.zoom;x+=S*this.view.offsetX,y=x+S*this.view.width,v-=M*this.view.offsetY,b=v-M*this.view.height}this.projectionMatrix.makeOrthographic(x,y,v,b,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.zoom=this.zoom,m.object.left=this.left,m.object.right=this.right,m.object.top=this.top,m.object.bottom=this.bottom,m.object.near=this.near,m.object.far=this.far,this.view!==null)m.object.view=Object.assign({},this.view);return m}}class yp extends Oh{constructor(){super(new Pa(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class Ia extends Ra{constructor(p,m){super(p,m);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ye.DEFAULT_UP),this.updateMatrix(),this.target=new Ye,this.shadow=new yp}dispose(){super.dispose(),this.shadow.dispose()}copy(p){return super.copy(p),this.target=p.target.clone(),this.shadow=p.shadow.clone(),this}toJSON(p){let m=super.toJSON(p);return m.object.shadow=this.shadow.toJSON(),m.object.target=this.target.uuid,m}}class La extends Ra{constructor(p,m){super(p,m);this.isAmbientLight=!0,this.type="AmbientLight"}}var Hs=-90,Gs=1;class so extends Ye{constructor(p,m,g){super();this.type="CubeCamera",this.renderTarget=g,this.coordinateSystem=null,this.activeMipmapLevel=0;let _=new Cn(Hs,Gs,p,m);_.layers=this.layers,this.add(_);let x=new Cn(Hs,Gs,p,m);x.layers=this.layers,this.add(x);let y=new Cn(Hs,Gs,p,m);y.layers=this.layers,this.add(y);let v=new Cn(Hs,Gs,p,m);v.layers=this.layers,this.add(v);let b=new Cn(Hs,Gs,p,m);b.layers=this.layers,this.add(b);let S=new Cn(Hs,Gs,p,m);S.layers=this.layers,this.add(S)}updateCoordinateSystem(){let p=this.coordinateSystem,m=this.children.concat(),[g,_,x,y,v,b]=m;for(let S of m)this.remove(S);if(p===2000)g.up.set(0,1,0),g.lookAt(1,0,0),_.up.set(0,1,0),_.lookAt(-1,0,0),x.up.set(0,0,-1),x.lookAt(0,1,0),y.up.set(0,0,1),y.lookAt(0,-1,0),v.up.set(0,1,0),v.lookAt(0,0,1),b.up.set(0,1,0),b.lookAt(0,0,-1);else if(p===2001)g.up.set(0,-1,0),g.lookAt(-1,0,0),_.up.set(0,-1,0),_.lookAt(1,0,0),x.up.set(0,0,1),x.lookAt(0,1,0),y.up.set(0,0,-1),y.lookAt(0,-1,0),v.up.set(0,-1,0),v.lookAt(0,0,1),b.up.set(0,-1,0),b.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+p);for(let S of m)this.add(S),S.updateMatrixWorld()}update(p,m){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:g,activeMipmapLevel:_}=this;if(this.coordinateSystem!==p.coordinateSystem)this.coordinateSystem=p.coordinateSystem,this.updateCoordinateSystem();let[x,y,v,b,S,M]=this.children,E=p.getRenderTarget(),w=p.getActiveCubeFace(),T=p.getActiveMipmapLevel(),A=p.xr.enabled;p.xr.enabled=!1;let R=g.texture.mipmapsAutoUpdate;g.texture.mipmapsAutoUpdate=!1;let N=!1;if(p.isWebGLRenderer===!0)N=p.state.buffers.depth.getReversed();else N=p.reversedDepthBuffer;if(p.setRenderTarget(g,0,_),N&&p.autoClear===!1)p.clearDepth();if(p.render(m,x),p.setRenderTarget(g,1,_),N&&p.autoClear===!1)p.clearDepth();if(p.render(m,y),p.setRenderTarget(g,2,_),N&&p.autoClear===!1)p.clearDepth();if(p.render(m,v),p.setRenderTarget(g,3,_),N&&p.autoClear===!1)p.clearDepth();if(p.render(m,b),p.setRenderTarget(g,4,_),N&&p.autoClear===!1)p.clearDepth();if(p.render(m,S),g.texture.mipmapsAutoUpdate=R,p.setRenderTarget(g,5,_),N&&p.autoClear===!1)p.clearDepth();p.render(m,M),p.setRenderTarget(E,w,T),p.xr.enabled=A,g.texture.needsPMREMUpdate=!0}}class Fh extends Cn{constructor(p=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=p,this.perCameraFrustumCulled=!1}}var Bh="\\[\\]\\.:\\/",l0=new RegExp("["+Bh+"]","g"),kh="[^"+Bh+"]",c0="[^"+Bh.replace("\\.","")+"]",h0=/((?:WC+[\/:])*)/.source.replace("WC",kh),u0=/(WCOD+)?/.source.replace("WCOD",c0),d0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",kh),f0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",kh),p0=new RegExp("^"+h0+u0+d0+f0+"$"),m0=["material","materials","bones","map"];class vp{constructor(p,m,g){let _=g||we.parseTrackName(m);this._targetGroup=p,this._bindings=p.subscribe_(m,_)}getValue(p,m){this.bind();let g=this._targetGroup.nCachedObjects_,_=this._bindings[g];if(_!==void 0)_.getValue(p,m)}setValue(p,m){let g=this._bindings;for(let _=this._targetGroup.nCachedObjects_,x=g.length;_!==x;++_)g[_].setValue(p,m)}bind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].bind()}unbind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].unbind()}}class we{constructor(p,m,g){this.path=m,this.parsedPath=g||we.parseTrackName(m),this.node=we.findNode(p,this.parsedPath.nodeName),this.rootNode=p,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(p,m,g){if(!(p&&p.isAnimationObjectGroup))return new we(p,m,g);else return new we.Composite(p,m,g)}static sanitizeNodeName(p){return p.replace(/\s/g,"_").replace(l0,"")}static parseTrackName(p){let m=p0.exec(p);if(m===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+p);let g={nodeName:m[2],objectName:m[3],objectIndex:m[4],propertyName:m[5],propertyIndex:m[6]},_=g.nodeName&&g.nodeName.lastIndexOf(".");if(_!==void 0&&_!==-1){let x=g.nodeName.substring(_+1);if(m0.indexOf(x)!==-1)g.nodeName=g.nodeName.substring(0,_),g.objectName=x}if(g.propertyName===null||g.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+p);return g}static findNode(p,m){if(m===void 0||m===""||m==="."||m===-1||m===p.name||m===p.uuid)return p;if(p.skeleton){let g=p.skeleton.getBoneByName(m);if(g!==void 0)return g}if(p.children){let g=function(x){for(let y=0;y<x.length;y++){let v=x[y];if(v.name===m||v.uuid===m)return v;let b=g(v.children);if(b)return b}return null},_=g(p.children);if(_)return _}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(p,m){p[m]=this.targetObject[this.propertyName]}_getValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)p[m++]=g[_]}_getValue_arrayElement(p,m){p[m]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(p,m){this.resolvedProperty.toArray(p,m)}_setValue_direct(p,m){this.targetObject[this.propertyName]=p[m]}_setValue_direct_setNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++]}_setValue_array_setNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(p,m){this.resolvedProperty[this.propertyIndex]=p[m]}_setValue_arrayElement_setNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(p,m){this.resolvedProperty.fromArray(p,m)}_setValue_fromArray_setNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(p,m){this.bind(),this.getValue(p,m)}_setValue_unbound(p,m){this.bind(),this.setValue(p,m)}bind(){let p=this.node,m=this.parsedPath,{objectName:g,propertyName:_,propertyIndex:x}=m;if(!p)p=we.findNode(this.rootNode,m.nodeName),this.node=p;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!p){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(g){let S=m.objectIndex;switch(g){case"materials":if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.materials){$t("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}p=p.material.materials;break;case"bones":if(!p.skeleton){$t("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}p=p.skeleton.bones;for(let M=0;M<p.length;M++)if(p[M].name===S){S=M;break}break;case"map":if("map"in p){p=p.map;break}if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.map){$t("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}p=p.material.map;break;default:if(p[g]===void 0){$t("PropertyBinding: Can not bind to objectName of node undefined.",this);return}p=p[g]}if(S!==void 0){if(p[S]===void 0){$t("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,p);return}p=p[S]}}let y=p[_];if(y===void 0){let S=m.nodeName;$t("PropertyBinding: Trying to update property for track: "+S+"."+_+" but it wasn't found.",p);return}let v=this.Versioning.None;if(this.targetObject=p,p.isMaterial===!0)v=this.Versioning.NeedsUpdate;else if(p.isObject3D===!0)v=this.Versioning.MatrixWorldNeedsUpdate;let b=this.BindingType.Direct;if(x!==void 0){if(_==="morphTargetInfluences"){if(!p.geometry){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!p.geometry.morphAttributes){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(p.morphTargetDictionary[x]!==void 0)x=p.morphTargetDictionary[x]}b=this.BindingType.ArrayElement,this.resolvedProperty=y,this.propertyIndex=x}else if(y.fromArray!==void 0&&y.toArray!==void 0)b=this.BindingType.HasFromToArray,this.resolvedProperty=y;else if(Array.isArray(y))b=this.BindingType.EntireArray,this.resolvedProperty=y;else this.propertyName=_;this.getValue=this.GetterByBindingType[b],this.setValue=this.SetterByBindingTypeAndVersioning[b][v]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}we.Composite=vp;we.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};we.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};we.prototype.GetterByBindingType=[we.prototype._getValue_direct,we.prototype._getValue_array,we.prototype._getValue_arrayElement,we.prototype._getValue_toArray];we.prototype.SetterByBindingTypeAndVersioning=[[we.prototype._setValue_direct,we.prototype._setValue_direct_setNeedsUpdate,we.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[we.prototype._setValue_array,we.prototype._setValue_array_setNeedsUpdate,we.prototype._setValue_array_setMatrixWorldNeedsUpdate],[we.prototype._setValue_arrayElement,we.prototype._setValue_arrayElement_setNeedsUpdate,we.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[we.prototype._setValue_fromArray,we.prototype._setValue_fromArray_setNeedsUpdate,we.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var jE=new Float32Array(1);var df=new Kt;class ro{constructor(p,m,g=0,_=1/0){this.ray=new Hi(p,m),this.near=g,this.far=_,this.camera=null,this.layers=new Kr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(p,m){this.ray.set(p,m)}setFromCamera(p,m){if(m.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(m.matrixWorld),this.ray.direction.set(p.x,p.y,0.5).unproject(m).sub(this.ray.origin).normalize(),this.camera=m;else if(m.isOrthographicCamera)this.ray.origin.set(p.x,p.y,m.projectionMatrix.elements[14]).unproject(m),this.ray.direction.set(0,0,-1).transformDirection(m.matrixWorld),this.camera=m;else $t("Raycaster: Unsupported camera type: "+m.type)}setFromXRController(p){return df.identity().extractRotation(p.matrixWorld),this.ray.origin.setFromMatrixPosition(p.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(df),this}intersectObject(p,m=!0,g=[]){return mc(p,this,g,m),g.sort(ff),g}intersectObjects(p,m=!0,g=[]){for(let _=0,x=p.length;_<x;_++)mc(p[_],this,g,m);return g.sort(ff),g}}function ff(p,m){return p.distance-m.distance}function mc(p,m,g,_){let x=!0;if(p.layers.test(m.layers)){if(p.raycast(m,g)===!1)x=!1}if(x===!0&&_===!0){let y=p.children;for(let v=0,b=y.length;v<b;v++)mc(y[v],m,g,!0)}}class Na{constructor(p=1,m=0,g=0){this.radius=p,this.phi=m,this.theta=g}set(p,m,g){return this.radius=p,this.phi=m,this.theta=g,this}copy(p){return this.radius=p.radius,this.phi=p.phi,this.theta=p.theta,this}makeSafe(){return this.phi=se(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(p){return this.setFromCartesianCoords(p.x,p.y,p.z)}setFromCartesianCoords(p,m,g){if(this.radius=Math.sqrt(p*p+m*m+g*g),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(p,g),this.phi=Math.acos(se(m/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class bp{static{this.prototype.isMatrix2=!0}constructor(p,m,g,_){if(this.elements=[1,0,0,1],p!==void 0)this.set(p,m,g,_)}identity(){return this.set(1,0,0,1),this}fromArray(p,m=0){for(let g=0;g<4;g++)this.elements[g]=p[g+m];return this}set(p,m,g,_){let x=this.elements;return x[0]=p,x[2]=m,x[1]=g,x[3]=_,this}}var pf=new Y,ia=new Y,Vs=new Y,Ws=new Y,dc=new Y,g0=new Y,_0=new Y;class Pn{constructor(p=new Y,m=new Y){this.start=p,this.end=m}set(p,m){return this.start.copy(p),this.end.copy(m),this}copy(p){return this.start.copy(p.start),this.end.copy(p.end),this}getCenter(p){return p.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(p){return p.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(p,m){return this.delta(m).multiplyScalar(p).add(this.start)}closestPointToPointParameter(p,m){pf.subVectors(p,this.start),ia.subVectors(this.end,this.start);let g=ia.dot(ia);if(g===0)return 0;let x=ia.dot(pf)/g;if(m)x=se(x,0,1);return x}closestPointToPoint(p,m,g){let _=this.closestPointToPointParameter(p,m);return this.delta(g).multiplyScalar(_).add(this.start)}distanceSqToLine3(p,m=g0,g=_0){let x,y,v=this.start,b=p.start,S=this.end,M=p.end;Vs.subVectors(S,v),Ws.subVectors(M,b),dc.subVectors(v,b);let E=Vs.dot(Vs),w=Ws.dot(Ws),T=Ws.dot(dc);if(E<=0.00000000000000010000000000000001&&w<=0.00000000000000010000000000000001)return m.copy(v),g.copy(b),m.distanceToSquared(g);if(E<=0.00000000000000010000000000000001)x=0,y=T/w,y=se(y,0,1);else{let A=Vs.dot(dc);if(w<=0.00000000000000010000000000000001)y=0,x=se(-A/E,0,1);else{let R=Vs.dot(Ws),N=E*w-R*R;if(N!==0)x=se((R*T-A*w)/N,0,1);else x=0;if(y=(R*x+T)/w,y<0)y=0,x=se(-A/E,0,1);else if(y>1)y=1,x=se((R-A)/E,0,1)}}return m.copy(v).addScaledVector(Vs,x),g.copy(b).addScaledVector(Ws,y),m.distanceToSquared(g)}applyMatrix4(p){return this.start.applyMatrix4(p),this.end.applyMatrix4(p),this}equals(p){return p.start.equals(this.start)&&p.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Da extends wi{constructor(p,m=16776960){let g=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),_=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],x=new $e;x.setIndex(new qe(g,1)),x.setAttribute("position",new cn(_,3));super(x,new Gi({color:m,toneMapped:!1}));this.box=p,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(p){let m=this.box;if(m.isEmpty())return;m.getCenter(this.position),m.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(p)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function zh(p,m,g,_){let x=x0(_);switch(g){case 1021:return p*m;case 1028:return p*m/x.components*x.byteLength;case 1029:return p*m/x.components*x.byteLength;case 1030:return p*m*2/x.components*x.byteLength;case 1031:return p*m*2/x.components*x.byteLength;case 1022:return p*m*3/x.components*x.byteLength;case 1023:return p*m*4/x.components*x.byteLength;case 1033:return p*m*4/x.components*x.byteLength;case 33776:case 33777:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 33778:case 33779:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 35841:case 35843:return Math.max(p,16)*Math.max(m,8)/4;case 35840:case 35842:return Math.max(p,8)*Math.max(m,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37808:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37809:return Math.floor((p+4)/5)*Math.floor((m+3)/4)*16;case 37810:return Math.floor((p+4)/5)*Math.floor((m+4)/5)*16;case 37811:return Math.floor((p+5)/6)*Math.floor((m+4)/5)*16;case 37812:return Math.floor((p+5)/6)*Math.floor((m+5)/6)*16;case 37813:return Math.floor((p+7)/8)*Math.floor((m+4)/5)*16;case 37814:return Math.floor((p+7)/8)*Math.floor((m+5)/6)*16;case 37815:return Math.floor((p+7)/8)*Math.floor((m+7)/8)*16;case 37816:return Math.floor((p+9)/10)*Math.floor((m+4)/5)*16;case 37817:return Math.floor((p+9)/10)*Math.floor((m+5)/6)*16;case 37818:return Math.floor((p+9)/10)*Math.floor((m+7)/8)*16;case 37819:return Math.floor((p+9)/10)*Math.floor((m+9)/10)*16;case 37820:return Math.floor((p+11)/12)*Math.floor((m+9)/10)*16;case 37821:return Math.floor((p+11)/12)*Math.floor((m+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(p/4)*Math.ceil(m/4)*16;case 36283:case 36284:return Math.ceil(p/4)*Math.ceil(m/4)*8;case 36285:case 36286:return Math.ceil(p/4)*Math.ceil(m/4)*16}throw Error(`Unable to determine texture byte length for ${g} format.`)}function x0(p){switch(p){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${p}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Xt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function Vp(){let p=null,m=!1,g=null,_=null;function x(y,v){_=p.requestAnimationFrame(x),g(y,v)}return{start:function(){if(m===!0)return;if(g===null)return;if(p===null)return;_=p.requestAnimationFrame(x),m=!0},stop:function(){if(p!==null)p.cancelAnimationFrame(_);m=!1},setAnimationLoop:function(y){g=y},setContext:function(y){p=y}}}function y0(p){let m=new WeakMap;function g(b,S){let{array:M,usage:E}=b,w=M.byteLength,T=p.createBuffer();p.bindBuffer(S,T),p.bufferData(S,M,E),b.onUploadCallback();let A;if(M instanceof Float32Array)A=p.FLOAT;else if(typeof Float16Array<"u"&&M instanceof Float16Array)A=p.HALF_FLOAT;else if(M instanceof Uint16Array)if(b.isFloat16BufferAttribute)A=p.HALF_FLOAT;else A=p.UNSIGNED_SHORT;else if(M instanceof Int16Array)A=p.SHORT;else if(M instanceof Uint32Array)A=p.UNSIGNED_INT;else if(M instanceof Int32Array)A=p.INT;else if(M instanceof Int8Array)A=p.BYTE;else if(M instanceof Uint8Array)A=p.UNSIGNED_BYTE;else if(M instanceof Uint8ClampedArray)A=p.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+M);return{buffer:T,type:A,bytesPerElement:M.BYTES_PER_ELEMENT,version:b.version,size:w}}function _(b,S,M){let{array:E,updateRanges:w}=S;if(p.bindBuffer(M,b),w.length===0)p.bufferSubData(M,0,E);else{w.sort((A,R)=>A.start-R.start);let T=0;for(let A=1;A<w.length;A++){let R=w[T],N=w[A];if(N.start<=R.start+R.count+1)R.count=Math.max(R.count,N.start+N.count-R.start);else++T,w[T]=N}w.length=T+1;for(let A=0,R=w.length;A<R;A++){let N=w[A];p.bufferSubData(M,N.start*E.BYTES_PER_ELEMENT,E,N.start,N.count)}S.clearUpdateRanges()}S.onUploadCallback()}function x(b){if(b.isInterleavedBufferAttribute)b=b.data;return m.get(b)}function y(b){if(b.isInterleavedBufferAttribute)b=b.data;let S=m.get(b);if(S)p.deleteBuffer(S.buffer),m.delete(b)}function v(b,S){if(b.isInterleavedBufferAttribute)b=b.data;if(b.isGLBufferAttribute){let E=m.get(b);if(!E||E.version<b.version)m.set(b,{buffer:b.buffer,type:b.type,bytesPerElement:b.elementSize,version:b.version});return}let M=m.get(b);if(M===void 0)m.set(b,g(b,S));else if(M.version<b.version){if(M.size!==b.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");_(M.buffer,b,S),M.version=b.version}}return{get:x,remove:y,update:v}}var v0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,b0=`#ifdef USE_ALPHAHASH
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
#endif`,S0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,M0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,E0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,T0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,w0=`#ifdef USE_AOMAP
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
#endif`,A0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,R0=`#ifdef USE_BATCHING
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
#endif`,C0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,P0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,I0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,L0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,N0=`#ifdef USE_IRIDESCENCE
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
#endif`,D0=`#ifdef USE_BUMPMAP
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
#endif`,U0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,O0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,F0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,B0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,k0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,z0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,H0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,G0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,V0=`#define PI 3.141592653589793
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
} // validated`,W0=`vec3 transformedNormal = objectNormal;
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
#endif`,X0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,q0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Y0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Z0="gl_FragColor = linearToOutputTexel( gl_FragColor );",J0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,K0=`#ifdef USE_ENVMAP
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
#endif`,j0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Q0=`#ifdef USE_ENVMAP
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
#endif`,tx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ex=`#ifdef USE_ENVMAP
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
#endif`,nx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ix=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,sx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ox=`#ifdef USE_GRADIENTMAP
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
}`,ax=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,hx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,ux=`#ifdef USE_ENVMAP
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
#endif`,dx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,fx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,px=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,mx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,gx=`PhysicalMaterial material;
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
#endif`,_x=`uniform sampler2D dfgLUT;
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
}`,xx=`
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
#endif`,yx=`#if defined( RE_IndirectDiffuse )
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
#endif`,vx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bx=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Sx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Mx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ex=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,wx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ax=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Rx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Cx=`#if defined( USE_POINTS_UV )
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
#endif`,Px=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ix=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Lx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Nx=`#if defined( USE_MORPHCOLORS )
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
#endif`,Dx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ux=`#ifdef USE_MORPHTARGETS
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
#endif`,Ox=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Bx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,kx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Gx=`#ifdef USE_NORMALMAP
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
#endif`,Vx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Wx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Xx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Yx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,$x=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Kx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ty=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ey=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ny=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,iy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,sy=`float getShadowMask() {
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
}`,ry=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,oy=`#ifdef USE_SKINNING
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
#endif`,ay=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ly=`#ifdef USE_SKINNING
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
#endif`,cy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,uy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,dy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,fy=`#ifdef USE_TRANSMISSION
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
#endif`,py=`#ifdef USE_TRANSMISSION
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
#endif`,my=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_y=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var xy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,yy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,vy=`uniform sampler2D t2D;
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
}`,by=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sy=`uniform float backgroundBlurriness;
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
}`,My=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ey=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ty=`#include <common>
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
}`,wy=`#if DEPTH_PACKING == 3200
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
}`,Ay=`#define DISTANCE
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
}`,Ry=`#define DISTANCE
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
}`,Cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Py=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Iy=`uniform float scale;
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
}`,Ly=`uniform vec3 diffuse;
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
}`,Ny=`#include <common>
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
}`,Dy=`uniform vec3 diffuse;
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
}`,Uy=`#define LAMBERT
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
}`,Oy=`#define LAMBERT
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
}`,Fy=`#define MATCAP
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
}`,By=`#define MATCAP
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
}`,ky=`#define NORMAL
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
}`,zy=`#define NORMAL
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
}`,Hy=`#define PHONG
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
}`,Gy=`#define PHONG
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
}`,Vy=`#define STANDARD
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
}`,Wy=`#define STANDARD
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
}`,Xy=`#define TOON
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
}`,qy=`#define TOON
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
}`,Yy=`uniform float size;
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
}`,$y=`uniform vec3 diffuse;
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
}`,Zy=`#include <common>
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
}`,Jy=`uniform vec3 color;
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
}`,Ky=`uniform float rotation;
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
}`,jy=`uniform vec3 diffuse;
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
}`,le={alphahash_fragment:v0,alphahash_pars_fragment:b0,alphamap_fragment:S0,alphamap_pars_fragment:M0,alphatest_fragment:E0,alphatest_pars_fragment:T0,aomap_fragment:w0,aomap_pars_fragment:A0,batching_pars_vertex:R0,batching_vertex:C0,begin_vertex:P0,beginnormal_vertex:I0,bsdfs:L0,iridescence_fragment:N0,bumpmap_pars_fragment:D0,clipping_planes_fragment:U0,clipping_planes_pars_fragment:O0,clipping_planes_pars_vertex:F0,clipping_planes_vertex:B0,color_fragment:k0,color_pars_fragment:z0,color_pars_vertex:H0,color_vertex:G0,common:V0,defaultnormal_vertex:W0,displacementmap_pars_vertex:X0,displacementmap_vertex:q0,emissivemap_fragment:Y0,emissivemap_pars_fragment:$0,colorspace_fragment:Z0,colorspace_pars_fragment:J0,envmap_fragment:K0,envmap_common_pars_fragment:j0,envmap_pars_fragment:Q0,envmap_pars_vertex:tx,envmap_physical_pars_fragment:ux,envmap_vertex:ex,fog_vertex:nx,fog_pars_vertex:ix,fog_fragment:sx,fog_pars_fragment:rx,gradientmap_pars_fragment:ox,lightmap_pars_fragment:ax,lights_lambert_fragment:lx,lights_lambert_pars_fragment:cx,lights_pars_begin:hx,lights_toon_fragment:dx,lights_toon_pars_fragment:fx,lights_phong_fragment:px,lights_phong_pars_fragment:mx,lights_physical_fragment:gx,lights_physical_pars_fragment:_x,lights_fragment_begin:xx,lights_fragment_maps:yx,lights_fragment_end:vx,lightprobes_pars_fragment:bx,logdepthbuf_fragment:Sx,logdepthbuf_pars_fragment:Mx,logdepthbuf_pars_vertex:Ex,logdepthbuf_vertex:Tx,map_fragment:wx,map_pars_fragment:Ax,map_particle_fragment:Rx,map_particle_pars_fragment:Cx,metalnessmap_fragment:Px,metalnessmap_pars_fragment:Ix,morphinstance_vertex:Lx,morphcolor_vertex:Nx,morphnormal_vertex:Dx,morphtarget_pars_vertex:Ux,morphtarget_vertex:Ox,normal_fragment_begin:Fx,normal_fragment_maps:Bx,normal_pars_fragment:kx,normal_pars_vertex:zx,normal_vertex:Hx,normalmap_pars_fragment:Gx,clearcoat_normal_fragment_begin:Vx,clearcoat_normal_fragment_maps:Wx,clearcoat_pars_fragment:Xx,iridescence_pars_fragment:qx,opaque_fragment:Yx,packing:$x,premultiplied_alpha_fragment:Zx,project_vertex:Jx,dithering_fragment:Kx,dithering_pars_fragment:jx,roughnessmap_fragment:Qx,roughnessmap_pars_fragment:ty,shadowmap_pars_fragment:ey,shadowmap_pars_vertex:ny,shadowmap_vertex:iy,shadowmask_pars_fragment:sy,skinbase_vertex:ry,skinning_pars_vertex:oy,skinning_vertex:ay,skinnormal_vertex:ly,specularmap_fragment:cy,specularmap_pars_fragment:hy,tonemapping_fragment:uy,tonemapping_pars_fragment:dy,transmission_fragment:fy,transmission_pars_fragment:py,uv_pars_fragment:my,uv_pars_vertex:gy,uv_vertex:_y,worldpos_vertex:xy,background_vert:yy,background_frag:vy,backgroundCube_vert:by,backgroundCube_frag:Sy,cube_vert:My,cube_frag:Ey,depth_vert:Ty,depth_frag:wy,distance_vert:Ay,distance_frag:Ry,equirect_vert:Cy,equirect_frag:Py,linedashed_vert:Iy,linedashed_frag:Ly,meshbasic_vert:Ny,meshbasic_frag:Dy,meshlambert_vert:Uy,meshlambert_frag:Oy,meshmatcap_vert:Fy,meshmatcap_frag:By,meshnormal_vert:ky,meshnormal_frag:zy,meshphong_vert:Hy,meshphong_frag:Gy,meshphysical_vert:Vy,meshphysical_frag:Wy,meshtoon_vert:Xy,meshtoon_frag:qy,points_vert:Yy,points_frag:$y,shadow_vert:Zy,shadow_frag:Jy,sprite_vert:Ky,sprite_frag:jy},Pt={common:{diffuse:{value:new oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ee}},envmap:{envMap:{value:null},envMapRotation:{value:new ee},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ee}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ee}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ee},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ee},normalScale:{value:new Jt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ee},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ee}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ee}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ee}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0},uvTransform:{value:new ee}},sprite:{diffuse:{value:new oe(16777215)},opacity:{value:1},center:{value:new Jt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ee},alphaMap:{value:null},alphaMapTransform:{value:new ee},alphaTest:{value:0}}},ai={basic:{uniforms:vn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.fog]),vertexShader:le.meshbasic_vert,fragmentShader:le.meshbasic_frag},lambert:{uniforms:vn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},envMapIntensity:{value:1}}]),vertexShader:le.meshlambert_vert,fragmentShader:le.meshlambert_frag},phong:{uniforms:vn([Pt.common,Pt.specularmap,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},specular:{value:new oe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:le.meshphong_vert,fragmentShader:le.meshphong_frag},standard:{uniforms:vn([Pt.common,Pt.envmap,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.roughnessmap,Pt.metalnessmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag},toon:{uniforms:vn([Pt.common,Pt.aomap,Pt.lightmap,Pt.emissivemap,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.gradientmap,Pt.fog,Pt.lights,{emissive:{value:new oe(0)}}]),vertexShader:le.meshtoon_vert,fragmentShader:le.meshtoon_frag},matcap:{uniforms:vn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,Pt.fog,{matcap:{value:null}}]),vertexShader:le.meshmatcap_vert,fragmentShader:le.meshmatcap_frag},points:{uniforms:vn([Pt.points,Pt.fog]),vertexShader:le.points_vert,fragmentShader:le.points_frag},dashed:{uniforms:vn([Pt.common,Pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:le.linedashed_vert,fragmentShader:le.linedashed_frag},depth:{uniforms:vn([Pt.common,Pt.displacementmap]),vertexShader:le.depth_vert,fragmentShader:le.depth_frag},normal:{uniforms:vn([Pt.common,Pt.bumpmap,Pt.normalmap,Pt.displacementmap,{opacity:{value:1}}]),vertexShader:le.meshnormal_vert,fragmentShader:le.meshnormal_frag},sprite:{uniforms:vn([Pt.sprite,Pt.fog]),vertexShader:le.sprite_vert,fragmentShader:le.sprite_frag},background:{uniforms:{uvTransform:{value:new ee},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:le.background_vert,fragmentShader:le.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ee}},vertexShader:le.backgroundCube_vert,fragmentShader:le.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:le.cube_vert,fragmentShader:le.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:le.equirect_vert,fragmentShader:le.equirect_frag},distance:{uniforms:vn([Pt.common,Pt.displacementmap,{referencePosition:{value:new Y},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:le.distance_vert,fragmentShader:le.distance_frag},shadow:{uniforms:vn([Pt.lights,Pt.fog,{color:{value:new oe(0)},opacity:{value:1}}]),vertexShader:le.shadow_vert,fragmentShader:le.shadow_frag}};ai.physical={uniforms:vn([ai.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ee},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ee},clearcoatNormalScale:{value:new Jt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ee},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new ee},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ee},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ee},sheen:{value:0},sheenColor:{value:new oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ee},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ee},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ee},transmissionSamplerSize:{value:new Jt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ee},attenuationDistance:{value:0},attenuationColor:{value:new oe(0)},specularColor:{value:new oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ee},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ee},anisotropyVector:{value:new Jt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ee}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag};var Ua={r:0,b:0,g:0},Qy=new Kt,Wp=new ee;Wp.set(-1,0,0,0,1,0,0,0,1);function tv(p,m,g,_,x,y){let v=new oe(0),b=x===!0?0:1,S,M,E=null,w=0,T=null;function A(I){let U=I.isScene===!0?I.background:null;if(U&&U.isTexture){let D=I.backgroundBlurriness>0;U=m.get(U,D)}return U}function R(I){let U=!1,D=A(I);if(D===null)C(v,b);else if(D&&D.isColor)C(D,1),U=!0;let F=p.xr.getEnvironmentBlendMode();if(F==="additive")g.buffers.color.setClear(0,0,0,1,y);else if(F==="alpha-blend")g.buffers.color.setClear(0,0,0,0,y);if(p.autoClear||U)g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),p.clear(p.autoClearColor,p.autoClearDepth,p.autoClearStencil)}function N(I,U){let D=A(U);if(D&&D.isCubeTexture){if(M===void 0)M=new He(new sr(1,1,1),new Ai({name:"BackgroundCubeMaterial",uniforms:_s(ai.backgroundCube.uniforms),vertexShader:ai.backgroundCube.vertexShader,fragmentShader:ai.backgroundCube.fragmentShader,side:xn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),M.geometry.deleteAttribute("normal"),M.geometry.deleteAttribute("uv"),M.onBeforeRender=function(F,z,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(M.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),_.update(M);if(M.material.uniforms.envMap.value=D,M.material.uniforms.backgroundBlurriness.value=U.backgroundBlurriness,M.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,M.material.uniforms.backgroundRotation.value.setFromMatrix4(Qy.makeRotationFromEuler(U.backgroundRotation)).transpose(),D.isRenderTargetTexture===!1)M.material.uniforms.backgroundRotation.value.premultiply(Wp);if(M.material.toneMapped=ce.getTransfer(D.colorSpace)!==Ie,E!==D||w!==D.version||T!==p.toneMapping)M.material.needsUpdate=!0,E=D,w=D.version,T=p.toneMapping;M.layers.enableAll(),I.unshift(M,M.geometry,M.material,0,0,null)}else if(D&&D.isTexture){if(S===void 0)S=new He(new no(2,2),new Ai({name:"BackgroundMaterial",uniforms:_s(ai.background.uniforms),vertexShader:ai.background.vertexShader,fragmentShader:ai.background.fragmentShader,side:vi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),Object.defineProperty(S.material,"map",{get:function(){return this.uniforms.t2D.value}}),_.update(S);if(S.material.uniforms.t2D.value=D,S.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,S.material.toneMapped=ce.getTransfer(D.colorSpace)!==Ie,D.matrixAutoUpdate===!0)D.updateMatrix();if(S.material.uniforms.uvTransform.value.copy(D.matrix),E!==D||w!==D.version||T!==p.toneMapping)S.material.needsUpdate=!0,E=D,w=D.version,T=p.toneMapping;S.layers.enableAll(),I.unshift(S,S.geometry,S.material,0,0,null)}}function C(I,U){I.getRGB(Ua,Sh(p)),g.buffers.color.setClear(Ua.r,Ua.g,Ua.b,U,y)}function P(){if(M!==void 0)M.geometry.dispose(),M.material.dispose(),M=void 0;if(S!==void 0)S.geometry.dispose(),S.material.dispose(),S=void 0}return{getClearColor:function(){return v},setClearColor:function(I,U=1){v.set(I),b=U,C(v,b)},getClearAlpha:function(){return b},setClearAlpha:function(I){b=I,C(v,b)},render:R,addToRenderList:N,dispose:P}}function ev(p,m){let g=p.getParameter(p.MAX_VERTEX_ATTRIBS),_={},x=T(null),y=x,v=!1;function b(G,W,J,X,Q){let st=!1,tt=w(G,X,J,W);if(y!==tt)y=tt,M(y.object);if(st=A(G,X,J,Q),st)R(G,X,J,Q);if(Q!==null)m.update(Q,p.ELEMENT_ARRAY_BUFFER);if(st||v){if(v=!1,D(G,W,J,X),Q!==null)p.bindBuffer(p.ELEMENT_ARRAY_BUFFER,m.get(Q).buffer)}}function S(){return p.createVertexArray()}function M(G){return p.bindVertexArray(G)}function E(G){return p.deleteVertexArray(G)}function w(G,W,J,X){let Q=X.wireframe===!0,st=_[W.id];if(st===void 0)st={},_[W.id]=st;let tt=G.isInstancedMesh===!0?G.id:0,_t=st[tt];if(_t===void 0)_t={},st[tt]=_t;let ot=_t[J.id];if(ot===void 0)ot={},_t[J.id]=ot;let ht=ot[Q];if(ht===void 0)ht=T(S()),ot[Q]=ht;return ht}function T(G){let W=[],J=[],X=[];for(let Q=0;Q<g;Q++)W[Q]=0,J[Q]=0,X[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:J,attributeDivisors:X,object:G,attributes:{},index:null}}function A(G,W,J,X){let Q=y.attributes,st=W.attributes,tt=0,_t=J.getAttributes();for(let ot in _t)if(_t[ot].location>=0){let xt=Q[ot],Dt=st[ot];if(Dt===void 0){if(ot==="instanceMatrix"&&G.instanceMatrix)Dt=G.instanceMatrix;if(ot==="instanceColor"&&G.instanceColor)Dt=G.instanceColor}if(xt===void 0)return!0;if(xt.attribute!==Dt)return!0;if(Dt&&xt.data!==Dt.data)return!0;tt++}if(y.attributesNum!==tt)return!0;if(y.index!==X)return!0;return!1}function R(G,W,J,X){let Q={},st=W.attributes,tt=0,_t=J.getAttributes();for(let ot in _t)if(_t[ot].location>=0){let xt=st[ot];if(xt===void 0){if(ot==="instanceMatrix"&&G.instanceMatrix)xt=G.instanceMatrix;if(ot==="instanceColor"&&G.instanceColor)xt=G.instanceColor}let Dt={};if(Dt.attribute=xt,xt&&xt.data)Dt.data=xt.data;Q[ot]=Dt,tt++}y.attributes=Q,y.attributesNum=tt,y.index=X}function N(){let G=y.newAttributes;for(let W=0,J=G.length;W<J;W++)G[W]=0}function C(G){P(G,0)}function P(G,W){let J=y.newAttributes,X=y.enabledAttributes,Q=y.attributeDivisors;if(J[G]=1,X[G]===0)p.enableVertexAttribArray(G),X[G]=1;if(Q[G]!==W)p.vertexAttribDivisor(G,W),Q[G]=W}function I(){let G=y.newAttributes,W=y.enabledAttributes;for(let J=0,X=W.length;J<X;J++)if(W[J]!==G[J])p.disableVertexAttribArray(J),W[J]=0}function U(G,W,J,X,Q,st,tt){if(tt===!0)p.vertexAttribIPointer(G,W,J,Q,st);else p.vertexAttribPointer(G,W,J,X,Q,st)}function D(G,W,J,X){N();let Q=X.attributes,st=J.getAttributes(),tt=W.defaultAttributeValues;for(let _t in st){let ot=st[_t];if(ot.location>=0){let ht=Q[_t];if(ht===void 0){if(_t==="instanceMatrix"&&G.instanceMatrix)ht=G.instanceMatrix;if(_t==="instanceColor"&&G.instanceColor)ht=G.instanceColor}if(ht!==void 0){let xt=ht.normalized,Dt=ht.itemSize,at=m.get(ht);if(at===void 0)continue;let{buffer:mt,type:Ct,bytesPerElement:Ut}=at,Ht=Ct===p.INT||Ct===p.UNSIGNED_INT||ht.gpuType===Rc;if(ht.isInterleavedBufferAttribute){let Et=ht.data,re=Et.isInterleavedBuffer===!0?Et.stride:Et.itemSize,te=ht.offset;if(Et.isInstancedInterleavedBuffer||Et.isInstancedBufferAttribute){for(let Ft=0;Ft<ot.locationSize;Ft++)P(ot.location+Ft,Et.meshPerAttribute);if(G.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=Et.meshPerAttribute*Et.count}else for(let Ft=0;Ft<ot.locationSize;Ft++)C(ot.location+Ft);p.bindBuffer(p.ARRAY_BUFFER,mt);for(let Ft=0;Ft<ot.locationSize;Ft++)U(ot.location+Ft,Dt/ot.locationSize,Ct,xt,re*Ut,(te+Dt/ot.locationSize*Ft)*Ut,Ht)}else{if(ht.isInstancedBufferAttribute){for(let Et=0;Et<ot.locationSize;Et++)P(ot.location+Et,ht.meshPerAttribute);if(G.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=ht.meshPerAttribute*ht.count}else for(let Et=0;Et<ot.locationSize;Et++)C(ot.location+Et);p.bindBuffer(p.ARRAY_BUFFER,mt);for(let Et=0;Et<ot.locationSize;Et++)U(ot.location+Et,Dt/ot.locationSize,Ct,xt,Dt*Ut,Dt/ot.locationSize*Et*Ut,Ht)}}else if(tt!==void 0){let xt=tt[_t];if(xt!==void 0)switch(xt.length){case 2:p.vertexAttrib2fv(ot.location,xt);break;case 3:p.vertexAttrib3fv(ot.location,xt);break;case 4:p.vertexAttrib4fv(ot.location,xt);break;default:p.vertexAttrib1fv(ot.location,xt)}}}}I()}function F(){H();for(let G in _){let W=_[G];for(let J in W){let X=W[J];for(let Q in X){let st=X[Q];for(let tt in st)E(st[tt].object),delete st[tt];delete X[Q]}}delete _[G]}}function z(G){if(_[G.id]===void 0)return;let W=_[G.id];for(let J in W){let X=W[J];for(let Q in X){let st=X[Q];for(let tt in st)E(st[tt].object),delete st[tt];delete X[Q]}}delete _[G.id]}function L(G){for(let W in _){let J=_[W];for(let X in J){let Q=J[X];if(Q[G.id]===void 0)continue;let st=Q[G.id];for(let tt in st)E(st[tt].object),delete st[tt];delete Q[G.id]}}}function O(G){for(let W in _){let J=_[W],X=G.isInstancedMesh===!0?G.id:0,Q=J[X];if(Q===void 0)continue;for(let st in Q){let tt=Q[st];for(let _t in tt)E(tt[_t].object),delete tt[_t];delete Q[st]}if(delete J[X],Object.keys(J).length===0)delete _[W]}}function H(){if(V(),v=!0,y===x)return;y=x,M(y.object)}function V(){x.geometry=null,x.program=null,x.wireframe=!1}return{setup:b,reset:H,resetDefaultState:V,dispose:F,releaseStatesOfGeometry:z,releaseStatesOfObject:O,releaseStatesOfProgram:L,initAttributes:N,enableAttribute:C,disableUnusedAttributes:I}}function nv(p,m,g){let _;function x(S){_=S}function y(S,M){p.drawArrays(_,S,M),g.update(M,_,1)}function v(S,M,E){if(E===0)return;p.drawArraysInstanced(_,S,M,E),g.update(M,_,E)}function b(S,M,E){if(E===0)return;m.get("WEBGL_multi_draw").multiDrawArraysWEBGL(_,S,0,M,0,E);let T=0;for(let A=0;A<E;A++)T+=M[A];g.update(T,_,1)}this.setMode=x,this.render=y,this.renderInstances=v,this.renderMultiDraw=b}function iv(p,m,g,_){let x;function y(){if(x!==void 0)return x;if(m.has("EXT_texture_filter_anisotropic")===!0){let L=m.get("EXT_texture_filter_anisotropic");x=p.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else x=0;return x}function v(L){if(L!==Gn&&_.convert(L)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function b(L){let O=L===ri&&(m.has("EXT_color_buffer_half_float")||m.has("EXT_color_buffer_float"));if(L!==jn&&L!==bi&&!O&&_.convert(L)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function S(L){if(L==="highp"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.HIGH_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.HIGH_FLOAT).precision>0)return"highp";L="mediump"}if(L==="mediump"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.MEDIUM_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let M=g.precision!==void 0?g.precision:"highp",E=S(M);if(E!==M)Xt("WebGLRenderer:",M,"not supported, using",E,"instead."),M=E;let w=g.reversedDepthBuffer===!0&&m.has("EXT_clip_control"),T=g.logarithmicDepthBuffer===!0&&w===!1;if(g.reversedDepthBuffer===!0&&w===!1)Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(g.logarithmicDepthBuffer===!0&&w===!0)Xt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let A=p.getParameter(p.MAX_TEXTURE_IMAGE_UNITS),R=p.getParameter(p.MAX_VERTEX_TEXTURE_IMAGE_UNITS),N=p.getParameter(p.MAX_TEXTURE_SIZE),C=p.getParameter(p.MAX_CUBE_MAP_TEXTURE_SIZE),P=p.getParameter(p.MAX_VERTEX_ATTRIBS),I=p.getParameter(p.MAX_VERTEX_UNIFORM_VECTORS),U=p.getParameter(p.MAX_VARYING_VECTORS),D=p.getParameter(p.MAX_FRAGMENT_UNIFORM_VECTORS),F=p.getParameter(p.MAX_SAMPLES),z=p.getParameter(p.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:y,getMaxPrecision:S,textureFormatReadable:v,textureTypeReadable:b,precision:M,logarithmicDepthBuffer:T,reversedDepthBuffer:w,maxTextures:A,maxVertexTextures:R,maxTextureSize:N,maxCubemapSize:C,maxAttributes:P,maxVertexUniforms:I,maxVaryings:U,maxFragmentUniforms:D,maxSamples:F,samples:z}}function sv(p){let m=this,g=null,_=0,x=!1,y=!1,v=new ln,b=new ee,S={value:null,needsUpdate:!1};this.uniform=S,this.numPlanes=0,this.numIntersection=0,this.init=function(w,T){let A=w.length!==0||T||_!==0||x;return x=T,_=w.length,A},this.beginShadows=function(){y=!0,E(null)},this.endShadows=function(){y=!1},this.setGlobalState=function(w,T){g=E(w,T,0)},this.setState=function(w,T,A){let{clippingPlanes:R,clipIntersection:N,clipShadows:C}=w,P=p.get(w);if(!x||R===null||R.length===0||y&&!C)if(y)E(null);else M();else{let I=y?0:_,U=I*4,D=P.clippingState||null;S.value=D,D=E(R,T,U,A);for(let F=0;F!==U;++F)D[F]=g[F];P.clippingState=D,this.numIntersection=N?this.numPlanes:0,this.numPlanes+=I}};function M(){if(S.value!==g)S.value=g,S.needsUpdate=_>0;m.numPlanes=_,m.numIntersection=0}function E(w,T,A,R){let N=w!==null?w.length:0,C=null;if(N!==0){if(C=S.value,R!==!0||C===null){let P=A+N*4,I=T.matrixWorldInverse;if(b.getNormalMatrix(I),C===null||C.length<P)C=new Float32Array(P);for(let U=0,D=A;U!==N;++U,D+=4)v.copy(w[U]).applyMatrix4(I,b),v.normal.toArray(C,D),C[D+3]=v.constant}S.value=C,S.needsUpdate=!0}return m.numPlanes=N,m.numIntersection=0,C}}class Ba extends Vn{constructor(p=1,m={}){super(p,p,m);this.isWebGLCubeRenderTarget=!0;let g={width:p,height:p,depth:1},_=[g,g,g,g,g,g];this.texture=new ba(_),this._setTextureOptions(m),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(p,m){this.texture.type=m.type,this.texture.colorSpace=m.colorSpace,this.texture.generateMipmaps=m.generateMipmaps,this.texture.minFilter=m.minFilter,this.texture.magFilter=m.magFilter;let g={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},_=new sr(5,5,5),x=new Ai({name:"CubemapFromEquirect",uniforms:_s(g.uniforms),vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,side:xn,blending:cs});x.uniforms.tEquirect.value=m;let y=new He(_,x),v=m.minFilter;if(m.minFilter===Kn)m.minFilter=yn;return new so(1,10,this).update(p,y),m.minFilter=v,y.geometry.dispose(),y.material.dispose(),this}clear(p,m=!0,g=!0,_=!0){let x=p.getRenderTarget();for(let y=0;y<6;y++)p.setRenderTarget(this,y),p.clear(m,g,_);p.setRenderTarget(x)}}var Sp=256,rv=3,ov=20,Xp=256,qp=16,av=3,lv=new Y,cv=new oe;class Fa{constructor(p){this._renderer=p,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new so(1,10,null),this._boxMesh=new He(new sr(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(p,m=0,g=0.1,_=100,x={}){let{size:y=256,position:v=lv}=x,b=this._renderer;this._setSize(y);let S=this._allocateTarget(),M=this._getSourceTarget(!0);if(m>0)M.texture.mipmapsAutoUpdate=!1;let{autoClear:E,autoClearColor:w,autoClearDepth:T,autoClearStencil:A}=b,R=p.background;if(b.autoClear=!0,b.autoClearColor=!0,b.autoClearDepth=!0,b.autoClearStencil=!0,R===null)p.background=b.getClearColor(cv);let N=new so(g,_,M);if(N.position.copy(v),N.update(b,p),b.autoClear=E,b.autoClearColor=w,b.autoClearDepth=T,b.autoClearStencil=A,p.background=R,m>0)M.texture.mipmapsAutoUpdate=!0,this._blur(S,m);return this._applyPMREM(S),S}fromEquirectangular(p,m=null){return this._fromTexture(p,m)}fromCubemap(p,m=null){return this._fromTexture(p,m)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Tp(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Ep(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(p,m){return m>0?1-Math.sqrt(1-p/m):0}_setSize(p){this._cubeSize=Math.max(Sp,gh(p))}_fromTexture(p,m){if(p.mapping===Wr||p.mapping===Ks)this._setSize(p.image.length===0?Sp:p.image[0].width||p.image[0].image.width);else this._setSize(p.image.width/4);let g=m||this._allocateTarget();return this._textureToCubemap(p),this._applyPMREM(g),g}_allocateTarget(){let p=this._cubeSize,m=Mp(p,!1,!1),g=Math.log2(p)-rv;for(let _=0;_<=g;_++)m.texture.mipmaps.push({width:p>>_,height:p>>_});return m.texture.name="PMREM",m.texture.isPMREMTexture=!0,m}_getSourceTarget(p=!1){let m=this._cubeSize,g=this._sourceTarget;if(g===null||g.width!==m||p&&g.depthBuffer===!1){if(g!==null)g.dispose();this._sourceTarget=Mp(m,!0,p)}return this._sourceTarget}_compileMaterial(p){this._boxMesh.material=p,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(p,m,g){let _=this._boxMesh,x=this._cubeCamera;_.material=g,x.renderTarget=p,x.activeMipmapLevel=m;let y=p.width>>m;p.viewport.set(0,0,y,y),x.update(this._renderer,_),p.viewport.set(0,0,p.width,p.height)}_textureToCubemap(p){let m;if(p.mapping===Wr||p.mapping===Ks){if(this._cubemapMaterial===null)this._cubemapMaterial=Tp();m=this._cubemapMaterial,m.uniforms.flipEnvMap.value=p.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Ep();m=this._equirectMaterial}m.uniforms.envMap.value=p,this._renderCube(this._getSourceTarget(),0,m)}_applyPMREM(p){if(this._ggxMaterial===null)this._ggxMaterial=hv(),this._integrationMaterial=uv();let m=this._cubeSize,g=p.texture.mipmaps.length-1,_=this._ggxMaterial.uniforms;_.envMap.value=this._sourceTarget.texture;let x=this._integrationMaterial.uniforms;x.envMap.value=this._sourceTarget.texture,x.sourceLod.value=Math.log2(m/qp);for(let y=0;y<=g;y++){let v=Fa.lodToRoughness(y,g);if(y>g-av)x.roughness.value=v,this._renderCube(p,y,this._integrationMaterial);else{let b=v>0?Math.log2(m)+0.5*Math.log2(6/(Xp*Math.pow(v,4)))+0.5:0;_.roughness.value=v,_.lodBias.value=b,this._renderCube(p,y,this._ggxMaterial)}}}_blur(p,m){if(this._blurMaterial===null)this._blurMaterial=dv();let g=this._blurMaterial,_=g.uniforms,x=this._sourceTarget;_.sigma.value=Math.min(m,Math.PI)/Math.SQRT2,_.envMap.value=x.texture,this._renderCube(p,0,g),_.envMap.value=p.texture,this._renderCube(x,0,g)}}function Mp(p,m,g){return new Ba(p,{minFilter:Kn,generateMipmaps:m,type:ri,colorSpace:lh,depthBuffer:g})}function co(p,m,g){return new Ai({name:p,uniforms:m,vertexShader:le.cube_vert,fragmentShader:g,side:xn,blending:cs,depthTest:!1,depthWrite:!1})}function hv(){return co("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Xp}u

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
	`)}function uv(){return co("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:qp}},`

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
	`)}function dv(){return co("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ov}
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
	`)}function Ep(){return co("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Tp(){return co("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function fv(p){let m=new WeakMap,g=new WeakMap,_=null;function x(T,A=!1){if(T===null||T===void 0)return null;if(A)return v(T);return y(T)}function y(T){if(T&&T.isTexture){let A=T.mapping;if(A===oa||A===aa)if(m.has(T)){let R=m.get(T).texture;return b(R,T.mapping)}else{let R=T.image;if(R&&R.height>0){let N=new Ba(R.height);return N.fromEquirectangularTexture(p,T),m.set(T,N),T.addEventListener("dispose",M),b(N.texture,T.mapping)}else return null}}return T}function v(T){if(T&&T.isTexture&&T.isPMREMTexture!==!0){let A=T.mapping,R=A===oa||A===aa,N=A===Wr||A===Ks;if(R||N){let C=g.get(T),P=C!==void 0?C.texture.pmremVersion:0;if(T.isRenderTargetTexture&&T.pmremVersion!==P){if(_===null)_=new Fa(p);return C=R?_.fromEquirectangular(T,C):_.fromCubemap(T,C),C.texture.pmremVersion=T.pmremVersion,g.set(T,C),C.texture}else if(C!==void 0)return C.texture;else{let I=T.image;if(R&&I&&I.height>0||N&&I&&S(I)){if(_===null)_=new Fa(p);return C=R?_.fromEquirectangular(T):_.fromCubemap(T),C.texture.pmremVersion=T.pmremVersion,g.set(T,C),T.addEventListener("dispose",E),C.texture}else return null}}}return T}function b(T,A){if(A===oa)T.mapping=Wr;else if(A===aa)T.mapping=Ks;return T}function S(T){let A=0,R=6;for(let N=0;N<R;N++)if(T[N]!==void 0)A++;return A===R}function M(T){let A=T.target;A.removeEventListener("dispose",M);let R=m.get(A);if(R!==void 0)m.delete(A),R.dispose()}function E(T){let A=T.target;A.removeEventListener("dispose",E);let R=g.get(A);if(R!==void 0)g.delete(A),R.dispose()}function w(){if(m=new WeakMap,g=new WeakMap,_!==null)_.dispose(),_=null}return{get:x,dispose:w}}function pv(p){let m={};function g(_){if(m[_]!==void 0)return m[_];let x=p.getExtension(_);return m[_]=x,x}return{has:function(_){return g(_)!==null},init:function(){g("EXT_color_buffer_float"),g("WEBGL_clip_cull_distance"),g("OES_texture_float_linear"),g("EXT_color_buffer_half_float"),g("WEBGL_multisampled_render_to_texture"),g("WEBGL_render_shared_exponent")},get:function(_){let x=g(_);if(x===null)Fr("WebGLRenderer: "+_+" extension not supported.");return x}}}function mv(p,m,g,_){let x={},y=new WeakMap,v=new FinalizationRegistry((R)=>delete x[R]);function b(R){S(R.target)}function S(R){if(R.index!==null)m.remove(R.index);for(let C in R.attributes)m.remove(R.attributes[C]);R.removeEventListener("dispose",b),delete x[R.id],v.unregister(R);let N=y.get(R);if(N)m.remove(N),y.delete(R);if(_.releaseStatesOfGeometry(R),R.isInstancedBufferGeometry===!0)delete R._maxInstanceCount;g.memory.geometries--}function M(R,N){if(x[N.id]!==void 0)return N;return N.addEventListener("dispose",b),x[N.id]=new WeakRef(N),v.register(N,N.id,N),g.memory.geometries++,N}function E(R){let N=R.attributes;for(let C in N)m.update(N[C],p.ARRAY_BUFFER)}function w(R){let N=R.index,C=R.attributes.position,P=0;if(C===void 0)return;let I=N!==null?N.array.length:C.array.length/3-1,D=new(C.count>=65535?xa:_a)(Math.ceil(I/3)*6,1),F=D.array;if(N!==null){let L=N.array;P=N.version;for(let O=0,H=0;O<I;O+=3){let V=L[O+0],G=L[O+1],W=L[O+2];F[H++]=V,F[H++]=G,F[H++]=G,F[H++]=W,F[H++]=W,F[H++]=V}}else{P=C.version;for(let L=0,O=0;L<I;L+=3){let H=L+0,V=L+1,G=L+2;F[O++]=H,F[O++]=V,F[O++]=V,F[O++]=G,F[O++]=G,F[O++]=H}}D.version=P;let z=y.get(R);if(z)m.remove(z);y.set(R,D)}function T(R){let N=y.get(R);if(N){let C=R.index;if(C!==null){if(N.version<C.version)w(R)}}else w(R);return y.get(R)}function A(){for(let R in x){let N=x[R].deref();if(N!==void 0)S(N)}}return{get:M,update:E,getWireframeAttribute:T,dispose:A}}function gv(p,m,g){let _;function x(w){_=w}let y,v;function b(w){y=w.type,v=w.bytesPerElement}function S(w,T){p.drawElements(_,T,y,w*v),g.update(T,_,1)}function M(w,T,A){if(A===0)return;p.drawElementsInstanced(_,T,y,w*v,A),g.update(T,_,A)}function E(w,T,A){if(A===0)return;m.get("WEBGL_multi_draw").multiDrawElementsWEBGL(_,T,0,y,w,0,A);let N=0;for(let C=0;C<A;C++)N+=T[C];g.update(N,_,1)}this.setMode=x,this.setIndex=b,this.render=S,this.renderInstances=M,this.renderMultiDraw=E}function _v(p){let m={geometries:0,textures:0},g={frame:0,calls:0,triangles:0,points:0,lines:0};function _(y,v,b){switch(g.calls++,v){case p.TRIANGLES:g.triangles+=b*(y/3);break;case p.LINES:g.lines+=b*(y/2);break;case p.LINE_STRIP:g.lines+=b*(y-1);break;case p.LINE_LOOP:g.lines+=b*y;break;case p.POINTS:g.points+=b*y;break;default:$t("WebGLInfo: Unknown draw mode:",v);break}}function x(){g.calls=0,g.triangles=0,g.points=0,g.lines=0}return{memory:m,render:g,programs:null,autoReset:!0,reset:x,update:_}}function xv(p,m,g){let _=new WeakMap,x=new ke;function y(v,b,S){let M=v.morphTargetInfluences,E=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,w=E!==void 0?E.length:0,T=_.get(b);if(T===void 0||T.count!==w){let H=function(){L.dispose(),_.delete(b),b.removeEventListener("dispose",H)};if(T!==void 0)T.texture.dispose();let A=b.morphAttributes.position!==void 0,R=b.morphAttributes.normal!==void 0,N=b.morphAttributes.color!==void 0,C=b.morphAttributes.position||[],P=b.morphAttributes.normal||[],I=b.morphAttributes.color||[],U=0;if(A===!0)U=1;if(R===!0)U=2;if(N===!0)U=3;let D=b.attributes.position.count*U,F=1;if(D>m.maxTextureSize)F=Math.ceil(D/m.maxTextureSize),D=m.maxTextureSize;let z=new Float32Array(D*F*4*w),L=new ma(z,D,F,w);L.type=bi,L.needsUpdate=!0;let O=U*4;for(let V=0;V<w;V++){let G=C[V],W=P[V],J=I[V],X=D*F*4*V;for(let Q=0;Q<G.count;Q++){let st=Q*O;if(A===!0)x.fromBufferAttribute(G,Q),z[X+st+0]=x.x,z[X+st+1]=x.y,z[X+st+2]=x.z,z[X+st+3]=0;if(R===!0)x.fromBufferAttribute(W,Q),z[X+st+4]=x.x,z[X+st+5]=x.y,z[X+st+6]=x.z,z[X+st+7]=0;if(N===!0)x.fromBufferAttribute(J,Q),z[X+st+8]=x.x,z[X+st+9]=x.y,z[X+st+10]=x.z,z[X+st+11]=J.itemSize===4?x.w:1}}T={count:w,texture:L,size:new Jt(D,F)},_.set(b,T),b.addEventListener("dispose",H)}if(v.isInstancedMesh===!0&&v.morphTexture!==null)S.getUniforms().setValue(p,"morphTexture",v.morphTexture,g);else{let A=0;for(let N=0;N<M.length;N++)A+=M[N];let R=b.morphTargetsRelative?1:1-A;S.getUniforms().setValue(p,"morphTargetBaseInfluence",R),S.getUniforms().setValue(p,"morphTargetInfluences",M)}S.getUniforms().setValue(p,"morphTargetsTexture",T.texture,g),S.getUniforms().setValue(p,"morphTargetsTextureSize",T.size)}return{update:y}}function yv(p,m,g,_,x){let y=new WeakMap;function v(M){let E=x.render.frame,w=M.geometry,T=m.get(M,w);if(y.get(T)!==E)m.update(T),y.set(T,E);if(M.isInstancedMesh){if(M.hasEventListener("dispose",S)===!1)M.addEventListener("dispose",S);if(y.get(M)!==E){if(g.update(M.instanceMatrix,p.ARRAY_BUFFER),M.instanceColor!==null)g.update(M.instanceColor,p.ARRAY_BUFFER);y.set(M,E)}}if(M.isSkinnedMesh){let A=M.skeleton;if(y.get(A)!==E)A.update(),y.set(A,E)}return T}function b(){y=new WeakMap}function S(M){let E=M.target;if(E.removeEventListener("dispose",S),_.releaseStatesOfObject(E),g.remove(E.instanceMatrix),E.instanceColor!==null)g.remove(E.instanceColor)}return{update:v,dispose:b}}var vv={[bc]:"LINEAR_TONE_MAPPING",[Sc]:"REINHARD_TONE_MAPPING",[Mc]:"CINEON_TONE_MAPPING",[Ec]:"ACES_FILMIC_TONE_MAPPING",[wc]:"AGX_TONE_MAPPING",[Ac]:"NEUTRAL_TONE_MAPPING",[Tc]:"CUSTOM_TONE_MAPPING"};function bv(p,m,g,_,x,y){let v=new Vn(m,g,{type:p,depthBuffer:x,stencilBuffer:y,samples:_?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),b=null,S=null,M=null,E=new $e;E.setAttribute("position",new cn([-1,3,0,-1,-1,0,3,-1,0],3)),E.setAttribute("uv",new cn([0,2,0,0,2,0],2));let w=new Mh({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),T=new He(E,w),A=new Pa(-1,1,1,-1,0,1),R=null,N=null,C=!1,P,I=null,U=[],D=!1;this.setSize=function(F,z){if(v.setSize(F,z),b!==null)b.setSize(F,z);if(S!==null)S.setSize(F,z);for(let L=0;L<U.length;L++){let O=U[L];if(O.setSize)O.setSize(F,z)}},this.setEffects=function(F){U=F,D=U.length>0&&U[0].isRenderPass===!0;let{width:z,height:L}=v;if(U.length>0&&b===null)b=new Vn(z,L,{type:ri,depthBuffer:!1,stencilBuffer:!1}),S=new Vn(z,L,{type:ri,depthBuffer:!1,stencilBuffer:!1});let O=x===!0&&U.some((H)=>H.needsDepthTexture===!0);if(O!==(v.depthTexture!==null)){if(O===!0&&M===null){if(M=new Vi(z,L),y===!0)M.format=ki,M.type=hs}v.dispose(),v.depthTexture=O?M:null,v.resolveDepthBuffer=O,v.storeMultisampledDepthBuffer=O}for(let H=0;H<U.length;H++){let V=U[H];if(V.setSize)V.setSize(z,L);if(O&&V.needsDepthTexture===!0&&V.setDepthTexture)V.setDepthTexture(M)}},this.begin=function(F,z){if(C)return!1;if(F.toneMapping===si&&U.length===0)return!1;if(I=z,z!==null){let{width:L,height:O}=z;if(v.width!==L||v.height!==O)this.setSize(L,O)}if(D===!1)F.setRenderTarget(v);return P=F.toneMapping,F.toneMapping=si,!0},this.hasRenderPass=function(){return D},this.end=function(F,z){F.toneMapping=P,C=!0;let L=v,O=b;for(let H=0;H<U.length;H++){let V=U[H];if(V.enabled===!1)continue;if(V.render(F,O,L,z),V.needsSwap!==!1)L=O,O=O===b?S:b}if(R!==F.outputColorSpace||N!==F.toneMapping){if(R=F.outputColorSpace,N=F.toneMapping,w.defines={},ce.getTransfer(R)===Ie)w.defines.SRGB_TRANSFER="";let H=vv[N];if(H)w.defines[H]="";w.needsUpdate=!0}w.uniforms.tDiffuse.value=L.texture,F.setRenderTarget(I),F.render(T,A),I=null,C=!1},this.isCompositing=function(){return C},this.dispose=function(){if(v.dispose(),b!==null)b.dispose();if(S!==null)S.dispose();E.dispose(),w.dispose()}}var Yp=new ze,$p=new Vi(1,1),Zp=new Ma(1),Jp=new ma,Kp=new bh,jp=new ba,wp=[],Ap=[],Rp=new Float32Array(16),Cp=new Float32Array(9),Pp=new Float32Array(4);function rr(p,m,g){let _=p[0];if(_<=0||_>0)return p;let x=m*g,y=wp[x];if(y===void 0)y=new Float32Array(x),wp[x]=y;if(m!==0){_.toArray(y,0);for(let v=1,b=0;v!==m;++v)b+=g,p[v].toArray(y,b)}return y}function Ze(p,m){if(p.length!==m.length)return!1;for(let g=0,_=p.length;g<_;g++)if(p[g]!==m[g])return!1;return!0}function Je(p,m){for(let g=0,_=m.length;g<_;g++)p[g]=m[g]}function ka(p,m){let g=Ap[m];if(g===void 0)g=new Int32Array(m),Ap[m]=g;for(let _=0;_!==m;++_)g[_]=p.allocateTextureUnit();return g}function Sv(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1f(this.addr,m),g[0]=m}function Mv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2f(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2fv(this.addr,m),Je(g,m)}}function Ev(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3f(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else if(m.r!==void 0){if(g[0]!==m.r||g[1]!==m.g||g[2]!==m.b)p.uniform3f(this.addr,m.r,m.g,m.b),g[0]=m.r,g[1]=m.g,g[2]=m.b}else{if(Ze(g,m))return;p.uniform3fv(this.addr,m),Je(g,m)}}function Tv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4f(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4fv(this.addr,m),Je(g,m)}}function wv(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix2fv(this.addr,!1,m),Je(g,m)}else{if(Ze(g,_))return;Pp.set(_),p.uniformMatrix2fv(this.addr,!1,Pp),Je(g,_)}}function Av(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix3fv(this.addr,!1,m),Je(g,m)}else{if(Ze(g,_))return;Cp.set(_),p.uniformMatrix3fv(this.addr,!1,Cp),Je(g,_)}}function Rv(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix4fv(this.addr,!1,m),Je(g,m)}else{if(Ze(g,_))return;Rp.set(_),p.uniformMatrix4fv(this.addr,!1,Rp),Je(g,_)}}function Cv(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1i(this.addr,m),g[0]=m}function Pv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2i(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2iv(this.addr,m),Je(g,m)}}function Iv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3i(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ze(g,m))return;p.uniform3iv(this.addr,m),Je(g,m)}}function Lv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4i(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4iv(this.addr,m),Je(g,m)}}function Nv(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1ui(this.addr,m),g[0]=m}function Dv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2ui(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2uiv(this.addr,m),Je(g,m)}}function Uv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3ui(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ze(g,m))return;p.uniform3uiv(this.addr,m),Je(g,m)}}function Ov(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4ui(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4uiv(this.addr,m),Je(g,m)}}function za(p){if(p.version===0)p.compareFunction=dh,p.needsUpdate=!0;return p}function Fv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let y;if(this.type===p.SAMPLER_2D_SHADOW)y=za($p);else y=Yp;g.setTexture2D(m||y,x)}function Bv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture3D(m||Kp,x)}function kv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let y;if(this.type===p.SAMPLER_CUBE_SHADOW)y=za(Zp);else y=jp;g.setTextureCube(m||y,x)}function zv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture2DArray(m||Jp,x)}function Hv(p){switch(p){case 5126:return Sv;case 35664:return Mv;case 35665:return Ev;case 35666:return Tv;case 35674:return wv;case 35675:return Av;case 35676:return Rv;case 5124:case 35670:return Cv;case 35667:case 35671:return Pv;case 35668:case 35672:return Iv;case 35669:case 35673:return Lv;case 5125:return Nv;case 36294:return Dv;case 36295:return Uv;case 36296:return Ov;case 35678:case 36198:case 36298:case 36306:case 35682:return Fv;case 35679:case 36299:case 36307:return Bv;case 35680:case 36300:case 36308:case 36293:return kv;case 36289:case 36303:case 36311:case 36292:return zv}}function Gv(p,m){p.uniform1fv(this.addr,m)}function Vv(p,m){let g=rr(m,this.size,2);p.uniform2fv(this.addr,g)}function Wv(p,m){let g=rr(m,this.size,3);p.uniform3fv(this.addr,g)}function Xv(p,m){let g=rr(m,this.size,4);p.uniform4fv(this.addr,g)}function qv(p,m){let g=rr(m,this.size,4);p.uniformMatrix2fv(this.addr,!1,g)}function Yv(p,m){let g=rr(m,this.size,9);p.uniformMatrix3fv(this.addr,!1,g)}function $v(p,m){let g=rr(m,this.size,16);p.uniformMatrix4fv(this.addr,!1,g)}function Zv(p,m){p.uniform1iv(this.addr,m)}function Jv(p,m){p.uniform2iv(this.addr,m)}function Kv(p,m){p.uniform3iv(this.addr,m)}function jv(p,m){p.uniform4iv(this.addr,m)}function Qv(p,m){p.uniform1uiv(this.addr,m)}function tb(p,m){p.uniform2uiv(this.addr,m)}function eb(p,m){p.uniform3uiv(this.addr,m)}function nb(p,m){p.uniform4uiv(this.addr,m)}function ib(p,m,g){let _=this.cache,x=m.length,y=ka(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),Je(_,y);let v;if(this.type===p.SAMPLER_2D_SHADOW)v=za($p);else v=Yp;for(let b=0;b!==x;++b)g.setTexture2D(m[b]||v,y[b])}function sb(p,m,g){let _=this.cache,x=m.length,y=ka(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),Je(_,y);for(let v=0;v!==x;++v)g.setTexture3D(m[v]||Kp,y[v])}function rb(p,m,g){let _=this.cache,x=m.length,y=ka(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),Je(_,y);let v;if(this.type===p.SAMPLER_CUBE_SHADOW)v=za(Zp);else v=jp;for(let b=0;b!==x;++b)g.setTextureCube(m[b]||v,y[b])}function ob(p,m,g){let _=this.cache,x=m.length,y=ka(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),Je(_,y);for(let v=0;v!==x;++v)g.setTexture2DArray(m[v]||Jp,y[v])}function ab(p){switch(p){case 5126:return Gv;case 35664:return Vv;case 35665:return Wv;case 35666:return Xv;case 35674:return qv;case 35675:return Yv;case 35676:return $v;case 5124:case 35670:return Zv;case 35667:case 35671:return Jv;case 35668:case 35672:return Kv;case 35669:case 35673:return jv;case 5125:return Qv;case 36294:return tb;case 36295:return eb;case 36296:return nb;case 35678:case 36198:case 36298:case 36306:case 35682:return ib;case 35679:case 36299:case 36307:return sb;case 35680:case 36300:case 36308:case 36293:return rb;case 36289:case 36303:case 36311:case 36292:return ob}}class Qp{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.setValue=Hv(m.type)}}class tm{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.size=m.size,this.setValue=ab(m.type)}}class em{constructor(p){this.id=p,this.seq=[],this.map={}}setValue(p,m,g){let _=this.seq;for(let x=0,y=_.length;x!==y;++x){let v=_[x];v.setValue(p,m[v.id],g)}}}var Hh=/(\w+)(\])?(\[|\.)?/g;function Ip(p,m){p.seq.push(m),p.map[m.id]=m}function lb(p,m,g){let _=p.name,x=_.length;Hh.lastIndex=0;while(!0){let y=Hh.exec(_),v=Hh.lastIndex,b=y[1],S=y[2]==="]",M=y[3];if(S)b=b|0;if(M===void 0||M==="["&&v+2===x){Ip(g,M===void 0?new Qp(b,p,m):new tm(b,p,m));break}else{let w=g.map[b];if(w===void 0)w=new em(b),Ip(g,w);g=w}}}class lo{constructor(p,m){this.seq=[],this.map={};let g=p.getProgramParameter(m,p.ACTIVE_UNIFORMS);for(let y=0;y<g;++y){let v=p.getActiveUniform(m,y),b=p.getUniformLocation(m,v.name);lb(v,b,this)}let _=[],x=[];for(let y of this.seq)if(y.type===p.SAMPLER_2D_SHADOW||y.type===p.SAMPLER_CUBE_SHADOW||y.type===p.SAMPLER_2D_ARRAY_SHADOW)_.push(y);else x.push(y);if(_.length>0)this.seq=_.concat(x)}setValue(p,m,g,_){let x=this.map[m];if(x!==void 0)x.setValue(p,g,_)}setOptional(p,m,g){let _=m[g];if(_!==void 0)this.setValue(p,g,_)}static upload(p,m,g,_){for(let x=0,y=m.length;x!==y;++x){let v=m[x],b=g[v.id];if(b.needsUpdate!==!1)v.setValue(p,b.value,_)}}static seqWithValue(p,m){let g=[];for(let _=0,x=p.length;_!==x;++_){let y=p[_];if(y.id in m)g.push(y)}return g}}function Lp(p,m,g){let _=p.createShader(m);return p.shaderSource(_,g),p.compileShader(_),_}var cb=37297,hb=0;function ub(p,m){let g=p.split(`
`),_=[],x=Math.max(m-6,0),y=Math.min(m+6,g.length);for(let v=x;v<y;v++){let b=v+1;_.push(`${b===m?">":" "} ${b}: ${g[v]}`)}return _.join(`
`)}var Np=new ee;function db(p){ce._getMatrix(Np,ce.workingColorSpace,p);let m=`mat3( ${Np.elements.map((g)=>g.toFixed(4))} )`;switch(ce.getTransfer(p)){case ch:return[m,"LinearTransferOETF"];case Ie:return[m,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",p),[m,"LinearTransferOETF"]}}function Dp(p,m,g){let _=p.getShaderParameter(m,p.COMPILE_STATUS),y=(p.getShaderInfoLog(m)||"").trim();if(_&&y==="")return"";let v=/ERROR: 0:(\d+)/.exec(y);if(v){let b=parseInt(v[1]);return g.toUpperCase()+`

`+y+`

`+ub(p.getShaderSource(m),b)}else return y}function fb(p,m){let g=db(m);return[`vec4 ${p}( vec4 value ) {`,`	return ${g[1]}( vec4( ${g[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var pb={[bc]:"Linear",[Sc]:"Reinhard",[Mc]:"Cineon",[Ec]:"ACESFilmic",[wc]:"AgX",[Ac]:"Neutral",[Tc]:"Custom"};function mb(p,m){let g=pb[m];if(g===void 0)return Xt("WebGLProgram: Unsupported toneMapping:",m),"vec3 "+p+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+p+"( vec3 color ) { return "+g+"ToneMapping( color ); }"}var Oa=new Y;function gb(){ce.getLuminanceCoefficients(Oa);let p=Oa.x.toFixed(4),m=Oa.y.toFixed(4),g=Oa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${p}, ${m}, ${g} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function _b(p){return[p.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",p.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ao).join(`
`)}function xb(p){let m=[];for(let g in p){let _=p[g];if(_===!1)continue;m.push("#define "+g+" "+_)}return m.join(`
`)}function yb(p,m){let g={},_=p.getProgramParameter(m,p.ACTIVE_ATTRIBUTES);for(let x=0;x<_;x++){let y=p.getActiveAttrib(m,x),v=y.name,b=1;if(y.type===p.FLOAT_MAT2)b=2;if(y.type===p.FLOAT_MAT3)b=3;if(y.type===p.FLOAT_MAT4)b=4;g[v]={type:y.type,location:p.getAttribLocation(m,v),locationSize:b}}return g}function ao(p){return p!==""}function Up(p,m){let g=m.numSpotLightShadows+m.numSpotLightMaps-m.numSpotLightShadowsWithMaps;return p.replace(/NUM_SUN_LIGHTS/g,m.numSunLights).replace(/NUM_DIR_LIGHTS/g,m.numDirLights).replace(/NUM_SPOT_LIGHTS/g,m.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,m.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,g).replace(/NUM_RECT_AREA_LIGHTS/g,m.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,m.numPointLights).replace(/NUM_HEMI_LIGHTS/g,m.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,m.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,m.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,m.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,m.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,m.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,m.numLightProbeGrids)}function Op(p,m){return p.replace(/NUM_CLIPPING_PLANES/g,m.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,m.numClippingPlanes-m.numClipIntersection)}var vb=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vh(p){return p.replace(vb,bb)}function bb(p,m){let g=le[m];if(g===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+m+">");return Vh(g)}var Sb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Fp(p){return p.replace(Sb,Mb)}function Mb(p,m,g,_){let x="";for(let y=parseInt(m);y<parseInt(g);y++)x+=_.replace(/\[\s*i\s*\]/g,"[ "+y+" ]").replace(/UNROLLED_LOOP_INDEX/g,y);return x}function Bp(p){let m=`precision ${p.precision} float;
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
#define LOW_PRECISION`;return m}var Eb={[Gr]:"SHADOWMAP_TYPE_PCF",[Zs]:"SHADOWMAP_TYPE_VSM"};function Tb(p){return Eb[p.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var wb={[Ks]:"ENVMAP_MODE_REFRACTION"};function Ab(p){if(p.envMap===!1)return"ENVMAP_MODE_REFLECTION";return wb[p.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Rb={[Xf]:"ENVMAP_BLENDING_MULTIPLY",[qf]:"ENVMAP_BLENDING_MIX",[Yf]:"ENVMAP_BLENDING_ADD"};function Cb(p){if(p.envMap===!1)return"ENVMAP_BLENDING_NONE";return Rb[p.combine]||"ENVMAP_BLENDING_NONE"}function Pb(p,m,g,_){let x=p.getContext(),{defines:y,vertexShader:v,fragmentShader:b}=g,S=Tb(g),M=g.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",E=Ab(g),w=Cb(g),T=_b(g),A=xb(y),R=x.createProgram(),N,C,P=g.glslVersion?"#version "+g.glslVersion+`
`:"";if(g.isRawShaderMaterial){if(N=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter(ao).join(`
`),N.length>0)N+=`
`;if(C=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter(ao).join(`
`),C.length>0)C+=`
`}else N=[Bp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",g.batching?"#define USE_BATCHING":"",g.batchingColor?"#define USE_BATCHING_COLOR":"",g.instancing?"#define USE_INSTANCING":"",g.instancingColor?"#define USE_INSTANCING_COLOR":"",g.instancingMorph?"#define USE_INSTANCING_MORPH":"",g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.map?"#define USE_MAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+E:"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.displacementMap?"#define USE_DISPLACEMENTMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.mapUv?"#define MAP_UV "+g.mapUv:"",g.alphaMapUv?"#define ALPHAMAP_UV "+g.alphaMapUv:"",g.lightMapUv?"#define LIGHTMAP_UV "+g.lightMapUv:"",g.aoMapUv?"#define AOMAP_UV "+g.aoMapUv:"",g.emissiveMapUv?"#define EMISSIVEMAP_UV "+g.emissiveMapUv:"",g.bumpMapUv?"#define BUMPMAP_UV "+g.bumpMapUv:"",g.normalMapUv?"#define NORMALMAP_UV "+g.normalMapUv:"",g.displacementMapUv?"#define DISPLACEMENTMAP_UV "+g.displacementMapUv:"",g.metalnessMapUv?"#define METALNESSMAP_UV "+g.metalnessMapUv:"",g.roughnessMapUv?"#define ROUGHNESSMAP_UV "+g.roughnessMapUv:"",g.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+g.anisotropyMapUv:"",g.clearcoatMapUv?"#define CLEARCOATMAP_UV "+g.clearcoatMapUv:"",g.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+g.clearcoatNormalMapUv:"",g.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+g.clearcoatRoughnessMapUv:"",g.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+g.diffuseRoughnessMapUv:"",g.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+g.iridescenceMapUv:"",g.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+g.iridescenceThicknessMapUv:"",g.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+g.sheenColorMapUv:"",g.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+g.sheenRoughnessMapUv:"",g.specularMapUv?"#define SPECULARMAP_UV "+g.specularMapUv:"",g.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+g.specularColorMapUv:"",g.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+g.specularIntensityMapUv:"",g.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+g.transmissionMapUv:"",g.thicknessMapUv?"#define THICKNESSMAP_UV "+g.thicknessMapUv:"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexNormals?"#define HAS_NORMAL":"",g.vertexColors?"#define USE_COLOR":"",g.vertexAlphas?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.flatShading?"#define FLAT_SHADED":"",g.skinning?"#define USE_SKINNING":"",g.morphTargets?"#define USE_MORPHTARGETS":"",g.morphNormals&&g.flatShading===!1?"#define USE_MORPHNORMALS":"",g.morphColors?"#define USE_MORPHCOLORS":"",g.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+g.morphTextureStride:"",g.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+g.morphTargetsCount:"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+S:"",g.sizeAttenuation?"#define USE_SIZEATTENUATION":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(ao).join(`
`),C=[Bp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",g.map?"#define USE_MAP":"",g.matcap?"#define USE_MATCAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+M:"",g.envMap?"#define "+E:"",g.envMap?"#define "+w:"",g.envMapPMREM?"#define ENVMAP_MAX_LOD "+g.envMapMaxLod+".0":"",g.envMapPMREM?"#define ENVMAP_SIZE "+g.envMapSize+".0":"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoat?"#define USE_CLEARCOAT":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.dispersion?"#define USE_DISPERSION":"",g.retroreflection?"#define USE_RETROREFLECTION":"",g.iridescence?"#define USE_IRIDESCENCE":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaTest?"#define USE_ALPHATEST":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.sheen?"#define USE_SHEEN":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexColors||g.instancingColor?"#define USE_COLOR":"",g.vertexAlphas||g.batchingColor?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.gradientMap?"#define USE_GRADIENTMAP":"",g.flatShading?"#define FLAT_SHADED":"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+S:"",g.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",g.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",g.toneMapping!==si?"#define TONE_MAPPING":"",g.toneMapping!==si?le.tonemapping_pars_fragment:"",g.toneMapping!==si?mb("toneMapping",g.toneMapping):"",g.dithering?"#define DITHERING":"",g.opaque?"#define OPAQUE":"",le.colorspace_pars_fragment,fb("linearToOutputTexel",g.outputColorSpace),gb(),g.useDepthPacking?"#define DEPTH_PACKING "+g.depthPacking:"",`
`].filter(ao).join(`
`);if(v=Vh(v),v=Up(v,g),v=Op(v,g),b=Vh(b),b=Up(b,g),b=Op(b,g),v=Fp(v),b=Fp(b),g.isRawShaderMaterial!==!0)P=`#version 300 es
`,N=[T,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+N,C=["#define varying in",g.glslVersion===fh?"":"layout(location = 0) out highp vec4 pc_fragColor;",g.glslVersion===fh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+C;let I=P+N+v,U=P+C+b,D=Lp(x,x.VERTEX_SHADER,I),F=Lp(x,x.FRAGMENT_SHADER,U);if(x.attachShader(R,D),x.attachShader(R,F),g.index0AttributeName!==void 0)x.bindAttribLocation(R,0,g.index0AttributeName);else if(g.hasPositionAttribute===!0)x.bindAttribLocation(R,0,"position");x.linkProgram(R);function z(V){if(p.debug.checkShaderErrors){let G=x.getProgramInfoLog(R)||"",W=x.getShaderInfoLog(D)||"",J=x.getShaderInfoLog(F)||"",X=G.trim(),Q=W.trim(),st=J.trim(),tt=!0,_t=!0;if(x.getProgramParameter(R,x.LINK_STATUS)===!1)if(tt=!1,typeof p.debug.onShaderError==="function")p.debug.onShaderError(x,R,D,F);else{let ot=Dp(x,D,"vertex"),ht=Dp(x,F,"fragment");$t("WebGLProgram: Shader Error "+x.getError()+" - VALIDATE_STATUS "+x.getProgramParameter(R,x.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+X+`
`+ot+`
`+ht)}else if(X!=="")Xt("WebGLProgram: Program Info Log:",X);else if(Q===""||st==="")_t=!1;if(_t)V.diagnostics={runnable:tt,programLog:X,vertexShader:{log:Q,prefix:N},fragmentShader:{log:st,prefix:C}}}x.deleteShader(D),x.deleteShader(F),L=new lo(x,R),O=yb(x,R)}let L;this.getUniforms=function(){if(L===void 0)z(this);return L};let O;this.getAttributes=function(){if(O===void 0)z(this);return O};let H=g.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(H===!1)H=x.getProgramParameter(R,cb);return H},this.destroy=function(){_.releaseStatesOfProgram(this),x.deleteProgram(R),this.program=void 0},this.type=g.shaderType,this.name=g.shaderName,this.id=hb++,this.cacheKey=m,this.usedTimes=1,this.program=R,this.vertexShader=D,this.fragmentShader=F,this}var Ib=0;class nm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(p,m,g){let _=this._getShaderCacheForMaterial(p);if(_.has(m)===!1)_.add(m),m.usedTimes++;if(_.has(g)===!1)_.add(g),g.usedTimes++;return this}remove(p){let m=this.materialCache.get(p);for(let g of m)if(g.usedTimes--,g.usedTimes===0)this.shaderCache.delete(g.code);return this.materialCache.delete(p),this}getVertexShaderStage(p){return this._getShaderStage(p.vertexShader)}getFragmentShaderStage(p){return this._getShaderStage(p.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(p){let m=this.materialCache,g=m.get(p);if(g===void 0)g=new Set,m.set(p,g);return g}_getShaderStage(p){let m=this.shaderCache,g=m.get(p);if(g===void 0)g=new im(p),m.set(p,g);return g}}class im{constructor(p){this.id=Ib++,this.code=p,this.usedTimes=0}}function Lb(p){return p===us||p===ua||p===da}function Nb(p,m,g,_,x,y){let v=new Kr,b=new nm,S=new Set,M=[],E=new Map,w=_.logarithmicDepthBuffer,T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(L){if(S.add(L),L===0)return"uv";return`uv${L}`}function R(L,O,H,V,G,W){let J=V.fog,X=G.geometry,Q=L.isMeshStandardMaterial||L.isMeshLambertMaterial||L.isMeshPhongMaterial?V.environment:null,st=L.isMeshStandardMaterial||L.isMeshLambertMaterial&&!L.envMap||L.isMeshPhongMaterial&&!L.envMap,tt=m.get(L.envMap||Q,st),_t=T[L.type],ot=_.precision;if(L.precision!==null){if(ot=_.getMaxPrecision(L.precision),ot!==L.precision)Xt("WebGLProgram.getParameters:",L.precision,"not supported, using",ot,"instead.")}let ht=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,xt=ht!==void 0?ht.length:0,Dt=0;if(X.morphAttributes.position!==void 0)Dt=1;if(X.morphAttributes.normal!==void 0)Dt=2;if(X.morphAttributes.color!==void 0)Dt=3;let at,mt,Ct,Ut;if(_t){let Lt=ai[_t];at=Lt.vertexShader,mt=Lt.fragmentShader}else{at=L.vertexShader,mt=L.fragmentShader;let Lt=b.getVertexShaderStage(L),Ae=b.getFragmentShaderStage(L);b.update(L,Lt,Ae),Ct=Lt.id,Ut=Ae.id}let Ht=p.getRenderTarget(),Et=p.state.buffers.depth.getReversed(),re=G.isInstancedMesh===!0,te=G.isBatchedMesh===!0,Ft=!!L.map,jt=!!L.matcap,Yt=!!tt,xe=Yt&&tt.isPMREMTexture===!0,pe=!!L.aoMap,be=!!L.lightMap,ue=!!L.bumpMap&&L.wireframe===!1,Qt=!!L.normalMap,me=!!L.displacementMap,Oe=!!L.emissiveMap,Fe=!!L.metalnessMap,rn=!!L.roughnessMap,j=L.anisotropy>0,on=L.clearcoat>0,ft=L.diffuseRoughness>0,Zt=L.dispersion>0,yt=L.retroreflectivity>0,ge=L.iridescence>0,qt=L.sheen>0,ne=L.transmission>0,un=j&&!!L.anisotropyMap,q=on&&!!L.clearcoatMap,B=on&&!!L.clearcoatNormalMap,et=on&&!!L.clearcoatRoughnessMap,gt=ft&&!!L.diffuseRoughnessMap,pt=ge&&!!L.iridescenceMap,St=ge&&!!L.iridescenceThicknessMap,wt=qt&&!!L.sheenColorMap,lt=qt&&!!L.sheenRoughnessMap,dt=!!L.specularMap,Mt=!!L.specularColorMap,Z=!!L.specularIntensityMap,ut=ne&&!!L.transmissionMap,ct=ne&&!!L.thicknessMap,vt=!!L.gradientMap,bt=!!L.alphaMap,Rt=L.alphaTest>0,Vt=!!L.alphaHash,Gt=!!L.extensions,It=si;if(L.toneMapped){if(Ht===null||Ht.isXRRenderTarget===!0)It=p.toneMapping}let Wt=xe?tt.isCompressedCubeTexture?tt.image[0].mipmaps:tt.mipmaps:null,ae={shaderID:_t,shaderType:L.type,shaderName:L.name,vertexShader:at,fragmentShader:mt,defines:L.defines,customVertexShaderID:Ct,customFragmentShaderID:Ut,isRawShaderMaterial:L.isRawShaderMaterial===!0,glslVersion:L.glslVersion,precision:ot,batching:te,batchingColor:te&&G._colorsTexture!==null,instancing:re,instancingColor:re&&G.instanceColor!==null,instancingMorph:re&&G.morphTexture!==null,outputColorSpace:Ht===null?p.outputColorSpace:Ht.isXRRenderTarget===!0?Ht.texture.colorSpace:ce.workingColorSpace,alphaToCoverage:!!L.alphaToCoverage,map:Ft,matcap:jt,envMap:Yt,envMapMode:Yt&&tt.mapping,envMapPMREM:xe,envMapMaxLod:xe?Wt.length-1:null,envMapSize:xe?Wt[0].width:null,aoMap:pe,lightMap:be,bumpMap:ue,normalMap:Qt,displacementMap:me,emissiveMap:Oe,normalMapObjectSpace:Qt&&L.normalMapType===ip,normalMapTangentSpace:Qt&&L.normalMapType===ah,packedNormalMap:Qt&&L.normalMapType===ah&&Lb(L.normalMap.format),metalnessMap:Fe,roughnessMap:rn,anisotropy:j,anisotropyMap:un,clearcoat:on,clearcoatMap:q,clearcoatNormalMap:B,clearcoatRoughnessMap:et,diffuseRoughness:ft,diffuseRoughnessMap:gt,dispersion:Zt,retroreflection:yt,iridescence:ge,iridescenceMap:pt,iridescenceThicknessMap:St,sheen:qt,sheenColorMap:wt,sheenRoughnessMap:lt,specularMap:dt,specularColorMap:Mt,specularIntensityMap:Z,transmission:ne,transmissionMap:ut,thicknessMap:ct,gradientMap:vt,opaque:L.transparent===!1&&L.blending===Vr&&L.alphaToCoverage===!1,alphaMap:bt,alphaTest:Rt,alphaHash:Vt,combine:L.combine,mapUv:Ft&&A(L.map.channel),aoMapUv:pe&&A(L.aoMap.channel),lightMapUv:be&&A(L.lightMap.channel),bumpMapUv:ue&&A(L.bumpMap.channel),normalMapUv:Qt&&A(L.normalMap.channel),displacementMapUv:me&&A(L.displacementMap.channel),emissiveMapUv:Oe&&A(L.emissiveMap.channel),metalnessMapUv:Fe&&A(L.metalnessMap.channel),roughnessMapUv:rn&&A(L.roughnessMap.channel),anisotropyMapUv:un&&A(L.anisotropyMap.channel),clearcoatMapUv:q&&A(L.clearcoatMap.channel),clearcoatNormalMapUv:B&&A(L.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&A(L.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:gt&&A(L.diffuseRoughnessMap.channel),iridescenceMapUv:pt&&A(L.iridescenceMap.channel),iridescenceThicknessMapUv:St&&A(L.iridescenceThicknessMap.channel),sheenColorMapUv:wt&&A(L.sheenColorMap.channel),sheenRoughnessMapUv:lt&&A(L.sheenRoughnessMap.channel),specularMapUv:dt&&A(L.specularMap.channel),specularColorMapUv:Mt&&A(L.specularColorMap.channel),specularIntensityMapUv:Z&&A(L.specularIntensityMap.channel),transmissionMapUv:ut&&A(L.transmissionMap.channel),thicknessMapUv:ct&&A(L.thicknessMap.channel),alphaMapUv:bt&&A(L.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(Qt||j),vertexNormals:!!X.attributes.normal,vertexColors:L.vertexColors,vertexAlphas:L.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!X.attributes.uv&&(Ft||bt),fog:!!J,useFog:L.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:L.wireframe===!1&&(L.flatShading===!0||X.attributes.normal===void 0&&Qt===!1&&(L.isMeshLambertMaterial||L.isMeshPhongMaterial||L.isMeshStandardMaterial||L.isMeshPhysicalMaterial)),sizeAttenuation:L.sizeAttenuation===!0,logarithmicDepthBuffer:w,reversedDepthBuffer:Et,skinning:G.isSkinnedMesh===!0,hasPositionAttribute:X.attributes.position!==void 0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:xt,morphTextureStride:Dt,numSunLights:O.sun.length,numDirLights:O.directional.length,numPointLights:O.point.length,numSpotLights:O.spot.length,numSpotLightMaps:O.spotLightMap.length,numRectAreaLights:O.rectArea.length,numHemiLights:O.hemi.length,numSunLightShadows:O.sunShadowMap.length,numDirLightShadows:O.directionalShadowMap.length,numPointLightShadows:O.pointShadowMap.length,numSpotLightShadows:O.spotShadowMap.length,numSpotLightShadowsWithMaps:O.numSpotLightShadowsWithMaps,numLightProbes:O.numLightProbes,numLightProbeGrids:W.filter((Lt)=>Lt.texture!==null).length,numClippingPlanes:y.numPlanes,numClipIntersection:y.numIntersection,dithering:L.dithering,shadowMapEnabled:p.shadowMap.enabled&&H.length>0,shadowMapType:p.shadowMap.type,toneMapping:It,decodeVideoTexture:Ft&&L.map.isVideoTexture===!0&&ce.getTransfer(L.map.colorSpace)===Ie,decodeVideoTextureEmissive:Oe&&L.emissiveMap.isVideoTexture===!0&&ce.getTransfer(L.emissiveMap.colorSpace)===Ie,premultipliedAlpha:L.premultipliedAlpha,doubleSided:L.side===wn,flipSided:L.side===xn,useDepthPacking:L.depthPacking>=0,depthPacking:L.depthPacking||0,index0AttributeName:L.index0AttributeName,extensionClipCullDistance:Gt&&L.extensions.clipCullDistance===!0&&g.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&L.extensions.multiDraw===!0||te)&&g.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:g.has("KHR_parallel_shader_compile"),customProgramCacheKey:L.customProgramCacheKey()};return ae.vertexUv1s=S.has(1),ae.vertexUv2s=S.has(2),ae.vertexUv3s=S.has(3),S.clear(),ae}function N(L){let O=[];if(L.shaderID)O.push(L.shaderID);else O.push(L.customVertexShaderID),O.push(L.customFragmentShaderID);if(L.defines!==void 0)for(let H in L.defines)O.push(H),O.push(L.defines[H]);if(L.isRawShaderMaterial===!1)C(O,L),P(O,L),O.push(p.outputColorSpace);return O.push(L.customProgramCacheKey),O.join()}function C(L,O){L.push(O.precision),L.push(O.outputColorSpace),L.push(O.envMapMode),L.push(O.envMapPMREM),L.push(O.envMapMaxLod),L.push(O.envMapSize),L.push(O.mapUv),L.push(O.alphaMapUv),L.push(O.lightMapUv),L.push(O.aoMapUv),L.push(O.bumpMapUv),L.push(O.normalMapUv),L.push(O.displacementMapUv),L.push(O.emissiveMapUv),L.push(O.metalnessMapUv),L.push(O.roughnessMapUv),L.push(O.anisotropyMapUv),L.push(O.clearcoatMapUv),L.push(O.clearcoatNormalMapUv),L.push(O.clearcoatRoughnessMapUv),L.push(O.diffuseRoughnessMapUv),L.push(O.iridescenceMapUv),L.push(O.iridescenceThicknessMapUv),L.push(O.sheenColorMapUv),L.push(O.sheenRoughnessMapUv),L.push(O.specularMapUv),L.push(O.specularColorMapUv),L.push(O.specularIntensityMapUv),L.push(O.transmissionMapUv),L.push(O.thicknessMapUv),L.push(O.combine),L.push(O.fogExp2),L.push(O.sizeAttenuation),L.push(O.morphTargetsCount),L.push(O.numSunLights),L.push(O.numDirLights),L.push(O.numPointLights),L.push(O.numSpotLights),L.push(O.numSpotLightMaps),L.push(O.numHemiLights),L.push(O.numRectAreaLights),L.push(O.numSunLightShadows),L.push(O.numDirLightShadows),L.push(O.numPointLightShadows),L.push(O.numSpotLightShadows),L.push(O.numSpotLightShadowsWithMaps),L.push(O.numLightProbes),L.push(O.numLightProbeGrids),L.push(O.shadowMapType),L.push(O.toneMapping),L.push(O.numClippingPlanes),L.push(O.numClipIntersection),L.push(O.depthPacking)}function P(L,O){if(v.disableAll(),O.instancing)v.enable(0);if(O.instancingColor)v.enable(1);if(O.instancingMorph)v.enable(2);if(O.matcap)v.enable(3);if(O.envMap)v.enable(4);if(O.normalMapObjectSpace)v.enable(5);if(O.normalMapTangentSpace)v.enable(6);if(O.clearcoat)v.enable(7);if(O.iridescence)v.enable(8);if(O.alphaTest)v.enable(9);if(O.vertexColors)v.enable(10);if(O.vertexAlphas)v.enable(11);if(O.vertexUv1s)v.enable(12);if(O.vertexUv2s)v.enable(13);if(O.vertexUv3s)v.enable(14);if(O.vertexTangents)v.enable(15);if(O.anisotropy)v.enable(16);if(O.alphaHash)v.enable(17);if(O.batching)v.enable(18);if(O.dispersion)v.enable(19);if(O.retroreflection)v.enable(24);if(O.diffuseRoughness)v.enable(25);if(O.batchingColor)v.enable(20);if(O.gradientMap)v.enable(21);if(O.packedNormalMap)v.enable(22);if(O.vertexNormals)v.enable(23);if(L.push(v.mask),v.disableAll(),O.fog)v.enable(0);if(O.useFog)v.enable(1);if(O.flatShading)v.enable(2);if(O.logarithmicDepthBuffer)v.enable(3);if(O.reversedDepthBuffer)v.enable(4);if(O.skinning)v.enable(5);if(O.morphTargets)v.enable(6);if(O.morphNormals)v.enable(7);if(O.morphColors)v.enable(8);if(O.premultipliedAlpha)v.enable(9);if(O.shadowMapEnabled)v.enable(10);if(O.doubleSided)v.enable(11);if(O.flipSided)v.enable(12);if(O.useDepthPacking)v.enable(13);if(O.dithering)v.enable(14);if(O.transmission)v.enable(15);if(O.sheen)v.enable(16);if(O.opaque)v.enable(17);if(O.pointsUvs)v.enable(18);if(O.decodeVideoTexture)v.enable(19);if(O.decodeVideoTextureEmissive)v.enable(20);if(O.alphaToCoverage)v.enable(21);if(O.numLightProbeGrids>0)v.enable(22);if(O.hasPositionAttribute)v.enable(23);L.push(v.mask)}function I(L){let O=T[L.type],H;if(O){let V=ai[O];H=mp.clone(V.uniforms)}else H=L.uniforms;return H}function U(L,O){let H=E.get(O);if(H!==void 0)++H.usedTimes;else H=new Pb(p,O,L,x),M.push(H),E.set(O,H);return H}function D(L){if(--L.usedTimes===0){let O=M.indexOf(L);M[O]=M[M.length-1],M.pop(),E.delete(L.cacheKey),L.destroy()}}function F(L){b.remove(L)}function z(){b.dispose()}return{getParameters:R,getProgramCacheKey:N,getUniforms:I,acquireProgram:U,releaseProgram:D,releaseShaderCache:F,programs:M,dispose:z}}function Db(){let p=new WeakMap;function m(v){return p.has(v)}function g(v){let b=p.get(v);if(b===void 0)b={},p.set(v,b);return b}function _(v){p.delete(v)}function x(v,b,S){p.get(v)[b]=S}function y(){p=new WeakMap}return{has:m,get:g,remove:_,update:x,dispose:y}}function Ub(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.material.id!==m.material.id)return p.material.id-m.material.id;else if(p.materialVariant!==m.materialVariant)return p.materialVariant-m.materialVariant;else if(p.z!==m.z)return p.z-m.z;else return p.id-m.id}function kp(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.z!==m.z)return m.z-p.z;else return p.id-m.id}function zp(){let p=[],m=0,g=[],_=[],x=[];function y(){m=0,g.length=0,_.length=0,x.length=0}function v(T){let A=0;if(T.isInstancedMesh)A+=2;if(T.isSkinnedMesh)A+=1;return A}function b(T,A,R,N,C,P){let I=p[m];if(I===void 0)I={id:T.id,object:T,geometry:A,material:R,materialVariant:v(T),groupOrder:N,renderOrder:T.renderOrder,z:C,group:P},p[m]=I;else I.id=T.id,I.object=T,I.geometry=A,I.material=R,I.materialVariant=v(T),I.groupOrder=N,I.renderOrder=T.renderOrder,I.z=C,I.group=P;return m++,I}function S(T,A,R,N,C,P,I){if(I.reversedDepth===!0)C=-C;let U=b(T,A,R,N,C,P);if(R.transmission>0)_.push(U);else if(R.transparent===!0)x.push(U);else g.push(U)}function M(T,A,R,N,C,P){let I=b(T,A,R,N,C,P);if(R.transmission>0)_.unshift(I);else if(R.transparent===!0)x.unshift(I);else g.unshift(I)}function E(T,A){if(g.length>1)g.sort(T||Ub);if(_.length>1)_.sort(A||kp);if(x.length>1)x.sort(A||kp)}function w(){for(let T=m,A=p.length;T<A;T++){let R=p[T];if(R.id===null)break;R.id=null,R.object=null,R.geometry=null,R.material=null,R.group=null}}return{opaque:g,transmissive:_,transparent:x,init:y,push:S,unshift:M,finish:w,sort:E}}function Ob(){let p=new WeakMap;function m(_,x){let y=p.get(_),v;if(y===void 0)v=new zp,p.set(_,[v]);else if(x>=y.length)v=new zp,y.push(v);else v=y[x];return v}function g(){p=new WeakMap}return{get:m,dispose:g}}function Fb(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={direction:new Y,color:new oe};break;case"SpotLight":g={position:new Y,direction:new Y,color:new oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":g={position:new Y,color:new oe,distance:0,decay:0};break;case"HemisphereLight":g={direction:new Y,skyColor:new oe,groundColor:new oe};break;case"RectAreaLight":g={color:new oe,position:new Y,halfWidth:new Y,halfHeight:new Y};break}return p[m.id]=g,g}}}function Bb(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"SpotLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"PointLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt,shadowCameraNear:1,shadowCameraFar:1000};break}return p[m.id]=g,g}}}var kb=0;function zb(p,m){return(m.castShadow?2:0)-(p.castShadow?2:0)+(m.map?1:0)-(p.map?1:0)}function Hb(p){let m=new Fb,g=Bb(),_={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let M=0;M<9;M++)_.probe.push(new Y);let x=new Y,y=new Kt,v=new Kt;function b(M){let E=0,w=0,T=0;for(let W=0;W<9;W++)_.probe[W].set(0,0,0);let A=0,R=0,N=0,C=0,P=0,I=0,U=0,D=0,F=0,z=0,L=0,O=0,H=0,V=0;M.sort(zb);for(let W=0,J=M.length;W<J;W++){let X=M[W],{color:Q,intensity:st,distance:tt}=X,_t=null;if(X.shadow&&X.shadow.map)if(X.shadow.map.texture.format===us)_t=X.shadow.map.texture;else _t=X.shadow.map.depthTexture||X.shadow.map.texture;if(X.isAmbientLight)E+=Q.r*st,w+=Q.g*st,T+=Q.b*st;else if(X.isLightProbe){for(let ot=0;ot<9;ot++)_.probe[ot].addScaledVector(X.sh.coefficients[ot],st);V++}else if(X.isSunLight){let ot=m.get(X);if(ot.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){let ht=X.shadow,xt=g.get(X);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize.copy(ht.mapSize).multiply(ht.getFrameExtents()),_.sunShadow[R]=xt,_.sunShadowMap[R]=_t;let Dt=ht.getViewportCount();for(let at=0;at<Dt;at++)_.sunShadowMatrix[N+at]=ht.getMatrix(at),_.sunShadowCascade[N+at]=ht._cascadeData[at];N+=Dt,R++}_.sun[A]=ot,A++}else if(X.isDirectionalLight){let ot=m.get(X);if(ot.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){let ht=X.shadow,xt=g.get(X);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,_.directionalShadow[C]=xt,_.directionalShadowMap[C]=_t,_.directionalShadowMatrix[C]=X.shadow.matrix,F++}_.directional[C]=ot,C++}else if(X.isSpotLight){let ot=m.get(X);ot.position.setFromMatrixPosition(X.matrixWorld),ot.color.copy(Q).multiplyScalar(st),ot.distance=tt,ot.coneCos=Math.cos(X.angle),ot.penumbraCos=Math.cos(X.angle*(1-X.penumbra)),ot.decay=X.decay,_.spot[I]=ot;let ht=X.shadow;if(X.map){if(_.spotLightMap[O]=X.map,O++,ht.updateMatrices(X),X.castShadow)H++}if(_.spotLightMatrix[I]=ht.matrix,X.castShadow){let xt=g.get(X);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,_.spotShadow[I]=xt,_.spotShadowMap[I]=_t,L++}I++}else if(X.isRectAreaLight){let ot=m.get(X);ot.color.copy(Q).multiplyScalar(st),ot.halfWidth.set(X.width*0.5,0,0),ot.halfHeight.set(0,X.height*0.5,0),_.rectArea[U]=ot,U++}else if(X.isPointLight){let ot=m.get(X);if(ot.color.copy(X.color).multiplyScalar(X.intensity),ot.distance=X.distance,ot.decay=X.decay,X.castShadow){let ht=X.shadow,xt=g.get(X);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,xt.shadowCameraNear=ht.camera.near,xt.shadowCameraFar=ht.camera.far,_.pointShadow[P]=xt,_.pointShadowMap[P]=_t,_.pointShadowMatrix[P]=X.shadow.matrix,z++}_.point[P]=ot,P++}else if(X.isHemisphereLight){let ot=m.get(X);ot.skyColor.copy(X.color).multiplyScalar(st),ot.groundColor.copy(X.groundColor).multiplyScalar(st),_.hemi[D]=ot,D++}}if(U>0)if(p.has("OES_texture_float_linear")===!0)_.rectAreaLTC1=Pt.LTC_FLOAT_1,_.rectAreaLTC2=Pt.LTC_FLOAT_2;else _.rectAreaLTC1=Pt.LTC_HALF_1,_.rectAreaLTC2=Pt.LTC_HALF_2;_.ambient[0]=E,_.ambient[1]=w,_.ambient[2]=T;let G=_.hash;if(G.sunLength!==A||G.directionalLength!==C||G.pointLength!==P||G.spotLength!==I||G.rectAreaLength!==U||G.hemiLength!==D||G.numSunShadows!==R||G.numDirectionalShadows!==F||G.numPointShadows!==z||G.numSpotShadows!==L||G.numSpotMaps!==O||G.numLightProbes!==V)_.sun.length=A,_.directional.length=C,_.spot.length=I,_.rectArea.length=U,_.point.length=P,_.hemi.length=D,_.sunShadow.length=R,_.sunShadowMap.length=R,_.sunShadowMatrix.length=N,_.sunShadowCascade.length=N,_.directionalShadow.length=F,_.directionalShadowMap.length=F,_.directionalShadowMatrix.length=F,_.pointShadow.length=z,_.pointShadowMap.length=z,_.pointShadowMatrix.length=z,_.spotShadow.length=L,_.spotShadowMap.length=L,_.spotLightMatrix.length=L+O-H,_.spotLightMap.length=O,_.numSpotLightShadowsWithMaps=H,_.numLightProbes=V,G.sunLength=A,G.directionalLength=C,G.pointLength=P,G.spotLength=I,G.rectAreaLength=U,G.hemiLength=D,G.numSunShadows=R,G.numDirectionalShadows=F,G.numPointShadows=z,G.numSpotShadows=L,G.numSpotMaps=O,G.numLightProbes=V,_.version=kb++}function S(M,E){let w=0,T=0,A=0,R=0,N=0,C=0,P=E.matrixWorldInverse;for(let I=0,U=M.length;I<U;I++){let D=M[I];if(D.isSunLight){let F=_.sun[w];F.direction.setFromMatrixPosition(D.matrixWorld),F.direction.transformDirection(P),w++}else if(D.isDirectionalLight){let F=_.directional[T];F.direction.setFromMatrixPosition(D.matrixWorld),x.setFromMatrixPosition(D.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(P),T++}else if(D.isSpotLight){let F=_.spot[R];F.position.setFromMatrixPosition(D.matrixWorld),F.position.applyMatrix4(P),F.direction.setFromMatrixPosition(D.matrixWorld),x.setFromMatrixPosition(D.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(P),R++}else if(D.isRectAreaLight){let F=_.rectArea[N];F.position.setFromMatrixPosition(D.matrixWorld),F.position.applyMatrix4(P),v.identity(),y.copy(D.matrixWorld),y.premultiply(P),v.extractRotation(y),F.halfWidth.set(D.width*0.5,0,0),F.halfHeight.set(0,D.height*0.5,0),F.halfWidth.applyMatrix4(v),F.halfHeight.applyMatrix4(v),N++}else if(D.isPointLight){let F=_.point[A];F.position.setFromMatrixPosition(D.matrixWorld),F.position.applyMatrix4(P),A++}else if(D.isHemisphereLight){let F=_.hemi[C];F.direction.setFromMatrixPosition(D.matrixWorld),F.direction.transformDirection(P),C++}}}return{setup:b,setupView:S,state:_}}function Hp(p){let m=new Hb(p),g=[],_=[],x=[];function y(w){E.camera=w,g.length=0,_.length=0,x.length=0}function v(w){if(w.isLightProbeGrid)x.push(w);else g.push(w)}function b(w){_.push(w)}function S(){m.setup(g),x.sort((w,T)=>w.priority-T.priority||w.id-T.id)}function M(w){m.setupView(g,w)}let E={lightsArray:g,shadowsArray:_,lightProbeGridArray:x,camera:null,lights:m,transmissionRenderTarget:{},textureUnits:0};return{init:y,state:E,setupLights:S,setupLightsView:M,pushLight:v,pushShadow:b}}function Gb(p){let m=new WeakMap;function g(x,y=0){let v=m.get(x),b;if(v===void 0)b=new Hp(p),m.set(x,[b]);else if(y>=v.length)b=new Hp(p),v.push(b);else b=v[y];return b}function _(){m=new WeakMap}return{get:g,dispose:_}}var Vb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Wb=`uniform sampler2D shadow_pass;
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
}`,Xb=[new Y(1,0,0),new Y(-1,0,0),new Y(0,1,0),new Y(0,-1,0),new Y(0,0,1),new Y(0,0,-1)],qb=[new Y(0,-1,0),new Y(0,-1,0),new Y(0,0,1),new Y(0,0,-1),new Y(0,-1,0),new Y(0,-1,0)],Gp=new Kt,oo=new Y,Gh=new Y;function Yb(p,m,g){let _=new Oi,x=new Jt,y=new Jt,v=new ke,b=new Eh,S=new Th,M={},E=g.maxTextureSize,w={[vi]:xn,[xn]:vi,[wn]:wn},T=new Ai({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Jt},radius:{value:4}},vertexShader:Vb,fragmentShader:Wb}),A=T.clone();A.defines.HORIZONTAL_PASS=1;let R=new $e;R.setAttribute("position",new qe(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let N=new He(R,T),C=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gr;let P=this.type;this.render=function(z,L,O){if(C.enabled===!1)return;if(C.autoUpdate===!1&&C.needsUpdate===!1)return;if(z.length===0)return;if(this.type===_f)Xt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Gr;let H=p.getRenderTarget(),V=p.getActiveCubeFace(),G=p.getActiveMipmapLevel(),W=p.state;if(W.setBlending(cs),W.buffers.depth.getReversed()===!0)W.buffers.color.setClear(0,0,0,0);else W.buffers.color.setClear(1,1,1,1);W.buffers.depth.setTest(!0),W.setScissorTest(!1);let J=P!==this.type;if(J)L.traverse(function(X){if(X.material)if(Array.isArray(X.material))X.material.forEach((Q)=>Q.needsUpdate=!0);else X.material.needsUpdate=!0});for(let X=0,Q=z.length;X<Q;X++){let st=z[X],tt=st.shadow;if(tt===void 0){Xt("WebGLShadowMap:",st,"has no shadow.");continue}if(tt.autoUpdate===!1&&tt.needsUpdate===!1)continue;x.copy(tt.mapSize);let _t=tt.getFrameExtents();if(x.multiply(_t),y.copy(tt.mapSize),x.x>E||x.y>E){if(x.x>E)y.x=Math.floor(E/_t.x),x.x=y.x*_t.x,tt.mapSize.x=y.x;if(x.y>E)y.y=Math.floor(E/_t.y),x.y=y.y*_t.y,tt.mapSize.y=y.y}let ot=p.state.buffers.depth.getReversed();if(tt.camera._reversedDepth=ot,tt.map===null||J===!0){if(tt.map!==null){if(tt.map.depthTexture!==null)tt.map.depthTexture.dispose(),tt.map.depthTexture=null;tt.map.dispose()}if(this.type===Zs){if(st.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}tt.map=new Vn(x.x,x.y,{format:us,type:ri,minFilter:yn,magFilter:yn,generateMipmaps:!1}),tt.map.texture.name=st.name+".shadowMap",tt.map.depthTexture=new Vi(x.x,x.y,bi),tt.map.depthTexture.name=st.name+".shadowMapDepth",tt.map.depthTexture.format=Qs,tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Fi,tt.map.depthTexture.magFilter=Fi}else{if(st.isPointLight)tt.map=new Ba(x.x),tt.map.depthTexture=new Ma(x.x,Bi);else tt.map=new Vn(x.x,x.y),tt.map.depthTexture=new Vi(x.x,x.y,Bi);if(tt.map.depthTexture.name=st.name+".shadowMap",tt.map.depthTexture.format=Qs,this.type===Gr)tt.map.depthTexture.compareFunction=ot?uh:hh,tt.map.depthTexture.minFilter=yn,tt.map.depthTexture.magFilter=yn;else tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Fi,tt.map.depthTexture.magFilter=Fi}tt.camera.updateProjectionMatrix()}if(tt.map.isWebGLCubeRenderTarget!==!0&&(tt.map.width!==x.x||tt.map.height!==x.y))tt.map.setSize(x.x,x.y);let ht=tt.map.isWebGLCubeRenderTarget?6:tt.getViewportCount();if(st.isPointLight!==!0)tt.updateMatrices(st,O);let xt=(tt.camera.layers.mask&4294967294)!==0?tt.camera.layers:O.layers;for(let Dt=0;Dt<ht;Dt++){let at=tt.getCamera(Dt);if(st.isPointLight){let{camera:mt,matrix:Ct}=tt,Ut=st.distance||mt.far;if(Ut!==mt.far)mt.far=Ut,mt.updateProjectionMatrix();oo.setFromMatrixPosition(st.matrixWorld),mt.position.copy(oo),Gh.copy(mt.position),Gh.add(Xb[Dt]),mt.up.copy(qb[Dt]),mt.lookAt(Gh),mt.updateMatrixWorld(),Ct.makeTranslation(-oo.x,-oo.y,-oo.z),Gp.multiplyMatrices(mt.projectionMatrix,mt.matrixWorldInverse),tt._frustum.setFromProjectionMatrix(Gp,mt.coordinateSystem,mt.reversedDepth)}if(tt.map.isWebGLCubeRenderTarget)p.setRenderTarget(tt.map,Dt),p.clear();else{if(Dt===0)p.setRenderTarget(tt.map),p.clear();let mt=tt.getViewport(Dt);v.set(y.x*mt.x,y.y*mt.y,y.x*mt.z,y.y*mt.w),W.viewport(v)}_=tt.getFrustum(Dt),D(L,O,at,st,xt,this.type)}if(tt.isPointLightShadow!==!0&&this.type===Zs)I(tt,O);tt.needsUpdate=!1}P=this.type,C.needsUpdate=!1,p.setRenderTarget(H,V,G)};function I(z,L){let O=m.update(N);if(T.defines.VSM_SAMPLES!==z.blurSamples)T.defines.VSM_SAMPLES=z.blurSamples,A.defines.VSM_SAMPLES=z.blurSamples,T.needsUpdate=!0,A.needsUpdate=!0;if(z.mapPass===null)z.mapPass=new Vn(x.x,x.y,{format:us,type:ri});else if(z.mapPass.width!==z.map.width||z.mapPass.height!==z.map.height)z.mapPass.setSize(z.map.width,z.map.height);T.uniforms.shadow_pass.value=z.map.depthTexture,T.uniforms.resolution.value.set(z.map.width,z.map.height),T.uniforms.radius.value=z.radius,p.setRenderTarget(z.mapPass),p.clear(),p.renderBufferDirect(L,null,O,T,N,null),A.uniforms.shadow_pass.value=z.mapPass.texture,A.uniforms.resolution.value.set(z.map.width,z.map.height),A.uniforms.radius.value=z.radius,p.setRenderTarget(z.map),p.clear(),p.renderBufferDirect(L,null,O,A,N,null)}function U(z,L,O,H){let V=null,G=O.isPointLight===!0?z.customDistanceMaterial:z.customDepthMaterial;if(G!==void 0)V=G;else if(V=O.isPointLight===!0?S:b,p.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){let W=V.uuid,J=L.uuid,X=M[W];if(X===void 0)X={},M[W]=X;let Q=X[J];if(Q===void 0)Q=V.clone(),X[J]=Q,L.addEventListener("dispose",F);V=Q}if(V.visible=L.visible,V.wireframe=L.wireframe,H===Zs)V.side=L.shadowSide!==null?L.shadowSide:L.side;else V.side=L.shadowSide!==null?L.shadowSide:w[L.side];if(V.alphaMap=L.alphaMap,V.alphaTest=L.alphaToCoverage===!0?0.5:L.alphaTest,V.map=L.map,V.clipShadows=L.clipShadows,V.clippingPlanes=L.clippingPlanes,V.clipIntersection=L.clipIntersection,V.displacementMap=L.displacementMap,V.displacementScale=L.displacementScale,V.displacementBias=L.displacementBias,V.wireframeLinewidth=L.wireframeLinewidth,V.linewidth=L.linewidth,O.isPointLight===!0&&V.isMeshDistanceMaterial===!0){let W=p.properties.get(V);W.light=O}return V}function D(z,L,O,H,V,G){if(z.visible===!1)return;if(z.layers.test(V)&&(z.isMesh||z.isLine||z.isPoints)){if((z.castShadow||z.receiveShadow&&G===Zs)&&(!z.frustumCulled||z.intersectsFrustum(_))){z.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,z.matrixWorld);let X=m.update(z),Q=z.material;if(Array.isArray(Q)){let st=X.groups;for(let tt=0,_t=st.length;tt<_t;tt++){let ot=st[tt],ht=Q[ot.materialIndex];if(ht&&ht.visible){let xt=U(z,ht,H,G);z.onBeforeShadow(p,z,L,O,X,xt,ot),p.renderBufferDirect(O,null,X,xt,z,ot),z.onAfterShadow(p,z,L,O,X,xt,ot)}}}else if(Q.visible){let st=U(z,Q,H,G);z.onBeforeShadow(p,z,L,O,X,st,null),p.renderBufferDirect(O,null,X,st,z,null),z.onAfterShadow(p,z,L,O,X,st,null)}}}let J=z.children;for(let X=0,Q=J.length;X<Q;X++)D(J[X],L,O,H,V,G)}function F(z){z.target.removeEventListener("dispose",F);for(let O in M){let H=M[O],V=z.target.uuid;if(V in H)H[V].dispose(),delete H[V]}}}function $b(p,m){function g(){let Z=!1,ut=new ke,ct=null,vt=new ke(0,0,0,0);return{setMask:function(bt){if(ct!==bt&&!Z)p.colorMask(bt,bt,bt,bt),ct=bt},setLocked:function(bt){Z=bt},setClear:function(bt,Rt,Vt,Gt,It){if(It===!0)bt*=Gt,Rt*=Gt,Vt*=Gt;if(ut.set(bt,Rt,Vt,Gt),vt.equals(ut)===!1)p.clearColor(bt,Rt,Vt,Gt),vt.copy(ut)},reset:function(){Z=!1,ct=null,vt.set(-1,0,0,0)}}}function _(){let Z=!1,ut=!1,ct=null,vt=null,bt=null;return{setReversed:function(Rt){if(ut!==Rt){let Vt=m.get("EXT_clip_control");if(Rt)Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT);else Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);ut=Rt;let Gt=bt;bt=null,this.setClear(Gt)}},getReversed:function(){return ut},setTest:function(Rt){if(Rt)Et(p.DEPTH_TEST);else re(p.DEPTH_TEST)},setMask:function(Rt){if(ct!==Rt&&!Z)p.depthMask(Rt),ct=Rt},setFunc:function(Rt){if(ut)Rt=dp[Rt];if(vt!==Rt){switch(Rt){case Bf:p.depthFunc(p.NEVER);break;case kf:p.depthFunc(p.ALWAYS);break;case zf:p.depthFunc(p.LESS);break;case vc:p.depthFunc(p.LEQUAL);break;case Hf:p.depthFunc(p.EQUAL);break;case Gf:p.depthFunc(p.GEQUAL);break;case Vf:p.depthFunc(p.GREATER);break;case Wf:p.depthFunc(p.NOTEQUAL);break;default:p.depthFunc(p.LEQUAL)}vt=Rt}},setLocked:function(Rt){Z=Rt},setClear:function(Rt){if(bt!==Rt){if(bt=Rt,ut)Rt=1-Rt;p.clearDepth(Rt)}},reset:function(){Z=!1,ct=null,vt=null,bt=null,ut=!1}}}function x(){let Z=!1,ut=null,ct=null,vt=null,bt=null,Rt=null,Vt=null,Gt=null,It=null;return{setTest:function(Wt){if(!Z)if(Wt)Et(p.STENCIL_TEST);else re(p.STENCIL_TEST)},setMask:function(Wt){if(ut!==Wt&&!Z)p.stencilMask(Wt),ut=Wt},setFunc:function(Wt,ae,Lt){if(ct!==Wt||vt!==ae||bt!==Lt)p.stencilFunc(Wt,ae,Lt),ct=Wt,vt=ae,bt=Lt},setOp:function(Wt,ae,Lt){if(Rt!==Wt||Vt!==ae||Gt!==Lt)p.stencilOp(Wt,ae,Lt),Rt=Wt,Vt=ae,Gt=Lt},setLocked:function(Wt){Z=Wt},setClear:function(Wt){if(It!==Wt)p.clearStencil(Wt),It=Wt},reset:function(){Z=!1,ut=null,ct=null,vt=null,bt=null,Rt=null,Vt=null,Gt=null,It=null}}}let y=new g,v=new _,b=new x,S={},M=new WeakMap,E={},w={},T={},A=new WeakMap,R=[],N=null,C=!1,P=null,I=null,U=null,D=null,F=null,z=null,L=null,O=new oe(0,0,0),H=0,V=!1,G=null,W=null,J=null,X=null,Q=null,st=p.getParameter(p.MAX_COMBINED_TEXTURE_IMAGE_UNITS),tt=!1,_t=0,ot=p.getParameter(p.VERSION);if(ot.indexOf("WebGL")!==-1)_t=parseFloat(/^WebGL (\d)/.exec(ot)[1]),tt=_t>=1;else if(ot.indexOf("OpenGL ES")!==-1)_t=parseFloat(/^OpenGL ES (\d)/.exec(ot)[1]),tt=_t>=2;let ht=null,xt={},Dt=p.getParameter(p.SCISSOR_BOX),at=p.getParameter(p.VIEWPORT),mt=new ke().fromArray(Dt),Ct=new ke().fromArray(at);function Ut(Z,ut,ct,vt){let bt=new Uint8Array(4),Rt=p.createTexture();p.bindTexture(Z,Rt),p.texParameteri(Z,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(Z,p.TEXTURE_MAG_FILTER,p.NEAREST);for(let Vt=0;Vt<ct;Vt++)if(Z===p.TEXTURE_3D||Z===p.TEXTURE_2D_ARRAY)p.texImage3D(ut,0,p.RGBA,1,1,vt,0,p.RGBA,p.UNSIGNED_BYTE,bt);else p.texImage2D(ut+Vt,0,p.RGBA,1,1,0,p.RGBA,p.UNSIGNED_BYTE,bt);return Rt}let Ht={};Ht[p.TEXTURE_2D]=Ut(p.TEXTURE_2D,p.TEXTURE_2D,1),Ht[p.TEXTURE_CUBE_MAP]=Ut(p.TEXTURE_CUBE_MAP,p.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ht[p.TEXTURE_2D_ARRAY]=Ut(p.TEXTURE_2D_ARRAY,p.TEXTURE_2D_ARRAY,1,1),Ht[p.TEXTURE_3D]=Ut(p.TEXTURE_3D,p.TEXTURE_3D,1,1),y.setClear(0,0,0,1),v.setClear(1),b.setClear(0),Et(p.DEPTH_TEST),v.setFunc(vc),ue(!1),Qt(gc),Et(p.CULL_FACE),pe(cs);function Et(Z){if(E[Z]!==!0)p.enable(Z),E[Z]=!0}function re(Z){if(E[Z]!==!1)p.disable(Z),E[Z]=!1}function te(Z,ut){if(T[Z]!==ut){if(p.bindFramebuffer(Z,ut),T[Z]=ut,Z===p.DRAW_FRAMEBUFFER)T[p.FRAMEBUFFER]=ut;if(Z===p.FRAMEBUFFER)T[p.DRAW_FRAMEBUFFER]=ut;return!0}return!1}function Ft(Z,ut){let ct=R,vt=!1;if(Z){if(ct=A.get(ut),ct===void 0)ct=[],A.set(ut,ct);let bt=Z.textures;if(ct.length!==bt.length||ct[0]!==p.COLOR_ATTACHMENT0){for(let Rt=0,Vt=bt.length;Rt<Vt;Rt++)ct[Rt]=p.COLOR_ATTACHMENT0+Rt;ct.length=bt.length,vt=!0}}else if(ct[0]!==p.BACK)ct[0]=p.BACK,vt=!0;if(vt)p.drawBuffers(ct)}function jt(Z){if(N!==Z)return p.useProgram(Z),N=Z,!0;return!1}let Yt={[Js]:p.FUNC_ADD,[yf]:p.FUNC_SUBTRACT,[vf]:p.FUNC_REVERSE_SUBTRACT};Yt[bf]=p.MIN,Yt[Sf]=p.MAX;let xe={[Mf]:p.ZERO,[Ef]:p.ONE,[Tf]:p.SRC_COLOR,[Af]:p.SRC_ALPHA,[Nf]:p.SRC_ALPHA_SATURATE,[If]:p.DST_COLOR,[Cf]:p.DST_ALPHA,[wf]:p.ONE_MINUS_SRC_COLOR,[Rf]:p.ONE_MINUS_SRC_ALPHA,[Lf]:p.ONE_MINUS_DST_COLOR,[Pf]:p.ONE_MINUS_DST_ALPHA,[Df]:p.CONSTANT_COLOR,[Uf]:p.ONE_MINUS_CONSTANT_COLOR,[Of]:p.CONSTANT_ALPHA,[Ff]:p.ONE_MINUS_CONSTANT_ALPHA};function pe(Z,ut,ct,vt,bt,Rt,Vt,Gt,It,Wt){if(Z===cs){if(C===!0)re(p.BLEND),C=!1;return}if(C===!1)Et(p.BLEND),C=!0;if(Z!==xf){if(Z!==P||Wt!==V){if(I!==Js||F!==Js)p.blendEquation(p.FUNC_ADD),I=Js,F=Js;if(Wt)switch(Z){case Vr:p.blendFuncSeparate(p.ONE,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case _c:p.blendFunc(p.ONE,p.ONE);break;case xc:p.blendFuncSeparate(p.ZERO,p.ONE_MINUS_SRC_COLOR,p.ZERO,p.ONE);break;case yc:p.blendFuncSeparate(p.DST_COLOR,p.ONE_MINUS_SRC_ALPHA,p.ZERO,p.ONE);break;default:$t("WebGLState: Invalid blending: ",Z);break}else switch(Z){case Vr:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case _c:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE,p.ONE,p.ONE);break;case xc:$t("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case yc:$t("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$t("WebGLState: Invalid blending: ",Z);break}U=null,D=null,z=null,L=null,O.set(0,0,0),H=0,P=Z,V=Wt}return}if(bt=bt||ut,Rt=Rt||ct,Vt=Vt||vt,ut!==I||bt!==F)p.blendEquationSeparate(Yt[ut],Yt[bt]),I=ut,F=bt;if(ct!==U||vt!==D||Rt!==z||Vt!==L)p.blendFuncSeparate(xe[ct],xe[vt],xe[Rt],xe[Vt]),U=ct,D=vt,z=Rt,L=Vt;if(Gt.equals(O)===!1||It!==H)p.blendColor(Gt.r,Gt.g,Gt.b,It),O.copy(Gt),H=It;P=Z,V=!1}function be(Z,ut){Z.side===wn?re(p.CULL_FACE):Et(p.CULL_FACE);let ct=Z.side===xn;if(ut)ct=!ct;ue(ct),Z.blending===Vr&&Z.transparent===!1?pe(cs):pe(Z.blending,Z.blendEquation,Z.blendSrc,Z.blendDst,Z.blendEquationAlpha,Z.blendSrcAlpha,Z.blendDstAlpha,Z.blendColor,Z.blendAlpha,Z.premultipliedAlpha),v.setFunc(Z.depthFunc),v.setTest(Z.depthTest),v.setMask(Z.depthWrite),y.setMask(Z.colorWrite);let vt=Z.stencilWrite;if(b.setTest(vt),vt)b.setMask(Z.stencilWriteMask),b.setFunc(Z.stencilFunc,Z.stencilRef,Z.stencilFuncMask),b.setOp(Z.stencilFail,Z.stencilZFail,Z.stencilZPass);Oe(Z.polygonOffset,Z.polygonOffsetFactor,Z.polygonOffsetUnits),Z.alphaToCoverage===!0?Et(p.SAMPLE_ALPHA_TO_COVERAGE):re(p.SAMPLE_ALPHA_TO_COVERAGE)}function ue(Z){if(G!==Z){if(Z)p.frontFace(p.CW);else p.frontFace(p.CCW);G=Z}}function Qt(Z){if(Z!==mf){if(Et(p.CULL_FACE),Z!==W)if(Z===gc)p.cullFace(p.BACK);else if(Z===gf)p.cullFace(p.FRONT);else p.cullFace(p.FRONT_AND_BACK)}else re(p.CULL_FACE);W=Z}function me(Z){if(Z!==J){if(tt)p.lineWidth(Z);J=Z}}function Oe(Z,ut,ct){if(Z){if(Et(p.POLYGON_OFFSET_FILL),X!==ut||Q!==ct){if(X=ut,Q=ct,v.getReversed())ut=-ut,ct=-ct;p.polygonOffset(ut,ct)}}else re(p.POLYGON_OFFSET_FILL)}function Fe(Z){if(Z)Et(p.SCISSOR_TEST);else re(p.SCISSOR_TEST)}function rn(Z){if(Z===void 0)Z=p.TEXTURE0+st-1;if(ht!==Z)p.activeTexture(Z),ht=Z}function j(Z,ut,ct){if(ct===void 0)if(ht===null)ct=p.TEXTURE0+st-1;else ct=ht;let vt=xt[ct];if(vt===void 0)vt={type:void 0,texture:void 0},xt[ct]=vt;if(vt.type!==Z||vt.texture!==ut){if(ht!==ct)p.activeTexture(ct),ht=ct;p.bindTexture(Z,ut||Ht[Z]),vt.type=Z,vt.texture=ut}}function on(){let Z=xt[ht];if(Z!==void 0&&Z.type!==void 0)p.bindTexture(Z.type,null),Z.type=void 0,Z.texture=void 0}function ft(){try{p.compressedTexImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Zt(){try{p.compressedTexImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function yt(){try{p.texSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function ge(){try{p.texSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function qt(){try{p.compressedTexSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function ne(){try{p.compressedTexSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function un(){try{p.texStorage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function q(){try{p.texStorage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function B(){try{p.texImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function et(){try{p.texImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function gt(Z){if(w[Z]!==void 0)return w[Z];else return p.getParameter(Z)}function pt(Z,ut){if(w[Z]!==ut)p.pixelStorei(Z,ut),w[Z]=ut}function St(Z){if(mt.equals(Z)===!1)p.scissor(Z.x,Z.y,Z.z,Z.w),mt.copy(Z)}function wt(Z){if(Ct.equals(Z)===!1)p.viewport(Z.x,Z.y,Z.z,Z.w),Ct.copy(Z)}function lt(Z,ut){let ct=M.get(ut);if(ct===void 0)ct=new WeakMap,M.set(ut,ct);let vt=ct.get(Z);if(vt===void 0)vt=p.getUniformBlockIndex(ut,Z.name),p.uniformBlockBinding(ut,vt,vt),ct.set(Z,vt)}function dt(Z,ut,ct){let bt=M.get(ut).get(Z);if(S[bt]!==ct)p.bindBufferBase(p.UNIFORM_BUFFER,bt,ct),S[bt]=ct}function Mt(){p.disable(p.BLEND),p.disable(p.CULL_FACE),p.disable(p.DEPTH_TEST),p.disable(p.POLYGON_OFFSET_FILL),p.disable(p.SCISSOR_TEST),p.disable(p.STENCIL_TEST),p.disable(p.SAMPLE_ALPHA_TO_COVERAGE),p.blendEquation(p.FUNC_ADD),p.blendFunc(p.ONE,p.ZERO),p.blendFuncSeparate(p.ONE,p.ZERO,p.ONE,p.ZERO),p.blendColor(0,0,0,0),p.colorMask(!0,!0,!0,!0),p.clearColor(0,0,0,0),p.depthMask(!0),p.depthFunc(p.LESS),v.setReversed(!1),p.clearDepth(1),p.stencilMask(4294967295),p.stencilFunc(p.ALWAYS,0,4294967295),p.stencilOp(p.KEEP,p.KEEP,p.KEEP),p.clearStencil(0),p.cullFace(p.BACK),p.frontFace(p.CCW),p.polygonOffset(0,0),p.activeTexture(p.TEXTURE0),p.bindFramebuffer(p.FRAMEBUFFER,null),p.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),p.bindFramebuffer(p.READ_FRAMEBUFFER,null),p.useProgram(null),p.lineWidth(1),p.scissor(0,0,p.canvas.width,p.canvas.height),p.viewport(0,0,p.canvas.width,p.canvas.height),p.pixelStorei(p.PACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,!1),p.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),p.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,p.BROWSER_DEFAULT_WEBGL),p.pixelStorei(p.PACK_ROW_LENGTH,0),p.pixelStorei(p.PACK_SKIP_PIXELS,0),p.pixelStorei(p.PACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_ROW_LENGTH,0),p.pixelStorei(p.UNPACK_IMAGE_HEIGHT,0),p.pixelStorei(p.UNPACK_SKIP_PIXELS,0),p.pixelStorei(p.UNPACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_SKIP_IMAGES,0),E={},w={},ht=null,xt={},T={},S={},A=new WeakMap,R=[],N=null,C=!1,P=null,I=null,U=null,D=null,F=null,z=null,L=null,O=new oe(0,0,0),H=0,V=!1,G=null,W=null,J=null,X=null,Q=null,mt.set(0,0,p.canvas.width,p.canvas.height),Ct.set(0,0,p.canvas.width,p.canvas.height),y.reset(),v.reset(),b.reset()}return{buffers:{color:y,depth:v,stencil:b},enable:Et,disable:re,bindFramebuffer:te,drawBuffers:Ft,useProgram:jt,setBlending:pe,setMaterial:be,setFlipSided:ue,setCullFace:Qt,setLineWidth:me,setPolygonOffset:Oe,setScissorTest:Fe,activeTexture:rn,bindTexture:j,unbindTexture:on,compressedTexImage2D:ft,compressedTexImage3D:Zt,texImage2D:B,texImage3D:et,pixelStorei:pt,getParameter:gt,updateUBOMapping:lt,uniformBlockBinding:dt,texStorage2D:un,texStorage3D:q,texSubImage2D:yt,texSubImage3D:ge,compressedTexSubImage2D:qt,compressedTexSubImage3D:ne,scissor:St,viewport:wt,reset:Mt}}function Zb(p,m,g,_,x,y,v){let b=m.has("WEBGL_multisampled_render_to_texture")?m.get("WEBGL_multisampled_render_to_texture"):null,S=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),M=new Jt,E=new WeakMap,w=new Set,T,A=new WeakMap,R=new Set,N=new FinalizationRegistry((q)=>R.delete(q)),C=!1;try{C=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(q){}function P(q,B){return C?new OffscreenCanvas(q,B):zr("canvas")}function I(q,B,et){let gt=1,pt=un(q);if(pt.width>et||pt.height>et)gt=et/Math.max(pt.width,pt.height);if(gt<1)if(typeof HTMLImageElement<"u"&&q instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&q instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&q instanceof ImageBitmap||typeof VideoFrame<"u"&&q instanceof VideoFrame){let St=Math.floor(gt*pt.width),wt=Math.floor(gt*pt.height);if(T===void 0)T=P(St,wt);let lt=B?P(St,wt):T;return lt.width=St,lt.height=wt,lt.getContext("2d").drawImage(q,0,0,St,wt),Xt("WebGLRenderer: Texture has been resized from ("+pt.width+"x"+pt.height+") to ("+St+"x"+wt+")."),lt}else{if("data"in q)Xt("WebGLRenderer: Image in DataTexture is too big ("+pt.width+"x"+pt.height+").");return q}return q}function U(q){return q.generateMipmaps}function D(q){p.generateMipmap(q)}function F(q){if(q.isWebGLCubeRenderTarget)return p.TEXTURE_CUBE_MAP;if(q.isWebGL3DRenderTarget)return p.TEXTURE_3D;if(q.isWebGLArrayRenderTarget||q.isCompressedArrayTexture)return p.TEXTURE_2D_ARRAY;return p.TEXTURE_2D}function z(q,B,et,gt,pt,St=!1){if(q!==null){if(p[q]!==void 0)return p[q];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+q+"'")}let wt;if(gt){if(wt=m.get("EXT_texture_norm16"),!wt)Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let lt=B;if(B===p.RED){if(et===p.FLOAT)lt=p.R32F;if(et===p.HALF_FLOAT)lt=p.R16F;if(et===p.UNSIGNED_BYTE)lt=p.R8;if(et===p.UNSIGNED_SHORT&&wt)lt=wt.R16_EXT;if(et===p.SHORT&&wt)lt=wt.R16_SNORM_EXT}if(B===p.RED_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.R8UI;if(et===p.UNSIGNED_SHORT)lt=p.R16UI;if(et===p.UNSIGNED_INT)lt=p.R32UI;if(et===p.BYTE)lt=p.R8I;if(et===p.SHORT)lt=p.R16I;if(et===p.INT)lt=p.R32I}if(B===p.RG){if(et===p.FLOAT)lt=p.RG32F;if(et===p.HALF_FLOAT)lt=p.RG16F;if(et===p.UNSIGNED_BYTE)lt=p.RG8;if(et===p.UNSIGNED_SHORT&&wt)lt=wt.RG16_EXT;if(et===p.SHORT&&wt)lt=wt.RG16_SNORM_EXT}if(B===p.RG_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RG8UI;if(et===p.UNSIGNED_SHORT)lt=p.RG16UI;if(et===p.UNSIGNED_INT)lt=p.RG32UI;if(et===p.BYTE)lt=p.RG8I;if(et===p.SHORT)lt=p.RG16I;if(et===p.INT)lt=p.RG32I}if(B===p.RGB_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGB8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGB16UI;if(et===p.UNSIGNED_INT)lt=p.RGB32UI;if(et===p.BYTE)lt=p.RGB8I;if(et===p.SHORT)lt=p.RGB16I;if(et===p.INT)lt=p.RGB32I}if(B===p.RGBA_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGBA8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGBA16UI;if(et===p.UNSIGNED_INT)lt=p.RGBA32UI;if(et===p.BYTE)lt=p.RGBA8I;if(et===p.SHORT)lt=p.RGBA16I;if(et===p.INT)lt=p.RGBA32I}if(B===p.RGB){if(et===p.UNSIGNED_SHORT&&wt)lt=wt.RGB16_EXT;if(et===p.SHORT&&wt)lt=wt.RGB16_SNORM_EXT;if(et===p.UNSIGNED_INT_5_9_9_9_REV)lt=p.RGB9_E5;if(et===p.UNSIGNED_INT_10F_11F_11F_REV)lt=p.R11F_G11F_B10F}if(B===p.RGBA){let dt=St?ch:ce.getTransfer(pt);if(et===p.FLOAT)lt=p.RGBA32F;if(et===p.HALF_FLOAT)lt=p.RGBA16F;if(et===p.UNSIGNED_BYTE)lt=dt===Ie?p.SRGB8_ALPHA8:p.RGBA8;if(et===p.UNSIGNED_SHORT&&wt)lt=wt.RGBA16_EXT;if(et===p.SHORT&&wt)lt=wt.RGBA16_SNORM_EXT;if(et===p.UNSIGNED_SHORT_4_4_4_4)lt=p.RGBA4;if(et===p.UNSIGNED_SHORT_5_5_5_1)lt=p.RGB5_A1}if(lt===p.R16F||lt===p.R32F||lt===p.RG16F||lt===p.RG32F||lt===p.RGBA16F||lt===p.RGBA32F)m.get("EXT_color_buffer_float");return lt}function L(q,B){let et;if(q){if(B===null||B===Bi||B===hs)et=p.DEPTH24_STENCIL8;else if(B===bi)et=p.DEPTH32F_STENCIL8;else if(B===qr)et=p.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(B===null||B===Bi||B===hs)et=p.DEPTH_COMPONENT24;else if(B===bi)et=p.DEPTH_COMPONENT32F;else if(B===qr)et=p.DEPTH_COMPONENT16;return et}function O(q,B){if(U(q)===!0||q.isFramebufferTexture&&q.minFilter!==Fi&&q.minFilter!==yn)return Math.log2(Math.max(B.width,B.height))+1;else if(q.mipmaps.length>0)return q.mipmaps.length;else if(q.isCompressedTexture&&Array.isArray(q.image))return B.mipmaps.length;else return 1}function H(q){let B=new WeakRef(q);_.get(q).__ref=B,R.add(B),N.register(q,B,B)}function V(q){let B=_.get(q).__ref;if(B===void 0)return;R.delete(B),N.unregister(B)}function G(q){J(q.target)}function W(q){X(q.target)}function J(q){if(q.removeEventListener("dispose",G),V(q),st(q),q.isVideoTexture)E.delete(q);if(q.isHTMLTexture)w.delete(q)}function X(q){q.removeEventListener("dispose",W),V(q),_t(q)}function Q(){for(let q of R){let B=q.deref();if(B===void 0)continue;if(B.isRenderTarget===!0)X(B);else J(B)}R.clear(),w.clear()}function st(q){let B=_.get(q);if(B.__webglInit===void 0)return;let et=q.source,gt=A.get(et);if(gt){let pt=gt[B.__cacheKey];if(pt.usedTimes--,pt.usedTimes===0)tt(q);if(Object.keys(gt).length===0)A.delete(et)}_.remove(q)}function tt(q){let B=_.get(q);p.deleteTexture(B.__webglTexture);let et=q.source,gt=A.get(et);delete gt[B.__cacheKey],v.memory.textures--}function _t(q){let B=_.get(q);if(B.__depthDisposeCallback)B.__depthDisposeCallback();let et=q.depthTexture;if(et&&et.renderTarget===q)J(et);if(q.isWebGLCubeRenderTarget)for(let pt=0;pt<6;pt++){if(Array.isArray(B.__webglFramebuffer[pt]))for(let St=0;St<B.__webglFramebuffer[pt].length;St++)p.deleteFramebuffer(B.__webglFramebuffer[pt][St]);else p.deleteFramebuffer(B.__webglFramebuffer[pt]);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer[pt])}else{if(Array.isArray(B.__webglFramebuffer))for(let pt=0;pt<B.__webglFramebuffer.length;pt++)p.deleteFramebuffer(B.__webglFramebuffer[pt]);else p.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer);if(B.__webglMultisampledFramebuffer)p.deleteFramebuffer(B.__webglMultisampledFramebuffer);if(B.__webglColorRenderbuffer){for(let pt=0;pt<B.__webglColorRenderbuffer.length;pt++)if(B.__webglColorRenderbuffer[pt])p.deleteRenderbuffer(B.__webglColorRenderbuffer[pt])}if(B.__webglDepthRenderbuffer)p.deleteRenderbuffer(B.__webglDepthRenderbuffer)}let gt=q.textures;for(let pt=0,St=gt.length;pt<St;pt++){let wt=_.get(gt[pt]);if(wt.__webglTexture)p.deleteTexture(wt.__webglTexture),v.memory.textures--;_.remove(gt[pt])}_.remove(q)}let ot=0;function ht(){ot=0}function xt(){return ot}function Dt(q){ot=q}function at(){let q=ot;if(q>=x.maxTextures)Xt("WebGLTextures: Trying to use "+(q+1)+" texture units while this GPU supports only "+x.maxTextures);return ot+=1,q}function mt(q){let B=[];return B.push(q.wrapS),B.push(q.wrapT),B.push(q.wrapR||0),B.push(q.magFilter),B.push(q.minFilter),B.push(q.anisotropy),B.push(q.internalFormat),B.push(q.format),B.push(q.type),B.push(q.generateMipmaps),B.push(q.mipmapsAutoUpdate),B.push(q.premultiplyAlpha),B.push(q.flipY),B.push(q.unpackAlignment),B.push(q.colorSpace),B.join()}function Ct(q,B){let et=_.get(q);if(q.isVideoTexture)qt(q);if(q.isRenderTargetTexture===!1&&q.isExternalTexture!==!0&&q.version>0&&et.__version!==q.version){let gt=q.image;if(gt===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(gt.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{be(et,q,B);return}}else if(q.isExternalTexture)et.__webglTexture=q.sourceTexture?q.sourceTexture:null;g.bindTexture(p.TEXTURE_2D,et.__webglTexture,p.TEXTURE0+B)}function Ut(q,B){let et=_.get(q);if(q.isRenderTargetTexture===!1&&q.version>0&&et.__version!==q.version){be(et,q,B);return}else if(q.isExternalTexture)et.__webglTexture=q.sourceTexture?q.sourceTexture:null;g.bindTexture(p.TEXTURE_2D_ARRAY,et.__webglTexture,p.TEXTURE0+B)}function Ht(q,B){let et=_.get(q);if(q.isRenderTargetTexture===!1&&q.version>0&&et.__version!==q.version){be(et,q,B);return}g.bindTexture(p.TEXTURE_3D,et.__webglTexture,p.TEXTURE0+B)}function Et(q,B){let et=_.get(q);if(q.version>0&&et.__version!==q.version){ue(et,q,B);return}g.bindTexture(p.TEXTURE_CUBE_MAP,et.__webglTexture,p.TEXTURE0+B)}let re={[js]:p.REPEAT,[la]:p.CLAMP_TO_EDGE,[$f]:p.MIRRORED_REPEAT},te={[Fi]:p.NEAREST,[Zf]:p.NEAREST_MIPMAP_NEAREST,[Xr]:p.NEAREST_MIPMAP_LINEAR,[yn]:p.LINEAR,[ca]:p.LINEAR_MIPMAP_NEAREST,[Kn]:p.LINEAR_MIPMAP_LINEAR},Ft={[sp]:p.NEVER,[dh]:p.ALWAYS,[rp]:p.LESS,[hh]:p.LEQUAL,[op]:p.EQUAL,[uh]:p.GEQUAL,[ap]:p.GREATER,[lp]:p.NOTEQUAL};function jt(q,B){if(B.type===bi&&m.has("OES_texture_float_linear")===!1&&(B.magFilter===yn||B.magFilter===ca||B.magFilter===Xr||B.magFilter===Kn||B.minFilter===yn||B.minFilter===ca||B.minFilter===Xr||B.minFilter===Kn))Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(p.texParameteri(q,p.TEXTURE_WRAP_S,re[B.wrapS]),p.texParameteri(q,p.TEXTURE_WRAP_T,re[B.wrapT]),q===p.TEXTURE_3D||q===p.TEXTURE_2D_ARRAY)p.texParameteri(q,p.TEXTURE_WRAP_R,re[B.wrapR]);if(p.texParameteri(q,p.TEXTURE_MAG_FILTER,te[B.magFilter]),p.texParameteri(q,p.TEXTURE_MIN_FILTER,te[B.minFilter]),B.compareFunction)p.texParameteri(q,p.TEXTURE_COMPARE_MODE,p.COMPARE_REF_TO_TEXTURE),p.texParameteri(q,p.TEXTURE_COMPARE_FUNC,Ft[B.compareFunction]);if(m.has("EXT_texture_filter_anisotropic")===!0){if(B.magFilter===Fi)return;if(B.minFilter!==Xr&&B.minFilter!==Kn)return;if(B.type===bi&&m.has("OES_texture_float_linear")===!1)return;if(B.anisotropy>1||_.get(B).__currentAnisotropy){let et=m.get("EXT_texture_filter_anisotropic");p.texParameterf(q,et.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(B.anisotropy,x.getMaxAnisotropy())),_.get(B).__currentAnisotropy=B.anisotropy}}}function Yt(q,B){let et=!1;if(q.__webglInit===void 0)q.__webglInit=!0,B.addEventListener("dispose",G),H(B);let gt=B.source,pt=A.get(gt);if(pt===void 0)pt={},A.set(gt,pt);let St=mt(B);if(St!==q.__cacheKey){if(pt[St]===void 0)pt[St]={texture:p.createTexture(),usedTimes:0},v.memory.textures++,et=!0;pt[St].usedTimes++;let wt=pt[q.__cacheKey];if(wt!==void 0){if(pt[q.__cacheKey].usedTimes--,wt.usedTimes===0)tt(B)}q.__cacheKey=St,q.__webglTexture=pt[St].texture}return et}function xe(q,B,et){return Math.floor(Math.floor(q/et)/B)}function pe(q,B,et,gt){let St=q.updateRanges;if(St.length===0)g.texSubImage2D(p.TEXTURE_2D,0,0,0,B.width,B.height,et,gt,B.data);else{St.sort((Z,ut)=>Z.start-ut.start);let wt=0;for(let Z=1;Z<St.length;Z++){let ut=St[wt],ct=St[Z],vt=ut.start+ut.count,bt=xe(ct.start,B.width,4),Rt=xe(ut.start,B.width,4);if(ct.start<=vt+1&&bt===Rt&&xe(ct.start+ct.count-1,B.width,4)===bt)ut.count=Math.max(ut.count,ct.start+ct.count-ut.start);else++wt,St[wt]=ct}St.length=wt+1;let lt=g.getParameter(p.UNPACK_ROW_LENGTH),dt=g.getParameter(p.UNPACK_SKIP_PIXELS),Mt=g.getParameter(p.UNPACK_SKIP_ROWS);g.pixelStorei(p.UNPACK_ROW_LENGTH,B.width);for(let Z=0,ut=St.length;Z<ut;Z++){let ct=St[Z],vt=Math.floor(ct.start/4),bt=Math.ceil(ct.count/4),Rt=vt%B.width,Vt=Math.floor(vt/B.width),Gt=bt,It=1;g.pixelStorei(p.UNPACK_SKIP_PIXELS,Rt),g.pixelStorei(p.UNPACK_SKIP_ROWS,Vt),g.texSubImage2D(p.TEXTURE_2D,0,Rt,Vt,Gt,1,et,gt,B.data)}q.clearUpdateRanges(),g.pixelStorei(p.UNPACK_ROW_LENGTH,lt),g.pixelStorei(p.UNPACK_SKIP_PIXELS,dt),g.pixelStorei(p.UNPACK_SKIP_ROWS,Mt)}}function be(q,B,et){let gt=p.TEXTURE_2D;if(B.isDataArrayTexture||B.isCompressedArrayTexture)gt=p.TEXTURE_2D_ARRAY;if(B.isData3DTexture)gt=p.TEXTURE_3D;let pt=Yt(q,B),St=B.source;g.bindTexture(gt,q.__webglTexture,p.TEXTURE0+et);let wt=_.get(St);if(St.version!==wt.__version||pt===!0){if(g.activeTexture(p.TEXTURE0+et),(typeof ImageBitmap<"u"&&B.image instanceof ImageBitmap)===!1){let It=ce.getPrimaries(ce.workingColorSpace),Wt=B.colorSpace===ds?null:ce.getPrimaries(B.colorSpace),ae=B.colorSpace===ds||It===Wt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,ae)}g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment);let dt=I(B.image,!1,x.maxTextureSize);dt=ne(B,dt);let Mt=y.convert(B.format,B.colorSpace),Z=y.convert(B.type),ut=z(B.internalFormat,Mt,Z,B.normalized,B.colorSpace,B.isVideoTexture);jt(gt,B);let ct,vt=B.mipmaps,bt=B.isVideoTexture!==!0,Rt=wt.__version===void 0||pt===!0,Vt=St.dataReady,Gt=O(B,dt);if(B.isDepthTexture){if(ut=L(B.format===ki,B.type),Rt)if(bt)g.texStorage2D(p.TEXTURE_2D,1,ut,dt.width,dt.height);else g.texImage2D(p.TEXTURE_2D,0,ut,dt.width,dt.height,0,Mt,Z,null)}else if(B.isDataTexture)if(vt.length>0){if(bt&&Rt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,vt[0].width,vt[0].height);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],bt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,Mt,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,Mt,Z,ct.data);B.generateMipmaps=!1}else if(bt){if(Rt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,dt.width,dt.height);if(Vt)pe(B,dt,Mt,Z)}else g.texImage2D(p.TEXTURE_2D,0,ut,dt.width,dt.height,0,Mt,Z,dt.data);else if(B.isCompressedTexture)if(B.isCompressedArrayTexture){if(bt&&Rt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ut,vt[0].width,vt[0].height,dt.depth);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],B.format!==Gn)if(Mt!==null)if(bt){if(Vt)if(B.layerUpdates.size>0){let ae=zh(ct.width,ct.height,B.format,B.type);for(let Lt of B.layerUpdates){let Ae=ct.data.subarray(Lt*ae/ct.data.BYTES_PER_ELEMENT,(Lt+1)*ae/ct.data.BYTES_PER_ELEMENT);g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,Lt,ct.width,ct.height,1,Mt,Ae)}}else g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,dt.depth,Mt,ct.data)}else g.compressedTexImage3D(p.TEXTURE_2D_ARRAY,It,ut,ct.width,ct.height,dt.depth,0,ct.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(bt){if(Vt)g.texSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,dt.depth,Mt,Z,ct.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,It,ut,ct.width,ct.height,dt.depth,0,Mt,Z,ct.data);if(B.layerUpdates.size>0)B.clearLayerUpdates()}else{if(bt&&Rt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,vt[0].width,vt[0].height);for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],B.format!==Gn)if(Mt!==null)if(bt){if(Vt)g.compressedTexSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,Mt,ct.data)}else g.compressedTexImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,ct.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(bt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,Mt,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,Mt,Z,ct.data)}else if(B.isDataArrayTexture)if(bt){if(Rt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ut,dt.width,dt.height,dt.depth);if(Vt)if(B.layerUpdates.size>0){let It=zh(dt.width,dt.height,B.format,B.type);for(let Wt of B.layerUpdates){let ae=dt.data.subarray(Wt*It/dt.data.BYTES_PER_ELEMENT,(Wt+1)*It/dt.data.BYTES_PER_ELEMENT);g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,Wt,dt.width,dt.height,1,Mt,Z,ae)}B.clearLayerUpdates()}else g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,0,dt.width,dt.height,dt.depth,Mt,Z,dt.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,0,ut,dt.width,dt.height,dt.depth,0,Mt,Z,dt.data);else if(B.isData3DTexture)if(bt){if(Rt)g.texStorage3D(p.TEXTURE_3D,Gt,ut,dt.width,dt.height,dt.depth);if(Vt)g.texSubImage3D(p.TEXTURE_3D,0,0,0,0,dt.width,dt.height,dt.depth,Mt,Z,dt.data)}else g.texImage3D(p.TEXTURE_3D,0,ut,dt.width,dt.height,dt.depth,0,Mt,Z,dt.data);else if(B.isFramebufferTexture){if(Rt)if(bt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,dt.width,dt.height);else{let It=dt.width,Wt=dt.height;for(let ae=0;ae<Gt;ae++)g.texImage2D(p.TEXTURE_2D,ae,ut,It,Wt,0,Mt,Z,null),It>>=1,Wt>>=1}}else if(B.isHTMLTexture){if("texElementImage2D"in p){let It=p.canvas;if(!It.hasAttribute("layoutsubtree"))It.setAttribute("layoutsubtree","true");if(dt.parentNode!==It){It.appendChild(dt),w.add(B),It.onpaint=(Wt)=>{let ae=Wt.changedElements;for(let Lt of w)if(ae.includes(Lt.image))Lt.needsUpdate=!0},It.requestPaint();return}if(p.texElementImage2D.length===3)p.texElementImage2D(p.TEXTURE_2D,p.RGBA8,dt);else{let{RGBA:ae,RGBA:Lt,UNSIGNED_BYTE:Ae}=p;p.texElementImage2D(p.TEXTURE_2D,0,ae,Lt,Ae,dt)}p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE)}}else if(vt.length>0){if(bt&&Rt){let It=un(vt[0]);g.texStorage2D(p.TEXTURE_2D,Gt,ut,It.width,It.height)}for(let It=0,Wt=vt.length;It<Wt;It++)if(ct=vt[It],bt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,Mt,Z,ct)}else g.texImage2D(p.TEXTURE_2D,It,ut,Mt,Z,ct);B.generateMipmaps=!1}else if(bt){if(Rt){let It=un(dt);g.texStorage2D(p.TEXTURE_2D,Gt,ut,It.width,It.height)}if(Vt)g.texSubImage2D(p.TEXTURE_2D,0,0,0,Mt,Z,dt)}else g.texImage2D(p.TEXTURE_2D,0,ut,Mt,Z,dt);if(U(B)&&B.mipmapsAutoUpdate===!0)D(gt);if(wt.__version=St.version,B.onUpdate)B.onUpdate(B)}q.__version=B.version}function ue(q,B,et){if(B.image.length!==6)return;let gt=Yt(q,B),pt=B.source;g.bindTexture(p.TEXTURE_CUBE_MAP,q.__webglTexture,p.TEXTURE0+et);let St=_.get(pt);if(pt.version!==St.__version||gt===!0){g.activeTexture(p.TEXTURE0+et);let wt=ce.getPrimaries(ce.workingColorSpace),lt=B.colorSpace===ds?null:ce.getPrimaries(B.colorSpace),dt=B.colorSpace===ds||wt===lt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);let Mt=B.isCompressedTexture||B.image[0].isCompressedTexture,Z=B.image[0]&&B.image[0].isDataTexture,ut=[];for(let Lt=0;Lt<6;Lt++){if(!Mt&&!Z)ut[Lt]=I(B.image[Lt],!0,x.maxCubemapSize);else ut[Lt]=Z?B.image[Lt].image:B.image[Lt];ut[Lt]=ne(B,ut[Lt])}let ct=ut[0],vt=y.convert(B.format,B.colorSpace),bt=y.convert(B.type),Rt=z(B.internalFormat,vt,bt,B.normalized,B.colorSpace),Vt=B.isVideoTexture!==!0,Gt=St.__version===void 0||gt===!0,It=pt.dataReady,Wt=O(B,ct);jt(p.TEXTURE_CUBE_MAP,B);let ae;if(B.isDepthTexture){if(Rt=L(B.format===ki,B.type),Gt)if(Vt)g.texStorage2D(p.TEXTURE_CUBE_MAP,1,Rt,ct.width,ct.height);else for(let Lt=0;Lt<6;Lt++)g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,Rt,ct.width,ct.height,0,vt,bt,null)}else if(Mt){if(Vt&&Gt)g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,Rt,ct.width,ct.height);for(let Lt=0;Lt<6;Lt++){ae=ut[Lt].mipmaps;for(let Ae=0;Ae<ae.length;Ae++){let Ke=ae[Ae];if(B.format!==Gn)if(vt!==null)if(Vt){if(It)g.compressedTexSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,0,0,Ke.width,Ke.height,vt,Ke.data)}else g.compressedTexImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,Rt,Ke.width,Ke.height,0,Ke.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,0,0,Ke.width,Ke.height,vt,bt,Ke.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,Rt,Ke.width,Ke.height,0,vt,bt,Ke.data)}}}else{if(ae=B.mipmaps,Vt&&Gt){if(ae.length>0)Wt++;let Lt=un(ut[0]);g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,Rt,Lt.width,Lt.height)}for(let Lt=0;Lt<6;Lt++)if(Z){if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,ut[Lt].width,ut[Lt].height,vt,bt,ut[Lt].data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,Rt,ut[Lt].width,ut[Lt].height,0,vt,bt,ut[Lt].data);for(let Ae=0;Ae<ae.length;Ae++){let hi=ae[Ae].image[Lt].image;if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,0,0,hi.width,hi.height,vt,bt,hi.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,Rt,hi.width,hi.height,0,vt,bt,hi.data)}}else{if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,vt,bt,ut[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,Rt,vt,bt,ut[Lt]);for(let Ae=0;Ae<ae.length;Ae++){let Ke=ae[Ae];if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,0,0,vt,bt,Ke.image[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,Rt,vt,bt,Ke.image[Lt])}}}if(U(B)&&B.mipmapsAutoUpdate===!0)D(p.TEXTURE_CUBE_MAP);if(St.__version=pt.version,B.onUpdate)B.onUpdate(B)}q.__version=B.version}function Qt(q,B,et,gt,pt,St){let wt=y.convert(et.format,et.colorSpace),lt=y.convert(et.type),dt=z(et.internalFormat,wt,lt,et.normalized,et.colorSpace),Mt=_.get(B),Z=_.get(et);if(Z.__renderTarget=B,!Mt.__hasExternalTextures){let ut=Math.max(1,B.width>>St),ct=Math.max(1,B.height>>St);if(pt===p.TEXTURE_3D||pt===p.TEXTURE_2D_ARRAY)g.texImage3D(pt,St,dt,ut,ct,B.depth,0,wt,lt,null);else g.texImage2D(pt,St,dt,ut,ct,0,wt,lt,null)}if(g.bindFramebuffer(p.FRAMEBUFFER,q),ge(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,gt,pt,Z.__webglTexture,0,yt(B));else if(pt===p.TEXTURE_2D||pt>=p.TEXTURE_CUBE_MAP_POSITIVE_X&&pt<=p.TEXTURE_CUBE_MAP_NEGATIVE_Z)p.framebufferTexture2D(p.FRAMEBUFFER,gt,pt,Z.__webglTexture,St);g.bindFramebuffer(p.FRAMEBUFFER,null)}function me(q,B,et){if(p.bindRenderbuffer(p.RENDERBUFFER,q),B.depthBuffer){let gt=B.depthTexture,pt=gt&&gt.isDepthTexture?gt.type:null,St=L(B.stencilBuffer,pt),wt=B.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(ge(B))b.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,yt(B),St,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,yt(B),St,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,St,B.width,B.height);p.framebufferRenderbuffer(p.FRAMEBUFFER,wt,p.RENDERBUFFER,q)}else{let gt=B.textures;for(let pt=0;pt<gt.length;pt++){let St=gt[pt],wt=y.convert(St.format,St.colorSpace),lt=y.convert(St.type),dt=z(St.internalFormat,wt,lt,St.normalized,St.colorSpace);if(ge(B))b.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,yt(B),dt,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,yt(B),dt,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,dt,B.width,B.height)}}p.bindRenderbuffer(p.RENDERBUFFER,null)}function Oe(q,B,et){let gt=B.isWebGLCubeRenderTarget===!0;if(g.bindFramebuffer(p.FRAMEBUFFER,q),!(B.depthTexture&&B.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let pt=_.get(B.depthTexture);pt.__renderTarget=B;let St=gt?B.depthTexture.image[0]:B.depthTexture.image;if(!pt.__webglTexture||St.width!==B.width||St.height!==B.height)St.width=B.width,St.height=B.height,B.depthTexture.needsUpdate=!0;if(gt)Et(B.depthTexture,0);else Ct(B.depthTexture,0);let wt=pt.__webglTexture,lt=yt(B),dt=gt?p.TEXTURE_CUBE_MAP_POSITIVE_X+et:p.TEXTURE_2D,Mt=B.depthTexture.format===ki?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(B.depthTexture.format===Qs)if(ge(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,Mt,dt,wt,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,Mt,dt,wt,0);else if(B.depthTexture.format===ki)if(ge(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,Mt,dt,wt,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,Mt,dt,wt,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Fe(q){let B=_.get(q),et=q.isWebGLCubeRenderTarget===!0;if(B.__boundDepthTexture!==q.depthTexture){let gt=q.depthTexture;if(B.__depthDisposeCallback)B.__depthDisposeCallback();if(gt){let pt=()=>{delete B.__boundDepthTexture,delete B.__depthDisposeCallback,gt.removeEventListener("dispose",pt)};gt.addEventListener("dispose",pt),B.__depthDisposeCallback=pt}B.__boundDepthTexture=gt}if(q.depthTexture&&!B.__autoAllocateDepthBuffer)if(et)for(let gt=0;gt<6;gt++)Oe(B.__webglFramebuffer[gt],q,gt);else if(q.texture.mipmaps.length>0)Oe(B.__webglFramebuffer[0],q,0);else Oe(B.__webglFramebuffer,q,0);else if(et){B.__webglDepthbuffer=[];for(let gt=0;gt<6;gt++)if(g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[gt]),B.__webglDepthbuffer[gt]===void 0)B.__webglDepthbuffer[gt]=p.createRenderbuffer(),me(B.__webglDepthbuffer[gt],q,!1);else{let pt=q.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,St=B.__webglDepthbuffer[gt];p.bindRenderbuffer(p.RENDERBUFFER,St),p.framebufferRenderbuffer(p.FRAMEBUFFER,pt,p.RENDERBUFFER,St)}}else{if(q.texture.mipmaps.length>0)g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[0]);else g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer);if(B.__webglDepthbuffer===void 0)B.__webglDepthbuffer=p.createRenderbuffer(),me(B.__webglDepthbuffer,q,!1);else{let pt=q.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,St=B.__webglDepthbuffer;p.bindRenderbuffer(p.RENDERBUFFER,St),p.framebufferRenderbuffer(p.FRAMEBUFFER,pt,p.RENDERBUFFER,St)}}g.bindFramebuffer(p.FRAMEBUFFER,null)}function rn(q,B,et){let gt=_.get(q);if(B!==void 0)Qt(gt.__webglFramebuffer,q,q.texture,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,0);if(et!==void 0)Fe(q)}function j(q){let B=q.texture,et=_.get(q),gt=_.get(B);q.addEventListener("dispose",W),H(q);let pt=q.textures,St=q.isWebGLCubeRenderTarget===!0,wt=pt.length>1;if(!wt){if(gt.__webglTexture===void 0)gt.__webglTexture=p.createTexture();gt.__version=B.version,v.memory.textures++}if(St){et.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0){et.__webglFramebuffer[lt]=[];for(let dt=0;dt<B.mipmaps.length;dt++)et.__webglFramebuffer[lt][dt]=p.createFramebuffer()}else et.__webglFramebuffer[lt]=p.createFramebuffer()}else{if(B.mipmaps.length>0){et.__webglFramebuffer=[];for(let lt=0;lt<B.mipmaps.length;lt++)et.__webglFramebuffer[lt]=p.createFramebuffer()}else et.__webglFramebuffer=p.createFramebuffer();if(wt)for(let lt=0,dt=pt.length;lt<dt;lt++){let Mt=_.get(pt[lt]);if(Mt.__webglTexture===void 0)Mt.__webglTexture=p.createTexture(),v.memory.textures++}if(q.samples>0&&ge(q)===!1){et.__webglMultisampledFramebuffer=p.createFramebuffer(),et.__webglColorRenderbuffer=[],g.bindFramebuffer(p.FRAMEBUFFER,et.__webglMultisampledFramebuffer);for(let lt=0;lt<pt.length;lt++){let dt=pt[lt];et.__webglColorRenderbuffer[lt]=p.createRenderbuffer(),p.bindRenderbuffer(p.RENDERBUFFER,et.__webglColorRenderbuffer[lt]);let Mt=y.convert(dt.format,dt.colorSpace),Z=y.convert(dt.type),ut=z(dt.internalFormat,Mt,Z,dt.normalized,dt.colorSpace,q.isXRRenderTarget===!0),ct=yt(q);p.renderbufferStorageMultisample(p.RENDERBUFFER,ct,ut,q.width,q.height),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+lt,p.RENDERBUFFER,et.__webglColorRenderbuffer[lt])}if(p.bindRenderbuffer(p.RENDERBUFFER,null),q.depthBuffer)et.__webglDepthRenderbuffer=p.createRenderbuffer(),me(et.__webglDepthRenderbuffer,q,!0);g.bindFramebuffer(p.FRAMEBUFFER,null)}}if(St){g.bindTexture(p.TEXTURE_CUBE_MAP,gt.__webglTexture),jt(p.TEXTURE_CUBE_MAP,B);for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0)for(let dt=0;dt<B.mipmaps.length;dt++)Qt(et.__webglFramebuffer[lt][dt],q,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,dt);else Qt(et.__webglFramebuffer[lt],q,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);if(U(B))D(p.TEXTURE_CUBE_MAP);else if(B.mipmaps.length>0)p.texParameteri(p.TEXTURE_CUBE_MAP,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}else if(wt){for(let lt=0,dt=pt.length;lt<dt;lt++){let Mt=pt[lt],Z=_.get(Mt),ut=p.TEXTURE_2D;if(q.isWebGL3DRenderTarget||q.isWebGLArrayRenderTarget)ut=q.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(ut,Z.__webglTexture),jt(ut,Mt),Qt(et.__webglFramebuffer,q,Mt,p.COLOR_ATTACHMENT0+lt,ut,0),U(Mt))D(ut)}g.unbindTexture()}else{let lt=p.TEXTURE_2D;if(q.isWebGL3DRenderTarget||q.isWebGLArrayRenderTarget)lt=q.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(lt,gt.__webglTexture),jt(lt,B),B.mipmaps.length>0)for(let dt=0;dt<B.mipmaps.length;dt++)Qt(et.__webglFramebuffer[dt],q,B,p.COLOR_ATTACHMENT0,lt,dt);else Qt(et.__webglFramebuffer,q,B,p.COLOR_ATTACHMENT0,lt,0);if(U(B))D(lt);else if(B.mipmaps.length>0)p.texParameteri(lt,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}if(q.depthBuffer)Fe(q)}function on(q){let B=q.textures;for(let et=0,gt=B.length;et<gt;et++){let pt=B[et];if(U(pt)&&pt.mipmapsAutoUpdate===!0){let St=F(q),wt=_.get(pt).__webglTexture;g.bindTexture(St,wt),D(St),g.unbindTexture()}}}let ft=[];function Zt(q){if(q.samples>0){if(ge(q)===!1){let{textures:B,width:et,height:gt}=q,pt=p.COLOR_BUFFER_BIT,St=q.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,wt=_.get(q),lt=B.length>1;if(lt)for(let Mt=0;Mt<B.length;Mt++)g.bindFramebuffer(p.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+Mt,p.RENDERBUFFER,null),g.bindFramebuffer(p.FRAMEBUFFER,wt.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+Mt,p.TEXTURE_2D,null,0);if(g.bindFramebuffer(p.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer),q.texture.mipmaps.length>0)g.bindFramebuffer(p.DRAW_FRAMEBUFFER,wt.__webglFramebuffer[0]);else g.bindFramebuffer(p.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let Mt=0;Mt<B.length;Mt++){if(q.resolveDepthBuffer){if(q.depthBuffer)pt|=p.DEPTH_BUFFER_BIT;if(q.stencilBuffer&&q.resolveStencilBuffer)pt|=p.STENCIL_BUFFER_BIT}if(lt){p.framebufferRenderbuffer(p.READ_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.RENDERBUFFER,wt.__webglColorRenderbuffer[Mt]);let Z=_.get(B[Mt]).__webglTexture;p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,Z,0)}if(p.blitFramebuffer(0,0,et,gt,0,0,et,gt,pt,p.NEAREST),S===!0){if(ft.length=0,ft.push(p.COLOR_ATTACHMENT0+Mt),q.depthBuffer&&q.storeMultisampledDepthBuffer===!1)ft.push(St);p.invalidateFramebuffer(p.READ_FRAMEBUFFER,ft)}}if(g.bindFramebuffer(p.READ_FRAMEBUFFER,null),g.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),lt)for(let Mt=0;Mt<B.length;Mt++){g.bindFramebuffer(p.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+Mt,p.RENDERBUFFER,wt.__webglColorRenderbuffer[Mt]);let Z=_.get(B[Mt]).__webglTexture;g.bindFramebuffer(p.FRAMEBUFFER,wt.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+Mt,p.TEXTURE_2D,Z,0)}g.bindFramebuffer(p.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(q.depthBuffer&&q.storeMultisampledDepthBuffer===!1&&S){let B=q.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;p.invalidateFramebuffer(p.DRAW_FRAMEBUFFER,[B])}}}function yt(q){return Math.min(x.maxSamples,q.samples)}function ge(q){let B=_.get(q);return q.samples>0&&m.has("WEBGL_multisampled_render_to_texture")===!0&&B.__useRenderToTexture!==!1}function qt(q){let B=v.render.frame;if(E.get(q)!==B)E.set(q,B),q.update()}function ne(q,B){let{colorSpace:et,format:gt,type:pt}=q;if(q.isCompressedTexture===!0||q.isVideoTexture===!0)return B;if(et!==lh&&et!==ds)if(ce.getTransfer(et)===Ie){if(gt!==Gn||pt!==jn)Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else $t("WebGLTextures: Unsupported texture color space:",et);return B}function un(q){if(typeof HTMLImageElement<"u"&&q instanceof HTMLImageElement)M.width=q.naturalWidth||q.width,M.height=q.naturalHeight||q.height;else if(typeof VideoFrame<"u"&&q instanceof VideoFrame)M.width=q.displayWidth,M.height=q.displayHeight;else M.width=q.width,M.height=q.height;return M}this.allocateTextureUnit=at,this.resetTextureUnits=ht,this.getTextureUnits=xt,this.setTextureUnits=Dt,this.setTexture2D=Ct,this.setTexture2DArray=Ut,this.setTexture3D=Ht,this.setTextureCube=Et,this.rebindTextures=rn,this.setupRenderTarget=j,this.updateRenderTargetMipmap=on,this.updateMultisampleRenderTarget=Zt,this.setupDepthRenderbuffer=Fe,this.setupFrameBufferTexture=Qt,this.useMultisampledRTT=ge,this.dispose=Q}function Jb(p,m){function g(_,x=ds){let y,v=ce.getTransfer(x);if(_===jn)return p.UNSIGNED_BYTE;if(_===Cc)return p.UNSIGNED_SHORT_4_4_4_4;if(_===Pc)return p.UNSIGNED_SHORT_5_5_5_1;if(_===jf)return p.UNSIGNED_INT_5_9_9_9_REV;if(_===Qf)return p.UNSIGNED_INT_10F_11F_11F_REV;if(_===Jf)return p.BYTE;if(_===Kf)return p.SHORT;if(_===qr)return p.UNSIGNED_SHORT;if(_===Rc)return p.INT;if(_===Bi)return p.UNSIGNED_INT;if(_===bi)return p.FLOAT;if(_===ri)return p.HALF_FLOAT;if(_===tp)return p.ALPHA;if(_===ep)return p.RGB;if(_===Gn)return p.RGBA;if(_===Qs)return p.DEPTH_COMPONENT;if(_===ki)return p.DEPTH_STENCIL;if(_===np)return p.RED;if(_===Ic)return p.RED_INTEGER;if(_===us)return p.RG;if(_===Lc)return p.RG_INTEGER;if(_===Nc)return p.RGBA_INTEGER;if(_===tr||_===ha||_===er||_===nr)if(v===Ie)if(y=m.get("WEBGL_compressed_texture_s3tc_srgb"),y!==null){if(_===tr)return y.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(_===ha)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(_===er)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(_===nr)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(y=m.get("WEBGL_compressed_texture_s3tc"),y!==null){if(_===tr)return y.COMPRESSED_RGB_S3TC_DXT1_EXT;if(_===ha)return y.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(_===er)return y.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(_===nr)return y.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(_===Dc||_===Uc||_===Oc||_===Fc)if(y=m.get("WEBGL_compressed_texture_pvrtc"),y!==null){if(_===Dc)return y.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(_===Uc)return y.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(_===Oc)return y.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(_===Fc)return y.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(_===Yr||_===Bc||_===kc||_===zc||_===Hc||_===ua||_===Gc)if(y=m.get("WEBGL_compressed_texture_etc"),y!==null){if(_===Yr||_===Bc)return v===Ie?y.COMPRESSED_SRGB8_ETC2:y.COMPRESSED_RGB8_ETC2;if(_===kc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:y.COMPRESSED_RGBA8_ETC2_EAC;if(_===zc)return y.COMPRESSED_R11_EAC;if(_===Hc)return y.COMPRESSED_SIGNED_R11_EAC;if(_===ua)return y.COMPRESSED_RG11_EAC;if(_===Gc)return y.COMPRESSED_SIGNED_RG11_EAC}else return null;if(_===Vc||_===Wc||_===Xc||_===qc||_===Yc||_===$c||_===Zc||_===Jc||_===Kc||_===jc||_===Qc||_===th||_===eh||_===nh)if(y=m.get("WEBGL_compressed_texture_astc"),y!==null){if(_===Vc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:y.COMPRESSED_RGBA_ASTC_4x4_KHR;if(_===Wc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:y.COMPRESSED_RGBA_ASTC_5x4_KHR;if(_===Xc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:y.COMPRESSED_RGBA_ASTC_5x5_KHR;if(_===qc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:y.COMPRESSED_RGBA_ASTC_6x5_KHR;if(_===Yc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:y.COMPRESSED_RGBA_ASTC_6x6_KHR;if(_===$c)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:y.COMPRESSED_RGBA_ASTC_8x5_KHR;if(_===Zc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:y.COMPRESSED_RGBA_ASTC_8x6_KHR;if(_===Jc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:y.COMPRESSED_RGBA_ASTC_8x8_KHR;if(_===Kc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:y.COMPRESSED_RGBA_ASTC_10x5_KHR;if(_===jc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:y.COMPRESSED_RGBA_ASTC_10x6_KHR;if(_===Qc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:y.COMPRESSED_RGBA_ASTC_10x8_KHR;if(_===th)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:y.COMPRESSED_RGBA_ASTC_10x10_KHR;if(_===eh)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:y.COMPRESSED_RGBA_ASTC_12x10_KHR;if(_===nh)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:y.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(_===ih||_===$r||_===Zr)if(y=m.get("EXT_texture_compression_bptc"),y!==null){if(_===ih)return v===Ie?y.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:y.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(_===$r)return y.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(_===Zr)return y.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(_===sh||_===rh||_===da||_===oh)if(y=m.get("EXT_texture_compression_rgtc"),y!==null){if(_===sh)return y.COMPRESSED_RED_RGTC1_EXT;if(_===rh)return y.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(_===da)return y.COMPRESSED_RED_GREEN_RGTC2_EXT;if(_===oh)return y.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(_===hs)return p.UNSIGNED_INT_24_8;return p[_]!==void 0?p[_]:null}return{convert:g}}var Kb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,jb=`
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

}`;class sm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(p,m){if(this.texture===null){let g=new Ea(p.texture);if(p.depthNear!==m.depthNear||p.depthFar!==m.depthFar)this.depthNear=p.depthNear,this.depthFar=p.depthFar;this.texture=g}}getMesh(p){if(this.texture!==null){if(this.mesh===null){let m=p.cameras[0].viewport,g=new Ai({vertexShader:Kb,fragmentShader:jb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:m.z},depthHeight:{value:m.w}}});this.mesh=new He(new no(20,20),g)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class rm extends Si{constructor(p,m){super();let g=this,_=null,x=1,y=null,v="local-floor",b=1,S=null,M=null,E=null,w=null,T=null,A=null,R=typeof XRWebGLBinding<"u",N=new sm,C={},P=m.getContextAttributes(),I=null,U=null,D=[],F=[],z=new Jt,L=null,O=null,H=new Cn;H.viewport=new ke;let V=new Cn;V.viewport=new ke;let G=[H,V],W=new Fh,J=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(at){let mt=D[at];if(mt===void 0)mt=new jr,D[at]=mt;return mt.getTargetRaySpace()},this.getControllerGrip=function(at){let mt=D[at];if(mt===void 0)mt=new jr,D[at]=mt;return mt.getGripSpace()},this.getHand=function(at){let mt=D[at];if(mt===void 0)mt=new jr,D[at]=mt;return mt.getHandSpace()};function Q(at){let mt=F.indexOf(at.inputSource);if(mt===-1)return;let Ct=D[mt];if(Ct!==void 0)Ct.update(at.inputSource,at.frame,S||y),Ct.dispatchEvent({type:at.type,data:at.inputSource})}function st(){_.removeEventListener("select",Q),_.removeEventListener("selectstart",Q),_.removeEventListener("selectend",Q),_.removeEventListener("squeeze",Q),_.removeEventListener("squeezestart",Q),_.removeEventListener("squeezeend",Q),_.removeEventListener("end",st),_.removeEventListener("inputsourceschange",tt);for(let at=0;at<D.length;at++){let mt=F[at];if(mt===null)continue;F[at]=null,D[at].disconnect(mt)}J=null,X=null,N.reset();for(let at in C)delete C[at];if(p.setRenderTarget(I),T=null,w=null,E=null,_=null,U=null,Dt.stop(),g.isPresenting=!1,p.setPixelRatio(L),p.setSize(z.width,z.height,!1),O!==null){let at=O.camera;at.fov=O.fov,at.zoom=O.zoom,at.updateProjectionMatrix(),O=null}g.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(at){if(x=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(at){if(v=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||y},this.setReferenceSpace=function(at){S=at},this.getBaseLayer=function(){return w!==null?w:T},this.getBinding=function(){if(E===null&&R)E=new XRWebGLBinding(_,m);return E},this.getFrame=function(){return A},this.getSession=function(){return _},this.setSession=async function(at){if(_=at,_!==null){if(I=p.getRenderTarget(),_.addEventListener("select",Q),_.addEventListener("selectstart",Q),_.addEventListener("selectend",Q),_.addEventListener("squeeze",Q),_.addEventListener("squeezestart",Q),_.addEventListener("squeezeend",Q),_.addEventListener("end",st),_.addEventListener("inputsourceschange",tt),P.xrCompatible!==!0)await m.makeXRCompatible();if(L=p.getPixelRatio(),p.getSize(z),!(R&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Ct={antialias:P.antialias,alpha:!0,depth:P.depth,stencil:P.stencil,framebufferScaleFactor:x};T=new XRWebGLLayer(_,m,Ct),_.updateRenderState({baseLayer:T}),p.setPixelRatio(1),p.setSize(T.framebufferWidth,T.framebufferHeight,!1),U=new Vn(T.framebufferWidth,T.framebufferHeight,{format:Gn,type:jn,colorSpace:p.outputColorSpace,stencilBuffer:P.stencil,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1,storeMultisampledDepthBuffer:T.ignoreDepthValues===!1,storeMultisampledStencilBuffer:T.ignoreDepthValues===!1})}else{let Ct=null,Ut=null,Ht=null;if(P.depth)Ht=P.stencil?m.DEPTH24_STENCIL8:m.DEPTH_COMPONENT24,Ct=P.stencil?ki:Qs,Ut=P.stencil?hs:Bi;let Et={colorFormat:m.RGBA8,depthFormat:Ht,scaleFactor:x};E=this.getBinding(),w=E.createProjectionLayer(Et),_.updateRenderState({layers:[w]}),p.setPixelRatio(1),p.setSize(w.textureWidth,w.textureHeight,!1),U=new Vn(w.textureWidth,w.textureHeight,{format:Gn,type:jn,depthTexture:new Vi(w.textureWidth,w.textureHeight,Ut,void 0,void 0,void 0,void 0,void 0,void 0,Ct),stencilBuffer:P.stencil,colorSpace:p.outputColorSpace,samples:P.antialias?4:0,resolveDepthBuffer:w.ignoreDepthValues===!1,resolveStencilBuffer:w.ignoreDepthValues===!1,storeMultisampledDepthBuffer:w.ignoreDepthValues===!1,storeMultisampledStencilBuffer:w.ignoreDepthValues===!1})}U.isXRRenderTarget=!0,this.setFoveation(b),S=null,y=await _.requestReferenceSpace(v),Dt.setContext(_),Dt.start(),g.isPresenting=!0,g.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(_!==null)return _.environmentBlendMode},this.getDepthTexture=function(){return N.getDepthTexture()};function tt(at){for(let mt=0;mt<at.removed.length;mt++){let Ct=at.removed[mt],Ut=F.indexOf(Ct);if(Ut>=0)F[Ut]=null,D[Ut].disconnect(Ct)}for(let mt=0;mt<at.added.length;mt++){let Ct=at.added[mt],Ut=F.indexOf(Ct);if(Ut===-1){for(let Et=0;Et<D.length;Et++)if(Et>=F.length){F.push(Ct),Ut=Et;break}else if(F[Et]===null){F[Et]=Ct,Ut=Et;break}if(Ut===-1)break}let Ht=D[Ut];if(Ht)Ht.connect(Ct)}}function _t(at,mt){if(mt===null)at.matrixWorld.copy(at.matrix);else at.matrixWorld.multiplyMatrices(mt.matrixWorld,at.matrix);at.matrixWorldInverse.copy(at.matrixWorld).invert()}this.updateCamera=function(at){if(_===null)return;let{near:mt,far:Ct}=at;if(N.texture!==null){if(N.depthNear>0)mt=N.depthNear;if(N.depthFar>0)Ct=N.depthFar}if(W.near=V.near=H.near=mt,W.far=V.far=H.far=Ct,J!==W.near||X!==W.far)_.updateRenderState({depthNear:W.near,depthFar:W.far}),J=W.near,X=W.far;W.layers.mask=at.layers.mask|6,H.layers.mask=W.layers.mask&-5,V.layers.mask=W.layers.mask&-3;let Ut=at.parent,Ht=W.cameras;_t(W,Ut);for(let Et=0;Et<Ht.length;Et++)_t(Ht[Et],Ut);if(W.projectionMatrix.copy(H.projectionMatrix),W.projectionMatrixInverse.copy(H.projectionMatrixInverse),O===null&&at.isPerspectiveCamera)O={camera:at,fov:at.fov,zoom:at.zoom};ot(at,W,Ut)};function ot(at,mt,Ct){if(Ct===null)at.matrix.copy(mt.matrixWorld);else at.matrix.copy(Ct.matrixWorld),at.matrix.invert(),at.matrix.multiply(mt.matrixWorld);if(at.matrix.decompose(at.position,at.quaternion,at.scale),at.updateMatrixWorld(!0),at.projectionMatrix.copy(mt.projectionMatrix),at.projectionMatrixInverse.copy(mt.projectionMatrixInverse),at.isPerspectiveCamera)at.fov=$s*2*Math.atan(1/at.projectionMatrix.elements[5]),at.zoom=1}this.getCamera=function(){return W},this.getFoveation=function(){if(w===null&&T===null)return;return b},this.setFoveation=function(at){if(b=at,w!==null)w.fixedFoveation=at;if(T!==null&&T.fixedFoveation!==void 0)T.fixedFoveation=at},this.hasDepthSensing=function(){return N.texture!==null},this.getDepthSensingMesh=function(){return N.getMesh(W)},this.getCameraTexture=function(at){return C[at]};let ht=null;function xt(at,mt){if(M=mt.getViewerPose(S||y),A=mt,M!==null){let Ct=M.views;if(T!==null)p.setRenderTargetFramebuffer(U,T.framebuffer),p.setRenderTarget(U);let Ut=!1;if(Ct.length!==W.cameras.length)W.cameras.length=0,Ut=!0;for(let te=0;te<Ct.length;te++){let Ft=Ct[te],jt=null;if(T!==null)jt=T.getViewport(Ft);else{let xe=E.getViewSubImage(w,Ft);if(jt=xe.viewport,te===0)p.setRenderTargetTextures(U,xe.colorTexture,xe.depthStencilTexture),p.setRenderTarget(U)}let Yt=G[te];if(Yt===void 0)Yt=new Cn,Yt.layers.enable(te),Yt.viewport=new ke,G[te]=Yt;if(Yt.matrix.fromArray(Ft.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(Ft.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(jt.x,jt.y,jt.width,jt.height),te===0)W.matrix.copy(Yt.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale);if(Ut===!0)W.cameras.push(Yt)}let Ht=_.enabledFeatures;if(Ht&&Ht.includes("depth-sensing")&&_.depthUsage=="gpu-optimized"&&R){E=g.getBinding();let te=E.getDepthInformation(Ct[0]);if(te&&te.isValid&&te.texture)N.init(te,_.renderState)}if(Ht&&Ht.includes("camera-access")&&R){p.state.unbindTexture(),E=g.getBinding();for(let te=0;te<Ct.length;te++){let Ft=Ct[te].camera;if(Ft){let jt=C[Ft];if(!jt)jt=new Ea,C[Ft]=jt;let Yt=E.getCameraImage(Ft);jt.sourceTexture=Yt}}}}for(let Ct=0;Ct<D.length;Ct++){let Ut=F[Ct],Ht=D[Ct];if(Ut!==null&&Ht!==void 0)Ht.update(Ut,mt,S||y)}if(ht)ht(at,mt);if(mt.detectedPlanes)g.dispatchEvent({type:"planesdetected",data:mt});A=null}let Dt=new Vp;Dt.setAnimationLoop(xt),this.setAnimationLoop=function(at){ht=at},this.dispose=function(){}}}var Qb=new Kt,om=new ee;om.set(-1,0,0,0,1,0,0,0,1);function tS(p,m){function g(C,P){if(C.matrixAutoUpdate===!0)C.updateMatrix();P.value.copy(C.matrix)}function _(C,P){if(P.color.getRGB(C.fogColor.value,Sh(p)),P.isFog)C.fogNear.value=P.near,C.fogFar.value=P.far;else if(P.isFogExp2)C.fogDensity.value=P.density}function x(C,P,I,U,D){if(P.isNodeMaterial)P.uniformsNeedUpdate=!1;else if(P.isMeshBasicMaterial)y(C,P);else if(P.isMeshLambertMaterial){if(y(C,P),P.envMap)C.envMapIntensity.value=P.envMapIntensity}else if(P.isMeshToonMaterial)y(C,P),w(C,P);else if(P.isMeshPhongMaterial){if(y(C,P),E(C,P),P.envMap)C.envMapIntensity.value=P.envMapIntensity}else if(P.isMeshStandardMaterial){if(y(C,P),T(C,P),P.isMeshPhysicalMaterial)A(C,P,D)}else if(P.isMeshMatcapMaterial)y(C,P),R(C,P);else if(P.isMeshDepthMaterial)y(C,P);else if(P.isMeshDistanceMaterial)y(C,P),N(C,P);else if(P.isMeshNormalMaterial)y(C,P);else if(P.isLineBasicMaterial){if(v(C,P),P.isLineDashedMaterial)b(C,P)}else if(P.isPointsMaterial)S(C,P,I,U);else if(P.isSpriteMaterial)M(C,P);else if(P.isShadowMaterial)C.color.value.copy(P.color),C.opacity.value=P.opacity;else if(P.isShaderMaterial)P.uniformsNeedUpdate=!1}function y(C,P){if(C.opacity.value=P.opacity,P.color)C.diffuse.value.copy(P.color);if(P.emissive)C.emissive.value.copy(P.emissive).multiplyScalar(P.emissiveIntensity);if(P.map)C.map.value=P.map,g(P.map,C.mapTransform);if(P.alphaMap)C.alphaMap.value=P.alphaMap,g(P.alphaMap,C.alphaMapTransform);if(P.bumpMap){if(C.bumpMap.value=P.bumpMap,g(P.bumpMap,C.bumpMapTransform),C.bumpScale.value=P.bumpScale,P.side===xn)C.bumpScale.value*=-1}if(P.normalMap){if(C.normalMap.value=P.normalMap,g(P.normalMap,C.normalMapTransform),C.normalScale.value.copy(P.normalScale),P.side===xn)C.normalScale.value.negate()}if(P.displacementMap)C.displacementMap.value=P.displacementMap,g(P.displacementMap,C.displacementMapTransform),C.displacementScale.value=P.displacementScale,C.displacementBias.value=P.displacementBias;if(P.emissiveMap)C.emissiveMap.value=P.emissiveMap,g(P.emissiveMap,C.emissiveMapTransform);if(P.specularMap)C.specularMap.value=P.specularMap,g(P.specularMap,C.specularMapTransform);if(P.alphaTest>0)C.alphaTest.value=P.alphaTest;let I=m.get(P),{envMap:U,envMapRotation:D}=I;if(U){if(C.envMap.value=U,C.envMapRotation.value.setFromMatrix4(Qb.makeRotationFromEuler(D)).transpose(),U.isCubeTexture&&U.isRenderTargetTexture===!1)C.envMapRotation.value.premultiply(om);C.reflectivity.value=P.reflectivity,C.ior.value=P.ior,C.refractionRatio.value=P.refractionRatio}if(P.lightMap)C.lightMap.value=P.lightMap,C.lightMapIntensity.value=P.lightMapIntensity,g(P.lightMap,C.lightMapTransform);if(P.aoMap)C.aoMap.value=P.aoMap,C.aoMapIntensity.value=P.aoMapIntensity,g(P.aoMap,C.aoMapTransform)}function v(C,P){if(C.diffuse.value.copy(P.color),C.opacity.value=P.opacity,P.map)C.map.value=P.map,g(P.map,C.mapTransform)}function b(C,P){C.dashSize.value=P.dashSize,C.totalSize.value=P.dashSize+P.gapSize,C.scale.value=P.scale}function S(C,P,I,U){if(C.diffuse.value.copy(P.color),C.opacity.value=P.opacity,C.size.value=P.size*I,C.scale.value=U*0.5,P.map)C.map.value=P.map,g(P.map,C.uvTransform);if(P.alphaMap)C.alphaMap.value=P.alphaMap,g(P.alphaMap,C.alphaMapTransform);if(P.alphaTest>0)C.alphaTest.value=P.alphaTest}function M(C,P){if(C.diffuse.value.copy(P.color),C.opacity.value=P.opacity,C.rotation.value=P.rotation,P.map)C.map.value=P.map,g(P.map,C.mapTransform);if(P.alphaMap)C.alphaMap.value=P.alphaMap,g(P.alphaMap,C.alphaMapTransform);if(P.alphaTest>0)C.alphaTest.value=P.alphaTest}function E(C,P){C.specular.value.copy(P.specular),C.shininess.value=Math.max(P.shininess,0.0001)}function w(C,P){if(P.gradientMap)C.gradientMap.value=P.gradientMap}function T(C,P){if(C.metalness.value=P.metalness,P.metalnessMap)C.metalnessMap.value=P.metalnessMap,g(P.metalnessMap,C.metalnessMapTransform);if(C.roughness.value=P.roughness,P.roughnessMap)C.roughnessMap.value=P.roughnessMap,g(P.roughnessMap,C.roughnessMapTransform);if(P.envMap)C.envMapIntensity.value=P.envMapIntensity}function A(C,P,I){if(C.ior.value=P.ior,P.diffuseRoughness>0){if(C.diffuseRoughness.value=P.diffuseRoughness,P.diffuseRoughnessMap)C.diffuseRoughnessMap.value=P.diffuseRoughnessMap,g(P.diffuseRoughnessMap,C.diffuseRoughnessMapTransform)}if(P.sheen>0){if(C.sheenColor.value.copy(P.sheenColor).multiplyScalar(P.sheen),C.sheenRoughness.value=P.sheenRoughness,P.sheenColorMap)C.sheenColorMap.value=P.sheenColorMap,g(P.sheenColorMap,C.sheenColorMapTransform);if(P.sheenRoughnessMap)C.sheenRoughnessMap.value=P.sheenRoughnessMap,g(P.sheenRoughnessMap,C.sheenRoughnessMapTransform)}if(P.clearcoat>0){if(C.clearcoat.value=P.clearcoat,C.clearcoatRoughness.value=P.clearcoatRoughness,P.clearcoatMap)C.clearcoatMap.value=P.clearcoatMap,g(P.clearcoatMap,C.clearcoatMapTransform);if(P.clearcoatRoughnessMap)C.clearcoatRoughnessMap.value=P.clearcoatRoughnessMap,g(P.clearcoatRoughnessMap,C.clearcoatRoughnessMapTransform);if(P.clearcoatNormalMap){if(C.clearcoatNormalMap.value=P.clearcoatNormalMap,g(P.clearcoatNormalMap,C.clearcoatNormalMapTransform),C.clearcoatNormalScale.value.copy(P.clearcoatNormalScale),P.side===xn)C.clearcoatNormalScale.value.negate()}}if(P.dispersion>0)C.dispersion.value=P.dispersion;if(P.retroreflectivity>0)C.retroreflectivity.value=P.retroreflectivity;if(P.iridescence>0){if(C.iridescence.value=P.iridescence,C.iridescenceIOR.value=P.iridescenceIOR,C.iridescenceThicknessMinimum.value=P.iridescenceThicknessMinimum,C.iridescenceThicknessMaximum.value=P.iridescenceThicknessMaximum,P.iridescenceMap)C.iridescenceMap.value=P.iridescenceMap,g(P.iridescenceMap,C.iridescenceMapTransform);if(P.iridescenceThicknessMap)C.iridescenceThicknessMap.value=P.iridescenceThicknessMap,g(P.iridescenceThicknessMap,C.iridescenceThicknessMapTransform)}if(P.transmission>0){if(C.transmission.value=P.transmission,C.transmissionSamplerMap.value=I.texture,C.transmissionSamplerSize.value.set(I.width,I.height),P.transmissionMap)C.transmissionMap.value=P.transmissionMap,g(P.transmissionMap,C.transmissionMapTransform);if(C.thickness.value=P.thickness,P.thicknessMap)C.thicknessMap.value=P.thicknessMap,g(P.thicknessMap,C.thicknessMapTransform);C.attenuationDistance.value=P.attenuationDistance,C.attenuationColor.value.copy(P.attenuationColor)}if(P.anisotropy>0){if(C.anisotropyVector.value.set(P.anisotropy*Math.cos(P.anisotropyRotation),P.anisotropy*Math.sin(P.anisotropyRotation)),P.anisotropyMap)C.anisotropyMap.value=P.anisotropyMap,g(P.anisotropyMap,C.anisotropyMapTransform)}if(C.specularIntensity.value=P.specularIntensity,C.specularColor.value.copy(P.specularColor),P.specularColorMap)C.specularColorMap.value=P.specularColorMap,g(P.specularColorMap,C.specularColorMapTransform);if(P.specularIntensityMap)C.specularIntensityMap.value=P.specularIntensityMap,g(P.specularIntensityMap,C.specularIntensityMapTransform)}function R(C,P){if(P.matcap)C.matcap.value=P.matcap}function N(C,P){let I=m.get(P).light;C.referencePosition.value.setFromMatrixPosition(I.matrixWorld),C.nearDistance.value=I.shadow.camera.near,C.farDistance.value=I.shadow.camera.far}return{refreshFogUniforms:_,refreshMaterialUniforms:x}}function eS(p,m,g,_){let x={},y={};function v(I,U){let D=U.program;_.uniformBlockBinding(I,D,x[I.id])}function b(I,U){let D=x[I.id];if(D===void 0)R(I),D=S(I),x[I.id]=D,I.addEventListener("dispose",C);let F=U.program;_.updateUBOMapping(I,F);let z=m.render.frame;if(y[I.id]!==z)M(I),y[I.id]=z}function S(I){let U=p.createBuffer(),{__size:D,usage:F}=I;return p.bindBuffer(p.UNIFORM_BUFFER,U),p.bufferData(p.UNIFORM_BUFFER,D,F),p.bindBuffer(p.UNIFORM_BUFFER,null),U}function M(I){let U=x[I.id],{uniforms:D,__cache:F}=I;p.bindBuffer(p.UNIFORM_BUFFER,U);for(let z=0,L=D.length;z<L;z++){let O=D[z];if(Array.isArray(O))for(let H=0,V=O.length;H<V;H++)E(O[H],z,H,F);else E(O,z,0,F)}p.bindBuffer(p.UNIFORM_BUFFER,null)}function E(I,U,D,F){if(T(I,U,D,F)===!0){let{__offset:z,value:L}=I;if(Array.isArray(L)){let O=0;for(let H=0;H<L.length;H++){let V=L[H],G=N(V,!0);w(V,I.__data,O),O+=G.storage/Float32Array.BYTES_PER_ELEMENT}}else w(L,I.__data,0);p.bufferSubData(p.UNIFORM_BUFFER,z,I.__data)}}function w(I,U,D){if(typeof I==="number"||typeof I==="boolean")U[D]=I;else if(I.isMatrix3)U[D]=I.elements[0],U[D+1]=I.elements[1],U[D+2]=I.elements[2],U[D+3]=0,U[D+4]=I.elements[3],U[D+5]=I.elements[4],U[D+6]=I.elements[5],U[D+7]=0,U[D+8]=I.elements[6],U[D+9]=I.elements[7],U[D+10]=I.elements[8],U[D+11]=0;else if(ArrayBuffer.isView(I))U.set(I.subarray(0,U.length-D),D);else I.toArray(U,D)}function T(I,U,D,F){let z=I.value,L=U+"_"+D;if(Array.isArray(z)){if(F[L]===void 0)F[L]=[];let O=F[L],H=!1;for(let V=0;V<z.length;V++)if(A(z[V],O,V)===!0)H=!0;return H}return A(z,F,L)}function A(I,U,D){if(U[D]===void 0){if(typeof I==="number"||typeof I==="boolean")U[D]=I;else if(ArrayBuffer.isView(I))U[D]=I.slice();else U[D]=I.clone();return!0}else{let F=U[D];if(typeof I==="number"||typeof I==="boolean"){if(F!==I)return U[D]=I,!0}else if(ArrayBuffer.isView(I))return!0;else if(F.equals(I)===!1)return F.copy(I),!0}return!1}function R(I){let U=I.uniforms,D=0,F=16;for(let L=0,O=U.length;L<O;L++){let H=Array.isArray(U[L])?U[L]:[U[L]];for(let V=0,G=H.length;V<G;V++){let W=H[V],J=Array.isArray(W.value)?W.value:[W.value],X=Array.isArray(U[L])||Array.isArray(W.value),Q=D;for(let tt=0,_t=J.length;tt<_t;tt++){let ot=J[tt],ht=N(ot,X),xt=D%F,Dt=xt%ht.boundary,at=xt+Dt;if(D+=Dt,at!==0&&F-at<ht.storage)D+=F-at;if(tt===0)Q=D;D+=ht.storage}let st=W.type==="int"?Int32Array:W.type==="uint"?Uint32Array:Float32Array;W.__data=new st((D-Q)/Float32Array.BYTES_PER_ELEMENT),W.__offset=Q}}let z=D%F;if(z>0)D+=F-z;return I.__size=D,I.__cache={},this}function N(I,U){let D={boundary:0,storage:0};if(typeof I==="number"||typeof I==="boolean")D.boundary=4,D.storage=4;else if(I.isVector2)D.boundary=8,D.storage=8;else if(I.isVector3||I.isColor)D.boundary=16,D.storage=12;else if(I.isVector4)D.boundary=16,D.storage=16;else if(I.isMatrix3)D.boundary=16,D.storage=48;else if(I.isMatrix4)D.boundary=16,D.storage=64;else if(I.isTexture)Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(I))D.boundary=16,D.storage=I.byteLength;else Xt("WebGLRenderer: Unsupported uniform value type.",I);if(U===!0)D.boundary=16,D.storage=Math.ceil(D.storage/16)*16;return D}function C(I){let U=I.target;U.removeEventListener("dispose",C),p.deleteBuffer(x[U.id]),delete x[U.id],delete y[U.id]}function P(){for(let I in x)p.deleteBuffer(x[I]);x={},y={}}return{bind:v,update:b,dispose:P}}var nS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),oi=null;function iS(){if(oi===null)oi=new qs(nS,16,16,us,ri),oi.name="DFG_LUT",oi.minFilter=yn,oi.magFilter=yn,oi.wrapS=la,oi.wrapT=la,oi.generateMipmaps=!1,oi.needsUpdate=!0;return oi}class Wh{constructor(p={}){let{canvas:m=cp(),context:g=null,depth:_=!0,stencil:x=!1,alpha:y=!1,antialias:v=!1,premultipliedAlpha:b=!0,preserveDrawingBuffer:S=!1,powerPreference:M="default",failIfMajorPerformanceCaveat:E=!1,reversedDepthBuffer:w=!1,outputBufferType:T=jn}=p;this.isWebGLRenderer=!0;let A;if(g!==null){if(typeof WebGLRenderingContext<"u"&&g instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");A=g.getContextAttributes().alpha}else A=y;let R=T,N=new Set([Nc,Lc,Ic]),C=new Set([jn,Bi,qr,hs,Cc,Pc]),P=new Uint32Array(4),I=new Int32Array(4),U={textures:[],min:[],max:[],resolution:[]},D=null,F=null,z=[],L=[],O=null;this.domElement=m,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let H=this,V=!1,G=null,W=null,J=null,X=null;this._outputColorSpace=fa;let Q=0,st=0,tt=null,_t=-1,ot=null,ht=new ke,xt=new ke,Dt=null,at=new oe(0),mt=0,{width:Ct,height:Ut}=m,Ht=1,Et=null,re=null,te=new ke(0,0,Ct,Ut),Ft=new ke(0,0,Ct,Ut),jt=!1,Yt=new Oi,xe=new Qr,pe=!1,be=!1,ue=new Kt,Qt=new Y,me=new ke,Oe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Fe=!1;function rn(){return tt===null?Ht:1}let j=g;function on(k,K){return m.getContext(k,K)}let ft,Zt,yt,ge,qt,ne,un,q,B,et,gt,pt,St,wt,lt,dt,Mt,Z,ut,ct,vt,bt,Rt;try{let k={alpha:!0,depth:_,stencil:x,antialias:v,premultipliedAlpha:b,preserveDrawingBuffer:S,powerPreference:M,failIfMajorPerformanceCaveat:E};if("setAttribute"in m)m.setAttribute("data-engine",`three.js r${ls}`);if(m.addEventListener("webglcontextlost",It,!1),m.addEventListener("webglcontextrestored",Wt,!1),m.addEventListener("webglcontextcreationerror",ae,!1),j===null){if(j=on("webgl2",k),j===null)if(on("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Vt()}catch(k){throw m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",ae,!1),$t("WebGLRenderer: "+k.message),k}function Vt(){if(ft=new pv(j),ft.init(),vt=new Jb(j,ft),Zt=new iv(j,ft,p,vt),yt=new $b(j,ft),Zt.reversedDepthBuffer&&w)yt.buffers.depth.setReversed(!0);W=j.createFramebuffer(),J=j.createFramebuffer(),X=j.createFramebuffer(),ge=new _v(j),qt=new Db,ne=new Zb(j,ft,yt,qt,Zt,vt,ge),un=new fv(H),q=new y0(j),bt=new ev(j,q),B=new mv(j,q,ge,bt),et=new yv(j,B,q,bt,ge),Z=new xv(j,Zt,ne),lt=new sv(qt),gt=new Nb(H,un,ft,Zt,bt,lt),pt=new tS(H,qt),St=new Ob,wt=new Gb(ft),Mt=new tv(H,un,yt,et,A,b),dt=new Yb(H,et,Zt),Rt=new eS(j,ge,Zt,yt),ut=new nv(j,ft,ge),ct=new gv(j,ft,ge),ge.programs=gt.programs,H.capabilities=Zt,H.extensions=ft,H.properties=qt,H.renderLists=St,H.shadowMap=dt,H.state=yt,H.info=ge}if(R!==jn)O=new bv(R,m.width,m.height,v,_,x);let Gt=new rm(H,j);this.xr=Gt,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){let k=ft.get("WEBGL_lose_context");if(k)k.loseContext()},this.forceContextRestore=function(){let k=ft.get("WEBGL_lose_context");if(k)k.restoreContext()},this.getPixelRatio=function(){return Ht},this.setPixelRatio=function(k){if(k===void 0)return;Ht=k,this.setSize(Ct,Ut,!1)},this.getSize=function(k){return k.set(Ct,Ut)},this.setSize=function(k,K,rt=!0){if(Gt.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Ct=k,Ut=K,m.width=Math.floor(k*Ht),m.height=Math.floor(K*Ht),rt===!0)m.style.width=k+"px",m.style.height=K+"px";if(O!==null)O.setSize(m.width,m.height);this.setViewport(0,0,k,K)},this.getDrawingBufferSize=function(k){return k.set(Ct*Ht,Ut*Ht).floor()},this.setDrawingBufferSize=function(k,K,rt){Ct=k,Ut=K,Ht=rt,m.width=Math.floor(k*rt),m.height=Math.floor(K*rt),this.setViewport(0,0,k,K)},this.setEffects=function(k){if(R===jn){$t("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(k){for(let K=0;K<k.length;K++)if(k[K].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}O.setEffects(k||[])},this.getCurrentViewport=function(k){return k.copy(ht)},this.getViewport=function(k){return k.copy(te)},this.setViewport=function(k,K,rt,nt){if(k.isVector4)te.set(k.x,k.y,k.z,k.w);else te.set(k,K,rt,nt);yt.viewport(ht.copy(te).multiplyScalar(rn()).round())},this.getScissor=function(k){return k.copy(Ft)},this.setScissor=function(k,K,rt,nt){if(k.isVector4)Ft.set(k.x,k.y,k.z,k.w);else Ft.set(k,K,rt,nt);yt.scissor(xt.copy(Ft).multiplyScalar(rn()).round())},this.getScissorTest=function(){return jt},this.setScissorTest=function(k){yt.setScissorTest(jt=k)},this.setOpaqueSort=function(k){Et=k},this.setTransparentSort=function(k){re=k},this.getClearColor=function(k){return k.copy(Mt.getClearColor())},this.setClearColor=function(){Mt.setClearColor(...arguments)},this.getClearAlpha=function(){return Mt.getClearAlpha()},this.setClearAlpha=function(){Mt.setClearAlpha(...arguments)},this.clear=function(k=!0,K=!0,rt=!0){let nt=0;if(k){let it=!1;if(tt!==null){let At=tt.texture.format;it=N.has(At)}if(it){let At=tt.texture.type,Ot=C.has(At),Tt=Mt.getClearColor(),Nt=Mt.getClearAlpha(),{r:zt,g:ie,b:de}=Tt;if(Ot)P[0]=zt,P[1]=ie,P[2]=de,P[3]=Nt,j.clearBufferuiv(j.COLOR,0,P);else I[0]=zt,I[1]=ie,I[2]=de,I[3]=Nt,j.clearBufferiv(j.COLOR,0,I)}else nt|=j.COLOR_BUFFER_BIT}if(K)nt|=j.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(rt)nt|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(nt!==0)j.clear(nt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(k){k.setRenderer(this),G=k},this.dispose=function(){m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",ae,!1),Mt.dispose(),St.dispose(),wt.dispose(),ne.dispose(),qt.dispose(),un.dispose(),et.dispose(),B.dispose(),bt.dispose(),Rt.dispose(),gt.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",Tu),Gt.removeEventListener("sessionend",wu),Zi.stop()};function It(k){k.preventDefault(),Hr("WebGLRenderer: Context Lost."),V=!0}function Wt(){Hr("WebGLRenderer: Context Restored."),V=!1;let k=ge.autoReset,K=dt.enabled,rt=dt.autoUpdate,nt=dt.needsUpdate,it=dt.type;Vt(),ge.autoReset=k,dt.enabled=K,dt.autoUpdate=rt,dt.needsUpdate=nt,dt.type=it}function ae(k){$t("WebGLRenderer: A WebGL context could not be created. Reason: ",k.statusMessage)}function Lt(k){let K=k.target;K.removeEventListener("dispose",Lt),Ae(K)}function Ae(k){Ke(k),qt.remove(k)}function Ke(k){let K=qt.get(k).programs;if(K!==void 0){if(K.forEach(function(rt){gt.releaseProgram(rt)}),k.isShaderMaterial)gt.releaseShaderCache(k)}}this.renderBufferDirect=function(k,K,rt,nt,it,At){if(K===null)K=Oe;let Ot=it.isMesh&&it.matrixWorld.determinantAffine()<0,Tt=Mg(k,K,rt,nt,it);yt.setMaterial(nt,Ot);let Nt=rt.index,zt=1;if(nt.wireframe===!0){if(Nt=B.getWireframeAttribute(rt),Nt===void 0)return;zt=2}let ie=rt.drawRange,de=rt.attributes.position,Bt=ie.start*zt,fe=(ie.start+ie.count)*zt;if(At!==null)Bt=Math.max(Bt,At.start*zt),fe=Math.min(fe,(At.start+At.count)*zt);if(Nt!==null)Bt=Math.max(Bt,0),fe=Math.min(fe,Nt.count);else if(de!==void 0&&de!==null)Bt=Math.max(Bt,0),fe=Math.min(fe,de.count);let Ve=fe-Bt;if(Ve<0||Ve===1/0)return;bt.setup(it,nt,Tt,rt,Nt);let De,Pe=ut;if(Nt!==null)De=q.get(Nt),Pe=ct,Pe.setIndex(De);if(it.isMesh)if(nt.wireframe===!0)yt.setLineWidth(nt.wireframeLinewidth*rn()),Pe.setMode(j.LINES);else Pe.setMode(j.TRIANGLES);else if(it.isLine){let dn=nt.linewidth;if(dn===void 0)dn=1;if(yt.setLineWidth(dn*rn()),it.isLineSegments)Pe.setMode(j.LINES);else if(it.isLineLoop)Pe.setMode(j.LINE_LOOP);else Pe.setMode(j.LINE_STRIP)}else if(it.isPoints)Pe.setMode(j.POINTS);else if(it.isSprite)Pe.setMode(j.TRIANGLES);if(it.isBatchedMesh)if(!ft.get("WEBGL_multi_draw")){let{_multiDrawStarts:dn,_multiDrawCounts:kt,_multiDrawCount:Mn}=it,Se=Nt?q.get(Nt).bytesPerElement:1,Ji=qt.get(nt).currentProgram.getUniforms();for(let fn=0;fn<Mn;fn++)Ji.setValue(j,"_gl_DrawID",fn),Pe.render(dn[fn]/Se,kt[fn])}else Pe.renderMultiDraw(it._multiDrawStarts,it._multiDrawCounts,it._multiDrawCount);else if(it.isInstancedMesh)Pe.renderInstances(Bt,Ve,it.count);else if(rt.isInstancedBufferGeometry){let dn=rt._maxInstanceCount!==void 0?rt._maxInstanceCount:1/0,kt=Math.min(rt.instanceCount,dn);Pe.renderInstances(Bt,Ve,kt)}else Pe.render(Bt,Ve)};function hi(k,K,rt,nt){if(G!==null&&k.isNodeMaterial)G.setObject(nt,k);if(pe===!0)lt.setState(k,rt,!1);if(k.transparent===!0&&k.side===wn&&k.forceSinglePass===!1)k.side=xn,k.needsUpdate=!0,Tr(k,K,nt),k.side=vi,k.needsUpdate=!0,Tr(k,K,nt),k.side=wn;else Tr(k,K,nt)}this.compile=function(k,K,rt=null){if(rt===null)rt=k;if(G!==null)G.renderStart(k,K,rt);if(F=wt.get(rt),F.init(K),L.push(F),rt.traverseVisible(function(it){if(it.isLight&&it.layers.test(K.layers)){if(F.pushLight(it),it.castShadow)F.pushShadow(it)}}),k!==rt)k.traverseVisible(function(it){if(it.isLight&&it.layers.test(K.layers)){if(F.pushLight(it),it.castShadow)F.pushShadow(it)}});if(F.setupLights(),G!==null)G.updateLights(F.state.lightsArray);if(be=this.localClippingEnabled,pe=lt.init(this.clippingPlanes,be),pe===!0)lt.setGlobalState(this.clippingPlanes,K);if(G!==null)dt.render(F.state.shadowsArray,rt,K);let nt=new Set;if(k.traverse(function(it){if(!(it.isMesh||it.isPoints||it.isLine||it.isSprite))return;let At=it.material;if(At)if(Array.isArray(At))for(let Ot=0;Ot<At.length;Ot++){let Tt=At[Ot];hi(Tt,rt,K,it),nt.add(Tt)}else hi(At,rt,K,it),nt.add(At)}),F=L.pop(),G!==null)G.renderEnd();return nt},this.compileAsync=function(k,K,rt=null){let nt=this.compile(k,K,rt);return new Promise((it)=>{function At(){if(nt.forEach(function(Ot){let Nt=qt.get(Ot).currentProgram;if(Nt===void 0||Nt.isReady())nt.delete(Ot)}),nt.size===0){it(k);return}setTimeout(At,10)}if(ft.get("KHR_parallel_shader_compile")!==null)At();else setTimeout(At,10)})};let pl=null;function bg(k){if(pl)pl(k)}function Tu(){Zi.stop()}function wu(){Zi.start()}let Zi=new Vp;if(Zi.setAnimationLoop(bg),typeof self<"u")Zi.setContext(self);this.setAnimationLoop=function(k){pl=k,Gt.setAnimationLoop(k),k===null?Zi.stop():Zi.start()},Gt.addEventListener("sessionstart",Tu),Gt.addEventListener("sessionend",wu),this.render=function(k,K){if(K!==void 0&&K.isCamera!==!0){$t("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;if(G!==null)G.renderStart(k,K);let rt=Gt.enabled===!0&&Gt.isPresenting===!0,nt=O!==null&&(tt===null||rt)&&O.begin(H,tt);if(k.matrixWorldAutoUpdate===!0)k.updateMatrixWorld();if(K.parent===null&&K.matrixWorldAutoUpdate===!0)K.updateMatrixWorld();if(Gt.enabled===!0&&Gt.isPresenting===!0&&(O===null||O.isCompositing()===!1)){if(Gt.cameraAutoUpdate===!0)Gt.updateCamera(K);K=Gt.getCamera()}if(k.isScene===!0)k.onBeforeRender(H,k,K,tt);if(F=wt.get(k,L.length),F.init(K),F.state.textureUnits=ne.getTextureUnits(),L.push(F),ue.multiplyMatrices(K.projectionMatrix,K.matrixWorldInverse),K.isArrayCamera)xe.setFromArrayCamera(K);else Yt.setFromProjectionMatrix(ue,ph,K.reversedDepth);if(be=this.localClippingEnabled,pe=lt.init(this.clippingPlanes,be),D=St.get(k,z.length),D.init(),z.push(D),this.info.render.frame++,Gt.enabled===!0&&Gt.isPresenting===!0){let Ot=H.xr.getDepthSensingMesh();if(Ot!==null)ml(Ot,K,-1/0,H.sortObjects)}if(ml(k,K,0,H.sortObjects),D.finish(),G!==null)G.updateLights(F.state.lightsArray);if(H.sortObjects===!0)D.sort(Et,re);if(Fe=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,Fe)Mt.addToRenderList(D,k);if(this.info.autoReset===!0)this.info.reset();if(pe===!0)lt.beginShadows();let it=F.state.shadowsArray;if(dt.render(it,k,K),pe===!0)lt.endShadows();if((nt&&O.hasRenderPass())===!1){let Ot=D.opaque,Tt=D.transmissive;if(F.setupLights(),K.isArrayCamera){let Nt=K.cameras;if(Tt.length>0)for(let zt=0,ie=Nt.length;zt<ie;zt++){let de=Nt[zt];Ru(Ot,Tt,k,de)}if(Fe)Mt.render(k);for(let zt=0,ie=Nt.length;zt<ie;zt++){let de=Nt[zt];Au(D,k,de,de.viewport)}}else{if(Tt.length>0)Ru(Ot,Tt,k,K);if(Fe)Mt.render(k);Au(D,k,K)}}if(tt!==null&&st===0)ne.updateMultisampleRenderTarget(tt),ne.updateRenderTargetMipmap(tt);if(nt)O.end(H);if(k.isScene===!0)k.onAfterRender(H,k,K);if(bt.resetDefaultState(),_t=-1,ot=null,L.pop(),L.length>0){if(F=L[L.length-1],ne.setTextureUnits(F.state.textureUnits),pe===!0)lt.setGlobalState(H.clippingPlanes,F.state.camera)}else F=null;if(z.pop(),z.length>0)D=z[z.length-1];else D=null;if(G!==null)G.renderEnd()};function ml(k,K,rt,nt){if(k.visible===!1)return;if(k.layers.test(K.layers)){if(k.isGroup)rt=k.renderOrder;else if(k.isLOD){if(k.autoUpdate===!0)k.update(K)}else if(k.isLight){if(F.pushLight(k),k.castShadow)F.pushShadow(k)}else if(k.isSprite){let Ot=K.isArrayCamera?xe:Yt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){if(nt)me.setFromMatrixPosition(k.matrixWorld).applyMatrix4(ue);let Tt=et.update(k),Nt=k.material;if(Nt.visible)D.push(k,Tt,Nt,rt,me.z,null,K)}}else if(k.isMesh||k.isLine||k.isPoints){let Ot=K.isArrayCamera?xe:Yt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){let Tt=et.update(k),Nt=k.material;if(nt){if(k.boundingSphere!==void 0){if(k.boundingSphere===null)k.computeBoundingSphere();me.copy(k.boundingSphere.center)}else{if(Tt.boundingSphere===null)Tt.computeBoundingSphere();me.copy(Tt.boundingSphere.center)}me.applyMatrix4(k.matrixWorld).applyMatrix4(ue)}if(Array.isArray(Nt)){let zt=Tt.groups;for(let ie=0,de=zt.length;ie<de;ie++){let Bt=zt[ie],fe=Nt[Bt.materialIndex];if(fe&&fe.visible)D.push(k,Tt,fe,rt,me.z,Bt,K)}}else if(Nt.visible)D.push(k,Tt,Nt,rt,me.z,null,K)}}}let At=k.children;for(let Ot=0,Tt=At.length;Ot<Tt;Ot++)ml(At[Ot],K,rt,nt)}function Au(k,K,rt,nt){let{opaque:it,transmissive:At,transparent:Ot}=k;if(F.setupLightsView(rt),pe===!0)lt.setGlobalState(H.clippingPlanes,rt);if(nt)yt.viewport(ht.copy(nt));if(it.length>0)Mo(it,K,rt);if(At.length>0)Mo(At,K,rt);if(Ot.length>0)Mo(Ot,K,rt);yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function Ru(k,K,rt,nt){if((rt.isScene===!0?rt.overrideMaterial:null)!==null)return;if(F.state.transmissionRenderTarget[nt.id]===void 0){let Bt=ft.has("EXT_color_buffer_half_float")||ft.has("EXT_color_buffer_float");F.state.transmissionRenderTarget[nt.id]=new Vn(1,1,{generateMipmaps:!0,type:Bt?ri:jn,minFilter:Kn,samples:Math.max(4,Zt.samples),stencilBuffer:x,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ce.workingColorSpace})}let At=F.state.transmissionRenderTarget[nt.id],Ot=nt.viewport||ht;At.setSize(Ot.z*H.transmissionResolutionScale,Ot.w*H.transmissionResolutionScale);let Tt=H.getRenderTarget(),Nt=H.getActiveCubeFace(),zt=H.getActiveMipmapLevel();if(H.setRenderTarget(At),H.getClearColor(at),mt=H.getClearAlpha(),mt<1)H.setClearColor(16777215,0.5);if(H.clear(),Fe)Mt.render(rt);let ie=H.toneMapping;H.toneMapping=si;let de=nt.viewport;if(nt.viewport!==void 0)nt.viewport=void 0;if(F.setupLightsView(nt),pe===!0)lt.setGlobalState(H.clippingPlanes,nt);if(Mo(k,rt,nt),ne.updateMultisampleRenderTarget(At),ne.updateRenderTargetMipmap(At),ft.has("WEBGL_multisampled_render_to_texture")===!1){let Bt=!1;for(let fe=0,Ve=K.length;fe<Ve;fe++){let De=K[fe],{object:Pe,geometry:dn,material:kt,group:Mn}=De;if(kt.side===wn&&Pe.layers.test(nt.layers)){let Se=kt.side;kt.side=xn,kt.needsUpdate=!0,Cu(Pe,rt,nt,dn,kt,Mn),kt.side=Se,kt.needsUpdate=!0,Bt=!0}}if(Bt===!0)ne.updateMultisampleRenderTarget(At),ne.updateRenderTargetMipmap(At)}if(H.setRenderTarget(Tt,Nt,zt),H.setClearColor(at,mt),de!==void 0)nt.viewport=de;H.toneMapping=ie}function Mo(k,K,rt){let nt=K.isScene===!0?K.overrideMaterial:null;for(let it=0,At=k.length;it<At;it++){let Ot=k[it],{object:Tt,geometry:Nt,group:zt}=Ot,ie=Ot.material;if(ie.allowOverride===!0&&nt!==null)ie=nt;if(Tt.layers.test(rt.layers))Cu(Tt,K,rt,Nt,ie,zt)}}function Cu(k,K,rt,nt,it,At){if(G!==null&&it.isNodeMaterial)G.setObject(k,it);if(k.onBeforeRender(H,K,rt,nt,it,At),k.modelViewMatrix.multiplyMatrices(rt.matrixWorldInverse,k.matrixWorld),k.normalMatrix.getNormalMatrix(k.modelViewMatrix),it.onBeforeRender(H,K,rt,nt,k,At),it.transparent===!0&&it.side===wn&&it.forceSinglePass===!1)it.side=xn,it.needsUpdate=!0,H.renderBufferDirect(rt,K,nt,it,k,At),it.side=vi,it.needsUpdate=!0,H.renderBufferDirect(rt,K,nt,it,k,At),it.side=wn;else H.renderBufferDirect(rt,K,nt,it,k,At);k.onAfterRender(H,K,rt,nt,it,At)}function Pu(k){let K=0;for(let rt of k)if(rt.texture!==null)K++;return K}function Tr(k,K,rt){if(K.isScene!==!0)K=Oe;let nt=qt.get(k),it=F.state.lights,At=F.state.shadowsArray,Ot=it.state.version,Tt=gt.getParameters(k,it.state,At,K,rt,F.state.lightProbeGridArray),Nt=gt.getProgramCacheKey(Tt),zt=nt.programs;nt.environment=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?K.environment:null,nt.fog=K.fog;let ie=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap;if(nt.envMap=un.get(k.envMap||nt.environment,ie),nt.envMapRotation=nt.environment!==null&&k.envMap===null?K.environmentRotation:k.envMapRotation,zt===void 0)k.addEventListener("dispose",Lt),zt=new Map,nt.programs=zt,nt.programVariants=new Map;let de=zt.get(Nt);if(de!==void 0){if(nt.currentProgram===de&&nt.lightsStateVersion===Ot)return Lu(k,Tt),de}else{if(Tt.uniforms=gt.getUniforms(k),G!==null&&k.isNodeMaterial)G.build(k,rt,Tt);k.onBeforeCompile(Tt,H),de=gt.acquireProgram(Tt,Nt),zt.set(Nt,de),nt.uniforms=Tt.uniforms}let Bt=nt.uniforms;if(!k.isShaderMaterial&&!k.isRawShaderMaterial||k.clipping===!0)Bt.clippingPlanes=lt.uniform;if(Lu(k,Tt),nt.needsLights=Tg(k),nt.lightsStateVersion=Ot,nt.needsLights)Bt.ambientLightColor.value=it.state.ambient,Bt.lightProbe.value=it.state.probe,Bt.sunLights.value=it.state.sun,Bt.sunLightShadows.value=it.state.sunShadow,Bt.directionalLights.value=it.state.directional,Bt.directionalLightShadows.value=it.state.directionalShadow,Bt.spotLights.value=it.state.spot,Bt.spotLightShadows.value=it.state.spotShadow,Bt.rectAreaLights.value=it.state.rectArea,Bt.ltc_1.value=it.state.rectAreaLTC1,Bt.ltc_2.value=it.state.rectAreaLTC2,Bt.pointLights.value=it.state.point,Bt.pointLightShadows.value=it.state.pointShadow,Bt.hemisphereLights.value=it.state.hemi,Bt.sunShadowMatrix.value=it.state.sunShadowMatrix,Bt.sunShadowCascade.value=it.state.sunShadowCascade,Bt.directionalShadowMatrix.value=it.state.directionalShadowMatrix,Bt.spotLightMatrix.value=it.state.spotLightMatrix,Bt.spotLightMap.value=it.state.spotLightMap,Bt.pointShadowMatrix.value=it.state.pointShadowMatrix;return nt.numLightProbeGrids=Pu(F.state.lightProbeGridArray),nt.currentProgram=de,nt.uniformsList=null,de}function Sg(k,K,rt,nt,it){let At=qt.get(k),Ot=At.currentProgram.id+","+nt+","+it,Tt=At.programVariants.get(Ot);if(Tt===void 0)Tt=Tr(k,K,rt),At.programVariants.set(Ot,Tt);else At.currentProgram=Tt,At.uniformsList=null,At.outputColorSpace=nt,At.toneMapping=it;return Tt}function Iu(k){if(k.uniformsList===null){let K=k.currentProgram.getUniforms();k.uniformsList=lo.seqWithValue(K.seq,k.uniforms)}return k.uniformsList}function Lu(k,K){let rt=qt.get(k);rt.outputColorSpace=K.outputColorSpace,rt.batching=K.batching,rt.batchingColor=K.batchingColor,rt.instancing=K.instancing,rt.instancingColor=K.instancingColor,rt.instancingMorph=K.instancingMorph,rt.skinning=K.skinning,rt.morphTargets=K.morphTargets,rt.morphNormals=K.morphNormals,rt.morphColors=K.morphColors,rt.morphTargetsCount=K.morphTargetsCount,rt.numClippingPlanes=K.numClippingPlanes,rt.numIntersection=K.numClipIntersection,rt.vertexAlphas=K.vertexAlphas,rt.vertexTangents=K.vertexTangents,rt.toneMapping=K.toneMapping}function Mg(k,K,rt,nt,it){if(K.isScene!==!0)K=Oe;ne.resetTextureUnits();let At=K.fog,Ot=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial?K.environment:null,Tt=tt===null?H.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:ce.workingColorSpace,Nt=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial&&!nt.envMap||nt.isMeshPhongMaterial&&!nt.envMap,zt=un.get(nt.envMap||Ot,Nt),ie=nt.vertexColors===!0&&!!rt.attributes.color&&rt.attributes.color.itemSize===4,de=!!rt.attributes.tangent&&(!!nt.normalMap||nt.anisotropy>0),Bt=!!rt.morphAttributes.position,fe=!!rt.morphAttributes.normal,Ve=!!rt.morphAttributes.color,De=si;if(nt.toneMapped){if(tt===null||tt.isXRRenderTarget===!0)De=H.toneMapping}let Pe=rt.morphAttributes.position||rt.morphAttributes.normal||rt.morphAttributes.color,dn=Pe!==void 0?Pe.length:0,kt=qt.get(nt),Mn=F.state.lights;if(pe===!0){if(be===!0||k!==ot){let Be=k===ot&&nt.id===_t;lt.setState(nt,k,Be)}}let Se=!1,Ji=!1;if(nt.version===kt.__version){if(kt.needsLights&&kt.lightsStateVersion!==Mn.state.version)Se=!0;else if(it.isBatchedMesh&&kt.batching===!1)Se=!0;else if(!it.isBatchedMesh&&kt.batching===!0)Se=!0;else if(it.isBatchedMesh&&kt.batchingColor===!0&&it._colorsTexture===null)Se=!0;else if(it.isBatchedMesh&&kt.batchingColor===!1&&it._colorsTexture!==null)Se=!0;else if(it.isInstancedMesh&&kt.instancing===!1)Se=!0;else if(!it.isInstancedMesh&&kt.instancing===!0)Se=!0;else if(it.isSkinnedMesh&&kt.skinning===!1)Se=!0;else if(!it.isSkinnedMesh&&kt.skinning===!0)Se=!0;else if(it.isInstancedMesh&&kt.instancingColor===!0&&it.instanceColor===null)Se=!0;else if(it.isInstancedMesh&&kt.instancingColor===!1&&it.instanceColor!==null)Se=!0;else if(it.isInstancedMesh&&kt.instancingMorph===!0&&it.morphTexture===null)Se=!0;else if(it.isInstancedMesh&&kt.instancingMorph===!1&&it.morphTexture!==null)Se=!0;else if(kt.envMap!==zt)Se=!0;else if(nt.fog===!0&&kt.fog!==At)Se=!0;else if(kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==lt.numPlanes||kt.numIntersection!==lt.numIntersection))Se=!0;else if(kt.vertexAlphas!==ie)Se=!0;else if(kt.vertexTangents!==de)Se=!0;else if(kt.morphTargets!==Bt)Se=!0;else if(kt.morphNormals!==fe)Se=!0;else if(kt.morphColors!==Ve)Se=!0;else if(kt.morphTargetsCount!==dn)Se=!0;else if(kt.numLightProbeGrids!==Pu(F.state.lightProbeGridArray))Se=!0;else if(kt.outputColorSpace!==Tt||kt.toneMapping!==De)Ji=!0}else Se=!0,kt.__version=nt.version;let fn=kt.currentProgram;if(Se===!0||Ji===!0){if(fn=Ji===!0?Sg(nt,K,it,Tt,De):Tr(nt,K,it),G&&nt.isNodeMaterial)G.onUpdateProgram(nt,fn,kt)}let Eo=!1,Ci=!1,Ki=!1,ye=fn.getUniforms(),an=kt.uniforms;if(yt.useProgram(fn.program))Eo=!0,Ci=!0,Ki=!0;if(nt.id!==_t)_t=nt.id,Ci=!0;if(Eo||ot!==k){if(yt.buffers.depth.getReversed()&&k.reversedDepth!==!0)k._reversedDepth=!0,k.updateProjectionMatrix();ye.setValue(j,"projectionMatrix",k.projectionMatrix),ye.setValue(j,"viewMatrix",k.matrixWorldInverse);let je=ye.map.cameraPosition;if(je!==void 0)je.setValue(j,Qt.setFromMatrixPosition(k.matrixWorld));if(Zt.logarithmicDepthBuffer)ye.setValue(j,"logDepthBufFC",2/(Math.log(k.far+1)/Math.LN2));if(nt.isMeshPhongMaterial||nt.isMeshToonMaterial||nt.isMeshLambertMaterial||nt.isMeshBasicMaterial||nt.isMeshStandardMaterial||nt.isShaderMaterial)ye.setValue(j,"isOrthographic",k.isOrthographicCamera===!0);if(ot!==k)ot=k,Ci=!0,Ki=!0}if(kt.needsLights){if(Mn.state.sunShadowMap.length>0)ye.setValue(j,"sunShadowMap",Mn.state.sunShadowMap,ne);if(Mn.state.directionalShadowMap.length>0)ye.setValue(j,"directionalShadowMap",Mn.state.directionalShadowMap,ne);if(Mn.state.spotShadowMap.length>0)ye.setValue(j,"spotShadowMap",Mn.state.spotShadowMap,ne);if(Mn.state.pointShadowMap.length>0)ye.setValue(j,"pointShadowMap",Mn.state.pointShadowMap,ne)}if(it.isSkinnedMesh){ye.setOptional(j,it,"bindMatrix"),ye.setOptional(j,it,"bindMatrixInverse");let Be=it.skeleton;if(Be){if(Be.boneTexture===null)Be.computeBoneTexture();ye.setValue(j,"boneTexture",Be.boneTexture,ne)}}if(it.isBatchedMesh){if(ye.setOptional(j,it,"batchingTexture"),ye.setValue(j,"batchingTexture",it._matricesTexture,ne),ye.setOptional(j,it,"batchingIdTexture"),ye.setValue(j,"batchingIdTexture",it._indirectTexture,ne),ye.setOptional(j,it,"batchingColorTexture"),it._colorsTexture!==null)ye.setValue(j,"batchingColorTexture",it._colorsTexture,ne)}let Yn=rt.morphAttributes;if(Yn.position!==void 0||Yn.normal!==void 0||Yn.color!==void 0)Z.update(it,rt,fn);if(Ci||kt.receiveShadow!==it.receiveShadow)kt.receiveShadow=it.receiveShadow,ye.setValue(j,"receiveShadow",it.receiveShadow);if((nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial)&&nt.envMap===null&&K.environment!==null)an.envMapIntensity.value=K.environmentIntensity;if(an.dfgLUT!==void 0)an.dfgLUT.value=iS();if(Ci){if(ye.setValue(j,"toneMappingExposure",H.toneMappingExposure),kt.needsLights)Eg(an,Ki);if(At&&nt.fog===!0)pt.refreshFogUniforms(an,At);if(pt.refreshMaterialUniforms(an,nt,Ht,Ut,F.state.transmissionRenderTarget[k.id]),kt.needsLights&&kt.numLightProbeGrids>0){let Be=U,je=0;for(let ui of F.state.lightProbeGridArray){if(ui.texture===null)continue;Be.textures[je]=ui.texture,Be.min[je]=ui.boundingBox.min,Be.max[je]=ui.boundingBox.max,Be.resolution[je]=ui.resolution,je++}for(let ui in Be)Be[ui].length=je;an.probesSH.value=Be.textures,an.probesMin.value=Be.min,an.probesMax.value=Be.max,an.probesResolution.value=Be.resolution}lo.upload(j,Iu(kt),an,ne)}if(nt.isShaderMaterial&&nt.uniformsNeedUpdate===!0)lo.upload(j,Iu(kt),an,ne),nt.uniformsNeedUpdate=!1;if(nt.isSpriteMaterial)ye.setValue(j,"center",it.center);if(ye.setValue(j,"modelViewMatrix",it.modelViewMatrix),ye.setValue(j,"normalMatrix",it.normalMatrix),ye.setValue(j,"modelMatrix",it.matrixWorld),nt.uniformsGroups!==void 0){let Be=nt.uniformsGroups;for(let je=0,ui=Be.length;je<ui;je++){let Du=Be[je];Rt.update(Du,fn),Rt.bind(Du,fn)}}return fn}function Eg(k,K){k.ambientLightColor.needsUpdate=K,k.lightProbe.needsUpdate=K,k.sunLights.needsUpdate=K,k.sunLightShadows.needsUpdate=K,k.directionalLights.needsUpdate=K,k.directionalLightShadows.needsUpdate=K,k.pointLights.needsUpdate=K,k.pointLightShadows.needsUpdate=K,k.spotLights.needsUpdate=K,k.spotLightShadows.needsUpdate=K,k.rectAreaLights.needsUpdate=K,k.hemisphereLights.needsUpdate=K}function Tg(k){return k.isMeshLambertMaterial||k.isMeshToonMaterial||k.isMeshPhongMaterial||k.isMeshStandardMaterial||k.isShadowMaterial||k.isShaderMaterial&&k.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return st},this.getRenderTarget=function(){return tt},this.setRenderTargetTextures=function(k,K,rt){let nt=qt.get(k);if(nt.__autoAllocateDepthBuffer=k.resolveDepthBuffer===!1,nt.__autoAllocateDepthBuffer===!1)nt.__useRenderToTexture=!1;qt.get(k.texture).__webglTexture=K,qt.get(k.depthTexture).__webglTexture=nt.__autoAllocateDepthBuffer?void 0:rt,nt.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(k,K){let rt=qt.get(k);rt.__webglFramebuffer=K,rt.__useDefaultFramebuffer=K===void 0},this.setRenderTarget=function(k,K=0,rt=0){tt=k,Q=K,st=rt;let nt=null,it=!1,At=!1;if(k){let Tt=qt.get(k);if(Tt.__useDefaultFramebuffer!==void 0){yt.bindFramebuffer(j.FRAMEBUFFER,Tt.__webglFramebuffer),ht.copy(k.viewport),xt.copy(k.scissor),Dt=k.scissorTest,yt.viewport(ht),yt.scissor(xt),yt.setScissorTest(Dt),_t=-1;return}else if(Tt.__webglFramebuffer===void 0)ne.setupRenderTarget(k);else if(Tt.__hasExternalTextures)ne.rebindTextures(k,qt.get(k.texture).__webglTexture,qt.get(k.depthTexture).__webglTexture);else if(k.depthBuffer){let ie=k.depthTexture;if(Tt.__boundDepthTexture!==ie){if(ie!==null&&qt.has(ie)&&(k.width!==ie.image.width||k.height!==ie.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ne.setupDepthRenderbuffer(k)}}let Nt=k.texture;if(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)At=!0;let zt=qt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget){if(Array.isArray(zt[K]))nt=zt[K][rt];else nt=zt[K];it=!0}else if(k.samples>0&&ne.useMultisampledRTT(k)===!1)nt=qt.get(k).__webglMultisampledFramebuffer;else if(Array.isArray(zt))nt=zt[rt];else nt=zt;ht.copy(k.viewport),xt.copy(k.scissor),Dt=k.scissorTest}else ht.copy(te).multiplyScalar(Ht).floor(),xt.copy(Ft).multiplyScalar(Ht).floor(),Dt=jt;if(rt!==0)nt=W;if(yt.bindFramebuffer(j.FRAMEBUFFER,nt))yt.drawBuffers(k,nt);if(yt.viewport(ht),yt.scissor(xt),yt.setScissorTest(Dt),it){let Tt=qt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+K,Tt.__webglTexture,rt)}else if(At){let Tt=K;for(let Nt=0;Nt<k.textures.length;Nt++){let zt=qt.get(k.textures[Nt]);j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0+Nt,zt.__webglTexture,rt,Tt)}}else if(k!==null&&rt!==0){let Tt=qt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,Tt.__webglTexture,rt)}_t=-1};function Nu(k){let K=qt.get(k);if(K.__readFormat!==k.format||K.__readType!==k.type)K.__readFormat=k.format,K.__readType=k.type,K.__formatReadable=Zt.textureFormatReadable(k.format),K.__typeReadable=Zt.textureTypeReadable(k.type);return K}if(this.readRenderTargetPixels=function(k,K,rt,nt,it,At,Ot,Tt=0){if(!(k&&k.isWebGLRenderTarget)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=qt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt){yt.bindFramebuffer(j.FRAMEBUFFER,Nt);try{let zt=k.textures[Tt],{format:ie,type:de}=zt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Tt);let Bt=Nu(zt);if(Bt.__formatReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Bt.__typeReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(K>=0&&K<=k.width-nt&&(rt>=0&&rt<=k.height-it))j.readPixels(K,rt,nt,it,vt.convert(ie),vt.convert(de),At)}finally{let zt=tt!==null?qt.get(tt).__webglFramebuffer:null;yt.bindFramebuffer(j.FRAMEBUFFER,zt)}}},this.readRenderTargetPixelsAsync=async function(k,K,rt,nt,it,At,Ot,Tt=0){if(!(k&&k.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=qt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt)if(K>=0&&K<=k.width-nt&&(rt>=0&&rt<=k.height-it)){yt.bindFramebuffer(j.FRAMEBUFFER,Nt);let zt=k.textures[Tt],{format:ie,type:de}=zt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Tt);let Bt=Nu(zt);if(Bt.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Bt.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let fe=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.bufferData(j.PIXEL_PACK_BUFFER,At.byteLength,j.STREAM_READ),j.readPixels(K,rt,nt,it,vt.convert(ie),vt.convert(de),0),j.bindBuffer(j.PIXEL_PACK_BUFFER,null);let Ve=tt!==null?qt.get(tt).__webglFramebuffer:null;yt.bindFramebuffer(j.FRAMEBUFFER,Ve);let De=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await up(j,De,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,At),j.bindBuffer(j.PIXEL_PACK_BUFFER,null),j.deleteBuffer(fe),j.deleteSync(De),At}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(k,K=null,rt=0){let nt=Math.pow(2,-rt),it=Math.floor(k.image.width*nt),At=Math.floor(k.image.height*nt),Ot=K!==null?K.x:0,Tt=K!==null?K.y:0;ne.setTexture2D(k,0),j.copyTexSubImage2D(j.TEXTURE_2D,rt,0,0,Ot,Tt,it,At),yt.unbindTexture()},this.copyTextureToTexture=function(k,K,rt=null,nt=null,it=0,At=0){let Ot,Tt,Nt,zt,ie,de,Bt,fe,Ve,De=k.isCompressedTexture?k.mipmaps[At]:k.image;if(rt!==null)Ot=rt.max.x-rt.min.x,Tt=rt.max.y-rt.min.y,Nt=rt.isBox3?rt.max.z-rt.min.z:1,zt=rt.min.x,ie=rt.min.y,de=rt.isBox3?rt.min.z:0;else{let ye=Math.pow(2,-it);if(Ot=Math.floor(De.width*ye),Tt=Math.floor(De.height*ye),k.isDataArrayTexture)Nt=De.depth;else if(k.isData3DTexture)Nt=Math.floor(De.depth*ye);else Nt=1;zt=0,ie=0,de=0}if(nt!==null)Bt=nt.x,fe=nt.y,Ve=nt.z;else Bt=0,fe=0,Ve=0;let Pe=vt.convert(K.format),dn=vt.convert(K.type),kt;if(K.isData3DTexture)ne.setTexture3D(K,0),kt=j.TEXTURE_3D;else if(K.isDataArrayTexture||K.isCompressedArrayTexture)ne.setTexture2DArray(K,0),kt=j.TEXTURE_2D_ARRAY;else ne.setTexture2D(K,0),kt=j.TEXTURE_2D;yt.activeTexture(j.TEXTURE0),yt.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,K.flipY),yt.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,K.premultiplyAlpha),yt.pixelStorei(j.UNPACK_ALIGNMENT,K.unpackAlignment);let Mn=yt.getParameter(j.UNPACK_ROW_LENGTH),Se=yt.getParameter(j.UNPACK_IMAGE_HEIGHT),Ji=yt.getParameter(j.UNPACK_SKIP_PIXELS),fn=yt.getParameter(j.UNPACK_SKIP_ROWS),Eo=yt.getParameter(j.UNPACK_SKIP_IMAGES);yt.pixelStorei(j.UNPACK_ROW_LENGTH,De.width),yt.pixelStorei(j.UNPACK_IMAGE_HEIGHT,De.height),yt.pixelStorei(j.UNPACK_SKIP_PIXELS,zt),yt.pixelStorei(j.UNPACK_SKIP_ROWS,ie),yt.pixelStorei(j.UNPACK_SKIP_IMAGES,de);let Ci=k.isDataArrayTexture||k.isData3DTexture,Ki=K.isDataArrayTexture||K.isData3DTexture;if(k.isDepthTexture){let ye=qt.get(k),an=qt.get(K),Yn=qt.get(ye.__renderTarget),Be=qt.get(an.__renderTarget);yt.bindFramebuffer(j.READ_FRAMEBUFFER,Yn.__webglFramebuffer),yt.bindFramebuffer(j.DRAW_FRAMEBUFFER,Be.__webglFramebuffer);for(let je=0;je<Nt;je++){if(Ci)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,qt.get(k).__webglTexture,it,de+je),j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,qt.get(K).__webglTexture,At,Ve+je);j.blitFramebuffer(zt,ie,zt+Ot,ie+Tt,Bt,fe,Bt+Ot,fe+Tt,j.DEPTH_BUFFER_BIT,j.NEAREST)}yt.bindFramebuffer(j.READ_FRAMEBUFFER,null),yt.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(it!==0||k.isRenderTargetTexture||qt.has(k)){let ye=qt.get(k),an=qt.get(K);yt.bindFramebuffer(j.READ_FRAMEBUFFER,J),yt.bindFramebuffer(j.DRAW_FRAMEBUFFER,X);for(let Yn=0;Yn<Nt;Yn++){if(Ci)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,ye.__webglTexture,it,de+Yn);else j.framebufferTexture2D(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,ye.__webglTexture,it);if(Ki)j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,an.__webglTexture,At,Ve+Yn);else j.framebufferTexture2D(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,an.__webglTexture,At);if(it!==0)j.blitFramebuffer(zt,ie,zt+Ot,ie+Tt,Bt,fe,Bt+Ot,fe+Tt,j.COLOR_BUFFER_BIT,j.NEAREST);else if(Ki)j.copyTexSubImage3D(kt,At,Bt,fe,Ve+Yn,zt,ie,Ot,Tt);else j.copyTexSubImage2D(kt,At,Bt,fe,zt,ie,Ot,Tt)}yt.bindFramebuffer(j.READ_FRAMEBUFFER,null),yt.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(Ki)if(k.isDataTexture||k.isData3DTexture)j.texSubImage3D(kt,At,Bt,fe,Ve,Ot,Tt,Nt,Pe,dn,De.data);else if(K.isCompressedArrayTexture)j.compressedTexSubImage3D(kt,At,Bt,fe,Ve,Ot,Tt,Nt,Pe,De.data);else j.texSubImage3D(kt,At,Bt,fe,Ve,Ot,Tt,Nt,Pe,dn,De);else if(k.isDataTexture)j.texSubImage2D(j.TEXTURE_2D,At,Bt,fe,Ot,Tt,Pe,dn,De.data);else if(k.isCompressedTexture)j.compressedTexSubImage2D(j.TEXTURE_2D,At,Bt,fe,De.width,De.height,Pe,De.data);else j.texSubImage2D(j.TEXTURE_2D,At,Bt,fe,Ot,Tt,Pe,dn,De);if(yt.pixelStorei(j.UNPACK_ROW_LENGTH,Mn),yt.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Se),yt.pixelStorei(j.UNPACK_SKIP_PIXELS,Ji),yt.pixelStorei(j.UNPACK_SKIP_ROWS,fn),yt.pixelStorei(j.UNPACK_SKIP_IMAGES,Eo),At===0&&K.generateMipmaps===!0&&K.mipmapsAutoUpdate===!0)j.generateMipmap(kt);yt.unbindTexture()},this.initRenderTarget=function(k){if(qt.get(k).__webglFramebuffer===void 0)ne.setupRenderTarget(k)},this.initTexture=function(k){if(k.isCubeTexture)ne.setTextureCube(k,0);else if(k.isData3DTexture)ne.setTexture3D(k,0);else if(k.isDataArrayTexture||k.isCompressedArrayTexture)ne.setTexture2DArray(k,0);else ne.setTexture2D(k,0);yt.unbindTexture()},this.resetState=function(){Q=0,st=0,tt=null,yt.reset(),bt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ph}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(p){this._outputColorSpace=p;let m=this.getContext();m.drawingBufferColorSpace=ce._getDrawingBufferColorSpace(p),m.unpackColorSpace=ce._getUnpackColorSpace()}}var sS={road_asphalt:"Asphalt",road_concrete:"Concrete",road_cobble:"Cobblestones",road_gravel:"Gravel",road_dirt:"Dirt road",gc_meadow:"Meadow",gc_lawn:"Lawn",gc_forest:"Forest ground",gc_shrub:"Shrubland",gc_rock:"Rock face",gc_scree:"Scree",gc_sand:"Sand",gc_snow:"Snow",gc_alpine:"Alpine ground",gc_wetland:"Wetland",gc_urban:"Urban ground",gc_residential:"Residential ground",gc_yard:"Yard",gc_dirt:"Bare soil",gc_orchard:"Orchard",gc_vineyard:"Vineyard",gc_garden:"Garden",gc_pitch:"Grass pitch",gc_clay:"Clay",gc_court:"Hard court",gc_acrylic:"Acrylic court",gc_tartan:"Running track",gc_cemetery:"Cemetery ground",water:"Painted water",stream_bank:"Stream bank",stream_bed:"Dry stream bed",pitch_line:"Pitch markings",edge_dirt:"Road verge"},cm=(p)=>/^gc_field\d*$/.test(p)?"Field":sS[p]??p;function Wi(p){let m=/^1(?:ROAD|GRASS|GRAVEL)_ground_(-?\d+)_(-?\d+)(?:_\d+)?$/.exec(p);return m?`${m[1]}_${m[2]}`:null}function rS(p){let m=Uint8Array.from(atob(p.slice(0,44)),(y)=>y.charCodeAt(0)),g=new DataView(m.buffer),_=g.getUint32(16),x=g.getUint32(20);if(!_||!x||_>2048||x>2048)throw Error("Invalid ground mask");return _*x*4*2}async function oS(p){let m=Uint8Array.from(atob(p),(x)=>x.charCodeAt(0)),g=await createImageBitmap(new Blob([m]),{imageOrientation:"none",premultiplyAlpha:"none"}),_=new ze(g);return _.flipY=!1,_.wrapS=_.wrapT=js,_.minFilter=_.magFilter=yn,_.generateMipmaps=!1,_.needsUpdate=!0,_}function lm(p){p.image?.close?.(),p.dispose()}class Xh{scene;changed;reserve;release;decode;version=0;masks=new Map;sources=new Set;overlays=new Map;materials=new Map;pending=new Map;allocations=new Set;faces=new Map;faceOverlays=new Map;constructor(p,m,g,_,x=oS){this.scene=p;this.changed=m;this.reserve=g;this.release=_;this.decode=x}async set(p,m){if(this.clear(),!p)return;this.masks=new Map(p.tiles.map((_)=>[`${_.tile[0]}_${_.tile[1]}`,_.mask])),this.faces=new Map((p.meshes??[]).map((_)=>[_.mesh,_.faces]));let g=this.version;for(let _ of m){if(g!==this.version)return;await this.add(_)}}async add(p){let m=this.faces.get(p.userData.info?.i);if(m){this.attachFaces(p,m);return}let g=Wi(p.name);if(!g||!this.masks.has(g))return;this.sources.add(p);let _=this.materials.get(g);if(_){this.attach(p,_.material);return}if(this.pending.has(g))return this.pending.get(g);let x=this.version,y=this.masks.get(g),v=rS(y);if(!this.reserve(v))throw Error("Not enough preview memory to highlight this surface. Increase the limit in Settings.");let b={bytes:v};this.allocations.add(b);let S=(async()=>{let M=!1;try{let E=await this.decode(y);if(x!==this.version){lm(E);return}let w=new ir({color:2596863,alphaMap:E,opacity:0.45,transparent:!0,side:wn,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});this.materials.set(g,{material:w,bytes:v}),M=!0;for(let T of this.sources)if(Wi(T.name)===g)this.attach(T,w)}finally{if(!M)this.free(b);if(x===this.version)this.pending.delete(g)}})();return this.pending.set(g,S),S}attach(p,m){if(this.overlays.has(p))return;let g=new He(p.geometry,m);g.renderOrder=5,g.visible=p.visible,this.overlays.set(p,g),this.scene.add(g),this.changed()}follow(){for(let[p,m]of this.overlays)m.visible=p.visible;for(let[p,m]of this.faceOverlays){m.overlay.visible=p.visible;let g=p.geometry.getAttribute("position"),_="data"in g?g.data.version:g.version;if(_!==m.stamp){for(let b of Object.keys(p.geometry.attributes)){let S=p.geometry.getAttribute(b),M=m.overlay.geometry.getAttribute(b);for(let E=0;E<S.count;E++)for(let w=0;w<S.itemSize;w++)M.setComponent(E,w,S.getComponent(E,w));M.needsUpdate=!0}m.overlay.geometry.computeBoundingSphere(),m.stamp=_}let x=p.geometry.getIndex();if(x.version!==m.indexStamp){let b=m.overlay.geometry.getIndex();m.faces.forEach((S,M)=>{for(let E=0;E<3;E++)b.setX(M*3+E,x.getX(S*3+E))}),b.needsUpdate=!0,m.indexStamp=x.version}let y=m.overlay.material,v=p.material;if(y.map!==v.map)y.map=v.map,y.needsUpdate=!0}}attachFaces(p,m){if(this.faceOverlays.has(p))return;let g=((p.userData.info?.vertices??p.geometry.getAttribute("position").count)*44+m.length*6)*2;if(!this.reserve(g))throw Error("Not enough preview memory to highlight this material. Increase the limit in Settings.");let _={bytes:g};this.allocations.add(_);try{let x=p.geometry.clone(),y=p.geometry.getIndex();x.setIndex(m.flatMap((M)=>[0,1,2].map((E)=>y.getX(M*3+E))));let v=p.material,b=new ir({color:2596863,map:v.map,alphaTest:v.alphaTest,opacity:0.55,transparent:!0,side:wn,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),S=new He(x,b);S.renderOrder=5,this.faceOverlays.set(p,{overlay:S,faces:m,stamp:-1,indexStamp:-1}),this.scene.add(S),this.follow(),this.changed()}catch(x){throw this.free(_),x}}free(p){if(this.allocations.delete(p))this.release(p.bytes)}clear(){this.version++;for(let p of this.overlays.values())this.scene.remove(p);for(let{overlay:p}of this.faceOverlays.values())this.scene.remove(p),p.geometry.dispose(),p.material.dispose();for(let{material:p}of this.materials.values())lm(p.alphaMap),p.dispose();for(let p of this.allocations)this.free(p);this.overlays.clear(),this.materials.clear(),this.masks.clear(),this.sources.clear(),this.pending.clear(),this.faces.clear(),this.faceOverlays.clear(),this.changed()}}function hm({name:p,surfaces:m,view:g}){let[_,x]=n(null),[y,v]=n(null);if(i(()=>{let b=new AbortController;return(async()=>{try{let S=m.filter((A)=>A.face===void 0),M=m.filter((A)=>A.face!==void 0).map((A)=>g.materialSelection(A));if(S.length){let A=new URLSearchParams({r:S[0].revision,points:JSON.stringify(S)}),R=await fetch(`/api/editor/${encodeURIComponent(p)}/surface?${A}`,{signal:b.signal}),N=await R.json();if(!R.ok)throw Error(N.error??"Could not select this ground");M.push(N)}if(b.signal.aborted)return;let E=[...new Set(M.flatMap((A)=>A.materials??[A.material]))],w=new Map;for(let A of M)for(let R of A.meshes??[]){if(!w.has(R.mesh))w.set(R.mesh,new Set);for(let N of R.faces)w.get(R.mesh).add(N)}let T={material:E[0],materials:E,truncated:M.some((A)=>A.truncated),tiles:M.flatMap((A)=>A.tiles),meshes:[...w].map(([A,R])=>({mesh:A,faces:[...R]}))};if(await g.setSurface(T,(A)=>{if(!b.signal.aborted)v(A)}),!b.signal.aborted)x(T)}catch(S){if(!b.signal.aborted)g.setSurface(null),v(S instanceof Error?S.message:"Could not select this ground")}})(),()=>{b.abort(),g.setSurface(null)}},[p,m,g]),y)return t("p",{id:"edit-surface-error",className:"small muted",children:y});return e("p",{id:"edit-surface",className:"small muted",children:[_?`${(_.materials??[_.material]).map(cm).join(", ")} selected. Esc clears the selection.`:"Selecting ground…",_?.truncated&&" The surface continues beyond the highlighted area."]})}function um({name:p,title:m,taken:g,view:_,scene:x,fileHost:y,savedHost:v,toolsHost:b,notesHost:S,elevationSpeed:M,reopen:E,onSaved:w}){let[T]=n(()=>new Al(p)),A=d(T.subscribe,T.state),[R,N]=n(null),[C,P]=n(null),[I,U]=n([]),[D,F]=n([]),[z,L]=n(!1),[O,H]=n(!1),[V,G]=n("select"),[W,J]=n(0),[X,Q]=n(null),[st,tt]=n(null),_t=s(()=>{}),ot=o((ft)=>{_t.current=ft},[]),ht=T.canEdit(),xt=V==="elevation"&&ht,Dt=V==="delete"&&ht,at=(V==="road"||V==="smooth")&&ht,mt=V==="smooth"&&ht,Ct=V==="move"&&ht,Ut=Md({name:p,edits:T,state:A,view:_,onSaved:w}),Ht=dd({name:p,view:_,edits:T,enabled:xt,speed:M,onNote:Q}),Et=Ad({name:p,view:_,edits:T,enabled:at,previewing:mt,revision:A.keptRevision,onNote:Q}),re=qu({view:_,enabled:V==="camera",onNote:Q}),te=_d({name:p,view:_,edits:T,state:A,enabled:Ct,picked:R,onNote:Q}),Ft=l((ft)=>{if(at&&ft?.left)return _.unpick();if(N(ft),!ft?.adding)U([]),F([]);if(V==="select"&&ft?.surface)F((Zt)=>[...(ft.adding?Zt:[]).filter((yt)=>JSON.stringify(yt)!==JSON.stringify(ft.surface)),ft.surface].slice(-64));if(V==="select"&&ft?.whole&&ft.id){let Zt=ft.sprite?{sort:ft.sprite,tree:!0}:ft.sort&&!Pl.has(ft.sort)?{sort:ft.sort,tree:!1}:null;if(Zt)U((yt)=>[...(ft.adding?yt:[]).filter((ge)=>ge.sort!==Zt.sort||ge.tree!==Zt.tree),Zt])}if(Dt&&ft?.id&&ft.left)T.remove([{id:ft.id,position:ft.position}]),_.unpick()}),jt=l((ft)=>{if(!at)return;if(ft?.road)Et.click(ft.road[0],ft.road[1]);else if(!ft?.id)Et.clear()});i(()=>(_.setClicked((ft)=>jt(ft)),()=>_.setClicked(()=>{})),[_]),i(()=>{_.setWheelTaken(Et.line!==null&&mt||V==="camera"||V==="copy"||Ct)},[_,Et.line,mt,V,Ct]),i(()=>{_.setAdding((V==="select"||V==="camera"||V==="move")&&ht)},[_,V,ht]),i(()=>(_.setSelectMode(V==="select",z,O),()=>_.setSelectMode(!1)),[_,V,z,O]),i(()=>{if(V!=="road"&&V!=="smooth")Et.clear()},[V]),i(()=>{T.start();let ft=()=>T.saveNow(!0);return window.addEventListener("pagehide",ft),()=>{window.removeEventListener("pagehide",ft),T.stop()}},[T]),i(()=>(_.setPick((ft)=>Ft(ft)),_.setMenu(P),_.setIndexed((ft)=>T.bind(ft)),()=>{_.setPick(()=>{}),_.setMenu(()=>{}),_.setIndexed(()=>{})}),[_,T]),i(()=>{_.setRemoved(A.removed.map((ft)=>ft.id),A.sorts,A.objectSorts)},[_,A.removed,A.sorts,A.objectSorts]),i(()=>(_.setMarked(I),()=>_.setMarked(null)),[_,I]),i(()=>(T.setOnMeshes((ft)=>_.refreshMeshes(ft)),_.setViewFailed(tt),()=>{T.setOnMeshes(()=>{}),_.setViewFailed(()=>{})}),[_,T]);let Yt=l((ft,Zt)=>{if(V==="camera")re.wheel(ft,Zt);else if(V==="move")te.wheel(ft,Zt);else if(V==="copy")_t.current(ft,Zt);else if(V==="smooth")Et.wheel(ft,Zt);else Ht.wheel(ft,Zt)});i(()=>(_.setToolWheel((ft,Zt)=>Yt(ft,Zt)),()=>_.setToolWheel(()=>{})),[_]);let xe=async()=>{let ft=(yt)=>JSON.stringify([yt.heights.map((ge)=>ge.id),yt.placed,yt.copies]),Zt=ft(A);if(await T.start(),T.viewBehind()||ft(T.state())!==Zt)E()},pe=R?.all??[],be=A.removed.map((ft)=>ft.id),ue=R?.id&&R.sort&&!Pl.has(R.sort)?R.sort:null,Qt=R?.id&&R.sprite?R.sprite:null,me=!C?null:ue?`Mark all ${es(ue)} (${_.countOfListed(ue,be,A.objectSorts)})`:Qt?`Mark all ${Qt} (loaded: ${_.countOf(Qt)})`:null,Oe=()=>{if(!ht)return;if(I.length||pe.length)T.removeSelected(_.selectedOutside(I),I),U([]),_.unpick()},Fe=(ft)=>{L(!1),H(!1),F([]),G(V===ft?"select":ft)},rn=o(()=>P(null),[]),j=l((ft)=>{let Zt=ft.ctrlKey||ft.metaKey,yt=ft.key.toLowerCase();if(Ut.asking){if(Zt&&yt==="s")ft.preventDefault();return}if(ft.key!=="Escape"&&ft.key!=="Enter"&&ft.target.tagName==="INPUT")return;let ge=Zt?void 0:zl.find((qt)=>qt.key.toLowerCase()===yt);if(ft.key==="Delete")Oe();else if(ft.key==="Escape")P(null),U([]),L(!1),H(!1),F([]),_.cancelStroke(),_.unpick(),G("select"),_.focus();else if(ft.key==="Enter"&&mt&&Et.apply())_.focus();else if((I.length||pe.length)&&!Zt&&yt==="x")Oe();else if(ge)Fe(ge.tool);else if(ft.key==="Home")_.home();else if(Zt&&yt==="z")T.inTurn(()=>ft.shiftKey?T.redo():T.undo());else if(Zt&&yt==="y")T.inTurn(()=>T.redo());else if(Zt&&yt==="s")Ut.save();else return;ft.preventDefault()});i(()=>{let ft=[x.current,y,b,S],Zt=(yt)=>j(yt);for(let yt of ft)yt?.addEventListener("keydown",Zt);return()=>{for(let yt of ft)yt?.removeEventListener("keydown",Zt)}},[x,y,b,S]);let on=V==="road"&&!!Et.line&&!!R&&vd(Et.line,Et.width,R.position[0],R.position[2]);return e(a,{children:[y&&c(t(Ed,{state:A,edits:T,view:_,saving:Ut}),y),v&&c(Ut.savedText,v),b&&c(t(Td,{state:A,edits:T,view:_,tool:V,onTool:(ft)=>{Fe(ft),Q(null)}}),b),S&&c(e(a,{children:[t(od,{state:A,edits:T,view:_,note:X,viewFailed:st,saveFailed:Ut.failed,picked:at&&!R?.id||V==="select"&&R?.surface?null:R,sort:ue,markedName:I.length?I.map((ft)=>ft.tree?ft.sort:es(ft.sort)).join(", "):null,reopen:E,readAgain:()=>void xe()}),V==="select"&&D.length>0&&t(hm,{name:p,surfaces:D,view:_},JSON.stringify(D))]}),S),V==="select"&&t(Bn,{id:"edit-select-set",title:"Select",note:"Click a section or object. Shift selects all matching; Ctrl adds to the selection.",options:[t(As,{label:"Select all",on:z,hint:"Select the whole connected surface or every object of this sort (Shift + click)",onClick:Qe(_,()=>{if(L(!z),R?.surface)F((ft)=>ft.map((Zt)=>({...Zt,whole:!z})));else if(Qt||ue)U(z?[]:[{sort:Qt??ue,tree:!!Qt}])})}),t(As,{label:"Add",on:O,hint:"Add to the selection; click a picked object again to remove it (Ctrl + click)",onClick:Qe(_,()=>H(!O))})]}),xt&&t(fd,{elevation:Ht,view:_}),at&&t(ku,{band:Et,smoothing:mt}),V==="camera"&&t(Yu,{camera:re,view:_}),Ct&&t(xd,{move:te,view:_}),V==="copy"&&ht&&t(Ku,{name:p,edits:T,view:_,picked:R,onWheel:ot},W),C&&t(Pd,{at:C,mark:ht?me:null,canDelete:pe.length>0&&ht,onClose:rn,onMove:ht&&R?.id&&_.canMove(R.id)?()=>{G("move"),Q(null),_.focus()}:null,onDuplicate:ht&&R?.id&&_.canMove(R.id)?()=>{J((ft)=>ft+1),G("copy"),Q(null),_.focus()}:null,onSmooth:on?()=>{G("smooth"),Q(null),_.focus()}:null,onMark:()=>{U([ue?{sort:ue,tree:!1}:{sort:Qt,tree:!0}]),_.focus()},onDelete:()=>{Oe(),_.focus()}}),Ut.asking&&t(Sd,{title:m,taken:g,canOverwrite:Ut.canSave,onOverwrite:()=>void Ut.chosen(null),onSaveNew:(ft)=>void Ut.chosen(ft),onCancel:Ut.cancel})]})}var dm={box:"box_myLiyw"};var Nn=(p,m=2)=>p.toFixed(m);function nn({label:p,children:m}){return e(a,{children:[t("dt",{children:p}),t("dd",{children:m})]})}function fm({hovered:p}){if(!p)return null;let m=p.billboard;return e("div",{id:"hover-box",className:dm.box,children:[e("h4",{children:[p.kind,p.sprite&&` · ${p.sprite}`]}),e("dl",{children:[p.id&&t(nn,{label:"ID",children:p.id}),m?.height!=null&&e(nn,{label:"Height",children:[Nn(m.height,1)," m"]}),m?.width!=null&&e(nn,{label:"Width",children:[Nn(m.width,1)," m"]}),m?.foot&&e(nn,{label:"Stands at",children:[Nn(m.foot[0],1),", ",Nn(m.foot[1],1)]}),t(nn,{label:"Mesh",children:p.object}),t(nn,{label:"Physics",children:p.physics}),t(nn,{label:"Material",children:p.material}),t(nn,{label:"Shader",children:p.shader}),e(nn,{label:"Texture",children:[p.texture??"none",p.textureBytes!==null&&` (${Math.ceil(p.textureBytes/1024)} KB)`]}),e(nn,{label:"Size",children:[p.vertices," vertices, ",p.triangles," triangles"]}),t(nn,{label:"Triangle",children:p.triangle}),p.uv&&e(nn,{label:"UV",children:[Nn(p.uv[0],3),", ",Nn(p.uv[1],3)]}),e(nn,{label:"Shown up to",children:[Math.round(p.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(nn,{label:"AC x, y, z",children:[Nn(p.at[0]),", ",Nn(p.at[1]),", ",Nn(p.at[2])]}),e(nn,{label:"Tile",children:[p.tile[0],", ",p.tile[1]]}),p.route&&e(nn,{label:"Route",children:[Math.round(p.route.metre)," m, ",Nn(p.route.off,1)," m off"]}),p.latLon&&e(nn,{label:"Lat, lon",children:[Nn(p.latLon[0],6),", ",Nn(p.latLon[1],6)]}),e(nn,{label:"Camera",children:[Nn(p.distance,1)," m away"]})]}),!p.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}class qh extends Aa{constructor(p){super(p)}parse(p,m){let g={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},_=542327876,x=131072,y=512,v=1024,b=2048,S=4096,M=8192,E=16384,w=32768,T=95,A=96;function R(Ft){return Ft.charCodeAt(0)+(Ft.charCodeAt(1)<<8)+(Ft.charCodeAt(2)<<16)+(Ft.charCodeAt(3)<<24)}function N(Ft){return String.fromCharCode(Ft&255,Ft>>8&255,Ft>>16&255,Ft>>24&255)}function C(Ft,jt,Yt,xe){let pe=Yt*xe*4,be=new Uint8Array(Ft,jt,pe),ue=new Uint8Array(pe),Qt=0,me=0;for(let Oe=0;Oe<xe;Oe++)for(let Fe=0;Fe<Yt;Fe++){let rn=be[me];me++;let j=be[me];me++;let on=be[me];me++;let ft=be[me];me++,ue[Qt]=on,Qt++,ue[Qt]=j,Qt++,ue[Qt]=rn,Qt++,ue[Qt]=ft,Qt++}return ue}function P(Ft,jt,Yt,xe){let pe=Yt*xe*3,be=new Uint8Array(Ft,jt,pe),ue=new Uint8Array(Yt*xe*4),Qt=0,me=0;for(let Oe=0;Oe<xe;Oe++)for(let Fe=0;Fe<Yt;Fe++){let rn=be[me];me++;let j=be[me];me++;let on=be[me];me++,ue[Qt]=on,Qt++,ue[Qt]=j,Qt++,ue[Qt]=rn,Qt++,ue[Qt]=255,Qt++}return ue}let I=R("DXT1"),U=R("DXT3"),D=R("DXT5"),F=R("ETC1"),z=R("DX10"),L=31,O=5,H=0,V=1,G=2,W=3,J=4,X=7,Q=21,st=22,tt=23,_t=24,ot=25,ht=26,xt=28,Dt=0,at=new Int32Array(p,0,L);if(at[H]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),g;let mt,Ct=at[Q],Ut=!1,Ht=!1,Et=at[V]+4;switch(Ct){case I:mt=8,g.format=tr;break;case U:mt=16,g.format=er;break;case D:mt=16,g.format=nr;break;case F:mt=8,g.format=Yr;break;case z:Et+=O*4;let jt=new Int32Array(p,(L+1)*4,O)[Dt];switch(jt){case 96:{mt=16,g.format=$r;break}case 95:{mt=16,g.format=Zr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",jt),g}break;default:if(at[st]===32&&at[tt]&16711680&&at[_t]&65280&&at[ot]&255&&at[ht]&4278190080)Ut=!0,mt=64,g.format=Gn;else if(at[st]===24&&at[tt]&16711680&&at[_t]&65280&&at[ot]&255)Ht=!0,mt=64,g.format=Gn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",N(Ct)),g}if(g.mipmapCount=1,at[G]&131072&&m!==!1)g.mipmapCount=Math.max(1,at[X]);let re=at[xt];if(g.isCubemap=re&512?!0:!1,g.isCubemap&&(!(re&1024)||!(re&2048)||!(re&4096)||!(re&8192)||!(re&16384)||!(re&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),g;g.width=at[J],g.height=at[W];let te=g.isCubemap?6:1;for(let Ft=0;Ft<te;Ft++){let{width:jt,height:Yt}=g;for(let xe=0;xe<g.mipmapCount;xe++){let pe,be;if(Ut)pe=C(p,Et,jt,Yt),be=pe.length;else if(Ht)pe=P(p,Et,jt,Yt),be=jt*Yt*3;else be=Math.ceil(jt/4)*Math.ceil(Yt/4)*mt,pe=new Uint8Array(p,Et,be);let ue={data:pe,width:jt,height:Yt};g.mipmaps.push(ue),Et+=be,jt=Math.max(jt>>1,1),Yt=Math.max(Yt>>1,1)}}return g}}var pm=0,mm=1,gm=2;var Yh=2;var Ha=1.25,$h=1,sn=32,Re=8,Ga=65535;var or=Math.pow(2,-24),ho=Symbol("SKIP_GENERATION"),Va={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[ho]:!1};function Le(p,m,g){return g.min.x=m[p],g.min.y=m[p+1],g.min.z=m[p+2],g.max.x=m[p+3],g.max.y=m[p+4],g.max.z=m[p+5],g}function uo(p){let m=-1,g=-1/0;for(let _=0;_<3;_++){let x=p[_+3]-p[_];if(x>g)g=x,m=_}return m}function Zh(p,m,g){for(let _=0;_<3;_++){let x=m[p+2*_],y=m[p+2*_+1],v=x-y,b=x+y;if(v<g[_])g[_]=v;if(b>g[_+3])g[_+3]=b}}function Wa(p){let m=p[3]-p[0],g=p[4]-p[1],_=p[5]-p[2];return 2*(m*g+g*_+_*m)}function _e(p,m){return m[p+15]===Ga}function Te(p,m){return m[p+6]}function Ce(p,m){return m[p+14]}function Me(p){return p+Re}function Ee(p,m){let g=m[p+6];return p+g*Re}function ar(p,m){return m[p+7]}function Ue(p){return p}function Xa(p,m,g,_,x){let y=1/0,v=1/0,b=1/0,S=-1/0,M=-1/0,E=-1/0,w=1/0,T=1/0,A=1/0,R=-1/0,N=-1/0,C=-1/0,P=p.offset||0;for(let I=(m-P)*6,U=(m+g-P)*6;I<U;I+=6){let D=p[I+0],F=p[I+1],z=D-F,L=D+F;if(z<y)y=z;if(L>S)S=L;if(D<w)w=D;if(D>R)R=D;let O=p[I+2],H=p[I+3],V=O-H,G=O+H;if(V<v)v=V;if(G>M)M=G;if(O<T)T=O;if(O>N)N=O;let W=p[I+4],J=p[I+5],X=W-J,Q=W+J;if(X<b)b=X;if(Q>E)E=Q;if(W<A)A=W;if(W>C)C=W}_[0]=y,_[1]=v,_[2]=b,_[3]=S,_[4]=M,_[5]=E,x[0]=w,x[1]=T,x[2]=A,x[3]=R,x[4]=N,x[5]=C}var ci=8,Kh=8,Jh=new Int32Array(ci),li=new Float32Array(ci*6),lr=new Float32Array(ci*6),Qn=new Float32Array(6),qa=new Float32Array(6),Xi=new Int32Array(Kh),_m=new Float32Array(Kh*6);function lS(p,m,g,_){for(let x=0;x<3;x++){let y=m[p+2*x],v=m[p+2*x+1],b=y-v,S=y+v;if(b<g[_+x])g[_+x]=b;if(S>g[_+x+3])g[_+x+3]=S}}function xm(p,m){let g=p[m+3]-p[m],_=p[m+4]-p[m+1],x=p[m+5]-p[m+2];return 2*(g*_+_*x+x*g)}function ym(p,m,g,_,x,y){let v=-1,b=0;if(y===pm){if(v=uo(m),v!==-1)b=(m[v]+m[v+3])/2}else if(y===mm){if(v=uo(p),v!==-1)b=cS(g,_,x,v)}else if(y===gm){let S=Wa(p),M=Ha*x,E=g.offset||0,w=(_-E)*6,T=(_+x-E)*6;for(let A=0;A<3;A++){let R=m[A],P=(m[A+3]-R)/ci;if(x<Kh){for(let I=0;I<x;I++){let U=w+I*6,D=g[U+2*A],F=I;while(F>0&&g[Xi[F-1]+2*A]>D)Xi[F]=Xi[F-1],F--;Xi[F]=U}for(let I=0;I<3;I++)Qn[I]=1/0,Qn[I+3]=-1/0,qa[I]=1/0,qa[I+3]=-1/0;for(let I=x-1;I>=0;I--)Zh(Xi[I],g,qa),_m.set(qa,I*6);for(let I=0;I<x-1;I++){Zh(Xi[I],g,Qn);let U=g[Xi[I+1]+2*A];if(g[Xi[I]+2*A]===U)continue;let D=I+1,F=x-D,z=Wa(Qn)/S,L=xm(_m,D*6)/S,O=$h+Ha*(z*D+L*F);if(O<M)v=A,M=O,b=U}}else{for(let D=0;D<ci;D++){Jh[D]=0;for(let F=0;F<3;F++)li[D*6+F]=1/0,li[D*6+F+3]=-1/0}for(let D=w;D<T;D+=6){let L=~~((g[D+2*A]-R)/P);if(L>=ci)L=ci-1;Jh[L]++,lS(D,g,li,L*6)}let I=(ci-1)*6;for(let D=0;D<6;D++)lr[I+D]=li[I+D];for(let D=ci-2;D>=0;D--){let F=D*6,z=F+6;for(let L=0;L<3;L++)lr[F+L]=Math.min(li[F+L],lr[z+L]),lr[F+L+3]=Math.max(li[F+L+3],lr[z+L+3])}let U=0;for(let D=0;D<ci-1;D++){let F=D*6,z=Jh[D];if(z!==0)for(let G=0;G<3;G++)if(U===0)Qn[G]=li[F+G],Qn[G+3]=li[F+G+3];else Qn[G]=Math.min(Qn[G],li[F+G]),Qn[G+3]=Math.max(Qn[G+3],li[F+G+3]);U+=z;let L=0,O=0;if(U!==0)L=Wa(Qn)/S;let H=x-U;if(H!==0)O=xm(lr,F+6)/S;let V=$h+Ha*(L*U+O*H);if(V<M)v=A,M=V,b=R+P+D*P}}}}else console.warn(`BVH: Invalid build strategy value ${y} used.`);return{axis:v,pos:b}}function cS(p,m,g,_){let x=0,y=p.offset;for(let v=m,b=m+g;v<b;v++)x+=p[(v-y)*6+_*2];return x/g}function vm(p,m,g,_,x,y){let v=_,b=_+x-1,S=y.pos,M=y.axis*2,E=g.offset||0;while(!0){while(v<=b&&g[(v-E)*6+M]<S)v++;while(v<=b&&g[(b-E)*6+M]>=S)b--;if(v<b){for(let w=0;w<m;w++){let T=p[v*m+w];p[v*m+w]=p[b*m+w],p[b*m+w]=T}for(let w=0;w<6;w++){let T=v-E,A=b-E,R=g[T*6+w];g[T*6+w]=g[A*6+w],g[A*6+w]=R}v++,b--}else return v}}var hS=Math.pow(2,32),cr=new Float32Array(6),Ya=new Float32Array(6);function uS(p,m,g,_,x,y){let{maxDepth:v,verbose:b,targetLeafSize:S,_strictLeafSize:M=1/0,strategy:E,onProgress:w,useSharedArrayBuffer:T=!1}=x,{primitiveBuffer:A,primitiveBufferStride:R}=p,C=new(T?SharedArrayBuffer:ArrayBuffer)(sn*Math.max(1,2*Math.ceil(_)-1)),P=new Float32Array(C),I=new Uint32Array(C),U=new Uint16Array(C),D=0,F=!1;return Xa(m,g,_,cr,Ya),O(g,_,0),C.slice(0,D*sn);function z(H){if(w)w((H-y.offset)/y.count)}function L(H,V,G){let W=H*2;I[H+6]=V,U[W+14]=G,U[W+15]=Ga,z(V+G)}function O(H,V,G){let W=D++,J=W*Re;if(P.set(cr,J),!F&&G>=v){if(F=!0,b)console.warn(`BVH: Max depth of ${v} reached when generating BVH. Consider increasing maxDepth.`)}let X=V>M;if(V<=S&&!X||G>=v){L(J,H,V);return}let Q=ym(cr,Ya,m,H,V,E),st=Q.axis===-1?-1:vm(A,R,m,H,V,Q);if(Q.axis===-1||st===H||st===H+V){if(!X){L(J,H,V);return}Q.axis=Math.max(0,uo(cr)),st=H+Math.max(1,Math.floor(V/2))}I[J+7]=Q.axis;let tt=st-H;Xa(m,H,tt,cr,Ya),O(H,tt,G+1);let _t=D-W;if(_t>hS)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");I[J+6]=_t;let ot=V-tt;Xa(m,st,ot,cr,Ya),O(st,ot,G+1)}}function bm(p,m){let g=p.getRootRanges(m.range),_=g[0],x=g[g.length-1],y={offset:_.offset,count:x.offset+x.count-_.offset},v=new Float32Array(6*y.count);v.offset=y.offset,p.computePrimitiveBounds(y.offset,y.count,v),p._roots=g.map((b)=>uS(p,v,b.offset,b.count,m,y))}class bs{constructor(p){this._getNewPrimitive=p,this._primitives=[]}getPrimitive(){let p=this._primitives;if(p.length===0)return this._getNewPrimitive();else return p.pop()}releasePrimitive(p){this._primitives.push(p)}}class Sm{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let p=[],m=null;this.setBuffer=(g)=>{if(m)p.push(m);m=g,this.float32Array=new Float32Array(g),this.uint16Array=new Uint16Array(g),this.uint32Array=new Uint32Array(g)},this.clearBuffer=()=>{if(m=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,p.length!==0)this.setBuffer(p.pop())}}}var he=new Sm;var qi,ur,hr=[],$a=new bs(()=>new ve);function Mm(p,m,g,_,x,y){qi=$a.getPrimitive(),ur=$a.getPrimitive(),hr.push(qi,ur),he.setBuffer(p._roots[m]);let v=jh(0,p.geometry,g,_,x,y);he.clearBuffer(),$a.releasePrimitive(qi),$a.releasePrimitive(ur),hr.pop(),hr.pop();let b=hr.length;if(b>0)ur=hr[b-1],qi=hr[b-2];return v}function jh(p,m,g,_,x=null,y=0,v=0){let{float32Array:b,uint16Array:S,uint32Array:M}=he,E=p*2;if(_e(E,S)){let T=Te(p,M),A=Ce(E,S);return Le(Ue(p),b,qi),_(T,A,!1,v,y+p/Re,qi)}else{let V=function(W){let{uint16Array:J,uint32Array:X}=he,Q=W*2;while(!_e(Q,J))W=Me(W),Q=W*2;return Te(W,X)},G=function(W){let{uint16Array:J,uint32Array:X}=he,Q=W*2;while(!_e(Q,J))W=Ee(W,X),Q=W*2;return Te(W,X)+Ce(Q,J)},T=Me(p),A=Ee(p,M),R=T,N=A,C,P,I,U;if(x){if(I=qi,U=ur,Le(Ue(R),b,I),Le(Ue(N),b,U),C=x(I),P=x(U),P<C){R=A,N=T;let W=C;C=P,P=W,I=U}}if(!I)I=qi,Le(Ue(R),b,I);let D=_e(R*2,S),F=g(I,D,C,v+1,y+R/Re),z;if(F===Yh){let W=V(R),X=G(R)-W;z=_(W,X,!0,v+1,y+R/Re,I)}else z=F&&jh(R,m,g,_,x,y,v+1);if(z)return!0;U=ur,Le(Ue(N),b,U);let L=_e(N*2,S),O=g(U,L,P,v+1,y+N/Re),H;if(O===Yh){let W=V(N),X=G(N)-W;H=_(W,X,!0,v+1,y+N/Re,U)}else H=O&&jh(N,m,g,_,x,y,v+1);if(H)return!0;return!1}}var fo=new he.constructor,Za=new he.constructor,Yi=new bs(()=>new ve),dr=new ve,fr=new ve,Qh=new ve,tu=new ve,eu=!1;function Em(p,m,g,_){if(eu)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");eu=!0;let x=p._roots,y=m._roots,v,b=0,S=0,M=new Kt().copy(g).invert();for(let E=0,w=x.length;E<w;E++){fo.setBuffer(x[E]),S=0;let T=Yi.getPrimitive();Le(Ue(0),fo.float32Array,T),T.applyMatrix4(M);for(let A=0,R=y.length;A<R;A++)if(Za.setBuffer(y[A]),v=ti(0,0,g,M,_,b,S,0,0,T),Za.clearBuffer(),S+=y[A].byteLength/sn,v)break;if(Yi.releasePrimitive(T),fo.clearBuffer(),b+=x[E].byteLength/sn,v)break}return eu=!1,v}function ti(p,m,g,_,x,y=0,v=0,b=0,S=0,M=null,E=!1){let w,T;if(E)w=Za,T=fo;else w=fo,T=Za;let A=w.float32Array,R=w.uint32Array,N=w.uint16Array,C=T.float32Array,P=T.uint32Array,I=T.uint16Array,U=p*2,D=m*2,F=_e(U,N),z=_e(D,I),L=!1;if(z&&F)if(E)L=x(Te(m,P),Ce(m*2,I),Te(p,R),Ce(p*2,N),S,v+m/Re,b,y+p/Re);else L=x(Te(p,R),Ce(p*2,N),Te(m,P),Ce(m*2,I),b,y+p/Re,S,v+m/Re);else if(z){let O=Yi.getPrimitive();Le(Ue(m),C,O),O.applyMatrix4(g);let H=Me(p),V=Ee(p,R);Le(Ue(H),A,dr),Le(Ue(V),A,fr);let G=O.intersectsBox(dr),W=O.intersectsBox(fr);L=G&&ti(m,H,_,g,x,v,y,S,b+1,O,!E)||W&&ti(m,V,_,g,x,v,y,S,b+1,O,!E),Yi.releasePrimitive(O)}else{let O=Me(m),H=Ee(m,P);Le(Ue(O),C,Qh),Le(Ue(H),C,tu);let V=M.intersectsBox(Qh),G=M.intersectsBox(tu);if(V&&G)L=ti(p,O,g,_,x,y,v,b,S+1,M,E)||ti(p,H,g,_,x,y,v,b,S+1,M,E);else if(V)if(F)L=ti(p,O,g,_,x,y,v,b,S+1,M,E);else{let W=Yi.getPrimitive();W.copy(Qh).applyMatrix4(g);let J=Me(p),X=Ee(p,R);Le(Ue(J),A,dr),Le(Ue(X),A,fr);let Q=W.intersectsBox(dr),st=W.intersectsBox(fr);L=Q&&ti(O,J,_,g,x,v,y,S,b+1,W,!E)||st&&ti(O,X,_,g,x,v,y,S,b+1,W,!E),Yi.releasePrimitive(W)}else if(G)if(F)L=ti(p,H,g,_,x,y,v,b,S+1,M,E);else{let W=Yi.getPrimitive();W.copy(tu).applyMatrix4(g);let J=Me(p),X=Ee(p,R);Le(Ue(J),A,dr),Le(Ue(X),A,fr);let Q=W.intersectsBox(dr),st=W.intersectsBox(fr);L=Q&&ti(H,J,_,g,x,v,y,S,b+1,W,!E)||st&&ti(H,X,_,g,x,v,y,S,b+1,W,!E),Yi.releasePrimitive(W)}}return L}var Ja=new class{constructor(){let p=null,m=null,g=null,_=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(y,v)=>{if(_)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=v,this.buffer=p=y._roots[v],this.uint16Array=g=new Uint16Array(p),this.uint32Array=m=new Uint32Array(p)},this.reset=()=>{this.root=null,this.buffer=p=null,this.uint16Array=g=null,this.uint32Array=m=null},this.getRangeStart=(y)=>{let v=y*2;while(!_e(v,g))y=Me(y),v=y*2;return Te(y,m)},this.getRangeEnd=(y)=>{let v=y*2;while(!_e(v,g))y=Ee(y,m),v=y*2;return Te(y,m)+Ce(v,g)};let x=(y,v,b)=>{let S=v*2,M=_e(S,g);if(!y(b,M,v)&&!M){let w=Me(v),T=Ee(v,m);x(y,w,b+1),x(y,T,b+1)}};this.traverseBuffer=(y)=>{if(_)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");_=!0;try{x(y,0,0)}finally{_=!1}},this.traverse=(y)=>{this.traverseBuffer((v,b,S)=>{if(b){let M=S*2,E=m[S+6],w=g[M+14];return y(v,b,new Float32Array(p,S*4,6),E,w)}else{let M=ar(S,m);return y(v,b,new Float32Array(p,S*4,6),M)}})}}};var Tm=new ve,pr=new Float32Array(6);class nu{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(p){if(p={...Va,...p},"maxLeafSize"in p)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),p={...p,targetLeafSize:p.maxLeafSize};bm(this,p)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(p,m,g,_){let x=1/0,y=1/0,v=1/0,b=-1/0,S=-1/0,M=-1/0;for(let E=p,w=p+m;E<w;E++){this.writePrimitiveBounds(E,pr,0);let[T,A,R,N,C,P]=pr;if(T<x)x=T;if(N>b)b=N;if(A<y)y=A;if(C>S)S=C;if(R<v)v=R;if(P>M)M=P}return g[_+0]=x,g[_+1]=y,g[_+2]=v,g[_+3]=b,g[_+4]=S,g[_+5]=M,g}computePrimitiveBounds(p,m,g){let _=g.offset||0;for(let x=p,y=p+m;x<y;x++){this.writePrimitiveBounds(x,pr,0);let[v,b,S,M,E,w]=pr,T=(v+M)/2,A=(b+E)/2,R=(S+w)/2,N=(M-v)/2,C=(E-b)/2,P=(w-S)/2,I=(x-_)*6;g[I+0]=T,g[I+1]=N+(Math.abs(T)+N)*or,g[I+2]=A,g[I+3]=C+(Math.abs(A)+C)*or,g[I+4]=R,g[I+5]=P+(Math.abs(R)+P)*or}return g}shiftPrimitiveOffsets(p){let m=this._indirectBuffer;if(m)for(let g=0,_=m.length;g<_;g++)m[g]+=p;else{let g=this._roots;for(let _=0;_<g.length;_++){let x=g[_],y=new Uint32Array(x),v=new Uint16Array(x),b=x.byteLength/sn;for(let S=0;S<b;S++){let M=Re*S,E=2*M;if(_e(E,v))y[M+6]+=p}}}}traverse(p,m=0){Ja.setBVH(this,m),Ja.traverse(p),Ja.reset()}refit(){let p=this._roots;for(let m=0,g=p.length;m<g;m++){let _=p[m],x=new Uint32Array(_),y=new Uint16Array(_),v=new Float32Array(_),b=_.byteLength/sn;for(let S=b-1;S>=0;S--){let M=S*Re,E=M*2;if(_e(E,y)){let T=Te(M,x),A=Ce(E,y);this.writePrimitiveRangeBounds(T,A,pr,0),v.set(pr,M)}else{let T=Me(M),A=Ee(M,x);for(let R=0;R<3;R++){let N=v[T+R],C=v[T+R+3],P=v[A+R],I=v[A+R+3];v[M+R]=N<P?N:P,v[M+R+3]=C>I?C:I}}}}}getBoundingBox(p){return p.makeEmpty(),this._roots.forEach((g)=>{Le(0,new Float32Array(g),Tm),p.union(Tm)}),p}shapecast(p){let{boundsTraverseOrder:m,intersectsBounds:g,intersectsRange:_,intersectsPrimitive:x,scratchPrimitive:y,iterate:v}=p;if(_&&x){let E=_;_=(w,T,A,R,N)=>{if(!E(w,T,A,R,N))return v(w,T,this,x,A,R,y);return!0}}else if(!_)if(x)_=(E,w,T,A)=>v(E,w,this,x,T,A,y);else _=(E,w,T)=>T;let b=!1,S=0,M=this._roots;for(let E=0,w=M.length;E<w;E++){let T=M[E];if(b=Mm(this,E,g,_,m,S),b)break;S+=T.byteLength/sn}return b}bvhcast(p,m,g){let{intersectsRanges:_}=g;return Em(this,p,m,_)}}function wm(){return typeof SharedArrayBuffer<"u"}function iu(p){return p.index?p.index.count:p.attributes.position.count}function $i(p){return iu(p)/3}function dS(p,m=ArrayBuffer){if(p>65535)return new Uint32Array(new m(4*p));else return new Uint16Array(new m(2*p))}function Am(p,m){if(!p.index){let g=p.attributes.position.count,_=m.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,x=dS(g,_);p.setIndex(new qe(x,1));for(let y=0;y<g;y++)x[y]=y}}function fS(p,m,g){let _=iu(p)/g,x=m?m:p.drawRange,y=x.start/g,v=(x.start+x.count)/g,b=Math.max(0,y),S=Math.min(_,v)-b;return{offset:Math.floor(b),count:Math.floor(S)}}function pS(p,m){return p.groups.map((g)=>({offset:g.start/m,count:g.count/m}))}function su(p,m,g){let _=fS(p,m,g),x=pS(p,g);if(!x.length)return[_];let y=[],v=_.offset,b=_.offset+_.count,S=iu(p)/g,M=[];for(let T of x){let{offset:A,count:R}=T,N=A,C=isFinite(R)?R:S-A,P=A+C;if(N<b&&P>v)M.push({pos:Math.max(v,N),isStart:!0}),M.push({pos:Math.min(b,P),isStart:!1})}M.sort((T,A)=>{if(T.pos!==A.pos)return T.pos-A.pos;else return T.type==="end"?-1:1});let E=0,w=null;for(let T of M){let A=T.pos;if(E!==0&&A!==w)y.push({offset:w,count:A-w});E+=T.isStart?1:-1,w=A}return y}function mS(p,m){let g=p[p.length-1],_=g.offset+g.count>65536,x=p.reduce((M,E)=>M+E.count,0),y=_?4:2,v=m?new SharedArrayBuffer(x*y):new ArrayBuffer(x*y),b=_?new Uint32Array(v):new Uint16Array(v),S=0;for(let M=0;M<p.length;M++){let{offset:E,count:w}=p[M];for(let T=0;T<w;T++)b[S+T]=E+T;S+=w}return b}class ru extends nu{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(p){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(p){}constructor(p,m={}){if(!p.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(p.index&&p.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(m.useSharedArrayBuffer&&!wm())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=p,this.resolvePrimitiveIndex=m.indirect?(g)=>this._indirectBuffer[g]:(g)=>g,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,m={...Va,...m},!m[ho])this.init(m)}init(p){let{geometry:m,primitiveStride:g}=this;if(p.indirect){let _=su(m,p.range,g),x=mS(_,p.useSharedArrayBuffer);this._indirectBuffer=x}else Am(m,p);if(super.init(p),!m.boundingBox&&p.setBoundingBox)m.boundingBox=this.getBoundingBox(new ve)}getRootRanges(p){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return su(this.geometry,p,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class Dn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(p,m){let g=1/0,_=-1/0;for(let x=0,y=p.length;x<y;x++){let b=p[x][m];g=b<g?b:g,_=b>_?b:_}this.min=g,this.max=_}setFromPoints(p,m){let g=1/0,_=-1/0;for(let x=0,y=m.length;x<y;x++){let v=m[x],b=p.dot(v);g=b<g?b:g,_=b>_?b:_}this.min=g,this.max=_}isSeparated(p){return this.min>p.max||p.min>this.max}}Dn.prototype.setFromBox=function(){let p=new Y;return function(g,_){let{min:x,max:y}=_,v=1/0,b=-1/0;for(let S=0;S<=1;S++)for(let M=0;M<=1;M++)for(let E=0;E<=1;E++){p.x=x.x*S+y.x*(1-S),p.y=x.y*M+y.y*(1-M),p.z=x.z*E+y.z*(1-E);let w=g.dot(p);v=Math.min(w,v),b=Math.max(w,b)}this.min=v,this.max=b}}();var aC=function(){let p=new Dn;return function(g,_){let{points:x,satAxes:y,satBounds:v}=g,{points:b,satAxes:S,satBounds:M}=_;for(let E=0;E<3;E++){let w=v[E],T=y[E];if(p.setFromPoints(T,b),w.isSeparated(p))return!1}for(let E=0;E<3;E++){let w=M[E],T=S[E];if(p.setFromPoints(T,x),w.isSeparated(p))return!1}}}();var gS=function(){let p=new Y,m=new Y,g=new Y;return function(x,y,v){let b=x.start,S=p,M=y.start,E=m;g.subVectors(b,M),p.subVectors(x.end,x.start),m.subVectors(y.end,y.start);let w=g.dot(E),T=E.dot(S),A=E.dot(E),R=g.dot(S),C=S.dot(S)*A-T*T,P,I;if(C!==0)P=(w*T-R*A)/C;else P=0;I=(w+P*T)/A,v.x=P,v.y=I}}(),po=function(){let p=new Jt,m=new Y,g=new Y;return function(x,y,v,b){gS(x,y,p);let{x:S,y:M}=p;if(S>=0&&S<=1&&M>=0&&M<=1){x.at(S,v),y.at(M,b);return}else if(S>=0&&S<=1){if(M<0)y.at(0,b);else y.at(1,b);x.closestPointToPoint(b,!0,v);return}else if(M>=0&&M<=1){if(S<0)x.at(0,v);else x.at(1,v);y.closestPointToPoint(v,!0,b);return}else{let E;if(S<0)E=x.start;else E=x.end;let w;if(M<0)w=y.start;else w=y.end;let T=m,A=g;if(x.closestPointToPoint(w,!0,m),y.closestPointToPoint(E,!0,g),T.distanceToSquared(w)<=A.distanceToSquared(E)){v.copy(T),b.copy(w);return}else{v.copy(E),b.copy(A);return}}}}(),Rm=function(){let p=new Y,m=new Y,g=new ln,_=new Pn;return function(y,v){let{radius:b,center:S}=y,{a:M,b:E,c:w}=v;if(_.start=M,_.end=E,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;if(_.start=M,_.end=w,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;if(_.start=E,_.end=w,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;let N=v.getPlane(g);if(Math.abs(N.distanceToPoint(S))<=b){let P=N.projectPoint(S,m);if(v.containsPoint(P))return!0}return!1}}();var _S=["x","y","z"],Ri=0.000000000000001,Cm=Ri*Ri;function Xn(p){return Math.abs(p)<Ri}class bn extends Xe{constructor(...p){super(...p);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new Y),this.satBounds=[,,,,].fill().map(()=>new Dn),this.points=[this.a,this.b,this.c],this.plane=new ln,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Pn,this.needsUpdate=!0}intersectsSphere(p){return Rm(p,this)}update(){let p=this.a,m=this.b,g=this.c,_=this.points,x=this.satAxes,y=this.satBounds,v=x[0],b=y[0];this.getNormal(v),b.setFromPoints(v,_);let S=x[1],M=y[1];S.subVectors(p,m),M.setFromPoints(S,_);let E=x[2],w=y[2];E.subVectors(m,g),w.setFromPoints(E,_);let T=x[3],A=y[3];T.subVectors(g,p),A.setFromPoints(T,_);let R=S.length(),N=E.length(),C=T.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,R<Ri)if(N<Ri||C<Ri)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(p),this.degenerateSegment.end.copy(g);else if(N<Ri)if(C<Ri)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(p);else if(C<Ri)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(g),this.degenerateSegment.end.copy(m);this.plane.setFromNormalAndCoplanarPoint(v,p),this.needsUpdate=!1}}bn.prototype.closestPointToSegment=function(){let p=new Y,m=new Y,g=new Pn;return function(x,y=null,v=null){if(this.needsUpdate)this.update();let{start:b,end:S}=x,M=this.points,E,w=1/0,T=this.plane.distanceToPoint(b),A=this.plane.distanceToPoint(S);if(T*A<0&&this.plane.intersectLine(x,p)!==null&&this.containsPoint(p)){if(y)y.copy(p);if(v)v.copy(p);return 0}for(let R=0;R<3;R++){let N=(R+1)%3;if(g.start.copy(M[R]),g.end.copy(M[N]),po(g,x,p,m),E=p.distanceToSquared(m),E<w){if(w=E,y)y.copy(p);if(v)v.copy(m)}}if(this.closestPointToPoint(b,p),E=b.distanceToSquared(p),E<w){if(w=E,y)y.copy(p);if(v)v.copy(b)}if(this.closestPointToPoint(S,p),E=S.distanceToSquared(p),E<w){if(w=E,y)y.copy(p);if(v)v.copy(S)}return Math.sqrt(w)}}();bn.prototype.intersectsTriangle=function(){let p=new bn,m=new Dn,g=new Dn,_=new Y,x=new Y,y=new Y,v=new Y,b=new Pn,S=new Pn,M=new Y,E=new Jt,w=new Jt;function T(U,D,F,z){let L=_;if(!U.isDegenerateIntoPoint&&!U.isDegenerateIntoSegment)L.copy(U.plane.normal);else L.copy(D.plane.normal);let{satBounds:O,satAxes:H}=U;for(let W=1;W<4;W++){let J=O[W],X=H[W];if(m.setFromPoints(X,D.points),J.isSeparated(m))return!1;if(v.copy(L).cross(X),m.setFromPoints(v,U.points),g.setFromPoints(v,D.points),m.isSeparated(g))return!1}let{satBounds:V,satAxes:G}=D;for(let W=1;W<4;W++){let J=V[W],X=G[W];if(m.setFromPoints(X,U.points),J.isSeparated(m))return!1;if(v.crossVectors(L,X),m.setFromPoints(v,U.points),g.setFromPoints(v,D.points),m.isSeparated(g))return!1}if(F){if(!z)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");F.start.set(0,0,0),F.end.set(0,0,0)}return!0}function A(U,D,F,z,L,O,H,V,G,W,J){let X=H/(H-V);W.x=z+(L-z)*X,J.start.subVectors(D,U).multiplyScalar(X).add(U),X=H/(H-G),W.y=z+(O-z)*X,J.end.subVectors(F,U).multiplyScalar(X).add(U)}function R(U,D,F,z,L,O,H,V,G,W,J){if(L>0)A(U.c,U.a,U.b,z,D,F,G,H,V,W,J);else if(O>0)A(U.b,U.a,U.c,F,D,z,V,H,G,W,J);else if(V*G>0||H!=0)A(U.a,U.b,U.c,D,F,z,H,V,G,W,J);else if(V!=0)A(U.b,U.a,U.c,F,D,z,V,H,G,W,J);else if(G!=0)A(U.c,U.a,U.b,z,D,F,G,H,V,W,J);else return!0;return!1}function N(U,D,F,z){let L=D.degenerateSegment,O=U.plane.distanceToPoint(L.start),H=U.plane.distanceToPoint(L.end);if(Xn(O))if(Xn(H))return T(U,D,F,z);else{if(F)F.start.copy(L.start),F.end.copy(L.start);return U.containsPoint(L.start)}else if(Xn(H)){if(F)F.start.copy(L.end),F.end.copy(L.end);return U.containsPoint(L.end)}else if(U.plane.intersectLine(L,_)!=null){if(F)F.start.copy(_),F.end.copy(_);return U.containsPoint(_)}else return!1}function C(U,D,F){let z=D.a;if(Xn(U.plane.distanceToPoint(z))&&U.containsPoint(z)){if(F)F.start.copy(z),F.end.copy(z);return!0}else return!1}function P(U,D,F){let z=U.degenerateSegment,L=D.a;if(z.closestPointToPoint(L,!0,_),L.distanceToSquared(_)<Cm){if(F)F.start.copy(L),F.end.copy(L);return!0}else return!1}function I(U,D,F,z){if(U.isDegenerateIntoSegment)if(D.isDegenerateIntoSegment){let L=U.degenerateSegment,O=D.degenerateSegment,H=x,V=y;L.delta(H),O.delta(V);let G=_.subVectors(O.start,L.start),W=H.x*V.y-H.y*V.x;if(Xn(W))return!1;let J=(G.x*V.y-G.y*V.x)/W,X=-(H.x*G.y-H.y*G.x)/W;if(J<0||J>1||X<0||X>1)return!1;let Q=L.start.z+H.z*J,st=O.start.z+V.z*X;if(Xn(Q-st)){if(F)F.start.copy(L.start).addScaledVector(H,J),F.end.copy(L.start).addScaledVector(H,J);return!0}else return!1}else if(D.isDegenerateIntoPoint)return P(U,D,F);else return N(D,U,F,z);else if(U.isDegenerateIntoPoint)if(D.isDegenerateIntoPoint)if(D.a.distanceToSquared(U.a)<Cm){if(F)F.start.copy(U.a),F.end.copy(U.a);return!0}else return!1;else if(D.isDegenerateIntoSegment)return P(D,U,F);else return C(D,U,F);else if(D.isDegenerateIntoPoint)return C(U,D,F);else if(D.isDegenerateIntoSegment)return N(U,D,F,z)}return function(D,F=null,z=!1){if(this.needsUpdate)this.update();if(!D.isExtendedTriangle)p.copy(D),p.update(),D=p;else if(D.needsUpdate)D.update();let L=I(this,D,F,z);if(L!==void 0)return L;let O=this.plane,H=D.plane,V=H.distanceToPoint(this.a),G=H.distanceToPoint(this.b),W=H.distanceToPoint(this.c);if(Xn(V))V=0;if(Xn(G))G=0;if(Xn(W))W=0;let J=V*G,X=V*W;if(J>0&&X>0)return!1;let Q=O.distanceToPoint(D.a),st=O.distanceToPoint(D.b),tt=O.distanceToPoint(D.c);if(Xn(Q))Q=0;if(Xn(st))st=0;if(Xn(tt))tt=0;let _t=Q*st,ot=Q*tt;if(_t>0&&ot>0)return!1;x.copy(O.normal),y.copy(H.normal);let ht=x.cross(y),xt=0,Dt=Math.abs(ht.x),at=Math.abs(ht.y);if(at>Dt)Dt=at,xt=1;if(Math.abs(ht.z)>Dt)xt=2;let Ct=_S[xt],Ut=this.a[Ct],Ht=this.b[Ct],Et=this.c[Ct],re=D.a[Ct],te=D.b[Ct],Ft=D.c[Ct];if(R(this,Ut,Ht,Et,J,X,V,G,W,E,b))return T(this,D,F,z);if(R(D,re,te,Ft,_t,ot,Q,st,tt,w,S))return T(this,D,F,z);if(E.y<E.x){let jt=E.y;E.y=E.x,E.x=jt,M.copy(b.start),b.start.copy(b.end),b.end.copy(M)}if(w.y<w.x){let jt=w.y;w.y=w.x,w.x=jt,M.copy(S.start),S.start.copy(S.end),S.end.copy(M)}if(E.y<w.x||w.y<E.x)return!1;if(F){if(w.x>E.x)F.start.copy(S.start);else F.start.copy(b.start);if(w.y<E.y)F.end.copy(S.end);else F.end.copy(b.end)}return!0}}();bn.prototype.distanceToPoint=function(){let p=new Y;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();bn.prototype.distanceToTriangle=function(){let p=new Y,m=new Y,g=["a","b","c"],_=new Pn,x=new Pn;return function(v,b=null,S=null){let M=b||S?_:null;if(this.intersectsTriangle(v,M,!0)){if(b||S){if(b)M.getCenter(b);if(S)M.getCenter(S)}return 0}let E=1/0;for(let w=0;w<3;w++){let T,A=g[w],R=v[A];if(this.closestPointToPoint(R,p),T=R.distanceToSquared(p),T<E){if(E=T,b)b.copy(p);if(S)S.copy(R)}let N=this[A];if(v.closestPointToPoint(N,p),T=N.distanceToSquared(p),T<E){if(E=T,b)b.copy(N);if(S)S.copy(p)}}for(let w=0;w<3;w++){let T=g[w],A=g[(w+1)%3];_.set(this[T],this[A]);for(let R=0;R<3;R++){let N=g[R],C=g[(R+1)%3];x.set(v[N],v[C]),po(_,x,p,m);let P=p.distanceToSquared(m);if(P<E){if(E=P,b)b.copy(p);if(S)S.copy(m)}}}return Math.sqrt(E)}}();class Ge{constructor(p,m,g){if(this.isOrientedBox=!0,this.min=new Y,this.max=new Y,this.matrix=new Kt,this.invMatrix=new Kt,this.points=[,,,,,,,,].fill().map(()=>new Y),this.satAxes=[,,,].fill().map(()=>new Y),this.satBounds=[,,,].fill().map(()=>new Dn),this.alignedSatBounds=[,,,].fill().map(()=>new Dn),this.needsUpdate=!1,p)this.min.copy(p);if(m)this.max.copy(m);if(g)this.matrix.copy(g)}set(p,m,g){this.min.copy(p),this.max.copy(m),this.matrix.copy(g),this.needsUpdate=!0}copy(p){this.min.copy(p.min),this.max.copy(p.max),this.matrix.copy(p.matrix),this.needsUpdate=!0}}Ge.prototype.update=function(){return function(){let m=this.matrix,g=this.min,_=this.max,x=this.points;for(let M=0;M<=1;M++)for(let E=0;E<=1;E++)for(let w=0;w<=1;w++){let T=1*M|2*E|4*w,A=x[T];A.x=M?_.x:g.x,A.y=E?_.y:g.y,A.z=w?_.z:g.z,A.applyMatrix4(m)}let y=this.satBounds,v=this.satAxes,b=x[0];for(let M=0;M<3;M++){let E=v[M],w=y[M],T=1<<M,A=x[T];E.subVectors(b,A),w.setFromPoints(E,x)}let S=this.alignedSatBounds;S[0].setFromPointsField(x,"x"),S[1].setFromPointsField(x,"y"),S[2].setFromPointsField(x,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Ge.prototype.intersectsBox=function(){let p=new Dn;return function(g){if(this.needsUpdate)this.update();let{min:_,max:x}=g,y=this.satBounds,v=this.satAxes,b=this.alignedSatBounds;if(p.min=_.x,p.max=x.x,b[0].isSeparated(p))return!1;if(p.min=_.y,p.max=x.y,b[1].isSeparated(p))return!1;if(p.min=_.z,p.max=x.z,b[2].isSeparated(p))return!1;for(let S=0;S<3;S++){let M=v[S],E=y[S];if(p.setFromBox(M,g),E.isSeparated(p))return!1}return!0}}();Ge.prototype.intersectsTriangle=function(){let p=new bn,m=[,,,],g=new Dn,_=new Dn,x=new Y;return function(v){if(this.needsUpdate)this.update();if(!v.isExtendedTriangle)p.copy(v),p.update(),v=p;else if(v.needsUpdate)v.update();let b=this.satBounds,S=this.satAxes;m[0]=v.a,m[1]=v.b,m[2]=v.c;for(let T=0;T<3;T++){let A=b[T],R=S[T];if(g.setFromPoints(R,m),A.isSeparated(g))return!1}let M=v.satBounds,E=v.satAxes,w=this.points;for(let T=0;T<3;T++){let A=M[T],R=E[T];if(g.setFromPoints(R,w),A.isSeparated(g))return!1}for(let T=0;T<3;T++){let A=S[T];for(let R=0;R<4;R++){let N=E[R];if(x.crossVectors(A,N),g.setFromPoints(x,m),_.setFromPoints(x,w),g.isSeparated(_))return!1}}return!0}}();Ge.prototype.closestPointToPoint=function(){return function(m,g){if(this.needsUpdate)this.update();return g.copy(m).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),g}}();Ge.prototype.distanceToPoint=function(){let p=new Y;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();Ge.prototype.distanceToBox=function(){let p=["x","y","z"],m=Array(12).fill().map(()=>new Pn),g=Array(12).fill().map(()=>new Pn),_=new Y,x=new Y;return function(v,b=0,S=null,M=null){if(this.needsUpdate)this.update();if(this.intersectsBox(v)){if(S||M){if(v.getCenter(x),this.closestPointToPoint(x,_),v.closestPointToPoint(_,x),S)S.copy(_);if(M)M.copy(x)}return 0}let E=b*b,{min:w,max:T}=v,A=this.points,R=1/0;for(let C=0;C<8;C++){let P=A[C];x.copy(P).clamp(w,T);let I=P.distanceToSquared(x);if(I<R){if(R=I,S)S.copy(P);if(M)M.copy(x);if(I<E)return Math.sqrt(I)}}let N=0;for(let C=0;C<3;C++)for(let P=0;P<=1;P++)for(let I=0;I<=1;I++){let U=(C+1)%3,D=(C+2)%3,F=P<<U|I<<D,z=1<<C|P<<U|I<<D,L=A[F],O=A[z];m[N].set(L,O);let V=p[C],G=p[U],W=p[D],J=g[N],{start:X,end:Q}=J;X[V]=w[V],X[G]=P?w[G]:T[G],X[W]=I?w[W]:T[W],Q[V]=T[V],Q[G]=P?w[G]:T[G],Q[W]=I?w[W]:T[W],N++}for(let C=0;C<=1;C++)for(let P=0;P<=1;P++)for(let I=0;I<=1;I++){x.x=C?T.x:w.x,x.y=P?T.y:w.y,x.z=I?T.z:w.z,this.closestPointToPoint(x,_);let U=x.distanceToSquared(_);if(U<R){if(R=U,S)S.copy(_);if(M)M.copy(x);if(U<E)return Math.sqrt(U)}}for(let C=0;C<12;C++){let P=m[C];for(let I=0;I<12;I++){let U=g[I];po(P,U,_,x);let D=_.distanceToSquared(x);if(D<R){if(R=D,S)S.copy(_);if(M)M.copy(x);if(D<E)return Math.sqrt(D)}}}return Math.sqrt(R)}}();class Pm extends bs{constructor(){super(()=>new bn)}}var An=new Pm;var mo=new Y,ou=new Y;function Im(p,m,g={},_=0,x=1/0){let y=_*_,v=x*x,b=1/0,S=null;if(p.shapecast({boundsTraverseOrder:(E)=>(mo.copy(m).clamp(E.min,E.max),mo.distanceToSquared(m)),intersectsBounds:(E,w,T)=>T<b&&T<v,intersectsTriangle:(E,w)=>{E.closestPointToPoint(m,mo);let T=m.distanceToSquared(mo);if(T<b)ou.copy(mo),b=T,S=w;if(T<y)return!0;else return!1}}),b===1/0)return null;let M=Math.sqrt(b);if(!g.point)g.point=ou.clone();else g.point.copy(ou);return g.distance=M,g.faceIndex=S,g}var Ka=parseInt(ls)>=169,xS=parseInt(ls)<=161,Ss=new Y,Ms=new Y,Es=new Y,ja=new Jt,Qa=new Jt,tl=new Jt,Lm=new Y,Nm=new Y,Dm=new Y,go=new Y;function yS(p,m,g,_,x,y,v,b){let S;if(y===xn)S=p.intersectTriangle(_,g,m,!0,x);else S=p.intersectTriangle(m,g,_,y!==wn,x);if(S===null)return null;let M=p.origin.distanceTo(x);if(M<v||M>b)return null;return{distance:M,point:x.clone()}}function Um(p,m,g,_,x,y,v,b,S,M,E){Ss.fromBufferAttribute(m,y),Ms.fromBufferAttribute(m,v),Es.fromBufferAttribute(m,b);let w=yS(p,Ss,Ms,Es,go,S,M,E);if(w){if(_){ja.fromBufferAttribute(_,y),Qa.fromBufferAttribute(_,v),tl.fromBufferAttribute(_,b),w.uv=new Jt;let A=Xe.getInterpolation(go,Ss,Ms,Es,ja,Qa,tl,w.uv);if(!Ka)w.uv=A}if(x){ja.fromBufferAttribute(x,y),Qa.fromBufferAttribute(x,v),tl.fromBufferAttribute(x,b),w.uv1=new Jt;let A=Xe.getInterpolation(go,Ss,Ms,Es,ja,Qa,tl,w.uv1);if(!Ka)w.uv1=A;if(xS)w.uv2=w.uv1}if(g){Lm.fromBufferAttribute(g,y),Nm.fromBufferAttribute(g,v),Dm.fromBufferAttribute(g,b),w.normal=new Y;let A=Xe.getInterpolation(go,Ss,Ms,Es,Lm,Nm,Dm,w.normal);if(w.normal.dot(p.direction)>0)w.normal.multiplyScalar(-1);if(!Ka)w.normal=A}let T={a:y,b:v,c:b,normal:new Y,materialIndex:0};if(Xe.getNormal(Ss,Ms,Es,T.normal),w.face=T,w.faceIndex=y,Ka){let A=new Y;Xe.getBarycoord(go,Ss,Ms,Es,A),w.barycoord=A}}return w}function Om(p){return p&&p.isMaterial?p.side:p}function mr(p,m,g,_,x,y,v){let b=_*3,S=b+0,M=b+1,E=b+2,{index:w,groups:T}=p;if(p.index)S=w.getX(S),M=w.getX(M),E=w.getX(E);let{position:A,normal:R,uv:N,uv1:C}=p.attributes;if(Array.isArray(m)){let P=_*3;for(let I=0,U=T.length;I<U;I++){let{start:D,count:F,materialIndex:z}=T[I];if(P>=D&&P<D+F){let L=Om(m[z]),O=Um(g,A,R,N,C,S,M,E,L,y,v);if(O)if(O.faceIndex=_,O.face.materialIndex=z,x)x.push(O);else return O}}}else{let P=Om(m),I=Um(g,A,R,N,C,S,M,E,P,y,v);if(I)if(I.faceIndex=_,I.face.materialIndex=0,x)x.push(I);else return I}return null}function Ne(p,m,g,_){let{a:x,b:y,c:v}=p,b=m,S=m+1,M=m+2;if(g)b=g.getX(b),S=g.getX(S),M=g.getX(M);x.x=_.getX(b),x.y=_.getY(b),x.z=_.getZ(b),y.x=_.getX(S),y.y=_.getY(S),y.z=_.getZ(S),v.x=_.getX(M),v.y=_.getY(M),v.z=_.getZ(M)}function Fm(p,m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=p;for(let E=_,w=_+x;E<w;E++)mr(S,m,g,E,y,v,b)}function Bm(p,m,g,_,x,y,v){let{geometry:b,_indirectBuffer:S}=p,M=1/0,E=null;for(let w=_,T=_+x;w<T;w++){let A;if(A=mr(b,m,g,w,null,y,v),A&&A.distance<M)E=A,M=A.distance}return E}function km(p,m,g,_,x,y,v){let{geometry:b}=g,{index:S}=b,M=b.attributes.position;for(let E=p,w=m+p;E<w;E++){let T;if(T=E,Ne(v,T*3,S,M),v.needsUpdate=!0,_(v,T,x,y))return!0}return!1}function zm(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,y,v,b,S,M=0,E=p._roots;for(let T=0,A=E.length;T<A;T++)y=E[T],v=new Uint32Array(y),b=new Uint16Array(y),S=new Float32Array(y),w(0,M),M+=y.byteLength;function w(T,A,R=!1){let N=T*2;if(_e(N,b)){let C=Te(T,v),P=Ce(N,b),I=1/0,U=1/0,D=1/0,F=-1/0,z=-1/0,L=-1/0;for(let O=3*C,H=3*(C+P);O<H;O++){let V=_[O],G=x.getX(V),W=x.getY(V),J=x.getZ(V);if(G<I)I=G;if(G>F)F=G;if(W<U)U=W;if(W>z)z=W;if(J<D)D=J;if(J>L)L=J}if(S[T+0]!==I||S[T+1]!==U||S[T+2]!==D||S[T+3]!==F||S[T+4]!==z||S[T+5]!==L)return S[T+0]=I,S[T+1]=U,S[T+2]=D,S[T+3]=F,S[T+4]=z,S[T+5]=L,!0;else return!1}else{let C=Me(T),P=Ee(T,v),I=R,U=!1,D=!1;if(m){if(!I){let V=C/Re+A/sn,G=P/Re+A/sn;U=m.has(V),D=m.has(G),I=!U&&!D}}else U=!0,D=!0;let F=I||U,z=I||D,L=!1;if(F)L=w(C,A,I);let O=!1;if(z)O=w(P,A,I);let H=L||O;if(H)for(let V=0;V<3;V++){let G=C+V,W=P+V,J=S[G],X=S[G+3],Q=S[W],st=S[W+3];S[T+V]=J<Q?J:Q,S[T+V+3]=X>st?X:st}return H}}}function Sn(p,m,g,_,x){let y,v,b,S,M,E,w=1/g.direction.x,T=1/g.direction.y,A=1/g.direction.z,R=g.origin.x,N=g.origin.y,C=g.origin.z,P=m[p],I=m[p+3],U=m[p+1],D=m[p+3+1],F=m[p+2],z=m[p+3+2];if(w>=0)y=(P-R)*w,v=(I-R)*w;else y=(I-R)*w,v=(P-R)*w;if(T>=0)b=(U-N)*T,S=(D-N)*T;else b=(D-N)*T,S=(U-N)*T;if(y>S||b>v)return!1;if(b>y||isNaN(y))y=b;if(S<v||isNaN(v))v=S;if(A>=0)M=(F-C)*A,E=(z-C)*A;else M=(z-C)*A,E=(F-C)*A;if(y>E||M>v)return!1;if(M>y||y!==y)y=M;if(E<v||v!==v)v=E;return y<=x&&v>=_}function Hm(p,m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=p;for(let E=_,w=_+x;E<w;E++){let T=M?M[E]:E;mr(S,m,g,T,y,v,b)}}function Gm(p,m,g,_,x,y,v){let{geometry:b,_indirectBuffer:S}=p,M=1/0,E=null;for(let w=_,T=_+x;w<T;w++){let A;if(A=mr(b,m,g,S?S[w]:w,null,y,v),A&&A.distance<M)E=A,M=A.distance}return E}function Vm(p,m,g,_,x,y,v){let{geometry:b}=g,{index:S}=b,M=b.attributes.position;for(let E=p,w=m+p;E<w;E++){let T;if(T=g.resolveTriangleIndex(E),Ne(v,T*3,S,M),v.needsUpdate=!0,_(v,T,x,y))return!0}return!1}function Wm(p,m,g,_,x,y,v){if(he.setBuffer(p._roots[m]),Sn(0,he.float32Array,_,y,v))au(0,p,g,_,x,y,v);he.clearBuffer()}function au(p,m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=he,E=p*2;if(_e(E,S)){let T=Te(p,M),A=Ce(E,S);Fm(m,g,_,T,A,x,y,v)}else{let T=Me(p);if(Sn(T,b,_,y,v))au(T,m,g,_,x,y,v);let A=Ee(p,M);if(Sn(A,b,_,y,v))au(A,m,g,_,x,y,v)}}var vS=["x","y","z"];function Xm(p,m,g,_,x,y){he.setBuffer(p._roots[m]);let v=null;if(Sn(0,he.float32Array,_,x,y))v=lu(0,p,g,_,x,y);return he.clearBuffer(),v}function lu(p,m,g,_,x,y){let{float32Array:v,uint16Array:b,uint32Array:S}=he,M=p*2;if(_e(M,b)){let w=Te(p,S),T=Ce(M,b);return Bm(m,g,_,w,T,x,y)}else{let w=ar(p,S),T=vS[w],R=_.direction[T]>=0,N,C;if(R)N=Me(p),C=Ee(p,S);else N=Ee(p,S),C=Me(p);let I=Sn(N,v,_,x,y)?lu(N,m,g,_,x,y):null;if(I){let F=I.point[T];if(R?F<=v[C+w]:F>=v[C+w+3])return I}let D=Sn(C,v,_,x,y)?lu(C,m,g,_,x,y):null;if(I&&D)return I.distance<=D.distance?I:D;else return I||D||null}}var el=new ve,gr=new bn,_r=new bn,_o=new Kt,qm=new Ge,nl=new Ge;function Ym(p,m,g,_){he.setBuffer(p._roots[m]);let x=cu(0,p,g,_);return he.clearBuffer(),x}function cu(p,m,g,_,x=null){let{float32Array:y,uint16Array:v,uint32Array:b}=he,S=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();qm.set(g.boundingBox.min,g.boundingBox.max,_),x=qm}if(_e(S,v)){let E=m.geometry,w=E.index,T=E.attributes.position,A=g.index,R=g.attributes.position,N=Te(p,b),C=Ce(S,v);if(_o.copy(_).invert(),g.boundsTree)return Le(Ue(p),y,nl),nl.matrix.copy(_o),nl.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(I)=>nl.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(_),I.b.applyMatrix4(_),I.c.applyMatrix4(_),I.needsUpdate=!0;for(let U=N*3,D=(C+N)*3;U<D;U+=3)if(Ne(_r,U,w,T),_r.needsUpdate=!0,I.intersectsTriangle(_r))return!0;return!1}});else{let P=$i(g);for(let I=N*3,U=(C+N)*3;I<U;I+=3){Ne(gr,I,w,T),gr.a.applyMatrix4(_o),gr.b.applyMatrix4(_o),gr.c.applyMatrix4(_o),gr.needsUpdate=!0;for(let D=0,F=P*3;D<F;D+=3)if(Ne(_r,D,A,R),_r.needsUpdate=!0,gr.intersectsTriangle(_r))return!0}}}else{let E=Me(p),w=Ee(p,b);if(Le(Ue(E),y,el),x.intersectsBox(el)&&cu(E,m,g,_,x))return!0;if(Le(Ue(w),y,el),x.intersectsBox(el)&&cu(w,m,g,_,x))return!0;return!1}}var il=new Kt,hu=new Ge,xo=new Ge,bS=new Y,SS=new Y,MS=new Y,ES=new Y;function $m(p,m,g,_={},x={},y=0,v=1/0){if(!m.boundingBox)m.computeBoundingBox();hu.set(m.boundingBox.min,m.boundingBox.max,g),hu.needsUpdate=!0;let b=p.geometry,S=b.attributes.position,M=b.index,E=m.attributes.position,w=m.index,T=An.getPrimitive(),A=An.getPrimitive(),R=bS,N=SS,C=null,P=null;if(x)C=MS,P=ES;let I=1/0,U=null,D=null;if(il.copy(g).invert(),xo.matrix.copy(il),p.shapecast({boundsTraverseOrder:(F)=>hu.distanceToBox(F),intersectsBounds:(F,z,L)=>{if(L<I&&L<v){if(z)xo.min.copy(F.min),xo.max.copy(F.max),xo.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree)return m.boundsTree.shapecast({boundsTraverseOrder:(O)=>xo.distanceToBox(O),intersectsBounds:(O,H,V)=>V<I&&V<v,intersectsRange:(O,H)=>{for(let V=O,G=O+H;V<G;V++){Ne(A,3*V,w,E),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let W=F,J=F+z;W<J;W++){Ne(T,3*W,M,S),T.needsUpdate=!0;let X=T.distanceToTriangle(A,R,C);if(X<I){if(N.copy(R),P)P.copy(C);I=X,U=W,D=V}if(X<y)return!0}}}});else{let L=$i(m);for(let O=0,H=L;O<H;O++){Ne(A,3*O,w,E),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let V=F,G=F+z;V<G;V++){Ne(T,3*V,M,S),T.needsUpdate=!0;let W=T.distanceToTriangle(A,R,C);if(W<I){if(N.copy(R),P)P.copy(C);I=W,U=V,D=O}if(W<y)return!0}}}}}),An.releasePrimitive(T),An.releasePrimitive(A),I===1/0)return null;if(!_.point)_.point=N.clone();else _.point.copy(N);if(_.distance=I,_.faceIndex=U,x){if(!x.point)x.point=P.clone();else x.point.copy(P);x.point.applyMatrix4(il),N.applyMatrix4(il),x.distance=N.sub(x.point).length(),x.faceIndex=D}return _}function Zm(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,y,v,b,S,M=0,E=p._roots;for(let T=0,A=E.length;T<A;T++)y=E[T],v=new Uint32Array(y),b=new Uint16Array(y),S=new Float32Array(y),w(0,M),M+=y.byteLength;function w(T,A,R=!1){let N=T*2;if(_e(N,b)){let C=Te(T,v),P=Ce(N,b),I=1/0,U=1/0,D=1/0,F=-1/0,z=-1/0,L=-1/0;for(let O=C,H=C+P;O<H;O++){let V=3*p.resolveTriangleIndex(O);for(let G=0;G<3;G++){let W=V+G;W=_?_[W]:W;let J=x.getX(W),X=x.getY(W),Q=x.getZ(W);if(J<I)I=J;if(J>F)F=J;if(X<U)U=X;if(X>z)z=X;if(Q<D)D=Q;if(Q>L)L=Q}}if(S[T+0]!==I||S[T+1]!==U||S[T+2]!==D||S[T+3]!==F||S[T+4]!==z||S[T+5]!==L)return S[T+0]=I,S[T+1]=U,S[T+2]=D,S[T+3]=F,S[T+4]=z,S[T+5]=L,!0;else return!1}else{let C=Me(T),P=Ee(T,v),I=R,U=!1,D=!1;if(m){if(!I){let V=C/Re+A/sn,G=P/Re+A/sn;U=m.has(V),D=m.has(G),I=!U&&!D}}else U=!0,D=!0;let F=I||U,z=I||D,L=!1;if(F)L=w(C,A,I);let O=!1;if(z)O=w(P,A,I);let H=L||O;if(H)for(let V=0;V<3;V++){let G=C+V,W=P+V,J=S[G],X=S[G+3],Q=S[W],st=S[W+3];S[T+V]=J<Q?J:Q,S[T+V+3]=X>st?X:st}return H}}}function Jm(p,m,g,_,x,y,v){if(he.setBuffer(p._roots[m]),Sn(0,he.float32Array,_,y,v))uu(0,p,g,_,x,y,v);he.clearBuffer()}function uu(p,m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=he,E=p*2;if(_e(E,S)){let T=Te(p,M),A=Ce(E,S);Hm(m,g,_,T,A,x,y,v)}else{let T=Me(p);if(Sn(T,b,_,y,v))uu(T,m,g,_,x,y,v);let A=Ee(p,M);if(Sn(A,b,_,y,v))uu(A,m,g,_,x,y,v)}}var TS=["x","y","z"];function Km(p,m,g,_,x,y){he.setBuffer(p._roots[m]);let v=null;if(Sn(0,he.float32Array,_,x,y))v=du(0,p,g,_,x,y);return he.clearBuffer(),v}function du(p,m,g,_,x,y){let{float32Array:v,uint16Array:b,uint32Array:S}=he,M=p*2;if(_e(M,b)){let w=Te(p,S),T=Ce(M,b);return Gm(m,g,_,w,T,x,y)}else{let w=ar(p,S),T=TS[w],R=_.direction[T]>=0,N,C;if(R)N=Me(p),C=Ee(p,S);else N=Ee(p,S),C=Me(p);let I=Sn(N,v,_,x,y)?du(N,m,g,_,x,y):null;if(I){let F=I.point[T];if(R?F<=v[C+w]:F>=v[C+w+3])return I}let D=Sn(C,v,_,x,y)?du(C,m,g,_,x,y):null;if(I&&D)return I.distance<=D.distance?I:D;else return I||D||null}}var sl=new ve,xr=new bn,yr=new bn,yo=new Kt,jm=new Ge,rl=new Ge;function Qm(p,m,g,_){he.setBuffer(p._roots[m]);let x=fu(0,p,g,_);return he.clearBuffer(),x}function fu(p,m,g,_,x=null){let{float32Array:y,uint16Array:v,uint32Array:b}=he,S=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();jm.set(g.boundingBox.min,g.boundingBox.max,_),x=jm}if(_e(S,v)){let E=m.geometry,w=E.index,T=E.attributes.position,A=g.index,R=g.attributes.position,N=Te(p,b),C=Ce(S,v);if(yo.copy(_).invert(),g.boundsTree)return Le(Ue(p),y,rl),rl.matrix.copy(yo),rl.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(I)=>rl.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(_),I.b.applyMatrix4(_),I.c.applyMatrix4(_),I.needsUpdate=!0;for(let U=N,D=C+N;U<D;U++)if(Ne(yr,3*m.resolveTriangleIndex(U),w,T),yr.needsUpdate=!0,I.intersectsTriangle(yr))return!0;return!1}});else{let P=$i(g);for(let I=N,U=C+N;I<U;I++){let D=m.resolveTriangleIndex(I);Ne(xr,3*D,w,T),xr.a.applyMatrix4(yo),xr.b.applyMatrix4(yo),xr.c.applyMatrix4(yo),xr.needsUpdate=!0;for(let F=0,z=P*3;F<z;F+=3)if(Ne(yr,F,A,R),yr.needsUpdate=!0,xr.intersectsTriangle(yr))return!0}}}else{let E=Me(p),w=Ee(p,b);if(Le(Ue(E),y,sl),x.intersectsBox(sl)&&fu(E,m,g,_,x))return!0;if(Le(Ue(w),y,sl),x.intersectsBox(sl)&&fu(w,m,g,_,x))return!0;return!1}}var ol=new Kt,pu=new Ge,vo=new Ge,wS=new Y,AS=new Y,RS=new Y,CS=new Y;function tg(p,m,g,_={},x={},y=0,v=1/0){if(!m.boundingBox)m.computeBoundingBox();pu.set(m.boundingBox.min,m.boundingBox.max,g),pu.needsUpdate=!0;let b=p.geometry,S=b.attributes.position,M=b.index,E=m.attributes.position,w=m.index,T=An.getPrimitive(),A=An.getPrimitive(),R=wS,N=AS,C=null,P=null;if(x)C=RS,P=CS;let I=1/0,U=null,D=null;if(ol.copy(g).invert(),vo.matrix.copy(ol),p.shapecast({boundsTraverseOrder:(F)=>pu.distanceToBox(F),intersectsBounds:(F,z,L)=>{if(L<I&&L<v){if(z)vo.min.copy(F.min),vo.max.copy(F.max),vo.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree){let L=m.boundsTree;return L.shapecast({boundsTraverseOrder:(O)=>vo.distanceToBox(O),intersectsBounds:(O,H,V)=>V<I&&V<v,intersectsRange:(O,H)=>{for(let V=O,G=O+H;V<G;V++){let W=L.resolveTriangleIndex(V);Ne(A,3*W,w,E),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let J=F,X=F+z;J<X;J++){let Q=p.resolveTriangleIndex(J);Ne(T,3*Q,M,S),T.needsUpdate=!0;let st=T.distanceToTriangle(A,R,C);if(st<I){if(N.copy(R),P)P.copy(C);I=st,U=J,D=V}if(st<y)return!0}}}})}else{let L=$i(m);for(let O=0,H=L;O<H;O++){Ne(A,3*O,w,E),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let V=F,G=F+z;V<G;V++){let W=p.resolveTriangleIndex(V);Ne(T,3*W,M,S),T.needsUpdate=!0;let J=T.distanceToTriangle(A,R,C);if(J<I){if(N.copy(R),P)P.copy(C);I=J,U=V,D=O}if(J<y)return!0}}}}}),An.releasePrimitive(T),An.releasePrimitive(A),I===1/0)return null;if(!_.point)_.point=N.clone();else _.point.copy(N);if(_.distance=I,_.faceIndex=U,x){if(!x.point)x.point=P.clone();else x.point.copy(P);x.point.applyMatrix4(ol),N.applyMatrix4(ol),x.distance=N.sub(x.point).length(),x.faceIndex=D}return _}function mu(p,m,g){if(p===null)return null;return p.point.applyMatrix4(m.matrixWorld),p.distance=p.point.distanceTo(g.ray.origin),p.object=m,p}var al=new Ge,ll=new Hi,eg=new Y,ng=new Kt,ig=new Y,gu=["getX","getY","getZ"];class vr extends ru{static serialize(p,m={}){m={cloneBuffers:!0,...m};let{geometry:g,_roots:_,_indirectBuffer:x}=p,y=g.getIndex(),v={version:1,roots:null,index:null,indirectBuffer:null};if(m.cloneBuffers)v.roots=_.map((b)=>b.slice()),v.index=y?y.array.slice():null,v.indirectBuffer=x?x.slice():null;else v.roots=_,v.index=y?y.array:null,v.indirectBuffer=x;return v}static deserialize(p,m,g={}){g={setIndex:!0,indirect:Boolean(p.indirectBuffer),...g};let{index:_,roots:x,indirectBuffer:y}=p;if(!p.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),b(x);let v=new vr(m,{...g,[ho]:!0});if(v._roots=x,v._indirectBuffer=y||null,g.setIndex){let S=m.getIndex();if(S===null){let M=new qe(p.index,1,!1);m.setIndex(M)}else if(S.array!==_)S.array.set(_),S.needsUpdate=!0}return v;function b(S){for(let M=0;M<S.length;M++){let E=S[M],w=new Uint32Array(E),T=new Uint16Array(E);for(let A=0,R=E.byteLength/sn;A<R;A++){let N=Re*A,C=2*N;if(!_e(C,T))w[N+6]=w[N+6]/Re-A}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(p,m={}){if(m.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),m={...m,targetLeafSize:m.maxLeafTris};super(p,m)}shiftTriangleOffsets(p){return super.shiftPrimitiveOffsets(p)}writePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,y=_.attributes.position,v=_.index?_.index.array:null,S=(x?x[p]:p)*3,M=S+0,E=S+1,w=S+2;if(v)M=v[M],E=v[E],w=v[w];for(let T=0;T<3;T++){let A=y[gu[T]](M),R=y[gu[T]](E),N=y[gu[T]](w),C=A;if(R<C)C=R;if(N<C)C=N;let P=A;if(R>P)P=R;if(N>P)P=N;m[g+T]=C,m[g+T+3]=P}return m}computePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,y=_.attributes.position,v=_.index?_.index.array:null,b=y.normalized;if(p<0||m+p-g.offset>g.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let S=y.array,M=y.offset||0,E=3;if(y.isInterleavedBufferAttribute)E=y.data.stride;let w=["getX","getY","getZ"],T=g.offset;for(let A=p,R=p+m;A<R;A++){let C=(x?x[A]:A)*3,P=(A-T)*6,I=C+0,U=C+1,D=C+2;if(v)I=v[I],U=v[U],D=v[D];if(!b)I=I*E+M,U=U*E+M,D=D*E+M;for(let F=0;F<3;F++){let z,L,O;if(b)z=y[w[F]](I),L=y[w[F]](U),O=y[w[F]](D);else z=S[I+F],L=S[U+F],O=S[D+F];let H=z;if(L<H)H=L;if(O<H)H=O;let V=z;if(L>V)V=L;if(O>V)V=O;let G=(V-H)/2,W=F*2;g[P+W+0]=H+G,g[P+W+1]=G+(Math.abs(H)+G)*or}}return g}raycastObject3D(p,m,g=[]){let{material:_}=p;if(_===void 0)return;ng.copy(p.matrixWorld).invert(),ll.copy(m.ray).applyMatrix4(ng),ig.setFromMatrixScale(p.matrixWorld),eg.copy(ll.direction).multiply(ig);let x=eg.length(),y=m.near/x,v=m.far/x;if(m.firstHitOnly===!0){let b=this.raycastFirst(ll,_,y,v);if(b=mu(b,p,m),b)g.push(b)}else{let b=this.raycast(ll,_,y,v);for(let S=0,M=b.length;S<M;S++){let E=mu(b[S],p,m);if(E)g.push(E)}}return g}refit(p=null){return(this.indirect?Zm:zm)(this,p)}raycast(p,m=vi,g=0,_=1/0){let x=this._roots,y=[],v=this.indirect?Jm:Wm;for(let b=0,S=x.length;b<S;b++)v(this,b,m,p,y,g,_);return y}raycastFirst(p,m=vi,g=0,_=1/0){let x=this._roots,y=null,v=this.indirect?Km:Xm;for(let b=0,S=x.length;b<S;b++){let M=v(this,b,m,p,g,_);if(M!=null&&(y==null||M.distance<y.distance))y=M}return y}intersectsGeometry(p,m){let g=!1,_=this._roots,x=this.indirect?Qm:Ym;for(let y=0,v=_.length;y<v;y++)if(g=x(this,y,p,m),g)break;return g}shapecast(p){let m=An.getPrimitive(),g=super.shapecast({...p,intersectsPrimitive:p.intersectsTriangle,scratchPrimitive:m,iterate:this.indirect?Vm:km});return An.releasePrimitive(m),g}bvhcast(p,m,g){let{intersectsRanges:_,intersectsTriangles:x}=g,y=An.getPrimitive(),v=this.geometry.index,b=this.geometry.attributes.position,S=this.indirect?(A)=>{let R=this.resolveTriangleIndex(A);Ne(y,R*3,v,b)}:(A)=>{Ne(y,A*3,v,b)},M=An.getPrimitive(),E=p.geometry.index,w=p.geometry.attributes.position,T=p.indirect?(A)=>{let R=p.resolveTriangleIndex(A);Ne(M,R*3,E,w)}:(A)=>{Ne(M,A*3,E,w)};if(x){if(!(p instanceof vr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let A=(R,N,C,P,I,U,D,F)=>{for(let z=C,L=C+P;z<L;z++){T(z),M.a.applyMatrix4(m),M.b.applyMatrix4(m),M.c.applyMatrix4(m),M.needsUpdate=!0;for(let O=R,H=R+N;O<H;O++)if(S(O),y.needsUpdate=!0,x(y,M,O,z,I,U,D,F))return!0}return!1};if(_){let R=_;_=function(N,C,P,I,U,D,F,z){if(!R(N,C,P,I,U,D,F,z))return A(N,C,P,I,U,D,F,z);return!0}}else _=A}return super.bvhcast(p,m,{intersectsRanges:_})}intersectsBox(p,m){return al.set(p.min,p.max,m),al.needsUpdate=!0,this.shapecast({intersectsBounds:(g)=>al.intersectsBox(g),intersectsTriangle:(g)=>al.intersectsTriangle(g)})}intersectsSphere(p){return this.shapecast({intersectsBounds:(m)=>p.intersectsBox(m),intersectsTriangle:(m)=>m.intersectsSphere(p)})}closestPointToGeometry(p,m,g={},_={},x=0,y=1/0){return(this.indirect?tg:$m)(this,p,m,g,_,x,y)}closestPointToPoint(p,m={},g=0,_=1/0){return Im(this,p,m,g,_)}}var aI=parseInt(ls)>=166,br={Mesh:He.prototype.raycast,Line:ps.prototype.raycast,LineSegments:wi.prototype.raycast,LineLoop:ms.prototype.raycast,Points:gs.prototype.raycast,BatchedMesh:va.prototype.raycast},hn=new He,cl=[];function sg(p,m){if(this.isBatchedMesh)PS.call(this,p,m);else{let{geometry:g}=this;if(g.boundsTree)g.boundsTree.raycastObject3D(this,p,m);else{let _;if(this instanceof He)_=br.Mesh;else if(this instanceof wi)_=br.LineSegments;else if(this instanceof ms)_=br.LineLoop;else if(this instanceof ps)_=br.Line;else if(this instanceof gs)_=br.Points;else throw Error("BVH: Fallback raycast function not found.");_.call(this,p,m)}}}function PS(p,m){if(this.boundsTrees){let g=this.boundsTrees,_=this._drawInfo||this._instanceInfo,x=this._drawRanges||this._geometryInfo,y=this.matrixWorld;hn.material=this.material,hn.geometry=this.geometry;let v=hn.geometry.boundsTree,b=hn.geometry.drawRange;if(hn.geometry.boundingSphere===null)hn.geometry.boundingSphere=new Tn;for(let S=0,M=_.length;S<M;S++){if(!this.getVisibleAt(S))continue;let E=_[S].geometryIndex;if(hn.geometry.boundsTree=g[E],this.getMatrixAt(S,hn.matrixWorld).premultiply(y),!hn.geometry.boundsTree){this.getBoundingBoxAt(E,hn.geometry.boundingBox),this.getBoundingSphereAt(E,hn.geometry.boundingSphere);let w=x[E];hn.geometry.setDrawRange(w.start,w.count)}hn.raycast(p,cl);for(let w=0,T=cl.length;w<T;w++){let A=cl[w];A.object=this,A.batchId=S,m.push(A)}cl.length=0}hn.geometry.boundsTree=v,hn.geometry.drawRange=b,hn.material=null,hn.geometry=null}else br.BatchedMesh.call(this,p,m)}class _u{groups;owners;byGroup=new Map;constructor(p,m,g){let _=Math.floor(m.length/3),x=Array.from({length:_},(M,E)=>E);this.owners=Array(_).fill(null);for(let M of g)for(let E=M.from;E<Math.min(_,M.end);E++)this.owners[E]=M.id;let y=new Map,v=new Int32Array(p.count);for(let M=0;M<p.count;M++){let E=`${p.getX(M)},${p.getY(M)},${p.getZ(M)}`,w=y.get(E);if(w===void 0)w=y.size,y.set(E,w);v[M]=w}let b=(M)=>{while(x[M]!==M)x[M]=x[x[M]],M=x[M];return M},S=new Map;for(let M=0;M<_;M++){let E=[v[m[M*3]],v[m[M*3+1]],v[m[M*3+2]]];for(let w=0;w<3;w++){let T=E[w],A=E[(w+1)%3];if(T===A)continue;let R=`${this.owners[M]??""}:${Math.min(T,A)}:${Math.max(T,A)}`,N=S.get(R);if(N===void 0)S.set(R,M);else x[b(M)]=b(N)}}this.groups=x.map((M,E)=>b(E)),this.groups.forEach((M,E)=>{if(!this.byGroup.has(M))this.byGroup.set(M,[]);this.byGroup.get(M).push(E)})}owner(p){return this.owners[p]??null}faces(p,m=!1){if(!m)return this.byGroup.get(this.groups[p])??[];let g=this.owner(p);return this.owners.flatMap((_,x)=>_===g?[x]:[])}facesOfOwner(p){return this.owners.flatMap((m,g)=>m===p?[g]:[])}}function rg(p){let m=[0];for(let g=1;g<p.length;g++)m.push(m[g-1]+Math.hypot(p[g][0]-p[g-1][0],p[g][1]-p[g-1][1]));return m}function Sr(p,m,g){let _=0,x=m.length-1;if(g<=0)return[p[0][0],p[0][1]];if(g>=m[x])return[p[x][0],p[x][1]];while(x-_>1){let v=_+x>>1;if(m[v]<=g)_=v;else x=v}let y=(g-m[_])/(m[x]-m[_]||1);return[p[_][0]+(p[x][0]-p[_][0])*y,p[_][1]+(p[x][1]-p[_][1])*y]}var On=11,xu=6,IS=12,LS=100,NS=500,DS=3,US=500,Ts=2,yu=300000,OS=45,vu=22,og=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,FS=/^nocol_far/,BS=1.5,kS=0.004,ag=0.02,zS=10,HS=200,hl=1000,bu=1,GS=4,lg=2,VS=2,WS=0.15,cg=100,XS=3,hg=3,ul=1,qS=5,YS=0.1,$S=0.002,ug=1000,ZS=80000,JS=2,KS=24,jS=6000,QS=0.1,dg=30,tM=0.6,eM=0.12,nM=0.15,iM=0.05,sM=0.000001,rM=0.01,oM=100,fg=0.3,aM=new Set(["KeyW","KeyA","KeyS","KeyD"]),lM=60,Su=4,pg="#ffd21f",mg=300,cM=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],hM=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,uM=/_wire_/,dM=6,fM=8,Un=0,pM=1,mM=new Set(["power line"]),gM=/^(1ROAD|1GRASS|1GRAVEL)_ground/,_M=/^1ROAD_ground/,gg="#27d3c3",ws=0.3,_g=14,dl=1.5,xM=50,yM=0.25,vM=5000,bM=200,Mu=4,xg=64;function yg(p,m){performance.clearMeasures(p);let g=performance.now(),_=m();return performance.measure(p,{start:g}),_}function SM(p){let m=document.createElement("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d",{willReadFrequently:!0});return g?.drawImage(p,0,0),g?g.getImageData(0,0,p.width,p.height):null}function MM(p){let{roots:m,indirectBuffer:g}=vr.serialize(p,{cloneBuffers:!1});return m.reduce((_,x)=>_+x.byteLength,g?.byteLength??0)}function EM(p){let m=performance.now(),g=new vr(p.geometry,{indirect:!0}),_=MM(g);return p.geometry.boundsTree=g,p.raycast=sg,performance.measure("map2lap.bvh",{start:m,detail:_}),_}var Mr=(p)=>p.vertices*On*4+4+p.indices*2;function qn(p,m){let g=m.getBoundingClientRect();return new Jt((p.clientX-g.left)/g.width*2-1,-(p.clientY-g.top)/g.height*2+1)}async function Er(p,m,g=DS){let _;try{if(_=await fetch(p,{signal:m}),_.ok)return await _.arrayBuffer()}catch(x){if(m.aborted||g<=1)throw x;return await new Promise((y)=>setTimeout(y,US)),Er(p,m,g-1)}throw new So(_.status,(await _.json().catch(()=>null))?.error??`${p}: ${_.status}`)}class So extends Error{status;constructor(p,m){super(m);this.status=p}}function fl(p){let m=[],g=0;return async(_)=>{if(g>=p)await new Promise((x)=>m.push(x));g++;try{return await _()}finally{g--,m.shift()?.()}}}var TM=fl(IS);async function wM(p,m,g){let _;if(/\.dds$/i.test(m)){let x=new qh().parse(p,!0);_=new eo(x.mipmaps,x.width,x.height,x.format),_.minFilter=x.mipmapCount>1?Kn:yn}else{let x=await createImageBitmap(new Blob([p]),{imageOrientation:"none",premultiplyAlpha:"none"});_=new ze(x),_.generateMipmaps=!0,_.minFilter=Kn}return _.flipY=!1,_.wrapS=_.wrapT=js,_.anisotropy=g,_.colorSpace=fa,_.needsUpdate=!0,_}function vg(p,m,g,_){let x=p.at(-1),y=p.at(-2);if(p.length>=vM)x[2]+=_;else if(Math.hypot(m-x[0],g-x[1])>=yM)p.push([m,g,_]);else if(y&&y[0]===x[0]&&y[1]===x[1])x[2]+=_;else p.push([x[0],x[1],_])}function AM(p,m){let g=[],_=m/2,x=(b)=>{let S=p[Math.max(0,b-1)],M=p[Math.min(p.length-1,b+1)],E=Math.hypot(M[0]-S[0],M[2]-S[2])||1;return[(M[2]-S[2])/E*_,(S[0]-M[0])/E*_]},y=(b)=>{let[S,M]=x(b);return[p[b][0]+S,p[b][1]+ws,p[b][2]+M]},v=(b)=>{let[S,M]=x(b);return[p[b][0]-S,p[b][1]+ws,p[b][2]-M]};for(let b=0;b+1<p.length;b++)g.push(...y(b),...y(b+1),...v(b),...v(b+1));return g.push(...y(0),...v(0),...y(p.length-1),...v(p.length-1)),g}function RM([p,m,g]){let _=m+ws;return[p-dl,_,g,p+dl,_,g,p,_,g-dl,p,_,g+dl]}function CM(p,m,g){return Math.hypot(...p.map((_,x)=>Math.max(Math.abs(m[x]-_),Math.abs(g[x]-_))))}function bo(p,m){p.computeBoundingBox();let g=p.boundingBox;p.boundingSphere=new Tn(new Y(...m.center),Math.max(m.radius,CM(m.center,g.min.toArray(),g.max.toArray())))}function PM(p,m){let g=new $e,_=new ya(new Float32Array(m,0,p.vertices*On),On);g.setAttribute("position",new fs(_,3,0)),g.setAttribute("normal",new fs(_,3,3)),g.setAttribute("uv",new fs(_,2,6));let x=p.vertices*On*4+4;return g.setIndex(new qe(new Uint16Array(m,x,p.indices),1)),bo(g,p),g}class Eu{copyVersion=0;copyLoading=null;copyStamp=[];groundVersion=0;copyGhost=null;copyFoot=new Y;copyPose={turn:0,y:0,scale:1};onCopyPlace=null;renderer;scene=new ga;surfaceOverlay=null;surfaceFailed=()=>{};camera=new Cn(55,1,0.5,yu);resizing;down=new ro;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];loadedTexture=null;materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=vu;highest=ug;area=Rl([]);lastGround=0;zoomLeft=0;zoomAim=new Y;host;flying=new Set;ride=null;rideSpeed=0;rideHeight=0;rideTold=0;onRideMoving=()=>{};onRideMetre=()=>{};lastFrame=0;settings=u;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new ro;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=mg;onIndexed=()=>{};picks=new Map;adding=!1;selectMode={enabled:!1,whole:!1,add:!1};materialAreas=new Map;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};refreshes=fl(xu);brush=null;onStroke=()=>{};askPreview=()=>Promise.resolve(null);onStrokeRefused=()=>{};onToolWheel=()=>{};ring=null;stroke=null;previewed=new Set;underPreview=new Map;previewShown=new Map;wheelTaken=!1;marking=null;pins=[];pinMarks=null;pinTexture=null;dragged=null;onPinMoved=()=>{};onPinTaken=()=>{};onClicked=()=>{};band=null;moveTool=!1;onMoved=()=>{};placed=new Map;pendingPivots=new Map;dragging=null;constructor(p){this.host=p,this.renderer=new Wh({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),p.appendChild(this.renderer.domElement),this.scene.background=new oe("#a9cfe9"),this.scene.add(new La("#ffffff",2));let m=new Ia("#fff4e0",1.6);m.position.set(0.5,1,0.35),this.scene.add(m),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.moves(this.renderer.domElement),this.dragPins(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(p),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(p){if(this.shown=p,p)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(p){this.settings=p}setHover(p){this.onHover=p}setPick(p){this.onPick=p}async setSurface(p,m=()=>{}){if(this.surfaceFailed=m,!p){this.surfaceOverlay?.clear();return}this.surfaceOverlay??=new Xh(this.scene,()=>{this.dirty=!0},(g)=>{if(!ts(this.usedBytes,g,this.settings.memoryGb))return!1;return this.usedBytes+=g,!0},(g)=>{this.usedBytes-=g}),await this.surfaceOverlay.set(p,this.meshes)}setIndexed(p){this.onIndexed=p,p(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.forgetPicks(),this.onPick(null)}setAdding(p){this.adding=p}setSelectMode(p,m=!1,g=!1){this.selectMode={enabled:p,whole:m,add:g}}materialSelection(p){let m=this.byNumber.get(p.mesh),g=this.materialAreas.get(p.mesh);if(!m||!g||p.face===void 0||!this.data)throw Error("This material is no longer loaded");let _=m.userData.info,x=[];for(let[y,v]of this.materialAreas){let b=this.byNumber.get(y);if(!b||b.userData.info.material!==_.material||!p.whole&&y!==p.mesh)continue;let S=p.whole?v.facesOfOwner(p.object??null):v.faces(p.face);if(S.length)x.push({mesh:y,faces:S})}return{material:this.data.materials[_.material].name,truncated:!1,tiles:[],meshes:x}}setRemoved(p,m=[],g=[]){this.named={ids:p,objectSorts:new Set(g)};let _=new Set(m),x=new Set([...p,...Cs(this.data?.objects??{},new Set([...g,...m]))]),y=m.length!==this.removedSorts.size||m.some((b)=>!this.removedSorts.has(b)),v=!1;for(let b of this.removed)if(!x.has(b))this.leaveOut(b,!1),v=!0;if(y){this.removedSorts=_;for(let b of this.billboardMeshes())this.restore(b);v=!0}for(let b of x)if(v||!this.removed.has(b))this.leaveOut(b,!0);if(v&&this.removedSorts.size)for(let b of this.billboardMeshes())this.leaveOutSorts(b);if(this.removed=x,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(p=this.named){return new Set([...p.ids,...Cs(this.data?.objects??{},p.objectSorts),...Cs(this.data?.objects??{},this.removedSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let p of this.removed){let m=p.slice(0,p.lastIndexOf("#"));if(!this.data?.objects?.[m]){if(!this.billboardsOut.has(m))this.billboardsOut.set(m,[]);this.billboardsOut.get(m).push(p);continue}for(let g of this.piecesOf(p)){if(!this.listedOut.has(g.mesh))this.listedOut.set(g.mesh,[]);this.listedOut.get(g.mesh).push(g)}}}countOfListed(p,m,g){if(!this.data)return 0;return nd(this.data.objects,p,Il(this.wanted({ids:m,objectSorts:new Set(g)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(p){let m=p.userData.indices;if(!m)return;let g=p.geometry.getIndex();g.array.set(m),g.needsUpdate=!0}*billboardsOf(p){let m=p.userData.info,g=m.indices/3,_=m.first_face;for(let x=Pr(0,_);x<=Pr(Math.max(0,g-1),_);x++){let[y,v]=Co(x,_,g);if(y<v)yield[x,y,v]}}spriteOf(p,m){let g=p.geometry.getAttribute("uv"),_=p.userData.indices??p.geometry.getIndex().array,[x,y,v]=[_[m*3],_[m*3+1],_[m*3+2]];return Dl(this.data.atlas,(g.getX(x)+g.getX(y)+g.getX(v))/3,(g.getY(x)+g.getY(y)+g.getY(v))/3)}leaveOutSorts(p){if(!this.removedSorts.size||!this.data)return;let m=p.userData.info;for(let[,g,_]of this.billboardsOf(p)){let x=this.spriteOf(p,g);if(x&&this.removedSorts.has(x))this.leaveOutIn(p,{mesh:m.i,from:g,end:_},!0)}}countOf(p){let m=new Set;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,y]of this.billboardsOf(g))if(this.spriteOf(g,y)===p)m.add(`${_.base}#${x}`)}for(let g of Cs(this.data?.objects??{},new Set([p])))if(!this.removed.has(g)&&this.shownBounds(this.piecesOf(g)))m.add(g);return m.size}piecesOf(p,m=!0){let g=p.lastIndexOf("#"),_=p.slice(0,g),x=Number(p.slice(g+1)),y=this.data?.objects?.[_]?.faces[x];if(y)return[...y.map(([v,b,S])=>({mesh:v,from:b,end:b+S})),...m?(this.belonging.get(p)??[]).flatMap((v)=>this.piecesOf(v)):[]];return(this.parts.get(_)??[]).map((v)=>{let b=v.userData.info,[S,M]=Co(x,b.first_face,b.indices/3);return{mesh:b.i,from:S,end:M}}).filter((v)=>v.from<v.end)}leaveOut(p,m){for(let g of this.piecesOf(p)){let _=this.byNumber.get(g.mesh);if(_)this.leaveOutIn(_,g,m)}}leaveOutIn(p,{from:m,end:g},_){let x=p.geometry.getIndex(),y=x.array;if(!p.userData.indices)p.userData.indices=y.slice(),this.usedBytes+=y.byteLength;if(_)y.fill(0,m*3,g*3);else y.set(p.userData.indices.subarray(m*3,g*3),m*3);x.needsUpdate=!0}async open(p,m){let g=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:_}=this.loading;if(this.clear(),this.trackName=p,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),m(p?"Reading the track …":"",p?null:void 0),!p)return;try{await this.load(p,g,_,m)}catch(x){if(g!==this.token)return;this.loadedTexture=null,this.loading.abort(),m(`Could not load this track: ${x.message}`)}}async load(p,m,g,_){let x=await fetch(`/api/editor/${encodeURIComponent(p)}/index`,{signal:g}),y=await x.json();if(m!==this.token)return;if(!x.ok){_(y.error||"Could not read this track");return}this.data=y,this.objectPieces=Nl(y.objects),this.belonging=Ll(y.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(y.revision),this.placeCamera(y),this.renderer.domElement.focus({preventScroll:!0});let v=Cl(y.meshes.filter((H)=>!H.copy),this.camera.position.toArray()),b=this.camera.position.clone(),S=performance.now(),M=y.meshes.length,E=0,w=0,T=0,A=fl(2),R=new Map,N=new Set(y.surface_tiles??[]),C=new Set(y.meshes.map((H)=>Wi(H.name)).filter((H)=>H&&N.has(H))),P=new Set(y.meshes.map((H)=>y.materials[H.material]?.texture).filter(Boolean)),I=y.textures.filter((H)=>P.has(H.name)).length,U=M+I+C.size,D=0,F=!1,z=()=>{if(m!==this.token)return;let H=!F?`Loading: ${E+w} of ${M} parts`:T<I&&!this.overLimit?`Loading textures: ${T} of ${I}`:`Preparing selection: ${D} of ${R.size} (${E+w} parts)`;_(H,Math.min(1,(E+w+T+D)/Math.max(1,U)))};this.loadedTexture=()=>{T++,z()};let L=y.meshes.some((H)=>H.copy)?this.syncCopies(y).then(()=>{w=y.meshes.filter((H)=>H.copy).length,z()}):Promise.resolve();if(z(),await Promise.all(Array.from({length:xu},async()=>{while(v.length&&m===this.token){if(performance.now()-S>NS&&b.distanceTo(this.camera.position)>LS)v=Cl(v,this.camera.position.toArray()),b=this.camera.position.clone(),S=performance.now();let H=v.pop();if(this.byNumber.has(H.i))continue;if(!ts(this.usedBytes,Ts*Mr(H),this.settings.memoryGb)){this.overLimit=!0,v.length=0;return}this.usedBytes+=Ts*Mr(H);let V=this.heightsVersion,G=await Er(`/api/editor/${encodeURIComponent(p)}/mesh/${H.i}?r=${y.revision}`,g);if(m!==this.token)return;this.addMesh(p,y,H,G);let W=Wi(H.name);if(W&&N.has(W)&&!R.has(W)){let J=A(async()=>{if(g.aborted||m!==this.token)return;await Er(`/api/editor/${encodeURIComponent(p)}/surface/prepare?mesh=${H.i}&r=${y.revision}`,g),D++,z()});R.set(W,J),J.catch(()=>{})}if(V!==this.heightsVersion)this.refresh(H.i);E++,z()}})),await L,m!==this.token)return;if(F=!0,z(),await Promise.all(this.textures),m!==this.token)return;if(D<R.size)z();if(await Promise.all(R.values()),m!==this.token)return;this.loadedTexture=null,_(this.overLimit?`Memory limit reached (Settings): ${E} of ${M} parts, the nearest ones`:`${M} parts loaded`)}turnAround(p){let m=null,g=new Y,_=0;p.addEventListener("mousedown",(x)=>{if(x.button===bu)x.preventDefault()}),p.addEventListener("pointerdown",(x)=>{if(x.button!==bu)return;this.zoomLeft=0,m={x:x.clientX,y:x.clientY};let y=this.camera.position,v=this.camera.getWorldDirection(new Y);_=Math.max(ul,Math.min(this.reachOfLook(),this.groundAlong(y,v)?.distance??this.wayDown(v))),g=y.clone().addScaledVector(v,_),this.intoArea(g)}),p.addEventListener("pointermove",(x)=>{if(!m)return;if(!(x.buttons&GS)){m=null;return}let{look:y,invertLook:v}=this.settings,b=kS*y/h;this.turn(g,_,(m.x-x.clientX)*b,(m.y-x.clientY)*b*(v?-1:1)),m={x:x.clientX,y:x.clientY}}),p.addEventListener("pointerup",(x)=>{if(x.button===bu)m=null})}grabGround(p){let m=null,g=new Y,_=new Y;p.addEventListener("pointerdown",(y)=>{if(y.button!==lg)return;this.zoomLeft=0,this.picker.setFromCamera(qn(y,p),this.camera);let{ray:v}=this.picker,b=this.groundAlong(v.origin,v.direction)?.point.y??this.lastGround;if(m=new ln(new Y(0,1,0),-b),!v.intersectPlane(m,_))m=null});let x=(y,v)=>{if(this.picker.setFromCamera(qn(y,p),this.camera),!this.picker.ray.intersectPlane(v,g)||g.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=_.x-g.x,this.camera.position.z+=_.z-g.z,this.settle(),this.clearance=this.height,this.moved()};p.addEventListener("pointermove",(y)=>{if(!m)return;if(y.buttons&VS)x(y,m);else m=null}),p.addEventListener("pointerup",(y)=>{if(y.button!==lg)return;if(m)x(y,m);m=null})}zoomWheel(p){p.addEventListener("wheel",(m)=>{m.preventDefault();let g=m.ctrlKey&&m.altKey?"ctrlAlt":m.altKey?"alt":m.ctrlKey?"ctrl":m.shiftKey&&this.wheelTaken?"shift":null;if((this.brush||this.wheelTaken)&&g){let M=m.deltaY||m.deltaX;if(M)this.onToolWheel(g,M<0?1:-1);return}if(this.stopRide(),!this.data||this.held)return;this.mouse=qn(m,p);let _=this.hit(),{ray:x}=this.picker,y=this.camera.position,v=_||x.direction.y<0?x.direction:this.camera.getWorldDirection(new Y),b=Math.min(_?.distance??this.wayDown(v),Math.max(this.height,ul)*qS);this.zoomAim.copy(y).addScaledVector(v,Math.max(b,ul));let S=m.deltaMode===WheelEvent.DOM_DELTA_LINE?m.deltaY/XS*cg:m.deltaY;this.zoomLeft+=Mi.clamp(S/cg,-hg,hg)*this.settings.zoom/h},{passive:!1})}glideZoom(p){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let m=this.zoomLeft*(1-Math.exp(-p/YS));if(Math.abs(this.zoomLeft-m)<$S)m=this.zoomLeft;this.zoomLeft-=m;let g=this.camera.position,_=g.distanceTo(this.zoomAim);if(!_)return;let x=Math.max(Math.min(_,ul),_*(1-WS)**-m);g.lerpVectors(this.zoomAim,g,x/_),this.settle(),this.clearance=this.height,this.moved()}followMouse(p){p.addEventListener("pointermove",(m)=>{if(this.mouse=qn(m,p),this.held=m.buttons,!m.buttons)this.hoverDue=!0}),p.addEventListener("pointerdown",(m)=>{this.held=m.buttons}),p.addEventListener("pointerup",(m)=>{this.held=m.buttons,this.hoverDue=!0}),p.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(p){let m=this.brush;if(this.brush=p,!p){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!m)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(p,m,g){this.onStroke=p,this.askPreview=m,this.onStrokeRefused=g}cancelStroke(){if(!this.stroke)return!1;return clearInterval(this.stroke.timer),this.stroke=null,this.takeBackPreview(),!0}takeBackPreview(){for(let[p,m]of this.underPreview){let g=this.byNumber.get(p);if(!g)continue;let _=g.geometry.getAttribute("position").data,x=_.array;for(let[y,v]of m){let b=y*On;x[b+1]=v[0],x[b+3]=v[1],x[b+4]=v[2],x[b+5]=v[3]}_.needsUpdate=!0,bo(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.delete(p),this.dirty=!0}this.underPreview.clear(),this.previewShown.clear()}keepPreview(){this.underPreview.clear(),this.previewShown.clear()}dropPreview(){let p=[...this.previewed];this.previewed.clear();for(let m of p)this.refresh(m)}setWheelTaken(p){this.wheelTaken=p}setMove(p,m){if(this.onMoved=m,p===this.moveTool)return;if(this.moveTool=p,!p)this.dropDrag(),this.renderer.domElement.style.cursor=""}setPlaced(p){this.placed=new Map(p.map((m)=>[m.id,m]));for(let[m,g]of this.pendingPivots){let _=m.lastIndexOf("#"),x=this.data?.objects?.[m.slice(0,_)]?.at[Number(m.slice(_+1))],y=this.placed.get(m);if(x&&Math.abs(x[0]+(y?.x??0)-g[0])<0.002&&Math.abs(x[2]+(y?.z??0)-g[2])<0.002)this.pendingPivots.delete(m)}}rejectMove(p){for(let m of p)this.pendingPivots.delete(m);if(this.dragging?.ids.some((m)=>p.includes(m)))this.dropDrag();this.refreshMeshes([])}rootOf(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)],_=Number(p.slice(m+1));while(g&&g.parents[_]>=0)_=g.parents[_];return g?`${p.slice(0,m)}#${_}`:p}namesOf(p){let m=p.lastIndexOf("#"),g=this.data.objects[p.slice(0,m)],_=Number(p.slice(m+1));return{id:p,kind:Po(g.kinds[_]),sort:Ir(g,_)}}canMove(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)];return!g||!mM.has(g.kinds[Number(p.slice(m+1))])}pivotOf(p){let m=this.pendingPivots.get(p);if(m)return m;let g=p.lastIndexOf("#"),_=this.data?.objects?.[p.slice(0,g)];if(_){let[v,b,S]=_.at[Number(p.slice(g+1))],M=this.placed.get(p);return[v+(M?.x??0),b+(M?.y??0),S+(M?.z??0)]}let x=this.boundsOf(p),y=x.getCenter(new Y);return[y.x,x.min.y,y.z]}grab(p){let m=[];for(let g of p){let _=new Map;for(let{mesh:x,from:y,end:v}of this.piecesOf(g)){let b=this.byNumber.get(x);if(!b)continue;let S=b.userData.indices??b.geometry.getIndex().array;if(!_.has(x))_.set(x,new Set);for(let M=y*3;M<v*3;M++)_.get(x).add(S[M])}for(let[x,y]of _){let v=Uint32Array.from(y),b=this.vertexArray(x),S=new Float32Array(v.length*On);v.forEach((M,E)=>S.set(b.subarray(M*On,(M+1)*On),E*On)),m.push({id:g,mesh:x,numbers:v,floats:S})}}return m}vertexArray(p){return this.byNumber.get(p).geometry.getAttribute("position").data.array}nudgeGrabbed(p,m,g){for(let _ of p){Tl(_.floats,this.vertexArray(_.mesh),_.numbers,On,m.get(_.id),g(_.id));let x=this.byNumber.get(_.mesh);x.geometry.getAttribute("position").data.needsUpdate=!0,bo(x.geometry,x.userData.info),x.geometry.boundsTree?.refit(),this.previewed.add(_.mesh)}this.reframePicks(),this.dirty=!0}nudge(p,m){let g={...Ar,...m},_=this.dragging;if(_&&p.every((x)=>_.ids.includes(x))){for(let x of _.grabbed){if(!p.includes(x.id))continue;let y=new Float32Array(x.floats.length);Tl(x.floats,y,Array.from(x.numbers,(v,b)=>b),On,_.pivots.get(x.id),g),x.floats=y}for(let x of p){let[y,v,b]=_.pivots.get(x);_.pivots.set(x,[y+g.x,v+g.y,b+g.z])}return this.dragOn(_.grabbed)}this.nudgeGrabbed(this.grab(p),new Map(p.map((x)=>[x,this.pivotOf(x)])),()=>g)}dragOn(p){let m=this.dragging;for(let g of m.ids){let[_,,x]=m.pivots.get(g),y=m.ground.get(g),v=this.groundAt(_+m.way.x,x+m.way.z);m.rises.set(g,y!=null&&v!=null?v-y:0)}this.nudgeGrabbed(p,m.pivots,(g)=>({...Ar,x:m.way.x,y:m.rises.get(g)??0,z:m.way.z}))}dropDrag(){let p=this.dragging;if(this.dragging=null,p)this.nudgeGrabbed(p.grabbed,p.pivots,()=>Ar)}reframePicks(){for(let[p,{box:m}]of this.picks){let g=this.boundsOf(p);if(!g.isEmpty())m.box.copy(g)}}moves(p){p.addEventListener("pointerdown",(m)=>{if(!this.moveTool||this.brush||m.button!==Un)return;let g=this.pick(m,p);if(!g?.id||!this.picks.has(g.id))return;let _=[...this.picks.keys()].filter((S)=>this.canMove(S));if(!_.includes(g.id))return;let x=new Map(_.map((S)=>[S,this.pivotOf(S)])),y=new ln(new Y(0,1,0),-x.get(g.id)[1]),v=new Y;if(this.picker.setFromCamera(qn(m,p),this.camera),!this.picker.ray.intersectPlane(y,v))return;let b=new Map(_.map((S)=>{let[M,,E]=x.get(S);return[S,this.groundAt(M,E)]}));this.dragging={ids:_,plane:y,from:v,x:m.clientX,y:m.clientY,grabbed:this.grab(_),pivots:x,ground:b,rises:new Map,way:new Y},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{let g=this.dragging;if(!g)return;if(!(m.buttons&pM))return this.dropDrag();if(!g.way.lengthSq()&&Math.hypot(m.clientX-g.x,m.clientY-g.y)<Su)return;this.picker.setFromCamera(qn(m,p),this.camera);let _=new Y;if(!this.picker.ray.intersectPlane(g.plane,_)||_.distanceTo(this.camera.position)>2*this.highest)return;g.way.set(_.x-g.from.x,0,_.z-g.from.z),p.style.cursor="grabbing",this.dragOn(g.grabbed)}),p.addEventListener("pointerup",(m)=>{let g=this.dragging;if(!g||m.button!==Un)return;if(this.dragging=null,p.style.cursor="grab",g.way.lengthSq()){for(let _ of g.ids){let[x,y,v]=g.pivots.get(_);this.pendingPivots.set(_,[x+g.way.x,y+(g.rises.get(_)??0),v+g.way.z])}this.onMoved(g.ids.map((_)=>({id:_,x:g.way.x,y:g.rises.get(_)??0,z:g.way.z})))}}),p.addEventListener("pointercancel",()=>this.dropDrag())}setClicked(p){this.onClicked=p}setMarking(p){this.marking=p}heightOfGround(p,m){return this.groundAt(p,m)??this.lastGround}groundAt(p,m){return this.groundAlong(new Y(p,yu,m),new Y(0,-1,0))?.point.y??null}drawBand(p,m){if(this.band)this.scene.remove(this.band),this.band.geometry.dispose(),this.band.material.dispose(),this.band=null;if(this.dirty=!0,!p?.length)return;let g=p.length===1?RM(p[0]):AM(p,m);this.band=new wi(new $e().setAttribute("position",new cn(g,3)),new Gi({color:gg,depthTest:!1,transparent:!0})),this.band.renderOrder=10,this.band.frustumCulled=!1,this.scene.add(this.band)}drawPins(p){if(this.pins=p,this.dragged=null,this.pinMarks)this.scene.remove(this.pinMarks),this.pinMarks.geometry.dispose(),this.pinMarks.material.dispose(),this.pinMarks=null;if(this.dirty=!0,!p.length){this.renderer.domElement.style.cursor="";return}this.pinMarks=new gs(new $e().setAttribute("position",new cn(p.flatMap(([m,g,_])=>[m,g+ws,_]),3)),new to({color:gg,size:_g,sizeAttenuation:!1,map:this.pinImage(),alphaTest:0.5,depthTest:!1,transparent:!0})),this.pinMarks.renderOrder=11,this.pinMarks.frustumCulled=!1,this.scene.add(this.pinMarks)}pinImage(){if(this.pinTexture)return this.pinTexture;let p=document.createElement("canvas");p.width=p.height=32;let m=p.getContext("2d");return m.fillStyle="#ffffff",m.beginPath(),m.arc(16,16,15,0,2*Math.PI),m.fill(),this.pinTexture=new Sa(p),this.pinTexture}setPinned(p,m){this.onPinMoved=p,this.onPinTaken=m}pinAt(p,m){let g=m.getBoundingClientRect(),_=new Y,x=-1,y=_g;return this.pins.forEach(([v,b,S],M)=>{_.set(v,b+ws,S).project(this.camera);let E=Math.hypot((_.x+1)/2*g.width+g.left-p.clientX,(1-_.y)/2*g.height+g.top-p.clientY);if(_.z<1&&E<y)y=E,x=M}),x}dropDragged(){let p=this.dragged;if(this.dragged=null,!p||!this.pinMarks)return;this.pins[p.pin]=p.from;let[m,g,_]=p.from;this.pinMarks.geometry.getAttribute("position").setXYZ(p.pin,m,g+ws,_).needsUpdate=!0,this.dirty=!0}dragPins(p){p.addEventListener("pointerdown",(m)=>{if(m.button!==Un||this.brush)return;let g=this.pinAt(m,p);if(g<0)return;this.dragged={pin:g,x:m.clientX,y:m.clientY,from:this.pins[g]},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{if(!this.dragged){if(this.pins.length)p.style.cursor=this.pinAt(m,p)>=0?"grab":"";return}this.mouse=qn(m,p);let g=this.brushAt();if(!g||!this.pinMarks)return;this.pins[this.dragged.pin]=[g.x,g.y,g.z],this.pinMarks.geometry.getAttribute("position").setXYZ(this.dragged.pin,g.x,g.y+ws,g.z).needsUpdate=!0,this.dirty=!0}),p.addEventListener("pointerup",(m)=>{let g=this.dragged;if(!g||m.button!==Un)return;if(Math.hypot(m.clientX-g.x,m.clientY-g.y)<Su)return this.dropDragged();this.dragged=null,this.onPinMoved(g.pin,this.pins[g.pin][0],this.pins[g.pin][2])}),p.addEventListener("pointercancel",()=>this.dropDragged())}sample(){let p=this.stroke;if(!p||!this.mouse)return;let m=performance.now(),g=(m-p.at)/1000,_=p.samples.at(-1);p.at=m;let x=`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;if(x===p.look)vg(p.samples,_[0],_[1],g);else{let y=this.brushAt();if(p.look=x,this.placeRing(y,p.turned),y)vg(p.samples,y.x,y.z,g)}if(!p.asking&&m-p.asked>=bM)p.asking=!0,p.asked=m,this.askPreview(p.samples.map((y)=>[...y]),p.turned).then((y)=>{if(p.asking=!1,this.stroke!==p)return;if(typeof y==="string")this.cancelStroke(),this.onStrokeRefused(y);else if(y)this.showPreview(y)},()=>{p.asking=!1})}showPreview(p){this.takeBackPreview();let m=new Uint32Array(p),g=1;for(let _=0;_<m[0];_++){let x=m[g],y=m[g+1];this.previewShown.set(x,{numbers:m.subarray(g+2,g+2+y),values:new Float32Array(p,(g+2+y)*4,y*Mu)}),g+=2+y+y*Mu,this.laidOver(x)}this.dirty=!0}laidOver(p){let m=this.previewShown.get(p),g=this.byNumber.get(p);if(!m||!g)return;let{numbers:_,values:x}=m,y=g.geometry.getAttribute("position").data,v=y.array,b=new Map;this.underPreview.set(p,b);for(let S=0;S<_.length;S++){let M=_[S]*On,E=S*Mu;b.set(_[S],[v[M+1],v[M+3],v[M+4],v[M+5]]),v[M+1]=x[E],v[M+3]=x[E+1],v[M+4]=x[E+2],v[M+5]=x[E+3]}y.needsUpdate=!0,bo(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.add(p)}setToolWheel(p){this.onToolWheel=p}refreshMeshes(p){if(p.includes(-1))this.syncCopies();let m=new Set(this.previewShown.size?p:[...p,...this.previewed]);if(!this.previewShown.size)this.previewed.clear();if(!m.size)return;this.heightsVersion++;for(let g of m)if(g>=0)this.refresh(g)}async syncCopies(p,m=2){let g=this.token,_=++this.copyVersion;this.copyLoading?.abort(),this.copyLoading=new AbortController;let x=AbortSignal.any([this.loading.signal,this.copyLoading.signal]);try{let y=p;if(!y){let P=await fetch(`/api/editor/${encodeURIComponent(this.trackName)}/copies`,{signal:x}),I=await P.json();if(!P.ok)throw new So(P.status,I.error??"Could not load the copied objects");y=I}if(g!==this.token||_!==this.copyVersion)return;if(y.revision!==this.data?.revision)throw Error("The track changed");let v=y.meshes.filter((P)=>P.copy),b=this.meshes.filter((P)=>P.userData.info.copy),S=b.reduce((P,I)=>P+Ts*Mr(I.userData.info),0),M=v.reduce((P,I)=>P+Ts*Mr(I),0);if(!ts(this.usedBytes-S,M,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");let E=this.heightsVersion,w=fl(xu),T=y.revision,A=y.copy_revision??"",R=await Promise.all(v.map((P)=>w(()=>(x.throwIfAborted(),Er(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${P.i}?r=${T}&c=${A}`,x)))));if(g!==this.token||_!==this.copyVersion)return;if(!ts(this.usedBytes-S,M,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");for(let P of b){let I=P.userData.info;this.scene.remove(P),P.geometry.boundsTree=void 0,P.geometry.dispose(),this.byNumber.delete(I.i),this.usedBytes-=Ts*Mr(I)}this.meshes=this.meshes.filter((P)=>!P.userData.info.copy);let N=Object.fromEntries(Object.entries(this.data.objects).filter(([P])=>!P.startsWith("copy_"))),C=Object.fromEntries(Object.entries(y.objects).filter(([P])=>P.startsWith("copy_")));this.data={...this.data,copy_revision:A,draft:y.draft,meshes:[...this.data.meshes.filter((P)=>!P.copy),...v],objects:{...N,...C}};for(let[P,I]of this.objectPieces)if(I[0]?.id.startsWith("copy_"))this.objectPieces.delete(P);for(let[P,I]of Nl(C))this.objectPieces.set(P,I);for(let P of this.belonging.keys())if(P.startsWith("copy_"))this.belonging.delete(P);for(let[P,I]of Ll(C))this.belonging.set(P,I);this.removed=this.wanted(),this.noteListedOut(),v.forEach((P,I)=>{let U=Ts*Mr(P);if(this.usedBytes+=U,this.addMesh(this.trackName,this.data,P,R[I]),E!==this.heightsVersion)this.refresh(P.i)});for(let P of[...this.picks.keys()]){let[I,U]=P.split("#");if(I.startsWith("copy_")&&!C[I]?.faces[Number(U)]?.length)this.dropPick(P)}this.reframePicks(),this.onViewFailed(null),this.dirty=!0,this.hoverDue=!0}catch(y){if(g!==this.token||_!==this.copyVersion||x.aborted)return;if(y instanceof So&&y.status===409&&m>0)return this.syncCopies(void 0,m-1);this.onViewFailed(y.message)}}setCopy(p,m,g){if(this.copyGhost){this.scene.remove(this.copyGhost);for(let b of this.copyGhost.children)b.geometry.dispose(),b.material.dispose()}if(this.copyGhost=null,this.copyStamp=[],this.onCopyPlace=m,!p||!m){this.dirty=!0;return}let _=new Ui;_.matrixAutoUpdate=!1;let x=[...Il([p],this.belonging)].filter((b)=>this.canMove(b));for(let b of x)for(let S of this.piecesOf(b,!1)){let M=this.byNumber.get(S.mesh);if(!M)continue;let E=M.geometry.getIndex().array,w=[];for(let N=S.from*3;N<S.end*3;N+=3)if(E[N]!==E[N+1]&&E[N+1]!==E[N+2]&&E[N]!==E[N+2])w.push(E[N],E[N+1],E[N+2]);if(!w.length)continue;let T=M.geometry.clone();T.setIndex(w);let A=T.toNonIndexed();T.dispose();let R=M.material.clone();R.transparent=!0,R.opacity=0.5,R.depthWrite=!1,_.add(new He(A,R))}let y=new ve().setFromObject(_),v=this.pivotOf(p);if(y.isEmpty())return;this.copyFoot.set(g?.[0]??v[0],g?.[1]??y.min.y,g?.[2]??v[2]),this.copyGhost=_,this.scene.add(_),this.followCopy()}setCopyPose(p){this.copyPose={turn:p.turn,y:p.y,scale:p.scale},this.followCopy()}copyAt(){if(!this.mouse)return null;this.picker.setFromCamera(this.mouse,this.camera);let p=this.groundAlong(this.picker.ray.origin,this.picker.ray.direction);return p?p.point.toArray():null}followCopy(){if(!this.copyGhost||!this.shown)return;let p=this.camera,{position:m,quaternion:g}=p,_=[this.mouse?.x??1/0,this.mouse?.y??1/0,m.x,m.y,m.z,g.x,g.y,g.z,g.w,p.aspect,p.fov,this.copyPose.turn,this.copyPose.y,this.copyPose.scale,this.groundVersion,this.held?1:0];if(_.every((y,v)=>y===this.copyStamp[v]))return;this.copyStamp=_;let x=this.copyAt();if(this.copyGhost.visible=!!x&&!this.held,x){let{turn:y,y:v,scale:b}=this.copyPose;this.copyGhost.matrix.makeTranslation(x[0],x[1]+v,x[2]).multiply(new Kt().makeRotationY(y*Math.PI/180)).multiply(new Kt().makeScale(b,b,b)).multiply(new Kt().makeTranslation(-this.copyFoot.x,-this.copyFoot.y,-this.copyFoot.z)),this.copyGhost.matrixWorldNeedsUpdate=!0}this.dirty=!0}setViewFailed(p){this.onViewFailed=p}async refresh(p){let m=this.token,{signal:g}=this.loading,_=this.byNumber.get(p);if(!_||!this.data)return;let x=_.userData.asked=(_.userData.asked??0)+1;try{let y=await this.refreshes(()=>Er(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${p}?r=${this.data.revision}${_.userData.info.copy?`&c=${this.data.copy_revision??""}`:""}`,g));if(m===this.token&&_.userData.asked===x&&this.byNumber.get(p)===_)this.takeVertices(_,y)}catch(y){if(m===this.token&&!g.aborted&&_.userData.asked===x&&this.byNumber.get(p)===_)if(y instanceof So&&y.status===409&&_.userData.info.copy)this.syncCopies();else this.onViewFailed(y.message)}}takeVertices(p,m){let g=p.geometry,_=p.userData.info;if(og.test(_.name))this.groundVersion++;let x=g.getAttribute("position").data;x.array.set(new Float32Array(m,0,_.vertices*On)),x.needsUpdate=!0,this.underPreview.delete(_.i);let y=this.dragging?.grabbed.filter((v)=>v.mesh===_.i)??[];if(y.length)this.dragOn(y);if(bo(g,_),g.boundsTree?.refit(),this.laidOver(_.i),this.marked)this.markDue=!0;this.reframePicks(),this.dirty=!0,this.hoverDue=!0}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:p}=this.picker,m=this.groundAlong(p.origin,p.direction);return m&&gM.test(m.object.name)?m.point:null}placeRing(p,m){if(!this.brush)return;if(!this.ring){let g=Array.from({length:xg},(_,x)=>{let y=x/xg*2*Math.PI;return new Y(Math.cos(y),0,Math.sin(y))});this.ring=new ms(new $e().setFromPoints(g),new Gi({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!p,p)this.ring.position.copy(p),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(m?this.brush.turnedColour:this.brush.colour);this.dirty=!0}strokes(p){p.addEventListener("pointerdown",(m)=>{if(!this.brush||m.button!==Un)return;this.mouse=qn(m,p);let g=this.brushAt();if(!g)return;let _=performance.now();this.stroke={samples:[[g.x,g.z,0]],turned:m.shiftKey,at:_,asked:_,asking:!1,look:`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,timer:setInterval(()=>this.sample(),xM)},p.setPointerCapture(m.pointerId)});for(let m of["keydown","keyup"])p.addEventListener(m,(g)=>{if((this.brush||this.wheelTaken)&&g.key==="Alt")g.preventDefault()});p.addEventListener("pointermove",(m)=>{if(!this.brush)return;if(this.mouse=qn(m,p),!this.stroke)this.placeRing(this.brushAt(),m.shiftKey)}),p.addEventListener("pointerup",(m)=>{if(!this.stroke||m.button!==Un)return;this.mouse=qn(m,p),this.sample();let{samples:g,turned:_,timer:x}=this.stroke;clearInterval(x),this.stroke=null,this.keepPreview(),this.onStroke(g,_)}),p.addEventListener("pointercancel",()=>this.cancelStroke()),p.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(p){let m=null;p.addEventListener("pointerdown",(g)=>{m=g.button===0&&!this.brush&&!this.moveTool&&this.pinAt(g,p)<0||g.button===2?{x:g.clientX,y:g.clientY,button:g.button}:null}),p.addEventListener("pointermove",(g)=>{if(m&&Math.hypot(g.clientX-m.x,g.clientY-m.y)>=Su)m=null}),p.addEventListener("pointerup",(g)=>{let _=m?.button===2&&g.button===2?this.pinAt(g,p):-1;if(_>=0)this.onPinTaken(_);else if(m&&g.button===m.button){if(g.button===Un&&this.onCopyPlace){this.mouse=qn(g,p);let v=this.copyAt();if(v)this.onCopyPlace(v);m=null;return}let x=this.pick(g,p),y=p.getBoundingClientRect();if(g.button===2&&x)this.onMenu({x:g.clientX-y.left,y:g.clientY-y.top,width:y.width,height:y.height});if(g.button===Un)this.onClicked(x)}m=null}),p.addEventListener("contextmenu",(g)=>g.preventDefault())}pick(p,m){if(!this.data)return null;this.mouse=qn(p,m);let g=this.hit(),_=g?this.describe(g):null,x=this.adding&&(p.ctrlKey||p.metaKey||this.selectMode?.enabled&&this.selectMode.add)&&p.button===Un,y=this.selectMode?.enabled&&(p.shiftKey||this.selectMode.whole)&&p.button===Un,v=_?.id&&this.moveTool?this.rootOf(_.id):_?.id??null;if(_&&v&&v!==_.id)Object.assign(_,this.namesOf(v));if(!_){if(!x)this.unpick();return null}let b=g?.object.userData.info,S;if(b&&g?.uv&&_&&!v&&(Wi(_.object)||this.materialAreas?.has(b.i))){if(S={mesh:b.i,u:g.uv.x,v:g.uv.y,revision:this.data.revision,whole:!!y},!Wi(_.object))S.face=g.faceIndex??0,S.object=null}if(x&&!v&&!S)return null;if(x&&v&&this.picks.has(v))return this.dropPick(v,!0);if(!x&&!(p.button!==Un&&v&&this.picks.has(v)))this.forgetPicks();let M=v?this.boundsOf(v):null,E=M?.getCenter(new Y).setY(M.min.y),w={id:v,afterBuild:!v&&hM.test(_.object),kind:_.kind,sprite:_.sprite,sort:_.sort,position:E?[E.x,E.y,E.z]:_.at,left:p.button===Un,road:g&&_M.test(g.object.name)?[g.point.x,g.point.z]:null,all:[],adding:!!x,whole:!!y,surface:S};if(v&&M)this.picks.set(v,{box:this.picks.get(v)?.box??this.frameOf(M),picked:w});return w.all=this.allPicked(),this.onPick(w),w}allPicked(){return[...this.picks.values()].map(({picked:p})=>({id:p.id,position:p.position}))}selectedOutside(p){return[...this.picks.values()].filter(({picked:m})=>!p.some((g)=>(g.tree?m.sprite:m.sort)===g.sort)).map(({picked:m})=>({id:m.id,position:m.position}))}dropPick(p,m=!1){let g=this.picks.get(p).picked;this.removeFrame(this.picks.get(p).box),this.picks.delete(p);let _=[...this.picks.values()].at(-1)?.picked??null;if(_)_.all=this.allPicked();let x=_?{..._,adding:m,whole:!1}:m?{...g,id:null,kind:"",all:[],adding:m,whole:!1,surface:void 0}:null;return this.onPick(x),x}setMenu(p){this.onMenu=p}setMarked(p){this.marked=p,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let m=(Array.isArray(this.marked)?this.marked:[this.marked]).flatMap((y)=>y.tree?this.treesOf(y.sort):this.listedOf(y.sort)),g=new Float32Array(m.length*24*3),_=new Y;m.forEach((y,v)=>{cM.forEach(([b,S],M)=>{for(let[E,w]of[b,S].entries())_.set(w&1?y.max.x:y.min.x,w&2?y.max.y:y.min.y,w&4?y.max.z:y.min.z),_.toArray(g,(v*24+M*2+E)*3)})});let x=new $e().setAttribute("position",new qe(g,3));this.markedLines=new wi(x,new Gi({color:pg,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(p){let m=[];for(let g of Cs(this.data.objects,new Set([p]))){let _=g.lastIndexOf("#"),x=this.data.objects[g.slice(0,_)].faces[Number(g.slice(_+1))],y=this.shownBounds(x.map(([v,b,S])=>({mesh:v,from:b,end:b+S})));if(y)m.push(y)}return m}treesOf(p){let m=new Map;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,y,v]of this.billboardsOf(g)){if(this.spriteOf(g,y)!==p)continue;let b=`${_.base}#${x}`;m.set(b,[...m.get(b)??[],{mesh:_.i,from:y,end:v}])}}return[...m.values()].map((g)=>this.shownBounds(g)).filter((g)=>g!==null).concat(this.listedOf(p))}shownBounds(p){let m=new ve,g=new Y;for(let{mesh:_,from:x,end:y}of p){let v=this.byNumber.get(_),b=v?.geometry.getIndex().array;if(!v||!b||x>=y||b[x*3]===b[x*3+1])continue;let S=v.geometry.getAttribute("position");for(let M=x*3;M<y*3;M++)m.expandByPoint(g.fromBufferAttribute(S,b[M]))}return m.isEmpty()?null:m}frameOf(p){let m=new Da(p,new oe(pg));return m.material.depthTest=!1,this.scene.add(m),this.dirty=!0,m}removeFrame(p){this.scene.remove(p),p.dispose(),this.dirty=!0}forgetPicks(){for(let{box:p}of this.picks.values())this.removeFrame(p);this.picks.clear()}boundsOf(p){let m=new ve,g=new Y;for(let{mesh:_,from:x,end:y}of this.piecesOf(p)){let v=this.byNumber.get(_);if(!v)continue;let b=v.geometry.getAttribute("position"),S=v.userData.indices??v.geometry.getIndex().array;for(let M=x*3;M<y*3;M++)m.expandByPoint(g.fromBufferAttribute(b,S[M]))}return m}solidAt(p){let m=p.object.material;if(!m.alphaTest||!m.map||!p.uv)return!0;let g=this.alphaOf.get(m.map);if(g===void 0){if(g=m.map.image instanceof ImageBitmap?SM(m.map.image):null,this.alphaOf.set(m.map,g),g)this.usedBytes+=g.data.byteLength}if(!g)return!0;let _=Math.floor((p.uv.x-Math.floor(p.uv.x))*g.width),x=Math.floor((p.uv.y-Math.floor(p.uv.y))*g.height);return g.data[(x*g.width+_)*4+3]/255>=m.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;if(this.marking){let g=this.brushAt();if(g)this.marking(g.x,g.z)}let p=yg("map2lap.hover",()=>this.hit()),m=p?this.describe(p):null;if(this.moveTool)this.renderer.domElement.style.cursor=m?.id&&this.canMove(this.rootOf(m.id))?"grab":"";this.onHover(m)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let p=this.picker.intersectObjects(this.meshes.filter((m)=>m.visible),!1).find((m)=>this.solidAt(m));return this.wireNear(p?.distance??1/0)??p}wireNear(p){let{ray:m}=this.picker,g=this.renderer.domElement.clientHeight||1,_=2*Math.tan(Mi.degToRad(this.camera.fov)/2)/g*dM,x=new Y,y=new Y,v=new Y,b=new Y,S,M=p;for(let E of this.meshes){if(!E.visible||!uM.test(E.name))continue;let w=E.geometry.boundingSphere,T=m.direction.dot(w.center.clone().sub(m.origin));if(m.distanceSqToPoint(w.center)>(w.radius+Math.max(T,0)*_)**2)continue;let A=E.geometry.getIndex().array,R=E.geometry.getAttribute("position");for(let N=0;N*3<A.length;N+=fM){if(A[N*3]===A[N*3+1])continue;x.fromBufferAttribute(R,A[N*3]),y.fromBufferAttribute(R,A[N*3+1]);let C=m.distanceSqToSegment(x,y,v,b),P=v.distanceTo(m.origin);if(P<M&&C<=(P*_)**2)M=P,S={distance:P,point:b.clone(),object:E,faceIndex:N}}}return S}describe(p){let m=this.data,g=p.object,_=g.userData.info,x=m.materials[_.material],y=m.textures.find((P)=>P.name===x.texture),{x:v,y:b,z:S}=p.point,M=p.faceIndex??0,E=p.uv?[p.uv.x,p.uv.y]:null,w=_.first_face!==null&&_.first_face!==void 0,T=w?Pr(M,_.first_face):null,A=id(this.objectPieces.get(_.i),M),R=A?m.objects[A.slice(0,A.lastIndexOf("#"))]:null,N=A?Number(A.slice(A.lastIndexOf("#")+1)):-1,C=w||!!R&&["tree","bush"].includes(R.kinds[N]);return{id:A??(T!==null?`${_.base}#${T}`:null),kind:A?Po(R.kinds[N]):rd(_.name),sprite:C&&E?Dl(m.atlas,E[0],E[1]):null,sort:A&&!C?Ir(R,N):null,object:_.name,physics:sd(_.name),material:x.name,shader:x.shader,texture:x.texture,textureBytes:y?.size??null,vertices:_.vertices,triangles:_.indices/3,triangle:M,uv:E,shownTo:_.lod_out,billboard:w?this.billboard(g,_,M):null,at:[v,b,S],tile:td(v,S),route:Ro(m.route,v,S),latLon:m.anchor?ed(m.anchor,v,b,S):null,distance:p.distance}}billboard(p,m,g){let _=m.first_face,x=Pr(g,_),[y,v]=Co(x,_,m.indices/3);if(v-y<8)return{number:x,height:null,width:null,foot:null};let b=p.geometry.getIndex(),S=p.geometry.getAttribute("position"),M=new ve,E=new Y,w=new Y;for(let A=y*3;A<v*3;A++)if(E.fromBufferAttribute(S,b.getX(A)),M.expandByPoint(E),A===y*3)w.copy(E);E.fromBufferAttribute(S,b.getX(y*3+1));let T=M.getCenter(new Y);return{number:x,height:M.max.y-M.min.y,width:w.distanceTo(E),foot:[T.x,T.z]}}flyKeys(p){p.tabIndex=0,p.addEventListener("pointerdown",(m)=>{if(p.focus({preventScroll:!0}),m.button!==Un)this.stopRide()}),p.addEventListener("keydown",(m)=>{if(!aM.has(m.code)||m.ctrlKey||m.metaKey||m.altKey)return;m.preventDefault(),this.stopRide(),this.flying.add(m.code)}),p.addEventListener("keyup",(m)=>this.flying.delete(m.code)),p.addEventListener("blur",()=>this.flying.clear())}fly(p){let m=this.camera.position,g=this.camera.getWorldDirection(new Y).setY(0).normalize(),_=new Y().crossVectors(g,this.camera.up).normalize(),x=new Y;if(this.flying.has("KeyW"))x.add(g);if(this.flying.has("KeyS"))x.sub(g);if(this.flying.has("KeyD"))x.add(_);if(this.flying.has("KeyA"))x.sub(_);if(!x.lengthSq())return;let y=Math.min(jS,Math.max(KS,this.height*JS));m.add(x.normalize().multiplyScalar(y*this.settings.fly/h*p)),this.keepInArea();let v=this.groundBelow();if(v!==null)m.y+=(v+this.clearance-m.y)*(1-Math.exp(-p/fg));this.settle(v),this.moved()}turn(p,m,g,_){let x=this.camera.getWorldDirection(new Y),y=new Na().setFromVector3(x);y.theta+=g,y.phi=Mi.clamp(y.phi-_,Math.PI/2+ag,Math.PI-ag),x.setFromSpherical(y);let v=this.camera.position;v.copy(p).addScaledVector(x,-m),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(v.clone().add(x)),this.moved()}groundAlong(p,m){return this.down.set(p,m),yg("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let p=this.camera.position;return this.groundAlong(new Y(p.x,p.y+yu,p.z),new Y(0,-1,0))?.point.y??null}wayDown(p){return Math.max(this.camera.position.y-this.lastGround,0)/-p.y}reachOfLook(){return Math.max(HS,this.height*zS)}intoArea(p){let{minX:m,maxX:g,minZ:_,maxZ:x}=this.area;p.x=Mi.clamp(p.x,m-hl,g+hl),p.z=Mi.clamp(p.z,_-hl,x+hl)}keepInArea(){let p=this.camera.position,m=this.camera.getWorldDirection(new Y),g=p.clone().addScaledVector(m,Math.min(this.wayDown(m),this.reachOfLook())),_=g.clone();this.intoArea(_),p.x+=_.x-g.x,p.z+=_.z-g.z}settle(p){this.keepInArea(),this.keepHeight(p===void 0?this.groundBelow():p)}keepHeight(p){if(p!==null)this.lastGround=p;let m=this.camera.position;m.y=Mi.clamp(m.y,this.lastGround+BS,this.lastGround+this.highest),this.height=m.y-this.lastGround}home(){if(!this.data)return;this.ride=null,this.onRideMoving(!1),this.placeCamera(this.data),this.moved(),this.tellRideMetre()}setRide(p,m){this.rideSpeed=p,this.rideHeight=m}setRideWatch(p,m){this.onRideMoving=p,this.onRideMetre=m}tellRideMetre(){let p=this.camera.position;this.onRideMetre(Ro(this.data?.route??[],p.x,p.z)?.metre??null)}rideLook(p,m){let g=this.data.route,[_,x]=Sr(g,m,p),[y,v]=Sr(g,m,p+dg),[b,S]=Sr(g,m,p-dg);return(y!==_||v!==x?new Y(y-_,0,v-x):new Y(_-b,0,x-S)).normalize().setY(-eM).normalize()}onRoute(){if(this.ride)return this.ride;let p=this.data?.route??[],m=this.camera.position,g=rg(p),_=Ro(p,m.x,m.z)?.metre;if(_===void 0||!g[g.length-1])return null;this.flying.clear(),this.zoomLeft=0,this.ride={metre:_,metres:g,left:0,moving:!1},[m.x,m.z]=Sr(p,g,_);let x=this.groundBelow();if(x!==null)this.lastGround=x;return m.y=this.lastGround+this.rideHeight,this.keepHeight(x),this.camera.lookAt(m.clone().add(this.rideLook(_,g))),this.moved(),this.onRideMetre(_),this.ride}rideBy(p){let m=this.onRoute();if(m)m.left+=p;return!!m}toggleRide(){let p=this.onRoute();if(!p)return!1;if(!p.moving&&p.metre>=p.metres[p.metres.length-1])p.metre=0;return p.moving=!p.moving,this.onRideMoving(p.moving),!0}stopRide(){if(!this.ride)return;this.ride=null,this.clearance=this.height,this.onRideMoving(!1),this.tellRideMetre()}rideOn(p){let m=this.ride,{metres:g}=m,_=g[g.length-1],x=this.camera.position,y=performance.now(),v=Math.abs(m.left)<iM?m.left:m.left*(1-Math.exp(-p/nM)),b=m.metre;if(m.left-=v,m.metre=Mi.clamp(b+v+(m.moving?this.rideSpeed*p:0),0,_),m.metre<=0||m.metre>=_)m.left=0;if(m.moving&&m.metre>=_)m.moving=!1,this.onRideMoving(!1);let S=this.camera.getWorldDirection(new Y),M=this.rideLook(m.metre,g),E=m.metre!==b,w=S.distanceToSquared(M)>sM,T=Math.abs(x.y-this.lastGround-this.rideHeight)>rM;if(!E&&!w&&!T)return;if(E||T){[x.x,x.z]=Sr(this.data.route,g,m.metre);let A=this.groundBelow();if(A!==null)x.y+=(A+this.rideHeight-x.y)*(1-Math.exp(-p/fg));this.keepHeight(A)}if(this.camera.lookAt(x.clone().add(S.lerp(M,1-Math.exp(-p/tM)))),this.moved(),y-this.rideTold>=oM||!m.left&&!m.moving)this.rideTold=y,this.onRideMetre(m.metre)}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let p=this.host.clientWidth,m=this.host.clientHeight;if(!p||!m)return;this.renderer.setSize(p,m),this.camera.aspect=p/m,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let p=performance.now(),m=Math.min(QS,(p-this.lastFrame)/1000);if(this.lastFrame=p,this.shown&&this.ride)this.rideOn(m);if(this.shown&&this.flying.size)this.fly(m);if(this.shown&&this.zoomLeft)this.glideZoom(m);if(!this.shown)return;if(this.followCopy(),this.dirty){this.dirty=!1;for(let g of this.meshes){let _=this.camera.position.distanceTo(g.geometry.boundingSphere.center);g.visible=_>=g.userData.lodIn&&_<g.userData.lodOut}this.surfaceOverlay?.follow(),this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&p-this.lastHover>=lM)this.hoverDue=!1,this.lastHover=p,this.hover();if(this.markDue&&p-this.lastMark>=this.markEvery){let g=performance.now();this.frameMarked(),this.lastMark=p,this.markEvery=Math.max(mg,4*(performance.now()-g))}}clear(){this.loadedTexture=null,this.surfaceOverlay?.clear(),this.setCopy(null,null),this.copyVersion++,this.copyLoading?.abort(),this.stopRide();for(let p of this.meshes)this.scene.remove(p),p.geometry.boundsTree=void 0,p.geometry.dispose();for(let p of this.textures)p?.then((m)=>{if(!m)return;let g=m.image;if(m.dispose(),g instanceof ImageBitmap)g.close()},()=>{});for(let p of this.materials)p?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.pendingPivots.clear(),this.materialAreas?.clear(),this.objectPieces=new Map,this.belonging=new Map,this.forgetPicks()}texture(p,m,g){let _=this.textures[g];if(!_){let x=Ts*m.textures[g].size,y=this.token;if(!ts(this.usedBytes,x,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=x;let v=this.renderer.capabilities.getMaxAnisotropy(),b=this.loading.signal;_=TM(()=>Er(`/api/editor/${encodeURIComponent(p)}/texture/${g}?r=${m.revision}`,b).then((S)=>wM(S,m.textures[g].name,v))).then((S)=>{if(S.image instanceof ImageBitmap&&y===this.token){let M=Qu(S.image.width,S.image.height)-x;if(!ts(this.usedBytes,M,this.settings.memoryGb))return this.usedBytes-=x,this.overLimit=!0,S.dispose(),S.image.close(),null;this.usedBytes+=M}return S}).then((S)=>{if(y===this.token)this.loadedTexture?.();return S}),this.textures[g]=_}return _}material(p,m,g){let _=this.materials[g];if(_)return _;let x=m.materials[g],y=Math.min(1,x.bright),v=new Ta({color:new oe(y,y,y)});if(x.alpha_ref>0)v.alphaTest=x.alpha_ref;if(x.blend)v.transparent=!0,v.depthWrite=!1;this.materials[g]=v;let b=m.textures.findIndex((S)=>S.name===x.texture);if(b>=0){let S=this.token;this.texture(p,m,b).then((M)=>{if(!M||S!==this.token)return;v.map=M,v.needsUpdate=!0,this.dirty=!0},()=>{})}return v}addMesh(p,m,g,_){if(this.byNumber.has(g.i))return;let x=new He(PM(g,_),this.material(p,m,g.material));if(x.userData={lodIn:g.lod_in,lodOut:g.lod_out,info:g},x.name=g.name,this.scene.add(x),this.meshes.push(x),g.base!==null&&g.base!==void 0){if(!this.parts.has(g.base))this.parts.set(g.base,[]);this.parts.get(g.base).push(x)}if(this.byNumber.set(g.i,x),!Wi(g.name)&&g.first_face==null&&(this.objectPieces.has(g.i)||/^nocol_road_edge_dirt_/.test(g.name)))this.materialAreas??=new Map,this.materialAreas.set(g.i,new _u(x.geometry.getAttribute("position"),x.userData.indices??x.geometry.getIndex().array,this.objectPieces.get(g.i)??[]));this.surfaceOverlay?.add(x).catch((y)=>this.surfaceFailed(String(y.message??y))),this.laidOver(g.i);for(let y of this.listedOut.get(g.i)??[])this.leaveOutIn(x,y,!0);if(g.base!==null&&g.base!==void 0){for(let y of this.billboardsOut.get(g.base)??[])for(let v of this.piecesOf(y))if(v.mesh===g.i)this.leaveOutIn(x,v,!0);this.leaveOutSorts(x)}if(this.marked)this.markDue=!0;if(og.test(g.name)){this.groundVersion++,this.usedBytes+=EM(x),this.grounds.push(x);let y=x.geometry.boundingBox,v=this.camera.position;if(v.x>=y.min.x&&v.x<=y.max.x&&v.z>=y.min.z&&v.z<=y.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(p){let m=new Y,g=new Y(0,0,1);if(p.start)m.set(...p.start.pos),g.set(...p.start.forward).normalize();else if(p.meshes.length){for(let b of p.meshes)m.add(new Y(...b.center));m.divideScalar(p.meshes.length)}this.camera.position.copy(m).addScaledVector(g,-OS).add(new Y(0,vu,0)),this.camera.lookAt(m),this.camera.updateMatrixWorld(),this.clearance=this.height=vu,this.lastGround=m.y,this.zoomLeft=0,this.area=Rl(p.meshes.filter((b)=>!FS.test(b.name)));let{minX:_,maxX:x,minZ:y,maxZ:v}=this.area;this.highest=Math.min(ZS,Math.max(ug,x-_,v-y))}}function IM({name:p,title:m,taken:g,built:_,visible:x,controls:y,fileHost:v,savedHost:b,toolsHost:S,notesHost:M,onStatus:E,onSaved:w}){let T=s(null),A=s(null),[R,N]=n(null),[C,P]=n(null);return i(()=>{let I=new Eu(T.current);return I.setHover(P),N(I),()=>{I.dispose(),N(null)}},[]),i(()=>{R?.show(x)},[R,x]),i(()=>{R?.setControls(y)},[R,y]),i(()=>{R?.open(p,E)},[R,p,_,E]),e("div",{id:"scene",className:gl.scene,hidden:!x,ref:A,children:[t("div",{className:gl.view,ref:T}),R&&p&&t(um,{name:p,title:m,taken:g,view:R,scene:A,fileHost:v,savedHost:b,toolsHost:S,notesHost:M,elevationSpeed:y.elevationSpeed,reopen:()=>void R.open(p,E),onSaved:w},`${p} ${_}`),t(fm,{hovered:C})]})}export{IM as default};
