import{h,o,i,l,s,n,p,c,a,r,t,e,d,u,f}from"./chunk-5pmwaq7p.js";var Nr={layout:"layout_u4kRgA",scene:"scene_u4kRgA",inspectorHost:"inspectorHost_u4kRgA",view:"view_u4kRgA"};var td=1,nd=2,id=4,jg=(m)=>(m.shiftKey?td:0)+(m.ctrlKey?nd:0)+(m.altKey?id:0);function Qg(m){return{shift:m.shiftKey,ctrl:m.ctrlKey&&!m.altKey,alt:m.altKey&&!m.ctrlKey,ctrlAlt:m.ctrlKey&&m.altKey}}function Oo(){let[m,g]=n(0);return i(()=>{let _=(v)=>g(jg(v)),x=()=>g(0),y=["keydown","keyup","pointermove"];for(let v of y)window.addEventListener(v,_);return window.addEventListener("blur",x),()=>{for(let v of y)window.removeEventListener(v,_);window.removeEventListener("blur",x)}},[]),Qg({shiftKey:(m&td)>0,ctrlKey:(m&nd)>0,altKey:(m&id)>0})}var Vn={options:"options_IcC4dw",controls:"controls_IcC4dw",title:"title_IcC4dw",place:"place_IcC4dw",key:"key_IcC4dw",held:"held_IcC4dw",number:"number_IcC4dw",on:"on_IcC4dw",value:"value_IcC4dw",note:"note_IcC4dw"};var Jt=(m,g)=>()=>{g(),m.focus()},Cl=[{keys:"Shift",held:"shift"},{keys:"Ctrl",held:"ctrl"},{keys:"Alt",held:"alt"},{keys:"Ctrl+Alt",held:"ctrlAlt"}];function t0({keys:m,held:g,children:_}){return e("span",{className:`${Vn.place}${g?` ${Vn.held}`:""}`,children:[t("kbd",{className:Vn.key,"aria-hidden":"true",children:m}),_]})}function Wn({id:m,title:g,note:_,options:x=[],actions:y}){let v=Oo();return e("div",{id:m,className:Vn.options,"data-tool-options":"",children:[e("div",{className:Vn.controls,children:[t("b",{className:Vn.title,children:g}),x.map((b,S)=>t(t0,{keys:Cl[S].keys,held:v[Cl[S].held],children:b},Cl[S].keys)),y]}),_&&t("span",{className:Vn.note,children:_})]})}function sd({label:m,hint:g,value:_}){return e("span",{className:Vn.number,title:g,children:[m," ",t("b",{className:Vn.value,children:_})]})}function yi({id:m,label:g,hint:_,onClick:x}){return t("button",{type:"button",id:m,title:_,onClick:x,children:g})}function Os({label:m,on:g,hint:_,onClick:x}){return t("button",{type:"button",className:g?Vn.on:"","aria-pressed":g,title:_,onClick:x,children:m})}function un({label:m,unit:g,hint:_,value:x,min:y,max:v,step:b,onChange:S}){return e("label",{className:Vn.number,title:_,children:[m," ",t("input",{type:"number",min:y,max:v,step:b,value:x,onChange:(M)=>S(M.target.valueAsNumber||0)})," ",g]})}var n0=2,i0=60;function rd({band:m,view:g}){let _=m.points.length;return t(Wn,{id:_?"edit-band":"edit-road-hint",title:"Smooth road",note:_===0?"Mark road: click the road where the stretch begins. Strength starts at 0%.":_===1?"A is set: add a point on the road. Further points can add side-road arms.":"Orange marks the selected roads; the faint area is the terrain transition. Add or drag points for branches. Changes apply automatically; 0% restores this step, Ctrl+Z undoes it, Esc ends it.",options:[t(un,{label:"Strength",unit:"%",hint:"From short waves only up to a calm joined surface across the selected roads (Shift + wheel)",min:0,max:100,step:5,value:m.strength,onChange:m.setStrength}),...m.line?[t(un,{label:"Transition",unit:"m",hint:"Minimum soft transition into the terrain. Large changes need a wider fade automatically (Ctrl + wheel)",min:n0,max:i0,value:Math.round(m.blend),onChange:m.setBlend},"blend")]:[]],actions:_?t(yi,{label:"Mark road",hint:"Keep the completed change and mark a new range, starting at 0%",onClick:Jt(g,m.clear)}):void 0})}var Pl=2,Il=500,Ll=0.5,Nl=10,Dl=100,s0=5,r0=25,o0=0.1,hs=(m,g,_,x,y)=>Math.min(y,Math.max(x,Math.round((m+g*Math.max(_,m*o0))/_)*_)),a0=(m)=>`${m} ${m===1?"object stands":"objects stand"} at the edge of it and stayed where ${m===1?"it is":"they are"}: its place lies outside.`;function od({view:m,edits:g,url:_,enabled:x,colour:y,turnedColour:v,body:b,onNote:S}){let[M,w]=n(s0),[E,A]=n(r0);i(()=>{m.setBrush(x?{radius:M,colour:y,turnedColour:v}:null)},[m,x,M,y,v]),i(()=>()=>m.setBrush(null),[m]);let T=(C,I)=>({samples:C,base:g.boundRevision(),radius:M,soft:E/100,...b(I)}),R=l((C,I)=>{let L=T(C,I);g.inTurn(async()=>{let U=await a(_,L),O=U.error||!U.height?U.error??"no answer":g.canEdit()?null:"this track can't be changed now";if(O)return m.dropPreview(),S(`Not changed: ${O}`);g.addHeight(U.height),S(U.standing?a0(U.standing):null)})}),P=l(async(C,I)=>{let L=await fetch(`${_}/preview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(T(C,I))}).catch(()=>null);if(!L)return null;if(L.ok)return L.arrayBuffer().catch(()=>null);return String((await L.json().catch(()=>null))?.error??L.status)}),N=l((C)=>S(`Not changed: ${C}`));return i(()=>(m.setStroke((C,I)=>R(C,I),(C,I)=>P(C,I),(C)=>N(C)),()=>m.setStroke(()=>{},()=>Promise.resolve(null),()=>{})),[m]),{radius:M,soft:E,setRadius:w,setSoft:A}}var l0=50,Ol=10,ld=300,cd=10,c0=3,Ul=1.5,ud=100,hd=0.5,u0=20,h0=0.2777777777777778,ad="This track has no route to go along";function dd({view:m,enabled:g,onNote:_}){let[x,y]=n(!1),[v,b]=n(null),[S,M]=n(l0),[w,E]=n(c0);return i(()=>{m.setRide(S*h0,w)},[m,S,w]),i(()=>(m.setRideWatch(y,b),()=>{m.stopRide(),m.setRideWatch(()=>{},()=>{})}),[m]),i(()=>{if(g)m.tellRideMetre();else m.stopRide()},[m,g]),{moving:x,metre:v,speed:S,height:w,setSpeed:M,setHeight:E,toggle:()=>_(m.toggleRide()?null:ad),wheel:(A,T)=>{if(A==="shift")_(m.rideBy(T*u0)?null:ad);else if(A==="ctrl")E((R)=>hs(R,T,hd,Ul,ud));else if(A==="alt")M((R)=>hs(R,T,cd,Ol,ld))}}}function fd({camera:m,view:g}){return t(Wn,{id:"edit-camera-set",title:"Road camera",note:"Shift + wheel goes along the track from the place nearest the camera. W A S D or the mouse leave it, Esc ends it.",options:[t(sd,{label:"Along the track",hint:"How far along the track it is (Shift + wheel: forwards, backwards)",value:m.metre===null?"no route":`${Math.round(m.metre)} m`}),t(un,{label:"Height",unit:"m",hint:"How far above the ground it goes along the track (Ctrl + wheel)",min:Ul,max:ud,step:hd,value:m.height,onChange:(_)=>m.setHeight(Math.max(Ul,_))}),t(un,{label:"Speed",unit:"km/h",hint:"How fast Ride goes (Alt + wheel)",min:Ol,max:ld,step:cd,value:m.speed,onChange:(_)=>m.setSpeed(Math.max(Ol,_))})],actions:e(r,{children:[t(yi,{id:"edit-ride",label:m.moving?"Pause":"Ride",hint:"It rides along the track by itself from where it is",onClick:Jt(g,m.toggle)}),t(yi,{id:"edit-home",label:"Reset",hint:"Back to the first view, behind the start (Home)",onClick:Jt(g,()=>g.home())})]})})}var Or={x:0,y:0,z:0,turn:0,scale:1};var pd=(m,g,_)=>Math.min(_,Math.max(g,m)),Dr=(m,g)=>Math.round(m*10**g)/10**g,Us=(m)=>({id:m,...Or}),md=(m)=>!m.x&&!m.y&&!m.z&&!m.turn&&m.scale===1;function ai(m,g){let _=m.x+(g.x??0),x=m.z+(g.z??0),y=Math.hypot(_,x);if(y>1000)[_,x]=[_*1000/y,x*1000/y];let v=(m.turn+(g.turn??0))%360;if(v>180)v-=360;if(v<=-180)v+=360;return{id:m.id,x:Dr(_,3),y:Dr(pd(m.y+(g.y??0),-100,100),3),z:Dr(x,3),turn:Dr(v,2),scale:Dr(pd(m.scale*(g.scale??1),0.1,10),4)}}function gd(m,g){return{x:g.x-m.x,y:g.y-m.y,z:g.z-m.z,turn:g.turn-m.turn,scale:g.scale/m.scale}}function Fl(m,g,_,x,y,v){let b=v.turn*Math.PI/180,S=Math.cos(b),M=Math.sin(b),[w,E,A]=y;for(let T=0;T<_.length;T++){let R=T*x,P=_[T]*x;g.set(m.subarray(R,R+x),P);let N=(m[R]-w)*v.scale,C=(m[R+1]-E)*v.scale,I=(m[R+2]-A)*v.scale;g[P]=w+S*N+M*I+v.x,g[P+1]=E+C+v.y,g[P+2]=A-M*N+S*I+v.z;for(let L of[3,8]){let U=m[R+L],O=m[R+L+2];g[P+L]=S*U+M*O,g[P+L+2]=-M*U+S*O}}}function _d({name:m,edits:g,view:_,picked:x,onWheel:y}){let[v,b]=n(null),[S,M]=n(null),[w,E]=n(()=>Us(""));i(()=>(y((P,N)=>E((C)=>ai(C,P==="shift"?{turn:N*5}:P==="ctrl"?{y:N*0.1}:P==="alt"?{scale:1.05**N}:{}))),()=>y(()=>{})),[y]);let A=x?.id??null;i(()=>{if(v||!A||!_.canMove(A))return;let P=!0;return g.inTurn(async()=>{g.saveNow();let N=await g.saved();if(!P||N===null||!g.canEdit())return;let C=await a(`/api/editor/${encodeURIComponent(m)}/copy`,{base:g.boundRevision(),revision:N,object:A});if(!P)return;if(C.error||!C.template||!C.at||!C.kind)M(C.error??"Could not copy this object");else b({template:C.template,at:C.at,kind:C.kind,source:A}),M(null),_.unpick()}),()=>{P=!1}},[m,A,g,_,v]);let T=l((P)=>{if(!v)return;let N=v.template,C={turn:w.turn,y:w.y,scale:w.scale};g.inTurn(async()=>{if(!g.canEdit())return;g.saveNow();let I=await g.saved();if(I===null)return;let L=await a(`/api/editor/${encodeURIComponent(m)}/copy`,{base:g.boundRevision(),revision:I,template:N,at:P,pose:C});if(L.error||!L.copy)M(L.error??"Could not place the copy");else g.addCopy(L.copy),M(null)})});i(()=>(_.setCopy(v?.source??null,v?(P)=>T(P):null,v?.at),()=>_.setCopy(null,null)),[_,v]),i(()=>{_.setCopyPose(w)},[_,w,v]);let R=S??(v?`Click to place ${v.kind}; keep clicking for more copies. Esc ends Copy.`:A&&!_.canMove(A)?"A power line goes with its poles; pick an object to copy.":A?"Preparing the copy …":"Click an object to copy it, then click where to place it. Esc ends Copy.");return t(Wn,{id:"edit-copy-set",title:"Copy",note:R,options:[t(un,{label:"Turn",unit:"°",hint:"Turn each copy from the source (Shift + wheel)",min:-180,max:180,step:5,value:w.turn,onChange:(P)=>E((N)=>ai({...N,turn:P},{}))}),t(un,{label:"Height",unit:"cm",hint:"Raise each copy above the clicked ground (Ctrl + wheel)",min:-1e4,max:1e4,step:10,value:Math.round(w.y*100),onChange:(P)=>E((N)=>ai({...N,y:P/100},{}))}),t(un,{label:"Size",unit:"%",hint:"Size of each copy against its source (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(w.scale*100),onChange:(P)=>E((N)=>ai({...N,scale:P/100},{}))})],actions:v&&t(yi,{label:"Choose another",hint:"Pick a different source object",onClick:Jt(_,()=>{b(null),M(null),_.unpick()})})})}var Ur=(m)=>m.map((g)=>JSON.stringify(g));var d0=400,f0=5000,p0=200,m0=60000,g0=64,_0=1000,x0="This track was changed elsewhere: another tab or a build.",xd="This track was built again: the view shows the build before.",Bl={removed:[],sorts:[],objectSorts:[],heights:[],placed:[],copies:[],paints:[]},Xn=(m,g)=>{let _=new Set(m),x=new Set(g);return _.size===x.size&&[..._].every((y)=>x.has(y))},Uo=(m)=>m.map((g)=>[g.id,g.x,g.y,g.z,g.turn,g.scale].join(" "));function Fo(m){let g=m.recipe;return!!g&&!g.needsSave&&Xn(m.removed.map((_)=>_.id),g.deleted)&&Xn(m.sorts,g.sorts)&&Xn(m.objectSorts,g.objectSorts)&&Xn(m.heights.map((_)=>_.id),g.heights)&&Xn(Uo(m.placed),Uo(g.placed))&&Xn(Ur(m.copies),Ur(g.copies??[]))&&JSON.stringify(m.paints??[])===JSON.stringify(g.paints??[])}var Fr=null,kl=(m,g)=>Xn(m.removed.map((_)=>_.id),g.removed.map((_)=>_.id))&&Xn(m.sorts,g.sorts)&&Xn(m.objectSorts,g.objectSorts)&&Xn(m.heights.map((_)=>_.id),g.heights.map((_)=>_.id))&&Xn(Uo(m.placed),Uo(g.placed))&&Xn(Ur(m.copies),Ur(g.copies))&&JSON.stringify(m.paints)===JSON.stringify(g.paints);class zl{now={...Bl,keptRevision:0,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};onTextures=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];joining=null;listeners=new Set;url;send;name;constructor(m,g=(_,x)=>fetch(_,x)){this.name=m,this.url=`/api/editor/${encodeURIComponent(m)}/edits`,this.send=g}markSaved(){let m=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:m.removed.map((g)=>g.id),sorts:m.sorts,objectSorts:m.objectSorts,heights:m.heights.map((g)=>g.id),placed:m.placed,copies:m.copies,paints:m.paints}})}inTurn(m){return this.turns=this.turns.then(m).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(m){this.onMeshes=m}setOnTextures(m){this.onTextures=m}handOver(m){Fr={name:m,edits:this.edits(),past:this.past,future:this.future}}subscribe=(m)=>(this.listeners.add(m),()=>{this.listeners.delete(m)});state=()=>this.now;set(m){this.now={...this.now,...m};for(let g of this.listeners)g()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(m){this.held=m,this.set({})}bind(m){this.bound=m,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:xd});else if(this.now.error===xd)this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let m=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let g=await this.send(this.url),_=await g.json();if(m!==this.asked)return;if(!g.ok)throw Error(_.error??`${g.status}`);this.base=_.base,this.revision=_.revision;let x={removed:_.deleted,sorts:_.sorts??[],objectSorts:_.object_sorts??[],heights:_.heights??[],placed:_.placed??[],copies:_.copies??[],paints:_.paints??[]},y=Fr?.name===this.name&&kl(Fr.edits,x)?Fr:null;Fr=null,this.past=y?.past??[],this.future=y?.future??[],this.onServer=x,this.unanswered=[];let v=_.saved,b=v?{at:v.at,deleted:v.deleted,sorts:v.sorts,objectSorts:v.object_sorts,heights:v.heights??[],placed:v.placed??[],copies:v.copies??[],paints:v.paints??[],needsSave:!!v.needs_save}:null;this.set({...x,keptRevision:_.revision,recipe:b,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:_.outdated,save:"saved"}),this.compare()}catch(g){if(m===this.asked)this.set({save:"stuck",error:g.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((m)=>setTimeout(m,50));return this.isSaved()?this.revision:null}saveNow(m=!1){clearTimeout(this.timer),this.flush(m)}remove(m){let g=new Set(this.now.removed.map((_)=>_.id));this.change({...this.edits(),removed:[...this.now.removed,...m.filter((_)=>!g.has(_.id))]})}removeSelected(m,g){let _=new Set(this.now.removed.map((x)=>x.id));this.change({...this.edits(),removed:[...this.now.removed,...m.filter((x)=>!_.has(x.id))],sorts:[...new Set([...this.now.sorts,...g.filter((x)=>x.tree).map((x)=>x.sort)])],objectSorts:[...new Set([...this.now.objectSorts,...g.filter((x)=>!x.tree).map((x)=>x.sort)])]})}removeSort(m){if(!this.now.sorts.includes(m))this.change({...this.edits(),sorts:[...this.now.sorts,m]})}removeObjectSort(m){if(!this.now.objectSorts.includes(m))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,m]})}addHeight(m){this.change({...this.edits(),heights:[...this.now.heights,m]})}replaceHeight(m,g,_){if(!this.canEdit()||m&&!this.now.heights.some((y)=>y.id===m))return!1;let x={...this.edits(),heights:[...this.now.heights.filter((y)=>y.id!==m),...g?[g]:[]]};if(kl(x,this.edits()))return!0;if(_&&this.past.length){if(kl(x,this.past.at(-1)))this.past.pop();this.future=[],this.apply(x)}else this.change(x);return!0}addCopy(m){this.change({...this.edits(),copies:[...this.now.copies,m]})}addPaint(m){if(this.now.paints.at(-1)===m)return;this.change({...this.edits(),paints:[...this.now.paints.filter((g)=>g!==m),m]})}place(m,g){let _=new Set(m.map((v)=>v.id)),x=performance.now(),y=[...this.now.placed.filter((v)=>!_.has(v.id)),...m.filter((v)=>!md(v))];if(!!g&&this.joining?.key===g&&x-this.joining.at<_0&&this.past.length>0&&this.canEdit())this.past.pop();this.change({...this.edits(),placed:y},g?{key:g,at:x}:null)}placementOf(m){return this.now.placed.find((g)=>g.id===m)}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0||this.now.placed.length>0||this.now.copies.length>0||this.now.paints.length>0}discard(){if(this.changed())this.change(Bl)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights,placed:this.now.placed,copies:this.now.copies,paints:this.now.paints}}discardOutdated(){this.onServer=null,this.set({outdated:0,...Bl}),this.saveNow()}undo(){if(!this.canEdit())return;this.joining=null;let m=this.past.pop();if(!m)return;this.future.push(this.edits()),this.apply(m)}redo(){if(!this.canEdit())return;this.joining=null;let m=this.future.pop();if(!m)return;this.past.push(this.edits()),this.apply(m)}change(m,g=null){if(!this.canEdit())return;if(this.joining=g,this.past.push(this.edits()),this.past.length>p0)this.past.shift();this.future=[],this.apply(m)}apply(m){let g=m.heights===this.now.heights&&m.placed===this.now.placed&&m.copies===this.now.copies&&m.paints===this.now.paints?d0:0;this.set({...m,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),g)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights&&this.now.placed===this.onServer?.placed&&this.now.copies===this.onServer?.copies&&this.now.paints===this.onServer?.paints}async flush(m=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!m||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let g=this.edits(),_=++this.sent,x=`${Date.now()}-${_}-${Math.random().toString(36).slice(2,10)}`,y=JSON.stringify({base:this.bound,revision:this.revision,deleted:g.removed,sorts:g.sorts,object_sorts:g.objectSorts,heights:g.heights,placed:g.placed,copies:g.copies,paints:g.paints,id:x,unanswered:this.unanswered.map((v)=>v.id)});this.unanswered=[...this.unanswered,{id:x,number:_}].slice(-g0),this.sending=!0,this.set({save:"saving"});try{let v=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:y,keepalive:m&&y.length<m0}),b=await v.json().catch(()=>({}));if(_>=this.sent)this.sending=!1;if(_<this.answered)return;if([400,404,409,413].includes(v.status))return this.sending=!1,this.set({save:"stuck",error:v.status===409?x0:b.error??`${v.status}`});if(!v.ok)throw Error(b.error??`${v.status}`);if(this.answered=_,this.revision=b.revision,this.onServer=g,this.unanswered=this.unanswered.filter((S)=>S.number>_),this.onMeshes(b.meshes??[],b.revision),this.onTextures(b.textures??[],g.paints),this.set({keptRevision:b.revision}),!this.isSaved())return void this.flush(m);if(!this.sending)this.set({save:"saved",error:null})}catch(v){if(_>=this.sent)this.sending=!1;if(this.set({save:"failed",error:v.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),f0)}}}var pn={notes:"notes_L1L6kQ",line:"line_L1L6kQ"};function Hl(m){let g={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[_,,x],radius:y}of m)g.minX=Math.min(g.minX,_-y),g.maxX=Math.max(g.maxX,_+y),g.minZ=Math.min(g.minZ,x-y),g.maxZ=Math.max(g.maxZ,x+y);return m.length?g:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function Gl(m,g){let _=new Map(m.map((x)=>[x,Math.hypot(x.center[0]-g[0],x.center[1]-g[1],x.center[2]-g[2])-x.radius]));return[...m].sort((x,y)=>_.get(y)-_.get(x))}function Qn(m,g,_){return m+g<=_*1073741824}function Vl(m,g){return Math.round(m*g*4*2.333333333333333)}function yd(m,g){return[Math.floor(m/256),Math.floor(-g/256)]}function Bo(m,g,_){if(m.length<2)return null;let x=1/0,y=0,v=0;for(let b=0;b+1<m.length;b++){let[S,M]=m[b],w=m[b+1][0]-S,E=m[b+1][1]-M,A=w*w+E*E,T=Math.sqrt(A),R=A?Math.min(1,Math.max(0,((g-S)*w+(_-M)*E)/A)):0,P=Math.hypot(g-(S+R*w),_-(M+R*E));if(P<x)x=P,y=v+R*T;v+=T}return{metre:y,off:x}}function vd([m,g],_,x,y){let v=Math.PI/180,b=_,S=-y,M=x,w=Math.sin(m*v),E=Math.cos(m*v),A=Math.sin(g*v),T=Math.cos(g*v),R=6378137/Math.sqrt(1-0.0066943799901413165*w*w),P=R*E*T-A*b-w*T*S+E*T*M,N=R*E*A+T*b-w*A*S+E*A*M,C=R*0.9933056200098587*w+E*S+w*M,I=Math.hypot(P,N),L=Math.atan2(C,I*0.9933056200098587);for(let U=0;U<5;U++){let O=Math.sin(L);L=Math.atan2(C+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*O*O))*O,I)}return[L/v,Math.atan2(N,P)/v]}function Br(m,g){return Math.floor((g+m)/8)}function ko(m,g,_){return[Math.max(0,m*8-g),Math.min(_,(m+1)*8-g)]}var v0={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},zo=(m)=>v0[m]??m,b0={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},li=(m)=>b0[m]??zo(m),Wl=new Set(["house"]),kr=(m,g)=>m.sorts?.[g]??m.kinds[g];function Fs(m,g){let _=[];if(!g.size)return _;for(let[x,y]of Object.entries(m))y.kinds.forEach((v,b)=>{if(g.has(kr(y,b)))_.push(`${x}#${b}`)});return _}function Xl(m,g){let _=new Set,x=[...m];while(x.length){let y=x.pop();if(_.has(y))continue;_.add(y),x.push(...g.get(y)??[])}return _}function bd(m,g,_){let x=0;for(let[y,v]of Object.entries(m))v.kinds.forEach((b,S)=>{if(kr(v,S)===g&&v.faces[S].length&&!_.has(`${y}#${S}`))x++});return x}function ql(m){let g=new Map;for(let[_,x]of Object.entries(m)){x.parents.forEach((y,v)=>{if(y<0)return;let b=`${_}#${y}`;if(!g.has(b))g.set(b,[]);g.get(b).push(`${_}#${v}`)});for(let[y,v]of Object.entries(x.with??{})){let b=`${_}#${y}`;g.set(b,[...g.get(b)??[],...v])}}return g}function Yl(m){let g=new Map;for(let[_,x]of Object.entries(m))x.faces.forEach((y,v)=>{for(let[b,S,M]of y){if(!g.has(b))g.set(b,[]);g.get(b).push({from:S,end:S+M,id:`${_}#${v}`})}});for(let _ of g.values())_.sort((x,y)=>x.from-y.from);return g}function Sd(m,g){let _=0,x=(m?.length??0)-1;while(_<=x){let y=_+x>>1,v=m[y];if(g<v.from)x=y-1;else if(g>=v.end)_=y+1;else return v.id}return null}function $l(m,g,_){let x=Math.floor((g-Math.floor(g))*m.cols),y=Math.floor((_-Math.floor(_))*m.rows);return m.sprites[y*m.cols+x]??null}var S0=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],M0=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function Md(m){return S0.find(([g])=>g.test(m))?.[1]??"Unknown"}function wd(m){return M0.find(([g])=>g.test(m))?.[1]??m}var w0=(m)=>`${m} ${m===1?"object":"objects"} deleted`,E0=(m)=>`${m} height ${m===1?"change":"changes"}`,T0=(m)=>`${m} ${m===1?"object":"objects"} moved`;function Ed({state:m,edits:g,view:_,note:x,viewFailed:y,saveFailed:v,markedName:b,picked:S,sort:M,reopen:w,readAgain:E}){let A=(R)=>Jt(_,R),T=S?.all.length??0;return e("div",{id:"edit-notes",className:pn.notes,children:[m.save==="failed"&&t("p",{id:"edit-kept",className:pn.line,children:"Changes not kept: trying again"}),x&&t("p",{id:"edit-tool-note",className:pn.line,children:x}),y&&e("p",{id:"edit-view-failed",className:pn.line,children:["The view doesn't show the last change, it is kept all the same: ",y," ",t("button",{type:"button",onClick:A(w),children:"Load again"})]}),m.heights.length>0&&t("p",{id:"edit-heights",className:pn.line,children:E0(m.heights.length)}),m.placed.length>0&&t("p",{id:"edit-placed",className:pn.line,children:T0(m.placed.length)}),m.removed.length>0&&t("p",{id:"edit-count",className:pn.line,children:w0(m.removed.length)}),m.copies.length>0&&e("p",{id:"edit-copies",className:pn.line,children:[m.copies.length," ",m.copies.length===1?"copy":"copies"]}),m.paints.length>0&&e("p",{id:"edit-paints",className:pn.line,children:[m.paints.length," material ",m.paints.length===1?"change":"changes"]}),(m.sorts.length>0||m.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:pn.line,children:["All deleted: ",[...m.sorts,...m.objectSorts.map(li)].join(", ")]}),b&&e("p",{id:"edit-marked",className:pn.line,children:["All ",b," marked: X or Delete deletes them all, Esc ends it."]}),T>1&&!b&&e("p",{id:"edit-picked",className:pn.line,children:[T," objects picked: X or Delete deletes them all."]}),S&&T<2&&!b&&e("p",{id:"edit-picked",className:pn.line,children:[S.kind,S.sprite&&` · ${S.sprite}`,M&&li(M)!==S.kind&&` · ${li(M)}`,!S.id&&(S.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),v&&t("p",{id:"edit-made",className:pn.line,children:v}),m.outdated>0&&e("p",{id:"edit-outdated",className:pn.line,children:[m.outdated," older ",m.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",m.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:A(()=>g.discardOutdated()),children:"Give up"})]}),m.save==="stuck"&&e("p",{id:"edit-stuck",className:pn.line,children:[m.error," ",t("button",{type:"button",onClick:A(E),children:"Read again"})]})]})}var Td=10,A0=5,Cd=1,Pd=1e4,Ad="#ff8a1f",Rd="#2f8bff",R0=5;function Id({name:m,view:g,edits:_,enabled:x,speed:y,onNote:v}){let[b,S]=n(A0),[M,w]=n(!1),E=od({view:g,edits:_,url:`/api/editor/${encodeURIComponent(m)}/brush`,enabled:x,onNote:v,colour:M?Rd:Ad,turnedColour:M?Ad:Rd,body:(A)=>({mm:Math.round(b*Td)*(M!==A?-1:1),speed:Math.round(y*Td)})});return{...E,height:b,lower:M,setHeight:S,setLower:w,wheel:(A,T)=>{if(A==="ctrl")E.setRadius((R)=>hs(R,T,Ll,Pl,Il));else if(A==="alt")S((R)=>hs(R,T,1,Cd,Pd));else if(A==="ctrlAlt")E.setSoft((R)=>hs(R,T,R0,Nl,Dl))}}}function Ld({elevation:m,view:g}){let{shift:_}=Oo();return t(Wn,{id:"edit-elevation-set",title:"Elevation",options:[e(r,{children:[t(Os,{label:"Raise",on:m.lower===_,hint:"It raises the ground (Shift: the other way)",onClick:Jt(g,()=>m.setLower(!1))}),t(Os,{label:"Lower",on:m.lower!==_,hint:"It lowers the ground (Shift: the other way)",onClick:Jt(g,()=>m.setLower(!0))})]}),t(un,{label:"Radius",unit:"m",hint:"How far it reaches, the ring on the ground (Ctrl + wheel)",min:Pl,max:Il,step:Ll,value:m.radius,onChange:m.setRadius}),t(un,{label:"Height",unit:"cm",hint:"How far one click moves the ground, at its middle (Alt + wheel)",min:Cd,max:Pd,value:m.height,onChange:m.setHeight}),t(un,{label:"Soft edge",unit:"%",hint:"How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge (Ctrl + Alt + wheel)",min:Nl,max:Dl,step:10,value:m.soft,onChange:m.setSoft})]})}var Nd=5,Dd=0.1,C0=1.05,Zl=100,Od=100;function Ud({name:m,view:g,edits:_,state:x,enabled:y,picked:v,onNote:b}){let S=y?(v?.all??[]).map((P)=>P.id).filter((P)=>g.canMove(P)):[],M=(P)=>_.placementOf(P)??Us(P),w=S.length?M(v?.id&&S.includes(v.id)?v.id:S[0]):Us(""),E=(P,N)=>{if(!S.length||!_.canEdit())return;_.inTurn(()=>{if(!_.canEdit())return;let C=S.map((I)=>P(M(I)));C.forEach((I,L)=>g.nudge([S[L]],gd(M(S[L]),I))),_.place(C,N&&`${N} ${S.join()}`)})},A=l((P)=>{let N=P.map((C)=>C.id);if(!_.canEdit())return g.rejectMove(N);if(!x.heights.length){_.place(P.map(({id:C,...I})=>ai(M(C),I))),b(null);return}_.inTurn(async()=>{let C=!1;try{if(!_.canEdit())return;_.saveNow();let I=await _.saved();if(I===null||!_.canEdit())return;let L=P.map(({id:O,...F})=>ai(M(O),F)),U=await a(`/api/editor/${encodeURIComponent(m)}/move`,{base:_.boundRevision(),revision:I,placed:L});if(U.error||!U.placed)b(U.error??"Could not move the objects");else if(_.canEdit())_.place(U.placed),C=!0,b(null)}finally{if(!C)g.rejectMove(N)}})});i(()=>(g.setMove(y,(P)=>A(P)),()=>g.setMove(!1,()=>{})),[g,y]),i(()=>{g.setPlaced(x.placed)},[g,x.placed]);let T=(P,N)=>E((C)=>ai(C,P),N),R=(P,N)=>E((C)=>ai({...C,[P]:N},{}));return{ids:S,shown:w,setTurn:(P)=>R("turn",P),setHeight:(P)=>R("y",P/Zl),setSize:(P)=>R("scale",P/Od),reset:()=>{_.inTurn(()=>{if(S.length&&_.canEdit())_.place(S.map(Us))})},wheel:(P,N)=>{if(!S.length)return b("Pick an object first: click it, Ctrl + click adds more");if(P==="shift")T({turn:N*Nd},"turn");else if(P==="ctrl")T({y:N*Dd},"height");else if(P==="alt")T({scale:C0**N},"size")}}}function Fd({move:m,view:g}){let _=!m.ids.length;return t(Wn,{id:"edit-move-set",title:"Move",note:_?"Click an object to pick it, drag it to move it; Ctrl + click adds more.":void 0,options:[t(un,{label:"Turn",unit:"°",hint:"How far it is turned from how it was built, counter-clockwise (Shift + wheel)",min:-180,max:180,step:Nd,value:m.shown.turn,onChange:m.setTurn}),t(un,{label:"Height",unit:"cm",hint:"How far it is raised from where it was built (Ctrl + wheel)",min:-1e4,max:1e4,step:Dd*Zl,value:Math.round(m.shown.y*Zl),onChange:m.setHeight}),t(un,{label:"Size",unit:"%",hint:"Its size, against how it was built (Alt + wheel)",min:10,max:1000,step:5,value:Math.round(m.shown.scale*Od),onChange:(x)=>m.setSize(Math.max(10,x))})],actions:t(yi,{id:"edit-move-reset",label:"Reset",hint:"Back where and as it was built",onClick:Jt(g,m.reset)})})}var ds={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function I0(m,g){for(let _=1;;_++){let x=`${m} (copy${_>1?` ${_}`:""})`;if(!g.includes(x))return x}}function Bd({title:m,taken:g,canOverwrite:_,onOverwrite:x,onSaveNew:y,onCancel:v}){let[b,S]=n(m),M=b.trim(),w=M===m,E=!M?"Give it a name.":!w&&g.includes(M)?`Another track is called “${M}” already.`:null,A=w?I0(m,g):M;return i(()=>{let T=(R)=>{if(R.key==="Escape")v()};return document.addEventListener("keydown",T),()=>document.removeEventListener("keydown",T)},[v]),t("div",{id:"save-back",className:ds.back,onMouseDown:(T)=>{if(T.target===T.currentTarget)v()},children:e("form",{id:"save-dialog",className:ds.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(T)=>{if(T.preventDefault(),!E)y(A)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:ds.field,children:["Name",t("input",{id:"save-name",type:"text",value:b,maxLength:80,autoFocus:!0,onChange:(T)=>S(T.target.value)})]}),t("p",{id:"save-taken",className:ds.note,children:E??`Save as new track makes “${A}”. Whatever you delete can be brought back later.`}),e("div",{className:ds.buttons,children:[t("button",{type:"button",onClick:v,children:"Cancel"}),t("button",{type:"button",disabled:!w||!_,onClick:x,children:"Overwrite"}),t("button",{type:"submit",className:ds.primary,disabled:!!E,children:"Save as new track"})]})]})})}var qn={tools:"tools_oZyV8A",fileButtons:"fileButtons_oZyV8A",group:"group_oZyV8A",title:"title_oZyV8A",row:"row_oZyV8A",split:"split_oZyV8A",on:"on_oZyV8A",picker:"picker_oZyV8A",key:"key_oZyV8A"};var Kl=(m)=>m.removed.length>0||m.sorts.length>0||m.objectSorts.length>0||m.heights.length>0||m.placed.length>0||m.copies.length>0||m.paints.length>0,Jl=(m)=>!Kl(m)&&!m.recipe,N0=(m)=>new Date(m*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function kd({name:m,edits:g,state:_,view:x,onSaved:y}){let[v,b]=n(null),[S,M]=n({busy:!1,text:null}),{starting:w,play:E}=f(),A=Fo(_),T=Jl(_),R=g.canEdit()&&!S.busy&&!A&&!T,P=async(N=null)=>{b(null),M({busy:!0,text:null}),await g.settled(),g.hold(!0),g.saveNow();let C=await g.saved();if(C===null)return g.hold(!1),M({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let I=await a(`/api/editor/${encodeURIComponent(m)}/save`,{copy:N!==null,title:N,revision:C});if(g.hold(!1),I.error||!I.name)return M({busy:!1,text:`Not saved: ${I.error??"no answer"}`}),null;if(M({busy:!1,text:null}),N!==null)g.handOver(I.name);else g.markSaved();return y(I.name),I.name};return{asking:v,canSave:R,starting:w,busy:S.busy,failed:S.text,savedText:S.busy?"Saving …":A?`Saved ${N0(_.recipe.at)}`:T?"":"Not saved",canPlay:!w&&!S.busy&&_.save!=="loading"&&(A||T||R),saveAs:()=>b({play:!1}),chosen:async(N)=>{x.focus();let C=v?.play,I=await P(N);if(I&&C)E(I)},cancel:o(()=>{b(null),x.focus()},[x]),save:async()=>{await g.settled();let N=g.state();if(!g.canEdit()||S.busy||Fo(N)||Jl(N))return;if(N.recipe)P();else b({play:!1})},drive:async()=>{await g.settled();let N=g.state();if(Fo(N)||Jl(N))E(m);else if(!N.recipe)b({play:!0});else if(await P())E(m)}}}var Ql=[{tool:"select",group:"general",id:"edit-select",label:"Select",key:"V",hint:"Click an object to pick it, Ctrl + click adds more, Shift + click selects all matching, X or Delete takes them out; a right click marks all of its sort (V)"},{tool:"camera",group:"general",id:"edit-camera",label:"Road camera",key:"K",hint:"Go along the track by the wheel or riding by itself, back to the first view (K; Esc ends it)"},{tool:"smooth",group:"terrain",id:"edit-smooth",label:"Smooth road",key:"T",hint:"Mark road points, add branches if needed, then increase strength from 0%. Changes apply automatically; Esc ends it, Ctrl+Z undoes it (T)"},{tool:"elevation",group:"terrain",id:"edit-elevation",label:"Elevation",key:"H",hint:"Raise or lower the ground: click, or hold and move (H; Esc ends it)"},{tool:"move",group:"objects",id:"edit-move",label:"Move",key:"M",hint:"Drag an object to move it; Shift, Ctrl, Alt with the wheel turn, raise and size what is picked (M; Esc ends it)"},{tool:"copy",group:"objects",id:"edit-copy",label:"Copy",key:"C",hint:"Pick an object, then click to place copies repeatedly (C; Esc ends it)"},{tool:"delete",group:"objects",id:"edit-click-deletes",label:"Delete",key:"X",hint:"Each click deletes what is under it, Ctrl+Z brings it back (X, with nothing picked; Esc ends it)"}];function jl({title:m,children:g}){return e("section",{className:qn.group,children:[t("h3",{className:qn.title,children:m}),g]})}function zd({state:m,edits:g,view:_,saving:x}){let y=(v)=>Jt(_,v);return e("div",{className:`${qn.tools} ${qn.fileButtons}`,children:[e("div",{className:qn.row,children:[e("span",{className:qn.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!x.canSave,onClick:y(()=>void x.save()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!g.canEdit()||x.busy,onClick:x.saveAs,children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!x.canPlay,title:"Save if needed, then drive it in Assetto Corsa",onClick:y(()=>void x.drive()),children:x.starting?"Starting …":"▶ Play"})]}),t("button",{type:"button",disabled:!Kl(m)||!g.canEdit()||x.busy,title:"Restore the track as built, taking back all Editor changes",onClick:y(()=>{if(confirm(`Discard all Editor changes and restore the track as built?

This includes previously saved edits. Save to apply it to Assetto Corsa; Undo brings the edits back.`))g.inTurn(()=>g.discard())}),children:"Discard all"})]})}function Hd({state:m,edits:g,view:_,tool:x,onTool:y}){let v=g.canEdit(),b=(E)=>Jt(_,E),S=(E)=>E==="select"||E==="camera",M=v||S(x)?x:"select",w=(E)=>t("div",{className:qn.picker,children:Ql.filter((A)=>A.group===E).map((A)=>e("button",{type:"button",id:A.id,className:M===A.tool?qn.on:"","aria-pressed":M===A.tool,disabled:!v&&!S(A.tool),title:A.hint,onClick:b(()=>y(A.tool)),children:[A.label,t("span",{className:qn.key,"aria-hidden":"true",children:A.key})]},A.tool))});return e("div",{id:"edit-bar",className:qn.tools,"data-kept":m.save,children:[e(jl,{title:"General",children:[e("div",{id:"edit-history",className:qn.row,children:[t("button",{type:"button",disabled:!m.canUndo||!v,title:"Ctrl+Z",onClick:b(()=>void g.inTurn(()=>g.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!m.canRedo||!v,title:"Ctrl+Shift+Z",onClick:b(()=>void g.inTurn(()=>g.redo())),children:"↷ Redo"})]}),w("general")]}),t(jl,{title:"Terrain",children:w("terrain")}),t(jl,{title:"Objects",children:w("objects")})]})}var Ho=0;class ec{edits;request;epoch=0;owned=null;joined=!1;key=null;constructor(m,g){this.edits=m;this.request=g}cancel(){this.epoch++}reset(){this.cancel(),this.owned=null,this.joined=!1,this.key=null}async update(m,g,_){let x=this.edits.state();if(this.owned&&!x.heights.some((S)=>S.id===this.owned))return this.reset(),{state:"undone"};let y=JSON.stringify([m,g,_,x.heights.filter((S)=>S.id!==this.owned).map((S)=>S.id),x.placed,x.copies]);if(y===this.key)return{state:"unchanged"};let v=++this.epoch,b={state:"cancelled"};return await this.edits.inTurn(async()=>{try{this.edits.saveNow();let S=await this.edits.saved(),M=this.edits.boundRevision();if(v!==this.epoch)return;if(S===null||!M||!this.edits.canEdit())throw Error("The current changes could not be kept");if(this.owned&&!this.edits.state().heights.some((E)=>E.id===this.owned)){this.reset(),b={state:"undone"};return}if(_===0&&!this.owned){this.key=y,b={state:"unchanged"};return}let w=_===0?{}:await this.request({base:M,revision:S,points:m,blend:g,strength:_/100,network:!0,replace:this.owned??void 0});if(v!==this.epoch)return;if(w.error||_>0&&!w.height)throw Error(w.error??"The road could not be smoothed");if(!this.edits.replaceHeight(this.owned,w.height??null,this.joined))throw Error("The smoothing operation changed; mark the road again");if(this.owned=w.height?.id??null,this.joined=!!w.height,this.key=y,this.edits.saveNow(),await this.edits.saved()===null)throw Error("The smoothing change could not be kept");b={state:"applied",influence:w.influence??null,message:w.standing?`${w.standing} objects at the edge stayed where they are: their places lie outside.`:void 0}}catch(S){if(v===this.epoch)b={state:"error",message:S instanceof Error?S.message:"Could not smooth this road"}}}),b}}var tc=20;var D0=180,O0=120,Gd=2,Vd=60,Wd=6;function Xd({name:m,view:g,edits:_,enabled:x,revision:y,onNote:v}){let[b,S]=n([]),[M,w]=n([]),[E,A]=n([]),[T,R]=n(Wd),[P,N]=n(Ho),C=(F="")=>`/api/editor/${encodeURIComponent(m)}/band${F}`,[I]=n(()=>new ec(_,(F)=>a(C(),F))),L=()=>{I.reset(),S([]),w([]),A([]),R(Wd),N(Ho),g.setRoadRegion(null),g.setRoadInfluence(null),g.setMarking(null)};i(()=>{if(b.length<2||b===M)return;let F=!1;return a(C("/way"),{base:_.boundRevision(),network:!0,points:b}).then(async(k)=>{if(F)return;if(k.error||!k.lines?.length||!k.region){v(k.error??"No connected road area found"),S((D)=>M.length?M:D.slice(0,1));return}try{if(await g.setRoadRegion(k.region),F)return;w(b),A(k.lines),v(null)}catch(D){if(!F)v(D instanceof Error?D.message:"Could not show the road area")}}),()=>{F=!0}},[b,_,g]),i(()=>{if(b.length!==1||!x){g.setMarking(null);return}let F=!1,k=!1,D=null,B,z=async(W)=>{if(k){D=W;return}k=!0;let V=await a(C("/way"),{base:_.boundRevision(),network:!0,points:[b[0],W]});if(!F&&V.region)await g.setRoadRegion(V.region).catch(()=>{});if(k=!1,!F&&D){let Y=D;D=null,z(Y)}};return g.setMarking((W,V)=>{clearTimeout(B),B=setTimeout(()=>{z([W,V])},O0)}),()=>{F=!0,clearTimeout(B),g.setMarking(null)}},[g,b,x,_]),i(()=>{let F=b.length===1?[[b[0][0],g.heightOfGround(b[0][0],b[0][1]),b[0][1]]]:null;return g.drawBand(F,0),g.drawPins(x?b.map(([k,D])=>[k,g.heightOfGround(k,D),D]):[]),()=>{g.drawBand(null,0),g.drawPins([])}},[g,b,x]);let U=l((F,k,D)=>{I.cancel(),S(b.map((B,z)=>z===F?[k,D]:B)),v(null)}),O=l((F)=>{I.cancel();let k=b.filter((D,B)=>B!==F);if(S(k),k.length<2)I.reset(),w([]),A([]),N(Ho),g.setRoadRegion(null),g.setRoadInfluence(null);v(null)});return i(()=>(g.setPinned((F,k,D)=>U(F,k,D),(F)=>O(F)),()=>g.setPinned(()=>{},()=>{})),[g]),i(()=>{if(!x||!E.length||b!==M){I.cancel();return}let F=!1,k=setTimeout(()=>{if(P>0)v("Smoothing road…");I.update(M,T,P).then(async(D)=>{if(F)return;if(D.state==="undone")L();else if(D.state==="error")v(`Not changed: ${D.message}`);else if(D.state==="applied")v(D.message??null),await g.setRoadInfluence(D.influence??null).catch((B)=>{if(!F)v(String(B.message??B))});else if(D.state==="unchanged")v(null)})},D0);return()=>{F=!0,clearTimeout(k),I.cancel()}},[x,E,b,M,T,P,y,I,g]),i(()=>()=>{I.reset(),g.setRoadRegion(null),g.setRoadInfluence(null)},[I,g]),{points:b,line:E[0]??null,blend:T,strength:P,clear:L,start:(F,k)=>{L(),S([[F,k]]),v(null)},click:(F,k)=>{if(b.length>=tc)return v(`A road network has at most ${tc} points`);I.cancel(),S([...b,[F,k]]),v(b.length?"Finding the connected road area…":null)},setStrength:(F)=>{I.cancel(),N(Math.min(100,Math.max(0,F)))},setBlend:(F)=>{I.cancel(),R(Math.min(Vd,Math.max(Gd,F)))},wheel:(F,k)=>{if(I.cancel(),F==="shift")N((D)=>Math.min(100,Math.max(0,D+k*5)));else if(F==="ctrl")R((D)=>Math.min(Vd,Math.max(Gd,D+k)))}}}var nc={back:"back_vaYpAg",menu:"menu_vaYpAg"};var qd=230;function Yd({at:m,mark:g,object:_,canDelete:x,onEdit:y,onMove:v,onDuplicate:b,onSmooth:S,onMark:M,onDelete:w,onClose:E}){let A=m.x+qd>m.width?Math.max(0,m.x-qd):m.x,T=10+28*(1+Number(!!S)+(_?4+Number(!!g):0)),R=m.y+T>m.height?Math.max(0,m.y-T):m.y,P=(N)=>()=>{E(),N()};return t("div",{className:nc.back,onPointerDown:(N)=>{if(N.target===N.currentTarget)E()},onContextMenu:(N)=>N.preventDefault(),children:e("div",{id:"view-menu",className:nc.menu,role:"menu",style:{left:A,top:R},children:[S&&t("button",{type:"button",role:"menuitem",onClick:P(S),children:"Smooth road"}),t("button",{type:"button",role:"menuitem",onClick:P(y),children:"Edit…"}),_&&e(r,{children:[t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!v,onClick:P(()=>v?.()),children:"Move"}),t("button",{type:"button",role:"menuitem",disabled:!b,onClick:P(()=>b?.()),children:"Duplicate"}),g&&t("button",{type:"button",role:"menuitem",onClick:P(M),children:g}),t("button",{type:"button",role:"menuitem",disabled:!x,onClick:P(w),children:"Delete"})]})]})})}var $d={box:"box_myLiyw"};var Fn=(m,g=2)=>Number(m.toFixed(g)).toFixed(g);function tn({label:m,children:g}){return e(r,{children:[t("dt",{children:m}),t("dd",{children:g})]})}function ic({hovered:m,id:g="hover-box"}){if(!m)return null;let _=m.billboard;return e("div",{id:g,className:$d.box,children:[e("h4",{children:[m.kind,m.sprite&&` · ${m.sprite}`]}),e("dl",{children:[m.id&&t(tn,{label:"ID",children:m.id}),m.sort&&t(tn,{label:"Type",children:m.sort}),_?.height!=null&&e(tn,{label:"Height",children:[Fn(_.height,1)," m"]}),_?.width!=null&&e(tn,{label:"Width",children:[Fn(_.width,1)," m"]}),_?.foot&&e(tn,{label:"Stands at",children:[Fn(_.foot[0],1),", ",Fn(_.foot[1],1)]}),t(tn,{label:"Mesh",children:m.object}),t(tn,{label:"Physics",children:m.physics}),t(tn,{label:"Material",children:m.material}),t(tn,{label:"Shader",children:m.shader}),e(tn,{label:"Texture",children:[m.texture??"none",m.textureBytes!==null&&` (${Math.ceil(m.textureBytes/1024)} KB)`]}),e(tn,{label:"Size",children:[m.vertices," vertices, ",m.triangles," triangles"]}),t(tn,{label:"Triangle",children:m.triangle}),m.uv&&e(tn,{label:"UV",children:[Fn(m.uv[0],3),", ",Fn(m.uv[1],3)]}),e(tn,{label:"Shown up to",children:[Math.round(m.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(tn,{label:"AC x, y, z",children:[Fn(m.at[0]),", ",Fn(m.at[1]),", ",Fn(m.at[2])]}),e(tn,{label:"Tile",children:[m.tile[0],", ",m.tile[1]]}),m.route&&e(tn,{label:"Route",children:[Math.round(m.route.metre)," m, ",Fn(m.route.off,1)," m off"]}),m.latLon&&e(tn,{label:"Lat, lon",children:[Fn(m.latLon[0],6),", ",Fn(m.latLon[1],6)]}),e(tn,{label:"Camera",children:[Fn(m.distance,1)," m away"]})]}),!m.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var xs="187";var Nf=0,Lc=1,Df=2;var Jr=1,Of=2,nr=3,Ri=0,Mn=1,In=2,ys=0,Kr=1,Nc=2,Dc=3,Oc=4,Uf=5;var ir=100,Ff=101,Bf=102,kf=103,zf=104,Hf=200,Gf=201,Vf=202,Wf=203,Xf=204,qf=205,Yf=206,$f=207,Zf=208,Jf=209,Kf=210,jf=211,Qf=212,ep=213,tp=214,np=0,ip=1,sp=2,Uc=3,rp=4,op=5,ap=6,lp=7,cp=0,up=1,hp=2,hi=0,Fc=1,Bc=2,kc=3,zc=4,Hc=5,Gc=6,Vc=7;var jr=301,sr=302,_a=303,xa=304,rr=1000,ya=1001,dp=1002,Zi=1003,fp=1004;var Qr=1005;var wn=1006,va=1007;var ii=1008;var si=1009,pp=1010,mp=1011,eo=1012,Wc=1013,Ji=1014,Ci=1015,di=1016,Xc=1017,qc=1018,vs=1020,gp=35902,_p=35899,xp=1021,yp=1022,Ln=1023,or=1026,Ki=1027,vp=1028,Yc=1029,bs=1030,$c=1031;var Zc=1033,ar=33776,ba=33777,lr=33778,cr=33779,Jc=35840,Kc=35841,jc=35842,Qc=35843,to=36196,eu=37492,tu=37496,nu=37488,iu=37489,Sa=37490,su=37491,ru=37808,ou=37809,au=37810,lu=37811,cu=37812,uu=37813,hu=37814,du=37815,fu=37816,pu=37817,mu=37818,gu=37819,_u=37820,xu=37821,yu=36492,no=36494,io=36495,vu=36283,bu=36284,Ma=36285,Su=36286;var Mu=0,bp=1,Pi="",wa="srgb",wu="srgb-linear",Eu="linear",Nt="srgb";var Sp=512,Mp=513,wp=514,Tu=515,Ep=516,Tp=517,Au=518,Ru=519;var Cu="300 es",Pu=2000;function B0(m){for(let g=m.length-1;g>=0;--g)if(m[g]>=65535)return!0;return!1}function k0(m){return ArrayBuffer.isView(m)&&!(m instanceof DataView)}function $r(m){return document.createElementNS("http://www.w3.org/1999/xhtml",m)}function Ap(){let m=$r("canvas");return m.style.display="block",m}var Zd={},er=null;function Zr(...m){let g="THREE."+m.shift();if(er)er("log",g,...m);else console.log(g,...m)}function Rp(m){let g=m[0];if(typeof g==="string"&&g.startsWith("TSL:")){let _=m[1];if(_&&_.isStackTrace)m[0]+=" "+_.getLocation();else m[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return m}function qe(...m){m=Rp(m);let g="THREE."+m.shift();if(er)er("warn",g,...m);else{let _=m[0];if(_&&_.isStackTrace)console.warn(_.getError(g));else console.warn(g,...m)}}function Je(...m){m=Rp(m);let g="THREE."+m.shift();if(er)er("error",g,...m);else{let _=m[0];if(_&&_.isStackTrace)console.error(_.getError(g));else console.error(g,...m)}}function Xr(...m){let g=m.join(" ");if(g in Zd)return;Zd[g]=!0,qe(...m)}function Cp(m,g,_){return new Promise(function(x,y){function v(){switch(m.clientWaitSync(g,m.SYNC_FLUSH_COMMANDS_BIT,0)){case m.WAIT_FAILED:y();break;case m.TIMEOUT_EXPIRED:setTimeout(v,_);break;default:x()}}setTimeout(v,_)})}var Pp={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class Ii{addEventListener(m,g){if(this._listeners===void 0)this._listeners={};let _=this._listeners;if(_[m]===void 0)_[m]=[];if(_[m].indexOf(g)===-1)_[m].push(g)}hasEventListener(m,g){let _=this._listeners;if(_===void 0)return!1;return _[m]!==void 0&&_[m].indexOf(g)!==-1}removeEventListener(m,g){let _=this._listeners;if(_===void 0)return;let x=_[m];if(x!==void 0){let y=x.indexOf(g);if(y!==-1)x.splice(y,1)}}dispatchEvent(m){let g=this._listeners;if(g===void 0)return;let _=g[m.type];if(_!==void 0){m.target=this;let x=_.slice(0);for(let y=0,v=x.length;y<v;y++)x[y].call(this,m);m.target=null}}}var vn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jd=1234567,qr=Math.PI/180,tr=180/Math.PI;function ji(){let m=Math.random()*4294967295|0,g=Math.random()*4294967295|0,_=Math.random()*4294967295|0,x=Math.random()*4294967295|0;return(vn[m&255]+vn[m>>8&255]+vn[m>>16&255]+vn[m>>24&255]+"-"+vn[g&255]+vn[g>>8&255]+"-"+vn[g>>16&15|64]+vn[g>>24&255]+"-"+vn[_&63|128]+vn[_>>8&255]+"-"+vn[_>>16&255]+vn[_>>24&255]+vn[x&255]+vn[x>>8&255]+vn[x>>16&255]+vn[x>>24&255]).toLowerCase()}function it(m,g,_){return Math.max(g,Math.min(_,m))}function Iu(m,g){return(m%g+g)%g}function z0(m,g,_,x,y){return x+(m-g)*(y-x)/(_-g)}function H0(m,g,_){if(m!==g)return(_-m)/(g-m);else return 0}function Yr(m,g,_){return(1-_)*m+_*g}function G0(m,g,_,x){return Yr(m,g,1-Math.exp(-_*x))}function V0(m,g=1){return g-Math.abs(Iu(m,g*2)-g)}function W0(m,g,_){if(m<=g)return 0;if(m>=_)return 1;return m=(m-g)/(_-g),m*m*(3-2*m)}function X0(m,g,_){if(m<=g)return 0;if(m>=_)return 1;return m=(m-g)/(_-g),m*m*m*(m*(m*6-15)+10)}function q0(m,g){return m+Math.floor(Math.random()*(g-m+1))}function Y0(m,g){return m+Math.random()*(g-m)}function $0(m){return m*(0.5-Math.random())}function Z0(m){if(m!==void 0)Jd=m;let g=Jd+=1831565813;return g=Math.imul(g^g>>>15,g|1),g^=g+Math.imul(g^g>>>7,g|61),((g^g>>>14)>>>0)/4294967296}function J0(m){return m*qr}function K0(m){return m*tr}function j0(m){return m>0&&Number.isInteger(m)&&2**Math.round(Math.log2(m))===m}function Q0(m){return Math.pow(2,Math.ceil(Math.log(m)/Math.LN2))}function Lu(m){return Math.pow(2,Math.floor(Math.log(m)/Math.LN2))}function e_(m,g,_,x,y){let{cos:v,sin:b}=Math,S=v(_/2),M=b(_/2),w=v((g+x)/2),E=b((g+x)/2),A=v((g-x)/2),T=b((g-x)/2),R=v((x-g)/2),P=b((x-g)/2);switch(y){case"XYX":m.set(S*E,M*A,M*T,S*w);break;case"YZY":m.set(M*T,S*E,M*A,S*w);break;case"ZXZ":m.set(M*A,M*T,S*E,S*w);break;case"XZX":m.set(S*E,M*P,M*R,S*w);break;case"YXY":m.set(M*R,S*E,M*P,S*w);break;case"ZYZ":m.set(M*P,M*R,S*E,S*w);break;default:qe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+y)}}function Ea(m){switch(m.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Nu(m,g){if(g.constructor===Float32Array)return m;let _=Ea(g);if(_===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(m/_,-1)}function Du(m,g){if(g.constructor===Float32Array)return m;let _=Ea(g);if(_===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(m*_)}var Li={DEG2RAD:qr,RAD2DEG:tr,generateUUID:ji,clamp:it,euclideanModulo:Iu,mapLinear:z0,inverseLerp:H0,lerp:Yr,damp:G0,pingpong:V0,smoothstep:W0,smootherstep:X0,randInt:q0,randFloat:Y0,randFloatSpread:$0,seededRandom:Z0,degToRad:J0,radToDeg:K0,isPowerOfTwo:j0,ceilPowerOfTwo:Q0,floorPowerOfTwo:Lu,setQuaternionFromProperEuler:e_,normalize:Du,denormalize:Nu};class $e{static{this.prototype.isVector2=!0}constructor(m=0,g=0){this.x=m,this.y=g}get width(){return this.x}set width(m){this.x=m}get height(){return this.y}set height(m){this.y=m}set(m,g){return this.x=m,this.y=g,this}setScalar(m){return this.x=m,this.y=m,this}setX(m){return this.x=m,this}setY(m){return this.y=m,this}setComponent(m,g){switch(m){case 0:this.x=g;break;case 1:this.y=g;break;default:throw Error("THREE.Vector2: index is out of range: "+m)}return this}getComponent(m){switch(m){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+m)}}clone(){return new this.constructor(this.x,this.y)}copy(m){return this.x=m.x,this.y=m.y,this}add(m){return this.x+=m.x,this.y+=m.y,this}addScalar(m){return this.x+=m,this.y+=m,this}addVectors(m,g){return this.x=m.x+g.x,this.y=m.y+g.y,this}addScaledVector(m,g){return this.x+=m.x*g,this.y+=m.y*g,this}sub(m){return this.x-=m.x,this.y-=m.y,this}subScalar(m){return this.x-=m,this.y-=m,this}subVectors(m,g){return this.x=m.x-g.x,this.y=m.y-g.y,this}multiply(m){return this.x*=m.x,this.y*=m.y,this}multiplyScalar(m){return this.x*=m,this.y*=m,this}divide(m){return this.x/=m.x,this.y/=m.y,this}divideScalar(m){return this.multiplyScalar(1/m)}applyMatrix3(m){let g=this.x,_=this.y,x=m.elements;return this.x=x[0]*g+x[3]*_+x[6],this.y=x[1]*g+x[4]*_+x[7],this}min(m){return this.x=Math.min(this.x,m.x),this.y=Math.min(this.y,m.y),this}max(m){return this.x=Math.max(this.x,m.x),this.y=Math.max(this.y,m.y),this}clamp(m,g){return this.x=it(this.x,m.x,g.x),this.y=it(this.y,m.y,g.y),this}clampScalar(m,g){return this.x=it(this.x,m,g),this.y=it(this.y,m,g),this}clampLength(m,g){let _=this.length();return this.divideScalar(_||1).multiplyScalar(it(_,m,g))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(m){return this.x*m.x+this.y*m.y}cross(m){return this.x*m.y-this.y*m.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(m){let g=Math.sqrt(this.lengthSq()*m.lengthSq());if(g===0)return Math.PI/2;let _=this.dot(m)/g;return Math.acos(it(_,-1,1))}distanceTo(m){return Math.sqrt(this.distanceToSquared(m))}distanceToSquared(m){let g=this.x-m.x,_=this.y-m.y;return g*g+_*_}manhattanDistanceTo(m){return Math.abs(this.x-m.x)+Math.abs(this.y-m.y)}setLength(m){return this.normalize().multiplyScalar(m)}lerp(m,g){return this.x+=(m.x-this.x)*g,this.y+=(m.y-this.y)*g,this}lerpVectors(m,g,_){return this.x=m.x+(g.x-m.x)*_,this.y=m.y+(g.y-m.y)*_,this}equals(m){return m.x===this.x&&m.y===this.y}fromArray(m,g=0){return this.x=m[g],this.y=m[g+1],this}toArray(m=[],g=0){return m[g]=this.x,m[g+1]=this.y,m}fromBufferAttribute(m,g){return this.x=m.getX(g),this.y=m.getY(g),this}rotateAround(m,g){let _=Math.cos(g),x=Math.sin(g),y=this.x-m.x,v=this.y-m.y;return this.x=y*_-v*x+m.x,this.y=y*x+v*_+m.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ni{constructor(m=0,g=0,_=0,x=1){this.isQuaternion=!0,this._x=m,this._y=g,this._z=_,this._w=x}static slerpFlat(m,g,_,x,y,v,b){let S=_[x+0],M=_[x+1],w=_[x+2],E=_[x+3],A=y[v+0],T=y[v+1],R=y[v+2],P=y[v+3];if(E!==P||S!==A||M!==T||w!==R){let N=S*A+M*T+w*R+E*P;if(N<0)A=-A,T=-T,R=-R,P=-P,N=-N;let C=1-b;if(N<0.9995){let I=Math.acos(N),L=Math.sin(I);C=Math.sin(C*I)/L,b=Math.sin(b*I)/L,S=S*C+A*b,M=M*C+T*b,w=w*C+R*b,E=E*C+P*b}else{S=S*C+A*b,M=M*C+T*b,w=w*C+R*b,E=E*C+P*b;let I=1/Math.sqrt(S*S+M*M+w*w+E*E);S*=I,M*=I,w*=I,E*=I}}m[g]=S,m[g+1]=M,m[g+2]=w,m[g+3]=E}static multiplyQuaternionsFlat(m,g,_,x,y,v){let b=_[x],S=_[x+1],M=_[x+2],w=_[x+3],E=y[v],A=y[v+1],T=y[v+2],R=y[v+3];return m[g]=b*R+w*E+S*T-M*A,m[g+1]=S*R+w*A+M*E-b*T,m[g+2]=M*R+w*T+b*A-S*E,m[g+3]=w*R-b*E-S*A-M*T,m}get x(){return this._x}set x(m){this._x=m,this._onChangeCallback()}get y(){return this._y}set y(m){this._y=m,this._onChangeCallback()}get z(){return this._z}set z(m){this._z=m,this._onChangeCallback()}get w(){return this._w}set w(m){this._w=m,this._onChangeCallback()}set(m,g,_,x){return this._x=m,this._y=g,this._z=_,this._w=x,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(m){return this._x=m.x,this._y=m.y,this._z=m.z,this._w=m.w,this._onChangeCallback(),this}setFromEuler(m,g=!0){let{_x:_,_y:x,_z:y,_order:v}=m,{cos:b,sin:S}=Math,M=b(_/2),w=b(x/2),E=b(y/2),A=S(_/2),T=S(x/2),R=S(y/2);switch(v){case"XYZ":this._x=A*w*E+M*T*R,this._y=M*T*E-A*w*R,this._z=M*w*R+A*T*E,this._w=M*w*E-A*T*R;break;case"YXZ":this._x=A*w*E+M*T*R,this._y=M*T*E-A*w*R,this._z=M*w*R-A*T*E,this._w=M*w*E+A*T*R;break;case"ZXY":this._x=A*w*E-M*T*R,this._y=M*T*E+A*w*R,this._z=M*w*R+A*T*E,this._w=M*w*E-A*T*R;break;case"ZYX":this._x=A*w*E-M*T*R,this._y=M*T*E+A*w*R,this._z=M*w*R-A*T*E,this._w=M*w*E+A*T*R;break;case"YZX":this._x=A*w*E+M*T*R,this._y=M*T*E+A*w*R,this._z=M*w*R-A*T*E,this._w=M*w*E-A*T*R;break;case"XZY":this._x=A*w*E-M*T*R,this._y=M*T*E-A*w*R,this._z=M*w*R+A*T*E,this._w=M*w*E+A*T*R;break;default:qe("Quaternion: .setFromEuler() encountered an unknown order: "+v)}if(g===!0)this._onChangeCallback();return this}setFromAxisAngle(m,g){let _=g/2,x=Math.sin(_);return this._x=m.x*x,this._y=m.y*x,this._z=m.z*x,this._w=Math.cos(_),this._onChangeCallback(),this}setFromRotationMatrix(m){let g=m.elements,_=g[0],x=g[4],y=g[8],v=g[1],b=g[5],S=g[9],M=g[2],w=g[6],E=g[10],A=_+b+E;if(A>0){let T=0.5/Math.sqrt(A+1);this._w=0.25/T,this._x=(w-S)*T,this._y=(y-M)*T,this._z=(v-x)*T}else if(_>b&&_>E){let T=2*Math.sqrt(1+_-b-E);this._w=(w-S)/T,this._x=0.25*T,this._y=(x+v)/T,this._z=(y+M)/T}else if(b>E){let T=2*Math.sqrt(1+b-_-E);this._w=(y-M)/T,this._x=(x+v)/T,this._y=0.25*T,this._z=(S+w)/T}else{let T=2*Math.sqrt(1+E-_-b);this._w=(v-x)/T,this._x=(y+M)/T,this._y=(S+w)/T,this._z=0.25*T}return this._onChangeCallback(),this}setFromUnitVectors(m,g){let _=m.dot(g)+1;if(_<0.00000001)if(_=0,Math.abs(m.x)>Math.abs(m.z))this._x=-m.y,this._y=m.x,this._z=0,this._w=_;else this._x=0,this._y=-m.z,this._z=m.y,this._w=_;else this._x=m.y*g.z-m.z*g.y,this._y=m.z*g.x-m.x*g.z,this._z=m.x*g.y-m.y*g.x,this._w=_;return this.normalize()}angleTo(m){return 2*Math.acos(Math.abs(it(this.dot(m),-1,1)))}rotateTowards(m,g){let _=this.angleTo(m);if(_===0)return this;let x=Math.min(1,g/_);return this.slerp(m,x),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(m){return this._x*m._x+this._y*m._y+this._z*m._z+this._w*m._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let m=this.length();if(m===0)this._x=0,this._y=0,this._z=0,this._w=1;else m=1/m,this._x=this._x*m,this._y=this._y*m,this._z=this._z*m,this._w=this._w*m;return this._onChangeCallback(),this}multiply(m){return this.multiplyQuaternions(this,m)}premultiply(m){return this.multiplyQuaternions(m,this)}multiplyQuaternions(m,g){let{_x:_,_y:x,_z:y,_w:v}=m,{_x:b,_y:S,_z:M,_w:w}=g;return this._x=_*w+v*b+x*M-y*S,this._y=x*w+v*S+y*b-_*M,this._z=y*w+v*M+_*S-x*b,this._w=v*w-_*b-x*S-y*M,this._onChangeCallback(),this}slerp(m,g){let{_x:_,_y:x,_z:y,_w:v}=m,b=this.dot(m);if(b<0)_=-_,x=-x,y=-y,v=-v,b=-b;let S=1-g;if(b<0.9995){let M=Math.acos(b),w=Math.sin(M);S=Math.sin(S*M)/w,g=Math.sin(g*M)/w,this._x=this._x*S+_*g,this._y=this._y*S+x*g,this._z=this._z*S+y*g,this._w=this._w*S+v*g,this._onChangeCallback()}else this._x=this._x*S+_*g,this._y=this._y*S+x*g,this._z=this._z*S+y*g,this._w=this._w*S+v*g,this.normalize();return this}slerpQuaternions(m,g,_){return this.copy(m).slerp(g,_)}random(){let m=2*Math.PI*Math.random(),g=2*Math.PI*Math.random(),_=Math.random(),x=Math.sqrt(1-_),y=Math.sqrt(_);return this.set(x*Math.sin(m),x*Math.cos(m),y*Math.sin(g),y*Math.cos(g))}equals(m){return m._x===this._x&&m._y===this._y&&m._z===this._z&&m._w===this._w}fromArray(m,g=0){return this._x=m[g],this._y=m[g+1],this._z=m[g+2],this._w=m[g+3],this._onChangeCallback(),this}toArray(m=[],g=0){return m[g]=this._x,m[g+1]=this._y,m[g+2]=this._z,m[g+3]=this._w,m}fromBufferAttribute(m,g){return this._x=m.getX(g),this._y=m.getY(g),this._z=m.getZ(g),this._w=m.getW(g),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(m){return this._onChangeCallback=m,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Z{static{this.prototype.isVector3=!0}constructor(m=0,g=0,_=0){this.x=m,this.y=g,this.z=_}set(m,g,_){if(_===void 0)_=this.z;return this.x=m,this.y=g,this.z=_,this}setScalar(m){return this.x=m,this.y=m,this.z=m,this}setX(m){return this.x=m,this}setY(m){return this.y=m,this}setZ(m){return this.z=m,this}setComponent(m,g){switch(m){case 0:this.x=g;break;case 1:this.y=g;break;case 2:this.z=g;break;default:throw Error("THREE.Vector3: index is out of range: "+m)}return this}getComponent(m){switch(m){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+m)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(m){return this.x=m.x,this.y=m.y,this.z=m.z,this}add(m){return this.x+=m.x,this.y+=m.y,this.z+=m.z,this}addScalar(m){return this.x+=m,this.y+=m,this.z+=m,this}addVectors(m,g){return this.x=m.x+g.x,this.y=m.y+g.y,this.z=m.z+g.z,this}addScaledVector(m,g){return this.x+=m.x*g,this.y+=m.y*g,this.z+=m.z*g,this}sub(m){return this.x-=m.x,this.y-=m.y,this.z-=m.z,this}subScalar(m){return this.x-=m,this.y-=m,this.z-=m,this}subVectors(m,g){return this.x=m.x-g.x,this.y=m.y-g.y,this.z=m.z-g.z,this}multiply(m){return this.x*=m.x,this.y*=m.y,this.z*=m.z,this}multiplyScalar(m){return this.x*=m,this.y*=m,this.z*=m,this}multiplyVectors(m,g){return this.x=m.x*g.x,this.y=m.y*g.y,this.z=m.z*g.z,this}applyEuler(m){return this.applyQuaternion(Kd.setFromEuler(m))}applyAxisAngle(m,g){return this.applyQuaternion(Kd.setFromAxisAngle(m,g))}applyMatrix3(m){let g=this.x,_=this.y,x=this.z,y=m.elements;return this.x=y[0]*g+y[3]*_+y[6]*x,this.y=y[1]*g+y[4]*_+y[7]*x,this.z=y[2]*g+y[5]*_+y[8]*x,this}applyNormalMatrix(m){return this.applyMatrix3(m).normalize()}applyMatrix4(m){let g=this.x,_=this.y,x=this.z,y=m.elements,v=1/(y[3]*g+y[7]*_+y[11]*x+y[15]);return this.x=(y[0]*g+y[4]*_+y[8]*x+y[12])*v,this.y=(y[1]*g+y[5]*_+y[9]*x+y[13])*v,this.z=(y[2]*g+y[6]*_+y[10]*x+y[14])*v,this}applyQuaternion(m){let g=this.x,_=this.y,x=this.z,{x:y,y:v,z:b,w:S}=m,M=2*(v*x-b*_),w=2*(b*g-y*x),E=2*(y*_-v*g);return this.x=g+S*M+v*E-b*w,this.y=_+S*w+b*M-y*E,this.z=x+S*E+y*w-v*M,this}project(m){return this.applyMatrix4(m.matrixWorldInverse).applyMatrix4(m.projectionMatrix)}unproject(m){return this.applyMatrix4(m.projectionMatrixInverse).applyMatrix4(m.matrixWorld)}transformDirection(m){let g=this.x,_=this.y,x=this.z,y=m.elements;return this.x=y[0]*g+y[4]*_+y[8]*x,this.y=y[1]*g+y[5]*_+y[9]*x,this.z=y[2]*g+y[6]*_+y[10]*x,this.normalize()}divide(m){return this.x/=m.x,this.y/=m.y,this.z/=m.z,this}divideScalar(m){return this.multiplyScalar(1/m)}min(m){return this.x=Math.min(this.x,m.x),this.y=Math.min(this.y,m.y),this.z=Math.min(this.z,m.z),this}max(m){return this.x=Math.max(this.x,m.x),this.y=Math.max(this.y,m.y),this.z=Math.max(this.z,m.z),this}clamp(m,g){return this.x=it(this.x,m.x,g.x),this.y=it(this.y,m.y,g.y),this.z=it(this.z,m.z,g.z),this}clampScalar(m,g){return this.x=it(this.x,m,g),this.y=it(this.y,m,g),this.z=it(this.z,m,g),this}clampLength(m,g){let _=this.length();return this.divideScalar(_||1).multiplyScalar(it(_,m,g))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(m){return this.x*m.x+this.y*m.y+this.z*m.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(m){return this.normalize().multiplyScalar(m)}lerp(m,g){return this.x+=(m.x-this.x)*g,this.y+=(m.y-this.y)*g,this.z+=(m.z-this.z)*g,this}lerpVectors(m,g,_){return this.x=m.x+(g.x-m.x)*_,this.y=m.y+(g.y-m.y)*_,this.z=m.z+(g.z-m.z)*_,this}cross(m){return this.crossVectors(this,m)}crossVectors(m,g){let{x:_,y:x,z:y}=m,{x:v,y:b,z:S}=g;return this.x=x*S-y*b,this.y=y*v-_*S,this.z=_*b-x*v,this}projectOnVector(m){let g=m.lengthSq();if(g===0)return this.set(0,0,0);let _=m.dot(this)/g;return this.copy(m).multiplyScalar(_)}projectOnPlane(m){return sc.copy(this).projectOnVector(m),this.sub(sc)}reflect(m){return this.sub(sc.copy(m).multiplyScalar(2*this.dot(m)))}angleTo(m){let g=Math.sqrt(this.lengthSq()*m.lengthSq());if(g===0)return Math.PI/2;let _=this.dot(m)/g;return Math.acos(it(_,-1,1))}distanceTo(m){return Math.sqrt(this.distanceToSquared(m))}distanceToSquared(m){let g=this.x-m.x,_=this.y-m.y,x=this.z-m.z;return g*g+_*_+x*x}manhattanDistanceTo(m){return Math.abs(this.x-m.x)+Math.abs(this.y-m.y)+Math.abs(this.z-m.z)}setFromSpherical(m){return this.setFromSphericalCoords(m.radius,m.phi,m.theta)}setFromSphericalCoords(m,g,_){let x=Math.sin(g)*m;return this.x=x*Math.sin(_),this.y=Math.cos(g)*m,this.z=x*Math.cos(_),this}setFromCylindrical(m){return this.setFromCylindricalCoords(m.radius,m.theta,m.y)}setFromCylindricalCoords(m,g,_){return this.x=m*Math.sin(g),this.y=_,this.z=m*Math.cos(g),this}setFromMatrixPosition(m){let g=m.elements;return this.x=g[12],this.y=g[13],this.z=g[14],this}setFromMatrixScale(m){let g=this.setFromMatrixColumn(m,0).length(),_=this.setFromMatrixColumn(m,1).length(),x=this.setFromMatrixColumn(m,2).length();return this.x=g,this.y=_,this.z=x,this}setFromMatrixColumn(m,g){return this.fromArray(m.elements,g*4)}setFromMatrix3Column(m,g){return this.fromArray(m.elements,g*3)}setFromEuler(m){return this.x=m._x,this.y=m._y,this.z=m._z,this}setFromColor(m){return this.x=m.r,this.y=m.g,this.z=m.b,this}equals(m){return m.x===this.x&&m.y===this.y&&m.z===this.z}fromArray(m,g=0){return this.x=m[g],this.y=m[g+1],this.z=m[g+2],this}toArray(m=[],g=0){return m[g]=this.x,m[g+1]=this.y,m[g+2]=this.z,m}fromBufferAttribute(m,g){return this.x=m.getX(g),this.y=m.getY(g),this.z=m.getZ(g),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let m=Math.random()*Math.PI*2,g=Math.random()*2-1,_=Math.sqrt(1-g*g);return this.x=_*Math.cos(m),this.y=g,this.z=_*Math.sin(m),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var sc=new Z,Kd=new Ni;class et{static{this.prototype.isMatrix3=!0}constructor(m,g,_,x,y,v,b,S,M){if(this.elements=[1,0,0,0,1,0,0,0,1],m!==void 0)this.set(m,g,_,x,y,v,b,S,M)}set(m,g,_,x,y,v,b,S,M){let w=this.elements;return w[0]=m,w[1]=x,w[2]=b,w[3]=g,w[4]=y,w[5]=S,w[6]=_,w[7]=v,w[8]=M,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(m){let g=this.elements,_=m.elements;return g[0]=_[0],g[1]=_[1],g[2]=_[2],g[3]=_[3],g[4]=_[4],g[5]=_[5],g[6]=_[6],g[7]=_[7],g[8]=_[8],this}extractBasis(m,g,_){return m.setFromMatrix3Column(this,0),g.setFromMatrix3Column(this,1),_.setFromMatrix3Column(this,2),this}setFromMatrix4(m){let g=m.elements;return this.set(g[0],g[4],g[8],g[1],g[5],g[9],g[2],g[6],g[10]),this}multiply(m){return this.multiplyMatrices(this,m)}premultiply(m){return this.multiplyMatrices(m,this)}multiplyMatrices(m,g){let _=m.elements,x=g.elements,y=this.elements,v=_[0],b=_[3],S=_[6],M=_[1],w=_[4],E=_[7],A=_[2],T=_[5],R=_[8],P=x[0],N=x[3],C=x[6],I=x[1],L=x[4],U=x[7],O=x[2],F=x[5],k=x[8];return y[0]=v*P+b*I+S*O,y[3]=v*N+b*L+S*F,y[6]=v*C+b*U+S*k,y[1]=M*P+w*I+E*O,y[4]=M*N+w*L+E*F,y[7]=M*C+w*U+E*k,y[2]=A*P+T*I+R*O,y[5]=A*N+T*L+R*F,y[8]=A*C+T*U+R*k,this}multiplyScalar(m){let g=this.elements;return g[0]*=m,g[3]*=m,g[6]*=m,g[1]*=m,g[4]*=m,g[7]*=m,g[2]*=m,g[5]*=m,g[8]*=m,this}determinant(){let m=this.elements,g=m[0],_=m[1],x=m[2],y=m[3],v=m[4],b=m[5],S=m[6],M=m[7],w=m[8];return g*v*w-g*b*M-_*y*w+_*b*S+x*y*M-x*v*S}invert(){let m=this.elements,g=m[0],_=m[1],x=m[2],y=m[3],v=m[4],b=m[5],S=m[6],M=m[7],w=m[8],E=w*v-b*M,A=b*S-w*y,T=M*y-v*S,R=g*E+_*A+x*T;if(R===0)return this.set(0,0,0,0,0,0,0,0,0);let P=1/R;return m[0]=E*P,m[1]=(x*M-w*_)*P,m[2]=(b*_-x*v)*P,m[3]=A*P,m[4]=(w*g-x*S)*P,m[5]=(x*y-b*g)*P,m[6]=T*P,m[7]=(_*S-M*g)*P,m[8]=(v*g-_*y)*P,this}transpose(){let m,g=this.elements;return m=g[1],g[1]=g[3],g[3]=m,m=g[2],g[2]=g[6],g[6]=m,m=g[5],g[5]=g[7],g[7]=m,this}getNormalMatrix(m){return this.setFromMatrix4(m).invert().transpose()}transposeIntoArray(m){let g=this.elements;return m[0]=g[0],m[1]=g[3],m[2]=g[6],m[3]=g[1],m[4]=g[4],m[5]=g[7],m[6]=g[2],m[7]=g[5],m[8]=g[8],this}setUvTransform(m,g,_,x,y,v,b){let S=Math.cos(y),M=Math.sin(y);return this.set(_*S,_*M,-_*(S*v+M*b)+v+m,-x*M,x*S,-x*(-M*v+S*b)+b+g,0,0,1),this}scale(m,g){return Xr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(rc.makeScale(m,g)),this}rotate(m){return Xr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(rc.makeRotation(-m)),this}translate(m,g){return Xr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(rc.makeTranslation(m,g)),this}makeTranslation(m,g){if(m.isVector2)this.set(1,0,m.x,0,1,m.y,0,0,1);else this.set(1,0,m,0,1,g,0,0,1);return this}makeRotation(m){let g=Math.cos(m),_=Math.sin(m);return this.set(g,-_,0,_,g,0,0,0,1),this}makeScale(m,g){return this.set(m,0,0,0,g,0,0,0,1),this}equals(m){let g=this.elements,_=m.elements;for(let x=0;x<9;x++)if(g[x]!==_[x])return!1;return!0}fromArray(m,g=0){for(let _=0;_<9;_++)this.elements[_]=m[_+g];return this}toArray(m=[],g=0){let _=this.elements;return m[g]=_[0],m[g+1]=_[1],m[g+2]=_[2],m[g+3]=_[3],m[g+4]=_[4],m[g+5]=_[5],m[g+6]=_[6],m[g+7]=_[7],m[g+8]=_[8],m}clone(){return new this.constructor().fromArray(this.elements)}}var rc=new et,jd=new et().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),Qd=new et().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function t_(){let m={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(y,v,b){if(this.enabled===!1||v===b||!v||!b)return y;if(this.spaces[v].transfer==="srgb")y.r=Ti(y.r),y.g=Ti(y.g),y.b=Ti(y.b);if(this.spaces[v].primaries!==this.spaces[b].primaries)y.applyMatrix3(this.spaces[v].toXYZ),y.applyMatrix3(this.spaces[b].fromXYZ);if(this.spaces[b].transfer==="srgb")y.r=Qs(y.r),y.g=Qs(y.g),y.b=Qs(y.b);return y},workingToColorSpace:function(y,v){return this.convert(y,this.workingColorSpace,v)},colorSpaceToWorking:function(y,v){return this.convert(y,v,this.workingColorSpace)},getPrimaries:function(y){return this.spaces[y].primaries},getTransfer:function(y){if(y==="")return"linear";return this.spaces[y].transfer},getToneMappingMode:function(y){return this.spaces[y].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(y,v=this.workingColorSpace){return y.fromArray(this.spaces[v].luminanceCoefficients)},define:function(y){Object.assign(this.spaces,y)},_getMatrix:function(y,v,b){return y.copy(this.spaces[b].fromXYZ).multiply(this.spaces[v].toXYZ)},_getDrawingBufferColorSpace:function(y){return this.spaces[y].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(y=this.workingColorSpace){return this.spaces[y].workingColorSpaceConfig.unpackColorSpace}},g=[0.64,0.33,0.3,0.6,0.15,0.06],_=[0.2126,0.7152,0.0722],x=[0.3127,0.329];return m.define({["srgb-linear"]:{primaries:g,whitePoint:x,transfer:"linear",toXYZ:jd,fromXYZ:Qd,luminanceCoefficients:_,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:g,whitePoint:x,transfer:"srgb",toXYZ:jd,fromXYZ:Qd,luminanceCoefficients:_,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),m}var ut=t_();function Ti(m){return m<0.04045?m*0.0773993808:Math.pow(m*0.9478672986+0.0521327014,2.4)}function Qs(m){return m<0.0031308?m*12.92:1.055*Math.pow(m,0.41666)-0.055}var Bs;class Ou{static getDataURL(m,g="image/png"){if(/^data:/i.test(m.src))return m.src;if(typeof HTMLCanvasElement>"u")return m.src;let _;if(m instanceof HTMLCanvasElement)_=m;else{if(Bs===void 0)Bs=$r("canvas");Bs.width=m.width,Bs.height=m.height;let x=Bs.getContext("2d");if(m instanceof ImageData)x.putImageData(m,0,0);else x.drawImage(m,0,0,m.width,m.height);_=Bs}return _.toDataURL(g)}static sRGBToLinear(m){if(typeof HTMLImageElement<"u"&&m instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&m instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&m instanceof ImageBitmap){let g=$r("canvas");g.width=m.width,g.height=m.height;let _=g.getContext("2d");_.drawImage(m,0,0,m.width,m.height);let x=_.getImageData(0,0,m.width,m.height),y=x.data;for(let v=0;v<y.length;v++)y[v]=Ti(y[v]/255)*255;return _.putImageData(x,0,0),g}else if(m.data){let g=m.data.slice(0);for(let _=0;_<g.length;_++)if(g instanceof Uint8Array||g instanceof Uint8ClampedArray)g[_]=Math.floor(Ti(g[_]/255)*255);else g[_]=Ti(g[_]);return{data:g,width:m.width,height:m.height}}else return qe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),m}}var n_=0;class so{constructor(m=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:n_++}),this.uuid=ji(),this.data=m,this.dataReady=!0,this.version=0}getSize(m){let g=this.data;if(typeof HTMLVideoElement<"u"&&g instanceof HTMLVideoElement)m.set(g.videoWidth,g.videoHeight,0);else if(typeof VideoFrame<"u"&&g instanceof VideoFrame)m.set(g.displayWidth,g.displayHeight,0);else if(g!==null)m.set(g.width||0,g.height||0,g.depth||0);else m.set(0,0,0);return m}set needsUpdate(m){if(m===!0)this.version++}toJSON(m){let g=m===void 0||typeof m==="string";if(!g&&m.images[this.uuid]!==void 0)return m.images[this.uuid];let _={uuid:this.uuid,url:""},x=this.data;if(x!==null){let y;if(Array.isArray(x)){y=[];for(let v=0,b=x.length;v<b;v++)if(x[v].isDataTexture)y.push(oc(x[v].image));else y.push(oc(x[v]))}else y=oc(x);_.url=y}if(!g)m.images[this.uuid]=_;return _}}function oc(m){if(typeof HTMLImageElement<"u"&&m instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&m instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&m instanceof ImageBitmap)return Ou.getDataURL(m);else if(m.data)return{data:Array.from(m.data),width:m.width,height:m.height,type:m.data.constructor.name};else return qe("Texture: Unable to serialize Texture."),{}}var i_=0,ac=new Z;class Vt extends Ii{constructor(m=Vt.DEFAULT_IMAGE,g=Vt.DEFAULT_MAPPING,_=1001,x=1001,y=1006,v=1008,b=1023,S=1009,M=Vt.DEFAULT_ANISOTROPY,w=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:i_++}),this.uuid=ji(),this.name="",this.source=new so(m),this.mipmaps=[],this.mapping=g,this.channel=0,this.wrapS=_,this.wrapT=x,this.magFilter=y,this.minFilter=v,this.anisotropy=M,this.format=b,this.internalFormat=null,this.type=S,this.offset=new $e(0,0),this.repeat=new $e(1,1),this.center=new $e(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new et,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=w,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=m&&m.depth&&m.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(ac).x}get height(){return this.source.getSize(ac).y}get depth(){return this.source.getSize(ac).z}get image(){return this.source.data}set image(m){this.source.data=m}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(m,g){this.updateRanges.push({start:m,count:g})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(m){return this.name=m.name,this.source=m.source,this.mipmaps=m.mipmaps.slice(0),this.mapping=m.mapping,this.channel=m.channel,this.wrapS=m.wrapS,this.wrapT=m.wrapT,this.magFilter=m.magFilter,this.minFilter=m.minFilter,this.anisotropy=m.anisotropy,this.format=m.format,this.internalFormat=m.internalFormat,this.type=m.type,this.normalized=m.normalized,this.offset.copy(m.offset),this.repeat.copy(m.repeat),this.center.copy(m.center),this.rotation=m.rotation,this.matrixAutoUpdate=m.matrixAutoUpdate,this.matrix.copy(m.matrix),this.generateMipmaps=m.generateMipmaps,this.mipmapsAutoUpdate=m.mipmapsAutoUpdate,this.premultiplyAlpha=m.premultiplyAlpha,this.flipY=m.flipY,this.unpackAlignment=m.unpackAlignment,this.colorSpace=m.colorSpace,this.renderTarget=m.renderTarget,this.isRenderTargetTexture=m.isRenderTargetTexture,this.isPMREMTexture=m.isPMREMTexture,this.isArrayTexture=m.isArrayTexture,this.userData=JSON.parse(JSON.stringify(m.userData)),this.needsUpdate=!0,this}setValues(m){for(let g in m){let _=m[g];if(_===void 0){qe(`Texture.setValues(): parameter '${g}' has value of undefined.`);continue}let x=this[g];if(x===void 0){qe(`Texture.setValues(): property '${g}' does not exist.`);continue}if(x&&_&&(x.isVector2&&_.isVector2))x.copy(_);else if(x&&_&&(x.isVector3&&_.isVector3))x.copy(_);else if(x&&_&&(x.isMatrix3&&_.isMatrix3))x.copy(_);else this[g]=_}}toJSON(m){let g=m===void 0||typeof m==="string";if(!g&&m.textures[this.uuid]!==void 0)return m.textures[this.uuid];let _={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(m).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)_.userData=this.userData;if(!g)m.textures[this.uuid]=_;return _}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(m){if(this.mapping!==300)return m;if(m.applyMatrix3(this.matrix),m.x<0||m.x>1)switch(this.wrapS){case 1000:m.x=m.x-Math.floor(m.x);break;case 1001:m.x=m.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(m.x)%2)===1)m.x=Math.ceil(m.x)-m.x;else m.x=m.x-Math.floor(m.x);break}if(m.y<0||m.y>1)switch(this.wrapT){case 1000:m.y=m.y-Math.floor(m.y);break;case 1001:m.y=m.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(m.y)%2)===1)m.y=Math.ceil(m.y)-m.y;else m.y=m.y-Math.floor(m.y);break}if(this.flipY)m.y=1-m.y;return m}set needsUpdate(m){if(m===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(m){if(m===!0)this.pmremVersion++}}Vt.DEFAULT_IMAGE=null;Vt.DEFAULT_MAPPING=300;Vt.DEFAULT_ANISOTROPY=1;class Ht{static{this.prototype.isVector4=!0}constructor(m=0,g=0,_=0,x=1){this.x=m,this.y=g,this.z=_,this.w=x}get width(){return this.z}set width(m){this.z=m}get height(){return this.w}set height(m){this.w=m}set(m,g,_,x){return this.x=m,this.y=g,this.z=_,this.w=x,this}setScalar(m){return this.x=m,this.y=m,this.z=m,this.w=m,this}setX(m){return this.x=m,this}setY(m){return this.y=m,this}setZ(m){return this.z=m,this}setW(m){return this.w=m,this}setComponent(m,g){switch(m){case 0:this.x=g;break;case 1:this.y=g;break;case 2:this.z=g;break;case 3:this.w=g;break;default:throw Error("THREE.Vector4: index is out of range: "+m)}return this}getComponent(m){switch(m){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+m)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(m){return this.x=m.x,this.y=m.y,this.z=m.z,this.w=m.w!==void 0?m.w:1,this}add(m){return this.x+=m.x,this.y+=m.y,this.z+=m.z,this.w+=m.w,this}addScalar(m){return this.x+=m,this.y+=m,this.z+=m,this.w+=m,this}addVectors(m,g){return this.x=m.x+g.x,this.y=m.y+g.y,this.z=m.z+g.z,this.w=m.w+g.w,this}addScaledVector(m,g){return this.x+=m.x*g,this.y+=m.y*g,this.z+=m.z*g,this.w+=m.w*g,this}sub(m){return this.x-=m.x,this.y-=m.y,this.z-=m.z,this.w-=m.w,this}subScalar(m){return this.x-=m,this.y-=m,this.z-=m,this.w-=m,this}subVectors(m,g){return this.x=m.x-g.x,this.y=m.y-g.y,this.z=m.z-g.z,this.w=m.w-g.w,this}multiply(m){return this.x*=m.x,this.y*=m.y,this.z*=m.z,this.w*=m.w,this}multiplyScalar(m){return this.x*=m,this.y*=m,this.z*=m,this.w*=m,this}applyMatrix4(m){let g=this.x,_=this.y,x=this.z,y=this.w,v=m.elements;return this.x=v[0]*g+v[4]*_+v[8]*x+v[12]*y,this.y=v[1]*g+v[5]*_+v[9]*x+v[13]*y,this.z=v[2]*g+v[6]*_+v[10]*x+v[14]*y,this.w=v[3]*g+v[7]*_+v[11]*x+v[15]*y,this}divide(m){return this.x/=m.x,this.y/=m.y,this.z/=m.z,this.w/=m.w,this}divideScalar(m){return this.multiplyScalar(1/m)}setAxisAngleFromQuaternion(m){this.w=2*Math.acos(m.w);let g=Math.sqrt(1-m.w*m.w);if(g<0.0001)this.x=1,this.y=0,this.z=0;else this.x=m.x/g,this.y=m.y/g,this.z=m.z/g;return this}setAxisAngleFromRotationMatrix(m){let g,_,x,y,v=0.01,b=0.1,S=m.elements,M=S[0],w=S[4],E=S[8],A=S[1],T=S[5],R=S[9],P=S[2],N=S[6],C=S[10];if(Math.abs(w-A)<0.01&&Math.abs(E-P)<0.01&&Math.abs(R-N)<0.01){if(Math.abs(w+A)<0.1&&Math.abs(E+P)<0.1&&Math.abs(R+N)<0.1&&Math.abs(M+T+C-3)<0.1)return this.set(1,0,0,0),this;g=Math.PI;let L=(M+1)/2,U=(T+1)/2,O=(C+1)/2,F=(w+A)/4,k=(E+P)/4,D=(R+N)/4;if(L>U&&L>O)if(L<0.01)_=0,x=0.707106781,y=0.707106781;else _=Math.sqrt(L),x=F/_,y=k/_;else if(U>O)if(U<0.01)_=0.707106781,x=0,y=0.707106781;else x=Math.sqrt(U),_=F/x,y=D/x;else if(O<0.01)_=0.707106781,x=0.707106781,y=0;else y=Math.sqrt(O),_=k/y,x=D/y;return this.set(_,x,y,g),this}let I=Math.sqrt((N-R)*(N-R)+(E-P)*(E-P)+(A-w)*(A-w));if(Math.abs(I)<0.001)I=1;return this.x=(N-R)/I,this.y=(E-P)/I,this.z=(A-w)/I,this.w=Math.acos((M+T+C-1)/2),this}setFromMatrixPosition(m){let g=m.elements;return this.x=g[12],this.y=g[13],this.z=g[14],this.w=g[15],this}min(m){return this.x=Math.min(this.x,m.x),this.y=Math.min(this.y,m.y),this.z=Math.min(this.z,m.z),this.w=Math.min(this.w,m.w),this}max(m){return this.x=Math.max(this.x,m.x),this.y=Math.max(this.y,m.y),this.z=Math.max(this.z,m.z),this.w=Math.max(this.w,m.w),this}clamp(m,g){return this.x=it(this.x,m.x,g.x),this.y=it(this.y,m.y,g.y),this.z=it(this.z,m.z,g.z),this.w=it(this.w,m.w,g.w),this}clampScalar(m,g){return this.x=it(this.x,m,g),this.y=it(this.y,m,g),this.z=it(this.z,m,g),this.w=it(this.w,m,g),this}clampLength(m,g){let _=this.length();return this.divideScalar(_||1).multiplyScalar(it(_,m,g))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(m){return this.x*m.x+this.y*m.y+this.z*m.z+this.w*m.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(m){return this.normalize().multiplyScalar(m)}lerp(m,g){return this.x+=(m.x-this.x)*g,this.y+=(m.y-this.y)*g,this.z+=(m.z-this.z)*g,this.w+=(m.w-this.w)*g,this}lerpVectors(m,g,_){return this.x=m.x+(g.x-m.x)*_,this.y=m.y+(g.y-m.y)*_,this.z=m.z+(g.z-m.z)*_,this.w=m.w+(g.w-m.w)*_,this}equals(m){return m.x===this.x&&m.y===this.y&&m.z===this.z&&m.w===this.w}fromArray(m,g=0){return this.x=m[g],this.y=m[g+1],this.z=m[g+2],this.w=m[g+3],this}toArray(m=[],g=0){return m[g]=this.x,m[g+1]=this.y,m[g+2]=this.z,m[g+3]=this.w,m}fromBufferAttribute(m,g){return this.x=m.getX(g),this.y=m.getY(g),this.z=m.getZ(g),this.w=m.getW(g),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Uu extends Ii{constructor(m=1,g=1,_={}){super();_=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},_),this.isRenderTarget=!0,this.width=m,this.height=g,this.depth=_.depth,this.scissor=new Ht(0,0,m,g),this.scissorTest=!1,this.viewport=new Ht(0,0,m,g),this.textures=[];let x=_.count;for(let y=0;y<x;y++)this.textures[y]=new Vt({width:m,height:g,depth:_.depth}),this.textures[y].isRenderTargetTexture=!0,this.textures[y].renderTarget=this;this._setTextureOptions(_),this.depthBuffer=_.depthBuffer,this.stencilBuffer=_.stencilBuffer,this.resolveColorBuffer=_.resolveColorBuffer,this.resolveDepthBuffer=_.resolveDepthBuffer,this.resolveStencilBuffer=_.resolveStencilBuffer,this.storeMultisampledColorBuffer=_.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=_.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=_.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=_.depthTexture,this.samples=_.samples,this.multiview=_.multiview,this.useArrayDepthTexture=_.useArrayDepthTexture}_setTextureOptions(m={}){let g={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(m.mapping!==void 0)g.mapping=m.mapping;if(m.wrapS!==void 0)g.wrapS=m.wrapS;if(m.wrapT!==void 0)g.wrapT=m.wrapT;if(m.wrapR!==void 0)g.wrapR=m.wrapR;if(m.magFilter!==void 0)g.magFilter=m.magFilter;if(m.minFilter!==void 0)g.minFilter=m.minFilter;if(m.format!==void 0)g.format=m.format;if(m.type!==void 0)g.type=m.type;if(m.anisotropy!==void 0)g.anisotropy=m.anisotropy;if(m.colorSpace!==void 0)g.colorSpace=m.colorSpace;if(m.flipY!==void 0)g.flipY=m.flipY;if(m.generateMipmaps!==void 0)g.generateMipmaps=m.generateMipmaps;if(m.mipmapsAutoUpdate!==void 0)g.mipmapsAutoUpdate=m.mipmapsAutoUpdate;if(m.internalFormat!==void 0)g.internalFormat=m.internalFormat;for(let _=0;_<this.textures.length;_++)this.textures[_].setValues(g)}get texture(){return this.textures[0]}set texture(m){this.textures[0]=m}set depthTexture(m){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(m!==null&&m.renderTarget===null)m.renderTarget=this;this._depthTexture=m}get depthTexture(){return this._depthTexture}setSize(m,g,_=1){if(this.width!==m||this.height!==g||this.depth!==_){this.width=m,this.height=g,this.depth=_;for(let x=0,y=this.textures.length;x<y;x++)if(this.textures[x].image.width=m,this.textures[x].image.height=g,this.textures[x].image.depth=_,this.textures[x].isData3DTexture!==!0)this.textures[x].isArrayTexture=this.textures[x].image.depth>1;this.dispose()}this.viewport.set(0,0,m,g),this.scissor.set(0,0,m,g)}clone(){return new this.constructor().copy(this)}copy(m){this.width=m.width,this.height=m.height,this.depth=m.depth,this.scissor.copy(m.scissor),this.scissorTest=m.scissorTest,this.viewport.copy(m.viewport),this.textures.length=0;for(let g=0,_=m.textures.length;g<_;g++){this.textures[g]=m.textures[g].clone(),this.textures[g].isRenderTargetTexture=!0,this.textures[g].renderTarget=this;let x=Object.assign({},m.textures[g].image);this.textures[g].source=new so(x)}if(this.depthBuffer=m.depthBuffer,this.stencilBuffer=m.stencilBuffer,this.resolveColorBuffer=m.resolveColorBuffer,this.resolveDepthBuffer=m.resolveDepthBuffer,this.resolveStencilBuffer=m.resolveStencilBuffer,this.storeMultisampledColorBuffer=m.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=m.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=m.storeMultisampledStencilBuffer,m.depthTexture!==null)if(m.depthTexture.renderTarget===m){let g=m.depthTexture.clone();g.renderTarget=null,this.depthTexture=g}else this.depthTexture=m.depthTexture;else this.depthTexture=null;return this.samples=m.samples,this.multiview=m.multiview,this.useArrayDepthTexture=m.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $n extends Uu{constructor(m=1,g=1,_={}){super(m,g,_);this.isWebGLRenderTarget=!0}}class Ta extends Vt{constructor(m=null,g=1,_=1,x=1){super(null);this.isDataArrayTexture=!0,this.image={data:m,width:g,height:_,depth:x},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(m){return super.copy(m),this.wrapR=m.wrapR,this}addLayerUpdate(m){this.layerUpdates.add(m)}clearLayerUpdates(){this.layerUpdates.clear()}}class Fu extends Vt{constructor(m=null,g=1,_=1,x=1){super(null);this.isData3DTexture=!0,this.image={data:m,width:g,height:_,depth:x},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(m){return super.copy(m),this.wrapR=m.wrapR,this}}class Qe{static{this.prototype.isMatrix4=!0}constructor(m,g,_,x,y,v,b,S,M,w,E,A,T,R,P,N){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],m!==void 0)this.set(m,g,_,x,y,v,b,S,M,w,E,A,T,R,P,N)}set(m,g,_,x,y,v,b,S,M,w,E,A,T,R,P,N){let C=this.elements;return C[0]=m,C[4]=g,C[8]=_,C[12]=x,C[1]=y,C[5]=v,C[9]=b,C[13]=S,C[2]=M,C[6]=w,C[10]=E,C[14]=A,C[3]=T,C[7]=R,C[11]=P,C[15]=N,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Qe().fromArray(this.elements)}copy(m){let g=this.elements,_=m.elements;return g[0]=_[0],g[1]=_[1],g[2]=_[2],g[3]=_[3],g[4]=_[4],g[5]=_[5],g[6]=_[6],g[7]=_[7],g[8]=_[8],g[9]=_[9],g[10]=_[10],g[11]=_[11],g[12]=_[12],g[13]=_[13],g[14]=_[14],g[15]=_[15],this}copyPosition(m){let g=this.elements,_=m.elements;return g[12]=_[12],g[13]=_[13],g[14]=_[14],this}setFromMatrix3(m){let g=m.elements;return this.set(g[0],g[3],g[6],0,g[1],g[4],g[7],0,g[2],g[5],g[8],0,0,0,0,1),this}extractBasis(m,g,_){if(this.determinantAffine()===0)return m.set(1,0,0),g.set(0,1,0),_.set(0,0,1),this;return m.setFromMatrixColumn(this,0),g.setFromMatrixColumn(this,1),_.setFromMatrixColumn(this,2),this}makeBasis(m,g,_){return this.set(m.x,g.x,_.x,0,m.y,g.y,_.y,0,m.z,g.z,_.z,0,0,0,0,1),this}extractRotation(m){if(m.determinantAffine()===0)return this.identity();let g=this.elements,_=m.elements,x=1/ks.setFromMatrixColumn(m,0).length(),y=1/ks.setFromMatrixColumn(m,1).length(),v=1/ks.setFromMatrixColumn(m,2).length();return g[0]=_[0]*x,g[1]=_[1]*x,g[2]=_[2]*x,g[3]=0,g[4]=_[4]*y,g[5]=_[5]*y,g[6]=_[6]*y,g[7]=0,g[8]=_[8]*v,g[9]=_[9]*v,g[10]=_[10]*v,g[11]=0,g[12]=0,g[13]=0,g[14]=0,g[15]=1,this}makeRotationFromEuler(m){let g=this.elements,{x:_,y:x,z:y}=m,v=Math.cos(_),b=Math.sin(_),S=Math.cos(x),M=Math.sin(x),w=Math.cos(y),E=Math.sin(y);if(m.order==="XYZ"){let A=v*w,T=v*E,R=b*w,P=b*E;g[0]=S*w,g[4]=-S*E,g[8]=M,g[1]=T+R*M,g[5]=A-P*M,g[9]=-b*S,g[2]=P-A*M,g[6]=R+T*M,g[10]=v*S}else if(m.order==="YXZ"){let A=S*w,T=S*E,R=M*w,P=M*E;g[0]=A+P*b,g[4]=R*b-T,g[8]=v*M,g[1]=v*E,g[5]=v*w,g[9]=-b,g[2]=T*b-R,g[6]=P+A*b,g[10]=v*S}else if(m.order==="ZXY"){let A=S*w,T=S*E,R=M*w,P=M*E;g[0]=A-P*b,g[4]=-v*E,g[8]=R+T*b,g[1]=T+R*b,g[5]=v*w,g[9]=P-A*b,g[2]=-v*M,g[6]=b,g[10]=v*S}else if(m.order==="ZYX"){let A=v*w,T=v*E,R=b*w,P=b*E;g[0]=S*w,g[4]=R*M-T,g[8]=A*M+P,g[1]=S*E,g[5]=P*M+A,g[9]=T*M-R,g[2]=-M,g[6]=b*S,g[10]=v*S}else if(m.order==="YZX"){let A=v*S,T=v*M,R=b*S,P=b*M;g[0]=S*w,g[4]=P-A*E,g[8]=R*E+T,g[1]=E,g[5]=v*w,g[9]=-b*w,g[2]=-M*w,g[6]=T*E+R,g[10]=A-P*E}else if(m.order==="XZY"){let A=v*S,T=v*M,R=b*S,P=b*M;g[0]=S*w,g[4]=-E,g[8]=M*w,g[1]=A*E+P,g[5]=v*w,g[9]=T*E-R,g[2]=R*E-T,g[6]=b*w,g[10]=P*E+A}return g[3]=0,g[7]=0,g[11]=0,g[12]=0,g[13]=0,g[14]=0,g[15]=1,this}makeRotationFromQuaternion(m){return this.compose(s_,m,r_)}lookAt(m,g,_){let x=this.elements;if(Bn.subVectors(m,g),Bn.lengthSq()===0)Bn.z=1;if(Bn.normalize(),Hi.crossVectors(_,Bn),Hi.lengthSq()===0){if(Math.abs(_.z)===1)Bn.x+=0.0001;else Bn.z+=0.0001;Bn.normalize(),Hi.crossVectors(_,Bn)}return Hi.normalize(),Go.crossVectors(Bn,Hi),x[0]=Hi.x,x[4]=Go.x,x[8]=Bn.x,x[1]=Hi.y,x[5]=Go.y,x[9]=Bn.y,x[2]=Hi.z,x[6]=Go.z,x[10]=Bn.z,this}multiply(m){return this.multiplyMatrices(this,m)}premultiply(m){return this.multiplyMatrices(m,this)}multiplyMatrices(m,g){let _=m.elements,x=g.elements,y=this.elements,v=_[0],b=_[4],S=_[8],M=_[12],w=_[1],E=_[5],A=_[9],T=_[13],R=_[2],P=_[6],N=_[10],C=_[14],I=_[3],L=_[7],U=_[11],O=_[15],F=x[0],k=x[4],D=x[8],B=x[12],z=x[1],W=x[5],V=x[9],Y=x[13],ee=x[2],X=x[6],ie=x[10],le=x[14],te=x[3],ve=x[7],J=x[11],ae=x[15];return y[0]=v*F+b*z+S*ee+M*te,y[4]=v*k+b*W+S*X+M*ve,y[8]=v*D+b*V+S*ie+M*J,y[12]=v*B+b*Y+S*le+M*ae,y[1]=w*F+E*z+A*ee+T*te,y[5]=w*k+E*W+A*X+T*ve,y[9]=w*D+E*V+A*ie+T*J,y[13]=w*B+E*Y+A*le+T*ae,y[2]=R*F+P*z+N*ee+C*te,y[6]=R*k+P*W+N*X+C*ve,y[10]=R*D+P*V+N*ie+C*J,y[14]=R*B+P*Y+N*le+C*ae,y[3]=I*F+L*z+U*ee+O*te,y[7]=I*k+L*W+U*X+O*ve,y[11]=I*D+L*V+U*ie+O*J,y[15]=I*B+L*Y+U*le+O*ae,this}multiplyScalar(m){let g=this.elements;return g[0]*=m,g[4]*=m,g[8]*=m,g[12]*=m,g[1]*=m,g[5]*=m,g[9]*=m,g[13]*=m,g[2]*=m,g[6]*=m,g[10]*=m,g[14]*=m,g[3]*=m,g[7]*=m,g[11]*=m,g[15]*=m,this}determinant(){let m=this.elements,g=m[0],_=m[4],x=m[8],y=m[12],v=m[1],b=m[5],S=m[9],M=m[13],w=m[2],E=m[6],A=m[10],T=m[14],R=m[3],P=m[7],N=m[11],C=m[15],I=S*T-M*A,L=b*T-M*E,U=b*A-S*E,O=v*T-M*w,F=v*A-S*w,k=v*E-b*w;return g*(P*I-N*L+C*U)-_*(R*I-N*O+C*F)+x*(R*L-P*O+C*k)-y*(R*U-P*F+N*k)}determinantAffine(){let m=this.elements,g=m[0],_=m[4],x=m[8],y=m[1],v=m[5],b=m[9],S=m[2],M=m[6],w=m[10];return g*(v*w-b*M)-_*(y*w-b*S)+x*(y*M-v*S)}transpose(){let m=this.elements,g;return g=m[1],m[1]=m[4],m[4]=g,g=m[2],m[2]=m[8],m[8]=g,g=m[6],m[6]=m[9],m[9]=g,g=m[3],m[3]=m[12],m[12]=g,g=m[7],m[7]=m[13],m[13]=g,g=m[11],m[11]=m[14],m[14]=g,this}setPosition(m,g,_){let x=this.elements;if(m.isVector3)x[12]=m.x,x[13]=m.y,x[14]=m.z;else x[12]=m,x[13]=g,x[14]=_;return this}invert(){let m=this.elements,g=m[0],_=m[1],x=m[2],y=m[3],v=m[4],b=m[5],S=m[6],M=m[7],w=m[8],E=m[9],A=m[10],T=m[11],R=m[12],P=m[13],N=m[14],C=m[15],I=g*b-_*v,L=g*S-x*v,U=g*M-y*v,O=_*S-x*b,F=_*M-y*b,k=x*M-y*S,D=w*P-E*R,B=w*N-A*R,z=w*C-T*R,W=E*N-A*P,V=E*C-T*P,Y=A*C-T*N,ee=I*Y-L*V+U*W+O*z-F*B+k*D;if(ee===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let X=1/ee;return m[0]=(b*Y-S*V+M*W)*X,m[1]=(x*V-_*Y-y*W)*X,m[2]=(P*k-N*F+C*O)*X,m[3]=(A*F-E*k-T*O)*X,m[4]=(S*z-v*Y-M*B)*X,m[5]=(g*Y-x*z+y*B)*X,m[6]=(N*U-R*k-C*L)*X,m[7]=(w*k-A*U+T*L)*X,m[8]=(v*V-b*z+M*D)*X,m[9]=(_*z-g*V-y*D)*X,m[10]=(R*F-P*U+C*I)*X,m[11]=(E*U-w*F-T*I)*X,m[12]=(b*B-v*W-S*D)*X,m[13]=(g*W-_*B+x*D)*X,m[14]=(P*L-R*O-N*I)*X,m[15]=(w*O-E*L+A*I)*X,this}scale(m){let g=this.elements,{x:_,y:x,z:y}=m;return g[0]*=_,g[4]*=x,g[8]*=y,g[1]*=_,g[5]*=x,g[9]*=y,g[2]*=_,g[6]*=x,g[10]*=y,g[3]*=_,g[7]*=x,g[11]*=y,this}getMaxScaleOnAxis(){let m=this.elements,g=m[0]*m[0]+m[1]*m[1]+m[2]*m[2],_=m[4]*m[4]+m[5]*m[5]+m[6]*m[6],x=m[8]*m[8]+m[9]*m[9]+m[10]*m[10];return Math.sqrt(Math.max(g,_,x))}makeTranslation(m,g,_){if(m.isVector3)this.set(1,0,0,m.x,0,1,0,m.y,0,0,1,m.z,0,0,0,1);else this.set(1,0,0,m,0,1,0,g,0,0,1,_,0,0,0,1);return this}makeRotationX(m){let g=Math.cos(m),_=Math.sin(m);return this.set(1,0,0,0,0,g,-_,0,0,_,g,0,0,0,0,1),this}makeRotationY(m){let g=Math.cos(m),_=Math.sin(m);return this.set(g,0,_,0,0,1,0,0,-_,0,g,0,0,0,0,1),this}makeRotationZ(m){let g=Math.cos(m),_=Math.sin(m);return this.set(g,-_,0,0,_,g,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(m,g){let _=Math.cos(g),x=Math.sin(g),y=1-_,{x:v,y:b,z:S}=m,M=y*v,w=y*b;return this.set(M*v+_,M*b-x*S,M*S+x*b,0,M*b+x*S,w*b+_,w*S-x*v,0,M*S-x*b,w*S+x*v,y*S*S+_,0,0,0,0,1),this}makeScale(m,g,_){return this.set(m,0,0,0,0,g,0,0,0,0,_,0,0,0,0,1),this}makeShear(m,g,_,x,y,v){return this.set(1,_,y,0,m,1,v,0,g,x,1,0,0,0,0,1),this}compose(m,g,_){let x=this.elements,{_x:y,_y:v,_z:b,_w:S}=g,M=y+y,w=v+v,E=b+b,A=y*M,T=y*w,R=y*E,P=v*w,N=v*E,C=b*E,I=S*M,L=S*w,U=S*E,{x:O,y:F,z:k}=_;return x[0]=(1-(P+C))*O,x[1]=(T+U)*O,x[2]=(R-L)*O,x[3]=0,x[4]=(T-U)*F,x[5]=(1-(A+C))*F,x[6]=(N+I)*F,x[7]=0,x[8]=(R+L)*k,x[9]=(N-I)*k,x[10]=(1-(A+P))*k,x[11]=0,x[12]=m.x,x[13]=m.y,x[14]=m.z,x[15]=1,this}decompose(m,g,_){let x=this.elements;m.x=x[12],m.y=x[13],m.z=x[14];let y=this.determinantAffine();if(y===0)return _.set(1,1,1),g.identity(),this;let v=ks.set(x[0],x[1],x[2]).length(),b=ks.set(x[4],x[5],x[6]).length(),S=ks.set(x[8],x[9],x[10]).length();if(y<0)v=-v;ei.copy(this);let M=1/v,w=1/b,E=1/S;return ei.elements[0]*=M,ei.elements[1]*=M,ei.elements[2]*=M,ei.elements[4]*=w,ei.elements[5]*=w,ei.elements[6]*=w,ei.elements[8]*=E,ei.elements[9]*=E,ei.elements[10]*=E,g.setFromRotationMatrix(ei),_.x=v,_.y=b,_.z=S,this}makePerspective(m,g,_,x,y,v,b=2000,S=!1){let M=this.elements,w=2*y/(g-m),E=2*y/(_-x),A=(g+m)/(g-m),T=(_+x)/(_-x),R,P;if(S)R=y/(v-y),P=v*y/(v-y);else if(b===2000)R=-(v+y)/(v-y),P=-2*v*y/(v-y);else if(b===2001)R=-v/(v-y),P=-v*y/(v-y);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+b);return M[0]=w,M[4]=0,M[8]=A,M[12]=0,M[1]=0,M[5]=E,M[9]=T,M[13]=0,M[2]=0,M[6]=0,M[10]=R,M[14]=P,M[3]=0,M[7]=0,M[11]=-1,M[15]=0,this}makeOrthographic(m,g,_,x,y,v,b=2000,S=!1){let M=this.elements,w=2/(g-m),E=2/(_-x),A=-(g+m)/(g-m),T=-(_+x)/(_-x),R,P;if(S)R=1/(v-y),P=v/(v-y);else if(b===2000)R=-2/(v-y),P=-(v+y)/(v-y);else if(b===2001)R=-1/(v-y),P=-y/(v-y);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+b);return M[0]=w,M[4]=0,M[8]=0,M[12]=A,M[1]=0,M[5]=E,M[9]=0,M[13]=T,M[2]=0,M[6]=0,M[10]=R,M[14]=P,M[3]=0,M[7]=0,M[11]=0,M[15]=1,this}equals(m){let g=this.elements,_=m.elements;for(let x=0;x<16;x++)if(g[x]!==_[x])return!1;return!0}fromArray(m,g=0){for(let _=0;_<16;_++)this.elements[_]=m[_+g];return this}toArray(m=[],g=0){let _=this.elements;return m[g]=_[0],m[g+1]=_[1],m[g+2]=_[2],m[g+3]=_[3],m[g+4]=_[4],m[g+5]=_[5],m[g+6]=_[6],m[g+7]=_[7],m[g+8]=_[8],m[g+9]=_[9],m[g+10]=_[10],m[g+11]=_[11],m[g+12]=_[12],m[g+13]=_[13],m[g+14]=_[14],m[g+15]=_[15],m}}var ks=new Z,ei=new Qe,s_=new Z(0,0,0),r_=new Z(1,1,1),Hi=new Z,Go=new Z,Bn=new Z,ef=new Qe,tf=new Ni;class Ai{constructor(m=0,g=0,_=0,x=Ai.DEFAULT_ORDER){this.isEuler=!0,this._x=m,this._y=g,this._z=_,this._order=x}get x(){return this._x}set x(m){this._x=m,this._onChangeCallback()}get y(){return this._y}set y(m){this._y=m,this._onChangeCallback()}get z(){return this._z}set z(m){this._z=m,this._onChangeCallback()}get order(){return this._order}set order(m){this._order=m,this._onChangeCallback()}set(m,g,_,x=this._order){return this._x=m,this._y=g,this._z=_,this._order=x,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(m){return this._x=m._x,this._y=m._y,this._z=m._z,this._order=m._order,this._onChangeCallback(),this}setFromRotationMatrix(m,g=this._order,_=!0){let x=m.elements,y=x[0],v=x[4],b=x[8],S=x[1],M=x[5],w=x[9],E=x[2],A=x[6],T=x[10];switch(g){case"XYZ":if(this._y=Math.asin(it(b,-1,1)),Math.abs(b)<0.9999999)this._x=Math.atan2(-w,T),this._z=Math.atan2(-v,y);else this._x=Math.atan2(A,M),this._z=0;break;case"YXZ":if(this._x=Math.asin(-it(w,-1,1)),Math.abs(w)<0.9999999)this._y=Math.atan2(b,T),this._z=Math.atan2(S,M);else this._y=Math.atan2(-E,y),this._z=0;break;case"ZXY":if(this._x=Math.asin(it(A,-1,1)),Math.abs(A)<0.9999999)this._y=Math.atan2(-E,T),this._z=Math.atan2(-v,M);else this._y=0,this._z=Math.atan2(S,y);break;case"ZYX":if(this._y=Math.asin(-it(E,-1,1)),Math.abs(E)<0.9999999)this._x=Math.atan2(A,T),this._z=Math.atan2(S,y);else this._x=0,this._z=Math.atan2(-v,M);break;case"YZX":if(this._z=Math.asin(it(S,-1,1)),Math.abs(S)<0.9999999)this._x=Math.atan2(-w,M),this._y=Math.atan2(-E,y);else this._x=0,this._y=Math.atan2(b,T);break;case"XZY":if(this._z=Math.asin(-it(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(A,M),this._y=Math.atan2(b,y);else this._x=Math.atan2(-w,T),this._y=0;break;default:qe("Euler: .setFromRotationMatrix() encountered an unknown order: "+g)}if(this._order=g,_===!0)this._onChangeCallback();return this}setFromQuaternion(m,g,_){return ef.makeRotationFromQuaternion(m),this.setFromRotationMatrix(ef,g,_)}setFromVector3(m,g=this._order){return this.set(m.x,m.y,m.z,g)}reorder(m){return tf.setFromEuler(this),this.setFromQuaternion(tf,m)}equals(m){return m._x===this._x&&m._y===this._y&&m._z===this._z&&m._order===this._order}fromArray(m){if(this._x=m[0],this._y=m[1],this._z=m[2],m[3]!==void 0)this._order=m[3];return this._onChangeCallback(),this}toArray(m=[],g=0){return m[g]=this._x,m[g+1]=this._y,m[g+2]=this._z,m[g+3]=this._order,m}_onChange(m){return this._onChangeCallback=m,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ai.DEFAULT_ORDER="XYZ";class ro{constructor(){this.mask=1}set(m){this.mask=(1<<m|0)>>>0}enable(m){this.mask|=1<<m|0}enableAll(){this.mask=-1}toggle(m){this.mask^=1<<m|0}disable(m){this.mask&=~(1<<m|0)}disableAll(){this.mask=0}test(m){return(this.mask&m.mask)!==0}isEnabled(m){return(this.mask&(1<<m|0))!==0}}var o_=0,nf=new Z,zs=new Ni,vi=new Qe,Vo=new Z,zr=new Z,a_=new Z,l_=new Ni,sf=new Z(1,0,0),rf=new Z(0,1,0),of=new Z(0,0,1),af={type:"added"},c_={type:"removed"},Hs={type:"childadded",child:null},lc={type:"childremoved",child:null};class nn extends Ii{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:o_++}),this.uuid=ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=nn.DEFAULT_UP.clone();let m=new Z,g=new Ai,_=new Ni,x=new Z(1,1,1);function y(){_.setFromEuler(g,!1)}function v(){g.setFromQuaternion(_,void 0,!1)}g._onChange(y),_._onChange(v),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:m},rotation:{configurable:!0,enumerable:!0,value:g},quaternion:{configurable:!0,enumerable:!0,value:_},scale:{configurable:!0,enumerable:!0,value:x},modelViewMatrix:{value:new Qe},normalMatrix:{value:new et}}),this.matrix=new Qe,this.matrixWorld=new Qe,this.matrixAutoUpdate=nn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=nn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ro,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(m){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(m),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(m){return this.quaternion.premultiply(m),this}setRotationFromAxisAngle(m,g){this.quaternion.setFromAxisAngle(m,g)}setRotationFromEuler(m){this.quaternion.setFromEuler(m,!0)}setRotationFromMatrix(m){this.quaternion.setFromRotationMatrix(m)}setRotationFromQuaternion(m){this.quaternion.copy(m)}rotateOnAxis(m,g){return zs.setFromAxisAngle(m,g),this.quaternion.multiply(zs),this}rotateOnWorldAxis(m,g){return zs.setFromAxisAngle(m,g),this.quaternion.premultiply(zs),this}rotateX(m){return this.rotateOnAxis(sf,m)}rotateY(m){return this.rotateOnAxis(rf,m)}rotateZ(m){return this.rotateOnAxis(of,m)}translateOnAxis(m,g){return nf.copy(m).applyQuaternion(this.quaternion),this.position.add(nf.multiplyScalar(g)),this}translateX(m){return this.translateOnAxis(sf,m)}translateY(m){return this.translateOnAxis(rf,m)}translateZ(m){return this.translateOnAxis(of,m)}localToWorld(m){return this.updateWorldMatrix(!0,!1),m.applyMatrix4(this.matrixWorld)}worldToLocal(m){return this.updateWorldMatrix(!0,!1),m.applyMatrix4(vi.copy(this.matrixWorld).invert())}lookAt(m,g,_){if(m.isVector3)Vo.copy(m);else Vo.set(m,g,_);let x=this.parent;if(this.updateWorldMatrix(!0,!1),zr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)vi.lookAt(zr,Vo,this.up);else vi.lookAt(Vo,zr,this.up);if(this.quaternion.setFromRotationMatrix(vi),x)vi.extractRotation(x.matrixWorld),zs.setFromRotationMatrix(vi),this.quaternion.premultiply(zs.invert())}add(m){if(arguments.length>1){for(let g=0;g<arguments.length;g++)this.add(arguments[g]);return this}if(m===this)return Je("Object3D.add: object can't be added as a child of itself.",m),this;if(m&&m.isObject3D)m.removeFromParent(),m.parent=this,this.children.push(m),m.dispatchEvent(af),Hs.child=m,this.dispatchEvent(Hs),Hs.child=null;else Je("Object3D.add: object not an instance of THREE.Object3D.",m);return this}remove(m){if(arguments.length>1){for(let _=0;_<arguments.length;_++)this.remove(arguments[_]);return this}let g=this.children.indexOf(m);if(g!==-1)m.parent=null,this.children.splice(g,1),m.dispatchEvent(c_),lc.child=m,this.dispatchEvent(lc),lc.child=null;return this}removeFromParent(){let m=this.parent;if(m!==null)m.remove(this);return this}clear(){return this.remove(...this.children)}attach(m){if(this.updateWorldMatrix(!0,!1),vi.copy(this.matrixWorld).invert(),m.parent!==null)m.parent.updateWorldMatrix(!0,!1),vi.multiply(m.parent.matrixWorld);return m.applyMatrix4(vi),m.removeFromParent(),m.parent=this,this.children.push(m),m.updateWorldMatrix(!1,!0),m.dispatchEvent(af),Hs.child=m,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(m){return this.getObjectByProperty("id",m)}getObjectByName(m){return this.getObjectByProperty("name",m)}getObjectByProperty(m,g){if(this[m]===g)return this;for(let _=0,x=this.children.length;_<x;_++){let v=this.children[_].getObjectByProperty(m,g);if(v!==void 0)return v}return}getObjectsByProperty(m,g,_=[]){if(this[m]===g)_.push(this);let x=this.children;for(let y=0,v=x.length;y<v;y++)x[y].getObjectsByProperty(m,g,_);return _}getWorldPosition(m){return this.updateWorldMatrix(!0,!1),m.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(m){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,m,a_),m}getWorldScale(m){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,l_,m),m}getWorldDirection(m){this.updateWorldMatrix(!0,!1);let g=this.matrixWorld.elements;return m.set(g[8],g[9],g[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(m){m(this);let g=this.children;for(let _=0,x=g.length;_<x;_++)g[_].traverse(m)}traverseVisible(m){if(this.visible===!1)return;m(this);let g=this.children;for(let _=0,x=g.length;_<x;_++)g[_].traverseVisible(m)}traverseAncestors(m){let g=this.parent;if(g!==null)m(g),g.traverseAncestors(m)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let m=this.pivot;if(m!==null){let{x:g,y:_,z:x}=m,y=this.matrix.elements;y[12]+=g-y[0]*g-y[4]*_-y[8]*x,y[13]+=_-y[1]*g-y[5]*_-y[9]*x,y[14]+=x-y[2]*g-y[6]*_-y[10]*x}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(m){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||m){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,m=!0}let g=this.children;for(let _=0,x=g.length;_<x;_++)g[_].updateMatrixWorld(m)}updateWorldMatrix(m,g,_=!1){let x=this.parent;if(m===!0&&x!==null)x.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||_){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,_=!0}if(g===!0){let y=this.children;for(let v=0,b=y.length;v<b;v++)y[v].updateWorldMatrix(!1,!0,_)}}toJSON(m){let g=m===void 0||typeof m==="string",_={};if(g)m={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},_.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let x={};if(x.uuid=this.uuid,x.type=this.type,x.name=this.name,x.castShadow=this.castShadow,x.receiveShadow=this.receiveShadow,x.visible=this.visible,x.frustumCulled=this.frustumCulled,x.renderOrder=this.renderOrder,x.static=this.static,x.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)x.userData=this.userData;if(x.layers=this.layers.mask,x.matrix=this.matrix.toArray(),x.up=this.up.toArray(),this.pivot!==null)x.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)x.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)x.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(x.type="InstancedMesh",x.count=this.count,x.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)x.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(x.type="BatchedMesh",x.perObjectFrustumCulled=this.perObjectFrustumCulled,x.sortObjects=this.sortObjects,x.drawRanges=this._drawRanges,x.reservedRanges=this._reservedRanges,x.geometryInfo=this._geometryInfo.map((b)=>({...b,boundingBox:b.boundingBox?b.boundingBox.toJSON():void 0,boundingSphere:b.boundingSphere?b.boundingSphere.toJSON():void 0})),x.instanceInfo=this._instanceInfo.map((b)=>({...b})),x.availableInstanceIds=this._availableInstanceIds.slice(),x.availableGeometryIds=this._availableGeometryIds.slice(),x.nextIndexStart=this._nextIndexStart,x.nextVertexStart=this._nextVertexStart,x.geometryCount=this._geometryCount,x.maxInstanceCount=this._maxInstanceCount,x.maxVertexCount=this._maxVertexCount,x.maxIndexCount=this._maxIndexCount,x.geometryInitialized=this._geometryInitialized,x.matricesTexture=this._matricesTexture.toJSON(m),x.indirectTexture=this._indirectTexture.toJSON(m),this._colorsTexture!==null)x.colorsTexture=this._colorsTexture.toJSON(m);if(this.boundingSphere!==null)x.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)x.boundingBox=this.boundingBox.toJSON()}function y(b,S){if(b[S.uuid]===void 0)b[S.uuid]=S.toJSON(m);return S.uuid}if(this.isScene){if(this.background){if(this.background.isColor)x.background=this.background.toJSON();else if(this.background.isTexture)x.background=this.background.toJSON(m).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)x.environment=this.environment.toJSON(m).uuid}else if(this.isMesh||this.isLine||this.isPoints){x.geometry=y(m.geometries,this.geometry);let b=this.geometry.parameters;if(b!==void 0&&b.shapes!==void 0){let S=b.shapes;if(Array.isArray(S))for(let M=0,w=S.length;M<w;M++){let E=S[M];y(m.shapes,E)}else y(m.shapes,S)}}if(this.isSkinnedMesh){if(x.bindMode=this.bindMode,x.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)y(m.skeletons,this.skeleton),x.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let b=[];for(let S=0,M=this.material.length;S<M;S++)b.push(y(m.materials,this.material[S]));x.material=b}else x.material=y(m.materials,this.material);if(this.children.length>0){x.children=[];for(let b=0;b<this.children.length;b++)x.children.push(this.children[b].toJSON(m).object)}if(this.animations.length>0){x.animations=[];for(let b=0;b<this.animations.length;b++){let S=this.animations[b];x.animations.push(y(m.animations,S))}}if(g){let b=v(m.geometries),S=v(m.materials),M=v(m.textures),w=v(m.images),E=v(m.shapes),A=v(m.skeletons),T=v(m.animations),R=v(m.nodes);if(b.length>0)_.geometries=b;if(S.length>0)_.materials=S;if(M.length>0)_.textures=M;if(w.length>0)_.images=w;if(E.length>0)_.shapes=E;if(A.length>0)_.skeletons=A;if(T.length>0)_.animations=T;if(R.length>0)_.nodes=R}return _.object=x,_;function v(b){let S=[];for(let M in b){let w=b[M];delete w.metadata,S.push(w)}return S}}clone(m){return new this.constructor().copy(this,m)}copy(m,g=!0){if(this.name=m.name,this.up.copy(m.up),this.position.copy(m.position),this.rotation.order=m.rotation.order,this.quaternion.copy(m.quaternion),this.scale.copy(m.scale),this.pivot=m.pivot!==null?m.pivot.clone():null,this.matrix.copy(m.matrix),this.matrixWorld.copy(m.matrixWorld),this.matrixAutoUpdate=m.matrixAutoUpdate,this.matrixWorldAutoUpdate=m.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=m.matrixWorldNeedsUpdate,this.layers.mask=m.layers.mask,this.visible=m.visible,this.castShadow=m.castShadow,this.receiveShadow=m.receiveShadow,this.frustumCulled=m.frustumCulled,this.renderOrder=m.renderOrder,this.static=m.static,this.animations=m.animations.slice(),this.userData=JSON.parse(JSON.stringify(m.userData)),g===!0)for(let _=0;_<m.children.length;_++){let x=m.children[_];this.add(x.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}nn.DEFAULT_UP=new Z(0,1,0);nn.DEFAULT_MATRIX_AUTO_UPDATE=!0;nn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class qi extends nn{constructor(){super();this.isGroup=!0,this.type="Group"}}var u_={type:"move"};class oo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new qi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new qi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Z,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Z;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new qi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Z,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Z,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(m){if(this._targetRay!==null)this._targetRay.dispatchEvent(m);if(this._grip!==null)this._grip.dispatchEvent(m);if(this._hand!==null)this._hand.dispatchEvent(m);return this}connect(m){if(m&&m.hand){let g=this._hand;if(g)for(let _ of m.hand.values())this._getHandJoint(g,_)}return this.dispatchEvent({type:"connected",data:m}),this}disconnect(m){if(this.dispatchEvent({type:"disconnected",data:m}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(m,g,_){let x=null,y=null,v=null,b=this._targetRay,S=this._grip,M=this._hand;if(m&&g.session.visibilityState!=="visible-blurred"){if(M&&m.hand){v=!0;for(let P of m.hand.values()){let N=g.getJointPose(P,_),C=this._getHandJoint(M,P);if(N!==null)C.matrix.fromArray(N.transform.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale),C.matrixWorldNeedsUpdate=!0,C.jointRadius=N.radius;C.visible=N!==null}let w=M.joints["index-finger-tip"],E=M.joints["thumb-tip"],A=w.position.distanceTo(E.position),T=0.02,R=0.005;if(M.inputState.pinching&&A>T+R)M.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:m.handedness,target:this});else if(!M.inputState.pinching&&A<=T-R)M.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:m.handedness,target:this})}else if(S!==null&&m.gripSpace){if(y=g.getPose(m.gripSpace,_),y!==null){if(S.matrix.fromArray(y.transform.matrix),S.matrix.decompose(S.position,S.quaternion,S.scale),S.matrixWorldNeedsUpdate=!0,y.linearVelocity)S.hasLinearVelocity=!0,S.linearVelocity.copy(y.linearVelocity);else S.hasLinearVelocity=!1;if(y.angularVelocity)S.hasAngularVelocity=!0,S.angularVelocity.copy(y.angularVelocity);else S.hasAngularVelocity=!1;if(S.eventsEnabled)S.dispatchEvent({type:"gripUpdated",data:m,target:this})}}if(b!==null){if(x=g.getPose(m.targetRaySpace,_),x===null&&y!==null)x=y;if(x!==null){if(b.matrix.fromArray(x.transform.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale),b.matrixWorldNeedsUpdate=!0,x.linearVelocity)b.hasLinearVelocity=!0,b.linearVelocity.copy(x.linearVelocity);else b.hasLinearVelocity=!1;if(x.angularVelocity)b.hasAngularVelocity=!0,b.angularVelocity.copy(x.angularVelocity);else b.hasAngularVelocity=!1;this.dispatchEvent(u_)}}}if(b!==null)b.visible=x!==null;if(S!==null)S.visible=y!==null;if(M!==null)M.visible=v!==null;return this}_getHandJoint(m,g){if(m.joints[g.jointName]===void 0){let _=new qi;_.matrixAutoUpdate=!1,_.visible=!1,m.joints[g.jointName]=_,m.add(_)}return m.joints[g.jointName]}}var Ip={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Gi={h:0,s:0,l:0},Wo={h:0,s:0,l:0};function cc(m,g,_){if(_<0)_+=1;if(_>1)_-=1;if(_<0.16666666666666666)return m+(g-m)*6*_;if(_<0.5)return g;if(_<0.6666666666666666)return m+(g-m)*6*(0.6666666666666666-_);return m}class st{constructor(m,g,_){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(m,g,_)}set(m,g,_){if(g===void 0&&_===void 0){let x=m;if(x&&x.isColor)this.copy(x);else if(typeof x==="number")this.setHex(x);else if(typeof x==="string")this.setStyle(x)}else this.setRGB(m,g,_);return this}setScalar(m){return this.r=m,this.g=m,this.b=m,this}setHex(m,g="srgb"){return m=Math.floor(m),this.r=(m>>16&255)/255,this.g=(m>>8&255)/255,this.b=(m&255)/255,ut.colorSpaceToWorking(this,g),this}setRGB(m,g,_,x=ut.workingColorSpace){return this.r=m,this.g=g,this.b=_,ut.colorSpaceToWorking(this,x),this}setHSL(m,g,_,x=ut.workingColorSpace){if(m=Iu(m,1),g=it(g,0,1),_=it(_,0,1),g===0)this.r=this.g=this.b=_;else{let y=_<=0.5?_*(1+g):_+g-_*g,v=2*_-y;this.r=cc(v,y,m+0.3333333333333333),this.g=cc(v,y,m),this.b=cc(v,y,m-0.3333333333333333)}return ut.colorSpaceToWorking(this,x),this}setStyle(m,g="srgb"){function _(y){if(y===void 0)return;if(parseFloat(y)<1)qe("Color: Alpha component of "+m+" will be ignored.")}let x;if(x=/^(\w+)\(([^\)]*)\)/.exec(m)){let y,v=x[1],b=x[2];switch(v){case"rgb":case"rgba":if(y=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(b))return _(y[4]),this.setRGB(Math.min(255,parseInt(y[1],10))/255,Math.min(255,parseInt(y[2],10))/255,Math.min(255,parseInt(y[3],10))/255,g);if(y=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(b))return _(y[4]),this.setRGB(Math.min(100,parseFloat(y[1]))/100,Math.min(100,parseFloat(y[2]))/100,Math.min(100,parseFloat(y[3]))/100,g);break;case"hsl":case"hsla":if(y=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(b))return _(y[4]),this.setHSL(parseFloat(y[1])/360,parseFloat(y[2])/100,parseFloat(y[3])/100,g);break;default:qe("Color: Unknown color model "+m)}}else if(x=/^\#([A-Fa-f\d]+)$/.exec(m)){let y=x[1],v=y.length;if(v===3)return this.setRGB(parseInt(y.charAt(0),16)/15,parseInt(y.charAt(1),16)/15,parseInt(y.charAt(2),16)/15,g);else if(v===6)return this.setHex(parseInt(y,16),g);else qe("Color: Invalid hex color "+m)}else if(m&&m.length>0)return this.setColorName(m,g);return this}setColorName(m,g="srgb"){let _=Ip[m.toLowerCase()];if(_!==void 0)this.setHex(_,g);else qe("Color: Unknown color "+m);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(m){return this.r=m.r,this.g=m.g,this.b=m.b,this}copySRGBToLinear(m){return this.r=Ti(m.r),this.g=Ti(m.g),this.b=Ti(m.b),this}copyLinearToSRGB(m){return this.r=Qs(m.r),this.g=Qs(m.g),this.b=Qs(m.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(m="srgb"){return ut.workingToColorSpace(bn.copy(this),m),Math.round(it(bn.r*255,0,255))*65536+Math.round(it(bn.g*255,0,255))*256+Math.round(it(bn.b*255,0,255))}getHexString(m="srgb"){return("000000"+this.getHex(m).toString(16)).slice(-6)}getHSL(m,g=ut.workingColorSpace){ut.workingToColorSpace(bn.copy(this),g);let{r:_,g:x,b:y}=bn,v=Math.max(_,x,y),b=Math.min(_,x,y),S,M,w=(b+v)/2;if(b===v)S=0,M=0;else{let E=v-b;switch(M=w<=0.5?E/(v+b):E/(2-v-b),v){case _:S=(x-y)/E+(x<y?6:0);break;case x:S=(y-_)/E+2;break;case y:S=(_-x)/E+4;break}S/=6}return m.h=S,m.s=M,m.l=w,m}getRGB(m,g=ut.workingColorSpace){return ut.workingToColorSpace(bn.copy(this),g),m.r=bn.r,m.g=bn.g,m.b=bn.b,m}getStyle(m="srgb"){ut.workingToColorSpace(bn.copy(this),m);let{r:g,g:_,b:x}=bn;if(m!=="srgb")return`color(${m} ${g.toFixed(3)} ${_.toFixed(3)} ${x.toFixed(3)})`;return`rgb(${Math.round(g*255)},${Math.round(_*255)},${Math.round(x*255)})`}offsetHSL(m,g,_){return this.getHSL(Gi),this.setHSL(Gi.h+m,Gi.s+g,Gi.l+_)}add(m){return this.r+=m.r,this.g+=m.g,this.b+=m.b,this}addColors(m,g){return this.r=m.r+g.r,this.g=m.g+g.g,this.b=m.b+g.b,this}addScalar(m){return this.r+=m,this.g+=m,this.b+=m,this}sub(m){return this.r=Math.max(0,this.r-m.r),this.g=Math.max(0,this.g-m.g),this.b=Math.max(0,this.b-m.b),this}multiply(m){return this.r*=m.r,this.g*=m.g,this.b*=m.b,this}multiplyScalar(m){return this.r*=m,this.g*=m,this.b*=m,this}lerp(m,g){return this.r+=(m.r-this.r)*g,this.g+=(m.g-this.g)*g,this.b+=(m.b-this.b)*g,this}lerpColors(m,g,_){return this.r=m.r+(g.r-m.r)*_,this.g=m.g+(g.g-m.g)*_,this.b=m.b+(g.b-m.b)*_,this}lerpHSL(m,g){this.getHSL(Gi),m.getHSL(Wo);let _=Yr(Gi.h,Wo.h,g),x=Yr(Gi.s,Wo.s,g),y=Yr(Gi.l,Wo.l,g);return this.setHSL(_,x,y),this}setFromVector3(m){return this.r=m.x,this.g=m.y,this.b=m.z,this}applyMatrix3(m){let g=this.r,_=this.g,x=this.b,y=m.elements;return this.r=y[0]*g+y[3]*_+y[6]*x,this.g=y[1]*g+y[4]*_+y[7]*x,this.b=y[2]*g+y[5]*_+y[8]*x,this}equals(m){return m.r===this.r&&m.g===this.g&&m.b===this.b}fromArray(m,g=0){return this.r=m[g],this.g=m[g+1],this.b=m[g+2],this}toArray(m=[],g=0){return m[g]=this.r,m[g+1]=this.g,m[g+2]=this.b,m}fromBufferAttribute(m,g){return this.r=m.getX(g),this.g=m.getY(g),this.b=m.getZ(g),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var bn=new st;st.NAMES=Ip;class Aa extends nn{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ai,this.environmentIntensity=1,this.environmentRotation=new Ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(m,g){return super.copy(m,g),this.background=m.background!==null?m.background.clone():null,this.environment=m.environment!==null?m.environment.clone():null,this.fog=m.fog!==null?m.fog.clone():null,this.backgroundBlurriness=m.backgroundBlurriness,this.backgroundIntensity=m.backgroundIntensity,this.backgroundRotation.copy(m.backgroundRotation),this.environmentIntensity=m.environmentIntensity,this.environmentRotation.copy(m.environmentRotation),this.overrideMaterial=m.overrideMaterial!==null?m.overrideMaterial.clone():null,this.matrixAutoUpdate=m.matrixAutoUpdate,this}toJSON(m){let g=super.toJSON(m);if(this.fog!==null)g.object.fog=this.fog.toJSON();return g.object.backgroundBlurriness=this.backgroundBlurriness,g.object.backgroundIntensity=this.backgroundIntensity,g.object.backgroundRotation=this.backgroundRotation.toArray(),g.object.environmentIntensity=this.environmentIntensity,g.object.environmentRotation=this.environmentRotation.toArray(),g}}var ti=new Z,bi=new Z,uc=new Z,Si=new Z,Gs=new Z,Vs=new Z,lf=new Z,hc=new Z,dc=new Z,fc=new Z,pc=new Ht,mc=new Ht,gc=new Ht;class jt{constructor(m=new Z,g=new Z,_=new Z){this.a=m,this.b=g,this.c=_}static getNormal(m,g,_,x){x.subVectors(_,g),ti.subVectors(m,g),x.cross(ti);let y=x.lengthSq();if(y>0)return x.multiplyScalar(1/Math.sqrt(y));return x.set(0,0,0)}static getBarycoord(m,g,_,x,y){ti.subVectors(x,g),bi.subVectors(_,g),uc.subVectors(m,g);let v=ti.dot(ti),b=ti.dot(bi),S=ti.dot(uc),M=bi.dot(bi),w=bi.dot(uc),E=v*M-b*b;if(E===0)return y.set(0,0,0),null;let A=1/E,T=(M*S-b*w)*A,R=(v*w-b*S)*A;return y.set(1-T-R,R,T)}static containsPoint(m,g,_,x){if(this.getBarycoord(m,g,_,x,Si)===null)return!1;return Si.x>=0&&Si.y>=0&&Si.x+Si.y<=1}static getInterpolation(m,g,_,x,y,v,b,S){if(this.getBarycoord(m,g,_,x,Si)===null){if(S.x=0,S.y=0,"z"in S)S.z=0;if("w"in S)S.w=0;return null}return S.setScalar(0),S.addScaledVector(y,Si.x),S.addScaledVector(v,Si.y),S.addScaledVector(b,Si.z),S}static getInterpolatedAttribute(m,g,_,x,y,v){return pc.setScalar(0),mc.setScalar(0),gc.setScalar(0),pc.fromBufferAttribute(m,g),mc.fromBufferAttribute(m,_),gc.fromBufferAttribute(m,x),v.setScalar(0),v.addScaledVector(pc,y.x),v.addScaledVector(mc,y.y),v.addScaledVector(gc,y.z),v}static isFrontFacing(m,g,_,x){return ti.subVectors(_,g),bi.subVectors(m,g),ti.cross(bi).dot(x)<0}set(m,g,_){return this.a.copy(m),this.b.copy(g),this.c.copy(_),this}setFromPointsAndIndices(m,g,_,x){return this.a.copy(m[g]),this.b.copy(m[_]),this.c.copy(m[x]),this}setFromAttributeAndIndices(m,g,_,x){return this.a.fromBufferAttribute(m,g),this.b.fromBufferAttribute(m,_),this.c.fromBufferAttribute(m,x),this}clone(){return new this.constructor().copy(this)}copy(m){return this.a.copy(m.a),this.b.copy(m.b),this.c.copy(m.c),this}getArea(){return ti.subVectors(this.c,this.b),bi.subVectors(this.a,this.b),ti.cross(bi).length()*0.5}getMidpoint(m){return m.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(m){return jt.getNormal(this.a,this.b,this.c,m)}getPlane(m){return m.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(m,g){return jt.getBarycoord(m,this.a,this.b,this.c,g)}getInterpolation(m,g,_,x,y){return jt.getInterpolation(m,this.a,this.b,this.c,g,_,x,y)}containsPoint(m){return jt.containsPoint(m,this.a,this.b,this.c)}isFrontFacing(m){return jt.isFrontFacing(this.a,this.b,this.c,m)}intersectsBox(m){return m.intersectsTriangle(this)}closestPointToPoint(m,g){let _=this.a,x=this.b,y=this.c,v,b;Gs.subVectors(x,_),Vs.subVectors(y,_),hc.subVectors(m,_);let S=Gs.dot(hc),M=Vs.dot(hc);if(S<=0&&M<=0)return g.copy(_);dc.subVectors(m,x);let w=Gs.dot(dc),E=Vs.dot(dc);if(w>=0&&E<=w)return g.copy(x);let A=S*E-w*M;if(A<=0&&S>=0&&w<=0&&S-w>0)return v=S/(S-w),g.copy(_).addScaledVector(Gs,v);fc.subVectors(m,y);let T=Gs.dot(fc),R=Vs.dot(fc);if(R>=0&&T<=R)return g.copy(y);let P=T*M-S*R;if(P<=0&&M>=0&&R<=0)return b=M/(M-R),g.copy(_).addScaledVector(Vs,b);let N=w*R-T*E;if(N<=0&&E-w>=0&&T-R>=0)return lf.subVectors(y,x),b=(E-w)/(E-w+(T-R)),g.copy(x).addScaledVector(lf,b);let C=1/(N+P+A);return v=P*C,b=A*C,g.copy(_).addScaledVector(Gs,v).addScaledVector(Vs,b)}equals(m){return m.a.equals(this.a)&&m.b.equals(this.b)&&m.c.equals(this.c)}}class yt{constructor(m=new Z(1/0,1/0,1/0),g=new Z(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=m,this.max=g}set(m,g){return this.min.copy(m),this.max.copy(g),this}setFromArray(m){this.makeEmpty();for(let g=0,_=m.length;g<_;g+=3)this.expandByPoint(ni.fromArray(m,g));return this}setFromBufferAttribute(m){this.makeEmpty();for(let g=0,_=m.count;g<_;g++)this.expandByPoint(ni.fromBufferAttribute(m,g));return this}setFromPoints(m){this.makeEmpty();for(let g=0,_=m.length;g<_;g++)this.expandByPoint(m[g]);return this}setFromCenterAndSize(m,g){let _=ni.copy(g).multiplyScalar(0.5);return this.min.copy(m).sub(_),this.max.copy(m).add(_),this}setFromObject(m,g=!1){return this.makeEmpty(),this.expandByObject(m,g)}clone(){return new this.constructor().copy(this)}copy(m){return this.min.copy(m.min),this.max.copy(m.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(m){return this.isEmpty()?m.set(0,0,0):m.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(m){return this.isEmpty()?m.set(0,0,0):m.subVectors(this.max,this.min)}expandByPoint(m){return this.min.min(m),this.max.max(m),this}expandByVector(m){return this.min.sub(m),this.max.add(m),this}expandByScalar(m){return this.min.addScalar(-m),this.max.addScalar(m),this}expandByObject(m,g=!1){m.updateWorldMatrix(!1,!1);let _=m.geometry;if(_!==void 0){let y=_.getAttribute("position");if(g===!0&&y!==void 0&&m.isInstancedMesh!==!0&&m.isBatchedMesh!==!0)for(let v=0,b=y.count;v<b;v++){if(m.isMesh===!0)m.getVertexPosition(v,ni);else ni.fromBufferAttribute(y,v);ni.applyMatrix4(m.matrixWorld),this.expandByPoint(ni)}else{if(m.boundingBox!==void 0){if(m.boundingBox===null)m.computeBoundingBox();Xo.copy(m.boundingBox)}else{if(_.boundingBox===null)_.computeBoundingBox();Xo.copy(_.boundingBox)}Xo.applyMatrix4(m.matrixWorld),this.union(Xo)}}let x=m.children;for(let y=0,v=x.length;y<v;y++)this.expandByObject(x[y],g);return this}containsPoint(m){return m.x>=this.min.x&&m.x<=this.max.x&&m.y>=this.min.y&&m.y<=this.max.y&&m.z>=this.min.z&&m.z<=this.max.z}containsBox(m){return this.min.x<=m.min.x&&m.max.x<=this.max.x&&this.min.y<=m.min.y&&m.max.y<=this.max.y&&this.min.z<=m.min.z&&m.max.z<=this.max.z}getParameter(m,g){return g.set((m.x-this.min.x)/(this.max.x-this.min.x),(m.y-this.min.y)/(this.max.y-this.min.y),(m.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(m){return m.max.x>=this.min.x&&m.min.x<=this.max.x&&m.max.y>=this.min.y&&m.min.y<=this.max.y&&m.max.z>=this.min.z&&m.min.z<=this.max.z}intersectsSphere(m){return this.clampPoint(m.center,ni),ni.distanceToSquared(m.center)<=m.radius*m.radius}intersectsPlane(m){let g,_;if(m.normal.x>0)g=m.normal.x*this.min.x,_=m.normal.x*this.max.x;else g=m.normal.x*this.max.x,_=m.normal.x*this.min.x;if(m.normal.y>0)g+=m.normal.y*this.min.y,_+=m.normal.y*this.max.y;else g+=m.normal.y*this.max.y,_+=m.normal.y*this.min.y;if(m.normal.z>0)g+=m.normal.z*this.min.z,_+=m.normal.z*this.max.z;else g+=m.normal.z*this.max.z,_+=m.normal.z*this.min.z;return g<=-m.constant&&_>=-m.constant}intersectsTriangle(m){if(this.isEmpty())return!1;this.getCenter(Hr),qo.subVectors(this.max,Hr),Ws.subVectors(m.a,Hr),Xs.subVectors(m.b,Hr),qs.subVectors(m.c,Hr),Vi.subVectors(Xs,Ws),Wi.subVectors(qs,Xs),fs.subVectors(Ws,qs);let g=[0,-Vi.z,Vi.y,0,-Wi.z,Wi.y,0,-fs.z,fs.y,Vi.z,0,-Vi.x,Wi.z,0,-Wi.x,fs.z,0,-fs.x,-Vi.y,Vi.x,0,-Wi.y,Wi.x,0,-fs.y,fs.x,0];if(!_c(g,Ws,Xs,qs,qo))return!1;if(g=[1,0,0,0,1,0,0,0,1],!_c(g,Ws,Xs,qs,qo))return!1;return Yo.crossVectors(Vi,Wi),g=[Yo.x,Yo.y,Yo.z],_c(g,Ws,Xs,qs,qo)}clampPoint(m,g){return g.copy(m).clamp(this.min,this.max)}distanceToPoint(m){return this.clampPoint(m,ni).distanceTo(m)}getBoundingSphere(m){if(this.isEmpty())m.makeEmpty();else this.getCenter(m.center),m.radius=this.getSize(ni).length()*0.5;return m}intersect(m){if(this.min.max(m.min),this.max.min(m.max),this.isEmpty())this.makeEmpty();return this}union(m){return this.min.min(m.min),this.max.max(m.max),this}applyMatrix4(m){if(this.isEmpty())return this;return Mi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(m),Mi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(m),Mi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(m),Mi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(m),Mi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(m),Mi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(m),Mi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(m),Mi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(m),this.setFromPoints(Mi),this}translate(m){return this.min.add(m),this.max.add(m),this}equals(m){return m.min.equals(this.min)&&m.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(m){return this.min.fromArray(m.min),this.max.fromArray(m.max),this}}var Mi=[new Z,new Z,new Z,new Z,new Z,new Z,new Z,new Z],ni=new Z,Xo=new yt,Ws=new Z,Xs=new Z,qs=new Z,Vi=new Z,Wi=new Z,fs=new Z,Hr=new Z,qo=new Z,Yo=new Z,ps=new Z;function _c(m,g,_,x,y){for(let v=0,b=m.length-3;v<=b;v+=3){ps.fromArray(m,v);let S=y.x*Math.abs(ps.x)+y.y*Math.abs(ps.y)+y.z*Math.abs(ps.z),M=g.dot(ps),w=_.dot(ps),E=x.dot(ps);if(Math.max(-Math.max(M,w,E),Math.min(M,w,E))>S)return!1}return!0}var Kt=new Z,$o=new $e,h_=0;class Qt extends Ii{constructor(m,g,_=!1){super();if(Array.isArray(m))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:h_++}),this.name="",this.array=m,this.itemSize=g,this.count=m!==void 0?m.length/g:0,this.normalized=_,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=m!==void 0?Ea(m):void 0}onUploadCallback(){}set needsUpdate(m){if(m===!0)this.version++}setUsage(m){return this.usage=m,this}addUpdateRange(m,g){this.updateRanges.push({start:m,count:g})}clearUpdateRanges(){this.updateRanges.length=0}copy(m){return this.name=m.name,this.array=new m.array.constructor(m.array),this.itemSize=m.itemSize,this.count=m.count,this.normalized=m.normalized,this.usage=m.usage,this.gpuType=m.gpuType,this._normalizationScale=m._normalizationScale,this}copyAt(m,g,_){m*=this.itemSize,_*=g.itemSize;for(let x=0,y=this.itemSize;x<y;x++)this.array[m+x]=g.array[_+x];return this}copyArray(m){return this.array.set(m),this}applyMatrix3(m){if(this.itemSize===2)for(let g=0,_=this.count;g<_;g++)$o.fromBufferAttribute(this,g),$o.applyMatrix3(m),this.setXY(g,$o.x,$o.y);else if(this.itemSize===3)for(let g=0,_=this.count;g<_;g++)Kt.fromBufferAttribute(this,g),Kt.applyMatrix3(m),this.setXYZ(g,Kt.x,Kt.y,Kt.z);return this}applyMatrix4(m){for(let g=0,_=this.count;g<_;g++)Kt.fromBufferAttribute(this,g),Kt.applyMatrix4(m),this.setXYZ(g,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(m){for(let g=0,_=this.count;g<_;g++)Kt.fromBufferAttribute(this,g),Kt.applyNormalMatrix(m),this.setXYZ(g,Kt.x,Kt.y,Kt.z);return this}transformDirection(m){for(let g=0,_=this.count;g<_;g++)Kt.fromBufferAttribute(this,g),Kt.transformDirection(m),this.setXYZ(g,Kt.x,Kt.y,Kt.z);return this}set(m,g=0){return this.array.set(m,g),this}getComponent(m,g){let _=this.array[m*this.itemSize+g];if(this.normalized)_=this._denormalize(_);return _}setComponent(m,g,_){if(this.normalized)_=this._normalize(_);return this.array[m*this.itemSize+g]=_,this}getX(m){let g=this.array[m*this.itemSize];if(this.normalized)g=this._denormalize(g);return g}setX(m,g){if(this.normalized)g=this._normalize(g);return this.array[m*this.itemSize]=g,this}getY(m){let g=this.array[m*this.itemSize+1];if(this.normalized)g=this._denormalize(g);return g}setY(m,g){if(this.normalized)g=this._normalize(g);return this.array[m*this.itemSize+1]=g,this}getZ(m){let g=this.array[m*this.itemSize+2];if(this.normalized)g=this._denormalize(g);return g}setZ(m,g){if(this.normalized)g=this._normalize(g);return this.array[m*this.itemSize+2]=g,this}getW(m){let g=this.array[m*this.itemSize+3];if(this.normalized)g=this._denormalize(g);return g}setW(m,g){if(this.normalized)g=this._normalize(g);return this.array[m*this.itemSize+3]=g,this}setXY(m,g,_){if(m*=this.itemSize,this.normalized)g=this._normalize(g),_=this._normalize(_);return this.array[m+0]=g,this.array[m+1]=_,this}setXYZ(m,g,_,x){if(m*=this.itemSize,this.normalized)g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.array[m+0]=g,this.array[m+1]=_,this.array[m+2]=x,this}setXYZW(m,g,_,x,y){if(m*=this.itemSize,this.normalized)g=this._normalize(g),_=this._normalize(_),x=this._normalize(x),y=this._normalize(y);return this.array[m+0]=g,this.array[m+1]=_,this.array[m+2]=x,this.array[m+3]=y,this}onUpload(m){return this.onUploadCallback=m,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let m={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return m.name=this.name,m.usage=this.usage,m.gpuType=this.gpuType,m}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(m){let g=this._normalizationScale;return g!==void 0?Math.max(m/g,-1):Nu(m,this.array)}_normalize(m){let g=this._normalizationScale;return g!==void 0?Math.round(m*g):Du(m,this.array)}}class Ra extends Qt{constructor(m,g,_){super(new Uint16Array(m),g,_)}}class Ca extends Qt{constructor(m,g,_){super(new Uint32Array(m),g,_)}}class gn extends Qt{constructor(m,g,_){super(new Float32Array(m),g,_)}}var d_=new yt,Gr=new Z,xc=new Z;class Pn{constructor(m=new Z,g=-1){this.isSphere=!0,this.center=m,this.radius=g}set(m,g){return this.center.copy(m),this.radius=g,this}setFromPoints(m,g){let _=this.center;if(g!==void 0)_.copy(g);else d_.setFromPoints(m).getCenter(_);let x=0;for(let y=0,v=m.length;y<v;y++)x=Math.max(x,_.distanceToSquared(m[y]));return this.radius=Math.sqrt(x),this}copy(m){return this.center.copy(m.center),this.radius=m.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(m){return m.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(m){return m.distanceTo(this.center)-this.radius}intersectsSphere(m){let g=this.radius+m.radius;return m.center.distanceToSquared(this.center)<=g*g}intersectsBox(m){return m.intersectsSphere(this)}intersectsPlane(m){return Math.abs(m.distanceToPoint(this.center))<=this.radius}clampPoint(m,g){let _=this.center.distanceToSquared(m);if(g.copy(m),_>this.radius*this.radius)g.sub(this.center).normalize(),g.multiplyScalar(this.radius).add(this.center);return g}getBoundingBox(m){if(this.isEmpty())return m.makeEmpty(),m;return m.set(this.center,this.center),m.expandByScalar(this.radius),m}applyMatrix4(m){return this.center.applyMatrix4(m),this.radius=this.radius*m.getMaxScaleOnAxis(),this}translate(m){return this.center.add(m),this}expandByPoint(m){if(this.isEmpty())return this.center.copy(m),this.radius=0,this;Gr.subVectors(m,this.center);let g=Gr.lengthSq();if(g>this.radius*this.radius){let _=Math.sqrt(g),x=(_-this.radius)*0.5;this.center.addScaledVector(Gr,x/_),this.radius+=x}return this}union(m){if(m.isEmpty())return this;if(this.isEmpty())return this.copy(m),this;if(this.center.equals(m.center)===!0)this.radius=Math.max(this.radius,m.radius);else xc.subVectors(m.center,this.center).setLength(m.radius),this.expandByPoint(Gr.copy(m.center).add(xc)),this.expandByPoint(Gr.copy(m.center).sub(xc));return this}equals(m){return m.center.equals(this.center)&&m.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(m){return this.radius=m.radius,this.center.fromArray(m.center),this}}var f_=0,Yn=new Qe,yc=new nn,Ys=new Z,kn=new yt,Vr=new yt,hn=new Z;class sn extends Ii{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:f_++}),this.uuid=ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(m){if(Array.isArray(m))this.index=new((B0(m))?Ca:Ra)(m,1);else this.index=m;return this}setIndirect(m,g=0){return this.indirect=m,this.indirectOffset=g,this}getIndirect(){return this.indirect}getAttribute(m){return this.attributes[m]}setAttribute(m,g){return this.attributes[m]=g,this}deleteAttribute(m){return delete this.attributes[m],this}hasAttribute(m){return this.attributes[m]!==void 0}addGroup(m,g,_=0){this.groups.push({start:m,count:g,materialIndex:_})}clearGroups(){this.groups=[]}setDrawRange(m,g){this.drawRange.start=m,this.drawRange.count=g}applyMatrix4(m){let g=this.attributes.position;if(g!==void 0)g.applyMatrix4(m),g.needsUpdate=!0;let _=this.attributes.normal;if(_!==void 0){let y=new et().getNormalMatrix(m);_.applyNormalMatrix(y),_.needsUpdate=!0}let x=this.attributes.tangent;if(x!==void 0)x.transformDirection(m),x.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(m){return Yn.makeRotationFromQuaternion(m),this.applyMatrix4(Yn),this}rotateX(m){return Yn.makeRotationX(m),this.applyMatrix4(Yn),this}rotateY(m){return Yn.makeRotationY(m),this.applyMatrix4(Yn),this}rotateZ(m){return Yn.makeRotationZ(m),this.applyMatrix4(Yn),this}translate(m,g,_){return Yn.makeTranslation(m,g,_),this.applyMatrix4(Yn),this}scale(m,g,_){return Yn.makeScale(m,g,_),this.applyMatrix4(Yn),this}lookAt(m){return yc.lookAt(m),yc.updateMatrix(),this.applyMatrix4(yc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ys).negate(),this.translate(Ys.x,Ys.y,Ys.z),this}setFromPoints(m){let g=this.getAttribute("position");if(g===void 0){let _=[];for(let x=0,y=m.length;x<y;x++){let v=m[x];_.push(v.x,v.y,v.z||0)}this.setAttribute("position",new gn(_,3))}else{let _=Math.min(m.length,g.count);for(let x=0;x<_;x++){let y=m[x];g.setXYZ(x,y.x,y.y,y.z||0)}if(m.length>g.count)qe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");g.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new yt;let m=this.attributes.position,g=this.morphAttributes.position;if(m&&m.isGLBufferAttribute){Je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Z(-1/0,-1/0,-1/0),new Z(1/0,1/0,1/0));return}if(m!==void 0){if(this.boundingBox.setFromBufferAttribute(m),g)for(let _=0,x=g.length;_<x;_++){let y=g[_];if(kn.setFromBufferAttribute(y),this.morphTargetsRelative)hn.addVectors(this.boundingBox.min,kn.min),this.boundingBox.expandByPoint(hn),hn.addVectors(this.boundingBox.max,kn.max),this.boundingBox.expandByPoint(hn);else this.boundingBox.expandByPoint(kn.min),this.boundingBox.expandByPoint(kn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Pn;let m=this.attributes.position,g=this.morphAttributes.position;if(m&&m.isGLBufferAttribute){Je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Z,1/0);return}if(m){let _=this.boundingSphere.center;if(kn.setFromBufferAttribute(m),g)for(let y=0,v=g.length;y<v;y++){let b=g[y];if(Vr.setFromBufferAttribute(b),this.morphTargetsRelative)hn.addVectors(kn.min,Vr.min),kn.expandByPoint(hn),hn.addVectors(kn.max,Vr.max),kn.expandByPoint(hn);else kn.expandByPoint(Vr.min),kn.expandByPoint(Vr.max)}kn.getCenter(_);let x=0;for(let y=0,v=m.count;y<v;y++)hn.fromBufferAttribute(m,y),x=Math.max(x,_.distanceToSquared(hn));if(g)for(let y=0,v=g.length;y<v;y++){let b=g[y],S=this.morphTargetsRelative;for(let M=0,w=b.count;M<w;M++){if(hn.fromBufferAttribute(b,M),S)Ys.fromBufferAttribute(m,M),hn.add(Ys);x=Math.max(x,_.distanceToSquared(hn))}}if(this.boundingSphere.radius=Math.sqrt(x),isNaN(this.boundingSphere.radius))Je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let m=this.index,g=this.attributes;if(m===null||g.position===void 0||g.normal===void 0||g.uv===void 0){Je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:_,normal:x,uv:y}=g,v=this.getAttribute("tangent");if(v===void 0||v.count!==_.count)v=new Qt(new Float32Array(4*_.count),4),this.setAttribute("tangent",v);let b=[],S=[],M=new Uint8Array(_.count);for(let B=0;B<_.count;B++)b[B]=new Z,S[B]=new Z;let w=new Z,E=new Z,A=new Z,T=new $e,R=new $e,P=new $e,N=new Z,C=new Z;function I(B,z,W){M[B]=M[z]=M[W]=1,w.fromBufferAttribute(_,B),E.fromBufferAttribute(_,z),A.fromBufferAttribute(_,W),T.fromBufferAttribute(y,B),R.fromBufferAttribute(y,z),P.fromBufferAttribute(y,W),E.sub(w),A.sub(w),R.sub(T),P.sub(T);let V=1/(R.x*P.y-P.x*R.y);if(!isFinite(V))return;N.copy(E).multiplyScalar(P.y).addScaledVector(A,-R.y).multiplyScalar(V),C.copy(A).multiplyScalar(R.x).addScaledVector(E,-P.x).multiplyScalar(V),b[B].add(N),b[z].add(N),b[W].add(N),S[B].add(C),S[z].add(C),S[W].add(C)}let L=this.groups;if(L.length===0)L=[{start:0,count:m.count}];for(let B=0,z=L.length;B<z;++B){let W=L[B],{start:V,count:Y}=W;for(let ee=V,X=V+Y;ee<X;ee+=3)I(m.getX(ee+0),m.getX(ee+1),m.getX(ee+2))}let U=new Z,O=new Z,F=new Z,k=new Z;function D(B){F.fromBufferAttribute(x,B),k.copy(F);let z=b[B];U.copy(z),U.sub(F.multiplyScalar(F.dot(z))).normalize(),O.crossVectors(k,z);let V=O.dot(S[B])<0?-1:1;v.setXYZW(B,U.x,U.y,U.z,V)}for(let B=0,z=_.count;B<z;++B)if(M[B])D(B);this._transformed=!0}computeVertexNormals(){let m=this.index,g=this.getAttribute("position");if(g!==void 0){let _=this.getAttribute("normal");if(_===void 0||_.count!==g.count)_=new Qt(new Float32Array(g.count*3),3),this.setAttribute("normal",_);else for(let A=0,T=_.count;A<T;A++)_.setXYZ(A,0,0,0);let x=new Z,y=new Z,v=new Z,b=new Z,S=new Z,M=new Z,w=new Z,E=new Z;if(m)for(let A=0,T=m.count;A<T;A+=3){let R=m.getX(A+0),P=m.getX(A+1),N=m.getX(A+2);x.fromBufferAttribute(g,R),y.fromBufferAttribute(g,P),v.fromBufferAttribute(g,N),w.subVectors(v,y),E.subVectors(x,y),w.cross(E),b.fromBufferAttribute(_,R),S.fromBufferAttribute(_,P),M.fromBufferAttribute(_,N),b.add(w),S.add(w),M.add(w),_.setXYZ(R,b.x,b.y,b.z),_.setXYZ(P,S.x,S.y,S.z),_.setXYZ(N,M.x,M.y,M.z)}else for(let A=0,T=g.count;A<T;A+=3)x.fromBufferAttribute(g,A+0),y.fromBufferAttribute(g,A+1),v.fromBufferAttribute(g,A+2),w.subVectors(v,y),E.subVectors(x,y),w.cross(E),_.setXYZ(A+0,w.x,w.y,w.z),_.setXYZ(A+1,w.x,w.y,w.z),_.setXYZ(A+2,w.x,w.y,w.z);this.normalizeNormals(),_.needsUpdate=!0}}normalizeNormals(){let m=this.attributes.normal;for(let g=0,_=m.count;g<_;g++)hn.fromBufferAttribute(m,g),hn.normalize(),m.setXYZ(g,hn.x,hn.y,hn.z)}toNonIndexed(){function m(b,S){let{array:M,itemSize:w,normalized:E}=b,A=new M.constructor(S.length*w),T=0,R=0;for(let P=0,N=S.length;P<N;P++){if(b.isInterleavedBufferAttribute)T=S[P]*b.data.stride+b.offset;else T=S[P]*w;for(let C=0;C<w;C++)A[R++]=M[T++]}return new Qt(A,w,E)}if(this.index===null)return qe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let g=new sn,_=this.index.array,x=this.attributes;for(let b in x){let S=x[b],M=m(S,_);g.setAttribute(b,M)}let y=this.morphAttributes;for(let b in y){let S=[],M=y[b];for(let w=0,E=M.length;w<E;w++){let A=M[w],T=m(A,_);S.push(T)}g.morphAttributes[b]=S}g.morphTargetsRelative=this.morphTargetsRelative;let v=this.groups;for(let b=0,S=v.length;b<S;b++){let M=v[b];g.addGroup(M.start,M.count,M.materialIndex)}return g}toJSON(){let m={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(m.uuid=this.uuid,m.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,m.name=this.name,Object.keys(this.userData).length>0)m.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let S=this.parameters;for(let M in S)if(S[M]!==void 0)m[M]=S[M];return m}m.data={attributes:{}};let g=this.index;if(g!==null)m.data.index={type:g.array.constructor.name,array:Array.prototype.slice.call(g.array)};let _=this.attributes;for(let S in _){let M=_[S];m.data.attributes[S]=M.toJSON(m.data)}let x={},y=!1;for(let S in this.morphAttributes){let M=this.morphAttributes[S],w=[];for(let E=0,A=M.length;E<A;E++){let T=M[E];w.push(T.toJSON(m.data))}if(w.length>0)x[S]=w,y=!0}if(y)m.data.morphAttributes=x,m.data.morphTargetsRelative=this.morphTargetsRelative;let v=this.groups;if(v.length>0)m.data.groups=JSON.parse(JSON.stringify(v));let b=this.boundingSphere;if(b!==null)m.data.boundingSphere=b.toJSON();return m}clone(){return new this.constructor().copy(this)}copy(m){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let g={};this.name=m.name;let _=m.index;if(_!==null)this.setIndex(_.clone());let x=m.attributes;for(let M in x){let w=x[M];this.setAttribute(M,w.clone(g))}let y=m.morphAttributes;for(let M in y){let w=[],E=y[M];for(let A=0,T=E.length;A<T;A++)w.push(E[A].clone(g));this.morphAttributes[M]=w}this.morphTargetsRelative=m.morphTargetsRelative;let v=m.groups;for(let M=0,w=v.length;M<w;M++){let E=v[M];this.addGroup(E.start,E.count,E.materialIndex)}let b=m.boundingBox;if(b!==null)this.boundingBox=b.clone();let S=m.boundingSphere;if(S!==null)this.boundingSphere=S.clone();return this.drawRange.start=m.drawRange.start,this.drawRange.count=m.drawRange.count,this.userData=m.userData,this._transformed=m._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Pa{constructor(m,g){this.isInterleavedBuffer=!0,this.array=m,this.stride=g,this.count=m!==void 0?m.length/g:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=ji()}onUploadCallback(){}set needsUpdate(m){if(m===!0)this.version++}setUsage(m){return this.usage=m,this}addUpdateRange(m,g){this.updateRanges.push({start:m,count:g})}clearUpdateRanges(){this.updateRanges.length=0}copy(m){return this.array=new m.array.constructor(m.array),this.count=m.count,this.stride=m.stride,this.usage=m.usage,this}copyAt(m,g,_){m*=this.stride,_*=g.stride;for(let x=0,y=this.stride;x<y;x++)this.array[m+x]=g.array[_+x];return this}set(m,g=0){return this.array.set(m,g),this}clone(m){if(m.arrayBuffers===void 0)m.arrayBuffers={};let g=cf(this.array);if(m.arrayBuffers[g]===void 0)m.arrayBuffers[g]=this.array.slice(0).buffer;let _=new this.array.constructor(m.arrayBuffers[g]),x=new this.constructor(_,this.stride);return x.setUsage(this.usage),x}onUpload(m){return this.onUploadCallback=m,this}toJSON(m){if(m.arrayBuffers===void 0)m.arrayBuffers={};let g=cf(this.array);if(m.arrayBuffers[g]===void 0)m.arrayBuffers[g]=Array.from(new Uint32Array(this.array.slice(0).buffer));let _={uuid:this.uuid,buffer:g,type:this.array.constructor.name,stride:this.stride};return _.usage=this.usage,_}}function cf(m){if(m.buffer._uuid===void 0)m.buffer._uuid=ji();if(m.byteOffset===0&&m.byteLength===m.buffer.byteLength)return m.buffer._uuid;return m.buffer._uuid+":"+m.byteOffset+":"+m.byteLength}var Cn=new Z;class Ss{constructor(m,g,_,x=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=m,this.itemSize=g,this.offset=_,this.normalized=x,this._normalizationScale=m!==void 0?Ea(m.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(m){this.data.needsUpdate=m}applyMatrix4(m){for(let g=0,_=this.data.count;g<_;g++)Cn.fromBufferAttribute(this,g),Cn.applyMatrix4(m),this.setXYZ(g,Cn.x,Cn.y,Cn.z);return this}applyNormalMatrix(m){for(let g=0,_=this.count;g<_;g++)Cn.fromBufferAttribute(this,g),Cn.applyNormalMatrix(m),this.setXYZ(g,Cn.x,Cn.y,Cn.z);return this}transformDirection(m){for(let g=0,_=this.count;g<_;g++)Cn.fromBufferAttribute(this,g),Cn.transformDirection(m),this.setXYZ(g,Cn.x,Cn.y,Cn.z);return this}getComponent(m,g){let _=this.array[m*this.data.stride+this.offset+g];if(this.normalized)_=this._denormalize(_);return _}setComponent(m,g,_){if(this.normalized)_=this._normalize(_);return this.data.array[m*this.data.stride+this.offset+g]=_,this}setX(m,g){if(this.normalized)g=this._normalize(g);return this.data.array[m*this.data.stride+this.offset]=g,this}setY(m,g){if(this.normalized)g=this._normalize(g);return this.data.array[m*this.data.stride+this.offset+1]=g,this}setZ(m,g){if(this.normalized)g=this._normalize(g);return this.data.array[m*this.data.stride+this.offset+2]=g,this}setW(m,g){if(this.normalized)g=this._normalize(g);return this.data.array[m*this.data.stride+this.offset+3]=g,this}getX(m){let g=this.data.array[m*this.data.stride+this.offset];if(this.normalized)g=this._denormalize(g);return g}getY(m){let g=this.data.array[m*this.data.stride+this.offset+1];if(this.normalized)g=this._denormalize(g);return g}getZ(m){let g=this.data.array[m*this.data.stride+this.offset+2];if(this.normalized)g=this._denormalize(g);return g}getW(m){let g=this.data.array[m*this.data.stride+this.offset+3];if(this.normalized)g=this._denormalize(g);return g}setXY(m,g,_){if(m=m*this.data.stride+this.offset,this.normalized)g=this._normalize(g),_=this._normalize(_);return this.data.array[m+0]=g,this.data.array[m+1]=_,this}setXYZ(m,g,_,x){if(m=m*this.data.stride+this.offset,this.normalized)g=this._normalize(g),_=this._normalize(_),x=this._normalize(x);return this.data.array[m+0]=g,this.data.array[m+1]=_,this.data.array[m+2]=x,this}setXYZW(m,g,_,x,y){if(m=m*this.data.stride+this.offset,this.normalized)g=this._normalize(g),_=this._normalize(_),x=this._normalize(x),y=this._normalize(y);return this.data.array[m+0]=g,this.data.array[m+1]=_,this.data.array[m+2]=x,this.data.array[m+3]=y,this}clone(m){if(m===void 0){Zr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let g=[];for(let _=0;_<this.count;_++){let x=_*this.data.stride+this.offset;for(let y=0;y<this.itemSize;y++)g.push(this.data.array[x+y])}return new Qt(new this.array.constructor(g),this.itemSize,this.normalized)}else{if(m.interleavedBuffers===void 0)m.interleavedBuffers={};if(m.interleavedBuffers[this.data.uuid]===void 0)m.interleavedBuffers[this.data.uuid]=this.data.clone(m);return new Ss(m.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(m){if(m===void 0){Zr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let g=[];for(let _=0;_<this.count;_++){let x=_*this.data.stride+this.offset;for(let y=0;y<this.itemSize;y++)g.push(this.data.array[x+y])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:g,normalized:this.normalized}}else{if(m.interleavedBuffers===void 0)m.interleavedBuffers={};if(m.interleavedBuffers[this.data.uuid]===void 0)m.interleavedBuffers[this.data.uuid]=this.data.toJSON(m);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(m){let g=this._normalizationScale;return g!==void 0?Math.max(m/g,-1):Nu(m,this.data.array)}_normalize(m){let g=this._normalizationScale;return g!==void 0?Math.round(m*g):Du(m,this.data.array)}}var vc=new Z,p_=new Z,m_=new et;class mn{constructor(m=new Z(1,0,0),g=0){this.isPlane=!0,this.normal=m,this.constant=g}set(m,g){return this.normal.copy(m),this.constant=g,this}setComponents(m,g,_,x){return this.normal.set(m,g,_),this.constant=x,this}setFromNormalAndCoplanarPoint(m,g){return this.normal.copy(m),this.constant=-g.dot(this.normal),this}setFromCoplanarPoints(m,g,_){let x=vc.subVectors(_,g).cross(p_.subVectors(m,g)).normalize();return this.setFromNormalAndCoplanarPoint(x,m),this}copy(m){return this.normal.copy(m.normal),this.constant=m.constant,this}normalize(){let m=1/this.normal.length();return this.normal.multiplyScalar(m),this.constant*=m,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(m){return this.normal.dot(m)+this.constant}distanceToSphere(m){return this.distanceToPoint(m.center)-m.radius}projectPoint(m,g){return g.copy(m).addScaledVector(this.normal,-this.distanceToPoint(m))}intersectLine(m,g,_=!0){let x=m.delta(vc),y=this.normal.dot(x);if(y===0){if(this.distanceToPoint(m.start)===0)return g.copy(m.start);return null}let v=-(m.start.dot(this.normal)+this.constant)/y;if(_===!0&&(v<0||v>1))return null;return g.copy(m.start).addScaledVector(x,v)}intersectsLine(m){let g=this.distanceToPoint(m.start),_=this.distanceToPoint(m.end);return g<0&&_>0||_<0&&g>0}intersectsBox(m){return m.intersectsPlane(this)}intersectsSphere(m){return m.intersectsPlane(this)}coplanarPoint(m){return m.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(m,g){let _=g||m_.getNormalMatrix(m),x=this.coplanarPoint(vc).applyMatrix4(m),y=this.normal.applyMatrix3(_).normalize();return this.constant=-x.dot(y),this}translate(m){return this.constant-=m.dot(this.normal),this}equals(m){return m.normal.equals(this.normal)&&m.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(m){return this.normal.fromArray(m.normal),this.constant=m.constant,this}}var g_=0;class Di extends Ii{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:g_++}),this.uuid=ji(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new st(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(m){if(this._alphaTest>0!==m>0)this.version++;this._alphaTest=m}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(m){if(m===void 0)return;for(let g in m){let _=m[g];if(_===void 0){qe(`Material: parameter '${g}' has value of undefined.`);continue}let x=this[g];if(x===void 0){qe(`Material: '${g}' is not a property of THREE.${this.type}.`);continue}if(x&&x.isColor)x.set(_);else if(x&&x.isVector2&&(_&&_.isVector2)||x&&x.isEuler&&(_&&_.isEuler)||x&&x.isVector3&&(_&&_.isVector3))x.copy(_);else this[g]=_}}toJSON(m){let g=m===void 0||typeof m==="string";if(g)m={textures:{},images:{}};let _={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(_.uuid=this.uuid,_.type=this.type,_.blending=this.blending,_.side=this.side,_.shadowSide=this.shadowSide,_.vertexColors=this.vertexColors,_.opacity=this.opacity,_.transparent=this.transparent,_.blendSrc=this.blendSrc,_.blendDst=this.blendDst,_.blendEquation=this.blendEquation,_.blendSrcAlpha=this.blendSrcAlpha,_.blendDstAlpha=this.blendDstAlpha,_.blendEquationAlpha=this.blendEquationAlpha,_.blendColor=this.blendColor.getHex(),_.blendAlpha=this.blendAlpha,_.depthFunc=this.depthFunc,_.depthTest=this.depthTest,_.depthWrite=this.depthWrite,_.colorWrite=this.colorWrite,_.clipIntersection=this.clipIntersection,_.clipShadows=this.clipShadows,_.stencilWriteMask=this.stencilWriteMask,_.stencilFunc=this.stencilFunc,_.stencilRef=this.stencilRef,_.stencilFuncMask=this.stencilFuncMask,_.stencilFail=this.stencilFail,_.stencilZFail=this.stencilZFail,_.stencilZPass=this.stencilZPass,_.stencilWrite=this.stencilWrite,_.polygonOffset=this.polygonOffset,_.polygonOffsetFactor=this.polygonOffsetFactor,_.polygonOffsetUnits=this.polygonOffsetUnits,_.dithering=this.dithering,_.alphaTest=this.alphaTest,_.alphaHash=this.alphaHash,_.alphaToCoverage=this.alphaToCoverage,_.premultipliedAlpha=this.premultipliedAlpha,_.forceSinglePass=this.forceSinglePass,_.allowOverride=this.allowOverride,_.visible=this.visible,_.toneMapped=this.toneMapped,_.name=this.name,this.color&&this.color.isColor)_.color=this.color.getHex();if(this.roughness!==void 0)_.roughness=this.roughness;if(this.metalness!==void 0)_.metalness=this.metalness;if(this.sheen!==void 0)_.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)_.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)_.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)_.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)_.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)_.specular=this.specular.getHex();if(this.specularIntensity!==void 0)_.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)_.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)_.shininess=this.shininess;if(this.clearcoat!==void 0)_.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)_.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)_.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)_.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(m).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)_.clearcoatMap=this.clearcoatMap.toJSON(m).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)_.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(m).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)_.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(m).uuid,_.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)_.sheenColorMap=this.sheenColorMap.toJSON(m).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)_.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(m).uuid;if(this.dispersion!==void 0)_.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)_.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)_.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)_.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)_.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)_.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)_.iridescenceMap=this.iridescenceMap.toJSON(m).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)_.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(m).uuid;if(this.anisotropy!==void 0)_.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)_.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)_.anisotropyMap=this.anisotropyMap.toJSON(m).uuid;if(this.map&&this.map.isTexture)_.map=this.map.toJSON(m).uuid;if(this.matcap&&this.matcap.isTexture)_.matcap=this.matcap.toJSON(m).uuid;if(this.alphaMap&&this.alphaMap.isTexture)_.alphaMap=this.alphaMap.toJSON(m).uuid;if(this.lightMap&&this.lightMap.isTexture)_.lightMap=this.lightMap.toJSON(m).uuid,_.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)_.aoMap=this.aoMap.toJSON(m).uuid,_.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)_.bumpMap=this.bumpMap.toJSON(m).uuid,_.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)_.normalMap=this.normalMap.toJSON(m).uuid,_.normalMapType=this.normalMapType,_.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)_.displacementMap=this.displacementMap.toJSON(m).uuid,_.displacementScale=this.displacementScale,_.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)_.roughnessMap=this.roughnessMap.toJSON(m).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)_.metalnessMap=this.metalnessMap.toJSON(m).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)_.emissiveMap=this.emissiveMap.toJSON(m).uuid;if(this.specularMap&&this.specularMap.isTexture)_.specularMap=this.specularMap.toJSON(m).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)_.specularIntensityMap=this.specularIntensityMap.toJSON(m).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)_.specularColorMap=this.specularColorMap.toJSON(m).uuid;if(this.envMap&&this.envMap.isTexture){if(_.envMap=this.envMap.toJSON(m).uuid,this.combine!==void 0)_.combine=this.combine}if(this.envMapRotation!==void 0)_.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)_.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)_.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)_.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)_.gradientMap=this.gradientMap.toJSON(m).uuid;if(this.transmission!==void 0)_.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)_.transmissionMap=this.transmissionMap.toJSON(m).uuid;if(this.thickness!==void 0)_.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)_.thicknessMap=this.thicknessMap.toJSON(m).uuid;if(this.attenuationDistance!==void 0)_.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)_.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)_.size=this.size;if(this.sizeAttenuation!==void 0)_.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)_.clippingPlanes=this.clippingPlanes.map((y)=>y.toJSON());if(this.rotation!==void 0)_.rotation=this.rotation;if(this.depthPacking!==void 0)_.depthPacking=this.depthPacking;if(this.linewidth!==void 0)_.linewidth=this.linewidth;if(this.linecap!==void 0)_.linecap=this.linecap;if(this.linejoin!==void 0)_.linejoin=this.linejoin;if(this.dashSize!==void 0)_.dashSize=this.dashSize;if(this.gapSize!==void 0)_.gapSize=this.gapSize;if(this.scale!==void 0)_.scale=this.scale;if(this.wireframe!==void 0)_.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)_.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)_.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)_.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)_.flatShading=this.flatShading;if(this.fog!==void 0)_.fog=this.fog;if(Object.keys(this.userData).length>0)_.userData=this.userData;function x(y){let v=[];for(let b in y){let S=y[b];delete S.metadata,v.push(S)}return v}if(g){let y=x(m.textures),v=x(m.images);if(y.length>0)_.textures=y;if(v.length>0)_.images=v}return _}fromJSON(m,g){if(m.uuid!==void 0)this.uuid=m.uuid;if(m.name!==void 0)this.name=m.name;if(m.color!==void 0&&this.color!==void 0)this.color.setHex(m.color);if(m.roughness!==void 0)this.roughness=m.roughness;if(m.metalness!==void 0)this.metalness=m.metalness;if(m.sheen!==void 0)this.sheen=m.sheen;if(m.sheenColor!==void 0)this.sheenColor=new st().setHex(m.sheenColor);if(m.sheenRoughness!==void 0)this.sheenRoughness=m.sheenRoughness;if(m.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(m.emissive);if(m.specular!==void 0&&this.specular!==void 0)this.specular.setHex(m.specular);if(m.specularIntensity!==void 0)this.specularIntensity=m.specularIntensity;if(m.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(m.specularColor);if(m.shininess!==void 0)this.shininess=m.shininess;if(m.clearcoat!==void 0)this.clearcoat=m.clearcoat;if(m.clearcoatRoughness!==void 0)this.clearcoatRoughness=m.clearcoatRoughness;if(m.diffuseRoughness!==void 0)this.diffuseRoughness=m.diffuseRoughness;if(m.dispersion!==void 0)this.dispersion=m.dispersion;if(m.retroreflectivity!==void 0)this.retroreflectivity=m.retroreflectivity;if(m.iridescence!==void 0)this.iridescence=m.iridescence;if(m.iridescenceIOR!==void 0)this.iridescenceIOR=m.iridescenceIOR;if(m.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=m.iridescenceThicknessMinimum;if(m.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=m.iridescenceThicknessMaximum;if(m.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=m.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=m.iridescenceThicknessRange[1];if(m.transmission!==void 0)this.transmission=m.transmission;if(m.thickness!==void 0)this.thickness=m.thickness;if(m.attenuationDistance!==void 0)this.attenuationDistance=m.attenuationDistance;if(m.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(m.attenuationColor);if(m.anisotropy!==void 0)this.anisotropy=m.anisotropy;if(m.anisotropyRotation!==void 0)this.anisotropyRotation=m.anisotropyRotation;if(m.fog!==void 0)this.fog=m.fog;if(m.flatShading!==void 0)this.flatShading=m.flatShading;if(m.blending!==void 0)this.blending=m.blending;if(m.combine!==void 0)this.combine=m.combine;if(m.side!==void 0)this.side=m.side;if(m.shadowSide!==void 0)this.shadowSide=m.shadowSide;if(m.opacity!==void 0)this.opacity=m.opacity;if(m.transparent!==void 0)this.transparent=m.transparent;if(m.alphaTest!==void 0)this.alphaTest=m.alphaTest;if(m.alphaHash!==void 0)this.alphaHash=m.alphaHash;if(m.depthFunc!==void 0)this.depthFunc=m.depthFunc;if(m.depthTest!==void 0)this.depthTest=m.depthTest;if(m.depthWrite!==void 0)this.depthWrite=m.depthWrite;if(m.colorWrite!==void 0)this.colorWrite=m.colorWrite;if(m.clippingPlanes!==void 0)this.clippingPlanes=m.clippingPlanes.map((_)=>new mn().fromJSON(_));if(m.clipIntersection!==void 0)this.clipIntersection=m.clipIntersection;if(m.clipShadows!==void 0)this.clipShadows=m.clipShadows;if(m.depthPacking!==void 0)this.depthPacking=m.depthPacking;if(m.blendSrc!==void 0)this.blendSrc=m.blendSrc;if(m.blendDst!==void 0)this.blendDst=m.blendDst;if(m.blendEquation!==void 0)this.blendEquation=m.blendEquation;if(m.blendSrcAlpha!==void 0)this.blendSrcAlpha=m.blendSrcAlpha;if(m.blendDstAlpha!==void 0)this.blendDstAlpha=m.blendDstAlpha;if(m.blendEquationAlpha!==void 0)this.blendEquationAlpha=m.blendEquationAlpha;if(m.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(m.blendColor);if(m.blendAlpha!==void 0)this.blendAlpha=m.blendAlpha;if(m.stencilWriteMask!==void 0)this.stencilWriteMask=m.stencilWriteMask;if(m.stencilFunc!==void 0)this.stencilFunc=m.stencilFunc;if(m.stencilRef!==void 0)this.stencilRef=m.stencilRef;if(m.stencilFuncMask!==void 0)this.stencilFuncMask=m.stencilFuncMask;if(m.stencilFail!==void 0)this.stencilFail=m.stencilFail;if(m.stencilZFail!==void 0)this.stencilZFail=m.stencilZFail;if(m.stencilZPass!==void 0)this.stencilZPass=m.stencilZPass;if(m.stencilWrite!==void 0)this.stencilWrite=m.stencilWrite;if(m.wireframe!==void 0)this.wireframe=m.wireframe;if(m.wireframeLinewidth!==void 0)this.wireframeLinewidth=m.wireframeLinewidth;if(m.wireframeLinecap!==void 0)this.wireframeLinecap=m.wireframeLinecap;if(m.wireframeLinejoin!==void 0)this.wireframeLinejoin=m.wireframeLinejoin;if(m.rotation!==void 0)this.rotation=m.rotation;if(m.linewidth!==void 0)this.linewidth=m.linewidth;if(m.linecap!==void 0)this.linecap=m.linecap;if(m.linejoin!==void 0)this.linejoin=m.linejoin;if(m.dashSize!==void 0)this.dashSize=m.dashSize;if(m.gapSize!==void 0)this.gapSize=m.gapSize;if(m.scale!==void 0)this.scale=m.scale;if(m.polygonOffset!==void 0)this.polygonOffset=m.polygonOffset;if(m.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=m.polygonOffsetFactor;if(m.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=m.polygonOffsetUnits;if(m.dithering!==void 0)this.dithering=m.dithering;if(m.alphaToCoverage!==void 0)this.alphaToCoverage=m.alphaToCoverage;if(m.premultipliedAlpha!==void 0)this.premultipliedAlpha=m.premultipliedAlpha;if(m.forceSinglePass!==void 0)this.forceSinglePass=m.forceSinglePass;if(m.allowOverride!==void 0)this.allowOverride=m.allowOverride;if(m.visible!==void 0)this.visible=m.visible;if(m.toneMapped!==void 0)this.toneMapped=m.toneMapped;if(m.userData!==void 0)this.userData=m.userData;if(m.vertexColors!==void 0)if(typeof m.vertexColors==="number")this.vertexColors=m.vertexColors>0;else this.vertexColors=m.vertexColors;if(m.size!==void 0)this.size=m.size;if(m.sizeAttenuation!==void 0)this.sizeAttenuation=m.sizeAttenuation;if(m.map!==void 0)this.map=g[m.map]||null;if(m.matcap!==void 0)this.matcap=g[m.matcap]||null;if(m.alphaMap!==void 0)this.alphaMap=g[m.alphaMap]||null;if(m.bumpMap!==void 0)this.bumpMap=g[m.bumpMap]||null;if(m.bumpScale!==void 0)this.bumpScale=m.bumpScale;if(m.normalMap!==void 0)this.normalMap=g[m.normalMap]||null;if(m.normalMapType!==void 0)this.normalMapType=m.normalMapType;if(m.normalScale!==void 0){let _=m.normalScale;if(Array.isArray(_)===!1)_=[_,_];this.normalScale=new $e().fromArray(_)}if(m.displacementMap!==void 0)this.displacementMap=g[m.displacementMap]||null;if(m.displacementScale!==void 0)this.displacementScale=m.displacementScale;if(m.displacementBias!==void 0)this.displacementBias=m.displacementBias;if(m.roughnessMap!==void 0)this.roughnessMap=g[m.roughnessMap]||null;if(m.metalnessMap!==void 0)this.metalnessMap=g[m.metalnessMap]||null;if(m.emissiveMap!==void 0)this.emissiveMap=g[m.emissiveMap]||null;if(m.emissiveIntensity!==void 0)this.emissiveIntensity=m.emissiveIntensity;if(m.specularMap!==void 0)this.specularMap=g[m.specularMap]||null;if(m.specularIntensityMap!==void 0)this.specularIntensityMap=g[m.specularIntensityMap]||null;if(m.specularColorMap!==void 0)this.specularColorMap=g[m.specularColorMap]||null;if(m.envMap!==void 0)this.envMap=g[m.envMap]||null;if(m.envMapRotation!==void 0)this.envMapRotation.fromArray(m.envMapRotation);if(m.envMapIntensity!==void 0)this.envMapIntensity=m.envMapIntensity;if(m.reflectivity!==void 0)this.reflectivity=m.reflectivity;if(m.refractionRatio!==void 0)this.refractionRatio=m.refractionRatio;if(m.lightMap!==void 0)this.lightMap=g[m.lightMap]||null;if(m.lightMapIntensity!==void 0)this.lightMapIntensity=m.lightMapIntensity;if(m.aoMap!==void 0)this.aoMap=g[m.aoMap]||null;if(m.aoMapIntensity!==void 0)this.aoMapIntensity=m.aoMapIntensity;if(m.gradientMap!==void 0)this.gradientMap=g[m.gradientMap]||null;if(m.clearcoatMap!==void 0)this.clearcoatMap=g[m.clearcoatMap]||null;if(m.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=g[m.clearcoatRoughnessMap]||null;if(m.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=g[m.clearcoatNormalMap]||null;if(m.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new $e().fromArray(m.clearcoatNormalScale);if(m.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=g[m.diffuseRoughnessMap]||null;if(m.iridescenceMap!==void 0)this.iridescenceMap=g[m.iridescenceMap]||null;if(m.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=g[m.iridescenceThicknessMap]||null;if(m.transmissionMap!==void 0)this.transmissionMap=g[m.transmissionMap]||null;if(m.thicknessMap!==void 0)this.thicknessMap=g[m.thicknessMap]||null;if(m.anisotropyMap!==void 0)this.anisotropyMap=g[m.anisotropyMap]||null;if(m.sheenColorMap!==void 0)this.sheenColorMap=g[m.sheenColorMap]||null;if(m.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=g[m.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(m){this.name=m.name,this.blending=m.blending,this.side=m.side,this.vertexColors=m.vertexColors,this.opacity=m.opacity,this.transparent=m.transparent,this.blendSrc=m.blendSrc,this.blendDst=m.blendDst,this.blendEquation=m.blendEquation,this.blendSrcAlpha=m.blendSrcAlpha,this.blendDstAlpha=m.blendDstAlpha,this.blendEquationAlpha=m.blendEquationAlpha,this.blendColor.copy(m.blendColor),this.blendAlpha=m.blendAlpha,this.depthFunc=m.depthFunc,this.depthTest=m.depthTest,this.depthWrite=m.depthWrite,this.stencilWriteMask=m.stencilWriteMask,this.stencilFunc=m.stencilFunc,this.stencilRef=m.stencilRef,this.stencilFuncMask=m.stencilFuncMask,this.stencilFail=m.stencilFail,this.stencilZFail=m.stencilZFail,this.stencilZPass=m.stencilZPass,this.stencilWrite=m.stencilWrite;let g=m.clippingPlanes,_=null;if(g!==null){let x=g.length;_=Array(x);for(let y=0;y!==x;++y)_[y]=g[y].clone()}return this.clippingPlanes=_,this.clipIntersection=m.clipIntersection,this.clipShadows=m.clipShadows,this.shadowSide=m.shadowSide,this.colorWrite=m.colorWrite,this.precision=m.precision,this.polygonOffset=m.polygonOffset,this.polygonOffsetFactor=m.polygonOffsetFactor,this.polygonOffsetUnits=m.polygonOffsetUnits,this.dithering=m.dithering,this.alphaTest=m.alphaTest,this.alphaHash=m.alphaHash,this.alphaToCoverage=m.alphaToCoverage,this.premultipliedAlpha=m.premultipliedAlpha,this.forceSinglePass=m.forceSinglePass,this.allowOverride=m.allowOverride,this.visible=m.visible,this.toneMapped=m.toneMapped,this.userData=JSON.parse(JSON.stringify(m.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(m){if(m===!0)this.version++}}var wi=new Z,bc=new Z,Zo=new Z,Jo=new Z;class Qi{constructor(m=new Z,g=new Z(0,0,-1)){this.origin=m,this.direction=g}set(m,g){return this.origin.copy(m),this.direction.copy(g),this}copy(m){return this.origin.copy(m.origin),this.direction.copy(m.direction),this}at(m,g){return g.copy(this.origin).addScaledVector(this.direction,m)}lookAt(m){return this.direction.copy(m).sub(this.origin).normalize(),this}recast(m){return this.origin.copy(this.at(m,wi)),this}closestPointToPoint(m,g){g.subVectors(m,this.origin);let _=g.dot(this.direction);if(_<0)return g.copy(this.origin);return g.copy(this.origin).addScaledVector(this.direction,_)}distanceToPoint(m){return Math.sqrt(this.distanceSqToPoint(m))}distanceSqToPoint(m){let g=wi.subVectors(m,this.origin).dot(this.direction);if(g<0)return this.origin.distanceToSquared(m);return wi.copy(this.origin).addScaledVector(this.direction,g),wi.distanceToSquared(m)}distanceSqToSegment(m,g,_,x){bc.copy(m).add(g).multiplyScalar(0.5),Zo.copy(g).sub(m).normalize(),Jo.copy(this.origin).sub(bc);let y=m.distanceTo(g)*0.5,v=-this.direction.dot(Zo),b=Jo.dot(this.direction),S=-Jo.dot(Zo),M=Jo.lengthSq(),w=Math.abs(1-v*v),E,A,T,R;if(w>0)if(E=v*S-b,A=v*b-S,R=y*w,E>=0)if(A>=-R)if(A<=R){let P=1/w;E*=P,A*=P,T=E*(E+v*A+2*b)+A*(v*E+A+2*S)+M}else A=y,E=Math.max(0,-(v*A+b)),T=-E*E+A*(A+2*S)+M;else A=-y,E=Math.max(0,-(v*A+b)),T=-E*E+A*(A+2*S)+M;else if(A<=-R)E=Math.max(0,-(-v*y+b)),A=E>0?-y:Math.min(Math.max(-y,-S),y),T=-E*E+A*(A+2*S)+M;else if(A<=R)E=0,A=Math.min(Math.max(-y,-S),y),T=A*(A+2*S)+M;else E=Math.max(0,-(v*y+b)),A=E>0?y:Math.min(Math.max(-y,-S),y),T=-E*E+A*(A+2*S)+M;else A=v>0?-y:y,E=Math.max(0,-(v*A+b)),T=-E*E+A*(A+2*S)+M;if(_)_.copy(this.origin).addScaledVector(this.direction,E);if(x)x.copy(bc).addScaledVector(Zo,A);return T}intersectSphere(m,g){if(m.radius<0)return null;wi.subVectors(m.center,this.origin);let _=wi.dot(this.direction),x=wi.dot(wi)-_*_,y=m.radius*m.radius;if(x>y)return null;let v=Math.sqrt(y-x),b=_-v,S=_+v;if(S<0)return null;if(b<0)return this.at(S,g);return this.at(b,g)}intersectsSphere(m){if(m.radius<0)return!1;return this.distanceSqToPoint(m.center)<=m.radius*m.radius}distanceToPlane(m){let g=m.normal.dot(this.direction);if(g===0){if(m.distanceToPoint(this.origin)===0)return 0;return null}let _=-(this.origin.dot(m.normal)+m.constant)/g;return _>=0?_:null}intersectPlane(m,g){let _=this.distanceToPlane(m);if(_===null)return null;return this.at(_,g)}intersectsPlane(m){let g=m.distanceToPoint(this.origin);if(g===0)return!0;if(m.normal.dot(this.direction)*g<0)return!0;return!1}intersectBox(m,g){let _,x,y,v,b,S,M=1/this.direction.x,w=1/this.direction.y,E=1/this.direction.z,A=this.origin;if(M>=0)_=(m.min.x-A.x)*M,x=(m.max.x-A.x)*M;else _=(m.max.x-A.x)*M,x=(m.min.x-A.x)*M;if(w>=0)y=(m.min.y-A.y)*w,v=(m.max.y-A.y)*w;else y=(m.max.y-A.y)*w,v=(m.min.y-A.y)*w;if(_>v||y>x)return null;if(y>_||isNaN(_))_=y;if(v<x||isNaN(x))x=v;if(E>=0)b=(m.min.z-A.z)*E,S=(m.max.z-A.z)*E;else b=(m.max.z-A.z)*E,S=(m.min.z-A.z)*E;if(_>S||b>x)return null;if(b>_||_!==_)_=b;if(S<x||x!==x)x=S;if(x<0)return null;return this.at(_>=0?_:x,g)}intersectsBox(m){return this.intersectBox(m,wi)!==null}intersectTriangle(m,g,_,x,y){let v=this.origin,b=this.direction,{x:S,y:M,z:w}=b,E=m.x-v.x,A=m.y-v.y,T=m.z-v.z,R=g.x-v.x,P=g.y-v.y,N=g.z-v.z,C=_.x-v.x,I=_.y-v.y,L=_.z-v.z,U=Math.abs(S),O=Math.abs(M),F=Math.abs(w),k,D,B,z,W,V,Y,ee,X,ie,le,te;if(U>=O&&U>=F)if(B=S,V=E,X=R,te=C,S>=0)k=M,D=w,z=A,W=T,Y=P,ee=N,ie=I,le=L;else k=w,D=M,z=T,W=A,Y=N,ee=P,ie=L,le=I;else if(O>=F)if(B=M,V=A,X=P,te=I,M>=0)k=w,D=S,z=T,W=E,Y=N,ee=R,ie=L,le=C;else k=S,D=w,z=E,W=T,Y=R,ee=N,ie=C,le=L;else if(B=w,V=T,X=N,te=L,w>=0)k=S,D=M,z=E,W=A,Y=R,ee=P,ie=C,le=I;else k=M,D=S,z=A,W=E,Y=P,ee=R,ie=I,le=C;if(B===0)return null;let ve=k/B,J=D/B,ae=1/B,ge=z-ve*V,Te=W-J*V,ce=Y-ve*X,ye=ee-J*X,Ie=ie-ve*te,xe=le-J*te,Ue=Ie*ye-xe*ce,Ce=ge*xe-Te*Ie,rt=ce*Te-ye*ge;if(x){if(Ue<0||Ce<0||rt<0)return null}else if((Ue<0||Ce<0||rt<0)&&(Ue>0||Ce>0||rt>0))return null;let tt=Ue+Ce+rt;if(tt===0)return null;let Be=ae*(Ue*V+Ce*X+rt*te);if(tt>0?Be<0:Be>0)return null;return this.at(Be/tt,y)}applyMatrix4(m){return this.origin.applyMatrix4(m),this.direction.transformDirection(m),this}equals(m){return m.origin.equals(this.origin)&&m.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ur extends Di{constructor(m){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new st(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(m)}copy(m){return super.copy(m),this.color.copy(m.color),this.map=m.map,this.lightMap=m.lightMap,this.lightMapIntensity=m.lightMapIntensity,this.aoMap=m.aoMap,this.aoMapIntensity=m.aoMapIntensity,this.specularMap=m.specularMap,this.alphaMap=m.alphaMap,this.envMap=m.envMap,this.envMapRotation.copy(m.envMapRotation),this.combine=m.combine,this.reflectivity=m.reflectivity,this.refractionRatio=m.refractionRatio,this.wireframe=m.wireframe,this.wireframeLinewidth=m.wireframeLinewidth,this.wireframeLinecap=m.wireframeLinecap,this.wireframeLinejoin=m.wireframeLinejoin,this.fog=m.fog,this}}var uf=new Qe,ms=new Qi,Ko=new Pn,hf=new Z,jo=new Z,Qo=new Z,ea=new Z,Sc=new Z,ta=new Z,df=new Z,na=new Z;class Xt extends nn{constructor(m=new sn,g=new ur){super();this.isMesh=!0,this.type="Mesh",this.geometry=m,this.material=g,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(m,g){if(super.copy(m,g),m.morphTargetInfluences!==void 0)this.morphTargetInfluences=m.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(m.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},m.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(m.material)?m.material.slice():m.material,this.geometry=m.geometry,this}updateMorphTargets(){let g=this.geometry.morphAttributes,_=Object.keys(g);if(_.length>0){let x=g[_[0]];if(x!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let y=0,v=x.length;y<v;y++){let b=x[y].name||String(y);this.morphTargetInfluences.push(0),this.morphTargetDictionary[b]=y}}}}getVertexPosition(m,g){let _=this.geometry,x=_.attributes.position,y=_.morphAttributes.position,v=_.morphTargetsRelative;g.fromBufferAttribute(x,m);let b=this.morphTargetInfluences;if(y&&b){ta.set(0,0,0);for(let S=0,M=y.length;S<M;S++){let w=b[S],E=y[S];if(w===0)continue;if(Sc.fromBufferAttribute(E,m),v)ta.addScaledVector(Sc,w);else ta.addScaledVector(Sc.sub(g),w)}g.add(ta)}return g}intersectsFrustum(m){return m.intersectsObject(this)}raycast(m,g){let _=this.geometry,x=this.material,y=this.matrixWorld;if(x===void 0)return;if(_.boundingSphere===null)_.computeBoundingSphere();if(Ko.copy(_.boundingSphere),Ko.applyMatrix4(y),ms.copy(m.ray).recast(m.near),Ko.containsPoint(ms.origin)===!1){if(ms.intersectSphere(Ko,hf)===null)return;if(ms.origin.distanceToSquared(hf)>(m.far-m.near)**2)return}if(uf.copy(y).invert(),ms.copy(m.ray).applyMatrix4(uf),_.boundingBox!==null){if(ms.intersectsBox(_.boundingBox)===!1)return}this._computeIntersections(m,g,ms)}_computeIntersections(m,g,_){let x,y=this.geometry,v=this.material,b=y.index,S=y.attributes.position,M=y.attributes.uv,w=y.attributes.uv1,E=y.attributes.normal,{groups:A,drawRange:T}=y;if(b!==null)if(Array.isArray(v))for(let R=0,P=A.length;R<P;R++){let N=A[R],C=v[N.materialIndex],I=Math.max(N.start,T.start),L=Math.min(b.count,Math.min(N.start+N.count,T.start+T.count));for(let U=I,O=L;U<O;U+=3){let F=b.getX(U),k=b.getX(U+1),D=b.getX(U+2);if(x=ia(this,C,m,_,M,w,E,F,k,D),x)x.faceIndex=Math.floor(U/3),x.face.materialIndex=N.materialIndex,g.push(x)}}else{let R=Math.max(0,T.start),P=Math.min(b.count,T.start+T.count);for(let N=R,C=P;N<C;N+=3){let I=b.getX(N),L=b.getX(N+1),U=b.getX(N+2);if(x=ia(this,v,m,_,M,w,E,I,L,U),x)x.faceIndex=Math.floor(N/3),g.push(x)}}else if(S!==void 0)if(Array.isArray(v))for(let R=0,P=A.length;R<P;R++){let N=A[R],C=v[N.materialIndex],I=Math.max(N.start,T.start),L=Math.min(S.count,Math.min(N.start+N.count,T.start+T.count));for(let U=I,O=L;U<O;U+=3){let F=U,k=U+1,D=U+2;if(x=ia(this,C,m,_,M,w,E,F,k,D),x)x.faceIndex=Math.floor(U/3),x.face.materialIndex=N.materialIndex,g.push(x)}}else{let R=Math.max(0,T.start),P=Math.min(S.count,T.start+T.count);for(let N=R,C=P;N<C;N+=3){let I=N,L=N+1,U=N+2;if(x=ia(this,v,m,_,M,w,E,I,L,U),x)x.faceIndex=Math.floor(N/3),g.push(x)}}}}function __(m,g,_,x,y,v,b,S){let M;if(g.side===1)M=x.intersectTriangle(b,v,y,!0,S);else M=x.intersectTriangle(y,v,b,g.side===0,S);if(M===null)return null;na.copy(S),na.applyMatrix4(m.matrixWorld);let w=_.ray.origin.distanceTo(na);if(w<_.near||w>_.far)return null;return{distance:w,point:na.clone(),object:m}}function ia(m,g,_,x,y,v,b,S,M,w){m.getVertexPosition(S,jo),m.getVertexPosition(M,Qo),m.getVertexPosition(w,ea);let E=__(m,g,_,x,jo,Qo,ea,df);if(E){let A=new Z;if(jt.getBarycoord(df,jo,Qo,ea,A),y)E.uv=jt.getInterpolatedAttribute(y,S,M,w,A,new $e);if(v)E.uv1=jt.getInterpolatedAttribute(v,S,M,w,A,new $e);if(b){if(E.normal=jt.getInterpolatedAttribute(b,S,M,w,A,new Z),E.normal.dot(x.direction)>0)E.normal.multiplyScalar(-1)}let T={a:S,b:M,c:w,normal:new Z,materialIndex:0};jt.getNormal(jo,Qo,ea,T.normal),E.face=T,E.barycoord=A}return E}class Yi extends Vt{constructor(m=null,g=1,_=1,x,y,v,b,S,M=1003,w=1003,E,A){super(null,v,b,S,M,w,x,y,E,A);this.isDataTexture=!0,this.image={data:m,width:g,height:_},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var gs=new Pn,x_=new $e(0.5,0.5),sa=new Z;class $i{constructor(m=new mn,g=new mn,_=new mn,x=new mn,y=new mn,v=new mn){this.planes=[m,g,_,x,y,v]}set(m,g,_,x,y,v){let b=this.planes;return b[0].copy(m),b[1].copy(g),b[2].copy(_),b[3].copy(x),b[4].copy(y),b[5].copy(v),this}copy(m){let g=this.planes;for(let _=0;_<6;_++)g[_].copy(m.planes[_]);return this}setFromProjectionMatrix(m,g=2000,_=!1){let x=this.planes,y=m.elements,v=y[0],b=y[1],S=y[2],M=y[3],w=y[4],E=y[5],A=y[6],T=y[7],R=y[8],P=y[9],N=y[10],C=y[11],I=y[12],L=y[13],U=y[14],O=y[15];if(x[0].setComponents(M-v,T-w,C-R,O-I).normalize(),x[1].setComponents(M+v,T+w,C+R,O+I).normalize(),x[2].setComponents(M+b,T+E,C+P,O+L).normalize(),x[3].setComponents(M-b,T-E,C-P,O-L).normalize(),_)x[4].setComponents(S,A,N,U).normalize(),x[5].setComponents(M-S,T-A,C-N,O-U).normalize();else if(x[4].setComponents(M-S,T-A,C-N,O-U).normalize(),g===2000)x[5].setComponents(M+S,T+A,C+N,O+U).normalize();else if(g===2001)x[5].setComponents(S,A,N,U).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+g);return this}intersectsObject(m){if(m.boundingSphere!==void 0){if(m.boundingSphere===null)m.computeBoundingSphere();gs.copy(m.boundingSphere).applyMatrix4(m.matrixWorld)}else{let g=m.geometry;if(g.boundingSphere===null)g.computeBoundingSphere();gs.copy(g.boundingSphere).applyMatrix4(m.matrixWorld)}return this.intersectsSphere(gs)}intersectsSprite(m){gs.center.set(0,0,0);let g=x_.distanceTo(m.center);return gs.radius=0.7071067811865476+g,gs.applyMatrix4(m.matrixWorld),this.intersectsSphere(gs)}intersectsSphere(m){let g=this.planes,_=m.center,x=-m.radius;for(let y=0;y<6;y++)if(g[y].distanceToPoint(_)<x)return!1;return!0}intersectsBox(m){let g=this.planes;for(let _=0;_<6;_++){let x=g[_];if(sa.x=x.normal.x>0?m.max.x:m.min.x,sa.y=x.normal.y>0?m.max.y:m.min.y,sa.z=x.normal.z>0?m.max.z:m.min.z,x.distanceToPoint(sa)<0)return!1}return!0}containsPoint(m){let g=this.planes;for(let _=0;_<6;_++)if(g[_].distanceToPoint(m)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var ff=new Qe;class ao{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(m){let g=m.cameras,_=this._frustums;for(let x=0;x<g.length;x++){let y=g[x];if(ff.multiplyMatrices(y.projectionMatrix,y.matrixWorldInverse),_[x]===void 0)_[x]=new $i;_[x].setFromProjectionMatrix(ff,y.coordinateSystem,y.reversedDepth)}return this._count=g.length,this}getFrustum(m){return this._frustums[m]}intersectsObject(m){let g=this._frustums;for(let _=0;_<this._count;_++)if(g[_].intersectsObject(m))return!0;return!1}intersectsSprite(m){let g=this._frustums;for(let _=0;_<this._count;_++)if(g[_].intersectsSprite(m))return!0;return!1}intersectsSphere(m){let g=this._frustums;for(let _=0;_<this._count;_++)if(g[_].intersectsSphere(m))return!0;return!1}intersectsBox(m){let g=this._frustums;for(let _=0;_<this._count;_++)if(g[_].intersectsBox(m))return!0;return!1}containsPoint(m){let g=this._frustums;for(let _=0;_<this._count;_++)if(g[_].containsPoint(m))return!0;return!1}copy(m){this.coordinateSystem=m.coordinateSystem;let g=this._frustums,_=m._frustums;for(let x=0;x<m._count;x++){if(g[x]===void 0)g[x]=new $i;g[x].copy(_[x])}return this._count=m._count,this}clone(){return new ao().copy(this)}}function Mc(m,g){return m-g}function y_(m,g){return m.z-g.z}function v_(m,g){return g.z-m.z}class Lp{constructor(){this.index=0,this.pool=[],this.list=[]}push(m,g,_,x){let y=this.pool,v=this.list;if(this.index>=y.length)y.push({start:-1,count:-1,z:-1,index:-1});let b=y[this.index];v.push(b),this.index++,b.start=m,b.count=g,b.z=_,b.index=x}reset(){this.list.length=0,this.index=0}}var Dn=new Qe,b_=new st(1,1,1),S_=new $i,M_=new ao,ra=new yt,_s=new Pn,wc=new Z,pf=new Z,mf=new Z,w_=new Z,Ec=new Lp,Sn=new Xt,oa=[];function E_(m,g,_=0){let x=g.itemSize;if(m.isInterleavedBufferAttribute||m.array.constructor!==g.array.constructor){let y=m.count;for(let v=0;v<y;v++)for(let b=0;b<x;b++)g.setComponent(v+_,b,m.getComponent(v,b))}else g.array.set(m.array,_*x);g.needsUpdate=!0}function ci(m,g){if(m.constructor!==g.constructor){let _=Math.min(m.length,g.length);for(let x=0;x<_;x++)g[x]=m[x]}else{let _=Math.min(m.length,g.length);g.set(new m.constructor(m.buffer,0,_))}}class Ia extends Xt{constructor(m,g,_=g*2,x){super(new sn,x);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=m,this._maxVertexCount=g,this._maxIndexCount=_,this._multiDrawCounts=new Int32Array(m),this._multiDrawStarts=new Int32Array(m),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(m),this._mergedDrawStarts=new Int32Array(m),this._mergedDrawInstanceCounts=new Int32Array(m),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let m=Math.sqrt(this._maxInstanceCount*4);m=Math.ceil(m/4)*4,m=Math.max(m,4);let g=new Float32Array(m*m*4),_=new Yi(g,m,m,1023,1015);this._matricesTexture=_}_initIndirectTexture(){let m=Math.sqrt(this._maxInstanceCount);m=Math.ceil(m);let g=new Uint32Array(m*m),_=new Yi(g,m,m,1029,1014);this._indirectTexture=_}_initColorsTexture(){let m=Math.sqrt(this._maxInstanceCount);m=Math.ceil(m);let g=new Float32Array(m*m*4).fill(1),_=new Yi(g,m,m,1023,1015);_.colorSpace=ut.workingColorSpace,this._colorsTexture=_}_initializeGeometry(m){let g=this.geometry,_=this._maxVertexCount,x=this._maxIndexCount;if(this._geometryInitialized===!1){for(let y in m.attributes){let v=m.getAttribute(y),{array:b,itemSize:S,normalized:M}=v,w=new b.constructor(_*S),E=new Qt(w,S,M);g.setAttribute(y,E)}if(m.getIndex()!==null){let y=_>65535?new Uint32Array(x):new Uint16Array(x);g.setIndex(new Qt(y,1))}this._geometryInitialized=!0}}_validateGeometry(m){let g=this.geometry;if(Boolean(m.getIndex())!==Boolean(g.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let _ in g.attributes){if(!m.hasAttribute(_))throw Error(`THREE.BatchedMesh: Added geometry missing "${_}". All geometries must have consistent attributes.`);let x=m.getAttribute(_),y=g.getAttribute(_);if(x.itemSize!==y.itemSize||x.normalized!==y.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${_}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(m){let g=this._instanceInfo;if(m<0||m>=g.length||g[m].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${m}. Instance is either out of range or has been deleted.`)}validateGeometryId(m){let g=this._geometryInfo;if(m<0||m>=g.length||g[m].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${m}. Geometry is either out of range or has been deleted.`)}setCustomSort(m){return this.customSort=m,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new yt;let m=this.boundingBox,g=this._instanceInfo;m.makeEmpty();for(let _=0,x=g.length;_<x;_++){if(g[_].active===!1)continue;let y=g[_].geometryIndex;this.getMatrixAt(_,Dn),this.getBoundingBoxAt(y,ra).applyMatrix4(Dn),m.union(ra)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Pn;let m=this.boundingSphere,g=this._instanceInfo;m.makeEmpty();for(let _=0,x=g.length;_<x;_++){if(g[_].active===!1)continue;let y=g[_].geometryIndex;this.getMatrixAt(_,Dn),this.getBoundingSphereAt(y,_s).applyMatrix4(Dn),m.union(_s)}}addInstance(m){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let _={visible:!0,active:!0,geometryIndex:m},x=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Mc),x=this._availableInstanceIds.shift(),this._instanceInfo[x]=_;else x=this._instanceInfo.length,this._instanceInfo.push(_);let y=this._matricesTexture;Dn.identity().toArray(y.image.data,x*16),y.needsUpdate=!0;let v=this._colorsTexture;if(v)b_.toArray(v.image.data,x*4),v.needsUpdate=!0;return this._visibilityChanged=!0,x}addGeometry(m,g=-1,_=-1){this._initializeGeometry(m),this._validateGeometry(m);let x={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},y=this._geometryInfo;x.vertexStart=this._nextVertexStart,x.reservedVertexCount=g===-1?m.getAttribute("position").count:g;let v=m.getIndex();if(v!==null)x.indexStart=this._nextIndexStart,x.reservedIndexCount=_===-1?v.count:_;if(x.indexStart!==-1&&x.indexStart+x.reservedIndexCount>this._maxIndexCount||x.vertexStart+x.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let S;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Mc),S=this._availableGeometryIds.shift(),y[S]=x;else S=this._geometryCount,this._geometryCount++,y.push(x);return this.setGeometryAt(S,m),this._nextIndexStart=x.indexStart+x.reservedIndexCount,this._nextVertexStart=x.vertexStart+x.reservedVertexCount,S}setGeometryAt(m,g){if(m>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(g);let _=this.geometry,x=_.getIndex()!==null,y=_.getIndex(),v=g.getIndex(),b=this._geometryInfo[m];if(x&&v.count>b.reservedIndexCount||g.attributes.position.count>b.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:S,reservedVertexCount:M}=b;b.vertexCount=g.getAttribute("position").count;for(let w in _.attributes){let E=g.getAttribute(w),A=_.getAttribute(w);E_(E,A,S);let T=E.itemSize;for(let R=E.count,P=M;R<P;R++){let N=S+R;for(let C=0;C<T;C++)A.setComponent(N,C,0)}A.needsUpdate=!0,A.addUpdateRange(S*T,M*T)}if(x){let{indexStart:w,reservedIndexCount:E}=b;b.indexCount=g.getIndex().count;for(let A=0;A<v.count;A++)y.setX(w+A,S+v.getX(A));for(let A=v.count,T=E;A<T;A++)y.setX(w+A,S);y.needsUpdate=!0,y.addUpdateRange(w,b.reservedIndexCount)}if(b.start=x?b.indexStart:b.vertexStart,b.count=x?b.indexCount:b.vertexCount,b.boundingBox=null,g.boundingBox!==null)b.boundingBox=g.boundingBox.clone();if(b.boundingSphere=null,g.boundingSphere!==null)b.boundingSphere=g.boundingSphere.clone();return this._visibilityChanged=!0,m}deleteGeometry(m){let g=this._geometryInfo;if(m>=g.length||g[m].active===!1)return this;let _=this._instanceInfo;for(let x=0,y=_.length;x<y;x++)if(_[x].active&&_[x].geometryIndex===m)this.deleteInstance(x);return g[m].active=!1,this._availableGeometryIds.push(m),this._visibilityChanged=!0,this}deleteInstance(m){return this.validateInstanceId(m),this._instanceInfo[m].active=!1,this._availableInstanceIds.push(m),this._visibilityChanged=!0,this}optimize(){let m=0,g=0,_=this._geometryInfo,x=_.map((v,b)=>b).sort((v,b)=>_[v].vertexStart-_[b].vertexStart),y=this.geometry;for(let v=0,b=_.length;v<b;v++){let S=x[v],M=_[S];if(M.active===!1)continue;if(y.index!==null){if(M.indexStart!==g){let{indexStart:w,vertexStart:E,reservedIndexCount:A}=M,T=y.index,R=T.array,P=m-E;for(let N=w;N<w+A;N++)R[N]=R[N]+P;T.array.copyWithin(g,w,w+A),T.addUpdateRange(g,A),T.needsUpdate=!0,M.indexStart=g}g+=M.reservedIndexCount}if(M.vertexStart!==m){let{vertexStart:w,reservedVertexCount:E}=M,A=y.attributes;for(let T in A){let R=A[T],{array:P,itemSize:N}=R;P.copyWithin(m*N,w*N,(w+E)*N),R.addUpdateRange(m*N,E*N),R.needsUpdate=!0}M.vertexStart=m}m+=M.reservedVertexCount,M.start=y.index?M.indexStart:M.vertexStart}return this._nextIndexStart=g,this._nextVertexStart=m,this._visibilityChanged=!0,this}getBoundingBoxAt(m,g){if(m>=this._geometryCount)return null;let _=this.geometry,x=this._geometryInfo[m];if(x.boundingBox===null){let y=new yt,v=_.index,b=_.attributes.position;for(let S=x.start,M=x.start+x.count;S<M;S++){let w=S;if(v)w=v.getX(w);y.expandByPoint(wc.fromBufferAttribute(b,w))}x.boundingBox=y}return g.copy(x.boundingBox),g}getBoundingSphereAt(m,g){if(m>=this._geometryCount)return null;let _=this.geometry,x=this._geometryInfo[m];if(x.boundingSphere===null){let y=new Pn;this.getBoundingBoxAt(m,ra),ra.getCenter(y.center);let v=_.index,b=_.attributes.position,S=0;for(let M=x.start,w=x.start+x.count;M<w;M++){let E=M;if(v)E=v.getX(E);wc.fromBufferAttribute(b,E),S=Math.max(S,y.center.distanceToSquared(wc))}y.radius=Math.sqrt(S),x.boundingSphere=y}return g.copy(x.boundingSphere),g}setMatrixAt(m,g){this.validateInstanceId(m);let _=this._matricesTexture,x=this._matricesTexture.image.data;return g.toArray(x,m*16),_.needsUpdate=!0,this}getMatrixAt(m,g){return this.validateInstanceId(m),g.fromArray(this._matricesTexture.image.data,m*16)}setColorAt(m,g){if(this.validateInstanceId(m),this._colorsTexture===null)this._initColorsTexture();return g.toArray(this._colorsTexture.image.data,m*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(m,g){if(this.validateInstanceId(m),this._colorsTexture===null)if(g.isVector4)return g.set(1,1,1,1);else return g.setRGB(1,1,1);else return g.fromArray(this._colorsTexture.image.data,m*4)}setVisibleAt(m,g){if(this.validateInstanceId(m),this._instanceInfo[m].visible===g)return this;return this._instanceInfo[m].visible=g,this._visibilityChanged=!0,this}getVisibleAt(m){return this.validateInstanceId(m),this._instanceInfo[m].visible}setGeometryIdAt(m,g){return this.validateInstanceId(m),this.validateGeometryId(g),this._instanceInfo[m].geometryIndex=g,this._visibilityChanged=!0,this}getGeometryIdAt(m){return this.validateInstanceId(m),this._instanceInfo[m].geometryIndex}getGeometryRangeAt(m,g={}){this.validateGeometryId(m);let _=this._geometryInfo[m];return g.vertexStart=_.vertexStart,g.vertexCount=_.vertexCount,g.reservedVertexCount=_.reservedVertexCount,g.indexStart=_.indexStart,g.indexCount=_.indexCount,g.reservedIndexCount=_.reservedIndexCount,g.start=_.start,g.count=_.count,g}setInstanceCount(m){let g=this._availableInstanceIds,_=this._instanceInfo;g.sort(Mc);while(g[g.length-1]===_.length-1)_.pop(),g.pop();if(m<_.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${m} are being used. Cannot shrink instance count.`);let x=new Int32Array(m),y=new Int32Array(m);ci(this._multiDrawCounts,x),ci(this._multiDrawStarts,y),this._multiDrawCounts=x,this._multiDrawStarts=y;let v=new Int32Array(m),b=new Int32Array(m),S=new Int32Array(m);ci(this._mergedDrawCounts,v),ci(this._mergedDrawStarts,b),ci(this._mergedDrawInstanceCounts,S),this._mergedDrawCounts=v,this._mergedDrawStarts=b,this._mergedDrawInstanceCounts=S,this._maxInstanceCount=m;let M=this._indirectTexture,w=this._matricesTexture,E=this._colorsTexture;if(M.dispose(),this._initIndirectTexture(),ci(M.image.data,this._indirectTexture.image.data),w.dispose(),this._initMatricesTexture(),ci(w.image.data,this._matricesTexture.image.data),E)E.dispose(),this._initColorsTexture(),ci(E.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(m,g){let _=[...this._geometryInfo].filter((b)=>b.active);if(Math.max(..._.map((b)=>b.vertexStart+b.reservedVertexCount))>m)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${m}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(..._.map((S)=>S.indexStart+S.reservedIndexCount))>g)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${g}. Cannot shrink further.`)}let y=this.geometry;if(y.dispose(),this._maxVertexCount=m,this._maxIndexCount=g,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new sn,this._initializeGeometry(y);let v=this.geometry;if(y.index)ci(y.index.array,v.index.array);for(let b in y.attributes)ci(y.attributes[b].array,v.attributes[b].array);this._visibilityChanged=!0}raycast(m,g){let _=this._instanceInfo,x=this._geometryInfo,y=this.matrixWorld,v=this.geometry;if(Sn.material=this.material,Sn.geometry.index=v.index,Sn.geometry.attributes=v.attributes,Sn.geometry.boundingBox===null)Sn.geometry.boundingBox=new yt;if(Sn.geometry.boundingSphere===null)Sn.geometry.boundingSphere=new Pn;for(let b=0,S=_.length;b<S;b++){if(!_[b].visible||!_[b].active)continue;let M=_[b].geometryIndex,w=x[M];Sn.geometry.setDrawRange(w.start,w.count),this.getMatrixAt(b,Sn.matrixWorld).premultiply(y),this.getBoundingBoxAt(M,Sn.geometry.boundingBox),this.getBoundingSphereAt(M,Sn.geometry.boundingSphere),Sn.raycast(m,oa);for(let E=0,A=oa.length;E<A;E++){let T=oa[E];T.object=this,T.batchId=b,g.push(T)}oa.length=0}Sn.material=null,Sn.geometry.index=null,Sn.geometry.attributes={},Sn.geometry.setDrawRange(0,1/0)}copy(m){if(super.copy(m),this.geometry=m.geometry.clone(),this.perObjectFrustumCulled=m.perObjectFrustumCulled,this.sortObjects=m.sortObjects,this.boundingBox=m.boundingBox!==null?m.boundingBox.clone():null,this.boundingSphere=m.boundingSphere!==null?m.boundingSphere.clone():null,this._geometryInfo=m._geometryInfo.map((g)=>({...g,boundingBox:g.boundingBox!==null?g.boundingBox.clone():null,boundingSphere:g.boundingSphere!==null?g.boundingSphere.clone():null})),this._instanceInfo=m._instanceInfo.map((g)=>({...g})),this._availableInstanceIds=m._availableInstanceIds.slice(),this._availableGeometryIds=m._availableGeometryIds.slice(),this._nextIndexStart=m._nextIndexStart,this._nextVertexStart=m._nextVertexStart,this._geometryCount=m._geometryCount,this._maxInstanceCount=m._maxInstanceCount,this._maxVertexCount=m._maxVertexCount,this._maxIndexCount=m._maxIndexCount,this._geometryInitialized=m._geometryInitialized,this._multiDrawCounts=m._multiDrawCounts.slice(),this._multiDrawStarts=m._multiDrawStarts.slice(),this._multiDrawBytesPerElement=m._multiDrawBytesPerElement,this._mergedDrawCounts=m._mergedDrawCounts.slice(),this._mergedDrawStarts=m._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=m._mergedDrawInstanceCounts.slice(),this._indirectTexture=m._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=m._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),m._colorsTexture!==null)this._colorsTexture=m._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(m,g,_,x="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let y=g.getIndex(),v=y===null?1:y.array.BYTES_PER_ELEMENT,b=1;if(_.wireframe)b=2,v=g.attributes.position.count>65535?4:2;let S=this._instanceInfo,M=this._multiDrawStarts,w=this._multiDrawCounts,E=this._mergedDrawStarts,A=this._mergedDrawCounts,T=this._mergedDrawInstanceCounts,R=this._geometryInfo,P=this.perObjectFrustumCulled,N=this._indirectTexture,C=N.image.data,I=m.isArrayCamera?M_:S_;if(P)if(m.isArrayCamera)I.setFromArrayCamera(m);else Dn.multiplyMatrices(m.projectionMatrix,m.matrixWorldInverse).multiply(this.matrixWorld),I.setFromProjectionMatrix(Dn,m.coordinateSystem,m.reversedDepth);let L=0,U=0;if(this.sortObjects){Dn.copy(this.matrixWorld).invert(),pf.setFromMatrixPosition(m.matrixWorld).applyMatrix4(Dn),mf.set(0,0,-1).transformDirection(m.matrixWorld).transformDirection(Dn);for(let k=0,D=S.length;k<D;k++)if(S[k].visible&&S[k].active){let B=S[k].geometryIndex;this.getMatrixAt(k,Dn),this.getBoundingSphereAt(B,_s).applyMatrix4(Dn);let z=!1;if(P)z=!I.intersectsSphere(_s);if(!z){let W=R[B],V=w_.subVectors(_s.center,pf).dot(mf);Ec.push(W.start,W.count,V,k)}}let O=Ec.list,F=this.customSort;if(F===null)O.sort(_.transparent?v_:y_);else F.call(this,O,m);for(let k=0,D=O.length;k<D;k++){let B=O[k],z=B.start*v*b,W=B.count*b;if(x==="merged")if(U>0&&E[U-1]===z&&A[U-1]===W)T[U-1]++;else E[U]=z,A[U]=W,T[U]=1,U++;else M[L]=z,w[L]=W;C[L]=B.index,L++}Ec.reset()}else for(let O=0,F=S.length;O<F;O++)if(S[O].visible&&S[O].active){let k=S[O].geometryIndex,D=!1;if(P)this.getMatrixAt(O,Dn),this.getBoundingSphereAt(k,_s).applyMatrix4(Dn),D=!I.intersectsSphere(_s);if(!D){let B=R[k],z=B.start*v*b,W=B.count*b;if(x==="merged")if(U>0&&E[U-1]===z&&A[U-1]===W)T[U-1]++;else E[U]=z,A[U]=W,T[U]=1,U++;else M[L]=z,w[L]=W;C[L]=O,L++}}N.needsUpdate=!0,this._multiDrawCount=L,this._mergedDrawCount=U,this._multiDrawBytesPerElement=v,this._visibilityChanged=!1}onBeforeRender(m,g,_,x,y){if(m.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(_,x,y)}onBeforeShadow(m,g,_,x,y,v){if(m.isWebGPURenderer!==!0)this._updateDrawParameters(x,y,v)}}class es extends Di{constructor(m){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new st(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(m)}copy(m){return super.copy(m),this.color.copy(m.color),this.map=m.map,this.linewidth=m.linewidth,this.linecap=m.linecap,this.linejoin=m.linejoin,this.fog=m.fog,this}}var ma=new Z,ga=new Z,gf=new Qe,Wr=new Qi,aa=new Pn,Tc=new Z,_f=new Z;class Ms extends nn{constructor(m=new sn,g=new es){super();this.isLine=!0,this.type="Line",this.geometry=m,this.material=g,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(m,g){if(super.copy(m,g),m.morphTargetInfluences!==void 0)this.morphTargetInfluences=m.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(m.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},m.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(m.material)?m.material.slice():m.material,this.geometry=m.geometry,this}computeLineDistances(){let m=this.geometry;if(m.index===null){let g=m.attributes.position,_=[0];for(let x=1,y=g.count;x<y;x++)ma.fromBufferAttribute(g,x-1),ga.fromBufferAttribute(g,x),_[x]=_[x-1],_[x]+=ma.distanceTo(ga);m.setAttribute("lineDistance",new gn(_,1))}else qe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(m){return m.intersectsObject(this)}raycast(m,g){let _=this.geometry,x=this.matrixWorld,y=m.params.Line.threshold,v=_.drawRange;if(_.boundingSphere===null)_.computeBoundingSphere();if(aa.copy(_.boundingSphere),aa.applyMatrix4(x),aa.radius+=y,m.ray.intersectsSphere(aa)===!1)return;gf.copy(x).invert(),Wr.copy(m.ray).applyMatrix4(gf);let b=y/((this.scale.x+this.scale.y+this.scale.z)/3),S=b*b,M=this.isLineSegments?2:1,w=_.index,A=_.attributes.position;if(w!==null){let T=Math.max(0,v.start),R=Math.min(w.count,v.start+v.count);for(let P=T,N=R-1;P<N;P+=M){let C=w.getX(P),I=w.getX(P+1),L=la(this,m,Wr,S,C,I,P);if(L)g.push(L)}if(this.isLineLoop){let P=w.getX(R-1),N=w.getX(T),C=la(this,m,Wr,S,P,N,R-1);if(C)g.push(C)}}else{let T=Math.max(0,v.start),R=Math.min(A.count,v.start+v.count);for(let P=T,N=R-1;P<N;P+=M){let C=la(this,m,Wr,S,P,P+1,P);if(C)g.push(C)}if(this.isLineLoop){let P=la(this,m,Wr,S,R-1,T,R-1);if(P)g.push(P)}}}updateMorphTargets(){let g=this.geometry.morphAttributes,_=Object.keys(g);if(_.length>0){let x=g[_[0]];if(x!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let y=0,v=x.length;y<v;y++){let b=x[y].name||String(y);this.morphTargetInfluences.push(0),this.morphTargetDictionary[b]=y}}}}}function la(m,g,_,x,y,v,b){let S=m.geometry.attributes.position;if(ma.fromBufferAttribute(S,y),ga.fromBufferAttribute(S,v),_.distanceSqToSegment(ma,ga,Tc,_f)>x)return;Tc.applyMatrix4(m.matrixWorld);let w=g.ray.origin.distanceTo(Tc);if(w<g.near||w>g.far)return;return{distance:w,point:_f.clone().applyMatrix4(m.matrixWorld),index:b,face:null,faceIndex:null,barycoord:null,object:m}}var xf=new Z,yf=new Z;class Oi extends Ms{constructor(m,g){super(m,g);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let m=this.geometry;if(m.index===null){let g=m.attributes.position,_=[];for(let x=0,y=g.count;x<y;x+=2)xf.fromBufferAttribute(g,x),yf.fromBufferAttribute(g,x+1),_[x]=x===0?0:_[x-1],_[x+1]=_[x]+xf.distanceTo(yf);m.setAttribute("lineDistance",new gn(_,1))}else qe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ws extends Ms{constructor(m,g){super(m,g);this.isLineLoop=!0,this.type="LineLoop"}}class lo extends Di{constructor(m){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new st(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(m)}copy(m){return super.copy(m),this.color.copy(m.color),this.map=m.map,this.alphaMap=m.alphaMap,this.size=m.size,this.sizeAttenuation=m.sizeAttenuation,this.fog=m.fog,this}}var vf=new Qe,Cc=new Qi,ca=new Pn,ua=new Z;class Es extends nn{constructor(m=new sn,g=new lo){super();this.isPoints=!0,this.type="Points",this.geometry=m,this.material=g,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(m,g){if(super.copy(m,g),m.morphTargetInfluences!==void 0)this.morphTargetInfluences=m.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(m.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},m.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(m.material)?m.material.slice():m.material,this.geometry=m.geometry,this}intersectsFrustum(m){return m.intersectsObject(this)}raycast(m,g){let _=this.geometry,x=this.matrixWorld,y=m.params.Points.threshold,v=_.drawRange;if(_.boundingSphere===null)_.computeBoundingSphere();if(ca.copy(_.boundingSphere),ca.applyMatrix4(x),ca.radius+=y,m.ray.intersectsSphere(ca)===!1)return;vf.copy(x).invert(),Cc.copy(m.ray).applyMatrix4(vf);let b=y/((this.scale.x+this.scale.y+this.scale.z)/3),S=b*b,M=_.index,E=_.attributes.position;if(M!==null){let A=Math.max(0,v.start),T=Math.min(M.count,v.start+v.count);for(let R=A,P=T;R<P;R++){let N=M.getX(R);ua.fromBufferAttribute(E,N),bf(ua,N,S,x,m,g,this)}}else{let A=Math.max(0,v.start),T=Math.min(E.count,v.start+v.count);for(let R=A,P=T;R<P;R++)ua.fromBufferAttribute(E,R),bf(ua,R,S,x,m,g,this)}}updateMorphTargets(){let g=this.geometry.morphAttributes,_=Object.keys(g);if(_.length>0){let x=g[_[0]];if(x!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let y=0,v=x.length;y<v;y++){let b=x[y].name||String(y);this.morphTargetInfluences.push(0),this.morphTargetDictionary[b]=y}}}}}function bf(m,g,_,x,y,v,b){let S=Cc.distanceSqToPoint(m);if(S<_){let M=new Z;Cc.closestPointToPoint(m,M),M.applyMatrix4(x);let w=y.ray.origin.distanceTo(M);if(w<y.near||w>y.far)return;v.push({distance:w,distanceToRay:Math.sqrt(S),point:M,index:g,face:null,faceIndex:null,barycoord:null,object:b})}}class co extends Vt{constructor(m=[],g,_,x,y,v,b,S,M,w,E,A){super(null,v,b,S,M,w,x,y,E,A);this.isCompressedTexture=!0,this.image={width:g,height:_},this.mipmaps=m,this.flipY=!1,this.generateMipmaps=!1}}class La extends Vt{constructor(m=[],g=301,_,x,y,v,b,S,M,w){super(m,g,_,x,y,v,b,S,M,w);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(m){this.image=m}}class Na extends Vt{constructor(m,g,_,x,y,v,b,S,M){super(m,g,_,x,y,v,b,S,M);this.isCanvasTexture=!0,this.needsUpdate=!0}}class ts extends Vt{constructor(m,g,_=1014,x,y,v,b=1003,S=1003,M,w=1026,E=1){if(w!==1026&&w!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let A={width:m,height:g,depth:E};super(A,x,y,v,b,S,w,_,M);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(m){return super.copy(m),this.source=new so(Object.assign({},m.image)),this.compareFunction=m.compareFunction,this}toJSON(m){let g=super.toJSON(m);return g.compareFunction=this.compareFunction,g}}class Da extends ts{constructor(m,g=1014,_=301,x,y,v=1003,b=1003,S,M=1026){let w={width:m,height:m,depth:1},E=[w,w,w,w,w,w];super(m,m,g,_,x,y,v,b,S,M);this.image=E,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(m){this.image=m}}class Oa extends Vt{constructor(m=null){super();this.sourceTexture=m,this.isExternalTexture=!0}copy(m){return super.copy(m),this.sourceTexture=m.sourceTexture,this}}class hr extends sn{constructor(m=1,g=1,_=1,x=1,y=1,v=1){super();this.type="BoxGeometry",this.parameters={width:m,height:g,depth:_,widthSegments:x,heightSegments:y,depthSegments:v};let b=this;x=Math.floor(x),y=Math.floor(y),v=Math.floor(v);let S=[],M=[],w=[],E=[],A=0,T=0;R("z","y","x",-1,-1,_,g,m,v,y,0),R("z","y","x",1,-1,_,g,-m,v,y,1),R("x","z","y",1,1,m,_,g,x,v,2),R("x","z","y",1,-1,m,_,-g,x,v,3),R("x","y","z",1,-1,m,g,_,x,y,4),R("x","y","z",-1,-1,m,g,-_,x,y,5),this.setIndex(S),this.setAttribute("position",new gn(M,3)),this.setAttribute("normal",new gn(w,3)),this.setAttribute("uv",new gn(E,2));function R(P,N,C,I,L,U,O,F,k,D,B){let z=U/k,W=O/D,V=U/2,Y=O/2,ee=F/2,X=k+1,ie=D+1,le=0,te=0,ve=new Z;for(let J=0;J<ie;J++){let ae=J*W-Y;for(let ge=0;ge<X;ge++){let Te=ge*z-V;ve[P]=Te*I,ve[N]=ae*L,ve[C]=ee,M.push(ve.x,ve.y,ve.z),ve[P]=0,ve[N]=0,ve[C]=F>0?1:-1,w.push(ve.x,ve.y,ve.z),E.push(ge/k),E.push(1-J/D),le+=1}}for(let J=0;J<D;J++)for(let ae=0;ae<k;ae++){let ge=A+ae+X*J,Te=A+ae+X*(J+1),ce=A+(ae+1)+X*(J+1),ye=A+(ae+1)+X*J;S.push(ge,Te,ye),S.push(Te,ce,ye),te+=6}b.addGroup(T,te,B),T+=te,A+=le}}copy(m){return super.copy(m),this.parameters=Object.assign({},m.parameters),this}static fromJSON(m){return new hr(m.width,m.height,m.depth,m.widthSegments,m.heightSegments,m.depthSegments)}}class uo extends sn{constructor(m=1,g=1,_=1,x=1){super();this.type="PlaneGeometry",this.parameters={width:m,height:g,widthSegments:_,heightSegments:x};let y=m/2,v=g/2,b=Math.floor(_),S=Math.floor(x),M=b+1,w=S+1,E=m/b,A=g/S,T=[],R=[],P=[],N=[];for(let C=0;C<w;C++){let I=C*A-v;for(let L=0;L<M;L++){let U=L*E-y;R.push(U,-I,0),P.push(0,0,1),N.push(L/b),N.push(1-C/S)}}for(let C=0;C<S;C++)for(let I=0;I<b;I++){let L=I+M*C,U=I+M*(C+1),O=I+1+M*(C+1),F=I+1+M*C;T.push(L,U,F),T.push(U,O,F)}this.setIndex(T),this.setAttribute("position",new gn(R,3)),this.setAttribute("normal",new gn(P,3)),this.setAttribute("uv",new gn(N,2))}copy(m){return super.copy(m),this.parameters=Object.assign({},m.parameters),this}static fromJSON(m){return new uo(m.width,m.height,m.widthSegments,m.heightSegments)}}function Ts(m){let g={};for(let _ in m){g[_]={};for(let x in m[_]){let y=m[_][x];if(Sf(y))if(y.isRenderTargetTexture)qe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),g[_][x]=null;else g[_][x]=y.clone();else if(Array.isArray(y))if(Sf(y[0])){let v=[];for(let b=0,S=y.length;b<S;b++)v[b]=y[b].clone();g[_][x]=v}else g[_][x]=y.slice();else g[_][x]=y}}return g}function En(m){let g={};for(let _=0;_<m.length;_++){let x=Ts(m[_]);for(let y in x)g[y]=x[y]}return g}function Sf(m){return m&&(m.isColor||m.isMatrix3||m.isMatrix4||m.isVector2||m.isVector3||m.isVector4||m.isTexture||m.isQuaternion)}function T_(m){let g=[];for(let _=0;_<m.length;_++)g.push(m[_].clone());return g}function Bu(m){let g=m.getRenderTarget();if(g===null)return m.outputColorSpace;if(g.isXRRenderTarget===!0)return g.texture.colorSpace;return ut.workingColorSpace}var Np={clone:Ts,merge:En},A_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,R_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ui extends Di{constructor(m){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=A_,this.fragmentShader=R_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,m!==void 0)this.setValues(m)}copy(m){return super.copy(m),this.fragmentShader=m.fragmentShader,this.vertexShader=m.vertexShader,this.uniforms=Ts(m.uniforms),this.uniformsGroups=T_(m.uniformsGroups),this.defines=Object.assign({},m.defines),this.wireframe=m.wireframe,this.wireframeLinewidth=m.wireframeLinewidth,this.fog=m.fog,this.lights=m.lights,this.clipping=m.clipping,this.extensions=Object.assign({},m.extensions),this.glslVersion=m.glslVersion,this.defaultAttributeValues=Object.assign({},m.defaultAttributeValues),this.index0AttributeName=m.index0AttributeName,this.uniformsNeedUpdate=m.uniformsNeedUpdate,this}toJSON(m){let g=super.toJSON(m);g.glslVersion=this.glslVersion,g.uniforms={};for(let x in this.uniforms){let v=this.uniforms[x].value;if(v&&v.isTexture)g.uniforms[x]={type:"t",value:v.toJSON(m).uuid};else if(v&&v.isColor)g.uniforms[x]={type:"c",value:v.getHex()};else if(v&&v.isVector2)g.uniforms[x]={type:"v2",value:v.toArray()};else if(v&&v.isVector3)g.uniforms[x]={type:"v3",value:v.toArray()};else if(v&&v.isVector4)g.uniforms[x]={type:"v4",value:v.toArray()};else if(v&&v.isMatrix3)g.uniforms[x]={type:"m3",value:v.toArray()};else if(v&&v.isMatrix4)g.uniforms[x]={type:"m4",value:v.toArray()};else g.uniforms[x]={value:v}}if(Object.keys(this.defines).length>0)g.defines=this.defines;g.vertexShader=this.vertexShader,g.fragmentShader=this.fragmentShader,g.lights=this.lights,g.clipping=this.clipping;let _={};for(let x in this.extensions)if(this.extensions[x]===!0)_[x]=!0;if(Object.keys(_).length>0)g.extensions=_;return g}fromJSON(m,g){if(super.fromJSON(m,g),m.uniforms!==void 0)for(let _ in m.uniforms){let x=m.uniforms[_];switch(this.uniforms[_]={},x.type){case"t":this.uniforms[_].value=g[x.value]||null;break;case"c":this.uniforms[_].value=new st().setHex(x.value);break;case"v2":this.uniforms[_].value=new $e().fromArray(x.value);break;case"v3":this.uniforms[_].value=new Z().fromArray(x.value);break;case"v4":this.uniforms[_].value=new Ht().fromArray(x.value);break;case"m3":this.uniforms[_].value=new et().fromArray(x.value);break;case"m4":this.uniforms[_].value=new Qe().fromArray(x.value);break;default:this.uniforms[_].value=x.value}}if(m.defines!==void 0)this.defines=m.defines;if(m.vertexShader!==void 0)this.vertexShader=m.vertexShader;if(m.fragmentShader!==void 0)this.fragmentShader=m.fragmentShader;if(m.glslVersion!==void 0)this.glslVersion=m.glslVersion;if(m.extensions!==void 0)for(let _ in m.extensions)this.extensions[_]=m.extensions[_];if(m.lights!==void 0)this.lights=m.lights;if(m.clipping!==void 0)this.clipping=m.clipping;return this}}class ku extends Ui{constructor(m){super(m);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Ua extends Di{constructor(m){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new st(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new st(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $e(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(m)}copy(m){return super.copy(m),this.color.copy(m.color),this.map=m.map,this.lightMap=m.lightMap,this.lightMapIntensity=m.lightMapIntensity,this.aoMap=m.aoMap,this.aoMapIntensity=m.aoMapIntensity,this.emissive.copy(m.emissive),this.emissiveMap=m.emissiveMap,this.emissiveIntensity=m.emissiveIntensity,this.bumpMap=m.bumpMap,this.bumpScale=m.bumpScale,this.normalMap=m.normalMap,this.normalMapType=m.normalMapType,this.normalScale.copy(m.normalScale),this.displacementMap=m.displacementMap,this.displacementScale=m.displacementScale,this.displacementBias=m.displacementBias,this.specularMap=m.specularMap,this.alphaMap=m.alphaMap,this.envMap=m.envMap,this.envMapRotation.copy(m.envMapRotation),this.combine=m.combine,this.reflectivity=m.reflectivity,this.envMapIntensity=m.envMapIntensity,this.refractionRatio=m.refractionRatio,this.wireframe=m.wireframe,this.wireframeLinewidth=m.wireframeLinewidth,this.wireframeLinecap=m.wireframeLinecap,this.wireframeLinejoin=m.wireframeLinejoin,this.flatShading=m.flatShading,this.fog=m.fog,this}}class zu extends Di{constructor(m){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(m)}copy(m){return super.copy(m),this.depthPacking=m.depthPacking,this.map=m.map,this.alphaMap=m.alphaMap,this.displacementMap=m.displacementMap,this.displacementScale=m.displacementScale,this.displacementBias=m.displacementBias,this.wireframe=m.wireframe,this.wireframeLinewidth=m.wireframeLinewidth,this}}class Hu extends Di{constructor(m){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(m)}copy(m){return super.copy(m),this.map=m.map,this.alphaMap=m.alphaMap,this.displacementMap=m.displacementMap,this.displacementScale=m.displacementScale,this.displacementBias=m.displacementBias,this}}function $s(m,g){if(!m||m.constructor===g)return m;if(typeof g.BYTES_PER_ELEMENT==="number")return new g(m);return Array.prototype.slice.call(m)}function ha(m){return m!==void 0&&m.inTangents!==void 0&&m.outTangents!==void 0}class As{constructor(m,g,_,x){this.parameterPositions=m,this._cachedIndex=0,this.resultBuffer=x!==void 0?x:new g.constructor(_),this.sampleValues=g,this.valueSize=_,this.settings=null,this.DefaultSettings_={}}evaluate(m){let g=this.parameterPositions,_=this._cachedIndex,x=g[_],y=g[_-1];n:{e:{let v;t:{i:if(!(m<x)){for(let b=_+2;;){if(x===void 0){if(m<y)break i;return _=g.length,this._cachedIndex=_,this.copySampleValue_(_-1)}if(_===b)break;if(y=x,x=g[++_],m<x)break e}v=g.length;break t}if(!(m>=y)){let b=g[1];if(m<b)_=2,y=b;for(let S=_-2;;){if(y===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(_===S)break;if(x=y,y=g[--_-1],m>=y)break e}v=_,_=0;break t}break n}while(_<v){let b=_+v>>>1;if(m<g[b])v=b;else _=b+1}if(x=g[_],y=g[_-1],y===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(x===void 0)return _=g.length,this._cachedIndex=_,this.copySampleValue_(_-1)}this._cachedIndex=_,this.intervalChanged_(_,y,x)}return this.interpolate_(_,y,m,x)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(m){let g=this.resultBuffer,_=this.sampleValues,x=this.valueSize,y=m*x;for(let v=0;v!==x;++v)g[v]=_[y+v];return g}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Gu extends As{constructor(m,g,_,x){super(m,g,_,x);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(m,g,_){let x=this.parameterPositions,y=m-2,v=m+1,b=x[y],S=x[v];if(b===void 0)switch(this.getSettings_().endingStart){case 2401:y=m,b=2*g-_;break;case 2402:y=x.length-2,b=g+x[y]-x[y+1];break;default:y=m,b=_}if(S===void 0)switch(this.getSettings_().endingEnd){case 2401:v=m,S=2*_-g;break;case 2402:v=1,S=_+x[1]-x[0];break;default:v=m-1,S=g}let M=(_-g)*0.5,w=this.valueSize;this._weightPrev=M/(g-b),this._weightNext=M/(S-_),this._offsetPrev=y*w,this._offsetNext=v*w}interpolate_(m,g,_,x){let y=this.resultBuffer,v=this.sampleValues,b=this.valueSize,S=m*b,M=S-b,w=this._offsetPrev,E=this._offsetNext,A=this._weightPrev,T=this._weightNext,R=(_-g)/(x-g),P=R*R,N=P*R,C=-A*N+2*A*P-A*R,I=(1+A)*N+(-1.5-2*A)*P+(-0.5+A)*R+1,L=(-1-T)*N+(1.5+T)*P+0.5*R,U=T*N-T*P;for(let O=0;O!==b;++O)y[O]=C*v[w+O]+I*v[M+O]+L*v[S+O]+U*v[E+O];return y}}class Vu extends As{constructor(m,g,_,x){super(m,g,_,x)}interpolate_(m,g,_,x){let y=this.resultBuffer,v=this.sampleValues,b=this.valueSize,S=m*b,M=S-b,w=(_-g)/(x-g),E=1-w;for(let A=0;A!==b;++A)y[A]=v[M+A]*E+v[S+A]*w;return y}}class Wu extends As{constructor(m,g,_,x){super(m,g,_,x)}interpolate_(m){return this.copySampleValue_(m-1)}}class Xu extends As{interpolate_(m,g,_,x){let y=this.resultBuffer,v=this.sampleValues,b=this.valueSize,S=m*b,M=S-b,w=this.inTangents,E=this.outTangents;if(!w||!E){let R=(_-g)/(x-g),P=1-R;for(let N=0;N!==b;++N)y[N]=v[M+N]*P+v[S+N]*R;return y}let A=b*2,T=m-1;for(let R=0;R!==b;++R){let P=v[M+R],N=v[S+R],C=T*A+R*2,I=E[C],L=E[C+1],U=m*A+R*2,O=w[U],F=w[U+1],k=P_(_,g,I,O,x);y[R]=Dp(k,P,L,F,N)}return y}}function Dp(m,g,_,x,y){let v=1-m;return v*v*v*g+3*v*v*m*_+3*v*m*m*x+m*m*m*y}function C_(m,g,_,x,y){let v=1-m;return 3*v*v*(_-g)+6*v*m*(x-_)+3*m*m*(y-x)}function P_(m,g,_,x,y){let v=(m-g)/(y-g);for(let b=0;b<8;b++){let S=Dp(v,g,_,x,y)-m;if(Math.abs(S)<0.0000000001)break;let M=C_(v,g,_,x,y);if(Math.abs(M)<0.0000000001)break;v=Math.max(0,Math.min(1,v-S/M))}return v}class Zn{constructor(m,g,_,x){if(m===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(g===void 0||g.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+m);this.name=m,this.times=$s(g,this.TimeBufferType),this.values=$s(_,this.ValueBufferType),this.setInterpolation(x||this.DefaultInterpolation)}static toJSON(m){let g=m.constructor,_;if(g.toJSON!==this.toJSON)_=g.toJSON(m);else{_={name:m.name,times:$s(m.times,Array),values:$s(m.values,Array)};let x=m.getInterpolation();if(x!==m.DefaultInterpolation)_.interpolation=x;if(ha(m.settings))_.settings={inTangents:$s(m.settings.inTangents,Array),outTangents:$s(m.settings.outTangents,Array)}}return _.type=m.ValueTypeName,_}InterpolantFactoryMethodDiscrete(m){return new Wu(this.times,this.values,this.getValueSize(),m)}InterpolantFactoryMethodLinear(m){return new Vu(this.times,this.values,this.getValueSize(),m)}InterpolantFactoryMethodSmooth(m){return new Gu(this.times,this.values,this.getValueSize(),m)}InterpolantFactoryMethodBezier(m){let g=new Xu(this.times,this.values,this.getValueSize(),m);if(this.settings)g.inTangents=this.settings.inTangents,g.outTangents=this.settings.outTangents;return g}setInterpolation(m){let g;switch(m){case 2300:g=this.InterpolantFactoryMethodDiscrete;break;case 2301:g=this.InterpolantFactoryMethodLinear;break;case 2302:g=this.InterpolantFactoryMethodSmooth;break;case 2303:g=this.InterpolantFactoryMethodBezier;break}if(g===void 0){let _="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(m!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(_);return qe("KeyframeTrack:",_),this}return this.createInterpolant=g,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(m){if(m!==0){let g=this.times;for(let _=0,x=g.length;_!==x;++_)g[_]+=m;if(ha(this.settings))Mf(this.settings.inTangents,m),Mf(this.settings.outTangents,m)}return this}scale(m){if(m!==1){let g=this.times;for(let _=0,x=g.length;_!==x;++_)g[_]*=m;if(ha(this.settings))wf(this.settings.inTangents,m),wf(this.settings.outTangents,m)}return this}trim(m,g){let _=this.times,x=_.length,y=0,v=x-1;while(y!==x&&_[y]<m)++y;while(v!==-1&&_[v]>g)--v;if(++v,y!==0||v!==x){if(y>=v)v=Math.max(v,1),y=v-1;let b=this.getValueSize();this.times=_.slice(y,v),this.values=this.values.slice(y*b,v*b)}return this}validate(){let m=!0,g=this.getValueSize();if(g-Math.floor(g)!==0)Je("KeyframeTrack: Invalid value size in track.",this),m=!1;let _=this.times,x=this.values,y=_.length;if(y===0)Je("KeyframeTrack: Track is empty.",this),m=!1;let v=null;for(let b=0;b!==y;b++){let S=_[b];if(typeof S==="number"&&isNaN(S)){Je("KeyframeTrack: Time is not a valid number.",this,b,S),m=!1;break}if(v!==null&&v>S){Je("KeyframeTrack: Out of order keys.",this,b,S,v),m=!1;break}v=S}if(x!==void 0){if(k0(x))for(let b=0,S=x.length;b!==S;++b){let M=x[b];if(isNaN(M)){Je("KeyframeTrack: Value is not a valid number.",this,b,M),m=!1;break}}}return m}optimize(){let m=this.times.slice(),g=this.values.slice(),_=this.getValueSize(),x=this.getInterpolation()===2302,y=m.length-1,v=1;for(let b=1;b<y;++b){let S=!1,M=m[b],w=m[b+1];if(M!==w&&(b!==1||M!==m[0]))if(!x){let E=b*_,A=E-_,T=E+_;for(let R=0;R!==_;++R){let P=g[E+R];if(P!==g[A+R]||P!==g[T+R]){S=!0;break}}}else S=!0;if(S){if(b!==v){m[v]=m[b];let E=b*_,A=v*_;for(let T=0;T!==_;++T)g[A+T]=g[E+T]}++v}}if(y>0){m[v]=m[y];for(let b=y*_,S=v*_,M=0;M!==_;++M)g[S+M]=g[b+M];++v}if(v!==m.length)this.times=m.slice(0,v),this.values=g.slice(0,v*_);else this.times=m,this.values=g;return this}clone(){let m=this.times.slice(),g=this.values.slice(),x=new this.constructor(this.name,m,g);if(x.createInterpolant=this.createInterpolant,ha(this.settings))x.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return x}}function Mf(m,g){for(let _=0,x=m.length;_!==x;_+=2)m[_]+=g}function wf(m,g){for(let _=0,x=m.length;_!==x;_+=2)m[_]*=g}Zn.prototype.ValueTypeName="";Zn.prototype.TimeBufferType=Float32Array;Zn.prototype.ValueBufferType=Float32Array;Zn.prototype.DefaultInterpolation=2301;class Rs extends Zn{constructor(m,g,_){super(m,g,_)}}Rs.prototype.ValueTypeName="bool";Rs.prototype.ValueBufferType=Array;Rs.prototype.DefaultInterpolation=2300;Rs.prototype.InterpolantFactoryMethodLinear=void 0;Rs.prototype.InterpolantFactoryMethodSmooth=void 0;class qu extends Zn{constructor(m,g,_,x){super(m,g,_,x)}}qu.prototype.ValueTypeName="color";class Yu extends Zn{constructor(m,g,_,x){super(m,g,_,x)}}Yu.prototype.ValueTypeName="number";class $u extends As{constructor(m,g,_,x){super(m,g,_,x)}interpolate_(m,g,_,x){let y=this.resultBuffer,v=this.sampleValues,b=this.valueSize,S=(_-g)/(x-g),M=m*b;for(let w=M+b;M!==w;M+=4)Ni.slerpFlat(y,0,v,M-b,v,M,S);return y}}class Fa extends Zn{constructor(m,g,_,x){super(m,g,_,x)}InterpolantFactoryMethodLinear(m){return new $u(this.times,this.values,this.getValueSize(),m)}}Fa.prototype.ValueTypeName="quaternion";Fa.prototype.InterpolantFactoryMethodSmooth=void 0;class Cs extends Zn{constructor(m,g,_){super(m,g,_)}}Cs.prototype.ValueTypeName="string";Cs.prototype.ValueBufferType=Array;Cs.prototype.DefaultInterpolation=2300;Cs.prototype.InterpolantFactoryMethodLinear=void 0;Cs.prototype.InterpolantFactoryMethodSmooth=void 0;class Zu extends Zn{constructor(m,g,_,x){super(m,g,_,x)}}Zu.prototype.ValueTypeName="vector";var Pc={enabled:!1,files:{},add:function(m,g){if(this.enabled===!1)return;if(Ef(m))return;this.files[m]=g},get:function(m){if(this.enabled===!1)return;if(Ef(m))return;return this.files[m]},remove:function(m){delete this.files[m]},clear:function(){this.files={}}};function Ef(m){try{let g=m.slice(m.indexOf(":")+1);return new URL(g).protocol==="blob:"}catch(g){return!1}}class Ju{constructor(m,g,_){let x=this,y=!1,v=0,b=0,S=void 0,M=[];this.onStart=void 0,this.onLoad=m,this.onProgress=g,this.onError=_,this._abortController=null,this.itemStart=function(w){if(b++,y===!1){if(x.onStart!==void 0)x.onStart(w,v,b)}y=!0},this.itemEnd=function(w){if(v++,x.onProgress!==void 0)x.onProgress(w,v,b);if(v===b){if(y=!1,x.onLoad!==void 0)x.onLoad()}},this.itemError=function(w){if(x.onError!==void 0)x.onError(w)},this.resolveURL=function(w){if(w=w.normalize("NFC"),S)return S(w);return w},this.setURLModifier=function(w){return S=w,this},this.addHandler=function(w,E){return M.push(w,E),this},this.removeHandler=function(w){let E=M.indexOf(w);if(E!==-1)M.splice(E,2);return this},this.getHandler=function(w){for(let E=0,A=M.length;E<A;E+=2){let T=M[E],R=M[E+1];if(T.global)T.lastIndex=0;if(T.test(w))return R}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Op=new Ju;class ho{constructor(m){if(this.manager=m!==void 0?m:Op,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(m,g){let _=this;return new Promise(function(x,y){_.load(m,x,g,y)})}parse(){}setCrossOrigin(m){return this.crossOrigin=m,this}setWithCredentials(m){return this.withCredentials=m,this}setPath(m){return this.path=m,this}setResourcePath(m){return this.resourcePath=m,this}setRequestHeader(m){return this.requestHeader=m,this}setPriority(m){return this.priority=m,this}setCache(m){return this.cache=m,this}abort(){return this}}ho.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ei={};class Up extends Error{constructor(m,g){super(m);this.response=g}}class Ku extends ho{constructor(m){super(m);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(m,g,_,x){if(m===void 0)m="";if(this.path!==void 0)m=this.path+m;m=this.manager.resolveURL(m);let y=Pc.get(`file:${m}`);if(y!==void 0){this.manager.itemStart(m),setTimeout(()=>{if(g)g(y);this.manager.itemEnd(m)},0);return}if(Ei[m]!==void 0){Ei[m].push({onLoad:g,onProgress:_,onError:x});return}Ei[m]=[],Ei[m].push({onLoad:g,onProgress:_,onError:x});let v=new Request(m,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),b=this.mimeType,S=this.responseType;fetch(v).then((M)=>{if(M.status===200||M.status===0){if(M.status===0)qe("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||M.body===void 0||M.body.getReader===void 0)return M;let w=Ei[m],E=M.body.getReader(),A=M.headers.get("X-File-Size")||M.headers.get("Content-Length"),T=A?parseInt(A):0,R=T!==0,P=0,N=new ReadableStream({start(C){I();function I(){E.read().then(({done:L,value:U})=>{if(L)C.close();else{P+=U.byteLength;let O=new ProgressEvent("progress",{lengthComputable:R,loaded:P,total:T});for(let F=0,k=w.length;F<k;F++){let D=w[F];if(D.onProgress)D.onProgress(O)}C.enqueue(U),I()}},(L)=>{C.error(L)})}}});return new Response(N)}else throw new Up(`fetch for "${M.url}" responded with ${M.status}: ${M.statusText}`,M)}).then((M)=>{switch(S){case"arraybuffer":return M.arrayBuffer();case"blob":return M.blob();case"document":return M.text().then((w)=>new DOMParser().parseFromString(w,b));case"json":return M.json();default:if(b==="")return M.text();else{let E=/charset="?([^;"\s]*)"?/i.exec(b),A=E&&E[1]?E[1].toLowerCase():void 0,T=new TextDecoder(A);return M.arrayBuffer().then((R)=>T.decode(R))}}}).then((M)=>{Pc.add(`file:${m}`,M);let w=Ei[m];delete Ei[m];for(let E=0,A=w.length;E<A;E++){let T=w[E];if(T.onLoad)T.onLoad(M)}}).catch((M)=>{let w=Ei[m];if(w===void 0)throw this.manager.itemError(m),M;delete Ei[m];for(let E=0,A=w.length;E<A;E++){let T=w[E];if(T.onError)T.onError(M)}this.manager.itemError(m)}).finally(()=>{this.manager.itemEnd(m)}),this.manager.itemStart(m)}setResponseType(m){return this.responseType=m,this}setMimeType(m){return this.mimeType=m,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Ba extends ho{constructor(m){super(m)}load(m,g,_,x){let y=this,v=[],b=new co,S=new Ku(this.manager);S.setPriority(this.priority),S.setCache(this.cache),S.setPath(this.path),S.setResponseType("arraybuffer"),S.setRequestHeader(this.requestHeader),S.setWithCredentials(y.withCredentials);let M=0;function w(E){S.load(m[E],function(A){let T=y.parse(A,!0);if(v[E]={width:T.width,height:T.height,format:T.format,mipmaps:T.mipmaps},M+=1,M===6){if(T.mipmapCount===1)b.minFilter=1006;if(b.image=v,b.format=T.format,b.needsUpdate=!0,g)g(b)}},_,x)}if(Array.isArray(m))for(let E=0,A=m.length;E<A;++E)w(E);else S.load(m,function(E){let A=y.parse(E,!0);if(A.isCubemap){let T=A.mipmaps.length/A.mipmapCount;for(let R=0;R<T;R++){v[R]={mipmaps:[]};for(let P=0;P<A.mipmapCount;P++)v[R].mipmaps.push(A.mipmaps[R*A.mipmapCount+P]),v[R].format=A.format,v[R].width=A.width,v[R].height=A.height}b.image=v}else b.image.width=A.width,b.image.height=A.height,b.mipmaps=A.mipmaps;if(A.mipmapCount===1)b.minFilter=1006;if(b.format=A.format,b.needsUpdate=!0,g)g(b)},_,x);return b}}class ka extends nn{static registerNode(m){this.prototype._lightNode=m}constructor(m,g=1){super();this.isLight=!0,this.type="Light",this.color=new st(m),this.intensity=g}copy(m,g){return super.copy(m,g),this.color.copy(m.color),this.intensity=m.intensity,this}toJSON(m){let g=super.toJSON(m);return g.object.color=this.color.getHex(),g.object.intensity=this.intensity,g}}var Ac=new Qe,Tf=new Z,Af=new Z;class ju{constructor(m){this.camera=m,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $e(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new Qe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $i,this._frameExtents=new $e(1,1),this._viewportCount=1,this._viewports=[new Ht(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(m){let g=this.camera;Tf.setFromMatrixPosition(m.matrixWorld),g.position.copy(Tf),Af.setFromMatrixPosition(m.target.matrixWorld),g.lookAt(Af),g.updateMatrixWorld(),this._updateMatrix(g,this.matrix,this._frustum)}_updateMatrix(m,g,_,x){Ac.multiplyMatrices(m.projectionMatrix,m.matrixWorldInverse),_.setFromProjectionMatrix(Ac,m.coordinateSystem,m.reversedDepth);let y=this._frameExtents,v=x?x.z/y.x:1,b=x?x.w/y.y:1,S=x?x.x/y.x:0,M=x?x.y/y.y:0;if(m.coordinateSystem===2001||m.reversedDepth)g.set(0.5*v,0,0,0.5*v+S,0,0.5*b,0,0.5*b+M,0,0,1,0,0,0,0,1);else g.set(0.5*v,0,0,0.5*v+S,0,0.5*b,0,0.5*b+M,0,0,0.5,0.5,0,0,0,1);g.multiply(Ac)}getViewport(m){return this._viewports[m]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(m){return this.camera=m.camera.clone(),this.intensity=m.intensity,this.bias=m.bias,this.radius=m.radius,this.autoUpdate=m.autoUpdate,this.needsUpdate=m.needsUpdate,this.normalBias=m.normalBias,this.blurSamples=m.blurSamples,this.mapSize.copy(m.mapSize),this.mapType=m.mapType,this.biasNode=m.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let m={};return m.intensity=this.intensity,m.bias=this.bias,m.normalBias=this.normalBias,m.radius=this.radius,m.blurSamples=this.blurSamples,m.mapSize=this.mapSize.toArray(),m.mapType=this.mapType,m.camera=this.camera.toJSON(!1).object,delete m.camera.matrix,m}}var da=new Z,fa=new Ni,ui=new Z;class za extends nn{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Qe,this.projectionMatrix=new Qe,this.projectionMatrixInverse=new Qe,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(m,g){return super.copy(m,g),this.matrixWorldInverse.copy(m.matrixWorldInverse),this.projectionMatrix.copy(m.projectionMatrix),this.projectionMatrixInverse.copy(m.projectionMatrixInverse),this.coordinateSystem=m.coordinateSystem,this}getWorldDirection(m){return super.getWorldDirection(m).negate()}updateMatrixWorld(m){if(super.updateMatrixWorld(m),this.matrixWorld.decompose(da,fa,ui),ui.x===1&&ui.y===1&&ui.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(da,fa,ui.set(1,1,1)).invert()}updateWorldMatrix(m,g,_=!1){if(super.updateWorldMatrix(m,g,_),this.matrixWorld.decompose(da,fa,ui),ui.x===1&&ui.y===1&&ui.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(da,fa,ui.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Xi=new Z,Rf=new $e,Cf=new $e;class On extends za{constructor(m=50,g=1,_=0.1,x=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=m,this.zoom=1,this.near=_,this.far=x,this.focus=10,this.aspect=g,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(m,g){return super.copy(m,g),this.fov=m.fov,this.zoom=m.zoom,this.near=m.near,this.far=m.far,this.focus=m.focus,this.aspect=m.aspect,this.view=m.view===null?null:Object.assign({},m.view),this.filmGauge=m.filmGauge,this.filmOffset=m.filmOffset,this}setFocalLength(m){let g=0.5*this.getFilmHeight()/m;this.fov=tr*2*Math.atan(g),this.updateProjectionMatrix()}getFocalLength(){let m=Math.tan(qr*0.5*this.fov);return 0.5*this.getFilmHeight()/m}getEffectiveFOV(){return tr*2*Math.atan(Math.tan(qr*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(m,g,_){Xi.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),g.set(Xi.x,Xi.y).multiplyScalar(-m/Xi.z),Xi.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),_.set(Xi.x,Xi.y).multiplyScalar(-m/Xi.z)}getViewSize(m,g){return this.getViewBounds(m,Rf,Cf),g.subVectors(Cf,Rf)}setViewOffset(m,g,_,x,y,v){if(this.aspect=m/g,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=m,this.view.fullHeight=g,this.view.offsetX=_,this.view.offsetY=x,this.view.width=y,this.view.height=v,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let m=this.near,g=m*Math.tan(qr*0.5*this.fov)/this.zoom,_=2*g,x=this.aspect*_,y=-0.5*x,v=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:S,fullHeight:M}=v;y+=v.offsetX*x/S,g-=v.offsetY*_/M,x*=v.width/S,_*=v.height/M}let b=this.filmOffset;if(b!==0)y+=m*b/this.getFilmWidth();this.projectionMatrix.makePerspective(y,y+x,g,g-_,m,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(m){let g=super.toJSON(m);if(g.object.fov=this.fov,g.object.zoom=this.zoom,g.object.near=this.near,g.object.far=this.far,g.object.focus=this.focus,g.object.aspect=this.aspect,this.view!==null)g.object.view=Object.assign({},this.view);return g.object.filmGauge=this.filmGauge,g.object.filmOffset=this.filmOffset,g}}class Ha extends za{constructor(m=-1,g=1,_=1,x=-1,y=0.1,v=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=m,this.right=g,this.top=_,this.bottom=x,this.near=y,this.far=v,this.updateProjectionMatrix()}copy(m,g){return super.copy(m,g),this.left=m.left,this.right=m.right,this.top=m.top,this.bottom=m.bottom,this.near=m.near,this.far=m.far,this.zoom=m.zoom,this.view=m.view===null?null:Object.assign({},m.view),this}setViewOffset(m,g,_,x,y,v){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=m,this.view.fullHeight=g,this.view.offsetX=_,this.view.offsetY=x,this.view.width=y,this.view.height=v,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let m=(this.right-this.left)/(2*this.zoom),g=(this.top-this.bottom)/(2*this.zoom),_=(this.right+this.left)/2,x=(this.top+this.bottom)/2,y=_-m,v=_+m,b=x+g,S=x-g;if(this.view!==null&&this.view.enabled){let M=(this.right-this.left)/this.view.fullWidth/this.zoom,w=(this.top-this.bottom)/this.view.fullHeight/this.zoom;y+=M*this.view.offsetX,v=y+M*this.view.width,b-=w*this.view.offsetY,S=b-w*this.view.height}this.projectionMatrix.makeOrthographic(y,v,b,S,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(m){let g=super.toJSON(m);if(g.object.zoom=this.zoom,g.object.left=this.left,g.object.right=this.right,g.object.top=this.top,g.object.bottom=this.bottom,g.object.near=this.near,g.object.far=this.far,this.view!==null)g.object.view=Object.assign({},this.view);return g}}class Fp extends ju{constructor(){super(new Ha(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class Ga extends ka{constructor(m,g){super(m,g);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(nn.DEFAULT_UP),this.updateMatrix(),this.target=new nn,this.shadow=new Fp}dispose(){super.dispose(),this.shadow.dispose()}copy(m){return super.copy(m),this.target=m.target.clone(),this.shadow=m.shadow.clone(),this}toJSON(m){let g=super.toJSON(m);return g.object.shadow=this.shadow.toJSON(),g.object.target=this.target.uuid,g}}class Va extends ka{constructor(m,g){super(m,g);this.isAmbientLight=!0,this.type="AmbientLight"}}var Zs=-90,Js=1;class fo extends nn{constructor(m,g,_){super();this.type="CubeCamera",this.renderTarget=_,this.coordinateSystem=null,this.activeMipmapLevel=0;let x=new On(Zs,Js,m,g);x.layers=this.layers,this.add(x);let y=new On(Zs,Js,m,g);y.layers=this.layers,this.add(y);let v=new On(Zs,Js,m,g);v.layers=this.layers,this.add(v);let b=new On(Zs,Js,m,g);b.layers=this.layers,this.add(b);let S=new On(Zs,Js,m,g);S.layers=this.layers,this.add(S);let M=new On(Zs,Js,m,g);M.layers=this.layers,this.add(M)}updateCoordinateSystem(){let m=this.coordinateSystem,g=this.children.concat(),[_,x,y,v,b,S]=g;for(let M of g)this.remove(M);if(m===2000)_.up.set(0,1,0),_.lookAt(1,0,0),x.up.set(0,1,0),x.lookAt(-1,0,0),y.up.set(0,0,-1),y.lookAt(0,1,0),v.up.set(0,0,1),v.lookAt(0,-1,0),b.up.set(0,1,0),b.lookAt(0,0,1),S.up.set(0,1,0),S.lookAt(0,0,-1);else if(m===2001)_.up.set(0,-1,0),_.lookAt(-1,0,0),x.up.set(0,-1,0),x.lookAt(1,0,0),y.up.set(0,0,1),y.lookAt(0,1,0),v.up.set(0,0,-1),v.lookAt(0,-1,0),b.up.set(0,-1,0),b.lookAt(0,0,1),S.up.set(0,-1,0),S.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+m);for(let M of g)this.add(M),M.updateMatrixWorld()}update(m,g){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:_,activeMipmapLevel:x}=this;if(this.coordinateSystem!==m.coordinateSystem)this.coordinateSystem=m.coordinateSystem,this.updateCoordinateSystem();let[y,v,b,S,M,w]=this.children,E=m.getRenderTarget(),A=m.getActiveCubeFace(),T=m.getActiveMipmapLevel(),R=m.xr.enabled;m.xr.enabled=!1;let P=_.texture.mipmapsAutoUpdate;_.texture.mipmapsAutoUpdate=!1;let N=!1;if(m.isWebGLRenderer===!0)N=m.state.buffers.depth.getReversed();else N=m.reversedDepthBuffer;if(m.setRenderTarget(_,0,x),N&&m.autoClear===!1)m.clearDepth();if(m.render(g,y),m.setRenderTarget(_,1,x),N&&m.autoClear===!1)m.clearDepth();if(m.render(g,v),m.setRenderTarget(_,2,x),N&&m.autoClear===!1)m.clearDepth();if(m.render(g,b),m.setRenderTarget(_,3,x),N&&m.autoClear===!1)m.clearDepth();if(m.render(g,S),m.setRenderTarget(_,4,x),N&&m.autoClear===!1)m.clearDepth();if(m.render(g,M),_.texture.mipmapsAutoUpdate=P,m.setRenderTarget(_,5,x),N&&m.autoClear===!1)m.clearDepth();m.render(g,w),m.setRenderTarget(E,A,T),m.xr.enabled=R,_.texture.needsPMREMUpdate=!0}}class Qu extends On{constructor(m=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=m,this.perCameraFrustumCulled=!1}}var eh="\\[\\]\\.:\\/",I_=new RegExp("["+eh+"]","g"),th="[^"+eh+"]",L_="[^"+eh.replace("\\.","")+"]",N_=/((?:WC+[\/:])*)/.source.replace("WC",th),D_=/(WCOD+)?/.source.replace("WCOD",L_),O_=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",th),U_=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",th),F_=new RegExp("^"+N_+D_+O_+U_+"$"),B_=["material","materials","bones","map"];class Bp{constructor(m,g,_){let x=_||At.parseTrackName(g);this._targetGroup=m,this._bindings=m.subscribe_(g,x)}getValue(m,g){this.bind();let _=this._targetGroup.nCachedObjects_,x=this._bindings[_];if(x!==void 0)x.getValue(m,g)}setValue(m,g){let _=this._bindings;for(let x=this._targetGroup.nCachedObjects_,y=_.length;x!==y;++x)_[x].setValue(m,g)}bind(){let m=this._bindings;for(let g=this._targetGroup.nCachedObjects_,_=m.length;g!==_;++g)m[g].bind()}unbind(){let m=this._bindings;for(let g=this._targetGroup.nCachedObjects_,_=m.length;g!==_;++g)m[g].unbind()}}class At{constructor(m,g,_){this.path=g,this.parsedPath=_||At.parseTrackName(g),this.node=At.findNode(m,this.parsedPath.nodeName),this.rootNode=m,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(m,g,_){if(!(m&&m.isAnimationObjectGroup))return new At(m,g,_);else return new At.Composite(m,g,_)}static sanitizeNodeName(m){return m.replace(/\s/g,"_").replace(I_,"")}static parseTrackName(m){let g=F_.exec(m);if(g===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+m);let _={nodeName:g[2],objectName:g[3],objectIndex:g[4],propertyName:g[5],propertyIndex:g[6]},x=_.nodeName&&_.nodeName.lastIndexOf(".");if(x!==void 0&&x!==-1){let y=_.nodeName.substring(x+1);if(B_.indexOf(y)!==-1)_.nodeName=_.nodeName.substring(0,x),_.objectName=y}if(_.propertyName===null||_.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+m);return _}static findNode(m,g){if(g===void 0||g===""||g==="."||g===-1||g===m.name||g===m.uuid)return m;if(m.skeleton){let _=m.skeleton.getBoneByName(g);if(_!==void 0)return _}if(m.children){let _=function(y){for(let v=0;v<y.length;v++){let b=y[v];if(b.name===g||b.uuid===g)return b;let S=_(b.children);if(S)return S}return null},x=_(m.children);if(x)return x}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(m,g){m[g]=this.targetObject[this.propertyName]}_getValue_array(m,g){let _=this.resolvedProperty;for(let x=0,y=_.length;x!==y;++x)m[g++]=_[x]}_getValue_arrayElement(m,g){m[g]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(m,g){this.resolvedProperty.toArray(m,g)}_setValue_direct(m,g){this.targetObject[this.propertyName]=m[g]}_setValue_direct_setNeedsUpdate(m,g){this.targetObject[this.propertyName]=m[g],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(m,g){this.targetObject[this.propertyName]=m[g],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(m,g){let _=this.resolvedProperty;for(let x=0,y=_.length;x!==y;++x)_[x]=m[g++]}_setValue_array_setNeedsUpdate(m,g){let _=this.resolvedProperty;for(let x=0,y=_.length;x!==y;++x)_[x]=m[g++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(m,g){let _=this.resolvedProperty;for(let x=0,y=_.length;x!==y;++x)_[x]=m[g++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(m,g){this.resolvedProperty[this.propertyIndex]=m[g]}_setValue_arrayElement_setNeedsUpdate(m,g){this.resolvedProperty[this.propertyIndex]=m[g],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(m,g){this.resolvedProperty[this.propertyIndex]=m[g],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(m,g){this.resolvedProperty.fromArray(m,g)}_setValue_fromArray_setNeedsUpdate(m,g){this.resolvedProperty.fromArray(m,g),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(m,g){this.resolvedProperty.fromArray(m,g),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(m,g){this.bind(),this.getValue(m,g)}_setValue_unbound(m,g){this.bind(),this.setValue(m,g)}bind(){let m=this.node,g=this.parsedPath,{objectName:_,propertyName:x,propertyIndex:y}=g;if(!m)m=At.findNode(this.rootNode,g.nodeName),this.node=m;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!m){qe("PropertyBinding: No target node found for track: "+this.path+".");return}if(_){let M=g.objectIndex;switch(_){case"materials":if(!m.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!m.material.materials){Je("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}m=m.material.materials;break;case"bones":if(!m.skeleton){Je("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}m=m.skeleton.bones;for(let w=0;w<m.length;w++)if(m[w].name===M){M=w;break}break;case"map":if("map"in m){m=m.map;break}if(!m.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!m.material.map){Je("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}m=m.material.map;break;default:if(m[_]===void 0){Je("PropertyBinding: Can not bind to objectName of node undefined.",this);return}m=m[_]}if(M!==void 0){if(m[M]===void 0){Je("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,m);return}m=m[M]}}let v=m[x];if(v===void 0){let M=g.nodeName;Je("PropertyBinding: Trying to update property for track: "+M+"."+x+" but it wasn't found.",m);return}let b=this.Versioning.None;if(this.targetObject=m,m.isMaterial===!0)b=this.Versioning.NeedsUpdate;else if(m.isObject3D===!0)b=this.Versioning.MatrixWorldNeedsUpdate;let S=this.BindingType.Direct;if(y!==void 0){if(x==="morphTargetInfluences"){if(!m.geometry){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!m.geometry.morphAttributes){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(m.morphTargetDictionary[y]!==void 0)y=m.morphTargetDictionary[y]}S=this.BindingType.ArrayElement,this.resolvedProperty=v,this.propertyIndex=y}else if(v.fromArray!==void 0&&v.toArray!==void 0)S=this.BindingType.HasFromToArray,this.resolvedProperty=v;else if(Array.isArray(v))S=this.BindingType.EntireArray,this.resolvedProperty=v;else this.propertyName=x;this.getValue=this.GetterByBindingType[S],this.setValue=this.SetterByBindingTypeAndVersioning[S][b]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}At.Composite=Bp;At.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};At.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};At.prototype.GetterByBindingType=[At.prototype._getValue_direct,At.prototype._getValue_array,At.prototype._getValue_arrayElement,At.prototype._getValue_toArray];At.prototype.SetterByBindingTypeAndVersioning=[[At.prototype._setValue_direct,At.prototype._setValue_direct_setNeedsUpdate,At.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[At.prototype._setValue_array,At.prototype._setValue_array_setNeedsUpdate,At.prototype._setValue_array_setMatrixWorldNeedsUpdate],[At.prototype._setValue_arrayElement,At.prototype._setValue_arrayElement_setNeedsUpdate,At.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[At.prototype._setValue_fromArray,At.prototype._setValue_fromArray_setNeedsUpdate,At.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var DE=new Float32Array(1);var Pf=new Qe;class po{constructor(m,g,_=0,x=1/0){this.ray=new Qi(m,g),this.near=_,this.far=x,this.camera=null,this.layers=new ro,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(m,g){this.ray.set(m,g)}setFromCamera(m,g){if(g.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(g.matrixWorld),this.ray.direction.set(m.x,m.y,0.5).unproject(g).sub(this.ray.origin).normalize(),this.camera=g;else if(g.isOrthographicCamera)this.ray.origin.set(m.x,m.y,g.projectionMatrix.elements[14]).unproject(g),this.ray.direction.set(0,0,-1).transformDirection(g.matrixWorld),this.camera=g;else Je("Raycaster: Unsupported camera type: "+g.type)}setFromXRController(m){return Pf.identity().extractRotation(m.matrixWorld),this.ray.origin.setFromMatrixPosition(m.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Pf),this}intersectObject(m,g=!0,_=[]){return Ic(m,this,_,g),_.sort(If),_}intersectObjects(m,g=!0,_=[]){for(let x=0,y=m.length;x<y;x++)Ic(m[x],this,_,g);return _.sort(If),_}}function If(m,g){return m.distance-g.distance}function Ic(m,g,_,x){let y=!0;if(m.layers.test(g.layers)){if(m.raycast(g,_)===!1)y=!1}if(y===!0&&x===!0){let v=m.children;for(let b=0,S=v.length;b<S;b++)Ic(v[b],g,_,!0)}}class Wa{constructor(m=1,g=0,_=0){this.radius=m,this.phi=g,this.theta=_}set(m,g,_){return this.radius=m,this.phi=g,this.theta=_,this}copy(m){return this.radius=m.radius,this.phi=m.phi,this.theta=m.theta,this}makeSafe(){return this.phi=it(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(m){return this.setFromCartesianCoords(m.x,m.y,m.z)}setFromCartesianCoords(m,g,_){if(this.radius=Math.sqrt(m*m+g*g+_*_),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(m,_),this.phi=Math.acos(it(g/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class kp{static{this.prototype.isMatrix2=!0}constructor(m,g,_,x){if(this.elements=[1,0,0,1],m!==void 0)this.set(m,g,_,x)}identity(){return this.set(1,0,0,1),this}fromArray(m,g=0){for(let _=0;_<4;_++)this.elements[_]=m[_+g];return this}set(m,g,_,x){let y=this.elements;return y[0]=m,y[2]=g,y[1]=_,y[3]=x,this}}var Lf=new Z,pa=new Z,Ks=new Z,js=new Z,Rc=new Z,k_=new Z,z_=new Z;class Un{constructor(m=new Z,g=new Z){this.start=m,this.end=g}set(m,g){return this.start.copy(m),this.end.copy(g),this}copy(m){return this.start.copy(m.start),this.end.copy(m.end),this}getCenter(m){return m.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(m){return m.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(m,g){return this.delta(g).multiplyScalar(m).add(this.start)}closestPointToPointParameter(m,g){Lf.subVectors(m,this.start),pa.subVectors(this.end,this.start);let _=pa.dot(pa);if(_===0)return 0;let y=pa.dot(Lf)/_;if(g)y=it(y,0,1);return y}closestPointToPoint(m,g,_){let x=this.closestPointToPointParameter(m,g);return this.delta(_).multiplyScalar(x).add(this.start)}distanceSqToLine3(m,g=k_,_=z_){let y,v,b=this.start,S=m.start,M=this.end,w=m.end;Ks.subVectors(M,b),js.subVectors(w,S),Rc.subVectors(b,S);let E=Ks.dot(Ks),A=js.dot(js),T=js.dot(Rc);if(E<=0.00000000000000010000000000000001&&A<=0.00000000000000010000000000000001)return g.copy(b),_.copy(S),g.distanceToSquared(_);if(E<=0.00000000000000010000000000000001)y=0,v=T/A,v=it(v,0,1);else{let R=Ks.dot(Rc);if(A<=0.00000000000000010000000000000001)v=0,y=it(-R/E,0,1);else{let P=Ks.dot(js),N=E*A-P*P;if(N!==0)y=it((P*T-R*A)/N,0,1);else y=0;if(v=(P*y+T)/A,v<0)v=0,y=it(-R/E,0,1);else if(v>1)v=1,y=it((P-R)/E,0,1)}}return g.copy(b).addScaledVector(Ks,y),_.copy(S).addScaledVector(js,v),g.distanceToSquared(_)}applyMatrix4(m){return this.start.applyMatrix4(m),this.end.applyMatrix4(m),this}equals(m){return m.start.equals(this.start)&&m.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class Xa extends Oi{constructor(m,g=16776960){let _=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),x=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],y=new sn;y.setIndex(new Qt(_,1)),y.setAttribute("position",new gn(x,3));super(y,new es({color:g,toneMapped:!1}));this.box=m,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(m){let g=this.box;if(g.isEmpty())return;g.getCenter(this.position),g.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(m)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function nh(m,g,_,x){let y=H_(x);switch(_){case 1021:return m*g;case 1028:return m*g/y.components*y.byteLength;case 1029:return m*g/y.components*y.byteLength;case 1030:return m*g*2/y.components*y.byteLength;case 1031:return m*g*2/y.components*y.byteLength;case 1022:return m*g*3/y.components*y.byteLength;case 1023:return m*g*4/y.components*y.byteLength;case 1033:return m*g*4/y.components*y.byteLength;case 33776:case 33777:return Math.floor((m+3)/4)*Math.floor((g+3)/4)*8;case 33778:case 33779:return Math.floor((m+3)/4)*Math.floor((g+3)/4)*16;case 35841:case 35843:return Math.max(m,16)*Math.max(g,8)/4;case 35840:case 35842:return Math.max(m,8)*Math.max(g,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((m+3)/4)*Math.floor((g+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((m+3)/4)*Math.floor((g+3)/4)*16;case 37808:return Math.floor((m+3)/4)*Math.floor((g+3)/4)*16;case 37809:return Math.floor((m+4)/5)*Math.floor((g+3)/4)*16;case 37810:return Math.floor((m+4)/5)*Math.floor((g+4)/5)*16;case 37811:return Math.floor((m+5)/6)*Math.floor((g+4)/5)*16;case 37812:return Math.floor((m+5)/6)*Math.floor((g+5)/6)*16;case 37813:return Math.floor((m+7)/8)*Math.floor((g+4)/5)*16;case 37814:return Math.floor((m+7)/8)*Math.floor((g+5)/6)*16;case 37815:return Math.floor((m+7)/8)*Math.floor((g+7)/8)*16;case 37816:return Math.floor((m+9)/10)*Math.floor((g+4)/5)*16;case 37817:return Math.floor((m+9)/10)*Math.floor((g+5)/6)*16;case 37818:return Math.floor((m+9)/10)*Math.floor((g+7)/8)*16;case 37819:return Math.floor((m+9)/10)*Math.floor((g+9)/10)*16;case 37820:return Math.floor((m+11)/12)*Math.floor((g+9)/10)*16;case 37821:return Math.floor((m+11)/12)*Math.floor((g+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(m/4)*Math.ceil(g/4)*16;case 36283:case 36284:return Math.ceil(m/4)*Math.ceil(g/4)*8;case 36285:case 36286:return Math.ceil(m/4)*Math.ceil(g/4)*16}throw Error(`Unable to determine texture byte length for ${_} format.`)}function H_(m){switch(m){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${m}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)qe("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function am(){let m=null,g=!1,_=null,x=null;function y(v,b){x=m.requestAnimationFrame(y),_(v,b)}return{start:function(){if(g===!0)return;if(_===null)return;if(m===null)return;x=m.requestAnimationFrame(y),g=!0},stop:function(){if(m!==null)m.cancelAnimationFrame(x);g=!1},setAnimationLoop:function(v){_=v},setContext:function(v){m=v}}}function G_(m){let g=new WeakMap;function _(S,M){let{array:w,usage:E}=S,A=w.byteLength,T=m.createBuffer();m.bindBuffer(M,T),m.bufferData(M,w,E),S.onUploadCallback();let R;if(w instanceof Float32Array)R=m.FLOAT;else if(typeof Float16Array<"u"&&w instanceof Float16Array)R=m.HALF_FLOAT;else if(w instanceof Uint16Array)if(S.isFloat16BufferAttribute)R=m.HALF_FLOAT;else R=m.UNSIGNED_SHORT;else if(w instanceof Int16Array)R=m.SHORT;else if(w instanceof Uint32Array)R=m.UNSIGNED_INT;else if(w instanceof Int32Array)R=m.INT;else if(w instanceof Int8Array)R=m.BYTE;else if(w instanceof Uint8Array)R=m.UNSIGNED_BYTE;else if(w instanceof Uint8ClampedArray)R=m.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+w);return{buffer:T,type:R,bytesPerElement:w.BYTES_PER_ELEMENT,version:S.version,size:A}}function x(S,M,w){let{array:E,updateRanges:A}=M;if(m.bindBuffer(w,S),A.length===0)m.bufferSubData(w,0,E);else{A.sort((R,P)=>R.start-P.start);let T=0;for(let R=1;R<A.length;R++){let P=A[T],N=A[R];if(N.start<=P.start+P.count+1)P.count=Math.max(P.count,N.start+N.count-P.start);else++T,A[T]=N}A.length=T+1;for(let R=0,P=A.length;R<P;R++){let N=A[R];m.bufferSubData(w,N.start*E.BYTES_PER_ELEMENT,E,N.start,N.count)}M.clearUpdateRanges()}M.onUploadCallback()}function y(S){if(S.isInterleavedBufferAttribute)S=S.data;return g.get(S)}function v(S){if(S.isInterleavedBufferAttribute)S=S.data;let M=g.get(S);if(M)m.deleteBuffer(M.buffer),g.delete(S)}function b(S,M){if(S.isInterleavedBufferAttribute)S=S.data;if(S.isGLBufferAttribute){let E=g.get(S);if(!E||E.version<S.version)g.set(S,{buffer:S.buffer,type:S.type,bytesPerElement:S.elementSize,version:S.version});return}let w=g.get(S);if(w===void 0)g.set(S,_(S,M));else if(w.version<S.version){if(w.size!==S.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");x(w.buffer,S,M),w.version=S.version}}return{get:y,remove:v,update:b}}var V_=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,W_=`#ifdef USE_ALPHAHASH
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
#endif`,X_=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,q_=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Y_=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$_=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Z_=`#ifdef USE_AOMAP
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
#endif`,J_=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,K_=`#ifdef USE_BATCHING
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
#endif`,j_=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Q_=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ex=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,tx=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,nx=`#ifdef USE_IRIDESCENCE
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
#endif`,ix=`#ifdef USE_BUMPMAP
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
#endif`,sx=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,rx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ox=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ax=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,lx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,cx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ux=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,hx=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,dx=`#define PI 3.141592653589793
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
} // validated`,fx=`vec3 transformedNormal = objectNormal;
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
#endif`,px=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,mx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,gx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_x=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xx="gl_FragColor = linearToOutputTexel( gl_FragColor );",yx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,vx=`#ifdef USE_ENVMAP
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
#endif`,bx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Sx=`#ifdef USE_ENVMAP
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
#endif`,Mx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wx=`#ifdef USE_ENVMAP
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
#endif`,Ex=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Tx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ax=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Rx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cx=`#ifdef USE_GRADIENTMAP
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
}`,Px=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ix=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Lx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Nx=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Dx=`#ifdef USE_ENVMAP
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
#endif`,Ox=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ux=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fx=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Bx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kx=`PhysicalMaterial material;
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
#endif`,zx=`uniform sampler2D dfgLUT;
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
}`,Hx=`
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
#endif`,Gx=`#if defined( RE_IndirectDiffuse )
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
#endif`,Vx=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Wx=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,Xx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,qx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$x=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Jx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Kx=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,jx=`#if defined( USE_POINTS_UV )
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
#endif`,Qx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ey=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ty=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ny=`#if defined( USE_MORPHCOLORS )
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
#endif`,iy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sy=`#ifdef USE_MORPHTARGETS
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
#endif`,ry=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,oy=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,ay=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,ly=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,uy=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,hy=`#ifdef USE_NORMALMAP
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
#endif`,dy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,fy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,py=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,my=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,gy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,_y=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,xy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,yy=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,by=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Sy=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,My=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,wy=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ey=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ty=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ay=`float getShadowMask() {
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
}`,Ry=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Cy=`#ifdef USE_SKINNING
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
#endif`,Py=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Iy=`#ifdef USE_SKINNING
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
#endif`,Ly=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ny=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Dy=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Oy=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Uy=`#ifdef USE_TRANSMISSION
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
#endif`,Fy=`#ifdef USE_TRANSMISSION
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
#endif`,By=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ky=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var Hy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Gy=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Vy=`uniform sampler2D t2D;
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
}`,Wy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Xy=`uniform float backgroundBlurriness;
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
}`,qy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Yy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$y=`#include <common>
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
}`,Zy=`#if DEPTH_PACKING == 3200
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
}`,Jy=`#define DISTANCE
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
}`,Ky=`#define DISTANCE
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
}`,jy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Qy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ev=`uniform float scale;
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
}`,tv=`uniform vec3 diffuse;
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
}`,nv=`#include <common>
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
}`,iv=`uniform vec3 diffuse;
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
}`,sv=`#define LAMBERT
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
}`,rv=`#define LAMBERT
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
}`,ov=`#define MATCAP
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
}`,av=`#define MATCAP
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
}`,lv=`#define NORMAL
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
}`,cv=`#define NORMAL
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
}`,uv=`#define PHONG
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
}`,hv=`#define PHONG
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
}`,dv=`#define STANDARD
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
}`,fv=`#define STANDARD
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
}`,pv=`#define TOON
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
}`,mv=`#define TOON
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
}`,gv=`uniform float size;
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
}`,_v=`uniform vec3 diffuse;
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
}`,xv=`#include <common>
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
}`,yv=`uniform vec3 color;
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
}`,vv=`uniform float rotation;
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
}`,bv=`uniform vec3 diffuse;
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
}`,lt={alphahash_fragment:V_,alphahash_pars_fragment:W_,alphamap_fragment:X_,alphamap_pars_fragment:q_,alphatest_fragment:Y_,alphatest_pars_fragment:$_,aomap_fragment:Z_,aomap_pars_fragment:J_,batching_pars_vertex:K_,batching_vertex:j_,begin_vertex:Q_,beginnormal_vertex:ex,bsdfs:tx,iridescence_fragment:nx,bumpmap_pars_fragment:ix,clipping_planes_fragment:sx,clipping_planes_pars_fragment:rx,clipping_planes_pars_vertex:ox,clipping_planes_vertex:ax,color_fragment:lx,color_pars_fragment:cx,color_pars_vertex:ux,color_vertex:hx,common:dx,defaultnormal_vertex:fx,displacementmap_pars_vertex:px,displacementmap_vertex:mx,emissivemap_fragment:gx,emissivemap_pars_fragment:_x,colorspace_fragment:xx,colorspace_pars_fragment:yx,envmap_fragment:vx,envmap_common_pars_fragment:bx,envmap_pars_fragment:Sx,envmap_pars_vertex:Mx,envmap_physical_pars_fragment:Dx,envmap_vertex:wx,fog_vertex:Ex,fog_pars_vertex:Tx,fog_fragment:Ax,fog_pars_fragment:Rx,gradientmap_pars_fragment:Cx,lightmap_pars_fragment:Px,lights_lambert_fragment:Ix,lights_lambert_pars_fragment:Lx,lights_pars_begin:Nx,lights_toon_fragment:Ox,lights_toon_pars_fragment:Ux,lights_phong_fragment:Fx,lights_phong_pars_fragment:Bx,lights_physical_fragment:kx,lights_physical_pars_fragment:zx,lights_fragment_begin:Hx,lights_fragment_maps:Gx,lights_fragment_end:Vx,lightprobes_pars_fragment:Wx,logdepthbuf_fragment:Xx,logdepthbuf_pars_fragment:qx,logdepthbuf_pars_vertex:Yx,logdepthbuf_vertex:$x,map_fragment:Zx,map_pars_fragment:Jx,map_particle_fragment:Kx,map_particle_pars_fragment:jx,metalnessmap_fragment:Qx,metalnessmap_pars_fragment:ey,morphinstance_vertex:ty,morphcolor_vertex:ny,morphnormal_vertex:iy,morphtarget_pars_vertex:sy,morphtarget_vertex:ry,normal_fragment_begin:oy,normal_fragment_maps:ay,normal_pars_fragment:ly,normal_pars_vertex:cy,normal_vertex:uy,normalmap_pars_fragment:hy,clearcoat_normal_fragment_begin:dy,clearcoat_normal_fragment_maps:fy,clearcoat_pars_fragment:py,iridescence_pars_fragment:my,opaque_fragment:gy,packing:_y,premultiplied_alpha_fragment:xy,project_vertex:yy,dithering_fragment:vy,dithering_pars_fragment:by,roughnessmap_fragment:Sy,roughnessmap_pars_fragment:My,shadowmap_pars_fragment:wy,shadowmap_pars_vertex:Ey,shadowmap_vertex:Ty,shadowmask_pars_fragment:Ay,skinbase_vertex:Ry,skinning_pars_vertex:Cy,skinning_vertex:Py,skinnormal_vertex:Iy,specularmap_fragment:Ly,specularmap_pars_fragment:Ny,tonemapping_fragment:Dy,tonemapping_pars_fragment:Oy,transmission_fragment:Uy,transmission_pars_fragment:Fy,uv_pars_fragment:By,uv_pars_vertex:ky,uv_vertex:zy,worldpos_vertex:Hy,background_vert:Gy,background_frag:Vy,backgroundCube_vert:Wy,backgroundCube_frag:Xy,cube_vert:qy,cube_frag:Yy,depth_vert:$y,depth_frag:Zy,distance_vert:Jy,distance_frag:Ky,equirect_vert:jy,equirect_frag:Qy,linedashed_vert:ev,linedashed_frag:tv,meshbasic_vert:nv,meshbasic_frag:iv,meshlambert_vert:sv,meshlambert_frag:rv,meshmatcap_vert:ov,meshmatcap_frag:av,meshnormal_vert:lv,meshnormal_frag:cv,meshphong_vert:uv,meshphong_frag:hv,meshphysical_vert:dv,meshphysical_frag:fv,meshtoon_vert:pv,meshtoon_frag:mv,points_vert:gv,points_frag:_v,shadow_vert:xv,shadow_frag:yv,sprite_vert:vv,sprite_frag:bv},Le={common:{diffuse:{value:new st(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new et}},envmap:{envMap:{value:null},envMapRotation:{value:new et},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new et}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new et}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new et},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new et},normalScale:{value:new $e(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new et},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new et}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new et}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new et}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new st(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new st(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0},uvTransform:{value:new et}},sprite:{diffuse:{value:new st(16777215)},opacity:{value:1},center:{value:new $e(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new et},alphaMap:{value:null},alphaMapTransform:{value:new et},alphaTest:{value:0}}},pi={basic:{uniforms:En([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:En([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new st(0)},envMapIntensity:{value:1}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:En([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new st(0)},specular:{value:new st(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:En([Le.common,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.roughnessmap,Le.metalnessmap,Le.fog,Le.lights,{emissive:{value:new st(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:En([Le.common,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.gradientmap,Le.fog,Le.lights,{emissive:{value:new st(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:En([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:En([Le.points,Le.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:En([Le.common,Le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:En([Le.common,Le.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:En([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:En([Le.sprite,Le.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new et},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new et}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distance:{uniforms:En([Le.common,Le.displacementmap,{referencePosition:{value:new Z},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:lt.distance_vert,fragmentShader:lt.distance_frag},shadow:{uniforms:En([Le.lights,Le.fog,{color:{value:new st(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};pi.physical={uniforms:En([pi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new et},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new et},clearcoatNormalScale:{value:new $e(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new et},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new et},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new et},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new et},sheen:{value:0},sheenColor:{value:new st(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new et},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new et},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new et},transmissionSamplerSize:{value:new $e},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new et},attenuationDistance:{value:0},attenuationColor:{value:new st(0)},specularColor:{value:new st(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new et},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new et},anisotropyVector:{value:new $e},anisotropyMap:{value:null},anisotropyMapTransform:{value:new et}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};var qa={r:0,b:0,g:0},Sv=new Qe,lm=new et;lm.set(-1,0,0,0,1,0,0,0,1);function Mv(m,g,_,x,y,v){let b=new st(0),S=y===!0?0:1,M,w,E=null,A=0,T=null;function R(L){let U=L.isScene===!0?L.background:null;if(U&&U.isTexture){let O=L.backgroundBlurriness>0;U=g.get(U,O)}return U}function P(L){let U=!1,O=R(L);if(O===null)C(b,S);else if(O&&O.isColor)C(O,1),U=!0;let F=m.xr.getEnvironmentBlendMode();if(F==="additive")_.buffers.color.setClear(0,0,0,1,v);else if(F==="alpha-blend")_.buffers.color.setClear(0,0,0,0,v);if(m.autoClear||U)_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),m.clear(m.autoClearColor,m.autoClearDepth,m.autoClearStencil)}function N(L,U){let O=R(U);if(O&&O.isCubeTexture){if(w===void 0)w=new Xt(new hr(1,1,1),new Ui({name:"BackgroundCubeMaterial",uniforms:Ts(pi.backgroundCube.uniforms),vertexShader:pi.backgroundCube.vertexShader,fragmentShader:pi.backgroundCube.fragmentShader,side:Mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),w.geometry.deleteAttribute("normal"),w.geometry.deleteAttribute("uv"),w.onBeforeRender=function(F,k,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(w.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),x.update(w);if(w.material.uniforms.envMap.value=O,w.material.uniforms.backgroundBlurriness.value=U.backgroundBlurriness,w.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,w.material.uniforms.backgroundRotation.value.setFromMatrix4(Sv.makeRotationFromEuler(U.backgroundRotation)).transpose(),O.isRenderTargetTexture===!1)w.material.uniforms.backgroundRotation.value.premultiply(lm);if(w.material.toneMapped=ut.getTransfer(O.colorSpace)!==Nt,E!==O||A!==O.version||T!==m.toneMapping)w.material.needsUpdate=!0,E=O,A=O.version,T=m.toneMapping;w.layers.enableAll(),L.unshift(w,w.geometry,w.material,0,0,null)}else if(O&&O.isTexture){if(M===void 0)M=new Xt(new uo(2,2),new Ui({name:"BackgroundMaterial",uniforms:Ts(pi.background.uniforms),vertexShader:pi.background.vertexShader,fragmentShader:pi.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),M.geometry.deleteAttribute("normal"),Object.defineProperty(M.material,"map",{get:function(){return this.uniforms.t2D.value}}),x.update(M);if(M.material.uniforms.t2D.value=O,M.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,M.material.toneMapped=ut.getTransfer(O.colorSpace)!==Nt,O.matrixAutoUpdate===!0)O.updateMatrix();if(M.material.uniforms.uvTransform.value.copy(O.matrix),E!==O||A!==O.version||T!==m.toneMapping)M.material.needsUpdate=!0,E=O,A=O.version,T=m.toneMapping;M.layers.enableAll(),L.unshift(M,M.geometry,M.material,0,0,null)}}function C(L,U){L.getRGB(qa,Bu(m)),_.buffers.color.setClear(qa.r,qa.g,qa.b,U,v)}function I(){if(w!==void 0)w.geometry.dispose(),w.material.dispose(),w=void 0;if(M!==void 0)M.geometry.dispose(),M.material.dispose(),M=void 0}return{getClearColor:function(){return b},setClearColor:function(L,U=1){b.set(L),S=U,C(b,S)},getClearAlpha:function(){return S},setClearAlpha:function(L){S=L,C(b,S)},render:P,addToRenderList:N,dispose:I}}function wv(m,g){let _=m.getParameter(m.MAX_VERTEX_ATTRIBS),x={},y=T(null),v=y,b=!1;function S(V,Y,ee,X,ie){let le=!1,te=A(V,X,ee,Y);if(v!==te)v=te,w(v.object);if(le=R(V,X,ee,ie),le)P(V,X,ee,ie);if(ie!==null)g.update(ie,m.ELEMENT_ARRAY_BUFFER);if(le||b){if(b=!1,O(V,Y,ee,X),ie!==null)m.bindBuffer(m.ELEMENT_ARRAY_BUFFER,g.get(ie).buffer)}}function M(){return m.createVertexArray()}function w(V){return m.bindVertexArray(V)}function E(V){return m.deleteVertexArray(V)}function A(V,Y,ee,X){let ie=X.wireframe===!0,le=x[Y.id];if(le===void 0)le={},x[Y.id]=le;let te=V.isInstancedMesh===!0?V.id:0,ve=le[te];if(ve===void 0)ve={},le[te]=ve;let J=ve[ee.id];if(J===void 0)J={},ve[ee.id]=J;let ae=J[ie];if(ae===void 0)ae=T(M()),J[ie]=ae;return ae}function T(V){let Y=[],ee=[],X=[];for(let ie=0;ie<_;ie++)Y[ie]=0,ee[ie]=0,X[ie]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:Y,enabledAttributes:ee,attributeDivisors:X,object:V,attributes:{},index:null}}function R(V,Y,ee,X){let ie=v.attributes,le=Y.attributes,te=0,ve=ee.getAttributes();for(let J in ve)if(ve[J].location>=0){let ge=ie[J],Te=le[J];if(Te===void 0){if(J==="instanceMatrix"&&V.instanceMatrix)Te=V.instanceMatrix;if(J==="instanceColor"&&V.instanceColor)Te=V.instanceColor}if(ge===void 0)return!0;if(ge.attribute!==Te)return!0;if(Te&&ge.data!==Te.data)return!0;te++}if(v.attributesNum!==te)return!0;if(v.index!==X)return!0;return!1}function P(V,Y,ee,X){let ie={},le=Y.attributes,te=0,ve=ee.getAttributes();for(let J in ve)if(ve[J].location>=0){let ge=le[J];if(ge===void 0){if(J==="instanceMatrix"&&V.instanceMatrix)ge=V.instanceMatrix;if(J==="instanceColor"&&V.instanceColor)ge=V.instanceColor}let Te={};if(Te.attribute=ge,ge&&ge.data)Te.data=ge.data;ie[J]=Te,te++}v.attributes=ie,v.attributesNum=te,v.index=X}function N(){let V=v.newAttributes;for(let Y=0,ee=V.length;Y<ee;Y++)V[Y]=0}function C(V){I(V,0)}function I(V,Y){let ee=v.newAttributes,X=v.enabledAttributes,ie=v.attributeDivisors;if(ee[V]=1,X[V]===0)m.enableVertexAttribArray(V),X[V]=1;if(ie[V]!==Y)m.vertexAttribDivisor(V,Y),ie[V]=Y}function L(){let V=v.newAttributes,Y=v.enabledAttributes;for(let ee=0,X=Y.length;ee<X;ee++)if(Y[ee]!==V[ee])m.disableVertexAttribArray(ee),Y[ee]=0}function U(V,Y,ee,X,ie,le,te){if(te===!0)m.vertexAttribIPointer(V,Y,ee,ie,le);else m.vertexAttribPointer(V,Y,ee,X,ie,le)}function O(V,Y,ee,X){N();let ie=X.attributes,le=ee.getAttributes(),te=Y.defaultAttributeValues;for(let ve in le){let J=le[ve];if(J.location>=0){let ae=ie[ve];if(ae===void 0){if(ve==="instanceMatrix"&&V.instanceMatrix)ae=V.instanceMatrix;if(ve==="instanceColor"&&V.instanceColor)ae=V.instanceColor}if(ae!==void 0){let ge=ae.normalized,Te=ae.itemSize,ce=g.get(ae);if(ce===void 0)continue;let{buffer:ye,type:Ie,bytesPerElement:xe}=ce,Ue=Ie===m.INT||Ie===m.UNSIGNED_INT||ae.gpuType===Wc;if(ae.isInterleavedBufferAttribute){let Ce=ae.data,rt=Ce.isInterleavedBuffer===!0?Ce.stride:Ce.itemSize,tt=ae.offset;if(Ce.isInstancedInterleavedBuffer||Ce.isInstancedBufferAttribute){for(let Be=0;Be<J.locationSize;Be++)I(J.location+Be,Ce.meshPerAttribute);if(V.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=Ce.meshPerAttribute*Ce.count}else for(let Be=0;Be<J.locationSize;Be++)C(J.location+Be);m.bindBuffer(m.ARRAY_BUFFER,ye);for(let Be=0;Be<J.locationSize;Be++)U(J.location+Be,Te/J.locationSize,Ie,ge,rt*xe,(tt+Te/J.locationSize*Be)*xe,Ue)}else{if(ae.isInstancedBufferAttribute){for(let Ce=0;Ce<J.locationSize;Ce++)I(J.location+Ce,ae.meshPerAttribute);if(V.isInstancedMesh!==!0&&X._maxInstanceCount===void 0)X._maxInstanceCount=ae.meshPerAttribute*ae.count}else for(let Ce=0;Ce<J.locationSize;Ce++)C(J.location+Ce);m.bindBuffer(m.ARRAY_BUFFER,ye);for(let Ce=0;Ce<J.locationSize;Ce++)U(J.location+Ce,Te/J.locationSize,Ie,ge,Te*xe,Te/J.locationSize*Ce*xe,Ue)}}else if(te!==void 0){let ge=te[ve];if(ge!==void 0)switch(ge.length){case 2:m.vertexAttrib2fv(J.location,ge);break;case 3:m.vertexAttrib3fv(J.location,ge);break;case 4:m.vertexAttrib4fv(J.location,ge);break;default:m.vertexAttrib1fv(J.location,ge)}}}}L()}function F(){z();for(let V in x){let Y=x[V];for(let ee in Y){let X=Y[ee];for(let ie in X){let le=X[ie];for(let te in le)E(le[te].object),delete le[te];delete X[ie]}}delete x[V]}}function k(V){if(x[V.id]===void 0)return;let Y=x[V.id];for(let ee in Y){let X=Y[ee];for(let ie in X){let le=X[ie];for(let te in le)E(le[te].object),delete le[te];delete X[ie]}}delete x[V.id]}function D(V){for(let Y in x){let ee=x[Y];for(let X in ee){let ie=ee[X];if(ie[V.id]===void 0)continue;let le=ie[V.id];for(let te in le)E(le[te].object),delete le[te];delete ie[V.id]}}}function B(V){for(let Y in x){let ee=x[Y],X=V.isInstancedMesh===!0?V.id:0,ie=ee[X];if(ie===void 0)continue;for(let le in ie){let te=ie[le];for(let ve in te)E(te[ve].object),delete te[ve];delete ie[le]}if(delete ee[X],Object.keys(ee).length===0)delete x[Y]}}function z(){if(W(),b=!0,v===y)return;v=y,w(v.object)}function W(){y.geometry=null,y.program=null,y.wireframe=!1}return{setup:S,reset:z,resetDefaultState:W,dispose:F,releaseStatesOfGeometry:k,releaseStatesOfObject:B,releaseStatesOfProgram:D,initAttributes:N,enableAttribute:C,disableUnusedAttributes:L}}function Ev(m,g,_){let x;function y(M){x=M}function v(M,w){m.drawArrays(x,M,w),_.update(w,x,1)}function b(M,w,E){if(E===0)return;m.drawArraysInstanced(x,M,w,E),_.update(w,x,E)}function S(M,w,E){if(E===0)return;g.get("WEBGL_multi_draw").multiDrawArraysWEBGL(x,M,0,w,0,E);let T=0;for(let R=0;R<E;R++)T+=w[R];_.update(T,x,1)}this.setMode=y,this.render=v,this.renderInstances=b,this.renderMultiDraw=S}function Tv(m,g,_,x){let y;function v(){if(y!==void 0)return y;if(g.has("EXT_texture_filter_anisotropic")===!0){let D=g.get("EXT_texture_filter_anisotropic");y=m.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else y=0;return y}function b(D){if(D!==Ln&&x.convert(D)!==m.getParameter(m.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function S(D){let B=D===di&&(g.has("EXT_color_buffer_half_float")||g.has("EXT_color_buffer_float"));if(D!==si&&D!==Ci&&!B&&x.convert(D)!==m.getParameter(m.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function M(D){if(D==="highp"){if(m.getShaderPrecisionFormat(m.VERTEX_SHADER,m.HIGH_FLOAT).precision>0&&m.getShaderPrecisionFormat(m.FRAGMENT_SHADER,m.HIGH_FLOAT).precision>0)return"highp";D="mediump"}if(D==="mediump"){if(m.getShaderPrecisionFormat(m.VERTEX_SHADER,m.MEDIUM_FLOAT).precision>0&&m.getShaderPrecisionFormat(m.FRAGMENT_SHADER,m.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let w=_.precision!==void 0?_.precision:"highp",E=M(w);if(E!==w)qe("WebGLRenderer:",w,"not supported, using",E,"instead."),w=E;let A=_.reversedDepthBuffer===!0&&g.has("EXT_clip_control"),T=_.logarithmicDepthBuffer===!0&&A===!1;if(_.reversedDepthBuffer===!0&&A===!1)qe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(_.logarithmicDepthBuffer===!0&&A===!0)qe("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let R=m.getParameter(m.MAX_TEXTURE_IMAGE_UNITS),P=m.getParameter(m.MAX_VERTEX_TEXTURE_IMAGE_UNITS),N=m.getParameter(m.MAX_TEXTURE_SIZE),C=m.getParameter(m.MAX_CUBE_MAP_TEXTURE_SIZE),I=m.getParameter(m.MAX_VERTEX_ATTRIBS),L=m.getParameter(m.MAX_VERTEX_UNIFORM_VECTORS),U=m.getParameter(m.MAX_VARYING_VECTORS),O=m.getParameter(m.MAX_FRAGMENT_UNIFORM_VECTORS),F=m.getParameter(m.MAX_SAMPLES),k=m.getParameter(m.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:v,getMaxPrecision:M,textureFormatReadable:b,textureTypeReadable:S,precision:w,logarithmicDepthBuffer:T,reversedDepthBuffer:A,maxTextures:R,maxVertexTextures:P,maxTextureSize:N,maxCubemapSize:C,maxAttributes:I,maxVertexUniforms:L,maxVaryings:U,maxFragmentUniforms:O,maxSamples:F,samples:k}}function Av(m){let g=this,_=null,x=0,y=!1,v=!1,b=new mn,S=new et,M={value:null,needsUpdate:!1};this.uniform=M,this.numPlanes=0,this.numIntersection=0,this.init=function(A,T){let R=A.length!==0||T||x!==0||y;return y=T,x=A.length,R},this.beginShadows=function(){v=!0,E(null)},this.endShadows=function(){v=!1},this.setGlobalState=function(A,T){_=E(A,T,0)},this.setState=function(A,T,R){let{clippingPlanes:P,clipIntersection:N,clipShadows:C}=A,I=m.get(A);if(!y||P===null||P.length===0||v&&!C)if(v)E(null);else w();else{let L=v?0:x,U=L*4,O=I.clippingState||null;M.value=O,O=E(P,T,U,R);for(let F=0;F!==U;++F)O[F]=_[F];I.clippingState=O,this.numIntersection=N?this.numPlanes:0,this.numPlanes+=L}};function w(){if(M.value!==_)M.value=_,M.needsUpdate=x>0;g.numPlanes=x,g.numIntersection=0}function E(A,T,R,P){let N=A!==null?A.length:0,C=null;if(N!==0){if(C=M.value,P!==!0||C===null){let I=R+N*4,L=T.matrixWorldInverse;if(S.getNormalMatrix(L),C===null||C.length<I)C=new Float32Array(I);for(let U=0,O=R;U!==N;++U,O+=4)b.copy(A[U]).applyMatrix4(L,S),b.normal.toArray(C,O),C[O+3]=b.constant}M.value=C,M.needsUpdate=!0}return g.numPlanes=N,g.numIntersection=0,C}}class Za extends $n{constructor(m=1,g={}){super(m,m,g);this.isWebGLCubeRenderTarget=!0;let _={width:m,height:m,depth:1},x=[_,_,_,_,_,_];this.texture=new La(x),this._setTextureOptions(g),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(m,g){this.texture.type=g.type,this.texture.colorSpace=g.colorSpace,this.texture.generateMipmaps=g.generateMipmaps,this.texture.minFilter=g.minFilter,this.texture.magFilter=g.magFilter;let _={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},x=new hr(5,5,5),y=new Ui({name:"CubemapFromEquirect",uniforms:Ts(_.uniforms),vertexShader:_.vertexShader,fragmentShader:_.fragmentShader,side:Mn,blending:ys});y.uniforms.tEquirect.value=g;let v=new Xt(x,y),b=g.minFilter;if(g.minFilter===ii)g.minFilter=wn;return new fo(1,10,this).update(m,v),g.minFilter=b,v.geometry.dispose(),v.material.dispose(),this}clear(m,g=!0,_=!0,x=!0){let y=m.getRenderTarget();for(let v=0;v<6;v++)m.setRenderTarget(this,v),m.clear(g,_,x);m.setRenderTarget(y)}}var zp=256,Rv=3,Cv=20,cm=256,um=16,Pv=3,Iv=new Z,Lv=new st;class $a{constructor(m){this._renderer=m,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new fo(1,10,null),this._boxMesh=new Xt(new hr(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(m,g=0,_=0.1,x=100,y={}){let{size:v=256,position:b=Iv}=y,S=this._renderer;this._setSize(v);let M=this._allocateTarget(),w=this._getSourceTarget(!0);if(g>0)w.texture.mipmapsAutoUpdate=!1;let{autoClear:E,autoClearColor:A,autoClearDepth:T,autoClearStencil:R}=S,P=m.background;if(S.autoClear=!0,S.autoClearColor=!0,S.autoClearDepth=!0,S.autoClearStencil=!0,P===null)m.background=S.getClearColor(Lv);let N=new fo(_,x,w);if(N.position.copy(b),N.update(S,m),S.autoClear=E,S.autoClearColor=A,S.autoClearDepth=T,S.autoClearStencil=R,m.background=P,g>0)w.texture.mipmapsAutoUpdate=!0,this._blur(M,g);return this._applyPMREM(M),M}fromEquirectangular(m,g=null){return this._fromTexture(m,g)}fromCubemap(m,g=null){return this._fromTexture(m,g)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Vp(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Gp(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(m,g){return g>0?1-Math.sqrt(1-m/g):0}_setSize(m){this._cubeSize=Math.max(zp,Lu(m))}_fromTexture(m,g){if(m.mapping===jr||m.mapping===sr)this._setSize(m.image.length===0?zp:m.image[0].width||m.image[0].image.width);else this._setSize(m.image.width/4);let _=g||this._allocateTarget();return this._textureToCubemap(m),this._applyPMREM(_),_}_allocateTarget(){let m=this._cubeSize,g=Hp(m,!1,!1),_=Math.log2(m)-Rv;for(let x=0;x<=_;x++)g.texture.mipmaps.push({width:m>>x,height:m>>x});return g.texture.name="PMREM",g.texture.isPMREMTexture=!0,g}_getSourceTarget(m=!1){let g=this._cubeSize,_=this._sourceTarget;if(_===null||_.width!==g||m&&_.depthBuffer===!1){if(_!==null)_.dispose();this._sourceTarget=Hp(g,!0,m)}return this._sourceTarget}_compileMaterial(m){this._boxMesh.material=m,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(m,g,_){let x=this._boxMesh,y=this._cubeCamera;x.material=_,y.renderTarget=m,y.activeMipmapLevel=g;let v=m.width>>g;m.viewport.set(0,0,v,v),y.update(this._renderer,x),m.viewport.set(0,0,m.width,m.height)}_textureToCubemap(m){let g;if(m.mapping===jr||m.mapping===sr){if(this._cubemapMaterial===null)this._cubemapMaterial=Vp();g=this._cubemapMaterial,g.uniforms.flipEnvMap.value=m.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Gp();g=this._equirectMaterial}g.uniforms.envMap.value=m,this._renderCube(this._getSourceTarget(),0,g)}_applyPMREM(m){if(this._ggxMaterial===null)this._ggxMaterial=Nv(),this._integrationMaterial=Dv();let g=this._cubeSize,_=m.texture.mipmaps.length-1,x=this._ggxMaterial.uniforms;x.envMap.value=this._sourceTarget.texture;let y=this._integrationMaterial.uniforms;y.envMap.value=this._sourceTarget.texture,y.sourceLod.value=Math.log2(g/um);for(let v=0;v<=_;v++){let b=$a.lodToRoughness(v,_);if(v>_-Pv)y.roughness.value=b,this._renderCube(m,v,this._integrationMaterial);else{let S=b>0?Math.log2(g)+0.5*Math.log2(6/(cm*Math.pow(b,4)))+0.5:0;x.roughness.value=b,x.lodBias.value=S,this._renderCube(m,v,this._ggxMaterial)}}}_blur(m,g){if(this._blurMaterial===null)this._blurMaterial=Ov();let _=this._blurMaterial,x=_.uniforms,y=this._sourceTarget;x.sigma.value=Math.min(g,Math.PI)/Math.SQRT2,x.envMap.value=y.texture,this._renderCube(m,0,_),x.envMap.value=m.texture,this._renderCube(y,0,_)}}function Hp(m,g,_){return new Za(m,{minFilter:ii,generateMipmaps:g,type:di,colorSpace:wu,depthBuffer:_})}function xo(m,g,_){return new Ui({name:m,uniforms:g,vertexShader:lt.cube_vert,fragmentShader:_,side:Mn,blending:ys,depthTest:!1,depthWrite:!1})}function Nv(){return xo("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${cm}u

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
	`)}function Dv(){return xo("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:um}},`

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
	`)}function Ov(){return xo("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Cv}
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
	`)}function Gp(){return xo("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Vp(){return xo("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Uv(m){let g=new WeakMap,_=new WeakMap,x=null;function y(T,R=!1){if(T===null||T===void 0)return null;if(R)return b(T);return v(T)}function v(T){if(T&&T.isTexture){let R=T.mapping;if(R===_a||R===xa)if(g.has(T)){let P=g.get(T).texture;return S(P,T.mapping)}else{let P=T.image;if(P&&P.height>0){let N=new Za(P.height);return N.fromEquirectangularTexture(m,T),g.set(T,N),T.addEventListener("dispose",w),S(N.texture,T.mapping)}else return null}}return T}function b(T){if(T&&T.isTexture&&T.isPMREMTexture!==!0){let R=T.mapping,P=R===_a||R===xa,N=R===jr||R===sr;if(P||N){let C=_.get(T),I=C!==void 0?C.texture.pmremVersion:0;if(T.isRenderTargetTexture&&T.pmremVersion!==I){if(x===null)x=new $a(m);return C=P?x.fromEquirectangular(T,C):x.fromCubemap(T,C),C.texture.pmremVersion=T.pmremVersion,_.set(T,C),C.texture}else if(C!==void 0)return C.texture;else{let L=T.image;if(P&&L&&L.height>0||N&&L&&M(L)){if(x===null)x=new $a(m);return C=P?x.fromEquirectangular(T):x.fromCubemap(T),C.texture.pmremVersion=T.pmremVersion,_.set(T,C),T.addEventListener("dispose",E),C.texture}else return null}}}return T}function S(T,R){if(R===_a)T.mapping=jr;else if(R===xa)T.mapping=sr;return T}function M(T){let R=0,P=6;for(let N=0;N<P;N++)if(T[N]!==void 0)R++;return R===P}function w(T){let R=T.target;R.removeEventListener("dispose",w);let P=g.get(R);if(P!==void 0)g.delete(R),P.dispose()}function E(T){let R=T.target;R.removeEventListener("dispose",E);let P=_.get(R);if(P!==void 0)_.delete(R),P.dispose()}function A(){if(g=new WeakMap,_=new WeakMap,x!==null)x.dispose(),x=null}return{get:y,dispose:A}}function Fv(m){let g={};function _(x){if(g[x]!==void 0)return g[x];let y=m.getExtension(x);return g[x]=y,y}return{has:function(x){return _(x)!==null},init:function(){_("EXT_color_buffer_float"),_("WEBGL_clip_cull_distance"),_("OES_texture_float_linear"),_("EXT_color_buffer_half_float"),_("WEBGL_multisampled_render_to_texture"),_("WEBGL_render_shared_exponent")},get:function(x){let y=_(x);if(y===null)Xr("WebGLRenderer: "+x+" extension not supported.");return y}}}function Bv(m,g,_,x){let y={},v=new WeakMap,b=new FinalizationRegistry((P)=>delete y[P]);function S(P){M(P.target)}function M(P){if(P.index!==null)g.remove(P.index);for(let C in P.attributes)g.remove(P.attributes[C]);P.removeEventListener("dispose",S),delete y[P.id],b.unregister(P);let N=v.get(P);if(N)g.remove(N),v.delete(P);if(x.releaseStatesOfGeometry(P),P.isInstancedBufferGeometry===!0)delete P._maxInstanceCount;_.memory.geometries--}function w(P,N){if(y[N.id]!==void 0)return N;return N.addEventListener("dispose",S),y[N.id]=new WeakRef(N),b.register(N,N.id,N),_.memory.geometries++,N}function E(P){let N=P.attributes;for(let C in N)g.update(N[C],m.ARRAY_BUFFER)}function A(P){let N=P.index,C=P.attributes.position,I=0;if(C===void 0)return;let L=N!==null?N.array.length:C.array.length/3-1,O=new(C.count>=65535?Ca:Ra)(Math.ceil(L/3)*6,1),F=O.array;if(N!==null){let D=N.array;I=N.version;for(let B=0,z=0;B<L;B+=3){let W=D[B+0],V=D[B+1],Y=D[B+2];F[z++]=W,F[z++]=V,F[z++]=V,F[z++]=Y,F[z++]=Y,F[z++]=W}}else{I=C.version;for(let D=0,B=0;D<L;D+=3){let z=D+0,W=D+1,V=D+2;F[B++]=z,F[B++]=W,F[B++]=W,F[B++]=V,F[B++]=V,F[B++]=z}}O.version=I;let k=v.get(P);if(k)g.remove(k);v.set(P,O)}function T(P){let N=v.get(P);if(N){let C=P.index;if(C!==null){if(N.version<C.version)A(P)}}else A(P);return v.get(P)}function R(){for(let P in y){let N=y[P].deref();if(N!==void 0)M(N)}}return{get:w,update:E,getWireframeAttribute:T,dispose:R}}function kv(m,g,_){let x;function y(A){x=A}let v,b;function S(A){v=A.type,b=A.bytesPerElement}function M(A,T){m.drawElements(x,T,v,A*b),_.update(T,x,1)}function w(A,T,R){if(R===0)return;m.drawElementsInstanced(x,T,v,A*b,R),_.update(T,x,R)}function E(A,T,R){if(R===0)return;g.get("WEBGL_multi_draw").multiDrawElementsWEBGL(x,T,0,v,A,0,R);let N=0;for(let C=0;C<R;C++)N+=T[C];_.update(N,x,1)}this.setMode=y,this.setIndex=S,this.render=M,this.renderInstances=w,this.renderMultiDraw=E}function zv(m){let g={geometries:0,textures:0},_={frame:0,calls:0,triangles:0,points:0,lines:0};function x(v,b,S){switch(_.calls++,b){case m.TRIANGLES:_.triangles+=S*(v/3);break;case m.LINES:_.lines+=S*(v/2);break;case m.LINE_STRIP:_.lines+=S*(v-1);break;case m.LINE_LOOP:_.lines+=S*v;break;case m.POINTS:_.points+=S*v;break;default:Je("WebGLInfo: Unknown draw mode:",b);break}}function y(){_.calls=0,_.triangles=0,_.points=0,_.lines=0}return{memory:g,render:_,programs:null,autoReset:!0,reset:y,update:x}}function Hv(m,g,_){let x=new WeakMap,y=new Ht;function v(b,S,M){let w=b.morphTargetInfluences,E=S.morphAttributes.position||S.morphAttributes.normal||S.morphAttributes.color,A=E!==void 0?E.length:0,T=x.get(S);if(T===void 0||T.count!==A){let z=function(){D.dispose(),x.delete(S),S.removeEventListener("dispose",z)};if(T!==void 0)T.texture.dispose();let R=S.morphAttributes.position!==void 0,P=S.morphAttributes.normal!==void 0,N=S.morphAttributes.color!==void 0,C=S.morphAttributes.position||[],I=S.morphAttributes.normal||[],L=S.morphAttributes.color||[],U=0;if(R===!0)U=1;if(P===!0)U=2;if(N===!0)U=3;let O=S.attributes.position.count*U,F=1;if(O>g.maxTextureSize)F=Math.ceil(O/g.maxTextureSize),O=g.maxTextureSize;let k=new Float32Array(O*F*4*A),D=new Ta(k,O,F,A);D.type=Ci,D.needsUpdate=!0;let B=U*4;for(let W=0;W<A;W++){let V=C[W],Y=I[W],ee=L[W],X=O*F*4*W;for(let ie=0;ie<V.count;ie++){let le=ie*B;if(R===!0)y.fromBufferAttribute(V,ie),k[X+le+0]=y.x,k[X+le+1]=y.y,k[X+le+2]=y.z,k[X+le+3]=0;if(P===!0)y.fromBufferAttribute(Y,ie),k[X+le+4]=y.x,k[X+le+5]=y.y,k[X+le+6]=y.z,k[X+le+7]=0;if(N===!0)y.fromBufferAttribute(ee,ie),k[X+le+8]=y.x,k[X+le+9]=y.y,k[X+le+10]=y.z,k[X+le+11]=ee.itemSize===4?y.w:1}}T={count:A,texture:D,size:new $e(O,F)},x.set(S,T),S.addEventListener("dispose",z)}if(b.isInstancedMesh===!0&&b.morphTexture!==null)M.getUniforms().setValue(m,"morphTexture",b.morphTexture,_);else{let R=0;for(let N=0;N<w.length;N++)R+=w[N];let P=S.morphTargetsRelative?1:1-R;M.getUniforms().setValue(m,"morphTargetBaseInfluence",P),M.getUniforms().setValue(m,"morphTargetInfluences",w)}M.getUniforms().setValue(m,"morphTargetsTexture",T.texture,_),M.getUniforms().setValue(m,"morphTargetsTextureSize",T.size)}return{update:v}}function Gv(m,g,_,x,y){let v=new WeakMap;function b(w){let E=y.render.frame,A=w.geometry,T=g.get(w,A);if(v.get(T)!==E)g.update(T),v.set(T,E);if(w.isInstancedMesh){if(w.hasEventListener("dispose",M)===!1)w.addEventListener("dispose",M);if(v.get(w)!==E){if(_.update(w.instanceMatrix,m.ARRAY_BUFFER),w.instanceColor!==null)_.update(w.instanceColor,m.ARRAY_BUFFER);v.set(w,E)}}if(w.isSkinnedMesh){let R=w.skeleton;if(v.get(R)!==E)R.update(),v.set(R,E)}return T}function S(){v=new WeakMap}function M(w){let E=w.target;if(E.removeEventListener("dispose",M),x.releaseStatesOfObject(E),_.remove(E.instanceMatrix),E.instanceColor!==null)_.remove(E.instanceColor)}return{update:b,dispose:S}}var Vv={[Fc]:"LINEAR_TONE_MAPPING",[Bc]:"REINHARD_TONE_MAPPING",[kc]:"CINEON_TONE_MAPPING",[zc]:"ACES_FILMIC_TONE_MAPPING",[Gc]:"AGX_TONE_MAPPING",[Vc]:"NEUTRAL_TONE_MAPPING",[Hc]:"CUSTOM_TONE_MAPPING"};function Wv(m,g,_,x,y,v){let b=new $n(g,_,{type:m,depthBuffer:y,stencilBuffer:v,samples:x?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),S=null,M=null,w=null,E=new sn;E.setAttribute("position",new gn([-1,3,0,-1,-1,0,3,-1,0],3)),E.setAttribute("uv",new gn([0,2,0,0,2,0],2));let A=new ku({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),T=new Xt(E,A),R=new Ha(-1,1,1,-1,0,1),P=null,N=null,C=!1,I,L=null,U=[],O=!1;this.setSize=function(F,k){if(b.setSize(F,k),S!==null)S.setSize(F,k);if(M!==null)M.setSize(F,k);for(let D=0;D<U.length;D++){let B=U[D];if(B.setSize)B.setSize(F,k)}},this.setEffects=function(F){U=F,O=U.length>0&&U[0].isRenderPass===!0;let{width:k,height:D}=b;if(U.length>0&&S===null)S=new $n(k,D,{type:di,depthBuffer:!1,stencilBuffer:!1}),M=new $n(k,D,{type:di,depthBuffer:!1,stencilBuffer:!1});let B=y===!0&&U.some((z)=>z.needsDepthTexture===!0);if(B!==(b.depthTexture!==null)){if(B===!0&&w===null){if(w=new ts(k,D),v===!0)w.format=Ki,w.type=vs}b.dispose(),b.depthTexture=B?w:null,b.resolveDepthBuffer=B,b.storeMultisampledDepthBuffer=B}for(let z=0;z<U.length;z++){let W=U[z];if(W.setSize)W.setSize(k,D);if(B&&W.needsDepthTexture===!0&&W.setDepthTexture)W.setDepthTexture(w)}},this.begin=function(F,k){if(C)return!1;if(F.toneMapping===hi&&U.length===0)return!1;if(L=k,k!==null){let{width:D,height:B}=k;if(b.width!==D||b.height!==B)this.setSize(D,B)}if(O===!1)F.setRenderTarget(b);return I=F.toneMapping,F.toneMapping=hi,!0},this.hasRenderPass=function(){return O},this.end=function(F,k){F.toneMapping=I,C=!0;let D=b,B=S;for(let z=0;z<U.length;z++){let W=U[z];if(W.enabled===!1)continue;if(W.render(F,B,D,k),W.needsSwap!==!1)D=B,B=B===S?M:S}if(P!==F.outputColorSpace||N!==F.toneMapping){if(P=F.outputColorSpace,N=F.toneMapping,A.defines={},ut.getTransfer(P)===Nt)A.defines.SRGB_TRANSFER="";let z=Vv[N];if(z)A.defines[z]="";A.needsUpdate=!0}A.uniforms.tDiffuse.value=D.texture,F.setRenderTarget(L),F.render(T,R),L=null,C=!1},this.isCompositing=function(){return C},this.dispose=function(){if(b.dispose(),S!==null)S.dispose();if(M!==null)M.dispose();E.dispose(),A.dispose()}}var hm=new Vt,dm=new ts(1,1),fm=new Da(1),pm=new Ta,mm=new Fu,gm=new La,Wp=[],Xp=[],qp=new Float32Array(16),Yp=new Float32Array(9),$p=new Float32Array(4);function dr(m,g,_){let x=m[0];if(x<=0||x>0)return m;let y=g*_,v=Wp[y];if(v===void 0)v=new Float32Array(y),Wp[y]=v;if(g!==0){x.toArray(v,0);for(let b=1,S=0;b!==g;++b)S+=_,m[b].toArray(v,S)}return v}function rn(m,g){if(m.length!==g.length)return!1;for(let _=0,x=m.length;_<x;_++)if(m[_]!==g[_])return!1;return!0}function on(m,g){for(let _=0,x=g.length;_<x;_++)m[_]=g[_]}function Ja(m,g){let _=Xp[g];if(_===void 0)_=new Int32Array(g),Xp[g]=_;for(let x=0;x!==g;++x)_[x]=m.allocateTextureUnit();return _}function Xv(m,g){let _=this.cache;if(_[0]===g)return;m.uniform1f(this.addr,g),_[0]=g}function qv(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y)m.uniform2f(this.addr,g.x,g.y),_[0]=g.x,_[1]=g.y}else{if(rn(_,g))return;m.uniform2fv(this.addr,g),on(_,g)}}function Yv(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z)m.uniform3f(this.addr,g.x,g.y,g.z),_[0]=g.x,_[1]=g.y,_[2]=g.z}else if(g.r!==void 0){if(_[0]!==g.r||_[1]!==g.g||_[2]!==g.b)m.uniform3f(this.addr,g.r,g.g,g.b),_[0]=g.r,_[1]=g.g,_[2]=g.b}else{if(rn(_,g))return;m.uniform3fv(this.addr,g),on(_,g)}}function $v(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z||_[3]!==g.w)m.uniform4f(this.addr,g.x,g.y,g.z,g.w),_[0]=g.x,_[1]=g.y,_[2]=g.z,_[3]=g.w}else{if(rn(_,g))return;m.uniform4fv(this.addr,g),on(_,g)}}function Zv(m,g){let _=this.cache,x=g.elements;if(x===void 0){if(rn(_,g))return;m.uniformMatrix2fv(this.addr,!1,g),on(_,g)}else{if(rn(_,x))return;$p.set(x),m.uniformMatrix2fv(this.addr,!1,$p),on(_,x)}}function Jv(m,g){let _=this.cache,x=g.elements;if(x===void 0){if(rn(_,g))return;m.uniformMatrix3fv(this.addr,!1,g),on(_,g)}else{if(rn(_,x))return;Yp.set(x),m.uniformMatrix3fv(this.addr,!1,Yp),on(_,x)}}function Kv(m,g){let _=this.cache,x=g.elements;if(x===void 0){if(rn(_,g))return;m.uniformMatrix4fv(this.addr,!1,g),on(_,g)}else{if(rn(_,x))return;qp.set(x),m.uniformMatrix4fv(this.addr,!1,qp),on(_,x)}}function jv(m,g){let _=this.cache;if(_[0]===g)return;m.uniform1i(this.addr,g),_[0]=g}function Qv(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y)m.uniform2i(this.addr,g.x,g.y),_[0]=g.x,_[1]=g.y}else{if(rn(_,g))return;m.uniform2iv(this.addr,g),on(_,g)}}function eb(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z)m.uniform3i(this.addr,g.x,g.y,g.z),_[0]=g.x,_[1]=g.y,_[2]=g.z}else{if(rn(_,g))return;m.uniform3iv(this.addr,g),on(_,g)}}function tb(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z||_[3]!==g.w)m.uniform4i(this.addr,g.x,g.y,g.z,g.w),_[0]=g.x,_[1]=g.y,_[2]=g.z,_[3]=g.w}else{if(rn(_,g))return;m.uniform4iv(this.addr,g),on(_,g)}}function nb(m,g){let _=this.cache;if(_[0]===g)return;m.uniform1ui(this.addr,g),_[0]=g}function ib(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y)m.uniform2ui(this.addr,g.x,g.y),_[0]=g.x,_[1]=g.y}else{if(rn(_,g))return;m.uniform2uiv(this.addr,g),on(_,g)}}function sb(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z)m.uniform3ui(this.addr,g.x,g.y,g.z),_[0]=g.x,_[1]=g.y,_[2]=g.z}else{if(rn(_,g))return;m.uniform3uiv(this.addr,g),on(_,g)}}function rb(m,g){let _=this.cache;if(g.x!==void 0){if(_[0]!==g.x||_[1]!==g.y||_[2]!==g.z||_[3]!==g.w)m.uniform4ui(this.addr,g.x,g.y,g.z,g.w),_[0]=g.x,_[1]=g.y,_[2]=g.z,_[3]=g.w}else{if(rn(_,g))return;m.uniform4uiv(this.addr,g),on(_,g)}}function Ka(m){if(m.version===0)m.compareFunction=Ru,m.needsUpdate=!0;return m}function ob(m,g,_){let x=this.cache,y=_.allocateTextureUnit();if(x[0]!==y)m.uniform1i(this.addr,y),x[0]=y;let v;if(this.type===m.SAMPLER_2D_SHADOW)v=Ka(dm);else v=hm;_.setTexture2D(g||v,y)}function ab(m,g,_){let x=this.cache,y=_.allocateTextureUnit();if(x[0]!==y)m.uniform1i(this.addr,y),x[0]=y;_.setTexture3D(g||mm,y)}function lb(m,g,_){let x=this.cache,y=_.allocateTextureUnit();if(x[0]!==y)m.uniform1i(this.addr,y),x[0]=y;let v;if(this.type===m.SAMPLER_CUBE_SHADOW)v=Ka(fm);else v=gm;_.setTextureCube(g||v,y)}function cb(m,g,_){let x=this.cache,y=_.allocateTextureUnit();if(x[0]!==y)m.uniform1i(this.addr,y),x[0]=y;_.setTexture2DArray(g||pm,y)}function ub(m){switch(m){case 5126:return Xv;case 35664:return qv;case 35665:return Yv;case 35666:return $v;case 35674:return Zv;case 35675:return Jv;case 35676:return Kv;case 5124:case 35670:return jv;case 35667:case 35671:return Qv;case 35668:case 35672:return eb;case 35669:case 35673:return tb;case 5125:return nb;case 36294:return ib;case 36295:return sb;case 36296:return rb;case 35678:case 36198:case 36298:case 36306:case 35682:return ob;case 35679:case 36299:case 36307:return ab;case 35680:case 36300:case 36308:case 36293:return lb;case 36289:case 36303:case 36311:case 36292:return cb}}function hb(m,g){m.uniform1fv(this.addr,g)}function db(m,g){let _=dr(g,this.size,2);m.uniform2fv(this.addr,_)}function fb(m,g){let _=dr(g,this.size,3);m.uniform3fv(this.addr,_)}function pb(m,g){let _=dr(g,this.size,4);m.uniform4fv(this.addr,_)}function mb(m,g){let _=dr(g,this.size,4);m.uniformMatrix2fv(this.addr,!1,_)}function gb(m,g){let _=dr(g,this.size,9);m.uniformMatrix3fv(this.addr,!1,_)}function _b(m,g){let _=dr(g,this.size,16);m.uniformMatrix4fv(this.addr,!1,_)}function xb(m,g){m.uniform1iv(this.addr,g)}function yb(m,g){m.uniform2iv(this.addr,g)}function vb(m,g){m.uniform3iv(this.addr,g)}function bb(m,g){m.uniform4iv(this.addr,g)}function Sb(m,g){m.uniform1uiv(this.addr,g)}function Mb(m,g){m.uniform2uiv(this.addr,g)}function wb(m,g){m.uniform3uiv(this.addr,g)}function Eb(m,g){m.uniform4uiv(this.addr,g)}function Tb(m,g,_){let x=this.cache,y=g.length,v=Ja(_,y);if(!rn(x,v))m.uniform1iv(this.addr,v),on(x,v);let b;if(this.type===m.SAMPLER_2D_SHADOW)b=Ka(dm);else b=hm;for(let S=0;S!==y;++S)_.setTexture2D(g[S]||b,v[S])}function Ab(m,g,_){let x=this.cache,y=g.length,v=Ja(_,y);if(!rn(x,v))m.uniform1iv(this.addr,v),on(x,v);for(let b=0;b!==y;++b)_.setTexture3D(g[b]||mm,v[b])}function Rb(m,g,_){let x=this.cache,y=g.length,v=Ja(_,y);if(!rn(x,v))m.uniform1iv(this.addr,v),on(x,v);let b;if(this.type===m.SAMPLER_CUBE_SHADOW)b=Ka(fm);else b=gm;for(let S=0;S!==y;++S)_.setTextureCube(g[S]||b,v[S])}function Cb(m,g,_){let x=this.cache,y=g.length,v=Ja(_,y);if(!rn(x,v))m.uniform1iv(this.addr,v),on(x,v);for(let b=0;b!==y;++b)_.setTexture2DArray(g[b]||pm,v[b])}function Pb(m){switch(m){case 5126:return hb;case 35664:return db;case 35665:return fb;case 35666:return pb;case 35674:return mb;case 35675:return gb;case 35676:return _b;case 5124:case 35670:return xb;case 35667:case 35671:return yb;case 35668:case 35672:return vb;case 35669:case 35673:return bb;case 5125:return Sb;case 36294:return Mb;case 36295:return wb;case 36296:return Eb;case 35678:case 36198:case 36298:case 36306:case 35682:return Tb;case 35679:case 36299:case 36307:return Ab;case 35680:case 36300:case 36308:case 36293:return Rb;case 36289:case 36303:case 36311:case 36292:return Cb}}class _m{constructor(m,g,_){this.id=m,this.addr=_,this.cache=[],this.type=g.type,this.setValue=ub(g.type)}}class xm{constructor(m,g,_){this.id=m,this.addr=_,this.cache=[],this.type=g.type,this.size=g.size,this.setValue=Pb(g.type)}}class ym{constructor(m){this.id=m,this.seq=[],this.map={}}setValue(m,g,_){let x=this.seq;for(let y=0,v=x.length;y!==v;++y){let b=x[y];b.setValue(m,g[b.id],_)}}}var ih=/(\w+)(\])?(\[|\.)?/g;function Zp(m,g){m.seq.push(g),m.map[g.id]=g}function Ib(m,g,_){let x=m.name,y=x.length;ih.lastIndex=0;while(!0){let v=ih.exec(x),b=ih.lastIndex,S=v[1],M=v[2]==="]",w=v[3];if(M)S=S|0;if(w===void 0||w==="["&&b+2===y){Zp(_,w===void 0?new _m(S,m,g):new xm(S,m,g));break}else{let A=_.map[S];if(A===void 0)A=new ym(S),Zp(_,A);_=A}}}class _o{constructor(m,g){this.seq=[],this.map={};let _=m.getProgramParameter(g,m.ACTIVE_UNIFORMS);for(let v=0;v<_;++v){let b=m.getActiveUniform(g,v),S=m.getUniformLocation(g,b.name);Ib(b,S,this)}let x=[],y=[];for(let v of this.seq)if(v.type===m.SAMPLER_2D_SHADOW||v.type===m.SAMPLER_CUBE_SHADOW||v.type===m.SAMPLER_2D_ARRAY_SHADOW)x.push(v);else y.push(v);if(x.length>0)this.seq=x.concat(y)}setValue(m,g,_,x){let y=this.map[g];if(y!==void 0)y.setValue(m,_,x)}setOptional(m,g,_){let x=g[_];if(x!==void 0)this.setValue(m,_,x)}static upload(m,g,_,x){for(let y=0,v=g.length;y!==v;++y){let b=g[y],S=_[b.id];if(S.needsUpdate!==!1)b.setValue(m,S.value,x)}}static seqWithValue(m,g){let _=[];for(let x=0,y=m.length;x!==y;++x){let v=m[x];if(v.id in g)_.push(v)}return _}}function Jp(m,g,_){let x=m.createShader(g);return m.shaderSource(x,_),m.compileShader(x),x}var Lb=37297,Nb=0;function Db(m,g){let _=m.split(`
`),x=[],y=Math.max(g-6,0),v=Math.min(g+6,_.length);for(let b=y;b<v;b++){let S=b+1;x.push(`${S===g?">":" "} ${S}: ${_[b]}`)}return x.join(`
`)}var Kp=new et;function Ob(m){ut._getMatrix(Kp,ut.workingColorSpace,m);let g=`mat3( ${Kp.elements.map((_)=>_.toFixed(4))} )`;switch(ut.getTransfer(m)){case Eu:return[g,"LinearTransferOETF"];case Nt:return[g,"sRGBTransferOETF"];default:return qe("WebGLProgram: Unsupported color space: ",m),[g,"LinearTransferOETF"]}}function jp(m,g,_){let x=m.getShaderParameter(g,m.COMPILE_STATUS),v=(m.getShaderInfoLog(g)||"").trim();if(x&&v==="")return"";let b=/ERROR: 0:(\d+)/.exec(v);if(b){let S=parseInt(b[1]);return _.toUpperCase()+`

`+v+`

`+Db(m.getShaderSource(g),S)}else return v}function Ub(m,g){let _=Ob(g);return[`vec4 ${m}( vec4 value ) {`,`	return ${_[1]}( vec4( ${_[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Fb={[Fc]:"Linear",[Bc]:"Reinhard",[kc]:"Cineon",[zc]:"ACESFilmic",[Gc]:"AgX",[Vc]:"Neutral",[Hc]:"Custom"};function Bb(m,g){let _=Fb[g];if(_===void 0)return qe("WebGLProgram: Unsupported toneMapping:",g),"vec3 "+m+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+m+"( vec3 color ) { return "+_+"ToneMapping( color ); }"}var Ya=new Z;function kb(){ut.getLuminanceCoefficients(Ya);let m=Ya.x.toFixed(4),g=Ya.y.toFixed(4),_=Ya.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${m}, ${g}, ${_} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function zb(m){return[m.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",m.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(go).join(`
`)}function Hb(m){let g=[];for(let _ in m){let x=m[_];if(x===!1)continue;g.push("#define "+_+" "+x)}return g.join(`
`)}function Gb(m,g){let _={},x=m.getProgramParameter(g,m.ACTIVE_ATTRIBUTES);for(let y=0;y<x;y++){let v=m.getActiveAttrib(g,y),b=v.name,S=1;if(v.type===m.FLOAT_MAT2)S=2;if(v.type===m.FLOAT_MAT3)S=3;if(v.type===m.FLOAT_MAT4)S=4;_[b]={type:v.type,location:m.getAttribLocation(g,b),locationSize:S}}return _}function go(m){return m!==""}function Qp(m,g){let _=g.numSpotLightShadows+g.numSpotLightMaps-g.numSpotLightShadowsWithMaps;return m.replace(/NUM_SUN_LIGHTS/g,g.numSunLights).replace(/NUM_DIR_LIGHTS/g,g.numDirLights).replace(/NUM_SPOT_LIGHTS/g,g.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,g.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,_).replace(/NUM_RECT_AREA_LIGHTS/g,g.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,g.numPointLights).replace(/NUM_HEMI_LIGHTS/g,g.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,g.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,g.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,g.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,g.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,g.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,g.numLightProbeGrids)}function em(m,g){return m.replace(/NUM_CLIPPING_PLANES/g,g.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,g.numClippingPlanes-g.numClipIntersection)}var Vb=/^[ \t]*#include +<([\w\d./]+)>/gm;function rh(m){return m.replace(Vb,Wb)}function Wb(m,g){let _=lt[g];if(_===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+g+">");return rh(_)}var Xb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function tm(m){return m.replace(Xb,qb)}function qb(m,g,_,x){let y="";for(let v=parseInt(g);v<parseInt(_);v++)y+=x.replace(/\[\s*i\s*\]/g,"[ "+v+" ]").replace(/UNROLLED_LOOP_INDEX/g,v);return y}function nm(m){let g=`precision ${m.precision} float;
	precision ${m.precision} int;
	precision ${m.precision} sampler2D;
	precision ${m.precision} samplerCube;
	precision ${m.precision} sampler3D;
	precision ${m.precision} sampler2DArray;
	precision ${m.precision} sampler2DShadow;
	precision ${m.precision} samplerCubeShadow;
	precision ${m.precision} sampler2DArrayShadow;
	precision ${m.precision} isampler2D;
	precision ${m.precision} isampler3D;
	precision ${m.precision} isamplerCube;
	precision ${m.precision} isampler2DArray;
	precision ${m.precision} usampler2D;
	precision ${m.precision} usampler3D;
	precision ${m.precision} usamplerCube;
	precision ${m.precision} usampler2DArray;
	`;if(m.precision==="highp")g+=`
#define HIGH_PRECISION`;else if(m.precision==="mediump")g+=`
#define MEDIUM_PRECISION`;else if(m.precision==="lowp")g+=`
#define LOW_PRECISION`;return g}var Yb={[Jr]:"SHADOWMAP_TYPE_PCF",[nr]:"SHADOWMAP_TYPE_VSM"};function $b(m){return Yb[m.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Zb={[sr]:"ENVMAP_MODE_REFRACTION"};function Jb(m){if(m.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Zb[m.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Kb={[cp]:"ENVMAP_BLENDING_MULTIPLY",[up]:"ENVMAP_BLENDING_MIX",[hp]:"ENVMAP_BLENDING_ADD"};function jb(m){if(m.envMap===!1)return"ENVMAP_BLENDING_NONE";return Kb[m.combine]||"ENVMAP_BLENDING_NONE"}function Qb(m,g,_,x){let y=m.getContext(),{defines:v,vertexShader:b,fragmentShader:S}=_,M=$b(_),w=_.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",E=Jb(_),A=jb(_),T=zb(_),R=Hb(v),P=y.createProgram(),N,C,I=_.glslVersion?"#version "+_.glslVersion+`
`:"";if(_.isRawShaderMaterial){if(N=["#define SHADER_TYPE "+_.shaderType,"#define SHADER_NAME "+_.shaderName,R].filter(go).join(`
`),N.length>0)N+=`
`;if(C=["#define SHADER_TYPE "+_.shaderType,"#define SHADER_NAME "+_.shaderName,R].filter(go).join(`
`),C.length>0)C+=`
`}else N=[nm(_),"#define SHADER_TYPE "+_.shaderType,"#define SHADER_NAME "+_.shaderName,R,_.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",_.batching?"#define USE_BATCHING":"",_.batchingColor?"#define USE_BATCHING_COLOR":"",_.instancing?"#define USE_INSTANCING":"",_.instancingColor?"#define USE_INSTANCING_COLOR":"",_.instancingMorph?"#define USE_INSTANCING_MORPH":"",_.useFog&&_.fog?"#define USE_FOG":"",_.useFog&&_.fogExp2?"#define FOG_EXP2":"",_.map?"#define USE_MAP":"",_.envMap?"#define USE_ENVMAP":"",_.envMap?"#define "+E:"",_.lightMap?"#define USE_LIGHTMAP":"",_.aoMap?"#define USE_AOMAP":"",_.bumpMap?"#define USE_BUMPMAP":"",_.normalMap?"#define USE_NORMALMAP":"",_.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",_.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",_.displacementMap?"#define USE_DISPLACEMENTMAP":"",_.emissiveMap?"#define USE_EMISSIVEMAP":"",_.anisotropy?"#define USE_ANISOTROPY":"",_.anisotropyMap?"#define USE_ANISOTROPYMAP":"",_.clearcoatMap?"#define USE_CLEARCOATMAP":"",_.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",_.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",_.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",_.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",_.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",_.specularMap?"#define USE_SPECULARMAP":"",_.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",_.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",_.roughnessMap?"#define USE_ROUGHNESSMAP":"",_.metalnessMap?"#define USE_METALNESSMAP":"",_.alphaMap?"#define USE_ALPHAMAP":"",_.alphaHash?"#define USE_ALPHAHASH":"",_.transmission?"#define USE_TRANSMISSION":"",_.transmissionMap?"#define USE_TRANSMISSIONMAP":"",_.thicknessMap?"#define USE_THICKNESSMAP":"",_.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",_.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",_.mapUv?"#define MAP_UV "+_.mapUv:"",_.alphaMapUv?"#define ALPHAMAP_UV "+_.alphaMapUv:"",_.lightMapUv?"#define LIGHTMAP_UV "+_.lightMapUv:"",_.aoMapUv?"#define AOMAP_UV "+_.aoMapUv:"",_.emissiveMapUv?"#define EMISSIVEMAP_UV "+_.emissiveMapUv:"",_.bumpMapUv?"#define BUMPMAP_UV "+_.bumpMapUv:"",_.normalMapUv?"#define NORMALMAP_UV "+_.normalMapUv:"",_.displacementMapUv?"#define DISPLACEMENTMAP_UV "+_.displacementMapUv:"",_.metalnessMapUv?"#define METALNESSMAP_UV "+_.metalnessMapUv:"",_.roughnessMapUv?"#define ROUGHNESSMAP_UV "+_.roughnessMapUv:"",_.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+_.anisotropyMapUv:"",_.clearcoatMapUv?"#define CLEARCOATMAP_UV "+_.clearcoatMapUv:"",_.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+_.clearcoatNormalMapUv:"",_.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+_.clearcoatRoughnessMapUv:"",_.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+_.diffuseRoughnessMapUv:"",_.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+_.iridescenceMapUv:"",_.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+_.iridescenceThicknessMapUv:"",_.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+_.sheenColorMapUv:"",_.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+_.sheenRoughnessMapUv:"",_.specularMapUv?"#define SPECULARMAP_UV "+_.specularMapUv:"",_.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+_.specularColorMapUv:"",_.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+_.specularIntensityMapUv:"",_.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+_.transmissionMapUv:"",_.thicknessMapUv?"#define THICKNESSMAP_UV "+_.thicknessMapUv:"",_.vertexTangents&&_.flatShading===!1?"#define USE_TANGENT":"",_.vertexNormals?"#define HAS_NORMAL":"",_.vertexColors?"#define USE_COLOR":"",_.vertexAlphas?"#define USE_COLOR_ALPHA":"",_.vertexUv1s?"#define USE_UV1":"",_.vertexUv2s?"#define USE_UV2":"",_.vertexUv3s?"#define USE_UV3":"",_.pointsUvs?"#define USE_POINTS_UV":"",_.flatShading?"#define FLAT_SHADED":"",_.skinning?"#define USE_SKINNING":"",_.morphTargets?"#define USE_MORPHTARGETS":"",_.morphNormals&&_.flatShading===!1?"#define USE_MORPHNORMALS":"",_.morphColors?"#define USE_MORPHCOLORS":"",_.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+_.morphTextureStride:"",_.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+_.morphTargetsCount:"",_.doubleSided?"#define DOUBLE_SIDED":"",_.flipSided?"#define FLIP_SIDED":"",_.shadowMapEnabled?"#define USE_SHADOWMAP":"",_.shadowMapEnabled?"#define "+M:"",_.sizeAttenuation?"#define USE_SIZEATTENUATION":"",_.numLightProbes>0?"#define USE_LIGHT_PROBES":"",_.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",_.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(go).join(`
`),C=[nm(_),"#define SHADER_TYPE "+_.shaderType,"#define SHADER_NAME "+_.shaderName,R,_.useFog&&_.fog?"#define USE_FOG":"",_.useFog&&_.fogExp2?"#define FOG_EXP2":"",_.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",_.map?"#define USE_MAP":"",_.matcap?"#define USE_MATCAP":"",_.envMap?"#define USE_ENVMAP":"",_.envMap?"#define "+w:"",_.envMap?"#define "+E:"",_.envMap?"#define "+A:"",_.envMapPMREM?"#define ENVMAP_MAX_LOD "+_.envMapMaxLod+".0":"",_.envMapPMREM?"#define ENVMAP_SIZE "+_.envMapSize+".0":"",_.lightMap?"#define USE_LIGHTMAP":"",_.aoMap?"#define USE_AOMAP":"",_.bumpMap?"#define USE_BUMPMAP":"",_.normalMap?"#define USE_NORMALMAP":"",_.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",_.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",_.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",_.emissiveMap?"#define USE_EMISSIVEMAP":"",_.anisotropy?"#define USE_ANISOTROPY":"",_.anisotropyMap?"#define USE_ANISOTROPYMAP":"",_.clearcoat?"#define USE_CLEARCOAT":"",_.clearcoatMap?"#define USE_CLEARCOATMAP":"",_.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",_.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",_.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",_.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",_.dispersion?"#define USE_DISPERSION":"",_.retroreflection?"#define USE_RETROREFLECTION":"",_.iridescence?"#define USE_IRIDESCENCE":"",_.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",_.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",_.specularMap?"#define USE_SPECULARMAP":"",_.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",_.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",_.roughnessMap?"#define USE_ROUGHNESSMAP":"",_.metalnessMap?"#define USE_METALNESSMAP":"",_.alphaMap?"#define USE_ALPHAMAP":"",_.alphaTest?"#define USE_ALPHATEST":"",_.alphaHash?"#define USE_ALPHAHASH":"",_.sheen?"#define USE_SHEEN":"",_.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",_.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",_.transmission?"#define USE_TRANSMISSION":"",_.transmissionMap?"#define USE_TRANSMISSIONMAP":"",_.thicknessMap?"#define USE_THICKNESSMAP":"",_.vertexTangents&&_.flatShading===!1?"#define USE_TANGENT":"",_.vertexColors||_.instancingColor?"#define USE_COLOR":"",_.vertexAlphas||_.batchingColor?"#define USE_COLOR_ALPHA":"",_.vertexUv1s?"#define USE_UV1":"",_.vertexUv2s?"#define USE_UV2":"",_.vertexUv3s?"#define USE_UV3":"",_.pointsUvs?"#define USE_POINTS_UV":"",_.gradientMap?"#define USE_GRADIENTMAP":"",_.flatShading?"#define FLAT_SHADED":"",_.doubleSided?"#define DOUBLE_SIDED":"",_.flipSided?"#define FLIP_SIDED":"",_.shadowMapEnabled?"#define USE_SHADOWMAP":"",_.shadowMapEnabled?"#define "+M:"",_.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",_.numLightProbes>0?"#define USE_LIGHT_PROBES":"",_.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",_.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",_.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",_.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",_.toneMapping!==hi?"#define TONE_MAPPING":"",_.toneMapping!==hi?lt.tonemapping_pars_fragment:"",_.toneMapping!==hi?Bb("toneMapping",_.toneMapping):"",_.dithering?"#define DITHERING":"",_.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,Ub("linearToOutputTexel",_.outputColorSpace),kb(),_.useDepthPacking?"#define DEPTH_PACKING "+_.depthPacking:"",`
`].filter(go).join(`
`);if(b=rh(b),b=Qp(b,_),b=em(b,_),S=rh(S),S=Qp(S,_),S=em(S,_),b=tm(b),S=tm(S),_.isRawShaderMaterial!==!0)I=`#version 300 es
`,N=[T,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+N,C=["#define varying in",_.glslVersion===Cu?"":"layout(location = 0) out highp vec4 pc_fragColor;",_.glslVersion===Cu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+C;let L=I+N+b,U=I+C+S,O=Jp(y,y.VERTEX_SHADER,L),F=Jp(y,y.FRAGMENT_SHADER,U);if(y.attachShader(P,O),y.attachShader(P,F),_.index0AttributeName!==void 0)y.bindAttribLocation(P,0,_.index0AttributeName);else if(_.hasPositionAttribute===!0)y.bindAttribLocation(P,0,"position");y.linkProgram(P);function k(W){if(m.debug.checkShaderErrors){let V=y.getProgramInfoLog(P)||"",Y=y.getShaderInfoLog(O)||"",ee=y.getShaderInfoLog(F)||"",X=V.trim(),ie=Y.trim(),le=ee.trim(),te=!0,ve=!0;if(y.getProgramParameter(P,y.LINK_STATUS)===!1)if(te=!1,typeof m.debug.onShaderError==="function")m.debug.onShaderError(y,P,O,F);else{let J=jp(y,O,"vertex"),ae=jp(y,F,"fragment");Je("WebGLProgram: Shader Error "+y.getError()+" - VALIDATE_STATUS "+y.getProgramParameter(P,y.VALIDATE_STATUS)+`

Material Name: `+W.name+`
Material Type: `+W.type+`

Program Info Log: `+X+`
`+J+`
`+ae)}else if(X!=="")qe("WebGLProgram: Program Info Log:",X);else if(ie===""||le==="")ve=!1;if(ve)W.diagnostics={runnable:te,programLog:X,vertexShader:{log:ie,prefix:N},fragmentShader:{log:le,prefix:C}}}y.deleteShader(O),y.deleteShader(F),D=new _o(y,P),B=Gb(y,P)}let D;this.getUniforms=function(){if(D===void 0)k(this);return D};let B;this.getAttributes=function(){if(B===void 0)k(this);return B};let z=_.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(z===!1)z=y.getProgramParameter(P,Lb);return z},this.destroy=function(){x.releaseStatesOfProgram(this),y.deleteProgram(P),this.program=void 0},this.type=_.shaderType,this.name=_.shaderName,this.id=Nb++,this.cacheKey=g,this.usedTimes=1,this.program=P,this.vertexShader=O,this.fragmentShader=F,this}var eS=0;class vm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(m,g,_){let x=this._getShaderCacheForMaterial(m);if(x.has(g)===!1)x.add(g),g.usedTimes++;if(x.has(_)===!1)x.add(_),_.usedTimes++;return this}remove(m){let g=this.materialCache.get(m);for(let _ of g)if(_.usedTimes--,_.usedTimes===0)this.shaderCache.delete(_.code);return this.materialCache.delete(m),this}getVertexShaderStage(m){return this._getShaderStage(m.vertexShader)}getFragmentShaderStage(m){return this._getShaderStage(m.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(m){let g=this.materialCache,_=g.get(m);if(_===void 0)_=new Set,g.set(m,_);return _}_getShaderStage(m){let g=this.shaderCache,_=g.get(m);if(_===void 0)_=new bm(m),g.set(m,_);return _}}class bm{constructor(m){this.id=eS++,this.code=m,this.usedTimes=0}}function tS(m){return m===bs||m===Sa||m===Ma}function nS(m,g,_,x,y,v){let b=new ro,S=new vm,M=new Set,w=[],E=new Map,A=x.logarithmicDepthBuffer,T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function R(D){if(M.add(D),D===0)return"uv";return`uv${D}`}function P(D,B,z,W,V,Y){let ee=W.fog,X=V.geometry,ie=D.isMeshStandardMaterial||D.isMeshLambertMaterial||D.isMeshPhongMaterial?W.environment:null,le=D.isMeshStandardMaterial||D.isMeshLambertMaterial&&!D.envMap||D.isMeshPhongMaterial&&!D.envMap,te=g.get(D.envMap||ie,le),ve=T[D.type],J=x.precision;if(D.precision!==null){if(J=x.getMaxPrecision(D.precision),J!==D.precision)qe("WebGLProgram.getParameters:",D.precision,"not supported, using",J,"instead.")}let ae=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ge=ae!==void 0?ae.length:0,Te=0;if(X.morphAttributes.position!==void 0)Te=1;if(X.morphAttributes.normal!==void 0)Te=2;if(X.morphAttributes.color!==void 0)Te=3;let ce,ye,Ie,xe;if(ve){let De=pi[ve];ce=De.vertexShader,ye=De.fragmentShader}else{ce=D.vertexShader,ye=D.fragmentShader;let De=S.getVertexShaderStage(D),Ct=S.getFragmentShaderStage(D);S.update(D,De,Ct),Ie=De.id,xe=Ct.id}let Ue=m.getRenderTarget(),Ce=m.state.buffers.depth.getReversed(),rt=V.isInstancedMesh===!0,tt=V.isBatchedMesh===!0,Be=!!D.map,Ke=!!D.matcap,Ye=!!te,Ze=Ye&&te.isPMREMTexture===!0,pt=!!D.aoMap,vt=!!D.lightMap,_t=!!D.bumpMap&&D.wireframe===!1,ot=!!D.normalMap,ct=!!D.displacementMap,bt=!!D.emissiveMap,kt=!!D.metalnessMap,Ut=!!D.roughnessMap,Q=D.anisotropy>0,$t=D.clearcoat>0,mt=D.diffuseRoughness>0,Wt=D.dispersion>0,Pe=D.retroreflectivity>0,Tt=D.iridescence>0,Ge=D.sheen>0,je=D.transmission>0,en=Q&&!!D.anisotropyMap,q=$t&&!!D.clearcoatMap,H=$t&&!!D.clearcoatNormalMap,se=$t&&!!D.clearcoatRoughnessMap,Se=mt&&!!D.diffuseRoughnessMap,_e=Tt&&!!D.iridescenceMap,we=Tt&&!!D.iridescenceThicknessMap,Me=Ge&&!!D.sheenColorMap,ue=Ge&&!!D.sheenRoughnessMap,pe=!!D.specularMap,Ee=!!D.specularColorMap,K=!!D.specularIntensityMap,fe=je&&!!D.transmissionMap,de=je&&!!D.thicknessMap,ne=!!D.gradientMap,me=!!D.alphaMap,be=D.alphaTest>0,ke=!!D.alphaHash,Ve=!!D.extensions,Ne=hi;if(D.toneMapped){if(Ue===null||Ue.isXRRenderTarget===!0)Ne=m.toneMapping}let Xe=Ze?te.isCompressedCubeTexture?te.image[0].mipmaps:te.mipmaps:null,at={shaderID:ve,shaderType:D.type,shaderName:D.name,vertexShader:ce,fragmentShader:ye,defines:D.defines,customVertexShaderID:Ie,customFragmentShaderID:xe,isRawShaderMaterial:D.isRawShaderMaterial===!0,glslVersion:D.glslVersion,precision:J,batching:tt,batchingColor:tt&&V._colorsTexture!==null,instancing:rt,instancingColor:rt&&V.instanceColor!==null,instancingMorph:rt&&V.morphTexture!==null,outputColorSpace:Ue===null?m.outputColorSpace:Ue.isXRRenderTarget===!0?Ue.texture.colorSpace:ut.workingColorSpace,alphaToCoverage:!!D.alphaToCoverage,map:Be,matcap:Ke,envMap:Ye,envMapMode:Ye&&te.mapping,envMapPMREM:Ze,envMapMaxLod:Ze?Xe.length-1:null,envMapSize:Ze?Xe[0].width:null,aoMap:pt,lightMap:vt,bumpMap:_t,normalMap:ot,displacementMap:ct,emissiveMap:bt,normalMapObjectSpace:ot&&D.normalMapType===bp,normalMapTangentSpace:ot&&D.normalMapType===Mu,packedNormalMap:ot&&D.normalMapType===Mu&&tS(D.normalMap.format),metalnessMap:kt,roughnessMap:Ut,anisotropy:Q,anisotropyMap:en,clearcoat:$t,clearcoatMap:q,clearcoatNormalMap:H,clearcoatRoughnessMap:se,diffuseRoughness:mt,diffuseRoughnessMap:Se,dispersion:Wt,retroreflection:Pe,iridescence:Tt,iridescenceMap:_e,iridescenceThicknessMap:we,sheen:Ge,sheenColorMap:Me,sheenRoughnessMap:ue,specularMap:pe,specularColorMap:Ee,specularIntensityMap:K,transmission:je,transmissionMap:fe,thicknessMap:de,gradientMap:ne,opaque:D.transparent===!1&&D.blending===Kr&&D.alphaToCoverage===!1,alphaMap:me,alphaTest:be,alphaHash:ke,combine:D.combine,mapUv:Be&&R(D.map.channel),aoMapUv:pt&&R(D.aoMap.channel),lightMapUv:vt&&R(D.lightMap.channel),bumpMapUv:_t&&R(D.bumpMap.channel),normalMapUv:ot&&R(D.normalMap.channel),displacementMapUv:ct&&R(D.displacementMap.channel),emissiveMapUv:bt&&R(D.emissiveMap.channel),metalnessMapUv:kt&&R(D.metalnessMap.channel),roughnessMapUv:Ut&&R(D.roughnessMap.channel),anisotropyMapUv:en&&R(D.anisotropyMap.channel),clearcoatMapUv:q&&R(D.clearcoatMap.channel),clearcoatNormalMapUv:H&&R(D.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:se&&R(D.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:Se&&R(D.diffuseRoughnessMap.channel),iridescenceMapUv:_e&&R(D.iridescenceMap.channel),iridescenceThicknessMapUv:we&&R(D.iridescenceThicknessMap.channel),sheenColorMapUv:Me&&R(D.sheenColorMap.channel),sheenRoughnessMapUv:ue&&R(D.sheenRoughnessMap.channel),specularMapUv:pe&&R(D.specularMap.channel),specularColorMapUv:Ee&&R(D.specularColorMap.channel),specularIntensityMapUv:K&&R(D.specularIntensityMap.channel),transmissionMapUv:fe&&R(D.transmissionMap.channel),thicknessMapUv:de&&R(D.thicknessMap.channel),alphaMapUv:me&&R(D.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(ot||Q),vertexNormals:!!X.attributes.normal,vertexColors:D.vertexColors,vertexAlphas:D.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!X.attributes.uv&&(Be||me),fog:!!ee,useFog:D.fog===!0,fogExp2:!!ee&&ee.isFogExp2,flatShading:D.wireframe===!1&&(D.flatShading===!0||X.attributes.normal===void 0&&ot===!1&&(D.isMeshLambertMaterial||D.isMeshPhongMaterial||D.isMeshStandardMaterial||D.isMeshPhysicalMaterial)),sizeAttenuation:D.sizeAttenuation===!0,logarithmicDepthBuffer:A,reversedDepthBuffer:Ce,skinning:V.isSkinnedMesh===!0,hasPositionAttribute:X.attributes.position!==void 0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:Te,numSunLights:B.sun.length,numDirLights:B.directional.length,numPointLights:B.point.length,numSpotLights:B.spot.length,numSpotLightMaps:B.spotLightMap.length,numRectAreaLights:B.rectArea.length,numHemiLights:B.hemi.length,numSunLightShadows:B.sunShadowMap.length,numDirLightShadows:B.directionalShadowMap.length,numPointLightShadows:B.pointShadowMap.length,numSpotLightShadows:B.spotShadowMap.length,numSpotLightShadowsWithMaps:B.numSpotLightShadowsWithMaps,numLightProbes:B.numLightProbes,numLightProbeGrids:Y.filter((De)=>De.texture!==null).length,numClippingPlanes:v.numPlanes,numClipIntersection:v.numIntersection,dithering:D.dithering,shadowMapEnabled:m.shadowMap.enabled&&z.length>0,shadowMapType:m.shadowMap.type,toneMapping:Ne,decodeVideoTexture:Be&&D.map.isVideoTexture===!0&&ut.getTransfer(D.map.colorSpace)===Nt,decodeVideoTextureEmissive:bt&&D.emissiveMap.isVideoTexture===!0&&ut.getTransfer(D.emissiveMap.colorSpace)===Nt,premultipliedAlpha:D.premultipliedAlpha,doubleSided:D.side===In,flipSided:D.side===Mn,useDepthPacking:D.depthPacking>=0,depthPacking:D.depthPacking||0,index0AttributeName:D.index0AttributeName,extensionClipCullDistance:Ve&&D.extensions.clipCullDistance===!0&&_.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ve&&D.extensions.multiDraw===!0||tt)&&_.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:_.has("KHR_parallel_shader_compile"),customProgramCacheKey:D.customProgramCacheKey()};return at.vertexUv1s=M.has(1),at.vertexUv2s=M.has(2),at.vertexUv3s=M.has(3),M.clear(),at}function N(D){let B=[];if(D.shaderID)B.push(D.shaderID);else B.push(D.customVertexShaderID),B.push(D.customFragmentShaderID);if(D.defines!==void 0)for(let z in D.defines)B.push(z),B.push(D.defines[z]);if(D.isRawShaderMaterial===!1)C(B,D),I(B,D),B.push(m.outputColorSpace);return B.push(D.customProgramCacheKey),B.join()}function C(D,B){D.push(B.precision),D.push(B.outputColorSpace),D.push(B.envMapMode),D.push(B.envMapPMREM),D.push(B.envMapMaxLod),D.push(B.envMapSize),D.push(B.mapUv),D.push(B.alphaMapUv),D.push(B.lightMapUv),D.push(B.aoMapUv),D.push(B.bumpMapUv),D.push(B.normalMapUv),D.push(B.displacementMapUv),D.push(B.emissiveMapUv),D.push(B.metalnessMapUv),D.push(B.roughnessMapUv),D.push(B.anisotropyMapUv),D.push(B.clearcoatMapUv),D.push(B.clearcoatNormalMapUv),D.push(B.clearcoatRoughnessMapUv),D.push(B.diffuseRoughnessMapUv),D.push(B.iridescenceMapUv),D.push(B.iridescenceThicknessMapUv),D.push(B.sheenColorMapUv),D.push(B.sheenRoughnessMapUv),D.push(B.specularMapUv),D.push(B.specularColorMapUv),D.push(B.specularIntensityMapUv),D.push(B.transmissionMapUv),D.push(B.thicknessMapUv),D.push(B.combine),D.push(B.fogExp2),D.push(B.sizeAttenuation),D.push(B.morphTargetsCount),D.push(B.numSunLights),D.push(B.numDirLights),D.push(B.numPointLights),D.push(B.numSpotLights),D.push(B.numSpotLightMaps),D.push(B.numHemiLights),D.push(B.numRectAreaLights),D.push(B.numSunLightShadows),D.push(B.numDirLightShadows),D.push(B.numPointLightShadows),D.push(B.numSpotLightShadows),D.push(B.numSpotLightShadowsWithMaps),D.push(B.numLightProbes),D.push(B.numLightProbeGrids),D.push(B.shadowMapType),D.push(B.toneMapping),D.push(B.numClippingPlanes),D.push(B.numClipIntersection),D.push(B.depthPacking)}function I(D,B){if(b.disableAll(),B.instancing)b.enable(0);if(B.instancingColor)b.enable(1);if(B.instancingMorph)b.enable(2);if(B.matcap)b.enable(3);if(B.envMap)b.enable(4);if(B.normalMapObjectSpace)b.enable(5);if(B.normalMapTangentSpace)b.enable(6);if(B.clearcoat)b.enable(7);if(B.iridescence)b.enable(8);if(B.alphaTest)b.enable(9);if(B.vertexColors)b.enable(10);if(B.vertexAlphas)b.enable(11);if(B.vertexUv1s)b.enable(12);if(B.vertexUv2s)b.enable(13);if(B.vertexUv3s)b.enable(14);if(B.vertexTangents)b.enable(15);if(B.anisotropy)b.enable(16);if(B.alphaHash)b.enable(17);if(B.batching)b.enable(18);if(B.dispersion)b.enable(19);if(B.retroreflection)b.enable(24);if(B.diffuseRoughness)b.enable(25);if(B.batchingColor)b.enable(20);if(B.gradientMap)b.enable(21);if(B.packedNormalMap)b.enable(22);if(B.vertexNormals)b.enable(23);if(D.push(b.mask),b.disableAll(),B.fog)b.enable(0);if(B.useFog)b.enable(1);if(B.flatShading)b.enable(2);if(B.logarithmicDepthBuffer)b.enable(3);if(B.reversedDepthBuffer)b.enable(4);if(B.skinning)b.enable(5);if(B.morphTargets)b.enable(6);if(B.morphNormals)b.enable(7);if(B.morphColors)b.enable(8);if(B.premultipliedAlpha)b.enable(9);if(B.shadowMapEnabled)b.enable(10);if(B.doubleSided)b.enable(11);if(B.flipSided)b.enable(12);if(B.useDepthPacking)b.enable(13);if(B.dithering)b.enable(14);if(B.transmission)b.enable(15);if(B.sheen)b.enable(16);if(B.opaque)b.enable(17);if(B.pointsUvs)b.enable(18);if(B.decodeVideoTexture)b.enable(19);if(B.decodeVideoTextureEmissive)b.enable(20);if(B.alphaToCoverage)b.enable(21);if(B.numLightProbeGrids>0)b.enable(22);if(B.hasPositionAttribute)b.enable(23);D.push(b.mask)}function L(D){let B=T[D.type],z;if(B){let W=pi[B];z=Np.clone(W.uniforms)}else z=D.uniforms;return z}function U(D,B){let z=E.get(B);if(z!==void 0)++z.usedTimes;else z=new Qb(m,B,D,y),w.push(z),E.set(B,z);return z}function O(D){if(--D.usedTimes===0){let B=w.indexOf(D);w[B]=w[w.length-1],w.pop(),E.delete(D.cacheKey),D.destroy()}}function F(D){S.remove(D)}function k(){S.dispose()}return{getParameters:P,getProgramCacheKey:N,getUniforms:L,acquireProgram:U,releaseProgram:O,releaseShaderCache:F,programs:w,dispose:k}}function iS(){let m=new WeakMap;function g(b){return m.has(b)}function _(b){let S=m.get(b);if(S===void 0)S={},m.set(b,S);return S}function x(b){m.delete(b)}function y(b,S,M){m.get(b)[S]=M}function v(){m=new WeakMap}return{has:g,get:_,remove:x,update:y,dispose:v}}function sS(m,g){if(m.groupOrder!==g.groupOrder)return m.groupOrder-g.groupOrder;else if(m.renderOrder!==g.renderOrder)return m.renderOrder-g.renderOrder;else if(m.material.id!==g.material.id)return m.material.id-g.material.id;else if(m.materialVariant!==g.materialVariant)return m.materialVariant-g.materialVariant;else if(m.z!==g.z)return m.z-g.z;else return m.id-g.id}function im(m,g){if(m.groupOrder!==g.groupOrder)return m.groupOrder-g.groupOrder;else if(m.renderOrder!==g.renderOrder)return m.renderOrder-g.renderOrder;else if(m.z!==g.z)return g.z-m.z;else return m.id-g.id}function sm(){let m=[],g=0,_=[],x=[],y=[];function v(){g=0,_.length=0,x.length=0,y.length=0}function b(T){let R=0;if(T.isInstancedMesh)R+=2;if(T.isSkinnedMesh)R+=1;return R}function S(T,R,P,N,C,I){let L=m[g];if(L===void 0)L={id:T.id,object:T,geometry:R,material:P,materialVariant:b(T),groupOrder:N,renderOrder:T.renderOrder,z:C,group:I},m[g]=L;else L.id=T.id,L.object=T,L.geometry=R,L.material=P,L.materialVariant=b(T),L.groupOrder=N,L.renderOrder=T.renderOrder,L.z=C,L.group=I;return g++,L}function M(T,R,P,N,C,I,L){if(L.reversedDepth===!0)C=-C;let U=S(T,R,P,N,C,I);if(P.transmission>0)x.push(U);else if(P.transparent===!0)y.push(U);else _.push(U)}function w(T,R,P,N,C,I){let L=S(T,R,P,N,C,I);if(P.transmission>0)x.unshift(L);else if(P.transparent===!0)y.unshift(L);else _.unshift(L)}function E(T,R){if(_.length>1)_.sort(T||sS);if(x.length>1)x.sort(R||im);if(y.length>1)y.sort(R||im)}function A(){for(let T=g,R=m.length;T<R;T++){let P=m[T];if(P.id===null)break;P.id=null,P.object=null,P.geometry=null,P.material=null,P.group=null}}return{opaque:_,transmissive:x,transparent:y,init:v,push:M,unshift:w,finish:A,sort:E}}function rS(){let m=new WeakMap;function g(x,y){let v=m.get(x),b;if(v===void 0)b=new sm,m.set(x,[b]);else if(y>=v.length)b=new sm,v.push(b);else b=v[y];return b}function _(){m=new WeakMap}return{get:g,dispose:_}}function oS(){let m={};return{get:function(g){if(m[g.id]!==void 0)return m[g.id];let _;switch(g.type){case"SunLight":case"DirectionalLight":_={direction:new Z,color:new st};break;case"SpotLight":_={position:new Z,direction:new Z,color:new st,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":_={position:new Z,color:new st,distance:0,decay:0};break;case"HemisphereLight":_={direction:new Z,skyColor:new st,groundColor:new st};break;case"RectAreaLight":_={color:new st,position:new Z,halfWidth:new Z,halfHeight:new Z};break}return m[g.id]=_,_}}}function aS(){let m={};return{get:function(g){if(m[g.id]!==void 0)return m[g.id];let _;switch(g.type){case"SunLight":case"DirectionalLight":_={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e};break;case"SpotLight":_={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e};break;case"PointLight":_={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $e,shadowCameraNear:1,shadowCameraFar:1000};break}return m[g.id]=_,_}}}var lS=0;function cS(m,g){return(g.castShadow?2:0)-(m.castShadow?2:0)+(g.map?1:0)-(m.map?1:0)}function uS(m){let g=new oS,_=aS(),x={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let w=0;w<9;w++)x.probe.push(new Z);let y=new Z,v=new Qe,b=new Qe;function S(w){let E=0,A=0,T=0;for(let Y=0;Y<9;Y++)x.probe[Y].set(0,0,0);let R=0,P=0,N=0,C=0,I=0,L=0,U=0,O=0,F=0,k=0,D=0,B=0,z=0,W=0;w.sort(cS);for(let Y=0,ee=w.length;Y<ee;Y++){let X=w[Y],{color:ie,intensity:le,distance:te}=X,ve=null;if(X.shadow&&X.shadow.map)if(X.shadow.map.texture.format===bs)ve=X.shadow.map.texture;else ve=X.shadow.map.depthTexture||X.shadow.map.texture;if(X.isAmbientLight)E+=ie.r*le,A+=ie.g*le,T+=ie.b*le;else if(X.isLightProbe){for(let J=0;J<9;J++)x.probe[J].addScaledVector(X.sh.coefficients[J],le);W++}else if(X.isSunLight){let J=g.get(X);if(J.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){let ae=X.shadow,ge=_.get(X);ge.shadowIntensity=ae.intensity,ge.shadowBias=ae.bias,ge.shadowNormalBias=ae.normalBias,ge.shadowRadius=ae.radius,ge.shadowMapSize.copy(ae.mapSize).multiply(ae.getFrameExtents()),x.sunShadow[P]=ge,x.sunShadowMap[P]=ve;let Te=ae.getViewportCount();for(let ce=0;ce<Te;ce++)x.sunShadowMatrix[N+ce]=ae.getMatrix(ce),x.sunShadowCascade[N+ce]=ae._cascadeData[ce];N+=Te,P++}x.sun[R]=J,R++}else if(X.isDirectionalLight){let J=g.get(X);if(J.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){let ae=X.shadow,ge=_.get(X);ge.shadowIntensity=ae.intensity,ge.shadowBias=ae.bias,ge.shadowNormalBias=ae.normalBias,ge.shadowRadius=ae.radius,ge.shadowMapSize=ae.mapSize,x.directionalShadow[C]=ge,x.directionalShadowMap[C]=ve,x.directionalShadowMatrix[C]=X.shadow.matrix,F++}x.directional[C]=J,C++}else if(X.isSpotLight){let J=g.get(X);J.position.setFromMatrixPosition(X.matrixWorld),J.color.copy(ie).multiplyScalar(le),J.distance=te,J.coneCos=Math.cos(X.angle),J.penumbraCos=Math.cos(X.angle*(1-X.penumbra)),J.decay=X.decay,x.spot[L]=J;let ae=X.shadow;if(X.map){if(x.spotLightMap[B]=X.map,B++,ae.updateMatrices(X),X.castShadow)z++}if(x.spotLightMatrix[L]=ae.matrix,X.castShadow){let ge=_.get(X);ge.shadowIntensity=ae.intensity,ge.shadowBias=ae.bias,ge.shadowNormalBias=ae.normalBias,ge.shadowRadius=ae.radius,ge.shadowMapSize=ae.mapSize,x.spotShadow[L]=ge,x.spotShadowMap[L]=ve,D++}L++}else if(X.isRectAreaLight){let J=g.get(X);J.color.copy(ie).multiplyScalar(le),J.halfWidth.set(X.width*0.5,0,0),J.halfHeight.set(0,X.height*0.5,0),x.rectArea[U]=J,U++}else if(X.isPointLight){let J=g.get(X);if(J.color.copy(X.color).multiplyScalar(X.intensity),J.distance=X.distance,J.decay=X.decay,X.castShadow){let ae=X.shadow,ge=_.get(X);ge.shadowIntensity=ae.intensity,ge.shadowBias=ae.bias,ge.shadowNormalBias=ae.normalBias,ge.shadowRadius=ae.radius,ge.shadowMapSize=ae.mapSize,ge.shadowCameraNear=ae.camera.near,ge.shadowCameraFar=ae.camera.far,x.pointShadow[I]=ge,x.pointShadowMap[I]=ve,x.pointShadowMatrix[I]=X.shadow.matrix,k++}x.point[I]=J,I++}else if(X.isHemisphereLight){let J=g.get(X);J.skyColor.copy(X.color).multiplyScalar(le),J.groundColor.copy(X.groundColor).multiplyScalar(le),x.hemi[O]=J,O++}}if(U>0)if(m.has("OES_texture_float_linear")===!0)x.rectAreaLTC1=Le.LTC_FLOAT_1,x.rectAreaLTC2=Le.LTC_FLOAT_2;else x.rectAreaLTC1=Le.LTC_HALF_1,x.rectAreaLTC2=Le.LTC_HALF_2;x.ambient[0]=E,x.ambient[1]=A,x.ambient[2]=T;let V=x.hash;if(V.sunLength!==R||V.directionalLength!==C||V.pointLength!==I||V.spotLength!==L||V.rectAreaLength!==U||V.hemiLength!==O||V.numSunShadows!==P||V.numDirectionalShadows!==F||V.numPointShadows!==k||V.numSpotShadows!==D||V.numSpotMaps!==B||V.numLightProbes!==W)x.sun.length=R,x.directional.length=C,x.spot.length=L,x.rectArea.length=U,x.point.length=I,x.hemi.length=O,x.sunShadow.length=P,x.sunShadowMap.length=P,x.sunShadowMatrix.length=N,x.sunShadowCascade.length=N,x.directionalShadow.length=F,x.directionalShadowMap.length=F,x.directionalShadowMatrix.length=F,x.pointShadow.length=k,x.pointShadowMap.length=k,x.pointShadowMatrix.length=k,x.spotShadow.length=D,x.spotShadowMap.length=D,x.spotLightMatrix.length=D+B-z,x.spotLightMap.length=B,x.numSpotLightShadowsWithMaps=z,x.numLightProbes=W,V.sunLength=R,V.directionalLength=C,V.pointLength=I,V.spotLength=L,V.rectAreaLength=U,V.hemiLength=O,V.numSunShadows=P,V.numDirectionalShadows=F,V.numPointShadows=k,V.numSpotShadows=D,V.numSpotMaps=B,V.numLightProbes=W,x.version=lS++}function M(w,E){let A=0,T=0,R=0,P=0,N=0,C=0,I=E.matrixWorldInverse;for(let L=0,U=w.length;L<U;L++){let O=w[L];if(O.isSunLight){let F=x.sun[A];F.direction.setFromMatrixPosition(O.matrixWorld),F.direction.transformDirection(I),A++}else if(O.isDirectionalLight){let F=x.directional[T];F.direction.setFromMatrixPosition(O.matrixWorld),y.setFromMatrixPosition(O.target.matrixWorld),F.direction.sub(y),F.direction.transformDirection(I),T++}else if(O.isSpotLight){let F=x.spot[P];F.position.setFromMatrixPosition(O.matrixWorld),F.position.applyMatrix4(I),F.direction.setFromMatrixPosition(O.matrixWorld),y.setFromMatrixPosition(O.target.matrixWorld),F.direction.sub(y),F.direction.transformDirection(I),P++}else if(O.isRectAreaLight){let F=x.rectArea[N];F.position.setFromMatrixPosition(O.matrixWorld),F.position.applyMatrix4(I),b.identity(),v.copy(O.matrixWorld),v.premultiply(I),b.extractRotation(v),F.halfWidth.set(O.width*0.5,0,0),F.halfHeight.set(0,O.height*0.5,0),F.halfWidth.applyMatrix4(b),F.halfHeight.applyMatrix4(b),N++}else if(O.isPointLight){let F=x.point[R];F.position.setFromMatrixPosition(O.matrixWorld),F.position.applyMatrix4(I),R++}else if(O.isHemisphereLight){let F=x.hemi[C];F.direction.setFromMatrixPosition(O.matrixWorld),F.direction.transformDirection(I),C++}}}return{setup:S,setupView:M,state:x}}function rm(m){let g=new uS(m),_=[],x=[],y=[];function v(A){E.camera=A,_.length=0,x.length=0,y.length=0}function b(A){if(A.isLightProbeGrid)y.push(A);else _.push(A)}function S(A){x.push(A)}function M(){g.setup(_),y.sort((A,T)=>A.priority-T.priority||A.id-T.id)}function w(A){g.setupView(_,A)}let E={lightsArray:_,shadowsArray:x,lightProbeGridArray:y,camera:null,lights:g,transmissionRenderTarget:{},textureUnits:0};return{init:v,state:E,setupLights:M,setupLightsView:w,pushLight:b,pushShadow:S}}function hS(m){let g=new WeakMap;function _(y,v=0){let b=g.get(y),S;if(b===void 0)S=new rm(m),g.set(y,[S]);else if(v>=b.length)S=new rm(m),b.push(S);else S=b[v];return S}function x(){g=new WeakMap}return{get:_,dispose:x}}var dS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fS=`uniform sampler2D shadow_pass;
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
}`,pS=[new Z(1,0,0),new Z(-1,0,0),new Z(0,1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1)],mS=[new Z(0,-1,0),new Z(0,-1,0),new Z(0,0,1),new Z(0,0,-1),new Z(0,-1,0),new Z(0,-1,0)],om=new Qe,mo=new Z,sh=new Z;function gS(m,g,_){let x=new $i,y=new $e,v=new $e,b=new Ht,S=new zu,M=new Hu,w={},E=_.maxTextureSize,A={[Ri]:Mn,[Mn]:Ri,[In]:In},T=new Ui({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $e},radius:{value:4}},vertexShader:dS,fragmentShader:fS}),R=T.clone();R.defines.HORIZONTAL_PASS=1;let P=new sn;P.setAttribute("position",new Qt(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let N=new Xt(P,T),C=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jr;let I=this.type;this.render=function(k,D,B){if(C.enabled===!1)return;if(C.autoUpdate===!1&&C.needsUpdate===!1)return;if(k.length===0)return;if(this.type===Of)qe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Jr;let z=m.getRenderTarget(),W=m.getActiveCubeFace(),V=m.getActiveMipmapLevel(),Y=m.state;if(Y.setBlending(ys),Y.buffers.depth.getReversed()===!0)Y.buffers.color.setClear(0,0,0,0);else Y.buffers.color.setClear(1,1,1,1);Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);let ee=I!==this.type;if(ee)D.traverse(function(X){if(X.material)if(Array.isArray(X.material))X.material.forEach((ie)=>ie.needsUpdate=!0);else X.material.needsUpdate=!0});for(let X=0,ie=k.length;X<ie;X++){let le=k[X],te=le.shadow;if(te===void 0){qe("WebGLShadowMap:",le,"has no shadow.");continue}if(te.autoUpdate===!1&&te.needsUpdate===!1)continue;y.copy(te.mapSize);let ve=te.getFrameExtents();if(y.multiply(ve),v.copy(te.mapSize),y.x>E||y.y>E){if(y.x>E)v.x=Math.floor(E/ve.x),y.x=v.x*ve.x,te.mapSize.x=v.x;if(y.y>E)v.y=Math.floor(E/ve.y),y.y=v.y*ve.y,te.mapSize.y=v.y}let J=m.state.buffers.depth.getReversed();if(te.camera._reversedDepth=J,te.map===null||ee===!0){if(te.map!==null){if(te.map.depthTexture!==null)te.map.depthTexture.dispose(),te.map.depthTexture=null;te.map.dispose()}if(this.type===nr){if(le.isPointLight){qe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}te.map=new $n(y.x,y.y,{format:bs,type:di,minFilter:wn,magFilter:wn,generateMipmaps:!1}),te.map.texture.name=le.name+".shadowMap",te.map.depthTexture=new ts(y.x,y.y,Ci),te.map.depthTexture.name=le.name+".shadowMapDepth",te.map.depthTexture.format=or,te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=Zi,te.map.depthTexture.magFilter=Zi}else{if(le.isPointLight)te.map=new Za(y.x),te.map.depthTexture=new Da(y.x,Ji);else te.map=new $n(y.x,y.y),te.map.depthTexture=new ts(y.x,y.y,Ji);if(te.map.depthTexture.name=le.name+".shadowMap",te.map.depthTexture.format=or,this.type===Jr)te.map.depthTexture.compareFunction=J?Au:Tu,te.map.depthTexture.minFilter=wn,te.map.depthTexture.magFilter=wn;else te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=Zi,te.map.depthTexture.magFilter=Zi}te.camera.updateProjectionMatrix()}if(te.map.isWebGLCubeRenderTarget!==!0&&(te.map.width!==y.x||te.map.height!==y.y))te.map.setSize(y.x,y.y);let ae=te.map.isWebGLCubeRenderTarget?6:te.getViewportCount();if(le.isPointLight!==!0)te.updateMatrices(le,B);let ge=(te.camera.layers.mask&4294967294)!==0?te.camera.layers:B.layers;for(let Te=0;Te<ae;Te++){let ce=te.getCamera(Te);if(le.isPointLight){let{camera:ye,matrix:Ie}=te,xe=le.distance||ye.far;if(xe!==ye.far)ye.far=xe,ye.updateProjectionMatrix();mo.setFromMatrixPosition(le.matrixWorld),ye.position.copy(mo),sh.copy(ye.position),sh.add(pS[Te]),ye.up.copy(mS[Te]),ye.lookAt(sh),ye.updateMatrixWorld(),Ie.makeTranslation(-mo.x,-mo.y,-mo.z),om.multiplyMatrices(ye.projectionMatrix,ye.matrixWorldInverse),te._frustum.setFromProjectionMatrix(om,ye.coordinateSystem,ye.reversedDepth)}if(te.map.isWebGLCubeRenderTarget)m.setRenderTarget(te.map,Te),m.clear();else{if(Te===0)m.setRenderTarget(te.map),m.clear();let ye=te.getViewport(Te);b.set(v.x*ye.x,v.y*ye.y,v.x*ye.z,v.y*ye.w),Y.viewport(b)}x=te.getFrustum(Te),O(D,B,ce,le,ge,this.type)}if(te.isPointLightShadow!==!0&&this.type===nr)L(te,B);te.needsUpdate=!1}I=this.type,C.needsUpdate=!1,m.setRenderTarget(z,W,V)};function L(k,D){let B=g.update(N);if(T.defines.VSM_SAMPLES!==k.blurSamples)T.defines.VSM_SAMPLES=k.blurSamples,R.defines.VSM_SAMPLES=k.blurSamples,T.needsUpdate=!0,R.needsUpdate=!0;if(k.mapPass===null)k.mapPass=new $n(y.x,y.y,{format:bs,type:di});else if(k.mapPass.width!==k.map.width||k.mapPass.height!==k.map.height)k.mapPass.setSize(k.map.width,k.map.height);T.uniforms.shadow_pass.value=k.map.depthTexture,T.uniforms.resolution.value.set(k.map.width,k.map.height),T.uniforms.radius.value=k.radius,m.setRenderTarget(k.mapPass),m.clear(),m.renderBufferDirect(D,null,B,T,N,null),R.uniforms.shadow_pass.value=k.mapPass.texture,R.uniforms.resolution.value.set(k.map.width,k.map.height),R.uniforms.radius.value=k.radius,m.setRenderTarget(k.map),m.clear(),m.renderBufferDirect(D,null,B,R,N,null)}function U(k,D,B,z){let W=null,V=B.isPointLight===!0?k.customDistanceMaterial:k.customDepthMaterial;if(V!==void 0)W=V;else if(W=B.isPointLight===!0?M:S,m.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){let Y=W.uuid,ee=D.uuid,X=w[Y];if(X===void 0)X={},w[Y]=X;let ie=X[ee];if(ie===void 0)ie=W.clone(),X[ee]=ie,D.addEventListener("dispose",F);W=ie}if(W.visible=D.visible,W.wireframe=D.wireframe,z===nr)W.side=D.shadowSide!==null?D.shadowSide:D.side;else W.side=D.shadowSide!==null?D.shadowSide:A[D.side];if(W.alphaMap=D.alphaMap,W.alphaTest=D.alphaToCoverage===!0?0.5:D.alphaTest,W.map=D.map,W.clipShadows=D.clipShadows,W.clippingPlanes=D.clippingPlanes,W.clipIntersection=D.clipIntersection,W.displacementMap=D.displacementMap,W.displacementScale=D.displacementScale,W.displacementBias=D.displacementBias,W.wireframeLinewidth=D.wireframeLinewidth,W.linewidth=D.linewidth,B.isPointLight===!0&&W.isMeshDistanceMaterial===!0){let Y=m.properties.get(W);Y.light=B}return W}function O(k,D,B,z,W,V){if(k.visible===!1)return;if(k.layers.test(W)&&(k.isMesh||k.isLine||k.isPoints)){if((k.castShadow||k.receiveShadow&&V===nr)&&(!k.frustumCulled||k.intersectsFrustum(x))){k.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,k.matrixWorld);let X=g.update(k),ie=k.material;if(Array.isArray(ie)){let le=X.groups;for(let te=0,ve=le.length;te<ve;te++){let J=le[te],ae=ie[J.materialIndex];if(ae&&ae.visible){let ge=U(k,ae,z,V);k.onBeforeShadow(m,k,D,B,X,ge,J),m.renderBufferDirect(B,null,X,ge,k,J),k.onAfterShadow(m,k,D,B,X,ge,J)}}}else if(ie.visible){let le=U(k,ie,z,V);k.onBeforeShadow(m,k,D,B,X,le,null),m.renderBufferDirect(B,null,X,le,k,null),k.onAfterShadow(m,k,D,B,X,le,null)}}}let ee=k.children;for(let X=0,ie=ee.length;X<ie;X++)O(ee[X],D,B,z,W,V)}function F(k){k.target.removeEventListener("dispose",F);for(let B in w){let z=w[B],W=k.target.uuid;if(W in z)z[W].dispose(),delete z[W]}}}function _S(m,g){function _(){let K=!1,fe=new Ht,de=null,ne=new Ht(0,0,0,0);return{setMask:function(me){if(de!==me&&!K)m.colorMask(me,me,me,me),de=me},setLocked:function(me){K=me},setClear:function(me,be,ke,Ve,Ne){if(Ne===!0)me*=Ve,be*=Ve,ke*=Ve;if(fe.set(me,be,ke,Ve),ne.equals(fe)===!1)m.clearColor(me,be,ke,Ve),ne.copy(fe)},reset:function(){K=!1,de=null,ne.set(-1,0,0,0)}}}function x(){let K=!1,fe=!1,de=null,ne=null,me=null;return{setReversed:function(be){if(fe!==be){let ke=g.get("EXT_clip_control");if(be)ke.clipControlEXT(ke.LOWER_LEFT_EXT,ke.ZERO_TO_ONE_EXT);else ke.clipControlEXT(ke.LOWER_LEFT_EXT,ke.NEGATIVE_ONE_TO_ONE_EXT);fe=be;let Ve=me;me=null,this.setClear(Ve)}},getReversed:function(){return fe},setTest:function(be){if(be)Ce(m.DEPTH_TEST);else rt(m.DEPTH_TEST)},setMask:function(be){if(de!==be&&!K)m.depthMask(be),de=be},setFunc:function(be){if(fe)be=Pp[be];if(ne!==be){switch(be){case np:m.depthFunc(m.NEVER);break;case ip:m.depthFunc(m.ALWAYS);break;case sp:m.depthFunc(m.LESS);break;case Uc:m.depthFunc(m.LEQUAL);break;case rp:m.depthFunc(m.EQUAL);break;case op:m.depthFunc(m.GEQUAL);break;case ap:m.depthFunc(m.GREATER);break;case lp:m.depthFunc(m.NOTEQUAL);break;default:m.depthFunc(m.LEQUAL)}ne=be}},setLocked:function(be){K=be},setClear:function(be){if(me!==be){if(me=be,fe)be=1-be;m.clearDepth(be)}},reset:function(){K=!1,de=null,ne=null,me=null,fe=!1}}}function y(){let K=!1,fe=null,de=null,ne=null,me=null,be=null,ke=null,Ve=null,Ne=null;return{setTest:function(Xe){if(!K)if(Xe)Ce(m.STENCIL_TEST);else rt(m.STENCIL_TEST)},setMask:function(Xe){if(fe!==Xe&&!K)m.stencilMask(Xe),fe=Xe},setFunc:function(Xe,at,De){if(de!==Xe||ne!==at||me!==De)m.stencilFunc(Xe,at,De),de=Xe,ne=at,me=De},setOp:function(Xe,at,De){if(be!==Xe||ke!==at||Ve!==De)m.stencilOp(Xe,at,De),be=Xe,ke=at,Ve=De},setLocked:function(Xe){K=Xe},setClear:function(Xe){if(Ne!==Xe)m.clearStencil(Xe),Ne=Xe},reset:function(){K=!1,fe=null,de=null,ne=null,me=null,be=null,ke=null,Ve=null,Ne=null}}}let v=new _,b=new x,S=new y,M={},w=new WeakMap,E={},A={},T={},R=new WeakMap,P=[],N=null,C=!1,I=null,L=null,U=null,O=null,F=null,k=null,D=null,B=new st(0,0,0),z=0,W=!1,V=null,Y=null,ee=null,X=null,ie=null,le=m.getParameter(m.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,ve=0,J=m.getParameter(m.VERSION);if(J.indexOf("WebGL")!==-1)ve=parseFloat(/^WebGL (\d)/.exec(J)[1]),te=ve>=1;else if(J.indexOf("OpenGL ES")!==-1)ve=parseFloat(/^OpenGL ES (\d)/.exec(J)[1]),te=ve>=2;let ae=null,ge={},Te=m.getParameter(m.SCISSOR_BOX),ce=m.getParameter(m.VIEWPORT),ye=new Ht().fromArray(Te),Ie=new Ht().fromArray(ce);function xe(K,fe,de,ne){let me=new Uint8Array(4),be=m.createTexture();m.bindTexture(K,be),m.texParameteri(K,m.TEXTURE_MIN_FILTER,m.NEAREST),m.texParameteri(K,m.TEXTURE_MAG_FILTER,m.NEAREST);for(let ke=0;ke<de;ke++)if(K===m.TEXTURE_3D||K===m.TEXTURE_2D_ARRAY)m.texImage3D(fe,0,m.RGBA,1,1,ne,0,m.RGBA,m.UNSIGNED_BYTE,me);else m.texImage2D(fe+ke,0,m.RGBA,1,1,0,m.RGBA,m.UNSIGNED_BYTE,me);return be}let Ue={};Ue[m.TEXTURE_2D]=xe(m.TEXTURE_2D,m.TEXTURE_2D,1),Ue[m.TEXTURE_CUBE_MAP]=xe(m.TEXTURE_CUBE_MAP,m.TEXTURE_CUBE_MAP_POSITIVE_X,6),Ue[m.TEXTURE_2D_ARRAY]=xe(m.TEXTURE_2D_ARRAY,m.TEXTURE_2D_ARRAY,1,1),Ue[m.TEXTURE_3D]=xe(m.TEXTURE_3D,m.TEXTURE_3D,1,1),v.setClear(0,0,0,1),b.setClear(1),S.setClear(0),Ce(m.DEPTH_TEST),b.setFunc(Uc),_t(!1),ot(Lc),Ce(m.CULL_FACE),pt(ys);function Ce(K){if(E[K]!==!0)m.enable(K),E[K]=!0}function rt(K){if(E[K]!==!1)m.disable(K),E[K]=!1}function tt(K,fe){if(T[K]!==fe){if(m.bindFramebuffer(K,fe),T[K]=fe,K===m.DRAW_FRAMEBUFFER)T[m.FRAMEBUFFER]=fe;if(K===m.FRAMEBUFFER)T[m.DRAW_FRAMEBUFFER]=fe;return!0}return!1}function Be(K,fe){let de=P,ne=!1;if(K){if(de=R.get(fe),de===void 0)de=[],R.set(fe,de);let me=K.textures;if(de.length!==me.length||de[0]!==m.COLOR_ATTACHMENT0){for(let be=0,ke=me.length;be<ke;be++)de[be]=m.COLOR_ATTACHMENT0+be;de.length=me.length,ne=!0}}else if(de[0]!==m.BACK)de[0]=m.BACK,ne=!0;if(ne)m.drawBuffers(de)}function Ke(K){if(N!==K)return m.useProgram(K),N=K,!0;return!1}let Ye={[ir]:m.FUNC_ADD,[Ff]:m.FUNC_SUBTRACT,[Bf]:m.FUNC_REVERSE_SUBTRACT};Ye[kf]=m.MIN,Ye[zf]=m.MAX;let Ze={[Hf]:m.ZERO,[Gf]:m.ONE,[Vf]:m.SRC_COLOR,[Xf]:m.SRC_ALPHA,[Kf]:m.SRC_ALPHA_SATURATE,[Zf]:m.DST_COLOR,[Yf]:m.DST_ALPHA,[Wf]:m.ONE_MINUS_SRC_COLOR,[qf]:m.ONE_MINUS_SRC_ALPHA,[Jf]:m.ONE_MINUS_DST_COLOR,[$f]:m.ONE_MINUS_DST_ALPHA,[jf]:m.CONSTANT_COLOR,[Qf]:m.ONE_MINUS_CONSTANT_COLOR,[ep]:m.CONSTANT_ALPHA,[tp]:m.ONE_MINUS_CONSTANT_ALPHA};function pt(K,fe,de,ne,me,be,ke,Ve,Ne,Xe){if(K===ys){if(C===!0)rt(m.BLEND),C=!1;return}if(C===!1)Ce(m.BLEND),C=!0;if(K!==Uf){if(K!==I||Xe!==W){if(L!==ir||F!==ir)m.blendEquation(m.FUNC_ADD),L=ir,F=ir;if(Xe)switch(K){case Kr:m.blendFuncSeparate(m.ONE,m.ONE_MINUS_SRC_ALPHA,m.ONE,m.ONE_MINUS_SRC_ALPHA);break;case Nc:m.blendFunc(m.ONE,m.ONE);break;case Dc:m.blendFuncSeparate(m.ZERO,m.ONE_MINUS_SRC_COLOR,m.ZERO,m.ONE);break;case Oc:m.blendFuncSeparate(m.DST_COLOR,m.ONE_MINUS_SRC_ALPHA,m.ZERO,m.ONE);break;default:Je("WebGLState: Invalid blending: ",K);break}else switch(K){case Kr:m.blendFuncSeparate(m.SRC_ALPHA,m.ONE_MINUS_SRC_ALPHA,m.ONE,m.ONE_MINUS_SRC_ALPHA);break;case Nc:m.blendFuncSeparate(m.SRC_ALPHA,m.ONE,m.ONE,m.ONE);break;case Dc:Je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Oc:Je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Je("WebGLState: Invalid blending: ",K);break}U=null,O=null,k=null,D=null,B.set(0,0,0),z=0,I=K,W=Xe}return}if(me=me||fe,be=be||de,ke=ke||ne,fe!==L||me!==F)m.blendEquationSeparate(Ye[fe],Ye[me]),L=fe,F=me;if(de!==U||ne!==O||be!==k||ke!==D)m.blendFuncSeparate(Ze[de],Ze[ne],Ze[be],Ze[ke]),U=de,O=ne,k=be,D=ke;if(Ve.equals(B)===!1||Ne!==z)m.blendColor(Ve.r,Ve.g,Ve.b,Ne),B.copy(Ve),z=Ne;I=K,W=!1}function vt(K,fe){K.side===In?rt(m.CULL_FACE):Ce(m.CULL_FACE);let de=K.side===Mn;if(fe)de=!de;_t(de),K.blending===Kr&&K.transparent===!1?pt(ys):pt(K.blending,K.blendEquation,K.blendSrc,K.blendDst,K.blendEquationAlpha,K.blendSrcAlpha,K.blendDstAlpha,K.blendColor,K.blendAlpha,K.premultipliedAlpha),b.setFunc(K.depthFunc),b.setTest(K.depthTest),b.setMask(K.depthWrite),v.setMask(K.colorWrite);let ne=K.stencilWrite;if(S.setTest(ne),ne)S.setMask(K.stencilWriteMask),S.setFunc(K.stencilFunc,K.stencilRef,K.stencilFuncMask),S.setOp(K.stencilFail,K.stencilZFail,K.stencilZPass);bt(K.polygonOffset,K.polygonOffsetFactor,K.polygonOffsetUnits),K.alphaToCoverage===!0?Ce(m.SAMPLE_ALPHA_TO_COVERAGE):rt(m.SAMPLE_ALPHA_TO_COVERAGE)}function _t(K){if(V!==K){if(K)m.frontFace(m.CW);else m.frontFace(m.CCW);V=K}}function ot(K){if(K!==Nf){if(Ce(m.CULL_FACE),K!==Y)if(K===Lc)m.cullFace(m.BACK);else if(K===Df)m.cullFace(m.FRONT);else m.cullFace(m.FRONT_AND_BACK)}else rt(m.CULL_FACE);Y=K}function ct(K){if(K!==ee){if(te)m.lineWidth(K);ee=K}}function bt(K,fe,de){if(K){if(Ce(m.POLYGON_OFFSET_FILL),X!==fe||ie!==de){if(X=fe,ie=de,b.getReversed())fe=-fe,de=-de;m.polygonOffset(fe,de)}}else rt(m.POLYGON_OFFSET_FILL)}function kt(K){if(K)Ce(m.SCISSOR_TEST);else rt(m.SCISSOR_TEST)}function Ut(K){if(K===void 0)K=m.TEXTURE0+le-1;if(ae!==K)m.activeTexture(K),ae=K}function Q(K,fe,de){if(de===void 0)if(ae===null)de=m.TEXTURE0+le-1;else de=ae;let ne=ge[de];if(ne===void 0)ne={type:void 0,texture:void 0},ge[de]=ne;if(ne.type!==K||ne.texture!==fe){if(ae!==de)m.activeTexture(de),ae=de;m.bindTexture(K,fe||Ue[K]),ne.type=K,ne.texture=fe}}function $t(){let K=ge[ae];if(K!==void 0&&K.type!==void 0)m.bindTexture(K.type,null),K.type=void 0,K.texture=void 0}function mt(){try{m.compressedTexImage2D(...arguments)}catch(K){Je("WebGLState:",K)}}function Wt(){try{m.compressedTexImage3D(...arguments)}catch(K){Je("WebGLState:",K)}}function Pe(){try{m.texSubImage2D(...arguments)}catch(K){Je("WebGLState:",K)}}function Tt(){try{m.texSubImage3D(...arguments)}catch(K){Je("WebGLState:",K)}}function Ge(){try{m.compressedTexSubImage2D(...arguments)}catch(K){Je("WebGLState:",K)}}function je(){try{m.compressedTexSubImage3D(...arguments)}catch(K){Je("WebGLState:",K)}}function en(){try{m.texStorage2D(...arguments)}catch(K){Je("WebGLState:",K)}}function q(){try{m.texStorage3D(...arguments)}catch(K){Je("WebGLState:",K)}}function H(){try{m.texImage2D(...arguments)}catch(K){Je("WebGLState:",K)}}function se(){try{m.texImage3D(...arguments)}catch(K){Je("WebGLState:",K)}}function Se(K){if(A[K]!==void 0)return A[K];else return m.getParameter(K)}function _e(K,fe){if(A[K]!==fe)m.pixelStorei(K,fe),A[K]=fe}function we(K){if(ye.equals(K)===!1)m.scissor(K.x,K.y,K.z,K.w),ye.copy(K)}function Me(K){if(Ie.equals(K)===!1)m.viewport(K.x,K.y,K.z,K.w),Ie.copy(K)}function ue(K,fe){let de=w.get(fe);if(de===void 0)de=new WeakMap,w.set(fe,de);let ne=de.get(K);if(ne===void 0)ne=m.getUniformBlockIndex(fe,K.name),m.uniformBlockBinding(fe,ne,ne),de.set(K,ne)}function pe(K,fe,de){let me=w.get(fe).get(K);if(M[me]!==de)m.bindBufferBase(m.UNIFORM_BUFFER,me,de),M[me]=de}function Ee(){m.disable(m.BLEND),m.disable(m.CULL_FACE),m.disable(m.DEPTH_TEST),m.disable(m.POLYGON_OFFSET_FILL),m.disable(m.SCISSOR_TEST),m.disable(m.STENCIL_TEST),m.disable(m.SAMPLE_ALPHA_TO_COVERAGE),m.blendEquation(m.FUNC_ADD),m.blendFunc(m.ONE,m.ZERO),m.blendFuncSeparate(m.ONE,m.ZERO,m.ONE,m.ZERO),m.blendColor(0,0,0,0),m.colorMask(!0,!0,!0,!0),m.clearColor(0,0,0,0),m.depthMask(!0),m.depthFunc(m.LESS),b.setReversed(!1),m.clearDepth(1),m.stencilMask(4294967295),m.stencilFunc(m.ALWAYS,0,4294967295),m.stencilOp(m.KEEP,m.KEEP,m.KEEP),m.clearStencil(0),m.cullFace(m.BACK),m.frontFace(m.CCW),m.polygonOffset(0,0),m.activeTexture(m.TEXTURE0),m.bindFramebuffer(m.FRAMEBUFFER,null),m.bindFramebuffer(m.DRAW_FRAMEBUFFER,null),m.bindFramebuffer(m.READ_FRAMEBUFFER,null),m.useProgram(null),m.lineWidth(1),m.scissor(0,0,m.canvas.width,m.canvas.height),m.viewport(0,0,m.canvas.width,m.canvas.height),m.pixelStorei(m.PACK_ALIGNMENT,4),m.pixelStorei(m.UNPACK_ALIGNMENT,4),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,!1),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),m.pixelStorei(m.UNPACK_COLORSPACE_CONVERSION_WEBGL,m.BROWSER_DEFAULT_WEBGL),m.pixelStorei(m.PACK_ROW_LENGTH,0),m.pixelStorei(m.PACK_SKIP_PIXELS,0),m.pixelStorei(m.PACK_SKIP_ROWS,0),m.pixelStorei(m.UNPACK_ROW_LENGTH,0),m.pixelStorei(m.UNPACK_IMAGE_HEIGHT,0),m.pixelStorei(m.UNPACK_SKIP_PIXELS,0),m.pixelStorei(m.UNPACK_SKIP_ROWS,0),m.pixelStorei(m.UNPACK_SKIP_IMAGES,0),E={},A={},ae=null,ge={},T={},M={},R=new WeakMap,P=[],N=null,C=!1,I=null,L=null,U=null,O=null,F=null,k=null,D=null,B=new st(0,0,0),z=0,W=!1,V=null,Y=null,ee=null,X=null,ie=null,ye.set(0,0,m.canvas.width,m.canvas.height),Ie.set(0,0,m.canvas.width,m.canvas.height),v.reset(),b.reset(),S.reset()}return{buffers:{color:v,depth:b,stencil:S},enable:Ce,disable:rt,bindFramebuffer:tt,drawBuffers:Be,useProgram:Ke,setBlending:pt,setMaterial:vt,setFlipSided:_t,setCullFace:ot,setLineWidth:ct,setPolygonOffset:bt,setScissorTest:kt,activeTexture:Ut,bindTexture:Q,unbindTexture:$t,compressedTexImage2D:mt,compressedTexImage3D:Wt,texImage2D:H,texImage3D:se,pixelStorei:_e,getParameter:Se,updateUBOMapping:ue,uniformBlockBinding:pe,texStorage2D:en,texStorage3D:q,texSubImage2D:Pe,texSubImage3D:Tt,compressedTexSubImage2D:Ge,compressedTexSubImage3D:je,scissor:we,viewport:Me,reset:Ee}}function xS(m,g,_,x,y,v,b){let S=g.has("WEBGL_multisampled_render_to_texture")?g.get("WEBGL_multisampled_render_to_texture"):null,M=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),w=new $e,E=new WeakMap,A=new Set,T,R=new WeakMap,P=new Set,N=new FinalizationRegistry((q)=>P.delete(q)),C=!1;try{C=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(q){}function I(q,H){return C?new OffscreenCanvas(q,H):$r("canvas")}function L(q,H,se){let Se=1,_e=en(q);if(_e.width>se||_e.height>se)Se=se/Math.max(_e.width,_e.height);if(Se<1)if(typeof HTMLImageElement<"u"&&q instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&q instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&q instanceof ImageBitmap||typeof VideoFrame<"u"&&q instanceof VideoFrame){let we=Math.floor(Se*_e.width),Me=Math.floor(Se*_e.height);if(T===void 0)T=I(we,Me);let ue=H?I(we,Me):T;return ue.width=we,ue.height=Me,ue.getContext("2d").drawImage(q,0,0,we,Me),qe("WebGLRenderer: Texture has been resized from ("+_e.width+"x"+_e.height+") to ("+we+"x"+Me+")."),ue}else{if("data"in q)qe("WebGLRenderer: Image in DataTexture is too big ("+_e.width+"x"+_e.height+").");return q}return q}function U(q){return q.generateMipmaps}function O(q){m.generateMipmap(q)}function F(q){if(q.isWebGLCubeRenderTarget)return m.TEXTURE_CUBE_MAP;if(q.isWebGL3DRenderTarget)return m.TEXTURE_3D;if(q.isWebGLArrayRenderTarget||q.isCompressedArrayTexture)return m.TEXTURE_2D_ARRAY;return m.TEXTURE_2D}function k(q,H,se,Se,_e,we=!1){if(q!==null){if(m[q]!==void 0)return m[q];qe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+q+"'")}let Me;if(Se){if(Me=g.get("EXT_texture_norm16"),!Me)qe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let ue=H;if(H===m.RED){if(se===m.FLOAT)ue=m.R32F;if(se===m.HALF_FLOAT)ue=m.R16F;if(se===m.UNSIGNED_BYTE)ue=m.R8;if(se===m.UNSIGNED_SHORT&&Me)ue=Me.R16_EXT;if(se===m.SHORT&&Me)ue=Me.R16_SNORM_EXT}if(H===m.RED_INTEGER){if(se===m.UNSIGNED_BYTE)ue=m.R8UI;if(se===m.UNSIGNED_SHORT)ue=m.R16UI;if(se===m.UNSIGNED_INT)ue=m.R32UI;if(se===m.BYTE)ue=m.R8I;if(se===m.SHORT)ue=m.R16I;if(se===m.INT)ue=m.R32I}if(H===m.RG){if(se===m.FLOAT)ue=m.RG32F;if(se===m.HALF_FLOAT)ue=m.RG16F;if(se===m.UNSIGNED_BYTE)ue=m.RG8;if(se===m.UNSIGNED_SHORT&&Me)ue=Me.RG16_EXT;if(se===m.SHORT&&Me)ue=Me.RG16_SNORM_EXT}if(H===m.RG_INTEGER){if(se===m.UNSIGNED_BYTE)ue=m.RG8UI;if(se===m.UNSIGNED_SHORT)ue=m.RG16UI;if(se===m.UNSIGNED_INT)ue=m.RG32UI;if(se===m.BYTE)ue=m.RG8I;if(se===m.SHORT)ue=m.RG16I;if(se===m.INT)ue=m.RG32I}if(H===m.RGB_INTEGER){if(se===m.UNSIGNED_BYTE)ue=m.RGB8UI;if(se===m.UNSIGNED_SHORT)ue=m.RGB16UI;if(se===m.UNSIGNED_INT)ue=m.RGB32UI;if(se===m.BYTE)ue=m.RGB8I;if(se===m.SHORT)ue=m.RGB16I;if(se===m.INT)ue=m.RGB32I}if(H===m.RGBA_INTEGER){if(se===m.UNSIGNED_BYTE)ue=m.RGBA8UI;if(se===m.UNSIGNED_SHORT)ue=m.RGBA16UI;if(se===m.UNSIGNED_INT)ue=m.RGBA32UI;if(se===m.BYTE)ue=m.RGBA8I;if(se===m.SHORT)ue=m.RGBA16I;if(se===m.INT)ue=m.RGBA32I}if(H===m.RGB){if(se===m.UNSIGNED_SHORT&&Me)ue=Me.RGB16_EXT;if(se===m.SHORT&&Me)ue=Me.RGB16_SNORM_EXT;if(se===m.UNSIGNED_INT_5_9_9_9_REV)ue=m.RGB9_E5;if(se===m.UNSIGNED_INT_10F_11F_11F_REV)ue=m.R11F_G11F_B10F}if(H===m.RGBA){let pe=we?Eu:ut.getTransfer(_e);if(se===m.FLOAT)ue=m.RGBA32F;if(se===m.HALF_FLOAT)ue=m.RGBA16F;if(se===m.UNSIGNED_BYTE)ue=pe===Nt?m.SRGB8_ALPHA8:m.RGBA8;if(se===m.UNSIGNED_SHORT&&Me)ue=Me.RGBA16_EXT;if(se===m.SHORT&&Me)ue=Me.RGBA16_SNORM_EXT;if(se===m.UNSIGNED_SHORT_4_4_4_4)ue=m.RGBA4;if(se===m.UNSIGNED_SHORT_5_5_5_1)ue=m.RGB5_A1}if(ue===m.R16F||ue===m.R32F||ue===m.RG16F||ue===m.RG32F||ue===m.RGBA16F||ue===m.RGBA32F)g.get("EXT_color_buffer_float");return ue}function D(q,H){let se;if(q){if(H===null||H===Ji||H===vs)se=m.DEPTH24_STENCIL8;else if(H===Ci)se=m.DEPTH32F_STENCIL8;else if(H===eo)se=m.DEPTH24_STENCIL8,qe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(H===null||H===Ji||H===vs)se=m.DEPTH_COMPONENT24;else if(H===Ci)se=m.DEPTH_COMPONENT32F;else if(H===eo)se=m.DEPTH_COMPONENT16;return se}function B(q,H){if(U(q)===!0||q.isFramebufferTexture&&q.minFilter!==Zi&&q.minFilter!==wn)return Math.log2(Math.max(H.width,H.height))+1;else if(q.mipmaps.length>0)return q.mipmaps.length;else if(q.isCompressedTexture&&Array.isArray(q.image))return H.mipmaps.length;else return 1}function z(q){let H=new WeakRef(q);x.get(q).__ref=H,P.add(H),N.register(q,H,H)}function W(q){let H=x.get(q).__ref;if(H===void 0)return;P.delete(H),N.unregister(H)}function V(q){ee(q.target)}function Y(q){X(q.target)}function ee(q){if(q.removeEventListener("dispose",V),W(q),le(q),q.isVideoTexture)E.delete(q);if(q.isHTMLTexture)A.delete(q)}function X(q){q.removeEventListener("dispose",Y),W(q),ve(q)}function ie(){for(let q of P){let H=q.deref();if(H===void 0)continue;if(H.isRenderTarget===!0)X(H);else ee(H)}P.clear(),A.clear()}function le(q){let H=x.get(q);if(H.__webglInit===void 0)return;let se=q.source,Se=R.get(se);if(Se){let _e=Se[H.__cacheKey];if(_e.usedTimes--,_e.usedTimes===0)te(q);if(Object.keys(Se).length===0)R.delete(se)}x.remove(q)}function te(q){let H=x.get(q);m.deleteTexture(H.__webglTexture);let se=q.source,Se=R.get(se);delete Se[H.__cacheKey],b.memory.textures--}function ve(q){let H=x.get(q);if(H.__depthDisposeCallback)H.__depthDisposeCallback();let se=q.depthTexture;if(se&&se.renderTarget===q)ee(se);if(q.isWebGLCubeRenderTarget)for(let _e=0;_e<6;_e++){if(Array.isArray(H.__webglFramebuffer[_e]))for(let we=0;we<H.__webglFramebuffer[_e].length;we++)m.deleteFramebuffer(H.__webglFramebuffer[_e][we]);else m.deleteFramebuffer(H.__webglFramebuffer[_e]);if(H.__webglDepthbuffer)m.deleteRenderbuffer(H.__webglDepthbuffer[_e])}else{if(Array.isArray(H.__webglFramebuffer))for(let _e=0;_e<H.__webglFramebuffer.length;_e++)m.deleteFramebuffer(H.__webglFramebuffer[_e]);else m.deleteFramebuffer(H.__webglFramebuffer);if(H.__webglDepthbuffer)m.deleteRenderbuffer(H.__webglDepthbuffer);if(H.__webglMultisampledFramebuffer)m.deleteFramebuffer(H.__webglMultisampledFramebuffer);if(H.__webglColorRenderbuffer){for(let _e=0;_e<H.__webglColorRenderbuffer.length;_e++)if(H.__webglColorRenderbuffer[_e])m.deleteRenderbuffer(H.__webglColorRenderbuffer[_e])}if(H.__webglDepthRenderbuffer)m.deleteRenderbuffer(H.__webglDepthRenderbuffer)}let Se=q.textures;for(let _e=0,we=Se.length;_e<we;_e++){let Me=x.get(Se[_e]);if(Me.__webglTexture)m.deleteTexture(Me.__webglTexture),b.memory.textures--;x.remove(Se[_e])}x.remove(q)}let J=0;function ae(){J=0}function ge(){return J}function Te(q){J=q}function ce(){let q=J;if(q>=y.maxTextures)qe("WebGLTextures: Trying to use "+(q+1)+" texture units while this GPU supports only "+y.maxTextures);return J+=1,q}function ye(q){let H=[];return H.push(q.wrapS),H.push(q.wrapT),H.push(q.wrapR||0),H.push(q.magFilter),H.push(q.minFilter),H.push(q.anisotropy),H.push(q.internalFormat),H.push(q.format),H.push(q.type),H.push(q.generateMipmaps),H.push(q.mipmapsAutoUpdate),H.push(q.premultiplyAlpha),H.push(q.flipY),H.push(q.unpackAlignment),H.push(q.colorSpace),H.join()}function Ie(q,H){let se=x.get(q);if(q.isVideoTexture)Ge(q);if(q.isRenderTargetTexture===!1&&q.isExternalTexture!==!0&&q.version>0&&se.__version!==q.version){let Se=q.image;if(Se===null)qe("WebGLRenderer: Texture marked for update but no image data found.");else if(Se.complete===!1)qe("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(se,q,H);return}}else if(q.isExternalTexture)se.__webglTexture=q.sourceTexture?q.sourceTexture:null;_.bindTexture(m.TEXTURE_2D,se.__webglTexture,m.TEXTURE0+H)}function xe(q,H){let se=x.get(q);if(q.isRenderTargetTexture===!1&&q.version>0&&se.__version!==q.version){vt(se,q,H);return}else if(q.isExternalTexture)se.__webglTexture=q.sourceTexture?q.sourceTexture:null;_.bindTexture(m.TEXTURE_2D_ARRAY,se.__webglTexture,m.TEXTURE0+H)}function Ue(q,H){let se=x.get(q);if(q.isRenderTargetTexture===!1&&q.version>0&&se.__version!==q.version){vt(se,q,H);return}_.bindTexture(m.TEXTURE_3D,se.__webglTexture,m.TEXTURE0+H)}function Ce(q,H){let se=x.get(q);if(q.version>0&&se.__version!==q.version){_t(se,q,H);return}_.bindTexture(m.TEXTURE_CUBE_MAP,se.__webglTexture,m.TEXTURE0+H)}let rt={[rr]:m.REPEAT,[ya]:m.CLAMP_TO_EDGE,[dp]:m.MIRRORED_REPEAT},tt={[Zi]:m.NEAREST,[fp]:m.NEAREST_MIPMAP_NEAREST,[Qr]:m.NEAREST_MIPMAP_LINEAR,[wn]:m.LINEAR,[va]:m.LINEAR_MIPMAP_NEAREST,[ii]:m.LINEAR_MIPMAP_LINEAR},Be={[Sp]:m.NEVER,[Ru]:m.ALWAYS,[Mp]:m.LESS,[Tu]:m.LEQUAL,[wp]:m.EQUAL,[Au]:m.GEQUAL,[Ep]:m.GREATER,[Tp]:m.NOTEQUAL};function Ke(q,H){if(H.type===Ci&&g.has("OES_texture_float_linear")===!1&&(H.magFilter===wn||H.magFilter===va||H.magFilter===Qr||H.magFilter===ii||H.minFilter===wn||H.minFilter===va||H.minFilter===Qr||H.minFilter===ii))qe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(m.texParameteri(q,m.TEXTURE_WRAP_S,rt[H.wrapS]),m.texParameteri(q,m.TEXTURE_WRAP_T,rt[H.wrapT]),q===m.TEXTURE_3D||q===m.TEXTURE_2D_ARRAY)m.texParameteri(q,m.TEXTURE_WRAP_R,rt[H.wrapR]);if(m.texParameteri(q,m.TEXTURE_MAG_FILTER,tt[H.magFilter]),m.texParameteri(q,m.TEXTURE_MIN_FILTER,tt[H.minFilter]),H.compareFunction)m.texParameteri(q,m.TEXTURE_COMPARE_MODE,m.COMPARE_REF_TO_TEXTURE),m.texParameteri(q,m.TEXTURE_COMPARE_FUNC,Be[H.compareFunction]);if(g.has("EXT_texture_filter_anisotropic")===!0){if(H.magFilter===Zi)return;if(H.minFilter!==Qr&&H.minFilter!==ii)return;if(H.type===Ci&&g.has("OES_texture_float_linear")===!1)return;if(H.anisotropy>1||x.get(H).__currentAnisotropy){let se=g.get("EXT_texture_filter_anisotropic");m.texParameterf(q,se.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(H.anisotropy,y.getMaxAnisotropy())),x.get(H).__currentAnisotropy=H.anisotropy}}}function Ye(q,H){let se=!1;if(q.__webglInit===void 0)q.__webglInit=!0,H.addEventListener("dispose",V),z(H);let Se=H.source,_e=R.get(Se);if(_e===void 0)_e={},R.set(Se,_e);let we=ye(H);if(we!==q.__cacheKey){if(_e[we]===void 0)_e[we]={texture:m.createTexture(),usedTimes:0},b.memory.textures++,se=!0;_e[we].usedTimes++;let Me=_e[q.__cacheKey];if(Me!==void 0){if(_e[q.__cacheKey].usedTimes--,Me.usedTimes===0)te(H)}q.__cacheKey=we,q.__webglTexture=_e[we].texture}return se}function Ze(q,H,se){return Math.floor(Math.floor(q/se)/H)}function pt(q,H,se,Se){let we=q.updateRanges;if(we.length===0)_.texSubImage2D(m.TEXTURE_2D,0,0,0,H.width,H.height,se,Se,H.data);else{we.sort((K,fe)=>K.start-fe.start);let Me=0;for(let K=1;K<we.length;K++){let fe=we[Me],de=we[K],ne=fe.start+fe.count,me=Ze(de.start,H.width,4),be=Ze(fe.start,H.width,4);if(de.start<=ne+1&&me===be&&Ze(de.start+de.count-1,H.width,4)===me)fe.count=Math.max(fe.count,de.start+de.count-fe.start);else++Me,we[Me]=de}we.length=Me+1;let ue=_.getParameter(m.UNPACK_ROW_LENGTH),pe=_.getParameter(m.UNPACK_SKIP_PIXELS),Ee=_.getParameter(m.UNPACK_SKIP_ROWS);_.pixelStorei(m.UNPACK_ROW_LENGTH,H.width);for(let K=0,fe=we.length;K<fe;K++){let de=we[K],ne=Math.floor(de.start/4),me=Math.ceil(de.count/4),be=ne%H.width,ke=Math.floor(ne/H.width),Ve=me,Ne=1;_.pixelStorei(m.UNPACK_SKIP_PIXELS,be),_.pixelStorei(m.UNPACK_SKIP_ROWS,ke),_.texSubImage2D(m.TEXTURE_2D,0,be,ke,Ve,1,se,Se,H.data)}q.clearUpdateRanges(),_.pixelStorei(m.UNPACK_ROW_LENGTH,ue),_.pixelStorei(m.UNPACK_SKIP_PIXELS,pe),_.pixelStorei(m.UNPACK_SKIP_ROWS,Ee)}}function vt(q,H,se){let Se=m.TEXTURE_2D;if(H.isDataArrayTexture||H.isCompressedArrayTexture)Se=m.TEXTURE_2D_ARRAY;if(H.isData3DTexture)Se=m.TEXTURE_3D;let _e=Ye(q,H),we=H.source;_.bindTexture(Se,q.__webglTexture,m.TEXTURE0+se);let Me=x.get(we);if(we.version!==Me.__version||_e===!0){if(_.activeTexture(m.TEXTURE0+se),(typeof ImageBitmap<"u"&&H.image instanceof ImageBitmap)===!1){let Ne=ut.getPrimaries(ut.workingColorSpace),Xe=H.colorSpace===Pi?null:ut.getPrimaries(H.colorSpace),at=H.colorSpace===Pi||Ne===Xe?m.NONE:m.BROWSER_DEFAULT_WEBGL;_.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,H.flipY),_.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),_.pixelStorei(m.UNPACK_COLORSPACE_CONVERSION_WEBGL,at)}_.pixelStorei(m.UNPACK_ALIGNMENT,H.unpackAlignment);let pe=L(H.image,!1,y.maxTextureSize);pe=je(H,pe);let Ee=v.convert(H.format,H.colorSpace),K=v.convert(H.type),fe=k(H.internalFormat,Ee,K,H.normalized,H.colorSpace,H.isVideoTexture);Ke(Se,H);let de,ne=H.mipmaps,me=H.isVideoTexture!==!0,be=Me.__version===void 0||_e===!0,ke=we.dataReady,Ve=B(H,pe);if(H.isDepthTexture){if(fe=D(H.format===Ki,H.type),be)if(me)_.texStorage2D(m.TEXTURE_2D,1,fe,pe.width,pe.height);else _.texImage2D(m.TEXTURE_2D,0,fe,pe.width,pe.height,0,Ee,K,null)}else if(H.isDataTexture)if(ne.length>0){if(me&&be)_.texStorage2D(m.TEXTURE_2D,Ve,fe,ne[0].width,ne[0].height);for(let Ne=0,Xe=ne.length;Ne<Xe;Ne++)if(de=ne[Ne],me){if(ke)_.texSubImage2D(m.TEXTURE_2D,Ne,0,0,de.width,de.height,Ee,K,de.data)}else _.texImage2D(m.TEXTURE_2D,Ne,fe,de.width,de.height,0,Ee,K,de.data);H.generateMipmaps=!1}else if(me){if(be)_.texStorage2D(m.TEXTURE_2D,Ve,fe,pe.width,pe.height);if(ke)pt(H,pe,Ee,K)}else _.texImage2D(m.TEXTURE_2D,0,fe,pe.width,pe.height,0,Ee,K,pe.data);else if(H.isCompressedTexture)if(H.isCompressedArrayTexture){if(me&&be)_.texStorage3D(m.TEXTURE_2D_ARRAY,Ve,fe,ne[0].width,ne[0].height,pe.depth);for(let Ne=0,Xe=ne.length;Ne<Xe;Ne++)if(de=ne[Ne],H.format!==Ln)if(Ee!==null)if(me){if(ke)if(H.layerUpdates.size>0){let at=nh(de.width,de.height,H.format,H.type);for(let De of H.layerUpdates){let Ct=de.data.subarray(De*at/de.data.BYTES_PER_ELEMENT,(De+1)*at/de.data.BYTES_PER_ELEMENT);_.compressedTexSubImage3D(m.TEXTURE_2D_ARRAY,Ne,0,0,De,de.width,de.height,1,Ee,Ct)}}else _.compressedTexSubImage3D(m.TEXTURE_2D_ARRAY,Ne,0,0,0,de.width,de.height,pe.depth,Ee,de.data)}else _.compressedTexImage3D(m.TEXTURE_2D_ARRAY,Ne,fe,de.width,de.height,pe.depth,0,de.data,0,0);else qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(me){if(ke)_.texSubImage3D(m.TEXTURE_2D_ARRAY,Ne,0,0,0,de.width,de.height,pe.depth,Ee,K,de.data)}else _.texImage3D(m.TEXTURE_2D_ARRAY,Ne,fe,de.width,de.height,pe.depth,0,Ee,K,de.data);if(H.layerUpdates.size>0)H.clearLayerUpdates()}else{if(me&&be)_.texStorage2D(m.TEXTURE_2D,Ve,fe,ne[0].width,ne[0].height);for(let Ne=0,Xe=ne.length;Ne<Xe;Ne++)if(de=ne[Ne],H.format!==Ln)if(Ee!==null)if(me){if(ke)_.compressedTexSubImage2D(m.TEXTURE_2D,Ne,0,0,de.width,de.height,Ee,de.data)}else _.compressedTexImage2D(m.TEXTURE_2D,Ne,fe,de.width,de.height,0,de.data);else qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(me){if(ke)_.texSubImage2D(m.TEXTURE_2D,Ne,0,0,de.width,de.height,Ee,K,de.data)}else _.texImage2D(m.TEXTURE_2D,Ne,fe,de.width,de.height,0,Ee,K,de.data)}else if(H.isDataArrayTexture)if(me){if(be)_.texStorage3D(m.TEXTURE_2D_ARRAY,Ve,fe,pe.width,pe.height,pe.depth);if(ke)if(H.layerUpdates.size>0){let Ne=nh(pe.width,pe.height,H.format,H.type);for(let Xe of H.layerUpdates){let at=pe.data.subarray(Xe*Ne/pe.data.BYTES_PER_ELEMENT,(Xe+1)*Ne/pe.data.BYTES_PER_ELEMENT);_.texSubImage3D(m.TEXTURE_2D_ARRAY,0,0,0,Xe,pe.width,pe.height,1,Ee,K,at)}H.clearLayerUpdates()}else _.texSubImage3D(m.TEXTURE_2D_ARRAY,0,0,0,0,pe.width,pe.height,pe.depth,Ee,K,pe.data)}else _.texImage3D(m.TEXTURE_2D_ARRAY,0,fe,pe.width,pe.height,pe.depth,0,Ee,K,pe.data);else if(H.isData3DTexture)if(me){if(be)_.texStorage3D(m.TEXTURE_3D,Ve,fe,pe.width,pe.height,pe.depth);if(ke)_.texSubImage3D(m.TEXTURE_3D,0,0,0,0,pe.width,pe.height,pe.depth,Ee,K,pe.data)}else _.texImage3D(m.TEXTURE_3D,0,fe,pe.width,pe.height,pe.depth,0,Ee,K,pe.data);else if(H.isFramebufferTexture){if(be)if(me)_.texStorage2D(m.TEXTURE_2D,Ve,fe,pe.width,pe.height);else{let Ne=pe.width,Xe=pe.height;for(let at=0;at<Ve;at++)_.texImage2D(m.TEXTURE_2D,at,fe,Ne,Xe,0,Ee,K,null),Ne>>=1,Xe>>=1}}else if(H.isHTMLTexture){if("texElementImage2D"in m){let Ne=m.canvas;if(!Ne.hasAttribute("layoutsubtree"))Ne.setAttribute("layoutsubtree","true");if(pe.parentNode!==Ne){Ne.appendChild(pe),A.add(H),Ne.onpaint=(Xe)=>{let at=Xe.changedElements;for(let De of A)if(at.includes(De.image))De.needsUpdate=!0},Ne.requestPaint();return}if(m.texElementImage2D.length===3)m.texElementImage2D(m.TEXTURE_2D,m.RGBA8,pe);else{let{RGBA:at,RGBA:De,UNSIGNED_BYTE:Ct}=m;m.texElementImage2D(m.TEXTURE_2D,0,at,De,Ct,pe)}m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MIN_FILTER,m.LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_S,m.CLAMP_TO_EDGE),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_T,m.CLAMP_TO_EDGE)}}else if(ne.length>0){if(me&&be){let Ne=en(ne[0]);_.texStorage2D(m.TEXTURE_2D,Ve,fe,Ne.width,Ne.height)}for(let Ne=0,Xe=ne.length;Ne<Xe;Ne++)if(de=ne[Ne],me){if(ke)_.texSubImage2D(m.TEXTURE_2D,Ne,0,0,Ee,K,de)}else _.texImage2D(m.TEXTURE_2D,Ne,fe,Ee,K,de);H.generateMipmaps=!1}else if(me){if(be){let Ne=en(pe);_.texStorage2D(m.TEXTURE_2D,Ve,fe,Ne.width,Ne.height)}if(ke)_.texSubImage2D(m.TEXTURE_2D,0,0,0,Ee,K,pe)}else _.texImage2D(m.TEXTURE_2D,0,fe,Ee,K,pe);if(U(H)&&H.mipmapsAutoUpdate===!0)O(Se);if(Me.__version=we.version,H.onUpdate)H.onUpdate(H)}q.__version=H.version}function _t(q,H,se){if(H.image.length!==6)return;let Se=Ye(q,H),_e=H.source;_.bindTexture(m.TEXTURE_CUBE_MAP,q.__webglTexture,m.TEXTURE0+se);let we=x.get(_e);if(_e.version!==we.__version||Se===!0){_.activeTexture(m.TEXTURE0+se);let Me=ut.getPrimaries(ut.workingColorSpace),ue=H.colorSpace===Pi?null:ut.getPrimaries(H.colorSpace),pe=H.colorSpace===Pi||Me===ue?m.NONE:m.BROWSER_DEFAULT_WEBGL;_.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,H.flipY),_.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),_.pixelStorei(m.UNPACK_ALIGNMENT,H.unpackAlignment),_.pixelStorei(m.UNPACK_COLORSPACE_CONVERSION_WEBGL,pe);let Ee=H.isCompressedTexture||H.image[0].isCompressedTexture,K=H.image[0]&&H.image[0].isDataTexture,fe=[];for(let De=0;De<6;De++){if(!Ee&&!K)fe[De]=L(H.image[De],!0,y.maxCubemapSize);else fe[De]=K?H.image[De].image:H.image[De];fe[De]=je(H,fe[De])}let de=fe[0],ne=v.convert(H.format,H.colorSpace),me=v.convert(H.type),be=k(H.internalFormat,ne,me,H.normalized,H.colorSpace),ke=H.isVideoTexture!==!0,Ve=we.__version===void 0||Se===!0,Ne=_e.dataReady,Xe=B(H,de);Ke(m.TEXTURE_CUBE_MAP,H);let at;if(H.isDepthTexture){if(be=D(H.format===Ki,H.type),Ve)if(ke)_.texStorage2D(m.TEXTURE_CUBE_MAP,1,be,de.width,de.height);else for(let De=0;De<6;De++)_.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,0,be,de.width,de.height,0,ne,me,null)}else if(Ee){if(ke&&Ve)_.texStorage2D(m.TEXTURE_CUBE_MAP,Xe,be,de.width,de.height);for(let De=0;De<6;De++){at=fe[De].mipmaps;for(let Ct=0;Ct<at.length;Ct++){let ln=at[Ct];if(H.format!==Ln)if(ne!==null)if(ke){if(Ne)_.compressedTexSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct,0,0,ln.width,ln.height,ne,ln.data)}else _.compressedTexImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct,be,ln.width,ln.height,0,ln.data);else qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(ke){if(Ne)_.texSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct,0,0,ln.width,ln.height,ne,me,ln.data)}else _.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct,be,ln.width,ln.height,0,ne,me,ln.data)}}}else{if(at=H.mipmaps,ke&&Ve){if(at.length>0)Xe++;let De=en(fe[0]);_.texStorage2D(m.TEXTURE_CUBE_MAP,Xe,be,De.width,De.height)}for(let De=0;De<6;De++)if(K){if(ke){if(Ne)_.texSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,0,0,0,fe[De].width,fe[De].height,ne,me,fe[De].data)}else _.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,0,be,fe[De].width,fe[De].height,0,ne,me,fe[De].data);for(let Ct=0;Ct<at.length;Ct++){let _i=at[Ct].image[De].image;if(ke){if(Ne)_.texSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct+1,0,0,_i.width,_i.height,ne,me,_i.data)}else _.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct+1,be,_i.width,_i.height,0,ne,me,_i.data)}}else{if(ke){if(Ne)_.texSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,0,0,0,ne,me,fe[De])}else _.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,0,be,ne,me,fe[De]);for(let Ct=0;Ct<at.length;Ct++){let ln=at[Ct];if(ke){if(Ne)_.texSubImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct+1,0,0,ne,me,ln.image[De])}else _.texImage2D(m.TEXTURE_CUBE_MAP_POSITIVE_X+De,Ct+1,be,ne,me,ln.image[De])}}}if(U(H)&&H.mipmapsAutoUpdate===!0)O(m.TEXTURE_CUBE_MAP);if(we.__version=_e.version,H.onUpdate)H.onUpdate(H)}q.__version=H.version}function ot(q,H,se,Se,_e,we){let Me=v.convert(se.format,se.colorSpace),ue=v.convert(se.type),pe=k(se.internalFormat,Me,ue,se.normalized,se.colorSpace),Ee=x.get(H),K=x.get(se);if(K.__renderTarget=H,!Ee.__hasExternalTextures){let fe=Math.max(1,H.width>>we),de=Math.max(1,H.height>>we);if(_e===m.TEXTURE_3D||_e===m.TEXTURE_2D_ARRAY)_.texImage3D(_e,we,pe,fe,de,H.depth,0,Me,ue,null);else _.texImage2D(_e,we,pe,fe,de,0,Me,ue,null)}if(_.bindFramebuffer(m.FRAMEBUFFER,q),Tt(H))S.framebufferTexture2DMultisampleEXT(m.FRAMEBUFFER,Se,_e,K.__webglTexture,0,Pe(H));else if(_e===m.TEXTURE_2D||_e>=m.TEXTURE_CUBE_MAP_POSITIVE_X&&_e<=m.TEXTURE_CUBE_MAP_NEGATIVE_Z)m.framebufferTexture2D(m.FRAMEBUFFER,Se,_e,K.__webglTexture,we);_.bindFramebuffer(m.FRAMEBUFFER,null)}function ct(q,H,se){if(m.bindRenderbuffer(m.RENDERBUFFER,q),H.depthBuffer){let Se=H.depthTexture,_e=Se&&Se.isDepthTexture?Se.type:null,we=D(H.stencilBuffer,_e),Me=H.stencilBuffer?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT;if(Tt(H))S.renderbufferStorageMultisampleEXT(m.RENDERBUFFER,Pe(H),we,H.width,H.height);else if(se)m.renderbufferStorageMultisample(m.RENDERBUFFER,Pe(H),we,H.width,H.height);else m.renderbufferStorage(m.RENDERBUFFER,we,H.width,H.height);m.framebufferRenderbuffer(m.FRAMEBUFFER,Me,m.RENDERBUFFER,q)}else{let Se=H.textures;for(let _e=0;_e<Se.length;_e++){let we=Se[_e],Me=v.convert(we.format,we.colorSpace),ue=v.convert(we.type),pe=k(we.internalFormat,Me,ue,we.normalized,we.colorSpace);if(Tt(H))S.renderbufferStorageMultisampleEXT(m.RENDERBUFFER,Pe(H),pe,H.width,H.height);else if(se)m.renderbufferStorageMultisample(m.RENDERBUFFER,Pe(H),pe,H.width,H.height);else m.renderbufferStorage(m.RENDERBUFFER,pe,H.width,H.height)}}m.bindRenderbuffer(m.RENDERBUFFER,null)}function bt(q,H,se){let Se=H.isWebGLCubeRenderTarget===!0;if(_.bindFramebuffer(m.FRAMEBUFFER,q),!(H.depthTexture&&H.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let _e=x.get(H.depthTexture);_e.__renderTarget=H;let we=Se?H.depthTexture.image[0]:H.depthTexture.image;if(!_e.__webglTexture||we.width!==H.width||we.height!==H.height)we.width=H.width,we.height=H.height,H.depthTexture.needsUpdate=!0;if(Se)Ce(H.depthTexture,0);else Ie(H.depthTexture,0);let Me=_e.__webglTexture,ue=Pe(H),pe=Se?m.TEXTURE_CUBE_MAP_POSITIVE_X+se:m.TEXTURE_2D,Ee=H.depthTexture.format===Ki?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT;if(H.depthTexture.format===or)if(Tt(H))S.framebufferTexture2DMultisampleEXT(m.FRAMEBUFFER,Ee,pe,Me,0,ue);else m.framebufferTexture2D(m.FRAMEBUFFER,Ee,pe,Me,0);else if(H.depthTexture.format===Ki)if(Tt(H))S.framebufferTexture2DMultisampleEXT(m.FRAMEBUFFER,Ee,pe,Me,0,ue);else m.framebufferTexture2D(m.FRAMEBUFFER,Ee,pe,Me,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function kt(q){let H=x.get(q),se=q.isWebGLCubeRenderTarget===!0;if(H.__boundDepthTexture!==q.depthTexture){let Se=q.depthTexture;if(H.__depthDisposeCallback)H.__depthDisposeCallback();if(Se){let _e=()=>{delete H.__boundDepthTexture,delete H.__depthDisposeCallback,Se.removeEventListener("dispose",_e)};Se.addEventListener("dispose",_e),H.__depthDisposeCallback=_e}H.__boundDepthTexture=Se}if(q.depthTexture&&!H.__autoAllocateDepthBuffer)if(se)for(let Se=0;Se<6;Se++)bt(H.__webglFramebuffer[Se],q,Se);else if(q.texture.mipmaps.length>0)bt(H.__webglFramebuffer[0],q,0);else bt(H.__webglFramebuffer,q,0);else if(se){H.__webglDepthbuffer=[];for(let Se=0;Se<6;Se++)if(_.bindFramebuffer(m.FRAMEBUFFER,H.__webglFramebuffer[Se]),H.__webglDepthbuffer[Se]===void 0)H.__webglDepthbuffer[Se]=m.createRenderbuffer(),ct(H.__webglDepthbuffer[Se],q,!1);else{let _e=q.stencilBuffer?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT,we=H.__webglDepthbuffer[Se];m.bindRenderbuffer(m.RENDERBUFFER,we),m.framebufferRenderbuffer(m.FRAMEBUFFER,_e,m.RENDERBUFFER,we)}}else{if(q.texture.mipmaps.length>0)_.bindFramebuffer(m.FRAMEBUFFER,H.__webglFramebuffer[0]);else _.bindFramebuffer(m.FRAMEBUFFER,H.__webglFramebuffer);if(H.__webglDepthbuffer===void 0)H.__webglDepthbuffer=m.createRenderbuffer(),ct(H.__webglDepthbuffer,q,!1);else{let _e=q.stencilBuffer?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT,we=H.__webglDepthbuffer;m.bindRenderbuffer(m.RENDERBUFFER,we),m.framebufferRenderbuffer(m.FRAMEBUFFER,_e,m.RENDERBUFFER,we)}}_.bindFramebuffer(m.FRAMEBUFFER,null)}function Ut(q,H,se){let Se=x.get(q);if(H!==void 0)ot(Se.__webglFramebuffer,q,q.texture,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,0);if(se!==void 0)kt(q)}function Q(q){let H=q.texture,se=x.get(q),Se=x.get(H);q.addEventListener("dispose",Y),z(q);let _e=q.textures,we=q.isWebGLCubeRenderTarget===!0,Me=_e.length>1;if(!Me){if(Se.__webglTexture===void 0)Se.__webglTexture=m.createTexture();Se.__version=H.version,b.memory.textures++}if(we){se.__webglFramebuffer=[];for(let ue=0;ue<6;ue++)if(H.mipmaps.length>0){se.__webglFramebuffer[ue]=[];for(let pe=0;pe<H.mipmaps.length;pe++)se.__webglFramebuffer[ue][pe]=m.createFramebuffer()}else se.__webglFramebuffer[ue]=m.createFramebuffer()}else{if(H.mipmaps.length>0){se.__webglFramebuffer=[];for(let ue=0;ue<H.mipmaps.length;ue++)se.__webglFramebuffer[ue]=m.createFramebuffer()}else se.__webglFramebuffer=m.createFramebuffer();if(Me)for(let ue=0,pe=_e.length;ue<pe;ue++){let Ee=x.get(_e[ue]);if(Ee.__webglTexture===void 0)Ee.__webglTexture=m.createTexture(),b.memory.textures++}if(q.samples>0&&Tt(q)===!1){se.__webglMultisampledFramebuffer=m.createFramebuffer(),se.__webglColorRenderbuffer=[],_.bindFramebuffer(m.FRAMEBUFFER,se.__webglMultisampledFramebuffer);for(let ue=0;ue<_e.length;ue++){let pe=_e[ue];se.__webglColorRenderbuffer[ue]=m.createRenderbuffer(),m.bindRenderbuffer(m.RENDERBUFFER,se.__webglColorRenderbuffer[ue]);let Ee=v.convert(pe.format,pe.colorSpace),K=v.convert(pe.type),fe=k(pe.internalFormat,Ee,K,pe.normalized,pe.colorSpace,q.isXRRenderTarget===!0),de=Pe(q);m.renderbufferStorageMultisample(m.RENDERBUFFER,de,fe,q.width,q.height),m.framebufferRenderbuffer(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0+ue,m.RENDERBUFFER,se.__webglColorRenderbuffer[ue])}if(m.bindRenderbuffer(m.RENDERBUFFER,null),q.depthBuffer)se.__webglDepthRenderbuffer=m.createRenderbuffer(),ct(se.__webglDepthRenderbuffer,q,!0);_.bindFramebuffer(m.FRAMEBUFFER,null)}}if(we){_.bindTexture(m.TEXTURE_CUBE_MAP,Se.__webglTexture),Ke(m.TEXTURE_CUBE_MAP,H);for(let ue=0;ue<6;ue++)if(H.mipmaps.length>0)for(let pe=0;pe<H.mipmaps.length;pe++)ot(se.__webglFramebuffer[ue][pe],q,H,m.COLOR_ATTACHMENT0,m.TEXTURE_CUBE_MAP_POSITIVE_X+ue,pe);else ot(se.__webglFramebuffer[ue],q,H,m.COLOR_ATTACHMENT0,m.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0);if(U(H))O(m.TEXTURE_CUBE_MAP);else if(H.mipmaps.length>0)m.texParameteri(m.TEXTURE_CUBE_MAP,m.TEXTURE_MAX_LEVEL,H.mipmaps.length-1);_.unbindTexture()}else if(Me){for(let ue=0,pe=_e.length;ue<pe;ue++){let Ee=_e[ue],K=x.get(Ee),fe=m.TEXTURE_2D;if(q.isWebGL3DRenderTarget||q.isWebGLArrayRenderTarget)fe=q.isWebGL3DRenderTarget?m.TEXTURE_3D:m.TEXTURE_2D_ARRAY;if(_.bindTexture(fe,K.__webglTexture),Ke(fe,Ee),ot(se.__webglFramebuffer,q,Ee,m.COLOR_ATTACHMENT0+ue,fe,0),U(Ee))O(fe)}_.unbindTexture()}else{let ue=m.TEXTURE_2D;if(q.isWebGL3DRenderTarget||q.isWebGLArrayRenderTarget)ue=q.isWebGL3DRenderTarget?m.TEXTURE_3D:m.TEXTURE_2D_ARRAY;if(_.bindTexture(ue,Se.__webglTexture),Ke(ue,H),H.mipmaps.length>0)for(let pe=0;pe<H.mipmaps.length;pe++)ot(se.__webglFramebuffer[pe],q,H,m.COLOR_ATTACHMENT0,ue,pe);else ot(se.__webglFramebuffer,q,H,m.COLOR_ATTACHMENT0,ue,0);if(U(H))O(ue);else if(H.mipmaps.length>0)m.texParameteri(ue,m.TEXTURE_MAX_LEVEL,H.mipmaps.length-1);_.unbindTexture()}if(q.depthBuffer)kt(q)}function $t(q){let H=q.textures;for(let se=0,Se=H.length;se<Se;se++){let _e=H[se];if(U(_e)&&_e.mipmapsAutoUpdate===!0){let we=F(q),Me=x.get(_e).__webglTexture;_.bindTexture(we,Me),O(we),_.unbindTexture()}}}let mt=[];function Wt(q){if(q.samples>0){if(Tt(q)===!1){let{textures:H,width:se,height:Se}=q,_e=m.COLOR_BUFFER_BIT,we=q.stencilBuffer?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT,Me=x.get(q),ue=H.length>1;if(ue)for(let Ee=0;Ee<H.length;Ee++)_.bindFramebuffer(m.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),m.framebufferRenderbuffer(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0+Ee,m.RENDERBUFFER,null),_.bindFramebuffer(m.FRAMEBUFFER,Me.__webglFramebuffer),m.framebufferTexture2D(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0+Ee,m.TEXTURE_2D,null,0);if(_.bindFramebuffer(m.READ_FRAMEBUFFER,Me.__webglMultisampledFramebuffer),q.texture.mipmaps.length>0)_.bindFramebuffer(m.DRAW_FRAMEBUFFER,Me.__webglFramebuffer[0]);else _.bindFramebuffer(m.DRAW_FRAMEBUFFER,Me.__webglFramebuffer);for(let Ee=0;Ee<H.length;Ee++){if(q.resolveDepthBuffer){if(q.depthBuffer)_e|=m.DEPTH_BUFFER_BIT;if(q.stencilBuffer&&q.resolveStencilBuffer)_e|=m.STENCIL_BUFFER_BIT}if(ue){m.framebufferRenderbuffer(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.RENDERBUFFER,Me.__webglColorRenderbuffer[Ee]);let K=x.get(H[Ee]).__webglTexture;m.framebufferTexture2D(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,K,0)}if(m.blitFramebuffer(0,0,se,Se,0,0,se,Se,_e,m.NEAREST),M===!0){if(mt.length=0,mt.push(m.COLOR_ATTACHMENT0+Ee),q.depthBuffer&&q.storeMultisampledDepthBuffer===!1)mt.push(we);m.invalidateFramebuffer(m.READ_FRAMEBUFFER,mt)}}if(_.bindFramebuffer(m.READ_FRAMEBUFFER,null),_.bindFramebuffer(m.DRAW_FRAMEBUFFER,null),ue)for(let Ee=0;Ee<H.length;Ee++){_.bindFramebuffer(m.FRAMEBUFFER,Me.__webglMultisampledFramebuffer),m.framebufferRenderbuffer(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0+Ee,m.RENDERBUFFER,Me.__webglColorRenderbuffer[Ee]);let K=x.get(H[Ee]).__webglTexture;_.bindFramebuffer(m.FRAMEBUFFER,Me.__webglFramebuffer),m.framebufferTexture2D(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0+Ee,m.TEXTURE_2D,K,0)}_.bindFramebuffer(m.DRAW_FRAMEBUFFER,Me.__webglMultisampledFramebuffer)}else if(q.depthBuffer&&q.storeMultisampledDepthBuffer===!1&&M){let H=q.stencilBuffer?m.DEPTH_STENCIL_ATTACHMENT:m.DEPTH_ATTACHMENT;m.invalidateFramebuffer(m.DRAW_FRAMEBUFFER,[H])}}}function Pe(q){return Math.min(y.maxSamples,q.samples)}function Tt(q){let H=x.get(q);return q.samples>0&&g.has("WEBGL_multisampled_render_to_texture")===!0&&H.__useRenderToTexture!==!1}function Ge(q){let H=b.render.frame;if(E.get(q)!==H)E.set(q,H),q.update()}function je(q,H){let{colorSpace:se,format:Se,type:_e}=q;if(q.isCompressedTexture===!0||q.isVideoTexture===!0)return H;if(se!==wu&&se!==Pi)if(ut.getTransfer(se)===Nt){if(Se!==Ln||_e!==si)qe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Je("WebGLTextures: Unsupported texture color space:",se);return H}function en(q){if(typeof HTMLImageElement<"u"&&q instanceof HTMLImageElement)w.width=q.naturalWidth||q.width,w.height=q.naturalHeight||q.height;else if(typeof VideoFrame<"u"&&q instanceof VideoFrame)w.width=q.displayWidth,w.height=q.displayHeight;else w.width=q.width,w.height=q.height;return w}this.allocateTextureUnit=ce,this.resetTextureUnits=ae,this.getTextureUnits=ge,this.setTextureUnits=Te,this.setTexture2D=Ie,this.setTexture2DArray=xe,this.setTexture3D=Ue,this.setTextureCube=Ce,this.rebindTextures=Ut,this.setupRenderTarget=Q,this.updateRenderTargetMipmap=$t,this.updateMultisampleRenderTarget=Wt,this.setupDepthRenderbuffer=kt,this.setupFrameBufferTexture=ot,this.useMultisampledRTT=Tt,this.dispose=ie}function yS(m,g){function _(x,y=Pi){let v,b=ut.getTransfer(y);if(x===si)return m.UNSIGNED_BYTE;if(x===Xc)return m.UNSIGNED_SHORT_4_4_4_4;if(x===qc)return m.UNSIGNED_SHORT_5_5_5_1;if(x===gp)return m.UNSIGNED_INT_5_9_9_9_REV;if(x===_p)return m.UNSIGNED_INT_10F_11F_11F_REV;if(x===pp)return m.BYTE;if(x===mp)return m.SHORT;if(x===eo)return m.UNSIGNED_SHORT;if(x===Wc)return m.INT;if(x===Ji)return m.UNSIGNED_INT;if(x===Ci)return m.FLOAT;if(x===di)return m.HALF_FLOAT;if(x===xp)return m.ALPHA;if(x===yp)return m.RGB;if(x===Ln)return m.RGBA;if(x===or)return m.DEPTH_COMPONENT;if(x===Ki)return m.DEPTH_STENCIL;if(x===vp)return m.RED;if(x===Yc)return m.RED_INTEGER;if(x===bs)return m.RG;if(x===$c)return m.RG_INTEGER;if(x===Zc)return m.RGBA_INTEGER;if(x===ar||x===ba||x===lr||x===cr)if(b===Nt)if(v=g.get("WEBGL_compressed_texture_s3tc_srgb"),v!==null){if(x===ar)return v.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(x===ba)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(x===lr)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(x===cr)return v.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(v=g.get("WEBGL_compressed_texture_s3tc"),v!==null){if(x===ar)return v.COMPRESSED_RGB_S3TC_DXT1_EXT;if(x===ba)return v.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(x===lr)return v.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(x===cr)return v.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(x===Jc||x===Kc||x===jc||x===Qc)if(v=g.get("WEBGL_compressed_texture_pvrtc"),v!==null){if(x===Jc)return v.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(x===Kc)return v.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(x===jc)return v.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(x===Qc)return v.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(x===to||x===eu||x===tu||x===nu||x===iu||x===Sa||x===su)if(v=g.get("WEBGL_compressed_texture_etc"),v!==null){if(x===to||x===eu)return b===Nt?v.COMPRESSED_SRGB8_ETC2:v.COMPRESSED_RGB8_ETC2;if(x===tu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:v.COMPRESSED_RGBA8_ETC2_EAC;if(x===nu)return v.COMPRESSED_R11_EAC;if(x===iu)return v.COMPRESSED_SIGNED_R11_EAC;if(x===Sa)return v.COMPRESSED_RG11_EAC;if(x===su)return v.COMPRESSED_SIGNED_RG11_EAC}else return null;if(x===ru||x===ou||x===au||x===lu||x===cu||x===uu||x===hu||x===du||x===fu||x===pu||x===mu||x===gu||x===_u||x===xu)if(v=g.get("WEBGL_compressed_texture_astc"),v!==null){if(x===ru)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:v.COMPRESSED_RGBA_ASTC_4x4_KHR;if(x===ou)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:v.COMPRESSED_RGBA_ASTC_5x4_KHR;if(x===au)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:v.COMPRESSED_RGBA_ASTC_5x5_KHR;if(x===lu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:v.COMPRESSED_RGBA_ASTC_6x5_KHR;if(x===cu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:v.COMPRESSED_RGBA_ASTC_6x6_KHR;if(x===uu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:v.COMPRESSED_RGBA_ASTC_8x5_KHR;if(x===hu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:v.COMPRESSED_RGBA_ASTC_8x6_KHR;if(x===du)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:v.COMPRESSED_RGBA_ASTC_8x8_KHR;if(x===fu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:v.COMPRESSED_RGBA_ASTC_10x5_KHR;if(x===pu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:v.COMPRESSED_RGBA_ASTC_10x6_KHR;if(x===mu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:v.COMPRESSED_RGBA_ASTC_10x8_KHR;if(x===gu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:v.COMPRESSED_RGBA_ASTC_10x10_KHR;if(x===_u)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:v.COMPRESSED_RGBA_ASTC_12x10_KHR;if(x===xu)return b===Nt?v.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:v.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(x===yu||x===no||x===io)if(v=g.get("EXT_texture_compression_bptc"),v!==null){if(x===yu)return b===Nt?v.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:v.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(x===no)return v.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(x===io)return v.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(x===vu||x===bu||x===Ma||x===Su)if(v=g.get("EXT_texture_compression_rgtc"),v!==null){if(x===vu)return v.COMPRESSED_RED_RGTC1_EXT;if(x===bu)return v.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(x===Ma)return v.COMPRESSED_RED_GREEN_RGTC2_EXT;if(x===Su)return v.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(x===vs)return m.UNSIGNED_INT_24_8;return m[x]!==void 0?m[x]:null}return{convert:_}}var vS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,bS=`
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

}`;class Sm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(m,g){if(this.texture===null){let _=new Oa(m.texture);if(m.depthNear!==g.depthNear||m.depthFar!==g.depthFar)this.depthNear=m.depthNear,this.depthFar=m.depthFar;this.texture=_}}getMesh(m){if(this.texture!==null){if(this.mesh===null){let g=m.cameras[0].viewport,_=new Ui({vertexShader:vS,fragmentShader:bS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:g.z},depthHeight:{value:g.w}}});this.mesh=new Xt(new uo(20,20),_)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Mm extends Ii{constructor(m,g){super();let _=this,x=null,y=1,v=null,b="local-floor",S=1,M=null,w=null,E=null,A=null,T=null,R=null,P=typeof XRWebGLBinding<"u",N=new Sm,C={},I=g.getContextAttributes(),L=null,U=null,O=[],F=[],k=new $e,D=null,B=null,z=new On;z.viewport=new Ht;let W=new On;W.viewport=new Ht;let V=[z,W],Y=new Qu,ee=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ce){let ye=O[ce];if(ye===void 0)ye=new oo,O[ce]=ye;return ye.getTargetRaySpace()},this.getControllerGrip=function(ce){let ye=O[ce];if(ye===void 0)ye=new oo,O[ce]=ye;return ye.getGripSpace()},this.getHand=function(ce){let ye=O[ce];if(ye===void 0)ye=new oo,O[ce]=ye;return ye.getHandSpace()};function ie(ce){let ye=F.indexOf(ce.inputSource);if(ye===-1)return;let Ie=O[ye];if(Ie!==void 0)Ie.update(ce.inputSource,ce.frame,M||v),Ie.dispatchEvent({type:ce.type,data:ce.inputSource})}function le(){x.removeEventListener("select",ie),x.removeEventListener("selectstart",ie),x.removeEventListener("selectend",ie),x.removeEventListener("squeeze",ie),x.removeEventListener("squeezestart",ie),x.removeEventListener("squeezeend",ie),x.removeEventListener("end",le),x.removeEventListener("inputsourceschange",te);for(let ce=0;ce<O.length;ce++){let ye=F[ce];if(ye===null)continue;F[ce]=null,O[ce].disconnect(ye)}ee=null,X=null,N.reset();for(let ce in C)delete C[ce];if(m.setRenderTarget(L),T=null,A=null,E=null,x=null,U=null,Te.stop(),_.isPresenting=!1,m.setPixelRatio(D),m.setSize(k.width,k.height,!1),B!==null){let ce=B.camera;ce.fov=B.fov,ce.zoom=B.zoom,ce.updateProjectionMatrix(),B=null}_.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ce){if(y=ce,_.isPresenting===!0)qe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ce){if(b=ce,_.isPresenting===!0)qe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return M||v},this.setReferenceSpace=function(ce){M=ce},this.getBaseLayer=function(){return A!==null?A:T},this.getBinding=function(){if(E===null&&P)E=new XRWebGLBinding(x,g);return E},this.getFrame=function(){return R},this.getSession=function(){return x},this.setSession=async function(ce){if(x=ce,x!==null){if(L=m.getRenderTarget(),x.addEventListener("select",ie),x.addEventListener("selectstart",ie),x.addEventListener("selectend",ie),x.addEventListener("squeeze",ie),x.addEventListener("squeezestart",ie),x.addEventListener("squeezeend",ie),x.addEventListener("end",le),x.addEventListener("inputsourceschange",te),I.xrCompatible!==!0)await g.makeXRCompatible();if(D=m.getPixelRatio(),m.getSize(k),!(P&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Ie={antialias:I.antialias,alpha:!0,depth:I.depth,stencil:I.stencil,framebufferScaleFactor:y};T=new XRWebGLLayer(x,g,Ie),x.updateRenderState({baseLayer:T}),m.setPixelRatio(1),m.setSize(T.framebufferWidth,T.framebufferHeight,!1),U=new $n(T.framebufferWidth,T.framebufferHeight,{format:Ln,type:si,colorSpace:m.outputColorSpace,stencilBuffer:I.stencil,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1,storeMultisampledDepthBuffer:T.ignoreDepthValues===!1,storeMultisampledStencilBuffer:T.ignoreDepthValues===!1})}else{let Ie=null,xe=null,Ue=null;if(I.depth)Ue=I.stencil?g.DEPTH24_STENCIL8:g.DEPTH_COMPONENT24,Ie=I.stencil?Ki:or,xe=I.stencil?vs:Ji;let Ce={colorFormat:g.RGBA8,depthFormat:Ue,scaleFactor:y};E=this.getBinding(),A=E.createProjectionLayer(Ce),x.updateRenderState({layers:[A]}),m.setPixelRatio(1),m.setSize(A.textureWidth,A.textureHeight,!1),U=new $n(A.textureWidth,A.textureHeight,{format:Ln,type:si,depthTexture:new ts(A.textureWidth,A.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,Ie),stencilBuffer:I.stencil,colorSpace:m.outputColorSpace,samples:I.antialias?4:0,resolveDepthBuffer:A.ignoreDepthValues===!1,resolveStencilBuffer:A.ignoreDepthValues===!1,storeMultisampledDepthBuffer:A.ignoreDepthValues===!1,storeMultisampledStencilBuffer:A.ignoreDepthValues===!1})}U.isXRRenderTarget=!0,this.setFoveation(S),M=null,v=await x.requestReferenceSpace(b),Te.setContext(x),Te.start(),_.isPresenting=!0,_.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(x!==null)return x.environmentBlendMode},this.getDepthTexture=function(){return N.getDepthTexture()};function te(ce){for(let ye=0;ye<ce.removed.length;ye++){let Ie=ce.removed[ye],xe=F.indexOf(Ie);if(xe>=0)F[xe]=null,O[xe].disconnect(Ie)}for(let ye=0;ye<ce.added.length;ye++){let Ie=ce.added[ye],xe=F.indexOf(Ie);if(xe===-1){for(let Ce=0;Ce<O.length;Ce++)if(Ce>=F.length){F.push(Ie),xe=Ce;break}else if(F[Ce]===null){F[Ce]=Ie,xe=Ce;break}if(xe===-1)break}let Ue=O[xe];if(Ue)Ue.connect(Ie)}}function ve(ce,ye){if(ye===null)ce.matrixWorld.copy(ce.matrix);else ce.matrixWorld.multiplyMatrices(ye.matrixWorld,ce.matrix);ce.matrixWorldInverse.copy(ce.matrixWorld).invert()}this.updateCamera=function(ce){if(x===null)return;let{near:ye,far:Ie}=ce;if(N.texture!==null){if(N.depthNear>0)ye=N.depthNear;if(N.depthFar>0)Ie=N.depthFar}if(Y.near=W.near=z.near=ye,Y.far=W.far=z.far=Ie,ee!==Y.near||X!==Y.far)x.updateRenderState({depthNear:Y.near,depthFar:Y.far}),ee=Y.near,X=Y.far;Y.layers.mask=ce.layers.mask|6,z.layers.mask=Y.layers.mask&-5,W.layers.mask=Y.layers.mask&-3;let xe=ce.parent,Ue=Y.cameras;ve(Y,xe);for(let Ce=0;Ce<Ue.length;Ce++)ve(Ue[Ce],xe);if(Y.projectionMatrix.copy(z.projectionMatrix),Y.projectionMatrixInverse.copy(z.projectionMatrixInverse),B===null&&ce.isPerspectiveCamera)B={camera:ce,fov:ce.fov,zoom:ce.zoom};J(ce,Y,xe)};function J(ce,ye,Ie){if(Ie===null)ce.matrix.copy(ye.matrixWorld);else ce.matrix.copy(Ie.matrixWorld),ce.matrix.invert(),ce.matrix.multiply(ye.matrixWorld);if(ce.matrix.decompose(ce.position,ce.quaternion,ce.scale),ce.updateMatrixWorld(!0),ce.projectionMatrix.copy(ye.projectionMatrix),ce.projectionMatrixInverse.copy(ye.projectionMatrixInverse),ce.isPerspectiveCamera)ce.fov=tr*2*Math.atan(1/ce.projectionMatrix.elements[5]),ce.zoom=1}this.getCamera=function(){return Y},this.getFoveation=function(){if(A===null&&T===null)return;return S},this.setFoveation=function(ce){if(S=ce,A!==null)A.fixedFoveation=ce;if(T!==null&&T.fixedFoveation!==void 0)T.fixedFoveation=ce},this.hasDepthSensing=function(){return N.texture!==null},this.getDepthSensingMesh=function(){return N.getMesh(Y)},this.getCameraTexture=function(ce){return C[ce]};let ae=null;function ge(ce,ye){if(w=ye.getViewerPose(M||v),R=ye,w!==null){let Ie=w.views;if(T!==null)m.setRenderTargetFramebuffer(U,T.framebuffer),m.setRenderTarget(U);let xe=!1;if(Ie.length!==Y.cameras.length)Y.cameras.length=0,xe=!0;for(let tt=0;tt<Ie.length;tt++){let Be=Ie[tt],Ke=null;if(T!==null)Ke=T.getViewport(Be);else{let Ze=E.getViewSubImage(A,Be);if(Ke=Ze.viewport,tt===0)m.setRenderTargetTextures(U,Ze.colorTexture,Ze.depthStencilTexture),m.setRenderTarget(U)}let Ye=V[tt];if(Ye===void 0)Ye=new On,Ye.layers.enable(tt),Ye.viewport=new Ht,V[tt]=Ye;if(Ye.matrix.fromArray(Be.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Be.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(Ke.x,Ke.y,Ke.width,Ke.height),tt===0)Y.matrix.copy(Ye.matrix),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale);if(xe===!0)Y.cameras.push(Ye)}let Ue=x.enabledFeatures;if(Ue&&Ue.includes("depth-sensing")&&x.depthUsage=="gpu-optimized"&&P){E=_.getBinding();let tt=E.getDepthInformation(Ie[0]);if(tt&&tt.isValid&&tt.texture)N.init(tt,x.renderState)}if(Ue&&Ue.includes("camera-access")&&P){m.state.unbindTexture(),E=_.getBinding();for(let tt=0;tt<Ie.length;tt++){let Be=Ie[tt].camera;if(Be){let Ke=C[Be];if(!Ke)Ke=new Oa,C[Be]=Ke;let Ye=E.getCameraImage(Be);Ke.sourceTexture=Ye}}}}for(let Ie=0;Ie<O.length;Ie++){let xe=F[Ie],Ue=O[Ie];if(xe!==null&&Ue!==void 0)Ue.update(xe,ye,M||v)}if(ae)ae(ce,ye);if(ye.detectedPlanes)_.dispatchEvent({type:"planesdetected",data:ye});R=null}let Te=new am;Te.setAnimationLoop(ge),this.setAnimationLoop=function(ce){ae=ce},this.dispose=function(){}}}var SS=new Qe,wm=new et;wm.set(-1,0,0,0,1,0,0,0,1);function MS(m,g){function _(C,I){if(C.matrixAutoUpdate===!0)C.updateMatrix();I.value.copy(C.matrix)}function x(C,I){if(I.color.getRGB(C.fogColor.value,Bu(m)),I.isFog)C.fogNear.value=I.near,C.fogFar.value=I.far;else if(I.isFogExp2)C.fogDensity.value=I.density}function y(C,I,L,U,O){if(I.isNodeMaterial)I.uniformsNeedUpdate=!1;else if(I.isMeshBasicMaterial)v(C,I);else if(I.isMeshLambertMaterial){if(v(C,I),I.envMap)C.envMapIntensity.value=I.envMapIntensity}else if(I.isMeshToonMaterial)v(C,I),A(C,I);else if(I.isMeshPhongMaterial){if(v(C,I),E(C,I),I.envMap)C.envMapIntensity.value=I.envMapIntensity}else if(I.isMeshStandardMaterial){if(v(C,I),T(C,I),I.isMeshPhysicalMaterial)R(C,I,O)}else if(I.isMeshMatcapMaterial)v(C,I),P(C,I);else if(I.isMeshDepthMaterial)v(C,I);else if(I.isMeshDistanceMaterial)v(C,I),N(C,I);else if(I.isMeshNormalMaterial)v(C,I);else if(I.isLineBasicMaterial){if(b(C,I),I.isLineDashedMaterial)S(C,I)}else if(I.isPointsMaterial)M(C,I,L,U);else if(I.isSpriteMaterial)w(C,I);else if(I.isShadowMaterial)C.color.value.copy(I.color),C.opacity.value=I.opacity;else if(I.isShaderMaterial)I.uniformsNeedUpdate=!1}function v(C,I){if(C.opacity.value=I.opacity,I.color)C.diffuse.value.copy(I.color);if(I.emissive)C.emissive.value.copy(I.emissive).multiplyScalar(I.emissiveIntensity);if(I.map)C.map.value=I.map,_(I.map,C.mapTransform);if(I.alphaMap)C.alphaMap.value=I.alphaMap,_(I.alphaMap,C.alphaMapTransform);if(I.bumpMap){if(C.bumpMap.value=I.bumpMap,_(I.bumpMap,C.bumpMapTransform),C.bumpScale.value=I.bumpScale,I.side===Mn)C.bumpScale.value*=-1}if(I.normalMap){if(C.normalMap.value=I.normalMap,_(I.normalMap,C.normalMapTransform),C.normalScale.value.copy(I.normalScale),I.side===Mn)C.normalScale.value.negate()}if(I.displacementMap)C.displacementMap.value=I.displacementMap,_(I.displacementMap,C.displacementMapTransform),C.displacementScale.value=I.displacementScale,C.displacementBias.value=I.displacementBias;if(I.emissiveMap)C.emissiveMap.value=I.emissiveMap,_(I.emissiveMap,C.emissiveMapTransform);if(I.specularMap)C.specularMap.value=I.specularMap,_(I.specularMap,C.specularMapTransform);if(I.alphaTest>0)C.alphaTest.value=I.alphaTest;let L=g.get(I),{envMap:U,envMapRotation:O}=L;if(U){if(C.envMap.value=U,C.envMapRotation.value.setFromMatrix4(SS.makeRotationFromEuler(O)).transpose(),U.isCubeTexture&&U.isRenderTargetTexture===!1)C.envMapRotation.value.premultiply(wm);C.reflectivity.value=I.reflectivity,C.ior.value=I.ior,C.refractionRatio.value=I.refractionRatio}if(I.lightMap)C.lightMap.value=I.lightMap,C.lightMapIntensity.value=I.lightMapIntensity,_(I.lightMap,C.lightMapTransform);if(I.aoMap)C.aoMap.value=I.aoMap,C.aoMapIntensity.value=I.aoMapIntensity,_(I.aoMap,C.aoMapTransform)}function b(C,I){if(C.diffuse.value.copy(I.color),C.opacity.value=I.opacity,I.map)C.map.value=I.map,_(I.map,C.mapTransform)}function S(C,I){C.dashSize.value=I.dashSize,C.totalSize.value=I.dashSize+I.gapSize,C.scale.value=I.scale}function M(C,I,L,U){if(C.diffuse.value.copy(I.color),C.opacity.value=I.opacity,C.size.value=I.size*L,C.scale.value=U*0.5,I.map)C.map.value=I.map,_(I.map,C.uvTransform);if(I.alphaMap)C.alphaMap.value=I.alphaMap,_(I.alphaMap,C.alphaMapTransform);if(I.alphaTest>0)C.alphaTest.value=I.alphaTest}function w(C,I){if(C.diffuse.value.copy(I.color),C.opacity.value=I.opacity,C.rotation.value=I.rotation,I.map)C.map.value=I.map,_(I.map,C.mapTransform);if(I.alphaMap)C.alphaMap.value=I.alphaMap,_(I.alphaMap,C.alphaMapTransform);if(I.alphaTest>0)C.alphaTest.value=I.alphaTest}function E(C,I){C.specular.value.copy(I.specular),C.shininess.value=Math.max(I.shininess,0.0001)}function A(C,I){if(I.gradientMap)C.gradientMap.value=I.gradientMap}function T(C,I){if(C.metalness.value=I.metalness,I.metalnessMap)C.metalnessMap.value=I.metalnessMap,_(I.metalnessMap,C.metalnessMapTransform);if(C.roughness.value=I.roughness,I.roughnessMap)C.roughnessMap.value=I.roughnessMap,_(I.roughnessMap,C.roughnessMapTransform);if(I.envMap)C.envMapIntensity.value=I.envMapIntensity}function R(C,I,L){if(C.ior.value=I.ior,I.diffuseRoughness>0){if(C.diffuseRoughness.value=I.diffuseRoughness,I.diffuseRoughnessMap)C.diffuseRoughnessMap.value=I.diffuseRoughnessMap,_(I.diffuseRoughnessMap,C.diffuseRoughnessMapTransform)}if(I.sheen>0){if(C.sheenColor.value.copy(I.sheenColor).multiplyScalar(I.sheen),C.sheenRoughness.value=I.sheenRoughness,I.sheenColorMap)C.sheenColorMap.value=I.sheenColorMap,_(I.sheenColorMap,C.sheenColorMapTransform);if(I.sheenRoughnessMap)C.sheenRoughnessMap.value=I.sheenRoughnessMap,_(I.sheenRoughnessMap,C.sheenRoughnessMapTransform)}if(I.clearcoat>0){if(C.clearcoat.value=I.clearcoat,C.clearcoatRoughness.value=I.clearcoatRoughness,I.clearcoatMap)C.clearcoatMap.value=I.clearcoatMap,_(I.clearcoatMap,C.clearcoatMapTransform);if(I.clearcoatRoughnessMap)C.clearcoatRoughnessMap.value=I.clearcoatRoughnessMap,_(I.clearcoatRoughnessMap,C.clearcoatRoughnessMapTransform);if(I.clearcoatNormalMap){if(C.clearcoatNormalMap.value=I.clearcoatNormalMap,_(I.clearcoatNormalMap,C.clearcoatNormalMapTransform),C.clearcoatNormalScale.value.copy(I.clearcoatNormalScale),I.side===Mn)C.clearcoatNormalScale.value.negate()}}if(I.dispersion>0)C.dispersion.value=I.dispersion;if(I.retroreflectivity>0)C.retroreflectivity.value=I.retroreflectivity;if(I.iridescence>0){if(C.iridescence.value=I.iridescence,C.iridescenceIOR.value=I.iridescenceIOR,C.iridescenceThicknessMinimum.value=I.iridescenceThicknessMinimum,C.iridescenceThicknessMaximum.value=I.iridescenceThicknessMaximum,I.iridescenceMap)C.iridescenceMap.value=I.iridescenceMap,_(I.iridescenceMap,C.iridescenceMapTransform);if(I.iridescenceThicknessMap)C.iridescenceThicknessMap.value=I.iridescenceThicknessMap,_(I.iridescenceThicknessMap,C.iridescenceThicknessMapTransform)}if(I.transmission>0){if(C.transmission.value=I.transmission,C.transmissionSamplerMap.value=L.texture,C.transmissionSamplerSize.value.set(L.width,L.height),I.transmissionMap)C.transmissionMap.value=I.transmissionMap,_(I.transmissionMap,C.transmissionMapTransform);if(C.thickness.value=I.thickness,I.thicknessMap)C.thicknessMap.value=I.thicknessMap,_(I.thicknessMap,C.thicknessMapTransform);C.attenuationDistance.value=I.attenuationDistance,C.attenuationColor.value.copy(I.attenuationColor)}if(I.anisotropy>0){if(C.anisotropyVector.value.set(I.anisotropy*Math.cos(I.anisotropyRotation),I.anisotropy*Math.sin(I.anisotropyRotation)),I.anisotropyMap)C.anisotropyMap.value=I.anisotropyMap,_(I.anisotropyMap,C.anisotropyMapTransform)}if(C.specularIntensity.value=I.specularIntensity,C.specularColor.value.copy(I.specularColor),I.specularColorMap)C.specularColorMap.value=I.specularColorMap,_(I.specularColorMap,C.specularColorMapTransform);if(I.specularIntensityMap)C.specularIntensityMap.value=I.specularIntensityMap,_(I.specularIntensityMap,C.specularIntensityMapTransform)}function P(C,I){if(I.matcap)C.matcap.value=I.matcap}function N(C,I){let L=g.get(I).light;C.referencePosition.value.setFromMatrixPosition(L.matrixWorld),C.nearDistance.value=L.shadow.camera.near,C.farDistance.value=L.shadow.camera.far}return{refreshFogUniforms:x,refreshMaterialUniforms:y}}function wS(m,g,_,x){let y={},v={};function b(L,U){let O=U.program;x.uniformBlockBinding(L,O,y[L.id])}function S(L,U){let O=y[L.id];if(O===void 0)P(L),O=M(L),y[L.id]=O,L.addEventListener("dispose",C);let F=U.program;x.updateUBOMapping(L,F);let k=g.render.frame;if(v[L.id]!==k)w(L),v[L.id]=k}function M(L){let U=m.createBuffer(),{__size:O,usage:F}=L;return m.bindBuffer(m.UNIFORM_BUFFER,U),m.bufferData(m.UNIFORM_BUFFER,O,F),m.bindBuffer(m.UNIFORM_BUFFER,null),U}function w(L){let U=y[L.id],{uniforms:O,__cache:F}=L;m.bindBuffer(m.UNIFORM_BUFFER,U);for(let k=0,D=O.length;k<D;k++){let B=O[k];if(Array.isArray(B))for(let z=0,W=B.length;z<W;z++)E(B[z],k,z,F);else E(B,k,0,F)}m.bindBuffer(m.UNIFORM_BUFFER,null)}function E(L,U,O,F){if(T(L,U,O,F)===!0){let{__offset:k,value:D}=L;if(Array.isArray(D)){let B=0;for(let z=0;z<D.length;z++){let W=D[z],V=N(W,!0);A(W,L.__data,B),B+=V.storage/Float32Array.BYTES_PER_ELEMENT}}else A(D,L.__data,0);m.bufferSubData(m.UNIFORM_BUFFER,k,L.__data)}}function A(L,U,O){if(typeof L==="number"||typeof L==="boolean")U[O]=L;else if(L.isMatrix3)U[O]=L.elements[0],U[O+1]=L.elements[1],U[O+2]=L.elements[2],U[O+3]=0,U[O+4]=L.elements[3],U[O+5]=L.elements[4],U[O+6]=L.elements[5],U[O+7]=0,U[O+8]=L.elements[6],U[O+9]=L.elements[7],U[O+10]=L.elements[8],U[O+11]=0;else if(ArrayBuffer.isView(L))U.set(L.subarray(0,U.length-O),O);else L.toArray(U,O)}function T(L,U,O,F){let k=L.value,D=U+"_"+O;if(Array.isArray(k)){if(F[D]===void 0)F[D]=[];let B=F[D],z=!1;for(let W=0;W<k.length;W++)if(R(k[W],B,W)===!0)z=!0;return z}return R(k,F,D)}function R(L,U,O){if(U[O]===void 0){if(typeof L==="number"||typeof L==="boolean")U[O]=L;else if(ArrayBuffer.isView(L))U[O]=L.slice();else U[O]=L.clone();return!0}else{let F=U[O];if(typeof L==="number"||typeof L==="boolean"){if(F!==L)return U[O]=L,!0}else if(ArrayBuffer.isView(L))return!0;else if(F.equals(L)===!1)return F.copy(L),!0}return!1}function P(L){let U=L.uniforms,O=0,F=16;for(let D=0,B=U.length;D<B;D++){let z=Array.isArray(U[D])?U[D]:[U[D]];for(let W=0,V=z.length;W<V;W++){let Y=z[W],ee=Array.isArray(Y.value)?Y.value:[Y.value],X=Array.isArray(U[D])||Array.isArray(Y.value),ie=O;for(let te=0,ve=ee.length;te<ve;te++){let J=ee[te],ae=N(J,X),ge=O%F,Te=ge%ae.boundary,ce=ge+Te;if(O+=Te,ce!==0&&F-ce<ae.storage)O+=F-ce;if(te===0)ie=O;O+=ae.storage}let le=Y.type==="int"?Int32Array:Y.type==="uint"?Uint32Array:Float32Array;Y.__data=new le((O-ie)/Float32Array.BYTES_PER_ELEMENT),Y.__offset=ie}}let k=O%F;if(k>0)O+=F-k;return L.__size=O,L.__cache={},this}function N(L,U){let O={boundary:0,storage:0};if(typeof L==="number"||typeof L==="boolean")O.boundary=4,O.storage=4;else if(L.isVector2)O.boundary=8,O.storage=8;else if(L.isVector3||L.isColor)O.boundary=16,O.storage=12;else if(L.isVector4)O.boundary=16,O.storage=16;else if(L.isMatrix3)O.boundary=16,O.storage=48;else if(L.isMatrix4)O.boundary=16,O.storage=64;else if(L.isTexture)qe("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(L))O.boundary=16,O.storage=L.byteLength;else qe("WebGLRenderer: Unsupported uniform value type.",L);if(U===!0)O.boundary=16,O.storage=Math.ceil(O.storage/16)*16;return O}function C(L){let U=L.target;U.removeEventListener("dispose",C),m.deleteBuffer(y[U.id]),delete y[U.id],delete v[U.id]}function I(){for(let L in y)m.deleteBuffer(y[L]);y={},v={}}return{bind:b,update:S,dispose:I}}var ES=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),fi=null;function TS(){if(fi===null)fi=new Yi(ES,16,16,bs,di),fi.name="DFG_LUT",fi.minFilter=wn,fi.magFilter=wn,fi.wrapS=ya,fi.wrapT=ya,fi.generateMipmaps=!1,fi.needsUpdate=!0;return fi}class oh{constructor(m={}){let{canvas:g=Ap(),context:_=null,depth:x=!0,stencil:y=!1,alpha:v=!1,antialias:b=!1,premultipliedAlpha:S=!0,preserveDrawingBuffer:M=!1,powerPreference:w="default",failIfMajorPerformanceCaveat:E=!1,reversedDepthBuffer:A=!1,outputBufferType:T=si}=m;this.isWebGLRenderer=!0;let R;if(_!==null){if(typeof WebGLRenderingContext<"u"&&_ instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");R=_.getContextAttributes().alpha}else R=v;let P=T,N=new Set([Zc,$c,Yc]),C=new Set([si,Ji,eo,vs,Xc,qc]),I=new Uint32Array(4),L=new Int32Array(4),U={textures:[],min:[],max:[],resolution:[]},O=null,F=null,k=[],D=[],B=null;this.domElement=g,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=hi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let z=this,W=!1,V=null,Y=null,ee=null,X=null;this._outputColorSpace=wa;let ie=0,le=0,te=null,ve=-1,J=null,ae=new Ht,ge=new Ht,Te=null,ce=new st(0),ye=0,{width:Ie,height:xe}=g,Ue=1,Ce=null,rt=null,tt=new Ht(0,0,Ie,xe),Be=new Ht(0,0,Ie,xe),Ke=!1,Ye=new $i,Ze=new ao,pt=!1,vt=!1,_t=new Qe,ot=new Z,ct=new Ht,bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},kt=!1;function Ut(){return te===null?Ue:1}let Q=_;function $t(G,j){return g.getContext(G,j)}let mt,Wt,Pe,Tt,Ge,je,en,q,H,se,Se,_e,we,Me,ue,pe,Ee,K,fe,de,ne,me,be;try{let G={alpha:!0,depth:x,stencil:y,antialias:b,premultipliedAlpha:S,preserveDrawingBuffer:M,powerPreference:w,failIfMajorPerformanceCaveat:E};if("setAttribute"in g)g.setAttribute("data-engine",`three.js r${xs}`);if(g.addEventListener("webglcontextlost",Ne,!1),g.addEventListener("webglcontextrestored",Xe,!1),g.addEventListener("webglcontextcreationerror",at,!1),Q===null){if(Q=$t("webgl2",G),Q===null)if($t("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}ke()}catch(G){throw g.removeEventListener("webglcontextlost",Ne,!1),g.removeEventListener("webglcontextrestored",Xe,!1),g.removeEventListener("webglcontextcreationerror",at,!1),Je("WebGLRenderer: "+G.message),G}function ke(){if(mt=new Fv(Q),mt.init(),ne=new yS(Q,mt),Wt=new Tv(Q,mt,m,ne),Pe=new _S(Q,mt),Wt.reversedDepthBuffer&&A)Pe.buffers.depth.setReversed(!0);Y=Q.createFramebuffer(),ee=Q.createFramebuffer(),X=Q.createFramebuffer(),Tt=new zv(Q),Ge=new iS,je=new xS(Q,mt,Pe,Ge,Wt,ne,Tt),en=new Uv(z),q=new G_(Q),me=new wv(Q,q),H=new Bv(Q,q,Tt,me),se=new Gv(Q,H,q,me,Tt),K=new Hv(Q,Wt,je),ue=new Av(Ge),Se=new nS(z,en,mt,Wt,me,ue),_e=new MS(z,Ge),we=new rS,Me=new hS(mt),Ee=new Mv(z,en,Pe,se,R,S),pe=new gS(z,se,Wt),be=new wS(Q,Tt,Wt,Pe),fe=new Ev(Q,mt,Tt),de=new kv(Q,mt,Tt),Tt.programs=Se.programs,z.capabilities=Wt,z.extensions=mt,z.properties=Ge,z.renderLists=we,z.shadowMap=pe,z.state=Pe,z.info=Tt}if(P!==si)B=new Wv(P,g.width,g.height,b,x,y);let Ve=new Mm(z,Q);this.xr=Ve,this.getContext=function(){return Q},this.getContextAttributes=function(){return Q.getContextAttributes()},this.forceContextLoss=function(){let G=mt.get("WEBGL_lose_context");if(G)G.loseContext()},this.forceContextRestore=function(){let G=mt.get("WEBGL_lose_context");if(G)G.restoreContext()},this.getPixelRatio=function(){return Ue},this.setPixelRatio=function(G){if(G===void 0)return;Ue=G,this.setSize(Ie,xe,!1)},this.getSize=function(G){return G.set(Ie,xe)},this.setSize=function(G,j,he=!0){if(Ve.isPresenting){qe("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Ie=G,xe=j,g.width=Math.floor(G*Ue),g.height=Math.floor(j*Ue),he===!0)g.style.width=G+"px",g.style.height=j+"px";if(B!==null)B.setSize(g.width,g.height);this.setViewport(0,0,G,j)},this.getDrawingBufferSize=function(G){return G.set(Ie*Ue,xe*Ue).floor()},this.setDrawingBufferSize=function(G,j,he){Ie=G,xe=j,Ue=he,g.width=Math.floor(G*he),g.height=Math.floor(j*he),this.setViewport(0,0,G,j)},this.setEffects=function(G){if(P===si){Je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(G){for(let j=0;j<G.length;j++)if(G[j].isOutputPass===!0){qe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}B.setEffects(G||[])},this.getCurrentViewport=function(G){return G.copy(ae)},this.getViewport=function(G){return G.copy(tt)},this.setViewport=function(G,j,he,re){if(G.isVector4)tt.set(G.x,G.y,G.z,G.w);else tt.set(G,j,he,re);Pe.viewport(ae.copy(tt).multiplyScalar(Ut()).round())},this.getScissor=function(G){return G.copy(Be)},this.setScissor=function(G,j,he,re){if(G.isVector4)Be.set(G.x,G.y,G.z,G.w);else Be.set(G,j,he,re);Pe.scissor(ge.copy(Be).multiplyScalar(Ut()).round())},this.getScissorTest=function(){return Ke},this.setScissorTest=function(G){Pe.setScissorTest(Ke=G)},this.setOpaqueSort=function(G){Ce=G},this.setTransparentSort=function(G){rt=G},this.getClearColor=function(G){return G.copy(Ee.getClearColor())},this.setClearColor=function(){Ee.setClearColor(...arguments)},this.getClearAlpha=function(){return Ee.getClearAlpha()},this.setClearAlpha=function(){Ee.setClearAlpha(...arguments)},this.clear=function(G=!0,j=!0,he=!0){let re=0;if(G){let oe=!1;if(te!==null){let Re=te.texture.format;oe=N.has(Re)}if(oe){let Re=te.texture.type,Fe=C.has(Re),Ae=Ee.getClearColor(),Oe=Ee.getClearAlpha(),{r:We,g:nt,b:dt}=Ae;if(Fe)I[0]=We,I[1]=nt,I[2]=dt,I[3]=Oe,Q.clearBufferuiv(Q.COLOR,0,I);else L[0]=We,L[1]=nt,L[2]=dt,L[3]=Oe,Q.clearBufferiv(Q.COLOR,0,L)}else re|=Q.COLOR_BUFFER_BIT}if(j)re|=Q.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(he)re|=Q.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(re!==0)Q.clear(re)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(G){G.setRenderer(this),V=G},this.dispose=function(){g.removeEventListener("webglcontextlost",Ne,!1),g.removeEventListener("webglcontextrestored",Xe,!1),g.removeEventListener("webglcontextcreationerror",at,!1),Ee.dispose(),we.dispose(),Me.dispose(),je.dispose(),Ge.dispose(),en.dispose(),se.dispose(),H.dispose(),me.dispose(),be.dispose(),Se.dispose(),Ve.dispose(),Ve.removeEventListener("sessionstart",Xh),Ve.removeEventListener("sessionend",qh),ls.stop()};function Ne(G){G.preventDefault(),Zr("WebGLRenderer: Context Lost."),W=!0}function Xe(){Zr("WebGLRenderer: Context Restored."),W=!1;let G=Tt.autoReset,j=pe.enabled,he=pe.autoUpdate,re=pe.needsUpdate,oe=pe.type;ke(),Tt.autoReset=G,pe.enabled=j,pe.autoUpdate=he,pe.needsUpdate=re,pe.type=oe}function at(G){Je("WebGLRenderer: A WebGL context could not be created. Reason: ",G.statusMessage)}function De(G){let j=G.target;j.removeEventListener("dispose",De),Ct(j)}function Ct(G){ln(G),Ge.remove(G)}function ln(G){let j=Ge.get(G).programs;if(j!==void 0){if(j.forEach(function(he){Se.releaseProgram(he)}),G.isShaderMaterial)Se.releaseShaderCache(G)}}this.renderBufferDirect=function(G,j,he,re,oe,Re){if(j===null)j=bt;let Fe=oe.isMesh&&oe.matrixWorld.determinantAffine()<0,Ae=$g(G,j,he,re,oe);Pe.setMaterial(re,Fe);let Oe=he.index,We=1;if(re.wireframe===!0){if(Oe=H.getWireframeAttribute(he),Oe===void 0)return;We=2}let nt=he.drawRange,dt=he.attributes.position,ze=nt.start*We,ft=(nt.start+nt.count)*We;if(Re!==null)ze=Math.max(ze,Re.start*We),ft=Math.min(ft,(Re.start+Re.count)*We);if(Oe!==null)ze=Math.max(ze,0),ft=Math.min(ft,Oe.count);else if(dt!==void 0&&dt!==null)ze=Math.max(ze,0),ft=Math.min(ft,dt.count);let Zt=ft-ze;if(Zt<0||Zt===1/0)return;me.setup(oe,re,Ae,he,Oe);let Ft,Lt=fe;if(Oe!==null)Ft=q.get(Oe),Lt=de,Lt.setIndex(Ft);if(oe.isMesh)if(re.wireframe===!0)Pe.setLineWidth(re.wireframeLinewidth*Ut()),Lt.setMode(Q.LINES);else Lt.setMode(Q.TRIANGLES);else if(oe.isLine){let xn=re.linewidth;if(xn===void 0)xn=1;if(Pe.setLineWidth(xn*Ut()),oe.isLineSegments)Lt.setMode(Q.LINES);else if(oe.isLineLoop)Lt.setMode(Q.LINE_LOOP);else Lt.setMode(Q.LINE_STRIP)}else if(oe.isPoints)Lt.setMode(Q.POINTS);else if(oe.isSprite)Lt.setMode(Q.TRIANGLES);if(oe.isBatchedMesh)if(!mt.get("WEBGL_multi_draw")){let{_multiDrawStarts:xn,_multiDrawCounts:He,_multiDrawCount:Rn}=oe,St=Oe?q.get(Oe).bytesPerElement:1,cs=Ge.get(re).currentProgram.getUniforms();for(let yn=0;yn<Rn;yn++)cs.setValue(Q,"_gl_DrawID",yn),Lt.render(xn[yn]/St,He[yn])}else Lt.renderMultiDraw(oe._multiDrawStarts,oe._multiDrawCounts,oe._multiDrawCount);else if(oe.isInstancedMesh)Lt.renderInstances(ze,Zt,oe.count);else if(he.isInstancedBufferGeometry){let xn=he._maxInstanceCount!==void 0?he._maxInstanceCount:1/0,He=Math.min(he.instanceCount,xn);Lt.renderInstances(ze,Zt,He)}else Lt.render(ze,Zt)};function _i(G,j,he,re){if(V!==null&&G.isNodeMaterial)V.setObject(re,G);if(pt===!0)ue.setState(G,he,!1);if(G.transparent===!0&&G.side===In&&G.forceSinglePass===!1)G.side=Mn,G.needsUpdate=!0,Lr(G,j,re),G.side=Ri,G.needsUpdate=!0,Lr(G,j,re),G.side=In;else Lr(G,j,re)}this.compile=function(G,j,he=null){if(he===null)he=G;if(V!==null)V.renderStart(G,j,he);if(F=Me.get(he),F.init(j),D.push(F),he.traverseVisible(function(oe){if(oe.isLight&&oe.layers.test(j.layers)){if(F.pushLight(oe),oe.castShadow)F.pushShadow(oe)}}),G!==he)G.traverseVisible(function(oe){if(oe.isLight&&oe.layers.test(j.layers)){if(F.pushLight(oe),oe.castShadow)F.pushShadow(oe)}});if(F.setupLights(),V!==null)V.updateLights(F.state.lightsArray);if(vt=this.localClippingEnabled,pt=ue.init(this.clippingPlanes,vt),pt===!0)ue.setGlobalState(this.clippingPlanes,j);if(V!==null)pe.render(F.state.shadowsArray,he,j);let re=new Set;if(G.traverse(function(oe){if(!(oe.isMesh||oe.isPoints||oe.isLine||oe.isSprite))return;let Re=oe.material;if(Re)if(Array.isArray(Re))for(let Fe=0;Fe<Re.length;Fe++){let Ae=Re[Fe];_i(Ae,he,j,oe),re.add(Ae)}else _i(Re,he,j,oe),re.add(Re)}),F=D.pop(),V!==null)V.renderEnd();return re},this.compileAsync=function(G,j,he=null){let re=this.compile(G,j,he);return new Promise((oe)=>{function Re(){if(re.forEach(function(Fe){let Oe=Ge.get(Fe).currentProgram;if(Oe===void 0||Oe.isReady())re.delete(Fe)}),re.size===0){oe(G);return}setTimeout(Re,10)}if(mt.get("KHR_parallel_shader_compile")!==null)Re();else setTimeout(Re,10)})};let Al=null;function qg(G){if(Al)Al(G)}function Xh(){ls.stop()}function qh(){ls.start()}let ls=new am;if(ls.setAnimationLoop(qg),typeof self<"u")ls.setContext(self);this.setAnimationLoop=function(G){Al=G,Ve.setAnimationLoop(G),G===null?ls.stop():ls.start()},Ve.addEventListener("sessionstart",Xh),Ve.addEventListener("sessionend",qh),this.render=function(G,j){if(j!==void 0&&j.isCamera!==!0){Je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;if(V!==null)V.renderStart(G,j);let he=Ve.enabled===!0&&Ve.isPresenting===!0,re=B!==null&&(te===null||he)&&B.begin(z,te);if(G.matrixWorldAutoUpdate===!0)G.updateMatrixWorld();if(j.parent===null&&j.matrixWorldAutoUpdate===!0)j.updateMatrixWorld();if(Ve.enabled===!0&&Ve.isPresenting===!0&&(B===null||B.isCompositing()===!1)){if(Ve.cameraAutoUpdate===!0)Ve.updateCamera(j);j=Ve.getCamera()}if(G.isScene===!0)G.onBeforeRender(z,G,j,te);if(F=Me.get(G,D.length),F.init(j),F.state.textureUnits=je.getTextureUnits(),D.push(F),_t.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),j.isArrayCamera)Ze.setFromArrayCamera(j);else Ye.setFromProjectionMatrix(_t,Pu,j.reversedDepth);if(vt=this.localClippingEnabled,pt=ue.init(this.clippingPlanes,vt),O=we.get(G,k.length),O.init(),k.push(O),this.info.render.frame++,Ve.enabled===!0&&Ve.isPresenting===!0){let Fe=z.xr.getDepthSensingMesh();if(Fe!==null)Rl(Fe,j,-1/0,z.sortObjects)}if(Rl(G,j,0,z.sortObjects),O.finish(),V!==null)V.updateLights(F.state.lightsArray);if(z.sortObjects===!0)O.sort(Ce,rt);if(kt=Ve.enabled===!1||Ve.isPresenting===!1||Ve.hasDepthSensing()===!1,kt)Ee.addToRenderList(O,G);if(this.info.autoReset===!0)this.info.reset();if(pt===!0)ue.beginShadows();let oe=F.state.shadowsArray;if(pe.render(oe,G,j),pt===!0)ue.endShadows();if((re&&B.hasRenderPass())===!1){let Fe=O.opaque,Ae=O.transmissive;if(F.setupLights(),j.isArrayCamera){let Oe=j.cameras;if(Ae.length>0)for(let We=0,nt=Oe.length;We<nt;We++){let dt=Oe[We];$h(Fe,Ae,G,dt)}if(kt)Ee.render(G);for(let We=0,nt=Oe.length;We<nt;We++){let dt=Oe[We];Yh(O,G,dt,dt.viewport)}}else{if(Ae.length>0)$h(Fe,Ae,G,j);if(kt)Ee.render(G);Yh(O,G,j)}}if(te!==null&&le===0)je.updateMultisampleRenderTarget(te),je.updateRenderTargetMipmap(te);if(re)B.end(z);if(G.isScene===!0)G.onAfterRender(z,G,j);if(me.resetDefaultState(),ve=-1,J=null,D.pop(),D.length>0){if(F=D[D.length-1],je.setTextureUnits(F.state.textureUnits),pt===!0)ue.setGlobalState(z.clippingPlanes,F.state.camera)}else F=null;if(k.pop(),k.length>0)O=k[k.length-1];else O=null;if(V!==null)V.renderEnd()};function Rl(G,j,he,re){if(G.visible===!1)return;if(G.layers.test(j.layers)){if(G.isGroup)he=G.renderOrder;else if(G.isLOD){if(G.autoUpdate===!0)G.update(j)}else if(G.isLight){if(F.pushLight(G),G.castShadow)F.pushShadow(G)}else if(G.isSprite){let Fe=j.isArrayCamera?Ze:Ye;if(!G.frustumCulled||G.intersectsFrustum(Fe)){if(re)ct.setFromMatrixPosition(G.matrixWorld).applyMatrix4(_t);let Ae=se.update(G),Oe=G.material;if(Oe.visible)O.push(G,Ae,Oe,he,ct.z,null,j)}}else if(G.isMesh||G.isLine||G.isPoints){let Fe=j.isArrayCamera?Ze:Ye;if(!G.frustumCulled||G.intersectsFrustum(Fe)){let Ae=se.update(G),Oe=G.material;if(re){if(G.boundingSphere!==void 0){if(G.boundingSphere===null)G.computeBoundingSphere();ct.copy(G.boundingSphere.center)}else{if(Ae.boundingSphere===null)Ae.computeBoundingSphere();ct.copy(Ae.boundingSphere.center)}ct.applyMatrix4(G.matrixWorld).applyMatrix4(_t)}if(Array.isArray(Oe)){let We=Ae.groups;for(let nt=0,dt=We.length;nt<dt;nt++){let ze=We[nt],ft=Oe[ze.materialIndex];if(ft&&ft.visible)O.push(G,Ae,ft,he,ct.z,ze,j)}}else if(Oe.visible)O.push(G,Ae,Oe,he,ct.z,null,j)}}}let Re=G.children;for(let Fe=0,Ae=Re.length;Fe<Ae;Fe++)Rl(Re[Fe],j,he,re)}function Yh(G,j,he,re){let{opaque:oe,transmissive:Re,transparent:Fe}=G;if(F.setupLightsView(he),pt===!0)ue.setGlobalState(z.clippingPlanes,he);if(re)Pe.viewport(ae.copy(re));if(oe.length>0)No(oe,j,he);if(Re.length>0)No(Re,j,he);if(Fe.length>0)No(Fe,j,he);Pe.buffers.depth.setTest(!0),Pe.buffers.depth.setMask(!0),Pe.buffers.color.setMask(!0),Pe.setPolygonOffset(!1)}function $h(G,j,he,re){if((he.isScene===!0?he.overrideMaterial:null)!==null)return;if(F.state.transmissionRenderTarget[re.id]===void 0){let ze=mt.has("EXT_color_buffer_half_float")||mt.has("EXT_color_buffer_float");F.state.transmissionRenderTarget[re.id]=new $n(1,1,{generateMipmaps:!0,type:ze?di:si,minFilter:ii,samples:Math.max(4,Wt.samples),stencilBuffer:y,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ut.workingColorSpace})}let Re=F.state.transmissionRenderTarget[re.id],Fe=re.viewport||ae;Re.setSize(Fe.z*z.transmissionResolutionScale,Fe.w*z.transmissionResolutionScale);let Ae=z.getRenderTarget(),Oe=z.getActiveCubeFace(),We=z.getActiveMipmapLevel();if(z.setRenderTarget(Re),z.getClearColor(ce),ye=z.getClearAlpha(),ye<1)z.setClearColor(16777215,0.5);if(z.clear(),kt)Ee.render(he);let nt=z.toneMapping;z.toneMapping=hi;let dt=re.viewport;if(re.viewport!==void 0)re.viewport=void 0;if(F.setupLightsView(re),pt===!0)ue.setGlobalState(z.clippingPlanes,re);if(No(G,he,re),je.updateMultisampleRenderTarget(Re),je.updateRenderTargetMipmap(Re),mt.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let ft=0,Zt=j.length;ft<Zt;ft++){let Ft=j[ft],{object:Lt,geometry:xn,material:He,group:Rn}=Ft;if(He.side===In&&Lt.layers.test(re.layers)){let St=He.side;He.side=Mn,He.needsUpdate=!0,Zh(Lt,he,re,xn,He,Rn),He.side=St,He.needsUpdate=!0,ze=!0}}if(ze===!0)je.updateMultisampleRenderTarget(Re),je.updateRenderTargetMipmap(Re)}if(z.setRenderTarget(Ae,Oe,We),z.setClearColor(ce,ye),dt!==void 0)re.viewport=dt;z.toneMapping=nt}function No(G,j,he){let re=j.isScene===!0?j.overrideMaterial:null;for(let oe=0,Re=G.length;oe<Re;oe++){let Fe=G[oe],{object:Ae,geometry:Oe,group:We}=Fe,nt=Fe.material;if(nt.allowOverride===!0&&re!==null)nt=re;if(Ae.layers.test(he.layers))Zh(Ae,j,he,Oe,nt,We)}}function Zh(G,j,he,re,oe,Re){if(V!==null&&oe.isNodeMaterial)V.setObject(G,oe);if(G.onBeforeRender(z,j,he,re,oe,Re),G.modelViewMatrix.multiplyMatrices(he.matrixWorldInverse,G.matrixWorld),G.normalMatrix.getNormalMatrix(G.modelViewMatrix),oe.onBeforeRender(z,j,he,re,G,Re),oe.transparent===!0&&oe.side===In&&oe.forceSinglePass===!1)oe.side=Mn,oe.needsUpdate=!0,z.renderBufferDirect(he,j,re,oe,G,Re),oe.side=Ri,oe.needsUpdate=!0,z.renderBufferDirect(he,j,re,oe,G,Re),oe.side=In;else z.renderBufferDirect(he,j,re,oe,G,Re);G.onAfterRender(z,j,he,re,oe,Re)}function Jh(G){let j=0;for(let he of G)if(he.texture!==null)j++;return j}function Lr(G,j,he){if(j.isScene!==!0)j=bt;let re=Ge.get(G),oe=F.state.lights,Re=F.state.shadowsArray,Fe=oe.state.version,Ae=Se.getParameters(G,oe.state,Re,j,he,F.state.lightProbeGridArray),Oe=Se.getProgramCacheKey(Ae),We=re.programs;re.environment=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?j.environment:null,re.fog=j.fog;let nt=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap;if(re.envMap=en.get(G.envMap||re.environment,nt),re.envMapRotation=re.environment!==null&&G.envMap===null?j.environmentRotation:G.envMapRotation,We===void 0)G.addEventListener("dispose",De),We=new Map,re.programs=We,re.programVariants=new Map;let dt=We.get(Oe);if(dt!==void 0){if(re.currentProgram===dt&&re.lightsStateVersion===Fe)return jh(G,Ae),dt}else{if(Ae.uniforms=Se.getUniforms(G),V!==null&&G.isNodeMaterial)V.build(G,he,Ae);G.onBeforeCompile(Ae,z),dt=Se.acquireProgram(Ae,Oe),We.set(Oe,dt),re.uniforms=Ae.uniforms}let ze=re.uniforms;if(!G.isShaderMaterial&&!G.isRawShaderMaterial||G.clipping===!0)ze.clippingPlanes=ue.uniform;if(jh(G,Ae),re.needsLights=Jg(G),re.lightsStateVersion=Fe,re.needsLights)ze.ambientLightColor.value=oe.state.ambient,ze.lightProbe.value=oe.state.probe,ze.sunLights.value=oe.state.sun,ze.sunLightShadows.value=oe.state.sunShadow,ze.directionalLights.value=oe.state.directional,ze.directionalLightShadows.value=oe.state.directionalShadow,ze.spotLights.value=oe.state.spot,ze.spotLightShadows.value=oe.state.spotShadow,ze.rectAreaLights.value=oe.state.rectArea,ze.ltc_1.value=oe.state.rectAreaLTC1,ze.ltc_2.value=oe.state.rectAreaLTC2,ze.pointLights.value=oe.state.point,ze.pointLightShadows.value=oe.state.pointShadow,ze.hemisphereLights.value=oe.state.hemi,ze.sunShadowMatrix.value=oe.state.sunShadowMatrix,ze.sunShadowCascade.value=oe.state.sunShadowCascade,ze.directionalShadowMatrix.value=oe.state.directionalShadowMatrix,ze.spotLightMatrix.value=oe.state.spotLightMatrix,ze.spotLightMap.value=oe.state.spotLightMap,ze.pointShadowMatrix.value=oe.state.pointShadowMatrix;return re.numLightProbeGrids=Jh(F.state.lightProbeGridArray),re.currentProgram=dt,re.uniformsList=null,dt}function Yg(G,j,he,re,oe){let Re=Ge.get(G),Fe=Re.currentProgram.id+","+re+","+oe,Ae=Re.programVariants.get(Fe);if(Ae===void 0)Ae=Lr(G,j,he),Re.programVariants.set(Fe,Ae);else Re.currentProgram=Ae,Re.uniformsList=null,Re.outputColorSpace=re,Re.toneMapping=oe;return Ae}function Kh(G){if(G.uniformsList===null){let j=G.currentProgram.getUniforms();G.uniformsList=_o.seqWithValue(j.seq,G.uniforms)}return G.uniformsList}function jh(G,j){let he=Ge.get(G);he.outputColorSpace=j.outputColorSpace,he.batching=j.batching,he.batchingColor=j.batchingColor,he.instancing=j.instancing,he.instancingColor=j.instancingColor,he.instancingMorph=j.instancingMorph,he.skinning=j.skinning,he.morphTargets=j.morphTargets,he.morphNormals=j.morphNormals,he.morphColors=j.morphColors,he.morphTargetsCount=j.morphTargetsCount,he.numClippingPlanes=j.numClippingPlanes,he.numIntersection=j.numClipIntersection,he.vertexAlphas=j.vertexAlphas,he.vertexTangents=j.vertexTangents,he.toneMapping=j.toneMapping}function $g(G,j,he,re,oe){if(j.isScene!==!0)j=bt;je.resetTextureUnits();let Re=j.fog,Fe=re.isMeshStandardMaterial||re.isMeshLambertMaterial||re.isMeshPhongMaterial?j.environment:null,Ae=te===null?z.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:ut.workingColorSpace,Oe=re.isMeshStandardMaterial||re.isMeshLambertMaterial&&!re.envMap||re.isMeshPhongMaterial&&!re.envMap,We=en.get(re.envMap||Fe,Oe),nt=re.vertexColors===!0&&!!he.attributes.color&&he.attributes.color.itemSize===4,dt=!!he.attributes.tangent&&(!!re.normalMap||re.anisotropy>0),ze=!!he.morphAttributes.position,ft=!!he.morphAttributes.normal,Zt=!!he.morphAttributes.color,Ft=hi;if(re.toneMapped){if(te===null||te.isXRRenderTarget===!0)Ft=z.toneMapping}let Lt=he.morphAttributes.position||he.morphAttributes.normal||he.morphAttributes.color,xn=Lt!==void 0?Lt.length:0,He=Ge.get(re),Rn=F.state.lights;if(pt===!0){if(vt===!0||G!==J){let zt=G===J&&re.id===ve;ue.setState(re,G,zt)}}let St=!1,cs=!1;if(re.version===He.__version){if(He.needsLights&&He.lightsStateVersion!==Rn.state.version)St=!0;else if(oe.isBatchedMesh&&He.batching===!1)St=!0;else if(!oe.isBatchedMesh&&He.batching===!0)St=!0;else if(oe.isBatchedMesh&&He.batchingColor===!0&&oe._colorsTexture===null)St=!0;else if(oe.isBatchedMesh&&He.batchingColor===!1&&oe._colorsTexture!==null)St=!0;else if(oe.isInstancedMesh&&He.instancing===!1)St=!0;else if(!oe.isInstancedMesh&&He.instancing===!0)St=!0;else if(oe.isSkinnedMesh&&He.skinning===!1)St=!0;else if(!oe.isSkinnedMesh&&He.skinning===!0)St=!0;else if(oe.isInstancedMesh&&He.instancingColor===!0&&oe.instanceColor===null)St=!0;else if(oe.isInstancedMesh&&He.instancingColor===!1&&oe.instanceColor!==null)St=!0;else if(oe.isInstancedMesh&&He.instancingMorph===!0&&oe.morphTexture===null)St=!0;else if(oe.isInstancedMesh&&He.instancingMorph===!1&&oe.morphTexture!==null)St=!0;else if(He.envMap!==We)St=!0;else if(re.fog===!0&&He.fog!==Re)St=!0;else if(He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==ue.numPlanes||He.numIntersection!==ue.numIntersection))St=!0;else if(He.vertexAlphas!==nt)St=!0;else if(He.vertexTangents!==dt)St=!0;else if(He.morphTargets!==ze)St=!0;else if(He.morphNormals!==ft)St=!0;else if(He.morphColors!==Zt)St=!0;else if(He.morphTargetsCount!==xn)St=!0;else if(He.numLightProbeGrids!==Jh(F.state.lightProbeGridArray))St=!0;else if(He.outputColorSpace!==Ae||He.toneMapping!==Ft)cs=!0}else St=!0,He.__version=re.version;let yn=He.currentProgram;if(St===!0||cs===!0){if(yn=cs===!0?Yg(re,j,oe,Ae,Ft):Lr(re,j,oe),V&&re.isNodeMaterial)V.onUpdateProgram(re,yn,He)}let Do=!1,zi=!1,us=!1,xt=yn.getUniforms(),fn=He.uniforms;if(Pe.useProgram(yn.program))Do=!0,zi=!0,us=!0;if(re.id!==ve)ve=re.id,zi=!0;if(Do||J!==G){if(Pe.buffers.depth.getReversed()&&G.reversedDepth!==!0)G._reversedDepth=!0,G.updateProjectionMatrix();xt.setValue(Q,"projectionMatrix",G.projectionMatrix),xt.setValue(Q,"viewMatrix",G.matrixWorldInverse);let cn=xt.map.cameraPosition;if(cn!==void 0)cn.setValue(Q,ot.setFromMatrixPosition(G.matrixWorld));if(Wt.logarithmicDepthBuffer)xt.setValue(Q,"logDepthBufFC",2/(Math.log(G.far+1)/Math.LN2));if(re.isMeshPhongMaterial||re.isMeshToonMaterial||re.isMeshLambertMaterial||re.isMeshBasicMaterial||re.isMeshStandardMaterial||re.isShaderMaterial)xt.setValue(Q,"isOrthographic",G.isOrthographicCamera===!0);if(J!==G)J=G,zi=!0,us=!0}if(He.needsLights){if(Rn.state.sunShadowMap.length>0)xt.setValue(Q,"sunShadowMap",Rn.state.sunShadowMap,je);if(Rn.state.directionalShadowMap.length>0)xt.setValue(Q,"directionalShadowMap",Rn.state.directionalShadowMap,je);if(Rn.state.spotShadowMap.length>0)xt.setValue(Q,"spotShadowMap",Rn.state.spotShadowMap,je);if(Rn.state.pointShadowMap.length>0)xt.setValue(Q,"pointShadowMap",Rn.state.pointShadowMap,je)}if(oe.isSkinnedMesh){xt.setOptional(Q,oe,"bindMatrix"),xt.setOptional(Q,oe,"bindMatrixInverse");let zt=oe.skeleton;if(zt){if(zt.boneTexture===null)zt.computeBoneTexture();xt.setValue(Q,"boneTexture",zt.boneTexture,je)}}if(oe.isBatchedMesh){if(xt.setOptional(Q,oe,"batchingTexture"),xt.setValue(Q,"batchingTexture",oe._matricesTexture,je),xt.setOptional(Q,oe,"batchingIdTexture"),xt.setValue(Q,"batchingIdTexture",oe._indirectTexture,je),xt.setOptional(Q,oe,"batchingColorTexture"),oe._colorsTexture!==null)xt.setValue(Q,"batchingColorTexture",oe._colorsTexture,je)}let jn=he.morphAttributes;if(jn.position!==void 0||jn.normal!==void 0||jn.color!==void 0)K.update(oe,he,yn);if(zi||He.receiveShadow!==oe.receiveShadow)He.receiveShadow=oe.receiveShadow,xt.setValue(Q,"receiveShadow",oe.receiveShadow);if((re.isMeshStandardMaterial||re.isMeshLambertMaterial||re.isMeshPhongMaterial)&&re.envMap===null&&j.environment!==null)fn.envMapIntensity.value=j.environmentIntensity;if(fn.dfgLUT!==void 0)fn.dfgLUT.value=TS();if(zi){if(xt.setValue(Q,"toneMappingExposure",z.toneMappingExposure),He.needsLights)Zg(fn,us);if(Re&&re.fog===!0)_e.refreshFogUniforms(fn,Re);if(_e.refreshMaterialUniforms(fn,re,Ue,xe,F.state.transmissionRenderTarget[G.id]),He.needsLights&&He.numLightProbeGrids>0){let zt=U,cn=0;for(let xi of F.state.lightProbeGridArray){if(xi.texture===null)continue;zt.textures[cn]=xi.texture,zt.min[cn]=xi.boundingBox.min,zt.max[cn]=xi.boundingBox.max,zt.resolution[cn]=xi.resolution,cn++}for(let xi in zt)zt[xi].length=cn;fn.probesSH.value=zt.textures,fn.probesMin.value=zt.min,fn.probesMax.value=zt.max,fn.probesResolution.value=zt.resolution}_o.upload(Q,Kh(He),fn,je)}if(re.isShaderMaterial&&re.uniformsNeedUpdate===!0)_o.upload(Q,Kh(He),fn,je),re.uniformsNeedUpdate=!1;if(re.isSpriteMaterial)xt.setValue(Q,"center",oe.center);if(xt.setValue(Q,"modelViewMatrix",oe.modelViewMatrix),xt.setValue(Q,"normalMatrix",oe.normalMatrix),xt.setValue(Q,"modelMatrix",oe.matrixWorld),re.uniformsGroups!==void 0){let zt=re.uniformsGroups;for(let cn=0,xi=zt.length;cn<xi;cn++){let ed=zt[cn];be.update(ed,yn),be.bind(ed,yn)}}return yn}function Zg(G,j){G.ambientLightColor.needsUpdate=j,G.lightProbe.needsUpdate=j,G.sunLights.needsUpdate=j,G.sunLightShadows.needsUpdate=j,G.directionalLights.needsUpdate=j,G.directionalLightShadows.needsUpdate=j,G.pointLights.needsUpdate=j,G.pointLightShadows.needsUpdate=j,G.spotLights.needsUpdate=j,G.spotLightShadows.needsUpdate=j,G.rectAreaLights.needsUpdate=j,G.hemisphereLights.needsUpdate=j}function Jg(G){return G.isMeshLambertMaterial||G.isMeshToonMaterial||G.isMeshPhongMaterial||G.isMeshStandardMaterial||G.isShadowMaterial||G.isShaderMaterial&&G.lights===!0}this.getActiveCubeFace=function(){return ie},this.getActiveMipmapLevel=function(){return le},this.getRenderTarget=function(){return te},this.setRenderTargetTextures=function(G,j,he){let re=Ge.get(G);if(re.__autoAllocateDepthBuffer=G.resolveDepthBuffer===!1,re.__autoAllocateDepthBuffer===!1)re.__useRenderToTexture=!1;Ge.get(G.texture).__webglTexture=j,Ge.get(G.depthTexture).__webglTexture=re.__autoAllocateDepthBuffer?void 0:he,re.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(G,j){let he=Ge.get(G);he.__webglFramebuffer=j,he.__useDefaultFramebuffer=j===void 0},this.setRenderTarget=function(G,j=0,he=0){te=G,ie=j,le=he;let re=null,oe=!1,Re=!1;if(G){let Ae=Ge.get(G);if(Ae.__useDefaultFramebuffer!==void 0){Pe.bindFramebuffer(Q.FRAMEBUFFER,Ae.__webglFramebuffer),ae.copy(G.viewport),ge.copy(G.scissor),Te=G.scissorTest,Pe.viewport(ae),Pe.scissor(ge),Pe.setScissorTest(Te),ve=-1;return}else if(Ae.__webglFramebuffer===void 0)je.setupRenderTarget(G);else if(Ae.__hasExternalTextures)je.rebindTextures(G,Ge.get(G.texture).__webglTexture,Ge.get(G.depthTexture).__webglTexture);else if(G.depthBuffer){let nt=G.depthTexture;if(Ae.__boundDepthTexture!==nt){if(nt!==null&&Ge.has(nt)&&(G.width!==nt.image.width||G.height!==nt.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");je.setupDepthRenderbuffer(G)}}let Oe=G.texture;if(Oe.isData3DTexture||Oe.isDataArrayTexture||Oe.isCompressedArrayTexture)Re=!0;let We=Ge.get(G).__webglFramebuffer;if(G.isWebGLCubeRenderTarget){if(Array.isArray(We[j]))re=We[j][he];else re=We[j];oe=!0}else if(G.samples>0&&je.useMultisampledRTT(G)===!1)re=Ge.get(G).__webglMultisampledFramebuffer;else if(Array.isArray(We))re=We[he];else re=We;ae.copy(G.viewport),ge.copy(G.scissor),Te=G.scissorTest}else ae.copy(tt).multiplyScalar(Ue).floor(),ge.copy(Be).multiplyScalar(Ue).floor(),Te=Ke;if(he!==0)re=Y;if(Pe.bindFramebuffer(Q.FRAMEBUFFER,re))Pe.drawBuffers(G,re);if(Pe.viewport(ae),Pe.scissor(ge),Pe.setScissorTest(Te),oe){let Ae=Ge.get(G.texture);Q.framebufferTexture2D(Q.FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Q.TEXTURE_CUBE_MAP_POSITIVE_X+j,Ae.__webglTexture,he)}else if(Re){let Ae=j;for(let Oe=0;Oe<G.textures.length;Oe++){let We=Ge.get(G.textures[Oe]);Q.framebufferTextureLayer(Q.FRAMEBUFFER,Q.COLOR_ATTACHMENT0+Oe,We.__webglTexture,he,Ae)}}else if(G!==null&&he!==0){let Ae=Ge.get(G.texture);Q.framebufferTexture2D(Q.FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Q.TEXTURE_2D,Ae.__webglTexture,he)}ve=-1};function Qh(G){let j=Ge.get(G);if(j.__readFormat!==G.format||j.__readType!==G.type)j.__readFormat=G.format,j.__readType=G.type,j.__formatReadable=Wt.textureFormatReadable(G.format),j.__typeReadable=Wt.textureTypeReadable(G.type);return j}if(this.readRenderTargetPixels=function(G,j,he,re,oe,Re,Fe,Ae=0){if(!(G&&G.isWebGLRenderTarget)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Oe=Ge.get(G).__webglFramebuffer;if(G.isWebGLCubeRenderTarget&&Fe!==void 0){if(Oe=Oe[Fe],Array.isArray(Oe))Oe=Oe[0]}if(Oe){Pe.bindFramebuffer(Q.FRAMEBUFFER,Oe);try{let We=G.textures[Ae],{format:nt,type:dt}=We;if(G.textures.length>1)Q.readBuffer(Q.COLOR_ATTACHMENT0+Ae);let ze=Qh(We);if(ze.__formatReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ze.__typeReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(j>=0&&j<=G.width-re&&(he>=0&&he<=G.height-oe))Q.readPixels(j,he,re,oe,ne.convert(nt),ne.convert(dt),Re)}finally{let We=te!==null?Ge.get(te).__webglFramebuffer:null;Pe.bindFramebuffer(Q.FRAMEBUFFER,We)}}},this.readRenderTargetPixelsAsync=async function(G,j,he,re,oe,Re,Fe,Ae=0){if(!(G&&G.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Oe=Ge.get(G).__webglFramebuffer;if(G.isWebGLCubeRenderTarget&&Fe!==void 0){if(Oe=Oe[Fe],Array.isArray(Oe))Oe=Oe[0]}if(Oe)if(j>=0&&j<=G.width-re&&(he>=0&&he<=G.height-oe)){Pe.bindFramebuffer(Q.FRAMEBUFFER,Oe);let We=G.textures[Ae],{format:nt,type:dt}=We;if(G.textures.length>1)Q.readBuffer(Q.COLOR_ATTACHMENT0+Ae);let ze=Qh(We);if(ze.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ze.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ft=Q.createBuffer();Q.bindBuffer(Q.PIXEL_PACK_BUFFER,ft),Q.bufferData(Q.PIXEL_PACK_BUFFER,Re.byteLength,Q.STREAM_READ),Q.readPixels(j,he,re,oe,ne.convert(nt),ne.convert(dt),0),Q.bindBuffer(Q.PIXEL_PACK_BUFFER,null);let Zt=te!==null?Ge.get(te).__webglFramebuffer:null;Pe.bindFramebuffer(Q.FRAMEBUFFER,Zt);let Ft=Q.fenceSync(Q.SYNC_GPU_COMMANDS_COMPLETE,0);return Q.flush(),await Cp(Q,Ft,4),Q.bindBuffer(Q.PIXEL_PACK_BUFFER,ft),Q.getBufferSubData(Q.PIXEL_PACK_BUFFER,0,Re),Q.bindBuffer(Q.PIXEL_PACK_BUFFER,null),Q.deleteBuffer(ft),Q.deleteSync(Ft),Re}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(G,j=null,he=0){let re=Math.pow(2,-he),oe=Math.floor(G.image.width*re),Re=Math.floor(G.image.height*re),Fe=j!==null?j.x:0,Ae=j!==null?j.y:0;je.setTexture2D(G,0),Q.copyTexSubImage2D(Q.TEXTURE_2D,he,0,0,Fe,Ae,oe,Re),Pe.unbindTexture()},this.copyTextureToTexture=function(G,j,he=null,re=null,oe=0,Re=0){let Fe,Ae,Oe,We,nt,dt,ze,ft,Zt,Ft=G.isCompressedTexture?G.mipmaps[Re]:G.image;if(he!==null)Fe=he.max.x-he.min.x,Ae=he.max.y-he.min.y,Oe=he.isBox3?he.max.z-he.min.z:1,We=he.min.x,nt=he.min.y,dt=he.isBox3?he.min.z:0;else{let xt=Math.pow(2,-oe);if(Fe=Math.floor(Ft.width*xt),Ae=Math.floor(Ft.height*xt),G.isDataArrayTexture)Oe=Ft.depth;else if(G.isData3DTexture)Oe=Math.floor(Ft.depth*xt);else Oe=1;We=0,nt=0,dt=0}if(re!==null)ze=re.x,ft=re.y,Zt=re.z;else ze=0,ft=0,Zt=0;let Lt=ne.convert(j.format),xn=ne.convert(j.type),He;if(j.isData3DTexture)je.setTexture3D(j,0),He=Q.TEXTURE_3D;else if(j.isDataArrayTexture||j.isCompressedArrayTexture)je.setTexture2DArray(j,0),He=Q.TEXTURE_2D_ARRAY;else je.setTexture2D(j,0),He=Q.TEXTURE_2D;Pe.activeTexture(Q.TEXTURE0),Pe.pixelStorei(Q.UNPACK_FLIP_Y_WEBGL,j.flipY),Pe.pixelStorei(Q.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),Pe.pixelStorei(Q.UNPACK_ALIGNMENT,j.unpackAlignment);let Rn=Pe.getParameter(Q.UNPACK_ROW_LENGTH),St=Pe.getParameter(Q.UNPACK_IMAGE_HEIGHT),cs=Pe.getParameter(Q.UNPACK_SKIP_PIXELS),yn=Pe.getParameter(Q.UNPACK_SKIP_ROWS),Do=Pe.getParameter(Q.UNPACK_SKIP_IMAGES);Pe.pixelStorei(Q.UNPACK_ROW_LENGTH,Ft.width),Pe.pixelStorei(Q.UNPACK_IMAGE_HEIGHT,Ft.height),Pe.pixelStorei(Q.UNPACK_SKIP_PIXELS,We),Pe.pixelStorei(Q.UNPACK_SKIP_ROWS,nt),Pe.pixelStorei(Q.UNPACK_SKIP_IMAGES,dt);let zi=G.isDataArrayTexture||G.isData3DTexture,us=j.isDataArrayTexture||j.isData3DTexture;if(G.isDepthTexture){let xt=Ge.get(G),fn=Ge.get(j),jn=Ge.get(xt.__renderTarget),zt=Ge.get(fn.__renderTarget);Pe.bindFramebuffer(Q.READ_FRAMEBUFFER,jn.__webglFramebuffer),Pe.bindFramebuffer(Q.DRAW_FRAMEBUFFER,zt.__webglFramebuffer);for(let cn=0;cn<Oe;cn++){if(zi)Q.framebufferTextureLayer(Q.READ_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Ge.get(G).__webglTexture,oe,dt+cn),Q.framebufferTextureLayer(Q.DRAW_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Ge.get(j).__webglTexture,Re,Zt+cn);Q.blitFramebuffer(We,nt,We+Fe,nt+Ae,ze,ft,ze+Fe,ft+Ae,Q.DEPTH_BUFFER_BIT,Q.NEAREST)}Pe.bindFramebuffer(Q.READ_FRAMEBUFFER,null),Pe.bindFramebuffer(Q.DRAW_FRAMEBUFFER,null)}else if(oe!==0||G.isRenderTargetTexture||Ge.has(G)){let xt=Ge.get(G),fn=Ge.get(j);Pe.bindFramebuffer(Q.READ_FRAMEBUFFER,ee),Pe.bindFramebuffer(Q.DRAW_FRAMEBUFFER,X);for(let jn=0;jn<Oe;jn++){if(zi)Q.framebufferTextureLayer(Q.READ_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,xt.__webglTexture,oe,dt+jn);else Q.framebufferTexture2D(Q.READ_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Q.TEXTURE_2D,xt.__webglTexture,oe);if(us)Q.framebufferTextureLayer(Q.DRAW_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,fn.__webglTexture,Re,Zt+jn);else Q.framebufferTexture2D(Q.DRAW_FRAMEBUFFER,Q.COLOR_ATTACHMENT0,Q.TEXTURE_2D,fn.__webglTexture,Re);if(oe!==0)Q.blitFramebuffer(We,nt,We+Fe,nt+Ae,ze,ft,ze+Fe,ft+Ae,Q.COLOR_BUFFER_BIT,Q.NEAREST);else if(us)Q.copyTexSubImage3D(He,Re,ze,ft,Zt+jn,We,nt,Fe,Ae);else Q.copyTexSubImage2D(He,Re,ze,ft,We,nt,Fe,Ae)}Pe.bindFramebuffer(Q.READ_FRAMEBUFFER,null),Pe.bindFramebuffer(Q.DRAW_FRAMEBUFFER,null)}else if(us)if(G.isDataTexture||G.isData3DTexture)Q.texSubImage3D(He,Re,ze,ft,Zt,Fe,Ae,Oe,Lt,xn,Ft.data);else if(j.isCompressedArrayTexture)Q.compressedTexSubImage3D(He,Re,ze,ft,Zt,Fe,Ae,Oe,Lt,Ft.data);else Q.texSubImage3D(He,Re,ze,ft,Zt,Fe,Ae,Oe,Lt,xn,Ft);else if(G.isDataTexture)Q.texSubImage2D(Q.TEXTURE_2D,Re,ze,ft,Fe,Ae,Lt,xn,Ft.data);else if(G.isCompressedTexture)Q.compressedTexSubImage2D(Q.TEXTURE_2D,Re,ze,ft,Ft.width,Ft.height,Lt,Ft.data);else Q.texSubImage2D(Q.TEXTURE_2D,Re,ze,ft,Fe,Ae,Lt,xn,Ft);if(Pe.pixelStorei(Q.UNPACK_ROW_LENGTH,Rn),Pe.pixelStorei(Q.UNPACK_IMAGE_HEIGHT,St),Pe.pixelStorei(Q.UNPACK_SKIP_PIXELS,cs),Pe.pixelStorei(Q.UNPACK_SKIP_ROWS,yn),Pe.pixelStorei(Q.UNPACK_SKIP_IMAGES,Do),Re===0&&j.generateMipmaps===!0&&j.mipmapsAutoUpdate===!0)Q.generateMipmap(He);Pe.unbindTexture()},this.initRenderTarget=function(G){if(Ge.get(G).__webglFramebuffer===void 0)je.setupRenderTarget(G)},this.initTexture=function(G){if(G.isCubeTexture)je.setTextureCube(G,0);else if(G.isData3DTexture)je.setTexture3D(G,0);else if(G.isDataArrayTexture||G.isCompressedArrayTexture)je.setTexture2DArray(G,0);else je.setTexture2D(G,0);Pe.unbindTexture()},this.resetState=function(){ie=0,le=0,te=null,Pe.reset(),me.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pu}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(m){this._outputColorSpace=m;let g=this.getContext();g.drawingBufferColorSpace=ut._getDrawingBufferColorSpace(m),g.unpackColorSpace=ut._getUnpackColorSpace()}}var AS={road_asphalt:"Asphalt",road_concrete:"Concrete",road_cobble:"Cobblestones",road_gravel:"Gravel",road_dirt:"Dirt road",gc_meadow:"Meadow",gc_lawn:"Lawn",gc_forest:"Forest ground",gc_shrub:"Shrubland",gc_rock:"Rock face",gc_scree:"Scree",gc_sand:"Sand",gc_snow:"Snow",gc_alpine:"Alpine ground",gc_wetland:"Wetland",gc_urban:"Urban ground",gc_residential:"Residential ground",gc_yard:"Yard",gc_dirt:"Bare soil",gc_orchard:"Orchard",gc_vineyard:"Vineyard",gc_garden:"Garden",gc_pitch:"Grass pitch",gc_clay:"Clay",gc_court:"Hard court",gc_acrylic:"Acrylic court",gc_tartan:"Running track",gc_cemetery:"Cemetery ground",water:"Painted water",stream_bank:"Stream bank",stream_bed:"Dry stream bed",pitch_line:"Pitch markings",edge_dirt:"Road verge"},fr=(m)=>/^gc_field\d*$/.test(m)?"Field":AS[m]??m;function ns(m){let g=/^1(?:ROAD|GRASS|GRAVEL)_ground_(-?\d+)_(-?\d+)(?:_\d+)?$/.exec(m);return g?`${g[1]}_${g[2]}`:null}function RS(m){let g=Uint8Array.from(atob(m.slice(0,44)),(v)=>v.charCodeAt(0)),_=new DataView(g.buffer),x=_.getUint32(16),y=_.getUint32(20);if(!x||!y||x>2048||y>2048)throw Error("Invalid ground mask");return x*y*4*2}async function CS(m){let g=Uint8Array.from(atob(m),(y)=>y.charCodeAt(0)),_=await createImageBitmap(new Blob([g]),{imageOrientation:"none",premultiplyAlpha:"none"}),x=new Vt(_);return x.flipY=!1,x.wrapS=x.wrapT=rr,x.minFilter=x.magFilter=wn,x.generateMipmaps=!1,x.needsUpdate=!0,x}function Em(m){m.image?.close?.(),m.dispose()}class ja{scene;changed;reserve;release;decode;colour;opacity;version=0;masks=new Map;sources=new Set;overlays=new Map;materials=new Map;pending=new Map;allocations=new Set;faces=new Map;faceOverlays=new Map;constructor(m,g,_,x,y=CS,v=2596863,b=0.45){this.scene=m;this.changed=g;this.reserve=_;this.release=x;this.decode=y;this.colour=v;this.opacity=b}async set(m,g){if(this.clear(),!m)return;this.masks=new Map(m.tiles.map((x)=>[`${x.tile[0]}_${x.tile[1]}`,x.mask])),this.faces=new Map((m.meshes??[]).map((x)=>[x.mesh,x.faces]));let _=this.version;for(let x of g){if(_!==this.version)return;await this.add(x)}}async add(m){let g=this.faces.get(m.userData.info?.i);if(g){this.attachFaces(m,g);return}let _=ns(m.name);if(!_||!this.masks.has(_))return;this.sources.add(m);let x=this.materials.get(_);if(x){this.attach(m,x.material);return}if(this.pending.has(_))return this.pending.get(_);let y=this.version,v=this.masks.get(_),b=RS(v);if(!this.reserve(b))throw Error("Not enough preview memory to highlight this surface. Increase the limit in Settings.");let S={bytes:b};this.allocations.add(S);let M=(async()=>{let w=!1;try{let E=await this.decode(v);if(y!==this.version){Em(E);return}let A=new ur({color:this.colour,alphaMap:E,opacity:this.opacity,transparent:!0,side:In,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2});this.materials.set(_,{material:A,bytes:b}),w=!0;for(let T of this.sources)if(ns(T.name)===_)this.attach(T,A)}finally{if(!w)this.free(S);if(y===this.version)this.pending.delete(_)}})();return this.pending.set(_,M),M}attach(m,g){if(this.overlays.has(m))return;let _=new Xt(m.geometry,g);_.renderOrder=5,_.visible=m.visible,this.overlays.set(m,_),this.scene.add(_),this.changed()}follow(){for(let[m,g]of this.overlays)g.visible=m.visible;for(let[m,g]of this.faceOverlays){g.overlay.visible=m.visible;let _=m.geometry.getAttribute("position"),x="data"in _?_.data.version:_.version;if(x!==g.stamp){for(let S of Object.keys(m.geometry.attributes)){let M=m.geometry.getAttribute(S),w=g.overlay.geometry.getAttribute(S);for(let E=0;E<M.count;E++)for(let A=0;A<M.itemSize;A++)w.setComponent(E,A,M.getComponent(E,A));w.needsUpdate=!0}g.overlay.geometry.computeBoundingSphere(),g.stamp=x}let y=m.geometry.getIndex();if(y.version!==g.indexStamp){let S=g.overlay.geometry.getIndex();g.faces.forEach((M,w)=>{for(let E=0;E<3;E++)S.setX(w*3+E,y.getX(M*3+E))}),S.needsUpdate=!0,g.indexStamp=y.version}let v=g.overlay.material,b=m.material;if(v.map!==b.map)v.map=b.map,v.needsUpdate=!0}}attachFaces(m,g){if(this.faceOverlays.has(m))return;let _=((m.userData.info?.vertices??m.geometry.getAttribute("position").count)*44+g.length*6)*2;if(!this.reserve(_))throw Error("Not enough preview memory to highlight this material. Increase the limit in Settings.");let x={bytes:_};this.allocations.add(x);try{let y=m.geometry.clone(),v=m.geometry.getIndex();y.setIndex(g.flatMap((w)=>[0,1,2].map((E)=>v.getX(w*3+E))));let b=m.material,S=new ur({color:this.colour,map:b.map,alphaTest:b.alphaTest,opacity:0.55,transparent:!0,side:In,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),M=new Xt(y,S);M.renderOrder=5,this.faceOverlays.set(m,{overlay:M,faces:g,stamp:-1,indexStamp:-1}),this.scene.add(M),this.follow(),this.changed()}catch(y){throw this.free(x),y}}free(m){if(this.allocations.delete(m))this.release(m.bytes)}clear(){this.version++;for(let m of this.overlays.values())this.scene.remove(m);for(let{overlay:m}of this.faceOverlays.values())this.scene.remove(m),m.geometry.dispose(),m.material.dispose();for(let{material:m}of this.materials.values())Em(m.alphaMap),m.dispose();for(let m of this.allocations)this.free(m);this.overlays.clear(),this.materials.clear(),this.masks.clear(),this.sources.clear(),this.pending.clear(),this.faces.clear(),this.faceOverlays.clear(),this.changed()}}function Tm({name:m,surfaces:g,view:_,children:x,onSelected:y}){let[v,b]=n(null),[S,M]=n(null);if(i(()=>{let w=new AbortController;return(async()=>{try{let E=g.filter((N)=>N.face===void 0),A=g.filter((N)=>N.face!==void 0).map((N)=>_.materialSelection(N));if(E.length){let N=new URLSearchParams({r:E[0].revision,points:JSON.stringify(E)}),C=await fetch(`/api/editor/${encodeURIComponent(m)}/surface?${N}`,{signal:w.signal}),I=await C.json();if(!C.ok)throw Error(I.error??"Could not select this ground");A.push(I)}if(w.signal.aborted)return;let T=[...new Set(A.flatMap((N)=>N.materials??[N.material]))],R=new Map;for(let N of A)for(let C of N.meshes??[]){if(!R.has(C.mesh))R.set(C.mesh,new Set);for(let I of C.faces)R.get(C.mesh).add(I)}let P={material:T[0],materials:T,truncated:A.some((N)=>N.truncated),tiles:A.flatMap((N)=>N.tiles),meshes:[...R].map(([N,C])=>({mesh:N,faces:[...C]}))};if(await _.setSurface(P,(N)=>{if(!w.signal.aborted)M(N)}),!w.signal.aborted)b(P),y?.(P)}catch(E){if(!w.signal.aborted)_.setSurface(null),M(E instanceof Error?E.message:"Could not select this ground")}})(),()=>{w.abort(),_.setSurface(null),y?.(null)}},[m,g,_,y]),S)return t("p",{id:"edit-surface-error",className:"small muted",children:S});return e(r,{children:[x?.(v),e("p",{id:"edit-surface",className:"small muted",children:[v?`${(v.materials??[v.material]).map(fr).join(", ")} selected. Esc clears the selection.`:"Selecting ground…",v?.truncated&&" The surface continues beyond the highlighted area."]})]})}var qt={panel:"panel_cxyR9Q",head:"head_cxyR9Q",show:"show_cxyR9Q",divider:"divider_cxyR9Q",section:"section_cxyR9Q",identifier:"identifier_cxyR9Q",preview:"preview_cxyR9Q",rows:"rows_cxyR9Q",details:"details_cxyR9Q",part:"part_cxyR9Q",tabs:"tabs_cxyR9Q",appearance:"appearance_cxyR9Q",materials:"materials_cxyR9Q"};var Qa=[["grass","Grass"],["asphalt","Asphalt"],["rock","Rock"],["soil","Soil"],["sand","Sand"],["snow","Snow"],["wall","Wall"],["wood","Wood"],["other","Other"]];async function Ps(m,g){let _=await fetch(m,g),x=await _.json();if(!_.ok)throw Error(x.error??"Could not read the material library");return x}var Am=Promise.resolve();function lh(m,g,_){let x=Am.catch(()=>{}).then(()=>(_.throwIfAborted(),Ps(`/api/library/imports?${new URLSearchParams({filename:m.name,role:g})}`,{method:"POST",headers:{"Content-Type":"application/x-map2lap-image"},body:m})));return Am=x,x}var yo=(m,g=!1)=>`/api/library/${g?"imports":"materials"}/${m}/preview`,Rm=(m,g)=>g?String(Number((Number(m)*g[1]/g[0]).toFixed(3))):m,Cm=(m,g)=>m?.source.alpha?"Ground textures require an opaque colour image.":g;var Rt={dialog:"dialog_z0Po1Q",form:"form_z0Po1Q",note:"note_z0Po1Q",preview:"preview_z0Po1Q",field:"field_z0Po1Q",variation:"variation_z0Po1Q",repeat:"repeat_z0Po1Q",maps:"maps_z0Po1Q",map:"map_z0Po1Q",more:"more_z0Po1Q",buttons:"buttons_z0Po1Q",primary:"primary_z0Po1Q",error:"error_z0Po1Q",waiting:"waiting_z0Po1Q"};var Pm=[["normal","Normal map"],["roughness","Roughness map"]];function Im({file:m,onCancel:g,onImported:_}){let x=s(null),[y,v]=n(null),[b,S]=n(null),[M,w]=n(()=>m.name.replace(/\.[^.]+$/,"").replace(/[_-]+/g," ").slice(0,80)),[E,A]=n(()=>/grass|meadow|lawn/i.test(m.name)?"grass":/asphalt/i.test(m.name)?"asphalt":"other"),[T,R]=n("2"),[P,N]=n(null),[C,I]=n(null),L=["grass","asphalt","rock","soil","sand","snow"].includes(E),[U,O]=n(""),[F,k]=n(""),[D,B]=n(""),[z,W]=n(!1),[V,Y]=n({}),ee=s({}),X=s({}),ie=Rm(T,y?.source.size),le=Object.values(V).every((J)=>!J||!!J.prepared);i(()=>{let J=x.current;return J.showModal(),()=>J.close()},[]),i(()=>{let J=new AbortController;return lh(m,"colour",J.signal).then((ae)=>{if(!J.signal.aborted)v(ae)}).catch((ae)=>{if(!J.signal.aborted)S(ae.message)}),()=>J.abort()},[m]),i(()=>{let J=ee.current;return()=>{for(let ae of Object.values(J))ae?.abort()}},[]);let te=(J,ae)=>{if(ee.current[J]?.abort(),Y((Te)=>({...Te,[J]:ae?{file:ae}:void 0})),!ae){let Te=X.current[J];if(Te)Te.value="";return}let ge=new AbortController;ee.current[J]=ge,lh(ae,J,ge.signal).then((Te)=>{if(!ge.signal.aborted)Y((ce)=>({...ce,[J]:{file:ae,prepared:Te}}))}).catch((Te)=>{if(!ge.signal.aborted)Y((ce)=>({...ce,[J]:{file:ae,error:Te.message}}))})},ve=async()=>{if(!y||!le||z)return;W(!0),S(null);try{let J=await Ps("/api/library/materials",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:y.token,filename:m.name,name:M,category:E,repeat:[Number(T),Number(P??ie)],variation:C??L,source:U,license:F,maps:Object.fromEntries(Pm.flatMap(([ae])=>V[ae]?.prepared?[[ae,{token:V[ae].prepared.token,filename:V[ae].file.name}]]:[])),tags:D.split(",").map((ae)=>ae.trim()).filter(Boolean)})});_(J.material,J.duplicate)}catch(J){S(J instanceof Error?J.message:"Could not import this material"),W(!1)}};return t("dialog",{ref:x,className:Rt.dialog,"aria-labelledby":"import-material-title",onCancel:(J)=>{if(J.preventDefault(),!z)g()},onClick:(J)=>{let ae=J.currentTarget.getBoundingClientRect();if(J.target===J.currentTarget&&!z&&(J.clientX<ae.left||J.clientX>ae.right||J.clientY<ae.top||J.clientY>ae.bottom))g()},children:e("form",{className:Rt.form,onSubmit:(J)=>{J.preventDefault(),ve()},children:[t("h2",{id:"import-material-title",children:"Import texture"}),e("p",{className:Rt.note,children:[m.name," · The original image is kept in your library."]}),!y&&!b&&e("div",{role:"status",className:Rt.waiting,children:["Preparing image…",t("progress",{"aria-label":"Preparing material"})]}),y&&e(r,{children:[t("img",{className:Rt.preview,src:yo(y.token,!0),alt:"Texture preview"}),e("p",{className:Rt.note,children:["Original: ",y.source.size.join(" × ")," px. Prepared: ",y.prepared.size.join(" × ")," px.",y.source.alpha&&" Contains transparency."]}),e("label",{className:Rt.field,children:["Name",t("input",{type:"text",value:M,onChange:(J)=>w(J.target.value),maxLength:80,required:!0,autoFocus:!0,disabled:z})]}),e("label",{className:Rt.field,children:["Category",t("select",{value:E,onChange:(J)=>A(J.target.value),disabled:z,children:Qa.map(([J,ae])=>t("option",{value:J,children:ae},J))})]}),e("fieldset",{className:Rt.maps,children:[t("legend",{children:"Surface maps"}),t("p",{className:Rt.note,children:"Normal: +Y. Roughness: black is smooth, white is rough. Original files are kept."}),Pm.map(([J,ae])=>e("div",{className:Rt.map,children:[e("label",{className:Rt.field,children:[ae," (optional)",t("input",{type:"file",accept:".png,.jpg,.jpeg,.dds",ref:(ge)=>{X.current[J]=ge??void 0},disabled:z,onChange:(ge)=>{let Te=ge.target.files?.[0];if(Te)te(J,Te)}})]}),V[J]&&e(r,{children:[V[J].error?e("span",{role:"alert",className:Rt.error,children:[ae,": ",V[J].error]}):!V[J].prepared?e("span",{role:"status",className:Rt.note,children:["Preparing ",ae.toLowerCase(),"…"]}):e("span",{className:Rt.note,children:[V[J].prepared.source.size.join(" × ")," px original · Ready"]}),e("button",{type:"button",onClick:()=>te(J),disabled:z,children:["Remove ",ae.toLowerCase()]})]})]},J))]}),e("fieldset",{className:Rt.repeat,children:[t("legend",{children:"One texture repeat covers"}),e("label",{className:Rt.field,children:["Width (m)",t("input",{type:"number",min:"0.01",max:"10000",step:"any",value:T,onChange:(J)=>R(J.target.value),required:!0,disabled:z})]}),e("label",{className:Rt.field,children:["Height (m)",t("input",{type:"number",min:"0.01",max:"10000",step:"any",value:P??ie,onChange:(J)=>N(J.target.value),required:!0,disabled:z})]})]}),e("label",{className:Rt.variation,children:[t("input",{type:"checkbox",checked:C??L,onChange:(J)=>I(J.target.checked),disabled:z}),"Break up texture repetition"]}),t("p",{className:Rt.note,children:"Variation in the game requires CSP. Leave it off for regular patterns such as tiles or brickwork."}),e("details",{className:Rt.more,children:[t("summary",{children:"Tags and source"}),e("label",{className:Rt.field,children:["Tags (comma separated)",t("input",{type:"text",value:D,onChange:(J)=>B(J.target.value),maxLength:800,disabled:z})]}),e("label",{className:Rt.field,children:["Source URL",t("input",{type:"url",value:U,onChange:(J)=>O(J.target.value),maxLength:500,disabled:z})]}),e("label",{className:Rt.field,children:["License",t("input",{type:"text",value:F,onChange:(J)=>k(J.target.value),maxLength:200,disabled:z})]})]})]}),b&&t("p",{role:"alert",className:Rt.error,children:b}),z&&e("div",{role:"status",className:Rt.waiting,children:["Adding to library…",t("progress",{"aria-label":"Importing material"})]}),e("div",{className:Rt.buttons,children:[t("button",{type:"button",onClick:g,disabled:z,children:"Cancel"}),t("button",{type:"submit",className:Rt.primary,disabled:!y||!le||z,children:"Add to library"})]})]})})}var an={dialog:"dialog_LRUqHA",shell:"shell_LRUqHA",heading:"heading_LRUqHA",footer:"footer_LRUqHA",pages:"pages_LRUqHA",file:"file_LRUqHA",filters:"filters_LRUqHA",content:"content_LRUqHA",browser:"browser_LRUqHA",cards:"cards_LRUqHA",card:"card_LRUqHA",preview:"preview_LRUqHA",selected:"selected_LRUqHA",note:"note_LRUqHA",error:"error_LRUqHA",primary:"primary_LRUqHA",variation:"variation_LRUqHA",delete:"delete_LRUqHA"};var vo=40;function NS({material:m,variation:g,onVariation:_,onDelete:x,disabled:y}){let[v,b]=n(null);return i(()=>{let S=new AbortController;return Ps(`/api/library/materials/${m.id}`,{signal:S.signal}).then((M)=>{if(!S.signal.aborted)b(M)}).catch(()=>{}),()=>S.abort()},[m.id]),e("div",{className:an.selected,children:[t("img",{src:yo(m.id),alt:"Texture preview"}),t("strong",{children:m.name}),e("span",{children:[m.repeat.join(" × ")," m per repeat"]}),e("span",{children:[m.source.size.join(" × ")," px original · ",m.prepared.size.join(" × ")," px prepared"]}),m.source.alpha&&t("span",{children:"Contains transparency"}),!!m.tags.length&&t("span",{children:m.tags.join(", ")}),e("label",{className:an.variation,children:[t("input",{type:"checkbox",checked:g,disabled:y,onChange:(S)=>_(S.target.checked)}),"Break up texture repetition"]}),t("span",{children:"Variation in the game requires CSP."}),v?.source_url&&e("span",{children:["Source: ",v.source_url]}),v?.license&&e("span",{children:["License: ",v.license]}),v?.maps.normal&&e("span",{children:["Normal map: ",v.maps.normal.filename]}),v?.maps.roughness&&e("span",{children:["Roughness map: ",v.maps.roughness.filename]}),t("button",{type:"button",className:an.delete,onClick:x,disabled:y,children:"Delete texture"})]})}var Lm=h(function({open:g,target:_,reason:x,busy:y,error:v,onApply:b,onClose:S}){let M=s(null),w=s(null),[E,A]=n(""),[T,R]=n(""),[P,N]=n(0),[C,I]=n(0),[L,U]=n(null),[O,F]=n(null),[k,D]=n(null),[B,z]=n(null),[W,V]=n(!1),[Y,ee]=n(null),[X,ie]=n(null),le=JSON.stringify([E,T,P,C]),te=L?.key===le?L.value:null,ve=O?.key===le?O.text:null,J=o(()=>ee(null),[]),ae=Cm(k,x),ge=y||W,Te=B??k?.variation??(!!k&&["grass","asphalt","rock","soil","sand","snow"].includes(k.category));i(()=>{let xe=M.current;if(g)xe.showModal();return()=>xe.close()},[g]),i(()=>{if(!g)return;let xe=new AbortController,Ue=new URLSearchParams({q:E,category:T,offset:String(P*vo),limit:String(vo)});return Ps(`/api/library/materials?${Ue}`,{signal:xe.signal}).then((Ce)=>{if(!xe.signal.aborted)U({key:le,value:Ce})}).catch((Ce)=>{if(!xe.signal.aborted)F({key:le,text:Ce.message})}),()=>xe.abort()},[g,E,T,P,le]);let ce=(xe)=>{if(!xe?.length)return;if(xe.length!==1){ie("Choose one colour image at a time.");return}if(xe[0].size>67108864){ie("Choose an image up to 64 MB.");return}ie(null),ee(xe[0])},ye=(xe,Ue)=>{ee(null),D(xe),z(null),ie(Ue?"This texture is already in your library.":"Texture added to your library."),A(""),R(""),N(0),I((Ce)=>Ce+1)},Ie=async()=>{if(!k||ge||!confirm(`Delete “${k.name}” from your texture library?

Textures already used in tracks are kept.`))return;V(!0);try{await Ps(`/api/library/materials/${k.id}/delete`,{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"}),D(null),z(null),N(0),I((xe)=>xe+1),ie("Texture deleted from the library. Existing track appearances are kept.")}catch(xe){ie(xe instanceof Error?xe.message:"Could not delete this texture")}finally{V(!1)}};return c(e(r,{children:[t("dialog",{ref:M,className:an.dialog,"aria-labelledby":"material-picker-title",onKeyDown:(xe)=>{if(xe.stopPropagation(),xe.key==="Escape"){if(xe.preventDefault(),!ge)S()}},onCancel:(xe)=>{if(xe.preventDefault(),!ge)S()},children:e("div",{className:an.shell,children:[e("div",{className:an.heading,children:[e("div",{children:[t("h2",{id:"material-picker-title",children:"Textures"}),t("p",{children:_?`Selected: ${_}`:"Texture library"})]}),t("button",{type:"button",onClick:()=>w.current?.click(),disabled:ge,children:"Import…"})]}),t("input",{className:an.file,ref:w,type:"file",accept:".png,.jpg,.jpeg,.dds","aria-label":"Texture file",onChange:(xe)=>{ce(xe.target.files),xe.target.value=""}}),e("div",{className:an.filters,children:[t("input",{type:"search","aria-label":"Search textures",placeholder:"Search textures",value:E,autoFocus:!0,onChange:(xe)=>{A(xe.target.value),N(0)}}),e("select",{"aria-label":"Filter textures",value:T,onChange:(xe)=>{R(xe.target.value),N(0)},children:[t("option",{value:"",children:"All categories"}),Qa.map(([xe,Ue])=>t("option",{value:xe,children:Ue},xe))]})]}),e("div",{className:an.content,children:[t("div",{className:an.browser,onDragOver:(xe)=>xe.preventDefault(),onDrop:(xe)=>{if(xe.preventDefault(),!ge)ce(xe.dataTransfer.files)},children:ve?t("p",{role:"alert",children:ve}):!te?t("p",{role:"status",children:"Loading textures…"}):!te.items.length?t("p",{className:"muted",children:E||T?"No matching textures.":"No textures yet. Import or drop a colour image here · PNG, JPG, DDS."}):t("div",{className:an.cards,children:te.items.map((xe)=>e("button",{type:"button","aria-label":xe.name,"aria-pressed":k?.id===xe.id,className:an.card,onClick:()=>{D(xe),z(null)},disabled:ge,children:[t("img",{src:yo(xe.id),alt:"",loading:"lazy",decoding:"async"}),t("span",{children:xe.name})]},xe.id))})}),t("div",{className:an.preview,children:k?t(NS,{material:k,variation:Te,onVariation:z,onDelete:()=>void Ie(),disabled:ge},k.id):t("p",{className:"muted",children:"Choose a texture to preview it. The track changes only when you apply it."})})]}),te&&te.total>vo&&e("div",{className:an.pages,children:[t("button",{type:"button",disabled:!P,onClick:()=>N((xe)=>xe-1),children:"Previous"}),e("span",{children:[te.offset+1,"–",Math.min(te.total,te.offset+vo)," of ",te.total]}),t("button",{type:"button",disabled:te.offset+vo>=te.total,onClick:()=>N((xe)=>xe+1),children:"Next"})]}),X&&t("p",{role:"status",className:an.note,children:X}),v&&t("p",{role:"alert",className:an.error,children:v}),e("div",{className:an.footer,children:[e("div",{children:[t("strong",{children:_?`Apply to: ${_}`:"No editable surface selected"}),t("p",{children:ae??"Appearance changes only. The driving surface stays unchanged."}),y&&t("progress",{"aria-label":"Applying material"})]}),t("button",{type:"button",disabled:ge,onClick:S,children:"Cancel"}),t("button",{type:"button",className:an.primary,disabled:!k||!_||!!ae||ge,onClick:()=>{if(k)b(k.id,Te).then((xe)=>{if(xe)S()})},children:y?"Applying…":"Apply"})]})]})}),Y&&c(t(Im,{file:Y,onCancel:J,onImported:ye}),document.body)]}),document.body)});function Gt({label:m,children:g}){return e(r,{children:[t("dt",{children:m}),t("dd",{children:g})]})}var DS=(m)=>`${m.map((g)=>g.toFixed(2)).join(" × ")} m`,OS={cls:"Building type",floors:"Floors",floor_h:"Floor height (m)",height:"Built height (m)",roof:"Roof",roof_mat:"Roof material",facade:"Facade",pitch:"Roof pitch",min_h:"Base height (m)",seed:"Variation seed"},US=h(function({name:g,picked:_,view:x,state:y}){let[v,b]=n(null),[S,M]=n(null),w=_.inspection;i(()=>{if(!w.listed||!_.id)return;let T=new AbortController,R=new URLSearchParams({id:_.id,r:w.revision});return fetch(`/api/editor/${encodeURIComponent(g)}/inspect?${R}`,{signal:T.signal}).then(async(P)=>{let N=await P.json();if(!P.ok)throw Error(N.error??"Could not read object details");if(!T.signal.aborted)b(N)}).catch((P)=>{if(!T.signal.aborted)M(P.message)}),()=>T.abort()},[g,_.id,w.listed,w.revision]);let E=y.placed.find((T)=>T.id===_.id),A=_.id?x.dimensionsOf(_.id):null;return e("details",{className:qt.details,children:[t("summary",{children:"Object details"}),e("div",{id:"inspect-object",children:[e("dl",{className:qt.rows,children:[_.id&&t(Gt,{label:"ID",children:_.id}),_.sort&&t(Gt,{label:"Type",children:li(_.sort)}),_.sprite&&t(Gt,{label:"Tree image",children:_.sprite}),A&&e(Gt,{label:"Dimensions",children:[DS(A)," ",t("span",{className:"muted",children:"(loaded geometry; X × height × Z)"})]}),E&&e(r,{children:[e(Gt,{label:"Move (X, Y, Z)",children:[[E.x,E.y,E.z].map((T)=>T.toFixed(2)).join(", ")," m"]}),e(Gt,{label:"Turn",children:[E.turn.toFixed(1),"°"]}),e(Gt,{label:"Scale",children:[E.scale.toFixed(2),"×"]})]}),v&&e(r,{children:[t(Gt,{label:"Object triangles",children:v.triangles.toLocaleString()}),e(Gt,{label:"Parts",children:[v.meshes.length," (",v.meshes.filter((T)=>!T.visible).length," hidden)"]}),t(Gt,{label:"Built at",children:v.built_at.map((T)=>T.toFixed(2)).join(", ")}),v.parent&&t(Gt,{label:"Parent",children:v.parent}),!!v.children.length&&t(Gt,{label:"Children",children:v.children.join(", ")}),!!v.companions.length&&t(Gt,{label:"Taken along",children:v.companions.join(", ")}),v.details.asset&&t(Gt,{label:"Built from",children:v.details.asset}),v.details.source_index!==void 0&&t(Gt,{label:"Build item",children:v.details.source_index}),v.details.footprint&&e(Gt,{label:"Footprint",children:[v.details.footprint.length," corners"]})]}),!w.listed&&w.hovered.billboard&&t(Gt,{label:"Object triangles",children:"8 (crossed billboard)"})]}),v?.meshes.map((T)=>e("details",{className:qt.part,children:[t("summary",{children:T.name}),e("dl",{className:qt.rows,children:[t(Gt,{label:"Material",children:T.material.name}),t(Gt,{label:"Shader",children:T.material.shader}),t(Gt,{label:"Texture",children:T.material.texture??"None"}),t(Gt,{label:"Triangles",children:T.triangles}),t(Gt,{label:"Visible",children:T.visible?"Yes":"No (hidden part)"})]})]},T.name)),v?.details.parameters&&e("details",{className:qt.part,children:[t("summary",{children:"Original build parameters"}),t("dl",{className:qt.rows,children:Object.entries(v.details.parameters).filter(([,T])=>T!==null&&T!==void 0&&typeof T!=="object").map(([T,R])=>t(Gt,{label:Array.isArray(v.details.parameters)?`Parameter ${Number(T)+1}`:OS[T]??T,children:String(R)},T))})]}),w.listed&&!v&&!S&&t("p",{className:"small muted",children:"Reading object details…"}),S&&t("p",{className:"small muted",children:S})]})]})});function FS({info:m,onEdit:g}){let[_,x]=n(!1);return e(r,{children:[m.preview&&!_&&(g?t("button",{type:"button",className:qt.appearance,"aria-label":"Edit texture",onClick:g,children:t("img",{className:qt.preview,src:m.preview,alt:"Selected texture",onError:()=>x(!0)})}):t("img",{className:qt.preview,src:m.preview,alt:"Selected texture",onError:()=>x(!0)})),t("strong",{children:m.name}),m.repeat&&e("p",{className:"small muted",children:[m.repeat.join(" × ")," m per repeat",m.variation&&" · Repetition variation"]}),m.original&&t("p",{className:"small muted",children:"Original track appearance."}),m.mixed&&t("p",{className:"small muted",children:"Blended edge: showing the dominant texture at the selected point."}),_&&t("p",{className:"small muted",children:"Texture preview unavailable."})]})}function BS({name:m,picked:g,version:_,onEdit:x}){let[y,v]=n(null),{inspection:b,surface:S}=g,M=!!S&&S.face===void 0,w=new URLSearchParams({mesh:String(S?.mesh),u:String(S?.u),v:String(S?.v),r:b.revision,p:_}),E=`/api/editor/${encodeURIComponent(m)}/appearance?${w}`;i(()=>{if(!M)return;let T=new AbortController;return fetch(E,{signal:T.signal}).then(async(R)=>{let P=await R.json();if(!R.ok)throw Error(P.error??"Could not read the applied texture");if(!T.signal.aborted)v({key:E,info:P})}).catch((R)=>{if(!T.signal.aborted)v({key:E,error:R.message})}),()=>T.abort()},[E,M]);let A=M?y?.key===E?y.info:void 0:{name:b.hovered.texture??"No texture",preview:b.texture!==null&&b.texture>=0?`/api/editor/${encodeURIComponent(m)}/thumbnail?${new URLSearchParams({texture:String(b.texture),r:b.revision})}`:"",repeat:null,variation:!1,original:!1,mixed:!1};return e("section",{id:"inspect-appearance",className:qt.section,children:[t("h3",{children:"Appearance"}),A?t(FS,{info:A,onEdit:x},A.preview):t("p",{className:"small muted",children:y?.key===E&&y.error?y.error:"Reading applied texture…"})]})}function Nm({name:m,picked:g,hovered:_,surfaces:x,marked:y,view:v,state:b,collapsed:S,onCollapsed:M,width:w,onWidth:E,onSurface:A,materialTarget:T,materialReason:R,materialOpen:P,onMaterialOpen:N,onMaterialClose:C,textureRevision:I,painting:L,onApply:U}){let[O,F]=n("properties"),k=g?.kind&&(!g.surface||x.length)?g:null,D=k?.inspection?.texture!=null?v.textureVersion(k.inspection.texture):"",B=(z)=>E(Math.max(260,Math.min(520,z)));return e(r,{children:[S&&t("button",{className:qt.show,onClick:()=>M(!1),"aria-label":"Show properties",children:"Properties ‹"}),!S&&t("div",{className:qt.divider,role:"separator",tabIndex:0,"aria-label":"Inspector width","aria-orientation":"vertical","aria-valuenow":w,"aria-valuemin":260,"aria-valuemax":520,onKeyDown:(z)=>{if(z.key==="ArrowLeft"||z.key==="ArrowRight")z.preventDefault(),B(w+(z.key==="ArrowLeft"?20:-20))},onPointerDown:(z)=>{z.currentTarget.setPointerCapture(z.pointerId),z.preventDefault()},onPointerMove:(z)=>{if(z.currentTarget.hasPointerCapture(z.pointerId))B(z.currentTarget.getBoundingClientRect().right+w-z.clientX)}}),e("aside",{className:qt.panel,"aria-label":"Selection properties",hidden:S,children:[e("div",{className:qt.head,children:[t("h2",{children:"Properties"}),t("button",{type:"button",onClick:()=>M(!0),"aria-label":"Hide properties",children:"›"})]}),t("div",{className:qt.tabs,role:"tablist","aria-label":"Inspector",children:["properties","details"].map((z)=>t("button",{type:"button",role:"tab",id:`inspector-tab-${z}`,"aria-selected":O===z,"aria-controls":`inspector-${z}`,tabIndex:O===z?0:-1,onClick:()=>F(z),onKeyDown:(W)=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(W.key)){W.preventDefault(),W.stopPropagation();let V=W.key==="Home"?"properties":W.key==="End"?"details":z==="properties"?"details":"properties";F(V),document.getElementById(`inspector-tab-${V}`)?.focus()}},children:z==="properties"?"Properties":"Details"},z))}),e("div",{id:"inspector-properties",role:"tabpanel","aria-labelledby":"inspector-tab-properties",hidden:O!=="properties",children:[e("section",{id:"inspect-selection",className:qt.section,children:[t("h3",{children:"Selection"}),k&&!k.surface&&e(r,{children:[t("strong",{children:k.all.length>1?`${k.all.length} objects`:k.kind}),k.id&&t("p",{className:qt.identifier,children:k.id})]}),y.length>0&&t("p",{className:"small",children:y.map((z)=>`All ${z.tree?z.sort:li(z.sort)}`).join(", ")}),x.length>0&&t(Tm,{name:m,surfaces:x,view:v,onSelected:A,children:(z)=>z&&t("strong",{children:(z.materials??[z.material]).map(fr).join(", ")})},JSON.stringify(x)),!k&&!x.length&&!y.length&&t("p",{className:"small muted",children:"Nothing selected. Click a surface or object in the view."})]}),k?.inspection&&t(BS,{name:m,picked:k,version:D,onEdit:k.surface&&k.surface.face===void 0?N:null},`${m} ${k.inspection.revision} ${k.inspection.texture} ${D} ${I}`),t("button",{type:"button",className:qt.materials,onClick:N,children:"Edit"})]}),e("div",{id:"inspector-details",role:"tabpanel","aria-labelledby":"inspector-tab-details",hidden:O!=="details",children:[k?.id&&k.inspection&&t(US,{name:m,picked:k,view:v,state:b},`${m} ${k.id}`),k?.inspection&&e("details",{className:qt.details,children:[t("summary",{children:"Selected mesh details"}),t(ic,{id:"inspect-mesh",hovered:k.inspection.hovered})]}),e("details",{className:qt.details,open:!0,children:[t("summary",{children:"Under pointer"}),_?t(ic,{hovered:_}):t("p",{className:"small muted",children:"Point at the track to inspect its surface and position."})]})]})]}),t(Lm,{open:P,target:T,reason:R,busy:L.busy,error:L.error,onApply:U,onClose:C})]})}function Dm(m,g,_){let[x,y]=n(!1),[v,b]=n(null),S=s(!1),M=s(!1);i(()=>(S.current=!0,()=>{S.current=!1}),[]);let w=o((E,A,T)=>{if(M.current||!A.length||!g.canEdit())return Promise.resolve(!1);M.current=!0,y(!0),b(null);let R=!1;return g.inTurn(async()=>{try{g.saveNow();let P=await g.saved(),N=g.boundRevision();if(!S.current)return;if(P===null||!N||!g.canEdit())throw Error("The current changes could not be kept. Try again after reloading them.");let C=await a(`/api/editor/${encodeURIComponent(m)}/paint`,{base:N,revision:P,material:E,points:A,variation:T});if(!S.current)return;if(C.error||!C.paint)throw Error(C.error??"Could not apply this material");if(g.addPaint(C.paint),g.saveNow(),await g.saved()===null)throw Error("The material change could not be kept.");await _.syncPaints(g.state().paints),await _.texturesReady(),R=!0}catch(P){if(S.current)b(P instanceof Error?P.message:"Could not apply this material")}finally{if(M.current=!1,S.current)y(!1)}}).then(()=>R)},[m,g,_]);return{busy:x,error:v,apply:w}}function Om({name:m,title:g,taken:_,view:x,scene:y,fileHost:v,savedHost:b,toolsHost:S,notesHost:M,inspectorHost:w,hovered:E,inspectorWidth:A,onInspectorWidth:T,inspectorCollapsed:R,onInspectorCollapsed:P,elevationSpeed:N,reopen:C,onSaved:I}){let[L]=n(()=>new zl(m)),U=p(L.subscribe,L.state),[O,F]=n(null),[k,D]=n(null),[B,z]=n([]),[W,V]=n([]),[Y,ee]=n(null),X=o((ne)=>ee({points:W,selection:ne}),[W]),[ie,le]=n(!1),[te,ve]=n(!1),[J,ae]=n("select"),[ge,Te]=n(0),[ce,ye]=n(null),[Ie,xe]=n(null),[Ue,Ce]=n(!1),[rt,tt]=n(0),Be=o(()=>Ce(!1),[]),Ke=s(()=>{}),Ye=o((ne)=>{Ke.current=ne},[]),Ze=L.canEdit(),pt=J==="elevation"&&Ze,vt=J==="delete"&&Ze,_t=J==="smooth"&&Ze,ot=J==="smooth"&&Ze,ct=J==="move"&&Ze,bt=kd({name:m,edits:L,state:U,view:x,onSaved:I}),kt=Dm(m,L,x),Ut=Y?.points===W?Y.selection:null,Q=Ut?.materials??(Ut?[Ut.material]:[]),$t=J==="select"&&Ze&&Ut?.tiles.length&&!Ut.meshes?.length&&Q.length?Q.map(fr).join(", "):null,mt=!Ze?"This track cannot be edited right now.":W.length&&!Ut?"Preparing the selected surface…":Ut?.meshes?.length?"This surface uses a separate mesh. Its material cannot be changed yet.":Ut&&new Set(Ut.tiles.map((ne)=>ne.tile.join(","))).size>64?"Select at most 64 ground tiles to apply a material.":Ut?.truncated&&W.some((ne)=>ne.whole)?"Select all is incomplete. Finish loading or select a smaller area (at most 64 ground tiles).":!$t?"Select a painted ground surface to apply a material.":null,Wt=kt.apply,Pe=o((ne,me)=>$t&&!mt?Wt(ne,W,me):Promise.resolve(!1),[$t,mt,Wt,W]),Tt=Id({name:m,view:x,edits:L,enabled:pt,speed:N,onNote:ye}),Ge=Xd({name:m,view:x,edits:L,enabled:_t,revision:U.keptRevision,onNote:ye}),je=dd({view:x,enabled:J==="camera",onNote:ye}),en=Ud({name:m,view:x,edits:L,state:U,enabled:ct,picked:O,onNote:ye}),q=l((ne)=>{if(_t&&ne?.left)return x.unpick();if(F(ne),!ne?.adding)z([]),V([]);if(J==="select"&&ne?.surface)V((me)=>[...(ne.adding?me:[]).filter((be)=>JSON.stringify(be)!==JSON.stringify(ne.surface)),ne.surface].slice(-64));if(J==="select"&&ne?.whole&&ne.id){let me=ne.sprite?{sort:ne.sprite,tree:!0}:ne.sort&&!Wl.has(ne.sort)?{sort:ne.sort,tree:!1}:null;if(me)z((be)=>[...(ne.adding?be:[]).filter((ke)=>ke.sort!==me.sort||ke.tree!==me.tree),me])}if(vt&&ne?.id&&ne.left)L.remove([{id:ne.id,position:ne.position}]),x.unpick()}),H=l((ne)=>{if(!_t)return;if(ne?.road)Ge.click(ne.road[0],ne.road[1]);else if(!ne?.id)Ge.clear()});i(()=>(x.setClicked((ne)=>H(ne)),()=>x.setClicked(()=>{})),[x]),i(()=>{x.setWheelTaken(Ge.line!==null&&ot||J==="camera"||J==="copy"||ct)},[x,Ge.line,ot,J,ct]),i(()=>{x.setAdding((J==="select"||J==="camera"||J==="move")&&Ze)},[x,J,Ze]),i(()=>(x.setSelectMode(J==="select",ie,te),()=>x.setSelectMode(!1)),[x,J,ie,te]),i(()=>{if(J!=="smooth")Ge.clear()},[J]),i(()=>{L.start();let ne=()=>L.saveNow(!0);return window.addEventListener("pagehide",ne),()=>{window.removeEventListener("pagehide",ne),L.stop()}},[L]),i(()=>(x.setPick((ne)=>q(ne)),x.setMenu(D),x.setIndexed((ne)=>L.bind(ne)),()=>{x.setPick(()=>{}),x.setMenu(()=>{}),x.setIndexed(()=>{})}),[x,L]),i(()=>{x.setRemoved(U.removed.map((ne)=>ne.id),U.sorts,U.objectSorts)},[x,U.removed,U.sorts,U.objectSorts]),i(()=>(x.setMarked(B),()=>x.setMarked(null)),[x,B]),i(()=>(L.setOnMeshes((ne)=>x.refreshMeshes(ne)),L.setOnTextures((ne,me)=>x.refreshPaints(ne,me)),x.setViewFailed(xe),x.setTexturesChanged(()=>tt((ne)=>ne+1)),()=>{L.setOnMeshes(()=>{}),L.setOnTextures(()=>{}),x.setViewFailed(()=>{}),x.setTexturesChanged(()=>{})}),[x,L]),i(()=>{if(U.save==="saved"&&L.canEdit())x.syncPaints(U.paints)},[x,L,U]);let se=l((ne,me)=>{if(J==="camera")je.wheel(ne,me);else if(J==="move")en.wheel(ne,me);else if(J==="copy")Ke.current(ne,me);else if(J==="smooth")Ge.wheel(ne,me);else Tt.wheel(ne,me)});i(()=>(x.setToolWheel((ne,me)=>se(ne,me)),()=>x.setToolWheel(()=>{})),[x]);let Se=async()=>{let ne=(be)=>JSON.stringify([be.heights.map((ke)=>ke.id),be.placed,be.copies]),me=ne(U);if(await L.start(),L.viewBehind()||ne(L.state())!==me)C()},_e=O?.all??[],we=U.removed.map((ne)=>ne.id),Me=O?.id&&O.sort&&!Wl.has(O.sort)?O.sort:null,ue=O?.id&&O.sprite?O.sprite:null,pe=!k?null:Me?`Mark all ${li(Me)} (${x.countOfListed(Me,we,U.objectSorts)})`:ue?`Mark all ${ue} (loaded: ${x.countOf(ue)})`:null,Ee=()=>{if(!Ze)return;if(B.length||_e.length)L.removeSelected(x.selectedOutside(B),B),z([]),x.unpick()},K=(ne)=>{Ge.clear(),le(!1),ve(!1),V([]),ae(J===ne?"select":ne)},fe=o(()=>D(null),[]),de=l((ne)=>{let me=ne.ctrlKey||ne.metaKey,be=ne.key.toLowerCase();if(bt.asking){if(me&&be==="s")ne.preventDefault();return}if(["Home","End","ArrowLeft","ArrowRight"].includes(ne.key)&&ne.target.closest('[role="tablist"]'))return;if(ne.key!=="Escape"&&ne.key!=="Enter"&&["INPUT","TEXTAREA","SELECT"].includes(ne.target.tagName))return;let ke=me?void 0:Ql.find((Ve)=>Ve.key.toLowerCase()===be);if(ne.key==="Delete")Ee();else if(ne.key==="Escape")D(null),z([]),le(!1),ve(!1),V([]),x.cancelStroke(),Ge.clear(),x.unpick(),ae("select"),x.focus();else if((B.length||_e.length)&&!me&&be==="x")Ee();else if(ke)K(ke.tool);else if(ne.key==="Home")x.home();else if(me&&be==="z")L.inTurn(()=>ne.shiftKey?L.redo():L.undo());else if(me&&be==="y")L.inTurn(()=>L.redo());else if(me&&be==="s")bt.save();else return;ne.preventDefault()});return i(()=>{let ne=[y.current,v,S,M,w],me=(be)=>de(be);for(let be of ne)be?.addEventListener("keydown",me);return()=>{for(let be of ne)be?.removeEventListener("keydown",me)}},[y,v,S,M,w]),e(r,{children:[v&&c(t(zd,{state:U,edits:L,view:x,saving:bt}),v),b&&c(bt.savedText,b),S&&c(t(Hd,{state:U,edits:L,view:x,tool:J,onTool:(ne)=>{K(ne),ye(null)}}),S),M&&c(t(r,{children:t(Ed,{state:U,edits:L,view:x,note:ce,viewFailed:Ie,saveFailed:bt.failed,picked:_t&&!O?.id||J==="select"&&O?.surface?null:O,sort:Me,markedName:B.length?B.map((ne)=>ne.tree?ne.sort:li(ne.sort)).join(", "):null,reopen:C,readAgain:()=>void Se()})}),M),w&&c(t(Nm,{name:m,picked:O,hovered:E,surfaces:J==="select"?W:[],marked:B,view:x,state:U,width:A,onWidth:T,collapsed:R,onCollapsed:P,onSurface:X,materialTarget:$t,materialOpen:Ue,onMaterialOpen:()=>Ce(!0),onMaterialClose:Be,materialReason:mt,textureRevision:rt,painting:kt,onApply:Pe}),w),J==="select"&&t(Wn,{id:"edit-select-set",title:"Select",note:"Click a section or object. Shift selects all matching; Ctrl adds to the selection.",options:[t(Os,{label:"Select all",on:ie,hint:"Select every matching ground surface, including separate areas, or every object of this sort (Shift + click)",onClick:Jt(x,()=>{if(le(!ie),O?.surface)V((ne)=>ne.map((me)=>({...me,whole:!ie})));else if(ue||Me)z(ie?[]:[{sort:ue??Me,tree:!!ue}])})}),t(Os,{label:"Add",on:te,hint:"Add to the selection; click a picked object again to remove it (Ctrl + click)",onClick:Jt(x,()=>ve(!te))})]}),pt&&t(Ld,{elevation:Tt,view:x}),_t&&t(rd,{band:Ge,view:x}),J==="camera"&&t(fd,{camera:je,view:x}),ct&&t(Fd,{move:en,view:x}),J==="copy"&&Ze&&t(_d,{name:m,edits:L,view:x,picked:O,onWheel:Ye},ge),k&&t(Yd,{at:k,object:!!O?.id,mark:Ze?pe:null,canDelete:_e.length>0&&Ze,onClose:fe,onEdit:()=>{if(ae("select"),O?.surface){if(V([O.surface]),O.surface.face===void 0)Ce(!0)}P(!1),x.focus()},onMove:Ze&&O?.id&&x.canMove(O.id)?()=>{ae("move"),ye(null),x.focus()}:null,onDuplicate:Ze&&O?.id&&x.canMove(O.id)?()=>{Te((ne)=>ne+1),ae("copy"),ye(null),x.focus()}:null,onSmooth:Ze&&O?.road?()=>{ae("smooth"),Ge.start(O.road[0],O.road[1]),ye(null),x.focus()}:null,onMark:()=>{z([Me?{sort:Me,tree:!1}:{sort:ue,tree:!0}]),x.focus()},onDelete:()=>{Ee(),x.focus()}}),bt.asking&&t(Bd,{title:g,taken:_,canOverwrite:bt.canSave,onOverwrite:()=>void bt.chosen(null),onSaveNew:(ne)=>void bt.chosen(ne),onCancel:bt.cancel})]})}class ch extends Ba{constructor(m){super(m)}parse(m,g){let _={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},x=542327876,y=131072,v=512,b=1024,S=2048,M=4096,w=8192,E=16384,A=32768,T=95,R=96;function P(Be){return Be.charCodeAt(0)+(Be.charCodeAt(1)<<8)+(Be.charCodeAt(2)<<16)+(Be.charCodeAt(3)<<24)}function N(Be){return String.fromCharCode(Be&255,Be>>8&255,Be>>16&255,Be>>24&255)}function C(Be,Ke,Ye,Ze){let pt=Ye*Ze*4,vt=new Uint8Array(Be,Ke,pt),_t=new Uint8Array(pt),ot=0,ct=0;for(let bt=0;bt<Ze;bt++)for(let kt=0;kt<Ye;kt++){let Ut=vt[ct];ct++;let Q=vt[ct];ct++;let $t=vt[ct];ct++;let mt=vt[ct];ct++,_t[ot]=$t,ot++,_t[ot]=Q,ot++,_t[ot]=Ut,ot++,_t[ot]=mt,ot++}return _t}function I(Be,Ke,Ye,Ze){let pt=Ye*Ze*3,vt=new Uint8Array(Be,Ke,pt),_t=new Uint8Array(Ye*Ze*4),ot=0,ct=0;for(let bt=0;bt<Ze;bt++)for(let kt=0;kt<Ye;kt++){let Ut=vt[ct];ct++;let Q=vt[ct];ct++;let $t=vt[ct];ct++,_t[ot]=$t,ot++,_t[ot]=Q,ot++,_t[ot]=Ut,ot++,_t[ot]=255,ot++}return _t}let L=P("DXT1"),U=P("DXT3"),O=P("DXT5"),F=P("ETC1"),k=P("DX10"),D=31,B=5,z=0,W=1,V=2,Y=3,ee=4,X=7,ie=21,le=22,te=23,ve=24,J=25,ae=26,ge=28,Te=0,ce=new Int32Array(m,0,D);if(ce[z]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),_;let ye,Ie=ce[ie],xe=!1,Ue=!1,Ce=ce[W]+4;switch(Ie){case L:ye=8,_.format=ar;break;case U:ye=16,_.format=lr;break;case O:ye=16,_.format=cr;break;case F:ye=8,_.format=to;break;case k:Ce+=B*4;let Ke=new Int32Array(m,(D+1)*4,B)[Te];switch(Ke){case 96:{ye=16,_.format=no;break}case 95:{ye=16,_.format=io;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",Ke),_}break;default:if(ce[le]===32&&ce[te]&16711680&&ce[ve]&65280&&ce[J]&255&&ce[ae]&4278190080)xe=!0,ye=64,_.format=Ln;else if(ce[le]===24&&ce[te]&16711680&&ce[ve]&65280&&ce[J]&255)Ue=!0,ye=64,_.format=Ln;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",N(Ie)),_}if(_.mipmapCount=1,ce[V]&131072&&g!==!1)_.mipmapCount=Math.max(1,ce[X]);let rt=ce[ge];if(_.isCubemap=rt&512?!0:!1,_.isCubemap&&(!(rt&1024)||!(rt&2048)||!(rt&4096)||!(rt&8192)||!(rt&16384)||!(rt&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),_;_.width=ce[ee],_.height=ce[Y];let tt=_.isCubemap?6:1;for(let Be=0;Be<tt;Be++){let{width:Ke,height:Ye}=_;for(let Ze=0;Ze<_.mipmapCount;Ze++){let pt,vt;if(xe)pt=C(m,Ce,Ke,Ye),vt=pt.length;else if(Ue)pt=I(m,Ce,Ke,Ye),vt=Ke*Ye*3;else vt=Math.ceil(Ke/4)*Math.ceil(Ye/4)*ye,pt=new Uint8Array(m,Ce,vt);let _t={data:pt,width:Ke,height:Ye};_.mipmaps.push(_t),Ce+=vt,Ke=Math.max(Ke>>1,1),Ye=Math.max(Ye>>1,1)}}return _}}var Um=0,Fm=1,Bm=2;var uh=2;var el=1.25,hh=1,dn=32,Pt=8,tl=65535;var pr=Math.pow(2,-24),bo=Symbol("SKIP_GENERATION"),nl={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[bo]:!1};function Dt(m,g,_){return _.min.x=g[m],_.min.y=g[m+1],_.min.z=g[m+2],_.max.x=g[m+3],_.max.y=g[m+4],_.max.z=g[m+5],_}function So(m){let g=-1,_=-1/0;for(let x=0;x<3;x++){let y=m[x+3]-m[x];if(y>_)_=y,g=x}return g}function dh(m,g,_){for(let x=0;x<3;x++){let y=g[m+2*x],v=g[m+2*x+1],b=y-v,S=y+v;if(b<_[x])_[x]=b;if(S>_[x+3])_[x+3]=S}}function il(m){let g=m[3]-m[0],_=m[4]-m[1],x=m[5]-m[2];return 2*(g*_+_*x+x*g)}function gt(m,g){return g[m+15]===tl}function Et(m,g){return g[m+6]}function It(m,g){return g[m+14]}function Mt(m){return m+Pt}function wt(m,g){let _=g[m+6];return m+_*Pt}function mr(m,g){return g[m+7]}function Bt(m){return m}function sl(m,g,_,x,y){let v=1/0,b=1/0,S=1/0,M=-1/0,w=-1/0,E=-1/0,A=1/0,T=1/0,R=1/0,P=-1/0,N=-1/0,C=-1/0,I=m.offset||0;for(let L=(g-I)*6,U=(g+_-I)*6;L<U;L+=6){let O=m[L+0],F=m[L+1],k=O-F,D=O+F;if(k<v)v=k;if(D>M)M=D;if(O<A)A=O;if(O>P)P=O;let B=m[L+2],z=m[L+3],W=B-z,V=B+z;if(W<b)b=W;if(V>w)w=V;if(B<T)T=B;if(B>N)N=B;let Y=m[L+4],ee=m[L+5],X=Y-ee,ie=Y+ee;if(X<S)S=X;if(ie>E)E=ie;if(Y<R)R=Y;if(Y>C)C=Y}x[0]=v,x[1]=b,x[2]=S,x[3]=M,x[4]=w,x[5]=E,y[0]=A,y[1]=T,y[2]=R,y[3]=P,y[4]=N,y[5]=C}var gi=8,ph=8,fh=new Int32Array(gi),mi=new Float32Array(gi*6),gr=new Float32Array(gi*6),ri=new Float32Array(6),rl=new Float32Array(6),is=new Int32Array(ph),km=new Float32Array(ph*6);function kS(m,g,_,x){for(let y=0;y<3;y++){let v=g[m+2*y],b=g[m+2*y+1],S=v-b,M=v+b;if(S<_[x+y])_[x+y]=S;if(M>_[x+y+3])_[x+y+3]=M}}function zm(m,g){let _=m[g+3]-m[g],x=m[g+4]-m[g+1],y=m[g+5]-m[g+2];return 2*(_*x+x*y+y*_)}function Hm(m,g,_,x,y,v){let b=-1,S=0;if(v===Um){if(b=So(g),b!==-1)S=(g[b]+g[b+3])/2}else if(v===Fm){if(b=So(m),b!==-1)S=zS(_,x,y,b)}else if(v===Bm){let M=il(m),w=el*y,E=_.offset||0,A=(x-E)*6,T=(x+y-E)*6;for(let R=0;R<3;R++){let P=g[R],I=(g[R+3]-P)/gi;if(y<ph){for(let L=0;L<y;L++){let U=A+L*6,O=_[U+2*R],F=L;while(F>0&&_[is[F-1]+2*R]>O)is[F]=is[F-1],F--;is[F]=U}for(let L=0;L<3;L++)ri[L]=1/0,ri[L+3]=-1/0,rl[L]=1/0,rl[L+3]=-1/0;for(let L=y-1;L>=0;L--)dh(is[L],_,rl),km.set(rl,L*6);for(let L=0;L<y-1;L++){dh(is[L],_,ri);let U=_[is[L+1]+2*R];if(_[is[L]+2*R]===U)continue;let O=L+1,F=y-O,k=il(ri)/M,D=zm(km,O*6)/M,B=hh+el*(k*O+D*F);if(B<w)b=R,w=B,S=U}}else{for(let O=0;O<gi;O++){fh[O]=0;for(let F=0;F<3;F++)mi[O*6+F]=1/0,mi[O*6+F+3]=-1/0}for(let O=A;O<T;O+=6){let D=~~((_[O+2*R]-P)/I);if(D>=gi)D=gi-1;fh[D]++,kS(O,_,mi,D*6)}let L=(gi-1)*6;for(let O=0;O<6;O++)gr[L+O]=mi[L+O];for(let O=gi-2;O>=0;O--){let F=O*6,k=F+6;for(let D=0;D<3;D++)gr[F+D]=Math.min(mi[F+D],gr[k+D]),gr[F+D+3]=Math.max(mi[F+D+3],gr[k+D+3])}let U=0;for(let O=0;O<gi-1;O++){let F=O*6,k=fh[O];if(k!==0)for(let V=0;V<3;V++)if(U===0)ri[V]=mi[F+V],ri[V+3]=mi[F+V+3];else ri[V]=Math.min(ri[V],mi[F+V]),ri[V+3]=Math.max(ri[V+3],mi[F+V+3]);U+=k;let D=0,B=0;if(U!==0)D=il(ri)/M;let z=y-U;if(z!==0)B=zm(gr,F+6)/M;let W=hh+el*(D*U+B*z);if(W<w)b=R,w=W,S=P+I+O*I}}}}else console.warn(`BVH: Invalid build strategy value ${v} used.`);return{axis:b,pos:S}}function zS(m,g,_,x){let y=0,v=m.offset;for(let b=g,S=g+_;b<S;b++)y+=m[(b-v)*6+x*2];return y/_}function Gm(m,g,_,x,y,v){let b=x,S=x+y-1,M=v.pos,w=v.axis*2,E=_.offset||0;while(!0){while(b<=S&&_[(b-E)*6+w]<M)b++;while(b<=S&&_[(S-E)*6+w]>=M)S--;if(b<S){for(let A=0;A<g;A++){let T=m[b*g+A];m[b*g+A]=m[S*g+A],m[S*g+A]=T}for(let A=0;A<6;A++){let T=b-E,R=S-E,P=_[T*6+A];_[T*6+A]=_[R*6+A],_[R*6+A]=P}b++,S--}else return b}}var HS=Math.pow(2,32),_r=new Float32Array(6),ol=new Float32Array(6);function GS(m,g,_,x,y,v){let{maxDepth:b,verbose:S,targetLeafSize:M,_strictLeafSize:w=1/0,strategy:E,onProgress:A,useSharedArrayBuffer:T=!1}=y,{primitiveBuffer:R,primitiveBufferStride:P}=m,C=new(T?SharedArrayBuffer:ArrayBuffer)(dn*Math.max(1,2*Math.ceil(x)-1)),I=new Float32Array(C),L=new Uint32Array(C),U=new Uint16Array(C),O=0,F=!1;return sl(g,_,x,_r,ol),B(_,x,0),C.slice(0,O*dn);function k(z){if(A)A((z-v.offset)/v.count)}function D(z,W,V){let Y=z*2;L[z+6]=W,U[Y+14]=V,U[Y+15]=tl,k(W+V)}function B(z,W,V){let Y=O++,ee=Y*Pt;if(I.set(_r,ee),!F&&V>=b){if(F=!0,S)console.warn(`BVH: Max depth of ${b} reached when generating BVH. Consider increasing maxDepth.`)}let X=W>w;if(W<=M&&!X||V>=b){D(ee,z,W);return}let ie=Hm(_r,ol,g,z,W,E),le=ie.axis===-1?-1:Gm(R,P,g,z,W,ie);if(ie.axis===-1||le===z||le===z+W){if(!X){D(ee,z,W);return}ie.axis=Math.max(0,So(_r)),le=z+Math.max(1,Math.floor(W/2))}L[ee+7]=ie.axis;let te=le-z;sl(g,z,te,_r,ol),B(z,te,V+1);let ve=O-Y;if(ve>HS)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");L[ee+6]=ve;let J=W-te;sl(g,le,J,_r,ol),B(le,J,V+1)}}function Vm(m,g){let _=m.getRootRanges(g.range),x=_[0],y=_[_.length-1],v={offset:x.offset,count:y.offset+y.count-x.offset},b=new Float32Array(6*v.count);b.offset=v.offset,m.computePrimitiveBounds(v.offset,v.count,b),m._roots=_.map((S)=>GS(m,b,S.offset,S.count,g,v))}class Is{constructor(m){this._getNewPrimitive=m,this._primitives=[]}getPrimitive(){let m=this._primitives;if(m.length===0)return this._getNewPrimitive();else return m.pop()}releasePrimitive(m){this._primitives.push(m)}}class Wm{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let m=[],g=null;this.setBuffer=(_)=>{if(g)m.push(g);g=_,this.float32Array=new Float32Array(_),this.uint16Array=new Uint16Array(_),this.uint32Array=new Uint32Array(_)},this.clearBuffer=()=>{if(g=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,m.length!==0)this.setBuffer(m.pop())}}}var ht=new Wm;var ss,yr,xr=[],al=new Is(()=>new yt);function Xm(m,g,_,x,y,v){ss=al.getPrimitive(),yr=al.getPrimitive(),xr.push(ss,yr),ht.setBuffer(m._roots[g]);let b=mh(0,m.geometry,_,x,y,v);ht.clearBuffer(),al.releasePrimitive(ss),al.releasePrimitive(yr),xr.pop(),xr.pop();let S=xr.length;if(S>0)yr=xr[S-1],ss=xr[S-2];return b}function mh(m,g,_,x,y=null,v=0,b=0){let{float32Array:S,uint16Array:M,uint32Array:w}=ht,E=m*2;if(gt(E,M)){let T=Et(m,w),R=It(E,M);return Dt(Bt(m),S,ss),x(T,R,!1,b,v+m/Pt,ss)}else{let W=function(Y){let{uint16Array:ee,uint32Array:X}=ht,ie=Y*2;while(!gt(ie,ee))Y=Mt(Y),ie=Y*2;return Et(Y,X)},V=function(Y){let{uint16Array:ee,uint32Array:X}=ht,ie=Y*2;while(!gt(ie,ee))Y=wt(Y,X),ie=Y*2;return Et(Y,X)+It(ie,ee)},T=Mt(m),R=wt(m,w),P=T,N=R,C,I,L,U;if(y){if(L=ss,U=yr,Dt(Bt(P),S,L),Dt(Bt(N),S,U),C=y(L),I=y(U),I<C){P=R,N=T;let Y=C;C=I,I=Y,L=U}}if(!L)L=ss,Dt(Bt(P),S,L);let O=gt(P*2,M),F=_(L,O,C,b+1,v+P/Pt),k;if(F===uh){let Y=W(P),X=V(P)-Y;k=x(Y,X,!0,b+1,v+P/Pt,L)}else k=F&&mh(P,g,_,x,y,v,b+1);if(k)return!0;U=yr,Dt(Bt(N),S,U);let D=gt(N*2,M),B=_(U,D,I,b+1,v+N/Pt),z;if(B===uh){let Y=W(N),X=V(N)-Y;z=x(Y,X,!0,b+1,v+N/Pt,U)}else z=B&&mh(N,g,_,x,y,v,b+1);if(z)return!0;return!1}}var Mo=new ht.constructor,ll=new ht.constructor,rs=new Is(()=>new yt),vr=new yt,br=new yt,gh=new yt,_h=new yt,xh=!1;function qm(m,g,_,x){if(xh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");xh=!0;let y=m._roots,v=g._roots,b,S=0,M=0,w=new Qe().copy(_).invert();for(let E=0,A=y.length;E<A;E++){Mo.setBuffer(y[E]),M=0;let T=rs.getPrimitive();Dt(Bt(0),Mo.float32Array,T),T.applyMatrix4(w);for(let R=0,P=v.length;R<P;R++)if(ll.setBuffer(v[R]),b=oi(0,0,_,w,x,S,M,0,0,T),ll.clearBuffer(),M+=v[R].byteLength/dn,b)break;if(rs.releasePrimitive(T),Mo.clearBuffer(),S+=y[E].byteLength/dn,b)break}return xh=!1,b}function oi(m,g,_,x,y,v=0,b=0,S=0,M=0,w=null,E=!1){let A,T;if(E)A=ll,T=Mo;else A=Mo,T=ll;let R=A.float32Array,P=A.uint32Array,N=A.uint16Array,C=T.float32Array,I=T.uint32Array,L=T.uint16Array,U=m*2,O=g*2,F=gt(U,N),k=gt(O,L),D=!1;if(k&&F)if(E)D=y(Et(g,I),It(g*2,L),Et(m,P),It(m*2,N),M,b+g/Pt,S,v+m/Pt);else D=y(Et(m,P),It(m*2,N),Et(g,I),It(g*2,L),S,v+m/Pt,M,b+g/Pt);else if(k){let B=rs.getPrimitive();Dt(Bt(g),C,B),B.applyMatrix4(_);let z=Mt(m),W=wt(m,P);Dt(Bt(z),R,vr),Dt(Bt(W),R,br);let V=B.intersectsBox(vr),Y=B.intersectsBox(br);D=V&&oi(g,z,x,_,y,b,v,M,S+1,B,!E)||Y&&oi(g,W,x,_,y,b,v,M,S+1,B,!E),rs.releasePrimitive(B)}else{let B=Mt(g),z=wt(g,I);Dt(Bt(B),C,gh),Dt(Bt(z),C,_h);let W=w.intersectsBox(gh),V=w.intersectsBox(_h);if(W&&V)D=oi(m,B,_,x,y,v,b,S,M+1,w,E)||oi(m,z,_,x,y,v,b,S,M+1,w,E);else if(W)if(F)D=oi(m,B,_,x,y,v,b,S,M+1,w,E);else{let Y=rs.getPrimitive();Y.copy(gh).applyMatrix4(_);let ee=Mt(m),X=wt(m,P);Dt(Bt(ee),R,vr),Dt(Bt(X),R,br);let ie=Y.intersectsBox(vr),le=Y.intersectsBox(br);D=ie&&oi(B,ee,x,_,y,b,v,M,S+1,Y,!E)||le&&oi(B,X,x,_,y,b,v,M,S+1,Y,!E),rs.releasePrimitive(Y)}else if(V)if(F)D=oi(m,z,_,x,y,v,b,S,M+1,w,E);else{let Y=rs.getPrimitive();Y.copy(_h).applyMatrix4(_);let ee=Mt(m),X=wt(m,P);Dt(Bt(ee),R,vr),Dt(Bt(X),R,br);let ie=Y.intersectsBox(vr),le=Y.intersectsBox(br);D=ie&&oi(z,ee,x,_,y,b,v,M,S+1,Y,!E)||le&&oi(z,X,x,_,y,b,v,M,S+1,Y,!E),rs.releasePrimitive(Y)}}return D}var cl=new class{constructor(){let m=null,g=null,_=null,x=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(v,b)=>{if(x)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=b,this.buffer=m=v._roots[b],this.uint16Array=_=new Uint16Array(m),this.uint32Array=g=new Uint32Array(m)},this.reset=()=>{this.root=null,this.buffer=m=null,this.uint16Array=_=null,this.uint32Array=g=null},this.getRangeStart=(v)=>{let b=v*2;while(!gt(b,_))v=Mt(v),b=v*2;return Et(v,g)},this.getRangeEnd=(v)=>{let b=v*2;while(!gt(b,_))v=wt(v,g),b=v*2;return Et(v,g)+It(b,_)};let y=(v,b,S)=>{let M=b*2,w=gt(M,_);if(!v(S,w,b)&&!w){let A=Mt(b),T=wt(b,g);y(v,A,S+1),y(v,T,S+1)}};this.traverseBuffer=(v)=>{if(x)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");x=!0;try{y(v,0,0)}finally{x=!1}},this.traverse=(v)=>{this.traverseBuffer((b,S,M)=>{if(S){let w=M*2,E=g[M+6],A=_[w+14];return v(b,S,new Float32Array(m,M*4,6),E,A)}else{let w=mr(M,g);return v(b,S,new Float32Array(m,M*4,6),w)}})}}};var Ym=new yt,Sr=new Float32Array(6);class yh{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(m){if(m={...nl,...m},"maxLeafSize"in m)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),m={...m,targetLeafSize:m.maxLeafSize};Vm(this,m)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(m,g,_,x){let y=1/0,v=1/0,b=1/0,S=-1/0,M=-1/0,w=-1/0;for(let E=m,A=m+g;E<A;E++){this.writePrimitiveBounds(E,Sr,0);let[T,R,P,N,C,I]=Sr;if(T<y)y=T;if(N>S)S=N;if(R<v)v=R;if(C>M)M=C;if(P<b)b=P;if(I>w)w=I}return _[x+0]=y,_[x+1]=v,_[x+2]=b,_[x+3]=S,_[x+4]=M,_[x+5]=w,_}computePrimitiveBounds(m,g,_){let x=_.offset||0;for(let y=m,v=m+g;y<v;y++){this.writePrimitiveBounds(y,Sr,0);let[b,S,M,w,E,A]=Sr,T=(b+w)/2,R=(S+E)/2,P=(M+A)/2,N=(w-b)/2,C=(E-S)/2,I=(A-M)/2,L=(y-x)*6;_[L+0]=T,_[L+1]=N+(Math.abs(T)+N)*pr,_[L+2]=R,_[L+3]=C+(Math.abs(R)+C)*pr,_[L+4]=P,_[L+5]=I+(Math.abs(P)+I)*pr}return _}shiftPrimitiveOffsets(m){let g=this._indirectBuffer;if(g)for(let _=0,x=g.length;_<x;_++)g[_]+=m;else{let _=this._roots;for(let x=0;x<_.length;x++){let y=_[x],v=new Uint32Array(y),b=new Uint16Array(y),S=y.byteLength/dn;for(let M=0;M<S;M++){let w=Pt*M,E=2*w;if(gt(E,b))v[w+6]+=m}}}}traverse(m,g=0){cl.setBVH(this,g),cl.traverse(m),cl.reset()}refit(){let m=this._roots;for(let g=0,_=m.length;g<_;g++){let x=m[g],y=new Uint32Array(x),v=new Uint16Array(x),b=new Float32Array(x),S=x.byteLength/dn;for(let M=S-1;M>=0;M--){let w=M*Pt,E=w*2;if(gt(E,v)){let T=Et(w,y),R=It(E,v);this.writePrimitiveRangeBounds(T,R,Sr,0),b.set(Sr,w)}else{let T=Mt(w),R=wt(w,y);for(let P=0;P<3;P++){let N=b[T+P],C=b[T+P+3],I=b[R+P],L=b[R+P+3];b[w+P]=N<I?N:I,b[w+P+3]=C>L?C:L}}}}}getBoundingBox(m){return m.makeEmpty(),this._roots.forEach((_)=>{Dt(0,new Float32Array(_),Ym),m.union(Ym)}),m}shapecast(m){let{boundsTraverseOrder:g,intersectsBounds:_,intersectsRange:x,intersectsPrimitive:y,scratchPrimitive:v,iterate:b}=m;if(x&&y){let E=x;x=(A,T,R,P,N)=>{if(!E(A,T,R,P,N))return b(A,T,this,y,R,P,v);return!0}}else if(!x)if(y)x=(E,A,T,R)=>b(E,A,this,y,T,R,v);else x=(E,A,T)=>T;let S=!1,M=0,w=this._roots;for(let E=0,A=w.length;E<A;E++){let T=w[E];if(S=Xm(this,E,_,x,g,M),S)break;M+=T.byteLength/dn}return S}bvhcast(m,g,_){let{intersectsRanges:x}=_;return qm(this,m,g,x)}}function $m(){return typeof SharedArrayBuffer<"u"}function vh(m){return m.index?m.index.count:m.attributes.position.count}function os(m){return vh(m)/3}function VS(m,g=ArrayBuffer){if(m>65535)return new Uint32Array(new g(4*m));else return new Uint16Array(new g(2*m))}function Zm(m,g){if(!m.index){let _=m.attributes.position.count,x=g.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,y=VS(_,x);m.setIndex(new Qt(y,1));for(let v=0;v<_;v++)y[v]=v}}function WS(m,g,_){let x=vh(m)/_,y=g?g:m.drawRange,v=y.start/_,b=(y.start+y.count)/_,S=Math.max(0,v),M=Math.min(x,b)-S;return{offset:Math.floor(S),count:Math.floor(M)}}function XS(m,g){return m.groups.map((_)=>({offset:_.start/g,count:_.count/g}))}function bh(m,g,_){let x=WS(m,g,_),y=XS(m,_);if(!y.length)return[x];let v=[],b=x.offset,S=x.offset+x.count,M=vh(m)/_,w=[];for(let T of y){let{offset:R,count:P}=T,N=R,C=isFinite(P)?P:M-R,I=R+C;if(N<S&&I>b)w.push({pos:Math.max(b,N),isStart:!0}),w.push({pos:Math.min(S,I),isStart:!1})}w.sort((T,R)=>{if(T.pos!==R.pos)return T.pos-R.pos;else return T.type==="end"?-1:1});let E=0,A=null;for(let T of w){let R=T.pos;if(E!==0&&R!==A)v.push({offset:A,count:R-A});E+=T.isStart?1:-1,A=R}return v}function qS(m,g){let _=m[m.length-1],x=_.offset+_.count>65536,y=m.reduce((w,E)=>w+E.count,0),v=x?4:2,b=g?new SharedArrayBuffer(y*v):new ArrayBuffer(y*v),S=x?new Uint32Array(b):new Uint16Array(b),M=0;for(let w=0;w<m.length;w++){let{offset:E,count:A}=m[w];for(let T=0;T<A;T++)S[M+T]=E+T;M+=A}return S}class Sh extends yh{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(m){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(m){}constructor(m,g={}){if(!m.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(m.index&&m.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(g.useSharedArrayBuffer&&!$m())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=m,this.resolvePrimitiveIndex=g.indirect?(_)=>this._indirectBuffer[_]:(_)=>_,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,g={...nl,...g},!g[bo])this.init(g)}init(m){let{geometry:g,primitiveStride:_}=this;if(m.indirect){let x=bh(g,m.range,_),y=qS(x,m.useSharedArrayBuffer);this._indirectBuffer=y}else Zm(g,m);if(super.init(m),!g.boundingBox&&m.setBoundingBox)g.boundingBox=this.getBoundingBox(new yt)}getRootRanges(m){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return bh(this.geometry,m,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class zn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(m,g){let _=1/0,x=-1/0;for(let y=0,v=m.length;y<v;y++){let S=m[y][g];_=S<_?S:_,x=S>x?S:x}this.min=_,this.max=x}setFromPoints(m,g){let _=1/0,x=-1/0;for(let y=0,v=g.length;y<v;y++){let b=g[y],S=m.dot(b);_=S<_?S:_,x=S>x?S:x}this.min=_,this.max=x}isSeparated(m){return this.min>m.max||m.min>this.max}}zn.prototype.setFromBox=function(){let m=new Z;return function(_,x){let{min:y,max:v}=x,b=1/0,S=-1/0;for(let M=0;M<=1;M++)for(let w=0;w<=1;w++)for(let E=0;E<=1;E++){m.x=y.x*M+v.x*(1-M),m.y=y.y*w+v.y*(1-w),m.z=y.z*E+v.z*(1-E);let A=_.dot(m);b=Math.min(A,b),S=Math.max(A,S)}this.min=b,this.max=S}}();var pP=function(){let m=new zn;return function(_,x){let{points:y,satAxes:v,satBounds:b}=_,{points:S,satAxes:M,satBounds:w}=x;for(let E=0;E<3;E++){let A=b[E],T=v[E];if(m.setFromPoints(T,S),A.isSeparated(m))return!1}for(let E=0;E<3;E++){let A=w[E],T=M[E];if(m.setFromPoints(T,y),A.isSeparated(m))return!1}}}();var YS=function(){let m=new Z,g=new Z,_=new Z;return function(y,v,b){let S=y.start,M=m,w=v.start,E=g;_.subVectors(S,w),m.subVectors(y.end,y.start),g.subVectors(v.end,v.start);let A=_.dot(E),T=E.dot(M),R=E.dot(E),P=_.dot(M),C=M.dot(M)*R-T*T,I,L;if(C!==0)I=(A*T-P*R)/C;else I=0;L=(A+I*T)/R,b.x=I,b.y=L}}(),wo=function(){let m=new $e,g=new Z,_=new Z;return function(y,v,b,S){YS(y,v,m);let{x:M,y:w}=m;if(M>=0&&M<=1&&w>=0&&w<=1){y.at(M,b),v.at(w,S);return}else if(M>=0&&M<=1){if(w<0)v.at(0,S);else v.at(1,S);y.closestPointToPoint(S,!0,b);return}else if(w>=0&&w<=1){if(M<0)y.at(0,b);else y.at(1,b);v.closestPointToPoint(b,!0,S);return}else{let E;if(M<0)E=y.start;else E=y.end;let A;if(w<0)A=v.start;else A=v.end;let T=g,R=_;if(y.closestPointToPoint(A,!0,g),v.closestPointToPoint(E,!0,_),T.distanceToSquared(A)<=R.distanceToSquared(E)){b.copy(T),S.copy(A);return}else{b.copy(E),S.copy(R);return}}}}(),Jm=function(){let m=new Z,g=new Z,_=new mn,x=new Un;return function(v,b){let{radius:S,center:M}=v,{a:w,b:E,c:A}=b;if(x.start=w,x.end=E,x.closestPointToPoint(M,!0,m).distanceTo(M)<=S)return!0;if(x.start=w,x.end=A,x.closestPointToPoint(M,!0,m).distanceTo(M)<=S)return!0;if(x.start=E,x.end=A,x.closestPointToPoint(M,!0,m).distanceTo(M)<=S)return!0;let N=b.getPlane(_);if(Math.abs(N.distanceToPoint(M))<=S){let I=N.projectPoint(M,g);if(b.containsPoint(I))return!0}return!1}}();var $S=["x","y","z"],Fi=0.000000000000001,Km=Fi*Fi;function Jn(m){return Math.abs(m)<Fi}class Tn extends jt{constructor(...m){super(...m);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new Z),this.satBounds=[,,,,].fill().map(()=>new zn),this.points=[this.a,this.b,this.c],this.plane=new mn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new Un,this.needsUpdate=!0}intersectsSphere(m){return Jm(m,this)}update(){let m=this.a,g=this.b,_=this.c,x=this.points,y=this.satAxes,v=this.satBounds,b=y[0],S=v[0];this.getNormal(b),S.setFromPoints(b,x);let M=y[1],w=v[1];M.subVectors(m,g),w.setFromPoints(M,x);let E=y[2],A=v[2];E.subVectors(g,_),A.setFromPoints(E,x);let T=y[3],R=v[3];T.subVectors(_,m),R.setFromPoints(T,x);let P=M.length(),N=E.length(),C=T.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,P<Fi)if(N<Fi||C<Fi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(_);else if(N<Fi)if(C<Fi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(g),this.degenerateSegment.end.copy(m);else if(C<Fi)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(_),this.degenerateSegment.end.copy(g);this.plane.setFromNormalAndCoplanarPoint(b,m),this.needsUpdate=!1}}Tn.prototype.closestPointToSegment=function(){let m=new Z,g=new Z,_=new Un;return function(y,v=null,b=null){if(this.needsUpdate)this.update();let{start:S,end:M}=y,w=this.points,E,A=1/0,T=this.plane.distanceToPoint(S),R=this.plane.distanceToPoint(M);if(T*R<0&&this.plane.intersectLine(y,m)!==null&&this.containsPoint(m)){if(v)v.copy(m);if(b)b.copy(m);return 0}for(let P=0;P<3;P++){let N=(P+1)%3;if(_.start.copy(w[P]),_.end.copy(w[N]),wo(_,y,m,g),E=m.distanceToSquared(g),E<A){if(A=E,v)v.copy(m);if(b)b.copy(g)}}if(this.closestPointToPoint(S,m),E=S.distanceToSquared(m),E<A){if(A=E,v)v.copy(m);if(b)b.copy(S)}if(this.closestPointToPoint(M,m),E=M.distanceToSquared(m),E<A){if(A=E,v)v.copy(m);if(b)b.copy(M)}return Math.sqrt(A)}}();Tn.prototype.intersectsTriangle=function(){let m=new Tn,g=new zn,_=new zn,x=new Z,y=new Z,v=new Z,b=new Z,S=new Un,M=new Un,w=new Z,E=new $e,A=new $e;function T(U,O,F,k){let D=x;if(!U.isDegenerateIntoPoint&&!U.isDegenerateIntoSegment)D.copy(U.plane.normal);else D.copy(O.plane.normal);let{satBounds:B,satAxes:z}=U;for(let Y=1;Y<4;Y++){let ee=B[Y],X=z[Y];if(g.setFromPoints(X,O.points),ee.isSeparated(g))return!1;if(b.copy(D).cross(X),g.setFromPoints(b,U.points),_.setFromPoints(b,O.points),g.isSeparated(_))return!1}let{satBounds:W,satAxes:V}=O;for(let Y=1;Y<4;Y++){let ee=W[Y],X=V[Y];if(g.setFromPoints(X,U.points),ee.isSeparated(g))return!1;if(b.crossVectors(D,X),g.setFromPoints(b,U.points),_.setFromPoints(b,O.points),g.isSeparated(_))return!1}if(F){if(!k)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");F.start.set(0,0,0),F.end.set(0,0,0)}return!0}function R(U,O,F,k,D,B,z,W,V,Y,ee){let X=z/(z-W);Y.x=k+(D-k)*X,ee.start.subVectors(O,U).multiplyScalar(X).add(U),X=z/(z-V),Y.y=k+(B-k)*X,ee.end.subVectors(F,U).multiplyScalar(X).add(U)}function P(U,O,F,k,D,B,z,W,V,Y,ee){if(D>0)R(U.c,U.a,U.b,k,O,F,V,z,W,Y,ee);else if(B>0)R(U.b,U.a,U.c,F,O,k,W,z,V,Y,ee);else if(W*V>0||z!=0)R(U.a,U.b,U.c,O,F,k,z,W,V,Y,ee);else if(W!=0)R(U.b,U.a,U.c,F,O,k,W,z,V,Y,ee);else if(V!=0)R(U.c,U.a,U.b,k,O,F,V,z,W,Y,ee);else return!0;return!1}function N(U,O,F,k){let D=O.degenerateSegment,B=U.plane.distanceToPoint(D.start),z=U.plane.distanceToPoint(D.end);if(Jn(B))if(Jn(z))return T(U,O,F,k);else{if(F)F.start.copy(D.start),F.end.copy(D.start);return U.containsPoint(D.start)}else if(Jn(z)){if(F)F.start.copy(D.end),F.end.copy(D.end);return U.containsPoint(D.end)}else if(U.plane.intersectLine(D,x)!=null){if(F)F.start.copy(x),F.end.copy(x);return U.containsPoint(x)}else return!1}function C(U,O,F){let k=O.a;if(Jn(U.plane.distanceToPoint(k))&&U.containsPoint(k)){if(F)F.start.copy(k),F.end.copy(k);return!0}else return!1}function I(U,O,F){let k=U.degenerateSegment,D=O.a;if(k.closestPointToPoint(D,!0,x),D.distanceToSquared(x)<Km){if(F)F.start.copy(D),F.end.copy(D);return!0}else return!1}function L(U,O,F,k){if(U.isDegenerateIntoSegment)if(O.isDegenerateIntoSegment){let D=U.degenerateSegment,B=O.degenerateSegment,z=y,W=v;D.delta(z),B.delta(W);let V=x.subVectors(B.start,D.start),Y=z.x*W.y-z.y*W.x;if(Jn(Y))return!1;let ee=(V.x*W.y-V.y*W.x)/Y,X=-(z.x*V.y-z.y*V.x)/Y;if(ee<0||ee>1||X<0||X>1)return!1;let ie=D.start.z+z.z*ee,le=B.start.z+W.z*X;if(Jn(ie-le)){if(F)F.start.copy(D.start).addScaledVector(z,ee),F.end.copy(D.start).addScaledVector(z,ee);return!0}else return!1}else if(O.isDegenerateIntoPoint)return I(U,O,F);else return N(O,U,F,k);else if(U.isDegenerateIntoPoint)if(O.isDegenerateIntoPoint)if(O.a.distanceToSquared(U.a)<Km){if(F)F.start.copy(U.a),F.end.copy(U.a);return!0}else return!1;else if(O.isDegenerateIntoSegment)return I(O,U,F);else return C(O,U,F);else if(O.isDegenerateIntoPoint)return C(U,O,F);else if(O.isDegenerateIntoSegment)return N(U,O,F,k)}return function(O,F=null,k=!1){if(this.needsUpdate)this.update();if(!O.isExtendedTriangle)m.copy(O),m.update(),O=m;else if(O.needsUpdate)O.update();let D=L(this,O,F,k);if(D!==void 0)return D;let B=this.plane,z=O.plane,W=z.distanceToPoint(this.a),V=z.distanceToPoint(this.b),Y=z.distanceToPoint(this.c);if(Jn(W))W=0;if(Jn(V))V=0;if(Jn(Y))Y=0;let ee=W*V,X=W*Y;if(ee>0&&X>0)return!1;let ie=B.distanceToPoint(O.a),le=B.distanceToPoint(O.b),te=B.distanceToPoint(O.c);if(Jn(ie))ie=0;if(Jn(le))le=0;if(Jn(te))te=0;let ve=ie*le,J=ie*te;if(ve>0&&J>0)return!1;y.copy(B.normal),v.copy(z.normal);let ae=y.cross(v),ge=0,Te=Math.abs(ae.x),ce=Math.abs(ae.y);if(ce>Te)Te=ce,ge=1;if(Math.abs(ae.z)>Te)ge=2;let Ie=$S[ge],xe=this.a[Ie],Ue=this.b[Ie],Ce=this.c[Ie],rt=O.a[Ie],tt=O.b[Ie],Be=O.c[Ie];if(P(this,xe,Ue,Ce,ee,X,W,V,Y,E,S))return T(this,O,F,k);if(P(O,rt,tt,Be,ve,J,ie,le,te,A,M))return T(this,O,F,k);if(E.y<E.x){let Ke=E.y;E.y=E.x,E.x=Ke,w.copy(S.start),S.start.copy(S.end),S.end.copy(w)}if(A.y<A.x){let Ke=A.y;A.y=A.x,A.x=Ke,w.copy(M.start),M.start.copy(M.end),M.end.copy(w)}if(E.y<A.x||A.y<E.x)return!1;if(F){if(A.x>E.x)F.start.copy(M.start);else F.start.copy(S.start);if(A.y<E.y)F.end.copy(M.end);else F.end.copy(S.end)}return!0}}();Tn.prototype.distanceToPoint=function(){let m=new Z;return function(_){return this.closestPointToPoint(_,m),_.distanceTo(m)}}();Tn.prototype.distanceToTriangle=function(){let m=new Z,g=new Z,_=["a","b","c"],x=new Un,y=new Un;return function(b,S=null,M=null){let w=S||M?x:null;if(this.intersectsTriangle(b,w,!0)){if(S||M){if(S)w.getCenter(S);if(M)w.getCenter(M)}return 0}let E=1/0;for(let A=0;A<3;A++){let T,R=_[A],P=b[R];if(this.closestPointToPoint(P,m),T=P.distanceToSquared(m),T<E){if(E=T,S)S.copy(m);if(M)M.copy(P)}let N=this[R];if(b.closestPointToPoint(N,m),T=N.distanceToSquared(m),T<E){if(E=T,S)S.copy(N);if(M)M.copy(m)}}for(let A=0;A<3;A++){let T=_[A],R=_[(A+1)%3];x.set(this[T],this[R]);for(let P=0;P<3;P++){let N=_[P],C=_[(P+1)%3];y.set(b[N],b[C]),wo(x,y,m,g);let I=m.distanceToSquared(g);if(I<E){if(E=I,S)S.copy(m);if(M)M.copy(g)}}}return Math.sqrt(E)}}();class Yt{constructor(m,g,_){if(this.isOrientedBox=!0,this.min=new Z,this.max=new Z,this.matrix=new Qe,this.invMatrix=new Qe,this.points=[,,,,,,,,].fill().map(()=>new Z),this.satAxes=[,,,].fill().map(()=>new Z),this.satBounds=[,,,].fill().map(()=>new zn),this.alignedSatBounds=[,,,].fill().map(()=>new zn),this.needsUpdate=!1,m)this.min.copy(m);if(g)this.max.copy(g);if(_)this.matrix.copy(_)}set(m,g,_){this.min.copy(m),this.max.copy(g),this.matrix.copy(_),this.needsUpdate=!0}copy(m){this.min.copy(m.min),this.max.copy(m.max),this.matrix.copy(m.matrix),this.needsUpdate=!0}}Yt.prototype.update=function(){return function(){let g=this.matrix,_=this.min,x=this.max,y=this.points;for(let w=0;w<=1;w++)for(let E=0;E<=1;E++)for(let A=0;A<=1;A++){let T=1*w|2*E|4*A,R=y[T];R.x=w?x.x:_.x,R.y=E?x.y:_.y,R.z=A?x.z:_.z,R.applyMatrix4(g)}let v=this.satBounds,b=this.satAxes,S=y[0];for(let w=0;w<3;w++){let E=b[w],A=v[w],T=1<<w,R=y[T];E.subVectors(S,R),A.setFromPoints(E,y)}let M=this.alignedSatBounds;M[0].setFromPointsField(y,"x"),M[1].setFromPointsField(y,"y"),M[2].setFromPointsField(y,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();Yt.prototype.intersectsBox=function(){let m=new zn;return function(_){if(this.needsUpdate)this.update();let{min:x,max:y}=_,v=this.satBounds,b=this.satAxes,S=this.alignedSatBounds;if(m.min=x.x,m.max=y.x,S[0].isSeparated(m))return!1;if(m.min=x.y,m.max=y.y,S[1].isSeparated(m))return!1;if(m.min=x.z,m.max=y.z,S[2].isSeparated(m))return!1;for(let M=0;M<3;M++){let w=b[M],E=v[M];if(m.setFromBox(w,_),E.isSeparated(m))return!1}return!0}}();Yt.prototype.intersectsTriangle=function(){let m=new Tn,g=[,,,],_=new zn,x=new zn,y=new Z;return function(b){if(this.needsUpdate)this.update();if(!b.isExtendedTriangle)m.copy(b),m.update(),b=m;else if(b.needsUpdate)b.update();let S=this.satBounds,M=this.satAxes;g[0]=b.a,g[1]=b.b,g[2]=b.c;for(let T=0;T<3;T++){let R=S[T],P=M[T];if(_.setFromPoints(P,g),R.isSeparated(_))return!1}let w=b.satBounds,E=b.satAxes,A=this.points;for(let T=0;T<3;T++){let R=w[T],P=E[T];if(_.setFromPoints(P,A),R.isSeparated(_))return!1}for(let T=0;T<3;T++){let R=M[T];for(let P=0;P<4;P++){let N=E[P];if(y.crossVectors(R,N),_.setFromPoints(y,g),x.setFromPoints(y,A),_.isSeparated(x))return!1}}return!0}}();Yt.prototype.closestPointToPoint=function(){return function(g,_){if(this.needsUpdate)this.update();return _.copy(g).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),_}}();Yt.prototype.distanceToPoint=function(){let m=new Z;return function(_){return this.closestPointToPoint(_,m),_.distanceTo(m)}}();Yt.prototype.distanceToBox=function(){let m=["x","y","z"],g=Array(12).fill().map(()=>new Un),_=Array(12).fill().map(()=>new Un),x=new Z,y=new Z;return function(b,S=0,M=null,w=null){if(this.needsUpdate)this.update();if(this.intersectsBox(b)){if(M||w){if(b.getCenter(y),this.closestPointToPoint(y,x),b.closestPointToPoint(x,y),M)M.copy(x);if(w)w.copy(y)}return 0}let E=S*S,{min:A,max:T}=b,R=this.points,P=1/0;for(let C=0;C<8;C++){let I=R[C];y.copy(I).clamp(A,T);let L=I.distanceToSquared(y);if(L<P){if(P=L,M)M.copy(I);if(w)w.copy(y);if(L<E)return Math.sqrt(L)}}let N=0;for(let C=0;C<3;C++)for(let I=0;I<=1;I++)for(let L=0;L<=1;L++){let U=(C+1)%3,O=(C+2)%3,F=I<<U|L<<O,k=1<<C|I<<U|L<<O,D=R[F],B=R[k];g[N].set(D,B);let W=m[C],V=m[U],Y=m[O],ee=_[N],{start:X,end:ie}=ee;X[W]=A[W],X[V]=I?A[V]:T[V],X[Y]=L?A[Y]:T[Y],ie[W]=T[W],ie[V]=I?A[V]:T[V],ie[Y]=L?A[Y]:T[Y],N++}for(let C=0;C<=1;C++)for(let I=0;I<=1;I++)for(let L=0;L<=1;L++){y.x=C?T.x:A.x,y.y=I?T.y:A.y,y.z=L?T.z:A.z,this.closestPointToPoint(y,x);let U=y.distanceToSquared(x);if(U<P){if(P=U,M)M.copy(x);if(w)w.copy(y);if(U<E)return Math.sqrt(U)}}for(let C=0;C<12;C++){let I=g[C];for(let L=0;L<12;L++){let U=_[L];wo(I,U,x,y);let O=x.distanceToSquared(y);if(O<P){if(P=O,M)M.copy(x);if(w)w.copy(y);if(O<E)return Math.sqrt(O)}}}return Math.sqrt(P)}}();class jm extends Is{constructor(){super(()=>new Tn)}}var Nn=new jm;var Eo=new Z,Mh=new Z;function Qm(m,g,_={},x=0,y=1/0){let v=x*x,b=y*y,S=1/0,M=null;if(m.shapecast({boundsTraverseOrder:(E)=>(Eo.copy(g).clamp(E.min,E.max),Eo.distanceToSquared(g)),intersectsBounds:(E,A,T)=>T<S&&T<b,intersectsTriangle:(E,A)=>{E.closestPointToPoint(g,Eo);let T=g.distanceToSquared(Eo);if(T<S)Mh.copy(Eo),S=T,M=A;if(T<v)return!0;else return!1}}),S===1/0)return null;let w=Math.sqrt(S);if(!_.point)_.point=Mh.clone();else _.point.copy(Mh);return _.distance=w,_.faceIndex=M,_}var ul=parseInt(xs)>=169,ZS=parseInt(xs)<=161,Ls=new Z,Ns=new Z,Ds=new Z,hl=new $e,dl=new $e,fl=new $e,eg=new Z,tg=new Z,ng=new Z,To=new Z;function JS(m,g,_,x,y,v,b,S){let M;if(v===Mn)M=m.intersectTriangle(x,_,g,!0,y);else M=m.intersectTriangle(g,_,x,v!==In,y);if(M===null)return null;let w=m.origin.distanceTo(y);if(w<b||w>S)return null;return{distance:w,point:y.clone()}}function ig(m,g,_,x,y,v,b,S,M,w,E){Ls.fromBufferAttribute(g,v),Ns.fromBufferAttribute(g,b),Ds.fromBufferAttribute(g,S);let A=JS(m,Ls,Ns,Ds,To,M,w,E);if(A){if(x){hl.fromBufferAttribute(x,v),dl.fromBufferAttribute(x,b),fl.fromBufferAttribute(x,S),A.uv=new $e;let R=jt.getInterpolation(To,Ls,Ns,Ds,hl,dl,fl,A.uv);if(!ul)A.uv=R}if(y){hl.fromBufferAttribute(y,v),dl.fromBufferAttribute(y,b),fl.fromBufferAttribute(y,S),A.uv1=new $e;let R=jt.getInterpolation(To,Ls,Ns,Ds,hl,dl,fl,A.uv1);if(!ul)A.uv1=R;if(ZS)A.uv2=A.uv1}if(_){eg.fromBufferAttribute(_,v),tg.fromBufferAttribute(_,b),ng.fromBufferAttribute(_,S),A.normal=new Z;let R=jt.getInterpolation(To,Ls,Ns,Ds,eg,tg,ng,A.normal);if(A.normal.dot(m.direction)>0)A.normal.multiplyScalar(-1);if(!ul)A.normal=R}let T={a:v,b,c:S,normal:new Z,materialIndex:0};if(jt.getNormal(Ls,Ns,Ds,T.normal),A.face=T,A.faceIndex=v,ul){let R=new Z;jt.getBarycoord(To,Ls,Ns,Ds,R),A.barycoord=R}}return A}function sg(m){return m&&m.isMaterial?m.side:m}function Mr(m,g,_,x,y,v,b){let S=x*3,M=S+0,w=S+1,E=S+2,{index:A,groups:T}=m;if(m.index)M=A.getX(M),w=A.getX(w),E=A.getX(E);let{position:R,normal:P,uv:N,uv1:C}=m.attributes;if(Array.isArray(g)){let I=x*3;for(let L=0,U=T.length;L<U;L++){let{start:O,count:F,materialIndex:k}=T[L];if(I>=O&&I<O+F){let D=sg(g[k]),B=ig(_,R,P,N,C,M,w,E,D,v,b);if(B)if(B.faceIndex=x,B.face.materialIndex=k,y)y.push(B);else return B}}}else{let I=sg(g),L=ig(_,R,P,N,C,M,w,E,I,v,b);if(L)if(L.faceIndex=x,L.face.materialIndex=0,y)y.push(L);else return L}return null}function Ot(m,g,_,x){let{a:y,b:v,c:b}=m,S=g,M=g+1,w=g+2;if(_)S=_.getX(S),M=_.getX(M),w=_.getX(w);y.x=x.getX(S),y.y=x.getY(S),y.z=x.getZ(S),v.x=x.getX(M),v.y=x.getY(M),v.z=x.getZ(M),b.x=x.getX(w),b.y=x.getY(w),b.z=x.getZ(w)}function rg(m,g,_,x,y,v,b,S){let{geometry:M,_indirectBuffer:w}=m;for(let E=x,A=x+y;E<A;E++)Mr(M,g,_,E,v,b,S)}function og(m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=m,w=1/0,E=null;for(let A=x,T=x+y;A<T;A++){let R;if(R=Mr(S,g,_,A,null,v,b),R&&R.distance<w)E=R,w=R.distance}return E}function ag(m,g,_,x,y,v,b){let{geometry:S}=_,{index:M}=S,w=S.attributes.position;for(let E=m,A=g+m;E<A;E++){let T;if(T=E,Ot(b,T*3,M,w),b.needsUpdate=!0,x(b,T,y,v))return!0}return!1}function lg(m,g=null){if(g&&Array.isArray(g))g=new Set(g);let _=m.geometry,x=_.index?_.index.array:null,y=_.attributes.position,v,b,S,M,w=0,E=m._roots;for(let T=0,R=E.length;T<R;T++)v=E[T],b=new Uint32Array(v),S=new Uint16Array(v),M=new Float32Array(v),A(0,w),w+=v.byteLength;function A(T,R,P=!1){let N=T*2;if(gt(N,S)){let C=Et(T,b),I=It(N,S),L=1/0,U=1/0,O=1/0,F=-1/0,k=-1/0,D=-1/0;for(let B=3*C,z=3*(C+I);B<z;B++){let W=x[B],V=y.getX(W),Y=y.getY(W),ee=y.getZ(W);if(V<L)L=V;if(V>F)F=V;if(Y<U)U=Y;if(Y>k)k=Y;if(ee<O)O=ee;if(ee>D)D=ee}if(M[T+0]!==L||M[T+1]!==U||M[T+2]!==O||M[T+3]!==F||M[T+4]!==k||M[T+5]!==D)return M[T+0]=L,M[T+1]=U,M[T+2]=O,M[T+3]=F,M[T+4]=k,M[T+5]=D,!0;else return!1}else{let C=Mt(T),I=wt(T,b),L=P,U=!1,O=!1;if(g){if(!L){let W=C/Pt+R/dn,V=I/Pt+R/dn;U=g.has(W),O=g.has(V),L=!U&&!O}}else U=!0,O=!0;let F=L||U,k=L||O,D=!1;if(F)D=A(C,R,L);let B=!1;if(k)B=A(I,R,L);let z=D||B;if(z)for(let W=0;W<3;W++){let V=C+W,Y=I+W,ee=M[V],X=M[V+3],ie=M[Y],le=M[Y+3];M[T+W]=ee<ie?ee:ie,M[T+W+3]=X>le?X:le}return z}}}function An(m,g,_,x,y){let v,b,S,M,w,E,A=1/_.direction.x,T=1/_.direction.y,R=1/_.direction.z,P=_.origin.x,N=_.origin.y,C=_.origin.z,I=g[m],L=g[m+3],U=g[m+1],O=g[m+3+1],F=g[m+2],k=g[m+3+2];if(A>=0)v=(I-P)*A,b=(L-P)*A;else v=(L-P)*A,b=(I-P)*A;if(T>=0)S=(U-N)*T,M=(O-N)*T;else S=(O-N)*T,M=(U-N)*T;if(v>M||S>b)return!1;if(S>v||isNaN(v))v=S;if(M<b||isNaN(b))b=M;if(R>=0)w=(F-C)*R,E=(k-C)*R;else w=(k-C)*R,E=(F-C)*R;if(v>E||w>b)return!1;if(w>v||v!==v)v=w;if(E<b||b!==b)b=E;return v<=y&&b>=x}function cg(m,g,_,x,y,v,b,S){let{geometry:M,_indirectBuffer:w}=m;for(let E=x,A=x+y;E<A;E++){let T=w?w[E]:E;Mr(M,g,_,T,v,b,S)}}function ug(m,g,_,x,y,v,b){let{geometry:S,_indirectBuffer:M}=m,w=1/0,E=null;for(let A=x,T=x+y;A<T;A++){let R;if(R=Mr(S,g,_,M?M[A]:A,null,v,b),R&&R.distance<w)E=R,w=R.distance}return E}function hg(m,g,_,x,y,v,b){let{geometry:S}=_,{index:M}=S,w=S.attributes.position;for(let E=m,A=g+m;E<A;E++){let T;if(T=_.resolveTriangleIndex(E),Ot(b,T*3,M,w),b.needsUpdate=!0,x(b,T,y,v))return!0}return!1}function dg(m,g,_,x,y,v,b){if(ht.setBuffer(m._roots[g]),An(0,ht.float32Array,x,v,b))wh(0,m,_,x,y,v,b);ht.clearBuffer()}function wh(m,g,_,x,y,v,b){let{float32Array:S,uint16Array:M,uint32Array:w}=ht,E=m*2;if(gt(E,M)){let T=Et(m,w),R=It(E,M);rg(g,_,x,T,R,y,v,b)}else{let T=Mt(m);if(An(T,S,x,v,b))wh(T,g,_,x,y,v,b);let R=wt(m,w);if(An(R,S,x,v,b))wh(R,g,_,x,y,v,b)}}var KS=["x","y","z"];function fg(m,g,_,x,y,v){ht.setBuffer(m._roots[g]);let b=null;if(An(0,ht.float32Array,x,y,v))b=Eh(0,m,_,x,y,v);return ht.clearBuffer(),b}function Eh(m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=ht,w=m*2;if(gt(w,S)){let A=Et(m,M),T=It(w,S);return og(g,_,x,A,T,y,v)}else{let A=mr(m,M),T=KS[A],P=x.direction[T]>=0,N,C;if(P)N=Mt(m),C=wt(m,M);else N=wt(m,M),C=Mt(m);let L=An(N,b,x,y,v)?Eh(N,g,_,x,y,v):null;if(L){let F=L.point[T];if(P?F<=b[C+A]:F>=b[C+A+3])return L}let O=An(C,b,x,y,v)?Eh(C,g,_,x,y,v):null;if(L&&O)return L.distance<=O.distance?L:O;else return L||O||null}}var pl=new yt,wr=new Tn,Er=new Tn,Ao=new Qe,pg=new Yt,ml=new Yt;function mg(m,g,_,x){ht.setBuffer(m._roots[g]);let y=Th(0,m,_,x);return ht.clearBuffer(),y}function Th(m,g,_,x,y=null){let{float32Array:v,uint16Array:b,uint32Array:S}=ht,M=m*2;if(y===null){if(!_.boundingBox)_.computeBoundingBox();pg.set(_.boundingBox.min,_.boundingBox.max,x),y=pg}if(gt(M,b)){let E=g.geometry,A=E.index,T=E.attributes.position,R=_.index,P=_.attributes.position,N=Et(m,S),C=It(M,b);if(Ao.copy(x).invert(),_.boundsTree)return Dt(Bt(m),v,ml),ml.matrix.copy(Ao),ml.needsUpdate=!0,_.boundsTree.shapecast({intersectsBounds:(L)=>ml.intersectsBox(L),intersectsTriangle:(L)=>{L.a.applyMatrix4(x),L.b.applyMatrix4(x),L.c.applyMatrix4(x),L.needsUpdate=!0;for(let U=N*3,O=(C+N)*3;U<O;U+=3)if(Ot(Er,U,A,T),Er.needsUpdate=!0,L.intersectsTriangle(Er))return!0;return!1}});else{let I=os(_);for(let L=N*3,U=(C+N)*3;L<U;L+=3){Ot(wr,L,A,T),wr.a.applyMatrix4(Ao),wr.b.applyMatrix4(Ao),wr.c.applyMatrix4(Ao),wr.needsUpdate=!0;for(let O=0,F=I*3;O<F;O+=3)if(Ot(Er,O,R,P),Er.needsUpdate=!0,wr.intersectsTriangle(Er))return!0}}}else{let E=Mt(m),A=wt(m,S);if(Dt(Bt(E),v,pl),y.intersectsBox(pl)&&Th(E,g,_,x,y))return!0;if(Dt(Bt(A),v,pl),y.intersectsBox(pl)&&Th(A,g,_,x,y))return!0;return!1}}var gl=new Qe,Ah=new Yt,Ro=new Yt,jS=new Z,QS=new Z,eM=new Z,tM=new Z;function gg(m,g,_,x={},y={},v=0,b=1/0){if(!g.boundingBox)g.computeBoundingBox();Ah.set(g.boundingBox.min,g.boundingBox.max,_),Ah.needsUpdate=!0;let S=m.geometry,M=S.attributes.position,w=S.index,E=g.attributes.position,A=g.index,T=Nn.getPrimitive(),R=Nn.getPrimitive(),P=jS,N=QS,C=null,I=null;if(y)C=eM,I=tM;let L=1/0,U=null,O=null;if(gl.copy(_).invert(),Ro.matrix.copy(gl),m.shapecast({boundsTraverseOrder:(F)=>Ah.distanceToBox(F),intersectsBounds:(F,k,D)=>{if(D<L&&D<b){if(k)Ro.min.copy(F.min),Ro.max.copy(F.max),Ro.needsUpdate=!0;return!0}return!1},intersectsRange:(F,k)=>{if(g.boundsTree)return g.boundsTree.shapecast({boundsTraverseOrder:(B)=>Ro.distanceToBox(B),intersectsBounds:(B,z,W)=>W<L&&W<b,intersectsRange:(B,z)=>{for(let W=B,V=B+z;W<V;W++){Ot(R,3*W,A,E),R.a.applyMatrix4(_),R.b.applyMatrix4(_),R.c.applyMatrix4(_),R.needsUpdate=!0;for(let Y=F,ee=F+k;Y<ee;Y++){Ot(T,3*Y,w,M),T.needsUpdate=!0;let X=T.distanceToTriangle(R,P,C);if(X<L){if(N.copy(P),I)I.copy(C);L=X,U=Y,O=W}if(X<v)return!0}}}});else{let D=os(g);for(let B=0,z=D;B<z;B++){Ot(R,3*B,A,E),R.a.applyMatrix4(_),R.b.applyMatrix4(_),R.c.applyMatrix4(_),R.needsUpdate=!0;for(let W=F,V=F+k;W<V;W++){Ot(T,3*W,w,M),T.needsUpdate=!0;let Y=T.distanceToTriangle(R,P,C);if(Y<L){if(N.copy(P),I)I.copy(C);L=Y,U=W,O=B}if(Y<v)return!0}}}}}),Nn.releasePrimitive(T),Nn.releasePrimitive(R),L===1/0)return null;if(!x.point)x.point=N.clone();else x.point.copy(N);if(x.distance=L,x.faceIndex=U,y){if(!y.point)y.point=I.clone();else y.point.copy(I);y.point.applyMatrix4(gl),N.applyMatrix4(gl),y.distance=N.sub(y.point).length(),y.faceIndex=O}return x}function _g(m,g=null){if(g&&Array.isArray(g))g=new Set(g);let _=m.geometry,x=_.index?_.index.array:null,y=_.attributes.position,v,b,S,M,w=0,E=m._roots;for(let T=0,R=E.length;T<R;T++)v=E[T],b=new Uint32Array(v),S=new Uint16Array(v),M=new Float32Array(v),A(0,w),w+=v.byteLength;function A(T,R,P=!1){let N=T*2;if(gt(N,S)){let C=Et(T,b),I=It(N,S),L=1/0,U=1/0,O=1/0,F=-1/0,k=-1/0,D=-1/0;for(let B=C,z=C+I;B<z;B++){let W=3*m.resolveTriangleIndex(B);for(let V=0;V<3;V++){let Y=W+V;Y=x?x[Y]:Y;let ee=y.getX(Y),X=y.getY(Y),ie=y.getZ(Y);if(ee<L)L=ee;if(ee>F)F=ee;if(X<U)U=X;if(X>k)k=X;if(ie<O)O=ie;if(ie>D)D=ie}}if(M[T+0]!==L||M[T+1]!==U||M[T+2]!==O||M[T+3]!==F||M[T+4]!==k||M[T+5]!==D)return M[T+0]=L,M[T+1]=U,M[T+2]=O,M[T+3]=F,M[T+4]=k,M[T+5]=D,!0;else return!1}else{let C=Mt(T),I=wt(T,b),L=P,U=!1,O=!1;if(g){if(!L){let W=C/Pt+R/dn,V=I/Pt+R/dn;U=g.has(W),O=g.has(V),L=!U&&!O}}else U=!0,O=!0;let F=L||U,k=L||O,D=!1;if(F)D=A(C,R,L);let B=!1;if(k)B=A(I,R,L);let z=D||B;if(z)for(let W=0;W<3;W++){let V=C+W,Y=I+W,ee=M[V],X=M[V+3],ie=M[Y],le=M[Y+3];M[T+W]=ee<ie?ee:ie,M[T+W+3]=X>le?X:le}return z}}}function xg(m,g,_,x,y,v,b){if(ht.setBuffer(m._roots[g]),An(0,ht.float32Array,x,v,b))Rh(0,m,_,x,y,v,b);ht.clearBuffer()}function Rh(m,g,_,x,y,v,b){let{float32Array:S,uint16Array:M,uint32Array:w}=ht,E=m*2;if(gt(E,M)){let T=Et(m,w),R=It(E,M);cg(g,_,x,T,R,y,v,b)}else{let T=Mt(m);if(An(T,S,x,v,b))Rh(T,g,_,x,y,v,b);let R=wt(m,w);if(An(R,S,x,v,b))Rh(R,g,_,x,y,v,b)}}var nM=["x","y","z"];function yg(m,g,_,x,y,v){ht.setBuffer(m._roots[g]);let b=null;if(An(0,ht.float32Array,x,y,v))b=Ch(0,m,_,x,y,v);return ht.clearBuffer(),b}function Ch(m,g,_,x,y,v){let{float32Array:b,uint16Array:S,uint32Array:M}=ht,w=m*2;if(gt(w,S)){let A=Et(m,M),T=It(w,S);return ug(g,_,x,A,T,y,v)}else{let A=mr(m,M),T=nM[A],P=x.direction[T]>=0,N,C;if(P)N=Mt(m),C=wt(m,M);else N=wt(m,M),C=Mt(m);let L=An(N,b,x,y,v)?Ch(N,g,_,x,y,v):null;if(L){let F=L.point[T];if(P?F<=b[C+A]:F>=b[C+A+3])return L}let O=An(C,b,x,y,v)?Ch(C,g,_,x,y,v):null;if(L&&O)return L.distance<=O.distance?L:O;else return L||O||null}}var _l=new yt,Tr=new Tn,Ar=new Tn,Co=new Qe,vg=new Yt,xl=new Yt;function bg(m,g,_,x){ht.setBuffer(m._roots[g]);let y=Ph(0,m,_,x);return ht.clearBuffer(),y}function Ph(m,g,_,x,y=null){let{float32Array:v,uint16Array:b,uint32Array:S}=ht,M=m*2;if(y===null){if(!_.boundingBox)_.computeBoundingBox();vg.set(_.boundingBox.min,_.boundingBox.max,x),y=vg}if(gt(M,b)){let E=g.geometry,A=E.index,T=E.attributes.position,R=_.index,P=_.attributes.position,N=Et(m,S),C=It(M,b);if(Co.copy(x).invert(),_.boundsTree)return Dt(Bt(m),v,xl),xl.matrix.copy(Co),xl.needsUpdate=!0,_.boundsTree.shapecast({intersectsBounds:(L)=>xl.intersectsBox(L),intersectsTriangle:(L)=>{L.a.applyMatrix4(x),L.b.applyMatrix4(x),L.c.applyMatrix4(x),L.needsUpdate=!0;for(let U=N,O=C+N;U<O;U++)if(Ot(Ar,3*g.resolveTriangleIndex(U),A,T),Ar.needsUpdate=!0,L.intersectsTriangle(Ar))return!0;return!1}});else{let I=os(_);for(let L=N,U=C+N;L<U;L++){let O=g.resolveTriangleIndex(L);Ot(Tr,3*O,A,T),Tr.a.applyMatrix4(Co),Tr.b.applyMatrix4(Co),Tr.c.applyMatrix4(Co),Tr.needsUpdate=!0;for(let F=0,k=I*3;F<k;F+=3)if(Ot(Ar,F,R,P),Ar.needsUpdate=!0,Tr.intersectsTriangle(Ar))return!0}}}else{let E=Mt(m),A=wt(m,S);if(Dt(Bt(E),v,_l),y.intersectsBox(_l)&&Ph(E,g,_,x,y))return!0;if(Dt(Bt(A),v,_l),y.intersectsBox(_l)&&Ph(A,g,_,x,y))return!0;return!1}}var yl=new Qe,Ih=new Yt,Po=new Yt,iM=new Z,sM=new Z,rM=new Z,oM=new Z;function Sg(m,g,_,x={},y={},v=0,b=1/0){if(!g.boundingBox)g.computeBoundingBox();Ih.set(g.boundingBox.min,g.boundingBox.max,_),Ih.needsUpdate=!0;let S=m.geometry,M=S.attributes.position,w=S.index,E=g.attributes.position,A=g.index,T=Nn.getPrimitive(),R=Nn.getPrimitive(),P=iM,N=sM,C=null,I=null;if(y)C=rM,I=oM;let L=1/0,U=null,O=null;if(yl.copy(_).invert(),Po.matrix.copy(yl),m.shapecast({boundsTraverseOrder:(F)=>Ih.distanceToBox(F),intersectsBounds:(F,k,D)=>{if(D<L&&D<b){if(k)Po.min.copy(F.min),Po.max.copy(F.max),Po.needsUpdate=!0;return!0}return!1},intersectsRange:(F,k)=>{if(g.boundsTree){let D=g.boundsTree;return D.shapecast({boundsTraverseOrder:(B)=>Po.distanceToBox(B),intersectsBounds:(B,z,W)=>W<L&&W<b,intersectsRange:(B,z)=>{for(let W=B,V=B+z;W<V;W++){let Y=D.resolveTriangleIndex(W);Ot(R,3*Y,A,E),R.a.applyMatrix4(_),R.b.applyMatrix4(_),R.c.applyMatrix4(_),R.needsUpdate=!0;for(let ee=F,X=F+k;ee<X;ee++){let ie=m.resolveTriangleIndex(ee);Ot(T,3*ie,w,M),T.needsUpdate=!0;let le=T.distanceToTriangle(R,P,C);if(le<L){if(N.copy(P),I)I.copy(C);L=le,U=ee,O=W}if(le<v)return!0}}}})}else{let D=os(g);for(let B=0,z=D;B<z;B++){Ot(R,3*B,A,E),R.a.applyMatrix4(_),R.b.applyMatrix4(_),R.c.applyMatrix4(_),R.needsUpdate=!0;for(let W=F,V=F+k;W<V;W++){let Y=m.resolveTriangleIndex(W);Ot(T,3*Y,w,M),T.needsUpdate=!0;let ee=T.distanceToTriangle(R,P,C);if(ee<L){if(N.copy(P),I)I.copy(C);L=ee,U=W,O=B}if(ee<v)return!0}}}}}),Nn.releasePrimitive(T),Nn.releasePrimitive(R),L===1/0)return null;if(!x.point)x.point=N.clone();else x.point.copy(N);if(x.distance=L,x.faceIndex=U,y){if(!y.point)y.point=I.clone();else y.point.copy(I);y.point.applyMatrix4(yl),N.applyMatrix4(yl),y.distance=N.sub(y.point).length(),y.faceIndex=O}return x}function Lh(m,g,_){if(m===null)return null;return m.point.applyMatrix4(g.matrixWorld),m.distance=m.point.distanceTo(_.ray.origin),m.object=g,m}var vl=new Yt,bl=new Qi,Mg=new Z,wg=new Qe,Eg=new Z,Nh=["getX","getY","getZ"];class Rr extends Sh{static serialize(m,g={}){g={cloneBuffers:!0,...g};let{geometry:_,_roots:x,_indirectBuffer:y}=m,v=_.getIndex(),b={version:1,roots:null,index:null,indirectBuffer:null};if(g.cloneBuffers)b.roots=x.map((S)=>S.slice()),b.index=v?v.array.slice():null,b.indirectBuffer=y?y.slice():null;else b.roots=x,b.index=v?v.array:null,b.indirectBuffer=y;return b}static deserialize(m,g,_={}){_={setIndex:!0,indirect:Boolean(m.indirectBuffer),..._};let{index:x,roots:y,indirectBuffer:v}=m;if(!m.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),S(y);let b=new Rr(g,{..._,[bo]:!0});if(b._roots=y,b._indirectBuffer=v||null,_.setIndex){let M=g.getIndex();if(M===null){let w=new Qt(m.index,1,!1);g.setIndex(w)}else if(M.array!==x)M.array.set(x),M.needsUpdate=!0}return b;function S(M){for(let w=0;w<M.length;w++){let E=M[w],A=new Uint32Array(E),T=new Uint16Array(E);for(let R=0,P=E.byteLength/dn;R<P;R++){let N=Pt*R,C=2*N;if(!gt(C,T))A[N+6]=A[N+6]/Pt-R}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(m,g={}){if(g.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),g={...g,targetLeafSize:g.maxLeafTris};super(m,g)}shiftTriangleOffsets(m){return super.shiftPrimitiveOffsets(m)}writePrimitiveBounds(m,g,_){let x=this.geometry,y=this._indirectBuffer,v=x.attributes.position,b=x.index?x.index.array:null,M=(y?y[m]:m)*3,w=M+0,E=M+1,A=M+2;if(b)w=b[w],E=b[E],A=b[A];for(let T=0;T<3;T++){let R=v[Nh[T]](w),P=v[Nh[T]](E),N=v[Nh[T]](A),C=R;if(P<C)C=P;if(N<C)C=N;let I=R;if(P>I)I=P;if(N>I)I=N;g[_+T]=C,g[_+T+3]=I}return g}computePrimitiveBounds(m,g,_){let x=this.geometry,y=this._indirectBuffer,v=x.attributes.position,b=x.index?x.index.array:null,S=v.normalized;if(m<0||g+m-_.offset>_.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let M=v.array,w=v.offset||0,E=3;if(v.isInterleavedBufferAttribute)E=v.data.stride;let A=["getX","getY","getZ"],T=_.offset;for(let R=m,P=m+g;R<P;R++){let C=(y?y[R]:R)*3,I=(R-T)*6,L=C+0,U=C+1,O=C+2;if(b)L=b[L],U=b[U],O=b[O];if(!S)L=L*E+w,U=U*E+w,O=O*E+w;for(let F=0;F<3;F++){let k,D,B;if(S)k=v[A[F]](L),D=v[A[F]](U),B=v[A[F]](O);else k=M[L+F],D=M[U+F],B=M[O+F];let z=k;if(D<z)z=D;if(B<z)z=B;let W=k;if(D>W)W=D;if(B>W)W=B;let V=(W-z)/2,Y=F*2;_[I+Y+0]=z+V,_[I+Y+1]=V+(Math.abs(z)+V)*pr}}return _}raycastObject3D(m,g,_=[]){let{material:x}=m;if(x===void 0)return;wg.copy(m.matrixWorld).invert(),bl.copy(g.ray).applyMatrix4(wg),Eg.setFromMatrixScale(m.matrixWorld),Mg.copy(bl.direction).multiply(Eg);let y=Mg.length(),v=g.near/y,b=g.far/y;if(g.firstHitOnly===!0){let S=this.raycastFirst(bl,x,v,b);if(S=Lh(S,m,g),S)_.push(S)}else{let S=this.raycast(bl,x,v,b);for(let M=0,w=S.length;M<w;M++){let E=Lh(S[M],m,g);if(E)_.push(E)}}return _}refit(m=null){return(this.indirect?_g:lg)(this,m)}raycast(m,g=Ri,_=0,x=1/0){let y=this._roots,v=[],b=this.indirect?xg:dg;for(let S=0,M=y.length;S<M;S++)b(this,S,g,m,v,_,x);return v}raycastFirst(m,g=Ri,_=0,x=1/0){let y=this._roots,v=null,b=this.indirect?yg:fg;for(let S=0,M=y.length;S<M;S++){let w=b(this,S,g,m,_,x);if(w!=null&&(v==null||w.distance<v.distance))v=w}return v}intersectsGeometry(m,g){let _=!1,x=this._roots,y=this.indirect?bg:mg;for(let v=0,b=x.length;v<b;v++)if(_=y(this,v,m,g),_)break;return _}shapecast(m){let g=Nn.getPrimitive(),_=super.shapecast({...m,intersectsPrimitive:m.intersectsTriangle,scratchPrimitive:g,iterate:this.indirect?hg:ag});return Nn.releasePrimitive(g),_}bvhcast(m,g,_){let{intersectsRanges:x,intersectsTriangles:y}=_,v=Nn.getPrimitive(),b=this.geometry.index,S=this.geometry.attributes.position,M=this.indirect?(R)=>{let P=this.resolveTriangleIndex(R);Ot(v,P*3,b,S)}:(R)=>{Ot(v,R*3,b,S)},w=Nn.getPrimitive(),E=m.geometry.index,A=m.geometry.attributes.position,T=m.indirect?(R)=>{let P=m.resolveTriangleIndex(R);Ot(w,P*3,E,A)}:(R)=>{Ot(w,R*3,E,A)};if(y){if(!(m instanceof Rr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let R=(P,N,C,I,L,U,O,F)=>{for(let k=C,D=C+I;k<D;k++){T(k),w.a.applyMatrix4(g),w.b.applyMatrix4(g),w.c.applyMatrix4(g),w.needsUpdate=!0;for(let B=P,z=P+N;B<z;B++)if(M(B),v.needsUpdate=!0,y(v,w,B,k,L,U,O,F))return!0}return!1};if(x){let P=x;x=function(N,C,I,L,U,O,F,k){if(!P(N,C,I,L,U,O,F,k))return R(N,C,I,L,U,O,F,k);return!0}}else x=R}return super.bvhcast(m,g,{intersectsRanges:x})}intersectsBox(m,g){return vl.set(m.min,m.max,g),vl.needsUpdate=!0,this.shapecast({intersectsBounds:(_)=>vl.intersectsBox(_),intersectsTriangle:(_)=>vl.intersectsTriangle(_)})}intersectsSphere(m){return this.shapecast({intersectsBounds:(g)=>m.intersectsBox(g),intersectsTriangle:(g)=>g.intersectsSphere(m)})}closestPointToGeometry(m,g,_={},x={},y=0,v=1/0){return(this.indirect?Sg:gg)(this,m,g,_,x,y,v)}closestPointToPoint(m,g={},_=0,x=1/0){return Qm(this,m,g,_,x)}}var pL=parseInt(xs)>=166,Cr={Mesh:Xt.prototype.raycast,Line:Ms.prototype.raycast,LineSegments:Oi.prototype.raycast,LineLoop:ws.prototype.raycast,Points:Es.prototype.raycast,BatchedMesh:Ia.prototype.raycast},_n=new Xt,Sl=[];function Tg(m,g){if(this.isBatchedMesh)aM.call(this,m,g);else{let{geometry:_}=this;if(_.boundsTree)_.boundsTree.raycastObject3D(this,m,g);else{let x;if(this instanceof Xt)x=Cr.Mesh;else if(this instanceof Oi)x=Cr.LineSegments;else if(this instanceof ws)x=Cr.LineLoop;else if(this instanceof Ms)x=Cr.Line;else if(this instanceof Es)x=Cr.Points;else throw Error("BVH: Fallback raycast function not found.");x.call(this,m,g)}}}function aM(m,g){if(this.boundsTrees){let _=this.boundsTrees,x=this._drawInfo||this._instanceInfo,y=this._drawRanges||this._geometryInfo,v=this.matrixWorld;_n.material=this.material,_n.geometry=this.geometry;let b=_n.geometry.boundsTree,S=_n.geometry.drawRange;if(_n.geometry.boundingSphere===null)_n.geometry.boundingSphere=new Pn;for(let M=0,w=x.length;M<w;M++){if(!this.getVisibleAt(M))continue;let E=x[M].geometryIndex;if(_n.geometry.boundsTree=_[E],this.getMatrixAt(M,_n.matrixWorld).premultiply(v),!_n.geometry.boundsTree){this.getBoundingBoxAt(E,_n.geometry.boundingBox),this.getBoundingSphereAt(E,_n.geometry.boundingSphere);let A=y[E];_n.geometry.setDrawRange(A.start,A.count)}_n.raycast(m,Sl);for(let A=0,T=Sl.length;A<T;A++){let R=Sl[A];R.object=this,R.batchId=M,g.push(R)}Sl.length=0}_n.geometry.boundsTree=b,_n.geometry.drawRange=S,_n.material=null,_n.geometry=null}else Cr.BatchedMesh.call(this,m,g)}class Dh{groups;owners;byGroup=new Map;constructor(m,g,_){let x=Math.floor(g.length/3),y=Array.from({length:x},(w,E)=>E);this.owners=Array(x).fill(null);for(let w of _)for(let E=w.from;E<Math.min(x,w.end);E++)this.owners[E]=w.id;let v=new Map,b=new Int32Array(m.count);for(let w=0;w<m.count;w++){let E=`${m.getX(w)},${m.getY(w)},${m.getZ(w)}`,A=v.get(E);if(A===void 0)A=v.size,v.set(E,A);b[w]=A}let S=(w)=>{while(y[w]!==w)y[w]=y[y[w]],w=y[w];return w},M=new Map;for(let w=0;w<x;w++){let E=[b[g[w*3]],b[g[w*3+1]],b[g[w*3+2]]];for(let A=0;A<3;A++){let T=E[A],R=E[(A+1)%3];if(T===R)continue;let P=`${this.owners[w]??""}:${Math.min(T,R)}:${Math.max(T,R)}`,N=M.get(P);if(N===void 0)M.set(P,w);else y[S(w)]=S(N)}}this.groups=y.map((w,E)=>S(E)),this.groups.forEach((w,E)=>{if(!this.byGroup.has(w))this.byGroup.set(w,[]);this.byGroup.get(w).push(E)})}owner(m){return this.owners[m]??null}faces(m,g=!1){if(!g)return this.byGroup.get(this.groups[m])??[];let _=this.owner(m);return this.owners.flatMap((x,y)=>x===_?[y]:[])}facesOfOwner(m){return this.owners.flatMap((g,_)=>g===m?[_]:[])}}function Ag(m){if(!m)return[];if(m.splat)return[...new Set([m.splat.base.name,m.splat.mask.name,...m.splat.images.map((g)=>g.name)])];return[...new Set([m.texture,m.dual_layer?.base,m.dual_layer?.mask].filter((g)=>!!g))]}function Rg(m,g,_,x){let y=x.images.map((b,S)=>"rgb"[b.channel??S]),v=x.images.some((b)=>b.variation);m.onBeforeCompile=(b)=>{if(v)b.uniforms.m2lNoiseFrequency={value:1.6},b.vertexShader=b.vertexShader.replace("#include <common>",`#include <common>
varying vec2 m2lWorldXZ;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
m2lWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`);Object.assign(b.uniforms,{m2lKeep:{value:g},m2lOrigin:{value:new $e(...x.origin)}});for(let S=0;S<_.length;S++)b.uniforms[`m2lPhoto${S}`]={value:_[S]},b.uniforms[`m2lScale${S}`]={value:new $e(...x.images[S].scale)};b.fragmentShader=b.fragmentShader.replace("#include <map_pars_fragment>",`
      #include <map_pars_fragment>
      uniform sampler2D m2lKeep;
      uniform vec2 m2lOrigin;
      ${v?lM:""}
      ${_.map((S,M)=>`uniform sampler2D m2lPhoto${M}; uniform vec2 m2lScale${M};`).join(`
`)}
    `).replace("#include <map_fragment>",`
      #ifdef USE_MAP
        vec4 m2lWeights = texture2D(m2lKeep, vMapUv);
        vec3 m2lColour = texture2D(map, vMapUv).rgb * m2lWeights.a;
        ${_.map((S,M)=>`m2lColour += ${x.images[M].variation?"m2lVary":"texture2D"}(m2lPhoto${M}, (vMapUv + m2lOrigin) * m2lScale${M}).rgb * m2lWeights.${y[M]};`).join(`
`)}
        diffuseColor *= vec4(m2lColour, 1.0);
      #endif
    `)},m.customProgramCacheKey=()=>"map2lap-splat-3-"+y.map((b,S)=>b+Number(!!x.images[S].variation)).join(""),m.needsUpdate=!0}var lM=`
  varying vec2 m2lWorldXZ;
  uniform float m2lNoiseFrequency;
  float m2lHash(vec2 p) { return fract(sin(dot(p, vec2(0.317, 0.819))) * 43758.5453); }
  float m2lNoise(vec2 p) {
    vec2 cell = floor(p), f = fract(p);
    return mix(mix(m2lHash(cell), m2lHash(cell + vec2(1.0, 0.0)), f.x),
               mix(m2lHash(cell + vec2(0.0, 1.0)), m2lHash(cell + vec2(1.0)), f.x), f.y);
  }
  vec4 m2lVary(sampler2D photo, vec2 uv) {
    float l = m2lNoise(m2lWorldXZ * m2lNoiseFrequency) * 8.0;
    float i = floor(l), f = fract(l);
    vec2 dx = dFdx(uv), dy = dFdy(uv);
    vec4 a = textureGrad(photo, uv + sin(vec2(3.0, 7.0) * i), dx, dy);
    vec4 b = textureGrad(photo, uv + sin(vec2(3.0, 7.0) * (i + 1.0)), dx, dy);
    return mix(a, b, smoothstep(0.2, 0.8, f - 0.1 * dot(a - b, vec4(1.0))));
  }
`;function Cg(m,g,_,x){m.onBeforeCompile=(y)=>{Object.assign(y.uniforms,{m2lBase:{value:g},m2lKeep:{value:_},m2lScale:{value:x}}),y.fragmentShader=y.fragmentShader.replace("#include <map_pars_fragment>",`
      #include <map_pars_fragment>
      uniform sampler2D m2lBase;
      uniform sampler2D m2lKeep;
      uniform float m2lScale;
    `).replace("#include <map_fragment>",`
      #ifdef USE_MAP
        vec4 m2lDetail = texture2D(map, vMapUv * m2lScale);
        vec4 m2lOriginal = texture2D(m2lBase, vMapUv);
        float m2lWeight = texture2D(m2lKeep, vMapUv).r;
        diffuseColor *= vec4(mix(m2lDetail.rgb, m2lOriginal.rgb, m2lWeight), 1.0);
      #endif
    `)},m.customProgramCacheKey=()=>"map2lap-colour-blend-1",m.needsUpdate=!0}function Pg(m,g){m.onBeforeCompile=(_)=>{_.uniforms.m2lScale={value:new $e(...g)},_.vertexShader=_.vertexShader.replace("#include <common>",`#include <common>
varying vec3 m2lPosition;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
m2lPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`),_.fragmentShader=_.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 m2lPosition;
uniform vec2 m2lScale;`).replace("#include <map_fragment>",`
        #ifdef USE_MAP
          diffuseColor *= texture2D(map, m2lPosition.xz * m2lScale);
        #endif
      `)},m.customProgramCacheKey=()=>"map2lap-world-colour-1",m.needsUpdate=!0}function Ig(m){let g=[0];for(let _=1;_<m.length;_++)g.push(g[_-1]+Math.hypot(m[_][0]-m[_-1][0],m[_][1]-m[_-1][1]));return g}function Pr(m,g,_){let x=0,y=g.length-1;if(_<=0)return[m[0][0],m[0][1]];if(_>=g[y])return[m[y][0],m[y][1]];while(y-x>1){let b=x+y>>1;if(g[b]<=_)x=b;else y=b}let v=(_-g[x])/(g[y]-g[x]||1);return[m[x][0]+(m[y][0]-m[x][0])*v,m[x][1]+(m[y][1]-m[x][1])*v]}var Gn=11,Oh=6,cM=12,uM=100,hM=500,dM=3,fM=500,Bi=2,Uh=300000,pM=45,Fh=22,Bh=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,mM=/^nocol_far/,gM=1.5,_M=0.004,Lg=0.02,xM=10,yM=200,Ml=1000,kh=1,vM=4,Ng=2,bM=2,SM=0.15,Dg=100,MM=3,Og=3,wl=1,wM=5,EM=0.1,TM=0.002,Ug=1000,AM=80000,RM=2,CM=24,PM=6000,IM=0.1,Fg=30,LM=0.6,NM=0.12,DM=0.15,OM=0.05,UM=0.000001,FM=0.01,BM=100,Bg=0.3,kM=new Set(["KeyW","KeyA","KeyS","KeyD"]),zM=60,zh=4,kg="#ffd21f",zg=300,HM=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],GM=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,VM=/_wire_/,WM=6,XM=8,Hn=0,qM=1,YM=new Set(["power line"]),$M=/^(1ROAD|1GRASS|1GRAVEL)_ground/,ZM=/^1ROAD_ground/,Hg="#27d3c3",as=0.3,Gg=14,El=1.5,JM=50,KM=0.25,jM=5000,QM=200,Hh=4,Vg=64;function Wg(m,g){performance.clearMeasures(m);let _=performance.now(),x=g();return performance.measure(m,{start:_}),x}function ew(m){let g=document.createElement("canvas");g.width=m.width,g.height=m.height;let _=g.getContext("2d",{willReadFrequently:!0});return _?.drawImage(m,0,0),_?_.getImageData(0,0,m.width,m.height):null}function tw(m){let{roots:g,indirectBuffer:_}=Rr.serialize(m,{cloneBuffers:!1});return g.reduce((x,y)=>x+y.byteLength,_?.byteLength??0)}function nw(m){let g=performance.now(),_=new Rr(m.geometry,{indirect:!0}),x=tw(_);return m.geometry.boundsTree=_,m.raycast=Tg,performance.measure("map2lap.bvh",{start:g,detail:x}),x}var Ir=(m)=>m.vertices*Gn*4+4+m.indices*2;function Kn(m,g){let _=g.getBoundingClientRect();return new $e((m.clientX-_.left)/_.width*2-1,-(m.clientY-_.top)/_.height*2+1)}async function ki(m,g,_=dM){let x;try{if(x=await fetch(m,{signal:g}),x.ok)return await x.arrayBuffer()}catch(y){if(g.aborted||_<=1)throw y;return await new Promise((v)=>setTimeout(v,fM)),ki(m,g,_-1)}throw new Lo(x.status,(await x.json().catch(()=>null))?.error??`${m}: ${x.status}`)}class Lo extends Error{status;constructor(m,g){super(g);this.status=m}}function Tl(m){let g=[],_=0;return async(x)=>{if(_>=m)await new Promise((y)=>g.push(y));_++;try{return await x()}finally{_--,g.shift()?.()}}}var Gh=Tl(cM);async function Vh(m,g,_,x=!1){let y;if(/\.dds$/i.test(g)){let v=new ch().parse(m,!0);if(v.format===Ln)y=new Yi(v.mipmaps[0].data,v.width,v.height,Ln),y.mipmaps=v.mipmaps,y.generateMipmaps=!1;else y=new co(v.mipmaps,v.width,v.height,v.format);y.minFilter=v.mipmapCount>1?ii:wn}else{let v=await createImageBitmap(new Blob([m]),{imageOrientation:"none",premultiplyAlpha:"none"});y=new Vt(v),y.generateMipmaps=!0,y.minFilter=ii}return y.flipY=!1,y.wrapS=y.wrapT=rr,y.anisotropy=_,y.colorSpace=x?Pi:wa,y.needsUpdate=!0,y}function Xg(m,g,_,x){let y=m.at(-1),v=m.at(-2);if(m.length>=jM)y[2]+=x;else if(Math.hypot(g-y[0],_-y[1])>=KM)m.push([g,_,x]);else if(v&&v[0]===y[0]&&v[1]===y[1])y[2]+=x;else m.push([y[0],y[1],x])}function iw(m,g){let _=[],x=g/2,y=(S)=>{let M=m[Math.max(0,S-1)],w=m[Math.min(m.length-1,S+1)],E=Math.hypot(w[0]-M[0],w[2]-M[2])||1;return[(w[2]-M[2])/E*x,(M[0]-w[0])/E*x]},v=(S)=>{let[M,w]=y(S);return[m[S][0]+M,m[S][1]+as,m[S][2]+w]},b=(S)=>{let[M,w]=y(S);return[m[S][0]-M,m[S][1]+as,m[S][2]-w]};for(let S=0;S+1<m.length;S++)_.push(...v(S),...v(S+1),...b(S),...b(S+1));return _.push(...v(0),...b(0),...v(m.length-1),...b(m.length-1)),_}function sw([m,g,_]){let x=g+as;return[m-El,x,_,m+El,x,_,m,x,_-El,m,x,_+El]}function rw(m,g,_){return Math.hypot(...m.map((x,y)=>Math.max(Math.abs(g[y]-x),Math.abs(_[y]-x))))}function Io(m,g){m.computeBoundingBox();let _=m.boundingBox;m.boundingSphere=new Pn(new Z(...g.center),Math.max(g.radius,rw(g.center,_.min.toArray(),_.max.toArray())))}function ow(m,g){let _=new sn,x=new Pa(new Float32Array(g,0,m.vertices*Gn),Gn);_.setAttribute("position",new Ss(x,3,0)),_.setAttribute("normal",new Ss(x,3,3)),_.setAttribute("uv",new Ss(x,2,6));let y=m.vertices*Gn*4+4;return _.setIndex(new Qt(new Uint16Array(g,y,m.indices),1)),Io(_,m),_}class Wh{copyVersion=0;copyLoading=null;copyStamp=[];groundVersion=0;copyGhost=null;copyFoot=new Z;copyPose={turn:0,y:0,scale:1};onCopyPlace=null;renderer;scene=new Aa;surfaceOverlay=null;roadRegionOverlay=null;roadInfluenceOverlay=null;surfaceFailed=()=>{};camera=new On(55,1,0.5,Uh);resizing;down=new po;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];textureBytes=new WeakMap;textureChanges=new Map;displayedTextures=new Map;paintFailure=null;onTexturesChanged=()=>{};paintVersion=0;paintLoading=null;loadedTexture=null;materials=[];splatImages=new Map;splatBindings=new Map;splatPending=new Map;sourceMaterials=new Map;usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=Fh;highest=Ug;area=Hl([]);lastGround=0;zoomLeft=0;zoomAim=new Z;host;flying=new Set;ride=null;rideSpeed=0;rideHeight=0;rideTold=0;onRideMoving=()=>{};onRideMetre=()=>{};lastFrame=0;settings=u;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new po;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=zg;onIndexed=()=>{};picks=new Map;adding=!1;selectMode={enabled:!1,whole:!1,add:!1};materialAreas=new Map;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};refreshes=Tl(Oh);brush=null;onStroke=()=>{};askPreview=()=>Promise.resolve(null);onStrokeRefused=()=>{};onToolWheel=()=>{};ring=null;stroke=null;previewed=new Set;underPreview=new Map;previewShown=new Map;wheelTaken=!1;marking=null;pins=[];pinMarks=null;pinTexture=null;dragged=null;onPinMoved=()=>{};onPinTaken=()=>{};onClicked=()=>{};band=null;moveTool=!1;onMoved=()=>{};placed=new Map;pendingPivots=new Map;dragging=null;constructor(m){this.host=m,this.renderer=new oh({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),m.appendChild(this.renderer.domElement),this.scene.background=new st("#a9cfe9"),this.scene.add(new Va("#ffffff",2));let g=new Ga("#fff4e0",1.6);g.position.set(0.5,1,0.35),this.scene.add(g),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.moves(this.renderer.domElement),this.dragPins(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(m),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(m){if(this.shown=m,m)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(m){this.settings=m}setHover(m){this.onHover=m}setPick(m){this.onPick=m}async setSurface(m,g=()=>{}){if(this.surfaceFailed=g,!m){this.surfaceOverlay?.clear();return}this.surfaceOverlay??=new ja(this.scene,()=>{this.dirty=!0},(_)=>{if(!Qn(this.usedBytes,_,this.settings.memoryGb))return!1;return this.usedBytes+=_,!0},(_)=>{this.usedBytes-=_}),await this.surfaceOverlay.set(m,this.meshes)}async setRoadRegion(m){if(!m){this.roadRegionOverlay?.clear();return}this.roadRegionOverlay??=this.makeRoadOverlay(),await this.roadRegionOverlay.set(m,this.meshes)}async setRoadInfluence(m){if(!m){this.roadInfluenceOverlay?.clear();return}this.roadInfluenceOverlay??=this.makeRoadOverlay(),await this.roadInfluenceOverlay.set(m,this.meshes)}makeRoadOverlay(){return new ja(this.scene,()=>{this.dirty=!0},(m)=>{if(!Qn(this.usedBytes,m,this.settings.memoryGb))return!1;return this.usedBytes+=m,!0},(m)=>{this.usedBytes-=m},void 0,15965237,0.42)}setIndexed(m){this.onIndexed=m,m(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.forgetPicks(),this.onPick(null)}setAdding(m){this.adding=m}setSelectMode(m,g=!1,_=!1){this.selectMode={enabled:m,whole:g,add:_}}materialSelection(m){let g=this.byNumber.get(m.mesh),_=this.materialAreas.get(m.mesh);if(!g||!_||m.face===void 0||!this.data)throw Error("This material is no longer loaded");let x=g.userData.info,y=[];for(let[v,b]of this.materialAreas){let S=this.byNumber.get(v);if(!S||S.userData.info.material!==x.material||!m.whole&&v!==m.mesh)continue;let M=m.whole?b.facesOfOwner(m.object??null):b.faces(m.face);if(M.length)y.push({mesh:v,faces:M})}return{material:this.data.materials[x.material].name,truncated:!1,tiles:[],meshes:y}}setRemoved(m,g=[],_=[]){this.named={ids:m,objectSorts:new Set(_)};let x=new Set(g),y=new Set([...m,...Fs(this.data?.objects??{},new Set([..._,...g]))]),v=g.length!==this.removedSorts.size||g.some((S)=>!this.removedSorts.has(S)),b=!1;for(let S of this.removed)if(!y.has(S))this.leaveOut(S,!1),b=!0;if(v){this.removedSorts=x;for(let S of this.billboardMeshes())this.restore(S);b=!0}for(let S of y)if(b||!this.removed.has(S))this.leaveOut(S,!0);if(b&&this.removedSorts.size)for(let S of this.billboardMeshes())this.leaveOutSorts(S);if(this.removed=y,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(m=this.named){return new Set([...m.ids,...Fs(this.data?.objects??{},m.objectSorts),...Fs(this.data?.objects??{},this.removedSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let m of this.removed){let g=m.slice(0,m.lastIndexOf("#"));if(!this.data?.objects?.[g]){if(!this.billboardsOut.has(g))this.billboardsOut.set(g,[]);this.billboardsOut.get(g).push(m);continue}for(let _ of this.piecesOf(m)){if(!this.listedOut.has(_.mesh))this.listedOut.set(_.mesh,[]);this.listedOut.get(_.mesh).push(_)}}}countOfListed(m,g,_){if(!this.data)return 0;return bd(this.data.objects,m,Xl(this.wanted({ids:g,objectSorts:new Set(_)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(m){let g=m.userData.indices;if(!g)return;let _=m.geometry.getIndex();_.array.set(g),_.needsUpdate=!0}*billboardsOf(m){let g=m.userData.info,_=g.indices/3,x=g.first_face;for(let y=Br(0,x);y<=Br(Math.max(0,_-1),x);y++){let[v,b]=ko(y,x,_);if(v<b)yield[y,v,b]}}spriteOf(m,g){let _=m.geometry.getAttribute("uv"),x=m.userData.indices??m.geometry.getIndex().array,[y,v,b]=[x[g*3],x[g*3+1],x[g*3+2]];return $l(this.data.atlas,(_.getX(y)+_.getX(v)+_.getX(b))/3,(_.getY(y)+_.getY(v)+_.getY(b))/3)}leaveOutSorts(m){if(!this.removedSorts.size||!this.data)return;let g=m.userData.info;for(let[,_,x]of this.billboardsOf(m)){let y=this.spriteOf(m,_);if(y&&this.removedSorts.has(y))this.leaveOutIn(m,{mesh:g.i,from:_,end:x},!0)}}countOf(m){let g=new Set;for(let _ of this.billboardMeshes()){let x=_.userData.info;for(let[y,v]of this.billboardsOf(_))if(this.spriteOf(_,v)===m)g.add(`${x.base}#${y}`)}for(let _ of Fs(this.data?.objects??{},new Set([m])))if(!this.removed.has(_)&&this.shownBounds(this.piecesOf(_)))g.add(_);return g.size}piecesOf(m,g=!0){let _=m.lastIndexOf("#"),x=m.slice(0,_),y=Number(m.slice(_+1)),v=this.data?.objects?.[x]?.faces[y];if(v)return[...v.map(([b,S,M])=>({mesh:b,from:S,end:S+M})),...g?(this.belonging.get(m)??[]).flatMap((b)=>this.piecesOf(b)):[]];return(this.parts.get(x)??[]).map((b)=>{let S=b.userData.info,[M,w]=ko(y,S.first_face,S.indices/3);return{mesh:S.i,from:M,end:w}}).filter((b)=>b.from<b.end)}leaveOut(m,g){for(let _ of this.piecesOf(m)){let x=this.byNumber.get(_.mesh);if(x)this.leaveOutIn(x,_,g)}}leaveOutIn(m,{from:g,end:_},x){let y=m.geometry.getIndex(),v=y.array;if(!m.userData.indices)m.userData.indices=v.slice(),this.usedBytes+=v.byteLength;if(x)v.fill(0,g*3,_*3);else v.set(m.userData.indices.subarray(g*3,_*3),g*3);y.needsUpdate=!0}async open(m,g){let _=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:x}=this.loading;if(this.clear(),this.trackName=m,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),g(m?"Reading the track …":"",m?null:void 0),!m)return;try{await this.load(m,_,x,g)}catch(y){if(_!==this.token)return;this.loadedTexture=null,this.loading.abort(),g(`Could not load this track: ${y.message}`)}}async load(m,g,_,x){let y=await fetch(`/api/editor/${encodeURIComponent(m)}/index`,{signal:_}),v=await y.json();if(g!==this.token)return;if(!y.ok){x(v.error||"Could not read this track");return}if(this.data=v,this.ensureSplatState(),v.paint_errors?.length)this.onViewFailed(`Some material edits could not be shown: ${v.paint_errors.join("; ")}. Original textures are shown for affected areas. Discard all can remove these edits.`);this.objectPieces=Yl(v.objects),this.belonging=ql(v.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(v.revision),this.placeCamera(v),this.renderer.domElement.focus({preventScroll:!0});let b=Gl(v.meshes.filter((z)=>!z.copy),this.camera.position.toArray()),S=this.camera.position.clone(),M=performance.now(),w=v.meshes.length,E=0,A=0,T=0,R=Tl(2),P=new Map,N=new Set(v.surface_tiles??[]),C=new Set(v.meshes.map((z)=>ns(z.name)).filter((z)=>z&&N.has(z))),L=new Set(v.meshes.flatMap((z)=>Ag(v.materials[z.material]))).size,U=w+L+C.size,O=0,F=!1,k=()=>{if(g!==this.token)return;let z=!F?`Loading: ${E+A} of ${w} parts`:T<L&&!this.overLimit?`Loading textures: ${T} of ${L}`:`Preparing selection: ${O} of ${P.size} (${E+A} parts)`;x(z,Math.min(1,(E+A+T+O)/Math.max(1,U)))};this.loadedTexture=()=>{T++,k()};let D=v.meshes.some((z)=>z.copy)?this.syncCopies(v).then(()=>{A=v.meshes.filter((z)=>z.copy).length,k()}):Promise.resolve();if(k(),await Promise.all(Array.from({length:Oh},async()=>{while(b.length&&g===this.token){if(performance.now()-M>hM&&S.distanceTo(this.camera.position)>uM)b=Gl(b,this.camera.position.toArray()),S=this.camera.position.clone(),M=performance.now();let z=b.pop();if(this.byNumber.has(z.i))continue;if(!Qn(this.usedBytes,Bi*Ir(z),this.settings.memoryGb)){this.overLimit=!0,b.length=0;return}this.usedBytes+=Bi*Ir(z);let W=this.heightsVersion,V=await ki(`/api/editor/${encodeURIComponent(m)}/mesh/${z.i}?r=${v.revision}`,_);if(g!==this.token)return;this.addMesh(m,v,z,V);let Y=ns(z.name);if(Y&&N.has(Y)&&!P.has(Y)){let ee=R(async()=>{if(_.aborted||g!==this.token)return;await ki(`/api/editor/${encodeURIComponent(m)}/surface/prepare?mesh=${z.i}&r=${v.revision}`,_),O++,k()});P.set(Y,ee),ee.catch(()=>{})}if(W!==this.heightsVersion)this.refresh(z.i);E++,k()}})),await D,g!==this.token)return;if(F=!0,k(),await Promise.all(this.textures),await Promise.all([...this.splatPending.values()].map((z)=>z.done)),g!==this.token)return;if(O<P.size)k();if(await Promise.all(P.values()),g!==this.token)return;this.loadedTexture=null,x(this.overLimit?`Memory limit reached (Settings): ${E} of ${w} parts, the nearest ones`:`${w} parts loaded`)}turnAround(m){let g=null,_=new Z,x=0;m.addEventListener("mousedown",(y)=>{if(y.button===kh)y.preventDefault()}),m.addEventListener("pointerdown",(y)=>{if(y.button!==kh)return;this.zoomLeft=0,g={x:y.clientX,y:y.clientY};let v=this.camera.position,b=this.camera.getWorldDirection(new Z);x=Math.max(wl,Math.min(this.reachOfLook(),this.groundAlong(v,b)?.distance??this.wayDown(b))),_=v.clone().addScaledVector(b,x),this.intoArea(_)}),m.addEventListener("pointermove",(y)=>{if(!g)return;if(!(y.buttons&vM)){g=null;return}let{look:v,invertLook:b}=this.settings,S=_M*v/d;this.turn(_,x,(g.x-y.clientX)*S,(g.y-y.clientY)*S*(b?-1:1)),g={x:y.clientX,y:y.clientY}}),m.addEventListener("pointerup",(y)=>{if(y.button===kh)g=null})}grabGround(m){let g=null,_=new Z,x=new Z;m.addEventListener("pointerdown",(v)=>{if(v.button!==Ng)return;this.zoomLeft=0,this.picker.setFromCamera(Kn(v,m),this.camera);let{ray:b}=this.picker,S=this.groundAlong(b.origin,b.direction)?.point.y??this.lastGround;if(g=new mn(new Z(0,1,0),-S),!b.intersectPlane(g,x))g=null});let y=(v,b)=>{if(this.picker.setFromCamera(Kn(v,m),this.camera),!this.picker.ray.intersectPlane(b,_)||_.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=x.x-_.x,this.camera.position.z+=x.z-_.z,this.settle(),this.clearance=this.height,this.moved()};m.addEventListener("pointermove",(v)=>{if(!g)return;if(v.buttons&bM)y(v,g);else g=null}),m.addEventListener("pointerup",(v)=>{if(v.button!==Ng)return;if(g)y(v,g);g=null})}zoomWheel(m){m.addEventListener("wheel",(g)=>{g.preventDefault();let _=g.ctrlKey&&g.altKey?"ctrlAlt":g.altKey?"alt":g.ctrlKey?"ctrl":g.shiftKey&&this.wheelTaken?"shift":null;if((this.brush||this.wheelTaken)&&_){let w=g.deltaY||g.deltaX;if(w)this.onToolWheel(_,w<0?1:-1);return}if(this.stopRide(),!this.data||this.held)return;this.mouse=Kn(g,m);let x=this.hit(),{ray:y}=this.picker,v=this.camera.position,b=x||y.direction.y<0?y.direction:this.camera.getWorldDirection(new Z),S=Math.min(x?.distance??this.wayDown(b),Math.max(this.height,wl)*wM);this.zoomAim.copy(v).addScaledVector(b,Math.max(S,wl));let M=g.deltaMode===WheelEvent.DOM_DELTA_LINE?g.deltaY/MM*Dg:g.deltaY;this.zoomLeft+=Li.clamp(M/Dg,-Og,Og)*this.settings.zoom/d},{passive:!1})}glideZoom(m){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let g=this.zoomLeft*(1-Math.exp(-m/EM));if(Math.abs(this.zoomLeft-g)<TM)g=this.zoomLeft;this.zoomLeft-=g;let _=this.camera.position,x=_.distanceTo(this.zoomAim);if(!x)return;let y=Math.max(Math.min(x,wl),x*(1-SM)**-g);_.lerpVectors(this.zoomAim,_,y/x),this.settle(),this.clearance=this.height,this.moved()}followMouse(m){m.addEventListener("pointermove",(g)=>{if(this.mouse=Kn(g,m),this.held=g.buttons,!g.buttons)this.hoverDue=!0}),m.addEventListener("pointerdown",(g)=>{this.held=g.buttons}),m.addEventListener("pointerup",(g)=>{this.held=g.buttons,this.hoverDue=!0}),m.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(m){let g=this.brush;if(this.brush=m,!m){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!g)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(m,g,_){this.onStroke=m,this.askPreview=g,this.onStrokeRefused=_}cancelStroke(){if(!this.stroke)return!1;return clearInterval(this.stroke.timer),this.stroke=null,this.takeBackPreview(),!0}takeBackPreview(){for(let[m,g]of this.underPreview){let _=this.byNumber.get(m);if(!_)continue;let x=_.geometry.getAttribute("position").data,y=x.array;for(let[v,b]of g){let S=v*Gn;y[S+1]=b[0],y[S+3]=b[1],y[S+4]=b[2],y[S+5]=b[3]}x.needsUpdate=!0,Io(_.geometry,_.userData.info),_.geometry.boundsTree?.refit(),this.previewed.delete(m),this.dirty=!0}this.underPreview.clear(),this.previewShown.clear()}keepPreview(){this.underPreview.clear(),this.previewShown.clear()}dropPreview(){let m=[...this.previewed];this.previewed.clear();for(let g of m)this.refresh(g)}setWheelTaken(m){this.wheelTaken=m}setMove(m,g){if(this.onMoved=g,m===this.moveTool)return;if(this.moveTool=m,!m)this.dropDrag(),this.renderer.domElement.style.cursor=""}setPlaced(m){this.placed=new Map(m.map((g)=>[g.id,g]));for(let[g,_]of this.pendingPivots){let x=g.lastIndexOf("#"),y=this.data?.objects?.[g.slice(0,x)]?.at[Number(g.slice(x+1))],v=this.placed.get(g);if(y&&Math.abs(y[0]+(v?.x??0)-_[0])<0.002&&Math.abs(y[2]+(v?.z??0)-_[2])<0.002)this.pendingPivots.delete(g)}}rejectMove(m){for(let g of m)this.pendingPivots.delete(g);if(this.dragging?.ids.some((g)=>m.includes(g)))this.dropDrag();this.refreshMeshes([])}rootOf(m){let g=m.lastIndexOf("#"),_=this.data?.objects?.[m.slice(0,g)],x=Number(m.slice(g+1));while(_&&_.parents[x]>=0)x=_.parents[x];return _?`${m.slice(0,g)}#${x}`:m}namesOf(m){let g=m.lastIndexOf("#"),_=this.data.objects[m.slice(0,g)],x=Number(m.slice(g+1));return{id:m,kind:zo(_.kinds[x]),sort:kr(_,x)}}canMove(m){let g=m.lastIndexOf("#"),_=this.data?.objects?.[m.slice(0,g)];return!_||!YM.has(_.kinds[Number(m.slice(g+1))])}pivotOf(m){let g=this.pendingPivots.get(m);if(g)return g;let _=m.lastIndexOf("#"),x=this.data?.objects?.[m.slice(0,_)];if(x){let[b,S,M]=x.at[Number(m.slice(_+1))],w=this.placed.get(m);return[b+(w?.x??0),S+(w?.y??0),M+(w?.z??0)]}let y=this.boundsOf(m),v=y.getCenter(new Z);return[v.x,y.min.y,v.z]}grab(m){let g=[];for(let _ of m){let x=new Map;for(let{mesh:y,from:v,end:b}of this.piecesOf(_)){let S=this.byNumber.get(y);if(!S)continue;let M=S.userData.indices??S.geometry.getIndex().array;if(!x.has(y))x.set(y,new Set);for(let w=v*3;w<b*3;w++)x.get(y).add(M[w])}for(let[y,v]of x){let b=Uint32Array.from(v),S=this.vertexArray(y),M=new Float32Array(b.length*Gn);b.forEach((w,E)=>M.set(S.subarray(w*Gn,(w+1)*Gn),E*Gn)),g.push({id:_,mesh:y,numbers:b,floats:M})}}return g}vertexArray(m){return this.byNumber.get(m).geometry.getAttribute("position").data.array}nudgeGrabbed(m,g,_){for(let x of m){Fl(x.floats,this.vertexArray(x.mesh),x.numbers,Gn,g.get(x.id),_(x.id));let y=this.byNumber.get(x.mesh);y.geometry.getAttribute("position").data.needsUpdate=!0,Io(y.geometry,y.userData.info),y.geometry.boundsTree?.refit(),this.previewed.add(x.mesh)}this.reframePicks(),this.dirty=!0}nudge(m,g){let _={...Or,...g},x=this.dragging;if(x&&m.every((y)=>x.ids.includes(y))){for(let y of x.grabbed){if(!m.includes(y.id))continue;let v=new Float32Array(y.floats.length);Fl(y.floats,v,Array.from(y.numbers,(b,S)=>S),Gn,x.pivots.get(y.id),_),y.floats=v}for(let y of m){let[v,b,S]=x.pivots.get(y);x.pivots.set(y,[v+_.x,b+_.y,S+_.z])}return this.dragOn(x.grabbed)}this.nudgeGrabbed(this.grab(m),new Map(m.map((y)=>[y,this.pivotOf(y)])),()=>_)}dragOn(m){let g=this.dragging;for(let _ of g.ids){let[x,,y]=g.pivots.get(_),v=g.ground.get(_),b=this.groundAt(x+g.way.x,y+g.way.z);g.rises.set(_,v!=null&&b!=null?b-v:0)}this.nudgeGrabbed(m,g.pivots,(_)=>({...Or,x:g.way.x,y:g.rises.get(_)??0,z:g.way.z}))}dropDrag(){let m=this.dragging;if(this.dragging=null,m)this.nudgeGrabbed(m.grabbed,m.pivots,()=>Or)}reframePicks(){for(let[m,{box:g}]of this.picks){let _=this.boundsOf(m);if(!_.isEmpty())g.box.copy(_)}}moves(m){m.addEventListener("pointerdown",(g)=>{if(!this.moveTool||this.brush||g.button!==Hn)return;let _=this.pick(g,m);if(!_?.id||!this.picks.has(_.id))return;let x=[...this.picks.keys()].filter((M)=>this.canMove(M));if(!x.includes(_.id))return;let y=new Map(x.map((M)=>[M,this.pivotOf(M)])),v=new mn(new Z(0,1,0),-y.get(_.id)[1]),b=new Z;if(this.picker.setFromCamera(Kn(g,m),this.camera),!this.picker.ray.intersectPlane(v,b))return;let S=new Map(x.map((M)=>{let[w,,E]=y.get(M);return[M,this.groundAt(w,E)]}));this.dragging={ids:x,plane:v,from:b,x:g.clientX,y:g.clientY,grabbed:this.grab(x),pivots:y,ground:S,rises:new Map,way:new Z},m.setPointerCapture(g.pointerId)}),m.addEventListener("pointermove",(g)=>{let _=this.dragging;if(!_)return;if(!(g.buttons&qM))return this.dropDrag();if(!_.way.lengthSq()&&Math.hypot(g.clientX-_.x,g.clientY-_.y)<zh)return;this.picker.setFromCamera(Kn(g,m),this.camera);let x=new Z;if(!this.picker.ray.intersectPlane(_.plane,x)||x.distanceTo(this.camera.position)>2*this.highest)return;_.way.set(x.x-_.from.x,0,x.z-_.from.z),m.style.cursor="grabbing",this.dragOn(_.grabbed)}),m.addEventListener("pointerup",(g)=>{let _=this.dragging;if(!_||g.button!==Hn)return;if(this.dragging=null,m.style.cursor="grab",_.way.lengthSq()){for(let x of _.ids){let[y,v,b]=_.pivots.get(x);this.pendingPivots.set(x,[y+_.way.x,v+(_.rises.get(x)??0),b+_.way.z])}this.onMoved(_.ids.map((x)=>({id:x,x:_.way.x,y:_.rises.get(x)??0,z:_.way.z})))}}),m.addEventListener("pointercancel",()=>this.dropDrag())}setClicked(m){this.onClicked=m}setMarking(m){this.marking=m}heightOfGround(m,g){return this.groundAt(m,g)??this.lastGround}groundAt(m,g){return this.groundAlong(new Z(m,Uh,g),new Z(0,-1,0))?.point.y??null}drawBand(m,g){if(this.band)this.scene.remove(this.band),this.band.geometry.dispose(),this.band.material.dispose(),this.band=null;if(this.dirty=!0,!m?.length)return;let _=m.length===1?sw(m[0]):iw(m,g);this.band=new Oi(new sn().setAttribute("position",new gn(_,3)),new es({color:Hg,depthTest:!1,transparent:!0})),this.band.renderOrder=10,this.band.frustumCulled=!1,this.scene.add(this.band)}drawPins(m){if(this.pins=m,this.dragged=null,this.pinMarks)this.scene.remove(this.pinMarks),this.pinMarks.geometry.dispose(),this.pinMarks.material.dispose(),this.pinMarks=null;if(this.dirty=!0,!m.length){this.renderer.domElement.style.cursor="";return}this.pinMarks=new Es(new sn().setAttribute("position",new gn(m.flatMap(([g,_,x])=>[g,_+as,x]),3)),new lo({color:Hg,size:Gg,sizeAttenuation:!1,map:this.pinImage(),alphaTest:0.5,depthTest:!1,transparent:!0})),this.pinMarks.renderOrder=11,this.pinMarks.frustumCulled=!1,this.scene.add(this.pinMarks)}pinImage(){if(this.pinTexture)return this.pinTexture;let m=document.createElement("canvas");m.width=m.height=32;let g=m.getContext("2d");return g.fillStyle="#ffffff",g.beginPath(),g.arc(16,16,15,0,2*Math.PI),g.fill(),this.pinTexture=new Na(m),this.pinTexture}setPinned(m,g){this.onPinMoved=m,this.onPinTaken=g}pinAt(m,g){let _=g.getBoundingClientRect(),x=new Z,y=-1,v=Gg;return this.pins.forEach(([b,S,M],w)=>{x.set(b,S+as,M).project(this.camera);let E=Math.hypot((x.x+1)/2*_.width+_.left-m.clientX,(1-x.y)/2*_.height+_.top-m.clientY);if(x.z<1&&E<v)v=E,y=w}),y}dropDragged(){let m=this.dragged;if(this.dragged=null,!m||!this.pinMarks)return;this.pins[m.pin]=m.from;let[g,_,x]=m.from;this.pinMarks.geometry.getAttribute("position").setXYZ(m.pin,g,_+as,x).needsUpdate=!0,this.dirty=!0}dragPins(m){m.addEventListener("pointerdown",(g)=>{if(g.button!==Hn||this.brush)return;let _=this.pinAt(g,m);if(_<0)return;this.dragged={pin:_,x:g.clientX,y:g.clientY,from:this.pins[_]},m.setPointerCapture(g.pointerId)}),m.addEventListener("pointermove",(g)=>{if(!this.dragged){if(this.pins.length)m.style.cursor=this.pinAt(g,m)>=0?"grab":"";return}this.mouse=Kn(g,m);let _=this.brushAt();if(!_||!this.pinMarks)return;this.pins[this.dragged.pin]=[_.x,_.y,_.z],this.pinMarks.geometry.getAttribute("position").setXYZ(this.dragged.pin,_.x,_.y+as,_.z).needsUpdate=!0,this.dirty=!0}),m.addEventListener("pointerup",(g)=>{let _=this.dragged;if(!_||g.button!==Hn)return;if(Math.hypot(g.clientX-_.x,g.clientY-_.y)<zh)return this.dropDragged();this.dragged=null,this.onPinMoved(_.pin,this.pins[_.pin][0],this.pins[_.pin][2])}),m.addEventListener("pointercancel",()=>this.dropDragged())}sample(){let m=this.stroke;if(!m||!this.mouse)return;let g=performance.now(),_=(g-m.at)/1000,x=m.samples.at(-1);m.at=g;let y=`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;if(y===m.look)Xg(m.samples,x[0],x[1],_);else{let v=this.brushAt();if(m.look=y,this.placeRing(v,m.turned),v)Xg(m.samples,v.x,v.z,_)}if(!m.asking&&g-m.asked>=QM)m.asking=!0,m.asked=g,this.askPreview(m.samples.map((v)=>[...v]),m.turned).then((v)=>{if(m.asking=!1,this.stroke!==m)return;if(typeof v==="string")this.cancelStroke(),this.onStrokeRefused(v);else if(v)this.showPreview(v)},()=>{m.asking=!1})}showPreview(m){this.takeBackPreview();let g=new Uint32Array(m),_=1;for(let x=0;x<g[0];x++){let y=g[_],v=g[_+1];this.previewShown.set(y,{numbers:g.subarray(_+2,_+2+v),values:new Float32Array(m,(_+2+v)*4,v*Hh)}),_+=2+v+v*Hh,this.laidOver(y)}this.dirty=!0}laidOver(m){let g=this.previewShown.get(m),_=this.byNumber.get(m);if(!g||!_)return;let{numbers:x,values:y}=g,v=_.geometry.getAttribute("position").data,b=v.array,S=new Map;this.underPreview.set(m,S);for(let M=0;M<x.length;M++){let w=x[M]*Gn,E=M*Hh;S.set(x[M],[b[w+1],b[w+3],b[w+4],b[w+5]]),b[w+1]=y[E],b[w+3]=y[E+1],b[w+4]=y[E+2],b[w+5]=y[E+3]}v.needsUpdate=!0,Io(_.geometry,_.userData.info),_.geometry.boundsTree?.refit(),this.previewed.add(m)}setToolWheel(m){this.onToolWheel=m}refreshMeshes(m){if(m.includes(-1))this.syncCopies();let g=new Set(this.previewShown.size?m:[...m,...this.previewed]);if(!this.previewShown.size)this.previewed.clear();if(!g.size)return;this.heightsVersion++;for(let _ of g)if(_>=0)this.refresh(_)}async syncCopies(m,g=2){let _=this.token,x=++this.copyVersion;this.copyLoading?.abort(),this.copyLoading=new AbortController;let y=AbortSignal.any([this.loading.signal,this.copyLoading.signal]);try{let v=m;if(!v){let I=await fetch(`/api/editor/${encodeURIComponent(this.trackName)}/copies`,{signal:y}),L=await I.json();if(!I.ok)throw new Lo(I.status,L.error??"Could not load the copied objects");v=L}if(_!==this.token||x!==this.copyVersion)return;if(v.revision!==this.data?.revision)throw Error("The track changed");let b=v.meshes.filter((I)=>I.copy),S=this.meshes.filter((I)=>I.userData.info.copy),M=S.reduce((I,L)=>I+Bi*Ir(L.userData.info),0),w=b.reduce((I,L)=>I+Bi*Ir(L),0);if(!Qn(this.usedBytes-M,w,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");let E=this.heightsVersion,A=Tl(Oh),T=v.revision,R=v.copy_revision??"",P=await Promise.all(b.map((I)=>A(()=>(y.throwIfAborted(),ki(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${I.i}?r=${T}&c=${R}`,y)))));if(_!==this.token||x!==this.copyVersion)return;if(!Qn(this.usedBytes-M,w,this.settings.memoryGb))throw Error("The copies exceed the Editor memory limit");for(let I of S){let L=I.userData.info;this.scene.remove(I),I.geometry.boundsTree=void 0,I.geometry.dispose(),this.byNumber.delete(L.i),this.usedBytes-=Bi*Ir(L)}this.meshes=this.meshes.filter((I)=>!I.userData.info.copy);let N=Object.fromEntries(Object.entries(this.data.objects).filter(([I])=>!I.startsWith("copy_"))),C=Object.fromEntries(Object.entries(v.objects).filter(([I])=>I.startsWith("copy_")));this.data={...this.data,copy_revision:R,draft:v.draft,meshes:[...this.data.meshes.filter((I)=>!I.copy),...b],objects:{...N,...C}};for(let[I,L]of this.objectPieces)if(L[0]?.id.startsWith("copy_"))this.objectPieces.delete(I);for(let[I,L]of Yl(C))this.objectPieces.set(I,L);for(let I of this.belonging.keys())if(I.startsWith("copy_"))this.belonging.delete(I);for(let[I,L]of ql(C))this.belonging.set(I,L);this.removed=this.wanted(),this.noteListedOut(),b.forEach((I,L)=>{let U=Bi*Ir(I);if(this.usedBytes+=U,this.addMesh(this.trackName,this.data,I,P[L]),E!==this.heightsVersion)this.refresh(I.i)});for(let I of[...this.picks.keys()]){let[L,U]=I.split("#");if(L.startsWith("copy_")&&!C[L]?.faces[Number(U)]?.length)this.dropPick(I)}this.reframePicks(),this.onViewFailed(null),this.dirty=!0,this.hoverDue=!0}catch(v){if(_!==this.token||x!==this.copyVersion||y.aborted)return;if(v instanceof Lo&&v.status===409&&g>0)return this.syncCopies(void 0,g-1);this.onViewFailed(v.message)}}setCopy(m,g,_){if(this.copyGhost){this.scene.remove(this.copyGhost);for(let S of this.copyGhost.children)S.geometry.dispose(),S.material.dispose()}if(this.copyGhost=null,this.copyStamp=[],this.onCopyPlace=g,!m||!g){this.dirty=!0;return}let x=new qi;x.matrixAutoUpdate=!1;let y=[...Xl([m],this.belonging)].filter((S)=>this.canMove(S));for(let S of y)for(let M of this.piecesOf(S,!1)){let w=this.byNumber.get(M.mesh);if(!w)continue;let E=w.geometry.getIndex().array,A=[];for(let N=M.from*3;N<M.end*3;N+=3)if(E[N]!==E[N+1]&&E[N+1]!==E[N+2]&&E[N]!==E[N+2])A.push(E[N],E[N+1],E[N+2]);if(!A.length)continue;let T=w.geometry.clone();T.setIndex(A);let R=T.toNonIndexed();T.dispose();let P=w.material.clone();P.transparent=!0,P.opacity=0.5,P.depthWrite=!1,x.add(new Xt(R,P))}let v=new yt().setFromObject(x),b=this.pivotOf(m);if(v.isEmpty())return;this.copyFoot.set(_?.[0]??b[0],_?.[1]??v.min.y,_?.[2]??b[2]),this.copyGhost=x,this.scene.add(x),this.followCopy()}setCopyPose(m){this.copyPose={turn:m.turn,y:m.y,scale:m.scale},this.followCopy()}copyAt(){if(!this.mouse)return null;this.picker.setFromCamera(this.mouse,this.camera);let m=this.groundAlong(this.picker.ray.origin,this.picker.ray.direction);return m?m.point.toArray():null}followCopy(){if(!this.copyGhost||!this.shown)return;let m=this.camera,{position:g,quaternion:_}=m,x=[this.mouse?.x??1/0,this.mouse?.y??1/0,g.x,g.y,g.z,_.x,_.y,_.z,_.w,m.aspect,m.fov,this.copyPose.turn,this.copyPose.y,this.copyPose.scale,this.groundVersion,this.held?1:0];if(x.every((v,b)=>v===this.copyStamp[b]))return;this.copyStamp=x;let y=this.copyAt();if(this.copyGhost.visible=!!y&&!this.held,y){let{turn:v,y:b,scale:S}=this.copyPose;this.copyGhost.matrix.makeTranslation(y[0],y[1]+b,y[2]).multiply(new Qe().makeRotationY(v*Math.PI/180)).multiply(new Qe().makeScale(S,S,S)).multiply(new Qe().makeTranslation(-this.copyFoot.x,-this.copyFoot.y,-this.copyFoot.z)),this.copyGhost.matrixWorldNeedsUpdate=!0}this.dirty=!0}setViewFailed(m){this.onViewFailed=m}setTexturesChanged(m){this.onTexturesChanged=m}async refresh(m){let g=this.token,{signal:_}=this.loading,x=this.byNumber.get(m);if(!x||!this.data)return;let y=x.userData.asked=(x.userData.asked??0)+1;try{let v=await this.refreshes(()=>ki(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${m}?r=${this.data.revision}${x.userData.info.copy?`&c=${this.data.copy_revision??""}`:""}`,_));if(g===this.token&&x.userData.asked===y&&this.byNumber.get(m)===x)this.takeVertices(x,v)}catch(v){if(g===this.token&&!_.aborted&&x.userData.asked===y&&this.byNumber.get(m)===x)if(v instanceof Lo&&v.status===409&&x.userData.info.copy)this.syncCopies();else this.onViewFailed(v.message)}}takeVertices(m,g){let _=m.geometry,x=m.userData.info;if(Bh.test(x.name))this.groundVersion++;let y=_.getAttribute("position").data;y.array.set(new Float32Array(g,0,x.vertices*Gn)),y.needsUpdate=!0,this.underPreview.delete(x.i);let v=this.dragging?.grabbed.filter((b)=>b.mesh===x.i)??[];if(v.length)this.dragOn(v);if(Io(_,x),_.boundsTree?.refit(),Bh.test(x.name))this.followRoadPins(_.boundingBox);if(this.laidOver(x.i),this.marked)this.markDue=!0;this.reframePicks(),this.dirty=!0,this.hoverDue=!0}followRoadPins(m){if(!this.pins?.length||!this.pinMarks)return;let g=this.pinMarks.geometry.getAttribute("position");for(let[_,x]of this.pins.entries()){if(x[0]<m.min.x||x[0]>m.max.x||x[2]<m.min.z||x[2]>m.max.z)continue;let y=this.groundAt(x[0],x[2]);if(y===null)continue;x[1]=y,g.setY(_,y+as),g.needsUpdate=!0}}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:m}=this.picker,g=this.groundAlong(m.origin,m.direction);return g&&$M.test(g.object.name)?g.point:null}placeRing(m,g){if(!this.brush)return;if(!this.ring){let _=Array.from({length:Vg},(x,y)=>{let v=y/Vg*2*Math.PI;return new Z(Math.cos(v),0,Math.sin(v))});this.ring=new ws(new sn().setFromPoints(_),new es({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!m,m)this.ring.position.copy(m),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(g?this.brush.turnedColour:this.brush.colour);this.dirty=!0}strokes(m){m.addEventListener("pointerdown",(g)=>{if(!this.brush||g.button!==Hn)return;this.mouse=Kn(g,m);let _=this.brushAt();if(!_)return;let x=performance.now();this.stroke={samples:[[_.x,_.z,0]],turned:g.shiftKey,at:x,asked:x,asking:!1,look:`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,timer:setInterval(()=>this.sample(),JM)},m.setPointerCapture(g.pointerId)});for(let g of["keydown","keyup"])m.addEventListener(g,(_)=>{if((this.brush||this.wheelTaken)&&_.key==="Alt")_.preventDefault()});m.addEventListener("pointermove",(g)=>{if(!this.brush)return;if(this.mouse=Kn(g,m),!this.stroke)this.placeRing(this.brushAt(),g.shiftKey)}),m.addEventListener("pointerup",(g)=>{if(!this.stroke||g.button!==Hn)return;this.mouse=Kn(g,m),this.sample();let{samples:_,turned:x,timer:y}=this.stroke;clearInterval(y),this.stroke=null,this.keepPreview(),this.onStroke(_,x)}),m.addEventListener("pointercancel",()=>this.cancelStroke()),m.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(m){let g=null;m.addEventListener("pointerdown",(_)=>{g=_.button===0&&!this.brush&&!this.moveTool&&this.pinAt(_,m)<0||_.button===2?{x:_.clientX,y:_.clientY,button:_.button}:null}),m.addEventListener("pointermove",(_)=>{if(g&&Math.hypot(_.clientX-g.x,_.clientY-g.y)>=zh)g=null}),m.addEventListener("pointerup",(_)=>{let x=g?.button===2&&_.button===2?this.pinAt(_,m):-1;if(x>=0)this.onPinTaken(x);else if(g&&_.button===g.button){if(_.button===Hn&&this.onCopyPlace){this.mouse=Kn(_,m);let b=this.copyAt();if(b)this.onCopyPlace(b);g=null;return}let y=this.pick(_,m),v=m.getBoundingClientRect();if(_.button===2&&y)this.onMenu({x:_.clientX-v.left,y:_.clientY-v.top,width:v.width,height:v.height});if(_.button===Hn)this.onClicked(y)}g=null}),m.addEventListener("contextmenu",(_)=>_.preventDefault())}pick(m,g){if(!this.data)return null;this.mouse=Kn(m,g);let _=this.hit(),x=_?this.describe(_):null,y=this.adding&&(m.ctrlKey||m.metaKey||this.selectMode?.enabled&&this.selectMode.add)&&m.button===Hn,v=this.selectMode?.enabled&&(m.shiftKey||this.selectMode.whole)&&m.button===Hn,b=x?.id&&this.moveTool?this.rootOf(x.id):x?.id??null;if(x&&b&&b!==x.id)Object.assign(x,this.namesOf(b));if(!x){if(!y)this.unpick();return null}let S=_?.object.userData.info,M;if(S&&_?.uv&&x&&!b&&(ns(x.object)||this.materialAreas?.has(S.i))){if(M={mesh:S.i,u:_.uv.x,v:_.uv.y,revision:this.data.revision,whole:!!v},!ns(x.object))M.face=_.faceIndex??0,M.object=null}if(y&&!b&&!M)return null;if(y&&b&&this.picks.has(b))return this.dropPick(b,!0);if(!y&&!(m.button!==Hn&&b&&this.picks.has(b)))this.forgetPicks();let w=b?this.boundsOf(b):null,E=w?.getCenter(new Z).setY(w.min.y),A={id:b,afterBuild:!b&&GM.test(x.object),kind:x.kind,sprite:x.sprite,sort:x.sort,position:E?[E.x,E.y,E.z]:x.at,left:m.button===Hn,road:_&&ZM.test(_.object.name)?[_.point.x,_.point.z]:null,all:[],adding:!!y,whole:!!v,surface:M,inspection:{hovered:x,revision:this.data.revision,texture:this.data.textures.findIndex((T)=>T.name===x.texture),listed:!!b&&!!this.data.objects[b.slice(0,b.lastIndexOf("#"))]}};if(b&&w)this.picks.set(b,{box:this.picks.get(b)?.box??this.frameOf(w),picked:A});return A.all=this.allPicked(),this.onPick(A),A}allPicked(){return[...this.picks.values()].map(({picked:m})=>({id:m.id,position:m.position}))}selectedOutside(m){return[...this.picks.values()].filter(({picked:g})=>!m.some((_)=>(_.tree?g.sprite:g.sort)===_.sort)).map(({picked:g})=>({id:g.id,position:g.position}))}dropPick(m,g=!1){let _=this.picks.get(m).picked;this.removeFrame(this.picks.get(m).box),this.picks.delete(m);let x=[...this.picks.values()].at(-1)?.picked??null;if(x)x.all=this.allPicked();let y=x?{...x,adding:g,whole:!1}:g?{..._,id:null,kind:"",all:[],adding:g,whole:!1,surface:void 0}:null;return this.onPick(y),y}setMenu(m){this.onMenu=m}setMarked(m){this.marked=m,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let g=(Array.isArray(this.marked)?this.marked:[this.marked]).flatMap((v)=>v.tree?this.treesOf(v.sort):this.listedOf(v.sort)),_=new Float32Array(g.length*24*3),x=new Z;g.forEach((v,b)=>{HM.forEach(([S,M],w)=>{for(let[E,A]of[S,M].entries())x.set(A&1?v.max.x:v.min.x,A&2?v.max.y:v.min.y,A&4?v.max.z:v.min.z),x.toArray(_,(b*24+w*2+E)*3)})});let y=new sn().setAttribute("position",new Qt(_,3));this.markedLines=new Oi(y,new es({color:kg,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(m){let g=[];for(let _ of Fs(this.data.objects,new Set([m]))){let x=_.lastIndexOf("#"),y=this.data.objects[_.slice(0,x)].faces[Number(_.slice(x+1))],v=this.shownBounds(y.map(([b,S,M])=>({mesh:b,from:S,end:S+M})));if(v)g.push(v)}return g}treesOf(m){let g=new Map;for(let _ of this.billboardMeshes()){let x=_.userData.info;for(let[y,v,b]of this.billboardsOf(_)){if(this.spriteOf(_,v)!==m)continue;let S=`${x.base}#${y}`;g.set(S,[...g.get(S)??[],{mesh:x.i,from:v,end:b}])}}return[...g.values()].map((_)=>this.shownBounds(_)).filter((_)=>_!==null).concat(this.listedOf(m))}shownBounds(m){let g=new yt,_=new Z;for(let{mesh:x,from:y,end:v}of m){let b=this.byNumber.get(x),S=b?.geometry.getIndex().array;if(!b||!S||y>=v||S[y*3]===S[y*3+1])continue;let M=b.geometry.getAttribute("position");for(let w=y*3;w<v*3;w++)g.expandByPoint(_.fromBufferAttribute(M,S[w]))}return g.isEmpty()?null:g}frameOf(m){let g=new Xa(m,new st(kg));return g.material.depthTest=!1,this.scene.add(g),this.dirty=!0,g}removeFrame(m){this.scene.remove(m),m.dispose(),this.dirty=!0}forgetPicks(){for(let{box:m}of this.picks.values())this.removeFrame(m);this.picks.clear()}dimensionsOf(m){let g=this.boundsOf(m).getSize(new Z);return[g.x,g.y,g.z]}boundsOf(m){let g=new yt,_=new Z;for(let{mesh:x,from:y,end:v}of this.piecesOf(m)){let b=this.byNumber.get(x);if(!b)continue;let S=b.geometry.getAttribute("position"),M=b.userData.indices??b.geometry.getIndex().array;for(let w=y*3;w<v*3;w++)g.expandByPoint(_.fromBufferAttribute(S,M[w]))}return g}solidAt(m){let g=m.object.material;if(!g.alphaTest||!g.map||!m.uv)return!0;let _=this.alphaOf.get(g.map);if(_===void 0){if(_=g.map.image instanceof ImageBitmap?ew(g.map.image):null,this.alphaOf.set(g.map,_),_)this.usedBytes+=_.data.byteLength}if(!_)return!0;let x=Math.floor((m.uv.x-Math.floor(m.uv.x))*_.width),y=Math.floor((m.uv.y-Math.floor(m.uv.y))*_.height);return _.data[(y*_.width+x)*4+3]/255>=g.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;if(this.marking){let _=this.brushAt();if(_)this.marking(_.x,_.z)}let m=Wg("map2lap.hover",()=>this.hit()),g=m?this.describe(m):null;if(this.moveTool)this.renderer.domElement.style.cursor=g?.id&&this.canMove(this.rootOf(g.id))?"grab":"";this.onHover(g)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let m=this.picker.intersectObjects(this.meshes.filter((g)=>g.visible),!1).find((g)=>this.solidAt(g));return this.wireNear(m?.distance??1/0)??m}wireNear(m){let{ray:g}=this.picker,_=this.renderer.domElement.clientHeight||1,x=2*Math.tan(Li.degToRad(this.camera.fov)/2)/_*WM,y=new Z,v=new Z,b=new Z,S=new Z,M,w=m;for(let E of this.meshes){if(!E.visible||!VM.test(E.name))continue;let A=E.geometry.boundingSphere,T=g.direction.dot(A.center.clone().sub(g.origin));if(g.distanceSqToPoint(A.center)>(A.radius+Math.max(T,0)*x)**2)continue;let R=E.geometry.getIndex().array,P=E.geometry.getAttribute("position");for(let N=0;N*3<R.length;N+=XM){if(R[N*3]===R[N*3+1])continue;y.fromBufferAttribute(P,R[N*3]),v.fromBufferAttribute(P,R[N*3+1]);let C=g.distanceSqToSegment(y,v,b,S),I=b.distanceTo(g.origin);if(I<w&&C<=(I*x)**2)w=I,M={distance:I,point:S.clone(),object:E,faceIndex:N}}}return M}describe(m){let g=this.data,_=m.object,x=_.userData.info,y=g.materials[x.material],v=g.textures.find((I)=>I.name===y.texture),{x:b,y:S,z:M}=m.point,w=m.faceIndex??0,E=m.uv?[m.uv.x,m.uv.y]:null,A=x.first_face!==null&&x.first_face!==void 0,T=A?Br(w,x.first_face):null,R=Sd(this.objectPieces.get(x.i),w),P=R?g.objects[R.slice(0,R.lastIndexOf("#"))]:null,N=R?Number(R.slice(R.lastIndexOf("#")+1)):-1,C=A||!!P&&["tree","bush"].includes(P.kinds[N]);return{id:R??(T!==null?`${x.base}#${T}`:null),kind:R?zo(P.kinds[N]):wd(x.name),sprite:C&&E?$l(g.atlas,E[0],E[1]):null,sort:R&&!C?kr(P,N):null,object:x.name,physics:Md(x.name),material:y.name,shader:y.shader,texture:y.texture,textureBytes:v?.size??null,vertices:x.vertices,triangles:x.indices/3,triangle:w,uv:E,shownTo:x.lod_out,billboard:A?this.billboard(_,x,w):null,at:[b,S,M],tile:yd(b,M),route:Bo(g.route,b,M),latLon:g.anchor?vd(g.anchor,b,S,M):null,distance:m.distance}}billboard(m,g,_){let x=g.first_face,y=Br(_,x),[v,b]=ko(y,x,g.indices/3);if(b-v<8)return{number:y,height:null,width:null,foot:null};let S=m.geometry.getIndex(),M=m.geometry.getAttribute("position"),w=new yt,E=new Z,A=new Z;for(let R=v*3;R<b*3;R++)if(E.fromBufferAttribute(M,S.getX(R)),w.expandByPoint(E),R===v*3)A.copy(E);E.fromBufferAttribute(M,S.getX(v*3+1));let T=w.getCenter(new Z);return{number:y,height:w.max.y-w.min.y,width:A.distanceTo(E),foot:[T.x,T.z]}}flyKeys(m){m.tabIndex=0,m.addEventListener("pointerdown",(g)=>{if(m.focus({preventScroll:!0}),g.button!==Hn)this.stopRide()}),m.addEventListener("keydown",(g)=>{if(!kM.has(g.code)||g.ctrlKey||g.metaKey||g.altKey)return;g.preventDefault(),this.stopRide(),this.flying.add(g.code)}),m.addEventListener("keyup",(g)=>this.flying.delete(g.code)),m.addEventListener("blur",()=>this.flying.clear())}fly(m){let g=this.camera.position,_=this.camera.getWorldDirection(new Z).setY(0).normalize(),x=new Z().crossVectors(_,this.camera.up).normalize(),y=new Z;if(this.flying.has("KeyW"))y.add(_);if(this.flying.has("KeyS"))y.sub(_);if(this.flying.has("KeyD"))y.add(x);if(this.flying.has("KeyA"))y.sub(x);if(!y.lengthSq())return;let v=Math.min(PM,Math.max(CM,this.height*RM));g.add(y.normalize().multiplyScalar(v*this.settings.fly/d*m)),this.keepInArea();let b=this.groundBelow();if(b!==null)g.y+=(b+this.clearance-g.y)*(1-Math.exp(-m/Bg));this.settle(b),this.moved()}turn(m,g,_,x){let y=this.camera.getWorldDirection(new Z),v=new Wa().setFromVector3(y);v.theta+=_,v.phi=Li.clamp(v.phi-x,Math.PI/2+Lg,Math.PI-Lg),y.setFromSpherical(v);let b=this.camera.position;b.copy(m).addScaledVector(y,-g),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(b.clone().add(y)),this.moved()}groundAlong(m,g){return this.down.set(m,g),Wg("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let m=this.camera.position;return this.groundAlong(new Z(m.x,m.y+Uh,m.z),new Z(0,-1,0))?.point.y??null}wayDown(m){return Math.max(this.camera.position.y-this.lastGround,0)/-m.y}reachOfLook(){return Math.max(yM,this.height*xM)}intoArea(m){let{minX:g,maxX:_,minZ:x,maxZ:y}=this.area;m.x=Li.clamp(m.x,g-Ml,_+Ml),m.z=Li.clamp(m.z,x-Ml,y+Ml)}keepInArea(){let m=this.camera.position,g=this.camera.getWorldDirection(new Z),_=m.clone().addScaledVector(g,Math.min(this.wayDown(g),this.reachOfLook())),x=_.clone();this.intoArea(x),m.x+=x.x-_.x,m.z+=x.z-_.z}settle(m){this.keepInArea(),this.keepHeight(m===void 0?this.groundBelow():m)}keepHeight(m){if(m!==null)this.lastGround=m;let g=this.camera.position;g.y=Li.clamp(g.y,this.lastGround+gM,this.lastGround+this.highest),this.height=g.y-this.lastGround}home(){if(!this.data)return;this.ride=null,this.onRideMoving(!1),this.placeCamera(this.data),this.moved(),this.tellRideMetre()}setRide(m,g){this.rideSpeed=m,this.rideHeight=g}setRideWatch(m,g){this.onRideMoving=m,this.onRideMetre=g}tellRideMetre(){let m=this.camera.position;this.onRideMetre(Bo(this.data?.route??[],m.x,m.z)?.metre??null)}rideLook(m,g){let _=this.data.route,[x,y]=Pr(_,g,m),[v,b]=Pr(_,g,m+Fg),[S,M]=Pr(_,g,m-Fg);return(v!==x||b!==y?new Z(v-x,0,b-y):new Z(x-S,0,y-M)).normalize().setY(-NM).normalize()}onRoute(){if(this.ride)return this.ride;let m=this.data?.route??[],g=this.camera.position,_=Ig(m),x=Bo(m,g.x,g.z)?.metre;if(x===void 0||!_[_.length-1])return null;this.flying.clear(),this.zoomLeft=0,this.ride={metre:x,metres:_,left:0,moving:!1},[g.x,g.z]=Pr(m,_,x);let y=this.groundBelow();if(y!==null)this.lastGround=y;return g.y=this.lastGround+this.rideHeight,this.keepHeight(y),this.camera.lookAt(g.clone().add(this.rideLook(x,_))),this.moved(),this.onRideMetre(x),this.ride}rideBy(m){let g=this.onRoute();if(g)g.left+=m;return!!g}toggleRide(){let m=this.onRoute();if(!m)return!1;if(!m.moving&&m.metre>=m.metres[m.metres.length-1])m.metre=0;return m.moving=!m.moving,this.onRideMoving(m.moving),!0}stopRide(){if(!this.ride)return;this.ride=null,this.clearance=this.height,this.onRideMoving(!1),this.tellRideMetre()}rideOn(m){let g=this.ride,{metres:_}=g,x=_[_.length-1],y=this.camera.position,v=performance.now(),b=Math.abs(g.left)<OM?g.left:g.left*(1-Math.exp(-m/DM)),S=g.metre;if(g.left-=b,g.metre=Li.clamp(S+b+(g.moving?this.rideSpeed*m:0),0,x),g.metre<=0||g.metre>=x)g.left=0;if(g.moving&&g.metre>=x)g.moving=!1,this.onRideMoving(!1);let M=this.camera.getWorldDirection(new Z),w=this.rideLook(g.metre,_),E=g.metre!==S,A=M.distanceToSquared(w)>UM,T=Math.abs(y.y-this.lastGround-this.rideHeight)>FM;if(!E&&!A&&!T)return;if(E||T){[y.x,y.z]=Pr(this.data.route,_,g.metre);let R=this.groundBelow();if(R!==null)y.y+=(R+this.rideHeight-y.y)*(1-Math.exp(-m/Bg));this.keepHeight(R)}if(this.camera.lookAt(y.clone().add(M.lerp(w,1-Math.exp(-m/LM)))),this.moved(),v-this.rideTold>=BM||!g.left&&!g.moving)this.rideTold=v,this.onRideMetre(g.metre)}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let m=this.host.clientWidth,g=this.host.clientHeight;if(!m||!g)return;this.renderer.setSize(m,g),this.camera.aspect=m/g,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let m=performance.now(),g=Math.min(IM,(m-this.lastFrame)/1000);if(this.lastFrame=m,this.shown&&this.ride)this.rideOn(g);if(this.shown&&this.flying.size)this.fly(g);if(this.shown&&this.zoomLeft)this.glideZoom(g);if(!this.shown)return;if(this.followCopy(),this.dirty){this.dirty=!1;for(let _ of this.meshes){let x=this.camera.position.distanceTo(_.geometry.boundingSphere.center);_.visible=x>=_.userData.lodIn&&x<_.userData.lodOut}this.surfaceOverlay?.follow(),this.roadRegionOverlay?.follow(),this.roadInfluenceOverlay?.follow(),this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&m-this.lastHover>=zM)this.hoverDue=!1,this.lastHover=m,this.hover();if(this.markDue&&m-this.lastMark>=this.markEvery){let _=performance.now();this.frameMarked(),this.lastMark=m,this.markEvery=Math.max(zg,4*(performance.now()-_))}}clear(){this.paintVersion++,this.paintLoading?.abort();for(let m of this.textureChanges.values())m.abort();this.textureChanges.clear(),this.displayedTextures.clear(),this.paintFailure=null,this.loadedTexture=null;for(let m of this.splatImages.values())this.disposeSplatImage(m);this.splatImages.clear(),this.splatBindings.clear(),this.splatPending.clear(),this.sourceMaterials.clear(),this.surfaceOverlay?.clear(),this.roadRegionOverlay?.clear(),this.roadInfluenceOverlay?.clear(),this.setCopy(null,null),this.copyVersion++,this.copyLoading?.abort(),this.stopRide();for(let m of this.meshes)this.scene.remove(m),m.geometry.boundsTree=void 0,m.geometry.dispose();for(let m of this.textures)m?.then((g)=>{if(!g)return;let _=g.image;if(g.dispose(),_ instanceof ImageBitmap)_.close()},()=>{});for(let m of this.materials)m?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.pendingPivots.clear(),this.materialAreas?.clear(),this.objectPieces=new Map,this.belonging=new Map,this.forgetPicks()}texture(m,g,_){let x=this.textures[_];if(!x){let y={...g.textures[_]};if(y.layers)y.version="",y.size=y.source_size??y.size;let v=Bi*y.size,b=this.token;if(!Qn(this.usedBytes,v,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=v;let S=this.renderer.capabilities.getMaxAnisotropy(),M=this.loading.signal,w=v,E=y.version??"";x=Gh(async()=>{let A;try{A=await ki(`/api/editor/${encodeURIComponent(m)}/texture/${_}?r=${g.revision}${y.version?`&p=${y.version}`:""}`,M)}catch(T){if(!y.version||M.aborted||b!==this.token)throw T;this.onViewFailed(`A material edit could not be shown: ${String(T)}. Its original texture is shown; you can discard the edit.`),E="",A=await ki(`/api/editor/${encodeURIComponent(m)}/texture/${_}?r=${g.revision}`,M)}return Vh(A,y.name,S,y.linear)}).then((A)=>{if(typeof ImageBitmap<"u"&&A.image instanceof ImageBitmap&&b===this.token){let T=Vl(A.image.width,A.image.height)-v;if(!Qn(this.usedBytes,T,this.settings.memoryGb))return this.usedBytes-=v,this.overLimit=!0,A.dispose(),A.image.close(),null;this.usedBytes+=T,w+=T}if(b===this.token)this.textureBytes.set(A,w),(this.displayedTextures??=new Map).set(_,E);return A}).then((A)=>{if(b===this.token)this.loadedTexture?.();return A}),this.textures[_]=x}return x}textureVersion(m){return this.displayedTextures?.get(m)??""}refreshPaints(m,g){if(this.paintFailure=null,this.paintVersion++,this.paintLoading?.abort(),!this.data)return;this.ensureSplatState(),this.data.paints=g;let _=new Set(m.filter((v)=>v.version).map((v)=>v.i)),x=[...m],y=new Set(m.map((v)=>v.i));this.data.textures.forEach((v,b)=>{if(v.version&&!_.has(b)&&!y.has(b))x.push({i:b,size:v.source_size??v.size,version:""})});for(let v of x){let b=this.data.textures[v.i];if(!b)continue;if(v.layers||b.layers)this.refreshSplat(v);else this.refreshTexture(v)}}async syncPaints(m){let g=this.data;if(!g||!this.paintFailure&&JSON.stringify(g.paints??[])===JSON.stringify(m))return;let _=++this.paintVersion,x=this.token;this.paintLoading?.abort();let y=this.paintLoading=new AbortController;try{let v=await fetch(`/api/editor/${encodeURIComponent(this.trackName)}/textures`,{method:"POST",signal:y.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({base:g.revision,paints:m})}),b=await v.json();if(!v.ok)throw Error(b.error??"Could not read ground materials");if(y.signal.aborted||x!==this.token||_!==this.paintVersion)return;let S=new Set(b.textures.map((M)=>M.i));g.textures.forEach((M,w)=>{if(M.version&&!S.has(w))b.textures.push({i:w,size:M.source_size??M.size,version:""})}),this.paintFailure=null,this.refreshPaints(b.textures,m)}catch(v){if(!y.signal.aborted&&x===this.token)this.onViewFailed(v instanceof Error?v.message:"Could not read ground materials")}}async texturesReady(){if(await Promise.all([...this.textureChanges.values()].map((m)=>m.done)),await Promise.all([...this.splatPending?.values()??[]].map((m)=>m.done)),this.paintFailure)throw Error(this.paintFailure)}ensureSplatState(){this.splatImages??=new Map,this.splatBindings??=new Map,this.splatPending??=new Map,this.sourceMaterials??=new Map}disposeSplatImage(m){if(m.disposed)return;if(m.disposed=!0,m.controller.abort(),m.token===this.token)this.usedBytes-=m.bytes;if(m.texture?.dispose(),typeof ImageBitmap<"u"&&m.texture?.image instanceof ImageBitmap)m.texture.image.close()}pruneSplatImages(){let m=new Set([...this.splatBindings.values(),...[...this.splatPending.values()].map((g)=>g.keys)].flatMap((g)=>[...g]));for(let[g,_]of this.splatImages)if(!m.has(g))this.splatImages.delete(g),this.disposeSplatImage(_)}splatTexture(m,g,_){if(!m.url){let E=m.i??g.textures.findIndex((A)=>A.name===m.name);return E<0?Promise.resolve(null):this.texture(this.trackName,g,E)}let x=`${m.linear?"mask":"colour"}:${m.key??m.url}`;_.add(x);let y=this.splatImages.get(x);if(y)return y.done;let v=Bi*(m.size??0),b=this.token;if(!v||!Qn(this.usedBytes,v,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=v;let S=new AbortController,M={done:Promise.resolve(null),controller:S,bytes:v,token:b,disposed:!1};this.splatImages.set(x,M);let w=AbortSignal.any([S.signal,this.loading.signal]);return M.done=Gh(async()=>{if(w.aborted)return null;let E=await ki(m.url,w);if(w.aborted)return null;return Vh(E,m.name,this.renderer.capabilities.getMaxAnisotropy(),m.linear)}).then((E)=>{if(M.disposed||b!==this.token)return E?.dispose(),null;if(E)M.texture=E,this.loadedTexture?.();return E}).catch((E)=>{if(this.splatImages.get(x)===M)this.splatImages.delete(x);throw this.disposeSplatImage(M),E}),M.done.catch(()=>{}),M.done}prepareSplat(m,g,_,x){this.ensureSplatState();let y=this.data,v=this.token,b=new Set,S={keys:b,done:Promise.resolve()};this.splatPending.set(m,S);let M=()=>v===this.token&&this.splatPending.get(m)===S&&!this.loading.signal.aborted,w=this.splatTexture(_.base,y,b);w.then((T)=>{if(T&&M())g.map=T,g.needsUpdate=!0,this.dirty=!0},()=>{});let E=this.splatTexture(_.mask,y,b),A=_.images.map((T)=>this.splatTexture(T,y,b));this.pruneSplatImages(),S.done=Promise.all([w,E,...A]).then(([T,R,...P])=>{if(!M())return;if(!T||!R||P.some((N)=>!N))throw Error("Not enough editor memory for this material. Increase the limit and reopen the track.");g.map=T,Rg(g,R,P,_),this.splatBindings.set(m,b),x(),this.dirty=!0}).catch((T)=>{if(M())this.paintFailure=T instanceof Error?T.message:"Could not load this material",this.onViewFailed(this.paintFailure)}).finally(()=>{if(this.splatPending.get(m)===S)this.splatPending.delete(m);if(v===this.token){if(this.materials[m]!==g)g.dispose();this.pruneSplatImages()}})}refreshSplat(m){let g=this.data,_=g.textures[m.i],x=_.layers;if(_.version===m.version&&this.textureVersion(m.i)===m.version&&!!x===!!m.layers)return;let y=m.materials??m.layers?.materials??x?.materials??[];Object.assign(_,{version:m.version,size:m.size,layers:m.layers});for(let v of y){let b=this.sourceMaterials.get(v)??g.materials[v].source??g.materials[v];this.sourceMaterials.set(v,b);let S=this.materials[v];if(!m.layers){this.splatPending.delete(v),this.splatBindings.delete(v),g.materials[v]=b,this.materials[v]=void 0;let M=S?this.material(this.trackName,g,v):null;for(let w of this.meshes)if(w.userData.info.material===v&&M)w.material=M;S?.dispose(),this.displayedTextures.set(m.i,"")}else if(!S)g.materials[v]={...b,splat:m.layers};else{let M=S.clone(),w=m.layers;this.prepareSplat(v,M,w,()=>{let E=this.materials[v];this.materials[v]=M,g.materials[v]={...b,splat:w};for(let A of this.meshes)if(A.userData.info.material===v)A.material=M;E?.dispose(),this.displayedTextures.set(m.i,m.version),this.onTexturesChanged?.()})}}if(this.pruneSplatImages(),this.dirty=!0,!m.layers)this.onTexturesChanged?.()}refreshTexture(m){let g=this.data,_=g?.textures[m.i];if(!g||!_||this.textureChanges.get(m.i)?.version===m.version)return;if((_.version??"")===m.version&&(!this.textures[m.i]||this.textureVersion(m.i)===m.version))return;Object.assign(_,{version:m.version,size:m.size}),this.textureChanges.get(m.i)?.abort();let x=this.textures[m.i];if(!x)return;let y=this.token,v=new AbortController,b=0,S=()=>{if(y===this.token)this.usedBytes-=b;b=0},M={abort:()=>{v.abort(),S()},done:Promise.resolve(),version:m.version};this.textureChanges.set(m.i,M);let w=AbortSignal.any([v.signal,this.loading.signal]),E=()=>!w.aborted&&y===this.token&&this.textureChanges.get(m.i)===M;M.done=(async()=>{let A=null;try{let T=await x;if(!T||!E())return;if(A=await Gh(async()=>{if(!E())return null;let N=Bi*m.size;if(!Qn(this.usedBytes,N,this.settings.memoryGb))throw Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");this.usedBytes+=N,b=N;let C=await ki(`/api/editor/${encodeURIComponent(this.trackName)}/texture/${m.i}?r=${g.revision}${m.version?`&p=${m.version}`:""}`,w);if(!E())return null;return Vh(C,_.name,this.renderer.capabilities.getMaxAnisotropy(),_.linear)}),!A||!E())return;if(typeof ImageBitmap<"u"&&A.image instanceof ImageBitmap){let N=Vl(A.image.width,A.image.height)-b;if(!Qn(this.usedBytes,N,this.settings.memoryGb))throw Error("Not enough editor memory to update this ground texture. Increase the memory limit and reopen the track.");this.usedBytes+=N,b+=N}let R=T.image;this.usedBytes-=this.textureBytes.get(T)??0,this.textureBytes.set(T,b),b=0;let P=this.alphaOf.get(T);if(P)this.usedBytes-=P.data.byteLength;this.alphaOf.delete(T),T.dispose(),T.copy(A),T.needsUpdate=!0;for(let N of this.materials)if(N?.map===T)N.needsUpdate=!0;if(typeof ImageBitmap<"u"&&R instanceof ImageBitmap)R.close();A=null,(this.displayedTextures??=new Map).set(m.i,m.version),this.onTexturesChanged?.(),this.dirty=!0}catch(T){if(E())this.paintFailure=T instanceof Error?T.message:"Could not update ground materials",this.onViewFailed(this.paintFailure)}finally{if(A){if(A.dispose(),typeof ImageBitmap<"u"&&A.image instanceof ImageBitmap)A.image.close()}if(S(),this.textureChanges.get(m.i)===M)this.textureChanges.delete(m.i)}})()}material(m,g,_){let x=this.materials[_];if(x)return x;let y=g.materials[_],v=Math.min(1,y.bright);if(this.ensureSplatState(),!this.sourceMaterials.has(_))this.sourceMaterials.set(_,y.source??y);let b=new Ua({color:new st(v,v,v)});if(y.alpha_ref>0)b.alphaTest=y.alpha_ref;if(y.blend)b.transparent=!0,b.depthWrite=!1;if(this.materials[_]=b,y.splat)return this.prepareSplat(_,b,y.splat,()=>{let M=y.splat.base.i??g.textures.findIndex((w)=>w.name===y.splat.base.name);if(M>=0)this.displayedTextures.set(M,g.textures[M].version??"");this.onTexturesChanged?.()}),b;if(y.dual_layer){let M=this.token,w=y.dual_layer,E=(P)=>{let N=g.textures.findIndex((C)=>C.name===P);return N<0?Promise.resolve(null):this.texture(m,g,N)},A=E(w.base),T=E(w.mask),R=E(y.texture);return A.then((P)=>{if(P&&M===this.token)b.map=P,b.needsUpdate=!0,this.dirty=!0},()=>{}),Promise.all([A,T,R]).then(([P,N,C])=>{if(!P||!N||!C||M!==this.token)return;b.map=C,Cg(b,P,N,w.scale),this.dirty=!0},()=>{}),b}let S=g.textures.findIndex((M)=>M.name===y.texture);if(S>=0){let M=this.token;this.texture(m,g,S).then((w)=>{if(!w||M!==this.token)return;if(b.map=w,y.world_scale)Pg(b,y.world_scale);b.needsUpdate=!0,this.dirty=!0},()=>{})}return b}addMesh(m,g,_,x){if(this.byNumber.has(_.i))return;let y=new Xt(ow(_,x),this.material(m,g,_.material));if(y.userData={lodIn:_.lod_in,lodOut:_.lod_out,info:_},y.name=_.name,this.scene.add(y),this.meshes.push(y),_.base!==null&&_.base!==void 0){if(!this.parts.has(_.base))this.parts.set(_.base,[]);this.parts.get(_.base).push(y)}if(this.byNumber.set(_.i,y),!ns(_.name)&&_.first_face==null&&(this.objectPieces.has(_.i)||/^nocol_road_edge_dirt_/.test(_.name)))this.materialAreas??=new Map,this.materialAreas.set(_.i,new Dh(y.geometry.getAttribute("position"),y.userData.indices??y.geometry.getIndex().array,this.objectPieces.get(_.i)??[]));this.surfaceOverlay?.add(y).catch((v)=>this.surfaceFailed(String(v.message??v))),this.roadRegionOverlay?.add(y).catch((v)=>this.onViewFailed(String(v.message??v))),this.roadInfluenceOverlay?.add(y).catch((v)=>this.onViewFailed(String(v.message??v))),this.laidOver(_.i);for(let v of this.listedOut.get(_.i)??[])this.leaveOutIn(y,v,!0);if(_.base!==null&&_.base!==void 0){for(let v of this.billboardsOut.get(_.base)??[])for(let b of this.piecesOf(v))if(b.mesh===_.i)this.leaveOutIn(y,b,!0);this.leaveOutSorts(y)}if(this.marked)this.markDue=!0;if(Bh.test(_.name)){this.groundVersion++,this.usedBytes+=nw(y),this.grounds.push(y);let v=y.geometry.boundingBox,b=this.camera.position;if(b.x>=v.min.x&&b.x<=v.max.x&&b.z>=v.min.z&&b.z<=v.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(m){let g=new Z,_=new Z(0,0,1);if(m.start)g.set(...m.start.pos),_.set(...m.start.forward).normalize();else if(m.meshes.length){for(let S of m.meshes)g.add(new Z(...S.center));g.divideScalar(m.meshes.length)}this.camera.position.copy(g).addScaledVector(_,-pM).add(new Z(0,Fh,0)),this.camera.lookAt(g),this.camera.updateMatrixWorld(),this.clearance=this.height=Fh,this.lastGround=g.y,this.zoomLeft=0,this.area=Hl(m.meshes.filter((S)=>!mM.test(S.name)));let{minX:x,maxX:y,minZ:v,maxZ:b}=this.area;this.highest=Math.min(AM,Math.max(Ug,y-x,b-v))}}function aw({name:m,title:g,taken:_,built:x,visible:y,controls:v,fileHost:b,savedHost:S,toolsHost:M,notesHost:w,onStatus:E,onSaved:A}){let T=s(null),R=s(null),[P,N]=n(null),[C,I]=n(null),[L,U]=n(null),[O,F]=n(320),[k,D]=n(!1);return i(()=>{let B=new Wh(T.current);return B.setHover(I),N(B),()=>{B.dispose(),N(null)}},[]),i(()=>{P?.show(y)},[P,y]),i(()=>{P?.setControls(v)},[P,v]),i(()=>{P?.open(m,E)},[P,m,x,E]),e("div",{className:Nr.layout,hidden:!y,style:{"--inspector-space":m&&!k?`min(${O+5}px, 48%)`:"0px"},children:[e("div",{id:"scene",className:Nr.scene,ref:R,children:[t("div",{className:Nr.view,ref:T}),P&&m&&t(Om,{name:m,title:g,taken:_,view:P,scene:R,fileHost:b,savedHost:S,toolsHost:M,notesHost:w,elevationSpeed:v.elevationSpeed,inspectorHost:L,hovered:C,inspectorWidth:O,onInspectorWidth:F,inspectorCollapsed:k,onInspectorCollapsed:D,reopen:()=>void P.open(m,E),onSaved:A},`${m} ${x}`)]}),t("div",{className:Nr.inspectorHost,ref:U})]})}export{aw as default};
