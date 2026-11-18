import test from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
const require=createRequire(import.meta.url);
const {readiness}=require("../api/eden-config.js")._test;
const {enabled,normalize}=require("../api/eden-registry.js")._test;
const env={VERCEL_ENV:"preview",EDEN_REGISTRY_ENABLED:"true",EDEN_FIREBASE_API_KEY:"synthetic-web-key",
 EDEN_FIREBASE_AUTH_DOMAIN:"synthetic.invalid",EDEN_FIREBASE_PROJECT_ID:"shared-fixture",
 EDEN_FIREBASE_APP_ID:"synthetic-app",EDEN_SHARED_FIREBASE_PROJECT_ID:"shared-fixture"};
test("production registration never enabled",()=>assert.equal(enabled({...env,VERCEL_ENV:"production"}),false));
test("project parity required",()=>assert.equal(enabled({...env,EDEN_SHARED_FIREBASE_PROJECT_ID:"other"}),false));
test("configured public client includes no admin secrets",()=>assert.equal(Object.keys(readiness(env).config).includes("privateKey"),false));
test("explicit preview flag required",()=>assert.equal(readiness({...env,EDEN_REGISTRY_ENABLED:"false"}).registryEnabled,false));
test("expected preview can request primary registrar",()=>assert.equal(enabled(env),true));
test("no arbitrary actions",()=>assert.throws(()=>normalize({action:"transfer-wallet"})));
test("exact-name input only",()=>assert.deepEqual(normalize({action:"check",requestedName:" cosmicway ",role:"admin"}),{action:"check",requestedName:"cosmicway"}));
test("empty name denied",()=>assert.throws(()=>normalize({action:"reserve-activate",requestedName:""})));
test("legacy check has no name",()=>assert.deepEqual(normalize({action:"validate-legacy",uid:"other"}),{action:"validate-legacy"}));
test("account page exposes existing and new login",()=>{const v=readFileSync(new URL("../account/index.html",import.meta.url),"utf8");assert.match(v,/Existing sign-in/);assert.match(v,/Create Eden RealID/);});
test("no wallet or biometrics submitted",()=>{const v=readFileSync(new URL("../account/account.js",import.meta.url),"utf8");assert.ok(!v.includes("uploadBytes")&&!v.includes("faceprint"));});
