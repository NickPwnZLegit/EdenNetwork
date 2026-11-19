import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const html=read("governance/index.html"),script=read("governance/community-polls.js");
test("governance prioritizes Eden crypto, security and technology",()=>{
 assert.match(html,/blockchain, cryptocurrency, developers/);
 assert.match(html,/Community polls/);
 assert.match(html,/Official admin consultations/);
});
test("all existing RealID members may submit community polls",()=>{
 assert.match(html,/id="member-poll-form"/);
 assert.match(script,/action:"create-poll"/);
 assert.match(script,/vote-poll/);
 assert.match(script,/getIdToken/);
 assert.match(script,/https:\/\/light-of-hope\.net\/api\/eden-governance/);
});
test("admin controls are separate and not granted by a client role",()=>{
 assert.match(html,/id="eden-admin-tools"/);
 assert.match(script,/adminAuthorized=data\.admin===true/);
 assert.match(script,/admin-create-proposal/);
 assert.match(script,/admin-review/);
 assert.match(script,/admin-close/);
 assert.doesNotMatch(script,/localStorage\.(setItem|getItem).*admin/i);
});
test("public poll display does not use unsafe HTML interpolation",()=>{
 assert.match(script,/\.textContent=/);
 assert.doesNotMatch(script,/innerHTML\s*=/);
 assert.match(script,/button\.disabled=!user\|\|poll\.status!=="open"/);
});
test("synthetic DAO voting remains separate and nonbinding",()=>{
 assert.match(html,/Synthetic demonstration ballot/);
 assert.match(html,/nonbinding/);
 assert.match(html,/no real vote/i);
});
