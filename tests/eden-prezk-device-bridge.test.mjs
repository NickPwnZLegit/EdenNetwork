import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("Eden device gateway is preview-only and never accepts a user-selected upstream",()=>{
 const proxy=read("api/prezk-device.js"),account=read("account/account.js");
 assert.match(proxy,/VERCEL_ENV!=="preview"/);
 assert.match(proxy,/EDEN_PREZK_UPSTREAM_URL/);
 assert.match(proxy,/EDEN_PREZK_DEVICE_TEST_ENABLED/);
 assert.match(proxy,/\.vercel\.app/);
 assert.match(proxy,/network:"eden-network"/);
 assert.match(account,/signInWithEmailAndPassword/);
 assert.match(account,/prezkReady/);
 assert.match(account,/inspectPreZkDevice/);
 assert.match(account,/testPreZkDevice/);
 assert.match(account,/AGREEMENT_VERSIONS/);
 assert.doesNotMatch(account,/navigator\.mediaDevices\.getUserMedia/);
});
test("cross-site Eden UI retains the same account and agreement",()=>{
 const account=read("account/index.html"),policy=read("account/account.js"),client=read("prezk/device.js");
 assert.match(account,/I confirm I have never created an Eden RealID/);
 assert.match(account,/no-existing-eden/);
 assert.match(account,/prezk-panel/);
 assert.match(policy,/loadAgreement/);
 assert.match(client,/generateKey/);
 assert.match(client,/indexedDB/);
 assert.doesNotMatch(client,/getUserMedia/);
});