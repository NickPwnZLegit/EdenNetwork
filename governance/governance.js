import {SAMPLE_PROPOSALS,castSyntheticBallot,tallySyntheticBallots} from "./dao-policy.mjs";
const $=id=>document.getElementById(id);
let registry=Object.create(null);
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
 try{
  registry=castSyntheticBallot(registry,{proposalId:$("proposal").value,fixtureMember:$("member").value,
   choice:$("choice").value,edenHolder:$("holder").value==="yes"});
  $("notice").textContent="Synthetic ballot counted in this tab only; no blockchain or real account affected.";
 }catch(err){$("notice").textContent=err.message;}
 render();
});
render();
