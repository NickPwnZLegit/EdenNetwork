import test from "node:test";
import assert from "node:assert/strict";
import {eligibleEdenPreviewMember,CURRENT_AGREEMENT_VERSION} from "../governance/preview-eligibility.mjs";
const uid="fixture-uid";
const owner={uid,status:"active",displayName:"EdenMember"};
const agreement={uid,accepted:true,agreementVersion:CURRENT_AGREEMENT_VERSION,expiresAt:{toMillis:()=>Date.now()+60_000}};
const valid=(o=owner,a=agreement)=>eligibleEdenPreviewMember({uid,owner:o,agreement:a});
test("real account preview requires owned active RealID and current agreement",()=>assert.equal(valid(),true));
test("guest, fake owner, expired or revoked access denied",()=>{
 assert.equal(eligibleEdenPreviewMember({uid:"",owner,agreement}),false);
 assert.equal(valid({...owner,uid:"other"}),false);
 assert.equal(valid({...owner,status:"revoked"}),false);
 assert.equal(valid(owner,{...agreement,expiresAt:{toMillis:()=>1}}),false);
});
test("agreement version, acceptance and uid must match",()=>{
 assert.equal(valid(owner,{...agreement,agreementVersion:"legacy"}),false);
 assert.equal(valid(owner,{...agreement,accepted:false}),false);
 assert.equal(valid(owner,{...agreement,uid:"someone-else"}),false);
});
test("new Hope Network agreement receipt is eligible for DAO preview",()=>{
 assert.equal(valid(owner,{...agreement,agreementVersion:"ecosystem-2026.11.18.1"}),true);
 assert.equal(valid(owner,{...agreement,agreementVersion:"ecosystem-2026.11.18.1",expiresAt:{toMillis:()=>1}}),false);
});
test("public handle must not expose an email",()=>assert.equal(valid({...owner,displayName:"user@example.com"}),false));
