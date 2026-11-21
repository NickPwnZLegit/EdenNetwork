import {initializeApp} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,setPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {getFirestore,doc,getDoc} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
import {inspectPreZkDevice,testPreZkDevice} from "../prezk/device.js";
const $=id=>document.getElementById(id);
let auth=null,db=null,registryEnabled=false,mode="signin";
const AGREEMENT_VERSIONS=new Set(["v16-2026.08.27.1","ecosystem-2026.11.18.1"]);
function status(m){$("status").textContent=m;}
function screen(user){$("logged-out").hidden=Boolean(user);$("logged-in").hidden=!user;}
function selectMode(next){mode=next;const creating=mode==="create";$("name-label").hidden=!creating;$("eden-name").required=creating;$("new-account-consent").hidden=!creating;$("no-existing-eden").required=creating;$("auth-submit").textContent=creating?"Create Eden RealID":"Sign in";$("reg-note").textContent=creating
 ?registryEnabled?"Shared registration is available in this development preview.":"New registration is disabled until the shared Firebase project and registrar are verified."
 :"Sign in using the email/password already associated with your ecosystem account.";}
async function register(action,name){
 if(!auth?.currentUser||!registryEnabled)throw Error("Eden RealID registration is paused until the shared registrar is verified.");
 const token=await auth.currentUser.getIdToken();
 const r=await fetch("/api/eden-registry",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({action,requestedName:name})});
 const v=await r.json().catch(()=>({}));
 if(!r.ok||v.ok!==true)throw Error(v.error||"Registration could not be completed.");
 return v;
}
async function loadAgreement(user){
 const node=$("agreement-status");
 if(!user||!db){node.textContent="";return;}
 try{
  const agreement=await getDoc(doc(db,"agreements",user.uid));
  const a=agreement.exists()?agreement.data():null;
  const expires=a?.expiresAt?.toDate?.();
  const current=a?.accepted===true&&AGREEMENT_VERSIONS.has(a.agreementVersion)&&
   expires instanceof Date&&expires.getTime()>Date.now();
  node.textContent=current
   ?"Community agreement is current. Access permissions remain enforced by the network."
   :"Your 30-day community agreement is missing, expired or requires renewal. Renew it through your existing Light of Hope account before protected participation.";
 }catch{
  node.textContent="Agreement verification is unavailable. Protected actions remain locked until it can be checked.";
 }
}
async function loadOwner(user){
 if(!user||!db)return;
 $("complete-panel").hidden=true;
 try{
  const o=await getDoc(doc(db,"edenRealIdOwners",user.uid));
  if(o.exists()&&["active","grandfathered"].includes(o.data().status)){
   $("account-status").textContent="Eden RealID: "+(o.data().displayName||"registered")+" · UID kept private";
   return;
  }
  $("account-status").textContent="Your existing account is signed in, but Eden RealID activation is incomplete.";
 }catch{
  $("account-status").textContent="Signed in. The private registry ownership check is not authorized in this environment.";
 }
 $("complete-panel").hidden=!registryEnabled;
}
$("login-mode").addEventListener("click",()=>selectMode("signin"));
$("create-mode").addEventListener("click",()=>selectMode("create"));
$("reset").addEventListener("click",async()=>{
 if(!auth)return;
 const email=$("email").value.trim();
 if(!email){status("Enter your email address to request a reset.");return;}
 try{await sendPasswordResetEmail(auth,email);status("If that email is registered, check your inbox for recovery instructions.");}
 catch{status("Password recovery is unavailable. Check the email address and configuration.");}
});
$("auth-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!auth)return;const email=$("email").value.trim(),password=$("password").value,requestedName=$("eden-name").value.trim(),creating=mode==="create";
 $("auth-submit").disabled=true;
 try{
  if(creating&&!registryEnabled)throw Error("Shared Eden registration is not enabled.");
  if(creating&&!$("no-existing-eden").checked)throw Error("Already have an Eden RealID? Use Existing sign-in instead of creating another account.");
  if(creating){
   if(!requestedName)throw Error("Choose an Eden RealID.");
   // A Firebase UID must exist before requesting a private exact-name check.
   await createUserWithEmailAndPassword(auth,email,password);
   try{
    const available=await register("check",requestedName);
    if(available.available!==true)throw Error("This Eden RealID cannot be reserved. Choose another using your existing sign-in.");
    await register("reserve-activate",requestedName);
    status("Eden RealID created. Visit Light of Hope to accept your community agreement.");
   }catch(err){status("Email account is recoverable, but Eden activation needs completing: "+err.message);}
  }else{
   await signInWithEmailAndPassword(auth,email,password);
   status("Signed in with your existing ecosystem account.");
  }
  $("password").value="";
 }catch(err){status(err?.code||err?.message||"Sign-in unavailable.");}
 finally{$("auth-submit").disabled=false;}
});
$("complete").addEventListener("click",async()=>{const name=$("complete-name").value.trim();$("complete").disabled=true;try{
 await register("reserve-activate",name);status("Eden RealID activated. Accept the community agreement on Light of Hope.");await loadOwner(auth.currentUser);
 }catch(e){status(e.message);}finally{$("complete").disabled=false;}});
async function preZkAction(action){
 const u=auth?.currentUser;if(!u)return;
 const out=$("prezk-status");out.textContent="Checking device security preview…";
 for(const id of ["prezk-run","prezk-refresh","prezk-recovery"])$(id).disabled=true;
 try{
  const token=await u.getIdToken();
  const args={uid:u.uid,idToken:token,network:"eden-network"};
  if(action==="run"){
   const result=await testPreZkDevice(args);
   out.textContent=result.status==="device-enrolled"?"Browser key enrolled with a server timestamp.":"This browser signed a fresh server challenge.";
  }else if(action==="recovery"){
   const response=await fetch("/api/prezk-device",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",Authorization:"Bearer "+token},body:JSON.stringify({action:"request-recovery",network:"eden-network"})});
   const json=await response.json().catch(()=>({}));
   if(!response.ok||!json.ok)throw Error(json.error||"Request unavailable.");
   out.textContent="Private device recovery request recorded for human review. The existing key was not replaced.";
  }else{
   const value=await inspectPreZkDevice(args);
   out.textContent=value.enrolled?"Device key enrolled on EdenNetwork "+(value.registeredAt||""):"No device key enrolled on this site. Your existing Firebase account remains unaffected.";
  }
 }catch(error){out.textContent=error.message||"Device proof test unavailable."}
 finally{for(const id of ["prezk-run","prezk-refresh","prezk-recovery"])$(id).disabled=false}
}
$("prezk-run").addEventListener("click",()=>preZkAction("run"));
$("prezk-refresh").addEventListener("click",()=>preZkAction("refresh"));
$("prezk-recovery").addEventListener("click",()=>preZkAction("recovery"));
$("logout").addEventListener("click",()=>auth&&signOut(auth));
(async()=>{
 try{
  const response=await fetch("/api/eden-config",{cache:"no-store"});const cfg=await response.json();
  if(!cfg.configured||!cfg.config){
   const allowed=new Set(["apiKey","authDomain","projectId","appId"]);
   const fields=Array.isArray(cfg.missingFields)?cfg.missingFields.filter(x=>allowed.has(x)):[];
   status("EdenNetwork Firebase web authentication is incomplete"+(fields.length?": "+fields.join(", "):".")+" The existing account is safe; this deployment must be configured before login.");
   return;
  }
  registryEnabled=cfg.registryEnabled===true;
  const app=initializeApp(cfg.config);auth=getAuth(app);db=getFirestore(app);
  try{await setPersistence(auth,browserLocalPersistence);}catch{status("Persistent sign-in unavailable on this browser.");}
  selectMode("signin");
  onAuthStateChanged(auth,async user=>{
   screen(user);
   if(user){status("Account authenticated on this site.");await Promise.all([loadOwner(user),loadAgreement(user)]);}
   else{$("agreement-status").textContent="";status("Choose existing sign-in or create Eden RealID.");}
  });
 }catch{status("Eden account service is unavailable. Production accounts were not modified.");}
})();
