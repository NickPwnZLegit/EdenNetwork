import {initializeApp} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,sendPasswordResetEmail,signOut,setPersistence,browserLocalPersistence} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {getFirestore,doc,getDoc,collection,writeBatch,serverTimestamp,Timestamp} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
const $=id=>document.getElementById(id);
let auth=null,db=null,registryEnabled=false,mode="signin",agreementTerms=null;
let authRevision=0;
const AGREEMENT_VERSION="ecosystem-2026.11.18.1";
const RENEW_KEY="eden-ecosystem-reauth-v1";
const pending=()=>{try{return sessionStorage.getItem(RENEW_KEY)||""}catch{return ""}};
const mark=uid=>{try{sessionStorage.setItem(RENEW_KEY,uid);return true}catch{return false}};
const clear=()=>{try{sessionStorage.removeItem(RENEW_KEY)}catch{}};
const termsStatus=message=>{$("eden-agreement-status").textContent=message};
async function displayTerms(){
 agreementTerms=null;
 $("eden-accept-check").checked=false;$("eden-accept-check").disabled=true;
 $("eden-accept-submit").disabled=true;
 const host=$("eden-agreement-full");host.replaceChildren();
 try{
  const res=await fetch("https://light-of-hope.net/api/ecosystem-agreement",{cache:"no-store"});
  if(!res.ok)throw Error("Canonical agreement text is unavailable.");
  const t=await res.json();
  if(t.ok!==true||t.version!==AGREEMENT_VERSION||t.validityDays!==30||
   !Array.isArray(t.sections)||t.sections.length<3)throw Error("Agreement version mismatch. Please use Light of Hope to renew.");
  agreementTerms=t;
  const title=document.createElement("h3");title.textContent=t.title;host.append(title);
  const intro=document.createElement("p");intro.textContent=t.acknowledgement;host.append(intro);
  for(const sec of t.sections){
   const part=document.createElement("section");
   const h=document.createElement("h3");h.textContent=sec.title;part.append(h);
   for(const paragraph of sec.paragraphs||[]){
    const p=document.createElement("p");p.textContent=paragraph;part.append(p);
   }
   host.append(part);
  }
  $("eden-agreement-version").textContent="Version "+t.version+" · 30-day acknowledgement";
  $("eden-accept-check").disabled=false;termsStatus("Read the full terms and confirm below.");
 }catch(e){const p=document.createElement("p");p.textContent=e.message;host.append(p);termsStatus("Acceptance is paused until the canonical terms can be verified.");}
}
async function checkAgreementAfterLogin(user){
 if(!user||!db||auth?.currentUser?.uid!==user.uid)return;
 try{
  const snap=await getDoc(doc(db,"agreements",user.uid));
  if(auth?.currentUser?.uid!==user.uid)return;
  const a=snap.exists()?snap.data():{};
  const current=a.accepted===true&&a.agreementVersion===AGREEMENT_VERSION&&
   (a.uid==null||a.uid===user.uid)&&a.expiresAt?.toMillis?.()>Date.now();
  if(current){clear();$("eden-agreement-panel").hidden=true;return;}
  if(auth?.currentUser?.uid!==user.uid)return;
  if(pending()!==user.uid&&mark(user.uid)){
   status("Your agreement needs renewal. Sign in again to review it.");
   const completed=await signOut(auth).then(()=>true).catch(()=>false);
   if(completed)return;
   clear();
  }
  if(auth?.currentUser?.uid!==user.uid)return;
  $("eden-agreement-panel").hidden=false;
  status("Please review the shared 30-day ecosystem agreement before participating.");
  await displayTerms();
  $("eden-agreement-panel").scrollIntoView({block:"start",behavior:"smooth"});
 }catch{status("Agreement verification could not be completed. Member actions remain locked.");}
}
$("eden-accept-check").addEventListener("change",()=>{
 $("eden-accept-submit").disabled=!($("eden-accept-check").checked&&agreementTerms&&auth?.currentUser);
});
$("eden-accept-submit").addEventListener("click",async()=>{
 if(!auth?.currentUser||!agreementTerms||agreementTerms.version!==AGREEMENT_VERSION||!$("eden-accept-check").checked){
  termsStatus("Read and agree to the complete current agreement first.");return;
 }
 const button=$("eden-accept-submit");button.disabled=true;
 try{
  const uid=auth.currentUser.uid,now=Date.now();
  const history=doc(collection(db,"agreementHistory",uid,"acceptances"));
  const data={uid,agreementId:agreementTerms.id,agreementVersion:AGREEMENT_VERSION,
   effectiveLabel:agreementTerms.effectiveLabel,accepted:true,
   acceptedAt:serverTimestamp(),acceptedAtClient:Timestamp.fromMillis(now),
   expiresAt:Timestamp.fromMillis(now+30*24*3600_000),validityDays:30,updatedAt:serverTimestamp()};
  const batch=writeBatch(db);
  batch.set(doc(db,"agreements",uid),data,{merge:true});
  batch.set(history,{...data,historyRecordId:history.id});
  await batch.commit();
  const snap=await getDoc(doc(db,"agreements",uid));
  if(!snap.exists()||snap.data().agreementVersion!==AGREEMENT_VERSION||!snap.data().accepted)
   throw Error("Acceptance could not be verified.");
  clear();$("eden-agreement-panel").hidden=true;
  status("Shared ecosystem agreement accepted. EdenNetwork member access is ready.");
 }catch(e){termsStatus("Acceptance not complete: "+(e.message||"Try again."));}
 finally{button.disabled=false;}
});

function status(m){$("status").textContent=m;}
function screen(user){$("logged-out").hidden=Boolean(user);$("logged-in").hidden=!user;}
function selectMode(next){mode=next;const creating=mode==="create";$("name-label").hidden=!creating;$("eden-name").required=creating;$("auth-submit").textContent=creating?"Create Eden RealID":"Sign in";$("reg-note").textContent=creating
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
async function loadOwner(user){
 if(!user||!db)return;
 $("complete-panel").hidden=true;
 try{
  const o=await getDoc(doc(db,"edenRealIdOwners",user.uid));
  if(auth?.currentUser?.uid!==user.uid)return false;
  if(o.exists()&&["active","grandfathered"].includes(o.data().status)){
   $("account-status").textContent="Eden RealID: "+(o.data().displayName||"registered")+" · UID kept private";
   return true;
  }
  $("account-status").textContent="Your existing account is signed in, but Eden RealID activation is incomplete.";
 }catch{
  $("account-status").textContent="Signed in. The private registry ownership check is not authorized in this environment.";
 }
 $("complete-panel").hidden=!registryEnabled;
 return false;
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
$("logout").addEventListener("click",()=>auth&&signOut(auth));
(async()=>{
 try{
  const response=await fetch("/api/eden-config",{cache:"no-store"});const cfg=await response.json();
  if(!cfg.configured||!cfg.config){status("Firebase web authentication is not configured in this preview.");return;}
  registryEnabled=cfg.registryEnabled===true;
  const app=initializeApp(cfg.config);auth=getAuth(app);db=getFirestore(app);
  try{await setPersistence(auth,browserLocalPersistence);}catch{status("Persistent sign-in unavailable on this browser.");}
  selectMode("signin");
  onAuthStateChanged(auth,async user=>{
   const revision=++authRevision;
   screen(user);
   if(user){
    status("Account authenticated on this site.");
    const ownerReady=await loadOwner(user);
    if(revision!==authRevision||auth.currentUser?.uid!==user.uid)return;
    if(ownerReady)await checkAgreementAfterLogin(user);
   }else{
    status(pending()?"Please sign in again to review and renew your ecosystem agreement.":"Choose existing sign-in or create Eden RealID.");
    $("renewal-notice").hidden=!pending();$("eden-agreement-panel").hidden=true;
   }
  });
 }catch{status("Eden account service is unavailable. Production accounts were not modified.");}
})();
