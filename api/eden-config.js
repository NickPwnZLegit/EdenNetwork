// Public Firebase WEB config, not an admin service account.
// Registration remains OFF until exact same-project configuration is reviewed.
const safe=value=>typeof value==="string"?value:"";
function readiness(env=process.env){
 const config={apiKey:safe(env.EDEN_FIREBASE_API_KEY),authDomain:safe(env.EDEN_FIREBASE_AUTH_DOMAIN),
 projectId:safe(env.EDEN_FIREBASE_PROJECT_ID),appId:safe(env.EDEN_FIREBASE_APP_ID)};
 const configured=Object.values(config).every(Boolean);
 const missingFields=Object.keys(config).filter(key=>!config[key]);
 const projectMatchesShared=Boolean(config.projectId&&env.EDEN_SHARED_FIREBASE_PROJECT_ID===config.projectId);

 const registryEnabled=env.VERCEL_ENV==="preview"&&env.EDEN_REGISTRY_ENABLED==="true"
  &&projectMatchesShared;
 return {configured,registryEnabled,projectMatchesShared,missingFields,config:configured?config:null};
}
module.exports=function handler(req,res){
 res.setHeader("Cache-Control","private, no-store");
 if(req.method!=="GET")return res.status(405).json({error:"GET required"});
 const state=readiness();
 return res.status(200).json({configured:state.configured,registryEnabled:state.registryEnabled,
  config:state.config,missingFields:state.missingFields,projectMatchesShared:state.projectMatchesShared,identityResearchOnly:true});
};
module.exports._test={readiness};
