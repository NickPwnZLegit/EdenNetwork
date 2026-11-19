// Advisory CLIENT-ONLY eligibility display for the synthetic DAO simulator.
// Production DAO participation needs audited server-backed authorization and proofs.
// Never use this helper to authorize a real vote or a token action.
export const CURRENT_AGREEMENT_VERSION="v16-2026.08.27.1"; // Match currently deployed LOH rules until synchronized migration.
export function eligibleEdenPreviewMember({uid,owner,agreement,now=Date.now()}={}){
 if(typeof uid!=="string"||uid.length<1||!owner||!agreement)return false;
 if(owner.uid!==uid||!["active","grandfathered"].includes(owner.status))return false;
 const name=String(owner.displayName||"").trim();
 if(name.length<4||name.includes("@"))return false;
 if(agreement.uid!=null&&agreement.uid!==uid)return false;
 if(agreement.accepted!==true||agreement.agreementVersion!==CURRENT_AGREEMENT_VERSION)return false;
 const expiry=typeof agreement.expiresAt?.toMillis==="function"?agreement.expiresAt.toMillis():
   typeof agreement.expiresAt?.toDate==="function"?agreement.expiresAt.toDate().getTime():NaN;
 return Number.isFinite(expiry)&&expiry>now;
}
