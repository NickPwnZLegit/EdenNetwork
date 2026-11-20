import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {enabled,validAuthorization,safeStatus,trustedPreviewOrigin}=require("../api/eden-account-status.js");
test("same-project preview-only feature gate",()=>{
 const env={VERCEL_ENV:"preview",EDEN_ACCOUNT_STATUS_TESTNET_ENABLED:"true",
   EDEN_FIREBASE_PROJECT_ID:"synthetic",EDEN_SHARED_FIREBASE_PROJECT_ID:"synthetic"};
 assert.equal(enabled(env),true);
 for(const change of [{VERCEL_ENV:"production"},{EDEN_ACCOUNT_STATUS_TESTNET_ENABLED:"false"},
   {EDEN_SHARED_FIREBASE_PROJECT_ID:"different"},{EDEN_FIREBASE_PROJECT_ID:""}])
   assert.equal(enabled({...env,...change}),false);
});
test("bearer token required, no plaintext names or email",()=>{
 assert.equal(validAuthorization("Bearer "+"x".repeat(30)),true);
 for(const bad of [null,"Basic test","Bearer tiny","member@example.com","SomeEdenRealID"])
  assert.equal(validAuthorization(bad),false);
});
test("only known boolean fields returned, all identity data removed",()=>{
 const payload={ok:true,mode:"read-only-testnet",schemaVersion:1,
  edenRealIdActive:true,agreementRecognized:true,pwnzGamertagLinked:true,
  sharedServicesAuthorized:false,lightVaultTransfersEnabled:false,humanUniquenessVerified:false,
  email:"private@example.com",uid:"synthetic-user",name:"Private",wallet:"0xPrivate"};
 const result=safeStatus(payload);
 for(const name of ["email","uid","name","wallet"])assert.equal(name in result,false);
 assert.equal(result.pwnzGamertagLinked,true);
 assert.equal(result.sharedServicesAuthorized,false);
 assert.equal(safeStatus({...payload,edenRealIdActive:1}),null);
 assert.equal(safeStatus({...payload,mode:"production"}),null);
});

test("relay only forwards tokens to a pinned Light of Hope preview host",()=>{
 const good={HOPE_ACCOUNT_STATUS_PREVIEW_ORIGIN:"https://light-of-hope-site-git-testing.vercel.app"};
 assert.equal(trustedPreviewOrigin(good),"https://light-of-hope-site-git-testing.vercel.app");
 for(const origin of [
  "http://light-of-hope-site-git-testing.vercel.app",
  "https://light-of-hope-site.vercel.app.evil.test",
  "https://light-of-hope-site.vercel.app@evil.test",
  "https://evil.vercel.app",
  "https://light-of-hope-site.vercel.app/private",
  "https://light-of-hope-site.vercel.app?test=1"
 ])assert.equal(trustedPreviewOrigin({HOPE_ACCOUNT_STATUS_PREVIEW_ORIGIN:origin}),null);
});
