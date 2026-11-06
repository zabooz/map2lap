import{a,i,l,s,n,f,r,o,t,e,u,c,h}from"./chunk-wf51kyen.js";var Wa={scene:"scene_u4kRgA",view:"view_u4kRgA"};var Xa={removed:[],sorts:[],objectSorts:[],heights:[]},vi=(d,p)=>{let m=new Set(d),g=new Set(p);return m.size===g.size&&[...m].every((_)=>g.has(_))};function jr(d){let p=d.recipe;return!!p&&vi(d.removed.map((m)=>m.id),p.deleted)&&vi(d.sorts,p.sorts)&&vi(d.objectSorts,p.objectSorts)&&vi(d.heights.map((m)=>m.id),p.heights)}var or=null,um=(d,p)=>vi(d.removed.map((m)=>m.id),p.removed.map((m)=>m.id))&&vi(d.sorts,p.sorts)&&vi(d.objectSorts,p.objectSorts)&&vi(d.heights.map((m)=>m.id),p.heights.map((m)=>m.id));class qa{now={...Xa,keptRevision:0,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];listeners=new Set;url;send;name;constructor(d,p=(m,g)=>fetch(m,g)){this.name=d,this.url=`/api/editor/${encodeURIComponent(d)}/edits`,this.send=p}markSaved(){let d=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:d.removed.map((p)=>p.id),sorts:d.sorts,objectSorts:d.objectSorts,heights:d.heights.map((p)=>p.id)}})}inTurn(d){return this.turns=this.turns.then(d).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(d){this.onMeshes=d}handOver(d){or={name:d,edits:this.edits(),past:this.past,future:this.future}}subscribe=(d)=>(this.listeners.add(d),()=>{this.listeners.delete(d)});state=()=>this.now;set(d){this.now={...this.now,...d};for(let p of this.listeners)p()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(d){this.held=d,this.set({})}bind(d){this.bound=d,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:"This track was built again: the view shows the build before."});else if(this.now.error==="This track was built again: the view shows the build before.")this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let d=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let p=await this.send(this.url),m=await p.json();if(d!==this.asked)return;if(!p.ok)throw Error(m.error??`${p.status}`);this.base=m.base,this.revision=m.revision;let g={removed:m.deleted,sorts:m.sorts??[],objectSorts:m.object_sorts??[],heights:m.heights??[]},_=or?.name===this.name&&um(or.edits,g)?or:null;or=null,this.past=_?.past??[],this.future=_?.future??[],this.onServer=g,this.unanswered=[];let x=m.saved,v=x?{at:x.at,deleted:x.deleted,sorts:x.sorts,objectSorts:x.object_sorts,heights:x.heights??[]}:null;this.set({...g,keptRevision:m.revision,recipe:v,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:m.outdated,save:"saved"}),this.compare()}catch(p){if(d===this.asked)this.set({save:"stuck",error:p.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((d)=>setTimeout(d,50));return this.isSaved()?this.revision:null}saveNow(d=!1){clearTimeout(this.timer),this.flush(d)}remove(d){let p=new Set(this.now.removed.map((m)=>m.id));this.change({...this.edits(),removed:[...this.now.removed,...d.filter((m)=>!p.has(m.id))]})}removeSort(d){if(!this.now.sorts.includes(d))this.change({...this.edits(),sorts:[...this.now.sorts,d]})}removeObjectSort(d){if(!this.now.objectSorts.includes(d))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,d]})}addHeight(d){this.change({...this.edits(),heights:[...this.now.heights,d]})}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0}discard(){if(this.changed())this.change(Xa)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights}}discardOutdated(){this.onServer=null,this.set({outdated:0,...Xa}),this.saveNow()}undo(){if(!this.canEdit())return;let d=this.past.pop();if(!d)return;this.future.push(this.edits()),this.apply(d)}redo(){if(!this.canEdit())return;let d=this.future.pop();if(!d)return;this.past.push(this.edits()),this.apply(d)}change(d){if(!this.canEdit())return;if(this.past.push(this.edits()),this.past.length>200)this.past.shift();this.future=[],this.apply(d)}apply(d){let p=d.heights===this.now.heights?400:0;this.set({...d,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),p)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights}async flush(d=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!d||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let p=this.edits(),m=++this.sent,g=`${Date.now()}-${m}-${Math.random().toString(36).slice(2,10)}`,_=JSON.stringify({base:this.bound,revision:this.revision,deleted:p.removed,sorts:p.sorts,object_sorts:p.objectSorts,heights:p.heights,id:g,unanswered:this.unanswered.map((x)=>x.id)});this.unanswered=[...this.unanswered,{id:g,number:m}].slice(-64),this.sending=!0,this.set({save:"saving"});try{let x=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:_,keepalive:d&&_.length<60000}),v=await x.json().catch(()=>({}));if(m>=this.sent)this.sending=!1;if(m<this.answered)return;if([400,404,409,413].includes(x.status))return this.sending=!1,this.set({save:"stuck",error:x.status===409?"This track was changed elsewhere: another tab or a build.":v.error??`${x.status}`});if(!x.ok)throw Error(v.error??`${x.status}`);if(this.answered=m,this.revision=v.revision,this.onServer=p,this.unanswered=this.unanswered.filter((y)=>y.number>m),this.onMeshes(v.meshes??[],v.revision),this.set({keptRevision:v.revision}),!this.isSaved())return void this.flush(d);if(!this.sending)this.set({save:"saved",error:null})}catch(x){if(m>=this.sent)this.sending=!1;if(this.set({save:"failed",error:x.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),5000)}}}var ve={bar:"bar_0bCY9g",row:"row_0bCY9g",history:"history_0bCY9g",on:"on_0bCY9g",toolName:"toolName_0bCY9g",number:"number_0bCY9g",split:"split_0bCY9g",state:"state_0bCY9g",line:"line_0bCY9g"};function Ya(d){let p={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[m,,g],radius:_}of d)p.minX=Math.min(p.minX,m-_),p.maxX=Math.max(p.maxX,m+_),p.minZ=Math.min(p.minZ,g-_),p.maxZ=Math.max(p.maxZ,g+_);return d.length?p:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function Za(d,p){let m=new Map(d.map((g)=>[g,Math.hypot(g.center[0]-p[0],g.center[1]-p[1],g.center[2]-p[2])-g.radius]));return[...d].sort((g,_)=>m.get(_)-m.get(g))}function Qr(d,p,m){return d+p<=m*1073741824}function Yh(d,p){return Math.round(d*p*4*2.333333333333333)}function Zh(d,p){return[Math.floor(d/256),Math.floor(-p/256)]}function $h(d,p,m){if(d.length<2)return null;let g=1/0,_=0,x=0;for(let v=0;v+1<d.length;v++){let[y,S]=d[v],b=d[v+1][0]-y,M=d[v+1][1]-S,T=b*b+M*M,E=Math.sqrt(T),w=T?Math.min(1,Math.max(0,((p-y)*b+(m-S)*M)/T)):0,C=Math.hypot(p-(y+w*b),m-(S+w*M));if(C<g)g=C,_=x+w*E;x+=E}return{metre:_,off:g}}function Jh([d,p],m,g,_){let x=Math.PI/180,v=m,y=-_,S=g,b=Math.sin(d*x),M=Math.cos(d*x),T=Math.sin(p*x),E=Math.cos(p*x),w=6378137/Math.sqrt(1-0.0066943799901413165*b*b),C=w*M*E-T*v-b*E*y+M*E*S,N=w*M*T+E*v-b*T*y+M*T*S,A=w*0.9933056200098587*b+M*y+b*S,R=Math.hypot(C,N),I=Math.atan2(A,R*0.9933056200098587);for(let U=0;U<5;U++){let L=Math.sin(I);I=Math.atan2(A+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*L*L))*L,R)}return[I/x,Math.atan2(N,C)/x]}function ar(d,p){return Math.floor((p+d)/8)}function to(d,p,m){return[Math.max(0,d*8-p),Math.min(m,(d+1)*8-p)]}var fm={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},$a=(d)=>fm[d]??d,pm={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},ds=(d)=>pm[d]??$a(d),Kh=new Set(["house"]),eo=(d,p)=>d.sorts?.[p]??d.kinds[p];function Ja(d,p){let m=[];if(!p.size)return m;for(let[g,_]of Object.entries(d))_.kinds.forEach((x,v)=>{if(p.has(eo(_,v)))m.push(`${g}#${v}`)});return m}function jh(d,p){let m=new Set,g=[...d];while(g.length){let _=g.pop();if(m.has(_))continue;m.add(_),g.push(...p.get(_)??[])}return m}function Qh(d,p,m){let g=0;for(let[_,x]of Object.entries(d))x.kinds.forEach((v,y)=>{if(eo(x,y)===p&&x.faces[y].length&&!m.has(`${_}#${y}`))g++});return g}function tu(d){let p=new Map;for(let[m,g]of Object.entries(d)){g.parents.forEach((_,x)=>{if(_<0)return;let v=`${m}#${_}`;if(!p.has(v))p.set(v,[]);p.get(v).push(`${m}#${x}`)});for(let[_,x]of Object.entries(g.with??{})){let v=`${m}#${_}`;p.set(v,[...p.get(v)??[],...x])}}return p}function eu(d){let p=new Map;for(let[m,g]of Object.entries(d))g.faces.forEach((_,x)=>{for(let[v,y,S]of _){if(!p.has(v))p.set(v,[]);p.get(v).push({from:y,end:y+S,id:`${m}#${x}`})}});for(let m of p.values())m.sort((g,_)=>g.from-_.from);return p}function nu(d,p){let m=0,g=(d?.length??0)-1;while(m<=g){let _=m+g>>1,x=d[_];if(p<x.from)g=_-1;else if(p>=x.end)m=_+1;else return x.id}return null}function Ka(d,p,m){let g=Math.floor((p-Math.floor(p))*d.cols),_=Math.floor((m-Math.floor(m))*d.rows);return d.sprites[_*d.cols+g]??null}var mm=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],gm=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function iu(d){return mm.find(([p])=>p.test(d))?.[1]??"Unknown"}function su(d){return gm.find(([p])=>p.test(d))?.[1]??d}var Hi={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function xm(d,p){for(let m=1;;m++){let g=`${d} (copy${m>1?` ${m}`:""})`;if(!p.includes(g))return g}}function ru({title:d,taken:p,canOverwrite:m,onOverwrite:g,onSaveNew:_,onCancel:x}){let[v,y]=n(d),S=v.trim(),b=S===d,M=!S?"Give it a name.":!b&&p.includes(S)?`Another track is called “${S}” already.`:null,T=b?xm(d,p):S;return i(()=>{let E=(w)=>{if(w.key==="Escape")x()};return document.addEventListener("keydown",E),()=>document.removeEventListener("keydown",E)},[x]),t("div",{id:"save-back",className:Hi.back,onMouseDown:(E)=>{if(E.target===E.currentTarget)x()},children:e("form",{id:"save-dialog",className:Hi.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(E)=>{if(E.preventDefault(),!M)_(T)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:Hi.field,children:["Name",t("input",{id:"save-name",type:"text",value:v,maxLength:80,autoFocus:!0,onChange:(E)=>y(E.target.value)})]}),t("p",{id:"save-taken",className:Hi.note,children:M??`Save as new track makes “${T}”. Whatever you delete can be brought back later.`}),e("div",{className:Hi.buttons,children:[t("button",{type:"button",onClick:x,children:"Cancel"}),t("button",{type:"button",disabled:!b||!m,onClick:g,children:"Overwrite"}),t("button",{type:"submit",className:Hi.primary,disabled:!!M,children:"Save as new track"})]})]})})}var ja=20;function ou(d,p,m){let g=0,_=1/0;return d.forEach(([x,,v],y)=>{let S=(x-p)**2+(v-m)**2;if(S<_)_=S,g=y}),g}function au(d,p,m,g){if(d.length<2)return[...d,[m,g]];if(!p?.length)return[...d.slice(0,-1),[m,g],d[d.length-1]];let _=ou(p,m,g);if(_===0)return[[m,g],...d];if(_===p.length-1)return[...d,[m,g]];let x=d.findIndex(([v,y])=>ou(p,v,y)>_);return x<0?[...d,[m,g]]:[...d.slice(0,x),[m,g],...d.slice(x)]}var vm=60,ym=1,lu=3,Sm=60,bm=5;function cu({name:d,view:p,edits:m,enabled:g,revision:_,onNote:x}){let[v,y]=n([]),[S,b]=n([]),[M,T]=n(null),[E,w]=n(null),[C,N]=n(0),[A,R]=n(null),[I,U]=n(50),L=A??C,D=(H="")=>`/api/editor/${encodeURIComponent(d)}/band${H}`,k=()=>{y([]),b([]),T(null),w(null),R(null)};i(()=>{if(v.length<2||v===S)return;let H=!1;return r(D("/way"),{base:m.boundRevision(),points:v}).then((z)=>{if(H)return;if(z.error||!z.line){x(z.error??"No road found"),y((W)=>S.length?S:W.slice(0,1));return}b(v),T(z.line),N(z.width??0),w(null),x(null)}),()=>{H=!0}},[v,m]),i(()=>{if(v.length!==1||!g){p.setMarking(null);return}let H=!1,z=!1,W=null,Z=(V,Q)=>{H=!0,r(D("/way"),{base:m.boundRevision(),points:[v[0],[V,Q]]}).then((it)=>{if(H=!1,z)return;if(w(it.line??null),W){let[j,xt]=W;W=null,Z(j,xt)}})};return p.setMarking((V,Q)=>{if(H)W=[V,Q];else Z(V,Q)}),()=>{z=!0,p.setMarking(null)}},[p,v,g,m]),i(()=>{let H=v.length?[[v[0][0],p.heightOfGround(v[0][0],v[0][1]),v[0][1]]]:null;return p.drawBand(M??E??H,M||E?L||lu:0),()=>p.drawBand(null,0)},[p,v,M,E,L]),i(()=>(p.drawPins(g?v.map(([H,z])=>[H,p.heightOfGround(H,z),z]):[]),()=>p.drawPins([])),[p,v,g]);let P=l((H,z,W)=>{y(v.map((Z,V)=>V===H?[z,W]:Z)),x(null)}),F=l((H)=>{let z=v.filter((W,Z)=>Z!==H);if(y(z),z.length<2)b([]),T(null),w(null);x(null)});return i(()=>(p.setPinned((H,z,W)=>P(H,z,W),(H)=>F(H)),()=>p.setPinned(()=>{},()=>{})),[p]),i(()=>{if(!M){p.takeBackPreview();return}let H=!1,z=(Z)=>{if(H)return;p.takeBackPreview(),x(Z)},W=setTimeout(()=>{fetch(D("/preview"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base:m.boundRevision(),points:S,width:L,strength:I/100})}).then(async(Z)=>{if(H)return;if(Z.ok){let V=await Z.arrayBuffer();if(!H)p.showPreview(V)}else z(String((await Z.json().catch(()=>null))?.error??Z.status))}).catch(()=>z("No preview: the server does not answer"))},vm);return()=>{H=!0,clearTimeout(W)}},[p,M,L,I,_,m]),{points:v,line:M,width:L,strength:I,clear:k,apply:()=>{if(!M)return!1;if(v!==S)return x("The way is still being found: press Enter again in a moment"),!0;let H={base:m.boundRevision(),points:S,width:L,strength:I/100};return p.keepPreview(),k(),m.inTurn(async()=>{let W=await m.saved()===null?{error:"the changes before it could not be kept"}:await r(D(),H);if(W.error||!("height"in W)||!W.height||!m.canEdit())return p.dropPreview(),x(`Not changed: ${W.error??"this track can't be changed now"}`);m.addHeight(W.height),x(W.standing?`${W.standing} objects at the edge of it stayed where they are: their places lie outside.`:null)}),!0},click:(H,z)=>{if(v.length>=ja)return x(`A band has at most ${ja} points`);y(au(v,M,H,z)),x(null)},cancel:()=>{if(!v.length)return!1;return k(),!0},setWidth:R,setStrength:U,wheel:(H,z)=>{if(H==="radius")R(Math.min(Sm,Math.max(lu,Math.round(L)+z*ym)));else U((W)=>Math.min(100,Math.max(0,W+z*bm)))}}}var Qa={back:"back_vaYpAg",menu:"menu_vaYpAg"};var hu=230,uu=130;function du({at:d,mark:p,canDelete:m,onMark:g,onDelete:_,onClose:x}){let v=d.x+hu>d.width?Math.max(0,d.x-hu):d.x,y=d.y+uu>d.height?Math.max(0,d.y-uu):d.y,S=(b)=>()=>{x(),b()};return t("div",{className:Qa.back,onPointerDown:(b)=>{if(b.target===b.currentTarget)x()},onContextMenu:(b)=>b.preventDefault(),children:e("div",{id:"view-menu",className:Qa.menu,role:"menu",style:{left:v,top:y},children:[t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Edit…"}),p&&t("button",{type:"button",role:"menuitem",onClick:S(g),children:p}),t("button",{type:"button",role:"menuitem",disabled:!m,onClick:S(_),children:"Delete"})]})})}var Em=(d)=>`${d} ${d===1?"object":"objects"} deleted`,Tm=(d)=>`${d} height ${d===1?"change":"changes"}`,wm=(d)=>`${d} ${d===1?"object stands":"objects stand"} at the edge of it and stayed where ${d===1?"it is":"they are"}: its place lies outside.`,fu=10,Am={radius:5,height:5,speed:30,soft:25,lower:!1},pu=3,mu=500,gu=1,tl=1e4,Rm=0.1,_u=(d,p,m,g,_)=>Math.min(_,Math.max(g,Math.round(d+p*Math.max(m,d*Rm)))),xu=(d)=>d.removed.length>0||d.sorts.length>0||d.objectSorts.length>0||d.heights.length>0,el=(d)=>!xu(d)&&!d.recipe,Cm=(d)=>new Date(d*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function vu({name:d,title:p,taken:m,view:g,scene:_,reopen:x,onSaved:v}){let[y]=n(()=>new qa(d)),S=f(y.subscribe,y.state),[b,M]=n(null),[T,E]=n(null),[w,C]=n(null),[N,A]=n(null),[R,I]=n({busy:!1,text:null}),[U,L]=n(null),[D,k]=n(Am),[P,F]=n(null),[G,H]=n(null),{starting:z,play:W}=h(),Z=y.canEdit(),V=jr(S),Q=U==="brush"&&Z,it=U==="delete"&&Z,j=cu({name:d,view:g,edits:y,enabled:U===null&&Z,revision:S.keptRevision,onNote:F}),xt=l((ht)=>{if(M(ht),C(null),it&&ht?.id&&ht.left)y.remove([{id:ht.id,position:ht.position}]),g.unpick()}),rt=l((ht)=>{if(U!==null||!Z)return;if(ht?.road)M(null),j.click(ht.road[0],ht.road[1]);else if(!ht?.id)j.clear()});i(()=>(g.setClicked((ht)=>rt(ht)),()=>g.setClicked(()=>{})),[g]),i(()=>{g.setWheelTaken(j.line!==null&&U===null)},[g,j.line,U]),i(()=>{if(U!==null)j.clear()},[U]),i(()=>{y.start();let ht=()=>y.saveNow(!0);return window.addEventListener("pagehide",ht),()=>{window.removeEventListener("pagehide",ht),y.stop()}},[y]),i(()=>(g.setPick((ht)=>xt(ht)),g.setMenu(E),g.setIndexed((ht)=>y.bind(ht)),()=>{g.setPick(()=>{}),g.setMenu(()=>{}),g.setIndexed(()=>{})}),[g,y]),i(()=>{g.setRemoved(S.removed.map((ht)=>ht.id),S.sorts,S.objectSorts)},[g,S.removed,S.sorts,S.objectSorts]),i(()=>(g.setMarked(w),()=>g.setMarked(null)),[g,w]),i(()=>(y.setOnMeshes((ht,Gt)=>g.refreshMeshes(ht,Gt)),g.setViewFailed(H),()=>{y.setOnMeshes(()=>{}),g.setViewFailed(()=>{})}),[g,y]),i(()=>{g.setBrush(Q?{radius:D.radius,lower:D.lower}:null)},[g,Q,D.radius,D.lower]),i(()=>()=>g.setBrush(null),[g]);let dt=l((ht,Gt)=>{if(U===null)return j.wheel(ht,Gt);k((pt)=>ht==="radius"?{...pt,radius:_u(pt.radius,Gt,1,pu,mu)}:{...pt,height:_u(pt.height,Gt,1,gu,tl)})});i(()=>(g.setBrushWheel((ht,Gt)=>dt(ht,Gt)),()=>g.setBrushWheel(()=>{})),[g]);let _t=(ht,Gt)=>({samples:ht,base:y.boundRevision(),radius:D.radius,soft:D.soft/100,mm:Math.round(D.height*fu)*(Gt?-1:1),speed:Math.round(D.speed*fu)}),Nt=l((ht,Gt)=>{let pt=_t(ht,Gt);y.inTurn(async()=>{let _e=await r(`/api/editor/${encodeURIComponent(d)}/brush`,pt),Xt=_e.error||!_e.height?_e.error??"no answer":y.canEdit()?null:"this track can't be changed now";if(Xt)return g.dropPreview(),F(`Not changed: ${Xt}`);y.addHeight(_e.height),F(_e.standing?wm(_e.standing):null)})}),ot=l(async(ht,Gt)=>{let pt=await fetch(`/api/editor/${encodeURIComponent(d)}/brush/preview`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(_t(ht,Gt))}).catch(()=>null);if(!pt)return null;if(pt.ok)return pt.arrayBuffer().catch(()=>null);return String((await pt.json().catch(()=>null))?.error??pt.status)});i(()=>(g.setStroke((ht,Gt)=>Nt(ht,Gt),(ht,Gt)=>ot(ht,Gt),(ht)=>F(`Not changed: ${ht}`)),()=>g.setStroke(()=>{},()=>Promise.resolve(null),()=>{})),[g]);let mt=b?.id?{id:b.id,position:b.position}:null,Rt=xu(S),Bt=el(S),kt=Z&&!R.busy&&!V&&!Bt,Lt=S.removed.map((ht)=>ht.id),ie=async(ht=null)=>{A(null),I({busy:!0,text:null}),await y.settled(),y.hold(!0),y.saveNow();let Gt=await y.saved();if(Gt===null)return y.hold(!1),I({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let pt=await r(`/api/editor/${encodeURIComponent(d)}/save`,{copy:ht!==null,title:ht,revision:Gt});if(y.hold(!1),pt.error||!pt.name)return I({busy:!1,text:`Not saved: ${pt.error??"no answer"}`}),null;if(I({busy:!1,text:null}),ht!==null)y.handOver(pt.name);else y.markSaved();return v(pt.name),pt.name},jt=async(ht)=>{g.focus();let Gt=N?.play,pt=await ie(ht);if(pt&&Gt)W(pt)},Dt=async()=>{await y.settled();let ht=y.state();if(!y.canEdit()||R.busy||jr(ht)||el(ht))return;if(ht.recipe)ie();else A({play:!1})},Jt=async()=>{await y.settled();let ht=y.state();if(jr(ht)||el(ht))W(d);else if(!ht.recipe)A({play:!0});else if(await ie())W(d)},Yt=async()=>{let ht=S.heights.map((Gt)=>Gt.id).join();if(await y.start(),y.viewBehind()||y.state().heights.map((Gt)=>Gt.id).join()!==ht)x()},Kt=(ht)=>()=>{ht(),g.focus()},ae=b?.id&&b.sort&&!Kh.has(b.sort)?b.sort:null,me=b?.id&&b.sprite?b.sprite:null,Te=!T?null:ae?`Mark all ${ds(ae)} (${g.countOfListed(ae,Lt,S.objectSorts)})`:me?`Mark all ${me} (loaded: ${g.countOf(me)})`:null,le=w&&(w.tree?w.sort:ds(w.sort)),de=()=>{if(!Z)return;if(w){if(w.tree)y.removeSort(w.sort);else y.removeObjectSort(w.sort);C(null),g.unpick()}else if(mt)y.remove([mt]),g.unpick()},Be=a(()=>E(null),[]),ke=a(()=>{A(null),g.focus()},[g]),en=l((ht)=>{let Gt=ht.ctrlKey||ht.metaKey,pt=ht.key.toLowerCase();if(N){if(Gt&&pt==="s")ht.preventDefault();return}if(ht.key!=="Escape"&&ht.key!=="Enter"&&ht.target.tagName==="INPUT")return;if(ht.key==="Delete")de();else if(ht.key==="Escape"){if(E(null),C(null),!g.cancelStroke()&&!j.cancel())L(null);g.focus()}else if(ht.key==="Enter"&&j.apply())g.focus();else if(!Gt&&pt==="h")L(U==="brush"?null:"brush");else if(!Gt&&pt==="x")L(U==="delete"?null:"delete");else if(Gt&&pt==="z")y.inTurn(()=>ht.shiftKey?y.redo():y.undo());else if(Gt&&pt==="y")y.inTurn(()=>y.redo());else if(Gt&&pt==="s")Dt();else return;ht.preventDefault()});i(()=>{let ht=_.current,Gt=(pt)=>en(pt);return ht.addEventListener("keydown",Gt),()=>ht.removeEventListener("keydown",Gt)},[_]);let K=R.busy?"Saving …":V?`Saved ${Cm(S.recipe.at)}`:Bt?"":"Not saved",nn=!z&&!R.busy&&S.save!=="loading"&&(V||Bt||kt);return e(o,{children:[e("div",{id:"edit-bar",className:ve.bar,"data-kept":S.save,children:[e("div",{className:ve.row,children:[t("button",{type:"button",disabled:!mt&&!w||!Z,onClick:Kt(de),children:"Delete"}),t("button",{type:"button",disabled:!Rt||!Z,onClick:Kt(()=>void y.inTurn(()=>y.discard())),children:"Discard"}),t("button",{type:"button",id:"edit-brush",className:Q?ve.on:"","aria-pressed":Q,disabled:!Z,title:"Raise or lower the ground: click, or hold and move (H; Esc ends it)",onClick:Kt(()=>{L(U==="brush"?null:"brush"),F(null)}),children:"Elevation"}),t("button",{type:"button",id:"edit-click-deletes",className:it?ve.on:"","aria-pressed":it,disabled:!Z,title:"Each click deletes what is under it, Ctrl+Z brings it back (X; Esc ends it)",onClick:Kt(()=>L(U==="delete"?null:"delete")),children:"Click deletes"}),e("span",{className:ve.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!kt,onClick:Kt(()=>void Dt()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!Z||R.busy,onClick:()=>A({play:!1}),children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!nn,title:"Save if needed, then drive it in Assetto Corsa",onClick:Kt(()=>void Jt()),children:z?"Starting …":"▶ Play"}),t("span",{id:"edit-saved",className:ve.state,children:K}),S.save==="failed"&&t("span",{id:"edit-kept",className:ve.state,children:"Changes not kept: trying again"})]}),Q&&e("div",{id:"edit-brush-set",className:ve.row,children:[t("button",{type:"button",className:D.lower?"":ve.on,"aria-pressed":!D.lower,title:"The brush raises the ground (Shift: the other way)",onClick:Kt(()=>k({...D,lower:!1})),children:"Raise"}),t("button",{type:"button",className:D.lower?ve.on:"","aria-pressed":D.lower,title:"The brush lowers the ground (Shift: the other way)",onClick:Kt(()=>k({...D,lower:!0})),children:"Lower"}),e("label",{className:ve.number,title:"How far one click moves the ground, at its middle (Alt + wheel)",children:["Height ",t("input",{type:"number",min:gu,max:tl,value:D.height,onChange:(ht)=>k({...D,height:ht.target.valueAsNumber||0})})," cm"]}),e("label",{className:ve.number,title:"How fast the ground goes on moving while the button is held, where the ring is",children:["Speed ",t("input",{type:"number",min:0,max:tl,step:5,value:D.speed,onChange:(ht)=>k({...D,speed:ht.target.valueAsNumber||0})})," cm/s"]}),e("label",{className:ve.number,title:"How far the brush reaches, the ring on the ground (Ctrl + wheel)",children:["Radius ",t("input",{type:"number",min:pu,max:mu,value:D.radius,onChange:(ht)=>k({...D,radius:ht.target.valueAsNumber||0})})," m"]}),e("label",{className:ve.number,title:"How much of the radius fades out softly: 100 % a round hill, 10 % a flat top with a steep edge",children:["Soft edge ",t("input",{type:"number",min:10,max:100,step:10,value:D.soft,onChange:(ht)=>k({...D,soft:ht.target.valueAsNumber||0})})," %"]})]}),j.points.length===1&&t("p",{id:"edit-band",className:ve.line,children:"A is set: click B further along the road (Esc drops it)."}),j.points.length>1&&e("div",{id:"edit-band",className:ve.row,children:[j.line&&e(o,{children:[t("b",{className:ve.toolName,children:"Smooth"}),e("label",{className:ve.number,title:"From short waves only, the hills stay, up to a calm line from A to B (Alt + wheel)",children:["Strength ",t("input",{type:"number",min:0,max:100,step:5,value:j.strength,onChange:(ht)=>j.setStrength(ht.target.valueAsNumber||0)})," %"]}),e("label",{className:ve.number,title:"How wide the band is: at first the road's own (Ctrl + wheel)",children:["Width ",t("input",{type:"number",min:3,max:60,value:Math.round(j.width),onChange:(ht)=>j.setWidth(ht.target.valueAsNumber||null)})," m"]})]}),t("span",{className:ve.state,children:"Enter takes it, Esc drops it. A click on the road adds a pin: drag it, right-click takes it away"})]}),P&&t("p",{id:"edit-brush-note",className:ve.line,children:P}),G&&e("p",{id:"edit-view-failed",className:ve.line,children:["The view doesn't show the last change, it is kept all the same: ",G," ",t("button",{type:"button",onClick:Kt(x),children:"Load again"})]}),S.heights.length>0&&t("p",{id:"edit-heights",className:ve.line,children:Tm(S.heights.length)}),S.removed.length>0&&t("p",{id:"edit-count",className:ve.line,children:Em(S.removed.length)}),(S.sorts.length>0||S.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:ve.line,children:["All deleted: ",[...S.sorts,...S.objectSorts.map(ds)].join(", ")]}),w&&e("p",{id:"edit-marked",className:ve.line,children:["All ",le," marked: Delete deletes them all, Esc ends it."]}),b&&!w&&e("p",{id:"edit-picked",className:ve.line,children:[b.kind,b.sprite&&` · ${b.sprite}`,ae&&ds(ae)!==b.kind&&` · ${ds(ae)}`,!b.id&&(b.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),R.text&&t("p",{id:"edit-made",className:ve.line,children:R.text}),S.outdated>0&&e("p",{id:"edit-outdated",className:ve.line,children:[S.outdated," older ",S.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",S.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:Kt(()=>y.discardOutdated()),children:"Give up"})]}),S.save==="stuck"&&e("p",{id:"edit-stuck",className:ve.line,children:[S.error," ",t("button",{type:"button",onClick:Kt(()=>void Yt()),children:"Read again"})]})]}),e("div",{id:"edit-history",className:ve.history,children:[t("button",{type:"button",disabled:!S.canUndo||!Z,onClick:Kt(()=>void y.inTurn(()=>y.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!S.canRedo||!Z,onClick:Kt(()=>void y.inTurn(()=>y.redo())),children:"↷ Redo"}),t("button",{type:"button",title:"Back to the first view, behind the start",onClick:Kt(()=>g.home()),children:"⌂ Start"})]}),T&&t(du,{at:T,mark:Z?Te:null,canDelete:!!mt&&Z,onClose:Be,onMark:()=>{C(ae?{sort:ae,tree:!1}:{sort:me,tree:!0}),g.focus()},onDelete:()=>{de(),g.focus()}}),N&&t(ru,{title:p,taken:m,canOverwrite:kt,onOverwrite:()=>void jt(null),onSaveNew:(ht)=>void jt(ht),onCancel:ke})]})}var yu={box:"box_myLiyw"};var An=(d,p=2)=>d.toFixed(p);function je({label:d,children:p}){return e(o,{children:[t("dt",{children:d}),t("dd",{children:p})]})}function Su({hovered:d}){if(!d)return null;let p=d.billboard;return e("div",{id:"hover-box",className:yu.box,children:[e("h4",{children:[d.kind,d.sprite&&` · ${d.sprite}`]}),e("dl",{children:[d.id&&t(je,{label:"ID",children:d.id}),p?.height!=null&&e(je,{label:"Height",children:[An(p.height,1)," m"]}),p?.width!=null&&e(je,{label:"Width",children:[An(p.width,1)," m"]}),p?.foot&&e(je,{label:"Stands at",children:[An(p.foot[0],1),", ",An(p.foot[1],1)]}),t(je,{label:"Mesh",children:d.object}),t(je,{label:"Physics",children:d.physics}),t(je,{label:"Material",children:d.material}),t(je,{label:"Shader",children:d.shader}),e(je,{label:"Texture",children:[d.texture??"none",d.textureBytes!==null&&` (${Math.ceil(d.textureBytes/1024)} KB)`]}),e(je,{label:"Size",children:[d.vertices," vertices, ",d.triangles," triangles"]}),t(je,{label:"Triangle",children:d.triangle}),d.uv&&e(je,{label:"UV",children:[An(d.uv[0],3),", ",An(d.uv[1],3)]}),e(je,{label:"Shown up to",children:[Math.round(d.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(je,{label:"AC x, y, z",children:[An(d.at[0]),", ",An(d.at[1]),", ",An(d.at[2])]}),e(je,{label:"Tile",children:[d.tile[0],", ",d.tile[1]]}),d.route&&e(je,{label:"Route",children:[Math.round(d.route.metre)," m, ",An(d.route.off,1)," m off"]}),d.latLon&&e(je,{label:"Lat, lon",children:[An(d.latLon[0],6),", ",An(d.latLon[1],6)]}),e(je,{label:"Camera",children:[An(d.distance,1)," m away"]})]}),!d.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var Yi="187";var rd=0,Pl=1,od=2;var xr=1,ad=2,Ns=3,ci=0,mn=1,Ln=2,Zi=0,vr=1,Il=2,Ll=3,Nl=4,ld=5;var Ds=100,cd=101,hd=102,ud=103,dd=104,fd=200,pd=201,md=202,gd=203,_d=204,xd=205,vd=206,yd=207,Sd=208,bd=209,Md=210,Ed=211,Td=212,wd=213,Ad=214,Rd=0,Cd=1,Pd=2,Dl=3,Id=4,Ld=5,Nd=6,Dd=7,Ud=0,Fd=1,Od=2,Yn=0,Ul=1,Fl=2,Ol=3,Bl=4,kl=5,zl=6,Hl=7;var yr=301,Us=302,Lo=303,No=304,Do=1000,Uo=1001,Bd=1002,wi=1003,kd=1004;var Sr=1005;var Tn=1006,Fo=1007;var Hn=1008;var Gn=1009,zd=1010,Hd=1011,br=1012,Gl=1013,Ai=1014,hi=1015,Zn=1016,Vl=1017,Wl=1018,$i=1020,Gd=35902,Vd=35899,Wd=1021,Xd=1022,Nn=1023,Fs=1026,Ri=1027,qd=1028,Xl=1029,Ji=1030,ql=1031;var Yl=1033,Os=33776,Oo=33777,Bs=33778,ks=33779,Zl=35840,$l=35841,Jl=35842,Kl=35843,Mr=36196,jl=37492,Ql=37496,tc=37488,ec=37489,Bo=37490,nc=37491,ic=37808,sc=37809,rc=37810,oc=37811,ac=37812,lc=37813,cc=37814,hc=37815,uc=37816,dc=37817,fc=37818,pc=37819,mc=37820,gc=37821,_c=36492,Er=36494,Tr=36495,xc=36283,vc=36284,ko=36285,yc=36286;var Sc=0,Yd=1,Ki="",zo="srgb",bc="srgb-linear",Mc="linear",Ie="srgb";var Zd=512,$d=513,Jd=514,Ec=515,Kd=516,jd=517,Tc=518,wc=519;var Ac="300 es",Rc=2000;function Im(d){for(let p=d.length-1;p>=0;--p)if(d[p]>=65535)return!0;return!1}function Lm(d){return ArrayBuffer.isView(d)&&!(d instanceof DataView)}function gr(d){return document.createElementNS("http://www.w3.org/1999/xhtml",d)}function Qd(){let d=gr("canvas");return d.style.display="block",d}var bu={},Is=null;function _r(...d){let p="THREE."+d.shift();if(Is)Is("log",p,...d);else console.log(p,...d)}function tf(d){let p=d[0];if(typeof p==="string"&&p.startsWith("TSL:")){let m=d[1];if(m&&m.isStackTrace)d[0]+=" "+m.getLocation();else d[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return d}function qt(...d){d=tf(d);let p="THREE."+d.shift();if(Is)Is("warn",p,...d);else{let m=d[0];if(m&&m.isStackTrace)console.warn(m.getError(p));else console.warn(p,...d)}}function Zt(...d){d=tf(d);let p="THREE."+d.shift();if(Is)Is("error",p,...d);else{let m=d[0];if(m&&m.isStackTrace)console.error(m.getError(p));else console.error(p,...d)}}function fr(...d){let p=d.join(" ");if(p in bu)return;bu[p]=!0,qt(...d)}function ef(d,p,m){return new Promise(function(g,_){function x(){switch(d.clientWaitSync(p,d.SYNC_FLUSH_COMMANDS_BIT,0)){case d.WAIT_FAILED:_();break;case d.TIMEOUT_EXPIRED:setTimeout(x,m);break;default:g()}}setTimeout(x,m)})}var nf={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class ui{addEventListener(d,p){if(this._listeners===void 0)this._listeners={};let m=this._listeners;if(m[d]===void 0)m[d]=[];if(m[d].indexOf(p)===-1)m[d].push(p)}hasEventListener(d,p){let m=this._listeners;if(m===void 0)return!1;return m[d]!==void 0&&m[d].indexOf(p)!==-1}removeEventListener(d,p){let m=this._listeners;if(m===void 0)return;let g=m[d];if(g!==void 0){let _=g.indexOf(p);if(_!==-1)g.splice(_,1)}}dispatchEvent(d){let p=this._listeners;if(p===void 0)return;let m=p[d.type];if(m!==void 0){d.target=this;let g=m.slice(0);for(let _=0,x=g.length;_<x;_++)g[_].call(this,d);d.target=null}}}var un=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Mu=1234567,pr=Math.PI/180,Ls=180/Math.PI;function Ci(){let d=Math.random()*4294967295|0,p=Math.random()*4294967295|0,m=Math.random()*4294967295|0,g=Math.random()*4294967295|0;return(un[d&255]+un[d>>8&255]+un[d>>16&255]+un[d>>24&255]+"-"+un[p&255]+un[p>>8&255]+"-"+un[p>>16&15|64]+un[p>>24&255]+"-"+un[m&63|128]+un[m>>8&255]+"-"+un[m>>16&255]+un[m>>24&255]+un[g&255]+un[g>>8&255]+un[g>>16&255]+un[g>>24&255]).toLowerCase()}function ne(d,p,m){return Math.max(p,Math.min(m,d))}function Cc(d,p){return(d%p+p)%p}function Nm(d,p,m,g,_){return g+(d-p)*(_-g)/(m-p)}function Dm(d,p,m){if(d!==p)return(m-d)/(p-d);else return 0}function mr(d,p,m){return(1-m)*d+m*p}function Um(d,p,m,g){return mr(d,p,1-Math.exp(-m*g))}function Fm(d,p=1){return p-Math.abs(Cc(d,p*2)-p)}function Om(d,p,m){if(d<=p)return 0;if(d>=m)return 1;return d=(d-p)/(m-p),d*d*(3-2*d)}function Bm(d,p,m){if(d<=p)return 0;if(d>=m)return 1;return d=(d-p)/(m-p),d*d*d*(d*(d*6-15)+10)}function km(d,p){return d+Math.floor(Math.random()*(p-d+1))}function zm(d,p){return d+Math.random()*(p-d)}function Hm(d){return d*(0.5-Math.random())}function Gm(d){if(d!==void 0)Mu=d;let p=Mu+=1831565813;return p=Math.imul(p^p>>>15,p|1),p^=p+Math.imul(p^p>>>7,p|61),((p^p>>>14)>>>0)/4294967296}function Vm(d){return d*pr}function Wm(d){return d*Ls}function Xm(d){return d>0&&Number.isInteger(d)&&2**Math.round(Math.log2(d))===d}function qm(d){return Math.pow(2,Math.ceil(Math.log(d)/Math.LN2))}function Pc(d){return Math.pow(2,Math.floor(Math.log(d)/Math.LN2))}function Ym(d,p,m,g,_){let{cos:x,sin:v}=Math,y=x(m/2),S=v(m/2),b=x((p+g)/2),M=v((p+g)/2),T=x((p-g)/2),E=v((p-g)/2),w=x((g-p)/2),C=v((g-p)/2);switch(_){case"XYX":d.set(y*M,S*T,S*E,y*b);break;case"YZY":d.set(S*E,y*M,S*T,y*b);break;case"ZXZ":d.set(S*T,S*E,y*M,y*b);break;case"XZX":d.set(y*M,S*C,S*w,y*b);break;case"YXY":d.set(S*w,y*M,S*C,y*b);break;case"ZYZ":d.set(S*C,S*w,y*M,y*b);break;default:qt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+_)}}function Ho(d){switch(d.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Ic(d,p){if(p.constructor===Float32Array)return d;let m=Ho(p);if(m===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(d/m,-1)}function Lc(d,p){if(p.constructor===Float32Array)return d;let m=Ho(p);if(m===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(d*m)}var Pi={DEG2RAD:pr,RAD2DEG:Ls,generateUUID:Ci,clamp:ne,euclideanModulo:Cc,mapLinear:Nm,inverseLerp:Dm,lerp:mr,damp:Um,pingpong:Fm,smoothstep:Om,smootherstep:Bm,randInt:km,randFloat:zm,randFloatSpread:Hm,seededRandom:Gm,degToRad:Vm,radToDeg:Wm,isPowerOfTwo:Xm,ceilPowerOfTwo:qm,floorPowerOfTwo:Pc,setQuaternionFromProperEuler:Ym,normalize:Lc,denormalize:Ic};class $t{static{this.prototype.isVector2=!0}constructor(d=0,p=0){this.x=d,this.y=p}get width(){return this.x}set width(d){this.x=d}get height(){return this.y}set height(d){this.y=d}set(d,p){return this.x=d,this.y=p,this}setScalar(d){return this.x=d,this.y=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;default:throw Error("THREE.Vector2: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y)}copy(d){return this.x=d.x,this.y=d.y,this}add(d){return this.x+=d.x,this.y+=d.y,this}addScalar(d){return this.x+=d,this.y+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this}subScalar(d){return this.x-=d,this.y-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this}multiply(d){return this.x*=d.x,this.y*=d.y,this}multiplyScalar(d){return this.x*=d,this.y*=d,this}divide(d){return this.x/=d.x,this.y/=d.y,this}divideScalar(d){return this.multiplyScalar(1/d)}applyMatrix3(d){let p=this.x,m=this.y,g=d.elements;return this.x=g[0]*p+g[3]*m+g[6],this.y=g[1]*p+g[4]*m+g[7],this}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(d){return this.x*d.x+this.y*d.y}cross(d){return this.x*d.y-this.y*d.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(d){let p=Math.sqrt(this.lengthSq()*d.lengthSq());if(p===0)return Math.PI/2;let m=this.dot(d)/p;return Math.acos(ne(m,-1,1))}distanceTo(d){return Math.sqrt(this.distanceToSquared(d))}distanceToSquared(d){let p=this.x-d.x,m=this.y-d.y;return p*p+m*m}manhattanDistanceTo(d){return Math.abs(this.x-d.x)+Math.abs(this.y-d.y)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this}equals(d){return d.x===this.x&&d.y===this.y}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this}rotateAround(d,p){let m=Math.cos(p),g=Math.sin(p),_=this.x-d.x,x=this.y-d.y;return this.x=_*m-x*g+d.x,this.y=_*g+x*m+d.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class di{constructor(d=0,p=0,m=0,g=1){this.isQuaternion=!0,this._x=d,this._y=p,this._z=m,this._w=g}static slerpFlat(d,p,m,g,_,x,v){let y=m[g+0],S=m[g+1],b=m[g+2],M=m[g+3],T=_[x+0],E=_[x+1],w=_[x+2],C=_[x+3];if(M!==C||y!==T||S!==E||b!==w){let N=y*T+S*E+b*w+M*C;if(N<0)T=-T,E=-E,w=-w,C=-C,N=-N;let A=1-v;if(N<0.9995){let R=Math.acos(N),I=Math.sin(R);A=Math.sin(A*R)/I,v=Math.sin(v*R)/I,y=y*A+T*v,S=S*A+E*v,b=b*A+w*v,M=M*A+C*v}else{y=y*A+T*v,S=S*A+E*v,b=b*A+w*v,M=M*A+C*v;let R=1/Math.sqrt(y*y+S*S+b*b+M*M);y*=R,S*=R,b*=R,M*=R}}d[p]=y,d[p+1]=S,d[p+2]=b,d[p+3]=M}static multiplyQuaternionsFlat(d,p,m,g,_,x){let v=m[g],y=m[g+1],S=m[g+2],b=m[g+3],M=_[x],T=_[x+1],E=_[x+2],w=_[x+3];return d[p]=v*w+b*M+y*E-S*T,d[p+1]=y*w+b*T+S*M-v*E,d[p+2]=S*w+b*E+v*T-y*M,d[p+3]=b*w-v*M-y*T-S*E,d}get x(){return this._x}set x(d){this._x=d,this._onChangeCallback()}get y(){return this._y}set y(d){this._y=d,this._onChangeCallback()}get z(){return this._z}set z(d){this._z=d,this._onChangeCallback()}get w(){return this._w}set w(d){this._w=d,this._onChangeCallback()}set(d,p,m,g){return this._x=d,this._y=p,this._z=m,this._w=g,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(d){return this._x=d.x,this._y=d.y,this._z=d.z,this._w=d.w,this._onChangeCallback(),this}setFromEuler(d,p=!0){let{_x:m,_y:g,_z:_,_order:x}=d,{cos:v,sin:y}=Math,S=v(m/2),b=v(g/2),M=v(_/2),T=y(m/2),E=y(g/2),w=y(_/2);switch(x){case"XYZ":this._x=T*b*M+S*E*w,this._y=S*E*M-T*b*w,this._z=S*b*w+T*E*M,this._w=S*b*M-T*E*w;break;case"YXZ":this._x=T*b*M+S*E*w,this._y=S*E*M-T*b*w,this._z=S*b*w-T*E*M,this._w=S*b*M+T*E*w;break;case"ZXY":this._x=T*b*M-S*E*w,this._y=S*E*M+T*b*w,this._z=S*b*w+T*E*M,this._w=S*b*M-T*E*w;break;case"ZYX":this._x=T*b*M-S*E*w,this._y=S*E*M+T*b*w,this._z=S*b*w-T*E*M,this._w=S*b*M+T*E*w;break;case"YZX":this._x=T*b*M+S*E*w,this._y=S*E*M+T*b*w,this._z=S*b*w-T*E*M,this._w=S*b*M-T*E*w;break;case"XZY":this._x=T*b*M-S*E*w,this._y=S*E*M-T*b*w,this._z=S*b*w+T*E*M,this._w=S*b*M+T*E*w;break;default:qt("Quaternion: .setFromEuler() encountered an unknown order: "+x)}if(p===!0)this._onChangeCallback();return this}setFromAxisAngle(d,p){let m=p/2,g=Math.sin(m);return this._x=d.x*g,this._y=d.y*g,this._z=d.z*g,this._w=Math.cos(m),this._onChangeCallback(),this}setFromRotationMatrix(d){let p=d.elements,m=p[0],g=p[4],_=p[8],x=p[1],v=p[5],y=p[9],S=p[2],b=p[6],M=p[10],T=m+v+M;if(T>0){let E=0.5/Math.sqrt(T+1);this._w=0.25/E,this._x=(b-y)*E,this._y=(_-S)*E,this._z=(x-g)*E}else if(m>v&&m>M){let E=2*Math.sqrt(1+m-v-M);this._w=(b-y)/E,this._x=0.25*E,this._y=(g+x)/E,this._z=(_+S)/E}else if(v>M){let E=2*Math.sqrt(1+v-m-M);this._w=(_-S)/E,this._x=(g+x)/E,this._y=0.25*E,this._z=(y+b)/E}else{let E=2*Math.sqrt(1+M-m-v);this._w=(x-g)/E,this._x=(_+S)/E,this._y=(y+b)/E,this._z=0.25*E}return this._onChangeCallback(),this}setFromUnitVectors(d,p){let m=d.dot(p)+1;if(m<0.00000001)if(m=0,Math.abs(d.x)>Math.abs(d.z))this._x=-d.y,this._y=d.x,this._z=0,this._w=m;else this._x=0,this._y=-d.z,this._z=d.y,this._w=m;else this._x=d.y*p.z-d.z*p.y,this._y=d.z*p.x-d.x*p.z,this._z=d.x*p.y-d.y*p.x,this._w=m;return this.normalize()}angleTo(d){return 2*Math.acos(Math.abs(ne(this.dot(d),-1,1)))}rotateTowards(d,p){let m=this.angleTo(d);if(m===0)return this;let g=Math.min(1,p/m);return this.slerp(d,g),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(d){return this._x*d._x+this._y*d._y+this._z*d._z+this._w*d._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let d=this.length();if(d===0)this._x=0,this._y=0,this._z=0,this._w=1;else d=1/d,this._x=this._x*d,this._y=this._y*d,this._z=this._z*d,this._w=this._w*d;return this._onChangeCallback(),this}multiply(d){return this.multiplyQuaternions(this,d)}premultiply(d){return this.multiplyQuaternions(d,this)}multiplyQuaternions(d,p){let{_x:m,_y:g,_z:_,_w:x}=d,{_x:v,_y:y,_z:S,_w:b}=p;return this._x=m*b+x*v+g*S-_*y,this._y=g*b+x*y+_*v-m*S,this._z=_*b+x*S+m*y-g*v,this._w=x*b-m*v-g*y-_*S,this._onChangeCallback(),this}slerp(d,p){let{_x:m,_y:g,_z:_,_w:x}=d,v=this.dot(d);if(v<0)m=-m,g=-g,_=-_,x=-x,v=-v;let y=1-p;if(v<0.9995){let S=Math.acos(v),b=Math.sin(S);y=Math.sin(y*S)/b,p=Math.sin(p*S)/b,this._x=this._x*y+m*p,this._y=this._y*y+g*p,this._z=this._z*y+_*p,this._w=this._w*y+x*p,this._onChangeCallback()}else this._x=this._x*y+m*p,this._y=this._y*y+g*p,this._z=this._z*y+_*p,this._w=this._w*y+x*p,this.normalize();return this}slerpQuaternions(d,p,m){return this.copy(d).slerp(p,m)}random(){let d=2*Math.PI*Math.random(),p=2*Math.PI*Math.random(),m=Math.random(),g=Math.sqrt(1-m),_=Math.sqrt(m);return this.set(g*Math.sin(d),g*Math.cos(d),_*Math.sin(p),_*Math.cos(p))}equals(d){return d._x===this._x&&d._y===this._y&&d._z===this._z&&d._w===this._w}fromArray(d,p=0){return this._x=d[p],this._y=d[p+1],this._z=d[p+2],this._w=d[p+3],this._onChangeCallback(),this}toArray(d=[],p=0){return d[p]=this._x,d[p+1]=this._y,d[p+2]=this._z,d[p+3]=this._w,d}fromBufferAttribute(d,p){return this._x=d.getX(p),this._y=d.getY(p),this._z=d.getZ(p),this._w=d.getW(p),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(d){return this._onChangeCallback=d,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class q{static{this.prototype.isVector3=!0}constructor(d=0,p=0,m=0){this.x=d,this.y=p,this.z=m}set(d,p,m){if(m===void 0)m=this.z;return this.x=d,this.y=p,this.z=m,this}setScalar(d){return this.x=d,this.y=d,this.z=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setZ(d){return this.z=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;case 2:this.z=p;break;default:throw Error("THREE.Vector3: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(d){return this.x=d.x,this.y=d.y,this.z=d.z,this}add(d){return this.x+=d.x,this.y+=d.y,this.z+=d.z,this}addScalar(d){return this.x+=d,this.y+=d,this.z+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this.z=d.z+p.z,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this.z+=d.z*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this.z-=d.z,this}subScalar(d){return this.x-=d,this.y-=d,this.z-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this.z=d.z-p.z,this}multiply(d){return this.x*=d.x,this.y*=d.y,this.z*=d.z,this}multiplyScalar(d){return this.x*=d,this.y*=d,this.z*=d,this}multiplyVectors(d,p){return this.x=d.x*p.x,this.y=d.y*p.y,this.z=d.z*p.z,this}applyEuler(d){return this.applyQuaternion(Eu.setFromEuler(d))}applyAxisAngle(d,p){return this.applyQuaternion(Eu.setFromAxisAngle(d,p))}applyMatrix3(d){let p=this.x,m=this.y,g=this.z,_=d.elements;return this.x=_[0]*p+_[3]*m+_[6]*g,this.y=_[1]*p+_[4]*m+_[7]*g,this.z=_[2]*p+_[5]*m+_[8]*g,this}applyNormalMatrix(d){return this.applyMatrix3(d).normalize()}applyMatrix4(d){let p=this.x,m=this.y,g=this.z,_=d.elements,x=1/(_[3]*p+_[7]*m+_[11]*g+_[15]);return this.x=(_[0]*p+_[4]*m+_[8]*g+_[12])*x,this.y=(_[1]*p+_[5]*m+_[9]*g+_[13])*x,this.z=(_[2]*p+_[6]*m+_[10]*g+_[14])*x,this}applyQuaternion(d){let p=this.x,m=this.y,g=this.z,{x:_,y:x,z:v,w:y}=d,S=2*(x*g-v*m),b=2*(v*p-_*g),M=2*(_*m-x*p);return this.x=p+y*S+x*M-v*b,this.y=m+y*b+v*S-_*M,this.z=g+y*M+_*b-x*S,this}project(d){return this.applyMatrix4(d.matrixWorldInverse).applyMatrix4(d.projectionMatrix)}unproject(d){return this.applyMatrix4(d.projectionMatrixInverse).applyMatrix4(d.matrixWorld)}transformDirection(d){let p=this.x,m=this.y,g=this.z,_=d.elements;return this.x=_[0]*p+_[4]*m+_[8]*g,this.y=_[1]*p+_[5]*m+_[9]*g,this.z=_[2]*p+_[6]*m+_[10]*g,this.normalize()}divide(d){return this.x/=d.x,this.y/=d.y,this.z/=d.z,this}divideScalar(d){return this.multiplyScalar(1/d)}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this.z=Math.min(this.z,d.z),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this.z=Math.max(this.z,d.z),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this.z=ne(this.z,d.z,p.z),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this.z=ne(this.z,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(d){return this.x*d.x+this.y*d.y+this.z*d.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this.z+=(d.z-this.z)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this.z=d.z+(p.z-d.z)*m,this}cross(d){return this.crossVectors(this,d)}crossVectors(d,p){let{x:m,y:g,z:_}=d,{x,y:v,z:y}=p;return this.x=g*y-_*v,this.y=_*x-m*y,this.z=m*v-g*x,this}projectOnVector(d){let p=d.lengthSq();if(p===0)return this.set(0,0,0);let m=d.dot(this)/p;return this.copy(d).multiplyScalar(m)}projectOnPlane(d){return nl.copy(this).projectOnVector(d),this.sub(nl)}reflect(d){return this.sub(nl.copy(d).multiplyScalar(2*this.dot(d)))}angleTo(d){let p=Math.sqrt(this.lengthSq()*d.lengthSq());if(p===0)return Math.PI/2;let m=this.dot(d)/p;return Math.acos(ne(m,-1,1))}distanceTo(d){return Math.sqrt(this.distanceToSquared(d))}distanceToSquared(d){let p=this.x-d.x,m=this.y-d.y,g=this.z-d.z;return p*p+m*m+g*g}manhattanDistanceTo(d){return Math.abs(this.x-d.x)+Math.abs(this.y-d.y)+Math.abs(this.z-d.z)}setFromSpherical(d){return this.setFromSphericalCoords(d.radius,d.phi,d.theta)}setFromSphericalCoords(d,p,m){let g=Math.sin(p)*d;return this.x=g*Math.sin(m),this.y=Math.cos(p)*d,this.z=g*Math.cos(m),this}setFromCylindrical(d){return this.setFromCylindricalCoords(d.radius,d.theta,d.y)}setFromCylindricalCoords(d,p,m){return this.x=d*Math.sin(p),this.y=m,this.z=d*Math.cos(p),this}setFromMatrixPosition(d){let p=d.elements;return this.x=p[12],this.y=p[13],this.z=p[14],this}setFromMatrixScale(d){let p=this.setFromMatrixColumn(d,0).length(),m=this.setFromMatrixColumn(d,1).length(),g=this.setFromMatrixColumn(d,2).length();return this.x=p,this.y=m,this.z=g,this}setFromMatrixColumn(d,p){return this.fromArray(d.elements,p*4)}setFromMatrix3Column(d,p){return this.fromArray(d.elements,p*3)}setFromEuler(d){return this.x=d._x,this.y=d._y,this.z=d._z,this}setFromColor(d){return this.x=d.r,this.y=d.g,this.z=d.b,this}equals(d){return d.x===this.x&&d.y===this.y&&d.z===this.z}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this.z=d[p+2],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d[p+2]=this.z,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this.z=d.getZ(p),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let d=Math.random()*Math.PI*2,p=Math.random()*2-1,m=Math.sqrt(1-p*p);return this.x=m*Math.cos(d),this.y=p,this.z=m*Math.sin(d),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var nl=new q,Eu=new di;class Qt{static{this.prototype.isMatrix3=!0}constructor(d,p,m,g,_,x,v,y,S){if(this.elements=[1,0,0,0,1,0,0,0,1],d!==void 0)this.set(d,p,m,g,_,x,v,y,S)}set(d,p,m,g,_,x,v,y,S){let b=this.elements;return b[0]=d,b[1]=g,b[2]=v,b[3]=p,b[4]=_,b[5]=y,b[6]=m,b[7]=x,b[8]=S,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(d){let p=this.elements,m=d.elements;return p[0]=m[0],p[1]=m[1],p[2]=m[2],p[3]=m[3],p[4]=m[4],p[5]=m[5],p[6]=m[6],p[7]=m[7],p[8]=m[8],this}extractBasis(d,p,m){return d.setFromMatrix3Column(this,0),p.setFromMatrix3Column(this,1),m.setFromMatrix3Column(this,2),this}setFromMatrix4(d){let p=d.elements;return this.set(p[0],p[4],p[8],p[1],p[5],p[9],p[2],p[6],p[10]),this}multiply(d){return this.multiplyMatrices(this,d)}premultiply(d){return this.multiplyMatrices(d,this)}multiplyMatrices(d,p){let m=d.elements,g=p.elements,_=this.elements,x=m[0],v=m[3],y=m[6],S=m[1],b=m[4],M=m[7],T=m[2],E=m[5],w=m[8],C=g[0],N=g[3],A=g[6],R=g[1],I=g[4],U=g[7],L=g[2],D=g[5],k=g[8];return _[0]=x*C+v*R+y*L,_[3]=x*N+v*I+y*D,_[6]=x*A+v*U+y*k,_[1]=S*C+b*R+M*L,_[4]=S*N+b*I+M*D,_[7]=S*A+b*U+M*k,_[2]=T*C+E*R+w*L,_[5]=T*N+E*I+w*D,_[8]=T*A+E*U+w*k,this}multiplyScalar(d){let p=this.elements;return p[0]*=d,p[3]*=d,p[6]*=d,p[1]*=d,p[4]*=d,p[7]*=d,p[2]*=d,p[5]*=d,p[8]*=d,this}determinant(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],b=d[8];return p*x*b-p*v*S-m*_*b+m*v*y+g*_*S-g*x*y}invert(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],b=d[8],M=b*x-v*S,T=v*y-b*_,E=S*_-x*y,w=p*M+m*T+g*E;if(w===0)return this.set(0,0,0,0,0,0,0,0,0);let C=1/w;return d[0]=M*C,d[1]=(g*S-b*m)*C,d[2]=(v*m-g*x)*C,d[3]=T*C,d[4]=(b*p-g*y)*C,d[5]=(g*_-v*p)*C,d[6]=E*C,d[7]=(m*y-S*p)*C,d[8]=(x*p-m*_)*C,this}transpose(){let d,p=this.elements;return d=p[1],p[1]=p[3],p[3]=d,d=p[2],p[2]=p[6],p[6]=d,d=p[5],p[5]=p[7],p[7]=d,this}getNormalMatrix(d){return this.setFromMatrix4(d).invert().transpose()}transposeIntoArray(d){let p=this.elements;return d[0]=p[0],d[1]=p[3],d[2]=p[6],d[3]=p[1],d[4]=p[4],d[5]=p[7],d[6]=p[2],d[7]=p[5],d[8]=p[8],this}setUvTransform(d,p,m,g,_,x,v){let y=Math.cos(_),S=Math.sin(_);return this.set(m*y,m*S,-m*(y*x+S*v)+x+d,-g*S,g*y,-g*(-S*x+y*v)+v+p,0,0,1),this}scale(d,p){return fr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(il.makeScale(d,p)),this}rotate(d){return fr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(il.makeRotation(-d)),this}translate(d,p){return fr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(il.makeTranslation(d,p)),this}makeTranslation(d,p){if(d.isVector2)this.set(1,0,d.x,0,1,d.y,0,0,1);else this.set(1,0,d,0,1,p,0,0,1);return this}makeRotation(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,-m,0,m,p,0,0,0,1),this}makeScale(d,p){return this.set(d,0,0,0,p,0,0,0,1),this}equals(d){let p=this.elements,m=d.elements;for(let g=0;g<9;g++)if(p[g]!==m[g])return!1;return!0}fromArray(d,p=0){for(let m=0;m<9;m++)this.elements[m]=d[m+p];return this}toArray(d=[],p=0){let m=this.elements;return d[p]=m[0],d[p+1]=m[1],d[p+2]=m[2],d[p+3]=m[3],d[p+4]=m[4],d[p+5]=m[5],d[p+6]=m[6],d[p+7]=m[7],d[p+8]=m[8],d}clone(){return new this.constructor().fromArray(this.elements)}}var il=new Qt,Tu=new Qt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),wu=new Qt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Zm(){let d={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(_,x,v){if(this.enabled===!1||x===v||!x||!v)return _;if(this.spaces[x].transfer==="srgb")_.r=ai(_.r),_.g=ai(_.g),_.b=ai(_.b);if(this.spaces[x].primaries!==this.spaces[v].primaries)_.applyMatrix3(this.spaces[x].toXYZ),_.applyMatrix3(this.spaces[v].fromXYZ);if(this.spaces[v].transfer==="srgb")_.r=Cs(_.r),_.g=Cs(_.g),_.b=Cs(_.b);return _},workingToColorSpace:function(_,x){return this.convert(_,this.workingColorSpace,x)},colorSpaceToWorking:function(_,x){return this.convert(_,x,this.workingColorSpace)},getPrimaries:function(_){return this.spaces[_].primaries},getTransfer:function(_){if(_==="")return"linear";return this.spaces[_].transfer},getToneMappingMode:function(_){return this.spaces[_].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(_,x=this.workingColorSpace){return _.fromArray(this.spaces[x].luminanceCoefficients)},define:function(_){Object.assign(this.spaces,_)},_getMatrix:function(_,x,v){return _.copy(this.spaces[v].fromXYZ).multiply(this.spaces[x].toXYZ)},_getDrawingBufferColorSpace:function(_){return this.spaces[_].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(_=this.workingColorSpace){return this.spaces[_].workingColorSpaceConfig.unpackColorSpace}},p=[0.64,0.33,0.3,0.6,0.15,0.06],m=[0.2126,0.7152,0.0722],g=[0.3127,0.329];return d.define({["srgb-linear"]:{primaries:p,whitePoint:g,transfer:"linear",toXYZ:Tu,fromXYZ:wu,luminanceCoefficients:m,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:p,whitePoint:g,transfer:"srgb",toXYZ:Tu,fromXYZ:wu,luminanceCoefficients:m,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),d}var he=Zm();function ai(d){return d<0.04045?d*0.0773993808:Math.pow(d*0.9478672986+0.0521327014,2.4)}function Cs(d){return d<0.0031308?d*12.92:1.055*Math.pow(d,0.41666)-0.055}var fs;class Nc{static getDataURL(d,p="image/png"){if(/^data:/i.test(d.src))return d.src;if(typeof HTMLCanvasElement>"u")return d.src;let m;if(d instanceof HTMLCanvasElement)m=d;else{if(fs===void 0)fs=gr("canvas");fs.width=d.width,fs.height=d.height;let g=fs.getContext("2d");if(d instanceof ImageData)g.putImageData(d,0,0);else g.drawImage(d,0,0,d.width,d.height);m=fs}return m.toDataURL(p)}static sRGBToLinear(d){if(typeof HTMLImageElement<"u"&&d instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&d instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&d instanceof ImageBitmap){let p=gr("canvas");p.width=d.width,p.height=d.height;let m=p.getContext("2d");m.drawImage(d,0,0,d.width,d.height);let g=m.getImageData(0,0,d.width,d.height),_=g.data;for(let x=0;x<_.length;x++)_[x]=ai(_[x]/255)*255;return m.putImageData(g,0,0),p}else if(d.data){let p=d.data.slice(0);for(let m=0;m<p.length;m++)if(p instanceof Uint8Array||p instanceof Uint8ClampedArray)p[m]=Math.floor(ai(p[m]/255)*255);else p[m]=ai(p[m]);return{data:p,width:d.width,height:d.height}}else return qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),d}}var $m=0;class wr{constructor(d=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:$m++}),this.uuid=Ci(),this.data=d,this.dataReady=!0,this.version=0}getSize(d){let p=this.data;if(typeof HTMLVideoElement<"u"&&p instanceof HTMLVideoElement)d.set(p.videoWidth,p.videoHeight,0);else if(typeof VideoFrame<"u"&&p instanceof VideoFrame)d.set(p.displayWidth,p.displayHeight,0);else if(p!==null)d.set(p.width||0,p.height||0,p.depth||0);else d.set(0,0,0);return d}set needsUpdate(d){if(d===!0)this.version++}toJSON(d){let p=d===void 0||typeof d==="string";if(!p&&d.images[this.uuid]!==void 0)return d.images[this.uuid];let m={uuid:this.uuid,url:""},g=this.data;if(g!==null){let _;if(Array.isArray(g)){_=[];for(let x=0,v=g.length;x<v;x++)if(g[x].isDataTexture)_.push(sl(g[x].image));else _.push(sl(g[x]))}else _=sl(g);m.url=_}if(!p)d.images[this.uuid]=m;return m}}function sl(d){if(typeof HTMLImageElement<"u"&&d instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&d instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&d instanceof ImageBitmap)return Nc.getDataURL(d);else if(d.data)return{data:Array.from(d.data),width:d.width,height:d.height,type:d.data.constructor.name};else return qt("Texture: Unable to serialize Texture."),{}}var Jm=0,rl=new q;class We extends ui{constructor(d=We.DEFAULT_IMAGE,p=We.DEFAULT_MAPPING,m=1001,g=1001,_=1006,x=1008,v=1023,y=1009,S=We.DEFAULT_ANISOTROPY,b=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Jm++}),this.uuid=Ci(),this.name="",this.source=new wr(d),this.mipmaps=[],this.mapping=p,this.channel=0,this.wrapS=m,this.wrapT=g,this.magFilter=_,this.minFilter=x,this.anisotropy=S,this.format=v,this.internalFormat=null,this.type=y,this.offset=new $t(0,0),this.repeat=new $t(1,1),this.center=new $t(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Qt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=b,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=d&&d.depth&&d.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(rl).x}get height(){return this.source.getSize(rl).y}get depth(){return this.source.getSize(rl).z}get image(){return this.source.data}set image(d){this.source.data=d}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(d){return this.name=d.name,this.source=d.source,this.mipmaps=d.mipmaps.slice(0),this.mapping=d.mapping,this.channel=d.channel,this.wrapS=d.wrapS,this.wrapT=d.wrapT,this.magFilter=d.magFilter,this.minFilter=d.minFilter,this.anisotropy=d.anisotropy,this.format=d.format,this.internalFormat=d.internalFormat,this.type=d.type,this.normalized=d.normalized,this.offset.copy(d.offset),this.repeat.copy(d.repeat),this.center.copy(d.center),this.rotation=d.rotation,this.matrixAutoUpdate=d.matrixAutoUpdate,this.matrix.copy(d.matrix),this.generateMipmaps=d.generateMipmaps,this.mipmapsAutoUpdate=d.mipmapsAutoUpdate,this.premultiplyAlpha=d.premultiplyAlpha,this.flipY=d.flipY,this.unpackAlignment=d.unpackAlignment,this.colorSpace=d.colorSpace,this.renderTarget=d.renderTarget,this.isRenderTargetTexture=d.isRenderTargetTexture,this.isPMREMTexture=d.isPMREMTexture,this.isArrayTexture=d.isArrayTexture,this.userData=JSON.parse(JSON.stringify(d.userData)),this.needsUpdate=!0,this}setValues(d){for(let p in d){let m=d[p];if(m===void 0){qt(`Texture.setValues(): parameter '${p}' has value of undefined.`);continue}let g=this[p];if(g===void 0){qt(`Texture.setValues(): property '${p}' does not exist.`);continue}if(g&&m&&(g.isVector2&&m.isVector2))g.copy(m);else if(g&&m&&(g.isVector3&&m.isVector3))g.copy(m);else if(g&&m&&(g.isMatrix3&&m.isMatrix3))g.copy(m);else this[p]=m}}toJSON(d){let p=d===void 0||typeof d==="string";if(!p&&d.textures[this.uuid]!==void 0)return d.textures[this.uuid];let m={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(d).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)m.userData=this.userData;if(!p)d.textures[this.uuid]=m;return m}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(d){if(this.mapping!==300)return d;if(d.applyMatrix3(this.matrix),d.x<0||d.x>1)switch(this.wrapS){case 1000:d.x=d.x-Math.floor(d.x);break;case 1001:d.x=d.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(d.x)%2)===1)d.x=Math.ceil(d.x)-d.x;else d.x=d.x-Math.floor(d.x);break}if(d.y<0||d.y>1)switch(this.wrapT){case 1000:d.y=d.y-Math.floor(d.y);break;case 1001:d.y=d.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(d.y)%2)===1)d.y=Math.ceil(d.y)-d.y;else d.y=d.y-Math.floor(d.y);break}if(this.flipY)d.y=1-d.y;return d}set needsUpdate(d){if(d===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(d){if(d===!0)this.pmremVersion++}}We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=300;We.DEFAULT_ANISOTROPY=1;class Oe{static{this.prototype.isVector4=!0}constructor(d=0,p=0,m=0,g=1){this.x=d,this.y=p,this.z=m,this.w=g}get width(){return this.z}set width(d){this.z=d}get height(){return this.w}set height(d){this.w=d}set(d,p,m,g){return this.x=d,this.y=p,this.z=m,this.w=g,this}setScalar(d){return this.x=d,this.y=d,this.z=d,this.w=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setZ(d){return this.z=d,this}setW(d){return this.w=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;case 2:this.z=p;break;case 3:this.w=p;break;default:throw Error("THREE.Vector4: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(d){return this.x=d.x,this.y=d.y,this.z=d.z,this.w=d.w!==void 0?d.w:1,this}add(d){return this.x+=d.x,this.y+=d.y,this.z+=d.z,this.w+=d.w,this}addScalar(d){return this.x+=d,this.y+=d,this.z+=d,this.w+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this.z=d.z+p.z,this.w=d.w+p.w,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this.z+=d.z*p,this.w+=d.w*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this.z-=d.z,this.w-=d.w,this}subScalar(d){return this.x-=d,this.y-=d,this.z-=d,this.w-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this.z=d.z-p.z,this.w=d.w-p.w,this}multiply(d){return this.x*=d.x,this.y*=d.y,this.z*=d.z,this.w*=d.w,this}multiplyScalar(d){return this.x*=d,this.y*=d,this.z*=d,this.w*=d,this}applyMatrix4(d){let p=this.x,m=this.y,g=this.z,_=this.w,x=d.elements;return this.x=x[0]*p+x[4]*m+x[8]*g+x[12]*_,this.y=x[1]*p+x[5]*m+x[9]*g+x[13]*_,this.z=x[2]*p+x[6]*m+x[10]*g+x[14]*_,this.w=x[3]*p+x[7]*m+x[11]*g+x[15]*_,this}divide(d){return this.x/=d.x,this.y/=d.y,this.z/=d.z,this.w/=d.w,this}divideScalar(d){return this.multiplyScalar(1/d)}setAxisAngleFromQuaternion(d){this.w=2*Math.acos(d.w);let p=Math.sqrt(1-d.w*d.w);if(p<0.0001)this.x=1,this.y=0,this.z=0;else this.x=d.x/p,this.y=d.y/p,this.z=d.z/p;return this}setAxisAngleFromRotationMatrix(d){let p,m,g,_,x=0.01,v=0.1,y=d.elements,S=y[0],b=y[4],M=y[8],T=y[1],E=y[5],w=y[9],C=y[2],N=y[6],A=y[10];if(Math.abs(b-T)<0.01&&Math.abs(M-C)<0.01&&Math.abs(w-N)<0.01){if(Math.abs(b+T)<0.1&&Math.abs(M+C)<0.1&&Math.abs(w+N)<0.1&&Math.abs(S+E+A-3)<0.1)return this.set(1,0,0,0),this;p=Math.PI;let I=(S+1)/2,U=(E+1)/2,L=(A+1)/2,D=(b+T)/4,k=(M+C)/4,P=(w+N)/4;if(I>U&&I>L)if(I<0.01)m=0,g=0.707106781,_=0.707106781;else m=Math.sqrt(I),g=D/m,_=k/m;else if(U>L)if(U<0.01)m=0.707106781,g=0,_=0.707106781;else g=Math.sqrt(U),m=D/g,_=P/g;else if(L<0.01)m=0.707106781,g=0.707106781,_=0;else _=Math.sqrt(L),m=k/_,g=P/_;return this.set(m,g,_,p),this}let R=Math.sqrt((N-w)*(N-w)+(M-C)*(M-C)+(T-b)*(T-b));if(Math.abs(R)<0.001)R=1;return this.x=(N-w)/R,this.y=(M-C)/R,this.z=(T-b)/R,this.w=Math.acos((S+E+A-1)/2),this}setFromMatrixPosition(d){let p=d.elements;return this.x=p[12],this.y=p[13],this.z=p[14],this.w=p[15],this}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this.z=Math.min(this.z,d.z),this.w=Math.min(this.w,d.w),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this.z=Math.max(this.z,d.z),this.w=Math.max(this.w,d.w),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this.z=ne(this.z,d.z,p.z),this.w=ne(this.w,d.w,p.w),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this.z=ne(this.z,d,p),this.w=ne(this.w,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(d){return this.x*d.x+this.y*d.y+this.z*d.z+this.w*d.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this.z+=(d.z-this.z)*p,this.w+=(d.w-this.w)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this.z=d.z+(p.z-d.z)*m,this.w=d.w+(p.w-d.w)*m,this}equals(d){return d.x===this.x&&d.y===this.y&&d.z===this.z&&d.w===this.w}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this.z=d[p+2],this.w=d[p+3],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d[p+2]=this.z,d[p+3]=this.w,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this.z=d.getZ(p),this.w=d.getW(p),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Dc extends ui{constructor(d=1,p=1,m={}){super();m=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},m),this.isRenderTarget=!0,this.width=d,this.height=p,this.depth=m.depth,this.scissor=new Oe(0,0,d,p),this.scissorTest=!1,this.viewport=new Oe(0,0,d,p),this.textures=[];let g=m.count;for(let _=0;_<g;_++)this.textures[_]=new We({width:d,height:p,depth:m.depth}),this.textures[_].isRenderTargetTexture=!0,this.textures[_].renderTarget=this;this._setTextureOptions(m),this.depthBuffer=m.depthBuffer,this.stencilBuffer=m.stencilBuffer,this.resolveColorBuffer=m.resolveColorBuffer,this.resolveDepthBuffer=m.resolveDepthBuffer,this.resolveStencilBuffer=m.resolveStencilBuffer,this.storeMultisampledColorBuffer=m.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=m.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=m.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=m.depthTexture,this.samples=m.samples,this.multiview=m.multiview,this.useArrayDepthTexture=m.useArrayDepthTexture}_setTextureOptions(d={}){let p={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(d.mapping!==void 0)p.mapping=d.mapping;if(d.wrapS!==void 0)p.wrapS=d.wrapS;if(d.wrapT!==void 0)p.wrapT=d.wrapT;if(d.wrapR!==void 0)p.wrapR=d.wrapR;if(d.magFilter!==void 0)p.magFilter=d.magFilter;if(d.minFilter!==void 0)p.minFilter=d.minFilter;if(d.format!==void 0)p.format=d.format;if(d.type!==void 0)p.type=d.type;if(d.anisotropy!==void 0)p.anisotropy=d.anisotropy;if(d.colorSpace!==void 0)p.colorSpace=d.colorSpace;if(d.flipY!==void 0)p.flipY=d.flipY;if(d.generateMipmaps!==void 0)p.generateMipmaps=d.generateMipmaps;if(d.mipmapsAutoUpdate!==void 0)p.mipmapsAutoUpdate=d.mipmapsAutoUpdate;if(d.internalFormat!==void 0)p.internalFormat=d.internalFormat;for(let m=0;m<this.textures.length;m++)this.textures[m].setValues(p)}get texture(){return this.textures[0]}set texture(d){this.textures[0]=d}set depthTexture(d){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(d!==null&&d.renderTarget===null)d.renderTarget=this;this._depthTexture=d}get depthTexture(){return this._depthTexture}setSize(d,p,m=1){if(this.width!==d||this.height!==p||this.depth!==m){this.width=d,this.height=p,this.depth=m;for(let g=0,_=this.textures.length;g<_;g++)if(this.textures[g].image.width=d,this.textures[g].image.height=p,this.textures[g].image.depth=m,this.textures[g].isData3DTexture!==!0)this.textures[g].isArrayTexture=this.textures[g].image.depth>1;this.dispose()}this.viewport.set(0,0,d,p),this.scissor.set(0,0,d,p)}clone(){return new this.constructor().copy(this)}copy(d){this.width=d.width,this.height=d.height,this.depth=d.depth,this.scissor.copy(d.scissor),this.scissorTest=d.scissorTest,this.viewport.copy(d.viewport),this.textures.length=0;for(let p=0,m=d.textures.length;p<m;p++){this.textures[p]=d.textures[p].clone(),this.textures[p].isRenderTargetTexture=!0,this.textures[p].renderTarget=this;let g=Object.assign({},d.textures[p].image);this.textures[p].source=new wr(g)}if(this.depthBuffer=d.depthBuffer,this.stencilBuffer=d.stencilBuffer,this.resolveColorBuffer=d.resolveColorBuffer,this.resolveDepthBuffer=d.resolveDepthBuffer,this.resolveStencilBuffer=d.resolveStencilBuffer,this.storeMultisampledColorBuffer=d.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=d.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=d.storeMultisampledStencilBuffer,d.depthTexture!==null)if(d.depthTexture.renderTarget===d){let p=d.depthTexture.clone();p.renderTarget=null,this.depthTexture=p}else this.depthTexture=d.depthTexture;else this.depthTexture=null;return this.samples=d.samples,this.multiview=d.multiview,this.useArrayDepthTexture=d.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Dn extends Dc{constructor(d=1,p=1,m={}){super(d,p,m);this.isWebGLRenderTarget=!0}}class Go extends We{constructor(d=null,p=1,m=1,g=1){super(null);this.isDataArrayTexture=!0,this.image={data:d,width:p,height:m,depth:g},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(d){return super.copy(d),this.wrapR=d.wrapR,this}addLayerUpdate(d){this.layerUpdates.add(d)}clearLayerUpdates(){this.layerUpdates.clear()}}class Uc extends We{constructor(d=null,p=1,m=1,g=1){super(null);this.isData3DTexture=!0,this.image={data:d,width:p,height:m,depth:g},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(d){return super.copy(d),this.wrapR=d.wrapR,this}}class se{static{this.prototype.isMatrix4=!0}constructor(d,p,m,g,_,x,v,y,S,b,M,T,E,w,C,N){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],d!==void 0)this.set(d,p,m,g,_,x,v,y,S,b,M,T,E,w,C,N)}set(d,p,m,g,_,x,v,y,S,b,M,T,E,w,C,N){let A=this.elements;return A[0]=d,A[4]=p,A[8]=m,A[12]=g,A[1]=_,A[5]=x,A[9]=v,A[13]=y,A[2]=S,A[6]=b,A[10]=M,A[14]=T,A[3]=E,A[7]=w,A[11]=C,A[15]=N,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new se().fromArray(this.elements)}copy(d){let p=this.elements,m=d.elements;return p[0]=m[0],p[1]=m[1],p[2]=m[2],p[3]=m[3],p[4]=m[4],p[5]=m[5],p[6]=m[6],p[7]=m[7],p[8]=m[8],p[9]=m[9],p[10]=m[10],p[11]=m[11],p[12]=m[12],p[13]=m[13],p[14]=m[14],p[15]=m[15],this}copyPosition(d){let p=this.elements,m=d.elements;return p[12]=m[12],p[13]=m[13],p[14]=m[14],this}setFromMatrix3(d){let p=d.elements;return this.set(p[0],p[3],p[6],0,p[1],p[4],p[7],0,p[2],p[5],p[8],0,0,0,0,1),this}extractBasis(d,p,m){if(this.determinantAffine()===0)return d.set(1,0,0),p.set(0,1,0),m.set(0,0,1),this;return d.setFromMatrixColumn(this,0),p.setFromMatrixColumn(this,1),m.setFromMatrixColumn(this,2),this}makeBasis(d,p,m){return this.set(d.x,p.x,m.x,0,d.y,p.y,m.y,0,d.z,p.z,m.z,0,0,0,0,1),this}extractRotation(d){if(d.determinantAffine()===0)return this.identity();let p=this.elements,m=d.elements,g=1/ps.setFromMatrixColumn(d,0).length(),_=1/ps.setFromMatrixColumn(d,1).length(),x=1/ps.setFromMatrixColumn(d,2).length();return p[0]=m[0]*g,p[1]=m[1]*g,p[2]=m[2]*g,p[3]=0,p[4]=m[4]*_,p[5]=m[5]*_,p[6]=m[6]*_,p[7]=0,p[8]=m[8]*x,p[9]=m[9]*x,p[10]=m[10]*x,p[11]=0,p[12]=0,p[13]=0,p[14]=0,p[15]=1,this}makeRotationFromEuler(d){let p=this.elements,{x:m,y:g,z:_}=d,x=Math.cos(m),v=Math.sin(m),y=Math.cos(g),S=Math.sin(g),b=Math.cos(_),M=Math.sin(_);if(d.order==="XYZ"){let T=x*b,E=x*M,w=v*b,C=v*M;p[0]=y*b,p[4]=-y*M,p[8]=S,p[1]=E+w*S,p[5]=T-C*S,p[9]=-v*y,p[2]=C-T*S,p[6]=w+E*S,p[10]=x*y}else if(d.order==="YXZ"){let T=y*b,E=y*M,w=S*b,C=S*M;p[0]=T+C*v,p[4]=w*v-E,p[8]=x*S,p[1]=x*M,p[5]=x*b,p[9]=-v,p[2]=E*v-w,p[6]=C+T*v,p[10]=x*y}else if(d.order==="ZXY"){let T=y*b,E=y*M,w=S*b,C=S*M;p[0]=T-C*v,p[4]=-x*M,p[8]=w+E*v,p[1]=E+w*v,p[5]=x*b,p[9]=C-T*v,p[2]=-x*S,p[6]=v,p[10]=x*y}else if(d.order==="ZYX"){let T=x*b,E=x*M,w=v*b,C=v*M;p[0]=y*b,p[4]=w*S-E,p[8]=T*S+C,p[1]=y*M,p[5]=C*S+T,p[9]=E*S-w,p[2]=-S,p[6]=v*y,p[10]=x*y}else if(d.order==="YZX"){let T=x*y,E=x*S,w=v*y,C=v*S;p[0]=y*b,p[4]=C-T*M,p[8]=w*M+E,p[1]=M,p[5]=x*b,p[9]=-v*b,p[2]=-S*b,p[6]=E*M+w,p[10]=T-C*M}else if(d.order==="XZY"){let T=x*y,E=x*S,w=v*y,C=v*S;p[0]=y*b,p[4]=-M,p[8]=S*b,p[1]=T*M+C,p[5]=x*b,p[9]=E*M-w,p[2]=w*M-E,p[6]=v*b,p[10]=C*M+T}return p[3]=0,p[7]=0,p[11]=0,p[12]=0,p[13]=0,p[14]=0,p[15]=1,this}makeRotationFromQuaternion(d){return this.compose(Km,d,jm)}lookAt(d,p,m){let g=this.elements;if(Rn.subVectors(d,p),Rn.lengthSq()===0)Rn.z=1;if(Rn.normalize(),yi.crossVectors(m,Rn),yi.lengthSq()===0){if(Math.abs(m.z)===1)Rn.x+=0.0001;else Rn.z+=0.0001;Rn.normalize(),yi.crossVectors(m,Rn)}return yi.normalize(),no.crossVectors(Rn,yi),g[0]=yi.x,g[4]=no.x,g[8]=Rn.x,g[1]=yi.y,g[5]=no.y,g[9]=Rn.y,g[2]=yi.z,g[6]=no.z,g[10]=Rn.z,this}multiply(d){return this.multiplyMatrices(this,d)}premultiply(d){return this.multiplyMatrices(d,this)}multiplyMatrices(d,p){let m=d.elements,g=p.elements,_=this.elements,x=m[0],v=m[4],y=m[8],S=m[12],b=m[1],M=m[5],T=m[9],E=m[13],w=m[2],C=m[6],N=m[10],A=m[14],R=m[3],I=m[7],U=m[11],L=m[15],D=g[0],k=g[4],P=g[8],F=g[12],G=g[1],H=g[5],z=g[9],W=g[13],Z=g[2],V=g[6],Q=g[10],it=g[14],j=g[3],xt=g[7],rt=g[11],dt=g[15];return _[0]=x*D+v*G+y*Z+S*j,_[4]=x*k+v*H+y*V+S*xt,_[8]=x*P+v*z+y*Q+S*rt,_[12]=x*F+v*W+y*it+S*dt,_[1]=b*D+M*G+T*Z+E*j,_[5]=b*k+M*H+T*V+E*xt,_[9]=b*P+M*z+T*Q+E*rt,_[13]=b*F+M*W+T*it+E*dt,_[2]=w*D+C*G+N*Z+A*j,_[6]=w*k+C*H+N*V+A*xt,_[10]=w*P+C*z+N*Q+A*rt,_[14]=w*F+C*W+N*it+A*dt,_[3]=R*D+I*G+U*Z+L*j,_[7]=R*k+I*H+U*V+L*xt,_[11]=R*P+I*z+U*Q+L*rt,_[15]=R*F+I*W+U*it+L*dt,this}multiplyScalar(d){let p=this.elements;return p[0]*=d,p[4]*=d,p[8]*=d,p[12]*=d,p[1]*=d,p[5]*=d,p[9]*=d,p[13]*=d,p[2]*=d,p[6]*=d,p[10]*=d,p[14]*=d,p[3]*=d,p[7]*=d,p[11]*=d,p[15]*=d,this}determinant(){let d=this.elements,p=d[0],m=d[4],g=d[8],_=d[12],x=d[1],v=d[5],y=d[9],S=d[13],b=d[2],M=d[6],T=d[10],E=d[14],w=d[3],C=d[7],N=d[11],A=d[15],R=y*E-S*T,I=v*E-S*M,U=v*T-y*M,L=x*E-S*b,D=x*T-y*b,k=x*M-v*b;return p*(C*R-N*I+A*U)-m*(w*R-N*L+A*D)+g*(w*I-C*L+A*k)-_*(w*U-C*D+N*k)}determinantAffine(){let d=this.elements,p=d[0],m=d[4],g=d[8],_=d[1],x=d[5],v=d[9],y=d[2],S=d[6],b=d[10];return p*(x*b-v*S)-m*(_*b-v*y)+g*(_*S-x*y)}transpose(){let d=this.elements,p;return p=d[1],d[1]=d[4],d[4]=p,p=d[2],d[2]=d[8],d[8]=p,p=d[6],d[6]=d[9],d[9]=p,p=d[3],d[3]=d[12],d[12]=p,p=d[7],d[7]=d[13],d[13]=p,p=d[11],d[11]=d[14],d[14]=p,this}setPosition(d,p,m){let g=this.elements;if(d.isVector3)g[12]=d.x,g[13]=d.y,g[14]=d.z;else g[12]=d,g[13]=p,g[14]=m;return this}invert(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],b=d[8],M=d[9],T=d[10],E=d[11],w=d[12],C=d[13],N=d[14],A=d[15],R=p*v-m*x,I=p*y-g*x,U=p*S-_*x,L=m*y-g*v,D=m*S-_*v,k=g*S-_*y,P=b*C-M*w,F=b*N-T*w,G=b*A-E*w,H=M*N-T*C,z=M*A-E*C,W=T*A-E*N,Z=R*W-I*z+U*H+L*G-D*F+k*P;if(Z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/Z;return d[0]=(v*W-y*z+S*H)*V,d[1]=(g*z-m*W-_*H)*V,d[2]=(C*k-N*D+A*L)*V,d[3]=(T*D-M*k-E*L)*V,d[4]=(y*G-x*W-S*F)*V,d[5]=(p*W-g*G+_*F)*V,d[6]=(N*U-w*k-A*I)*V,d[7]=(b*k-T*U+E*I)*V,d[8]=(x*z-v*G+S*P)*V,d[9]=(m*G-p*z-_*P)*V,d[10]=(w*D-C*U+A*R)*V,d[11]=(M*U-b*D-E*R)*V,d[12]=(v*F-x*H-y*P)*V,d[13]=(p*H-m*F+g*P)*V,d[14]=(C*I-w*L-N*R)*V,d[15]=(b*L-M*I+T*R)*V,this}scale(d){let p=this.elements,{x:m,y:g,z:_}=d;return p[0]*=m,p[4]*=g,p[8]*=_,p[1]*=m,p[5]*=g,p[9]*=_,p[2]*=m,p[6]*=g,p[10]*=_,p[3]*=m,p[7]*=g,p[11]*=_,this}getMaxScaleOnAxis(){let d=this.elements,p=d[0]*d[0]+d[1]*d[1]+d[2]*d[2],m=d[4]*d[4]+d[5]*d[5]+d[6]*d[6],g=d[8]*d[8]+d[9]*d[9]+d[10]*d[10];return Math.sqrt(Math.max(p,m,g))}makeTranslation(d,p,m){if(d.isVector3)this.set(1,0,0,d.x,0,1,0,d.y,0,0,1,d.z,0,0,0,1);else this.set(1,0,0,d,0,1,0,p,0,0,1,m,0,0,0,1);return this}makeRotationX(d){let p=Math.cos(d),m=Math.sin(d);return this.set(1,0,0,0,0,p,-m,0,0,m,p,0,0,0,0,1),this}makeRotationY(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,0,m,0,0,1,0,0,-m,0,p,0,0,0,0,1),this}makeRotationZ(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,-m,0,0,m,p,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(d,p){let m=Math.cos(p),g=Math.sin(p),_=1-m,{x,y:v,z:y}=d,S=_*x,b=_*v;return this.set(S*x+m,S*v-g*y,S*y+g*v,0,S*v+g*y,b*v+m,b*y-g*x,0,S*y-g*v,b*y+g*x,_*y*y+m,0,0,0,0,1),this}makeScale(d,p,m){return this.set(d,0,0,0,0,p,0,0,0,0,m,0,0,0,0,1),this}makeShear(d,p,m,g,_,x){return this.set(1,m,_,0,d,1,x,0,p,g,1,0,0,0,0,1),this}compose(d,p,m){let g=this.elements,{_x:_,_y:x,_z:v,_w:y}=p,S=_+_,b=x+x,M=v+v,T=_*S,E=_*b,w=_*M,C=x*b,N=x*M,A=v*M,R=y*S,I=y*b,U=y*M,{x:L,y:D,z:k}=m;return g[0]=(1-(C+A))*L,g[1]=(E+U)*L,g[2]=(w-I)*L,g[3]=0,g[4]=(E-U)*D,g[5]=(1-(T+A))*D,g[6]=(N+R)*D,g[7]=0,g[8]=(w+I)*k,g[9]=(N-R)*k,g[10]=(1-(T+C))*k,g[11]=0,g[12]=d.x,g[13]=d.y,g[14]=d.z,g[15]=1,this}decompose(d,p,m){let g=this.elements;d.x=g[12],d.y=g[13],d.z=g[14];let _=this.determinantAffine();if(_===0)return m.set(1,1,1),p.identity(),this;let x=ps.set(g[0],g[1],g[2]).length(),v=ps.set(g[4],g[5],g[6]).length(),y=ps.set(g[8],g[9],g[10]).length();if(_<0)x=-x;Bn.copy(this);let S=1/x,b=1/v,M=1/y;return Bn.elements[0]*=S,Bn.elements[1]*=S,Bn.elements[2]*=S,Bn.elements[4]*=b,Bn.elements[5]*=b,Bn.elements[6]*=b,Bn.elements[8]*=M,Bn.elements[9]*=M,Bn.elements[10]*=M,p.setFromRotationMatrix(Bn),m.x=x,m.y=v,m.z=y,this}makePerspective(d,p,m,g,_,x,v=2000,y=!1){let S=this.elements,b=2*_/(p-d),M=2*_/(m-g),T=(p+d)/(p-d),E=(m+g)/(m-g),w,C;if(y)w=_/(x-_),C=x*_/(x-_);else if(v===2000)w=-(x+_)/(x-_),C=-2*x*_/(x-_);else if(v===2001)w=-x/(x-_),C=-x*_/(x-_);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+v);return S[0]=b,S[4]=0,S[8]=T,S[12]=0,S[1]=0,S[5]=M,S[9]=E,S[13]=0,S[2]=0,S[6]=0,S[10]=w,S[14]=C,S[3]=0,S[7]=0,S[11]=-1,S[15]=0,this}makeOrthographic(d,p,m,g,_,x,v=2000,y=!1){let S=this.elements,b=2/(p-d),M=2/(m-g),T=-(p+d)/(p-d),E=-(m+g)/(m-g),w,C;if(y)w=1/(x-_),C=x/(x-_);else if(v===2000)w=-2/(x-_),C=-(x+_)/(x-_);else if(v===2001)w=-1/(x-_),C=-_/(x-_);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+v);return S[0]=b,S[4]=0,S[8]=0,S[12]=T,S[1]=0,S[5]=M,S[9]=0,S[13]=E,S[2]=0,S[6]=0,S[10]=w,S[14]=C,S[3]=0,S[7]=0,S[11]=0,S[15]=1,this}equals(d){let p=this.elements,m=d.elements;for(let g=0;g<16;g++)if(p[g]!==m[g])return!1;return!0}fromArray(d,p=0){for(let m=0;m<16;m++)this.elements[m]=d[m+p];return this}toArray(d=[],p=0){let m=this.elements;return d[p]=m[0],d[p+1]=m[1],d[p+2]=m[2],d[p+3]=m[3],d[p+4]=m[4],d[p+5]=m[5],d[p+6]=m[6],d[p+7]=m[7],d[p+8]=m[8],d[p+9]=m[9],d[p+10]=m[10],d[p+11]=m[11],d[p+12]=m[12],d[p+13]=m[13],d[p+14]=m[14],d[p+15]=m[15],d}}var ps=new q,Bn=new se,Km=new q(0,0,0),jm=new q(1,1,1),yi=new q,no=new q,Rn=new q,Au=new se,Ru=new di;class li{constructor(d=0,p=0,m=0,g=li.DEFAULT_ORDER){this.isEuler=!0,this._x=d,this._y=p,this._z=m,this._order=g}get x(){return this._x}set x(d){this._x=d,this._onChangeCallback()}get y(){return this._y}set y(d){this._y=d,this._onChangeCallback()}get z(){return this._z}set z(d){this._z=d,this._onChangeCallback()}get order(){return this._order}set order(d){this._order=d,this._onChangeCallback()}set(d,p,m,g=this._order){return this._x=d,this._y=p,this._z=m,this._order=g,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(d){return this._x=d._x,this._y=d._y,this._z=d._z,this._order=d._order,this._onChangeCallback(),this}setFromRotationMatrix(d,p=this._order,m=!0){let g=d.elements,_=g[0],x=g[4],v=g[8],y=g[1],S=g[5],b=g[9],M=g[2],T=g[6],E=g[10];switch(p){case"XYZ":if(this._y=Math.asin(ne(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(-b,E),this._z=Math.atan2(-x,_);else this._x=Math.atan2(T,S),this._z=0;break;case"YXZ":if(this._x=Math.asin(-ne(b,-1,1)),Math.abs(b)<0.9999999)this._y=Math.atan2(v,E),this._z=Math.atan2(y,S);else this._y=Math.atan2(-M,_),this._z=0;break;case"ZXY":if(this._x=Math.asin(ne(T,-1,1)),Math.abs(T)<0.9999999)this._y=Math.atan2(-M,E),this._z=Math.atan2(-x,S);else this._y=0,this._z=Math.atan2(y,_);break;case"ZYX":if(this._y=Math.asin(-ne(M,-1,1)),Math.abs(M)<0.9999999)this._x=Math.atan2(T,E),this._z=Math.atan2(y,_);else this._x=0,this._z=Math.atan2(-x,S);break;case"YZX":if(this._z=Math.asin(ne(y,-1,1)),Math.abs(y)<0.9999999)this._x=Math.atan2(-b,S),this._y=Math.atan2(-M,_);else this._x=0,this._y=Math.atan2(v,E);break;case"XZY":if(this._z=Math.asin(-ne(x,-1,1)),Math.abs(x)<0.9999999)this._x=Math.atan2(T,S),this._y=Math.atan2(v,_);else this._x=Math.atan2(-b,E),this._y=0;break;default:qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+p)}if(this._order=p,m===!0)this._onChangeCallback();return this}setFromQuaternion(d,p,m){return Au.makeRotationFromQuaternion(d),this.setFromRotationMatrix(Au,p,m)}setFromVector3(d,p=this._order){return this.set(d.x,d.y,d.z,p)}reorder(d){return Ru.setFromEuler(this),this.setFromQuaternion(Ru,d)}equals(d){return d._x===this._x&&d._y===this._y&&d._z===this._z&&d._order===this._order}fromArray(d){if(this._x=d[0],this._y=d[1],this._z=d[2],d[3]!==void 0)this._order=d[3];return this._onChangeCallback(),this}toArray(d=[],p=0){return d[p]=this._x,d[p+1]=this._y,d[p+2]=this._z,d[p+3]=this._order,d}_onChange(d){return this._onChangeCallback=d,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}li.DEFAULT_ORDER="XYZ";class Ar{constructor(){this.mask=1}set(d){this.mask=(1<<d|0)>>>0}enable(d){this.mask|=1<<d|0}enableAll(){this.mask=-1}toggle(d){this.mask^=1<<d|0}disable(d){this.mask&=~(1<<d|0)}disableAll(){this.mask=0}test(d){return(this.mask&d.mask)!==0}isEnabled(d){return(this.mask&(1<<d|0))!==0}}var Qm=0,Cu=new q,ms=new di,ei=new se,io=new q,lr=new q,tg=new q,eg=new di,Pu=new q(1,0,0),Iu=new q(0,1,0),Lu=new q(0,0,1),Nu={type:"added"},ng={type:"removed"},gs={type:"childadded",child:null},ol={type:"childremoved",child:null};class qe extends ui{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Qm++}),this.uuid=Ci(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=qe.DEFAULT_UP.clone();let d=new q,p=new li,m=new di,g=new q(1,1,1);function _(){m.setFromEuler(p,!1)}function x(){p.setFromQuaternion(m,void 0,!1)}p._onChange(_),m._onChange(x),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:d},rotation:{configurable:!0,enumerable:!0,value:p},quaternion:{configurable:!0,enumerable:!0,value:m},scale:{configurable:!0,enumerable:!0,value:g},modelViewMatrix:{value:new se},normalMatrix:{value:new Qt}}),this.matrix=new se,this.matrixWorld=new se,this.matrixAutoUpdate=qe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ar,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(d){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(d),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(d){return this.quaternion.premultiply(d),this}setRotationFromAxisAngle(d,p){this.quaternion.setFromAxisAngle(d,p)}setRotationFromEuler(d){this.quaternion.setFromEuler(d,!0)}setRotationFromMatrix(d){this.quaternion.setFromRotationMatrix(d)}setRotationFromQuaternion(d){this.quaternion.copy(d)}rotateOnAxis(d,p){return ms.setFromAxisAngle(d,p),this.quaternion.multiply(ms),this}rotateOnWorldAxis(d,p){return ms.setFromAxisAngle(d,p),this.quaternion.premultiply(ms),this}rotateX(d){return this.rotateOnAxis(Pu,d)}rotateY(d){return this.rotateOnAxis(Iu,d)}rotateZ(d){return this.rotateOnAxis(Lu,d)}translateOnAxis(d,p){return Cu.copy(d).applyQuaternion(this.quaternion),this.position.add(Cu.multiplyScalar(p)),this}translateX(d){return this.translateOnAxis(Pu,d)}translateY(d){return this.translateOnAxis(Iu,d)}translateZ(d){return this.translateOnAxis(Lu,d)}localToWorld(d){return this.updateWorldMatrix(!0,!1),d.applyMatrix4(this.matrixWorld)}worldToLocal(d){return this.updateWorldMatrix(!0,!1),d.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(d,p,m){if(d.isVector3)io.copy(d);else io.set(d,p,m);let g=this.parent;if(this.updateWorldMatrix(!0,!1),lr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)ei.lookAt(lr,io,this.up);else ei.lookAt(io,lr,this.up);if(this.quaternion.setFromRotationMatrix(ei),g)ei.extractRotation(g.matrixWorld),ms.setFromRotationMatrix(ei),this.quaternion.premultiply(ms.invert())}add(d){if(arguments.length>1){for(let p=0;p<arguments.length;p++)this.add(arguments[p]);return this}if(d===this)return Zt("Object3D.add: object can't be added as a child of itself.",d),this;if(d&&d.isObject3D)d.removeFromParent(),d.parent=this,this.children.push(d),d.dispatchEvent(Nu),gs.child=d,this.dispatchEvent(gs),gs.child=null;else Zt("Object3D.add: object not an instance of THREE.Object3D.",d);return this}remove(d){if(arguments.length>1){for(let m=0;m<arguments.length;m++)this.remove(arguments[m]);return this}let p=this.children.indexOf(d);if(p!==-1)d.parent=null,this.children.splice(p,1),d.dispatchEvent(ng),ol.child=d,this.dispatchEvent(ol),ol.child=null;return this}removeFromParent(){let d=this.parent;if(d!==null)d.remove(this);return this}clear(){return this.remove(...this.children)}attach(d){if(this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),d.parent!==null)d.parent.updateWorldMatrix(!0,!1),ei.multiply(d.parent.matrixWorld);return d.applyMatrix4(ei),d.removeFromParent(),d.parent=this,this.children.push(d),d.updateWorldMatrix(!1,!0),d.dispatchEvent(Nu),gs.child=d,this.dispatchEvent(gs),gs.child=null,this}getObjectById(d){return this.getObjectByProperty("id",d)}getObjectByName(d){return this.getObjectByProperty("name",d)}getObjectByProperty(d,p){if(this[d]===p)return this;for(let m=0,g=this.children.length;m<g;m++){let x=this.children[m].getObjectByProperty(d,p);if(x!==void 0)return x}return}getObjectsByProperty(d,p,m=[]){if(this[d]===p)m.push(this);let g=this.children;for(let _=0,x=g.length;_<x;_++)g[_].getObjectsByProperty(d,p,m);return m}getWorldPosition(d){return this.updateWorldMatrix(!0,!1),d.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(d){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lr,d,tg),d}getWorldScale(d){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(lr,eg,d),d}getWorldDirection(d){this.updateWorldMatrix(!0,!1);let p=this.matrixWorld.elements;return d.set(p[8],p[9],p[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(d){d(this);let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].traverse(d)}traverseVisible(d){if(this.visible===!1)return;d(this);let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].traverseVisible(d)}traverseAncestors(d){let p=this.parent;if(p!==null)d(p),p.traverseAncestors(d)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let d=this.pivot;if(d!==null){let{x:p,y:m,z:g}=d,_=this.matrix.elements;_[12]+=p-_[0]*p-_[4]*m-_[8]*g,_[13]+=m-_[1]*p-_[5]*m-_[9]*g,_[14]+=g-_[2]*p-_[6]*m-_[10]*g}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(d){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||d){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,d=!0}let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].updateMatrixWorld(d)}updateWorldMatrix(d,p,m=!1){let g=this.parent;if(d===!0&&g!==null)g.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||m){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,m=!0}if(p===!0){let _=this.children;for(let x=0,v=_.length;x<v;x++)_[x].updateWorldMatrix(!1,!0,m)}}toJSON(d){let p=d===void 0||typeof d==="string",m={};if(p)d={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},m.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let g={};if(g.uuid=this.uuid,g.type=this.type,g.name=this.name,g.castShadow=this.castShadow,g.receiveShadow=this.receiveShadow,g.visible=this.visible,g.frustumCulled=this.frustumCulled,g.renderOrder=this.renderOrder,g.static=this.static,g.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)g.userData=this.userData;if(g.layers=this.layers.mask,g.matrix=this.matrix.toArray(),g.up=this.up.toArray(),this.pivot!==null)g.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)g.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)g.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(g.type="InstancedMesh",g.count=this.count,g.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)g.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(g.type="BatchedMesh",g.perObjectFrustumCulled=this.perObjectFrustumCulled,g.sortObjects=this.sortObjects,g.drawRanges=this._drawRanges,g.reservedRanges=this._reservedRanges,g.geometryInfo=this._geometryInfo.map((v)=>({...v,boundingBox:v.boundingBox?v.boundingBox.toJSON():void 0,boundingSphere:v.boundingSphere?v.boundingSphere.toJSON():void 0})),g.instanceInfo=this._instanceInfo.map((v)=>({...v})),g.availableInstanceIds=this._availableInstanceIds.slice(),g.availableGeometryIds=this._availableGeometryIds.slice(),g.nextIndexStart=this._nextIndexStart,g.nextVertexStart=this._nextVertexStart,g.geometryCount=this._geometryCount,g.maxInstanceCount=this._maxInstanceCount,g.maxVertexCount=this._maxVertexCount,g.maxIndexCount=this._maxIndexCount,g.geometryInitialized=this._geometryInitialized,g.matricesTexture=this._matricesTexture.toJSON(d),g.indirectTexture=this._indirectTexture.toJSON(d),this._colorsTexture!==null)g.colorsTexture=this._colorsTexture.toJSON(d);if(this.boundingSphere!==null)g.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)g.boundingBox=this.boundingBox.toJSON()}function _(v,y){if(v[y.uuid]===void 0)v[y.uuid]=y.toJSON(d);return y.uuid}if(this.isScene){if(this.background){if(this.background.isColor)g.background=this.background.toJSON();else if(this.background.isTexture)g.background=this.background.toJSON(d).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)g.environment=this.environment.toJSON(d).uuid}else if(this.isMesh||this.isLine||this.isPoints){g.geometry=_(d.geometries,this.geometry);let v=this.geometry.parameters;if(v!==void 0&&v.shapes!==void 0){let y=v.shapes;if(Array.isArray(y))for(let S=0,b=y.length;S<b;S++){let M=y[S];_(d.shapes,M)}else _(d.shapes,y)}}if(this.isSkinnedMesh){if(g.bindMode=this.bindMode,g.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)_(d.skeletons,this.skeleton),g.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let v=[];for(let y=0,S=this.material.length;y<S;y++)v.push(_(d.materials,this.material[y]));g.material=v}else g.material=_(d.materials,this.material);if(this.children.length>0){g.children=[];for(let v=0;v<this.children.length;v++)g.children.push(this.children[v].toJSON(d).object)}if(this.animations.length>0){g.animations=[];for(let v=0;v<this.animations.length;v++){let y=this.animations[v];g.animations.push(_(d.animations,y))}}if(p){let v=x(d.geometries),y=x(d.materials),S=x(d.textures),b=x(d.images),M=x(d.shapes),T=x(d.skeletons),E=x(d.animations),w=x(d.nodes);if(v.length>0)m.geometries=v;if(y.length>0)m.materials=y;if(S.length>0)m.textures=S;if(b.length>0)m.images=b;if(M.length>0)m.shapes=M;if(T.length>0)m.skeletons=T;if(E.length>0)m.animations=E;if(w.length>0)m.nodes=w}return m.object=g,m;function x(v){let y=[];for(let S in v){let b=v[S];delete b.metadata,y.push(b)}return y}}clone(d){return new this.constructor().copy(this,d)}copy(d,p=!0){if(this.name=d.name,this.up.copy(d.up),this.position.copy(d.position),this.rotation.order=d.rotation.order,this.quaternion.copy(d.quaternion),this.scale.copy(d.scale),this.pivot=d.pivot!==null?d.pivot.clone():null,this.matrix.copy(d.matrix),this.matrixWorld.copy(d.matrixWorld),this.matrixAutoUpdate=d.matrixAutoUpdate,this.matrixWorldAutoUpdate=d.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=d.matrixWorldNeedsUpdate,this.layers.mask=d.layers.mask,this.visible=d.visible,this.castShadow=d.castShadow,this.receiveShadow=d.receiveShadow,this.frustumCulled=d.frustumCulled,this.renderOrder=d.renderOrder,this.static=d.static,this.animations=d.animations.slice(),this.userData=JSON.parse(JSON.stringify(d.userData)),p===!0)for(let m=0;m<d.children.length;m++){let g=d.children[m];this.add(g.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}qe.DEFAULT_UP=new q(0,1,0);qe.DEFAULT_MATRIX_AUTO_UPDATE=!0;qe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Rs extends qe{constructor(){super();this.isGroup=!0,this.type="Group"}}var ig={type:"move"};class Rr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Rs,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Rs,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Rs,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(d){if(this._targetRay!==null)this._targetRay.dispatchEvent(d);if(this._grip!==null)this._grip.dispatchEvent(d);if(this._hand!==null)this._hand.dispatchEvent(d);return this}connect(d){if(d&&d.hand){let p=this._hand;if(p)for(let m of d.hand.values())this._getHandJoint(p,m)}return this.dispatchEvent({type:"connected",data:d}),this}disconnect(d){if(this.dispatchEvent({type:"disconnected",data:d}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(d,p,m){let g=null,_=null,x=null,v=this._targetRay,y=this._grip,S=this._hand;if(d&&p.session.visibilityState!=="visible-blurred"){if(S&&d.hand){x=!0;for(let C of d.hand.values()){let N=p.getJointPose(C,m),A=this._getHandJoint(S,C);if(N!==null)A.matrix.fromArray(N.transform.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale),A.matrixWorldNeedsUpdate=!0,A.jointRadius=N.radius;A.visible=N!==null}let b=S.joints["index-finger-tip"],M=S.joints["thumb-tip"],T=b.position.distanceTo(M.position),E=0.02,w=0.005;if(S.inputState.pinching&&T>E+w)S.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:d.handedness,target:this});else if(!S.inputState.pinching&&T<=E-w)S.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:d.handedness,target:this})}else if(y!==null&&d.gripSpace){if(_=p.getPose(d.gripSpace,m),_!==null){if(y.matrix.fromArray(_.transform.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale),y.matrixWorldNeedsUpdate=!0,_.linearVelocity)y.hasLinearVelocity=!0,y.linearVelocity.copy(_.linearVelocity);else y.hasLinearVelocity=!1;if(_.angularVelocity)y.hasAngularVelocity=!0,y.angularVelocity.copy(_.angularVelocity);else y.hasAngularVelocity=!1;if(y.eventsEnabled)y.dispatchEvent({type:"gripUpdated",data:d,target:this})}}if(v!==null){if(g=p.getPose(d.targetRaySpace,m),g===null&&_!==null)g=_;if(g!==null){if(v.matrix.fromArray(g.transform.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale),v.matrixWorldNeedsUpdate=!0,g.linearVelocity)v.hasLinearVelocity=!0,v.linearVelocity.copy(g.linearVelocity);else v.hasLinearVelocity=!1;if(g.angularVelocity)v.hasAngularVelocity=!0,v.angularVelocity.copy(g.angularVelocity);else v.hasAngularVelocity=!1;this.dispatchEvent(ig)}}}if(v!==null)v.visible=g!==null;if(y!==null)y.visible=_!==null;if(S!==null)S.visible=x!==null;return this}_getHandJoint(d,p){if(d.joints[p.jointName]===void 0){let m=new Rs;m.matrixAutoUpdate=!1,m.visible=!1,d.joints[p.jointName]=m,d.add(m)}return d.joints[p.jointName]}}var sf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},so={h:0,s:0,l:0};function al(d,p,m){if(m<0)m+=1;if(m>1)m-=1;if(m<0.16666666666666666)return d+(p-d)*6*m;if(m<0.5)return p;if(m<0.6666666666666666)return d+(p-d)*6*(0.6666666666666666-m);return d}class re{constructor(d,p,m){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(d,p,m)}set(d,p,m){if(p===void 0&&m===void 0){let g=d;if(g&&g.isColor)this.copy(g);else if(typeof g==="number")this.setHex(g);else if(typeof g==="string")this.setStyle(g)}else this.setRGB(d,p,m);return this}setScalar(d){return this.r=d,this.g=d,this.b=d,this}setHex(d,p="srgb"){return d=Math.floor(d),this.r=(d>>16&255)/255,this.g=(d>>8&255)/255,this.b=(d&255)/255,he.colorSpaceToWorking(this,p),this}setRGB(d,p,m,g=he.workingColorSpace){return this.r=d,this.g=p,this.b=m,he.colorSpaceToWorking(this,g),this}setHSL(d,p,m,g=he.workingColorSpace){if(d=Cc(d,1),p=ne(p,0,1),m=ne(m,0,1),p===0)this.r=this.g=this.b=m;else{let _=m<=0.5?m*(1+p):m+p-m*p,x=2*m-_;this.r=al(x,_,d+0.3333333333333333),this.g=al(x,_,d),this.b=al(x,_,d-0.3333333333333333)}return he.colorSpaceToWorking(this,g),this}setStyle(d,p="srgb"){function m(_){if(_===void 0)return;if(parseFloat(_)<1)qt("Color: Alpha component of "+d+" will be ignored.")}let g;if(g=/^(\w+)\(([^\)]*)\)/.exec(d)){let _,x=g[1],v=g[2];switch(x){case"rgb":case"rgba":if(_=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setRGB(Math.min(255,parseInt(_[1],10))/255,Math.min(255,parseInt(_[2],10))/255,Math.min(255,parseInt(_[3],10))/255,p);if(_=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setRGB(Math.min(100,parseFloat(_[1]))/100,Math.min(100,parseFloat(_[2]))/100,Math.min(100,parseFloat(_[3]))/100,p);break;case"hsl":case"hsla":if(_=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setHSL(parseFloat(_[1])/360,parseFloat(_[2])/100,parseFloat(_[3])/100,p);break;default:qt("Color: Unknown color model "+d)}}else if(g=/^\#([A-Fa-f\d]+)$/.exec(d)){let _=g[1],x=_.length;if(x===3)return this.setRGB(parseInt(_.charAt(0),16)/15,parseInt(_.charAt(1),16)/15,parseInt(_.charAt(2),16)/15,p);else if(x===6)return this.setHex(parseInt(_,16),p);else qt("Color: Invalid hex color "+d)}else if(d&&d.length>0)return this.setColorName(d,p);return this}setColorName(d,p="srgb"){let m=sf[d.toLowerCase()];if(m!==void 0)this.setHex(m,p);else qt("Color: Unknown color "+d);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(d){return this.r=d.r,this.g=d.g,this.b=d.b,this}copySRGBToLinear(d){return this.r=ai(d.r),this.g=ai(d.g),this.b=ai(d.b),this}copyLinearToSRGB(d){return this.r=Cs(d.r),this.g=Cs(d.g),this.b=Cs(d.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(d="srgb"){return he.workingToColorSpace(dn.copy(this),d),Math.round(ne(dn.r*255,0,255))*65536+Math.round(ne(dn.g*255,0,255))*256+Math.round(ne(dn.b*255,0,255))}getHexString(d="srgb"){return("000000"+this.getHex(d).toString(16)).slice(-6)}getHSL(d,p=he.workingColorSpace){he.workingToColorSpace(dn.copy(this),p);let{r:m,g,b:_}=dn,x=Math.max(m,g,_),v=Math.min(m,g,_),y,S,b=(v+x)/2;if(v===x)y=0,S=0;else{let M=x-v;switch(S=b<=0.5?M/(x+v):M/(2-x-v),x){case m:y=(g-_)/M+(g<_?6:0);break;case g:y=(_-m)/M+2;break;case _:y=(m-g)/M+4;break}y/=6}return d.h=y,d.s=S,d.l=b,d}getRGB(d,p=he.workingColorSpace){return he.workingToColorSpace(dn.copy(this),p),d.r=dn.r,d.g=dn.g,d.b=dn.b,d}getStyle(d="srgb"){he.workingToColorSpace(dn.copy(this),d);let{r:p,g:m,b:g}=dn;if(d!=="srgb")return`color(${d} ${p.toFixed(3)} ${m.toFixed(3)} ${g.toFixed(3)})`;return`rgb(${Math.round(p*255)},${Math.round(m*255)},${Math.round(g*255)})`}offsetHSL(d,p,m){return this.getHSL(Si),this.setHSL(Si.h+d,Si.s+p,Si.l+m)}add(d){return this.r+=d.r,this.g+=d.g,this.b+=d.b,this}addColors(d,p){return this.r=d.r+p.r,this.g=d.g+p.g,this.b=d.b+p.b,this}addScalar(d){return this.r+=d,this.g+=d,this.b+=d,this}sub(d){return this.r=Math.max(0,this.r-d.r),this.g=Math.max(0,this.g-d.g),this.b=Math.max(0,this.b-d.b),this}multiply(d){return this.r*=d.r,this.g*=d.g,this.b*=d.b,this}multiplyScalar(d){return this.r*=d,this.g*=d,this.b*=d,this}lerp(d,p){return this.r+=(d.r-this.r)*p,this.g+=(d.g-this.g)*p,this.b+=(d.b-this.b)*p,this}lerpColors(d,p,m){return this.r=d.r+(p.r-d.r)*m,this.g=d.g+(p.g-d.g)*m,this.b=d.b+(p.b-d.b)*m,this}lerpHSL(d,p){this.getHSL(Si),d.getHSL(so);let m=mr(Si.h,so.h,p),g=mr(Si.s,so.s,p),_=mr(Si.l,so.l,p);return this.setHSL(m,g,_),this}setFromVector3(d){return this.r=d.x,this.g=d.y,this.b=d.z,this}applyMatrix3(d){let p=this.r,m=this.g,g=this.b,_=d.elements;return this.r=_[0]*p+_[3]*m+_[6]*g,this.g=_[1]*p+_[4]*m+_[7]*g,this.b=_[2]*p+_[5]*m+_[8]*g,this}equals(d){return d.r===this.r&&d.g===this.g&&d.b===this.b}fromArray(d,p=0){return this.r=d[p],this.g=d[p+1],this.b=d[p+2],this}toArray(d=[],p=0){return d[p]=this.r,d[p+1]=this.g,d[p+2]=this.b,d}fromBufferAttribute(d,p){return this.r=d.getX(p),this.g=d.getY(p),this.b=d.getZ(p),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var dn=new re;re.NAMES=sf;class Vo extends qe{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new li,this.environmentIntensity=1,this.environmentRotation=new li,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(d,p){return super.copy(d,p),this.background=d.background!==null?d.background.clone():null,this.environment=d.environment!==null?d.environment.clone():null,this.fog=d.fog!==null?d.fog.clone():null,this.backgroundBlurriness=d.backgroundBlurriness,this.backgroundIntensity=d.backgroundIntensity,this.backgroundRotation.copy(d.backgroundRotation),this.environmentIntensity=d.environmentIntensity,this.environmentRotation.copy(d.environmentRotation),this.overrideMaterial=d.overrideMaterial!==null?d.overrideMaterial.clone():null,this.matrixAutoUpdate=d.matrixAutoUpdate,this}toJSON(d){let p=super.toJSON(d);if(this.fog!==null)p.object.fog=this.fog.toJSON();return p.object.backgroundBlurriness=this.backgroundBlurriness,p.object.backgroundIntensity=this.backgroundIntensity,p.object.backgroundRotation=this.backgroundRotation.toArray(),p.object.environmentIntensity=this.environmentIntensity,p.object.environmentRotation=this.environmentRotation.toArray(),p}}var kn=new q,ni=new q,ll=new q,ii=new q,_s=new q,xs=new q,Du=new q,cl=new q,hl=new q,ul=new q,dl=new Oe,fl=new Oe,pl=new Oe;class Ve{constructor(d=new q,p=new q,m=new q){this.a=d,this.b=p,this.c=m}static getNormal(d,p,m,g){g.subVectors(m,p),kn.subVectors(d,p),g.cross(kn);let _=g.lengthSq();if(_>0)return g.multiplyScalar(1/Math.sqrt(_));return g.set(0,0,0)}static getBarycoord(d,p,m,g,_){kn.subVectors(g,p),ni.subVectors(m,p),ll.subVectors(d,p);let x=kn.dot(kn),v=kn.dot(ni),y=kn.dot(ll),S=ni.dot(ni),b=ni.dot(ll),M=x*S-v*v;if(M===0)return _.set(0,0,0),null;let T=1/M,E=(S*y-v*b)*T,w=(x*b-v*y)*T;return _.set(1-E-w,w,E)}static containsPoint(d,p,m,g){if(this.getBarycoord(d,p,m,g,ii)===null)return!1;return ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(d,p,m,g,_,x,v,y){if(this.getBarycoord(d,p,m,g,ii)===null){if(y.x=0,y.y=0,"z"in y)y.z=0;if("w"in y)y.w=0;return null}return y.setScalar(0),y.addScaledVector(_,ii.x),y.addScaledVector(x,ii.y),y.addScaledVector(v,ii.z),y}static getInterpolatedAttribute(d,p,m,g,_,x){return dl.setScalar(0),fl.setScalar(0),pl.setScalar(0),dl.fromBufferAttribute(d,p),fl.fromBufferAttribute(d,m),pl.fromBufferAttribute(d,g),x.setScalar(0),x.addScaledVector(dl,_.x),x.addScaledVector(fl,_.y),x.addScaledVector(pl,_.z),x}static isFrontFacing(d,p,m,g){return kn.subVectors(m,p),ni.subVectors(d,p),kn.cross(ni).dot(g)<0}set(d,p,m){return this.a.copy(d),this.b.copy(p),this.c.copy(m),this}setFromPointsAndIndices(d,p,m,g){return this.a.copy(d[p]),this.b.copy(d[m]),this.c.copy(d[g]),this}setFromAttributeAndIndices(d,p,m,g){return this.a.fromBufferAttribute(d,p),this.b.fromBufferAttribute(d,m),this.c.fromBufferAttribute(d,g),this}clone(){return new this.constructor().copy(this)}copy(d){return this.a.copy(d.a),this.b.copy(d.b),this.c.copy(d.c),this}getArea(){return kn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),kn.cross(ni).length()*0.5}getMidpoint(d){return d.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(d){return Ve.getNormal(this.a,this.b,this.c,d)}getPlane(d){return d.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(d,p){return Ve.getBarycoord(d,this.a,this.b,this.c,p)}getInterpolation(d,p,m,g,_){return Ve.getInterpolation(d,this.a,this.b,this.c,p,m,g,_)}containsPoint(d){return Ve.containsPoint(d,this.a,this.b,this.c)}isFrontFacing(d){return Ve.isFrontFacing(this.a,this.b,this.c,d)}intersectsBox(d){return d.intersectsTriangle(this)}closestPointToPoint(d,p){let m=this.a,g=this.b,_=this.c,x,v;_s.subVectors(g,m),xs.subVectors(_,m),cl.subVectors(d,m);let y=_s.dot(cl),S=xs.dot(cl);if(y<=0&&S<=0)return p.copy(m);hl.subVectors(d,g);let b=_s.dot(hl),M=xs.dot(hl);if(b>=0&&M<=b)return p.copy(g);let T=y*M-b*S;if(T<=0&&y>=0&&b<=0&&y-b>0)return x=y/(y-b),p.copy(m).addScaledVector(_s,x);ul.subVectors(d,_);let E=_s.dot(ul),w=xs.dot(ul);if(w>=0&&E<=w)return p.copy(_);let C=E*S-y*w;if(C<=0&&S>=0&&w<=0)return v=S/(S-w),p.copy(m).addScaledVector(xs,v);let N=b*w-E*M;if(N<=0&&M-b>=0&&E-w>=0)return Du.subVectors(_,g),v=(M-b)/(M-b+(E-w)),p.copy(g).addScaledVector(Du,v);let A=1/(N+C+T);return x=C*A,v=T*A,p.copy(m).addScaledVector(_s,x).addScaledVector(xs,v)}equals(d){return d.a.equals(this.a)&&d.b.equals(this.b)&&d.c.equals(this.c)}}class Se{constructor(d=new q(1/0,1/0,1/0),p=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=d,this.max=p}set(d,p){return this.min.copy(d),this.max.copy(p),this}setFromArray(d){this.makeEmpty();for(let p=0,m=d.length;p<m;p+=3)this.expandByPoint(zn.fromArray(d,p));return this}setFromBufferAttribute(d){this.makeEmpty();for(let p=0,m=d.count;p<m;p++)this.expandByPoint(zn.fromBufferAttribute(d,p));return this}setFromPoints(d){this.makeEmpty();for(let p=0,m=d.length;p<m;p++)this.expandByPoint(d[p]);return this}setFromCenterAndSize(d,p){let m=zn.copy(p).multiplyScalar(0.5);return this.min.copy(d).sub(m),this.max.copy(d).add(m),this}setFromObject(d,p=!1){return this.makeEmpty(),this.expandByObject(d,p)}clone(){return new this.constructor().copy(this)}copy(d){return this.min.copy(d.min),this.max.copy(d.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(d){return this.isEmpty()?d.set(0,0,0):d.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(d){return this.isEmpty()?d.set(0,0,0):d.subVectors(this.max,this.min)}expandByPoint(d){return this.min.min(d),this.max.max(d),this}expandByVector(d){return this.min.sub(d),this.max.add(d),this}expandByScalar(d){return this.min.addScalar(-d),this.max.addScalar(d),this}expandByObject(d,p=!1){d.updateWorldMatrix(!1,!1);let m=d.geometry;if(m!==void 0){let _=m.getAttribute("position");if(p===!0&&_!==void 0&&d.isInstancedMesh!==!0&&d.isBatchedMesh!==!0)for(let x=0,v=_.count;x<v;x++){if(d.isMesh===!0)d.getVertexPosition(x,zn);else zn.fromBufferAttribute(_,x);zn.applyMatrix4(d.matrixWorld),this.expandByPoint(zn)}else{if(d.boundingBox!==void 0){if(d.boundingBox===null)d.computeBoundingBox();ro.copy(d.boundingBox)}else{if(m.boundingBox===null)m.computeBoundingBox();ro.copy(m.boundingBox)}ro.applyMatrix4(d.matrixWorld),this.union(ro)}}let g=d.children;for(let _=0,x=g.length;_<x;_++)this.expandByObject(g[_],p);return this}containsPoint(d){return d.x>=this.min.x&&d.x<=this.max.x&&d.y>=this.min.y&&d.y<=this.max.y&&d.z>=this.min.z&&d.z<=this.max.z}containsBox(d){return this.min.x<=d.min.x&&d.max.x<=this.max.x&&this.min.y<=d.min.y&&d.max.y<=this.max.y&&this.min.z<=d.min.z&&d.max.z<=this.max.z}getParameter(d,p){return p.set((d.x-this.min.x)/(this.max.x-this.min.x),(d.y-this.min.y)/(this.max.y-this.min.y),(d.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(d){return d.max.x>=this.min.x&&d.min.x<=this.max.x&&d.max.y>=this.min.y&&d.min.y<=this.max.y&&d.max.z>=this.min.z&&d.min.z<=this.max.z}intersectsSphere(d){return this.clampPoint(d.center,zn),zn.distanceToSquared(d.center)<=d.radius*d.radius}intersectsPlane(d){let p,m;if(d.normal.x>0)p=d.normal.x*this.min.x,m=d.normal.x*this.max.x;else p=d.normal.x*this.max.x,m=d.normal.x*this.min.x;if(d.normal.y>0)p+=d.normal.y*this.min.y,m+=d.normal.y*this.max.y;else p+=d.normal.y*this.max.y,m+=d.normal.y*this.min.y;if(d.normal.z>0)p+=d.normal.z*this.min.z,m+=d.normal.z*this.max.z;else p+=d.normal.z*this.max.z,m+=d.normal.z*this.min.z;return p<=-d.constant&&m>=-d.constant}intersectsTriangle(d){if(this.isEmpty())return!1;this.getCenter(cr),oo.subVectors(this.max,cr),vs.subVectors(d.a,cr),ys.subVectors(d.b,cr),Ss.subVectors(d.c,cr),bi.subVectors(ys,vs),Mi.subVectors(Ss,ys),Gi.subVectors(vs,Ss);let p=[0,-bi.z,bi.y,0,-Mi.z,Mi.y,0,-Gi.z,Gi.y,bi.z,0,-bi.x,Mi.z,0,-Mi.x,Gi.z,0,-Gi.x,-bi.y,bi.x,0,-Mi.y,Mi.x,0,-Gi.y,Gi.x,0];if(!ml(p,vs,ys,Ss,oo))return!1;if(p=[1,0,0,0,1,0,0,0,1],!ml(p,vs,ys,Ss,oo))return!1;return ao.crossVectors(bi,Mi),p=[ao.x,ao.y,ao.z],ml(p,vs,ys,Ss,oo)}clampPoint(d,p){return p.copy(d).clamp(this.min,this.max)}distanceToPoint(d){return this.clampPoint(d,zn).distanceTo(d)}getBoundingSphere(d){if(this.isEmpty())d.makeEmpty();else this.getCenter(d.center),d.radius=this.getSize(zn).length()*0.5;return d}intersect(d){if(this.min.max(d.min),this.max.min(d.max),this.isEmpty())this.makeEmpty();return this}union(d){return this.min.min(d.min),this.max.max(d.max),this}applyMatrix4(d){if(this.isEmpty())return this;return si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(d),si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(d),si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(d),si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(d),si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(d),si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(d),si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(d),si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(d),this.setFromPoints(si),this}translate(d){return this.min.add(d),this.max.add(d),this}equals(d){return d.min.equals(this.min)&&d.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(d){return this.min.fromArray(d.min),this.max.fromArray(d.max),this}}var si=[new q,new q,new q,new q,new q,new q,new q,new q],zn=new q,ro=new Se,vs=new q,ys=new q,Ss=new q,bi=new q,Mi=new q,Gi=new q,cr=new q,oo=new q,ao=new q,Vi=new q;function ml(d,p,m,g,_){for(let x=0,v=d.length-3;x<=v;x+=3){Vi.fromArray(d,x);let y=_.x*Math.abs(Vi.x)+_.y*Math.abs(Vi.y)+_.z*Math.abs(Vi.z),S=p.dot(Vi),b=m.dot(Vi),M=g.dot(Vi);if(Math.max(-Math.max(S,b,M),Math.min(S,b,M))>y)return!1}return!0}var Ge=new q,lo=new $t,sg=0;class Xe extends ui{constructor(d,p,m=!1){super();if(Array.isArray(d))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:sg++}),this.name="",this.array=d,this.itemSize=p,this.count=d!==void 0?d.length/p:0,this.normalized=m,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=d!==void 0?Ho(d):void 0}onUploadCallback(){}set needsUpdate(d){if(d===!0)this.version++}setUsage(d){return this.usage=d,this}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}copy(d){return this.name=d.name,this.array=new d.array.constructor(d.array),this.itemSize=d.itemSize,this.count=d.count,this.normalized=d.normalized,this.usage=d.usage,this.gpuType=d.gpuType,this._normalizationScale=d._normalizationScale,this}copyAt(d,p,m){d*=this.itemSize,m*=p.itemSize;for(let g=0,_=this.itemSize;g<_;g++)this.array[d+g]=p.array[m+g];return this}copyArray(d){return this.array.set(d),this}applyMatrix3(d){if(this.itemSize===2)for(let p=0,m=this.count;p<m;p++)lo.fromBufferAttribute(this,p),lo.applyMatrix3(d),this.setXY(p,lo.x,lo.y);else if(this.itemSize===3)for(let p=0,m=this.count;p<m;p++)Ge.fromBufferAttribute(this,p),Ge.applyMatrix3(d),this.setXYZ(p,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(d){for(let p=0,m=this.count;p<m;p++)Ge.fromBufferAttribute(this,p),Ge.applyMatrix4(d),this.setXYZ(p,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(d){for(let p=0,m=this.count;p<m;p++)Ge.fromBufferAttribute(this,p),Ge.applyNormalMatrix(d),this.setXYZ(p,Ge.x,Ge.y,Ge.z);return this}transformDirection(d){for(let p=0,m=this.count;p<m;p++)Ge.fromBufferAttribute(this,p),Ge.transformDirection(d),this.setXYZ(p,Ge.x,Ge.y,Ge.z);return this}set(d,p=0){return this.array.set(d,p),this}getComponent(d,p){let m=this.array[d*this.itemSize+p];if(this.normalized)m=this._denormalize(m);return m}setComponent(d,p,m){if(this.normalized)m=this._normalize(m);return this.array[d*this.itemSize+p]=m,this}getX(d){let p=this.array[d*this.itemSize];if(this.normalized)p=this._denormalize(p);return p}setX(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize]=p,this}getY(d){let p=this.array[d*this.itemSize+1];if(this.normalized)p=this._denormalize(p);return p}setY(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+1]=p,this}getZ(d){let p=this.array[d*this.itemSize+2];if(this.normalized)p=this._denormalize(p);return p}setZ(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+2]=p,this}getW(d){let p=this.array[d*this.itemSize+3];if(this.normalized)p=this._denormalize(p);return p}setW(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+3]=p,this}setXY(d,p,m){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m);return this.array[d+0]=p,this.array[d+1]=m,this}setXYZ(d,p,m,g){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g);return this.array[d+0]=p,this.array[d+1]=m,this.array[d+2]=g,this}setXYZW(d,p,m,g,_){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.array[d+0]=p,this.array[d+1]=m,this.array[d+2]=g,this.array[d+3]=_,this}onUpload(d){return this.onUploadCallback=d,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let d={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return d.name=this.name,d.usage=this.usage,d.gpuType=this.gpuType,d}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(d){let p=this._normalizationScale;return p!==void 0?Math.max(d/p,-1):Ic(d,this.array)}_normalize(d){let p=this._normalizationScale;return p!==void 0?Math.round(d*p):Lc(d,this.array)}}class Wo extends Xe{constructor(d,p,m){super(new Uint16Array(d),p,m)}}class Xo extends Xe{constructor(d,p,m){super(new Uint32Array(d),p,m)}}class rn extends Xe{constructor(d,p,m){super(new Float32Array(d),p,m)}}var rg=new Se,hr=new q,gl=new q;class Sn{constructor(d=new q,p=-1){this.isSphere=!0,this.center=d,this.radius=p}set(d,p){return this.center.copy(d),this.radius=p,this}setFromPoints(d,p){let m=this.center;if(p!==void 0)m.copy(p);else rg.setFromPoints(d).getCenter(m);let g=0;for(let _=0,x=d.length;_<x;_++)g=Math.max(g,m.distanceToSquared(d[_]));return this.radius=Math.sqrt(g),this}copy(d){return this.center.copy(d.center),this.radius=d.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(d){return d.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(d){return d.distanceTo(this.center)-this.radius}intersectsSphere(d){let p=this.radius+d.radius;return d.center.distanceToSquared(this.center)<=p*p}intersectsBox(d){return d.intersectsSphere(this)}intersectsPlane(d){return Math.abs(d.distanceToPoint(this.center))<=this.radius}clampPoint(d,p){let m=this.center.distanceToSquared(d);if(p.copy(d),m>this.radius*this.radius)p.sub(this.center).normalize(),p.multiplyScalar(this.radius).add(this.center);return p}getBoundingBox(d){if(this.isEmpty())return d.makeEmpty(),d;return d.set(this.center,this.center),d.expandByScalar(this.radius),d}applyMatrix4(d){return this.center.applyMatrix4(d),this.radius=this.radius*d.getMaxScaleOnAxis(),this}translate(d){return this.center.add(d),this}expandByPoint(d){if(this.isEmpty())return this.center.copy(d),this.radius=0,this;hr.subVectors(d,this.center);let p=hr.lengthSq();if(p>this.radius*this.radius){let m=Math.sqrt(p),g=(m-this.radius)*0.5;this.center.addScaledVector(hr,g/m),this.radius+=g}return this}union(d){if(d.isEmpty())return this;if(this.isEmpty())return this.copy(d),this;if(this.center.equals(d.center)===!0)this.radius=Math.max(this.radius,d.radius);else gl.subVectors(d.center,this.center).setLength(d.radius),this.expandByPoint(hr.copy(d.center).add(gl)),this.expandByPoint(hr.copy(d.center).sub(gl));return this}equals(d){return d.center.equals(this.center)&&d.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(d){return this.radius=d.radius,this.center.fromArray(d.center),this}}var og=0,In=new se,_l=new qe,bs=new q,Cn=new Se,ur=new Se,Qe=new q;class Ye extends ui{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:og++}),this.uuid=Ci(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(d){if(Array.isArray(d))this.index=new((Im(d))?Xo:Wo)(d,1);else this.index=d;return this}setIndirect(d,p=0){return this.indirect=d,this.indirectOffset=p,this}getIndirect(){return this.indirect}getAttribute(d){return this.attributes[d]}setAttribute(d,p){return this.attributes[d]=p,this}deleteAttribute(d){return delete this.attributes[d],this}hasAttribute(d){return this.attributes[d]!==void 0}addGroup(d,p,m=0){this.groups.push({start:d,count:p,materialIndex:m})}clearGroups(){this.groups=[]}setDrawRange(d,p){this.drawRange.start=d,this.drawRange.count=p}applyMatrix4(d){let p=this.attributes.position;if(p!==void 0)p.applyMatrix4(d),p.needsUpdate=!0;let m=this.attributes.normal;if(m!==void 0){let _=new Qt().getNormalMatrix(d);m.applyNormalMatrix(_),m.needsUpdate=!0}let g=this.attributes.tangent;if(g!==void 0)g.transformDirection(d),g.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(d){return In.makeRotationFromQuaternion(d),this.applyMatrix4(In),this}rotateX(d){return In.makeRotationX(d),this.applyMatrix4(In),this}rotateY(d){return In.makeRotationY(d),this.applyMatrix4(In),this}rotateZ(d){return In.makeRotationZ(d),this.applyMatrix4(In),this}translate(d,p,m){return In.makeTranslation(d,p,m),this.applyMatrix4(In),this}scale(d,p,m){return In.makeScale(d,p,m),this.applyMatrix4(In),this}lookAt(d){return _l.lookAt(d),_l.updateMatrix(),this.applyMatrix4(_l.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bs).negate(),this.translate(bs.x,bs.y,bs.z),this}setFromPoints(d){let p=this.getAttribute("position");if(p===void 0){let m=[];for(let g=0,_=d.length;g<_;g++){let x=d[g];m.push(x.x,x.y,x.z||0)}this.setAttribute("position",new rn(m,3))}else{let m=Math.min(d.length,p.count);for(let g=0;g<m;g++){let _=d[g];p.setXYZ(g,_.x,_.y,_.z||0)}if(d.length>p.count)qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");p.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new Se;let d=this.attributes.position,p=this.morphAttributes.position;if(d&&d.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));return}if(d!==void 0){if(this.boundingBox.setFromBufferAttribute(d),p)for(let m=0,g=p.length;m<g;m++){let _=p[m];if(Cn.setFromBufferAttribute(_),this.morphTargetsRelative)Qe.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint(Qe),Qe.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint(Qe);else this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))Zt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Sn;let d=this.attributes.position,p=this.morphAttributes.position;if(d&&d.isGLBufferAttribute){Zt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new q,1/0);return}if(d){let m=this.boundingSphere.center;if(Cn.setFromBufferAttribute(d),p)for(let _=0,x=p.length;_<x;_++){let v=p[_];if(ur.setFromBufferAttribute(v),this.morphTargetsRelative)Qe.addVectors(Cn.min,ur.min),Cn.expandByPoint(Qe),Qe.addVectors(Cn.max,ur.max),Cn.expandByPoint(Qe);else Cn.expandByPoint(ur.min),Cn.expandByPoint(ur.max)}Cn.getCenter(m);let g=0;for(let _=0,x=d.count;_<x;_++)Qe.fromBufferAttribute(d,_),g=Math.max(g,m.distanceToSquared(Qe));if(p)for(let _=0,x=p.length;_<x;_++){let v=p[_],y=this.morphTargetsRelative;for(let S=0,b=v.count;S<b;S++){if(Qe.fromBufferAttribute(v,S),y)bs.fromBufferAttribute(d,S),Qe.add(bs);g=Math.max(g,m.distanceToSquared(Qe))}}if(this.boundingSphere.radius=Math.sqrt(g),isNaN(this.boundingSphere.radius))Zt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let d=this.index,p=this.attributes;if(d===null||p.position===void 0||p.normal===void 0||p.uv===void 0){Zt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:m,normal:g,uv:_}=p,x=this.getAttribute("tangent");if(x===void 0||x.count!==m.count)x=new Xe(new Float32Array(4*m.count),4),this.setAttribute("tangent",x);let v=[],y=[],S=new Uint8Array(m.count);for(let F=0;F<m.count;F++)v[F]=new q,y[F]=new q;let b=new q,M=new q,T=new q,E=new $t,w=new $t,C=new $t,N=new q,A=new q;function R(F,G,H){S[F]=S[G]=S[H]=1,b.fromBufferAttribute(m,F),M.fromBufferAttribute(m,G),T.fromBufferAttribute(m,H),E.fromBufferAttribute(_,F),w.fromBufferAttribute(_,G),C.fromBufferAttribute(_,H),M.sub(b),T.sub(b),w.sub(E),C.sub(E);let z=1/(w.x*C.y-C.x*w.y);if(!isFinite(z))return;N.copy(M).multiplyScalar(C.y).addScaledVector(T,-w.y).multiplyScalar(z),A.copy(T).multiplyScalar(w.x).addScaledVector(M,-C.x).multiplyScalar(z),v[F].add(N),v[G].add(N),v[H].add(N),y[F].add(A),y[G].add(A),y[H].add(A)}let I=this.groups;if(I.length===0)I=[{start:0,count:d.count}];for(let F=0,G=I.length;F<G;++F){let H=I[F],{start:z,count:W}=H;for(let Z=z,V=z+W;Z<V;Z+=3)R(d.getX(Z+0),d.getX(Z+1),d.getX(Z+2))}let U=new q,L=new q,D=new q,k=new q;function P(F){D.fromBufferAttribute(g,F),k.copy(D);let G=v[F];U.copy(G),U.sub(D.multiplyScalar(D.dot(G))).normalize(),L.crossVectors(k,G);let z=L.dot(y[F])<0?-1:1;x.setXYZW(F,U.x,U.y,U.z,z)}for(let F=0,G=m.count;F<G;++F)if(S[F])P(F);this._transformed=!0}computeVertexNormals(){let d=this.index,p=this.getAttribute("position");if(p!==void 0){let m=this.getAttribute("normal");if(m===void 0||m.count!==p.count)m=new Xe(new Float32Array(p.count*3),3),this.setAttribute("normal",m);else for(let T=0,E=m.count;T<E;T++)m.setXYZ(T,0,0,0);let g=new q,_=new q,x=new q,v=new q,y=new q,S=new q,b=new q,M=new q;if(d)for(let T=0,E=d.count;T<E;T+=3){let w=d.getX(T+0),C=d.getX(T+1),N=d.getX(T+2);g.fromBufferAttribute(p,w),_.fromBufferAttribute(p,C),x.fromBufferAttribute(p,N),b.subVectors(x,_),M.subVectors(g,_),b.cross(M),v.fromBufferAttribute(m,w),y.fromBufferAttribute(m,C),S.fromBufferAttribute(m,N),v.add(b),y.add(b),S.add(b),m.setXYZ(w,v.x,v.y,v.z),m.setXYZ(C,y.x,y.y,y.z),m.setXYZ(N,S.x,S.y,S.z)}else for(let T=0,E=p.count;T<E;T+=3)g.fromBufferAttribute(p,T+0),_.fromBufferAttribute(p,T+1),x.fromBufferAttribute(p,T+2),b.subVectors(x,_),M.subVectors(g,_),b.cross(M),m.setXYZ(T+0,b.x,b.y,b.z),m.setXYZ(T+1,b.x,b.y,b.z),m.setXYZ(T+2,b.x,b.y,b.z);this.normalizeNormals(),m.needsUpdate=!0}}normalizeNormals(){let d=this.attributes.normal;for(let p=0,m=d.count;p<m;p++)Qe.fromBufferAttribute(d,p),Qe.normalize(),d.setXYZ(p,Qe.x,Qe.y,Qe.z)}toNonIndexed(){function d(v,y){let{array:S,itemSize:b,normalized:M}=v,T=new S.constructor(y.length*b),E=0,w=0;for(let C=0,N=y.length;C<N;C++){if(v.isInterleavedBufferAttribute)E=y[C]*v.data.stride+v.offset;else E=y[C]*b;for(let A=0;A<b;A++)T[w++]=S[E++]}return new Xe(T,b,M)}if(this.index===null)return qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let p=new Ye,m=this.index.array,g=this.attributes;for(let v in g){let y=g[v],S=d(y,m);p.setAttribute(v,S)}let _=this.morphAttributes;for(let v in _){let y=[],S=_[v];for(let b=0,M=S.length;b<M;b++){let T=S[b],E=d(T,m);y.push(E)}p.morphAttributes[v]=y}p.morphTargetsRelative=this.morphTargetsRelative;let x=this.groups;for(let v=0,y=x.length;v<y;v++){let S=x[v];p.addGroup(S.start,S.count,S.materialIndex)}return p}toJSON(){let d={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(d.uuid=this.uuid,d.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,d.name=this.name,Object.keys(this.userData).length>0)d.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let y=this.parameters;for(let S in y)if(y[S]!==void 0)d[S]=y[S];return d}d.data={attributes:{}};let p=this.index;if(p!==null)d.data.index={type:p.array.constructor.name,array:Array.prototype.slice.call(p.array)};let m=this.attributes;for(let y in m){let S=m[y];d.data.attributes[y]=S.toJSON(d.data)}let g={},_=!1;for(let y in this.morphAttributes){let S=this.morphAttributes[y],b=[];for(let M=0,T=S.length;M<T;M++){let E=S[M];b.push(E.toJSON(d.data))}if(b.length>0)g[y]=b,_=!0}if(_)d.data.morphAttributes=g,d.data.morphTargetsRelative=this.morphTargetsRelative;let x=this.groups;if(x.length>0)d.data.groups=JSON.parse(JSON.stringify(x));let v=this.boundingSphere;if(v!==null)d.data.boundingSphere=v.toJSON();return d}clone(){return new this.constructor().copy(this)}copy(d){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let p={};this.name=d.name;let m=d.index;if(m!==null)this.setIndex(m.clone());let g=d.attributes;for(let S in g){let b=g[S];this.setAttribute(S,b.clone(p))}let _=d.morphAttributes;for(let S in _){let b=[],M=_[S];for(let T=0,E=M.length;T<E;T++)b.push(M[T].clone(p));this.morphAttributes[S]=b}this.morphTargetsRelative=d.morphTargetsRelative;let x=d.groups;for(let S=0,b=x.length;S<b;S++){let M=x[S];this.addGroup(M.start,M.count,M.materialIndex)}let v=d.boundingBox;if(v!==null)this.boundingBox=v.clone();let y=d.boundingSphere;if(y!==null)this.boundingSphere=y.clone();return this.drawRange.start=d.drawRange.start,this.drawRange.count=d.drawRange.count,this.userData=d.userData,this._transformed=d._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qo{constructor(d,p){this.isInterleavedBuffer=!0,this.array=d,this.stride=p,this.count=d!==void 0?d.length/p:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Ci()}onUploadCallback(){}set needsUpdate(d){if(d===!0)this.version++}setUsage(d){return this.usage=d,this}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}copy(d){return this.array=new d.array.constructor(d.array),this.count=d.count,this.stride=d.stride,this.usage=d.usage,this}copyAt(d,p,m){d*=this.stride,m*=p.stride;for(let g=0,_=this.stride;g<_;g++)this.array[d+g]=p.array[m+g];return this}set(d,p=0){return this.array.set(d,p),this}clone(d){if(d.arrayBuffers===void 0)d.arrayBuffers={};let p=Uu(this.array);if(d.arrayBuffers[p]===void 0)d.arrayBuffers[p]=this.array.slice(0).buffer;let m=new this.array.constructor(d.arrayBuffers[p]),g=new this.constructor(m,this.stride);return g.setUsage(this.usage),g}onUpload(d){return this.onUploadCallback=d,this}toJSON(d){if(d.arrayBuffers===void 0)d.arrayBuffers={};let p=Uu(this.array);if(d.arrayBuffers[p]===void 0)d.arrayBuffers[p]=Array.from(new Uint32Array(this.array.slice(0).buffer));let m={uuid:this.uuid,buffer:p,type:this.array.constructor.name,stride:this.stride};return m.usage=this.usage,m}}function Uu(d){if(d.buffer._uuid===void 0)d.buffer._uuid=Ci();if(d.byteOffset===0&&d.byteLength===d.buffer.byteLength)return d.buffer._uuid;return d.buffer._uuid+":"+d.byteOffset+":"+d.byteLength}var yn=new q;class ji{constructor(d,p,m,g=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=d,this.itemSize=p,this.offset=m,this.normalized=g,this._normalizationScale=d!==void 0?Ho(d.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(d){this.data.needsUpdate=d}applyMatrix4(d){for(let p=0,m=this.data.count;p<m;p++)yn.fromBufferAttribute(this,p),yn.applyMatrix4(d),this.setXYZ(p,yn.x,yn.y,yn.z);return this}applyNormalMatrix(d){for(let p=0,m=this.count;p<m;p++)yn.fromBufferAttribute(this,p),yn.applyNormalMatrix(d),this.setXYZ(p,yn.x,yn.y,yn.z);return this}transformDirection(d){for(let p=0,m=this.count;p<m;p++)yn.fromBufferAttribute(this,p),yn.transformDirection(d),this.setXYZ(p,yn.x,yn.y,yn.z);return this}getComponent(d,p){let m=this.array[d*this.data.stride+this.offset+p];if(this.normalized)m=this._denormalize(m);return m}setComponent(d,p,m){if(this.normalized)m=this._normalize(m);return this.data.array[d*this.data.stride+this.offset+p]=m,this}setX(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset]=p,this}setY(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+1]=p,this}setZ(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+2]=p,this}setW(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+3]=p,this}getX(d){let p=this.data.array[d*this.data.stride+this.offset];if(this.normalized)p=this._denormalize(p);return p}getY(d){let p=this.data.array[d*this.data.stride+this.offset+1];if(this.normalized)p=this._denormalize(p);return p}getZ(d){let p=this.data.array[d*this.data.stride+this.offset+2];if(this.normalized)p=this._denormalize(p);return p}getW(d){let p=this.data.array[d*this.data.stride+this.offset+3];if(this.normalized)p=this._denormalize(p);return p}setXY(d,p,m){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m);return this.data.array[d+0]=p,this.data.array[d+1]=m,this}setXYZ(d,p,m,g){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g);return this.data.array[d+0]=p,this.data.array[d+1]=m,this.data.array[d+2]=g,this}setXYZW(d,p,m,g,_){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.data.array[d+0]=p,this.data.array[d+1]=m,this.data.array[d+2]=g,this.data.array[d+3]=_,this}clone(d){if(d===void 0){_r("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let p=[];for(let m=0;m<this.count;m++){let g=m*this.data.stride+this.offset;for(let _=0;_<this.itemSize;_++)p.push(this.data.array[g+_])}return new Xe(new this.array.constructor(p),this.itemSize,this.normalized)}else{if(d.interleavedBuffers===void 0)d.interleavedBuffers={};if(d.interleavedBuffers[this.data.uuid]===void 0)d.interleavedBuffers[this.data.uuid]=this.data.clone(d);return new ji(d.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(d){if(d===void 0){_r("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let p=[];for(let m=0;m<this.count;m++){let g=m*this.data.stride+this.offset;for(let _=0;_<this.itemSize;_++)p.push(this.data.array[g+_])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:p,normalized:this.normalized}}else{if(d.interleavedBuffers===void 0)d.interleavedBuffers={};if(d.interleavedBuffers[this.data.uuid]===void 0)d.interleavedBuffers[this.data.uuid]=this.data.toJSON(d);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(d){let p=this._normalizationScale;return p!==void 0?Math.max(d/p,-1):Ic(d,this.data.array)}_normalize(d){let p=this._normalizationScale;return p!==void 0?Math.round(d*p):Lc(d,this.data.array)}}var xl=new q,ag=new q,lg=new Qt;class pn{constructor(d=new q(1,0,0),p=0){this.isPlane=!0,this.normal=d,this.constant=p}set(d,p){return this.normal.copy(d),this.constant=p,this}setComponents(d,p,m,g){return this.normal.set(d,p,m),this.constant=g,this}setFromNormalAndCoplanarPoint(d,p){return this.normal.copy(d),this.constant=-p.dot(this.normal),this}setFromCoplanarPoints(d,p,m){let g=xl.subVectors(m,p).cross(ag.subVectors(d,p)).normalize();return this.setFromNormalAndCoplanarPoint(g,d),this}copy(d){return this.normal.copy(d.normal),this.constant=d.constant,this}normalize(){let d=1/this.normal.length();return this.normal.multiplyScalar(d),this.constant*=d,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(d){return this.normal.dot(d)+this.constant}distanceToSphere(d){return this.distanceToPoint(d.center)-d.radius}projectPoint(d,p){return p.copy(d).addScaledVector(this.normal,-this.distanceToPoint(d))}intersectLine(d,p,m=!0){let g=d.delta(xl),_=this.normal.dot(g);if(_===0){if(this.distanceToPoint(d.start)===0)return p.copy(d.start);return null}let x=-(d.start.dot(this.normal)+this.constant)/_;if(m===!0&&(x<0||x>1))return null;return p.copy(d.start).addScaledVector(g,x)}intersectsLine(d){let p=this.distanceToPoint(d.start),m=this.distanceToPoint(d.end);return p<0&&m>0||m<0&&p>0}intersectsBox(d){return d.intersectsPlane(this)}intersectsSphere(d){return d.intersectsPlane(this)}coplanarPoint(d){return d.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(d,p){let m=p||lg.getNormalMatrix(d),g=this.coplanarPoint(xl).applyMatrix4(d),_=this.normal.applyMatrix3(m).normalize();return this.constant=-g.dot(_),this}translate(d){return this.constant-=d.dot(this.normal),this}equals(d){return d.normal.equals(this.normal)&&d.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(d){return this.normal.fromArray(d.normal),this.constant=d.constant,this}}var cg=0;class fi extends ui{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:cg++}),this.uuid=Ci(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new re(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(d){if(this._alphaTest>0!==d>0)this.version++;this._alphaTest=d}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(d){if(d===void 0)return;for(let p in d){let m=d[p];if(m===void 0){qt(`Material: parameter '${p}' has value of undefined.`);continue}let g=this[p];if(g===void 0){qt(`Material: '${p}' is not a property of THREE.${this.type}.`);continue}if(g&&g.isColor)g.set(m);else if(g&&g.isVector2&&(m&&m.isVector2)||g&&g.isEuler&&(m&&m.isEuler)||g&&g.isVector3&&(m&&m.isVector3))g.copy(m);else this[p]=m}}toJSON(d){let p=d===void 0||typeof d==="string";if(p)d={textures:{},images:{}};let m={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(m.uuid=this.uuid,m.type=this.type,m.blending=this.blending,m.side=this.side,m.shadowSide=this.shadowSide,m.vertexColors=this.vertexColors,m.opacity=this.opacity,m.transparent=this.transparent,m.blendSrc=this.blendSrc,m.blendDst=this.blendDst,m.blendEquation=this.blendEquation,m.blendSrcAlpha=this.blendSrcAlpha,m.blendDstAlpha=this.blendDstAlpha,m.blendEquationAlpha=this.blendEquationAlpha,m.blendColor=this.blendColor.getHex(),m.blendAlpha=this.blendAlpha,m.depthFunc=this.depthFunc,m.depthTest=this.depthTest,m.depthWrite=this.depthWrite,m.colorWrite=this.colorWrite,m.clipIntersection=this.clipIntersection,m.clipShadows=this.clipShadows,m.stencilWriteMask=this.stencilWriteMask,m.stencilFunc=this.stencilFunc,m.stencilRef=this.stencilRef,m.stencilFuncMask=this.stencilFuncMask,m.stencilFail=this.stencilFail,m.stencilZFail=this.stencilZFail,m.stencilZPass=this.stencilZPass,m.stencilWrite=this.stencilWrite,m.polygonOffset=this.polygonOffset,m.polygonOffsetFactor=this.polygonOffsetFactor,m.polygonOffsetUnits=this.polygonOffsetUnits,m.dithering=this.dithering,m.alphaTest=this.alphaTest,m.alphaHash=this.alphaHash,m.alphaToCoverage=this.alphaToCoverage,m.premultipliedAlpha=this.premultipliedAlpha,m.forceSinglePass=this.forceSinglePass,m.allowOverride=this.allowOverride,m.visible=this.visible,m.toneMapped=this.toneMapped,m.name=this.name,this.color&&this.color.isColor)m.color=this.color.getHex();if(this.roughness!==void 0)m.roughness=this.roughness;if(this.metalness!==void 0)m.metalness=this.metalness;if(this.sheen!==void 0)m.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)m.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)m.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)m.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)m.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)m.specular=this.specular.getHex();if(this.specularIntensity!==void 0)m.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)m.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)m.shininess=this.shininess;if(this.clearcoat!==void 0)m.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)m.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)m.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)m.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(d).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)m.clearcoatMap=this.clearcoatMap.toJSON(d).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)m.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(d).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)m.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(d).uuid,m.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)m.sheenColorMap=this.sheenColorMap.toJSON(d).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)m.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(d).uuid;if(this.dispersion!==void 0)m.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)m.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)m.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)m.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)m.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)m.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)m.iridescenceMap=this.iridescenceMap.toJSON(d).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)m.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(d).uuid;if(this.anisotropy!==void 0)m.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)m.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)m.anisotropyMap=this.anisotropyMap.toJSON(d).uuid;if(this.map&&this.map.isTexture)m.map=this.map.toJSON(d).uuid;if(this.matcap&&this.matcap.isTexture)m.matcap=this.matcap.toJSON(d).uuid;if(this.alphaMap&&this.alphaMap.isTexture)m.alphaMap=this.alphaMap.toJSON(d).uuid;if(this.lightMap&&this.lightMap.isTexture)m.lightMap=this.lightMap.toJSON(d).uuid,m.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)m.aoMap=this.aoMap.toJSON(d).uuid,m.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)m.bumpMap=this.bumpMap.toJSON(d).uuid,m.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)m.normalMap=this.normalMap.toJSON(d).uuid,m.normalMapType=this.normalMapType,m.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)m.displacementMap=this.displacementMap.toJSON(d).uuid,m.displacementScale=this.displacementScale,m.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)m.roughnessMap=this.roughnessMap.toJSON(d).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)m.metalnessMap=this.metalnessMap.toJSON(d).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)m.emissiveMap=this.emissiveMap.toJSON(d).uuid;if(this.specularMap&&this.specularMap.isTexture)m.specularMap=this.specularMap.toJSON(d).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)m.specularIntensityMap=this.specularIntensityMap.toJSON(d).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)m.specularColorMap=this.specularColorMap.toJSON(d).uuid;if(this.envMap&&this.envMap.isTexture){if(m.envMap=this.envMap.toJSON(d).uuid,this.combine!==void 0)m.combine=this.combine}if(this.envMapRotation!==void 0)m.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)m.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)m.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)m.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)m.gradientMap=this.gradientMap.toJSON(d).uuid;if(this.transmission!==void 0)m.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)m.transmissionMap=this.transmissionMap.toJSON(d).uuid;if(this.thickness!==void 0)m.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)m.thicknessMap=this.thicknessMap.toJSON(d).uuid;if(this.attenuationDistance!==void 0)m.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)m.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)m.size=this.size;if(this.sizeAttenuation!==void 0)m.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)m.clippingPlanes=this.clippingPlanes.map((_)=>_.toJSON());if(this.rotation!==void 0)m.rotation=this.rotation;if(this.depthPacking!==void 0)m.depthPacking=this.depthPacking;if(this.linewidth!==void 0)m.linewidth=this.linewidth;if(this.linecap!==void 0)m.linecap=this.linecap;if(this.linejoin!==void 0)m.linejoin=this.linejoin;if(this.dashSize!==void 0)m.dashSize=this.dashSize;if(this.gapSize!==void 0)m.gapSize=this.gapSize;if(this.scale!==void 0)m.scale=this.scale;if(this.wireframe!==void 0)m.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)m.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)m.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)m.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)m.flatShading=this.flatShading;if(this.fog!==void 0)m.fog=this.fog;if(Object.keys(this.userData).length>0)m.userData=this.userData;function g(_){let x=[];for(let v in _){let y=_[v];delete y.metadata,x.push(y)}return x}if(p){let _=g(d.textures),x=g(d.images);if(_.length>0)m.textures=_;if(x.length>0)m.images=x}return m}fromJSON(d,p){if(d.uuid!==void 0)this.uuid=d.uuid;if(d.name!==void 0)this.name=d.name;if(d.color!==void 0&&this.color!==void 0)this.color.setHex(d.color);if(d.roughness!==void 0)this.roughness=d.roughness;if(d.metalness!==void 0)this.metalness=d.metalness;if(d.sheen!==void 0)this.sheen=d.sheen;if(d.sheenColor!==void 0)this.sheenColor=new re().setHex(d.sheenColor);if(d.sheenRoughness!==void 0)this.sheenRoughness=d.sheenRoughness;if(d.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(d.emissive);if(d.specular!==void 0&&this.specular!==void 0)this.specular.setHex(d.specular);if(d.specularIntensity!==void 0)this.specularIntensity=d.specularIntensity;if(d.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(d.specularColor);if(d.shininess!==void 0)this.shininess=d.shininess;if(d.clearcoat!==void 0)this.clearcoat=d.clearcoat;if(d.clearcoatRoughness!==void 0)this.clearcoatRoughness=d.clearcoatRoughness;if(d.diffuseRoughness!==void 0)this.diffuseRoughness=d.diffuseRoughness;if(d.dispersion!==void 0)this.dispersion=d.dispersion;if(d.retroreflectivity!==void 0)this.retroreflectivity=d.retroreflectivity;if(d.iridescence!==void 0)this.iridescence=d.iridescence;if(d.iridescenceIOR!==void 0)this.iridescenceIOR=d.iridescenceIOR;if(d.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=d.iridescenceThicknessMinimum;if(d.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=d.iridescenceThicknessMaximum;if(d.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=d.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=d.iridescenceThicknessRange[1];if(d.transmission!==void 0)this.transmission=d.transmission;if(d.thickness!==void 0)this.thickness=d.thickness;if(d.attenuationDistance!==void 0)this.attenuationDistance=d.attenuationDistance;if(d.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(d.attenuationColor);if(d.anisotropy!==void 0)this.anisotropy=d.anisotropy;if(d.anisotropyRotation!==void 0)this.anisotropyRotation=d.anisotropyRotation;if(d.fog!==void 0)this.fog=d.fog;if(d.flatShading!==void 0)this.flatShading=d.flatShading;if(d.blending!==void 0)this.blending=d.blending;if(d.combine!==void 0)this.combine=d.combine;if(d.side!==void 0)this.side=d.side;if(d.shadowSide!==void 0)this.shadowSide=d.shadowSide;if(d.opacity!==void 0)this.opacity=d.opacity;if(d.transparent!==void 0)this.transparent=d.transparent;if(d.alphaTest!==void 0)this.alphaTest=d.alphaTest;if(d.alphaHash!==void 0)this.alphaHash=d.alphaHash;if(d.depthFunc!==void 0)this.depthFunc=d.depthFunc;if(d.depthTest!==void 0)this.depthTest=d.depthTest;if(d.depthWrite!==void 0)this.depthWrite=d.depthWrite;if(d.colorWrite!==void 0)this.colorWrite=d.colorWrite;if(d.clippingPlanes!==void 0)this.clippingPlanes=d.clippingPlanes.map((m)=>new pn().fromJSON(m));if(d.clipIntersection!==void 0)this.clipIntersection=d.clipIntersection;if(d.clipShadows!==void 0)this.clipShadows=d.clipShadows;if(d.depthPacking!==void 0)this.depthPacking=d.depthPacking;if(d.blendSrc!==void 0)this.blendSrc=d.blendSrc;if(d.blendDst!==void 0)this.blendDst=d.blendDst;if(d.blendEquation!==void 0)this.blendEquation=d.blendEquation;if(d.blendSrcAlpha!==void 0)this.blendSrcAlpha=d.blendSrcAlpha;if(d.blendDstAlpha!==void 0)this.blendDstAlpha=d.blendDstAlpha;if(d.blendEquationAlpha!==void 0)this.blendEquationAlpha=d.blendEquationAlpha;if(d.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(d.blendColor);if(d.blendAlpha!==void 0)this.blendAlpha=d.blendAlpha;if(d.stencilWriteMask!==void 0)this.stencilWriteMask=d.stencilWriteMask;if(d.stencilFunc!==void 0)this.stencilFunc=d.stencilFunc;if(d.stencilRef!==void 0)this.stencilRef=d.stencilRef;if(d.stencilFuncMask!==void 0)this.stencilFuncMask=d.stencilFuncMask;if(d.stencilFail!==void 0)this.stencilFail=d.stencilFail;if(d.stencilZFail!==void 0)this.stencilZFail=d.stencilZFail;if(d.stencilZPass!==void 0)this.stencilZPass=d.stencilZPass;if(d.stencilWrite!==void 0)this.stencilWrite=d.stencilWrite;if(d.wireframe!==void 0)this.wireframe=d.wireframe;if(d.wireframeLinewidth!==void 0)this.wireframeLinewidth=d.wireframeLinewidth;if(d.wireframeLinecap!==void 0)this.wireframeLinecap=d.wireframeLinecap;if(d.wireframeLinejoin!==void 0)this.wireframeLinejoin=d.wireframeLinejoin;if(d.rotation!==void 0)this.rotation=d.rotation;if(d.linewidth!==void 0)this.linewidth=d.linewidth;if(d.linecap!==void 0)this.linecap=d.linecap;if(d.linejoin!==void 0)this.linejoin=d.linejoin;if(d.dashSize!==void 0)this.dashSize=d.dashSize;if(d.gapSize!==void 0)this.gapSize=d.gapSize;if(d.scale!==void 0)this.scale=d.scale;if(d.polygonOffset!==void 0)this.polygonOffset=d.polygonOffset;if(d.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=d.polygonOffsetFactor;if(d.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=d.polygonOffsetUnits;if(d.dithering!==void 0)this.dithering=d.dithering;if(d.alphaToCoverage!==void 0)this.alphaToCoverage=d.alphaToCoverage;if(d.premultipliedAlpha!==void 0)this.premultipliedAlpha=d.premultipliedAlpha;if(d.forceSinglePass!==void 0)this.forceSinglePass=d.forceSinglePass;if(d.allowOverride!==void 0)this.allowOverride=d.allowOverride;if(d.visible!==void 0)this.visible=d.visible;if(d.toneMapped!==void 0)this.toneMapped=d.toneMapped;if(d.userData!==void 0)this.userData=d.userData;if(d.vertexColors!==void 0)if(typeof d.vertexColors==="number")this.vertexColors=d.vertexColors>0;else this.vertexColors=d.vertexColors;if(d.size!==void 0)this.size=d.size;if(d.sizeAttenuation!==void 0)this.sizeAttenuation=d.sizeAttenuation;if(d.map!==void 0)this.map=p[d.map]||null;if(d.matcap!==void 0)this.matcap=p[d.matcap]||null;if(d.alphaMap!==void 0)this.alphaMap=p[d.alphaMap]||null;if(d.bumpMap!==void 0)this.bumpMap=p[d.bumpMap]||null;if(d.bumpScale!==void 0)this.bumpScale=d.bumpScale;if(d.normalMap!==void 0)this.normalMap=p[d.normalMap]||null;if(d.normalMapType!==void 0)this.normalMapType=d.normalMapType;if(d.normalScale!==void 0){let m=d.normalScale;if(Array.isArray(m)===!1)m=[m,m];this.normalScale=new $t().fromArray(m)}if(d.displacementMap!==void 0)this.displacementMap=p[d.displacementMap]||null;if(d.displacementScale!==void 0)this.displacementScale=d.displacementScale;if(d.displacementBias!==void 0)this.displacementBias=d.displacementBias;if(d.roughnessMap!==void 0)this.roughnessMap=p[d.roughnessMap]||null;if(d.metalnessMap!==void 0)this.metalnessMap=p[d.metalnessMap]||null;if(d.emissiveMap!==void 0)this.emissiveMap=p[d.emissiveMap]||null;if(d.emissiveIntensity!==void 0)this.emissiveIntensity=d.emissiveIntensity;if(d.specularMap!==void 0)this.specularMap=p[d.specularMap]||null;if(d.specularIntensityMap!==void 0)this.specularIntensityMap=p[d.specularIntensityMap]||null;if(d.specularColorMap!==void 0)this.specularColorMap=p[d.specularColorMap]||null;if(d.envMap!==void 0)this.envMap=p[d.envMap]||null;if(d.envMapRotation!==void 0)this.envMapRotation.fromArray(d.envMapRotation);if(d.envMapIntensity!==void 0)this.envMapIntensity=d.envMapIntensity;if(d.reflectivity!==void 0)this.reflectivity=d.reflectivity;if(d.refractionRatio!==void 0)this.refractionRatio=d.refractionRatio;if(d.lightMap!==void 0)this.lightMap=p[d.lightMap]||null;if(d.lightMapIntensity!==void 0)this.lightMapIntensity=d.lightMapIntensity;if(d.aoMap!==void 0)this.aoMap=p[d.aoMap]||null;if(d.aoMapIntensity!==void 0)this.aoMapIntensity=d.aoMapIntensity;if(d.gradientMap!==void 0)this.gradientMap=p[d.gradientMap]||null;if(d.clearcoatMap!==void 0)this.clearcoatMap=p[d.clearcoatMap]||null;if(d.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=p[d.clearcoatRoughnessMap]||null;if(d.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=p[d.clearcoatNormalMap]||null;if(d.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new $t().fromArray(d.clearcoatNormalScale);if(d.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=p[d.diffuseRoughnessMap]||null;if(d.iridescenceMap!==void 0)this.iridescenceMap=p[d.iridescenceMap]||null;if(d.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=p[d.iridescenceThicknessMap]||null;if(d.transmissionMap!==void 0)this.transmissionMap=p[d.transmissionMap]||null;if(d.thicknessMap!==void 0)this.thicknessMap=p[d.thicknessMap]||null;if(d.anisotropyMap!==void 0)this.anisotropyMap=p[d.anisotropyMap]||null;if(d.sheenColorMap!==void 0)this.sheenColorMap=p[d.sheenColorMap]||null;if(d.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=p[d.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(d){this.name=d.name,this.blending=d.blending,this.side=d.side,this.vertexColors=d.vertexColors,this.opacity=d.opacity,this.transparent=d.transparent,this.blendSrc=d.blendSrc,this.blendDst=d.blendDst,this.blendEquation=d.blendEquation,this.blendSrcAlpha=d.blendSrcAlpha,this.blendDstAlpha=d.blendDstAlpha,this.blendEquationAlpha=d.blendEquationAlpha,this.blendColor.copy(d.blendColor),this.blendAlpha=d.blendAlpha,this.depthFunc=d.depthFunc,this.depthTest=d.depthTest,this.depthWrite=d.depthWrite,this.stencilWriteMask=d.stencilWriteMask,this.stencilFunc=d.stencilFunc,this.stencilRef=d.stencilRef,this.stencilFuncMask=d.stencilFuncMask,this.stencilFail=d.stencilFail,this.stencilZFail=d.stencilZFail,this.stencilZPass=d.stencilZPass,this.stencilWrite=d.stencilWrite;let p=d.clippingPlanes,m=null;if(p!==null){let g=p.length;m=Array(g);for(let _=0;_!==g;++_)m[_]=p[_].clone()}return this.clippingPlanes=m,this.clipIntersection=d.clipIntersection,this.clipShadows=d.clipShadows,this.shadowSide=d.shadowSide,this.colorWrite=d.colorWrite,this.precision=d.precision,this.polygonOffset=d.polygonOffset,this.polygonOffsetFactor=d.polygonOffsetFactor,this.polygonOffsetUnits=d.polygonOffsetUnits,this.dithering=d.dithering,this.alphaTest=d.alphaTest,this.alphaHash=d.alphaHash,this.alphaToCoverage=d.alphaToCoverage,this.premultipliedAlpha=d.premultipliedAlpha,this.forceSinglePass=d.forceSinglePass,this.allowOverride=d.allowOverride,this.visible=d.visible,this.toneMapped=d.toneMapped,this.userData=JSON.parse(JSON.stringify(d.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(d){if(d===!0)this.version++}}var ri=new q,vl=new q,co=new q,ho=new q;class Ii{constructor(d=new q,p=new q(0,0,-1)){this.origin=d,this.direction=p}set(d,p){return this.origin.copy(d),this.direction.copy(p),this}copy(d){return this.origin.copy(d.origin),this.direction.copy(d.direction),this}at(d,p){return p.copy(this.origin).addScaledVector(this.direction,d)}lookAt(d){return this.direction.copy(d).sub(this.origin).normalize(),this}recast(d){return this.origin.copy(this.at(d,ri)),this}closestPointToPoint(d,p){p.subVectors(d,this.origin);let m=p.dot(this.direction);if(m<0)return p.copy(this.origin);return p.copy(this.origin).addScaledVector(this.direction,m)}distanceToPoint(d){return Math.sqrt(this.distanceSqToPoint(d))}distanceSqToPoint(d){let p=ri.subVectors(d,this.origin).dot(this.direction);if(p<0)return this.origin.distanceToSquared(d);return ri.copy(this.origin).addScaledVector(this.direction,p),ri.distanceToSquared(d)}distanceSqToSegment(d,p,m,g){vl.copy(d).add(p).multiplyScalar(0.5),co.copy(p).sub(d).normalize(),ho.copy(this.origin).sub(vl);let _=d.distanceTo(p)*0.5,x=-this.direction.dot(co),v=ho.dot(this.direction),y=-ho.dot(co),S=ho.lengthSq(),b=Math.abs(1-x*x),M,T,E,w;if(b>0)if(M=x*y-v,T=x*v-y,w=_*b,M>=0)if(T>=-w)if(T<=w){let C=1/b;M*=C,T*=C,E=M*(M+x*T+2*v)+T*(x*M+T+2*y)+S}else T=_,M=Math.max(0,-(x*T+v)),E=-M*M+T*(T+2*y)+S;else T=-_,M=Math.max(0,-(x*T+v)),E=-M*M+T*(T+2*y)+S;else if(T<=-w)M=Math.max(0,-(-x*_+v)),T=M>0?-_:Math.min(Math.max(-_,-y),_),E=-M*M+T*(T+2*y)+S;else if(T<=w)M=0,T=Math.min(Math.max(-_,-y),_),E=T*(T+2*y)+S;else M=Math.max(0,-(x*_+v)),T=M>0?_:Math.min(Math.max(-_,-y),_),E=-M*M+T*(T+2*y)+S;else T=x>0?-_:_,M=Math.max(0,-(x*T+v)),E=-M*M+T*(T+2*y)+S;if(m)m.copy(this.origin).addScaledVector(this.direction,M);if(g)g.copy(vl).addScaledVector(co,T);return E}intersectSphere(d,p){if(d.radius<0)return null;ri.subVectors(d.center,this.origin);let m=ri.dot(this.direction),g=ri.dot(ri)-m*m,_=d.radius*d.radius;if(g>_)return null;let x=Math.sqrt(_-g),v=m-x,y=m+x;if(y<0)return null;if(v<0)return this.at(y,p);return this.at(v,p)}intersectsSphere(d){if(d.radius<0)return!1;return this.distanceSqToPoint(d.center)<=d.radius*d.radius}distanceToPlane(d){let p=d.normal.dot(this.direction);if(p===0){if(d.distanceToPoint(this.origin)===0)return 0;return null}let m=-(this.origin.dot(d.normal)+d.constant)/p;return m>=0?m:null}intersectPlane(d,p){let m=this.distanceToPlane(d);if(m===null)return null;return this.at(m,p)}intersectsPlane(d){let p=d.distanceToPoint(this.origin);if(p===0)return!0;if(d.normal.dot(this.direction)*p<0)return!0;return!1}intersectBox(d,p){let m,g,_,x,v,y,S=1/this.direction.x,b=1/this.direction.y,M=1/this.direction.z,T=this.origin;if(S>=0)m=(d.min.x-T.x)*S,g=(d.max.x-T.x)*S;else m=(d.max.x-T.x)*S,g=(d.min.x-T.x)*S;if(b>=0)_=(d.min.y-T.y)*b,x=(d.max.y-T.y)*b;else _=(d.max.y-T.y)*b,x=(d.min.y-T.y)*b;if(m>x||_>g)return null;if(_>m||isNaN(m))m=_;if(x<g||isNaN(g))g=x;if(M>=0)v=(d.min.z-T.z)*M,y=(d.max.z-T.z)*M;else v=(d.max.z-T.z)*M,y=(d.min.z-T.z)*M;if(m>y||v>g)return null;if(v>m||m!==m)m=v;if(y<g||g!==g)g=y;if(g<0)return null;return this.at(m>=0?m:g,p)}intersectsBox(d){return this.intersectBox(d,ri)!==null}intersectTriangle(d,p,m,g,_){let x=this.origin,v=this.direction,{x:y,y:S,z:b}=v,M=d.x-x.x,T=d.y-x.y,E=d.z-x.z,w=p.x-x.x,C=p.y-x.y,N=p.z-x.z,A=m.x-x.x,R=m.y-x.y,I=m.z-x.z,U=Math.abs(y),L=Math.abs(S),D=Math.abs(b),k,P,F,G,H,z,W,Z,V,Q,it,j;if(U>=L&&U>=D)if(F=y,z=M,V=w,j=A,y>=0)k=S,P=b,G=T,H=E,W=C,Z=N,Q=R,it=I;else k=b,P=S,G=E,H=T,W=N,Z=C,Q=I,it=R;else if(L>=D)if(F=S,z=T,V=C,j=R,S>=0)k=b,P=y,G=E,H=M,W=N,Z=w,Q=I,it=A;else k=y,P=b,G=M,H=E,W=w,Z=N,Q=A,it=I;else if(F=b,z=E,V=N,j=I,b>=0)k=y,P=S,G=M,H=T,W=w,Z=C,Q=A,it=R;else k=S,P=y,G=T,H=M,W=C,Z=w,Q=R,it=A;if(F===0)return null;let xt=k/F,rt=P/F,dt=1/F,_t=G-xt*z,Nt=H-rt*z,ot=W-xt*V,mt=Z-rt*V,Rt=Q-xt*j,Bt=it-rt*j,kt=Rt*mt-Bt*ot,Lt=_t*Bt-Nt*Rt,ie=ot*Nt-mt*_t;if(g){if(kt<0||Lt<0||ie<0)return null}else if((kt<0||Lt<0||ie<0)&&(kt>0||Lt>0||ie>0))return null;let jt=kt+Lt+ie;if(jt===0)return null;let Dt=dt*(kt*z+Lt*V+ie*j);if(jt>0?Dt<0:Dt>0)return null;return this.at(Dt/jt,_)}applyMatrix4(d){return this.origin.applyMatrix4(d),this.direction.transformDirection(d),this}equals(d){return d.origin.equals(this.origin)&&d.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Fc extends fi{constructor(d){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new re(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.lightMap=d.lightMap,this.lightMapIntensity=d.lightMapIntensity,this.aoMap=d.aoMap,this.aoMapIntensity=d.aoMapIntensity,this.specularMap=d.specularMap,this.alphaMap=d.alphaMap,this.envMap=d.envMap,this.envMapRotation.copy(d.envMapRotation),this.combine=d.combine,this.reflectivity=d.reflectivity,this.refractionRatio=d.refractionRatio,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.wireframeLinecap=d.wireframeLinecap,this.wireframeLinejoin=d.wireframeLinejoin,this.fog=d.fog,this}}var Fu=new se,Wi=new Ii,uo=new Sn,Ou=new q,fo=new q,po=new q,mo=new q,yl=new q,go=new q,Bu=new q,_o=new q;class on extends qe{constructor(d=new Ye,p=new Fc){super();this.isMesh=!0,this.type="Mesh",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}getVertexPosition(d,p){let m=this.geometry,g=m.attributes.position,_=m.morphAttributes.position,x=m.morphTargetsRelative;p.fromBufferAttribute(g,d);let v=this.morphTargetInfluences;if(_&&v){go.set(0,0,0);for(let y=0,S=_.length;y<S;y++){let b=v[y],M=_[y];if(b===0)continue;if(yl.fromBufferAttribute(M,d),x)go.addScaledVector(yl,b);else go.addScaledVector(yl.sub(p),b)}p.add(go)}return p}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.material,_=this.matrixWorld;if(g===void 0)return;if(m.boundingSphere===null)m.computeBoundingSphere();if(uo.copy(m.boundingSphere),uo.applyMatrix4(_),Wi.copy(d.ray).recast(d.near),uo.containsPoint(Wi.origin)===!1){if(Wi.intersectSphere(uo,Ou)===null)return;if(Wi.origin.distanceToSquared(Ou)>(d.far-d.near)**2)return}if(Fu.copy(_).invert(),Wi.copy(d.ray).applyMatrix4(Fu),m.boundingBox!==null){if(Wi.intersectsBox(m.boundingBox)===!1)return}this._computeIntersections(d,p,Wi)}_computeIntersections(d,p,m){let g,_=this.geometry,x=this.material,v=_.index,y=_.attributes.position,S=_.attributes.uv,b=_.attributes.uv1,M=_.attributes.normal,{groups:T,drawRange:E}=_;if(v!==null)if(Array.isArray(x))for(let w=0,C=T.length;w<C;w++){let N=T[w],A=x[N.materialIndex],R=Math.max(N.start,E.start),I=Math.min(v.count,Math.min(N.start+N.count,E.start+E.count));for(let U=R,L=I;U<L;U+=3){let D=v.getX(U),k=v.getX(U+1),P=v.getX(U+2);if(g=xo(this,A,d,m,S,b,M,D,k,P),g)g.faceIndex=Math.floor(U/3),g.face.materialIndex=N.materialIndex,p.push(g)}}else{let w=Math.max(0,E.start),C=Math.min(v.count,E.start+E.count);for(let N=w,A=C;N<A;N+=3){let R=v.getX(N),I=v.getX(N+1),U=v.getX(N+2);if(g=xo(this,x,d,m,S,b,M,R,I,U),g)g.faceIndex=Math.floor(N/3),p.push(g)}}else if(y!==void 0)if(Array.isArray(x))for(let w=0,C=T.length;w<C;w++){let N=T[w],A=x[N.materialIndex],R=Math.max(N.start,E.start),I=Math.min(y.count,Math.min(N.start+N.count,E.start+E.count));for(let U=R,L=I;U<L;U+=3){let D=U,k=U+1,P=U+2;if(g=xo(this,A,d,m,S,b,M,D,k,P),g)g.faceIndex=Math.floor(U/3),g.face.materialIndex=N.materialIndex,p.push(g)}}else{let w=Math.max(0,E.start),C=Math.min(y.count,E.start+E.count);for(let N=w,A=C;N<A;N+=3){let R=N,I=N+1,U=N+2;if(g=xo(this,x,d,m,S,b,M,R,I,U),g)g.faceIndex=Math.floor(N/3),p.push(g)}}}}function hg(d,p,m,g,_,x,v,y){let S;if(p.side===1)S=g.intersectTriangle(v,x,_,!0,y);else S=g.intersectTriangle(_,x,v,p.side===0,y);if(S===null)return null;_o.copy(y),_o.applyMatrix4(d.matrixWorld);let b=m.ray.origin.distanceTo(_o);if(b<m.near||b>m.far)return null;return{distance:b,point:_o.clone(),object:d}}function xo(d,p,m,g,_,x,v,y,S,b){d.getVertexPosition(y,fo),d.getVertexPosition(S,po),d.getVertexPosition(b,mo);let M=hg(d,p,m,g,fo,po,mo,Bu);if(M){let T=new q;if(Ve.getBarycoord(Bu,fo,po,mo,T),_)M.uv=Ve.getInterpolatedAttribute(_,y,S,b,T,new $t);if(x)M.uv1=Ve.getInterpolatedAttribute(x,y,S,b,T,new $t);if(v){if(M.normal=Ve.getInterpolatedAttribute(v,y,S,b,T,new q),M.normal.dot(g.direction)>0)M.normal.multiplyScalar(-1)}let E={a:y,b:S,c:b,normal:new q,materialIndex:0};Ve.getNormal(fo,po,mo,E.normal),M.face=E,M.barycoord=T}return M}class Ps extends We{constructor(d=null,p=1,m=1,g,_,x,v,y,S=1003,b=1003,M,T){super(null,x,v,y,S,b,g,_,M,T);this.isDataTexture=!0,this.image={data:d,width:p,height:m},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var Xi=new Sn,ug=new $t(0.5,0.5),vo=new q;class Ti{constructor(d=new pn,p=new pn,m=new pn,g=new pn,_=new pn,x=new pn){this.planes=[d,p,m,g,_,x]}set(d,p,m,g,_,x){let v=this.planes;return v[0].copy(d),v[1].copy(p),v[2].copy(m),v[3].copy(g),v[4].copy(_),v[5].copy(x),this}copy(d){let p=this.planes;for(let m=0;m<6;m++)p[m].copy(d.planes[m]);return this}setFromProjectionMatrix(d,p=2000,m=!1){let g=this.planes,_=d.elements,x=_[0],v=_[1],y=_[2],S=_[3],b=_[4],M=_[5],T=_[6],E=_[7],w=_[8],C=_[9],N=_[10],A=_[11],R=_[12],I=_[13],U=_[14],L=_[15];if(g[0].setComponents(S-x,E-b,A-w,L-R).normalize(),g[1].setComponents(S+x,E+b,A+w,L+R).normalize(),g[2].setComponents(S+v,E+M,A+C,L+I).normalize(),g[3].setComponents(S-v,E-M,A-C,L-I).normalize(),m)g[4].setComponents(y,T,N,U).normalize(),g[5].setComponents(S-y,E-T,A-N,L-U).normalize();else if(g[4].setComponents(S-y,E-T,A-N,L-U).normalize(),p===2000)g[5].setComponents(S+y,E+T,A+N,L+U).normalize();else if(p===2001)g[5].setComponents(y,T,N,U).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+p);return this}intersectsObject(d){if(d.boundingSphere!==void 0){if(d.boundingSphere===null)d.computeBoundingSphere();Xi.copy(d.boundingSphere).applyMatrix4(d.matrixWorld)}else{let p=d.geometry;if(p.boundingSphere===null)p.computeBoundingSphere();Xi.copy(p.boundingSphere).applyMatrix4(d.matrixWorld)}return this.intersectsSphere(Xi)}intersectsSprite(d){Xi.center.set(0,0,0);let p=ug.distanceTo(d.center);return Xi.radius=0.7071067811865476+p,Xi.applyMatrix4(d.matrixWorld),this.intersectsSphere(Xi)}intersectsSphere(d){let p=this.planes,m=d.center,g=-d.radius;for(let _=0;_<6;_++)if(p[_].distanceToPoint(m)<g)return!1;return!0}intersectsBox(d){let p=this.planes;for(let m=0;m<6;m++){let g=p[m];if(vo.x=g.normal.x>0?d.max.x:d.min.x,vo.y=g.normal.y>0?d.max.y:d.min.y,vo.z=g.normal.z>0?d.max.z:d.min.z,g.distanceToPoint(vo)<0)return!1}return!0}containsPoint(d){let p=this.planes;for(let m=0;m<6;m++)if(p[m].distanceToPoint(d)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var ku=new se;class Cr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(d){let p=d.cameras,m=this._frustums;for(let g=0;g<p.length;g++){let _=p[g];if(ku.multiplyMatrices(_.projectionMatrix,_.matrixWorldInverse),m[g]===void 0)m[g]=new Ti;m[g].setFromProjectionMatrix(ku,_.coordinateSystem,_.reversedDepth)}return this._count=p.length,this}getFrustum(d){return this._frustums[d]}intersectsObject(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsObject(d))return!0;return!1}intersectsSprite(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsSprite(d))return!0;return!1}intersectsSphere(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsSphere(d))return!0;return!1}intersectsBox(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsBox(d))return!0;return!1}containsPoint(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].containsPoint(d))return!0;return!1}copy(d){this.coordinateSystem=d.coordinateSystem;let p=this._frustums,m=d._frustums;for(let g=0;g<d._count;g++){if(p[g]===void 0)p[g]=new Ti;p[g].copy(m[g])}return this._count=d._count,this}clone(){return new Cr().copy(this)}}function Sl(d,p){return d-p}function dg(d,p){return d.z-p.z}function fg(d,p){return p.z-d.z}class rf{constructor(){this.index=0,this.pool=[],this.list=[]}push(d,p,m,g){let _=this.pool,x=this.list;if(this.index>=_.length)_.push({start:-1,count:-1,z:-1,index:-1});let v=_[this.index];x.push(v),this.index++,v.start=d,v.count=p,v.z=m,v.index=g}reset(){this.list.length=0,this.index=0}}var Mn=new se,pg=new re(1,1,1),mg=new Ti,gg=new Cr,yo=new Se,qi=new Sn,bl=new q,zu=new q,Hu=new q,_g=new q,Ml=new rf,fn=new on,So=[];function xg(d,p,m=0){let g=p.itemSize;if(d.isInterleavedBufferAttribute||d.array.constructor!==p.array.constructor){let _=d.count;for(let x=0;x<_;x++)for(let v=0;v<g;v++)p.setComponent(x+m,v,d.getComponent(x,v))}else p.array.set(d.array,m*g);p.needsUpdate=!0}function Xn(d,p){if(d.constructor!==p.constructor){let m=Math.min(d.length,p.length);for(let g=0;g<m;g++)p[g]=d[g]}else{let m=Math.min(d.length,p.length);p.set(new d.constructor(d.buffer,0,m))}}class Yo extends on{constructor(d,p,m=p*2,g){super(new Ye,g);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=d,this._maxVertexCount=p,this._maxIndexCount=m,this._multiDrawCounts=new Int32Array(d),this._multiDrawStarts=new Int32Array(d),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(d),this._mergedDrawStarts=new Int32Array(d),this._mergedDrawInstanceCounts=new Int32Array(d),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let d=Math.sqrt(this._maxInstanceCount*4);d=Math.ceil(d/4)*4,d=Math.max(d,4);let p=new Float32Array(d*d*4),m=new Ps(p,d,d,1023,1015);this._matricesTexture=m}_initIndirectTexture(){let d=Math.sqrt(this._maxInstanceCount);d=Math.ceil(d);let p=new Uint32Array(d*d),m=new Ps(p,d,d,1029,1014);this._indirectTexture=m}_initColorsTexture(){let d=Math.sqrt(this._maxInstanceCount);d=Math.ceil(d);let p=new Float32Array(d*d*4).fill(1),m=new Ps(p,d,d,1023,1015);m.colorSpace=he.workingColorSpace,this._colorsTexture=m}_initializeGeometry(d){let p=this.geometry,m=this._maxVertexCount,g=this._maxIndexCount;if(this._geometryInitialized===!1){for(let _ in d.attributes){let x=d.getAttribute(_),{array:v,itemSize:y,normalized:S}=x,b=new v.constructor(m*y),M=new Xe(b,y,S);p.setAttribute(_,M)}if(d.getIndex()!==null){let _=m>65535?new Uint32Array(g):new Uint16Array(g);p.setIndex(new Xe(_,1))}this._geometryInitialized=!0}}_validateGeometry(d){let p=this.geometry;if(Boolean(d.getIndex())!==Boolean(p.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let m in p.attributes){if(!d.hasAttribute(m))throw Error(`THREE.BatchedMesh: Added geometry missing "${m}". All geometries must have consistent attributes.`);let g=d.getAttribute(m),_=p.getAttribute(m);if(g.itemSize!==_.itemSize||g.normalized!==_.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${m}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(d){let p=this._instanceInfo;if(d<0||d>=p.length||p[d].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${d}. Instance is either out of range or has been deleted.`)}validateGeometryId(d){let p=this._geometryInfo;if(d<0||d>=p.length||p[d].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${d}. Geometry is either out of range or has been deleted.`)}setCustomSort(d){return this.customSort=d,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new Se;let d=this.boundingBox,p=this._instanceInfo;d.makeEmpty();for(let m=0,g=p.length;m<g;m++){if(p[m].active===!1)continue;let _=p[m].geometryIndex;this.getMatrixAt(m,Mn),this.getBoundingBoxAt(_,yo).applyMatrix4(Mn),d.union(yo)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new Sn;let d=this.boundingSphere,p=this._instanceInfo;d.makeEmpty();for(let m=0,g=p.length;m<g;m++){if(p[m].active===!1)continue;let _=p[m].geometryIndex;this.getMatrixAt(m,Mn),this.getBoundingSphereAt(_,qi).applyMatrix4(Mn),d.union(qi)}}addInstance(d){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let m={visible:!0,active:!0,geometryIndex:d},g=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(Sl),g=this._availableInstanceIds.shift(),this._instanceInfo[g]=m;else g=this._instanceInfo.length,this._instanceInfo.push(m);let _=this._matricesTexture;Mn.identity().toArray(_.image.data,g*16),_.needsUpdate=!0;let x=this._colorsTexture;if(x)pg.toArray(x.image.data,g*4),x.needsUpdate=!0;return this._visibilityChanged=!0,g}addGeometry(d,p=-1,m=-1){this._initializeGeometry(d),this._validateGeometry(d);let g={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},_=this._geometryInfo;g.vertexStart=this._nextVertexStart,g.reservedVertexCount=p===-1?d.getAttribute("position").count:p;let x=d.getIndex();if(x!==null)g.indexStart=this._nextIndexStart,g.reservedIndexCount=m===-1?x.count:m;if(g.indexStart!==-1&&g.indexStart+g.reservedIndexCount>this._maxIndexCount||g.vertexStart+g.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let y;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(Sl),y=this._availableGeometryIds.shift(),_[y]=g;else y=this._geometryCount,this._geometryCount++,_.push(g);return this.setGeometryAt(y,d),this._nextIndexStart=g.indexStart+g.reservedIndexCount,this._nextVertexStart=g.vertexStart+g.reservedVertexCount,y}setGeometryAt(d,p){if(d>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(p);let m=this.geometry,g=m.getIndex()!==null,_=m.getIndex(),x=p.getIndex(),v=this._geometryInfo[d];if(g&&x.count>v.reservedIndexCount||p.attributes.position.count>v.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:y,reservedVertexCount:S}=v;v.vertexCount=p.getAttribute("position").count;for(let b in m.attributes){let M=p.getAttribute(b),T=m.getAttribute(b);xg(M,T,y);let E=M.itemSize;for(let w=M.count,C=S;w<C;w++){let N=y+w;for(let A=0;A<E;A++)T.setComponent(N,A,0)}T.needsUpdate=!0,T.addUpdateRange(y*E,S*E)}if(g){let{indexStart:b,reservedIndexCount:M}=v;v.indexCount=p.getIndex().count;for(let T=0;T<x.count;T++)_.setX(b+T,y+x.getX(T));for(let T=x.count,E=M;T<E;T++)_.setX(b+T,y);_.needsUpdate=!0,_.addUpdateRange(b,v.reservedIndexCount)}if(v.start=g?v.indexStart:v.vertexStart,v.count=g?v.indexCount:v.vertexCount,v.boundingBox=null,p.boundingBox!==null)v.boundingBox=p.boundingBox.clone();if(v.boundingSphere=null,p.boundingSphere!==null)v.boundingSphere=p.boundingSphere.clone();return this._visibilityChanged=!0,d}deleteGeometry(d){let p=this._geometryInfo;if(d>=p.length||p[d].active===!1)return this;let m=this._instanceInfo;for(let g=0,_=m.length;g<_;g++)if(m[g].active&&m[g].geometryIndex===d)this.deleteInstance(g);return p[d].active=!1,this._availableGeometryIds.push(d),this._visibilityChanged=!0,this}deleteInstance(d){return this.validateInstanceId(d),this._instanceInfo[d].active=!1,this._availableInstanceIds.push(d),this._visibilityChanged=!0,this}optimize(){let d=0,p=0,m=this._geometryInfo,g=m.map((x,v)=>v).sort((x,v)=>m[x].vertexStart-m[v].vertexStart),_=this.geometry;for(let x=0,v=m.length;x<v;x++){let y=g[x],S=m[y];if(S.active===!1)continue;if(_.index!==null){if(S.indexStart!==p){let{indexStart:b,vertexStart:M,reservedIndexCount:T}=S,E=_.index,w=E.array,C=d-M;for(let N=b;N<b+T;N++)w[N]=w[N]+C;E.array.copyWithin(p,b,b+T),E.addUpdateRange(p,T),E.needsUpdate=!0,S.indexStart=p}p+=S.reservedIndexCount}if(S.vertexStart!==d){let{vertexStart:b,reservedVertexCount:M}=S,T=_.attributes;for(let E in T){let w=T[E],{array:C,itemSize:N}=w;C.copyWithin(d*N,b*N,(b+M)*N),w.addUpdateRange(d*N,M*N),w.needsUpdate=!0}S.vertexStart=d}d+=S.reservedVertexCount,S.start=_.index?S.indexStart:S.vertexStart}return this._nextIndexStart=p,this._nextVertexStart=d,this._visibilityChanged=!0,this}getBoundingBoxAt(d,p){if(d>=this._geometryCount)return null;let m=this.geometry,g=this._geometryInfo[d];if(g.boundingBox===null){let _=new Se,x=m.index,v=m.attributes.position;for(let y=g.start,S=g.start+g.count;y<S;y++){let b=y;if(x)b=x.getX(b);_.expandByPoint(bl.fromBufferAttribute(v,b))}g.boundingBox=_}return p.copy(g.boundingBox),p}getBoundingSphereAt(d,p){if(d>=this._geometryCount)return null;let m=this.geometry,g=this._geometryInfo[d];if(g.boundingSphere===null){let _=new Sn;this.getBoundingBoxAt(d,yo),yo.getCenter(_.center);let x=m.index,v=m.attributes.position,y=0;for(let S=g.start,b=g.start+g.count;S<b;S++){let M=S;if(x)M=x.getX(M);bl.fromBufferAttribute(v,M),y=Math.max(y,_.center.distanceToSquared(bl))}_.radius=Math.sqrt(y),g.boundingSphere=_}return p.copy(g.boundingSphere),p}setMatrixAt(d,p){this.validateInstanceId(d);let m=this._matricesTexture,g=this._matricesTexture.image.data;return p.toArray(g,d*16),m.needsUpdate=!0,this}getMatrixAt(d,p){return this.validateInstanceId(d),p.fromArray(this._matricesTexture.image.data,d*16)}setColorAt(d,p){if(this.validateInstanceId(d),this._colorsTexture===null)this._initColorsTexture();return p.toArray(this._colorsTexture.image.data,d*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(d,p){if(this.validateInstanceId(d),this._colorsTexture===null)if(p.isVector4)return p.set(1,1,1,1);else return p.setRGB(1,1,1);else return p.fromArray(this._colorsTexture.image.data,d*4)}setVisibleAt(d,p){if(this.validateInstanceId(d),this._instanceInfo[d].visible===p)return this;return this._instanceInfo[d].visible=p,this._visibilityChanged=!0,this}getVisibleAt(d){return this.validateInstanceId(d),this._instanceInfo[d].visible}setGeometryIdAt(d,p){return this.validateInstanceId(d),this.validateGeometryId(p),this._instanceInfo[d].geometryIndex=p,this._visibilityChanged=!0,this}getGeometryIdAt(d){return this.validateInstanceId(d),this._instanceInfo[d].geometryIndex}getGeometryRangeAt(d,p={}){this.validateGeometryId(d);let m=this._geometryInfo[d];return p.vertexStart=m.vertexStart,p.vertexCount=m.vertexCount,p.reservedVertexCount=m.reservedVertexCount,p.indexStart=m.indexStart,p.indexCount=m.indexCount,p.reservedIndexCount=m.reservedIndexCount,p.start=m.start,p.count=m.count,p}setInstanceCount(d){let p=this._availableInstanceIds,m=this._instanceInfo;p.sort(Sl);while(p[p.length-1]===m.length-1)m.pop(),p.pop();if(d<m.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${d} are being used. Cannot shrink instance count.`);let g=new Int32Array(d),_=new Int32Array(d);Xn(this._multiDrawCounts,g),Xn(this._multiDrawStarts,_),this._multiDrawCounts=g,this._multiDrawStarts=_;let x=new Int32Array(d),v=new Int32Array(d),y=new Int32Array(d);Xn(this._mergedDrawCounts,x),Xn(this._mergedDrawStarts,v),Xn(this._mergedDrawInstanceCounts,y),this._mergedDrawCounts=x,this._mergedDrawStarts=v,this._mergedDrawInstanceCounts=y,this._maxInstanceCount=d;let S=this._indirectTexture,b=this._matricesTexture,M=this._colorsTexture;if(S.dispose(),this._initIndirectTexture(),Xn(S.image.data,this._indirectTexture.image.data),b.dispose(),this._initMatricesTexture(),Xn(b.image.data,this._matricesTexture.image.data),M)M.dispose(),this._initColorsTexture(),Xn(M.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(d,p){let m=[...this._geometryInfo].filter((v)=>v.active);if(Math.max(...m.map((v)=>v.vertexStart+v.reservedVertexCount))>d)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${d}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...m.map((y)=>y.indexStart+y.reservedIndexCount))>p)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${p}. Cannot shrink further.`)}let _=this.geometry;if(_.dispose(),this._maxVertexCount=d,this._maxIndexCount=p,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new Ye,this._initializeGeometry(_);let x=this.geometry;if(_.index)Xn(_.index.array,x.index.array);for(let v in _.attributes)Xn(_.attributes[v].array,x.attributes[v].array);this._visibilityChanged=!0}raycast(d,p){let m=this._instanceInfo,g=this._geometryInfo,_=this.matrixWorld,x=this.geometry;if(fn.material=this.material,fn.geometry.index=x.index,fn.geometry.attributes=x.attributes,fn.geometry.boundingBox===null)fn.geometry.boundingBox=new Se;if(fn.geometry.boundingSphere===null)fn.geometry.boundingSphere=new Sn;for(let v=0,y=m.length;v<y;v++){if(!m[v].visible||!m[v].active)continue;let S=m[v].geometryIndex,b=g[S];fn.geometry.setDrawRange(b.start,b.count),this.getMatrixAt(v,fn.matrixWorld).premultiply(_),this.getBoundingBoxAt(S,fn.geometry.boundingBox),this.getBoundingSphereAt(S,fn.geometry.boundingSphere),fn.raycast(d,So);for(let M=0,T=So.length;M<T;M++){let E=So[M];E.object=this,E.batchId=v,p.push(E)}So.length=0}fn.material=null,fn.geometry.index=null,fn.geometry.attributes={},fn.geometry.setDrawRange(0,1/0)}copy(d){if(super.copy(d),this.geometry=d.geometry.clone(),this.perObjectFrustumCulled=d.perObjectFrustumCulled,this.sortObjects=d.sortObjects,this.boundingBox=d.boundingBox!==null?d.boundingBox.clone():null,this.boundingSphere=d.boundingSphere!==null?d.boundingSphere.clone():null,this._geometryInfo=d._geometryInfo.map((p)=>({...p,boundingBox:p.boundingBox!==null?p.boundingBox.clone():null,boundingSphere:p.boundingSphere!==null?p.boundingSphere.clone():null})),this._instanceInfo=d._instanceInfo.map((p)=>({...p})),this._availableInstanceIds=d._availableInstanceIds.slice(),this._availableGeometryIds=d._availableGeometryIds.slice(),this._nextIndexStart=d._nextIndexStart,this._nextVertexStart=d._nextVertexStart,this._geometryCount=d._geometryCount,this._maxInstanceCount=d._maxInstanceCount,this._maxVertexCount=d._maxVertexCount,this._maxIndexCount=d._maxIndexCount,this._geometryInitialized=d._geometryInitialized,this._multiDrawCounts=d._multiDrawCounts.slice(),this._multiDrawStarts=d._multiDrawStarts.slice(),this._multiDrawBytesPerElement=d._multiDrawBytesPerElement,this._mergedDrawCounts=d._mergedDrawCounts.slice(),this._mergedDrawStarts=d._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=d._mergedDrawInstanceCounts.slice(),this._indirectTexture=d._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=d._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),d._colorsTexture!==null)this._colorsTexture=d._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(d,p,m,g="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let _=p.getIndex(),x=_===null?1:_.array.BYTES_PER_ELEMENT,v=1;if(m.wireframe)v=2,x=p.attributes.position.count>65535?4:2;let y=this._instanceInfo,S=this._multiDrawStarts,b=this._multiDrawCounts,M=this._mergedDrawStarts,T=this._mergedDrawCounts,E=this._mergedDrawInstanceCounts,w=this._geometryInfo,C=this.perObjectFrustumCulled,N=this._indirectTexture,A=N.image.data,R=d.isArrayCamera?gg:mg;if(C)if(d.isArrayCamera)R.setFromArrayCamera(d);else Mn.multiplyMatrices(d.projectionMatrix,d.matrixWorldInverse).multiply(this.matrixWorld),R.setFromProjectionMatrix(Mn,d.coordinateSystem,d.reversedDepth);let I=0,U=0;if(this.sortObjects){Mn.copy(this.matrixWorld).invert(),zu.setFromMatrixPosition(d.matrixWorld).applyMatrix4(Mn),Hu.set(0,0,-1).transformDirection(d.matrixWorld).transformDirection(Mn);for(let k=0,P=y.length;k<P;k++)if(y[k].visible&&y[k].active){let F=y[k].geometryIndex;this.getMatrixAt(k,Mn),this.getBoundingSphereAt(F,qi).applyMatrix4(Mn);let G=!1;if(C)G=!R.intersectsSphere(qi);if(!G){let H=w[F],z=_g.subVectors(qi.center,zu).dot(Hu);Ml.push(H.start,H.count,z,k)}}let L=Ml.list,D=this.customSort;if(D===null)L.sort(m.transparent?fg:dg);else D.call(this,L,d);for(let k=0,P=L.length;k<P;k++){let F=L[k],G=F.start*x*v,H=F.count*v;if(g==="merged")if(U>0&&M[U-1]===G&&T[U-1]===H)E[U-1]++;else M[U]=G,T[U]=H,E[U]=1,U++;else S[I]=G,b[I]=H;A[I]=F.index,I++}Ml.reset()}else for(let L=0,D=y.length;L<D;L++)if(y[L].visible&&y[L].active){let k=y[L].geometryIndex,P=!1;if(C)this.getMatrixAt(L,Mn),this.getBoundingSphereAt(k,qi).applyMatrix4(Mn),P=!R.intersectsSphere(qi);if(!P){let F=w[k],G=F.start*x*v,H=F.count*v;if(g==="merged")if(U>0&&M[U-1]===G&&T[U-1]===H)E[U-1]++;else M[U]=G,T[U]=H,E[U]=1,U++;else S[I]=G,b[I]=H;A[I]=L,I++}}N.needsUpdate=!0,this._multiDrawCount=I,this._mergedDrawCount=U,this._multiDrawBytesPerElement=x,this._visibilityChanged=!1}onBeforeRender(d,p,m,g,_){if(d.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(m,g,_)}onBeforeShadow(d,p,m,g,_,x){if(d.isWebGPURenderer!==!0)this._updateDrawParameters(g,_,x)}}class Li extends fi{constructor(d){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new re(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.linewidth=d.linewidth,this.linecap=d.linecap,this.linejoin=d.linejoin,this.fog=d.fog,this}}var Po=new q,Io=new q,Gu=new se,dr=new Ii,bo=new Sn,El=new q,Vu=new q;class Qi extends qe{constructor(d=new Ye,p=new Li){super();this.isLine=!0,this.type="Line",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}computeLineDistances(){let d=this.geometry;if(d.index===null){let p=d.attributes.position,m=[0];for(let g=1,_=p.count;g<_;g++)Po.fromBufferAttribute(p,g-1),Io.fromBufferAttribute(p,g),m[g]=m[g-1],m[g]+=Po.distanceTo(Io);d.setAttribute("lineDistance",new rn(m,1))}else qt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.matrixWorld,_=d.params.Line.threshold,x=m.drawRange;if(m.boundingSphere===null)m.computeBoundingSphere();if(bo.copy(m.boundingSphere),bo.applyMatrix4(g),bo.radius+=_,d.ray.intersectsSphere(bo)===!1)return;Gu.copy(g).invert(),dr.copy(d.ray).applyMatrix4(Gu);let v=_/((this.scale.x+this.scale.y+this.scale.z)/3),y=v*v,S=this.isLineSegments?2:1,b=m.index,T=m.attributes.position;if(b!==null){let E=Math.max(0,x.start),w=Math.min(b.count,x.start+x.count);for(let C=E,N=w-1;C<N;C+=S){let A=b.getX(C),R=b.getX(C+1),I=Mo(this,d,dr,y,A,R,C);if(I)p.push(I)}if(this.isLineLoop){let C=b.getX(w-1),N=b.getX(E),A=Mo(this,d,dr,y,C,N,w-1);if(A)p.push(A)}}else{let E=Math.max(0,x.start),w=Math.min(T.count,x.start+x.count);for(let C=E,N=w-1;C<N;C+=S){let A=Mo(this,d,dr,y,C,C+1,C);if(A)p.push(A)}if(this.isLineLoop){let C=Mo(this,d,dr,y,w-1,E,w-1);if(C)p.push(C)}}}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}}function Mo(d,p,m,g,_,x,v){let y=d.geometry.attributes.position;if(Po.fromBufferAttribute(y,_),Io.fromBufferAttribute(y,x),m.distanceSqToSegment(Po,Io,El,Vu)>g)return;El.applyMatrix4(d.matrixWorld);let b=p.ray.origin.distanceTo(El);if(b<p.near||b>p.far)return;return{distance:b,point:Vu.clone().applyMatrix4(d.matrixWorld),index:v,face:null,faceIndex:null,barycoord:null,object:d}}var Wu=new q,Xu=new q;class pi extends Qi{constructor(d,p){super(d,p);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let d=this.geometry;if(d.index===null){let p=d.attributes.position,m=[];for(let g=0,_=p.count;g<_;g+=2)Wu.fromBufferAttribute(p,g),Xu.fromBufferAttribute(p,g+1),m[g]=g===0?0:m[g-1],m[g+1]=m[g]+Wu.distanceTo(Xu);d.setAttribute("lineDistance",new rn(m,1))}else qt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ts extends Qi{constructor(d,p){super(d,p);this.isLineLoop=!0,this.type="LineLoop"}}class Pr extends fi{constructor(d){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new re(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.alphaMap=d.alphaMap,this.size=d.size,this.sizeAttenuation=d.sizeAttenuation,this.fog=d.fog,this}}var qu=new se,Al=new Ii,Eo=new Sn,To=new q;class es extends qe{constructor(d=new Ye,p=new Pr){super();this.isPoints=!0,this.type="Points",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.matrixWorld,_=d.params.Points.threshold,x=m.drawRange;if(m.boundingSphere===null)m.computeBoundingSphere();if(Eo.copy(m.boundingSphere),Eo.applyMatrix4(g),Eo.radius+=_,d.ray.intersectsSphere(Eo)===!1)return;qu.copy(g).invert(),Al.copy(d.ray).applyMatrix4(qu);let v=_/((this.scale.x+this.scale.y+this.scale.z)/3),y=v*v,S=m.index,M=m.attributes.position;if(S!==null){let T=Math.max(0,x.start),E=Math.min(S.count,x.start+x.count);for(let w=T,C=E;w<C;w++){let N=S.getX(w);To.fromBufferAttribute(M,N),Yu(To,N,y,g,d,p,this)}}else{let T=Math.max(0,x.start),E=Math.min(M.count,x.start+x.count);for(let w=T,C=E;w<C;w++)To.fromBufferAttribute(M,w),Yu(To,w,y,g,d,p,this)}}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}}function Yu(d,p,m,g,_,x,v){let y=Al.distanceSqToPoint(d);if(y<m){let S=new q;Al.closestPointToPoint(d,S),S.applyMatrix4(g);let b=_.ray.origin.distanceTo(S);if(b<_.near||b>_.far)return;x.push({distance:b,distanceToRay:Math.sqrt(y),point:S,index:p,face:null,faceIndex:null,barycoord:null,object:v})}}class Ir extends We{constructor(d=[],p,m,g,_,x,v,y,S,b,M,T){super(null,x,v,y,S,b,g,_,M,T);this.isCompressedTexture=!0,this.image={width:p,height:m},this.mipmaps=d,this.flipY=!1,this.generateMipmaps=!1}}class Zo extends We{constructor(d=[],p=301,m,g,_,x,v,y,S,b){super(d,p,m,g,_,x,v,y,S,b);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(d){this.image=d}}class $o extends We{constructor(d,p,m,g,_,x,v,y,S){super(d,p,m,g,_,x,v,y,S);this.isCanvasTexture=!0,this.needsUpdate=!0}}class Ni extends We{constructor(d,p,m=1014,g,_,x,v=1003,y=1003,S,b=1026,M=1){if(b!==1026&&b!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let T={width:d,height:p,depth:M};super(T,g,_,x,v,y,b,m,S);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(d){return super.copy(d),this.source=new wr(Object.assign({},d.image)),this.compareFunction=d.compareFunction,this}toJSON(d){let p=super.toJSON(d);return p.compareFunction=this.compareFunction,p}}class Jo extends Ni{constructor(d,p=1014,m=301,g,_,x=1003,v=1003,y,S=1026){let b={width:d,height:d,depth:1},M=[b,b,b,b,b,b];super(d,d,p,m,g,_,x,v,y,S);this.image=M,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(d){this.image=d}}class Ko extends We{constructor(d=null){super();this.sourceTexture=d,this.isExternalTexture=!0}copy(d){return super.copy(d),this.sourceTexture=d.sourceTexture,this}}class zs extends Ye{constructor(d=1,p=1,m=1,g=1,_=1,x=1){super();this.type="BoxGeometry",this.parameters={width:d,height:p,depth:m,widthSegments:g,heightSegments:_,depthSegments:x};let v=this;g=Math.floor(g),_=Math.floor(_),x=Math.floor(x);let y=[],S=[],b=[],M=[],T=0,E=0;w("z","y","x",-1,-1,m,p,d,x,_,0),w("z","y","x",1,-1,m,p,-d,x,_,1),w("x","z","y",1,1,d,m,p,g,x,2),w("x","z","y",1,-1,d,m,-p,g,x,3),w("x","y","z",1,-1,d,p,m,g,_,4),w("x","y","z",-1,-1,d,p,-m,g,_,5),this.setIndex(y),this.setAttribute("position",new rn(S,3)),this.setAttribute("normal",new rn(b,3)),this.setAttribute("uv",new rn(M,2));function w(C,N,A,R,I,U,L,D,k,P,F){let G=U/k,H=L/P,z=U/2,W=L/2,Z=D/2,V=k+1,Q=P+1,it=0,j=0,xt=new q;for(let rt=0;rt<Q;rt++){let dt=rt*H-W;for(let _t=0;_t<V;_t++){let Nt=_t*G-z;xt[C]=Nt*R,xt[N]=dt*I,xt[A]=Z,S.push(xt.x,xt.y,xt.z),xt[C]=0,xt[N]=0,xt[A]=D>0?1:-1,b.push(xt.x,xt.y,xt.z),M.push(_t/k),M.push(1-rt/P),it+=1}}for(let rt=0;rt<P;rt++)for(let dt=0;dt<k;dt++){let _t=T+dt+V*rt,Nt=T+dt+V*(rt+1),ot=T+(dt+1)+V*(rt+1),mt=T+(dt+1)+V*rt;y.push(_t,Nt,mt),y.push(Nt,ot,mt),j+=6}v.addGroup(E,j,F),E+=j,T+=it}}copy(d){return super.copy(d),this.parameters=Object.assign({},d.parameters),this}static fromJSON(d){return new zs(d.width,d.height,d.depth,d.widthSegments,d.heightSegments,d.depthSegments)}}class Lr extends Ye{constructor(d=1,p=1,m=1,g=1){super();this.type="PlaneGeometry",this.parameters={width:d,height:p,widthSegments:m,heightSegments:g};let _=d/2,x=p/2,v=Math.floor(m),y=Math.floor(g),S=v+1,b=y+1,M=d/v,T=p/y,E=[],w=[],C=[],N=[];for(let A=0;A<b;A++){let R=A*T-x;for(let I=0;I<S;I++){let U=I*M-_;w.push(U,-R,0),C.push(0,0,1),N.push(I/v),N.push(1-A/y)}}for(let A=0;A<y;A++)for(let R=0;R<v;R++){let I=R+S*A,U=R+S*(A+1),L=R+1+S*(A+1),D=R+1+S*A;E.push(I,U,D),E.push(U,L,D)}this.setIndex(E),this.setAttribute("position",new rn(w,3)),this.setAttribute("normal",new rn(C,3)),this.setAttribute("uv",new rn(N,2))}copy(d){return super.copy(d),this.parameters=Object.assign({},d.parameters),this}static fromJSON(d){return new Lr(d.width,d.height,d.widthSegments,d.heightSegments)}}function ns(d){let p={};for(let m in d){p[m]={};for(let g in d[m]){let _=d[m][g];if(Zu(_))if(_.isRenderTargetTexture)qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),p[m][g]=null;else p[m][g]=_.clone();else if(Array.isArray(_))if(Zu(_[0])){let x=[];for(let v=0,y=_.length;v<y;v++)x[v]=_[v].clone();p[m][g]=x}else p[m][g]=_.slice();else p[m][g]=_}}return p}function gn(d){let p={};for(let m=0;m<d.length;m++){let g=ns(d[m]);for(let _ in g)p[_]=g[_]}return p}function Zu(d){return d&&(d.isColor||d.isMatrix3||d.isMatrix4||d.isVector2||d.isVector3||d.isVector4||d.isTexture||d.isQuaternion)}function vg(d){let p=[];for(let m=0;m<d.length;m++)p.push(d[m].clone());return p}function Oc(d){let p=d.getRenderTarget();if(p===null)return d.outputColorSpace;if(p.isXRRenderTarget===!0)return p.texture.colorSpace;return he.workingColorSpace}var of={clone:ns,merge:gn},yg=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class mi extends fi{constructor(d){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=yg,this.fragmentShader=Sg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,d!==void 0)this.setValues(d)}copy(d){return super.copy(d),this.fragmentShader=d.fragmentShader,this.vertexShader=d.vertexShader,this.uniforms=ns(d.uniforms),this.uniformsGroups=vg(d.uniformsGroups),this.defines=Object.assign({},d.defines),this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.fog=d.fog,this.lights=d.lights,this.clipping=d.clipping,this.extensions=Object.assign({},d.extensions),this.glslVersion=d.glslVersion,this.defaultAttributeValues=Object.assign({},d.defaultAttributeValues),this.index0AttributeName=d.index0AttributeName,this.uniformsNeedUpdate=d.uniformsNeedUpdate,this}toJSON(d){let p=super.toJSON(d);p.glslVersion=this.glslVersion,p.uniforms={};for(let g in this.uniforms){let x=this.uniforms[g].value;if(x&&x.isTexture)p.uniforms[g]={type:"t",value:x.toJSON(d).uuid};else if(x&&x.isColor)p.uniforms[g]={type:"c",value:x.getHex()};else if(x&&x.isVector2)p.uniforms[g]={type:"v2",value:x.toArray()};else if(x&&x.isVector3)p.uniforms[g]={type:"v3",value:x.toArray()};else if(x&&x.isVector4)p.uniforms[g]={type:"v4",value:x.toArray()};else if(x&&x.isMatrix3)p.uniforms[g]={type:"m3",value:x.toArray()};else if(x&&x.isMatrix4)p.uniforms[g]={type:"m4",value:x.toArray()};else p.uniforms[g]={value:x}}if(Object.keys(this.defines).length>0)p.defines=this.defines;p.vertexShader=this.vertexShader,p.fragmentShader=this.fragmentShader,p.lights=this.lights,p.clipping=this.clipping;let m={};for(let g in this.extensions)if(this.extensions[g]===!0)m[g]=!0;if(Object.keys(m).length>0)p.extensions=m;return p}fromJSON(d,p){if(super.fromJSON(d,p),d.uniforms!==void 0)for(let m in d.uniforms){let g=d.uniforms[m];switch(this.uniforms[m]={},g.type){case"t":this.uniforms[m].value=p[g.value]||null;break;case"c":this.uniforms[m].value=new re().setHex(g.value);break;case"v2":this.uniforms[m].value=new $t().fromArray(g.value);break;case"v3":this.uniforms[m].value=new q().fromArray(g.value);break;case"v4":this.uniforms[m].value=new Oe().fromArray(g.value);break;case"m3":this.uniforms[m].value=new Qt().fromArray(g.value);break;case"m4":this.uniforms[m].value=new se().fromArray(g.value);break;default:this.uniforms[m].value=g.value}}if(d.defines!==void 0)this.defines=d.defines;if(d.vertexShader!==void 0)this.vertexShader=d.vertexShader;if(d.fragmentShader!==void 0)this.fragmentShader=d.fragmentShader;if(d.glslVersion!==void 0)this.glslVersion=d.glslVersion;if(d.extensions!==void 0)for(let m in d.extensions)this.extensions[m]=d.extensions[m];if(d.lights!==void 0)this.lights=d.lights;if(d.clipping!==void 0)this.clipping=d.clipping;return this}}class Bc extends mi{constructor(d){super(d);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class jo extends fi{constructor(d){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new re(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new re(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new $t(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.lightMap=d.lightMap,this.lightMapIntensity=d.lightMapIntensity,this.aoMap=d.aoMap,this.aoMapIntensity=d.aoMapIntensity,this.emissive.copy(d.emissive),this.emissiveMap=d.emissiveMap,this.emissiveIntensity=d.emissiveIntensity,this.bumpMap=d.bumpMap,this.bumpScale=d.bumpScale,this.normalMap=d.normalMap,this.normalMapType=d.normalMapType,this.normalScale.copy(d.normalScale),this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this.specularMap=d.specularMap,this.alphaMap=d.alphaMap,this.envMap=d.envMap,this.envMapRotation.copy(d.envMapRotation),this.combine=d.combine,this.reflectivity=d.reflectivity,this.envMapIntensity=d.envMapIntensity,this.refractionRatio=d.refractionRatio,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.wireframeLinecap=d.wireframeLinecap,this.wireframeLinejoin=d.wireframeLinejoin,this.flatShading=d.flatShading,this.fog=d.fog,this}}class kc extends fi{constructor(d){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(d)}copy(d){return super.copy(d),this.depthPacking=d.depthPacking,this.map=d.map,this.alphaMap=d.alphaMap,this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this}}class zc extends fi{constructor(d){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(d)}copy(d){return super.copy(d),this.map=d.map,this.alphaMap=d.alphaMap,this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this}}function Ms(d,p){if(!d||d.constructor===p)return d;if(typeof p.BYTES_PER_ELEMENT==="number")return new p(d);return Array.prototype.slice.call(d)}function wo(d){return d!==void 0&&d.inTangents!==void 0&&d.outTangents!==void 0}class is{constructor(d,p,m,g){this.parameterPositions=d,this._cachedIndex=0,this.resultBuffer=g!==void 0?g:new p.constructor(m),this.sampleValues=p,this.valueSize=m,this.settings=null,this.DefaultSettings_={}}evaluate(d){let p=this.parameterPositions,m=this._cachedIndex,g=p[m],_=p[m-1];n:{t:{let x;e:{i:if(!(d<g)){for(let v=m+2;;){if(g===void 0){if(d<_)break i;return m=p.length,this._cachedIndex=m,this.copySampleValue_(m-1)}if(m===v)break;if(_=g,g=p[++m],d<g)break t}x=p.length;break e}if(!(d>=_)){let v=p[1];if(d<v)m=2,_=v;for(let y=m-2;;){if(_===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(m===y)break;if(g=_,_=p[--m-1],d>=_)break t}x=m,m=0;break e}break n}while(m<x){let v=m+x>>>1;if(d<p[v])x=v;else m=v+1}if(g=p[m],_=p[m-1],_===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(g===void 0)return m=p.length,this._cachedIndex=m,this.copySampleValue_(m-1)}this._cachedIndex=m,this.intervalChanged_(m,_,g)}return this.interpolate_(m,_,d,g)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(d){let p=this.resultBuffer,m=this.sampleValues,g=this.valueSize,_=d*g;for(let x=0;x!==g;++x)p[x]=m[_+x];return p}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Hc extends is{constructor(d,p,m,g){super(d,p,m,g);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(d,p,m){let g=this.parameterPositions,_=d-2,x=d+1,v=g[_],y=g[x];if(v===void 0)switch(this.getSettings_().endingStart){case 2401:_=d,v=2*p-m;break;case 2402:_=g.length-2,v=p+g[_]-g[_+1];break;default:_=d,v=m}if(y===void 0)switch(this.getSettings_().endingEnd){case 2401:x=d,y=2*m-p;break;case 2402:x=1,y=m+g[1]-g[0];break;default:x=d-1,y=p}let S=(m-p)*0.5,b=this.valueSize;this._weightPrev=S/(p-v),this._weightNext=S/(y-m),this._offsetPrev=_*b,this._offsetNext=x*b}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,b=this._offsetPrev,M=this._offsetNext,T=this._weightPrev,E=this._weightNext,w=(m-p)/(g-p),C=w*w,N=C*w,A=-T*N+2*T*C-T*w,R=(1+T)*N+(-1.5-2*T)*C+(-0.5+T)*w+1,I=(-1-E)*N+(1.5+E)*C+0.5*w,U=E*N-E*C;for(let L=0;L!==v;++L)_[L]=A*x[b+L]+R*x[S+L]+I*x[y+L]+U*x[M+L];return _}}class Gc extends is{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,b=(m-p)/(g-p),M=1-b;for(let T=0;T!==v;++T)_[T]=x[S+T]*M+x[y+T]*b;return _}}class Vc extends is{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d){return this.copySampleValue_(d-1)}}class Wc extends is{interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,b=this.inTangents,M=this.outTangents;if(!b||!M){let w=(m-p)/(g-p),C=1-w;for(let N=0;N!==v;++N)_[N]=x[S+N]*C+x[y+N]*w;return _}let T=v*2,E=d-1;for(let w=0;w!==v;++w){let C=x[S+w],N=x[y+w],A=E*T+w*2,R=M[A],I=M[A+1],U=d*T+w*2,L=b[U],D=b[U+1],k=Mg(m,p,R,L,g);_[w]=af(k,C,I,D,N)}return _}}function af(d,p,m,g,_){let x=1-d;return x*x*x*p+3*x*x*d*m+3*x*d*d*g+d*d*d*_}function bg(d,p,m,g,_){let x=1-d;return 3*x*x*(m-p)+6*x*d*(g-m)+3*d*d*(_-g)}function Mg(d,p,m,g,_){let x=(d-p)/(_-p);for(let v=0;v<8;v++){let y=af(x,p,m,g,_)-d;if(Math.abs(y)<0.0000000001)break;let S=bg(x,p,m,g,_);if(Math.abs(S)<0.0000000001)break;x=Math.max(0,Math.min(1,x-y/S))}return x}class Un{constructor(d,p,m,g){if(d===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(p===void 0||p.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+d);this.name=d,this.times=Ms(p,this.TimeBufferType),this.values=Ms(m,this.ValueBufferType),this.setInterpolation(g||this.DefaultInterpolation)}static toJSON(d){let p=d.constructor,m;if(p.toJSON!==this.toJSON)m=p.toJSON(d);else{m={name:d.name,times:Ms(d.times,Array),values:Ms(d.values,Array)};let g=d.getInterpolation();if(g!==d.DefaultInterpolation)m.interpolation=g;if(wo(d.settings))m.settings={inTangents:Ms(d.settings.inTangents,Array),outTangents:Ms(d.settings.outTangents,Array)}}return m.type=d.ValueTypeName,m}InterpolantFactoryMethodDiscrete(d){return new Vc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodLinear(d){return new Gc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodSmooth(d){return new Hc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodBezier(d){let p=new Wc(this.times,this.values,this.getValueSize(),d);if(this.settings)p.inTangents=this.settings.inTangents,p.outTangents=this.settings.outTangents;return p}setInterpolation(d){let p;switch(d){case 2300:p=this.InterpolantFactoryMethodDiscrete;break;case 2301:p=this.InterpolantFactoryMethodLinear;break;case 2302:p=this.InterpolantFactoryMethodSmooth;break;case 2303:p=this.InterpolantFactoryMethodBezier;break}if(p===void 0){let m="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(d!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(m);return qt("KeyframeTrack:",m),this}return this.createInterpolant=p,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(d){if(d!==0){let p=this.times;for(let m=0,g=p.length;m!==g;++m)p[m]+=d;if(wo(this.settings))$u(this.settings.inTangents,d),$u(this.settings.outTangents,d)}return this}scale(d){if(d!==1){let p=this.times;for(let m=0,g=p.length;m!==g;++m)p[m]*=d;if(wo(this.settings))Ju(this.settings.inTangents,d),Ju(this.settings.outTangents,d)}return this}trim(d,p){let m=this.times,g=m.length,_=0,x=g-1;while(_!==g&&m[_]<d)++_;while(x!==-1&&m[x]>p)--x;if(++x,_!==0||x!==g){if(_>=x)x=Math.max(x,1),_=x-1;let v=this.getValueSize();this.times=m.slice(_,x),this.values=this.values.slice(_*v,x*v)}return this}validate(){let d=!0,p=this.getValueSize();if(p-Math.floor(p)!==0)Zt("KeyframeTrack: Invalid value size in track.",this),d=!1;let m=this.times,g=this.values,_=m.length;if(_===0)Zt("KeyframeTrack: Track is empty.",this),d=!1;let x=null;for(let v=0;v!==_;v++){let y=m[v];if(typeof y==="number"&&isNaN(y)){Zt("KeyframeTrack: Time is not a valid number.",this,v,y),d=!1;break}if(x!==null&&x>y){Zt("KeyframeTrack: Out of order keys.",this,v,y,x),d=!1;break}x=y}if(g!==void 0){if(Lm(g))for(let v=0,y=g.length;v!==y;++v){let S=g[v];if(isNaN(S)){Zt("KeyframeTrack: Value is not a valid number.",this,v,S),d=!1;break}}}return d}optimize(){let d=this.times.slice(),p=this.values.slice(),m=this.getValueSize(),g=this.getInterpolation()===2302,_=d.length-1,x=1;for(let v=1;v<_;++v){let y=!1,S=d[v],b=d[v+1];if(S!==b&&(v!==1||S!==d[0]))if(!g){let M=v*m,T=M-m,E=M+m;for(let w=0;w!==m;++w){let C=p[M+w];if(C!==p[T+w]||C!==p[E+w]){y=!0;break}}}else y=!0;if(y){if(v!==x){d[x]=d[v];let M=v*m,T=x*m;for(let E=0;E!==m;++E)p[T+E]=p[M+E]}++x}}if(_>0){d[x]=d[_];for(let v=_*m,y=x*m,S=0;S!==m;++S)p[y+S]=p[v+S];++x}if(x!==d.length)this.times=d.slice(0,x),this.values=p.slice(0,x*m);else this.times=d,this.values=p;return this}clone(){let d=this.times.slice(),p=this.values.slice(),g=new this.constructor(this.name,d,p);if(g.createInterpolant=this.createInterpolant,wo(this.settings))g.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return g}}function $u(d,p){for(let m=0,g=d.length;m!==g;m+=2)d[m]+=p}function Ju(d,p){for(let m=0,g=d.length;m!==g;m+=2)d[m]*=p}Un.prototype.ValueTypeName="";Un.prototype.TimeBufferType=Float32Array;Un.prototype.ValueBufferType=Float32Array;Un.prototype.DefaultInterpolation=2301;class ss extends Un{constructor(d,p,m){super(d,p,m)}}ss.prototype.ValueTypeName="bool";ss.prototype.ValueBufferType=Array;ss.prototype.DefaultInterpolation=2300;ss.prototype.InterpolantFactoryMethodLinear=void 0;ss.prototype.InterpolantFactoryMethodSmooth=void 0;class Xc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}Xc.prototype.ValueTypeName="color";class qc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}qc.prototype.ValueTypeName="number";class Yc extends is{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=(m-p)/(g-p),S=d*v;for(let b=S+v;S!==b;S+=4)di.slerpFlat(_,0,x,S-v,x,S,y);return _}}class Qo extends Un{constructor(d,p,m,g){super(d,p,m,g)}InterpolantFactoryMethodLinear(d){return new Yc(this.times,this.values,this.getValueSize(),d)}}Qo.prototype.ValueTypeName="quaternion";Qo.prototype.InterpolantFactoryMethodSmooth=void 0;class rs extends Un{constructor(d,p,m){super(d,p,m)}}rs.prototype.ValueTypeName="string";rs.prototype.ValueBufferType=Array;rs.prototype.DefaultInterpolation=2300;rs.prototype.InterpolantFactoryMethodLinear=void 0;rs.prototype.InterpolantFactoryMethodSmooth=void 0;class Zc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}Zc.prototype.ValueTypeName="vector";var Rl={enabled:!1,files:{},add:function(d,p){if(this.enabled===!1)return;if(Ku(d))return;this.files[d]=p},get:function(d){if(this.enabled===!1)return;if(Ku(d))return;return this.files[d]},remove:function(d){delete this.files[d]},clear:function(){this.files={}}};function Ku(d){try{let p=d.slice(d.indexOf(":")+1);return new URL(p).protocol==="blob:"}catch(p){return!1}}class $c{constructor(d,p,m){let g=this,_=!1,x=0,v=0,y=void 0,S=[];this.onStart=void 0,this.onLoad=d,this.onProgress=p,this.onError=m,this._abortController=null,this.itemStart=function(b){if(v++,_===!1){if(g.onStart!==void 0)g.onStart(b,x,v)}_=!0},this.itemEnd=function(b){if(x++,g.onProgress!==void 0)g.onProgress(b,x,v);if(x===v){if(_=!1,g.onLoad!==void 0)g.onLoad()}},this.itemError=function(b){if(g.onError!==void 0)g.onError(b)},this.resolveURL=function(b){if(b=b.normalize("NFC"),y)return y(b);return b},this.setURLModifier=function(b){return y=b,this},this.addHandler=function(b,M){return S.push(b,M),this},this.removeHandler=function(b){let M=S.indexOf(b);if(M!==-1)S.splice(M,2);return this},this.getHandler=function(b){for(let M=0,T=S.length;M<T;M+=2){let E=S[M],w=S[M+1];if(E.global)E.lastIndex=0;if(E.test(b))return w}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var lf=new $c;class Nr{constructor(d){if(this.manager=d!==void 0?d:lf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(d,p){let m=this;return new Promise(function(g,_){m.load(d,g,p,_)})}parse(){}setCrossOrigin(d){return this.crossOrigin=d,this}setWithCredentials(d){return this.withCredentials=d,this}setPath(d){return this.path=d,this}setResourcePath(d){return this.resourcePath=d,this}setRequestHeader(d){return this.requestHeader=d,this}setPriority(d){return this.priority=d,this}setCache(d){return this.cache=d,this}abort(){return this}}Nr.DEFAULT_MATERIAL_NAME="__DEFAULT";var oi={};class cf extends Error{constructor(d,p){super(d);this.response=p}}class Jc extends Nr{constructor(d){super(d);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(d,p,m,g){if(d===void 0)d="";if(this.path!==void 0)d=this.path+d;d=this.manager.resolveURL(d);let _=Rl.get(`file:${d}`);if(_!==void 0){this.manager.itemStart(d),setTimeout(()=>{if(p)p(_);this.manager.itemEnd(d)},0);return}if(oi[d]!==void 0){oi[d].push({onLoad:p,onProgress:m,onError:g});return}oi[d]=[],oi[d].push({onLoad:p,onProgress:m,onError:g});let x=new Request(d,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),v=this.mimeType,y=this.responseType;fetch(x).then((S)=>{if(S.status===200||S.status===0){if(S.status===0)qt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||S.body===void 0||S.body.getReader===void 0)return S;let b=oi[d],M=S.body.getReader(),T=S.headers.get("X-File-Size")||S.headers.get("Content-Length"),E=T?parseInt(T):0,w=E!==0,C=0,N=new ReadableStream({start(A){R();function R(){M.read().then(({done:I,value:U})=>{if(I)A.close();else{C+=U.byteLength;let L=new ProgressEvent("progress",{lengthComputable:w,loaded:C,total:E});for(let D=0,k=b.length;D<k;D++){let P=b[D];if(P.onProgress)P.onProgress(L)}A.enqueue(U),R()}},(I)=>{A.error(I)})}}});return new Response(N)}else throw new cf(`fetch for "${S.url}" responded with ${S.status}: ${S.statusText}`,S)}).then((S)=>{switch(y){case"arraybuffer":return S.arrayBuffer();case"blob":return S.blob();case"document":return S.text().then((b)=>new DOMParser().parseFromString(b,v));case"json":return S.json();default:if(v==="")return S.text();else{let M=/charset="?([^;"\s]*)"?/i.exec(v),T=M&&M[1]?M[1].toLowerCase():void 0,E=new TextDecoder(T);return S.arrayBuffer().then((w)=>E.decode(w))}}}).then((S)=>{Rl.add(`file:${d}`,S);let b=oi[d];delete oi[d];for(let M=0,T=b.length;M<T;M++){let E=b[M];if(E.onLoad)E.onLoad(S)}}).catch((S)=>{let b=oi[d];if(b===void 0)throw this.manager.itemError(d),S;delete oi[d];for(let M=0,T=b.length;M<T;M++){let E=b[M];if(E.onError)E.onError(S)}this.manager.itemError(d)}).finally(()=>{this.manager.itemEnd(d)}),this.manager.itemStart(d)}setResponseType(d){return this.responseType=d,this}setMimeType(d){return this.mimeType=d,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class ta extends Nr{constructor(d){super(d)}load(d,p,m,g){let _=this,x=[],v=new Ir,y=new Jc(this.manager);y.setPriority(this.priority),y.setCache(this.cache),y.setPath(this.path),y.setResponseType("arraybuffer"),y.setRequestHeader(this.requestHeader),y.setWithCredentials(_.withCredentials);let S=0;function b(M){y.load(d[M],function(T){let E=_.parse(T,!0);if(x[M]={width:E.width,height:E.height,format:E.format,mipmaps:E.mipmaps},S+=1,S===6){if(E.mipmapCount===1)v.minFilter=1006;if(v.image=x,v.format=E.format,v.needsUpdate=!0,p)p(v)}},m,g)}if(Array.isArray(d))for(let M=0,T=d.length;M<T;++M)b(M);else y.load(d,function(M){let T=_.parse(M,!0);if(T.isCubemap){let E=T.mipmaps.length/T.mipmapCount;for(let w=0;w<E;w++){x[w]={mipmaps:[]};for(let C=0;C<T.mipmapCount;C++)x[w].mipmaps.push(T.mipmaps[w*T.mipmapCount+C]),x[w].format=T.format,x[w].width=T.width,x[w].height=T.height}v.image=x}else v.image.width=T.width,v.image.height=T.height,v.mipmaps=T.mipmaps;if(T.mipmapCount===1)v.minFilter=1006;if(v.format=T.format,v.needsUpdate=!0,p)p(v)},m,g);return v}}class ea extends qe{static registerNode(d){this.prototype._lightNode=d}constructor(d,p=1){super();this.isLight=!0,this.type="Light",this.color=new re(d),this.intensity=p}copy(d,p){return super.copy(d,p),this.color.copy(d.color),this.intensity=d.intensity,this}toJSON(d){let p=super.toJSON(d);return p.object.color=this.color.getHex(),p.object.intensity=this.intensity,p}}var Tl=new se,ju=new q,Qu=new q;class Kc{constructor(d){this.camera=d,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new $t(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ti,this._frameExtents=new $t(1,1),this._viewportCount=1,this._viewports=[new Oe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(d){let p=this.camera;ju.setFromMatrixPosition(d.matrixWorld),p.position.copy(ju),Qu.setFromMatrixPosition(d.target.matrixWorld),p.lookAt(Qu),p.updateMatrixWorld(),this._updateMatrix(p,this.matrix,this._frustum)}_updateMatrix(d,p,m,g){Tl.multiplyMatrices(d.projectionMatrix,d.matrixWorldInverse),m.setFromProjectionMatrix(Tl,d.coordinateSystem,d.reversedDepth);let _=this._frameExtents,x=g?g.z/_.x:1,v=g?g.w/_.y:1,y=g?g.x/_.x:0,S=g?g.y/_.y:0;if(d.coordinateSystem===2001||d.reversedDepth)p.set(0.5*x,0,0,0.5*x+y,0,0.5*v,0,0.5*v+S,0,0,1,0,0,0,0,1);else p.set(0.5*x,0,0,0.5*x+y,0,0.5*v,0,0.5*v+S,0,0,0.5,0.5,0,0,0,1);p.multiply(Tl)}getViewport(d){return this._viewports[d]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(d){return this.camera=d.camera.clone(),this.intensity=d.intensity,this.bias=d.bias,this.radius=d.radius,this.autoUpdate=d.autoUpdate,this.needsUpdate=d.needsUpdate,this.normalBias=d.normalBias,this.blurSamples=d.blurSamples,this.mapSize.copy(d.mapSize),this.mapType=d.mapType,this.biasNode=d.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let d={};return d.intensity=this.intensity,d.bias=this.bias,d.normalBias=this.normalBias,d.radius=this.radius,d.blurSamples=this.blurSamples,d.mapSize=this.mapSize.toArray(),d.mapType=this.mapType,d.camera=this.camera.toJSON(!1).object,delete d.camera.matrix,d}}var Ao=new q,Ro=new di,qn=new q;class na extends qe{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new se,this.projectionMatrix=new se,this.projectionMatrixInverse=new se,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(d,p){return super.copy(d,p),this.matrixWorldInverse.copy(d.matrixWorldInverse),this.projectionMatrix.copy(d.projectionMatrix),this.projectionMatrixInverse.copy(d.projectionMatrixInverse),this.coordinateSystem=d.coordinateSystem,this}getWorldDirection(d){return super.getWorldDirection(d).negate()}updateMatrixWorld(d){if(super.updateMatrixWorld(d),this.matrixWorld.decompose(Ao,Ro,qn),qn.x===1&&qn.y===1&&qn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Ao,Ro,qn.set(1,1,1)).invert()}updateWorldMatrix(d,p,m=!1){if(super.updateWorldMatrix(d,p,m),this.matrixWorld.decompose(Ao,Ro,qn),qn.x===1&&qn.y===1&&qn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Ao,Ro,qn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var Ei=new q,td=new $t,ed=new $t;class En extends na{constructor(d=50,p=1,m=0.1,g=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=d,this.zoom=1,this.near=m,this.far=g,this.focus=10,this.aspect=p,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(d,p){return super.copy(d,p),this.fov=d.fov,this.zoom=d.zoom,this.near=d.near,this.far=d.far,this.focus=d.focus,this.aspect=d.aspect,this.view=d.view===null?null:Object.assign({},d.view),this.filmGauge=d.filmGauge,this.filmOffset=d.filmOffset,this}setFocalLength(d){let p=0.5*this.getFilmHeight()/d;this.fov=Ls*2*Math.atan(p),this.updateProjectionMatrix()}getFocalLength(){let d=Math.tan(pr*0.5*this.fov);return 0.5*this.getFilmHeight()/d}getEffectiveFOV(){return Ls*2*Math.atan(Math.tan(pr*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(d,p,m){Ei.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),p.set(Ei.x,Ei.y).multiplyScalar(-d/Ei.z),Ei.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),m.set(Ei.x,Ei.y).multiplyScalar(-d/Ei.z)}getViewSize(d,p){return this.getViewBounds(d,td,ed),p.subVectors(ed,td)}setViewOffset(d,p,m,g,_,x){if(this.aspect=d/p,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=d,this.view.fullHeight=p,this.view.offsetX=m,this.view.offsetY=g,this.view.width=_,this.view.height=x,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let d=this.near,p=d*Math.tan(pr*0.5*this.fov)/this.zoom,m=2*p,g=this.aspect*m,_=-0.5*g,x=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:y,fullHeight:S}=x;_+=x.offsetX*g/y,p-=x.offsetY*m/S,g*=x.width/y,m*=x.height/S}let v=this.filmOffset;if(v!==0)_+=d*v/this.getFilmWidth();this.projectionMatrix.makePerspective(_,_+g,p,p-m,d,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(d){let p=super.toJSON(d);if(p.object.fov=this.fov,p.object.zoom=this.zoom,p.object.near=this.near,p.object.far=this.far,p.object.focus=this.focus,p.object.aspect=this.aspect,this.view!==null)p.object.view=Object.assign({},this.view);return p.object.filmGauge=this.filmGauge,p.object.filmOffset=this.filmOffset,p}}class ia extends na{constructor(d=-1,p=1,m=1,g=-1,_=0.1,x=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=d,this.right=p,this.top=m,this.bottom=g,this.near=_,this.far=x,this.updateProjectionMatrix()}copy(d,p){return super.copy(d,p),this.left=d.left,this.right=d.right,this.top=d.top,this.bottom=d.bottom,this.near=d.near,this.far=d.far,this.zoom=d.zoom,this.view=d.view===null?null:Object.assign({},d.view),this}setViewOffset(d,p,m,g,_,x){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=d,this.view.fullHeight=p,this.view.offsetX=m,this.view.offsetY=g,this.view.width=_,this.view.height=x,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let d=(this.right-this.left)/(2*this.zoom),p=(this.top-this.bottom)/(2*this.zoom),m=(this.right+this.left)/2,g=(this.top+this.bottom)/2,_=m-d,x=m+d,v=g+p,y=g-p;if(this.view!==null&&this.view.enabled){let S=(this.right-this.left)/this.view.fullWidth/this.zoom,b=(this.top-this.bottom)/this.view.fullHeight/this.zoom;_+=S*this.view.offsetX,x=_+S*this.view.width,v-=b*this.view.offsetY,y=v-b*this.view.height}this.projectionMatrix.makeOrthographic(_,x,v,y,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(d){let p=super.toJSON(d);if(p.object.zoom=this.zoom,p.object.left=this.left,p.object.right=this.right,p.object.top=this.top,p.object.bottom=this.bottom,p.object.near=this.near,p.object.far=this.far,this.view!==null)p.object.view=Object.assign({},this.view);return p}}class hf extends Kc{constructor(){super(new ia(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class sa extends ea{constructor(d,p){super(d,p);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(qe.DEFAULT_UP),this.updateMatrix(),this.target=new qe,this.shadow=new hf}dispose(){super.dispose(),this.shadow.dispose()}copy(d){return super.copy(d),this.target=d.target.clone(),this.shadow=d.shadow.clone(),this}toJSON(d){let p=super.toJSON(d);return p.object.shadow=this.shadow.toJSON(),p.object.target=this.target.uuid,p}}class ra extends ea{constructor(d,p){super(d,p);this.isAmbientLight=!0,this.type="AmbientLight"}}var Es=-90,Ts=1;class Dr extends qe{constructor(d,p,m){super();this.type="CubeCamera",this.renderTarget=m,this.coordinateSystem=null,this.activeMipmapLevel=0;let g=new En(Es,Ts,d,p);g.layers=this.layers,this.add(g);let _=new En(Es,Ts,d,p);_.layers=this.layers,this.add(_);let x=new En(Es,Ts,d,p);x.layers=this.layers,this.add(x);let v=new En(Es,Ts,d,p);v.layers=this.layers,this.add(v);let y=new En(Es,Ts,d,p);y.layers=this.layers,this.add(y);let S=new En(Es,Ts,d,p);S.layers=this.layers,this.add(S)}updateCoordinateSystem(){let d=this.coordinateSystem,p=this.children.concat(),[m,g,_,x,v,y]=p;for(let S of p)this.remove(S);if(d===2000)m.up.set(0,1,0),m.lookAt(1,0,0),g.up.set(0,1,0),g.lookAt(-1,0,0),_.up.set(0,0,-1),_.lookAt(0,1,0),x.up.set(0,0,1),x.lookAt(0,-1,0),v.up.set(0,1,0),v.lookAt(0,0,1),y.up.set(0,1,0),y.lookAt(0,0,-1);else if(d===2001)m.up.set(0,-1,0),m.lookAt(-1,0,0),g.up.set(0,-1,0),g.lookAt(1,0,0),_.up.set(0,0,1),_.lookAt(0,1,0),x.up.set(0,0,-1),x.lookAt(0,-1,0),v.up.set(0,-1,0),v.lookAt(0,0,1),y.up.set(0,-1,0),y.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+d);for(let S of p)this.add(S),S.updateMatrixWorld()}update(d,p){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:m,activeMipmapLevel:g}=this;if(this.coordinateSystem!==d.coordinateSystem)this.coordinateSystem=d.coordinateSystem,this.updateCoordinateSystem();let[_,x,v,y,S,b]=this.children,M=d.getRenderTarget(),T=d.getActiveCubeFace(),E=d.getActiveMipmapLevel(),w=d.xr.enabled;d.xr.enabled=!1;let C=m.texture.mipmapsAutoUpdate;m.texture.mipmapsAutoUpdate=!1;let N=!1;if(d.isWebGLRenderer===!0)N=d.state.buffers.depth.getReversed();else N=d.reversedDepthBuffer;if(d.setRenderTarget(m,0,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,_),d.setRenderTarget(m,1,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,x),d.setRenderTarget(m,2,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,v),d.setRenderTarget(m,3,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,y),d.setRenderTarget(m,4,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,S),m.texture.mipmapsAutoUpdate=C,d.setRenderTarget(m,5,g),N&&d.autoClear===!1)d.clearDepth();d.render(p,b),d.setRenderTarget(M,T,E),d.xr.enabled=w,m.texture.needsPMREMUpdate=!0}}class jc extends En{constructor(d=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=d,this.perCameraFrustumCulled=!1}}var Qc="\\[\\]\\.:\\/",Eg=new RegExp("["+Qc+"]","g"),th="[^"+Qc+"]",Tg="[^"+Qc.replace("\\.","")+"]",wg=/((?:WC+[\/:])*)/.source.replace("WC",th),Ag=/(WCOD+)?/.source.replace("WCOD",Tg),Rg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",th),Cg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",th),Pg=new RegExp("^"+wg+Ag+Rg+Cg+"$"),Ig=["material","materials","bones","map"];class uf{constructor(d,p,m){let g=m||we.parseTrackName(p);this._targetGroup=d,this._bindings=d.subscribe_(p,g)}getValue(d,p){this.bind();let m=this._targetGroup.nCachedObjects_,g=this._bindings[m];if(g!==void 0)g.getValue(d,p)}setValue(d,p){let m=this._bindings;for(let g=this._targetGroup.nCachedObjects_,_=m.length;g!==_;++g)m[g].setValue(d,p)}bind(){let d=this._bindings;for(let p=this._targetGroup.nCachedObjects_,m=d.length;p!==m;++p)d[p].bind()}unbind(){let d=this._bindings;for(let p=this._targetGroup.nCachedObjects_,m=d.length;p!==m;++p)d[p].unbind()}}class we{constructor(d,p,m){this.path=p,this.parsedPath=m||we.parseTrackName(p),this.node=we.findNode(d,this.parsedPath.nodeName),this.rootNode=d,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(d,p,m){if(!(d&&d.isAnimationObjectGroup))return new we(d,p,m);else return new we.Composite(d,p,m)}static sanitizeNodeName(d){return d.replace(/\s/g,"_").replace(Eg,"")}static parseTrackName(d){let p=Pg.exec(d);if(p===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+d);let m={nodeName:p[2],objectName:p[3],objectIndex:p[4],propertyName:p[5],propertyIndex:p[6]},g=m.nodeName&&m.nodeName.lastIndexOf(".");if(g!==void 0&&g!==-1){let _=m.nodeName.substring(g+1);if(Ig.indexOf(_)!==-1)m.nodeName=m.nodeName.substring(0,g),m.objectName=_}if(m.propertyName===null||m.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+d);return m}static findNode(d,p){if(p===void 0||p===""||p==="."||p===-1||p===d.name||p===d.uuid)return d;if(d.skeleton){let m=d.skeleton.getBoneByName(p);if(m!==void 0)return m}if(d.children){let m=function(_){for(let x=0;x<_.length;x++){let v=_[x];if(v.name===p||v.uuid===p)return v;let y=m(v.children);if(y)return y}return null},g=m(d.children);if(g)return g}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(d,p){d[p]=this.targetObject[this.propertyName]}_getValue_array(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)d[p++]=m[g]}_getValue_arrayElement(d,p){d[p]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(d,p){this.resolvedProperty.toArray(d,p)}_setValue_direct(d,p){this.targetObject[this.propertyName]=d[p]}_setValue_direct_setNeedsUpdate(d,p){this.targetObject[this.propertyName]=d[p],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(d,p){this.targetObject[this.propertyName]=d[p],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++]}_setValue_array_setNeedsUpdate(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(d,p){this.resolvedProperty[this.propertyIndex]=d[p]}_setValue_arrayElement_setNeedsUpdate(d,p){this.resolvedProperty[this.propertyIndex]=d[p],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(d,p){this.resolvedProperty[this.propertyIndex]=d[p],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(d,p){this.resolvedProperty.fromArray(d,p)}_setValue_fromArray_setNeedsUpdate(d,p){this.resolvedProperty.fromArray(d,p),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(d,p){this.resolvedProperty.fromArray(d,p),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(d,p){this.bind(),this.getValue(d,p)}_setValue_unbound(d,p){this.bind(),this.setValue(d,p)}bind(){let d=this.node,p=this.parsedPath,{objectName:m,propertyName:g,propertyIndex:_}=p;if(!d)d=we.findNode(this.rootNode,p.nodeName),this.node=d;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!d){qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(m){let S=p.objectIndex;switch(m){case"materials":if(!d.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!d.material.materials){Zt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}d=d.material.materials;break;case"bones":if(!d.skeleton){Zt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}d=d.skeleton.bones;for(let b=0;b<d.length;b++)if(d[b].name===S){S=b;break}break;case"map":if("map"in d){d=d.map;break}if(!d.material){Zt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!d.material.map){Zt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}d=d.material.map;break;default:if(d[m]===void 0){Zt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}d=d[m]}if(S!==void 0){if(d[S]===void 0){Zt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,d);return}d=d[S]}}let x=d[g];if(x===void 0){let S=p.nodeName;Zt("PropertyBinding: Trying to update property for track: "+S+"."+g+" but it wasn't found.",d);return}let v=this.Versioning.None;if(this.targetObject=d,d.isMaterial===!0)v=this.Versioning.NeedsUpdate;else if(d.isObject3D===!0)v=this.Versioning.MatrixWorldNeedsUpdate;let y=this.BindingType.Direct;if(_!==void 0){if(g==="morphTargetInfluences"){if(!d.geometry){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!d.geometry.morphAttributes){Zt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(d.morphTargetDictionary[_]!==void 0)_=d.morphTargetDictionary[_]}y=this.BindingType.ArrayElement,this.resolvedProperty=x,this.propertyIndex=_}else if(x.fromArray!==void 0&&x.toArray!==void 0)y=this.BindingType.HasFromToArray,this.resolvedProperty=x;else if(Array.isArray(x))y=this.BindingType.EntireArray,this.resolvedProperty=x;else this.propertyName=g;this.getValue=this.GetterByBindingType[y],this.setValue=this.SetterByBindingTypeAndVersioning[y][v]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}we.Composite=uf;we.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};we.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};we.prototype.GetterByBindingType=[we.prototype._getValue_direct,we.prototype._getValue_array,we.prototype._getValue_arrayElement,we.prototype._getValue_toArray];we.prototype.SetterByBindingTypeAndVersioning=[[we.prototype._setValue_direct,we.prototype._setValue_direct_setNeedsUpdate,we.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[we.prototype._setValue_array,we.prototype._setValue_array_setNeedsUpdate,we.prototype._setValue_array_setMatrixWorldNeedsUpdate],[we.prototype._setValue_arrayElement,we.prototype._setValue_arrayElement_setNeedsUpdate,we.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[we.prototype._setValue_fromArray,we.prototype._setValue_fromArray_setNeedsUpdate,we.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var vb=new Float32Array(1);var nd=new se;class Ur{constructor(d,p,m=0,g=1/0){this.ray=new Ii(d,p),this.near=m,this.far=g,this.camera=null,this.layers=new Ar,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(d,p){this.ray.set(d,p)}setFromCamera(d,p){if(p.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(p.matrixWorld),this.ray.direction.set(d.x,d.y,0.5).unproject(p).sub(this.ray.origin).normalize(),this.camera=p;else if(p.isOrthographicCamera)this.ray.origin.set(d.x,d.y,p.projectionMatrix.elements[14]).unproject(p),this.ray.direction.set(0,0,-1).transformDirection(p.matrixWorld),this.camera=p;else Zt("Raycaster: Unsupported camera type: "+p.type)}setFromXRController(d){return nd.identity().extractRotation(d.matrixWorld),this.ray.origin.setFromMatrixPosition(d.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(nd),this}intersectObject(d,p=!0,m=[]){return Cl(d,this,m,p),m.sort(id),m}intersectObjects(d,p=!0,m=[]){for(let g=0,_=d.length;g<_;g++)Cl(d[g],this,m,p);return m.sort(id),m}}function id(d,p){return d.distance-p.distance}function Cl(d,p,m,g){let _=!0;if(d.layers.test(p.layers)){if(d.raycast(p,m)===!1)_=!1}if(_===!0&&g===!0){let x=d.children;for(let v=0,y=x.length;v<y;v++)Cl(x[v],p,m,!0)}}class oa{constructor(d=1,p=0,m=0){this.radius=d,this.phi=p,this.theta=m}set(d,p,m){return this.radius=d,this.phi=p,this.theta=m,this}copy(d){return this.radius=d.radius,this.phi=d.phi,this.theta=d.theta,this}makeSafe(){return this.phi=ne(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(d){return this.setFromCartesianCoords(d.x,d.y,d.z)}setFromCartesianCoords(d,p,m){if(this.radius=Math.sqrt(d*d+p*p+m*m),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(d,m),this.phi=Math.acos(ne(p/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class df{static{this.prototype.isMatrix2=!0}constructor(d,p,m,g){if(this.elements=[1,0,0,1],d!==void 0)this.set(d,p,m,g)}identity(){return this.set(1,0,0,1),this}fromArray(d,p=0){for(let m=0;m<4;m++)this.elements[m]=d[m+p];return this}set(d,p,m,g){let _=this.elements;return _[0]=d,_[2]=p,_[1]=m,_[3]=g,this}}var sd=new q,Co=new q,ws=new q,As=new q,wl=new q,Lg=new q,Ng=new q;class wn{constructor(d=new q,p=new q){this.start=d,this.end=p}set(d,p){return this.start.copy(d),this.end.copy(p),this}copy(d){return this.start.copy(d.start),this.end.copy(d.end),this}getCenter(d){return d.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(d){return d.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(d,p){return this.delta(p).multiplyScalar(d).add(this.start)}closestPointToPointParameter(d,p){sd.subVectors(d,this.start),Co.subVectors(this.end,this.start);let m=Co.dot(Co);if(m===0)return 0;let _=Co.dot(sd)/m;if(p)_=ne(_,0,1);return _}closestPointToPoint(d,p,m){let g=this.closestPointToPointParameter(d,p);return this.delta(m).multiplyScalar(g).add(this.start)}distanceSqToLine3(d,p=Lg,m=Ng){let _,x,v=this.start,y=d.start,S=this.end,b=d.end;ws.subVectors(S,v),As.subVectors(b,y),wl.subVectors(v,y);let M=ws.dot(ws),T=As.dot(As),E=As.dot(wl);if(M<=0.00000000000000010000000000000001&&T<=0.00000000000000010000000000000001)return p.copy(v),m.copy(y),p.distanceToSquared(m);if(M<=0.00000000000000010000000000000001)_=0,x=E/T,x=ne(x,0,1);else{let w=ws.dot(wl);if(T<=0.00000000000000010000000000000001)x=0,_=ne(-w/M,0,1);else{let C=ws.dot(As),N=M*T-C*C;if(N!==0)_=ne((C*E-w*T)/N,0,1);else _=0;if(x=(C*_+E)/T,x<0)x=0,_=ne(-w/M,0,1);else if(x>1)x=1,_=ne((C-w)/M,0,1)}}return p.copy(v).addScaledVector(ws,_),m.copy(y).addScaledVector(As,x),p.distanceToSquared(m)}applyMatrix4(d){return this.start.applyMatrix4(d),this.end.applyMatrix4(d),this}equals(d){return d.start.equals(this.start)&&d.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class aa extends pi{constructor(d,p=16776960){let m=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),g=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],_=new Ye;_.setIndex(new Xe(m,1)),_.setAttribute("position",new rn(g,3));super(_,new Li({color:p,toneMapped:!1}));this.box=d,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(d){let p=this.box;if(p.isEmpty())return;p.getCenter(this.position),p.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(d)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function eh(d,p,m,g){let _=Dg(g);switch(m){case 1021:return d*p;case 1028:return d*p/_.components*_.byteLength;case 1029:return d*p/_.components*_.byteLength;case 1030:return d*p*2/_.components*_.byteLength;case 1031:return d*p*2/_.components*_.byteLength;case 1022:return d*p*3/_.components*_.byteLength;case 1023:return d*p*4/_.components*_.byteLength;case 1033:return d*p*4/_.components*_.byteLength;case 33776:case 33777:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*8;case 33778:case 33779:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 35841:case 35843:return Math.max(d,16)*Math.max(p,8)/4;case 35840:case 35842:return Math.max(d,8)*Math.max(p,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 37808:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 37809:return Math.floor((d+4)/5)*Math.floor((p+3)/4)*16;case 37810:return Math.floor((d+4)/5)*Math.floor((p+4)/5)*16;case 37811:return Math.floor((d+5)/6)*Math.floor((p+4)/5)*16;case 37812:return Math.floor((d+5)/6)*Math.floor((p+5)/6)*16;case 37813:return Math.floor((d+7)/8)*Math.floor((p+4)/5)*16;case 37814:return Math.floor((d+7)/8)*Math.floor((p+5)/6)*16;case 37815:return Math.floor((d+7)/8)*Math.floor((p+7)/8)*16;case 37816:return Math.floor((d+9)/10)*Math.floor((p+4)/5)*16;case 37817:return Math.floor((d+9)/10)*Math.floor((p+5)/6)*16;case 37818:return Math.floor((d+9)/10)*Math.floor((p+7)/8)*16;case 37819:return Math.floor((d+9)/10)*Math.floor((p+9)/10)*16;case 37820:return Math.floor((d+11)/12)*Math.floor((p+9)/10)*16;case 37821:return Math.floor((d+11)/12)*Math.floor((p+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(d/4)*Math.ceil(p/4)*16;case 36283:case 36284:return Math.ceil(d/4)*Math.ceil(p/4)*8;case 36285:case 36286:return Math.ceil(d/4)*Math.ceil(p/4)*16}throw Error(`Unable to determine texture byte length for ${m} format.`)}function Dg(d){switch(d){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${d}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)qt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function Df(){let d=null,p=!1,m=null,g=null;function _(x,v){g=d.requestAnimationFrame(_),m(x,v)}return{start:function(){if(p===!0)return;if(m===null)return;if(d===null)return;g=d.requestAnimationFrame(_),p=!0},stop:function(){if(d!==null)d.cancelAnimationFrame(g);p=!1},setAnimationLoop:function(x){m=x},setContext:function(x){d=x}}}function Ug(d){let p=new WeakMap;function m(y,S){let{array:b,usage:M}=y,T=b.byteLength,E=d.createBuffer();d.bindBuffer(S,E),d.bufferData(S,b,M),y.onUploadCallback();let w;if(b instanceof Float32Array)w=d.FLOAT;else if(typeof Float16Array<"u"&&b instanceof Float16Array)w=d.HALF_FLOAT;else if(b instanceof Uint16Array)if(y.isFloat16BufferAttribute)w=d.HALF_FLOAT;else w=d.UNSIGNED_SHORT;else if(b instanceof Int16Array)w=d.SHORT;else if(b instanceof Uint32Array)w=d.UNSIGNED_INT;else if(b instanceof Int32Array)w=d.INT;else if(b instanceof Int8Array)w=d.BYTE;else if(b instanceof Uint8Array)w=d.UNSIGNED_BYTE;else if(b instanceof Uint8ClampedArray)w=d.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+b);return{buffer:E,type:w,bytesPerElement:b.BYTES_PER_ELEMENT,version:y.version,size:T}}function g(y,S,b){let{array:M,updateRanges:T}=S;if(d.bindBuffer(b,y),T.length===0)d.bufferSubData(b,0,M);else{T.sort((w,C)=>w.start-C.start);let E=0;for(let w=1;w<T.length;w++){let C=T[E],N=T[w];if(N.start<=C.start+C.count+1)C.count=Math.max(C.count,N.start+N.count-C.start);else++E,T[E]=N}T.length=E+1;for(let w=0,C=T.length;w<C;w++){let N=T[w];d.bufferSubData(b,N.start*M.BYTES_PER_ELEMENT,M,N.start,N.count)}S.clearUpdateRanges()}S.onUploadCallback()}function _(y){if(y.isInterleavedBufferAttribute)y=y.data;return p.get(y)}function x(y){if(y.isInterleavedBufferAttribute)y=y.data;let S=p.get(y);if(S)d.deleteBuffer(S.buffer),p.delete(y)}function v(y,S){if(y.isInterleavedBufferAttribute)y=y.data;if(y.isGLBufferAttribute){let M=p.get(y);if(!M||M.version<y.version)p.set(y,{buffer:y.buffer,type:y.type,bytesPerElement:y.elementSize,version:y.version});return}let b=p.get(y);if(b===void 0)p.set(y,m(y,S));else if(b.version<y.version){if(b.size!==y.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");g(b.buffer,y,S),b.version=y.version}}return{get:_,remove:x,update:v}}var Fg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Og=`#ifdef USE_ALPHAHASH
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
#endif`,Bg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,zg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Hg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Gg=`#ifdef USE_AOMAP
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
#endif`,Vg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Wg=`#ifdef USE_BATCHING
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
#endif`,Xg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,qg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zg=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,$g=`#ifdef USE_IRIDESCENCE
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
#endif`,Jg=`#ifdef USE_BUMPMAP
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
#endif`,Kg=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,jg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,t_=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,e_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,n_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,i_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,s_=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,r_=`#define PI 3.141592653589793
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
} // validated`,o_=`vec3 transformedNormal = objectNormal;
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
#endif`,a_=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,l_=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,c_=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,h_=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,u_="gl_FragColor = linearToOutputTexel( gl_FragColor );",d_=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,f_=`#ifdef USE_ENVMAP
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
#endif`,p_=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,m_=`#ifdef USE_ENVMAP
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
#endif`,g_=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,__=`#ifdef USE_ENVMAP
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
#endif`,x_=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,v_=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,y_=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,S_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,b_=`#ifdef USE_GRADIENTMAP
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
}`,M_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,E_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,T_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,w_=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,A_=`#ifdef USE_ENVMAP
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
#endif`,R_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,C_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,P_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,I_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,L_=`PhysicalMaterial material;
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
#endif`,N_=`uniform sampler2D dfgLUT;
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
}`,D_=`
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
#endif`,U_=`#if defined( RE_IndirectDiffuse )
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
#endif`,F_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,O_=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,B_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,k_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,z_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,H_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,G_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,V_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,W_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,X_=`#if defined( USE_POINTS_UV )
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
#endif`,q_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Y_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Z_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,$_=`#if defined( USE_MORPHCOLORS )
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
#endif`,J_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,K_=`#ifdef USE_MORPHTARGETS
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
#endif`,j_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Q_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,t0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,e0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,i0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,s0=`#ifdef USE_NORMALMAP
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
#endif`,r0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,o0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,a0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,l0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,c0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,h0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,u0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,d0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,f0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,p0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,m0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,g0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,_0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,x0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,v0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,y0=`float getShadowMask() {
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
}`,S0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,b0=`#ifdef USE_SKINNING
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
#endif`,M0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,E0=`#ifdef USE_SKINNING
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
#endif`,T0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,w0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,R0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,C0=`#ifdef USE_TRANSMISSION
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
#endif`,P0=`#ifdef USE_TRANSMISSION
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
#endif`,I0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,L0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,N0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var D0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,U0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,F0=`uniform sampler2D t2D;
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
}`,O0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,B0=`uniform float backgroundBlurriness;
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
}`,k0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H0=`#include <common>
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
}`,G0=`#if DEPTH_PACKING == 3200
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
}`,V0=`#define DISTANCE
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
}`,W0=`#define DISTANCE
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
}`,X0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,q0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Y0=`uniform float scale;
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
}`,Z0=`uniform vec3 diffuse;
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
}`,$0=`#include <common>
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
}`,J0=`uniform vec3 diffuse;
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
}`,K0=`#define LAMBERT
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
}`,j0=`#define LAMBERT
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
}`,Q0=`#define MATCAP
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
}`,tx=`#define MATCAP
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
}`,ex=`#define NORMAL
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
}`,nx=`#define NORMAL
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
}`,ix=`#define PHONG
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
}`,sx=`#define PHONG
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
}`,rx=`#define STANDARD
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
}`,ox=`#define STANDARD
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
}`,ax=`#define TOON
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
}`,lx=`#define TOON
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
}`,cx=`uniform float size;
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
}`,hx=`uniform vec3 diffuse;
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
}`,ux=`#include <common>
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
}`,dx=`uniform vec3 color;
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
}`,fx=`uniform float rotation;
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
}`,px=`uniform vec3 diffuse;
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
}`,ce={alphahash_fragment:Fg,alphahash_pars_fragment:Og,alphamap_fragment:Bg,alphamap_pars_fragment:kg,alphatest_fragment:zg,alphatest_pars_fragment:Hg,aomap_fragment:Gg,aomap_pars_fragment:Vg,batching_pars_vertex:Wg,batching_vertex:Xg,begin_vertex:qg,beginnormal_vertex:Yg,bsdfs:Zg,iridescence_fragment:$g,bumpmap_pars_fragment:Jg,clipping_planes_fragment:Kg,clipping_planes_pars_fragment:jg,clipping_planes_pars_vertex:Qg,clipping_planes_vertex:t_,color_fragment:e_,color_pars_fragment:n_,color_pars_vertex:i_,color_vertex:s_,common:r_,defaultnormal_vertex:o_,displacementmap_pars_vertex:a_,displacementmap_vertex:l_,emissivemap_fragment:c_,emissivemap_pars_fragment:h_,colorspace_fragment:u_,colorspace_pars_fragment:d_,envmap_fragment:f_,envmap_common_pars_fragment:p_,envmap_pars_fragment:m_,envmap_pars_vertex:g_,envmap_physical_pars_fragment:A_,envmap_vertex:__,fog_vertex:x_,fog_pars_vertex:v_,fog_fragment:y_,fog_pars_fragment:S_,gradientmap_pars_fragment:b_,lightmap_pars_fragment:M_,lights_lambert_fragment:E_,lights_lambert_pars_fragment:T_,lights_pars_begin:w_,lights_toon_fragment:R_,lights_toon_pars_fragment:C_,lights_phong_fragment:P_,lights_phong_pars_fragment:I_,lights_physical_fragment:L_,lights_physical_pars_fragment:N_,lights_fragment_begin:D_,lights_fragment_maps:U_,lights_fragment_end:F_,lightprobes_pars_fragment:O_,logdepthbuf_fragment:B_,logdepthbuf_pars_fragment:k_,logdepthbuf_pars_vertex:z_,logdepthbuf_vertex:H_,map_fragment:G_,map_pars_fragment:V_,map_particle_fragment:W_,map_particle_pars_fragment:X_,metalnessmap_fragment:q_,metalnessmap_pars_fragment:Y_,morphinstance_vertex:Z_,morphcolor_vertex:$_,morphnormal_vertex:J_,morphtarget_pars_vertex:K_,morphtarget_vertex:j_,normal_fragment_begin:Q_,normal_fragment_maps:t0,normal_pars_fragment:e0,normal_pars_vertex:n0,normal_vertex:i0,normalmap_pars_fragment:s0,clearcoat_normal_fragment_begin:r0,clearcoat_normal_fragment_maps:o0,clearcoat_pars_fragment:a0,iridescence_pars_fragment:l0,opaque_fragment:c0,packing:h0,premultiplied_alpha_fragment:u0,project_vertex:d0,dithering_fragment:f0,dithering_pars_fragment:p0,roughnessmap_fragment:m0,roughnessmap_pars_fragment:g0,shadowmap_pars_fragment:_0,shadowmap_pars_vertex:x0,shadowmap_vertex:v0,shadowmask_pars_fragment:y0,skinbase_vertex:S0,skinning_pars_vertex:b0,skinning_vertex:M0,skinnormal_vertex:E0,specularmap_fragment:T0,specularmap_pars_fragment:w0,tonemapping_fragment:A0,tonemapping_pars_fragment:R0,transmission_fragment:C0,transmission_pars_fragment:P0,uv_pars_fragment:I0,uv_pars_vertex:L0,uv_vertex:N0,worldpos_vertex:D0,background_vert:U0,background_frag:F0,backgroundCube_vert:O0,backgroundCube_frag:B0,cube_vert:k0,cube_frag:z0,depth_vert:H0,depth_frag:G0,distance_vert:V0,distance_frag:W0,equirect_vert:X0,equirect_frag:q0,linedashed_vert:Y0,linedashed_frag:Z0,meshbasic_vert:$0,meshbasic_frag:J0,meshlambert_vert:K0,meshlambert_frag:j0,meshmatcap_vert:Q0,meshmatcap_frag:tx,meshnormal_vert:ex,meshnormal_frag:nx,meshphong_vert:ix,meshphong_frag:sx,meshphysical_vert:rx,meshphysical_frag:ox,meshtoon_vert:ax,meshtoon_frag:lx,points_vert:cx,points_frag:hx,shadow_vert:ux,shadow_frag:dx,sprite_vert:fx,sprite_frag:px},At={common:{diffuse:{value:new re(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qt}},envmap:{envMap:{value:null},envMapRotation:{value:new Qt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qt},normalScale:{value:new $t(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new re(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new re(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0},uvTransform:{value:new Qt}},sprite:{diffuse:{value:new re(16777215)},opacity:{value:1},center:{value:new $t(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qt},alphaMap:{value:null},alphaMapTransform:{value:new Qt},alphaTest:{value:0}}},Jn={basic:{uniforms:gn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.fog]),vertexShader:ce.meshbasic_vert,fragmentShader:ce.meshbasic_frag},lambert:{uniforms:gn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new re(0)},envMapIntensity:{value:1}}]),vertexShader:ce.meshlambert_vert,fragmentShader:ce.meshlambert_frag},phong:{uniforms:gn([At.common,At.specularmap,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.fog,At.lights,{emissive:{value:new re(0)},specular:{value:new re(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ce.meshphong_vert,fragmentShader:ce.meshphong_frag},standard:{uniforms:gn([At.common,At.envmap,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.roughnessmap,At.metalnessmap,At.fog,At.lights,{emissive:{value:new re(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ce.meshphysical_vert,fragmentShader:ce.meshphysical_frag},toon:{uniforms:gn([At.common,At.aomap,At.lightmap,At.emissivemap,At.bumpmap,At.normalmap,At.displacementmap,At.gradientmap,At.fog,At.lights,{emissive:{value:new re(0)}}]),vertexShader:ce.meshtoon_vert,fragmentShader:ce.meshtoon_frag},matcap:{uniforms:gn([At.common,At.bumpmap,At.normalmap,At.displacementmap,At.fog,{matcap:{value:null}}]),vertexShader:ce.meshmatcap_vert,fragmentShader:ce.meshmatcap_frag},points:{uniforms:gn([At.points,At.fog]),vertexShader:ce.points_vert,fragmentShader:ce.points_frag},dashed:{uniforms:gn([At.common,At.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ce.linedashed_vert,fragmentShader:ce.linedashed_frag},depth:{uniforms:gn([At.common,At.displacementmap]),vertexShader:ce.depth_vert,fragmentShader:ce.depth_frag},normal:{uniforms:gn([At.common,At.bumpmap,At.normalmap,At.displacementmap,{opacity:{value:1}}]),vertexShader:ce.meshnormal_vert,fragmentShader:ce.meshnormal_frag},sprite:{uniforms:gn([At.sprite,At.fog]),vertexShader:ce.sprite_vert,fragmentShader:ce.sprite_frag},background:{uniforms:{uvTransform:{value:new Qt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ce.background_vert,fragmentShader:ce.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qt}},vertexShader:ce.backgroundCube_vert,fragmentShader:ce.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ce.cube_vert,fragmentShader:ce.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ce.equirect_vert,fragmentShader:ce.equirect_frag},distance:{uniforms:gn([At.common,At.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:ce.distance_vert,fragmentShader:ce.distance_frag},shadow:{uniforms:gn([At.lights,At.fog,{color:{value:new re(0)},opacity:{value:1}}]),vertexShader:ce.shadow_vert,fragmentShader:ce.shadow_frag}};Jn.physical={uniforms:gn([Jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qt},clearcoatNormalScale:{value:new $t(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Qt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qt},sheen:{value:0},sheenColor:{value:new re(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qt},transmissionSamplerSize:{value:new $t},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qt},attenuationDistance:{value:0},attenuationColor:{value:new re(0)},specularColor:{value:new re(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qt},anisotropyVector:{value:new $t},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qt}}]),vertexShader:ce.meshphysical_vert,fragmentShader:ce.meshphysical_frag};var la={r:0,b:0,g:0},mx=new se,Uf=new Qt;Uf.set(-1,0,0,0,1,0,0,0,1);function gx(d,p,m,g,_,x){let v=new re(0),y=_===!0?0:1,S,b,M=null,T=0,E=null;function w(I){let U=I.isScene===!0?I.background:null;if(U&&U.isTexture){let L=I.backgroundBlurriness>0;U=p.get(U,L)}return U}function C(I){let U=!1,L=w(I);if(L===null)A(v,y);else if(L&&L.isColor)A(L,1),U=!0;let D=d.xr.getEnvironmentBlendMode();if(D==="additive")m.buffers.color.setClear(0,0,0,1,x);else if(D==="alpha-blend")m.buffers.color.setClear(0,0,0,0,x);if(d.autoClear||U)m.buffers.depth.setTest(!0),m.buffers.depth.setMask(!0),m.buffers.color.setMask(!0),d.clear(d.autoClearColor,d.autoClearDepth,d.autoClearStencil)}function N(I,U){let L=w(U);if(L&&L.isCubeTexture){if(b===void 0)b=new on(new zs(1,1,1),new mi({name:"BackgroundCubeMaterial",uniforms:ns(Jn.backgroundCube.uniforms),vertexShader:Jn.backgroundCube.vertexShader,fragmentShader:Jn.backgroundCube.fragmentShader,side:mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),b.geometry.deleteAttribute("normal"),b.geometry.deleteAttribute("uv"),b.onBeforeRender=function(D,k,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(b.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),g.update(b);if(b.material.uniforms.envMap.value=L,b.material.uniforms.backgroundBlurriness.value=U.backgroundBlurriness,b.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,b.material.uniforms.backgroundRotation.value.setFromMatrix4(mx.makeRotationFromEuler(U.backgroundRotation)).transpose(),L.isRenderTargetTexture===!1)b.material.uniforms.backgroundRotation.value.premultiply(Uf);if(b.material.toneMapped=he.getTransfer(L.colorSpace)!==Ie,M!==L||T!==L.version||E!==d.toneMapping)b.material.needsUpdate=!0,M=L,T=L.version,E=d.toneMapping;b.layers.enableAll(),I.unshift(b,b.geometry,b.material,0,0,null)}else if(L&&L.isTexture){if(S===void 0)S=new on(new Lr(2,2),new mi({name:"BackgroundMaterial",uniforms:ns(Jn.background.uniforms),vertexShader:Jn.background.vertexShader,fragmentShader:Jn.background.fragmentShader,side:ci,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),Object.defineProperty(S.material,"map",{get:function(){return this.uniforms.t2D.value}}),g.update(S);if(S.material.uniforms.t2D.value=L,S.material.uniforms.backgroundIntensity.value=U.backgroundIntensity,S.material.toneMapped=he.getTransfer(L.colorSpace)!==Ie,L.matrixAutoUpdate===!0)L.updateMatrix();if(S.material.uniforms.uvTransform.value.copy(L.matrix),M!==L||T!==L.version||E!==d.toneMapping)S.material.needsUpdate=!0,M=L,T=L.version,E=d.toneMapping;S.layers.enableAll(),I.unshift(S,S.geometry,S.material,0,0,null)}}function A(I,U){I.getRGB(la,Oc(d)),m.buffers.color.setClear(la.r,la.g,la.b,U,x)}function R(){if(b!==void 0)b.geometry.dispose(),b.material.dispose(),b=void 0;if(S!==void 0)S.geometry.dispose(),S.material.dispose(),S=void 0}return{getClearColor:function(){return v},setClearColor:function(I,U=1){v.set(I),y=U,A(v,y)},getClearAlpha:function(){return y},setClearAlpha:function(I){y=I,A(v,y)},render:C,addToRenderList:N,dispose:R}}function _x(d,p){let m=d.getParameter(d.MAX_VERTEX_ATTRIBS),g={},_=E(null),x=_,v=!1;function y(z,W,Z,V,Q){let it=!1,j=T(z,V,Z,W);if(x!==j)x=j,b(x.object);if(it=w(z,V,Z,Q),it)C(z,V,Z,Q);if(Q!==null)p.update(Q,d.ELEMENT_ARRAY_BUFFER);if(it||v){if(v=!1,L(z,W,Z,V),Q!==null)d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,p.get(Q).buffer)}}function S(){return d.createVertexArray()}function b(z){return d.bindVertexArray(z)}function M(z){return d.deleteVertexArray(z)}function T(z,W,Z,V){let Q=V.wireframe===!0,it=g[W.id];if(it===void 0)it={},g[W.id]=it;let j=z.isInstancedMesh===!0?z.id:0,xt=it[j];if(xt===void 0)xt={},it[j]=xt;let rt=xt[Z.id];if(rt===void 0)rt={},xt[Z.id]=rt;let dt=rt[Q];if(dt===void 0)dt=E(S()),rt[Q]=dt;return dt}function E(z){let W=[],Z=[],V=[];for(let Q=0;Q<m;Q++)W[Q]=0,Z[Q]=0,V[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:W,enabledAttributes:Z,attributeDivisors:V,object:z,attributes:{},index:null}}function w(z,W,Z,V){let Q=x.attributes,it=W.attributes,j=0,xt=Z.getAttributes();for(let rt in xt)if(xt[rt].location>=0){let _t=Q[rt],Nt=it[rt];if(Nt===void 0){if(rt==="instanceMatrix"&&z.instanceMatrix)Nt=z.instanceMatrix;if(rt==="instanceColor"&&z.instanceColor)Nt=z.instanceColor}if(_t===void 0)return!0;if(_t.attribute!==Nt)return!0;if(Nt&&_t.data!==Nt.data)return!0;j++}if(x.attributesNum!==j)return!0;if(x.index!==V)return!0;return!1}function C(z,W,Z,V){let Q={},it=W.attributes,j=0,xt=Z.getAttributes();for(let rt in xt)if(xt[rt].location>=0){let _t=it[rt];if(_t===void 0){if(rt==="instanceMatrix"&&z.instanceMatrix)_t=z.instanceMatrix;if(rt==="instanceColor"&&z.instanceColor)_t=z.instanceColor}let Nt={};if(Nt.attribute=_t,_t&&_t.data)Nt.data=_t.data;Q[rt]=Nt,j++}x.attributes=Q,x.attributesNum=j,x.index=V}function N(){let z=x.newAttributes;for(let W=0,Z=z.length;W<Z;W++)z[W]=0}function A(z){R(z,0)}function R(z,W){let Z=x.newAttributes,V=x.enabledAttributes,Q=x.attributeDivisors;if(Z[z]=1,V[z]===0)d.enableVertexAttribArray(z),V[z]=1;if(Q[z]!==W)d.vertexAttribDivisor(z,W),Q[z]=W}function I(){let z=x.newAttributes,W=x.enabledAttributes;for(let Z=0,V=W.length;Z<V;Z++)if(W[Z]!==z[Z])d.disableVertexAttribArray(Z),W[Z]=0}function U(z,W,Z,V,Q,it,j){if(j===!0)d.vertexAttribIPointer(z,W,Z,Q,it);else d.vertexAttribPointer(z,W,Z,V,Q,it)}function L(z,W,Z,V){N();let Q=V.attributes,it=Z.getAttributes(),j=W.defaultAttributeValues;for(let xt in it){let rt=it[xt];if(rt.location>=0){let dt=Q[xt];if(dt===void 0){if(xt==="instanceMatrix"&&z.instanceMatrix)dt=z.instanceMatrix;if(xt==="instanceColor"&&z.instanceColor)dt=z.instanceColor}if(dt!==void 0){let _t=dt.normalized,Nt=dt.itemSize,ot=p.get(dt);if(ot===void 0)continue;let{buffer:mt,type:Rt,bytesPerElement:Bt}=ot,kt=Rt===d.INT||Rt===d.UNSIGNED_INT||dt.gpuType===Gl;if(dt.isInterleavedBufferAttribute){let Lt=dt.data,ie=Lt.isInterleavedBuffer===!0?Lt.stride:Lt.itemSize,jt=dt.offset;if(Lt.isInstancedInterleavedBuffer||Lt.isInstancedBufferAttribute){for(let Dt=0;Dt<rt.locationSize;Dt++)R(rt.location+Dt,Lt.meshPerAttribute);if(z.isInstancedMesh!==!0&&V._maxInstanceCount===void 0)V._maxInstanceCount=Lt.meshPerAttribute*Lt.count}else for(let Dt=0;Dt<rt.locationSize;Dt++)A(rt.location+Dt);d.bindBuffer(d.ARRAY_BUFFER,mt);for(let Dt=0;Dt<rt.locationSize;Dt++)U(rt.location+Dt,Nt/rt.locationSize,Rt,_t,ie*Bt,(jt+Nt/rt.locationSize*Dt)*Bt,kt)}else{if(dt.isInstancedBufferAttribute){for(let Lt=0;Lt<rt.locationSize;Lt++)R(rt.location+Lt,dt.meshPerAttribute);if(z.isInstancedMesh!==!0&&V._maxInstanceCount===void 0)V._maxInstanceCount=dt.meshPerAttribute*dt.count}else for(let Lt=0;Lt<rt.locationSize;Lt++)A(rt.location+Lt);d.bindBuffer(d.ARRAY_BUFFER,mt);for(let Lt=0;Lt<rt.locationSize;Lt++)U(rt.location+Lt,Nt/rt.locationSize,Rt,_t,Nt*Bt,Nt/rt.locationSize*Lt*Bt,kt)}}else if(j!==void 0){let _t=j[xt];if(_t!==void 0)switch(_t.length){case 2:d.vertexAttrib2fv(rt.location,_t);break;case 3:d.vertexAttrib3fv(rt.location,_t);break;case 4:d.vertexAttrib4fv(rt.location,_t);break;default:d.vertexAttrib1fv(rt.location,_t)}}}}I()}function D(){G();for(let z in g){let W=g[z];for(let Z in W){let V=W[Z];for(let Q in V){let it=V[Q];for(let j in it)M(it[j].object),delete it[j];delete V[Q]}}delete g[z]}}function k(z){if(g[z.id]===void 0)return;let W=g[z.id];for(let Z in W){let V=W[Z];for(let Q in V){let it=V[Q];for(let j in it)M(it[j].object),delete it[j];delete V[Q]}}delete g[z.id]}function P(z){for(let W in g){let Z=g[W];for(let V in Z){let Q=Z[V];if(Q[z.id]===void 0)continue;let it=Q[z.id];for(let j in it)M(it[j].object),delete it[j];delete Q[z.id]}}}function F(z){for(let W in g){let Z=g[W],V=z.isInstancedMesh===!0?z.id:0,Q=Z[V];if(Q===void 0)continue;for(let it in Q){let j=Q[it];for(let xt in j)M(j[xt].object),delete j[xt];delete Q[it]}if(delete Z[V],Object.keys(Z).length===0)delete g[W]}}function G(){if(H(),v=!0,x===_)return;x=_,b(x.object)}function H(){_.geometry=null,_.program=null,_.wireframe=!1}return{setup:y,reset:G,resetDefaultState:H,dispose:D,releaseStatesOfGeometry:k,releaseStatesOfObject:F,releaseStatesOfProgram:P,initAttributes:N,enableAttribute:A,disableUnusedAttributes:I}}function xx(d,p,m){let g;function _(S){g=S}function x(S,b){d.drawArrays(g,S,b),m.update(b,g,1)}function v(S,b,M){if(M===0)return;d.drawArraysInstanced(g,S,b,M),m.update(b,g,M)}function y(S,b,M){if(M===0)return;p.get("WEBGL_multi_draw").multiDrawArraysWEBGL(g,S,0,b,0,M);let E=0;for(let w=0;w<M;w++)E+=b[w];m.update(E,g,1)}this.setMode=_,this.render=x,this.renderInstances=v,this.renderMultiDraw=y}function vx(d,p,m,g){let _;function x(){if(_!==void 0)return _;if(p.has("EXT_texture_filter_anisotropic")===!0){let P=p.get("EXT_texture_filter_anisotropic");_=d.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else _=0;return _}function v(P){if(P!==Nn&&g.convert(P)!==d.getParameter(d.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function y(P){let F=P===Zn&&(p.has("EXT_color_buffer_half_float")||p.has("EXT_color_buffer_float"));if(P!==Gn&&P!==hi&&!F&&g.convert(P)!==d.getParameter(d.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function S(P){if(P==="highp"){if(d.getShaderPrecisionFormat(d.VERTEX_SHADER,d.HIGH_FLOAT).precision>0&&d.getShaderPrecisionFormat(d.FRAGMENT_SHADER,d.HIGH_FLOAT).precision>0)return"highp";P="mediump"}if(P==="mediump"){if(d.getShaderPrecisionFormat(d.VERTEX_SHADER,d.MEDIUM_FLOAT).precision>0&&d.getShaderPrecisionFormat(d.FRAGMENT_SHADER,d.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let b=m.precision!==void 0?m.precision:"highp",M=S(b);if(M!==b)qt("WebGLRenderer:",b,"not supported, using",M,"instead."),b=M;let T=m.reversedDepthBuffer===!0&&p.has("EXT_clip_control"),E=m.logarithmicDepthBuffer===!0&&T===!1;if(m.reversedDepthBuffer===!0&&T===!1)qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(m.logarithmicDepthBuffer===!0&&T===!0)qt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let w=d.getParameter(d.MAX_TEXTURE_IMAGE_UNITS),C=d.getParameter(d.MAX_VERTEX_TEXTURE_IMAGE_UNITS),N=d.getParameter(d.MAX_TEXTURE_SIZE),A=d.getParameter(d.MAX_CUBE_MAP_TEXTURE_SIZE),R=d.getParameter(d.MAX_VERTEX_ATTRIBS),I=d.getParameter(d.MAX_VERTEX_UNIFORM_VECTORS),U=d.getParameter(d.MAX_VARYING_VECTORS),L=d.getParameter(d.MAX_FRAGMENT_UNIFORM_VECTORS),D=d.getParameter(d.MAX_SAMPLES),k=d.getParameter(d.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:x,getMaxPrecision:S,textureFormatReadable:v,textureTypeReadable:y,precision:b,logarithmicDepthBuffer:E,reversedDepthBuffer:T,maxTextures:w,maxVertexTextures:C,maxTextureSize:N,maxCubemapSize:A,maxAttributes:R,maxVertexUniforms:I,maxVaryings:U,maxFragmentUniforms:L,maxSamples:D,samples:k}}function yx(d){let p=this,m=null,g=0,_=!1,x=!1,v=new pn,y=new Qt,S={value:null,needsUpdate:!1};this.uniform=S,this.numPlanes=0,this.numIntersection=0,this.init=function(T,E){let w=T.length!==0||E||g!==0||_;return _=E,g=T.length,w},this.beginShadows=function(){x=!0,M(null)},this.endShadows=function(){x=!1},this.setGlobalState=function(T,E){m=M(T,E,0)},this.setState=function(T,E,w){let{clippingPlanes:C,clipIntersection:N,clipShadows:A}=T,R=d.get(T);if(!_||C===null||C.length===0||x&&!A)if(x)M(null);else b();else{let I=x?0:g,U=I*4,L=R.clippingState||null;S.value=L,L=M(C,E,U,w);for(let D=0;D!==U;++D)L[D]=m[D];R.clippingState=L,this.numIntersection=N?this.numPlanes:0,this.numPlanes+=I}};function b(){if(S.value!==m)S.value=m,S.needsUpdate=g>0;p.numPlanes=g,p.numIntersection=0}function M(T,E,w,C){let N=T!==null?T.length:0,A=null;if(N!==0){if(A=S.value,C!==!0||A===null){let R=w+N*4,I=E.matrixWorldInverse;if(y.getNormalMatrix(I),A===null||A.length<R)A=new Float32Array(R);for(let U=0,L=w;U!==N;++U,L+=4)v.copy(T[U]).applyMatrix4(I,y),v.normal.toArray(A,L),A[L+3]=v.constant}S.value=A,S.needsUpdate=!0}return p.numPlanes=N,p.numIntersection=0,A}}class ua extends Dn{constructor(d=1,p={}){super(d,d,p);this.isWebGLCubeRenderTarget=!0;let m={width:d,height:d,depth:1},g=[m,m,m,m,m,m];this.texture=new Zo(g),this._setTextureOptions(p),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(d,p){this.texture.type=p.type,this.texture.colorSpace=p.colorSpace,this.texture.generateMipmaps=p.generateMipmaps,this.texture.minFilter=p.minFilter,this.texture.magFilter=p.magFilter;let m={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},g=new zs(5,5,5),_=new mi({name:"CubemapFromEquirect",uniforms:ns(m.uniforms),vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,side:mn,blending:Zi});_.uniforms.tEquirect.value=p;let x=new on(g,_),v=p.minFilter;if(p.minFilter===Hn)p.minFilter=Tn;return new Dr(1,10,this).update(d,x),p.minFilter=v,x.geometry.dispose(),x.material.dispose(),this}clear(d,p=!0,m=!0,g=!0){let _=d.getRenderTarget();for(let x=0;x<6;x++)d.setRenderTarget(this,x),d.clear(p,m,g);d.setRenderTarget(_)}}var ff=256,Sx=3,bx=20,Ff=256,Of=16,Mx=3,Ex=new q,Tx=new re;class ha{constructor(d){this._renderer=d,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Dr(1,10,null),this._boxMesh=new on(new zs(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(d,p=0,m=0.1,g=100,_={}){let{size:x=256,position:v=Ex}=_,y=this._renderer;this._setSize(x);let S=this._allocateTarget(),b=this._getSourceTarget(!0);if(p>0)b.texture.mipmapsAutoUpdate=!1;let{autoClear:M,autoClearColor:T,autoClearDepth:E,autoClearStencil:w}=y,C=d.background;if(y.autoClear=!0,y.autoClearColor=!0,y.autoClearDepth=!0,y.autoClearStencil=!0,C===null)d.background=y.getClearColor(Tx);let N=new Dr(m,g,b);if(N.position.copy(v),N.update(y,d),y.autoClear=M,y.autoClearColor=T,y.autoClearDepth=E,y.autoClearStencil=w,d.background=C,p>0)b.texture.mipmapsAutoUpdate=!0,this._blur(S,p);return this._applyPMREM(S),S}fromEquirectangular(d,p=null){return this._fromTexture(d,p)}fromCubemap(d,p=null){return this._fromTexture(d,p)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=gf(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=mf(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(d,p){return p>0?1-Math.sqrt(1-d/p):0}_setSize(d){this._cubeSize=Math.max(ff,Pc(d))}_fromTexture(d,p){if(d.mapping===yr||d.mapping===Us)this._setSize(d.image.length===0?ff:d.image[0].width||d.image[0].image.width);else this._setSize(d.image.width/4);let m=p||this._allocateTarget();return this._textureToCubemap(d),this._applyPMREM(m),m}_allocateTarget(){let d=this._cubeSize,p=pf(d,!1,!1),m=Math.log2(d)-Sx;for(let g=0;g<=m;g++)p.texture.mipmaps.push({width:d>>g,height:d>>g});return p.texture.name="PMREM",p.texture.isPMREMTexture=!0,p}_getSourceTarget(d=!1){let p=this._cubeSize,m=this._sourceTarget;if(m===null||m.width!==p||d&&m.depthBuffer===!1){if(m!==null)m.dispose();this._sourceTarget=pf(p,!0,d)}return this._sourceTarget}_compileMaterial(d){this._boxMesh.material=d,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(d,p,m){let g=this._boxMesh,_=this._cubeCamera;g.material=m,_.renderTarget=d,_.activeMipmapLevel=p;let x=d.width>>p;d.viewport.set(0,0,x,x),_.update(this._renderer,g),d.viewport.set(0,0,d.width,d.height)}_textureToCubemap(d){let p;if(d.mapping===yr||d.mapping===Us){if(this._cubemapMaterial===null)this._cubemapMaterial=gf();p=this._cubemapMaterial,p.uniforms.flipEnvMap.value=d.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=mf();p=this._equirectMaterial}p.uniforms.envMap.value=d,this._renderCube(this._getSourceTarget(),0,p)}_applyPMREM(d){if(this._ggxMaterial===null)this._ggxMaterial=wx(),this._integrationMaterial=Ax();let p=this._cubeSize,m=d.texture.mipmaps.length-1,g=this._ggxMaterial.uniforms;g.envMap.value=this._sourceTarget.texture;let _=this._integrationMaterial.uniforms;_.envMap.value=this._sourceTarget.texture,_.sourceLod.value=Math.log2(p/Of);for(let x=0;x<=m;x++){let v=ha.lodToRoughness(x,m);if(x>m-Mx)_.roughness.value=v,this._renderCube(d,x,this._integrationMaterial);else{let y=v>0?Math.log2(p)+0.5*Math.log2(6/(Ff*Math.pow(v,4)))+0.5:0;g.roughness.value=v,g.lodBias.value=y,this._renderCube(d,x,this._ggxMaterial)}}}_blur(d,p){if(this._blurMaterial===null)this._blurMaterial=Rx();let m=this._blurMaterial,g=m.uniforms,_=this._sourceTarget;g.sigma.value=Math.min(p,Math.PI)/Math.SQRT2,g.envMap.value=_.texture,this._renderCube(d,0,m),g.envMap.value=d.texture,this._renderCube(_,0,m)}}function pf(d,p,m){return new ua(d,{minFilter:Hn,generateMipmaps:p,type:Zn,colorSpace:bc,depthBuffer:m})}function kr(d,p,m){return new mi({name:d,uniforms:p,vertexShader:ce.cube_vert,fragmentShader:m,side:mn,blending:Zi,depthTest:!1,depthWrite:!1})}function wx(){return kr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Ff}u

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
	`)}function Ax(){return kr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Of}},`

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
	`)}function Rx(){return kr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${bx}
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
	`)}function mf(){return kr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function gf(){return kr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Cx(d){let p=new WeakMap,m=new WeakMap,g=null;function _(E,w=!1){if(E===null||E===void 0)return null;if(w)return v(E);return x(E)}function x(E){if(E&&E.isTexture){let w=E.mapping;if(w===Lo||w===No)if(p.has(E)){let C=p.get(E).texture;return y(C,E.mapping)}else{let C=E.image;if(C&&C.height>0){let N=new ua(C.height);return N.fromEquirectangularTexture(d,E),p.set(E,N),E.addEventListener("dispose",b),y(N.texture,E.mapping)}else return null}}return E}function v(E){if(E&&E.isTexture&&E.isPMREMTexture!==!0){let w=E.mapping,C=w===Lo||w===No,N=w===yr||w===Us;if(C||N){let A=m.get(E),R=A!==void 0?A.texture.pmremVersion:0;if(E.isRenderTargetTexture&&E.pmremVersion!==R){if(g===null)g=new ha(d);return A=C?g.fromEquirectangular(E,A):g.fromCubemap(E,A),A.texture.pmremVersion=E.pmremVersion,m.set(E,A),A.texture}else if(A!==void 0)return A.texture;else{let I=E.image;if(C&&I&&I.height>0||N&&I&&S(I)){if(g===null)g=new ha(d);return A=C?g.fromEquirectangular(E):g.fromCubemap(E),A.texture.pmremVersion=E.pmremVersion,m.set(E,A),E.addEventListener("dispose",M),A.texture}else return null}}}return E}function y(E,w){if(w===Lo)E.mapping=yr;else if(w===No)E.mapping=Us;return E}function S(E){let w=0,C=6;for(let N=0;N<C;N++)if(E[N]!==void 0)w++;return w===C}function b(E){let w=E.target;w.removeEventListener("dispose",b);let C=p.get(w);if(C!==void 0)p.delete(w),C.dispose()}function M(E){let w=E.target;w.removeEventListener("dispose",M);let C=m.get(w);if(C!==void 0)m.delete(w),C.dispose()}function T(){if(p=new WeakMap,m=new WeakMap,g!==null)g.dispose(),g=null}return{get:_,dispose:T}}function Px(d){let p={};function m(g){if(p[g]!==void 0)return p[g];let _=d.getExtension(g);return p[g]=_,_}return{has:function(g){return m(g)!==null},init:function(){m("EXT_color_buffer_float"),m("WEBGL_clip_cull_distance"),m("OES_texture_float_linear"),m("EXT_color_buffer_half_float"),m("WEBGL_multisampled_render_to_texture"),m("WEBGL_render_shared_exponent")},get:function(g){let _=m(g);if(_===null)fr("WebGLRenderer: "+g+" extension not supported.");return _}}}function Ix(d,p,m,g){let _={},x=new WeakMap,v=new FinalizationRegistry((C)=>delete _[C]);function y(C){S(C.target)}function S(C){if(C.index!==null)p.remove(C.index);for(let A in C.attributes)p.remove(C.attributes[A]);C.removeEventListener("dispose",y),delete _[C.id],v.unregister(C);let N=x.get(C);if(N)p.remove(N),x.delete(C);if(g.releaseStatesOfGeometry(C),C.isInstancedBufferGeometry===!0)delete C._maxInstanceCount;m.memory.geometries--}function b(C,N){if(_[N.id]!==void 0)return N;return N.addEventListener("dispose",y),_[N.id]=new WeakRef(N),v.register(N,N.id,N),m.memory.geometries++,N}function M(C){let N=C.attributes;for(let A in N)p.update(N[A],d.ARRAY_BUFFER)}function T(C){let N=C.index,A=C.attributes.position,R=0;if(A===void 0)return;let I=N!==null?N.array.length:A.array.length/3-1,L=new(A.count>=65535?Xo:Wo)(Math.ceil(I/3)*6,1),D=L.array;if(N!==null){let P=N.array;R=N.version;for(let F=0,G=0;F<I;F+=3){let H=P[F+0],z=P[F+1],W=P[F+2];D[G++]=H,D[G++]=z,D[G++]=z,D[G++]=W,D[G++]=W,D[G++]=H}}else{R=A.version;for(let P=0,F=0;P<I;P+=3){let G=P+0,H=P+1,z=P+2;D[F++]=G,D[F++]=H,D[F++]=H,D[F++]=z,D[F++]=z,D[F++]=G}}L.version=R;let k=x.get(C);if(k)p.remove(k);x.set(C,L)}function E(C){let N=x.get(C);if(N){let A=C.index;if(A!==null){if(N.version<A.version)T(C)}}else T(C);return x.get(C)}function w(){for(let C in _){let N=_[C].deref();if(N!==void 0)S(N)}}return{get:b,update:M,getWireframeAttribute:E,dispose:w}}function Lx(d,p,m){let g;function _(T){g=T}let x,v;function y(T){x=T.type,v=T.bytesPerElement}function S(T,E){d.drawElements(g,E,x,T*v),m.update(E,g,1)}function b(T,E,w){if(w===0)return;d.drawElementsInstanced(g,E,x,T*v,w),m.update(E,g,w)}function M(T,E,w){if(w===0)return;p.get("WEBGL_multi_draw").multiDrawElementsWEBGL(g,E,0,x,T,0,w);let N=0;for(let A=0;A<w;A++)N+=E[A];m.update(N,g,1)}this.setMode=_,this.setIndex=y,this.render=S,this.renderInstances=b,this.renderMultiDraw=M}function Nx(d){let p={geometries:0,textures:0},m={frame:0,calls:0,triangles:0,points:0,lines:0};function g(x,v,y){switch(m.calls++,v){case d.TRIANGLES:m.triangles+=y*(x/3);break;case d.LINES:m.lines+=y*(x/2);break;case d.LINE_STRIP:m.lines+=y*(x-1);break;case d.LINE_LOOP:m.lines+=y*x;break;case d.POINTS:m.points+=y*x;break;default:Zt("WebGLInfo: Unknown draw mode:",v);break}}function _(){m.calls=0,m.triangles=0,m.points=0,m.lines=0}return{memory:p,render:m,programs:null,autoReset:!0,reset:_,update:g}}function Dx(d,p,m){let g=new WeakMap,_=new Oe;function x(v,y,S){let b=v.morphTargetInfluences,M=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=M!==void 0?M.length:0,E=g.get(y);if(E===void 0||E.count!==T){let G=function(){P.dispose(),g.delete(y),y.removeEventListener("dispose",G)};if(E!==void 0)E.texture.dispose();let w=y.morphAttributes.position!==void 0,C=y.morphAttributes.normal!==void 0,N=y.morphAttributes.color!==void 0,A=y.morphAttributes.position||[],R=y.morphAttributes.normal||[],I=y.morphAttributes.color||[],U=0;if(w===!0)U=1;if(C===!0)U=2;if(N===!0)U=3;let L=y.attributes.position.count*U,D=1;if(L>p.maxTextureSize)D=Math.ceil(L/p.maxTextureSize),L=p.maxTextureSize;let k=new Float32Array(L*D*4*T),P=new Go(k,L,D,T);P.type=hi,P.needsUpdate=!0;let F=U*4;for(let H=0;H<T;H++){let z=A[H],W=R[H],Z=I[H],V=L*D*4*H;for(let Q=0;Q<z.count;Q++){let it=Q*F;if(w===!0)_.fromBufferAttribute(z,Q),k[V+it+0]=_.x,k[V+it+1]=_.y,k[V+it+2]=_.z,k[V+it+3]=0;if(C===!0)_.fromBufferAttribute(W,Q),k[V+it+4]=_.x,k[V+it+5]=_.y,k[V+it+6]=_.z,k[V+it+7]=0;if(N===!0)_.fromBufferAttribute(Z,Q),k[V+it+8]=_.x,k[V+it+9]=_.y,k[V+it+10]=_.z,k[V+it+11]=Z.itemSize===4?_.w:1}}E={count:T,texture:P,size:new $t(L,D)},g.set(y,E),y.addEventListener("dispose",G)}if(v.isInstancedMesh===!0&&v.morphTexture!==null)S.getUniforms().setValue(d,"morphTexture",v.morphTexture,m);else{let w=0;for(let N=0;N<b.length;N++)w+=b[N];let C=y.morphTargetsRelative?1:1-w;S.getUniforms().setValue(d,"morphTargetBaseInfluence",C),S.getUniforms().setValue(d,"morphTargetInfluences",b)}S.getUniforms().setValue(d,"morphTargetsTexture",E.texture,m),S.getUniforms().setValue(d,"morphTargetsTextureSize",E.size)}return{update:x}}function Ux(d,p,m,g,_){let x=new WeakMap;function v(b){let M=_.render.frame,T=b.geometry,E=p.get(b,T);if(x.get(E)!==M)p.update(E),x.set(E,M);if(b.isInstancedMesh){if(b.hasEventListener("dispose",S)===!1)b.addEventListener("dispose",S);if(x.get(b)!==M){if(m.update(b.instanceMatrix,d.ARRAY_BUFFER),b.instanceColor!==null)m.update(b.instanceColor,d.ARRAY_BUFFER);x.set(b,M)}}if(b.isSkinnedMesh){let w=b.skeleton;if(x.get(w)!==M)w.update(),x.set(w,M)}return E}function y(){x=new WeakMap}function S(b){let M=b.target;if(M.removeEventListener("dispose",S),g.releaseStatesOfObject(M),m.remove(M.instanceMatrix),M.instanceColor!==null)m.remove(M.instanceColor)}return{update:v,dispose:y}}var Fx={[Ul]:"LINEAR_TONE_MAPPING",[Fl]:"REINHARD_TONE_MAPPING",[Ol]:"CINEON_TONE_MAPPING",[Bl]:"ACES_FILMIC_TONE_MAPPING",[zl]:"AGX_TONE_MAPPING",[Hl]:"NEUTRAL_TONE_MAPPING",[kl]:"CUSTOM_TONE_MAPPING"};function Ox(d,p,m,g,_,x){let v=new Dn(p,m,{type:d,depthBuffer:_,stencilBuffer:x,samples:g?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),y=null,S=null,b=null,M=new Ye;M.setAttribute("position",new rn([-1,3,0,-1,-1,0,3,-1,0],3)),M.setAttribute("uv",new rn([0,2,0,0,2,0],2));let T=new Bc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),E=new on(M,T),w=new ia(-1,1,1,-1,0,1),C=null,N=null,A=!1,R,I=null,U=[],L=!1;this.setSize=function(D,k){if(v.setSize(D,k),y!==null)y.setSize(D,k);if(S!==null)S.setSize(D,k);for(let P=0;P<U.length;P++){let F=U[P];if(F.setSize)F.setSize(D,k)}},this.setEffects=function(D){U=D,L=U.length>0&&U[0].isRenderPass===!0;let{width:k,height:P}=v;if(U.length>0&&y===null)y=new Dn(k,P,{type:Zn,depthBuffer:!1,stencilBuffer:!1}),S=new Dn(k,P,{type:Zn,depthBuffer:!1,stencilBuffer:!1});let F=_===!0&&U.some((G)=>G.needsDepthTexture===!0);if(F!==(v.depthTexture!==null)){if(F===!0&&b===null){if(b=new Ni(k,P),x===!0)b.format=Ri,b.type=$i}v.dispose(),v.depthTexture=F?b:null,v.resolveDepthBuffer=F,v.storeMultisampledDepthBuffer=F}for(let G=0;G<U.length;G++){let H=U[G];if(H.setSize)H.setSize(k,P);if(F&&H.needsDepthTexture===!0&&H.setDepthTexture)H.setDepthTexture(b)}},this.begin=function(D,k){if(A)return!1;if(D.toneMapping===Yn&&U.length===0)return!1;if(I=k,k!==null){let{width:P,height:F}=k;if(v.width!==P||v.height!==F)this.setSize(P,F)}if(L===!1)D.setRenderTarget(v);return R=D.toneMapping,D.toneMapping=Yn,!0},this.hasRenderPass=function(){return L},this.end=function(D,k){D.toneMapping=R,A=!0;let P=v,F=y;for(let G=0;G<U.length;G++){let H=U[G];if(H.enabled===!1)continue;if(H.render(D,F,P,k),H.needsSwap!==!1)P=F,F=F===y?S:y}if(C!==D.outputColorSpace||N!==D.toneMapping){if(C=D.outputColorSpace,N=D.toneMapping,T.defines={},he.getTransfer(C)===Ie)T.defines.SRGB_TRANSFER="";let G=Fx[N];if(G)T.defines[G]="";T.needsUpdate=!0}T.uniforms.tDiffuse.value=P.texture,D.setRenderTarget(I),D.render(E,w),I=null,A=!1},this.isCompositing=function(){return A},this.dispose=function(){if(v.dispose(),y!==null)y.dispose();if(S!==null)S.dispose();M.dispose(),T.dispose()}}var Bf=new We,kf=new Ni(1,1),zf=new Jo(1),Hf=new Go,Gf=new Uc,Vf=new Zo,_f=[],xf=[],vf=new Float32Array(16),yf=new Float32Array(9),Sf=new Float32Array(4);function Hs(d,p,m){let g=d[0];if(g<=0||g>0)return d;let _=p*m,x=_f[_];if(x===void 0)x=new Float32Array(_),_f[_]=x;if(p!==0){g.toArray(x,0);for(let v=1,y=0;v!==p;++v)y+=m,d[v].toArray(x,y)}return x}function Ze(d,p){if(d.length!==p.length)return!1;for(let m=0,g=d.length;m<g;m++)if(d[m]!==p[m])return!1;return!0}function $e(d,p){for(let m=0,g=p.length;m<g;m++)d[m]=p[m]}function da(d,p){let m=xf[p];if(m===void 0)m=new Int32Array(p),xf[p]=m;for(let g=0;g!==p;++g)m[g]=d.allocateTextureUnit();return m}function Bx(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1f(this.addr,p),m[0]=p}function kx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2f(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(Ze(m,p))return;d.uniform2fv(this.addr,p),$e(m,p)}}function zx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3f(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else if(p.r!==void 0){if(m[0]!==p.r||m[1]!==p.g||m[2]!==p.b)d.uniform3f(this.addr,p.r,p.g,p.b),m[0]=p.r,m[1]=p.g,m[2]=p.b}else{if(Ze(m,p))return;d.uniform3fv(this.addr,p),$e(m,p)}}function Hx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4f(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(Ze(m,p))return;d.uniform4fv(this.addr,p),$e(m,p)}}function Gx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(Ze(m,p))return;d.uniformMatrix2fv(this.addr,!1,p),$e(m,p)}else{if(Ze(m,g))return;Sf.set(g),d.uniformMatrix2fv(this.addr,!1,Sf),$e(m,g)}}function Vx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(Ze(m,p))return;d.uniformMatrix3fv(this.addr,!1,p),$e(m,p)}else{if(Ze(m,g))return;yf.set(g),d.uniformMatrix3fv(this.addr,!1,yf),$e(m,g)}}function Wx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(Ze(m,p))return;d.uniformMatrix4fv(this.addr,!1,p),$e(m,p)}else{if(Ze(m,g))return;vf.set(g),d.uniformMatrix4fv(this.addr,!1,vf),$e(m,g)}}function Xx(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1i(this.addr,p),m[0]=p}function qx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2i(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(Ze(m,p))return;d.uniform2iv(this.addr,p),$e(m,p)}}function Yx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3i(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else{if(Ze(m,p))return;d.uniform3iv(this.addr,p),$e(m,p)}}function Zx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4i(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(Ze(m,p))return;d.uniform4iv(this.addr,p),$e(m,p)}}function $x(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1ui(this.addr,p),m[0]=p}function Jx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2ui(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(Ze(m,p))return;d.uniform2uiv(this.addr,p),$e(m,p)}}function Kx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3ui(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else{if(Ze(m,p))return;d.uniform3uiv(this.addr,p),$e(m,p)}}function jx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4ui(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(Ze(m,p))return;d.uniform4uiv(this.addr,p),$e(m,p)}}function fa(d){if(d.version===0)d.compareFunction=wc,d.needsUpdate=!0;return d}function Qx(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;let x;if(this.type===d.SAMPLER_2D_SHADOW)x=fa(kf);else x=Bf;m.setTexture2D(p||x,_)}function tv(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;m.setTexture3D(p||Gf,_)}function ev(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;let x;if(this.type===d.SAMPLER_CUBE_SHADOW)x=fa(zf);else x=Vf;m.setTextureCube(p||x,_)}function nv(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;m.setTexture2DArray(p||Hf,_)}function iv(d){switch(d){case 5126:return Bx;case 35664:return kx;case 35665:return zx;case 35666:return Hx;case 35674:return Gx;case 35675:return Vx;case 35676:return Wx;case 5124:case 35670:return Xx;case 35667:case 35671:return qx;case 35668:case 35672:return Yx;case 35669:case 35673:return Zx;case 5125:return $x;case 36294:return Jx;case 36295:return Kx;case 36296:return jx;case 35678:case 36198:case 36298:case 36306:case 35682:return Qx;case 35679:case 36299:case 36307:return tv;case 35680:case 36300:case 36308:case 36293:return ev;case 36289:case 36303:case 36311:case 36292:return nv}}function sv(d,p){d.uniform1fv(this.addr,p)}function rv(d,p){let m=Hs(p,this.size,2);d.uniform2fv(this.addr,m)}function ov(d,p){let m=Hs(p,this.size,3);d.uniform3fv(this.addr,m)}function av(d,p){let m=Hs(p,this.size,4);d.uniform4fv(this.addr,m)}function lv(d,p){let m=Hs(p,this.size,4);d.uniformMatrix2fv(this.addr,!1,m)}function cv(d,p){let m=Hs(p,this.size,9);d.uniformMatrix3fv(this.addr,!1,m)}function hv(d,p){let m=Hs(p,this.size,16);d.uniformMatrix4fv(this.addr,!1,m)}function uv(d,p){d.uniform1iv(this.addr,p)}function dv(d,p){d.uniform2iv(this.addr,p)}function fv(d,p){d.uniform3iv(this.addr,p)}function pv(d,p){d.uniform4iv(this.addr,p)}function mv(d,p){d.uniform1uiv(this.addr,p)}function gv(d,p){d.uniform2uiv(this.addr,p)}function _v(d,p){d.uniform3uiv(this.addr,p)}function xv(d,p){d.uniform4uiv(this.addr,p)}function vv(d,p,m){let g=this.cache,_=p.length,x=da(m,_);if(!Ze(g,x))d.uniform1iv(this.addr,x),$e(g,x);let v;if(this.type===d.SAMPLER_2D_SHADOW)v=fa(kf);else v=Bf;for(let y=0;y!==_;++y)m.setTexture2D(p[y]||v,x[y])}function yv(d,p,m){let g=this.cache,_=p.length,x=da(m,_);if(!Ze(g,x))d.uniform1iv(this.addr,x),$e(g,x);for(let v=0;v!==_;++v)m.setTexture3D(p[v]||Gf,x[v])}function Sv(d,p,m){let g=this.cache,_=p.length,x=da(m,_);if(!Ze(g,x))d.uniform1iv(this.addr,x),$e(g,x);let v;if(this.type===d.SAMPLER_CUBE_SHADOW)v=fa(zf);else v=Vf;for(let y=0;y!==_;++y)m.setTextureCube(p[y]||v,x[y])}function bv(d,p,m){let g=this.cache,_=p.length,x=da(m,_);if(!Ze(g,x))d.uniform1iv(this.addr,x),$e(g,x);for(let v=0;v!==_;++v)m.setTexture2DArray(p[v]||Hf,x[v])}function Mv(d){switch(d){case 5126:return sv;case 35664:return rv;case 35665:return ov;case 35666:return av;case 35674:return lv;case 35675:return cv;case 35676:return hv;case 5124:case 35670:return uv;case 35667:case 35671:return dv;case 35668:case 35672:return fv;case 35669:case 35673:return pv;case 5125:return mv;case 36294:return gv;case 36295:return _v;case 36296:return xv;case 35678:case 36198:case 36298:case 36306:case 35682:return vv;case 35679:case 36299:case 36307:return yv;case 35680:case 36300:case 36308:case 36293:return Sv;case 36289:case 36303:case 36311:case 36292:return bv}}class Wf{constructor(d,p,m){this.id=d,this.addr=m,this.cache=[],this.type=p.type,this.setValue=iv(p.type)}}class Xf{constructor(d,p,m){this.id=d,this.addr=m,this.cache=[],this.type=p.type,this.size=p.size,this.setValue=Mv(p.type)}}class qf{constructor(d){this.id=d,this.seq=[],this.map={}}setValue(d,p,m){let g=this.seq;for(let _=0,x=g.length;_!==x;++_){let v=g[_];v.setValue(d,p[v.id],m)}}}var nh=/(\w+)(\])?(\[|\.)?/g;function bf(d,p){d.seq.push(p),d.map[p.id]=p}function Ev(d,p,m){let g=d.name,_=g.length;nh.lastIndex=0;while(!0){let x=nh.exec(g),v=nh.lastIndex,y=x[1],S=x[2]==="]",b=x[3];if(S)y=y|0;if(b===void 0||b==="["&&v+2===_){bf(m,b===void 0?new Wf(y,d,p):new Xf(y,d,p));break}else{let T=m.map[y];if(T===void 0)T=new qf(y),bf(m,T);m=T}}}class Br{constructor(d,p){this.seq=[],this.map={};let m=d.getProgramParameter(p,d.ACTIVE_UNIFORMS);for(let x=0;x<m;++x){let v=d.getActiveUniform(p,x),y=d.getUniformLocation(p,v.name);Ev(v,y,this)}let g=[],_=[];for(let x of this.seq)if(x.type===d.SAMPLER_2D_SHADOW||x.type===d.SAMPLER_CUBE_SHADOW||x.type===d.SAMPLER_2D_ARRAY_SHADOW)g.push(x);else _.push(x);if(g.length>0)this.seq=g.concat(_)}setValue(d,p,m,g){let _=this.map[p];if(_!==void 0)_.setValue(d,m,g)}setOptional(d,p,m){let g=p[m];if(g!==void 0)this.setValue(d,m,g)}static upload(d,p,m,g){for(let _=0,x=p.length;_!==x;++_){let v=p[_],y=m[v.id];if(y.needsUpdate!==!1)v.setValue(d,y.value,g)}}static seqWithValue(d,p){let m=[];for(let g=0,_=d.length;g!==_;++g){let x=d[g];if(x.id in p)m.push(x)}return m}}function Mf(d,p,m){let g=d.createShader(p);return d.shaderSource(g,m),d.compileShader(g),g}var Tv=37297,wv=0;function Av(d,p){let m=d.split(`
`),g=[],_=Math.max(p-6,0),x=Math.min(p+6,m.length);for(let v=_;v<x;v++){let y=v+1;g.push(`${y===p?">":" "} ${y}: ${m[v]}`)}return g.join(`
`)}var Ef=new Qt;function Rv(d){he._getMatrix(Ef,he.workingColorSpace,d);let p=`mat3( ${Ef.elements.map((m)=>m.toFixed(4))} )`;switch(he.getTransfer(d)){case Mc:return[p,"LinearTransferOETF"];case Ie:return[p,"sRGBTransferOETF"];default:return qt("WebGLProgram: Unsupported color space: ",d),[p,"LinearTransferOETF"]}}function Tf(d,p,m){let g=d.getShaderParameter(p,d.COMPILE_STATUS),x=(d.getShaderInfoLog(p)||"").trim();if(g&&x==="")return"";let v=/ERROR: 0:(\d+)/.exec(x);if(v){let y=parseInt(v[1]);return m.toUpperCase()+`

`+x+`

`+Av(d.getShaderSource(p),y)}else return x}function Cv(d,p){let m=Rv(p);return[`vec4 ${d}( vec4 value ) {`,`	return ${m[1]}( vec4( ${m[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var Pv={[Ul]:"Linear",[Fl]:"Reinhard",[Ol]:"Cineon",[Bl]:"ACESFilmic",[zl]:"AgX",[Hl]:"Neutral",[kl]:"Custom"};function Iv(d,p){let m=Pv[p];if(m===void 0)return qt("WebGLProgram: Unsupported toneMapping:",p),"vec3 "+d+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+d+"( vec3 color ) { return "+m+"ToneMapping( color ); }"}var ca=new q;function Lv(){he.getLuminanceCoefficients(ca);let d=ca.x.toFixed(4),p=ca.y.toFixed(4),m=ca.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${d}, ${p}, ${m} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function Nv(d){return[d.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",d.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Or).join(`
`)}function Dv(d){let p=[];for(let m in d){let g=d[m];if(g===!1)continue;p.push("#define "+m+" "+g)}return p.join(`
`)}function Uv(d,p){let m={},g=d.getProgramParameter(p,d.ACTIVE_ATTRIBUTES);for(let _=0;_<g;_++){let x=d.getActiveAttrib(p,_),v=x.name,y=1;if(x.type===d.FLOAT_MAT2)y=2;if(x.type===d.FLOAT_MAT3)y=3;if(x.type===d.FLOAT_MAT4)y=4;m[v]={type:x.type,location:d.getAttribLocation(p,v),locationSize:y}}return m}function Or(d){return d!==""}function wf(d,p){let m=p.numSpotLightShadows+p.numSpotLightMaps-p.numSpotLightShadowsWithMaps;return d.replace(/NUM_SUN_LIGHTS/g,p.numSunLights).replace(/NUM_DIR_LIGHTS/g,p.numDirLights).replace(/NUM_SPOT_LIGHTS/g,p.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,p.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,m).replace(/NUM_RECT_AREA_LIGHTS/g,p.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,p.numPointLights).replace(/NUM_HEMI_LIGHTS/g,p.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,p.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,p.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,p.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,p.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,p.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,p.numLightProbeGrids)}function Af(d,p){return d.replace(/NUM_CLIPPING_PLANES/g,p.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,p.numClippingPlanes-p.numClipIntersection)}var Fv=/^[ \t]*#include +<([\w\d./]+)>/gm;function sh(d){return d.replace(Fv,Ov)}function Ov(d,p){let m=ce[p];if(m===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+p+">");return sh(m)}var Bv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Rf(d){return d.replace(Bv,kv)}function kv(d,p,m,g){let _="";for(let x=parseInt(p);x<parseInt(m);x++)_+=g.replace(/\[\s*i\s*\]/g,"[ "+x+" ]").replace(/UNROLLED_LOOP_INDEX/g,x);return _}function Cf(d){let p=`precision ${d.precision} float;
	precision ${d.precision} int;
	precision ${d.precision} sampler2D;
	precision ${d.precision} samplerCube;
	precision ${d.precision} sampler3D;
	precision ${d.precision} sampler2DArray;
	precision ${d.precision} sampler2DShadow;
	precision ${d.precision} samplerCubeShadow;
	precision ${d.precision} sampler2DArrayShadow;
	precision ${d.precision} isampler2D;
	precision ${d.precision} isampler3D;
	precision ${d.precision} isamplerCube;
	precision ${d.precision} isampler2DArray;
	precision ${d.precision} usampler2D;
	precision ${d.precision} usampler3D;
	precision ${d.precision} usamplerCube;
	precision ${d.precision} usampler2DArray;
	`;if(d.precision==="highp")p+=`
#define HIGH_PRECISION`;else if(d.precision==="mediump")p+=`
#define MEDIUM_PRECISION`;else if(d.precision==="lowp")p+=`
#define LOW_PRECISION`;return p}var zv={[xr]:"SHADOWMAP_TYPE_PCF",[Ns]:"SHADOWMAP_TYPE_VSM"};function Hv(d){return zv[d.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Gv={[Us]:"ENVMAP_MODE_REFRACTION"};function Vv(d){if(d.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Gv[d.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Wv={[Ud]:"ENVMAP_BLENDING_MULTIPLY",[Fd]:"ENVMAP_BLENDING_MIX",[Od]:"ENVMAP_BLENDING_ADD"};function Xv(d){if(d.envMap===!1)return"ENVMAP_BLENDING_NONE";return Wv[d.combine]||"ENVMAP_BLENDING_NONE"}function qv(d,p,m,g){let _=d.getContext(),{defines:x,vertexShader:v,fragmentShader:y}=m,S=Hv(m),b=m.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",M=Vv(m),T=Xv(m),E=Nv(m),w=Dv(x),C=_.createProgram(),N,A,R=m.glslVersion?"#version "+m.glslVersion+`
`:"";if(m.isRawShaderMaterial){if(N=["#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w].filter(Or).join(`
`),N.length>0)N+=`
`;if(A=["#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w].filter(Or).join(`
`),A.length>0)A+=`
`}else N=[Cf(m),"#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w,m.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",m.batching?"#define USE_BATCHING":"",m.batchingColor?"#define USE_BATCHING_COLOR":"",m.instancing?"#define USE_INSTANCING":"",m.instancingColor?"#define USE_INSTANCING_COLOR":"",m.instancingMorph?"#define USE_INSTANCING_MORPH":"",m.useFog&&m.fog?"#define USE_FOG":"",m.useFog&&m.fogExp2?"#define FOG_EXP2":"",m.map?"#define USE_MAP":"",m.envMap?"#define USE_ENVMAP":"",m.envMap?"#define "+M:"",m.lightMap?"#define USE_LIGHTMAP":"",m.aoMap?"#define USE_AOMAP":"",m.bumpMap?"#define USE_BUMPMAP":"",m.normalMap?"#define USE_NORMALMAP":"",m.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",m.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",m.displacementMap?"#define USE_DISPLACEMENTMAP":"",m.emissiveMap?"#define USE_EMISSIVEMAP":"",m.anisotropy?"#define USE_ANISOTROPY":"",m.anisotropyMap?"#define USE_ANISOTROPYMAP":"",m.clearcoatMap?"#define USE_CLEARCOATMAP":"",m.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",m.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",m.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",m.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",m.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",m.specularMap?"#define USE_SPECULARMAP":"",m.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",m.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",m.roughnessMap?"#define USE_ROUGHNESSMAP":"",m.metalnessMap?"#define USE_METALNESSMAP":"",m.alphaMap?"#define USE_ALPHAMAP":"",m.alphaHash?"#define USE_ALPHAHASH":"",m.transmission?"#define USE_TRANSMISSION":"",m.transmissionMap?"#define USE_TRANSMISSIONMAP":"",m.thicknessMap?"#define USE_THICKNESSMAP":"",m.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",m.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",m.mapUv?"#define MAP_UV "+m.mapUv:"",m.alphaMapUv?"#define ALPHAMAP_UV "+m.alphaMapUv:"",m.lightMapUv?"#define LIGHTMAP_UV "+m.lightMapUv:"",m.aoMapUv?"#define AOMAP_UV "+m.aoMapUv:"",m.emissiveMapUv?"#define EMISSIVEMAP_UV "+m.emissiveMapUv:"",m.bumpMapUv?"#define BUMPMAP_UV "+m.bumpMapUv:"",m.normalMapUv?"#define NORMALMAP_UV "+m.normalMapUv:"",m.displacementMapUv?"#define DISPLACEMENTMAP_UV "+m.displacementMapUv:"",m.metalnessMapUv?"#define METALNESSMAP_UV "+m.metalnessMapUv:"",m.roughnessMapUv?"#define ROUGHNESSMAP_UV "+m.roughnessMapUv:"",m.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+m.anisotropyMapUv:"",m.clearcoatMapUv?"#define CLEARCOATMAP_UV "+m.clearcoatMapUv:"",m.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+m.clearcoatNormalMapUv:"",m.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+m.clearcoatRoughnessMapUv:"",m.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+m.diffuseRoughnessMapUv:"",m.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+m.iridescenceMapUv:"",m.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+m.iridescenceThicknessMapUv:"",m.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+m.sheenColorMapUv:"",m.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+m.sheenRoughnessMapUv:"",m.specularMapUv?"#define SPECULARMAP_UV "+m.specularMapUv:"",m.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+m.specularColorMapUv:"",m.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+m.specularIntensityMapUv:"",m.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+m.transmissionMapUv:"",m.thicknessMapUv?"#define THICKNESSMAP_UV "+m.thicknessMapUv:"",m.vertexTangents&&m.flatShading===!1?"#define USE_TANGENT":"",m.vertexNormals?"#define HAS_NORMAL":"",m.vertexColors?"#define USE_COLOR":"",m.vertexAlphas?"#define USE_COLOR_ALPHA":"",m.vertexUv1s?"#define USE_UV1":"",m.vertexUv2s?"#define USE_UV2":"",m.vertexUv3s?"#define USE_UV3":"",m.pointsUvs?"#define USE_POINTS_UV":"",m.flatShading?"#define FLAT_SHADED":"",m.skinning?"#define USE_SKINNING":"",m.morphTargets?"#define USE_MORPHTARGETS":"",m.morphNormals&&m.flatShading===!1?"#define USE_MORPHNORMALS":"",m.morphColors?"#define USE_MORPHCOLORS":"",m.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+m.morphTextureStride:"",m.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+m.morphTargetsCount:"",m.doubleSided?"#define DOUBLE_SIDED":"",m.flipSided?"#define FLIP_SIDED":"",m.shadowMapEnabled?"#define USE_SHADOWMAP":"",m.shadowMapEnabled?"#define "+S:"",m.sizeAttenuation?"#define USE_SIZEATTENUATION":"",m.numLightProbes>0?"#define USE_LIGHT_PROBES":"",m.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",m.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(Or).join(`
`),A=[Cf(m),"#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w,m.useFog&&m.fog?"#define USE_FOG":"",m.useFog&&m.fogExp2?"#define FOG_EXP2":"",m.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",m.map?"#define USE_MAP":"",m.matcap?"#define USE_MATCAP":"",m.envMap?"#define USE_ENVMAP":"",m.envMap?"#define "+b:"",m.envMap?"#define "+M:"",m.envMap?"#define "+T:"",m.envMapPMREM?"#define ENVMAP_MAX_LOD "+m.envMapMaxLod+".0":"",m.envMapPMREM?"#define ENVMAP_SIZE "+m.envMapSize+".0":"",m.lightMap?"#define USE_LIGHTMAP":"",m.aoMap?"#define USE_AOMAP":"",m.bumpMap?"#define USE_BUMPMAP":"",m.normalMap?"#define USE_NORMALMAP":"",m.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",m.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",m.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",m.emissiveMap?"#define USE_EMISSIVEMAP":"",m.anisotropy?"#define USE_ANISOTROPY":"",m.anisotropyMap?"#define USE_ANISOTROPYMAP":"",m.clearcoat?"#define USE_CLEARCOAT":"",m.clearcoatMap?"#define USE_CLEARCOATMAP":"",m.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",m.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",m.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",m.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",m.dispersion?"#define USE_DISPERSION":"",m.retroreflection?"#define USE_RETROREFLECTION":"",m.iridescence?"#define USE_IRIDESCENCE":"",m.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",m.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",m.specularMap?"#define USE_SPECULARMAP":"",m.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",m.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",m.roughnessMap?"#define USE_ROUGHNESSMAP":"",m.metalnessMap?"#define USE_METALNESSMAP":"",m.alphaMap?"#define USE_ALPHAMAP":"",m.alphaTest?"#define USE_ALPHATEST":"",m.alphaHash?"#define USE_ALPHAHASH":"",m.sheen?"#define USE_SHEEN":"",m.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",m.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",m.transmission?"#define USE_TRANSMISSION":"",m.transmissionMap?"#define USE_TRANSMISSIONMAP":"",m.thicknessMap?"#define USE_THICKNESSMAP":"",m.vertexTangents&&m.flatShading===!1?"#define USE_TANGENT":"",m.vertexColors||m.instancingColor?"#define USE_COLOR":"",m.vertexAlphas||m.batchingColor?"#define USE_COLOR_ALPHA":"",m.vertexUv1s?"#define USE_UV1":"",m.vertexUv2s?"#define USE_UV2":"",m.vertexUv3s?"#define USE_UV3":"",m.pointsUvs?"#define USE_POINTS_UV":"",m.gradientMap?"#define USE_GRADIENTMAP":"",m.flatShading?"#define FLAT_SHADED":"",m.doubleSided?"#define DOUBLE_SIDED":"",m.flipSided?"#define FLIP_SIDED":"",m.shadowMapEnabled?"#define USE_SHADOWMAP":"",m.shadowMapEnabled?"#define "+S:"",m.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",m.numLightProbes>0?"#define USE_LIGHT_PROBES":"",m.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",m.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",m.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",m.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",m.toneMapping!==Yn?"#define TONE_MAPPING":"",m.toneMapping!==Yn?ce.tonemapping_pars_fragment:"",m.toneMapping!==Yn?Iv("toneMapping",m.toneMapping):"",m.dithering?"#define DITHERING":"",m.opaque?"#define OPAQUE":"",ce.colorspace_pars_fragment,Cv("linearToOutputTexel",m.outputColorSpace),Lv(),m.useDepthPacking?"#define DEPTH_PACKING "+m.depthPacking:"",`
`].filter(Or).join(`
`);if(v=sh(v),v=wf(v,m),v=Af(v,m),y=sh(y),y=wf(y,m),y=Af(y,m),v=Rf(v),y=Rf(y),m.isRawShaderMaterial!==!0)R=`#version 300 es
`,N=[E,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+N,A=["#define varying in",m.glslVersion===Ac?"":"layout(location = 0) out highp vec4 pc_fragColor;",m.glslVersion===Ac?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+A;let I=R+N+v,U=R+A+y,L=Mf(_,_.VERTEX_SHADER,I),D=Mf(_,_.FRAGMENT_SHADER,U);if(_.attachShader(C,L),_.attachShader(C,D),m.index0AttributeName!==void 0)_.bindAttribLocation(C,0,m.index0AttributeName);else if(m.hasPositionAttribute===!0)_.bindAttribLocation(C,0,"position");_.linkProgram(C);function k(H){if(d.debug.checkShaderErrors){let z=_.getProgramInfoLog(C)||"",W=_.getShaderInfoLog(L)||"",Z=_.getShaderInfoLog(D)||"",V=z.trim(),Q=W.trim(),it=Z.trim(),j=!0,xt=!0;if(_.getProgramParameter(C,_.LINK_STATUS)===!1)if(j=!1,typeof d.debug.onShaderError==="function")d.debug.onShaderError(_,C,L,D);else{let rt=Tf(_,L,"vertex"),dt=Tf(_,D,"fragment");Zt("WebGLProgram: Shader Error "+_.getError()+" - VALIDATE_STATUS "+_.getProgramParameter(C,_.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+V+`
`+rt+`
`+dt)}else if(V!=="")qt("WebGLProgram: Program Info Log:",V);else if(Q===""||it==="")xt=!1;if(xt)H.diagnostics={runnable:j,programLog:V,vertexShader:{log:Q,prefix:N},fragmentShader:{log:it,prefix:A}}}_.deleteShader(L),_.deleteShader(D),P=new Br(_,C),F=Uv(_,C)}let P;this.getUniforms=function(){if(P===void 0)k(this);return P};let F;this.getAttributes=function(){if(F===void 0)k(this);return F};let G=m.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(G===!1)G=_.getProgramParameter(C,Tv);return G},this.destroy=function(){g.releaseStatesOfProgram(this),_.deleteProgram(C),this.program=void 0},this.type=m.shaderType,this.name=m.shaderName,this.id=wv++,this.cacheKey=p,this.usedTimes=1,this.program=C,this.vertexShader=L,this.fragmentShader=D,this}var Yv=0;class Yf{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(d,p,m){let g=this._getShaderCacheForMaterial(d);if(g.has(p)===!1)g.add(p),p.usedTimes++;if(g.has(m)===!1)g.add(m),m.usedTimes++;return this}remove(d){let p=this.materialCache.get(d);for(let m of p)if(m.usedTimes--,m.usedTimes===0)this.shaderCache.delete(m.code);return this.materialCache.delete(d),this}getVertexShaderStage(d){return this._getShaderStage(d.vertexShader)}getFragmentShaderStage(d){return this._getShaderStage(d.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(d){let p=this.materialCache,m=p.get(d);if(m===void 0)m=new Set,p.set(d,m);return m}_getShaderStage(d){let p=this.shaderCache,m=p.get(d);if(m===void 0)m=new Zf(d),p.set(d,m);return m}}class Zf{constructor(d){this.id=Yv++,this.code=d,this.usedTimes=0}}function Zv(d){return d===Ji||d===Bo||d===ko}function $v(d,p,m,g,_,x){let v=new Ar,y=new Yf,S=new Set,b=[],M=new Map,T=g.logarithmicDepthBuffer,E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(P){if(S.add(P),P===0)return"uv";return`uv${P}`}function C(P,F,G,H,z,W){let Z=H.fog,V=z.geometry,Q=P.isMeshStandardMaterial||P.isMeshLambertMaterial||P.isMeshPhongMaterial?H.environment:null,it=P.isMeshStandardMaterial||P.isMeshLambertMaterial&&!P.envMap||P.isMeshPhongMaterial&&!P.envMap,j=p.get(P.envMap||Q,it),xt=E[P.type],rt=g.precision;if(P.precision!==null){if(rt=g.getMaxPrecision(P.precision),rt!==P.precision)qt("WebGLProgram.getParameters:",P.precision,"not supported, using",rt,"instead.")}let dt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,_t=dt!==void 0?dt.length:0,Nt=0;if(V.morphAttributes.position!==void 0)Nt=1;if(V.morphAttributes.normal!==void 0)Nt=2;if(V.morphAttributes.color!==void 0)Nt=3;let ot,mt,Rt,Bt;if(xt){let Pt=Jn[xt];ot=Pt.vertexShader,mt=Pt.fragmentShader}else{ot=P.vertexShader,mt=P.fragmentShader;let Pt=y.getVertexShaderStage(P),Ae=y.getFragmentShaderStage(P);y.update(P,Pt,Ae),Rt=Pt.id,Bt=Ae.id}let kt=d.getRenderTarget(),Lt=d.state.buffers.depth.getReversed(),ie=z.isInstancedMesh===!0,jt=z.isBatchedMesh===!0,Dt=!!P.map,Jt=!!P.matcap,Yt=!!j,Kt=Yt&&j.isPMREMTexture===!0,ae=!!P.aoMap,me=!!P.lightMap,Te=!!P.bumpMap&&P.wireframe===!1,le=!!P.normalMap,de=!!P.displacementMap,Be=!!P.emissiveMap,ke=!!P.metalnessMap,en=!!P.roughnessMap,K=P.anisotropy>0,nn=P.clearcoat>0,ht=P.diffuseRoughness>0,Gt=P.dispersion>0,pt=P.retroreflectivity>0,_e=P.iridescence>0,Xt=P.sheen>0,te=P.transmission>0,ln=K&&!!P.anisotropyMap,X=nn&&!!P.clearcoatMap,O=nn&&!!P.clearcoatNormalMap,tt=nn&&!!P.clearcoatRoughnessMap,gt=ht&&!!P.diffuseRoughnessMap,ft=_e&&!!P.iridescenceMap,St=_e&&!!P.iridescenceThicknessMap,Et=Xt&&!!P.sheenColorMap,at=Xt&&!!P.sheenRoughnessMap,ut=!!P.specularMap,bt=!!P.specularColorMap,Y=!!P.specularIntensityMap,ct=te&&!!P.transmissionMap,lt=te&&!!P.thicknessMap,vt=!!P.gradientMap,yt=!!P.alphaMap,wt=P.alphaTest>0,Vt=!!P.alphaHash,Ht=!!P.extensions,Ct=Yn;if(P.toneMapped){if(kt===null||kt.isXRRenderTarget===!0)Ct=d.toneMapping}let Wt=Kt?j.isCompressedCubeTexture?j.image[0].mipmaps:j.mipmaps:null,oe={shaderID:xt,shaderType:P.type,shaderName:P.name,vertexShader:ot,fragmentShader:mt,defines:P.defines,customVertexShaderID:Rt,customFragmentShaderID:Bt,isRawShaderMaterial:P.isRawShaderMaterial===!0,glslVersion:P.glslVersion,precision:rt,batching:jt,batchingColor:jt&&z._colorsTexture!==null,instancing:ie,instancingColor:ie&&z.instanceColor!==null,instancingMorph:ie&&z.morphTexture!==null,outputColorSpace:kt===null?d.outputColorSpace:kt.isXRRenderTarget===!0?kt.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!P.alphaToCoverage,map:Dt,matcap:Jt,envMap:Yt,envMapMode:Yt&&j.mapping,envMapPMREM:Kt,envMapMaxLod:Kt?Wt.length-1:null,envMapSize:Kt?Wt[0].width:null,aoMap:ae,lightMap:me,bumpMap:Te,normalMap:le,displacementMap:de,emissiveMap:Be,normalMapObjectSpace:le&&P.normalMapType===Yd,normalMapTangentSpace:le&&P.normalMapType===Sc,packedNormalMap:le&&P.normalMapType===Sc&&Zv(P.normalMap.format),metalnessMap:ke,roughnessMap:en,anisotropy:K,anisotropyMap:ln,clearcoat:nn,clearcoatMap:X,clearcoatNormalMap:O,clearcoatRoughnessMap:tt,diffuseRoughness:ht,diffuseRoughnessMap:gt,dispersion:Gt,retroreflection:pt,iridescence:_e,iridescenceMap:ft,iridescenceThicknessMap:St,sheen:Xt,sheenColorMap:Et,sheenRoughnessMap:at,specularMap:ut,specularColorMap:bt,specularIntensityMap:Y,transmission:te,transmissionMap:ct,thicknessMap:lt,gradientMap:vt,opaque:P.transparent===!1&&P.blending===vr&&P.alphaToCoverage===!1,alphaMap:yt,alphaTest:wt,alphaHash:Vt,combine:P.combine,mapUv:Dt&&w(P.map.channel),aoMapUv:ae&&w(P.aoMap.channel),lightMapUv:me&&w(P.lightMap.channel),bumpMapUv:Te&&w(P.bumpMap.channel),normalMapUv:le&&w(P.normalMap.channel),displacementMapUv:de&&w(P.displacementMap.channel),emissiveMapUv:Be&&w(P.emissiveMap.channel),metalnessMapUv:ke&&w(P.metalnessMap.channel),roughnessMapUv:en&&w(P.roughnessMap.channel),anisotropyMapUv:ln&&w(P.anisotropyMap.channel),clearcoatMapUv:X&&w(P.clearcoatMap.channel),clearcoatNormalMapUv:O&&w(P.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:tt&&w(P.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:gt&&w(P.diffuseRoughnessMap.channel),iridescenceMapUv:ft&&w(P.iridescenceMap.channel),iridescenceThicknessMapUv:St&&w(P.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&w(P.sheenColorMap.channel),sheenRoughnessMapUv:at&&w(P.sheenRoughnessMap.channel),specularMapUv:ut&&w(P.specularMap.channel),specularColorMapUv:bt&&w(P.specularColorMap.channel),specularIntensityMapUv:Y&&w(P.specularIntensityMap.channel),transmissionMapUv:ct&&w(P.transmissionMap.channel),thicknessMapUv:lt&&w(P.thicknessMap.channel),alphaMapUv:yt&&w(P.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(le||K),vertexNormals:!!V.attributes.normal,vertexColors:P.vertexColors,vertexAlphas:P.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!V.attributes.uv&&(Dt||yt),fog:!!Z,useFog:P.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:P.wireframe===!1&&(P.flatShading===!0||V.attributes.normal===void 0&&le===!1&&(P.isMeshLambertMaterial||P.isMeshPhongMaterial||P.isMeshStandardMaterial||P.isMeshPhysicalMaterial)),sizeAttenuation:P.sizeAttenuation===!0,logarithmicDepthBuffer:T,reversedDepthBuffer:Lt,skinning:z.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:_t,morphTextureStride:Nt,numSunLights:F.sun.length,numDirLights:F.directional.length,numPointLights:F.point.length,numSpotLights:F.spot.length,numSpotLightMaps:F.spotLightMap.length,numRectAreaLights:F.rectArea.length,numHemiLights:F.hemi.length,numSunLightShadows:F.sunShadowMap.length,numDirLightShadows:F.directionalShadowMap.length,numPointLightShadows:F.pointShadowMap.length,numSpotLightShadows:F.spotShadowMap.length,numSpotLightShadowsWithMaps:F.numSpotLightShadowsWithMaps,numLightProbes:F.numLightProbes,numLightProbeGrids:W.filter((Pt)=>Pt.texture!==null).length,numClippingPlanes:x.numPlanes,numClipIntersection:x.numIntersection,dithering:P.dithering,shadowMapEnabled:d.shadowMap.enabled&&G.length>0,shadowMapType:d.shadowMap.type,toneMapping:Ct,decodeVideoTexture:Dt&&P.map.isVideoTexture===!0&&he.getTransfer(P.map.colorSpace)===Ie,decodeVideoTextureEmissive:Be&&P.emissiveMap.isVideoTexture===!0&&he.getTransfer(P.emissiveMap.colorSpace)===Ie,premultipliedAlpha:P.premultipliedAlpha,doubleSided:P.side===Ln,flipSided:P.side===mn,useDepthPacking:P.depthPacking>=0,depthPacking:P.depthPacking||0,index0AttributeName:P.index0AttributeName,extensionClipCullDistance:Ht&&P.extensions.clipCullDistance===!0&&m.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ht&&P.extensions.multiDraw===!0||jt)&&m.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:m.has("KHR_parallel_shader_compile"),customProgramCacheKey:P.customProgramCacheKey()};return oe.vertexUv1s=S.has(1),oe.vertexUv2s=S.has(2),oe.vertexUv3s=S.has(3),S.clear(),oe}function N(P){let F=[];if(P.shaderID)F.push(P.shaderID);else F.push(P.customVertexShaderID),F.push(P.customFragmentShaderID);if(P.defines!==void 0)for(let G in P.defines)F.push(G),F.push(P.defines[G]);if(P.isRawShaderMaterial===!1)A(F,P),R(F,P),F.push(d.outputColorSpace);return F.push(P.customProgramCacheKey),F.join()}function A(P,F){P.push(F.precision),P.push(F.outputColorSpace),P.push(F.envMapMode),P.push(F.envMapPMREM),P.push(F.envMapMaxLod),P.push(F.envMapSize),P.push(F.mapUv),P.push(F.alphaMapUv),P.push(F.lightMapUv),P.push(F.aoMapUv),P.push(F.bumpMapUv),P.push(F.normalMapUv),P.push(F.displacementMapUv),P.push(F.emissiveMapUv),P.push(F.metalnessMapUv),P.push(F.roughnessMapUv),P.push(F.anisotropyMapUv),P.push(F.clearcoatMapUv),P.push(F.clearcoatNormalMapUv),P.push(F.clearcoatRoughnessMapUv),P.push(F.diffuseRoughnessMapUv),P.push(F.iridescenceMapUv),P.push(F.iridescenceThicknessMapUv),P.push(F.sheenColorMapUv),P.push(F.sheenRoughnessMapUv),P.push(F.specularMapUv),P.push(F.specularColorMapUv),P.push(F.specularIntensityMapUv),P.push(F.transmissionMapUv),P.push(F.thicknessMapUv),P.push(F.combine),P.push(F.fogExp2),P.push(F.sizeAttenuation),P.push(F.morphTargetsCount),P.push(F.numSunLights),P.push(F.numDirLights),P.push(F.numPointLights),P.push(F.numSpotLights),P.push(F.numSpotLightMaps),P.push(F.numHemiLights),P.push(F.numRectAreaLights),P.push(F.numSunLightShadows),P.push(F.numDirLightShadows),P.push(F.numPointLightShadows),P.push(F.numSpotLightShadows),P.push(F.numSpotLightShadowsWithMaps),P.push(F.numLightProbes),P.push(F.numLightProbeGrids),P.push(F.shadowMapType),P.push(F.toneMapping),P.push(F.numClippingPlanes),P.push(F.numClipIntersection),P.push(F.depthPacking)}function R(P,F){if(v.disableAll(),F.instancing)v.enable(0);if(F.instancingColor)v.enable(1);if(F.instancingMorph)v.enable(2);if(F.matcap)v.enable(3);if(F.envMap)v.enable(4);if(F.normalMapObjectSpace)v.enable(5);if(F.normalMapTangentSpace)v.enable(6);if(F.clearcoat)v.enable(7);if(F.iridescence)v.enable(8);if(F.alphaTest)v.enable(9);if(F.vertexColors)v.enable(10);if(F.vertexAlphas)v.enable(11);if(F.vertexUv1s)v.enable(12);if(F.vertexUv2s)v.enable(13);if(F.vertexUv3s)v.enable(14);if(F.vertexTangents)v.enable(15);if(F.anisotropy)v.enable(16);if(F.alphaHash)v.enable(17);if(F.batching)v.enable(18);if(F.dispersion)v.enable(19);if(F.retroreflection)v.enable(24);if(F.diffuseRoughness)v.enable(25);if(F.batchingColor)v.enable(20);if(F.gradientMap)v.enable(21);if(F.packedNormalMap)v.enable(22);if(F.vertexNormals)v.enable(23);if(P.push(v.mask),v.disableAll(),F.fog)v.enable(0);if(F.useFog)v.enable(1);if(F.flatShading)v.enable(2);if(F.logarithmicDepthBuffer)v.enable(3);if(F.reversedDepthBuffer)v.enable(4);if(F.skinning)v.enable(5);if(F.morphTargets)v.enable(6);if(F.morphNormals)v.enable(7);if(F.morphColors)v.enable(8);if(F.premultipliedAlpha)v.enable(9);if(F.shadowMapEnabled)v.enable(10);if(F.doubleSided)v.enable(11);if(F.flipSided)v.enable(12);if(F.useDepthPacking)v.enable(13);if(F.dithering)v.enable(14);if(F.transmission)v.enable(15);if(F.sheen)v.enable(16);if(F.opaque)v.enable(17);if(F.pointsUvs)v.enable(18);if(F.decodeVideoTexture)v.enable(19);if(F.decodeVideoTextureEmissive)v.enable(20);if(F.alphaToCoverage)v.enable(21);if(F.numLightProbeGrids>0)v.enable(22);if(F.hasPositionAttribute)v.enable(23);P.push(v.mask)}function I(P){let F=E[P.type],G;if(F){let H=Jn[F];G=of.clone(H.uniforms)}else G=P.uniforms;return G}function U(P,F){let G=M.get(F);if(G!==void 0)++G.usedTimes;else G=new qv(d,F,P,_),b.push(G),M.set(F,G);return G}function L(P){if(--P.usedTimes===0){let F=b.indexOf(P);b[F]=b[b.length-1],b.pop(),M.delete(P.cacheKey),P.destroy()}}function D(P){y.remove(P)}function k(){y.dispose()}return{getParameters:C,getProgramCacheKey:N,getUniforms:I,acquireProgram:U,releaseProgram:L,releaseShaderCache:D,programs:b,dispose:k}}function Jv(){let d=new WeakMap;function p(v){return d.has(v)}function m(v){let y=d.get(v);if(y===void 0)y={},d.set(v,y);return y}function g(v){d.delete(v)}function _(v,y,S){d.get(v)[y]=S}function x(){d=new WeakMap}return{has:p,get:m,remove:g,update:_,dispose:x}}function Kv(d,p){if(d.groupOrder!==p.groupOrder)return d.groupOrder-p.groupOrder;else if(d.renderOrder!==p.renderOrder)return d.renderOrder-p.renderOrder;else if(d.material.id!==p.material.id)return d.material.id-p.material.id;else if(d.materialVariant!==p.materialVariant)return d.materialVariant-p.materialVariant;else if(d.z!==p.z)return d.z-p.z;else return d.id-p.id}function Pf(d,p){if(d.groupOrder!==p.groupOrder)return d.groupOrder-p.groupOrder;else if(d.renderOrder!==p.renderOrder)return d.renderOrder-p.renderOrder;else if(d.z!==p.z)return p.z-d.z;else return d.id-p.id}function If(){let d=[],p=0,m=[],g=[],_=[];function x(){p=0,m.length=0,g.length=0,_.length=0}function v(E){let w=0;if(E.isInstancedMesh)w+=2;if(E.isSkinnedMesh)w+=1;return w}function y(E,w,C,N,A,R){let I=d[p];if(I===void 0)I={id:E.id,object:E,geometry:w,material:C,materialVariant:v(E),groupOrder:N,renderOrder:E.renderOrder,z:A,group:R},d[p]=I;else I.id=E.id,I.object=E,I.geometry=w,I.material=C,I.materialVariant=v(E),I.groupOrder=N,I.renderOrder=E.renderOrder,I.z=A,I.group=R;return p++,I}function S(E,w,C,N,A,R,I){if(I.reversedDepth===!0)A=-A;let U=y(E,w,C,N,A,R);if(C.transmission>0)g.push(U);else if(C.transparent===!0)_.push(U);else m.push(U)}function b(E,w,C,N,A,R){let I=y(E,w,C,N,A,R);if(C.transmission>0)g.unshift(I);else if(C.transparent===!0)_.unshift(I);else m.unshift(I)}function M(E,w){if(m.length>1)m.sort(E||Kv);if(g.length>1)g.sort(w||Pf);if(_.length>1)_.sort(w||Pf)}function T(){for(let E=p,w=d.length;E<w;E++){let C=d[E];if(C.id===null)break;C.id=null,C.object=null,C.geometry=null,C.material=null,C.group=null}}return{opaque:m,transmissive:g,transparent:_,init:x,push:S,unshift:b,finish:T,sort:M}}function jv(){let d=new WeakMap;function p(g,_){let x=d.get(g),v;if(x===void 0)v=new If,d.set(g,[v]);else if(_>=x.length)v=new If,x.push(v);else v=x[_];return v}function m(){d=new WeakMap}return{get:p,dispose:m}}function Qv(){let d={};return{get:function(p){if(d[p.id]!==void 0)return d[p.id];let m;switch(p.type){case"SunLight":case"DirectionalLight":m={direction:new q,color:new re};break;case"SpotLight":m={position:new q,direction:new q,color:new re,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":m={position:new q,color:new re,distance:0,decay:0};break;case"HemisphereLight":m={direction:new q,skyColor:new re,groundColor:new re};break;case"RectAreaLight":m={color:new re,position:new q,halfWidth:new q,halfHeight:new q};break}return d[p.id]=m,m}}}function ty(){let d={};return{get:function(p){if(d[p.id]!==void 0)return d[p.id];let m;switch(p.type){case"SunLight":case"DirectionalLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"SpotLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t};break;case"PointLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new $t,shadowCameraNear:1,shadowCameraFar:1000};break}return d[p.id]=m,m}}}var ey=0;function ny(d,p){return(p.castShadow?2:0)-(d.castShadow?2:0)+(p.map?1:0)-(d.map?1:0)}function iy(d){let p=new Qv,m=ty(),g={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let b=0;b<9;b++)g.probe.push(new q);let _=new q,x=new se,v=new se;function y(b){let M=0,T=0,E=0;for(let W=0;W<9;W++)g.probe[W].set(0,0,0);let w=0,C=0,N=0,A=0,R=0,I=0,U=0,L=0,D=0,k=0,P=0,F=0,G=0,H=0;b.sort(ny);for(let W=0,Z=b.length;W<Z;W++){let V=b[W],{color:Q,intensity:it,distance:j}=V,xt=null;if(V.shadow&&V.shadow.map)if(V.shadow.map.texture.format===Ji)xt=V.shadow.map.texture;else xt=V.shadow.map.depthTexture||V.shadow.map.texture;if(V.isAmbientLight)M+=Q.r*it,T+=Q.g*it,E+=Q.b*it;else if(V.isLightProbe){for(let rt=0;rt<9;rt++)g.probe[rt].addScaledVector(V.sh.coefficients[rt],it);H++}else if(V.isSunLight){let rt=p.get(V);if(rt.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){let dt=V.shadow,_t=m.get(V);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize.copy(dt.mapSize).multiply(dt.getFrameExtents()),g.sunShadow[C]=_t,g.sunShadowMap[C]=xt;let Nt=dt.getViewportCount();for(let ot=0;ot<Nt;ot++)g.sunShadowMatrix[N+ot]=dt.getMatrix(ot),g.sunShadowCascade[N+ot]=dt._cascadeData[ot];N+=Nt,C++}g.sun[w]=rt,w++}else if(V.isDirectionalLight){let rt=p.get(V);if(rt.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){let dt=V.shadow,_t=m.get(V);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,g.directionalShadow[A]=_t,g.directionalShadowMap[A]=xt,g.directionalShadowMatrix[A]=V.shadow.matrix,D++}g.directional[A]=rt,A++}else if(V.isSpotLight){let rt=p.get(V);rt.position.setFromMatrixPosition(V.matrixWorld),rt.color.copy(Q).multiplyScalar(it),rt.distance=j,rt.coneCos=Math.cos(V.angle),rt.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),rt.decay=V.decay,g.spot[I]=rt;let dt=V.shadow;if(V.map){if(g.spotLightMap[F]=V.map,F++,dt.updateMatrices(V),V.castShadow)G++}if(g.spotLightMatrix[I]=dt.matrix,V.castShadow){let _t=m.get(V);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,g.spotShadow[I]=_t,g.spotShadowMap[I]=xt,P++}I++}else if(V.isRectAreaLight){let rt=p.get(V);rt.color.copy(Q).multiplyScalar(it),rt.halfWidth.set(V.width*0.5,0,0),rt.halfHeight.set(0,V.height*0.5,0),g.rectArea[U]=rt,U++}else if(V.isPointLight){let rt=p.get(V);if(rt.color.copy(V.color).multiplyScalar(V.intensity),rt.distance=V.distance,rt.decay=V.decay,V.castShadow){let dt=V.shadow,_t=m.get(V);_t.shadowIntensity=dt.intensity,_t.shadowBias=dt.bias,_t.shadowNormalBias=dt.normalBias,_t.shadowRadius=dt.radius,_t.shadowMapSize=dt.mapSize,_t.shadowCameraNear=dt.camera.near,_t.shadowCameraFar=dt.camera.far,g.pointShadow[R]=_t,g.pointShadowMap[R]=xt,g.pointShadowMatrix[R]=V.shadow.matrix,k++}g.point[R]=rt,R++}else if(V.isHemisphereLight){let rt=p.get(V);rt.skyColor.copy(V.color).multiplyScalar(it),rt.groundColor.copy(V.groundColor).multiplyScalar(it),g.hemi[L]=rt,L++}}if(U>0)if(d.has("OES_texture_float_linear")===!0)g.rectAreaLTC1=At.LTC_FLOAT_1,g.rectAreaLTC2=At.LTC_FLOAT_2;else g.rectAreaLTC1=At.LTC_HALF_1,g.rectAreaLTC2=At.LTC_HALF_2;g.ambient[0]=M,g.ambient[1]=T,g.ambient[2]=E;let z=g.hash;if(z.sunLength!==w||z.directionalLength!==A||z.pointLength!==R||z.spotLength!==I||z.rectAreaLength!==U||z.hemiLength!==L||z.numSunShadows!==C||z.numDirectionalShadows!==D||z.numPointShadows!==k||z.numSpotShadows!==P||z.numSpotMaps!==F||z.numLightProbes!==H)g.sun.length=w,g.directional.length=A,g.spot.length=I,g.rectArea.length=U,g.point.length=R,g.hemi.length=L,g.sunShadow.length=C,g.sunShadowMap.length=C,g.sunShadowMatrix.length=N,g.sunShadowCascade.length=N,g.directionalShadow.length=D,g.directionalShadowMap.length=D,g.directionalShadowMatrix.length=D,g.pointShadow.length=k,g.pointShadowMap.length=k,g.pointShadowMatrix.length=k,g.spotShadow.length=P,g.spotShadowMap.length=P,g.spotLightMatrix.length=P+F-G,g.spotLightMap.length=F,g.numSpotLightShadowsWithMaps=G,g.numLightProbes=H,z.sunLength=w,z.directionalLength=A,z.pointLength=R,z.spotLength=I,z.rectAreaLength=U,z.hemiLength=L,z.numSunShadows=C,z.numDirectionalShadows=D,z.numPointShadows=k,z.numSpotShadows=P,z.numSpotMaps=F,z.numLightProbes=H,g.version=ey++}function S(b,M){let T=0,E=0,w=0,C=0,N=0,A=0,R=M.matrixWorldInverse;for(let I=0,U=b.length;I<U;I++){let L=b[I];if(L.isSunLight){let D=g.sun[T];D.direction.setFromMatrixPosition(L.matrixWorld),D.direction.transformDirection(R),T++}else if(L.isDirectionalLight){let D=g.directional[E];D.direction.setFromMatrixPosition(L.matrixWorld),_.setFromMatrixPosition(L.target.matrixWorld),D.direction.sub(_),D.direction.transformDirection(R),E++}else if(L.isSpotLight){let D=g.spot[C];D.position.setFromMatrixPosition(L.matrixWorld),D.position.applyMatrix4(R),D.direction.setFromMatrixPosition(L.matrixWorld),_.setFromMatrixPosition(L.target.matrixWorld),D.direction.sub(_),D.direction.transformDirection(R),C++}else if(L.isRectAreaLight){let D=g.rectArea[N];D.position.setFromMatrixPosition(L.matrixWorld),D.position.applyMatrix4(R),v.identity(),x.copy(L.matrixWorld),x.premultiply(R),v.extractRotation(x),D.halfWidth.set(L.width*0.5,0,0),D.halfHeight.set(0,L.height*0.5,0),D.halfWidth.applyMatrix4(v),D.halfHeight.applyMatrix4(v),N++}else if(L.isPointLight){let D=g.point[w];D.position.setFromMatrixPosition(L.matrixWorld),D.position.applyMatrix4(R),w++}else if(L.isHemisphereLight){let D=g.hemi[A];D.direction.setFromMatrixPosition(L.matrixWorld),D.direction.transformDirection(R),A++}}}return{setup:y,setupView:S,state:g}}function Lf(d){let p=new iy(d),m=[],g=[],_=[];function x(T){M.camera=T,m.length=0,g.length=0,_.length=0}function v(T){if(T.isLightProbeGrid)_.push(T);else m.push(T)}function y(T){g.push(T)}function S(){p.setup(m),_.sort((T,E)=>T.priority-E.priority||T.id-E.id)}function b(T){p.setupView(m,T)}let M={lightsArray:m,shadowsArray:g,lightProbeGridArray:_,camera:null,lights:p,transmissionRenderTarget:{},textureUnits:0};return{init:x,state:M,setupLights:S,setupLightsView:b,pushLight:v,pushShadow:y}}function sy(d){let p=new WeakMap;function m(_,x=0){let v=p.get(_),y;if(v===void 0)y=new Lf(d),p.set(_,[y]);else if(x>=v.length)y=new Lf(d),v.push(y);else y=v[x];return y}function g(){p=new WeakMap}return{get:m,dispose:g}}var ry=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,oy=`uniform sampler2D shadow_pass;
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
}`,ay=[new q(1,0,0),new q(-1,0,0),new q(0,1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1)],ly=[new q(0,-1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1),new q(0,-1,0),new q(0,-1,0)],Nf=new se,Fr=new q,ih=new q;function cy(d,p,m){let g=new Ti,_=new $t,x=new $t,v=new Oe,y=new kc,S=new zc,b={},M=m.maxTextureSize,T={[ci]:mn,[mn]:ci,[Ln]:Ln},E=new mi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new $t},radius:{value:4}},vertexShader:ry,fragmentShader:oy}),w=E.clone();w.defines.HORIZONTAL_PASS=1;let C=new Ye;C.setAttribute("position",new Xe(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let N=new on(C,E),A=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=xr;let R=this.type;this.render=function(k,P,F){if(A.enabled===!1)return;if(A.autoUpdate===!1&&A.needsUpdate===!1)return;if(k.length===0)return;if(this.type===ad)qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=xr;let G=d.getRenderTarget(),H=d.getActiveCubeFace(),z=d.getActiveMipmapLevel(),W=d.state;if(W.setBlending(Zi),W.buffers.depth.getReversed()===!0)W.buffers.color.setClear(0,0,0,0);else W.buffers.color.setClear(1,1,1,1);W.buffers.depth.setTest(!0),W.setScissorTest(!1);let Z=R!==this.type;if(Z)P.traverse(function(V){if(V.material)if(Array.isArray(V.material))V.material.forEach((Q)=>Q.needsUpdate=!0);else V.material.needsUpdate=!0});for(let V=0,Q=k.length;V<Q;V++){let it=k[V],j=it.shadow;if(j===void 0){qt("WebGLShadowMap:",it,"has no shadow.");continue}if(j.autoUpdate===!1&&j.needsUpdate===!1)continue;_.copy(j.mapSize);let xt=j.getFrameExtents();if(_.multiply(xt),x.copy(j.mapSize),_.x>M||_.y>M){if(_.x>M)x.x=Math.floor(M/xt.x),_.x=x.x*xt.x,j.mapSize.x=x.x;if(_.y>M)x.y=Math.floor(M/xt.y),_.y=x.y*xt.y,j.mapSize.y=x.y}let rt=d.state.buffers.depth.getReversed();if(j.camera._reversedDepth=rt,j.map===null||Z===!0){if(j.map!==null){if(j.map.depthTexture!==null)j.map.depthTexture.dispose(),j.map.depthTexture=null;j.map.dispose()}if(this.type===Ns){if(it.isPointLight){qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}j.map=new Dn(_.x,_.y,{format:Ji,type:Zn,minFilter:Tn,magFilter:Tn,generateMipmaps:!1}),j.map.texture.name=it.name+".shadowMap",j.map.depthTexture=new Ni(_.x,_.y,hi),j.map.depthTexture.name=it.name+".shadowMapDepth",j.map.depthTexture.format=Fs,j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=wi,j.map.depthTexture.magFilter=wi}else{if(it.isPointLight)j.map=new ua(_.x),j.map.depthTexture=new Jo(_.x,Ai);else j.map=new Dn(_.x,_.y),j.map.depthTexture=new Ni(_.x,_.y,Ai);if(j.map.depthTexture.name=it.name+".shadowMap",j.map.depthTexture.format=Fs,this.type===xr)j.map.depthTexture.compareFunction=rt?Tc:Ec,j.map.depthTexture.minFilter=Tn,j.map.depthTexture.magFilter=Tn;else j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=wi,j.map.depthTexture.magFilter=wi}j.camera.updateProjectionMatrix()}if(j.map.isWebGLCubeRenderTarget!==!0&&(j.map.width!==_.x||j.map.height!==_.y))j.map.setSize(_.x,_.y);let dt=j.map.isWebGLCubeRenderTarget?6:j.getViewportCount();if(it.isPointLight!==!0)j.updateMatrices(it,F);let _t=(j.camera.layers.mask&4294967294)!==0?j.camera.layers:F.layers;for(let Nt=0;Nt<dt;Nt++){let ot=j.getCamera(Nt);if(it.isPointLight){let{camera:mt,matrix:Rt}=j,Bt=it.distance||mt.far;if(Bt!==mt.far)mt.far=Bt,mt.updateProjectionMatrix();Fr.setFromMatrixPosition(it.matrixWorld),mt.position.copy(Fr),ih.copy(mt.position),ih.add(ay[Nt]),mt.up.copy(ly[Nt]),mt.lookAt(ih),mt.updateMatrixWorld(),Rt.makeTranslation(-Fr.x,-Fr.y,-Fr.z),Nf.multiplyMatrices(mt.projectionMatrix,mt.matrixWorldInverse),j._frustum.setFromProjectionMatrix(Nf,mt.coordinateSystem,mt.reversedDepth)}if(j.map.isWebGLCubeRenderTarget)d.setRenderTarget(j.map,Nt),d.clear();else{if(Nt===0)d.setRenderTarget(j.map),d.clear();let mt=j.getViewport(Nt);v.set(x.x*mt.x,x.y*mt.y,x.x*mt.z,x.y*mt.w),W.viewport(v)}g=j.getFrustum(Nt),L(P,F,ot,it,_t,this.type)}if(j.isPointLightShadow!==!0&&this.type===Ns)I(j,F);j.needsUpdate=!1}R=this.type,A.needsUpdate=!1,d.setRenderTarget(G,H,z)};function I(k,P){let F=p.update(N);if(E.defines.VSM_SAMPLES!==k.blurSamples)E.defines.VSM_SAMPLES=k.blurSamples,w.defines.VSM_SAMPLES=k.blurSamples,E.needsUpdate=!0,w.needsUpdate=!0;if(k.mapPass===null)k.mapPass=new Dn(_.x,_.y,{format:Ji,type:Zn});else if(k.mapPass.width!==k.map.width||k.mapPass.height!==k.map.height)k.mapPass.setSize(k.map.width,k.map.height);E.uniforms.shadow_pass.value=k.map.depthTexture,E.uniforms.resolution.value.set(k.map.width,k.map.height),E.uniforms.radius.value=k.radius,d.setRenderTarget(k.mapPass),d.clear(),d.renderBufferDirect(P,null,F,E,N,null),w.uniforms.shadow_pass.value=k.mapPass.texture,w.uniforms.resolution.value.set(k.map.width,k.map.height),w.uniforms.radius.value=k.radius,d.setRenderTarget(k.map),d.clear(),d.renderBufferDirect(P,null,F,w,N,null)}function U(k,P,F,G){let H=null,z=F.isPointLight===!0?k.customDistanceMaterial:k.customDepthMaterial;if(z!==void 0)H=z;else if(H=F.isPointLight===!0?S:y,d.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let W=H.uuid,Z=P.uuid,V=b[W];if(V===void 0)V={},b[W]=V;let Q=V[Z];if(Q===void 0)Q=H.clone(),V[Z]=Q,P.addEventListener("dispose",D);H=Q}if(H.visible=P.visible,H.wireframe=P.wireframe,G===Ns)H.side=P.shadowSide!==null?P.shadowSide:P.side;else H.side=P.shadowSide!==null?P.shadowSide:T[P.side];if(H.alphaMap=P.alphaMap,H.alphaTest=P.alphaToCoverage===!0?0.5:P.alphaTest,H.map=P.map,H.clipShadows=P.clipShadows,H.clippingPlanes=P.clippingPlanes,H.clipIntersection=P.clipIntersection,H.displacementMap=P.displacementMap,H.displacementScale=P.displacementScale,H.displacementBias=P.displacementBias,H.wireframeLinewidth=P.wireframeLinewidth,H.linewidth=P.linewidth,F.isPointLight===!0&&H.isMeshDistanceMaterial===!0){let W=d.properties.get(H);W.light=F}return H}function L(k,P,F,G,H,z){if(k.visible===!1)return;if(k.layers.test(H)&&(k.isMesh||k.isLine||k.isPoints)){if((k.castShadow||k.receiveShadow&&z===Ns)&&(!k.frustumCulled||k.intersectsFrustum(g))){k.modelViewMatrix.multiplyMatrices(F.matrixWorldInverse,k.matrixWorld);let V=p.update(k),Q=k.material;if(Array.isArray(Q)){let it=V.groups;for(let j=0,xt=it.length;j<xt;j++){let rt=it[j],dt=Q[rt.materialIndex];if(dt&&dt.visible){let _t=U(k,dt,G,z);k.onBeforeShadow(d,k,P,F,V,_t,rt),d.renderBufferDirect(F,null,V,_t,k,rt),k.onAfterShadow(d,k,P,F,V,_t,rt)}}}else if(Q.visible){let it=U(k,Q,G,z);k.onBeforeShadow(d,k,P,F,V,it,null),d.renderBufferDirect(F,null,V,it,k,null),k.onAfterShadow(d,k,P,F,V,it,null)}}}let Z=k.children;for(let V=0,Q=Z.length;V<Q;V++)L(Z[V],P,F,G,H,z)}function D(k){k.target.removeEventListener("dispose",D);for(let F in b){let G=b[F],H=k.target.uuid;if(H in G)G[H].dispose(),delete G[H]}}}function hy(d,p){function m(){let Y=!1,ct=new Oe,lt=null,vt=new Oe(0,0,0,0);return{setMask:function(yt){if(lt!==yt&&!Y)d.colorMask(yt,yt,yt,yt),lt=yt},setLocked:function(yt){Y=yt},setClear:function(yt,wt,Vt,Ht,Ct){if(Ct===!0)yt*=Ht,wt*=Ht,Vt*=Ht;if(ct.set(yt,wt,Vt,Ht),vt.equals(ct)===!1)d.clearColor(yt,wt,Vt,Ht),vt.copy(ct)},reset:function(){Y=!1,lt=null,vt.set(-1,0,0,0)}}}function g(){let Y=!1,ct=!1,lt=null,vt=null,yt=null;return{setReversed:function(wt){if(ct!==wt){let Vt=p.get("EXT_clip_control");if(wt)Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT);else Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);ct=wt;let Ht=yt;yt=null,this.setClear(Ht)}},getReversed:function(){return ct},setTest:function(wt){if(wt)Lt(d.DEPTH_TEST);else ie(d.DEPTH_TEST)},setMask:function(wt){if(lt!==wt&&!Y)d.depthMask(wt),lt=wt},setFunc:function(wt){if(ct)wt=nf[wt];if(vt!==wt){switch(wt){case Rd:d.depthFunc(d.NEVER);break;case Cd:d.depthFunc(d.ALWAYS);break;case Pd:d.depthFunc(d.LESS);break;case Dl:d.depthFunc(d.LEQUAL);break;case Id:d.depthFunc(d.EQUAL);break;case Ld:d.depthFunc(d.GEQUAL);break;case Nd:d.depthFunc(d.GREATER);break;case Dd:d.depthFunc(d.NOTEQUAL);break;default:d.depthFunc(d.LEQUAL)}vt=wt}},setLocked:function(wt){Y=wt},setClear:function(wt){if(yt!==wt){if(yt=wt,ct)wt=1-wt;d.clearDepth(wt)}},reset:function(){Y=!1,lt=null,vt=null,yt=null,ct=!1}}}function _(){let Y=!1,ct=null,lt=null,vt=null,yt=null,wt=null,Vt=null,Ht=null,Ct=null;return{setTest:function(Wt){if(!Y)if(Wt)Lt(d.STENCIL_TEST);else ie(d.STENCIL_TEST)},setMask:function(Wt){if(ct!==Wt&&!Y)d.stencilMask(Wt),ct=Wt},setFunc:function(Wt,oe,Pt){if(lt!==Wt||vt!==oe||yt!==Pt)d.stencilFunc(Wt,oe,Pt),lt=Wt,vt=oe,yt=Pt},setOp:function(Wt,oe,Pt){if(wt!==Wt||Vt!==oe||Ht!==Pt)d.stencilOp(Wt,oe,Pt),wt=Wt,Vt=oe,Ht=Pt},setLocked:function(Wt){Y=Wt},setClear:function(Wt){if(Ct!==Wt)d.clearStencil(Wt),Ct=Wt},reset:function(){Y=!1,ct=null,lt=null,vt=null,yt=null,wt=null,Vt=null,Ht=null,Ct=null}}}let x=new m,v=new g,y=new _,S={},b=new WeakMap,M={},T={},E={},w=new WeakMap,C=[],N=null,A=!1,R=null,I=null,U=null,L=null,D=null,k=null,P=null,F=new re(0,0,0),G=0,H=!1,z=null,W=null,Z=null,V=null,Q=null,it=d.getParameter(d.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,xt=0,rt=d.getParameter(d.VERSION);if(rt.indexOf("WebGL")!==-1)xt=parseFloat(/^WebGL (\d)/.exec(rt)[1]),j=xt>=1;else if(rt.indexOf("OpenGL ES")!==-1)xt=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),j=xt>=2;let dt=null,_t={},Nt=d.getParameter(d.SCISSOR_BOX),ot=d.getParameter(d.VIEWPORT),mt=new Oe().fromArray(Nt),Rt=new Oe().fromArray(ot);function Bt(Y,ct,lt,vt){let yt=new Uint8Array(4),wt=d.createTexture();d.bindTexture(Y,wt),d.texParameteri(Y,d.TEXTURE_MIN_FILTER,d.NEAREST),d.texParameteri(Y,d.TEXTURE_MAG_FILTER,d.NEAREST);for(let Vt=0;Vt<lt;Vt++)if(Y===d.TEXTURE_3D||Y===d.TEXTURE_2D_ARRAY)d.texImage3D(ct,0,d.RGBA,1,1,vt,0,d.RGBA,d.UNSIGNED_BYTE,yt);else d.texImage2D(ct+Vt,0,d.RGBA,1,1,0,d.RGBA,d.UNSIGNED_BYTE,yt);return wt}let kt={};kt[d.TEXTURE_2D]=Bt(d.TEXTURE_2D,d.TEXTURE_2D,1),kt[d.TEXTURE_CUBE_MAP]=Bt(d.TEXTURE_CUBE_MAP,d.TEXTURE_CUBE_MAP_POSITIVE_X,6),kt[d.TEXTURE_2D_ARRAY]=Bt(d.TEXTURE_2D_ARRAY,d.TEXTURE_2D_ARRAY,1,1),kt[d.TEXTURE_3D]=Bt(d.TEXTURE_3D,d.TEXTURE_3D,1,1),x.setClear(0,0,0,1),v.setClear(1),y.setClear(0),Lt(d.DEPTH_TEST),v.setFunc(Dl),Te(!1),le(Pl),Lt(d.CULL_FACE),ae(Zi);function Lt(Y){if(M[Y]!==!0)d.enable(Y),M[Y]=!0}function ie(Y){if(M[Y]!==!1)d.disable(Y),M[Y]=!1}function jt(Y,ct){if(E[Y]!==ct){if(d.bindFramebuffer(Y,ct),E[Y]=ct,Y===d.DRAW_FRAMEBUFFER)E[d.FRAMEBUFFER]=ct;if(Y===d.FRAMEBUFFER)E[d.DRAW_FRAMEBUFFER]=ct;return!0}return!1}function Dt(Y,ct){let lt=C,vt=!1;if(Y){if(lt=w.get(ct),lt===void 0)lt=[],w.set(ct,lt);let yt=Y.textures;if(lt.length!==yt.length||lt[0]!==d.COLOR_ATTACHMENT0){for(let wt=0,Vt=yt.length;wt<Vt;wt++)lt[wt]=d.COLOR_ATTACHMENT0+wt;lt.length=yt.length,vt=!0}}else if(lt[0]!==d.BACK)lt[0]=d.BACK,vt=!0;if(vt)d.drawBuffers(lt)}function Jt(Y){if(N!==Y)return d.useProgram(Y),N=Y,!0;return!1}let Yt={[Ds]:d.FUNC_ADD,[cd]:d.FUNC_SUBTRACT,[hd]:d.FUNC_REVERSE_SUBTRACT};Yt[ud]=d.MIN,Yt[dd]=d.MAX;let Kt={[fd]:d.ZERO,[pd]:d.ONE,[md]:d.SRC_COLOR,[_d]:d.SRC_ALPHA,[Md]:d.SRC_ALPHA_SATURATE,[Sd]:d.DST_COLOR,[vd]:d.DST_ALPHA,[gd]:d.ONE_MINUS_SRC_COLOR,[xd]:d.ONE_MINUS_SRC_ALPHA,[bd]:d.ONE_MINUS_DST_COLOR,[yd]:d.ONE_MINUS_DST_ALPHA,[Ed]:d.CONSTANT_COLOR,[Td]:d.ONE_MINUS_CONSTANT_COLOR,[wd]:d.CONSTANT_ALPHA,[Ad]:d.ONE_MINUS_CONSTANT_ALPHA};function ae(Y,ct,lt,vt,yt,wt,Vt,Ht,Ct,Wt){if(Y===Zi){if(A===!0)ie(d.BLEND),A=!1;return}if(A===!1)Lt(d.BLEND),A=!0;if(Y!==ld){if(Y!==R||Wt!==H){if(I!==Ds||D!==Ds)d.blendEquation(d.FUNC_ADD),I=Ds,D=Ds;if(Wt)switch(Y){case vr:d.blendFuncSeparate(d.ONE,d.ONE_MINUS_SRC_ALPHA,d.ONE,d.ONE_MINUS_SRC_ALPHA);break;case Il:d.blendFunc(d.ONE,d.ONE);break;case Ll:d.blendFuncSeparate(d.ZERO,d.ONE_MINUS_SRC_COLOR,d.ZERO,d.ONE);break;case Nl:d.blendFuncSeparate(d.DST_COLOR,d.ONE_MINUS_SRC_ALPHA,d.ZERO,d.ONE);break;default:Zt("WebGLState: Invalid blending: ",Y);break}else switch(Y){case vr:d.blendFuncSeparate(d.SRC_ALPHA,d.ONE_MINUS_SRC_ALPHA,d.ONE,d.ONE_MINUS_SRC_ALPHA);break;case Il:d.blendFuncSeparate(d.SRC_ALPHA,d.ONE,d.ONE,d.ONE);break;case Ll:Zt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Nl:Zt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Zt("WebGLState: Invalid blending: ",Y);break}U=null,L=null,k=null,P=null,F.set(0,0,0),G=0,R=Y,H=Wt}return}if(yt=yt||ct,wt=wt||lt,Vt=Vt||vt,ct!==I||yt!==D)d.blendEquationSeparate(Yt[ct],Yt[yt]),I=ct,D=yt;if(lt!==U||vt!==L||wt!==k||Vt!==P)d.blendFuncSeparate(Kt[lt],Kt[vt],Kt[wt],Kt[Vt]),U=lt,L=vt,k=wt,P=Vt;if(Ht.equals(F)===!1||Ct!==G)d.blendColor(Ht.r,Ht.g,Ht.b,Ct),F.copy(Ht),G=Ct;R=Y,H=!1}function me(Y,ct){Y.side===Ln?ie(d.CULL_FACE):Lt(d.CULL_FACE);let lt=Y.side===mn;if(ct)lt=!lt;Te(lt),Y.blending===vr&&Y.transparent===!1?ae(Zi):ae(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),v.setFunc(Y.depthFunc),v.setTest(Y.depthTest),v.setMask(Y.depthWrite),x.setMask(Y.colorWrite);let vt=Y.stencilWrite;if(y.setTest(vt),vt)y.setMask(Y.stencilWriteMask),y.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),y.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass);Be(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?Lt(d.SAMPLE_ALPHA_TO_COVERAGE):ie(d.SAMPLE_ALPHA_TO_COVERAGE)}function Te(Y){if(z!==Y){if(Y)d.frontFace(d.CW);else d.frontFace(d.CCW);z=Y}}function le(Y){if(Y!==rd){if(Lt(d.CULL_FACE),Y!==W)if(Y===Pl)d.cullFace(d.BACK);else if(Y===od)d.cullFace(d.FRONT);else d.cullFace(d.FRONT_AND_BACK)}else ie(d.CULL_FACE);W=Y}function de(Y){if(Y!==Z){if(j)d.lineWidth(Y);Z=Y}}function Be(Y,ct,lt){if(Y){if(Lt(d.POLYGON_OFFSET_FILL),V!==ct||Q!==lt){if(V=ct,Q=lt,v.getReversed())ct=-ct,lt=-lt;d.polygonOffset(ct,lt)}}else ie(d.POLYGON_OFFSET_FILL)}function ke(Y){if(Y)Lt(d.SCISSOR_TEST);else ie(d.SCISSOR_TEST)}function en(Y){if(Y===void 0)Y=d.TEXTURE0+it-1;if(dt!==Y)d.activeTexture(Y),dt=Y}function K(Y,ct,lt){if(lt===void 0)if(dt===null)lt=d.TEXTURE0+it-1;else lt=dt;let vt=_t[lt];if(vt===void 0)vt={type:void 0,texture:void 0},_t[lt]=vt;if(vt.type!==Y||vt.texture!==ct){if(dt!==lt)d.activeTexture(lt),dt=lt;d.bindTexture(Y,ct||kt[Y]),vt.type=Y,vt.texture=ct}}function nn(){let Y=_t[dt];if(Y!==void 0&&Y.type!==void 0)d.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0}function ht(){try{d.compressedTexImage2D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function Gt(){try{d.compressedTexImage3D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function pt(){try{d.texSubImage2D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function _e(){try{d.texSubImage3D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function Xt(){try{d.compressedTexSubImage2D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function te(){try{d.compressedTexSubImage3D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function ln(){try{d.texStorage2D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function X(){try{d.texStorage3D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function O(){try{d.texImage2D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function tt(){try{d.texImage3D(...arguments)}catch(Y){Zt("WebGLState:",Y)}}function gt(Y){if(T[Y]!==void 0)return T[Y];else return d.getParameter(Y)}function ft(Y,ct){if(T[Y]!==ct)d.pixelStorei(Y,ct),T[Y]=ct}function St(Y){if(mt.equals(Y)===!1)d.scissor(Y.x,Y.y,Y.z,Y.w),mt.copy(Y)}function Et(Y){if(Rt.equals(Y)===!1)d.viewport(Y.x,Y.y,Y.z,Y.w),Rt.copy(Y)}function at(Y,ct){let lt=b.get(ct);if(lt===void 0)lt=new WeakMap,b.set(ct,lt);let vt=lt.get(Y);if(vt===void 0)vt=d.getUniformBlockIndex(ct,Y.name),d.uniformBlockBinding(ct,vt,vt),lt.set(Y,vt)}function ut(Y,ct,lt){let yt=b.get(ct).get(Y);if(S[yt]!==lt)d.bindBufferBase(d.UNIFORM_BUFFER,yt,lt),S[yt]=lt}function bt(){d.disable(d.BLEND),d.disable(d.CULL_FACE),d.disable(d.DEPTH_TEST),d.disable(d.POLYGON_OFFSET_FILL),d.disable(d.SCISSOR_TEST),d.disable(d.STENCIL_TEST),d.disable(d.SAMPLE_ALPHA_TO_COVERAGE),d.blendEquation(d.FUNC_ADD),d.blendFunc(d.ONE,d.ZERO),d.blendFuncSeparate(d.ONE,d.ZERO,d.ONE,d.ZERO),d.blendColor(0,0,0,0),d.colorMask(!0,!0,!0,!0),d.clearColor(0,0,0,0),d.depthMask(!0),d.depthFunc(d.LESS),v.setReversed(!1),d.clearDepth(1),d.stencilMask(4294967295),d.stencilFunc(d.ALWAYS,0,4294967295),d.stencilOp(d.KEEP,d.KEEP,d.KEEP),d.clearStencil(0),d.cullFace(d.BACK),d.frontFace(d.CCW),d.polygonOffset(0,0),d.activeTexture(d.TEXTURE0),d.bindFramebuffer(d.FRAMEBUFFER,null),d.bindFramebuffer(d.DRAW_FRAMEBUFFER,null),d.bindFramebuffer(d.READ_FRAMEBUFFER,null),d.useProgram(null),d.lineWidth(1),d.scissor(0,0,d.canvas.width,d.canvas.height),d.viewport(0,0,d.canvas.width,d.canvas.height),d.pixelStorei(d.PACK_ALIGNMENT,4),d.pixelStorei(d.UNPACK_ALIGNMENT,4),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,!1),d.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),d.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,d.BROWSER_DEFAULT_WEBGL),d.pixelStorei(d.PACK_ROW_LENGTH,0),d.pixelStorei(d.PACK_SKIP_PIXELS,0),d.pixelStorei(d.PACK_SKIP_ROWS,0),d.pixelStorei(d.UNPACK_ROW_LENGTH,0),d.pixelStorei(d.UNPACK_IMAGE_HEIGHT,0),d.pixelStorei(d.UNPACK_SKIP_PIXELS,0),d.pixelStorei(d.UNPACK_SKIP_ROWS,0),d.pixelStorei(d.UNPACK_SKIP_IMAGES,0),M={},T={},dt=null,_t={},E={},S={},w=new WeakMap,C=[],N=null,A=!1,R=null,I=null,U=null,L=null,D=null,k=null,P=null,F=new re(0,0,0),G=0,H=!1,z=null,W=null,Z=null,V=null,Q=null,mt.set(0,0,d.canvas.width,d.canvas.height),Rt.set(0,0,d.canvas.width,d.canvas.height),x.reset(),v.reset(),y.reset()}return{buffers:{color:x,depth:v,stencil:y},enable:Lt,disable:ie,bindFramebuffer:jt,drawBuffers:Dt,useProgram:Jt,setBlending:ae,setMaterial:me,setFlipSided:Te,setCullFace:le,setLineWidth:de,setPolygonOffset:Be,setScissorTest:ke,activeTexture:en,bindTexture:K,unbindTexture:nn,compressedTexImage2D:ht,compressedTexImage3D:Gt,texImage2D:O,texImage3D:tt,pixelStorei:ft,getParameter:gt,updateUBOMapping:at,uniformBlockBinding:ut,texStorage2D:ln,texStorage3D:X,texSubImage2D:pt,texSubImage3D:_e,compressedTexSubImage2D:Xt,compressedTexSubImage3D:te,scissor:St,viewport:Et,reset:bt}}function uy(d,p,m,g,_,x,v){let y=p.has("WEBGL_multisampled_render_to_texture")?p.get("WEBGL_multisampled_render_to_texture"):null,S=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),b=new $t,M=new WeakMap,T=new Set,E,w=new WeakMap,C=new Set,N=new FinalizationRegistry((X)=>C.delete(X)),A=!1;try{A=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(X){}function R(X,O){return A?new OffscreenCanvas(X,O):gr("canvas")}function I(X,O,tt){let gt=1,ft=ln(X);if(ft.width>tt||ft.height>tt)gt=tt/Math.max(ft.width,ft.height);if(gt<1)if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&X instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&X instanceof ImageBitmap||typeof VideoFrame<"u"&&X instanceof VideoFrame){let St=Math.floor(gt*ft.width),Et=Math.floor(gt*ft.height);if(E===void 0)E=R(St,Et);let at=O?R(St,Et):E;return at.width=St,at.height=Et,at.getContext("2d").drawImage(X,0,0,St,Et),qt("WebGLRenderer: Texture has been resized from ("+ft.width+"x"+ft.height+") to ("+St+"x"+Et+")."),at}else{if("data"in X)qt("WebGLRenderer: Image in DataTexture is too big ("+ft.width+"x"+ft.height+").");return X}return X}function U(X){return X.generateMipmaps}function L(X){d.generateMipmap(X)}function D(X){if(X.isWebGLCubeRenderTarget)return d.TEXTURE_CUBE_MAP;if(X.isWebGL3DRenderTarget)return d.TEXTURE_3D;if(X.isWebGLArrayRenderTarget||X.isCompressedArrayTexture)return d.TEXTURE_2D_ARRAY;return d.TEXTURE_2D}function k(X,O,tt,gt,ft,St=!1){if(X!==null){if(d[X]!==void 0)return d[X];qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+X+"'")}let Et;if(gt){if(Et=p.get("EXT_texture_norm16"),!Et)qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let at=O;if(O===d.RED){if(tt===d.FLOAT)at=d.R32F;if(tt===d.HALF_FLOAT)at=d.R16F;if(tt===d.UNSIGNED_BYTE)at=d.R8;if(tt===d.UNSIGNED_SHORT&&Et)at=Et.R16_EXT;if(tt===d.SHORT&&Et)at=Et.R16_SNORM_EXT}if(O===d.RED_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.R8UI;if(tt===d.UNSIGNED_SHORT)at=d.R16UI;if(tt===d.UNSIGNED_INT)at=d.R32UI;if(tt===d.BYTE)at=d.R8I;if(tt===d.SHORT)at=d.R16I;if(tt===d.INT)at=d.R32I}if(O===d.RG){if(tt===d.FLOAT)at=d.RG32F;if(tt===d.HALF_FLOAT)at=d.RG16F;if(tt===d.UNSIGNED_BYTE)at=d.RG8;if(tt===d.UNSIGNED_SHORT&&Et)at=Et.RG16_EXT;if(tt===d.SHORT&&Et)at=Et.RG16_SNORM_EXT}if(O===d.RG_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RG8UI;if(tt===d.UNSIGNED_SHORT)at=d.RG16UI;if(tt===d.UNSIGNED_INT)at=d.RG32UI;if(tt===d.BYTE)at=d.RG8I;if(tt===d.SHORT)at=d.RG16I;if(tt===d.INT)at=d.RG32I}if(O===d.RGB_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RGB8UI;if(tt===d.UNSIGNED_SHORT)at=d.RGB16UI;if(tt===d.UNSIGNED_INT)at=d.RGB32UI;if(tt===d.BYTE)at=d.RGB8I;if(tt===d.SHORT)at=d.RGB16I;if(tt===d.INT)at=d.RGB32I}if(O===d.RGBA_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RGBA8UI;if(tt===d.UNSIGNED_SHORT)at=d.RGBA16UI;if(tt===d.UNSIGNED_INT)at=d.RGBA32UI;if(tt===d.BYTE)at=d.RGBA8I;if(tt===d.SHORT)at=d.RGBA16I;if(tt===d.INT)at=d.RGBA32I}if(O===d.RGB){if(tt===d.UNSIGNED_SHORT&&Et)at=Et.RGB16_EXT;if(tt===d.SHORT&&Et)at=Et.RGB16_SNORM_EXT;if(tt===d.UNSIGNED_INT_5_9_9_9_REV)at=d.RGB9_E5;if(tt===d.UNSIGNED_INT_10F_11F_11F_REV)at=d.R11F_G11F_B10F}if(O===d.RGBA){let ut=St?Mc:he.getTransfer(ft);if(tt===d.FLOAT)at=d.RGBA32F;if(tt===d.HALF_FLOAT)at=d.RGBA16F;if(tt===d.UNSIGNED_BYTE)at=ut===Ie?d.SRGB8_ALPHA8:d.RGBA8;if(tt===d.UNSIGNED_SHORT&&Et)at=Et.RGBA16_EXT;if(tt===d.SHORT&&Et)at=Et.RGBA16_SNORM_EXT;if(tt===d.UNSIGNED_SHORT_4_4_4_4)at=d.RGBA4;if(tt===d.UNSIGNED_SHORT_5_5_5_1)at=d.RGB5_A1}if(at===d.R16F||at===d.R32F||at===d.RG16F||at===d.RG32F||at===d.RGBA16F||at===d.RGBA32F)p.get("EXT_color_buffer_float");return at}function P(X,O){let tt;if(X){if(O===null||O===Ai||O===$i)tt=d.DEPTH24_STENCIL8;else if(O===hi)tt=d.DEPTH32F_STENCIL8;else if(O===br)tt=d.DEPTH24_STENCIL8,qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(O===null||O===Ai||O===$i)tt=d.DEPTH_COMPONENT24;else if(O===hi)tt=d.DEPTH_COMPONENT32F;else if(O===br)tt=d.DEPTH_COMPONENT16;return tt}function F(X,O){if(U(X)===!0||X.isFramebufferTexture&&X.minFilter!==wi&&X.minFilter!==Tn)return Math.log2(Math.max(O.width,O.height))+1;else if(X.mipmaps.length>0)return X.mipmaps.length;else if(X.isCompressedTexture&&Array.isArray(X.image))return O.mipmaps.length;else return 1}function G(X){let O=new WeakRef(X);g.get(X).__ref=O,C.add(O),N.register(X,O,O)}function H(X){let O=g.get(X).__ref;if(O===void 0)return;C.delete(O),N.unregister(O)}function z(X){Z(X.target)}function W(X){V(X.target)}function Z(X){if(X.removeEventListener("dispose",z),H(X),it(X),X.isVideoTexture)M.delete(X);if(X.isHTMLTexture)T.delete(X)}function V(X){X.removeEventListener("dispose",W),H(X),xt(X)}function Q(){for(let X of C){let O=X.deref();if(O===void 0)continue;if(O.isRenderTarget===!0)V(O);else Z(O)}C.clear(),T.clear()}function it(X){let O=g.get(X);if(O.__webglInit===void 0)return;let tt=X.source,gt=w.get(tt);if(gt){let ft=gt[O.__cacheKey];if(ft.usedTimes--,ft.usedTimes===0)j(X);if(Object.keys(gt).length===0)w.delete(tt)}g.remove(X)}function j(X){let O=g.get(X);d.deleteTexture(O.__webglTexture);let tt=X.source,gt=w.get(tt);delete gt[O.__cacheKey],v.memory.textures--}function xt(X){let O=g.get(X);if(O.__depthDisposeCallback)O.__depthDisposeCallback();let tt=X.depthTexture;if(tt&&tt.renderTarget===X)Z(tt);if(X.isWebGLCubeRenderTarget)for(let ft=0;ft<6;ft++){if(Array.isArray(O.__webglFramebuffer[ft]))for(let St=0;St<O.__webglFramebuffer[ft].length;St++)d.deleteFramebuffer(O.__webglFramebuffer[ft][St]);else d.deleteFramebuffer(O.__webglFramebuffer[ft]);if(O.__webglDepthbuffer)d.deleteRenderbuffer(O.__webglDepthbuffer[ft])}else{if(Array.isArray(O.__webglFramebuffer))for(let ft=0;ft<O.__webglFramebuffer.length;ft++)d.deleteFramebuffer(O.__webglFramebuffer[ft]);else d.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer)d.deleteRenderbuffer(O.__webglDepthbuffer);if(O.__webglMultisampledFramebuffer)d.deleteFramebuffer(O.__webglMultisampledFramebuffer);if(O.__webglColorRenderbuffer){for(let ft=0;ft<O.__webglColorRenderbuffer.length;ft++)if(O.__webglColorRenderbuffer[ft])d.deleteRenderbuffer(O.__webglColorRenderbuffer[ft])}if(O.__webglDepthRenderbuffer)d.deleteRenderbuffer(O.__webglDepthRenderbuffer)}let gt=X.textures;for(let ft=0,St=gt.length;ft<St;ft++){let Et=g.get(gt[ft]);if(Et.__webglTexture)d.deleteTexture(Et.__webglTexture),v.memory.textures--;g.remove(gt[ft])}g.remove(X)}let rt=0;function dt(){rt=0}function _t(){return rt}function Nt(X){rt=X}function ot(){let X=rt;if(X>=_.maxTextures)qt("WebGLTextures: Trying to use "+(X+1)+" texture units while this GPU supports only "+_.maxTextures);return rt+=1,X}function mt(X){let O=[];return O.push(X.wrapS),O.push(X.wrapT),O.push(X.wrapR||0),O.push(X.magFilter),O.push(X.minFilter),O.push(X.anisotropy),O.push(X.internalFormat),O.push(X.format),O.push(X.type),O.push(X.generateMipmaps),O.push(X.mipmapsAutoUpdate),O.push(X.premultiplyAlpha),O.push(X.flipY),O.push(X.unpackAlignment),O.push(X.colorSpace),O.join()}function Rt(X,O){let tt=g.get(X);if(X.isVideoTexture)Xt(X);if(X.isRenderTargetTexture===!1&&X.isExternalTexture!==!0&&X.version>0&&tt.__version!==X.version){let gt=X.image;if(gt===null)qt("WebGLRenderer: Texture marked for update but no image data found.");else if(gt.complete===!1)qt("WebGLRenderer: Texture marked for update but image is incomplete");else{me(tt,X,O);return}}else if(X.isExternalTexture)tt.__webglTexture=X.sourceTexture?X.sourceTexture:null;m.bindTexture(d.TEXTURE_2D,tt.__webglTexture,d.TEXTURE0+O)}function Bt(X,O){let tt=g.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&tt.__version!==X.version){me(tt,X,O);return}else if(X.isExternalTexture)tt.__webglTexture=X.sourceTexture?X.sourceTexture:null;m.bindTexture(d.TEXTURE_2D_ARRAY,tt.__webglTexture,d.TEXTURE0+O)}function kt(X,O){let tt=g.get(X);if(X.isRenderTargetTexture===!1&&X.version>0&&tt.__version!==X.version){me(tt,X,O);return}m.bindTexture(d.TEXTURE_3D,tt.__webglTexture,d.TEXTURE0+O)}function Lt(X,O){let tt=g.get(X);if(X.version>0&&tt.__version!==X.version){Te(tt,X,O);return}m.bindTexture(d.TEXTURE_CUBE_MAP,tt.__webglTexture,d.TEXTURE0+O)}let ie={[Do]:d.REPEAT,[Uo]:d.CLAMP_TO_EDGE,[Bd]:d.MIRRORED_REPEAT},jt={[wi]:d.NEAREST,[kd]:d.NEAREST_MIPMAP_NEAREST,[Sr]:d.NEAREST_MIPMAP_LINEAR,[Tn]:d.LINEAR,[Fo]:d.LINEAR_MIPMAP_NEAREST,[Hn]:d.LINEAR_MIPMAP_LINEAR},Dt={[Zd]:d.NEVER,[wc]:d.ALWAYS,[$d]:d.LESS,[Ec]:d.LEQUAL,[Jd]:d.EQUAL,[Tc]:d.GEQUAL,[Kd]:d.GREATER,[jd]:d.NOTEQUAL};function Jt(X,O){if(O.type===hi&&p.has("OES_texture_float_linear")===!1&&(O.magFilter===Tn||O.magFilter===Fo||O.magFilter===Sr||O.magFilter===Hn||O.minFilter===Tn||O.minFilter===Fo||O.minFilter===Sr||O.minFilter===Hn))qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(d.texParameteri(X,d.TEXTURE_WRAP_S,ie[O.wrapS]),d.texParameteri(X,d.TEXTURE_WRAP_T,ie[O.wrapT]),X===d.TEXTURE_3D||X===d.TEXTURE_2D_ARRAY)d.texParameteri(X,d.TEXTURE_WRAP_R,ie[O.wrapR]);if(d.texParameteri(X,d.TEXTURE_MAG_FILTER,jt[O.magFilter]),d.texParameteri(X,d.TEXTURE_MIN_FILTER,jt[O.minFilter]),O.compareFunction)d.texParameteri(X,d.TEXTURE_COMPARE_MODE,d.COMPARE_REF_TO_TEXTURE),d.texParameteri(X,d.TEXTURE_COMPARE_FUNC,Dt[O.compareFunction]);if(p.has("EXT_texture_filter_anisotropic")===!0){if(O.magFilter===wi)return;if(O.minFilter!==Sr&&O.minFilter!==Hn)return;if(O.type===hi&&p.has("OES_texture_float_linear")===!1)return;if(O.anisotropy>1||g.get(O).__currentAnisotropy){let tt=p.get("EXT_texture_filter_anisotropic");d.texParameterf(X,tt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(O.anisotropy,_.getMaxAnisotropy())),g.get(O).__currentAnisotropy=O.anisotropy}}}function Yt(X,O){let tt=!1;if(X.__webglInit===void 0)X.__webglInit=!0,O.addEventListener("dispose",z),G(O);let gt=O.source,ft=w.get(gt);if(ft===void 0)ft={},w.set(gt,ft);let St=mt(O);if(St!==X.__cacheKey){if(ft[St]===void 0)ft[St]={texture:d.createTexture(),usedTimes:0},v.memory.textures++,tt=!0;ft[St].usedTimes++;let Et=ft[X.__cacheKey];if(Et!==void 0){if(ft[X.__cacheKey].usedTimes--,Et.usedTimes===0)j(O)}X.__cacheKey=St,X.__webglTexture=ft[St].texture}return tt}function Kt(X,O,tt){return Math.floor(Math.floor(X/tt)/O)}function ae(X,O,tt,gt){let St=X.updateRanges;if(St.length===0)m.texSubImage2D(d.TEXTURE_2D,0,0,0,O.width,O.height,tt,gt,O.data);else{St.sort((Y,ct)=>Y.start-ct.start);let Et=0;for(let Y=1;Y<St.length;Y++){let ct=St[Et],lt=St[Y],vt=ct.start+ct.count,yt=Kt(lt.start,O.width,4),wt=Kt(ct.start,O.width,4);if(lt.start<=vt+1&&yt===wt&&Kt(lt.start+lt.count-1,O.width,4)===yt)ct.count=Math.max(ct.count,lt.start+lt.count-ct.start);else++Et,St[Et]=lt}St.length=Et+1;let at=m.getParameter(d.UNPACK_ROW_LENGTH),ut=m.getParameter(d.UNPACK_SKIP_PIXELS),bt=m.getParameter(d.UNPACK_SKIP_ROWS);m.pixelStorei(d.UNPACK_ROW_LENGTH,O.width);for(let Y=0,ct=St.length;Y<ct;Y++){let lt=St[Y],vt=Math.floor(lt.start/4),yt=Math.ceil(lt.count/4),wt=vt%O.width,Vt=Math.floor(vt/O.width),Ht=yt,Ct=1;m.pixelStorei(d.UNPACK_SKIP_PIXELS,wt),m.pixelStorei(d.UNPACK_SKIP_ROWS,Vt),m.texSubImage2D(d.TEXTURE_2D,0,wt,Vt,Ht,1,tt,gt,O.data)}X.clearUpdateRanges(),m.pixelStorei(d.UNPACK_ROW_LENGTH,at),m.pixelStorei(d.UNPACK_SKIP_PIXELS,ut),m.pixelStorei(d.UNPACK_SKIP_ROWS,bt)}}function me(X,O,tt){let gt=d.TEXTURE_2D;if(O.isDataArrayTexture||O.isCompressedArrayTexture)gt=d.TEXTURE_2D_ARRAY;if(O.isData3DTexture)gt=d.TEXTURE_3D;let ft=Yt(X,O),St=O.source;m.bindTexture(gt,X.__webglTexture,d.TEXTURE0+tt);let Et=g.get(St);if(St.version!==Et.__version||ft===!0){if(m.activeTexture(d.TEXTURE0+tt),(typeof ImageBitmap<"u"&&O.image instanceof ImageBitmap)===!1){let Ct=he.getPrimaries(he.workingColorSpace),Wt=O.colorSpace===Ki?null:he.getPrimaries(O.colorSpace),oe=O.colorSpace===Ki||Ct===Wt?d.NONE:d.BROWSER_DEFAULT_WEBGL;m.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,O.flipY),m.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),m.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,oe)}m.pixelStorei(d.UNPACK_ALIGNMENT,O.unpackAlignment);let ut=I(O.image,!1,_.maxTextureSize);ut=te(O,ut);let bt=x.convert(O.format,O.colorSpace),Y=x.convert(O.type),ct=k(O.internalFormat,bt,Y,O.normalized,O.colorSpace,O.isVideoTexture);Jt(gt,O);let lt,vt=O.mipmaps,yt=O.isVideoTexture!==!0,wt=Et.__version===void 0||ft===!0,Vt=St.dataReady,Ht=F(O,ut);if(O.isDepthTexture){if(ct=P(O.format===Ri,O.type),wt)if(yt)m.texStorage2D(d.TEXTURE_2D,1,ct,ut.width,ut.height);else m.texImage2D(d.TEXTURE_2D,0,ct,ut.width,ut.height,0,bt,Y,null)}else if(O.isDataTexture)if(vt.length>0){if(yt&&wt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,vt[0].width,vt[0].height);for(let Ct=0,Wt=vt.length;Ct<Wt;Ct++)if(lt=vt[Ct],yt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,Ct,0,0,lt.width,lt.height,bt,Y,lt.data)}else m.texImage2D(d.TEXTURE_2D,Ct,ct,lt.width,lt.height,0,bt,Y,lt.data);O.generateMipmaps=!1}else if(yt){if(wt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,ut.width,ut.height);if(Vt)ae(O,ut,bt,Y)}else m.texImage2D(d.TEXTURE_2D,0,ct,ut.width,ut.height,0,bt,Y,ut.data);else if(O.isCompressedTexture)if(O.isCompressedArrayTexture){if(yt&&wt)m.texStorage3D(d.TEXTURE_2D_ARRAY,Ht,ct,vt[0].width,vt[0].height,ut.depth);for(let Ct=0,Wt=vt.length;Ct<Wt;Ct++)if(lt=vt[Ct],O.format!==Nn)if(bt!==null)if(yt){if(Vt)if(O.layerUpdates.size>0){let oe=eh(lt.width,lt.height,O.format,O.type);for(let Pt of O.layerUpdates){let Ae=lt.data.subarray(Pt*oe/lt.data.BYTES_PER_ELEMENT,(Pt+1)*oe/lt.data.BYTES_PER_ELEMENT);m.compressedTexSubImage3D(d.TEXTURE_2D_ARRAY,Ct,0,0,Pt,lt.width,lt.height,1,bt,Ae)}}else m.compressedTexSubImage3D(d.TEXTURE_2D_ARRAY,Ct,0,0,0,lt.width,lt.height,ut.depth,bt,lt.data)}else m.compressedTexImage3D(d.TEXTURE_2D_ARRAY,Ct,ct,lt.width,lt.height,ut.depth,0,lt.data,0,0);else qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(yt){if(Vt)m.texSubImage3D(d.TEXTURE_2D_ARRAY,Ct,0,0,0,lt.width,lt.height,ut.depth,bt,Y,lt.data)}else m.texImage3D(d.TEXTURE_2D_ARRAY,Ct,ct,lt.width,lt.height,ut.depth,0,bt,Y,lt.data);if(O.layerUpdates.size>0)O.clearLayerUpdates()}else{if(yt&&wt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,vt[0].width,vt[0].height);for(let Ct=0,Wt=vt.length;Ct<Wt;Ct++)if(lt=vt[Ct],O.format!==Nn)if(bt!==null)if(yt){if(Vt)m.compressedTexSubImage2D(d.TEXTURE_2D,Ct,0,0,lt.width,lt.height,bt,lt.data)}else m.compressedTexImage2D(d.TEXTURE_2D,Ct,ct,lt.width,lt.height,0,lt.data);else qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(yt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,Ct,0,0,lt.width,lt.height,bt,Y,lt.data)}else m.texImage2D(d.TEXTURE_2D,Ct,ct,lt.width,lt.height,0,bt,Y,lt.data)}else if(O.isDataArrayTexture)if(yt){if(wt)m.texStorage3D(d.TEXTURE_2D_ARRAY,Ht,ct,ut.width,ut.height,ut.depth);if(Vt)if(O.layerUpdates.size>0){let Ct=eh(ut.width,ut.height,O.format,O.type);for(let Wt of O.layerUpdates){let oe=ut.data.subarray(Wt*Ct/ut.data.BYTES_PER_ELEMENT,(Wt+1)*Ct/ut.data.BYTES_PER_ELEMENT);m.texSubImage3D(d.TEXTURE_2D_ARRAY,0,0,0,Wt,ut.width,ut.height,1,bt,Y,oe)}O.clearLayerUpdates()}else m.texSubImage3D(d.TEXTURE_2D_ARRAY,0,0,0,0,ut.width,ut.height,ut.depth,bt,Y,ut.data)}else m.texImage3D(d.TEXTURE_2D_ARRAY,0,ct,ut.width,ut.height,ut.depth,0,bt,Y,ut.data);else if(O.isData3DTexture)if(yt){if(wt)m.texStorage3D(d.TEXTURE_3D,Ht,ct,ut.width,ut.height,ut.depth);if(Vt)m.texSubImage3D(d.TEXTURE_3D,0,0,0,0,ut.width,ut.height,ut.depth,bt,Y,ut.data)}else m.texImage3D(d.TEXTURE_3D,0,ct,ut.width,ut.height,ut.depth,0,bt,Y,ut.data);else if(O.isFramebufferTexture){if(wt)if(yt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,ut.width,ut.height);else{let Ct=ut.width,Wt=ut.height;for(let oe=0;oe<Ht;oe++)m.texImage2D(d.TEXTURE_2D,oe,ct,Ct,Wt,0,bt,Y,null),Ct>>=1,Wt>>=1}}else if(O.isHTMLTexture){if("texElementImage2D"in d){let Ct=d.canvas;if(!Ct.hasAttribute("layoutsubtree"))Ct.setAttribute("layoutsubtree","true");if(ut.parentNode!==Ct){Ct.appendChild(ut),T.add(O),Ct.onpaint=(Wt)=>{let oe=Wt.changedElements;for(let Pt of T)if(oe.includes(Pt.image))Pt.needsUpdate=!0},Ct.requestPaint();return}if(d.texElementImage2D.length===3)d.texElementImage2D(d.TEXTURE_2D,d.RGBA8,ut);else{let{RGBA:oe,RGBA:Pt,UNSIGNED_BYTE:Ae}=d;d.texElementImage2D(d.TEXTURE_2D,0,oe,Pt,Ae,ut)}d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE)}}else if(vt.length>0){if(yt&&wt){let Ct=ln(vt[0]);m.texStorage2D(d.TEXTURE_2D,Ht,ct,Ct.width,Ct.height)}for(let Ct=0,Wt=vt.length;Ct<Wt;Ct++)if(lt=vt[Ct],yt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,Ct,0,0,bt,Y,lt)}else m.texImage2D(d.TEXTURE_2D,Ct,ct,bt,Y,lt);O.generateMipmaps=!1}else if(yt){if(wt){let Ct=ln(ut);m.texStorage2D(d.TEXTURE_2D,Ht,ct,Ct.width,Ct.height)}if(Vt)m.texSubImage2D(d.TEXTURE_2D,0,0,0,bt,Y,ut)}else m.texImage2D(d.TEXTURE_2D,0,ct,bt,Y,ut);if(U(O)&&O.mipmapsAutoUpdate===!0)L(gt);if(Et.__version=St.version,O.onUpdate)O.onUpdate(O)}X.__version=O.version}function Te(X,O,tt){if(O.image.length!==6)return;let gt=Yt(X,O),ft=O.source;m.bindTexture(d.TEXTURE_CUBE_MAP,X.__webglTexture,d.TEXTURE0+tt);let St=g.get(ft);if(ft.version!==St.__version||gt===!0){m.activeTexture(d.TEXTURE0+tt);let Et=he.getPrimaries(he.workingColorSpace),at=O.colorSpace===Ki?null:he.getPrimaries(O.colorSpace),ut=O.colorSpace===Ki||Et===at?d.NONE:d.BROWSER_DEFAULT_WEBGL;m.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,O.flipY),m.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),m.pixelStorei(d.UNPACK_ALIGNMENT,O.unpackAlignment),m.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,ut);let bt=O.isCompressedTexture||O.image[0].isCompressedTexture,Y=O.image[0]&&O.image[0].isDataTexture,ct=[];for(let Pt=0;Pt<6;Pt++){if(!bt&&!Y)ct[Pt]=I(O.image[Pt],!0,_.maxCubemapSize);else ct[Pt]=Y?O.image[Pt].image:O.image[Pt];ct[Pt]=te(O,ct[Pt])}let lt=ct[0],vt=x.convert(O.format,O.colorSpace),yt=x.convert(O.type),wt=k(O.internalFormat,vt,yt,O.normalized,O.colorSpace),Vt=O.isVideoTexture!==!0,Ht=St.__version===void 0||gt===!0,Ct=ft.dataReady,Wt=F(O,lt);Jt(d.TEXTURE_CUBE_MAP,O);let oe;if(O.isDepthTexture){if(wt=P(O.format===Ri,O.type),Ht)if(Vt)m.texStorage2D(d.TEXTURE_CUBE_MAP,1,wt,lt.width,lt.height);else for(let Pt=0;Pt<6;Pt++)m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,wt,lt.width,lt.height,0,vt,yt,null)}else if(bt){if(Vt&&Ht)m.texStorage2D(d.TEXTURE_CUBE_MAP,Wt,wt,lt.width,lt.height);for(let Pt=0;Pt<6;Pt++){oe=ct[Pt].mipmaps;for(let Ae=0;Ae<oe.length;Ae++){let Je=oe[Ae];if(O.format!==Nn)if(vt!==null)if(Vt){if(Ct)m.compressedTexSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae,0,0,Je.width,Je.height,vt,Je.data)}else m.compressedTexImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae,wt,Je.width,Je.height,0,Je.data);else qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Vt){if(Ct)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae,0,0,Je.width,Je.height,vt,yt,Je.data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae,wt,Je.width,Je.height,0,vt,yt,Je.data)}}}else{if(oe=O.mipmaps,Vt&&Ht){if(oe.length>0)Wt++;let Pt=ln(ct[0]);m.texStorage2D(d.TEXTURE_CUBE_MAP,Wt,wt,Pt.width,Pt.height)}for(let Pt=0;Pt<6;Pt++)if(Y){if(Vt){if(Ct)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,ct[Pt].width,ct[Pt].height,vt,yt,ct[Pt].data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,wt,ct[Pt].width,ct[Pt].height,0,vt,yt,ct[Pt].data);for(let Ae=0;Ae<oe.length;Ae++){let Qn=oe[Ae].image[Pt].image;if(Vt){if(Ct)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae+1,0,0,Qn.width,Qn.height,vt,yt,Qn.data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae+1,wt,Qn.width,Qn.height,0,vt,yt,Qn.data)}}else{if(Vt){if(Ct)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,vt,yt,ct[Pt])}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,wt,vt,yt,ct[Pt]);for(let Ae=0;Ae<oe.length;Ae++){let Je=oe[Ae];if(Vt){if(Ct)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae+1,0,0,vt,yt,Je.image[Pt])}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Ae+1,wt,vt,yt,Je.image[Pt])}}}if(U(O)&&O.mipmapsAutoUpdate===!0)L(d.TEXTURE_CUBE_MAP);if(St.__version=ft.version,O.onUpdate)O.onUpdate(O)}X.__version=O.version}function le(X,O,tt,gt,ft,St){let Et=x.convert(tt.format,tt.colorSpace),at=x.convert(tt.type),ut=k(tt.internalFormat,Et,at,tt.normalized,tt.colorSpace),bt=g.get(O),Y=g.get(tt);if(Y.__renderTarget=O,!bt.__hasExternalTextures){let ct=Math.max(1,O.width>>St),lt=Math.max(1,O.height>>St);if(ft===d.TEXTURE_3D||ft===d.TEXTURE_2D_ARRAY)m.texImage3D(ft,St,ut,ct,lt,O.depth,0,Et,at,null);else m.texImage2D(ft,St,ut,ct,lt,0,Et,at,null)}if(m.bindFramebuffer(d.FRAMEBUFFER,X),_e(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,gt,ft,Y.__webglTexture,0,pt(O));else if(ft===d.TEXTURE_2D||ft>=d.TEXTURE_CUBE_MAP_POSITIVE_X&&ft<=d.TEXTURE_CUBE_MAP_NEGATIVE_Z)d.framebufferTexture2D(d.FRAMEBUFFER,gt,ft,Y.__webglTexture,St);m.bindFramebuffer(d.FRAMEBUFFER,null)}function de(X,O,tt){if(d.bindRenderbuffer(d.RENDERBUFFER,X),O.depthBuffer){let gt=O.depthTexture,ft=gt&&gt.isDepthTexture?gt.type:null,St=P(O.stencilBuffer,ft),Et=O.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;if(_e(O))y.renderbufferStorageMultisampleEXT(d.RENDERBUFFER,pt(O),St,O.width,O.height);else if(tt)d.renderbufferStorageMultisample(d.RENDERBUFFER,pt(O),St,O.width,O.height);else d.renderbufferStorage(d.RENDERBUFFER,St,O.width,O.height);d.framebufferRenderbuffer(d.FRAMEBUFFER,Et,d.RENDERBUFFER,X)}else{let gt=O.textures;for(let ft=0;ft<gt.length;ft++){let St=gt[ft],Et=x.convert(St.format,St.colorSpace),at=x.convert(St.type),ut=k(St.internalFormat,Et,at,St.normalized,St.colorSpace);if(_e(O))y.renderbufferStorageMultisampleEXT(d.RENDERBUFFER,pt(O),ut,O.width,O.height);else if(tt)d.renderbufferStorageMultisample(d.RENDERBUFFER,pt(O),ut,O.width,O.height);else d.renderbufferStorage(d.RENDERBUFFER,ut,O.width,O.height)}}d.bindRenderbuffer(d.RENDERBUFFER,null)}function Be(X,O,tt){let gt=O.isWebGLCubeRenderTarget===!0;if(m.bindFramebuffer(d.FRAMEBUFFER,X),!(O.depthTexture&&O.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ft=g.get(O.depthTexture);ft.__renderTarget=O;let St=gt?O.depthTexture.image[0]:O.depthTexture.image;if(!ft.__webglTexture||St.width!==O.width||St.height!==O.height)St.width=O.width,St.height=O.height,O.depthTexture.needsUpdate=!0;if(gt)Lt(O.depthTexture,0);else Rt(O.depthTexture,0);let Et=ft.__webglTexture,at=pt(O),ut=gt?d.TEXTURE_CUBE_MAP_POSITIVE_X+tt:d.TEXTURE_2D,bt=O.depthTexture.format===Ri?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;if(O.depthTexture.format===Fs)if(_e(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,bt,ut,Et,0,at);else d.framebufferTexture2D(d.FRAMEBUFFER,bt,ut,Et,0);else if(O.depthTexture.format===Ri)if(_e(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,bt,ut,Et,0,at);else d.framebufferTexture2D(d.FRAMEBUFFER,bt,ut,Et,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ke(X){let O=g.get(X),tt=X.isWebGLCubeRenderTarget===!0;if(O.__boundDepthTexture!==X.depthTexture){let gt=X.depthTexture;if(O.__depthDisposeCallback)O.__depthDisposeCallback();if(gt){let ft=()=>{delete O.__boundDepthTexture,delete O.__depthDisposeCallback,gt.removeEventListener("dispose",ft)};gt.addEventListener("dispose",ft),O.__depthDisposeCallback=ft}O.__boundDepthTexture=gt}if(X.depthTexture&&!O.__autoAllocateDepthBuffer)if(tt)for(let gt=0;gt<6;gt++)Be(O.__webglFramebuffer[gt],X,gt);else if(X.texture.mipmaps.length>0)Be(O.__webglFramebuffer[0],X,0);else Be(O.__webglFramebuffer,X,0);else if(tt){O.__webglDepthbuffer=[];for(let gt=0;gt<6;gt++)if(m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer[gt]),O.__webglDepthbuffer[gt]===void 0)O.__webglDepthbuffer[gt]=d.createRenderbuffer(),de(O.__webglDepthbuffer[gt],X,!1);else{let ft=X.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,St=O.__webglDepthbuffer[gt];d.bindRenderbuffer(d.RENDERBUFFER,St),d.framebufferRenderbuffer(d.FRAMEBUFFER,ft,d.RENDERBUFFER,St)}}else{if(X.texture.mipmaps.length>0)m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer[0]);else m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer);if(O.__webglDepthbuffer===void 0)O.__webglDepthbuffer=d.createRenderbuffer(),de(O.__webglDepthbuffer,X,!1);else{let ft=X.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,St=O.__webglDepthbuffer;d.bindRenderbuffer(d.RENDERBUFFER,St),d.framebufferRenderbuffer(d.FRAMEBUFFER,ft,d.RENDERBUFFER,St)}}m.bindFramebuffer(d.FRAMEBUFFER,null)}function en(X,O,tt){let gt=g.get(X);if(O!==void 0)le(gt.__webglFramebuffer,X,X.texture,d.COLOR_ATTACHMENT0,d.TEXTURE_2D,0);if(tt!==void 0)ke(X)}function K(X){let O=X.texture,tt=g.get(X),gt=g.get(O);X.addEventListener("dispose",W),G(X);let ft=X.textures,St=X.isWebGLCubeRenderTarget===!0,Et=ft.length>1;if(!Et){if(gt.__webglTexture===void 0)gt.__webglTexture=d.createTexture();gt.__version=O.version,v.memory.textures++}if(St){tt.__webglFramebuffer=[];for(let at=0;at<6;at++)if(O.mipmaps.length>0){tt.__webglFramebuffer[at]=[];for(let ut=0;ut<O.mipmaps.length;ut++)tt.__webglFramebuffer[at][ut]=d.createFramebuffer()}else tt.__webglFramebuffer[at]=d.createFramebuffer()}else{if(O.mipmaps.length>0){tt.__webglFramebuffer=[];for(let at=0;at<O.mipmaps.length;at++)tt.__webglFramebuffer[at]=d.createFramebuffer()}else tt.__webglFramebuffer=d.createFramebuffer();if(Et)for(let at=0,ut=ft.length;at<ut;at++){let bt=g.get(ft[at]);if(bt.__webglTexture===void 0)bt.__webglTexture=d.createTexture(),v.memory.textures++}if(X.samples>0&&_e(X)===!1){tt.__webglMultisampledFramebuffer=d.createFramebuffer(),tt.__webglColorRenderbuffer=[],m.bindFramebuffer(d.FRAMEBUFFER,tt.__webglMultisampledFramebuffer);for(let at=0;at<ft.length;at++){let ut=ft[at];tt.__webglColorRenderbuffer[at]=d.createRenderbuffer(),d.bindRenderbuffer(d.RENDERBUFFER,tt.__webglColorRenderbuffer[at]);let bt=x.convert(ut.format,ut.colorSpace),Y=x.convert(ut.type),ct=k(ut.internalFormat,bt,Y,ut.normalized,ut.colorSpace,X.isXRRenderTarget===!0),lt=pt(X);d.renderbufferStorageMultisample(d.RENDERBUFFER,lt,ct,X.width,X.height),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+at,d.RENDERBUFFER,tt.__webglColorRenderbuffer[at])}if(d.bindRenderbuffer(d.RENDERBUFFER,null),X.depthBuffer)tt.__webglDepthRenderbuffer=d.createRenderbuffer(),de(tt.__webglDepthRenderbuffer,X,!0);m.bindFramebuffer(d.FRAMEBUFFER,null)}}if(St){m.bindTexture(d.TEXTURE_CUBE_MAP,gt.__webglTexture),Jt(d.TEXTURE_CUBE_MAP,O);for(let at=0;at<6;at++)if(O.mipmaps.length>0)for(let ut=0;ut<O.mipmaps.length;ut++)le(tt.__webglFramebuffer[at][ut],X,O,d.COLOR_ATTACHMENT0,d.TEXTURE_CUBE_MAP_POSITIVE_X+at,ut);else le(tt.__webglFramebuffer[at],X,O,d.COLOR_ATTACHMENT0,d.TEXTURE_CUBE_MAP_POSITIVE_X+at,0);if(U(O))L(d.TEXTURE_CUBE_MAP);else if(O.mipmaps.length>0)d.texParameteri(d.TEXTURE_CUBE_MAP,d.TEXTURE_MAX_LEVEL,O.mipmaps.length-1);m.unbindTexture()}else if(Et){for(let at=0,ut=ft.length;at<ut;at++){let bt=ft[at],Y=g.get(bt),ct=d.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)ct=X.isWebGL3DRenderTarget?d.TEXTURE_3D:d.TEXTURE_2D_ARRAY;if(m.bindTexture(ct,Y.__webglTexture),Jt(ct,bt),le(tt.__webglFramebuffer,X,bt,d.COLOR_ATTACHMENT0+at,ct,0),U(bt))L(ct)}m.unbindTexture()}else{let at=d.TEXTURE_2D;if(X.isWebGL3DRenderTarget||X.isWebGLArrayRenderTarget)at=X.isWebGL3DRenderTarget?d.TEXTURE_3D:d.TEXTURE_2D_ARRAY;if(m.bindTexture(at,gt.__webglTexture),Jt(at,O),O.mipmaps.length>0)for(let ut=0;ut<O.mipmaps.length;ut++)le(tt.__webglFramebuffer[ut],X,O,d.COLOR_ATTACHMENT0,at,ut);else le(tt.__webglFramebuffer,X,O,d.COLOR_ATTACHMENT0,at,0);if(U(O))L(at);else if(O.mipmaps.length>0)d.texParameteri(at,d.TEXTURE_MAX_LEVEL,O.mipmaps.length-1);m.unbindTexture()}if(X.depthBuffer)ke(X)}function nn(X){let O=X.textures;for(let tt=0,gt=O.length;tt<gt;tt++){let ft=O[tt];if(U(ft)&&ft.mipmapsAutoUpdate===!0){let St=D(X),Et=g.get(ft).__webglTexture;m.bindTexture(St,Et),L(St),m.unbindTexture()}}}let ht=[];function Gt(X){if(X.samples>0){if(_e(X)===!1){let{textures:O,width:tt,height:gt}=X,ft=d.COLOR_BUFFER_BIT,St=X.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,Et=g.get(X),at=O.length>1;if(at)for(let bt=0;bt<O.length;bt++)m.bindFramebuffer(d.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+bt,d.RENDERBUFFER,null),m.bindFramebuffer(d.FRAMEBUFFER,Et.__webglFramebuffer),d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0+bt,d.TEXTURE_2D,null,0);if(m.bindFramebuffer(d.READ_FRAMEBUFFER,Et.__webglMultisampledFramebuffer),X.texture.mipmaps.length>0)m.bindFramebuffer(d.DRAW_FRAMEBUFFER,Et.__webglFramebuffer[0]);else m.bindFramebuffer(d.DRAW_FRAMEBUFFER,Et.__webglFramebuffer);for(let bt=0;bt<O.length;bt++){if(X.resolveDepthBuffer){if(X.depthBuffer)ft|=d.DEPTH_BUFFER_BIT;if(X.stencilBuffer&&X.resolveStencilBuffer)ft|=d.STENCIL_BUFFER_BIT}if(at){d.framebufferRenderbuffer(d.READ_FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.RENDERBUFFER,Et.__webglColorRenderbuffer[bt]);let Y=g.get(O[bt]).__webglTexture;d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.TEXTURE_2D,Y,0)}if(d.blitFramebuffer(0,0,tt,gt,0,0,tt,gt,ft,d.NEAREST),S===!0){if(ht.length=0,ht.push(d.COLOR_ATTACHMENT0+bt),X.depthBuffer&&X.storeMultisampledDepthBuffer===!1)ht.push(St);d.invalidateFramebuffer(d.READ_FRAMEBUFFER,ht)}}if(m.bindFramebuffer(d.READ_FRAMEBUFFER,null),m.bindFramebuffer(d.DRAW_FRAMEBUFFER,null),at)for(let bt=0;bt<O.length;bt++){m.bindFramebuffer(d.FRAMEBUFFER,Et.__webglMultisampledFramebuffer),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+bt,d.RENDERBUFFER,Et.__webglColorRenderbuffer[bt]);let Y=g.get(O[bt]).__webglTexture;m.bindFramebuffer(d.FRAMEBUFFER,Et.__webglFramebuffer),d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0+bt,d.TEXTURE_2D,Y,0)}m.bindFramebuffer(d.DRAW_FRAMEBUFFER,Et.__webglMultisampledFramebuffer)}else if(X.depthBuffer&&X.storeMultisampledDepthBuffer===!1&&S){let O=X.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;d.invalidateFramebuffer(d.DRAW_FRAMEBUFFER,[O])}}}function pt(X){return Math.min(_.maxSamples,X.samples)}function _e(X){let O=g.get(X);return X.samples>0&&p.has("WEBGL_multisampled_render_to_texture")===!0&&O.__useRenderToTexture!==!1}function Xt(X){let O=v.render.frame;if(M.get(X)!==O)M.set(X,O),X.update()}function te(X,O){let{colorSpace:tt,format:gt,type:ft}=X;if(X.isCompressedTexture===!0||X.isVideoTexture===!0)return O;if(tt!==bc&&tt!==Ki)if(he.getTransfer(tt)===Ie){if(gt!==Nn||ft!==Gn)qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else Zt("WebGLTextures: Unsupported texture color space:",tt);return O}function ln(X){if(typeof HTMLImageElement<"u"&&X instanceof HTMLImageElement)b.width=X.naturalWidth||X.width,b.height=X.naturalHeight||X.height;else if(typeof VideoFrame<"u"&&X instanceof VideoFrame)b.width=X.displayWidth,b.height=X.displayHeight;else b.width=X.width,b.height=X.height;return b}this.allocateTextureUnit=ot,this.resetTextureUnits=dt,this.getTextureUnits=_t,this.setTextureUnits=Nt,this.setTexture2D=Rt,this.setTexture2DArray=Bt,this.setTexture3D=kt,this.setTextureCube=Lt,this.rebindTextures=en,this.setupRenderTarget=K,this.updateRenderTargetMipmap=nn,this.updateMultisampleRenderTarget=Gt,this.setupDepthRenderbuffer=ke,this.setupFrameBufferTexture=le,this.useMultisampledRTT=_e,this.dispose=Q}function dy(d,p){function m(g,_=Ki){let x,v=he.getTransfer(_);if(g===Gn)return d.UNSIGNED_BYTE;if(g===Vl)return d.UNSIGNED_SHORT_4_4_4_4;if(g===Wl)return d.UNSIGNED_SHORT_5_5_5_1;if(g===Gd)return d.UNSIGNED_INT_5_9_9_9_REV;if(g===Vd)return d.UNSIGNED_INT_10F_11F_11F_REV;if(g===zd)return d.BYTE;if(g===Hd)return d.SHORT;if(g===br)return d.UNSIGNED_SHORT;if(g===Gl)return d.INT;if(g===Ai)return d.UNSIGNED_INT;if(g===hi)return d.FLOAT;if(g===Zn)return d.HALF_FLOAT;if(g===Wd)return d.ALPHA;if(g===Xd)return d.RGB;if(g===Nn)return d.RGBA;if(g===Fs)return d.DEPTH_COMPONENT;if(g===Ri)return d.DEPTH_STENCIL;if(g===qd)return d.RED;if(g===Xl)return d.RED_INTEGER;if(g===Ji)return d.RG;if(g===ql)return d.RG_INTEGER;if(g===Yl)return d.RGBA_INTEGER;if(g===Os||g===Oo||g===Bs||g===ks)if(v===Ie)if(x=p.get("WEBGL_compressed_texture_s3tc_srgb"),x!==null){if(g===Os)return x.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(g===Oo)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(g===Bs)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(g===ks)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(x=p.get("WEBGL_compressed_texture_s3tc"),x!==null){if(g===Os)return x.COMPRESSED_RGB_S3TC_DXT1_EXT;if(g===Oo)return x.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(g===Bs)return x.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(g===ks)return x.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(g===Zl||g===$l||g===Jl||g===Kl)if(x=p.get("WEBGL_compressed_texture_pvrtc"),x!==null){if(g===Zl)return x.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(g===$l)return x.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(g===Jl)return x.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(g===Kl)return x.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(g===Mr||g===jl||g===Ql||g===tc||g===ec||g===Bo||g===nc)if(x=p.get("WEBGL_compressed_texture_etc"),x!==null){if(g===Mr||g===jl)return v===Ie?x.COMPRESSED_SRGB8_ETC2:x.COMPRESSED_RGB8_ETC2;if(g===Ql)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:x.COMPRESSED_RGBA8_ETC2_EAC;if(g===tc)return x.COMPRESSED_R11_EAC;if(g===ec)return x.COMPRESSED_SIGNED_R11_EAC;if(g===Bo)return x.COMPRESSED_RG11_EAC;if(g===nc)return x.COMPRESSED_SIGNED_RG11_EAC}else return null;if(g===ic||g===sc||g===rc||g===oc||g===ac||g===lc||g===cc||g===hc||g===uc||g===dc||g===fc||g===pc||g===mc||g===gc)if(x=p.get("WEBGL_compressed_texture_astc"),x!==null){if(g===ic)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:x.COMPRESSED_RGBA_ASTC_4x4_KHR;if(g===sc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:x.COMPRESSED_RGBA_ASTC_5x4_KHR;if(g===rc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:x.COMPRESSED_RGBA_ASTC_5x5_KHR;if(g===oc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:x.COMPRESSED_RGBA_ASTC_6x5_KHR;if(g===ac)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:x.COMPRESSED_RGBA_ASTC_6x6_KHR;if(g===lc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:x.COMPRESSED_RGBA_ASTC_8x5_KHR;if(g===cc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:x.COMPRESSED_RGBA_ASTC_8x6_KHR;if(g===hc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:x.COMPRESSED_RGBA_ASTC_8x8_KHR;if(g===uc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:x.COMPRESSED_RGBA_ASTC_10x5_KHR;if(g===dc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:x.COMPRESSED_RGBA_ASTC_10x6_KHR;if(g===fc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:x.COMPRESSED_RGBA_ASTC_10x8_KHR;if(g===pc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:x.COMPRESSED_RGBA_ASTC_10x10_KHR;if(g===mc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:x.COMPRESSED_RGBA_ASTC_12x10_KHR;if(g===gc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:x.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(g===_c||g===Er||g===Tr)if(x=p.get("EXT_texture_compression_bptc"),x!==null){if(g===_c)return v===Ie?x.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:x.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(g===Er)return x.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(g===Tr)return x.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(g===xc||g===vc||g===ko||g===yc)if(x=p.get("EXT_texture_compression_rgtc"),x!==null){if(g===xc)return x.COMPRESSED_RED_RGTC1_EXT;if(g===vc)return x.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(g===ko)return x.COMPRESSED_RED_GREEN_RGTC2_EXT;if(g===yc)return x.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(g===$i)return d.UNSIGNED_INT_24_8;return d[g]!==void 0?d[g]:null}return{convert:m}}var fy=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,py=`
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

}`;class $f{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(d,p){if(this.texture===null){let m=new Ko(d.texture);if(d.depthNear!==p.depthNear||d.depthFar!==p.depthFar)this.depthNear=d.depthNear,this.depthFar=d.depthFar;this.texture=m}}getMesh(d){if(this.texture!==null){if(this.mesh===null){let p=d.cameras[0].viewport,m=new mi({vertexShader:fy,fragmentShader:py,uniforms:{depthColor:{value:this.texture},depthWidth:{value:p.z},depthHeight:{value:p.w}}});this.mesh=new on(new Lr(20,20),m)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Jf extends ui{constructor(d,p){super();let m=this,g=null,_=1,x=null,v="local-floor",y=1,S=null,b=null,M=null,T=null,E=null,w=null,C=typeof XRWebGLBinding<"u",N=new $f,A={},R=p.getContextAttributes(),I=null,U=null,L=[],D=[],k=new $t,P=null,F=null,G=new En;G.viewport=new Oe;let H=new En;H.viewport=new Oe;let z=[G,H],W=new jc,Z=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ot){let mt=L[ot];if(mt===void 0)mt=new Rr,L[ot]=mt;return mt.getTargetRaySpace()},this.getControllerGrip=function(ot){let mt=L[ot];if(mt===void 0)mt=new Rr,L[ot]=mt;return mt.getGripSpace()},this.getHand=function(ot){let mt=L[ot];if(mt===void 0)mt=new Rr,L[ot]=mt;return mt.getHandSpace()};function Q(ot){let mt=D.indexOf(ot.inputSource);if(mt===-1)return;let Rt=L[mt];if(Rt!==void 0)Rt.update(ot.inputSource,ot.frame,S||x),Rt.dispatchEvent({type:ot.type,data:ot.inputSource})}function it(){g.removeEventListener("select",Q),g.removeEventListener("selectstart",Q),g.removeEventListener("selectend",Q),g.removeEventListener("squeeze",Q),g.removeEventListener("squeezestart",Q),g.removeEventListener("squeezeend",Q),g.removeEventListener("end",it),g.removeEventListener("inputsourceschange",j);for(let ot=0;ot<L.length;ot++){let mt=D[ot];if(mt===null)continue;D[ot]=null,L[ot].disconnect(mt)}Z=null,V=null,N.reset();for(let ot in A)delete A[ot];if(d.setRenderTarget(I),E=null,T=null,M=null,g=null,U=null,Nt.stop(),m.isPresenting=!1,d.setPixelRatio(P),d.setSize(k.width,k.height,!1),F!==null){let ot=F.camera;ot.fov=F.fov,ot.zoom=F.zoom,ot.updateProjectionMatrix(),F=null}m.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ot){if(_=ot,m.isPresenting===!0)qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ot){if(v=ot,m.isPresenting===!0)qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||x},this.setReferenceSpace=function(ot){S=ot},this.getBaseLayer=function(){return T!==null?T:E},this.getBinding=function(){if(M===null&&C)M=new XRWebGLBinding(g,p);return M},this.getFrame=function(){return w},this.getSession=function(){return g},this.setSession=async function(ot){if(g=ot,g!==null){if(I=d.getRenderTarget(),g.addEventListener("select",Q),g.addEventListener("selectstart",Q),g.addEventListener("selectend",Q),g.addEventListener("squeeze",Q),g.addEventListener("squeezestart",Q),g.addEventListener("squeezeend",Q),g.addEventListener("end",it),g.addEventListener("inputsourceschange",j),R.xrCompatible!==!0)await p.makeXRCompatible();if(P=d.getPixelRatio(),d.getSize(k),!(C&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Rt={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:_};E=new XRWebGLLayer(g,p,Rt),g.updateRenderState({baseLayer:E}),d.setPixelRatio(1),d.setSize(E.framebufferWidth,E.framebufferHeight,!1),U=new Dn(E.framebufferWidth,E.framebufferHeight,{format:Nn,type:Gn,colorSpace:d.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:E.ignoreDepthValues===!1,resolveStencilBuffer:E.ignoreDepthValues===!1,storeMultisampledDepthBuffer:E.ignoreDepthValues===!1,storeMultisampledStencilBuffer:E.ignoreDepthValues===!1})}else{let Rt=null,Bt=null,kt=null;if(R.depth)kt=R.stencil?p.DEPTH24_STENCIL8:p.DEPTH_COMPONENT24,Rt=R.stencil?Ri:Fs,Bt=R.stencil?$i:Ai;let Lt={colorFormat:p.RGBA8,depthFormat:kt,scaleFactor:_};M=this.getBinding(),T=M.createProjectionLayer(Lt),g.updateRenderState({layers:[T]}),d.setPixelRatio(1),d.setSize(T.textureWidth,T.textureHeight,!1),U=new Dn(T.textureWidth,T.textureHeight,{format:Nn,type:Gn,depthTexture:new Ni(T.textureWidth,T.textureHeight,Bt,void 0,void 0,void 0,void 0,void 0,void 0,Rt),stencilBuffer:R.stencil,colorSpace:d.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1,storeMultisampledDepthBuffer:T.ignoreDepthValues===!1,storeMultisampledStencilBuffer:T.ignoreDepthValues===!1})}U.isXRRenderTarget=!0,this.setFoveation(y),S=null,x=await g.requestReferenceSpace(v),Nt.setContext(g),Nt.start(),m.isPresenting=!0,m.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(g!==null)return g.environmentBlendMode},this.getDepthTexture=function(){return N.getDepthTexture()};function j(ot){for(let mt=0;mt<ot.removed.length;mt++){let Rt=ot.removed[mt],Bt=D.indexOf(Rt);if(Bt>=0)D[Bt]=null,L[Bt].disconnect(Rt)}for(let mt=0;mt<ot.added.length;mt++){let Rt=ot.added[mt],Bt=D.indexOf(Rt);if(Bt===-1){for(let Lt=0;Lt<L.length;Lt++)if(Lt>=D.length){D.push(Rt),Bt=Lt;break}else if(D[Lt]===null){D[Lt]=Rt,Bt=Lt;break}if(Bt===-1)break}let kt=L[Bt];if(kt)kt.connect(Rt)}}function xt(ot,mt){if(mt===null)ot.matrixWorld.copy(ot.matrix);else ot.matrixWorld.multiplyMatrices(mt.matrixWorld,ot.matrix);ot.matrixWorldInverse.copy(ot.matrixWorld).invert()}this.updateCamera=function(ot){if(g===null)return;let{near:mt,far:Rt}=ot;if(N.texture!==null){if(N.depthNear>0)mt=N.depthNear;if(N.depthFar>0)Rt=N.depthFar}if(W.near=H.near=G.near=mt,W.far=H.far=G.far=Rt,Z!==W.near||V!==W.far)g.updateRenderState({depthNear:W.near,depthFar:W.far}),Z=W.near,V=W.far;W.layers.mask=ot.layers.mask|6,G.layers.mask=W.layers.mask&-5,H.layers.mask=W.layers.mask&-3;let Bt=ot.parent,kt=W.cameras;xt(W,Bt);for(let Lt=0;Lt<kt.length;Lt++)xt(kt[Lt],Bt);if(W.projectionMatrix.copy(G.projectionMatrix),W.projectionMatrixInverse.copy(G.projectionMatrixInverse),F===null&&ot.isPerspectiveCamera)F={camera:ot,fov:ot.fov,zoom:ot.zoom};rt(ot,W,Bt)};function rt(ot,mt,Rt){if(Rt===null)ot.matrix.copy(mt.matrixWorld);else ot.matrix.copy(Rt.matrixWorld),ot.matrix.invert(),ot.matrix.multiply(mt.matrixWorld);if(ot.matrix.decompose(ot.position,ot.quaternion,ot.scale),ot.updateMatrixWorld(!0),ot.projectionMatrix.copy(mt.projectionMatrix),ot.projectionMatrixInverse.copy(mt.projectionMatrixInverse),ot.isPerspectiveCamera)ot.fov=Ls*2*Math.atan(1/ot.projectionMatrix.elements[5]),ot.zoom=1}this.getCamera=function(){return W},this.getFoveation=function(){if(T===null&&E===null)return;return y},this.setFoveation=function(ot){if(y=ot,T!==null)T.fixedFoveation=ot;if(E!==null&&E.fixedFoveation!==void 0)E.fixedFoveation=ot},this.hasDepthSensing=function(){return N.texture!==null},this.getDepthSensingMesh=function(){return N.getMesh(W)},this.getCameraTexture=function(ot){return A[ot]};let dt=null;function _t(ot,mt){if(b=mt.getViewerPose(S||x),w=mt,b!==null){let Rt=b.views;if(E!==null)d.setRenderTargetFramebuffer(U,E.framebuffer),d.setRenderTarget(U);let Bt=!1;if(Rt.length!==W.cameras.length)W.cameras.length=0,Bt=!0;for(let jt=0;jt<Rt.length;jt++){let Dt=Rt[jt],Jt=null;if(E!==null)Jt=E.getViewport(Dt);else{let Kt=M.getViewSubImage(T,Dt);if(Jt=Kt.viewport,jt===0)d.setRenderTargetTextures(U,Kt.colorTexture,Kt.depthStencilTexture),d.setRenderTarget(U)}let Yt=z[jt];if(Yt===void 0)Yt=new En,Yt.layers.enable(jt),Yt.viewport=new Oe,z[jt]=Yt;if(Yt.matrix.fromArray(Dt.transform.matrix),Yt.matrix.decompose(Yt.position,Yt.quaternion,Yt.scale),Yt.projectionMatrix.fromArray(Dt.projectionMatrix),Yt.projectionMatrixInverse.copy(Yt.projectionMatrix).invert(),Yt.viewport.set(Jt.x,Jt.y,Jt.width,Jt.height),jt===0)W.matrix.copy(Yt.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale);if(Bt===!0)W.cameras.push(Yt)}let kt=g.enabledFeatures;if(kt&&kt.includes("depth-sensing")&&g.depthUsage=="gpu-optimized"&&C){M=m.getBinding();let jt=M.getDepthInformation(Rt[0]);if(jt&&jt.isValid&&jt.texture)N.init(jt,g.renderState)}if(kt&&kt.includes("camera-access")&&C){d.state.unbindTexture(),M=m.getBinding();for(let jt=0;jt<Rt.length;jt++){let Dt=Rt[jt].camera;if(Dt){let Jt=A[Dt];if(!Jt)Jt=new Ko,A[Dt]=Jt;let Yt=M.getCameraImage(Dt);Jt.sourceTexture=Yt}}}}for(let Rt=0;Rt<L.length;Rt++){let Bt=D[Rt],kt=L[Rt];if(Bt!==null&&kt!==void 0)kt.update(Bt,mt,S||x)}if(dt)dt(ot,mt);if(mt.detectedPlanes)m.dispatchEvent({type:"planesdetected",data:mt});w=null}let Nt=new Df;Nt.setAnimationLoop(_t),this.setAnimationLoop=function(ot){dt=ot},this.dispose=function(){}}}var my=new se,Kf=new Qt;Kf.set(-1,0,0,0,1,0,0,0,1);function gy(d,p){function m(A,R){if(A.matrixAutoUpdate===!0)A.updateMatrix();R.value.copy(A.matrix)}function g(A,R){if(R.color.getRGB(A.fogColor.value,Oc(d)),R.isFog)A.fogNear.value=R.near,A.fogFar.value=R.far;else if(R.isFogExp2)A.fogDensity.value=R.density}function _(A,R,I,U,L){if(R.isNodeMaterial)R.uniformsNeedUpdate=!1;else if(R.isMeshBasicMaterial)x(A,R);else if(R.isMeshLambertMaterial){if(x(A,R),R.envMap)A.envMapIntensity.value=R.envMapIntensity}else if(R.isMeshToonMaterial)x(A,R),T(A,R);else if(R.isMeshPhongMaterial){if(x(A,R),M(A,R),R.envMap)A.envMapIntensity.value=R.envMapIntensity}else if(R.isMeshStandardMaterial){if(x(A,R),E(A,R),R.isMeshPhysicalMaterial)w(A,R,L)}else if(R.isMeshMatcapMaterial)x(A,R),C(A,R);else if(R.isMeshDepthMaterial)x(A,R);else if(R.isMeshDistanceMaterial)x(A,R),N(A,R);else if(R.isMeshNormalMaterial)x(A,R);else if(R.isLineBasicMaterial){if(v(A,R),R.isLineDashedMaterial)y(A,R)}else if(R.isPointsMaterial)S(A,R,I,U);else if(R.isSpriteMaterial)b(A,R);else if(R.isShadowMaterial)A.color.value.copy(R.color),A.opacity.value=R.opacity;else if(R.isShaderMaterial)R.uniformsNeedUpdate=!1}function x(A,R){if(A.opacity.value=R.opacity,R.color)A.diffuse.value.copy(R.color);if(R.emissive)A.emissive.value.copy(R.emissive).multiplyScalar(R.emissiveIntensity);if(R.map)A.map.value=R.map,m(R.map,A.mapTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.bumpMap){if(A.bumpMap.value=R.bumpMap,m(R.bumpMap,A.bumpMapTransform),A.bumpScale.value=R.bumpScale,R.side===mn)A.bumpScale.value*=-1}if(R.normalMap){if(A.normalMap.value=R.normalMap,m(R.normalMap,A.normalMapTransform),A.normalScale.value.copy(R.normalScale),R.side===mn)A.normalScale.value.negate()}if(R.displacementMap)A.displacementMap.value=R.displacementMap,m(R.displacementMap,A.displacementMapTransform),A.displacementScale.value=R.displacementScale,A.displacementBias.value=R.displacementBias;if(R.emissiveMap)A.emissiveMap.value=R.emissiveMap,m(R.emissiveMap,A.emissiveMapTransform);if(R.specularMap)A.specularMap.value=R.specularMap,m(R.specularMap,A.specularMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest;let I=p.get(R),{envMap:U,envMapRotation:L}=I;if(U){if(A.envMap.value=U,A.envMapRotation.value.setFromMatrix4(my.makeRotationFromEuler(L)).transpose(),U.isCubeTexture&&U.isRenderTargetTexture===!1)A.envMapRotation.value.premultiply(Kf);A.reflectivity.value=R.reflectivity,A.ior.value=R.ior,A.refractionRatio.value=R.refractionRatio}if(R.lightMap)A.lightMap.value=R.lightMap,A.lightMapIntensity.value=R.lightMapIntensity,m(R.lightMap,A.lightMapTransform);if(R.aoMap)A.aoMap.value=R.aoMap,A.aoMapIntensity.value=R.aoMapIntensity,m(R.aoMap,A.aoMapTransform)}function v(A,R){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,R.map)A.map.value=R.map,m(R.map,A.mapTransform)}function y(A,R){A.dashSize.value=R.dashSize,A.totalSize.value=R.dashSize+R.gapSize,A.scale.value=R.scale}function S(A,R,I,U){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,A.size.value=R.size*I,A.scale.value=U*0.5,R.map)A.map.value=R.map,m(R.map,A.uvTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest}function b(A,R){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,A.rotation.value=R.rotation,R.map)A.map.value=R.map,m(R.map,A.mapTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest}function M(A,R){A.specular.value.copy(R.specular),A.shininess.value=Math.max(R.shininess,0.0001)}function T(A,R){if(R.gradientMap)A.gradientMap.value=R.gradientMap}function E(A,R){if(A.metalness.value=R.metalness,R.metalnessMap)A.metalnessMap.value=R.metalnessMap,m(R.metalnessMap,A.metalnessMapTransform);if(A.roughness.value=R.roughness,R.roughnessMap)A.roughnessMap.value=R.roughnessMap,m(R.roughnessMap,A.roughnessMapTransform);if(R.envMap)A.envMapIntensity.value=R.envMapIntensity}function w(A,R,I){if(A.ior.value=R.ior,R.diffuseRoughness>0){if(A.diffuseRoughness.value=R.diffuseRoughness,R.diffuseRoughnessMap)A.diffuseRoughnessMap.value=R.diffuseRoughnessMap,m(R.diffuseRoughnessMap,A.diffuseRoughnessMapTransform)}if(R.sheen>0){if(A.sheenColor.value.copy(R.sheenColor).multiplyScalar(R.sheen),A.sheenRoughness.value=R.sheenRoughness,R.sheenColorMap)A.sheenColorMap.value=R.sheenColorMap,m(R.sheenColorMap,A.sheenColorMapTransform);if(R.sheenRoughnessMap)A.sheenRoughnessMap.value=R.sheenRoughnessMap,m(R.sheenRoughnessMap,A.sheenRoughnessMapTransform)}if(R.clearcoat>0){if(A.clearcoat.value=R.clearcoat,A.clearcoatRoughness.value=R.clearcoatRoughness,R.clearcoatMap)A.clearcoatMap.value=R.clearcoatMap,m(R.clearcoatMap,A.clearcoatMapTransform);if(R.clearcoatRoughnessMap)A.clearcoatRoughnessMap.value=R.clearcoatRoughnessMap,m(R.clearcoatRoughnessMap,A.clearcoatRoughnessMapTransform);if(R.clearcoatNormalMap){if(A.clearcoatNormalMap.value=R.clearcoatNormalMap,m(R.clearcoatNormalMap,A.clearcoatNormalMapTransform),A.clearcoatNormalScale.value.copy(R.clearcoatNormalScale),R.side===mn)A.clearcoatNormalScale.value.negate()}}if(R.dispersion>0)A.dispersion.value=R.dispersion;if(R.retroreflectivity>0)A.retroreflectivity.value=R.retroreflectivity;if(R.iridescence>0){if(A.iridescence.value=R.iridescence,A.iridescenceIOR.value=R.iridescenceIOR,A.iridescenceThicknessMinimum.value=R.iridescenceThicknessMinimum,A.iridescenceThicknessMaximum.value=R.iridescenceThicknessMaximum,R.iridescenceMap)A.iridescenceMap.value=R.iridescenceMap,m(R.iridescenceMap,A.iridescenceMapTransform);if(R.iridescenceThicknessMap)A.iridescenceThicknessMap.value=R.iridescenceThicknessMap,m(R.iridescenceThicknessMap,A.iridescenceThicknessMapTransform)}if(R.transmission>0){if(A.transmission.value=R.transmission,A.transmissionSamplerMap.value=I.texture,A.transmissionSamplerSize.value.set(I.width,I.height),R.transmissionMap)A.transmissionMap.value=R.transmissionMap,m(R.transmissionMap,A.transmissionMapTransform);if(A.thickness.value=R.thickness,R.thicknessMap)A.thicknessMap.value=R.thicknessMap,m(R.thicknessMap,A.thicknessMapTransform);A.attenuationDistance.value=R.attenuationDistance,A.attenuationColor.value.copy(R.attenuationColor)}if(R.anisotropy>0){if(A.anisotropyVector.value.set(R.anisotropy*Math.cos(R.anisotropyRotation),R.anisotropy*Math.sin(R.anisotropyRotation)),R.anisotropyMap)A.anisotropyMap.value=R.anisotropyMap,m(R.anisotropyMap,A.anisotropyMapTransform)}if(A.specularIntensity.value=R.specularIntensity,A.specularColor.value.copy(R.specularColor),R.specularColorMap)A.specularColorMap.value=R.specularColorMap,m(R.specularColorMap,A.specularColorMapTransform);if(R.specularIntensityMap)A.specularIntensityMap.value=R.specularIntensityMap,m(R.specularIntensityMap,A.specularIntensityMapTransform)}function C(A,R){if(R.matcap)A.matcap.value=R.matcap}function N(A,R){let I=p.get(R).light;A.referencePosition.value.setFromMatrixPosition(I.matrixWorld),A.nearDistance.value=I.shadow.camera.near,A.farDistance.value=I.shadow.camera.far}return{refreshFogUniforms:g,refreshMaterialUniforms:_}}function _y(d,p,m,g){let _={},x={};function v(I,U){let L=U.program;g.uniformBlockBinding(I,L,_[I.id])}function y(I,U){let L=_[I.id];if(L===void 0)C(I),L=S(I),_[I.id]=L,I.addEventListener("dispose",A);let D=U.program;g.updateUBOMapping(I,D);let k=p.render.frame;if(x[I.id]!==k)b(I),x[I.id]=k}function S(I){let U=d.createBuffer(),{__size:L,usage:D}=I;return d.bindBuffer(d.UNIFORM_BUFFER,U),d.bufferData(d.UNIFORM_BUFFER,L,D),d.bindBuffer(d.UNIFORM_BUFFER,null),U}function b(I){let U=_[I.id],{uniforms:L,__cache:D}=I;d.bindBuffer(d.UNIFORM_BUFFER,U);for(let k=0,P=L.length;k<P;k++){let F=L[k];if(Array.isArray(F))for(let G=0,H=F.length;G<H;G++)M(F[G],k,G,D);else M(F,k,0,D)}d.bindBuffer(d.UNIFORM_BUFFER,null)}function M(I,U,L,D){if(E(I,U,L,D)===!0){let{__offset:k,value:P}=I;if(Array.isArray(P)){let F=0;for(let G=0;G<P.length;G++){let H=P[G],z=N(H,!0);T(H,I.__data,F),F+=z.storage/Float32Array.BYTES_PER_ELEMENT}}else T(P,I.__data,0);d.bufferSubData(d.UNIFORM_BUFFER,k,I.__data)}}function T(I,U,L){if(typeof I==="number"||typeof I==="boolean")U[L]=I;else if(I.isMatrix3)U[L]=I.elements[0],U[L+1]=I.elements[1],U[L+2]=I.elements[2],U[L+3]=0,U[L+4]=I.elements[3],U[L+5]=I.elements[4],U[L+6]=I.elements[5],U[L+7]=0,U[L+8]=I.elements[6],U[L+9]=I.elements[7],U[L+10]=I.elements[8],U[L+11]=0;else if(ArrayBuffer.isView(I))U.set(I.subarray(0,U.length-L),L);else I.toArray(U,L)}function E(I,U,L,D){let k=I.value,P=U+"_"+L;if(Array.isArray(k)){if(D[P]===void 0)D[P]=[];let F=D[P],G=!1;for(let H=0;H<k.length;H++)if(w(k[H],F,H)===!0)G=!0;return G}return w(k,D,P)}function w(I,U,L){if(U[L]===void 0){if(typeof I==="number"||typeof I==="boolean")U[L]=I;else if(ArrayBuffer.isView(I))U[L]=I.slice();else U[L]=I.clone();return!0}else{let D=U[L];if(typeof I==="number"||typeof I==="boolean"){if(D!==I)return U[L]=I,!0}else if(ArrayBuffer.isView(I))return!0;else if(D.equals(I)===!1)return D.copy(I),!0}return!1}function C(I){let U=I.uniforms,L=0,D=16;for(let P=0,F=U.length;P<F;P++){let G=Array.isArray(U[P])?U[P]:[U[P]];for(let H=0,z=G.length;H<z;H++){let W=G[H],Z=Array.isArray(W.value)?W.value:[W.value],V=Array.isArray(U[P])||Array.isArray(W.value),Q=L;for(let j=0,xt=Z.length;j<xt;j++){let rt=Z[j],dt=N(rt,V),_t=L%D,Nt=_t%dt.boundary,ot=_t+Nt;if(L+=Nt,ot!==0&&D-ot<dt.storage)L+=D-ot;if(j===0)Q=L;L+=dt.storage}let it=W.type==="int"?Int32Array:W.type==="uint"?Uint32Array:Float32Array;W.__data=new it((L-Q)/Float32Array.BYTES_PER_ELEMENT),W.__offset=Q}}let k=L%D;if(k>0)L+=D-k;return I.__size=L,I.__cache={},this}function N(I,U){let L={boundary:0,storage:0};if(typeof I==="number"||typeof I==="boolean")L.boundary=4,L.storage=4;else if(I.isVector2)L.boundary=8,L.storage=8;else if(I.isVector3||I.isColor)L.boundary=16,L.storage=12;else if(I.isVector4)L.boundary=16,L.storage=16;else if(I.isMatrix3)L.boundary=16,L.storage=48;else if(I.isMatrix4)L.boundary=16,L.storage=64;else if(I.isTexture)qt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(I))L.boundary=16,L.storage=I.byteLength;else qt("WebGLRenderer: Unsupported uniform value type.",I);if(U===!0)L.boundary=16,L.storage=Math.ceil(L.storage/16)*16;return L}function A(I){let U=I.target;U.removeEventListener("dispose",A),d.deleteBuffer(_[U.id]),delete _[U.id],delete x[U.id]}function R(){for(let I in _)d.deleteBuffer(_[I]);_={},x={}}return{bind:v,update:y,dispose:R}}var xy=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),$n=null;function vy(){if($n===null)$n=new Ps(xy,16,16,Ji,Zn),$n.name="DFG_LUT",$n.minFilter=Tn,$n.magFilter=Tn,$n.wrapS=Uo,$n.wrapT=Uo,$n.generateMipmaps=!1,$n.needsUpdate=!0;return $n}class rh{constructor(d={}){let{canvas:p=Qd(),context:m=null,depth:g=!0,stencil:_=!1,alpha:x=!1,antialias:v=!1,premultipliedAlpha:y=!0,preserveDrawingBuffer:S=!1,powerPreference:b="default",failIfMajorPerformanceCaveat:M=!1,reversedDepthBuffer:T=!1,outputBufferType:E=Gn}=d;this.isWebGLRenderer=!0;let w;if(m!==null){if(typeof WebGLRenderingContext<"u"&&m instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");w=m.getContextAttributes().alpha}else w=x;let C=E,N=new Set([Yl,ql,Xl]),A=new Set([Gn,Ai,br,$i,Vl,Wl]),R=new Uint32Array(4),I=new Int32Array(4),U={textures:[],min:[],max:[],resolution:[]},L=null,D=null,k=[],P=[],F=null;this.domElement=p,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let G=this,H=!1,z=null,W=null,Z=null,V=null;this._outputColorSpace=zo;let Q=0,it=0,j=null,xt=-1,rt=null,dt=new Oe,_t=new Oe,Nt=null,ot=new re(0),mt=0,{width:Rt,height:Bt}=p,kt=1,Lt=null,ie=null,jt=new Oe(0,0,Rt,Bt),Dt=new Oe(0,0,Rt,Bt),Jt=!1,Yt=new Ti,Kt=new Cr,ae=!1,me=!1,Te=new se,le=new q,de=new Oe,Be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ke=!1;function en(){return j===null?kt:1}let K=m;function nn(B,J){return p.getContext(B,J)}let ht,Gt,pt,_e,Xt,te,ln,X,O,tt,gt,ft,St,Et,at,ut,bt,Y,ct,lt,vt,yt,wt;try{let B={alpha:!0,depth:g,stencil:_,antialias:v,premultipliedAlpha:y,preserveDrawingBuffer:S,powerPreference:b,failIfMajorPerformanceCaveat:M};if("setAttribute"in p)p.setAttribute("data-engine",`three.js r${Yi}`);if(p.addEventListener("webglcontextlost",Ct,!1),p.addEventListener("webglcontextrestored",Wt,!1),p.addEventListener("webglcontextcreationerror",oe,!1),K===null){if(K=nn("webgl2",B),K===null)if(nn("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Vt()}catch(B){throw p.removeEventListener("webglcontextlost",Ct,!1),p.removeEventListener("webglcontextrestored",Wt,!1),p.removeEventListener("webglcontextcreationerror",oe,!1),Zt("WebGLRenderer: "+B.message),B}function Vt(){if(ht=new Px(K),ht.init(),vt=new dy(K,ht),Gt=new vx(K,ht,d,vt),pt=new hy(K,ht),Gt.reversedDepthBuffer&&T)pt.buffers.depth.setReversed(!0);W=K.createFramebuffer(),Z=K.createFramebuffer(),V=K.createFramebuffer(),_e=new Nx(K),Xt=new Jv,te=new uy(K,ht,pt,Xt,Gt,vt,_e),ln=new Cx(G),X=new Ug(K),yt=new _x(K,X),O=new Ix(K,X,_e,yt),tt=new Ux(K,O,X,yt,_e),Y=new Dx(K,Gt,te),at=new yx(Xt),gt=new $v(G,ln,ht,Gt,yt,at),ft=new gy(G,Xt),St=new jv,Et=new sy(ht),bt=new gx(G,ln,pt,tt,w,y),ut=new cy(G,tt,Gt),wt=new _y(K,_e,Gt,pt),ct=new xx(K,ht,_e),lt=new Lx(K,ht,_e),_e.programs=gt.programs,G.capabilities=Gt,G.extensions=ht,G.properties=Xt,G.renderLists=St,G.shadowMap=ut,G.state=pt,G.info=_e}if(C!==Gn)F=new Ox(C,p.width,p.height,v,g,_);let Ht=new Jf(G,K);this.xr=Ht,this.getContext=function(){return K},this.getContextAttributes=function(){return K.getContextAttributes()},this.forceContextLoss=function(){let B=ht.get("WEBGL_lose_context");if(B)B.loseContext()},this.forceContextRestore=function(){let B=ht.get("WEBGL_lose_context");if(B)B.restoreContext()},this.getPixelRatio=function(){return kt},this.setPixelRatio=function(B){if(B===void 0)return;kt=B,this.setSize(Rt,Bt,!1)},this.getSize=function(B){return B.set(Rt,Bt)},this.setSize=function(B,J,st=!0){if(Ht.isPresenting){qt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Rt=B,Bt=J,p.width=Math.floor(B*kt),p.height=Math.floor(J*kt),st===!0)p.style.width=B+"px",p.style.height=J+"px";if(F!==null)F.setSize(p.width,p.height);this.setViewport(0,0,B,J)},this.getDrawingBufferSize=function(B){return B.set(Rt*kt,Bt*kt).floor()},this.setDrawingBufferSize=function(B,J,st){Rt=B,Bt=J,kt=st,p.width=Math.floor(B*st),p.height=Math.floor(J*st),this.setViewport(0,0,B,J)},this.setEffects=function(B){if(C===Gn){Zt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(B){for(let J=0;J<B.length;J++)if(B[J].isOutputPass===!0){qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}F.setEffects(B||[])},this.getCurrentViewport=function(B){return B.copy(dt)},this.getViewport=function(B){return B.copy(jt)},this.setViewport=function(B,J,st,et){if(B.isVector4)jt.set(B.x,B.y,B.z,B.w);else jt.set(B,J,st,et);pt.viewport(dt.copy(jt).multiplyScalar(en()).round())},this.getScissor=function(B){return B.copy(Dt)},this.setScissor=function(B,J,st,et){if(B.isVector4)Dt.set(B.x,B.y,B.z,B.w);else Dt.set(B,J,st,et);pt.scissor(_t.copy(Dt).multiplyScalar(en()).round())},this.getScissorTest=function(){return Jt},this.setScissorTest=function(B){pt.setScissorTest(Jt=B)},this.setOpaqueSort=function(B){Lt=B},this.setTransparentSort=function(B){ie=B},this.getClearColor=function(B){return B.copy(bt.getClearColor())},this.setClearColor=function(){bt.setClearColor(...arguments)},this.getClearAlpha=function(){return bt.getClearAlpha()},this.setClearAlpha=function(){bt.setClearAlpha(...arguments)},this.clear=function(B=!0,J=!0,st=!0){let et=0;if(B){let nt=!1;if(j!==null){let Tt=j.texture.format;nt=N.has(Tt)}if(nt){let Tt=j.texture.type,Ut=A.has(Tt),Mt=bt.getClearColor(),It=bt.getClearAlpha(),{r:zt,g:ee,b:fe}=Mt;if(Ut)R[0]=zt,R[1]=ee,R[2]=fe,R[3]=It,K.clearBufferuiv(K.COLOR,0,R);else I[0]=zt,I[1]=ee,I[2]=fe,I[3]=It,K.clearBufferiv(K.COLOR,0,I)}else et|=K.COLOR_BUFFER_BIT}if(J)et|=K.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(st)et|=K.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(et!==0)K.clear(et)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(B){B.setRenderer(this),z=B},this.dispose=function(){p.removeEventListener("webglcontextlost",Ct,!1),p.removeEventListener("webglcontextrestored",Wt,!1),p.removeEventListener("webglcontextcreationerror",oe,!1),bt.dispose(),St.dispose(),Et.dispose(),te.dispose(),Xt.dispose(),ln.dispose(),tt.dispose(),O.dispose(),yt.dispose(),wt.dispose(),gt.dispose(),Ht.dispose(),Ht.removeEventListener("sessionstart",Oh),Ht.removeEventListener("sessionend",Bh),Bi.stop()};function Ct(B){B.preventDefault(),_r("WebGLRenderer: Context Lost."),H=!0}function Wt(){_r("WebGLRenderer: Context Restored."),H=!1;let B=_e.autoReset,J=ut.enabled,st=ut.autoUpdate,et=ut.needsUpdate,nt=ut.type;Vt(),_e.autoReset=B,ut.enabled=J,ut.autoUpdate=st,ut.needsUpdate=et,ut.type=nt}function oe(B){Zt("WebGLRenderer: A WebGL context could not be created. Reason: ",B.statusMessage)}function Pt(B){let J=B.target;J.removeEventListener("dispose",Pt),Ae(J)}function Ae(B){Je(B),Xt.remove(B)}function Je(B){let J=Xt.get(B).programs;if(J!==void 0){if(J.forEach(function(st){gt.releaseProgram(st)}),B.isShaderMaterial)gt.releaseShaderCache(B)}}this.renderBufferDirect=function(B,J,st,et,nt,Tt){if(J===null)J=Be;let Ut=nt.isMesh&&nt.matrixWorld.determinantAffine()<0,Mt=am(B,J,st,et,nt);pt.setMaterial(et,Ut);let It=st.index,zt=1;if(et.wireframe===!0){if(It=O.getWireframeAttribute(st),It===void 0)return;zt=2}let ee=st.drawRange,fe=st.attributes.position,Ft=ee.start*zt,pe=(ee.start+ee.count)*zt;if(Tt!==null)Ft=Math.max(Ft,Tt.start*zt),pe=Math.min(pe,(Tt.start+Tt.count)*zt);if(It!==null)Ft=Math.max(Ft,0),pe=Math.min(pe,It.count);else if(fe!==void 0&&fe!==null)Ft=Math.max(Ft,0),pe=Math.min(pe,fe.count);let He=pe-Ft;if(He<0||He===1/0)return;yt.setup(nt,et,Mt,st,It);let De,Pe=ct;if(It!==null)De=X.get(It),Pe=lt,Pe.setIndex(De);if(nt.isMesh)if(et.wireframe===!0)pt.setLineWidth(et.wireframeLinewidth*en()),Pe.setMode(K.LINES);else Pe.setMode(K.TRIANGLES);else if(nt.isLine){let cn=et.linewidth;if(cn===void 0)cn=1;if(pt.setLineWidth(cn*en()),nt.isLineSegments)Pe.setMode(K.LINES);else if(nt.isLineLoop)Pe.setMode(K.LINE_LOOP);else Pe.setMode(K.LINE_STRIP)}else if(nt.isPoints)Pe.setMode(K.POINTS);else if(nt.isSprite)Pe.setMode(K.TRIANGLES);if(nt.isBatchedMesh)if(!ht.get("WEBGL_multi_draw")){let{_multiDrawStarts:cn,_multiDrawCounts:Ot,_multiDrawCount:vn}=nt,ye=It?X.get(It).bytesPerElement:1,ki=Xt.get(et).currentProgram.getUniforms();for(let hn=0;hn<vn;hn++)ki.setValue(K,"_gl_DrawID",hn),Pe.render(cn[hn]/ye,Ot[hn])}else Pe.renderMultiDraw(nt._multiDrawStarts,nt._multiDrawCounts,nt._multiDrawCount);else if(nt.isInstancedMesh)Pe.renderInstances(Ft,He,nt.count);else if(st.isInstancedBufferGeometry){let cn=st._maxInstanceCount!==void 0?st._maxInstanceCount:1/0,Ot=Math.min(st.instanceCount,cn);Pe.renderInstances(Ft,He,Ot)}else Pe.render(Ft,He)};function Qn(B,J,st,et){if(z!==null&&B.isNodeMaterial)z.setObject(et,B);if(ae===!0)at.setState(B,st,!1);if(B.transparent===!0&&B.side===Ln&&B.forceSinglePass===!1)B.side=mn,B.needsUpdate=!0,rr(B,J,et),B.side=ci,B.needsUpdate=!0,rr(B,J,et),B.side=Ln;else rr(B,J,et)}this.compile=function(B,J,st=null){if(st===null)st=B;if(z!==null)z.renderStart(B,J,st);if(D=Et.get(st),D.init(J),P.push(D),st.traverseVisible(function(nt){if(nt.isLight&&nt.layers.test(J.layers)){if(D.pushLight(nt),nt.castShadow)D.pushShadow(nt)}}),B!==st)B.traverseVisible(function(nt){if(nt.isLight&&nt.layers.test(J.layers)){if(D.pushLight(nt),nt.castShadow)D.pushShadow(nt)}});if(D.setupLights(),z!==null)z.updateLights(D.state.lightsArray);if(me=this.localClippingEnabled,ae=at.init(this.clippingPlanes,me),ae===!0)at.setGlobalState(this.clippingPlanes,J);if(z!==null)ut.render(D.state.shadowsArray,st,J);let et=new Set;if(B.traverse(function(nt){if(!(nt.isMesh||nt.isPoints||nt.isLine||nt.isSprite))return;let Tt=nt.material;if(Tt)if(Array.isArray(Tt))for(let Ut=0;Ut<Tt.length;Ut++){let Mt=Tt[Ut];Qn(Mt,st,J,nt),et.add(Mt)}else Qn(Tt,st,J,nt),et.add(Tt)}),D=P.pop(),z!==null)z.renderEnd();return et},this.compileAsync=function(B,J,st=null){let et=this.compile(B,J,st);return new Promise((nt)=>{function Tt(){if(et.forEach(function(Ut){let It=Xt.get(Ut).currentProgram;if(It===void 0||It.isReady())et.delete(Ut)}),et.size===0){nt(B);return}setTimeout(Tt,10)}if(ht.get("KHR_parallel_shader_compile")!==null)Tt();else setTimeout(Tt,10)})};let Ga=null;function rm(B){if(Ga)Ga(B)}function Oh(){Bi.stop()}function Bh(){Bi.start()}let Bi=new Df;if(Bi.setAnimationLoop(rm),typeof self<"u")Bi.setContext(self);this.setAnimationLoop=function(B){Ga=B,Ht.setAnimationLoop(B),B===null?Bi.stop():Bi.start()},Ht.addEventListener("sessionstart",Oh),Ht.addEventListener("sessionend",Bh),this.render=function(B,J){if(J!==void 0&&J.isCamera!==!0){Zt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;if(z!==null)z.renderStart(B,J);let st=Ht.enabled===!0&&Ht.isPresenting===!0,et=F!==null&&(j===null||st)&&F.begin(G,j);if(B.matrixWorldAutoUpdate===!0)B.updateMatrixWorld();if(J.parent===null&&J.matrixWorldAutoUpdate===!0)J.updateMatrixWorld();if(Ht.enabled===!0&&Ht.isPresenting===!0&&(F===null||F.isCompositing()===!1)){if(Ht.cameraAutoUpdate===!0)Ht.updateCamera(J);J=Ht.getCamera()}if(B.isScene===!0)B.onBeforeRender(G,B,J,j);if(D=Et.get(B,P.length),D.init(J),D.state.textureUnits=te.getTextureUnits(),P.push(D),Te.multiplyMatrices(J.projectionMatrix,J.matrixWorldInverse),J.isArrayCamera)Kt.setFromArrayCamera(J);else Yt.setFromProjectionMatrix(Te,Rc,J.reversedDepth);if(me=this.localClippingEnabled,ae=at.init(this.clippingPlanes,me),L=St.get(B,k.length),L.init(),k.push(L),this.info.render.frame++,Ht.enabled===!0&&Ht.isPresenting===!0){let Ut=G.xr.getDepthSensingMesh();if(Ut!==null)Va(Ut,J,-1/0,G.sortObjects)}if(Va(B,J,0,G.sortObjects),L.finish(),z!==null)z.updateLights(D.state.lightsArray);if(G.sortObjects===!0)L.sort(Lt,ie);if(ke=Ht.enabled===!1||Ht.isPresenting===!1||Ht.hasDepthSensing()===!1,ke)bt.addToRenderList(L,B);if(this.info.autoReset===!0)this.info.reset();if(ae===!0)at.beginShadows();let nt=D.state.shadowsArray;if(ut.render(nt,B,J),ae===!0)at.endShadows();if((et&&F.hasRenderPass())===!1){let Ut=L.opaque,Mt=L.transmissive;if(D.setupLights(),J.isArrayCamera){let It=J.cameras;if(Mt.length>0)for(let zt=0,ee=It.length;zt<ee;zt++){let fe=It[zt];zh(Ut,Mt,B,fe)}if(ke)bt.render(B);for(let zt=0,ee=It.length;zt<ee;zt++){let fe=It[zt];kh(L,B,fe,fe.viewport)}}else{if(Mt.length>0)zh(Ut,Mt,B,J);if(ke)bt.render(B);kh(L,B,J)}}if(j!==null&&it===0)te.updateMultisampleRenderTarget(j),te.updateRenderTargetMipmap(j);if(et)F.end(G);if(B.isScene===!0)B.onAfterRender(G,B,J);if(yt.resetDefaultState(),xt=-1,rt=null,P.pop(),P.length>0){if(D=P[P.length-1],te.setTextureUnits(D.state.textureUnits),ae===!0)at.setGlobalState(G.clippingPlanes,D.state.camera)}else D=null;if(k.pop(),k.length>0)L=k[k.length-1];else L=null;if(z!==null)z.renderEnd()};function Va(B,J,st,et){if(B.visible===!1)return;if(B.layers.test(J.layers)){if(B.isGroup)st=B.renderOrder;else if(B.isLOD){if(B.autoUpdate===!0)B.update(J)}else if(B.isLight){if(D.pushLight(B),B.castShadow)D.pushShadow(B)}else if(B.isSprite){let Ut=J.isArrayCamera?Kt:Yt;if(!B.frustumCulled||B.intersectsFrustum(Ut)){if(et)de.setFromMatrixPosition(B.matrixWorld).applyMatrix4(Te);let Mt=tt.update(B),It=B.material;if(It.visible)L.push(B,Mt,It,st,de.z,null,J)}}else if(B.isMesh||B.isLine||B.isPoints){let Ut=J.isArrayCamera?Kt:Yt;if(!B.frustumCulled||B.intersectsFrustum(Ut)){let Mt=tt.update(B),It=B.material;if(et){if(B.boundingSphere!==void 0){if(B.boundingSphere===null)B.computeBoundingSphere();de.copy(B.boundingSphere.center)}else{if(Mt.boundingSphere===null)Mt.computeBoundingSphere();de.copy(Mt.boundingSphere.center)}de.applyMatrix4(B.matrixWorld).applyMatrix4(Te)}if(Array.isArray(It)){let zt=Mt.groups;for(let ee=0,fe=zt.length;ee<fe;ee++){let Ft=zt[ee],pe=It[Ft.materialIndex];if(pe&&pe.visible)L.push(B,Mt,pe,st,de.z,Ft,J)}}else if(It.visible)L.push(B,Mt,It,st,de.z,null,J)}}}let Tt=B.children;for(let Ut=0,Mt=Tt.length;Ut<Mt;Ut++)Va(Tt[Ut],J,st,et)}function kh(B,J,st,et){let{opaque:nt,transmissive:Tt,transparent:Ut}=B;if(D.setupLightsView(st),ae===!0)at.setGlobalState(G.clippingPlanes,st);if(et)pt.viewport(dt.copy(et));if(nt.length>0)Jr(nt,J,st);if(Tt.length>0)Jr(Tt,J,st);if(Ut.length>0)Jr(Ut,J,st);pt.buffers.depth.setTest(!0),pt.buffers.depth.setMask(!0),pt.buffers.color.setMask(!0),pt.setPolygonOffset(!1)}function zh(B,J,st,et){if((st.isScene===!0?st.overrideMaterial:null)!==null)return;if(D.state.transmissionRenderTarget[et.id]===void 0){let Ft=ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float");D.state.transmissionRenderTarget[et.id]=new Dn(1,1,{generateMipmaps:!0,type:Ft?Zn:Gn,minFilter:Hn,samples:Math.max(4,Gt.samples),stencilBuffer:_,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:he.workingColorSpace})}let Tt=D.state.transmissionRenderTarget[et.id],Ut=et.viewport||dt;Tt.setSize(Ut.z*G.transmissionResolutionScale,Ut.w*G.transmissionResolutionScale);let Mt=G.getRenderTarget(),It=G.getActiveCubeFace(),zt=G.getActiveMipmapLevel();if(G.setRenderTarget(Tt),G.getClearColor(ot),mt=G.getClearAlpha(),mt<1)G.setClearColor(16777215,0.5);if(G.clear(),ke)bt.render(st);let ee=G.toneMapping;G.toneMapping=Yn;let fe=et.viewport;if(et.viewport!==void 0)et.viewport=void 0;if(D.setupLightsView(et),ae===!0)at.setGlobalState(G.clippingPlanes,et);if(Jr(B,st,et),te.updateMultisampleRenderTarget(Tt),te.updateRenderTargetMipmap(Tt),ht.has("WEBGL_multisampled_render_to_texture")===!1){let Ft=!1;for(let pe=0,He=J.length;pe<He;pe++){let De=J[pe],{object:Pe,geometry:cn,material:Ot,group:vn}=De;if(Ot.side===Ln&&Pe.layers.test(et.layers)){let ye=Ot.side;Ot.side=mn,Ot.needsUpdate=!0,Hh(Pe,st,et,cn,Ot,vn),Ot.side=ye,Ot.needsUpdate=!0,Ft=!0}}if(Ft===!0)te.updateMultisampleRenderTarget(Tt),te.updateRenderTargetMipmap(Tt)}if(G.setRenderTarget(Mt,It,zt),G.setClearColor(ot,mt),fe!==void 0)et.viewport=fe;G.toneMapping=ee}function Jr(B,J,st){let et=J.isScene===!0?J.overrideMaterial:null;for(let nt=0,Tt=B.length;nt<Tt;nt++){let Ut=B[nt],{object:Mt,geometry:It,group:zt}=Ut,ee=Ut.material;if(ee.allowOverride===!0&&et!==null)ee=et;if(Mt.layers.test(st.layers))Hh(Mt,J,st,It,ee,zt)}}function Hh(B,J,st,et,nt,Tt){if(z!==null&&nt.isNodeMaterial)z.setObject(B,nt);if(B.onBeforeRender(G,J,st,et,nt,Tt),B.modelViewMatrix.multiplyMatrices(st.matrixWorldInverse,B.matrixWorld),B.normalMatrix.getNormalMatrix(B.modelViewMatrix),nt.onBeforeRender(G,J,st,et,B,Tt),nt.transparent===!0&&nt.side===Ln&&nt.forceSinglePass===!1)nt.side=mn,nt.needsUpdate=!0,G.renderBufferDirect(st,J,et,nt,B,Tt),nt.side=ci,nt.needsUpdate=!0,G.renderBufferDirect(st,J,et,nt,B,Tt),nt.side=Ln;else G.renderBufferDirect(st,J,et,nt,B,Tt);B.onAfterRender(G,J,st,et,nt,Tt)}function Gh(B){let J=0;for(let st of B)if(st.texture!==null)J++;return J}function rr(B,J,st){if(J.isScene!==!0)J=Be;let et=Xt.get(B),nt=D.state.lights,Tt=D.state.shadowsArray,Ut=nt.state.version,Mt=gt.getParameters(B,nt.state,Tt,J,st,D.state.lightProbeGridArray),It=gt.getProgramCacheKey(Mt),zt=et.programs;et.environment=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?J.environment:null,et.fog=J.fog;let ee=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap;if(et.envMap=ln.get(B.envMap||et.environment,ee),et.envMapRotation=et.environment!==null&&B.envMap===null?J.environmentRotation:B.envMapRotation,zt===void 0)B.addEventListener("dispose",Pt),zt=new Map,et.programs=zt,et.programVariants=new Map;let fe=zt.get(It);if(fe!==void 0){if(et.currentProgram===fe&&et.lightsStateVersion===Ut)return Wh(B,Mt),fe}else{if(Mt.uniforms=gt.getUniforms(B),z!==null&&B.isNodeMaterial)z.build(B,st,Mt);B.onBeforeCompile(Mt,G),fe=gt.acquireProgram(Mt,It),zt.set(It,fe),et.uniforms=Mt.uniforms}let Ft=et.uniforms;if(!B.isShaderMaterial&&!B.isRawShaderMaterial||B.clipping===!0)Ft.clippingPlanes=at.uniform;if(Wh(B,Mt),et.needsLights=cm(B),et.lightsStateVersion=Ut,et.needsLights)Ft.ambientLightColor.value=nt.state.ambient,Ft.lightProbe.value=nt.state.probe,Ft.sunLights.value=nt.state.sun,Ft.sunLightShadows.value=nt.state.sunShadow,Ft.directionalLights.value=nt.state.directional,Ft.directionalLightShadows.value=nt.state.directionalShadow,Ft.spotLights.value=nt.state.spot,Ft.spotLightShadows.value=nt.state.spotShadow,Ft.rectAreaLights.value=nt.state.rectArea,Ft.ltc_1.value=nt.state.rectAreaLTC1,Ft.ltc_2.value=nt.state.rectAreaLTC2,Ft.pointLights.value=nt.state.point,Ft.pointLightShadows.value=nt.state.pointShadow,Ft.hemisphereLights.value=nt.state.hemi,Ft.sunShadowMatrix.value=nt.state.sunShadowMatrix,Ft.sunShadowCascade.value=nt.state.sunShadowCascade,Ft.directionalShadowMatrix.value=nt.state.directionalShadowMatrix,Ft.spotLightMatrix.value=nt.state.spotLightMatrix,Ft.spotLightMap.value=nt.state.spotLightMap,Ft.pointShadowMatrix.value=nt.state.pointShadowMatrix;return et.numLightProbeGrids=Gh(D.state.lightProbeGridArray),et.currentProgram=fe,et.uniformsList=null,fe}function om(B,J,st,et,nt){let Tt=Xt.get(B),Ut=Tt.currentProgram.id+","+et+","+nt,Mt=Tt.programVariants.get(Ut);if(Mt===void 0)Mt=rr(B,J,st),Tt.programVariants.set(Ut,Mt);else Tt.currentProgram=Mt,Tt.uniformsList=null,Tt.outputColorSpace=et,Tt.toneMapping=nt;return Mt}function Vh(B){if(B.uniformsList===null){let J=B.currentProgram.getUniforms();B.uniformsList=Br.seqWithValue(J.seq,B.uniforms)}return B.uniformsList}function Wh(B,J){let st=Xt.get(B);st.outputColorSpace=J.outputColorSpace,st.batching=J.batching,st.batchingColor=J.batchingColor,st.instancing=J.instancing,st.instancingColor=J.instancingColor,st.instancingMorph=J.instancingMorph,st.skinning=J.skinning,st.morphTargets=J.morphTargets,st.morphNormals=J.morphNormals,st.morphColors=J.morphColors,st.morphTargetsCount=J.morphTargetsCount,st.numClippingPlanes=J.numClippingPlanes,st.numIntersection=J.numClipIntersection,st.vertexAlphas=J.vertexAlphas,st.vertexTangents=J.vertexTangents,st.toneMapping=J.toneMapping}function am(B,J,st,et,nt){if(J.isScene!==!0)J=Be;te.resetTextureUnits();let Tt=J.fog,Ut=et.isMeshStandardMaterial||et.isMeshLambertMaterial||et.isMeshPhongMaterial?J.environment:null,Mt=j===null?G.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:he.workingColorSpace,It=et.isMeshStandardMaterial||et.isMeshLambertMaterial&&!et.envMap||et.isMeshPhongMaterial&&!et.envMap,zt=ln.get(et.envMap||Ut,It),ee=et.vertexColors===!0&&!!st.attributes.color&&st.attributes.color.itemSize===4,fe=!!st.attributes.tangent&&(!!et.normalMap||et.anisotropy>0),Ft=!!st.morphAttributes.position,pe=!!st.morphAttributes.normal,He=!!st.morphAttributes.color,De=Yn;if(et.toneMapped){if(j===null||j.isXRRenderTarget===!0)De=G.toneMapping}let Pe=st.morphAttributes.position||st.morphAttributes.normal||st.morphAttributes.color,cn=Pe!==void 0?Pe.length:0,Ot=Xt.get(et),vn=D.state.lights;if(ae===!0){if(me===!0||B!==rt){let Fe=B===rt&&et.id===xt;at.setState(et,B,Fe)}}let ye=!1,ki=!1;if(et.version===Ot.__version){if(Ot.needsLights&&Ot.lightsStateVersion!==vn.state.version)ye=!0;else if(nt.isBatchedMesh&&Ot.batching===!1)ye=!0;else if(!nt.isBatchedMesh&&Ot.batching===!0)ye=!0;else if(nt.isBatchedMesh&&Ot.batchingColor===!0&&nt._colorsTexture===null)ye=!0;else if(nt.isBatchedMesh&&Ot.batchingColor===!1&&nt._colorsTexture!==null)ye=!0;else if(nt.isInstancedMesh&&Ot.instancing===!1)ye=!0;else if(!nt.isInstancedMesh&&Ot.instancing===!0)ye=!0;else if(nt.isSkinnedMesh&&Ot.skinning===!1)ye=!0;else if(!nt.isSkinnedMesh&&Ot.skinning===!0)ye=!0;else if(nt.isInstancedMesh&&Ot.instancingColor===!0&&nt.instanceColor===null)ye=!0;else if(nt.isInstancedMesh&&Ot.instancingColor===!1&&nt.instanceColor!==null)ye=!0;else if(nt.isInstancedMesh&&Ot.instancingMorph===!0&&nt.morphTexture===null)ye=!0;else if(nt.isInstancedMesh&&Ot.instancingMorph===!1&&nt.morphTexture!==null)ye=!0;else if(Ot.envMap!==zt)ye=!0;else if(et.fog===!0&&Ot.fog!==Tt)ye=!0;else if(Ot.numClippingPlanes!==void 0&&(Ot.numClippingPlanes!==at.numPlanes||Ot.numIntersection!==at.numIntersection))ye=!0;else if(Ot.vertexAlphas!==ee)ye=!0;else if(Ot.vertexTangents!==fe)ye=!0;else if(Ot.morphTargets!==Ft)ye=!0;else if(Ot.morphNormals!==pe)ye=!0;else if(Ot.morphColors!==He)ye=!0;else if(Ot.morphTargetsCount!==cn)ye=!0;else if(Ot.numLightProbeGrids!==Gh(D.state.lightProbeGridArray))ye=!0;else if(Ot.outputColorSpace!==Mt||Ot.toneMapping!==De)ki=!0}else ye=!0,Ot.__version=et.version;let hn=Ot.currentProgram;if(ye===!0||ki===!0){if(hn=ki===!0?om(et,J,nt,Mt,De):rr(et,J,nt),z&&et.isNodeMaterial)z.onUpdateProgram(et,hn,Ot)}let Kr=!1,xi=!1,zi=!1,xe=hn.getUniforms(),sn=Ot.uniforms;if(pt.useProgram(hn.program))Kr=!0,xi=!0,zi=!0;if(et.id!==xt)xt=et.id,xi=!0;if(Kr||rt!==B){if(pt.buffers.depth.getReversed()&&B.reversedDepth!==!0)B._reversedDepth=!0,B.updateProjectionMatrix();xe.setValue(K,"projectionMatrix",B.projectionMatrix),xe.setValue(K,"viewMatrix",B.matrixWorldInverse);let Ke=xe.map.cameraPosition;if(Ke!==void 0)Ke.setValue(K,le.setFromMatrixPosition(B.matrixWorld));if(Gt.logarithmicDepthBuffer)xe.setValue(K,"logDepthBufFC",2/(Math.log(B.far+1)/Math.LN2));if(et.isMeshPhongMaterial||et.isMeshToonMaterial||et.isMeshLambertMaterial||et.isMeshBasicMaterial||et.isMeshStandardMaterial||et.isShaderMaterial)xe.setValue(K,"isOrthographic",B.isOrthographicCamera===!0);if(rt!==B)rt=B,xi=!0,zi=!0}if(Ot.needsLights){if(vn.state.sunShadowMap.length>0)xe.setValue(K,"sunShadowMap",vn.state.sunShadowMap,te);if(vn.state.directionalShadowMap.length>0)xe.setValue(K,"directionalShadowMap",vn.state.directionalShadowMap,te);if(vn.state.spotShadowMap.length>0)xe.setValue(K,"spotShadowMap",vn.state.spotShadowMap,te);if(vn.state.pointShadowMap.length>0)xe.setValue(K,"pointShadowMap",vn.state.pointShadowMap,te)}if(nt.isSkinnedMesh){xe.setOptional(K,nt,"bindMatrix"),xe.setOptional(K,nt,"bindMatrixInverse");let Fe=nt.skeleton;if(Fe){if(Fe.boneTexture===null)Fe.computeBoneTexture();xe.setValue(K,"boneTexture",Fe.boneTexture,te)}}if(nt.isBatchedMesh){if(xe.setOptional(K,nt,"batchingTexture"),xe.setValue(K,"batchingTexture",nt._matricesTexture,te),xe.setOptional(K,nt,"batchingIdTexture"),xe.setValue(K,"batchingIdTexture",nt._indirectTexture,te),xe.setOptional(K,nt,"batchingColorTexture"),nt._colorsTexture!==null)xe.setValue(K,"batchingColorTexture",nt._colorsTexture,te)}let On=st.morphAttributes;if(On.position!==void 0||On.normal!==void 0||On.color!==void 0)Y.update(nt,st,hn);if(xi||Ot.receiveShadow!==nt.receiveShadow)Ot.receiveShadow=nt.receiveShadow,xe.setValue(K,"receiveShadow",nt.receiveShadow);if((et.isMeshStandardMaterial||et.isMeshLambertMaterial||et.isMeshPhongMaterial)&&et.envMap===null&&J.environment!==null)sn.envMapIntensity.value=J.environmentIntensity;if(sn.dfgLUT!==void 0)sn.dfgLUT.value=vy();if(xi){if(xe.setValue(K,"toneMappingExposure",G.toneMappingExposure),Ot.needsLights)lm(sn,zi);if(Tt&&et.fog===!0)ft.refreshFogUniforms(sn,Tt);if(ft.refreshMaterialUniforms(sn,et,kt,Bt,D.state.transmissionRenderTarget[B.id]),Ot.needsLights&&Ot.numLightProbeGrids>0){let Fe=U,Ke=0;for(let ti of D.state.lightProbeGridArray){if(ti.texture===null)continue;Fe.textures[Ke]=ti.texture,Fe.min[Ke]=ti.boundingBox.min,Fe.max[Ke]=ti.boundingBox.max,Fe.resolution[Ke]=ti.resolution,Ke++}for(let ti in Fe)Fe[ti].length=Ke;sn.probesSH.value=Fe.textures,sn.probesMin.value=Fe.min,sn.probesMax.value=Fe.max,sn.probesResolution.value=Fe.resolution}Br.upload(K,Vh(Ot),sn,te)}if(et.isShaderMaterial&&et.uniformsNeedUpdate===!0)Br.upload(K,Vh(Ot),sn,te),et.uniformsNeedUpdate=!1;if(et.isSpriteMaterial)xe.setValue(K,"center",nt.center);if(xe.setValue(K,"modelViewMatrix",nt.modelViewMatrix),xe.setValue(K,"normalMatrix",nt.normalMatrix),xe.setValue(K,"modelMatrix",nt.matrixWorld),et.uniformsGroups!==void 0){let Fe=et.uniformsGroups;for(let Ke=0,ti=Fe.length;Ke<ti;Ke++){let qh=Fe[Ke];wt.update(qh,hn),wt.bind(qh,hn)}}return hn}function lm(B,J){B.ambientLightColor.needsUpdate=J,B.lightProbe.needsUpdate=J,B.sunLights.needsUpdate=J,B.sunLightShadows.needsUpdate=J,B.directionalLights.needsUpdate=J,B.directionalLightShadows.needsUpdate=J,B.pointLights.needsUpdate=J,B.pointLightShadows.needsUpdate=J,B.spotLights.needsUpdate=J,B.spotLightShadows.needsUpdate=J,B.rectAreaLights.needsUpdate=J,B.hemisphereLights.needsUpdate=J}function cm(B){return B.isMeshLambertMaterial||B.isMeshToonMaterial||B.isMeshPhongMaterial||B.isMeshStandardMaterial||B.isShadowMaterial||B.isShaderMaterial&&B.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return it},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(B,J,st){let et=Xt.get(B);if(et.__autoAllocateDepthBuffer=B.resolveDepthBuffer===!1,et.__autoAllocateDepthBuffer===!1)et.__useRenderToTexture=!1;Xt.get(B.texture).__webglTexture=J,Xt.get(B.depthTexture).__webglTexture=et.__autoAllocateDepthBuffer?void 0:st,et.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(B,J){let st=Xt.get(B);st.__webglFramebuffer=J,st.__useDefaultFramebuffer=J===void 0},this.setRenderTarget=function(B,J=0,st=0){j=B,Q=J,it=st;let et=null,nt=!1,Tt=!1;if(B){let Mt=Xt.get(B);if(Mt.__useDefaultFramebuffer!==void 0){pt.bindFramebuffer(K.FRAMEBUFFER,Mt.__webglFramebuffer),dt.copy(B.viewport),_t.copy(B.scissor),Nt=B.scissorTest,pt.viewport(dt),pt.scissor(_t),pt.setScissorTest(Nt),xt=-1;return}else if(Mt.__webglFramebuffer===void 0)te.setupRenderTarget(B);else if(Mt.__hasExternalTextures)te.rebindTextures(B,Xt.get(B.texture).__webglTexture,Xt.get(B.depthTexture).__webglTexture);else if(B.depthBuffer){let ee=B.depthTexture;if(Mt.__boundDepthTexture!==ee){if(ee!==null&&Xt.has(ee)&&(B.width!==ee.image.width||B.height!==ee.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(B)}}let It=B.texture;if(It.isData3DTexture||It.isDataArrayTexture||It.isCompressedArrayTexture)Tt=!0;let zt=Xt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget){if(Array.isArray(zt[J]))et=zt[J][st];else et=zt[J];nt=!0}else if(B.samples>0&&te.useMultisampledRTT(B)===!1)et=Xt.get(B).__webglMultisampledFramebuffer;else if(Array.isArray(zt))et=zt[st];else et=zt;dt.copy(B.viewport),_t.copy(B.scissor),Nt=B.scissorTest}else dt.copy(jt).multiplyScalar(kt).floor(),_t.copy(Dt).multiplyScalar(kt).floor(),Nt=Jt;if(st!==0)et=W;if(pt.bindFramebuffer(K.FRAMEBUFFER,et))pt.drawBuffers(B,et);if(pt.viewport(dt),pt.scissor(_t),pt.setScissorTest(Nt),nt){let Mt=Xt.get(B.texture);K.framebufferTexture2D(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_CUBE_MAP_POSITIVE_X+J,Mt.__webglTexture,st)}else if(Tt){let Mt=J;for(let It=0;It<B.textures.length;It++){let zt=Xt.get(B.textures[It]);K.framebufferTextureLayer(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0+It,zt.__webglTexture,st,Mt)}}else if(B!==null&&st!==0){let Mt=Xt.get(B.texture);K.framebufferTexture2D(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,Mt.__webglTexture,st)}xt=-1};function Xh(B){let J=Xt.get(B);if(J.__readFormat!==B.format||J.__readType!==B.type)J.__readFormat=B.format,J.__readType=B.type,J.__formatReadable=Gt.textureFormatReadable(B.format),J.__typeReadable=Gt.textureTypeReadable(B.type);return J}if(this.readRenderTargetPixels=function(B,J,st,et,nt,Tt,Ut,Mt=0){if(!(B&&B.isWebGLRenderTarget)){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let It=Xt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget&&Ut!==void 0){if(It=It[Ut],Array.isArray(It))It=It[0]}if(It){pt.bindFramebuffer(K.FRAMEBUFFER,It);try{let zt=B.textures[Mt],{format:ee,type:fe}=zt;if(B.textures.length>1)K.readBuffer(K.COLOR_ATTACHMENT0+Mt);let Ft=Xh(zt);if(Ft.__formatReadable===!1){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ft.__typeReadable===!1){Zt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(J>=0&&J<=B.width-et&&(st>=0&&st<=B.height-nt))K.readPixels(J,st,et,nt,vt.convert(ee),vt.convert(fe),Tt)}finally{let zt=j!==null?Xt.get(j).__webglFramebuffer:null;pt.bindFramebuffer(K.FRAMEBUFFER,zt)}}},this.readRenderTargetPixelsAsync=async function(B,J,st,et,nt,Tt,Ut,Mt=0){if(!(B&&B.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let It=Xt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget&&Ut!==void 0){if(It=It[Ut],Array.isArray(It))It=It[0]}if(It)if(J>=0&&J<=B.width-et&&(st>=0&&st<=B.height-nt)){pt.bindFramebuffer(K.FRAMEBUFFER,It);let zt=B.textures[Mt],{format:ee,type:fe}=zt;if(B.textures.length>1)K.readBuffer(K.COLOR_ATTACHMENT0+Mt);let Ft=Xh(zt);if(Ft.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ft.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let pe=K.createBuffer();K.bindBuffer(K.PIXEL_PACK_BUFFER,pe),K.bufferData(K.PIXEL_PACK_BUFFER,Tt.byteLength,K.STREAM_READ),K.readPixels(J,st,et,nt,vt.convert(ee),vt.convert(fe),0),K.bindBuffer(K.PIXEL_PACK_BUFFER,null);let He=j!==null?Xt.get(j).__webglFramebuffer:null;pt.bindFramebuffer(K.FRAMEBUFFER,He);let De=K.fenceSync(K.SYNC_GPU_COMMANDS_COMPLETE,0);return K.flush(),await ef(K,De,4),K.bindBuffer(K.PIXEL_PACK_BUFFER,pe),K.getBufferSubData(K.PIXEL_PACK_BUFFER,0,Tt),K.bindBuffer(K.PIXEL_PACK_BUFFER,null),K.deleteBuffer(pe),K.deleteSync(De),Tt}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(B,J=null,st=0){let et=Math.pow(2,-st),nt=Math.floor(B.image.width*et),Tt=Math.floor(B.image.height*et),Ut=J!==null?J.x:0,Mt=J!==null?J.y:0;te.setTexture2D(B,0),K.copyTexSubImage2D(K.TEXTURE_2D,st,0,0,Ut,Mt,nt,Tt),pt.unbindTexture()},this.copyTextureToTexture=function(B,J,st=null,et=null,nt=0,Tt=0){let Ut,Mt,It,zt,ee,fe,Ft,pe,He,De=B.isCompressedTexture?B.mipmaps[Tt]:B.image;if(st!==null)Ut=st.max.x-st.min.x,Mt=st.max.y-st.min.y,It=st.isBox3?st.max.z-st.min.z:1,zt=st.min.x,ee=st.min.y,fe=st.isBox3?st.min.z:0;else{let xe=Math.pow(2,-nt);if(Ut=Math.floor(De.width*xe),Mt=Math.floor(De.height*xe),B.isDataArrayTexture)It=De.depth;else if(B.isData3DTexture)It=Math.floor(De.depth*xe);else It=1;zt=0,ee=0,fe=0}if(et!==null)Ft=et.x,pe=et.y,He=et.z;else Ft=0,pe=0,He=0;let Pe=vt.convert(J.format),cn=vt.convert(J.type),Ot;if(J.isData3DTexture)te.setTexture3D(J,0),Ot=K.TEXTURE_3D;else if(J.isDataArrayTexture||J.isCompressedArrayTexture)te.setTexture2DArray(J,0),Ot=K.TEXTURE_2D_ARRAY;else te.setTexture2D(J,0),Ot=K.TEXTURE_2D;pt.activeTexture(K.TEXTURE0),pt.pixelStorei(K.UNPACK_FLIP_Y_WEBGL,J.flipY),pt.pixelStorei(K.UNPACK_PREMULTIPLY_ALPHA_WEBGL,J.premultiplyAlpha),pt.pixelStorei(K.UNPACK_ALIGNMENT,J.unpackAlignment);let vn=pt.getParameter(K.UNPACK_ROW_LENGTH),ye=pt.getParameter(K.UNPACK_IMAGE_HEIGHT),ki=pt.getParameter(K.UNPACK_SKIP_PIXELS),hn=pt.getParameter(K.UNPACK_SKIP_ROWS),Kr=pt.getParameter(K.UNPACK_SKIP_IMAGES);pt.pixelStorei(K.UNPACK_ROW_LENGTH,De.width),pt.pixelStorei(K.UNPACK_IMAGE_HEIGHT,De.height),pt.pixelStorei(K.UNPACK_SKIP_PIXELS,zt),pt.pixelStorei(K.UNPACK_SKIP_ROWS,ee),pt.pixelStorei(K.UNPACK_SKIP_IMAGES,fe);let xi=B.isDataArrayTexture||B.isData3DTexture,zi=J.isDataArrayTexture||J.isData3DTexture;if(B.isDepthTexture){let xe=Xt.get(B),sn=Xt.get(J),On=Xt.get(xe.__renderTarget),Fe=Xt.get(sn.__renderTarget);pt.bindFramebuffer(K.READ_FRAMEBUFFER,On.__webglFramebuffer),pt.bindFramebuffer(K.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let Ke=0;Ke<It;Ke++){if(xi)K.framebufferTextureLayer(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,Xt.get(B).__webglTexture,nt,fe+Ke),K.framebufferTextureLayer(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,Xt.get(J).__webglTexture,Tt,He+Ke);K.blitFramebuffer(zt,ee,zt+Ut,ee+Mt,Ft,pe,Ft+Ut,pe+Mt,K.DEPTH_BUFFER_BIT,K.NEAREST)}pt.bindFramebuffer(K.READ_FRAMEBUFFER,null),pt.bindFramebuffer(K.DRAW_FRAMEBUFFER,null)}else if(nt!==0||B.isRenderTargetTexture||Xt.has(B)){let xe=Xt.get(B),sn=Xt.get(J);pt.bindFramebuffer(K.READ_FRAMEBUFFER,Z),pt.bindFramebuffer(K.DRAW_FRAMEBUFFER,V);for(let On=0;On<It;On++){if(xi)K.framebufferTextureLayer(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,xe.__webglTexture,nt,fe+On);else K.framebufferTexture2D(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,xe.__webglTexture,nt);if(zi)K.framebufferTextureLayer(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,sn.__webglTexture,Tt,He+On);else K.framebufferTexture2D(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,sn.__webglTexture,Tt);if(nt!==0)K.blitFramebuffer(zt,ee,zt+Ut,ee+Mt,Ft,pe,Ft+Ut,pe+Mt,K.COLOR_BUFFER_BIT,K.NEAREST);else if(zi)K.copyTexSubImage3D(Ot,Tt,Ft,pe,He+On,zt,ee,Ut,Mt);else K.copyTexSubImage2D(Ot,Tt,Ft,pe,zt,ee,Ut,Mt)}pt.bindFramebuffer(K.READ_FRAMEBUFFER,null),pt.bindFramebuffer(K.DRAW_FRAMEBUFFER,null)}else if(zi)if(B.isDataTexture||B.isData3DTexture)K.texSubImage3D(Ot,Tt,Ft,pe,He,Ut,Mt,It,Pe,cn,De.data);else if(J.isCompressedArrayTexture)K.compressedTexSubImage3D(Ot,Tt,Ft,pe,He,Ut,Mt,It,Pe,De.data);else K.texSubImage3D(Ot,Tt,Ft,pe,He,Ut,Mt,It,Pe,cn,De);else if(B.isDataTexture)K.texSubImage2D(K.TEXTURE_2D,Tt,Ft,pe,Ut,Mt,Pe,cn,De.data);else if(B.isCompressedTexture)K.compressedTexSubImage2D(K.TEXTURE_2D,Tt,Ft,pe,De.width,De.height,Pe,De.data);else K.texSubImage2D(K.TEXTURE_2D,Tt,Ft,pe,Ut,Mt,Pe,cn,De);if(pt.pixelStorei(K.UNPACK_ROW_LENGTH,vn),pt.pixelStorei(K.UNPACK_IMAGE_HEIGHT,ye),pt.pixelStorei(K.UNPACK_SKIP_PIXELS,ki),pt.pixelStorei(K.UNPACK_SKIP_ROWS,hn),pt.pixelStorei(K.UNPACK_SKIP_IMAGES,Kr),Tt===0&&J.generateMipmaps===!0&&J.mipmapsAutoUpdate===!0)K.generateMipmap(Ot);pt.unbindTexture()},this.initRenderTarget=function(B){if(Xt.get(B).__webglFramebuffer===void 0)te.setupRenderTarget(B)},this.initTexture=function(B){if(B.isCubeTexture)te.setTextureCube(B,0);else if(B.isData3DTexture)te.setTexture3D(B,0);else if(B.isDataArrayTexture||B.isCompressedArrayTexture)te.setTexture2DArray(B,0);else te.setTexture2D(B,0);pt.unbindTexture()},this.resetState=function(){Q=0,it=0,j=null,pt.reset(),yt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Rc}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(d){this._outputColorSpace=d;let p=this.getContext();p.drawingBufferColorSpace=he._getDrawingBufferColorSpace(d),p.unpackColorSpace=he._getUnpackColorSpace()}}class oh extends ta{constructor(d){super(d)}parse(d,p){let m={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},g=542327876,_=131072,x=512,v=1024,y=2048,S=4096,b=8192,M=16384,T=32768,E=95,w=96;function C(Dt){return Dt.charCodeAt(0)+(Dt.charCodeAt(1)<<8)+(Dt.charCodeAt(2)<<16)+(Dt.charCodeAt(3)<<24)}function N(Dt){return String.fromCharCode(Dt&255,Dt>>8&255,Dt>>16&255,Dt>>24&255)}function A(Dt,Jt,Yt,Kt){let ae=Yt*Kt*4,me=new Uint8Array(Dt,Jt,ae),Te=new Uint8Array(ae),le=0,de=0;for(let Be=0;Be<Kt;Be++)for(let ke=0;ke<Yt;ke++){let en=me[de];de++;let K=me[de];de++;let nn=me[de];de++;let ht=me[de];de++,Te[le]=nn,le++,Te[le]=K,le++,Te[le]=en,le++,Te[le]=ht,le++}return Te}function R(Dt,Jt,Yt,Kt){let ae=Yt*Kt*3,me=new Uint8Array(Dt,Jt,ae),Te=new Uint8Array(Yt*Kt*4),le=0,de=0;for(let Be=0;Be<Kt;Be++)for(let ke=0;ke<Yt;ke++){let en=me[de];de++;let K=me[de];de++;let nn=me[de];de++,Te[le]=nn,le++,Te[le]=K,le++,Te[le]=en,le++,Te[le]=255,le++}return Te}let I=C("DXT1"),U=C("DXT3"),L=C("DXT5"),D=C("ETC1"),k=C("DX10"),P=31,F=5,G=0,H=1,z=2,W=3,Z=4,V=7,Q=21,it=22,j=23,xt=24,rt=25,dt=26,_t=28,Nt=0,ot=new Int32Array(d,0,P);if(ot[G]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),m;let mt,Rt=ot[Q],Bt=!1,kt=!1,Lt=ot[H]+4;switch(Rt){case I:mt=8,m.format=Os;break;case U:mt=16,m.format=Bs;break;case L:mt=16,m.format=ks;break;case D:mt=8,m.format=Mr;break;case k:Lt+=F*4;let Jt=new Int32Array(d,(P+1)*4,F)[Nt];switch(Jt){case 96:{mt=16,m.format=Er;break}case 95:{mt=16,m.format=Tr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",Jt),m}break;default:if(ot[it]===32&&ot[j]&16711680&&ot[xt]&65280&&ot[rt]&255&&ot[dt]&4278190080)Bt=!0,mt=64,m.format=Nn;else if(ot[it]===24&&ot[j]&16711680&&ot[xt]&65280&&ot[rt]&255)kt=!0,mt=64,m.format=Nn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",N(Rt)),m}if(m.mipmapCount=1,ot[z]&131072&&p!==!1)m.mipmapCount=Math.max(1,ot[V]);let ie=ot[_t];if(m.isCubemap=ie&512?!0:!1,m.isCubemap&&(!(ie&1024)||!(ie&2048)||!(ie&4096)||!(ie&8192)||!(ie&16384)||!(ie&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),m;m.width=ot[Z],m.height=ot[W];let jt=m.isCubemap?6:1;for(let Dt=0;Dt<jt;Dt++){let{width:Jt,height:Yt}=m;for(let Kt=0;Kt<m.mipmapCount;Kt++){let ae,me;if(Bt)ae=A(d,Lt,Jt,Yt),me=ae.length;else if(kt)ae=R(d,Lt,Jt,Yt),me=Jt*Yt*3;else me=Math.ceil(Jt/4)*Math.ceil(Yt/4)*mt,ae=new Uint8Array(d,Lt,me);let Te={data:ae,width:Jt,height:Yt};m.mipmaps.push(Te),Lt+=me,Jt=Math.max(Jt>>1,1),Yt=Math.max(Yt>>1,1)}}return m}}var jf=0,Qf=1,tp=2;var ah=2;var pa=1.25,lh=1,tn=32,Re=8,ma=65535;var Gs=Math.pow(2,-24),zr=Symbol("SKIP_GENERATION"),ga={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[zr]:!1};function Le(d,p,m){return m.min.x=p[d],m.min.y=p[d+1],m.min.z=p[d+2],m.max.x=p[d+3],m.max.y=p[d+4],m.max.z=p[d+5],m}function Hr(d){let p=-1,m=-1/0;for(let g=0;g<3;g++){let _=d[g+3]-d[g];if(_>m)m=_,p=g}return p}function ch(d,p,m){for(let g=0;g<3;g++){let _=p[d+2*g],x=p[d+2*g+1],v=_-x,y=_+x;if(v<m[g])m[g]=v;if(y>m[g+3])m[g+3]=y}}function _a(d){let p=d[3]-d[0],m=d[4]-d[1],g=d[5]-d[2];return 2*(p*m+m*g+g*p)}function ge(d,p){return p[d+15]===ma}function Ee(d,p){return p[d+6]}function Ce(d,p){return p[d+14]}function be(d){return d+Re}function Me(d,p){let m=p[d+6];return d+m*Re}function Vs(d,p){return p[d+7]}function Ue(d){return d}function xa(d,p,m,g,_){let x=1/0,v=1/0,y=1/0,S=-1/0,b=-1/0,M=-1/0,T=1/0,E=1/0,w=1/0,C=-1/0,N=-1/0,A=-1/0,R=d.offset||0;for(let I=(p-R)*6,U=(p+m-R)*6;I<U;I+=6){let L=d[I+0],D=d[I+1],k=L-D,P=L+D;if(k<x)x=k;if(P>S)S=P;if(L<T)T=L;if(L>C)C=L;let F=d[I+2],G=d[I+3],H=F-G,z=F+G;if(H<v)v=H;if(z>b)b=z;if(F<E)E=F;if(F>N)N=F;let W=d[I+4],Z=d[I+5],V=W-Z,Q=W+Z;if(V<y)y=V;if(Q>M)M=Q;if(W<w)w=W;if(W>A)A=W}g[0]=x,g[1]=v,g[2]=y,g[3]=S,g[4]=b,g[5]=M,_[0]=T,_[1]=E,_[2]=w,_[3]=C,_[4]=N,_[5]=A}var jn=8,uh=8,hh=new Int32Array(jn),Kn=new Float32Array(jn*6),Ws=new Float32Array(jn*6),Vn=new Float32Array(6),va=new Float32Array(6),Di=new Int32Array(uh),ep=new Float32Array(uh*6);function Sy(d,p,m,g){for(let _=0;_<3;_++){let x=p[d+2*_],v=p[d+2*_+1],y=x-v,S=x+v;if(y<m[g+_])m[g+_]=y;if(S>m[g+_+3])m[g+_+3]=S}}function np(d,p){let m=d[p+3]-d[p],g=d[p+4]-d[p+1],_=d[p+5]-d[p+2];return 2*(m*g+g*_+_*m)}function ip(d,p,m,g,_,x){let v=-1,y=0;if(x===jf){if(v=Hr(p),v!==-1)y=(p[v]+p[v+3])/2}else if(x===Qf){if(v=Hr(d),v!==-1)y=by(m,g,_,v)}else if(x===tp){let S=_a(d),b=pa*_,M=m.offset||0,T=(g-M)*6,E=(g+_-M)*6;for(let w=0;w<3;w++){let C=p[w],R=(p[w+3]-C)/jn;if(_<uh){for(let I=0;I<_;I++){let U=T+I*6,L=m[U+2*w],D=I;while(D>0&&m[Di[D-1]+2*w]>L)Di[D]=Di[D-1],D--;Di[D]=U}for(let I=0;I<3;I++)Vn[I]=1/0,Vn[I+3]=-1/0,va[I]=1/0,va[I+3]=-1/0;for(let I=_-1;I>=0;I--)ch(Di[I],m,va),ep.set(va,I*6);for(let I=0;I<_-1;I++){ch(Di[I],m,Vn);let U=m[Di[I+1]+2*w];if(m[Di[I]+2*w]===U)continue;let L=I+1,D=_-L,k=_a(Vn)/S,P=np(ep,L*6)/S,F=lh+pa*(k*L+P*D);if(F<b)v=w,b=F,y=U}}else{for(let L=0;L<jn;L++){hh[L]=0;for(let D=0;D<3;D++)Kn[L*6+D]=1/0,Kn[L*6+D+3]=-1/0}for(let L=T;L<E;L+=6){let P=~~((m[L+2*w]-C)/R);if(P>=jn)P=jn-1;hh[P]++,Sy(L,m,Kn,P*6)}let I=(jn-1)*6;for(let L=0;L<6;L++)Ws[I+L]=Kn[I+L];for(let L=jn-2;L>=0;L--){let D=L*6,k=D+6;for(let P=0;P<3;P++)Ws[D+P]=Math.min(Kn[D+P],Ws[k+P]),Ws[D+P+3]=Math.max(Kn[D+P+3],Ws[k+P+3])}let U=0;for(let L=0;L<jn-1;L++){let D=L*6,k=hh[L];if(k!==0)for(let z=0;z<3;z++)if(U===0)Vn[z]=Kn[D+z],Vn[z+3]=Kn[D+z+3];else Vn[z]=Math.min(Vn[z],Kn[D+z]),Vn[z+3]=Math.max(Vn[z+3],Kn[D+z+3]);U+=k;let P=0,F=0;if(U!==0)P=_a(Vn)/S;let G=_-U;if(G!==0)F=np(Ws,D+6)/S;let H=lh+pa*(P*U+F*G);if(H<b)v=w,b=H,y=C+R+L*R}}}}else console.warn(`BVH: Invalid build strategy value ${x} used.`);return{axis:v,pos:y}}function by(d,p,m,g){let _=0,x=d.offset;for(let v=p,y=p+m;v<y;v++)_+=d[(v-x)*6+g*2];return _/m}function sp(d,p,m,g,_,x){let v=g,y=g+_-1,S=x.pos,b=x.axis*2,M=m.offset||0;while(!0){while(v<=y&&m[(v-M)*6+b]<S)v++;while(v<=y&&m[(y-M)*6+b]>=S)y--;if(v<y){for(let T=0;T<p;T++){let E=d[v*p+T];d[v*p+T]=d[y*p+T],d[y*p+T]=E}for(let T=0;T<6;T++){let E=v-M,w=y-M,C=m[E*6+T];m[E*6+T]=m[w*6+T],m[w*6+T]=C}v++,y--}else return v}}var My=Math.pow(2,32),Xs=new Float32Array(6),ya=new Float32Array(6);function Ey(d,p,m,g,_,x){let{maxDepth:v,verbose:y,targetLeafSize:S,_strictLeafSize:b=1/0,strategy:M,onProgress:T,useSharedArrayBuffer:E=!1}=_,{primitiveBuffer:w,primitiveBufferStride:C}=d,A=new(E?SharedArrayBuffer:ArrayBuffer)(tn*Math.max(1,2*Math.ceil(g)-1)),R=new Float32Array(A),I=new Uint32Array(A),U=new Uint16Array(A),L=0,D=!1;return xa(p,m,g,Xs,ya),F(m,g,0),A.slice(0,L*tn);function k(G){if(T)T((G-x.offset)/x.count)}function P(G,H,z){let W=G*2;I[G+6]=H,U[W+14]=z,U[W+15]=ma,k(H+z)}function F(G,H,z){let W=L++,Z=W*Re;if(R.set(Xs,Z),!D&&z>=v){if(D=!0,y)console.warn(`BVH: Max depth of ${v} reached when generating BVH. Consider increasing maxDepth.`)}let V=H>b;if(H<=S&&!V||z>=v){P(Z,G,H);return}let Q=ip(Xs,ya,p,G,H,M),it=Q.axis===-1?-1:sp(w,C,p,G,H,Q);if(Q.axis===-1||it===G||it===G+H){if(!V){P(Z,G,H);return}Q.axis=Math.max(0,Hr(Xs)),it=G+Math.max(1,Math.floor(H/2))}I[Z+7]=Q.axis;let j=it-G;xa(p,G,j,Xs,ya),F(G,j,z+1);let xt=L-W;if(xt>My)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");I[Z+6]=xt;let rt=H-j;xa(p,it,rt,Xs,ya),F(it,rt,z+1)}}function rp(d,p){let m=d.getRootRanges(p.range),g=m[0],_=m[m.length-1],x={offset:g.offset,count:_.offset+_.count-g.offset},v=new Float32Array(6*x.count);v.offset=x.offset,d.computePrimitiveBounds(x.offset,x.count,v),d._roots=m.map((y)=>Ey(d,v,y.offset,y.count,p,x))}class os{constructor(d){this._getNewPrimitive=d,this._primitives=[]}getPrimitive(){let d=this._primitives;if(d.length===0)return this._getNewPrimitive();else return d.pop()}releasePrimitive(d){this._primitives.push(d)}}class op{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let d=[],p=null;this.setBuffer=(m)=>{if(p)d.push(p);p=m,this.float32Array=new Float32Array(m),this.uint16Array=new Uint16Array(m),this.uint32Array=new Uint32Array(m)},this.clearBuffer=()=>{if(p=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,d.length!==0)this.setBuffer(d.pop())}}}var ue=new op;var Ui,Ys,qs=[],Sa=new os(()=>new Se);function ap(d,p,m,g,_,x){Ui=Sa.getPrimitive(),Ys=Sa.getPrimitive(),qs.push(Ui,Ys),ue.setBuffer(d._roots[p]);let v=dh(0,d.geometry,m,g,_,x);ue.clearBuffer(),Sa.releasePrimitive(Ui),Sa.releasePrimitive(Ys),qs.pop(),qs.pop();let y=qs.length;if(y>0)Ys=qs[y-1],Ui=qs[y-2];return v}function dh(d,p,m,g,_=null,x=0,v=0){let{float32Array:y,uint16Array:S,uint32Array:b}=ue,M=d*2;if(ge(M,S)){let E=Ee(d,b),w=Ce(M,S);return Le(Ue(d),y,Ui),g(E,w,!1,v,x+d/Re,Ui)}else{let H=function(W){let{uint16Array:Z,uint32Array:V}=ue,Q=W*2;while(!ge(Q,Z))W=be(W),Q=W*2;return Ee(W,V)},z=function(W){let{uint16Array:Z,uint32Array:V}=ue,Q=W*2;while(!ge(Q,Z))W=Me(W,V),Q=W*2;return Ee(W,V)+Ce(Q,Z)},E=be(d),w=Me(d,b),C=E,N=w,A,R,I,U;if(_){if(I=Ui,U=Ys,Le(Ue(C),y,I),Le(Ue(N),y,U),A=_(I),R=_(U),R<A){C=w,N=E;let W=A;A=R,R=W,I=U}}if(!I)I=Ui,Le(Ue(C),y,I);let L=ge(C*2,S),D=m(I,L,A,v+1,x+C/Re),k;if(D===ah){let W=H(C),V=z(C)-W;k=g(W,V,!0,v+1,x+C/Re,I)}else k=D&&dh(C,p,m,g,_,x,v+1);if(k)return!0;U=Ys,Le(Ue(N),y,U);let P=ge(N*2,S),F=m(U,P,R,v+1,x+N/Re),G;if(F===ah){let W=H(N),V=z(N)-W;G=g(W,V,!0,v+1,x+N/Re,U)}else G=F&&dh(N,p,m,g,_,x,v+1);if(G)return!0;return!1}}var Gr=new ue.constructor,ba=new ue.constructor,Fi=new os(()=>new Se),Zs=new Se,$s=new Se,fh=new Se,ph=new Se,mh=!1;function lp(d,p,m,g){if(mh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");mh=!0;let _=d._roots,x=p._roots,v,y=0,S=0,b=new se().copy(m).invert();for(let M=0,T=_.length;M<T;M++){Gr.setBuffer(_[M]),S=0;let E=Fi.getPrimitive();Le(Ue(0),Gr.float32Array,E),E.applyMatrix4(b);for(let w=0,C=x.length;w<C;w++)if(ba.setBuffer(x[w]),v=Wn(0,0,m,b,g,y,S,0,0,E),ba.clearBuffer(),S+=x[w].byteLength/tn,v)break;if(Fi.releasePrimitive(E),Gr.clearBuffer(),y+=_[M].byteLength/tn,v)break}return mh=!1,v}function Wn(d,p,m,g,_,x=0,v=0,y=0,S=0,b=null,M=!1){let T,E;if(M)T=ba,E=Gr;else T=Gr,E=ba;let w=T.float32Array,C=T.uint32Array,N=T.uint16Array,A=E.float32Array,R=E.uint32Array,I=E.uint16Array,U=d*2,L=p*2,D=ge(U,N),k=ge(L,I),P=!1;if(k&&D)if(M)P=_(Ee(p,R),Ce(p*2,I),Ee(d,C),Ce(d*2,N),S,v+p/Re,y,x+d/Re);else P=_(Ee(d,C),Ce(d*2,N),Ee(p,R),Ce(p*2,I),y,x+d/Re,S,v+p/Re);else if(k){let F=Fi.getPrimitive();Le(Ue(p),A,F),F.applyMatrix4(m);let G=be(d),H=Me(d,C);Le(Ue(G),w,Zs),Le(Ue(H),w,$s);let z=F.intersectsBox(Zs),W=F.intersectsBox($s);P=z&&Wn(p,G,g,m,_,v,x,S,y+1,F,!M)||W&&Wn(p,H,g,m,_,v,x,S,y+1,F,!M),Fi.releasePrimitive(F)}else{let F=be(p),G=Me(p,R);Le(Ue(F),A,fh),Le(Ue(G),A,ph);let H=b.intersectsBox(fh),z=b.intersectsBox(ph);if(H&&z)P=Wn(d,F,m,g,_,x,v,y,S+1,b,M)||Wn(d,G,m,g,_,x,v,y,S+1,b,M);else if(H)if(D)P=Wn(d,F,m,g,_,x,v,y,S+1,b,M);else{let W=Fi.getPrimitive();W.copy(fh).applyMatrix4(m);let Z=be(d),V=Me(d,C);Le(Ue(Z),w,Zs),Le(Ue(V),w,$s);let Q=W.intersectsBox(Zs),it=W.intersectsBox($s);P=Q&&Wn(F,Z,g,m,_,v,x,S,y+1,W,!M)||it&&Wn(F,V,g,m,_,v,x,S,y+1,W,!M),Fi.releasePrimitive(W)}else if(z)if(D)P=Wn(d,G,m,g,_,x,v,y,S+1,b,M);else{let W=Fi.getPrimitive();W.copy(ph).applyMatrix4(m);let Z=be(d),V=Me(d,C);Le(Ue(Z),w,Zs),Le(Ue(V),w,$s);let Q=W.intersectsBox(Zs),it=W.intersectsBox($s);P=Q&&Wn(G,Z,g,m,_,v,x,S,y+1,W,!M)||it&&Wn(G,V,g,m,_,v,x,S,y+1,W,!M),Fi.releasePrimitive(W)}}return P}var Ma=new class{constructor(){let d=null,p=null,m=null,g=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(x,v)=>{if(g)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=v,this.buffer=d=x._roots[v],this.uint16Array=m=new Uint16Array(d),this.uint32Array=p=new Uint32Array(d)},this.reset=()=>{this.root=null,this.buffer=d=null,this.uint16Array=m=null,this.uint32Array=p=null},this.getRangeStart=(x)=>{let v=x*2;while(!ge(v,m))x=be(x),v=x*2;return Ee(x,p)},this.getRangeEnd=(x)=>{let v=x*2;while(!ge(v,m))x=Me(x,p),v=x*2;return Ee(x,p)+Ce(v,m)};let _=(x,v,y)=>{let S=v*2,b=ge(S,m);if(!x(y,b,v)&&!b){let T=be(v),E=Me(v,p);_(x,T,y+1),_(x,E,y+1)}};this.traverseBuffer=(x)=>{if(g)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");g=!0;try{_(x,0,0)}finally{g=!1}},this.traverse=(x)=>{this.traverseBuffer((v,y,S)=>{if(y){let b=S*2,M=p[S+6],T=m[b+14];return x(v,y,new Float32Array(d,S*4,6),M,T)}else{let b=Vs(S,p);return x(v,y,new Float32Array(d,S*4,6),b)}})}}};var cp=new Se,Js=new Float32Array(6);class gh{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(d){if(d={...ga,...d},"maxLeafSize"in d)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),d={...d,targetLeafSize:d.maxLeafSize};rp(this,d)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(d,p,m,g){let _=1/0,x=1/0,v=1/0,y=-1/0,S=-1/0,b=-1/0;for(let M=d,T=d+p;M<T;M++){this.writePrimitiveBounds(M,Js,0);let[E,w,C,N,A,R]=Js;if(E<_)_=E;if(N>y)y=N;if(w<x)x=w;if(A>S)S=A;if(C<v)v=C;if(R>b)b=R}return m[g+0]=_,m[g+1]=x,m[g+2]=v,m[g+3]=y,m[g+4]=S,m[g+5]=b,m}computePrimitiveBounds(d,p,m){let g=m.offset||0;for(let _=d,x=d+p;_<x;_++){this.writePrimitiveBounds(_,Js,0);let[v,y,S,b,M,T]=Js,E=(v+b)/2,w=(y+M)/2,C=(S+T)/2,N=(b-v)/2,A=(M-y)/2,R=(T-S)/2,I=(_-g)*6;m[I+0]=E,m[I+1]=N+(Math.abs(E)+N)*Gs,m[I+2]=w,m[I+3]=A+(Math.abs(w)+A)*Gs,m[I+4]=C,m[I+5]=R+(Math.abs(C)+R)*Gs}return m}shiftPrimitiveOffsets(d){let p=this._indirectBuffer;if(p)for(let m=0,g=p.length;m<g;m++)p[m]+=d;else{let m=this._roots;for(let g=0;g<m.length;g++){let _=m[g],x=new Uint32Array(_),v=new Uint16Array(_),y=_.byteLength/tn;for(let S=0;S<y;S++){let b=Re*S,M=2*b;if(ge(M,v))x[b+6]+=d}}}}traverse(d,p=0){Ma.setBVH(this,p),Ma.traverse(d),Ma.reset()}refit(){let d=this._roots;for(let p=0,m=d.length;p<m;p++){let g=d[p],_=new Uint32Array(g),x=new Uint16Array(g),v=new Float32Array(g),y=g.byteLength/tn;for(let S=y-1;S>=0;S--){let b=S*Re,M=b*2;if(ge(M,x)){let E=Ee(b,_),w=Ce(M,x);this.writePrimitiveRangeBounds(E,w,Js,0),v.set(Js,b)}else{let E=be(b),w=Me(b,_);for(let C=0;C<3;C++){let N=v[E+C],A=v[E+C+3],R=v[w+C],I=v[w+C+3];v[b+C]=N<R?N:R,v[b+C+3]=A>I?A:I}}}}}getBoundingBox(d){return d.makeEmpty(),this._roots.forEach((m)=>{Le(0,new Float32Array(m),cp),d.union(cp)}),d}shapecast(d){let{boundsTraverseOrder:p,intersectsBounds:m,intersectsRange:g,intersectsPrimitive:_,scratchPrimitive:x,iterate:v}=d;if(g&&_){let M=g;g=(T,E,w,C,N)=>{if(!M(T,E,w,C,N))return v(T,E,this,_,w,C,x);return!0}}else if(!g)if(_)g=(M,T,E,w)=>v(M,T,this,_,E,w,x);else g=(M,T,E)=>E;let y=!1,S=0,b=this._roots;for(let M=0,T=b.length;M<T;M++){let E=b[M];if(y=ap(this,M,m,g,p,S),y)break;S+=E.byteLength/tn}return y}bvhcast(d,p,m){let{intersectsRanges:g}=m;return lp(this,d,p,g)}}function hp(){return typeof SharedArrayBuffer<"u"}function _h(d){return d.index?d.index.count:d.attributes.position.count}function Oi(d){return _h(d)/3}function Ty(d,p=ArrayBuffer){if(d>65535)return new Uint32Array(new p(4*d));else return new Uint16Array(new p(2*d))}function up(d,p){if(!d.index){let m=d.attributes.position.count,g=p.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,_=Ty(m,g);d.setIndex(new Xe(_,1));for(let x=0;x<m;x++)_[x]=x}}function wy(d,p,m){let g=_h(d)/m,_=p?p:d.drawRange,x=_.start/m,v=(_.start+_.count)/m,y=Math.max(0,x),S=Math.min(g,v)-y;return{offset:Math.floor(y),count:Math.floor(S)}}function Ay(d,p){return d.groups.map((m)=>({offset:m.start/p,count:m.count/p}))}function xh(d,p,m){let g=wy(d,p,m),_=Ay(d,m);if(!_.length)return[g];let x=[],v=g.offset,y=g.offset+g.count,S=_h(d)/m,b=[];for(let E of _){let{offset:w,count:C}=E,N=w,A=isFinite(C)?C:S-w,R=w+A;if(N<y&&R>v)b.push({pos:Math.max(v,N),isStart:!0}),b.push({pos:Math.min(y,R),isStart:!1})}b.sort((E,w)=>{if(E.pos!==w.pos)return E.pos-w.pos;else return E.type==="end"?-1:1});let M=0,T=null;for(let E of b){let w=E.pos;if(M!==0&&w!==T)x.push({offset:T,count:w-T});M+=E.isStart?1:-1,T=w}return x}function Ry(d,p){let m=d[d.length-1],g=m.offset+m.count>65536,_=d.reduce((b,M)=>b+M.count,0),x=g?4:2,v=p?new SharedArrayBuffer(_*x):new ArrayBuffer(_*x),y=g?new Uint32Array(v):new Uint16Array(v),S=0;for(let b=0;b<d.length;b++){let{offset:M,count:T}=d[b];for(let E=0;E<T;E++)y[S+E]=M+E;S+=T}return y}class vh extends gh{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(d){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(d){}constructor(d,p={}){if(!d.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(d.index&&d.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(p.useSharedArrayBuffer&&!hp())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=d,this.resolvePrimitiveIndex=p.indirect?(m)=>this._indirectBuffer[m]:(m)=>m,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,p={...ga,...p},!p[zr])this.init(p)}init(d){let{geometry:p,primitiveStride:m}=this;if(d.indirect){let g=xh(p,d.range,m),_=Ry(g,d.useSharedArrayBuffer);this._indirectBuffer=_}else up(p,d);if(super.init(d),!p.boundingBox&&d.setBoundingBox)p.boundingBox=this.getBoundingBox(new Se)}getRootRanges(d){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return xh(this.geometry,d,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class Pn{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(d,p){let m=1/0,g=-1/0;for(let _=0,x=d.length;_<x;_++){let y=d[_][p];m=y<m?y:m,g=y>g?y:g}this.min=m,this.max=g}setFromPoints(d,p){let m=1/0,g=-1/0;for(let _=0,x=p.length;_<x;_++){let v=p[_],y=d.dot(v);m=y<m?y:m,g=y>g?y:g}this.min=m,this.max=g}isSeparated(d){return this.min>d.max||d.min>this.max}}Pn.prototype.setFromBox=function(){let d=new q;return function(m,g){let{min:_,max:x}=g,v=1/0,y=-1/0;for(let S=0;S<=1;S++)for(let b=0;b<=1;b++)for(let M=0;M<=1;M++){d.x=_.x*S+x.x*(1-S),d.y=_.y*b+x.y*(1-b),d.z=_.z*M+x.z*(1-M);let T=m.dot(d);v=Math.min(T,v),y=Math.max(T,y)}this.min=v,this.max=y}}();var Qw=function(){let d=new Pn;return function(m,g){let{points:_,satAxes:x,satBounds:v}=m,{points:y,satAxes:S,satBounds:b}=g;for(let M=0;M<3;M++){let T=v[M],E=x[M];if(d.setFromPoints(E,y),T.isSeparated(d))return!1}for(let M=0;M<3;M++){let T=b[M],E=S[M];if(d.setFromPoints(E,_),T.isSeparated(d))return!1}}}();var Cy=function(){let d=new q,p=new q,m=new q;return function(_,x,v){let y=_.start,S=d,b=x.start,M=p;m.subVectors(y,b),d.subVectors(_.end,_.start),p.subVectors(x.end,x.start);let T=m.dot(M),E=M.dot(S),w=M.dot(M),C=m.dot(S),A=S.dot(S)*w-E*E,R,I;if(A!==0)R=(T*E-C*w)/A;else R=0;I=(T+R*E)/w,v.x=R,v.y=I}}(),Vr=function(){let d=new $t,p=new q,m=new q;return function(_,x,v,y){Cy(_,x,d);let{x:S,y:b}=d;if(S>=0&&S<=1&&b>=0&&b<=1){_.at(S,v),x.at(b,y);return}else if(S>=0&&S<=1){if(b<0)x.at(0,y);else x.at(1,y);_.closestPointToPoint(y,!0,v);return}else if(b>=0&&b<=1){if(S<0)_.at(0,v);else _.at(1,v);x.closestPointToPoint(v,!0,y);return}else{let M;if(S<0)M=_.start;else M=_.end;let T;if(b<0)T=x.start;else T=x.end;let E=p,w=m;if(_.closestPointToPoint(T,!0,p),x.closestPointToPoint(M,!0,m),E.distanceToSquared(T)<=w.distanceToSquared(M)){v.copy(E),y.copy(T);return}else{v.copy(M),y.copy(w);return}}}}(),dp=function(){let d=new q,p=new q,m=new pn,g=new wn;return function(x,v){let{radius:y,center:S}=x,{a:b,b:M,c:T}=v;if(g.start=b,g.end=M,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;if(g.start=b,g.end=T,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;if(g.start=M,g.end=T,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;let N=v.getPlane(m);if(Math.abs(N.distanceToPoint(S))<=y){let R=N.projectPoint(S,p);if(v.containsPoint(R))return!0}return!1}}();var Py=["x","y","z"],gi=0.000000000000001,fp=gi*gi;function Fn(d){return Math.abs(d)<gi}class _n extends Ve{constructor(...d){super(...d);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new q),this.satBounds=[,,,,].fill().map(()=>new Pn),this.points=[this.a,this.b,this.c],this.plane=new pn,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new wn,this.needsUpdate=!0}intersectsSphere(d){return dp(d,this)}update(){let d=this.a,p=this.b,m=this.c,g=this.points,_=this.satAxes,x=this.satBounds,v=_[0],y=x[0];this.getNormal(v),y.setFromPoints(v,g);let S=_[1],b=x[1];S.subVectors(d,p),b.setFromPoints(S,g);let M=_[2],T=x[2];M.subVectors(p,m),T.setFromPoints(M,g);let E=_[3],w=x[3];E.subVectors(m,d),w.setFromPoints(E,g);let C=S.length(),N=M.length(),A=E.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,C<gi)if(N<gi||A<gi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(d),this.degenerateSegment.end.copy(m);else if(N<gi)if(A<gi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(p),this.degenerateSegment.end.copy(d);else if(A<gi)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(p);this.plane.setFromNormalAndCoplanarPoint(v,d),this.needsUpdate=!1}}_n.prototype.closestPointToSegment=function(){let d=new q,p=new q,m=new wn;return function(_,x=null,v=null){if(this.needsUpdate)this.update();let{start:y,end:S}=_,b=this.points,M,T=1/0,E=this.plane.distanceToPoint(y),w=this.plane.distanceToPoint(S);if(E*w<0&&this.plane.intersectLine(_,d)!==null&&this.containsPoint(d)){if(x)x.copy(d);if(v)v.copy(d);return 0}for(let C=0;C<3;C++){let N=(C+1)%3;if(m.start.copy(b[C]),m.end.copy(b[N]),Vr(m,_,d,p),M=d.distanceToSquared(p),M<T){if(T=M,x)x.copy(d);if(v)v.copy(p)}}if(this.closestPointToPoint(y,d),M=y.distanceToSquared(d),M<T){if(T=M,x)x.copy(d);if(v)v.copy(y)}if(this.closestPointToPoint(S,d),M=S.distanceToSquared(d),M<T){if(T=M,x)x.copy(d);if(v)v.copy(S)}return Math.sqrt(T)}}();_n.prototype.intersectsTriangle=function(){let d=new _n,p=new Pn,m=new Pn,g=new q,_=new q,x=new q,v=new q,y=new wn,S=new wn,b=new q,M=new $t,T=new $t;function E(U,L,D,k){let P=g;if(!U.isDegenerateIntoPoint&&!U.isDegenerateIntoSegment)P.copy(U.plane.normal);else P.copy(L.plane.normal);let{satBounds:F,satAxes:G}=U;for(let W=1;W<4;W++){let Z=F[W],V=G[W];if(p.setFromPoints(V,L.points),Z.isSeparated(p))return!1;if(v.copy(P).cross(V),p.setFromPoints(v,U.points),m.setFromPoints(v,L.points),p.isSeparated(m))return!1}let{satBounds:H,satAxes:z}=L;for(let W=1;W<4;W++){let Z=H[W],V=z[W];if(p.setFromPoints(V,U.points),Z.isSeparated(p))return!1;if(v.crossVectors(P,V),p.setFromPoints(v,U.points),m.setFromPoints(v,L.points),p.isSeparated(m))return!1}if(D){if(!k)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");D.start.set(0,0,0),D.end.set(0,0,0)}return!0}function w(U,L,D,k,P,F,G,H,z,W,Z){let V=G/(G-H);W.x=k+(P-k)*V,Z.start.subVectors(L,U).multiplyScalar(V).add(U),V=G/(G-z),W.y=k+(F-k)*V,Z.end.subVectors(D,U).multiplyScalar(V).add(U)}function C(U,L,D,k,P,F,G,H,z,W,Z){if(P>0)w(U.c,U.a,U.b,k,L,D,z,G,H,W,Z);else if(F>0)w(U.b,U.a,U.c,D,L,k,H,G,z,W,Z);else if(H*z>0||G!=0)w(U.a,U.b,U.c,L,D,k,G,H,z,W,Z);else if(H!=0)w(U.b,U.a,U.c,D,L,k,H,G,z,W,Z);else if(z!=0)w(U.c,U.a,U.b,k,L,D,z,G,H,W,Z);else return!0;return!1}function N(U,L,D,k){let P=L.degenerateSegment,F=U.plane.distanceToPoint(P.start),G=U.plane.distanceToPoint(P.end);if(Fn(F))if(Fn(G))return E(U,L,D,k);else{if(D)D.start.copy(P.start),D.end.copy(P.start);return U.containsPoint(P.start)}else if(Fn(G)){if(D)D.start.copy(P.end),D.end.copy(P.end);return U.containsPoint(P.end)}else if(U.plane.intersectLine(P,g)!=null){if(D)D.start.copy(g),D.end.copy(g);return U.containsPoint(g)}else return!1}function A(U,L,D){let k=L.a;if(Fn(U.plane.distanceToPoint(k))&&U.containsPoint(k)){if(D)D.start.copy(k),D.end.copy(k);return!0}else return!1}function R(U,L,D){let k=U.degenerateSegment,P=L.a;if(k.closestPointToPoint(P,!0,g),P.distanceToSquared(g)<fp){if(D)D.start.copy(P),D.end.copy(P);return!0}else return!1}function I(U,L,D,k){if(U.isDegenerateIntoSegment)if(L.isDegenerateIntoSegment){let P=U.degenerateSegment,F=L.degenerateSegment,G=_,H=x;P.delta(G),F.delta(H);let z=g.subVectors(F.start,P.start),W=G.x*H.y-G.y*H.x;if(Fn(W))return!1;let Z=(z.x*H.y-z.y*H.x)/W,V=-(G.x*z.y-G.y*z.x)/W;if(Z<0||Z>1||V<0||V>1)return!1;let Q=P.start.z+G.z*Z,it=F.start.z+H.z*V;if(Fn(Q-it)){if(D)D.start.copy(P.start).addScaledVector(G,Z),D.end.copy(P.start).addScaledVector(G,Z);return!0}else return!1}else if(L.isDegenerateIntoPoint)return R(U,L,D);else return N(L,U,D,k);else if(U.isDegenerateIntoPoint)if(L.isDegenerateIntoPoint)if(L.a.distanceToSquared(U.a)<fp){if(D)D.start.copy(U.a),D.end.copy(U.a);return!0}else return!1;else if(L.isDegenerateIntoSegment)return R(L,U,D);else return A(L,U,D);else if(L.isDegenerateIntoPoint)return A(U,L,D);else if(L.isDegenerateIntoSegment)return N(U,L,D,k)}return function(L,D=null,k=!1){if(this.needsUpdate)this.update();if(!L.isExtendedTriangle)d.copy(L),d.update(),L=d;else if(L.needsUpdate)L.update();let P=I(this,L,D,k);if(P!==void 0)return P;let F=this.plane,G=L.plane,H=G.distanceToPoint(this.a),z=G.distanceToPoint(this.b),W=G.distanceToPoint(this.c);if(Fn(H))H=0;if(Fn(z))z=0;if(Fn(W))W=0;let Z=H*z,V=H*W;if(Z>0&&V>0)return!1;let Q=F.distanceToPoint(L.a),it=F.distanceToPoint(L.b),j=F.distanceToPoint(L.c);if(Fn(Q))Q=0;if(Fn(it))it=0;if(Fn(j))j=0;let xt=Q*it,rt=Q*j;if(xt>0&&rt>0)return!1;_.copy(F.normal),x.copy(G.normal);let dt=_.cross(x),_t=0,Nt=Math.abs(dt.x),ot=Math.abs(dt.y);if(ot>Nt)Nt=ot,_t=1;if(Math.abs(dt.z)>Nt)_t=2;let Rt=Py[_t],Bt=this.a[Rt],kt=this.b[Rt],Lt=this.c[Rt],ie=L.a[Rt],jt=L.b[Rt],Dt=L.c[Rt];if(C(this,Bt,kt,Lt,Z,V,H,z,W,M,y))return E(this,L,D,k);if(C(L,ie,jt,Dt,xt,rt,Q,it,j,T,S))return E(this,L,D,k);if(M.y<M.x){let Jt=M.y;M.y=M.x,M.x=Jt,b.copy(y.start),y.start.copy(y.end),y.end.copy(b)}if(T.y<T.x){let Jt=T.y;T.y=T.x,T.x=Jt,b.copy(S.start),S.start.copy(S.end),S.end.copy(b)}if(M.y<T.x||T.y<M.x)return!1;if(D){if(T.x>M.x)D.start.copy(S.start);else D.start.copy(y.start);if(T.y<M.y)D.end.copy(S.end);else D.end.copy(y.end)}return!0}}();_n.prototype.distanceToPoint=function(){let d=new q;return function(m){return this.closestPointToPoint(m,d),m.distanceTo(d)}}();_n.prototype.distanceToTriangle=function(){let d=new q,p=new q,m=["a","b","c"],g=new wn,_=new wn;return function(v,y=null,S=null){let b=y||S?g:null;if(this.intersectsTriangle(v,b,!0)){if(y||S){if(y)b.getCenter(y);if(S)b.getCenter(S)}return 0}let M=1/0;for(let T=0;T<3;T++){let E,w=m[T],C=v[w];if(this.closestPointToPoint(C,d),E=C.distanceToSquared(d),E<M){if(M=E,y)y.copy(d);if(S)S.copy(C)}let N=this[w];if(v.closestPointToPoint(N,d),E=N.distanceToSquared(d),E<M){if(M=E,y)y.copy(N);if(S)S.copy(d)}}for(let T=0;T<3;T++){let E=m[T],w=m[(T+1)%3];g.set(this[E],this[w]);for(let C=0;C<3;C++){let N=m[C],A=m[(C+1)%3];_.set(v[N],v[A]),Vr(g,_,d,p);let R=d.distanceToSquared(p);if(R<M){if(M=R,y)y.copy(d);if(S)S.copy(p)}}}return Math.sqrt(M)}}();class ze{constructor(d,p,m){if(this.isOrientedBox=!0,this.min=new q,this.max=new q,this.matrix=new se,this.invMatrix=new se,this.points=[,,,,,,,,].fill().map(()=>new q),this.satAxes=[,,,].fill().map(()=>new q),this.satBounds=[,,,].fill().map(()=>new Pn),this.alignedSatBounds=[,,,].fill().map(()=>new Pn),this.needsUpdate=!1,d)this.min.copy(d);if(p)this.max.copy(p);if(m)this.matrix.copy(m)}set(d,p,m){this.min.copy(d),this.max.copy(p),this.matrix.copy(m),this.needsUpdate=!0}copy(d){this.min.copy(d.min),this.max.copy(d.max),this.matrix.copy(d.matrix),this.needsUpdate=!0}}ze.prototype.update=function(){return function(){let p=this.matrix,m=this.min,g=this.max,_=this.points;for(let b=0;b<=1;b++)for(let M=0;M<=1;M++)for(let T=0;T<=1;T++){let E=1*b|2*M|4*T,w=_[E];w.x=b?g.x:m.x,w.y=M?g.y:m.y,w.z=T?g.z:m.z,w.applyMatrix4(p)}let x=this.satBounds,v=this.satAxes,y=_[0];for(let b=0;b<3;b++){let M=v[b],T=x[b],E=1<<b,w=_[E];M.subVectors(y,w),T.setFromPoints(M,_)}let S=this.alignedSatBounds;S[0].setFromPointsField(_,"x"),S[1].setFromPointsField(_,"y"),S[2].setFromPointsField(_,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();ze.prototype.intersectsBox=function(){let d=new Pn;return function(m){if(this.needsUpdate)this.update();let{min:g,max:_}=m,x=this.satBounds,v=this.satAxes,y=this.alignedSatBounds;if(d.min=g.x,d.max=_.x,y[0].isSeparated(d))return!1;if(d.min=g.y,d.max=_.y,y[1].isSeparated(d))return!1;if(d.min=g.z,d.max=_.z,y[2].isSeparated(d))return!1;for(let S=0;S<3;S++){let b=v[S],M=x[S];if(d.setFromBox(b,m),M.isSeparated(d))return!1}return!0}}();ze.prototype.intersectsTriangle=function(){let d=new _n,p=[,,,],m=new Pn,g=new Pn,_=new q;return function(v){if(this.needsUpdate)this.update();if(!v.isExtendedTriangle)d.copy(v),d.update(),v=d;else if(v.needsUpdate)v.update();let y=this.satBounds,S=this.satAxes;p[0]=v.a,p[1]=v.b,p[2]=v.c;for(let E=0;E<3;E++){let w=y[E],C=S[E];if(m.setFromPoints(C,p),w.isSeparated(m))return!1}let b=v.satBounds,M=v.satAxes,T=this.points;for(let E=0;E<3;E++){let w=b[E],C=M[E];if(m.setFromPoints(C,T),w.isSeparated(m))return!1}for(let E=0;E<3;E++){let w=S[E];for(let C=0;C<4;C++){let N=M[C];if(_.crossVectors(w,N),m.setFromPoints(_,p),g.setFromPoints(_,T),m.isSeparated(g))return!1}}return!0}}();ze.prototype.closestPointToPoint=function(){return function(p,m){if(this.needsUpdate)this.update();return m.copy(p).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),m}}();ze.prototype.distanceToPoint=function(){let d=new q;return function(m){return this.closestPointToPoint(m,d),m.distanceTo(d)}}();ze.prototype.distanceToBox=function(){let d=["x","y","z"],p=Array(12).fill().map(()=>new wn),m=Array(12).fill().map(()=>new wn),g=new q,_=new q;return function(v,y=0,S=null,b=null){if(this.needsUpdate)this.update();if(this.intersectsBox(v)){if(S||b){if(v.getCenter(_),this.closestPointToPoint(_,g),v.closestPointToPoint(g,_),S)S.copy(g);if(b)b.copy(_)}return 0}let M=y*y,{min:T,max:E}=v,w=this.points,C=1/0;for(let A=0;A<8;A++){let R=w[A];_.copy(R).clamp(T,E);let I=R.distanceToSquared(_);if(I<C){if(C=I,S)S.copy(R);if(b)b.copy(_);if(I<M)return Math.sqrt(I)}}let N=0;for(let A=0;A<3;A++)for(let R=0;R<=1;R++)for(let I=0;I<=1;I++){let U=(A+1)%3,L=(A+2)%3,D=R<<U|I<<L,k=1<<A|R<<U|I<<L,P=w[D],F=w[k];p[N].set(P,F);let H=d[A],z=d[U],W=d[L],Z=m[N],{start:V,end:Q}=Z;V[H]=T[H],V[z]=R?T[z]:E[z],V[W]=I?T[W]:E[W],Q[H]=E[H],Q[z]=R?T[z]:E[z],Q[W]=I?T[W]:E[W],N++}for(let A=0;A<=1;A++)for(let R=0;R<=1;R++)for(let I=0;I<=1;I++){_.x=A?E.x:T.x,_.y=R?E.y:T.y,_.z=I?E.z:T.z,this.closestPointToPoint(_,g);let U=_.distanceToSquared(g);if(U<C){if(C=U,S)S.copy(g);if(b)b.copy(_);if(U<M)return Math.sqrt(U)}}for(let A=0;A<12;A++){let R=p[A];for(let I=0;I<12;I++){let U=m[I];Vr(R,U,g,_);let L=g.distanceToSquared(_);if(L<C){if(C=L,S)S.copy(g);if(b)b.copy(_);if(L<M)return Math.sqrt(L)}}}return Math.sqrt(C)}}();class pp extends os{constructor(){super(()=>new _n)}}var bn=new pp;var Wr=new q,yh=new q;function mp(d,p,m={},g=0,_=1/0){let x=g*g,v=_*_,y=1/0,S=null;if(d.shapecast({boundsTraverseOrder:(M)=>(Wr.copy(p).clamp(M.min,M.max),Wr.distanceToSquared(p)),intersectsBounds:(M,T,E)=>E<y&&E<v,intersectsTriangle:(M,T)=>{M.closestPointToPoint(p,Wr);let E=p.distanceToSquared(Wr);if(E<y)yh.copy(Wr),y=E,S=T;if(E<x)return!0;else return!1}}),y===1/0)return null;let b=Math.sqrt(y);if(!m.point)m.point=yh.clone();else m.point.copy(yh);return m.distance=b,m.faceIndex=S,m}var Ea=parseInt(Yi)>=169,Iy=parseInt(Yi)<=161,as=new q,ls=new q,cs=new q,Ta=new $t,wa=new $t,Aa=new $t,gp=new q,_p=new q,xp=new q,Xr=new q;function Ly(d,p,m,g,_,x,v,y){let S;if(x===mn)S=d.intersectTriangle(g,m,p,!0,_);else S=d.intersectTriangle(p,m,g,x!==Ln,_);if(S===null)return null;let b=d.origin.distanceTo(_);if(b<v||b>y)return null;return{distance:b,point:_.clone()}}function vp(d,p,m,g,_,x,v,y,S,b,M){as.fromBufferAttribute(p,x),ls.fromBufferAttribute(p,v),cs.fromBufferAttribute(p,y);let T=Ly(d,as,ls,cs,Xr,S,b,M);if(T){if(g){Ta.fromBufferAttribute(g,x),wa.fromBufferAttribute(g,v),Aa.fromBufferAttribute(g,y),T.uv=new $t;let w=Ve.getInterpolation(Xr,as,ls,cs,Ta,wa,Aa,T.uv);if(!Ea)T.uv=w}if(_){Ta.fromBufferAttribute(_,x),wa.fromBufferAttribute(_,v),Aa.fromBufferAttribute(_,y),T.uv1=new $t;let w=Ve.getInterpolation(Xr,as,ls,cs,Ta,wa,Aa,T.uv1);if(!Ea)T.uv1=w;if(Iy)T.uv2=T.uv1}if(m){gp.fromBufferAttribute(m,x),_p.fromBufferAttribute(m,v),xp.fromBufferAttribute(m,y),T.normal=new q;let w=Ve.getInterpolation(Xr,as,ls,cs,gp,_p,xp,T.normal);if(T.normal.dot(d.direction)>0)T.normal.multiplyScalar(-1);if(!Ea)T.normal=w}let E={a:x,b:v,c:y,normal:new q,materialIndex:0};if(Ve.getNormal(as,ls,cs,E.normal),T.face=E,T.faceIndex=x,Ea){let w=new q;Ve.getBarycoord(Xr,as,ls,cs,w),T.barycoord=w}}return T}function yp(d){return d&&d.isMaterial?d.side:d}function Ks(d,p,m,g,_,x,v){let y=g*3,S=y+0,b=y+1,M=y+2,{index:T,groups:E}=d;if(d.index)S=T.getX(S),b=T.getX(b),M=T.getX(M);let{position:w,normal:C,uv:N,uv1:A}=d.attributes;if(Array.isArray(p)){let R=g*3;for(let I=0,U=E.length;I<U;I++){let{start:L,count:D,materialIndex:k}=E[I];if(R>=L&&R<L+D){let P=yp(p[k]),F=vp(m,w,C,N,A,S,b,M,P,x,v);if(F)if(F.faceIndex=g,F.face.materialIndex=k,_)_.push(F);else return F}}}else{let R=yp(p),I=vp(m,w,C,N,A,S,b,M,R,x,v);if(I)if(I.faceIndex=g,I.face.materialIndex=0,_)_.push(I);else return I}return null}function Ne(d,p,m,g){let{a:_,b:x,c:v}=d,y=p,S=p+1,b=p+2;if(m)y=m.getX(y),S=m.getX(S),b=m.getX(b);_.x=g.getX(y),_.y=g.getY(y),_.z=g.getZ(y),x.x=g.getX(S),x.y=g.getY(S),x.z=g.getZ(S),v.x=g.getX(b),v.y=g.getY(b),v.z=g.getZ(b)}function Sp(d,p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:b}=d;for(let M=g,T=g+_;M<T;M++)Ks(S,p,m,M,x,v,y)}function bp(d,p,m,g,_,x,v){let{geometry:y,_indirectBuffer:S}=d,b=1/0,M=null;for(let T=g,E=g+_;T<E;T++){let w;if(w=Ks(y,p,m,T,null,x,v),w&&w.distance<b)M=w,b=w.distance}return M}function Mp(d,p,m,g,_,x,v){let{geometry:y}=m,{index:S}=y,b=y.attributes.position;for(let M=d,T=p+d;M<T;M++){let E;if(E=M,Ne(v,E*3,S,b),v.needsUpdate=!0,g(v,E,_,x))return!0}return!1}function Ep(d,p=null){if(p&&Array.isArray(p))p=new Set(p);let m=d.geometry,g=m.index?m.index.array:null,_=m.attributes.position,x,v,y,S,b=0,M=d._roots;for(let E=0,w=M.length;E<w;E++)x=M[E],v=new Uint32Array(x),y=new Uint16Array(x),S=new Float32Array(x),T(0,b),b+=x.byteLength;function T(E,w,C=!1){let N=E*2;if(ge(N,y)){let A=Ee(E,v),R=Ce(N,y),I=1/0,U=1/0,L=1/0,D=-1/0,k=-1/0,P=-1/0;for(let F=3*A,G=3*(A+R);F<G;F++){let H=g[F],z=_.getX(H),W=_.getY(H),Z=_.getZ(H);if(z<I)I=z;if(z>D)D=z;if(W<U)U=W;if(W>k)k=W;if(Z<L)L=Z;if(Z>P)P=Z}if(S[E+0]!==I||S[E+1]!==U||S[E+2]!==L||S[E+3]!==D||S[E+4]!==k||S[E+5]!==P)return S[E+0]=I,S[E+1]=U,S[E+2]=L,S[E+3]=D,S[E+4]=k,S[E+5]=P,!0;else return!1}else{let A=be(E),R=Me(E,v),I=C,U=!1,L=!1;if(p){if(!I){let H=A/Re+w/tn,z=R/Re+w/tn;U=p.has(H),L=p.has(z),I=!U&&!L}}else U=!0,L=!0;let D=I||U,k=I||L,P=!1;if(D)P=T(A,w,I);let F=!1;if(k)F=T(R,w,I);let G=P||F;if(G)for(let H=0;H<3;H++){let z=A+H,W=R+H,Z=S[z],V=S[z+3],Q=S[W],it=S[W+3];S[E+H]=Z<Q?Z:Q,S[E+H+3]=V>it?V:it}return G}}}function xn(d,p,m,g,_){let x,v,y,S,b,M,T=1/m.direction.x,E=1/m.direction.y,w=1/m.direction.z,C=m.origin.x,N=m.origin.y,A=m.origin.z,R=p[d],I=p[d+3],U=p[d+1],L=p[d+3+1],D=p[d+2],k=p[d+3+2];if(T>=0)x=(R-C)*T,v=(I-C)*T;else x=(I-C)*T,v=(R-C)*T;if(E>=0)y=(U-N)*E,S=(L-N)*E;else y=(L-N)*E,S=(U-N)*E;if(x>S||y>v)return!1;if(y>x||isNaN(x))x=y;if(S<v||isNaN(v))v=S;if(w>=0)b=(D-A)*w,M=(k-A)*w;else b=(k-A)*w,M=(D-A)*w;if(x>M||b>v)return!1;if(b>x||x!==x)x=b;if(M<v||v!==v)v=M;return x<=_&&v>=g}function Tp(d,p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:b}=d;for(let M=g,T=g+_;M<T;M++){let E=b?b[M]:M;Ks(S,p,m,E,x,v,y)}}function wp(d,p,m,g,_,x,v){let{geometry:y,_indirectBuffer:S}=d,b=1/0,M=null;for(let T=g,E=g+_;T<E;T++){let w;if(w=Ks(y,p,m,S?S[T]:T,null,x,v),w&&w.distance<b)M=w,b=w.distance}return M}function Ap(d,p,m,g,_,x,v){let{geometry:y}=m,{index:S}=y,b=y.attributes.position;for(let M=d,T=p+d;M<T;M++){let E;if(E=m.resolveTriangleIndex(M),Ne(v,E*3,S,b),v.needsUpdate=!0,g(v,E,_,x))return!0}return!1}function Rp(d,p,m,g,_,x,v){if(ue.setBuffer(d._roots[p]),xn(0,ue.float32Array,g,x,v))Sh(0,d,m,g,_,x,v);ue.clearBuffer()}function Sh(d,p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:b}=ue,M=d*2;if(ge(M,S)){let E=Ee(d,b),w=Ce(M,S);Sp(p,m,g,E,w,_,x,v)}else{let E=be(d);if(xn(E,y,g,x,v))Sh(E,p,m,g,_,x,v);let w=Me(d,b);if(xn(w,y,g,x,v))Sh(w,p,m,g,_,x,v)}}var Ny=["x","y","z"];function Cp(d,p,m,g,_,x){ue.setBuffer(d._roots[p]);let v=null;if(xn(0,ue.float32Array,g,_,x))v=bh(0,d,m,g,_,x);return ue.clearBuffer(),v}function bh(d,p,m,g,_,x){let{float32Array:v,uint16Array:y,uint32Array:S}=ue,b=d*2;if(ge(b,y)){let T=Ee(d,S),E=Ce(b,y);return bp(p,m,g,T,E,_,x)}else{let T=Vs(d,S),E=Ny[T],C=g.direction[E]>=0,N,A;if(C)N=be(d),A=Me(d,S);else N=Me(d,S),A=be(d);let I=xn(N,v,g,_,x)?bh(N,p,m,g,_,x):null;if(I){let D=I.point[E];if(C?D<=v[A+T]:D>=v[A+T+3])return I}let L=xn(A,v,g,_,x)?bh(A,p,m,g,_,x):null;if(I&&L)return I.distance<=L.distance?I:L;else return I||L||null}}var Ra=new Se,js=new _n,Qs=new _n,qr=new se,Pp=new ze,Ca=new ze;function Ip(d,p,m,g){ue.setBuffer(d._roots[p]);let _=Mh(0,d,m,g);return ue.clearBuffer(),_}function Mh(d,p,m,g,_=null){let{float32Array:x,uint16Array:v,uint32Array:y}=ue,S=d*2;if(_===null){if(!m.boundingBox)m.computeBoundingBox();Pp.set(m.boundingBox.min,m.boundingBox.max,g),_=Pp}if(ge(S,v)){let M=p.geometry,T=M.index,E=M.attributes.position,w=m.index,C=m.attributes.position,N=Ee(d,y),A=Ce(S,v);if(qr.copy(g).invert(),m.boundsTree)return Le(Ue(d),x,Ca),Ca.matrix.copy(qr),Ca.needsUpdate=!0,m.boundsTree.shapecast({intersectsBounds:(I)=>Ca.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(g),I.b.applyMatrix4(g),I.c.applyMatrix4(g),I.needsUpdate=!0;for(let U=N*3,L=(A+N)*3;U<L;U+=3)if(Ne(Qs,U,T,E),Qs.needsUpdate=!0,I.intersectsTriangle(Qs))return!0;return!1}});else{let R=Oi(m);for(let I=N*3,U=(A+N)*3;I<U;I+=3){Ne(js,I,T,E),js.a.applyMatrix4(qr),js.b.applyMatrix4(qr),js.c.applyMatrix4(qr),js.needsUpdate=!0;for(let L=0,D=R*3;L<D;L+=3)if(Ne(Qs,L,w,C),Qs.needsUpdate=!0,js.intersectsTriangle(Qs))return!0}}}else{let M=be(d),T=Me(d,y);if(Le(Ue(M),x,Ra),_.intersectsBox(Ra)&&Mh(M,p,m,g,_))return!0;if(Le(Ue(T),x,Ra),_.intersectsBox(Ra)&&Mh(T,p,m,g,_))return!0;return!1}}var Pa=new se,Eh=new ze,Yr=new ze,Dy=new q,Uy=new q,Fy=new q,Oy=new q;function Lp(d,p,m,g={},_={},x=0,v=1/0){if(!p.boundingBox)p.computeBoundingBox();Eh.set(p.boundingBox.min,p.boundingBox.max,m),Eh.needsUpdate=!0;let y=d.geometry,S=y.attributes.position,b=y.index,M=p.attributes.position,T=p.index,E=bn.getPrimitive(),w=bn.getPrimitive(),C=Dy,N=Uy,A=null,R=null;if(_)A=Fy,R=Oy;let I=1/0,U=null,L=null;if(Pa.copy(m).invert(),Yr.matrix.copy(Pa),d.shapecast({boundsTraverseOrder:(D)=>Eh.distanceToBox(D),intersectsBounds:(D,k,P)=>{if(P<I&&P<v){if(k)Yr.min.copy(D.min),Yr.max.copy(D.max),Yr.needsUpdate=!0;return!0}return!1},intersectsRange:(D,k)=>{if(p.boundsTree)return p.boundsTree.shapecast({boundsTraverseOrder:(F)=>Yr.distanceToBox(F),intersectsBounds:(F,G,H)=>H<I&&H<v,intersectsRange:(F,G)=>{for(let H=F,z=F+G;H<z;H++){Ne(w,3*H,T,M),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let W=D,Z=D+k;W<Z;W++){Ne(E,3*W,b,S),E.needsUpdate=!0;let V=E.distanceToTriangle(w,C,A);if(V<I){if(N.copy(C),R)R.copy(A);I=V,U=W,L=H}if(V<x)return!0}}}});else{let P=Oi(p);for(let F=0,G=P;F<G;F++){Ne(w,3*F,T,M),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let H=D,z=D+k;H<z;H++){Ne(E,3*H,b,S),E.needsUpdate=!0;let W=E.distanceToTriangle(w,C,A);if(W<I){if(N.copy(C),R)R.copy(A);I=W,U=H,L=F}if(W<x)return!0}}}}}),bn.releasePrimitive(E),bn.releasePrimitive(w),I===1/0)return null;if(!g.point)g.point=N.clone();else g.point.copy(N);if(g.distance=I,g.faceIndex=U,_){if(!_.point)_.point=R.clone();else _.point.copy(R);_.point.applyMatrix4(Pa),N.applyMatrix4(Pa),_.distance=N.sub(_.point).length(),_.faceIndex=L}return g}function Np(d,p=null){if(p&&Array.isArray(p))p=new Set(p);let m=d.geometry,g=m.index?m.index.array:null,_=m.attributes.position,x,v,y,S,b=0,M=d._roots;for(let E=0,w=M.length;E<w;E++)x=M[E],v=new Uint32Array(x),y=new Uint16Array(x),S=new Float32Array(x),T(0,b),b+=x.byteLength;function T(E,w,C=!1){let N=E*2;if(ge(N,y)){let A=Ee(E,v),R=Ce(N,y),I=1/0,U=1/0,L=1/0,D=-1/0,k=-1/0,P=-1/0;for(let F=A,G=A+R;F<G;F++){let H=3*d.resolveTriangleIndex(F);for(let z=0;z<3;z++){let W=H+z;W=g?g[W]:W;let Z=_.getX(W),V=_.getY(W),Q=_.getZ(W);if(Z<I)I=Z;if(Z>D)D=Z;if(V<U)U=V;if(V>k)k=V;if(Q<L)L=Q;if(Q>P)P=Q}}if(S[E+0]!==I||S[E+1]!==U||S[E+2]!==L||S[E+3]!==D||S[E+4]!==k||S[E+5]!==P)return S[E+0]=I,S[E+1]=U,S[E+2]=L,S[E+3]=D,S[E+4]=k,S[E+5]=P,!0;else return!1}else{let A=be(E),R=Me(E,v),I=C,U=!1,L=!1;if(p){if(!I){let H=A/Re+w/tn,z=R/Re+w/tn;U=p.has(H),L=p.has(z),I=!U&&!L}}else U=!0,L=!0;let D=I||U,k=I||L,P=!1;if(D)P=T(A,w,I);let F=!1;if(k)F=T(R,w,I);let G=P||F;if(G)for(let H=0;H<3;H++){let z=A+H,W=R+H,Z=S[z],V=S[z+3],Q=S[W],it=S[W+3];S[E+H]=Z<Q?Z:Q,S[E+H+3]=V>it?V:it}return G}}}function Dp(d,p,m,g,_,x,v){if(ue.setBuffer(d._roots[p]),xn(0,ue.float32Array,g,x,v))Th(0,d,m,g,_,x,v);ue.clearBuffer()}function Th(d,p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:b}=ue,M=d*2;if(ge(M,S)){let E=Ee(d,b),w=Ce(M,S);Tp(p,m,g,E,w,_,x,v)}else{let E=be(d);if(xn(E,y,g,x,v))Th(E,p,m,g,_,x,v);let w=Me(d,b);if(xn(w,y,g,x,v))Th(w,p,m,g,_,x,v)}}var By=["x","y","z"];function Up(d,p,m,g,_,x){ue.setBuffer(d._roots[p]);let v=null;if(xn(0,ue.float32Array,g,_,x))v=wh(0,d,m,g,_,x);return ue.clearBuffer(),v}function wh(d,p,m,g,_,x){let{float32Array:v,uint16Array:y,uint32Array:S}=ue,b=d*2;if(ge(b,y)){let T=Ee(d,S),E=Ce(b,y);return wp(p,m,g,T,E,_,x)}else{let T=Vs(d,S),E=By[T],C=g.direction[E]>=0,N,A;if(C)N=be(d),A=Me(d,S);else N=Me(d,S),A=be(d);let I=xn(N,v,g,_,x)?wh(N,p,m,g,_,x):null;if(I){let D=I.point[E];if(C?D<=v[A+T]:D>=v[A+T+3])return I}let L=xn(A,v,g,_,x)?wh(A,p,m,g,_,x):null;if(I&&L)return I.distance<=L.distance?I:L;else return I||L||null}}var Ia=new Se,tr=new _n,er=new _n,Zr=new se,Fp=new ze,La=new ze;function Op(d,p,m,g){ue.setBuffer(d._roots[p]);let _=Ah(0,d,m,g);return ue.clearBuffer(),_}function Ah(d,p,m,g,_=null){let{float32Array:x,uint16Array:v,uint32Array:y}=ue,S=d*2;if(_===null){if(!m.boundingBox)m.computeBoundingBox();Fp.set(m.boundingBox.min,m.boundingBox.max,g),_=Fp}if(ge(S,v)){let M=p.geometry,T=M.index,E=M.attributes.position,w=m.index,C=m.attributes.position,N=Ee(d,y),A=Ce(S,v);if(Zr.copy(g).invert(),m.boundsTree)return Le(Ue(d),x,La),La.matrix.copy(Zr),La.needsUpdate=!0,m.boundsTree.shapecast({intersectsBounds:(I)=>La.intersectsBox(I),intersectsTriangle:(I)=>{I.a.applyMatrix4(g),I.b.applyMatrix4(g),I.c.applyMatrix4(g),I.needsUpdate=!0;for(let U=N,L=A+N;U<L;U++)if(Ne(er,3*p.resolveTriangleIndex(U),T,E),er.needsUpdate=!0,I.intersectsTriangle(er))return!0;return!1}});else{let R=Oi(m);for(let I=N,U=A+N;I<U;I++){let L=p.resolveTriangleIndex(I);Ne(tr,3*L,T,E),tr.a.applyMatrix4(Zr),tr.b.applyMatrix4(Zr),tr.c.applyMatrix4(Zr),tr.needsUpdate=!0;for(let D=0,k=R*3;D<k;D+=3)if(Ne(er,D,w,C),er.needsUpdate=!0,tr.intersectsTriangle(er))return!0}}}else{let M=be(d),T=Me(d,y);if(Le(Ue(M),x,Ia),_.intersectsBox(Ia)&&Ah(M,p,m,g,_))return!0;if(Le(Ue(T),x,Ia),_.intersectsBox(Ia)&&Ah(T,p,m,g,_))return!0;return!1}}var Na=new se,Rh=new ze,$r=new ze,ky=new q,zy=new q,Hy=new q,Gy=new q;function Bp(d,p,m,g={},_={},x=0,v=1/0){if(!p.boundingBox)p.computeBoundingBox();Rh.set(p.boundingBox.min,p.boundingBox.max,m),Rh.needsUpdate=!0;let y=d.geometry,S=y.attributes.position,b=y.index,M=p.attributes.position,T=p.index,E=bn.getPrimitive(),w=bn.getPrimitive(),C=ky,N=zy,A=null,R=null;if(_)A=Hy,R=Gy;let I=1/0,U=null,L=null;if(Na.copy(m).invert(),$r.matrix.copy(Na),d.shapecast({boundsTraverseOrder:(D)=>Rh.distanceToBox(D),intersectsBounds:(D,k,P)=>{if(P<I&&P<v){if(k)$r.min.copy(D.min),$r.max.copy(D.max),$r.needsUpdate=!0;return!0}return!1},intersectsRange:(D,k)=>{if(p.boundsTree){let P=p.boundsTree;return P.shapecast({boundsTraverseOrder:(F)=>$r.distanceToBox(F),intersectsBounds:(F,G,H)=>H<I&&H<v,intersectsRange:(F,G)=>{for(let H=F,z=F+G;H<z;H++){let W=P.resolveTriangleIndex(H);Ne(w,3*W,T,M),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let Z=D,V=D+k;Z<V;Z++){let Q=d.resolveTriangleIndex(Z);Ne(E,3*Q,b,S),E.needsUpdate=!0;let it=E.distanceToTriangle(w,C,A);if(it<I){if(N.copy(C),R)R.copy(A);I=it,U=Z,L=H}if(it<x)return!0}}}})}else{let P=Oi(p);for(let F=0,G=P;F<G;F++){Ne(w,3*F,T,M),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let H=D,z=D+k;H<z;H++){let W=d.resolveTriangleIndex(H);Ne(E,3*W,b,S),E.needsUpdate=!0;let Z=E.distanceToTriangle(w,C,A);if(Z<I){if(N.copy(C),R)R.copy(A);I=Z,U=H,L=F}if(Z<x)return!0}}}}}),bn.releasePrimitive(E),bn.releasePrimitive(w),I===1/0)return null;if(!g.point)g.point=N.clone();else g.point.copy(N);if(g.distance=I,g.faceIndex=U,_){if(!_.point)_.point=R.clone();else _.point.copy(R);_.point.applyMatrix4(Na),N.applyMatrix4(Na),_.distance=N.sub(_.point).length(),_.faceIndex=L}return g}function Ch(d,p,m){if(d===null)return null;return d.point.applyMatrix4(p.matrixWorld),d.distance=d.point.distanceTo(m.ray.origin),d.object=p,d}var Da=new ze,Ua=new Ii,kp=new q,zp=new se,Hp=new q,Ph=["getX","getY","getZ"];class nr extends vh{static serialize(d,p={}){p={cloneBuffers:!0,...p};let{geometry:m,_roots:g,_indirectBuffer:_}=d,x=m.getIndex(),v={version:1,roots:null,index:null,indirectBuffer:null};if(p.cloneBuffers)v.roots=g.map((y)=>y.slice()),v.index=x?x.array.slice():null,v.indirectBuffer=_?_.slice():null;else v.roots=g,v.index=x?x.array:null,v.indirectBuffer=_;return v}static deserialize(d,p,m={}){m={setIndex:!0,indirect:Boolean(d.indirectBuffer),...m};let{index:g,roots:_,indirectBuffer:x}=d;if(!d.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),y(_);let v=new nr(p,{...m,[zr]:!0});if(v._roots=_,v._indirectBuffer=x||null,m.setIndex){let S=p.getIndex();if(S===null){let b=new Xe(d.index,1,!1);p.setIndex(b)}else if(S.array!==g)S.array.set(g),S.needsUpdate=!0}return v;function y(S){for(let b=0;b<S.length;b++){let M=S[b],T=new Uint32Array(M),E=new Uint16Array(M);for(let w=0,C=M.byteLength/tn;w<C;w++){let N=Re*w,A=2*N;if(!ge(A,E))T[N+6]=T[N+6]/Re-w}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(d,p={}){if(p.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),p={...p,targetLeafSize:p.maxLeafTris};super(d,p)}shiftTriangleOffsets(d){return super.shiftPrimitiveOffsets(d)}writePrimitiveBounds(d,p,m){let g=this.geometry,_=this._indirectBuffer,x=g.attributes.position,v=g.index?g.index.array:null,S=(_?_[d]:d)*3,b=S+0,M=S+1,T=S+2;if(v)b=v[b],M=v[M],T=v[T];for(let E=0;E<3;E++){let w=x[Ph[E]](b),C=x[Ph[E]](M),N=x[Ph[E]](T),A=w;if(C<A)A=C;if(N<A)A=N;let R=w;if(C>R)R=C;if(N>R)R=N;p[m+E]=A,p[m+E+3]=R}return p}computePrimitiveBounds(d,p,m){let g=this.geometry,_=this._indirectBuffer,x=g.attributes.position,v=g.index?g.index.array:null,y=x.normalized;if(d<0||p+d-m.offset>m.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let S=x.array,b=x.offset||0,M=3;if(x.isInterleavedBufferAttribute)M=x.data.stride;let T=["getX","getY","getZ"],E=m.offset;for(let w=d,C=d+p;w<C;w++){let A=(_?_[w]:w)*3,R=(w-E)*6,I=A+0,U=A+1,L=A+2;if(v)I=v[I],U=v[U],L=v[L];if(!y)I=I*M+b,U=U*M+b,L=L*M+b;for(let D=0;D<3;D++){let k,P,F;if(y)k=x[T[D]](I),P=x[T[D]](U),F=x[T[D]](L);else k=S[I+D],P=S[U+D],F=S[L+D];let G=k;if(P<G)G=P;if(F<G)G=F;let H=k;if(P>H)H=P;if(F>H)H=F;let z=(H-G)/2,W=D*2;m[R+W+0]=G+z,m[R+W+1]=z+(Math.abs(G)+z)*Gs}}return m}raycastObject3D(d,p,m=[]){let{material:g}=d;if(g===void 0)return;zp.copy(d.matrixWorld).invert(),Ua.copy(p.ray).applyMatrix4(zp),Hp.setFromMatrixScale(d.matrixWorld),kp.copy(Ua.direction).multiply(Hp);let _=kp.length(),x=p.near/_,v=p.far/_;if(p.firstHitOnly===!0){let y=this.raycastFirst(Ua,g,x,v);if(y=Ch(y,d,p),y)m.push(y)}else{let y=this.raycast(Ua,g,x,v);for(let S=0,b=y.length;S<b;S++){let M=Ch(y[S],d,p);if(M)m.push(M)}}return m}refit(d=null){return(this.indirect?Np:Ep)(this,d)}raycast(d,p=ci,m=0,g=1/0){let _=this._roots,x=[],v=this.indirect?Dp:Rp;for(let y=0,S=_.length;y<S;y++)v(this,y,p,d,x,m,g);return x}raycastFirst(d,p=ci,m=0,g=1/0){let _=this._roots,x=null,v=this.indirect?Up:Cp;for(let y=0,S=_.length;y<S;y++){let b=v(this,y,p,d,m,g);if(b!=null&&(x==null||b.distance<x.distance))x=b}return x}intersectsGeometry(d,p){let m=!1,g=this._roots,_=this.indirect?Op:Ip;for(let x=0,v=g.length;x<v;x++)if(m=_(this,x,d,p),m)break;return m}shapecast(d){let p=bn.getPrimitive(),m=super.shapecast({...d,intersectsPrimitive:d.intersectsTriangle,scratchPrimitive:p,iterate:this.indirect?Ap:Mp});return bn.releasePrimitive(p),m}bvhcast(d,p,m){let{intersectsRanges:g,intersectsTriangles:_}=m,x=bn.getPrimitive(),v=this.geometry.index,y=this.geometry.attributes.position,S=this.indirect?(w)=>{let C=this.resolveTriangleIndex(w);Ne(x,C*3,v,y)}:(w)=>{Ne(x,w*3,v,y)},b=bn.getPrimitive(),M=d.geometry.index,T=d.geometry.attributes.position,E=d.indirect?(w)=>{let C=d.resolveTriangleIndex(w);Ne(b,C*3,M,T)}:(w)=>{Ne(b,w*3,M,T)};if(_){if(!(d instanceof nr))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let w=(C,N,A,R,I,U,L,D)=>{for(let k=A,P=A+R;k<P;k++){E(k),b.a.applyMatrix4(p),b.b.applyMatrix4(p),b.c.applyMatrix4(p),b.needsUpdate=!0;for(let F=C,G=C+N;F<G;F++)if(S(F),x.needsUpdate=!0,_(x,b,F,k,I,U,L,D))return!0}return!1};if(g){let C=g;g=function(N,A,R,I,U,L,D,k){if(!C(N,A,R,I,U,L,D,k))return w(N,A,R,I,U,L,D,k);return!0}}else g=w}return super.bvhcast(d,p,{intersectsRanges:g})}intersectsBox(d,p){return Da.set(d.min,d.max,p),Da.needsUpdate=!0,this.shapecast({intersectsBounds:(m)=>Da.intersectsBox(m),intersectsTriangle:(m)=>Da.intersectsTriangle(m)})}intersectsSphere(d){return this.shapecast({intersectsBounds:(p)=>d.intersectsBox(p),intersectsTriangle:(p)=>p.intersectsSphere(d)})}closestPointToGeometry(d,p,m={},g={},_=0,x=1/0){return(this.indirect?Bp:Lp)(this,d,p,m,g,_,x)}closestPointToPoint(d,p={},m=0,g=1/0){return mp(this,d,p,m,g)}}var Q1=parseInt(Yi)>=166,ir={Mesh:on.prototype.raycast,Line:Qi.prototype.raycast,LineSegments:pi.prototype.raycast,LineLoop:ts.prototype.raycast,Points:es.prototype.raycast,BatchedMesh:Yo.prototype.raycast},an=new on,Fa=[];function Gp(d,p){if(this.isBatchedMesh)Vy.call(this,d,p);else{let{geometry:m}=this;if(m.boundsTree)m.boundsTree.raycastObject3D(this,d,p);else{let g;if(this instanceof on)g=ir.Mesh;else if(this instanceof pi)g=ir.LineSegments;else if(this instanceof ts)g=ir.LineLoop;else if(this instanceof Qi)g=ir.Line;else if(this instanceof es)g=ir.Points;else throw Error("BVH: Fallback raycast function not found.");g.call(this,d,p)}}}function Vy(d,p){if(this.boundsTrees){let m=this.boundsTrees,g=this._drawInfo||this._instanceInfo,_=this._drawRanges||this._geometryInfo,x=this.matrixWorld;an.material=this.material,an.geometry=this.geometry;let v=an.geometry.boundsTree,y=an.geometry.drawRange;if(an.geometry.boundingSphere===null)an.geometry.boundingSphere=new Sn;for(let S=0,b=g.length;S<b;S++){if(!this.getVisibleAt(S))continue;let M=g[S].geometryIndex;if(an.geometry.boundsTree=m[M],this.getMatrixAt(S,an.matrixWorld).premultiply(x),!an.geometry.boundsTree){this.getBoundingBoxAt(M,an.geometry.boundingBox),this.getBoundingSphereAt(M,an.geometry.boundingSphere);let T=_[M];an.geometry.setDrawRange(T.start,T.count)}an.raycast(d,Fa);for(let T=0,E=Fa.length;T<E;T++){let w=Fa[T];w.object=this,w.batchId=S,p.push(w)}Fa.length=0}an.geometry.boundsTree=v,an.geometry.drawRange=y,an.material=null,an.geometry=null}else ir.BatchedMesh.call(this,d,p)}var us=11,Vp=6,Wy=12,Xy=100,qy=500,Yy=3,Zy=500,Ih=2,Lh=300000,$y=45,Nh=22,Jy=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,Ky=/^nocol_far/,jy=1.5,Qy=0.004,Wp=0.02,tS=10,eS=200,Oa=1000,Dh=1,nS=4,Xp=2,iS=2,sS=0.15,qp=100,rS=3,Yp=3,Ba=1,oS=5,aS=0.1,lS=0.002,Zp=1000,cS=80000,hS=2,uS=24,dS=6000,fS=0.1,pS=0.3,mS=new Set(["KeyW","KeyA","KeyS","KeyD"]),gS=60,$p=4,Jp="#ffd21f",Kp=300,_S=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],xS=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,vS=/_wire_/,yS=6,SS=8,sr=0,bS=/^(1ROAD|1GRASS|1GRAVEL)_ground/,MS=/^1ROAD_ground/,jp="#27d3c3",hs=0.3,Qp=14,ka=1.5,ES=50,TS=0.25,wS=5000,AS=200,Uh=4,tm=64,RS="#ff8a1f",CS="#2f8bff";function em(d,p){performance.clearMeasures(d);let m=performance.now(),g=p();return performance.measure(d,{start:m}),g}function PS(d){let p=document.createElement("canvas");p.width=d.width,p.height=d.height;let m=p.getContext("2d",{willReadFrequently:!0});return m?.drawImage(d,0,0),m?m.getImageData(0,0,d.width,d.height):null}function IS(d){let{roots:p,indirectBuffer:m}=nr.serialize(d,{cloneBuffers:!1});return p.reduce((g,_)=>g+_.byteLength,m?.byteLength??0)}function LS(d){let p=performance.now(),m=new nr(d.geometry,{indirect:!0}),g=IS(m);return d.geometry.boundsTree=m,d.raycast=Gp,performance.measure("map2lap.bvh",{start:p,detail:g}),g}var nm=(d)=>d.vertices*us*4+4+d.indices*2;function _i(d,p){let m=p.getBoundingClientRect();return new $t((d.clientX-m.left)/m.width*2-1,-(d.clientY-m.top)/m.height*2+1)}async function za(d,p,m=Yy){let g;try{if(g=await fetch(d,{signal:p}),g.ok)return await g.arrayBuffer()}catch(_){if(p.aborted||m<=1)throw _;return await new Promise((x)=>setTimeout(x,Zy)),za(d,p,m-1)}throw Error((await g.json().catch(()=>null))?.error??`${d}: ${g.status}`)}function sm(d){let p=[],m=0;return async(g)=>{if(m>=d)await new Promise((_)=>p.push(_));m++;try{return await g()}finally{m--,p.shift()?.()}}}var NS=sm(Wy);async function DS(d,p,m){let g;if(/\.dds$/i.test(p)){let _=new oh().parse(d,!0);g=new Ir(_.mipmaps,_.width,_.height,_.format),g.minFilter=_.mipmapCount>1?Hn:Tn}else{let _=await createImageBitmap(new Blob([d]),{imageOrientation:"none",premultiplyAlpha:"none"});g=new We(_),g.generateMipmaps=!0,g.minFilter=Hn}return g.flipY=!1,g.wrapS=g.wrapT=Do,g.anisotropy=m,g.colorSpace=zo,g.needsUpdate=!0,g}function im(d,p,m,g){let _=d.at(-1),x=d.at(-2);if(d.length>=wS)_[2]+=g;else if(Math.hypot(p-_[0],m-_[1])>=TS)d.push([p,m,g]);else if(x&&x[0]===_[0]&&x[1]===_[1])_[2]+=g;else d.push([_[0],_[1],g])}function US(d,p){let m=[],g=p/2,_=(y)=>{let S=d[Math.max(0,y-1)],b=d[Math.min(d.length-1,y+1)],M=Math.hypot(b[0]-S[0],b[2]-S[2])||1;return[(b[2]-S[2])/M*g,(S[0]-b[0])/M*g]},x=(y)=>{let[S,b]=_(y);return[d[y][0]+S,d[y][1]+hs,d[y][2]+b]},v=(y)=>{let[S,b]=_(y);return[d[y][0]-S,d[y][1]+hs,d[y][2]-b]};for(let y=0;y+1<d.length;y++)m.push(...x(y),...x(y+1),...v(y),...v(y+1));return m.push(...x(0),...v(0),...x(d.length-1),...v(d.length-1)),m}function FS([d,p,m]){let g=p+hs;return[d-ka,g,m,d+ka,g,m,d,g,m-ka,d,g,m+ka]}function OS(d,p,m){return Math.hypot(...d.map((g,_)=>Math.max(Math.abs(p[_]-g),Math.abs(m[_]-g))))}function Ha(d,p){d.computeBoundingBox();let m=d.boundingBox;d.boundingSphere=new Sn(new q(...p.center),Math.max(p.radius,OS(p.center,m.min.toArray(),m.max.toArray())))}function BS(d,p){let m=new Ye,g=new qo(new Float32Array(p,0,d.vertices*us),us);m.setAttribute("position",new ji(g,3,0)),m.setAttribute("normal",new ji(g,3,3)),m.setAttribute("uv",new ji(g,2,6));let _=d.vertices*us*4+4;return m.setIndex(new Xe(new Uint16Array(p,_,d.indices),1)),Ha(m,d),m}class Fh{renderer;scene=new Vo;camera=new En(55,1,0.5,Lh);resizing;down=new Ur;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=Nh;highest=Zp;area=Ya([]);lastGround=0;zoomLeft=0;zoomAim=new q;host;flying=new Set;lastFrame=0;settings=c;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new Ur;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=Kp;onIndexed=()=>{};pickedBox=null;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};draft=0;refreshes=sm(Vp);brush=null;onStroke=()=>{};askPreview=()=>Promise.resolve(null);onStrokeRefused=()=>{};onBrushWheel=()=>{};ring=null;stroke=null;previewed=new Set;underPreview=new Map;previewShown=new Map;wheelTaken=!1;marking=null;pins=[];pinMarks=null;pinTexture=null;dragged=null;onPinMoved=()=>{};onPinTaken=()=>{};onClicked=()=>{};band=null;constructor(d){this.host=d,this.renderer=new rh({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),d.appendChild(this.renderer.domElement),this.scene.background=new re("#a9cfe9"),this.scene.add(new ra("#ffffff",2));let p=new sa("#fff4e0",1.6);p.position.set(0.5,1,0.35),this.scene.add(p),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.dragPins(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(d),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(d){if(this.shown=d,d)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(d){this.settings=d}setHover(d){this.onHover=d}setPick(d){this.onPick=d}setIndexed(d){this.onIndexed=d,d(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.mark(null),this.onPick(null)}setRemoved(d,p=[],m=[]){this.named={ids:d,objectSorts:new Set(m)};let g=this.wanted(),_=new Set(p),x=p.length!==this.removedSorts.size||p.some((y)=>!this.removedSorts.has(y)),v=!1;for(let y of this.removed)if(!g.has(y))this.leaveOut(y,!1),v=!0;if(x){this.removedSorts=_;for(let y of this.billboardMeshes())this.restore(y);v=!0}for(let y of g)if(v||!this.removed.has(y))this.leaveOut(y,!0);if(v&&this.removedSorts.size)for(let y of this.billboardMeshes())this.leaveOutSorts(y);if(this.removed=g,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(d=this.named){return new Set([...d.ids,...Ja(this.data?.objects??{},d.objectSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let d of this.removed){let p=d.slice(0,d.lastIndexOf("#"));if(!this.data?.objects?.[p]){if(!this.billboardsOut.has(p))this.billboardsOut.set(p,[]);this.billboardsOut.get(p).push(d);continue}for(let m of this.piecesOf(d)){if(!this.listedOut.has(m.mesh))this.listedOut.set(m.mesh,[]);this.listedOut.get(m.mesh).push(m)}}}countOfListed(d,p,m){if(!this.data)return 0;return Qh(this.data.objects,d,jh(this.wanted({ids:p,objectSorts:new Set(m)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(d){let p=d.userData.indices;if(!p)return;let m=d.geometry.getIndex();m.array.set(p),m.needsUpdate=!0}*billboardsOf(d){let p=d.userData.info,m=p.indices/3,g=p.first_face;for(let _=ar(0,g);_<=ar(Math.max(0,m-1),g);_++){let[x,v]=to(_,g,m);if(x<v)yield[_,x,v]}}spriteOf(d,p){let m=d.geometry.getAttribute("uv"),g=d.userData.indices??d.geometry.getIndex().array,[_,x,v]=[g[p*3],g[p*3+1],g[p*3+2]];return Ka(this.data.atlas,(m.getX(_)+m.getX(x)+m.getX(v))/3,(m.getY(_)+m.getY(x)+m.getY(v))/3)}leaveOutSorts(d){if(!this.removedSorts.size||!this.data)return;let p=d.userData.info;for(let[,m,g]of this.billboardsOf(d)){let _=this.spriteOf(d,m);if(_&&this.removedSorts.has(_))this.leaveOutIn(d,{mesh:p.i,from:m,end:g},!0)}}countOf(d){let p=new Set;for(let m of this.billboardMeshes()){let g=m.userData.info;for(let[_,x]of this.billboardsOf(m))if(this.spriteOf(m,x)===d)p.add(`${g.base}#${_}`)}return p.size}piecesOf(d){let p=d.lastIndexOf("#"),m=d.slice(0,p),g=Number(d.slice(p+1)),_=this.data?.objects?.[m]?.faces[g];if(_)return[..._.map(([x,v,y])=>({mesh:x,from:v,end:v+y})),...(this.belonging.get(d)??[]).flatMap((x)=>this.piecesOf(x))];return(this.parts.get(m)??[]).map((x)=>{let v=x.userData.info,[y,S]=to(g,v.first_face,v.indices/3);return{mesh:v.i,from:y,end:S}}).filter((x)=>x.from<x.end)}leaveOut(d,p){for(let m of this.piecesOf(d)){let g=this.byNumber.get(m.mesh);if(g)this.leaveOutIn(g,m,p)}}leaveOutIn(d,{from:p,end:m},g){let _=d.geometry.getIndex(),x=_.array;if(!d.userData.indices)d.userData.indices=x.slice(),this.usedBytes+=x.byteLength;if(g)x.fill(0,p*3,m*3);else x.set(d.userData.indices.subarray(p*3,m*3),p*3);_.needsUpdate=!0}async open(d,p){let m=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:g}=this.loading;if(this.clear(),this.trackName=d,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),p(d?"Reading the track …":""),!d)return;try{await this.load(d,m,g,p)}catch(_){if(m!==this.token)return;this.loading.abort(),p(`Could not load this track: ${_.message}`)}}async load(d,p,m,g){let _=await fetch(`/api/editor/${encodeURIComponent(d)}/index`,{signal:m}),x=await _.json();if(p!==this.token)return;if(!_.ok){g(x.error||"Could not read this track");return}this.data=x,this.objectPieces=eu(x.objects),this.belonging=tu(x.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(x.revision),this.placeCamera(x),this.renderer.domElement.focus({preventScroll:!0});let v=Za(x.meshes,this.camera.position.toArray()),y=this.camera.position.clone(),S=performance.now(),b=v.length,M=0;if(await Promise.all(Array.from({length:Vp},async()=>{while(v.length&&p===this.token){if(performance.now()-S>qy&&y.distanceTo(this.camera.position)>Xy)v=Za(v,this.camera.position.toArray()),y=this.camera.position.clone(),S=performance.now();let E=v.pop();if(!Qr(this.usedBytes,Ih*nm(E),this.settings.memoryGb)){this.overLimit=!0,v.length=0;return}this.usedBytes+=Ih*nm(E);let w=this.heightsVersion,C=await za(`/api/editor/${encodeURIComponent(d)}/mesh/${E.i}?r=${x.revision}&d=${this.draft}`,m);if(p!==this.token)return;if(this.addMesh(d,x,E,C),w!==this.heightsVersion)this.refresh(E.i);M++,g(`Loading: ${M} of ${b} parts`)}})),p!==this.token)return;if(await Promise.all(this.textures),p!==this.token)return;g(this.overLimit?`Memory limit reached (Settings): ${M} of ${b} parts, the nearest ones`:`${b} parts loaded`)}turnAround(d){let p=null,m=new q,g=0;d.addEventListener("mousedown",(_)=>{if(_.button===Dh)_.preventDefault()}),d.addEventListener("pointerdown",(_)=>{if(_.button!==Dh)return;this.zoomLeft=0,p={x:_.clientX,y:_.clientY};let x=this.camera.position,v=this.camera.getWorldDirection(new q);g=Math.max(Ba,Math.min(this.reachOfLook(),this.groundAlong(x,v)?.distance??this.wayDown(v))),m=x.clone().addScaledVector(v,g),this.intoArea(m)}),d.addEventListener("pointermove",(_)=>{if(!p)return;if(!(_.buttons&nS)){p=null;return}let{look:x,invertLook:v}=this.settings,y=Qy*x/u;this.turn(m,g,(p.x-_.clientX)*y,(p.y-_.clientY)*y*(v?-1:1)),p={x:_.clientX,y:_.clientY}}),d.addEventListener("pointerup",(_)=>{if(_.button===Dh)p=null})}grabGround(d){let p=null,m=new q,g=new q;d.addEventListener("pointerdown",(x)=>{if(x.button!==Xp)return;this.zoomLeft=0,this.picker.setFromCamera(_i(x,d),this.camera);let{ray:v}=this.picker,y=this.groundAlong(v.origin,v.direction)?.point.y??this.lastGround;if(p=new pn(new q(0,1,0),-y),!v.intersectPlane(p,g))p=null});let _=(x,v)=>{if(this.picker.setFromCamera(_i(x,d),this.camera),!this.picker.ray.intersectPlane(v,m)||m.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=g.x-m.x,this.camera.position.z+=g.z-m.z,this.settle(),this.clearance=this.height,this.moved()};d.addEventListener("pointermove",(x)=>{if(!p)return;if(x.buttons&iS)_(x,p);else p=null}),d.addEventListener("pointerup",(x)=>{if(x.button!==Xp)return;if(p)_(x,p);p=null})}zoomWheel(d){d.addEventListener("wheel",(p)=>{if(p.preventDefault(),(this.brush||this.wheelTaken)&&(p.ctrlKey||p.altKey)){if(p.deltaY)this.onBrushWheel(p.altKey?"height":"radius",p.deltaY<0?1:-1);return}if(!this.data||this.held)return;this.mouse=_i(p,d);let m=this.hit(),{ray:g}=this.picker,_=this.camera.position,x=m||g.direction.y<0?g.direction:this.camera.getWorldDirection(new q),v=Math.min(m?.distance??this.wayDown(x),Math.max(this.height,Ba)*oS);this.zoomAim.copy(_).addScaledVector(x,Math.max(v,Ba));let y=p.deltaMode===WheelEvent.DOM_DELTA_LINE?p.deltaY/rS*qp:p.deltaY;this.zoomLeft+=Pi.clamp(y/qp,-Yp,Yp)*this.settings.zoom/u},{passive:!1})}glideZoom(d){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let p=this.zoomLeft*(1-Math.exp(-d/aS));if(Math.abs(this.zoomLeft-p)<lS)p=this.zoomLeft;this.zoomLeft-=p;let m=this.camera.position,g=m.distanceTo(this.zoomAim);if(!g)return;let _=Math.max(Math.min(g,Ba),g*(1-sS)**-p);m.lerpVectors(this.zoomAim,m,_/g),this.settle(),this.clearance=this.height,this.moved()}followMouse(d){d.addEventListener("pointermove",(p)=>{if(this.mouse=_i(p,d),this.held=p.buttons,!p.buttons)this.hoverDue=!0}),d.addEventListener("pointerdown",(p)=>{this.held=p.buttons}),d.addEventListener("pointerup",(p)=>{this.held=p.buttons,this.hoverDue=!0}),d.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(d){let p=this.brush;if(this.brush=d,!d){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!p)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(d,p,m){this.onStroke=d,this.askPreview=p,this.onStrokeRefused=m}cancelStroke(){if(!this.stroke)return!1;return clearInterval(this.stroke.timer),this.stroke=null,this.takeBackPreview(),!0}takeBackPreview(){for(let[d,p]of this.underPreview){let m=this.byNumber.get(d);if(!m)continue;let g=m.geometry.getAttribute("position").data,_=g.array;for(let[x,v]of p){let y=x*us;_[y+1]=v[0],_[y+3]=v[1],_[y+4]=v[2],_[y+5]=v[3]}g.needsUpdate=!0,Ha(m.geometry,m.userData.info),m.geometry.boundsTree?.refit(),this.previewed.delete(d),this.dirty=!0}this.underPreview.clear(),this.previewShown.clear()}keepPreview(){this.underPreview.clear(),this.previewShown.clear()}dropPreview(){let d=[...this.previewed];this.previewed.clear();for(let p of d)this.refresh(p)}setWheelTaken(d){this.wheelTaken=d}setClicked(d){this.onClicked=d}setMarking(d){this.marking=d}heightOfGround(d,p){return this.groundAlong(new q(d,Lh,p),new q(0,-1,0))?.point.y??this.lastGround}drawBand(d,p){if(this.band)this.scene.remove(this.band),this.band.geometry.dispose(),this.band.material.dispose(),this.band=null;if(this.dirty=!0,!d?.length)return;let m=d.length===1?FS(d[0]):US(d,p);this.band=new pi(new Ye().setAttribute("position",new rn(m,3)),new Li({color:jp,depthTest:!1,transparent:!0})),this.band.renderOrder=10,this.band.frustumCulled=!1,this.scene.add(this.band)}drawPins(d){if(this.pins=d,this.dragged=null,this.pinMarks)this.scene.remove(this.pinMarks),this.pinMarks.geometry.dispose(),this.pinMarks.material.dispose(),this.pinMarks=null;if(this.dirty=!0,!d.length){this.renderer.domElement.style.cursor="";return}this.pinMarks=new es(new Ye().setAttribute("position",new rn(d.flatMap(([p,m,g])=>[p,m+hs,g]),3)),new Pr({color:jp,size:Qp,sizeAttenuation:!1,map:this.pinImage(),alphaTest:0.5,depthTest:!1,transparent:!0})),this.pinMarks.renderOrder=11,this.pinMarks.frustumCulled=!1,this.scene.add(this.pinMarks)}pinImage(){if(this.pinTexture)return this.pinTexture;let d=document.createElement("canvas");d.width=d.height=32;let p=d.getContext("2d");return p.fillStyle="#ffffff",p.beginPath(),p.arc(16,16,15,0,2*Math.PI),p.fill(),this.pinTexture=new $o(d),this.pinTexture}setPinned(d,p){this.onPinMoved=d,this.onPinTaken=p}pinAt(d,p){let m=p.getBoundingClientRect(),g=new q,_=-1,x=Qp;return this.pins.forEach(([v,y,S],b)=>{g.set(v,y+hs,S).project(this.camera);let M=Math.hypot((g.x+1)/2*m.width+m.left-d.clientX,(1-g.y)/2*m.height+m.top-d.clientY);if(g.z<1&&M<x)x=M,_=b}),_}dropDragged(){let d=this.dragged;if(this.dragged=null,!d||!this.pinMarks)return;this.pins[d.pin]=d.from;let[p,m,g]=d.from;this.pinMarks.geometry.getAttribute("position").setXYZ(d.pin,p,m+hs,g).needsUpdate=!0,this.dirty=!0}dragPins(d){d.addEventListener("pointerdown",(p)=>{if(p.button!==sr||this.brush)return;let m=this.pinAt(p,d);if(m<0)return;this.dragged={pin:m,x:p.clientX,y:p.clientY,from:this.pins[m]},d.setPointerCapture(p.pointerId)}),d.addEventListener("pointermove",(p)=>{if(!this.dragged){if(this.pins.length)d.style.cursor=this.pinAt(p,d)>=0?"grab":"";return}this.mouse=_i(p,d);let m=this.brushAt();if(!m||!this.pinMarks)return;this.pins[this.dragged.pin]=[m.x,m.y,m.z],this.pinMarks.geometry.getAttribute("position").setXYZ(this.dragged.pin,m.x,m.y+hs,m.z).needsUpdate=!0,this.dirty=!0}),d.addEventListener("pointerup",(p)=>{let m=this.dragged;if(!m||p.button!==sr)return;if(Math.hypot(p.clientX-m.x,p.clientY-m.y)<$p)return this.dropDragged();this.dragged=null,this.onPinMoved(m.pin,this.pins[m.pin][0],this.pins[m.pin][2])}),d.addEventListener("pointercancel",()=>this.dropDragged())}sample(){let d=this.stroke;if(!d||!this.mouse)return;let p=performance.now(),m=(p-d.at)/1000,g=d.samples.at(-1);d.at=p;let _=`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`;if(_===d.look)im(d.samples,g[0],g[1],m);else{let x=this.brushAt();if(d.look=_,this.placeRing(x,d.lower!==this.brush?.lower),x)im(d.samples,x.x,x.z,m)}if(!d.asking&&p-d.asked>=AS)d.asking=!0,d.asked=p,this.askPreview(d.samples.map((x)=>[...x]),d.lower).then((x)=>{if(d.asking=!1,this.stroke!==d)return;if(typeof x==="string")this.cancelStroke(),this.onStrokeRefused(x);else if(x)this.showPreview(x)},()=>{d.asking=!1})}showPreview(d){this.takeBackPreview();let p=new Uint32Array(d),m=1;for(let g=0;g<p[0];g++){let _=p[m],x=p[m+1];this.previewShown.set(_,{numbers:p.subarray(m+2,m+2+x),values:new Float32Array(d,(m+2+x)*4,x*Uh)}),m+=2+x+x*Uh,this.laidOver(_)}this.dirty=!0}laidOver(d){let p=this.previewShown.get(d),m=this.byNumber.get(d);if(!p||!m)return;let{numbers:g,values:_}=p,x=m.geometry.getAttribute("position").data,v=x.array,y=new Map;this.underPreview.set(d,y);for(let S=0;S<g.length;S++){let b=g[S]*us,M=S*Uh;y.set(g[S],[v[b+1],v[b+3],v[b+4],v[b+5]]),v[b+1]=_[M],v[b+3]=_[M+1],v[b+4]=_[M+2],v[b+5]=_[M+3]}x.needsUpdate=!0,Ha(m.geometry,m.userData.info),m.geometry.boundsTree?.refit(),this.previewed.add(d)}setBrushWheel(d){this.onBrushWheel=d}refreshMeshes(d,p){this.draft=p;let m=new Set(this.previewShown.size?d:[...d,...this.previewed]);if(!this.previewShown.size)this.previewed.clear();if(!m.size)return;this.heightsVersion++;for(let g of m)this.refresh(g)}setViewFailed(d){this.onViewFailed=d}async refresh(d){let p=this.token,{signal:m}=this.loading,g=this.byNumber.get(d);if(!g||!this.data)return;let _=g.userData.asked=(g.userData.asked??0)+1;try{let x=await this.refreshes(()=>za(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${d}?r=${this.data.revision}&d=${this.draft}`,m));if(p===this.token&&g.userData.asked===_)this.takeVertices(g,x)}catch(x){if(p===this.token&&!m.aborted&&g.userData.asked===_)this.onViewFailed(x.message)}}takeVertices(d,p){let m=d.geometry,g=d.userData.info,_=m.getAttribute("position").data;if(_.array.set(new Float32Array(p,0,g.vertices*us)),_.needsUpdate=!0,this.underPreview.delete(g.i),Ha(m,g),m.boundsTree?.refit(),this.laidOver(g.i),this.marked)this.markDue=!0;this.dirty=!0,this.hoverDue=!0}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:d}=this.picker,p=this.groundAlong(d.origin,d.direction);return p&&bS.test(p.object.name)?p.point:null}placeRing(d,p){if(!this.brush)return;if(!this.ring){let m=Array.from({length:tm},(g,_)=>{let x=_/tm*2*Math.PI;return new q(Math.cos(x),0,Math.sin(x))});this.ring=new ts(new Ye().setFromPoints(m),new Li({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!d,d)this.ring.position.copy(d),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(this.brush.lower!==p?CS:RS);this.dirty=!0}strokes(d){d.addEventListener("pointerdown",(p)=>{if(!this.brush||p.button!==sr)return;this.mouse=_i(p,d);let m=this.brushAt();if(!m)return;let g=performance.now();this.stroke={samples:[[m.x,m.z,0]],lower:this.brush.lower!==p.shiftKey,at:g,asked:g,asking:!1,look:`${this.mouse.x} ${this.mouse.y} ${this.camera.position.toArray()}`,timer:setInterval(()=>this.sample(),ES)},d.setPointerCapture(p.pointerId)});for(let p of["keydown","keyup"])d.addEventListener(p,(m)=>{if(this.brush&&m.key==="Alt")m.preventDefault()});d.addEventListener("pointermove",(p)=>{if(!this.brush)return;if(this.mouse=_i(p,d),!this.stroke)this.placeRing(this.brushAt(),p.shiftKey)}),d.addEventListener("pointerup",(p)=>{if(!this.stroke||p.button!==sr)return;this.mouse=_i(p,d),this.sample();let{samples:m,lower:g,timer:_}=this.stroke;clearInterval(_),this.stroke=null,this.keepPreview(),this.onStroke(m,g)}),d.addEventListener("pointercancel",()=>this.cancelStroke()),d.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(d){let p=null;d.addEventListener("pointerdown",(m)=>{p=m.button===0&&!this.brush&&this.pinAt(m,d)<0||m.button===2?{x:m.clientX,y:m.clientY,button:m.button}:null}),d.addEventListener("pointermove",(m)=>{if(p&&Math.hypot(m.clientX-p.x,m.clientY-p.y)>=$p)p=null}),d.addEventListener("pointerup",(m)=>{let g=p?.button===2&&m.button===2?this.pinAt(m,d):-1;if(g>=0)this.onPinTaken(g);else if(p&&m.button===p.button){let _=this.pick(m,d),x=d.getBoundingClientRect();if(m.button===2&&_)this.onMenu({x:m.clientX-x.left,y:m.clientY-x.top,width:x.width,height:x.height});if(m.button===sr)this.onClicked(_)}p=null}),d.addEventListener("contextmenu",(m)=>m.preventDefault())}pick(d,p){if(!this.data)return null;this.mouse=_i(d,p);let m=this.hit(),g=m?this.describe(m):null;if(!g)return this.unpick(),null;let _=g.id?this.boundsOf(g.id):null;this.mark(_);let x=_?.getCenter(new q).setY(_.min.y),v={id:g.id,afterBuild:!g.id&&xS.test(g.object),kind:g.kind,sprite:g.sprite,sort:g.sort,position:x?[x.x,x.y,x.z]:g.at,left:d.button===sr,road:m&&MS.test(m.object.name)?[m.point.x,m.point.z]:null};return this.onPick(v),v}setMenu(d){this.onMenu=d}setMarked(d){this.marked=d,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let d=this.marked.tree?this.treesOf(this.marked.sort):this.listedOf(this.marked.sort),p=new Float32Array(d.length*24*3),m=new q;d.forEach((_,x)=>{_S.forEach(([v,y],S)=>{for(let[b,M]of[v,y].entries())m.set(M&1?_.max.x:_.min.x,M&2?_.max.y:_.min.y,M&4?_.max.z:_.min.z),m.toArray(p,(x*24+S*2+b)*3)})});let g=new Ye().setAttribute("position",new Xe(p,3));this.markedLines=new pi(g,new Li({color:Jp,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(d){let p=[];for(let m of Ja(this.data.objects,new Set([d]))){let g=m.lastIndexOf("#"),_=this.data.objects[m.slice(0,g)].faces[Number(m.slice(g+1))],x=this.shownBounds(_.map(([v,y,S])=>({mesh:v,from:y,end:y+S})));if(x)p.push(x)}return p}treesOf(d){let p=new Map;for(let m of this.billboardMeshes()){let g=m.userData.info;for(let[_,x,v]of this.billboardsOf(m)){if(this.spriteOf(m,x)!==d)continue;let y=`${g.base}#${_}`;p.set(y,[...p.get(y)??[],{mesh:g.i,from:x,end:v}])}}return[...p.values()].map((m)=>this.shownBounds(m)).filter((m)=>m!==null)}shownBounds(d){let p=new Se,m=new q;for(let{mesh:g,from:_,end:x}of d){let v=this.byNumber.get(g),y=v?.geometry.getIndex().array;if(!v||!y||_>=x||y[_*3]===y[_*3+1])continue;let S=v.geometry.getAttribute("position");for(let b=_*3;b<x*3;b++)p.expandByPoint(m.fromBufferAttribute(S,y[b]))}return p.isEmpty()?null:p}mark(d){if(this.pickedBox)this.scene.remove(this.pickedBox),this.pickedBox.dispose(),this.pickedBox=null;if(d)this.pickedBox=new aa(d,new re(Jp)),this.pickedBox.material.depthTest=!1,this.scene.add(this.pickedBox);this.dirty=!0}boundsOf(d){let p=new Se,m=new q;for(let{mesh:g,from:_,end:x}of this.piecesOf(d)){let v=this.byNumber.get(g);if(!v)continue;let y=v.geometry.getAttribute("position"),S=v.userData.indices??v.geometry.getIndex().array;for(let b=_*3;b<x*3;b++)p.expandByPoint(m.fromBufferAttribute(y,S[b]))}return p}solidAt(d){let p=d.object.material;if(!p.alphaTest||!p.map||!d.uv)return!0;let m=this.alphaOf.get(p.map);if(m===void 0){if(m=p.map.image instanceof ImageBitmap?PS(p.map.image):null,this.alphaOf.set(p.map,m),m)this.usedBytes+=m.data.byteLength}if(!m)return!0;let g=Math.floor((d.uv.x-Math.floor(d.uv.x))*m.width),_=Math.floor((d.uv.y-Math.floor(d.uv.y))*m.height);return m.data[(_*m.width+g)*4+3]/255>=p.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;if(this.marking){let p=this.brushAt();if(p)this.marking(p.x,p.z)}let d=em("map2lap.hover",()=>this.hit());this.onHover(d?this.describe(d):null)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let d=this.picker.intersectObjects(this.meshes.filter((p)=>p.visible),!1).find((p)=>this.solidAt(p));return this.wireNear(d?.distance??1/0)??d}wireNear(d){let{ray:p}=this.picker,m=this.renderer.domElement.clientHeight||1,g=2*Math.tan(Pi.degToRad(this.camera.fov)/2)/m*yS,_=new q,x=new q,v=new q,y=new q,S,b=d;for(let M of this.meshes){if(!M.visible||!vS.test(M.name))continue;let T=M.geometry.boundingSphere,E=p.direction.dot(T.center.clone().sub(p.origin));if(p.distanceSqToPoint(T.center)>(T.radius+Math.max(E,0)*g)**2)continue;let w=M.geometry.getIndex().array,C=M.geometry.getAttribute("position");for(let N=0;N*3<w.length;N+=SS){if(w[N*3]===w[N*3+1])continue;_.fromBufferAttribute(C,w[N*3]),x.fromBufferAttribute(C,w[N*3+1]);let A=p.distanceSqToSegment(_,x,v,y),R=v.distanceTo(p.origin);if(R<b&&A<=(R*g)**2)b=R,S={distance:R,point:y.clone(),object:M,faceIndex:N}}}return S}describe(d){let p=this.data,m=d.object,g=m.userData.info,_=p.materials[g.material],x=p.textures.find((A)=>A.name===_.texture),{x:v,y,z:S}=d.point,b=d.faceIndex??0,M=d.uv?[d.uv.x,d.uv.y]:null,T=g.first_face!==null&&g.first_face!==void 0,E=T?ar(b,g.first_face):null,w=nu(this.objectPieces.get(g.i),b),C=w?p.objects[w.slice(0,w.lastIndexOf("#"))]:null,N=w?Number(w.slice(w.lastIndexOf("#")+1)):-1;return{id:E!==null?`${g.base}#${E}`:w,kind:w?$a(C.kinds[N]):su(g.name),sprite:T&&M?Ka(p.atlas,M[0],M[1]):null,sort:w?eo(C,N):null,object:g.name,physics:iu(g.name),material:_.name,shader:_.shader,texture:_.texture,textureBytes:x?.size??null,vertices:g.vertices,triangles:g.indices/3,triangle:b,uv:M,shownTo:g.lod_out,billboard:T?this.billboard(m,g,b):null,at:[v,y,S],tile:Zh(v,S),route:$h(p.route,v,S),latLon:p.anchor?Jh(p.anchor,v,y,S):null,distance:d.distance}}billboard(d,p,m){let g=p.first_face,_=ar(m,g),[x,v]=to(_,g,p.indices/3);if(v-x<8)return{number:_,height:null,width:null,foot:null};let y=d.geometry.getIndex(),S=d.geometry.getAttribute("position"),b=new Se,M=new q,T=new q;for(let w=x*3;w<v*3;w++)if(M.fromBufferAttribute(S,y.getX(w)),b.expandByPoint(M),w===x*3)T.copy(M);M.fromBufferAttribute(S,y.getX(x*3+1));let E=b.getCenter(new q);return{number:_,height:b.max.y-b.min.y,width:T.distanceTo(M),foot:[E.x,E.z]}}flyKeys(d){d.tabIndex=0,d.addEventListener("pointerdown",()=>d.focus({preventScroll:!0})),d.addEventListener("keydown",(p)=>{if(!mS.has(p.code)||p.ctrlKey||p.metaKey||p.altKey)return;p.preventDefault(),this.flying.add(p.code)}),d.addEventListener("keyup",(p)=>this.flying.delete(p.code)),d.addEventListener("blur",()=>this.flying.clear())}fly(d){let p=this.camera.position,m=this.camera.getWorldDirection(new q).setY(0).normalize(),g=new q().crossVectors(m,this.camera.up).normalize(),_=new q;if(this.flying.has("KeyW"))_.add(m);if(this.flying.has("KeyS"))_.sub(m);if(this.flying.has("KeyD"))_.add(g);if(this.flying.has("KeyA"))_.sub(g);if(!_.lengthSq())return;let x=Math.min(dS,Math.max(uS,this.height*hS));p.add(_.normalize().multiplyScalar(x*this.settings.fly/u*d)),this.keepInArea();let v=this.groundBelow();if(v!==null)p.y+=(v+this.clearance-p.y)*(1-Math.exp(-d/pS));this.settle(v),this.moved()}turn(d,p,m,g){let _=this.camera.getWorldDirection(new q),x=new oa().setFromVector3(_);x.theta+=m,x.phi=Pi.clamp(x.phi-g,Math.PI/2+Wp,Math.PI-Wp),_.setFromSpherical(x);let v=this.camera.position;v.copy(d).addScaledVector(_,-p),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(v.clone().add(_)),this.moved()}groundAlong(d,p){return this.down.set(d,p),em("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let d=this.camera.position;return this.groundAlong(new q(d.x,d.y+Lh,d.z),new q(0,-1,0))?.point.y??null}wayDown(d){return Math.max(this.camera.position.y-this.lastGround,0)/-d.y}reachOfLook(){return Math.max(eS,this.height*tS)}intoArea(d){let{minX:p,maxX:m,minZ:g,maxZ:_}=this.area;d.x=Pi.clamp(d.x,p-Oa,m+Oa),d.z=Pi.clamp(d.z,g-Oa,_+Oa)}keepInArea(){let d=this.camera.position,p=this.camera.getWorldDirection(new q),m=d.clone().addScaledVector(p,Math.min(this.wayDown(p),this.reachOfLook())),g=m.clone();this.intoArea(g),d.x+=g.x-m.x,d.z+=g.z-m.z}settle(d){this.keepInArea(),this.keepHeight(d===void 0?this.groundBelow():d)}keepHeight(d){if(d!==null)this.lastGround=d;let p=this.camera.position;p.y=Pi.clamp(p.y,this.lastGround+jy,this.lastGround+this.highest),this.height=p.y-this.lastGround}home(){if(!this.data)return;this.placeCamera(this.data),this.moved()}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let d=this.host.clientWidth,p=this.host.clientHeight;if(!d||!p)return;this.renderer.setSize(d,p),this.camera.aspect=d/p,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let d=performance.now(),p=Math.min(fS,(d-this.lastFrame)/1000);if(this.lastFrame=d,this.shown&&this.flying.size)this.fly(p);if(this.shown&&this.zoomLeft)this.glideZoom(p);if(!this.shown)return;if(this.dirty){this.dirty=!1;for(let m of this.meshes){let g=this.camera.position.distanceTo(m.geometry.boundingSphere.center);m.visible=g>=m.userData.lodIn&&g<m.userData.lodOut}this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&d-this.lastHover>=gS)this.hoverDue=!1,this.lastHover=d,this.hover();if(this.markDue&&d-this.lastMark>=this.markEvery){let m=performance.now();this.frameMarked(),this.lastMark=d,this.markEvery=Math.max(Kp,4*(performance.now()-m))}}clear(){for(let d of this.meshes)this.scene.remove(d),d.geometry.boundsTree=void 0,d.geometry.dispose();for(let d of this.textures)d?.then((p)=>{if(!p)return;let m=p.image;if(p.dispose(),m instanceof ImageBitmap)m.close()},()=>{});for(let d of this.materials)d?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.objectPieces=new Map,this.belonging=new Map,this.mark(null)}texture(d,p,m){let g=this.textures[m];if(!g){let _=Ih*p.textures[m].size,x=this.token;if(!Qr(this.usedBytes,_,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=_;let v=this.renderer.capabilities.getMaxAnisotropy(),y=this.loading.signal;g=NS(()=>za(`/api/editor/${encodeURIComponent(d)}/texture/${m}?r=${p.revision}`,y).then((S)=>DS(S,p.textures[m].name,v))).then((S)=>{if(S.image instanceof ImageBitmap&&x===this.token){let b=Yh(S.image.width,S.image.height)-_;if(!Qr(this.usedBytes,b,this.settings.memoryGb))return this.usedBytes-=_,this.overLimit=!0,S.dispose(),S.image.close(),null;this.usedBytes+=b}return S}),this.textures[m]=g}return g}material(d,p,m){let g=this.materials[m];if(g)return g;let _=p.materials[m],x=Math.min(1,_.bright),v=new jo({color:new re(x,x,x)});if(_.alpha_ref>0)v.alphaTest=_.alpha_ref;if(_.blend)v.transparent=!0,v.depthWrite=!1;this.materials[m]=v;let y=p.textures.findIndex((S)=>S.name===_.texture);if(y>=0){let S=this.token;this.texture(d,p,y).then((b)=>{if(!b||S!==this.token)return;v.map=b,v.needsUpdate=!0,this.dirty=!0},()=>{})}return v}addMesh(d,p,m,g){let _=new on(BS(m,g),this.material(d,p,m.material));if(_.userData={lodIn:m.lod_in,lodOut:m.lod_out,info:m},_.name=m.name,this.scene.add(_),this.meshes.push(_),m.base!==null&&m.base!==void 0){if(!this.parts.has(m.base))this.parts.set(m.base,[]);this.parts.get(m.base).push(_)}this.byNumber.set(m.i,_),this.laidOver(m.i);for(let x of this.listedOut.get(m.i)??[])this.leaveOutIn(_,x,!0);if(m.base!==null&&m.base!==void 0){for(let x of this.billboardsOut.get(m.base)??[])for(let v of this.piecesOf(x))if(v.mesh===m.i)this.leaveOutIn(_,v,!0);this.leaveOutSorts(_)}if(this.marked)this.markDue=!0;if(Jy.test(m.name)){this.usedBytes+=LS(_),this.grounds.push(_);let x=_.geometry.boundingBox,v=this.camera.position;if(v.x>=x.min.x&&v.x<=x.max.x&&v.z>=x.min.z&&v.z<=x.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(d){let p=new q,m=new q(0,0,1);if(d.start)p.set(...d.start.pos),m.set(...d.start.forward).normalize();else if(d.meshes.length){for(let y of d.meshes)p.add(new q(...y.center));p.divideScalar(d.meshes.length)}this.camera.position.copy(p).addScaledVector(m,-$y).add(new q(0,Nh,0)),this.camera.lookAt(p),this.camera.updateMatrixWorld(),this.clearance=this.height=Nh,this.lastGround=p.y,this.zoomLeft=0,this.area=Ya(d.meshes.filter((y)=>!Ky.test(y.name)));let{minX:g,maxX:_,minZ:x,maxZ:v}=this.area;this.highest=Math.min(cS,Math.max(Zp,_-g,v-x))}}function kS({name:d,title:p,taken:m,built:g,visible:_,controls:x,onStatus:v,onSaved:y}){let S=s(null),b=s(null),[M,T]=n(null),[E,w]=n(null);return i(()=>{let C=new Fh(S.current);return C.setHover(w),T(C),()=>{C.dispose(),T(null)}},[]),i(()=>{M?.show(_)},[M,_]),i(()=>{M?.setControls(x)},[M,x]),i(()=>{M?.open(d,v)},[M,d,g,v]),e("div",{id:"scene",className:Wa.scene,hidden:!_,ref:b,children:[t("div",{className:Wa.view,ref:S}),M&&d&&t(vu,{name:d,title:p,taken:m,view:M,scene:b,reopen:()=>void M.open(d,v),onSaved:y},`${d} ${g}`),t(Su,{hovered:E})]})}export{kS as default};
