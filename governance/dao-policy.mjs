// Synthetic-only DAO policy. No real personhood, account or token validation.
// Inputs are fixtures; wallet and ZK claims MUST be verified by a trusted audited
// production protocol before any real vote is admitted or tallied.
export const SAMPLE_PROPOSALS=Object.freeze([
 {id:"proposal-eden-fees",project:"EdenNetwork",title:"Study low-fee EDEN participation",description:"Compare synthetic Lightchain transaction-cost simulations for small community and governance actions."},
 {id:"proposal-eden-privacy",project:"EdenNetwork",title:"Review private Eden RealID evidence principles",description:"Study account separation, recovery and privacy without collecting real biometrics or identity mappings."},
 {id:"proposal-lightvault",project:"EdenNetwork",title:"Explore LightVault governance wallet safeguards",description:"Research wallet-signature verification and EDEN holder snapshot methods before any real voting is enabled."}
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
