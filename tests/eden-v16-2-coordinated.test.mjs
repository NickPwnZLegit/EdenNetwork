import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const {readiness}=require("../api/eden-config.js")._test;
const html=readFileSync(new URL("../account/index.html",import.meta.url),"utf8");
const js=readFileSync(new URL("../account/account.js",import.meta.url),"utf8");
test("Eden preview reports missing public config names only and never opens registration by default",()=>{
 const blank=readiness({});
 assert.equal(blank.configured,false);
 assert.equal(blank.registryEnabled,false);
 assert.deepEqual(blank.missingFields,["apiKey","authDomain","projectId","appId"]);
 assert.equal(blank.config,null);
 const complete=readiness({
  EDEN_FIREBASE_API_KEY:"synthetic-public-key",
  EDEN_FIREBASE_AUTH_DOMAIN:"synthetic.firebaseapp.com",
  EDEN_FIREBASE_PROJECT_ID:"synthetic-test-project",
  EDEN_FIREBASE_APP_ID:"synthetic-app",
  VERCEL_ENV:"preview"
 });
 assert.equal(complete.configured,true);
 assert.equal(complete.registryEnabled,false);
 assert.equal(complete.projectMatchesShared,false);
});
test("existing Eden account onboarding is distinct from registration",()=>{
 assert.match(html,/Already have an Eden RealID/);
 assert.match(html,/no-existing-eden/);
 assert.match(js,/if\(creating&&!\$\("no-existing-eden"\)\.checked\)/);
 assert.match(js,/createUserWithEmailAndPassword/);
 assert.match(js,/signInWithEmailAndPassword/);
});
test("Eden verifies agreement during session restore without collecting biometric material",()=>{
 assert.match(js,/function loadAgreement\(user\)/);
 assert.match(js,/AGREEMENT_VERSIONS/);
 assert.match(js,/expires\.getTime\(\)>Date\.now\(\)/);
 assert.match(js,/await Promise\.all\(\[loadOwner\(user\),loadAgreement\(user\)\]\)/);
 assert.match(js,/30-day community agreement/);
});
