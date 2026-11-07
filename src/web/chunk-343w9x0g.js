import{o,i,l,s,n,d,c,r,a,t,e,h,u,f}from"./chunk-6pgvy4f2.js";var dl={scene:"scene_u4kRgA",view:"view_u4kRgA"};var Iu=1,Lu=2,Nu=4,vg=(p)=>(p.shiftKey?Iu:0)+(p.ctrlKey?Lu:0)+(p.altKey?Nu:0);function bg(p){return{shift:p.shiftKey,ctrl:p.ctrlKey&&!p.altKey,alt:p.altKey&&!p.ctrlKey,ctrlAlt:p.ctrlKey&&p.altKey}}function bo(){let[p,m]=n(0);return i(()=>{let g=(y)=>m(vg(y)),_=()=>m(0),x=["keydown","keyup","pointermove"];for(let y of x)window.addEventListener(y,g);return window.addEventListener("blur",_),()=>{for(let y of x)window.removeEventListener(y,g);window.removeEventListener("blur",_)}},[]),bg({shiftKey:(p&Iu)>0,ctrlKey:(p&Lu)>0,altKey:(p&Nu)>0})}var Un={options:"options_IcC4dw",controls:"controls_IcC4dw",title:"title_IcC4dw",place:"place_IcC4dw",key:"key_IcC4dw",held:"held_IcC4dw",number:"number_IcC4dw",on:"on_IcC4dw",value:"value_IcC4dw",note:"note_IcC4dw"};var Sn=(p,m)=>()=>{m(),p.focus()},fl=[{keys:"Shift",held:"shift"},{keys:"Ctrl",held:"ctrl"},{keys:"Alt",held:"alt"},{keys:"Ctrl+Alt",held:"ctrlAlt"}];function Mg({keys:p,held:m,children:g}){return e("span",{className:`${Un.place}${m?` ${Un.held}`:""}`,children:[t("kbd",{className:Un.key,"aria-hidden":"true",children:p}),g]})}function ti({id:p,title:m,note:g,options:_=[],actions:x}){let y=bo();return e("div",{id:p,className:Un.options,"data-tool-options":"",children:[e("div",{className:Un.controls,children:[t("b",{className:Un.title,children:m}),_.map((v,b)=>t(Mg,{keys:fl[b].keys,held:y[fl[b].held],children:v},fl[b].keys)),x]}),g&&t("span",{className:Un.note,children:g})]})}function Du({label:p,hint:m,value:g}){return e("span",{className:Un.number,title:m,children:[p," ",t("b",{className:Un.value,children:g})]})}function Ji({id:p,label:m,hint:g,onClick:_}){return t("button",{type:"button",id:p,title:g,onClick:_,children:m})}function pl({label:p,on:m,hint:g,onClick:_}){return t("button",{type:"button",className:m?Un.on:"","aria-pressed":m,title:g,onClick:_,children:p})}function Qe({label:p,unit:m,hint:g,value:_,min:x,max:y,step:v,onChange:b}){return e("label",{className:Un.number,title:g,children:[p," ",t("input",{type:"number",min:x,max:y,step:v,value:_,onChange:(S)=>b(S.target.valueAsNumber||0)})," ",m]})}var Eg=3,Tg=60;function Uu({band:p,smoothing:m}){let g=p.points.length;return t(ti,{id:g?"edit-band":"edit-road-hint",title:m?"Smooth":"Mark road",note:g===0?"Click the road where the stretch begins.":g===1?"A is set: click B further along the road (Esc drops it).":`${m?"Enter takes it, Esc drops it.":"Marked: choose a tool for it, Esc drops it."} A click on the road adds a pin: drag it, right-click takes it away.`,options:m&&p.line?[t(Qe,{label:"Strength",unit:"%",hint:"From short waves only, the hills stay, up to a calm line from A to B (Shift + wheel)",min:0,max:100,step:5,value:p.strength,onChange:p.setStrength}),t(Qe,{label:"Width",unit:"m",hint:"How wide the band is: at first the road's own (Ctrl + wheel)",min:Eg,max:Tg,value:Math.round(p.width),onChange:(_)=>p.setWidth(_||null)})]:[]})}var ml=2,gl=500,_l=0.5,xl=10,yl=100,wg=5,Ag=25,Rg=0.1,ji=(p,m,g,_,x)=>Math.min(x,Math.max(_,Math.round((p+m*Math.max(g,p*Rg))/g)*g)),Cg=(p)=>`${p} ${p===1?"object stands":"objects stand"} at the edge of it and stayed where ${p===1?"it is":"they are"}: its place lies outside.`;function Ou({view:p,edits:m,url:g,enabled:_,colour:x,turnedColour:y,body:v,onNote:b}){let[S,M]=n(wg),[T,w]=n(Ag);i(()=>{p.setBrush(_?{radius:S,colour:x,turnedColour:y}:null)},[p,_,S,x,y]),i(()=>()=>p.setBrush(null),[p]);let E=(R,C)=>({samples:R,base:m.boundRevision(),radius:S,soft:T/100,...v(C)}),A=l((R,C)=>{let I=E(R,C);m.inTurn(async()=>{let U=await r(g,I),N=U.error||!U.height?U.error??"no answer":m.canEdit()?null:"this track can't be changed now";if(N)return p.dropPreview(),b(`Not changed: ${N}`);m.addHeight(U.height),b(U.standing?Cg(U.standing):null)})}),P=l(async(R,C)=>{let I=await fetch(`${g}/preview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(E(R,C))}).catch(()=>null);if(!I)return null;if(I.ok)return I.arrayBuffer().catch(()=>null);return String((await I.json().catch(()=>null))?.error??I.status)}),D=l((R)=>b(`Not changed: ${R}`));return i(()=>(p.setStroke((R,C)=>A(R,C),(R,C)=>P(R,C),(R)=>D(R)),()=>p.setStroke(()=>{},()=>Promise.resolve(null),()=>{})),[p]),{radius:S,soft:T,setRadius:M,setSoft:w}}var Pg=50,vl=10,Bu=300,ku=10,Ig=3,bl=1.5,zu=100,Hu=0.5,Lg=20,Ng=0.2777777777777778,Fu="This track has no route to go along";function Gu({view:p,enabled:m,onNote:g}){let[_,x]=n(!1),[y,v]=n(null),[b,S]=n(Pg),[M,T]=n(Ig);return i(()=>{p.setRide(b*Ng,M)},[p,b,M]),i(()=>(p.setRideWatch(x,v),()=>{p.stopRide(),p.setRideWatch(()=>{},()=>{})}),[p]),i(()=>{if(m)p.tellRideMetre();else p.stopRide()},[p,m]),{moving:_,metre:y,speed:b,height:M,setSpeed:S,setHeight:T,toggle:()=>g(p.toggleRide()?null:Fu),wheel:(w,E)=>{if(w==="shift")g(p.rideBy(E*Lg)?null:Fu);else if(w==="ctrl")T((A)=>ji(A,E,Hu,bl,zu));else if(w==="alt")S((A)=>ji(A,E,ku,vl,Bu))}}}function Vu({camera:p,view:m}){return t(ti,{id:"edit-camera-set",title:"Camera",note:"Shift + wheel goes along the track from the place nearest the camera. W A S D or the mouse leave it, Esc ends it.",options:[t(Du,{label:"Along the track",hint:"How far along the track it is (Shift + wheel: forwards, backwards)",value:p.metre===null?"no route":`${Math.round(p.metre)} m`}),t(Qe,{label:"Height",unit:"m",hint:"How far above the ground it goes along the track (Ctrl + wheel)",min:bl,max:zu,step:Hu,value:p.height,onChange:(g)=>p.setHeight(Math.max(bl,g))}),t(Qe,{label:"Speed",unit:"km/h",hint:"How fast Ride goes (Alt + wheel)",min:vl,max:Bu,step:ku,value:p.speed,onChange:(g)=>p.setSpeed(Math.max(vl,g))})],actions:e(a,{children:[t(Ji,{id:"edit-ride",label:p.moving?"Pause":"Ride",hint:"It rides along the track by itself from where it is",onClick:Sn(m,p.toggle)}),t(Ji,{id:"edit-home",label:"Reset",hint:"Back to the first view, behind the start (Home)",onClick:Sn(m,()=>m.home())})]})})}var Sr={x:0,y:0,z:0,turn:0,scale:1};var Wu=(p,m,g)=>Math.min(g,Math.max(m,p)),br=(p,m)=>Math.round(p*10**m)/10**m,Ts=(p)=>({id:p,...Sr}),Xu=(p)=>!p.x&&!p.y&&!p.z&&!p.turn&&p.scale===1;function ei(p,m){let g=p.x+(m.x??0),_=p.z+(m.z??0),x=Math.hypot(g,_);if(x>1000)[g,_]=[g*1000/x,_*1000/x];let y=(p.turn+(m.turn??0))%360;if(y>180)y-=360;if(y<=-180)y+=360;return{id:p.id,x:br(g,3),y:br(Wu(p.y+(m.y??0),-100,100),3),z:br(_,3),turn:br(y,2),scale:br(Wu(p.scale*(m.scale??1),0.1,10),4)}}function qu(p,m){return{x:m.x-p.x,y:m.y-p.y,z:m.z-p.z,turn:m.turn-p.turn,scale:m.scale/p.scale}}function Sl(p,m,g,_,x,y){let v=y.turn*Math.PI/180,b=Math.cos(v),S=Math.sin(v),[M,T,w]=x;for(let E=0;E<g.length;E++){let A=E*_,P=g[E]*_;m.set(p.subarray(A,A+_),P);let D=(p[A]-M)*y.scale,R=(p[A+1]-T)*y.scale,C=(p[A+2]-w)*y.scale;m[P]=M+b*D+S*C+y.x,m[P+1]=T+R+y.y,m[P+2]=w-S*D+b*C+y.z;for(let I of[3,8]){let U=p[A+I],N=p[A+I+2];m[P+I]=b*U+S*N,m[P+I+2]=-S*U+b*N}}}function Yu({name:p,edits:m,view:g,picked:_,onWheel:x}){let[y,v]=n(null),[b,S]=n(null),[M,T]=n(()=>Ts(""));i(()=>(x((P,D)=>T((R)=>ei(R,P==="shift"?{turn:D*5}:P==="ctrl"?{y:D*0.1}:P==="alt"?{scale:1.05**D}:{}))),()=>x(()=>{})),[x]);let w=_?.id??null;i(()=>{if(y||!w||!g.canMove(w))return;let P=!0;return m.inTurn(async()=>{m.saveNow();let D=await m.saved();if(!P||D===null||!m.canEdit())return;let R=await r(`/api/editor/${encodeURIComponent(p)}/copy`,{base:m.boundRevision(),revision:D,object:w});if(!P)return;if(R.error||!R.template||!R.at||!R.kind)S(R.error??"Could not copy this object");else v({template:R.template,at:R.at,kind:R.kind,source:w}),S(null),g.unpick()}),()=>{P=!1}},[p,w,m,g,y]);let E=l((P)=>{if(!y)return;let D=y.template,R={turn:M.turn,y:M.y,scale:M.scale};m.inTurn(async()=>{if(!m.canEdit())return;m.saveNow();let C=await m.saved();if(C===null)return;let I=await r(`/api/editor/${encodeURIComponent(p)}/copy`,{base:m.boundRevision(),revision:C,template:D,at:P,pose:R});if(I.error||!I.copy)S(I.error??"Could not place the copy");else m.addCopy(I.copy),S(null)})});i(()=>(g.setCopy(y?.source??null,y?(P)=>E(P):null,y?.at),()=>g.setCopy(null,null)),[g,y]),i(()=>{g.setCopyPose(M)},[g,M,y]);let A=b??(y?`Click to place ${y.kind}; keep clicking for more copies. Esc ends Copy.`:w&&!g.canMove(w)?"A power line goes with its poles; pick an object to copy.":w?"Preparing the copy …":"Click an object to copy it, then click where to place it. Esc ends Copy.");return t(ti,{id:"edit-copy-set",title:"Copy",note:A,options:[t(Qe,{label:"Turn",unit:"°",hint:"Turn each copy from the source (Shift + wheel)",min:-180,max:180,step:5,value:M.turn,onChange:(P)=>T((D)=>ei({...D,turn:P},{}))}),t(Qe,{label:"Height",unit:"cm",hint:"Raise each copy above the clicked ground (Ctrl + wheel)",min:-1e4,max:1e4,step:10,value:Math.round(M.y*100),onChange:(P)=>T((D)=>ei({...D,y:P/100},{}))}),t(Qe,{label:"Size",unit:"%",hint:"Size of each copy against its source (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(M.scale*100),onChange:(P)=>T((D)=>ei({...D,scale:P/100},{}))})],actions:y&&t(Ji,{label:"Choose another",hint:"Pick a different source object",onClick:Sn(g,()=>{v(null),S(null),g.unpick()})})})}var Mr=(p)=>p.map((m)=>JSON.stringify(m));var Dg=400,Ug=5000,Og=200,Fg=60000,Bg=64,kg=1000,zg="This track was changed elsewhere: another tab or a build.",Zu="This track was built again: the view shows the build before.",Ml={removed:[],sorts:[],objectSorts:[],heights:[],placed:[],copies:[]},On=(p,m)=>{let g=new Set(p),_=new Set(m);return g.size===_.size&&[...g].every((x)=>_.has(x))},So=(p)=>p.map((m)=>[m.id,m.x,m.y,m.z,m.turn,m.scale].join(" "));function Mo(p){let m=p.recipe;return!!m&&On(p.removed.map((g)=>g.id),m.deleted)&&On(p.sorts,m.sorts)&&On(p.objectSorts,m.objectSorts)&&On(p.heights.map((g)=>g.id),m.heights)&&On(So(p.placed),So(m.placed))&&On(Mr(p.copies),Mr(m.copies??[]))}var Er=null,Hg=(p,m)=>On(p.removed.map((g)=>g.id),m.removed.map((g)=>g.id))&&On(p.sorts,m.sorts)&&On(p.objectSorts,m.objectSorts)&&On(p.heights.map((g)=>g.id),m.heights.map((g)=>g.id))&&On(So(p.placed),So(m.placed))&&On(Mr(p.copies),Mr(m.copies));class El{now={...Ml,keptRevision:0,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];joining=null;listeners=new Set;url;send;name;constructor(p,m=(g,_)=>fetch(g,_)){this.name=p,this.url=`/api/editor/${encodeURIComponent(p)}/edits`,this.send=m}markSaved(){let p=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:p.removed.map((m)=>m.id),sorts:p.sorts,objectSorts:p.objectSorts,heights:p.heights.map((m)=>m.id),placed:p.placed,copies:p.copies}})}inTurn(p){return this.turns=this.turns.then(p).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(p){this.onMeshes=p}handOver(p){Er={name:p,edits:this.edits(),past:this.past,future:this.future}}subscribe=(p)=>(this.listeners.add(p),()=>{this.listeners.delete(p)});state=()=>this.now;set(p){this.now={...this.now,...p};for(let m of this.listeners)m()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(p){this.held=p,this.set({})}bind(p){this.bound=p,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:Zu});else if(this.now.error===Zu)this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let p=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let m=await this.send(this.url),g=await m.json();if(p!==this.asked)return;if(!m.ok)throw Error(g.error??`${m.status}`);this.base=g.base,this.revision=g.revision;let _={removed:g.deleted,sorts:g.sorts??[],objectSorts:g.object_sorts??[],heights:g.heights??[],placed:g.placed??[],copies:g.copies??[]},x=Er?.name===this.name&&Hg(Er.edits,_)?Er:null;Er=null,this.past=x?.past??[],this.future=x?.future??[],this.onServer=_,this.unanswered=[];let y=g.saved,v=y?{at:y.at,deleted:y.deleted,sorts:y.sorts,objectSorts:y.object_sorts,heights:y.heights??[],placed:y.placed??[],copies:y.copies??[]}:null;this.set({..._,keptRevision:g.revision,recipe:v,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:g.outdated,save:"saved"}),this.compare()}catch(m){if(p===this.asked)this.set({save:"stuck",error:m.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((p)=>setTimeout(p,50));return this.isSaved()?this.revision:null}saveNow(p=!1){clearTimeout(this.timer),this.flush(p)}remove(p){let m=new Set(this.now.removed.map((g)=>g.id));this.change({...this.edits(),removed:[...this.now.removed,...p.filter((g)=>!m.has(g.id))]})}removeSort(p){if(!this.now.sorts.includes(p))this.change({...this.edits(),sorts:[...this.now.sorts,p]})}removeObjectSort(p){if(!this.now.objectSorts.includes(p))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,p]})}addHeight(p){this.change({...this.edits(),heights:[...this.now.heights,p]})}addCopy(p){this.change({...this.edits(),copies:[...this.now.copies,p]})}place(p,m){let g=new Set(p.map((y)=>y.id)),_=performance.now(),x=[...this.now.placed.filter((y)=>!g.has(y.id)),...p.filter((y)=>!Xu(y))];if(!!m&&this.joining?.key===m&&_-this.joining.at<kg&&this.past.length>0&&this.canEdit())this.past.pop();this.change({...this.edits(),placed:x},m?{key:m,at:_}:null)}placementOf(p){return this.now.placed.find((m)=>m.id===p)}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0||this.now.placed.length>0||this.now.copies.length>0}discard(){if(this.changed())this.change(Ml)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights,placed:this.now.placed,copies:this.now.copies}}discardOutdated(){this.onServer=null,this.set({outdated:0,...Ml}),this.saveNow()}undo(){if(!this.canEdit())return;this.joining=null;let p=this.past.pop();if(!p)return;this.future.push(this.edits()),this.apply(p)}redo(){if(!this.canEdit())return;this.joining=null;let p=this.future.pop();if(!p)return;this.past.push(this.edits()),this.apply(p)}change(p,m=null){if(!this.canEdit())return;if(this.joining=m,this.past.push(this.edits()),this.past.length>Og)this.past.shift();this.future=[],this.apply(p)}apply(p){let m=p.heights===this.now.heights&&p.placed===this.now.placed&&p.copies===this.now.copies?Dg:0;this.set({...p,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),m)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights&&this.now.placed===this.onServer?.placed&&this.now.copies===this.onServer?.copies}async flush(p=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!p||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let m=this.edits(),g=++this.sent,_=`${Date.now()}-${g}-${Math.random().toString(36).slice(2,10)}`,x=JSON.stringify({base:this.bound,revision:this.revision,deleted:m.removed,sorts:m.sorts,object_sorts:m.objectSorts,heights:m.heights,placed:m.placed,copies:m.copies,id:_,unanswered:this.unanswered.map((y)=>y.id)});this.unanswered=[...this.unanswered,{id:_,number:g}].slice(-Bg),this.sending=!0,this.set({save:"saving"});try{let y=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:x,keepalive:p&&x.length<Fg}),v=await y.json().catch(()=>({}));if(g>=this.sent)this.sending=!1;if(g<this.answered)return;if([400,404,409,413].includes(y.status))return this.sending=!1,this.set({save:"stuck",error:y.status===409?zg:v.error??`${y.status}`});if(!y.ok)throw Error(v.error??`${y.status}`);if(this.answered=g,this.revision=v.revision,this.onServer=m,this.unanswered=this.unanswered.filter((b)=>b.number>g),this.onMeshes(v.meshes??[],v.revision),this.set({keptRevision:v.revision}),!this.isSaved())return void this.flush(p);if(!this.sending)this.set({save:"saved",error:null})}catch(y){if(g>=this.sent)this.sending=!1;if(this.set({save:"failed",error:y.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),Ug)}}}var dn={notes:"notes_L1L6kQ",line:"line_L1L6kQ"};function Tl(p){let m={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[g,,_],radius:x}of p)m.minX=Math.min(m.minX,g-x),m.maxX=Math.max(m.maxX,g+x),m.minZ=Math.min(m.minZ,_-x),m.maxZ=Math.max(m.maxZ,_+x);return p.length?m:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function wl(p,m){let g=new Map(p.map((_)=>[_,Math.hypot(_.center[0]-m[0],_.center[1]-m[1],_.center[2]-m[2])-_.radius]));return[...p].sort((_,x)=>g.get(x)-g.get(_))}function ws(p,m,g){return p+m<=g*1073741824}function $u(p,m){return Math.round(p*m*4*2.333333333333333)}function Ku(p,m){return[Math.floor(p/256),Math.floor(-m/256)]}function Eo(p,m,g){if(p.length<2)return null;let _=1/0,x=0,y=0;for(let v=0;v+1<p.length;v++){let[b,S]=p[v],M=p[v+1][0]-b,T=p[v+1][1]-S,w=M*M+T*T,E=Math.sqrt(w),A=w?Math.min(1,Math.max(0,((m-b)*M+(g-S)*T)/w)):0,P=Math.hypot(m-(b+A*M),g-(S+A*T));if(P<_)_=P,x=y+A*E;y+=E}return{metre:x,off:_}}function Ju([p,m],g,_,x){let y=Math.PI/180,v=g,b=-x,S=_,M=Math.sin(p*y),T=Math.cos(p*y),w=Math.sin(m*y),E=Math.cos(m*y),A=6378137/Math.sqrt(1-0.0066943799901413165*M*M),P=A*T*E-w*v-M*E*b+T*E*S,D=A*T*w+E*v-M*w*b+T*w*S,R=A*0.9933056200098587*M+T*b+M*S,C=Math.hypot(P,D),I=Math.atan2(R,C*0.9933056200098587);for(let U=0;U<5;U++){let N=Math.sin(I);I=Math.atan2(R+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*N*N))*N,C)}return[I/y,Math.atan2(D,P)/y]}function Tr(p,m){return Math.floor((m+p)/8)}function To(p,m,g){return[Math.max(0,p*8-m),Math.min(g,(p+1)*8-m)]}var Vg={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},wo=(p)=>Vg[p]??p,Wg={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},Qi=(p)=>Wg[p]??wo(p),ju=new Set(["house"]),wr=(p,m)=>p.sorts?.[m]??p.kinds[m];function As(p,m){let g=[];if(!m.size)return g;for(let[_,x]of Object.entries(p))x.kinds.forEach((y,v)=>{if(m.has(wr(x,v)))g.push(`${_}#${v}`)});return g}function Al(p,m){let g=new Set,_=[...p];while(_.length){let x=_.pop();if(g.has(x))continue;g.add(x),_.push(...m.get(x)??[])}return g}function Qu(p,m,g){let _=0;for(let[x,y]of Object.entries(p))y.kinds.forEach((v,b)=>{if(wr(y,b)===m&&y.faces[b].length&&!g.has(`${x}#${b}`))_++});return _}function Rl(p){let m=new Map;for(let[g,_]of Object.entries(p)){_.parents.forEach((x,y)=>{if(x<0)return;let v=`${g}#${x}`;if(!m.has(v))m.set(v,[]);m.get(v).push(`${g}#${y}`)});for(let[x,y]of Object.entries(_.with??{})){let v=`${g}#${x}`;m.set(v,[...m.get(v)??[],...y])}}return m}function Cl(p){let m=new Map;for(let[g,_]of Object.entries(p))_.faces.forEach((x,y)=>{for(let[v,b,S]of x){if(!m.has(v))m.set(v,[]);m.get(v).push({from:b,end:b+S,id:`${g}#${y}`})}});for(let g of m.values())g.sort((_,x)=>_.from-x.from);return m}function td(p,m){let g=0,_=(p?.length??0)-1;while(g<=_){let x=g+_>>1,y=p[x];if(m<y.from)_=x-1;else if(m>=y.end)g=x+1;else return y.id}return null}function Pl(p,m,g){let _=Math.floor((m-Math.floor(m))*p.cols),x=Math.floor((g-Math.floor(g))*p.rows);return p.sprites[x*p.cols+_]??null}var Xg=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],qg=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function ed(p){return Xg.find(([m])=>m.test(p))?.[1]??"Unknown"}function nd(p){return qg.find(([m])=>m.test(p))?.[1]??p}var Yg=(p)=>`${p} ${p===1?"object":"objects"} deleted`,Zg=(p)=>`${p} height ${p===1?"change":"changes"}`,$g=(p)=>`${p} ${p===1?"object":"objects"} moved`;function id({state:p,edits:m,view:g,note:_,viewFailed:x,saveFailed:y,markedName:v,picked:b,sort:S,reopen:M,readAgain:T}){let w=(A)=>Sn(g,A),E=b?.all.length??0;return e("div",{id:"edit-notes",className:dn.notes,children:[p.save==="failed"&&t("p",{id:"edit-kept",className:dn.line,children:"Changes not kept: trying again"}),_&&t("p",{id:"edit-tool-note",className:dn.line,children:_}),x&&e("p",{id:"edit-view-failed",className:dn.line,children:["The view doesn't show the last change, it is kept all the same: ",x," ",t("button",{type:"button",onClick:w(M),children:"Load again"})]}),p.heights.length>0&&t("p",{id:"edit-heights",className:dn.line,children:Zg(p.heights.length)}),p.placed.length>0&&t("p",{id:"edit-placed",className:dn.line,children:$g(p.placed.length)}),p.removed.length>0&&t("p",{id:"edit-count",className:dn.line,children:Yg(p.removed.length)}),p.copies.length>0&&e("p",{id:"edit-copies",className:dn.line,children:[p.copies.length," ",p.copies.length===1?"copy":"copies"]}),(p.sorts.length>0||p.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:dn.line,children:["All deleted: ",[...p.sorts,...p.objectSorts.map(Qi)].join(", ")]}),v&&e("p",{id:"edit-marked",className:dn.line,children:["All ",v," marked: X or Delete deletes them all, Esc ends it."]}),E>1&&!v&&e("p",{id:"edit-picked",className:dn.line,children:[E," objects picked: X or Delete deletes them all."]}),b&&E<2&&!v&&e("p",{id:"edit-picked",className:dn.line,children:[b.kind,b.sprite&&` · ${b.sprite}`,S&&Qi(S)!==b.kind&&` · ${Qi(S)}`,!b.id&&(b.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),y&&t("p",{id:"edit-made",className:dn.line,children:y}),p.outdated>0&&e("p",{id:"edit-outdated",className:dn.line,children:[p.outdated," older ",p.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",p.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:w(()=>m.discardOutdated()),children:"Give up"})]}),p.save==="stuck"&&e("p",{id:"edit-stuck",className:dn.line,children:[p.error," ",t("button",{type:"button",onClick:w(T),children:"Read again"})]})]})}var sd=10,Kg=5,ad=1,ld=1e4,rd="#ff8a1f",od="#2f8bff",Jg=5;function cd({name:p,view:m,edits:g,enabled:_,speed:x,onNote:y}){let[v,b]=n(Kg),[S,M]=n(!1),T=Ou({view:m,edits:g,url:`/api/editor/${encodeURIComponent(p)}/brush`,enabled:_,onNote:y,colour:S?od:rd,turnedColour:S?rd:od,body:(w)=>({mm:Math.round(v*sd)*(S!==w?-1:1),speed:Math.round(x*sd)})});return{...T,height:v,lower:S,setHeight:b,setLower:M,wheel:(w,E)=>{if(w==="ctrl")T.setRadius((A)=>ji(A,E,_l,ml,gl));else if(w==="alt")b((A)=>ji(A,E,1,ad,ld));else if(w==="ctrlAlt")T.setSoft((A)=>ji(A,E,Jg,xl,yl))}}}function hd({elevation:p,view:m}){let{shift:g}=bo();return t(ti,{id:"edit-elevation-set",title:"Elevation",options:[e(a,{children:[t(pl,{label:"Raise",on:p.lower===g,hint:"It raises the ground (Shift: the other way)",onClick:Sn(m,()=>p.setLower(!1))}),t(pl,{label:"Lower",on:p.lower!==g,hint:"It lowers the ground (Shift: the other way)",onClick:Sn(m,()=>p.setLower(!0))})]}),t(Qe,{label:"Radius",unit:"m",hint:"How far it reaches, the ring on the ground (Ctrl + wheel)",min:ml,max:gl,step:_l,value:p.radius,onChange:p.setRadius}),t(Qe,{label:"Height",unit:"cm",hint:"How far one click moves the ground, at its middle (Alt + wheel)",min:ad,max:ld,value:p.height,onChange:p.setHeight}),t(Qe,{label:"Soft edge",unit:"%",hint:"How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge (Ctrl + Alt + wheel)",min:xl,max:yl,step:10,value:p.soft,onChange:p.setSoft})]})}var ud=5,dd=0.1,jg=1.05,Il=100,fd=100;function pd({name:p,view:m,edits:g,state:_,enabled:x,picked:y,onNote:v}){let b=x?(y?.all??[]).map((P)=>P.id).filter((P)=>m.canMove(P)):[],S=(P)=>g.placementOf(P)??Ts(P),M=b.length?S(y?.id&&b.includes(y.id)?y.id:b[0]):Ts(""),T=(P,D)=>{if(!b.length||!g.canEdit())return;g.inTurn(()=>{if(!g.canEdit())return;let R=b.map((C)=>P(S(C)));R.forEach((C,I)=>m.nudge([b[I]],qu(S(b[I]),C))),g.place(R,D&&`${D} ${b.join()}`)})},w=l((P)=>{let D=P.map((R)=>R.id);if(!g.canEdit())return m.rejectMove(D);if(!_.heights.length){g.place(P.map(({id:R,...C})=>ei(S(R),C))),v(null);return}g.inTurn(async()=>{let R=!1;try{if(!g.canEdit())return;g.saveNow();let C=await g.saved();if(C===null||!g.canEdit())return;let I=P.map(({id:N,...F})=>ei(S(N),F)),U=await r(`/api/editor/${encodeURIComponent(p)}/move`,{base:g.boundRevision(),revision:C,placed:I});if(U.error||!U.placed)v(U.error??"Could not move the objects");else if(g.canEdit())g.place(U.placed),R=!0,v(null)}finally{if(!R)m.rejectMove(D)}})});i(()=>(m.setMove(x,(P)=>w(P)),()=>m.setMove(!1,()=>{})),[m,x]),i(()=>{m.setPlaced(_.placed)},[m,_.placed]);let E=(P,D)=>T((R)=>ei(R,P),D),A=(P,D)=>T((R)=>ei({...R,[P]:D},{}));return{ids:b,shown:M,setTurn:(P)=>A("turn",P),setHeight:(P)=>A("y",P/Il),setSize:(P)=>A("scale",P/fd),reset:()=>{g.inTurn(()=>{if(b.length&&g.canEdit())g.place(b.map(Ts))})},wheel:(P,D)=>{if(!b.length)return v("Pick an object first: click it, Shift + click adds more");if(P==="shift")E({turn:D*ud},"turn");else if(P==="ctrl")E({y:D*dd},"height");else if(P==="alt")E({scale:jg**D},"size")}}}function md({move:p,view:m}){let g=!p.ids.length;return t(ti,{id:"edit-move-set",title:"Move",note:g?"Click an object to pick it, drag it to move it; Shift + click adds more.":void 0,options:[t(Qe,{label:"Turn",unit:"°",hint:"How far it is turned from how it was built, counter-clockwise (Shift + wheel)",min:-180,max:180,step:ud,value:p.shown.turn,onChange:p.setTurn}),t(Qe,{label:"Height",unit:"cm",hint:"How far it is raised from where it was built (Ctrl + wheel)",min:-1e4,max:1e4,step:dd*Il,value:Math.round(p.shown.y*Il),onChange:p.setHeight}),t(Qe,{label:"Size",unit:"%",hint:"Its size, against how it was built (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(p.shown.scale*fd),onChange:(_)=>p.setSize(Math.max(10,_))})],actions:t(Ji,{id:"edit-move-reset",label:"Reset",hint:"Back where and as it was built",onClick:Sn(m,p.reset)})})}var Ll=20;function gd(p,m,g){let _=0,x=1/0;return p.forEach(([y,,v],b)=>{let S=(y-m)**2+(v-g)**2;if(S<x)x=S,_=b}),_}function _d(p,m,g,_){return p.slice(1).some(([x,,y],v)=>{let[b,,S]=p[v],M=x-b,T=y-S,w=Math.max(0,Math.min(1,((g-b)*M+(_-S)*T)/(M*M+T*T||1)));return Math.hypot(g-b-w*M,_-S-w*T)<=m/2})}function xd(p,m,g,_){if(p.length<2)return[...p,[g,_]];if(!m?.length)return[...p.slice(0,-1),[g,_],p[p.length-1]];let x=gd(m,g,_);if(x===0)return[[g,_],...p];if(x===m.length-1)return[...p,[g,_]];let y=p.findIndex(([v,b])=>gd(m,v,b)>x);return y<0?[...p,[g,_]]:[...p.slice(0,y),[g,_],...p.slice(y)]}var ts={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function t_(p,m){for(let g=1;;g++){let _=`${p} (copy${g>1?` ${g}`:""})`;if(!m.includes(_))return _}}function yd({title:p,taken:m,canOverwrite:g,onOverwrite:_,onSaveNew:x,onCancel:y}){let[v,b]=n(p),S=v.trim(),M=S===p,T=!S?"Give it a name.":!M&&m.includes(S)?`Another track is called “${S}” already.`:null,w=M?t_(p,m):S;return i(()=>{let E=(A)=>{if(A.key==="Escape")y()};return document.addEventListener("keydown",E),()=>document.removeEventListener("keydown",E)},[y]),t("div",{id:"save-back",className:ts.back,onMouseDown:(E)=>{if(E.target===E.currentTarget)y()},children:e("form",{id:"save-dialog",className:ts.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(E)=>{if(E.preventDefault(),!T)x(w)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:ts.field,children:["Name",t("input",{id:"save-name",type:"text",value:v,maxLength:80,autoFocus:!0,onChange:(E)=>b(E.target.value)})]}),t("p",{id:"save-taken",className:ts.note,children:T??`Save as new track makes “${w}”. Whatever you delete can be brought back later.`}),e("div",{className:ts.buttons,children:[t("button",{type:"button",onClick:y,children:"Cancel"}),t("button",{type:"button",disabled:!M||!g,onClick:_,children:"Overwrite"}),t("button",{type:"submit",className:ts.primary,disabled:!!T,children:"Save as new track"})]})]})})}var Fn={tools:"tools_oZyV8A",fileButtons:"fileButtons_oZyV8A",group:"group_oZyV8A",title:"title_oZyV8A",row:"row_oZyV8A",split:"split_oZyV8A",on:"on_oZyV8A",picker:"picker_oZyV8A",key:"key_oZyV8A"};var Dl=(p)=>p.removed.length>0||p.sorts.length>0||p.objectSorts.length>0||p.heights.length>0||p.placed.length>0||p.copies.length>0,Nl=(p)=>!Dl(p)&&!p.recipe,n_=(p)=>new Date(p*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function vd({name:p,edits:m,state:g,view:_,onSaved:x}){let[y,v]=n(null),[b,S]=n({busy:!1,text:null}),{starting:M,play:T}=f(),w=Mo(g),E=Nl(g),A=m.canEdit()&&!b.busy&&!w&&!E,P=async(D=null)=>{v(null),S({busy:!0,text:null}),await m.settled(),m.hold(!0),m.saveNow();let R=await m.saved();if(R===null)return m.hold(!1),S({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let C=await r(`/api/editor/${encodeURIComponent(p)}/save`,{copy:D!==null,title:D,revision:R});if(m.hold(!1),C.error||!C.name)return S({busy:!1,text:`Not saved: ${C.error??"no answer"}`}),null;if(S({busy:!1,text:null}),D!==null)m.handOver(C.name);else m.markSaved();return x(C.name),C.name};return{asking:y,canSave:A,starting:M,busy:b.busy,failed:b.text,savedText:b.busy?"Saving …":w?`Saved ${n_(g.recipe.at)}`:E?"":"Not saved",canPlay:!M&&!b.busy&&g.save!=="loading"&&(w||E||A),saveAs:()=>v({play:!1}),chosen:async(D)=>{_.focus();let R=y?.play,C=await P(D);if(C&&R)T(C)},cancel:o(()=>{v(null),_.focus()},[_]),save:async()=>{await m.settled();let D=m.state();if(!m.canEdit()||b.busy||Mo(D)||Nl(D))return;if(D.recipe)P();else v({play:!1})},drive:async()=>{await m.settled();let D=m.state();if(Mo(D)||Nl(D))T(p);else if(!D.recipe)v({play:!0});else if(await P())T(p)}}}var Ol=[{tool:"select",group:"general",id:"edit-select",label:"Select",key:"V",hint:"Click an object to pick it, Shift + click adds more, X or Delete takes them out; a right click marks all of its sort (V)"},{tool:"camera",group:"general",id:"edit-camera",label:"Camera",key:"K",hint:"Go along the track by the wheel or riding by itself, back to the first view (K; Esc ends it)"},{tool:"road",group:"terrain",id:"edit-road",label:"Mark road",key:"R",hint:"Two clicks on the road mark a stretch of it, for Smooth; further clicks are pins (R; Esc ends it)"},{tool:"smooth",group:"terrain",id:"edit-smooth",label:"Smooth",key:"T",hint:"Even out a marked stretch of road: mark it first or after, it shows at once, Enter takes it (T; Esc ends it)"},{tool:"elevation",group:"terrain",id:"edit-elevation",label:"Elevation",key:"H",hint:"Raise or lower the ground: click, or hold and move (H; Esc ends it)"},{tool:"move",group:"objects",id:"edit-move",label:"Move",key:"M",hint:"Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},{tool:"copy",group:"objects",id:"edit-copy",label:"Copy",key:"C",hint:"Pick an object, then click to place copies repeatedly (C; Esc ends it)"},{tool:"delete",group:"objects",id:"edit-click-deletes",label:"Delete",key:"X",hint:"Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"}];function Ul({title:p,children:m}){return e("section",{className:Fn.group,children:[t("h3",{className:Fn.title,children:p}),m]})}function bd({state:p,edits:m,view:g,saving:_}){let x=(y)=>Sn(g,y);return e("div",{className:`${Fn.tools} ${Fn.fileButtons}`,children:[e("div",{className:Fn.row,children:[e("span",{className:Fn.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!_.canSave,onClick:x(()=>void _.save()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!m.canEdit()||_.busy,onClick:_.saveAs,children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!_.canPlay,title:"Save if needed, then drive it in Assetto Corsa",onClick:x(()=>void _.drive()),children:_.starting?"Starting …":"▶ Play"})]}),t("button",{type:"button",disabled:!Dl(p)||!m.canEdit()||_.busy,title:"Restore the track as built, taking back all Editor changes",onClick:x(()=>{if(confirm(`Discard all Editor changes and restore the track as built?

This includes previously saved edits. Save to apply it to Assetto Corsa; Undo brings the edits back.`))m.inTurn(()=>m.discard())}),children:"Discard all"})]})}function Sd({state:p,edits:m,view:g,tool:_,onTool:x}){let y=m.canEdit(),v=(T)=>Sn(g,T),b=(T)=>T==="select"||T==="camera",S=y||b(_)?_:"select",M=(T)=>t("div",{className:Fn.picker,children:Ol.filter((w)=>w.group===T).map((w)=>e("button",{type:"button",id:w.id,className:S===w.tool?Fn.on:"","aria-pressed":S===w.tool,disabled:!y&&!b(w.tool),title:w.hint,onClick:v(()=>x(w.tool)),children:[w.label,t("span",{className:Fn.key,"aria-hidden":"true",children:w.key})]},w.tool))});return e("div",{id:"edit-bar",className:Fn.tools,"data-kept":p.save,children:[e(Ul,{title:"General",children:[e("div",{id:"edit-history",className:Fn.row,children:[t("button",{type:"button",disabled:!p.canUndo||!y,title:"Ctrl+Z",onClick:v(()=>void m.inTurn(()=>m.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!p.canRedo||!y,title:"Ctrl+Shift+Z",onClick:v(()=>void m.inTurn(()=>m.redo())),children:"↷ Redo"})]}),M("general")]}),t(Ul,{title:"Terrain",children:M("terrain")}),t(Ul,{title:"Objects",children:M("objects")})]})}var i_=60,s_=1,Md=3,r_=60,o_=5;function Ed({name:p,view:m,edits:g,enabled:_,previewing:x,revision:y,onNote:v}){let[b,S]=n([]),[M,T]=n([]),[w,E]=n(null),[A,P]=n(null),[D,R]=n(0),[C,I]=n(null),[U,N]=n(50),F=C??D,z=(H="")=>`/api/editor/${encodeURIComponent(p)}/band${H}`,L=()=>{S([]),T([]),E(null),P(null),I(null)};i(()=>{if(b.length<2||b===M)return;let H=!1;return r(z("/way"),{base:g.boundRevision(),points:b}).then((W)=>{if(H)return;if(W.error||!W.line){v(W.error??"No road found"),S((K)=>M.length?M:K.slice(0,1));return}T(b),E(W.line),R(W.width??0),P(null),v(null)}),()=>{H=!0}},[b,g]),i(()=>{if(b.length!==1||!_){m.setMarking(null);return}let H=!1,W=!1,K=null,G=(Q,st)=>{H=!0,r(z("/way"),{base:g.boundRevision(),points:[b[0],[Q,st]]}).then((tt)=>{if(H=!1,W)return;if(P(tt.line??null),K){let[mt,rt]=K;K=null,G(mt,rt)}})};return m.setMarking((Q,st)=>{if(H)K=[Q,st];else G(Q,st)}),()=>{W=!0,m.setMarking(null)}},[m,b,_,g]),i(()=>{let H=b.length?[[b[0][0],m.heightOfGround(b[0][0],b[0][1]),b[0][1]]]:null;return m.drawBand(w??A??H,w||A?F||Md:0),()=>m.drawBand(null,0)},[m,b,w,A,F]),i(()=>(m.drawPins(_?b.map(([H,W])=>[H,m.heightOfGround(H,W),W]):[]),()=>m.drawPins([])),[m,b,_]);let O=l((H,W,K)=>{S(b.map((G,Q)=>Q===H?[W,K]:G)),v(null)}),V=l((H)=>{let W=b.filter((K,G)=>G!==H);if(S(W),W.length<2)T([]),E(null),P(null);v(null)});return i(()=>(m.setPinned((H,W,K)=>O(H,W,K),(H)=>V(H)),()=>m.setPinned(()=>{},()=>{})),[m]),i(()=>{if(!w||!x){m.takeBackPreview();return}let H=!1,W=(G)=>{if(H)return;m.takeBackPreview(),v(G)},K=setTimeout(()=>{fetch(z("/preview"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base:g.boundRevision(),points:M,width:F,strength:U/100})}).then(async(G)=>{if(H)return;if(G.ok){let Q=await G.arrayBuffer();if(!H)m.showPreview(Q)}else W(String((await G.json().catch(()=>null))?.error??G.status))}).catch(()=>W("No preview: the server does not answer"))},i_);return()=>{H=!0,clearTimeout(K)}},[m,w,x,F,U,y,g]),{points:b,line:w,width:F,strength:U,clear:L,apply:()=>{if(!w)return!1;if(b!==M)return v("The way is still being found: press Enter again in a moment"),!0;let H={base:g.boundRevision(),points:M,width:F,strength:U/100};return m.keepPreview(),L(),g.inTurn(async()=>{let K=await g.saved()===null?{error:"the changes before it could not be kept"}:await r(z(),H);if(K.error||!("height"in K)||!K.height||!g.canEdit())return m.dropPreview(),v(`Not changed: ${K.error??"this track can't be changed now"}`);g.addHeight(K.height),v(K.standing?`${K.standing} objects at the edge of it stayed where they are: their places lie outside.`:null)}),!0},click:(H,W)=>{if(b.length>=Ll)return v(`A band has at most ${Ll} points`);S(xd(b,w,H,W)),v(null)},setWidth:I,setStrength:N,wheel:(H,W)=>{if(H==="shift")N((K)=>Math.min(100,Math.max(0,K+W*o_)));else if(H==="ctrl")I(Math.min(r_,Math.max(Md,Math.round(F)+W*s_)))}}}var Fl={back:"back_vaYpAg",menu:"menu_vaYpAg"};var Td=230,wd=230;function Ad({at:p,mark:m,canDelete:g,onMove:_,onDuplicate:x,onSmooth:y,onMark:v,onDelete:b,onClose:S}){let M=p.x+Td>p.width?Math.max(0,p.x-Td):p.x,T=p.y+wd>p.height?Math.max(0,p.y-wd):p.y,w=(E)=>()=>{S(),E()};return t("div",{className:Fl.back,onPointerDown:(E)=>{if(E.target===E.currentTarget)S()},onContextMenu:(E)=>E.preventDefault(),children:e("div",{id:"view-menu",className:Fl.menu,role:"menu",style:{left:M,top:T},children:[y&&t("button",{type:"button",role:"menuitem",onClick:w(y),children:"Smooth"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Edit…"}),t("button",{type:"button",role:"menuitem",disabled:!_,onClick:w(()=>_?.()),children:"Move"}),t("button",{type:"button",role:"menuitem",disabled:!x,onClick:w(()=>x?.()),children:"Duplicate"}),m&&t("button",{type:"button",role:"menuitem",onClick:w(v),children:m}),t("button",{type:"button",role:"menuitem",disabled:!g,onClick:w(b),children:"Delete"})]})})}function Rd({name:p,title:m,taken:g,view:_,scene:x,fileHost:y,savedHost:v,toolsHost:b,notesHost:S,elevationSpeed:M,reopen:T,onSaved:w}){let[E]=n(()=>new El(p)),A=d(E.subscribe,E.state),[P,D]=n(null),[R,C]=n(null),[I,U]=n(null),[N,F]=n("select"),[z,L]=n(0),[O,V]=n(null),[Y,H]=n(null),W=s(()=>{}),K=o((gt)=>{W.current=gt},[]),G=E.canEdit(),Q=N==="elevation"&&G,st=N==="delete"&&G,tt=(N==="road"||N==="smooth")&&G,mt=N==="smooth"&&G,rt=N==="move"&&G,ht=vd({name:p,edits:E,state:A,view:_,onSaved:w}),xt=cd({name:p,view:_,edits:E,enabled:Q,speed:M,onNote:V}),At=Ed({name:p,view:_,edits:E,enabled:tt,previewing:mt,revision:A.keptRevision,onNote:V}),at=Gu({view:_,enabled:N==="camera",onNote:V}),pt=pd({name:p,view:_,edits:E,state:A,enabled:rt,picked:P,onNote:V}),Pt=l((gt)=>{if(tt&&gt?.left)return _.unpick();if(D(gt),U(null),st&&gt?.id&&gt.left)E.remove([{id:gt.id,position:gt.position}]),_.unpick()}),zt=l((gt)=>{if(!tt)return;if(gt?.road)At.click(gt.road[0],gt.road[1]);else if(!gt?.id)At.clear()});i(()=>(_.setClicked((gt)=>zt(gt)),()=>_.setClicked(()=>{})),[_]),i(()=>{_.setWheelTaken(At.line!==null&&mt||N==="camera"||N==="copy"||rt)},[_,At.line,mt,N,rt]),i(()=>{_.setAdding((N==="select"||N==="camera"||N==="move")&&G)},[_,N,G]),i(()=>{if(N!=="road"&&N!=="smooth")At.clear()},[N]),i(()=>{E.start();let gt=()=>E.saveNow(!0);return window.addEventListener("pagehide",gt),()=>{window.removeEventListener("pagehide",gt),E.stop()}},[E]),i(()=>(_.setPick((gt)=>Pt(gt)),_.setMenu(C),_.setIndexed((gt)=>E.bind(gt)),()=>{_.setPick(()=>{}),_.setMenu(()=>{}),_.setIndexed(()=>{})}),[_,E]),i(()=>{_.setRemoved(A.removed.map((gt)=>gt.id),A.sorts,A.objectSorts)},[_,A.removed,A.sorts,A.objectSorts]),i(()=>(_.setMarked(I),()=>_.setMarked(null)),[_,I]),i(()=>(E.setOnMeshes((gt)=>_.refreshMeshes(gt)),_.setViewFailed(H),()=>{E.setOnMeshes(()=>{}),_.setViewFailed(()=>{})}),[_,E]);let Ht=l((gt,ae)=>{if(N==="camera")at.wheel(gt,ae);else if(N==="move")pt.wheel(gt,ae);else if(N==="copy")W.current(gt,ae);else if(N==="smooth")At.wheel(gt,ae);else xt.wheel(gt,ae)});i(()=>(_.setToolWheel((gt,ae)=>Ht(gt,ae)),()=>_.setToolWheel(()=>{})),[_]);let Dt=async()=>{let gt=(ce)=>JSON.stringify([ce.heights.map((ze)=>ze.id),ce.placed,ce.copies]),ae=gt(A);if(await E.start(),E.viewBehind()||gt(E.state())!==ae)T()},Qt=P?.all??[],te=A.removed.map((gt)=>gt.id),Ut=P?.id&&P.sort&&!ju.has(P.sort)?P.sort:null,Zt=P?.id&&P.sprite?P.sprite:null,qt=!R?null:Ut?`Mark all ${Qi(Ut)} (${_.countOfListed(Ut,te,A.objectSorts)})`:Zt?`Mark all ${Zt} (loaded: ${_.countOf(Zt)})`:null,pe=()=>{if(!G)return;if(I){if(I.tree)E.removeSort(I.sort);else E.removeObjectSort(I.sort);U(null),_.unpick()}else if(Qt.length)E.remove(Qt),_.unpick()},me=(gt)=>F(N===gt?"select":gt),ye=o(()=>C(null),[]),Te=l((gt)=>{let ae=gt.ctrlKey||gt.metaKey,ce=gt.key.toLowerCase();if(ht.asking){if(ae&&ce==="s")gt.preventDefault();return}if(gt.key!=="Escape"&&gt.key!=="Enter"&&gt.target.tagName==="INPUT")return;let ze=ae?void 0:Ol.find((j)=>j.key.toLowerCase()===ce);if(gt.key==="Delete")pe();else if(gt.key==="Escape")C(null),U(null),_.cancelStroke(),_.unpick(),F("select"),_.focus();else if(gt.key==="Enter"&&mt&&At.apply())_.focus();else if((I||Qt.length)&&!ae&&ce==="x")pe();else if(ze)me(ze.tool);else if(gt.key==="Home")_.home();else if(ae&&ce==="z")E.inTurn(()=>gt.shiftKey?E.redo():E.undo());else if(ae&&ce==="y")E.inTurn(()=>E.redo());else if(ae&&ce==="s")ht.save();else return;gt.preventDefault()});i(()=>{let gt=[x.current,y,b,S],ae=(ce)=>Te(ce);for(let ce of gt)ce?.addEventListener("keydown",ae);return()=>{for(let ce of gt)ce?.removeEventListener("keydown",ae)}},[x,y,b,S]);let oe=N==="road"&&!!At.line&&!!P&&_d(At.line,At.width,P.position[0],P.position[2]);return e(a,{children:[y&&c(t(bd,{state:A,edits:E,view:_,saving:ht}),y),v&&c(ht.savedText,v),b&&c(t(Sd,{state:A,edits:E,view:_,tool:N,onTool:(gt)=>{me(gt),V(null)}}),b),S&&c(t(id,{state:A,edits:E,view:_,note:O,viewFailed:Y,saveFailed:ht.failed,picked:tt&&!P?.id?null:P,sort:Ut,markedName:I&&(I.tree?I.sort:Qi(I.sort)),reopen:T,readAgain:()=>void Dt()}),S),Q&&t(hd,{elevation:xt,view:_}),tt&&t(Uu,{band:At,smoothing:mt}),N==="camera"&&t(Vu,{camera:at,view:_}),rt&&t(md,{move:pt,view:_}),N==="copy"&&G&&t(Yu,{name:p,edits:E,view:_,picked:P,onWheel:K},z),R&&t(Ad,{at:R,mark:G?qt:null,canDelete:Qt.length>0&&G,onClose:ye,onMove:G&&P?.id&&_.canMove(P.id)?()=>{F("move"),V(null),_.focus()}:null,onDuplicate:G&&P?.id&&_.canMove(P.id)?()=>{L((gt)=>gt+1),F("copy"),V(null),_.focus()}:null,onSmooth:oe?()=>{F("smooth"),V(null),_.focus()}:null,onMark:()=>{U(Ut?{sort:Ut,tree:!1}:{sort:Zt,tree:!0}),_.focus()},onDelete:()=>{pe(),_.focus()}}),ht.asking&&t(yd,{title:m,taken:g,canOverwrite:ht.canSave,onOverwrite:()=>void ht.chosen(null),onSaveNew:(gt)=>void ht.chosen(gt),onCancel:ht.cancel})]})}var Cd={box:"box_myLiyw"};var Pn=(p,m=2)=>p.toFixed(m);function tn({label:p,children:m}){return e(a,{children:[t("dt",{children:p}),t("dd",{children:m})]})}function Pd({hovered:p}){if(!p)return null;let m=p.billboard;return e("div",{id:"hover-box",className:Cd.box,children:[e("h4",{children:[p.kind,p.sprite&&` · ${p.sprite}`]}),e("dl",{children:[p.id&&t(tn,{label:"ID",children:p.id}),m?.height!=null&&e(tn,{label:"Height",children:[Pn(m.height,1)," m"]}),m?.width!=null&&e(tn,{label:"Width",children:[Pn(m.width,1)," m"]}),m?.foot&&e(tn,{label:"Stands at",children:[Pn(m.foot[0],1),", ",Pn(m.foot[1],1)]}),t(tn,{label:"Mesh",children:p.object}),t(tn,{label:"Physics",children:p.physics}),t(tn,{label:"Material",children:p.material}),t(tn,{label:"Shader",children:p.shader}),e(tn,{label:"Texture",children:[p.texture??"none",p.textureBytes!==null&&` (${Math.ceil(p.textureBytes/1024)} KB)`]}),e(tn,{label:"Size",children:[p.vertices," vertices, ",p.triangles," triangles"]}),t(tn,{label:"Triangle",children:p.triangle}),p.uv&&e(tn,{label:"UV",children:[Pn(p.uv[0],3),", ",Pn(p.uv[1],3)]}),e(tn,{label:"Shown up to",children:[Math.round(p.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(tn,{label:"AC x, y, z",children:[Pn(p.at[0]),", ",Pn(p.at[1]),", ",Pn(p.at[2])]}),e(tn,{label:"Tile",children:[p.tile[0],", ",p.tile[1]]}),p.route&&e(tn,{label:"Route",children:[Math.round(p.route.metre)," m, ",Pn(p.route.off,1)," m off"]}),p.latLon&&e(tn,{label:"Lat, lon",children:[Pn(p.latLon[0],6),", ",Pn(p.latLon[1],6)]}),e(tn,{label:"Camera",children:[Pn(p.distance,1)," m away"]})]}),!p.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var os="187";var mf=0,dc=1,gf=2;var Fr=1,_f=2,Ys=3,vi=0,gn=1,kn=2,as=0,Br=1,fc=2,pc=3,mc=4,xf=5;var Zs=100,yf=101,vf=102,bf=103,Sf=104,Mf=200,Ef=201,Tf=202,wf=203,Af=204,Rf=205,Cf=206,Pf=207,If=208,Lf=209,Nf=210,Df=211,Uf=212,Of=213,Ff=214,Bf=0,kf=1,zf=2,gc=3,Hf=4,Gf=5,Vf=6,Wf=7,Xf=0,qf=1,Yf=2,si=0,_c=1,xc=2,yc=3,vc=4,bc=5,Sc=6,Mc=7;var kr=301,$s=302,na=303,ia=304,sa=1000,ra=1001,Zf=1002,Fi=1003,$f=1004;var zr=1005;var Rn=1006,oa=1007;var Kn=1008;var Jn=1009,Kf=1010,Jf=1011,Hr=1012,Ec=1013,Bi=1014,bi=1015,ri=1016,Tc=1017,wc=1018,ls=1020,jf=35902,Qf=35899,tp=1021,ep=1022,zn=1023,Ks=1026,ki=1027,np=1028,Ac=1029,cs=1030,Rc=1031;var Cc=1033,Js=33776,aa=33777,js=33778,Qs=33779,Pc=35840,Ic=35841,Lc=35842,Nc=35843,Gr=36196,Dc=37492,Uc=37496,Oc=37488,Fc=37489,la=37490,Bc=37491,kc=37808,zc=37809,Hc=37810,Gc=37811,Vc=37812,Wc=37813,Xc=37814,qc=37815,Yc=37816,Zc=37817,$c=37818,Kc=37819,Jc=37820,jc=37821,Qc=36492,Vr=36494,Wr=36495,th=36283,eh=36284,ca=36285,nh=36286;var ih=0,ip=1,hs="",ha="srgb",sh="srgb-linear",rh="linear",Ie="srgb";var sp=512,rp=513,op=514,oh=515,ap=516,lp=517,ah=518,lh=519;var ch="300 es",hh=2000;function c_(p){for(let m=p.length-1;m>=0;--m)if(p[m]>=65535)return!0;return!1}function h_(p){return ArrayBuffer.isView(p)&&!(p instanceof DataView)}function Ur(p){return document.createElementNS("http://www.w3.org/1999/xhtml",p)}function cp(){let p=Ur("canvas");return p.style.display="block",p}var Id={},Xs=null;function Or(...p){let m="THREE."+p.shift();if(Xs)Xs("log",m,...p);else console.log(m,...p)}function hp(p){let m=p[0];if(typeof m==="string"&&m.startsWith("TSL:")){let g=p[1];if(g&&g.isStackTrace)p[0]+=" "+g.getLocation();else p[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return p}function Xt(...p){p=hp(p);let m="THREE."+p.shift();if(Xs)Xs("warn",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.warn(g.getError(m));else console.warn(m,...p)}}function $t(...p){p=hp(p);let m="THREE."+p.shift();if(Xs)Xs("error",m,...p);else{let g=p[0];if(g&&g.isStackTrace)console.error(g.getError(m));else console.error(m,...p)}}function Lr(...p){let m=p.join(" ");if(m in Id)return;Id[m]=!0,Xt(...p)}function up(p,m,g){return new Promise(function(_,x){function y(){switch(p.clientWaitSync(m,p.SYNC_FLUSH_COMMANDS_BIT,0)){case p.WAIT_FAILED:x();break;case p.TIMEOUT_EXPIRED:setTimeout(y,g);break;default:_()}}setTimeout(y,g)})}var dp={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class Si{addEventListener(p,m){if(this._listeners===void 0)this._listeners={};let g=this._listeners;if(g[p]===void 0)g[p]=[];if(g[p].indexOf(m)===-1)g[p].push(m)}hasEventListener(p,m){let g=this._listeners;if(g===void 0)return!1;return g[p]!==void 0&&g[p].indexOf(m)!==-1}removeEventListener(p,m){let g=this._listeners;if(g===void 0)return;let _=g[p];if(_!==void 0){let x=_.indexOf(m);if(x!==-1)_.splice(x,1)}}dispatchEvent(p){let m=this._listeners;if(m===void 0)return;let g=m[p.type];if(g!==void 0){p.target=this;let _=g.slice(0);for(let x=0,y=_.length;x<y;x++)_[x].call(this,p);p.target=null}}}var fn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Ld=1234567,Nr=Math.PI/180,qs=180/Math.PI;function zi(){let p=Math.random()*4294967295|0,m=Math.random()*4294967295|0,g=Math.random()*4294967295|0,_=Math.random()*4294967295|0;return(fn[p&255]+fn[p>>8&255]+fn[p>>16&255]+fn[p>>24&255]+"-"+fn[m&255]+fn[m>>8&255]+"-"+fn[m>>16&15|64]+fn[m>>24&255]+"-"+fn[g&63|128]+fn[g>>8&255]+"-"+fn[g>>16&255]+fn[g>>24&255]+fn[_&255]+fn[_>>8&255]+fn[_>>16&255]+fn[_>>24&255]).toLowerCase()}function ie(p,m,g){return Math.max(m,Math.min(g,p))}function uh(p,m){return(p%m+m)%m}function u_(p,m,g,_,x){return _+(p-m)*(x-_)/(g-m)}function d_(p,m,g){if(p!==m)return(g-p)/(m-p);else return 0}function Dr(p,m,g){return(1-g)*p+g*m}function f_(p,m,g,_){return Dr(p,m,1-Math.exp(-g*_))}function p_(p,m=1){return m-Math.abs(uh(p,m*2)-m)}function m_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*(3-2*p)}function g_(p,m,g){if(p<=m)return 0;if(p>=g)return 1;return p=(p-m)/(g-m),p*p*p*(p*(p*6-15)+10)}function __(p,m){return p+Math.floor(Math.random()*(m-p+1))}function x_(p,m){return p+Math.random()*(m-p)}function y_(p){return p*(0.5-Math.random())}function v_(p){if(p!==void 0)Ld=p;let m=Ld+=1831565813;return m=Math.imul(m^m>>>15,m|1),m^=m+Math.imul(m^m>>>7,m|61),((m^m>>>14)>>>0)/4294967296}function b_(p){return p*Nr}function S_(p){return p*qs}function M_(p){return p>0&&Number.isInteger(p)&&2**Math.round(Math.log2(p))===p}function E_(p){return Math.pow(2,Math.ceil(Math.log(p)/Math.LN2))}function dh(p){return Math.pow(2,Math.floor(Math.log(p)/Math.LN2))}function T_(p,m,g,_,x){let{cos:y,sin:v}=Math,b=y(g/2),S=v(g/2),M=y((m+_)/2),T=v((m+_)/2),w=y((m-_)/2),E=v((m-_)/2),A=y((_-m)/2),P=v((_-m)/2);switch(x){case"XYX":p.set(b*T,S*w,S*E,b*M);break;case"YZY":p.set(S*E,b*T,S*w,b*M);break;case"ZXZ":p.set(S*w,S*E,b*T,b*M);break;case"XZX":p.set(b*T,S*P,S*A,b*M);break;case"YXY":p.set(S*A,b*T,S*P,b*M);break;case"ZYZ":p.set(S*P,S*A,b*T,b*M);break;default:Xt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+x)}}function ua(p){switch(p.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function fh(p,m){if(m.constructor===Float32Array)return p;let g=ua(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(p/g,-1)}function ph(p,m){if(m.constructor===Float32Array)return p;let g=ua(m);if(g===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(p*g)}var Mi={DEG2RAD:Nr,RAD2DEG:qs,generateUUID:zi,clamp:ie,euclideanModulo:uh,mapLinear:u_,inverseLerp:d_,lerp:Dr,damp:f_,pingpong:p_,smoothstep:m_,smootherstep:g_,randInt:__,randFloat:x_,randFloatSpread:y_,seededRandom:v_,degToRad:b_,radToDeg:S_,isPowerOfTwo:M_,ceilPowerOfTwo:E_,floorPowerOfTwo:dh,setQuaternionFromProperEuler:T_,normalize:ph,denormalize:fh};class Kt{static{this.prototype.isVector2=!0}constructor(p=0,m=0){this.x=p,this.y=m}get width(){return this.x}set width(p){this.x=p}get height(){return this.y}set height(p){this.y=p}set(p,m){return this.x=p,this.y=m,this}setScalar(p){return this.x=p,this.y=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;default:throw Error("THREE.Vector2: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y)}copy(p){return this.x=p.x,this.y=p.y,this}add(p){return this.x+=p.x,this.y+=p.y,this}addScalar(p){return this.x+=p,this.y+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this}subScalar(p){return this.x-=p,this.y-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this}multiply(p){return this.x*=p.x,this.y*=p.y,this}multiplyScalar(p){return this.x*=p,this.y*=p,this}divide(p){return this.x/=p.x,this.y/=p.y,this}divideScalar(p){return this.multiplyScalar(1/p)}applyMatrix3(p){let m=this.x,g=this.y,_=p.elements;return this.x=_[0]*m+_[3]*g+_[6],this.y=_[1]*m+_[4]*g+_[7],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this}clamp(p,m){return this.x=ie(this.x,p.x,m.x),this.y=ie(this.y,p.y,m.y),this}clampScalar(p,m){return this.x=ie(this.x,p,m),this.y=ie(this.y,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ie(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(p){return this.x*p.x+this.y*p.y}cross(p){return this.x*p.y-this.y*p.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(ie(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y;return m*m+g*g}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this}equals(p){return p.x===this.x&&p.y===this.y}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this}rotateAround(p,m){let g=Math.cos(m),_=Math.sin(m),x=this.x-p.x,y=this.y-p.y;return this.x=x*g-y*_+p.x,this.y=x*_+y*g+p.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ei{constructor(p=0,m=0,g=0,_=1){this.isQuaternion=!0,this._x=p,this._y=m,this._z=g,this._w=_}static slerpFlat(p,m,g,_,x,y,v){let b=g[_+0],S=g[_+1],M=g[_+2],T=g[_+3],w=x[y+0],E=x[y+1],A=x[y+2],P=x[y+3];if(T!==P||b!==w||S!==E||M!==A){let D=b*w+S*E+M*A+T*P;if(D<0)w=-w,E=-E,A=-A,P=-P,D=-D;let R=1-v;if(D<0.9995){let C=Math.acos(D),I=Math.sin(C);R=Math.sin(R*C)/I,v=Math.sin(v*C)/I,b=b*R+w*v,S=S*R+E*v,M=M*R+A*v,T=T*R+P*v}else{b=b*R+w*v,S=S*R+E*v,M=M*R+A*v,T=T*R+P*v;let C=1/Math.sqrt(b*b+S*S+M*M+T*T);b*=C,S*=C,M*=C,T*=C}}p[m]=b,p[m+1]=S,p[m+2]=M,p[m+3]=T}static multiplyQuaternionsFlat(p,m,g,_,x,y){let v=g[_],b=g[_+1],S=g[_+2],M=g[_+3],T=x[y],w=x[y+1],E=x[y+2],A=x[y+3];return p[m]=v*A+M*T+b*E-S*w,p[m+1]=b*A+M*w+S*T-v*E,p[m+2]=S*A+M*E+v*w-b*T,p[m+3]=M*A-v*T-b*w-S*E,p}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get w(){return this._w}set w(p){this._w=p,this._onChangeCallback()}set(p,m,g,_){return this._x=p,this._y=m,this._z=g,this._w=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(p){return this._x=p.x,this._y=p.y,this._z=p.z,this._w=p.w,this._onChangeCallback(),this}setFromEuler(p,m=!0){let{_x:g,_y:_,_z:x,_order:y}=p,{cos:v,sin:b}=Math,S=v(g/2),M=v(_/2),T=v(x/2),w=b(g/2),E=b(_/2),A=b(x/2);switch(y){case"XYZ":this._x=w*M*T+S*E*A,this._y=S*E*T-w*M*A,this._z=S*M*A+w*E*T,this._w=S*M*T-w*E*A;break;case"YXZ":this._x=w*M*T+S*E*A,this._y=S*E*T-w*M*A,this._z=S*M*A-w*E*T,this._w=S*M*T+w*E*A;break;case"ZXY":this._x=w*M*T-S*E*A,this._y=S*E*T+w*M*A,this._z=S*M*A+w*E*T,this._w=S*M*T-w*E*A;break;case"ZYX":this._x=w*M*T-S*E*A,this._y=S*E*T+w*M*A,this._z=S*M*A-w*E*T,this._w=S*M*T+w*E*A;break;case"YZX":this._x=w*M*T+S*E*A,this._y=S*E*T+w*M*A,this._z=S*M*A-w*E*T,this._w=S*M*T-w*E*A;break;case"XZY":this._x=w*M*T-S*E*A,this._y=S*E*T-w*M*A,this._z=S*M*A+w*E*T,this._w=S*M*T+w*E*A;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+y)}if(m===!0)this._onChangeCallback();return this}setFromAxisAngle(p,m){let g=m/2,_=Math.sin(g);return this._x=p.x*_,this._y=p.y*_,this._z=p.z*_,this._w=Math.cos(g),this._onChangeCallback(),this}setFromRotationMatrix(p){let m=p.elements,g=m[0],_=m[4],x=m[8],y=m[1],v=m[5],b=m[9],S=m[2],M=m[6],T=m[10],w=g+v+T;if(w>0){let E=0.5/Math.sqrt(w+1);this._w=0.25/E,this._x=(M-b)*E,this._y=(x-S)*E,this._z=(y-_)*E}else if(g>v&&g>T){let E=2*Math.sqrt(1+g-v-T);this._w=(M-b)/E,this._x=0.25*E,this._y=(_+y)/E,this._z=(x+S)/E}else if(v>T){let E=2*Math.sqrt(1+v-g-T);this._w=(x-S)/E,this._x=(_+y)/E,this._y=0.25*E,this._z=(b+M)/E}else{let E=2*Math.sqrt(1+T-g-v);this._w=(y-_)/E,this._x=(x+S)/E,this._y=(b+M)/E,this._z=0.25*E}return this._onChangeCallback(),this}setFromUnitVectors(p,m){let g=p.dot(m)+1;if(g<0.00000001)if(g=0,Math.abs(p.x)>Math.abs(p.z))this._x=-p.y,this._y=p.x,this._z=0,this._w=g;else this._x=0,this._y=-p.z,this._z=p.y,this._w=g;else this._x=p.y*m.z-p.z*m.y,this._y=p.z*m.x-p.x*m.z,this._z=p.x*m.y-p.y*m.x,this._w=g;return this.normalize()}angleTo(p){return 2*Math.acos(Math.abs(ie(this.dot(p),-1,1)))}rotateTowards(p,m){let g=this.angleTo(p);if(g===0)return this;let _=Math.min(1,m/g);return this.slerp(p,_),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(p){return this._x*p._x+this._y*p._y+this._z*p._z+this._w*p._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let p=this.length();if(p===0)this._x=0,this._y=0,this._z=0,this._w=1;else p=1/p,this._x=this._x*p,this._y=this._y*p,this._z=this._z*p,this._w=this._w*p;return this._onChangeCallback(),this}multiply(p){return this.multiplyQuaternions(this,p)}premultiply(p){return this.multiplyQuaternions(p,this)}multiplyQuaternions(p,m){let{_x:g,_y:_,_z:x,_w:y}=p,{_x:v,_y:b,_z:S,_w:M}=m;return this._x=g*M+y*v+_*S-x*b,this._y=_*M+y*b+x*v-g*S,this._z=x*M+y*S+g*b-_*v,this._w=y*M-g*v-_*b-x*S,this._onChangeCallback(),this}slerp(p,m){let{_x:g,_y:_,_z:x,_w:y}=p,v=this.dot(p);if(v<0)g=-g,_=-_,x=-x,y=-y,v=-v;let b=1-m;if(v<0.9995){let S=Math.acos(v),M=Math.sin(S);b=Math.sin(b*S)/M,m=Math.sin(m*S)/M,this._x=this._x*b+g*m,this._y=this._y*b+_*m,this._z=this._z*b+x*m,this._w=this._w*b+y*m,this._onChangeCallback()}else this._x=this._x*b+g*m,this._y=this._y*b+_*m,this._z=this._z*b+x*m,this._w=this._w*b+y*m,this.normalize();return this}slerpQuaternions(p,m,g){return this.copy(p).slerp(m,g)}random(){let p=2*Math.PI*Math.random(),m=2*Math.PI*Math.random(),g=Math.random(),_=Math.sqrt(1-g),x=Math.sqrt(g);return this.set(_*Math.sin(p),_*Math.cos(p),x*Math.sin(m),x*Math.cos(m))}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._w===this._w}fromArray(p,m=0){return this._x=p[m],this._y=p[m+1],this._z=p[m+2],this._w=p[m+3],this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._w,p}fromBufferAttribute(p,m){return this._x=p.getX(m),this._y=p.getY(m),this._z=p.getZ(m),this._w=p.getW(m),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class q{static{this.prototype.isVector3=!0}constructor(p=0,m=0,g=0){this.x=p,this.y=m,this.z=g}set(p,m,g){if(g===void 0)g=this.z;return this.x=p,this.y=m,this.z=g,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;default:throw Error("THREE.Vector3: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this}multiplyVectors(p,m){return this.x=p.x*m.x,this.y=p.y*m.y,this.z=p.z*m.z,this}applyEuler(p){return this.applyQuaternion(Nd.setFromEuler(p))}applyAxisAngle(p,m){return this.applyQuaternion(Nd.setFromAxisAngle(p,m))}applyMatrix3(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[3]*g+x[6]*_,this.y=x[1]*m+x[4]*g+x[7]*_,this.z=x[2]*m+x[5]*g+x[8]*_,this}applyNormalMatrix(p){return this.applyMatrix3(p).normalize()}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=p.elements,y=1/(x[3]*m+x[7]*g+x[11]*_+x[15]);return this.x=(x[0]*m+x[4]*g+x[8]*_+x[12])*y,this.y=(x[1]*m+x[5]*g+x[9]*_+x[13])*y,this.z=(x[2]*m+x[6]*g+x[10]*_+x[14])*y,this}applyQuaternion(p){let m=this.x,g=this.y,_=this.z,{x,y,z:v,w:b}=p,S=2*(y*_-v*g),M=2*(v*m-x*_),T=2*(x*g-y*m);return this.x=m+b*S+y*T-v*M,this.y=g+b*M+v*S-x*T,this.z=_+b*T+x*M-y*S,this}project(p){return this.applyMatrix4(p.matrixWorldInverse).applyMatrix4(p.projectionMatrix)}unproject(p){return this.applyMatrix4(p.projectionMatrixInverse).applyMatrix4(p.matrixWorld)}transformDirection(p){let m=this.x,g=this.y,_=this.z,x=p.elements;return this.x=x[0]*m+x[4]*g+x[8]*_,this.y=x[1]*m+x[5]*g+x[9]*_,this.z=x[2]*m+x[6]*g+x[10]*_,this.normalize()}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this}divideScalar(p){return this.multiplyScalar(1/p)}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this}clamp(p,m){return this.x=ie(this.x,p.x,m.x),this.y=ie(this.y,p.y,m.y),this.z=ie(this.z,p.z,m.z),this}clampScalar(p,m){return this.x=ie(this.x,p,m),this.y=ie(this.y,p,m),this.z=ie(this.z,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ie(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this}cross(p){return this.crossVectors(this,p)}crossVectors(p,m){let{x:g,y:_,z:x}=p,{x:y,y:v,z:b}=m;return this.x=_*b-x*v,this.y=x*y-g*b,this.z=g*v-_*y,this}projectOnVector(p){let m=p.lengthSq();if(m===0)return this.set(0,0,0);let g=p.dot(this)/m;return this.copy(p).multiplyScalar(g)}projectOnPlane(p){return Bl.copy(this).projectOnVector(p),this.sub(Bl)}reflect(p){return this.sub(Bl.copy(p).multiplyScalar(2*this.dot(p)))}angleTo(p){let m=Math.sqrt(this.lengthSq()*p.lengthSq());if(m===0)return Math.PI/2;let g=this.dot(p)/m;return Math.acos(ie(g,-1,1))}distanceTo(p){return Math.sqrt(this.distanceToSquared(p))}distanceToSquared(p){let m=this.x-p.x,g=this.y-p.y,_=this.z-p.z;return m*m+g*g+_*_}manhattanDistanceTo(p){return Math.abs(this.x-p.x)+Math.abs(this.y-p.y)+Math.abs(this.z-p.z)}setFromSpherical(p){return this.setFromSphericalCoords(p.radius,p.phi,p.theta)}setFromSphericalCoords(p,m,g){let _=Math.sin(m)*p;return this.x=_*Math.sin(g),this.y=Math.cos(m)*p,this.z=_*Math.cos(g),this}setFromCylindrical(p){return this.setFromCylindricalCoords(p.radius,p.theta,p.y)}setFromCylindricalCoords(p,m,g){return this.x=p*Math.sin(m),this.y=g,this.z=p*Math.cos(m),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this}setFromMatrixScale(p){let m=this.setFromMatrixColumn(p,0).length(),g=this.setFromMatrixColumn(p,1).length(),_=this.setFromMatrixColumn(p,2).length();return this.x=m,this.y=g,this.z=_,this}setFromMatrixColumn(p,m){return this.fromArray(p.elements,m*4)}setFromMatrix3Column(p,m){return this.fromArray(p.elements,m*3)}setFromEuler(p){return this.x=p._x,this.y=p._y,this.z=p._z,this}setFromColor(p){return this.x=p.r,this.y=p.g,this.z=p.b,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let p=Math.random()*Math.PI*2,m=Math.random()*2-1,g=Math.sqrt(1-m*m);return this.x=g*Math.cos(p),this.y=m,this.z=g*Math.sin(p),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Bl=new q,Nd=new Ei;class jt{static{this.prototype.isMatrix3=!0}constructor(p,m,g,_,x,y,v,b,S){if(this.elements=[1,0,0,0,1,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,y,v,b,S)}set(p,m,g,_,x,y,v,b,S){let M=this.elements;return M[0]=p,M[1]=_,M[2]=v,M[3]=m,M[4]=x,M[5]=b,M[6]=g,M[7]=y,M[8]=S,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],this}extractBasis(p,m,g){return p.setFromMatrix3Column(this,0),m.setFromMatrix3Column(this,1),g.setFromMatrix3Column(this,2),this}setFromMatrix4(p){let m=p.elements;return this.set(m[0],m[4],m[8],m[1],m[5],m[9],m[2],m[6],m[10]),this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,y=g[0],v=g[3],b=g[6],S=g[1],M=g[4],T=g[7],w=g[2],E=g[5],A=g[8],P=_[0],D=_[3],R=_[6],C=_[1],I=_[4],U=_[7],N=_[2],F=_[5],z=_[8];return x[0]=y*P+v*C+b*N,x[3]=y*D+v*I+b*F,x[6]=y*R+v*U+b*z,x[1]=S*P+M*C+T*N,x[4]=S*D+M*I+T*F,x[7]=S*R+M*U+T*z,x[2]=w*P+E*C+A*N,x[5]=w*D+E*I+A*F,x[8]=w*R+E*U+A*z,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[3]*=p,m[6]*=p,m[1]*=p,m[4]*=p,m[7]*=p,m[2]*=p,m[5]*=p,m[8]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8];return m*y*M-m*v*S-g*x*M+g*v*b+_*x*S-_*y*b}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8],T=M*y-v*S,w=v*b-M*x,E=S*x-y*b,A=m*T+g*w+_*E;if(A===0)return this.set(0,0,0,0,0,0,0,0,0);let P=1/A;return p[0]=T*P,p[1]=(_*S-M*g)*P,p[2]=(v*g-_*y)*P,p[3]=w*P,p[4]=(M*m-_*b)*P,p[5]=(_*x-v*m)*P,p[6]=E*P,p[7]=(g*b-S*m)*P,p[8]=(y*m-g*x)*P,this}transpose(){let p,m=this.elements;return p=m[1],m[1]=m[3],m[3]=p,p=m[2],m[2]=m[6],m[6]=p,p=m[5],m[5]=m[7],m[7]=p,this}getNormalMatrix(p){return this.setFromMatrix4(p).invert().transpose()}transposeIntoArray(p){let m=this.elements;return p[0]=m[0],p[1]=m[3],p[2]=m[6],p[3]=m[1],p[4]=m[4],p[5]=m[7],p[6]=m[2],p[7]=m[5],p[8]=m[8],this}setUvTransform(p,m,g,_,x,y,v){let b=Math.cos(x),S=Math.sin(x);return this.set(g*b,g*S,-g*(b*y+S*v)+y+p,-_*S,_*b,-_*(-S*y+b*v)+v+m,0,0,1),this}scale(p,m){return Lr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(kl.makeScale(p,m)),this}rotate(p){return Lr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(kl.makeRotation(-p)),this}translate(p,m){return Lr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(kl.makeTranslation(p,m)),this}makeTranslation(p,m){if(p.isVector2)this.set(1,0,p.x,0,1,p.y,0,0,1);else this.set(1,0,p,0,1,m,0,0,1);return this}makeRotation(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,g,m,0,0,0,1),this}makeScale(p,m){return this.set(p,0,0,0,m,0,0,0,1),this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<9;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<9;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p}clone(){return new this.constructor().fromArray(this.elements)}}var kl=new jt,Dd=new jt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Ud=new jt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function w_(){let p={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(x,y,v){if(this.enabled===!1||y===v||!y||!v)return x;if(this.spaces[y].transfer==="srgb")x.r=xi(x.r),x.g=xi(x.g),x.b=xi(x.b);if(this.spaces[y].primaries!==this.spaces[v].primaries)x.applyMatrix3(this.spaces[y].toXYZ),x.applyMatrix3(this.spaces[v].fromXYZ);if(this.spaces[v].transfer==="srgb")x.r=Vs(x.r),x.g=Vs(x.g),x.b=Vs(x.b);return x},workingToColorSpace:function(x,y){return this.convert(x,this.workingColorSpace,y)},colorSpaceToWorking:function(x,y){return this.convert(x,y,this.workingColorSpace)},getPrimaries:function(x){return this.spaces[x].primaries},getTransfer:function(x){if(x==="")return"linear";return this.spaces[x].transfer},getToneMappingMode:function(x){return this.spaces[x].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(x,y=this.workingColorSpace){return x.fromArray(this.spaces[y].luminanceCoefficients)},define:function(x){Object.assign(this.spaces,x)},_getMatrix:function(x,y,v){return x.copy(this.spaces[v].fromXYZ).multiply(this.spaces[y].toXYZ)},_getDrawingBufferColorSpace:function(x){return this.spaces[x].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(x=this.workingColorSpace){return this.spaces[x].workingColorSpaceConfig.unpackColorSpace}},m=[0.64,0.33,0.3,0.6,0.15,0.06],g=[0.2126,0.7152,0.0722],_=[0.3127,0.329];return p.define({["srgb-linear"]:{primaries:m,whitePoint:_,transfer:"linear",toXYZ:Dd,fromXYZ:Ud,luminanceCoefficients:g,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:m,whitePoint:_,transfer:"srgb",toXYZ:Dd,fromXYZ:Ud,luminanceCoefficients:g,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),p}var he=w_();function xi(p){return p<0.04045?p*0.0773993808:Math.pow(p*0.9478672986+0.0521327014,2.4)}function Vs(p){return p<0.0031308?p*12.92:1.055*Math.pow(p,0.41666)-0.055}var Rs;class mh{static getDataURL(p,m="image/png"){if(/^data:/i.test(p.src))return p.src;if(typeof HTMLCanvasElement>"u")return p.src;let g;if(p instanceof HTMLCanvasElement)g=p;else{if(Rs===void 0)Rs=Ur("canvas");Rs.width=p.width,Rs.height=p.height;let _=Rs.getContext("2d");if(p instanceof ImageData)_.putImageData(p,0,0);else _.drawImage(p,0,0,p.width,p.height);g=Rs}return g.toDataURL(m)}static sRGBToLinear(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap){let m=Ur("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d");g.drawImage(p,0,0,p.width,p.height);let _=g.getImageData(0,0,p.width,p.height),x=_.data;for(let y=0;y<x.length;y++)x[y]=xi(x[y]/255)*255;return g.putImageData(_,0,0),m}else if(p.data){let m=p.data.slice(0);for(let g=0;g<m.length;g++)if(m instanceof Uint8Array||m instanceof Uint8ClampedArray)m[g]=Math.floor(xi(m[g]/255)*255);else m[g]=xi(m[g]);return{data:m,width:p.width,height:p.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),p}}var A_=0;class Xr{constructor(p=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:A_++}),this.uuid=zi(),this.data=p,this.dataReady=!0,this.version=0}getSize(p){let m=this.data;if(typeof HTMLVideoElement<"u"&&m instanceof HTMLVideoElement)p.set(m.videoWidth,m.videoHeight,0);else if(typeof VideoFrame<"u"&&m instanceof VideoFrame)p.set(m.displayWidth,m.displayHeight,0);else if(m!==null)p.set(m.width||0,m.height||0,m.depth||0);else p.set(0,0,0);return p}set needsUpdate(p){if(p===!0)this.version++}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.images[this.uuid]!==void 0)return p.images[this.uuid];let g={uuid:this.uuid,url:""},_=this.data;if(_!==null){let x;if(Array.isArray(_)){x=[];for(let y=0,v=_.length;y<v;y++)if(_[y].isDataTexture)x.push(zl(_[y].image));else x.push(zl(_[y]))}else x=zl(_);g.url=x}if(!m)p.images[this.uuid]=g;return g}}function zl(p){if(typeof HTMLImageElement<"u"&&p instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&p instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&p instanceof ImageBitmap)return mh.getDataURL(p);else if(p.data)return{data:Array.from(p.data),width:p.width,height:p.height,type:p.data.constructor.name};else return Xt("Texture: Unable to serialize Texture."),{}}var R_=0,Hl=new q;class We extends Si{constructor(p=We.DEFAULT_IMAGE,m=We.DEFAULT_MAPPING,g=1001,_=1001,x=1006,y=1008,v=1023,b=1009,S=We.DEFAULT_ANISOTROPY,M=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:R_++}),this.uuid=zi(),this.name="",this.source=new Xr(p),this.mipmaps=[],this.mapping=m,this.channel=0,this.wrapS=g,this.wrapT=_,this.magFilter=x,this.minFilter=y,this.anisotropy=S,this.format=v,this.internalFormat=null,this.type=b,this.offset=new Kt(0,0),this.repeat=new Kt(1,1),this.center=new Kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new jt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=M,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=p&&p.depth&&p.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Hl).x}get height(){return this.source.getSize(Hl).y}get depth(){return this.source.getSize(Hl).z}get image(){return this.source.data}set image(p){this.source.data=p}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(p){return this.name=p.name,this.source=p.source,this.mipmaps=p.mipmaps.slice(0),this.mapping=p.mapping,this.channel=p.channel,this.wrapS=p.wrapS,this.wrapT=p.wrapT,this.magFilter=p.magFilter,this.minFilter=p.minFilter,this.anisotropy=p.anisotropy,this.format=p.format,this.internalFormat=p.internalFormat,this.type=p.type,this.normalized=p.normalized,this.offset.copy(p.offset),this.repeat.copy(p.repeat),this.center.copy(p.center),this.rotation=p.rotation,this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrix.copy(p.matrix),this.generateMipmaps=p.generateMipmaps,this.mipmapsAutoUpdate=p.mipmapsAutoUpdate,this.premultiplyAlpha=p.premultiplyAlpha,this.flipY=p.flipY,this.unpackAlignment=p.unpackAlignment,this.colorSpace=p.colorSpace,this.renderTarget=p.renderTarget,this.isRenderTargetTexture=p.isRenderTargetTexture,this.isPMREMTexture=p.isPMREMTexture,this.isArrayTexture=p.isArrayTexture,this.userData=JSON.parse(JSON.stringify(p.userData)),this.needsUpdate=!0,this}setValues(p){for(let m in p){let g=p[m];if(g===void 0){Xt(`Texture.setValues(): parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Texture.setValues(): property '${m}' does not exist.`);continue}if(_&&g&&(_.isVector2&&g.isVector2))_.copy(g);else if(_&&g&&(_.isVector3&&g.isVector3))_.copy(g);else if(_&&g&&(_.isMatrix3&&g.isMatrix3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(!m&&p.textures[this.uuid]!==void 0)return p.textures[this.uuid];let g={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(p).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)g.userData=this.userData;if(!m)p.textures[this.uuid]=g;return g}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(p){if(this.mapping!==300)return p;if(p.applyMatrix3(this.matrix),p.x<0||p.x>1)switch(this.wrapS){case 1000:p.x=p.x-Math.floor(p.x);break;case 1001:p.x=p.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.x)%2)===1)p.x=Math.ceil(p.x)-p.x;else p.x=p.x-Math.floor(p.x);break}if(p.y<0||p.y>1)switch(this.wrapT){case 1000:p.y=p.y-Math.floor(p.y);break;case 1001:p.y=p.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(p.y)%2)===1)p.y=Math.ceil(p.y)-p.y;else p.y=p.y-Math.floor(p.y);break}if(this.flipY)p.y=1-p.y;return p}set needsUpdate(p){if(p===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(p){if(p===!0)this.pmremVersion++}}We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=300;We.DEFAULT_ANISOTROPY=1;class Be{static{this.prototype.isVector4=!0}constructor(p=0,m=0,g=0,_=1){this.x=p,this.y=m,this.z=g,this.w=_}get width(){return this.z}set width(p){this.z=p}get height(){return this.w}set height(p){this.w=p}set(p,m,g,_){return this.x=p,this.y=m,this.z=g,this.w=_,this}setScalar(p){return this.x=p,this.y=p,this.z=p,this.w=p,this}setX(p){return this.x=p,this}setY(p){return this.y=p,this}setZ(p){return this.z=p,this}setW(p){return this.w=p,this}setComponent(p,m){switch(p){case 0:this.x=m;break;case 1:this.y=m;break;case 2:this.z=m;break;case 3:this.w=m;break;default:throw Error("THREE.Vector4: index is out of range: "+p)}return this}getComponent(p){switch(p){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+p)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(p){return this.x=p.x,this.y=p.y,this.z=p.z,this.w=p.w!==void 0?p.w:1,this}add(p){return this.x+=p.x,this.y+=p.y,this.z+=p.z,this.w+=p.w,this}addScalar(p){return this.x+=p,this.y+=p,this.z+=p,this.w+=p,this}addVectors(p,m){return this.x=p.x+m.x,this.y=p.y+m.y,this.z=p.z+m.z,this.w=p.w+m.w,this}addScaledVector(p,m){return this.x+=p.x*m,this.y+=p.y*m,this.z+=p.z*m,this.w+=p.w*m,this}sub(p){return this.x-=p.x,this.y-=p.y,this.z-=p.z,this.w-=p.w,this}subScalar(p){return this.x-=p,this.y-=p,this.z-=p,this.w-=p,this}subVectors(p,m){return this.x=p.x-m.x,this.y=p.y-m.y,this.z=p.z-m.z,this.w=p.w-m.w,this}multiply(p){return this.x*=p.x,this.y*=p.y,this.z*=p.z,this.w*=p.w,this}multiplyScalar(p){return this.x*=p,this.y*=p,this.z*=p,this.w*=p,this}applyMatrix4(p){let m=this.x,g=this.y,_=this.z,x=this.w,y=p.elements;return this.x=y[0]*m+y[4]*g+y[8]*_+y[12]*x,this.y=y[1]*m+y[5]*g+y[9]*_+y[13]*x,this.z=y[2]*m+y[6]*g+y[10]*_+y[14]*x,this.w=y[3]*m+y[7]*g+y[11]*_+y[15]*x,this}divide(p){return this.x/=p.x,this.y/=p.y,this.z/=p.z,this.w/=p.w,this}divideScalar(p){return this.multiplyScalar(1/p)}setAxisAngleFromQuaternion(p){this.w=2*Math.acos(p.w);let m=Math.sqrt(1-p.w*p.w);if(m<0.0001)this.x=1,this.y=0,this.z=0;else this.x=p.x/m,this.y=p.y/m,this.z=p.z/m;return this}setAxisAngleFromRotationMatrix(p){let m,g,_,x,y=0.01,v=0.1,b=p.elements,S=b[0],M=b[4],T=b[8],w=b[1],E=b[5],A=b[9],P=b[2],D=b[6],R=b[10];if(Math.abs(M-w)<0.01&&Math.abs(T-P)<0.01&&Math.abs(A-D)<0.01){if(Math.abs(M+w)<0.1&&Math.abs(T+P)<0.1&&Math.abs(A+D)<0.1&&Math.abs(S+E+R-3)<0.1)return this.set(1,0,0,0),this;m=Math.PI;let I=(S+1)/2,U=(E+1)/2,N=(R+1)/2,F=(M+w)/4,z=(T+P)/4,L=(A+D)/4;if(I>U&&I>N)if(I<0.01)g=0,_=0.707106781,x=0.707106781;else g=Math.sqrt(I),_=F/g,x=z/g;else if(U>N)if(U<0.01)g=0.707106781,_=0,x=0.707106781;else _=Math.sqrt(U),g=F/_,x=L/_;else if(N<0.01)g=0.707106781,_=0.707106781,x=0;else x=Math.sqrt(N),g=z/x,_=L/x;return this.set(g,_,x,m),this}let C=Math.sqrt((D-A)*(D-A)+(T-P)*(T-P)+(w-M)*(w-M));if(Math.abs(C)<0.001)C=1;return this.x=(D-A)/C,this.y=(T-P)/C,this.z=(w-M)/C,this.w=Math.acos((S+E+R-1)/2),this}setFromMatrixPosition(p){let m=p.elements;return this.x=m[12],this.y=m[13],this.z=m[14],this.w=m[15],this}min(p){return this.x=Math.min(this.x,p.x),this.y=Math.min(this.y,p.y),this.z=Math.min(this.z,p.z),this.w=Math.min(this.w,p.w),this}max(p){return this.x=Math.max(this.x,p.x),this.y=Math.max(this.y,p.y),this.z=Math.max(this.z,p.z),this.w=Math.max(this.w,p.w),this}clamp(p,m){return this.x=ie(this.x,p.x,m.x),this.y=ie(this.y,p.y,m.y),this.z=ie(this.z,p.z,m.z),this.w=ie(this.w,p.w,m.w),this}clampScalar(p,m){return this.x=ie(this.x,p,m),this.y=ie(this.y,p,m),this.z=ie(this.z,p,m),this.w=ie(this.w,p,m),this}clampLength(p,m){let g=this.length();return this.divideScalar(g||1).multiplyScalar(ie(g,p,m))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(p){return this.x*p.x+this.y*p.y+this.z*p.z+this.w*p.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(p){return this.normalize().multiplyScalar(p)}lerp(p,m){return this.x+=(p.x-this.x)*m,this.y+=(p.y-this.y)*m,this.z+=(p.z-this.z)*m,this.w+=(p.w-this.w)*m,this}lerpVectors(p,m,g){return this.x=p.x+(m.x-p.x)*g,this.y=p.y+(m.y-p.y)*g,this.z=p.z+(m.z-p.z)*g,this.w=p.w+(m.w-p.w)*g,this}equals(p){return p.x===this.x&&p.y===this.y&&p.z===this.z&&p.w===this.w}fromArray(p,m=0){return this.x=p[m],this.y=p[m+1],this.z=p[m+2],this.w=p[m+3],this}toArray(p=[],m=0){return p[m]=this.x,p[m+1]=this.y,p[m+2]=this.z,p[m+3]=this.w,p}fromBufferAttribute(p,m){return this.x=p.getX(m),this.y=p.getY(m),this.z=p.getZ(m),this.w=p.getW(m),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class gh extends Si{constructor(p=1,m=1,g={}){super();g=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},g),this.isRenderTarget=!0,this.width=p,this.height=m,this.depth=g.depth,this.scissor=new Be(0,0,p,m),this.scissorTest=!1,this.viewport=new Be(0,0,p,m),this.textures=[];let _=g.count;for(let x=0;x<_;x++)this.textures[x]=new We({width:p,height:m,depth:g.depth}),this.textures[x].isRenderTargetTexture=!0,this.textures[x].renderTarget=this;this._setTextureOptions(g),this.depthBuffer=g.depthBuffer,this.stencilBuffer=g.stencilBuffer,this.resolveColorBuffer=g.resolveColorBuffer,this.resolveDepthBuffer=g.resolveDepthBuffer,this.resolveStencilBuffer=g.resolveStencilBuffer,this.storeMultisampledColorBuffer=g.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=g.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=g.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=g.depthTexture,this.samples=g.samples,this.multiview=g.multiview,this.useArrayDepthTexture=g.useArrayDepthTexture}_setTextureOptions(p={}){let m={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(p.mapping!==void 0)m.mapping=p.mapping;if(p.wrapS!==void 0)m.wrapS=p.wrapS;if(p.wrapT!==void 0)m.wrapT=p.wrapT;if(p.wrapR!==void 0)m.wrapR=p.wrapR;if(p.magFilter!==void 0)m.magFilter=p.magFilter;if(p.minFilter!==void 0)m.minFilter=p.minFilter;if(p.format!==void 0)m.format=p.format;if(p.type!==void 0)m.type=p.type;if(p.anisotropy!==void 0)m.anisotropy=p.anisotropy;if(p.colorSpace!==void 0)m.colorSpace=p.colorSpace;if(p.flipY!==void 0)m.flipY=p.flipY;if(p.generateMipmaps!==void 0)m.generateMipmaps=p.generateMipmaps;if(p.mipmapsAutoUpdate!==void 0)m.mipmapsAutoUpdate=p.mipmapsAutoUpdate;if(p.internalFormat!==void 0)m.internalFormat=p.internalFormat;for(let g=0;g<this.textures.length;g++)this.textures[g].setValues(m)}get texture(){return this.textures[0]}set texture(p){this.textures[0]=p}set depthTexture(p){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(p!==null&&p.renderTarget===null)p.renderTarget=this;this._depthTexture=p}get depthTexture(){return this._depthTexture}setSize(p,m,g=1){if(this.width!==p||this.height!==m||this.depth!==g){this.width=p,this.height=m,this.depth=g;for(let _=0,x=this.textures.length;_<x;_++)if(this.textures[_].image.width=p,this.textures[_].image.height=m,this.textures[_].image.depth=g,this.textures[_].isData3DTexture!==!0)this.textures[_].isArrayTexture=this.textures[_].image.depth>1;this.dispose()}this.viewport.set(0,0,p,m),this.scissor.set(0,0,p,m)}clone(){return new this.constructor().copy(this)}copy(p){this.width=p.width,this.height=p.height,this.depth=p.depth,this.scissor.copy(p.scissor),this.scissorTest=p.scissorTest,this.viewport.copy(p.viewport),this.textures.length=0;for(let m=0,g=p.textures.length;m<g;m++){this.textures[m]=p.textures[m].clone(),this.textures[m].isRenderTargetTexture=!0,this.textures[m].renderTarget=this;let _=Object.assign({},p.textures[m].image);this.textures[m].source=new Xr(_)}if(this.depthBuffer=p.depthBuffer,this.stencilBuffer=p.stencilBuffer,this.resolveColorBuffer=p.resolveColorBuffer,this.resolveDepthBuffer=p.resolveDepthBuffer,this.resolveStencilBuffer=p.resolveStencilBuffer,this.storeMultisampledColorBuffer=p.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=p.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=p.storeMultisampledStencilBuffer,p.depthTexture!==null)if(p.depthTexture.renderTarget===p){let m=p.depthTexture.clone();m.renderTarget=null,this.depthTexture=m}else this.depthTexture=p.depthTexture;else this.depthTexture=null;return this.samples=p.samples,this.multiview=p.multiview,this.useArrayDepthTexture=p.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Hn extends gh{constructor(p=1,m=1,g={}){super(p,m,g);this.isWebGLRenderTarget=!0}}class da extends We{constructor(p=null,m=1,g=1,_=1){super(null);this.isDataArrayTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}addLayerUpdate(p){this.layerUpdates.add(p)}clearLayerUpdates(){this.layerUpdates.clear()}}class _h extends We{constructor(p=null,m=1,g=1,_=1){super(null);this.isData3DTexture=!0,this.image={data:p,width:m,height:g,depth:_},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(p){return super.copy(p),this.wrapR=p.wrapR,this}}class Jt{static{this.prototype.isMatrix4=!0}constructor(p,m,g,_,x,y,v,b,S,M,T,w,E,A,P,D){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],p!==void 0)this.set(p,m,g,_,x,y,v,b,S,M,T,w,E,A,P,D)}set(p,m,g,_,x,y,v,b,S,M,T,w,E,A,P,D){let R=this.elements;return R[0]=p,R[4]=m,R[8]=g,R[12]=_,R[1]=x,R[5]=y,R[9]=v,R[13]=b,R[2]=S,R[6]=M,R[10]=T,R[14]=w,R[3]=E,R[7]=A,R[11]=P,R[15]=D,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Jt().fromArray(this.elements)}copy(p){let m=this.elements,g=p.elements;return m[0]=g[0],m[1]=g[1],m[2]=g[2],m[3]=g[3],m[4]=g[4],m[5]=g[5],m[6]=g[6],m[7]=g[7],m[8]=g[8],m[9]=g[9],m[10]=g[10],m[11]=g[11],m[12]=g[12],m[13]=g[13],m[14]=g[14],m[15]=g[15],this}copyPosition(p){let m=this.elements,g=p.elements;return m[12]=g[12],m[13]=g[13],m[14]=g[14],this}setFromMatrix3(p){let m=p.elements;return this.set(m[0],m[3],m[6],0,m[1],m[4],m[7],0,m[2],m[5],m[8],0,0,0,0,1),this}extractBasis(p,m,g){if(this.determinantAffine()===0)return p.set(1,0,0),m.set(0,1,0),g.set(0,0,1),this;return p.setFromMatrixColumn(this,0),m.setFromMatrixColumn(this,1),g.setFromMatrixColumn(this,2),this}makeBasis(p,m,g){return this.set(p.x,m.x,g.x,0,p.y,m.y,g.y,0,p.z,m.z,g.z,0,0,0,0,1),this}extractRotation(p){if(p.determinantAffine()===0)return this.identity();let m=this.elements,g=p.elements,_=1/Cs.setFromMatrixColumn(p,0).length(),x=1/Cs.setFromMatrixColumn(p,1).length(),y=1/Cs.setFromMatrixColumn(p,2).length();return m[0]=g[0]*_,m[1]=g[1]*_,m[2]=g[2]*_,m[3]=0,m[4]=g[4]*x,m[5]=g[5]*x,m[6]=g[6]*x,m[7]=0,m[8]=g[8]*y,m[9]=g[9]*y,m[10]=g[10]*y,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromEuler(p){let m=this.elements,{x:g,y:_,z:x}=p,y=Math.cos(g),v=Math.sin(g),b=Math.cos(_),S=Math.sin(_),M=Math.cos(x),T=Math.sin(x);if(p.order==="XYZ"){let w=y*M,E=y*T,A=v*M,P=v*T;m[0]=b*M,m[4]=-b*T,m[8]=S,m[1]=E+A*S,m[5]=w-P*S,m[9]=-v*b,m[2]=P-w*S,m[6]=A+E*S,m[10]=y*b}else if(p.order==="YXZ"){let w=b*M,E=b*T,A=S*M,P=S*T;m[0]=w+P*v,m[4]=A*v-E,m[8]=y*S,m[1]=y*T,m[5]=y*M,m[9]=-v,m[2]=E*v-A,m[6]=P+w*v,m[10]=y*b}else if(p.order==="ZXY"){let w=b*M,E=b*T,A=S*M,P=S*T;m[0]=w-P*v,m[4]=-y*T,m[8]=A+E*v,m[1]=E+A*v,m[5]=y*M,m[9]=P-w*v,m[2]=-y*S,m[6]=v,m[10]=y*b}else if(p.order==="ZYX"){let w=y*M,E=y*T,A=v*M,P=v*T;m[0]=b*M,m[4]=A*S-E,m[8]=w*S+P,m[1]=b*T,m[5]=P*S+w,m[9]=E*S-A,m[2]=-S,m[6]=v*b,m[10]=y*b}else if(p.order==="YZX"){let w=y*b,E=y*S,A=v*b,P=v*S;m[0]=b*M,m[4]=P-w*T,m[8]=A*T+E,m[1]=T,m[5]=y*M,m[9]=-v*M,m[2]=-S*M,m[6]=E*T+A,m[10]=w-P*T}else if(p.order==="XZY"){let w=y*b,E=y*S,A=v*b,P=v*S;m[0]=b*M,m[4]=-T,m[8]=S*M,m[1]=w*T+P,m[5]=y*M,m[9]=E*T-A,m[2]=A*T-E,m[6]=v*M,m[10]=P*T+w}return m[3]=0,m[7]=0,m[11]=0,m[12]=0,m[13]=0,m[14]=0,m[15]=1,this}makeRotationFromQuaternion(p){return this.compose(C_,p,P_)}lookAt(p,m,g){let _=this.elements;if(In.subVectors(p,m),In.lengthSq()===0)In.z=1;if(In.normalize(),Pi.crossVectors(g,In),Pi.lengthSq()===0){if(Math.abs(g.z)===1)In.x+=0.0001;else In.z+=0.0001;In.normalize(),Pi.crossVectors(g,In)}return Pi.normalize(),Ao.crossVectors(In,Pi),_[0]=Pi.x,_[4]=Ao.x,_[8]=In.x,_[1]=Pi.y,_[5]=Ao.y,_[9]=In.y,_[2]=Pi.z,_[6]=Ao.z,_[10]=In.z,this}multiply(p){return this.multiplyMatrices(this,p)}premultiply(p){return this.multiplyMatrices(p,this)}multiplyMatrices(p,m){let g=p.elements,_=m.elements,x=this.elements,y=g[0],v=g[4],b=g[8],S=g[12],M=g[1],T=g[5],w=g[9],E=g[13],A=g[2],P=g[6],D=g[10],R=g[14],C=g[3],I=g[7],U=g[11],N=g[15],F=_[0],z=_[4],L=_[8],O=_[12],V=_[1],Y=_[5],H=_[9],W=_[13],K=_[2],G=_[6],Q=_[10],st=_[14],tt=_[3],mt=_[7],rt=_[11],ht=_[15];return x[0]=y*F+v*V+b*K+S*tt,x[4]=y*z+v*Y+b*G+S*mt,x[8]=y*L+v*H+b*Q+S*rt,x[12]=y*O+v*W+b*st+S*ht,x[1]=M*F+T*V+w*K+E*tt,x[5]=M*z+T*Y+w*G+E*mt,x[9]=M*L+T*H+w*Q+E*rt,x[13]=M*O+T*W+w*st+E*ht,x[2]=A*F+P*V+D*K+R*tt,x[6]=A*z+P*Y+D*G+R*mt,x[10]=A*L+P*H+D*Q+R*rt,x[14]=A*O+P*W+D*st+R*ht,x[3]=C*F+I*V+U*K+N*tt,x[7]=C*z+I*Y+U*G+N*mt,x[11]=C*L+I*H+U*Q+N*rt,x[15]=C*O+I*W+U*st+N*ht,this}multiplyScalar(p){let m=this.elements;return m[0]*=p,m[4]*=p,m[8]*=p,m[12]*=p,m[1]*=p,m[5]*=p,m[9]*=p,m[13]*=p,m[2]*=p,m[6]*=p,m[10]*=p,m[14]*=p,m[3]*=p,m[7]*=p,m[11]*=p,m[15]*=p,this}determinant(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[12],y=p[1],v=p[5],b=p[9],S=p[13],M=p[2],T=p[6],w=p[10],E=p[14],A=p[3],P=p[7],D=p[11],R=p[15],C=b*E-S*w,I=v*E-S*T,U=v*w-b*T,N=y*E-S*M,F=y*w-b*M,z=y*T-v*M;return m*(P*C-D*I+R*U)-g*(A*C-D*N+R*F)+_*(A*I-P*N+R*z)-x*(A*U-P*F+D*z)}determinantAffine(){let p=this.elements,m=p[0],g=p[4],_=p[8],x=p[1],y=p[5],v=p[9],b=p[2],S=p[6],M=p[10];return m*(y*M-v*S)-g*(x*M-v*b)+_*(x*S-y*b)}transpose(){let p=this.elements,m;return m=p[1],p[1]=p[4],p[4]=m,m=p[2],p[2]=p[8],p[8]=m,m=p[6],p[6]=p[9],p[9]=m,m=p[3],p[3]=p[12],p[12]=m,m=p[7],p[7]=p[13],p[13]=m,m=p[11],p[11]=p[14],p[14]=m,this}setPosition(p,m,g){let _=this.elements;if(p.isVector3)_[12]=p.x,_[13]=p.y,_[14]=p.z;else _[12]=p,_[13]=m,_[14]=g;return this}invert(){let p=this.elements,m=p[0],g=p[1],_=p[2],x=p[3],y=p[4],v=p[5],b=p[6],S=p[7],M=p[8],T=p[9],w=p[10],E=p[11],A=p[12],P=p[13],D=p[14],R=p[15],C=m*v-g*y,I=m*b-_*y,U=m*S-x*y,N=g*b-_*v,F=g*S-x*v,z=_*S-x*b,L=M*P-T*A,O=M*D-w*A,V=M*R-E*A,Y=T*D-w*P,H=T*R-E*P,W=w*R-E*D,K=C*W-I*H+U*Y+N*V-F*O+z*L;if(K===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let G=1/K;return p[0]=(v*W-b*H+S*Y)*G,p[1]=(_*H-g*W-x*Y)*G,p[2]=(P*z-D*F+R*N)*G,p[3]=(w*F-T*z-E*N)*G,p[4]=(b*V-y*W-S*O)*G,p[5]=(m*W-_*V+x*O)*G,p[6]=(D*U-A*z-R*I)*G,p[7]=(M*z-w*U+E*I)*G,p[8]=(y*H-v*V+S*L)*G,p[9]=(g*V-m*H-x*L)*G,p[10]=(A*F-P*U+R*C)*G,p[11]=(T*U-M*F-E*C)*G,p[12]=(v*O-y*Y-b*L)*G,p[13]=(m*Y-g*O+_*L)*G,p[14]=(P*I-A*N-D*C)*G,p[15]=(M*N-T*I+w*C)*G,this}scale(p){let m=this.elements,{x:g,y:_,z:x}=p;return m[0]*=g,m[4]*=_,m[8]*=x,m[1]*=g,m[5]*=_,m[9]*=x,m[2]*=g,m[6]*=_,m[10]*=x,m[3]*=g,m[7]*=_,m[11]*=x,this}getMaxScaleOnAxis(){let p=this.elements,m=p[0]*p[0]+p[1]*p[1]+p[2]*p[2],g=p[4]*p[4]+p[5]*p[5]+p[6]*p[6],_=p[8]*p[8]+p[9]*p[9]+p[10]*p[10];return Math.sqrt(Math.max(m,g,_))}makeTranslation(p,m,g){if(p.isVector3)this.set(1,0,0,p.x,0,1,0,p.y,0,0,1,p.z,0,0,0,1);else this.set(1,0,0,p,0,1,0,m,0,0,1,g,0,0,0,1);return this}makeRotationX(p){let m=Math.cos(p),g=Math.sin(p);return this.set(1,0,0,0,0,m,-g,0,0,g,m,0,0,0,0,1),this}makeRotationY(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,0,g,0,0,1,0,0,-g,0,m,0,0,0,0,1),this}makeRotationZ(p){let m=Math.cos(p),g=Math.sin(p);return this.set(m,-g,0,0,g,m,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(p,m){let g=Math.cos(m),_=Math.sin(m),x=1-g,{x:y,y:v,z:b}=p,S=x*y,M=x*v;return this.set(S*y+g,S*v-_*b,S*b+_*v,0,S*v+_*b,M*v+g,M*b-_*y,0,S*b-_*v,M*b+_*y,x*b*b+g,0,0,0,0,1),this}makeScale(p,m,g){return this.set(p,0,0,0,0,m,0,0,0,0,g,0,0,0,0,1),this}makeShear(p,m,g,_,x,y){return this.set(1,g,x,0,p,1,y,0,m,_,1,0,0,0,0,1),this}compose(p,m,g){let _=this.elements,{_x:x,_y:y,_z:v,_w:b}=m,S=x+x,M=y+y,T=v+v,w=x*S,E=x*M,A=x*T,P=y*M,D=y*T,R=v*T,C=b*S,I=b*M,U=b*T,{x:N,y:F,z}=g;return _[0]=(1-(P+R))*N,_[1]=(E+U)*N,_[2]=(A-I)*N,_[3]=0,_[4]=(E-U)*F,_[5]=(1-(w+R))*F,_[6]=(D+C)*F,_[7]=0,_[8]=(A+I)*z,_[9]=(D-C)*z,_[10]=(1-(w+P))*z,_[11]=0,_[12]=p.x,_[13]=p.y,_[14]=p.z,_[15]=1,this}decompose(p,m,g){let _=this.elements;p.x=_[12],p.y=_[13],p.z=_[14];let x=this.determinantAffine();if(x===0)return g.set(1,1,1),m.identity(),this;let y=Cs.set(_[0],_[1],_[2]).length(),v=Cs.set(_[4],_[5],_[6]).length(),b=Cs.set(_[8],_[9],_[10]).length();if(x<0)y=-y;Yn.copy(this);let S=1/y,M=1/v,T=1/b;return Yn.elements[0]*=S,Yn.elements[1]*=S,Yn.elements[2]*=S,Yn.elements[4]*=M,Yn.elements[5]*=M,Yn.elements[6]*=M,Yn.elements[8]*=T,Yn.elements[9]*=T,Yn.elements[10]*=T,m.setFromRotationMatrix(Yn),g.x=y,g.y=v,g.z=b,this}makePerspective(p,m,g,_,x,y,v=2000,b=!1){let S=this.elements,M=2*x/(m-p),T=2*x/(g-_),w=(m+p)/(m-p),E=(g+_)/(g-_),A,P;if(b)A=x/(y-x),P=y*x/(y-x);else if(v===2000)A=-(y+x)/(y-x),P=-2*y*x/(y-x);else if(v===2001)A=-y/(y-x),P=-y*x/(y-x);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=w,S[12]=0,S[1]=0,S[5]=T,S[9]=E,S[13]=0,S[2]=0,S[6]=0,S[10]=A,S[14]=P,S[3]=0,S[7]=0,S[11]=-1,S[15]=0,this}makeOrthographic(p,m,g,_,x,y,v=2000,b=!1){let S=this.elements,M=2/(m-p),T=2/(g-_),w=-(m+p)/(m-p),E=-(g+_)/(g-_),A,P;if(b)A=1/(y-x),P=y/(y-x);else if(v===2000)A=-2/(y-x),P=-(y+x)/(y-x);else if(v===2001)A=-1/(y-x),P=-x/(y-x);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=0,S[12]=w,S[1]=0,S[5]=T,S[9]=0,S[13]=E,S[2]=0,S[6]=0,S[10]=A,S[14]=P,S[3]=0,S[7]=0,S[11]=0,S[15]=1,this}equals(p){let m=this.elements,g=p.elements;for(let _=0;_<16;_++)if(m[_]!==g[_])return!1;return!0}fromArray(p,m=0){for(let g=0;g<16;g++)this.elements[g]=p[g+m];return this}toArray(p=[],m=0){let g=this.elements;return p[m]=g[0],p[m+1]=g[1],p[m+2]=g[2],p[m+3]=g[3],p[m+4]=g[4],p[m+5]=g[5],p[m+6]=g[6],p[m+7]=g[7],p[m+8]=g[8],p[m+9]=g[9],p[m+10]=g[10],p[m+11]=g[11],p[m+12]=g[12],p[m+13]=g[13],p[m+14]=g[14],p[m+15]=g[15],p}}var Cs=new q,Yn=new Jt,C_=new q(0,0,0),P_=new q(1,1,1),Pi=new q,Ao=new q,In=new q,Od=new Jt,Fd=new Ei;class yi{constructor(p=0,m=0,g=0,_=yi.DEFAULT_ORDER){this.isEuler=!0,this._x=p,this._y=m,this._z=g,this._order=_}get x(){return this._x}set x(p){this._x=p,this._onChangeCallback()}get y(){return this._y}set y(p){this._y=p,this._onChangeCallback()}get z(){return this._z}set z(p){this._z=p,this._onChangeCallback()}get order(){return this._order}set order(p){this._order=p,this._onChangeCallback()}set(p,m,g,_=this._order){return this._x=p,this._y=m,this._z=g,this._order=_,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(p){return this._x=p._x,this._y=p._y,this._z=p._z,this._order=p._order,this._onChangeCallback(),this}setFromRotationMatrix(p,m=this._order,g=!0){let _=p.elements,x=_[0],y=_[4],v=_[8],b=_[1],S=_[5],M=_[9],T=_[2],w=_[6],E=_[10];switch(m){case"XYZ":if(this._y=Math.asin(ie(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(-M,E),this._z=Math.atan2(-y,x);else this._x=Math.atan2(w,S),this._z=0;break;case"YXZ":if(this._x=Math.asin(-ie(M,-1,1)),Math.abs(M)<0.9999999)this._y=Math.atan2(v,E),this._z=Math.atan2(b,S);else this._y=Math.atan2(-T,x),this._z=0;break;case"ZXY":if(this._x=Math.asin(ie(w,-1,1)),Math.abs(w)<0.9999999)this._y=Math.atan2(-T,E),this._z=Math.atan2(-y,S);else this._y=0,this._z=Math.atan2(b,x);break;case"ZYX":if(this._y=Math.asin(-ie(T,-1,1)),Math.abs(T)<0.9999999)this._x=Math.atan2(w,E),this._z=Math.atan2(b,x);else this._x=0,this._z=Math.atan2(-y,S);break;case"YZX":if(this._z=Math.asin(ie(b,-1,1)),Math.abs(b)<0.9999999)this._x=Math.atan2(-M,S),this._y=Math.atan2(-T,x);else this._x=0,this._y=Math.atan2(v,E);break;case"XZY":if(this._z=Math.asin(-ie(y,-1,1)),Math.abs(y)<0.9999999)this._x=Math.atan2(w,S),this._y=Math.atan2(v,x);else this._x=Math.atan2(-M,E),this._y=0;break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+m)}if(this._order=m,g===!0)this._onChangeCallback();return this}setFromQuaternion(p,m,g){return Od.makeRotationFromQuaternion(p),this.setFromRotationMatrix(Od,m,g)}setFromVector3(p,m=this._order){return this.set(p.x,p.y,p.z,m)}reorder(p){return Fd.setFromEuler(this),this.setFromQuaternion(Fd,p)}equals(p){return p._x===this._x&&p._y===this._y&&p._z===this._z&&p._order===this._order}fromArray(p){if(this._x=p[0],this._y=p[1],this._z=p[2],p[3]!==void 0)this._order=p[3];return this._onChangeCallback(),this}toArray(p=[],m=0){return p[m]=this._x,p[m+1]=this._y,p[m+2]=this._z,p[m+3]=this._order,p}_onChange(p){return this._onChangeCallback=p,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}yi.DEFAULT_ORDER="XYZ";class qr{constructor(){this.mask=1}set(p){this.mask=(1<<p|0)>>>0}enable(p){this.mask|=1<<p|0}enableAll(){this.mask=-1}toggle(p){this.mask^=1<<p|0}disable(p){this.mask&=~(1<<p|0)}disableAll(){this.mask=0}test(p){return(this.mask&p.mask)!==0}isEnabled(p){return(this.mask&(1<<p|0))!==0}}var I_=0,Bd=new q,Ps=new Ei,di=new Jt,Ro=new q,Ar=new q,L_=new q,N_=new Ei,kd=new q(1,0,0),zd=new q(0,1,0),Hd=new q(0,0,1),Gd={type:"added"},D_={type:"removed"},Is={type:"childadded",child:null},Gl={type:"childremoved",child:null};class qe extends Si{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:I_++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=qe.DEFAULT_UP.clone();let p=new q,m=new yi,g=new Ei,_=new q(1,1,1);function x(){g.setFromEuler(m,!1)}function y(){m.setFromQuaternion(g,void 0,!1)}m._onChange(x),g._onChange(y),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:p},rotation:{configurable:!0,enumerable:!0,value:m},quaternion:{configurable:!0,enumerable:!0,value:g},scale:{configurable:!0,enumerable:!0,value:_},modelViewMatrix:{value:new Jt},normalMatrix:{value:new jt}}),this.matrix=new Jt,this.matrixWorld=new Jt,this.matrixAutoUpdate=qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new qr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(p),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(p){return this.quaternion.premultiply(p),this}setRotationFromAxisAngle(p,m){this.quaternion.setFromAxisAngle(p,m)}setRotationFromEuler(p){this.quaternion.setFromEuler(p,!0)}setRotationFromMatrix(p){this.quaternion.setFromRotationMatrix(p)}setRotationFromQuaternion(p){this.quaternion.copy(p)}rotateOnAxis(p,m){return Ps.setFromAxisAngle(p,m),this.quaternion.multiply(Ps),this}rotateOnWorldAxis(p,m){return Ps.setFromAxisAngle(p,m),this.quaternion.premultiply(Ps),this}rotateX(p){return this.rotateOnAxis(kd,p)}rotateY(p){return this.rotateOnAxis(zd,p)}rotateZ(p){return this.rotateOnAxis(Hd,p)}translateOnAxis(p,m){return Bd.copy(p).applyQuaternion(this.quaternion),this.position.add(Bd.multiplyScalar(m)),this}translateX(p){return this.translateOnAxis(kd,p)}translateY(p){return this.translateOnAxis(zd,p)}translateZ(p){return this.translateOnAxis(Hd,p)}localToWorld(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(this.matrixWorld)}worldToLocal(p){return this.updateWorldMatrix(!0,!1),p.applyMatrix4(di.copy(this.matrixWorld).invert())}lookAt(p,m,g){if(p.isVector3)Ro.copy(p);else Ro.set(p,m,g);let _=this.parent;if(this.updateWorldMatrix(!0,!1),Ar.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)di.lookAt(Ar,Ro,this.up);else di.lookAt(Ro,Ar,this.up);if(this.quaternion.setFromRotationMatrix(di),_)di.extractRotation(_.matrixWorld),Ps.setFromRotationMatrix(di),this.quaternion.premultiply(Ps.invert())}add(p){if(arguments.length>1){for(let m=0;m<arguments.length;m++)this.add(arguments[m]);return this}if(p===this)return $t("Object3D.add: object can't be added as a child of itself.",p),this;if(p&&p.isObject3D)p.removeFromParent(),p.parent=this,this.children.push(p),p.dispatchEvent(Gd),Is.child=p,this.dispatchEvent(Is),Is.child=null;else $t("Object3D.add: object not an instance of THREE.Object3D.",p);return this}remove(p){if(arguments.length>1){for(let g=0;g<arguments.length;g++)this.remove(arguments[g]);return this}let m=this.children.indexOf(p);if(m!==-1)p.parent=null,this.children.splice(m,1),p.dispatchEvent(D_),Gl.child=p,this.dispatchEvent(Gl),Gl.child=null;return this}removeFromParent(){let p=this.parent;if(p!==null)p.remove(this);return this}clear(){return this.remove(...this.children)}attach(p){if(this.updateWorldMatrix(!0,!1),di.copy(this.matrixWorld).invert(),p.parent!==null)p.parent.updateWorldMatrix(!0,!1),di.multiply(p.parent.matrixWorld);return p.applyMatrix4(di),p.removeFromParent(),p.parent=this,this.children.push(p),p.updateWorldMatrix(!1,!0),p.dispatchEvent(Gd),Is.child=p,this.dispatchEvent(Is),Is.child=null,this}getObjectById(p){return this.getObjectByProperty("id",p)}getObjectByName(p){return this.getObjectByProperty("name",p)}getObjectByProperty(p,m){if(this[p]===m)return this;for(let g=0,_=this.children.length;g<_;g++){let y=this.children[g].getObjectByProperty(p,m);if(y!==void 0)return y}return}getObjectsByProperty(p,m,g=[]){if(this[p]===m)g.push(this);let _=this.children;for(let x=0,y=_.length;x<y;x++)_[x].getObjectsByProperty(p,m,g);return g}getWorldPosition(p){return this.updateWorldMatrix(!0,!1),p.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,p,L_),p}getWorldScale(p){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ar,N_,p),p}getWorldDirection(p){this.updateWorldMatrix(!0,!1);let m=this.matrixWorld.elements;return p.set(m[8],m[9],m[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(p){p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverse(p)}traverseVisible(p){if(this.visible===!1)return;p(this);let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].traverseVisible(p)}traverseAncestors(p){let m=this.parent;if(m!==null)p(m),m.traverseAncestors(p)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let p=this.pivot;if(p!==null){let{x:m,y:g,z:_}=p,x=this.matrix.elements;x[12]+=m-x[0]*m-x[4]*g-x[8]*_,x[13]+=g-x[1]*m-x[5]*g-x[9]*_,x[14]+=_-x[2]*m-x[6]*g-x[10]*_}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(p){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||p){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,p=!0}let m=this.children;for(let g=0,_=m.length;g<_;g++)m[g].updateMatrixWorld(p)}updateWorldMatrix(p,m,g=!1){let _=this.parent;if(p===!0&&_!==null)_.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||g){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,g=!0}if(m===!0){let x=this.children;for(let y=0,v=x.length;y<v;y++)x[y].updateWorldMatrix(!1,!0,g)}}toJSON(p){let m=p===void 0||typeof p==="string",g={};if(m)p={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},g.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let _={};if(_.uuid=this.uuid,_.type=this.type,_.name=this.name,_.castShadow=this.castShadow,_.receiveShadow=this.receiveShadow,_.visible=this.visible,_.frustumCulled=this.frustumCulled,_.renderOrder=this.renderOrder,_.static=this.static,_.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)_.userData=this.userData;if(_.layers=this.layers.mask,_.matrix=this.matrix.toArray(),_.up=this.up.toArray(),this.pivot!==null)_.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)_.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)_.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(_.type="InstancedMesh",_.count=this.count,_.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)_.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(_.type="BatchedMesh",_.perObjectFrustumCulled=this.perObjectFrustumCulled,_.sortObjects=this.sortObjects,_.drawRanges=this._drawRanges,_.reservedRanges=this._reservedRanges,_.geometryInfo=this._geometryInfo.map((v)=>({...v,boundingBox:v.boundingBox?v.boundingBox.toJSON():void 0,boundingSphere:v.boundingSphere?v.boundingSphere.toJSON():void 0})),_.instanceInfo=this._instanceInfo.map((v)=>({...v})),_.availableInstanceIds=this._availableInstanceIds.slice(),_.availableGeometryIds=this._availableGeometryIds.slice(),_.nextIndexStart=this._nextIndexStart,_.nextVertexStart=this._nextVertexStart,_.geometryCount=this._geometryCount,_.maxInstanceCount=this._maxInstanceCount,_.maxVertexCount=this._maxVertexCount,_.maxIndexCount=this._maxIndexCount,_.geometryInitialized=this._geometryInitialized,_.matricesTexture=this._matricesTexture.toJSON(p),_.indirectTexture=this._indirectTexture.toJSON(p),this._colorsTexture!==null)_.colorsTexture=this._colorsTexture.toJSON(p);if(this.boundingSphere!==null)_.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)_.boundingBox=this.boundingBox.toJSON()}function x(v,b){if(v[b.uuid]===void 0)v[b.uuid]=b.toJSON(p);return b.uuid}if(this.isScene){if(this.background){if(this.background.isColor)_.background=this.background.toJSON();else if(this.background.isTexture)_.background=this.background.toJSON(p).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)_.environment=this.environment.toJSON(p).uuid}else if(this.isMesh||this.isLine||this.isPoints){_.geometry=x(p.geometries,this.geometry);let v=this.geometry.parameters;if(v!==void 0&&v.shapes!==void 0){let b=v.shapes;if(Array.isArray(b))for(let S=0,M=b.length;S<M;S++){let T=b[S];x(p.shapes,T)}else x(p.shapes,b)}}if(this.isSkinnedMesh){if(_.bindMode=this.bindMode,_.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)x(p.skeletons,this.skeleton),_.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let v=[];for(let b=0,S=this.material.length;b<S;b++)v.push(x(p.materials,this.material[b]));_.material=v}else _.material=x(p.materials,this.material);if(this.children.length>0){_.children=[];for(let v=0;v<this.children.length;v++)_.children.push(this.children[v].toJSON(p).object)}if(this.animations.length>0){_.animations=[];for(let v=0;v<this.animations.length;v++){let b=this.animations[v];_.animations.push(x(p.animations,b))}}if(m){let v=y(p.geometries),b=y(p.materials),S=y(p.textures),M=y(p.images),T=y(p.shapes),w=y(p.skeletons),E=y(p.animations),A=y(p.nodes);if(v.length>0)g.geometries=v;if(b.length>0)g.materials=b;if(S.length>0)g.textures=S;if(M.length>0)g.images=M;if(T.length>0)g.shapes=T;if(w.length>0)g.skeletons=w;if(E.length>0)g.animations=E;if(A.length>0)g.nodes=A}return g.object=_,g;function y(v){let b=[];for(let S in v){let M=v[S];delete M.metadata,b.push(M)}return b}}clone(p){return new this.constructor().copy(this,p)}copy(p,m=!0){if(this.name=p.name,this.up.copy(p.up),this.position.copy(p.position),this.rotation.order=p.rotation.order,this.quaternion.copy(p.quaternion),this.scale.copy(p.scale),this.pivot=p.pivot!==null?p.pivot.clone():null,this.matrix.copy(p.matrix),this.matrixWorld.copy(p.matrixWorld),this.matrixAutoUpdate=p.matrixAutoUpdate,this.matrixWorldAutoUpdate=p.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=p.matrixWorldNeedsUpdate,this.layers.mask=p.layers.mask,this.visible=p.visible,this.castShadow=p.castShadow,this.receiveShadow=p.receiveShadow,this.frustumCulled=p.frustumCulled,this.renderOrder=p.renderOrder,this.static=p.static,this.animations=p.animations.slice(),this.userData=JSON.parse(JSON.stringify(p.userData)),m===!0)for(let g=0;g<p.children.length;g++){let _=p.children[g];this.add(_.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}qe.DEFAULT_UP=new q(0,1,0);qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ui extends qe{constructor(){super();this.isGroup=!0,this.type="Group"}}var U_={type:"move"};class Yr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Ui,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Ui,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Ui,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(p){if(this._targetRay!==null)this._targetRay.dispatchEvent(p);if(this._grip!==null)this._grip.dispatchEvent(p);if(this._hand!==null)this._hand.dispatchEvent(p);return this}connect(p){if(p&&p.hand){let m=this._hand;if(m)for(let g of p.hand.values())this._getHandJoint(m,g)}return this.dispatchEvent({type:"connected",data:p}),this}disconnect(p){if(this.dispatchEvent({type:"disconnected",data:p}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(p,m,g){let _=null,x=null,y=null,v=this._targetRay,b=this._grip,S=this._hand;if(p&&m.session.visibilityState!=="visible-blurred"){if(S&&p.hand){y=!0;for(let P of p.hand.values()){let D=m.getJointPose(P,g),R=this._getHandJoint(S,P);if(D!==null)R.matrix.fromArray(D.transform.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale),R.matrixWorldNeedsUpdate=!0,R.jointRadius=D.radius;R.visible=D!==null}let M=S.joints["index-finger-tip"],T=S.joints["thumb-tip"],w=M.position.distanceTo(T.position),E=0.02,A=0.005;if(S.inputState.pinching&&w>E+A)S.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:p.handedness,target:this});else if(!S.inputState.pinching&&w<=E-A)S.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:p.handedness,target:this})}else if(b!==null&&p.gripSpace){if(x=m.getPose(p.gripSpace,g),x!==null){if(b.matrix.fromArray(x.transform.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale),b.matrixWorldNeedsUpdate=!0,x.linearVelocity)b.hasLinearVelocity=!0,b.linearVelocity.copy(x.linearVelocity);else b.hasLinearVelocity=!1;if(x.angularVelocity)b.hasAngularVelocity=!0,b.angularVelocity.copy(x.angularVelocity);else b.hasAngularVelocity=!1;if(b.eventsEnabled)b.dispatchEvent({type:"gripUpdated",data:p,target:this})}}if(v!==null){if(_=m.getPose(p.targetRaySpace,g),_===null&&x!==null)_=x;if(_!==null){if(v.matrix.fromArray(_.transform.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale),v.matrixWorldNeedsUpdate=!0,_.linearVelocity)v.hasLinearVelocity=!0,v.linearVelocity.copy(_.linearVelocity);else v.hasLinearVelocity=!1;if(_.angularVelocity)v.hasAngularVelocity=!0,v.angularVelocity.copy(_.angularVelocity);else v.hasAngularVelocity=!1;this.dispatchEvent(U_)}}}if(v!==null)v.visible=_!==null;if(b!==null)b.visible=x!==null;if(S!==null)S.visible=y!==null;return this}_getHandJoint(p,m){if(p.joints[m.jointName]===void 0){let g=new Ui;g.matrixAutoUpdate=!1,g.visible=!1,p.joints[m.jointName]=g,p.add(g)}return p.joints[m.jointName]}}var fp={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ii={h:0,s:0,l:0},Co={h:0,s:0,l:0};function Vl(p,m,g){if(g<0)g+=1;if(g>1)g-=1;if(g<0.16666666666666666)return p+(m-p)*6*g;if(g<0.5)return m;if(g<0.6666666666666666)return p+(m-p)*6*(0.6666666666666666-g);return p}class se{constructor(p,m,g){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(p,m,g)}set(p,m,g){if(m===void 0&&g===void 0){let _=p;if(_&&_.isColor)this.copy(_);else if(typeof _==="number")this.setHex(_);else if(typeof _==="string")this.setStyle(_)}else this.setRGB(p,m,g);return this}setScalar(p){return this.r=p,this.g=p,this.b=p,this}setHex(p,m="srgb"){return p=Math.floor(p),this.r=(p>>16&255)/255,this.g=(p>>8&255)/255,this.b=(p&255)/255,he.colorSpaceToWorking(this,m),this}setRGB(p,m,g,_=he.workingColorSpace){return this.r=p,this.g=m,this.b=g,he.colorSpaceToWorking(this,_),this}setHSL(p,m,g,_=he.workingColorSpace){if(p=uh(p,1),m=ie(m,0,1),g=ie(g,0,1),m===0)this.r=this.g=this.b=g;else{let x=g<=0.5?g*(1+m):g+m-g*m,y=2*g-x;this.r=Vl(y,x,p+0.3333333333333333),this.g=Vl(y,x,p),this.b=Vl(y,x,p-0.3333333333333333)}return he.colorSpaceToWorking(this,_),this}setStyle(p,m="srgb"){function g(x){if(x===void 0)return;if(parseFloat(x)<1)Xt("Color: Alpha component of "+p+" will be ignored.")}let _;if(_=/^(\w+)\(([^\)]*)\)/.exec(p)){let x,y=_[1],v=_[2];switch(y){case"rgb":case"rgba":if(x=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setRGB(Math.min(255,parseInt(x[1],10))/255,Math.min(255,parseInt(x[2],10))/255,Math.min(255,parseInt(x[3],10))/255,m);if(x=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setRGB(Math.min(100,parseFloat(x[1]))/100,Math.min(100,parseFloat(x[2]))/100,Math.min(100,parseFloat(x[3]))/100,m);break;case"hsl":case"hsla":if(x=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return g(x[4]),this.setHSL(parseFloat(x[1])/360,parseFloat(x[2])/100,parseFloat(x[3])/100,m);break;default:Xt("Color: Unknown color model "+p)}}else if(_=/^\#([A-Fa-f\d]+)$/.exec(p)){let x=_[1],y=x.length;if(y===3)return this.setRGB(parseInt(x.charAt(0),16)/15,parseInt(x.charAt(1),16)/15,parseInt(x.charAt(2),16)/15,m);else if(y===6)return this.setHex(parseInt(x,16),m);else Xt("Color: Invalid hex color "+p)}else if(p&&p.length>0)return this.setColorName(p,m);return this}setColorName(p,m="srgb"){let g=fp[p.toLowerCase()];if(g!==void 0)this.setHex(g,m);else Xt("Color: Unknown color "+p);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(p){return this.r=p.r,this.g=p.g,this.b=p.b,this}copySRGBToLinear(p){return this.r=xi(p.r),this.g=xi(p.g),this.b=xi(p.b),this}copyLinearToSRGB(p){return this.r=Vs(p.r),this.g=Vs(p.g),this.b=Vs(p.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(p="srgb"){return he.workingToColorSpace(pn.copy(this),p),Math.round(ie(pn.r*255,0,255))*65536+Math.round(ie(pn.g*255,0,255))*256+Math.round(ie(pn.b*255,0,255))}getHexString(p="srgb"){return("000000"+this.getHex(p).toString(16)).slice(-6)}getHSL(p,m=he.workingColorSpace){he.workingToColorSpace(pn.copy(this),m);let{r:g,g:_,b:x}=pn,y=Math.max(g,_,x),v=Math.min(g,_,x),b,S,M=(v+y)/2;if(v===y)b=0,S=0;else{let T=y-v;switch(S=M<=0.5?T/(y+v):T/(2-y-v),y){case g:b=(_-x)/T+(_<x?6:0);break;case _:b=(x-g)/T+2;break;case x:b=(g-_)/T+4;break}b/=6}return p.h=b,p.s=S,p.l=M,p}getRGB(p,m=he.workingColorSpace){return he.workingToColorSpace(pn.copy(this),m),p.r=pn.r,p.g=pn.g,p.b=pn.b,p}getStyle(p="srgb"){he.workingToColorSpace(pn.copy(this),p);let{r:m,g,b:_}=pn;if(p!=="srgb")return`color(${p} ${m.toFixed(3)} ${g.toFixed(3)} ${_.toFixed(3)})`;return`rgb(${Math.round(m*255)},${Math.round(g*255)},${Math.round(_*255)})`}offsetHSL(p,m,g){return this.getHSL(Ii),this.setHSL(Ii.h+p,Ii.s+m,Ii.l+g)}add(p){return this.r+=p.r,this.g+=p.g,this.b+=p.b,this}addColors(p,m){return this.r=p.r+m.r,this.g=p.g+m.g,this.b=p.b+m.b,this}addScalar(p){return this.r+=p,this.g+=p,this.b+=p,this}sub(p){return this.r=Math.max(0,this.r-p.r),this.g=Math.max(0,this.g-p.g),this.b=Math.max(0,this.b-p.b),this}multiply(p){return this.r*=p.r,this.g*=p.g,this.b*=p.b,this}multiplyScalar(p){return this.r*=p,this.g*=p,this.b*=p,this}lerp(p,m){return this.r+=(p.r-this.r)*m,this.g+=(p.g-this.g)*m,this.b+=(p.b-this.b)*m,this}lerpColors(p,m,g){return this.r=p.r+(m.r-p.r)*g,this.g=p.g+(m.g-p.g)*g,this.b=p.b+(m.b-p.b)*g,this}lerpHSL(p,m){this.getHSL(Ii),p.getHSL(Co);let g=Dr(Ii.h,Co.h,m),_=Dr(Ii.s,Co.s,m),x=Dr(Ii.l,Co.l,m);return this.setHSL(g,_,x),this}setFromVector3(p){return this.r=p.x,this.g=p.y,this.b=p.z,this}applyMatrix3(p){let m=this.r,g=this.g,_=this.b,x=p.elements;return this.r=x[0]*m+x[3]*g+x[6]*_,this.g=x[1]*m+x[4]*g+x[7]*_,this.b=x[2]*m+x[5]*g+x[8]*_,this}equals(p){return p.r===this.r&&p.g===this.g&&p.b===this.b}fromArray(p,m=0){return this.r=p[m],this.g=p[m+1],this.b=p[m+2],this}toArray(p=[],m=0){return p[m]=this.r,p[m+1]=this.g,p[m+2]=this.b,p}fromBufferAttribute(p,m){return this.r=p.getX(m),this.g=p.getY(m),this.b=p.getZ(m),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var pn=new se;se.NAMES=fp;class fa extends qe{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new yi,this.environmentIntensity=1,this.environmentRotation=new yi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(p,m){return super.copy(p,m),this.background=p.background!==null?p.background.clone():null,this.environment=p.environment!==null?p.environment.clone():null,this.fog=p.fog!==null?p.fog.clone():null,this.backgroundBlurriness=p.backgroundBlurriness,this.backgroundIntensity=p.backgroundIntensity,this.backgroundRotation.copy(p.backgroundRotation),this.environmentIntensity=p.environmentIntensity,this.environmentRotation.copy(p.environmentRotation),this.overrideMaterial=p.overrideMaterial!==null?p.overrideMaterial.clone():null,this.matrixAutoUpdate=p.matrixAutoUpdate,this}toJSON(p){let m=super.toJSON(p);if(this.fog!==null)m.object.fog=this.fog.toJSON();return m.object.backgroundBlurriness=this.backgroundBlurriness,m.object.backgroundIntensity=this.backgroundIntensity,m.object.backgroundRotation=this.backgroundRotation.toArray(),m.object.environmentIntensity=this.environmentIntensity,m.object.environmentRotation=this.environmentRotation.toArray(),m}}var Zn=new q,fi=new q,Wl=new q,pi=new q,Ls=new q,Ns=new q,Vd=new q,Xl=new q,ql=new q,Yl=new q,Zl=new Be,$l=new Be,Kl=new Be;class Ve{constructor(p=new q,m=new q,g=new q){this.a=p,this.b=m,this.c=g}static getNormal(p,m,g,_){_.subVectors(g,m),Zn.subVectors(p,m),_.cross(Zn);let x=_.lengthSq();if(x>0)return _.multiplyScalar(1/Math.sqrt(x));return _.set(0,0,0)}static getBarycoord(p,m,g,_,x){Zn.subVectors(_,m),fi.subVectors(g,m),Wl.subVectors(p,m);let y=Zn.dot(Zn),v=Zn.dot(fi),b=Zn.dot(Wl),S=fi.dot(fi),M=fi.dot(Wl),T=y*S-v*v;if(T===0)return x.set(0,0,0),null;let w=1/T,E=(S*b-v*M)*w,A=(y*M-v*b)*w;return x.set(1-E-A,A,E)}static containsPoint(p,m,g,_){if(this.getBarycoord(p,m,g,_,pi)===null)return!1;return pi.x>=0&&pi.y>=0&&pi.x+pi.y<=1}static getInterpolation(p,m,g,_,x,y,v,b){if(this.getBarycoord(p,m,g,_,pi)===null){if(b.x=0,b.y=0,"z"in b)b.z=0;if("w"in b)b.w=0;return null}return b.setScalar(0),b.addScaledVector(x,pi.x),b.addScaledVector(y,pi.y),b.addScaledVector(v,pi.z),b}static getInterpolatedAttribute(p,m,g,_,x,y){return Zl.setScalar(0),$l.setScalar(0),Kl.setScalar(0),Zl.fromBufferAttribute(p,m),$l.fromBufferAttribute(p,g),Kl.fromBufferAttribute(p,_),y.setScalar(0),y.addScaledVector(Zl,x.x),y.addScaledVector($l,x.y),y.addScaledVector(Kl,x.z),y}static isFrontFacing(p,m,g,_){return Zn.subVectors(g,m),fi.subVectors(p,m),Zn.cross(fi).dot(_)<0}set(p,m,g){return this.a.copy(p),this.b.copy(m),this.c.copy(g),this}setFromPointsAndIndices(p,m,g,_){return this.a.copy(p[m]),this.b.copy(p[g]),this.c.copy(p[_]),this}setFromAttributeAndIndices(p,m,g,_){return this.a.fromBufferAttribute(p,m),this.b.fromBufferAttribute(p,g),this.c.fromBufferAttribute(p,_),this}clone(){return new this.constructor().copy(this)}copy(p){return this.a.copy(p.a),this.b.copy(p.b),this.c.copy(p.c),this}getArea(){return Zn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Zn.cross(fi).length()*0.5}getMidpoint(p){return p.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(p){return Ve.getNormal(this.a,this.b,this.c,p)}getPlane(p){return p.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(p,m){return Ve.getBarycoord(p,this.a,this.b,this.c,m)}getInterpolation(p,m,g,_,x){return Ve.getInterpolation(p,this.a,this.b,this.c,m,g,_,x)}containsPoint(p){return Ve.containsPoint(p,this.a,this.b,this.c)}isFrontFacing(p){return Ve.isFrontFacing(this.a,this.b,this.c,p)}intersectsBox(p){return p.intersectsTriangle(this)}closestPointToPoint(p,m){let g=this.a,_=this.b,x=this.c,y,v;Ls.subVectors(_,g),Ns.subVectors(x,g),Xl.subVectors(p,g);let b=Ls.dot(Xl),S=Ns.dot(Xl);if(b<=0&&S<=0)return m.copy(g);ql.subVectors(p,_);let M=Ls.dot(ql),T=Ns.dot(ql);if(M>=0&&T<=M)return m.copy(_);let w=b*T-M*S;if(w<=0&&b>=0&&M<=0&&b-M>0)return y=b/(b-M),m.copy(g).addScaledVector(Ls,y);Yl.subVectors(p,x);let E=Ls.dot(Yl),A=Ns.dot(Yl);if(A>=0&&E<=A)return m.copy(x);let P=E*S-b*A;if(P<=0&&S>=0&&A<=0)return v=S/(S-A),m.copy(g).addScaledVector(Ns,v);let D=M*A-E*T;if(D<=0&&T-M>=0&&E-A>=0)return Vd.subVectors(x,_),v=(T-M)/(T-M+(E-A)),m.copy(_).addScaledVector(Vd,v);let R=1/(D+P+w);return y=P*R,v=w*R,m.copy(g).addScaledVector(Ls,y).addScaledVector(Ns,v)}equals(p){return p.a.equals(this.a)&&p.b.equals(this.b)&&p.c.equals(this.c)}}class xe{constructor(p=new q(1/0,1/0,1/0),m=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=p,this.max=m}set(p,m){return this.min.copy(p),this.max.copy(m),this}setFromArray(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m+=3)this.expandByPoint($n.fromArray(p,m));return this}setFromBufferAttribute(p){this.makeEmpty();for(let m=0,g=p.count;m<g;m++)this.expandByPoint($n.fromBufferAttribute(p,m));return this}setFromPoints(p){this.makeEmpty();for(let m=0,g=p.length;m<g;m++)this.expandByPoint(p[m]);return this}setFromCenterAndSize(p,m){let g=$n.copy(m).multiplyScalar(0.5);return this.min.copy(p).sub(g),this.max.copy(p).add(g),this}setFromObject(p,m=!1){return this.makeEmpty(),this.expandByObject(p,m)}clone(){return new this.constructor().copy(this)}copy(p){return this.min.copy(p.min),this.max.copy(p.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(p){return this.isEmpty()?p.set(0,0,0):p.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(p){return this.isEmpty()?p.set(0,0,0):p.subVectors(this.max,this.min)}expandByPoint(p){return this.min.min(p),this.max.max(p),this}expandByVector(p){return this.min.sub(p),this.max.add(p),this}expandByScalar(p){return this.min.addScalar(-p),this.max.addScalar(p),this}expandByObject(p,m=!1){p.updateWorldMatrix(!1,!1);let g=p.geometry;if(g!==void 0){let x=g.getAttribute("position");if(m===!0&&x!==void 0&&p.isInstancedMesh!==!0&&p.isBatchedMesh!==!0)for(let y=0,v=x.count;y<v;y++){if(p.isMesh===!0)p.getVertexPosition(y,$n);else $n.fromBufferAttribute(x,y);$n.applyMatrix4(p.matrixWorld),this.expandByPoint($n)}else{if(p.boundingBox!==void 0){if(p.boundingBox===null)p.computeBoundingBox();Po.copy(p.boundingBox)}else{if(g.boundingBox===null)g.computeBoundingBox();Po.copy(g.boundingBox)}Po.applyMatrix4(p.matrixWorld),this.union(Po)}}let _=p.children;for(let x=0,y=_.length;x<y;x++)this.expandByObject(_[x],m);return this}containsPoint(p){return p.x>=this.min.x&&p.x<=this.max.x&&p.y>=this.min.y&&p.y<=this.max.y&&p.z>=this.min.z&&p.z<=this.max.z}containsBox(p){return this.min.x<=p.min.x&&p.max.x<=this.max.x&&this.min.y<=p.min.y&&p.max.y<=this.max.y&&this.min.z<=p.min.z&&p.max.z<=this.max.z}getParameter(p,m){return m.set((p.x-this.min.x)/(this.max.x-this.min.x),(p.y-this.min.y)/(this.max.y-this.min.y),(p.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(p){return p.max.x>=this.min.x&&p.min.x<=this.max.x&&p.max.y>=this.min.y&&p.min.y<=this.max.y&&p.max.z>=this.min.z&&p.min.z<=this.max.z}intersectsSphere(p){return this.clampPoint(p.center,$n),$n.distanceToSquared(p.center)<=p.radius*p.radius}intersectsPlane(p){let m,g;if(p.normal.x>0)m=p.normal.x*this.min.x,g=p.normal.x*this.max.x;else m=p.normal.x*this.max.x,g=p.normal.x*this.min.x;if(p.normal.y>0)m+=p.normal.y*this.min.y,g+=p.normal.y*this.max.y;else m+=p.normal.y*this.max.y,g+=p.normal.y*this.min.y;if(p.normal.z>0)m+=p.normal.z*this.min.z,g+=p.normal.z*this.max.z;else m+=p.normal.z*this.max.z,g+=p.normal.z*this.min.z;return m<=-p.constant&&g>=-p.constant}intersectsTriangle(p){if(this.isEmpty())return!1;this.getCenter(Rr),Io.subVectors(this.max,Rr),Ds.subVectors(p.a,Rr),Us.subVectors(p.b,Rr),Os.subVectors(p.c,Rr),Li.subVectors(Us,Ds),Ni.subVectors(Os,Us),es.subVectors(Ds,Os);let m=[0,-Li.z,Li.y,0,-Ni.z,Ni.y,0,-es.z,es.y,Li.z,0,-Li.x,Ni.z,0,-Ni.x,es.z,0,-es.x,-Li.y,Li.x,0,-Ni.y,Ni.x,0,-es.y,es.x,0];if(!Jl(m,Ds,Us,Os,Io))return!1;if(m=[1,0,0,0,1,0,0,0,1],!Jl(m,Ds,Us,Os,Io))return!1;return Lo.crossVectors(Li,Ni),m=[Lo.x,Lo.y,Lo.z],Jl(m,Ds,Us,Os,Io)}clampPoint(p,m){return m.copy(p).clamp(this.min,this.max)}distanceToPoint(p){return this.clampPoint(p,$n).distanceTo(p)}getBoundingSphere(p){if(this.isEmpty())p.makeEmpty();else this.getCenter(p.center),p.radius=this.getSize($n).length()*0.5;return p}intersect(p){if(this.min.max(p.min),this.max.min(p.max),this.isEmpty())this.makeEmpty();return this}union(p){return this.min.min(p.min),this.max.max(p.max),this}applyMatrix4(p){if(this.isEmpty())return this;return mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(p),mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(p),mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(p),mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(p),mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(p),mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(p),mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(p),mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(p),this.setFromPoints(mi),this}translate(p){return this.min.add(p),this.max.add(p),this}equals(p){return p.min.equals(this.min)&&p.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(p){return this.min.fromArray(p.min),this.max.fromArray(p.max),this}}var mi=[new q,new q,new q,new q,new q,new q,new q,new q],$n=new q,Po=new xe,Ds=new q,Us=new q,Os=new q,Li=new q,Ni=new q,es=new q,Rr=new q,Io=new q,Lo=new q,ns=new q;function Jl(p,m,g,_,x){for(let y=0,v=p.length-3;y<=v;y+=3){ns.fromArray(p,y);let b=x.x*Math.abs(ns.x)+x.y*Math.abs(ns.y)+x.z*Math.abs(ns.z),S=m.dot(ns),M=g.dot(ns),T=_.dot(ns);if(Math.max(-Math.max(S,M,T),Math.min(S,M,T))>b)return!1}return!0}var Ge=new q,No=new Kt,O_=0;class Xe extends Si{constructor(p,m,g=!1){super();if(Array.isArray(p))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:O_++}),this.name="",this.array=p,this.itemSize=m,this.count=p!==void 0?p.length/m:0,this.normalized=g,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=p!==void 0?ua(p):void 0}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.name=p.name,this.array=new p.array.constructor(p.array),this.itemSize=p.itemSize,this.count=p.count,this.normalized=p.normalized,this.usage=p.usage,this.gpuType=p.gpuType,this._normalizationScale=p._normalizationScale,this}copyAt(p,m,g){p*=this.itemSize,g*=m.itemSize;for(let _=0,x=this.itemSize;_<x;_++)this.array[p+_]=m.array[g+_];return this}copyArray(p){return this.array.set(p),this}applyMatrix3(p){if(this.itemSize===2)for(let m=0,g=this.count;m<g;m++)No.fromBufferAttribute(this,m),No.applyMatrix3(p),this.setXY(m,No.x,No.y);else if(this.itemSize===3)for(let m=0,g=this.count;m<g;m++)Ge.fromBufferAttribute(this,m),Ge.applyMatrix3(p),this.setXYZ(m,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(p){for(let m=0,g=this.count;m<g;m++)Ge.fromBufferAttribute(this,m),Ge.applyMatrix4(p),this.setXYZ(m,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)Ge.fromBufferAttribute(this,m),Ge.applyNormalMatrix(p),this.setXYZ(m,Ge.x,Ge.y,Ge.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)Ge.fromBufferAttribute(this,m),Ge.transformDirection(p),this.setXYZ(m,Ge.x,Ge.y,Ge.z);return this}set(p,m=0){return this.array.set(p,m),this}getComponent(p,m){let g=this.array[p*this.itemSize+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.array[p*this.itemSize+m]=g,this}getX(p){let m=this.array[p*this.itemSize];if(this.normalized)m=this._denormalize(m);return m}setX(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize]=m,this}getY(p){let m=this.array[p*this.itemSize+1];if(this.normalized)m=this._denormalize(m);return m}setY(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+1]=m,this}getZ(p){let m=this.array[p*this.itemSize+2];if(this.normalized)m=this._denormalize(m);return m}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+2]=m,this}getW(p){let m=this.array[p*this.itemSize+3];if(this.normalized)m=this._denormalize(m);return m}setW(p,m){if(this.normalized)m=this._normalize(m);return this.array[p*this.itemSize+3]=m,this}setXY(p,m,g){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.array[p+0]=m,this.array[p+1]=g,this}setXYZ(p,m,g,_){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p*=this.itemSize,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.array[p+0]=m,this.array[p+1]=g,this.array[p+2]=_,this.array[p+3]=x,this}onUpload(p){return this.onUploadCallback=p,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let p={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return p.name=this.name,p.usage=this.usage,p.gpuType=this.gpuType,p}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):fh(p,this.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):ph(p,this.array)}}class pa extends Xe{constructor(p,m,g){super(new Uint16Array(p),m,g)}}class ma extends Xe{constructor(p,m,g){super(new Uint32Array(p),m,g)}}class an extends Xe{constructor(p,m,g){super(new Float32Array(p),m,g)}}var F_=new xe,Cr=new q,jl=new q;class En{constructor(p=new q,m=-1){this.isSphere=!0,this.center=p,this.radius=m}set(p,m){return this.center.copy(p),this.radius=m,this}setFromPoints(p,m){let g=this.center;if(m!==void 0)g.copy(m);else F_.setFromPoints(p).getCenter(g);let _=0;for(let x=0,y=p.length;x<y;x++)_=Math.max(_,g.distanceToSquared(p[x]));return this.radius=Math.sqrt(_),this}copy(p){return this.center.copy(p.center),this.radius=p.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(p){return p.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(p){return p.distanceTo(this.center)-this.radius}intersectsSphere(p){let m=this.radius+p.radius;return p.center.distanceToSquared(this.center)<=m*m}intersectsBox(p){return p.intersectsSphere(this)}intersectsPlane(p){return Math.abs(p.distanceToPoint(this.center))<=this.radius}clampPoint(p,m){let g=this.center.distanceToSquared(p);if(m.copy(p),g>this.radius*this.radius)m.sub(this.center).normalize(),m.multiplyScalar(this.radius).add(this.center);return m}getBoundingBox(p){if(this.isEmpty())return p.makeEmpty(),p;return p.set(this.center,this.center),p.expandByScalar(this.radius),p}applyMatrix4(p){return this.center.applyMatrix4(p),this.radius=this.radius*p.getMaxScaleOnAxis(),this}translate(p){return this.center.add(p),this}expandByPoint(p){if(this.isEmpty())return this.center.copy(p),this.radius=0,this;Cr.subVectors(p,this.center);let m=Cr.lengthSq();if(m>this.radius*this.radius){let g=Math.sqrt(m),_=(g-this.radius)*0.5;this.center.addScaledVector(Cr,_/g),this.radius+=_}return this}union(p){if(p.isEmpty())return this;if(this.isEmpty())return this.copy(p),this;if(this.center.equals(p.center)===!0)this.radius=Math.max(this.radius,p.radius);else jl.subVectors(p.center,this.center).setLength(p.radius),this.expandByPoint(Cr.copy(p.center).add(jl)),this.expandByPoint(Cr.copy(p.center).sub(jl));return this}equals(p){return p.center.equals(this.center)&&p.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(p){return this.radius=p.radius,this.center.fromArray(p.center),this}}var B_=0,Bn=new Jt,Ql=new qe,Fs=new q,Ln=new xe,Pr=new xe,en=new q;class Ye extends Si{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:B_++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(p){if(Array.isArray(p))this.index=new((c_(p))?ma:pa)(p,1);else this.index=p;return this}setIndirect(p,m=0){return this.indirect=p,this.indirectOffset=m,this}getIndirect(){return this.indirect}getAttribute(p){return this.attributes[p]}setAttribute(p,m){return this.attributes[p]=m,this}deleteAttribute(p){return delete this.attributes[p],this}hasAttribute(p){return this.attributes[p]!==void 0}addGroup(p,m,g=0){this.groups.push({start:p,count:m,materialIndex:g})}clearGroups(){this.groups=[]}setDrawRange(p,m){this.drawRange.start=p,this.drawRange.count=m}applyMatrix4(p){let m=this.attributes.position;if(m!==void 0)m.applyMatrix4(p),m.needsUpdate=!0;let g=this.attributes.normal;if(g!==void 0){let x=new jt().getNormalMatrix(p);g.applyNormalMatrix(x),g.needsUpdate=!0}let _=this.attributes.tangent;if(_!==void 0)_.transformDirection(p),_.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(p){return Bn.makeRotationFromQuaternion(p),this.applyMatrix4(Bn),this}rotateX(p){return Bn.makeRotationX(p),this.applyMatrix4(Bn),this}rotateY(p){return Bn.makeRotationY(p),this.applyMatrix4(Bn),this}rotateZ(p){return Bn.makeRotationZ(p),this.applyMatrix4(Bn),this}translate(p,m,g){return Bn.makeTranslation(p,m,g),this.applyMatrix4(Bn),this}scale(p,m,g){return Bn.makeScale(p,m,g),this.applyMatrix4(Bn),this}lookAt(p){return Ql.lookAt(p),Ql.updateMatrix(),this.applyMatrix4(Ql.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Fs).negate(),this.translate(Fs.x,Fs.y,Fs.z),this}setFromPoints(p){let m=this.getAttribute("position");if(m===void 0){let g=[];for(let _=0,x=p.length;_<x;_++){let y=p[_];g.push(y.x,y.y,y.z||0)}this.setAttribute("position",new an(g,3))}else{let g=Math.min(p.length,m.count);for(let _=0;_<g;_++){let x=p[_];m.setXYZ(_,x.x,x.y,x.z||0)}if(p.length>m.count)Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");m.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new xe;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));return}if(p!==void 0){if(this.boundingBox.setFromBufferAttribute(p),m)for(let g=0,_=m.length;g<_;g++){let x=m[g];if(Ln.setFromBufferAttribute(x),this.morphTargetsRelative)en.addVectors(this.boundingBox.min,Ln.min),this.boundingBox.expandByPoint(en),en.addVectors(this.boundingBox.max,Ln.max),this.boundingBox.expandByPoint(en);else this.boundingBox.expandByPoint(Ln.min),this.boundingBox.expandByPoint(Ln.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))$t('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new En;let p=this.attributes.position,m=this.morphAttributes.position;if(p&&p.isGLBufferAttribute){$t("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new q,1/0);return}if(p){let g=this.boundingSphere.center;if(Ln.setFromBufferAttribute(p),m)for(let x=0,y=m.length;x<y;x++){let v=m[x];if(Pr.setFromBufferAttribute(v),this.morphTargetsRelative)en.addVectors(Ln.min,Pr.min),Ln.expandByPoint(en),en.addVectors(Ln.max,Pr.max),Ln.expandByPoint(en);else Ln.expandByPoint(Pr.min),Ln.expandByPoint(Pr.max)}Ln.getCenter(g);let _=0;for(let x=0,y=p.count;x<y;x++)en.fromBufferAttribute(p,x),_=Math.max(_,g.distanceToSquared(en));if(m)for(let x=0,y=m.length;x<y;x++){let v=m[x],b=this.morphTargetsRelative;for(let S=0,M=v.count;S<M;S++){if(en.fromBufferAttribute(v,S),b)Fs.fromBufferAttribute(p,S),en.add(Fs);_=Math.max(_,g.distanceToSquared(en))}}if(this.boundingSphere.radius=Math.sqrt(_),isNaN(this.boundingSphere.radius))$t('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let p=this.index,m=this.attributes;if(p===null||m.position===void 0||m.normal===void 0||m.uv===void 0){$t("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:g,normal:_,uv:x}=m,y=this.getAttribute("tangent");if(y===void 0||y.count!==g.count)y=new Xe(new Float32Array(4*g.count),4),this.setAttribute("tangent",y);let v=[],b=[],S=new Uint8Array(g.count);for(let O=0;O<g.count;O++)v[O]=new q,b[O]=new q;let M=new q,T=new q,w=new q,E=new Kt,A=new Kt,P=new Kt,D=new q,R=new q;function C(O,V,Y){S[O]=S[V]=S[Y]=1,M.fromBufferAttribute(g,O),T.fromBufferAttribute(g,V),w.fromBufferAttribute(g,Y),E.fromBufferAttribute(x,O),A.fromBufferAttribute(x,V),P.fromBufferAttribute(x,Y),T.sub(M),w.sub(M),A.sub(E),P.sub(E);let H=1/(A.x*P.y-P.x*A.y);if(!isFinite(H))return;D.copy(T).multiplyScalar(P.y).addScaledVector(w,-A.y).multiplyScalar(H),R.copy(w).multiplyScalar(A.x).addScaledVector(T,-P.x).multiplyScalar(H),v[O].add(D),v[V].add(D),v[Y].add(D),b[O].add(R),b[V].add(R),b[Y].add(R)}let I=this.groups;if(I.length===0)I=[{start:0,count:p.count}];for(let O=0,V=I.length;O<V;++O){let Y=I[O],{start:H,count:W}=Y;for(let K=H,G=H+W;K<G;K+=3)C(p.getX(K+0),p.getX(K+1),p.getX(K+2))}let U=new q,N=new q,F=new q,z=new q;function L(O){F.fromBufferAttribute(_,O),z.copy(F);let V=v[O];U.copy(V),U.sub(F.multiplyScalar(F.dot(V))).normalize(),N.crossVectors(z,V);let H=N.dot(b[O])<0?-1:1;y.setXYZW(O,U.x,U.y,U.z,H)}for(let O=0,V=g.count;O<V;++O)if(S[O])L(O);this._transformed=!0}computeVertexNormals(){let p=this.index,m=this.getAttribute("position");if(m!==void 0){let g=this.getAttribute("normal");if(g===void 0||g.count!==m.count)g=new Xe(new Float32Array(m.count*3),3),this.setAttribute("normal",g);else for(let w=0,E=g.count;w<E;w++)g.setXYZ(w,0,0,0);let _=new q,x=new q,y=new q,v=new q,b=new q,S=new q,M=new q,T=new q;if(p)for(let w=0,E=p.count;w<E;w+=3){let A=p.getX(w+0),P=p.getX(w+1),D=p.getX(w+2);_.fromBufferAttribute(m,A),x.fromBufferAttribute(m,P),y.fromBufferAttribute(m,D),M.subVectors(y,x),T.subVectors(_,x),M.cross(T),v.fromBufferAttribute(g,A),b.fromBufferAttribute(g,P),S.fromBufferAttribute(g,D),v.add(M),b.add(M),S.add(M),g.setXYZ(A,v.x,v.y,v.z),g.setXYZ(P,b.x,b.y,b.z),g.setXYZ(D,S.x,S.y,S.z)}else for(let w=0,E=m.count;w<E;w+=3)_.fromBufferAttribute(m,w+0),x.fromBufferAttribute(m,w+1),y.fromBufferAttribute(m,w+2),M.subVectors(y,x),T.subVectors(_,x),M.cross(T),g.setXYZ(w+0,M.x,M.y,M.z),g.setXYZ(w+1,M.x,M.y,M.z),g.setXYZ(w+2,M.x,M.y,M.z);this.normalizeNormals(),g.needsUpdate=!0}}normalizeNormals(){let p=this.attributes.normal;for(let m=0,g=p.count;m<g;m++)en.fromBufferAttribute(p,m),en.normalize(),p.setXYZ(m,en.x,en.y,en.z)}toNonIndexed(){function p(v,b){let{array:S,itemSize:M,normalized:T}=v,w=new S.constructor(b.length*M),E=0,A=0;for(let P=0,D=b.length;P<D;P++){if(v.isInterleavedBufferAttribute)E=b[P]*v.data.stride+v.offset;else E=b[P]*M;for(let R=0;R<M;R++)w[A++]=S[E++]}return new Xe(w,M,T)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let m=new Ye,g=this.index.array,_=this.attributes;for(let v in _){let b=_[v],S=p(b,g);m.setAttribute(v,S)}let x=this.morphAttributes;for(let v in x){let b=[],S=x[v];for(let M=0,T=S.length;M<T;M++){let w=S[M],E=p(w,g);b.push(E)}m.morphAttributes[v]=b}m.morphTargetsRelative=this.morphTargetsRelative;let y=this.groups;for(let v=0,b=y.length;v<b;v++){let S=y[v];m.addGroup(S.start,S.count,S.materialIndex)}return m}toJSON(){let p={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(p.uuid=this.uuid,p.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,p.name=this.name,Object.keys(this.userData).length>0)p.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let b=this.parameters;for(let S in b)if(b[S]!==void 0)p[S]=b[S];return p}p.data={attributes:{}};let m=this.index;if(m!==null)p.data.index={type:m.array.constructor.name,array:Array.prototype.slice.call(m.array)};let g=this.attributes;for(let b in g){let S=g[b];p.data.attributes[b]=S.toJSON(p.data)}let _={},x=!1;for(let b in this.morphAttributes){let S=this.morphAttributes[b],M=[];for(let T=0,w=S.length;T<w;T++){let E=S[T];M.push(E.toJSON(p.data))}if(M.length>0)_[b]=M,x=!0}if(x)p.data.morphAttributes=_,p.data.morphTargetsRelative=this.morphTargetsRelative;let y=this.groups;if(y.length>0)p.data.groups=JSON.parse(JSON.stringify(y));let v=this.boundingSphere;if(v!==null)p.data.boundingSphere=v.toJSON();return p}clone(){return new this.constructor().copy(this)}copy(p){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let m={};this.name=p.name;let g=p.index;if(g!==null)this.setIndex(g.clone());let _=p.attributes;for(let S in _){let M=_[S];this.setAttribute(S,M.clone(m))}let x=p.morphAttributes;for(let S in x){let M=[],T=x[S];for(let w=0,E=T.length;w<E;w++)M.push(T[w].clone(m));this.morphAttributes[S]=M}this.morphTargetsRelative=p.morphTargetsRelative;let y=p.groups;for(let S=0,M=y.length;S<M;S++){let T=y[S];this.addGroup(T.start,T.count,T.materialIndex)}let v=p.boundingBox;if(v!==null)this.boundingBox=v.clone();let b=p.boundingSphere;if(b!==null)this.boundingSphere=b.clone();return this.drawRange.start=p.drawRange.start,this.drawRange.count=p.drawRange.count,this.userData=p.userData,this._transformed=p._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ga{constructor(p,m){this.isInterleavedBuffer=!0,this.array=p,this.stride=m,this.count=p!==void 0?p.length/m:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=zi()}onUploadCallback(){}set needsUpdate(p){if(p===!0)this.version++}setUsage(p){return this.usage=p,this}addUpdateRange(p,m){this.updateRanges.push({start:p,count:m})}clearUpdateRanges(){this.updateRanges.length=0}copy(p){return this.array=new p.array.constructor(p.array),this.count=p.count,this.stride=p.stride,this.usage=p.usage,this}copyAt(p,m,g){p*=this.stride,g*=m.stride;for(let _=0,x=this.stride;_<x;_++)this.array[p+_]=m.array[g+_];return this}set(p,m=0){return this.array.set(p,m),this}clone(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Wd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=this.array.slice(0).buffer;let g=new this.array.constructor(p.arrayBuffers[m]),_=new this.constructor(g,this.stride);return _.setUsage(this.usage),_}onUpload(p){return this.onUploadCallback=p,this}toJSON(p){if(p.arrayBuffers===void 0)p.arrayBuffers={};let m=Wd(this.array);if(p.arrayBuffers[m]===void 0)p.arrayBuffers[m]=Array.from(new Uint32Array(this.array.slice(0).buffer));let g={uuid:this.uuid,buffer:m,type:this.array.constructor.name,stride:this.stride};return g.usage=this.usage,g}}function Wd(p){if(p.buffer._uuid===void 0)p.buffer._uuid=zi();if(p.byteOffset===0&&p.byteLength===p.buffer.byteLength)return p.buffer._uuid;return p.buffer._uuid+":"+p.byteOffset+":"+p.byteLength}var Mn=new q;class us{constructor(p,m,g,_=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=p,this.itemSize=m,this.offset=g,this.normalized=_,this._normalizationScale=p!==void 0?ua(p.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(p){this.data.needsUpdate=p}applyMatrix4(p){for(let m=0,g=this.data.count;m<g;m++)Mn.fromBufferAttribute(this,m),Mn.applyMatrix4(p),this.setXYZ(m,Mn.x,Mn.y,Mn.z);return this}applyNormalMatrix(p){for(let m=0,g=this.count;m<g;m++)Mn.fromBufferAttribute(this,m),Mn.applyNormalMatrix(p),this.setXYZ(m,Mn.x,Mn.y,Mn.z);return this}transformDirection(p){for(let m=0,g=this.count;m<g;m++)Mn.fromBufferAttribute(this,m),Mn.transformDirection(p),this.setXYZ(m,Mn.x,Mn.y,Mn.z);return this}getComponent(p,m){let g=this.array[p*this.data.stride+this.offset+m];if(this.normalized)g=this._denormalize(g);return g}setComponent(p,m,g){if(this.normalized)g=this._normalize(g);return this.data.array[p*this.data.stride+this.offset+m]=g,this}setX(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset]=m,this}setY(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+1]=m,this}setZ(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+2]=m,this}setW(p,m){if(this.normalized)m=this._normalize(m);return this.data.array[p*this.data.stride+this.offset+3]=m,this}getX(p){let m=this.data.array[p*this.data.stride+this.offset];if(this.normalized)m=this._denormalize(m);return m}getY(p){let m=this.data.array[p*this.data.stride+this.offset+1];if(this.normalized)m=this._denormalize(m);return m}getZ(p){let m=this.data.array[p*this.data.stride+this.offset+2];if(this.normalized)m=this._denormalize(m);return m}getW(p){let m=this.data.array[p*this.data.stride+this.offset+3];if(this.normalized)m=this._denormalize(m);return m}setXY(p,m,g){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g);return this.data.array[p+0]=m,this.data.array[p+1]=g,this}setXYZ(p,m,g,_){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this}setXYZW(p,m,g,_,x){if(p=p*this.data.stride+this.offset,this.normalized)m=this._normalize(m),g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.data.array[p+0]=m,this.data.array[p+1]=g,this.data.array[p+2]=_,this.data.array[p+3]=x,this}clone(p){if(p===void 0){Or("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return new Xe(new this.array.constructor(m),this.itemSize,this.normalized)}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.clone(p);return new us(p.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(p){if(p===void 0){Or("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let m=[];for(let g=0;g<this.count;g++){let _=g*this.data.stride+this.offset;for(let x=0;x<this.itemSize;x++)m.push(this.data.array[_+x])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:m,normalized:this.normalized}}else{if(p.interleavedBuffers===void 0)p.interleavedBuffers={};if(p.interleavedBuffers[this.data.uuid]===void 0)p.interleavedBuffers[this.data.uuid]=this.data.toJSON(p);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(p){let m=this._normalizationScale;return m!==void 0?Math.max(p/m,-1):fh(p,this.data.array)}_normalize(p){let m=this._normalizationScale;return m!==void 0?Math.round(p*m):ph(p,this.data.array)}}var tc=new q,k_=new q,z_=new jt;class on{constructor(p=new q(1,0,0),m=0){this.isPlane=!0,this.normal=p,this.constant=m}set(p,m){return this.normal.copy(p),this.constant=m,this}setComponents(p,m,g,_){return this.normal.set(p,m,g),this.constant=_,this}setFromNormalAndCoplanarPoint(p,m){return this.normal.copy(p),this.constant=-m.dot(this.normal),this}setFromCoplanarPoints(p,m,g){let _=tc.subVectors(g,m).cross(k_.subVectors(p,m)).normalize();return this.setFromNormalAndCoplanarPoint(_,p),this}copy(p){return this.normal.copy(p.normal),this.constant=p.constant,this}normalize(){let p=1/this.normal.length();return this.normal.multiplyScalar(p),this.constant*=p,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(p){return this.normal.dot(p)+this.constant}distanceToSphere(p){return this.distanceToPoint(p.center)-p.radius}projectPoint(p,m){return m.copy(p).addScaledVector(this.normal,-this.distanceToPoint(p))}intersectLine(p,m,g=!0){let _=p.delta(tc),x=this.normal.dot(_);if(x===0){if(this.distanceToPoint(p.start)===0)return m.copy(p.start);return null}let y=-(p.start.dot(this.normal)+this.constant)/x;if(g===!0&&(y<0||y>1))return null;return m.copy(p.start).addScaledVector(_,y)}intersectsLine(p){let m=this.distanceToPoint(p.start),g=this.distanceToPoint(p.end);return m<0&&g>0||g<0&&m>0}intersectsBox(p){return p.intersectsPlane(this)}intersectsSphere(p){return p.intersectsPlane(this)}coplanarPoint(p){return p.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(p,m){let g=m||z_.getNormalMatrix(p),_=this.coplanarPoint(tc).applyMatrix4(p),x=this.normal.applyMatrix3(g).normalize();return this.constant=-_.dot(x),this}translate(p){return this.constant-=p.dot(this.normal),this}equals(p){return p.normal.equals(this.normal)&&p.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(p){return this.normal.fromArray(p.normal),this.constant=p.constant,this}}var H_=0;class Ti extends Si{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:H_++}),this.uuid=zi(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(p){if(this._alphaTest>0!==p>0)this.version++;this._alphaTest=p}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(p){if(p===void 0)return;for(let m in p){let g=p[m];if(g===void 0){Xt(`Material: parameter '${m}' has value of undefined.`);continue}let _=this[m];if(_===void 0){Xt(`Material: '${m}' is not a property of THREE.${this.type}.`);continue}if(_&&_.isColor)_.set(g);else if(_&&_.isVector2&&(g&&g.isVector2)||_&&_.isEuler&&(g&&g.isEuler)||_&&_.isVector3&&(g&&g.isVector3))_.copy(g);else this[m]=g}}toJSON(p){let m=p===void 0||typeof p==="string";if(m)p={textures:{},images:{}};let g={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(g.uuid=this.uuid,g.type=this.type,g.blending=this.blending,g.side=this.side,g.shadowSide=this.shadowSide,g.vertexColors=this.vertexColors,g.opacity=this.opacity,g.transparent=this.transparent,g.blendSrc=this.blendSrc,g.blendDst=this.blendDst,g.blendEquation=this.blendEquation,g.blendSrcAlpha=this.blendSrcAlpha,g.blendDstAlpha=this.blendDstAlpha,g.blendEquationAlpha=this.blendEquationAlpha,g.blendColor=this.blendColor.getHex(),g.blendAlpha=this.blendAlpha,g.depthFunc=this.depthFunc,g.depthTest=this.depthTest,g.depthWrite=this.depthWrite,g.colorWrite=this.colorWrite,g.clipIntersection=this.clipIntersection,g.clipShadows=this.clipShadows,g.stencilWriteMask=this.stencilWriteMask,g.stencilFunc=this.stencilFunc,g.stencilRef=this.stencilRef,g.stencilFuncMask=this.stencilFuncMask,g.stencilFail=this.stencilFail,g.stencilZFail=this.stencilZFail,g.stencilZPass=this.stencilZPass,g.stencilWrite=this.stencilWrite,g.polygonOffset=this.polygonOffset,g.polygonOffsetFactor=this.polygonOffsetFactor,g.polygonOffsetUnits=this.polygonOffsetUnits,g.dithering=this.dithering,g.alphaTest=this.alphaTest,g.alphaHash=this.alphaHash,g.alphaToCoverage=this.alphaToCoverage,g.premultipliedAlpha=this.premultipliedAlpha,g.forceSinglePass=this.forceSinglePass,g.allowOverride=this.allowOverride,g.visible=this.visible,g.toneMapped=this.toneMapped,g.name=this.name,this.color&&this.color.isColor)g.color=this.color.getHex();if(this.roughness!==void 0)g.roughness=this.roughness;if(this.metalness!==void 0)g.metalness=this.metalness;if(this.sheen!==void 0)g.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)g.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)g.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)g.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)g.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)g.specular=this.specular.getHex();if(this.specularIntensity!==void 0)g.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)g.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)g.shininess=this.shininess;if(this.clearcoat!==void 0)g.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)g.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)g.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)g.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(p).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)g.clearcoatMap=this.clearcoatMap.toJSON(p).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)g.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(p).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)g.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(p).uuid,g.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)g.sheenColorMap=this.sheenColorMap.toJSON(p).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)g.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(p).uuid;if(this.dispersion!==void 0)g.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)g.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)g.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)g.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)g.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)g.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)g.iridescenceMap=this.iridescenceMap.toJSON(p).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)g.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(p).uuid;if(this.anisotropy!==void 0)g.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)g.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)g.anisotropyMap=this.anisotropyMap.toJSON(p).uuid;if(this.map&&this.map.isTexture)g.map=this.map.toJSON(p).uuid;if(this.matcap&&this.matcap.isTexture)g.matcap=this.matcap.toJSON(p).uuid;if(this.alphaMap&&this.alphaMap.isTexture)g.alphaMap=this.alphaMap.toJSON(p).uuid;if(this.lightMap&&this.lightMap.isTexture)g.lightMap=this.lightMap.toJSON(p).uuid,g.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)g.aoMap=this.aoMap.toJSON(p).uuid,g.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)g.bumpMap=this.bumpMap.toJSON(p).uuid,g.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)g.normalMap=this.normalMap.toJSON(p).uuid,g.normalMapType=this.normalMapType,g.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)g.displacementMap=this.displacementMap.toJSON(p).uuid,g.displacementScale=this.displacementScale,g.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)g.roughnessMap=this.roughnessMap.toJSON(p).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)g.metalnessMap=this.metalnessMap.toJSON(p).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)g.emissiveMap=this.emissiveMap.toJSON(p).uuid;if(this.specularMap&&this.specularMap.isTexture)g.specularMap=this.specularMap.toJSON(p).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)g.specularIntensityMap=this.specularIntensityMap.toJSON(p).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)g.specularColorMap=this.specularColorMap.toJSON(p).uuid;if(this.envMap&&this.envMap.isTexture){if(g.envMap=this.envMap.toJSON(p).uuid,this.combine!==void 0)g.combine=this.combine}if(this.envMapRotation!==void 0)g.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)g.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)g.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)g.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)g.gradientMap=this.gradientMap.toJSON(p).uuid;if(this.transmission!==void 0)g.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)g.transmissionMap=this.transmissionMap.toJSON(p).uuid;if(this.thickness!==void 0)g.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)g.thicknessMap=this.thicknessMap.toJSON(p).uuid;if(this.attenuationDistance!==void 0)g.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)g.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)g.size=this.size;if(this.sizeAttenuation!==void 0)g.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)g.clippingPlanes=this.clippingPlanes.map((x)=>x.toJSON());if(this.rotation!==void 0)g.rotation=this.rotation;if(this.depthPacking!==void 0)g.depthPacking=this.depthPacking;if(this.linewidth!==void 0)g.linewidth=this.linewidth;if(this.linecap!==void 0)g.linecap=this.linecap;if(this.linejoin!==void 0)g.linejoin=this.linejoin;if(this.dashSize!==void 0)g.dashSize=this.dashSize;if(this.gapSize!==void 0)g.gapSize=this.gapSize;if(this.scale!==void 0)g.scale=this.scale;if(this.wireframe!==void 0)g.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)g.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)g.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)g.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)g.flatShading=this.flatShading;if(this.fog!==void 0)g.fog=this.fog;if(Object.keys(this.userData).length>0)g.userData=this.userData;function _(x){let y=[];for(let v in x){let b=x[v];delete b.metadata,y.push(b)}return y}if(m){let x=_(p.textures),y=_(p.images);if(x.length>0)g.textures=x;if(y.length>0)g.images=y}return g}fromJSON(p,m){if(p.uuid!==void 0)this.uuid=p.uuid;if(p.name!==void 0)this.name=p.name;if(p.color!==void 0&&this.color!==void 0)this.color.setHex(p.color);if(p.roughness!==void 0)this.roughness=p.roughness;if(p.metalness!==void 0)this.metalness=p.metalness;if(p.sheen!==void 0)this.sheen=p.sheen;if(p.sheenColor!==void 0)this.sheenColor=new se().setHex(p.sheenColor);if(p.sheenRoughness!==void 0)this.sheenRoughness=p.sheenRoughness;if(p.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(p.emissive);if(p.specular!==void 0&&this.specular!==void 0)this.specular.setHex(p.specular);if(p.specularIntensity!==void 0)this.specularIntensity=p.specularIntensity;if(p.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(p.specularColor);if(p.shininess!==void 0)this.shininess=p.shininess;if(p.clearcoat!==void 0)this.clearcoat=p.clearcoat;if(p.clearcoatRoughness!==void 0)this.clearcoatRoughness=p.clearcoatRoughness;if(p.diffuseRoughness!==void 0)this.diffuseRoughness=p.diffuseRoughness;if(p.dispersion!==void 0)this.dispersion=p.dispersion;if(p.retroreflectivity!==void 0)this.retroreflectivity=p.retroreflectivity;if(p.iridescence!==void 0)this.iridescence=p.iridescence;if(p.iridescenceIOR!==void 0)this.iridescenceIOR=p.iridescenceIOR;if(p.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessMinimum;if(p.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=p.iridescenceThicknessMaximum;if(p.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=p.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=p.iridescenceThicknessRange[1];if(p.transmission!==void 0)this.transmission=p.transmission;if(p.thickness!==void 0)this.thickness=p.thickness;if(p.attenuationDistance!==void 0)this.attenuationDistance=p.attenuationDistance;if(p.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(p.attenuationColor);if(p.anisotropy!==void 0)this.anisotropy=p.anisotropy;if(p.anisotropyRotation!==void 0)this.anisotropyRotation=p.anisotropyRotation;if(p.fog!==void 0)this.fog=p.fog;if(p.flatShading!==void 0)this.flatShading=p.flatShading;if(p.blending!==void 0)this.blending=p.blending;if(p.combine!==void 0)this.combine=p.combine;if(p.side!==void 0)this.side=p.side;if(p.shadowSide!==void 0)this.shadowSide=p.shadowSide;if(p.opacity!==void 0)this.opacity=p.opacity;if(p.transparent!==void 0)this.transparent=p.transparent;if(p.alphaTest!==void 0)this.alphaTest=p.alphaTest;if(p.alphaHash!==void 0)this.alphaHash=p.alphaHash;if(p.depthFunc!==void 0)this.depthFunc=p.depthFunc;if(p.depthTest!==void 0)this.depthTest=p.depthTest;if(p.depthWrite!==void 0)this.depthWrite=p.depthWrite;if(p.colorWrite!==void 0)this.colorWrite=p.colorWrite;if(p.clippingPlanes!==void 0)this.clippingPlanes=p.clippingPlanes.map((g)=>new on().fromJSON(g));if(p.clipIntersection!==void 0)this.clipIntersection=p.clipIntersection;if(p.clipShadows!==void 0)this.clipShadows=p.clipShadows;if(p.depthPacking!==void 0)this.depthPacking=p.depthPacking;if(p.blendSrc!==void 0)this.blendSrc=p.blendSrc;if(p.blendDst!==void 0)this.blendDst=p.blendDst;if(p.blendEquation!==void 0)this.blendEquation=p.blendEquation;if(p.blendSrcAlpha!==void 0)this.blendSrcAlpha=p.blendSrcAlpha;if(p.blendDstAlpha!==void 0)this.blendDstAlpha=p.blendDstAlpha;if(p.blendEquationAlpha!==void 0)this.blendEquationAlpha=p.blendEquationAlpha;if(p.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(p.blendColor);if(p.blendAlpha!==void 0)this.blendAlpha=p.blendAlpha;if(p.stencilWriteMask!==void 0)this.stencilWriteMask=p.stencilWriteMask;if(p.stencilFunc!==void 0)this.stencilFunc=p.stencilFunc;if(p.stencilRef!==void 0)this.stencilRef=p.stencilRef;if(p.stencilFuncMask!==void 0)this.stencilFuncMask=p.stencilFuncMask;if(p.stencilFail!==void 0)this.stencilFail=p.stencilFail;if(p.stencilZFail!==void 0)this.stencilZFail=p.stencilZFail;if(p.stencilZPass!==void 0)this.stencilZPass=p.stencilZPass;if(p.stencilWrite!==void 0)this.stencilWrite=p.stencilWrite;if(p.wireframe!==void 0)this.wireframe=p.wireframe;if(p.wireframeLinewidth!==void 0)this.wireframeLinewidth=p.wireframeLinewidth;if(p.wireframeLinecap!==void 0)this.wireframeLinecap=p.wireframeLinecap;if(p.wireframeLinejoin!==void 0)this.wireframeLinejoin=p.wireframeLinejoin;if(p.rotation!==void 0)this.rotation=p.rotation;if(p.linewidth!==void 0)this.linewidth=p.linewidth;if(p.linecap!==void 0)this.linecap=p.linecap;if(p.linejoin!==void 0)this.linejoin=p.linejoin;if(p.dashSize!==void 0)this.dashSize=p.dashSize;if(p.gapSize!==void 0)this.gapSize=p.gapSize;if(p.scale!==void 0)this.scale=p.scale;if(p.polygonOffset!==void 0)this.polygonOffset=p.polygonOffset;if(p.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=p.polygonOffsetFactor;if(p.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=p.polygonOffsetUnits;if(p.dithering!==void 0)this.dithering=p.dithering;if(p.alphaToCoverage!==void 0)this.alphaToCoverage=p.alphaToCoverage;if(p.premultipliedAlpha!==void 0)this.premultipliedAlpha=p.premultipliedAlpha;if(p.forceSinglePass!==void 0)this.forceSinglePass=p.forceSinglePass;if(p.allowOverride!==void 0)this.allowOverride=p.allowOverride;if(p.visible!==void 0)this.visible=p.visible;if(p.toneMapped!==void 0)this.toneMapped=p.toneMapped;if(p.userData!==void 0)this.userData=p.userData;if(p.vertexColors!==void 0)if(typeof p.vertexColors==="number")this.vertexColors=p.vertexColors>0;else this.vertexColors=p.vertexColors;if(p.size!==void 0)this.size=p.size;if(p.sizeAttenuation!==void 0)this.sizeAttenuation=p.sizeAttenuation;if(p.map!==void 0)this.map=m[p.map]||null;if(p.matcap!==void 0)this.matcap=m[p.matcap]||null;if(p.alphaMap!==void 0)this.alphaMap=m[p.alphaMap]||null;if(p.bumpMap!==void 0)this.bumpMap=m[p.bumpMap]||null;if(p.bumpScale!==void 0)this.bumpScale=p.bumpScale;if(p.normalMap!==void 0)this.normalMap=m[p.normalMap]||null;if(p.normalMapType!==void 0)this.normalMapType=p.normalMapType;if(p.normalScale!==void 0){let g=p.normalScale;if(Array.isArray(g)===!1)g=[g,g];this.normalScale=new Kt().fromArray(g)}if(p.displacementMap!==void 0)this.displacementMap=m[p.displacementMap]||null;if(p.displacementScale!==void 0)this.displacementScale=p.displacementScale;if(p.displacementBias!==void 0)this.displacementBias=p.displacementBias;if(p.roughnessMap!==void 0)this.roughnessMap=m[p.roughnessMap]||null;if(p.metalnessMap!==void 0)this.metalnessMap=m[p.metalnessMap]||null;if(p.emissiveMap!==void 0)this.emissiveMap=m[p.emissiveMap]||null;if(p.emissiveIntensity!==void 0)this.emissiveIntensity=p.emissiveIntensity;if(p.specularMap!==void 0)this.specularMap=m[p.specularMap]||null;if(p.specularIntensityMap!==void 0)this.specularIntensityMap=m[p.specularIntensityMap]||null;if(p.specularColorMap!==void 0)this.specularColorMap=m[p.specularColorMap]||null;if(p.envMap!==void 0)this.envMap=m[p.envMap]||null;if(p.envMapRotation!==void 0)this.envMapRotation.fromArray(p.envMapRotation);if(p.envMapIntensity!==void 0)this.envMapIntensity=p.envMapIntensity;if(p.reflectivity!==void 0)this.reflectivity=p.reflectivity;if(p.refractionRatio!==void 0)this.refractionRatio=p.refractionRatio;if(p.lightMap!==void 0)this.lightMap=m[p.lightMap]||null;if(p.lightMapIntensity!==void 0)this.lightMapIntensity=p.lightMapIntensity;if(p.aoMap!==void 0)this.aoMap=m[p.aoMap]||null;if(p.aoMapIntensity!==void 0)this.aoMapIntensity=p.aoMapIntensity;if(p.gradientMap!==void 0)this.gradientMap=m[p.gradientMap]||null;if(p.clearcoatMap!==void 0)this.clearcoatMap=m[p.clearcoatMap]||null;if(p.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=m[p.clearcoatRoughnessMap]||null;if(p.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=m[p.clearcoatNormalMap]||null;if(p.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Kt().fromArray(p.clearcoatNormalScale);if(p.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=m[p.diffuseRoughnessMap]||null;if(p.iridescenceMap!==void 0)this.iridescenceMap=m[p.iridescenceMap]||null;if(p.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=m[p.iridescenceThicknessMap]||null;if(p.transmissionMap!==void 0)this.transmissionMap=m[p.transmissionMap]||null;if(p.thicknessMap!==void 0)this.thicknessMap=m[p.thicknessMap]||null;if(p.anisotropyMap!==void 0)this.anisotropyMap=m[p.anisotropyMap]||null;if(p.sheenColorMap!==void 0)this.sheenColorMap=m[p.sheenColorMap]||null;if(p.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=m[p.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(p){this.name=p.name,this.blending=p.blending,this.side=p.side,this.vertexColors=p.vertexColors,this.opacity=p.opacity,this.transparent=p.transparent,this.blendSrc=p.blendSrc,this.blendDst=p.blendDst,this.blendEquation=p.blendEquation,this.blendSrcAlpha=p.blendSrcAlpha,this.blendDstAlpha=p.blendDstAlpha,this.blendEquationAlpha=p.blendEquationAlpha,this.blendColor.copy(p.blendColor),this.blendAlpha=p.blendAlpha,this.depthFunc=p.depthFunc,this.depthTest=p.depthTest,this.depthWrite=p.depthWrite,this.stencilWriteMask=p.stencilWriteMask,this.stencilFunc=p.stencilFunc,this.stencilRef=p.stencilRef,this.stencilFuncMask=p.stencilFuncMask,this.stencilFail=p.stencilFail,this.stencilZFail=p.stencilZFail,this.stencilZPass=p.stencilZPass,this.stencilWrite=p.stencilWrite;let m=p.clippingPlanes,g=null;if(m!==null){let _=m.length;g=Array(_);for(let x=0;x!==_;++x)g[x]=m[x].clone()}return this.clippingPlanes=g,this.clipIntersection=p.clipIntersection,this.clipShadows=p.clipShadows,this.shadowSide=p.shadowSide,this.colorWrite=p.colorWrite,this.precision=p.precision,this.polygonOffset=p.polygonOffset,this.polygonOffsetFactor=p.polygonOffsetFactor,this.polygonOffsetUnits=p.polygonOffsetUnits,this.dithering=p.dithering,this.alphaTest=p.alphaTest,this.alphaHash=p.alphaHash,this.alphaToCoverage=p.alphaToCoverage,this.premultipliedAlpha=p.premultipliedAlpha,this.forceSinglePass=p.forceSinglePass,this.allowOverride=p.allowOverride,this.visible=p.visible,this.toneMapped=p.toneMapped,this.userData=JSON.parse(JSON.stringify(p.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(p){if(p===!0)this.version++}}var gi=new q,ec=new q,Do=new q,Uo=new q;class Hi{constructor(p=new q,m=new q(0,0,-1)){this.origin=p,this.direction=m}set(p,m){return this.origin.copy(p),this.direction.copy(m),this}copy(p){return this.origin.copy(p.origin),this.direction.copy(p.direction),this}at(p,m){return m.copy(this.origin).addScaledVector(this.direction,p)}lookAt(p){return this.direction.copy(p).sub(this.origin).normalize(),this}recast(p){return this.origin.copy(this.at(p,gi)),this}closestPointToPoint(p,m){m.subVectors(p,this.origin);let g=m.dot(this.direction);if(g<0)return m.copy(this.origin);return m.copy(this.origin).addScaledVector(this.direction,g)}distanceToPoint(p){return Math.sqrt(this.distanceSqToPoint(p))}distanceSqToPoint(p){let m=gi.subVectors(p,this.origin).dot(this.direction);if(m<0)return this.origin.distanceToSquared(p);return gi.copy(this.origin).addScaledVector(this.direction,m),gi.distanceToSquared(p)}distanceSqToSegment(p,m,g,_){ec.copy(p).add(m).multiplyScalar(0.5),Do.copy(m).sub(p).normalize(),Uo.copy(this.origin).sub(ec);let x=p.distanceTo(m)*0.5,y=-this.direction.dot(Do),v=Uo.dot(this.direction),b=-Uo.dot(Do),S=Uo.lengthSq(),M=Math.abs(1-y*y),T,w,E,A;if(M>0)if(T=y*b-v,w=y*v-b,A=x*M,T>=0)if(w>=-A)if(w<=A){let P=1/M;T*=P,w*=P,E=T*(T+y*w+2*v)+w*(y*T+w+2*b)+S}else w=x,T=Math.max(0,-(y*w+v)),E=-T*T+w*(w+2*b)+S;else w=-x,T=Math.max(0,-(y*w+v)),E=-T*T+w*(w+2*b)+S;else if(w<=-A)T=Math.max(0,-(-y*x+v)),w=T>0?-x:Math.min(Math.max(-x,-b),x),E=-T*T+w*(w+2*b)+S;else if(w<=A)T=0,w=Math.min(Math.max(-x,-b),x),E=w*(w+2*b)+S;else T=Math.max(0,-(y*x+v)),w=T>0?x:Math.min(Math.max(-x,-b),x),E=-T*T+w*(w+2*b)+S;else w=y>0?-x:x,T=Math.max(0,-(y*w+v)),E=-T*T+w*(w+2*b)+S;if(g)g.copy(this.origin).addScaledVector(this.direction,T);if(_)_.copy(ec).addScaledVector(Do,w);return E}intersectSphere(p,m){if(p.radius<0)return null;gi.subVectors(p.center,this.origin);let g=gi.dot(this.direction),_=gi.dot(gi)-g*g,x=p.radius*p.radius;if(_>x)return null;let y=Math.sqrt(x-_),v=g-y,b=g+y;if(b<0)return null;if(v<0)return this.at(b,m);return this.at(v,m)}intersectsSphere(p){if(p.radius<0)return!1;return this.distanceSqToPoint(p.center)<=p.radius*p.radius}distanceToPlane(p){let m=p.normal.dot(this.direction);if(m===0){if(p.distanceToPoint(this.origin)===0)return 0;return null}let g=-(this.origin.dot(p.normal)+p.constant)/m;return g>=0?g:null}intersectPlane(p,m){let g=this.distanceToPlane(p);if(g===null)return null;return this.at(g,m)}intersectsPlane(p){let m=p.distanceToPoint(this.origin);if(m===0)return!0;if(p.normal.dot(this.direction)*m<0)return!0;return!1}intersectBox(p,m){let g,_,x,y,v,b,S=1/this.direction.x,M=1/this.direction.y,T=1/this.direction.z,w=this.origin;if(S>=0)g=(p.min.x-w.x)*S,_=(p.max.x-w.x)*S;else g=(p.max.x-w.x)*S,_=(p.min.x-w.x)*S;if(M>=0)x=(p.min.y-w.y)*M,y=(p.max.y-w.y)*M;else x=(p.max.y-w.y)*M,y=(p.min.y-w.y)*M;if(g>y||x>_)return null;if(x>g||isNaN(g))g=x;if(y<_||isNaN(_))_=y;if(T>=0)v=(p.min.z-w.z)*T,b=(p.max.z-w.z)*T;else v=(p.max.z-w.z)*T,b=(p.min.z-w.z)*T;if(g>b||v>_)return null;if(v>g||g!==g)g=v;if(b<_||_!==_)_=b;if(_<0)return null;return this.at(g>=0?g:_,m)}intersectsBox(p){return this.intersectBox(p,gi)!==null}intersectTriangle(p,m,g,_,x){let y=this.origin,v=this.direction,{x:b,y:S,z:M}=v,T=p.x-y.x,w=p.y-y.y,E=p.z-y.z,A=m.x-y.x,P=m.y-y.y,D=m.z-y.z,R=g.x-y.x,C=g.y-y.y,I=g.z-y.z,U=Math.abs(b),N=Math.abs(S),F=Math.abs(M),z,L,O,V,Y,H,W,K,G,Q,st,tt;if(U>=N&&U>=F)if(O=b,H=T,G=A,tt=R,b>=0)z=S,L=M,V=w,Y=E,W=P,K=D,Q=C,st=I;else z=M,L=S,V=E,Y=w,W=D,K=P,Q=I,st=C;else if(N>=F)if(O=S,H=w,G=P,tt=C,S>=0)z=M,L=b,V=E,Y=T,W=D,K=A,Q=I,st=R;else z=b,L=M,V=T,Y=E,W=A,K=D,Q=R,st=I;else if(O=M,H=E,G=D,tt=I,M>=0)z=b,L=S,V=T,Y=w,W=A,K=P,Q=R,st=C;else z=S,L=b,V=w,Y=T,W=P,K=A,Q=C,st=R;if(O===0)return null;let mt=z/O,rt=L/O,ht=1/O,xt=V-mt*H,At=Y-rt*H,at=W-mt*G,pt=K-rt*G,Pt=Q-mt*tt,zt=st-rt*tt,Ht=Pt*pt-zt*at,Dt=xt*zt-At*Pt,Qt=at*At-pt*xt;if(_){if(Ht<0||Dt<0||Qt<0)return null}else if((Ht<0||Dt<0||Qt<0)&&(Ht>0||Dt>0||Qt>0))return null;let te=Ht+Dt+Qt;if(te===0)return null;let Ut=ht*(Ht*H+Dt*G+Qt*tt);if(te>0?Ut<0:Ut>0)return null;return this.at(Ut/te,x)}applyMatrix4(p){return this.origin.applyMatrix4(p),this.direction.transformDirection(p),this}equals(p){return p.origin.equals(this.origin)&&p.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class xh extends Ti{constructor(p){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yi,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.fog=p.fog,this}}var Xd=new Jt,is=new Hi,Oo=new En,qd=new q,Fo=new q,Bo=new q,ko=new q,nc=new q,zo=new q,Yd=new q,Ho=new q;class nn extends qe{constructor(p=new Ye,m=new xh){super();this.isMesh=!0,this.type="Mesh",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}getVertexPosition(p,m){let g=this.geometry,_=g.attributes.position,x=g.morphAttributes.position,y=g.morphTargetsRelative;m.fromBufferAttribute(_,p);let v=this.morphTargetInfluences;if(x&&v){zo.set(0,0,0);for(let b=0,S=x.length;b<S;b++){let M=v[b],T=x[b];if(M===0)continue;if(nc.fromBufferAttribute(T,p),y)zo.addScaledVector(nc,M);else zo.addScaledVector(nc.sub(m),M)}m.add(zo)}return m}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.material,x=this.matrixWorld;if(_===void 0)return;if(g.boundingSphere===null)g.computeBoundingSphere();if(Oo.copy(g.boundingSphere),Oo.applyMatrix4(x),is.copy(p.ray).recast(p.near),Oo.containsPoint(is.origin)===!1){if(is.intersectSphere(Oo,qd)===null)return;if(is.origin.distanceToSquared(qd)>(p.far-p.near)**2)return}if(Xd.copy(x).invert(),is.copy(p.ray).applyMatrix4(Xd),g.boundingBox!==null){if(is.intersectsBox(g.boundingBox)===!1)return}this._computeIntersections(p,m,is)}_computeIntersections(p,m,g){let _,x=this.geometry,y=this.material,v=x.index,b=x.attributes.position,S=x.attributes.uv,M=x.attributes.uv1,T=x.attributes.normal,{groups:w,drawRange:E}=x;if(v!==null)if(Array.isArray(y))for(let A=0,P=w.length;A<P;A++){let D=w[A],R=y[D.materialIndex],C=Math.max(D.start,E.start),I=Math.min(v.count,Math.min(D.start+D.count,E.start+E.count));for(let U=C,N=I;U<N;U+=3){let F=v.getX(U),z=v.getX(U+1),L=v.getX(U+2);if(_=Go(this,R,p,g,S,M,T,F,z,L),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=D.materialIndex,m.push(_)}}else{let A=Math.max(0,E.start),P=Math.min(v.count,E.start+E.count);for(let D=A,R=P;D<R;D+=3){let C=v.getX(D),I=v.getX(D+1),U=v.getX(D+2);if(_=Go(this,y,p,g,S,M,T,C,I,U),_)_.faceIndex=Math.floor(D/3),m.push(_)}}else if(b!==void 0)if(Array.isArray(y))for(let A=0,P=w.length;A<P;A++){let D=w[A],R=y[D.materialIndex],C=Math.max(D.start,E.start),I=Math.min(b.count,Math.min(D.start+D.count,E.start+E.count));for(let U=C,N=I;U<N;U+=3){let F=U,z=U+1,L=U+2;if(_=Go(this,R,p,g,S,M,T,F,z,L),_)_.faceIndex=Math.floor(U/3),_.face.materialIndex=D.materialIndex,m.push(_)}}else{let A=Math.max(0,E.start),P=Math.min(b.count,E.start+E.count);for(let D=A,R=P;D<R;D+=3){let C=D,I=D+1,U=D+2;if(_=Go(this,y,p,g,S,M,T,C,I,U),_)_.faceIndex=Math.floor(D/3),m.push(_)}}}}function G_(p,m,g,_,x,y,v,b){let S;if(m.side===1)S=_.intersectTriangle(v,y,x,!0,b);else S=_.intersectTriangle(x,y,v,m.side===0,b);if(S===null)return null;Ho.copy(b),Ho.applyMatrix4(p.matrixWorld);let M=g.ray.origin.distanceTo(Ho);if(M<g.near||M>g.far)return null;return{distance:M,point:Ho.clone(),object:p}}function Go(p,m,g,_,x,y,v,b,S,M){p.getVertexPosition(b,Fo),p.getVertexPosition(S,Bo),p.getVertexPosition(M,ko);let T=G_(p,m,g,_,Fo,Bo,ko,Yd);if(T){let w=new q;if(Ve.getBarycoord(Yd,Fo,Bo,ko,w),x)T.uv=Ve.getInterpolatedAttribute(x,b,S,M,w,new Kt);if(y)T.uv1=Ve.getInterpolatedAttribute(y,b,S,M,w,new Kt);if(v){if(T.normal=Ve.getInterpolatedAttribute(v,b,S,M,w,new q),T.normal.dot(_.direction)>0)T.normal.multiplyScalar(-1)}let E={a:b,b:S,c:M,normal:new q,materialIndex:0};Ve.getNormal(Fo,Bo,ko,E.normal),T.face=E,T.barycoord=w}return T}class Ws extends We{constructor(p=null,m=1,g=1,_,x,y,v,b,S=1003,M=1003,T,w){super(null,y,v,b,S,M,_,x,T,w);this.isDataTexture=!0,this.image={data:p,width:m,height:g},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var ss=new En,V_=new Kt(0.5,0.5),Vo=new q;class Oi{constructor(p=new on,m=new on,g=new on,_=new on,x=new on,y=new on){this.planes=[p,m,g,_,x,y]}set(p,m,g,_,x,y){let v=this.planes;return v[0].copy(p),v[1].copy(m),v[2].copy(g),v[3].copy(_),v[4].copy(x),v[5].copy(y),this}copy(p){let m=this.planes;for(let g=0;g<6;g++)m[g].copy(p.planes[g]);return this}setFromProjectionMatrix(p,m=2000,g=!1){let _=this.planes,x=p.elements,y=x[0],v=x[1],b=x[2],S=x[3],M=x[4],T=x[5],w=x[6],E=x[7],A=x[8],P=x[9],D=x[10],R=x[11],C=x[12],I=x[13],U=x[14],N=x[15];if(_[0].setComponents(S-y,E-M,R-A,N-C).normalize(),_[1].setComponents(S+y,E+M,R+A,N+C).normalize(),_[2].setComponents(S+v,E+T,R+P,N+I).normalize(),_[3].setComponents(S-v,E-T,R-P,N-I).normalize(),g)_[4].setComponents(b,w,D,U).normalize(),_[5].setComponents(S-b,E-w,R-D,N-U).normalize();else if(_[4].setComponents(S-b,E-w,R-D,N-U).normalize(),m===2000)_[5].setComponents(S+b,E+w,R+D,N+U).normalize();else if(m===2001)_[5].setComponents(b,w,D,U).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+m);return this}intersectsObject(p){if(p.boundingSphere!==void 0){if(p.boundingSphere===null)p.computeBoundingSphere();ss.copy(p.boundingSphere).applyMatrix4(p.matrixWorld)}else{let m=p.geometry;if(m.boundingSphere===null)m.computeBoundingSphere();ss.copy(m.boundingSphere).applyMatrix4(p.matrixWorld)}return this.intersectsSphere(ss)}intersectsSprite(p){ss.center.set(0,0,0);let m=V_.distanceTo(p.center);return ss.radius=0.7071067811865476+m,ss.applyMatrix4(p.matrixWorld),this.intersectsSphere(ss)}intersectsSphere(p){let m=this.planes,g=p.center,_=-p.radius;for(let x=0;x<6;x++)if(m[x].distanceToPoint(g)<_)return!1;return!0}intersectsBox(p){let m=this.planes;for(let g=0;g<6;g++){let _=m[g];if(Vo.x=_.normal.x>0?p.max.x:p.min.x,Vo.y=_.normal.y>0?p.max.y:p.min.y,Vo.z=_.normal.z>0?p.max.z:p.min.z,_.distanceToPoint(Vo)<0)return!1}return!0}containsPoint(p){let m=this.planes;for(let g=0;g<6;g++)if(m[g].distanceToPoint(p)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var Zd=new Jt;class Zr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(p){let m=p.cameras,g=this._frustums;for(let _=0;_<m.length;_++){let x=m[_];if(Zd.multiplyMatrices(x.projectionMatrix,x.matrixWorldInverse),g[_]===void 0)g[_]=new Oi;g[_].setFromProjectionMatrix(Zd,x.coordinateSystem,x.reversedDepth)}return this._count=m.length,this}getFrustum(p){return this._frustums[p]}intersectsObject(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsObject(p))return!0;return!1}intersectsSprite(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSprite(p))return!0;return!1}intersectsSphere(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsSphere(p))return!0;return!1}intersectsBox(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].intersectsBox(p))return!0;return!1}containsPoint(p){let m=this._frustums;for(let g=0;g<this._count;g++)if(m[g].containsPoint(p))return!0;return!1}copy(p){this.coordinateSystem=p.coordinateSystem;let m=this._frustums,g=p._frustums;for(let _=0;_<p._count;_++){if(m[_]===void 0)m[_]=new Oi;m[_].copy(g[_])}return this._count=p._count,this}clone(){return new Zr().copy(this)}}function ic(p,m){return p-m}function W_(p,m){return p.z-m.z}function X_(p,m){return m.z-p.z}class pp{constructor(){this.index=0,this.pool=[],this.list=[]}push(p,m,g,_){let x=this.pool,y=this.list;if(this.index>=x.length)x.push({start:-1,count:-1,z:-1,index:-1});let v=x[this.index];y.push(v),this.index++,v.start=p,v.count=m,v.z=g,v.index=_}reset(){this.list.length=0,this.index=0}}var wn=new Jt,q_=new se(1,1,1),Y_=new Oi,Z_=new Zr,Wo=new xe,rs=new En,sc=new q,$d=new q,Kd=new q,$_=new q,rc=new pp,mn=new nn,Xo=[];function K_(p,m,g=0){let _=m.itemSize;if(p.isInterleavedBufferAttribute||p.array.constructor!==m.array.constructor){let x=p.count;for(let y=0;y<x;y++)for(let v=0;v<_;v++)m.setComponent(y+g,v,p.getComponent(y,v))}else m.array.set(p.array,g*_);m.needsUpdate=!0}function ni(p,m){if(p.constructor!==m.constructor){let g=Math.min(p.length,m.length);for(let _=0;_<g;_++)m[_]=p[_]}else{let g=Math.min(p.length,m.length);m.set(new p.constructor(p.buffer,0,g))}}class _a extends nn{constructor(p,m,g=m*2,_){super(new Ye,_);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=p,this._maxVertexCount=m,this._maxIndexCount=g,this._multiDrawCounts=new Int32Array(p),this._multiDrawStarts=new Int32Array(p),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(p),this._mergedDrawStarts=new Int32Array(p),this._mergedDrawInstanceCounts=new Int32Array(p),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let p=Math.sqrt(this._maxInstanceCount*4);p=Math.ceil(p/4)*4,p=Math.max(p,4);let m=new Float32Array(p*p*4),g=new Ws(m,p,p,1023,1015);this._matricesTexture=g}_initIndirectTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Uint32Array(p*p),g=new Ws(m,p,p,1029,1014);this._indirectTexture=g}_initColorsTexture(){let p=Math.sqrt(this._maxInstanceCount);p=Math.ceil(p);let m=new Float32Array(p*p*4).fill(1),g=new Ws(m,p,p,1023,1015);g.colorSpace=he.workingColorSpace,this._colorsTexture=g}_initializeGeometry(p){let m=this.geometry,g=this._maxVertexCount,_=this._maxIndexCount;if(this._geometryInitialized===!1){for(let x in p.attributes){let y=p.getAttribute(x),{array:v,itemSize:b,normalized:S}=y,M=new v.constructor(g*b),T=new Xe(M,b,S);m.setAttribute(x,T)}if(p.getIndex()!==null){let x=g>65535?new Uint32Array(_):new Uint16Array(_);m.setIndex(new Xe(x,1))}this._geometryInitialized=!0}}_validateGeometry(p){let m=this.geometry;if(Boolean(p.getIndex())!==Boolean(m.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let g in m.attributes){if(!p.hasAttribute(g))throw Error(`THREE.BatchedMesh: Added geometry missing "${g}". All geometries must have consistent attributes.`);let _=p.getAttribute(g),x=m.getAttribute(g);if(_.itemSize!==x.itemSize||_.normalized!==x.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${g}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(p){let m=this._instanceInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${p}. Instance is either out of range or has been deleted.`)}validateGeometryId(p){let m=this._geometryInfo;if(p<0||p>=m.length||m[p].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${p}. Geometry is either out of range or has been deleted.`)}setCustomSort(p){return this.customSort=p,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new xe;let p=this.boundingBox,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,wn),this.getBoundingBoxAt(x,Wo).applyMatrix4(wn),p.union(Wo)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new En;let p=this.boundingSphere,m=this._instanceInfo;p.makeEmpty();for(let g=0,_=m.length;g<_;g++){if(m[g].active===!1)continue;let x=m[g].geometryIndex;this.getMatrixAt(g,wn),this.getBoundingSphereAt(x,rs).applyMatrix4(wn),p.union(rs)}}addInstance(p){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let g={visible:!0,active:!0,geometryIndex:p},_=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(ic),_=this._availableInstanceIds.shift(),this._instanceInfo[_]=g;else _=this._instanceInfo.length,this._instanceInfo.push(g);let x=this._matricesTexture;wn.identity().toArray(x.image.data,_*16),x.needsUpdate=!0;let y=this._colorsTexture;if(y)q_.toArray(y.image.data,_*4),y.needsUpdate=!0;return this._visibilityChanged=!0,_}addGeometry(p,m=-1,g=-1){this._initializeGeometry(p),this._validateGeometry(p);let _={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},x=this._geometryInfo;_.vertexStart=this._nextVertexStart,_.reservedVertexCount=m===-1?p.getAttribute("position").count:m;let y=p.getIndex();if(y!==null)_.indexStart=this._nextIndexStart,_.reservedIndexCount=g===-1?y.count:g;if(_.indexStart!==-1&&_.indexStart+_.reservedIndexCount>this._maxIndexCount||_.vertexStart+_.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let b;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(ic),b=this._availableGeometryIds.shift(),x[b]=_;else b=this._geometryCount,this._geometryCount++,x.push(_);return this.setGeometryAt(b,p),this._nextIndexStart=_.indexStart+_.reservedIndexCount,this._nextVertexStart=_.vertexStart+_.reservedVertexCount,b}setGeometryAt(p,m){if(p>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(m);let g=this.geometry,_=g.getIndex()!==null,x=g.getIndex(),y=m.getIndex(),v=this._geometryInfo[p];if(_&&y.count>v.reservedIndexCount||m.attributes.position.count>v.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:b,reservedVertexCount:S}=v;v.vertexCount=m.getAttribute("position").count;for(let M in g.attributes){let T=m.getAttribute(M),w=g.getAttribute(M);K_(T,w,b);let E=T.itemSize;for(let A=T.count,P=S;A<P;A++){let D=b+A;for(let R=0;R<E;R++)w.setComponent(D,R,0)}w.needsUpdate=!0,w.addUpdateRange(b*E,S*E)}if(_){let{indexStart:M,reservedIndexCount:T}=v;v.indexCount=m.getIndex().count;for(let w=0;w<y.count;w++)x.setX(M+w,b+y.getX(w));for(let w=y.count,E=T;w<E;w++)x.setX(M+w,b);x.needsUpdate=!0,x.addUpdateRange(M,v.reservedIndexCount)}if(v.start=_?v.indexStart:v.vertexStart,v.count=_?v.indexCount:v.vertexCount,v.boundingBox=null,m.boundingBox!==null)v.boundingBox=m.boundingBox.clone();if(v.boundingSphere=null,m.boundingSphere!==null)v.boundingSphere=m.boundingSphere.clone();return this._visibilityChanged=!0,p}deleteGeometry(p){let m=this._geometryInfo;if(p>=m.length||m[p].active===!1)return this;let g=this._instanceInfo;for(let _=0,x=g.length;_<x;_++)if(g[_].active&&g[_].geometryIndex===p)this.deleteInstance(_);return m[p].active=!1,this._availableGeometryIds.push(p),this._visibilityChanged=!0,this}deleteInstance(p){return this.validateInstanceId(p),this._instanceInfo[p].active=!1,this._availableInstanceIds.push(p),this._visibilityChanged=!0,this}optimize(){let p=0,m=0,g=this._geometryInfo,_=g.map((y,v)=>v).sort((y,v)=>g[y].vertexStart-g[v].vertexStart),x=this.geometry;for(let y=0,v=g.length;y<v;y++){let b=_[y],S=g[b];if(S.active===!1)continue;if(x.index!==null){if(S.indexStart!==m){let{indexStart:M,vertexStart:T,reservedIndexCount:w}=S,E=x.index,A=E.array,P=p-T;for(let D=M;D<M+w;D++)A[D]=A[D]+P;E.array.copyWithin(m,M,M+w),E.addUpdateRange(m,w),E.needsUpdate=!0,S.indexStart=m}m+=S.reservedIndexCount}if(S.vertexStart!==p){let{vertexStart:M,reservedVertexCount:T}=S,w=x.attributes;for(let E in w){let A=w[E],{array:P,itemSize:D}=A;P.copyWithin(p*D,M*D,(M+T)*D),A.addUpdateRange(p*D,T*D),A.needsUpdate=!0}S.vertexStart=p}p+=S.reservedVertexCount,S.start=x.index?S.indexStart:S.vertexStart}return this._nextIndexStart=m,this._nextVertexStart=p,this._visibilityChanged=!0,this}getBoundingBoxAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingBox===null){let x=new xe,y=g.index,v=g.attributes.position;for(let b=_.start,S=_.start+_.count;b<S;b++){let M=b;if(y)M=y.getX(M);x.expandByPoint(sc.fromBufferAttribute(v,M))}_.boundingBox=x}return m.copy(_.boundingBox),m}getBoundingSphereAt(p,m){if(p>=this._geometryCount)return null;let g=this.geometry,_=this._geometryInfo[p];if(_.boundingSphere===null){let x=new En;this.getBoundingBoxAt(p,Wo),Wo.getCenter(x.center);let y=g.index,v=g.attributes.position,b=0;for(let S=_.start,M=_.start+_.count;S<M;S++){let T=S;if(y)T=y.getX(T);sc.fromBufferAttribute(v,T),b=Math.max(b,x.center.distanceToSquared(sc))}x.radius=Math.sqrt(b),_.boundingSphere=x}return m.copy(_.boundingSphere),m}setMatrixAt(p,m){this.validateInstanceId(p);let g=this._matricesTexture,_=this._matricesTexture.image.data;return m.toArray(_,p*16),g.needsUpdate=!0,this}getMatrixAt(p,m){return this.validateInstanceId(p),m.fromArray(this._matricesTexture.image.data,p*16)}setColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)this._initColorsTexture();return m.toArray(this._colorsTexture.image.data,p*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(p,m){if(this.validateInstanceId(p),this._colorsTexture===null)if(m.isVector4)return m.set(1,1,1,1);else return m.setRGB(1,1,1);else return m.fromArray(this._colorsTexture.image.data,p*4)}setVisibleAt(p,m){if(this.validateInstanceId(p),this._instanceInfo[p].visible===m)return this;return this._instanceInfo[p].visible=m,this._visibilityChanged=!0,this}getVisibleAt(p){return this.validateInstanceId(p),this._instanceInfo[p].visible}setGeometryIdAt(p,m){return this.validateInstanceId(p),this.validateGeometryId(m),this._instanceInfo[p].geometryIndex=m,this._visibilityChanged=!0,this}getGeometryIdAt(p){return this.validateInstanceId(p),this._instanceInfo[p].geometryIndex}getGeometryRangeAt(p,m={}){this.validateGeometryId(p);let g=this._geometryInfo[p];return m.vertexStart=g.vertexStart,m.vertexCount=g.vertexCount,m.reservedVertexCount=g.reservedVertexCount,m.indexStart=g.indexStart,m.indexCount=g.indexCount,m.reservedIndexCount=g.reservedIndexCount,m.start=g.start,m.count=g.count,m}setInstanceCount(p){let m=this._availableInstanceIds,g=this._instanceInfo;m.sort(ic);while(m[m.length-1]===g.length-1)g.pop(),m.pop();if(p<g.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${p} are being used. Cannot shrink instance count.`);let _=new Int32Array(p),x=new Int32Array(p);ni(this._multiDrawCounts,_),ni(this._multiDrawStarts,x),this._multiDrawCounts=_,this._multiDrawStarts=x;let y=new Int32Array(p),v=new Int32Array(p),b=new Int32Array(p);ni(this._mergedDrawCounts,y),ni(this._mergedDrawStarts,v),ni(this._mergedDrawInstanceCounts,b),this._mergedDrawCounts=y,this._mergedDrawStarts=v,this._mergedDrawInstanceCounts=b,this._maxInstanceCount=p;let S=this._indirectTexture,M=this._matricesTexture,T=this._colorsTexture;if(S.dispose(),this._initIndirectTexture(),ni(S.image.data,this._indirectTexture.image.data),M.dispose(),this._initMatricesTexture(),ni(M.image.data,this._matricesTexture.image.data),T)T.dispose(),this._initColorsTexture(),ni(T.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(p,m){let g=[...this._geometryInfo].filter((v)=>v.active);if(Math.max(...g.map((v)=>v.vertexStart+v.reservedVertexCount))>p)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${p}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...g.map((b)=>b.indexStart+b.reservedIndexCount))>m)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${m}. Cannot shrink further.`)}let x=this.geometry;if(x.dispose(),this._maxVertexCount=p,this._maxIndexCount=m,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new Ye,this._initializeGeometry(x);let y=this.geometry;if(x.index)ni(x.index.array,y.index.array);for(let v in x.attributes)ni(x.attributes[v].array,y.attributes[v].array);this._visibilityChanged=!0}raycast(p,m){let g=this._instanceInfo,_=this._geometryInfo,x=this.matrixWorld,y=this.geometry;if(mn.material=this.material,mn.geometry.index=y.index,mn.geometry.attributes=y.attributes,mn.geometry.boundingBox===null)mn.geometry.boundingBox=new xe;if(mn.geometry.boundingSphere===null)mn.geometry.boundingSphere=new En;for(let v=0,b=g.length;v<b;v++){if(!g[v].visible||!g[v].active)continue;let S=g[v].geometryIndex,M=_[S];mn.geometry.setDrawRange(M.start,M.count),this.getMatrixAt(v,mn.matrixWorld).premultiply(x),this.getBoundingBoxAt(S,mn.geometry.boundingBox),this.getBoundingSphereAt(S,mn.geometry.boundingSphere),mn.raycast(p,Xo);for(let T=0,w=Xo.length;T<w;T++){let E=Xo[T];E.object=this,E.batchId=v,m.push(E)}Xo.length=0}mn.material=null,mn.geometry.index=null,mn.geometry.attributes={},mn.geometry.setDrawRange(0,1/0)}copy(p){if(super.copy(p),this.geometry=p.geometry.clone(),this.perObjectFrustumCulled=p.perObjectFrustumCulled,this.sortObjects=p.sortObjects,this.boundingBox=p.boundingBox!==null?p.boundingBox.clone():null,this.boundingSphere=p.boundingSphere!==null?p.boundingSphere.clone():null,this._geometryInfo=p._geometryInfo.map((m)=>({...m,boundingBox:m.boundingBox!==null?m.boundingBox.clone():null,boundingSphere:m.boundingSphere!==null?m.boundingSphere.clone():null})),this._instanceInfo=p._instanceInfo.map((m)=>({...m})),this._availableInstanceIds=p._availableInstanceIds.slice(),this._availableGeometryIds=p._availableGeometryIds.slice(),this._nextIndexStart=p._nextIndexStart,this._nextVertexStart=p._nextVertexStart,this._geometryCount=p._geometryCount,this._maxInstanceCount=p._maxInstanceCount,this._maxVertexCount=p._maxVertexCount,this._maxIndexCount=p._maxIndexCount,this._geometryInitialized=p._geometryInitialized,this._multiDrawCounts=p._multiDrawCounts.slice(),this._multiDrawStarts=p._multiDrawStarts.slice(),this._multiDrawBytesPerElement=p._multiDrawBytesPerElement,this._mergedDrawCounts=p._mergedDrawCounts.slice(),this._mergedDrawStarts=p._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=p._mergedDrawInstanceCounts.slice(),this._indirectTexture=p._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=p._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),p._colorsTexture!==null)this._colorsTexture=p._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(p,m,g,_="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let x=m.getIndex(),y=x===null?1:x.array.BYTES_PER_ELEMENT,v=1;if(g.wireframe)v=2,y=m.attributes.position.count>65535?4:2;let b=this._instanceInfo,S=this._multiDrawStarts,M=this._multiDrawCounts,T=this._mergedDrawStarts,w=this._mergedDrawCounts,E=this._mergedDrawInstanceCounts,A=this._geometryInfo,P=this.perObjectFrustumCulled,D=this._indirectTexture,R=D.image.data,C=p.isArrayCamera?Z_:Y_;if(P)if(p.isArrayCamera)C.setFromArrayCamera(p);else wn.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse).multiply(this.matrixWorld),C.setFromProjectionMatrix(wn,p.coordinateSystem,p.reversedDepth);let I=0,U=0;if(this.sortObjects){wn.copy(this.matrixWorld).invert(),$d.setFromMatrixPosition(p.matrixWorld).applyMatrix4(wn),Kd.set(0,0,-1).transformDirection(p.matrixWorld).transformDirection(wn);for(let z=0,L=b.length;z<L;z++)if(b[z].visible&&b[z].active){let O=b[z].geometryIndex;this.getMatrixAt(z,wn),this.getBoundingSphereAt(O,rs).applyMatrix4(wn);let V=!1;if(P)V=!C.intersectsSphere(rs);if(!V){let Y=A[O],H=$_.subVectors(rs.center,$d).dot(Kd);rc.push(Y.start,Y.count,H,z)}}let N=rc.list,F=this.customSort;if(F===null)N.sort(g.transparent?X_:W_);else F.call(this,N,p);for(let z=0,L=N.length;z<L;z++){let O=N[z],V=O.start*y*v,Y=O.count*v;if(_==="merged")if(U>0&&T[U-1]===V&&w[U-1]===Y)E[U-1]++;else T[U]=V,w[U]=Y,E[U]=1,U++;else S[I]=V,M[I]=Y;R[I]=O.index,I++}rc.reset()}else for(let N=0,F=b.length;N<F;N++)if(b[N].visible&&b[N].active){let z=b[N].geometryIndex,L=!1;if(P)this.getMatrixAt(N,wn),this.getBoundingSphereAt(z,rs).applyMatrix4(wn),L=!C.intersectsSphere(rs);if(!L){let O=A[z],V=O.start*y*v,Y=O.count*v;if(_==="merged")if(U>0&&T[U-1]===V&&w[U-1]===Y)E[U-1]++;else T[U]=V,w[U]=Y,E[U]=1,U++;else S[I]=V,M[I]=Y;R[I]=N,I++}}D.needsUpdate=!0,this._multiDrawCount=I,this._mergedDrawCount=U,this._multiDrawBytesPerElement=y,this._visibilityChanged=!1}onBeforeRender(p,m,g,_,x){if(p.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(g,_,x)}onBeforeShadow(p,m,g,_,x,y){if(p.isWebGPURenderer!==!0)this._updateDrawParameters(_,x,y)}}class Gi extends Ti{constructor(p){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.linewidth=p.linewidth,this.linecap=p.linecap,this.linejoin=p.linejoin,this.fog=p.fog,this}}var ta=new q,ea=new q,Jd=new Jt,Ir=new Hi,qo=new En,oc=new q,jd=new q;class ds extends qe{constructor(p=new Ye,m=new Gi){super();this.isLine=!0,this.type="Line",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[0];for(let _=1,x=m.count;_<x;_++)ta.fromBufferAttribute(m,_-1),ea.fromBufferAttribute(m,_),g[_]=g[_-1],g[_]+=ta.distanceTo(ea);p.setAttribute("lineDistance",new an(g,1))}else Xt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Line.threshold,y=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(qo.copy(g.boundingSphere),qo.applyMatrix4(_),qo.radius+=x,p.ray.intersectsSphere(qo)===!1)return;Jd.copy(_).invert(),Ir.copy(p.ray).applyMatrix4(Jd);let v=x/((this.scale.x+this.scale.y+this.scale.z)/3),b=v*v,S=this.isLineSegments?2:1,M=g.index,w=g.attributes.position;if(M!==null){let E=Math.max(0,y.start),A=Math.min(M.count,y.start+y.count);for(let P=E,D=A-1;P<D;P+=S){let R=M.getX(P),C=M.getX(P+1),I=Yo(this,p,Ir,b,R,C,P);if(I)m.push(I)}if(this.isLineLoop){let P=M.getX(A-1),D=M.getX(E),R=Yo(this,p,Ir,b,P,D,A-1);if(R)m.push(R)}}else{let E=Math.max(0,y.start),A=Math.min(w.count,y.start+y.count);for(let P=E,D=A-1;P<D;P+=S){let R=Yo(this,p,Ir,b,P,P+1,P);if(R)m.push(R)}if(this.isLineLoop){let P=Yo(this,p,Ir,b,A-1,E,A-1);if(P)m.push(P)}}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}}function Yo(p,m,g,_,x,y,v){let b=p.geometry.attributes.position;if(ta.fromBufferAttribute(b,x),ea.fromBufferAttribute(b,y),g.distanceSqToSegment(ta,ea,oc,jd)>_)return;oc.applyMatrix4(p.matrixWorld);let M=m.ray.origin.distanceTo(oc);if(M<m.near||M>m.far)return;return{distance:M,point:jd.clone().applyMatrix4(p.matrixWorld),index:v,face:null,faceIndex:null,barycoord:null,object:p}}var Qd=new q,tf=new q;class wi extends ds{constructor(p,m){super(p,m);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let p=this.geometry;if(p.index===null){let m=p.attributes.position,g=[];for(let _=0,x=m.count;_<x;_+=2)Qd.fromBufferAttribute(m,_),tf.fromBufferAttribute(m,_+1),g[_]=_===0?0:g[_-1],g[_+1]=g[_]+Qd.distanceTo(tf);p.setAttribute("lineDistance",new an(g,1))}else Xt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class fs extends ds{constructor(p,m){super(p,m);this.isLineLoop=!0,this.type="LineLoop"}}class $r extends Ti{constructor(p){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.alphaMap=p.alphaMap,this.size=p.size,this.sizeAttenuation=p.sizeAttenuation,this.fog=p.fog,this}}var ef=new Jt,cc=new Hi,Zo=new En,$o=new q;class ps extends qe{constructor(p=new Ye,m=new $r){super();this.isPoints=!0,this.type="Points",this.geometry=p,this.material=m,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(p,m){if(super.copy(p,m),p.morphTargetInfluences!==void 0)this.morphTargetInfluences=p.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(p.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},p.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(p.material)?p.material.slice():p.material,this.geometry=p.geometry,this}intersectsFrustum(p){return p.intersectsObject(this)}raycast(p,m){let g=this.geometry,_=this.matrixWorld,x=p.params.Points.threshold,y=g.drawRange;if(g.boundingSphere===null)g.computeBoundingSphere();if(Zo.copy(g.boundingSphere),Zo.applyMatrix4(_),Zo.radius+=x,p.ray.intersectsSphere(Zo)===!1)return;ef.copy(_).invert(),cc.copy(p.ray).applyMatrix4(ef);let v=x/((this.scale.x+this.scale.y+this.scale.z)/3),b=v*v,S=g.index,T=g.attributes.position;if(S!==null){let w=Math.max(0,y.start),E=Math.min(S.count,y.start+y.count);for(let A=w,P=E;A<P;A++){let D=S.getX(A);$o.fromBufferAttribute(T,D),nf($o,D,b,_,p,m,this)}}else{let w=Math.max(0,y.start),E=Math.min(T.count,y.start+y.count);for(let A=w,P=E;A<P;A++)$o.fromBufferAttribute(T,A),nf($o,A,b,_,p,m,this)}}updateMorphTargets(){let m=this.geometry.morphAttributes,g=Object.keys(m);if(g.length>0){let _=m[g[0]];if(_!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let x=0,y=_.length;x<y;x++){let v=_[x].name||String(x);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=x}}}}}function nf(p,m,g,_,x,y,v){let b=cc.distanceSqToPoint(p);if(b<g){let S=new q;cc.closestPointToPoint(p,S),S.applyMatrix4(_);let M=x.ray.origin.distanceTo(S);if(M<x.near||M>x.far)return;y.push({distance:M,distanceToRay:Math.sqrt(b),point:S,index:m,face:null,faceIndex:null,barycoord:null,object:v})}}class Kr extends We{constructor(p=[],m,g,_,x,y,v,b,S,M,T,w){super(null,y,v,b,S,M,_,x,T,w);this.isCompressedTexture=!0,this.image={width:m,height:g},this.mipmaps=p,this.flipY=!1,this.generateMipmaps=!1}}class xa extends We{constructor(p=[],m=301,g,_,x,y,v,b,S,M){super(p,m,g,_,x,y,v,b,S,M);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(p){this.image=p}}class ya extends We{constructor(p,m,g,_,x,y,v,b,S){super(p,m,g,_,x,y,v,b,S);this.isCanvasTexture=!0,this.needsUpdate=!0}}class Vi extends We{constructor(p,m,g=1014,_,x,y,v=1003,b=1003,S,M=1026,T=1){if(M!==1026&&M!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let w={width:p,height:m,depth:T};super(w,_,x,y,v,b,M,g,S);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(p){return super.copy(p),this.source=new Xr(Object.assign({},p.image)),this.compareFunction=p.compareFunction,this}toJSON(p){let m=super.toJSON(p);return m.compareFunction=this.compareFunction,m}}class va extends Vi{constructor(p,m=1014,g=301,_,x,y=1003,v=1003,b,S=1026){let M={width:p,height:p,depth:1},T=[M,M,M,M,M,M];super(p,p,m,g,_,x,y,v,b,S);this.image=T,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(p){this.image=p}}class ba extends We{constructor(p=null){super();this.sourceTexture=p,this.isExternalTexture=!0}copy(p){return super.copy(p),this.sourceTexture=p.sourceTexture,this}}class tr extends Ye{constructor(p=1,m=1,g=1,_=1,x=1,y=1){super();this.type="BoxGeometry",this.parameters={width:p,height:m,depth:g,widthSegments:_,heightSegments:x,depthSegments:y};let v=this;_=Math.floor(_),x=Math.floor(x),y=Math.floor(y);let b=[],S=[],M=[],T=[],w=0,E=0;A("z","y","x",-1,-1,g,m,p,y,x,0),A("z","y","x",1,-1,g,m,-p,y,x,1),A("x","z","y",1,1,p,g,m,_,y,2),A("x","z","y",1,-1,p,g,-m,_,y,3),A("x","y","z",1,-1,p,m,g,_,x,4),A("x","y","z",-1,-1,p,m,-g,_,x,5),this.setIndex(b),this.setAttribute("position",new an(S,3)),this.setAttribute("normal",new an(M,3)),this.setAttribute("uv",new an(T,2));function A(P,D,R,C,I,U,N,F,z,L,O){let V=U/z,Y=N/L,H=U/2,W=N/2,K=F/2,G=z+1,Q=L+1,st=0,tt=0,mt=new q;for(let rt=0;rt<Q;rt++){let ht=rt*Y-W;for(let xt=0;xt<G;xt++){let At=xt*V-H;mt[P]=At*C,mt[D]=ht*I,mt[R]=K,S.push(mt.x,mt.y,mt.z),mt[P]=0,mt[D]=0,mt[R]=F>0?1:-1,M.push(mt.x,mt.y,mt.z),T.push(xt/z),T.push(1-rt/L),st+=1}}for(let rt=0;rt<L;rt++)for(let ht=0;ht<z;ht++){let xt=w+ht+G*rt,At=w+ht+G*(rt+1),at=w+(ht+1)+G*(rt+1),pt=w+(ht+1)+G*rt;b.push(xt,At,pt),b.push(At,at,pt),tt+=6}v.addGroup(E,tt,O),E+=tt,w+=st}}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new tr(p.width,p.height,p.depth,p.widthSegments,p.heightSegments,p.depthSegments)}}class Jr extends Ye{constructor(p=1,m=1,g=1,_=1){super();this.type="PlaneGeometry",this.parameters={width:p,height:m,widthSegments:g,heightSegments:_};let x=p/2,y=m/2,v=Math.floor(g),b=Math.floor(_),S=v+1,M=b+1,T=p/v,w=m/b,E=[],A=[],P=[],D=[];for(let R=0;R<M;R++){let C=R*w-y;for(let I=0;I<S;I++){let U=I*T-x;A.push(U,-C,0),P.push(0,0,1),D.push(I/v),D.push(1-R/b)}}for(let R=0;R<b;R++)for(let C=0;C<v;C++){let I=C+S*R,U=C+S*(R+1),N=C+1+S*(R+1),F=C+1+S*R;E.push(I,U,F),E.push(U,N,F)}this.setIndex(E),this.setAttribute("position",new an(A,3)),this.setAttribute("normal",new an(P,3)),this.setAttribute("uv",new an(D,2))}copy(p){return super.copy(p),this.parameters=Object.assign({},p.parameters),this}static fromJSON(p){return new Jr(p.width,p.height,p.widthSegments,p.heightSegments)}}function ms(p){let m={};for(let g in p){m[g]={};for(let _ in p[g]){let x=p[g][_];if(sf(x))if(x.isRenderTargetTexture)Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),m[g][_]=null;else m[g][_]=x.clone();else if(Array.isArray(x))if(sf(x[0])){let y=[];for(let v=0,b=x.length;v<b;v++)y[v]=x[v].clone();m[g][_]=y}else m[g][_]=x.slice();else m[g][_]=x}}return m}function _n(p){let m={};for(let g=0;g<p.length;g++){let _=ms(p[g]);for(let x in _)m[x]=_[x]}return m}function sf(p){return p&&(p.isColor||p.isMatrix3||p.isMatrix4||p.isVector2||p.isVector3||p.isVector4||p.isTexture||p.isQuaternion)}function J_(p){let m=[];for(let g=0;g<p.length;g++)m.push(p[g].clone());return m}function yh(p){let m=p.getRenderTarget();if(m===null)return p.outputColorSpace;if(m.isXRRenderTarget===!0)return m.texture.colorSpace;return he.workingColorSpace}var mp={clone:ms,merge:_n},j_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Q_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ai extends Ti{constructor(p){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=j_,this.fragmentShader=Q_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,p!==void 0)this.setValues(p)}copy(p){return super.copy(p),this.fragmentShader=p.fragmentShader,this.vertexShader=p.vertexShader,this.uniforms=ms(p.uniforms),this.uniformsGroups=J_(p.uniformsGroups),this.defines=Object.assign({},p.defines),this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.fog=p.fog,this.lights=p.lights,this.clipping=p.clipping,this.extensions=Object.assign({},p.extensions),this.glslVersion=p.glslVersion,this.defaultAttributeValues=Object.assign({},p.defaultAttributeValues),this.index0AttributeName=p.index0AttributeName,this.uniformsNeedUpdate=p.uniformsNeedUpdate,this}toJSON(p){let m=super.toJSON(p);m.glslVersion=this.glslVersion,m.uniforms={};for(let _ in this.uniforms){let y=this.uniforms[_].value;if(y&&y.isTexture)m.uniforms[_]={type:"t",value:y.toJSON(p).uuid};else if(y&&y.isColor)m.uniforms[_]={type:"c",value:y.getHex()};else if(y&&y.isVector2)m.uniforms[_]={type:"v2",value:y.toArray()};else if(y&&y.isVector3)m.uniforms[_]={type:"v3",value:y.toArray()};else if(y&&y.isVector4)m.uniforms[_]={type:"v4",value:y.toArray()};else if(y&&y.isMatrix3)m.uniforms[_]={type:"m3",value:y.toArray()};else if(y&&y.isMatrix4)m.uniforms[_]={type:"m4",value:y.toArray()};else m.uniforms[_]={value:y}}if(Object.keys(this.defines).length>0)m.defines=this.defines;m.vertexShader=this.vertexShader,m.fragmentShader=this.fragmentShader,m.lights=this.lights,m.clipping=this.clipping;let g={};for(let _ in this.extensions)if(this.extensions[_]===!0)g[_]=!0;if(Object.keys(g).length>0)m.extensions=g;return m}fromJSON(p,m){if(super.fromJSON(p,m),p.uniforms!==void 0)for(let g in p.uniforms){let _=p.uniforms[g];switch(this.uniforms[g]={},_.type){case"t":this.uniforms[g].value=m[_.value]||null;break;case"c":this.uniforms[g].value=new se().setHex(_.value);break;case"v2":this.uniforms[g].value=new Kt().fromArray(_.value);break;case"v3":this.uniforms[g].value=new q().fromArray(_.value);break;case"v4":this.uniforms[g].value=new Be().fromArray(_.value);break;case"m3":this.uniforms[g].value=new jt().fromArray(_.value);break;case"m4":this.uniforms[g].value=new Jt().fromArray(_.value);break;default:this.uniforms[g].value=_.value}}if(p.defines!==void 0)this.defines=p.defines;if(p.vertexShader!==void 0)this.vertexShader=p.vertexShader;if(p.fragmentShader!==void 0)this.fragmentShader=p.fragmentShader;if(p.glslVersion!==void 0)this.glslVersion=p.glslVersion;if(p.extensions!==void 0)for(let g in p.extensions)this.extensions[g]=p.extensions[g];if(p.lights!==void 0)this.lights=p.lights;if(p.clipping!==void 0)this.clipping=p.clipping;return this}}class vh extends Ai{constructor(p){super(p);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Sa extends Ti{constructor(p){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new yi,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(p)}copy(p){return super.copy(p),this.color.copy(p.color),this.map=p.map,this.lightMap=p.lightMap,this.lightMapIntensity=p.lightMapIntensity,this.aoMap=p.aoMap,this.aoMapIntensity=p.aoMapIntensity,this.emissive.copy(p.emissive),this.emissiveMap=p.emissiveMap,this.emissiveIntensity=p.emissiveIntensity,this.bumpMap=p.bumpMap,this.bumpScale=p.bumpScale,this.normalMap=p.normalMap,this.normalMapType=p.normalMapType,this.normalScale.copy(p.normalScale),this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.specularMap=p.specularMap,this.alphaMap=p.alphaMap,this.envMap=p.envMap,this.envMapRotation.copy(p.envMapRotation),this.combine=p.combine,this.reflectivity=p.reflectivity,this.envMapIntensity=p.envMapIntensity,this.refractionRatio=p.refractionRatio,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this.wireframeLinecap=p.wireframeLinecap,this.wireframeLinejoin=p.wireframeLinejoin,this.flatShading=p.flatShading,this.fog=p.fog,this}}class bh extends Ti{constructor(p){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(p)}copy(p){return super.copy(p),this.depthPacking=p.depthPacking,this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this.wireframe=p.wireframe,this.wireframeLinewidth=p.wireframeLinewidth,this}}class Sh extends Ti{constructor(p){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(p)}copy(p){return super.copy(p),this.map=p.map,this.alphaMap=p.alphaMap,this.displacementMap=p.displacementMap,this.displacementScale=p.displacementScale,this.displacementBias=p.displacementBias,this}}function Bs(p,m){if(!p||p.constructor===m)return p;if(typeof m.BYTES_PER_ELEMENT==="number")return new m(p);return Array.prototype.slice.call(p)}function Ko(p){return p!==void 0&&p.inTangents!==void 0&&p.outTangents!==void 0}class gs{constructor(p,m,g,_){this.parameterPositions=p,this._cachedIndex=0,this.resultBuffer=_!==void 0?_:new m.constructor(g),this.sampleValues=m,this.valueSize=g,this.settings=null,this.DefaultSettings_={}}evaluate(p){let m=this.parameterPositions,g=this._cachedIndex,_=m[g],x=m[g-1];n:{t:{let y;e:{i:if(!(p<_)){for(let v=g+2;;){if(_===void 0){if(p<x)break i;return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}if(g===v)break;if(x=_,_=m[++g],p<_)break t}y=m.length;break e}if(!(p>=x)){let v=m[1];if(p<v)g=2,x=v;for(let b=g-2;;){if(x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(g===b)break;if(_=x,x=m[--g-1],p>=x)break t}y=g,g=0;break e}break n}while(g<y){let v=g+y>>>1;if(p<m[v])y=v;else g=v+1}if(_=m[g],x=m[g-1],x===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(_===void 0)return g=m.length,this._cachedIndex=g,this.copySampleValue_(g-1)}this._cachedIndex=g,this.intervalChanged_(g,x,_)}return this.interpolate_(g,x,p,_)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(p){let m=this.resultBuffer,g=this.sampleValues,_=this.valueSize,x=p*_;for(let y=0;y!==_;++y)m[y]=g[x+y];return m}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Mh extends gs{constructor(p,m,g,_){super(p,m,g,_);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(p,m,g){let _=this.parameterPositions,x=p-2,y=p+1,v=_[x],b=_[y];if(v===void 0)switch(this.getSettings_().endingStart){case 2401:x=p,v=2*m-g;break;case 2402:x=_.length-2,v=m+_[x]-_[x+1];break;default:x=p,v=g}if(b===void 0)switch(this.getSettings_().endingEnd){case 2401:y=p,b=2*g-m;break;case 2402:y=1,b=g+_[1]-_[0];break;default:y=p-1,b=m}let S=(g-m)*0.5,M=this.valueSize;this._weightPrev=S/(m-v),this._weightNext=S/(b-g),this._offsetPrev=x*M,this._offsetNext=y*M}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=this._offsetPrev,T=this._offsetNext,w=this._weightPrev,E=this._weightNext,A=(g-m)/(_-m),P=A*A,D=P*A,R=-w*D+2*w*P-w*A,C=(1+w)*D+(-1.5-2*w)*P+(-0.5+w)*A+1,I=(-1-E)*D+(1.5+E)*P+0.5*A,U=E*D-E*P;for(let N=0;N!==v;++N)x[N]=R*y[M+N]+C*y[S+N]+I*y[b+N]+U*y[T+N];return x}}class Eh extends gs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=(g-m)/(_-m),T=1-M;for(let w=0;w!==v;++w)x[w]=y[S+w]*T+y[b+w]*M;return x}}class Th extends gs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p){return this.copySampleValue_(p-1)}}class wh extends gs{interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=p*v,S=b-v,M=this.inTangents,T=this.outTangents;if(!M||!T){let A=(g-m)/(_-m),P=1-A;for(let D=0;D!==v;++D)x[D]=y[S+D]*P+y[b+D]*A;return x}let w=v*2,E=p-1;for(let A=0;A!==v;++A){let P=y[S+A],D=y[b+A],R=E*w+A*2,C=T[R],I=T[R+1],U=p*w+A*2,N=M[U],F=M[U+1],z=e0(g,m,C,N,_);x[A]=gp(z,P,I,F,D)}return x}}function gp(p,m,g,_,x){let y=1-p;return y*y*y*m+3*y*y*p*g+3*y*p*p*_+p*p*p*x}function t0(p,m,g,_,x){let y=1-p;return 3*y*y*(g-m)+6*y*p*(_-g)+3*p*p*(x-_)}function e0(p,m,g,_,x){let y=(p-m)/(x-m);for(let v=0;v<8;v++){let b=gp(y,m,g,_,x)-p;if(Math.abs(b)<0.0000000001)break;let S=t0(y,m,g,_,x);if(Math.abs(S)<0.0000000001)break;y=Math.max(0,Math.min(1,y-b/S))}return y}class Gn{constructor(p,m,g,_){if(p===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(m===void 0||m.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+p);this.name=p,this.times=Bs(m,this.TimeBufferType),this.values=Bs(g,this.ValueBufferType),this.setInterpolation(_||this.DefaultInterpolation)}static toJSON(p){let m=p.constructor,g;if(m.toJSON!==this.toJSON)g=m.toJSON(p);else{g={name:p.name,times:Bs(p.times,Array),values:Bs(p.values,Array)};let _=p.getInterpolation();if(_!==p.DefaultInterpolation)g.interpolation=_;if(Ko(p.settings))g.settings={inTangents:Bs(p.settings.inTangents,Array),outTangents:Bs(p.settings.outTangents,Array)}}return g.type=p.ValueTypeName,g}InterpolantFactoryMethodDiscrete(p){return new Th(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodLinear(p){return new Eh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodSmooth(p){return new Mh(this.times,this.values,this.getValueSize(),p)}InterpolantFactoryMethodBezier(p){let m=new wh(this.times,this.values,this.getValueSize(),p);if(this.settings)m.inTangents=this.settings.inTangents,m.outTangents=this.settings.outTangents;return m}setInterpolation(p){let m;switch(p){case 2300:m=this.InterpolantFactoryMethodDiscrete;break;case 2301:m=this.InterpolantFactoryMethodLinear;break;case 2302:m=this.InterpolantFactoryMethodSmooth;break;case 2303:m=this.InterpolantFactoryMethodBezier;break}if(m===void 0){let g="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(p!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(g);return Xt("KeyframeTrack:",g),this}return this.createInterpolant=m,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(p){if(p!==0){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]+=p;if(Ko(this.settings))rf(this.settings.inTangents,p),rf(this.settings.outTangents,p)}return this}scale(p){if(p!==1){let m=this.times;for(let g=0,_=m.length;g!==_;++g)m[g]*=p;if(Ko(this.settings))of(this.settings.inTangents,p),of(this.settings.outTangents,p)}return this}trim(p,m){let g=this.times,_=g.length,x=0,y=_-1;while(x!==_&&g[x]<p)++x;while(y!==-1&&g[y]>m)--y;if(++y,x!==0||y!==_){if(x>=y)y=Math.max(y,1),x=y-1;let v=this.getValueSize();this.times=g.slice(x,y),this.values=this.values.slice(x*v,y*v)}return this}validate(){let p=!0,m=this.getValueSize();if(m-Math.floor(m)!==0)$t("KeyframeTrack: Invalid value size in track.",this),p=!1;let g=this.times,_=this.values,x=g.length;if(x===0)$t("KeyframeTrack: Track is empty.",this),p=!1;let y=null;for(let v=0;v!==x;v++){let b=g[v];if(typeof b==="number"&&isNaN(b)){$t("KeyframeTrack: Time is not a valid number.",this,v,b),p=!1;break}if(y!==null&&y>b){$t("KeyframeTrack: Out of order keys.",this,v,b,y),p=!1;break}y=b}if(_!==void 0){if(h_(_))for(let v=0,b=_.length;v!==b;++v){let S=_[v];if(isNaN(S)){$t("KeyframeTrack: Value is not a valid number.",this,v,S),p=!1;break}}}return p}optimize(){let p=this.times.slice(),m=this.values.slice(),g=this.getValueSize(),_=this.getInterpolation()===2302,x=p.length-1,y=1;for(let v=1;v<x;++v){let b=!1,S=p[v],M=p[v+1];if(S!==M&&(v!==1||S!==p[0]))if(!_){let T=v*g,w=T-g,E=T+g;for(let A=0;A!==g;++A){let P=m[T+A];if(P!==m[w+A]||P!==m[E+A]){b=!0;break}}}else b=!0;if(b){if(v!==y){p[y]=p[v];let T=v*g,w=y*g;for(let E=0;E!==g;++E)m[w+E]=m[T+E]}++y}}if(x>0){p[y]=p[x];for(let v=x*g,b=y*g,S=0;S!==g;++S)m[b+S]=m[v+S];++y}if(y!==p.length)this.times=p.slice(0,y),this.values=m.slice(0,y*g);else this.times=p,this.values=m;return this}clone(){let p=this.times.slice(),m=this.values.slice(),_=new this.constructor(this.name,p,m);if(_.createInterpolant=this.createInterpolant,Ko(this.settings))_.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return _}}function rf(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]+=m}function of(p,m){for(let g=0,_=p.length;g!==_;g+=2)p[g]*=m}Gn.prototype.ValueTypeName="";Gn.prototype.TimeBufferType=Float32Array;Gn.prototype.ValueBufferType=Float32Array;Gn.prototype.DefaultInterpolation=2301;class _s extends Gn{constructor(p,m,g){super(p,m,g)}}_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=2300;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;class Ah extends Gn{constructor(p,m,g,_){super(p,m,g,_)}}Ah.prototype.ValueTypeName="color";class Rh extends Gn{constructor(p,m,g,_){super(p,m,g,_)}}Rh.prototype.ValueTypeName="number";class Ch extends gs{constructor(p,m,g,_){super(p,m,g,_)}interpolate_(p,m,g,_){let x=this.resultBuffer,y=this.sampleValues,v=this.valueSize,b=(g-m)/(_-m),S=p*v;for(let M=S+v;S!==M;S+=4)Ei.slerpFlat(x,0,y,S-v,y,S,b);return x}}class Ma extends Gn{constructor(p,m,g,_){super(p,m,g,_)}InterpolantFactoryMethodLinear(p){return new Ch(this.times,this.values,this.getValueSize(),p)}}Ma.prototype.ValueTypeName="quaternion";Ma.prototype.InterpolantFactoryMethodSmooth=void 0;class xs extends Gn{constructor(p,m,g){super(p,m,g)}}xs.prototype.ValueTypeName="string";xs.prototype.ValueBufferType=Array;xs.prototype.DefaultInterpolation=2300;xs.prototype.InterpolantFactoryMethodLinear=void 0;xs.prototype.InterpolantFactoryMethodSmooth=void 0;class Ph extends Gn{constructor(p,m,g,_){super(p,m,g,_)}}Ph.prototype.ValueTypeName="vector";var hc={enabled:!1,files:{},add:function(p,m){if(this.enabled===!1)return;if(af(p))return;this.files[p]=m},get:function(p){if(this.enabled===!1)return;if(af(p))return;return this.files[p]},remove:function(p){delete this.files[p]},clear:function(){this.files={}}};function af(p){try{let m=p.slice(p.indexOf(":")+1);return new URL(m).protocol==="blob:"}catch(m){return!1}}class Ih{constructor(p,m,g){let _=this,x=!1,y=0,v=0,b=void 0,S=[];this.onStart=void 0,this.onLoad=p,this.onProgress=m,this.onError=g,this._abortController=null,this.itemStart=function(M){if(v++,x===!1){if(_.onStart!==void 0)_.onStart(M,y,v)}x=!0},this.itemEnd=function(M){if(y++,_.onProgress!==void 0)_.onProgress(M,y,v);if(y===v){if(x=!1,_.onLoad!==void 0)_.onLoad()}},this.itemError=function(M){if(_.onError!==void 0)_.onError(M)},this.resolveURL=function(M){if(M=M.normalize("NFC"),b)return b(M);return M},this.setURLModifier=function(M){return b=M,this},this.addHandler=function(M,T){return S.push(M,T),this},this.removeHandler=function(M){let T=S.indexOf(M);if(T!==-1)S.splice(T,2);return this},this.getHandler=function(M){for(let T=0,w=S.length;T<w;T+=2){let E=S[T],A=S[T+1];if(E.global)E.lastIndex=0;if(E.test(M))return A}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var _p=new Ih;class jr{constructor(p){if(this.manager=p!==void 0?p:_p,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(p,m){let g=this;return new Promise(function(_,x){g.load(p,_,m,x)})}parse(){}setCrossOrigin(p){return this.crossOrigin=p,this}setWithCredentials(p){return this.withCredentials=p,this}setPath(p){return this.path=p,this}setResourcePath(p){return this.resourcePath=p,this}setRequestHeader(p){return this.requestHeader=p,this}setPriority(p){return this.priority=p,this}setCache(p){return this.cache=p,this}abort(){return this}}jr.DEFAULT_MATERIAL_NAME="__DEFAULT";var _i={};class xp extends Error{constructor(p,m){super(p);this.response=m}}class Lh extends jr{constructor(p){super(p);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(p,m,g,_){if(p===void 0)p="";if(this.path!==void 0)p=this.path+p;p=this.manager.resolveURL(p);let x=hc.get(`file:${p}`);if(x!==void 0){this.manager.itemStart(p),setTimeout(()=>{if(m)m(x);this.manager.itemEnd(p)},0);return}if(_i[p]!==void 0){_i[p].push({onLoad:m,onProgress:g,onError:_});return}_i[p]=[],_i[p].push({onLoad:m,onProgress:g,onError:_});let y=new Request(p,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),v=this.mimeType,b=this.responseType;fetch(y).then((S)=>{if(S.status===200||S.status===0){if(S.status===0)Xt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||S.body===void 0||S.body.getReader===void 0)return S;let M=_i[p],T=S.body.getReader(),w=S.headers.get("X-File-Size")||S.headers.get("Content-Length"),E=w?parseInt(w):0,A=E!==0,P=0,D=new ReadableStream({start(R){C();function C(){T.read().then(({done:I,value:U})=>{if(I)R.close();else{P+=U.byteLength;let N=new ProgressEvent("progress",{lengthComputable:A,loaded:P,total:E});for(let F=0,z=M.length;F<z;F++){let L=M[F];if(L.onProgress)L.onProgress(N)}R.enqueue(U),C()}},(I)=>{R.error(I)})}}});return new Response(D)}else throw new xp(`fetch for "${S.url}" responded with ${S.status}: ${S.statusText}`,S)}).then((S)=>{switch(b){case"arraybuffer":return S.arrayBuffer();case"blob":return S.blob();case"document":return S.text().then((M)=>new DOMParser().parseFromString(M,v));case"json":return S.json();default:if(v==="")return S.text();else{let T=/charset="?([^;"\s]*)"?/i.exec(v),w=T&&T[1]?T[1].toLowerCase():void 0,E=new TextDecoder(w);return S.arrayBuffer().then((A)=>E.decode(A))}}}).then((S)=>{hc.add(`file:${p}`,S);let M=_i[p];delete _i[p];for(let T=0,w=M.length;T<w;T++){let E=M[T];if(E.onLoad)E.onLoad(S)}}).catch((S)=>{let M=_i[p];if(M===void 0)throw this.manager.itemError(p),S;delete _i[p];for(let T=0,w=M.length;T<w;T++){let E=M[T];if(E.onError)E.onError(S)}this.manager.itemError(p)}).finally(()=>{this.manager.itemEnd(p)}),this.manager.itemStart(p)}setResponseType(p){return this.responseType=p,this}setMimeType(p){return this.mimeType=p,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Ea extends jr{constructor(p){super(p)}load(p,m,g,_){let x=this,y=[],v=new Kr,b=new Lh(this.manager);b.setPriority(this.priority),b.setCache(this.cache),b.setPath(this.path),b.setResponseType("arraybuffer"),b.setRequestHeader(this.requestHeader),b.setWithCredentials(x.withCredentials);let S=0;function M(T){b.load(p[T],function(w){let E=x.parse(w,!0);if(y[T]={width:E.width,height:E.height,format:E.format,mipmaps:E.mipmaps},S+=1,S===6){if(E.mipmapCount===1)v.minFilter=1006;if(v.image=y,v.format=E.format,v.needsUpdate=!0,m)m(v)}},g,_)}if(Array.isArray(p))for(let T=0,w=p.length;T<w;++T)M(T);else b.load(p,function(T){let w=x.parse(T,!0);if(w.isCubemap){let E=w.mipmaps.length/w.mipmapCount;for(let A=0;A<E;A++){y[A]={mipmaps:[]};for(let P=0;P<w.mipmapCount;P++)y[A].mipmaps.push(w.mipmaps[A*w.mipmapCount+P]),y[A].format=w.format,y[A].width=w.width,y[A].height=w.height}v.image=y}else v.image.width=w.width,v.image.height=w.height,v.mipmaps=w.mipmaps;if(w.mipmapCount===1)v.minFilter=1006;if(v.format=w.format,v.needsUpdate=!0,m)m(v)},g,_);return v}}class Ta extends qe{static registerNode(p){this.prototype._lightNode=p}constructor(p,m=1){super();this.isLight=!0,this.type="Light",this.color=new se(p),this.intensity=m}copy(p,m){return super.copy(p,m),this.color.copy(p.color),this.intensity=p.intensity,this}toJSON(p){let m=super.toJSON(p);return m.object.color=this.color.getHex(),m.object.intensity=this.intensity,m}}var ac=new Jt,lf=new q,cf=new q;class Nh{constructor(p){this.camera=p,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Kt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Jt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oi,this._frameExtents=new Kt(1,1),this._viewportCount=1,this._viewports=[new Be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(p){let m=this.camera;lf.setFromMatrixPosition(p.matrixWorld),m.position.copy(lf),cf.setFromMatrixPosition(p.target.matrixWorld),m.lookAt(cf),m.updateMatrixWorld(),this._updateMatrix(m,this.matrix,this._frustum)}_updateMatrix(p,m,g,_){ac.multiplyMatrices(p.projectionMatrix,p.matrixWorldInverse),g.setFromProjectionMatrix(ac,p.coordinateSystem,p.reversedDepth);let x=this._frameExtents,y=_?_.z/x.x:1,v=_?_.w/x.y:1,b=_?_.x/x.x:0,S=_?_.y/x.y:0;if(p.coordinateSystem===2001||p.reversedDepth)m.set(0.5*y,0,0,0.5*y+b,0,0.5*v,0,0.5*v+S,0,0,1,0,0,0,0,1);else m.set(0.5*y,0,0,0.5*y+b,0,0.5*v,0,0.5*v+S,0,0,0.5,0.5,0,0,0,1);m.multiply(ac)}getViewport(p){return this._viewports[p]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(p){return this.camera=p.camera.clone(),this.intensity=p.intensity,this.bias=p.bias,this.radius=p.radius,this.autoUpdate=p.autoUpdate,this.needsUpdate=p.needsUpdate,this.normalBias=p.normalBias,this.blurSamples=p.blurSamples,this.mapSize.copy(p.mapSize),this.mapType=p.mapType,this.biasNode=p.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let p={};return p.intensity=this.intensity,p.bias=this.bias,p.normalBias=this.normalBias,p.radius=this.radius,p.blurSamples=this.blurSamples,p.mapSize=this.mapSize.toArray(),p.mapType=this.mapType,p.camera=this.camera.toJSON(!1).object,delete p.camera.matrix,p}}var Jo=new q,jo=new Ei,ii=new q;class wa extends qe{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Jt,this.projectionMatrix=new Jt,this.projectionMatrixInverse=new Jt,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(p,m){return super.copy(p,m),this.matrixWorldInverse.copy(p.matrixWorldInverse),this.projectionMatrix.copy(p.projectionMatrix),this.projectionMatrixInverse.copy(p.projectionMatrixInverse),this.coordinateSystem=p.coordinateSystem,this}getWorldDirection(p){return super.getWorldDirection(p).negate()}updateMatrixWorld(p){if(super.updateMatrixWorld(p),this.matrixWorld.decompose(Jo,jo,ii),ii.x===1&&ii.y===1&&ii.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Jo,jo,ii.set(1,1,1)).invert()}updateWorldMatrix(p,m,g=!1){if(super.updateWorldMatrix(p,m,g),this.matrixWorld.decompose(Jo,jo,ii),ii.x===1&&ii.y===1&&ii.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Jo,jo,ii.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Di=new q,hf=new Kt,uf=new Kt;class An extends wa{constructor(p=50,m=1,g=0.1,_=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=p,this.zoom=1,this.near=g,this.far=_,this.focus=10,this.aspect=m,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.fov=p.fov,this.zoom=p.zoom,this.near=p.near,this.far=p.far,this.focus=p.focus,this.aspect=p.aspect,this.view=p.view===null?null:Object.assign({},p.view),this.filmGauge=p.filmGauge,this.filmOffset=p.filmOffset,this}setFocalLength(p){let m=0.5*this.getFilmHeight()/p;this.fov=qs*2*Math.atan(m),this.updateProjectionMatrix()}getFocalLength(){let p=Math.tan(Nr*0.5*this.fov);return 0.5*this.getFilmHeight()/p}getEffectiveFOV(){return qs*2*Math.atan(Math.tan(Nr*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(p,m,g){Di.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),m.set(Di.x,Di.y).multiplyScalar(-p/Di.z),Di.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),g.set(Di.x,Di.y).multiplyScalar(-p/Di.z)}getViewSize(p,m){return this.getViewBounds(p,hf,uf),m.subVectors(uf,hf)}setViewOffset(p,m,g,_,x,y){if(this.aspect=p/m,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=y,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=this.near,m=p*Math.tan(Nr*0.5*this.fov)/this.zoom,g=2*m,_=this.aspect*g,x=-0.5*_,y=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:b,fullHeight:S}=y;x+=y.offsetX*_/b,m-=y.offsetY*g/S,_*=y.width/b,g*=y.height/S}let v=this.filmOffset;if(v!==0)x+=p*v/this.getFilmWidth();this.projectionMatrix.makePerspective(x,x+_,m,m-g,p,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.fov=this.fov,m.object.zoom=this.zoom,m.object.near=this.near,m.object.far=this.far,m.object.focus=this.focus,m.object.aspect=this.aspect,this.view!==null)m.object.view=Object.assign({},this.view);return m.object.filmGauge=this.filmGauge,m.object.filmOffset=this.filmOffset,m}}class Aa extends wa{constructor(p=-1,m=1,g=1,_=-1,x=0.1,y=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=p,this.right=m,this.top=g,this.bottom=_,this.near=x,this.far=y,this.updateProjectionMatrix()}copy(p,m){return super.copy(p,m),this.left=p.left,this.right=p.right,this.top=p.top,this.bottom=p.bottom,this.near=p.near,this.far=p.far,this.zoom=p.zoom,this.view=p.view===null?null:Object.assign({},p.view),this}setViewOffset(p,m,g,_,x,y){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=p,this.view.fullHeight=m,this.view.offsetX=g,this.view.offsetY=_,this.view.width=x,this.view.height=y,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let p=(this.right-this.left)/(2*this.zoom),m=(this.top-this.bottom)/(2*this.zoom),g=(this.right+this.left)/2,_=(this.top+this.bottom)/2,x=g-p,y=g+p,v=_+m,b=_-m;if(this.view!==null&&this.view.enabled){let S=(this.right-this.left)/this.view.fullWidth/this.zoom,M=(this.top-this.bottom)/this.view.fullHeight/this.zoom;x+=S*this.view.offsetX,y=x+S*this.view.width,v-=M*this.view.offsetY,b=v-M*this.view.height}this.projectionMatrix.makeOrthographic(x,y,v,b,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(p){let m=super.toJSON(p);if(m.object.zoom=this.zoom,m.object.left=this.left,m.object.right=this.right,m.object.top=this.top,m.object.bottom=this.bottom,m.object.near=this.near,m.object.far=this.far,this.view!==null)m.object.view=Object.assign({},this.view);return m}}class yp extends Nh{constructor(){super(new Aa(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class Ra extends Ta{constructor(p,m){super(p,m);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qe.DEFAULT_UP),this.updateMatrix(),this.target=new qe,this.shadow=new yp}dispose(){super.dispose(),this.shadow.dispose()}copy(p){return super.copy(p),this.target=p.target.clone(),this.shadow=p.shadow.clone(),this}toJSON(p){let m=super.toJSON(p);return m.object.shadow=this.shadow.toJSON(),m.object.target=this.target.uuid,m}}class Ca extends Ta{constructor(p,m){super(p,m);this.isAmbientLight=!0,this.type="AmbientLight"}}var ks=-90,zs=1;class Qr extends qe{constructor(p,m,g){super();this.type="CubeCamera",this.renderTarget=g,this.coordinateSystem=null,this.activeMipmapLevel=0;let _=new An(ks,zs,p,m);_.layers=this.layers,this.add(_);let x=new An(ks,zs,p,m);x.layers=this.layers,this.add(x);let y=new An(ks,zs,p,m);y.layers=this.layers,this.add(y);let v=new An(ks,zs,p,m);v.layers=this.layers,this.add(v);let b=new An(ks,zs,p,m);b.layers=this.layers,this.add(b);let S=new An(ks,zs,p,m);S.layers=this.layers,this.add(S)}updateCoordinateSystem(){let p=this.coordinateSystem,m=this.children.concat(),[g,_,x,y,v,b]=m;for(let S of m)this.remove(S);if(p===2000)g.up.set(0,1,0),g.lookAt(1,0,0),_.up.set(0,1,0),_.lookAt(-1,0,0),x.up.set(0,0,-1),x.lookAt(0,1,0),y.up.set(0,0,1),y.lookAt(0,-1,0),v.up.set(0,1,0),v.lookAt(0,0,1),b.up.set(0,1,0),b.lookAt(0,0,-1);else if(p===2001)g.up.set(0,-1,0),g.lookAt(-1,0,0),_.up.set(0,-1,0),_.lookAt(1,0,0),x.up.set(0,0,1),x.lookAt(0,1,0),y.up.set(0,0,-1),y.lookAt(0,-1,0),v.up.set(0,-1,0),v.lookAt(0,0,1),b.up.set(0,-1,0),b.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+p);for(let S of m)this.add(S),S.updateMatrixWorld()}update(p,m){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:g,activeMipmapLevel:_}=this;if(this.coordinateSystem!==p.coordinateSystem)this.coordinateSystem=p.coordinateSystem,this.updateCoordinateSystem();let[x,y,v,b,S,M]=this.children,T=p.getRenderTarget(),w=p.getActiveCubeFace(),E=p.getActiveMipmapLevel(),A=p.xr.enabled;p.xr.enabled=!1;let P=g.texture.mipmapsAutoUpdate;g.texture.mipmapsAutoUpdate=!1;let D=!1;if(p.isWebGLRenderer===!0)D=p.state.buffers.depth.getReversed();else D=p.reversedDepthBuffer;if(p.setRenderTarget(g,0,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,x),p.setRenderTarget(g,1,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,y),p.setRenderTarget(g,2,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,v),p.setRenderTarget(g,3,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,b),p.setRenderTarget(g,4,_),D&&p.autoClear===!1)p.clearDepth();if(p.render(m,S),g.texture.mipmapsAutoUpdate=P,p.setRenderTarget(g,5,_),D&&p.autoClear===!1)p.clearDepth();p.render(m,M),p.setRenderTarget(T,w,E),p.xr.enabled=A,g.texture.needsPMREMUpdate=!0}}class Dh extends An{constructor(p=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=p,this.perCameraFrustumCulled=!1}}var Uh="\\[\\]\\.:\\/",n0=new RegExp("["+Uh+"]","g"),Oh="[^"+Uh+"]",i0="[^"+Uh.replace("\\.","")+"]",s0=/((?:WC+[\/:])*)/.source.replace("WC",Oh),r0=/(WCOD+)?/.source.replace("WCOD",i0),o0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Oh),a0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Oh),l0=new RegExp("^"+s0+r0+o0+a0+"$"),c0=["material","materials","bones","map"];class vp{constructor(p,m,g){let _=g||we.parseTrackName(m);this._targetGroup=p,this._bindings=p.subscribe_(m,_)}getValue(p,m){this.bind();let g=this._targetGroup.nCachedObjects_,_=this._bindings[g];if(_!==void 0)_.getValue(p,m)}setValue(p,m){let g=this._bindings;for(let _=this._targetGroup.nCachedObjects_,x=g.length;_!==x;++_)g[_].setValue(p,m)}bind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].bind()}unbind(){let p=this._bindings;for(let m=this._targetGroup.nCachedObjects_,g=p.length;m!==g;++m)p[m].unbind()}}class we{constructor(p,m,g){this.path=m,this.parsedPath=g||we.parseTrackName(m),this.node=we.findNode(p,this.parsedPath.nodeName),this.rootNode=p,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(p,m,g){if(!(p&&p.isAnimationObjectGroup))return new we(p,m,g);else return new we.Composite(p,m,g)}static sanitizeNodeName(p){return p.replace(/\s/g,"_").replace(n0,"")}static parseTrackName(p){let m=l0.exec(p);if(m===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+p);let g={nodeName:m[2],objectName:m[3],objectIndex:m[4],propertyName:m[5],propertyIndex:m[6]},_=g.nodeName&&g.nodeName.lastIndexOf(".");if(_!==void 0&&_!==-1){let x=g.nodeName.substring(_+1);if(c0.indexOf(x)!==-1)g.nodeName=g.nodeName.substring(0,_),g.objectName=x}if(g.propertyName===null||g.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+p);return g}static findNode(p,m){if(m===void 0||m===""||m==="."||m===-1||m===p.name||m===p.uuid)return p;if(p.skeleton){let g=p.skeleton.getBoneByName(m);if(g!==void 0)return g}if(p.children){let g=function(x){for(let y=0;y<x.length;y++){let v=x[y];if(v.name===m||v.uuid===m)return v;let b=g(v.children);if(b)return b}return null},_=g(p.children);if(_)return _}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(p,m){p[m]=this.targetObject[this.propertyName]}_getValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)p[m++]=g[_]}_getValue_arrayElement(p,m){p[m]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(p,m){this.resolvedProperty.toArray(p,m)}_setValue_direct(p,m){this.targetObject[this.propertyName]=p[m]}_setValue_direct_setNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(p,m){this.targetObject[this.propertyName]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++]}_setValue_array_setNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(p,m){let g=this.resolvedProperty;for(let _=0,x=g.length;_!==x;++_)g[_]=p[m++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(p,m){this.resolvedProperty[this.propertyIndex]=p[m]}_setValue_arrayElement_setNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty[this.propertyIndex]=p[m],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(p,m){this.resolvedProperty.fromArray(p,m)}_setValue_fromArray_setNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(p,m){this.resolvedProperty.fromArray(p,m),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(p,m){this.bind(),this.getValue(p,m)}_setValue_unbound(p,m){this.bind(),this.setValue(p,m)}bind(){let p=this.node,m=this.parsedPath,{objectName:g,propertyName:_,propertyIndex:x}=m;if(!p)p=we.findNode(this.rootNode,m.nodeName),this.node=p;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!p){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(g){let S=m.objectIndex;switch(g){case"materials":if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.materials){$t("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}p=p.material.materials;break;case"bones":if(!p.skeleton){$t("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}p=p.skeleton.bones;for(let M=0;M<p.length;M++)if(p[M].name===S){S=M;break}break;case"map":if("map"in p){p=p.map;break}if(!p.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!p.material.map){$t("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}p=p.material.map;break;default:if(p[g]===void 0){$t("PropertyBinding: Can not bind to objectName of node undefined.",this);return}p=p[g]}if(S!==void 0){if(p[S]===void 0){$t("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,p);return}p=p[S]}}let y=p[_];if(y===void 0){let S=m.nodeName;$t("PropertyBinding: Trying to update property for track: "+S+"."+_+" but it wasn't found.",p);return}let v=this.Versioning.None;if(this.targetObject=p,p.isMaterial===!0)v=this.Versioning.NeedsUpdate;else if(p.isObject3D===!0)v=this.Versioning.MatrixWorldNeedsUpdate;let b=this.BindingType.Direct;if(x!==void 0){if(_==="morphTargetInfluences"){if(!p.geometry){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!p.geometry.morphAttributes){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(p.morphTargetDictionary[x]!==void 0)x=p.morphTargetDictionary[x]}b=this.BindingType.ArrayElement,this.resolvedProperty=y,this.propertyIndex=x}else if(y.fromArray!==void 0&&y.toArray!==void 0)b=this.BindingType.HasFromToArray,this.resolvedProperty=y;else if(Array.isArray(y))b=this.BindingType.EntireArray,this.resolvedProperty=y;else this.propertyName=_;this.getValue=this.GetterByBindingType[b],this.setValue=this.SetterByBindingTypeAndVersioning[b][v]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}we.Composite=vp;we.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};we.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};we.prototype.GetterByBindingType=[we.prototype._getValue_direct,we.prototype._getValue_array,we.prototype._getValue_arrayElement,we.prototype._getValue_toArray];we.prototype.SetterByBindingTypeAndVersioning=[[we.prototype._setValue_direct,we.prototype._setValue_direct_setNeedsUpdate,we.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[we.prototype._setValue_array,we.prototype._setValue_array_setNeedsUpdate,we.prototype._setValue_array_setMatrixWorldNeedsUpdate],[we.prototype._setValue_arrayElement,we.prototype._setValue_arrayElement_setNeedsUpdate,we.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[we.prototype._setValue_fromArray,we.prototype._setValue_fromArray_setNeedsUpdate,we.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var uT=new Float32Array(1);var df=new Jt;class to{constructor(p,m,g=0,_=1/0){this.ray=new Hi(p,m),this.near=g,this.far=_,this.camera=null,this.layers=new qr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(p,m){this.ray.set(p,m)}setFromCamera(p,m){if(m.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(m.matrixWorld),this.ray.direction.set(p.x,p.y,0.5).unproject(m).sub(this.ray.origin).normalize(),this.camera=m;else if(m.isOrthographicCamera)this.ray.origin.set(p.x,p.y,m.projectionMatrix.elements[14]).unproject(m),this.ray.direction.set(0,0,-1).transformDirection(m.matrixWorld),this.camera=m;else $t("Raycaster: Unsupported camera type: "+m.type)}setFromXRController(p){return df.identity().extractRotation(p.matrixWorld),this.ray.origin.setFromMatrixPosition(p.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(df),this}intersectObject(p,m=!0,g=[]){return uc(p,this,g,m),g.sort(ff),g}intersectObjects(p,m=!0,g=[]){for(let _=0,x=p.length;_<x;_++)uc(p[_],this,g,m);return g.sort(ff),g}}function ff(p,m){return p.distance-m.distance}function uc(p,m,g,_){let x=!0;if(p.layers.test(m.layers)){if(p.raycast(m,g)===!1)x=!1}if(x===!0&&_===!0){let y=p.children;for(let v=0,b=y.length;v<b;v++)uc(y[v],m,g,!0)}}class Pa{constructor(p=1,m=0,g=0){this.radius=p,this.phi=m,this.theta=g}set(p,m,g){return this.radius=p,this.phi=m,this.theta=g,this}copy(p){return this.radius=p.radius,this.phi=p.phi,this.theta=p.theta,this}makeSafe(){return this.phi=ie(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(p){return this.setFromCartesianCoords(p.x,p.y,p.z)}setFromCartesianCoords(p,m,g){if(this.radius=Math.sqrt(p*p+m*m+g*g),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(p,g),this.phi=Math.acos(ie(m/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class bp{static{this.prototype.isMatrix2=!0}constructor(p,m,g,_){if(this.elements=[1,0,0,1],p!==void 0)this.set(p,m,g,_)}identity(){return this.set(1,0,0,1),this}fromArray(p,m=0){for(let g=0;g<4;g++)this.elements[g]=p[g+m];return this}set(p,m,g,_){let x=this.elements;return x[0]=p,x[2]=m,x[1]=g,x[3]=_,this}}var pf=new q,Qo=new q,Hs=new q,Gs=new q,lc=new q,h0=new q,u0=new q;class Cn{constructor(p=new q,m=new q){this.start=p,this.end=m}set(p,m){return this.start.copy(p),this.end.copy(m),this}copy(p){return this.start.copy(p.start),this.end.copy(p.end),this}getCenter(p){return p.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(p){return p.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(p,m){return this.delta(m).multiplyScalar(p).add(this.start)}closestPointToPointParameter(p,m){pf.subVectors(p,this.start),Qo.subVectors(this.end,this.start);let g=Qo.dot(Qo);if(g===0)return 0;let x=Qo.dot(pf)/g;if(m)x=ie(x,0,1);return x}closestPointToPoint(p,m,g){let _=this.closestPointToPointParameter(p,m);return this.delta(g).multiplyScalar(_).add(this.start)}distanceSqToLine3(p,m=h0,g=u0){let x,y,v=this.start,b=p.start,S=this.end,M=p.end;Hs.subVectors(S,v),Gs.subVectors(M,b),lc.subVectors(v,b);let T=Hs.dot(Hs),w=Gs.dot(Gs),E=Gs.dot(lc);if(T<=0.00000000000000010000000000000001&&w<=0.00000000000000010000000000000001)return m.copy(v),g.copy(b),m.distanceToSquared(g);if(T<=0.00000000000000010000000000000001)x=0,y=E/w,y=ie(y,0,1);else{let A=Hs.dot(lc);if(w<=0.00000000000000010000000000000001)y=0,x=ie(-A/T,0,1);else{let P=Hs.dot(Gs),D=T*w-P*P;if(D!==0)x=ie((P*E-A*w)/D,0,1);else x=0;if(y=(P*x+E)/w,y<0)y=0,x=ie(-A/T,0,1);else if(y>1)y=1,x=ie((P-A)/T,0,1)}}return m.copy(v).addScaledVector(Hs,x),g.copy(b).addScaledVector(Gs,y),m.distanceToSquared(g)}applyMatrix4(p){return this.start.applyMatrix4(p),this.end.applyMatrix4(p),this}equals(p){return p.start.equals(this.start)&&p.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Ia extends wi{constructor(p,m=16776960){let g=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),_=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],x=new Ye;x.setIndex(new Xe(g,1)),x.setAttribute("position",new an(_,3));super(x,new Gi({color:m,toneMapped:!1}));this.box=p,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(p){let m=this.box;if(m.isEmpty())return;m.getCenter(this.position),m.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(p)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function Fh(p,m,g,_){let x=d0(_);switch(g){case 1021:return p*m;case 1028:return p*m/x.components*x.byteLength;case 1029:return p*m/x.components*x.byteLength;case 1030:return p*m*2/x.components*x.byteLength;case 1031:return p*m*2/x.components*x.byteLength;case 1022:return p*m*3/x.components*x.byteLength;case 1023:return p*m*4/x.components*x.byteLength;case 1033:return p*m*4/x.components*x.byteLength;case 33776:case 33777:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 33778:case 33779:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 35841:case 35843:return Math.max(p,16)*Math.max(m,8)/4;case 35840:case 35842:return Math.max(p,8)*Math.max(m,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37808:return Math.floor((p+3)/4)*Math.floor((m+3)/4)*16;case 37809:return Math.floor((p+4)/5)*Math.floor((m+3)/4)*16;case 37810:return Math.floor((p+4)/5)*Math.floor((m+4)/5)*16;case 37811:return Math.floor((p+5)/6)*Math.floor((m+4)/5)*16;case 37812:return Math.floor((p+5)/6)*Math.floor((m+5)/6)*16;case 37813:return Math.floor((p+7)/8)*Math.floor((m+4)/5)*16;case 37814:return Math.floor((p+7)/8)*Math.floor((m+5)/6)*16;case 37815:return Math.floor((p+7)/8)*Math.floor((m+7)/8)*16;case 37816:return Math.floor((p+9)/10)*Math.floor((m+4)/5)*16;case 37817:return Math.floor((p+9)/10)*Math.floor((m+5)/6)*16;case 37818:return Math.floor((p+9)/10)*Math.floor((m+7)/8)*16;case 37819:return Math.floor((p+9)/10)*Math.floor((m+9)/10)*16;case 37820:return Math.floor((p+11)/12)*Math.floor((m+9)/10)*16;case 37821:return Math.floor((p+11)/12)*Math.floor((m+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(p/4)*Math.ceil(m/4)*16;case 36283:case 36284:return Math.ceil(p/4)*Math.ceil(m/4)*8;case 36285:case 36286:return Math.ceil(p/4)*Math.ceil(m/4)*16}throw Error(`Unable to determine texture byte length for ${g} format.`)}function d0(p){switch(p){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${p}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Xt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function Vp(){let p=null,m=!1,g=null,_=null;function x(y,v){_=p.requestAnimationFrame(x),g(y,v)}return{start:function(){if(m===!0)return;if(g===null)return;if(p===null)return;_=p.requestAnimationFrame(x),m=!0},stop:function(){if(p!==null)p.cancelAnimationFrame(_);m=!1},setAnimationLoop:function(y){g=y},setContext:function(y){p=y}}}function f0(p){let m=new WeakMap;function g(b,S){let{array:M,usage:T}=b,w=M.byteLength,E=p.createBuffer();p.bindBuffer(S,E),p.bufferData(S,M,T),b.onUploadCallback();let A;if(M instanceof Float32Array)A=p.FLOAT;else if(typeof Float16Array<"u"&&M instanceof Float16Array)A=p.HALF_FLOAT;else if(M instanceof Uint16Array)if(b.isFloat16BufferAttribute)A=p.HALF_FLOAT;else A=p.UNSIGNED_SHORT;else if(M instanceof Int16Array)A=p.SHORT;else if(M instanceof Uint32Array)A=p.UNSIGNED_INT;else if(M instanceof Int32Array)A=p.INT;else if(M instanceof Int8Array)A=p.BYTE;else if(M instanceof Uint8Array)A=p.UNSIGNED_BYTE;else if(M instanceof Uint8ClampedArray)A=p.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+M);return{buffer:E,type:A,bytesPerElement:M.BYTES_PER_ELEMENT,version:b.version,size:w}}function _(b,S,M){let{array:T,updateRanges:w}=S;if(p.bindBuffer(M,b),w.length===0)p.bufferSubData(M,0,T);else{w.sort((A,P)=>A.start-P.start);let E=0;for(let A=1;A<w.length;A++){let P=w[E],D=w[A];if(D.start<=P.start+P.count+1)P.count=Math.max(P.count,D.start+D.count-P.start);else++E,w[E]=D}w.length=E+1;for(let A=0,P=w.length;A<P;A++){let D=w[A];p.bufferSubData(M,D.start*T.BYTES_PER_ELEMENT,T,D.start,D.count)}S.clearUpdateRanges()}S.onUploadCallback()}function x(b){if(b.isInterleavedBufferAttribute)b=b.data;return m.get(b)}function y(b){if(b.isInterleavedBufferAttribute)b=b.data;let S=m.get(b);if(S)p.deleteBuffer(S.buffer),m.delete(b)}function v(b,S){if(b.isInterleavedBufferAttribute)b=b.data;if(b.isGLBufferAttribute){let T=m.get(b);if(!T||T.version<b.version)m.set(b,{buffer:b.buffer,type:b.type,bytesPerElement:b.elementSize,version:b.version});return}let M=m.get(b);if(M===void 0)m.set(b,g(b,S));else if(M.version<b.version){if(M.size!==b.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");_(M.buffer,b,S),M.version=b.version}}return{get:x,remove:y,update:v}}var p0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,m0=`#ifdef USE_ALPHAHASH
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
#endif`,g0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,_0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,x0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,y0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,v0=`#ifdef USE_AOMAP
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
#endif`,b0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,S0=`#ifdef USE_BATCHING
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
#endif`,M0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,E0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,T0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,w0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,A0=`#ifdef USE_IRIDESCENCE
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
#endif`,R0=`#ifdef USE_BUMPMAP
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
#endif`,C0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,P0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,I0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,L0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,N0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,D0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,U0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,O0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,F0=`#define PI 3.141592653589793
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
} // validated`,B0=`vec3 transformedNormal = objectNormal;
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
#endif`,k0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,z0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,H0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,G0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,V0="gl_FragColor = linearToOutputTexel( gl_FragColor );",W0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,X0=`#ifdef USE_ENVMAP
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
#endif`,q0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Y0=`#ifdef USE_ENVMAP
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
#endif`,Z0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,$0=`#ifdef USE_ENVMAP
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
#endif`,K0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,J0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,j0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Q0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,tx=`#ifdef USE_GRADIENTMAP
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
}`,ex=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,nx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ix=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,sx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,rx=`#ifdef USE_ENVMAP
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
#endif`,ox=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ax=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,cx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hx=`PhysicalMaterial material;
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
#endif`,ux=`uniform sampler2D dfgLUT;
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
}`,dx=`
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
#endif`,fx=`#if defined( RE_IndirectDiffuse )
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
#endif`,px=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,mx=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,gx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,_x=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,xx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,vx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Sx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Mx=`#if defined( USE_POINTS_UV )
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
#endif`,Ex=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Tx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ax=`#if defined( USE_MORPHCOLORS )
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
#endif`,Rx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cx=`#ifdef USE_MORPHTARGETS
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
#endif`,Px=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ix=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Lx=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Nx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ux=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Ox=`#ifdef USE_NORMALMAP
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
#endif`,Fx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Bx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,kx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,zx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Hx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gx=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Vx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Wx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Xx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,qx=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Yx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Zx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,$x=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Kx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Jx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,jx=`float getShadowMask() {
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
}`,Qx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ty=`#ifdef USE_SKINNING
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
#endif`,ey=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ny=`#ifdef USE_SKINNING
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
#endif`,iy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,sy=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,ry=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,oy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,ay=`#ifdef USE_TRANSMISSION
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
#endif`,ly=`#ifdef USE_TRANSMISSION
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
#endif`,cy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,hy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var dy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,fy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,py=`uniform sampler2D t2D;
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
}`,my=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,gy=`uniform float backgroundBlurriness;
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
}`,_y=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,yy=`#include <common>
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
}`,vy=`#if DEPTH_PACKING == 3200
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
}`,by=`#define DISTANCE
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
}`,Sy=`#define DISTANCE
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
}`,My=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ey=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ty=`uniform float scale;
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
}`,wy=`uniform vec3 diffuse;
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
}`,Ay=`#include <common>
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
}`,Ry=`uniform vec3 diffuse;
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
}`,Cy=`#define LAMBERT
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
}`,Py=`#define LAMBERT
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
}`,Iy=`#define MATCAP
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
}`,Ly=`#define MATCAP
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
}`,Ny=`#define NORMAL
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
}`,Dy=`#define NORMAL
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
}`,Uy=`#define PHONG
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
}`,Oy=`#define PHONG
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
}`,Fy=`#define STANDARD
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
}`,By=`#define STANDARD
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
}`,ky=`#define TOON
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
}`,zy=`#define TOON
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
}`,Hy=`uniform float size;
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
}`,Gy=`uniform vec3 diffuse;
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
}`,Vy=`#include <common>
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
}`,Wy=`uniform vec3 color;
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
}`,Xy=`uniform float rotation;
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
}`,qy=`uniform vec3 diffuse;
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
}`,le={alphahash_fragment:p0,alphahash_pars_fragment:m0,alphamap_fragment:g0,alphamap_pars_fragment:_0,alphatest_fragment:x0,alphatest_pars_fragment:y0,aomap_fragment:v0,aomap_pars_fragment:b0,batching_pars_vertex:S0,batching_vertex:M0,begin_vertex:E0,beginnormal_vertex:T0,bsdfs:w0,iridescence_fragment:A0,bumpmap_pars_fragment:R0,clipping_planes_fragment:C0,clipping_planes_pars_fragment:P0,clipping_planes_pars_vertex:I0,clipping_planes_vertex:L0,color_fragment:N0,color_pars_fragment:D0,color_pars_vertex:U0,color_vertex:O0,common:F0,defaultnormal_vertex:B0,displacementmap_pars_vertex:k0,displacementmap_vertex:z0,emissivemap_fragment:H0,emissivemap_pars_fragment:G0,colorspace_fragment:V0,colorspace_pars_fragment:W0,envmap_fragment:X0,envmap_common_pars_fragment:q0,envmap_pars_fragment:Y0,envmap_pars_vertex:Z0,envmap_physical_pars_fragment:rx,envmap_vertex:$0,fog_vertex:K0,fog_pars_vertex:J0,fog_fragment:j0,fog_pars_fragment:Q0,gradientmap_pars_fragment:tx,lightmap_pars_fragment:ex,lights_lambert_fragment:nx,lights_lambert_pars_fragment:ix,lights_pars_begin:sx,lights_toon_fragment:ox,lights_toon_pars_fragment:ax,lights_phong_fragment:lx,lights_phong_pars_fragment:cx,lights_physical_fragment:hx,lights_physical_pars_fragment:ux,lights_fragment_begin:dx,lights_fragment_maps:fx,lights_fragment_end:px,lightprobes_pars_fragment:mx,logdepthbuf_fragment:gx,logdepthbuf_pars_fragment:_x,logdepthbuf_pars_vertex:xx,logdepthbuf_vertex:yx,map_fragment:vx,map_pars_fragment:bx,map_particle_fragment:Sx,map_particle_pars_fragment:Mx,metalnessmap_fragment:Ex,metalnessmap_pars_fragment:Tx,morphinstance_vertex:wx,morphcolor_vertex:Ax,morphnormal_vertex:Rx,morphtarget_pars_vertex:Cx,morphtarget_vertex:Px,normal_fragment_begin:Ix,normal_fragment_maps:Lx,normal_pars_fragment:Nx,normal_pars_vertex:Dx,normal_vertex:Ux,normalmap_pars_fragment:Ox,clearcoat_normal_fragment_begin:Fx,clearcoat_normal_fragment_maps:Bx,clearcoat_pars_fragment:kx,iridescence_pars_fragment:zx,opaque_fragment:Hx,packing:Gx,premultiplied_alpha_fragment:Vx,project_vertex:Wx,dithering_fragment:Xx,dithering_pars_fragment:qx,roughnessmap_fragment:Yx,roughnessmap_pars_fragment:Zx,shadowmap_pars_fragment:$x,shadowmap_pars_vertex:Kx,shadowmap_vertex:Jx,shadowmask_pars_fragment:jx,skinbase_vertex:Qx,skinning_pars_vertex:ty,skinning_vertex:ey,skinnormal_vertex:ny,specularmap_fragment:iy,specularmap_pars_fragment:sy,tonemapping_fragment:ry,tonemapping_pars_fragment:oy,transmission_fragment:ay,transmission_pars_fragment:ly,uv_pars_fragment:cy,uv_pars_vertex:hy,uv_vertex:uy,worldpos_vertex:dy,background_vert:fy,background_frag:py,backgroundCube_vert:my,backgroundCube_frag:gy,cube_vert:_y,cube_frag:xy,depth_vert:yy,depth_frag:vy,distance_vert:by,distance_frag:Sy,equirect_vert:My,equirect_frag:Ey,linedashed_vert:Ty,linedashed_frag:wy,meshbasic_vert:Ay,meshbasic_frag:Ry,meshlambert_vert:Cy,meshlambert_frag:Py,meshmatcap_vert:Iy,meshmatcap_frag:Ly,meshnormal_vert:Ny,meshnormal_frag:Dy,meshphong_vert:Uy,meshphong_frag:Oy,meshphysical_vert:Fy,meshphysical_frag:By,meshtoon_vert:ky,meshtoon_frag:zy,points_vert:Hy,points_frag:Gy,shadow_vert:Vy,shadow_frag:Wy,sprite_vert:Xy,sprite_frag:qy},Ct={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new jt}},envmap:{envMap:{value:null},envMapRotation:{value:new jt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new jt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new jt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new jt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new jt},normalScale:{value:new Kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new jt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new jt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new jt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new jt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0},uvTransform:{value:new jt}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new Kt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new jt},alphaMap:{value:null},alphaMapTransform:{value:new jt},alphaTest:{value:0}}},ai={basic:{uniforms:_n([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.fog]),vertexShader:le.meshbasic_vert,fragmentShader:le.meshbasic_frag},lambert:{uniforms:_n([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,Ct.lights,{emissive:{value:new se(0)},envMapIntensity:{value:1}}]),vertexShader:le.meshlambert_vert,fragmentShader:le.meshlambert_frag},phong:{uniforms:_n([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,Ct.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:le.meshphong_vert,fragmentShader:le.meshphong_frag},standard:{uniforms:_n([Ct.common,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.roughnessmap,Ct.metalnessmap,Ct.fog,Ct.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag},toon:{uniforms:_n([Ct.common,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.gradientmap,Ct.fog,Ct.lights,{emissive:{value:new se(0)}}]),vertexShader:le.meshtoon_vert,fragmentShader:le.meshtoon_frag},matcap:{uniforms:_n([Ct.common,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,{matcap:{value:null}}]),vertexShader:le.meshmatcap_vert,fragmentShader:le.meshmatcap_frag},points:{uniforms:_n([Ct.points,Ct.fog]),vertexShader:le.points_vert,fragmentShader:le.points_frag},dashed:{uniforms:_n([Ct.common,Ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:le.linedashed_vert,fragmentShader:le.linedashed_frag},depth:{uniforms:_n([Ct.common,Ct.displacementmap]),vertexShader:le.depth_vert,fragmentShader:le.depth_frag},normal:{uniforms:_n([Ct.common,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,{opacity:{value:1}}]),vertexShader:le.meshnormal_vert,fragmentShader:le.meshnormal_frag},sprite:{uniforms:_n([Ct.sprite,Ct.fog]),vertexShader:le.sprite_vert,fragmentShader:le.sprite_frag},background:{uniforms:{uvTransform:{value:new jt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:le.background_vert,fragmentShader:le.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new jt}},vertexShader:le.backgroundCube_vert,fragmentShader:le.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:le.cube_vert,fragmentShader:le.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:le.equirect_vert,fragmentShader:le.equirect_frag},distance:{uniforms:_n([Ct.common,Ct.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:le.distance_vert,fragmentShader:le.distance_frag},shadow:{uniforms:_n([Ct.lights,Ct.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:le.shadow_vert,fragmentShader:le.shadow_frag}};ai.physical={uniforms:_n([ai.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new jt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new jt},clearcoatNormalScale:{value:new Kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new jt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new jt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new jt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new jt},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new jt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new jt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new jt},transmissionSamplerSize:{value:new Kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new jt},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new jt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new jt},anisotropyVector:{value:new Kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new jt}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag};var La={r:0,b:0,g:0},Yy=new Jt,Wp=new jt;Wp.set(-1,0,0,0,1,0,0,0,1);function Zy(p,m,g,_,x,y){let v=new se(0),b=x===!0?0:1,S,M,T=null,w=0,E=null;function A(I){let U=I.isScene===!0?I.background:null;if(U&&U.isTexture){let N=I.backgroundBlurriness>0;U=m.get(U,N)}return U}function P(I){let U=!1,N=A(I);if(N===null)R(v,b);else if(N&&N.isColor)R(N,1),U=!0;let F=p.xr.getEnvironmentBlendMode();if(F==="additive")g.buffers.color.setClear(0,0,0,1,y);else if(F==="alpha-blend")g.buffers.color.setClear(0,0,0,0,y);if(p.autoClear||U)g.buffers.depth.setTest(!0),g.buffers.depth.setMask(!0),g.buffers.color.setMask(!0),p.clear(p.autoClearColor,p.autoClearDepth,p.autoClearStencil)}function D(I,U){let N=A(U);if(N&&N.isCubeTexture){if(M===void 0)M=new nn(new tr(1,1,1),new Ai({name:"BackgroundCubeMaterial",uniforms:ms(ai.backgroundCube.uniforms),vertexShader:ai.backgroundCube.vertexShader,fragmentShader:ai.backgroundCube.fragmentShader,side:gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),M.geometry.deleteAttribute("normal"),M.geometry.deleteAttribute("uv"),M.onBeforeRender=function(F,z,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(M.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),_.update(M);if(M.material.uniforms.envMap.value=N,M.material.uniforms.backgroundBlurriness.value=U.backgroundBlurriness,M.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,M.material.uniforms.backgroundRotation.value.setFromMatrix4(Yy.makeRotationFromEuler(U.backgroundRotation)).transpose(),N.isRenderTargetTexture===!1)M.material.uniforms.backgroundRotation.value.premultiply(Wp);if(M.material.toneMapped=he.getTransfer(N.colorSpace)!==Ie,T!==N||w!==N.version||E!==p.toneMapping)M.material.needsUpdate=!0,T=N,w=N.version,E=p.toneMapping;M.layers.enableAll(),I.unshift(M,M.geometry,M.material,0,0,null)}else if(N&&N.isTexture){if(S===void 0)S=new nn(new Jr(2,2),new Ai({name:"BackgroundMaterial",uniforms:ms(ai.background.uniforms),vertexShader:ai.background.vertexShader,fragmentShader:ai.background.fragmentShader,side:vi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),Object.defineProperty(S.material,"map",{get:function(){return this.uniforms.t2D.value}}),_.update(S);if(S.material.uniforms.t2D.value=N,S.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,S.material.toneMapped=he.getTransfer(N.colorSpace)!==Ie,N.matrixAutoUpdate===!0)N.updateMatrix();if(S.material.uniforms.uvTransform.value.copy(N.matrix),T!==N||w!==N.version||E!==p.toneMapping)S.material.needsUpdate=!0,T=N,w=N.version,E=p.toneMapping;S.layers.enableAll(),I.unshift(S,S.geometry,S.material,0,0,null)}}function R(I,U){I.getRGB(La,yh(p)),g.buffers.color.setClear(La.r,La.g,La.b,U,y)}function C(){if(M!==void 0)M.geometry.dispose(),M.material.dispose(),M=void 0;if(S!==void 0)S.geometry.dispose(),S.material.dispose(),S=void 0}return{getClearColor:function(){return v},setClearColor:function(I,U=1){v.set(I),b=U,R(v,b)},getClearAlpha:function(){return b},setClearAlpha:function(I){b=I,R(v,b)},render:P,addToRenderList:D,dispose:C}}function $y(p,m){let g=p.getParameter(p.MAX_VERTEX_ATTRIBS),_={},x=E(null),y=x,v=!1;function b(H,W,K,G,Q){let st=!1,tt=w(H,G,K,W);if(y!==tt)y=tt,M(y.object);if(st=A(H,G,K,Q),st)P(H,G,K,Q);if(Q!==null)m.update(Q,p.ELEMENT_ARRAY_BUFFER);if(st||v){if(v=!1,N(H,W,K,G),Q!==null)p.bindBuffer(p.ELEMENT_ARRAY_BUFFER,m.get(Q).buffer)}}function S(){return p.createVertexArray()}function M(H){return p.bindVertexArray(H)}function T(H){return p.deleteVertexArray(H)}function w(H,W,K,G){let Q=G.wireframe===!0,st=_[W.id];if(st===void 0)st={},_[W.id]=st;let tt=H.isInstancedMesh===!0?H.id:0,mt=st[tt];if(mt===void 0)mt={},st[tt]=mt;let rt=mt[K.id];if(rt===void 0)rt={},mt[K.id]=rt;let ht=rt[Q];if(ht===void 0)ht=E(S()),rt[Q]=ht;return ht}function E(H){let W=[],K=[],G=[];for(let Q=0;Q<g;Q++)W[Q]=0,K[Q]=0,G[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:K,attributeDivisors:G,object:H,attributes:{},index:null}}function A(H,W,K,G){let Q=y.attributes,st=W.attributes,tt=0,mt=K.getAttributes();for(let rt in mt)if(mt[rt].location>=0){let xt=Q[rt],At=st[rt];if(At===void 0){if(rt==="instanceMatrix"&&H.instanceMatrix)At=H.instanceMatrix;if(rt==="instanceColor"&&H.instanceColor)At=H.instanceColor}if(xt===void 0)return!0;if(xt.attribute!==At)return!0;if(At&&xt.data!==At.data)return!0;tt++}if(y.attributesNum!==tt)return!0;if(y.index!==G)return!0;return!1}function P(H,W,K,G){let Q={},st=W.attributes,tt=0,mt=K.getAttributes();for(let rt in mt)if(mt[rt].location>=0){let xt=st[rt];if(xt===void 0){if(rt==="instanceMatrix"&&H.instanceMatrix)xt=H.instanceMatrix;if(rt==="instanceColor"&&H.instanceColor)xt=H.instanceColor}let At={};if(At.attribute=xt,xt&&xt.data)At.data=xt.data;Q[rt]=At,tt++}y.attributes=Q,y.attributesNum=tt,y.index=G}function D(){let H=y.newAttributes;for(let W=0,K=H.length;W<K;W++)H[W]=0}function R(H){C(H,0)}function C(H,W){let K=y.newAttributes,G=y.enabledAttributes,Q=y.attributeDivisors;if(K[H]=1,G[H]===0)p.enableVertexAttribArray(H),G[H]=1;if(Q[H]!==W)p.vertexAttribDivisor(H,W),Q[H]=W}function I(){let H=y.newAttributes,W=y.enabledAttributes;for(let K=0,G=W.length;K<G;K++)if(W[K]!==H[K])p.disableVertexAttribArray(K),W[K]=0}function U(H,W,K,G,Q,st,tt){if(tt===!0)p.vertexAttribIPointer(H,W,K,Q,st);else p.vertexAttribPointer(H,W,K,G,Q,st)}function N(H,W,K,G){D();let Q=G.attributes,st=K.getAttributes(),tt=W.defaultAttributeValues;for(let mt in st){let rt=st[mt];if(rt.location>=0){let ht=Q[mt];if(ht===void 0){if(mt==="instanceMatrix"&&H.instanceMatrix)ht=H.instanceMatrix;if(mt==="instanceColor"&&H.instanceColor)ht=H.instanceColor}if(ht!==void 0){let xt=ht.normalized,At=ht.itemSize,at=m.get(ht);if(at===void 0)continue;let{buffer:pt,type:Pt,bytesPerElement:zt}=at,Ht=Pt===p.INT||Pt===p.UNSIGNED_INT||ht.gpuType===Ec;if(ht.isInterleavedBufferAttribute){let Dt=ht.data,Qt=Dt.isInterleavedBuffer===!0?Dt.stride:Dt.itemSize,te=ht.offset;if(Dt.isInstancedInterleavedBuffer||Dt.isInstancedBufferAttribute){for(let Ut=0;Ut<rt.locationSize;Ut++)C(rt.location+Ut,Dt.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=Dt.meshPerAttribute*Dt.count}else for(let Ut=0;Ut<rt.locationSize;Ut++)R(rt.location+Ut);p.bindBuffer(p.ARRAY_BUFFER,pt);for(let Ut=0;Ut<rt.locationSize;Ut++)U(rt.location+Ut,At/rt.locationSize,Pt,xt,Qt*zt,(te+At/rt.locationSize*Ut)*zt,Ht)}else{if(ht.isInstancedBufferAttribute){for(let Dt=0;Dt<rt.locationSize;Dt++)C(rt.location+Dt,ht.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=ht.meshPerAttribute*ht.count}else for(let Dt=0;Dt<rt.locationSize;Dt++)R(rt.location+Dt);p.bindBuffer(p.ARRAY_BUFFER,pt);for(let Dt=0;Dt<rt.locationSize;Dt++)U(rt.location+Dt,At/rt.locationSize,Pt,xt,At*zt,At/rt.locationSize*Dt*zt,Ht)}}else if(tt!==void 0){let xt=tt[mt];if(xt!==void 0)switch(xt.length){case 2:p.vertexAttrib2fv(rt.location,xt);break;case 3:p.vertexAttrib3fv(rt.location,xt);break;case 4:p.vertexAttrib4fv(rt.location,xt);break;default:p.vertexAttrib1fv(rt.location,xt)}}}}I()}function F(){V();for(let H in _){let W=_[H];for(let K in W){let G=W[K];for(let Q in G){let st=G[Q];for(let tt in st)T(st[tt].object),delete st[tt];delete G[Q]}}delete _[H]}}function z(H){if(_[H.id]===void 0)return;let W=_[H.id];for(let K in W){let G=W[K];for(let Q in G){let st=G[Q];for(let tt in st)T(st[tt].object),delete st[tt];delete G[Q]}}delete _[H.id]}function L(H){for(let W in _){let K=_[W];for(let G in K){let Q=K[G];if(Q[H.id]===void 0)continue;let st=Q[H.id];for(let tt in st)T(st[tt].object),delete st[tt];delete Q[H.id]}}}function O(H){for(let W in _){let K=_[W],G=H.isInstancedMesh===!0?H.id:0,Q=K[G];if(Q===void 0)continue;for(let st in Q){let tt=Q[st];for(let mt in tt)T(tt[mt].object),delete tt[mt];delete Q[st]}if(delete K[G],Object.keys(K).length===0)delete _[W]}}function V(){if(Y(),v=!0,y===x)return;y=x,M(y.object)}function Y(){x.geometry=null,x.program=null,x.wireframe=!1}return{setup:b,reset:V,resetDefaultState:Y,dispose:F,releaseStatesOfGeometry:z,releaseStatesOfObject:O,releaseStatesOfProgram:L,initAttributes:D,enableAttribute:R,disableUnusedAttributes:I}}function Ky(p,m,g){let _;function x(S){_=S}function y(S,M){p.drawArrays(_,S,M),g.update(M,_,1)}function v(S,M,T){if(T===0)return;p.drawArraysInstanced(_,S,M,T),g.update(M,_,T)}function b(S,M,T){if(T===0)return;m.get("WEBGL_multi_draw").multiDrawArraysWEBGL(_,S,0,M,0,T);let E=0;for(let A=0;A<T;A++)E+=M[A];g.update(E,_,1)}this.setMode=x,this.render=y,this.renderInstances=v,this.renderMultiDraw=b}function Jy(p,m,g,_){let x;function y(){if(x!==void 0)return x;if(m.has("EXT_texture_filter_anisotropic")===!0){let L=m.get("EXT_texture_filter_anisotropic");x=p.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else x=0;return x}function v(L){if(L!==zn&&_.convert(L)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function b(L){let O=L===ri&&(m.has("EXT_color_buffer_half_float")||m.has("EXT_color_buffer_float"));if(L!==Jn&&L!==bi&&!O&&_.convert(L)!==p.getParameter(p.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function S(L){if(L==="highp"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.HIGH_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.HIGH_FLOAT).precision>0)return"highp";L="mediump"}if(L==="mediump"){if(p.getShaderPrecisionFormat(p.VERTEX_SHADER,p.MEDIUM_FLOAT).precision>0&&p.getShaderPrecisionFormat(p.FRAGMENT_SHADER,p.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let M=g.precision!==void 0?g.precision:"highp",T=S(M);if(T!==M)Xt("WebGLRenderer:",M,"not supported, using",T,"instead."),M=T;let w=g.reversedDepthBuffer===!0&&m.has("EXT_clip_control"),E=g.logarithmicDepthBuffer===!0&&w===!1;if(g.reversedDepthBuffer===!0&&w===!1)Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(g.logarithmicDepthBuffer===!0&&w===!0)Xt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let A=p.getParameter(p.MAX_TEXTURE_IMAGE_UNITS),P=p.getParameter(p.MAX_VERTEX_TEXTURE_IMAGE_UNITS),D=p.getParameter(p.MAX_TEXTURE_SIZE),R=p.getParameter(p.MAX_CUBE_MAP_TEXTURE_SIZE),C=p.getParameter(p.MAX_VERTEX_ATTRIBS),I=p.getParameter(p.MAX_VERTEX_UNIFORM_VECTORS),U=p.getParameter(p.MAX_VARYING_VECTORS),N=p.getParameter(p.MAX_FRAGMENT_UNIFORM_VECTORS),F=p.getParameter(p.MAX_SAMPLES),z=p.getParameter(p.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:y,getMaxPrecision:S,textureFormatReadable:v,textureTypeReadable:b,precision:M,logarithmicDepthBuffer:E,reversedDepthBuffer:w,maxTextures:A,maxVertexTextures:P,maxTextureSize:D,maxCubemapSize:R,maxAttributes:C,maxVertexUniforms:I,maxVaryings:U,maxFragmentUniforms:N,maxSamples:F,samples:z}}function jy(p){let m=this,g=null,_=0,x=!1,y=!1,v=new on,b=new jt,S={value:null,needsUpdate:!1};this.uniform=S,this.numPlanes=0,this.numIntersection=0,this.init=function(w,E){let A=w.length!==0||E||_!==0||x;return x=E,_=w.length,A},this.beginShadows=function(){y=!0,T(null)},this.endShadows=function(){y=!1},this.setGlobalState=function(w,E){g=T(w,E,0)},this.setState=function(w,E,A){let{clippingPlanes:P,clipIntersection:D,clipShadows:R}=w,C=p.get(w);if(!x||P===null||P.length===0||y&&!R)if(y)T(null);else M();else{let I=y?0:_,U=I*4,N=C.clippingState||null;S.value=N,N=T(P,E,U,A);for(let F=0;F!==U;++F)N[F]=g[F];C.clippingState=N,this.numIntersection=D?this.numPlanes:0,this.numPlanes+=I}};function M(){if(S.value!==g)S.value=g,S.needsUpdate=_>0;m.numPlanes=_,m.numIntersection=0}function T(w,E,A,P){let D=w!==null?w.length:0,R=null;if(D!==0){if(R=S.value,P!==!0||R===null){let C=A+D*4,I=E.matrixWorldInverse;if(b.getNormalMatrix(I),R===null||R.length<C)R=new Float32Array(C);for(let U=0,N=A;U!==D;++U,N+=4)v.copy(w[U]).applyMatrix4(I,b),v.normal.toArray(R,N),R[N+3]=v.constant}S.value=R,S.needsUpdate=!0}return m.numPlanes=D,m.numIntersection=0,R}}class Ua extends Hn{constructor(p=1,m={}){super(p,p,m);this.isWebGLCubeRenderTarget=!0;let g={width:p,height:p,depth:1},_=[g,g,g,g,g,g];this.texture=new xa(_),this._setTextureOptions(m),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(p,m){this.texture.type=m.type,this.texture.colorSpace=m.colorSpace,this.texture.generateMipmaps=m.generateMipmaps,this.texture.minFilter=m.minFilter,this.texture.magFilter=m.magFilter;let g={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},_=new tr(5,5,5),x=new Ai({name:"CubemapFromEquirect",uniforms:ms(g.uniforms),vertexShader:g.vertexShader,fragmentShader:g.fragmentShader,side:gn,blending:as});x.uniforms.tEquirect.value=m;let y=new nn(_,x),v=m.minFilter;if(m.minFilter===Kn)m.minFilter=Rn;return new Qr(1,10,this).update(p,y),m.minFilter=v,y.geometry.dispose(),y.material.dispose(),this}clear(p,m=!0,g=!0,_=!0){let x=p.getRenderTarget();for(let y=0;y<6;y++)p.setRenderTarget(this,y),p.clear(m,g,_);p.setRenderTarget(x)}}var Sp=256,Qy=3,tv=20,Xp=256,qp=16,ev=3,nv=new q,iv=new se;class Da{constructor(p){this._renderer=p,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Qr(1,10,null),this._boxMesh=new nn(new tr(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(p,m=0,g=0.1,_=100,x={}){let{size:y=256,position:v=nv}=x,b=this._renderer;this._setSize(y);let S=this._allocateTarget(),M=this._getSourceTarget(!0);if(m>0)M.texture.mipmapsAutoUpdate=!1;let{autoClear:T,autoClearColor:w,autoClearDepth:E,autoClearStencil:A}=b,P=p.background;if(b.autoClear=!0,b.autoClearColor=!0,b.autoClearDepth=!0,b.autoClearStencil=!0,P===null)p.background=b.getClearColor(iv);let D=new Qr(g,_,M);if(D.position.copy(v),D.update(b,p),b.autoClear=T,b.autoClearColor=w,b.autoClearDepth=E,b.autoClearStencil=A,p.background=P,m>0)M.texture.mipmapsAutoUpdate=!0,this._blur(S,m);return this._applyPMREM(S),S}fromEquirectangular(p,m=null){return this._fromTexture(p,m)}fromCubemap(p,m=null){return this._fromTexture(p,m)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Tp(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Ep(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(p,m){return m>0?1-Math.sqrt(1-p/m):0}_setSize(p){this._cubeSize=Math.max(Sp,dh(p))}_fromTexture(p,m){if(p.mapping===kr||p.mapping===$s)this._setSize(p.image.length===0?Sp:p.image[0].width||p.image[0].image.width);else this._setSize(p.image.width/4);let g=m||this._allocateTarget();return this._textureToCubemap(p),this._applyPMREM(g),g}_allocateTarget(){let p=this._cubeSize,m=Mp(p,!1,!1),g=Math.log2(p)-Qy;for(let _=0;_<=g;_++)m.texture.mipmaps.push({width:p>>_,height:p>>_});return m.texture.name="PMREM",m.texture.isPMREMTexture=!0,m}_getSourceTarget(p=!1){let m=this._cubeSize,g=this._sourceTarget;if(g===null||g.width!==m||p&&g.depthBuffer===!1){if(g!==null)g.dispose();this._sourceTarget=Mp(m,!0,p)}return this._sourceTarget}_compileMaterial(p){this._boxMesh.material=p,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(p,m,g){let _=this._boxMesh,x=this._cubeCamera;_.material=g,x.renderTarget=p,x.activeMipmapLevel=m;let y=p.width>>m;p.viewport.set(0,0,y,y),x.update(this._renderer,_),p.viewport.set(0,0,p.width,p.height)}_textureToCubemap(p){let m;if(p.mapping===kr||p.mapping===$s){if(this._cubemapMaterial===null)this._cubemapMaterial=Tp();m=this._cubemapMaterial,m.uniforms.flipEnvMap.value=p.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Ep();m=this._equirectMaterial}m.uniforms.envMap.value=p,this._renderCube(this._getSourceTarget(),0,m)}_applyPMREM(p){if(this._ggxMaterial===null)this._ggxMaterial=sv(),this._integrationMaterial=rv();let m=this._cubeSize,g=p.texture.mipmaps.length-1,_=this._ggxMaterial.uniforms;_.envMap.value=this._sourceTarget.texture;let x=this._integrationMaterial.uniforms;x.envMap.value=this._sourceTarget.texture,x.sourceLod.value=Math.log2(m/qp);for(let y=0;y<=g;y++){let v=Da.lodToRoughness(y,g);if(y>g-ev)x.roughness.value=v,this._renderCube(p,y,this._integrationMaterial);else{let b=v>0?Math.log2(m)+0.5*Math.log2(6/(Xp*Math.pow(v,4)))+0.5:0;_.roughness.value=v,_.lodBias.value=b,this._renderCube(p,y,this._ggxMaterial)}}}_blur(p,m){if(this._blurMaterial===null)this._blurMaterial=ov();let g=this._blurMaterial,_=g.uniforms,x=this._sourceTarget;_.sigma.value=Math.min(m,Math.PI)/Math.SQRT2,_.envMap.value=x.texture,this._renderCube(p,0,g),_.envMap.value=p.texture,this._renderCube(x,0,g)}}function Mp(p,m,g){return new Ua(p,{minFilter:Kn,generateMipmaps:m,type:ri,colorSpace:sh,depthBuffer:g})}function so(p,m,g){return new Ai({name:p,uniforms:m,vertexShader:le.cube_vert,fragmentShader:g,side:gn,blending:as,depthTest:!1,depthWrite:!1})}function sv(){return so("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

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
	`)}function rv(){return so("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:qp}},`

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
	`)}function ov(){return so("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${tv}
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
	`)}function Ep(){return so("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Tp(){return so("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function av(p){let m=new WeakMap,g=new WeakMap,_=null;function x(E,A=!1){if(E===null||E===void 0)return null;if(A)return v(E);return y(E)}function y(E){if(E&&E.isTexture){let A=E.mapping;if(A===na||A===ia)if(m.has(E)){let P=m.get(E).texture;return b(P,E.mapping)}else{let P=E.image;if(P&&P.height>0){let D=new Ua(P.height);return D.fromEquirectangularTexture(p,E),m.set(E,D),E.addEventListener("dispose",M),b(D.texture,E.mapping)}else return null}}return E}function v(E){if(E&&E.isTexture&&E.isPMREMTexture!==!0){let A=E.mapping,P=A===na||A===ia,D=A===kr||A===$s;if(P||D){let R=g.get(E),C=R!==void 0?R.texture.pmremVersion:0;if(E.isRenderTargetTexture&&E.pmremVersion!==C){if(_===null)_=new Da(p);return R=P?_.fromEquirectangular(E,R):_.fromCubemap(E,R),R.texture.pmremVersion=E.pmremVersion,g.set(E,R),R.texture}else if(R!==void 0)return R.texture;else{let I=E.image;if(P&&I&&I.height>0||D&&I&&S(I)){if(_===null)_=new Da(p);return R=P?_.fromEquirectangular(E):_.fromCubemap(E),R.texture.pmremVersion=E.pmremVersion,g.set(E,R),E.addEventListener("dispose",T),R.texture}else return null}}}return E}function b(E,A){if(A===na)E.mapping=kr;else if(A===ia)E.mapping=$s;return E}function S(E){let A=0,P=6;for(let D=0;D<P;D++)if(E[D]!==void 0)A++;return A===P}function M(E){let A=E.target;A.removeEventListener("dispose",M);let P=m.get(A);if(P!==void 0)m.delete(A),P.dispose()}function T(E){let A=E.target;A.removeEventListener("dispose",T);let P=g.get(A);if(P!==void 0)g.delete(A),P.dispose()}function w(){if(m=new WeakMap,g=new WeakMap,_!==null)_.dispose(),_=null}return{get:x,dispose:w}}function lv(p){let m={};function g(_){if(m[_]!==void 0)return m[_];let x=p.getExtension(_);return m[_]=x,x}return{has:function(_){return g(_)!==null},init:function(){g("EXT_color_buffer_float"),g("WEBGL_clip_cull_distance"),g("OES_texture_float_linear"),g("EXT_color_buffer_half_float"),g("WEBGL_multisampled_render_to_texture"),g("WEBGL_render_shared_exponent")},get:function(_){let x=g(_);if(x===null)Lr("WebGLRenderer: "+_+" extension not supported.");return x}}}function cv(p,m,g,_){let x={},y=new WeakMap,v=new FinalizationRegistry((P)=>delete x[P]);function b(P){S(P.target)}function S(P){if(P.index!==null)m.remove(P.index);for(let R in P.attributes)m.remove(P.attributes[R]);P.removeEventListener("dispose",b),delete x[P.id],v.unregister(P);let D=y.get(P);if(D)m.remove(D),y.delete(P);if(_.releaseStatesOfGeometry(P),P.isInstancedBufferGeometry===!0)delete P._maxInstanceCount;g.memory.geometries--}function M(P,D){if(x[D.id]!==void 0)return D;return D.addEventListener("dispose",b),x[D.id]=new WeakRef(D),v.register(D,D.id,D),g.memory.geometries++,D}function T(P){let D=P.attributes;for(let R in D)m.update(D[R],p.ARRAY_BUFFER)}function w(P){let D=P.index,R=P.attributes.position,C=0;if(R===void 0)return;let I=D!==null?D.array.length:R.array.length/3-1,N=new(R.count>=65535?ma:pa)(Math.ceil(I/3)*6,1),F=N.array;if(D!==null){let L=D.array;C=D.version;for(let O=0,V=0;O<I;O+=3){let Y=L[O+0],H=L[O+1],W=L[O+2];F[V++]=Y,F[V++]=H,F[V++]=H,F[V++]=W,F[V++]=W,F[V++]=Y}}else{C=R.version;for(let L=0,O=0;L<I;L+=3){let V=L+0,Y=L+1,H=L+2;F[O++]=V,F[O++]=Y,F[O++]=Y,F[O++]=H,F[O++]=H,F[O++]=V}}N.version=C;let z=y.get(P);if(z)m.remove(z);y.set(P,N)}function E(P){let D=y.get(P);if(D){let R=P.index;if(R!==null){if(D.version<R.version)w(P)}}else w(P);return y.get(P)}function A(){for(let P in x){let D=x[P].deref();if(D!==void 0)S(D)}}return{get:M,update:T,getWireframeAttribute:E,dispose:A}}function hv(p,m,g){let _;function x(w){_=w}let y,v;function b(w){y=w.type,v=w.bytesPerElement}function S(w,E){p.drawElements(_,E,y,w*v),g.update(E,_,1)}function M(w,E,A){if(A===0)return;p.drawElementsInstanced(_,E,y,w*v,A),g.update(E,_,A)}function T(w,E,A){if(A===0)return;m.get("WEBGL_multi_draw").multiDrawElementsWEBGL(_,E,0,y,w,0,A);let D=0;for(let R=0;R<A;R++)D+=E[R];g.update(D,_,1)}this.setMode=x,this.setIndex=b,this.render=S,this.renderInstances=M,this.renderMultiDraw=T}function uv(p){let m={geometries:0,textures:0},g={frame:0,calls:0,triangles:0,points:0,lines:0};function _(y,v,b){switch(g.calls++,v){case p.TRIANGLES:g.triangles+=b*(y/3);break;case p.LINES:g.lines+=b*(y/2);break;case p.LINE_STRIP:g.lines+=b*(y-1);break;case p.LINE_LOOP:g.lines+=b*y;break;case p.POINTS:g.points+=b*y;break;default:$t("WebGLInfo: Unknown draw mode:",v);break}}function x(){g.calls=0,g.triangles=0,g.points=0,g.lines=0}return{memory:m,render:g,programs:null,autoReset:!0,reset:x,update:_}}function dv(p,m,g){let _=new WeakMap,x=new Be;function y(v,b,S){let M=v.morphTargetInfluences,T=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,w=T!==void 0?T.length:0,E=_.get(b);if(E===void 0||E.count!==w){let V=function(){L.dispose(),_.delete(b),b.removeEventListener("dispose",V)};if(E!==void 0)E.texture.dispose();let A=b.morphAttributes.position!==void 0,P=b.morphAttributes.normal!==void 0,D=b.morphAttributes.color!==void 0,R=b.morphAttributes.position||[],C=b.morphAttributes.normal||[],I=b.morphAttributes.color||[],U=0;if(A===!0)U=1;if(P===!0)U=2;if(D===!0)U=3;let N=b.attributes.position.count*U,F=1;if(N>m.maxTextureSize)F=Math.ceil(N/m.maxTextureSize),N=m.maxTextureSize;let z=new Float32Array(N*F*4*w),L=new da(z,N,F,w);L.type=bi,L.needsUpdate=!0;let O=U*4;for(let Y=0;Y<w;Y++){let H=R[Y],W=C[Y],K=I[Y],G=N*F*4*Y;for(let Q=0;Q<H.count;Q++){let st=Q*O;if(A===!0)x.fromBufferAttribute(H,Q),z[G+st+0]=x.x,z[G+st+1]=x.y,z[G+st+2]=x.z,z[G+st+3]=0;if(P===!0)x.fromBufferAttribute(W,Q),z[G+st+4]=x.x,z[G+st+5]=x.y,z[G+st+6]=x.z,z[G+st+7]=0;if(D===!0)x.fromBufferAttribute(K,Q),z[G+st+8]=x.x,z[G+st+9]=x.y,z[G+st+10]=x.z,z[G+st+11]=K.itemSize===4?x.w:1}}E={count:w,texture:L,size:new Kt(N,F)},_.set(b,E),b.addEventListener("dispose",V)}if(v.isInstancedMesh===!0&&v.morphTexture!==null)S.getUniforms().setValue(p,"morphTexture",v.morphTexture,g);else{let A=0;for(let D=0;D<M.length;D++)A+=M[D];let P=b.morphTargetsRelative?1:1-A;S.getUniforms().setValue(p,"morphTargetBaseInfluence",P),S.getUniforms().setValue(p,"morphTargetInfluences",M)}S.getUniforms().setValue(p,"morphTargetsTexture",E.texture,g),S.getUniforms().setValue(p,"morphTargetsTextureSize",E.size)}return{update:y}}function fv(p,m,g,_,x){let y=new WeakMap;function v(M){let T=x.render.frame,w=M.geometry,E=m.get(M,w);if(y.get(E)!==T)m.update(E),y.set(E,T);if(M.isInstancedMesh){if(M.hasEventListener("dispose",S)===!1)M.addEventListener("dispose",S);if(y.get(M)!==T){if(g.update(M.instanceMatrix,p.ARRAY_BUFFER),M.instanceColor!==null)g.update(M.instanceColor,p.ARRAY_BUFFER);y.set(M,T)}}if(M.isSkinnedMesh){let A=M.skeleton;if(y.get(A)!==T)A.update(),y.set(A,T)}return E}function b(){y=new WeakMap}function S(M){let T=M.target;if(T.removeEventListener("dispose",S),_.releaseStatesOfObject(T),g.remove(T.instanceMatrix),T.instanceColor!==null)g.remove(T.instanceColor)}return{update:v,dispose:b}}var pv={[_c]:"LINEAR_TONE_MAPPING",[xc]:"REINHARD_TONE_MAPPING",[yc]:"CINEON_TONE_MAPPING",[vc]:"ACES_FILMIC_TONE_MAPPING",[Sc]:"AGX_TONE_MAPPING",[Mc]:"NEUTRAL_TONE_MAPPING",[bc]:"CUSTOM_TONE_MAPPING"};function mv(p,m,g,_,x,y){let v=new Hn(m,g,{type:p,depthBuffer:x,stencilBuffer:y,samples:_?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),b=null,S=null,M=null,T=new Ye;T.setAttribute("position",new an([-1,3,0,-1,-1,0,3,-1,0],3)),T.setAttribute("uv",new an([0,2,0,0,2,0],2));let w=new vh({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),E=new nn(T,w),A=new Aa(-1,1,1,-1,0,1),P=null,D=null,R=!1,C,I=null,U=[],N=!1;this.setSize=function(F,z){if(v.setSize(F,z),b!==null)b.setSize(F,z);if(S!==null)S.setSize(F,z);for(let L=0;L<U.length;L++){let O=U[L];if(O.setSize)O.setSize(F,z)}},this.setEffects=function(F){U=F,N=U.length>0&&U[0].isRenderPass===!0;let{width:z,height:L}=v;if(U.length>0&&b===null)b=new Hn(z,L,{type:ri,depthBuffer:!1,stencilBuffer:!1}),S=new Hn(z,L,{type:ri,depthBuffer:!1,stencilBuffer:!1});let O=x===!0&&U.some((V)=>V.needsDepthTexture===!0);if(O!==(v.depthTexture!==null)){if(O===!0&&M===null){if(M=new Vi(z,L),y===!0)M.format=ki,M.type=ls}v.dispose(),v.depthTexture=O?M:null,v.resolveDepthBuffer=O,v.storeMultisampledDepthBuffer=O}for(let V=0;V<U.length;V++){let Y=U[V];if(Y.setSize)Y.setSize(z,L);if(O&&Y.needsDepthTexture===!0&&Y.setDepthTexture)Y.setDepthTexture(M)}},this.begin=function(F,z){if(R)return!1;if(F.toneMapping===si&&U.length===0)return!1;if(I=z,z!==null){let{width:L,height:O}=z;if(v.width!==L||v.height!==O)this.setSize(L,O)}if(N===!1)F.setRenderTarget(v);return C=F.toneMapping,F.toneMapping=si,!0},this.hasRenderPass=function(){return N},this.end=function(F,z){F.toneMapping=C,R=!0;let L=v,O=b;for(let V=0;V<U.length;V++){let Y=U[V];if(Y.enabled===!1)continue;if(Y.render(F,O,L,z),Y.needsSwap!==!1)L=O,O=O===b?S:b}if(P!==F.outputColorSpace||D!==F.toneMapping){if(P=F.outputColorSpace,D=F.toneMapping,w.defines={},he.getTransfer(P)===Ie)w.defines.SRGB_TRANSFER="";let V=pv[D];if(V)w.defines[V]="";w.needsUpdate=!0}w.uniforms.tDiffuse.value=L.texture,F.setRenderTarget(I),F.render(E,A),I=null,R=!1},this.isCompositing=function(){return R},this.dispose=function(){if(v.dispose(),b!==null)b.dispose();if(S!==null)S.dispose();T.dispose(),w.dispose()}}var Yp=new We,Zp=new Vi(1,1),$p=new va(1),Kp=new da,Jp=new _h,jp=new xa,wp=[],Ap=[],Rp=new Float32Array(16),Cp=new Float32Array(9),Pp=new Float32Array(4);function er(p,m,g){let _=p[0];if(_<=0||_>0)return p;let x=m*g,y=wp[x];if(y===void 0)y=new Float32Array(x),wp[x]=y;if(m!==0){_.toArray(y,0);for(let v=1,b=0;v!==m;++v)b+=g,p[v].toArray(y,b)}return y}function Ze(p,m){if(p.length!==m.length)return!1;for(let g=0,_=p.length;g<_;g++)if(p[g]!==m[g])return!1;return!0}function $e(p,m){for(let g=0,_=m.length;g<_;g++)p[g]=m[g]}function Oa(p,m){let g=Ap[m];if(g===void 0)g=new Int32Array(m),Ap[m]=g;for(let _=0;_!==m;++_)g[_]=p.allocateTextureUnit();return g}function gv(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1f(this.addr,m),g[0]=m}function _v(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2f(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2fv(this.addr,m),$e(g,m)}}function xv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3f(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else if(m.r!==void 0){if(g[0]!==m.r||g[1]!==m.g||g[2]!==m.b)p.uniform3f(this.addr,m.r,m.g,m.b),g[0]=m.r,g[1]=m.g,g[2]=m.b}else{if(Ze(g,m))return;p.uniform3fv(this.addr,m),$e(g,m)}}function yv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4f(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4fv(this.addr,m),$e(g,m)}}function vv(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix2fv(this.addr,!1,m),$e(g,m)}else{if(Ze(g,_))return;Pp.set(_),p.uniformMatrix2fv(this.addr,!1,Pp),$e(g,_)}}function bv(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix3fv(this.addr,!1,m),$e(g,m)}else{if(Ze(g,_))return;Cp.set(_),p.uniformMatrix3fv(this.addr,!1,Cp),$e(g,_)}}function Sv(p,m){let g=this.cache,_=m.elements;if(_===void 0){if(Ze(g,m))return;p.uniformMatrix4fv(this.addr,!1,m),$e(g,m)}else{if(Ze(g,_))return;Rp.set(_),p.uniformMatrix4fv(this.addr,!1,Rp),$e(g,_)}}function Mv(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1i(this.addr,m),g[0]=m}function Ev(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2i(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2iv(this.addr,m),$e(g,m)}}function Tv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3i(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ze(g,m))return;p.uniform3iv(this.addr,m),$e(g,m)}}function wv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4i(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4iv(this.addr,m),$e(g,m)}}function Av(p,m){let g=this.cache;if(g[0]===m)return;p.uniform1ui(this.addr,m),g[0]=m}function Rv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y)p.uniform2ui(this.addr,m.x,m.y),g[0]=m.x,g[1]=m.y}else{if(Ze(g,m))return;p.uniform2uiv(this.addr,m),$e(g,m)}}function Cv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z)p.uniform3ui(this.addr,m.x,m.y,m.z),g[0]=m.x,g[1]=m.y,g[2]=m.z}else{if(Ze(g,m))return;p.uniform3uiv(this.addr,m),$e(g,m)}}function Pv(p,m){let g=this.cache;if(m.x!==void 0){if(g[0]!==m.x||g[1]!==m.y||g[2]!==m.z||g[3]!==m.w)p.uniform4ui(this.addr,m.x,m.y,m.z,m.w),g[0]=m.x,g[1]=m.y,g[2]=m.z,g[3]=m.w}else{if(Ze(g,m))return;p.uniform4uiv(this.addr,m),$e(g,m)}}function Fa(p){if(p.version===0)p.compareFunction=lh,p.needsUpdate=!0;return p}function Iv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let y;if(this.type===p.SAMPLER_2D_SHADOW)y=Fa(Zp);else y=Yp;g.setTexture2D(m||y,x)}function Lv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture3D(m||Jp,x)}function Nv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;let y;if(this.type===p.SAMPLER_CUBE_SHADOW)y=Fa($p);else y=jp;g.setTextureCube(m||y,x)}function Dv(p,m,g){let _=this.cache,x=g.allocateTextureUnit();if(_[0]!==x)p.uniform1i(this.addr,x),_[0]=x;g.setTexture2DArray(m||Kp,x)}function Uv(p){switch(p){case 5126:return gv;case 35664:return _v;case 35665:return xv;case 35666:return yv;case 35674:return vv;case 35675:return bv;case 35676:return Sv;case 5124:case 35670:return Mv;case 35667:case 35671:return Ev;case 35668:case 35672:return Tv;case 35669:case 35673:return wv;case 5125:return Av;case 36294:return Rv;case 36295:return Cv;case 36296:return Pv;case 35678:case 36198:case 36298:case 36306:case 35682:return Iv;case 35679:case 36299:case 36307:return Lv;case 35680:case 36300:case 36308:case 36293:return Nv;case 36289:case 36303:case 36311:case 36292:return Dv}}function Ov(p,m){p.uniform1fv(this.addr,m)}function Fv(p,m){let g=er(m,this.size,2);p.uniform2fv(this.addr,g)}function Bv(p,m){let g=er(m,this.size,3);p.uniform3fv(this.addr,g)}function kv(p,m){let g=er(m,this.size,4);p.uniform4fv(this.addr,g)}function zv(p,m){let g=er(m,this.size,4);p.uniformMatrix2fv(this.addr,!1,g)}function Hv(p,m){let g=er(m,this.size,9);p.uniformMatrix3fv(this.addr,!1,g)}function Gv(p,m){let g=er(m,this.size,16);p.uniformMatrix4fv(this.addr,!1,g)}function Vv(p,m){p.uniform1iv(this.addr,m)}function Wv(p,m){p.uniform2iv(this.addr,m)}function Xv(p,m){p.uniform3iv(this.addr,m)}function qv(p,m){p.uniform4iv(this.addr,m)}function Yv(p,m){p.uniform1uiv(this.addr,m)}function Zv(p,m){p.uniform2uiv(this.addr,m)}function $v(p,m){p.uniform3uiv(this.addr,m)}function Kv(p,m){p.uniform4uiv(this.addr,m)}function Jv(p,m,g){let _=this.cache,x=m.length,y=Oa(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),$e(_,y);let v;if(this.type===p.SAMPLER_2D_SHADOW)v=Fa(Zp);else v=Yp;for(let b=0;b!==x;++b)g.setTexture2D(m[b]||v,y[b])}function jv(p,m,g){let _=this.cache,x=m.length,y=Oa(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),$e(_,y);for(let v=0;v!==x;++v)g.setTexture3D(m[v]||Jp,y[v])}function Qv(p,m,g){let _=this.cache,x=m.length,y=Oa(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),$e(_,y);let v;if(this.type===p.SAMPLER_CUBE_SHADOW)v=Fa($p);else v=jp;for(let b=0;b!==x;++b)g.setTextureCube(m[b]||v,y[b])}function tb(p,m,g){let _=this.cache,x=m.length,y=Oa(g,x);if(!Ze(_,y))p.uniform1iv(this.addr,y),$e(_,y);for(let v=0;v!==x;++v)g.setTexture2DArray(m[v]||Kp,y[v])}function eb(p){switch(p){case 5126:return Ov;case 35664:return Fv;case 35665:return Bv;case 35666:return kv;case 35674:return zv;case 35675:return Hv;case 35676:return Gv;case 5124:case 35670:return Vv;case 35667:case 35671:return Wv;case 35668:case 35672:return Xv;case 35669:case 35673:return qv;case 5125:return Yv;case 36294:return Zv;case 36295:return $v;case 36296:return Kv;case 35678:case 36198:case 36298:case 36306:case 35682:return Jv;case 35679:case 36299:case 36307:return jv;case 35680:case 36300:case 36308:case 36293:return Qv;case 36289:case 36303:case 36311:case 36292:return tb}}class Qp{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.setValue=Uv(m.type)}}class tm{constructor(p,m,g){this.id=p,this.addr=g,this.cache=[],this.type=m.type,this.size=m.size,this.setValue=eb(m.type)}}class em{constructor(p){this.id=p,this.seq=[],this.map={}}setValue(p,m,g){let _=this.seq;for(let x=0,y=_.length;x!==y;++x){let v=_[x];v.setValue(p,m[v.id],g)}}}var Bh=/(\w+)(\])?(\[|\.)?/g;function Ip(p,m){p.seq.push(m),p.map[m.id]=m}function nb(p,m,g){let _=p.name,x=_.length;Bh.lastIndex=0;while(!0){let y=Bh.exec(_),v=Bh.lastIndex,b=y[1],S=y[2]==="]",M=y[3];if(S)b=b|0;if(M===void 0||M==="["&&v+2===x){Ip(g,M===void 0?new Qp(b,p,m):new tm(b,p,m));break}else{let w=g.map[b];if(w===void 0)w=new em(b),Ip(g,w);g=w}}}class io{constructor(p,m){this.seq=[],this.map={};let g=p.getProgramParameter(m,p.ACTIVE_UNIFORMS);for(let y=0;y<g;++y){let v=p.getActiveUniform(m,y),b=p.getUniformLocation(m,v.name);nb(v,b,this)}let _=[],x=[];for(let y of this.seq)if(y.type===p.SAMPLER_2D_SHADOW||y.type===p.SAMPLER_CUBE_SHADOW||y.type===p.SAMPLER_2D_ARRAY_SHADOW)_.push(y);else x.push(y);if(_.length>0)this.seq=_.concat(x)}setValue(p,m,g,_){let x=this.map[m];if(x!==void 0)x.setValue(p,g,_)}setOptional(p,m,g){let _=m[g];if(_!==void 0)this.setValue(p,g,_)}static upload(p,m,g,_){for(let x=0,y=m.length;x!==y;++x){let v=m[x],b=g[v.id];if(b.needsUpdate!==!1)v.setValue(p,b.value,_)}}static seqWithValue(p,m){let g=[];for(let _=0,x=p.length;_!==x;++_){let y=p[_];if(y.id in m)g.push(y)}return g}}function Lp(p,m,g){let _=p.createShader(m);return p.shaderSource(_,g),p.compileShader(_),_}var ib=37297,sb=0;function rb(p,m){let g=p.split(`
`),_=[],x=Math.max(m-6,0),y=Math.min(m+6,g.length);for(let v=x;v<y;v++){let b=v+1;_.push(`${b===m?">":" "} ${b}: ${g[v]}`)}return _.join(`
`)}var Np=new jt;function ob(p){he._getMatrix(Np,he.workingColorSpace,p);let m=`mat3( ${Np.elements.map((g)=>g.toFixed(4))} )`;switch(he.getTransfer(p)){case rh:return[m,"LinearTransferOETF"];case Ie:return[m,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",p),[m,"LinearTransferOETF"]}}function Dp(p,m,g){let _=p.getShaderParameter(m,p.COMPILE_STATUS),y=(p.getShaderInfoLog(m)||"").trim();if(_&&y==="")return"";let v=/ERROR: 0:(\d+)/.exec(y);if(v){let b=parseInt(v[1]);return g.toUpperCase()+`

`+y+`

`+rb(p.getShaderSource(m),b)}else return y}function ab(p,m){let g=ob(m);return[`vec4 ${p}( vec4 value ) {`,`	return ${g[1]}( vec4( ${g[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var lb={[_c]:"Linear",[xc]:"Reinhard",[yc]:"Cineon",[vc]:"ACESFilmic",[Sc]:"AgX",[Mc]:"Neutral",[bc]:"Custom"};function cb(p,m){let g=lb[m];if(g===void 0)return Xt("WebGLProgram: Unsupported toneMapping:",m),"vec3 "+p+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+p+"( vec3 color ) { return "+g+"ToneMapping( color ); }"}var Na=new q;function hb(){he.getLuminanceCoefficients(Na);let p=Na.x.toFixed(4),m=Na.y.toFixed(4),g=Na.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${p}, ${m}, ${g} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function ub(p){return[p.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",p.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(no).join(`
`)}function db(p){let m=[];for(let g in p){let _=p[g];if(_===!1)continue;m.push("#define "+g+" "+_)}return m.join(`
`)}function fb(p,m){let g={},_=p.getProgramParameter(m,p.ACTIVE_ATTRIBUTES);for(let x=0;x<_;x++){let y=p.getActiveAttrib(m,x),v=y.name,b=1;if(y.type===p.FLOAT_MAT2)b=2;if(y.type===p.FLOAT_MAT3)b=3;if(y.type===p.FLOAT_MAT4)b=4;g[v]={type:y.type,location:p.getAttribLocation(m,v),locationSize:b}}return g}function no(p){return p!==""}function Up(p,m){let g=m.numSpotLightShadows+m.numSpotLightMaps-m.numSpotLightShadowsWithMaps;return p.replace(/NUM_SUN_LIGHTS/g,m.numSunLights).replace(/NUM_DIR_LIGHTS/g,m.numDirLights).replace(/NUM_SPOT_LIGHTS/g,m.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,m.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,g).replace(/NUM_RECT_AREA_LIGHTS/g,m.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,m.numPointLights).replace(/NUM_HEMI_LIGHTS/g,m.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,m.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,m.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,m.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,m.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,m.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,m.numLightProbeGrids)}function Op(p,m){return p.replace(/NUM_CLIPPING_PLANES/g,m.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,m.numClippingPlanes-m.numClipIntersection)}var pb=/^[ \t]*#include +<([\w\d./]+)>/gm;function zh(p){return p.replace(pb,mb)}function mb(p,m){let g=le[m];if(g===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+m+">");return zh(g)}var gb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Fp(p){return p.replace(gb,_b)}function _b(p,m,g,_){let x="";for(let y=parseInt(m);y<parseInt(g);y++)x+=_.replace(/\[\s*i\s*\]/g,"[ "+y+" ]").replace(/UNROLLED_LOOP_INDEX/g,y);return x}function Bp(p){let m=`precision ${p.precision} float;
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
#define LOW_PRECISION`;return m}var xb={[Fr]:"SHADOWMAP_TYPE_PCF",[Ys]:"SHADOWMAP_TYPE_VSM"};function yb(p){return xb[p.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var vb={[$s]:"ENVMAP_MODE_REFRACTION"};function bb(p){if(p.envMap===!1)return"ENVMAP_MODE_REFLECTION";return vb[p.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Sb={[Xf]:"ENVMAP_BLENDING_MULTIPLY",[qf]:"ENVMAP_BLENDING_MIX",[Yf]:"ENVMAP_BLENDING_ADD"};function Mb(p){if(p.envMap===!1)return"ENVMAP_BLENDING_NONE";return Sb[p.combine]||"ENVMAP_BLENDING_NONE"}function Eb(p,m,g,_){let x=p.getContext(),{defines:y,vertexShader:v,fragmentShader:b}=g,S=yb(g),M=g.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",T=bb(g),w=Mb(g),E=ub(g),A=db(y),P=x.createProgram(),D,R,C=g.glslVersion?"#version "+g.glslVersion+`
`:"";if(g.isRawShaderMaterial){if(D=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter(no).join(`
`),D.length>0)D+=`
`;if(R=["#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A].filter(no).join(`
`),R.length>0)R+=`
`}else D=[Bp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",g.batching?"#define USE_BATCHING":"",g.batchingColor?"#define USE_BATCHING_COLOR":"",g.instancing?"#define USE_INSTANCING":"",g.instancingColor?"#define USE_INSTANCING_COLOR":"",g.instancingMorph?"#define USE_INSTANCING_MORPH":"",g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.map?"#define USE_MAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+T:"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.displacementMap?"#define USE_DISPLACEMENTMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.mapUv?"#define MAP_UV "+g.mapUv:"",g.alphaMapUv?"#define ALPHAMAP_UV "+g.alphaMapUv:"",g.lightMapUv?"#define LIGHTMAP_UV "+g.lightMapUv:"",g.aoMapUv?"#define AOMAP_UV "+g.aoMapUv:"",g.emissiveMapUv?"#define EMISSIVEMAP_UV "+g.emissiveMapUv:"",g.bumpMapUv?"#define BUMPMAP_UV "+g.bumpMapUv:"",g.normalMapUv?"#define NORMALMAP_UV "+g.normalMapUv:"",g.displacementMapUv?"#define DISPLACEMENTMAP_UV "+g.displacementMapUv:"",g.metalnessMapUv?"#define METALNESSMAP_UV "+g.metalnessMapUv:"",g.roughnessMapUv?"#define ROUGHNESSMAP_UV "+g.roughnessMapUv:"",g.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+g.anisotropyMapUv:"",g.clearcoatMapUv?"#define CLEARCOATMAP_UV "+g.clearcoatMapUv:"",g.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+g.clearcoatNormalMapUv:"",g.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+g.clearcoatRoughnessMapUv:"",g.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+g.diffuseRoughnessMapUv:"",g.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+g.iridescenceMapUv:"",g.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+g.iridescenceThicknessMapUv:"",g.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+g.sheenColorMapUv:"",g.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+g.sheenRoughnessMapUv:"",g.specularMapUv?"#define SPECULARMAP_UV "+g.specularMapUv:"",g.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+g.specularColorMapUv:"",g.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+g.specularIntensityMapUv:"",g.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+g.transmissionMapUv:"",g.thicknessMapUv?"#define THICKNESSMAP_UV "+g.thicknessMapUv:"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexNormals?"#define HAS_NORMAL":"",g.vertexColors?"#define USE_COLOR":"",g.vertexAlphas?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.flatShading?"#define FLAT_SHADED":"",g.skinning?"#define USE_SKINNING":"",g.morphTargets?"#define USE_MORPHTARGETS":"",g.morphNormals&&g.flatShading===!1?"#define USE_MORPHNORMALS":"",g.morphColors?"#define USE_MORPHCOLORS":"",g.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+g.morphTextureStride:"",g.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+g.morphTargetsCount:"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+S:"",g.sizeAttenuation?"#define USE_SIZEATTENUATION":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(no).join(`
`),R=[Bp(g),"#define SHADER_TYPE "+g.shaderType,"#define SHADER_NAME "+g.shaderName,A,g.useFog&&g.fog?"#define USE_FOG":"",g.useFog&&g.fogExp2?"#define FOG_EXP2":"",g.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",g.map?"#define USE_MAP":"",g.matcap?"#define USE_MATCAP":"",g.envMap?"#define USE_ENVMAP":"",g.envMap?"#define "+M:"",g.envMap?"#define "+T:"",g.envMap?"#define "+w:"",g.envMapPMREM?"#define ENVMAP_MAX_LOD "+g.envMapMaxLod+".0":"",g.envMapPMREM?"#define ENVMAP_SIZE "+g.envMapSize+".0":"",g.lightMap?"#define USE_LIGHTMAP":"",g.aoMap?"#define USE_AOMAP":"",g.bumpMap?"#define USE_BUMPMAP":"",g.normalMap?"#define USE_NORMALMAP":"",g.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",g.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",g.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",g.emissiveMap?"#define USE_EMISSIVEMAP":"",g.anisotropy?"#define USE_ANISOTROPY":"",g.anisotropyMap?"#define USE_ANISOTROPYMAP":"",g.clearcoat?"#define USE_CLEARCOAT":"",g.clearcoatMap?"#define USE_CLEARCOATMAP":"",g.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",g.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",g.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",g.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",g.dispersion?"#define USE_DISPERSION":"",g.retroreflection?"#define USE_RETROREFLECTION":"",g.iridescence?"#define USE_IRIDESCENCE":"",g.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",g.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",g.specularMap?"#define USE_SPECULARMAP":"",g.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",g.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",g.roughnessMap?"#define USE_ROUGHNESSMAP":"",g.metalnessMap?"#define USE_METALNESSMAP":"",g.alphaMap?"#define USE_ALPHAMAP":"",g.alphaTest?"#define USE_ALPHATEST":"",g.alphaHash?"#define USE_ALPHAHASH":"",g.sheen?"#define USE_SHEEN":"",g.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",g.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",g.transmission?"#define USE_TRANSMISSION":"",g.transmissionMap?"#define USE_TRANSMISSIONMAP":"",g.thicknessMap?"#define USE_THICKNESSMAP":"",g.vertexTangents&&g.flatShading===!1?"#define USE_TANGENT":"",g.vertexColors||g.instancingColor?"#define USE_COLOR":"",g.vertexAlphas||g.batchingColor?"#define USE_COLOR_ALPHA":"",g.vertexUv1s?"#define USE_UV1":"",g.vertexUv2s?"#define USE_UV2":"",g.vertexUv3s?"#define USE_UV3":"",g.pointsUvs?"#define USE_POINTS_UV":"",g.gradientMap?"#define USE_GRADIENTMAP":"",g.flatShading?"#define FLAT_SHADED":"",g.doubleSided?"#define DOUBLE_SIDED":"",g.flipSided?"#define FLIP_SIDED":"",g.shadowMapEnabled?"#define USE_SHADOWMAP":"",g.shadowMapEnabled?"#define "+S:"",g.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",g.numLightProbes>0?"#define USE_LIGHT_PROBES":"",g.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",g.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",g.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",g.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",g.toneMapping!==si?"#define TONE_MAPPING":"",g.toneMapping!==si?le.tonemapping_pars_fragment:"",g.toneMapping!==si?cb("toneMapping",g.toneMapping):"",g.dithering?"#define DITHERING":"",g.opaque?"#define OPAQUE":"",le.colorspace_pars_fragment,ab("linearToOutputTexel",g.outputColorSpace),hb(),g.useDepthPacking?"#define DEPTH_PACKING "+g.depthPacking:"",`
`].filter(no).join(`
`);if(v=zh(v),v=Up(v,g),v=Op(v,g),b=zh(b),b=Up(b,g),b=Op(b,g),v=Fp(v),b=Fp(b),g.isRawShaderMaterial!==!0)C=`#version 300 es
`,D=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+D,R=["#define varying in",g.glslVersion===ch?"":"layout(location = 0) out highp vec4 pc_fragColor;",g.glslVersion===ch?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+R;let I=C+D+v,U=C+R+b,N=Lp(x,x.VERTEX_SHADER,I),F=Lp(x,x.FRAGMENT_SHADER,U);if(x.attachShader(P,N),x.attachShader(P,F),g.index0AttributeName!==void 0)x.bindAttribLocation(P,0,g.index0AttributeName);else if(g.hasPositionAttribute===!0)x.bindAttribLocation(P,0,"position");x.linkProgram(P);function z(Y){if(p.debug.checkShaderErrors){let H=x.getProgramInfoLog(P)||"",W=x.getShaderInfoLog(N)||"",K=x.getShaderInfoLog(F)||"",G=H.trim(),Q=W.trim(),st=K.trim(),tt=!0,mt=!0;if(x.getProgramParameter(P,x.LINK_STATUS)===!1)if(tt=!1,typeof p.debug.onShaderError==="function")p.debug.onShaderError(x,P,N,F);else{let rt=Dp(x,N,"vertex"),ht=Dp(x,F,"fragment");$t("WebGLProgram: Shader Error "+x.getError()+" - VALIDATE_STATUS "+x.getProgramParameter(P,x.VALIDATE_STATUS)+`

Material Name: `+Y.name+`
Material Type: `+Y.type+`

Program Info Log: `+G+`
`+rt+`
`+ht)}else if(G!=="")Xt("WebGLProgram: Program Info Log:",G);else if(Q===""||st==="")mt=!1;if(mt)Y.diagnostics={runnable:tt,programLog:G,vertexShader:{log:Q,prefix:D},fragmentShader:{log:st,prefix:R}}}x.deleteShader(N),x.deleteShader(F),L=new io(x,P),O=fb(x,P)}let L;this.getUniforms=function(){if(L===void 0)z(this);return L};let O;this.getAttributes=function(){if(O===void 0)z(this);return O};let V=g.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(V===!1)V=x.getProgramParameter(P,ib);return V},this.destroy=function(){_.releaseStatesOfProgram(this),x.deleteProgram(P),this.program=void 0},this.type=g.shaderType,this.name=g.shaderName,this.id=sb++,this.cacheKey=m,this.usedTimes=1,this.program=P,this.vertexShader=N,this.fragmentShader=F,this}var Tb=0;class nm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(p,m,g){let _=this._getShaderCacheForMaterial(p);if(_.has(m)===!1)_.add(m),m.usedTimes++;if(_.has(g)===!1)_.add(g),g.usedTimes++;return this}remove(p){let m=this.materialCache.get(p);for(let g of m)if(g.usedTimes--,g.usedTimes===0)this.shaderCache.delete(g.code);return this.materialCache.delete(p),this}getVertexShaderStage(p){return this._getShaderStage(p.vertexShader)}getFragmentShaderStage(p){return this._getShaderStage(p.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(p){let m=this.materialCache,g=m.get(p);if(g===void 0)g=new Set,m.set(p,g);return g}_getShaderStage(p){let m=this.shaderCache,g=m.get(p);if(g===void 0)g=new im(p),m.set(p,g);return g}}class im{constructor(p){this.id=Tb++,this.code=p,this.usedTimes=0}}function wb(p){return p===cs||p===la||p===ca}function Ab(p,m,g,_,x,y){let v=new qr,b=new nm,S=new Set,M=[],T=new Map,w=_.logarithmicDepthBuffer,E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(L){if(S.add(L),L===0)return"uv";return`uv${L}`}function P(L,O,V,Y,H,W){let K=Y.fog,G=H.geometry,Q=L.isMeshStandardMaterial||L.isMeshLambertMaterial||L.isMeshPhongMaterial?Y.environment:null,st=L.isMeshStandardMaterial||L.isMeshLambertMaterial&&!L.envMap||L.isMeshPhongMaterial&&!L.envMap,tt=m.get(L.envMap||Q,st),mt=E[L.type],rt=_.precision;if(L.precision!==null){if(rt=_.getMaxPrecision(L.precision),rt!==L.precision)Xt("WebGLProgram.getParameters:",L.precision,"not supported, using",rt,"instead.")}let ht=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,xt=ht!==void 0?ht.length:0,At=0;if(G.morphAttributes.position!==void 0)At=1;if(G.morphAttributes.normal!==void 0)At=2;if(G.morphAttributes.color!==void 0)At=3;let at,pt,Pt,zt;if(mt){let Lt=ai[mt];at=Lt.vertexShader,pt=Lt.fragmentShader}else{at=L.vertexShader,pt=L.fragmentShader;let Lt=b.getVertexShaderStage(L),Ae=b.getFragmentShaderStage(L);b.update(L,Lt,Ae),Pt=Lt.id,zt=Ae.id}let Ht=p.getRenderTarget(),Dt=p.state.buffers.depth.getReversed(),Qt=H.isInstancedMesh===!0,te=H.isBatchedMesh===!0,Ut=!!L.map,Zt=!!L.matcap,qt=!!tt,pe=qt&&tt.isPMREMTexture===!0,me=!!L.aoMap,ye=!!L.lightMap,Te=!!L.bumpMap&&L.wireframe===!1,oe=!!L.normalMap,gt=!!L.displacementMap,ae=!!L.emissiveMap,ce=!!L.metalnessMap,ze=!!L.roughnessMap,j=L.anisotropy>0,vn=L.clearcoat>0,Me=L.diffuseRoughness>0,Ke=L.dispersion>0,Rt=L.retroreflectivity>0,De=L.iridescence>0,Yt=L.sheen>0,ee=L.transmission>0,cn=j&&!!L.anisotropyMap,X=vn&&!!L.clearcoatMap,B=vn&&!!L.clearcoatNormalMap,et=vn&&!!L.clearcoatRoughnessMap,_t=Me&&!!L.diffuseRoughnessMap,ft=De&&!!L.iridescenceMap,bt=De&&!!L.iridescenceThicknessMap,Et=Yt&&!!L.sheenColorMap,lt=Yt&&!!L.sheenRoughnessMap,dt=!!L.specularMap,St=!!L.specularColorMap,Z=!!L.specularIntensityMap,ut=ee&&!!L.transmissionMap,ct=ee&&!!L.thicknessMap,yt=!!L.gradientMap,vt=!!L.alphaMap,wt=L.alphaTest>0,Vt=!!L.alphaHash,Gt=!!L.extensions,It=si;if(L.toneMapped){if(Ht===null||Ht.isXRRenderTarget===!0)It=p.toneMapping}let Wt=pe?tt.isCompressedCubeTexture?tt.image[0].mipmaps:tt.mipmaps:null,re={shaderID:mt,shaderType:L.type,shaderName:L.name,vertexShader:at,fragmentShader:pt,defines:L.defines,customVertexShaderID:Pt,customFragmentShaderID:zt,isRawShaderMaterial:L.isRawShaderMaterial===!0,glslVersion:L.glslVersion,precision:rt,batching:te,batchingColor:te&&H._colorsTexture!==null,instancing:Qt,instancingColor:Qt&&H.instanceColor!==null,instancingMorph:Qt&&H.morphTexture!==null,outputColorSpace:Ht===null?p.outputColorSpace:Ht.isXRRenderTarget===!0?Ht.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!L.alphaToCoverage,map:Ut,matcap:Zt,envMap:qt,envMapMode:qt&&tt.mapping,envMapPMREM:pe,envMapMaxLod:pe?Wt.length-1:null,envMapSize:pe?Wt[0].width:null,aoMap:me,lightMap:ye,bumpMap:Te,normalMap:oe,displacementMap:gt,emissiveMap:ae,normalMapObjectSpace:oe&&L.normalMapType===ip,normalMapTangentSpace:oe&&L.normalMapType===ih,packedNormalMap:oe&&L.normalMapType===ih&&wb(L.normalMap.format),metalnessMap:ce,roughnessMap:ze,anisotropy:j,anisotropyMap:cn,clearcoat:vn,clearcoatMap:X,clearcoatNormalMap:B,clearcoatRoughnessMap:et,diffuseRoughness:Me,diffuseRoughnessMap:_t,dispersion:Ke,retroreflection:Rt,iridescence:De,iridescenceMap:ft,iridescenceThicknessMap:bt,sheen:Yt,sheenColorMap:Et,sheenRoughnessMap:lt,specularMap:dt,specularColorMap:St,specularIntensityMap:Z,transmission:ee,transmissionMap:ut,thicknessMap:ct,gradientMap:yt,opaque:L.transparent===!1&&L.blending===Br&&L.alphaToCoverage===!1,alphaMap:vt,alphaTest:wt,alphaHash:Vt,combine:L.combine,mapUv:Ut&&A(L.map.channel),aoMapUv:me&&A(L.aoMap.channel),lightMapUv:ye&&A(L.lightMap.channel),bumpMapUv:Te&&A(L.bumpMap.channel),normalMapUv:oe&&A(L.normalMap.channel),displacementMapUv:gt&&A(L.displacementMap.channel),emissiveMapUv:ae&&A(L.emissiveMap.channel),metalnessMapUv:ce&&A(L.metalnessMap.channel),roughnessMapUv:ze&&A(L.roughnessMap.channel),anisotropyMapUv:cn&&A(L.anisotropyMap.channel),clearcoatMapUv:X&&A(L.clearcoatMap.channel),clearcoatNormalMapUv:B&&A(L.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&A(L.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:_t&&A(L.diffuseRoughnessMap.channel),iridescenceMapUv:ft&&A(L.iridescenceMap.channel),iridescenceThicknessMapUv:bt&&A(L.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&A(L.sheenColorMap.channel),sheenRoughnessMapUv:lt&&A(L.sheenRoughnessMap.channel),specularMapUv:dt&&A(L.specularMap.channel),specularColorMapUv:St&&A(L.specularColorMap.channel),specularIntensityMapUv:Z&&A(L.specularIntensityMap.channel),transmissionMapUv:ut&&A(L.transmissionMap.channel),thicknessMapUv:ct&&A(L.thicknessMap.channel),alphaMapUv:vt&&A(L.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(oe||j),vertexNormals:!!G.attributes.normal,vertexColors:L.vertexColors,vertexAlphas:L.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!G.attributes.uv&&(Ut||vt),fog:!!K,useFog:L.fog===!0,fogExp2:!!K&&K.isFogExp2,flatShading:L.wireframe===!1&&(L.flatShading===!0||G.attributes.normal===void 0&&oe===!1&&(L.isMeshLambertMaterial||L.isMeshPhongMaterial||L.isMeshStandardMaterial||L.isMeshPhysicalMaterial)),sizeAttenuation:L.sizeAttenuation===!0,logarithmicDepthBuffer:w,reversedDepthBuffer:Dt,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:G.attributes.position!==void 0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:xt,morphTextureStride:At,numSunLights:O.sun.length,numDirLights:O.directional.length,numPointLights:O.point.length,numSpotLights:O.spot.length,numSpotLightMaps:O.spotLightMap.length,numRectAreaLights:O.rectArea.length,numHemiLights:O.hemi.length,numSunLightShadows:O.sunShadowMap.length,numDirLightShadows:O.directionalShadowMap.length,numPointLightShadows:O.pointShadowMap.length,numSpotLightShadows:O.spotShadowMap.length,numSpotLightShadowsWithMaps:O.numSpotLightShadowsWithMaps,numLightProbes:O.numLightProbes,numLightProbeGrids:W.filter((Lt)=>Lt.texture!==null).length,numClippingPlanes:y.numPlanes,numClipIntersection:y.numIntersection,dithering:L.dithering,shadowMapEnabled:p.shadowMap.enabled&&V.length>0,shadowMapType:p.shadowMap.type,toneMapping:It,decodeVideoTexture:Ut&&L.map.isVideoTexture===!0&&he.getTransfer(L.map.colorSpace)===Ie,decodeVideoTextureEmissive:ae&&L.emissiveMap.isVideoTexture===!0&&he.getTransfer(L.emissiveMap.colorSpace)===Ie,premultipliedAlpha:L.premultipliedAlpha,doubleSided:L.side===kn,flipSided:L.side===gn,useDepthPacking:L.depthPacking>=0,depthPacking:L.depthPacking||0,index0AttributeName:L.index0AttributeName,extensionClipCullDistance:Gt&&L.extensions.clipCullDistance===!0&&g.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Gt&&L.extensions.multiDraw===!0||te)&&g.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:g.has("KHR_parallel_shader_compile"),customProgramCacheKey:L.customProgramCacheKey()};return re.vertexUv1s=S.has(1),re.vertexUv2s=S.has(2),re.vertexUv3s=S.has(3),S.clear(),re}function D(L){let O=[];if(L.shaderID)O.push(L.shaderID);else O.push(L.customVertexShaderID),O.push(L.customFragmentShaderID);if(L.defines!==void 0)for(let V in L.defines)O.push(V),O.push(L.defines[V]);if(L.isRawShaderMaterial===!1)R(O,L),C(O,L),O.push(p.outputColorSpace);return O.push(L.customProgramCacheKey),O.join()}function R(L,O){L.push(O.precision),L.push(O.outputColorSpace),L.push(O.envMapMode),L.push(O.envMapPMREM),L.push(O.envMapMaxLod),L.push(O.envMapSize),L.push(O.mapUv),L.push(O.alphaMapUv),L.push(O.lightMapUv),L.push(O.aoMapUv),L.push(O.bumpMapUv),L.push(O.normalMapUv),L.push(O.displacementMapUv),L.push(O.emissiveMapUv),L.push(O.metalnessMapUv),L.push(O.roughnessMapUv),L.push(O.anisotropyMapUv),L.push(O.clearcoatMapUv),L.push(O.clearcoatNormalMapUv),L.push(O.clearcoatRoughnessMapUv),L.push(O.diffuseRoughnessMapUv),L.push(O.iridescenceMapUv),L.push(O.iridescenceThicknessMapUv),L.push(O.sheenColorMapUv),L.push(O.sheenRoughnessMapUv),L.push(O.specularMapUv),L.push(O.specularColorMapUv),L.push(O.specularIntensityMapUv),L.push(O.transmissionMapUv),L.push(O.thicknessMapUv),L.push(O.combine),L.push(O.fogExp2),L.push(O.sizeAttenuation),L.push(O.morphTargetsCount),L.push(O.numSunLights),L.push(O.numDirLights),L.push(O.numPointLights),L.push(O.numSpotLights),L.push(O.numSpotLightMaps),L.push(O.numHemiLights),L.push(O.numRectAreaLights),L.push(O.numSunLightShadows),L.push(O.numDirLightShadows),L.push(O.numPointLightShadows),L.push(O.numSpotLightShadows),L.push(O.numSpotLightShadowsWithMaps),L.push(O.numLightProbes),L.push(O.numLightProbeGrids),L.push(O.shadowMapType),L.push(O.toneMapping),L.push(O.numClippingPlanes),L.push(O.numClipIntersection),L.push(O.depthPacking)}function C(L,O){if(v.disableAll(),O.instancing)v.enable(0);if(O.instancingColor)v.enable(1);if(O.instancingMorph)v.enable(2);if(O.matcap)v.enable(3);if(O.envMap)v.enable(4);if(O.normalMapObjectSpace)v.enable(5);if(O.normalMapTangentSpace)v.enable(6);if(O.clearcoat)v.enable(7);if(O.iridescence)v.enable(8);if(O.alphaTest)v.enable(9);if(O.vertexColors)v.enable(10);if(O.vertexAlphas)v.enable(11);if(O.vertexUv1s)v.enable(12);if(O.vertexUv2s)v.enable(13);if(O.vertexUv3s)v.enable(14);if(O.vertexTangents)v.enable(15);if(O.anisotropy)v.enable(16);if(O.alphaHash)v.enable(17);if(O.batching)v.enable(18);if(O.dispersion)v.enable(19);if(O.retroreflection)v.enable(24);if(O.diffuseRoughness)v.enable(25);if(O.batchingColor)v.enable(20);if(O.gradientMap)v.enable(21);if(O.packedNormalMap)v.enable(22);if(O.vertexNormals)v.enable(23);if(L.push(v.mask),v.disableAll(),O.fog)v.enable(0);if(O.useFog)v.enable(1);if(O.flatShading)v.enable(2);if(O.logarithmicDepthBuffer)v.enable(3);if(O.reversedDepthBuffer)v.enable(4);if(O.skinning)v.enable(5);if(O.morphTargets)v.enable(6);if(O.morphNormals)v.enable(7);if(O.morphColors)v.enable(8);if(O.premultipliedAlpha)v.enable(9);if(O.shadowMapEnabled)v.enable(10);if(O.doubleSided)v.enable(11);if(O.flipSided)v.enable(12);if(O.useDepthPacking)v.enable(13);if(O.dithering)v.enable(14);if(O.transmission)v.enable(15);if(O.sheen)v.enable(16);if(O.opaque)v.enable(17);if(O.pointsUvs)v.enable(18);if(O.decodeVideoTexture)v.enable(19);if(O.decodeVideoTextureEmissive)v.enable(20);if(O.alphaToCoverage)v.enable(21);if(O.numLightProbeGrids>0)v.enable(22);if(O.hasPositionAttribute)v.enable(23);L.push(v.mask)}function I(L){let O=E[L.type],V;if(O){let Y=ai[O];V=mp.clone(Y.uniforms)}else V=L.uniforms;return V}function U(L,O){let V=T.get(O);if(V!==void 0)++V.usedTimes;else V=new Eb(p,O,L,x),M.push(V),T.set(O,V);return V}function N(L){if(--L.usedTimes===0){let O=M.indexOf(L);M[O]=M[M.length-1],M.pop(),T.delete(L.cacheKey),L.destroy()}}function F(L){b.remove(L)}function z(){b.dispose()}return{getParameters:P,getProgramCacheKey:D,getUniforms:I,acquireProgram:U,releaseProgram:N,releaseShaderCache:F,programs:M,dispose:z}}function Rb(){let p=new WeakMap;function m(v){return p.has(v)}function g(v){let b=p.get(v);if(b===void 0)b={},p.set(v,b);return b}function _(v){p.delete(v)}function x(v,b,S){p.get(v)[b]=S}function y(){p=new WeakMap}return{has:m,get:g,remove:_,update:x,dispose:y}}function Cb(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.material.id!==m.material.id)return p.material.id-m.material.id;else if(p.materialVariant!==m.materialVariant)return p.materialVariant-m.materialVariant;else if(p.z!==m.z)return p.z-m.z;else return p.id-m.id}function kp(p,m){if(p.groupOrder!==m.groupOrder)return p.groupOrder-m.groupOrder;else if(p.renderOrder!==m.renderOrder)return p.renderOrder-m.renderOrder;else if(p.z!==m.z)return m.z-p.z;else return p.id-m.id}function zp(){let p=[],m=0,g=[],_=[],x=[];function y(){m=0,g.length=0,_.length=0,x.length=0}function v(E){let A=0;if(E.isInstancedMesh)A+=2;if(E.isSkinnedMesh)A+=1;return A}function b(E,A,P,D,R,C){let I=p[m];if(I===void 0)I={id:E.id,object:E,geometry:A,material:P,materialVariant:v(E),groupOrder:D,renderOrder:E.renderOrder,z:R,group:C},p[m]=I;else I.id=E.id,I.object=E,I.geometry=A,I.material=P,I.materialVariant=v(E),I.groupOrder=D,I.renderOrder=E.renderOrder,I.z=R,I.group=C;return m++,I}function S(E,A,P,D,R,C,I){if(I.reversedDepth===!0)R=-R;let U=b(E,A,P,D,R,C);if(P.transmission>0)_.push(U);else if(P.transparent===!0)x.push(U);else g.push(U)}function M(E,A,P,D,R,C){let I=b(E,A,P,D,R,C);if(P.transmission>0)_.unshift(I);else if(P.transparent===!0)x.unshift(I);else g.unshift(I)}function T(E,A){if(g.length>1)g.sort(E||Cb);if(_.length>1)_.sort(A||kp);if(x.length>1)x.sort(A||kp)}function w(){for(let E=m,A=p.length;E<A;E++){let P=p[E];if(P.id===null)break;P.id=null,P.object=null,P.geometry=null,P.material=null,P.group=null}}return{opaque:g,transmissive:_,transparent:x,init:y,push:S,unshift:M,finish:w,sort:T}}function Pb(){let p=new WeakMap;function m(_,x){let y=p.get(_),v;if(y===void 0)v=new zp,p.set(_,[v]);else if(x>=y.length)v=new zp,y.push(v);else v=y[x];return v}function g(){p=new WeakMap}return{get:m,dispose:g}}function Ib(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={direction:new q,color:new se};break;case"SpotLight":g={position:new q,direction:new q,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":g={position:new q,color:new se,distance:0,decay:0};break;case"HemisphereLight":g={direction:new q,skyColor:new se,groundColor:new se};break;case"RectAreaLight":g={color:new se,position:new q,halfWidth:new q,halfHeight:new q};break}return p[m.id]=g,g}}}function Lb(){let p={};return{get:function(m){if(p[m.id]!==void 0)return p[m.id];let g;switch(m.type){case"SunLight":case"DirectionalLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"SpotLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"PointLight":g={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt,shadowCameraNear:1,shadowCameraFar:1000};break}return p[m.id]=g,g}}}var Nb=0;function Db(p,m){return(m.castShadow?2:0)-(p.castShadow?2:0)+(m.map?1:0)-(p.map?1:0)}function Ub(p){let m=new Ib,g=Lb(),_={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let M=0;M<9;M++)_.probe.push(new q);let x=new q,y=new Jt,v=new Jt;function b(M){let T=0,w=0,E=0;for(let W=0;W<9;W++)_.probe[W].set(0,0,0);let A=0,P=0,D=0,R=0,C=0,I=0,U=0,N=0,F=0,z=0,L=0,O=0,V=0,Y=0;M.sort(Db);for(let W=0,K=M.length;W<K;W++){let G=M[W],{color:Q,intensity:st,distance:tt}=G,mt=null;if(G.shadow&&G.shadow.map)if(G.shadow.map.texture.format===cs)mt=G.shadow.map.texture;else mt=G.shadow.map.depthTexture||G.shadow.map.texture;if(G.isAmbientLight)T+=Q.r*st,w+=Q.g*st,E+=Q.b*st;else if(G.isLightProbe){for(let rt=0;rt<9;rt++)_.probe[rt].addScaledVector(G.sh.coefficients[rt],st);Y++}else if(G.isSunLight){let rt=m.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let ht=G.shadow,xt=g.get(G);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize.copy(ht.mapSize).multiply(ht.getFrameExtents()),_.sunShadow[P]=xt,_.sunShadowMap[P]=mt;let At=ht.getViewportCount();for(let at=0;at<At;at++)_.sunShadowMatrix[D+at]=ht.getMatrix(at),_.sunShadowCascade[D+at]=ht._cascadeData[at];D+=At,P++}_.sun[A]=rt,A++}else if(G.isDirectionalLight){let rt=m.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let ht=G.shadow,xt=g.get(G);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,_.directionalShadow[R]=xt,_.directionalShadowMap[R]=mt,_.directionalShadowMatrix[R]=G.shadow.matrix,F++}_.directional[R]=rt,R++}else if(G.isSpotLight){let rt=m.get(G);rt.position.setFromMatrixPosition(G.matrixWorld),rt.color.copy(Q).multiplyScalar(st),rt.distance=tt,rt.coneCos=Math.cos(G.angle),rt.penumbraCos=Math.cos(G.angle*(1-G.penumbra)),rt.decay=G.decay,_.spot[I]=rt;let ht=G.shadow;if(G.map){if(_.spotLightMap[O]=G.map,O++,ht.updateMatrices(G),G.castShadow)V++}if(_.spotLightMatrix[I]=ht.matrix,G.castShadow){let xt=g.get(G);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,_.spotShadow[I]=xt,_.spotShadowMap[I]=mt,L++}I++}else if(G.isRectAreaLight){let rt=m.get(G);rt.color.copy(Q).multiplyScalar(st),rt.halfWidth.set(G.width*0.5,0,0),rt.halfHeight.set(0,G.height*0.5,0),_.rectArea[U]=rt,U++}else if(G.isPointLight){let rt=m.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),rt.distance=G.distance,rt.decay=G.decay,G.castShadow){let ht=G.shadow,xt=g.get(G);xt.shadowIntensity=ht.intensity,xt.shadowBias=ht.bias,xt.shadowNormalBias=ht.normalBias,xt.shadowRadius=ht.radius,xt.shadowMapSize=ht.mapSize,xt.shadowCameraNear=ht.camera.near,xt.shadowCameraFar=ht.camera.far,_.pointShadow[C]=xt,_.pointShadowMap[C]=mt,_.pointShadowMatrix[C]=G.shadow.matrix,z++}_.point[C]=rt,C++}else if(G.isHemisphereLight){let rt=m.get(G);rt.skyColor.copy(G.color).multiplyScalar(st),rt.groundColor.copy(G.groundColor).multiplyScalar(st),_.hemi[N]=rt,N++}}if(U>0)if(p.has("OES_texture_float_linear")===!0)_.rectAreaLTC1=Ct.LTC_FLOAT_1,_.rectAreaLTC2=Ct.LTC_FLOAT_2;else _.rectAreaLTC1=Ct.LTC_HALF_1,_.rectAreaLTC2=Ct.LTC_HALF_2;_.ambient[0]=T,_.ambient[1]=w,_.ambient[2]=E;let H=_.hash;if(H.sunLength!==A||H.directionalLength!==R||H.pointLength!==C||H.spotLength!==I||H.rectAreaLength!==U||H.hemiLength!==N||H.numSunShadows!==P||H.numDirectionalShadows!==F||H.numPointShadows!==z||H.numSpotShadows!==L||H.numSpotMaps!==O||H.numLightProbes!==Y)_.sun.length=A,_.directional.length=R,_.spot.length=I,_.rectArea.length=U,_.point.length=C,_.hemi.length=N,_.sunShadow.length=P,_.sunShadowMap.length=P,_.sunShadowMatrix.length=D,_.sunShadowCascade.length=D,_.directionalShadow.length=F,_.directionalShadowMap.length=F,_.directionalShadowMatrix.length=F,_.pointShadow.length=z,_.pointShadowMap.length=z,_.pointShadowMatrix.length=z,_.spotShadow.length=L,_.spotShadowMap.length=L,_.spotLightMatrix.length=L+O-V,_.spotLightMap.length=O,_.numSpotLightShadowsWithMaps=V,_.numLightProbes=Y,H.sunLength=A,H.directionalLength=R,H.pointLength=C,H.spotLength=I,H.rectAreaLength=U,H.hemiLength=N,H.numSunShadows=P,H.numDirectionalShadows=F,H.numPointShadows=z,H.numSpotShadows=L,H.numSpotMaps=O,H.numLightProbes=Y,_.version=Nb++}function S(M,T){let w=0,E=0,A=0,P=0,D=0,R=0,C=T.matrixWorldInverse;for(let I=0,U=M.length;I<U;I++){let N=M[I];if(N.isSunLight){let F=_.sun[w];F.direction.setFromMatrixPosition(N.matrixWorld),F.direction.transformDirection(C),w++}else if(N.isDirectionalLight){let F=_.directional[E];F.direction.setFromMatrixPosition(N.matrixWorld),x.setFromMatrixPosition(N.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(C),E++}else if(N.isSpotLight){let F=_.spot[P];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(C),F.direction.setFromMatrixPosition(N.matrixWorld),x.setFromMatrixPosition(N.target.matrixWorld),F.direction.sub(x),F.direction.transformDirection(C),P++}else if(N.isRectAreaLight){let F=_.rectArea[D];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(C),v.identity(),y.copy(N.matrixWorld),y.premultiply(C),v.extractRotation(y),F.halfWidth.set(N.width*0.5,0,0),F.halfHeight.set(0,N.height*0.5,0),F.halfWidth.applyMatrix4(v),F.halfHeight.applyMatrix4(v),D++}else if(N.isPointLight){let F=_.point[A];F.position.setFromMatrixPosition(N.matrixWorld),F.position.applyMatrix4(C),A++}else if(N.isHemisphereLight){let F=_.hemi[R];F.direction.setFromMatrixPosition(N.matrixWorld),F.direction.transformDirection(C),R++}}}return{setup:b,setupView:S,state:_}}function Hp(p){let m=new Ub(p),g=[],_=[],x=[];function y(w){T.camera=w,g.length=0,_.length=0,x.length=0}function v(w){if(w.isLightProbeGrid)x.push(w);else g.push(w)}function b(w){_.push(w)}function S(){m.setup(g),x.sort((w,E)=>w.priority-E.priority||w.id-E.id)}function M(w){m.setupView(g,w)}let T={lightsArray:g,shadowsArray:_,lightProbeGridArray:x,camera:null,lights:m,transmissionRenderTarget:{},textureUnits:0};return{init:y,state:T,setupLights:S,setupLightsView:M,pushLight:v,pushShadow:b}}function Ob(p){let m=new WeakMap;function g(x,y=0){let v=m.get(x),b;if(v===void 0)b=new Hp(p),m.set(x,[b]);else if(y>=v.length)b=new Hp(p),v.push(b);else b=v[y];return b}function _(){m=new WeakMap}return{get:g,dispose:_}}var Fb=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Bb=`uniform sampler2D shadow_pass;
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
}`,kb=[new q(1,0,0),new q(-1,0,0),new q(0,1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1)],zb=[new q(0,-1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1),new q(0,-1,0),new q(0,-1,0)],Gp=new Jt,eo=new q,kh=new q;function Hb(p,m,g){let _=new Oi,x=new Kt,y=new Kt,v=new Be,b=new bh,S=new Sh,M={},T=g.maxTextureSize,w={[vi]:gn,[gn]:vi,[kn]:kn},E=new Ai({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Kt},radius:{value:4}},vertexShader:Fb,fragmentShader:Bb}),A=E.clone();A.defines.HORIZONTAL_PASS=1;let P=new Ye;P.setAttribute("position",new Xe(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let D=new nn(P,E),R=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fr;let C=this.type;this.render=function(z,L,O){if(R.enabled===!1)return;if(R.autoUpdate===!1&&R.needsUpdate===!1)return;if(z.length===0)return;if(this.type===_f)Xt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Fr;let V=p.getRenderTarget(),Y=p.getActiveCubeFace(),H=p.getActiveMipmapLevel(),W=p.state;if(W.setBlending(as),W.buffers.depth.getReversed()===!0)W.buffers.color.setClear(0,0,0,0);else W.buffers.color.setClear(1,1,1,1);W.buffers.depth.setTest(!0),W.setScissorTest(!1);let K=C!==this.type;if(K)L.traverse(function(G){if(G.material)if(Array.isArray(G.material))G.material.forEach((Q)=>Q.needsUpdate=!0);else G.material.needsUpdate=!0});for(let G=0,Q=z.length;G<Q;G++){let st=z[G],tt=st.shadow;if(tt===void 0){Xt("WebGLShadowMap:",st,"has no shadow.");continue}if(tt.autoUpdate===!1&&tt.needsUpdate===!1)continue;x.copy(tt.mapSize);let mt=tt.getFrameExtents();if(x.multiply(mt),y.copy(tt.mapSize),x.x>T||x.y>T){if(x.x>T)y.x=Math.floor(T/mt.x),x.x=y.x*mt.x,tt.mapSize.x=y.x;if(x.y>T)y.y=Math.floor(T/mt.y),x.y=y.y*mt.y,tt.mapSize.y=y.y}let rt=p.state.buffers.depth.getReversed();if(tt.camera._reversedDepth=rt,tt.map===null||K===!0){if(tt.map!==null){if(tt.map.depthTexture!==null)tt.map.depthTexture.dispose(),tt.map.depthTexture=null;tt.map.dispose()}if(this.type===Ys){if(st.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}tt.map=new Hn(x.x,x.y,{format:cs,type:ri,minFilter:Rn,magFilter:Rn,generateMipmaps:!1}),tt.map.texture.name=st.name+".shadowMap",tt.map.depthTexture=new Vi(x.x,x.y,bi),tt.map.depthTexture.name=st.name+".shadowMapDepth",tt.map.depthTexture.format=Ks,tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Fi,tt.map.depthTexture.magFilter=Fi}else{if(st.isPointLight)tt.map=new Ua(x.x),tt.map.depthTexture=new va(x.x,Bi);else tt.map=new Hn(x.x,x.y),tt.map.depthTexture=new Vi(x.x,x.y,Bi);if(tt.map.depthTexture.name=st.name+".shadowMap",tt.map.depthTexture.format=Ks,this.type===Fr)tt.map.depthTexture.compareFunction=rt?ah:oh,tt.map.depthTexture.minFilter=Rn,tt.map.depthTexture.magFilter=Rn;else tt.map.depthTexture.compareFunction=null,tt.map.depthTexture.minFilter=Fi,tt.map.depthTexture.magFilter=Fi}tt.camera.updateProjectionMatrix()}if(tt.map.isWebGLCubeRenderTarget!==!0&&(tt.map.width!==x.x||tt.map.height!==x.y))tt.map.setSize(x.x,x.y);let ht=tt.map.isWebGLCubeRenderTarget?6:tt.getViewportCount();if(st.isPointLight!==!0)tt.updateMatrices(st,O);let xt=(tt.camera.layers.mask&4294967294)!==0?tt.camera.layers:O.layers;for(let At=0;At<ht;At++){let at=tt.getCamera(At);if(st.isPointLight){let{camera:pt,matrix:Pt}=tt,zt=st.distance||pt.far;if(zt!==pt.far)pt.far=zt,pt.updateProjectionMatrix();eo.setFromMatrixPosition(st.matrixWorld),pt.position.copy(eo),kh.copy(pt.position),kh.add(kb[At]),pt.up.copy(zb[At]),pt.lookAt(kh),pt.updateMatrixWorld(),Pt.makeTranslation(-eo.x,-eo.y,-eo.z),Gp.multiplyMatrices(pt.projectionMatrix,pt.matrixWorldInverse),tt._frustum.setFromProjectionMatrix(Gp,pt.coordinateSystem,pt.reversedDepth)}if(tt.map.isWebGLCubeRenderTarget)p.setRenderTarget(tt.map,At),p.clear();else{if(At===0)p.setRenderTarget(tt.map),p.clear();let pt=tt.getViewport(At);v.set(y.x*pt.x,y.y*pt.y,y.x*pt.z,y.y*pt.w),W.viewport(v)}_=tt.getFrustum(At),N(L,O,at,st,xt,this.type)}if(tt.isPointLightShadow!==!0&&this.type===Ys)I(tt,O);tt.needsUpdate=!1}C=this.type,R.needsUpdate=!1,p.setRenderTarget(V,Y,H)};function I(z,L){let O=m.update(D);if(E.defines.VSM_SAMPLES!==z.blurSamples)E.defines.VSM_SAMPLES=z.blurSamples,A.defines.VSM_SAMPLES=z.blurSamples,E.needsUpdate=!0,A.needsUpdate=!0;if(z.mapPass===null)z.mapPass=new Hn(x.x,x.y,{format:cs,type:ri});else if(z.mapPass.width!==z.map.width||z.mapPass.height!==z.map.height)z.mapPass.setSize(z.map.width,z.map.height);E.uniforms.shadow_pass.value=z.map.depthTexture,E.uniforms.resolution.value.set(z.map.width,z.map.height),E.uniforms.radius.value=z.radius,p.setRenderTarget(z.mapPass),p.clear(),p.renderBufferDirect(L,null,O,E,D,null),A.uniforms.shadow_pass.value=z.mapPass.texture,A.uniforms.resolution.value.set(z.map.width,z.map.height),A.uniforms.radius.value=z.radius,p.setRenderTarget(z.map),p.clear(),p.renderBufferDirect(L,null,O,A,D,null)}function U(z,L,O,V){let Y=null,H=O.isPointLight===!0?z.customDistanceMaterial:z.customDepthMaterial;if(H!==void 0)Y=H;else if(Y=O.isPointLight===!0?S:b,p.localClippingEnabled&&L.clipShadows===!0&&Array.isArray(L.clippingPlanes)&&L.clippingPlanes.length!==0||L.displacementMap&&L.displacementScale!==0||L.alphaMap&&L.alphaTest>0||L.map&&L.alphaTest>0||L.alphaToCoverage===!0){let W=Y.uuid,K=L.uuid,G=M[W];if(G===void 0)G={},M[W]=G;let Q=G[K];if(Q===void 0)Q=Y.clone(),G[K]=Q,L.addEventListener("dispose",F);Y=Q}if(Y.visible=L.visible,Y.wireframe=L.wireframe,V===Ys)Y.side=L.shadowSide!==null?L.shadowSide:L.side;else Y.side=L.shadowSide!==null?L.shadowSide:w[L.side];if(Y.alphaMap=L.alphaMap,Y.alphaTest=L.alphaToCoverage===!0?0.5:L.alphaTest,Y.map=L.map,Y.clipShadows=L.clipShadows,Y.clippingPlanes=L.clippingPlanes,Y.clipIntersection=L.clipIntersection,Y.displacementMap=L.displacementMap,Y.displacementScale=L.displacementScale,Y.displacementBias=L.displacementBias,Y.wireframeLinewidth=L.wireframeLinewidth,Y.linewidth=L.linewidth,O.isPointLight===!0&&Y.isMeshDistanceMaterial===!0){let W=p.properties.get(Y);W.light=O}return Y}function N(z,L,O,V,Y,H){if(z.visible===!1)return;if(z.layers.test(Y)&&(z.isMesh||z.isLine||z.isPoints)){if((z.castShadow||z.receiveShadow&&H===Ys)&&(!z.frustumCulled||z.intersectsFrustum(_))){z.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,z.matrixWorld);let G=m.update(z),Q=z.material;if(Array.isArray(Q)){let st=G.groups;for(let tt=0,mt=st.length;tt<mt;tt++){let rt=st[tt],ht=Q[rt.materialIndex];if(ht&&ht.visible){let xt=U(z,ht,V,H);z.onBeforeShadow(p,z,L,O,G,xt,rt),p.renderBufferDirect(O,null,G,xt,z,rt),z.onAfterShadow(p,z,L,O,G,xt,rt)}}}else if(Q.visible){let st=U(z,Q,V,H);z.onBeforeShadow(p,z,L,O,G,st,null),p.renderBufferDirect(O,null,G,st,z,null),z.onAfterShadow(p,z,L,O,G,st,null)}}}let K=z.children;for(let G=0,Q=K.length;G<Q;G++)N(K[G],L,O,V,Y,H)}function F(z){z.target.removeEventListener("dispose",F);for(let O in M){let V=M[O],Y=z.target.uuid;if(Y in V)V[Y].dispose(),delete V[Y]}}}function Gb(p,m){function g(){let Z=!1,ut=new Be,ct=null,yt=new Be(0,0,0,0);return{setMask:function(vt){if(ct!==vt&&!Z)p.colorMask(vt,vt,vt,vt),ct=vt},setLocked:function(vt){Z=vt},setClear:function(vt,wt,Vt,Gt,It){if(It===!0)vt*=Gt,wt*=Gt,Vt*=Gt;if(ut.set(vt,wt,Vt,Gt),yt.equals(ut)===!1)p.clearColor(vt,wt,Vt,Gt),yt.copy(ut)},reset:function(){Z=!1,ct=null,yt.set(-1,0,0,0)}}}function _(){let Z=!1,ut=!1,ct=null,yt=null,vt=null;return{setReversed:function(wt){if(ut!==wt){let Vt=m.get("EXT_clip_control");if(wt)Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT);else Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);ut=wt;let Gt=vt;vt=null,this.setClear(Gt)}},getReversed:function(){return ut},setTest:function(wt){if(wt)Dt(p.DEPTH_TEST);else Qt(p.DEPTH_TEST)},setMask:function(wt){if(ct!==wt&&!Z)p.depthMask(wt),ct=wt},setFunc:function(wt){if(ut)wt=dp[wt];if(yt!==wt){switch(wt){case Bf:p.depthFunc(p.NEVER);break;case kf:p.depthFunc(p.ALWAYS);break;case zf:p.depthFunc(p.LESS);break;case gc:p.depthFunc(p.LEQUAL);break;case Hf:p.depthFunc(p.EQUAL);break;case Gf:p.depthFunc(p.GEQUAL);break;case Vf:p.depthFunc(p.GREATER);break;case Wf:p.depthFunc(p.NOTEQUAL);break;default:p.depthFunc(p.LEQUAL)}yt=wt}},setLocked:function(wt){Z=wt},setClear:function(wt){if(vt!==wt){if(vt=wt,ut)wt=1-wt;p.clearDepth(wt)}},reset:function(){Z=!1,ct=null,yt=null,vt=null,ut=!1}}}function x(){let Z=!1,ut=null,ct=null,yt=null,vt=null,wt=null,Vt=null,Gt=null,It=null;return{setTest:function(Wt){if(!Z)if(Wt)Dt(p.STENCIL_TEST);else Qt(p.STENCIL_TEST)},setMask:function(Wt){if(ut!==Wt&&!Z)p.stencilMask(Wt),ut=Wt},setFunc:function(Wt,re,Lt){if(ct!==Wt||yt!==re||vt!==Lt)p.stencilFunc(Wt,re,Lt),ct=Wt,yt=re,vt=Lt},setOp:function(Wt,re,Lt){if(wt!==Wt||Vt!==re||Gt!==Lt)p.stencilOp(Wt,re,Lt),wt=Wt,Vt=re,Gt=Lt},setLocked:function(Wt){Z=Wt},setClear:function(Wt){if(It!==Wt)p.clearStencil(Wt),It=Wt},reset:function(){Z=!1,ut=null,ct=null,yt=null,vt=null,wt=null,Vt=null,Gt=null,It=null}}}let y=new g,v=new _,b=new x,S={},M=new WeakMap,T={},w={},E={},A=new WeakMap,P=[],D=null,R=!1,C=null,I=null,U=null,N=null,F=null,z=null,L=null,O=new se(0,0,0),V=0,Y=!1,H=null,W=null,K=null,G=null,Q=null,st=p.getParameter(p.MAX_COMBINED_TEXTURE_IMAGE_UNITS),tt=!1,mt=0,rt=p.getParameter(p.VERSION);if(rt.indexOf("WebGL")!==-1)mt=parseFloat(/^WebGL (\d)/.exec(rt)[1]),tt=mt>=1;else if(rt.indexOf("OpenGL ES")!==-1)mt=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),tt=mt>=2;let ht=null,xt={},At=p.getParameter(p.SCISSOR_BOX),at=p.getParameter(p.VIEWPORT),pt=new Be().fromArray(At),Pt=new Be().fromArray(at);function zt(Z,ut,ct,yt){let vt=new Uint8Array(4),wt=p.createTexture();p.bindTexture(Z,wt),p.texParameteri(Z,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(Z,p.TEXTURE_MAG_FILTER,p.NEAREST);for(let Vt=0;Vt<ct;Vt++)if(Z===p.TEXTURE_3D||Z===p.TEXTURE_2D_ARRAY)p.texImage3D(ut,0,p.RGBA,1,1,yt,0,p.RGBA,p.UNSIGNED_BYTE,vt);else p.texImage2D(ut+Vt,0,p.RGBA,1,1,0,p.RGBA,p.UNSIGNED_BYTE,vt);return wt}let Ht={};Ht[p.TEXTURE_2D]=zt(p.TEXTURE_2D,p.TEXTURE_2D,1),Ht[p.TEXTURE_CUBE_MAP]=zt(p.TEXTURE_CUBE_MAP,p.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ht[p.TEXTURE_2D_ARRAY]=zt(p.TEXTURE_2D_ARRAY,p.TEXTURE_2D_ARRAY,1,1),Ht[p.TEXTURE_3D]=zt(p.TEXTURE_3D,p.TEXTURE_3D,1,1),y.setClear(0,0,0,1),v.setClear(1),b.setClear(0),Dt(p.DEPTH_TEST),v.setFunc(gc),Te(!1),oe(dc),Dt(p.CULL_FACE),me(as);function Dt(Z){if(T[Z]!==!0)p.enable(Z),T[Z]=!0}function Qt(Z){if(T[Z]!==!1)p.disable(Z),T[Z]=!1}function te(Z,ut){if(E[Z]!==ut){if(p.bindFramebuffer(Z,ut),E[Z]=ut,Z===p.DRAW_FRAMEBUFFER)E[p.FRAMEBUFFER]=ut;if(Z===p.FRAMEBUFFER)E[p.DRAW_FRAMEBUFFER]=ut;return!0}return!1}function Ut(Z,ut){let ct=P,yt=!1;if(Z){if(ct=A.get(ut),ct===void 0)ct=[],A.set(ut,ct);let vt=Z.textures;if(ct.length!==vt.length||ct[0]!==p.COLOR_ATTACHMENT0){for(let wt=0,Vt=vt.length;wt<Vt;wt++)ct[wt]=p.COLOR_ATTACHMENT0+wt;ct.length=vt.length,yt=!0}}else if(ct[0]!==p.BACK)ct[0]=p.BACK,yt=!0;if(yt)p.drawBuffers(ct)}function Zt(Z){if(D!==Z)return p.useProgram(Z),D=Z,!0;return!1}let qt={[Zs]:p.FUNC_ADD,[yf]:p.FUNC_SUBTRACT,[vf]:p.FUNC_REVERSE_SUBTRACT};qt[bf]=p.MIN,qt[Sf]=p.MAX;let pe={[Mf]:p.ZERO,[Ef]:p.ONE,[Tf]:p.SRC_COLOR,[Af]:p.SRC_ALPHA,[Nf]:p.SRC_ALPHA_SATURATE,[If]:p.DST_COLOR,[Cf]:p.DST_ALPHA,[wf]:p.ONE_MINUS_SRC_COLOR,[Rf]:p.ONE_MINUS_SRC_ALPHA,[Lf]:p.ONE_MINUS_DST_COLOR,[Pf]:p.ONE_MINUS_DST_ALPHA,[Df]:p.CONSTANT_COLOR,[Uf]:p.ONE_MINUS_CONSTANT_COLOR,[Of]:p.CONSTANT_ALPHA,[Ff]:p.ONE_MINUS_CONSTANT_ALPHA};function me(Z,ut,ct,yt,vt,wt,Vt,Gt,It,Wt){if(Z===as){if(R===!0)Qt(p.BLEND),R=!1;return}if(R===!1)Dt(p.BLEND),R=!0;if(Z!==xf){if(Z!==C||Wt!==Y){if(I!==Zs||F!==Zs)p.blendEquation(p.FUNC_ADD),I=Zs,F=Zs;if(Wt)switch(Z){case Br:p.blendFuncSeparate(p.ONE,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case fc:p.blendFunc(p.ONE,p.ONE);break;case pc:p.blendFuncSeparate(p.ZERO,p.ONE_MINUS_SRC_COLOR,p.ZERO,p.ONE);break;case mc:p.blendFuncSeparate(p.DST_COLOR,p.ONE_MINUS_SRC_ALPHA,p.ZERO,p.ONE);break;default:$t("WebGLState: Invalid blending: ",Z);break}else switch(Z){case Br:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE_MINUS_SRC_ALPHA,p.ONE,p.ONE_MINUS_SRC_ALPHA);break;case fc:p.blendFuncSeparate(p.SRC_ALPHA,p.ONE,p.ONE,p.ONE);break;case pc:$t("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case mc:$t("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$t("WebGLState: Invalid blending: ",Z);break}U=null,N=null,z=null,L=null,O.set(0,0,0),V=0,C=Z,Y=Wt}return}if(vt=vt||ut,wt=wt||ct,Vt=Vt||yt,ut!==I||vt!==F)p.blendEquationSeparate(qt[ut],qt[vt]),I=ut,F=vt;if(ct!==U||yt!==N||wt!==z||Vt!==L)p.blendFuncSeparate(pe[ct],pe[yt],pe[wt],pe[Vt]),U=ct,N=yt,z=wt,L=Vt;if(Gt.equals(O)===!1||It!==V)p.blendColor(Gt.r,Gt.g,Gt.b,It),O.copy(Gt),V=It;C=Z,Y=!1}function ye(Z,ut){Z.side===kn?Qt(p.CULL_FACE):Dt(p.CULL_FACE);let ct=Z.side===gn;if(ut)ct=!ct;Te(ct),Z.blending===Br&&Z.transparent===!1?me(as):me(Z.blending,Z.blendEquation,Z.blendSrc,Z.blendDst,Z.blendEquationAlpha,Z.blendSrcAlpha,Z.blendDstAlpha,Z.blendColor,Z.blendAlpha,Z.premultipliedAlpha),v.setFunc(Z.depthFunc),v.setTest(Z.depthTest),v.setMask(Z.depthWrite),y.setMask(Z.colorWrite);let yt=Z.stencilWrite;if(b.setTest(yt),yt)b.setMask(Z.stencilWriteMask),b.setFunc(Z.stencilFunc,Z.stencilRef,Z.stencilFuncMask),b.setOp(Z.stencilFail,Z.stencilZFail,Z.stencilZPass);ae(Z.polygonOffset,Z.polygonOffsetFactor,Z.polygonOffsetUnits),Z.alphaToCoverage===!0?Dt(p.SAMPLE_ALPHA_TO_COVERAGE):Qt(p.SAMPLE_ALPHA_TO_COVERAGE)}function Te(Z){if(H!==Z){if(Z)p.frontFace(p.CW);else p.frontFace(p.CCW);H=Z}}function oe(Z){if(Z!==mf){if(Dt(p.CULL_FACE),Z!==W)if(Z===dc)p.cullFace(p.BACK);else if(Z===gf)p.cullFace(p.FRONT);else p.cullFace(p.FRONT_AND_BACK)}else Qt(p.CULL_FACE);W=Z}function gt(Z){if(Z!==K){if(tt)p.lineWidth(Z);K=Z}}function ae(Z,ut,ct){if(Z){if(Dt(p.POLYGON_OFFSET_FILL),G!==ut||Q!==ct){if(G=ut,Q=ct,v.getReversed())ut=-ut,ct=-ct;p.polygonOffset(ut,ct)}}else Qt(p.POLYGON_OFFSET_FILL)}function ce(Z){if(Z)Dt(p.SCISSOR_TEST);else Qt(p.SCISSOR_TEST)}function ze(Z){if(Z===void 0)Z=p.TEXTURE0+st-1;if(ht!==Z)p.activeTexture(Z),ht=Z}function j(Z,ut,ct){if(ct===void 0)if(ht===null)ct=p.TEXTURE0+st-1;else ct=ht;let yt=xt[ct];if(yt===void 0)yt={type:void 0,texture:void 0},xt[ct]=yt;if(yt.type!==Z||yt.texture!==ut){if(ht!==ct)p.activeTexture(ct),ht=ct;p.bindTexture(Z,ut||Ht[Z]),yt.type=Z,yt.texture=ut}}function vn(){let Z=xt[ht];if(Z!==void 0&&Z.type!==void 0)p.bindTexture(Z.type,null),Z.type=void 0,Z.texture=void 0}function Me(){try{p.compressedTexImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Ke(){try{p.compressedTexImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Rt(){try{p.texSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function De(){try{p.texSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function Yt(){try{p.compressedTexSubImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function ee(){try{p.compressedTexSubImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function cn(){try{p.texStorage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function X(){try{p.texStorage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function B(){try{p.texImage2D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function et(){try{p.texImage3D(...arguments)}catch(Z){$t("WebGLState:",Z)}}function _t(Z){if(w[Z]!==void 0)return w[Z];else return p.getParameter(Z)}function ft(Z,ut){if(w[Z]!==ut)p.pixelStorei(Z,ut),w[Z]=ut}function bt(Z){if(pt.equals(Z)===!1)p.scissor(Z.x,Z.y,Z.z,Z.w),pt.copy(Z)}function Et(Z){if(Pt.equals(Z)===!1)p.viewport(Z.x,Z.y,Z.z,Z.w),Pt.copy(Z)}function lt(Z,ut){let ct=M.get(ut);if(ct===void 0)ct=new WeakMap,M.set(ut,ct);let yt=ct.get(Z);if(yt===void 0)yt=p.getUniformBlockIndex(ut,Z.name),p.uniformBlockBinding(ut,yt,yt),ct.set(Z,yt)}function dt(Z,ut,ct){let vt=M.get(ut).get(Z);if(S[vt]!==ct)p.bindBufferBase(p.UNIFORM_BUFFER,vt,ct),S[vt]=ct}function St(){p.disable(p.BLEND),p.disable(p.CULL_FACE),p.disable(p.DEPTH_TEST),p.disable(p.POLYGON_OFFSET_FILL),p.disable(p.SCISSOR_TEST),p.disable(p.STENCIL_TEST),p.disable(p.SAMPLE_ALPHA_TO_COVERAGE),p.blendEquation(p.FUNC_ADD),p.blendFunc(p.ONE,p.ZERO),p.blendFuncSeparate(p.ONE,p.ZERO,p.ONE,p.ZERO),p.blendColor(0,0,0,0),p.colorMask(!0,!0,!0,!0),p.clearColor(0,0,0,0),p.depthMask(!0),p.depthFunc(p.LESS),v.setReversed(!1),p.clearDepth(1),p.stencilMask(4294967295),p.stencilFunc(p.ALWAYS,0,4294967295),p.stencilOp(p.KEEP,p.KEEP,p.KEEP),p.clearStencil(0),p.cullFace(p.BACK),p.frontFace(p.CCW),p.polygonOffset(0,0),p.activeTexture(p.TEXTURE0),p.bindFramebuffer(p.FRAMEBUFFER,null),p.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),p.bindFramebuffer(p.READ_FRAMEBUFFER,null),p.useProgram(null),p.lineWidth(1),p.scissor(0,0,p.canvas.width,p.canvas.height),p.viewport(0,0,p.canvas.width,p.canvas.height),p.pixelStorei(p.PACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_ALIGNMENT,4),p.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,!1),p.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),p.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,p.BROWSER_DEFAULT_WEBGL),p.pixelStorei(p.PACK_ROW_LENGTH,0),p.pixelStorei(p.PACK_SKIP_PIXELS,0),p.pixelStorei(p.PACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_ROW_LENGTH,0),p.pixelStorei(p.UNPACK_IMAGE_HEIGHT,0),p.pixelStorei(p.UNPACK_SKIP_PIXELS,0),p.pixelStorei(p.UNPACK_SKIP_ROWS,0),p.pixelStorei(p.UNPACK_SKIP_IMAGES,0),T={},w={},ht=null,xt={},E={},S={},A=new WeakMap,P=[],D=null,R=!1,C=null,I=null,U=null,N=null,F=null,z=null,L=null,O=new se(0,0,0),V=0,Y=!1,H=null,W=null,K=null,G=null,Q=null,pt.set(0,0,p.canvas.width,p.canvas.height),Pt.set(0,0,p.canvas.width,p.canvas.height),y.reset(),v.reset(),b.reset()}return{buffers:{color:y,depth:v,stencil:b},enable:Dt,disable:Qt,bindFramebuffer:te,drawBuffers:Ut,useProgram:Zt,setBlending:me,setMaterial:ye,setFlipSided:Te,setCullFace:oe,setLineWidth:gt,setPolygonOffset:ae,setScissorTest:ce,activeTexture:ze,bindTexture:j,unbindTexture:vn,compressedTexImage2D:Me,compressedTexImage3D:Ke,texImage2D:B,texImage3D:et,pixelStorei:ft,getParameter:_t,updateUBOMapping:lt,uniformBlockBinding:dt,texStorage2D:cn,texStorage3D:X,texSubImage2D:Rt,texSubImage3D:De,compressedTexSubImage2D:Yt,compressedTexSubImage3D:ee,scissor:bt,viewport:Et,reset:St}}function Vb(p,m,g,_,x,y,v){let b=m.has("WEBGL_multisampled_render_to_texture")?m.get("WEBGL_multisampled_render_to_texture"):null,S=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),M=new Kt,T=new WeakMap,w=new Set,E,A=new WeakMap,P=new Set,D=new FinalizationRegistry((X)=>P.delete(X)),R=!1;try{R=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(X){}function C(X,B){return R?new OffscreenCanvas(X,B):Ur("canvas")}function I(X,B,et){let _t=1,ft=cn(X);if(ft.width>et||ft.height>et)_t=et/Math.max(ft.width,ft.height);if(_t<1)if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&X instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&X instanceof ImageBitmap||typeof VideoFrame<"u"&&X instanceof VideoFrame){let bt=Math.floor(_t*ft.width),Et=Math.floor(_t*ft.height);if(E===void 0)E=C(bt,Et);let lt=B?C(bt,Et):E;return lt.width=bt,lt.height=Et,lt.getContext("2d").drawImage(X,0,0,bt,Et),Xt("WebGLRenderer: Texture has been resized from ("+ft.width+"x"+ft.height+") to ("+bt+"x"+Et+")."),lt}else{if("data"in X)Xt("WebGLRenderer: Image in DataTexture is too big ("+ft.width+"x"+ft.height+").");return X}return X}function U(X){return X.generateMipmaps}function N(X){p.generateMipmap(X)}function F(X){if(X.isWebGLCubeRenderTarget)return p.TEXTURE_CUBE_MAP;if(X.isWebGL3DRenderTarget)return p.TEXTURE_3D;if(X.isWebGLArrayRenderTarget||X.isCompressedArrayTexture)return p.TEXTURE_2D_ARRAY;return p.TEXTURE_2D}function z(X,B,et,_t,ft,bt=!1){if(X!==null){if(p[X]!==void 0)return p[X];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+X+"'")}let Et;if(_t){if(Et=m.get("EXT_texture_norm16"),!Et)Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let lt=B;if(B===p.RED){if(et===p.FLOAT)lt=p.R32F;if(et===p.HALF_FLOAT)lt=p.R16F;if(et===p.UNSIGNED_BYTE)lt=p.R8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.R16_EXT;if(et===p.SHORT&&Et)lt=Et.R16_SNORM_EXT}if(B===p.RED_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.R8UI;if(et===p.UNSIGNED_SHORT)lt=p.R16UI;if(et===p.UNSIGNED_INT)lt=p.R32UI;if(et===p.BYTE)lt=p.R8I;if(et===p.SHORT)lt=p.R16I;if(et===p.INT)lt=p.R32I}if(B===p.RG){if(et===p.FLOAT)lt=p.RG32F;if(et===p.HALF_FLOAT)lt=p.RG16F;if(et===p.UNSIGNED_BYTE)lt=p.RG8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RG16_EXT;if(et===p.SHORT&&Et)lt=Et.RG16_SNORM_EXT}if(B===p.RG_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RG8UI;if(et===p.UNSIGNED_SHORT)lt=p.RG16UI;if(et===p.UNSIGNED_INT)lt=p.RG32UI;if(et===p.BYTE)lt=p.RG8I;if(et===p.SHORT)lt=p.RG16I;if(et===p.INT)lt=p.RG32I}if(B===p.RGB_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGB8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGB16UI;if(et===p.UNSIGNED_INT)lt=p.RGB32UI;if(et===p.BYTE)lt=p.RGB8I;if(et===p.SHORT)lt=p.RGB16I;if(et===p.INT)lt=p.RGB32I}if(B===p.RGBA_INTEGER){if(et===p.UNSIGNED_BYTE)lt=p.RGBA8UI;if(et===p.UNSIGNED_SHORT)lt=p.RGBA16UI;if(et===p.UNSIGNED_INT)lt=p.RGBA32UI;if(et===p.BYTE)lt=p.RGBA8I;if(et===p.SHORT)lt=p.RGBA16I;if(et===p.INT)lt=p.RGBA32I}if(B===p.RGB){if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RGB16_EXT;if(et===p.SHORT&&Et)lt=Et.RGB16_SNORM_EXT;if(et===p.UNSIGNED_INT_5_9_9_9_REV)lt=p.RGB9_E5;if(et===p.UNSIGNED_INT_10F_11F_11F_REV)lt=p.R11F_G11F_B10F}if(B===p.RGBA){let dt=bt?rh:he.getTransfer(ft);if(et===p.FLOAT)lt=p.RGBA32F;if(et===p.HALF_FLOAT)lt=p.RGBA16F;if(et===p.UNSIGNED_BYTE)lt=dt===Ie?p.SRGB8_ALPHA8:p.RGBA8;if(et===p.UNSIGNED_SHORT&&Et)lt=Et.RGBA16_EXT;if(et===p.SHORT&&Et)lt=Et.RGBA16_SNORM_EXT;if(et===p.UNSIGNED_SHORT_4_4_4_4)lt=p.RGBA4;if(et===p.UNSIGNED_SHORT_5_5_5_1)lt=p.RGB5_A1}if(lt===p.R16F||lt===p.R32F||lt===p.RG16F||lt===p.RG32F||lt===p.RGBA16F||lt===p.RGBA32F)m.get("EXT_color_buffer_float");return lt}function L(X,B){let et;if(X){if(B===null||B===Bi||B===ls)et=p.DEPTH24_STENCIL8;else if(B===bi)et=p.DEPTH32F_STENCIL8;else if(B===Hr)et=p.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(B===null||B===Bi||B===ls)et=p.DEPTH_COMPONENT24;else if(B===bi)et=p.DEPTH_COMPONENT32F;else if(B===Hr)et=p.DEPTH_COMPONENT16;return et}function O(X,B){if(U(X)===!0||X.isFramebufferTexture&&X.minFilter!==Fi&&X.minFilter!==Rn)return Math.log2(Math.max(B.width,B.height))+1;else if(X.mipmaps.length>0)return X.mipmaps.length;else if(X.isCompressedTexture&&Array.isArray(X.image))return B.mipmaps.length;else return 1}function V(X){let B=new WeakRef(X);_.get(X).__ref=B,P.add(B),D.register(X,B,B)}function Y(X){let B=_.get(X).__ref;if(B===void 0)return;P.delete(B),D.unregister(B)}function H(X){K(X.target)}function W(X){G(X.target)}function K(X){if(X.removeEventListener("dispose",H),Y(X),st(X),X.isVideoTexture)T.delete(X);if(X.isHTMLTexture)w.delete(X)}function G(X){X.removeEventListener("dispose",W),Y(X),mt(X)}function Q(){for(let X of P){let B=X.deref();if(B===void 0)continue;if(B.isRenderTarget===!0)G(B);else K(B)}P.clear(),w.clear()}function st(X){let B=_.get(X);if(B.__webglInit===void 0)return;let et=X.source,_t=A.get(et);if(_t){let ft=_t[B.__cacheKey];if(ft.usedTimes--,ft.usedTimes===0)tt(X);if(Object.keys(_t).length===0)A.delete(et)}_.remove(X)}function tt(X){let B=_.get(X);p.deleteTexture(B.__webglTexture);let et=X.source,_t=A.get(et);delete _t[B.__cacheKey],v.memory.textures--}function mt(X){let B=_.get(X);if(B.__depthDisposeCallback)B.__depthDisposeCallback();let et=X.depthTexture;if(et&&et.renderTarget===X)K(et);if(X.isWebGLCubeRenderTarget)for(let ft=0;ft<6;ft++){if(Array.isArray(B.__webglFramebuffer[ft]))for(let bt=0;bt<B.__webglFramebuffer[ft].length;bt++)p.deleteFramebuffer(B.__webglFramebuffer[ft][bt]);else p.deleteFramebuffer(B.__webglFramebuffer[ft]);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer[ft])}else{if(Array.isArray(B.__webglFramebuffer))for(let ft=0;ft<B.__webglFramebuffer.length;ft++)p.deleteFramebuffer(B.__webglFramebuffer[ft]);else p.deleteFramebuffer(B.__webglFramebuffer);if(B.__webglDepthbuffer)p.deleteRenderbuffer(B.__webglDepthbuffer);if(B.__webglMultisampledFramebuffer)p.deleteFramebuffer(B.__webglMultisampledFramebuffer);if(B.__webglColorRenderbuffer){for(let ft=0;ft<B.__webglColorRenderbuffer.length;ft++)if(B.__webglColorRenderbuffer[ft])p.deleteRenderbuffer(B.__webglColorRenderbuffer[ft])}if(B.__webglDepthRenderbuffer)p.deleteRenderbuffer(B.__webglDepthRenderbuffer)}let _t=X.textures;for(let ft=0,bt=_t.length;ft<bt;ft++){let Et=_.get(_t[ft]);if(Et.__webglTexture)p.deleteTexture(Et.__webglTexture),v.memory.textures--;_.remove(_t[ft])}_.remove(X)}let rt=0;function ht(){rt=0}function xt(){return rt}function At(X){rt=X}function at(){let X=rt;if(X>=x.maxTextures)Xt("WebGLTextures: Trying to use "+(X+1)+" texture units while this GPU supports only "+x.maxTextures);return rt+=1,X}function pt(X){let B=[];return B.push(X.wrapS),B.push(X.wrapT),B.push(X.wrapR||0),B.push(X.magFilter),B.push(X.minFilter),B.push(X.anisotropy),B.push(X.internalFormat),B.push(X.format),B.push(X.type),B.push(X.generateMipmaps),B.push(X.mipmapsAutoUpdate),B.push(X.premultiplyAlpha),B.push(X.flipY),B.push(X.unpackAlignment),B.push(X.colorSpace),B.join()}function Pt(X,B){let et=_.get(X);if(X.isVideoTexture)Yt(X);if(X.isRenderTargetTexture===!1&&X.isExternalTexture!==!0&&X.version>0&&et.__version!==X.version){let _t=X.image;if(_t===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(_t.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{ye(et,X,B);return}}else if(X.isExternalTexture)et.__webglTexture=X.sourceTexture?X.sourceTexture:null;g.bindTexture(p.TEXTURE_2D,et.__webglTexture,p.TEXTURE0+B)}function zt(X,B){let et=_.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&et.__version!==X.version){ye(et,X,B);return}else if(X.isExternalTexture)et.__webglTexture=X.sourceTexture?X.sourceTexture:null;g.bindTexture(p.TEXTURE_2D_ARRAY,et.__webglTexture,p.TEXTURE0+B)}function Ht(X,B){let et=_.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&et.__version!==X.version){ye(et,X,B);return}g.bindTexture(p.TEXTURE_3D,et.__webglTexture,p.TEXTURE0+B)}function Dt(X,B){let et=_.get(X);if(X.version>0&&et.__version!==X.version){Te(et,X,B);return}g.bindTexture(p.TEXTURE_CUBE_MAP,et.__webglTexture,p.TEXTURE0+B)}let Qt={[sa]:p.REPEAT,[ra]:p.CLAMP_TO_EDGE,[Zf]:p.MIRRORED_REPEAT},te={[Fi]:p.NEAREST,[$f]:p.NEAREST_MIPMAP_NEAREST,[zr]:p.NEAREST_MIPMAP_LINEAR,[Rn]:p.LINEAR,[oa]:p.LINEAR_MIPMAP_NEAREST,[Kn]:p.LINEAR_MIPMAP_LINEAR},Ut={[sp]:p.NEVER,[lh]:p.ALWAYS,[rp]:p.LESS,[oh]:p.LEQUAL,[op]:p.EQUAL,[ah]:p.GEQUAL,[ap]:p.GREATER,[lp]:p.NOTEQUAL};function Zt(X,B){if(B.type===bi&&m.has("OES_texture_float_linear")===!1&&(B.magFilter===Rn||B.magFilter===oa||B.magFilter===zr||B.magFilter===Kn||B.minFilter===Rn||B.minFilter===oa||B.minFilter===zr||B.minFilter===Kn))Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(p.texParameteri(X,p.TEXTURE_WRAP_S,Qt[B.wrapS]),p.texParameteri(X,p.TEXTURE_WRAP_T,Qt[B.wrapT]),X===p.TEXTURE_3D||X===p.TEXTURE_2D_ARRAY)p.texParameteri(X,p.TEXTURE_WRAP_R,Qt[B.wrapR]);if(p.texParameteri(X,p.TEXTURE_MAG_FILTER,te[B.magFilter]),p.texParameteri(X,p.TEXTURE_MIN_FILTER,te[B.minFilter]),B.compareFunction)p.texParameteri(X,p.TEXTURE_COMPARE_MODE,p.COMPARE_REF_TO_TEXTURE),p.texParameteri(X,p.TEXTURE_COMPARE_FUNC,Ut[B.compareFunction]);if(m.has("EXT_texture_filter_anisotropic")===!0){if(B.magFilter===Fi)return;if(B.minFilter!==zr&&B.minFilter!==Kn)return;if(B.type===bi&&m.has("OES_texture_float_linear")===!1)return;if(B.anisotropy>1||_.get(B).__currentAnisotropy){let et=m.get("EXT_texture_filter_anisotropic");p.texParameterf(X,et.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(B.anisotropy,x.getMaxAnisotropy())),_.get(B).__currentAnisotropy=B.anisotropy}}}function qt(X,B){let et=!1;if(X.__webglInit===void 0)X.__webglInit=!0,B.addEventListener("dispose",H),V(B);let _t=B.source,ft=A.get(_t);if(ft===void 0)ft={},A.set(_t,ft);let bt=pt(B);if(bt!==X.__cacheKey){if(ft[bt]===void 0)ft[bt]={texture:p.createTexture(),usedTimes:0},v.memory.textures++,et=!0;ft[bt].usedTimes++;let Et=ft[X.__cacheKey];if(Et!==void 0){if(ft[X.__cacheKey].usedTimes--,Et.usedTimes===0)tt(B)}X.__cacheKey=bt,X.__webglTexture=ft[bt].texture}return et}function pe(X,B,et){return Math.floor(Math.floor(X/et)/B)}function me(X,B,et,_t){let bt=X.updateRanges;if(bt.length===0)g.texSubImage2D(p.TEXTURE_2D,0,0,0,B.width,B.height,et,_t,B.data);else{bt.sort((Z,ut)=>Z.start-ut.start);let Et=0;for(let Z=1;Z<bt.length;Z++){let ut=bt[Et],ct=bt[Z],yt=ut.start+ut.count,vt=pe(ct.start,B.width,4),wt=pe(ut.start,B.width,4);if(ct.start<=yt+1&&vt===wt&&pe(ct.start+ct.count-1,B.width,4)===vt)ut.count=Math.max(ut.count,ct.start+ct.count-ut.start);else++Et,bt[Et]=ct}bt.length=Et+1;let lt=g.getParameter(p.UNPACK_ROW_LENGTH),dt=g.getParameter(p.UNPACK_SKIP_PIXELS),St=g.getParameter(p.UNPACK_SKIP_ROWS);g.pixelStorei(p.UNPACK_ROW_LENGTH,B.width);for(let Z=0,ut=bt.length;Z<ut;Z++){let ct=bt[Z],yt=Math.floor(ct.start/4),vt=Math.ceil(ct.count/4),wt=yt%B.width,Vt=Math.floor(yt/B.width),Gt=vt,It=1;g.pixelStorei(p.UNPACK_SKIP_PIXELS,wt),g.pixelStorei(p.UNPACK_SKIP_ROWS,Vt),g.texSubImage2D(p.TEXTURE_2D,0,wt,Vt,Gt,1,et,_t,B.data)}X.clearUpdateRanges(),g.pixelStorei(p.UNPACK_ROW_LENGTH,lt),g.pixelStorei(p.UNPACK_SKIP_PIXELS,dt),g.pixelStorei(p.UNPACK_SKIP_ROWS,St)}}function ye(X,B,et){let _t=p.TEXTURE_2D;if(B.isDataArrayTexture||B.isCompressedArrayTexture)_t=p.TEXTURE_2D_ARRAY;if(B.isData3DTexture)_t=p.TEXTURE_3D;let ft=qt(X,B),bt=B.source;g.bindTexture(_t,X.__webglTexture,p.TEXTURE0+et);let Et=_.get(bt);if(bt.version!==Et.__version||ft===!0){if(g.activeTexture(p.TEXTURE0+et),(typeof ImageBitmap<"u"&&B.image instanceof ImageBitmap)===!1){let It=he.getPrimaries(he.workingColorSpace),Wt=B.colorSpace===hs?null:he.getPrimaries(B.colorSpace),re=B.colorSpace===hs||It===Wt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,re)}g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment);let dt=I(B.image,!1,x.maxTextureSize);dt=ee(B,dt);let St=y.convert(B.format,B.colorSpace),Z=y.convert(B.type),ut=z(B.internalFormat,St,Z,B.normalized,B.colorSpace,B.isVideoTexture);Zt(_t,B);let ct,yt=B.mipmaps,vt=B.isVideoTexture!==!0,wt=Et.__version===void 0||ft===!0,Vt=bt.dataReady,Gt=O(B,dt);if(B.isDepthTexture){if(ut=L(B.format===ki,B.type),wt)if(vt)g.texStorage2D(p.TEXTURE_2D,1,ut,dt.width,dt.height);else g.texImage2D(p.TEXTURE_2D,0,ut,dt.width,dt.height,0,St,Z,null)}else if(B.isDataTexture)if(yt.length>0){if(vt&&wt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,yt[0].width,yt[0].height);for(let It=0,Wt=yt.length;It<Wt;It++)if(ct=yt[It],vt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,St,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,St,Z,ct.data);B.generateMipmaps=!1}else if(vt){if(wt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,dt.width,dt.height);if(Vt)me(B,dt,St,Z)}else g.texImage2D(p.TEXTURE_2D,0,ut,dt.width,dt.height,0,St,Z,dt.data);else if(B.isCompressedTexture)if(B.isCompressedArrayTexture){if(vt&&wt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ut,yt[0].width,yt[0].height,dt.depth);for(let It=0,Wt=yt.length;It<Wt;It++)if(ct=yt[It],B.format!==zn)if(St!==null)if(vt){if(Vt)if(B.layerUpdates.size>0){let re=Fh(ct.width,ct.height,B.format,B.type);for(let Lt of B.layerUpdates){let Ae=ct.data.subarray(Lt*re/ct.data.BYTES_PER_ELEMENT,(Lt+1)*re/ct.data.BYTES_PER_ELEMENT);g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,Lt,ct.width,ct.height,1,St,Ae)}}else g.compressedTexSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,dt.depth,St,ct.data)}else g.compressedTexImage3D(p.TEXTURE_2D_ARRAY,It,ut,ct.width,ct.height,dt.depth,0,ct.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vt){if(Vt)g.texSubImage3D(p.TEXTURE_2D_ARRAY,It,0,0,0,ct.width,ct.height,dt.depth,St,Z,ct.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,It,ut,ct.width,ct.height,dt.depth,0,St,Z,ct.data);if(B.layerUpdates.size>0)B.clearLayerUpdates()}else{if(vt&&wt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,yt[0].width,yt[0].height);for(let It=0,Wt=yt.length;It<Wt;It++)if(ct=yt[It],B.format!==zn)if(St!==null)if(vt){if(Vt)g.compressedTexSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,St,ct.data)}else g.compressedTexImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,ct.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,ct.width,ct.height,St,Z,ct.data)}else g.texImage2D(p.TEXTURE_2D,It,ut,ct.width,ct.height,0,St,Z,ct.data)}else if(B.isDataArrayTexture)if(vt){if(wt)g.texStorage3D(p.TEXTURE_2D_ARRAY,Gt,ut,dt.width,dt.height,dt.depth);if(Vt)if(B.layerUpdates.size>0){let It=Fh(dt.width,dt.height,B.format,B.type);for(let Wt of B.layerUpdates){let re=dt.data.subarray(Wt*It/dt.data.BYTES_PER_ELEMENT,(Wt+1)*It/dt.data.BYTES_PER_ELEMENT);g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,Wt,dt.width,dt.height,1,St,Z,re)}B.clearLayerUpdates()}else g.texSubImage3D(p.TEXTURE_2D_ARRAY,0,0,0,0,dt.width,dt.height,dt.depth,St,Z,dt.data)}else g.texImage3D(p.TEXTURE_2D_ARRAY,0,ut,dt.width,dt.height,dt.depth,0,St,Z,dt.data);else if(B.isData3DTexture)if(vt){if(wt)g.texStorage3D(p.TEXTURE_3D,Gt,ut,dt.width,dt.height,dt.depth);if(Vt)g.texSubImage3D(p.TEXTURE_3D,0,0,0,0,dt.width,dt.height,dt.depth,St,Z,dt.data)}else g.texImage3D(p.TEXTURE_3D,0,ut,dt.width,dt.height,dt.depth,0,St,Z,dt.data);else if(B.isFramebufferTexture){if(wt)if(vt)g.texStorage2D(p.TEXTURE_2D,Gt,ut,dt.width,dt.height);else{let It=dt.width,Wt=dt.height;for(let re=0;re<Gt;re++)g.texImage2D(p.TEXTURE_2D,re,ut,It,Wt,0,St,Z,null),It>>=1,Wt>>=1}}else if(B.isHTMLTexture){if("texElementImage2D"in p){let It=p.canvas;if(!It.hasAttribute("layoutsubtree"))It.setAttribute("layoutsubtree","true");if(dt.parentNode!==It){It.appendChild(dt),w.add(B),It.onpaint=(Wt)=>{let re=Wt.changedElements;for(let Lt of w)if(re.includes(Lt.image))Lt.needsUpdate=!0},It.requestPaint();return}if(p.texElementImage2D.length===3)p.texElementImage2D(p.TEXTURE_2D,p.RGBA8,dt);else{let{RGBA:re,RGBA:Lt,UNSIGNED_BYTE:Ae}=p;p.texElementImage2D(p.TEXTURE_2D,0,re,Lt,Ae,dt)}p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE)}}else if(yt.length>0){if(vt&&wt){let It=cn(yt[0]);g.texStorage2D(p.TEXTURE_2D,Gt,ut,It.width,It.height)}for(let It=0,Wt=yt.length;It<Wt;It++)if(ct=yt[It],vt){if(Vt)g.texSubImage2D(p.TEXTURE_2D,It,0,0,St,Z,ct)}else g.texImage2D(p.TEXTURE_2D,It,ut,St,Z,ct);B.generateMipmaps=!1}else if(vt){if(wt){let It=cn(dt);g.texStorage2D(p.TEXTURE_2D,Gt,ut,It.width,It.height)}if(Vt)g.texSubImage2D(p.TEXTURE_2D,0,0,0,St,Z,dt)}else g.texImage2D(p.TEXTURE_2D,0,ut,St,Z,dt);if(U(B)&&B.mipmapsAutoUpdate===!0)N(_t);if(Et.__version=bt.version,B.onUpdate)B.onUpdate(B)}X.__version=B.version}function Te(X,B,et){if(B.image.length!==6)return;let _t=qt(X,B),ft=B.source;g.bindTexture(p.TEXTURE_CUBE_MAP,X.__webglTexture,p.TEXTURE0+et);let bt=_.get(ft);if(ft.version!==bt.__version||_t===!0){g.activeTexture(p.TEXTURE0+et);let Et=he.getPrimaries(he.workingColorSpace),lt=B.colorSpace===hs?null:he.getPrimaries(B.colorSpace),dt=B.colorSpace===hs||Et===lt?p.NONE:p.BROWSER_DEFAULT_WEBGL;g.pixelStorei(p.UNPACK_FLIP_Y_WEBGL,B.flipY),g.pixelStorei(p.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),g.pixelStorei(p.UNPACK_ALIGNMENT,B.unpackAlignment),g.pixelStorei(p.UNPACK_COLORSPACE_CONVERSION_WEBGL,dt);let St=B.isCompressedTexture||B.image[0].isCompressedTexture,Z=B.image[0]&&B.image[0].isDataTexture,ut=[];for(let Lt=0;Lt<6;Lt++){if(!St&&!Z)ut[Lt]=I(B.image[Lt],!0,x.maxCubemapSize);else ut[Lt]=Z?B.image[Lt].image:B.image[Lt];ut[Lt]=ee(B,ut[Lt])}let ct=ut[0],yt=y.convert(B.format,B.colorSpace),vt=y.convert(B.type),wt=z(B.internalFormat,yt,vt,B.normalized,B.colorSpace),Vt=B.isVideoTexture!==!0,Gt=bt.__version===void 0||_t===!0,It=ft.dataReady,Wt=O(B,ct);Zt(p.TEXTURE_CUBE_MAP,B);let re;if(B.isDepthTexture){if(wt=L(B.format===ki,B.type),Gt)if(Vt)g.texStorage2D(p.TEXTURE_CUBE_MAP,1,wt,ct.width,ct.height);else for(let Lt=0;Lt<6;Lt++)g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,ct.width,ct.height,0,yt,vt,null)}else if(St){if(Vt&&Gt)g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,wt,ct.width,ct.height);for(let Lt=0;Lt<6;Lt++){re=ut[Lt].mipmaps;for(let Ae=0;Ae<re.length;Ae++){let Je=re[Ae];if(B.format!==zn)if(yt!==null)if(Vt){if(It)g.compressedTexSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,0,0,Je.width,Je.height,yt,Je.data)}else g.compressedTexImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,wt,Je.width,Je.height,0,Je.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,0,0,Je.width,Je.height,yt,vt,Je.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae,wt,Je.width,Je.height,0,yt,vt,Je.data)}}}else{if(re=B.mipmaps,Vt&&Gt){if(re.length>0)Wt++;let Lt=cn(ut[0]);g.texStorage2D(p.TEXTURE_CUBE_MAP,Wt,wt,Lt.width,Lt.height)}for(let Lt=0;Lt<6;Lt++)if(Z){if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,ut[Lt].width,ut[Lt].height,yt,vt,ut[Lt].data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,ut[Lt].width,ut[Lt].height,0,yt,vt,ut[Lt].data);for(let Ae=0;Ae<re.length;Ae++){let hi=re[Ae].image[Lt].image;if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,0,0,hi.width,hi.height,yt,vt,hi.data)}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,wt,hi.width,hi.height,0,yt,vt,hi.data)}}else{if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,yt,vt,ut[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,wt,yt,vt,ut[Lt]);for(let Ae=0;Ae<re.length;Ae++){let Je=re[Ae];if(Vt){if(It)g.texSubImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,0,0,yt,vt,Je.image[Lt])}else g.texImage2D(p.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,Ae+1,wt,yt,vt,Je.image[Lt])}}}if(U(B)&&B.mipmapsAutoUpdate===!0)N(p.TEXTURE_CUBE_MAP);if(bt.__version=ft.version,B.onUpdate)B.onUpdate(B)}X.__version=B.version}function oe(X,B,et,_t,ft,bt){let Et=y.convert(et.format,et.colorSpace),lt=y.convert(et.type),dt=z(et.internalFormat,Et,lt,et.normalized,et.colorSpace),St=_.get(B),Z=_.get(et);if(Z.__renderTarget=B,!St.__hasExternalTextures){let ut=Math.max(1,B.width>>bt),ct=Math.max(1,B.height>>bt);if(ft===p.TEXTURE_3D||ft===p.TEXTURE_2D_ARRAY)g.texImage3D(ft,bt,dt,ut,ct,B.depth,0,Et,lt,null);else g.texImage2D(ft,bt,dt,ut,ct,0,Et,lt,null)}if(g.bindFramebuffer(p.FRAMEBUFFER,X),De(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,_t,ft,Z.__webglTexture,0,Rt(B));else if(ft===p.TEXTURE_2D||ft>=p.TEXTURE_CUBE_MAP_POSITIVE_X&&ft<=p.TEXTURE_CUBE_MAP_NEGATIVE_Z)p.framebufferTexture2D(p.FRAMEBUFFER,_t,ft,Z.__webglTexture,bt);g.bindFramebuffer(p.FRAMEBUFFER,null)}function gt(X,B,et){if(p.bindRenderbuffer(p.RENDERBUFFER,X),B.depthBuffer){let _t=B.depthTexture,ft=_t&&_t.isDepthTexture?_t.type:null,bt=L(B.stencilBuffer,ft),Et=B.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(De(B))b.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,Rt(B),bt,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,Rt(B),bt,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,bt,B.width,B.height);p.framebufferRenderbuffer(p.FRAMEBUFFER,Et,p.RENDERBUFFER,X)}else{let _t=B.textures;for(let ft=0;ft<_t.length;ft++){let bt=_t[ft],Et=y.convert(bt.format,bt.colorSpace),lt=y.convert(bt.type),dt=z(bt.internalFormat,Et,lt,bt.normalized,bt.colorSpace);if(De(B))b.renderbufferStorageMultisampleEXT(p.RENDERBUFFER,Rt(B),dt,B.width,B.height);else if(et)p.renderbufferStorageMultisample(p.RENDERBUFFER,Rt(B),dt,B.width,B.height);else p.renderbufferStorage(p.RENDERBUFFER,dt,B.width,B.height)}}p.bindRenderbuffer(p.RENDERBUFFER,null)}function ae(X,B,et){let _t=B.isWebGLCubeRenderTarget===!0;if(g.bindFramebuffer(p.FRAMEBUFFER,X),!(B.depthTexture&&B.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ft=_.get(B.depthTexture);ft.__renderTarget=B;let bt=_t?B.depthTexture.image[0]:B.depthTexture.image;if(!ft.__webglTexture||bt.width!==B.width||bt.height!==B.height)bt.width=B.width,bt.height=B.height,B.depthTexture.needsUpdate=!0;if(_t)Dt(B.depthTexture,0);else Pt(B.depthTexture,0);let Et=ft.__webglTexture,lt=Rt(B),dt=_t?p.TEXTURE_CUBE_MAP_POSITIVE_X+et:p.TEXTURE_2D,St=B.depthTexture.format===ki?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;if(B.depthTexture.format===Ks)if(De(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,St,dt,Et,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,St,dt,Et,0);else if(B.depthTexture.format===ki)if(De(B))b.framebufferTexture2DMultisampleEXT(p.FRAMEBUFFER,St,dt,Et,0,lt);else p.framebufferTexture2D(p.FRAMEBUFFER,St,dt,Et,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ce(X){let B=_.get(X),et=X.isWebGLCubeRenderTarget===!0;if(B.__boundDepthTexture!==X.depthTexture){let _t=X.depthTexture;if(B.__depthDisposeCallback)B.__depthDisposeCallback();if(_t){let ft=()=>{delete B.__boundDepthTexture,delete B.__depthDisposeCallback,_t.removeEventListener("dispose",ft)};_t.addEventListener("dispose",ft),B.__depthDisposeCallback=ft}B.__boundDepthTexture=_t}if(X.depthTexture&&!B.__autoAllocateDepthBuffer)if(et)for(let _t=0;_t<6;_t++)ae(B.__webglFramebuffer[_t],X,_t);else if(X.texture.mipmaps.length>0)ae(B.__webglFramebuffer[0],X,0);else ae(B.__webglFramebuffer,X,0);else if(et){B.__webglDepthbuffer=[];for(let _t=0;_t<6;_t++)if(g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[_t]),B.__webglDepthbuffer[_t]===void 0)B.__webglDepthbuffer[_t]=p.createRenderbuffer(),gt(B.__webglDepthbuffer[_t],X,!1);else{let ft=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,bt=B.__webglDepthbuffer[_t];p.bindRenderbuffer(p.RENDERBUFFER,bt),p.framebufferRenderbuffer(p.FRAMEBUFFER,ft,p.RENDERBUFFER,bt)}}else{if(X.texture.mipmaps.length>0)g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer[0]);else g.bindFramebuffer(p.FRAMEBUFFER,B.__webglFramebuffer);if(B.__webglDepthbuffer===void 0)B.__webglDepthbuffer=p.createRenderbuffer(),gt(B.__webglDepthbuffer,X,!1);else{let ft=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,bt=B.__webglDepthbuffer;p.bindRenderbuffer(p.RENDERBUFFER,bt),p.framebufferRenderbuffer(p.FRAMEBUFFER,ft,p.RENDERBUFFER,bt)}}g.bindFramebuffer(p.FRAMEBUFFER,null)}function ze(X,B,et){let _t=_.get(X);if(B!==void 0)oe(_t.__webglFramebuffer,X,X.texture,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,0);if(et!==void 0)ce(X)}function j(X){let B=X.texture,et=_.get(X),_t=_.get(B);X.addEventListener("dispose",W),V(X);let ft=X.textures,bt=X.isWebGLCubeRenderTarget===!0,Et=ft.length>1;if(!Et){if(_t.__webglTexture===void 0)_t.__webglTexture=p.createTexture();_t.__version=B.version,v.memory.textures++}if(bt){et.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0){et.__webglFramebuffer[lt]=[];for(let dt=0;dt<B.mipmaps.length;dt++)et.__webglFramebuffer[lt][dt]=p.createFramebuffer()}else et.__webglFramebuffer[lt]=p.createFramebuffer()}else{if(B.mipmaps.length>0){et.__webglFramebuffer=[];for(let lt=0;lt<B.mipmaps.length;lt++)et.__webglFramebuffer[lt]=p.createFramebuffer()}else et.__webglFramebuffer=p.createFramebuffer();if(Et)for(let lt=0,dt=ft.length;lt<dt;lt++){let St=_.get(ft[lt]);if(St.__webglTexture===void 0)St.__webglTexture=p.createTexture(),v.memory.textures++}if(X.samples>0&&De(X)===!1){et.__webglMultisampledFramebuffer=p.createFramebuffer(),et.__webglColorRenderbuffer=[],g.bindFramebuffer(p.FRAMEBUFFER,et.__webglMultisampledFramebuffer);for(let lt=0;lt<ft.length;lt++){let dt=ft[lt];et.__webglColorRenderbuffer[lt]=p.createRenderbuffer(),p.bindRenderbuffer(p.RENDERBUFFER,et.__webglColorRenderbuffer[lt]);let St=y.convert(dt.format,dt.colorSpace),Z=y.convert(dt.type),ut=z(dt.internalFormat,St,Z,dt.normalized,dt.colorSpace,X.isXRRenderTarget===!0),ct=Rt(X);p.renderbufferStorageMultisample(p.RENDERBUFFER,ct,ut,X.width,X.height),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+lt,p.RENDERBUFFER,et.__webglColorRenderbuffer[lt])}if(p.bindRenderbuffer(p.RENDERBUFFER,null),X.depthBuffer)et.__webglDepthRenderbuffer=p.createRenderbuffer(),gt(et.__webglDepthRenderbuffer,X,!0);g.bindFramebuffer(p.FRAMEBUFFER,null)}}if(bt){g.bindTexture(p.TEXTURE_CUBE_MAP,_t.__webglTexture),Zt(p.TEXTURE_CUBE_MAP,B);for(let lt=0;lt<6;lt++)if(B.mipmaps.length>0)for(let dt=0;dt<B.mipmaps.length;dt++)oe(et.__webglFramebuffer[lt][dt],X,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,dt);else oe(et.__webglFramebuffer[lt],X,B,p.COLOR_ATTACHMENT0,p.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);if(U(B))N(p.TEXTURE_CUBE_MAP);else if(B.mipmaps.length>0)p.texParameteri(p.TEXTURE_CUBE_MAP,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}else if(Et){for(let lt=0,dt=ft.length;lt<dt;lt++){let St=ft[lt],Z=_.get(St),ut=p.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)ut=X.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(ut,Z.__webglTexture),Zt(ut,St),oe(et.__webglFramebuffer,X,St,p.COLOR_ATTACHMENT0+lt,ut,0),U(St))N(ut)}g.unbindTexture()}else{let lt=p.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)lt=X.isWebGL3DRenderTarget?p.TEXTURE_3D:p.TEXTURE_2D_ARRAY;if(g.bindTexture(lt,_t.__webglTexture),Zt(lt,B),B.mipmaps.length>0)for(let dt=0;dt<B.mipmaps.length;dt++)oe(et.__webglFramebuffer[dt],X,B,p.COLOR_ATTACHMENT0,lt,dt);else oe(et.__webglFramebuffer,X,B,p.COLOR_ATTACHMENT0,lt,0);if(U(B))N(lt);else if(B.mipmaps.length>0)p.texParameteri(lt,p.TEXTURE_MAX_LEVEL,B.mipmaps.length-1);g.unbindTexture()}if(X.depthBuffer)ce(X)}function vn(X){let B=X.textures;for(let et=0,_t=B.length;et<_t;et++){let ft=B[et];if(U(ft)&&ft.mipmapsAutoUpdate===!0){let bt=F(X),Et=_.get(ft).__webglTexture;g.bindTexture(bt,Et),N(bt),g.unbindTexture()}}}let Me=[];function Ke(X){if(X.samples>0){if(De(X)===!1){let{textures:B,width:et,height:_t}=X,ft=p.COLOR_BUFFER_BIT,bt=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT,Et=_.get(X),lt=B.length>1;if(lt)for(let St=0;St<B.length;St++)g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+St,p.RENDERBUFFER,null),g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+St,p.TEXTURE_2D,null,0);if(g.bindFramebuffer(p.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),X.texture.mipmaps.length>0)g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglFramebuffer[0]);else g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let St=0;St<B.length;St++){if(X.resolveDepthBuffer){if(X.depthBuffer)ft|=p.DEPTH_BUFFER_BIT;if(X.stencilBuffer&&X.resolveStencilBuffer)ft|=p.STENCIL_BUFFER_BIT}if(lt){p.framebufferRenderbuffer(p.READ_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.RENDERBUFFER,Et.__webglColorRenderbuffer[St]);let Z=_.get(B[St]).__webglTexture;p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,Z,0)}if(p.blitFramebuffer(0,0,et,_t,0,0,et,_t,ft,p.NEAREST),S===!0){if(Me.length=0,Me.push(p.COLOR_ATTACHMENT0+St),X.depthBuffer&&X.storeMultisampledDepthBuffer===!1)Me.push(bt);p.invalidateFramebuffer(p.READ_FRAMEBUFFER,Me)}}if(g.bindFramebuffer(p.READ_FRAMEBUFFER,null),g.bindFramebuffer(p.DRAW_FRAMEBUFFER,null),lt)for(let St=0;St<B.length;St++){g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),p.framebufferRenderbuffer(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0+St,p.RENDERBUFFER,Et.__webglColorRenderbuffer[St]);let Z=_.get(B[St]).__webglTexture;g.bindFramebuffer(p.FRAMEBUFFER,Et.__webglFramebuffer),p.framebufferTexture2D(p.DRAW_FRAMEBUFFER,p.COLOR_ATTACHMENT0+St,p.TEXTURE_2D,Z,0)}g.bindFramebuffer(p.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(X.depthBuffer&&X.storeMultisampledDepthBuffer===!1&&S){let B=X.stencilBuffer?p.DEPTH_STENCIL_ATTACHMENT:p.DEPTH_ATTACHMENT;p.invalidateFramebuffer(p.DRAW_FRAMEBUFFER,[B])}}}function Rt(X){return Math.min(x.maxSamples,X.samples)}function De(X){let B=_.get(X);return X.samples>0&&m.has("WEBGL_multisampled_render_to_texture")===!0&&B.__useRenderToTexture!==!1}function Yt(X){let B=v.render.frame;if(T.get(X)!==B)T.set(X,B),X.update()}function ee(X,B){let{colorSpace:et,format:_t,type:ft}=X;if(X.isCompressedTexture===!0||X.isVideoTexture===!0)return B;if(et!==sh&&et!==hs)if(he.getTransfer(et)===Ie){if(_t!==zn||ft!==Jn)Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else $t("WebGLTextures: Unsupported texture color space:",et);return B}function cn(X){if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement)M.width=X.naturalWidth||X.width,M.height=X.naturalHeight||X.height;else if(typeof VideoFrame<"u"&&X instanceof VideoFrame)M.width=X.displayWidth,M.height=X.displayHeight;else M.width=X.width,M.height=X.height;return M}this.allocateTextureUnit=at,this.resetTextureUnits=ht,this.getTextureUnits=xt,this.setTextureUnits=At,this.setTexture2D=Pt,this.setTexture2DArray=zt,this.setTexture3D=Ht,this.setTextureCube=Dt,this.rebindTextures=ze,this.setupRenderTarget=j,this.updateRenderTargetMipmap=vn,this.updateMultisampleRenderTarget=Ke,this.setupDepthRenderbuffer=ce,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=De,this.dispose=Q}function Wb(p,m){function g(_,x=hs){let y,v=he.getTransfer(x);if(_===Jn)return p.UNSIGNED_BYTE;if(_===Tc)return p.UNSIGNED_SHORT_4_4_4_4;if(_===wc)return p.UNSIGNED_SHORT_5_5_5_1;if(_===jf)return p.UNSIGNED_INT_5_9_9_9_REV;if(_===Qf)return p.UNSIGNED_INT_10F_11F_11F_REV;if(_===Kf)return p.BYTE;if(_===Jf)return p.SHORT;if(_===Hr)return p.UNSIGNED_SHORT;if(_===Ec)return p.INT;if(_===Bi)return p.UNSIGNED_INT;if(_===bi)return p.FLOAT;if(_===ri)return p.HALF_FLOAT;if(_===tp)return p.ALPHA;if(_===ep)return p.RGB;if(_===zn)return p.RGBA;if(_===Ks)return p.DEPTH_COMPONENT;if(_===ki)return p.DEPTH_STENCIL;if(_===np)return p.RED;if(_===Ac)return p.RED_INTEGER;if(_===cs)return p.RG;if(_===Rc)return p.RG_INTEGER;if(_===Cc)return p.RGBA_INTEGER;if(_===Js||_===aa||_===js||_===Qs)if(v===Ie)if(y=m.get("WEBGL_compressed_texture_s3tc_srgb"),y!==null){if(_===Js)return y.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(_===aa)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(_===js)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(_===Qs)return y.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(y=m.get("WEBGL_compressed_texture_s3tc"),y!==null){if(_===Js)return y.COMPRESSED_RGB_S3TC_DXT1_EXT;if(_===aa)return y.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(_===js)return y.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(_===Qs)return y.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(_===Pc||_===Ic||_===Lc||_===Nc)if(y=m.get("WEBGL_compressed_texture_pvrtc"),y!==null){if(_===Pc)return y.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(_===Ic)return y.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(_===Lc)return y.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(_===Nc)return y.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(_===Gr||_===Dc||_===Uc||_===Oc||_===Fc||_===la||_===Bc)if(y=m.get("WEBGL_compressed_texture_etc"),y!==null){if(_===Gr||_===Dc)return v===Ie?y.COMPRESSED_SRGB8_ETC2:y.COMPRESSED_RGB8_ETC2;if(_===Uc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:y.COMPRESSED_RGBA8_ETC2_EAC;if(_===Oc)return y.COMPRESSED_R11_EAC;if(_===Fc)return y.COMPRESSED_SIGNED_R11_EAC;if(_===la)return y.COMPRESSED_RG11_EAC;if(_===Bc)return y.COMPRESSED_SIGNED_RG11_EAC}else return null;if(_===kc||_===zc||_===Hc||_===Gc||_===Vc||_===Wc||_===Xc||_===qc||_===Yc||_===Zc||_===$c||_===Kc||_===Jc||_===jc)if(y=m.get("WEBGL_compressed_texture_astc"),y!==null){if(_===kc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:y.COMPRESSED_RGBA_ASTC_4x4_KHR;if(_===zc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:y.COMPRESSED_RGBA_ASTC_5x4_KHR;if(_===Hc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:y.COMPRESSED_RGBA_ASTC_5x5_KHR;if(_===Gc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:y.COMPRESSED_RGBA_ASTC_6x5_KHR;if(_===Vc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:y.COMPRESSED_RGBA_ASTC_6x6_KHR;if(_===Wc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:y.COMPRESSED_RGBA_ASTC_8x5_KHR;if(_===Xc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:y.COMPRESSED_RGBA_ASTC_8x6_KHR;if(_===qc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:y.COMPRESSED_RGBA_ASTC_8x8_KHR;if(_===Yc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:y.COMPRESSED_RGBA_ASTC_10x5_KHR;if(_===Zc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:y.COMPRESSED_RGBA_ASTC_10x6_KHR;if(_===$c)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:y.COMPRESSED_RGBA_ASTC_10x8_KHR;if(_===Kc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:y.COMPRESSED_RGBA_ASTC_10x10_KHR;if(_===Jc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:y.COMPRESSED_RGBA_ASTC_12x10_KHR;if(_===jc)return v===Ie?y.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:y.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(_===Qc||_===Vr||_===Wr)if(y=m.get("EXT_texture_compression_bptc"),y!==null){if(_===Qc)return v===Ie?y.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:y.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(_===Vr)return y.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(_===Wr)return y.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(_===th||_===eh||_===ca||_===nh)if(y=m.get("EXT_texture_compression_rgtc"),y!==null){if(_===th)return y.COMPRESSED_RED_RGTC1_EXT;if(_===eh)return y.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(_===ca)return y.COMPRESSED_RED_GREEN_RGTC2_EXT;if(_===nh)return y.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(_===ls)return p.UNSIGNED_INT_24_8;return p[_]!==void 0?p[_]:null}return{convert:g}}var Xb=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,qb=`
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

}`;class sm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(p,m){if(this.texture===null){let g=new ba(p.texture);if(p.depthNear!==m.depthNear||p.depthFar!==m.depthFar)this.depthNear=p.depthNear,this.depthFar=p.depthFar;this.texture=g}}getMesh(p){if(this.texture!==null){if(this.mesh===null){let m=p.cameras[0].viewport,g=new Ai({vertexShader:Xb,fragmentShader:qb,uniforms:{depthColor:{value:this.texture},depthWidth:{value:m.z},depthHeight:{value:m.w}}});this.mesh=new nn(new Jr(20,20),g)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class rm extends Si{constructor(p,m){super();let g=this,_=null,x=1,y=null,v="local-floor",b=1,S=null,M=null,T=null,w=null,E=null,A=null,P=typeof XRWebGLBinding<"u",D=new sm,R={},C=m.getContextAttributes(),I=null,U=null,N=[],F=[],z=new Kt,L=null,O=null,V=new An;V.viewport=new Be;let Y=new An;Y.viewport=new Be;let H=[V,Y],W=new Dh,K=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(at){let pt=N[at];if(pt===void 0)pt=new Yr,N[at]=pt;return pt.getTargetRaySpace()},this.getControllerGrip=function(at){let pt=N[at];if(pt===void 0)pt=new Yr,N[at]=pt;return pt.getGripSpace()},this.getHand=function(at){let pt=N[at];if(pt===void 0)pt=new Yr,N[at]=pt;return pt.getHandSpace()};function Q(at){let pt=F.indexOf(at.inputSource);if(pt===-1)return;let Pt=N[pt];if(Pt!==void 0)Pt.update(at.inputSource,at.frame,S||y),Pt.dispatchEvent({type:at.type,data:at.inputSource})}function st(){_.removeEventListener("select",Q),_.removeEventListener("selectstart",Q),_.removeEventListener("selectend",Q),_.removeEventListener("squeeze",Q),_.removeEventListener("squeezestart",Q),_.removeEventListener("squeezeend",Q),_.removeEventListener("end",st),_.removeEventListener("inputsourceschange",tt);for(let at=0;at<N.length;at++){let pt=F[at];if(pt===null)continue;F[at]=null,N[at].disconnect(pt)}K=null,G=null,D.reset();for(let at in R)delete R[at];if(p.setRenderTarget(I),E=null,w=null,T=null,_=null,U=null,At.stop(),g.isPresenting=!1,p.setPixelRatio(L),p.setSize(z.width,z.height,!1),O!==null){let at=O.camera;at.fov=O.fov,at.zoom=O.zoom,at.updateProjectionMatrix(),O=null}g.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(at){if(x=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(at){if(v=at,g.isPresenting===!0)Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||y},this.setReferenceSpace=function(at){S=at},this.getBaseLayer=function(){return w!==null?w:E},this.getBinding=function(){if(T===null&&P)T=new XRWebGLBinding(_,m);return T},this.getFrame=function(){return A},this.getSession=function(){return _},this.setSession=async function(at){if(_=at,_!==null){if(I=p.getRenderTarget(),_.addEventListener("select",Q),_.addEventListener("selectstart",Q),_.addEventListener("selectend",Q),_.addEventListener("squeeze",Q),_.addEventListener("squeezestart",Q),_.addEventListener("squeezeend",Q),_.addEventListener("end",st),_.addEventListener("inputsourceschange",tt),C.xrCompatible!==!0)await m.makeXRCompatible();if(L=p.getPixelRatio(),p.getSize(z),!(P&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Pt={antialias:C.antialias,alpha:!0,depth:C.depth,stencil:C.stencil,framebufferScaleFactor:x};E=new XRWebGLLayer(_,m,Pt),_.updateRenderState({baseLayer:E}),p.setPixelRatio(1),p.setSize(E.framebufferWidth,E.framebufferHeight,!1),U=new Hn(E.framebufferWidth,E.framebufferHeight,{format:zn,type:Jn,colorSpace:p.outputColorSpace,stencilBuffer:C.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1,storeMultisampledDepthBuffer:E.ignoreDepthValues===!1,storeMultisampledStencilBuffer:E.ignoreDepthValues===!1})}else{let Pt=null,zt=null,Ht=null;if(C.depth)Ht=C.stencil?m.DEPTH24_STENCIL8:m.DEPTH_COMPONENT24,Pt=C.stencil?ki:Ks,zt=C.stencil?ls:Bi;let Dt={colorFormat:m.RGBA8,depthFormat:Ht,scaleFactor:x};T=this.getBinding(),w=T.createProjectionLayer(Dt),_.updateRenderState({layers:[w]}),p.setPixelRatio(1),p.setSize(w.textureWidth,w.textureHeight,!1),U=new Hn(w.textureWidth,w.textureHeight,{format:zn,type:Jn,depthTexture:new Vi(w.textureWidth,w.textureHeight,zt,void 0,void 0,void 0,void 0,void 0,void 0,Pt),stencilBuffer:C.stencil,colorSpace:p.outputColorSpace,samples:C.antialias?4:0,resolveDepthBuffer:w.ignoreDepthValues===!1,resolveStencilBuffer:w.ignoreDepthValues===!1,storeMultisampledDepthBuffer:w.ignoreDepthValues===!1,storeMultisampledStencilBuffer:w.ignoreDepthValues===!1})}U.isXRRenderTarget=!0,this.setFoveation(b),S=null,y=await _.requestReferenceSpace(v),At.setContext(_),At.start(),g.isPresenting=!0,g.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(_!==null)return _.environmentBlendMode},this.getDepthTexture=function(){return D.getDepthTexture()};function tt(at){for(let pt=0;pt<at.removed.length;pt++){let Pt=at.removed[pt],zt=F.indexOf(Pt);if(zt>=0)F[zt]=null,N[zt].disconnect(Pt)}for(let pt=0;pt<at.added.length;pt++){let Pt=at.added[pt],zt=F.indexOf(Pt);if(zt===-1){for(let Dt=0;Dt<N.length;Dt++)if(Dt>=F.length){F.push(Pt),zt=Dt;break}else if(F[Dt]===null){F[Dt]=Pt,zt=Dt;break}if(zt===-1)break}let Ht=N[zt];if(Ht)Ht.connect(Pt)}}function mt(at,pt){if(pt===null)at.matrixWorld.copy(at.matrix);else at.matrixWorld.multiplyMatrices(pt.matrixWorld,at.matrix);at.matrixWorldInverse.copy(at.matrixWorld).invert()}this.updateCamera=function(at){if(_===null)return;let{near:pt,far:Pt}=at;if(D.texture!==null){if(D.depthNear>0)pt=D.depthNear;if(D.depthFar>0)Pt=D.depthFar}if(W.near=Y.near=V.near=pt,W.far=Y.far=V.far=Pt,K!==W.near||G!==W.far)_.updateRenderState({depthNear:W.near,depthFar:W.far}),K=W.near,G=W.far;W.layers.mask=at.layers.mask|6,V.layers.mask=W.layers.mask&-5,Y.layers.mask=W.layers.mask&-3;let zt=at.parent,Ht=W.cameras;mt(W,zt);for(let Dt=0;Dt<Ht.length;Dt++)mt(Ht[Dt],zt);if(W.projectionMatrix.copy(V.projectionMatrix),W.projectionMatrixInverse.copy(V.projectionMatrixInverse),O===null&&at.isPerspectiveCamera)O={camera:at,fov:at.fov,zoom:at.zoom};rt(at,W,zt)};function rt(at,pt,Pt){if(Pt===null)at.matrix.copy(pt.matrixWorld);else at.matrix.copy(Pt.matrixWorld),at.matrix.invert(),at.matrix.multiply(pt.matrixWorld);if(at.matrix.decompose(at.position,at.quaternion,at.scale),at.updateMatrixWorld(!0),at.projectionMatrix.copy(pt.projectionMatrix),at.projectionMatrixInverse.copy(pt.projectionMatrixInverse),at.isPerspectiveCamera)at.fov=qs*2*Math.atan(1/at.projectionMatrix.elements[5]),at.zoom=1}this.getCamera=function(){return W},this.getFoveation=function(){if(w===null&&E===null)return;return b},this.setFoveation=function(at){if(b=at,w!==null)w.fixedFoveation=at;if(E!==null&&E.fixedFoveation!==void 0)E.fixedFoveation=at},this.hasDepthSensing=function(){return D.texture!==null},this.getDepthSensingMesh=function(){return D.getMesh(W)},this.getCameraTexture=function(at){return R[at]};let ht=null;function xt(at,pt){if(M=pt.getViewerPose(S||y),A=pt,M!==null){let Pt=M.views;if(E!==null)p.setRenderTargetFramebuffer(U,E.framebuffer),p.setRenderTarget(U);let zt=!1;if(Pt.length!==W.cameras.length)W.cameras.length=0,zt=!0;for(let te=0;te<Pt.length;te++){let Ut=Pt[te],Zt=null;if(E!==null)Zt=E.getViewport(Ut);else{let pe=T.getViewSubImage(w,Ut);if(Zt=pe.viewport,te===0)p.setRenderTargetTextures(U,pe.colorTexture,pe.depthStencilTexture),p.setRenderTarget(U)}let qt=H[te];if(qt===void 0)qt=new An,qt.layers.enable(te),qt.viewport=new Be,H[te]=qt;if(qt.matrix.fromArray(Ut.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Ut.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),te===0)W.matrix.copy(qt.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale);if(zt===!0)W.cameras.push(qt)}let Ht=_.enabledFeatures;if(Ht&&Ht.includes("depth-sensing")&&_.depthUsage=="gpu-optimized"&&P){T=g.getBinding();let te=T.getDepthInformation(Pt[0]);if(te&&te.isValid&&te.texture)D.init(te,_.renderState)}if(Ht&&Ht.includes("camera-access")&&P){p.state.unbindTexture(),T=g.getBinding();for(let te=0;te<Pt.length;te++){let Ut=Pt[te].camera;if(Ut){let Zt=R[Ut];if(!Zt)Zt=new ba,R[Ut]=Zt;let qt=T.getCameraImage(Ut);Zt.sourceTexture=qt}}}}for(let Pt=0;Pt<N.length;Pt++){let zt=F[Pt],Ht=N[Pt];if(zt!==null&&Ht!==void 0)Ht.update(zt,pt,S||y)}if(ht)ht(at,pt);if(pt.detectedPlanes)g.dispatchEvent({type:"planesdetected",data:pt});A=null}let At=new Vp;At.setAnimationLoop(xt),this.setAnimationLoop=function(at){ht=at},this.dispose=function(){}}}var Yb=new Jt,om=new jt;om.set(-1,0,0,0,1,0,0,0,1);function Zb(p,m){function g(R,C){if(R.matrixAutoUpdate===!0)R.updateMatrix();C.value.copy(R.matrix)}function _(R,C){if(C.color.getRGB(R.fogColor.value,yh(p)),C.isFog)R.fogNear.value=C.near,R.fogFar.value=C.far;else if(C.isFogExp2)R.fogDensity.value=C.density}function x(R,C,I,U,N){if(C.isNodeMaterial)C.uniformsNeedUpdate=!1;else if(C.isMeshBasicMaterial)y(R,C);else if(C.isMeshLambertMaterial){if(y(R,C),C.envMap)R.envMapIntensity.value=C.envMapIntensity}else if(C.isMeshToonMaterial)y(R,C),w(R,C);else if(C.isMeshPhongMaterial){if(y(R,C),T(R,C),C.envMap)R.envMapIntensity.value=C.envMapIntensity}else if(C.isMeshStandardMaterial){if(y(R,C),E(R,C),C.isMeshPhysicalMaterial)A(R,C,N)}else if(C.isMeshMatcapMaterial)y(R,C),P(R,C);else if(C.isMeshDepthMaterial)y(R,C);else if(C.isMeshDistanceMaterial)y(R,C),D(R,C);else if(C.isMeshNormalMaterial)y(R,C);else if(C.isLineBasicMaterial){if(v(R,C),C.isLineDashedMaterial)b(R,C)}else if(C.isPointsMaterial)S(R,C,I,U);else if(C.isSpriteMaterial)M(R,C);else if(C.isShadowMaterial)R.color.value.copy(C.color),R.opacity.value=C.opacity;else if(C.isShaderMaterial)C.uniformsNeedUpdate=!1}function y(R,C){if(R.opacity.value=C.opacity,C.color)R.diffuse.value.copy(C.color);if(C.emissive)R.emissive.value.copy(C.emissive).multiplyScalar(C.emissiveIntensity);if(C.map)R.map.value=C.map,g(C.map,R.mapTransform);if(C.alphaMap)R.alphaMap.value=C.alphaMap,g(C.alphaMap,R.alphaMapTransform);if(C.bumpMap){if(R.bumpMap.value=C.bumpMap,g(C.bumpMap,R.bumpMapTransform),R.bumpScale.value=C.bumpScale,C.side===gn)R.bumpScale.value*=-1}if(C.normalMap){if(R.normalMap.value=C.normalMap,g(C.normalMap,R.normalMapTransform),R.normalScale.value.copy(C.normalScale),C.side===gn)R.normalScale.value.negate()}if(C.displacementMap)R.displacementMap.value=C.displacementMap,g(C.displacementMap,R.displacementMapTransform),R.displacementScale.value=C.displacementScale,R.displacementBias.value=C.displacementBias;if(C.emissiveMap)R.emissiveMap.value=C.emissiveMap,g(C.emissiveMap,R.emissiveMapTransform);if(C.specularMap)R.specularMap.value=C.specularMap,g(C.specularMap,R.specularMapTransform);if(C.alphaTest>0)R.alphaTest.value=C.alphaTest;let I=m.get(C),{envMap:U,envMapRotation:N}=I;if(U){if(R.envMap.value=U,R.envMapRotation.value.setFromMatrix4(Yb.makeRotationFromEuler(N)).transpose(),U.isCubeTexture&&U.isRenderTargetTexture===!1)R.envMapRotation.value.premultiply(om);R.reflectivity.value=C.reflectivity,R.ior.value=C.ior,R.refractionRatio.value=C.refractionRatio}if(C.lightMap)R.lightMap.value=C.lightMap,R.lightMapIntensity.value=C.lightMapIntensity,g(C.lightMap,R.lightMapTransform);if(C.aoMap)R.aoMap.value=C.aoMap,R.aoMapIntensity.value=C.aoMapIntensity,g(C.aoMap,R.aoMapTransform)}function v(R,C){if(R.diffuse.value.copy(C.color),R.opacity.value=C.opacity,C.map)R.map.value=C.map,g(C.map,R.mapTransform)}function b(R,C){R.dashSize.value=C.dashSize,R.totalSize.value=C.dashSize+C.gapSize,R.scale.value=C.scale}function S(R,C,I,U){if(R.diffuse.value.copy(C.color),R.opacity.value=C.opacity,R.size.value=C.size*I,R.scale.value=U*0.5,C.map)R.map.value=C.map,g(C.map,R.uvTransform);if(C.alphaMap)R.alphaMap.value=C.alphaMap,g(C.alphaMap,R.alphaMapTransform);if(C.alphaTest>0)R.alphaTest.value=C.alphaTest}function M(R,C){if(R.diffuse.value.copy(C.color),R.opacity.value=C.opacity,R.rotation.value=C.rotation,C.map)R.map.value=C.map,g(C.map,R.mapTransform);if(C.alphaMap)R.alphaMap.value=C.alphaMap,g(C.alphaMap,R.alphaMapTransform);if(C.alphaTest>0)R.alphaTest.value=C.alphaTest}function T(R,C){R.specular.value.copy(C.specular),R.shininess.value=Math.max(C.shininess,0.0001)}function w(R,C){if(C.gradientMap)R.gradientMap.value=C.gradientMap}function E(R,C){if(R.metalness.value=C.metalness,C.metalnessMap)R.metalnessMap.value=C.metalnessMap,g(C.metalnessMap,R.metalnessMapTransform);if(R.roughness.value=C.roughness,C.roughnessMap)R.roughnessMap.value=C.roughnessMap,g(C.roughnessMap,R.roughnessMapTransform);if(C.envMap)R.envMapIntensity.value=C.envMapIntensity}function A(R,C,I){if(R.ior.value=C.ior,C.diffuseRoughness>0){if(R.diffuseRoughness.value=C.diffuseRoughness,C.diffuseRoughnessMap)R.diffuseRoughnessMap.value=C.diffuseRoughnessMap,g(C.diffuseRoughnessMap,R.diffuseRoughnessMapTransform)}if(C.sheen>0){if(R.sheenColor.value.copy(C.sheenColor).multiplyScalar(C.sheen),R.sheenRoughness.value=C.sheenRoughness,C.sheenColorMap)R.sheenColorMap.value=C.sheenColorMap,g(C.sheenColorMap,R.sheenColorMapTransform);if(C.sheenRoughnessMap)R.sheenRoughnessMap.value=C.sheenRoughnessMap,g(C.sheenRoughnessMap,R.sheenRoughnessMapTransform)}if(C.clearcoat>0){if(R.clearcoat.value=C.clearcoat,R.clearcoatRoughness.value=C.clearcoatRoughness,C.clearcoatMap)R.clearcoatMap.value=C.clearcoatMap,g(C.clearcoatMap,R.clearcoatMapTransform);if(C.clearcoatRoughnessMap)R.clearcoatRoughnessMap.value=C.clearcoatRoughnessMap,g(C.clearcoatRoughnessMap,R.clearcoatRoughnessMapTransform);if(C.clearcoatNormalMap){if(R.clearcoatNormalMap.value=C.clearcoatNormalMap,g(C.clearcoatNormalMap,R.clearcoatNormalMapTransform),R.clearcoatNormalScale.value.copy(C.clearcoatNormalScale),C.side===gn)R.clearcoatNormalScale.value.negate()}}if(C.dispersion>0)R.dispersion.value=C.dispersion;if(C.retroreflectivity>0)R.retroreflectivity.value=C.retroreflectivity;if(C.iridescence>0){if(R.iridescence.value=C.iridescence,R.iridescenceIOR.value=C.iridescenceIOR,R.iridescenceThicknessMinimum.value=C.iridescenceThicknessMinimum,R.iridescenceThicknessMaximum.value=C.iridescenceThicknessMaximum,C.iridescenceMap)R.iridescenceMap.value=C.iridescenceMap,g(C.iridescenceMap,R.iridescenceMapTransform);if(C.iridescenceThicknessMap)R.iridescenceThicknessMap.value=C.iridescenceThicknessMap,g(C.iridescenceThicknessMap,R.iridescenceThicknessMapTransform)}if(C.transmission>0){if(R.transmission.value=C.transmission,R.transmissionSamplerMap.value=I.texture,R.transmissionSamplerSize.value.set(I.width,I.height),C.transmissionMap)R.transmissionMap.value=C.transmissionMap,g(C.transmissionMap,R.transmissionMapTransform);if(R.thickness.value=C.thickness,C.thicknessMap)R.thicknessMap.value=C.thicknessMap,g(C.thicknessMap,R.thicknessMapTransform);R.attenuationDistance.value=C.attenuationDistance,R.attenuationColor.value.copy(C.attenuationColor)}if(C.anisotropy>0){if(R.anisotropyVector.value.set(C.anisotropy*Math.cos(C.anisotropyRotation),C.anisotropy*Math.sin(C.anisotropyRotation)),C.anisotropyMap)R.anisotropyMap.value=C.anisotropyMap,g(C.anisotropyMap,R.anisotropyMapTransform)}if(R.specularIntensity.value=C.specularIntensity,R.specularColor.value.copy(C.specularColor),C.specularColorMap)R.specularColorMap.value=C.specularColorMap,g(C.specularColorMap,R.specularColorMapTransform);if(C.specularIntensityMap)R.specularIntensityMap.value=C.specularIntensityMap,g(C.specularIntensityMap,R.specularIntensityMapTransform)}function P(R,C){if(C.matcap)R.matcap.value=C.matcap}function D(R,C){let I=m.get(C).light;R.referencePosition.value.setFromMatrixPosition(I.matrixWorld),R.nearDistance.value=I.shadow.camera.near,R.farDistance.value=I.shadow.camera.far}return{refreshFogUniforms:_,refreshMaterialUniforms:x}}function $b(p,m,g,_){let x={},y={};function v(I,U){let N=U.program;_.uniformBlockBinding(I,N,x[I.id])}function b(I,U){let N=x[I.id];if(N===void 0)P(I),N=S(I),x[I.id]=N,I.addEventListener("dispose",R);let F=U.program;_.updateUBOMapping(I,F);let z=m.render.frame;if(y[I.id]!==z)M(I),y[I.id]=z}function S(I){let U=p.createBuffer(),{__size:N,usage:F}=I;return p.bindBuffer(p.UNIFORM_BUFFER,U),p.bufferData(p.UNIFORM_BUFFER,N,F),p.bindBuffer(p.UNIFORM_BUFFER,null),U}function M(I){let U=x[I.id],{uniforms:N,__cache:F}=I;p.bindBuffer(p.UNIFORM_BUFFER,U);for(let z=0,L=N.length;z<L;z++){let O=N[z];if(Array.isArray(O))for(let V=0,Y=O.length;V<Y;V++)T(O[V],z,V,F);else T(O,z,0,F)}p.bindBuffer(p.UNIFORM_BUFFER,null)}function T(I,U,N,F){if(E(I,U,N,F)===!0){let{__offset:z,value:L}=I;if(Array.isArray(L)){let O=0;for(let V=0;V<L.length;V++){let Y=L[V],H=D(Y,!0);w(Y,I.__data,O),O+=H.storage/Float32Array.BYTES_PER_ELEMENT}}else w(L,I.__data,0);p.bufferSubData(p.UNIFORM_BUFFER,z,I.__data)}}function w(I,U,N){if(typeof I==="number"||typeof I==="boolean")U[N]=I;else if(I.isMatrix3)U[N]=I.elements[0],U[N+1]=I.elements[1],U[N+2]=I.elements[2],U[N+3]=0,U[N+4]=I.elements[3],U[N+5]=I.elements[4],U[N+6]=I.elements[5],U[N+7]=0,U[N+8]=I.elements[6],U[N+9]=I.elements[7],U[N+10]=I.elements[8],U[N+11]=0;else if(ArrayBuffer.isView(I))U.set(I.subarray(0,U.length-N),N);else I.toArray(U,N)}function E(I,U,N,F){let z=I.value,L=U+"_"+N;if(Array.isArray(z)){if(F[L]===void 0)F[L]=[];let O=F[L],V=!1;for(let Y=0;Y<z.length;Y++)if(A(z[Y],O,Y)===!0)V=!0;return V}return A(z,F,L)}function A(I,U,N){if(U[N]===void 0){if(typeof I==="number"||typeof I==="boolean")U[N]=I;else if(ArrayBuffer.isView(I))U[N]=I.slice();else U[N]=I.clone();return!0}else{let F=U[N];if(typeof I==="number"||typeof I==="boolean"){if(F!==I)return U[N]=I,!0}else if(ArrayBuffer.isView(I))return!0;else if(F.equals(I)===!1)return F.copy(I),!0}return!1}function P(I){let U=I.uniforms,N=0,F=16;for(let L=0,O=U.length;L<O;L++){let V=Array.isArray(U[L])?U[L]:[U[L]];for(let Y=0,H=V.length;Y<H;Y++){let W=V[Y],K=Array.isArray(W.value)?W.value:[W.value],G=Array.isArray(U[L])||Array.isArray(W.value),Q=N;for(let tt=0,mt=K.length;tt<mt;tt++){let rt=K[tt],ht=D(rt,G),xt=N%F,At=xt%ht.boundary,at=xt+At;if(N+=At,at!==0&&F-at<ht.storage)N+=F-at;if(tt===0)Q=N;N+=ht.storage}let st=W.type==="int"?Int32Array:W.type==="uint"?Uint32Array:Float32Array;W.__data=new st((N-Q)/Float32Array.BYTES_PER_ELEMENT),W.__offset=Q}}let z=N%F;if(z>0)N+=F-z;return I.__size=N,I.__cache={},this}function D(I,U){let N={boundary:0,storage:0};if(typeof I==="number"||typeof I==="boolean")N.boundary=4,N.storage=4;else if(I.isVector2)N.boundary=8,N.storage=8;else if(I.isVector3||I.isColor)N.boundary=16,N.storage=12;else if(I.isVector4)N.boundary=16,N.storage=16;else if(I.isMatrix3)N.boundary=16,N.storage=48;else if(I.isMatrix4)N.boundary=16,N.storage=64;else if(I.isTexture)Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(I))N.boundary=16,N.storage=I.byteLength;else Xt("WebGLRenderer: Unsupported uniform value type.",I);if(U===!0)N.boundary=16,N.storage=Math.ceil(N.storage/16)*16;return N}function R(I){let U=I.target;U.removeEventListener("dispose",R),p.deleteBuffer(x[U.id]),delete x[U.id],delete y[U.id]}function C(){for(let I in x)p.deleteBuffer(x[I]);x={},y={}}return{bind:v,update:b,dispose:C}}var Kb=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),oi=null;function Jb(){if(oi===null)oi=new Ws(Kb,16,16,cs,ri),oi.name="DFG_LUT",oi.minFilter=Rn,oi.magFilter=Rn,oi.wrapS=ra,oi.wrapT=ra,oi.generateMipmaps=!1,oi.needsUpdate=!0;return oi}class Hh{constructor(p={}){let{canvas:m=cp(),context:g=null,depth:_=!0,stencil:x=!1,alpha:y=!1,antialias:v=!1,premultipliedAlpha:b=!0,preserveDrawingBuffer:S=!1,powerPreference:M="default",failIfMajorPerformanceCaveat:T=!1,reversedDepthBuffer:w=!1,outputBufferType:E=Jn}=p;this.isWebGLRenderer=!0;let A;if(g!==null){if(typeof WebGLRenderingContext<"u"&&g instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");A=g.getContextAttributes().alpha}else A=y;let P=E,D=new Set([Cc,Rc,Ac]),R=new Set([Jn,Bi,Hr,ls,Tc,wc]),C=new Uint32Array(4),I=new Int32Array(4),U={textures:[],min:[],max:[],resolution:[]},N=null,F=null,z=[],L=[],O=null;this.domElement=m,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let V=this,Y=!1,H=null,W=null,K=null,G=null;this._outputColorSpace=ha;let Q=0,st=0,tt=null,mt=-1,rt=null,ht=new Be,xt=new Be,At=null,at=new se(0),pt=0,{width:Pt,height:zt}=m,Ht=1,Dt=null,Qt=null,te=new Be(0,0,Pt,zt),Ut=new Be(0,0,Pt,zt),Zt=!1,qt=new Oi,pe=new Zr,me=!1,ye=!1,Te=new Jt,oe=new q,gt=new Be,ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ce=!1;function ze(){return tt===null?Ht:1}let j=g;function vn(k,J){return m.getContext(k,J)}let Me,Ke,Rt,De,Yt,ee,cn,X,B,et,_t,ft,bt,Et,lt,dt,St,Z,ut,ct,yt,vt,wt;try{let k={alpha:!0,depth:_,stencil:x,antialias:v,premultipliedAlpha:b,preserveDrawingBuffer:S,powerPreference:M,failIfMajorPerformanceCaveat:T};if("setAttribute"in m)m.setAttribute("data-engine",`three.js r${os}`);if(m.addEventListener("webglcontextlost",It,!1),m.addEventListener("webglcontextrestored",Wt,!1),m.addEventListener("webglcontextcreationerror",re,!1),j===null){if(j=vn("webgl2",k),j===null)if(vn("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Vt()}catch(k){throw m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",re,!1),$t("WebGLRenderer: "+k.message),k}function Vt(){if(Me=new lv(j),Me.init(),yt=new Wb(j,Me),Ke=new Jy(j,Me,p,yt),Rt=new Gb(j,Me),Ke.reversedDepthBuffer&&w)Rt.buffers.depth.setReversed(!0);W=j.createFramebuffer(),K=j.createFramebuffer(),G=j.createFramebuffer(),De=new uv(j),Yt=new Rb,ee=new Vb(j,Me,Rt,Yt,Ke,yt,De),cn=new av(V),X=new f0(j),vt=new $y(j,X),B=new cv(j,X,De,vt),et=new fv(j,B,X,vt,De),Z=new dv(j,Ke,ee),lt=new jy(Yt),_t=new Ab(V,cn,Me,Ke,vt,lt),ft=new Zb(V,Yt),bt=new Pb,Et=new Ob(Me),St=new Zy(V,cn,Rt,et,A,b),dt=new Hb(V,et,Ke),wt=new $b(j,De,Ke,Rt),ut=new Ky(j,Me,De),ct=new hv(j,Me,De),De.programs=_t.programs,V.capabilities=Ke,V.extensions=Me,V.properties=Yt,V.renderLists=bt,V.shadowMap=dt,V.state=Rt,V.info=De}if(P!==Jn)O=new mv(P,m.width,m.height,v,_,x);let Gt=new rm(V,j);this.xr=Gt,this.getContext=function(){return j},this.getContextAttributes=function(){return j.getContextAttributes()},this.forceContextLoss=function(){let k=Me.get("WEBGL_lose_context");if(k)k.loseContext()},this.forceContextRestore=function(){let k=Me.get("WEBGL_lose_context");if(k)k.restoreContext()},this.getPixelRatio=function(){return Ht},this.setPixelRatio=function(k){if(k===void 0)return;Ht=k,this.setSize(Pt,zt,!1)},this.getSize=function(k){return k.set(Pt,zt)},this.setSize=function(k,J,ot=!0){if(Gt.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Pt=k,zt=J,m.width=Math.floor(k*Ht),m.height=Math.floor(J*Ht),ot===!0)m.style.width=k+"px",m.style.height=J+"px";if(O!==null)O.setSize(m.width,m.height);this.setViewport(0,0,k,J)},this.getDrawingBufferSize=function(k){return k.set(Pt*Ht,zt*Ht).floor()},this.setDrawingBufferSize=function(k,J,ot){Pt=k,zt=J,Ht=ot,m.width=Math.floor(k*ot),m.height=Math.floor(J*ot),this.setViewport(0,0,k,J)},this.setEffects=function(k){if(P===Jn){$t("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(k){for(let J=0;J<k.length;J++)if(k[J].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}O.setEffects(k||[])},this.getCurrentViewport=function(k){return k.copy(ht)},this.getViewport=function(k){return k.copy(te)},this.setViewport=function(k,J,ot,nt){if(k.isVector4)te.set(k.x,k.y,k.z,k.w);else te.set(k,J,ot,nt);Rt.viewport(ht.copy(te).multiplyScalar(ze()).round())},this.getScissor=function(k){return k.copy(Ut)},this.setScissor=function(k,J,ot,nt){if(k.isVector4)Ut.set(k.x,k.y,k.z,k.w);else Ut.set(k,J,ot,nt);Rt.scissor(xt.copy(Ut).multiplyScalar(ze()).round())},this.getScissorTest=function(){return Zt},this.setScissorTest=function(k){Rt.setScissorTest(Zt=k)},this.setOpaqueSort=function(k){Dt=k},this.setTransparentSort=function(k){Qt=k},this.getClearColor=function(k){return k.copy(St.getClearColor())},this.setClearColor=function(){St.setClearColor(...arguments)},this.getClearAlpha=function(){return St.getClearAlpha()},this.setClearAlpha=function(){St.setClearAlpha(...arguments)},this.clear=function(k=!0,J=!0,ot=!0){let nt=0;if(k){let it=!1;if(tt!==null){let Tt=tt.texture.format;it=D.has(Tt)}if(it){let Tt=tt.texture.type,Ot=R.has(Tt),Mt=St.getClearColor(),Nt=St.getClearAlpha(),{r:kt,g:ne,b:de}=Mt;if(Ot)C[0]=kt,C[1]=ne,C[2]=de,C[3]=Nt,j.clearBufferuiv(j.COLOR,0,C);else I[0]=kt,I[1]=ne,I[2]=de,I[3]=Nt,j.clearBufferiv(j.COLOR,0,I)}else nt|=j.COLOR_BUFFER_BIT}if(J)nt|=j.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(ot)nt|=j.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(nt!==0)j.clear(nt)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(k){k.setRenderer(this),H=k},this.dispose=function(){m.removeEventListener("webglcontextlost",It,!1),m.removeEventListener("webglcontextrestored",Wt,!1),m.removeEventListener("webglcontextcreationerror",re,!1),St.dispose(),bt.dispose(),Et.dispose(),ee.dispose(),Yt.dispose(),cn.dispose(),et.dispose(),B.dispose(),vt.dispose(),wt.dispose(),_t.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",bu),Gt.removeEventListener("sessionend",Su),Zi.stop()};function It(k){k.preventDefault(),Or("WebGLRenderer: Context Lost."),Y=!0}function Wt(){Or("WebGLRenderer: Context Restored."),Y=!1;let k=De.autoReset,J=dt.enabled,ot=dt.autoUpdate,nt=dt.needsUpdate,it=dt.type;Vt(),De.autoReset=k,dt.enabled=J,dt.autoUpdate=ot,dt.needsUpdate=nt,dt.type=it}function re(k){$t("WebGLRenderer: A WebGL context could not be created. Reason: ",k.statusMessage)}function Lt(k){let J=k.target;J.removeEventListener("dispose",Lt),Ae(J)}function Ae(k){Je(k),Yt.remove(k)}function Je(k){let J=Yt.get(k).programs;if(J!==void 0){if(J.forEach(function(ot){_t.releaseProgram(ot)}),k.isShaderMaterial)_t.releaseShaderCache(k)}}this.renderBufferDirect=function(k,J,ot,nt,it,Tt){if(J===null)J=ae;let Ot=it.isMesh&&it.matrixWorld.determinantAffine()<0,Mt=gg(k,J,ot,nt,it);Rt.setMaterial(nt,Ot);let Nt=ot.index,kt=1;if(nt.wireframe===!0){if(Nt=B.getWireframeAttribute(ot),Nt===void 0)return;kt=2}let ne=ot.drawRange,de=ot.attributes.position,Ft=ne.start*kt,fe=(ne.start+ne.count)*kt;if(Tt!==null)Ft=Math.max(Ft,Tt.start*kt),fe=Math.min(fe,(Tt.start+Tt.count)*kt);if(Nt!==null)Ft=Math.max(Ft,0),fe=Math.min(fe,Nt.count);else if(de!==void 0&&de!==null)Ft=Math.max(Ft,0),fe=Math.min(fe,de.count);let He=fe-Ft;if(He<0||He===1/0)return;vt.setup(it,nt,Mt,ot,Nt);let Ue,Pe=ut;if(Nt!==null)Ue=X.get(Nt),Pe=ct,Pe.setIndex(Ue);if(it.isMesh)if(nt.wireframe===!0)Rt.setLineWidth(nt.wireframeLinewidth*ze()),Pe.setMode(j.LINES);else Pe.setMode(j.TRIANGLES);else if(it.isLine){let hn=nt.linewidth;if(hn===void 0)hn=1;if(Rt.setLineWidth(hn*ze()),it.isLineSegments)Pe.setMode(j.LINES);else if(it.isLineLoop)Pe.setMode(j.LINE_LOOP);else Pe.setMode(j.LINE_STRIP)}else if(it.isPoints)Pe.setMode(j.POINTS);else if(it.isSprite)Pe.setMode(j.TRIANGLES);if(it.isBatchedMesh)if(!Me.get("WEBGL_multi_draw")){let{_multiDrawStarts:hn,_multiDrawCounts:Bt,_multiDrawCount:bn}=it,ve=Nt?X.get(Nt).bytesPerElement:1,$i=Yt.get(nt).currentProgram.getUniforms();for(let un=0;un<bn;un++)$i.setValue(j,"_gl_DrawID",un),Pe.render(hn[un]/ve,Bt[un])}else Pe.renderMultiDraw(it._multiDrawStarts,it._multiDrawCounts,it._multiDrawCount);else if(it.isInstancedMesh)Pe.renderInstances(Ft,He,it.count);else if(ot.isInstancedBufferGeometry){let hn=ot._maxInstanceCount!==void 0?ot._maxInstanceCount:1/0,Bt=Math.min(ot.instanceCount,hn);Pe.renderInstances(Ft,He,Bt)}else Pe.render(Ft,He)};function hi(k,J,ot,nt){if(H!==null&&k.isNodeMaterial)H.setObject(nt,k);if(me===!0)lt.setState(k,ot,!1);if(k.transparent===!0&&k.side===kn&&k.forceSinglePass===!1)k.side=gn,k.needsUpdate=!0,vr(k,J,nt),k.side=vi,k.needsUpdate=!0,vr(k,J,nt),k.side=kn;else vr(k,J,nt)}this.compile=function(k,J,ot=null){if(ot===null)ot=k;if(H!==null)H.renderStart(k,J,ot);if(F=Et.get(ot),F.init(J),L.push(F),ot.traverseVisible(function(it){if(it.isLight&&it.layers.test(J.layers)){if(F.pushLight(it),it.castShadow)F.pushShadow(it)}}),k!==ot)k.traverseVisible(function(it){if(it.isLight&&it.layers.test(J.layers)){if(F.pushLight(it),it.castShadow)F.pushShadow(it)}});if(F.setupLights(),H!==null)H.updateLights(F.state.lightsArray);if(ye=this.localClippingEnabled,me=lt.init(this.clippingPlanes,ye),me===!0)lt.setGlobalState(this.clippingPlanes,J);if(H!==null)dt.render(F.state.shadowsArray,ot,J);let nt=new Set;if(k.traverse(function(it){if(!(it.isMesh||it.isPoints||it.isLine||it.isSprite))return;let Tt=it.material;if(Tt)if(Array.isArray(Tt))for(let Ot=0;Ot<Tt.length;Ot++){let Mt=Tt[Ot];hi(Mt,ot,J,it),nt.add(Mt)}else hi(Tt,ot,J,it),nt.add(Tt)}),F=L.pop(),H!==null)H.renderEnd();return nt},this.compileAsync=function(k,J,ot=null){let nt=this.compile(k,J,ot);return new Promise((it)=>{function Tt(){if(nt.forEach(function(Ot){let Nt=Yt.get(Ot).currentProgram;if(Nt===void 0||Nt.isReady())nt.delete(Ot)}),nt.size===0){it(k);return}setTimeout(Tt,10)}if(Me.get("KHR_parallel_shader_compile")!==null)Tt();else setTimeout(Tt,10)})};let hl=null;function pg(k){if(hl)hl(k)}function bu(){Zi.stop()}function Su(){Zi.start()}let Zi=new Vp;if(Zi.setAnimationLoop(pg),typeof self<"u")Zi.setContext(self);this.setAnimationLoop=function(k){hl=k,Gt.setAnimationLoop(k),k===null?Zi.stop():Zi.start()},Gt.addEventListener("sessionstart",bu),Gt.addEventListener("sessionend",Su),this.render=function(k,J){if(J!==void 0&&J.isCamera!==!0){$t("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(Y===!0)return;if(H!==null)H.renderStart(k,J);let ot=Gt.enabled===!0&&Gt.isPresenting===!0,nt=O!==null&&(tt===null||ot)&&O.begin(V,tt);if(k.matrixWorldAutoUpdate===!0)k.updateMatrixWorld();if(J.parent===null&&J.matrixWorldAutoUpdate===!0)J.updateMatrixWorld();if(Gt.enabled===!0&&Gt.isPresenting===!0&&(O===null||O.isCompositing()===!1)){if(Gt.cameraAutoUpdate===!0)Gt.updateCamera(J);J=Gt.getCamera()}if(k.isScene===!0)k.onBeforeRender(V,k,J,tt);if(F=Et.get(k,L.length),F.init(J),F.state.textureUnits=ee.getTextureUnits(),L.push(F),Te.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),J.isArrayCamera)pe.setFromArrayCamera(J);else qt.setFromProjectionMatrix(Te,hh,J.reversedDepth);if(ye=this.localClippingEnabled,me=lt.init(this.clippingPlanes,ye),N=bt.get(k,z.length),N.init(),z.push(N),this.info.render.frame++,Gt.enabled===!0&&Gt.isPresenting===!0){let Ot=V.xr.getDepthSensingMesh();if(Ot!==null)ul(Ot,J,-1/0,V.sortObjects)}if(ul(k,J,0,V.sortObjects),N.finish(),H!==null)H.updateLights(F.state.lightsArray);if(V.sortObjects===!0)N.sort(Dt,Qt);if(ce=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,ce)St.addToRenderList(N,k);if(this.info.autoReset===!0)this.info.reset();if(me===!0)lt.beginShadows();let it=F.state.shadowsArray;if(dt.render(it,k,J),me===!0)lt.endShadows();if((nt&&O.hasRenderPass())===!1){let Ot=N.opaque,Mt=N.transmissive;if(F.setupLights(),J.isArrayCamera){let Nt=J.cameras;if(Mt.length>0)for(let kt=0,ne=Nt.length;kt<ne;kt++){let de=Nt[kt];Eu(Ot,Mt,k,de)}if(ce)St.render(k);for(let kt=0,ne=Nt.length;kt<ne;kt++){let de=Nt[kt];Mu(N,k,de,de.viewport)}}else{if(Mt.length>0)Eu(Ot,Mt,k,J);if(ce)St.render(k);Mu(N,k,J)}}if(tt!==null&&st===0)ee.updateMultisampleRenderTarget(tt),ee.updateRenderTargetMipmap(tt);if(nt)O.end(V);if(k.isScene===!0)k.onAfterRender(V,k,J);if(vt.resetDefaultState(),mt=-1,rt=null,L.pop(),L.length>0){if(F=L[L.length-1],ee.setTextureUnits(F.state.textureUnits),me===!0)lt.setGlobalState(V.clippingPlanes,F.state.camera)}else F=null;if(z.pop(),z.length>0)N=z[z.length-1];else N=null;if(H!==null)H.renderEnd()};function ul(k,J,ot,nt){if(k.visible===!1)return;if(k.layers.test(J.layers)){if(k.isGroup)ot=k.renderOrder;else if(k.isLOD){if(k.autoUpdate===!0)k.update(J)}else if(k.isLight){if(F.pushLight(k),k.castShadow)F.pushShadow(k)}else if(k.isSprite){let Ot=J.isArrayCamera?pe:qt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){if(nt)gt.setFromMatrixPosition(k.matrixWorld).applyMatrix4(Te);let Mt=et.update(k),Nt=k.material;if(Nt.visible)N.push(k,Mt,Nt,ot,gt.z,null,J)}}else if(k.isMesh||k.isLine||k.isPoints){let Ot=J.isArrayCamera?pe:qt;if(!k.frustumCulled||k.intersectsFrustum(Ot)){let Mt=et.update(k),Nt=k.material;if(nt){if(k.boundingSphere!==void 0){if(k.boundingSphere===null)k.computeBoundingSphere();gt.copy(k.boundingSphere.center)}else{if(Mt.boundingSphere===null)Mt.computeBoundingSphere();gt.copy(Mt.boundingSphere.center)}gt.applyMatrix4(k.matrixWorld).applyMatrix4(Te)}if(Array.isArray(Nt)){let kt=Mt.groups;for(let ne=0,de=kt.length;ne<de;ne++){let Ft=kt[ne],fe=Nt[Ft.materialIndex];if(fe&&fe.visible)N.push(k,Mt,fe,ot,gt.z,Ft,J)}}else if(Nt.visible)N.push(k,Mt,Nt,ot,gt.z,null,J)}}}let Tt=k.children;for(let Ot=0,Mt=Tt.length;Ot<Mt;Ot++)ul(Tt[Ot],J,ot,nt)}function Mu(k,J,ot,nt){let{opaque:it,transmissive:Tt,transparent:Ot}=k;if(F.setupLightsView(ot),me===!0)lt.setGlobalState(V.clippingPlanes,ot);if(nt)Rt.viewport(ht.copy(nt));if(it.length>0)yo(it,J,ot);if(Tt.length>0)yo(Tt,J,ot);if(Ot.length>0)yo(Ot,J,ot);Rt.buffers.depth.setTest(!0),Rt.buffers.depth.setMask(!0),Rt.buffers.color.setMask(!0),Rt.setPolygonOffset(!1)}function Eu(k,J,ot,nt){if((ot.isScene===!0?ot.overrideMaterial:null)!==null)return;if(F.state.transmissionRenderTarget[nt.id]===void 0){let Ft=Me.has("EXT_color_buffer_half_float")||Me.has("EXT_color_buffer_float");F.state.transmissionRenderTarget[nt.id]=new Hn(1,1,{generateMipmaps:!0,type:Ft?ri:Jn,minFilter:Kn,samples:Math.max(4,Ke.samples),stencilBuffer:x,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:he.workingColorSpace})}let Tt=F.state.transmissionRenderTarget[nt.id],Ot=nt.viewport||ht;Tt.setSize(Ot.z*V.transmissionResolutionScale,Ot.w*V.transmissionResolutionScale);let Mt=V.getRenderTarget(),Nt=V.getActiveCubeFace(),kt=V.getActiveMipmapLevel();if(V.setRenderTarget(Tt),V.getClearColor(at),pt=V.getClearAlpha(),pt<1)V.setClearColor(16777215,0.5);if(V.clear(),ce)St.render(ot);let ne=V.toneMapping;V.toneMapping=si;let de=nt.viewport;if(nt.viewport!==void 0)nt.viewport=void 0;if(F.setupLightsView(nt),me===!0)lt.setGlobalState(V.clippingPlanes,nt);if(yo(k,ot,nt),ee.updateMultisampleRenderTarget(Tt),ee.updateRenderTargetMipmap(Tt),Me.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let fe=0,He=J.length;fe<He;fe++){let Ue=J[fe],{object:Pe,geometry:hn,material:Bt,group:bn}=Ue;if(Bt.side===kn&&Pe.layers.test(nt.layers)){let ve=Bt.side;Bt.side=gn,Bt.needsUpdate=!0,Tu(Pe,ot,nt,hn,Bt,bn),Bt.side=ve,Bt.needsUpdate=!0,Ft=!0}}if(Ft===!0)ee.updateMultisampleRenderTarget(Tt),ee.updateRenderTargetMipmap(Tt)}if(V.setRenderTarget(Mt,Nt,kt),V.setClearColor(at,pt),de!==void 0)nt.viewport=de;V.toneMapping=ne}function yo(k,J,ot){let nt=J.isScene===!0?J.overrideMaterial:null;for(let it=0,Tt=k.length;it<Tt;it++){let Ot=k[it],{object:Mt,geometry:Nt,group:kt}=Ot,ne=Ot.material;if(ne.allowOverride===!0&&nt!==null)ne=nt;if(Mt.layers.test(ot.layers))Tu(Mt,J,ot,Nt,ne,kt)}}function Tu(k,J,ot,nt,it,Tt){if(H!==null&&it.isNodeMaterial)H.setObject(k,it);if(k.onBeforeRender(V,J,ot,nt,it,Tt),k.modelViewMatrix.multiplyMatrices(ot.matrixWorldInverse,k.matrixWorld),k.normalMatrix.getNormalMatrix(k.modelViewMatrix),it.onBeforeRender(V,J,ot,nt,k,Tt),it.transparent===!0&&it.side===kn&&it.forceSinglePass===!1)it.side=gn,it.needsUpdate=!0,V.renderBufferDirect(ot,J,nt,it,k,Tt),it.side=vi,it.needsUpdate=!0,V.renderBufferDirect(ot,J,nt,it,k,Tt),it.side=kn;else V.renderBufferDirect(ot,J,nt,it,k,Tt);k.onAfterRender(V,J,ot,nt,it,Tt)}function wu(k){let J=0;for(let ot of k)if(ot.texture!==null)J++;return J}function vr(k,J,ot){if(J.isScene!==!0)J=ae;let nt=Yt.get(k),it=F.state.lights,Tt=F.state.shadowsArray,Ot=it.state.version,Mt=_t.getParameters(k,it.state,Tt,J,ot,F.state.lightProbeGridArray),Nt=_t.getProgramCacheKey(Mt),kt=nt.programs;nt.environment=k.isMeshStandardMaterial||k.isMeshLambertMaterial||k.isMeshPhongMaterial?J.environment:null,nt.fog=J.fog;let ne=k.isMeshStandardMaterial||k.isMeshLambertMaterial&&!k.envMap||k.isMeshPhongMaterial&&!k.envMap;if(nt.envMap=cn.get(k.envMap||nt.environment,ne),nt.envMapRotation=nt.environment!==null&&k.envMap===null?J.environmentRotation:k.envMapRotation,kt===void 0)k.addEventListener("dispose",Lt),kt=new Map,nt.programs=kt,nt.programVariants=new Map;let de=kt.get(Nt);if(de!==void 0){if(nt.currentProgram===de&&nt.lightsStateVersion===Ot)return Ru(k,Mt),de}else{if(Mt.uniforms=_t.getUniforms(k),H!==null&&k.isNodeMaterial)H.build(k,ot,Mt);k.onBeforeCompile(Mt,V),de=_t.acquireProgram(Mt,Nt),kt.set(Nt,de),nt.uniforms=Mt.uniforms}let Ft=nt.uniforms;if(!k.isShaderMaterial&&!k.isRawShaderMaterial||k.clipping===!0)Ft.clippingPlanes=lt.uniform;if(Ru(k,Mt),nt.needsLights=xg(k),nt.lightsStateVersion=Ot,nt.needsLights)Ft.ambientLightColor.value=it.state.ambient,Ft.lightProbe.value=it.state.probe,Ft.sunLights.value=it.state.sun,Ft.sunLightShadows.value=it.state.sunShadow,Ft.directionalLights.value=it.state.directional,Ft.directionalLightShadows.value=it.state.directionalShadow,Ft.spotLights.value=it.state.spot,Ft.spotLightShadows.value=it.state.spotShadow,Ft.rectAreaLights.value=it.state.rectArea,Ft.ltc_1.value=it.state.rectAreaLTC1,Ft.ltc_2.value=it.state.rectAreaLTC2,Ft.pointLights.value=it.state.point,Ft.pointLightShadows.value=it.state.pointShadow,Ft.hemisphereLights.value=it.state.hemi,Ft.sunShadowMatrix.value=it.state.sunShadowMatrix,Ft.sunShadowCascade.value=it.state.sunShadowCascade,Ft.directionalShadowMatrix.value=it.state.directionalShadowMatrix,Ft.spotLightMatrix.value=it.state.spotLightMatrix,Ft.spotLightMap.value=it.state.spotLightMap,Ft.pointShadowMatrix.value=it.state.pointShadowMatrix;return nt.numLightProbeGrids=wu(F.state.lightProbeGridArray),nt.currentProgram=de,nt.uniformsList=null,de}function mg(k,J,ot,nt,it){let Tt=Yt.get(k),Ot=Tt.currentProgram.id+","+nt+","+it,Mt=Tt.programVariants.get(Ot);if(Mt===void 0)Mt=vr(k,J,ot),Tt.programVariants.set(Ot,Mt);else Tt.currentProgram=Mt,Tt.uniformsList=null,Tt.outputColorSpace=nt,Tt.toneMapping=it;return Mt}function Au(k){if(k.uniformsList===null){let J=k.currentProgram.getUniforms();k.uniformsList=io.seqWithValue(J.seq,k.uniforms)}return k.uniformsList}function Ru(k,J){let ot=Yt.get(k);ot.outputColorSpace=J.outputColorSpace,ot.batching=J.batching,ot.batchingColor=J.batchingColor,ot.instancing=J.instancing,ot.instancingColor=J.instancingColor,ot.instancingMorph=J.instancingMorph,ot.skinning=J.skinning,ot.morphTargets=J.morphTargets,ot.morphNormals=J.morphNormals,ot.morphColors=J.morphColors,ot.morphTargetsCount=J.morphTargetsCount,ot.numClippingPlanes=J.numClippingPlanes,ot.numIntersection=J.numClipIntersection,ot.vertexAlphas=J.vertexAlphas,ot.vertexTangents=J.vertexTangents,ot.toneMapping=J.toneMapping}function gg(k,J,ot,nt,it){if(J.isScene!==!0)J=ae;ee.resetTextureUnits();let Tt=J.fog,Ot=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial?J.environment:null,Mt=tt===null?V.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:he.workingColorSpace,Nt=nt.isMeshStandardMaterial||nt.isMeshLambertMaterial&&!nt.envMap||nt.isMeshPhongMaterial&&!nt.envMap,kt=cn.get(nt.envMap||Ot,Nt),ne=nt.vertexColors===!0&&!!ot.attributes.color&&ot.attributes.color.itemSize===4,de=!!ot.attributes.tangent&&(!!nt.normalMap||nt.anisotropy>0),Ft=!!ot.morphAttributes.position,fe=!!ot.morphAttributes.normal,He=!!ot.morphAttributes.color,Ue=si;if(nt.toneMapped){if(tt===null||tt.isXRRenderTarget===!0)Ue=V.toneMapping}let Pe=ot.morphAttributes.position||ot.morphAttributes.normal||ot.morphAttributes.color,hn=Pe!==void 0?Pe.length:0,Bt=Yt.get(nt),bn=F.state.lights;if(me===!0){if(ye===!0||k!==rt){let Fe=k===rt&&nt.id===mt;lt.setState(nt,k,Fe)}}let ve=!1,$i=!1;if(nt.version===Bt.__version){if(Bt.needsLights&&Bt.lightsStateVersion!==bn.state.version)ve=!0;else if(it.isBatchedMesh&&Bt.batching===!1)ve=!0;else if(!it.isBatchedMesh&&Bt.batching===!0)ve=!0;else if(it.isBatchedMesh&&Bt.batchingColor===!0&&it._colorsTexture===null)ve=!0;else if(it.isBatchedMesh&&Bt.batchingColor===!1&&it._colorsTexture!==null)ve=!0;else if(it.isInstancedMesh&&Bt.instancing===!1)ve=!0;else if(!it.isInstancedMesh&&Bt.instancing===!0)ve=!0;else if(it.isSkinnedMesh&&Bt.skinning===!1)ve=!0;else if(!it.isSkinnedMesh&&Bt.skinning===!0)ve=!0;else if(it.isInstancedMesh&&Bt.instancingColor===!0&&it.instanceColor===null)ve=!0;else if(it.isInstancedMesh&&Bt.instancingColor===!1&&it.instanceColor!==null)ve=!0;else if(it.isInstancedMesh&&Bt.instancingMorph===!0&&it.morphTexture===null)ve=!0;else if(it.isInstancedMesh&&Bt.instancingMorph===!1&&it.morphTexture!==null)ve=!0;else if(Bt.envMap!==kt)ve=!0;else if(nt.fog===!0&&Bt.fog!==Tt)ve=!0;else if(Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==lt.numPlanes||Bt.numIntersection!==lt.numIntersection))ve=!0;else if(Bt.vertexAlphas!==ne)ve=!0;else if(Bt.vertexTangents!==de)ve=!0;else if(Bt.morphTargets!==Ft)ve=!0;else if(Bt.morphNormals!==fe)ve=!0;else if(Bt.morphColors!==He)ve=!0;else if(Bt.morphTargetsCount!==hn)ve=!0;else if(Bt.numLightProbeGrids!==wu(F.state.lightProbeGridArray))ve=!0;else if(Bt.outputColorSpace!==Mt||Bt.toneMapping!==Ue)$i=!0}else ve=!0,Bt.__version=nt.version;let un=Bt.currentProgram;if(ve===!0||$i===!0){if(un=$i===!0?mg(nt,J,it,Mt,Ue):vr(nt,J,it),H&&nt.isNodeMaterial)H.onUpdateProgram(nt,un,Bt)}let vo=!1,Ci=!1,Ki=!1,_e=un.getUniforms(),rn=Bt.uniforms;if(Rt.useProgram(un.program))vo=!0,Ci=!0,Ki=!0;if(nt.id!==mt)mt=nt.id,Ci=!0;if(vo||rt!==k){if(Rt.buffers.depth.getReversed()&&k.reversedDepth!==!0)k._reversedDepth=!0,k.updateProjectionMatrix();_e.setValue(j,"projectionMatrix",k.projectionMatrix),_e.setValue(j,"viewMatrix",k.matrixWorldInverse);let je=_e.map.cameraPosition;if(je!==void 0)je.setValue(j,oe.setFromMatrixPosition(k.matrixWorld));if(Ke.logarithmicDepthBuffer)_e.setValue(j,"logDepthBufFC",2/(Math.log(k.far+1)/Math.LN2));if(nt.isMeshPhongMaterial||nt.isMeshToonMaterial||nt.isMeshLambertMaterial||nt.isMeshBasicMaterial||nt.isMeshStandardMaterial||nt.isShaderMaterial)_e.setValue(j,"isOrthographic",k.isOrthographicCamera===!0);if(rt!==k)rt=k,Ci=!0,Ki=!0}if(Bt.needsLights){if(bn.state.sunShadowMap.length>0)_e.setValue(j,"sunShadowMap",bn.state.sunShadowMap,ee);if(bn.state.directionalShadowMap.length>0)_e.setValue(j,"directionalShadowMap",bn.state.directionalShadowMap,ee);if(bn.state.spotShadowMap.length>0)_e.setValue(j,"spotShadowMap",bn.state.spotShadowMap,ee);if(bn.state.pointShadowMap.length>0)_e.setValue(j,"pointShadowMap",bn.state.pointShadowMap,ee)}if(it.isSkinnedMesh){_e.setOptional(j,it,"bindMatrix"),_e.setOptional(j,it,"bindMatrixInverse");let Fe=it.skeleton;if(Fe){if(Fe.boneTexture===null)Fe.computeBoneTexture();_e.setValue(j,"boneTexture",Fe.boneTexture,ee)}}if(it.isBatchedMesh){if(_e.setOptional(j,it,"batchingTexture"),_e.setValue(j,"batchingTexture",it._matricesTexture,ee),_e.setOptional(j,it,"batchingIdTexture"),_e.setValue(j,"batchingIdTexture",it._indirectTexture,ee),_e.setOptional(j,it,"batchingColorTexture"),it._colorsTexture!==null)_e.setValue(j,"batchingColorTexture",it._colorsTexture,ee)}let qn=ot.morphAttributes;if(qn.position!==void 0||qn.normal!==void 0||qn.color!==void 0)Z.update(it,ot,un);if(Ci||Bt.receiveShadow!==it.receiveShadow)Bt.receiveShadow=it.receiveShadow,_e.setValue(j,"receiveShadow",it.receiveShadow);if((nt.isMeshStandardMaterial||nt.isMeshLambertMaterial||nt.isMeshPhongMaterial)&&nt.envMap===null&&J.environment!==null)rn.envMapIntensity.value=J.environmentIntensity;if(rn.dfgLUT!==void 0)rn.dfgLUT.value=Jb();if(Ci){if(_e.setValue(j,"toneMappingExposure",V.toneMappingExposure),Bt.needsLights)_g(rn,Ki);if(Tt&&nt.fog===!0)ft.refreshFogUniforms(rn,Tt);if(ft.refreshMaterialUniforms(rn,nt,Ht,zt,F.state.transmissionRenderTarget[k.id]),Bt.needsLights&&Bt.numLightProbeGrids>0){let Fe=U,je=0;for(let ui of F.state.lightProbeGridArray){if(ui.texture===null)continue;Fe.textures[je]=ui.texture,Fe.min[je]=ui.boundingBox.min,Fe.max[je]=ui.boundingBox.max,Fe.resolution[je]=ui.resolution,je++}for(let ui in Fe)Fe[ui].length=je;rn.probesSH.value=Fe.textures,rn.probesMin.value=Fe.min,rn.probesMax.value=Fe.max,rn.probesResolution.value=Fe.resolution}io.upload(j,Au(Bt),rn,ee)}if(nt.isShaderMaterial&&nt.uniformsNeedUpdate===!0)io.upload(j,Au(Bt),rn,ee),nt.uniformsNeedUpdate=!1;if(nt.isSpriteMaterial)_e.setValue(j,"center",it.center);if(_e.setValue(j,"modelViewMatrix",it.modelViewMatrix),_e.setValue(j,"normalMatrix",it.normalMatrix),_e.setValue(j,"modelMatrix",it.matrixWorld),nt.uniformsGroups!==void 0){let Fe=nt.uniformsGroups;for(let je=0,ui=Fe.length;je<ui;je++){let Pu=Fe[je];wt.update(Pu,un),wt.bind(Pu,un)}}return un}function _g(k,J){k.ambientLightColor.needsUpdate=J,k.lightProbe.needsUpdate=J,k.sunLights.needsUpdate=J,k.sunLightShadows.needsUpdate=J,k.directionalLights.needsUpdate=J,k.directionalLightShadows.needsUpdate=J,k.pointLights.needsUpdate=J,k.pointLightShadows.needsUpdate=J,k.spotLights.needsUpdate=J,k.spotLightShadows.needsUpdate=J,k.rectAreaLights.needsUpdate=J,k.hemisphereLights.needsUpdate=J}function xg(k){return k.isMeshLambertMaterial||k.isMeshToonMaterial||k.isMeshPhongMaterial||k.isMeshStandardMaterial||k.isShadowMaterial||k.isShaderMaterial&&k.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return st},this.getRenderTarget=function(){return tt},this.setRenderTargetTextures=function(k,J,ot){let nt=Yt.get(k);if(nt.__autoAllocateDepthBuffer=k.resolveDepthBuffer===!1,nt.__autoAllocateDepthBuffer===!1)nt.__useRenderToTexture=!1;Yt.get(k.texture).__webglTexture=J,Yt.get(k.depthTexture).__webglTexture=nt.__autoAllocateDepthBuffer?void 0:ot,nt.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(k,J){let ot=Yt.get(k);ot.__webglFramebuffer=J,ot.__useDefaultFramebuffer=J===void 0},this.setRenderTarget=function(k,J=0,ot=0){tt=k,Q=J,st=ot;let nt=null,it=!1,Tt=!1;if(k){let Mt=Yt.get(k);if(Mt.__useDefaultFramebuffer!==void 0){Rt.bindFramebuffer(j.FRAMEBUFFER,Mt.__webglFramebuffer),ht.copy(k.viewport),xt.copy(k.scissor),At=k.scissorTest,Rt.viewport(ht),Rt.scissor(xt),Rt.setScissorTest(At),mt=-1;return}else if(Mt.__webglFramebuffer===void 0)ee.setupRenderTarget(k);else if(Mt.__hasExternalTextures)ee.rebindTextures(k,Yt.get(k.texture).__webglTexture,Yt.get(k.depthTexture).__webglTexture);else if(k.depthBuffer){let ne=k.depthTexture;if(Mt.__boundDepthTexture!==ne){if(ne!==null&&Yt.has(ne)&&(k.width!==ne.image.width||k.height!==ne.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ee.setupDepthRenderbuffer(k)}}let Nt=k.texture;if(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)Tt=!0;let kt=Yt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget){if(Array.isArray(kt[J]))nt=kt[J][ot];else nt=kt[J];it=!0}else if(k.samples>0&&ee.useMultisampledRTT(k)===!1)nt=Yt.get(k).__webglMultisampledFramebuffer;else if(Array.isArray(kt))nt=kt[ot];else nt=kt;ht.copy(k.viewport),xt.copy(k.scissor),At=k.scissorTest}else ht.copy(te).multiplyScalar(Ht).floor(),xt.copy(Ut).multiplyScalar(Ht).floor(),At=Zt;if(ot!==0)nt=W;if(Rt.bindFramebuffer(j.FRAMEBUFFER,nt))Rt.drawBuffers(k,nt);if(Rt.viewport(ht),Rt.scissor(xt),Rt.setScissorTest(At),it){let Mt=Yt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_CUBE_MAP_POSITIVE_X+J,Mt.__webglTexture,ot)}else if(Tt){let Mt=J;for(let Nt=0;Nt<k.textures.length;Nt++){let kt=Yt.get(k.textures[Nt]);j.framebufferTextureLayer(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0+Nt,kt.__webglTexture,ot,Mt)}}else if(k!==null&&ot!==0){let Mt=Yt.get(k.texture);j.framebufferTexture2D(j.FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,Mt.__webglTexture,ot)}mt=-1};function Cu(k){let J=Yt.get(k);if(J.__readFormat!==k.format||J.__readType!==k.type)J.__readFormat=k.format,J.__readType=k.type,J.__formatReadable=Ke.textureFormatReadable(k.format),J.__typeReadable=Ke.textureTypeReadable(k.type);return J}if(this.readRenderTargetPixels=function(k,J,ot,nt,it,Tt,Ot,Mt=0){if(!(k&&k.isWebGLRenderTarget)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Nt=Yt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt){Rt.bindFramebuffer(j.FRAMEBUFFER,Nt);try{let kt=k.textures[Mt],{format:ne,type:de}=kt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Mt);let Ft=Cu(kt);if(Ft.__formatReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ft.__typeReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(J>=0&&J<=k.width-nt&&(ot>=0&&ot<=k.height-it))j.readPixels(J,ot,nt,it,yt.convert(ne),yt.convert(de),Tt)}finally{let kt=tt!==null?Yt.get(tt).__webglFramebuffer:null;Rt.bindFramebuffer(j.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(k,J,ot,nt,it,Tt,Ot,Mt=0){if(!(k&&k.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Nt=Yt.get(k).__webglFramebuffer;if(k.isWebGLCubeRenderTarget&&Ot!==void 0){if(Nt=Nt[Ot],Array.isArray(Nt))Nt=Nt[0]}if(Nt)if(J>=0&&J<=k.width-nt&&(ot>=0&&ot<=k.height-it)){Rt.bindFramebuffer(j.FRAMEBUFFER,Nt);let kt=k.textures[Mt],{format:ne,type:de}=kt;if(k.textures.length>1)j.readBuffer(j.COLOR_ATTACHMENT0+Mt);let Ft=Cu(kt);if(Ft.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ft.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let fe=j.createBuffer();j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.bufferData(j.PIXEL_PACK_BUFFER,Tt.byteLength,j.STREAM_READ),j.readPixels(J,ot,nt,it,yt.convert(ne),yt.convert(de),0),j.bindBuffer(j.PIXEL_PACK_BUFFER,null);let He=tt!==null?Yt.get(tt).__webglFramebuffer:null;Rt.bindFramebuffer(j.FRAMEBUFFER,He);let Ue=j.fenceSync(j.SYNC_GPU_COMMANDS_COMPLETE,0);return j.flush(),await up(j,Ue,4),j.bindBuffer(j.PIXEL_PACK_BUFFER,fe),j.getBufferSubData(j.PIXEL_PACK_BUFFER,0,Tt),j.bindBuffer(j.PIXEL_PACK_BUFFER,null),j.deleteBuffer(fe),j.deleteSync(Ue),Tt}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(k,J=null,ot=0){let nt=Math.pow(2,-ot),it=Math.floor(k.image.width*nt),Tt=Math.floor(k.image.height*nt),Ot=J!==null?J.x:0,Mt=J!==null?J.y:0;ee.setTexture2D(k,0),j.copyTexSubImage2D(j.TEXTURE_2D,ot,0,0,Ot,Mt,it,Tt),Rt.unbindTexture()},this.copyTextureToTexture=function(k,J,ot=null,nt=null,it=0,Tt=0){let Ot,Mt,Nt,kt,ne,de,Ft,fe,He,Ue=k.isCompressedTexture?k.mipmaps[Tt]:k.image;if(ot!==null)Ot=ot.max.x-ot.min.x,Mt=ot.max.y-ot.min.y,Nt=ot.isBox3?ot.max.z-ot.min.z:1,kt=ot.min.x,ne=ot.min.y,de=ot.isBox3?ot.min.z:0;else{let _e=Math.pow(2,-it);if(Ot=Math.floor(Ue.width*_e),Mt=Math.floor(Ue.height*_e),k.isDataArrayTexture)Nt=Ue.depth;else if(k.isData3DTexture)Nt=Math.floor(Ue.depth*_e);else Nt=1;kt=0,ne=0,de=0}if(nt!==null)Ft=nt.x,fe=nt.y,He=nt.z;else Ft=0,fe=0,He=0;let Pe=yt.convert(J.format),hn=yt.convert(J.type),Bt;if(J.isData3DTexture)ee.setTexture3D(J,0),Bt=j.TEXTURE_3D;else if(J.isDataArrayTexture||J.isCompressedArrayTexture)ee.setTexture2DArray(J,0),Bt=j.TEXTURE_2D_ARRAY;else ee.setTexture2D(J,0),Bt=j.TEXTURE_2D;Rt.activeTexture(j.TEXTURE0),Rt.pixelStorei(j.UNPACK_FLIP_Y_WEBGL,J.flipY),Rt.pixelStorei(j.UNPACK_PREMULTIPLY_ALPHA_WEBGL,J.premultiplyAlpha),Rt.pixelStorei(j.UNPACK_ALIGNMENT,J.unpackAlignment);let bn=Rt.getParameter(j.UNPACK_ROW_LENGTH),ve=Rt.getParameter(j.UNPACK_IMAGE_HEIGHT),$i=Rt.getParameter(j.UNPACK_SKIP_PIXELS),un=Rt.getParameter(j.UNPACK_SKIP_ROWS),vo=Rt.getParameter(j.UNPACK_SKIP_IMAGES);Rt.pixelStorei(j.UNPACK_ROW_LENGTH,Ue.width),Rt.pixelStorei(j.UNPACK_IMAGE_HEIGHT,Ue.height),Rt.pixelStorei(j.UNPACK_SKIP_PIXELS,kt),Rt.pixelStorei(j.UNPACK_SKIP_ROWS,ne),Rt.pixelStorei(j.UNPACK_SKIP_IMAGES,de);let Ci=k.isDataArrayTexture||k.isData3DTexture,Ki=J.isDataArrayTexture||J.isData3DTexture;if(k.isDepthTexture){let _e=Yt.get(k),rn=Yt.get(J),qn=Yt.get(_e.__renderTarget),Fe=Yt.get(rn.__renderTarget);Rt.bindFramebuffer(j.READ_FRAMEBUFFER,qn.__webglFramebuffer),Rt.bindFramebuffer(j.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let je=0;je<Nt;je++){if(Ci)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Yt.get(k).__webglTexture,it,de+je),j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,Yt.get(J).__webglTexture,Tt,He+je);j.blitFramebuffer(kt,ne,kt+Ot,ne+Mt,Ft,fe,Ft+Ot,fe+Mt,j.DEPTH_BUFFER_BIT,j.NEAREST)}Rt.bindFramebuffer(j.READ_FRAMEBUFFER,null),Rt.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(it!==0||k.isRenderTargetTexture||Yt.has(k)){let _e=Yt.get(k),rn=Yt.get(J);Rt.bindFramebuffer(j.READ_FRAMEBUFFER,K),Rt.bindFramebuffer(j.DRAW_FRAMEBUFFER,G);for(let qn=0;qn<Nt;qn++){if(Ci)j.framebufferTextureLayer(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,_e.__webglTexture,it,de+qn);else j.framebufferTexture2D(j.READ_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,_e.__webglTexture,it);if(Ki)j.framebufferTextureLayer(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,rn.__webglTexture,Tt,He+qn);else j.framebufferTexture2D(j.DRAW_FRAMEBUFFER,j.COLOR_ATTACHMENT0,j.TEXTURE_2D,rn.__webglTexture,Tt);if(it!==0)j.blitFramebuffer(kt,ne,kt+Ot,ne+Mt,Ft,fe,Ft+Ot,fe+Mt,j.COLOR_BUFFER_BIT,j.NEAREST);else if(Ki)j.copyTexSubImage3D(Bt,Tt,Ft,fe,He+qn,kt,ne,Ot,Mt);else j.copyTexSubImage2D(Bt,Tt,Ft,fe,kt,ne,Ot,Mt)}Rt.bindFramebuffer(j.READ_FRAMEBUFFER,null),Rt.bindFramebuffer(j.DRAW_FRAMEBUFFER,null)}else if(Ki)if(k.isDataTexture||k.isData3DTexture)j.texSubImage3D(Bt,Tt,Ft,fe,He,Ot,Mt,Nt,Pe,hn,Ue.data);else if(J.isCompressedArrayTexture)j.compressedTexSubImage3D(Bt,Tt,Ft,fe,He,Ot,Mt,Nt,Pe,Ue.data);else j.texSubImage3D(Bt,Tt,Ft,fe,He,Ot,Mt,Nt,Pe,hn,Ue);else if(k.isDataTexture)j.texSubImage2D(j.TEXTURE_2D,Tt,Ft,fe,Ot,Mt,Pe,hn,Ue.data);else if(k.isCompressedTexture)j.compressedTexSubImage2D(j.TEXTURE_2D,Tt,Ft,fe,Ue.width,Ue.height,Pe,Ue.data);else j.texSubImage2D(j.TEXTURE_2D,Tt,Ft,fe,Ot,Mt,Pe,hn,Ue);if(Rt.pixelStorei(j.UNPACK_ROW_LENGTH,bn),Rt.pixelStorei(j.UNPACK_IMAGE_HEIGHT,ve),Rt.pixelStorei(j.UNPACK_SKIP_PIXELS,$i),Rt.pixelStorei(j.UNPACK_SKIP_ROWS,un),Rt.pixelStorei(j.UNPACK_SKIP_IMAGES,vo),Tt===0&&J.generateMipmaps===!0&&J.mipmapsAutoUpdate===!0)j.generateMipmap(Bt);Rt.unbindTexture()},this.initRenderTarget=function(k){if(Yt.get(k).__webglFramebuffer===void 0)ee.setupRenderTarget(k)},this.initTexture=function(k){if(k.isCubeTexture)ee.setTextureCube(k,0);else if(k.isData3DTexture)ee.setTexture3D(k,0);else if(k.isDataArrayTexture||k.isCompressedArrayTexture)ee.setTexture2DArray(k,0);else ee.setTexture2D(k,0);Rt.unbindTexture()},this.resetState=function(){Q=0,st=0,tt=null,Rt.reset(),vt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return hh}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(p){this._outputColorSpace=p;let m=this.getContext();m.drawingBufferColorSpace=he._getDrawingBufferColorSpace(p),m.unpackColorSpace=he._getUnpackColorSpace()}}class Gh extends Ea{constructor(p){super(p)}parse(p,m){let g={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},_=542327876,x=131072,y=512,v=1024,b=2048,S=4096,M=8192,T=16384,w=32768,E=95,A=96;function P(Ut){return Ut.charCodeAt(0)+(Ut.charCodeAt(1)<<8)+(Ut.charCodeAt(2)<<16)+(Ut.charCodeAt(3)<<24)}function D(Ut){return String.fromCharCode(Ut&255,Ut>>8&255,Ut>>16&255,Ut>>24&255)}function R(Ut,Zt,qt,pe){let me=qt*pe*4,ye=new Uint8Array(Ut,Zt,me),Te=new Uint8Array(me),oe=0,gt=0;for(let ae=0;ae<pe;ae++)for(let ce=0;ce<qt;ce++){let ze=ye[gt];gt++;let j=ye[gt];gt++;let vn=ye[gt];gt++;let Me=ye[gt];gt++,Te[oe]=vn,oe++,Te[oe]=j,oe++,Te[oe]=ze,oe++,Te[oe]=Me,oe++}return Te}function C(Ut,Zt,qt,pe){let me=qt*pe*3,ye=new Uint8Array(Ut,Zt,me),Te=new Uint8Array(qt*pe*4),oe=0,gt=0;for(let ae=0;ae<pe;ae++)for(let ce=0;ce<qt;ce++){let ze=ye[gt];gt++;let j=ye[gt];gt++;let vn=ye[gt];gt++,Te[oe]=vn,oe++,Te[oe]=j,oe++,Te[oe]=ze,oe++,Te[oe]=255,oe++}return Te}let I=P("DXT1"),U=P("DXT3"),N=P("DXT5"),F=P("ETC1"),z=P("DX10"),L=31,O=5,V=0,Y=1,H=2,W=3,K=4,G=7,Q=21,st=22,tt=23,mt=24,rt=25,ht=26,xt=28,At=0,at=new Int32Array(p,0,L);if(at[V]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),g;let pt,Pt=at[Q],zt=!1,Ht=!1,Dt=at[Y]+4;switch(Pt){case I:pt=8,g.format=Js;break;case U:pt=16,g.format=js;break;case N:pt=16,g.format=Qs;break;case F:pt=8,g.format=Gr;break;case z:Dt+=O*4;let Zt=new Int32Array(p,(L+1)*4,O)[At];switch(Zt){case 96:{pt=16,g.format=Vr;break}case 95:{pt=16,g.format=Wr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",Zt),g}break;default:if(at[st]===32&&at[tt]&16711680&&at[mt]&65280&&at[rt]&255&&at[ht]&4278190080)zt=!0,pt=64,g.format=zn;else if(at[st]===24&&at[tt]&16711680&&at[mt]&65280&&at[rt]&255)Ht=!0,pt=64,g.format=zn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",D(Pt)),g}if(g.mipmapCount=1,at[H]&131072&&m!==!1)g.mipmapCount=Math.max(1,at[G]);let Qt=at[xt];if(g.isCubemap=Qt&512?!0:!1,g.isCubemap&&(!(Qt&1024)||!(Qt&2048)||!(Qt&4096)||!(Qt&8192)||!(Qt&16384)||!(Qt&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),g;g.width=at[K],g.height=at[W];let te=g.isCubemap?6:1;for(let Ut=0;Ut<te;Ut++){let{width:Zt,height:qt}=g;for(let pe=0;pe<g.mipmapCount;pe++){let me,ye;if(zt)me=R(p,Dt,Zt,qt),ye=me.length;else if(Ht)me=C(p,Dt,Zt,qt),ye=Zt*qt*3;else ye=Math.ceil(Zt/4)*Math.ceil(qt/4)*pt,me=new Uint8Array(p,Dt,ye);let Te={data:me,width:Zt,height:qt};g.mipmaps.push(Te),Dt+=ye,Zt=Math.max(Zt>>1,1),qt=Math.max(qt>>1,1)}}return g}}var am=0,lm=1,cm=2;var Vh=2;var Ba=1.25,Wh=1,sn=32,Re=8,ka=65535;var nr=Math.pow(2,-24),ro=Symbol("SKIP_GENERATION"),za={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[ro]:!1};function Le(p,m,g){return g.min.x=m[p],g.min.y=m[p+1],g.min.z=m[p+2],g.max.x=m[p+3],g.max.y=m[p+4],g.max.z=m[p+5],g}function oo(p){let m=-1,g=-1/0;for(let _=0;_<3;_++){let x=p[_+3]-p[_];if(x>g)g=x,m=_}return m}function Xh(p,m,g){for(let _=0;_<3;_++){let x=m[p+2*_],y=m[p+2*_+1],v=x-y,b=x+y;if(v<g[_])g[_]=v;if(b>g[_+3])g[_+3]=b}}function Ha(p){let m=p[3]-p[0],g=p[4]-p[1],_=p[5]-p[2];return 2*(m*g+g*_+_*m)}function ge(p,m){return m[p+15]===ka}function Ee(p,m){return m[p+6]}function Ce(p,m){return m[p+14]}function be(p){return p+Re}function Se(p,m){let g=m[p+6];return p+g*Re}function ir(p,m){return m[p+7]}function Oe(p){return p}function Ga(p,m,g,_,x){let y=1/0,v=1/0,b=1/0,S=-1/0,M=-1/0,T=-1/0,w=1/0,E=1/0,A=1/0,P=-1/0,D=-1/0,R=-1/0,C=p.offset||0;for(let I=(m-C)*6,U=(m+g-C)*6;I<U;I+=6){let N=p[I+0],F=p[I+1],z=N-F,L=N+F;if(z<y)y=z;if(L>S)S=L;if(N<w)w=N;if(N>P)P=N;let O=p[I+2],V=p[I+3],Y=O-V,H=O+V;if(Y<v)v=Y;if(H>M)M=H;if(O<E)E=O;if(O>D)D=O;let W=p[I+4],K=p[I+5],G=W-K,Q=W+K;if(G<b)b=G;if(Q>T)T=Q;if(W<A)A=W;if(W>R)R=W}_[0]=y,_[1]=v,_[2]=b,_[3]=S,_[4]=M,_[5]=T,x[0]=w,x[1]=E,x[2]=A,x[3]=P,x[4]=D,x[5]=R}var ci=8,Yh=8,qh=new Int32Array(ci),li=new Float32Array(ci*6),sr=new Float32Array(ci*6),jn=new Float32Array(6),Va=new Float32Array(6),Wi=new Int32Array(Yh),hm=new Float32Array(Yh*6);function Qb(p,m,g,_){for(let x=0;x<3;x++){let y=m[p+2*x],v=m[p+2*x+1],b=y-v,S=y+v;if(b<g[_+x])g[_+x]=b;if(S>g[_+x+3])g[_+x+3]=S}}function um(p,m){let g=p[m+3]-p[m],_=p[m+4]-p[m+1],x=p[m+5]-p[m+2];return 2*(g*_+_*x+x*g)}function dm(p,m,g,_,x,y){let v=-1,b=0;if(y===am){if(v=oo(m),v!==-1)b=(m[v]+m[v+3])/2}else if(y===lm){if(v=oo(p),v!==-1)b=tS(g,_,x,v)}else if(y===cm){let S=Ha(p),M=Ba*x,T=g.offset||0,w=(_-T)*6,E=(_+x-T)*6;for(let A=0;A<3;A++){let P=m[A],C=(m[A+3]-P)/ci;if(x<Yh){for(let I=0;I<x;I++){let U=w+I*6,N=g[U+2*A],F=I;while(F>0&&g[Wi[F-1]+2*A]>N)Wi[F]=Wi[F-1],F--;Wi[F]=U}for(let I=0;I<3;I++)jn[I]=1/0,jn[I+3]=-1/0,Va[I]=1/0,Va[I+3]=-1/0;for(let I=x-1;I>=0;I--)Xh(Wi[I],g,Va),hm.set(Va,I*6);for(let I=0;I<x-1;I++){Xh(Wi[I],g,jn);let U=g[Wi[I+1]+2*A];if(g[Wi[I]+2*A]===U)continue;let N=I+1,F=x-N,z=Ha(jn)/S,L=um(hm,N*6)/S,O=Wh+Ba*(z*N+L*F);if(O<M)v=A,M=O,b=U}}else{for(let N=0;N<ci;N++){qh[N]=0;for(let F=0;F<3;F++)li[N*6+F]=1/0,li[N*6+F+3]=-1/0}for(let N=w;N<E;N+=6){let L=~~((g[N+2*A]-P)/C);if(L>=ci)L=ci-1;qh[L]++,Qb(N,g,li,L*6)}let I=(ci-1)*6;for(let N=0;N<6;N++)sr[I+N]=li[I+N];for(let N=ci-2;N>=0;N--){let F=N*6,z=F+6;for(let L=0;L<3;L++)sr[F+L]=Math.min(li[F+L],sr[z+L]),sr[F+L+3]=Math.max(li[F+L+3],sr[z+L+3])}let U=0;for(let N=0;N<ci-1;N++){let F=N*6,z=qh[N];if(z!==0)for(let H=0;H<3;H++)if(U===0)jn[H]=li[F+H],jn[H+3]=li[F+H+3];else jn[H]=Math.min(jn[H],li[F+H]),jn[H+3]=Math.max(jn[H+3],li[F+H+3]);U+=z;let L=0,O=0;if(U!==0)L=Ha(jn)/S;let V=x-U;if(V!==0)O=um(sr,F+6)/S;let Y=Wh+Ba*(L*U+O*V);if(Y<M)v=A,M=Y,b=P+C+N*C}}}}else console.warn(`BVH: Invalid build strategy value ${y} used.`);return{axis:v,pos:b}}function tS(p,m,g,_){let x=0,y=p.offset;for(let v=m,b=m+g;v<b;v++)x+=p[(v-y)*6+_*2];return x/g}function fm(p,m,g,_,x,y){let v=_,b=_+x-1,S=y.pos,M=y.axis*2,T=g.offset||0;while(!0){while(v<=b&&g[(v-T)*6+M]<S)v++;while(v<=b&&g[(b-T)*6+M]>=S)b--;if(v<b){for(let w=0;w<m;w++){let E=p[v*m+w];p[v*m+w]=p[b*m+w],p[b*m+w]=E}for(let w=0;w<6;w++){let E=v-T,A=b-T,P=g[E*6+w];g[E*6+w]=g[A*6+w],g[A*6+w]=P}v++,b--}else return v}}var eS=Math.pow(2,32),rr=new Float32Array(6),Wa=new Float32Array(6);function nS(p,m,g,_,x,y){let{maxDepth:v,verbose:b,targetLeafSize:S,_strictLeafSize:M=1/0,strategy:T,onProgress:w,useSharedArrayBuffer:E=!1}=x,{primitiveBuffer:A,primitiveBufferStride:P}=p,R=new(E?SharedArrayBuffer:ArrayBuffer)(sn*Math.max(1,2*Math.ceil(_)-1)),C=new Float32Array(R),I=new Uint32Array(R),U=new Uint16Array(R),N=0,F=!1;return Ga(m,g,_,rr,Wa),O(g,_,0),R.slice(0,N*sn);function z(V){if(w)w((V-y.offset)/y.count)}function L(V,Y,H){let W=V*2;I[V+6]=Y,U[W+14]=H,U[W+15]=ka,z(Y+H)}function O(V,Y,H){let W=N++,K=W*Re;if(C.set(rr,K),!F&&H>=v){if(F=!0,b)console.warn(`BVH: Max depth of ${v} reached when generating BVH. Consider increasing maxDepth.`)}let G=Y>M;if(Y<=S&&!G||H>=v){L(K,V,Y);return}let Q=dm(rr,Wa,m,V,Y,T),st=Q.axis===-1?-1:fm(A,P,m,V,Y,Q);if(Q.axis===-1||st===V||st===V+Y){if(!G){L(K,V,Y);return}Q.axis=Math.max(0,oo(rr)),st=V+Math.max(1,Math.floor(Y/2))}I[K+7]=Q.axis;let tt=st-V;Ga(m,V,tt,rr,Wa),O(V,tt,H+1);let mt=N-W;if(mt>eS)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");I[K+6]=mt;let rt=Y-tt;Ga(m,st,rt,rr,Wa),O(st,rt,H+1)}}function pm(p,m){let g=p.getRootRanges(m.range),_=g[0],x=g[g.length-1],y={offset:_.offset,count:x.offset+x.count-_.offset},v=new Float32Array(6*y.count);v.offset=y.offset,p.computePrimitiveBounds(y.offset,y.count,v),p._roots=g.map((b)=>nS(p,v,b.offset,b.count,m,y))}class ys{constructor(p){this._getNewPrimitive=p,this._primitives=[]}getPrimitive(){let p=this._primitives;if(p.length===0)return this._getNewPrimitive();else return p.pop()}releasePrimitive(p){this._primitives.push(p)}}class mm{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let p=[],m=null;this.setBuffer=(g)=>{if(m)p.push(m);m=g,this.float32Array=new Float32Array(g),this.uint16Array=new Uint16Array(g),this.uint32Array=new Uint32Array(g)},this.clearBuffer=()=>{if(m=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,p.length!==0)this.setBuffer(p.pop())}}}var ue=new mm;var Xi,ar,or=[],Xa=new ys(()=>new xe);function gm(p,m,g,_,x,y){Xi=Xa.getPrimitive(),ar=Xa.getPrimitive(),or.push(Xi,ar),ue.setBuffer(p._roots[m]);let v=Zh(0,p.geometry,g,_,x,y);ue.clearBuffer(),Xa.releasePrimitive(Xi),Xa.releasePrimitive(ar),or.pop(),or.pop();let b=or.length;if(b>0)ar=or[b-1],Xi=or[b-2];return v}function Zh(p,m,g,_,x=null,y=0,v=0){let{float32Array:b,uint16Array:S,uint32Array:M}=ue,T=p*2;if(ge(T,S)){let E=Ee(p,M),A=Ce(T,S);return Le(Oe(p),b,Xi),_(E,A,!1,v,y+p/Re,Xi)}else{let Y=function(W){let{uint16Array:K,uint32Array:G}=ue,Q=W*2;while(!ge(Q,K))W=be(W),Q=W*2;return Ee(W,G)},H=function(W){let{uint16Array:K,uint32Array:G}=ue,Q=W*2;while(!ge(Q,K))W=Se(W,G),Q=W*2;return Ee(W,G)+Ce(Q,K)},E=be(p),A=Se(p,M),P=E,D=A,R,C,I,U;if(x){if(I=Xi,U=ar,Le(Oe(P),b,I),Le(Oe(D),b,U),R=x(I),C=x(U),C<R){P=A,D=E;let W=R;R=C,C=W,I=U}}if(!I)I=Xi,Le(Oe(P),b,I);let N=ge(P*2,S),F=g(I,N,R,v+1,y+P/Re),z;if(F===Vh){let W=Y(P),G=H(P)-W;z=_(W,G,!0,v+1,y+P/Re,I)}else z=F&&Zh(P,m,g,_,x,y,v+1);if(z)return!0;U=ar,Le(Oe(D),b,U);let L=ge(D*2,S),O=g(U,L,C,v+1,y+D/Re),V;if(O===Vh){let W=Y(D),G=H(D)-W;V=_(W,G,!0,v+1,y+D/Re,U)}else V=O&&Zh(D,m,g,_,x,y,v+1);if(V)return!0;return!1}}var ao=new ue.constructor,qa=new ue.constructor,qi=new ys(()=>new xe),lr=new xe,cr=new xe,$h=new xe,Kh=new xe,Jh=!1;function _m(p,m,g,_){if(Jh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");Jh=!0;let x=p._roots,y=m._roots,v,b=0,S=0,M=new Jt().copy(g).invert();for(let T=0,w=x.length;T<w;T++){ao.setBuffer(x[T]),S=0;let E=qi.getPrimitive();Le(Oe(0),ao.float32Array,E),E.applyMatrix4(M);for(let A=0,P=y.length;A<P;A++)if(qa.setBuffer(y[A]),v=Qn(0,0,g,M,_,b,S,0,0,E),qa.clearBuffer(),S+=y[A].byteLength/sn,v)break;if(qi.releasePrimitive(E),ao.clearBuffer(),b+=x[T].byteLength/sn,v)break}return Jh=!1,v}function Qn(p,m,g,_,x,y=0,v=0,b=0,S=0,M=null,T=!1){let w,E;if(T)w=qa,E=ao;else w=ao,E=qa;let A=w.float32Array,P=w.uint32Array,D=w.uint16Array,R=E.float32Array,C=E.uint32Array,I=E.uint16Array,U=p*2,N=m*2,F=ge(U,D),z=ge(N,I),L=!1;if(z&&F)if(T)L=x(Ee(m,C),Ce(m*2,I),Ee(p,P),Ce(p*2,D),S,v+m/Re,b,y+p/Re);else L=x(Ee(p,P),Ce(p*2,D),Ee(m,C),Ce(m*2,I),b,y+p/Re,S,v+m/Re);else if(z){let O=qi.getPrimitive();Le(Oe(m),R,O),O.applyMatrix4(g);let V=be(p),Y=Se(p,P);Le(Oe(V),A,lr),Le(Oe(Y),A,cr);let H=O.intersectsBox(lr),W=O.intersectsBox(cr);L=H&&Qn(m,V,_,g,x,v,y,S,b+1,O,!T)||W&&Qn(m,Y,_,g,x,v,y,S,b+1,O,!T),qi.releasePrimitive(O)}else{let O=be(m),V=Se(m,C);Le(Oe(O),R,$h),Le(Oe(V),R,Kh);let Y=M.intersectsBox($h),H=M.intersectsBox(Kh);if(Y&&H)L=Qn(p,O,g,_,x,y,v,b,S+1,M,T)||Qn(p,V,g,_,x,y,v,b,S+1,M,T);else if(Y)if(F)L=Qn(p,O,g,_,x,y,v,b,S+1,M,T);else{let W=qi.getPrimitive();W.copy($h).applyMatrix4(g);let K=be(p),G=Se(p,P);Le(Oe(K),A,lr),Le(Oe(G),A,cr);let Q=W.intersectsBox(lr),st=W.intersectsBox(cr);L=Q&&Qn(O,K,_,g,x,v,y,S,b+1,W,!T)||st&&Qn(O,G,_,g,x,v,y,S,b+1,W,!T),qi.releasePrimitive(W)}else if(H)if(F)L=Qn(p,V,g,_,x,y,v,b,S+1,M,T);else{let W=qi.getPrimitive();W.copy(Kh).applyMatrix4(g);let K=be(p),G=Se(p,P);Le(Oe(K),A,lr),Le(Oe(G),A,cr);let Q=W.intersectsBox(lr),st=W.intersectsBox(cr);L=Q&&Qn(V,K,_,g,x,v,y,S,b+1,W,!T)||st&&Qn(V,G,_,g,x,v,y,S,b+1,W,!T),qi.releasePrimitive(W)}}return L}var Ya=new class{constructor(){let p=null,m=null,g=null,_=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(y,v)=>{if(_)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=v,this.buffer=p=y._roots[v],this.uint16Array=g=new Uint16Array(p),this.uint32Array=m=new Uint32Array(p)},this.reset=()=>{this.root=null,this.buffer=p=null,this.uint16Array=g=null,this.uint32Array=m=null},this.getRangeStart=(y)=>{let v=y*2;while(!ge(v,g))y=be(y),v=y*2;return Ee(y,m)},this.getRangeEnd=(y)=>{let v=y*2;while(!ge(v,g))y=Se(y,m),v=y*2;return Ee(y,m)+Ce(v,g)};let x=(y,v,b)=>{let S=v*2,M=ge(S,g);if(!y(b,M,v)&&!M){let w=be(v),E=Se(v,m);x(y,w,b+1),x(y,E,b+1)}};this.traverseBuffer=(y)=>{if(_)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");_=!0;try{x(y,0,0)}finally{_=!1}},this.traverse=(y)=>{this.traverseBuffer((v,b,S)=>{if(b){let M=S*2,T=m[S+6],w=g[M+14];return y(v,b,new Float32Array(p,S*4,6),T,w)}else{let M=ir(S,m);return y(v,b,new Float32Array(p,S*4,6),M)}})}}};var xm=new xe,hr=new Float32Array(6);class jh{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(p){if(p={...za,...p},"maxLeafSize"in p)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),p={...p,targetLeafSize:p.maxLeafSize};pm(this,p)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(p,m,g,_){let x=1/0,y=1/0,v=1/0,b=-1/0,S=-1/0,M=-1/0;for(let T=p,w=p+m;T<w;T++){this.writePrimitiveBounds(T,hr,0);let[E,A,P,D,R,C]=hr;if(E<x)x=E;if(D>b)b=D;if(A<y)y=A;if(R>S)S=R;if(P<v)v=P;if(C>M)M=C}return g[_+0]=x,g[_+1]=y,g[_+2]=v,g[_+3]=b,g[_+4]=S,g[_+5]=M,g}computePrimitiveBounds(p,m,g){let _=g.offset||0;for(let x=p,y=p+m;x<y;x++){this.writePrimitiveBounds(x,hr,0);let[v,b,S,M,T,w]=hr,E=(v+M)/2,A=(b+T)/2,P=(S+w)/2,D=(M-v)/2,R=(T-b)/2,C=(w-S)/2,I=(x-_)*6;g[I+0]=E,g[I+1]=D+(Math.abs(E)+D)*nr,g[I+2]=A,g[I+3]=R+(Math.abs(A)+R)*nr,g[I+4]=P,g[I+5]=C+(Math.abs(P)+C)*nr}return g}shiftPrimitiveOffsets(p){let m=this._indirectBuffer;if(m)for(let g=0,_=m.length;g<_;g++)m[g]+=p;else{let g=this._roots;for(let _=0;_<g.length;_++){let x=g[_],y=new Uint32Array(x),v=new Uint16Array(x),b=x.byteLength/sn;for(let S=0;S<b;S++){let M=Re*S,T=2*M;if(ge(T,v))y[M+6]+=p}}}}traverse(p,m=0){Ya.setBVH(this,m),Ya.traverse(p),Ya.reset()}refit(){let p=this._roots;for(let m=0,g=p.length;m<g;m++){let _=p[m],x=new Uint32Array(_),y=new Uint16Array(_),v=new Float32Array(_),b=_.byteLength/sn;for(let S=b-1;S>=0;S--){let M=S*Re,T=M*2;if(ge(T,y)){let E=Ee(M,x),A=Ce(T,y);this.writePrimitiveRangeBounds(E,A,hr,0),v.set(hr,M)}else{let E=be(M),A=Se(M,x);for(let P=0;P<3;P++){let D=v[E+P],R=v[E+P+3],C=v[A+P],I=v[A+P+3];v[M+P]=D<C?D:C,v[M+P+3]=R>I?R:I}}}}}getBoundingBox(p){return p.makeEmpty(),this._roots.forEach((g)=>{Le(0,new Float32Array(g),xm),p.union(xm)}),p}shapecast(p){let{boundsTraverseOrder:m,intersectsBounds:g,intersectsRange:_,intersectsPrimitive:x,scratchPrimitive:y,iterate:v}=p;if(_&&x){let T=_;_=(w,E,A,P,D)=>{if(!T(w,E,A,P,D))return v(w,E,this,x,A,P,y);return!0}}else if(!_)if(x)_=(T,w,E,A)=>v(T,w,this,x,E,A,y);else _=(T,w,E)=>E;let b=!1,S=0,M=this._roots;for(let T=0,w=M.length;T<w;T++){let E=M[T];if(b=gm(this,T,g,_,m,S),b)break;S+=E.byteLength/sn}return b}bvhcast(p,m,g){let{intersectsRanges:_}=g;return _m(this,p,m,_)}}function ym(){return typeof SharedArrayBuffer<"u"}function Qh(p){return p.index?p.index.count:p.attributes.position.count}function Yi(p){return Qh(p)/3}function iS(p,m=ArrayBuffer){if(p>65535)return new Uint32Array(new m(4*p));else return new Uint16Array(new m(2*p))}function vm(p,m){if(!p.index){let g=p.attributes.position.count,_=m.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,x=iS(g,_);p.setIndex(new Xe(x,1));for(let y=0;y<g;y++)x[y]=y}}function sS(p,m,g){let _=Qh(p)/g,x=m?m:p.drawRange,y=x.start/g,v=(x.start+x.count)/g,b=Math.max(0,y),S=Math.min(_,v)-b;return{offset:Math.floor(b),count:Math.floor(S)}}function rS(p,m){return p.groups.map((g)=>({offset:g.start/m,count:g.count/m}))}function tu(p,m,g){let _=sS(p,m,g),x=rS(p,g);if(!x.length)return[_];let y=[],v=_.offset,b=_.offset+_.count,S=Qh(p)/g,M=[];for(let E of x){let{offset:A,count:P}=E,D=A,R=isFinite(P)?P:S-A,C=A+R;if(D<b&&C>v)M.push({pos:Math.max(v,D),isStart:!0}),M.push({pos:Math.min(b,C),isStart:!1})}M.sort((E,A)=>{if(E.pos!==A.pos)return E.pos-A.pos;else return E.type==="end"?-1:1});let T=0,w=null;for(let E of M){let A=E.pos;if(T!==0&&A!==w)y.push({offset:w,count:A-w});T+=E.isStart?1:-1,w=A}return y}function oS(p,m){let g=p[p.length-1],_=g.offset+g.count>65536,x=p.reduce((M,T)=>M+T.count,0),y=_?4:2,v=m?new SharedArrayBuffer(x*y):new ArrayBuffer(x*y),b=_?new Uint32Array(v):new Uint16Array(v),S=0;for(let M=0;M<p.length;M++){let{offset:T,count:w}=p[M];for(let E=0;E<w;E++)b[S+E]=T+E;S+=w}return b}class eu extends jh{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(p){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(p){}constructor(p,m={}){if(!p.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(p.index&&p.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(m.useSharedArrayBuffer&&!ym())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=p,this.resolvePrimitiveIndex=m.indirect?(g)=>this._indirectBuffer[g]:(g)=>g,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,m={...za,...m},!m[ro])this.init(m)}init(p){let{geometry:m,primitiveStride:g}=this;if(p.indirect){let _=tu(m,p.range,g),x=oS(_,p.useSharedArrayBuffer);this._indirectBuffer=x}else vm(m,p);if(super.init(p),!m.boundingBox&&p.setBoundingBox)m.boundingBox=this.getBoundingBox(new xe)}getRootRanges(p){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return tu(this.geometry,p,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class Nn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(p,m){let g=1/0,_=-1/0;for(let x=0,y=p.length;x<y;x++){let b=p[x][m];g=b<g?b:g,_=b>_?b:_}this.min=g,this.max=_}setFromPoints(p,m){let g=1/0,_=-1/0;for(let x=0,y=m.length;x<y;x++){let v=m[x],b=p.dot(v);g=b<g?b:g,_=b>_?b:_}this.min=g,this.max=_}isSeparated(p){return this.min>p.max||p.min>this.max}}Nn.prototype.setFromBox=function(){let p=new q;return function(g,_){let{min:x,max:y}=_,v=1/0,b=-1/0;for(let S=0;S<=1;S++)for(let M=0;M<=1;M++)for(let T=0;T<=1;T++){p.x=x.x*S+y.x*(1-S),p.y=x.y*M+y.y*(1-M),p.z=x.z*T+y.z*(1-T);let w=g.dot(p);v=Math.min(w,v),b=Math.max(w,b)}this.min=v,this.max=b}}();var XR=function(){let p=new Nn;return function(g,_){let{points:x,satAxes:y,satBounds:v}=g,{points:b,satAxes:S,satBounds:M}=_;for(let T=0;T<3;T++){let w=v[T],E=y[T];if(p.setFromPoints(E,b),w.isSeparated(p))return!1}for(let T=0;T<3;T++){let w=M[T],E=S[T];if(p.setFromPoints(E,x),w.isSeparated(p))return!1}}}();var aS=function(){let p=new q,m=new q,g=new q;return function(x,y,v){let b=x.start,S=p,M=y.start,T=m;g.subVectors(b,M),p.subVectors(x.end,x.start),m.subVectors(y.end,y.start);let w=g.dot(T),E=T.dot(S),A=T.dot(T),P=g.dot(S),R=S.dot(S)*A-E*E,C,I;if(R!==0)C=(w*E-P*A)/R;else C=0;I=(w+C*E)/A,v.x=C,v.y=I}}(),lo=function(){let p=new Kt,m=new q,g=new q;return function(x,y,v,b){aS(x,y,p);let{x:S,y:M}=p;if(S>=0&&S<=1&&M>=0&&M<=1){x.at(S,v),y.at(M,b);return}else if(S>=0&&S<=1){if(M<0)y.at(0,b);else y.at(1,b);x.closestPointToPoint(b,!0,v);return}else if(M>=0&&M<=1){if(S<0)x.at(0,v);else x.at(1,v);y.closestPointToPoint(v,!0,b);return}else{let T;if(S<0)T=x.start;else T=x.end;let w;if(M<0)w=y.start;else w=y.end;let E=m,A=g;if(x.closestPointToPoint(w,!0,m),y.closestPointToPoint(T,!0,g),E.distanceToSquared(w)<=A.distanceToSquared(T)){v.copy(E),b.copy(w);return}else{v.copy(T),b.copy(A);return}}}}(),bm=function(){let p=new q,m=new q,g=new on,_=new Cn;return function(y,v){let{radius:b,center:S}=y,{a:M,b:T,c:w}=v;if(_.start=M,_.end=T,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;if(_.start=M,_.end=w,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;if(_.start=T,_.end=w,_.closestPointToPoint(S,!0,p).distanceTo(S)<=b)return!0;let D=v.getPlane(g);if(Math.abs(D.distanceToPoint(S))<=b){let C=D.projectPoint(S,m);if(v.containsPoint(C))return!0}return!1}}();var lS=["x","y","z"],Ri=0.000000000000001,Sm=Ri*Ri;function Vn(p){return Math.abs(p)<Ri}class xn extends Ve{constructor(...p){super(...p);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new q),this.satBounds=[,,,,].fill().map(()=>new Nn),this.points=[this.a,this.b,this.c],this.plane=new on,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Cn,this.needsUpdate=!0}intersectsSphere(p){return bm(p,this)}update(){let p=this.a,m=this.b,g=this.c,_=this.points,x=this.satAxes,y=this.satBounds,v=x[0],b=y[0];this.getNormal(v),b.setFromPoints(v,_);let S=x[1],M=y[1];S.subVectors(p,m),M.setFromPoints(S,_);let T=x[2],w=y[2];T.subVectors(m,g),w.setFromPoints(T,_);let E=x[3],A=y[3];E.subVectors(g,p),A.setFromPoints(E,_);let P=S.length(),D=T.length(),R=E.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,P<Ri)if(D<Ri||R<Ri)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(p),this.degenerateSegment.end.copy(g);else if(D<Ri)if(R<Ri)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(p);else if(R<Ri)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(g),this.degenerateSegment.end.copy(m);this.plane.setFromNormalAndCoplanarPoint(v,p),this.needsUpdate=!1}}xn.prototype.closestPointToSegment=function(){let p=new q,m=new q,g=new Cn;return function(x,y=null,v=null){if(this.needsUpdate)this.update();let{start:b,end:S}=x,M=this.points,T,w=1/0,E=this.plane.distanceToPoint(b),A=this.plane.distanceToPoint(S);if(E*A<0&&this.plane.intersectLine(x,p)!==null&&this.containsPoint(p)){if(y)y.copy(p);if(v)v.copy(p);return 0}for(let P=0;P<3;P++){let D=(P+1)%3;if(g.start.copy(M[P]),g.end.copy(M[D]),lo(g,x,p,m),T=p.distanceToSquared(m),T<w){if(w=T,y)y.copy(p);if(v)v.copy(m)}}if(this.closestPointToPoint(b,p),T=b.distanceToSquared(p),T<w){if(w=T,y)y.copy(p);if(v)v.copy(b)}if(this.closestPointToPoint(S,p),T=S.distanceToSquared(p),T<w){if(w=T,y)y.copy(p);if(v)v.copy(S)}return Math.sqrt(w)}}();xn.prototype.intersectsTriangle=function(){let p=new xn,m=new Nn,g=new Nn,_=new q,x=new q,y=new q,v=new q,b=new Cn,S=new Cn,M=new q,T=new Kt,w=new Kt;function E(U,N,F,z){let L=_;if(!U.isDegenerateIntoPoint&&!U.isDegenerateIntoSegment)L.copy(U.plane.normal);else L.copy(N.plane.normal);let{satBounds:O,satAxes:V}=U;for(let W=1;W<4;W++){let K=O[W],G=V[W];if(m.setFromPoints(G,N.points),K.isSeparated(m))return!1;if(v.copy(L).cross(G),m.setFromPoints(v,U.points),g.setFromPoints(v,N.points),m.isSeparated(g))return!1}let{satBounds:Y,satAxes:H}=N;for(let W=1;W<4;W++){let K=Y[W],G=H[W];if(m.setFromPoints(G,U.points),K.isSeparated(m))return!1;if(v.crossVectors(L,G),m.setFromPoints(v,U.points),g.setFromPoints(v,N.points),m.isSeparated(g))return!1}if(F){if(!z)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");F.start.set(0,0,0),F.end.set(0,0,0)}return!0}function A(U,N,F,z,L,O,V,Y,H,W,K){let G=V/(V-Y);W.x=z+(L-z)*G,K.start.subVectors(N,U).multiplyScalar(G).add(U),G=V/(V-H),W.y=z+(O-z)*G,K.end.subVectors(F,U).multiplyScalar(G).add(U)}function P(U,N,F,z,L,O,V,Y,H,W,K){if(L>0)A(U.c,U.a,U.b,z,N,F,H,V,Y,W,K);else if(O>0)A(U.b,U.a,U.c,F,N,z,Y,V,H,W,K);else if(Y*H>0||V!=0)A(U.a,U.b,U.c,N,F,z,V,Y,H,W,K);else if(Y!=0)A(U.b,U.a,U.c,F,N,z,Y,V,H,W,K);else if(H!=0)A(U.c,U.a,U.b,z,N,F,H,V,Y,W,K);else return!0;return!1}function D(U,N,F,z){let L=N.degenerateSegment,O=U.plane.distanceToPoint(L.start),V=U.plane.distanceToPoint(L.end);if(Vn(O))if(Vn(V))return E(U,N,F,z);else{if(F)F.start.copy(L.start),F.end.copy(L.start);return U.containsPoint(L.start)}else if(Vn(V)){if(F)F.start.copy(L.end),F.end.copy(L.end);return U.containsPoint(L.end)}else if(U.plane.intersectLine(L,_)!=null){if(F)F.start.copy(_),F.end.copy(_);return U.containsPoint(_)}else return!1}function R(U,N,F){let z=N.a;if(Vn(U.plane.distanceToPoint(z))&&U.containsPoint(z)){if(F)F.start.copy(z),F.end.copy(z);return!0}else return!1}function C(U,N,F){let z=U.degenerateSegment,L=N.a;if(z.closestPointToPoint(L,!0,_),L.distanceToSquared(_)<Sm){if(F)F.start.copy(L),F.end.copy(L);return!0}else return!1}function I(U,N,F,z){if(U.isDegenerateIntoSegment)if(N.isDegenerateIntoSegment){let L=U.degenerateSegment,O=N.degenerateSegment,V=x,Y=y;L.delta(V),O.delta(Y);let H=_.subVectors(O.start,L.start),W=V.x*Y.y-V.y*Y.x;if(Vn(W))return!1;let K=(H.x*Y.y-H.y*Y.x)/W,G=-(V.x*H.y-V.y*H.x)/W;if(K<0||K>1||G<0||G>1)return!1;let Q=L.start.z+V.z*K,st=O.start.z+Y.z*G;if(Vn(Q-st)){if(F)F.start.copy(L.start).addScaledVector(V,K),F.end.copy(L.start).addScaledVector(V,K);return!0}else return!1}else if(N.isDegenerateIntoPoint)return C(U,N,F);else return D(N,U,F,z);else if(U.isDegenerateIntoPoint)if(N.isDegenerateIntoPoint)if(N.a.distanceToSquared(U.a)<Sm){if(F)F.start.copy(U.a),F.end.copy(U.a);return!0}else return!1;else if(N.isDegenerateIntoSegment)return C(N,U,F);else return R(N,U,F);else if(N.isDegenerateIntoPoint)return R(U,N,F);else if(N.isDegenerateIntoSegment)return D(U,N,F,z)}return function(N,F=null,z=!1){if(this.needsUpdate)this.update();if(!N.isExtendedTriangle)p.copy(N),p.update(),N=p;else if(N.needsUpdate)N.update();let L=I(this,N,F,z);if(L!==void 0)return L;let O=this.plane,V=N.plane,Y=V.distanceToPoint(this.a),H=V.distanceToPoint(this.b),W=V.distanceToPoint(this.c);if(Vn(Y))Y=0;if(Vn(H))H=0;if(Vn(W))W=0;let K=Y*H,G=Y*W;if(K>0&&G>0)return!1;let Q=O.distanceToPoint(N.a),st=O.distanceToPoint(N.b),tt=O.distanceToPoint(N.c);if(Vn(Q))Q=0;if(Vn(st))st=0;if(Vn(tt))tt=0;let mt=Q*st,rt=Q*tt;if(mt>0&&rt>0)return!1;x.copy(O.normal),y.copy(V.normal);let ht=x.cross(y),xt=0,At=Math.abs(ht.x),at=Math.abs(ht.y);if(at>At)At=at,xt=1;if(Math.abs(ht.z)>At)xt=2;let Pt=lS[xt],zt=this.a[Pt],Ht=this.b[Pt],Dt=this.c[Pt],Qt=N.a[Pt],te=N.b[Pt],Ut=N.c[Pt];if(P(this,zt,Ht,Dt,K,G,Y,H,W,T,b))return E(this,N,F,z);if(P(N,Qt,te,Ut,mt,rt,Q,st,tt,w,S))return E(this,N,F,z);if(T.y<T.x){let Zt=T.y;T.y=T.x,T.x=Zt,M.copy(b.start),b.start.copy(b.end),b.end.copy(M)}if(w.y<w.x){let Zt=w.y;w.y=w.x,w.x=Zt,M.copy(S.start),S.start.copy(S.end),S.end.copy(M)}if(T.y<w.x||w.y<T.x)return!1;if(F){if(w.x>T.x)F.start.copy(S.start);else F.start.copy(b.start);if(w.y<T.y)F.end.copy(S.end);else F.end.copy(b.end)}return!0}}();xn.prototype.distanceToPoint=function(){let p=new q;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();xn.prototype.distanceToTriangle=function(){let p=new q,m=new q,g=["a","b","c"],_=new Cn,x=new Cn;return function(v,b=null,S=null){let M=b||S?_:null;if(this.intersectsTriangle(v,M,!0)){if(b||S){if(b)M.getCenter(b);if(S)M.getCenter(S)}return 0}let T=1/0;for(let w=0;w<3;w++){let E,A=g[w],P=v[A];if(this.closestPointToPoint(P,p),E=P.distanceToSquared(p),E<T){if(T=E,b)b.copy(p);if(S)S.copy(P)}let D=this[A];if(v.closestPointToPoint(D,p),E=D.distanceToSquared(p),E<T){if(T=E,b)b.copy(D);if(S)S.copy(p)}}for(let w=0;w<3;w++){let E=g[w],A=g[(w+1)%3];_.set(this[E],this[A]);for(let P=0;P<3;P++){let D=g[P],R=g[(P+1)%3];x.set(v[D],v[R]),lo(_,x,p,m);let C=p.distanceToSquared(m);if(C<T){if(T=C,b)b.copy(p);if(S)S.copy(m)}}}return Math.sqrt(T)}}();class ke{constructor(p,m,g){if(this.isOrientedBox=!0,this.min=new q,this.max=new q,this.matrix=new Jt,this.invMatrix=new Jt,this.points=[,,,,,,,,].fill().map(()=>new q),this.satAxes=[,,,].fill().map(()=>new q),this.satBounds=[,,,].fill().map(()=>new Nn),this.alignedSatBounds=[,,,].fill().map(()=>new Nn),this.needsUpdate=!1,p)this.min.copy(p);if(m)this.max.copy(m);if(g)this.matrix.copy(g)}set(p,m,g){this.min.copy(p),this.max.copy(m),this.matrix.copy(g),this.needsUpdate=!0}copy(p){this.min.copy(p.min),this.max.copy(p.max),this.matrix.copy(p.matrix),this.needsUpdate=!0}}ke.prototype.update=function(){return function(){let m=this.matrix,g=this.min,_=this.max,x=this.points;for(let M=0;M<=1;M++)for(let T=0;T<=1;T++)for(let w=0;w<=1;w++){let E=1*M|2*T|4*w,A=x[E];A.x=M?_.x:g.x,A.y=T?_.y:g.y,A.z=w?_.z:g.z,A.applyMatrix4(m)}let y=this.satBounds,v=this.satAxes,b=x[0];for(let M=0;M<3;M++){let T=v[M],w=y[M],E=1<<M,A=x[E];T.subVectors(b,A),w.setFromPoints(T,x)}let S=this.alignedSatBounds;S[0].setFromPointsField(x,"x"),S[1].setFromPointsField(x,"y"),S[2].setFromPointsField(x,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();ke.prototype.intersectsBox=function(){let p=new Nn;return function(g){if(this.needsUpdate)this.update();let{min:_,max:x}=g,y=this.satBounds,v=this.satAxes,b=this.alignedSatBounds;if(p.min=_.x,p.max=x.x,b[0].isSeparated(p))return!1;if(p.min=_.y,p.max=x.y,b[1].isSeparated(p))return!1;if(p.min=_.z,p.max=x.z,b[2].isSeparated(p))return!1;for(let S=0;S<3;S++){let M=v[S],T=y[S];if(p.setFromBox(M,g),T.isSeparated(p))return!1}return!0}}();ke.prototype.intersectsTriangle=function(){let p=new xn,m=[,,,],g=new Nn,_=new Nn,x=new q;return function(v){if(this.needsUpdate)this.update();if(!v.isExtendedTriangle)p.copy(v),p.update(),v=p;else if(v.needsUpdate)v.update();let b=this.satBounds,S=this.satAxes;m[0]=v.a,m[1]=v.b,m[2]=v.c;for(let E=0;E<3;E++){let A=b[E],P=S[E];if(g.setFromPoints(P,m),A.isSeparated(g))return!1}let M=v.satBounds,T=v.satAxes,w=this.points;for(let E=0;E<3;E++){let A=M[E],P=T[E];if(g.setFromPoints(P,w),A.isSeparated(g))return!1}for(let E=0;E<3;E++){let A=S[E];for(let P=0;P<4;P++){let D=T[P];if(x.crossVectors(A,D),g.setFromPoints(x,m),_.setFromPoints(x,w),g.isSeparated(_))return!1}}return!0}}();ke.prototype.closestPointToPoint=function(){return function(m,g){if(this.needsUpdate)this.update();return g.copy(m).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),g}}();ke.prototype.distanceToPoint=function(){let p=new q;return function(g){return this.closestPointToPoint(g,p),g.distanceTo(p)}}();ke.prototype.distanceToBox=function(){let p=["x","y","z"],m=Array(12).fill().map(()=>new Cn),g=Array(12).fill().map(()=>new Cn),_=new q,x=new q;return function(v,b=0,S=null,M=null){if(this.needsUpdate)this.update();if(this.intersectsBox(v)){if(S||M){if(v.getCenter(x),this.closestPointToPoint(x,_),v.closestPointToPoint(_,x),S)S.copy(_);if(M)M.copy(x)}return 0}let T=b*b,{min:w,max:E}=v,A=this.points,P=1/0;for(let R=0;R<8;R++){let C=A[R];x.copy(C).clamp(w,E);let I=C.distanceToSquared(x);if(I<P){if(P=I,S)S.copy(C);if(M)M.copy(x);if(I<T)return Math.sqrt(I)}}let D=0;for(let R=0;R<3;R++)for(let C=0;C<=1;C++)for(let I=0;I<=1;I++){let U=(R+1)%3,N=(R+2)%3,F=C<<U|I<<N,z=1<<R|C<<U|I<<N,L=A[F],O=A[z];m[D].set(L,O);let Y=p[R],H=p[U],W=p[N],K=g[D],{start:G,end:Q}=K;G[Y]=w[Y],G[H]=C?w[H]:E[H],G[W]=I?w[W]:E[W],Q[Y]=E[Y],Q[H]=C?w[H]:E[H],Q[W]=I?w[W]:E[W],D++}for(let R=0;R<=1;R++)for(let C=0;C<=1;C++)for(let I=0;I<=1;I++){x.x=R?E.x:w.x,x.y=C?E.y:w.y,x.z=I?E.z:w.z,this.closestPointToPoint(x,_);let U=x.distanceToSquared(_);if(U<P){if(P=U,S)S.copy(_);if(M)M.copy(x);if(U<T)return Math.sqrt(U)}}for(let R=0;R<12;R++){let C=m[R];for(let I=0;I<12;I++){let U=g[I];lo(C,U,_,x);let N=_.distanceToSquared(x);if(N<P){if(P=N,S)S.copy(_);if(M)M.copy(x);if(N<T)return Math.sqrt(N)}}}return Math.sqrt(P)}}();class Mm extends ys{constructor(){super(()=>new xn)}}var Tn=new Mm;var co=new q,nu=new q;function Em(p,m,g={},_=0,x=1/0){let y=_*_,v=x*x,b=1/0,S=null;if(p.shapecast({boundsTraverseOrder:(T)=>(co.copy(m).clamp(T.min,T.max),co.distanceToSquared(m)),intersectsBounds:(T,w,E)=>E<b&&E<v,intersectsTriangle:(T,w)=>{T.closestPointToPoint(m,co);let E=m.distanceToSquared(co);if(E<b)nu.copy(co),b=E,S=w;if(E<y)return!0;else return!1}}),b===1/0)return null;let M=Math.sqrt(b);if(!g.point)g.point=nu.clone();else g.point.copy(nu);return g.distance=M,g.faceIndex=S,g}var Za=parseInt(os)>=169,cS=parseInt(os)<=161,vs=new q,bs=new q,Ss=new q,$a=new Kt,Ka=new Kt,Ja=new Kt,Tm=new q,wm=new q,Am=new q,ho=new q;function hS(p,m,g,_,x,y,v,b){let S;if(y===gn)S=p.intersectTriangle(_,g,m,!0,x);else S=p.intersectTriangle(m,g,_,y!==kn,x);if(S===null)return null;let M=p.origin.distanceTo(x);if(M<v||M>b)return null;return{distance:M,point:x.clone()}}function Rm(p,m,g,_,x,y,v,b,S,M,T){vs.fromBufferAttribute(m,y),bs.fromBufferAttribute(m,v),Ss.fromBufferAttribute(m,b);let w=hS(p,vs,bs,Ss,ho,S,M,T);if(w){if(_){$a.fromBufferAttribute(_,y),Ka.fromBufferAttribute(_,v),Ja.fromBufferAttribute(_,b),w.uv=new Kt;let A=Ve.getInterpolation(ho,vs,bs,Ss,$a,Ka,Ja,w.uv);if(!Za)w.uv=A}if(x){$a.fromBufferAttribute(x,y),Ka.fromBufferAttribute(x,v),Ja.fromBufferAttribute(x,b),w.uv1=new Kt;let A=Ve.getInterpolation(ho,vs,bs,Ss,$a,Ka,Ja,w.uv1);if(!Za)w.uv1=A;if(cS)w.uv2=w.uv1}if(g){Tm.fromBufferAttribute(g,y),wm.fromBufferAttribute(g,v),Am.fromBufferAttribute(g,b),w.normal=new q;let A=Ve.getInterpolation(ho,vs,bs,Ss,Tm,wm,Am,w.normal);if(w.normal.dot(p.direction)>0)w.normal.multiplyScalar(-1);if(!Za)w.normal=A}let E={a:y,b:v,c:b,normal:new q,materialIndex:0};if(Ve.getNormal(vs,bs,Ss,E.normal),w.face=E,w.faceIndex=y,Za){let A=new q;Ve.getBarycoord(ho,vs,bs,Ss,A),w.barycoord=A}}return w}function Cm(p){return p&&p.isMaterial?p.side:p}function ur(p,m,g,_,x,y,v){let b=_*3,S=b+0,M=b+1,T=b+2,{index:w,groups:E}=p;if(p.index)S=w.getX(S),M=w.getX(M),T=w.getX(T);let{position:A,normal:P,uv:D,uv1:R}=p.attributes;if(Array.isArray(m)){let C=_*3;for(let I=0,U=E.length;I<U;I++){let{start:N,count:F,materialIndex:z}=E[I];if(C>=N&&C<N+F){let L=Cm(m[z]),O=Rm(g,A,P,D,R,S,M,T,L,y,v);if(O)if(O.faceIndex=_,O.face.materialIndex=z,x)x.push(O);else return O}}}else{let C=Cm(m),I=Rm(g,A,P,D,R,S,M,T,C,y,v);if(I)if(I.faceIndex=_,I.face.materialIndex=0,x)x.push(I);else return I}return null}function Ne(p,m,g,_){let{a:x,b:y,c:v}=p,b=m,S=m+1,M=m+2;if(g)b=g.getX(b),S=g.getX(S),M=g.getX(M);x.x=_.getX(b),x.y=_.getY(b),x.z=_.getZ(b),y.x=_.getX(S),y.y=_.getY(S),y.z=_.getZ(S),v.x=_.getX(M),v.y=_.getY(M),v.z=_.getZ(M)}function Pm(p,m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=p;for(let T=_,w=_+x;T<w;T++)ur(S,m,g,T,y,v,b)}function Im(p,m,g,_,x,y,v){let{geometry:b,_indirectBuffer:S}=p,M=1/0,T=null;for(let w=_,E=_+x;w<E;w++){let A;if(A=ur(b,m,g,w,null,y,v),A&&A.distance<M)T=A,M=A.distance}return T}function Lm(p,m,g,_,x,y,v){let{geometry:b}=g,{index:S}=b,M=b.attributes.position;for(let T=p,w=m+p;T<w;T++){let E;if(E=T,Ne(v,E*3,S,M),v.needsUpdate=!0,_(v,E,x,y))return!0}return!1}function Nm(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,y,v,b,S,M=0,T=p._roots;for(let E=0,A=T.length;E<A;E++)y=T[E],v=new Uint32Array(y),b=new Uint16Array(y),S=new Float32Array(y),w(0,M),M+=y.byteLength;function w(E,A,P=!1){let D=E*2;if(ge(D,b)){let R=Ee(E,v),C=Ce(D,b),I=1/0,U=1/0,N=1/0,F=-1/0,z=-1/0,L=-1/0;for(let O=3*R,V=3*(R+C);O<V;O++){let Y=_[O],H=x.getX(Y),W=x.getY(Y),K=x.getZ(Y);if(H<I)I=H;if(H>F)F=H;if(W<U)U=W;if(W>z)z=W;if(K<N)N=K;if(K>L)L=K}if(S[E+0]!==I||S[E+1]!==U||S[E+2]!==N||S[E+3]!==F||S[E+4]!==z||S[E+5]!==L)return S[E+0]=I,S[E+1]=U,S[E+2]=N,S[E+3]=F,S[E+4]=z,S[E+5]=L,!0;else return!1}else{let R=be(E),C=Se(E,v),I=P,U=!1,N=!1;if(m){if(!I){let Y=R/Re+A/sn,H=C/Re+A/sn;U=m.has(Y),N=m.has(H),I=!U&&!N}}else U=!0,N=!0;let F=I||U,z=I||N,L=!1;if(F)L=w(R,A,I);let O=!1;if(z)O=w(C,A,I);let V=L||O;if(V)for(let Y=0;Y<3;Y++){let H=R+Y,W=C+Y,K=S[H],G=S[H+3],Q=S[W],st=S[W+3];S[E+Y]=K<Q?K:Q,S[E+Y+3]=G>st?G:st}return V}}}function yn(p,m,g,_,x){let y,v,b,S,M,T,w=1/g.direction.x,E=1/g.direction.y,A=1/g.direction.z,P=g.origin.x,D=g.origin.y,R=g.origin.z,C=m[p],I=m[p+3],U=m[p+1],N=m[p+3+1],F=m[p+2],z=m[p+3+2];if(w>=0)y=(C-P)*w,v=(I-P)*w;else y=(I-P)*w,v=(C-P)*w;if(E>=0)b=(U-D)*E,S=(N-D)*E;else b=(N-D)*E,S=(U-D)*E;if(y>S||b>v)return!1;if(b>y||isNaN(y))y=b;if(S<v||isNaN(v))v=S;if(A>=0)M=(F-R)*A,T=(z-R)*A;else M=(z-R)*A,T=(F-R)*A;if(y>T||M>v)return!1;if(M>y||y!==y)y=M;if(T<v||v!==v)v=T;return y<=x&&v>=_}function Dm(p,m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=p;for(let T=_,w=_+x;T<w;T++){let E=M?M[T]:T;ur(S,m,g,E,y,v,b)}}function Um(p,m,g,_,x,y,v){let{geometry:b,_indirectBuffer:S}=p,M=1/0,T=null;for(let w=_,E=_+x;w<E;w++){let A;if(A=ur(b,m,g,S?S[w]:w,null,y,v),A&&A.distance<M)T=A,M=A.distance}return T}function Om(p,m,g,_,x,y,v){let{geometry:b}=g,{index:S}=b,M=b.attributes.position;for(let T=p,w=m+p;T<w;T++){let E;if(E=g.resolveTriangleIndex(T),Ne(v,E*3,S,M),v.needsUpdate=!0,_(v,E,x,y))return!0}return!1}function Fm(p,m,g,_,x,y,v){if(ue.setBuffer(p._roots[m]),yn(0,ue.float32Array,_,y,v))iu(0,p,g,_,x,y,v);ue.clearBuffer()}function iu(p,m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=ue,T=p*2;if(ge(T,S)){let E=Ee(p,M),A=Ce(T,S);Pm(m,g,_,E,A,x,y,v)}else{let E=be(p);if(yn(E,b,_,y,v))iu(E,m,g,_,x,y,v);let A=Se(p,M);if(yn(A,b,_,y,v))iu(A,m,g,_,x,y,v)}}var uS=["x","y","z"];function Bm(p,m,g,_,x,y){ue.setBuffer(p._roots[m]);let v=null;if(yn(0,ue.float32Array,_,x,y))v=su(0,p,g,_,x,y);return ue.clearBuffer(),v}function su(p,m,g,_,x,y){let{float32Array:v,uint16Array:b,uint32Array:S}=ue,M=p*2;if(ge(M,b)){let w=Ee(p,S),E=Ce(M,b);return Im(m,g,_,w,E,x,y)}else{let w=ir(p,S),E=uS[w],P=_.direction[E]>=0,D,R;if(P)D=be(p),R=Se(p,S);else D=Se(p,S),R=be(p);let I=yn(D,v,_,x,y)?su(D,m,g,_,x,y):null;if(I){let F=I.point[E];if(P?F<=v[R+w]:F>=v[R+w+3])return I}let N=yn(R,v,_,x,y)?su(R,m,g,_,x,y):null;if(I&&N)return I.distance<=N.distance?I:N;else return I||N||null}}var ja=new xe,dr=new xn,fr=new xn,uo=new Jt,km=new ke,Qa=new ke;function zm(p,m,g,_){ue.setBuffer(p._roots[m]);let x=ru(0,p,g,_);return ue.clearBuffer(),x}function ru(p,m,g,_,x=null){let{float32Array:y,uint16Array:v,uint32Array:b}=ue,S=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();km.set(g.boundingBox.min,g.boundingBox.max,_),x=km}if(ge(S,v)){let T=m.geometry,w=T.index,E=T.attributes.position,A=g.index,P=g.attributes.position,D=Ee(p,b),R=Ce(S,v);if(uo.copy(_).invert(),g.boundsTree)return Le(Oe(p),y,Qa),Qa.matrix.copy(uo),Qa.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(I)=>Qa.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(_),I.b.applyMatrix4(_),I.c.applyMatrix4(_),I.needsUpdate=!0;for(let U=D*3,N=(R+D)*3;U<N;U+=3)if(Ne(fr,U,w,E),fr.needsUpdate=!0,I.intersectsTriangle(fr))return!0;return!1}});else{let C=Yi(g);for(let I=D*3,U=(R+D)*3;I<U;I+=3){Ne(dr,I,w,E),dr.a.applyMatrix4(uo),dr.b.applyMatrix4(uo),dr.c.applyMatrix4(uo),dr.needsUpdate=!0;for(let N=0,F=C*3;N<F;N+=3)if(Ne(fr,N,A,P),fr.needsUpdate=!0,dr.intersectsTriangle(fr))return!0}}}else{let T=be(p),w=Se(p,b);if(Le(Oe(T),y,ja),x.intersectsBox(ja)&&ru(T,m,g,_,x))return!0;if(Le(Oe(w),y,ja),x.intersectsBox(ja)&&ru(w,m,g,_,x))return!0;return!1}}var tl=new Jt,ou=new ke,fo=new ke,dS=new q,fS=new q,pS=new q,mS=new q;function Hm(p,m,g,_={},x={},y=0,v=1/0){if(!m.boundingBox)m.computeBoundingBox();ou.set(m.boundingBox.min,m.boundingBox.max,g),ou.needsUpdate=!0;let b=p.geometry,S=b.attributes.position,M=b.index,T=m.attributes.position,w=m.index,E=Tn.getPrimitive(),A=Tn.getPrimitive(),P=dS,D=fS,R=null,C=null;if(x)R=pS,C=mS;let I=1/0,U=null,N=null;if(tl.copy(g).invert(),fo.matrix.copy(tl),p.shapecast({boundsTraverseOrder:(F)=>ou.distanceToBox(F),intersectsBounds:(F,z,L)=>{if(L<I&&L<v){if(z)fo.min.copy(F.min),fo.max.copy(F.max),fo.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree)return m.boundsTree.shapecast({boundsTraverseOrder:(O)=>fo.distanceToBox(O),intersectsBounds:(O,V,Y)=>Y<I&&Y<v,intersectsRange:(O,V)=>{for(let Y=O,H=O+V;Y<H;Y++){Ne(A,3*Y,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let W=F,K=F+z;W<K;W++){Ne(E,3*W,M,S),E.needsUpdate=!0;let G=E.distanceToTriangle(A,P,R);if(G<I){if(D.copy(P),C)C.copy(R);I=G,U=W,N=Y}if(G<y)return!0}}}});else{let L=Yi(m);for(let O=0,V=L;O<V;O++){Ne(A,3*O,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let Y=F,H=F+z;Y<H;Y++){Ne(E,3*Y,M,S),E.needsUpdate=!0;let W=E.distanceToTriangle(A,P,R);if(W<I){if(D.copy(P),C)C.copy(R);I=W,U=Y,N=O}if(W<y)return!0}}}}}),Tn.releasePrimitive(E),Tn.releasePrimitive(A),I===1/0)return null;if(!_.point)_.point=D.clone();else _.point.copy(D);if(_.distance=I,_.faceIndex=U,x){if(!x.point)x.point=C.clone();else x.point.copy(C);x.point.applyMatrix4(tl),D.applyMatrix4(tl),x.distance=D.sub(x.point).length(),x.faceIndex=N}return _}function Gm(p,m=null){if(m&&Array.isArray(m))m=new Set(m);let g=p.geometry,_=g.index?g.index.array:null,x=g.attributes.position,y,v,b,S,M=0,T=p._roots;for(let E=0,A=T.length;E<A;E++)y=T[E],v=new Uint32Array(y),b=new Uint16Array(y),S=new Float32Array(y),w(0,M),M+=y.byteLength;function w(E,A,P=!1){let D=E*2;if(ge(D,b)){let R=Ee(E,v),C=Ce(D,b),I=1/0,U=1/0,N=1/0,F=-1/0,z=-1/0,L=-1/0;for(let O=R,V=R+C;O<V;O++){let Y=3*p.resolveTriangleIndex(O);for(let H=0;H<3;H++){let W=Y+H;W=_?_[W]:W;let K=x.getX(W),G=x.getY(W),Q=x.getZ(W);if(K<I)I=K;if(K>F)F=K;if(G<U)U=G;if(G>z)z=G;if(Q<N)N=Q;if(Q>L)L=Q}}if(S[E+0]!==I||S[E+1]!==U||S[E+2]!==N||S[E+3]!==F||S[E+4]!==z||S[E+5]!==L)return S[E+0]=I,S[E+1]=U,S[E+2]=N,S[E+3]=F,S[E+4]=z,S[E+5]=L,!0;else return!1}else{let R=be(E),C=Se(E,v),I=P,U=!1,N=!1;if(m){if(!I){let Y=R/Re+A/sn,H=C/Re+A/sn;U=m.has(Y),N=m.has(H),I=!U&&!N}}else U=!0,N=!0;let F=I||U,z=I||N,L=!1;if(F)L=w(R,A,I);let O=!1;if(z)O=w(C,A,I);let V=L||O;if(V)for(let Y=0;Y<3;Y++){let H=R+Y,W=C+Y,K=S[H],G=S[H+3],Q=S[W],st=S[W+3];S[E+Y]=K<Q?K:Q,S[E+Y+3]=G>st?G:st}return V}}}function Vm(p,m,g,_,x,y,v){if(ue.setBuffer(p._roots[m]),yn(0,ue.float32Array,_,y,v))au(0,p,g,_,x,y,v);ue.clearBuffer()}function au(p,m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=ue,T=p*2;if(ge(T,S)){let E=Ee(p,M),A=Ce(T,S);Dm(m,g,_,E,A,x,y,v)}else{let E=be(p);if(yn(E,b,_,y,v))au(E,m,g,_,x,y,v);let A=Se(p,M);if(yn(A,b,_,y,v))au(A,m,g,_,x,y,v)}}var gS=["x","y","z"];function Wm(p,m,g,_,x,y){ue.setBuffer(p._roots[m]);let v=null;if(yn(0,ue.float32Array,_,x,y))v=lu(0,p,g,_,x,y);return ue.clearBuffer(),v}function lu(p,m,g,_,x,y){let{float32Array:v,uint16Array:b,uint32Array:S}=ue,M=p*2;if(ge(M,b)){let w=Ee(p,S),E=Ce(M,b);return Um(m,g,_,w,E,x,y)}else{let w=ir(p,S),E=gS[w],P=_.direction[E]>=0,D,R;if(P)D=be(p),R=Se(p,S);else D=Se(p,S),R=be(p);let I=yn(D,v,_,x,y)?lu(D,m,g,_,x,y):null;if(I){let F=I.point[E];if(P?F<=v[R+w]:F>=v[R+w+3])return I}let N=yn(R,v,_,x,y)?lu(R,m,g,_,x,y):null;if(I&&N)return I.distance<=N.distance?I:N;else return I||N||null}}var el=new xe,pr=new xn,mr=new xn,po=new Jt,Xm=new ke,nl=new ke;function qm(p,m,g,_){ue.setBuffer(p._roots[m]);let x=cu(0,p,g,_);return ue.clearBuffer(),x}function cu(p,m,g,_,x=null){let{float32Array:y,uint16Array:v,uint32Array:b}=ue,S=p*2;if(x===null){if(!g.boundingBox)g.computeBoundingBox();Xm.set(g.boundingBox.min,g.boundingBox.max,_),x=Xm}if(ge(S,v)){let T=m.geometry,w=T.index,E=T.attributes.position,A=g.index,P=g.attributes.position,D=Ee(p,b),R=Ce(S,v);if(po.copy(_).invert(),g.boundsTree)return Le(Oe(p),y,nl),nl.matrix.copy(po),nl.needsUpdate=!0,g.boundsTree.shapecast({intersectsBounds:(I)=>nl.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(_),I.b.applyMatrix4(_),I.c.applyMatrix4(_),I.needsUpdate=!0;for(let U=D,N=R+D;U<N;U++)if(Ne(mr,3*m.resolveTriangleIndex(U),w,E),mr.needsUpdate=!0,I.intersectsTriangle(mr))return!0;return!1}});else{let C=Yi(g);for(let I=D,U=R+D;I<U;I++){let N=m.resolveTriangleIndex(I);Ne(pr,3*N,w,E),pr.a.applyMatrix4(po),pr.b.applyMatrix4(po),pr.c.applyMatrix4(po),pr.needsUpdate=!0;for(let F=0,z=C*3;F<z;F+=3)if(Ne(mr,F,A,P),mr.needsUpdate=!0,pr.intersectsTriangle(mr))return!0}}}else{let T=be(p),w=Se(p,b);if(Le(Oe(T),y,el),x.intersectsBox(el)&&cu(T,m,g,_,x))return!0;if(Le(Oe(w),y,el),x.intersectsBox(el)&&cu(w,m,g,_,x))return!0;return!1}}var il=new Jt,hu=new ke,mo=new ke,_S=new q,xS=new q,yS=new q,vS=new q;function Ym(p,m,g,_={},x={},y=0,v=1/0){if(!m.boundingBox)m.computeBoundingBox();hu.set(m.boundingBox.min,m.boundingBox.max,g),hu.needsUpdate=!0;let b=p.geometry,S=b.attributes.position,M=b.index,T=m.attributes.position,w=m.index,E=Tn.getPrimitive(),A=Tn.getPrimitive(),P=_S,D=xS,R=null,C=null;if(x)R=yS,C=vS;let I=1/0,U=null,N=null;if(il.copy(g).invert(),mo.matrix.copy(il),p.shapecast({boundsTraverseOrder:(F)=>hu.distanceToBox(F),intersectsBounds:(F,z,L)=>{if(L<I&&L<v){if(z)mo.min.copy(F.min),mo.max.copy(F.max),mo.needsUpdate=!0;return!0}return!1},intersectsRange:(F,z)=>{if(m.boundsTree){let L=m.boundsTree;return L.shapecast({boundsTraverseOrder:(O)=>mo.distanceToBox(O),intersectsBounds:(O,V,Y)=>Y<I&&Y<v,intersectsRange:(O,V)=>{for(let Y=O,H=O+V;Y<H;Y++){let W=L.resolveTriangleIndex(Y);Ne(A,3*W,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let K=F,G=F+z;K<G;K++){let Q=p.resolveTriangleIndex(K);Ne(E,3*Q,M,S),E.needsUpdate=!0;let st=E.distanceToTriangle(A,P,R);if(st<I){if(D.copy(P),C)C.copy(R);I=st,U=K,N=Y}if(st<y)return!0}}}})}else{let L=Yi(m);for(let O=0,V=L;O<V;O++){Ne(A,3*O,w,T),A.a.applyMatrix4(g),A.b.applyMatrix4(g),A.c.applyMatrix4(g),A.needsUpdate=!0;for(let Y=F,H=F+z;Y<H;Y++){let W=p.resolveTriangleIndex(Y);Ne(E,3*W,M,S),E.needsUpdate=!0;let K=E.distanceToTriangle(A,P,R);if(K<I){if(D.copy(P),C)C.copy(R);I=K,U=Y,N=O}if(K<y)return!0}}}}}),Tn.releasePrimitive(E),Tn.releasePrimitive(A),I===1/0)return null;if(!_.point)_.point=D.clone();else _.point.copy(D);if(_.distance=I,_.faceIndex=U,x){if(!x.point)x.point=C.clone();else x.point.copy(C);x.point.applyMatrix4(il),D.applyMatrix4(il),x.distance=D.sub(x.point).length(),x.faceIndex=N}return _}function uu(p,m,g){if(p===null)return null;return p.point.applyMatrix4(m.matrixWorld),p.distance=p.point.distanceTo(g.ray.origin),p.object=m,p}var sl=new ke,rl=new Hi,Zm=new q,$m=new Jt,Km=new q,du=["getX","getY","getZ"];class gr extends eu{static serialize(p,m={}){m={cloneBuffers:!0,...m};let{geometry:g,_roots:_,_indirectBuffer:x}=p,y=g.getIndex(),v={version:1,roots:null,index:null,indirectBuffer:null};if(m.cloneBuffers)v.roots=_.map((b)=>b.slice()),v.index=y?y.array.slice():null,v.indirectBuffer=x?x.slice():null;else v.roots=_,v.index=y?y.array:null,v.indirectBuffer=x;return v}static deserialize(p,m,g={}){g={setIndex:!0,indirect:Boolean(p.indirectBuffer),...g};let{index:_,roots:x,indirectBuffer:y}=p;if(!p.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),b(x);let v=new gr(m,{...g,[ro]:!0});if(v._roots=x,v._indirectBuffer=y||null,g.setIndex){let S=m.getIndex();if(S===null){let M=new Xe(p.index,1,!1);m.setIndex(M)}else if(S.array!==_)S.array.set(_),S.needsUpdate=!0}return v;function b(S){for(let M=0;M<S.length;M++){let T=S[M],w=new Uint32Array(T),E=new Uint16Array(T);for(let A=0,P=T.byteLength/sn;A<P;A++){let D=Re*A,R=2*D;if(!ge(R,E))w[D+6]=w[D+6]/Re-A}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(p,m={}){if(m.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),m={...m,targetLeafSize:m.maxLeafTris};super(p,m)}shiftTriangleOffsets(p){return super.shiftPrimitiveOffsets(p)}writePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,y=_.attributes.position,v=_.index?_.index.array:null,S=(x?x[p]:p)*3,M=S+0,T=S+1,w=S+2;if(v)M=v[M],T=v[T],w=v[w];for(let E=0;E<3;E++){let A=y[du[E]](M),P=y[du[E]](T),D=y[du[E]](w),R=A;if(P<R)R=P;if(D<R)R=D;let C=A;if(P>C)C=P;if(D>C)C=D;m[g+E]=R,m[g+E+3]=C}return m}computePrimitiveBounds(p,m,g){let _=this.geometry,x=this._indirectBuffer,y=_.attributes.position,v=_.index?_.index.array:null,b=y.normalized;if(p<0||m+p-g.offset>g.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let S=y.array,M=y.offset||0,T=3;if(y.isInterleavedBufferAttribute)T=y.data.stride;let w=["getX","getY","getZ"],E=g.offset;for(let A=p,P=p+m;A<P;A++){let R=(x?x[A]:A)*3,C=(A-E)*6,I=R+0,U=R+1,N=R+2;if(v)I=v[I],U=v[U],N=v[N];if(!b)I=I*T+M,U=U*T+M,N=N*T+M;for(let F=0;F<3;F++){let z,L,O;if(b)z=y[w[F]](I),L=y[w[F]](U),O=y[w[F]](N);else z=S[I+F],L=S[U+F],O=S[N+F];let V=z;if(L<V)V=L;if(O<V)V=O;let Y=z;if(L>Y)Y=L;if(O>Y)Y=O;let H=(Y-V)/2,W=F*2;g[C+W+0]=V+H,g[C+W+1]=H+(Math.abs(V)+H)*nr}}return g}raycastObject3D(p,m,g=[]){let{material:_}=p;if(_===void 0)return;$m.copy(p.matrixWorld).invert(),rl.copy(m.ray).applyMatrix4($m),Km.setFromMatrixScale(p.matrixWorld),Zm.copy(rl.direction).multiply(Km);let x=Zm.length(),y=m.near/x,v=m.far/x;if(m.firstHitOnly===!0){let b=this.raycastFirst(rl,_,y,v);if(b=uu(b,p,m),b)g.push(b)}else{let b=this.raycast(rl,_,y,v);for(let S=0,M=b.length;S<M;S++){let T=uu(b[S],p,m);if(T)g.push(T)}}return g}refit(p=null){return(this.indirect?Gm:Nm)(this,p)}raycast(p,m=vi,g=0,_=1/0){let x=this._roots,y=[],v=this.indirect?Vm:Fm;for(let b=0,S=x.length;b<S;b++)v(this,b,m,p,y,g,_);return y}raycastFirst(p,m=vi,g=0,_=1/0){let x=this._roots,y=null,v=this.indirect?Wm:Bm;for(let b=0,S=x.length;b<S;b++){let M=v(this,b,m,p,g,_);if(M!=null&&(y==null||M.distance<y.distance))y=M}return y}intersectsGeometry(p,m){let g=!1,_=this._roots,x=this.indirect?qm:zm;for(let y=0,v=_.length;y<v;y++)if(g=x(this,y,p,m),g)break;return g}shapecast(p){let m=Tn.getPrimitive(),g=super.shapecast({...p,intersectsPrimitive:p.intersectsTriangle,scratchPrimitive:m,iterate:this.indirect?Om:Lm});return Tn.releasePrimitive(m),g}bvhcast(p,m,g){let{intersectsRanges:_,intersectsTriangles:x}=g,y=Tn.getPrimitive(),v=this.geometry.index,b=this.geometry.attributes.position,S=this.indirect?(A)=>{let P=this.resolveTriangleIndex(A);Ne(y,P*3,v,b)}:(A)=>{Ne(y,A*3,v,b)},M=Tn.getPrimitive(),T=p.geometry.index,w=p.geometry.attributes.position,E=p.indirect?(A)=>{let P=p.resolveTriangleIndex(A);Ne(M,P*3,T,w)}:(A)=>{Ne(M,A*3,T,w)};if(x){if(!(p instanceof gr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let A=(P,D,R,C,I,U,N,F)=>{for(let z=R,L=R+C;z<L;z++){E(z),M.a.applyMatrix4(m),M.b.applyMatrix4(m),M.c.applyMatrix4(m),M.needsUpdate=!0;for(let O=P,V=P+D;O<V;O++)if(S(O),y.needsUpdate=!0,x(y,M,O,z,I,U,N,F))return!0}return!1};if(_){let P=_;_=function(D,R,C,I,U,N,F,z){if(!P(D,R,C,I,U,N,F,z))return A(D,R,C,I,U,N,F,z);return!0}}else _=A}return super.bvhcast(p,m,{intersectsRanges:_})}intersectsBox(p,m){return sl.set(p.min,p.max,m),sl.needsUpdate=!0,this.shapecast({intersectsBounds:(g)=>sl.intersectsBox(g),intersectsTriangle:(g)=>sl.intersectsTriangle(g)})}intersectsSphere(p){return this.shapecast({intersectsBounds:(m)=>p.intersectsBox(m),intersectsTriangle:(m)=>m.intersectsSphere(p)})}closestPointToGeometry(p,m,g={},_={},x=0,y=1/0){return(this.indirect?Ym:Hm)(this,p,m,g,_,x,y)}closestPointToPoint(p,m={},g=0,_=1/0){return Em(this,p,m,g,_)}}var XP=parseInt(os)>=166,_r={Mesh:nn.prototype.raycast,Line:ds.prototype.raycast,LineSegments:wi.prototype.raycast,LineLoop:fs.prototype.raycast,Points:ps.prototype.raycast,BatchedMesh:_a.prototype.raycast},ln=new nn,ol=[];function Jm(p,m){if(this.isBatchedMesh)bS.call(this,p,m);else{let{geometry:g}=this;if(g.boundsTree)g.boundsTree.raycastObject3D(this,p,m);else{let _;if(this instanceof nn)_=_r.Mesh;else if(this instanceof wi)_=_r.LineSegments;else if(this instanceof fs)_=_r.LineLoop;else if(this instanceof ds)_=_r.Line;else if(this instanceof ps)_=_r.Points;else throw Error("BVH: Fallback raycast function not found.");_.call(this,p,m)}}}function bS(p,m){if(this.boundsTrees){let g=this.boundsTrees,_=this._drawInfo||this._instanceInfo,x=this._drawRanges||this._geometryInfo,y=this.matrixWorld;ln.material=this.material,ln.geometry=this.geometry;let v=ln.geometry.boundsTree,b=ln.geometry.drawRange;if(ln.geometry.boundingSphere===null)ln.geometry.boundingSphere=new En;for(let S=0,M=_.length;S<M;S++){if(!this.getVisibleAt(S))continue;let T=_[S].geometryIndex;if(ln.geometry.boundsTree=g[T],this.getMatrixAt(S,ln.matrixWorld).premultiply(y),!ln.geometry.boundsTree){this.getBoundingBoxAt(T,ln.geometry.boundingBox),this.getBoundingSphereAt(T,ln.geometry.boundingSphere);let w=x[T];ln.geometry.setDrawRange(w.start,w.count)}ln.raycast(p,ol);for(let w=0,E=ol.length;w<E;w++){let A=ol[w];A.object=this,A.batchId=S,m.push(A)}ol.length=0}ln.geometry.boundsTree=v,ln.geometry.drawRange=b,ln.material=null,ln.geometry=null}else _r.BatchedMesh.call(this,p,m)}function jm(p){let m=[0];for(let g=1;g<p.length;g++)m.push(m[g-1]+Math.hypot(p[g][0]-p[g-1][0],p[g][1]-p[g-1][1]));return m}function xr(p,m,g){let _=0,x=m.length-1;if(g<=0)return[p[0][0],p[0][1]];if(g>=m[x])return[p[x][0],p[x][1]];while(x-_>1){let v=_+x>>1;if(m[v]<=g)_=v;else x=v}let y=(g-m[_])/(m[x]-m[_]||1);return[p[_][0]+(p[x][0]-p[_][0])*y,p[_][1]+(p[x][1]-p[_][1])*y]}var Dn=11,fu=6,SS=12,MS=100,ES=500,TS=3,wS=500,Ms=2,pu=300000,AS=45,mu=22,Qm=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,RS=/^nocol_far/,CS=1.5,PS=0.004,tg=0.02,IS=10,LS=200,al=1000,gu=1,NS=4,eg=2,DS=2,US=0.15,ng=100,OS=3,ig=3,ll=1,FS=5,BS=0.1,kS=0.002,sg=1000,zS=80000,HS=2,GS=24,VS=6000,WS=0.1,rg=30,XS=0.6,qS=0.12,YS=0.15,ZS=0.05,$S=0.000001,KS=0.01,JS=100,og=0.3,jS=new Set(["KeyW","KeyA","KeyS","KeyD"]),QS=60,_u=4,ag="#ffd21f",lg=300,tM=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],eM=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,nM=/_wire_/,iM=6,sM=8,Wn=0,rM=1,oM=new Set(["power line"]),aM=/^(1ROAD|1GRASS|1GRAVEL)_ground/,lM=/^1ROAD_ground/,cg="#27d3c3",Es=0.3,hg=14,cl=1.5,cM=50,hM=0.25,uM=5000,dM=200,xu=4,ug=64;function dg(p,m){performance.clearMeasures(p);let g=performance.now(),_=m();return performance.measure(p,{start:g}),_}function fM(p){let m=document.createElement("canvas");m.width=p.width,m.height=p.height;let g=m.getContext("2d",{willReadFrequently:!0});return g?.drawImage(p,0,0),g?g.getImageData(0,0,p.width,p.height):null}function pM(p){let{roots:m,indirectBuffer:g}=gr.serialize(p,{cloneBuffers:!1});return m.reduce((_,x)=>_+x.byteLength,g?.byteLength??0)}function mM(p){let m=performance.now(),g=new gr(p.geometry,{indirect:!0}),_=pM(g);return p.geometry.boundsTree=g,p.raycast=Jm,performance.measure("map2lap.bvh",{start:m,detail:_}),_}var yr=(p)=>p.vertices*Dn*4+4+p.indices*2;function Xn(p,m){let g=m.getBoundingClientRect();return new Kt((p.clientX-g.left)/g.width*2-1,-(p.clientY-g.top)/g.height*2+1)}async function go(p,m,g=TS){let _;try{if(_=await fetch(p,{signal:m}),_.ok)return await _.arrayBuffer()}catch(x){if(m.aborted||g<=1)throw x;return await new Promise((y)=>setTimeout(y,wS)),go(p,m,g-1)}throw new xo(_.status,(await _.json().catch(()=>null))?.error??`${p}: ${_.status}`)}class xo extends Error{status;constructor(p,m){super(m);this.status=p}}function yu(p){let m=[],g=0;return async(_)=>{if(g>=p)await new Promise((x)=>m.push(x));g++;try{return await _()}finally{g--,m.shift()?.()}}}var gM=yu(SS);async function _M(p,m,g){let _;if(/\.dds$/i.test(m)){let x=new Gh().parse(p,!0);_=new Kr(x.mipmaps,x.width,x.height,x.format),_.minFilter=x.mipmapCount>1?Kn:Rn}else{let x=await createImageBitmap(new Blob([p]),{imageOrientation:"none",premultiplyAlpha:"none"});_=new We(x),_.generateMipmaps=!0,_.minFilter=Kn}return _.flipY=!1,_.wrapS=_.wrapT=sa,_.anisotropy=g,_.colorSpace=ha,_.needsUpdate=!0,_}function fg(p,m,g,_){let x=p.at(-1),y=p.at(-2);if(p.length>=uM)x[2]+=_;else if(Math.hypot(m-x[0],g-x[1])>=hM)p.push([m,g,_]);else if(y&&y[0]===x[0]&&y[1]===x[1])x[2]+=_;else p.push([x[0],x[1],_])}function xM(p,m){let g=[],_=m/2,x=(b)=>{let S=p[Math.max(0,b-1)],M=p[Math.min(p.length-1,b+1)],T=Math.hypot(M[0]-S[0],M[2]-S[2])||1;return[(M[2]-S[2])/T*_,(S[0]-M[0])/T*_]},y=(b)=>{let[S,M]=x(b);return[p[b][0]+S,p[b][1]+Es,p[b][2]+M]},v=(b)=>{let[S,M]=x(b);return[p[b][0]-S,p[b][1]+Es,p[b][2]-M]};for(let b=0;b+1<p.length;b++)g.push(...y(b),...y(b+1),...v(b),...v(b+1));return g.push(...y(0),...v(0),...y(p.length-1),...v(p.length-1)),g}function yM([p,m,g]){let _=m+Es;return[p-cl,_,g,p+cl,_,g,p,_,g-cl,p,_,g+cl]}function vM(p,m,g){return Math.hypot(...p.map((_,x)=>Math.max(Math.abs(m[x]-_),Math.abs(g[x]-_))))}function _o(p,m){p.computeBoundingBox();let g=p.boundingBox;p.boundingSphere=new En(new q(...m.center),Math.max(m.radius,vM(m.center,g.min.toArray(),g.max.toArray())))}function bM(p,m){let g=new Ye,_=new ga(new Float32Array(m,0,p.vertices*Dn),Dn);g.setAttribute("position",new us(_,3,0)),g.setAttribute("normal",new us(_,3,3)),g.setAttribute("uv",new us(_,2,6));let x=p.vertices*Dn*4+4;return g.setIndex(new Xe(new Uint16Array(m,x,p.indices),1)),_o(g,p),g}class vu{copyVersion=0;copyLoading=null;copyStamp=[];groundVersion=0;copyGhost=null;copyFoot=new q;copyPose={turn:0,y:0,scale:1};onCopyPlace=null;renderer;scene=new fa;camera=new An(55,1,0.5,pu);resizing;down=new to;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=mu;highest=sg;area=Tl([]);lastGround=0;zoomLeft=0;zoomAim=new q;host;flying=new Set;ride=null;rideSpeed=0;rideHeight=0;rideTold=0;onRideMoving=()=>{};onRideMetre=()=>{};lastFrame=0;settings=u;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new to;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=lg;onIndexed=()=>{};picks=new Map;adding=!1;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};refreshes=yu(fu);brush=null;onStroke=()=>{};askPreview=()=>Promise.resolve(null);onStrokeRefused=()=>{};onToolWheel=()=>{};ring=null;stroke=null;previewed=new Set;underPreview=new Map;previewShown=new Map;wheelTaken=!1;marking=null;pins=[];pinMarks=null;pinTexture=null;dragged=null;onPinMoved=()=>{};onPinTaken=()=>{};onClicked=()=>{};band=null;moveTool=!1;onMoved=()=>{};placed=new Map;pendingPivots=new Map;dragging=null;constructor(p){this.host=p,this.renderer=new Hh({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),p.appendChild(this.renderer.domElement),this.scene.background=new se("#a9cfe9"),this.scene.add(new Ca("#ffffff",2));let m=new Ra("#fff4e0",1.6);m.position.set(0.5,1,0.35),this.scene.add(m),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.moves(this.renderer.domElement),this.dragPins(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(p),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(p){if(this.shown=p,p)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(p){this.settings=p}setHover(p){this.onHover=p}setPick(p){this.onPick=p}setIndexed(p){this.onIndexed=p,p(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.forgetPicks(),this.onPick(null)}setAdding(p){this.adding=p}setRemoved(p,m=[],g=[]){this.named={ids:p,objectSorts:new Set(g)};let _=new Set(m),x=new Set([...p,...As(this.data?.objects??{},new Set([...g,...m]))]),y=m.length!==this.removedSorts.size||m.some((b)=>!this.removedSorts.has(b)),v=!1;for(let b of this.removed)if(!x.has(b))this.leaveOut(b,!1),v=!0;if(y){this.removedSorts=_;for(let b of this.billboardMeshes())this.restore(b);v=!0}for(let b of x)if(v||!this.removed.has(b))this.leaveOut(b,!0);if(v&&this.removedSorts.size)for(let b of this.billboardMeshes())this.leaveOutSorts(b);if(this.removed=x,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(p=this.named){return new Set([...p.ids,...As(this.data?.objects??{},p.objectSorts),...As(this.data?.objects??{},this.removedSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let p of this.removed){let m=p.slice(0,p.lastIndexOf("#"));if(!this.data?.objects?.[m]){if(!this.billboardsOut.has(m))this.billboardsOut.set(m,[]);this.billboardsOut.get(m).push(p);continue}for(let g of this.piecesOf(p)){if(!this.listedOut.has(g.mesh))this.listedOut.set(g.mesh,[]);this.listedOut.get(g.mesh).push(g)}}}countOfListed(p,m,g){if(!this.data)return 0;return Qu(this.data.objects,p,Al(this.wanted({ids:m,objectSorts:new Set(g)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(p){let m=p.userData.indices;if(!m)return;let g=p.geometry.getIndex();g.array.set(m),g.needsUpdate=!0}*billboardsOf(p){let m=p.userData.info,g=m.indices/3,_=m.first_face;for(let x=Tr(0,_);x<=Tr(Math.max(0,g-1),_);x++){let[y,v]=To(x,_,g);if(y<v)yield[x,y,v]}}spriteOf(p,m){let g=p.geometry.getAttribute("uv"),_=p.userData.indices??p.geometry.getIndex().array,[x,y,v]=[_[m*3],_[m*3+1],_[m*3+2]];return Pl(this.data.atlas,(g.getX(x)+g.getX(y)+g.getX(v))/3,(g.getY(x)+g.getY(y)+g.getY(v))/3)}leaveOutSorts(p){if(!this.removedSorts.size||!this.data)return;let m=p.userData.info;for(let[,g,_]of this.billboardsOf(p)){let x=this.spriteOf(p,g);if(x&&this.removedSorts.has(x))this.leaveOutIn(p,{mesh:m.i,from:g,end:_},!0)}}countOf(p){let m=new Set;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,y]of this.billboardsOf(g))if(this.spriteOf(g,y)===p)m.add(`${_.base}#${x}`)}for(let g of As(this.data?.objects??{},new Set([p])))if(!this.removed.has(g)&&this.shownBounds(this.piecesOf(g)))m.add(g);return m.size}piecesOf(p,m=!0){let g=p.lastIndexOf("#"),_=p.slice(0,g),x=Number(p.slice(g+1)),y=this.data?.objects?.[_]?.faces[x];if(y)return[...y.map(([v,b,S])=>({mesh:v,from:b,end:b+S})),...m?(this.belonging.get(p)??[]).flatMap((v)=>this.piecesOf(v)):[]];return(this.parts.get(_)??[]).map((v)=>{let b=v.userData.info,[S,M]=To(x,b.first_face,b.indices/3);return{mesh:b.i,from:S,end:M}}).filter((v)=>v.from<v.end)}leaveOut(p,m){for(let g of this.piecesOf(p)){let _=this.byNumber.get(g.mesh);if(_)this.leaveOutIn(_,g,m)}}leaveOutIn(p,{from:m,end:g},_){let x=p.geometry.getIndex(),y=x.array;if(!p.userData.indices)p.userData.indices=y.slice(),this.usedBytes+=y.byteLength;if(_)y.fill(0,m*3,g*3);else y.set(p.userData.indices.subarray(m*3,g*3),m*3);x.needsUpdate=!0}async open(p,m){let g=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:_}=this.loading;if(this.clear(),this.trackName=p,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),m(p?"Reading the track …":""),!p)return;try{await this.load(p,g,_,m)}catch(x){if(g!==this.token)return;this.loading.abort(),m(`Could not load this track: ${x.message}`)}}async load(p,m,g,_){let x=await fetch(`/api/editor/${encodeURIComponent(p)}/index`,{signal:g}),y=await x.json();if(m!==this.token)return;if(!x.ok){_(y.error||"Could not read this track");return}this.data=y,this.objectPieces=Cl(y.objects),this.belonging=Rl(y.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(y.revision),this.placeCamera(y),this.renderer.domElement.focus({preventScroll:!0});let v=y.meshes.some((A)=>A.copy)?this.syncCopies(y):Promise.resolve(),b=wl(y.meshes.filter((A)=>!A.copy),this.camera.position.toArray()),S=this.camera.position.clone(),M=performance.now(),T=y.meshes.length,w=0;if(await Promise.all(Array.from({length:fu},async()=>{while(b.length&&m===this.token){if(performance.now()-M>ES&&S.distanceTo(this.camera.position)>MS)b=wl(b,this.camera.position.toArray()),S=this.camera.position.clone(),M=performance.now();let A=b.pop();if(this.byNumber.has(A.i))continue;if(!ws(this.usedBytes,Ms*yr(A),this.settings.memoryGb)){this.overLimit=!0,b.length=0;return}this.usedBytes+=Ms*yr(A);let P=this.heightsVersion,D=await go(`/api/editor/${encodeURIComponent(p)}/mesh/${A.i}?r=${y.revision}`,g);if(m!==this.token)return;if(this.addMesh(p,y,A,D),P!==this.heightsVersion)this.refresh(A.i);w++,_(`Loading: ${w} of ${T} parts`)}})),await v,m!==this.token)return;if(await Promise.all(this.textures),m!==this.token)return;_(this.overLimit?`Memory limit reached (Settings): ${w} of ${T} parts, the nearest ones`:`${T} parts loaded`)}turnAround(p){let m=null,g=new q,_=0;p.addEventListener("mousedown",(x)=>{if(x.button===gu)x.preventDefault()}),p.addEventListener("pointerdown",(x)=>{if(x.button!==gu)return;this.zoomLeft=0,m={x:x.clientX,y:x.clientY};let y=this.camera.position,v=this.camera.getWorldDirection(new q);_=Math.max(ll,Math.min(this.reachOfLook(),this.groundAlong(y,v)?.distance??this.wayDown(v))),g=y.clone().addScaledVector(v,_),this.intoArea(g)}),p.addEventListener("pointermove",(x)=>{if(!m)return;if(!(x.buttons&NS)){m=null;return}let{look:y,invertLook:v}=this.settings,b=PS*y/h;this.turn(g,_,(m.x-x.clientX)*b,(m.y-x.clientY)*b*(v?-1:1)),m={x:x.clientX,y:x.clientY}}),p.addEventListener("pointerup",(x)=>{if(x.button===gu)m=null})}grabGround(p){let m=null,g=new q,_=new q;p.addEventListener("pointerdown",(y)=>{if(y.button!==eg)return;this.zoomLeft=0,this.picker.setFromCamera(Xn(y,p),this.camera);let{ray:v}=this.picker,b=this.groundAlong(v.origin,v.direction)?.point.y??this.lastGround;if(m=new on(new q(0,1,0),-b),!v.intersectPlane(m,_))m=null});let x=(y,v)=>{if(this.picker.setFromCamera(Xn(y,p),this.camera),!this.picker.ray.intersectPlane(v,g)||g.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=_.x-g.x,this.camera.position.z+=_.z-g.z,this.settle(),this.clearance=this.height,this.moved()};p.addEventListener("pointermove",(y)=>{if(!m)return;if(y.buttons&DS)x(y,m);else m=null}),p.addEventListener("pointerup",(y)=>{if(y.button!==eg)return;if(m)x(y,m);m=null})}zoomWheel(p){p.addEventListener("wheel",(m)=>{m.preventDefault();let g=m.ctrlKey&&m.altKey?"ctrlAlt":m.altKey?"alt":m.ctrlKey?"ctrl":m.shiftKey&&this.wheelTaken?"shift":null;if((this.brush||this.wheelTaken)&&g){let M=m.deltaY||m.deltaX;if(M)this.onToolWheel(g,M<0?1:-1);return}if(this.stopRide(),!this.data||this.held)return;this.mouse=Xn(m,p);let _=this.hit(),{ray:x}=this.picker,y=this.camera.position,v=_||x.direction.y<0?x.direction:this.camera.getWorldDirection(new q),b=Math.min(_?.distance??this.wayDown(v),Math.max(this.height,ll)*FS);this.zoomAim.copy(y).addScaledVector(v,Math.max(b,ll));let S=m.deltaMode===WheelEvent.DOM_DELTA_LINE?m.deltaY/OS*ng:m.deltaY;this.zoomLeft+=Mi.clamp(S/ng,-ig,ig)*this.settings.zoom/h},{passive:!1})}glideZoom(p){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let m=this.zoomLeft*(1-Math.exp(-p/BS));if(Math.abs(this.zoomLeft-m)<kS)m=this.zoomLeft;this.zoomLeft-=m;let g=this.camera.position,_=g.distanceTo(this.zoomAim);if(!_)return;let x=Math.max(Math.min(_,ll),_*(1-US)**-m);g.lerpVectors(this.zoomAim,g,x/_),this.settle(),this.clearance=this.height,this.moved()}followMouse(p){p.addEventListener("pointermove",(m)=>{if(this.mouse=Xn(m,p),this.held=m.buttons,!m.buttons)this.hoverDue=!0}),p.addEventListener("pointerdown",(m)=>{this.held=m.buttons}),p.addEventListener("pointerup",(m)=>{this.held=m.buttons,this.hoverDue=!0}),p.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(p){let m=this.brush;if(this.brush=p,!p){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!m)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(p,m,g){this.onStroke=p,this.askPreview=m,this.onStrokeRefused=g}cancelStroke(){if(!this.stroke)return!1;return clearInterval(this.stroke.timer),this.stroke=null,this.takeBackPreview(),!0}takeBackPreview(){for(let[p,m]of this.underPreview){let g=this.byNumber.get(p);if(!g)continue;let _=g.geometry.getAttribute("position").data,x=_.array;for(let[y,v]of m){let b=y*Dn;x[b+1]=v[0],x[b+3]=v[1],x[b+4]=v[2],x[b+5]=v[3]}_.needsUpdate=!0,_o(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.delete(p),this.dirty=!0}this.underPreview.clear(),this.previewShown.clear()}keepPreview(){this.underPreview.clear(),this.previewShown.clear()}dropPreview(){let p=[...this.previewed];this.previewed.clear();for(let m of p)this.refresh(m)}setWheelTaken(p){this.wheelTaken=p}setMove(p,m){if(this.onMoved=m,p===this.moveTool)return;if(this.moveTool=p,!p)this.dropDrag(),this.renderer.domElement.style.cursor=""}setPlaced(p){this.placed=new Map(p.map((m)=>[m.id,m]));for(let[m,g]of this.pendingPivots){let _=m.lastIndexOf("#"),x=this.data?.objects?.[m.slice(0,_)]?.at[Number(m.slice(_+1))],y=this.placed.get(m);if(x&&Math.abs(x[0]+(y?.x??0)-g[0])<0.002&&Math.abs(x[2]+(y?.z??0)-g[2])<0.002)this.pendingPivots.delete(m)}}rejectMove(p){for(let m of p)this.pendingPivots.delete(m);if(this.dragging?.ids.some((m)=>p.includes(m)))this.dropDrag();this.refreshMeshes([])}rootOf(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)],_=Number(p.slice(m+1));while(g&&g.parents[_]>=0)_=g.parents[_];return g?`${p.slice(0,m)}#${_}`:p}namesOf(p){let m=p.lastIndexOf("#"),g=this.data.objects[p.slice(0,m)],_=Number(p.slice(m+1));return{id:p,kind:wo(g.kinds[_]),sort:wr(g,_)}}canMove(p){let m=p.lastIndexOf("#"),g=this.data?.objects?.[p.slice(0,m)];return!g||!oM.has(g.kinds[Number(p.slice(m+1))])}pivotOf(p){let m=this.pendingPivots.get(p);if(m)return m;let g=p.lastIndexOf("#"),_=this.data?.objects?.[p.slice(0,g)];if(_){let[v,b,S]=_.at[Number(p.slice(g+1))],M=this.placed.get(p);return[v+(M?.x??0),b+(M?.y??0),S+(M?.z??0)]}let x=this.boundsOf(p),y=x.getCenter(new q);return[y.x,x.min.y,y.z]}grab(p){let m=[];for(let g of p){let _=new Map;for(let{mesh:x,from:y,end:v}of this.piecesOf(g)){let b=this.byNumber.get(x);if(!b)continue;let S=b.userData.indices??b.geometry.getIndex().array;if(!_.has(x))_.set(x,new Set);for(let M=y*3;M<v*3;M++)_.get(x).add(S[M])}for(let[x,y]of _){let v=Uint32Array.from(y),b=this.vertexArray(x),S=new Float32Array(v.length*Dn);v.forEach((M,T)=>S.set(b.subarray(M*Dn,(M+1)*Dn),T*Dn)),m.push({id:g,mesh:x,numbers:v,floats:S})}}return m}vertexArray(p){return this.byNumber.get(p).geometry.getAttribute("position").data.array}nudgeGrabbed(p,m,g){for(let _ of p){Sl(_.floats,this.vertexArray(_.mesh),_.numbers,Dn,m.get(_.id),g(_.id));let x=this.byNumber.get(_.mesh);x.geometry.getAttribute("position").data.needsUpdate=!0,_o(x.geometry,x.userData.info),x.geometry.boundsTree?.refit(),this.previewed.add(_.mesh)}this.reframePicks(),this.dirty=!0}nudge(p,m){let g={...Sr,...m},_=this.dragging;if(_&&p.every((x)=>_.ids.includes(x))){for(let x of _.grabbed){if(!p.includes(x.id))continue;let y=new Float32Array(x.floats.length);Sl(x.floats,y,Array.from(x.numbers,(v,b)=>b),Dn,_.pivots.get(x.id),g),x.floats=y}for(let x of p){let[y,v,b]=_.pivots.get(x);_.pivots.set(x,[y+g.x,v+g.y,b+g.z])}return this.dragOn(_.grabbed)}this.nudgeGrabbed(this.grab(p),new Map(p.map((x)=>[x,this.pivotOf(x)])),()=>g)}dragOn(p){let m=this.dragging;for(let g of m.ids){let[_,,x]=m.pivots.get(g),y=m.ground.get(g),v=this.groundAt(_+m.way.x,x+m.way.z);m.rises.set(g,y!=null&&v!=null?v-y:0)}this.nudgeGrabbed(p,m.pivots,(g)=>({...Sr,x:m.way.x,y:m.rises.get(g)??0,z:m.way.z}))}dropDrag(){let p=this.dragging;if(this.dragging=null,p)this.nudgeGrabbed(p.grabbed,p.pivots,()=>Sr)}reframePicks(){for(let[p,{box:m}]of this.picks){let g=this.boundsOf(p);if(!g.isEmpty())m.box.copy(g)}}moves(p){p.addEventListener("pointerdown",(m)=>{if(!this.moveTool||this.brush||m.button!==Wn)return;let g=this.pick(m,p);if(!g?.id||!this.picks.has(g.id))return;let _=[...this.picks.keys()].filter((S)=>this.canMove(S));if(!_.includes(g.id))return;let x=new Map(_.map((S)=>[S,this.pivotOf(S)])),y=new on(new q(0,1,0),-x.get(g.id)[1]),v=new q;if(this.picker.setFromCamera(Xn(m,p),this.camera),!this.picker.ray.intersectPlane(y,v))return;let b=new Map(_.map((S)=>{let[M,,T]=x.get(S);return[S,this.groundAt(M,T)]}));this.dragging={ids:_,plane:y,from:v,x:m.clientX,y:m.clientY,grabbed:this.grab(_),pivots:x,ground:b,rises:new Map,way:new q},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{let g=this.dragging;if(!g)return;if(!(m.buttons&rM))return this.dropDrag();if(!g.way.lengthSq()&&Math.hypot(m.clientX-g.x,m.clientY-g.y)<_u)return;this.picker.setFromCamera(Xn(m,p),this.camera);let _=new q;if(!this.picker.ray.intersectPlane(g.plane,_)||_.distanceTo(this.camera.position)>2*this.highest)return;g.way.set(_.x-g.from.x,0,_.z-g.from.z),p.style.cursor="grabbing",this.dragOn(g.grabbed)}),p.addEventListener("pointerup",(m)=>{let g=this.dragging;if(!g||m.button!==Wn)return;if(this.dragging=null,p.style.cursor="grab",g.way.lengthSq()){for(let _ of g.ids){let[x,y,v]=g.pivots.get(_);this.pendingPivots.set(_,[x+g.way.x,y+(g.rises.get(_)??0),v+g.way.z])}this.onMoved(g.ids.map((_)=>({id:_,x:g.way.x,y:g.rises.get(_)??0,z:g.way.z})))}}),p.addEventListener("pointercancel",()=>this.dropDrag())}setClicked(p){this.onClicked=p}setMarking(p){this.marking=p}heightOfGround(p,m){return this.groundAt(p,m)??this.lastGround}groundAt(p,m){return this.groundAlong(new q(p,pu,m),new q(0,-1,0))?.point.y??null}drawBand(p,m){if(this.band)this.scene.remove(this.band),this.band.geometry.dispose(),this.band.material.dispose(),this.band=null;if(this.dirty=!0,!p?.length)return;let g=p.length===1?yM(p[0]):xM(p,m);this.band=new wi(new Ye().setAttribute("position",new an(g,3)),new Gi({color:cg,depthTest:!1,transparent:!0})),this.band.renderOrder=10,this.band.frustumCulled=!1,this.scene.add(this.band)}drawPins(p){if(this.pins=p,this.dragged=null,this.pinMarks)this.scene.remove(this.pinMarks),this.pinMarks.geometry.dispose(),this.pinMarks.material.dispose(),this.pinMarks=null;if(this.dirty=!0,!p.length){this.renderer.domElement.style.cursor="";return}this.pinMarks=new ps(new Ye().setAttribute("position",new an(p.flatMap(([m,g,_])=>[m,g+Es,_]),3)),new $r({color:cg,size:hg,sizeAttenuation:!1,map:this.pinImage(),alphaTest:0.5,depthTest:!1,transparent:!0})),this.pinMarks.renderOrder=11,this.pinMarks.frustumCulled=!1,this.scene.add(this.pinMarks)}pinImage(){if(this.pinTexture)return this.pinTexture;let p=document.createElement("canvas");p.width=p.height=32;let m=p.getContext("2d");return m.fillStyle="#ffffff",m.beginPath(),m.arc(16,16,15,0,2*Math.PI),m.fill(),this.pinTexture=new ya(p),this.pinTexture}setPinned(p,m){this.onPinMoved=p,this.onPinTaken=m}pinAt(p,m){let g=m.getBoundingClientRect(),_=new q,x=-1,y=hg;return this.pins.forEach(([v,b,S],M)=>{_.set(v,b+Es,S).project(this.camera);let T=Math.hypot((_.x+1)/2*g.width+g.left-p.clientX,(1-_.y)/2*g.height+g.top-p.clientY);if(_.z<1&&T<y)y=T,x=M}),x}dropDragged(){let p=this.dragged;if(this.dragged=null,!p||!this.pinMarks)return;this.pins[p.pin]=p.from;let[m,g,_]=p.from;this.pinMarks.geometry.getAttribute("position").setXYZ(p.pin,m,g+Es,_).needsUpdate=!0,this.dirty=!0}dragPins(p){p.addEventListener("pointerdown",(m)=>{if(m.button!==Wn||this.brush)return;let g=this.pinAt(m,p);if(g<0)return;this.dragged={pin:g,x:m.clientX,y:m.clientY,from:this.pins[g]},p.setPointerCapture(m.pointerId)}),p.addEventListener("pointermove",(m)=>{if(!this.dragged){if(this.pins.length)p.style.cursor=this.pinAt(m,p)>=0?"grab":"";return}this.mouse=Xn(m,p);let g=this.brushAt();if(!g||!this.pinMarks)return;this.pins[this.dragged.pin]=[g.x,g.y,g.z],this.pinMarks.geometry.getAttribute("position").setXYZ(this.dragged.pin,g.x,g.y+Es,g.z).needsUpdate=!0,this.dirty=!0}),p.addEventListener("pointerup",(m)=>{let g=this.dragged;if(!g||m.button!==Wn)return;if(Math.hypot(m.clientX-g.x,m.clientY-g.y)<_u)return this.dropDragged();this.dragged=null,this.onPinMoved(g.pin,this.pins[g.pin][0],this.pins[g.pin][2])}),p.addEventListener("pointercancel",()=>this.dropDragged())}sample(){let p=this.stroke;if(!p||!this.mouse)return;let m=performance.now(),g=(m-p.at)/1000,_=p.samples.at(-1);p.at=m;let x=`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;if(x===p.look)fg(p.samples,_[0],_[1],g);else{let y=this.brushAt();if(p.look=x,this.placeRing(y,p.turned),y)fg(p.samples,y.x,y.z,g)}if(!p.asking&&m-p.asked>=dM)p.asking=!0,p.asked=m,this.askPreview(p.samples.map((y)=>[...y]),p.turned).then((y)=>{if(p.asking=!1,this.stroke!==p)return;if(typeof y==="string")this.cancelStroke(),this.onStrokeRefused(y);else if(y)this.showPreview(y)},()=>{p.asking=!1})}showPreview(p){this.takeBackPreview();let m=new Uint32Array(p),g=1;for(let _=0;_<m[0];_++){let x=m[g],y=m[g+1];this.previewShown.set(x,{numbers:m.subarray(g+2,g+2+y),values:new Float32Array(p,(g+2+y)*4,y*xu)}),g+=2+y+y*xu,this.laidOver(x)}this.dirty=!0}laidOver(p){let m=this.previewShown.get(p),g=this.byNumber.get(p);if(!m||!g)return;let{numbers:_,values:x}=m,y=g.geometry.getAttribute("position").data,v=y.array,b=new Map;this.underPreview.set(p,b);for(let S=0;S<_.length;S++){let M=_[S]*Dn,T=S*xu;b.set(_[S],[v[M+1],v[M+3],v[M+4],v[M+5]]),v[M+1]=x[T],v[M+3]=x[T+1],v[M+4]=x[T+2],v[M+5]=x[T+3]}y.needsUpdate=!0,_o(g.geometry,g.userData.info),g.geometry.boundsTree?.refit(),this.previewed.add(p)}setToolWheel(p){this.onToolWheel=p}refreshMeshes(p){if(p.includes(-1))this.syncCopies();let m=new Set(this.previewShown.size?p:[...p,...this.previewed]);if(!this.previewShown.size)this.previewed.clear();if(!m.size)return;this.heightsVersion++;for(let g of m)if(g>=0)this.refresh(g)}async syncCopies(p,m=2){let g=this.token,_=++this.copyVersion;this.copyLoading?.abort(),this.copyLoading=new AbortController;let x=AbortSignal.any([this.loading.signal,this.copyLoading.signal]);try{let y=p;if(!y){let C=await fetch(`/api/editor/${encodeURIComponent(this.trackName)}/copies`,{signal:x}),I=await C.json();if(!C.ok)throw new xo(C.status,I.error??"Could not load the copied objects");y=I}if(g!==this.token||_!==this.copyVersion)return;if(y.revision!==this.data?.revision)throw Error("The track changed");let v=y.meshes.filter((C)=>C.copy),b=this.meshes.filter((C)=>C.userData.info.copy),S=b.reduce((C,I)=>C+Ms*yr(I.userData.info),0),M=v.reduce((C,I)=>C+Ms*yr(I),0);if(!ws(this.usedBytes-S,M,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");let T=this.heightsVersion,w=yu(fu),E=y.revision,A=y.copy_revision??"",P=await Promise.all(v.map((C)=>w(()=>(x.throwIfAborted(),go(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${C.i}?r=${E}&c=${A}`,x)))));if(g!==this.token||_!==this.copyVersion)return;if(!ws(this.usedBytes-S,M,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");for(let C of b){let I=C.userData.info;this.scene.remove(C),C.geometry.boundsTree=void 0,C.geometry.dispose(),this.byNumber.delete(I.i),this.usedBytes-=Ms*yr(I)}this.meshes=this.meshes.filter((C)=>!C.userData.info.copy);let D=Object.fromEntries(Object.entries(this.data.objects).filter(([C])=>!C.startsWith("copy_"))),R=Object.fromEntries(Object.entries(y.objects).filter(([C])=>C.startsWith("copy_")));this.data={...this.data,copy_revision:A,draft:y.draft,meshes:[...this.data.meshes.filter((C)=>!C.copy),...v],objects:{...D,...R}};for(let[C,I]of this.objectPieces)if(I[0]?.id.startsWith("copy_"))this.objectPieces.delete(C);for(let[C,I]of Cl(R))this.objectPieces.set(C,I);for(let C of this.belonging.keys())if(C.startsWith("copy_"))this.belonging.delete(C);for(let[C,I]of Rl(R))this.belonging.set(C,I);this.removed=this.wanted(),this.noteListedOut(),v.forEach((C,I)=>{let U=Ms*yr(C);if(this.usedBytes+=U,this.addMesh(this.trackName,this.data,C,P[I]),T!==this.heightsVersion)this.refresh(C.i)});for(let C of[...this.picks.keys()]){let[I,U]=C.split("#");if(I.startsWith("copy_")&&!R[I]?.faces[Number(U)]?.length)this.dropPick(C)}this.reframePicks(),this.onViewFailed(null),this.dirty=!0,this.hoverDue=!0}catch(y){if(g!==this.token||_!==this.copyVersion||x.aborted)return;if(y instanceof xo&&y.status===409&&m>0)return this.syncCopies(void 0,m-1);this.onViewFailed(y.message)}}setCopy(p,m,g){if(this.copyGhost){this.scene.remove(this.copyGhost);for(let b of this.copyGhost.children)b.geometry.dispose(),b.material.dispose()}if(this.copyGhost=null,this.copyStamp=[],this.onCopyPlace=m,!p||!m){this.dirty=!0;return}let _=new Ui;_.matrixAutoUpdate=!1;let x=[...Al([p],this.belonging)].filter((b)=>this.canMove(b));for(let b of x)for(let S of this.piecesOf(b,!1)){let M=this.byNumber.get(S.mesh);if(!M)continue;let T=M.geometry.getIndex().array,w=[];for(let D=S.from*3;D<S.end*3;D+=3)if(T[D]!==T[D+1]&&T[D+1]!==T[D+2]&&T[D]!==T[D+2])w.push(T[D],T[D+1],T[D+2]);if(!w.length)continue;let E=M.geometry.clone();E.setIndex(w);let A=E.toNonIndexed();E.dispose();let P=M.material.clone();P.transparent=!0,P.opacity=0.5,P.depthWrite=!1,_.add(new nn(A,P))}let y=new xe().setFromObject(_),v=this.pivotOf(p);if(y.isEmpty())return;this.copyFoot.set(g?.[0]??v[0],g?.[1]??y.min.y,g?.[2]??v[2]),this.copyGhost=_,this.scene.add(_),this.followCopy()}setCopyPose(p){this.copyPose={turn:p.turn,y:p.y,scale:p.scale},this.followCopy()}copyAt(){if(!this.mouse)return null;this.picker.setFromCamera(this.mouse,this.camera);let p=this.groundAlong(this.picker.ray.origin,this.picker.ray.direction);return p?p.point.toArray():null}followCopy(){if(!this.copyGhost||!this.shown)return;let p=this.camera,{position:m,quaternion:g}=p,_=[this.mouse?.x??1/0,this.mouse?.y??1/0,m.x,m.y,m.z,g.x,g.y,g.z,g.w,p.aspect,p.fov,this.copyPose.turn,this.copyPose.y,this.copyPose.scale,this.groundVersion,this.held?1:0];if(_.every((y,v)=>y===this.copyStamp[v]))return;this.copyStamp=_;let x=this.copyAt();if(this.copyGhost.visible=!!x&&!this.held,x){let{turn:y,y:v,scale:b}=this.copyPose;this.copyGhost.matrix.makeTranslation(x[0],x[1]+v,x[2]).multiply(new Jt().makeRotationY(y*Math.PI/180)).multiply(new Jt().makeScale(b,b,b)).multiply(new Jt().makeTranslation(-this.copyFoot.x,-this.copyFoot.y,-this.copyFoot.z)),this.copyGhost.matrixWorldNeedsUpdate=!0}this.dirty=!0}setViewFailed(p){this.onViewFailed=p}async refresh(p){let m=this.token,{signal:g}=this.loading,_=this.byNumber.get(p);if(!_||!this.data)return;let x=_.userData.asked=(_.userData.asked??0)+1;try{let y=await this.refreshes(()=>go(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${p}?r=${this.data.revision}${_.userData.info.copy?`&c=${this.data.copy_revision??""}`:""}`,g));if(m===this.token&&_.userData.asked===x&&this.byNumber.get(p)===_)this.takeVertices(_,y)}catch(y){if(m===this.token&&!g.aborted&&_.userData.asked===x&&this.byNumber.get(p)===_)if(y instanceof xo&&y.status===409&&_.userData.info.copy)this.syncCopies();else this.onViewFailed(y.message)}}takeVertices(p,m){let g=p.geometry,_=p.userData.info;if(Qm.test(_.name))this.groundVersion++;let x=g.getAttribute("position").data;x.array.set(new Float32Array(m,0,_.vertices*Dn)),x.needsUpdate=!0,this.underPreview.delete(_.i);let y=this.dragging?.grabbed.filter((v)=>v.mesh===_.i)??[];if(y.length)this.dragOn(y);if(_o(g,_),g.boundsTree?.refit(),this.laidOver(_.i),this.marked)this.markDue=!0;this.reframePicks(),this.dirty=!0,this.hoverDue=!0}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:p}=this.picker,m=this.groundAlong(p.origin,p.direction);return m&&aM.test(m.object.name)?m.point:null}placeRing(p,m){if(!this.brush)return;if(!this.ring){let g=Array.from({length:ug},(_,x)=>{let y=x/ug*2*Math.PI;return new q(Math.cos(y),0,Math.sin(y))});this.ring=new fs(new Ye().setFromPoints(g),new Gi({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!p,p)this.ring.position.copy(p),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(m?this.brush.turnedColour:this.brush.colour);this.dirty=!0}strokes(p){p.addEventListener("pointerdown",(m)=>{if(!this.brush||m.button!==Wn)return;this.mouse=Xn(m,p);let g=this.brushAt();if(!g)return;let _=performance.now();this.stroke={samples:[[g.x,g.z,0]],turned:m.shiftKey,at:_,asked:_,asking:!1,look:`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,timer:setInterval(()=>this.sample(),cM)},p.setPointerCapture(m.pointerId)});for(let m of["keydown","keyup"])p.addEventListener(m,(g)=>{if((this.brush||this.wheelTaken)&&g.key==="Alt")g.preventDefault()});p.addEventListener("pointermove",(m)=>{if(!this.brush)return;if(this.mouse=Xn(m,p),!this.stroke)this.placeRing(this.brushAt(),m.shiftKey)}),p.addEventListener("pointerup",(m)=>{if(!this.stroke||m.button!==Wn)return;this.mouse=Xn(m,p),this.sample();let{samples:g,turned:_,timer:x}=this.stroke;clearInterval(x),this.stroke=null,this.keepPreview(),this.onStroke(g,_)}),p.addEventListener("pointercancel",()=>this.cancelStroke()),p.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(p){let m=null;p.addEventListener("pointerdown",(g)=>{m=g.button===0&&!this.brush&&!this.moveTool&&this.pinAt(g,p)<0||g.button===2?{x:g.clientX,y:g.clientY,button:g.button}:null}),p.addEventListener("pointermove",(g)=>{if(m&&Math.hypot(g.clientX-m.x,g.clientY-m.y)>=_u)m=null}),p.addEventListener("pointerup",(g)=>{let _=m?.button===2&&g.button===2?this.pinAt(g,p):-1;if(_>=0)this.onPinTaken(_);else if(m&&g.button===m.button){if(g.button===Wn&&this.onCopyPlace){this.mouse=Xn(g,p);let v=this.copyAt();if(v)this.onCopyPlace(v);m=null;return}let x=this.pick(g,p),y=p.getBoundingClientRect();if(g.button===2&&x)this.onMenu({x:g.clientX-y.left,y:g.clientY-y.top,width:y.width,height:y.height});if(g.button===Wn)this.onClicked(x)}m=null}),p.addEventListener("contextmenu",(g)=>g.preventDefault())}pick(p,m){if(!this.data)return null;this.mouse=Xn(p,m);let g=this.hit(),_=g?this.describe(g):null,x=this.adding&&p.shiftKey&&p.button===Wn,y=_?.id&&this.moveTool?this.rootOf(_.id):_?.id??null;if(_&&y&&y!==_.id)Object.assign(_,this.namesOf(y));if(!_){if(!x)this.unpick();return null}if(x&&!y)return null;if(x&&this.picks.has(y))return this.dropPick(y);if(!x&&!(p.button!==Wn&&y&&this.picks.has(y)))this.forgetPicks();let v=y?this.boundsOf(y):null,b=v?.getCenter(new q).setY(v.min.y),S={id:y,afterBuild:!y&&eM.test(_.object),kind:_.kind,sprite:_.sprite,sort:_.sort,position:b?[b.x,b.y,b.z]:_.at,left:p.button===Wn,road:g&&lM.test(g.object.name)?[g.point.x,g.point.z]:null,all:[]};if(y&&v)this.picks.set(y,{box:this.picks.get(y)?.box??this.frameOf(v),picked:S});return S.all=this.allPicked(),this.onPick(S),S}allPicked(){return[...this.picks.values()].map(({picked:p})=>({id:p.id,position:p.position}))}dropPick(p){this.removeFrame(this.picks.get(p).box),this.picks.delete(p);let m=[...this.picks.values()].at(-1)?.picked??null;if(m)m.all=this.allPicked();return this.onPick(m&&{...m}),m}setMenu(p){this.onMenu=p}setMarked(p){this.marked=p,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let p=this.marked.tree?this.treesOf(this.marked.sort):this.listedOf(this.marked.sort),m=new Float32Array(p.length*24*3),g=new q;p.forEach((x,y)=>{tM.forEach(([v,b],S)=>{for(let[M,T]of[v,b].entries())g.set(T&1?x.max.x:x.min.x,T&2?x.max.y:x.min.y,T&4?x.max.z:x.min.z),g.toArray(m,(y*24+S*2+M)*3)})});let _=new Ye().setAttribute("position",new Xe(m,3));this.markedLines=new wi(_,new Gi({color:ag,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(p){let m=[];for(let g of As(this.data.objects,new Set([p]))){let _=g.lastIndexOf("#"),x=this.data.objects[g.slice(0,_)].faces[Number(g.slice(_+1))],y=this.shownBounds(x.map(([v,b,S])=>({mesh:v,from:b,end:b+S})));if(y)m.push(y)}return m}treesOf(p){let m=new Map;for(let g of this.billboardMeshes()){let _=g.userData.info;for(let[x,y,v]of this.billboardsOf(g)){if(this.spriteOf(g,y)!==p)continue;let b=`${_.base}#${x}`;m.set(b,[...m.get(b)??[],{mesh:_.i,from:y,end:v}])}}return[...m.values()].map((g)=>this.shownBounds(g)).filter((g)=>g!==null).concat(this.listedOf(p))}shownBounds(p){let m=new xe,g=new q;for(let{mesh:_,from:x,end:y}of p){let v=this.byNumber.get(_),b=v?.geometry.getIndex().array;if(!v||!b||x>=y||b[x*3]===b[x*3+1])continue;let S=v.geometry.getAttribute("position");for(let M=x*3;M<y*3;M++)m.expandByPoint(g.fromBufferAttribute(S,b[M]))}return m.isEmpty()?null:m}frameOf(p){let m=new Ia(p,new se(ag));return m.material.depthTest=!1,this.scene.add(m),this.dirty=!0,m}removeFrame(p){this.scene.remove(p),p.dispose(),this.dirty=!0}forgetPicks(){for(let{box:p}of this.picks.values())this.removeFrame(p);this.picks.clear()}boundsOf(p){let m=new xe,g=new q;for(let{mesh:_,from:x,end:y}of this.piecesOf(p)){let v=this.byNumber.get(_);if(!v)continue;let b=v.geometry.getAttribute("position"),S=v.userData.indices??v.geometry.getIndex().array;for(let M=x*3;M<y*3;M++)m.expandByPoint(g.fromBufferAttribute(b,S[M]))}return m}solidAt(p){let m=p.object.material;if(!m.alphaTest||!m.map||!p.uv)return!0;let g=this.alphaOf.get(m.map);if(g===void 0){if(g=m.map.image instanceof ImageBitmap?fM(m.map.image):null,this.alphaOf.set(m.map,g),g)this.usedBytes+=g.data.byteLength}if(!g)return!0;let _=Math.floor((p.uv.x-Math.floor(p.uv.x))*g.width),x=Math.floor((p.uv.y-Math.floor(p.uv.y))*g.height);return g.data[(x*g.width+_)*4+3]/255>=m.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;if(this.marking){let g=this.brushAt();if(g)this.marking(g.x,g.z)}let p=dg("map2lap.hover",()=>this.hit()),m=p?this.describe(p):null;if(this.moveTool)this.renderer.domElement.style.cursor=m?.id&&this.canMove(this.rootOf(m.id))?"grab":"";this.onHover(m)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let p=this.picker.intersectObjects(this.meshes.filter((m)=>m.visible),!1).find((m)=>this.solidAt(m));return this.wireNear(p?.distance??1/0)??p}wireNear(p){let{ray:m}=this.picker,g=this.renderer.domElement.clientHeight||1,_=2*Math.tan(Mi.degToRad(this.camera.fov)/2)/g*iM,x=new q,y=new q,v=new q,b=new q,S,M=p;for(let T of this.meshes){if(!T.visible||!nM.test(T.name))continue;let w=T.geometry.boundingSphere,E=m.direction.dot(w.center.clone().sub(m.origin));if(m.distanceSqToPoint(w.center)>(w.radius+Math.max(E,0)*_)**2)continue;let A=T.geometry.getIndex().array,P=T.geometry.getAttribute("position");for(let D=0;D*3<A.length;D+=sM){if(A[D*3]===A[D*3+1])continue;x.fromBufferAttribute(P,A[D*3]),y.fromBufferAttribute(P,A[D*3+1]);let R=m.distanceSqToSegment(x,y,v,b),C=v.distanceTo(m.origin);if(C<M&&R<=(C*_)**2)M=C,S={distance:C,point:b.clone(),object:T,faceIndex:D}}}return S}describe(p){let m=this.data,g=p.object,_=g.userData.info,x=m.materials[_.material],y=m.textures.find((C)=>C.name===x.texture),{x:v,y:b,z:S}=p.point,M=p.faceIndex??0,T=p.uv?[p.uv.x,p.uv.y]:null,w=_.first_face!==null&&_.first_face!==void 0,E=w?Tr(M,_.first_face):null,A=td(this.objectPieces.get(_.i),M),P=A?m.objects[A.slice(0,A.lastIndexOf("#"))]:null,D=A?Number(A.slice(A.lastIndexOf("#")+1)):-1,R=w||!!P&&["tree","bush"].includes(P.kinds[D]);return{id:A??(E!==null?`${_.base}#${E}`:null),kind:A?wo(P.kinds[D]):nd(_.name),sprite:R&&T?Pl(m.atlas,T[0],T[1]):null,sort:A&&!R?wr(P,D):null,object:_.name,physics:ed(_.name),material:x.name,shader:x.shader,texture:x.texture,textureBytes:y?.size??null,vertices:_.vertices,triangles:_.indices/3,triangle:M,uv:T,shownTo:_.lod_out,billboard:w?this.billboard(g,_,M):null,at:[v,b,S],tile:Ku(v,S),route:Eo(m.route,v,S),latLon:m.anchor?Ju(m.anchor,v,b,S):null,distance:p.distance}}billboard(p,m,g){let _=m.first_face,x=Tr(g,_),[y,v]=To(x,_,m.indices/3);if(v-y<8)return{number:x,height:null,width:null,foot:null};let b=p.geometry.getIndex(),S=p.geometry.getAttribute("position"),M=new xe,T=new q,w=new q;for(let A=y*3;A<v*3;A++)if(T.fromBufferAttribute(S,b.getX(A)),M.expandByPoint(T),A===y*3)w.copy(T);T.fromBufferAttribute(S,b.getX(y*3+1));let E=M.getCenter(new q);return{number:x,height:M.max.y-M.min.y,width:w.distanceTo(T),foot:[E.x,E.z]}}flyKeys(p){p.tabIndex=0,p.addEventListener("pointerdown",(m)=>{if(p.focus({preventScroll:!0}),m.button!==Wn)this.stopRide()}),p.addEventListener("keydown",(m)=>{if(!jS.has(m.code)||m.ctrlKey||m.metaKey||m.altKey)return;m.preventDefault(),this.stopRide(),this.flying.add(m.code)}),p.addEventListener("keyup",(m)=>this.flying.delete(m.code)),p.addEventListener("blur",()=>this.flying.clear())}fly(p){let m=this.camera.position,g=this.camera.getWorldDirection(new q).setY(0).normalize(),_=new q().crossVectors(g,this.camera.up).normalize(),x=new q;if(this.flying.has("KeyW"))x.add(g);if(this.flying.has("KeyS"))x.sub(g);if(this.flying.has("KeyD"))x.add(_);if(this.flying.has("KeyA"))x.sub(_);if(!x.lengthSq())return;let y=Math.min(VS,Math.max(GS,this.height*HS));m.add(x.normalize().multiplyScalar(y*this.settings.fly/h*p)),this.keepInArea();let v=this.groundBelow();if(v!==null)m.y+=(v+this.clearance-m.y)*(1-Math.exp(-p/og));this.settle(v),this.moved()}turn(p,m,g,_){let x=this.camera.getWorldDirection(new q),y=new Pa().setFromVector3(x);y.theta+=g,y.phi=Mi.clamp(y.phi-_,Math.PI/2+tg,Math.PI-tg),x.setFromSpherical(y);let v=this.camera.position;v.copy(p).addScaledVector(x,-m),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(v.clone().add(x)),this.moved()}groundAlong(p,m){return this.down.set(p,m),dg("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let p=this.camera.position;return this.groundAlong(new q(p.x,p.y+pu,p.z),new q(0,-1,0))?.point.y??null}wayDown(p){return Math.max(this.camera.position.y-this.lastGround,0)/-p.y}reachOfLook(){return Math.max(LS,this.height*IS)}intoArea(p){let{minX:m,maxX:g,minZ:_,maxZ:x}=this.area;p.x=Mi.clamp(p.x,m-al,g+al),p.z=Mi.clamp(p.z,_-al,x+al)}keepInArea(){let p=this.camera.position,m=this.camera.getWorldDirection(new q),g=p.clone().addScaledVector(m,Math.min(this.wayDown(m),this.reachOfLook())),_=g.clone();this.intoArea(_),p.x+=_.x-g.x,p.z+=_.z-g.z}settle(p){this.keepInArea(),this.keepHeight(p===void 0?this.groundBelow():p)}keepHeight(p){if(p!==null)this.lastGround=p;let m=this.camera.position;m.y=Mi.clamp(m.y,this.lastGround+CS,this.lastGround+this.highest),this.height=m.y-this.lastGround}home(){if(!this.data)return;this.ride=null,this.onRideMoving(!1),this.placeCamera(this.data),this.moved(),this.tellRideMetre()}setRide(p,m){this.rideSpeed=p,this.rideHeight=m}setRideWatch(p,m){this.onRideMoving=p,this.onRideMetre=m}tellRideMetre(){let p=this.camera.position;this.onRideMetre(Eo(this.data?.route??[],p.x,p.z)?.metre??null)}rideLook(p,m){let g=this.data.route,[_,x]=xr(g,m,p),[y,v]=xr(g,m,p+rg),[b,S]=xr(g,m,p-rg);return(y!==_||v!==x?new q(y-_,0,v-x):new q(_-b,0,x-S)).normalize().setY(-qS).normalize()}onRoute(){if(this.ride)return this.ride;let p=this.data?.route??[],m=this.camera.position,g=jm(p),_=Eo(p,m.x,m.z)?.metre;if(_===void 0||!g[g.length-1])return null;this.flying.clear(),this.zoomLeft=0,this.ride={metre:_,metres:g,left:0,moving:!1},[m.x,m.z]=xr(p,g,_);let x=this.groundBelow();if(x!==null)this.lastGround=x;return m.y=this.lastGround+this.rideHeight,this.keepHeight(x),this.camera.lookAt(m.clone().add(this.rideLook(_,g))),this.moved(),this.onRideMetre(_),this.ride}rideBy(p){let m=this.onRoute();if(m)m.left+=p;return!!m}toggleRide(){let p=this.onRoute();if(!p)return!1;if(!p.moving&&p.metre>=p.metres[p.metres.length-1])p.metre=0;return p.moving=!p.moving,this.onRideMoving(p.moving),!0}stopRide(){if(!this.ride)return;this.ride=null,this.clearance=this.height,this.onRideMoving(!1),this.tellRideMetre()}rideOn(p){let m=this.ride,{metres:g}=m,_=g[g.length-1],x=this.camera.position,y=performance.now(),v=Math.abs(m.left)<ZS?m.left:m.left*(1-Math.exp(-p/YS)),b=m.metre;if(m.left-=v,m.metre=Mi.clamp(b+v+(m.moving?this.rideSpeed*p:0),0,_),m.metre<=0||m.metre>=_)m.left=0;if(m.moving&&m.metre>=_)m.moving=!1,this.onRideMoving(!1);let S=this.camera.getWorldDirection(new q),M=this.rideLook(m.metre,g),T=m.metre!==b,w=S.distanceToSquared(M)>$S,E=Math.abs(x.y-this.lastGround-this.rideHeight)>KS;if(!T&&!w&&!E)return;if(T||E){[x.x,x.z]=xr(this.data.route,g,m.metre);let A=this.groundBelow();if(A!==null)x.y+=(A+this.rideHeight-x.y)*(1-Math.exp(-p/og));this.keepHeight(A)}if(this.camera.lookAt(x.clone().add(S.lerp(M,1-Math.exp(-p/XS)))),this.moved(),y-this.rideTold>=JS||!m.left&&!m.moving)this.rideTold=y,this.onRideMetre(m.metre)}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let p=this.host.clientWidth,m=this.host.clientHeight;if(!p||!m)return;this.renderer.setSize(p,m),this.camera.aspect=p/m,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let p=performance.now(),m=Math.min(WS,(p-this.lastFrame)/1000);if(this.lastFrame=p,this.shown&&this.ride)this.rideOn(m);if(this.shown&&this.flying.size)this.fly(m);if(this.shown&&this.zoomLeft)this.glideZoom(m);if(!this.shown)return;if(this.followCopy(),this.dirty){this.dirty=!1;for(let g of this.meshes){let _=this.camera.position.distanceTo(g.geometry.boundingSphere.center);g.visible=_>=g.userData.lodIn&&_<g.userData.lodOut}this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&p-this.lastHover>=QS)this.hoverDue=!1,this.lastHover=p,this.hover();if(this.markDue&&p-this.lastMark>=this.markEvery){let g=performance.now();this.frameMarked(),this.lastMark=p,this.markEvery=Math.max(lg,4*(performance.now()-g))}}clear(){this.setCopy(null,null),this.copyVersion++,this.copyLoading?.abort(),this.stopRide();for(let p of this.meshes)this.scene.remove(p),p.geometry.boundsTree=void 0,p.geometry.dispose();for(let p of this.textures)p?.then((m)=>{if(!m)return;let g=m.image;if(m.dispose(),g instanceof ImageBitmap)g.close()},()=>{});for(let p of this.materials)p?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.pendingPivots.clear(),this.objectPieces=new Map,this.belonging=new Map,this.forgetPicks()}texture(p,m,g){let _=this.textures[g];if(!_){let x=Ms*m.textures[g].size,y=this.token;if(!ws(this.usedBytes,x,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=x;let v=this.renderer.capabilities.getMaxAnisotropy(),b=this.loading.signal;_=gM(()=>go(`/api/editor/${encodeURIComponent(p)}/texture/${g}?r=${m.revision}`,b).then((S)=>_M(S,m.textures[g].name,v))).then((S)=>{if(S.image instanceof ImageBitmap&&y===this.token){let M=$u(S.image.width,S.image.height)-x;if(!ws(this.usedBytes,M,this.settings.memoryGb))return this.usedBytes-=x,this.overLimit=!0,S.dispose(),S.image.close(),null;this.usedBytes+=M}return S}),this.textures[g]=_}return _}material(p,m,g){let _=this.materials[g];if(_)return _;let x=m.materials[g],y=Math.min(1,x.bright),v=new Sa({color:new se(y,y,y)});if(x.alpha_ref>0)v.alphaTest=x.alpha_ref;if(x.blend)v.transparent=!0,v.depthWrite=!1;this.materials[g]=v;let b=m.textures.findIndex((S)=>S.name===x.texture);if(b>=0){let S=this.token;this.texture(p,m,b).then((M)=>{if(!M||S!==this.token)return;v.map=M,v.needsUpdate=!0,this.dirty=!0},()=>{})}return v}addMesh(p,m,g,_){if(this.byNumber.has(g.i))return;let x=new nn(bM(g,_),this.material(p,m,g.material));if(x.userData={lodIn:g.lod_in,lodOut:g.lod_out,info:g},x.name=g.name,this.scene.add(x),this.meshes.push(x),g.base!==null&&g.base!==void 0){if(!this.parts.has(g.base))this.parts.set(g.base,[]);this.parts.get(g.base).push(x)}this.byNumber.set(g.i,x),this.laidOver(g.i);for(let y of this.listedOut.get(g.i)??[])this.leaveOutIn(x,y,!0);if(g.base!==null&&g.base!==void 0){for(let y of this.billboardsOut.get(g.base)??[])for(let v of this.piecesOf(y))if(v.mesh===g.i)this.leaveOutIn(x,v,!0);this.leaveOutSorts(x)}if(this.marked)this.markDue=!0;if(Qm.test(g.name)){this.groundVersion++,this.usedBytes+=mM(x),this.grounds.push(x);let y=x.geometry.boundingBox,v=this.camera.position;if(v.x>=y.min.x&&v.x<=y.max.x&&v.z>=y.min.z&&v.z<=y.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(p){let m=new q,g=new q(0,0,1);if(p.start)m.set(...p.start.pos),g.set(...p.start.forward).normalize();else if(p.meshes.length){for(let b of p.meshes)m.add(new q(...b.center));m.divideScalar(p.meshes.length)}this.camera.position.copy(m).addScaledVector(g,-AS).add(new q(0,mu,0)),this.camera.lookAt(m),this.camera.updateMatrixWorld(),this.clearance=this.height=mu,this.lastGround=m.y,this.zoomLeft=0,this.area=Tl(p.meshes.filter((b)=>!RS.test(b.name)));let{minX:_,maxX:x,minZ:y,maxZ:v}=this.area;this.highest=Math.min(zS,Math.max(sg,x-_,v-y))}}function SM({name:p,title:m,taken:g,built:_,visible:x,controls:y,fileHost:v,savedHost:b,toolsHost:S,notesHost:M,onStatus:T,onSaved:w}){let E=s(null),A=s(null),[P,D]=n(null),[R,C]=n(null);return i(()=>{let I=new vu(E.current);return I.setHover(C),D(I),()=>{I.dispose(),D(null)}},[]),i(()=>{P?.show(x)},[P,x]),i(()=>{P?.setControls(y)},[P,y]),i(()=>{P?.open(p,T)},[P,p,_,T]),e("div",{id:"scene",className:dl.scene,hidden:!x,ref:A,children:[t("div",{className:dl.view,ref:E}),P&&p&&t(Rd,{name:p,title:m,taken:g,view:P,scene:A,fileHost:v,savedHost:b,toolsHost:S,notesHost:M,elevationSpeed:y.elevationSpeed,reopen:()=>void P.open(p,T),onSaved:w},`${p} ${_}`),t(Pd,{hovered:R})]})}export{SM as default};
