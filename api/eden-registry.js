// EdenNetwork account registration uses the primary Light of Hope registrar.
// Preview-only; same-project Firebase Auth account is verified upstream.
// No personal registry directory, credential dumps or biometric collection.
const ACTIONS=new Set(["check","reserve-activate","validate-legacy"]);
const NAME=/^[\p{L}\p{N}_ .'-]{4,64}$/u;
function enabled(env=process.env){
 return env.VERCEL_ENV==="preview"&&env.EDEN_REGISTRY_ENABLED==="true"&&
 !!env.EDEN_FIREBASE_PROJECT_ID&&env.EDEN_FIREBASE_PROJECT_ID===env.EDEN_SHARED_FIREBASE_PROJECT_ID;
}
function normalize(raw){
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||!ACTIONS.has(raw.action))
  throw Object.assign(new Error("Unsupported registration action."),{status:400});
 if(raw.action==="validate-legacy")return {action:raw.action};
 if(typeof raw.requestedName!=="string"||!NAME.test(raw.requestedName.trim()))
  throw Object.assign(new Error("Choose a valid Eden RealID name."),{status:400});
 return {action:raw.action,requestedName:raw.requestedName.trim()};
}
function result(res,status,body){res.setHeader("Cache-Control","no-store");return res.status(status).json(body);}
module.exports=async(req,res)=>{
 if(req.method==="GET")return result(res,200,{registryEnabled:enabled(),humanUniquenessProved:false});
 if(req.method!=="POST")return result(res,405,{ok:false,error:"POST required."});
 if(!enabled())return result(res,503,{ok:false,error:"Shared Eden registrar is not enabled."});
 const auth=String(req.headers?.authorization||"");
 if(!/^Bearer [A-Za-z0-9._-]{20,4096}$/.test(auth))return result(res,401,{ok:false,error:"Valid signed-in account required."});
 if(Buffer.byteLength(JSON.stringify(req.body||{}))>1300)return result(res,413,{ok:false,error:"Request too large."});
 try{
  const body=normalize(req.body);
  const response=await fetch("https://light-of-hope.net/api/eden-realid",{
    method:"POST",headers:{"Content-Type":"application/json",Authorization:auth},
    body:JSON.stringify(body),redirect:"error",signal:AbortSignal.timeout(12000)
  });
  const d=await response.json().catch(()=>({}));
  if(!response.ok){
   const status=[400,401,402,403,404,409,422,429,503].includes(response.status)?response.status:502;
   return result(res,status,{ok:false,error:String(d.message||d.error||"Registration failed.").slice(0,300)});
  }
  return result(res,200,{ok:true,available:d.available===true,status:d.status||null,
   displayName:d.displayName||d.activation?.displayName||null,reason:d.reason||null});
 }catch(e){return result(res,e.status||502,{ok:false,error:e.status?e.message:"Shared registrar is temporarily unavailable."});}
};
module.exports._test={enabled,normalize};
