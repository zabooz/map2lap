import{a,i,l,s,n,f,r,o,t,e,u,c,h}from"./chunk-86tsvbjh.js";var Ba={scene:"scene_u4kRgA",view:"view_u4kRgA"};var ka={removed:[],sorts:[],objectSorts:[],heights:[]},xi=(d,p)=>{let m=new Set(d),g=new Set(p);return m.size===g.size&&[...m].every((_)=>g.has(_))};function $r(d){let p=d.recipe;return!!p&&xi(d.removed.map((m)=>m.id),p.deleted)&&xi(d.sorts,p.sorts)&&xi(d.objectSorts,p.objectSorts)&&xi(d.heights.map((m)=>m.id),p.heights)}var nr=null,Zp=(d,p)=>xi(d.removed.map((m)=>m.id),p.removed.map((m)=>m.id))&&xi(d.sorts,p.sorts)&&xi(d.objectSorts,p.objectSorts)&&xi(d.heights.map((m)=>m.id),p.heights.map((m)=>m.id));class za{now={...ka,recipe:null,canUndo:!1,canRedo:!1,save:"loading",outdated:0,error:null};onMeshes=()=>{};turns=Promise.resolve();past=[];future=[];base=null;bound=null;revision=0;onServer=this.now;timer;sending=!1;stopped=!1;held=!1;asked=0;sent=0;answered=0;unanswered=[];listeners=new Set;url;send;name;constructor(d,p=(m,g)=>fetch(m,g)){this.name=d,this.url=`/api/editor/${encodeURIComponent(d)}/edits`,this.send=p}markSaved(){let d=this.edits();this.set({recipe:{at:Date.now()/1000,deleted:d.removed.map((p)=>p.id),sorts:d.sorts,objectSorts:d.objectSorts,heights:d.heights.map((p)=>p.id)}})}inTurn(d){return this.turns=this.turns.then(d).catch(()=>{}),this.turns}settled(){return this.turns}boundRevision(){return this.bound}setOnMeshes(d){this.onMeshes=d}handOver(d){nr={name:d,edits:this.edits(),past:this.past,future:this.future}}subscribe=(d)=>(this.listeners.add(d),()=>{this.listeners.delete(d)});state=()=>this.now;set(d){this.now={...this.now,...d};for(let p of this.listeners)p()}canEdit(){return!this.held&&!["loading","stuck"].includes(this.now.save)&&!this.now.outdated&&this.bound===this.base&&this.bound!==null}hold(d){this.held=d,this.set({})}bind(d){this.bound=d,this.compare()}viewBehind(){return this.base!==null&&this.bound!==null&&this.base!==this.bound}compare(){if(this.now.save==="loading")return;if(this.viewBehind())this.set({save:"stuck",error:"This track was built again: the view shows the build before."});else if(this.now.error==="This track was built again: the view shows the build before.")this.set({save:"saved",error:null});else this.set({})}async start(){this.stopped=!1;let d=++this.asked;clearTimeout(this.timer),this.set({save:"loading",error:null});try{let p=await this.send(this.url),m=await p.json();if(d!==this.asked)return;if(!p.ok)throw Error(m.error??`${p.status}`);this.base=m.base,this.revision=m.revision;let g={removed:m.deleted,sorts:m.sorts??[],objectSorts:m.object_sorts??[],heights:m.heights??[]},_=nr?.name===this.name&&Zp(nr.edits,g)?nr:null;nr=null,this.past=_?.past??[],this.future=_?.future??[],this.onServer=g,this.unanswered=[];let x=m.saved,v=x?{at:x.at,deleted:x.deleted,sorts:x.sorts,objectSorts:x.object_sorts,heights:x.heights??[]}:null;this.set({...g,recipe:v,canUndo:this.past.length>0,canRedo:this.future.length>0,outdated:m.outdated,save:"saved"}),this.compare()}catch(p){if(d===this.asked)this.set({save:"stuck",error:p.message})}}stop(){this.stopped=!0,this.asked++,this.saveNow(!0)}async saved(){while(!this.isSaved()&&!["stuck","failed"].includes(this.now.save))await new Promise((d)=>setTimeout(d,50));return this.isSaved()?this.revision:null}saveNow(d=!1){clearTimeout(this.timer),this.flush(d)}remove(d){let p=new Set(this.now.removed.map((m)=>m.id));this.change({...this.edits(),removed:[...this.now.removed,...d.filter((m)=>!p.has(m.id))]})}removeSort(d){if(!this.now.sorts.includes(d))this.change({...this.edits(),sorts:[...this.now.sorts,d]})}removeObjectSort(d){if(!this.now.objectSorts.includes(d))this.change({...this.edits(),objectSorts:[...this.now.objectSorts,d]})}addHeight(d){this.change({...this.edits(),heights:[...this.now.heights,d]})}changed(){return this.now.removed.length>0||this.now.sorts.length>0||this.now.objectSorts.length>0||this.now.heights.length>0}discard(){if(this.changed())this.change(ka)}edits(){return{removed:this.now.removed,sorts:this.now.sorts,objectSorts:this.now.objectSorts,heights:this.now.heights}}discardOutdated(){this.onServer=null,this.set({outdated:0,...ka}),this.saveNow()}undo(){if(!this.canEdit())return;let d=this.past.pop();if(!d)return;this.future.push(this.edits()),this.apply(d)}redo(){if(!this.canEdit())return;let d=this.future.pop();if(!d)return;this.past.push(this.edits()),this.apply(d)}change(d){if(!this.canEdit())return;if(this.past.push(this.edits()),this.past.length>200)this.past.shift();this.future=[],this.apply(d)}apply(d){let p=d.heights===this.now.heights?400:0;this.set({...d,canUndo:this.past.length>0,canRedo:this.future.length>0,save:"waiting",error:null}),clearTimeout(this.timer),this.timer=setTimeout(()=>void this.flush(),p)}isSaved(){return this.now.removed===this.onServer?.removed&&this.now.sorts===this.onServer?.sorts&&this.now.objectSorts===this.onServer?.objectSorts&&this.now.heights===this.onServer?.heights}async flush(d=!1){if(this.isSaved()&&!this.sending&&["waiting","failed"].includes(this.now.save))return this.set({save:"saved",error:null});if(this.sending&&!d||this.now.save==="stuck"||this.isSaved()||this.bound===null)return;let p=this.edits(),m=++this.sent,g=`${Date.now()}-${m}-${Math.random().toString(36).slice(2,10)}`,_=JSON.stringify({base:this.bound,revision:this.revision,deleted:p.removed,sorts:p.sorts,object_sorts:p.objectSorts,heights:p.heights,id:g,unanswered:this.unanswered.map((x)=>x.id)});this.unanswered=[...this.unanswered,{id:g,number:m}].slice(-64),this.sending=!0,this.set({save:"saving"});try{let x=await this.send(this.url,{method:"PUT",headers:{"Content-Type":"application/json"},body:_,keepalive:d&&_.length<60000}),v=await x.json().catch(()=>({}));if(m>=this.sent)this.sending=!1;if(m<this.answered)return;if([400,404,409,413].includes(x.status))return this.sending=!1,this.set({save:"stuck",error:x.status===409?"This track was changed elsewhere: another tab or a build.":v.error??`${x.status}`});if(!x.ok)throw Error(v.error??`${x.status}`);if(this.answered=m,this.revision=v.revision,this.onServer=p,this.unanswered=this.unanswered.filter((y)=>y.number>m),this.onMeshes(v.meshes??[],v.revision),!this.isSaved())return void this.flush(d);if(!this.sending)this.set({save:"saved",error:null})}catch(x){if(m>=this.sent)this.sending=!1;if(this.set({save:"failed",error:x.message}),!this.stopped)this.timer=setTimeout(()=>void this.flush(),5000)}}}var Ue={bar:"bar_0bCY9g",row:"row_0bCY9g",history:"history_0bCY9g",on:"on_0bCY9g",number:"number_0bCY9g",split:"split_0bCY9g",state:"state_0bCY9g",line:"line_0bCY9g"};function Ha(d){let p={minX:1/0,maxX:-1/0,minZ:1/0,maxZ:-1/0};for(let{center:[m,,g],radius:_}of d)p.minX=Math.min(p.minX,m-_),p.maxX=Math.max(p.maxX,m+_),p.minZ=Math.min(p.minZ,g-_),p.maxZ=Math.max(p.maxZ,g+_);return d.length?p:{minX:-1/0,maxX:1/0,minZ:-1/0,maxZ:1/0}}function Ga(d,p){let m=new Map(d.map((g)=>[g,Math.hypot(g.center[0]-p[0],g.center[1]-p[1],g.center[2]-p[2])-g.radius]));return[...d].sort((g,_)=>m.get(_)-m.get(g))}function Jr(d,p,m){return d+p<=m*1073741824}function Bh(d,p){return Math.round(d*p*4*2.333333333333333)}function kh(d,p){return[Math.floor(d/256),Math.floor(-p/256)]}function zh(d,p,m){if(d.length<2)return null;let g=1/0,_=0,x=0;for(let v=0;v+1<d.length;v++){let[y,S]=d[v],M=d[v+1][0]-y,E=d[v+1][1]-S,T=M*M+E*E,b=Math.sqrt(T),w=T?Math.min(1,Math.max(0,((p-y)*M+(m-S)*E)/T)):0,C=Math.hypot(p-(y+w*M),m-(S+w*E));if(C<g)g=C,_=x+w*b;x+=b}return{metre:_,off:g}}function Hh([d,p],m,g,_){let x=Math.PI/180,v=m,y=-_,S=g,M=Math.sin(d*x),E=Math.cos(d*x),T=Math.sin(p*x),b=Math.cos(p*x),w=6378137/Math.sqrt(1-0.0066943799901413165*M*M),C=w*E*b-T*v-M*b*y+E*b*S,N=w*E*T+b*v-M*T*y+E*T*S,A=w*0.9933056200098587*M+E*y+M*S,R=Math.hypot(C,N),P=Math.atan2(A,R*0.9933056200098587);for(let F=0;F<5;F++){let L=Math.sin(P);P=Math.atan2(A+0.0066943799901413165*(6378137/Math.sqrt(1-0.0066943799901413165*L*L))*L,R)}return[P/x,Math.atan2(N,C)/x]}function ir(d,p){return Math.floor((p+d)/8)}function Kr(d,p,m){return[Math.max(0,d*8-p),Math.min(m,(d+1)*8-p)]}var Jp={car:"Parked car",house:"Building","house sign":"Building sign",door:"Door","road sign":"Road sign","town sign":"Town sign","street furniture":"Street furniture","power line":"Power line","power pole":"Power pole",fence:"Fence",rock:"Rock","gas station":"Gas station",pool:"Pool",playground:"Playground equipment","sports goal":"Sports goal",grave:"Grave",tower:"Tower",fountain:"Fountain"},Va=(d)=>Jp[d]??d,Kp={bench:"Bench",bin:"Bin",hydrant:"Hydrant",streetlight:"Street light",polelamp:"Lamp on a pole",signal:"Traffic light","level crossing":"Level crossing",stop:"Stop sign",giveway:"Give way sign",speedk50:"Speed limit 50",speedk60:"Speed limit 60",speedk80:"Speed limit 80",speedk100:"Speed limit 100",pole:"Power pole",pylon:"Pylon",substation:"Substation part",exits:"Exit sign",mileposts:"Milepost",merges:"Merge sign",speeds:"Speed sign",towns:"Town sign"},cs=(d)=>Kp[d]??Va(d),Gh=new Set(["house"]),jr=(d,p)=>d.sorts?.[p]??d.kinds[p];function Wa(d,p){let m=[];if(!p.size)return m;for(let[g,_]of Object.entries(d))_.kinds.forEach((x,v)=>{if(p.has(jr(_,v)))m.push(`${g}#${v}`)});return m}function Vh(d,p){let m=new Set,g=[...d];while(g.length){let _=g.pop();if(m.has(_))continue;m.add(_),g.push(...p.get(_)??[])}return m}function Wh(d,p,m){let g=0;for(let[_,x]of Object.entries(d))x.kinds.forEach((v,y)=>{if(jr(x,y)===p&&x.faces[y].length&&!m.has(`${_}#${y}`))g++});return g}function Xh(d){let p=new Map;for(let[m,g]of Object.entries(d)){g.parents.forEach((_,x)=>{if(_<0)return;let v=`${m}#${_}`;if(!p.has(v))p.set(v,[]);p.get(v).push(`${m}#${x}`)});for(let[_,x]of Object.entries(g.with??{})){let v=`${m}#${_}`;p.set(v,[...p.get(v)??[],...x])}}return p}function qh(d){let p=new Map;for(let[m,g]of Object.entries(d))g.faces.forEach((_,x)=>{for(let[v,y,S]of _){if(!p.has(v))p.set(v,[]);p.get(v).push({from:y,end:y+S,id:`${m}#${x}`})}});for(let m of p.values())m.sort((g,_)=>g.from-_.from);return p}function Yh(d,p){let m=0,g=(d?.length??0)-1;while(m<=g){let _=m+g>>1,x=d[_];if(p<x.from)g=_-1;else if(p>=x.end)m=_+1;else return x.id}return null}function Xa(d,p,m){let g=Math.floor((p-Math.floor(p))*d.cols),_=Math.floor((m-Math.floor(m))*d.rows);return d.sprites[_*d.cols+g]??null}var jp=[[/^1ROAD/,"Road"],[/^1GRAVEL/,"Gravel"],[/^1GRASS/,"Grass"],[/^1KERB/,"Kerb"],[/^1WALL/,"Wall"],[/^nocol_/,"None (drive through)"]],Qp=[[/_trees_bush_|^nocol_bush_/,"Bush"],[/_trees_/,"Tree"],[/_ground_far|^nocol_far/,"Distant terrain"],[/^1ROAD_ground/,"Road surface"],[/^1GRAVEL_ground/,"Gravel or rock"],[/^1GRASS_ground/,"Soft ground"],[/_ground_/,"Ground"],[/_bld/,"Building"],[/_deck/,"Bridge deck"],[/_road_paint/,"Road marking"],[/_road_edge/,"Road edge"],[/_road/,"Road"],[/_rocks/,"Rock"],[/_wire/,"Wire"],[/_water/,"Water"],[/_foam/,"Foam"],[/_guardrail/,"Guardrail"],[/_fence/,"Fence"],[/_props/,"Street furniture"],[/_cars/,"Parked car"],[/_gate/,"Start or finish gate"],[/_tunnel/,"Tunnel"],[/_rail/,"Rail"],[/_walk/,"Pavement"]];function Zh(d){return jp.find(([p])=>p.test(d))?.[1]??"Unknown"}function $h(d){return Qp.find(([p])=>p.test(d))?.[1]??d}var Hi={back:"back_Sp4rzQ",dialog:"dialog_Sp4rzQ",field:"field_Sp4rzQ",buttons:"buttons_Sp4rzQ",primary:"primary_Sp4rzQ",note:"note_Sp4rzQ"};function em(d,p){for(let m=1;;m++){let g=`${d} (copy${m>1?` ${m}`:""})`;if(!p.includes(g))return g}}function Jh({title:d,taken:p,canOverwrite:m,onOverwrite:g,onSaveNew:_,onCancel:x}){let[v,y]=n(d),S=v.trim(),M=S===d,E=!S?"Give it a name.":!M&&p.includes(S)?`Another track is called “${S}” already.`:null,T=M?em(d,p):S;return i(()=>{let b=(w)=>{if(w.key==="Escape")x()};return document.addEventListener("keydown",b),()=>document.removeEventListener("keydown",b)},[x]),t("div",{id:"save-back",className:Hi.back,onMouseDown:(b)=>{if(b.target===b.currentTarget)x()},children:e("form",{id:"save-dialog",className:Hi.dialog,role:"dialog","aria-modal":"true","aria-labelledby":"save-title",onSubmit:(b)=>{if(b.preventDefault(),!E)_(T)},children:[t("b",{id:"save-title",children:"Save track"}),e("label",{className:Hi.field,children:["Name",t("input",{id:"save-name",type:"text",value:v,maxLength:80,autoFocus:!0,onChange:(b)=>y(b.target.value)})]}),t("p",{id:"save-taken",className:Hi.note,children:E??`Save as new track makes “${T}”. Whatever you delete can be brought back later.`}),e("div",{className:Hi.buttons,children:[t("button",{type:"button",onClick:x,children:"Cancel"}),t("button",{type:"button",disabled:!M||!m,onClick:g,children:"Overwrite"}),t("button",{type:"submit",className:Hi.primary,disabled:!!E,children:"Save as new track"})]})]})})}var qa={back:"back_vaYpAg",menu:"menu_vaYpAg"};var Kh=230,jh=130;function Qh({at:d,mark:p,canDelete:m,onMark:g,onDelete:_,onClose:x}){let v=d.x+Kh>d.width?Math.max(0,d.x-Kh):d.x,y=d.y+jh>d.height?Math.max(0,d.y-jh):d.y,S=(M)=>()=>{x(),M()};return t("div",{className:qa.back,onPointerDown:(M)=>{if(M.target===M.currentTarget)x()},onContextMenu:(M)=>M.preventDefault(),children:e("div",{id:"view-menu",className:qa.menu,role:"menu",style:{left:v,top:y},children:[t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Replace…"}),t("button",{type:"button",role:"menuitem",disabled:!0,title:"Comes later",children:"Edit…"}),p&&t("button",{type:"button",role:"menuitem",onClick:S(g),children:p}),t("button",{type:"button",role:"menuitem",disabled:!m,onClick:S(_),children:"Delete"})]})})}var im=(d)=>`${d} ${d===1?"object":"objects"} deleted`,sm=(d)=>`${d} height ${d===1?"change":"changes"}`,rm=(d)=>`${d} ${d===1?"object stands":"objects stand"} at the edge of it and stayed where ${d===1?"it is":"they are"}: its place lies outside.`,om=10,am={radius:15,height:50,soft:70,lower:!1},tu=(d)=>d.removed.length>0||d.sorts.length>0||d.objectSorts.length>0||d.heights.length>0,Ya=(d)=>!tu(d)&&!d.recipe,lm=(d)=>new Date(d*1000).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});function eu({name:d,title:p,taken:m,view:g,scene:_,reopen:x,onSaved:v}){let[y]=n(()=>new za(d)),S=f(y.subscribe,y.state),[M,E]=n(null),[T,b]=n(null),[w,C]=n(null),[N,A]=n(null),[R,P]=n({busy:!1,text:null}),[F,L]=n(!1),[U,k]=n(am),[I,D]=n(null),[z,W]=n(null),{starting:H,play:X}=h(),J=y.canEdit(),G=$r(S),Q=F&&J;i(()=>{y.start();let gt=()=>y.saveNow(!0);return window.addEventListener("pagehide",gt),()=>{window.removeEventListener("pagehide",gt),y.stop()}},[y]),i(()=>(g.setPick((gt)=>{E(gt),C(null)}),g.setMenu(b),g.setIndexed((gt)=>y.bind(gt)),()=>{g.setPick(()=>{}),g.setMenu(()=>{}),g.setIndexed(()=>{})}),[g,y]),i(()=>{g.setRemoved(S.removed.map((gt)=>gt.id),S.sorts,S.objectSorts)},[g,S.removed,S.sorts,S.objectSorts]),i(()=>(g.setMarked(w),()=>g.setMarked(null)),[g,w]),i(()=>(y.setOnMeshes((gt,Gt)=>g.refreshMeshes(gt,Gt)),g.setViewFailed(W),()=>{y.setOnMeshes(()=>{}),g.setViewFailed(()=>{})}),[g,y]),i(()=>(g.setBrush(Q?{radius:U.radius,lower:U.lower}:null),()=>g.setBrush(null)),[g,Q,U.radius,U.lower]);let it=l((gt,Gt)=>{let ae={radius:U.radius,soft:U.soft/100,mm:Math.round(U.height*om)*(Gt?-1:1)};y.inTurn(async()=>{let Re=await r(`/api/editor/${encodeURIComponent(d)}/brush`,{points:gt,base:y.boundRevision(),...ae});if(Re.error||!Re.height)return D(`Not changed: ${Re.error??"no answer"}`);if(!y.canEdit())return D("Not changed: this track can't be changed now");y.addHeight(Re.height),D(Re.standing?rm(Re.standing):null)})});i(()=>(g.setStroke((gt,Gt)=>it(gt,Gt)),()=>g.setStroke(()=>{})),[g]);let j=M?.id?{id:M.id,position:M.position}:null,_t=tu(S),rt=Ya(S),ut=J&&!R.busy&&!G&&!rt,mt=S.removed.map((gt)=>gt.id),Nt=async(gt=null)=>{A(null),P({busy:!0,text:null}),await y.settled(),y.hold(!0),y.saveNow();let Gt=await y.saved();if(Gt===null)return y.hold(!1),P({busy:!1,text:"Not saved: the changes could not be kept. Nothing was written."}),null;let ae=await r(`/api/editor/${encodeURIComponent(d)}/save`,{copy:gt!==null,title:gt,revision:Gt});if(y.hold(!1),ae.error||!ae.name)return P({busy:!1,text:`Not saved: ${ae.error??"no answer"}`}),null;if(P({busy:!1,text:null}),gt!==null)y.handOver(ae.name);else y.markSaved();return v(ae.name),ae.name},ot=async(gt)=>{g.focus();let Gt=N?.play,ae=await Nt(gt);if(ae&&Gt)X(ae)},ft=async()=>{await y.settled();let gt=y.state();if(!y.canEdit()||R.busy||$r(gt)||Ya(gt))return;if(gt.recipe)Nt();else A({play:!1})},Ct=async()=>{await y.settled();let gt=y.state();if($r(gt)||Ya(gt))X(d);else if(!gt.recipe)A({play:!0});else if(await Nt())X(d)},zt=async()=>{let gt=S.heights.map((Gt)=>Gt.id).join();if(await y.start(),y.viewBehind()||y.state().heights.map((Gt)=>Gt.id).join()!==gt)x()},Dt=(gt)=>()=>{gt(),g.focus()},wt=M?.id&&M.sort&&!Gh.has(M.sort)?M.sort:null,jt=M?.id&&M.sprite?M.sprite:null,Qt=!T?null:wt?`Mark all ${cs(wt)} (${g.countOfListed(wt,mt,S.objectSorts)})`:jt?`Mark all ${jt} (loaded: ${g.countOf(jt)})`:null,Ft=w&&(w.tree?w.sort:cs(w.sort)),Zt=()=>{if(!J)return;if(w){if(w.tree)y.removeSort(w.sort);else y.removeObjectSort(w.sort);C(null),g.unpick()}else if(j)y.remove([j]),g.unpick()},qt=a(()=>b(null),[]),fe=a(()=>{A(null),g.focus()},[g]),pe=l((gt)=>{let Gt=gt.ctrlKey||gt.metaKey,ae=gt.key.toLowerCase();if(N){if(Gt&&ae==="s")gt.preventDefault();return}if(gt.key!=="Escape"&&gt.target.tagName==="INPUT")return;if(gt.key==="Delete")Zt();else if(gt.key==="Escape"){if(b(null),C(null),!g.cancelStroke())L(!1);g.focus()}else if(Gt&&ae==="z")y.inTurn(()=>gt.shiftKey?y.redo():y.undo());else if(Gt&&ae==="y")y.inTurn(()=>y.redo());else if(Gt&&ae==="s")ft();else return;gt.preventDefault()});i(()=>{let gt=_.current,Gt=(ae)=>pe(ae);return gt.addEventListener("keydown",Gt),()=>gt.removeEventListener("keydown",Gt)},[_]);let ge=R.busy?"Saving …":G?`Saved ${lm(S.recipe.at)}`:rt?"":"Not saved",be=!H&&!R.busy&&S.save!=="loading"&&(G||rt||ut);return e(o,{children:[e("div",{id:"edit-bar",className:Ue.bar,"data-kept":S.save,children:[e("div",{className:Ue.row,children:[t("button",{type:"button",disabled:!j&&!w||!J,onClick:Dt(Zt),children:"Delete"}),t("button",{type:"button",disabled:!_t||!J,onClick:Dt(()=>void y.inTurn(()=>y.discard())),children:"Discard"}),t("button",{type:"button",id:"edit-brush",className:Q?Ue.on:"","aria-pressed":Q,disabled:!J,title:"Raise or lower the ground: drag over it (Esc ends it)",onClick:Dt(()=>{L(!F),D(null)}),children:"Brush"}),e("span",{className:Ue.split,children:[t("button",{type:"button",id:"edit-save",title:"Write this track for Assetto Corsa (Ctrl+S)",disabled:!ut,onClick:Dt(()=>void ft()),children:"Save"}),t("button",{type:"button",id:"edit-save-more","aria-label":"Save as new track",title:"Save as new track …",disabled:!J||R.busy,onClick:()=>A({play:!1}),children:"▾"})]}),t("button",{type:"button",id:"edit-play",disabled:!be,title:"Save if needed, then drive it in Assetto Corsa",onClick:Dt(()=>void Ct()),children:H?"Starting …":"▶ Play"}),t("span",{id:"edit-saved",className:Ue.state,children:ge}),S.save==="failed"&&t("span",{id:"edit-kept",className:Ue.state,children:"Changes not kept: trying again"})]}),Q&&e("div",{id:"edit-brush-set",className:Ue.row,children:[t("button",{type:"button",className:U.lower?"":Ue.on,"aria-pressed":!U.lower,onClick:Dt(()=>k({...U,lower:!1})),children:"Raise"}),t("button",{type:"button",className:U.lower?Ue.on:"","aria-pressed":U.lower,onClick:Dt(()=>k({...U,lower:!0})),children:"Lower"}),e("label",{className:Ue.number,children:["Height ",t("input",{type:"number",min:1,max:1e4,step:5,value:U.height,onChange:(gt)=>k({...U,height:gt.target.valueAsNumber||0})})," cm"]}),e("label",{className:Ue.number,children:["Radius ",t("input",{type:"number",min:3,max:500,value:U.radius,onChange:(gt)=>k({...U,radius:gt.target.valueAsNumber||0})})," m"]}),e("label",{className:Ue.number,children:["Soft edge ",t("input",{type:"number",min:10,max:100,step:10,value:U.soft,onChange:(gt)=>k({...U,soft:gt.target.valueAsNumber||0})})," %"]}),t("span",{className:Ue.state,children:"Shift: the other way"})]}),I&&t("p",{id:"edit-brush-note",className:Ue.line,children:I}),z&&e("p",{id:"edit-view-failed",className:Ue.line,children:["The view doesn't show the last change, it is kept all the same: ",z," ",t("button",{type:"button",onClick:Dt(x),children:"Load again"})]}),S.heights.length>0&&t("p",{id:"edit-heights",className:Ue.line,children:sm(S.heights.length)}),S.removed.length>0&&t("p",{id:"edit-count",className:Ue.line,children:im(S.removed.length)}),(S.sorts.length>0||S.objectSorts.length>0)&&e("p",{id:"edit-sorts",className:Ue.line,children:["All deleted: ",[...S.sorts,...S.objectSorts.map(cs)].join(", ")]}),w&&e("p",{id:"edit-marked",className:Ue.line,children:["All ",Ft," marked: Delete deletes them all, Esc ends it."]}),M&&!w&&e("p",{id:"edit-picked",className:Ue.line,children:[M.kind,M.sprite&&` · ${M.sprite}`,wt&&cs(wt)!==M.kind&&` · ${cs(wt)}`,!M.id&&(M.afterBuild?": only a new build can delete it":": can't be deleted yet")]}),R.text&&t("p",{id:"edit-made",className:Ue.line,children:R.text}),S.outdated>0&&e("p",{id:"edit-outdated",className:Ue.line,children:[S.outdated," older ",S.outdated===1?"change belongs":"changes belong"," to an earlier build of this track and ",S.outdated===1?"is":"are"," not applied."," ",t("button",{type:"button",onClick:Dt(()=>y.discardOutdated()),children:"Give up"})]}),S.save==="stuck"&&e("p",{id:"edit-stuck",className:Ue.line,children:[S.error," ",t("button",{type:"button",onClick:Dt(()=>void zt()),children:"Read again"})]})]}),e("div",{id:"edit-history",className:Ue.history,children:[t("button",{type:"button",disabled:!S.canUndo||!J,onClick:Dt(()=>void y.inTurn(()=>y.undo())),children:"↶ Undo"}),t("button",{type:"button",disabled:!S.canRedo||!J,onClick:Dt(()=>void y.inTurn(()=>y.redo())),children:"↷ Redo"}),t("button",{type:"button",title:"Back to the first view, behind the start",onClick:Dt(()=>g.home()),children:"⌂ Start"})]}),T&&t(Qh,{at:T,mark:J?Qt:null,canDelete:!!j&&J,onClose:qt,onMark:()=>{C(wt?{sort:wt,tree:!1}:{sort:jt,tree:!0}),g.focus()},onDelete:()=>{Zt(),g.focus()}}),N&&t(Jh,{title:p,taken:m,canOverwrite:ut,onOverwrite:()=>void ot(null),onSaveNew:(gt)=>void ot(gt),onCancel:fe})]})}var nu={box:"box_myLiyw"};var An=(d,p=2)=>d.toFixed(p);function Ke({label:d,children:p}){return e(o,{children:[t("dt",{children:d}),t("dd",{children:p})]})}function iu({hovered:d}){if(!d)return null;let p=d.billboard;return e("div",{id:"hover-box",className:nu.box,children:[e("h4",{children:[d.kind,d.sprite&&` · ${d.sprite}`]}),e("dl",{children:[d.id&&t(Ke,{label:"ID",children:d.id}),p?.height!=null&&e(Ke,{label:"Height",children:[An(p.height,1)," m"]}),p?.width!=null&&e(Ke,{label:"Width",children:[An(p.width,1)," m"]}),p?.foot&&e(Ke,{label:"Stands at",children:[An(p.foot[0],1),", ",An(p.foot[1],1)]}),t(Ke,{label:"Mesh",children:d.object}),t(Ke,{label:"Physics",children:d.physics}),t(Ke,{label:"Material",children:d.material}),t(Ke,{label:"Shader",children:d.shader}),e(Ke,{label:"Texture",children:[d.texture??"none",d.textureBytes!==null&&` (${Math.ceil(d.textureBytes/1024)} KB)`]}),e(Ke,{label:"Size",children:[d.vertices," vertices, ",d.triangles," triangles"]}),t(Ke,{label:"Triangle",children:d.triangle}),d.uv&&e(Ke,{label:"UV",children:[An(d.uv[0],3),", ",An(d.uv[1],3)]}),e(Ke,{label:"Shown up to",children:[Math.round(d.shownTo)," m"]})]}),t("h4",{children:"Position"}),e("dl",{children:[e(Ke,{label:"AC x, y, z",children:[An(d.at[0]),", ",An(d.at[1]),", ",An(d.at[2])]}),e(Ke,{label:"Tile",children:[d.tile[0],", ",d.tile[1]]}),d.route&&e(Ke,{label:"Route",children:[Math.round(d.route.metre)," m, ",An(d.route.off,1)," m off"]}),d.latLon&&e(Ke,{label:"Lat, lon",children:[An(d.latLon[0],6),", ",An(d.latLon[1],6)]}),e(Ke,{label:"Camera",children:[An(d.distance,1)," m away"]})]}),!d.id&&t("p",{children:"This object has no ID of its own yet: the track file merges it with others per tile."})]})}var Yi="187";var Hu=0,Ml=1,Gu=2;var pr=1,Vu=2,Is=3,ci=0,dn=1,Ln=2,Zi=0,mr=1,bl=2,El=3,Tl=4,Wu=5;var Ps=100,Xu=101,qu=102,Yu=103,Zu=104,$u=200,Ju=201,Ku=202,ju=203,Qu=204,td=205,ed=206,nd=207,id=208,sd=209,rd=210,od=211,ad=212,ld=213,cd=214,hd=0,ud=1,dd=2,wl=3,fd=4,pd=5,md=6,gd=7,_d=0,xd=1,vd=2,Yn=0,Al=1,Rl=2,Cl=3,Il=4,Pl=5,Ll=6,Nl=7;var gr=301,Ls=302,Co=303,Io=304,Po=1000,Lo=1001,yd=1002,Ti=1003,Sd=1004;var _r=1005;var Tn=1006,No=1007;var Hn=1008;var Gn=1009,Md=1010,bd=1011,xr=1012,Dl=1013,wi=1014,hi=1015,Zn=1016,Ul=1017,Fl=1018,$i=1020,Ed=35902,Td=35899,wd=1021,Ad=1022,Nn=1023,Ns=1026,Ai=1027,Rd=1028,Ol=1029,Ji=1030,Bl=1031;var kl=1033,Ds=33776,Do=33777,Us=33778,Fs=33779,zl=35840,Hl=35841,Gl=35842,Vl=35843,vr=36196,Wl=37492,Xl=37496,ql=37488,Yl=37489,Uo=37490,Zl=37491,$l=37808,Jl=37809,Kl=37810,jl=37811,Ql=37812,tc=37813,ec=37814,nc=37815,ic=37816,sc=37817,rc=37818,oc=37819,ac=37820,lc=37821,cc=36492,yr=36494,Sr=36495,hc=36283,uc=36284,Fo=36285,dc=36286;var fc=0,Cd=1,Ki="",Oo="srgb",pc="srgb-linear",mc="linear",Ie="srgb";var Id=512,Pd=513,Ld=514,gc=515,Nd=516,Dd=517,_c=518,xc=519;var vc="300 es",yc=2000;function hm(d){for(let p=d.length-1;p>=0;--p)if(d[p]>=65535)return!0;return!1}function um(d){return ArrayBuffer.isView(d)&&!(d instanceof DataView)}function dr(d){return document.createElementNS("http://www.w3.org/1999/xhtml",d)}function Ud(){let d=dr("canvas");return d.style.display="block",d}var su={},Rs=null;function fr(...d){let p="THREE."+d.shift();if(Rs)Rs("log",p,...d);else console.log(p,...d)}function Fd(d){let p=d[0];if(typeof p==="string"&&p.startsWith("TSL:")){let m=d[1];if(m&&m.isStackTrace)d[0]+=" "+m.getLocation();else d[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return d}function Xt(...d){d=Fd(d);let p="THREE."+d.shift();if(Rs)Rs("warn",p,...d);else{let m=d[0];if(m&&m.isStackTrace)console.warn(m.getError(p));else console.warn(p,...d)}}function $t(...d){d=Fd(d);let p="THREE."+d.shift();if(Rs)Rs("error",p,...d);else{let m=d[0];if(m&&m.isStackTrace)console.error(m.getError(p));else console.error(p,...d)}}function cr(...d){let p=d.join(" ");if(p in su)return;su[p]=!0,Xt(...d)}function Od(d,p,m){return new Promise(function(g,_){function x(){switch(d.clientWaitSync(p,d.SYNC_FLUSH_COMMANDS_BIT,0)){case d.WAIT_FAILED:_();break;case d.TIMEOUT_EXPIRED:setTimeout(x,m);break;default:g()}}setTimeout(x,m)})}var Bd={[0]:0,[2]:6,[4]:4,[3]:5,[1]:1,[6]:2,[7]:7,[5]:3};class ui{addEventListener(d,p){if(this._listeners===void 0)this._listeners={};let m=this._listeners;if(m[d]===void 0)m[d]=[];if(m[d].indexOf(p)===-1)m[d].push(p)}hasEventListener(d,p){let m=this._listeners;if(m===void 0)return!1;return m[d]!==void 0&&m[d].indexOf(p)!==-1}removeEventListener(d,p){let m=this._listeners;if(m===void 0)return;let g=m[d];if(g!==void 0){let _=g.indexOf(p);if(_!==-1)g.splice(_,1)}}dispatchEvent(d){let p=this._listeners;if(p===void 0)return;let m=p[d.type];if(m!==void 0){d.target=this;let g=m.slice(0);for(let _=0,x=g.length;_<x;_++)g[_].call(this,d);d.target=null}}}var ln=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ru=1234567,hr=Math.PI/180,Cs=180/Math.PI;function Ri(){let d=Math.random()*4294967295|0,p=Math.random()*4294967295|0,m=Math.random()*4294967295|0,g=Math.random()*4294967295|0;return(ln[d&255]+ln[d>>8&255]+ln[d>>16&255]+ln[d>>24&255]+"-"+ln[p&255]+ln[p>>8&255]+"-"+ln[p>>16&15|64]+ln[p>>24&255]+"-"+ln[m&63|128]+ln[m>>8&255]+"-"+ln[m>>16&255]+ln[m>>24&255]+ln[g&255]+ln[g>>8&255]+ln[g>>16&255]+ln[g>>24&255]).toLowerCase()}function ne(d,p,m){return Math.max(p,Math.min(m,d))}function Sc(d,p){return(d%p+p)%p}function dm(d,p,m,g,_){return g+(d-p)*(_-g)/(m-p)}function fm(d,p,m){if(d!==p)return(m-d)/(p-d);else return 0}function ur(d,p,m){return(1-m)*d+m*p}function pm(d,p,m,g){return ur(d,p,1-Math.exp(-m*g))}function mm(d,p=1){return p-Math.abs(Sc(d,p*2)-p)}function gm(d,p,m){if(d<=p)return 0;if(d>=m)return 1;return d=(d-p)/(m-p),d*d*(3-2*d)}function _m(d,p,m){if(d<=p)return 0;if(d>=m)return 1;return d=(d-p)/(m-p),d*d*d*(d*(d*6-15)+10)}function xm(d,p){return d+Math.floor(Math.random()*(p-d+1))}function vm(d,p){return d+Math.random()*(p-d)}function ym(d){return d*(0.5-Math.random())}function Sm(d){if(d!==void 0)ru=d;let p=ru+=1831565813;return p=Math.imul(p^p>>>15,p|1),p^=p+Math.imul(p^p>>>7,p|61),((p^p>>>14)>>>0)/4294967296}function Mm(d){return d*hr}function bm(d){return d*Cs}function Em(d){return d>0&&Number.isInteger(d)&&2**Math.round(Math.log2(d))===d}function Tm(d){return Math.pow(2,Math.ceil(Math.log(d)/Math.LN2))}function Mc(d){return Math.pow(2,Math.floor(Math.log(d)/Math.LN2))}function wm(d,p,m,g,_){let{cos:x,sin:v}=Math,y=x(m/2),S=v(m/2),M=x((p+g)/2),E=v((p+g)/2),T=x((p-g)/2),b=v((p-g)/2),w=x((g-p)/2),C=v((g-p)/2);switch(_){case"XYX":d.set(y*E,S*T,S*b,y*M);break;case"YZY":d.set(S*b,y*E,S*T,y*M);break;case"ZXZ":d.set(S*T,S*b,y*E,y*M);break;case"XZX":d.set(y*E,S*C,S*w,y*M);break;case"YXY":d.set(S*w,y*E,S*C,y*M);break;case"ZYZ":d.set(S*C,S*w,y*E,y*M);break;default:Xt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+_)}}function Bo(d){switch(d.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function bc(d,p){if(p.constructor===Float32Array)return d;let m=Bo(p);if(m===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.max(d/m,-1)}function Ec(d,p){if(p.constructor===Float32Array)return d;let m=Bo(p);if(m===void 0)throw Error("THREE.MathUtils: Invalid component type.");return Math.round(d*m)}var Ci={DEG2RAD:hr,RAD2DEG:Cs,generateUUID:Ri,clamp:ne,euclideanModulo:Sc,mapLinear:dm,inverseLerp:fm,lerp:ur,damp:pm,pingpong:mm,smoothstep:gm,smootherstep:_m,randInt:xm,randFloat:vm,randFloatSpread:ym,seededRandom:Sm,degToRad:Mm,radToDeg:bm,isPowerOfTwo:Em,ceilPowerOfTwo:Tm,floorPowerOfTwo:Mc,setQuaternionFromProperEuler:wm,normalize:Ec,denormalize:bc};class Jt{static{this.prototype.isVector2=!0}constructor(d=0,p=0){this.x=d,this.y=p}get width(){return this.x}set width(d){this.x=d}get height(){return this.y}set height(d){this.y=d}set(d,p){return this.x=d,this.y=p,this}setScalar(d){return this.x=d,this.y=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;default:throw Error("THREE.Vector2: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;default:throw Error("THREE.Vector2: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y)}copy(d){return this.x=d.x,this.y=d.y,this}add(d){return this.x+=d.x,this.y+=d.y,this}addScalar(d){return this.x+=d,this.y+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this}subScalar(d){return this.x-=d,this.y-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this}multiply(d){return this.x*=d.x,this.y*=d.y,this}multiplyScalar(d){return this.x*=d,this.y*=d,this}divide(d){return this.x/=d.x,this.y/=d.y,this}divideScalar(d){return this.multiplyScalar(1/d)}applyMatrix3(d){let p=this.x,m=this.y,g=d.elements;return this.x=g[0]*p+g[3]*m+g[6],this.y=g[1]*p+g[4]*m+g[7],this}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(d){return this.x*d.x+this.y*d.y}cross(d){return this.x*d.y-this.y*d.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(d){let p=Math.sqrt(this.lengthSq()*d.lengthSq());if(p===0)return Math.PI/2;let m=this.dot(d)/p;return Math.acos(ne(m,-1,1))}distanceTo(d){return Math.sqrt(this.distanceToSquared(d))}distanceToSquared(d){let p=this.x-d.x,m=this.y-d.y;return p*p+m*m}manhattanDistanceTo(d){return Math.abs(this.x-d.x)+Math.abs(this.y-d.y)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this}equals(d){return d.x===this.x&&d.y===this.y}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this}rotateAround(d,p){let m=Math.cos(p),g=Math.sin(p),_=this.x-d.x,x=this.y-d.y;return this.x=_*m-x*g+d.x,this.y=_*g+x*m+d.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class di{constructor(d=0,p=0,m=0,g=1){this.isQuaternion=!0,this._x=d,this._y=p,this._z=m,this._w=g}static slerpFlat(d,p,m,g,_,x,v){let y=m[g+0],S=m[g+1],M=m[g+2],E=m[g+3],T=_[x+0],b=_[x+1],w=_[x+2],C=_[x+3];if(E!==C||y!==T||S!==b||M!==w){let N=y*T+S*b+M*w+E*C;if(N<0)T=-T,b=-b,w=-w,C=-C,N=-N;let A=1-v;if(N<0.9995){let R=Math.acos(N),P=Math.sin(R);A=Math.sin(A*R)/P,v=Math.sin(v*R)/P,y=y*A+T*v,S=S*A+b*v,M=M*A+w*v,E=E*A+C*v}else{y=y*A+T*v,S=S*A+b*v,M=M*A+w*v,E=E*A+C*v;let R=1/Math.sqrt(y*y+S*S+M*M+E*E);y*=R,S*=R,M*=R,E*=R}}d[p]=y,d[p+1]=S,d[p+2]=M,d[p+3]=E}static multiplyQuaternionsFlat(d,p,m,g,_,x){let v=m[g],y=m[g+1],S=m[g+2],M=m[g+3],E=_[x],T=_[x+1],b=_[x+2],w=_[x+3];return d[p]=v*w+M*E+y*b-S*T,d[p+1]=y*w+M*T+S*E-v*b,d[p+2]=S*w+M*b+v*T-y*E,d[p+3]=M*w-v*E-y*T-S*b,d}get x(){return this._x}set x(d){this._x=d,this._onChangeCallback()}get y(){return this._y}set y(d){this._y=d,this._onChangeCallback()}get z(){return this._z}set z(d){this._z=d,this._onChangeCallback()}get w(){return this._w}set w(d){this._w=d,this._onChangeCallback()}set(d,p,m,g){return this._x=d,this._y=p,this._z=m,this._w=g,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(d){return this._x=d.x,this._y=d.y,this._z=d.z,this._w=d.w,this._onChangeCallback(),this}setFromEuler(d,p=!0){let{_x:m,_y:g,_z:_,_order:x}=d,{cos:v,sin:y}=Math,S=v(m/2),M=v(g/2),E=v(_/2),T=y(m/2),b=y(g/2),w=y(_/2);switch(x){case"XYZ":this._x=T*M*E+S*b*w,this._y=S*b*E-T*M*w,this._z=S*M*w+T*b*E,this._w=S*M*E-T*b*w;break;case"YXZ":this._x=T*M*E+S*b*w,this._y=S*b*E-T*M*w,this._z=S*M*w-T*b*E,this._w=S*M*E+T*b*w;break;case"ZXY":this._x=T*M*E-S*b*w,this._y=S*b*E+T*M*w,this._z=S*M*w+T*b*E,this._w=S*M*E-T*b*w;break;case"ZYX":this._x=T*M*E-S*b*w,this._y=S*b*E+T*M*w,this._z=S*M*w-T*b*E,this._w=S*M*E+T*b*w;break;case"YZX":this._x=T*M*E+S*b*w,this._y=S*b*E+T*M*w,this._z=S*M*w-T*b*E,this._w=S*M*E-T*b*w;break;case"XZY":this._x=T*M*E-S*b*w,this._y=S*b*E-T*M*w,this._z=S*M*w+T*b*E,this._w=S*M*E+T*b*w;break;default:Xt("Quaternion: .setFromEuler() encountered an unknown order: "+x)}if(p===!0)this._onChangeCallback();return this}setFromAxisAngle(d,p){let m=p/2,g=Math.sin(m);return this._x=d.x*g,this._y=d.y*g,this._z=d.z*g,this._w=Math.cos(m),this._onChangeCallback(),this}setFromRotationMatrix(d){let p=d.elements,m=p[0],g=p[4],_=p[8],x=p[1],v=p[5],y=p[9],S=p[2],M=p[6],E=p[10],T=m+v+E;if(T>0){let b=0.5/Math.sqrt(T+1);this._w=0.25/b,this._x=(M-y)*b,this._y=(_-S)*b,this._z=(x-g)*b}else if(m>v&&m>E){let b=2*Math.sqrt(1+m-v-E);this._w=(M-y)/b,this._x=0.25*b,this._y=(g+x)/b,this._z=(_+S)/b}else if(v>E){let b=2*Math.sqrt(1+v-m-E);this._w=(_-S)/b,this._x=(g+x)/b,this._y=0.25*b,this._z=(y+M)/b}else{let b=2*Math.sqrt(1+E-m-v);this._w=(x-g)/b,this._x=(_+S)/b,this._y=(y+M)/b,this._z=0.25*b}return this._onChangeCallback(),this}setFromUnitVectors(d,p){let m=d.dot(p)+1;if(m<0.00000001)if(m=0,Math.abs(d.x)>Math.abs(d.z))this._x=-d.y,this._y=d.x,this._z=0,this._w=m;else this._x=0,this._y=-d.z,this._z=d.y,this._w=m;else this._x=d.y*p.z-d.z*p.y,this._y=d.z*p.x-d.x*p.z,this._z=d.x*p.y-d.y*p.x,this._w=m;return this.normalize()}angleTo(d){return 2*Math.acos(Math.abs(ne(this.dot(d),-1,1)))}rotateTowards(d,p){let m=this.angleTo(d);if(m===0)return this;let g=Math.min(1,p/m);return this.slerp(d,g),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(d){return this._x*d._x+this._y*d._y+this._z*d._z+this._w*d._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let d=this.length();if(d===0)this._x=0,this._y=0,this._z=0,this._w=1;else d=1/d,this._x=this._x*d,this._y=this._y*d,this._z=this._z*d,this._w=this._w*d;return this._onChangeCallback(),this}multiply(d){return this.multiplyQuaternions(this,d)}premultiply(d){return this.multiplyQuaternions(d,this)}multiplyQuaternions(d,p){let{_x:m,_y:g,_z:_,_w:x}=d,{_x:v,_y:y,_z:S,_w:M}=p;return this._x=m*M+x*v+g*S-_*y,this._y=g*M+x*y+_*v-m*S,this._z=_*M+x*S+m*y-g*v,this._w=x*M-m*v-g*y-_*S,this._onChangeCallback(),this}slerp(d,p){let{_x:m,_y:g,_z:_,_w:x}=d,v=this.dot(d);if(v<0)m=-m,g=-g,_=-_,x=-x,v=-v;let y=1-p;if(v<0.9995){let S=Math.acos(v),M=Math.sin(S);y=Math.sin(y*S)/M,p=Math.sin(p*S)/M,this._x=this._x*y+m*p,this._y=this._y*y+g*p,this._z=this._z*y+_*p,this._w=this._w*y+x*p,this._onChangeCallback()}else this._x=this._x*y+m*p,this._y=this._y*y+g*p,this._z=this._z*y+_*p,this._w=this._w*y+x*p,this.normalize();return this}slerpQuaternions(d,p,m){return this.copy(d).slerp(p,m)}random(){let d=2*Math.PI*Math.random(),p=2*Math.PI*Math.random(),m=Math.random(),g=Math.sqrt(1-m),_=Math.sqrt(m);return this.set(g*Math.sin(d),g*Math.cos(d),_*Math.sin(p),_*Math.cos(p))}equals(d){return d._x===this._x&&d._y===this._y&&d._z===this._z&&d._w===this._w}fromArray(d,p=0){return this._x=d[p],this._y=d[p+1],this._z=d[p+2],this._w=d[p+3],this._onChangeCallback(),this}toArray(d=[],p=0){return d[p]=this._x,d[p+1]=this._y,d[p+2]=this._z,d[p+3]=this._w,d}fromBufferAttribute(d,p){return this._x=d.getX(p),this._y=d.getY(p),this._z=d.getZ(p),this._w=d.getW(p),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(d){return this._onChangeCallback=d,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class q{static{this.prototype.isVector3=!0}constructor(d=0,p=0,m=0){this.x=d,this.y=p,this.z=m}set(d,p,m){if(m===void 0)m=this.z;return this.x=d,this.y=p,this.z=m,this}setScalar(d){return this.x=d,this.y=d,this.z=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setZ(d){return this.z=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;case 2:this.z=p;break;default:throw Error("THREE.Vector3: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error("THREE.Vector3: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(d){return this.x=d.x,this.y=d.y,this.z=d.z,this}add(d){return this.x+=d.x,this.y+=d.y,this.z+=d.z,this}addScalar(d){return this.x+=d,this.y+=d,this.z+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this.z=d.z+p.z,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this.z+=d.z*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this.z-=d.z,this}subScalar(d){return this.x-=d,this.y-=d,this.z-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this.z=d.z-p.z,this}multiply(d){return this.x*=d.x,this.y*=d.y,this.z*=d.z,this}multiplyScalar(d){return this.x*=d,this.y*=d,this.z*=d,this}multiplyVectors(d,p){return this.x=d.x*p.x,this.y=d.y*p.y,this.z=d.z*p.z,this}applyEuler(d){return this.applyQuaternion(ou.setFromEuler(d))}applyAxisAngle(d,p){return this.applyQuaternion(ou.setFromAxisAngle(d,p))}applyMatrix3(d){let p=this.x,m=this.y,g=this.z,_=d.elements;return this.x=_[0]*p+_[3]*m+_[6]*g,this.y=_[1]*p+_[4]*m+_[7]*g,this.z=_[2]*p+_[5]*m+_[8]*g,this}applyNormalMatrix(d){return this.applyMatrix3(d).normalize()}applyMatrix4(d){let p=this.x,m=this.y,g=this.z,_=d.elements,x=1/(_[3]*p+_[7]*m+_[11]*g+_[15]);return this.x=(_[0]*p+_[4]*m+_[8]*g+_[12])*x,this.y=(_[1]*p+_[5]*m+_[9]*g+_[13])*x,this.z=(_[2]*p+_[6]*m+_[10]*g+_[14])*x,this}applyQuaternion(d){let p=this.x,m=this.y,g=this.z,{x:_,y:x,z:v,w:y}=d,S=2*(x*g-v*m),M=2*(v*p-_*g),E=2*(_*m-x*p);return this.x=p+y*S+x*E-v*M,this.y=m+y*M+v*S-_*E,this.z=g+y*E+_*M-x*S,this}project(d){return this.applyMatrix4(d.matrixWorldInverse).applyMatrix4(d.projectionMatrix)}unproject(d){return this.applyMatrix4(d.projectionMatrixInverse).applyMatrix4(d.matrixWorld)}transformDirection(d){let p=this.x,m=this.y,g=this.z,_=d.elements;return this.x=_[0]*p+_[4]*m+_[8]*g,this.y=_[1]*p+_[5]*m+_[9]*g,this.z=_[2]*p+_[6]*m+_[10]*g,this.normalize()}divide(d){return this.x/=d.x,this.y/=d.y,this.z/=d.z,this}divideScalar(d){return this.multiplyScalar(1/d)}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this.z=Math.min(this.z,d.z),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this.z=Math.max(this.z,d.z),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this.z=ne(this.z,d.z,p.z),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this.z=ne(this.z,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(d){return this.x*d.x+this.y*d.y+this.z*d.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this.z+=(d.z-this.z)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this.z=d.z+(p.z-d.z)*m,this}cross(d){return this.crossVectors(this,d)}crossVectors(d,p){let{x:m,y:g,z:_}=d,{x,y:v,z:y}=p;return this.x=g*y-_*v,this.y=_*x-m*y,this.z=m*v-g*x,this}projectOnVector(d){let p=d.lengthSq();if(p===0)return this.set(0,0,0);let m=d.dot(this)/p;return this.copy(d).multiplyScalar(m)}projectOnPlane(d){return Za.copy(this).projectOnVector(d),this.sub(Za)}reflect(d){return this.sub(Za.copy(d).multiplyScalar(2*this.dot(d)))}angleTo(d){let p=Math.sqrt(this.lengthSq()*d.lengthSq());if(p===0)return Math.PI/2;let m=this.dot(d)/p;return Math.acos(ne(m,-1,1))}distanceTo(d){return Math.sqrt(this.distanceToSquared(d))}distanceToSquared(d){let p=this.x-d.x,m=this.y-d.y,g=this.z-d.z;return p*p+m*m+g*g}manhattanDistanceTo(d){return Math.abs(this.x-d.x)+Math.abs(this.y-d.y)+Math.abs(this.z-d.z)}setFromSpherical(d){return this.setFromSphericalCoords(d.radius,d.phi,d.theta)}setFromSphericalCoords(d,p,m){let g=Math.sin(p)*d;return this.x=g*Math.sin(m),this.y=Math.cos(p)*d,this.z=g*Math.cos(m),this}setFromCylindrical(d){return this.setFromCylindricalCoords(d.radius,d.theta,d.y)}setFromCylindricalCoords(d,p,m){return this.x=d*Math.sin(p),this.y=m,this.z=d*Math.cos(p),this}setFromMatrixPosition(d){let p=d.elements;return this.x=p[12],this.y=p[13],this.z=p[14],this}setFromMatrixScale(d){let p=this.setFromMatrixColumn(d,0).length(),m=this.setFromMatrixColumn(d,1).length(),g=this.setFromMatrixColumn(d,2).length();return this.x=p,this.y=m,this.z=g,this}setFromMatrixColumn(d,p){return this.fromArray(d.elements,p*4)}setFromMatrix3Column(d,p){return this.fromArray(d.elements,p*3)}setFromEuler(d){return this.x=d._x,this.y=d._y,this.z=d._z,this}setFromColor(d){return this.x=d.r,this.y=d.g,this.z=d.b,this}equals(d){return d.x===this.x&&d.y===this.y&&d.z===this.z}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this.z=d[p+2],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d[p+2]=this.z,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this.z=d.getZ(p),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let d=Math.random()*Math.PI*2,p=Math.random()*2-1,m=Math.sqrt(1-p*p);return this.x=m*Math.cos(d),this.y=p,this.z=m*Math.sin(d),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}var Za=new q,ou=new di;class Kt{static{this.prototype.isMatrix3=!0}constructor(d,p,m,g,_,x,v,y,S){if(this.elements=[1,0,0,0,1,0,0,0,1],d!==void 0)this.set(d,p,m,g,_,x,v,y,S)}set(d,p,m,g,_,x,v,y,S){let M=this.elements;return M[0]=d,M[1]=g,M[2]=v,M[3]=p,M[4]=_,M[5]=y,M[6]=m,M[7]=x,M[8]=S,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(d){let p=this.elements,m=d.elements;return p[0]=m[0],p[1]=m[1],p[2]=m[2],p[3]=m[3],p[4]=m[4],p[5]=m[5],p[6]=m[6],p[7]=m[7],p[8]=m[8],this}extractBasis(d,p,m){return d.setFromMatrix3Column(this,0),p.setFromMatrix3Column(this,1),m.setFromMatrix3Column(this,2),this}setFromMatrix4(d){let p=d.elements;return this.set(p[0],p[4],p[8],p[1],p[5],p[9],p[2],p[6],p[10]),this}multiply(d){return this.multiplyMatrices(this,d)}premultiply(d){return this.multiplyMatrices(d,this)}multiplyMatrices(d,p){let m=d.elements,g=p.elements,_=this.elements,x=m[0],v=m[3],y=m[6],S=m[1],M=m[4],E=m[7],T=m[2],b=m[5],w=m[8],C=g[0],N=g[3],A=g[6],R=g[1],P=g[4],F=g[7],L=g[2],U=g[5],k=g[8];return _[0]=x*C+v*R+y*L,_[3]=x*N+v*P+y*U,_[6]=x*A+v*F+y*k,_[1]=S*C+M*R+E*L,_[4]=S*N+M*P+E*U,_[7]=S*A+M*F+E*k,_[2]=T*C+b*R+w*L,_[5]=T*N+b*P+w*U,_[8]=T*A+b*F+w*k,this}multiplyScalar(d){let p=this.elements;return p[0]*=d,p[3]*=d,p[6]*=d,p[1]*=d,p[4]*=d,p[7]*=d,p[2]*=d,p[5]*=d,p[8]*=d,this}determinant(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],M=d[8];return p*x*M-p*v*S-m*_*M+m*v*y+g*_*S-g*x*y}invert(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],M=d[8],E=M*x-v*S,T=v*y-M*_,b=S*_-x*y,w=p*E+m*T+g*b;if(w===0)return this.set(0,0,0,0,0,0,0,0,0);let C=1/w;return d[0]=E*C,d[1]=(g*S-M*m)*C,d[2]=(v*m-g*x)*C,d[3]=T*C,d[4]=(M*p-g*y)*C,d[5]=(g*_-v*p)*C,d[6]=b*C,d[7]=(m*y-S*p)*C,d[8]=(x*p-m*_)*C,this}transpose(){let d,p=this.elements;return d=p[1],p[1]=p[3],p[3]=d,d=p[2],p[2]=p[6],p[6]=d,d=p[5],p[5]=p[7],p[7]=d,this}getNormalMatrix(d){return this.setFromMatrix4(d).invert().transpose()}transposeIntoArray(d){let p=this.elements;return d[0]=p[0],d[1]=p[3],d[2]=p[6],d[3]=p[1],d[4]=p[4],d[5]=p[7],d[6]=p[2],d[7]=p[5],d[8]=p[8],this}setUvTransform(d,p,m,g,_,x,v){let y=Math.cos(_),S=Math.sin(_);return this.set(m*y,m*S,-m*(y*x+S*v)+x+d,-g*S,g*y,-g*(-S*x+y*v)+v+p,0,0,1),this}scale(d,p){return cr("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply($a.makeScale(d,p)),this}rotate(d){return cr("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply($a.makeRotation(-d)),this}translate(d,p){return cr("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply($a.makeTranslation(d,p)),this}makeTranslation(d,p){if(d.isVector2)this.set(1,0,d.x,0,1,d.y,0,0,1);else this.set(1,0,d,0,1,p,0,0,1);return this}makeRotation(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,-m,0,m,p,0,0,0,1),this}makeScale(d,p){return this.set(d,0,0,0,p,0,0,0,1),this}equals(d){let p=this.elements,m=d.elements;for(let g=0;g<9;g++)if(p[g]!==m[g])return!1;return!0}fromArray(d,p=0){for(let m=0;m<9;m++)this.elements[m]=d[m+p];return this}toArray(d=[],p=0){let m=this.elements;return d[p]=m[0],d[p+1]=m[1],d[p+2]=m[2],d[p+3]=m[3],d[p+4]=m[4],d[p+5]=m[5],d[p+6]=m[6],d[p+7]=m[7],d[p+8]=m[8],d}clone(){return new this.constructor().fromArray(this.elements)}}var $a=new Kt,au=new Kt().set(0.4123908,0.3575843,0.1804808,0.212639,0.7151687,0.0721923,0.0193308,0.1191948,0.9505322),lu=new Kt().set(3.2409699,-1.5373832,-0.4986108,-0.9692436,1.8759675,0.0415551,0.0556301,-0.203977,1.0569715);function Am(){let d={enabled:!0,workingColorSpace:"srgb-linear",spaces:{},convert:function(_,x,v){if(this.enabled===!1||x===v||!x||!v)return _;if(this.spaces[x].transfer==="srgb")_.r=ai(_.r),_.g=ai(_.g),_.b=ai(_.b);if(this.spaces[x].primaries!==this.spaces[v].primaries)_.applyMatrix3(this.spaces[x].toXYZ),_.applyMatrix3(this.spaces[v].fromXYZ);if(this.spaces[v].transfer==="srgb")_.r=ws(_.r),_.g=ws(_.g),_.b=ws(_.b);return _},workingToColorSpace:function(_,x){return this.convert(_,this.workingColorSpace,x)},colorSpaceToWorking:function(_,x){return this.convert(_,x,this.workingColorSpace)},getPrimaries:function(_){return this.spaces[_].primaries},getTransfer:function(_){if(_==="")return"linear";return this.spaces[_].transfer},getToneMappingMode:function(_){return this.spaces[_].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(_,x=this.workingColorSpace){return _.fromArray(this.spaces[x].luminanceCoefficients)},define:function(_){Object.assign(this.spaces,_)},_getMatrix:function(_,x,v){return _.copy(this.spaces[v].fromXYZ).multiply(this.spaces[x].toXYZ)},_getDrawingBufferColorSpace:function(_){return this.spaces[_].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(_=this.workingColorSpace){return this.spaces[_].workingColorSpaceConfig.unpackColorSpace}},p=[0.64,0.33,0.3,0.6,0.15,0.06],m=[0.2126,0.7152,0.0722],g=[0.3127,0.329];return d.define({["srgb-linear"]:{primaries:p,whitePoint:g,transfer:"linear",toXYZ:au,fromXYZ:lu,luminanceCoefficients:m,workingColorSpaceConfig:{unpackColorSpace:"srgb"},outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}},["srgb"]:{primaries:p,whitePoint:g,transfer:"srgb",toXYZ:au,fromXYZ:lu,luminanceCoefficients:m,outputColorSpaceConfig:{drawingBufferColorSpace:"srgb"}}}),d}var le=Am();function ai(d){return d<0.04045?d*0.0773993808:Math.pow(d*0.9478672986+0.0521327014,2.4)}function ws(d){return d<0.0031308?d*12.92:1.055*Math.pow(d,0.41666)-0.055}var hs;class Tc{static getDataURL(d,p="image/png"){if(/^data:/i.test(d.src))return d.src;if(typeof HTMLCanvasElement>"u")return d.src;let m;if(d instanceof HTMLCanvasElement)m=d;else{if(hs===void 0)hs=dr("canvas");hs.width=d.width,hs.height=d.height;let g=hs.getContext("2d");if(d instanceof ImageData)g.putImageData(d,0,0);else g.drawImage(d,0,0,d.width,d.height);m=hs}return m.toDataURL(p)}static sRGBToLinear(d){if(typeof HTMLImageElement<"u"&&d instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&d instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&d instanceof ImageBitmap){let p=dr("canvas");p.width=d.width,p.height=d.height;let m=p.getContext("2d");m.drawImage(d,0,0,d.width,d.height);let g=m.getImageData(0,0,d.width,d.height),_=g.data;for(let x=0;x<_.length;x++)_[x]=ai(_[x]/255)*255;return m.putImageData(g,0,0),p}else if(d.data){let p=d.data.slice(0);for(let m=0;m<p.length;m++)if(p instanceof Uint8Array||p instanceof Uint8ClampedArray)p[m]=Math.floor(ai(p[m]/255)*255);else p[m]=ai(p[m]);return{data:p,width:d.width,height:d.height}}else return Xt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),d}}var Rm=0;class Mr{constructor(d=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Rm++}),this.uuid=Ri(),this.data=d,this.dataReady=!0,this.version=0}getSize(d){let p=this.data;if(typeof HTMLVideoElement<"u"&&p instanceof HTMLVideoElement)d.set(p.videoWidth,p.videoHeight,0);else if(typeof VideoFrame<"u"&&p instanceof VideoFrame)d.set(p.displayWidth,p.displayHeight,0);else if(p!==null)d.set(p.width||0,p.height||0,p.depth||0);else d.set(0,0,0);return d}set needsUpdate(d){if(d===!0)this.version++}toJSON(d){let p=d===void 0||typeof d==="string";if(!p&&d.images[this.uuid]!==void 0)return d.images[this.uuid];let m={uuid:this.uuid,url:""},g=this.data;if(g!==null){let _;if(Array.isArray(g)){_=[];for(let x=0,v=g.length;x<v;x++)if(g[x].isDataTexture)_.push(Ja(g[x].image));else _.push(Ja(g[x]))}else _=Ja(g);m.url=_}if(!p)d.images[this.uuid]=m;return m}}function Ja(d){if(typeof HTMLImageElement<"u"&&d instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&d instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&d instanceof ImageBitmap)return Tc.getDataURL(d);else if(d.data)return{data:Array.from(d.data),width:d.width,height:d.height,type:d.data.constructor.name};else return Xt("Texture: Unable to serialize Texture."),{}}var Cm=0,Ka=new q;class We extends ui{constructor(d=We.DEFAULT_IMAGE,p=We.DEFAULT_MAPPING,m=1001,g=1001,_=1006,x=1008,v=1023,y=1009,S=We.DEFAULT_ANISOTROPY,M=""){super();this.isTexture=!0,Object.defineProperty(this,"id",{value:Cm++}),this.uuid=Ri(),this.name="",this.source=new Mr(d),this.mipmaps=[],this.mapping=p,this.channel=0,this.wrapS=m,this.wrapT=g,this.magFilter=_,this.minFilter=x,this.anisotropy=S,this.format=v,this.internalFormat=null,this.type=y,this.offset=new Jt(0,0),this.repeat=new Jt(1,1),this.center=new Jt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Kt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=M,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=d&&d.depth&&d.depth>1?!0:!1,this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ka).x}get height(){return this.source.getSize(Ka).y}get depth(){return this.source.getSize(Ka).z}get image(){return this.source.data}set image(d){this.source.data=d}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(d){return this.name=d.name,this.source=d.source,this.mipmaps=d.mipmaps.slice(0),this.mapping=d.mapping,this.channel=d.channel,this.wrapS=d.wrapS,this.wrapT=d.wrapT,this.magFilter=d.magFilter,this.minFilter=d.minFilter,this.anisotropy=d.anisotropy,this.format=d.format,this.internalFormat=d.internalFormat,this.type=d.type,this.normalized=d.normalized,this.offset.copy(d.offset),this.repeat.copy(d.repeat),this.center.copy(d.center),this.rotation=d.rotation,this.matrixAutoUpdate=d.matrixAutoUpdate,this.matrix.copy(d.matrix),this.generateMipmaps=d.generateMipmaps,this.mipmapsAutoUpdate=d.mipmapsAutoUpdate,this.premultiplyAlpha=d.premultiplyAlpha,this.flipY=d.flipY,this.unpackAlignment=d.unpackAlignment,this.colorSpace=d.colorSpace,this.renderTarget=d.renderTarget,this.isRenderTargetTexture=d.isRenderTargetTexture,this.isPMREMTexture=d.isPMREMTexture,this.isArrayTexture=d.isArrayTexture,this.userData=JSON.parse(JSON.stringify(d.userData)),this.needsUpdate=!0,this}setValues(d){for(let p in d){let m=d[p];if(m===void 0){Xt(`Texture.setValues(): parameter '${p}' has value of undefined.`);continue}let g=this[p];if(g===void 0){Xt(`Texture.setValues(): property '${p}' does not exist.`);continue}if(g&&m&&(g.isVector2&&m.isVector2))g.copy(m);else if(g&&m&&(g.isVector3&&m.isVector3))g.copy(m);else if(g&&m&&(g.isMatrix3&&m.isMatrix3))g.copy(m);else this[p]=m}}toJSON(d){let p=d===void 0||typeof d==="string";if(!p&&d.textures[this.uuid]!==void 0)return d.textures[this.uuid];let m={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(d).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};if(Object.keys(this.userData).length>0)m.userData=this.userData;if(!p)d.textures[this.uuid]=m;return m}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(d){if(this.mapping!==300)return d;if(d.applyMatrix3(this.matrix),d.x<0||d.x>1)switch(this.wrapS){case 1000:d.x=d.x-Math.floor(d.x);break;case 1001:d.x=d.x<0?0:1;break;case 1002:if(Math.abs(Math.floor(d.x)%2)===1)d.x=Math.ceil(d.x)-d.x;else d.x=d.x-Math.floor(d.x);break}if(d.y<0||d.y>1)switch(this.wrapT){case 1000:d.y=d.y-Math.floor(d.y);break;case 1001:d.y=d.y<0?0:1;break;case 1002:if(Math.abs(Math.floor(d.y)%2)===1)d.y=Math.ceil(d.y)-d.y;else d.y=d.y-Math.floor(d.y);break}if(this.flipY)d.y=1-d.y;return d}set needsUpdate(d){if(d===!0)this.version++,this.source.needsUpdate=!0}set needsPMREMUpdate(d){if(d===!0)this.pmremVersion++}}We.DEFAULT_IMAGE=null;We.DEFAULT_MAPPING=300;We.DEFAULT_ANISOTROPY=1;class Be{static{this.prototype.isVector4=!0}constructor(d=0,p=0,m=0,g=1){this.x=d,this.y=p,this.z=m,this.w=g}get width(){return this.z}set width(d){this.z=d}get height(){return this.w}set height(d){this.w=d}set(d,p,m,g){return this.x=d,this.y=p,this.z=m,this.w=g,this}setScalar(d){return this.x=d,this.y=d,this.z=d,this.w=d,this}setX(d){return this.x=d,this}setY(d){return this.y=d,this}setZ(d){return this.z=d,this}setW(d){return this.w=d,this}setComponent(d,p){switch(d){case 0:this.x=p;break;case 1:this.y=p;break;case 2:this.z=p;break;case 3:this.w=p;break;default:throw Error("THREE.Vector4: index is out of range: "+d)}return this}getComponent(d){switch(d){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error("THREE.Vector4: index is out of range: "+d)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(d){return this.x=d.x,this.y=d.y,this.z=d.z,this.w=d.w!==void 0?d.w:1,this}add(d){return this.x+=d.x,this.y+=d.y,this.z+=d.z,this.w+=d.w,this}addScalar(d){return this.x+=d,this.y+=d,this.z+=d,this.w+=d,this}addVectors(d,p){return this.x=d.x+p.x,this.y=d.y+p.y,this.z=d.z+p.z,this.w=d.w+p.w,this}addScaledVector(d,p){return this.x+=d.x*p,this.y+=d.y*p,this.z+=d.z*p,this.w+=d.w*p,this}sub(d){return this.x-=d.x,this.y-=d.y,this.z-=d.z,this.w-=d.w,this}subScalar(d){return this.x-=d,this.y-=d,this.z-=d,this.w-=d,this}subVectors(d,p){return this.x=d.x-p.x,this.y=d.y-p.y,this.z=d.z-p.z,this.w=d.w-p.w,this}multiply(d){return this.x*=d.x,this.y*=d.y,this.z*=d.z,this.w*=d.w,this}multiplyScalar(d){return this.x*=d,this.y*=d,this.z*=d,this.w*=d,this}applyMatrix4(d){let p=this.x,m=this.y,g=this.z,_=this.w,x=d.elements;return this.x=x[0]*p+x[4]*m+x[8]*g+x[12]*_,this.y=x[1]*p+x[5]*m+x[9]*g+x[13]*_,this.z=x[2]*p+x[6]*m+x[10]*g+x[14]*_,this.w=x[3]*p+x[7]*m+x[11]*g+x[15]*_,this}divide(d){return this.x/=d.x,this.y/=d.y,this.z/=d.z,this.w/=d.w,this}divideScalar(d){return this.multiplyScalar(1/d)}setAxisAngleFromQuaternion(d){this.w=2*Math.acos(d.w);let p=Math.sqrt(1-d.w*d.w);if(p<0.0001)this.x=1,this.y=0,this.z=0;else this.x=d.x/p,this.y=d.y/p,this.z=d.z/p;return this}setAxisAngleFromRotationMatrix(d){let p,m,g,_,x=0.01,v=0.1,y=d.elements,S=y[0],M=y[4],E=y[8],T=y[1],b=y[5],w=y[9],C=y[2],N=y[6],A=y[10];if(Math.abs(M-T)<0.01&&Math.abs(E-C)<0.01&&Math.abs(w-N)<0.01){if(Math.abs(M+T)<0.1&&Math.abs(E+C)<0.1&&Math.abs(w+N)<0.1&&Math.abs(S+b+A-3)<0.1)return this.set(1,0,0,0),this;p=Math.PI;let P=(S+1)/2,F=(b+1)/2,L=(A+1)/2,U=(M+T)/4,k=(E+C)/4,I=(w+N)/4;if(P>F&&P>L)if(P<0.01)m=0,g=0.707106781,_=0.707106781;else m=Math.sqrt(P),g=U/m,_=k/m;else if(F>L)if(F<0.01)m=0.707106781,g=0,_=0.707106781;else g=Math.sqrt(F),m=U/g,_=I/g;else if(L<0.01)m=0.707106781,g=0.707106781,_=0;else _=Math.sqrt(L),m=k/_,g=I/_;return this.set(m,g,_,p),this}let R=Math.sqrt((N-w)*(N-w)+(E-C)*(E-C)+(T-M)*(T-M));if(Math.abs(R)<0.001)R=1;return this.x=(N-w)/R,this.y=(E-C)/R,this.z=(T-M)/R,this.w=Math.acos((S+b+A-1)/2),this}setFromMatrixPosition(d){let p=d.elements;return this.x=p[12],this.y=p[13],this.z=p[14],this.w=p[15],this}min(d){return this.x=Math.min(this.x,d.x),this.y=Math.min(this.y,d.y),this.z=Math.min(this.z,d.z),this.w=Math.min(this.w,d.w),this}max(d){return this.x=Math.max(this.x,d.x),this.y=Math.max(this.y,d.y),this.z=Math.max(this.z,d.z),this.w=Math.max(this.w,d.w),this}clamp(d,p){return this.x=ne(this.x,d.x,p.x),this.y=ne(this.y,d.y,p.y),this.z=ne(this.z,d.z,p.z),this.w=ne(this.w,d.w,p.w),this}clampScalar(d,p){return this.x=ne(this.x,d,p),this.y=ne(this.y,d,p),this.z=ne(this.z,d,p),this.w=ne(this.w,d,p),this}clampLength(d,p){let m=this.length();return this.divideScalar(m||1).multiplyScalar(ne(m,d,p))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(d){return this.x*d.x+this.y*d.y+this.z*d.z+this.w*d.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(d){return this.normalize().multiplyScalar(d)}lerp(d,p){return this.x+=(d.x-this.x)*p,this.y+=(d.y-this.y)*p,this.z+=(d.z-this.z)*p,this.w+=(d.w-this.w)*p,this}lerpVectors(d,p,m){return this.x=d.x+(p.x-d.x)*m,this.y=d.y+(p.y-d.y)*m,this.z=d.z+(p.z-d.z)*m,this.w=d.w+(p.w-d.w)*m,this}equals(d){return d.x===this.x&&d.y===this.y&&d.z===this.z&&d.w===this.w}fromArray(d,p=0){return this.x=d[p],this.y=d[p+1],this.z=d[p+2],this.w=d[p+3],this}toArray(d=[],p=0){return d[p]=this.x,d[p+1]=this.y,d[p+2]=this.z,d[p+3]=this.w,d}fromBufferAttribute(d,p){return this.x=d.getX(p),this.y=d.getY(p),this.z=d.getZ(p),this.w=d.getW(p),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class wc extends ui{constructor(d=1,p=1,m={}){super();m=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},m),this.isRenderTarget=!0,this.width=d,this.height=p,this.depth=m.depth,this.scissor=new Be(0,0,d,p),this.scissorTest=!1,this.viewport=new Be(0,0,d,p),this.textures=[];let g=m.count;for(let _=0;_<g;_++)this.textures[_]=new We({width:d,height:p,depth:m.depth}),this.textures[_].isRenderTargetTexture=!0,this.textures[_].renderTarget=this;this._setTextureOptions(m),this.depthBuffer=m.depthBuffer,this.stencilBuffer=m.stencilBuffer,this.resolveColorBuffer=m.resolveColorBuffer,this.resolveDepthBuffer=m.resolveDepthBuffer,this.resolveStencilBuffer=m.resolveStencilBuffer,this.storeMultisampledColorBuffer=m.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=m.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=m.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=m.depthTexture,this.samples=m.samples,this.multiview=m.multiview,this.useArrayDepthTexture=m.useArrayDepthTexture}_setTextureOptions(d={}){let p={minFilter:1006,generateMipmaps:!1,flipY:!1,internalFormat:null};if(d.mapping!==void 0)p.mapping=d.mapping;if(d.wrapS!==void 0)p.wrapS=d.wrapS;if(d.wrapT!==void 0)p.wrapT=d.wrapT;if(d.wrapR!==void 0)p.wrapR=d.wrapR;if(d.magFilter!==void 0)p.magFilter=d.magFilter;if(d.minFilter!==void 0)p.minFilter=d.minFilter;if(d.format!==void 0)p.format=d.format;if(d.type!==void 0)p.type=d.type;if(d.anisotropy!==void 0)p.anisotropy=d.anisotropy;if(d.colorSpace!==void 0)p.colorSpace=d.colorSpace;if(d.flipY!==void 0)p.flipY=d.flipY;if(d.generateMipmaps!==void 0)p.generateMipmaps=d.generateMipmaps;if(d.mipmapsAutoUpdate!==void 0)p.mipmapsAutoUpdate=d.mipmapsAutoUpdate;if(d.internalFormat!==void 0)p.internalFormat=d.internalFormat;for(let m=0;m<this.textures.length;m++)this.textures[m].setValues(p)}get texture(){return this.textures[0]}set texture(d){this.textures[0]=d}set depthTexture(d){if(this._depthTexture!==null&&this._depthTexture.renderTarget===this)this._depthTexture.renderTarget=null;if(d!==null&&d.renderTarget===null)d.renderTarget=this;this._depthTexture=d}get depthTexture(){return this._depthTexture}setSize(d,p,m=1){if(this.width!==d||this.height!==p||this.depth!==m){this.width=d,this.height=p,this.depth=m;for(let g=0,_=this.textures.length;g<_;g++)if(this.textures[g].image.width=d,this.textures[g].image.height=p,this.textures[g].image.depth=m,this.textures[g].isData3DTexture!==!0)this.textures[g].isArrayTexture=this.textures[g].image.depth>1;this.dispose()}this.viewport.set(0,0,d,p),this.scissor.set(0,0,d,p)}clone(){return new this.constructor().copy(this)}copy(d){this.width=d.width,this.height=d.height,this.depth=d.depth,this.scissor.copy(d.scissor),this.scissorTest=d.scissorTest,this.viewport.copy(d.viewport),this.textures.length=0;for(let p=0,m=d.textures.length;p<m;p++){this.textures[p]=d.textures[p].clone(),this.textures[p].isRenderTargetTexture=!0,this.textures[p].renderTarget=this;let g=Object.assign({},d.textures[p].image);this.textures[p].source=new Mr(g)}if(this.depthBuffer=d.depthBuffer,this.stencilBuffer=d.stencilBuffer,this.resolveColorBuffer=d.resolveColorBuffer,this.resolveDepthBuffer=d.resolveDepthBuffer,this.resolveStencilBuffer=d.resolveStencilBuffer,this.storeMultisampledColorBuffer=d.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=d.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=d.storeMultisampledStencilBuffer,d.depthTexture!==null)if(d.depthTexture.renderTarget===d){let p=d.depthTexture.clone();p.renderTarget=null,this.depthTexture=p}else this.depthTexture=d.depthTexture;else this.depthTexture=null;return this.samples=d.samples,this.multiview=d.multiview,this.useArrayDepthTexture=d.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Dn extends wc{constructor(d=1,p=1,m={}){super(d,p,m);this.isWebGLRenderTarget=!0}}class ko extends We{constructor(d=null,p=1,m=1,g=1){super(null);this.isDataArrayTexture=!0,this.image={data:d,width:p,height:m,depth:g},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(d){return super.copy(d),this.wrapR=d.wrapR,this}addLayerUpdate(d){this.layerUpdates.add(d)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ac extends We{constructor(d=null,p=1,m=1,g=1){super(null);this.isData3DTexture=!0,this.image={data:d,width:p,height:m,depth:g},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(d){return super.copy(d),this.wrapR=d.wrapR,this}}class ie{static{this.prototype.isMatrix4=!0}constructor(d,p,m,g,_,x,v,y,S,M,E,T,b,w,C,N){if(this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],d!==void 0)this.set(d,p,m,g,_,x,v,y,S,M,E,T,b,w,C,N)}set(d,p,m,g,_,x,v,y,S,M,E,T,b,w,C,N){let A=this.elements;return A[0]=d,A[4]=p,A[8]=m,A[12]=g,A[1]=_,A[5]=x,A[9]=v,A[13]=y,A[2]=S,A[6]=M,A[10]=E,A[14]=T,A[3]=b,A[7]=w,A[11]=C,A[15]=N,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ie().fromArray(this.elements)}copy(d){let p=this.elements,m=d.elements;return p[0]=m[0],p[1]=m[1],p[2]=m[2],p[3]=m[3],p[4]=m[4],p[5]=m[5],p[6]=m[6],p[7]=m[7],p[8]=m[8],p[9]=m[9],p[10]=m[10],p[11]=m[11],p[12]=m[12],p[13]=m[13],p[14]=m[14],p[15]=m[15],this}copyPosition(d){let p=this.elements,m=d.elements;return p[12]=m[12],p[13]=m[13],p[14]=m[14],this}setFromMatrix3(d){let p=d.elements;return this.set(p[0],p[3],p[6],0,p[1],p[4],p[7],0,p[2],p[5],p[8],0,0,0,0,1),this}extractBasis(d,p,m){if(this.determinantAffine()===0)return d.set(1,0,0),p.set(0,1,0),m.set(0,0,1),this;return d.setFromMatrixColumn(this,0),p.setFromMatrixColumn(this,1),m.setFromMatrixColumn(this,2),this}makeBasis(d,p,m){return this.set(d.x,p.x,m.x,0,d.y,p.y,m.y,0,d.z,p.z,m.z,0,0,0,0,1),this}extractRotation(d){if(d.determinantAffine()===0)return this.identity();let p=this.elements,m=d.elements,g=1/us.setFromMatrixColumn(d,0).length(),_=1/us.setFromMatrixColumn(d,1).length(),x=1/us.setFromMatrixColumn(d,2).length();return p[0]=m[0]*g,p[1]=m[1]*g,p[2]=m[2]*g,p[3]=0,p[4]=m[4]*_,p[5]=m[5]*_,p[6]=m[6]*_,p[7]=0,p[8]=m[8]*x,p[9]=m[9]*x,p[10]=m[10]*x,p[11]=0,p[12]=0,p[13]=0,p[14]=0,p[15]=1,this}makeRotationFromEuler(d){let p=this.elements,{x:m,y:g,z:_}=d,x=Math.cos(m),v=Math.sin(m),y=Math.cos(g),S=Math.sin(g),M=Math.cos(_),E=Math.sin(_);if(d.order==="XYZ"){let T=x*M,b=x*E,w=v*M,C=v*E;p[0]=y*M,p[4]=-y*E,p[8]=S,p[1]=b+w*S,p[5]=T-C*S,p[9]=-v*y,p[2]=C-T*S,p[6]=w+b*S,p[10]=x*y}else if(d.order==="YXZ"){let T=y*M,b=y*E,w=S*M,C=S*E;p[0]=T+C*v,p[4]=w*v-b,p[8]=x*S,p[1]=x*E,p[5]=x*M,p[9]=-v,p[2]=b*v-w,p[6]=C+T*v,p[10]=x*y}else if(d.order==="ZXY"){let T=y*M,b=y*E,w=S*M,C=S*E;p[0]=T-C*v,p[4]=-x*E,p[8]=w+b*v,p[1]=b+w*v,p[5]=x*M,p[9]=C-T*v,p[2]=-x*S,p[6]=v,p[10]=x*y}else if(d.order==="ZYX"){let T=x*M,b=x*E,w=v*M,C=v*E;p[0]=y*M,p[4]=w*S-b,p[8]=T*S+C,p[1]=y*E,p[5]=C*S+T,p[9]=b*S-w,p[2]=-S,p[6]=v*y,p[10]=x*y}else if(d.order==="YZX"){let T=x*y,b=x*S,w=v*y,C=v*S;p[0]=y*M,p[4]=C-T*E,p[8]=w*E+b,p[1]=E,p[5]=x*M,p[9]=-v*M,p[2]=-S*M,p[6]=b*E+w,p[10]=T-C*E}else if(d.order==="XZY"){let T=x*y,b=x*S,w=v*y,C=v*S;p[0]=y*M,p[4]=-E,p[8]=S*M,p[1]=T*E+C,p[5]=x*M,p[9]=b*E-w,p[2]=w*E-b,p[6]=v*M,p[10]=C*E+T}return p[3]=0,p[7]=0,p[11]=0,p[12]=0,p[13]=0,p[14]=0,p[15]=1,this}makeRotationFromQuaternion(d){return this.compose(Im,d,Pm)}lookAt(d,p,m){let g=this.elements;if(Rn.subVectors(d,p),Rn.lengthSq()===0)Rn.z=1;if(Rn.normalize(),vi.crossVectors(m,Rn),vi.lengthSq()===0){if(Math.abs(m.z)===1)Rn.x+=0.0001;else Rn.z+=0.0001;Rn.normalize(),vi.crossVectors(m,Rn)}return vi.normalize(),Qr.crossVectors(Rn,vi),g[0]=vi.x,g[4]=Qr.x,g[8]=Rn.x,g[1]=vi.y,g[5]=Qr.y,g[9]=Rn.y,g[2]=vi.z,g[6]=Qr.z,g[10]=Rn.z,this}multiply(d){return this.multiplyMatrices(this,d)}premultiply(d){return this.multiplyMatrices(d,this)}multiplyMatrices(d,p){let m=d.elements,g=p.elements,_=this.elements,x=m[0],v=m[4],y=m[8],S=m[12],M=m[1],E=m[5],T=m[9],b=m[13],w=m[2],C=m[6],N=m[10],A=m[14],R=m[3],P=m[7],F=m[11],L=m[15],U=g[0],k=g[4],I=g[8],D=g[12],z=g[1],W=g[5],H=g[9],X=g[13],J=g[2],G=g[6],Q=g[10],it=g[14],j=g[3],_t=g[7],rt=g[11],ut=g[15];return _[0]=x*U+v*z+y*J+S*j,_[4]=x*k+v*W+y*G+S*_t,_[8]=x*I+v*H+y*Q+S*rt,_[12]=x*D+v*X+y*it+S*ut,_[1]=M*U+E*z+T*J+b*j,_[5]=M*k+E*W+T*G+b*_t,_[9]=M*I+E*H+T*Q+b*rt,_[13]=M*D+E*X+T*it+b*ut,_[2]=w*U+C*z+N*J+A*j,_[6]=w*k+C*W+N*G+A*_t,_[10]=w*I+C*H+N*Q+A*rt,_[14]=w*D+C*X+N*it+A*ut,_[3]=R*U+P*z+F*J+L*j,_[7]=R*k+P*W+F*G+L*_t,_[11]=R*I+P*H+F*Q+L*rt,_[15]=R*D+P*X+F*it+L*ut,this}multiplyScalar(d){let p=this.elements;return p[0]*=d,p[4]*=d,p[8]*=d,p[12]*=d,p[1]*=d,p[5]*=d,p[9]*=d,p[13]*=d,p[2]*=d,p[6]*=d,p[10]*=d,p[14]*=d,p[3]*=d,p[7]*=d,p[11]*=d,p[15]*=d,this}determinant(){let d=this.elements,p=d[0],m=d[4],g=d[8],_=d[12],x=d[1],v=d[5],y=d[9],S=d[13],M=d[2],E=d[6],T=d[10],b=d[14],w=d[3],C=d[7],N=d[11],A=d[15],R=y*b-S*T,P=v*b-S*E,F=v*T-y*E,L=x*b-S*M,U=x*T-y*M,k=x*E-v*M;return p*(C*R-N*P+A*F)-m*(w*R-N*L+A*U)+g*(w*P-C*L+A*k)-_*(w*F-C*U+N*k)}determinantAffine(){let d=this.elements,p=d[0],m=d[4],g=d[8],_=d[1],x=d[5],v=d[9],y=d[2],S=d[6],M=d[10];return p*(x*M-v*S)-m*(_*M-v*y)+g*(_*S-x*y)}transpose(){let d=this.elements,p;return p=d[1],d[1]=d[4],d[4]=p,p=d[2],d[2]=d[8],d[8]=p,p=d[6],d[6]=d[9],d[9]=p,p=d[3],d[3]=d[12],d[12]=p,p=d[7],d[7]=d[13],d[13]=p,p=d[11],d[11]=d[14],d[14]=p,this}setPosition(d,p,m){let g=this.elements;if(d.isVector3)g[12]=d.x,g[13]=d.y,g[14]=d.z;else g[12]=d,g[13]=p,g[14]=m;return this}invert(){let d=this.elements,p=d[0],m=d[1],g=d[2],_=d[3],x=d[4],v=d[5],y=d[6],S=d[7],M=d[8],E=d[9],T=d[10],b=d[11],w=d[12],C=d[13],N=d[14],A=d[15],R=p*v-m*x,P=p*y-g*x,F=p*S-_*x,L=m*y-g*v,U=m*S-_*v,k=g*S-_*y,I=M*C-E*w,D=M*N-T*w,z=M*A-b*w,W=E*N-T*C,H=E*A-b*C,X=T*A-b*N,J=R*X-P*H+F*W+L*z-U*D+k*I;if(J===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let G=1/J;return d[0]=(v*X-y*H+S*W)*G,d[1]=(g*H-m*X-_*W)*G,d[2]=(C*k-N*U+A*L)*G,d[3]=(T*U-E*k-b*L)*G,d[4]=(y*z-x*X-S*D)*G,d[5]=(p*X-g*z+_*D)*G,d[6]=(N*F-w*k-A*P)*G,d[7]=(M*k-T*F+b*P)*G,d[8]=(x*H-v*z+S*I)*G,d[9]=(m*z-p*H-_*I)*G,d[10]=(w*U-C*F+A*R)*G,d[11]=(E*F-M*U-b*R)*G,d[12]=(v*D-x*W-y*I)*G,d[13]=(p*W-m*D+g*I)*G,d[14]=(C*P-w*L-N*R)*G,d[15]=(M*L-E*P+T*R)*G,this}scale(d){let p=this.elements,{x:m,y:g,z:_}=d;return p[0]*=m,p[4]*=g,p[8]*=_,p[1]*=m,p[5]*=g,p[9]*=_,p[2]*=m,p[6]*=g,p[10]*=_,p[3]*=m,p[7]*=g,p[11]*=_,this}getMaxScaleOnAxis(){let d=this.elements,p=d[0]*d[0]+d[1]*d[1]+d[2]*d[2],m=d[4]*d[4]+d[5]*d[5]+d[6]*d[6],g=d[8]*d[8]+d[9]*d[9]+d[10]*d[10];return Math.sqrt(Math.max(p,m,g))}makeTranslation(d,p,m){if(d.isVector3)this.set(1,0,0,d.x,0,1,0,d.y,0,0,1,d.z,0,0,0,1);else this.set(1,0,0,d,0,1,0,p,0,0,1,m,0,0,0,1);return this}makeRotationX(d){let p=Math.cos(d),m=Math.sin(d);return this.set(1,0,0,0,0,p,-m,0,0,m,p,0,0,0,0,1),this}makeRotationY(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,0,m,0,0,1,0,0,-m,0,p,0,0,0,0,1),this}makeRotationZ(d){let p=Math.cos(d),m=Math.sin(d);return this.set(p,-m,0,0,m,p,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(d,p){let m=Math.cos(p),g=Math.sin(p),_=1-m,{x,y:v,z:y}=d,S=_*x,M=_*v;return this.set(S*x+m,S*v-g*y,S*y+g*v,0,S*v+g*y,M*v+m,M*y-g*x,0,S*y-g*v,M*y+g*x,_*y*y+m,0,0,0,0,1),this}makeScale(d,p,m){return this.set(d,0,0,0,0,p,0,0,0,0,m,0,0,0,0,1),this}makeShear(d,p,m,g,_,x){return this.set(1,m,_,0,d,1,x,0,p,g,1,0,0,0,0,1),this}compose(d,p,m){let g=this.elements,{_x:_,_y:x,_z:v,_w:y}=p,S=_+_,M=x+x,E=v+v,T=_*S,b=_*M,w=_*E,C=x*M,N=x*E,A=v*E,R=y*S,P=y*M,F=y*E,{x:L,y:U,z:k}=m;return g[0]=(1-(C+A))*L,g[1]=(b+F)*L,g[2]=(w-P)*L,g[3]=0,g[4]=(b-F)*U,g[5]=(1-(T+A))*U,g[6]=(N+R)*U,g[7]=0,g[8]=(w+P)*k,g[9]=(N-R)*k,g[10]=(1-(T+C))*k,g[11]=0,g[12]=d.x,g[13]=d.y,g[14]=d.z,g[15]=1,this}decompose(d,p,m){let g=this.elements;d.x=g[12],d.y=g[13],d.z=g[14];let _=this.determinantAffine();if(_===0)return m.set(1,1,1),p.identity(),this;let x=us.set(g[0],g[1],g[2]).length(),v=us.set(g[4],g[5],g[6]).length(),y=us.set(g[8],g[9],g[10]).length();if(_<0)x=-x;Bn.copy(this);let S=1/x,M=1/v,E=1/y;return Bn.elements[0]*=S,Bn.elements[1]*=S,Bn.elements[2]*=S,Bn.elements[4]*=M,Bn.elements[5]*=M,Bn.elements[6]*=M,Bn.elements[8]*=E,Bn.elements[9]*=E,Bn.elements[10]*=E,p.setFromRotationMatrix(Bn),m.x=x,m.y=v,m.z=y,this}makePerspective(d,p,m,g,_,x,v=2000,y=!1){let S=this.elements,M=2*_/(p-d),E=2*_/(m-g),T=(p+d)/(p-d),b=(m+g)/(m-g),w,C;if(y)w=_/(x-_),C=x*_/(x-_);else if(v===2000)w=-(x+_)/(x-_),C=-2*x*_/(x-_);else if(v===2001)w=-x/(x-_),C=-x*_/(x-_);else throw Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=T,S[12]=0,S[1]=0,S[5]=E,S[9]=b,S[13]=0,S[2]=0,S[6]=0,S[10]=w,S[14]=C,S[3]=0,S[7]=0,S[11]=-1,S[15]=0,this}makeOrthographic(d,p,m,g,_,x,v=2000,y=!1){let S=this.elements,M=2/(p-d),E=2/(m-g),T=-(p+d)/(p-d),b=-(m+g)/(m-g),w,C;if(y)w=1/(x-_),C=x/(x-_);else if(v===2000)w=-2/(x-_),C=-(x+_)/(x-_);else if(v===2001)w=-1/(x-_),C=-_/(x-_);else throw Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+v);return S[0]=M,S[4]=0,S[8]=0,S[12]=T,S[1]=0,S[5]=E,S[9]=0,S[13]=b,S[2]=0,S[6]=0,S[10]=w,S[14]=C,S[3]=0,S[7]=0,S[11]=0,S[15]=1,this}equals(d){let p=this.elements,m=d.elements;for(let g=0;g<16;g++)if(p[g]!==m[g])return!1;return!0}fromArray(d,p=0){for(let m=0;m<16;m++)this.elements[m]=d[m+p];return this}toArray(d=[],p=0){let m=this.elements;return d[p]=m[0],d[p+1]=m[1],d[p+2]=m[2],d[p+3]=m[3],d[p+4]=m[4],d[p+5]=m[5],d[p+6]=m[6],d[p+7]=m[7],d[p+8]=m[8],d[p+9]=m[9],d[p+10]=m[10],d[p+11]=m[11],d[p+12]=m[12],d[p+13]=m[13],d[p+14]=m[14],d[p+15]=m[15],d}}var us=new q,Bn=new ie,Im=new q(0,0,0),Pm=new q(1,1,1),vi=new q,Qr=new q,Rn=new q,cu=new ie,hu=new di;class li{constructor(d=0,p=0,m=0,g=li.DEFAULT_ORDER){this.isEuler=!0,this._x=d,this._y=p,this._z=m,this._order=g}get x(){return this._x}set x(d){this._x=d,this._onChangeCallback()}get y(){return this._y}set y(d){this._y=d,this._onChangeCallback()}get z(){return this._z}set z(d){this._z=d,this._onChangeCallback()}get order(){return this._order}set order(d){this._order=d,this._onChangeCallback()}set(d,p,m,g=this._order){return this._x=d,this._y=p,this._z=m,this._order=g,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(d){return this._x=d._x,this._y=d._y,this._z=d._z,this._order=d._order,this._onChangeCallback(),this}setFromRotationMatrix(d,p=this._order,m=!0){let g=d.elements,_=g[0],x=g[4],v=g[8],y=g[1],S=g[5],M=g[9],E=g[2],T=g[6],b=g[10];switch(p){case"XYZ":if(this._y=Math.asin(ne(v,-1,1)),Math.abs(v)<0.9999999)this._x=Math.atan2(-M,b),this._z=Math.atan2(-x,_);else this._x=Math.atan2(T,S),this._z=0;break;case"YXZ":if(this._x=Math.asin(-ne(M,-1,1)),Math.abs(M)<0.9999999)this._y=Math.atan2(v,b),this._z=Math.atan2(y,S);else this._y=Math.atan2(-E,_),this._z=0;break;case"ZXY":if(this._x=Math.asin(ne(T,-1,1)),Math.abs(T)<0.9999999)this._y=Math.atan2(-E,b),this._z=Math.atan2(-x,S);else this._y=0,this._z=Math.atan2(y,_);break;case"ZYX":if(this._y=Math.asin(-ne(E,-1,1)),Math.abs(E)<0.9999999)this._x=Math.atan2(T,b),this._z=Math.atan2(y,_);else this._x=0,this._z=Math.atan2(-x,S);break;case"YZX":if(this._z=Math.asin(ne(y,-1,1)),Math.abs(y)<0.9999999)this._x=Math.atan2(-M,S),this._y=Math.atan2(-E,_);else this._x=0,this._y=Math.atan2(v,b);break;case"XZY":if(this._z=Math.asin(-ne(x,-1,1)),Math.abs(x)<0.9999999)this._x=Math.atan2(T,S),this._y=Math.atan2(v,_);else this._x=Math.atan2(-M,b),this._y=0;break;default:Xt("Euler: .setFromRotationMatrix() encountered an unknown order: "+p)}if(this._order=p,m===!0)this._onChangeCallback();return this}setFromQuaternion(d,p,m){return cu.makeRotationFromQuaternion(d),this.setFromRotationMatrix(cu,p,m)}setFromVector3(d,p=this._order){return this.set(d.x,d.y,d.z,p)}reorder(d){return hu.setFromEuler(this),this.setFromQuaternion(hu,d)}equals(d){return d._x===this._x&&d._y===this._y&&d._z===this._z&&d._order===this._order}fromArray(d){if(this._x=d[0],this._y=d[1],this._z=d[2],d[3]!==void 0)this._order=d[3];return this._onChangeCallback(),this}toArray(d=[],p=0){return d[p]=this._x,d[p+1]=this._y,d[p+2]=this._z,d[p+3]=this._order,d}_onChange(d){return this._onChangeCallback=d,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}li.DEFAULT_ORDER="XYZ";class br{constructor(){this.mask=1}set(d){this.mask=(1<<d|0)>>>0}enable(d){this.mask|=1<<d|0}enableAll(){this.mask=-1}toggle(d){this.mask^=1<<d|0}disable(d){this.mask&=~(1<<d|0)}disableAll(){this.mask=0}test(d){return(this.mask&d.mask)!==0}isEnabled(d){return(this.mask&(1<<d|0))!==0}}var Lm=0,uu=new q,ds=new di,ei=new ie,to=new q,sr=new q,Nm=new q,Dm=new di,du=new q(1,0,0),fu=new q(0,1,0),pu=new q(0,0,1),mu={type:"added"},Um={type:"removed"},fs={type:"childadded",child:null},ja={type:"childremoved",child:null};class Xe extends ui{constructor(){super();this.isObject3D=!0,Object.defineProperty(this,"id",{value:Lm++}),this.uuid=Ri(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Xe.DEFAULT_UP.clone();let d=new q,p=new li,m=new di,g=new q(1,1,1);function _(){m.setFromEuler(p,!1)}function x(){p.setFromQuaternion(m,void 0,!1)}p._onChange(_),m._onChange(x),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:d},rotation:{configurable:!0,enumerable:!0,value:p},quaternion:{configurable:!0,enumerable:!0,value:m},scale:{configurable:!0,enumerable:!0,value:g},modelViewMatrix:{value:new ie},normalMatrix:{value:new Kt}}),this.matrix=new ie,this.matrixWorld=new ie,this.matrixAutoUpdate=Xe.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new br,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(d){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrix.premultiply(d),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null)this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(d){return this.quaternion.premultiply(d),this}setRotationFromAxisAngle(d,p){this.quaternion.setFromAxisAngle(d,p)}setRotationFromEuler(d){this.quaternion.setFromEuler(d,!0)}setRotationFromMatrix(d){this.quaternion.setFromRotationMatrix(d)}setRotationFromQuaternion(d){this.quaternion.copy(d)}rotateOnAxis(d,p){return ds.setFromAxisAngle(d,p),this.quaternion.multiply(ds),this}rotateOnWorldAxis(d,p){return ds.setFromAxisAngle(d,p),this.quaternion.premultiply(ds),this}rotateX(d){return this.rotateOnAxis(du,d)}rotateY(d){return this.rotateOnAxis(fu,d)}rotateZ(d){return this.rotateOnAxis(pu,d)}translateOnAxis(d,p){return uu.copy(d).applyQuaternion(this.quaternion),this.position.add(uu.multiplyScalar(p)),this}translateX(d){return this.translateOnAxis(du,d)}translateY(d){return this.translateOnAxis(fu,d)}translateZ(d){return this.translateOnAxis(pu,d)}localToWorld(d){return this.updateWorldMatrix(!0,!1),d.applyMatrix4(this.matrixWorld)}worldToLocal(d){return this.updateWorldMatrix(!0,!1),d.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(d,p,m){if(d.isVector3)to.copy(d);else to.set(d,p,m);let g=this.parent;if(this.updateWorldMatrix(!0,!1),sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight)ei.lookAt(sr,to,this.up);else ei.lookAt(to,sr,this.up);if(this.quaternion.setFromRotationMatrix(ei),g)ei.extractRotation(g.matrixWorld),ds.setFromRotationMatrix(ei),this.quaternion.premultiply(ds.invert())}add(d){if(arguments.length>1){for(let p=0;p<arguments.length;p++)this.add(arguments[p]);return this}if(d===this)return $t("Object3D.add: object can't be added as a child of itself.",d),this;if(d&&d.isObject3D)d.removeFromParent(),d.parent=this,this.children.push(d),d.dispatchEvent(mu),fs.child=d,this.dispatchEvent(fs),fs.child=null;else $t("Object3D.add: object not an instance of THREE.Object3D.",d);return this}remove(d){if(arguments.length>1){for(let m=0;m<arguments.length;m++)this.remove(arguments[m]);return this}let p=this.children.indexOf(d);if(p!==-1)d.parent=null,this.children.splice(p,1),d.dispatchEvent(Um),ja.child=d,this.dispatchEvent(ja),ja.child=null;return this}removeFromParent(){let d=this.parent;if(d!==null)d.remove(this);return this}clear(){return this.remove(...this.children)}attach(d){if(this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),d.parent!==null)d.parent.updateWorldMatrix(!0,!1),ei.multiply(d.parent.matrixWorld);return d.applyMatrix4(ei),d.removeFromParent(),d.parent=this,this.children.push(d),d.updateWorldMatrix(!1,!0),d.dispatchEvent(mu),fs.child=d,this.dispatchEvent(fs),fs.child=null,this}getObjectById(d){return this.getObjectByProperty("id",d)}getObjectByName(d){return this.getObjectByProperty("name",d)}getObjectByProperty(d,p){if(this[d]===p)return this;for(let m=0,g=this.children.length;m<g;m++){let x=this.children[m].getObjectByProperty(d,p);if(x!==void 0)return x}return}getObjectsByProperty(d,p,m=[]){if(this[d]===p)m.push(this);let g=this.children;for(let _=0,x=g.length;_<x;_++)g[_].getObjectsByProperty(d,p,m);return m}getWorldPosition(d){return this.updateWorldMatrix(!0,!1),d.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(d){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,d,Nm),d}getWorldScale(d){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,Dm,d),d}getWorldDirection(d){this.updateWorldMatrix(!0,!1);let p=this.matrixWorld.elements;return d.set(p[8],p[9],p[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(d){d(this);let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].traverse(d)}traverseVisible(d){if(this.visible===!1)return;d(this);let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].traverseVisible(d)}traverseAncestors(d){let p=this.parent;if(p!==null)d(p),p.traverseAncestors(d)}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let d=this.pivot;if(d!==null){let{x:p,y:m,z:g}=d,_=this.matrix.elements;_[12]+=p-_[0]*p-_[4]*m-_[8]*g,_[13]+=m-_[1]*p-_[5]*m-_[9]*g,_[14]+=g-_[2]*p-_[6]*m-_[10]*g}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(d){if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||d){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,d=!0}let p=this.children;for(let m=0,g=p.length;m<g;m++)p[m].updateMatrixWorld(d)}updateWorldMatrix(d,p,m=!1){let g=this.parent;if(d===!0&&g!==null)g.updateWorldMatrix(!0,!1);if(this.matrixAutoUpdate)this.updateMatrix();if(this.matrixWorldNeedsUpdate||m){if(this.matrixWorldAutoUpdate===!0)if(this.parent===null)this.matrixWorld.copy(this.matrix);else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix);this.matrixWorldNeedsUpdate=!1,m=!0}if(p===!0){let _=this.children;for(let x=0,v=_.length;x<v;x++)_[x].updateWorldMatrix(!1,!0,m)}}toJSON(d){let p=d===void 0||typeof d==="string",m={};if(p)d={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},m.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"};let g={};if(g.uuid=this.uuid,g.type=this.type,g.name=this.name,g.castShadow=this.castShadow,g.receiveShadow=this.receiveShadow,g.visible=this.visible,g.frustumCulled=this.frustumCulled,g.renderOrder=this.renderOrder,g.static=this.static,g.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0)g.userData=this.userData;if(g.layers=this.layers.mask,g.matrix=this.matrix.toArray(),g.up=this.up.toArray(),this.pivot!==null)g.pivot=this.pivot.toArray();if(this.morphTargetDictionary!==void 0)g.morphTargetDictionary=Object.assign({},this.morphTargetDictionary);if(this.morphTargetInfluences!==void 0)g.morphTargetInfluences=this.morphTargetInfluences.slice();if(this.isInstancedMesh){if(g.type="InstancedMesh",g.count=this.count,g.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null)g.instanceColor=this.instanceColor.toJSON()}if(this.isBatchedMesh){if(g.type="BatchedMesh",g.perObjectFrustumCulled=this.perObjectFrustumCulled,g.sortObjects=this.sortObjects,g.drawRanges=this._drawRanges,g.reservedRanges=this._reservedRanges,g.geometryInfo=this._geometryInfo.map((v)=>({...v,boundingBox:v.boundingBox?v.boundingBox.toJSON():void 0,boundingSphere:v.boundingSphere?v.boundingSphere.toJSON():void 0})),g.instanceInfo=this._instanceInfo.map((v)=>({...v})),g.availableInstanceIds=this._availableInstanceIds.slice(),g.availableGeometryIds=this._availableGeometryIds.slice(),g.nextIndexStart=this._nextIndexStart,g.nextVertexStart=this._nextVertexStart,g.geometryCount=this._geometryCount,g.maxInstanceCount=this._maxInstanceCount,g.maxVertexCount=this._maxVertexCount,g.maxIndexCount=this._maxIndexCount,g.geometryInitialized=this._geometryInitialized,g.matricesTexture=this._matricesTexture.toJSON(d),g.indirectTexture=this._indirectTexture.toJSON(d),this._colorsTexture!==null)g.colorsTexture=this._colorsTexture.toJSON(d);if(this.boundingSphere!==null)g.boundingSphere=this.boundingSphere.toJSON();if(this.boundingBox!==null)g.boundingBox=this.boundingBox.toJSON()}function _(v,y){if(v[y.uuid]===void 0)v[y.uuid]=y.toJSON(d);return y.uuid}if(this.isScene){if(this.background){if(this.background.isColor)g.background=this.background.toJSON();else if(this.background.isTexture)g.background=this.background.toJSON(d).uuid}if(this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0)g.environment=this.environment.toJSON(d).uuid}else if(this.isMesh||this.isLine||this.isPoints){g.geometry=_(d.geometries,this.geometry);let v=this.geometry.parameters;if(v!==void 0&&v.shapes!==void 0){let y=v.shapes;if(Array.isArray(y))for(let S=0,M=y.length;S<M;S++){let E=y[S];_(d.shapes,E)}else _(d.shapes,y)}}if(this.isSkinnedMesh){if(g.bindMode=this.bindMode,g.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0)_(d.skeletons,this.skeleton),g.skeleton=this.skeleton.uuid}if(this.material!==void 0)if(Array.isArray(this.material)){let v=[];for(let y=0,S=this.material.length;y<S;y++)v.push(_(d.materials,this.material[y]));g.material=v}else g.material=_(d.materials,this.material);if(this.children.length>0){g.children=[];for(let v=0;v<this.children.length;v++)g.children.push(this.children[v].toJSON(d).object)}if(this.animations.length>0){g.animations=[];for(let v=0;v<this.animations.length;v++){let y=this.animations[v];g.animations.push(_(d.animations,y))}}if(p){let v=x(d.geometries),y=x(d.materials),S=x(d.textures),M=x(d.images),E=x(d.shapes),T=x(d.skeletons),b=x(d.animations),w=x(d.nodes);if(v.length>0)m.geometries=v;if(y.length>0)m.materials=y;if(S.length>0)m.textures=S;if(M.length>0)m.images=M;if(E.length>0)m.shapes=E;if(T.length>0)m.skeletons=T;if(b.length>0)m.animations=b;if(w.length>0)m.nodes=w}return m.object=g,m;function x(v){let y=[];for(let S in v){let M=v[S];delete M.metadata,y.push(M)}return y}}clone(d){return new this.constructor().copy(this,d)}copy(d,p=!0){if(this.name=d.name,this.up.copy(d.up),this.position.copy(d.position),this.rotation.order=d.rotation.order,this.quaternion.copy(d.quaternion),this.scale.copy(d.scale),this.pivot=d.pivot!==null?d.pivot.clone():null,this.matrix.copy(d.matrix),this.matrixWorld.copy(d.matrixWorld),this.matrixAutoUpdate=d.matrixAutoUpdate,this.matrixWorldAutoUpdate=d.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=d.matrixWorldNeedsUpdate,this.layers.mask=d.layers.mask,this.visible=d.visible,this.castShadow=d.castShadow,this.receiveShadow=d.receiveShadow,this.frustumCulled=d.frustumCulled,this.renderOrder=d.renderOrder,this.static=d.static,this.animations=d.animations.slice(),this.userData=JSON.parse(JSON.stringify(d.userData)),p===!0)for(let m=0;m<d.children.length;m++){let g=d.children[m];this.add(g.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Xe.DEFAULT_UP=new q(0,1,0);Xe.DEFAULT_MATRIX_AUTO_UPDATE=!0;Xe.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class Ts extends Xe{constructor(){super();this.isGroup=!0,this.type="Group"}}var Fm={type:"move"};class Er{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){if(this._hand===null)this._hand=new Ts,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1};return this._hand}getTargetRaySpace(){if(this._targetRay===null)this._targetRay=new Ts,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new q;return this._targetRay}getGripSpace(){if(this._grip===null)this._grip=new Ts,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new q,this._grip.eventsEnabled=!1;return this._grip}dispatchEvent(d){if(this._targetRay!==null)this._targetRay.dispatchEvent(d);if(this._grip!==null)this._grip.dispatchEvent(d);if(this._hand!==null)this._hand.dispatchEvent(d);return this}connect(d){if(d&&d.hand){let p=this._hand;if(p)for(let m of d.hand.values())this._getHandJoint(p,m)}return this.dispatchEvent({type:"connected",data:d}),this}disconnect(d){if(this.dispatchEvent({type:"disconnected",data:d}),this._targetRay!==null)this._targetRay.visible=!1;if(this._grip!==null)this._grip.visible=!1;if(this._hand!==null)this._hand.visible=!1;return this}update(d,p,m){let g=null,_=null,x=null,v=this._targetRay,y=this._grip,S=this._hand;if(d&&p.session.visibilityState!=="visible-blurred"){if(S&&d.hand){x=!0;for(let C of d.hand.values()){let N=p.getJointPose(C,m),A=this._getHandJoint(S,C);if(N!==null)A.matrix.fromArray(N.transform.matrix),A.matrix.decompose(A.position,A.quaternion,A.scale),A.matrixWorldNeedsUpdate=!0,A.jointRadius=N.radius;A.visible=N!==null}let M=S.joints["index-finger-tip"],E=S.joints["thumb-tip"],T=M.position.distanceTo(E.position),b=0.02,w=0.005;if(S.inputState.pinching&&T>b+w)S.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:d.handedness,target:this});else if(!S.inputState.pinching&&T<=b-w)S.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:d.handedness,target:this})}else if(y!==null&&d.gripSpace){if(_=p.getPose(d.gripSpace,m),_!==null){if(y.matrix.fromArray(_.transform.matrix),y.matrix.decompose(y.position,y.quaternion,y.scale),y.matrixWorldNeedsUpdate=!0,_.linearVelocity)y.hasLinearVelocity=!0,y.linearVelocity.copy(_.linearVelocity);else y.hasLinearVelocity=!1;if(_.angularVelocity)y.hasAngularVelocity=!0,y.angularVelocity.copy(_.angularVelocity);else y.hasAngularVelocity=!1;if(y.eventsEnabled)y.dispatchEvent({type:"gripUpdated",data:d,target:this})}}if(v!==null){if(g=p.getPose(d.targetRaySpace,m),g===null&&_!==null)g=_;if(g!==null){if(v.matrix.fromArray(g.transform.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale),v.matrixWorldNeedsUpdate=!0,g.linearVelocity)v.hasLinearVelocity=!0,v.linearVelocity.copy(g.linearVelocity);else v.hasLinearVelocity=!1;if(g.angularVelocity)v.hasAngularVelocity=!0,v.angularVelocity.copy(g.angularVelocity);else v.hasAngularVelocity=!1;this.dispatchEvent(Fm)}}}if(v!==null)v.visible=g!==null;if(y!==null)y.visible=_!==null;if(S!==null)S.visible=x!==null;return this}_getHandJoint(d,p){if(d.joints[p.jointName]===void 0){let m=new Ts;m.matrixAutoUpdate=!1,m.visible=!1,d.joints[p.jointName]=m,d.add(m)}return d.joints[p.jointName]}}var kd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},eo={h:0,s:0,l:0};function Qa(d,p,m){if(m<0)m+=1;if(m>1)m-=1;if(m<0.16666666666666666)return d+(p-d)*6*m;if(m<0.5)return p;if(m<0.6666666666666666)return d+(p-d)*6*(0.6666666666666666-m);return d}class se{constructor(d,p,m){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(d,p,m)}set(d,p,m){if(p===void 0&&m===void 0){let g=d;if(g&&g.isColor)this.copy(g);else if(typeof g==="number")this.setHex(g);else if(typeof g==="string")this.setStyle(g)}else this.setRGB(d,p,m);return this}setScalar(d){return this.r=d,this.g=d,this.b=d,this}setHex(d,p="srgb"){return d=Math.floor(d),this.r=(d>>16&255)/255,this.g=(d>>8&255)/255,this.b=(d&255)/255,le.colorSpaceToWorking(this,p),this}setRGB(d,p,m,g=le.workingColorSpace){return this.r=d,this.g=p,this.b=m,le.colorSpaceToWorking(this,g),this}setHSL(d,p,m,g=le.workingColorSpace){if(d=Sc(d,1),p=ne(p,0,1),m=ne(m,0,1),p===0)this.r=this.g=this.b=m;else{let _=m<=0.5?m*(1+p):m+p-m*p,x=2*m-_;this.r=Qa(x,_,d+0.3333333333333333),this.g=Qa(x,_,d),this.b=Qa(x,_,d-0.3333333333333333)}return le.colorSpaceToWorking(this,g),this}setStyle(d,p="srgb"){function m(_){if(_===void 0)return;if(parseFloat(_)<1)Xt("Color: Alpha component of "+d+" will be ignored.")}let g;if(g=/^(\w+)\(([^\)]*)\)/.exec(d)){let _,x=g[1],v=g[2];switch(x){case"rgb":case"rgba":if(_=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setRGB(Math.min(255,parseInt(_[1],10))/255,Math.min(255,parseInt(_[2],10))/255,Math.min(255,parseInt(_[3],10))/255,p);if(_=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setRGB(Math.min(100,parseFloat(_[1]))/100,Math.min(100,parseFloat(_[2]))/100,Math.min(100,parseFloat(_[3]))/100,p);break;case"hsl":case"hsla":if(_=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(v))return m(_[4]),this.setHSL(parseFloat(_[1])/360,parseFloat(_[2])/100,parseFloat(_[3])/100,p);break;default:Xt("Color: Unknown color model "+d)}}else if(g=/^\#([A-Fa-f\d]+)$/.exec(d)){let _=g[1],x=_.length;if(x===3)return this.setRGB(parseInt(_.charAt(0),16)/15,parseInt(_.charAt(1),16)/15,parseInt(_.charAt(2),16)/15,p);else if(x===6)return this.setHex(parseInt(_,16),p);else Xt("Color: Invalid hex color "+d)}else if(d&&d.length>0)return this.setColorName(d,p);return this}setColorName(d,p="srgb"){let m=kd[d.toLowerCase()];if(m!==void 0)this.setHex(m,p);else Xt("Color: Unknown color "+d);return this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(d){return this.r=d.r,this.g=d.g,this.b=d.b,this}copySRGBToLinear(d){return this.r=ai(d.r),this.g=ai(d.g),this.b=ai(d.b),this}copyLinearToSRGB(d){return this.r=ws(d.r),this.g=ws(d.g),this.b=ws(d.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(d="srgb"){return le.workingToColorSpace(cn.copy(this),d),Math.round(ne(cn.r*255,0,255))*65536+Math.round(ne(cn.g*255,0,255))*256+Math.round(ne(cn.b*255,0,255))}getHexString(d="srgb"){return("000000"+this.getHex(d).toString(16)).slice(-6)}getHSL(d,p=le.workingColorSpace){le.workingToColorSpace(cn.copy(this),p);let{r:m,g,b:_}=cn,x=Math.max(m,g,_),v=Math.min(m,g,_),y,S,M=(v+x)/2;if(v===x)y=0,S=0;else{let E=x-v;switch(S=M<=0.5?E/(x+v):E/(2-x-v),x){case m:y=(g-_)/E+(g<_?6:0);break;case g:y=(_-m)/E+2;break;case _:y=(m-g)/E+4;break}y/=6}return d.h=y,d.s=S,d.l=M,d}getRGB(d,p=le.workingColorSpace){return le.workingToColorSpace(cn.copy(this),p),d.r=cn.r,d.g=cn.g,d.b=cn.b,d}getStyle(d="srgb"){le.workingToColorSpace(cn.copy(this),d);let{r:p,g:m,b:g}=cn;if(d!=="srgb")return`color(${d} ${p.toFixed(3)} ${m.toFixed(3)} ${g.toFixed(3)})`;return`rgb(${Math.round(p*255)},${Math.round(m*255)},${Math.round(g*255)})`}offsetHSL(d,p,m){return this.getHSL(yi),this.setHSL(yi.h+d,yi.s+p,yi.l+m)}add(d){return this.r+=d.r,this.g+=d.g,this.b+=d.b,this}addColors(d,p){return this.r=d.r+p.r,this.g=d.g+p.g,this.b=d.b+p.b,this}addScalar(d){return this.r+=d,this.g+=d,this.b+=d,this}sub(d){return this.r=Math.max(0,this.r-d.r),this.g=Math.max(0,this.g-d.g),this.b=Math.max(0,this.b-d.b),this}multiply(d){return this.r*=d.r,this.g*=d.g,this.b*=d.b,this}multiplyScalar(d){return this.r*=d,this.g*=d,this.b*=d,this}lerp(d,p){return this.r+=(d.r-this.r)*p,this.g+=(d.g-this.g)*p,this.b+=(d.b-this.b)*p,this}lerpColors(d,p,m){return this.r=d.r+(p.r-d.r)*m,this.g=d.g+(p.g-d.g)*m,this.b=d.b+(p.b-d.b)*m,this}lerpHSL(d,p){this.getHSL(yi),d.getHSL(eo);let m=ur(yi.h,eo.h,p),g=ur(yi.s,eo.s,p),_=ur(yi.l,eo.l,p);return this.setHSL(m,g,_),this}setFromVector3(d){return this.r=d.x,this.g=d.y,this.b=d.z,this}applyMatrix3(d){let p=this.r,m=this.g,g=this.b,_=d.elements;return this.r=_[0]*p+_[3]*m+_[6]*g,this.g=_[1]*p+_[4]*m+_[7]*g,this.b=_[2]*p+_[5]*m+_[8]*g,this}equals(d){return d.r===this.r&&d.g===this.g&&d.b===this.b}fromArray(d,p=0){return this.r=d[p],this.g=d[p+1],this.b=d[p+2],this}toArray(d=[],p=0){return d[p]=this.r,d[p+1]=this.g,d[p+2]=this.b,d}fromBufferAttribute(d,p){return this.r=d.getX(p),this.g=d.getY(p),this.b=d.getZ(p),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}var cn=new se;se.NAMES=kd;class zo extends Xe{constructor(){super();if(this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new li,this.environmentIntensity=1,this.environmentRotation=new li,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(d,p){return super.copy(d,p),this.background=d.background!==null?d.background.clone():null,this.environment=d.environment!==null?d.environment.clone():null,this.fog=d.fog!==null?d.fog.clone():null,this.backgroundBlurriness=d.backgroundBlurriness,this.backgroundIntensity=d.backgroundIntensity,this.backgroundRotation.copy(d.backgroundRotation),this.environmentIntensity=d.environmentIntensity,this.environmentRotation.copy(d.environmentRotation),this.overrideMaterial=d.overrideMaterial!==null?d.overrideMaterial.clone():null,this.matrixAutoUpdate=d.matrixAutoUpdate,this}toJSON(d){let p=super.toJSON(d);if(this.fog!==null)p.object.fog=this.fog.toJSON();return p.object.backgroundBlurriness=this.backgroundBlurriness,p.object.backgroundIntensity=this.backgroundIntensity,p.object.backgroundRotation=this.backgroundRotation.toArray(),p.object.environmentIntensity=this.environmentIntensity,p.object.environmentRotation=this.environmentRotation.toArray(),p}}var kn=new q,ni=new q,tl=new q,ii=new q,ps=new q,ms=new q,gu=new q,el=new q,nl=new q,il=new q,sl=new Be,rl=new Be,ol=new Be;class Ge{constructor(d=new q,p=new q,m=new q){this.a=d,this.b=p,this.c=m}static getNormal(d,p,m,g){g.subVectors(m,p),kn.subVectors(d,p),g.cross(kn);let _=g.lengthSq();if(_>0)return g.multiplyScalar(1/Math.sqrt(_));return g.set(0,0,0)}static getBarycoord(d,p,m,g,_){kn.subVectors(g,p),ni.subVectors(m,p),tl.subVectors(d,p);let x=kn.dot(kn),v=kn.dot(ni),y=kn.dot(tl),S=ni.dot(ni),M=ni.dot(tl),E=x*S-v*v;if(E===0)return _.set(0,0,0),null;let T=1/E,b=(S*y-v*M)*T,w=(x*M-v*y)*T;return _.set(1-b-w,w,b)}static containsPoint(d,p,m,g){if(this.getBarycoord(d,p,m,g,ii)===null)return!1;return ii.x>=0&&ii.y>=0&&ii.x+ii.y<=1}static getInterpolation(d,p,m,g,_,x,v,y){if(this.getBarycoord(d,p,m,g,ii)===null){if(y.x=0,y.y=0,"z"in y)y.z=0;if("w"in y)y.w=0;return null}return y.setScalar(0),y.addScaledVector(_,ii.x),y.addScaledVector(x,ii.y),y.addScaledVector(v,ii.z),y}static getInterpolatedAttribute(d,p,m,g,_,x){return sl.setScalar(0),rl.setScalar(0),ol.setScalar(0),sl.fromBufferAttribute(d,p),rl.fromBufferAttribute(d,m),ol.fromBufferAttribute(d,g),x.setScalar(0),x.addScaledVector(sl,_.x),x.addScaledVector(rl,_.y),x.addScaledVector(ol,_.z),x}static isFrontFacing(d,p,m,g){return kn.subVectors(m,p),ni.subVectors(d,p),kn.cross(ni).dot(g)<0}set(d,p,m){return this.a.copy(d),this.b.copy(p),this.c.copy(m),this}setFromPointsAndIndices(d,p,m,g){return this.a.copy(d[p]),this.b.copy(d[m]),this.c.copy(d[g]),this}setFromAttributeAndIndices(d,p,m,g){return this.a.fromBufferAttribute(d,p),this.b.fromBufferAttribute(d,m),this.c.fromBufferAttribute(d,g),this}clone(){return new this.constructor().copy(this)}copy(d){return this.a.copy(d.a),this.b.copy(d.b),this.c.copy(d.c),this}getArea(){return kn.subVectors(this.c,this.b),ni.subVectors(this.a,this.b),kn.cross(ni).length()*0.5}getMidpoint(d){return d.addVectors(this.a,this.b).add(this.c).multiplyScalar(0.3333333333333333)}getNormal(d){return Ge.getNormal(this.a,this.b,this.c,d)}getPlane(d){return d.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(d,p){return Ge.getBarycoord(d,this.a,this.b,this.c,p)}getInterpolation(d,p,m,g,_){return Ge.getInterpolation(d,this.a,this.b,this.c,p,m,g,_)}containsPoint(d){return Ge.containsPoint(d,this.a,this.b,this.c)}isFrontFacing(d){return Ge.isFrontFacing(this.a,this.b,this.c,d)}intersectsBox(d){return d.intersectsTriangle(this)}closestPointToPoint(d,p){let m=this.a,g=this.b,_=this.c,x,v;ps.subVectors(g,m),ms.subVectors(_,m),el.subVectors(d,m);let y=ps.dot(el),S=ms.dot(el);if(y<=0&&S<=0)return p.copy(m);nl.subVectors(d,g);let M=ps.dot(nl),E=ms.dot(nl);if(M>=0&&E<=M)return p.copy(g);let T=y*E-M*S;if(T<=0&&y>=0&&M<=0&&y-M>0)return x=y/(y-M),p.copy(m).addScaledVector(ps,x);il.subVectors(d,_);let b=ps.dot(il),w=ms.dot(il);if(w>=0&&b<=w)return p.copy(_);let C=b*S-y*w;if(C<=0&&S>=0&&w<=0)return v=S/(S-w),p.copy(m).addScaledVector(ms,v);let N=M*w-b*E;if(N<=0&&E-M>=0&&b-w>=0)return gu.subVectors(_,g),v=(E-M)/(E-M+(b-w)),p.copy(g).addScaledVector(gu,v);let A=1/(N+C+T);return x=C*A,v=T*A,p.copy(m).addScaledVector(ps,x).addScaledVector(ms,v)}equals(d){return d.a.equals(this.a)&&d.b.equals(this.b)&&d.c.equals(this.c)}}class xe{constructor(d=new q(1/0,1/0,1/0),p=new q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=d,this.max=p}set(d,p){return this.min.copy(d),this.max.copy(p),this}setFromArray(d){this.makeEmpty();for(let p=0,m=d.length;p<m;p+=3)this.expandByPoint(zn.fromArray(d,p));return this}setFromBufferAttribute(d){this.makeEmpty();for(let p=0,m=d.count;p<m;p++)this.expandByPoint(zn.fromBufferAttribute(d,p));return this}setFromPoints(d){this.makeEmpty();for(let p=0,m=d.length;p<m;p++)this.expandByPoint(d[p]);return this}setFromCenterAndSize(d,p){let m=zn.copy(p).multiplyScalar(0.5);return this.min.copy(d).sub(m),this.max.copy(d).add(m),this}setFromObject(d,p=!1){return this.makeEmpty(),this.expandByObject(d,p)}clone(){return new this.constructor().copy(this)}copy(d){return this.min.copy(d.min),this.max.copy(d.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(d){return this.isEmpty()?d.set(0,0,0):d.addVectors(this.min,this.max).multiplyScalar(0.5)}getSize(d){return this.isEmpty()?d.set(0,0,0):d.subVectors(this.max,this.min)}expandByPoint(d){return this.min.min(d),this.max.max(d),this}expandByVector(d){return this.min.sub(d),this.max.add(d),this}expandByScalar(d){return this.min.addScalar(-d),this.max.addScalar(d),this}expandByObject(d,p=!1){d.updateWorldMatrix(!1,!1);let m=d.geometry;if(m!==void 0){let _=m.getAttribute("position");if(p===!0&&_!==void 0&&d.isInstancedMesh!==!0&&d.isBatchedMesh!==!0)for(let x=0,v=_.count;x<v;x++){if(d.isMesh===!0)d.getVertexPosition(x,zn);else zn.fromBufferAttribute(_,x);zn.applyMatrix4(d.matrixWorld),this.expandByPoint(zn)}else{if(d.boundingBox!==void 0){if(d.boundingBox===null)d.computeBoundingBox();no.copy(d.boundingBox)}else{if(m.boundingBox===null)m.computeBoundingBox();no.copy(m.boundingBox)}no.applyMatrix4(d.matrixWorld),this.union(no)}}let g=d.children;for(let _=0,x=g.length;_<x;_++)this.expandByObject(g[_],p);return this}containsPoint(d){return d.x>=this.min.x&&d.x<=this.max.x&&d.y>=this.min.y&&d.y<=this.max.y&&d.z>=this.min.z&&d.z<=this.max.z}containsBox(d){return this.min.x<=d.min.x&&d.max.x<=this.max.x&&this.min.y<=d.min.y&&d.max.y<=this.max.y&&this.min.z<=d.min.z&&d.max.z<=this.max.z}getParameter(d,p){return p.set((d.x-this.min.x)/(this.max.x-this.min.x),(d.y-this.min.y)/(this.max.y-this.min.y),(d.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(d){return d.max.x>=this.min.x&&d.min.x<=this.max.x&&d.max.y>=this.min.y&&d.min.y<=this.max.y&&d.max.z>=this.min.z&&d.min.z<=this.max.z}intersectsSphere(d){return this.clampPoint(d.center,zn),zn.distanceToSquared(d.center)<=d.radius*d.radius}intersectsPlane(d){let p,m;if(d.normal.x>0)p=d.normal.x*this.min.x,m=d.normal.x*this.max.x;else p=d.normal.x*this.max.x,m=d.normal.x*this.min.x;if(d.normal.y>0)p+=d.normal.y*this.min.y,m+=d.normal.y*this.max.y;else p+=d.normal.y*this.max.y,m+=d.normal.y*this.min.y;if(d.normal.z>0)p+=d.normal.z*this.min.z,m+=d.normal.z*this.max.z;else p+=d.normal.z*this.max.z,m+=d.normal.z*this.min.z;return p<=-d.constant&&m>=-d.constant}intersectsTriangle(d){if(this.isEmpty())return!1;this.getCenter(rr),io.subVectors(this.max,rr),gs.subVectors(d.a,rr),_s.subVectors(d.b,rr),xs.subVectors(d.c,rr),Si.subVectors(_s,gs),Mi.subVectors(xs,_s),Gi.subVectors(gs,xs);let p=[0,-Si.z,Si.y,0,-Mi.z,Mi.y,0,-Gi.z,Gi.y,Si.z,0,-Si.x,Mi.z,0,-Mi.x,Gi.z,0,-Gi.x,-Si.y,Si.x,0,-Mi.y,Mi.x,0,-Gi.y,Gi.x,0];if(!al(p,gs,_s,xs,io))return!1;if(p=[1,0,0,0,1,0,0,0,1],!al(p,gs,_s,xs,io))return!1;return so.crossVectors(Si,Mi),p=[so.x,so.y,so.z],al(p,gs,_s,xs,io)}clampPoint(d,p){return p.copy(d).clamp(this.min,this.max)}distanceToPoint(d){return this.clampPoint(d,zn).distanceTo(d)}getBoundingSphere(d){if(this.isEmpty())d.makeEmpty();else this.getCenter(d.center),d.radius=this.getSize(zn).length()*0.5;return d}intersect(d){if(this.min.max(d.min),this.max.min(d.max),this.isEmpty())this.makeEmpty();return this}union(d){return this.min.min(d.min),this.max.max(d.max),this}applyMatrix4(d){if(this.isEmpty())return this;return si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(d),si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(d),si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(d),si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(d),si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(d),si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(d),si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(d),si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(d),this.setFromPoints(si),this}translate(d){return this.min.add(d),this.max.add(d),this}equals(d){return d.min.equals(this.min)&&d.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(d){return this.min.fromArray(d.min),this.max.fromArray(d.max),this}}var si=[new q,new q,new q,new q,new q,new q,new q,new q],zn=new q,no=new xe,gs=new q,_s=new q,xs=new q,Si=new q,Mi=new q,Gi=new q,rr=new q,io=new q,so=new q,Vi=new q;function al(d,p,m,g,_){for(let x=0,v=d.length-3;x<=v;x+=3){Vi.fromArray(d,x);let y=_.x*Math.abs(Vi.x)+_.y*Math.abs(Vi.y)+_.z*Math.abs(Vi.z),S=p.dot(Vi),M=m.dot(Vi),E=g.dot(Vi);if(Math.max(-Math.max(S,M,E),Math.min(S,M,E))>y)return!1}return!0}var He=new q,ro=new Jt,Om=0;class Ve extends ui{constructor(d,p,m=!1){super();if(Array.isArray(d))throw TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Om++}),this.name="",this.array=d,this.itemSize=p,this.count=d!==void 0?d.length/p:0,this.normalized=m,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0,this._normalizationScale=d!==void 0?Bo(d):void 0}onUploadCallback(){}set needsUpdate(d){if(d===!0)this.version++}setUsage(d){return this.usage=d,this}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}copy(d){return this.name=d.name,this.array=new d.array.constructor(d.array),this.itemSize=d.itemSize,this.count=d.count,this.normalized=d.normalized,this.usage=d.usage,this.gpuType=d.gpuType,this._normalizationScale=d._normalizationScale,this}copyAt(d,p,m){d*=this.itemSize,m*=p.itemSize;for(let g=0,_=this.itemSize;g<_;g++)this.array[d+g]=p.array[m+g];return this}copyArray(d){return this.array.set(d),this}applyMatrix3(d){if(this.itemSize===2)for(let p=0,m=this.count;p<m;p++)ro.fromBufferAttribute(this,p),ro.applyMatrix3(d),this.setXY(p,ro.x,ro.y);else if(this.itemSize===3)for(let p=0,m=this.count;p<m;p++)He.fromBufferAttribute(this,p),He.applyMatrix3(d),this.setXYZ(p,He.x,He.y,He.z);return this}applyMatrix4(d){for(let p=0,m=this.count;p<m;p++)He.fromBufferAttribute(this,p),He.applyMatrix4(d),this.setXYZ(p,He.x,He.y,He.z);return this}applyNormalMatrix(d){for(let p=0,m=this.count;p<m;p++)He.fromBufferAttribute(this,p),He.applyNormalMatrix(d),this.setXYZ(p,He.x,He.y,He.z);return this}transformDirection(d){for(let p=0,m=this.count;p<m;p++)He.fromBufferAttribute(this,p),He.transformDirection(d),this.setXYZ(p,He.x,He.y,He.z);return this}set(d,p=0){return this.array.set(d,p),this}getComponent(d,p){let m=this.array[d*this.itemSize+p];if(this.normalized)m=this._denormalize(m);return m}setComponent(d,p,m){if(this.normalized)m=this._normalize(m);return this.array[d*this.itemSize+p]=m,this}getX(d){let p=this.array[d*this.itemSize];if(this.normalized)p=this._denormalize(p);return p}setX(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize]=p,this}getY(d){let p=this.array[d*this.itemSize+1];if(this.normalized)p=this._denormalize(p);return p}setY(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+1]=p,this}getZ(d){let p=this.array[d*this.itemSize+2];if(this.normalized)p=this._denormalize(p);return p}setZ(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+2]=p,this}getW(d){let p=this.array[d*this.itemSize+3];if(this.normalized)p=this._denormalize(p);return p}setW(d,p){if(this.normalized)p=this._normalize(p);return this.array[d*this.itemSize+3]=p,this}setXY(d,p,m){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m);return this.array[d+0]=p,this.array[d+1]=m,this}setXYZ(d,p,m,g){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g);return this.array[d+0]=p,this.array[d+1]=m,this.array[d+2]=g,this}setXYZW(d,p,m,g,_){if(d*=this.itemSize,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.array[d+0]=p,this.array[d+1]=m,this.array[d+2]=g,this.array[d+3]=_,this}onUpload(d){return this.onUploadCallback=d,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let d={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return d.name=this.name,d.usage=this.usage,d.gpuType=this.gpuType,d}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(d){let p=this._normalizationScale;return p!==void 0?Math.max(d/p,-1):bc(d,this.array)}_normalize(d){let p=this._normalizationScale;return p!==void 0?Math.round(d*p):Ec(d,this.array)}}class Ho extends Ve{constructor(d,p,m){super(new Uint16Array(d),p,m)}}class Go extends Ve{constructor(d,p,m){super(new Uint32Array(d),p,m)}}class En extends Ve{constructor(d,p,m){super(new Float32Array(d),p,m)}}var Bm=new xe,or=new q,ll=new q;class yn{constructor(d=new q,p=-1){this.isSphere=!0,this.center=d,this.radius=p}set(d,p){return this.center.copy(d),this.radius=p,this}setFromPoints(d,p){let m=this.center;if(p!==void 0)m.copy(p);else Bm.setFromPoints(d).getCenter(m);let g=0;for(let _=0,x=d.length;_<x;_++)g=Math.max(g,m.distanceToSquared(d[_]));return this.radius=Math.sqrt(g),this}copy(d){return this.center.copy(d.center),this.radius=d.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(d){return d.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(d){return d.distanceTo(this.center)-this.radius}intersectsSphere(d){let p=this.radius+d.radius;return d.center.distanceToSquared(this.center)<=p*p}intersectsBox(d){return d.intersectsSphere(this)}intersectsPlane(d){return Math.abs(d.distanceToPoint(this.center))<=this.radius}clampPoint(d,p){let m=this.center.distanceToSquared(d);if(p.copy(d),m>this.radius*this.radius)p.sub(this.center).normalize(),p.multiplyScalar(this.radius).add(this.center);return p}getBoundingBox(d){if(this.isEmpty())return d.makeEmpty(),d;return d.set(this.center,this.center),d.expandByScalar(this.radius),d}applyMatrix4(d){return this.center.applyMatrix4(d),this.radius=this.radius*d.getMaxScaleOnAxis(),this}translate(d){return this.center.add(d),this}expandByPoint(d){if(this.isEmpty())return this.center.copy(d),this.radius=0,this;or.subVectors(d,this.center);let p=or.lengthSq();if(p>this.radius*this.radius){let m=Math.sqrt(p),g=(m-this.radius)*0.5;this.center.addScaledVector(or,g/m),this.radius+=g}return this}union(d){if(d.isEmpty())return this;if(this.isEmpty())return this.copy(d),this;if(this.center.equals(d.center)===!0)this.radius=Math.max(this.radius,d.radius);else ll.subVectors(d.center,this.center).setLength(d.radius),this.expandByPoint(or.copy(d.center).add(ll)),this.expandByPoint(or.copy(d.center).sub(ll));return this}equals(d){return d.center.equals(this.center)&&d.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(d){return this.radius=d.radius,this.center.fromArray(d.center),this}}var km=0,Pn=new ie,cl=new Xe,vs=new q,Cn=new xe,ar=new xe,je=new q;class Qe extends ui{constructor(){super();this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:km++}),this.uuid=Ri(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(d){if(Array.isArray(d))this.index=new((hm(d))?Go:Ho)(d,1);else this.index=d;return this}setIndirect(d,p=0){return this.indirect=d,this.indirectOffset=p,this}getIndirect(){return this.indirect}getAttribute(d){return this.attributes[d]}setAttribute(d,p){return this.attributes[d]=p,this}deleteAttribute(d){return delete this.attributes[d],this}hasAttribute(d){return this.attributes[d]!==void 0}addGroup(d,p,m=0){this.groups.push({start:d,count:p,materialIndex:m})}clearGroups(){this.groups=[]}setDrawRange(d,p){this.drawRange.start=d,this.drawRange.count=p}applyMatrix4(d){let p=this.attributes.position;if(p!==void 0)p.applyMatrix4(d),p.needsUpdate=!0;let m=this.attributes.normal;if(m!==void 0){let _=new Kt().getNormalMatrix(d);m.applyNormalMatrix(_),m.needsUpdate=!0}let g=this.attributes.tangent;if(g!==void 0)g.transformDirection(d),g.needsUpdate=!0;if(this.boundingBox!==null)this.computeBoundingBox();if(this.boundingSphere!==null)this.computeBoundingSphere();return this._transformed=!0,this}applyQuaternion(d){return Pn.makeRotationFromQuaternion(d),this.applyMatrix4(Pn),this}rotateX(d){return Pn.makeRotationX(d),this.applyMatrix4(Pn),this}rotateY(d){return Pn.makeRotationY(d),this.applyMatrix4(Pn),this}rotateZ(d){return Pn.makeRotationZ(d),this.applyMatrix4(Pn),this}translate(d,p,m){return Pn.makeTranslation(d,p,m),this.applyMatrix4(Pn),this}scale(d,p,m){return Pn.makeScale(d,p,m),this.applyMatrix4(Pn),this}lookAt(d){return cl.lookAt(d),cl.updateMatrix(),this.applyMatrix4(cl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(vs).negate(),this.translate(vs.x,vs.y,vs.z),this}setFromPoints(d){let p=this.getAttribute("position");if(p===void 0){let m=[];for(let g=0,_=d.length;g<_;g++){let x=d[g];m.push(x.x,x.y,x.z||0)}this.setAttribute("position",new En(m,3))}else{let m=Math.min(d.length,p.count);for(let g=0;g<m;g++){let _=d[g];p.setXYZ(g,_.x,_.y,_.z||0)}if(d.length>p.count)Xt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.");p.needsUpdate=!0}return this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new xe;let d=this.attributes.position,p=this.morphAttributes.position;if(d&&d.isGLBufferAttribute){$t("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new q(-1/0,-1/0,-1/0),new q(1/0,1/0,1/0));return}if(d!==void 0){if(this.boundingBox.setFromBufferAttribute(d),p)for(let m=0,g=p.length;m<g;m++){let _=p[m];if(Cn.setFromBufferAttribute(_),this.morphTargetsRelative)je.addVectors(this.boundingBox.min,Cn.min),this.boundingBox.expandByPoint(je),je.addVectors(this.boundingBox.max,Cn.max),this.boundingBox.expandByPoint(je);else this.boundingBox.expandByPoint(Cn.min),this.boundingBox.expandByPoint(Cn.max)}}else this.boundingBox.makeEmpty();if(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))$t('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new yn;let d=this.attributes.position,p=this.morphAttributes.position;if(d&&d.isGLBufferAttribute){$t("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new q,1/0);return}if(d){let m=this.boundingSphere.center;if(Cn.setFromBufferAttribute(d),p)for(let _=0,x=p.length;_<x;_++){let v=p[_];if(ar.setFromBufferAttribute(v),this.morphTargetsRelative)je.addVectors(Cn.min,ar.min),Cn.expandByPoint(je),je.addVectors(Cn.max,ar.max),Cn.expandByPoint(je);else Cn.expandByPoint(ar.min),Cn.expandByPoint(ar.max)}Cn.getCenter(m);let g=0;for(let _=0,x=d.count;_<x;_++)je.fromBufferAttribute(d,_),g=Math.max(g,m.distanceToSquared(je));if(p)for(let _=0,x=p.length;_<x;_++){let v=p[_],y=this.morphTargetsRelative;for(let S=0,M=v.count;S<M;S++){if(je.fromBufferAttribute(v,S),y)vs.fromBufferAttribute(d,S),je.add(vs);g=Math.max(g,m.distanceToSquared(je))}}if(this.boundingSphere.radius=Math.sqrt(g),isNaN(this.boundingSphere.radius))$t('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let d=this.index,p=this.attributes;if(d===null||p.position===void 0||p.normal===void 0||p.uv===void 0){$t("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let{position:m,normal:g,uv:_}=p,x=this.getAttribute("tangent");if(x===void 0||x.count!==m.count)x=new Ve(new Float32Array(4*m.count),4),this.setAttribute("tangent",x);let v=[],y=[],S=new Uint8Array(m.count);for(let D=0;D<m.count;D++)v[D]=new q,y[D]=new q;let M=new q,E=new q,T=new q,b=new Jt,w=new Jt,C=new Jt,N=new q,A=new q;function R(D,z,W){S[D]=S[z]=S[W]=1,M.fromBufferAttribute(m,D),E.fromBufferAttribute(m,z),T.fromBufferAttribute(m,W),b.fromBufferAttribute(_,D),w.fromBufferAttribute(_,z),C.fromBufferAttribute(_,W),E.sub(M),T.sub(M),w.sub(b),C.sub(b);let H=1/(w.x*C.y-C.x*w.y);if(!isFinite(H))return;N.copy(E).multiplyScalar(C.y).addScaledVector(T,-w.y).multiplyScalar(H),A.copy(T).multiplyScalar(w.x).addScaledVector(E,-C.x).multiplyScalar(H),v[D].add(N),v[z].add(N),v[W].add(N),y[D].add(A),y[z].add(A),y[W].add(A)}let P=this.groups;if(P.length===0)P=[{start:0,count:d.count}];for(let D=0,z=P.length;D<z;++D){let W=P[D],{start:H,count:X}=W;for(let J=H,G=H+X;J<G;J+=3)R(d.getX(J+0),d.getX(J+1),d.getX(J+2))}let F=new q,L=new q,U=new q,k=new q;function I(D){U.fromBufferAttribute(g,D),k.copy(U);let z=v[D];F.copy(z),F.sub(U.multiplyScalar(U.dot(z))).normalize(),L.crossVectors(k,z);let H=L.dot(y[D])<0?-1:1;x.setXYZW(D,F.x,F.y,F.z,H)}for(let D=0,z=m.count;D<z;++D)if(S[D])I(D);this._transformed=!0}computeVertexNormals(){let d=this.index,p=this.getAttribute("position");if(p!==void 0){let m=this.getAttribute("normal");if(m===void 0||m.count!==p.count)m=new Ve(new Float32Array(p.count*3),3),this.setAttribute("normal",m);else for(let T=0,b=m.count;T<b;T++)m.setXYZ(T,0,0,0);let g=new q,_=new q,x=new q,v=new q,y=new q,S=new q,M=new q,E=new q;if(d)for(let T=0,b=d.count;T<b;T+=3){let w=d.getX(T+0),C=d.getX(T+1),N=d.getX(T+2);g.fromBufferAttribute(p,w),_.fromBufferAttribute(p,C),x.fromBufferAttribute(p,N),M.subVectors(x,_),E.subVectors(g,_),M.cross(E),v.fromBufferAttribute(m,w),y.fromBufferAttribute(m,C),S.fromBufferAttribute(m,N),v.add(M),y.add(M),S.add(M),m.setXYZ(w,v.x,v.y,v.z),m.setXYZ(C,y.x,y.y,y.z),m.setXYZ(N,S.x,S.y,S.z)}else for(let T=0,b=p.count;T<b;T+=3)g.fromBufferAttribute(p,T+0),_.fromBufferAttribute(p,T+1),x.fromBufferAttribute(p,T+2),M.subVectors(x,_),E.subVectors(g,_),M.cross(E),m.setXYZ(T+0,M.x,M.y,M.z),m.setXYZ(T+1,M.x,M.y,M.z),m.setXYZ(T+2,M.x,M.y,M.z);this.normalizeNormals(),m.needsUpdate=!0}}normalizeNormals(){let d=this.attributes.normal;for(let p=0,m=d.count;p<m;p++)je.fromBufferAttribute(d,p),je.normalize(),d.setXYZ(p,je.x,je.y,je.z)}toNonIndexed(){function d(v,y){let{array:S,itemSize:M,normalized:E}=v,T=new S.constructor(y.length*M),b=0,w=0;for(let C=0,N=y.length;C<N;C++){if(v.isInterleavedBufferAttribute)b=y[C]*v.data.stride+v.offset;else b=y[C]*M;for(let A=0;A<M;A++)T[w++]=S[b++]}return new Ve(T,M,E)}if(this.index===null)return Xt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let p=new Qe,m=this.index.array,g=this.attributes;for(let v in g){let y=g[v],S=d(y,m);p.setAttribute(v,S)}let _=this.morphAttributes;for(let v in _){let y=[],S=_[v];for(let M=0,E=S.length;M<E;M++){let T=S[M],b=d(T,m);y.push(b)}p.morphAttributes[v]=y}p.morphTargetsRelative=this.morphTargetsRelative;let x=this.groups;for(let v=0,y=x.length;v<y;v++){let S=x[v];p.addGroup(S.start,S.count,S.materialIndex)}return p}toJSON(){let d={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(d.uuid=this.uuid,d.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,d.name=this.name,Object.keys(this.userData).length>0)d.userData=this.userData;if(this.parameters!==void 0&&this._transformed!==!0){let y=this.parameters;for(let S in y)if(y[S]!==void 0)d[S]=y[S];return d}d.data={attributes:{}};let p=this.index;if(p!==null)d.data.index={type:p.array.constructor.name,array:Array.prototype.slice.call(p.array)};let m=this.attributes;for(let y in m){let S=m[y];d.data.attributes[y]=S.toJSON(d.data)}let g={},_=!1;for(let y in this.morphAttributes){let S=this.morphAttributes[y],M=[];for(let E=0,T=S.length;E<T;E++){let b=S[E];M.push(b.toJSON(d.data))}if(M.length>0)g[y]=M,_=!0}if(_)d.data.morphAttributes=g,d.data.morphTargetsRelative=this.morphTargetsRelative;let x=this.groups;if(x.length>0)d.data.groups=JSON.parse(JSON.stringify(x));let v=this.boundingSphere;if(v!==null)d.data.boundingSphere=v.toJSON();return d}clone(){return new this.constructor().copy(this)}copy(d){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let p={};this.name=d.name;let m=d.index;if(m!==null)this.setIndex(m.clone());let g=d.attributes;for(let S in g){let M=g[S];this.setAttribute(S,M.clone(p))}let _=d.morphAttributes;for(let S in _){let M=[],E=_[S];for(let T=0,b=E.length;T<b;T++)M.push(E[T].clone(p));this.morphAttributes[S]=M}this.morphTargetsRelative=d.morphTargetsRelative;let x=d.groups;for(let S=0,M=x.length;S<M;S++){let E=x[S];this.addGroup(E.start,E.count,E.materialIndex)}let v=d.boundingBox;if(v!==null)this.boundingBox=v.clone();let y=d.boundingSphere;if(y!==null)this.boundingSphere=y.clone();return this.drawRange.start=d.drawRange.start,this.drawRange.count=d.drawRange.count,this.userData=d.userData,this._transformed=d._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Vo{constructor(d,p){this.isInterleavedBuffer=!0,this.array=d,this.stride=p,this.count=d!==void 0?d.length/p:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Ri()}onUploadCallback(){}set needsUpdate(d){if(d===!0)this.version++}setUsage(d){return this.usage=d,this}addUpdateRange(d,p){this.updateRanges.push({start:d,count:p})}clearUpdateRanges(){this.updateRanges.length=0}copy(d){return this.array=new d.array.constructor(d.array),this.count=d.count,this.stride=d.stride,this.usage=d.usage,this}copyAt(d,p,m){d*=this.stride,m*=p.stride;for(let g=0,_=this.stride;g<_;g++)this.array[d+g]=p.array[m+g];return this}set(d,p=0){return this.array.set(d,p),this}clone(d){if(d.arrayBuffers===void 0)d.arrayBuffers={};let p=_u(this.array);if(d.arrayBuffers[p]===void 0)d.arrayBuffers[p]=this.array.slice(0).buffer;let m=new this.array.constructor(d.arrayBuffers[p]),g=new this.constructor(m,this.stride);return g.setUsage(this.usage),g}onUpload(d){return this.onUploadCallback=d,this}toJSON(d){if(d.arrayBuffers===void 0)d.arrayBuffers={};let p=_u(this.array);if(d.arrayBuffers[p]===void 0)d.arrayBuffers[p]=Array.from(new Uint32Array(this.array.slice(0).buffer));let m={uuid:this.uuid,buffer:p,type:this.array.constructor.name,stride:this.stride};return m.usage=this.usage,m}}function _u(d){if(d.buffer._uuid===void 0)d.buffer._uuid=Ri();if(d.byteOffset===0&&d.byteLength===d.buffer.byteLength)return d.buffer._uuid;return d.buffer._uuid+":"+d.byteOffset+":"+d.byteLength}var vn=new q;class ji{constructor(d,p,m,g=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=d,this.itemSize=p,this.offset=m,this.normalized=g,this._normalizationScale=d!==void 0?Bo(d.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(d){this.data.needsUpdate=d}applyMatrix4(d){for(let p=0,m=this.data.count;p<m;p++)vn.fromBufferAttribute(this,p),vn.applyMatrix4(d),this.setXYZ(p,vn.x,vn.y,vn.z);return this}applyNormalMatrix(d){for(let p=0,m=this.count;p<m;p++)vn.fromBufferAttribute(this,p),vn.applyNormalMatrix(d),this.setXYZ(p,vn.x,vn.y,vn.z);return this}transformDirection(d){for(let p=0,m=this.count;p<m;p++)vn.fromBufferAttribute(this,p),vn.transformDirection(d),this.setXYZ(p,vn.x,vn.y,vn.z);return this}getComponent(d,p){let m=this.array[d*this.data.stride+this.offset+p];if(this.normalized)m=this._denormalize(m);return m}setComponent(d,p,m){if(this.normalized)m=this._normalize(m);return this.data.array[d*this.data.stride+this.offset+p]=m,this}setX(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset]=p,this}setY(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+1]=p,this}setZ(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+2]=p,this}setW(d,p){if(this.normalized)p=this._normalize(p);return this.data.array[d*this.data.stride+this.offset+3]=p,this}getX(d){let p=this.data.array[d*this.data.stride+this.offset];if(this.normalized)p=this._denormalize(p);return p}getY(d){let p=this.data.array[d*this.data.stride+this.offset+1];if(this.normalized)p=this._denormalize(p);return p}getZ(d){let p=this.data.array[d*this.data.stride+this.offset+2];if(this.normalized)p=this._denormalize(p);return p}getW(d){let p=this.data.array[d*this.data.stride+this.offset+3];if(this.normalized)p=this._denormalize(p);return p}setXY(d,p,m){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m);return this.data.array[d+0]=p,this.data.array[d+1]=m,this}setXYZ(d,p,m,g){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g);return this.data.array[d+0]=p,this.data.array[d+1]=m,this.data.array[d+2]=g,this}setXYZW(d,p,m,g,_){if(d=d*this.data.stride+this.offset,this.normalized)p=this._normalize(p),m=this._normalize(m),g=this._normalize(g),_=this._normalize(_);return this.data.array[d+0]=p,this.data.array[d+1]=m,this.data.array[d+2]=g,this.data.array[d+3]=_,this}clone(d){if(d===void 0){fr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let p=[];for(let m=0;m<this.count;m++){let g=m*this.data.stride+this.offset;for(let _=0;_<this.itemSize;_++)p.push(this.data.array[g+_])}return new Ve(new this.array.constructor(p),this.itemSize,this.normalized)}else{if(d.interleavedBuffers===void 0)d.interleavedBuffers={};if(d.interleavedBuffers[this.data.uuid]===void 0)d.interleavedBuffers[this.data.uuid]=this.data.clone(d);return new ji(d.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}}toJSON(d){if(d===void 0){fr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let p=[];for(let m=0;m<this.count;m++){let g=m*this.data.stride+this.offset;for(let _=0;_<this.itemSize;_++)p.push(this.data.array[g+_])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:p,normalized:this.normalized}}else{if(d.interleavedBuffers===void 0)d.interleavedBuffers={};if(d.interleavedBuffers[this.data.uuid]===void 0)d.interleavedBuffers[this.data.uuid]=this.data.toJSON(d);return{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}_denormalize(d){let p=this._normalizationScale;return p!==void 0?Math.max(d/p,-1):bc(d,this.data.array)}_normalize(d){let p=this._normalizationScale;return p!==void 0?Math.round(d*p):Ec(d,this.data.array)}}var hl=new q,zm=new q,Hm=new Kt;class un{constructor(d=new q(1,0,0),p=0){this.isPlane=!0,this.normal=d,this.constant=p}set(d,p){return this.normal.copy(d),this.constant=p,this}setComponents(d,p,m,g){return this.normal.set(d,p,m),this.constant=g,this}setFromNormalAndCoplanarPoint(d,p){return this.normal.copy(d),this.constant=-p.dot(this.normal),this}setFromCoplanarPoints(d,p,m){let g=hl.subVectors(m,p).cross(zm.subVectors(d,p)).normalize();return this.setFromNormalAndCoplanarPoint(g,d),this}copy(d){return this.normal.copy(d.normal),this.constant=d.constant,this}normalize(){let d=1/this.normal.length();return this.normal.multiplyScalar(d),this.constant*=d,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(d){return this.normal.dot(d)+this.constant}distanceToSphere(d){return this.distanceToPoint(d.center)-d.radius}projectPoint(d,p){return p.copy(d).addScaledVector(this.normal,-this.distanceToPoint(d))}intersectLine(d,p,m=!0){let g=d.delta(hl),_=this.normal.dot(g);if(_===0){if(this.distanceToPoint(d.start)===0)return p.copy(d.start);return null}let x=-(d.start.dot(this.normal)+this.constant)/_;if(m===!0&&(x<0||x>1))return null;return p.copy(d.start).addScaledVector(g,x)}intersectsLine(d){let p=this.distanceToPoint(d.start),m=this.distanceToPoint(d.end);return p<0&&m>0||m<0&&p>0}intersectsBox(d){return d.intersectsPlane(this)}intersectsSphere(d){return d.intersectsPlane(this)}coplanarPoint(d){return d.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(d,p){let m=p||Hm.getNormalMatrix(d),g=this.coplanarPoint(hl).applyMatrix4(d),_=this.normal.applyMatrix3(m).normalize();return this.constant=-g.dot(_),this}translate(d){return this.constant-=d.dot(this.normal),this}equals(d){return d.normal.equals(this.normal)&&d.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(d){return this.normal.fromArray(d.normal),this.constant=d.constant,this}}var Gm=0;class fi extends ui{constructor(){super();this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gm++}),this.uuid=Ri(),this.name="",this.type="Material",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new se(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(d){if(this._alphaTest>0!==d>0)this.version++;this._alphaTest=d}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(d){if(d===void 0)return;for(let p in d){let m=d[p];if(m===void 0){Xt(`Material: parameter '${p}' has value of undefined.`);continue}let g=this[p];if(g===void 0){Xt(`Material: '${p}' is not a property of THREE.${this.type}.`);continue}if(g&&g.isColor)g.set(m);else if(g&&g.isVector2&&(m&&m.isVector2)||g&&g.isEuler&&(m&&m.isEuler)||g&&g.isVector3&&(m&&m.isVector3))g.copy(m);else this[p]=m}}toJSON(d){let p=d===void 0||typeof d==="string";if(p)d={textures:{},images:{}};let m={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};if(m.uuid=this.uuid,m.type=this.type,m.blending=this.blending,m.side=this.side,m.shadowSide=this.shadowSide,m.vertexColors=this.vertexColors,m.opacity=this.opacity,m.transparent=this.transparent,m.blendSrc=this.blendSrc,m.blendDst=this.blendDst,m.blendEquation=this.blendEquation,m.blendSrcAlpha=this.blendSrcAlpha,m.blendDstAlpha=this.blendDstAlpha,m.blendEquationAlpha=this.blendEquationAlpha,m.blendColor=this.blendColor.getHex(),m.blendAlpha=this.blendAlpha,m.depthFunc=this.depthFunc,m.depthTest=this.depthTest,m.depthWrite=this.depthWrite,m.colorWrite=this.colorWrite,m.clipIntersection=this.clipIntersection,m.clipShadows=this.clipShadows,m.stencilWriteMask=this.stencilWriteMask,m.stencilFunc=this.stencilFunc,m.stencilRef=this.stencilRef,m.stencilFuncMask=this.stencilFuncMask,m.stencilFail=this.stencilFail,m.stencilZFail=this.stencilZFail,m.stencilZPass=this.stencilZPass,m.stencilWrite=this.stencilWrite,m.polygonOffset=this.polygonOffset,m.polygonOffsetFactor=this.polygonOffsetFactor,m.polygonOffsetUnits=this.polygonOffsetUnits,m.dithering=this.dithering,m.alphaTest=this.alphaTest,m.alphaHash=this.alphaHash,m.alphaToCoverage=this.alphaToCoverage,m.premultipliedAlpha=this.premultipliedAlpha,m.forceSinglePass=this.forceSinglePass,m.allowOverride=this.allowOverride,m.visible=this.visible,m.toneMapped=this.toneMapped,m.name=this.name,this.color&&this.color.isColor)m.color=this.color.getHex();if(this.roughness!==void 0)m.roughness=this.roughness;if(this.metalness!==void 0)m.metalness=this.metalness;if(this.sheen!==void 0)m.sheen=this.sheen;if(this.sheenColor&&this.sheenColor.isColor)m.sheenColor=this.sheenColor.getHex();if(this.sheenRoughness!==void 0)m.sheenRoughness=this.sheenRoughness;if(this.emissive&&this.emissive.isColor)m.emissive=this.emissive.getHex();if(this.emissiveIntensity!==void 0)m.emissiveIntensity=this.emissiveIntensity;if(this.specular&&this.specular.isColor)m.specular=this.specular.getHex();if(this.specularIntensity!==void 0)m.specularIntensity=this.specularIntensity;if(this.specularColor&&this.specularColor.isColor)m.specularColor=this.specularColor.getHex();if(this.shininess!==void 0)m.shininess=this.shininess;if(this.clearcoat!==void 0)m.clearcoat=this.clearcoat;if(this.clearcoatRoughness!==void 0)m.clearcoatRoughness=this.clearcoatRoughness;if(this.diffuseRoughness!==void 0)m.diffuseRoughness=this.diffuseRoughness;if(this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture)m.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(d).uuid;if(this.clearcoatMap&&this.clearcoatMap.isTexture)m.clearcoatMap=this.clearcoatMap.toJSON(d).uuid;if(this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture)m.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(d).uuid;if(this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture)m.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(d).uuid,m.clearcoatNormalScale=this.clearcoatNormalScale.toArray();if(this.sheenColorMap&&this.sheenColorMap.isTexture)m.sheenColorMap=this.sheenColorMap.toJSON(d).uuid;if(this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture)m.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(d).uuid;if(this.dispersion!==void 0)m.dispersion=this.dispersion;if(this.retroreflectivity!==void 0)m.retroreflectivity=this.retroreflectivity;if(this.iridescence!==void 0)m.iridescence=this.iridescence;if(this.iridescenceIOR!==void 0)m.iridescenceIOR=this.iridescenceIOR;if(this.iridescenceThicknessMinimum!==void 0)m.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum;if(this.iridescenceThicknessMaximum!==void 0)m.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum;if(this.iridescenceMap&&this.iridescenceMap.isTexture)m.iridescenceMap=this.iridescenceMap.toJSON(d).uuid;if(this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture)m.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(d).uuid;if(this.anisotropy!==void 0)m.anisotropy=this.anisotropy;if(this.anisotropyRotation!==void 0)m.anisotropyRotation=this.anisotropyRotation;if(this.anisotropyMap&&this.anisotropyMap.isTexture)m.anisotropyMap=this.anisotropyMap.toJSON(d).uuid;if(this.map&&this.map.isTexture)m.map=this.map.toJSON(d).uuid;if(this.matcap&&this.matcap.isTexture)m.matcap=this.matcap.toJSON(d).uuid;if(this.alphaMap&&this.alphaMap.isTexture)m.alphaMap=this.alphaMap.toJSON(d).uuid;if(this.lightMap&&this.lightMap.isTexture)m.lightMap=this.lightMap.toJSON(d).uuid,m.lightMapIntensity=this.lightMapIntensity;if(this.aoMap&&this.aoMap.isTexture)m.aoMap=this.aoMap.toJSON(d).uuid,m.aoMapIntensity=this.aoMapIntensity;if(this.bumpMap&&this.bumpMap.isTexture)m.bumpMap=this.bumpMap.toJSON(d).uuid,m.bumpScale=this.bumpScale;if(this.normalMap&&this.normalMap.isTexture)m.normalMap=this.normalMap.toJSON(d).uuid,m.normalMapType=this.normalMapType,m.normalScale=this.normalScale.toArray();if(this.displacementMap&&this.displacementMap.isTexture)m.displacementMap=this.displacementMap.toJSON(d).uuid,m.displacementScale=this.displacementScale,m.displacementBias=this.displacementBias;if(this.roughnessMap&&this.roughnessMap.isTexture)m.roughnessMap=this.roughnessMap.toJSON(d).uuid;if(this.metalnessMap&&this.metalnessMap.isTexture)m.metalnessMap=this.metalnessMap.toJSON(d).uuid;if(this.emissiveMap&&this.emissiveMap.isTexture)m.emissiveMap=this.emissiveMap.toJSON(d).uuid;if(this.specularMap&&this.specularMap.isTexture)m.specularMap=this.specularMap.toJSON(d).uuid;if(this.specularIntensityMap&&this.specularIntensityMap.isTexture)m.specularIntensityMap=this.specularIntensityMap.toJSON(d).uuid;if(this.specularColorMap&&this.specularColorMap.isTexture)m.specularColorMap=this.specularColorMap.toJSON(d).uuid;if(this.envMap&&this.envMap.isTexture){if(m.envMap=this.envMap.toJSON(d).uuid,this.combine!==void 0)m.combine=this.combine}if(this.envMapRotation!==void 0)m.envMapRotation=this.envMapRotation.toArray();if(this.envMapIntensity!==void 0)m.envMapIntensity=this.envMapIntensity;if(this.reflectivity!==void 0)m.reflectivity=this.reflectivity;if(this.refractionRatio!==void 0)m.refractionRatio=this.refractionRatio;if(this.gradientMap&&this.gradientMap.isTexture)m.gradientMap=this.gradientMap.toJSON(d).uuid;if(this.transmission!==void 0)m.transmission=this.transmission;if(this.transmissionMap&&this.transmissionMap.isTexture)m.transmissionMap=this.transmissionMap.toJSON(d).uuid;if(this.thickness!==void 0)m.thickness=this.thickness;if(this.thicknessMap&&this.thicknessMap.isTexture)m.thicknessMap=this.thicknessMap.toJSON(d).uuid;if(this.attenuationDistance!==void 0)m.attenuationDistance=this.attenuationDistance;if(this.attenuationColor!==void 0)m.attenuationColor=this.attenuationColor.getHex();if(this.size!==void 0)m.size=this.size;if(this.sizeAttenuation!==void 0)m.sizeAttenuation=this.sizeAttenuation;if(Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0)m.clippingPlanes=this.clippingPlanes.map((_)=>_.toJSON());if(this.rotation!==void 0)m.rotation=this.rotation;if(this.depthPacking!==void 0)m.depthPacking=this.depthPacking;if(this.linewidth!==void 0)m.linewidth=this.linewidth;if(this.linecap!==void 0)m.linecap=this.linecap;if(this.linejoin!==void 0)m.linejoin=this.linejoin;if(this.dashSize!==void 0)m.dashSize=this.dashSize;if(this.gapSize!==void 0)m.gapSize=this.gapSize;if(this.scale!==void 0)m.scale=this.scale;if(this.wireframe!==void 0)m.wireframe=this.wireframe;if(this.wireframeLinewidth!==void 0)m.wireframeLinewidth=this.wireframeLinewidth;if(this.wireframeLinecap!==void 0)m.wireframeLinecap=this.wireframeLinecap;if(this.wireframeLinejoin!==void 0)m.wireframeLinejoin=this.wireframeLinejoin;if(this.flatShading!==void 0)m.flatShading=this.flatShading;if(this.fog!==void 0)m.fog=this.fog;if(Object.keys(this.userData).length>0)m.userData=this.userData;function g(_){let x=[];for(let v in _){let y=_[v];delete y.metadata,x.push(y)}return x}if(p){let _=g(d.textures),x=g(d.images);if(_.length>0)m.textures=_;if(x.length>0)m.images=x}return m}fromJSON(d,p){if(d.uuid!==void 0)this.uuid=d.uuid;if(d.name!==void 0)this.name=d.name;if(d.color!==void 0&&this.color!==void 0)this.color.setHex(d.color);if(d.roughness!==void 0)this.roughness=d.roughness;if(d.metalness!==void 0)this.metalness=d.metalness;if(d.sheen!==void 0)this.sheen=d.sheen;if(d.sheenColor!==void 0)this.sheenColor=new se().setHex(d.sheenColor);if(d.sheenRoughness!==void 0)this.sheenRoughness=d.sheenRoughness;if(d.emissive!==void 0&&this.emissive!==void 0)this.emissive.setHex(d.emissive);if(d.specular!==void 0&&this.specular!==void 0)this.specular.setHex(d.specular);if(d.specularIntensity!==void 0)this.specularIntensity=d.specularIntensity;if(d.specularColor!==void 0&&this.specularColor!==void 0)this.specularColor.setHex(d.specularColor);if(d.shininess!==void 0)this.shininess=d.shininess;if(d.clearcoat!==void 0)this.clearcoat=d.clearcoat;if(d.clearcoatRoughness!==void 0)this.clearcoatRoughness=d.clearcoatRoughness;if(d.diffuseRoughness!==void 0)this.diffuseRoughness=d.diffuseRoughness;if(d.dispersion!==void 0)this.dispersion=d.dispersion;if(d.retroreflectivity!==void 0)this.retroreflectivity=d.retroreflectivity;if(d.iridescence!==void 0)this.iridescence=d.iridescence;if(d.iridescenceIOR!==void 0)this.iridescenceIOR=d.iridescenceIOR;if(d.iridescenceThicknessMinimum!==void 0)this.iridescenceThicknessMinimum=d.iridescenceThicknessMinimum;if(d.iridescenceThicknessMaximum!==void 0)this.iridescenceThicknessMaximum=d.iridescenceThicknessMaximum;if(d.iridescenceThicknessRange!==void 0)this.iridescenceThicknessMinimum=d.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=d.iridescenceThicknessRange[1];if(d.transmission!==void 0)this.transmission=d.transmission;if(d.thickness!==void 0)this.thickness=d.thickness;if(d.attenuationDistance!==void 0)this.attenuationDistance=d.attenuationDistance;if(d.attenuationColor!==void 0&&this.attenuationColor!==void 0)this.attenuationColor.setHex(d.attenuationColor);if(d.anisotropy!==void 0)this.anisotropy=d.anisotropy;if(d.anisotropyRotation!==void 0)this.anisotropyRotation=d.anisotropyRotation;if(d.fog!==void 0)this.fog=d.fog;if(d.flatShading!==void 0)this.flatShading=d.flatShading;if(d.blending!==void 0)this.blending=d.blending;if(d.combine!==void 0)this.combine=d.combine;if(d.side!==void 0)this.side=d.side;if(d.shadowSide!==void 0)this.shadowSide=d.shadowSide;if(d.opacity!==void 0)this.opacity=d.opacity;if(d.transparent!==void 0)this.transparent=d.transparent;if(d.alphaTest!==void 0)this.alphaTest=d.alphaTest;if(d.alphaHash!==void 0)this.alphaHash=d.alphaHash;if(d.depthFunc!==void 0)this.depthFunc=d.depthFunc;if(d.depthTest!==void 0)this.depthTest=d.depthTest;if(d.depthWrite!==void 0)this.depthWrite=d.depthWrite;if(d.colorWrite!==void 0)this.colorWrite=d.colorWrite;if(d.clippingPlanes!==void 0)this.clippingPlanes=d.clippingPlanes.map((m)=>new un().fromJSON(m));if(d.clipIntersection!==void 0)this.clipIntersection=d.clipIntersection;if(d.clipShadows!==void 0)this.clipShadows=d.clipShadows;if(d.depthPacking!==void 0)this.depthPacking=d.depthPacking;if(d.blendSrc!==void 0)this.blendSrc=d.blendSrc;if(d.blendDst!==void 0)this.blendDst=d.blendDst;if(d.blendEquation!==void 0)this.blendEquation=d.blendEquation;if(d.blendSrcAlpha!==void 0)this.blendSrcAlpha=d.blendSrcAlpha;if(d.blendDstAlpha!==void 0)this.blendDstAlpha=d.blendDstAlpha;if(d.blendEquationAlpha!==void 0)this.blendEquationAlpha=d.blendEquationAlpha;if(d.blendColor!==void 0&&this.blendColor!==void 0)this.blendColor.setHex(d.blendColor);if(d.blendAlpha!==void 0)this.blendAlpha=d.blendAlpha;if(d.stencilWriteMask!==void 0)this.stencilWriteMask=d.stencilWriteMask;if(d.stencilFunc!==void 0)this.stencilFunc=d.stencilFunc;if(d.stencilRef!==void 0)this.stencilRef=d.stencilRef;if(d.stencilFuncMask!==void 0)this.stencilFuncMask=d.stencilFuncMask;if(d.stencilFail!==void 0)this.stencilFail=d.stencilFail;if(d.stencilZFail!==void 0)this.stencilZFail=d.stencilZFail;if(d.stencilZPass!==void 0)this.stencilZPass=d.stencilZPass;if(d.stencilWrite!==void 0)this.stencilWrite=d.stencilWrite;if(d.wireframe!==void 0)this.wireframe=d.wireframe;if(d.wireframeLinewidth!==void 0)this.wireframeLinewidth=d.wireframeLinewidth;if(d.wireframeLinecap!==void 0)this.wireframeLinecap=d.wireframeLinecap;if(d.wireframeLinejoin!==void 0)this.wireframeLinejoin=d.wireframeLinejoin;if(d.rotation!==void 0)this.rotation=d.rotation;if(d.linewidth!==void 0)this.linewidth=d.linewidth;if(d.linecap!==void 0)this.linecap=d.linecap;if(d.linejoin!==void 0)this.linejoin=d.linejoin;if(d.dashSize!==void 0)this.dashSize=d.dashSize;if(d.gapSize!==void 0)this.gapSize=d.gapSize;if(d.scale!==void 0)this.scale=d.scale;if(d.polygonOffset!==void 0)this.polygonOffset=d.polygonOffset;if(d.polygonOffsetFactor!==void 0)this.polygonOffsetFactor=d.polygonOffsetFactor;if(d.polygonOffsetUnits!==void 0)this.polygonOffsetUnits=d.polygonOffsetUnits;if(d.dithering!==void 0)this.dithering=d.dithering;if(d.alphaToCoverage!==void 0)this.alphaToCoverage=d.alphaToCoverage;if(d.premultipliedAlpha!==void 0)this.premultipliedAlpha=d.premultipliedAlpha;if(d.forceSinglePass!==void 0)this.forceSinglePass=d.forceSinglePass;if(d.allowOverride!==void 0)this.allowOverride=d.allowOverride;if(d.visible!==void 0)this.visible=d.visible;if(d.toneMapped!==void 0)this.toneMapped=d.toneMapped;if(d.userData!==void 0)this.userData=d.userData;if(d.vertexColors!==void 0)if(typeof d.vertexColors==="number")this.vertexColors=d.vertexColors>0;else this.vertexColors=d.vertexColors;if(d.size!==void 0)this.size=d.size;if(d.sizeAttenuation!==void 0)this.sizeAttenuation=d.sizeAttenuation;if(d.map!==void 0)this.map=p[d.map]||null;if(d.matcap!==void 0)this.matcap=p[d.matcap]||null;if(d.alphaMap!==void 0)this.alphaMap=p[d.alphaMap]||null;if(d.bumpMap!==void 0)this.bumpMap=p[d.bumpMap]||null;if(d.bumpScale!==void 0)this.bumpScale=d.bumpScale;if(d.normalMap!==void 0)this.normalMap=p[d.normalMap]||null;if(d.normalMapType!==void 0)this.normalMapType=d.normalMapType;if(d.normalScale!==void 0){let m=d.normalScale;if(Array.isArray(m)===!1)m=[m,m];this.normalScale=new Jt().fromArray(m)}if(d.displacementMap!==void 0)this.displacementMap=p[d.displacementMap]||null;if(d.displacementScale!==void 0)this.displacementScale=d.displacementScale;if(d.displacementBias!==void 0)this.displacementBias=d.displacementBias;if(d.roughnessMap!==void 0)this.roughnessMap=p[d.roughnessMap]||null;if(d.metalnessMap!==void 0)this.metalnessMap=p[d.metalnessMap]||null;if(d.emissiveMap!==void 0)this.emissiveMap=p[d.emissiveMap]||null;if(d.emissiveIntensity!==void 0)this.emissiveIntensity=d.emissiveIntensity;if(d.specularMap!==void 0)this.specularMap=p[d.specularMap]||null;if(d.specularIntensityMap!==void 0)this.specularIntensityMap=p[d.specularIntensityMap]||null;if(d.specularColorMap!==void 0)this.specularColorMap=p[d.specularColorMap]||null;if(d.envMap!==void 0)this.envMap=p[d.envMap]||null;if(d.envMapRotation!==void 0)this.envMapRotation.fromArray(d.envMapRotation);if(d.envMapIntensity!==void 0)this.envMapIntensity=d.envMapIntensity;if(d.reflectivity!==void 0)this.reflectivity=d.reflectivity;if(d.refractionRatio!==void 0)this.refractionRatio=d.refractionRatio;if(d.lightMap!==void 0)this.lightMap=p[d.lightMap]||null;if(d.lightMapIntensity!==void 0)this.lightMapIntensity=d.lightMapIntensity;if(d.aoMap!==void 0)this.aoMap=p[d.aoMap]||null;if(d.aoMapIntensity!==void 0)this.aoMapIntensity=d.aoMapIntensity;if(d.gradientMap!==void 0)this.gradientMap=p[d.gradientMap]||null;if(d.clearcoatMap!==void 0)this.clearcoatMap=p[d.clearcoatMap]||null;if(d.clearcoatRoughnessMap!==void 0)this.clearcoatRoughnessMap=p[d.clearcoatRoughnessMap]||null;if(d.clearcoatNormalMap!==void 0)this.clearcoatNormalMap=p[d.clearcoatNormalMap]||null;if(d.clearcoatNormalScale!==void 0)this.clearcoatNormalScale=new Jt().fromArray(d.clearcoatNormalScale);if(d.diffuseRoughnessMap!==void 0)this.diffuseRoughnessMap=p[d.diffuseRoughnessMap]||null;if(d.iridescenceMap!==void 0)this.iridescenceMap=p[d.iridescenceMap]||null;if(d.iridescenceThicknessMap!==void 0)this.iridescenceThicknessMap=p[d.iridescenceThicknessMap]||null;if(d.transmissionMap!==void 0)this.transmissionMap=p[d.transmissionMap]||null;if(d.thicknessMap!==void 0)this.thicknessMap=p[d.thicknessMap]||null;if(d.anisotropyMap!==void 0)this.anisotropyMap=p[d.anisotropyMap]||null;if(d.sheenColorMap!==void 0)this.sheenColorMap=p[d.sheenColorMap]||null;if(d.sheenRoughnessMap!==void 0)this.sheenRoughnessMap=p[d.sheenRoughnessMap]||null;return this}clone(){return new this.constructor().copy(this)}copy(d){this.name=d.name,this.blending=d.blending,this.side=d.side,this.vertexColors=d.vertexColors,this.opacity=d.opacity,this.transparent=d.transparent,this.blendSrc=d.blendSrc,this.blendDst=d.blendDst,this.blendEquation=d.blendEquation,this.blendSrcAlpha=d.blendSrcAlpha,this.blendDstAlpha=d.blendDstAlpha,this.blendEquationAlpha=d.blendEquationAlpha,this.blendColor.copy(d.blendColor),this.blendAlpha=d.blendAlpha,this.depthFunc=d.depthFunc,this.depthTest=d.depthTest,this.depthWrite=d.depthWrite,this.stencilWriteMask=d.stencilWriteMask,this.stencilFunc=d.stencilFunc,this.stencilRef=d.stencilRef,this.stencilFuncMask=d.stencilFuncMask,this.stencilFail=d.stencilFail,this.stencilZFail=d.stencilZFail,this.stencilZPass=d.stencilZPass,this.stencilWrite=d.stencilWrite;let p=d.clippingPlanes,m=null;if(p!==null){let g=p.length;m=Array(g);for(let _=0;_!==g;++_)m[_]=p[_].clone()}return this.clippingPlanes=m,this.clipIntersection=d.clipIntersection,this.clipShadows=d.clipShadows,this.shadowSide=d.shadowSide,this.colorWrite=d.colorWrite,this.precision=d.precision,this.polygonOffset=d.polygonOffset,this.polygonOffsetFactor=d.polygonOffsetFactor,this.polygonOffsetUnits=d.polygonOffsetUnits,this.dithering=d.dithering,this.alphaTest=d.alphaTest,this.alphaHash=d.alphaHash,this.alphaToCoverage=d.alphaToCoverage,this.premultipliedAlpha=d.premultipliedAlpha,this.forceSinglePass=d.forceSinglePass,this.allowOverride=d.allowOverride,this.visible=d.visible,this.toneMapped=d.toneMapped,this.userData=JSON.parse(JSON.stringify(d.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(d){if(d===!0)this.version++}}var ri=new q,ul=new q,oo=new q,ao=new q;class Ii{constructor(d=new q,p=new q(0,0,-1)){this.origin=d,this.direction=p}set(d,p){return this.origin.copy(d),this.direction.copy(p),this}copy(d){return this.origin.copy(d.origin),this.direction.copy(d.direction),this}at(d,p){return p.copy(this.origin).addScaledVector(this.direction,d)}lookAt(d){return this.direction.copy(d).sub(this.origin).normalize(),this}recast(d){return this.origin.copy(this.at(d,ri)),this}closestPointToPoint(d,p){p.subVectors(d,this.origin);let m=p.dot(this.direction);if(m<0)return p.copy(this.origin);return p.copy(this.origin).addScaledVector(this.direction,m)}distanceToPoint(d){return Math.sqrt(this.distanceSqToPoint(d))}distanceSqToPoint(d){let p=ri.subVectors(d,this.origin).dot(this.direction);if(p<0)return this.origin.distanceToSquared(d);return ri.copy(this.origin).addScaledVector(this.direction,p),ri.distanceToSquared(d)}distanceSqToSegment(d,p,m,g){ul.copy(d).add(p).multiplyScalar(0.5),oo.copy(p).sub(d).normalize(),ao.copy(this.origin).sub(ul);let _=d.distanceTo(p)*0.5,x=-this.direction.dot(oo),v=ao.dot(this.direction),y=-ao.dot(oo),S=ao.lengthSq(),M=Math.abs(1-x*x),E,T,b,w;if(M>0)if(E=x*y-v,T=x*v-y,w=_*M,E>=0)if(T>=-w)if(T<=w){let C=1/M;E*=C,T*=C,b=E*(E+x*T+2*v)+T*(x*E+T+2*y)+S}else T=_,E=Math.max(0,-(x*T+v)),b=-E*E+T*(T+2*y)+S;else T=-_,E=Math.max(0,-(x*T+v)),b=-E*E+T*(T+2*y)+S;else if(T<=-w)E=Math.max(0,-(-x*_+v)),T=E>0?-_:Math.min(Math.max(-_,-y),_),b=-E*E+T*(T+2*y)+S;else if(T<=w)E=0,T=Math.min(Math.max(-_,-y),_),b=T*(T+2*y)+S;else E=Math.max(0,-(x*_+v)),T=E>0?_:Math.min(Math.max(-_,-y),_),b=-E*E+T*(T+2*y)+S;else T=x>0?-_:_,E=Math.max(0,-(x*T+v)),b=-E*E+T*(T+2*y)+S;if(m)m.copy(this.origin).addScaledVector(this.direction,E);if(g)g.copy(ul).addScaledVector(oo,T);return b}intersectSphere(d,p){if(d.radius<0)return null;ri.subVectors(d.center,this.origin);let m=ri.dot(this.direction),g=ri.dot(ri)-m*m,_=d.radius*d.radius;if(g>_)return null;let x=Math.sqrt(_-g),v=m-x,y=m+x;if(y<0)return null;if(v<0)return this.at(y,p);return this.at(v,p)}intersectsSphere(d){if(d.radius<0)return!1;return this.distanceSqToPoint(d.center)<=d.radius*d.radius}distanceToPlane(d){let p=d.normal.dot(this.direction);if(p===0){if(d.distanceToPoint(this.origin)===0)return 0;return null}let m=-(this.origin.dot(d.normal)+d.constant)/p;return m>=0?m:null}intersectPlane(d,p){let m=this.distanceToPlane(d);if(m===null)return null;return this.at(m,p)}intersectsPlane(d){let p=d.distanceToPoint(this.origin);if(p===0)return!0;if(d.normal.dot(this.direction)*p<0)return!0;return!1}intersectBox(d,p){let m,g,_,x,v,y,S=1/this.direction.x,M=1/this.direction.y,E=1/this.direction.z,T=this.origin;if(S>=0)m=(d.min.x-T.x)*S,g=(d.max.x-T.x)*S;else m=(d.max.x-T.x)*S,g=(d.min.x-T.x)*S;if(M>=0)_=(d.min.y-T.y)*M,x=(d.max.y-T.y)*M;else _=(d.max.y-T.y)*M,x=(d.min.y-T.y)*M;if(m>x||_>g)return null;if(_>m||isNaN(m))m=_;if(x<g||isNaN(g))g=x;if(E>=0)v=(d.min.z-T.z)*E,y=(d.max.z-T.z)*E;else v=(d.max.z-T.z)*E,y=(d.min.z-T.z)*E;if(m>y||v>g)return null;if(v>m||m!==m)m=v;if(y<g||g!==g)g=y;if(g<0)return null;return this.at(m>=0?m:g,p)}intersectsBox(d){return this.intersectBox(d,ri)!==null}intersectTriangle(d,p,m,g,_){let x=this.origin,v=this.direction,{x:y,y:S,z:M}=v,E=d.x-x.x,T=d.y-x.y,b=d.z-x.z,w=p.x-x.x,C=p.y-x.y,N=p.z-x.z,A=m.x-x.x,R=m.y-x.y,P=m.z-x.z,F=Math.abs(y),L=Math.abs(S),U=Math.abs(M),k,I,D,z,W,H,X,J,G,Q,it,j;if(F>=L&&F>=U)if(D=y,H=E,G=w,j=A,y>=0)k=S,I=M,z=T,W=b,X=C,J=N,Q=R,it=P;else k=M,I=S,z=b,W=T,X=N,J=C,Q=P,it=R;else if(L>=U)if(D=S,H=T,G=C,j=R,S>=0)k=M,I=y,z=b,W=E,X=N,J=w,Q=P,it=A;else k=y,I=M,z=E,W=b,X=w,J=N,Q=A,it=P;else if(D=M,H=b,G=N,j=P,M>=0)k=y,I=S,z=E,W=T,X=w,J=C,Q=A,it=R;else k=S,I=y,z=T,W=E,X=C,J=w,Q=R,it=A;if(D===0)return null;let _t=k/D,rt=I/D,ut=1/D,mt=z-_t*H,Nt=W-rt*H,ot=X-_t*G,ft=J-rt*G,Ct=Q-_t*j,zt=it-rt*j,Dt=Ct*ft-zt*ot,wt=mt*zt-Nt*Ct,jt=ot*Nt-ft*mt;if(g){if(Dt<0||wt<0||jt<0)return null}else if((Dt<0||wt<0||jt<0)&&(Dt>0||wt>0||jt>0))return null;let Qt=Dt+wt+jt;if(Qt===0)return null;let Ft=ut*(Dt*H+wt*G+jt*j);if(Qt>0?Ft<0:Ft>0)return null;return this.at(Ft/Qt,_)}applyMatrix4(d){return this.origin.applyMatrix4(d),this.direction.transformDirection(d),this}equals(d){return d.origin.equals(this.origin)&&d.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Rc extends fi{constructor(d){super();this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=0,this.reflectivity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.lightMap=d.lightMap,this.lightMapIntensity=d.lightMapIntensity,this.aoMap=d.aoMap,this.aoMapIntensity=d.aoMapIntensity,this.specularMap=d.specularMap,this.alphaMap=d.alphaMap,this.envMap=d.envMap,this.envMapRotation.copy(d.envMapRotation),this.combine=d.combine,this.reflectivity=d.reflectivity,this.refractionRatio=d.refractionRatio,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.wireframeLinecap=d.wireframeLinecap,this.wireframeLinejoin=d.wireframeLinejoin,this.fog=d.fog,this}}var xu=new ie,Wi=new Ii,lo=new yn,vu=new q,co=new q,ho=new q,uo=new q,dl=new q,fo=new q,yu=new q,po=new q;class nn extends Xe{constructor(d=new Qe,p=new Rc){super();this.isMesh=!0,this.type="Mesh",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}getVertexPosition(d,p){let m=this.geometry,g=m.attributes.position,_=m.morphAttributes.position,x=m.morphTargetsRelative;p.fromBufferAttribute(g,d);let v=this.morphTargetInfluences;if(_&&v){fo.set(0,0,0);for(let y=0,S=_.length;y<S;y++){let M=v[y],E=_[y];if(M===0)continue;if(dl.fromBufferAttribute(E,d),x)fo.addScaledVector(dl,M);else fo.addScaledVector(dl.sub(p),M)}p.add(fo)}return p}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.material,_=this.matrixWorld;if(g===void 0)return;if(m.boundingSphere===null)m.computeBoundingSphere();if(lo.copy(m.boundingSphere),lo.applyMatrix4(_),Wi.copy(d.ray).recast(d.near),lo.containsPoint(Wi.origin)===!1){if(Wi.intersectSphere(lo,vu)===null)return;if(Wi.origin.distanceToSquared(vu)>(d.far-d.near)**2)return}if(xu.copy(_).invert(),Wi.copy(d.ray).applyMatrix4(xu),m.boundingBox!==null){if(Wi.intersectsBox(m.boundingBox)===!1)return}this._computeIntersections(d,p,Wi)}_computeIntersections(d,p,m){let g,_=this.geometry,x=this.material,v=_.index,y=_.attributes.position,S=_.attributes.uv,M=_.attributes.uv1,E=_.attributes.normal,{groups:T,drawRange:b}=_;if(v!==null)if(Array.isArray(x))for(let w=0,C=T.length;w<C;w++){let N=T[w],A=x[N.materialIndex],R=Math.max(N.start,b.start),P=Math.min(v.count,Math.min(N.start+N.count,b.start+b.count));for(let F=R,L=P;F<L;F+=3){let U=v.getX(F),k=v.getX(F+1),I=v.getX(F+2);if(g=mo(this,A,d,m,S,M,E,U,k,I),g)g.faceIndex=Math.floor(F/3),g.face.materialIndex=N.materialIndex,p.push(g)}}else{let w=Math.max(0,b.start),C=Math.min(v.count,b.start+b.count);for(let N=w,A=C;N<A;N+=3){let R=v.getX(N),P=v.getX(N+1),F=v.getX(N+2);if(g=mo(this,x,d,m,S,M,E,R,P,F),g)g.faceIndex=Math.floor(N/3),p.push(g)}}else if(y!==void 0)if(Array.isArray(x))for(let w=0,C=T.length;w<C;w++){let N=T[w],A=x[N.materialIndex],R=Math.max(N.start,b.start),P=Math.min(y.count,Math.min(N.start+N.count,b.start+b.count));for(let F=R,L=P;F<L;F+=3){let U=F,k=F+1,I=F+2;if(g=mo(this,A,d,m,S,M,E,U,k,I),g)g.faceIndex=Math.floor(F/3),g.face.materialIndex=N.materialIndex,p.push(g)}}else{let w=Math.max(0,b.start),C=Math.min(y.count,b.start+b.count);for(let N=w,A=C;N<A;N+=3){let R=N,P=N+1,F=N+2;if(g=mo(this,x,d,m,S,M,E,R,P,F),g)g.faceIndex=Math.floor(N/3),p.push(g)}}}}function Vm(d,p,m,g,_,x,v,y){let S;if(p.side===1)S=g.intersectTriangle(v,x,_,!0,y);else S=g.intersectTriangle(_,x,v,p.side===0,y);if(S===null)return null;po.copy(y),po.applyMatrix4(d.matrixWorld);let M=m.ray.origin.distanceTo(po);if(M<m.near||M>m.far)return null;return{distance:M,point:po.clone(),object:d}}function mo(d,p,m,g,_,x,v,y,S,M){d.getVertexPosition(y,co),d.getVertexPosition(S,ho),d.getVertexPosition(M,uo);let E=Vm(d,p,m,g,co,ho,uo,yu);if(E){let T=new q;if(Ge.getBarycoord(yu,co,ho,uo,T),_)E.uv=Ge.getInterpolatedAttribute(_,y,S,M,T,new Jt);if(x)E.uv1=Ge.getInterpolatedAttribute(x,y,S,M,T,new Jt);if(v){if(E.normal=Ge.getInterpolatedAttribute(v,y,S,M,T,new q),E.normal.dot(g.direction)>0)E.normal.multiplyScalar(-1)}let b={a:y,b:S,c:M,normal:new q,materialIndex:0};Ge.getNormal(co,ho,uo,b.normal),E.face=b,E.barycoord=T}return E}class As extends We{constructor(d=null,p=1,m=1,g,_,x,v,y,S=1003,M=1003,E,T){super(null,x,v,y,S,M,g,_,E,T);this.isDataTexture=!0,this.image={data:d,width:p,height:m},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}var Xi=new yn,Wm=new Jt(0.5,0.5),go=new q;class Ei{constructor(d=new un,p=new un,m=new un,g=new un,_=new un,x=new un){this.planes=[d,p,m,g,_,x]}set(d,p,m,g,_,x){let v=this.planes;return v[0].copy(d),v[1].copy(p),v[2].copy(m),v[3].copy(g),v[4].copy(_),v[5].copy(x),this}copy(d){let p=this.planes;for(let m=0;m<6;m++)p[m].copy(d.planes[m]);return this}setFromProjectionMatrix(d,p=2000,m=!1){let g=this.planes,_=d.elements,x=_[0],v=_[1],y=_[2],S=_[3],M=_[4],E=_[5],T=_[6],b=_[7],w=_[8],C=_[9],N=_[10],A=_[11],R=_[12],P=_[13],F=_[14],L=_[15];if(g[0].setComponents(S-x,b-M,A-w,L-R).normalize(),g[1].setComponents(S+x,b+M,A+w,L+R).normalize(),g[2].setComponents(S+v,b+E,A+C,L+P).normalize(),g[3].setComponents(S-v,b-E,A-C,L-P).normalize(),m)g[4].setComponents(y,T,N,F).normalize(),g[5].setComponents(S-y,b-T,A-N,L-F).normalize();else if(g[4].setComponents(S-y,b-T,A-N,L-F).normalize(),p===2000)g[5].setComponents(S+y,b+T,A+N,L+F).normalize();else if(p===2001)g[5].setComponents(y,T,N,F).normalize();else throw Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+p);return this}intersectsObject(d){if(d.boundingSphere!==void 0){if(d.boundingSphere===null)d.computeBoundingSphere();Xi.copy(d.boundingSphere).applyMatrix4(d.matrixWorld)}else{let p=d.geometry;if(p.boundingSphere===null)p.computeBoundingSphere();Xi.copy(p.boundingSphere).applyMatrix4(d.matrixWorld)}return this.intersectsSphere(Xi)}intersectsSprite(d){Xi.center.set(0,0,0);let p=Wm.distanceTo(d.center);return Xi.radius=0.7071067811865476+p,Xi.applyMatrix4(d.matrixWorld),this.intersectsSphere(Xi)}intersectsSphere(d){let p=this.planes,m=d.center,g=-d.radius;for(let _=0;_<6;_++)if(p[_].distanceToPoint(m)<g)return!1;return!0}intersectsBox(d){let p=this.planes;for(let m=0;m<6;m++){let g=p[m];if(go.x=g.normal.x>0?d.max.x:d.min.x,go.y=g.normal.y>0?d.max.y:d.min.y,go.z=g.normal.z>0?d.max.z:d.min.z,g.distanceToPoint(go)<0)return!1}return!0}containsPoint(d){let p=this.planes;for(let m=0;m<6;m++)if(p[m].distanceToPoint(d)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}var Su=new ie;class Tr{constructor(){this.coordinateSystem=2000,this._frustums=[],this._count=0}setFromArrayCamera(d){let p=d.cameras,m=this._frustums;for(let g=0;g<p.length;g++){let _=p[g];if(Su.multiplyMatrices(_.projectionMatrix,_.matrixWorldInverse),m[g]===void 0)m[g]=new Ei;m[g].setFromProjectionMatrix(Su,_.coordinateSystem,_.reversedDepth)}return this._count=p.length,this}getFrustum(d){return this._frustums[d]}intersectsObject(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsObject(d))return!0;return!1}intersectsSprite(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsSprite(d))return!0;return!1}intersectsSphere(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsSphere(d))return!0;return!1}intersectsBox(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].intersectsBox(d))return!0;return!1}containsPoint(d){let p=this._frustums;for(let m=0;m<this._count;m++)if(p[m].containsPoint(d))return!0;return!1}copy(d){this.coordinateSystem=d.coordinateSystem;let p=this._frustums,m=d._frustums;for(let g=0;g<d._count;g++){if(p[g]===void 0)p[g]=new Ei;p[g].copy(m[g])}return this._count=d._count,this}clone(){return new Tr().copy(this)}}function fl(d,p){return d-p}function Xm(d,p){return d.z-p.z}function qm(d,p){return p.z-d.z}class zd{constructor(){this.index=0,this.pool=[],this.list=[]}push(d,p,m,g){let _=this.pool,x=this.list;if(this.index>=_.length)_.push({start:-1,count:-1,z:-1,index:-1});let v=_[this.index];x.push(v),this.index++,v.start=d,v.count=p,v.z=m,v.index=g}reset(){this.list.length=0,this.index=0}}var Mn=new ie,Ym=new se(1,1,1),Zm=new Ei,$m=new Tr,_o=new xe,qi=new yn,pl=new q,Mu=new q,bu=new q,Jm=new q,ml=new zd,hn=new nn,xo=[];function Km(d,p,m=0){let g=p.itemSize;if(d.isInterleavedBufferAttribute||d.array.constructor!==p.array.constructor){let _=d.count;for(let x=0;x<_;x++)for(let v=0;v<g;v++)p.setComponent(x+m,v,d.getComponent(x,v))}else p.array.set(d.array,m*g);p.needsUpdate=!0}function Xn(d,p){if(d.constructor!==p.constructor){let m=Math.min(d.length,p.length);for(let g=0;g<m;g++)p[g]=d[g]}else{let m=Math.min(d.length,p.length);p.set(new d.constructor(d.buffer,0,m))}}class Wo extends nn{constructor(d,p,m=p*2,g){super(new Qe,g);this.isBatchedMesh=!0,this.perObjectFrustumCulled=!0,this.sortObjects=!0,this.boundingBox=null,this.boundingSphere=null,this.customSort=null,this._instanceInfo=[],this._geometryInfo=[],this._availableInstanceIds=[],this._availableGeometryIds=[],this._nextIndexStart=0,this._nextVertexStart=0,this._geometryCount=0,this._visibilityChanged=!0,this._geometryInitialized=!1,this._maxInstanceCount=d,this._maxVertexCount=p,this._maxIndexCount=m,this._multiDrawCounts=new Int32Array(d),this._multiDrawStarts=new Int32Array(d),this._multiDrawCount=0,this._multiDrawBytesPerElement=1,this._mergedDrawCounts=new Int32Array(d),this._mergedDrawStarts=new Int32Array(d),this._mergedDrawInstanceCounts=new Int32Array(d),this._mergedDrawCount=0,this._matricesTexture=null,this._indirectTexture=null,this._colorsTexture=null,this._previousMatricesTexture=null,this._initMatricesTexture(),this._initIndirectTexture()}get maxInstanceCount(){return this._maxInstanceCount}get instanceCount(){return this._instanceInfo.length-this._availableInstanceIds.length}get unusedVertexCount(){return this._maxVertexCount-this._nextVertexStart}get unusedIndexCount(){return this._maxIndexCount-this._nextIndexStart}_initMatricesTexture(){let d=Math.sqrt(this._maxInstanceCount*4);d=Math.ceil(d/4)*4,d=Math.max(d,4);let p=new Float32Array(d*d*4),m=new As(p,d,d,1023,1015);this._matricesTexture=m}_initIndirectTexture(){let d=Math.sqrt(this._maxInstanceCount);d=Math.ceil(d);let p=new Uint32Array(d*d),m=new As(p,d,d,1029,1014);this._indirectTexture=m}_initColorsTexture(){let d=Math.sqrt(this._maxInstanceCount);d=Math.ceil(d);let p=new Float32Array(d*d*4).fill(1),m=new As(p,d,d,1023,1015);m.colorSpace=le.workingColorSpace,this._colorsTexture=m}_initializeGeometry(d){let p=this.geometry,m=this._maxVertexCount,g=this._maxIndexCount;if(this._geometryInitialized===!1){for(let _ in d.attributes){let x=d.getAttribute(_),{array:v,itemSize:y,normalized:S}=x,M=new v.constructor(m*y),E=new Ve(M,y,S);p.setAttribute(_,E)}if(d.getIndex()!==null){let _=m>65535?new Uint32Array(g):new Uint16Array(g);p.setIndex(new Ve(_,1))}this._geometryInitialized=!0}}_validateGeometry(d){let p=this.geometry;if(Boolean(d.getIndex())!==Boolean(p.getIndex()))throw Error('THREE.BatchedMesh: All geometries must consistently have "index".');for(let m in p.attributes){if(!d.hasAttribute(m))throw Error(`THREE.BatchedMesh: Added geometry missing "${m}". All geometries must have consistent attributes.`);let g=d.getAttribute(m),_=p.getAttribute(m);if(g.itemSize!==_.itemSize||g.normalized!==_.normalized)throw Error(`THREE.BatchedMesh: Added geometry attribute "${m}" has an inconsistent itemSize or normalized value.`)}}validateInstanceId(d){let p=this._instanceInfo;if(d<0||d>=p.length||p[d].active===!1)throw Error(`THREE.BatchedMesh: Invalid instanceId ${d}. Instance is either out of range or has been deleted.`)}validateGeometryId(d){let p=this._geometryInfo;if(d<0||d>=p.length||p[d].active===!1)throw Error(`THREE.BatchedMesh: Invalid geometryId ${d}. Geometry is either out of range or has been deleted.`)}setCustomSort(d){return this.customSort=d,this}computeBoundingBox(){if(this.boundingBox===null)this.boundingBox=new xe;let d=this.boundingBox,p=this._instanceInfo;d.makeEmpty();for(let m=0,g=p.length;m<g;m++){if(p[m].active===!1)continue;let _=p[m].geometryIndex;this.getMatrixAt(m,Mn),this.getBoundingBoxAt(_,_o).applyMatrix4(Mn),d.union(_o)}}computeBoundingSphere(){if(this.boundingSphere===null)this.boundingSphere=new yn;let d=this.boundingSphere,p=this._instanceInfo;d.makeEmpty();for(let m=0,g=p.length;m<g;m++){if(p[m].active===!1)continue;let _=p[m].geometryIndex;this.getMatrixAt(m,Mn),this.getBoundingSphereAt(_,qi).applyMatrix4(Mn),d.union(qi)}}addInstance(d){if(this._instanceInfo.length>=this.maxInstanceCount&&this._availableInstanceIds.length===0)throw Error("THREE.BatchedMesh: Maximum item count reached.");let m={visible:!0,active:!0,geometryIndex:d},g=null;if(this._availableInstanceIds.length>0)this._availableInstanceIds.sort(fl),g=this._availableInstanceIds.shift(),this._instanceInfo[g]=m;else g=this._instanceInfo.length,this._instanceInfo.push(m);let _=this._matricesTexture;Mn.identity().toArray(_.image.data,g*16),_.needsUpdate=!0;let x=this._colorsTexture;if(x)Ym.toArray(x.image.data,g*4),x.needsUpdate=!0;return this._visibilityChanged=!0,g}addGeometry(d,p=-1,m=-1){this._initializeGeometry(d),this._validateGeometry(d);let g={vertexStart:-1,vertexCount:-1,reservedVertexCount:-1,indexStart:-1,indexCount:-1,reservedIndexCount:-1,start:-1,count:-1,boundingBox:null,boundingSphere:null,active:!0},_=this._geometryInfo;g.vertexStart=this._nextVertexStart,g.reservedVertexCount=p===-1?d.getAttribute("position").count:p;let x=d.getIndex();if(x!==null)g.indexStart=this._nextIndexStart,g.reservedIndexCount=m===-1?x.count:m;if(g.indexStart!==-1&&g.indexStart+g.reservedIndexCount>this._maxIndexCount||g.vertexStart+g.reservedVertexCount>this._maxVertexCount)throw Error("THREE.BatchedMesh: Reserved space request exceeds the maximum buffer size.");let y;if(this._availableGeometryIds.length>0)this._availableGeometryIds.sort(fl),y=this._availableGeometryIds.shift(),_[y]=g;else y=this._geometryCount,this._geometryCount++,_.push(g);return this.setGeometryAt(y,d),this._nextIndexStart=g.indexStart+g.reservedIndexCount,this._nextVertexStart=g.vertexStart+g.reservedVertexCount,y}setGeometryAt(d,p){if(d>=this._geometryCount)throw Error("THREE.BatchedMesh: Maximum geometry count reached.");this._validateGeometry(p);let m=this.geometry,g=m.getIndex()!==null,_=m.getIndex(),x=p.getIndex(),v=this._geometryInfo[d];if(g&&x.count>v.reservedIndexCount||p.attributes.position.count>v.reservedVertexCount)throw Error("THREE.BatchedMesh: Reserved space not large enough for provided geometry.");let{vertexStart:y,reservedVertexCount:S}=v;v.vertexCount=p.getAttribute("position").count;for(let M in m.attributes){let E=p.getAttribute(M),T=m.getAttribute(M);Km(E,T,y);let b=E.itemSize;for(let w=E.count,C=S;w<C;w++){let N=y+w;for(let A=0;A<b;A++)T.setComponent(N,A,0)}T.needsUpdate=!0,T.addUpdateRange(y*b,S*b)}if(g){let{indexStart:M,reservedIndexCount:E}=v;v.indexCount=p.getIndex().count;for(let T=0;T<x.count;T++)_.setX(M+T,y+x.getX(T));for(let T=x.count,b=E;T<b;T++)_.setX(M+T,y);_.needsUpdate=!0,_.addUpdateRange(M,v.reservedIndexCount)}if(v.start=g?v.indexStart:v.vertexStart,v.count=g?v.indexCount:v.vertexCount,v.boundingBox=null,p.boundingBox!==null)v.boundingBox=p.boundingBox.clone();if(v.boundingSphere=null,p.boundingSphere!==null)v.boundingSphere=p.boundingSphere.clone();return this._visibilityChanged=!0,d}deleteGeometry(d){let p=this._geometryInfo;if(d>=p.length||p[d].active===!1)return this;let m=this._instanceInfo;for(let g=0,_=m.length;g<_;g++)if(m[g].active&&m[g].geometryIndex===d)this.deleteInstance(g);return p[d].active=!1,this._availableGeometryIds.push(d),this._visibilityChanged=!0,this}deleteInstance(d){return this.validateInstanceId(d),this._instanceInfo[d].active=!1,this._availableInstanceIds.push(d),this._visibilityChanged=!0,this}optimize(){let d=0,p=0,m=this._geometryInfo,g=m.map((x,v)=>v).sort((x,v)=>m[x].vertexStart-m[v].vertexStart),_=this.geometry;for(let x=0,v=m.length;x<v;x++){let y=g[x],S=m[y];if(S.active===!1)continue;if(_.index!==null){if(S.indexStart!==p){let{indexStart:M,vertexStart:E,reservedIndexCount:T}=S,b=_.index,w=b.array,C=d-E;for(let N=M;N<M+T;N++)w[N]=w[N]+C;b.array.copyWithin(p,M,M+T),b.addUpdateRange(p,T),b.needsUpdate=!0,S.indexStart=p}p+=S.reservedIndexCount}if(S.vertexStart!==d){let{vertexStart:M,reservedVertexCount:E}=S,T=_.attributes;for(let b in T){let w=T[b],{array:C,itemSize:N}=w;C.copyWithin(d*N,M*N,(M+E)*N),w.addUpdateRange(d*N,E*N),w.needsUpdate=!0}S.vertexStart=d}d+=S.reservedVertexCount,S.start=_.index?S.indexStart:S.vertexStart}return this._nextIndexStart=p,this._nextVertexStart=d,this._visibilityChanged=!0,this}getBoundingBoxAt(d,p){if(d>=this._geometryCount)return null;let m=this.geometry,g=this._geometryInfo[d];if(g.boundingBox===null){let _=new xe,x=m.index,v=m.attributes.position;for(let y=g.start,S=g.start+g.count;y<S;y++){let M=y;if(x)M=x.getX(M);_.expandByPoint(pl.fromBufferAttribute(v,M))}g.boundingBox=_}return p.copy(g.boundingBox),p}getBoundingSphereAt(d,p){if(d>=this._geometryCount)return null;let m=this.geometry,g=this._geometryInfo[d];if(g.boundingSphere===null){let _=new yn;this.getBoundingBoxAt(d,_o),_o.getCenter(_.center);let x=m.index,v=m.attributes.position,y=0;for(let S=g.start,M=g.start+g.count;S<M;S++){let E=S;if(x)E=x.getX(E);pl.fromBufferAttribute(v,E),y=Math.max(y,_.center.distanceToSquared(pl))}_.radius=Math.sqrt(y),g.boundingSphere=_}return p.copy(g.boundingSphere),p}setMatrixAt(d,p){this.validateInstanceId(d);let m=this._matricesTexture,g=this._matricesTexture.image.data;return p.toArray(g,d*16),m.needsUpdate=!0,this}getMatrixAt(d,p){return this.validateInstanceId(d),p.fromArray(this._matricesTexture.image.data,d*16)}setColorAt(d,p){if(this.validateInstanceId(d),this._colorsTexture===null)this._initColorsTexture();return p.toArray(this._colorsTexture.image.data,d*4),this._colorsTexture.needsUpdate=!0,this}getColorAt(d,p){if(this.validateInstanceId(d),this._colorsTexture===null)if(p.isVector4)return p.set(1,1,1,1);else return p.setRGB(1,1,1);else return p.fromArray(this._colorsTexture.image.data,d*4)}setVisibleAt(d,p){if(this.validateInstanceId(d),this._instanceInfo[d].visible===p)return this;return this._instanceInfo[d].visible=p,this._visibilityChanged=!0,this}getVisibleAt(d){return this.validateInstanceId(d),this._instanceInfo[d].visible}setGeometryIdAt(d,p){return this.validateInstanceId(d),this.validateGeometryId(p),this._instanceInfo[d].geometryIndex=p,this._visibilityChanged=!0,this}getGeometryIdAt(d){return this.validateInstanceId(d),this._instanceInfo[d].geometryIndex}getGeometryRangeAt(d,p={}){this.validateGeometryId(d);let m=this._geometryInfo[d];return p.vertexStart=m.vertexStart,p.vertexCount=m.vertexCount,p.reservedVertexCount=m.reservedVertexCount,p.indexStart=m.indexStart,p.indexCount=m.indexCount,p.reservedIndexCount=m.reservedIndexCount,p.start=m.start,p.count=m.count,p}setInstanceCount(d){let p=this._availableInstanceIds,m=this._instanceInfo;p.sort(fl);while(p[p.length-1]===m.length-1)m.pop(),p.pop();if(d<m.length)throw Error(`THREE.BatchedMesh: Instance ids outside the range ${d} are being used. Cannot shrink instance count.`);let g=new Int32Array(d),_=new Int32Array(d);Xn(this._multiDrawCounts,g),Xn(this._multiDrawStarts,_),this._multiDrawCounts=g,this._multiDrawStarts=_;let x=new Int32Array(d),v=new Int32Array(d),y=new Int32Array(d);Xn(this._mergedDrawCounts,x),Xn(this._mergedDrawStarts,v),Xn(this._mergedDrawInstanceCounts,y),this._mergedDrawCounts=x,this._mergedDrawStarts=v,this._mergedDrawInstanceCounts=y,this._maxInstanceCount=d;let S=this._indirectTexture,M=this._matricesTexture,E=this._colorsTexture;if(S.dispose(),this._initIndirectTexture(),Xn(S.image.data,this._indirectTexture.image.data),M.dispose(),this._initMatricesTexture(),Xn(M.image.data,this._matricesTexture.image.data),E)E.dispose(),this._initColorsTexture(),Xn(E.image.data,this._colorsTexture.image.data);if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}setGeometrySize(d,p){let m=[...this._geometryInfo].filter((v)=>v.active);if(Math.max(...m.map((v)=>v.vertexStart+v.reservedVertexCount))>d)throw Error(`THREE.BatchedMesh: Geometry vertex values are being used outside the range ${d}. Cannot shrink further.`);if(this.geometry.index){if(Math.max(...m.map((y)=>y.indexStart+y.reservedIndexCount))>p)throw Error(`THREE.BatchedMesh: Geometry index values are being used outside the range ${p}. Cannot shrink further.`)}let _=this.geometry;if(_.dispose(),this._maxVertexCount=d,this._maxIndexCount=p,this._geometryInitialized)this._geometryInitialized=!1,this.geometry=new Qe,this._initializeGeometry(_);let x=this.geometry;if(_.index)Xn(_.index.array,x.index.array);for(let v in _.attributes)Xn(_.attributes[v].array,x.attributes[v].array);this._visibilityChanged=!0}raycast(d,p){let m=this._instanceInfo,g=this._geometryInfo,_=this.matrixWorld,x=this.geometry;if(hn.material=this.material,hn.geometry.index=x.index,hn.geometry.attributes=x.attributes,hn.geometry.boundingBox===null)hn.geometry.boundingBox=new xe;if(hn.geometry.boundingSphere===null)hn.geometry.boundingSphere=new yn;for(let v=0,y=m.length;v<y;v++){if(!m[v].visible||!m[v].active)continue;let S=m[v].geometryIndex,M=g[S];hn.geometry.setDrawRange(M.start,M.count),this.getMatrixAt(v,hn.matrixWorld).premultiply(_),this.getBoundingBoxAt(S,hn.geometry.boundingBox),this.getBoundingSphereAt(S,hn.geometry.boundingSphere),hn.raycast(d,xo);for(let E=0,T=xo.length;E<T;E++){let b=xo[E];b.object=this,b.batchId=v,p.push(b)}xo.length=0}hn.material=null,hn.geometry.index=null,hn.geometry.attributes={},hn.geometry.setDrawRange(0,1/0)}copy(d){if(super.copy(d),this.geometry=d.geometry.clone(),this.perObjectFrustumCulled=d.perObjectFrustumCulled,this.sortObjects=d.sortObjects,this.boundingBox=d.boundingBox!==null?d.boundingBox.clone():null,this.boundingSphere=d.boundingSphere!==null?d.boundingSphere.clone():null,this._geometryInfo=d._geometryInfo.map((p)=>({...p,boundingBox:p.boundingBox!==null?p.boundingBox.clone():null,boundingSphere:p.boundingSphere!==null?p.boundingSphere.clone():null})),this._instanceInfo=d._instanceInfo.map((p)=>({...p})),this._availableInstanceIds=d._availableInstanceIds.slice(),this._availableGeometryIds=d._availableGeometryIds.slice(),this._nextIndexStart=d._nextIndexStart,this._nextVertexStart=d._nextVertexStart,this._geometryCount=d._geometryCount,this._maxInstanceCount=d._maxInstanceCount,this._maxVertexCount=d._maxVertexCount,this._maxIndexCount=d._maxIndexCount,this._geometryInitialized=d._geometryInitialized,this._multiDrawCounts=d._multiDrawCounts.slice(),this._multiDrawStarts=d._multiDrawStarts.slice(),this._multiDrawBytesPerElement=d._multiDrawBytesPerElement,this._mergedDrawCounts=d._mergedDrawCounts.slice(),this._mergedDrawStarts=d._mergedDrawStarts.slice(),this._mergedDrawInstanceCounts=d._mergedDrawInstanceCounts.slice(),this._indirectTexture=d._indirectTexture.clone(),this._indirectTexture.image.data=this._indirectTexture.image.data.slice(),this._matricesTexture=d._matricesTexture.clone(),this._matricesTexture.image.data=this._matricesTexture.image.data.slice(),d._colorsTexture!==null)this._colorsTexture=d._colorsTexture.clone(),this._colorsTexture.image.data=this._colorsTexture.image.data.slice();else this._colorsTexture=null;return this}dispose(){if(super.dispose(),this.geometry.dispose(),this._matricesTexture.dispose(),this._matricesTexture=null,this._indirectTexture.dispose(),this._indirectTexture=null,this._colorsTexture!==null)this._colorsTexture.dispose(),this._colorsTexture=null;if(this._previousMatricesTexture!==null)this._previousMatricesTexture.dispose(),this._previousMatricesTexture=null}_updateDrawParameters(d,p,m,g="multiDraw"){if(!this._visibilityChanged&&!this.perObjectFrustumCulled&&!this.sortObjects)return;let _=p.getIndex(),x=_===null?1:_.array.BYTES_PER_ELEMENT,v=1;if(m.wireframe)v=2,x=p.attributes.position.count>65535?4:2;let y=this._instanceInfo,S=this._multiDrawStarts,M=this._multiDrawCounts,E=this._mergedDrawStarts,T=this._mergedDrawCounts,b=this._mergedDrawInstanceCounts,w=this._geometryInfo,C=this.perObjectFrustumCulled,N=this._indirectTexture,A=N.image.data,R=d.isArrayCamera?$m:Zm;if(C)if(d.isArrayCamera)R.setFromArrayCamera(d);else Mn.multiplyMatrices(d.projectionMatrix,d.matrixWorldInverse).multiply(this.matrixWorld),R.setFromProjectionMatrix(Mn,d.coordinateSystem,d.reversedDepth);let P=0,F=0;if(this.sortObjects){Mn.copy(this.matrixWorld).invert(),Mu.setFromMatrixPosition(d.matrixWorld).applyMatrix4(Mn),bu.set(0,0,-1).transformDirection(d.matrixWorld).transformDirection(Mn);for(let k=0,I=y.length;k<I;k++)if(y[k].visible&&y[k].active){let D=y[k].geometryIndex;this.getMatrixAt(k,Mn),this.getBoundingSphereAt(D,qi).applyMatrix4(Mn);let z=!1;if(C)z=!R.intersectsSphere(qi);if(!z){let W=w[D],H=Jm.subVectors(qi.center,Mu).dot(bu);ml.push(W.start,W.count,H,k)}}let L=ml.list,U=this.customSort;if(U===null)L.sort(m.transparent?qm:Xm);else U.call(this,L,d);for(let k=0,I=L.length;k<I;k++){let D=L[k],z=D.start*x*v,W=D.count*v;if(g==="merged")if(F>0&&E[F-1]===z&&T[F-1]===W)b[F-1]++;else E[F]=z,T[F]=W,b[F]=1,F++;else S[P]=z,M[P]=W;A[P]=D.index,P++}ml.reset()}else for(let L=0,U=y.length;L<U;L++)if(y[L].visible&&y[L].active){let k=y[L].geometryIndex,I=!1;if(C)this.getMatrixAt(L,Mn),this.getBoundingSphereAt(k,qi).applyMatrix4(Mn),I=!R.intersectsSphere(qi);if(!I){let D=w[k],z=D.start*x*v,W=D.count*v;if(g==="merged")if(F>0&&E[F-1]===z&&T[F-1]===W)b[F-1]++;else E[F]=z,T[F]=W,b[F]=1,F++;else S[P]=z,M[P]=W;A[P]=L,P++}}N.needsUpdate=!0,this._multiDrawCount=P,this._mergedDrawCount=F,this._multiDrawBytesPerElement=x,this._visibilityChanged=!1}onBeforeRender(d,p,m,g,_){if(d.isWebGPURenderer===!0){if(this._visibilityChanged||this.perObjectFrustumCulled||this.sortObjects)this._indirectTexture.needsUpdate=!0}else this._updateDrawParameters(m,g,_)}onBeforeShadow(d,p,m,g,_,x){if(d.isWebGPURenderer!==!0)this._updateDrawParameters(g,_,x)}}class Pi extends fi{constructor(d){super();this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new se(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.linewidth=d.linewidth,this.linecap=d.linecap,this.linejoin=d.linejoin,this.fog=d.fog,this}}var Ao=new q,Ro=new q,Eu=new ie,lr=new Ii,vo=new yn,gl=new q,Tu=new q;class pi extends Xe{constructor(d=new Qe,p=new Pi){super();this.isLine=!0,this.type="Line",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}computeLineDistances(){let d=this.geometry;if(d.index===null){let p=d.attributes.position,m=[0];for(let g=1,_=p.count;g<_;g++)Ao.fromBufferAttribute(p,g-1),Ro.fromBufferAttribute(p,g),m[g]=m[g-1],m[g]+=Ao.distanceTo(Ro);d.setAttribute("lineDistance",new En(m,1))}else Xt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.matrixWorld,_=d.params.Line.threshold,x=m.drawRange;if(m.boundingSphere===null)m.computeBoundingSphere();if(vo.copy(m.boundingSphere),vo.applyMatrix4(g),vo.radius+=_,d.ray.intersectsSphere(vo)===!1)return;Eu.copy(g).invert(),lr.copy(d.ray).applyMatrix4(Eu);let v=_/((this.scale.x+this.scale.y+this.scale.z)/3),y=v*v,S=this.isLineSegments?2:1,M=m.index,T=m.attributes.position;if(M!==null){let b=Math.max(0,x.start),w=Math.min(M.count,x.start+x.count);for(let C=b,N=w-1;C<N;C+=S){let A=M.getX(C),R=M.getX(C+1),P=yo(this,d,lr,y,A,R,C);if(P)p.push(P)}if(this.isLineLoop){let C=M.getX(w-1),N=M.getX(b),A=yo(this,d,lr,y,C,N,w-1);if(A)p.push(A)}}else{let b=Math.max(0,x.start),w=Math.min(T.count,x.start+x.count);for(let C=b,N=w-1;C<N;C+=S){let A=yo(this,d,lr,y,C,C+1,C);if(A)p.push(A)}if(this.isLineLoop){let C=yo(this,d,lr,y,w-1,b,w-1);if(C)p.push(C)}}}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}}function yo(d,p,m,g,_,x,v){let y=d.geometry.attributes.position;if(Ao.fromBufferAttribute(y,_),Ro.fromBufferAttribute(y,x),m.distanceSqToSegment(Ao,Ro,gl,Tu)>g)return;gl.applyMatrix4(d.matrixWorld);let M=p.ray.origin.distanceTo(gl);if(M<p.near||M>p.far)return;return{distance:M,point:Tu.clone().applyMatrix4(d.matrixWorld),index:v,face:null,faceIndex:null,barycoord:null,object:d}}var wu=new q,Au=new q;class Li extends pi{constructor(d,p){super(d,p);this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let d=this.geometry;if(d.index===null){let p=d.attributes.position,m=[];for(let g=0,_=p.count;g<_;g+=2)wu.fromBufferAttribute(p,g),Au.fromBufferAttribute(p,g+1),m[g]=g===0?0:m[g-1],m[g+1]=m[g]+wu.distanceTo(Au);d.setAttribute("lineDistance",new En(m,1))}else Xt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Qi extends pi{constructor(d,p){super(d,p);this.isLineLoop=!0,this.type="LineLoop"}}class Cc extends fi{constructor(d){super();this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new se(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.alphaMap=d.alphaMap,this.size=d.size,this.sizeAttenuation=d.sizeAttenuation,this.fog=d.fog,this}}var Ru=new ie,vl=new Ii,So=new yn,Mo=new q;class wr extends Xe{constructor(d=new Qe,p=new Cc){super();this.isPoints=!0,this.type="Points",this.geometry=d,this.material=p,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(d,p){if(super.copy(d,p),d.morphTargetInfluences!==void 0)this.morphTargetInfluences=d.morphTargetInfluences.slice();else this.morphTargetInfluences=void 0;if(d.morphTargetDictionary!==void 0)this.morphTargetDictionary=Object.assign({},d.morphTargetDictionary);else this.morphTargetDictionary=void 0;return this.material=Array.isArray(d.material)?d.material.slice():d.material,this.geometry=d.geometry,this}intersectsFrustum(d){return d.intersectsObject(this)}raycast(d,p){let m=this.geometry,g=this.matrixWorld,_=d.params.Points.threshold,x=m.drawRange;if(m.boundingSphere===null)m.computeBoundingSphere();if(So.copy(m.boundingSphere),So.applyMatrix4(g),So.radius+=_,d.ray.intersectsSphere(So)===!1)return;Ru.copy(g).invert(),vl.copy(d.ray).applyMatrix4(Ru);let v=_/((this.scale.x+this.scale.y+this.scale.z)/3),y=v*v,S=m.index,E=m.attributes.position;if(S!==null){let T=Math.max(0,x.start),b=Math.min(S.count,x.start+x.count);for(let w=T,C=b;w<C;w++){let N=S.getX(w);Mo.fromBufferAttribute(E,N),Cu(Mo,N,y,g,d,p,this)}}else{let T=Math.max(0,x.start),b=Math.min(E.count,x.start+x.count);for(let w=T,C=b;w<C;w++)Mo.fromBufferAttribute(E,w),Cu(Mo,w,y,g,d,p,this)}}updateMorphTargets(){let p=this.geometry.morphAttributes,m=Object.keys(p);if(m.length>0){let g=p[m[0]];if(g!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let _=0,x=g.length;_<x;_++){let v=g[_].name||String(_);this.morphTargetInfluences.push(0),this.morphTargetDictionary[v]=_}}}}}function Cu(d,p,m,g,_,x,v){let y=vl.distanceSqToPoint(d);if(y<m){let S=new q;vl.closestPointToPoint(d,S),S.applyMatrix4(g);let M=_.ray.origin.distanceTo(S);if(M<_.near||M>_.far)return;x.push({distance:M,distanceToRay:Math.sqrt(y),point:S,index:p,face:null,faceIndex:null,barycoord:null,object:v})}}class Ar extends We{constructor(d=[],p,m,g,_,x,v,y,S,M,E,T){super(null,x,v,y,S,M,g,_,E,T);this.isCompressedTexture=!0,this.image={width:p,height:m},this.mipmaps=d,this.flipY=!1,this.generateMipmaps=!1}}class Xo extends We{constructor(d=[],p=301,m,g,_,x,v,y,S,M){super(d,p,m,g,_,x,v,y,S,M);this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(d){this.image=d}}class Ni extends We{constructor(d,p,m=1014,g,_,x,v=1003,y=1003,S,M=1026,E=1){if(M!==1026&&M!==1027)throw Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let T={width:d,height:p,depth:E};super(T,g,_,x,v,y,M,m,S);this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(d){return super.copy(d),this.source=new Mr(Object.assign({},d.image)),this.compareFunction=d.compareFunction,this}toJSON(d){let p=super.toJSON(d);return p.compareFunction=this.compareFunction,p}}class qo extends Ni{constructor(d,p=1014,m=301,g,_,x=1003,v=1003,y,S=1026){let M={width:d,height:d,depth:1},E=[M,M,M,M,M,M];super(d,d,p,m,g,_,x,v,y,S);this.image=E,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(d){this.image=d}}class Yo extends We{constructor(d=null){super();this.sourceTexture=d,this.isExternalTexture=!0}copy(d){return super.copy(d),this.sourceTexture=d.sourceTexture,this}}class Os extends Qe{constructor(d=1,p=1,m=1,g=1,_=1,x=1){super();this.type="BoxGeometry",this.parameters={width:d,height:p,depth:m,widthSegments:g,heightSegments:_,depthSegments:x};let v=this;g=Math.floor(g),_=Math.floor(_),x=Math.floor(x);let y=[],S=[],M=[],E=[],T=0,b=0;w("z","y","x",-1,-1,m,p,d,x,_,0),w("z","y","x",1,-1,m,p,-d,x,_,1),w("x","z","y",1,1,d,m,p,g,x,2),w("x","z","y",1,-1,d,m,-p,g,x,3),w("x","y","z",1,-1,d,p,m,g,_,4),w("x","y","z",-1,-1,d,p,-m,g,_,5),this.setIndex(y),this.setAttribute("position",new En(S,3)),this.setAttribute("normal",new En(M,3)),this.setAttribute("uv",new En(E,2));function w(C,N,A,R,P,F,L,U,k,I,D){let z=F/k,W=L/I,H=F/2,X=L/2,J=U/2,G=k+1,Q=I+1,it=0,j=0,_t=new q;for(let rt=0;rt<Q;rt++){let ut=rt*W-X;for(let mt=0;mt<G;mt++){let Nt=mt*z-H;_t[C]=Nt*R,_t[N]=ut*P,_t[A]=J,S.push(_t.x,_t.y,_t.z),_t[C]=0,_t[N]=0,_t[A]=U>0?1:-1,M.push(_t.x,_t.y,_t.z),E.push(mt/k),E.push(1-rt/I),it+=1}}for(let rt=0;rt<I;rt++)for(let ut=0;ut<k;ut++){let mt=T+ut+G*rt,Nt=T+ut+G*(rt+1),ot=T+(ut+1)+G*(rt+1),ft=T+(ut+1)+G*rt;y.push(mt,Nt,ft),y.push(Nt,ot,ft),j+=6}v.addGroup(b,j,D),b+=j,T+=it}}copy(d){return super.copy(d),this.parameters=Object.assign({},d.parameters),this}static fromJSON(d){return new Os(d.width,d.height,d.depth,d.widthSegments,d.heightSegments,d.depthSegments)}}class Rr extends Qe{constructor(d=1,p=1,m=1,g=1){super();this.type="PlaneGeometry",this.parameters={width:d,height:p,widthSegments:m,heightSegments:g};let _=d/2,x=p/2,v=Math.floor(m),y=Math.floor(g),S=v+1,M=y+1,E=d/v,T=p/y,b=[],w=[],C=[],N=[];for(let A=0;A<M;A++){let R=A*T-x;for(let P=0;P<S;P++){let F=P*E-_;w.push(F,-R,0),C.push(0,0,1),N.push(P/v),N.push(1-A/y)}}for(let A=0;A<y;A++)for(let R=0;R<v;R++){let P=R+S*A,F=R+S*(A+1),L=R+1+S*(A+1),U=R+1+S*A;b.push(P,F,U),b.push(F,L,U)}this.setIndex(b),this.setAttribute("position",new En(w,3)),this.setAttribute("normal",new En(C,3)),this.setAttribute("uv",new En(N,2))}copy(d){return super.copy(d),this.parameters=Object.assign({},d.parameters),this}static fromJSON(d){return new Rr(d.width,d.height,d.widthSegments,d.heightSegments)}}function ts(d){let p={};for(let m in d){p[m]={};for(let g in d[m]){let _=d[m][g];if(Iu(_))if(_.isRenderTargetTexture)Xt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),p[m][g]=null;else p[m][g]=_.clone();else if(Array.isArray(_))if(Iu(_[0])){let x=[];for(let v=0,y=_.length;v<y;v++)x[v]=_[v].clone();p[m][g]=x}else p[m][g]=_.slice();else p[m][g]=_}}return p}function fn(d){let p={};for(let m=0;m<d.length;m++){let g=ts(d[m]);for(let _ in g)p[_]=g[_]}return p}function Iu(d){return d&&(d.isColor||d.isMatrix3||d.isMatrix4||d.isVector2||d.isVector3||d.isVector4||d.isTexture||d.isQuaternion)}function jm(d){let p=[];for(let m=0;m<d.length;m++)p.push(d[m].clone());return p}function Ic(d){let p=d.getRenderTarget();if(p===null)return d.outputColorSpace;if(p.isXRRenderTarget===!0)return p.texture.colorSpace;return le.workingColorSpace}var Hd={clone:ts,merge:fn},Qm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,tg=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class mi extends fi{constructor(d){super();if(this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Qm,this.fragmentShader=tg,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,d!==void 0)this.setValues(d)}copy(d){return super.copy(d),this.fragmentShader=d.fragmentShader,this.vertexShader=d.vertexShader,this.uniforms=ts(d.uniforms),this.uniformsGroups=jm(d.uniformsGroups),this.defines=Object.assign({},d.defines),this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.fog=d.fog,this.lights=d.lights,this.clipping=d.clipping,this.extensions=Object.assign({},d.extensions),this.glslVersion=d.glslVersion,this.defaultAttributeValues=Object.assign({},d.defaultAttributeValues),this.index0AttributeName=d.index0AttributeName,this.uniformsNeedUpdate=d.uniformsNeedUpdate,this}toJSON(d){let p=super.toJSON(d);p.glslVersion=this.glslVersion,p.uniforms={};for(let g in this.uniforms){let x=this.uniforms[g].value;if(x&&x.isTexture)p.uniforms[g]={type:"t",value:x.toJSON(d).uuid};else if(x&&x.isColor)p.uniforms[g]={type:"c",value:x.getHex()};else if(x&&x.isVector2)p.uniforms[g]={type:"v2",value:x.toArray()};else if(x&&x.isVector3)p.uniforms[g]={type:"v3",value:x.toArray()};else if(x&&x.isVector4)p.uniforms[g]={type:"v4",value:x.toArray()};else if(x&&x.isMatrix3)p.uniforms[g]={type:"m3",value:x.toArray()};else if(x&&x.isMatrix4)p.uniforms[g]={type:"m4",value:x.toArray()};else p.uniforms[g]={value:x}}if(Object.keys(this.defines).length>0)p.defines=this.defines;p.vertexShader=this.vertexShader,p.fragmentShader=this.fragmentShader,p.lights=this.lights,p.clipping=this.clipping;let m={};for(let g in this.extensions)if(this.extensions[g]===!0)m[g]=!0;if(Object.keys(m).length>0)p.extensions=m;return p}fromJSON(d,p){if(super.fromJSON(d,p),d.uniforms!==void 0)for(let m in d.uniforms){let g=d.uniforms[m];switch(this.uniforms[m]={},g.type){case"t":this.uniforms[m].value=p[g.value]||null;break;case"c":this.uniforms[m].value=new se().setHex(g.value);break;case"v2":this.uniforms[m].value=new Jt().fromArray(g.value);break;case"v3":this.uniforms[m].value=new q().fromArray(g.value);break;case"v4":this.uniforms[m].value=new Be().fromArray(g.value);break;case"m3":this.uniforms[m].value=new Kt().fromArray(g.value);break;case"m4":this.uniforms[m].value=new ie().fromArray(g.value);break;default:this.uniforms[m].value=g.value}}if(d.defines!==void 0)this.defines=d.defines;if(d.vertexShader!==void 0)this.vertexShader=d.vertexShader;if(d.fragmentShader!==void 0)this.fragmentShader=d.fragmentShader;if(d.glslVersion!==void 0)this.glslVersion=d.glslVersion;if(d.extensions!==void 0)for(let m in d.extensions)this.extensions[m]=d.extensions[m];if(d.lights!==void 0)this.lights=d.lights;if(d.clipping!==void 0)this.clipping=d.clipping;return this}}class Pc extends mi{constructor(d){super(d);this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Zo extends fi{constructor(d){super();this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new se(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new se(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new Jt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new li,this.combine=0,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=0.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(d)}copy(d){return super.copy(d),this.color.copy(d.color),this.map=d.map,this.lightMap=d.lightMap,this.lightMapIntensity=d.lightMapIntensity,this.aoMap=d.aoMap,this.aoMapIntensity=d.aoMapIntensity,this.emissive.copy(d.emissive),this.emissiveMap=d.emissiveMap,this.emissiveIntensity=d.emissiveIntensity,this.bumpMap=d.bumpMap,this.bumpScale=d.bumpScale,this.normalMap=d.normalMap,this.normalMapType=d.normalMapType,this.normalScale.copy(d.normalScale),this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this.specularMap=d.specularMap,this.alphaMap=d.alphaMap,this.envMap=d.envMap,this.envMapRotation.copy(d.envMapRotation),this.combine=d.combine,this.reflectivity=d.reflectivity,this.envMapIntensity=d.envMapIntensity,this.refractionRatio=d.refractionRatio,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this.wireframeLinecap=d.wireframeLinecap,this.wireframeLinejoin=d.wireframeLinejoin,this.flatShading=d.flatShading,this.fog=d.fog,this}}class Lc extends fi{constructor(d){super();this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(d)}copy(d){return super.copy(d),this.depthPacking=d.depthPacking,this.map=d.map,this.alphaMap=d.alphaMap,this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this.wireframe=d.wireframe,this.wireframeLinewidth=d.wireframeLinewidth,this}}class Nc extends fi{constructor(d){super();this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(d)}copy(d){return super.copy(d),this.map=d.map,this.alphaMap=d.alphaMap,this.displacementMap=d.displacementMap,this.displacementScale=d.displacementScale,this.displacementBias=d.displacementBias,this}}function ys(d,p){if(!d||d.constructor===p)return d;if(typeof p.BYTES_PER_ELEMENT==="number")return new p(d);return Array.prototype.slice.call(d)}function bo(d){return d!==void 0&&d.inTangents!==void 0&&d.outTangents!==void 0}class es{constructor(d,p,m,g){this.parameterPositions=d,this._cachedIndex=0,this.resultBuffer=g!==void 0?g:new p.constructor(m),this.sampleValues=p,this.valueSize=m,this.settings=null,this.DefaultSettings_={}}evaluate(d){let p=this.parameterPositions,m=this._cachedIndex,g=p[m],_=p[m-1];n:{t:{let x;e:{i:if(!(d<g)){for(let v=m+2;;){if(g===void 0){if(d<_)break i;return m=p.length,this._cachedIndex=m,this.copySampleValue_(m-1)}if(m===v)break;if(_=g,g=p[++m],d<g)break t}x=p.length;break e}if(!(d>=_)){let v=p[1];if(d<v)m=2,_=v;for(let y=m-2;;){if(_===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(m===y)break;if(g=_,_=p[--m-1],d>=_)break t}x=m,m=0;break e}break n}while(m<x){let v=m+x>>>1;if(d<p[v])x=v;else m=v+1}if(g=p[m],_=p[m-1],_===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(g===void 0)return m=p.length,this._cachedIndex=m,this.copySampleValue_(m-1)}this._cachedIndex=m,this.intervalChanged_(m,_,g)}return this.interpolate_(m,_,d,g)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(d){let p=this.resultBuffer,m=this.sampleValues,g=this.valueSize,_=d*g;for(let x=0;x!==g;++x)p[x]=m[_+x];return p}interpolate_(){throw Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Dc extends es{constructor(d,p,m,g){super(d,p,m,g);this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(d,p,m){let g=this.parameterPositions,_=d-2,x=d+1,v=g[_],y=g[x];if(v===void 0)switch(this.getSettings_().endingStart){case 2401:_=d,v=2*p-m;break;case 2402:_=g.length-2,v=p+g[_]-g[_+1];break;default:_=d,v=m}if(y===void 0)switch(this.getSettings_().endingEnd){case 2401:x=d,y=2*m-p;break;case 2402:x=1,y=m+g[1]-g[0];break;default:x=d-1,y=p}let S=(m-p)*0.5,M=this.valueSize;this._weightPrev=S/(p-v),this._weightNext=S/(y-m),this._offsetPrev=_*M,this._offsetNext=x*M}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,M=this._offsetPrev,E=this._offsetNext,T=this._weightPrev,b=this._weightNext,w=(m-p)/(g-p),C=w*w,N=C*w,A=-T*N+2*T*C-T*w,R=(1+T)*N+(-1.5-2*T)*C+(-0.5+T)*w+1,P=(-1-b)*N+(1.5+b)*C+0.5*w,F=b*N-b*C;for(let L=0;L!==v;++L)_[L]=A*x[M+L]+R*x[S+L]+P*x[y+L]+F*x[E+L];return _}}class Uc extends es{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,M=(m-p)/(g-p),E=1-M;for(let T=0;T!==v;++T)_[T]=x[S+T]*E+x[y+T]*M;return _}}class Fc extends es{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d){return this.copySampleValue_(d-1)}}class Oc extends es{interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=d*v,S=y-v,M=this.inTangents,E=this.outTangents;if(!M||!E){let w=(m-p)/(g-p),C=1-w;for(let N=0;N!==v;++N)_[N]=x[S+N]*C+x[y+N]*w;return _}let T=v*2,b=d-1;for(let w=0;w!==v;++w){let C=x[S+w],N=x[y+w],A=b*T+w*2,R=E[A],P=E[A+1],F=d*T+w*2,L=M[F],U=M[F+1],k=ng(m,p,R,L,g);_[w]=Gd(k,C,P,U,N)}return _}}function Gd(d,p,m,g,_){let x=1-d;return x*x*x*p+3*x*x*d*m+3*x*d*d*g+d*d*d*_}function eg(d,p,m,g,_){let x=1-d;return 3*x*x*(m-p)+6*x*d*(g-m)+3*d*d*(_-g)}function ng(d,p,m,g,_){let x=(d-p)/(_-p);for(let v=0;v<8;v++){let y=Gd(x,p,m,g,_)-d;if(Math.abs(y)<0.0000000001)break;let S=eg(x,p,m,g,_);if(Math.abs(S)<0.0000000001)break;x=Math.max(0,Math.min(1,x-y/S))}return x}class Un{constructor(d,p,m,g){if(d===void 0)throw Error("THREE.KeyframeTrack: track name is undefined");if(p===void 0||p.length===0)throw Error("THREE.KeyframeTrack: no keyframes in track named "+d);this.name=d,this.times=ys(p,this.TimeBufferType),this.values=ys(m,this.ValueBufferType),this.setInterpolation(g||this.DefaultInterpolation)}static toJSON(d){let p=d.constructor,m;if(p.toJSON!==this.toJSON)m=p.toJSON(d);else{m={name:d.name,times:ys(d.times,Array),values:ys(d.values,Array)};let g=d.getInterpolation();if(g!==d.DefaultInterpolation)m.interpolation=g;if(bo(d.settings))m.settings={inTangents:ys(d.settings.inTangents,Array),outTangents:ys(d.settings.outTangents,Array)}}return m.type=d.ValueTypeName,m}InterpolantFactoryMethodDiscrete(d){return new Fc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodLinear(d){return new Uc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodSmooth(d){return new Dc(this.times,this.values,this.getValueSize(),d)}InterpolantFactoryMethodBezier(d){let p=new Oc(this.times,this.values,this.getValueSize(),d);if(this.settings)p.inTangents=this.settings.inTangents,p.outTangents=this.settings.outTangents;return p}setInterpolation(d){let p;switch(d){case 2300:p=this.InterpolantFactoryMethodDiscrete;break;case 2301:p=this.InterpolantFactoryMethodLinear;break;case 2302:p=this.InterpolantFactoryMethodSmooth;break;case 2303:p=this.InterpolantFactoryMethodBezier;break}if(p===void 0){let m="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(d!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(m);return Xt("KeyframeTrack:",m),this}return this.createInterpolant=p,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302;case this.InterpolantFactoryMethodBezier:return 2303}}getValueSize(){return this.values.length/this.times.length}shift(d){if(d!==0){let p=this.times;for(let m=0,g=p.length;m!==g;++m)p[m]+=d;if(bo(this.settings))Pu(this.settings.inTangents,d),Pu(this.settings.outTangents,d)}return this}scale(d){if(d!==1){let p=this.times;for(let m=0,g=p.length;m!==g;++m)p[m]*=d;if(bo(this.settings))Lu(this.settings.inTangents,d),Lu(this.settings.outTangents,d)}return this}trim(d,p){let m=this.times,g=m.length,_=0,x=g-1;while(_!==g&&m[_]<d)++_;while(x!==-1&&m[x]>p)--x;if(++x,_!==0||x!==g){if(_>=x)x=Math.max(x,1),_=x-1;let v=this.getValueSize();this.times=m.slice(_,x),this.values=this.values.slice(_*v,x*v)}return this}validate(){let d=!0,p=this.getValueSize();if(p-Math.floor(p)!==0)$t("KeyframeTrack: Invalid value size in track.",this),d=!1;let m=this.times,g=this.values,_=m.length;if(_===0)$t("KeyframeTrack: Track is empty.",this),d=!1;let x=null;for(let v=0;v!==_;v++){let y=m[v];if(typeof y==="number"&&isNaN(y)){$t("KeyframeTrack: Time is not a valid number.",this,v,y),d=!1;break}if(x!==null&&x>y){$t("KeyframeTrack: Out of order keys.",this,v,y,x),d=!1;break}x=y}if(g!==void 0){if(um(g))for(let v=0,y=g.length;v!==y;++v){let S=g[v];if(isNaN(S)){$t("KeyframeTrack: Value is not a valid number.",this,v,S),d=!1;break}}}return d}optimize(){let d=this.times.slice(),p=this.values.slice(),m=this.getValueSize(),g=this.getInterpolation()===2302,_=d.length-1,x=1;for(let v=1;v<_;++v){let y=!1,S=d[v],M=d[v+1];if(S!==M&&(v!==1||S!==d[0]))if(!g){let E=v*m,T=E-m,b=E+m;for(let w=0;w!==m;++w){let C=p[E+w];if(C!==p[T+w]||C!==p[b+w]){y=!0;break}}}else y=!0;if(y){if(v!==x){d[x]=d[v];let E=v*m,T=x*m;for(let b=0;b!==m;++b)p[T+b]=p[E+b]}++x}}if(_>0){d[x]=d[_];for(let v=_*m,y=x*m,S=0;S!==m;++S)p[y+S]=p[v+S];++x}if(x!==d.length)this.times=d.slice(0,x),this.values=p.slice(0,x*m);else this.times=d,this.values=p;return this}clone(){let d=this.times.slice(),p=this.values.slice(),g=new this.constructor(this.name,d,p);if(g.createInterpolant=this.createInterpolant,bo(this.settings))g.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()};return g}}function Pu(d,p){for(let m=0,g=d.length;m!==g;m+=2)d[m]+=p}function Lu(d,p){for(let m=0,g=d.length;m!==g;m+=2)d[m]*=p}Un.prototype.ValueTypeName="";Un.prototype.TimeBufferType=Float32Array;Un.prototype.ValueBufferType=Float32Array;Un.prototype.DefaultInterpolation=2301;class ns extends Un{constructor(d,p,m){super(d,p,m)}}ns.prototype.ValueTypeName="bool";ns.prototype.ValueBufferType=Array;ns.prototype.DefaultInterpolation=2300;ns.prototype.InterpolantFactoryMethodLinear=void 0;ns.prototype.InterpolantFactoryMethodSmooth=void 0;class Bc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}Bc.prototype.ValueTypeName="color";class kc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}kc.prototype.ValueTypeName="number";class zc extends es{constructor(d,p,m,g){super(d,p,m,g)}interpolate_(d,p,m,g){let _=this.resultBuffer,x=this.sampleValues,v=this.valueSize,y=(m-p)/(g-p),S=d*v;for(let M=S+v;S!==M;S+=4)di.slerpFlat(_,0,x,S-v,x,S,y);return _}}class $o extends Un{constructor(d,p,m,g){super(d,p,m,g)}InterpolantFactoryMethodLinear(d){return new zc(this.times,this.values,this.getValueSize(),d)}}$o.prototype.ValueTypeName="quaternion";$o.prototype.InterpolantFactoryMethodSmooth=void 0;class is extends Un{constructor(d,p,m){super(d,p,m)}}is.prototype.ValueTypeName="string";is.prototype.ValueBufferType=Array;is.prototype.DefaultInterpolation=2300;is.prototype.InterpolantFactoryMethodLinear=void 0;is.prototype.InterpolantFactoryMethodSmooth=void 0;class Hc extends Un{constructor(d,p,m,g){super(d,p,m,g)}}Hc.prototype.ValueTypeName="vector";var yl={enabled:!1,files:{},add:function(d,p){if(this.enabled===!1)return;if(Nu(d))return;this.files[d]=p},get:function(d){if(this.enabled===!1)return;if(Nu(d))return;return this.files[d]},remove:function(d){delete this.files[d]},clear:function(){this.files={}}};function Nu(d){try{let p=d.slice(d.indexOf(":")+1);return new URL(p).protocol==="blob:"}catch(p){return!1}}class Gc{constructor(d,p,m){let g=this,_=!1,x=0,v=0,y=void 0,S=[];this.onStart=void 0,this.onLoad=d,this.onProgress=p,this.onError=m,this._abortController=null,this.itemStart=function(M){if(v++,_===!1){if(g.onStart!==void 0)g.onStart(M,x,v)}_=!0},this.itemEnd=function(M){if(x++,g.onProgress!==void 0)g.onProgress(M,x,v);if(x===v){if(_=!1,g.onLoad!==void 0)g.onLoad()}},this.itemError=function(M){if(g.onError!==void 0)g.onError(M)},this.resolveURL=function(M){if(M=M.normalize("NFC"),y)return y(M);return M},this.setURLModifier=function(M){return y=M,this},this.addHandler=function(M,E){return S.push(M,E),this},this.removeHandler=function(M){let E=S.indexOf(M);if(E!==-1)S.splice(E,2);return this},this.getHandler=function(M){for(let E=0,T=S.length;E<T;E+=2){let b=S[E],w=S[E+1];if(b.global)b.lastIndex=0;if(b.test(M))return w}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){if(!this._abortController)this._abortController=new AbortController;return this._abortController}}var Vd=new Gc;class Cr{constructor(d){if(this.manager=d!==void 0?d:Vd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(d,p){let m=this;return new Promise(function(g,_){m.load(d,g,p,_)})}parse(){}setCrossOrigin(d){return this.crossOrigin=d,this}setWithCredentials(d){return this.withCredentials=d,this}setPath(d){return this.path=d,this}setResourcePath(d){return this.resourcePath=d,this}setRequestHeader(d){return this.requestHeader=d,this}setPriority(d){return this.priority=d,this}setCache(d){return this.cache=d,this}abort(){return this}}Cr.DEFAULT_MATERIAL_NAME="__DEFAULT";var oi={};class Wd extends Error{constructor(d,p){super(d);this.response=p}}class Vc extends Cr{constructor(d){super(d);this.mimeType="",this.responseType="",this._abortController=new AbortController}load(d,p,m,g){if(d===void 0)d="";if(this.path!==void 0)d=this.path+d;d=this.manager.resolveURL(d);let _=yl.get(`file:${d}`);if(_!==void 0){this.manager.itemStart(d),setTimeout(()=>{if(p)p(_);this.manager.itemEnd(d)},0);return}if(oi[d]!==void 0){oi[d].push({onLoad:p,onProgress:m,onError:g});return}oi[d]=[],oi[d].push({onLoad:p,onProgress:m,onError:g});let x=new Request(d,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any==="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),v=this.mimeType,y=this.responseType;fetch(x).then((S)=>{if(S.status===200||S.status===0){if(S.status===0)Xt("FileLoader: HTTP Status 0 received.");if(typeof ReadableStream>"u"||S.body===void 0||S.body.getReader===void 0)return S;let M=oi[d],E=S.body.getReader(),T=S.headers.get("X-File-Size")||S.headers.get("Content-Length"),b=T?parseInt(T):0,w=b!==0,C=0,N=new ReadableStream({start(A){R();function R(){E.read().then(({done:P,value:F})=>{if(P)A.close();else{C+=F.byteLength;let L=new ProgressEvent("progress",{lengthComputable:w,loaded:C,total:b});for(let U=0,k=M.length;U<k;U++){let I=M[U];if(I.onProgress)I.onProgress(L)}A.enqueue(F),R()}},(P)=>{A.error(P)})}}});return new Response(N)}else throw new Wd(`fetch for "${S.url}" responded with ${S.status}: ${S.statusText}`,S)}).then((S)=>{switch(y){case"arraybuffer":return S.arrayBuffer();case"blob":return S.blob();case"document":return S.text().then((M)=>new DOMParser().parseFromString(M,v));case"json":return S.json();default:if(v==="")return S.text();else{let E=/charset="?([^;"\s]*)"?/i.exec(v),T=E&&E[1]?E[1].toLowerCase():void 0,b=new TextDecoder(T);return S.arrayBuffer().then((w)=>b.decode(w))}}}).then((S)=>{yl.add(`file:${d}`,S);let M=oi[d];delete oi[d];for(let E=0,T=M.length;E<T;E++){let b=M[E];if(b.onLoad)b.onLoad(S)}}).catch((S)=>{let M=oi[d];if(M===void 0)throw this.manager.itemError(d),S;delete oi[d];for(let E=0,T=M.length;E<T;E++){let b=M[E];if(b.onError)b.onError(S)}this.manager.itemError(d)}).finally(()=>{this.manager.itemEnd(d)}),this.manager.itemStart(d)}setResponseType(d){return this.responseType=d,this}setMimeType(d){return this.mimeType=d,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Jo extends Cr{constructor(d){super(d)}load(d,p,m,g){let _=this,x=[],v=new Ar,y=new Vc(this.manager);y.setPriority(this.priority),y.setCache(this.cache),y.setPath(this.path),y.setResponseType("arraybuffer"),y.setRequestHeader(this.requestHeader),y.setWithCredentials(_.withCredentials);let S=0;function M(E){y.load(d[E],function(T){let b=_.parse(T,!0);if(x[E]={width:b.width,height:b.height,format:b.format,mipmaps:b.mipmaps},S+=1,S===6){if(b.mipmapCount===1)v.minFilter=1006;if(v.image=x,v.format=b.format,v.needsUpdate=!0,p)p(v)}},m,g)}if(Array.isArray(d))for(let E=0,T=d.length;E<T;++E)M(E);else y.load(d,function(E){let T=_.parse(E,!0);if(T.isCubemap){let b=T.mipmaps.length/T.mipmapCount;for(let w=0;w<b;w++){x[w]={mipmaps:[]};for(let C=0;C<T.mipmapCount;C++)x[w].mipmaps.push(T.mipmaps[w*T.mipmapCount+C]),x[w].format=T.format,x[w].width=T.width,x[w].height=T.height}v.image=x}else v.image.width=T.width,v.image.height=T.height,v.mipmaps=T.mipmaps;if(T.mipmapCount===1)v.minFilter=1006;if(v.format=T.format,v.needsUpdate=!0,p)p(v)},m,g);return v}}class Ko extends Xe{static registerNode(d){this.prototype._lightNode=d}constructor(d,p=1){super();this.isLight=!0,this.type="Light",this.color=new se(d),this.intensity=p}copy(d,p){return super.copy(d,p),this.color.copy(d.color),this.intensity=d.intensity,this}toJSON(d){let p=super.toJSON(d);return p.object.color=this.color.getHex(),p.object.intensity=this.intensity,p}}var _l=new ie,Du=new q,Uu=new q;class Wc{constructor(d){this.camera=d,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Jt(512,512),this.mapType=1009,this.map=null,this.mapPass=null,this.matrix=new ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ei,this._frameExtents=new Jt(1,1),this._viewportCount=1,this._viewports=[new Be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(d){let p=this.camera;Du.setFromMatrixPosition(d.matrixWorld),p.position.copy(Du),Uu.setFromMatrixPosition(d.target.matrixWorld),p.lookAt(Uu),p.updateMatrixWorld(),this._updateMatrix(p,this.matrix,this._frustum)}_updateMatrix(d,p,m,g){_l.multiplyMatrices(d.projectionMatrix,d.matrixWorldInverse),m.setFromProjectionMatrix(_l,d.coordinateSystem,d.reversedDepth);let _=this._frameExtents,x=g?g.z/_.x:1,v=g?g.w/_.y:1,y=g?g.x/_.x:0,S=g?g.y/_.y:0;if(d.coordinateSystem===2001||d.reversedDepth)p.set(0.5*x,0,0,0.5*x+y,0,0.5*v,0,0.5*v+S,0,0,1,0,0,0,0,1);else p.set(0.5*x,0,0,0.5*x+y,0,0.5*v,0,0.5*v+S,0,0,0.5,0.5,0,0,0,1);p.multiply(_l)}getViewport(d){return this._viewports[d]}getFrameExtents(){return this._frameExtents}dispose(){if(this.map)this.map.dispose();if(this.mapPass)this.mapPass.dispose()}copy(d){return this.camera=d.camera.clone(),this.intensity=d.intensity,this.bias=d.bias,this.radius=d.radius,this.autoUpdate=d.autoUpdate,this.needsUpdate=d.needsUpdate,this.normalBias=d.normalBias,this.blurSamples=d.blurSamples,this.mapSize.copy(d.mapSize),this.mapType=d.mapType,this.biasNode=d.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let d={};return d.intensity=this.intensity,d.bias=this.bias,d.normalBias=this.normalBias,d.radius=this.radius,d.blurSamples=this.blurSamples,d.mapSize=this.mapSize.toArray(),d.mapType=this.mapType,d.camera=this.camera.toJSON(!1).object,delete d.camera.matrix,d}}var Eo=new q,To=new di,qn=new q;class jo extends Xe{constructor(){super();this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ie,this.projectionMatrix=new ie,this.projectionMatrixInverse=new ie,this.coordinateSystem=2000,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(d,p){return super.copy(d,p),this.matrixWorldInverse.copy(d.matrixWorldInverse),this.projectionMatrix.copy(d.projectionMatrix),this.projectionMatrixInverse.copy(d.projectionMatrixInverse),this.coordinateSystem=d.coordinateSystem,this}getWorldDirection(d){return super.getWorldDirection(d).negate()}updateMatrixWorld(d){if(super.updateMatrixWorld(d),this.matrixWorld.decompose(Eo,To,qn),qn.x===1&&qn.y===1&&qn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Eo,To,qn.set(1,1,1)).invert()}updateWorldMatrix(d,p,m=!1){if(super.updateWorldMatrix(d,p,m),this.matrixWorld.decompose(Eo,To,qn),qn.x===1&&qn.y===1&&qn.z===1)this.matrixWorldInverse.copy(this.matrixWorld).invert();else this.matrixWorldInverse.compose(Eo,To,qn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}var bi=new q,Fu=new Jt,Ou=new Jt;class bn extends jo{constructor(d=50,p=1,m=0.1,g=2000){super();this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=d,this.zoom=1,this.near=m,this.far=g,this.focus=10,this.aspect=p,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(d,p){return super.copy(d,p),this.fov=d.fov,this.zoom=d.zoom,this.near=d.near,this.far=d.far,this.focus=d.focus,this.aspect=d.aspect,this.view=d.view===null?null:Object.assign({},d.view),this.filmGauge=d.filmGauge,this.filmOffset=d.filmOffset,this}setFocalLength(d){let p=0.5*this.getFilmHeight()/d;this.fov=Cs*2*Math.atan(p),this.updateProjectionMatrix()}getFocalLength(){let d=Math.tan(hr*0.5*this.fov);return 0.5*this.getFilmHeight()/d}getEffectiveFOV(){return Cs*2*Math.atan(Math.tan(hr*0.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(d,p,m){bi.set(-1,-1,0.5).applyMatrix4(this.projectionMatrixInverse),p.set(bi.x,bi.y).multiplyScalar(-d/bi.z),bi.set(1,1,0.5).applyMatrix4(this.projectionMatrixInverse),m.set(bi.x,bi.y).multiplyScalar(-d/bi.z)}getViewSize(d,p){return this.getViewBounds(d,Fu,Ou),p.subVectors(Ou,Fu)}setViewOffset(d,p,m,g,_,x){if(this.aspect=d/p,this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=d,this.view.fullHeight=p,this.view.offsetX=m,this.view.offsetY=g,this.view.width=_,this.view.height=x,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let d=this.near,p=d*Math.tan(hr*0.5*this.fov)/this.zoom,m=2*p,g=this.aspect*m,_=-0.5*g,x=this.view;if(this.view!==null&&this.view.enabled){let{fullWidth:y,fullHeight:S}=x;_+=x.offsetX*g/y,p-=x.offsetY*m/S,g*=x.width/y,m*=x.height/S}let v=this.filmOffset;if(v!==0)_+=d*v/this.getFilmWidth();this.projectionMatrix.makePerspective(_,_+g,p,p-m,d,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(d){let p=super.toJSON(d);if(p.object.fov=this.fov,p.object.zoom=this.zoom,p.object.near=this.near,p.object.far=this.far,p.object.focus=this.focus,p.object.aspect=this.aspect,this.view!==null)p.object.view=Object.assign({},this.view);return p.object.filmGauge=this.filmGauge,p.object.filmOffset=this.filmOffset,p}}class Qo extends jo{constructor(d=-1,p=1,m=1,g=-1,_=0.1,x=2000){super();this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=d,this.right=p,this.top=m,this.bottom=g,this.near=_,this.far=x,this.updateProjectionMatrix()}copy(d,p){return super.copy(d,p),this.left=d.left,this.right=d.right,this.top=d.top,this.bottom=d.bottom,this.near=d.near,this.far=d.far,this.zoom=d.zoom,this.view=d.view===null?null:Object.assign({},d.view),this}setViewOffset(d,p,m,g,_,x){if(this.view===null)this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1};this.view.enabled=!0,this.view.fullWidth=d,this.view.fullHeight=p,this.view.offsetX=m,this.view.offsetY=g,this.view.width=_,this.view.height=x,this.updateProjectionMatrix()}clearViewOffset(){if(this.view!==null)this.view.enabled=!1;this.updateProjectionMatrix()}updateProjectionMatrix(){let d=(this.right-this.left)/(2*this.zoom),p=(this.top-this.bottom)/(2*this.zoom),m=(this.right+this.left)/2,g=(this.top+this.bottom)/2,_=m-d,x=m+d,v=g+p,y=g-p;if(this.view!==null&&this.view.enabled){let S=(this.right-this.left)/this.view.fullWidth/this.zoom,M=(this.top-this.bottom)/this.view.fullHeight/this.zoom;_+=S*this.view.offsetX,x=_+S*this.view.width,v-=M*this.view.offsetY,y=v-M*this.view.height}this.projectionMatrix.makeOrthographic(_,x,v,y,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(d){let p=super.toJSON(d);if(p.object.zoom=this.zoom,p.object.left=this.left,p.object.right=this.right,p.object.top=this.top,p.object.bottom=this.bottom,p.object.near=this.near,p.object.far=this.far,this.view!==null)p.object.view=Object.assign({},this.view);return p}}class Xd extends Wc{constructor(){super(new Qo(-5,5,5,-5,0.5,500));this.isDirectionalLightShadow=!0}}class ta extends Ko{constructor(d,p){super(d,p);this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Xe.DEFAULT_UP),this.updateMatrix(),this.target=new Xe,this.shadow=new Xd}dispose(){super.dispose(),this.shadow.dispose()}copy(d){return super.copy(d),this.target=d.target.clone(),this.shadow=d.shadow.clone(),this}toJSON(d){let p=super.toJSON(d);return p.object.shadow=this.shadow.toJSON(),p.object.target=this.target.uuid,p}}class ea extends Ko{constructor(d,p){super(d,p);this.isAmbientLight=!0,this.type="AmbientLight"}}var Ss=-90,Ms=1;class Ir extends Xe{constructor(d,p,m){super();this.type="CubeCamera",this.renderTarget=m,this.coordinateSystem=null,this.activeMipmapLevel=0;let g=new bn(Ss,Ms,d,p);g.layers=this.layers,this.add(g);let _=new bn(Ss,Ms,d,p);_.layers=this.layers,this.add(_);let x=new bn(Ss,Ms,d,p);x.layers=this.layers,this.add(x);let v=new bn(Ss,Ms,d,p);v.layers=this.layers,this.add(v);let y=new bn(Ss,Ms,d,p);y.layers=this.layers,this.add(y);let S=new bn(Ss,Ms,d,p);S.layers=this.layers,this.add(S)}updateCoordinateSystem(){let d=this.coordinateSystem,p=this.children.concat(),[m,g,_,x,v,y]=p;for(let S of p)this.remove(S);if(d===2000)m.up.set(0,1,0),m.lookAt(1,0,0),g.up.set(0,1,0),g.lookAt(-1,0,0),_.up.set(0,0,-1),_.lookAt(0,1,0),x.up.set(0,0,1),x.lookAt(0,-1,0),v.up.set(0,1,0),v.lookAt(0,0,1),y.up.set(0,1,0),y.lookAt(0,0,-1);else if(d===2001)m.up.set(0,-1,0),m.lookAt(-1,0,0),g.up.set(0,-1,0),g.lookAt(1,0,0),_.up.set(0,0,1),_.lookAt(0,1,0),x.up.set(0,0,-1),x.lookAt(0,-1,0),v.up.set(0,-1,0),v.lookAt(0,0,1),y.up.set(0,-1,0),y.lookAt(0,0,-1);else throw Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+d);for(let S of p)this.add(S),S.updateMatrixWorld()}update(d,p){if(this.parent===null)this.updateMatrixWorld();let{renderTarget:m,activeMipmapLevel:g}=this;if(this.coordinateSystem!==d.coordinateSystem)this.coordinateSystem=d.coordinateSystem,this.updateCoordinateSystem();let[_,x,v,y,S,M]=this.children,E=d.getRenderTarget(),T=d.getActiveCubeFace(),b=d.getActiveMipmapLevel(),w=d.xr.enabled;d.xr.enabled=!1;let C=m.texture.mipmapsAutoUpdate;m.texture.mipmapsAutoUpdate=!1;let N=!1;if(d.isWebGLRenderer===!0)N=d.state.buffers.depth.getReversed();else N=d.reversedDepthBuffer;if(d.setRenderTarget(m,0,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,_),d.setRenderTarget(m,1,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,x),d.setRenderTarget(m,2,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,v),d.setRenderTarget(m,3,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,y),d.setRenderTarget(m,4,g),N&&d.autoClear===!1)d.clearDepth();if(d.render(p,S),m.texture.mipmapsAutoUpdate=C,d.setRenderTarget(m,5,g),N&&d.autoClear===!1)d.clearDepth();d.render(p,M),d.setRenderTarget(E,T,b),d.xr.enabled=w,m.texture.needsPMREMUpdate=!0}}class Xc extends bn{constructor(d=[]){super();this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=d,this.perCameraFrustumCulled=!1}}var qc="\\[\\]\\.:\\/",ig=new RegExp("["+qc+"]","g"),Yc="[^"+qc+"]",sg="[^"+qc.replace("\\.","")+"]",rg=/((?:WC+[\/:])*)/.source.replace("WC",Yc),og=/(WCOD+)?/.source.replace("WCOD",sg),ag=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Yc),lg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Yc),cg=new RegExp("^"+rg+og+ag+lg+"$"),hg=["material","materials","bones","map"];class qd{constructor(d,p,m){let g=m||Ee.parseTrackName(p);this._targetGroup=d,this._bindings=d.subscribe_(p,g)}getValue(d,p){this.bind();let m=this._targetGroup.nCachedObjects_,g=this._bindings[m];if(g!==void 0)g.getValue(d,p)}setValue(d,p){let m=this._bindings;for(let g=this._targetGroup.nCachedObjects_,_=m.length;g!==_;++g)m[g].setValue(d,p)}bind(){let d=this._bindings;for(let p=this._targetGroup.nCachedObjects_,m=d.length;p!==m;++p)d[p].bind()}unbind(){let d=this._bindings;for(let p=this._targetGroup.nCachedObjects_,m=d.length;p!==m;++p)d[p].unbind()}}class Ee{constructor(d,p,m){this.path=p,this.parsedPath=m||Ee.parseTrackName(p),this.node=Ee.findNode(d,this.parsedPath.nodeName),this.rootNode=d,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(d,p,m){if(!(d&&d.isAnimationObjectGroup))return new Ee(d,p,m);else return new Ee.Composite(d,p,m)}static sanitizeNodeName(d){return d.replace(/\s/g,"_").replace(ig,"")}static parseTrackName(d){let p=cg.exec(d);if(p===null)throw Error("THREE.PropertyBinding: Cannot parse trackName: "+d);let m={nodeName:p[2],objectName:p[3],objectIndex:p[4],propertyName:p[5],propertyIndex:p[6]},g=m.nodeName&&m.nodeName.lastIndexOf(".");if(g!==void 0&&g!==-1){let _=m.nodeName.substring(g+1);if(hg.indexOf(_)!==-1)m.nodeName=m.nodeName.substring(0,g),m.objectName=_}if(m.propertyName===null||m.propertyName.length===0)throw Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+d);return m}static findNode(d,p){if(p===void 0||p===""||p==="."||p===-1||p===d.name||p===d.uuid)return d;if(d.skeleton){let m=d.skeleton.getBoneByName(p);if(m!==void 0)return m}if(d.children){let m=function(_){for(let x=0;x<_.length;x++){let v=_[x];if(v.name===p||v.uuid===p)return v;let y=m(v.children);if(y)return y}return null},g=m(d.children);if(g)return g}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(d,p){d[p]=this.targetObject[this.propertyName]}_getValue_array(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)d[p++]=m[g]}_getValue_arrayElement(d,p){d[p]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(d,p){this.resolvedProperty.toArray(d,p)}_setValue_direct(d,p){this.targetObject[this.propertyName]=d[p]}_setValue_direct_setNeedsUpdate(d,p){this.targetObject[this.propertyName]=d[p],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(d,p){this.targetObject[this.propertyName]=d[p],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++]}_setValue_array_setNeedsUpdate(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(d,p){let m=this.resolvedProperty;for(let g=0,_=m.length;g!==_;++g)m[g]=d[p++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(d,p){this.resolvedProperty[this.propertyIndex]=d[p]}_setValue_arrayElement_setNeedsUpdate(d,p){this.resolvedProperty[this.propertyIndex]=d[p],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(d,p){this.resolvedProperty[this.propertyIndex]=d[p],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(d,p){this.resolvedProperty.fromArray(d,p)}_setValue_fromArray_setNeedsUpdate(d,p){this.resolvedProperty.fromArray(d,p),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(d,p){this.resolvedProperty.fromArray(d,p),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(d,p){this.bind(),this.getValue(d,p)}_setValue_unbound(d,p){this.bind(),this.setValue(d,p)}bind(){let d=this.node,p=this.parsedPath,{objectName:m,propertyName:g,propertyIndex:_}=p;if(!d)d=Ee.findNode(this.rootNode,p.nodeName),this.node=d;if(this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!d){Xt("PropertyBinding: No target node found for track: "+this.path+".");return}if(m){let S=p.objectIndex;switch(m){case"materials":if(!d.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!d.material.materials){$t("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}d=d.material.materials;break;case"bones":if(!d.skeleton){$t("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}d=d.skeleton.bones;for(let M=0;M<d.length;M++)if(d[M].name===S){S=M;break}break;case"map":if("map"in d){d=d.map;break}if(!d.material){$t("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!d.material.map){$t("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}d=d.material.map;break;default:if(d[m]===void 0){$t("PropertyBinding: Can not bind to objectName of node undefined.",this);return}d=d[m]}if(S!==void 0){if(d[S]===void 0){$t("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,d);return}d=d[S]}}let x=d[g];if(x===void 0){let S=p.nodeName;$t("PropertyBinding: Trying to update property for track: "+S+"."+g+" but it wasn't found.",d);return}let v=this.Versioning.None;if(this.targetObject=d,d.isMaterial===!0)v=this.Versioning.NeedsUpdate;else if(d.isObject3D===!0)v=this.Versioning.MatrixWorldNeedsUpdate;let y=this.BindingType.Direct;if(_!==void 0){if(g==="morphTargetInfluences"){if(!d.geometry){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!d.geometry.morphAttributes){$t("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}if(d.morphTargetDictionary[_]!==void 0)_=d.morphTargetDictionary[_]}y=this.BindingType.ArrayElement,this.resolvedProperty=x,this.propertyIndex=_}else if(x.fromArray!==void 0&&x.toArray!==void 0)y=this.BindingType.HasFromToArray,this.resolvedProperty=x;else if(Array.isArray(x))y=this.BindingType.EntireArray,this.resolvedProperty=x;else this.propertyName=g;this.getValue=this.GetterByBindingType[y],this.setValue=this.SetterByBindingTypeAndVersioning[y][v]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Ee.Composite=qd;Ee.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ee.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ee.prototype.GetterByBindingType=[Ee.prototype._getValue_direct,Ee.prototype._getValue_array,Ee.prototype._getValue_arrayElement,Ee.prototype._getValue_toArray];Ee.prototype.SetterByBindingTypeAndVersioning=[[Ee.prototype._setValue_direct,Ee.prototype._setValue_direct_setNeedsUpdate,Ee.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_array,Ee.prototype._setValue_array_setNeedsUpdate,Ee.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_arrayElement,Ee.prototype._setValue_arrayElement_setNeedsUpdate,Ee.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ee.prototype._setValue_fromArray,Ee.prototype._setValue_fromArray_setNeedsUpdate,Ee.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var HS=new Float32Array(1);var Bu=new ie;class Pr{constructor(d,p,m=0,g=1/0){this.ray=new Ii(d,p),this.near=m,this.far=g,this.camera=null,this.layers=new br,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(d,p){this.ray.set(d,p)}setFromCamera(d,p){if(p.isPerspectiveCamera)this.ray.origin.setFromMatrixPosition(p.matrixWorld),this.ray.direction.set(d.x,d.y,0.5).unproject(p).sub(this.ray.origin).normalize(),this.camera=p;else if(p.isOrthographicCamera)this.ray.origin.set(d.x,d.y,p.projectionMatrix.elements[14]).unproject(p),this.ray.direction.set(0,0,-1).transformDirection(p.matrixWorld),this.camera=p;else $t("Raycaster: Unsupported camera type: "+p.type)}setFromXRController(d){return Bu.identity().extractRotation(d.matrixWorld),this.ray.origin.setFromMatrixPosition(d.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bu),this}intersectObject(d,p=!0,m=[]){return Sl(d,this,m,p),m.sort(ku),m}intersectObjects(d,p=!0,m=[]){for(let g=0,_=d.length;g<_;g++)Sl(d[g],this,m,p);return m.sort(ku),m}}function ku(d,p){return d.distance-p.distance}function Sl(d,p,m,g){let _=!0;if(d.layers.test(p.layers)){if(d.raycast(p,m)===!1)_=!1}if(_===!0&&g===!0){let x=d.children;for(let v=0,y=x.length;v<y;v++)Sl(x[v],p,m,!0)}}class na{constructor(d=1,p=0,m=0){this.radius=d,this.phi=p,this.theta=m}set(d,p,m){return this.radius=d,this.phi=p,this.theta=m,this}copy(d){return this.radius=d.radius,this.phi=d.phi,this.theta=d.theta,this}makeSafe(){return this.phi=ne(this.phi,0.000001,Math.PI-0.000001),this}setFromVector3(d){return this.setFromCartesianCoords(d.x,d.y,d.z)}setFromCartesianCoords(d,p,m){if(this.radius=Math.sqrt(d*d+p*p+m*m),this.radius===0)this.theta=0,this.phi=0;else this.theta=Math.atan2(d,m),this.phi=Math.acos(ne(p/this.radius,-1,1));return this}clone(){return new this.constructor().copy(this)}}class Yd{static{this.prototype.isMatrix2=!0}constructor(d,p,m,g){if(this.elements=[1,0,0,1],d!==void 0)this.set(d,p,m,g)}identity(){return this.set(1,0,0,1),this}fromArray(d,p=0){for(let m=0;m<4;m++)this.elements[m]=d[m+p];return this}set(d,p,m,g){let _=this.elements;return _[0]=d,_[2]=p,_[1]=m,_[3]=g,this}}var zu=new q,wo=new q,bs=new q,Es=new q,xl=new q,ug=new q,dg=new q;class wn{constructor(d=new q,p=new q){this.start=d,this.end=p}set(d,p){return this.start.copy(d),this.end.copy(p),this}copy(d){return this.start.copy(d.start),this.end.copy(d.end),this}getCenter(d){return d.addVectors(this.start,this.end).multiplyScalar(0.5)}delta(d){return d.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(d,p){return this.delta(p).multiplyScalar(d).add(this.start)}closestPointToPointParameter(d,p){zu.subVectors(d,this.start),wo.subVectors(this.end,this.start);let m=wo.dot(wo);if(m===0)return 0;let _=wo.dot(zu)/m;if(p)_=ne(_,0,1);return _}closestPointToPoint(d,p,m){let g=this.closestPointToPointParameter(d,p);return this.delta(m).multiplyScalar(g).add(this.start)}distanceSqToLine3(d,p=ug,m=dg){let _,x,v=this.start,y=d.start,S=this.end,M=d.end;bs.subVectors(S,v),Es.subVectors(M,y),xl.subVectors(v,y);let E=bs.dot(bs),T=Es.dot(Es),b=Es.dot(xl);if(E<=0.00000000000000010000000000000001&&T<=0.00000000000000010000000000000001)return p.copy(v),m.copy(y),p.distanceToSquared(m);if(E<=0.00000000000000010000000000000001)_=0,x=b/T,x=ne(x,0,1);else{let w=bs.dot(xl);if(T<=0.00000000000000010000000000000001)x=0,_=ne(-w/E,0,1);else{let C=bs.dot(Es),N=E*T-C*C;if(N!==0)_=ne((C*b-w*T)/N,0,1);else _=0;if(x=(C*_+b)/T,x<0)x=0,_=ne(-w/E,0,1);else if(x>1)x=1,_=ne((C-w)/E,0,1)}}return p.copy(v).addScaledVector(bs,_),m.copy(y).addScaledVector(Es,x),p.distanceToSquared(m)}applyMatrix4(d){return this.start.applyMatrix4(d),this.end.applyMatrix4(d),this}equals(d){return d.start.equals(this.start)&&d.end.equals(this.end)}clone(){return new this.constructor().copy(this)}}class ia extends Li{constructor(d,p=16776960){let m=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),g=[1,1,1,-1,1,1,-1,-1,1,1,-1,1,1,1,-1,-1,1,-1,-1,-1,-1,1,-1,-1],_=new Qe;_.setIndex(new Ve(m,1)),_.setAttribute("position",new En(g,3));super(_,new Pi({color:p,toneMapped:!1}));this.box=d,this.type="Box3Helper",this.geometry.computeBoundingSphere()}updateMatrixWorld(d){let p=this.box;if(p.isEmpty())return;p.getCenter(this.position),p.getSize(this.scale),this.scale.multiplyScalar(0.5),super.updateMatrixWorld(d)}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function Zc(d,p,m,g){let _=fg(g);switch(m){case 1021:return d*p;case 1028:return d*p/_.components*_.byteLength;case 1029:return d*p/_.components*_.byteLength;case 1030:return d*p*2/_.components*_.byteLength;case 1031:return d*p*2/_.components*_.byteLength;case 1022:return d*p*3/_.components*_.byteLength;case 1023:return d*p*4/_.components*_.byteLength;case 1033:return d*p*4/_.components*_.byteLength;case 33776:case 33777:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*8;case 33778:case 33779:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 35841:case 35843:return Math.max(d,16)*Math.max(p,8)/4;case 35840:case 35842:return Math.max(d,8)*Math.max(p,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 37808:return Math.floor((d+3)/4)*Math.floor((p+3)/4)*16;case 37809:return Math.floor((d+4)/5)*Math.floor((p+3)/4)*16;case 37810:return Math.floor((d+4)/5)*Math.floor((p+4)/5)*16;case 37811:return Math.floor((d+5)/6)*Math.floor((p+4)/5)*16;case 37812:return Math.floor((d+5)/6)*Math.floor((p+5)/6)*16;case 37813:return Math.floor((d+7)/8)*Math.floor((p+4)/5)*16;case 37814:return Math.floor((d+7)/8)*Math.floor((p+5)/6)*16;case 37815:return Math.floor((d+7)/8)*Math.floor((p+7)/8)*16;case 37816:return Math.floor((d+9)/10)*Math.floor((p+4)/5)*16;case 37817:return Math.floor((d+9)/10)*Math.floor((p+5)/6)*16;case 37818:return Math.floor((d+9)/10)*Math.floor((p+7)/8)*16;case 37819:return Math.floor((d+9)/10)*Math.floor((p+9)/10)*16;case 37820:return Math.floor((d+11)/12)*Math.floor((p+9)/10)*16;case 37821:return Math.floor((d+11)/12)*Math.floor((p+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(d/4)*Math.ceil(p/4)*16;case 36283:case 36284:return Math.ceil(d/4)*Math.ceil(p/4)*8;case 36285:case 36286:return Math.ceil(d/4)*Math.ceil(p/4)*16}throw Error(`Unable to determine texture byte length for ${m} format.`)}function fg(d){switch(d){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${d}.`)}if(typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));if(typeof window<"u")if(window.__THREE__)Xt("WARNING: Multiple instances of Three.js being imported.");else window.__THREE__="187";function gf(){let d=null,p=!1,m=null,g=null;function _(x,v){g=d.requestAnimationFrame(_),m(x,v)}return{start:function(){if(p===!0)return;if(m===null)return;if(d===null)return;g=d.requestAnimationFrame(_),p=!0},stop:function(){if(d!==null)d.cancelAnimationFrame(g);p=!1},setAnimationLoop:function(x){m=x},setContext:function(x){d=x}}}function pg(d){let p=new WeakMap;function m(y,S){let{array:M,usage:E}=y,T=M.byteLength,b=d.createBuffer();d.bindBuffer(S,b),d.bufferData(S,M,E),y.onUploadCallback();let w;if(M instanceof Float32Array)w=d.FLOAT;else if(typeof Float16Array<"u"&&M instanceof Float16Array)w=d.HALF_FLOAT;else if(M instanceof Uint16Array)if(y.isFloat16BufferAttribute)w=d.HALF_FLOAT;else w=d.UNSIGNED_SHORT;else if(M instanceof Int16Array)w=d.SHORT;else if(M instanceof Uint32Array)w=d.UNSIGNED_INT;else if(M instanceof Int32Array)w=d.INT;else if(M instanceof Int8Array)w=d.BYTE;else if(M instanceof Uint8Array)w=d.UNSIGNED_BYTE;else if(M instanceof Uint8ClampedArray)w=d.UNSIGNED_BYTE;else throw Error("THREE.WebGLAttributes: Unsupported buffer data format: "+M);return{buffer:b,type:w,bytesPerElement:M.BYTES_PER_ELEMENT,version:y.version,size:T}}function g(y,S,M){let{array:E,updateRanges:T}=S;if(d.bindBuffer(M,y),T.length===0)d.bufferSubData(M,0,E);else{T.sort((w,C)=>w.start-C.start);let b=0;for(let w=1;w<T.length;w++){let C=T[b],N=T[w];if(N.start<=C.start+C.count+1)C.count=Math.max(C.count,N.start+N.count-C.start);else++b,T[b]=N}T.length=b+1;for(let w=0,C=T.length;w<C;w++){let N=T[w];d.bufferSubData(M,N.start*E.BYTES_PER_ELEMENT,E,N.start,N.count)}S.clearUpdateRanges()}S.onUploadCallback()}function _(y){if(y.isInterleavedBufferAttribute)y=y.data;return p.get(y)}function x(y){if(y.isInterleavedBufferAttribute)y=y.data;let S=p.get(y);if(S)d.deleteBuffer(S.buffer),p.delete(y)}function v(y,S){if(y.isInterleavedBufferAttribute)y=y.data;if(y.isGLBufferAttribute){let E=p.get(y);if(!E||E.version<y.version)p.set(y,{buffer:y.buffer,type:y.type,bytesPerElement:y.elementSize,version:y.version});return}let M=p.get(y);if(M===void 0)p.set(y,m(y,S));else if(M.version<y.version){if(M.size!==y.array.byteLength)throw Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");g(M.buffer,y,S),M.version=y.version}}return{get:_,remove:x,update:v}}var mg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,gg=`#ifdef USE_ALPHAHASH
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
#endif`,_g=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,yg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Sg=`#ifdef USE_AOMAP
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
#endif`,Mg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,bg=`#ifdef USE_BATCHING
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
#endif`,Eg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Tg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,wg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Ag=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Rg=`#ifdef USE_IRIDESCENCE
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
#endif`,Cg=`#ifdef USE_BUMPMAP
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
#endif`,Ig=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Pg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Lg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ng=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ug=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Fg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Og=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Bg=`#define PI 3.141592653589793
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
} // validated`,kg=`vec3 transformedNormal = objectNormal;
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
#endif`,zg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Hg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Gg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Vg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Wg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Xg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qg=`#ifdef USE_ENVMAP
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
#endif`,Yg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Zg=`#ifdef USE_ENVMAP
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
#endif`,$g=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Jg=`#ifdef USE_ENVMAP
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
#endif`,Kg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,jg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Qg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,t_=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,e_=`#ifdef USE_GRADIENTMAP
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
}`,n_=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,i_=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,s_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,r_=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,o_=`#ifdef USE_ENVMAP
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
#endif`,a_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,l_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,c_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,h_=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,u_=`PhysicalMaterial material;
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
#endif`,d_=`uniform sampler2D dfgLUT;
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
}`,f_=`
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
#endif`,p_=`#if defined( RE_IndirectDiffuse )
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
#endif`,m_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,g_=`#if NUM_LIGHT_PROBE_GRIDS > 0
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
#endif`,__=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,x_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,v_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,y_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,S_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,M_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,b_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,E_=`#if defined( USE_POINTS_UV )
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
#endif`,T_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,w_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,A_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,R_=`#if defined( USE_MORPHCOLORS )
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
#endif`,C_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,I_=`#ifdef USE_MORPHTARGETS
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
#endif`,P_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,L_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,N_=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,D_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,U_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,F_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,O_=`#ifdef USE_NORMALMAP
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
#endif`,B_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,k_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,z_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,H_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,G_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,V_=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,W_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,X_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,q_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Y_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Z_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,J_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,K_=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,j_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Q_=`float getShadowMask() {
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
}`,t0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,e0=`#ifdef USE_SKINNING
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
#endif`,n0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,i0=`#ifdef USE_SKINNING
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
#endif`,s0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,r0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,o0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,a0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,l0=`#ifdef USE_TRANSMISSION
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
#endif`,c0=`#ifdef USE_TRANSMISSION
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
#endif`,h0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`;var f0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,p0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,m0=`uniform sampler2D t2D;
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
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_0=`uniform float backgroundBlurriness;
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
}`,x0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,v0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`#include <common>
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
}`,S0=`#if DEPTH_PACKING == 3200
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
}`,M0=`#define DISTANCE
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
}`,b0=`#define DISTANCE
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
}`,E0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,T0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,w0=`uniform float scale;
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
}`,A0=`uniform vec3 diffuse;
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
}`,R0=`#include <common>
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
}`,C0=`uniform vec3 diffuse;
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
}`,I0=`#define LAMBERT
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
}`,P0=`#define LAMBERT
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
}`,L0=`#define MATCAP
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
}`,N0=`#define MATCAP
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
}`,D0=`#define NORMAL
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
}`,U0=`#define NORMAL
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
}`,F0=`#define PHONG
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
}`,O0=`#define PHONG
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
}`,B0=`#define STANDARD
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
}`,k0=`#define STANDARD
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
}`,z0=`#define TOON
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
}`,H0=`#define TOON
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
}`,G0=`uniform float size;
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
}`,V0=`uniform vec3 diffuse;
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
}`,W0=`#include <common>
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
}`,X0=`uniform vec3 color;
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
}`,q0=`uniform float rotation;
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
}`,Y0=`uniform vec3 diffuse;
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
}`,oe={alphahash_fragment:mg,alphahash_pars_fragment:gg,alphamap_fragment:_g,alphamap_pars_fragment:xg,alphatest_fragment:vg,alphatest_pars_fragment:yg,aomap_fragment:Sg,aomap_pars_fragment:Mg,batching_pars_vertex:bg,batching_vertex:Eg,begin_vertex:Tg,beginnormal_vertex:wg,bsdfs:Ag,iridescence_fragment:Rg,bumpmap_pars_fragment:Cg,clipping_planes_fragment:Ig,clipping_planes_pars_fragment:Pg,clipping_planes_pars_vertex:Lg,clipping_planes_vertex:Ng,color_fragment:Dg,color_pars_fragment:Ug,color_pars_vertex:Fg,color_vertex:Og,common:Bg,defaultnormal_vertex:kg,displacementmap_pars_vertex:zg,displacementmap_vertex:Hg,emissivemap_fragment:Gg,emissivemap_pars_fragment:Vg,colorspace_fragment:Wg,colorspace_pars_fragment:Xg,envmap_fragment:qg,envmap_common_pars_fragment:Yg,envmap_pars_fragment:Zg,envmap_pars_vertex:$g,envmap_physical_pars_fragment:o_,envmap_vertex:Jg,fog_vertex:Kg,fog_pars_vertex:jg,fog_fragment:Qg,fog_pars_fragment:t_,gradientmap_pars_fragment:e_,lightmap_pars_fragment:n_,lights_lambert_fragment:i_,lights_lambert_pars_fragment:s_,lights_pars_begin:r_,lights_toon_fragment:a_,lights_toon_pars_fragment:l_,lights_phong_fragment:c_,lights_phong_pars_fragment:h_,lights_physical_fragment:u_,lights_physical_pars_fragment:d_,lights_fragment_begin:f_,lights_fragment_maps:p_,lights_fragment_end:m_,lightprobes_pars_fragment:g_,logdepthbuf_fragment:__,logdepthbuf_pars_fragment:x_,logdepthbuf_pars_vertex:v_,logdepthbuf_vertex:y_,map_fragment:S_,map_pars_fragment:M_,map_particle_fragment:b_,map_particle_pars_fragment:E_,metalnessmap_fragment:T_,metalnessmap_pars_fragment:w_,morphinstance_vertex:A_,morphcolor_vertex:R_,morphnormal_vertex:C_,morphtarget_pars_vertex:I_,morphtarget_vertex:P_,normal_fragment_begin:L_,normal_fragment_maps:N_,normal_pars_fragment:D_,normal_pars_vertex:U_,normal_vertex:F_,normalmap_pars_fragment:O_,clearcoat_normal_fragment_begin:B_,clearcoat_normal_fragment_maps:k_,clearcoat_pars_fragment:z_,iridescence_pars_fragment:H_,opaque_fragment:G_,packing:V_,premultiplied_alpha_fragment:W_,project_vertex:X_,dithering_fragment:q_,dithering_pars_fragment:Y_,roughnessmap_fragment:Z_,roughnessmap_pars_fragment:$_,shadowmap_pars_fragment:J_,shadowmap_pars_vertex:K_,shadowmap_vertex:j_,shadowmask_pars_fragment:Q_,skinbase_vertex:t0,skinning_pars_vertex:e0,skinning_vertex:n0,skinnormal_vertex:i0,specularmap_fragment:s0,specularmap_pars_fragment:r0,tonemapping_fragment:o0,tonemapping_pars_fragment:a0,transmission_fragment:l0,transmission_pars_fragment:c0,uv_pars_fragment:h0,uv_pars_vertex:u0,uv_vertex:d0,worldpos_vertex:f0,background_vert:p0,background_frag:m0,backgroundCube_vert:g0,backgroundCube_frag:_0,cube_vert:x0,cube_frag:v0,depth_vert:y0,depth_frag:S0,distance_vert:M0,distance_frag:b0,equirect_vert:E0,equirect_frag:T0,linedashed_vert:w0,linedashed_frag:A0,meshbasic_vert:R0,meshbasic_frag:C0,meshlambert_vert:I0,meshlambert_frag:P0,meshmatcap_vert:L0,meshmatcap_frag:N0,meshnormal_vert:D0,meshnormal_frag:U0,meshphong_vert:F0,meshphong_frag:O0,meshphysical_vert:B0,meshphysical_frag:k0,meshtoon_vert:z0,meshtoon_frag:H0,points_vert:G0,points_frag:V0,shadow_vert:W0,shadow_frag:X0,sprite_vert:q0,sprite_frag:Y0},Rt={common:{diffuse:{value:new se(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Kt}},envmap:{envMap:{value:null},envMapRotation:{value:new Kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:0.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Kt},normalScale:{value:new Jt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:0.00025},fogNear:{value:1},fogFar:{value:2000},fogColor:{value:new se(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new se(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0},uvTransform:{value:new Kt}},sprite:{diffuse:{value:new se(16777215)},opacity:{value:1},center:{value:new Jt(0.5,0.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Kt},alphaMap:{value:null},alphaMapTransform:{value:new Kt},alphaTest:{value:0}}},Jn={basic:{uniforms:fn([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:fn([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,Rt.lights,{emissive:{value:new se(0)},envMapIntensity:{value:1}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:fn([Rt.common,Rt.specularmap,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,Rt.lights,{emissive:{value:new se(0)},specular:{value:new se(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:fn([Rt.common,Rt.envmap,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.roughnessmap,Rt.metalnessmap,Rt.fog,Rt.lights,{emissive:{value:new se(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:fn([Rt.common,Rt.aomap,Rt.lightmap,Rt.emissivemap,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.gradientmap,Rt.fog,Rt.lights,{emissive:{value:new se(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:fn([Rt.common,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,Rt.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:fn([Rt.points,Rt.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:fn([Rt.common,Rt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:fn([Rt.common,Rt.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:fn([Rt.common,Rt.bumpmap,Rt.normalmap,Rt.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:fn([Rt.sprite,Rt.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new Kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Kt}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distance:{uniforms:fn([Rt.common,Rt.displacementmap,{referencePosition:{value:new q},nearDistance:{value:1},farDistance:{value:1000}}]),vertexShader:oe.distance_vert,fragmentShader:oe.distance_frag},shadow:{uniforms:fn([Rt.lights,Rt.fog,{color:{value:new se(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};Jn.physical={uniforms:fn([Jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Kt},clearcoatNormalScale:{value:new Jt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Kt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Kt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Kt},sheen:{value:0},sheenColor:{value:new se(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Kt},transmissionSamplerSize:{value:new Jt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Kt},attenuationDistance:{value:0},attenuationColor:{value:new se(0)},specularColor:{value:new se(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Kt},anisotropyVector:{value:new Jt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Kt}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};var sa={r:0,b:0,g:0},Z0=new ie,_f=new Kt;_f.set(-1,0,0,0,1,0,0,0,1);function $0(d,p,m,g,_,x){let v=new se(0),y=_===!0?0:1,S,M,E=null,T=0,b=null;function w(P){let F=P.isScene===!0?P.background:null;if(F&&F.isTexture){let L=P.backgroundBlurriness>0;F=p.get(F,L)}return F}function C(P){let F=!1,L=w(P);if(L===null)A(v,y);else if(L&&L.isColor)A(L,1),F=!0;let U=d.xr.getEnvironmentBlendMode();if(U==="additive")m.buffers.color.setClear(0,0,0,1,x);else if(U==="alpha-blend")m.buffers.color.setClear(0,0,0,0,x);if(d.autoClear||F)m.buffers.depth.setTest(!0),m.buffers.depth.setMask(!0),m.buffers.color.setMask(!0),d.clear(d.autoClearColor,d.autoClearDepth,d.autoClearStencil)}function N(P,F){let L=w(F);if(L&&L.isCubeTexture){if(M===void 0)M=new nn(new Os(1,1,1),new mi({name:"BackgroundCubeMaterial",uniforms:ts(Jn.backgroundCube.uniforms),vertexShader:Jn.backgroundCube.vertexShader,fragmentShader:Jn.backgroundCube.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),M.geometry.deleteAttribute("normal"),M.geometry.deleteAttribute("uv"),M.onBeforeRender=function(U,k,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(M.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),g.update(M);if(M.material.uniforms.envMap.value=L,M.material.uniforms.backgroundBlurriness.value=F.backgroundBlurriness,M.material.uniforms.backgroundIntensity.value=F.backgroundIntensity,M.material.uniforms.backgroundRotation.value.setFromMatrix4(Z0.makeRotationFromEuler(F.backgroundRotation)).transpose(),L.isRenderTargetTexture===!1)M.material.uniforms.backgroundRotation.value.premultiply(_f);if(M.material.toneMapped=le.getTransfer(L.colorSpace)!==Ie,E!==L||T!==L.version||b!==d.toneMapping)M.material.needsUpdate=!0,E=L,T=L.version,b=d.toneMapping;M.layers.enableAll(),P.unshift(M,M.geometry,M.material,0,0,null)}else if(L&&L.isTexture){if(S===void 0)S=new nn(new Rr(2,2),new mi({name:"BackgroundMaterial",uniforms:ts(Jn.background.uniforms),vertexShader:Jn.background.vertexShader,fragmentShader:Jn.background.fragmentShader,side:ci,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),S.geometry.deleteAttribute("normal"),Object.defineProperty(S.material,"map",{get:function(){return this.uniforms.t2D.value}}),g.update(S);if(S.material.uniforms.t2D.value=L,S.material.uniforms.backgroundIntensity.value=F.backgroundIntensity,S.material.toneMapped=le.getTransfer(L.colorSpace)!==Ie,L.matrixAutoUpdate===!0)L.updateMatrix();if(S.material.uniforms.uvTransform.value.copy(L.matrix),E!==L||T!==L.version||b!==d.toneMapping)S.material.needsUpdate=!0,E=L,T=L.version,b=d.toneMapping;S.layers.enableAll(),P.unshift(S,S.geometry,S.material,0,0,null)}}function A(P,F){P.getRGB(sa,Ic(d)),m.buffers.color.setClear(sa.r,sa.g,sa.b,F,x)}function R(){if(M!==void 0)M.geometry.dispose(),M.material.dispose(),M=void 0;if(S!==void 0)S.geometry.dispose(),S.material.dispose(),S=void 0}return{getClearColor:function(){return v},setClearColor:function(P,F=1){v.set(P),y=F,A(v,y)},getClearAlpha:function(){return y},setClearAlpha:function(P){y=P,A(v,y)},render:C,addToRenderList:N,dispose:R}}function J0(d,p){let m=d.getParameter(d.MAX_VERTEX_ATTRIBS),g={},_=b(null),x=_,v=!1;function y(H,X,J,G,Q){let it=!1,j=T(H,G,J,X);if(x!==j)x=j,M(x.object);if(it=w(H,G,J,Q),it)C(H,G,J,Q);if(Q!==null)p.update(Q,d.ELEMENT_ARRAY_BUFFER);if(it||v){if(v=!1,L(H,X,J,G),Q!==null)d.bindBuffer(d.ELEMENT_ARRAY_BUFFER,p.get(Q).buffer)}}function S(){return d.createVertexArray()}function M(H){return d.bindVertexArray(H)}function E(H){return d.deleteVertexArray(H)}function T(H,X,J,G){let Q=G.wireframe===!0,it=g[X.id];if(it===void 0)it={},g[X.id]=it;let j=H.isInstancedMesh===!0?H.id:0,_t=it[j];if(_t===void 0)_t={},it[j]=_t;let rt=_t[J.id];if(rt===void 0)rt={},_t[J.id]=rt;let ut=rt[Q];if(ut===void 0)ut=b(S()),rt[Q]=ut;return ut}function b(H){let X=[],J=[],G=[];for(let Q=0;Q<m;Q++)X[Q]=0,J[Q]=0,G[Q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:X,enabledAttributes:J,attributeDivisors:G,object:H,attributes:{},index:null}}function w(H,X,J,G){let Q=x.attributes,it=X.attributes,j=0,_t=J.getAttributes();for(let rt in _t)if(_t[rt].location>=0){let mt=Q[rt],Nt=it[rt];if(Nt===void 0){if(rt==="instanceMatrix"&&H.instanceMatrix)Nt=H.instanceMatrix;if(rt==="instanceColor"&&H.instanceColor)Nt=H.instanceColor}if(mt===void 0)return!0;if(mt.attribute!==Nt)return!0;if(Nt&&mt.data!==Nt.data)return!0;j++}if(x.attributesNum!==j)return!0;if(x.index!==G)return!0;return!1}function C(H,X,J,G){let Q={},it=X.attributes,j=0,_t=J.getAttributes();for(let rt in _t)if(_t[rt].location>=0){let mt=it[rt];if(mt===void 0){if(rt==="instanceMatrix"&&H.instanceMatrix)mt=H.instanceMatrix;if(rt==="instanceColor"&&H.instanceColor)mt=H.instanceColor}let Nt={};if(Nt.attribute=mt,mt&&mt.data)Nt.data=mt.data;Q[rt]=Nt,j++}x.attributes=Q,x.attributesNum=j,x.index=G}function N(){let H=x.newAttributes;for(let X=0,J=H.length;X<J;X++)H[X]=0}function A(H){R(H,0)}function R(H,X){let J=x.newAttributes,G=x.enabledAttributes,Q=x.attributeDivisors;if(J[H]=1,G[H]===0)d.enableVertexAttribArray(H),G[H]=1;if(Q[H]!==X)d.vertexAttribDivisor(H,X),Q[H]=X}function P(){let H=x.newAttributes,X=x.enabledAttributes;for(let J=0,G=X.length;J<G;J++)if(X[J]!==H[J])d.disableVertexAttribArray(J),X[J]=0}function F(H,X,J,G,Q,it,j){if(j===!0)d.vertexAttribIPointer(H,X,J,Q,it);else d.vertexAttribPointer(H,X,J,G,Q,it)}function L(H,X,J,G){N();let Q=G.attributes,it=J.getAttributes(),j=X.defaultAttributeValues;for(let _t in it){let rt=it[_t];if(rt.location>=0){let ut=Q[_t];if(ut===void 0){if(_t==="instanceMatrix"&&H.instanceMatrix)ut=H.instanceMatrix;if(_t==="instanceColor"&&H.instanceColor)ut=H.instanceColor}if(ut!==void 0){let mt=ut.normalized,Nt=ut.itemSize,ot=p.get(ut);if(ot===void 0)continue;let{buffer:ft,type:Ct,bytesPerElement:zt}=ot,Dt=Ct===d.INT||Ct===d.UNSIGNED_INT||ut.gpuType===Dl;if(ut.isInterleavedBufferAttribute){let wt=ut.data,jt=wt.isInterleavedBuffer===!0?wt.stride:wt.itemSize,Qt=ut.offset;if(wt.isInstancedInterleavedBuffer||wt.isInstancedBufferAttribute){for(let Ft=0;Ft<rt.locationSize;Ft++)R(rt.location+Ft,wt.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=wt.meshPerAttribute*wt.count}else for(let Ft=0;Ft<rt.locationSize;Ft++)A(rt.location+Ft);d.bindBuffer(d.ARRAY_BUFFER,ft);for(let Ft=0;Ft<rt.locationSize;Ft++)F(rt.location+Ft,Nt/rt.locationSize,Ct,mt,jt*zt,(Qt+Nt/rt.locationSize*Ft)*zt,Dt)}else{if(ut.isInstancedBufferAttribute){for(let wt=0;wt<rt.locationSize;wt++)R(rt.location+wt,ut.meshPerAttribute);if(H.isInstancedMesh!==!0&&G._maxInstanceCount===void 0)G._maxInstanceCount=ut.meshPerAttribute*ut.count}else for(let wt=0;wt<rt.locationSize;wt++)A(rt.location+wt);d.bindBuffer(d.ARRAY_BUFFER,ft);for(let wt=0;wt<rt.locationSize;wt++)F(rt.location+wt,Nt/rt.locationSize,Ct,mt,Nt*zt,Nt/rt.locationSize*wt*zt,Dt)}}else if(j!==void 0){let mt=j[_t];if(mt!==void 0)switch(mt.length){case 2:d.vertexAttrib2fv(rt.location,mt);break;case 3:d.vertexAttrib3fv(rt.location,mt);break;case 4:d.vertexAttrib4fv(rt.location,mt);break;default:d.vertexAttrib1fv(rt.location,mt)}}}}P()}function U(){z();for(let H in g){let X=g[H];for(let J in X){let G=X[J];for(let Q in G){let it=G[Q];for(let j in it)E(it[j].object),delete it[j];delete G[Q]}}delete g[H]}}function k(H){if(g[H.id]===void 0)return;let X=g[H.id];for(let J in X){let G=X[J];for(let Q in G){let it=G[Q];for(let j in it)E(it[j].object),delete it[j];delete G[Q]}}delete g[H.id]}function I(H){for(let X in g){let J=g[X];for(let G in J){let Q=J[G];if(Q[H.id]===void 0)continue;let it=Q[H.id];for(let j in it)E(it[j].object),delete it[j];delete Q[H.id]}}}function D(H){for(let X in g){let J=g[X],G=H.isInstancedMesh===!0?H.id:0,Q=J[G];if(Q===void 0)continue;for(let it in Q){let j=Q[it];for(let _t in j)E(j[_t].object),delete j[_t];delete Q[it]}if(delete J[G],Object.keys(J).length===0)delete g[X]}}function z(){if(W(),v=!0,x===_)return;x=_,M(x.object)}function W(){_.geometry=null,_.program=null,_.wireframe=!1}return{setup:y,reset:z,resetDefaultState:W,dispose:U,releaseStatesOfGeometry:k,releaseStatesOfObject:D,releaseStatesOfProgram:I,initAttributes:N,enableAttribute:A,disableUnusedAttributes:P}}function K0(d,p,m){let g;function _(S){g=S}function x(S,M){d.drawArrays(g,S,M),m.update(M,g,1)}function v(S,M,E){if(E===0)return;d.drawArraysInstanced(g,S,M,E),m.update(M,g,E)}function y(S,M,E){if(E===0)return;p.get("WEBGL_multi_draw").multiDrawArraysWEBGL(g,S,0,M,0,E);let b=0;for(let w=0;w<E;w++)b+=M[w];m.update(b,g,1)}this.setMode=_,this.render=x,this.renderInstances=v,this.renderMultiDraw=y}function j0(d,p,m,g){let _;function x(){if(_!==void 0)return _;if(p.has("EXT_texture_filter_anisotropic")===!0){let I=p.get("EXT_texture_filter_anisotropic");_=d.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else _=0;return _}function v(I){if(I!==Nn&&g.convert(I)!==d.getParameter(d.IMPLEMENTATION_COLOR_READ_FORMAT))return!1;return!0}function y(I){let D=I===Zn&&(p.has("EXT_color_buffer_half_float")||p.has("EXT_color_buffer_float"));if(I!==Gn&&I!==hi&&!D&&g.convert(I)!==d.getParameter(d.IMPLEMENTATION_COLOR_READ_TYPE))return!1;return!0}function S(I){if(I==="highp"){if(d.getShaderPrecisionFormat(d.VERTEX_SHADER,d.HIGH_FLOAT).precision>0&&d.getShaderPrecisionFormat(d.FRAGMENT_SHADER,d.HIGH_FLOAT).precision>0)return"highp";I="mediump"}if(I==="mediump"){if(d.getShaderPrecisionFormat(d.VERTEX_SHADER,d.MEDIUM_FLOAT).precision>0&&d.getShaderPrecisionFormat(d.FRAGMENT_SHADER,d.MEDIUM_FLOAT).precision>0)return"mediump"}return"lowp"}let M=m.precision!==void 0?m.precision:"highp",E=S(M);if(E!==M)Xt("WebGLRenderer:",M,"not supported, using",E,"instead."),M=E;let T=m.reversedDepthBuffer===!0&&p.has("EXT_clip_control"),b=m.logarithmicDepthBuffer===!0&&T===!1;if(m.reversedDepthBuffer===!0&&T===!1)Xt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");if(m.logarithmicDepthBuffer===!0&&T===!0)Xt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let w=d.getParameter(d.MAX_TEXTURE_IMAGE_UNITS),C=d.getParameter(d.MAX_VERTEX_TEXTURE_IMAGE_UNITS),N=d.getParameter(d.MAX_TEXTURE_SIZE),A=d.getParameter(d.MAX_CUBE_MAP_TEXTURE_SIZE),R=d.getParameter(d.MAX_VERTEX_ATTRIBS),P=d.getParameter(d.MAX_VERTEX_UNIFORM_VECTORS),F=d.getParameter(d.MAX_VARYING_VECTORS),L=d.getParameter(d.MAX_FRAGMENT_UNIFORM_VECTORS),U=d.getParameter(d.MAX_SAMPLES),k=d.getParameter(d.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:x,getMaxPrecision:S,textureFormatReadable:v,textureTypeReadable:y,precision:M,logarithmicDepthBuffer:b,reversedDepthBuffer:T,maxTextures:w,maxVertexTextures:C,maxTextureSize:N,maxCubemapSize:A,maxAttributes:R,maxVertexUniforms:P,maxVaryings:F,maxFragmentUniforms:L,maxSamples:U,samples:k}}function Q0(d){let p=this,m=null,g=0,_=!1,x=!1,v=new un,y=new Kt,S={value:null,needsUpdate:!1};this.uniform=S,this.numPlanes=0,this.numIntersection=0,this.init=function(T,b){let w=T.length!==0||b||g!==0||_;return _=b,g=T.length,w},this.beginShadows=function(){x=!0,E(null)},this.endShadows=function(){x=!1},this.setGlobalState=function(T,b){m=E(T,b,0)},this.setState=function(T,b,w){let{clippingPlanes:C,clipIntersection:N,clipShadows:A}=T,R=d.get(T);if(!_||C===null||C.length===0||x&&!A)if(x)E(null);else M();else{let P=x?0:g,F=P*4,L=R.clippingState||null;S.value=L,L=E(C,b,F,w);for(let U=0;U!==F;++U)L[U]=m[U];R.clippingState=L,this.numIntersection=N?this.numPlanes:0,this.numPlanes+=P}};function M(){if(S.value!==m)S.value=m,S.needsUpdate=g>0;p.numPlanes=g,p.numIntersection=0}function E(T,b,w,C){let N=T!==null?T.length:0,A=null;if(N!==0){if(A=S.value,C!==!0||A===null){let R=w+N*4,P=b.matrixWorldInverse;if(y.getNormalMatrix(P),A===null||A.length<R)A=new Float32Array(R);for(let F=0,L=w;F!==N;++F,L+=4)v.copy(T[F]).applyMatrix4(P,y),v.normal.toArray(A,L),A[L+3]=v.constant}S.value=A,S.needsUpdate=!0}return p.numPlanes=N,p.numIntersection=0,A}}class aa extends Dn{constructor(d=1,p={}){super(d,d,p);this.isWebGLCubeRenderTarget=!0;let m={width:d,height:d,depth:1},g=[m,m,m,m,m,m];this.texture=new Xo(g),this._setTextureOptions(p),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(d,p){this.texture.type=p.type,this.texture.colorSpace=p.colorSpace,this.texture.generateMipmaps=p.generateMipmaps,this.texture.minFilter=p.minFilter,this.texture.magFilter=p.magFilter;let m={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},g=new Os(5,5,5),_=new mi({name:"CubemapFromEquirect",uniforms:ts(m.uniforms),vertexShader:m.vertexShader,fragmentShader:m.fragmentShader,side:dn,blending:Zi});_.uniforms.tEquirect.value=p;let x=new nn(g,_),v=p.minFilter;if(p.minFilter===Hn)p.minFilter=Tn;return new Ir(1,10,this).update(d,x),p.minFilter=v,x.geometry.dispose(),x.material.dispose(),this}clear(d,p=!0,m=!0,g=!0){let _=d.getRenderTarget();for(let x=0;x<6;x++)d.setRenderTarget(this,x),d.clear(p,m,g);d.setRenderTarget(_)}}var Zd=256,tx=3,ex=20,xf=256,vf=16,nx=3,ix=new q,sx=new se;class oa{constructor(d){this._renderer=d,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Ir(1,10,null),this._boxMesh=new nn(new Os(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(d,p=0,m=0.1,g=100,_={}){let{size:x=256,position:v=ix}=_,y=this._renderer;this._setSize(x);let S=this._allocateTarget(),M=this._getSourceTarget(!0);if(p>0)M.texture.mipmapsAutoUpdate=!1;let{autoClear:E,autoClearColor:T,autoClearDepth:b,autoClearStencil:w}=y,C=d.background;if(y.autoClear=!0,y.autoClearColor=!0,y.autoClearDepth=!0,y.autoClearStencil=!0,C===null)d.background=y.getClearColor(sx);let N=new Ir(m,g,M);if(N.position.copy(v),N.update(y,d),y.autoClear=E,y.autoClearColor=T,y.autoClearDepth=b,y.autoClearStencil=w,d.background=C,p>0)M.texture.mipmapsAutoUpdate=!0,this._blur(S,p);return this._applyPMREM(S),S}fromEquirectangular(d,p=null){return this._fromTexture(d,p)}fromCubemap(d,p=null){return this._fromTexture(d,p)}compileCubemapShader(){if(this._cubemapMaterial===null)this._cubemapMaterial=Kd(),this._compileMaterial(this._cubemapMaterial)}compileEquirectangularShader(){if(this._equirectMaterial===null)this._equirectMaterial=Jd(),this._compileMaterial(this._equirectMaterial)}dispose(){if(this._sourceTarget!==null)this._sourceTarget.dispose();if(this._cubemapMaterial!==null)this._cubemapMaterial.dispose();if(this._equirectMaterial!==null)this._equirectMaterial.dispose();if(this._blurMaterial!==null)this._blurMaterial.dispose();if(this._ggxMaterial!==null)this._ggxMaterial.dispose();if(this._integrationMaterial!==null)this._integrationMaterial.dispose();this._boxMesh.geometry.dispose()}static lodToRoughness(d,p){return p>0?1-Math.sqrt(1-d/p):0}_setSize(d){this._cubeSize=Math.max(Zd,Mc(d))}_fromTexture(d,p){if(d.mapping===gr||d.mapping===Ls)this._setSize(d.image.length===0?Zd:d.image[0].width||d.image[0].image.width);else this._setSize(d.image.width/4);let m=p||this._allocateTarget();return this._textureToCubemap(d),this._applyPMREM(m),m}_allocateTarget(){let d=this._cubeSize,p=$d(d,!1,!1),m=Math.log2(d)-tx;for(let g=0;g<=m;g++)p.texture.mipmaps.push({width:d>>g,height:d>>g});return p.texture.name="PMREM",p.texture.isPMREMTexture=!0,p}_getSourceTarget(d=!1){let p=this._cubeSize,m=this._sourceTarget;if(m===null||m.width!==p||d&&m.depthBuffer===!1){if(m!==null)m.dispose();this._sourceTarget=$d(p,!0,d)}return this._sourceTarget}_compileMaterial(d){this._boxMesh.material=d,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(d,p,m){let g=this._boxMesh,_=this._cubeCamera;g.material=m,_.renderTarget=d,_.activeMipmapLevel=p;let x=d.width>>p;d.viewport.set(0,0,x,x),_.update(this._renderer,g),d.viewport.set(0,0,d.width,d.height)}_textureToCubemap(d){let p;if(d.mapping===gr||d.mapping===Ls){if(this._cubemapMaterial===null)this._cubemapMaterial=Kd();p=this._cubemapMaterial,p.uniforms.flipEnvMap.value=d.isRenderTargetTexture===!1?-1:1}else{if(this._equirectMaterial===null)this._equirectMaterial=Jd();p=this._equirectMaterial}p.uniforms.envMap.value=d,this._renderCube(this._getSourceTarget(),0,p)}_applyPMREM(d){if(this._ggxMaterial===null)this._ggxMaterial=rx(),this._integrationMaterial=ox();let p=this._cubeSize,m=d.texture.mipmaps.length-1,g=this._ggxMaterial.uniforms;g.envMap.value=this._sourceTarget.texture;let _=this._integrationMaterial.uniforms;_.envMap.value=this._sourceTarget.texture,_.sourceLod.value=Math.log2(p/vf);for(let x=0;x<=m;x++){let v=oa.lodToRoughness(x,m);if(x>m-nx)_.roughness.value=v,this._renderCube(d,x,this._integrationMaterial);else{let y=v>0?Math.log2(p)+0.5*Math.log2(6/(xf*Math.pow(v,4)))+0.5:0;g.roughness.value=v,g.lodBias.value=y,this._renderCube(d,x,this._ggxMaterial)}}}_blur(d,p){if(this._blurMaterial===null)this._blurMaterial=ax();let m=this._blurMaterial,g=m.uniforms,_=this._sourceTarget;g.sigma.value=Math.min(p,Math.PI)/Math.SQRT2,g.envMap.value=_.texture,this._renderCube(d,0,m),g.envMap.value=d.texture,this._renderCube(_,0,m)}}function $d(d,p,m){return new aa(d,{minFilter:Hn,generateMipmaps:p,type:Zn,colorSpace:pc,depthBuffer:m})}function Ur(d,p,m){return new mi({name:d,uniforms:p,vertexShader:oe.cube_vert,fragmentShader:m,side:dn,blending:Zi,depthTest:!1,depthWrite:!1})}function rx(){return Ur("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${xf}u

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
	`)}function ox(){return Ur("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:vf}},`

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
	`)}function ax(){return Ur("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${ex}
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
	`)}function Jd(){return Ur("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

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
	`)}function Kd(){return Ur("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function lx(d){let p=new WeakMap,m=new WeakMap,g=null;function _(b,w=!1){if(b===null||b===void 0)return null;if(w)return v(b);return x(b)}function x(b){if(b&&b.isTexture){let w=b.mapping;if(w===Co||w===Io)if(p.has(b)){let C=p.get(b).texture;return y(C,b.mapping)}else{let C=b.image;if(C&&C.height>0){let N=new aa(C.height);return N.fromEquirectangularTexture(d,b),p.set(b,N),b.addEventListener("dispose",M),y(N.texture,b.mapping)}else return null}}return b}function v(b){if(b&&b.isTexture&&b.isPMREMTexture!==!0){let w=b.mapping,C=w===Co||w===Io,N=w===gr||w===Ls;if(C||N){let A=m.get(b),R=A!==void 0?A.texture.pmremVersion:0;if(b.isRenderTargetTexture&&b.pmremVersion!==R){if(g===null)g=new oa(d);return A=C?g.fromEquirectangular(b,A):g.fromCubemap(b,A),A.texture.pmremVersion=b.pmremVersion,m.set(b,A),A.texture}else if(A!==void 0)return A.texture;else{let P=b.image;if(C&&P&&P.height>0||N&&P&&S(P)){if(g===null)g=new oa(d);return A=C?g.fromEquirectangular(b):g.fromCubemap(b),A.texture.pmremVersion=b.pmremVersion,m.set(b,A),b.addEventListener("dispose",E),A.texture}else return null}}}return b}function y(b,w){if(w===Co)b.mapping=gr;else if(w===Io)b.mapping=Ls;return b}function S(b){let w=0,C=6;for(let N=0;N<C;N++)if(b[N]!==void 0)w++;return w===C}function M(b){let w=b.target;w.removeEventListener("dispose",M);let C=p.get(w);if(C!==void 0)p.delete(w),C.dispose()}function E(b){let w=b.target;w.removeEventListener("dispose",E);let C=m.get(w);if(C!==void 0)m.delete(w),C.dispose()}function T(){if(p=new WeakMap,m=new WeakMap,g!==null)g.dispose(),g=null}return{get:_,dispose:T}}function cx(d){let p={};function m(g){if(p[g]!==void 0)return p[g];let _=d.getExtension(g);return p[g]=_,_}return{has:function(g){return m(g)!==null},init:function(){m("EXT_color_buffer_float"),m("WEBGL_clip_cull_distance"),m("OES_texture_float_linear"),m("EXT_color_buffer_half_float"),m("WEBGL_multisampled_render_to_texture"),m("WEBGL_render_shared_exponent")},get:function(g){let _=m(g);if(_===null)cr("WebGLRenderer: "+g+" extension not supported.");return _}}}function hx(d,p,m,g){let _={},x=new WeakMap,v=new FinalizationRegistry((C)=>delete _[C]);function y(C){S(C.target)}function S(C){if(C.index!==null)p.remove(C.index);for(let A in C.attributes)p.remove(C.attributes[A]);C.removeEventListener("dispose",y),delete _[C.id],v.unregister(C);let N=x.get(C);if(N)p.remove(N),x.delete(C);if(g.releaseStatesOfGeometry(C),C.isInstancedBufferGeometry===!0)delete C._maxInstanceCount;m.memory.geometries--}function M(C,N){if(_[N.id]!==void 0)return N;return N.addEventListener("dispose",y),_[N.id]=new WeakRef(N),v.register(N,N.id,N),m.memory.geometries++,N}function E(C){let N=C.attributes;for(let A in N)p.update(N[A],d.ARRAY_BUFFER)}function T(C){let N=C.index,A=C.attributes.position,R=0;if(A===void 0)return;let P=N!==null?N.array.length:A.array.length/3-1,L=new(A.count>=65535?Go:Ho)(Math.ceil(P/3)*6,1),U=L.array;if(N!==null){let I=N.array;R=N.version;for(let D=0,z=0;D<P;D+=3){let W=I[D+0],H=I[D+1],X=I[D+2];U[z++]=W,U[z++]=H,U[z++]=H,U[z++]=X,U[z++]=X,U[z++]=W}}else{R=A.version;for(let I=0,D=0;I<P;I+=3){let z=I+0,W=I+1,H=I+2;U[D++]=z,U[D++]=W,U[D++]=W,U[D++]=H,U[D++]=H,U[D++]=z}}L.version=R;let k=x.get(C);if(k)p.remove(k);x.set(C,L)}function b(C){let N=x.get(C);if(N){let A=C.index;if(A!==null){if(N.version<A.version)T(C)}}else T(C);return x.get(C)}function w(){for(let C in _){let N=_[C].deref();if(N!==void 0)S(N)}}return{get:M,update:E,getWireframeAttribute:b,dispose:w}}function ux(d,p,m){let g;function _(T){g=T}let x,v;function y(T){x=T.type,v=T.bytesPerElement}function S(T,b){d.drawElements(g,b,x,T*v),m.update(b,g,1)}function M(T,b,w){if(w===0)return;d.drawElementsInstanced(g,b,x,T*v,w),m.update(b,g,w)}function E(T,b,w){if(w===0)return;p.get("WEBGL_multi_draw").multiDrawElementsWEBGL(g,b,0,x,T,0,w);let N=0;for(let A=0;A<w;A++)N+=b[A];m.update(N,g,1)}this.setMode=_,this.setIndex=y,this.render=S,this.renderInstances=M,this.renderMultiDraw=E}function dx(d){let p={geometries:0,textures:0},m={frame:0,calls:0,triangles:0,points:0,lines:0};function g(x,v,y){switch(m.calls++,v){case d.TRIANGLES:m.triangles+=y*(x/3);break;case d.LINES:m.lines+=y*(x/2);break;case d.LINE_STRIP:m.lines+=y*(x-1);break;case d.LINE_LOOP:m.lines+=y*x;break;case d.POINTS:m.points+=y*x;break;default:$t("WebGLInfo: Unknown draw mode:",v);break}}function _(){m.calls=0,m.triangles=0,m.points=0,m.lines=0}return{memory:p,render:m,programs:null,autoReset:!0,reset:_,update:g}}function fx(d,p,m){let g=new WeakMap,_=new Be;function x(v,y,S){let M=v.morphTargetInfluences,E=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=E!==void 0?E.length:0,b=g.get(y);if(b===void 0||b.count!==T){let z=function(){I.dispose(),g.delete(y),y.removeEventListener("dispose",z)};if(b!==void 0)b.texture.dispose();let w=y.morphAttributes.position!==void 0,C=y.morphAttributes.normal!==void 0,N=y.morphAttributes.color!==void 0,A=y.morphAttributes.position||[],R=y.morphAttributes.normal||[],P=y.morphAttributes.color||[],F=0;if(w===!0)F=1;if(C===!0)F=2;if(N===!0)F=3;let L=y.attributes.position.count*F,U=1;if(L>p.maxTextureSize)U=Math.ceil(L/p.maxTextureSize),L=p.maxTextureSize;let k=new Float32Array(L*U*4*T),I=new ko(k,L,U,T);I.type=hi,I.needsUpdate=!0;let D=F*4;for(let W=0;W<T;W++){let H=A[W],X=R[W],J=P[W],G=L*U*4*W;for(let Q=0;Q<H.count;Q++){let it=Q*D;if(w===!0)_.fromBufferAttribute(H,Q),k[G+it+0]=_.x,k[G+it+1]=_.y,k[G+it+2]=_.z,k[G+it+3]=0;if(C===!0)_.fromBufferAttribute(X,Q),k[G+it+4]=_.x,k[G+it+5]=_.y,k[G+it+6]=_.z,k[G+it+7]=0;if(N===!0)_.fromBufferAttribute(J,Q),k[G+it+8]=_.x,k[G+it+9]=_.y,k[G+it+10]=_.z,k[G+it+11]=J.itemSize===4?_.w:1}}b={count:T,texture:I,size:new Jt(L,U)},g.set(y,b),y.addEventListener("dispose",z)}if(v.isInstancedMesh===!0&&v.morphTexture!==null)S.getUniforms().setValue(d,"morphTexture",v.morphTexture,m);else{let w=0;for(let N=0;N<M.length;N++)w+=M[N];let C=y.morphTargetsRelative?1:1-w;S.getUniforms().setValue(d,"morphTargetBaseInfluence",C),S.getUniforms().setValue(d,"morphTargetInfluences",M)}S.getUniforms().setValue(d,"morphTargetsTexture",b.texture,m),S.getUniforms().setValue(d,"morphTargetsTextureSize",b.size)}return{update:x}}function px(d,p,m,g,_){let x=new WeakMap;function v(M){let E=_.render.frame,T=M.geometry,b=p.get(M,T);if(x.get(b)!==E)p.update(b),x.set(b,E);if(M.isInstancedMesh){if(M.hasEventListener("dispose",S)===!1)M.addEventListener("dispose",S);if(x.get(M)!==E){if(m.update(M.instanceMatrix,d.ARRAY_BUFFER),M.instanceColor!==null)m.update(M.instanceColor,d.ARRAY_BUFFER);x.set(M,E)}}if(M.isSkinnedMesh){let w=M.skeleton;if(x.get(w)!==E)w.update(),x.set(w,E)}return b}function y(){x=new WeakMap}function S(M){let E=M.target;if(E.removeEventListener("dispose",S),g.releaseStatesOfObject(E),m.remove(E.instanceMatrix),E.instanceColor!==null)m.remove(E.instanceColor)}return{update:v,dispose:y}}var mx={[Al]:"LINEAR_TONE_MAPPING",[Rl]:"REINHARD_TONE_MAPPING",[Cl]:"CINEON_TONE_MAPPING",[Il]:"ACES_FILMIC_TONE_MAPPING",[Ll]:"AGX_TONE_MAPPING",[Nl]:"NEUTRAL_TONE_MAPPING",[Pl]:"CUSTOM_TONE_MAPPING"};function gx(d,p,m,g,_,x){let v=new Dn(p,m,{type:d,depthBuffer:_,stencilBuffer:x,samples:g?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),y=null,S=null,M=null,E=new Qe;E.setAttribute("position",new En([-1,3,0,-1,-1,0,3,-1,0],3)),E.setAttribute("uv",new En([0,2,0,0,2,0],2));let T=new Pc({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),b=new nn(E,T),w=new Qo(-1,1,1,-1,0,1),C=null,N=null,A=!1,R,P=null,F=[],L=!1;this.setSize=function(U,k){if(v.setSize(U,k),y!==null)y.setSize(U,k);if(S!==null)S.setSize(U,k);for(let I=0;I<F.length;I++){let D=F[I];if(D.setSize)D.setSize(U,k)}},this.setEffects=function(U){F=U,L=F.length>0&&F[0].isRenderPass===!0;let{width:k,height:I}=v;if(F.length>0&&y===null)y=new Dn(k,I,{type:Zn,depthBuffer:!1,stencilBuffer:!1}),S=new Dn(k,I,{type:Zn,depthBuffer:!1,stencilBuffer:!1});let D=_===!0&&F.some((z)=>z.needsDepthTexture===!0);if(D!==(v.depthTexture!==null)){if(D===!0&&M===null){if(M=new Ni(k,I),x===!0)M.format=Ai,M.type=$i}v.dispose(),v.depthTexture=D?M:null,v.resolveDepthBuffer=D,v.storeMultisampledDepthBuffer=D}for(let z=0;z<F.length;z++){let W=F[z];if(W.setSize)W.setSize(k,I);if(D&&W.needsDepthTexture===!0&&W.setDepthTexture)W.setDepthTexture(M)}},this.begin=function(U,k){if(A)return!1;if(U.toneMapping===Yn&&F.length===0)return!1;if(P=k,k!==null){let{width:I,height:D}=k;if(v.width!==I||v.height!==D)this.setSize(I,D)}if(L===!1)U.setRenderTarget(v);return R=U.toneMapping,U.toneMapping=Yn,!0},this.hasRenderPass=function(){return L},this.end=function(U,k){U.toneMapping=R,A=!0;let I=v,D=y;for(let z=0;z<F.length;z++){let W=F[z];if(W.enabled===!1)continue;if(W.render(U,D,I,k),W.needsSwap!==!1)I=D,D=D===y?S:y}if(C!==U.outputColorSpace||N!==U.toneMapping){if(C=U.outputColorSpace,N=U.toneMapping,T.defines={},le.getTransfer(C)===Ie)T.defines.SRGB_TRANSFER="";let z=mx[N];if(z)T.defines[z]="";T.needsUpdate=!0}T.uniforms.tDiffuse.value=I.texture,U.setRenderTarget(P),U.render(b,w),P=null,A=!1},this.isCompositing=function(){return A},this.dispose=function(){if(v.dispose(),y!==null)y.dispose();if(S!==null)S.dispose();E.dispose(),T.dispose()}}var yf=new We,Sf=new Ni(1,1),Mf=new qo(1),bf=new ko,Ef=new Ac,Tf=new Xo,jd=[],Qd=[],tf=new Float32Array(16),ef=new Float32Array(9),nf=new Float32Array(4);function Bs(d,p,m){let g=d[0];if(g<=0||g>0)return d;let _=p*m,x=jd[_];if(x===void 0)x=new Float32Array(_),jd[_]=x;if(p!==0){g.toArray(x,0);for(let v=1,y=0;v!==p;++v)y+=m,d[v].toArray(x,y)}return x}function qe(d,p){if(d.length!==p.length)return!1;for(let m=0,g=d.length;m<g;m++)if(d[m]!==p[m])return!1;return!0}function Ye(d,p){for(let m=0,g=p.length;m<g;m++)d[m]=p[m]}function la(d,p){let m=Qd[p];if(m===void 0)m=new Int32Array(p),Qd[p]=m;for(let g=0;g!==p;++g)m[g]=d.allocateTextureUnit();return m}function _x(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1f(this.addr,p),m[0]=p}function xx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2f(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(qe(m,p))return;d.uniform2fv(this.addr,p),Ye(m,p)}}function vx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3f(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else if(p.r!==void 0){if(m[0]!==p.r||m[1]!==p.g||m[2]!==p.b)d.uniform3f(this.addr,p.r,p.g,p.b),m[0]=p.r,m[1]=p.g,m[2]=p.b}else{if(qe(m,p))return;d.uniform3fv(this.addr,p),Ye(m,p)}}function yx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4f(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(qe(m,p))return;d.uniform4fv(this.addr,p),Ye(m,p)}}function Sx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(qe(m,p))return;d.uniformMatrix2fv(this.addr,!1,p),Ye(m,p)}else{if(qe(m,g))return;nf.set(g),d.uniformMatrix2fv(this.addr,!1,nf),Ye(m,g)}}function Mx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(qe(m,p))return;d.uniformMatrix3fv(this.addr,!1,p),Ye(m,p)}else{if(qe(m,g))return;ef.set(g),d.uniformMatrix3fv(this.addr,!1,ef),Ye(m,g)}}function bx(d,p){let m=this.cache,g=p.elements;if(g===void 0){if(qe(m,p))return;d.uniformMatrix4fv(this.addr,!1,p),Ye(m,p)}else{if(qe(m,g))return;tf.set(g),d.uniformMatrix4fv(this.addr,!1,tf),Ye(m,g)}}function Ex(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1i(this.addr,p),m[0]=p}function Tx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2i(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(qe(m,p))return;d.uniform2iv(this.addr,p),Ye(m,p)}}function wx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3i(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else{if(qe(m,p))return;d.uniform3iv(this.addr,p),Ye(m,p)}}function Ax(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4i(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(qe(m,p))return;d.uniform4iv(this.addr,p),Ye(m,p)}}function Rx(d,p){let m=this.cache;if(m[0]===p)return;d.uniform1ui(this.addr,p),m[0]=p}function Cx(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y)d.uniform2ui(this.addr,p.x,p.y),m[0]=p.x,m[1]=p.y}else{if(qe(m,p))return;d.uniform2uiv(this.addr,p),Ye(m,p)}}function Ix(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z)d.uniform3ui(this.addr,p.x,p.y,p.z),m[0]=p.x,m[1]=p.y,m[2]=p.z}else{if(qe(m,p))return;d.uniform3uiv(this.addr,p),Ye(m,p)}}function Px(d,p){let m=this.cache;if(p.x!==void 0){if(m[0]!==p.x||m[1]!==p.y||m[2]!==p.z||m[3]!==p.w)d.uniform4ui(this.addr,p.x,p.y,p.z,p.w),m[0]=p.x,m[1]=p.y,m[2]=p.z,m[3]=p.w}else{if(qe(m,p))return;d.uniform4uiv(this.addr,p),Ye(m,p)}}function ca(d){if(d.version===0)d.compareFunction=xc,d.needsUpdate=!0;return d}function Lx(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;let x;if(this.type===d.SAMPLER_2D_SHADOW)x=ca(Sf);else x=yf;m.setTexture2D(p||x,_)}function Nx(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;m.setTexture3D(p||Ef,_)}function Dx(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;let x;if(this.type===d.SAMPLER_CUBE_SHADOW)x=ca(Mf);else x=Tf;m.setTextureCube(p||x,_)}function Ux(d,p,m){let g=this.cache,_=m.allocateTextureUnit();if(g[0]!==_)d.uniform1i(this.addr,_),g[0]=_;m.setTexture2DArray(p||bf,_)}function Fx(d){switch(d){case 5126:return _x;case 35664:return xx;case 35665:return vx;case 35666:return yx;case 35674:return Sx;case 35675:return Mx;case 35676:return bx;case 5124:case 35670:return Ex;case 35667:case 35671:return Tx;case 35668:case 35672:return wx;case 35669:case 35673:return Ax;case 5125:return Rx;case 36294:return Cx;case 36295:return Ix;case 36296:return Px;case 35678:case 36198:case 36298:case 36306:case 35682:return Lx;case 35679:case 36299:case 36307:return Nx;case 35680:case 36300:case 36308:case 36293:return Dx;case 36289:case 36303:case 36311:case 36292:return Ux}}function Ox(d,p){d.uniform1fv(this.addr,p)}function Bx(d,p){let m=Bs(p,this.size,2);d.uniform2fv(this.addr,m)}function kx(d,p){let m=Bs(p,this.size,3);d.uniform3fv(this.addr,m)}function zx(d,p){let m=Bs(p,this.size,4);d.uniform4fv(this.addr,m)}function Hx(d,p){let m=Bs(p,this.size,4);d.uniformMatrix2fv(this.addr,!1,m)}function Gx(d,p){let m=Bs(p,this.size,9);d.uniformMatrix3fv(this.addr,!1,m)}function Vx(d,p){let m=Bs(p,this.size,16);d.uniformMatrix4fv(this.addr,!1,m)}function Wx(d,p){d.uniform1iv(this.addr,p)}function Xx(d,p){d.uniform2iv(this.addr,p)}function qx(d,p){d.uniform3iv(this.addr,p)}function Yx(d,p){d.uniform4iv(this.addr,p)}function Zx(d,p){d.uniform1uiv(this.addr,p)}function $x(d,p){d.uniform2uiv(this.addr,p)}function Jx(d,p){d.uniform3uiv(this.addr,p)}function Kx(d,p){d.uniform4uiv(this.addr,p)}function jx(d,p,m){let g=this.cache,_=p.length,x=la(m,_);if(!qe(g,x))d.uniform1iv(this.addr,x),Ye(g,x);let v;if(this.type===d.SAMPLER_2D_SHADOW)v=ca(Sf);else v=yf;for(let y=0;y!==_;++y)m.setTexture2D(p[y]||v,x[y])}function Qx(d,p,m){let g=this.cache,_=p.length,x=la(m,_);if(!qe(g,x))d.uniform1iv(this.addr,x),Ye(g,x);for(let v=0;v!==_;++v)m.setTexture3D(p[v]||Ef,x[v])}function tv(d,p,m){let g=this.cache,_=p.length,x=la(m,_);if(!qe(g,x))d.uniform1iv(this.addr,x),Ye(g,x);let v;if(this.type===d.SAMPLER_CUBE_SHADOW)v=ca(Mf);else v=Tf;for(let y=0;y!==_;++y)m.setTextureCube(p[y]||v,x[y])}function ev(d,p,m){let g=this.cache,_=p.length,x=la(m,_);if(!qe(g,x))d.uniform1iv(this.addr,x),Ye(g,x);for(let v=0;v!==_;++v)m.setTexture2DArray(p[v]||bf,x[v])}function nv(d){switch(d){case 5126:return Ox;case 35664:return Bx;case 35665:return kx;case 35666:return zx;case 35674:return Hx;case 35675:return Gx;case 35676:return Vx;case 5124:case 35670:return Wx;case 35667:case 35671:return Xx;case 35668:case 35672:return qx;case 35669:case 35673:return Yx;case 5125:return Zx;case 36294:return $x;case 36295:return Jx;case 36296:return Kx;case 35678:case 36198:case 36298:case 36306:case 35682:return jx;case 35679:case 36299:case 36307:return Qx;case 35680:case 36300:case 36308:case 36293:return tv;case 36289:case 36303:case 36311:case 36292:return ev}}class wf{constructor(d,p,m){this.id=d,this.addr=m,this.cache=[],this.type=p.type,this.setValue=Fx(p.type)}}class Af{constructor(d,p,m){this.id=d,this.addr=m,this.cache=[],this.type=p.type,this.size=p.size,this.setValue=nv(p.type)}}class Rf{constructor(d){this.id=d,this.seq=[],this.map={}}setValue(d,p,m){let g=this.seq;for(let _=0,x=g.length;_!==x;++_){let v=g[_];v.setValue(d,p[v.id],m)}}}var $c=/(\w+)(\])?(\[|\.)?/g;function sf(d,p){d.seq.push(p),d.map[p.id]=p}function iv(d,p,m){let g=d.name,_=g.length;$c.lastIndex=0;while(!0){let x=$c.exec(g),v=$c.lastIndex,y=x[1],S=x[2]==="]",M=x[3];if(S)y=y|0;if(M===void 0||M==="["&&v+2===_){sf(m,M===void 0?new wf(y,d,p):new Af(y,d,p));break}else{let T=m.map[y];if(T===void 0)T=new Rf(y),sf(m,T);m=T}}}class Dr{constructor(d,p){this.seq=[],this.map={};let m=d.getProgramParameter(p,d.ACTIVE_UNIFORMS);for(let x=0;x<m;++x){let v=d.getActiveUniform(p,x),y=d.getUniformLocation(p,v.name);iv(v,y,this)}let g=[],_=[];for(let x of this.seq)if(x.type===d.SAMPLER_2D_SHADOW||x.type===d.SAMPLER_CUBE_SHADOW||x.type===d.SAMPLER_2D_ARRAY_SHADOW)g.push(x);else _.push(x);if(g.length>0)this.seq=g.concat(_)}setValue(d,p,m,g){let _=this.map[p];if(_!==void 0)_.setValue(d,m,g)}setOptional(d,p,m){let g=p[m];if(g!==void 0)this.setValue(d,m,g)}static upload(d,p,m,g){for(let _=0,x=p.length;_!==x;++_){let v=p[_],y=m[v.id];if(y.needsUpdate!==!1)v.setValue(d,y.value,g)}}static seqWithValue(d,p){let m=[];for(let g=0,_=d.length;g!==_;++g){let x=d[g];if(x.id in p)m.push(x)}return m}}function rf(d,p,m){let g=d.createShader(p);return d.shaderSource(g,m),d.compileShader(g),g}var sv=37297,rv=0;function ov(d,p){let m=d.split(`
`),g=[],_=Math.max(p-6,0),x=Math.min(p+6,m.length);for(let v=_;v<x;v++){let y=v+1;g.push(`${y===p?">":" "} ${y}: ${m[v]}`)}return g.join(`
`)}var of=new Kt;function av(d){le._getMatrix(of,le.workingColorSpace,d);let p=`mat3( ${of.elements.map((m)=>m.toFixed(4))} )`;switch(le.getTransfer(d)){case mc:return[p,"LinearTransferOETF"];case Ie:return[p,"sRGBTransferOETF"];default:return Xt("WebGLProgram: Unsupported color space: ",d),[p,"LinearTransferOETF"]}}function af(d,p,m){let g=d.getShaderParameter(p,d.COMPILE_STATUS),x=(d.getShaderInfoLog(p)||"").trim();if(g&&x==="")return"";let v=/ERROR: 0:(\d+)/.exec(x);if(v){let y=parseInt(v[1]);return m.toUpperCase()+`

`+x+`

`+ov(d.getShaderSource(p),y)}else return x}function lv(d,p){let m=av(p);return[`vec4 ${d}( vec4 value ) {`,`	return ${m[1]}( vec4( ${m[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var cv={[Al]:"Linear",[Rl]:"Reinhard",[Cl]:"Cineon",[Il]:"ACESFilmic",[Ll]:"AgX",[Nl]:"Neutral",[Pl]:"Custom"};function hv(d,p){let m=cv[p];if(m===void 0)return Xt("WebGLProgram: Unsupported toneMapping:",p),"vec3 "+d+"( vec3 color ) { return LinearToneMapping( color ); }";return"vec3 "+d+"( vec3 color ) { return "+m+"ToneMapping( color ); }"}var ra=new q;function uv(){le.getLuminanceCoefficients(ra);let d=ra.x.toFixed(4),p=ra.y.toFixed(4),m=ra.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${d}, ${p}, ${m} );`,"\treturn dot( weights, rgb );","}"].join(`
`)}function dv(d){return[d.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",d.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Nr).join(`
`)}function fv(d){let p=[];for(let m in d){let g=d[m];if(g===!1)continue;p.push("#define "+m+" "+g)}return p.join(`
`)}function pv(d,p){let m={},g=d.getProgramParameter(p,d.ACTIVE_ATTRIBUTES);for(let _=0;_<g;_++){let x=d.getActiveAttrib(p,_),v=x.name,y=1;if(x.type===d.FLOAT_MAT2)y=2;if(x.type===d.FLOAT_MAT3)y=3;if(x.type===d.FLOAT_MAT4)y=4;m[v]={type:x.type,location:d.getAttribLocation(p,v),locationSize:y}}return m}function Nr(d){return d!==""}function lf(d,p){let m=p.numSpotLightShadows+p.numSpotLightMaps-p.numSpotLightShadowsWithMaps;return d.replace(/NUM_SUN_LIGHTS/g,p.numSunLights).replace(/NUM_DIR_LIGHTS/g,p.numDirLights).replace(/NUM_SPOT_LIGHTS/g,p.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,p.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,m).replace(/NUM_RECT_AREA_LIGHTS/g,p.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,p.numPointLights).replace(/NUM_HEMI_LIGHTS/g,p.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,p.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,p.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,p.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,p.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,p.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,p.numLightProbeGrids)}function cf(d,p){return d.replace(/NUM_CLIPPING_PLANES/g,p.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,p.numClippingPlanes-p.numClipIntersection)}var mv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Kc(d){return d.replace(mv,gv)}function gv(d,p){let m=oe[p];if(m===void 0)throw Error("THREE.WebGLProgram: Can not resolve #include <"+p+">");return Kc(m)}var _v=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function hf(d){return d.replace(_v,xv)}function xv(d,p,m,g){let _="";for(let x=parseInt(p);x<parseInt(m);x++)_+=g.replace(/\[\s*i\s*\]/g,"[ "+x+" ]").replace(/UNROLLED_LOOP_INDEX/g,x);return _}function uf(d){let p=`precision ${d.precision} float;
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
#define LOW_PRECISION`;return p}var vv={[pr]:"SHADOWMAP_TYPE_PCF",[Is]:"SHADOWMAP_TYPE_VSM"};function yv(d){return vv[d.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Sv={[Ls]:"ENVMAP_MODE_REFRACTION"};function Mv(d){if(d.envMap===!1)return"ENVMAP_MODE_REFLECTION";return Sv[d.envMapMode]||"ENVMAP_MODE_REFLECTION"}var bv={[_d]:"ENVMAP_BLENDING_MULTIPLY",[xd]:"ENVMAP_BLENDING_MIX",[vd]:"ENVMAP_BLENDING_ADD"};function Ev(d){if(d.envMap===!1)return"ENVMAP_BLENDING_NONE";return bv[d.combine]||"ENVMAP_BLENDING_NONE"}function Tv(d,p,m,g){let _=d.getContext(),{defines:x,vertexShader:v,fragmentShader:y}=m,S=yv(m),M=m.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",E=Mv(m),T=Ev(m),b=dv(m),w=fv(x),C=_.createProgram(),N,A,R=m.glslVersion?"#version "+m.glslVersion+`
`:"";if(m.isRawShaderMaterial){if(N=["#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w].filter(Nr).join(`
`),N.length>0)N+=`
`;if(A=["#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w].filter(Nr).join(`
`),A.length>0)A+=`
`}else N=[uf(m),"#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w,m.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",m.batching?"#define USE_BATCHING":"",m.batchingColor?"#define USE_BATCHING_COLOR":"",m.instancing?"#define USE_INSTANCING":"",m.instancingColor?"#define USE_INSTANCING_COLOR":"",m.instancingMorph?"#define USE_INSTANCING_MORPH":"",m.useFog&&m.fog?"#define USE_FOG":"",m.useFog&&m.fogExp2?"#define FOG_EXP2":"",m.map?"#define USE_MAP":"",m.envMap?"#define USE_ENVMAP":"",m.envMap?"#define "+E:"",m.lightMap?"#define USE_LIGHTMAP":"",m.aoMap?"#define USE_AOMAP":"",m.bumpMap?"#define USE_BUMPMAP":"",m.normalMap?"#define USE_NORMALMAP":"",m.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",m.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",m.displacementMap?"#define USE_DISPLACEMENTMAP":"",m.emissiveMap?"#define USE_EMISSIVEMAP":"",m.anisotropy?"#define USE_ANISOTROPY":"",m.anisotropyMap?"#define USE_ANISOTROPYMAP":"",m.clearcoatMap?"#define USE_CLEARCOATMAP":"",m.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",m.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",m.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",m.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",m.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",m.specularMap?"#define USE_SPECULARMAP":"",m.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",m.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",m.roughnessMap?"#define USE_ROUGHNESSMAP":"",m.metalnessMap?"#define USE_METALNESSMAP":"",m.alphaMap?"#define USE_ALPHAMAP":"",m.alphaHash?"#define USE_ALPHAHASH":"",m.transmission?"#define USE_TRANSMISSION":"",m.transmissionMap?"#define USE_TRANSMISSIONMAP":"",m.thicknessMap?"#define USE_THICKNESSMAP":"",m.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",m.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",m.mapUv?"#define MAP_UV "+m.mapUv:"",m.alphaMapUv?"#define ALPHAMAP_UV "+m.alphaMapUv:"",m.lightMapUv?"#define LIGHTMAP_UV "+m.lightMapUv:"",m.aoMapUv?"#define AOMAP_UV "+m.aoMapUv:"",m.emissiveMapUv?"#define EMISSIVEMAP_UV "+m.emissiveMapUv:"",m.bumpMapUv?"#define BUMPMAP_UV "+m.bumpMapUv:"",m.normalMapUv?"#define NORMALMAP_UV "+m.normalMapUv:"",m.displacementMapUv?"#define DISPLACEMENTMAP_UV "+m.displacementMapUv:"",m.metalnessMapUv?"#define METALNESSMAP_UV "+m.metalnessMapUv:"",m.roughnessMapUv?"#define ROUGHNESSMAP_UV "+m.roughnessMapUv:"",m.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+m.anisotropyMapUv:"",m.clearcoatMapUv?"#define CLEARCOATMAP_UV "+m.clearcoatMapUv:"",m.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+m.clearcoatNormalMapUv:"",m.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+m.clearcoatRoughnessMapUv:"",m.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+m.diffuseRoughnessMapUv:"",m.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+m.iridescenceMapUv:"",m.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+m.iridescenceThicknessMapUv:"",m.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+m.sheenColorMapUv:"",m.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+m.sheenRoughnessMapUv:"",m.specularMapUv?"#define SPECULARMAP_UV "+m.specularMapUv:"",m.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+m.specularColorMapUv:"",m.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+m.specularIntensityMapUv:"",m.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+m.transmissionMapUv:"",m.thicknessMapUv?"#define THICKNESSMAP_UV "+m.thicknessMapUv:"",m.vertexTangents&&m.flatShading===!1?"#define USE_TANGENT":"",m.vertexNormals?"#define HAS_NORMAL":"",m.vertexColors?"#define USE_COLOR":"",m.vertexAlphas?"#define USE_COLOR_ALPHA":"",m.vertexUv1s?"#define USE_UV1":"",m.vertexUv2s?"#define USE_UV2":"",m.vertexUv3s?"#define USE_UV3":"",m.pointsUvs?"#define USE_POINTS_UV":"",m.flatShading?"#define FLAT_SHADED":"",m.skinning?"#define USE_SKINNING":"",m.morphTargets?"#define USE_MORPHTARGETS":"",m.morphNormals&&m.flatShading===!1?"#define USE_MORPHNORMALS":"",m.morphColors?"#define USE_MORPHCOLORS":"",m.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+m.morphTextureStride:"",m.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+m.morphTargetsCount:"",m.doubleSided?"#define DOUBLE_SIDED":"",m.flipSided?"#define FLIP_SIDED":"",m.shadowMapEnabled?"#define USE_SHADOWMAP":"",m.shadowMapEnabled?"#define "+S:"",m.sizeAttenuation?"#define USE_SIZEATTENUATION":"",m.numLightProbes>0?"#define USE_LIGHT_PROBES":"",m.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",m.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","\tattribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","\tattribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","\tuniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","\tattribute vec2 uv1;","#endif","#ifdef USE_UV2","\tattribute vec2 uv2;","#endif","#ifdef USE_UV3","\tattribute vec2 uv3;","#endif","#ifdef USE_TANGENT","\tattribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","\tattribute vec4 color;","#elif defined( USE_COLOR )","\tattribute vec3 color;","#endif","#ifdef USE_SKINNING","\tattribute vec4 skinIndex;","\tattribute vec4 skinWeight;","#endif",`
`].filter(Nr).join(`
`),A=[uf(m),"#define SHADER_TYPE "+m.shaderType,"#define SHADER_NAME "+m.shaderName,w,m.useFog&&m.fog?"#define USE_FOG":"",m.useFog&&m.fogExp2?"#define FOG_EXP2":"",m.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",m.map?"#define USE_MAP":"",m.matcap?"#define USE_MATCAP":"",m.envMap?"#define USE_ENVMAP":"",m.envMap?"#define "+M:"",m.envMap?"#define "+E:"",m.envMap?"#define "+T:"",m.envMapPMREM?"#define ENVMAP_MAX_LOD "+m.envMapMaxLod+".0":"",m.envMapPMREM?"#define ENVMAP_SIZE "+m.envMapSize+".0":"",m.lightMap?"#define USE_LIGHTMAP":"",m.aoMap?"#define USE_AOMAP":"",m.bumpMap?"#define USE_BUMPMAP":"",m.normalMap?"#define USE_NORMALMAP":"",m.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",m.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",m.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",m.emissiveMap?"#define USE_EMISSIVEMAP":"",m.anisotropy?"#define USE_ANISOTROPY":"",m.anisotropyMap?"#define USE_ANISOTROPYMAP":"",m.clearcoat?"#define USE_CLEARCOAT":"",m.clearcoatMap?"#define USE_CLEARCOATMAP":"",m.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",m.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",m.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",m.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",m.dispersion?"#define USE_DISPERSION":"",m.retroreflection?"#define USE_RETROREFLECTION":"",m.iridescence?"#define USE_IRIDESCENCE":"",m.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",m.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",m.specularMap?"#define USE_SPECULARMAP":"",m.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",m.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",m.roughnessMap?"#define USE_ROUGHNESSMAP":"",m.metalnessMap?"#define USE_METALNESSMAP":"",m.alphaMap?"#define USE_ALPHAMAP":"",m.alphaTest?"#define USE_ALPHATEST":"",m.alphaHash?"#define USE_ALPHAHASH":"",m.sheen?"#define USE_SHEEN":"",m.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",m.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",m.transmission?"#define USE_TRANSMISSION":"",m.transmissionMap?"#define USE_TRANSMISSIONMAP":"",m.thicknessMap?"#define USE_THICKNESSMAP":"",m.vertexTangents&&m.flatShading===!1?"#define USE_TANGENT":"",m.vertexColors||m.instancingColor?"#define USE_COLOR":"",m.vertexAlphas||m.batchingColor?"#define USE_COLOR_ALPHA":"",m.vertexUv1s?"#define USE_UV1":"",m.vertexUv2s?"#define USE_UV2":"",m.vertexUv3s?"#define USE_UV3":"",m.pointsUvs?"#define USE_POINTS_UV":"",m.gradientMap?"#define USE_GRADIENTMAP":"",m.flatShading?"#define FLAT_SHADED":"",m.doubleSided?"#define DOUBLE_SIDED":"",m.flipSided?"#define FLIP_SIDED":"",m.shadowMapEnabled?"#define USE_SHADOWMAP":"",m.shadowMapEnabled?"#define "+S:"",m.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",m.numLightProbes>0?"#define USE_LIGHT_PROBES":"",m.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",m.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",m.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",m.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",m.toneMapping!==Yn?"#define TONE_MAPPING":"",m.toneMapping!==Yn?oe.tonemapping_pars_fragment:"",m.toneMapping!==Yn?hv("toneMapping",m.toneMapping):"",m.dithering?"#define DITHERING":"",m.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,lv("linearToOutputTexel",m.outputColorSpace),uv(),m.useDepthPacking?"#define DEPTH_PACKING "+m.depthPacking:"",`
`].filter(Nr).join(`
`);if(v=Kc(v),v=lf(v,m),v=cf(v,m),y=Kc(y),y=lf(y,m),y=cf(y,m),v=hf(v),y=hf(y),m.isRawShaderMaterial!==!0)R=`#version 300 es
`,N=[b,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+N,A=["#define varying in",m.glslVersion===vc?"":"layout(location = 0) out highp vec4 pc_fragColor;",m.glslVersion===vc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+A;let P=R+N+v,F=R+A+y,L=rf(_,_.VERTEX_SHADER,P),U=rf(_,_.FRAGMENT_SHADER,F);if(_.attachShader(C,L),_.attachShader(C,U),m.index0AttributeName!==void 0)_.bindAttribLocation(C,0,m.index0AttributeName);else if(m.hasPositionAttribute===!0)_.bindAttribLocation(C,0,"position");_.linkProgram(C);function k(W){if(d.debug.checkShaderErrors){let H=_.getProgramInfoLog(C)||"",X=_.getShaderInfoLog(L)||"",J=_.getShaderInfoLog(U)||"",G=H.trim(),Q=X.trim(),it=J.trim(),j=!0,_t=!0;if(_.getProgramParameter(C,_.LINK_STATUS)===!1)if(j=!1,typeof d.debug.onShaderError==="function")d.debug.onShaderError(_,C,L,U);else{let rt=af(_,L,"vertex"),ut=af(_,U,"fragment");$t("WebGLProgram: Shader Error "+_.getError()+" - VALIDATE_STATUS "+_.getProgramParameter(C,_.VALIDATE_STATUS)+`

Material Name: `+W.name+`
Material Type: `+W.type+`

Program Info Log: `+G+`
`+rt+`
`+ut)}else if(G!=="")Xt("WebGLProgram: Program Info Log:",G);else if(Q===""||it==="")_t=!1;if(_t)W.diagnostics={runnable:j,programLog:G,vertexShader:{log:Q,prefix:N},fragmentShader:{log:it,prefix:A}}}_.deleteShader(L),_.deleteShader(U),I=new Dr(_,C),D=pv(_,C)}let I;this.getUniforms=function(){if(I===void 0)k(this);return I};let D;this.getAttributes=function(){if(D===void 0)k(this);return D};let z=m.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){if(z===!1)z=_.getProgramParameter(C,sv);return z},this.destroy=function(){g.releaseStatesOfProgram(this),_.deleteProgram(C),this.program=void 0},this.type=m.shaderType,this.name=m.shaderName,this.id=rv++,this.cacheKey=p,this.usedTimes=1,this.program=C,this.vertexShader=L,this.fragmentShader=U,this}var wv=0;class Cf{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(d,p,m){let g=this._getShaderCacheForMaterial(d);if(g.has(p)===!1)g.add(p),p.usedTimes++;if(g.has(m)===!1)g.add(m),m.usedTimes++;return this}remove(d){let p=this.materialCache.get(d);for(let m of p)if(m.usedTimes--,m.usedTimes===0)this.shaderCache.delete(m.code);return this.materialCache.delete(d),this}getVertexShaderStage(d){return this._getShaderStage(d.vertexShader)}getFragmentShaderStage(d){return this._getShaderStage(d.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(d){let p=this.materialCache,m=p.get(d);if(m===void 0)m=new Set,p.set(d,m);return m}_getShaderStage(d){let p=this.shaderCache,m=p.get(d);if(m===void 0)m=new If(d),p.set(d,m);return m}}class If{constructor(d){this.id=wv++,this.code=d,this.usedTimes=0}}function Av(d){return d===Ji||d===Uo||d===Fo}function Rv(d,p,m,g,_,x){let v=new br,y=new Cf,S=new Set,M=[],E=new Map,T=g.logarithmicDepthBuffer,b={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function w(I){if(S.add(I),I===0)return"uv";return`uv${I}`}function C(I,D,z,W,H,X){let J=W.fog,G=H.geometry,Q=I.isMeshStandardMaterial||I.isMeshLambertMaterial||I.isMeshPhongMaterial?W.environment:null,it=I.isMeshStandardMaterial||I.isMeshLambertMaterial&&!I.envMap||I.isMeshPhongMaterial&&!I.envMap,j=p.get(I.envMap||Q,it),_t=b[I.type],rt=g.precision;if(I.precision!==null){if(rt=g.getMaxPrecision(I.precision),rt!==I.precision)Xt("WebGLProgram.getParameters:",I.precision,"not supported, using",rt,"instead.")}let ut=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,mt=ut!==void 0?ut.length:0,Nt=0;if(G.morphAttributes.position!==void 0)Nt=1;if(G.morphAttributes.normal!==void 0)Nt=2;if(G.morphAttributes.color!==void 0)Nt=3;let ot,ft,Ct,zt;if(_t){let Pt=Jn[_t];ot=Pt.vertexShader,ft=Pt.fragmentShader}else{ot=I.vertexShader,ft=I.fragmentShader;let Pt=y.getVertexShaderStage(I),Te=y.getFragmentShaderStage(I);y.update(I,Pt,Te),Ct=Pt.id,zt=Te.id}let Dt=d.getRenderTarget(),wt=d.state.buffers.depth.getReversed(),jt=H.isInstancedMesh===!0,Qt=H.isBatchedMesh===!0,Ft=!!I.map,Zt=!!I.matcap,qt=!!j,fe=qt&&j.isPMREMTexture===!0,pe=!!I.aoMap,ge=!!I.lightMap,be=!!I.bumpMap&&I.wireframe===!1,gt=!!I.normalMap,Gt=!!I.displacementMap,ae=!!I.emissiveMap,Re=!!I.metalnessMap,gn=!!I.roughnessMap,K=I.anisotropy>0,_n=I.clearcoat>0,Se=I.diffuseRoughness>0,Ze=I.dispersion>0,At=I.retroreflectivity>0,Ne=I.iridescence>0,Yt=I.sheen>0,te=I.transmission>0,rn=K&&!!I.anisotropyMap,V=_n&&!!I.clearcoatMap,O=_n&&!!I.clearcoatNormalMap,tt=_n&&!!I.clearcoatRoughnessMap,pt=Se&&!!I.diffuseRoughnessMap,dt=Ne&&!!I.iridescenceMap,yt=Ne&&!!I.iridescenceThicknessMap,bt=Yt&&!!I.sheenColorMap,at=Yt&&!!I.sheenRoughnessMap,ht=!!I.specularMap,St=!!I.specularColorMap,Y=!!I.specularIntensityMap,ct=te&&!!I.transmissionMap,lt=te&&!!I.thicknessMap,xt=!!I.gradientMap,vt=!!I.alphaMap,Tt=I.alphaTest>0,Vt=!!I.alphaHash,Ht=!!I.extensions,It=Yn;if(I.toneMapped){if(Dt===null||Dt.isXRRenderTarget===!0)It=d.toneMapping}let Wt=fe?j.isCompressedCubeTexture?j.image[0].mipmaps:j.mipmaps:null,re={shaderID:_t,shaderType:I.type,shaderName:I.name,vertexShader:ot,fragmentShader:ft,defines:I.defines,customVertexShaderID:Ct,customFragmentShaderID:zt,isRawShaderMaterial:I.isRawShaderMaterial===!0,glslVersion:I.glslVersion,precision:rt,batching:Qt,batchingColor:Qt&&H._colorsTexture!==null,instancing:jt,instancingColor:jt&&H.instanceColor!==null,instancingMorph:jt&&H.morphTexture!==null,outputColorSpace:Dt===null?d.outputColorSpace:Dt.isXRRenderTarget===!0?Dt.texture.colorSpace:le.workingColorSpace,alphaToCoverage:!!I.alphaToCoverage,map:Ft,matcap:Zt,envMap:qt,envMapMode:qt&&j.mapping,envMapPMREM:fe,envMapMaxLod:fe?Wt.length-1:null,envMapSize:fe?Wt[0].width:null,aoMap:pe,lightMap:ge,bumpMap:be,normalMap:gt,displacementMap:Gt,emissiveMap:ae,normalMapObjectSpace:gt&&I.normalMapType===Cd,normalMapTangentSpace:gt&&I.normalMapType===fc,packedNormalMap:gt&&I.normalMapType===fc&&Av(I.normalMap.format),metalnessMap:Re,roughnessMap:gn,anisotropy:K,anisotropyMap:rn,clearcoat:_n,clearcoatMap:V,clearcoatNormalMap:O,clearcoatRoughnessMap:tt,diffuseRoughness:Se,diffuseRoughnessMap:pt,dispersion:Ze,retroreflection:At,iridescence:Ne,iridescenceMap:dt,iridescenceThicknessMap:yt,sheen:Yt,sheenColorMap:bt,sheenRoughnessMap:at,specularMap:ht,specularColorMap:St,specularIntensityMap:Y,transmission:te,transmissionMap:ct,thicknessMap:lt,gradientMap:xt,opaque:I.transparent===!1&&I.blending===mr&&I.alphaToCoverage===!1,alphaMap:vt,alphaTest:Tt,alphaHash:Vt,combine:I.combine,mapUv:Ft&&w(I.map.channel),aoMapUv:pe&&w(I.aoMap.channel),lightMapUv:ge&&w(I.lightMap.channel),bumpMapUv:be&&w(I.bumpMap.channel),normalMapUv:gt&&w(I.normalMap.channel),displacementMapUv:Gt&&w(I.displacementMap.channel),emissiveMapUv:ae&&w(I.emissiveMap.channel),metalnessMapUv:Re&&w(I.metalnessMap.channel),roughnessMapUv:gn&&w(I.roughnessMap.channel),anisotropyMapUv:rn&&w(I.anisotropyMap.channel),clearcoatMapUv:V&&w(I.clearcoatMap.channel),clearcoatNormalMapUv:O&&w(I.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:tt&&w(I.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:pt&&w(I.diffuseRoughnessMap.channel),iridescenceMapUv:dt&&w(I.iridescenceMap.channel),iridescenceThicknessMapUv:yt&&w(I.iridescenceThicknessMap.channel),sheenColorMapUv:bt&&w(I.sheenColorMap.channel),sheenRoughnessMapUv:at&&w(I.sheenRoughnessMap.channel),specularMapUv:ht&&w(I.specularMap.channel),specularColorMapUv:St&&w(I.specularColorMap.channel),specularIntensityMapUv:Y&&w(I.specularIntensityMap.channel),transmissionMapUv:ct&&w(I.transmissionMap.channel),thicknessMapUv:lt&&w(I.thicknessMap.channel),alphaMapUv:vt&&w(I.alphaMap.channel),vertexTangents:!!G.attributes.tangent&&(gt||K),vertexNormals:!!G.attributes.normal,vertexColors:I.vertexColors,vertexAlphas:I.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!G.attributes.uv&&(Ft||vt),fog:!!J,useFog:I.fog===!0,fogExp2:!!J&&J.isFogExp2,flatShading:I.wireframe===!1&&(I.flatShading===!0||G.attributes.normal===void 0&&gt===!1&&(I.isMeshLambertMaterial||I.isMeshPhongMaterial||I.isMeshStandardMaterial||I.isMeshPhysicalMaterial)),sizeAttenuation:I.sizeAttenuation===!0,logarithmicDepthBuffer:T,reversedDepthBuffer:wt,skinning:H.isSkinnedMesh===!0,hasPositionAttribute:G.attributes.position!==void 0,morphTargets:G.morphAttributes.position!==void 0,morphNormals:G.morphAttributes.normal!==void 0,morphColors:G.morphAttributes.color!==void 0,morphTargetsCount:mt,morphTextureStride:Nt,numSunLights:D.sun.length,numDirLights:D.directional.length,numPointLights:D.point.length,numSpotLights:D.spot.length,numSpotLightMaps:D.spotLightMap.length,numRectAreaLights:D.rectArea.length,numHemiLights:D.hemi.length,numSunLightShadows:D.sunShadowMap.length,numDirLightShadows:D.directionalShadowMap.length,numPointLightShadows:D.pointShadowMap.length,numSpotLightShadows:D.spotShadowMap.length,numSpotLightShadowsWithMaps:D.numSpotLightShadowsWithMaps,numLightProbes:D.numLightProbes,numLightProbeGrids:X.filter((Pt)=>Pt.texture!==null).length,numClippingPlanes:x.numPlanes,numClipIntersection:x.numIntersection,dithering:I.dithering,shadowMapEnabled:d.shadowMap.enabled&&z.length>0,shadowMapType:d.shadowMap.type,toneMapping:It,decodeVideoTexture:Ft&&I.map.isVideoTexture===!0&&le.getTransfer(I.map.colorSpace)===Ie,decodeVideoTextureEmissive:ae&&I.emissiveMap.isVideoTexture===!0&&le.getTransfer(I.emissiveMap.colorSpace)===Ie,premultipliedAlpha:I.premultipliedAlpha,doubleSided:I.side===Ln,flipSided:I.side===dn,useDepthPacking:I.depthPacking>=0,depthPacking:I.depthPacking||0,index0AttributeName:I.index0AttributeName,extensionClipCullDistance:Ht&&I.extensions.clipCullDistance===!0&&m.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ht&&I.extensions.multiDraw===!0||Qt)&&m.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:m.has("KHR_parallel_shader_compile"),customProgramCacheKey:I.customProgramCacheKey()};return re.vertexUv1s=S.has(1),re.vertexUv2s=S.has(2),re.vertexUv3s=S.has(3),S.clear(),re}function N(I){let D=[];if(I.shaderID)D.push(I.shaderID);else D.push(I.customVertexShaderID),D.push(I.customFragmentShaderID);if(I.defines!==void 0)for(let z in I.defines)D.push(z),D.push(I.defines[z]);if(I.isRawShaderMaterial===!1)A(D,I),R(D,I),D.push(d.outputColorSpace);return D.push(I.customProgramCacheKey),D.join()}function A(I,D){I.push(D.precision),I.push(D.outputColorSpace),I.push(D.envMapMode),I.push(D.envMapPMREM),I.push(D.envMapMaxLod),I.push(D.envMapSize),I.push(D.mapUv),I.push(D.alphaMapUv),I.push(D.lightMapUv),I.push(D.aoMapUv),I.push(D.bumpMapUv),I.push(D.normalMapUv),I.push(D.displacementMapUv),I.push(D.emissiveMapUv),I.push(D.metalnessMapUv),I.push(D.roughnessMapUv),I.push(D.anisotropyMapUv),I.push(D.clearcoatMapUv),I.push(D.clearcoatNormalMapUv),I.push(D.clearcoatRoughnessMapUv),I.push(D.diffuseRoughnessMapUv),I.push(D.iridescenceMapUv),I.push(D.iridescenceThicknessMapUv),I.push(D.sheenColorMapUv),I.push(D.sheenRoughnessMapUv),I.push(D.specularMapUv),I.push(D.specularColorMapUv),I.push(D.specularIntensityMapUv),I.push(D.transmissionMapUv),I.push(D.thicknessMapUv),I.push(D.combine),I.push(D.fogExp2),I.push(D.sizeAttenuation),I.push(D.morphTargetsCount),I.push(D.numSunLights),I.push(D.numDirLights),I.push(D.numPointLights),I.push(D.numSpotLights),I.push(D.numSpotLightMaps),I.push(D.numHemiLights),I.push(D.numRectAreaLights),I.push(D.numSunLightShadows),I.push(D.numDirLightShadows),I.push(D.numPointLightShadows),I.push(D.numSpotLightShadows),I.push(D.numSpotLightShadowsWithMaps),I.push(D.numLightProbes),I.push(D.numLightProbeGrids),I.push(D.shadowMapType),I.push(D.toneMapping),I.push(D.numClippingPlanes),I.push(D.numClipIntersection),I.push(D.depthPacking)}function R(I,D){if(v.disableAll(),D.instancing)v.enable(0);if(D.instancingColor)v.enable(1);if(D.instancingMorph)v.enable(2);if(D.matcap)v.enable(3);if(D.envMap)v.enable(4);if(D.normalMapObjectSpace)v.enable(5);if(D.normalMapTangentSpace)v.enable(6);if(D.clearcoat)v.enable(7);if(D.iridescence)v.enable(8);if(D.alphaTest)v.enable(9);if(D.vertexColors)v.enable(10);if(D.vertexAlphas)v.enable(11);if(D.vertexUv1s)v.enable(12);if(D.vertexUv2s)v.enable(13);if(D.vertexUv3s)v.enable(14);if(D.vertexTangents)v.enable(15);if(D.anisotropy)v.enable(16);if(D.alphaHash)v.enable(17);if(D.batching)v.enable(18);if(D.dispersion)v.enable(19);if(D.retroreflection)v.enable(24);if(D.diffuseRoughness)v.enable(25);if(D.batchingColor)v.enable(20);if(D.gradientMap)v.enable(21);if(D.packedNormalMap)v.enable(22);if(D.vertexNormals)v.enable(23);if(I.push(v.mask),v.disableAll(),D.fog)v.enable(0);if(D.useFog)v.enable(1);if(D.flatShading)v.enable(2);if(D.logarithmicDepthBuffer)v.enable(3);if(D.reversedDepthBuffer)v.enable(4);if(D.skinning)v.enable(5);if(D.morphTargets)v.enable(6);if(D.morphNormals)v.enable(7);if(D.morphColors)v.enable(8);if(D.premultipliedAlpha)v.enable(9);if(D.shadowMapEnabled)v.enable(10);if(D.doubleSided)v.enable(11);if(D.flipSided)v.enable(12);if(D.useDepthPacking)v.enable(13);if(D.dithering)v.enable(14);if(D.transmission)v.enable(15);if(D.sheen)v.enable(16);if(D.opaque)v.enable(17);if(D.pointsUvs)v.enable(18);if(D.decodeVideoTexture)v.enable(19);if(D.decodeVideoTextureEmissive)v.enable(20);if(D.alphaToCoverage)v.enable(21);if(D.numLightProbeGrids>0)v.enable(22);if(D.hasPositionAttribute)v.enable(23);I.push(v.mask)}function P(I){let D=b[I.type],z;if(D){let W=Jn[D];z=Hd.clone(W.uniforms)}else z=I.uniforms;return z}function F(I,D){let z=E.get(D);if(z!==void 0)++z.usedTimes;else z=new Tv(d,D,I,_),M.push(z),E.set(D,z);return z}function L(I){if(--I.usedTimes===0){let D=M.indexOf(I);M[D]=M[M.length-1],M.pop(),E.delete(I.cacheKey),I.destroy()}}function U(I){y.remove(I)}function k(){y.dispose()}return{getParameters:C,getProgramCacheKey:N,getUniforms:P,acquireProgram:F,releaseProgram:L,releaseShaderCache:U,programs:M,dispose:k}}function Cv(){let d=new WeakMap;function p(v){return d.has(v)}function m(v){let y=d.get(v);if(y===void 0)y={},d.set(v,y);return y}function g(v){d.delete(v)}function _(v,y,S){d.get(v)[y]=S}function x(){d=new WeakMap}return{has:p,get:m,remove:g,update:_,dispose:x}}function Iv(d,p){if(d.groupOrder!==p.groupOrder)return d.groupOrder-p.groupOrder;else if(d.renderOrder!==p.renderOrder)return d.renderOrder-p.renderOrder;else if(d.material.id!==p.material.id)return d.material.id-p.material.id;else if(d.materialVariant!==p.materialVariant)return d.materialVariant-p.materialVariant;else if(d.z!==p.z)return d.z-p.z;else return d.id-p.id}function df(d,p){if(d.groupOrder!==p.groupOrder)return d.groupOrder-p.groupOrder;else if(d.renderOrder!==p.renderOrder)return d.renderOrder-p.renderOrder;else if(d.z!==p.z)return p.z-d.z;else return d.id-p.id}function ff(){let d=[],p=0,m=[],g=[],_=[];function x(){p=0,m.length=0,g.length=0,_.length=0}function v(b){let w=0;if(b.isInstancedMesh)w+=2;if(b.isSkinnedMesh)w+=1;return w}function y(b,w,C,N,A,R){let P=d[p];if(P===void 0)P={id:b.id,object:b,geometry:w,material:C,materialVariant:v(b),groupOrder:N,renderOrder:b.renderOrder,z:A,group:R},d[p]=P;else P.id=b.id,P.object=b,P.geometry=w,P.material=C,P.materialVariant=v(b),P.groupOrder=N,P.renderOrder=b.renderOrder,P.z=A,P.group=R;return p++,P}function S(b,w,C,N,A,R,P){if(P.reversedDepth===!0)A=-A;let F=y(b,w,C,N,A,R);if(C.transmission>0)g.push(F);else if(C.transparent===!0)_.push(F);else m.push(F)}function M(b,w,C,N,A,R){let P=y(b,w,C,N,A,R);if(C.transmission>0)g.unshift(P);else if(C.transparent===!0)_.unshift(P);else m.unshift(P)}function E(b,w){if(m.length>1)m.sort(b||Iv);if(g.length>1)g.sort(w||df);if(_.length>1)_.sort(w||df)}function T(){for(let b=p,w=d.length;b<w;b++){let C=d[b];if(C.id===null)break;C.id=null,C.object=null,C.geometry=null,C.material=null,C.group=null}}return{opaque:m,transmissive:g,transparent:_,init:x,push:S,unshift:M,finish:T,sort:E}}function Pv(){let d=new WeakMap;function p(g,_){let x=d.get(g),v;if(x===void 0)v=new ff,d.set(g,[v]);else if(_>=x.length)v=new ff,x.push(v);else v=x[_];return v}function m(){d=new WeakMap}return{get:p,dispose:m}}function Lv(){let d={};return{get:function(p){if(d[p.id]!==void 0)return d[p.id];let m;switch(p.type){case"SunLight":case"DirectionalLight":m={direction:new q,color:new se};break;case"SpotLight":m={position:new q,direction:new q,color:new se,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":m={position:new q,color:new se,distance:0,decay:0};break;case"HemisphereLight":m={direction:new q,skyColor:new se,groundColor:new se};break;case"RectAreaLight":m={color:new se,position:new q,halfWidth:new q,halfHeight:new q};break}return d[p.id]=m,m}}}function Nv(){let d={};return{get:function(p){if(d[p.id]!==void 0)return d[p.id];let m;switch(p.type){case"SunLight":case"DirectionalLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"SpotLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt};break;case"PointLight":m={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Jt,shadowCameraNear:1,shadowCameraFar:1000};break}return d[p.id]=m,m}}}var Dv=0;function Uv(d,p){return(p.castShadow?2:0)-(d.castShadow?2:0)+(p.map?1:0)-(d.map?1:0)}function Fv(d){let p=new Lv,m=Nv(),g={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let M=0;M<9;M++)g.probe.push(new q);let _=new q,x=new ie,v=new ie;function y(M){let E=0,T=0,b=0;for(let X=0;X<9;X++)g.probe[X].set(0,0,0);let w=0,C=0,N=0,A=0,R=0,P=0,F=0,L=0,U=0,k=0,I=0,D=0,z=0,W=0;M.sort(Uv);for(let X=0,J=M.length;X<J;X++){let G=M[X],{color:Q,intensity:it,distance:j}=G,_t=null;if(G.shadow&&G.shadow.map)if(G.shadow.map.texture.format===Ji)_t=G.shadow.map.texture;else _t=G.shadow.map.depthTexture||G.shadow.map.texture;if(G.isAmbientLight)E+=Q.r*it,T+=Q.g*it,b+=Q.b*it;else if(G.isLightProbe){for(let rt=0;rt<9;rt++)g.probe[rt].addScaledVector(G.sh.coefficients[rt],it);W++}else if(G.isSunLight){let rt=p.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let ut=G.shadow,mt=m.get(G);mt.shadowIntensity=ut.intensity,mt.shadowBias=ut.bias,mt.shadowNormalBias=ut.normalBias,mt.shadowRadius=ut.radius,mt.shadowMapSize.copy(ut.mapSize).multiply(ut.getFrameExtents()),g.sunShadow[C]=mt,g.sunShadowMap[C]=_t;let Nt=ut.getViewportCount();for(let ot=0;ot<Nt;ot++)g.sunShadowMatrix[N+ot]=ut.getMatrix(ot),g.sunShadowCascade[N+ot]=ut._cascadeData[ot];N+=Nt,C++}g.sun[w]=rt,w++}else if(G.isDirectionalLight){let rt=p.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),G.castShadow){let ut=G.shadow,mt=m.get(G);mt.shadowIntensity=ut.intensity,mt.shadowBias=ut.bias,mt.shadowNormalBias=ut.normalBias,mt.shadowRadius=ut.radius,mt.shadowMapSize=ut.mapSize,g.directionalShadow[A]=mt,g.directionalShadowMap[A]=_t,g.directionalShadowMatrix[A]=G.shadow.matrix,U++}g.directional[A]=rt,A++}else if(G.isSpotLight){let rt=p.get(G);rt.position.setFromMatrixPosition(G.matrixWorld),rt.color.copy(Q).multiplyScalar(it),rt.distance=j,rt.coneCos=Math.cos(G.angle),rt.penumbraCos=Math.cos(G.angle*(1-G.penumbra)),rt.decay=G.decay,g.spot[P]=rt;let ut=G.shadow;if(G.map){if(g.spotLightMap[D]=G.map,D++,ut.updateMatrices(G),G.castShadow)z++}if(g.spotLightMatrix[P]=ut.matrix,G.castShadow){let mt=m.get(G);mt.shadowIntensity=ut.intensity,mt.shadowBias=ut.bias,mt.shadowNormalBias=ut.normalBias,mt.shadowRadius=ut.radius,mt.shadowMapSize=ut.mapSize,g.spotShadow[P]=mt,g.spotShadowMap[P]=_t,I++}P++}else if(G.isRectAreaLight){let rt=p.get(G);rt.color.copy(Q).multiplyScalar(it),rt.halfWidth.set(G.width*0.5,0,0),rt.halfHeight.set(0,G.height*0.5,0),g.rectArea[F]=rt,F++}else if(G.isPointLight){let rt=p.get(G);if(rt.color.copy(G.color).multiplyScalar(G.intensity),rt.distance=G.distance,rt.decay=G.decay,G.castShadow){let ut=G.shadow,mt=m.get(G);mt.shadowIntensity=ut.intensity,mt.shadowBias=ut.bias,mt.shadowNormalBias=ut.normalBias,mt.shadowRadius=ut.radius,mt.shadowMapSize=ut.mapSize,mt.shadowCameraNear=ut.camera.near,mt.shadowCameraFar=ut.camera.far,g.pointShadow[R]=mt,g.pointShadowMap[R]=_t,g.pointShadowMatrix[R]=G.shadow.matrix,k++}g.point[R]=rt,R++}else if(G.isHemisphereLight){let rt=p.get(G);rt.skyColor.copy(G.color).multiplyScalar(it),rt.groundColor.copy(G.groundColor).multiplyScalar(it),g.hemi[L]=rt,L++}}if(F>0)if(d.has("OES_texture_float_linear")===!0)g.rectAreaLTC1=Rt.LTC_FLOAT_1,g.rectAreaLTC2=Rt.LTC_FLOAT_2;else g.rectAreaLTC1=Rt.LTC_HALF_1,g.rectAreaLTC2=Rt.LTC_HALF_2;g.ambient[0]=E,g.ambient[1]=T,g.ambient[2]=b;let H=g.hash;if(H.sunLength!==w||H.directionalLength!==A||H.pointLength!==R||H.spotLength!==P||H.rectAreaLength!==F||H.hemiLength!==L||H.numSunShadows!==C||H.numDirectionalShadows!==U||H.numPointShadows!==k||H.numSpotShadows!==I||H.numSpotMaps!==D||H.numLightProbes!==W)g.sun.length=w,g.directional.length=A,g.spot.length=P,g.rectArea.length=F,g.point.length=R,g.hemi.length=L,g.sunShadow.length=C,g.sunShadowMap.length=C,g.sunShadowMatrix.length=N,g.sunShadowCascade.length=N,g.directionalShadow.length=U,g.directionalShadowMap.length=U,g.directionalShadowMatrix.length=U,g.pointShadow.length=k,g.pointShadowMap.length=k,g.pointShadowMatrix.length=k,g.spotShadow.length=I,g.spotShadowMap.length=I,g.spotLightMatrix.length=I+D-z,g.spotLightMap.length=D,g.numSpotLightShadowsWithMaps=z,g.numLightProbes=W,H.sunLength=w,H.directionalLength=A,H.pointLength=R,H.spotLength=P,H.rectAreaLength=F,H.hemiLength=L,H.numSunShadows=C,H.numDirectionalShadows=U,H.numPointShadows=k,H.numSpotShadows=I,H.numSpotMaps=D,H.numLightProbes=W,g.version=Dv++}function S(M,E){let T=0,b=0,w=0,C=0,N=0,A=0,R=E.matrixWorldInverse;for(let P=0,F=M.length;P<F;P++){let L=M[P];if(L.isSunLight){let U=g.sun[T];U.direction.setFromMatrixPosition(L.matrixWorld),U.direction.transformDirection(R),T++}else if(L.isDirectionalLight){let U=g.directional[b];U.direction.setFromMatrixPosition(L.matrixWorld),_.setFromMatrixPosition(L.target.matrixWorld),U.direction.sub(_),U.direction.transformDirection(R),b++}else if(L.isSpotLight){let U=g.spot[C];U.position.setFromMatrixPosition(L.matrixWorld),U.position.applyMatrix4(R),U.direction.setFromMatrixPosition(L.matrixWorld),_.setFromMatrixPosition(L.target.matrixWorld),U.direction.sub(_),U.direction.transformDirection(R),C++}else if(L.isRectAreaLight){let U=g.rectArea[N];U.position.setFromMatrixPosition(L.matrixWorld),U.position.applyMatrix4(R),v.identity(),x.copy(L.matrixWorld),x.premultiply(R),v.extractRotation(x),U.halfWidth.set(L.width*0.5,0,0),U.halfHeight.set(0,L.height*0.5,0),U.halfWidth.applyMatrix4(v),U.halfHeight.applyMatrix4(v),N++}else if(L.isPointLight){let U=g.point[w];U.position.setFromMatrixPosition(L.matrixWorld),U.position.applyMatrix4(R),w++}else if(L.isHemisphereLight){let U=g.hemi[A];U.direction.setFromMatrixPosition(L.matrixWorld),U.direction.transformDirection(R),A++}}}return{setup:y,setupView:S,state:g}}function pf(d){let p=new Fv(d),m=[],g=[],_=[];function x(T){E.camera=T,m.length=0,g.length=0,_.length=0}function v(T){if(T.isLightProbeGrid)_.push(T);else m.push(T)}function y(T){g.push(T)}function S(){p.setup(m),_.sort((T,b)=>T.priority-b.priority||T.id-b.id)}function M(T){p.setupView(m,T)}let E={lightsArray:m,shadowsArray:g,lightProbeGridArray:_,camera:null,lights:p,transmissionRenderTarget:{},textureUnits:0};return{init:x,state:E,setupLights:S,setupLightsView:M,pushLight:v,pushShadow:y}}function Ov(d){let p=new WeakMap;function m(_,x=0){let v=p.get(_),y;if(v===void 0)y=new pf(d),p.set(_,[y]);else if(x>=v.length)y=new pf(d),v.push(y);else y=v[x];return y}function g(){p=new WeakMap}return{get:m,dispose:g}}var Bv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,kv=`uniform sampler2D shadow_pass;
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
}`,zv=[new q(1,0,0),new q(-1,0,0),new q(0,1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1)],Hv=[new q(0,-1,0),new q(0,-1,0),new q(0,0,1),new q(0,0,-1),new q(0,-1,0),new q(0,-1,0)],mf=new ie,Lr=new q,Jc=new q;function Gv(d,p,m){let g=new Ei,_=new Jt,x=new Jt,v=new Be,y=new Lc,S=new Nc,M={},E=m.maxTextureSize,T={[ci]:dn,[dn]:ci,[Ln]:Ln},b=new mi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Jt},radius:{value:4}},vertexShader:Bv,fragmentShader:kv}),w=b.clone();w.defines.HORIZONTAL_PASS=1;let C=new Qe;C.setAttribute("position",new Ve(new Float32Array([-1,-1,0.5,3,-1,0.5,-1,3,0.5]),3));let N=new nn(C,b),A=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=pr;let R=this.type;this.render=function(k,I,D){if(A.enabled===!1)return;if(A.autoUpdate===!1&&A.needsUpdate===!1)return;if(k.length===0)return;if(this.type===Vu)Xt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=pr;let z=d.getRenderTarget(),W=d.getActiveCubeFace(),H=d.getActiveMipmapLevel(),X=d.state;if(X.setBlending(Zi),X.buffers.depth.getReversed()===!0)X.buffers.color.setClear(0,0,0,0);else X.buffers.color.setClear(1,1,1,1);X.buffers.depth.setTest(!0),X.setScissorTest(!1);let J=R!==this.type;if(J)I.traverse(function(G){if(G.material)if(Array.isArray(G.material))G.material.forEach((Q)=>Q.needsUpdate=!0);else G.material.needsUpdate=!0});for(let G=0,Q=k.length;G<Q;G++){let it=k[G],j=it.shadow;if(j===void 0){Xt("WebGLShadowMap:",it,"has no shadow.");continue}if(j.autoUpdate===!1&&j.needsUpdate===!1)continue;_.copy(j.mapSize);let _t=j.getFrameExtents();if(_.multiply(_t),x.copy(j.mapSize),_.x>E||_.y>E){if(_.x>E)x.x=Math.floor(E/_t.x),_.x=x.x*_t.x,j.mapSize.x=x.x;if(_.y>E)x.y=Math.floor(E/_t.y),_.y=x.y*_t.y,j.mapSize.y=x.y}let rt=d.state.buffers.depth.getReversed();if(j.camera._reversedDepth=rt,j.map===null||J===!0){if(j.map!==null){if(j.map.depthTexture!==null)j.map.depthTexture.dispose(),j.map.depthTexture=null;j.map.dispose()}if(this.type===Is){if(it.isPointLight){Xt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}j.map=new Dn(_.x,_.y,{format:Ji,type:Zn,minFilter:Tn,magFilter:Tn,generateMipmaps:!1}),j.map.texture.name=it.name+".shadowMap",j.map.depthTexture=new Ni(_.x,_.y,hi),j.map.depthTexture.name=it.name+".shadowMapDepth",j.map.depthTexture.format=Ns,j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=Ti,j.map.depthTexture.magFilter=Ti}else{if(it.isPointLight)j.map=new aa(_.x),j.map.depthTexture=new qo(_.x,wi);else j.map=new Dn(_.x,_.y),j.map.depthTexture=new Ni(_.x,_.y,wi);if(j.map.depthTexture.name=it.name+".shadowMap",j.map.depthTexture.format=Ns,this.type===pr)j.map.depthTexture.compareFunction=rt?_c:gc,j.map.depthTexture.minFilter=Tn,j.map.depthTexture.magFilter=Tn;else j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=Ti,j.map.depthTexture.magFilter=Ti}j.camera.updateProjectionMatrix()}if(j.map.isWebGLCubeRenderTarget!==!0&&(j.map.width!==_.x||j.map.height!==_.y))j.map.setSize(_.x,_.y);let ut=j.map.isWebGLCubeRenderTarget?6:j.getViewportCount();if(it.isPointLight!==!0)j.updateMatrices(it,D);let mt=(j.camera.layers.mask&4294967294)!==0?j.camera.layers:D.layers;for(let Nt=0;Nt<ut;Nt++){let ot=j.getCamera(Nt);if(it.isPointLight){let{camera:ft,matrix:Ct}=j,zt=it.distance||ft.far;if(zt!==ft.far)ft.far=zt,ft.updateProjectionMatrix();Lr.setFromMatrixPosition(it.matrixWorld),ft.position.copy(Lr),Jc.copy(ft.position),Jc.add(zv[Nt]),ft.up.copy(Hv[Nt]),ft.lookAt(Jc),ft.updateMatrixWorld(),Ct.makeTranslation(-Lr.x,-Lr.y,-Lr.z),mf.multiplyMatrices(ft.projectionMatrix,ft.matrixWorldInverse),j._frustum.setFromProjectionMatrix(mf,ft.coordinateSystem,ft.reversedDepth)}if(j.map.isWebGLCubeRenderTarget)d.setRenderTarget(j.map,Nt),d.clear();else{if(Nt===0)d.setRenderTarget(j.map),d.clear();let ft=j.getViewport(Nt);v.set(x.x*ft.x,x.y*ft.y,x.x*ft.z,x.y*ft.w),X.viewport(v)}g=j.getFrustum(Nt),L(I,D,ot,it,mt,this.type)}if(j.isPointLightShadow!==!0&&this.type===Is)P(j,D);j.needsUpdate=!1}R=this.type,A.needsUpdate=!1,d.setRenderTarget(z,W,H)};function P(k,I){let D=p.update(N);if(b.defines.VSM_SAMPLES!==k.blurSamples)b.defines.VSM_SAMPLES=k.blurSamples,w.defines.VSM_SAMPLES=k.blurSamples,b.needsUpdate=!0,w.needsUpdate=!0;if(k.mapPass===null)k.mapPass=new Dn(_.x,_.y,{format:Ji,type:Zn});else if(k.mapPass.width!==k.map.width||k.mapPass.height!==k.map.height)k.mapPass.setSize(k.map.width,k.map.height);b.uniforms.shadow_pass.value=k.map.depthTexture,b.uniforms.resolution.value.set(k.map.width,k.map.height),b.uniforms.radius.value=k.radius,d.setRenderTarget(k.mapPass),d.clear(),d.renderBufferDirect(I,null,D,b,N,null),w.uniforms.shadow_pass.value=k.mapPass.texture,w.uniforms.resolution.value.set(k.map.width,k.map.height),w.uniforms.radius.value=k.radius,d.setRenderTarget(k.map),d.clear(),d.renderBufferDirect(I,null,D,w,N,null)}function F(k,I,D,z){let W=null,H=D.isPointLight===!0?k.customDistanceMaterial:k.customDepthMaterial;if(H!==void 0)W=H;else if(W=D.isPointLight===!0?S:y,d.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let X=W.uuid,J=I.uuid,G=M[X];if(G===void 0)G={},M[X]=G;let Q=G[J];if(Q===void 0)Q=W.clone(),G[J]=Q,I.addEventListener("dispose",U);W=Q}if(W.visible=I.visible,W.wireframe=I.wireframe,z===Is)W.side=I.shadowSide!==null?I.shadowSide:I.side;else W.side=I.shadowSide!==null?I.shadowSide:T[I.side];if(W.alphaMap=I.alphaMap,W.alphaTest=I.alphaToCoverage===!0?0.5:I.alphaTest,W.map=I.map,W.clipShadows=I.clipShadows,W.clippingPlanes=I.clippingPlanes,W.clipIntersection=I.clipIntersection,W.displacementMap=I.displacementMap,W.displacementScale=I.displacementScale,W.displacementBias=I.displacementBias,W.wireframeLinewidth=I.wireframeLinewidth,W.linewidth=I.linewidth,D.isPointLight===!0&&W.isMeshDistanceMaterial===!0){let X=d.properties.get(W);X.light=D}return W}function L(k,I,D,z,W,H){if(k.visible===!1)return;if(k.layers.test(W)&&(k.isMesh||k.isLine||k.isPoints)){if((k.castShadow||k.receiveShadow&&H===Is)&&(!k.frustumCulled||k.intersectsFrustum(g))){k.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,k.matrixWorld);let G=p.update(k),Q=k.material;if(Array.isArray(Q)){let it=G.groups;for(let j=0,_t=it.length;j<_t;j++){let rt=it[j],ut=Q[rt.materialIndex];if(ut&&ut.visible){let mt=F(k,ut,z,H);k.onBeforeShadow(d,k,I,D,G,mt,rt),d.renderBufferDirect(D,null,G,mt,k,rt),k.onAfterShadow(d,k,I,D,G,mt,rt)}}}else if(Q.visible){let it=F(k,Q,z,H);k.onBeforeShadow(d,k,I,D,G,it,null),d.renderBufferDirect(D,null,G,it,k,null),k.onAfterShadow(d,k,I,D,G,it,null)}}}let J=k.children;for(let G=0,Q=J.length;G<Q;G++)L(J[G],I,D,z,W,H)}function U(k){k.target.removeEventListener("dispose",U);for(let D in M){let z=M[D],W=k.target.uuid;if(W in z)z[W].dispose(),delete z[W]}}}function Vv(d,p){function m(){let Y=!1,ct=new Be,lt=null,xt=new Be(0,0,0,0);return{setMask:function(vt){if(lt!==vt&&!Y)d.colorMask(vt,vt,vt,vt),lt=vt},setLocked:function(vt){Y=vt},setClear:function(vt,Tt,Vt,Ht,It){if(It===!0)vt*=Ht,Tt*=Ht,Vt*=Ht;if(ct.set(vt,Tt,Vt,Ht),xt.equals(ct)===!1)d.clearColor(vt,Tt,Vt,Ht),xt.copy(ct)},reset:function(){Y=!1,lt=null,xt.set(-1,0,0,0)}}}function g(){let Y=!1,ct=!1,lt=null,xt=null,vt=null;return{setReversed:function(Tt){if(ct!==Tt){let Vt=p.get("EXT_clip_control");if(Tt)Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.ZERO_TO_ONE_EXT);else Vt.clipControlEXT(Vt.LOWER_LEFT_EXT,Vt.NEGATIVE_ONE_TO_ONE_EXT);ct=Tt;let Ht=vt;vt=null,this.setClear(Ht)}},getReversed:function(){return ct},setTest:function(Tt){if(Tt)wt(d.DEPTH_TEST);else jt(d.DEPTH_TEST)},setMask:function(Tt){if(lt!==Tt&&!Y)d.depthMask(Tt),lt=Tt},setFunc:function(Tt){if(ct)Tt=Bd[Tt];if(xt!==Tt){switch(Tt){case hd:d.depthFunc(d.NEVER);break;case ud:d.depthFunc(d.ALWAYS);break;case dd:d.depthFunc(d.LESS);break;case wl:d.depthFunc(d.LEQUAL);break;case fd:d.depthFunc(d.EQUAL);break;case pd:d.depthFunc(d.GEQUAL);break;case md:d.depthFunc(d.GREATER);break;case gd:d.depthFunc(d.NOTEQUAL);break;default:d.depthFunc(d.LEQUAL)}xt=Tt}},setLocked:function(Tt){Y=Tt},setClear:function(Tt){if(vt!==Tt){if(vt=Tt,ct)Tt=1-Tt;d.clearDepth(Tt)}},reset:function(){Y=!1,lt=null,xt=null,vt=null,ct=!1}}}function _(){let Y=!1,ct=null,lt=null,xt=null,vt=null,Tt=null,Vt=null,Ht=null,It=null;return{setTest:function(Wt){if(!Y)if(Wt)wt(d.STENCIL_TEST);else jt(d.STENCIL_TEST)},setMask:function(Wt){if(ct!==Wt&&!Y)d.stencilMask(Wt),ct=Wt},setFunc:function(Wt,re,Pt){if(lt!==Wt||xt!==re||vt!==Pt)d.stencilFunc(Wt,re,Pt),lt=Wt,xt=re,vt=Pt},setOp:function(Wt,re,Pt){if(Tt!==Wt||Vt!==re||Ht!==Pt)d.stencilOp(Wt,re,Pt),Tt=Wt,Vt=re,Ht=Pt},setLocked:function(Wt){Y=Wt},setClear:function(Wt){if(It!==Wt)d.clearStencil(Wt),It=Wt},reset:function(){Y=!1,ct=null,lt=null,xt=null,vt=null,Tt=null,Vt=null,Ht=null,It=null}}}let x=new m,v=new g,y=new _,S={},M=new WeakMap,E={},T={},b={},w=new WeakMap,C=[],N=null,A=!1,R=null,P=null,F=null,L=null,U=null,k=null,I=null,D=new se(0,0,0),z=0,W=!1,H=null,X=null,J=null,G=null,Q=null,it=d.getParameter(d.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,_t=0,rt=d.getParameter(d.VERSION);if(rt.indexOf("WebGL")!==-1)_t=parseFloat(/^WebGL (\d)/.exec(rt)[1]),j=_t>=1;else if(rt.indexOf("OpenGL ES")!==-1)_t=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),j=_t>=2;let ut=null,mt={},Nt=d.getParameter(d.SCISSOR_BOX),ot=d.getParameter(d.VIEWPORT),ft=new Be().fromArray(Nt),Ct=new Be().fromArray(ot);function zt(Y,ct,lt,xt){let vt=new Uint8Array(4),Tt=d.createTexture();d.bindTexture(Y,Tt),d.texParameteri(Y,d.TEXTURE_MIN_FILTER,d.NEAREST),d.texParameteri(Y,d.TEXTURE_MAG_FILTER,d.NEAREST);for(let Vt=0;Vt<lt;Vt++)if(Y===d.TEXTURE_3D||Y===d.TEXTURE_2D_ARRAY)d.texImage3D(ct,0,d.RGBA,1,1,xt,0,d.RGBA,d.UNSIGNED_BYTE,vt);else d.texImage2D(ct+Vt,0,d.RGBA,1,1,0,d.RGBA,d.UNSIGNED_BYTE,vt);return Tt}let Dt={};Dt[d.TEXTURE_2D]=zt(d.TEXTURE_2D,d.TEXTURE_2D,1),Dt[d.TEXTURE_CUBE_MAP]=zt(d.TEXTURE_CUBE_MAP,d.TEXTURE_CUBE_MAP_POSITIVE_X,6),Dt[d.TEXTURE_2D_ARRAY]=zt(d.TEXTURE_2D_ARRAY,d.TEXTURE_2D_ARRAY,1,1),Dt[d.TEXTURE_3D]=zt(d.TEXTURE_3D,d.TEXTURE_3D,1,1),x.setClear(0,0,0,1),v.setClear(1),y.setClear(0),wt(d.DEPTH_TEST),v.setFunc(wl),be(!1),gt(Ml),wt(d.CULL_FACE),pe(Zi);function wt(Y){if(E[Y]!==!0)d.enable(Y),E[Y]=!0}function jt(Y){if(E[Y]!==!1)d.disable(Y),E[Y]=!1}function Qt(Y,ct){if(b[Y]!==ct){if(d.bindFramebuffer(Y,ct),b[Y]=ct,Y===d.DRAW_FRAMEBUFFER)b[d.FRAMEBUFFER]=ct;if(Y===d.FRAMEBUFFER)b[d.DRAW_FRAMEBUFFER]=ct;return!0}return!1}function Ft(Y,ct){let lt=C,xt=!1;if(Y){if(lt=w.get(ct),lt===void 0)lt=[],w.set(ct,lt);let vt=Y.textures;if(lt.length!==vt.length||lt[0]!==d.COLOR_ATTACHMENT0){for(let Tt=0,Vt=vt.length;Tt<Vt;Tt++)lt[Tt]=d.COLOR_ATTACHMENT0+Tt;lt.length=vt.length,xt=!0}}else if(lt[0]!==d.BACK)lt[0]=d.BACK,xt=!0;if(xt)d.drawBuffers(lt)}function Zt(Y){if(N!==Y)return d.useProgram(Y),N=Y,!0;return!1}let qt={[Ps]:d.FUNC_ADD,[Xu]:d.FUNC_SUBTRACT,[qu]:d.FUNC_REVERSE_SUBTRACT};qt[Yu]=d.MIN,qt[Zu]=d.MAX;let fe={[$u]:d.ZERO,[Ju]:d.ONE,[Ku]:d.SRC_COLOR,[Qu]:d.SRC_ALPHA,[rd]:d.SRC_ALPHA_SATURATE,[id]:d.DST_COLOR,[ed]:d.DST_ALPHA,[ju]:d.ONE_MINUS_SRC_COLOR,[td]:d.ONE_MINUS_SRC_ALPHA,[sd]:d.ONE_MINUS_DST_COLOR,[nd]:d.ONE_MINUS_DST_ALPHA,[od]:d.CONSTANT_COLOR,[ad]:d.ONE_MINUS_CONSTANT_COLOR,[ld]:d.CONSTANT_ALPHA,[cd]:d.ONE_MINUS_CONSTANT_ALPHA};function pe(Y,ct,lt,xt,vt,Tt,Vt,Ht,It,Wt){if(Y===Zi){if(A===!0)jt(d.BLEND),A=!1;return}if(A===!1)wt(d.BLEND),A=!0;if(Y!==Wu){if(Y!==R||Wt!==W){if(P!==Ps||U!==Ps)d.blendEquation(d.FUNC_ADD),P=Ps,U=Ps;if(Wt)switch(Y){case mr:d.blendFuncSeparate(d.ONE,d.ONE_MINUS_SRC_ALPHA,d.ONE,d.ONE_MINUS_SRC_ALPHA);break;case bl:d.blendFunc(d.ONE,d.ONE);break;case El:d.blendFuncSeparate(d.ZERO,d.ONE_MINUS_SRC_COLOR,d.ZERO,d.ONE);break;case Tl:d.blendFuncSeparate(d.DST_COLOR,d.ONE_MINUS_SRC_ALPHA,d.ZERO,d.ONE);break;default:$t("WebGLState: Invalid blending: ",Y);break}else switch(Y){case mr:d.blendFuncSeparate(d.SRC_ALPHA,d.ONE_MINUS_SRC_ALPHA,d.ONE,d.ONE_MINUS_SRC_ALPHA);break;case bl:d.blendFuncSeparate(d.SRC_ALPHA,d.ONE,d.ONE,d.ONE);break;case El:$t("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Tl:$t("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$t("WebGLState: Invalid blending: ",Y);break}F=null,L=null,k=null,I=null,D.set(0,0,0),z=0,R=Y,W=Wt}return}if(vt=vt||ct,Tt=Tt||lt,Vt=Vt||xt,ct!==P||vt!==U)d.blendEquationSeparate(qt[ct],qt[vt]),P=ct,U=vt;if(lt!==F||xt!==L||Tt!==k||Vt!==I)d.blendFuncSeparate(fe[lt],fe[xt],fe[Tt],fe[Vt]),F=lt,L=xt,k=Tt,I=Vt;if(Ht.equals(D)===!1||It!==z)d.blendColor(Ht.r,Ht.g,Ht.b,It),D.copy(Ht),z=It;R=Y,W=!1}function ge(Y,ct){Y.side===Ln?jt(d.CULL_FACE):wt(d.CULL_FACE);let lt=Y.side===dn;if(ct)lt=!lt;be(lt),Y.blending===mr&&Y.transparent===!1?pe(Zi):pe(Y.blending,Y.blendEquation,Y.blendSrc,Y.blendDst,Y.blendEquationAlpha,Y.blendSrcAlpha,Y.blendDstAlpha,Y.blendColor,Y.blendAlpha,Y.premultipliedAlpha),v.setFunc(Y.depthFunc),v.setTest(Y.depthTest),v.setMask(Y.depthWrite),x.setMask(Y.colorWrite);let xt=Y.stencilWrite;if(y.setTest(xt),xt)y.setMask(Y.stencilWriteMask),y.setFunc(Y.stencilFunc,Y.stencilRef,Y.stencilFuncMask),y.setOp(Y.stencilFail,Y.stencilZFail,Y.stencilZPass);ae(Y.polygonOffset,Y.polygonOffsetFactor,Y.polygonOffsetUnits),Y.alphaToCoverage===!0?wt(d.SAMPLE_ALPHA_TO_COVERAGE):jt(d.SAMPLE_ALPHA_TO_COVERAGE)}function be(Y){if(H!==Y){if(Y)d.frontFace(d.CW);else d.frontFace(d.CCW);H=Y}}function gt(Y){if(Y!==Hu){if(wt(d.CULL_FACE),Y!==X)if(Y===Ml)d.cullFace(d.BACK);else if(Y===Gu)d.cullFace(d.FRONT);else d.cullFace(d.FRONT_AND_BACK)}else jt(d.CULL_FACE);X=Y}function Gt(Y){if(Y!==J){if(j)d.lineWidth(Y);J=Y}}function ae(Y,ct,lt){if(Y){if(wt(d.POLYGON_OFFSET_FILL),G!==ct||Q!==lt){if(G=ct,Q=lt,v.getReversed())ct=-ct,lt=-lt;d.polygonOffset(ct,lt)}}else jt(d.POLYGON_OFFSET_FILL)}function Re(Y){if(Y)wt(d.SCISSOR_TEST);else jt(d.SCISSOR_TEST)}function gn(Y){if(Y===void 0)Y=d.TEXTURE0+it-1;if(ut!==Y)d.activeTexture(Y),ut=Y}function K(Y,ct,lt){if(lt===void 0)if(ut===null)lt=d.TEXTURE0+it-1;else lt=ut;let xt=mt[lt];if(xt===void 0)xt={type:void 0,texture:void 0},mt[lt]=xt;if(xt.type!==Y||xt.texture!==ct){if(ut!==lt)d.activeTexture(lt),ut=lt;d.bindTexture(Y,ct||Dt[Y]),xt.type=Y,xt.texture=ct}}function _n(){let Y=mt[ut];if(Y!==void 0&&Y.type!==void 0)d.bindTexture(Y.type,null),Y.type=void 0,Y.texture=void 0}function Se(){try{d.compressedTexImage2D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function Ze(){try{d.compressedTexImage3D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function At(){try{d.texSubImage2D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function Ne(){try{d.texSubImage3D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function Yt(){try{d.compressedTexSubImage2D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function te(){try{d.compressedTexSubImage3D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function rn(){try{d.texStorage2D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function V(){try{d.texStorage3D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function O(){try{d.texImage2D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function tt(){try{d.texImage3D(...arguments)}catch(Y){$t("WebGLState:",Y)}}function pt(Y){if(T[Y]!==void 0)return T[Y];else return d.getParameter(Y)}function dt(Y,ct){if(T[Y]!==ct)d.pixelStorei(Y,ct),T[Y]=ct}function yt(Y){if(ft.equals(Y)===!1)d.scissor(Y.x,Y.y,Y.z,Y.w),ft.copy(Y)}function bt(Y){if(Ct.equals(Y)===!1)d.viewport(Y.x,Y.y,Y.z,Y.w),Ct.copy(Y)}function at(Y,ct){let lt=M.get(ct);if(lt===void 0)lt=new WeakMap,M.set(ct,lt);let xt=lt.get(Y);if(xt===void 0)xt=d.getUniformBlockIndex(ct,Y.name),d.uniformBlockBinding(ct,xt,xt),lt.set(Y,xt)}function ht(Y,ct,lt){let vt=M.get(ct).get(Y);if(S[vt]!==lt)d.bindBufferBase(d.UNIFORM_BUFFER,vt,lt),S[vt]=lt}function St(){d.disable(d.BLEND),d.disable(d.CULL_FACE),d.disable(d.DEPTH_TEST),d.disable(d.POLYGON_OFFSET_FILL),d.disable(d.SCISSOR_TEST),d.disable(d.STENCIL_TEST),d.disable(d.SAMPLE_ALPHA_TO_COVERAGE),d.blendEquation(d.FUNC_ADD),d.blendFunc(d.ONE,d.ZERO),d.blendFuncSeparate(d.ONE,d.ZERO,d.ONE,d.ZERO),d.blendColor(0,0,0,0),d.colorMask(!0,!0,!0,!0),d.clearColor(0,0,0,0),d.depthMask(!0),d.depthFunc(d.LESS),v.setReversed(!1),d.clearDepth(1),d.stencilMask(4294967295),d.stencilFunc(d.ALWAYS,0,4294967295),d.stencilOp(d.KEEP,d.KEEP,d.KEEP),d.clearStencil(0),d.cullFace(d.BACK),d.frontFace(d.CCW),d.polygonOffset(0,0),d.activeTexture(d.TEXTURE0),d.bindFramebuffer(d.FRAMEBUFFER,null),d.bindFramebuffer(d.DRAW_FRAMEBUFFER,null),d.bindFramebuffer(d.READ_FRAMEBUFFER,null),d.useProgram(null),d.lineWidth(1),d.scissor(0,0,d.canvas.width,d.canvas.height),d.viewport(0,0,d.canvas.width,d.canvas.height),d.pixelStorei(d.PACK_ALIGNMENT,4),d.pixelStorei(d.UNPACK_ALIGNMENT,4),d.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,!1),d.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),d.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,d.BROWSER_DEFAULT_WEBGL),d.pixelStorei(d.PACK_ROW_LENGTH,0),d.pixelStorei(d.PACK_SKIP_PIXELS,0),d.pixelStorei(d.PACK_SKIP_ROWS,0),d.pixelStorei(d.UNPACK_ROW_LENGTH,0),d.pixelStorei(d.UNPACK_IMAGE_HEIGHT,0),d.pixelStorei(d.UNPACK_SKIP_PIXELS,0),d.pixelStorei(d.UNPACK_SKIP_ROWS,0),d.pixelStorei(d.UNPACK_SKIP_IMAGES,0),E={},T={},ut=null,mt={},b={},S={},w=new WeakMap,C=[],N=null,A=!1,R=null,P=null,F=null,L=null,U=null,k=null,I=null,D=new se(0,0,0),z=0,W=!1,H=null,X=null,J=null,G=null,Q=null,ft.set(0,0,d.canvas.width,d.canvas.height),Ct.set(0,0,d.canvas.width,d.canvas.height),x.reset(),v.reset(),y.reset()}return{buffers:{color:x,depth:v,stencil:y},enable:wt,disable:jt,bindFramebuffer:Qt,drawBuffers:Ft,useProgram:Zt,setBlending:pe,setMaterial:ge,setFlipSided:be,setCullFace:gt,setLineWidth:Gt,setPolygonOffset:ae,setScissorTest:Re,activeTexture:gn,bindTexture:K,unbindTexture:_n,compressedTexImage2D:Se,compressedTexImage3D:Ze,texImage2D:O,texImage3D:tt,pixelStorei:dt,getParameter:pt,updateUBOMapping:at,uniformBlockBinding:ht,texStorage2D:rn,texStorage3D:V,texSubImage2D:At,texSubImage3D:Ne,compressedTexSubImage2D:Yt,compressedTexSubImage3D:te,scissor:yt,viewport:bt,reset:St}}function Wv(d,p,m,g,_,x,v){let y=p.has("WEBGL_multisampled_render_to_texture")?p.get("WEBGL_multisampled_render_to_texture"):null,S=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),M=new Jt,E=new WeakMap,T=new Set,b,w=new WeakMap,C=new Set,N=new FinalizationRegistry((V)=>C.delete(V)),A=!1;try{A=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(V){}function R(V,O){return A?new OffscreenCanvas(V,O):dr("canvas")}function P(V,O,tt){let pt=1,dt=rn(V);if(dt.width>tt||dt.height>tt)pt=tt/Math.max(dt.width,dt.height);if(pt<1)if(typeof HTMLImageElement<"u"&&V instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&V instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&V instanceof ImageBitmap||typeof VideoFrame<"u"&&V instanceof VideoFrame){let yt=Math.floor(pt*dt.width),bt=Math.floor(pt*dt.height);if(b===void 0)b=R(yt,bt);let at=O?R(yt,bt):b;return at.width=yt,at.height=bt,at.getContext("2d").drawImage(V,0,0,yt,bt),Xt("WebGLRenderer: Texture has been resized from ("+dt.width+"x"+dt.height+") to ("+yt+"x"+bt+")."),at}else{if("data"in V)Xt("WebGLRenderer: Image in DataTexture is too big ("+dt.width+"x"+dt.height+").");return V}return V}function F(V){return V.generateMipmaps}function L(V){d.generateMipmap(V)}function U(V){if(V.isWebGLCubeRenderTarget)return d.TEXTURE_CUBE_MAP;if(V.isWebGL3DRenderTarget)return d.TEXTURE_3D;if(V.isWebGLArrayRenderTarget||V.isCompressedArrayTexture)return d.TEXTURE_2D_ARRAY;return d.TEXTURE_2D}function k(V,O,tt,pt,dt,yt=!1){if(V!==null){if(d[V]!==void 0)return d[V];Xt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+V+"'")}let bt;if(pt){if(bt=p.get("EXT_texture_norm16"),!bt)Xt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension")}let at=O;if(O===d.RED){if(tt===d.FLOAT)at=d.R32F;if(tt===d.HALF_FLOAT)at=d.R16F;if(tt===d.UNSIGNED_BYTE)at=d.R8;if(tt===d.UNSIGNED_SHORT&&bt)at=bt.R16_EXT;if(tt===d.SHORT&&bt)at=bt.R16_SNORM_EXT}if(O===d.RED_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.R8UI;if(tt===d.UNSIGNED_SHORT)at=d.R16UI;if(tt===d.UNSIGNED_INT)at=d.R32UI;if(tt===d.BYTE)at=d.R8I;if(tt===d.SHORT)at=d.R16I;if(tt===d.INT)at=d.R32I}if(O===d.RG){if(tt===d.FLOAT)at=d.RG32F;if(tt===d.HALF_FLOAT)at=d.RG16F;if(tt===d.UNSIGNED_BYTE)at=d.RG8;if(tt===d.UNSIGNED_SHORT&&bt)at=bt.RG16_EXT;if(tt===d.SHORT&&bt)at=bt.RG16_SNORM_EXT}if(O===d.RG_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RG8UI;if(tt===d.UNSIGNED_SHORT)at=d.RG16UI;if(tt===d.UNSIGNED_INT)at=d.RG32UI;if(tt===d.BYTE)at=d.RG8I;if(tt===d.SHORT)at=d.RG16I;if(tt===d.INT)at=d.RG32I}if(O===d.RGB_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RGB8UI;if(tt===d.UNSIGNED_SHORT)at=d.RGB16UI;if(tt===d.UNSIGNED_INT)at=d.RGB32UI;if(tt===d.BYTE)at=d.RGB8I;if(tt===d.SHORT)at=d.RGB16I;if(tt===d.INT)at=d.RGB32I}if(O===d.RGBA_INTEGER){if(tt===d.UNSIGNED_BYTE)at=d.RGBA8UI;if(tt===d.UNSIGNED_SHORT)at=d.RGBA16UI;if(tt===d.UNSIGNED_INT)at=d.RGBA32UI;if(tt===d.BYTE)at=d.RGBA8I;if(tt===d.SHORT)at=d.RGBA16I;if(tt===d.INT)at=d.RGBA32I}if(O===d.RGB){if(tt===d.UNSIGNED_SHORT&&bt)at=bt.RGB16_EXT;if(tt===d.SHORT&&bt)at=bt.RGB16_SNORM_EXT;if(tt===d.UNSIGNED_INT_5_9_9_9_REV)at=d.RGB9_E5;if(tt===d.UNSIGNED_INT_10F_11F_11F_REV)at=d.R11F_G11F_B10F}if(O===d.RGBA){let ht=yt?mc:le.getTransfer(dt);if(tt===d.FLOAT)at=d.RGBA32F;if(tt===d.HALF_FLOAT)at=d.RGBA16F;if(tt===d.UNSIGNED_BYTE)at=ht===Ie?d.SRGB8_ALPHA8:d.RGBA8;if(tt===d.UNSIGNED_SHORT&&bt)at=bt.RGBA16_EXT;if(tt===d.SHORT&&bt)at=bt.RGBA16_SNORM_EXT;if(tt===d.UNSIGNED_SHORT_4_4_4_4)at=d.RGBA4;if(tt===d.UNSIGNED_SHORT_5_5_5_1)at=d.RGB5_A1}if(at===d.R16F||at===d.R32F||at===d.RG16F||at===d.RG32F||at===d.RGBA16F||at===d.RGBA32F)p.get("EXT_color_buffer_float");return at}function I(V,O){let tt;if(V){if(O===null||O===wi||O===$i)tt=d.DEPTH24_STENCIL8;else if(O===hi)tt=d.DEPTH32F_STENCIL8;else if(O===xr)tt=d.DEPTH24_STENCIL8,Xt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")}else if(O===null||O===wi||O===$i)tt=d.DEPTH_COMPONENT24;else if(O===hi)tt=d.DEPTH_COMPONENT32F;else if(O===xr)tt=d.DEPTH_COMPONENT16;return tt}function D(V,O){if(F(V)===!0||V.isFramebufferTexture&&V.minFilter!==Ti&&V.minFilter!==Tn)return Math.log2(Math.max(O.width,O.height))+1;else if(V.mipmaps.length>0)return V.mipmaps.length;else if(V.isCompressedTexture&&Array.isArray(V.image))return O.mipmaps.length;else return 1}function z(V){let O=new WeakRef(V);g.get(V).__ref=O,C.add(O),N.register(V,O,O)}function W(V){let O=g.get(V).__ref;if(O===void 0)return;C.delete(O),N.unregister(O)}function H(V){J(V.target)}function X(V){G(V.target)}function J(V){if(V.removeEventListener("dispose",H),W(V),it(V),V.isVideoTexture)E.delete(V);if(V.isHTMLTexture)T.delete(V)}function G(V){V.removeEventListener("dispose",X),W(V),_t(V)}function Q(){for(let V of C){let O=V.deref();if(O===void 0)continue;if(O.isRenderTarget===!0)G(O);else J(O)}C.clear(),T.clear()}function it(V){let O=g.get(V);if(O.__webglInit===void 0)return;let tt=V.source,pt=w.get(tt);if(pt){let dt=pt[O.__cacheKey];if(dt.usedTimes--,dt.usedTimes===0)j(V);if(Object.keys(pt).length===0)w.delete(tt)}g.remove(V)}function j(V){let O=g.get(V);d.deleteTexture(O.__webglTexture);let tt=V.source,pt=w.get(tt);delete pt[O.__cacheKey],v.memory.textures--}function _t(V){let O=g.get(V);if(O.__depthDisposeCallback)O.__depthDisposeCallback();let tt=V.depthTexture;if(tt&&tt.renderTarget===V)J(tt);if(V.isWebGLCubeRenderTarget)for(let dt=0;dt<6;dt++){if(Array.isArray(O.__webglFramebuffer[dt]))for(let yt=0;yt<O.__webglFramebuffer[dt].length;yt++)d.deleteFramebuffer(O.__webglFramebuffer[dt][yt]);else d.deleteFramebuffer(O.__webglFramebuffer[dt]);if(O.__webglDepthbuffer)d.deleteRenderbuffer(O.__webglDepthbuffer[dt])}else{if(Array.isArray(O.__webglFramebuffer))for(let dt=0;dt<O.__webglFramebuffer.length;dt++)d.deleteFramebuffer(O.__webglFramebuffer[dt]);else d.deleteFramebuffer(O.__webglFramebuffer);if(O.__webglDepthbuffer)d.deleteRenderbuffer(O.__webglDepthbuffer);if(O.__webglMultisampledFramebuffer)d.deleteFramebuffer(O.__webglMultisampledFramebuffer);if(O.__webglColorRenderbuffer){for(let dt=0;dt<O.__webglColorRenderbuffer.length;dt++)if(O.__webglColorRenderbuffer[dt])d.deleteRenderbuffer(O.__webglColorRenderbuffer[dt])}if(O.__webglDepthRenderbuffer)d.deleteRenderbuffer(O.__webglDepthRenderbuffer)}let pt=V.textures;for(let dt=0,yt=pt.length;dt<yt;dt++){let bt=g.get(pt[dt]);if(bt.__webglTexture)d.deleteTexture(bt.__webglTexture),v.memory.textures--;g.remove(pt[dt])}g.remove(V)}let rt=0;function ut(){rt=0}function mt(){return rt}function Nt(V){rt=V}function ot(){let V=rt;if(V>=_.maxTextures)Xt("WebGLTextures: Trying to use "+(V+1)+" texture units while this GPU supports only "+_.maxTextures);return rt+=1,V}function ft(V){let O=[];return O.push(V.wrapS),O.push(V.wrapT),O.push(V.wrapR||0),O.push(V.magFilter),O.push(V.minFilter),O.push(V.anisotropy),O.push(V.internalFormat),O.push(V.format),O.push(V.type),O.push(V.generateMipmaps),O.push(V.mipmapsAutoUpdate),O.push(V.premultiplyAlpha),O.push(V.flipY),O.push(V.unpackAlignment),O.push(V.colorSpace),O.join()}function Ct(V,O){let tt=g.get(V);if(V.isVideoTexture)Yt(V);if(V.isRenderTargetTexture===!1&&V.isExternalTexture!==!0&&V.version>0&&tt.__version!==V.version){let pt=V.image;if(pt===null)Xt("WebGLRenderer: Texture marked for update but no image data found.");else if(pt.complete===!1)Xt("WebGLRenderer: Texture marked for update but image is incomplete");else{ge(tt,V,O);return}}else if(V.isExternalTexture)tt.__webglTexture=V.sourceTexture?V.sourceTexture:null;m.bindTexture(d.TEXTURE_2D,tt.__webglTexture,d.TEXTURE0+O)}function zt(V,O){let tt=g.get(V);if(V.isRenderTargetTexture===!1&&V.version>0&&tt.__version!==V.version){ge(tt,V,O);return}else if(V.isExternalTexture)tt.__webglTexture=V.sourceTexture?V.sourceTexture:null;m.bindTexture(d.TEXTURE_2D_ARRAY,tt.__webglTexture,d.TEXTURE0+O)}function Dt(V,O){let tt=g.get(V);if(V.isRenderTargetTexture===!1&&V.version>0&&tt.__version!==V.version){ge(tt,V,O);return}m.bindTexture(d.TEXTURE_3D,tt.__webglTexture,d.TEXTURE0+O)}function wt(V,O){let tt=g.get(V);if(V.version>0&&tt.__version!==V.version){be(tt,V,O);return}m.bindTexture(d.TEXTURE_CUBE_MAP,tt.__webglTexture,d.TEXTURE0+O)}let jt={[Po]:d.REPEAT,[Lo]:d.CLAMP_TO_EDGE,[yd]:d.MIRRORED_REPEAT},Qt={[Ti]:d.NEAREST,[Sd]:d.NEAREST_MIPMAP_NEAREST,[_r]:d.NEAREST_MIPMAP_LINEAR,[Tn]:d.LINEAR,[No]:d.LINEAR_MIPMAP_NEAREST,[Hn]:d.LINEAR_MIPMAP_LINEAR},Ft={[Id]:d.NEVER,[xc]:d.ALWAYS,[Pd]:d.LESS,[gc]:d.LEQUAL,[Ld]:d.EQUAL,[_c]:d.GEQUAL,[Nd]:d.GREATER,[Dd]:d.NOTEQUAL};function Zt(V,O){if(O.type===hi&&p.has("OES_texture_float_linear")===!1&&(O.magFilter===Tn||O.magFilter===No||O.magFilter===_r||O.magFilter===Hn||O.minFilter===Tn||O.minFilter===No||O.minFilter===_r||O.minFilter===Hn))Xt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.");if(d.texParameteri(V,d.TEXTURE_WRAP_S,jt[O.wrapS]),d.texParameteri(V,d.TEXTURE_WRAP_T,jt[O.wrapT]),V===d.TEXTURE_3D||V===d.TEXTURE_2D_ARRAY)d.texParameteri(V,d.TEXTURE_WRAP_R,jt[O.wrapR]);if(d.texParameteri(V,d.TEXTURE_MAG_FILTER,Qt[O.magFilter]),d.texParameteri(V,d.TEXTURE_MIN_FILTER,Qt[O.minFilter]),O.compareFunction)d.texParameteri(V,d.TEXTURE_COMPARE_MODE,d.COMPARE_REF_TO_TEXTURE),d.texParameteri(V,d.TEXTURE_COMPARE_FUNC,Ft[O.compareFunction]);if(p.has("EXT_texture_filter_anisotropic")===!0){if(O.magFilter===Ti)return;if(O.minFilter!==_r&&O.minFilter!==Hn)return;if(O.type===hi&&p.has("OES_texture_float_linear")===!1)return;if(O.anisotropy>1||g.get(O).__currentAnisotropy){let tt=p.get("EXT_texture_filter_anisotropic");d.texParameterf(V,tt.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(O.anisotropy,_.getMaxAnisotropy())),g.get(O).__currentAnisotropy=O.anisotropy}}}function qt(V,O){let tt=!1;if(V.__webglInit===void 0)V.__webglInit=!0,O.addEventListener("dispose",H),z(O);let pt=O.source,dt=w.get(pt);if(dt===void 0)dt={},w.set(pt,dt);let yt=ft(O);if(yt!==V.__cacheKey){if(dt[yt]===void 0)dt[yt]={texture:d.createTexture(),usedTimes:0},v.memory.textures++,tt=!0;dt[yt].usedTimes++;let bt=dt[V.__cacheKey];if(bt!==void 0){if(dt[V.__cacheKey].usedTimes--,bt.usedTimes===0)j(O)}V.__cacheKey=yt,V.__webglTexture=dt[yt].texture}return tt}function fe(V,O,tt){return Math.floor(Math.floor(V/tt)/O)}function pe(V,O,tt,pt){let yt=V.updateRanges;if(yt.length===0)m.texSubImage2D(d.TEXTURE_2D,0,0,0,O.width,O.height,tt,pt,O.data);else{yt.sort((Y,ct)=>Y.start-ct.start);let bt=0;for(let Y=1;Y<yt.length;Y++){let ct=yt[bt],lt=yt[Y],xt=ct.start+ct.count,vt=fe(lt.start,O.width,4),Tt=fe(ct.start,O.width,4);if(lt.start<=xt+1&&vt===Tt&&fe(lt.start+lt.count-1,O.width,4)===vt)ct.count=Math.max(ct.count,lt.start+lt.count-ct.start);else++bt,yt[bt]=lt}yt.length=bt+1;let at=m.getParameter(d.UNPACK_ROW_LENGTH),ht=m.getParameter(d.UNPACK_SKIP_PIXELS),St=m.getParameter(d.UNPACK_SKIP_ROWS);m.pixelStorei(d.UNPACK_ROW_LENGTH,O.width);for(let Y=0,ct=yt.length;Y<ct;Y++){let lt=yt[Y],xt=Math.floor(lt.start/4),vt=Math.ceil(lt.count/4),Tt=xt%O.width,Vt=Math.floor(xt/O.width),Ht=vt,It=1;m.pixelStorei(d.UNPACK_SKIP_PIXELS,Tt),m.pixelStorei(d.UNPACK_SKIP_ROWS,Vt),m.texSubImage2D(d.TEXTURE_2D,0,Tt,Vt,Ht,1,tt,pt,O.data)}V.clearUpdateRanges(),m.pixelStorei(d.UNPACK_ROW_LENGTH,at),m.pixelStorei(d.UNPACK_SKIP_PIXELS,ht),m.pixelStorei(d.UNPACK_SKIP_ROWS,St)}}function ge(V,O,tt){let pt=d.TEXTURE_2D;if(O.isDataArrayTexture||O.isCompressedArrayTexture)pt=d.TEXTURE_2D_ARRAY;if(O.isData3DTexture)pt=d.TEXTURE_3D;let dt=qt(V,O),yt=O.source;m.bindTexture(pt,V.__webglTexture,d.TEXTURE0+tt);let bt=g.get(yt);if(yt.version!==bt.__version||dt===!0){if(m.activeTexture(d.TEXTURE0+tt),(typeof ImageBitmap<"u"&&O.image instanceof ImageBitmap)===!1){let It=le.getPrimaries(le.workingColorSpace),Wt=O.colorSpace===Ki?null:le.getPrimaries(O.colorSpace),re=O.colorSpace===Ki||It===Wt?d.NONE:d.BROWSER_DEFAULT_WEBGL;m.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,O.flipY),m.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),m.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,re)}m.pixelStorei(d.UNPACK_ALIGNMENT,O.unpackAlignment);let ht=P(O.image,!1,_.maxTextureSize);ht=te(O,ht);let St=x.convert(O.format,O.colorSpace),Y=x.convert(O.type),ct=k(O.internalFormat,St,Y,O.normalized,O.colorSpace,O.isVideoTexture);Zt(pt,O);let lt,xt=O.mipmaps,vt=O.isVideoTexture!==!0,Tt=bt.__version===void 0||dt===!0,Vt=yt.dataReady,Ht=D(O,ht);if(O.isDepthTexture){if(ct=I(O.format===Ai,O.type),Tt)if(vt)m.texStorage2D(d.TEXTURE_2D,1,ct,ht.width,ht.height);else m.texImage2D(d.TEXTURE_2D,0,ct,ht.width,ht.height,0,St,Y,null)}else if(O.isDataTexture)if(xt.length>0){if(vt&&Tt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,xt[0].width,xt[0].height);for(let It=0,Wt=xt.length;It<Wt;It++)if(lt=xt[It],vt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,It,0,0,lt.width,lt.height,St,Y,lt.data)}else m.texImage2D(d.TEXTURE_2D,It,ct,lt.width,lt.height,0,St,Y,lt.data);O.generateMipmaps=!1}else if(vt){if(Tt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,ht.width,ht.height);if(Vt)pe(O,ht,St,Y)}else m.texImage2D(d.TEXTURE_2D,0,ct,ht.width,ht.height,0,St,Y,ht.data);else if(O.isCompressedTexture)if(O.isCompressedArrayTexture){if(vt&&Tt)m.texStorage3D(d.TEXTURE_2D_ARRAY,Ht,ct,xt[0].width,xt[0].height,ht.depth);for(let It=0,Wt=xt.length;It<Wt;It++)if(lt=xt[It],O.format!==Nn)if(St!==null)if(vt){if(Vt)if(O.layerUpdates.size>0){let re=Zc(lt.width,lt.height,O.format,O.type);for(let Pt of O.layerUpdates){let Te=lt.data.subarray(Pt*re/lt.data.BYTES_PER_ELEMENT,(Pt+1)*re/lt.data.BYTES_PER_ELEMENT);m.compressedTexSubImage3D(d.TEXTURE_2D_ARRAY,It,0,0,Pt,lt.width,lt.height,1,St,Te)}}else m.compressedTexSubImage3D(d.TEXTURE_2D_ARRAY,It,0,0,0,lt.width,lt.height,ht.depth,St,lt.data)}else m.compressedTexImage3D(d.TEXTURE_2D_ARRAY,It,ct,lt.width,lt.height,ht.depth,0,lt.data,0,0);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vt){if(Vt)m.texSubImage3D(d.TEXTURE_2D_ARRAY,It,0,0,0,lt.width,lt.height,ht.depth,St,Y,lt.data)}else m.texImage3D(d.TEXTURE_2D_ARRAY,It,ct,lt.width,lt.height,ht.depth,0,St,Y,lt.data);if(O.layerUpdates.size>0)O.clearLayerUpdates()}else{if(vt&&Tt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,xt[0].width,xt[0].height);for(let It=0,Wt=xt.length;It<Wt;It++)if(lt=xt[It],O.format!==Nn)if(St!==null)if(vt){if(Vt)m.compressedTexSubImage2D(d.TEXTURE_2D,It,0,0,lt.width,lt.height,St,lt.data)}else m.compressedTexImage2D(d.TEXTURE_2D,It,ct,lt.width,lt.height,0,lt.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else if(vt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,It,0,0,lt.width,lt.height,St,Y,lt.data)}else m.texImage2D(d.TEXTURE_2D,It,ct,lt.width,lt.height,0,St,Y,lt.data)}else if(O.isDataArrayTexture)if(vt){if(Tt)m.texStorage3D(d.TEXTURE_2D_ARRAY,Ht,ct,ht.width,ht.height,ht.depth);if(Vt)if(O.layerUpdates.size>0){let It=Zc(ht.width,ht.height,O.format,O.type);for(let Wt of O.layerUpdates){let re=ht.data.subarray(Wt*It/ht.data.BYTES_PER_ELEMENT,(Wt+1)*It/ht.data.BYTES_PER_ELEMENT);m.texSubImage3D(d.TEXTURE_2D_ARRAY,0,0,0,Wt,ht.width,ht.height,1,St,Y,re)}O.clearLayerUpdates()}else m.texSubImage3D(d.TEXTURE_2D_ARRAY,0,0,0,0,ht.width,ht.height,ht.depth,St,Y,ht.data)}else m.texImage3D(d.TEXTURE_2D_ARRAY,0,ct,ht.width,ht.height,ht.depth,0,St,Y,ht.data);else if(O.isData3DTexture)if(vt){if(Tt)m.texStorage3D(d.TEXTURE_3D,Ht,ct,ht.width,ht.height,ht.depth);if(Vt)m.texSubImage3D(d.TEXTURE_3D,0,0,0,0,ht.width,ht.height,ht.depth,St,Y,ht.data)}else m.texImage3D(d.TEXTURE_3D,0,ct,ht.width,ht.height,ht.depth,0,St,Y,ht.data);else if(O.isFramebufferTexture){if(Tt)if(vt)m.texStorage2D(d.TEXTURE_2D,Ht,ct,ht.width,ht.height);else{let It=ht.width,Wt=ht.height;for(let re=0;re<Ht;re++)m.texImage2D(d.TEXTURE_2D,re,ct,It,Wt,0,St,Y,null),It>>=1,Wt>>=1}}else if(O.isHTMLTexture){if("texElementImage2D"in d){let It=d.canvas;if(!It.hasAttribute("layoutsubtree"))It.setAttribute("layoutsubtree","true");if(ht.parentNode!==It){It.appendChild(ht),T.add(O),It.onpaint=(Wt)=>{let re=Wt.changedElements;for(let Pt of T)if(re.includes(Pt.image))Pt.needsUpdate=!0},It.requestPaint();return}if(d.texElementImage2D.length===3)d.texElementImage2D(d.TEXTURE_2D,d.RGBA8,ht);else{let{RGBA:re,RGBA:Pt,UNSIGNED_BYTE:Te}=d;d.texElementImage2D(d.TEXTURE_2D,0,re,Pt,Te,ht)}d.texParameteri(d.TEXTURE_2D,d.TEXTURE_MIN_FILTER,d.LINEAR),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_S,d.CLAMP_TO_EDGE),d.texParameteri(d.TEXTURE_2D,d.TEXTURE_WRAP_T,d.CLAMP_TO_EDGE)}}else if(xt.length>0){if(vt&&Tt){let It=rn(xt[0]);m.texStorage2D(d.TEXTURE_2D,Ht,ct,It.width,It.height)}for(let It=0,Wt=xt.length;It<Wt;It++)if(lt=xt[It],vt){if(Vt)m.texSubImage2D(d.TEXTURE_2D,It,0,0,St,Y,lt)}else m.texImage2D(d.TEXTURE_2D,It,ct,St,Y,lt);O.generateMipmaps=!1}else if(vt){if(Tt){let It=rn(ht);m.texStorage2D(d.TEXTURE_2D,Ht,ct,It.width,It.height)}if(Vt)m.texSubImage2D(d.TEXTURE_2D,0,0,0,St,Y,ht)}else m.texImage2D(d.TEXTURE_2D,0,ct,St,Y,ht);if(F(O)&&O.mipmapsAutoUpdate===!0)L(pt);if(bt.__version=yt.version,O.onUpdate)O.onUpdate(O)}V.__version=O.version}function be(V,O,tt){if(O.image.length!==6)return;let pt=qt(V,O),dt=O.source;m.bindTexture(d.TEXTURE_CUBE_MAP,V.__webglTexture,d.TEXTURE0+tt);let yt=g.get(dt);if(dt.version!==yt.__version||pt===!0){m.activeTexture(d.TEXTURE0+tt);let bt=le.getPrimaries(le.workingColorSpace),at=O.colorSpace===Ki?null:le.getPrimaries(O.colorSpace),ht=O.colorSpace===Ki||bt===at?d.NONE:d.BROWSER_DEFAULT_WEBGL;m.pixelStorei(d.UNPACK_FLIP_Y_WEBGL,O.flipY),m.pixelStorei(d.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),m.pixelStorei(d.UNPACK_ALIGNMENT,O.unpackAlignment),m.pixelStorei(d.UNPACK_COLORSPACE_CONVERSION_WEBGL,ht);let St=O.isCompressedTexture||O.image[0].isCompressedTexture,Y=O.image[0]&&O.image[0].isDataTexture,ct=[];for(let Pt=0;Pt<6;Pt++){if(!St&&!Y)ct[Pt]=P(O.image[Pt],!0,_.maxCubemapSize);else ct[Pt]=Y?O.image[Pt].image:O.image[Pt];ct[Pt]=te(O,ct[Pt])}let lt=ct[0],xt=x.convert(O.format,O.colorSpace),vt=x.convert(O.type),Tt=k(O.internalFormat,xt,vt,O.normalized,O.colorSpace),Vt=O.isVideoTexture!==!0,Ht=yt.__version===void 0||pt===!0,It=dt.dataReady,Wt=D(O,lt);Zt(d.TEXTURE_CUBE_MAP,O);let re;if(O.isDepthTexture){if(Tt=I(O.format===Ai,O.type),Ht)if(Vt)m.texStorage2D(d.TEXTURE_CUBE_MAP,1,Tt,lt.width,lt.height);else for(let Pt=0;Pt<6;Pt++)m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,Tt,lt.width,lt.height,0,xt,vt,null)}else if(St){if(Vt&&Ht)m.texStorage2D(d.TEXTURE_CUBE_MAP,Wt,Tt,lt.width,lt.height);for(let Pt=0;Pt<6;Pt++){re=ct[Pt].mipmaps;for(let Te=0;Te<re.length;Te++){let $e=re[Te];if(O.format!==Nn)if(xt!==null)if(Vt){if(It)m.compressedTexSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te,0,0,$e.width,$e.height,xt,$e.data)}else m.compressedTexImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te,Tt,$e.width,$e.height,0,$e.data);else Xt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()");else if(Vt){if(It)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te,0,0,$e.width,$e.height,xt,vt,$e.data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te,Tt,$e.width,$e.height,0,xt,vt,$e.data)}}}else{if(re=O.mipmaps,Vt&&Ht){if(re.length>0)Wt++;let Pt=rn(ct[0]);m.texStorage2D(d.TEXTURE_CUBE_MAP,Wt,Tt,Pt.width,Pt.height)}for(let Pt=0;Pt<6;Pt++)if(Y){if(Vt){if(It)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,ct[Pt].width,ct[Pt].height,xt,vt,ct[Pt].data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,Tt,ct[Pt].width,ct[Pt].height,0,xt,vt,ct[Pt].data);for(let Te=0;Te<re.length;Te++){let Qn=re[Te].image[Pt].image;if(Vt){if(It)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te+1,0,0,Qn.width,Qn.height,xt,vt,Qn.data)}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te+1,Tt,Qn.width,Qn.height,0,xt,vt,Qn.data)}}else{if(Vt){if(It)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,0,0,xt,vt,ct[Pt])}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,0,Tt,xt,vt,ct[Pt]);for(let Te=0;Te<re.length;Te++){let $e=re[Te];if(Vt){if(It)m.texSubImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te+1,0,0,xt,vt,$e.image[Pt])}else m.texImage2D(d.TEXTURE_CUBE_MAP_POSITIVE_X+Pt,Te+1,Tt,xt,vt,$e.image[Pt])}}}if(F(O)&&O.mipmapsAutoUpdate===!0)L(d.TEXTURE_CUBE_MAP);if(yt.__version=dt.version,O.onUpdate)O.onUpdate(O)}V.__version=O.version}function gt(V,O,tt,pt,dt,yt){let bt=x.convert(tt.format,tt.colorSpace),at=x.convert(tt.type),ht=k(tt.internalFormat,bt,at,tt.normalized,tt.colorSpace),St=g.get(O),Y=g.get(tt);if(Y.__renderTarget=O,!St.__hasExternalTextures){let ct=Math.max(1,O.width>>yt),lt=Math.max(1,O.height>>yt);if(dt===d.TEXTURE_3D||dt===d.TEXTURE_2D_ARRAY)m.texImage3D(dt,yt,ht,ct,lt,O.depth,0,bt,at,null);else m.texImage2D(dt,yt,ht,ct,lt,0,bt,at,null)}if(m.bindFramebuffer(d.FRAMEBUFFER,V),Ne(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,pt,dt,Y.__webglTexture,0,At(O));else if(dt===d.TEXTURE_2D||dt>=d.TEXTURE_CUBE_MAP_POSITIVE_X&&dt<=d.TEXTURE_CUBE_MAP_NEGATIVE_Z)d.framebufferTexture2D(d.FRAMEBUFFER,pt,dt,Y.__webglTexture,yt);m.bindFramebuffer(d.FRAMEBUFFER,null)}function Gt(V,O,tt){if(d.bindRenderbuffer(d.RENDERBUFFER,V),O.depthBuffer){let pt=O.depthTexture,dt=pt&&pt.isDepthTexture?pt.type:null,yt=I(O.stencilBuffer,dt),bt=O.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;if(Ne(O))y.renderbufferStorageMultisampleEXT(d.RENDERBUFFER,At(O),yt,O.width,O.height);else if(tt)d.renderbufferStorageMultisample(d.RENDERBUFFER,At(O),yt,O.width,O.height);else d.renderbufferStorage(d.RENDERBUFFER,yt,O.width,O.height);d.framebufferRenderbuffer(d.FRAMEBUFFER,bt,d.RENDERBUFFER,V)}else{let pt=O.textures;for(let dt=0;dt<pt.length;dt++){let yt=pt[dt],bt=x.convert(yt.format,yt.colorSpace),at=x.convert(yt.type),ht=k(yt.internalFormat,bt,at,yt.normalized,yt.colorSpace);if(Ne(O))y.renderbufferStorageMultisampleEXT(d.RENDERBUFFER,At(O),ht,O.width,O.height);else if(tt)d.renderbufferStorageMultisample(d.RENDERBUFFER,At(O),ht,O.width,O.height);else d.renderbufferStorage(d.RENDERBUFFER,ht,O.width,O.height)}}d.bindRenderbuffer(d.RENDERBUFFER,null)}function ae(V,O,tt){let pt=O.isWebGLCubeRenderTarget===!0;if(m.bindFramebuffer(d.FRAMEBUFFER,V),!(O.depthTexture&&O.depthTexture.isDepthTexture))throw Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let dt=g.get(O.depthTexture);dt.__renderTarget=O;let yt=pt?O.depthTexture.image[0]:O.depthTexture.image;if(!dt.__webglTexture||yt.width!==O.width||yt.height!==O.height)yt.width=O.width,yt.height=O.height,O.depthTexture.needsUpdate=!0;if(pt)wt(O.depthTexture,0);else Ct(O.depthTexture,0);let bt=dt.__webglTexture,at=At(O),ht=pt?d.TEXTURE_CUBE_MAP_POSITIVE_X+tt:d.TEXTURE_2D,St=O.depthTexture.format===Ai?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;if(O.depthTexture.format===Ns)if(Ne(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,St,ht,bt,0,at);else d.framebufferTexture2D(d.FRAMEBUFFER,St,ht,bt,0);else if(O.depthTexture.format===Ai)if(Ne(O))y.framebufferTexture2DMultisampleEXT(d.FRAMEBUFFER,St,ht,bt,0,at);else d.framebufferTexture2D(d.FRAMEBUFFER,St,ht,bt,0);else throw Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Re(V){let O=g.get(V),tt=V.isWebGLCubeRenderTarget===!0;if(O.__boundDepthTexture!==V.depthTexture){let pt=V.depthTexture;if(O.__depthDisposeCallback)O.__depthDisposeCallback();if(pt){let dt=()=>{delete O.__boundDepthTexture,delete O.__depthDisposeCallback,pt.removeEventListener("dispose",dt)};pt.addEventListener("dispose",dt),O.__depthDisposeCallback=dt}O.__boundDepthTexture=pt}if(V.depthTexture&&!O.__autoAllocateDepthBuffer)if(tt)for(let pt=0;pt<6;pt++)ae(O.__webglFramebuffer[pt],V,pt);else if(V.texture.mipmaps.length>0)ae(O.__webglFramebuffer[0],V,0);else ae(O.__webglFramebuffer,V,0);else if(tt){O.__webglDepthbuffer=[];for(let pt=0;pt<6;pt++)if(m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer[pt]),O.__webglDepthbuffer[pt]===void 0)O.__webglDepthbuffer[pt]=d.createRenderbuffer(),Gt(O.__webglDepthbuffer[pt],V,!1);else{let dt=V.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,yt=O.__webglDepthbuffer[pt];d.bindRenderbuffer(d.RENDERBUFFER,yt),d.framebufferRenderbuffer(d.FRAMEBUFFER,dt,d.RENDERBUFFER,yt)}}else{if(V.texture.mipmaps.length>0)m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer[0]);else m.bindFramebuffer(d.FRAMEBUFFER,O.__webglFramebuffer);if(O.__webglDepthbuffer===void 0)O.__webglDepthbuffer=d.createRenderbuffer(),Gt(O.__webglDepthbuffer,V,!1);else{let dt=V.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,yt=O.__webglDepthbuffer;d.bindRenderbuffer(d.RENDERBUFFER,yt),d.framebufferRenderbuffer(d.FRAMEBUFFER,dt,d.RENDERBUFFER,yt)}}m.bindFramebuffer(d.FRAMEBUFFER,null)}function gn(V,O,tt){let pt=g.get(V);if(O!==void 0)gt(pt.__webglFramebuffer,V,V.texture,d.COLOR_ATTACHMENT0,d.TEXTURE_2D,0);if(tt!==void 0)Re(V)}function K(V){let O=V.texture,tt=g.get(V),pt=g.get(O);V.addEventListener("dispose",X),z(V);let dt=V.textures,yt=V.isWebGLCubeRenderTarget===!0,bt=dt.length>1;if(!bt){if(pt.__webglTexture===void 0)pt.__webglTexture=d.createTexture();pt.__version=O.version,v.memory.textures++}if(yt){tt.__webglFramebuffer=[];for(let at=0;at<6;at++)if(O.mipmaps.length>0){tt.__webglFramebuffer[at]=[];for(let ht=0;ht<O.mipmaps.length;ht++)tt.__webglFramebuffer[at][ht]=d.createFramebuffer()}else tt.__webglFramebuffer[at]=d.createFramebuffer()}else{if(O.mipmaps.length>0){tt.__webglFramebuffer=[];for(let at=0;at<O.mipmaps.length;at++)tt.__webglFramebuffer[at]=d.createFramebuffer()}else tt.__webglFramebuffer=d.createFramebuffer();if(bt)for(let at=0,ht=dt.length;at<ht;at++){let St=g.get(dt[at]);if(St.__webglTexture===void 0)St.__webglTexture=d.createTexture(),v.memory.textures++}if(V.samples>0&&Ne(V)===!1){tt.__webglMultisampledFramebuffer=d.createFramebuffer(),tt.__webglColorRenderbuffer=[],m.bindFramebuffer(d.FRAMEBUFFER,tt.__webglMultisampledFramebuffer);for(let at=0;at<dt.length;at++){let ht=dt[at];tt.__webglColorRenderbuffer[at]=d.createRenderbuffer(),d.bindRenderbuffer(d.RENDERBUFFER,tt.__webglColorRenderbuffer[at]);let St=x.convert(ht.format,ht.colorSpace),Y=x.convert(ht.type),ct=k(ht.internalFormat,St,Y,ht.normalized,ht.colorSpace,V.isXRRenderTarget===!0),lt=At(V);d.renderbufferStorageMultisample(d.RENDERBUFFER,lt,ct,V.width,V.height),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+at,d.RENDERBUFFER,tt.__webglColorRenderbuffer[at])}if(d.bindRenderbuffer(d.RENDERBUFFER,null),V.depthBuffer)tt.__webglDepthRenderbuffer=d.createRenderbuffer(),Gt(tt.__webglDepthRenderbuffer,V,!0);m.bindFramebuffer(d.FRAMEBUFFER,null)}}if(yt){m.bindTexture(d.TEXTURE_CUBE_MAP,pt.__webglTexture),Zt(d.TEXTURE_CUBE_MAP,O);for(let at=0;at<6;at++)if(O.mipmaps.length>0)for(let ht=0;ht<O.mipmaps.length;ht++)gt(tt.__webglFramebuffer[at][ht],V,O,d.COLOR_ATTACHMENT0,d.TEXTURE_CUBE_MAP_POSITIVE_X+at,ht);else gt(tt.__webglFramebuffer[at],V,O,d.COLOR_ATTACHMENT0,d.TEXTURE_CUBE_MAP_POSITIVE_X+at,0);if(F(O))L(d.TEXTURE_CUBE_MAP);else if(O.mipmaps.length>0)d.texParameteri(d.TEXTURE_CUBE_MAP,d.TEXTURE_MAX_LEVEL,O.mipmaps.length-1);m.unbindTexture()}else if(bt){for(let at=0,ht=dt.length;at<ht;at++){let St=dt[at],Y=g.get(St),ct=d.TEXTURE_2D;if(V.isWebGL3DRenderTarget||V.isWebGLArrayRenderTarget)ct=V.isWebGL3DRenderTarget?d.TEXTURE_3D:d.TEXTURE_2D_ARRAY;if(m.bindTexture(ct,Y.__webglTexture),Zt(ct,St),gt(tt.__webglFramebuffer,V,St,d.COLOR_ATTACHMENT0+at,ct,0),F(St))L(ct)}m.unbindTexture()}else{let at=d.TEXTURE_2D;if(V.isWebGL3DRenderTarget||V.isWebGLArrayRenderTarget)at=V.isWebGL3DRenderTarget?d.TEXTURE_3D:d.TEXTURE_2D_ARRAY;if(m.bindTexture(at,pt.__webglTexture),Zt(at,O),O.mipmaps.length>0)for(let ht=0;ht<O.mipmaps.length;ht++)gt(tt.__webglFramebuffer[ht],V,O,d.COLOR_ATTACHMENT0,at,ht);else gt(tt.__webglFramebuffer,V,O,d.COLOR_ATTACHMENT0,at,0);if(F(O))L(at);else if(O.mipmaps.length>0)d.texParameteri(at,d.TEXTURE_MAX_LEVEL,O.mipmaps.length-1);m.unbindTexture()}if(V.depthBuffer)Re(V)}function _n(V){let O=V.textures;for(let tt=0,pt=O.length;tt<pt;tt++){let dt=O[tt];if(F(dt)&&dt.mipmapsAutoUpdate===!0){let yt=U(V),bt=g.get(dt).__webglTexture;m.bindTexture(yt,bt),L(yt),m.unbindTexture()}}}let Se=[];function Ze(V){if(V.samples>0){if(Ne(V)===!1){let{textures:O,width:tt,height:pt}=V,dt=d.COLOR_BUFFER_BIT,yt=V.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT,bt=g.get(V),at=O.length>1;if(at)for(let St=0;St<O.length;St++)m.bindFramebuffer(d.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+St,d.RENDERBUFFER,null),m.bindFramebuffer(d.FRAMEBUFFER,bt.__webglFramebuffer),d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0+St,d.TEXTURE_2D,null,0);if(m.bindFramebuffer(d.READ_FRAMEBUFFER,bt.__webglMultisampledFramebuffer),V.texture.mipmaps.length>0)m.bindFramebuffer(d.DRAW_FRAMEBUFFER,bt.__webglFramebuffer[0]);else m.bindFramebuffer(d.DRAW_FRAMEBUFFER,bt.__webglFramebuffer);for(let St=0;St<O.length;St++){if(V.resolveDepthBuffer){if(V.depthBuffer)dt|=d.DEPTH_BUFFER_BIT;if(V.stencilBuffer&&V.resolveStencilBuffer)dt|=d.STENCIL_BUFFER_BIT}if(at){d.framebufferRenderbuffer(d.READ_FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.RENDERBUFFER,bt.__webglColorRenderbuffer[St]);let Y=g.get(O[St]).__webglTexture;d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0,d.TEXTURE_2D,Y,0)}if(d.blitFramebuffer(0,0,tt,pt,0,0,tt,pt,dt,d.NEAREST),S===!0){if(Se.length=0,Se.push(d.COLOR_ATTACHMENT0+St),V.depthBuffer&&V.storeMultisampledDepthBuffer===!1)Se.push(yt);d.invalidateFramebuffer(d.READ_FRAMEBUFFER,Se)}}if(m.bindFramebuffer(d.READ_FRAMEBUFFER,null),m.bindFramebuffer(d.DRAW_FRAMEBUFFER,null),at)for(let St=0;St<O.length;St++){m.bindFramebuffer(d.FRAMEBUFFER,bt.__webglMultisampledFramebuffer),d.framebufferRenderbuffer(d.FRAMEBUFFER,d.COLOR_ATTACHMENT0+St,d.RENDERBUFFER,bt.__webglColorRenderbuffer[St]);let Y=g.get(O[St]).__webglTexture;m.bindFramebuffer(d.FRAMEBUFFER,bt.__webglFramebuffer),d.framebufferTexture2D(d.DRAW_FRAMEBUFFER,d.COLOR_ATTACHMENT0+St,d.TEXTURE_2D,Y,0)}m.bindFramebuffer(d.DRAW_FRAMEBUFFER,bt.__webglMultisampledFramebuffer)}else if(V.depthBuffer&&V.storeMultisampledDepthBuffer===!1&&S){let O=V.stencilBuffer?d.DEPTH_STENCIL_ATTACHMENT:d.DEPTH_ATTACHMENT;d.invalidateFramebuffer(d.DRAW_FRAMEBUFFER,[O])}}}function At(V){return Math.min(_.maxSamples,V.samples)}function Ne(V){let O=g.get(V);return V.samples>0&&p.has("WEBGL_multisampled_render_to_texture")===!0&&O.__useRenderToTexture!==!1}function Yt(V){let O=v.render.frame;if(E.get(V)!==O)E.set(V,O),V.update()}function te(V,O){let{colorSpace:tt,format:pt,type:dt}=V;if(V.isCompressedTexture===!0||V.isVideoTexture===!0)return O;if(tt!==pc&&tt!==Ki)if(le.getTransfer(tt)===Ie){if(pt!==Nn||dt!==Gn)Xt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.")}else $t("WebGLTextures: Unsupported texture color space:",tt);return O}function rn(V){if(typeof HTMLImageElement<"u"&&V instanceof HTMLImageElement)M.width=V.naturalWidth||V.width,M.height=V.naturalHeight||V.height;else if(typeof VideoFrame<"u"&&V instanceof VideoFrame)M.width=V.displayWidth,M.height=V.displayHeight;else M.width=V.width,M.height=V.height;return M}this.allocateTextureUnit=ot,this.resetTextureUnits=ut,this.getTextureUnits=mt,this.setTextureUnits=Nt,this.setTexture2D=Ct,this.setTexture2DArray=zt,this.setTexture3D=Dt,this.setTextureCube=wt,this.rebindTextures=gn,this.setupRenderTarget=K,this.updateRenderTargetMipmap=_n,this.updateMultisampleRenderTarget=Ze,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=gt,this.useMultisampledRTT=Ne,this.dispose=Q}function Xv(d,p){function m(g,_=Ki){let x,v=le.getTransfer(_);if(g===Gn)return d.UNSIGNED_BYTE;if(g===Ul)return d.UNSIGNED_SHORT_4_4_4_4;if(g===Fl)return d.UNSIGNED_SHORT_5_5_5_1;if(g===Ed)return d.UNSIGNED_INT_5_9_9_9_REV;if(g===Td)return d.UNSIGNED_INT_10F_11F_11F_REV;if(g===Md)return d.BYTE;if(g===bd)return d.SHORT;if(g===xr)return d.UNSIGNED_SHORT;if(g===Dl)return d.INT;if(g===wi)return d.UNSIGNED_INT;if(g===hi)return d.FLOAT;if(g===Zn)return d.HALF_FLOAT;if(g===wd)return d.ALPHA;if(g===Ad)return d.RGB;if(g===Nn)return d.RGBA;if(g===Ns)return d.DEPTH_COMPONENT;if(g===Ai)return d.DEPTH_STENCIL;if(g===Rd)return d.RED;if(g===Ol)return d.RED_INTEGER;if(g===Ji)return d.RG;if(g===Bl)return d.RG_INTEGER;if(g===kl)return d.RGBA_INTEGER;if(g===Ds||g===Do||g===Us||g===Fs)if(v===Ie)if(x=p.get("WEBGL_compressed_texture_s3tc_srgb"),x!==null){if(g===Ds)return x.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(g===Do)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(g===Us)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(g===Fs)return x.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(x=p.get("WEBGL_compressed_texture_s3tc"),x!==null){if(g===Ds)return x.COMPRESSED_RGB_S3TC_DXT1_EXT;if(g===Do)return x.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(g===Us)return x.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(g===Fs)return x.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(g===zl||g===Hl||g===Gl||g===Vl)if(x=p.get("WEBGL_compressed_texture_pvrtc"),x!==null){if(g===zl)return x.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(g===Hl)return x.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(g===Gl)return x.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(g===Vl)return x.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(g===vr||g===Wl||g===Xl||g===ql||g===Yl||g===Uo||g===Zl)if(x=p.get("WEBGL_compressed_texture_etc"),x!==null){if(g===vr||g===Wl)return v===Ie?x.COMPRESSED_SRGB8_ETC2:x.COMPRESSED_RGB8_ETC2;if(g===Xl)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:x.COMPRESSED_RGBA8_ETC2_EAC;if(g===ql)return x.COMPRESSED_R11_EAC;if(g===Yl)return x.COMPRESSED_SIGNED_R11_EAC;if(g===Uo)return x.COMPRESSED_RG11_EAC;if(g===Zl)return x.COMPRESSED_SIGNED_RG11_EAC}else return null;if(g===$l||g===Jl||g===Kl||g===jl||g===Ql||g===tc||g===ec||g===nc||g===ic||g===sc||g===rc||g===oc||g===ac||g===lc)if(x=p.get("WEBGL_compressed_texture_astc"),x!==null){if(g===$l)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:x.COMPRESSED_RGBA_ASTC_4x4_KHR;if(g===Jl)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:x.COMPRESSED_RGBA_ASTC_5x4_KHR;if(g===Kl)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:x.COMPRESSED_RGBA_ASTC_5x5_KHR;if(g===jl)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:x.COMPRESSED_RGBA_ASTC_6x5_KHR;if(g===Ql)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:x.COMPRESSED_RGBA_ASTC_6x6_KHR;if(g===tc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:x.COMPRESSED_RGBA_ASTC_8x5_KHR;if(g===ec)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:x.COMPRESSED_RGBA_ASTC_8x6_KHR;if(g===nc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:x.COMPRESSED_RGBA_ASTC_8x8_KHR;if(g===ic)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:x.COMPRESSED_RGBA_ASTC_10x5_KHR;if(g===sc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:x.COMPRESSED_RGBA_ASTC_10x6_KHR;if(g===rc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:x.COMPRESSED_RGBA_ASTC_10x8_KHR;if(g===oc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:x.COMPRESSED_RGBA_ASTC_10x10_KHR;if(g===ac)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:x.COMPRESSED_RGBA_ASTC_12x10_KHR;if(g===lc)return v===Ie?x.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:x.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(g===cc||g===yr||g===Sr)if(x=p.get("EXT_texture_compression_bptc"),x!==null){if(g===cc)return v===Ie?x.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:x.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(g===yr)return x.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(g===Sr)return x.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(g===hc||g===uc||g===Fo||g===dc)if(x=p.get("EXT_texture_compression_rgtc"),x!==null){if(g===hc)return x.COMPRESSED_RED_RGTC1_EXT;if(g===uc)return x.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(g===Fo)return x.COMPRESSED_RED_GREEN_RGTC2_EXT;if(g===dc)return x.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;if(g===$i)return d.UNSIGNED_INT_24_8;return d[g]!==void 0?d[g]:null}return{convert:m}}var qv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Yv=`
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

}`;class Pf{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(d,p){if(this.texture===null){let m=new Yo(d.texture);if(d.depthNear!==p.depthNear||d.depthFar!==p.depthFar)this.depthNear=d.depthNear,this.depthFar=d.depthFar;this.texture=m}}getMesh(d){if(this.texture!==null){if(this.mesh===null){let p=d.cameras[0].viewport,m=new mi({vertexShader:qv,fragmentShader:Yv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:p.z},depthHeight:{value:p.w}}});this.mesh=new nn(new Rr(20,20),m)}}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Lf extends ui{constructor(d,p){super();let m=this,g=null,_=1,x=null,v="local-floor",y=1,S=null,M=null,E=null,T=null,b=null,w=null,C=typeof XRWebGLBinding<"u",N=new Pf,A={},R=p.getContextAttributes(),P=null,F=null,L=[],U=[],k=new Jt,I=null,D=null,z=new bn;z.viewport=new Be;let W=new bn;W.viewport=new Be;let H=[z,W],X=new Xc,J=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ot){let ft=L[ot];if(ft===void 0)ft=new Er,L[ot]=ft;return ft.getTargetRaySpace()},this.getControllerGrip=function(ot){let ft=L[ot];if(ft===void 0)ft=new Er,L[ot]=ft;return ft.getGripSpace()},this.getHand=function(ot){let ft=L[ot];if(ft===void 0)ft=new Er,L[ot]=ft;return ft.getHandSpace()};function Q(ot){let ft=U.indexOf(ot.inputSource);if(ft===-1)return;let Ct=L[ft];if(Ct!==void 0)Ct.update(ot.inputSource,ot.frame,S||x),Ct.dispatchEvent({type:ot.type,data:ot.inputSource})}function it(){g.removeEventListener("select",Q),g.removeEventListener("selectstart",Q),g.removeEventListener("selectend",Q),g.removeEventListener("squeeze",Q),g.removeEventListener("squeezestart",Q),g.removeEventListener("squeezeend",Q),g.removeEventListener("end",it),g.removeEventListener("inputsourceschange",j);for(let ot=0;ot<L.length;ot++){let ft=U[ot];if(ft===null)continue;U[ot]=null,L[ot].disconnect(ft)}J=null,G=null,N.reset();for(let ot in A)delete A[ot];if(d.setRenderTarget(P),b=null,T=null,E=null,g=null,F=null,Nt.stop(),m.isPresenting=!1,d.setPixelRatio(I),d.setSize(k.width,k.height,!1),D!==null){let ot=D.camera;ot.fov=D.fov,ot.zoom=D.zoom,ot.updateProjectionMatrix(),D=null}m.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ot){if(_=ot,m.isPresenting===!0)Xt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ot){if(v=ot,m.isPresenting===!0)Xt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return S||x},this.setReferenceSpace=function(ot){S=ot},this.getBaseLayer=function(){return T!==null?T:b},this.getBinding=function(){if(E===null&&C)E=new XRWebGLBinding(g,p);return E},this.getFrame=function(){return w},this.getSession=function(){return g},this.setSession=async function(ot){if(g=ot,g!==null){if(P=d.getRenderTarget(),g.addEventListener("select",Q),g.addEventListener("selectstart",Q),g.addEventListener("selectend",Q),g.addEventListener("squeeze",Q),g.addEventListener("squeezestart",Q),g.addEventListener("squeezeend",Q),g.addEventListener("end",it),g.addEventListener("inputsourceschange",j),R.xrCompatible!==!0)await p.makeXRCompatible();if(I=d.getPixelRatio(),d.getSize(k),!(C&&("createProjectionLayer"in XRWebGLBinding.prototype))){let Ct={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:_};b=new XRWebGLLayer(g,p,Ct),g.updateRenderState({baseLayer:b}),d.setPixelRatio(1),d.setSize(b.framebufferWidth,b.framebufferHeight,!1),F=new Dn(b.framebufferWidth,b.framebufferHeight,{format:Nn,type:Gn,colorSpace:d.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:b.ignoreDepthValues===!1,resolveStencilBuffer:b.ignoreDepthValues===!1,storeMultisampledDepthBuffer:b.ignoreDepthValues===!1,storeMultisampledStencilBuffer:b.ignoreDepthValues===!1})}else{let Ct=null,zt=null,Dt=null;if(R.depth)Dt=R.stencil?p.DEPTH24_STENCIL8:p.DEPTH_COMPONENT24,Ct=R.stencil?Ai:Ns,zt=R.stencil?$i:wi;let wt={colorFormat:p.RGBA8,depthFormat:Dt,scaleFactor:_};E=this.getBinding(),T=E.createProjectionLayer(wt),g.updateRenderState({layers:[T]}),d.setPixelRatio(1),d.setSize(T.textureWidth,T.textureHeight,!1),F=new Dn(T.textureWidth,T.textureHeight,{format:Nn,type:Gn,depthTexture:new Ni(T.textureWidth,T.textureHeight,zt,void 0,void 0,void 0,void 0,void 0,void 0,Ct),stencilBuffer:R.stencil,colorSpace:d.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:T.ignoreDepthValues===!1,resolveStencilBuffer:T.ignoreDepthValues===!1,storeMultisampledDepthBuffer:T.ignoreDepthValues===!1,storeMultisampledStencilBuffer:T.ignoreDepthValues===!1})}F.isXRRenderTarget=!0,this.setFoveation(y),S=null,x=await g.requestReferenceSpace(v),Nt.setContext(g),Nt.start(),m.isPresenting=!0,m.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(g!==null)return g.environmentBlendMode},this.getDepthTexture=function(){return N.getDepthTexture()};function j(ot){for(let ft=0;ft<ot.removed.length;ft++){let Ct=ot.removed[ft],zt=U.indexOf(Ct);if(zt>=0)U[zt]=null,L[zt].disconnect(Ct)}for(let ft=0;ft<ot.added.length;ft++){let Ct=ot.added[ft],zt=U.indexOf(Ct);if(zt===-1){for(let wt=0;wt<L.length;wt++)if(wt>=U.length){U.push(Ct),zt=wt;break}else if(U[wt]===null){U[wt]=Ct,zt=wt;break}if(zt===-1)break}let Dt=L[zt];if(Dt)Dt.connect(Ct)}}function _t(ot,ft){if(ft===null)ot.matrixWorld.copy(ot.matrix);else ot.matrixWorld.multiplyMatrices(ft.matrixWorld,ot.matrix);ot.matrixWorldInverse.copy(ot.matrixWorld).invert()}this.updateCamera=function(ot){if(g===null)return;let{near:ft,far:Ct}=ot;if(N.texture!==null){if(N.depthNear>0)ft=N.depthNear;if(N.depthFar>0)Ct=N.depthFar}if(X.near=W.near=z.near=ft,X.far=W.far=z.far=Ct,J!==X.near||G!==X.far)g.updateRenderState({depthNear:X.near,depthFar:X.far}),J=X.near,G=X.far;X.layers.mask=ot.layers.mask|6,z.layers.mask=X.layers.mask&-5,W.layers.mask=X.layers.mask&-3;let zt=ot.parent,Dt=X.cameras;_t(X,zt);for(let wt=0;wt<Dt.length;wt++)_t(Dt[wt],zt);if(X.projectionMatrix.copy(z.projectionMatrix),X.projectionMatrixInverse.copy(z.projectionMatrixInverse),D===null&&ot.isPerspectiveCamera)D={camera:ot,fov:ot.fov,zoom:ot.zoom};rt(ot,X,zt)};function rt(ot,ft,Ct){if(Ct===null)ot.matrix.copy(ft.matrixWorld);else ot.matrix.copy(Ct.matrixWorld),ot.matrix.invert(),ot.matrix.multiply(ft.matrixWorld);if(ot.matrix.decompose(ot.position,ot.quaternion,ot.scale),ot.updateMatrixWorld(!0),ot.projectionMatrix.copy(ft.projectionMatrix),ot.projectionMatrixInverse.copy(ft.projectionMatrixInverse),ot.isPerspectiveCamera)ot.fov=Cs*2*Math.atan(1/ot.projectionMatrix.elements[5]),ot.zoom=1}this.getCamera=function(){return X},this.getFoveation=function(){if(T===null&&b===null)return;return y},this.setFoveation=function(ot){if(y=ot,T!==null)T.fixedFoveation=ot;if(b!==null&&b.fixedFoveation!==void 0)b.fixedFoveation=ot},this.hasDepthSensing=function(){return N.texture!==null},this.getDepthSensingMesh=function(){return N.getMesh(X)},this.getCameraTexture=function(ot){return A[ot]};let ut=null;function mt(ot,ft){if(M=ft.getViewerPose(S||x),w=ft,M!==null){let Ct=M.views;if(b!==null)d.setRenderTargetFramebuffer(F,b.framebuffer),d.setRenderTarget(F);let zt=!1;if(Ct.length!==X.cameras.length)X.cameras.length=0,zt=!0;for(let Qt=0;Qt<Ct.length;Qt++){let Ft=Ct[Qt],Zt=null;if(b!==null)Zt=b.getViewport(Ft);else{let fe=E.getViewSubImage(T,Ft);if(Zt=fe.viewport,Qt===0)d.setRenderTargetTextures(F,fe.colorTexture,fe.depthStencilTexture),d.setRenderTarget(F)}let qt=H[Qt];if(qt===void 0)qt=new bn,qt.layers.enable(Qt),qt.viewport=new Be,H[Qt]=qt;if(qt.matrix.fromArray(Ft.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Ft.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(Zt.x,Zt.y,Zt.width,Zt.height),Qt===0)X.matrix.copy(qt.matrix),X.matrix.decompose(X.position,X.quaternion,X.scale);if(zt===!0)X.cameras.push(qt)}let Dt=g.enabledFeatures;if(Dt&&Dt.includes("depth-sensing")&&g.depthUsage=="gpu-optimized"&&C){E=m.getBinding();let Qt=E.getDepthInformation(Ct[0]);if(Qt&&Qt.isValid&&Qt.texture)N.init(Qt,g.renderState)}if(Dt&&Dt.includes("camera-access")&&C){d.state.unbindTexture(),E=m.getBinding();for(let Qt=0;Qt<Ct.length;Qt++){let Ft=Ct[Qt].camera;if(Ft){let Zt=A[Ft];if(!Zt)Zt=new Yo,A[Ft]=Zt;let qt=E.getCameraImage(Ft);Zt.sourceTexture=qt}}}}for(let Ct=0;Ct<L.length;Ct++){let zt=U[Ct],Dt=L[Ct];if(zt!==null&&Dt!==void 0)Dt.update(zt,ft,S||x)}if(ut)ut(ot,ft);if(ft.detectedPlanes)m.dispatchEvent({type:"planesdetected",data:ft});w=null}let Nt=new gf;Nt.setAnimationLoop(mt),this.setAnimationLoop=function(ot){ut=ot},this.dispose=function(){}}}var Zv=new ie,Nf=new Kt;Nf.set(-1,0,0,0,1,0,0,0,1);function $v(d,p){function m(A,R){if(A.matrixAutoUpdate===!0)A.updateMatrix();R.value.copy(A.matrix)}function g(A,R){if(R.color.getRGB(A.fogColor.value,Ic(d)),R.isFog)A.fogNear.value=R.near,A.fogFar.value=R.far;else if(R.isFogExp2)A.fogDensity.value=R.density}function _(A,R,P,F,L){if(R.isNodeMaterial)R.uniformsNeedUpdate=!1;else if(R.isMeshBasicMaterial)x(A,R);else if(R.isMeshLambertMaterial){if(x(A,R),R.envMap)A.envMapIntensity.value=R.envMapIntensity}else if(R.isMeshToonMaterial)x(A,R),T(A,R);else if(R.isMeshPhongMaterial){if(x(A,R),E(A,R),R.envMap)A.envMapIntensity.value=R.envMapIntensity}else if(R.isMeshStandardMaterial){if(x(A,R),b(A,R),R.isMeshPhysicalMaterial)w(A,R,L)}else if(R.isMeshMatcapMaterial)x(A,R),C(A,R);else if(R.isMeshDepthMaterial)x(A,R);else if(R.isMeshDistanceMaterial)x(A,R),N(A,R);else if(R.isMeshNormalMaterial)x(A,R);else if(R.isLineBasicMaterial){if(v(A,R),R.isLineDashedMaterial)y(A,R)}else if(R.isPointsMaterial)S(A,R,P,F);else if(R.isSpriteMaterial)M(A,R);else if(R.isShadowMaterial)A.color.value.copy(R.color),A.opacity.value=R.opacity;else if(R.isShaderMaterial)R.uniformsNeedUpdate=!1}function x(A,R){if(A.opacity.value=R.opacity,R.color)A.diffuse.value.copy(R.color);if(R.emissive)A.emissive.value.copy(R.emissive).multiplyScalar(R.emissiveIntensity);if(R.map)A.map.value=R.map,m(R.map,A.mapTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.bumpMap){if(A.bumpMap.value=R.bumpMap,m(R.bumpMap,A.bumpMapTransform),A.bumpScale.value=R.bumpScale,R.side===dn)A.bumpScale.value*=-1}if(R.normalMap){if(A.normalMap.value=R.normalMap,m(R.normalMap,A.normalMapTransform),A.normalScale.value.copy(R.normalScale),R.side===dn)A.normalScale.value.negate()}if(R.displacementMap)A.displacementMap.value=R.displacementMap,m(R.displacementMap,A.displacementMapTransform),A.displacementScale.value=R.displacementScale,A.displacementBias.value=R.displacementBias;if(R.emissiveMap)A.emissiveMap.value=R.emissiveMap,m(R.emissiveMap,A.emissiveMapTransform);if(R.specularMap)A.specularMap.value=R.specularMap,m(R.specularMap,A.specularMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest;let P=p.get(R),{envMap:F,envMapRotation:L}=P;if(F){if(A.envMap.value=F,A.envMapRotation.value.setFromMatrix4(Zv.makeRotationFromEuler(L)).transpose(),F.isCubeTexture&&F.isRenderTargetTexture===!1)A.envMapRotation.value.premultiply(Nf);A.reflectivity.value=R.reflectivity,A.ior.value=R.ior,A.refractionRatio.value=R.refractionRatio}if(R.lightMap)A.lightMap.value=R.lightMap,A.lightMapIntensity.value=R.lightMapIntensity,m(R.lightMap,A.lightMapTransform);if(R.aoMap)A.aoMap.value=R.aoMap,A.aoMapIntensity.value=R.aoMapIntensity,m(R.aoMap,A.aoMapTransform)}function v(A,R){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,R.map)A.map.value=R.map,m(R.map,A.mapTransform)}function y(A,R){A.dashSize.value=R.dashSize,A.totalSize.value=R.dashSize+R.gapSize,A.scale.value=R.scale}function S(A,R,P,F){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,A.size.value=R.size*P,A.scale.value=F*0.5,R.map)A.map.value=R.map,m(R.map,A.uvTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest}function M(A,R){if(A.diffuse.value.copy(R.color),A.opacity.value=R.opacity,A.rotation.value=R.rotation,R.map)A.map.value=R.map,m(R.map,A.mapTransform);if(R.alphaMap)A.alphaMap.value=R.alphaMap,m(R.alphaMap,A.alphaMapTransform);if(R.alphaTest>0)A.alphaTest.value=R.alphaTest}function E(A,R){A.specular.value.copy(R.specular),A.shininess.value=Math.max(R.shininess,0.0001)}function T(A,R){if(R.gradientMap)A.gradientMap.value=R.gradientMap}function b(A,R){if(A.metalness.value=R.metalness,R.metalnessMap)A.metalnessMap.value=R.metalnessMap,m(R.metalnessMap,A.metalnessMapTransform);if(A.roughness.value=R.roughness,R.roughnessMap)A.roughnessMap.value=R.roughnessMap,m(R.roughnessMap,A.roughnessMapTransform);if(R.envMap)A.envMapIntensity.value=R.envMapIntensity}function w(A,R,P){if(A.ior.value=R.ior,R.diffuseRoughness>0){if(A.diffuseRoughness.value=R.diffuseRoughness,R.diffuseRoughnessMap)A.diffuseRoughnessMap.value=R.diffuseRoughnessMap,m(R.diffuseRoughnessMap,A.diffuseRoughnessMapTransform)}if(R.sheen>0){if(A.sheenColor.value.copy(R.sheenColor).multiplyScalar(R.sheen),A.sheenRoughness.value=R.sheenRoughness,R.sheenColorMap)A.sheenColorMap.value=R.sheenColorMap,m(R.sheenColorMap,A.sheenColorMapTransform);if(R.sheenRoughnessMap)A.sheenRoughnessMap.value=R.sheenRoughnessMap,m(R.sheenRoughnessMap,A.sheenRoughnessMapTransform)}if(R.clearcoat>0){if(A.clearcoat.value=R.clearcoat,A.clearcoatRoughness.value=R.clearcoatRoughness,R.clearcoatMap)A.clearcoatMap.value=R.clearcoatMap,m(R.clearcoatMap,A.clearcoatMapTransform);if(R.clearcoatRoughnessMap)A.clearcoatRoughnessMap.value=R.clearcoatRoughnessMap,m(R.clearcoatRoughnessMap,A.clearcoatRoughnessMapTransform);if(R.clearcoatNormalMap){if(A.clearcoatNormalMap.value=R.clearcoatNormalMap,m(R.clearcoatNormalMap,A.clearcoatNormalMapTransform),A.clearcoatNormalScale.value.copy(R.clearcoatNormalScale),R.side===dn)A.clearcoatNormalScale.value.negate()}}if(R.dispersion>0)A.dispersion.value=R.dispersion;if(R.retroreflectivity>0)A.retroreflectivity.value=R.retroreflectivity;if(R.iridescence>0){if(A.iridescence.value=R.iridescence,A.iridescenceIOR.value=R.iridescenceIOR,A.iridescenceThicknessMinimum.value=R.iridescenceThicknessMinimum,A.iridescenceThicknessMaximum.value=R.iridescenceThicknessMaximum,R.iridescenceMap)A.iridescenceMap.value=R.iridescenceMap,m(R.iridescenceMap,A.iridescenceMapTransform);if(R.iridescenceThicknessMap)A.iridescenceThicknessMap.value=R.iridescenceThicknessMap,m(R.iridescenceThicknessMap,A.iridescenceThicknessMapTransform)}if(R.transmission>0){if(A.transmission.value=R.transmission,A.transmissionSamplerMap.value=P.texture,A.transmissionSamplerSize.value.set(P.width,P.height),R.transmissionMap)A.transmissionMap.value=R.transmissionMap,m(R.transmissionMap,A.transmissionMapTransform);if(A.thickness.value=R.thickness,R.thicknessMap)A.thicknessMap.value=R.thicknessMap,m(R.thicknessMap,A.thicknessMapTransform);A.attenuationDistance.value=R.attenuationDistance,A.attenuationColor.value.copy(R.attenuationColor)}if(R.anisotropy>0){if(A.anisotropyVector.value.set(R.anisotropy*Math.cos(R.anisotropyRotation),R.anisotropy*Math.sin(R.anisotropyRotation)),R.anisotropyMap)A.anisotropyMap.value=R.anisotropyMap,m(R.anisotropyMap,A.anisotropyMapTransform)}if(A.specularIntensity.value=R.specularIntensity,A.specularColor.value.copy(R.specularColor),R.specularColorMap)A.specularColorMap.value=R.specularColorMap,m(R.specularColorMap,A.specularColorMapTransform);if(R.specularIntensityMap)A.specularIntensityMap.value=R.specularIntensityMap,m(R.specularIntensityMap,A.specularIntensityMapTransform)}function C(A,R){if(R.matcap)A.matcap.value=R.matcap}function N(A,R){let P=p.get(R).light;A.referencePosition.value.setFromMatrixPosition(P.matrixWorld),A.nearDistance.value=P.shadow.camera.near,A.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:g,refreshMaterialUniforms:_}}function Jv(d,p,m,g){let _={},x={};function v(P,F){let L=F.program;g.uniformBlockBinding(P,L,_[P.id])}function y(P,F){let L=_[P.id];if(L===void 0)C(P),L=S(P),_[P.id]=L,P.addEventListener("dispose",A);let U=F.program;g.updateUBOMapping(P,U);let k=p.render.frame;if(x[P.id]!==k)M(P),x[P.id]=k}function S(P){let F=d.createBuffer(),{__size:L,usage:U}=P;return d.bindBuffer(d.UNIFORM_BUFFER,F),d.bufferData(d.UNIFORM_BUFFER,L,U),d.bindBuffer(d.UNIFORM_BUFFER,null),F}function M(P){let F=_[P.id],{uniforms:L,__cache:U}=P;d.bindBuffer(d.UNIFORM_BUFFER,F);for(let k=0,I=L.length;k<I;k++){let D=L[k];if(Array.isArray(D))for(let z=0,W=D.length;z<W;z++)E(D[z],k,z,U);else E(D,k,0,U)}d.bindBuffer(d.UNIFORM_BUFFER,null)}function E(P,F,L,U){if(b(P,F,L,U)===!0){let{__offset:k,value:I}=P;if(Array.isArray(I)){let D=0;for(let z=0;z<I.length;z++){let W=I[z],H=N(W,!0);T(W,P.__data,D),D+=H.storage/Float32Array.BYTES_PER_ELEMENT}}else T(I,P.__data,0);d.bufferSubData(d.UNIFORM_BUFFER,k,P.__data)}}function T(P,F,L){if(typeof P==="number"||typeof P==="boolean")F[L]=P;else if(P.isMatrix3)F[L]=P.elements[0],F[L+1]=P.elements[1],F[L+2]=P.elements[2],F[L+3]=0,F[L+4]=P.elements[3],F[L+5]=P.elements[4],F[L+6]=P.elements[5],F[L+7]=0,F[L+8]=P.elements[6],F[L+9]=P.elements[7],F[L+10]=P.elements[8],F[L+11]=0;else if(ArrayBuffer.isView(P))F.set(P.subarray(0,F.length-L),L);else P.toArray(F,L)}function b(P,F,L,U){let k=P.value,I=F+"_"+L;if(Array.isArray(k)){if(U[I]===void 0)U[I]=[];let D=U[I],z=!1;for(let W=0;W<k.length;W++)if(w(k[W],D,W)===!0)z=!0;return z}return w(k,U,I)}function w(P,F,L){if(F[L]===void 0){if(typeof P==="number"||typeof P==="boolean")F[L]=P;else if(ArrayBuffer.isView(P))F[L]=P.slice();else F[L]=P.clone();return!0}else{let U=F[L];if(typeof P==="number"||typeof P==="boolean"){if(U!==P)return F[L]=P,!0}else if(ArrayBuffer.isView(P))return!0;else if(U.equals(P)===!1)return U.copy(P),!0}return!1}function C(P){let F=P.uniforms,L=0,U=16;for(let I=0,D=F.length;I<D;I++){let z=Array.isArray(F[I])?F[I]:[F[I]];for(let W=0,H=z.length;W<H;W++){let X=z[W],J=Array.isArray(X.value)?X.value:[X.value],G=Array.isArray(F[I])||Array.isArray(X.value),Q=L;for(let j=0,_t=J.length;j<_t;j++){let rt=J[j],ut=N(rt,G),mt=L%U,Nt=mt%ut.boundary,ot=mt+Nt;if(L+=Nt,ot!==0&&U-ot<ut.storage)L+=U-ot;if(j===0)Q=L;L+=ut.storage}let it=X.type==="int"?Int32Array:X.type==="uint"?Uint32Array:Float32Array;X.__data=new it((L-Q)/Float32Array.BYTES_PER_ELEMENT),X.__offset=Q}}let k=L%U;if(k>0)L+=U-k;return P.__size=L,P.__cache={},this}function N(P,F){let L={boundary:0,storage:0};if(typeof P==="number"||typeof P==="boolean")L.boundary=4,L.storage=4;else if(P.isVector2)L.boundary=8,L.storage=8;else if(P.isVector3||P.isColor)L.boundary=16,L.storage=12;else if(P.isVector4)L.boundary=16,L.storage=16;else if(P.isMatrix3)L.boundary=16,L.storage=48;else if(P.isMatrix4)L.boundary=16,L.storage=64;else if(P.isTexture)Xt("WebGLRenderer: Texture samplers can not be part of an uniforms group.");else if(ArrayBuffer.isView(P))L.boundary=16,L.storage=P.byteLength;else Xt("WebGLRenderer: Unsupported uniform value type.",P);if(F===!0)L.boundary=16,L.storage=Math.ceil(L.storage/16)*16;return L}function A(P){let F=P.target;F.removeEventListener("dispose",A),d.deleteBuffer(_[F.id]),delete _[F.id],delete x[F.id]}function R(){for(let P in _)d.deleteBuffer(_[P]);_={},x={}}return{bind:v,update:y,dispose:R}}var Kv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),$n=null;function jv(){if($n===null)$n=new As(Kv,16,16,Ji,Zn),$n.name="DFG_LUT",$n.minFilter=Tn,$n.magFilter=Tn,$n.wrapS=Lo,$n.wrapT=Lo,$n.generateMipmaps=!1,$n.needsUpdate=!0;return $n}class jc{constructor(d={}){let{canvas:p=Ud(),context:m=null,depth:g=!0,stencil:_=!1,alpha:x=!1,antialias:v=!1,premultipliedAlpha:y=!0,preserveDrawingBuffer:S=!1,powerPreference:M="default",failIfMajorPerformanceCaveat:E=!1,reversedDepthBuffer:T=!1,outputBufferType:b=Gn}=d;this.isWebGLRenderer=!0;let w;if(m!==null){if(typeof WebGLRenderingContext<"u"&&m instanceof WebGLRenderingContext)throw Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");w=m.getContextAttributes().alpha}else w=x;let C=b,N=new Set([kl,Bl,Ol]),A=new Set([Gn,wi,xr,$i,Ul,Fl]),R=new Uint32Array(4),P=new Int32Array(4),F={textures:[],min:[],max:[],resolution:[]},L=null,U=null,k=[],I=[],D=null;this.domElement=p,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Yn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let z=this,W=!1,H=null,X=null,J=null,G=null;this._outputColorSpace=Oo;let Q=0,it=0,j=null,_t=-1,rt=null,ut=new Be,mt=new Be,Nt=null,ot=new se(0),ft=0,{width:Ct,height:zt}=p,Dt=1,wt=null,jt=null,Qt=new Be(0,0,Ct,zt),Ft=new Be(0,0,Ct,zt),Zt=!1,qt=new Ei,fe=new Tr,pe=!1,ge=!1,be=new ie,gt=new q,Gt=new Be,ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Re=!1;function gn(){return j===null?Dt:1}let K=m;function _n(B,Z){return p.getContext(B,Z)}let Se,Ze,At,Ne,Yt,te,rn,V,O,tt,pt,dt,yt,bt,at,ht,St,Y,ct,lt,xt,vt,Tt;try{let B={alpha:!0,depth:g,stencil:_,antialias:v,premultipliedAlpha:y,preserveDrawingBuffer:S,powerPreference:M,failIfMajorPerformanceCaveat:E};if("setAttribute"in p)p.setAttribute("data-engine",`three.js r${Yi}`);if(p.addEventListener("webglcontextlost",It,!1),p.addEventListener("webglcontextrestored",Wt,!1),p.addEventListener("webglcontextcreationerror",re,!1),K===null){if(K=_n("webgl2",B),K===null)if(_n("webgl2"))throw Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.");else throw Error("THREE.WebGLRenderer: Error creating WebGL context.")}Vt()}catch(B){throw p.removeEventListener("webglcontextlost",It,!1),p.removeEventListener("webglcontextrestored",Wt,!1),p.removeEventListener("webglcontextcreationerror",re,!1),$t("WebGLRenderer: "+B.message),B}function Vt(){if(Se=new cx(K),Se.init(),xt=new Xv(K,Se),Ze=new j0(K,Se,d,xt),At=new Vv(K,Se),Ze.reversedDepthBuffer&&T)At.buffers.depth.setReversed(!0);X=K.createFramebuffer(),J=K.createFramebuffer(),G=K.createFramebuffer(),Ne=new dx(K),Yt=new Cv,te=new Wv(K,Se,At,Yt,Ze,xt,Ne),rn=new lx(z),V=new pg(K),vt=new J0(K,V),O=new hx(K,V,Ne,vt),tt=new px(K,O,V,vt,Ne),Y=new fx(K,Ze,te),at=new Q0(Yt),pt=new Rv(z,rn,Se,Ze,vt,at),dt=new $v(z,Yt),yt=new Pv,bt=new Ov(Se),St=new $0(z,rn,At,tt,w,y),ht=new Gv(z,tt,Ze),Tt=new Jv(K,Ne,Ze,At),ct=new K0(K,Se,Ne),lt=new ux(K,Se,Ne),Ne.programs=pt.programs,z.capabilities=Ze,z.extensions=Se,z.properties=Yt,z.renderLists=yt,z.shadowMap=ht,z.state=At,z.info=Ne}if(C!==Gn)D=new gx(C,p.width,p.height,v,g,_);let Ht=new Lf(z,K);this.xr=Ht,this.getContext=function(){return K},this.getContextAttributes=function(){return K.getContextAttributes()},this.forceContextLoss=function(){let B=Se.get("WEBGL_lose_context");if(B)B.loseContext()},this.forceContextRestore=function(){let B=Se.get("WEBGL_lose_context");if(B)B.restoreContext()},this.getPixelRatio=function(){return Dt},this.setPixelRatio=function(B){if(B===void 0)return;Dt=B,this.setSize(Ct,zt,!1)},this.getSize=function(B){return B.set(Ct,zt)},this.setSize=function(B,Z,st=!0){if(Ht.isPresenting){Xt("WebGLRenderer: Can't change size while VR device is presenting.");return}if(Ct=B,zt=Z,p.width=Math.floor(B*Dt),p.height=Math.floor(Z*Dt),st===!0)p.style.width=B+"px",p.style.height=Z+"px";if(D!==null)D.setSize(p.width,p.height);this.setViewport(0,0,B,Z)},this.getDrawingBufferSize=function(B){return B.set(Ct*Dt,zt*Dt).floor()},this.setDrawingBufferSize=function(B,Z,st){Ct=B,zt=Z,Dt=st,p.width=Math.floor(B*st),p.height=Math.floor(Z*st),this.setViewport(0,0,B,Z)},this.setEffects=function(B){if(C===Gn){$t("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(B){for(let Z=0;Z<B.length;Z++)if(B[Z].isOutputPass===!0){Xt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(B||[])},this.getCurrentViewport=function(B){return B.copy(ut)},this.getViewport=function(B){return B.copy(Qt)},this.setViewport=function(B,Z,st,et){if(B.isVector4)Qt.set(B.x,B.y,B.z,B.w);else Qt.set(B,Z,st,et);At.viewport(ut.copy(Qt).multiplyScalar(gn()).round())},this.getScissor=function(B){return B.copy(Ft)},this.setScissor=function(B,Z,st,et){if(B.isVector4)Ft.set(B.x,B.y,B.z,B.w);else Ft.set(B,Z,st,et);At.scissor(mt.copy(Ft).multiplyScalar(gn()).round())},this.getScissorTest=function(){return Zt},this.setScissorTest=function(B){At.setScissorTest(Zt=B)},this.setOpaqueSort=function(B){wt=B},this.setTransparentSort=function(B){jt=B},this.getClearColor=function(B){return B.copy(St.getClearColor())},this.setClearColor=function(){St.setClearColor(...arguments)},this.getClearAlpha=function(){return St.getClearAlpha()},this.setClearAlpha=function(){St.setClearAlpha(...arguments)},this.clear=function(B=!0,Z=!0,st=!0){let et=0;if(B){let nt=!1;if(j!==null){let Et=j.texture.format;nt=N.has(Et)}if(nt){let Et=j.texture.type,Ut=A.has(Et),Mt=St.getClearColor(),Lt=St.getClearAlpha(),{r:kt,g:ee,b:he}=Mt;if(Ut)R[0]=kt,R[1]=ee,R[2]=he,R[3]=Lt,K.clearBufferuiv(K.COLOR,0,R);else P[0]=kt,P[1]=ee,P[2]=he,P[3]=Lt,K.clearBufferiv(K.COLOR,0,P)}else et|=K.COLOR_BUFFER_BIT}if(Z)et|=K.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0);if(st)et|=K.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295);if(et!==0)K.clear(et)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(B){B.setRenderer(this),H=B},this.dispose=function(){p.removeEventListener("webglcontextlost",It,!1),p.removeEventListener("webglcontextrestored",Wt,!1),p.removeEventListener("webglcontextcreationerror",re,!1),St.dispose(),yt.dispose(),bt.dispose(),te.dispose(),Yt.dispose(),rn.dispose(),tt.dispose(),O.dispose(),vt.dispose(),Tt.dispose(),pt.dispose(),Ht.dispose(),Ht.removeEventListener("sessionstart",Rh),Ht.removeEventListener("sessionend",Ch),Bi.stop()};function It(B){B.preventDefault(),fr("WebGLRenderer: Context Lost."),W=!0}function Wt(){fr("WebGLRenderer: Context Restored."),W=!1;let B=Ne.autoReset,Z=ht.enabled,st=ht.autoUpdate,et=ht.needsUpdate,nt=ht.type;Vt(),Ne.autoReset=B,ht.enabled=Z,ht.autoUpdate=st,ht.needsUpdate=et,ht.type=nt}function re(B){$t("WebGLRenderer: A WebGL context could not be created. Reason: ",B.statusMessage)}function Pt(B){let Z=B.target;Z.removeEventListener("dispose",Pt),Te(Z)}function Te(B){$e(B),Yt.remove(B)}function $e(B){let Z=Yt.get(B).programs;if(Z!==void 0){if(Z.forEach(function(st){pt.releaseProgram(st)}),B.isShaderMaterial)pt.releaseShaderCache(B)}}this.renderBufferDirect=function(B,Z,st,et,nt,Et){if(Z===null)Z=ae;let Ut=nt.isMesh&&nt.matrixWorld.determinantAffine()<0,Mt=Wp(B,Z,st,et,nt);At.setMaterial(et,Ut);let Lt=st.index,kt=1;if(et.wireframe===!0){if(Lt=O.getWireframeAttribute(st),Lt===void 0)return;kt=2}let ee=st.drawRange,he=st.attributes.position,Ot=ee.start*kt,ue=(ee.start+ee.count)*kt;if(Et!==null)Ot=Math.max(Ot,Et.start*kt),ue=Math.min(ue,(Et.start+Et.count)*kt);if(Lt!==null)Ot=Math.max(Ot,0),ue=Math.min(ue,Lt.count);else if(he!==void 0&&he!==null)Ot=Math.max(Ot,0),ue=Math.min(ue,he.count);let ze=ue-Ot;if(ze<0||ze===1/0)return;vt.setup(nt,et,Mt,st,Lt);let De,Ce=ct;if(Lt!==null)De=V.get(Lt),Ce=lt,Ce.setIndex(De);if(nt.isMesh)if(et.wireframe===!0)At.setLineWidth(et.wireframeLinewidth*gn()),Ce.setMode(K.LINES);else Ce.setMode(K.TRIANGLES);else if(nt.isLine){let on=et.linewidth;if(on===void 0)on=1;if(At.setLineWidth(on*gn()),nt.isLineSegments)Ce.setMode(K.LINES);else if(nt.isLineLoop)Ce.setMode(K.LINE_LOOP);else Ce.setMode(K.LINE_STRIP)}else if(nt.isPoints)Ce.setMode(K.POINTS);else if(nt.isSprite)Ce.setMode(K.TRIANGLES);if(nt.isBatchedMesh)if(!Se.get("WEBGL_multi_draw")){let{_multiDrawStarts:on,_multiDrawCounts:Bt,_multiDrawCount:xn}=nt,_e=Lt?V.get(Lt).bytesPerElement:1,ki=Yt.get(et).currentProgram.getUniforms();for(let an=0;an<xn;an++)ki.setValue(K,"_gl_DrawID",an),Ce.render(on[an]/_e,Bt[an])}else Ce.renderMultiDraw(nt._multiDrawStarts,nt._multiDrawCounts,nt._multiDrawCount);else if(nt.isInstancedMesh)Ce.renderInstances(Ot,ze,nt.count);else if(st.isInstancedBufferGeometry){let on=st._maxInstanceCount!==void 0?st._maxInstanceCount:1/0,Bt=Math.min(st.instanceCount,on);Ce.renderInstances(Ot,ze,Bt)}else Ce.render(Ot,ze)};function Qn(B,Z,st,et){if(H!==null&&B.isNodeMaterial)H.setObject(et,B);if(pe===!0)at.setState(B,st,!1);if(B.transparent===!0&&B.side===Ln&&B.forceSinglePass===!1)B.side=dn,B.needsUpdate=!0,er(B,Z,et),B.side=ci,B.needsUpdate=!0,er(B,Z,et),B.side=Ln;else er(B,Z,et)}this.compile=function(B,Z,st=null){if(st===null)st=B;if(H!==null)H.renderStart(B,Z,st);if(U=bt.get(st),U.init(Z),I.push(U),st.traverseVisible(function(nt){if(nt.isLight&&nt.layers.test(Z.layers)){if(U.pushLight(nt),nt.castShadow)U.pushShadow(nt)}}),B!==st)B.traverseVisible(function(nt){if(nt.isLight&&nt.layers.test(Z.layers)){if(U.pushLight(nt),nt.castShadow)U.pushShadow(nt)}});if(U.setupLights(),H!==null)H.updateLights(U.state.lightsArray);if(ge=this.localClippingEnabled,pe=at.init(this.clippingPlanes,ge),pe===!0)at.setGlobalState(this.clippingPlanes,Z);if(H!==null)ht.render(U.state.shadowsArray,st,Z);let et=new Set;if(B.traverse(function(nt){if(!(nt.isMesh||nt.isPoints||nt.isLine||nt.isSprite))return;let Et=nt.material;if(Et)if(Array.isArray(Et))for(let Ut=0;Ut<Et.length;Ut++){let Mt=Et[Ut];Qn(Mt,st,Z,nt),et.add(Mt)}else Qn(Et,st,Z,nt),et.add(Et)}),U=I.pop(),H!==null)H.renderEnd();return et},this.compileAsync=function(B,Z,st=null){let et=this.compile(B,Z,st);return new Promise((nt)=>{function Et(){if(et.forEach(function(Ut){let Lt=Yt.get(Ut).currentProgram;if(Lt===void 0||Lt.isReady())et.delete(Ut)}),et.size===0){nt(B);return}setTimeout(Et,10)}if(Se.get("KHR_parallel_shader_compile")!==null)Et();else setTimeout(Et,10)})};let Fa=null;function Gp(B){if(Fa)Fa(B)}function Rh(){Bi.stop()}function Ch(){Bi.start()}let Bi=new gf;if(Bi.setAnimationLoop(Gp),typeof self<"u")Bi.setContext(self);this.setAnimationLoop=function(B){Fa=B,Ht.setAnimationLoop(B),B===null?Bi.stop():Bi.start()},Ht.addEventListener("sessionstart",Rh),Ht.addEventListener("sessionend",Ch),this.render=function(B,Z){if(Z!==void 0&&Z.isCamera!==!0){$t("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;if(H!==null)H.renderStart(B,Z);let st=Ht.enabled===!0&&Ht.isPresenting===!0,et=D!==null&&(j===null||st)&&D.begin(z,j);if(B.matrixWorldAutoUpdate===!0)B.updateMatrixWorld();if(Z.parent===null&&Z.matrixWorldAutoUpdate===!0)Z.updateMatrixWorld();if(Ht.enabled===!0&&Ht.isPresenting===!0&&(D===null||D.isCompositing()===!1)){if(Ht.cameraAutoUpdate===!0)Ht.updateCamera(Z);Z=Ht.getCamera()}if(B.isScene===!0)B.onBeforeRender(z,B,Z,j);if(U=bt.get(B,I.length),U.init(Z),U.state.textureUnits=te.getTextureUnits(),I.push(U),be.multiplyMatrices(Z.projectionMatrix,Z.matrixWorldInverse),Z.isArrayCamera)fe.setFromArrayCamera(Z);else qt.setFromProjectionMatrix(be,yc,Z.reversedDepth);if(ge=this.localClippingEnabled,pe=at.init(this.clippingPlanes,ge),L=yt.get(B,k.length),L.init(),k.push(L),this.info.render.frame++,Ht.enabled===!0&&Ht.isPresenting===!0){let Ut=z.xr.getDepthSensingMesh();if(Ut!==null)Oa(Ut,Z,-1/0,z.sortObjects)}if(Oa(B,Z,0,z.sortObjects),L.finish(),H!==null)H.updateLights(U.state.lightsArray);if(z.sortObjects===!0)L.sort(wt,jt);if(Re=Ht.enabled===!1||Ht.isPresenting===!1||Ht.hasDepthSensing()===!1,Re)St.addToRenderList(L,B);if(this.info.autoReset===!0)this.info.reset();if(pe===!0)at.beginShadows();let nt=U.state.shadowsArray;if(ht.render(nt,B,Z),pe===!0)at.endShadows();if((et&&D.hasRenderPass())===!1){let Ut=L.opaque,Mt=L.transmissive;if(U.setupLights(),Z.isArrayCamera){let Lt=Z.cameras;if(Mt.length>0)for(let kt=0,ee=Lt.length;kt<ee;kt++){let he=Lt[kt];Ph(Ut,Mt,B,he)}if(Re)St.render(B);for(let kt=0,ee=Lt.length;kt<ee;kt++){let he=Lt[kt];Ih(L,B,he,he.viewport)}}else{if(Mt.length>0)Ph(Ut,Mt,B,Z);if(Re)St.render(B);Ih(L,B,Z)}}if(j!==null&&it===0)te.updateMultisampleRenderTarget(j),te.updateRenderTargetMipmap(j);if(et)D.end(z);if(B.isScene===!0)B.onAfterRender(z,B,Z);if(vt.resetDefaultState(),_t=-1,rt=null,I.pop(),I.length>0){if(U=I[I.length-1],te.setTextureUnits(U.state.textureUnits),pe===!0)at.setGlobalState(z.clippingPlanes,U.state.camera)}else U=null;if(k.pop(),k.length>0)L=k[k.length-1];else L=null;if(H!==null)H.renderEnd()};function Oa(B,Z,st,et){if(B.visible===!1)return;if(B.layers.test(Z.layers)){if(B.isGroup)st=B.renderOrder;else if(B.isLOD){if(B.autoUpdate===!0)B.update(Z)}else if(B.isLight){if(U.pushLight(B),B.castShadow)U.pushShadow(B)}else if(B.isSprite){let Ut=Z.isArrayCamera?fe:qt;if(!B.frustumCulled||B.intersectsFrustum(Ut)){if(et)Gt.setFromMatrixPosition(B.matrixWorld).applyMatrix4(be);let Mt=tt.update(B),Lt=B.material;if(Lt.visible)L.push(B,Mt,Lt,st,Gt.z,null,Z)}}else if(B.isMesh||B.isLine||B.isPoints){let Ut=Z.isArrayCamera?fe:qt;if(!B.frustumCulled||B.intersectsFrustum(Ut)){let Mt=tt.update(B),Lt=B.material;if(et){if(B.boundingSphere!==void 0){if(B.boundingSphere===null)B.computeBoundingSphere();Gt.copy(B.boundingSphere.center)}else{if(Mt.boundingSphere===null)Mt.computeBoundingSphere();Gt.copy(Mt.boundingSphere.center)}Gt.applyMatrix4(B.matrixWorld).applyMatrix4(be)}if(Array.isArray(Lt)){let kt=Mt.groups;for(let ee=0,he=kt.length;ee<he;ee++){let Ot=kt[ee],ue=Lt[Ot.materialIndex];if(ue&&ue.visible)L.push(B,Mt,ue,st,Gt.z,Ot,Z)}}else if(Lt.visible)L.push(B,Mt,Lt,st,Gt.z,null,Z)}}}let Et=B.children;for(let Ut=0,Mt=Et.length;Ut<Mt;Ut++)Oa(Et[Ut],Z,st,et)}function Ih(B,Z,st,et){let{opaque:nt,transmissive:Et,transparent:Ut}=B;if(U.setupLightsView(st),pe===!0)at.setGlobalState(z.clippingPlanes,st);if(et)At.viewport(ut.copy(et));if(nt.length>0)Yr(nt,Z,st);if(Et.length>0)Yr(Et,Z,st);if(Ut.length>0)Yr(Ut,Z,st);At.buffers.depth.setTest(!0),At.buffers.depth.setMask(!0),At.buffers.color.setMask(!0),At.setPolygonOffset(!1)}function Ph(B,Z,st,et){if((st.isScene===!0?st.overrideMaterial:null)!==null)return;if(U.state.transmissionRenderTarget[et.id]===void 0){let Ot=Se.has("EXT_color_buffer_half_float")||Se.has("EXT_color_buffer_float");U.state.transmissionRenderTarget[et.id]=new Dn(1,1,{generateMipmaps:!0,type:Ot?Zn:Gn,minFilter:Hn,samples:Math.max(4,Ze.samples),stencilBuffer:_,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:le.workingColorSpace})}let Et=U.state.transmissionRenderTarget[et.id],Ut=et.viewport||ut;Et.setSize(Ut.z*z.transmissionResolutionScale,Ut.w*z.transmissionResolutionScale);let Mt=z.getRenderTarget(),Lt=z.getActiveCubeFace(),kt=z.getActiveMipmapLevel();if(z.setRenderTarget(Et),z.getClearColor(ot),ft=z.getClearAlpha(),ft<1)z.setClearColor(16777215,0.5);if(z.clear(),Re)St.render(st);let ee=z.toneMapping;z.toneMapping=Yn;let he=et.viewport;if(et.viewport!==void 0)et.viewport=void 0;if(U.setupLightsView(et),pe===!0)at.setGlobalState(z.clippingPlanes,et);if(Yr(B,st,et),te.updateMultisampleRenderTarget(Et),te.updateRenderTargetMipmap(Et),Se.has("WEBGL_multisampled_render_to_texture")===!1){let Ot=!1;for(let ue=0,ze=Z.length;ue<ze;ue++){let De=Z[ue],{object:Ce,geometry:on,material:Bt,group:xn}=De;if(Bt.side===Ln&&Ce.layers.test(et.layers)){let _e=Bt.side;Bt.side=dn,Bt.needsUpdate=!0,Lh(Ce,st,et,on,Bt,xn),Bt.side=_e,Bt.needsUpdate=!0,Ot=!0}}if(Ot===!0)te.updateMultisampleRenderTarget(Et),te.updateRenderTargetMipmap(Et)}if(z.setRenderTarget(Mt,Lt,kt),z.setClearColor(ot,ft),he!==void 0)et.viewport=he;z.toneMapping=ee}function Yr(B,Z,st){let et=Z.isScene===!0?Z.overrideMaterial:null;for(let nt=0,Et=B.length;nt<Et;nt++){let Ut=B[nt],{object:Mt,geometry:Lt,group:kt}=Ut,ee=Ut.material;if(ee.allowOverride===!0&&et!==null)ee=et;if(Mt.layers.test(st.layers))Lh(Mt,Z,st,Lt,ee,kt)}}function Lh(B,Z,st,et,nt,Et){if(H!==null&&nt.isNodeMaterial)H.setObject(B,nt);if(B.onBeforeRender(z,Z,st,et,nt,Et),B.modelViewMatrix.multiplyMatrices(st.matrixWorldInverse,B.matrixWorld),B.normalMatrix.getNormalMatrix(B.modelViewMatrix),nt.onBeforeRender(z,Z,st,et,B,Et),nt.transparent===!0&&nt.side===Ln&&nt.forceSinglePass===!1)nt.side=dn,nt.needsUpdate=!0,z.renderBufferDirect(st,Z,et,nt,B,Et),nt.side=ci,nt.needsUpdate=!0,z.renderBufferDirect(st,Z,et,nt,B,Et),nt.side=Ln;else z.renderBufferDirect(st,Z,et,nt,B,Et);B.onAfterRender(z,Z,st,et,nt,Et)}function Nh(B){let Z=0;for(let st of B)if(st.texture!==null)Z++;return Z}function er(B,Z,st){if(Z.isScene!==!0)Z=ae;let et=Yt.get(B),nt=U.state.lights,Et=U.state.shadowsArray,Ut=nt.state.version,Mt=pt.getParameters(B,nt.state,Et,Z,st,U.state.lightProbeGridArray),Lt=pt.getProgramCacheKey(Mt),kt=et.programs;et.environment=B.isMeshStandardMaterial||B.isMeshLambertMaterial||B.isMeshPhongMaterial?Z.environment:null,et.fog=Z.fog;let ee=B.isMeshStandardMaterial||B.isMeshLambertMaterial&&!B.envMap||B.isMeshPhongMaterial&&!B.envMap;if(et.envMap=rn.get(B.envMap||et.environment,ee),et.envMapRotation=et.environment!==null&&B.envMap===null?Z.environmentRotation:B.envMapRotation,kt===void 0)B.addEventListener("dispose",Pt),kt=new Map,et.programs=kt,et.programVariants=new Map;let he=kt.get(Lt);if(he!==void 0){if(et.currentProgram===he&&et.lightsStateVersion===Ut)return Uh(B,Mt),he}else{if(Mt.uniforms=pt.getUniforms(B),H!==null&&B.isNodeMaterial)H.build(B,st,Mt);B.onBeforeCompile(Mt,z),he=pt.acquireProgram(Mt,Lt),kt.set(Lt,he),et.uniforms=Mt.uniforms}let Ot=et.uniforms;if(!B.isShaderMaterial&&!B.isRawShaderMaterial||B.clipping===!0)Ot.clippingPlanes=at.uniform;if(Uh(B,Mt),et.needsLights=qp(B),et.lightsStateVersion=Ut,et.needsLights)Ot.ambientLightColor.value=nt.state.ambient,Ot.lightProbe.value=nt.state.probe,Ot.sunLights.value=nt.state.sun,Ot.sunLightShadows.value=nt.state.sunShadow,Ot.directionalLights.value=nt.state.directional,Ot.directionalLightShadows.value=nt.state.directionalShadow,Ot.spotLights.value=nt.state.spot,Ot.spotLightShadows.value=nt.state.spotShadow,Ot.rectAreaLights.value=nt.state.rectArea,Ot.ltc_1.value=nt.state.rectAreaLTC1,Ot.ltc_2.value=nt.state.rectAreaLTC2,Ot.pointLights.value=nt.state.point,Ot.pointLightShadows.value=nt.state.pointShadow,Ot.hemisphereLights.value=nt.state.hemi,Ot.sunShadowMatrix.value=nt.state.sunShadowMatrix,Ot.sunShadowCascade.value=nt.state.sunShadowCascade,Ot.directionalShadowMatrix.value=nt.state.directionalShadowMatrix,Ot.spotLightMatrix.value=nt.state.spotLightMatrix,Ot.spotLightMap.value=nt.state.spotLightMap,Ot.pointShadowMatrix.value=nt.state.pointShadowMatrix;return et.numLightProbeGrids=Nh(U.state.lightProbeGridArray),et.currentProgram=he,et.uniformsList=null,he}function Vp(B,Z,st,et,nt){let Et=Yt.get(B),Ut=Et.currentProgram.id+","+et+","+nt,Mt=Et.programVariants.get(Ut);if(Mt===void 0)Mt=er(B,Z,st),Et.programVariants.set(Ut,Mt);else Et.currentProgram=Mt,Et.uniformsList=null,Et.outputColorSpace=et,Et.toneMapping=nt;return Mt}function Dh(B){if(B.uniformsList===null){let Z=B.currentProgram.getUniforms();B.uniformsList=Dr.seqWithValue(Z.seq,B.uniforms)}return B.uniformsList}function Uh(B,Z){let st=Yt.get(B);st.outputColorSpace=Z.outputColorSpace,st.batching=Z.batching,st.batchingColor=Z.batchingColor,st.instancing=Z.instancing,st.instancingColor=Z.instancingColor,st.instancingMorph=Z.instancingMorph,st.skinning=Z.skinning,st.morphTargets=Z.morphTargets,st.morphNormals=Z.morphNormals,st.morphColors=Z.morphColors,st.morphTargetsCount=Z.morphTargetsCount,st.numClippingPlanes=Z.numClippingPlanes,st.numIntersection=Z.numClipIntersection,st.vertexAlphas=Z.vertexAlphas,st.vertexTangents=Z.vertexTangents,st.toneMapping=Z.toneMapping}function Wp(B,Z,st,et,nt){if(Z.isScene!==!0)Z=ae;te.resetTextureUnits();let Et=Z.fog,Ut=et.isMeshStandardMaterial||et.isMeshLambertMaterial||et.isMeshPhongMaterial?Z.environment:null,Mt=j===null?z.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:le.workingColorSpace,Lt=et.isMeshStandardMaterial||et.isMeshLambertMaterial&&!et.envMap||et.isMeshPhongMaterial&&!et.envMap,kt=rn.get(et.envMap||Ut,Lt),ee=et.vertexColors===!0&&!!st.attributes.color&&st.attributes.color.itemSize===4,he=!!st.attributes.tangent&&(!!et.normalMap||et.anisotropy>0),Ot=!!st.morphAttributes.position,ue=!!st.morphAttributes.normal,ze=!!st.morphAttributes.color,De=Yn;if(et.toneMapped){if(j===null||j.isXRRenderTarget===!0)De=z.toneMapping}let Ce=st.morphAttributes.position||st.morphAttributes.normal||st.morphAttributes.color,on=Ce!==void 0?Ce.length:0,Bt=Yt.get(et),xn=U.state.lights;if(pe===!0){if(ge===!0||B!==rt){let Oe=B===rt&&et.id===_t;at.setState(et,B,Oe)}}let _e=!1,ki=!1;if(et.version===Bt.__version){if(Bt.needsLights&&Bt.lightsStateVersion!==xn.state.version)_e=!0;else if(nt.isBatchedMesh&&Bt.batching===!1)_e=!0;else if(!nt.isBatchedMesh&&Bt.batching===!0)_e=!0;else if(nt.isBatchedMesh&&Bt.batchingColor===!0&&nt._colorsTexture===null)_e=!0;else if(nt.isBatchedMesh&&Bt.batchingColor===!1&&nt._colorsTexture!==null)_e=!0;else if(nt.isInstancedMesh&&Bt.instancing===!1)_e=!0;else if(!nt.isInstancedMesh&&Bt.instancing===!0)_e=!0;else if(nt.isSkinnedMesh&&Bt.skinning===!1)_e=!0;else if(!nt.isSkinnedMesh&&Bt.skinning===!0)_e=!0;else if(nt.isInstancedMesh&&Bt.instancingColor===!0&&nt.instanceColor===null)_e=!0;else if(nt.isInstancedMesh&&Bt.instancingColor===!1&&nt.instanceColor!==null)_e=!0;else if(nt.isInstancedMesh&&Bt.instancingMorph===!0&&nt.morphTexture===null)_e=!0;else if(nt.isInstancedMesh&&Bt.instancingMorph===!1&&nt.morphTexture!==null)_e=!0;else if(Bt.envMap!==kt)_e=!0;else if(et.fog===!0&&Bt.fog!==Et)_e=!0;else if(Bt.numClippingPlanes!==void 0&&(Bt.numClippingPlanes!==at.numPlanes||Bt.numIntersection!==at.numIntersection))_e=!0;else if(Bt.vertexAlphas!==ee)_e=!0;else if(Bt.vertexTangents!==he)_e=!0;else if(Bt.morphTargets!==Ot)_e=!0;else if(Bt.morphNormals!==ue)_e=!0;else if(Bt.morphColors!==ze)_e=!0;else if(Bt.morphTargetsCount!==on)_e=!0;else if(Bt.numLightProbeGrids!==Nh(U.state.lightProbeGridArray))_e=!0;else if(Bt.outputColorSpace!==Mt||Bt.toneMapping!==De)ki=!0}else _e=!0,Bt.__version=et.version;let an=Bt.currentProgram;if(_e===!0||ki===!0){if(an=ki===!0?Vp(et,Z,nt,Mt,De):er(et,Z,nt),H&&et.isNodeMaterial)H.onUpdateProgram(et,an,Bt)}let Zr=!1,_i=!1,zi=!1,me=an.getUniforms(),en=Bt.uniforms;if(At.useProgram(an.program))Zr=!0,_i=!0,zi=!0;if(et.id!==_t)_t=et.id,_i=!0;if(Zr||rt!==B){if(At.buffers.depth.getReversed()&&B.reversedDepth!==!0)B._reversedDepth=!0,B.updateProjectionMatrix();me.setValue(K,"projectionMatrix",B.projectionMatrix),me.setValue(K,"viewMatrix",B.matrixWorldInverse);let Je=me.map.cameraPosition;if(Je!==void 0)Je.setValue(K,gt.setFromMatrixPosition(B.matrixWorld));if(Ze.logarithmicDepthBuffer)me.setValue(K,"logDepthBufFC",2/(Math.log(B.far+1)/Math.LN2));if(et.isMeshPhongMaterial||et.isMeshToonMaterial||et.isMeshLambertMaterial||et.isMeshBasicMaterial||et.isMeshStandardMaterial||et.isShaderMaterial)me.setValue(K,"isOrthographic",B.isOrthographicCamera===!0);if(rt!==B)rt=B,_i=!0,zi=!0}if(Bt.needsLights){if(xn.state.sunShadowMap.length>0)me.setValue(K,"sunShadowMap",xn.state.sunShadowMap,te);if(xn.state.directionalShadowMap.length>0)me.setValue(K,"directionalShadowMap",xn.state.directionalShadowMap,te);if(xn.state.spotShadowMap.length>0)me.setValue(K,"spotShadowMap",xn.state.spotShadowMap,te);if(xn.state.pointShadowMap.length>0)me.setValue(K,"pointShadowMap",xn.state.pointShadowMap,te)}if(nt.isSkinnedMesh){me.setOptional(K,nt,"bindMatrix"),me.setOptional(K,nt,"bindMatrixInverse");let Oe=nt.skeleton;if(Oe){if(Oe.boneTexture===null)Oe.computeBoneTexture();me.setValue(K,"boneTexture",Oe.boneTexture,te)}}if(nt.isBatchedMesh){if(me.setOptional(K,nt,"batchingTexture"),me.setValue(K,"batchingTexture",nt._matricesTexture,te),me.setOptional(K,nt,"batchingIdTexture"),me.setValue(K,"batchingIdTexture",nt._indirectTexture,te),me.setOptional(K,nt,"batchingColorTexture"),nt._colorsTexture!==null)me.setValue(K,"batchingColorTexture",nt._colorsTexture,te)}let On=st.morphAttributes;if(On.position!==void 0||On.normal!==void 0||On.color!==void 0)Y.update(nt,st,an);if(_i||Bt.receiveShadow!==nt.receiveShadow)Bt.receiveShadow=nt.receiveShadow,me.setValue(K,"receiveShadow",nt.receiveShadow);if((et.isMeshStandardMaterial||et.isMeshLambertMaterial||et.isMeshPhongMaterial)&&et.envMap===null&&Z.environment!==null)en.envMapIntensity.value=Z.environmentIntensity;if(en.dfgLUT!==void 0)en.dfgLUT.value=jv();if(_i){if(me.setValue(K,"toneMappingExposure",z.toneMappingExposure),Bt.needsLights)Xp(en,zi);if(Et&&et.fog===!0)dt.refreshFogUniforms(en,Et);if(dt.refreshMaterialUniforms(en,et,Dt,zt,U.state.transmissionRenderTarget[B.id]),Bt.needsLights&&Bt.numLightProbeGrids>0){let Oe=F,Je=0;for(let ti of U.state.lightProbeGridArray){if(ti.texture===null)continue;Oe.textures[Je]=ti.texture,Oe.min[Je]=ti.boundingBox.min,Oe.max[Je]=ti.boundingBox.max,Oe.resolution[Je]=ti.resolution,Je++}for(let ti in Oe)Oe[ti].length=Je;en.probesSH.value=Oe.textures,en.probesMin.value=Oe.min,en.probesMax.value=Oe.max,en.probesResolution.value=Oe.resolution}Dr.upload(K,Dh(Bt),en,te)}if(et.isShaderMaterial&&et.uniformsNeedUpdate===!0)Dr.upload(K,Dh(Bt),en,te),et.uniformsNeedUpdate=!1;if(et.isSpriteMaterial)me.setValue(K,"center",nt.center);if(me.setValue(K,"modelViewMatrix",nt.modelViewMatrix),me.setValue(K,"normalMatrix",nt.normalMatrix),me.setValue(K,"modelMatrix",nt.matrixWorld),et.uniformsGroups!==void 0){let Oe=et.uniformsGroups;for(let Je=0,ti=Oe.length;Je<ti;Je++){let Oh=Oe[Je];Tt.update(Oh,an),Tt.bind(Oh,an)}}return an}function Xp(B,Z){B.ambientLightColor.needsUpdate=Z,B.lightProbe.needsUpdate=Z,B.sunLights.needsUpdate=Z,B.sunLightShadows.needsUpdate=Z,B.directionalLights.needsUpdate=Z,B.directionalLightShadows.needsUpdate=Z,B.pointLights.needsUpdate=Z,B.pointLightShadows.needsUpdate=Z,B.spotLights.needsUpdate=Z,B.spotLightShadows.needsUpdate=Z,B.rectAreaLights.needsUpdate=Z,B.hemisphereLights.needsUpdate=Z}function qp(B){return B.isMeshLambertMaterial||B.isMeshToonMaterial||B.isMeshPhongMaterial||B.isMeshStandardMaterial||B.isShadowMaterial||B.isShaderMaterial&&B.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return it},this.getRenderTarget=function(){return j},this.setRenderTargetTextures=function(B,Z,st){let et=Yt.get(B);if(et.__autoAllocateDepthBuffer=B.resolveDepthBuffer===!1,et.__autoAllocateDepthBuffer===!1)et.__useRenderToTexture=!1;Yt.get(B.texture).__webglTexture=Z,Yt.get(B.depthTexture).__webglTexture=et.__autoAllocateDepthBuffer?void 0:st,et.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(B,Z){let st=Yt.get(B);st.__webglFramebuffer=Z,st.__useDefaultFramebuffer=Z===void 0},this.setRenderTarget=function(B,Z=0,st=0){j=B,Q=Z,it=st;let et=null,nt=!1,Et=!1;if(B){let Mt=Yt.get(B);if(Mt.__useDefaultFramebuffer!==void 0){At.bindFramebuffer(K.FRAMEBUFFER,Mt.__webglFramebuffer),ut.copy(B.viewport),mt.copy(B.scissor),Nt=B.scissorTest,At.viewport(ut),At.scissor(mt),At.setScissorTest(Nt),_t=-1;return}else if(Mt.__webglFramebuffer===void 0)te.setupRenderTarget(B);else if(Mt.__hasExternalTextures)te.rebindTextures(B,Yt.get(B.texture).__webglTexture,Yt.get(B.depthTexture).__webglTexture);else if(B.depthBuffer){let ee=B.depthTexture;if(Mt.__boundDepthTexture!==ee){if(ee!==null&&Yt.has(ee)&&(B.width!==ee.image.width||B.height!==ee.image.height))throw Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(B)}}let Lt=B.texture;if(Lt.isData3DTexture||Lt.isDataArrayTexture||Lt.isCompressedArrayTexture)Et=!0;let kt=Yt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget){if(Array.isArray(kt[Z]))et=kt[Z][st];else et=kt[Z];nt=!0}else if(B.samples>0&&te.useMultisampledRTT(B)===!1)et=Yt.get(B).__webglMultisampledFramebuffer;else if(Array.isArray(kt))et=kt[st];else et=kt;ut.copy(B.viewport),mt.copy(B.scissor),Nt=B.scissorTest}else ut.copy(Qt).multiplyScalar(Dt).floor(),mt.copy(Ft).multiplyScalar(Dt).floor(),Nt=Zt;if(st!==0)et=X;if(At.bindFramebuffer(K.FRAMEBUFFER,et))At.drawBuffers(B,et);if(At.viewport(ut),At.scissor(mt),At.setScissorTest(Nt),nt){let Mt=Yt.get(B.texture);K.framebufferTexture2D(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_CUBE_MAP_POSITIVE_X+Z,Mt.__webglTexture,st)}else if(Et){let Mt=Z;for(let Lt=0;Lt<B.textures.length;Lt++){let kt=Yt.get(B.textures[Lt]);K.framebufferTextureLayer(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0+Lt,kt.__webglTexture,st,Mt)}}else if(B!==null&&st!==0){let Mt=Yt.get(B.texture);K.framebufferTexture2D(K.FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,Mt.__webglTexture,st)}_t=-1};function Fh(B){let Z=Yt.get(B);if(Z.__readFormat!==B.format||Z.__readType!==B.type)Z.__readFormat=B.format,Z.__readType=B.type,Z.__formatReadable=Ze.textureFormatReadable(B.format),Z.__typeReadable=Ze.textureTypeReadable(B.type);return Z}if(this.readRenderTargetPixels=function(B,Z,st,et,nt,Et,Ut,Mt=0){if(!(B&&B.isWebGLRenderTarget)){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Lt=Yt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget&&Ut!==void 0){if(Lt=Lt[Ut],Array.isArray(Lt))Lt=Lt[0]}if(Lt){At.bindFramebuffer(K.FRAMEBUFFER,Lt);try{let kt=B.textures[Mt],{format:ee,type:he}=kt;if(B.textures.length>1)K.readBuffer(K.COLOR_ATTACHMENT0+Mt);let Ot=Fh(kt);if(Ot.__formatReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ot.__typeReadable===!1){$t("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}if(Z>=0&&Z<=B.width-et&&(st>=0&&st<=B.height-nt))K.readPixels(Z,st,et,nt,xt.convert(ee),xt.convert(he),Et)}finally{let kt=j!==null?Yt.get(j).__webglFramebuffer:null;At.bindFramebuffer(K.FRAMEBUFFER,kt)}}},this.readRenderTargetPixelsAsync=async function(B,Z,st,et,nt,Et,Ut,Mt=0){if(!(B&&B.isWebGLRenderTarget))throw Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Lt=Yt.get(B).__webglFramebuffer;if(B.isWebGLCubeRenderTarget&&Ut!==void 0){if(Lt=Lt[Ut],Array.isArray(Lt))Lt=Lt[0]}if(Lt)if(Z>=0&&Z<=B.width-et&&(st>=0&&st<=B.height-nt)){At.bindFramebuffer(K.FRAMEBUFFER,Lt);let kt=B.textures[Mt],{format:ee,type:he}=kt;if(B.textures.length>1)K.readBuffer(K.COLOR_ATTACHMENT0+Mt);let Ot=Fh(kt);if(Ot.__formatReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ot.__typeReadable===!1)throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ue=K.createBuffer();K.bindBuffer(K.PIXEL_PACK_BUFFER,ue),K.bufferData(K.PIXEL_PACK_BUFFER,Et.byteLength,K.STREAM_READ),K.readPixels(Z,st,et,nt,xt.convert(ee),xt.convert(he),0),K.bindBuffer(K.PIXEL_PACK_BUFFER,null);let ze=j!==null?Yt.get(j).__webglFramebuffer:null;At.bindFramebuffer(K.FRAMEBUFFER,ze);let De=K.fenceSync(K.SYNC_GPU_COMMANDS_COMPLETE,0);return K.flush(),await Od(K,De,4),K.bindBuffer(K.PIXEL_PACK_BUFFER,ue),K.getBufferSubData(K.PIXEL_PACK_BUFFER,0,Et),K.bindBuffer(K.PIXEL_PACK_BUFFER,null),K.deleteBuffer(ue),K.deleteSync(De),Et}else throw Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(B,Z=null,st=0){let et=Math.pow(2,-st),nt=Math.floor(B.image.width*et),Et=Math.floor(B.image.height*et),Ut=Z!==null?Z.x:0,Mt=Z!==null?Z.y:0;te.setTexture2D(B,0),K.copyTexSubImage2D(K.TEXTURE_2D,st,0,0,Ut,Mt,nt,Et),At.unbindTexture()},this.copyTextureToTexture=function(B,Z,st=null,et=null,nt=0,Et=0){let Ut,Mt,Lt,kt,ee,he,Ot,ue,ze,De=B.isCompressedTexture?B.mipmaps[Et]:B.image;if(st!==null)Ut=st.max.x-st.min.x,Mt=st.max.y-st.min.y,Lt=st.isBox3?st.max.z-st.min.z:1,kt=st.min.x,ee=st.min.y,he=st.isBox3?st.min.z:0;else{let me=Math.pow(2,-nt);if(Ut=Math.floor(De.width*me),Mt=Math.floor(De.height*me),B.isDataArrayTexture)Lt=De.depth;else if(B.isData3DTexture)Lt=Math.floor(De.depth*me);else Lt=1;kt=0,ee=0,he=0}if(et!==null)Ot=et.x,ue=et.y,ze=et.z;else Ot=0,ue=0,ze=0;let Ce=xt.convert(Z.format),on=xt.convert(Z.type),Bt;if(Z.isData3DTexture)te.setTexture3D(Z,0),Bt=K.TEXTURE_3D;else if(Z.isDataArrayTexture||Z.isCompressedArrayTexture)te.setTexture2DArray(Z,0),Bt=K.TEXTURE_2D_ARRAY;else te.setTexture2D(Z,0),Bt=K.TEXTURE_2D;At.activeTexture(K.TEXTURE0),At.pixelStorei(K.UNPACK_FLIP_Y_WEBGL,Z.flipY),At.pixelStorei(K.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Z.premultiplyAlpha),At.pixelStorei(K.UNPACK_ALIGNMENT,Z.unpackAlignment);let xn=At.getParameter(K.UNPACK_ROW_LENGTH),_e=At.getParameter(K.UNPACK_IMAGE_HEIGHT),ki=At.getParameter(K.UNPACK_SKIP_PIXELS),an=At.getParameter(K.UNPACK_SKIP_ROWS),Zr=At.getParameter(K.UNPACK_SKIP_IMAGES);At.pixelStorei(K.UNPACK_ROW_LENGTH,De.width),At.pixelStorei(K.UNPACK_IMAGE_HEIGHT,De.height),At.pixelStorei(K.UNPACK_SKIP_PIXELS,kt),At.pixelStorei(K.UNPACK_SKIP_ROWS,ee),At.pixelStorei(K.UNPACK_SKIP_IMAGES,he);let _i=B.isDataArrayTexture||B.isData3DTexture,zi=Z.isDataArrayTexture||Z.isData3DTexture;if(B.isDepthTexture){let me=Yt.get(B),en=Yt.get(Z),On=Yt.get(me.__renderTarget),Oe=Yt.get(en.__renderTarget);At.bindFramebuffer(K.READ_FRAMEBUFFER,On.__webglFramebuffer),At.bindFramebuffer(K.DRAW_FRAMEBUFFER,Oe.__webglFramebuffer);for(let Je=0;Je<Lt;Je++){if(_i)K.framebufferTextureLayer(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,Yt.get(B).__webglTexture,nt,he+Je),K.framebufferTextureLayer(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,Yt.get(Z).__webglTexture,Et,ze+Je);K.blitFramebuffer(kt,ee,kt+Ut,ee+Mt,Ot,ue,Ot+Ut,ue+Mt,K.DEPTH_BUFFER_BIT,K.NEAREST)}At.bindFramebuffer(K.READ_FRAMEBUFFER,null),At.bindFramebuffer(K.DRAW_FRAMEBUFFER,null)}else if(nt!==0||B.isRenderTargetTexture||Yt.has(B)){let me=Yt.get(B),en=Yt.get(Z);At.bindFramebuffer(K.READ_FRAMEBUFFER,J),At.bindFramebuffer(K.DRAW_FRAMEBUFFER,G);for(let On=0;On<Lt;On++){if(_i)K.framebufferTextureLayer(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,me.__webglTexture,nt,he+On);else K.framebufferTexture2D(K.READ_FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,me.__webglTexture,nt);if(zi)K.framebufferTextureLayer(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,en.__webglTexture,Et,ze+On);else K.framebufferTexture2D(K.DRAW_FRAMEBUFFER,K.COLOR_ATTACHMENT0,K.TEXTURE_2D,en.__webglTexture,Et);if(nt!==0)K.blitFramebuffer(kt,ee,kt+Ut,ee+Mt,Ot,ue,Ot+Ut,ue+Mt,K.COLOR_BUFFER_BIT,K.NEAREST);else if(zi)K.copyTexSubImage3D(Bt,Et,Ot,ue,ze+On,kt,ee,Ut,Mt);else K.copyTexSubImage2D(Bt,Et,Ot,ue,kt,ee,Ut,Mt)}At.bindFramebuffer(K.READ_FRAMEBUFFER,null),At.bindFramebuffer(K.DRAW_FRAMEBUFFER,null)}else if(zi)if(B.isDataTexture||B.isData3DTexture)K.texSubImage3D(Bt,Et,Ot,ue,ze,Ut,Mt,Lt,Ce,on,De.data);else if(Z.isCompressedArrayTexture)K.compressedTexSubImage3D(Bt,Et,Ot,ue,ze,Ut,Mt,Lt,Ce,De.data);else K.texSubImage3D(Bt,Et,Ot,ue,ze,Ut,Mt,Lt,Ce,on,De);else if(B.isDataTexture)K.texSubImage2D(K.TEXTURE_2D,Et,Ot,ue,Ut,Mt,Ce,on,De.data);else if(B.isCompressedTexture)K.compressedTexSubImage2D(K.TEXTURE_2D,Et,Ot,ue,De.width,De.height,Ce,De.data);else K.texSubImage2D(K.TEXTURE_2D,Et,Ot,ue,Ut,Mt,Ce,on,De);if(At.pixelStorei(K.UNPACK_ROW_LENGTH,xn),At.pixelStorei(K.UNPACK_IMAGE_HEIGHT,_e),At.pixelStorei(K.UNPACK_SKIP_PIXELS,ki),At.pixelStorei(K.UNPACK_SKIP_ROWS,an),At.pixelStorei(K.UNPACK_SKIP_IMAGES,Zr),Et===0&&Z.generateMipmaps===!0&&Z.mipmapsAutoUpdate===!0)K.generateMipmap(Bt);At.unbindTexture()},this.initRenderTarget=function(B){if(Yt.get(B).__webglFramebuffer===void 0)te.setupRenderTarget(B)},this.initTexture=function(B){if(B.isCubeTexture)te.setTextureCube(B,0);else if(B.isData3DTexture)te.setTexture3D(B,0);else if(B.isDataArrayTexture||B.isCompressedArrayTexture)te.setTexture2DArray(B,0);else te.setTexture2D(B,0);At.unbindTexture()},this.resetState=function(){Q=0,it=0,j=null,At.reset(),vt.reset()},typeof __THREE_DEVTOOLS__<"u")__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yc}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(d){this._outputColorSpace=d;let p=this.getContext();p.drawingBufferColorSpace=le._getDrawingBufferColorSpace(d),p.unpackColorSpace=le._getUnpackColorSpace()}}class Qc extends Jo{constructor(d){super(d)}parse(d,p){let m={mipmaps:[],width:0,height:0,format:null,mipmapCount:1,isCubemap:!1},g=542327876,_=131072,x=512,v=1024,y=2048,S=4096,M=8192,E=16384,T=32768,b=95,w=96;function C(Ft){return Ft.charCodeAt(0)+(Ft.charCodeAt(1)<<8)+(Ft.charCodeAt(2)<<16)+(Ft.charCodeAt(3)<<24)}function N(Ft){return String.fromCharCode(Ft&255,Ft>>8&255,Ft>>16&255,Ft>>24&255)}function A(Ft,Zt,qt,fe){let pe=qt*fe*4,ge=new Uint8Array(Ft,Zt,pe),be=new Uint8Array(pe),gt=0,Gt=0;for(let ae=0;ae<fe;ae++)for(let Re=0;Re<qt;Re++){let gn=ge[Gt];Gt++;let K=ge[Gt];Gt++;let _n=ge[Gt];Gt++;let Se=ge[Gt];Gt++,be[gt]=_n,gt++,be[gt]=K,gt++,be[gt]=gn,gt++,be[gt]=Se,gt++}return be}function R(Ft,Zt,qt,fe){let pe=qt*fe*3,ge=new Uint8Array(Ft,Zt,pe),be=new Uint8Array(qt*fe*4),gt=0,Gt=0;for(let ae=0;ae<fe;ae++)for(let Re=0;Re<qt;Re++){let gn=ge[Gt];Gt++;let K=ge[Gt];Gt++;let _n=ge[Gt];Gt++,be[gt]=_n,gt++,be[gt]=K,gt++,be[gt]=gn,gt++,be[gt]=255,gt++}return be}let P=C("DXT1"),F=C("DXT3"),L=C("DXT5"),U=C("ETC1"),k=C("DX10"),I=31,D=5,z=0,W=1,H=2,X=3,J=4,G=7,Q=21,it=22,j=23,_t=24,rt=25,ut=26,mt=28,Nt=0,ot=new Int32Array(d,0,I);if(ot[z]!==542327876)return console.error("THREE.DDSLoader.parse: Invalid magic number in DDS header."),m;let ft,Ct=ot[Q],zt=!1,Dt=!1,wt=ot[W]+4;switch(Ct){case P:ft=8,m.format=Ds;break;case F:ft=16,m.format=Us;break;case L:ft=16,m.format=Fs;break;case U:ft=8,m.format=vr;break;case k:wt+=D*4;let Zt=new Int32Array(d,(I+1)*4,D)[Nt];switch(Zt){case 96:{ft=16,m.format=yr;break}case 95:{ft=16,m.format=Sr;break}default:return console.error("THREE.DDSLoader.parse: Unsupported DXGI_FORMAT code ",Zt),m}break;default:if(ot[it]===32&&ot[j]&16711680&&ot[_t]&65280&&ot[rt]&255&&ot[ut]&4278190080)zt=!0,ft=64,m.format=Nn;else if(ot[it]===24&&ot[j]&16711680&&ot[_t]&65280&&ot[rt]&255)Dt=!0,ft=64,m.format=Nn;else return console.error("THREE.DDSLoader.parse: Unsupported FourCC code ",N(Ct)),m}if(m.mipmapCount=1,ot[H]&131072&&p!==!1)m.mipmapCount=Math.max(1,ot[G]);let jt=ot[mt];if(m.isCubemap=jt&512?!0:!1,m.isCubemap&&(!(jt&1024)||!(jt&2048)||!(jt&4096)||!(jt&8192)||!(jt&16384)||!(jt&32768)))return console.error("THREE.DDSLoader.parse: Incomplete cubemap faces"),m;m.width=ot[J],m.height=ot[X];let Qt=m.isCubemap?6:1;for(let Ft=0;Ft<Qt;Ft++){let{width:Zt,height:qt}=m;for(let fe=0;fe<m.mipmapCount;fe++){let pe,ge;if(zt)pe=A(d,wt,Zt,qt),ge=pe.length;else if(Dt)pe=R(d,wt,Zt,qt),ge=Zt*qt*3;else ge=Math.ceil(Zt/4)*Math.ceil(qt/4)*ft,pe=new Uint8Array(d,wt,ge);let be={data:pe,width:Zt,height:qt};m.mipmaps.push(be),wt+=ge,Zt=Math.max(Zt>>1,1),qt=Math.max(qt>>1,1)}}return m}}var Df=0,Uf=1,Ff=2;var th=2;var ha=1.25,eh=1,tn=32,we=8,ua=65535;var ks=Math.pow(2,-24),Fr=Symbol("SKIP_GENERATION"),da={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[Fr]:!1};function Pe(d,p,m){return m.min.x=p[d],m.min.y=p[d+1],m.min.z=p[d+2],m.max.x=p[d+3],m.max.y=p[d+4],m.max.z=p[d+5],m}function Or(d){let p=-1,m=-1/0;for(let g=0;g<3;g++){let _=d[g+3]-d[g];if(_>m)m=_,p=g}return p}function nh(d,p,m){for(let g=0;g<3;g++){let _=p[d+2*g],x=p[d+2*g+1],v=_-x,y=_+x;if(v<m[g])m[g]=v;if(y>m[g+3])m[g+3]=y}}function fa(d){let p=d[3]-d[0],m=d[4]-d[1],g=d[5]-d[2];return 2*(p*m+m*g+g*p)}function de(d,p){return p[d+15]===ua}function Me(d,p){return p[d+6]}function Ae(d,p){return p[d+14]}function ve(d){return d+we}function ye(d,p){let m=p[d+6];return d+m*we}function zs(d,p){return p[d+7]}function Fe(d){return d}function pa(d,p,m,g,_){let x=1/0,v=1/0,y=1/0,S=-1/0,M=-1/0,E=-1/0,T=1/0,b=1/0,w=1/0,C=-1/0,N=-1/0,A=-1/0,R=d.offset||0;for(let P=(p-R)*6,F=(p+m-R)*6;P<F;P+=6){let L=d[P+0],U=d[P+1],k=L-U,I=L+U;if(k<x)x=k;if(I>S)S=I;if(L<T)T=L;if(L>C)C=L;let D=d[P+2],z=d[P+3],W=D-z,H=D+z;if(W<v)v=W;if(H>M)M=H;if(D<b)b=D;if(D>N)N=D;let X=d[P+4],J=d[P+5],G=X-J,Q=X+J;if(G<y)y=G;if(Q>E)E=Q;if(X<w)w=X;if(X>A)A=X}g[0]=x,g[1]=v,g[2]=y,g[3]=S,g[4]=M,g[5]=E,_[0]=T,_[1]=b,_[2]=w,_[3]=C,_[4]=N,_[5]=A}var jn=8,sh=8,ih=new Int32Array(jn),Kn=new Float32Array(jn*6),Hs=new Float32Array(jn*6),Vn=new Float32Array(6),ma=new Float32Array(6),Di=new Int32Array(sh),Of=new Float32Array(sh*6);function ty(d,p,m,g){for(let _=0;_<3;_++){let x=p[d+2*_],v=p[d+2*_+1],y=x-v,S=x+v;if(y<m[g+_])m[g+_]=y;if(S>m[g+_+3])m[g+_+3]=S}}function Bf(d,p){let m=d[p+3]-d[p],g=d[p+4]-d[p+1],_=d[p+5]-d[p+2];return 2*(m*g+g*_+_*m)}function kf(d,p,m,g,_,x){let v=-1,y=0;if(x===Df){if(v=Or(p),v!==-1)y=(p[v]+p[v+3])/2}else if(x===Uf){if(v=Or(d),v!==-1)y=ey(m,g,_,v)}else if(x===Ff){let S=fa(d),M=ha*_,E=m.offset||0,T=(g-E)*6,b=(g+_-E)*6;for(let w=0;w<3;w++){let C=p[w],R=(p[w+3]-C)/jn;if(_<sh){for(let P=0;P<_;P++){let F=T+P*6,L=m[F+2*w],U=P;while(U>0&&m[Di[U-1]+2*w]>L)Di[U]=Di[U-1],U--;Di[U]=F}for(let P=0;P<3;P++)Vn[P]=1/0,Vn[P+3]=-1/0,ma[P]=1/0,ma[P+3]=-1/0;for(let P=_-1;P>=0;P--)nh(Di[P],m,ma),Of.set(ma,P*6);for(let P=0;P<_-1;P++){nh(Di[P],m,Vn);let F=m[Di[P+1]+2*w];if(m[Di[P]+2*w]===F)continue;let L=P+1,U=_-L,k=fa(Vn)/S,I=Bf(Of,L*6)/S,D=eh+ha*(k*L+I*U);if(D<M)v=w,M=D,y=F}}else{for(let L=0;L<jn;L++){ih[L]=0;for(let U=0;U<3;U++)Kn[L*6+U]=1/0,Kn[L*6+U+3]=-1/0}for(let L=T;L<b;L+=6){let I=~~((m[L+2*w]-C)/R);if(I>=jn)I=jn-1;ih[I]++,ty(L,m,Kn,I*6)}let P=(jn-1)*6;for(let L=0;L<6;L++)Hs[P+L]=Kn[P+L];for(let L=jn-2;L>=0;L--){let U=L*6,k=U+6;for(let I=0;I<3;I++)Hs[U+I]=Math.min(Kn[U+I],Hs[k+I]),Hs[U+I+3]=Math.max(Kn[U+I+3],Hs[k+I+3])}let F=0;for(let L=0;L<jn-1;L++){let U=L*6,k=ih[L];if(k!==0)for(let H=0;H<3;H++)if(F===0)Vn[H]=Kn[U+H],Vn[H+3]=Kn[U+H+3];else Vn[H]=Math.min(Vn[H],Kn[U+H]),Vn[H+3]=Math.max(Vn[H+3],Kn[U+H+3]);F+=k;let I=0,D=0;if(F!==0)I=fa(Vn)/S;let z=_-F;if(z!==0)D=Bf(Hs,U+6)/S;let W=eh+ha*(I*F+D*z);if(W<M)v=w,M=W,y=C+R+L*R}}}}else console.warn(`BVH: Invalid build strategy value ${x} used.`);return{axis:v,pos:y}}function ey(d,p,m,g){let _=0,x=d.offset;for(let v=p,y=p+m;v<y;v++)_+=d[(v-x)*6+g*2];return _/m}function zf(d,p,m,g,_,x){let v=g,y=g+_-1,S=x.pos,M=x.axis*2,E=m.offset||0;while(!0){while(v<=y&&m[(v-E)*6+M]<S)v++;while(v<=y&&m[(y-E)*6+M]>=S)y--;if(v<y){for(let T=0;T<p;T++){let b=d[v*p+T];d[v*p+T]=d[y*p+T],d[y*p+T]=b}for(let T=0;T<6;T++){let b=v-E,w=y-E,C=m[b*6+T];m[b*6+T]=m[w*6+T],m[w*6+T]=C}v++,y--}else return v}}var ny=Math.pow(2,32),Gs=new Float32Array(6),ga=new Float32Array(6);function iy(d,p,m,g,_,x){let{maxDepth:v,verbose:y,targetLeafSize:S,_strictLeafSize:M=1/0,strategy:E,onProgress:T,useSharedArrayBuffer:b=!1}=_,{primitiveBuffer:w,primitiveBufferStride:C}=d,A=new(b?SharedArrayBuffer:ArrayBuffer)(tn*Math.max(1,2*Math.ceil(g)-1)),R=new Float32Array(A),P=new Uint32Array(A),F=new Uint16Array(A),L=0,U=!1;return pa(p,m,g,Gs,ga),D(m,g,0),A.slice(0,L*tn);function k(z){if(T)T((z-x.offset)/x.count)}function I(z,W,H){let X=z*2;P[z+6]=W,F[X+14]=H,F[X+15]=ua,k(W+H)}function D(z,W,H){let X=L++,J=X*we;if(R.set(Gs,J),!U&&H>=v){if(U=!0,y)console.warn(`BVH: Max depth of ${v} reached when generating BVH. Consider increasing maxDepth.`)}let G=W>M;if(W<=S&&!G||H>=v){I(J,z,W);return}let Q=kf(Gs,ga,p,z,W,E),it=Q.axis===-1?-1:zf(w,C,p,z,W,Q);if(Q.axis===-1||it===z||it===z+W){if(!G){I(J,z,W);return}Q.axis=Math.max(0,Or(Gs)),it=z+Math.max(1,Math.floor(W/2))}P[J+7]=Q.axis;let j=it-z;pa(p,z,j,Gs,ga),D(z,j,H+1);let _t=L-X;if(_t>ny)throw Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");P[J+6]=_t;let rt=W-j;pa(p,it,rt,Gs,ga),D(it,rt,H+1)}}function Hf(d,p){let m=d.getRootRanges(p.range),g=m[0],_=m[m.length-1],x={offset:g.offset,count:_.offset+_.count-g.offset},v=new Float32Array(6*x.count);v.offset=x.offset,d.computePrimitiveBounds(x.offset,x.count,v),d._roots=m.map((y)=>iy(d,v,y.offset,y.count,p,x))}class ss{constructor(d){this._getNewPrimitive=d,this._primitives=[]}getPrimitive(){let d=this._primitives;if(d.length===0)return this._getNewPrimitive();else return d.pop()}releasePrimitive(d){this._primitives.push(d)}}class Gf{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let d=[],p=null;this.setBuffer=(m)=>{if(p)d.push(p);p=m,this.float32Array=new Float32Array(m),this.uint16Array=new Uint16Array(m),this.uint32Array=new Uint32Array(m)},this.clearBuffer=()=>{if(p=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,d.length!==0)this.setBuffer(d.pop())}}}var ce=new Gf;var Ui,Ws,Vs=[],_a=new ss(()=>new xe);function Vf(d,p,m,g,_,x){Ui=_a.getPrimitive(),Ws=_a.getPrimitive(),Vs.push(Ui,Ws),ce.setBuffer(d._roots[p]);let v=rh(0,d.geometry,m,g,_,x);ce.clearBuffer(),_a.releasePrimitive(Ui),_a.releasePrimitive(Ws),Vs.pop(),Vs.pop();let y=Vs.length;if(y>0)Ws=Vs[y-1],Ui=Vs[y-2];return v}function rh(d,p,m,g,_=null,x=0,v=0){let{float32Array:y,uint16Array:S,uint32Array:M}=ce,E=d*2;if(de(E,S)){let b=Me(d,M),w=Ae(E,S);return Pe(Fe(d),y,Ui),g(b,w,!1,v,x+d/we,Ui)}else{let W=function(X){let{uint16Array:J,uint32Array:G}=ce,Q=X*2;while(!de(Q,J))X=ve(X),Q=X*2;return Me(X,G)},H=function(X){let{uint16Array:J,uint32Array:G}=ce,Q=X*2;while(!de(Q,J))X=ye(X,G),Q=X*2;return Me(X,G)+Ae(Q,J)},b=ve(d),w=ye(d,M),C=b,N=w,A,R,P,F;if(_){if(P=Ui,F=Ws,Pe(Fe(C),y,P),Pe(Fe(N),y,F),A=_(P),R=_(F),R<A){C=w,N=b;let X=A;A=R,R=X,P=F}}if(!P)P=Ui,Pe(Fe(C),y,P);let L=de(C*2,S),U=m(P,L,A,v+1,x+C/we),k;if(U===th){let X=W(C),G=H(C)-X;k=g(X,G,!0,v+1,x+C/we,P)}else k=U&&rh(C,p,m,g,_,x,v+1);if(k)return!0;F=Ws,Pe(Fe(N),y,F);let I=de(N*2,S),D=m(F,I,R,v+1,x+N/we),z;if(D===th){let X=W(N),G=H(N)-X;z=g(X,G,!0,v+1,x+N/we,F)}else z=D&&rh(N,p,m,g,_,x,v+1);if(z)return!0;return!1}}var Br=new ce.constructor,xa=new ce.constructor,Fi=new ss(()=>new xe),Xs=new xe,qs=new xe,oh=new xe,ah=new xe,lh=!1;function Wf(d,p,m,g){if(lh)throw Error("MeshBVH: Recursive calls to bvhcast not supported.");lh=!0;let _=d._roots,x=p._roots,v,y=0,S=0,M=new ie().copy(m).invert();for(let E=0,T=_.length;E<T;E++){Br.setBuffer(_[E]),S=0;let b=Fi.getPrimitive();Pe(Fe(0),Br.float32Array,b),b.applyMatrix4(M);for(let w=0,C=x.length;w<C;w++)if(xa.setBuffer(x[w]),v=Wn(0,0,m,M,g,y,S,0,0,b),xa.clearBuffer(),S+=x[w].byteLength/tn,v)break;if(Fi.releasePrimitive(b),Br.clearBuffer(),y+=_[E].byteLength/tn,v)break}return lh=!1,v}function Wn(d,p,m,g,_,x=0,v=0,y=0,S=0,M=null,E=!1){let T,b;if(E)T=xa,b=Br;else T=Br,b=xa;let w=T.float32Array,C=T.uint32Array,N=T.uint16Array,A=b.float32Array,R=b.uint32Array,P=b.uint16Array,F=d*2,L=p*2,U=de(F,N),k=de(L,P),I=!1;if(k&&U)if(E)I=_(Me(p,R),Ae(p*2,P),Me(d,C),Ae(d*2,N),S,v+p/we,y,x+d/we);else I=_(Me(d,C),Ae(d*2,N),Me(p,R),Ae(p*2,P),y,x+d/we,S,v+p/we);else if(k){let D=Fi.getPrimitive();Pe(Fe(p),A,D),D.applyMatrix4(m);let z=ve(d),W=ye(d,C);Pe(Fe(z),w,Xs),Pe(Fe(W),w,qs);let H=D.intersectsBox(Xs),X=D.intersectsBox(qs);I=H&&Wn(p,z,g,m,_,v,x,S,y+1,D,!E)||X&&Wn(p,W,g,m,_,v,x,S,y+1,D,!E),Fi.releasePrimitive(D)}else{let D=ve(p),z=ye(p,R);Pe(Fe(D),A,oh),Pe(Fe(z),A,ah);let W=M.intersectsBox(oh),H=M.intersectsBox(ah);if(W&&H)I=Wn(d,D,m,g,_,x,v,y,S+1,M,E)||Wn(d,z,m,g,_,x,v,y,S+1,M,E);else if(W)if(U)I=Wn(d,D,m,g,_,x,v,y,S+1,M,E);else{let X=Fi.getPrimitive();X.copy(oh).applyMatrix4(m);let J=ve(d),G=ye(d,C);Pe(Fe(J),w,Xs),Pe(Fe(G),w,qs);let Q=X.intersectsBox(Xs),it=X.intersectsBox(qs);I=Q&&Wn(D,J,g,m,_,v,x,S,y+1,X,!E)||it&&Wn(D,G,g,m,_,v,x,S,y+1,X,!E),Fi.releasePrimitive(X)}else if(H)if(U)I=Wn(d,z,m,g,_,x,v,y,S+1,M,E);else{let X=Fi.getPrimitive();X.copy(ah).applyMatrix4(m);let J=ve(d),G=ye(d,C);Pe(Fe(J),w,Xs),Pe(Fe(G),w,qs);let Q=X.intersectsBox(Xs),it=X.intersectsBox(qs);I=Q&&Wn(z,J,g,m,_,v,x,S,y+1,X,!E)||it&&Wn(z,G,g,m,_,v,x,S,y+1,X,!E),Fi.releasePrimitive(X)}}return I}var va=new class{constructor(){let d=null,p=null,m=null,g=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(x,v)=>{if(g)throw Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=v,this.buffer=d=x._roots[v],this.uint16Array=m=new Uint16Array(d),this.uint32Array=p=new Uint32Array(d)},this.reset=()=>{this.root=null,this.buffer=d=null,this.uint16Array=m=null,this.uint32Array=p=null},this.getRangeStart=(x)=>{let v=x*2;while(!de(v,m))x=ve(x),v=x*2;return Me(x,p)},this.getRangeEnd=(x)=>{let v=x*2;while(!de(v,m))x=ye(x,p),v=x*2;return Me(x,p)+Ae(v,m)};let _=(x,v,y)=>{let S=v*2,M=de(S,m);if(!x(y,M,v)&&!M){let T=ve(v),b=ye(v,p);_(x,T,y+1),_(x,b,y+1)}};this.traverseBuffer=(x)=>{if(g)throw Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");g=!0;try{_(x,0,0)}finally{g=!1}},this.traverse=(x)=>{this.traverseBuffer((v,y,S)=>{if(y){let M=S*2,E=p[S+6],T=m[M+14];return x(v,y,new Float32Array(d,S*4,6),E,T)}else{let M=zs(S,p);return x(v,y,new Float32Array(d,S*4,6),M)}})}}};var Xf=new xe,Ys=new Float32Array(6);class ch{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(d){if(d={...da,...d},"maxLeafSize"in d)console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),d={...d,targetLeafSize:d.maxLeafSize};Hf(this,d)}getRootRanges(){throw Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(d,p,m,g){let _=1/0,x=1/0,v=1/0,y=-1/0,S=-1/0,M=-1/0;for(let E=d,T=d+p;E<T;E++){this.writePrimitiveBounds(E,Ys,0);let[b,w,C,N,A,R]=Ys;if(b<_)_=b;if(N>y)y=N;if(w<x)x=w;if(A>S)S=A;if(C<v)v=C;if(R>M)M=R}return m[g+0]=_,m[g+1]=x,m[g+2]=v,m[g+3]=y,m[g+4]=S,m[g+5]=M,m}computePrimitiveBounds(d,p,m){let g=m.offset||0;for(let _=d,x=d+p;_<x;_++){this.writePrimitiveBounds(_,Ys,0);let[v,y,S,M,E,T]=Ys,b=(v+M)/2,w=(y+E)/2,C=(S+T)/2,N=(M-v)/2,A=(E-y)/2,R=(T-S)/2,P=(_-g)*6;m[P+0]=b,m[P+1]=N+(Math.abs(b)+N)*ks,m[P+2]=w,m[P+3]=A+(Math.abs(w)+A)*ks,m[P+4]=C,m[P+5]=R+(Math.abs(C)+R)*ks}return m}shiftPrimitiveOffsets(d){let p=this._indirectBuffer;if(p)for(let m=0,g=p.length;m<g;m++)p[m]+=d;else{let m=this._roots;for(let g=0;g<m.length;g++){let _=m[g],x=new Uint32Array(_),v=new Uint16Array(_),y=_.byteLength/tn;for(let S=0;S<y;S++){let M=we*S,E=2*M;if(de(E,v))x[M+6]+=d}}}}traverse(d,p=0){va.setBVH(this,p),va.traverse(d),va.reset()}refit(){let d=this._roots;for(let p=0,m=d.length;p<m;p++){let g=d[p],_=new Uint32Array(g),x=new Uint16Array(g),v=new Float32Array(g),y=g.byteLength/tn;for(let S=y-1;S>=0;S--){let M=S*we,E=M*2;if(de(E,x)){let b=Me(M,_),w=Ae(E,x);this.writePrimitiveRangeBounds(b,w,Ys,0),v.set(Ys,M)}else{let b=ve(M),w=ye(M,_);for(let C=0;C<3;C++){let N=v[b+C],A=v[b+C+3],R=v[w+C],P=v[w+C+3];v[M+C]=N<R?N:R,v[M+C+3]=A>P?A:P}}}}}getBoundingBox(d){return d.makeEmpty(),this._roots.forEach((m)=>{Pe(0,new Float32Array(m),Xf),d.union(Xf)}),d}shapecast(d){let{boundsTraverseOrder:p,intersectsBounds:m,intersectsRange:g,intersectsPrimitive:_,scratchPrimitive:x,iterate:v}=d;if(g&&_){let E=g;g=(T,b,w,C,N)=>{if(!E(T,b,w,C,N))return v(T,b,this,_,w,C,x);return!0}}else if(!g)if(_)g=(E,T,b,w)=>v(E,T,this,_,b,w,x);else g=(E,T,b)=>b;let y=!1,S=0,M=this._roots;for(let E=0,T=M.length;E<T;E++){let b=M[E];if(y=Vf(this,E,m,g,p,S),y)break;S+=b.byteLength/tn}return y}bvhcast(d,p,m){let{intersectsRanges:g}=m;return Wf(this,d,p,g)}}function qf(){return typeof SharedArrayBuffer<"u"}function hh(d){return d.index?d.index.count:d.attributes.position.count}function Oi(d){return hh(d)/3}function sy(d,p=ArrayBuffer){if(d>65535)return new Uint32Array(new p(4*d));else return new Uint16Array(new p(2*d))}function Yf(d,p){if(!d.index){let m=d.attributes.position.count,g=p.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,_=sy(m,g);d.setIndex(new Ve(_,1));for(let x=0;x<m;x++)_[x]=x}}function ry(d,p,m){let g=hh(d)/m,_=p?p:d.drawRange,x=_.start/m,v=(_.start+_.count)/m,y=Math.max(0,x),S=Math.min(g,v)-y;return{offset:Math.floor(y),count:Math.floor(S)}}function oy(d,p){return d.groups.map((m)=>({offset:m.start/p,count:m.count/p}))}function uh(d,p,m){let g=ry(d,p,m),_=oy(d,m);if(!_.length)return[g];let x=[],v=g.offset,y=g.offset+g.count,S=hh(d)/m,M=[];for(let b of _){let{offset:w,count:C}=b,N=w,A=isFinite(C)?C:S-w,R=w+A;if(N<y&&R>v)M.push({pos:Math.max(v,N),isStart:!0}),M.push({pos:Math.min(y,R),isStart:!1})}M.sort((b,w)=>{if(b.pos!==w.pos)return b.pos-w.pos;else return b.type==="end"?-1:1});let E=0,T=null;for(let b of M){let w=b.pos;if(E!==0&&w!==T)x.push({offset:T,count:w-T});E+=b.isStart?1:-1,T=w}return x}function ay(d,p){let m=d[d.length-1],g=m.offset+m.count>65536,_=d.reduce((M,E)=>M+E.count,0),x=g?4:2,v=p?new SharedArrayBuffer(_*x):new ArrayBuffer(_*x),y=g?new Uint32Array(v):new Uint16Array(v),S=0;for(let M=0;M<d.length;M++){let{offset:E,count:T}=d[M];for(let b=0;b<T;b++)y[S+b]=E+b;S+=T}return y}class dh extends ch{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(d){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(d){}constructor(d,p={}){if(!d.isBufferGeometry)throw Error("BVH: Only BufferGeometries are supported.");else if(d.index&&d.index.isInterleavedBufferAttribute)throw Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.");if(p.useSharedArrayBuffer&&!qf())throw Error("BVH: SharedArrayBuffer is not available.");super();if(this.geometry=d,this.resolvePrimitiveIndex=p.indirect?(m)=>this._indirectBuffer[m]:(m)=>m,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,p={...da,...p},!p[Fr])this.init(p)}init(d){let{geometry:p,primitiveStride:m}=this;if(d.indirect){let g=uh(p,d.range,m),_=ay(g,d.useSharedArrayBuffer);this._indirectBuffer=_}else Yf(p,d);if(super.init(d),!p.boundingBox&&d.setBoundingBox)p.boundingBox=this.getBoundingBox(new xe)}getRootRanges(d){if(this.indirect)return[{offset:0,count:this._indirectBuffer.length}];else return uh(this.geometry,d,this.primitiveStride)}raycastObject3D(){throw Error("BVH: raycastObject3D() not implemented")}}class In{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(d,p){let m=1/0,g=-1/0;for(let _=0,x=d.length;_<x;_++){let y=d[_][p];m=y<m?y:m,g=y>g?y:g}this.min=m,this.max=g}setFromPoints(d,p){let m=1/0,g=-1/0;for(let _=0,x=p.length;_<x;_++){let v=p[_],y=d.dot(v);m=y<m?y:m,g=y>g?y:g}this.min=m,this.max=g}isSeparated(d){return this.min>d.max||d.min>this.max}}In.prototype.setFromBox=function(){let d=new q;return function(m,g){let{min:_,max:x}=g,v=1/0,y=-1/0;for(let S=0;S<=1;S++)for(let M=0;M<=1;M++)for(let E=0;E<=1;E++){d.x=_.x*S+x.x*(1-S),d.y=_.y*M+x.y*(1-M),d.z=_.z*E+x.z*(1-E);let T=m.dot(d);v=Math.min(T,v),y=Math.max(T,y)}this.min=v,this.max=y}}();var Mw=function(){let d=new In;return function(m,g){let{points:_,satAxes:x,satBounds:v}=m,{points:y,satAxes:S,satBounds:M}=g;for(let E=0;E<3;E++){let T=v[E],b=x[E];if(d.setFromPoints(b,y),T.isSeparated(d))return!1}for(let E=0;E<3;E++){let T=M[E],b=S[E];if(d.setFromPoints(b,_),T.isSeparated(d))return!1}}}();var ly=function(){let d=new q,p=new q,m=new q;return function(_,x,v){let y=_.start,S=d,M=x.start,E=p;m.subVectors(y,M),d.subVectors(_.end,_.start),p.subVectors(x.end,x.start);let T=m.dot(E),b=E.dot(S),w=E.dot(E),C=m.dot(S),A=S.dot(S)*w-b*b,R,P;if(A!==0)R=(T*b-C*w)/A;else R=0;P=(T+R*b)/w,v.x=R,v.y=P}}(),kr=function(){let d=new Jt,p=new q,m=new q;return function(_,x,v,y){ly(_,x,d);let{x:S,y:M}=d;if(S>=0&&S<=1&&M>=0&&M<=1){_.at(S,v),x.at(M,y);return}else if(S>=0&&S<=1){if(M<0)x.at(0,y);else x.at(1,y);_.closestPointToPoint(y,!0,v);return}else if(M>=0&&M<=1){if(S<0)_.at(0,v);else _.at(1,v);x.closestPointToPoint(v,!0,y);return}else{let E;if(S<0)E=_.start;else E=_.end;let T;if(M<0)T=x.start;else T=x.end;let b=p,w=m;if(_.closestPointToPoint(T,!0,p),x.closestPointToPoint(E,!0,m),b.distanceToSquared(T)<=w.distanceToSquared(E)){v.copy(b),y.copy(T);return}else{v.copy(E),y.copy(w);return}}}}(),Zf=function(){let d=new q,p=new q,m=new un,g=new wn;return function(x,v){let{radius:y,center:S}=x,{a:M,b:E,c:T}=v;if(g.start=M,g.end=E,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;if(g.start=M,g.end=T,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;if(g.start=E,g.end=T,g.closestPointToPoint(S,!0,d).distanceTo(S)<=y)return!0;let N=v.getPlane(m);if(Math.abs(N.distanceToPoint(S))<=y){let R=N.projectPoint(S,p);if(v.containsPoint(R))return!0}return!1}}();var cy=["x","y","z"],gi=0.000000000000001,$f=gi*gi;function Fn(d){return Math.abs(d)<gi}class pn extends Ge{constructor(...d){super(...d);this.isExtendedTriangle=!0,this.satAxes=[,,,,].fill().map(()=>new q),this.satBounds=[,,,,].fill().map(()=>new In),this.points=[this.a,this.b,this.c],this.plane=new un,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new wn,this.needsUpdate=!0}intersectsSphere(d){return Zf(d,this)}update(){let d=this.a,p=this.b,m=this.c,g=this.points,_=this.satAxes,x=this.satBounds,v=_[0],y=x[0];this.getNormal(v),y.setFromPoints(v,g);let S=_[1],M=x[1];S.subVectors(d,p),M.setFromPoints(S,g);let E=_[2],T=x[2];E.subVectors(p,m),T.setFromPoints(E,g);let b=_[3],w=x[3];b.subVectors(m,d),w.setFromPoints(b,g);let C=S.length(),N=E.length(),A=b.length();if(this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,C<gi)if(N<gi||A<gi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(d),this.degenerateSegment.end.copy(m);else if(N<gi)if(A<gi)this.isDegenerateIntoPoint=!0;else this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(p),this.degenerateSegment.end.copy(d);else if(A<gi)this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(m),this.degenerateSegment.end.copy(p);this.plane.setFromNormalAndCoplanarPoint(v,d),this.needsUpdate=!1}}pn.prototype.closestPointToSegment=function(){let d=new q,p=new q,m=new wn;return function(_,x=null,v=null){if(this.needsUpdate)this.update();let{start:y,end:S}=_,M=this.points,E,T=1/0,b=this.plane.distanceToPoint(y),w=this.plane.distanceToPoint(S);if(b*w<0&&this.plane.intersectLine(_,d)!==null&&this.containsPoint(d)){if(x)x.copy(d);if(v)v.copy(d);return 0}for(let C=0;C<3;C++){let N=(C+1)%3;if(m.start.copy(M[C]),m.end.copy(M[N]),kr(m,_,d,p),E=d.distanceToSquared(p),E<T){if(T=E,x)x.copy(d);if(v)v.copy(p)}}if(this.closestPointToPoint(y,d),E=y.distanceToSquared(d),E<T){if(T=E,x)x.copy(d);if(v)v.copy(y)}if(this.closestPointToPoint(S,d),E=S.distanceToSquared(d),E<T){if(T=E,x)x.copy(d);if(v)v.copy(S)}return Math.sqrt(T)}}();pn.prototype.intersectsTriangle=function(){let d=new pn,p=new In,m=new In,g=new q,_=new q,x=new q,v=new q,y=new wn,S=new wn,M=new q,E=new Jt,T=new Jt;function b(F,L,U,k){let I=g;if(!F.isDegenerateIntoPoint&&!F.isDegenerateIntoSegment)I.copy(F.plane.normal);else I.copy(L.plane.normal);let{satBounds:D,satAxes:z}=F;for(let X=1;X<4;X++){let J=D[X],G=z[X];if(p.setFromPoints(G,L.points),J.isSeparated(p))return!1;if(v.copy(I).cross(G),p.setFromPoints(v,F.points),m.setFromPoints(v,L.points),p.isSeparated(m))return!1}let{satBounds:W,satAxes:H}=L;for(let X=1;X<4;X++){let J=W[X],G=H[X];if(p.setFromPoints(G,F.points),J.isSeparated(p))return!1;if(v.crossVectors(I,G),p.setFromPoints(v,F.points),m.setFromPoints(v,L.points),p.isSeparated(m))return!1}if(U){if(!k)console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0.");U.start.set(0,0,0),U.end.set(0,0,0)}return!0}function w(F,L,U,k,I,D,z,W,H,X,J){let G=z/(z-W);X.x=k+(I-k)*G,J.start.subVectors(L,F).multiplyScalar(G).add(F),G=z/(z-H),X.y=k+(D-k)*G,J.end.subVectors(U,F).multiplyScalar(G).add(F)}function C(F,L,U,k,I,D,z,W,H,X,J){if(I>0)w(F.c,F.a,F.b,k,L,U,H,z,W,X,J);else if(D>0)w(F.b,F.a,F.c,U,L,k,W,z,H,X,J);else if(W*H>0||z!=0)w(F.a,F.b,F.c,L,U,k,z,W,H,X,J);else if(W!=0)w(F.b,F.a,F.c,U,L,k,W,z,H,X,J);else if(H!=0)w(F.c,F.a,F.b,k,L,U,H,z,W,X,J);else return!0;return!1}function N(F,L,U,k){let I=L.degenerateSegment,D=F.plane.distanceToPoint(I.start),z=F.plane.distanceToPoint(I.end);if(Fn(D))if(Fn(z))return b(F,L,U,k);else{if(U)U.start.copy(I.start),U.end.copy(I.start);return F.containsPoint(I.start)}else if(Fn(z)){if(U)U.start.copy(I.end),U.end.copy(I.end);return F.containsPoint(I.end)}else if(F.plane.intersectLine(I,g)!=null){if(U)U.start.copy(g),U.end.copy(g);return F.containsPoint(g)}else return!1}function A(F,L,U){let k=L.a;if(Fn(F.plane.distanceToPoint(k))&&F.containsPoint(k)){if(U)U.start.copy(k),U.end.copy(k);return!0}else return!1}function R(F,L,U){let k=F.degenerateSegment,I=L.a;if(k.closestPointToPoint(I,!0,g),I.distanceToSquared(g)<$f){if(U)U.start.copy(I),U.end.copy(I);return!0}else return!1}function P(F,L,U,k){if(F.isDegenerateIntoSegment)if(L.isDegenerateIntoSegment){let I=F.degenerateSegment,D=L.degenerateSegment,z=_,W=x;I.delta(z),D.delta(W);let H=g.subVectors(D.start,I.start),X=z.x*W.y-z.y*W.x;if(Fn(X))return!1;let J=(H.x*W.y-H.y*W.x)/X,G=-(z.x*H.y-z.y*H.x)/X;if(J<0||J>1||G<0||G>1)return!1;let Q=I.start.z+z.z*J,it=D.start.z+W.z*G;if(Fn(Q-it)){if(U)U.start.copy(I.start).addScaledVector(z,J),U.end.copy(I.start).addScaledVector(z,J);return!0}else return!1}else if(L.isDegenerateIntoPoint)return R(F,L,U);else return N(L,F,U,k);else if(F.isDegenerateIntoPoint)if(L.isDegenerateIntoPoint)if(L.a.distanceToSquared(F.a)<$f){if(U)U.start.copy(F.a),U.end.copy(F.a);return!0}else return!1;else if(L.isDegenerateIntoSegment)return R(L,F,U);else return A(L,F,U);else if(L.isDegenerateIntoPoint)return A(F,L,U);else if(L.isDegenerateIntoSegment)return N(F,L,U,k)}return function(L,U=null,k=!1){if(this.needsUpdate)this.update();if(!L.isExtendedTriangle)d.copy(L),d.update(),L=d;else if(L.needsUpdate)L.update();let I=P(this,L,U,k);if(I!==void 0)return I;let D=this.plane,z=L.plane,W=z.distanceToPoint(this.a),H=z.distanceToPoint(this.b),X=z.distanceToPoint(this.c);if(Fn(W))W=0;if(Fn(H))H=0;if(Fn(X))X=0;let J=W*H,G=W*X;if(J>0&&G>0)return!1;let Q=D.distanceToPoint(L.a),it=D.distanceToPoint(L.b),j=D.distanceToPoint(L.c);if(Fn(Q))Q=0;if(Fn(it))it=0;if(Fn(j))j=0;let _t=Q*it,rt=Q*j;if(_t>0&&rt>0)return!1;_.copy(D.normal),x.copy(z.normal);let ut=_.cross(x),mt=0,Nt=Math.abs(ut.x),ot=Math.abs(ut.y);if(ot>Nt)Nt=ot,mt=1;if(Math.abs(ut.z)>Nt)mt=2;let Ct=cy[mt],zt=this.a[Ct],Dt=this.b[Ct],wt=this.c[Ct],jt=L.a[Ct],Qt=L.b[Ct],Ft=L.c[Ct];if(C(this,zt,Dt,wt,J,G,W,H,X,E,y))return b(this,L,U,k);if(C(L,jt,Qt,Ft,_t,rt,Q,it,j,T,S))return b(this,L,U,k);if(E.y<E.x){let Zt=E.y;E.y=E.x,E.x=Zt,M.copy(y.start),y.start.copy(y.end),y.end.copy(M)}if(T.y<T.x){let Zt=T.y;T.y=T.x,T.x=Zt,M.copy(S.start),S.start.copy(S.end),S.end.copy(M)}if(E.y<T.x||T.y<E.x)return!1;if(U){if(T.x>E.x)U.start.copy(S.start);else U.start.copy(y.start);if(T.y<E.y)U.end.copy(S.end);else U.end.copy(y.end)}return!0}}();pn.prototype.distanceToPoint=function(){let d=new q;return function(m){return this.closestPointToPoint(m,d),m.distanceTo(d)}}();pn.prototype.distanceToTriangle=function(){let d=new q,p=new q,m=["a","b","c"],g=new wn,_=new wn;return function(v,y=null,S=null){let M=y||S?g:null;if(this.intersectsTriangle(v,M,!0)){if(y||S){if(y)M.getCenter(y);if(S)M.getCenter(S)}return 0}let E=1/0;for(let T=0;T<3;T++){let b,w=m[T],C=v[w];if(this.closestPointToPoint(C,d),b=C.distanceToSquared(d),b<E){if(E=b,y)y.copy(d);if(S)S.copy(C)}let N=this[w];if(v.closestPointToPoint(N,d),b=N.distanceToSquared(d),b<E){if(E=b,y)y.copy(N);if(S)S.copy(d)}}for(let T=0;T<3;T++){let b=m[T],w=m[(T+1)%3];g.set(this[b],this[w]);for(let C=0;C<3;C++){let N=m[C],A=m[(C+1)%3];_.set(v[N],v[A]),kr(g,_,d,p);let R=d.distanceToSquared(p);if(R<E){if(E=R,y)y.copy(d);if(S)S.copy(p)}}}return Math.sqrt(E)}}();class ke{constructor(d,p,m){if(this.isOrientedBox=!0,this.min=new q,this.max=new q,this.matrix=new ie,this.invMatrix=new ie,this.points=[,,,,,,,,].fill().map(()=>new q),this.satAxes=[,,,].fill().map(()=>new q),this.satBounds=[,,,].fill().map(()=>new In),this.alignedSatBounds=[,,,].fill().map(()=>new In),this.needsUpdate=!1,d)this.min.copy(d);if(p)this.max.copy(p);if(m)this.matrix.copy(m)}set(d,p,m){this.min.copy(d),this.max.copy(p),this.matrix.copy(m),this.needsUpdate=!0}copy(d){this.min.copy(d.min),this.max.copy(d.max),this.matrix.copy(d.matrix),this.needsUpdate=!0}}ke.prototype.update=function(){return function(){let p=this.matrix,m=this.min,g=this.max,_=this.points;for(let M=0;M<=1;M++)for(let E=0;E<=1;E++)for(let T=0;T<=1;T++){let b=1*M|2*E|4*T,w=_[b];w.x=M?g.x:m.x,w.y=E?g.y:m.y,w.z=T?g.z:m.z,w.applyMatrix4(p)}let x=this.satBounds,v=this.satAxes,y=_[0];for(let M=0;M<3;M++){let E=v[M],T=x[M],b=1<<M,w=_[b];E.subVectors(y,w),T.setFromPoints(E,_)}let S=this.alignedSatBounds;S[0].setFromPointsField(_,"x"),S[1].setFromPointsField(_,"y"),S[2].setFromPointsField(_,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}}();ke.prototype.intersectsBox=function(){let d=new In;return function(m){if(this.needsUpdate)this.update();let{min:g,max:_}=m,x=this.satBounds,v=this.satAxes,y=this.alignedSatBounds;if(d.min=g.x,d.max=_.x,y[0].isSeparated(d))return!1;if(d.min=g.y,d.max=_.y,y[1].isSeparated(d))return!1;if(d.min=g.z,d.max=_.z,y[2].isSeparated(d))return!1;for(let S=0;S<3;S++){let M=v[S],E=x[S];if(d.setFromBox(M,m),E.isSeparated(d))return!1}return!0}}();ke.prototype.intersectsTriangle=function(){let d=new pn,p=[,,,],m=new In,g=new In,_=new q;return function(v){if(this.needsUpdate)this.update();if(!v.isExtendedTriangle)d.copy(v),d.update(),v=d;else if(v.needsUpdate)v.update();let y=this.satBounds,S=this.satAxes;p[0]=v.a,p[1]=v.b,p[2]=v.c;for(let b=0;b<3;b++){let w=y[b],C=S[b];if(m.setFromPoints(C,p),w.isSeparated(m))return!1}let M=v.satBounds,E=v.satAxes,T=this.points;for(let b=0;b<3;b++){let w=M[b],C=E[b];if(m.setFromPoints(C,T),w.isSeparated(m))return!1}for(let b=0;b<3;b++){let w=S[b];for(let C=0;C<4;C++){let N=E[C];if(_.crossVectors(w,N),m.setFromPoints(_,p),g.setFromPoints(_,T),m.isSeparated(g))return!1}}return!0}}();ke.prototype.closestPointToPoint=function(){return function(p,m){if(this.needsUpdate)this.update();return m.copy(p).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),m}}();ke.prototype.distanceToPoint=function(){let d=new q;return function(m){return this.closestPointToPoint(m,d),m.distanceTo(d)}}();ke.prototype.distanceToBox=function(){let d=["x","y","z"],p=Array(12).fill().map(()=>new wn),m=Array(12).fill().map(()=>new wn),g=new q,_=new q;return function(v,y=0,S=null,M=null){if(this.needsUpdate)this.update();if(this.intersectsBox(v)){if(S||M){if(v.getCenter(_),this.closestPointToPoint(_,g),v.closestPointToPoint(g,_),S)S.copy(g);if(M)M.copy(_)}return 0}let E=y*y,{min:T,max:b}=v,w=this.points,C=1/0;for(let A=0;A<8;A++){let R=w[A];_.copy(R).clamp(T,b);let P=R.distanceToSquared(_);if(P<C){if(C=P,S)S.copy(R);if(M)M.copy(_);if(P<E)return Math.sqrt(P)}}let N=0;for(let A=0;A<3;A++)for(let R=0;R<=1;R++)for(let P=0;P<=1;P++){let F=(A+1)%3,L=(A+2)%3,U=R<<F|P<<L,k=1<<A|R<<F|P<<L,I=w[U],D=w[k];p[N].set(I,D);let W=d[A],H=d[F],X=d[L],J=m[N],{start:G,end:Q}=J;G[W]=T[W],G[H]=R?T[H]:b[H],G[X]=P?T[X]:b[X],Q[W]=b[W],Q[H]=R?T[H]:b[H],Q[X]=P?T[X]:b[X],N++}for(let A=0;A<=1;A++)for(let R=0;R<=1;R++)for(let P=0;P<=1;P++){_.x=A?b.x:T.x,_.y=R?b.y:T.y,_.z=P?b.z:T.z,this.closestPointToPoint(_,g);let F=_.distanceToSquared(g);if(F<C){if(C=F,S)S.copy(g);if(M)M.copy(_);if(F<E)return Math.sqrt(F)}}for(let A=0;A<12;A++){let R=p[A];for(let P=0;P<12;P++){let F=m[P];kr(R,F,g,_);let L=g.distanceToSquared(_);if(L<C){if(C=L,S)S.copy(g);if(M)M.copy(_);if(L<E)return Math.sqrt(L)}}}return Math.sqrt(C)}}();class Jf extends ss{constructor(){super(()=>new pn)}}var Sn=new Jf;var zr=new q,fh=new q;function Kf(d,p,m={},g=0,_=1/0){let x=g*g,v=_*_,y=1/0,S=null;if(d.shapecast({boundsTraverseOrder:(E)=>(zr.copy(p).clamp(E.min,E.max),zr.distanceToSquared(p)),intersectsBounds:(E,T,b)=>b<y&&b<v,intersectsTriangle:(E,T)=>{E.closestPointToPoint(p,zr);let b=p.distanceToSquared(zr);if(b<y)fh.copy(zr),y=b,S=T;if(b<x)return!0;else return!1}}),y===1/0)return null;let M=Math.sqrt(y);if(!m.point)m.point=fh.clone();else m.point.copy(fh);return m.distance=M,m.faceIndex=S,m}var ya=parseInt(Yi)>=169,hy=parseInt(Yi)<=161,rs=new q,os=new q,as=new q,Sa=new Jt,Ma=new Jt,ba=new Jt,jf=new q,Qf=new q,tp=new q,Hr=new q;function uy(d,p,m,g,_,x,v,y){let S;if(x===dn)S=d.intersectTriangle(g,m,p,!0,_);else S=d.intersectTriangle(p,m,g,x!==Ln,_);if(S===null)return null;let M=d.origin.distanceTo(_);if(M<v||M>y)return null;return{distance:M,point:_.clone()}}function ep(d,p,m,g,_,x,v,y,S,M,E){rs.fromBufferAttribute(p,x),os.fromBufferAttribute(p,v),as.fromBufferAttribute(p,y);let T=uy(d,rs,os,as,Hr,S,M,E);if(T){if(g){Sa.fromBufferAttribute(g,x),Ma.fromBufferAttribute(g,v),ba.fromBufferAttribute(g,y),T.uv=new Jt;let w=Ge.getInterpolation(Hr,rs,os,as,Sa,Ma,ba,T.uv);if(!ya)T.uv=w}if(_){Sa.fromBufferAttribute(_,x),Ma.fromBufferAttribute(_,v),ba.fromBufferAttribute(_,y),T.uv1=new Jt;let w=Ge.getInterpolation(Hr,rs,os,as,Sa,Ma,ba,T.uv1);if(!ya)T.uv1=w;if(hy)T.uv2=T.uv1}if(m){jf.fromBufferAttribute(m,x),Qf.fromBufferAttribute(m,v),tp.fromBufferAttribute(m,y),T.normal=new q;let w=Ge.getInterpolation(Hr,rs,os,as,jf,Qf,tp,T.normal);if(T.normal.dot(d.direction)>0)T.normal.multiplyScalar(-1);if(!ya)T.normal=w}let b={a:x,b:v,c:y,normal:new q,materialIndex:0};if(Ge.getNormal(rs,os,as,b.normal),T.face=b,T.faceIndex=x,ya){let w=new q;Ge.getBarycoord(Hr,rs,os,as,w),T.barycoord=w}}return T}function np(d){return d&&d.isMaterial?d.side:d}function Zs(d,p,m,g,_,x,v){let y=g*3,S=y+0,M=y+1,E=y+2,{index:T,groups:b}=d;if(d.index)S=T.getX(S),M=T.getX(M),E=T.getX(E);let{position:w,normal:C,uv:N,uv1:A}=d.attributes;if(Array.isArray(p)){let R=g*3;for(let P=0,F=b.length;P<F;P++){let{start:L,count:U,materialIndex:k}=b[P];if(R>=L&&R<L+U){let I=np(p[k]),D=ep(m,w,C,N,A,S,M,E,I,x,v);if(D)if(D.faceIndex=g,D.face.materialIndex=k,_)_.push(D);else return D}}}else{let R=np(p),P=ep(m,w,C,N,A,S,M,E,R,x,v);if(P)if(P.faceIndex=g,P.face.materialIndex=0,_)_.push(P);else return P}return null}function Le(d,p,m,g){let{a:_,b:x,c:v}=d,y=p,S=p+1,M=p+2;if(m)y=m.getX(y),S=m.getX(S),M=m.getX(M);_.x=g.getX(y),_.y=g.getY(y),_.z=g.getZ(y),x.x=g.getX(S),x.y=g.getY(S),x.z=g.getZ(S),v.x=g.getX(M),v.y=g.getY(M),v.z=g.getZ(M)}function ip(d,p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:M}=d;for(let E=g,T=g+_;E<T;E++)Zs(S,p,m,E,x,v,y)}function sp(d,p,m,g,_,x,v){let{geometry:y,_indirectBuffer:S}=d,M=1/0,E=null;for(let T=g,b=g+_;T<b;T++){let w;if(w=Zs(y,p,m,T,null,x,v),w&&w.distance<M)E=w,M=w.distance}return E}function rp(d,p,m,g,_,x,v){let{geometry:y}=m,{index:S}=y,M=y.attributes.position;for(let E=d,T=p+d;E<T;E++){let b;if(b=E,Le(v,b*3,S,M),v.needsUpdate=!0,g(v,b,_,x))return!0}return!1}function op(d,p=null){if(p&&Array.isArray(p))p=new Set(p);let m=d.geometry,g=m.index?m.index.array:null,_=m.attributes.position,x,v,y,S,M=0,E=d._roots;for(let b=0,w=E.length;b<w;b++)x=E[b],v=new Uint32Array(x),y=new Uint16Array(x),S=new Float32Array(x),T(0,M),M+=x.byteLength;function T(b,w,C=!1){let N=b*2;if(de(N,y)){let A=Me(b,v),R=Ae(N,y),P=1/0,F=1/0,L=1/0,U=-1/0,k=-1/0,I=-1/0;for(let D=3*A,z=3*(A+R);D<z;D++){let W=g[D],H=_.getX(W),X=_.getY(W),J=_.getZ(W);if(H<P)P=H;if(H>U)U=H;if(X<F)F=X;if(X>k)k=X;if(J<L)L=J;if(J>I)I=J}if(S[b+0]!==P||S[b+1]!==F||S[b+2]!==L||S[b+3]!==U||S[b+4]!==k||S[b+5]!==I)return S[b+0]=P,S[b+1]=F,S[b+2]=L,S[b+3]=U,S[b+4]=k,S[b+5]=I,!0;else return!1}else{let A=ve(b),R=ye(b,v),P=C,F=!1,L=!1;if(p){if(!P){let W=A/we+w/tn,H=R/we+w/tn;F=p.has(W),L=p.has(H),P=!F&&!L}}else F=!0,L=!0;let U=P||F,k=P||L,I=!1;if(U)I=T(A,w,P);let D=!1;if(k)D=T(R,w,P);let z=I||D;if(z)for(let W=0;W<3;W++){let H=A+W,X=R+W,J=S[H],G=S[H+3],Q=S[X],it=S[X+3];S[b+W]=J<Q?J:Q,S[b+W+3]=G>it?G:it}return z}}}function mn(d,p,m,g,_){let x,v,y,S,M,E,T=1/m.direction.x,b=1/m.direction.y,w=1/m.direction.z,C=m.origin.x,N=m.origin.y,A=m.origin.z,R=p[d],P=p[d+3],F=p[d+1],L=p[d+3+1],U=p[d+2],k=p[d+3+2];if(T>=0)x=(R-C)*T,v=(P-C)*T;else x=(P-C)*T,v=(R-C)*T;if(b>=0)y=(F-N)*b,S=(L-N)*b;else y=(L-N)*b,S=(F-N)*b;if(x>S||y>v)return!1;if(y>x||isNaN(x))x=y;if(S<v||isNaN(v))v=S;if(w>=0)M=(U-A)*w,E=(k-A)*w;else M=(k-A)*w,E=(U-A)*w;if(x>E||M>v)return!1;if(M>x||x!==x)x=M;if(E<v||v!==v)v=E;return x<=_&&v>=g}function ap(d,p,m,g,_,x,v,y){let{geometry:S,_indirectBuffer:M}=d;for(let E=g,T=g+_;E<T;E++){let b=M?M[E]:E;Zs(S,p,m,b,x,v,y)}}function lp(d,p,m,g,_,x,v){let{geometry:y,_indirectBuffer:S}=d,M=1/0,E=null;for(let T=g,b=g+_;T<b;T++){let w;if(w=Zs(y,p,m,S?S[T]:T,null,x,v),w&&w.distance<M)E=w,M=w.distance}return E}function cp(d,p,m,g,_,x,v){let{geometry:y}=m,{index:S}=y,M=y.attributes.position;for(let E=d,T=p+d;E<T;E++){let b;if(b=m.resolveTriangleIndex(E),Le(v,b*3,S,M),v.needsUpdate=!0,g(v,b,_,x))return!0}return!1}function hp(d,p,m,g,_,x,v){if(ce.setBuffer(d._roots[p]),mn(0,ce.float32Array,g,x,v))ph(0,d,m,g,_,x,v);ce.clearBuffer()}function ph(d,p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:M}=ce,E=d*2;if(de(E,S)){let b=Me(d,M),w=Ae(E,S);ip(p,m,g,b,w,_,x,v)}else{let b=ve(d);if(mn(b,y,g,x,v))ph(b,p,m,g,_,x,v);let w=ye(d,M);if(mn(w,y,g,x,v))ph(w,p,m,g,_,x,v)}}var dy=["x","y","z"];function up(d,p,m,g,_,x){ce.setBuffer(d._roots[p]);let v=null;if(mn(0,ce.float32Array,g,_,x))v=mh(0,d,m,g,_,x);return ce.clearBuffer(),v}function mh(d,p,m,g,_,x){let{float32Array:v,uint16Array:y,uint32Array:S}=ce,M=d*2;if(de(M,y)){let T=Me(d,S),b=Ae(M,y);return sp(p,m,g,T,b,_,x)}else{let T=zs(d,S),b=dy[T],C=g.direction[b]>=0,N,A;if(C)N=ve(d),A=ye(d,S);else N=ye(d,S),A=ve(d);let P=mn(N,v,g,_,x)?mh(N,p,m,g,_,x):null;if(P){let U=P.point[b];if(C?U<=v[A+T]:U>=v[A+T+3])return P}let L=mn(A,v,g,_,x)?mh(A,p,m,g,_,x):null;if(P&&L)return P.distance<=L.distance?P:L;else return P||L||null}}var Ea=new xe,$s=new pn,Js=new pn,Gr=new ie,dp=new ke,Ta=new ke;function fp(d,p,m,g){ce.setBuffer(d._roots[p]);let _=gh(0,d,m,g);return ce.clearBuffer(),_}function gh(d,p,m,g,_=null){let{float32Array:x,uint16Array:v,uint32Array:y}=ce,S=d*2;if(_===null){if(!m.boundingBox)m.computeBoundingBox();dp.set(m.boundingBox.min,m.boundingBox.max,g),_=dp}if(de(S,v)){let E=p.geometry,T=E.index,b=E.attributes.position,w=m.index,C=m.attributes.position,N=Me(d,y),A=Ae(S,v);if(Gr.copy(g).invert(),m.boundsTree)return Pe(Fe(d),x,Ta),Ta.matrix.copy(Gr),Ta.needsUpdate=!0,m.boundsTree.shapecast({intersectsBounds:(P)=>Ta.intersectsBox(P),intersectsTriangle:(P)=>{P.a.applyMatrix4(g),P.b.applyMatrix4(g),P.c.applyMatrix4(g),P.needsUpdate=!0;for(let F=N*3,L=(A+N)*3;F<L;F+=3)if(Le(Js,F,T,b),Js.needsUpdate=!0,P.intersectsTriangle(Js))return!0;return!1}});else{let R=Oi(m);for(let P=N*3,F=(A+N)*3;P<F;P+=3){Le($s,P,T,b),$s.a.applyMatrix4(Gr),$s.b.applyMatrix4(Gr),$s.c.applyMatrix4(Gr),$s.needsUpdate=!0;for(let L=0,U=R*3;L<U;L+=3)if(Le(Js,L,w,C),Js.needsUpdate=!0,$s.intersectsTriangle(Js))return!0}}}else{let E=ve(d),T=ye(d,y);if(Pe(Fe(E),x,Ea),_.intersectsBox(Ea)&&gh(E,p,m,g,_))return!0;if(Pe(Fe(T),x,Ea),_.intersectsBox(Ea)&&gh(T,p,m,g,_))return!0;return!1}}var wa=new ie,_h=new ke,Vr=new ke,fy=new q,py=new q,my=new q,gy=new q;function pp(d,p,m,g={},_={},x=0,v=1/0){if(!p.boundingBox)p.computeBoundingBox();_h.set(p.boundingBox.min,p.boundingBox.max,m),_h.needsUpdate=!0;let y=d.geometry,S=y.attributes.position,M=y.index,E=p.attributes.position,T=p.index,b=Sn.getPrimitive(),w=Sn.getPrimitive(),C=fy,N=py,A=null,R=null;if(_)A=my,R=gy;let P=1/0,F=null,L=null;if(wa.copy(m).invert(),Vr.matrix.copy(wa),d.shapecast({boundsTraverseOrder:(U)=>_h.distanceToBox(U),intersectsBounds:(U,k,I)=>{if(I<P&&I<v){if(k)Vr.min.copy(U.min),Vr.max.copy(U.max),Vr.needsUpdate=!0;return!0}return!1},intersectsRange:(U,k)=>{if(p.boundsTree)return p.boundsTree.shapecast({boundsTraverseOrder:(D)=>Vr.distanceToBox(D),intersectsBounds:(D,z,W)=>W<P&&W<v,intersectsRange:(D,z)=>{for(let W=D,H=D+z;W<H;W++){Le(w,3*W,T,E),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let X=U,J=U+k;X<J;X++){Le(b,3*X,M,S),b.needsUpdate=!0;let G=b.distanceToTriangle(w,C,A);if(G<P){if(N.copy(C),R)R.copy(A);P=G,F=X,L=W}if(G<x)return!0}}}});else{let I=Oi(p);for(let D=0,z=I;D<z;D++){Le(w,3*D,T,E),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let W=U,H=U+k;W<H;W++){Le(b,3*W,M,S),b.needsUpdate=!0;let X=b.distanceToTriangle(w,C,A);if(X<P){if(N.copy(C),R)R.copy(A);P=X,F=W,L=D}if(X<x)return!0}}}}}),Sn.releasePrimitive(b),Sn.releasePrimitive(w),P===1/0)return null;if(!g.point)g.point=N.clone();else g.point.copy(N);if(g.distance=P,g.faceIndex=F,_){if(!_.point)_.point=R.clone();else _.point.copy(R);_.point.applyMatrix4(wa),N.applyMatrix4(wa),_.distance=N.sub(_.point).length(),_.faceIndex=L}return g}function mp(d,p=null){if(p&&Array.isArray(p))p=new Set(p);let m=d.geometry,g=m.index?m.index.array:null,_=m.attributes.position,x,v,y,S,M=0,E=d._roots;for(let b=0,w=E.length;b<w;b++)x=E[b],v=new Uint32Array(x),y=new Uint16Array(x),S=new Float32Array(x),T(0,M),M+=x.byteLength;function T(b,w,C=!1){let N=b*2;if(de(N,y)){let A=Me(b,v),R=Ae(N,y),P=1/0,F=1/0,L=1/0,U=-1/0,k=-1/0,I=-1/0;for(let D=A,z=A+R;D<z;D++){let W=3*d.resolveTriangleIndex(D);for(let H=0;H<3;H++){let X=W+H;X=g?g[X]:X;let J=_.getX(X),G=_.getY(X),Q=_.getZ(X);if(J<P)P=J;if(J>U)U=J;if(G<F)F=G;if(G>k)k=G;if(Q<L)L=Q;if(Q>I)I=Q}}if(S[b+0]!==P||S[b+1]!==F||S[b+2]!==L||S[b+3]!==U||S[b+4]!==k||S[b+5]!==I)return S[b+0]=P,S[b+1]=F,S[b+2]=L,S[b+3]=U,S[b+4]=k,S[b+5]=I,!0;else return!1}else{let A=ve(b),R=ye(b,v),P=C,F=!1,L=!1;if(p){if(!P){let W=A/we+w/tn,H=R/we+w/tn;F=p.has(W),L=p.has(H),P=!F&&!L}}else F=!0,L=!0;let U=P||F,k=P||L,I=!1;if(U)I=T(A,w,P);let D=!1;if(k)D=T(R,w,P);let z=I||D;if(z)for(let W=0;W<3;W++){let H=A+W,X=R+W,J=S[H],G=S[H+3],Q=S[X],it=S[X+3];S[b+W]=J<Q?J:Q,S[b+W+3]=G>it?G:it}return z}}}function gp(d,p,m,g,_,x,v){if(ce.setBuffer(d._roots[p]),mn(0,ce.float32Array,g,x,v))xh(0,d,m,g,_,x,v);ce.clearBuffer()}function xh(d,p,m,g,_,x,v){let{float32Array:y,uint16Array:S,uint32Array:M}=ce,E=d*2;if(de(E,S)){let b=Me(d,M),w=Ae(E,S);ap(p,m,g,b,w,_,x,v)}else{let b=ve(d);if(mn(b,y,g,x,v))xh(b,p,m,g,_,x,v);let w=ye(d,M);if(mn(w,y,g,x,v))xh(w,p,m,g,_,x,v)}}var _y=["x","y","z"];function _p(d,p,m,g,_,x){ce.setBuffer(d._roots[p]);let v=null;if(mn(0,ce.float32Array,g,_,x))v=vh(0,d,m,g,_,x);return ce.clearBuffer(),v}function vh(d,p,m,g,_,x){let{float32Array:v,uint16Array:y,uint32Array:S}=ce,M=d*2;if(de(M,y)){let T=Me(d,S),b=Ae(M,y);return lp(p,m,g,T,b,_,x)}else{let T=zs(d,S),b=_y[T],C=g.direction[b]>=0,N,A;if(C)N=ve(d),A=ye(d,S);else N=ye(d,S),A=ve(d);let P=mn(N,v,g,_,x)?vh(N,p,m,g,_,x):null;if(P){let U=P.point[b];if(C?U<=v[A+T]:U>=v[A+T+3])return P}let L=mn(A,v,g,_,x)?vh(A,p,m,g,_,x):null;if(P&&L)return P.distance<=L.distance?P:L;else return P||L||null}}var Aa=new xe,Ks=new pn,js=new pn,Wr=new ie,xp=new ke,Ra=new ke;function vp(d,p,m,g){ce.setBuffer(d._roots[p]);let _=yh(0,d,m,g);return ce.clearBuffer(),_}function yh(d,p,m,g,_=null){let{float32Array:x,uint16Array:v,uint32Array:y}=ce,S=d*2;if(_===null){if(!m.boundingBox)m.computeBoundingBox();xp.set(m.boundingBox.min,m.boundingBox.max,g),_=xp}if(de(S,v)){let E=p.geometry,T=E.index,b=E.attributes.position,w=m.index,C=m.attributes.position,N=Me(d,y),A=Ae(S,v);if(Wr.copy(g).invert(),m.boundsTree)return Pe(Fe(d),x,Ra),Ra.matrix.copy(Wr),Ra.needsUpdate=!0,m.boundsTree.shapecast({intersectsBounds:(P)=>Ra.intersectsBox(P),intersectsTriangle:(P)=>{P.a.applyMatrix4(g),P.b.applyMatrix4(g),P.c.applyMatrix4(g),P.needsUpdate=!0;for(let F=N,L=A+N;F<L;F++)if(Le(js,3*p.resolveTriangleIndex(F),T,b),js.needsUpdate=!0,P.intersectsTriangle(js))return!0;return!1}});else{let R=Oi(m);for(let P=N,F=A+N;P<F;P++){let L=p.resolveTriangleIndex(P);Le(Ks,3*L,T,b),Ks.a.applyMatrix4(Wr),Ks.b.applyMatrix4(Wr),Ks.c.applyMatrix4(Wr),Ks.needsUpdate=!0;for(let U=0,k=R*3;U<k;U+=3)if(Le(js,U,w,C),js.needsUpdate=!0,Ks.intersectsTriangle(js))return!0}}}else{let E=ve(d),T=ye(d,y);if(Pe(Fe(E),x,Aa),_.intersectsBox(Aa)&&yh(E,p,m,g,_))return!0;if(Pe(Fe(T),x,Aa),_.intersectsBox(Aa)&&yh(T,p,m,g,_))return!0;return!1}}var Ca=new ie,Sh=new ke,Xr=new ke,xy=new q,vy=new q,yy=new q,Sy=new q;function yp(d,p,m,g={},_={},x=0,v=1/0){if(!p.boundingBox)p.computeBoundingBox();Sh.set(p.boundingBox.min,p.boundingBox.max,m),Sh.needsUpdate=!0;let y=d.geometry,S=y.attributes.position,M=y.index,E=p.attributes.position,T=p.index,b=Sn.getPrimitive(),w=Sn.getPrimitive(),C=xy,N=vy,A=null,R=null;if(_)A=yy,R=Sy;let P=1/0,F=null,L=null;if(Ca.copy(m).invert(),Xr.matrix.copy(Ca),d.shapecast({boundsTraverseOrder:(U)=>Sh.distanceToBox(U),intersectsBounds:(U,k,I)=>{if(I<P&&I<v){if(k)Xr.min.copy(U.min),Xr.max.copy(U.max),Xr.needsUpdate=!0;return!0}return!1},intersectsRange:(U,k)=>{if(p.boundsTree){let I=p.boundsTree;return I.shapecast({boundsTraverseOrder:(D)=>Xr.distanceToBox(D),intersectsBounds:(D,z,W)=>W<P&&W<v,intersectsRange:(D,z)=>{for(let W=D,H=D+z;W<H;W++){let X=I.resolveTriangleIndex(W);Le(w,3*X,T,E),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let J=U,G=U+k;J<G;J++){let Q=d.resolveTriangleIndex(J);Le(b,3*Q,M,S),b.needsUpdate=!0;let it=b.distanceToTriangle(w,C,A);if(it<P){if(N.copy(C),R)R.copy(A);P=it,F=J,L=W}if(it<x)return!0}}}})}else{let I=Oi(p);for(let D=0,z=I;D<z;D++){Le(w,3*D,T,E),w.a.applyMatrix4(m),w.b.applyMatrix4(m),w.c.applyMatrix4(m),w.needsUpdate=!0;for(let W=U,H=U+k;W<H;W++){let X=d.resolveTriangleIndex(W);Le(b,3*X,M,S),b.needsUpdate=!0;let J=b.distanceToTriangle(w,C,A);if(J<P){if(N.copy(C),R)R.copy(A);P=J,F=W,L=D}if(J<x)return!0}}}}}),Sn.releasePrimitive(b),Sn.releasePrimitive(w),P===1/0)return null;if(!g.point)g.point=N.clone();else g.point.copy(N);if(g.distance=P,g.faceIndex=F,_){if(!_.point)_.point=R.clone();else _.point.copy(R);_.point.applyMatrix4(Ca),N.applyMatrix4(Ca),_.distance=N.sub(_.point).length(),_.faceIndex=L}return g}function Mh(d,p,m){if(d===null)return null;return d.point.applyMatrix4(p.matrixWorld),d.distance=d.point.distanceTo(m.ray.origin),d.object=p,d}var Ia=new ke,Pa=new Ii,Sp=new q,Mp=new ie,bp=new q,bh=["getX","getY","getZ"];class Qs extends dh{static serialize(d,p={}){p={cloneBuffers:!0,...p};let{geometry:m,_roots:g,_indirectBuffer:_}=d,x=m.getIndex(),v={version:1,roots:null,index:null,indirectBuffer:null};if(p.cloneBuffers)v.roots=g.map((y)=>y.slice()),v.index=x?x.array.slice():null,v.indirectBuffer=_?_.slice():null;else v.roots=g,v.index=x?x.array:null,v.indirectBuffer=_;return v}static deserialize(d,p,m={}){m={setIndex:!0,indirect:Boolean(d.indirectBuffer),...m};let{index:g,roots:_,indirectBuffer:x}=d;if(!d.version)console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),y(_);let v=new Qs(p,{...m,[Fr]:!0});if(v._roots=_,v._indirectBuffer=x||null,m.setIndex){let S=p.getIndex();if(S===null){let M=new Ve(d.index,1,!1);p.setIndex(M)}else if(S.array!==g)S.array.set(g),S.needsUpdate=!0}return v;function y(S){for(let M=0;M<S.length;M++){let E=S[M],T=new Uint32Array(E),b=new Uint16Array(E);for(let w=0,C=E.byteLength/tn;w<C;w++){let N=we*w,A=2*N;if(!de(A,b))T[N+6]=T[N+6]/we-w}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(d,p={}){if(p.maxLeafTris)console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),p={...p,targetLeafSize:p.maxLeafTris};super(d,p)}shiftTriangleOffsets(d){return super.shiftPrimitiveOffsets(d)}writePrimitiveBounds(d,p,m){let g=this.geometry,_=this._indirectBuffer,x=g.attributes.position,v=g.index?g.index.array:null,S=(_?_[d]:d)*3,M=S+0,E=S+1,T=S+2;if(v)M=v[M],E=v[E],T=v[T];for(let b=0;b<3;b++){let w=x[bh[b]](M),C=x[bh[b]](E),N=x[bh[b]](T),A=w;if(C<A)A=C;if(N<A)A=N;let R=w;if(C>R)R=C;if(N>R)R=N;p[m+b]=A,p[m+b+3]=R}return p}computePrimitiveBounds(d,p,m){let g=this.geometry,_=this._indirectBuffer,x=g.attributes.position,v=g.index?g.index.array:null,y=x.normalized;if(d<0||p+d-m.offset>m.length/6)throw Error("MeshBVH: compute triangle bounds range is invalid.");let S=x.array,M=x.offset||0,E=3;if(x.isInterleavedBufferAttribute)E=x.data.stride;let T=["getX","getY","getZ"],b=m.offset;for(let w=d,C=d+p;w<C;w++){let A=(_?_[w]:w)*3,R=(w-b)*6,P=A+0,F=A+1,L=A+2;if(v)P=v[P],F=v[F],L=v[L];if(!y)P=P*E+M,F=F*E+M,L=L*E+M;for(let U=0;U<3;U++){let k,I,D;if(y)k=x[T[U]](P),I=x[T[U]](F),D=x[T[U]](L);else k=S[P+U],I=S[F+U],D=S[L+U];let z=k;if(I<z)z=I;if(D<z)z=D;let W=k;if(I>W)W=I;if(D>W)W=D;let H=(W-z)/2,X=U*2;m[R+X+0]=z+H,m[R+X+1]=H+(Math.abs(z)+H)*ks}}return m}raycastObject3D(d,p,m=[]){let{material:g}=d;if(g===void 0)return;Mp.copy(d.matrixWorld).invert(),Pa.copy(p.ray).applyMatrix4(Mp),bp.setFromMatrixScale(d.matrixWorld),Sp.copy(Pa.direction).multiply(bp);let _=Sp.length(),x=p.near/_,v=p.far/_;if(p.firstHitOnly===!0){let y=this.raycastFirst(Pa,g,x,v);if(y=Mh(y,d,p),y)m.push(y)}else{let y=this.raycast(Pa,g,x,v);for(let S=0,M=y.length;S<M;S++){let E=Mh(y[S],d,p);if(E)m.push(E)}}return m}refit(d=null){return(this.indirect?mp:op)(this,d)}raycast(d,p=ci,m=0,g=1/0){let _=this._roots,x=[],v=this.indirect?gp:hp;for(let y=0,S=_.length;y<S;y++)v(this,y,p,d,x,m,g);return x}raycastFirst(d,p=ci,m=0,g=1/0){let _=this._roots,x=null,v=this.indirect?_p:up;for(let y=0,S=_.length;y<S;y++){let M=v(this,y,p,d,m,g);if(M!=null&&(x==null||M.distance<x.distance))x=M}return x}intersectsGeometry(d,p){let m=!1,g=this._roots,_=this.indirect?vp:fp;for(let x=0,v=g.length;x<v;x++)if(m=_(this,x,d,p),m)break;return m}shapecast(d){let p=Sn.getPrimitive(),m=super.shapecast({...d,intersectsPrimitive:d.intersectsTriangle,scratchPrimitive:p,iterate:this.indirect?cp:rp});return Sn.releasePrimitive(p),m}bvhcast(d,p,m){let{intersectsRanges:g,intersectsTriangles:_}=m,x=Sn.getPrimitive(),v=this.geometry.index,y=this.geometry.attributes.position,S=this.indirect?(w)=>{let C=this.resolveTriangleIndex(w);Le(x,C*3,v,y)}:(w)=>{Le(x,w*3,v,y)},M=Sn.getPrimitive(),E=d.geometry.index,T=d.geometry.attributes.position,b=d.indirect?(w)=>{let C=d.resolveTriangleIndex(w);Le(M,C*3,E,T)}:(w)=>{Le(M,w*3,E,T)};if(_){if(!(d instanceof Qs))throw Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let w=(C,N,A,R,P,F,L,U)=>{for(let k=A,I=A+R;k<I;k++){b(k),M.a.applyMatrix4(p),M.b.applyMatrix4(p),M.c.applyMatrix4(p),M.needsUpdate=!0;for(let D=C,z=C+N;D<z;D++)if(S(D),x.needsUpdate=!0,_(x,M,D,k,P,F,L,U))return!0}return!1};if(g){let C=g;g=function(N,A,R,P,F,L,U,k){if(!C(N,A,R,P,F,L,U,k))return w(N,A,R,P,F,L,U,k);return!0}}else g=w}return super.bvhcast(d,p,{intersectsRanges:g})}intersectsBox(d,p){return Ia.set(d.min,d.max,p),Ia.needsUpdate=!0,this.shapecast({intersectsBounds:(m)=>Ia.intersectsBox(m),intersectsTriangle:(m)=>Ia.intersectsTriangle(m)})}intersectsSphere(d){return this.shapecast({intersectsBounds:(p)=>d.intersectsBox(p),intersectsTriangle:(p)=>p.intersectsSphere(d)})}closestPointToGeometry(d,p,m={},g={},_=0,x=1/0){return(this.indirect?yp:pp)(this,d,p,m,g,_,x)}closestPointToPoint(d,p={},m=0,g=1/0){return Kf(this,d,p,m,g)}}var M1=parseInt(Yi)>=166,tr={Mesh:nn.prototype.raycast,Line:pi.prototype.raycast,LineSegments:Li.prototype.raycast,LineLoop:Qi.prototype.raycast,Points:wr.prototype.raycast,BatchedMesh:Wo.prototype.raycast},sn=new nn,La=[];function Ep(d,p){if(this.isBatchedMesh)My.call(this,d,p);else{let{geometry:m}=this;if(m.boundsTree)m.boundsTree.raycastObject3D(this,d,p);else{let g;if(this instanceof nn)g=tr.Mesh;else if(this instanceof Li)g=tr.LineSegments;else if(this instanceof Qi)g=tr.LineLoop;else if(this instanceof pi)g=tr.Line;else if(this instanceof wr)g=tr.Points;else throw Error("BVH: Fallback raycast function not found.");g.call(this,d,p)}}}function My(d,p){if(this.boundsTrees){let m=this.boundsTrees,g=this._drawInfo||this._instanceInfo,_=this._drawRanges||this._geometryInfo,x=this.matrixWorld;sn.material=this.material,sn.geometry=this.geometry;let v=sn.geometry.boundsTree,y=sn.geometry.drawRange;if(sn.geometry.boundingSphere===null)sn.geometry.boundingSphere=new yn;for(let S=0,M=g.length;S<M;S++){if(!this.getVisibleAt(S))continue;let E=g[S].geometryIndex;if(sn.geometry.boundsTree=m[E],this.getMatrixAt(S,sn.matrixWorld).premultiply(x),!sn.geometry.boundsTree){this.getBoundingBoxAt(E,sn.geometry.boundingBox),this.getBoundingSphereAt(E,sn.geometry.boundingSphere);let T=_[E];sn.geometry.setDrawRange(T.start,T.count)}sn.raycast(d,La);for(let T=0,b=La.length;T<b;T++){let w=La[T];w.object=this,w.batchId=S,p.push(w)}La.length=0}sn.geometry.boundsTree=v,sn.geometry.drawRange=y,sn.material=null,sn.geometry=null}else tr.BatchedMesh.call(this,d,p)}var qr=11,Tp=6,by=12,Ey=100,Ty=500,wy=3,Ay=500,Eh=2,wp=300000,Ry=45,Th=22,Cy=/^(1ROAD|1GRASS|1GRAVEL)_ground|^1ROAD_deck|^nocol_water|^nocol_far/,Iy=/^nocol_far/,Py=1.5,Ly=0.004,Ap=0.02,Ny=10,Dy=200,Na=1000,wh=1,Uy=4,Rp=2,Fy=2,Oy=0.15,Cp=100,By=3,Ip=3,Da=1,ky=5,zy=0.1,Hy=0.002,Pp=1000,Gy=80000,Vy=2,Wy=24,Xy=6000,qy=0.1,Yy=0.3,Zy=new Set(["KeyW","KeyA","KeyS","KeyD"]),$y=60,Jy=4,Lp="#ffd21f",Np=300,Ky=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],jy=/^(?!.*_sub_).*(_cars_|_bld|_props_|_wire_|_pylon_|_rocks_|_fence|_fuel_|_signs_|_pool_|_play_|_sport_|_graves_|_tower_|_fountain_)/,Qy=/_wire_/,tS=6,eS=8,Dp=0,nS=1,iS=/^(1ROAD|1GRASS|1GRAVEL)_ground/,sS=1,Up=64,rS=0.15,Fp="#ff8a1f",Op="#2f8bff";function Bp(d,p){performance.clearMeasures(d);let m=performance.now(),g=p();return performance.measure(d,{start:m}),g}function oS(d){let p=document.createElement("canvas");p.width=d.width,p.height=d.height;let m=p.getContext("2d",{willReadFrequently:!0});return m?.drawImage(d,0,0),m?m.getImageData(0,0,d.width,d.height):null}function aS(d){let{roots:p,indirectBuffer:m}=Qs.serialize(d,{cloneBuffers:!1});return p.reduce((g,_)=>g+_.byteLength,m?.byteLength??0)}function lS(d){let p=performance.now(),m=new Qs(d.geometry,{indirect:!0}),g=aS(m);return d.geometry.boundsTree=m,d.raycast=Ep,performance.measure("map2lap.bvh",{start:p,detail:g}),g}var kp=(d)=>d.vertices*qr*4+4+d.indices*2;function ls(d,p){let m=p.getBoundingClientRect();return new Jt((d.clientX-m.left)/m.width*2-1,-(d.clientY-m.top)/m.height*2+1)}async function Ua(d,p,m=wy){let g;try{if(g=await fetch(d,{signal:p}),g.ok)return await g.arrayBuffer()}catch(_){if(p.aborted||m<=1)throw _;return await new Promise((x)=>setTimeout(x,Ay)),Ua(d,p,m-1)}throw Error((await g.json().catch(()=>null))?.error??`${d}: ${g.status}`)}function zp(d){let p=[],m=0;return async(g)=>{if(m>=d)await new Promise((_)=>p.push(_));m++;try{return await g()}finally{m--,p.shift()?.()}}}var cS=zp(by);async function hS(d,p,m){let g;if(/\.dds$/i.test(p)){let _=new Qc().parse(d,!0);g=new Ar(_.mipmaps,_.width,_.height,_.format),g.minFilter=_.mipmapCount>1?Hn:Tn}else{let _=await createImageBitmap(new Blob([d]),{imageOrientation:"none",premultiplyAlpha:"none"});g=new We(_),g.generateMipmaps=!0,g.minFilter=Hn}return g.flipY=!1,g.wrapS=g.wrapT=Po,g.anisotropy=m,g.colorSpace=Oo,g.needsUpdate=!0,g}function uS(d,p,m){return Math.hypot(...d.map((g,_)=>Math.max(Math.abs(p[_]-g),Math.abs(m[_]-g))))}function Hp(d,p){d.computeBoundingBox();let m=d.boundingBox;d.boundingSphere=new yn(new q(...p.center),Math.max(p.radius,uS(p.center,m.min.toArray(),m.max.toArray())))}function dS(d,p){let m=new Qe,g=new Vo(new Float32Array(p,0,d.vertices*qr),qr);m.setAttribute("position",new ji(g,3,0)),m.setAttribute("normal",new ji(g,3,3)),m.setAttribute("uv",new ji(g,2,6));let _=d.vertices*qr*4+4;return m.setIndex(new Ve(new Uint16Array(p,_,d.indices),1)),Hp(m,d),m}class Ah{renderer;scene=new zo;camera=new bn(55,1,0.5,wp);resizing;down=new Pr;dirty=!0;shown=!1;token=0;meshes=[];grounds=[];textures=[];materials=[];usedBytes=0;overLimit=!1;loading=new AbortController;height=0;clearance=Th;highest=Pp;area=Ha([]);lastGround=0;zoomLeft=0;zoomAim=new q;host;flying=new Set;lastFrame=0;settings=c;data=null;onHover=()=>{};mouse=null;held=0;hoverDue=!1;lastHover=0;picker=new Pr;alphaOf=new Map;onPick=()=>{};onMenu=()=>{};marked=null;markedLines=null;markDue=!1;lastMark=0;markEvery=Np;onIndexed=()=>{};pickedBox=null;parts=new Map;byNumber=new Map;objectPieces=new Map;belonging=new Map;removed=new Set;removedSorts=new Set;named={ids:[],objectSorts:new Set};listedOut=new Map;billboardsOut=new Map;trackName="";heightsVersion=0;onViewFailed=()=>{};draft=0;refreshes=zp(Tp);brush=null;onStroke=()=>{};ring=null;strokeLine=null;stroke=null;constructor(d){this.host=d,this.renderer=new jc({antialias:!0,logarithmicDepthBuffer:!0}),this.renderer.setPixelRatio(window.devicePixelRatio),d.appendChild(this.renderer.domElement),this.scene.background=new se("#a9cfe9"),this.scene.add(new ea("#ffffff",2));let p=new ta("#fff4e0",1.6);p.position.set(0.5,1,0.35),this.scene.add(p),this.down.firstHitOnly=!0,this.turnAround(this.renderer.domElement),this.grabGround(this.renderer.domElement),this.zoomWheel(this.renderer.domElement),this.flyKeys(this.renderer.domElement),this.followMouse(this.renderer.domElement),this.clicks(this.renderer.domElement),this.strokes(this.renderer.domElement),this.resizing=new ResizeObserver(()=>this.resize()),this.resizing.observe(d),this.renderer.setAnimationLoop(()=>this.frame())}dispose(){this.token++,this.loading.abort(),this.clear(),this.resizing.disconnect(),this.renderer.setAnimationLoop(null),this.renderer.dispose(),this.renderer.domElement.remove()}show(d){if(this.shown=d,d)this.resize();else this.flying.clear(),this.zoomLeft=0}setControls(d){this.settings=d}setHover(d){this.onHover=d}setPick(d){this.onPick=d}setIndexed(d){this.onIndexed=d,d(this.data?.revision??null)}focus(){this.renderer.domElement.focus({preventScroll:!0})}unpick(){this.mark(null),this.onPick(null)}setRemoved(d,p=[],m=[]){this.named={ids:d,objectSorts:new Set(m)};let g=this.wanted(),_=new Set(p),x=p.length!==this.removedSorts.size||p.some((y)=>!this.removedSorts.has(y)),v=!1;for(let y of this.removed)if(!g.has(y))this.leaveOut(y,!1),v=!0;if(x){this.removedSorts=_;for(let y of this.billboardMeshes())this.restore(y);v=!0}for(let y of g)if(v||!this.removed.has(y))this.leaveOut(y,!0);if(v&&this.removedSorts.size)for(let y of this.billboardMeshes())this.leaveOutSorts(y);if(this.removed=g,this.noteListedOut(),this.marked)this.frameMarked();this.dirty=!0,this.hoverDue=!0}wanted(d=this.named){return new Set([...d.ids,...Wa(this.data?.objects??{},d.objectSorts)])}noteListedOut(){this.listedOut=new Map,this.billboardsOut=new Map;for(let d of this.removed){let p=d.slice(0,d.lastIndexOf("#"));if(!this.data?.objects?.[p]){if(!this.billboardsOut.has(p))this.billboardsOut.set(p,[]);this.billboardsOut.get(p).push(d);continue}for(let m of this.piecesOf(d)){if(!this.listedOut.has(m.mesh))this.listedOut.set(m.mesh,[]);this.listedOut.get(m.mesh).push(m)}}}countOfListed(d,p,m){if(!this.data)return 0;return Wh(this.data.objects,d,Vh(this.wanted({ids:p,objectSorts:new Set(m)}),this.belonging))}billboardMeshes(){return[...this.parts.values()].flat()}restore(d){let p=d.userData.indices;if(!p)return;let m=d.geometry.getIndex();m.array.set(p),m.needsUpdate=!0}*billboardsOf(d){let p=d.userData.info,m=p.indices/3,g=p.first_face;for(let _=ir(0,g);_<=ir(Math.max(0,m-1),g);_++){let[x,v]=Kr(_,g,m);if(x<v)yield[_,x,v]}}spriteOf(d,p){let m=d.geometry.getAttribute("uv"),g=d.userData.indices??d.geometry.getIndex().array,[_,x,v]=[g[p*3],g[p*3+1],g[p*3+2]];return Xa(this.data.atlas,(m.getX(_)+m.getX(x)+m.getX(v))/3,(m.getY(_)+m.getY(x)+m.getY(v))/3)}leaveOutSorts(d){if(!this.removedSorts.size||!this.data)return;let p=d.userData.info;for(let[,m,g]of this.billboardsOf(d)){let _=this.spriteOf(d,m);if(_&&this.removedSorts.has(_))this.leaveOutIn(d,{mesh:p.i,from:m,end:g},!0)}}countOf(d){let p=new Set;for(let m of this.billboardMeshes()){let g=m.userData.info;for(let[_,x]of this.billboardsOf(m))if(this.spriteOf(m,x)===d)p.add(`${g.base}#${_}`)}return p.size}piecesOf(d){let p=d.lastIndexOf("#"),m=d.slice(0,p),g=Number(d.slice(p+1)),_=this.data?.objects?.[m]?.faces[g];if(_)return[..._.map(([x,v,y])=>({mesh:x,from:v,end:v+y})),...(this.belonging.get(d)??[]).flatMap((x)=>this.piecesOf(x))];return(this.parts.get(m)??[]).map((x)=>{let v=x.userData.info,[y,S]=Kr(g,v.first_face,v.indices/3);return{mesh:v.i,from:y,end:S}}).filter((x)=>x.from<x.end)}leaveOut(d,p){for(let m of this.piecesOf(d)){let g=this.byNumber.get(m.mesh);if(g)this.leaveOutIn(g,m,p)}}leaveOutIn(d,{from:p,end:m},g){let _=d.geometry.getIndex(),x=_.array;if(!d.userData.indices)d.userData.indices=x.slice(),this.usedBytes+=x.byteLength;if(g)x.fill(0,p*3,m*3);else x.set(d.userData.indices.subarray(p*3,m*3),p*3);_.needsUpdate=!0}async open(d,p){let m=++this.token;this.loading.abort(),this.loading=new AbortController;let{signal:g}=this.loading;if(this.clear(),this.trackName=d,this.onViewFailed(null),this.dirty=!0,this.onHover(null),this.onPick(null),this.onIndexed(null),p(d?"Reading the track …":""),!d)return;try{await this.load(d,m,g,p)}catch(_){if(m!==this.token)return;this.loading.abort(),p(`Could not load this track: ${_.message}`)}}async load(d,p,m,g){let _=await fetch(`/api/editor/${encodeURIComponent(d)}/index`,{signal:m}),x=await _.json();if(p!==this.token)return;if(!_.ok){g(x.error||"Could not read this track");return}this.data=x,this.objectPieces=qh(x.objects),this.belonging=Xh(x.objects),this.removed=this.wanted(),this.noteListedOut(),this.onIndexed(x.revision),this.placeCamera(x),this.renderer.domElement.focus({preventScroll:!0});let v=Ga(x.meshes,this.camera.position.toArray()),y=this.camera.position.clone(),S=performance.now(),M=v.length,E=0;if(await Promise.all(Array.from({length:Tp},async()=>{while(v.length&&p===this.token){if(performance.now()-S>Ty&&y.distanceTo(this.camera.position)>Ey)v=Ga(v,this.camera.position.toArray()),y=this.camera.position.clone(),S=performance.now();let b=v.pop();if(!Jr(this.usedBytes,Eh*kp(b),this.settings.memoryGb)){this.overLimit=!0,v.length=0;return}this.usedBytes+=Eh*kp(b);let w=this.heightsVersion,C=await Ua(`/api/editor/${encodeURIComponent(d)}/mesh/${b.i}?r=${x.revision}&d=${this.draft}`,m);if(p!==this.token)return;if(this.addMesh(d,x,b,C),w!==this.heightsVersion)this.refresh(b.i);E++,g(`Loading: ${E} of ${M} parts`)}})),p!==this.token)return;if(await Promise.all(this.textures),p!==this.token)return;g(this.overLimit?`Memory limit reached (Settings): ${E} of ${M} parts, the nearest ones`:`${M} parts loaded`)}turnAround(d){let p=null,m=new q,g=0;d.addEventListener("mousedown",(_)=>{if(_.button===wh)_.preventDefault()}),d.addEventListener("pointerdown",(_)=>{if(_.button!==wh)return;this.zoomLeft=0,p={x:_.clientX,y:_.clientY};let x=this.camera.position,v=this.camera.getWorldDirection(new q);g=Math.max(Da,Math.min(this.reachOfLook(),this.groundAlong(x,v)?.distance??this.wayDown(v))),m=x.clone().addScaledVector(v,g),this.intoArea(m)}),d.addEventListener("pointermove",(_)=>{if(!p)return;if(!(_.buttons&Uy)){p=null;return}let{look:x,invertLook:v}=this.settings,y=Ly*x/u;this.turn(m,g,(p.x-_.clientX)*y,(p.y-_.clientY)*y*(v?-1:1)),p={x:_.clientX,y:_.clientY}}),d.addEventListener("pointerup",(_)=>{if(_.button===wh)p=null})}grabGround(d){let p=null,m=new q,g=new q;d.addEventListener("pointerdown",(x)=>{if(x.button!==Rp)return;this.zoomLeft=0,this.picker.setFromCamera(ls(x,d),this.camera);let{ray:v}=this.picker,y=this.groundAlong(v.origin,v.direction)?.point.y??this.lastGround;if(p=new un(new q(0,1,0),-y),!v.intersectPlane(p,g))p=null});let _=(x,v)=>{if(this.picker.setFromCamera(ls(x,d),this.camera),!this.picker.ray.intersectPlane(v,m)||m.distanceTo(this.camera.position)>2*this.highest)return;this.camera.position.x+=g.x-m.x,this.camera.position.z+=g.z-m.z,this.settle(),this.clearance=this.height,this.moved()};d.addEventListener("pointermove",(x)=>{if(!p)return;if(x.buttons&Fy)_(x,p);else p=null}),d.addEventListener("pointerup",(x)=>{if(x.button!==Rp)return;if(p)_(x,p);p=null})}zoomWheel(d){d.addEventListener("wheel",(p)=>{if(p.preventDefault(),!this.data||this.held)return;this.mouse=ls(p,d);let m=this.hit(),{ray:g}=this.picker,_=this.camera.position,x=m||g.direction.y<0?g.direction:this.camera.getWorldDirection(new q),v=Math.min(m?.distance??this.wayDown(x),Math.max(this.height,Da)*ky);this.zoomAim.copy(_).addScaledVector(x,Math.max(v,Da));let y=p.deltaMode===WheelEvent.DOM_DELTA_LINE?p.deltaY/By*Cp:p.deltaY;this.zoomLeft+=Ci.clamp(y/Cp,-Ip,Ip)*this.settings.zoom/u},{passive:!1})}glideZoom(d){if(this.zoomLeft>0&&this.height>=this.highest){this.zoomLeft=0;return}let p=this.zoomLeft*(1-Math.exp(-d/zy));if(Math.abs(this.zoomLeft-p)<Hy)p=this.zoomLeft;this.zoomLeft-=p;let m=this.camera.position,g=m.distanceTo(this.zoomAim);if(!g)return;let _=Math.max(Math.min(g,Da),g*(1-Oy)**-p);m.lerpVectors(this.zoomAim,m,_/g),this.settle(),this.clearance=this.height,this.moved()}followMouse(d){d.addEventListener("pointermove",(p)=>{if(this.mouse=ls(p,d),this.held=p.buttons,!p.buttons)this.hoverDue=!0}),d.addEventListener("pointerdown",(p)=>{this.held=p.buttons}),d.addEventListener("pointerup",(p)=>{this.held=p.buttons,this.hoverDue=!0}),d.addEventListener("pointerleave",()=>{this.mouse=null,this.hoverDue=!1,this.onHover(null)})}setBrush(d){let p=this.brush;if(this.brush=d,!d){if(this.cancelStroke(),this.ring)this.scene.remove(this.ring),this.ring.geometry.dispose(),this.ring=null}else{if(!p)this.unpick();this.onHover(null),this.placeRing(this.brushAt(),!1)}this.dirty=!0}setStroke(d){this.onStroke=d}cancelStroke(){if(!this.stroke)return!1;return this.stroke=null,this.drawStroke(),!0}refreshMeshes(d,p){if(this.draft=p,!d.length)return;this.heightsVersion++;for(let m of d)this.refresh(m)}setViewFailed(d){this.onViewFailed=d}async refresh(d){let p=this.token,{signal:m}=this.loading,g=this.byNumber.get(d);if(!g||!this.data)return;let _=g.userData.asked=(g.userData.asked??0)+1;try{let x=await this.refreshes(()=>Ua(`/api/editor/${encodeURIComponent(this.trackName)}/mesh/${d}?r=${this.data.revision}&d=${this.draft}`,m));if(p===this.token&&g.userData.asked===_)this.takeVertices(g,x)}catch(x){if(p===this.token&&!m.aborted&&g.userData.asked===_)this.onViewFailed(x.message)}}takeVertices(d,p){let m=d.geometry,g=d.userData.info,_=m.getAttribute("position").data;if(_.array.set(new Float32Array(p,0,g.vertices*qr)),_.needsUpdate=!0,Hp(m,g),m.boundsTree?.refit(),this.marked)this.markDue=!0;this.dirty=!0,this.hoverDue=!0}brushAt(){if(!this.mouse||!this.data)return null;this.picker.setFromCamera(this.mouse,this.camera);let{ray:d}=this.picker,p=this.groundAlong(d.origin,d.direction);return p&&iS.test(p.object.name)?p.point:null}placeRing(d,p){if(!this.brush)return;if(!this.ring){let m=Array.from({length:Up},(g,_)=>{let x=_/Up*2*Math.PI;return new q(Math.cos(x),0,Math.sin(x))});this.ring=new Qi(new Qe().setFromPoints(m),new Pi({depthTest:!1,transparent:!0})),this.ring.renderOrder=10,this.ring.frustumCulled=!1,this.scene.add(this.ring)}if(this.ring.visible=!!d,d)this.ring.position.copy(d),this.ring.scale.setScalar(this.brush.radius),this.ring.material.color.set(this.brush.lower!==p?Op:Fp);this.dirty=!0}drawStroke(){if(this.strokeLine)this.scene.remove(this.strokeLine),this.strokeLine.geometry.dispose(),this.strokeLine=null;if(this.stroke){let d=this.stroke.lower?Op:Fp;this.strokeLine=new pi(new Qe().setFromPoints(this.stroke.line),new Pi({color:d,depthTest:!1,transparent:!0})),this.strokeLine.renderOrder=10,this.strokeLine.frustumCulled=!1,this.scene.add(this.strokeLine)}this.dirty=!0}strokes(d){let p=(m)=>{let g=this.stroke;g.points.push([m.x,m.z]),g.line.push(m.clone().setY(m.y+rS)),this.drawStroke()};d.addEventListener("pointerdown",(m)=>{if(!this.brush||m.button!==Dp)return;this.mouse=ls(m,d);let g=this.brushAt();if(!g)return;this.stroke={points:[],line:[],lower:this.brush.lower!==m.shiftKey},p(g),d.setPointerCapture(m.pointerId)}),d.addEventListener("pointermove",(m)=>{if(!this.brush)return;this.mouse=ls(m,d);let g=this.brushAt();this.placeRing(g,m.shiftKey);let _=this.stroke?.points.at(-1);if(g&&_&&m.buttons&nS&&Math.hypot(g.x-_[0],g.z-_[1])>=sS)p(g)}),d.addEventListener("pointerup",(m)=>{if(!this.stroke||m.button!==Dp)return;let{points:g,lower:_}=this.stroke;this.cancelStroke(),this.onStroke(g,_)}),d.addEventListener("pointercancel",()=>this.cancelStroke()),d.addEventListener("pointerleave",()=>{if(this.ring&&!this.stroke)this.ring.visible=!1,this.dirty=!0})}clicks(d){let p=null;d.addEventListener("pointerdown",(m)=>{p=m.button===0&&!this.brush||m.button===2?{x:m.clientX,y:m.clientY,button:m.button}:null}),d.addEventListener("pointermove",(m)=>{if(p&&Math.hypot(m.clientX-p.x,m.clientY-p.y)>=Jy)p=null}),d.addEventListener("pointerup",(m)=>{if(p&&m.button===p.button){let g=this.pick(m,d),_=d.getBoundingClientRect();if(m.button===2&&g)this.onMenu({x:m.clientX-_.left,y:m.clientY-_.top,width:_.width,height:_.height})}p=null}),d.addEventListener("contextmenu",(m)=>m.preventDefault())}pick(d,p){if(!this.data)return null;this.mouse=ls(d,p);let m=this.hit(),g=m?this.describe(m):null;if(!g)return this.unpick(),null;let _=g.id?this.boundsOf(g.id):null;this.mark(_);let x=_?.getCenter(new q).setY(_.min.y),v={id:g.id,afterBuild:!g.id&&jy.test(g.object),kind:g.kind,sprite:g.sprite,sort:g.sort,position:x?[x.x,x.y,x.z]:g.at};return this.onPick(v),v}setMenu(d){this.onMenu=d}setMarked(d){this.marked=d,this.frameMarked()}frameMarked(){if(this.markDue=!1,this.markedLines)this.scene.remove(this.markedLines),this.markedLines.geometry.dispose(),this.markedLines.material.dispose(),this.markedLines=null;if(this.dirty=!0,!this.marked||!this.data)return;let d=this.marked.tree?this.treesOf(this.marked.sort):this.listedOf(this.marked.sort),p=new Float32Array(d.length*24*3),m=new q;d.forEach((_,x)=>{Ky.forEach(([v,y],S)=>{for(let[M,E]of[v,y].entries())m.set(E&1?_.max.x:_.min.x,E&2?_.max.y:_.min.y,E&4?_.max.z:_.min.z),m.toArray(p,(x*24+S*2+M)*3)})});let g=new Qe().setAttribute("position",new Ve(p,3));this.markedLines=new Li(g,new Pi({color:Lp,depthTest:!1})),this.markedLines.renderOrder=1,this.scene.add(this.markedLines)}listedOf(d){let p=[];for(let m of Wa(this.data.objects,new Set([d]))){let g=m.lastIndexOf("#"),_=this.data.objects[m.slice(0,g)].faces[Number(m.slice(g+1))],x=this.shownBounds(_.map(([v,y,S])=>({mesh:v,from:y,end:y+S})));if(x)p.push(x)}return p}treesOf(d){let p=new Map;for(let m of this.billboardMeshes()){let g=m.userData.info;for(let[_,x,v]of this.billboardsOf(m)){if(this.spriteOf(m,x)!==d)continue;let y=`${g.base}#${_}`;p.set(y,[...p.get(y)??[],{mesh:g.i,from:x,end:v}])}}return[...p.values()].map((m)=>this.shownBounds(m)).filter((m)=>m!==null)}shownBounds(d){let p=new xe,m=new q;for(let{mesh:g,from:_,end:x}of d){let v=this.byNumber.get(g),y=v?.geometry.getIndex().array;if(!v||!y||_>=x||y[_*3]===y[_*3+1])continue;let S=v.geometry.getAttribute("position");for(let M=_*3;M<x*3;M++)p.expandByPoint(m.fromBufferAttribute(S,y[M]))}return p.isEmpty()?null:p}mark(d){if(this.pickedBox)this.scene.remove(this.pickedBox),this.pickedBox.dispose(),this.pickedBox=null;if(d)this.pickedBox=new ia(d,new se(Lp)),this.pickedBox.material.depthTest=!1,this.scene.add(this.pickedBox);this.dirty=!0}boundsOf(d){let p=new xe,m=new q;for(let{mesh:g,from:_,end:x}of this.piecesOf(d)){let v=this.byNumber.get(g);if(!v)continue;let y=v.geometry.getAttribute("position"),S=v.userData.indices??v.geometry.getIndex().array;for(let M=_*3;M<x*3;M++)p.expandByPoint(m.fromBufferAttribute(y,S[M]))}return p}solidAt(d){let p=d.object.material;if(!p.alphaTest||!p.map||!d.uv)return!0;let m=this.alphaOf.get(p.map);if(m===void 0){if(m=p.map.image instanceof ImageBitmap?oS(p.map.image):null,this.alphaOf.set(p.map,m),m)this.usedBytes+=m.data.byteLength}if(!m)return!0;let g=Math.floor((d.uv.x-Math.floor(d.uv.x))*m.width),_=Math.floor((d.uv.y-Math.floor(d.uv.y))*m.height);return m.data[(_*m.width+g)*4+3]/255>=p.alphaTest}hover(){if(!this.mouse||!this.data||this.brush)return;let d=Bp("map2lap.hover",()=>this.hit());this.onHover(d?this.describe(d):null)}hit(){this.picker.setFromCamera(this.mouse,this.camera);let d=this.picker.intersectObjects(this.meshes.filter((p)=>p.visible),!1).find((p)=>this.solidAt(p));return this.wireNear(d?.distance??1/0)??d}wireNear(d){let{ray:p}=this.picker,m=this.renderer.domElement.clientHeight||1,g=2*Math.tan(Ci.degToRad(this.camera.fov)/2)/m*tS,_=new q,x=new q,v=new q,y=new q,S,M=d;for(let E of this.meshes){if(!E.visible||!Qy.test(E.name))continue;let T=E.geometry.boundingSphere,b=p.direction.dot(T.center.clone().sub(p.origin));if(p.distanceSqToPoint(T.center)>(T.radius+Math.max(b,0)*g)**2)continue;let w=E.geometry.getIndex().array,C=E.geometry.getAttribute("position");for(let N=0;N*3<w.length;N+=eS){if(w[N*3]===w[N*3+1])continue;_.fromBufferAttribute(C,w[N*3]),x.fromBufferAttribute(C,w[N*3+1]);let A=p.distanceSqToSegment(_,x,v,y),R=v.distanceTo(p.origin);if(R<M&&A<=(R*g)**2)M=R,S={distance:R,point:y.clone(),object:E,faceIndex:N}}}return S}describe(d){let p=this.data,m=d.object,g=m.userData.info,_=p.materials[g.material],x=p.textures.find((A)=>A.name===_.texture),{x:v,y,z:S}=d.point,M=d.faceIndex??0,E=d.uv?[d.uv.x,d.uv.y]:null,T=g.first_face!==null&&g.first_face!==void 0,b=T?ir(M,g.first_face):null,w=Yh(this.objectPieces.get(g.i),M),C=w?p.objects[w.slice(0,w.lastIndexOf("#"))]:null,N=w?Number(w.slice(w.lastIndexOf("#")+1)):-1;return{id:b!==null?`${g.base}#${b}`:w,kind:w?Va(C.kinds[N]):$h(g.name),sprite:T&&E?Xa(p.atlas,E[0],E[1]):null,sort:w?jr(C,N):null,object:g.name,physics:Zh(g.name),material:_.name,shader:_.shader,texture:_.texture,textureBytes:x?.size??null,vertices:g.vertices,triangles:g.indices/3,triangle:M,uv:E,shownTo:g.lod_out,billboard:T?this.billboard(m,g,M):null,at:[v,y,S],tile:kh(v,S),route:zh(p.route,v,S),latLon:p.anchor?Hh(p.anchor,v,y,S):null,distance:d.distance}}billboard(d,p,m){let g=p.first_face,_=ir(m,g),[x,v]=Kr(_,g,p.indices/3);if(v-x<8)return{number:_,height:null,width:null,foot:null};let y=d.geometry.getIndex(),S=d.geometry.getAttribute("position"),M=new xe,E=new q,T=new q;for(let w=x*3;w<v*3;w++)if(E.fromBufferAttribute(S,y.getX(w)),M.expandByPoint(E),w===x*3)T.copy(E);E.fromBufferAttribute(S,y.getX(x*3+1));let b=M.getCenter(new q);return{number:_,height:M.max.y-M.min.y,width:T.distanceTo(E),foot:[b.x,b.z]}}flyKeys(d){d.tabIndex=0,d.addEventListener("pointerdown",()=>d.focus({preventScroll:!0})),d.addEventListener("keydown",(p)=>{if(!Zy.has(p.code)||p.ctrlKey||p.metaKey||p.altKey)return;p.preventDefault(),this.flying.add(p.code)}),d.addEventListener("keyup",(p)=>this.flying.delete(p.code)),d.addEventListener("blur",()=>this.flying.clear())}fly(d){let p=this.camera.position,m=this.camera.getWorldDirection(new q).setY(0).normalize(),g=new q().crossVectors(m,this.camera.up).normalize(),_=new q;if(this.flying.has("KeyW"))_.add(m);if(this.flying.has("KeyS"))_.sub(m);if(this.flying.has("KeyD"))_.add(g);if(this.flying.has("KeyA"))_.sub(g);if(!_.lengthSq())return;let x=Math.min(Xy,Math.max(Wy,this.height*Vy));p.add(_.normalize().multiplyScalar(x*this.settings.fly/u*d)),this.keepInArea();let v=this.groundBelow();if(v!==null)p.y+=(v+this.clearance-p.y)*(1-Math.exp(-d/Yy));this.settle(v),this.moved()}turn(d,p,m,g){let _=this.camera.getWorldDirection(new q),x=new na().setFromVector3(_);x.theta+=m,x.phi=Ci.clamp(x.phi-g,Math.PI/2+Ap,Math.PI-Ap),_.setFromSpherical(x);let v=this.camera.position;v.copy(d).addScaledVector(_,-p),this.keepHeight(this.groundBelow()),this.clearance=this.height,this.camera.lookAt(v.clone().add(_)),this.moved()}groundAlong(d,p){return this.down.set(d,p),Bp("map2lap.ground",()=>this.down.intersectObjects(this.grounds,!1)[0])}groundBelow(){let d=this.camera.position;return this.groundAlong(new q(d.x,d.y+wp,d.z),new q(0,-1,0))?.point.y??null}wayDown(d){return Math.max(this.camera.position.y-this.lastGround,0)/-d.y}reachOfLook(){return Math.max(Dy,this.height*Ny)}intoArea(d){let{minX:p,maxX:m,minZ:g,maxZ:_}=this.area;d.x=Ci.clamp(d.x,p-Na,m+Na),d.z=Ci.clamp(d.z,g-Na,_+Na)}keepInArea(){let d=this.camera.position,p=this.camera.getWorldDirection(new q),m=d.clone().addScaledVector(p,Math.min(this.wayDown(p),this.reachOfLook())),g=m.clone();this.intoArea(g),d.x+=g.x-m.x,d.z+=g.z-m.z}settle(d){this.keepInArea(),this.keepHeight(d===void 0?this.groundBelow():d)}keepHeight(d){if(d!==null)this.lastGround=d;let p=this.camera.position;p.y=Ci.clamp(p.y,this.lastGround+Py,this.lastGround+this.highest),this.height=p.y-this.lastGround}home(){if(!this.data)return;this.placeCamera(this.data),this.moved()}moved(){this.camera.updateMatrixWorld(),this.dirty=!0,this.hoverDue=!0}resize(){let d=this.host.clientWidth,p=this.host.clientHeight;if(!d||!p)return;this.renderer.setSize(d,p),this.camera.aspect=d/p,this.camera.updateProjectionMatrix(),this.dirty=!0}frame(){let d=performance.now(),p=Math.min(qy,(d-this.lastFrame)/1000);if(this.lastFrame=d,this.shown&&this.flying.size)this.fly(p);if(this.shown&&this.zoomLeft)this.glideZoom(p);if(!this.shown)return;if(this.dirty){this.dirty=!1;for(let m of this.meshes){let g=this.camera.position.distanceTo(m.geometry.boundingSphere.center);m.visible=g>=m.userData.lodIn&&g<m.userData.lodOut}this.renderer.render(this.scene,this.camera)}if(this.hoverDue&&d-this.lastHover>=$y)this.hoverDue=!1,this.lastHover=d,this.hover();if(this.markDue&&d-this.lastMark>=this.markEvery){let m=performance.now();this.frameMarked(),this.lastMark=d,this.markEvery=Math.max(Np,4*(performance.now()-m))}}clear(){for(let d of this.meshes)this.scene.remove(d),d.geometry.boundsTree=void 0,d.geometry.dispose();for(let d of this.textures)d?.then((p)=>{if(!p)return;let m=p.image;if(p.dispose(),m instanceof ImageBitmap)m.close()},()=>{});for(let d of this.materials)d?.dispose();this.meshes=[],this.grounds=[],this.textures=[],this.materials=[],this.usedBytes=0,this.overLimit=!1,this.data=null,this.alphaOf.clear(),this.parts.clear(),this.byNumber.clear(),this.objectPieces=new Map,this.belonging=new Map,this.mark(null)}texture(d,p,m){let g=this.textures[m];if(!g){let _=Eh*p.textures[m].size,x=this.token;if(!Jr(this.usedBytes,_,this.settings.memoryGb))return this.overLimit=!0,Promise.resolve(null);this.usedBytes+=_;let v=this.renderer.capabilities.getMaxAnisotropy(),y=this.loading.signal;g=cS(()=>Ua(`/api/editor/${encodeURIComponent(d)}/texture/${m}?r=${p.revision}`,y).then((S)=>hS(S,p.textures[m].name,v))).then((S)=>{if(S.image instanceof ImageBitmap&&x===this.token){let M=Bh(S.image.width,S.image.height)-_;if(!Jr(this.usedBytes,M,this.settings.memoryGb))return this.usedBytes-=_,this.overLimit=!0,S.dispose(),S.image.close(),null;this.usedBytes+=M}return S}),this.textures[m]=g}return g}material(d,p,m){let g=this.materials[m];if(g)return g;let _=p.materials[m],x=Math.min(1,_.bright),v=new Zo({color:new se(x,x,x)});if(_.alpha_ref>0)v.alphaTest=_.alpha_ref;if(_.blend)v.transparent=!0,v.depthWrite=!1;this.materials[m]=v;let y=p.textures.findIndex((S)=>S.name===_.texture);if(y>=0){let S=this.token;this.texture(d,p,y).then((M)=>{if(!M||S!==this.token)return;v.map=M,v.needsUpdate=!0,this.dirty=!0},()=>{})}return v}addMesh(d,p,m,g){let _=new nn(dS(m,g),this.material(d,p,m.material));if(_.userData={lodIn:m.lod_in,lodOut:m.lod_out,info:m},_.name=m.name,this.scene.add(_),this.meshes.push(_),m.base!==null&&m.base!==void 0){if(!this.parts.has(m.base))this.parts.set(m.base,[]);this.parts.get(m.base).push(_)}this.byNumber.set(m.i,_);for(let x of this.listedOut.get(m.i)??[])this.leaveOutIn(_,x,!0);if(m.base!==null&&m.base!==void 0){for(let x of this.billboardsOut.get(m.base)??[])for(let v of this.piecesOf(x))if(v.mesh===m.i)this.leaveOutIn(_,v,!0);this.leaveOutSorts(_)}if(this.marked)this.markDue=!0;if(Cy.test(m.name)){this.usedBytes+=lS(_),this.grounds.push(_);let x=_.geometry.boundingBox,v=this.camera.position;if(v.x>=x.min.x&&v.x<=x.max.x&&v.z>=x.min.z&&v.z<=x.max.z)this.settle()}this.dirty=!0,this.hoverDue=!0}placeCamera(d){let p=new q,m=new q(0,0,1);if(d.start)p.set(...d.start.pos),m.set(...d.start.forward).normalize();else if(d.meshes.length){for(let y of d.meshes)p.add(new q(...y.center));p.divideScalar(d.meshes.length)}this.camera.position.copy(p).addScaledVector(m,-Ry).add(new q(0,Th,0)),this.camera.lookAt(p),this.camera.updateMatrixWorld(),this.clearance=this.height=Th,this.lastGround=p.y,this.zoomLeft=0,this.area=Ha(d.meshes.filter((y)=>!Iy.test(y.name)));let{minX:g,maxX:_,minZ:x,maxZ:v}=this.area;this.highest=Math.min(Gy,Math.max(Pp,_-g,v-x))}}function fS({name:d,title:p,taken:m,built:g,visible:_,controls:x,onStatus:v,onSaved:y}){let S=s(null),M=s(null),[E,T]=n(null),[b,w]=n(null);return i(()=>{let C=new Ah(S.current);return C.setHover(w),T(C),()=>{C.dispose(),T(null)}},[]),i(()=>{E?.show(_)},[E,_]),i(()=>{E?.setControls(x)},[E,x]),i(()=>{E?.open(d,v)},[E,d,g,v]),e("div",{id:"scene",className:Ba.scene,hidden:!_,ref:M,children:[t("div",{className:Ba.view,ref:S}),E&&d&&t(eu,{name:d,title:p,taken:m,view:E,scene:M,reopen:()=>void E.open(d,v),onSaved:y},`${d} ${g}`),t(iu,{hovered:b})]})}export{fS as default};
