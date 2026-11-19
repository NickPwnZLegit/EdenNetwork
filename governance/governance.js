import {SAMPLE_PROPOSALS,castSyntheticBallot,tallySyntheticBallots} from "./dao-policy.mjs";
import {eligibleEdenPreviewMember} from "./preview-eligibility.mjs";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {getFirestore,doc,getDoc} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";
const $=id=>document.getElementById(id);
let registry=Object.create(null);
let previewEligible=false;
const access=document.getElementById("eden-dao-access");
const castButton=$("cast");
castButton.disabled=true;
function eligibilityMessage(message,eligible=false){
 previewEligible=eligible;
 castButton.disabled=!eligible;
 if(access)access.textContent=message;
}
async function checkMember(user,db){
 if(!user){eligibilityMessage("Existing Eden RealID sign-in is required. Guests cannot cast even demonstration ballots.");return;}
 try{
  const [owner,agreement]=await Promise.all([
   getDoc(doc(db,"edenRealIdOwners",user.uid)),
   getDoc(doc(db,"agreements",user.uid))
  ]);
  const eligible=eligibleEdenPreviewMember({uid:user.uid,owner:owner.exists()?owner.data():null,agreement:agreement.exists()?agreement.data():null});
  eligibilityMessage(eligible
   ?"Existing Eden RealID and current ecosystem agreement recognized. This is still a synthetic demonstration, not a real DAO vote."
   :"Your existing Eden RealID and current 30-day ecosystem agreement must be active before participating. Open Light of Hope to complete or renew them.",eligible);
 }catch{
  eligibilityMessage("Unable to verify your existing Eden RealID and agreement. Voting remains locked.");
 }
}
(async()=>{
 try{
  const response=await fetch("/api/eden-config",{cache:"no-store"});
  if(!response.ok)throw Error("config");
  const cfg=await response.json();
  if(!cfg.configured||!cfg.config)throw Error("config");
  const app=initializeApp(cfg.config);
  const auth=getAuth(app),db=getFirestore(app);
  onAuthStateChanged(auth,user=>checkMember(user,db));
 }catch{
  eligibilityMessage("Eden account verification is not configured here. Voting remains locked; public research is readable.");
 }
})();

for(const p of SAMPLE_PROPOSALS){
 const card=document.createElement("article");card.className="card";
 const sub=document.createElement("small");sub.textContent=p.project+" · Research proposal";
 const title=document.createElement("h3");title.textContent=p.title;
 const desc=document.createElement("p");desc.textContent=p.description;
 card.append(sub,title,desc);$("proposals").append(card);
 const option=document.createElement("option");option.value=p.id;option.textContent=p.project+" · "+p.title;
 $("proposal").append(option);
}
function render(){
 const id=$("proposal").value;
 $("active").textContent=SAMPLE_PROPOSALS.find(x=>x.id===id)?.title||"";
 const data=tallySyntheticBallots(registry,id);
 const root=$("totals");root.replaceChildren();
 for(const [name,val] of [["Support",data.support],["Oppose",data.oppose],["Abstain",data.abstain],["Synthetic ballots",data.ballots]]){
  const b=document.createElement("div");const strong=document.createElement("strong");strong.textContent=String(val);const tag=document.createElement("span");tag.textContent=name;b.append(strong,tag);root.append(b);
 }
}
$("proposal").addEventListener("change",render);
$("cast").addEventListener("click",()=>{
 if(!previewEligible){$("notice").textContent="An active Eden RealID and current ecosystem agreement are required.";return;}
 try{
  registry=castSyntheticBallot(registry,{proposalId:$("proposal").value,fixtureMember:$("member").value,
   choice:$("choice").value,edenHolder:$("holder").value==="yes"});
  $("notice").textContent="Synthetic ballot counted in this tab only; no blockchain or real account affected.";
 }catch(err){$("notice").textContent=err.message;}
 render();
});
render();
