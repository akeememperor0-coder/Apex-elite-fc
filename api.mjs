import {getStore} from "@netlify/blobs";
const st=()=>getStore("apex"),today=()=>new Date().toISOString().slice(0,10);
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","cache-control":"no-store"}});
const DEF=()=>({settings:{},fees:[{n:"Registration fee",a:5000},{n:"Monthly training fee",a:10000},{n:"Kit",a:15000}],schedule:[{d:"Tuesday",t:"4:00 pm"},{d:"Thursday",t:"4:00 pm"},{d:"Saturday",t:"8:30 am"}],news:[{id:1,title:"Registration is open",text:"New players can now register for a trial.",date:today()}],photos:[],players:[],pays:[],next:0});
const okImg=x=>typeof x==="string"&&/^data:image\/(jpeg|png|webp);base64,/.test(x)&&x.length<3e6;
const KEYS=["wa","bankName","acctNo","acctName","phone","address","tagline"];
export default async(req)=>{
 const u=new URL(req.url),p=u.pathname.replace(/^\/api\//,"");
 try{
  if(req.method==="GET"&&p==="photo"){
   const id=(u.searchParams.get("id")||"").replace(/[^\w-]/g,""),d=await st().get("p-"+id);
   if(!d)return new Response("",{status:404});
   return new Response(Buffer.from(d.slice(d.indexOf(",")+1),"base64"),{headers:{"content-type":d.slice(5,d.indexOf(";")),"cache-control":"public,max-age=3600"}});
  }
  const s=Object.assign(DEF(),await st().get("state",{type:"json"})||{});
  if(p==="site"){const{players,pays,code,next,...pub}=s;return J(pub)}
  const b=await req.json().catch(()=>({}));
  if(p==="register"){
   const n=String(b.name||"").trim().slice(0,80),ph=String(b.phone||"").trim().slice(0,30);
   if(!n||!ph)return J({error:"Name and phone are required"},400);
   const id="AE-"+String(s.next=(s.next||0)+1).padStart(4,"0");
   s.players.push({id,name:n,age:String(b.age||"").slice(0,3),grp:String(b.grp||"").slice(0,30),par:String(b.par||"").slice(0,80),phone:ph,pos:String(b.pos||"").slice(0,30),st:"Trial",date:today()});
   await st().setJSON("state",s);return J({id});
  }
  if(p==="pay"){
   const pl=s.players.find(x=>x.id===b.pid),f=s.fees.find(x=>x.n===b.type);
   if(!pl)return J({error:"Player ID not found. Register first."},404);
   if(!f)return J({error:"Choose what you are paying for"},400);
   const y={ref:"R"+Date.now().toString(36).toUpperCase(),pid:pl.id,pname:pl.name,type:f.n,amt:f.a,method:b.method==="Cash at training"?b.method:"Bank transfer",st:"Pending",date:today()};
   s.pays.push(y);await st().setJSON("state",s);return J(y);
  }
  if(p==="admin"){
   if(b.code!==(s.code||process.env.ADMIN_CODE||"APEX2026")){await new Promise(r=>setTimeout(r,800));return J({error:"Wrong admin code"},401)}
   const d=b.data||{};
   switch(b.action){
    case"load":break;
    case"settings":KEYS.forEach(k=>{if(k in d)s.settings[k]=String(d[k]).slice(0,300)});break;
    case"lists":s.fees=(d.fees||[]).map(f=>({n:String(f.n).slice(0,60),a:Number(f.a)||0})).filter(f=>f.n);s.schedule=(d.schedule||[]).map(x=>({d:String(x.d).slice(0,30),t:String(x.t).slice(0,30)})).filter(x=>x.d);break;
    case"addNews":s.news.unshift({id:Date.now(),title:String(d.title||"").slice(0,120),text:String(d.text||"").slice(0,1000),date:today()});break;
    case"delNews":s.news=s.news.filter(x=>x.id!==d.id);break;
    case"addPhoto":{if(!okImg(d.img))return J({error:"Invalid image"},400);const id="g"+Date.now().toString(36);await st().set("p-"+id,d.img);s.photos.push({id});break}
    case"delPhoto":s.photos=s.photos.filter(x=>x.id!==d.id);await st().delete("p-"+String(d.id).replace(/[^\w-]/g,""));break;
    case"hero":if(!okImg(d.img))return J({error:"Invalid image"},400);await st().set("p-hero",d.img);s.settings.heroV=Date.now();break;
    case"player":s.players=d.del?s.players.filter(x=>x.id!==d.id):s.players.map(x=>x.id===d.id?{...x,st:d.st}:x);break;
    case"confirm":s.pays=s.pays.map(x=>x.ref===d.ref?{...x,st:"Confirmed"}:x);break;
    case"code":if(String(d.code).length<6)return J({error:"Use at least 6 characters"},400);s.code=String(d.code);break;
    default:return J({error:"Unknown action"},400);
   }
   if(b.action!=="load")await st().setJSON("state",s);
   const{code:_c,...out}=s;return J(out);
  }
 }catch(e){return J({error:"Server error"},500)}
 return J({error:"Not found"},404);
};
export const config={path:"/api/*"};
