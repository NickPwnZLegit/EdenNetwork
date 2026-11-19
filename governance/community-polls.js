// Eden community conversation room. All mutations occur on the trusted
// Light of Hope server. Public readers never receive account UIDs or raw votes.
import {initializeApp,getApps} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
const $=id=>document.getElementById(id);
const API="https://light-of-hope.net/api/eden-governance";
let auth=null,user=null;
let feed={polls:[],proposals:[],enabled:false};
const message=(s)=>{$("community-message").textContent=s;};
function element(tag,txt,cls){
 const n=document.createElement(tag);if(txt!=null)n.textContent=String(txt);
 if(cls)n.className=cls;return n;
}
async function api(body=null){
 const headers={"Accept":"application/json"};
 if(body){
  if(!user)throw Error("Sign in to an existing Eden RealID account first.");
  headers["Content-Type"]="application/json";
  headers.Authorization="Bearer "+await user.getIdToken();
 }
 const r=await fetch(API,{method:body?"POST":"GET",headers,body:body?JSON.stringify(body):undefined,cache:"no-store"});
 const data=await r.json().catch(()=>({}));
 if(!r.ok||data.ok!==true)throw Error(data.error||"Governance service is unavailable.");
 return data;
}
async function reload(){
 try{
  feed=await api();
  $("community-disabled").hidden=feed.enabled;
  $("community-active").hidden=!feed.enabled;
  if(!feed.enabled){message(feed.message||"Member polls are not available yet.");return;}
  render();message("Community polls are advisory. Only admins can submit official proposals.");
 }catch(e){
  $("community-disabled").hidden=false;$("community-active").hidden=true;
  message(e.message||"Unable to load community polls.");
 }
}
function renderList(id,items,official=false){
 const host=$(id);host.replaceChildren();
 if(items.length===0){host.append(element("p",official?"No admin consultations have been opened.":"No community polls yet. Share an idea when member polls are enabled.","muted"));return;}
 for(const poll of items){
  const card=element("article",null,"eden-poll-card");
  card.append(element("small",(official?"Admin consultation":"Member poll")+" · "+poll.category+" · "+poll.status+" · "+poll.reviewStatus));
  card.append(element("h3",poll.title),element("p",poll.details));
  if(official&&poll.impact)card.append(element("p","Potential impact: "+poll.impact,"muted"));
  const opts=element("div",null,"eden-poll-options");
  poll.options.forEach((opt,i)=>{
   const row=element("div",null,"eden-poll-option");
   const count=Number(poll.counts?.[i]||0);
   const button=element("button",opt+" · "+count+" votes");
   button.type="button";button.disabled=!user||poll.status!=="open";
   button.addEventListener("click",()=>mutate({
    action:official?"vote-consultation":"vote-poll",
    pollId:poll.id,optionIndex:i
   }));
   row.append(button);opts.append(row);
  });
  card.append(opts,element("p",poll.totalVotes+" member responses · nonbinding feedback","muted"));
  if(!official&&user){
   const report=element("button","Report inappropriate poll","eden-secondary");
   report.type="button";
   report.addEventListener("click",()=>{
    const reason=window.prompt("Briefly explain why this poll needs moderation (12–400 characters):");
    if(reason!=null)mutate({action:"report-poll",pollId:poll.id,reason});
   });
   card.append(report);
  }
  host.append(card);
 }
}
function render(){
 renderList("member-polls",feed.polls||[],false);
 renderList("admin-consultations",feed.proposals||[],true);
 $("member-poll-form").hidden=!user;
 $("member-signin-note").hidden=!!user;
 // Admin controls are deliberately not surfaced to general members.
 // Server-side UID authorization remains mandatory for any admin API request.
}
async function mutate(body){
 try{
  const data=await api(body);
  message(body.action==="create-poll"?"Your technology poll was published.":body.action.startsWith("vote-")?"Your response was recorded once.":"Your report was sent to the moderation queue.");
  await reload();
  if(body.action==="create-poll")$("member-poll-form").reset();
  return data;
 }catch(e){message(e.message);}
}
$("member-poll-form").addEventListener("submit",e=>{
 e.preventDefault();
 const form=e.currentTarget;
 const options=[form.option1.value,form.option2.value,form.option3.value].map(s=>s.trim()).filter(Boolean);
 mutate({action:"create-poll",title:form.pollTitle.value,details:form.pollDetails.value,
  category:form.pollCategory.value,options});
});
$("community-refresh").addEventListener("click",reload);
(async()=>{
 await reload();
 try{
  const r=await fetch("/api/eden-config",{cache:"no-store"}),data=await r.json();
  if(!r.ok||!data.configured||!data.config){message("Eden authentication is not configured. Public polls remain readable.");return;}
  const app=getApps().length?getApps()[0]:initializeApp(data.config);
  auth=getAuth(app);
  onAuthStateChanged(auth,member=>{
   user=member;
   $("member-signin-note").textContent=member
    ?"Your existing Eden account is connected. Participation also requires an active RealID and current agreement."
    :"Sign in using your existing Eden RealID account to create polls and vote.";
   render();
  });
 }catch{message("Eden account verification is unavailable. Public polls remain readable.");}
})();
