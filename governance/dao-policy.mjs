// Synthetic-only DAO policy. No real personhood, account or token validation.
// Inputs are fixtures; wallet and ZK claims MUST be verified by a trusted audited
// production protocol before any real vote is admitted or tallied.
export const SAMPLE_PROPOSALS=Object.freeze([
 {id:"proposal-education",project:"Light of Hope",title:"Expand the Open Knowledge Gateway",description:"Prioritize original-source outbound links and clear licensing."},
 {id:"proposal-privacy",project:"EdenNetwork",title:"Adopt private identity audit principles",description:"Require independent verification of privacy and one-human issuance before production DAO voting."},
 {id:"proposal-media",project:"PwnZ.live",title:"Fund low-cost creator media pilots",description:"Compare no-archive streaming and voluntary saved media allowances using synthetic budgets."}
]);
export const CHOICES=Object.freeze(["support","oppose","abstain"]);
export function castSyntheticBallot(registry,request){
 const {proposalId,fixtureMember,choice,edenHolder=false}=request||{};
 if(!SAMPLE_PROPOSALS.some(x=>x.id===proposalId))throw Error("Unknown demonstration proposal.");
 if(typeof fixtureMember!=="string"||!/^demo-member-[1-9][0-9]?$/.test(fixtureMember))throw Error("Select a synthetic demo member.");
 if(!CHOICES.includes(choice))throw Error("Choose a valid demonstration ballot.");
 if(typeof edenHolder!=="boolean")throw Error("Synthetic holder status must be boolean.");
 const key=proposalId+"::"+fixtureMember;
 if(Object.hasOwn(registry,key))throw Error("This synthetic fixture already voted on this proposal.");
 const weight=edenHolder?2:1;
 return Object.freeze({...registry,[key]:Object.freeze({choice,weight,synthetic:true})});
}
export function tallySyntheticBallots(registry,proposalId){
 if(!SAMPLE_PROPOSALS.some(p=>p.id===proposalId))throw Error("Unknown proposal.");
 const tally={support:0,oppose:0,abstain:0,ballots:0,weightedVotes:0};
 for(const [key,ballot] of Object.entries(registry)){
  if(!key.startsWith(proposalId+"::"))continue;
  tally[ballot.choice]+=ballot.weight;tally.ballots++;tally.weightedVotes+=ballot.weight;
 }
 return Object.freeze(tally);
}
