// Read-only, preview-only cross-network account readiness adapter.
// RealID, emails, handles and account UIDs are never used as lookup parameters.
function enabled(env=process.env){
 return env.VERCEL_ENV==="preview" && env.EDEN_ACCOUNT_STATUS_TESTNET_ENABLED==="true" &&
   Boolean(env.EDEN_FIREBASE_PROJECT_ID) &&
   env.EDEN_FIREBASE_PROJECT_ID===env.EDEN_SHARED_FIREBASE_PROJECT_ID;
}
function trustedPreviewOrigin(env=process.env){
 const raw=env.HOPE_ACCOUNT_STATUS_PREVIEW_ORIGIN;
 if(typeof raw!=="string"||!raw)return null;
 try{
  const url=new URL(raw);
  if(url.protocol!=="https:"||url.username||url.password||url.port||
     url.pathname!=="/"||url.search||url.hash||
     !/^(?:light-of-hope|light-of-hope-site)[a-z0-9-]*\\.vercel\\.app$/.test(url.hostname))
    return null;
  return url.origin;
 }catch{return null;}
}
function validAuthorization(value){
 return typeof value==="string" && /^Bearer [A-Za-z0-9._-]{20,4096}$/.test(value);
}
function safeStatus(data){
 if(data?.ok!==true||data?.schemaVersion!==1||data?.mode!=="read-only-testnet")return null;
 const fields=["edenRealIdActive","agreementRecognized","pwnzGamertagLinked",
   "sharedServicesAuthorized","lightVaultTransfersEnabled","humanUniquenessVerified"];
 if(!fields.every(name=>typeof data[name]==="boolean"))return null;
 return {ok:true,schemaVersion:1,mode:"read-only-testnet",
   ...Object.fromEntries(fields.map(name=>[name,data[name]]))};
}
function reply(res,status,data){
 res.setHeader("Cache-Control","private, no-store, max-age=0");
 res.setHeader("X-Content-Type-Options","nosniff");
 res.setHeader("Vary","Authorization");
 return res.status(status).json(data);
}
module.exports=async(req,res)=>{
 if(req.method!=="GET"){res.setHeader("Allow","GET");return reply(res,405,{ok:false,error:"GET required."});}
 if(!enabled())return reply(res,503,{ok:false,error:"Account status TestNet is disabled."});
 if(req.query && Object.keys(req.query).length)return reply(res,400,{ok:false,error:"Account lookups are not supported."});
 const auth=req.headers?.authorization;
 if(!validAuthorization(auth))return reply(res,401,{ok:false,error:"Sign in with your existing account."});
 try{
  const origin=trustedPreviewOrigin();
  if(!origin)return reply(res,503,{ok:false,error:"Approved Light of Hope preview origin not configured."});
  const r=await fetch(origin+"/api/eden-account-status",{
   method:"GET",headers:{Authorization:auth,Accept:"application/json"},
   redirect:"error",signal:AbortSignal.timeout(10000)
  });
  if(!r.ok)return reply(res,[401,403,503].includes(r.status)?r.status:503,
    {ok:false,error:"Account verification is unavailable or not authorized."});
  const status=safeStatus(await r.json());
  return status?reply(res,200,status):reply(res,502,{ok:false,error:"Invalid account status response."});
 }catch{return reply(res,503,{ok:false,error:"Shared account verification unavailable."});}
};
module.exports._test={enabled,validAuthorization,safeStatus,trustedPreviewOrigin};
