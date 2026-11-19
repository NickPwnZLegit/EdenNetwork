import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const account=read("account/account.js"),html=read("account/index.html");
test("Eden account displays complete same-site agreement after login",()=>{
 assert.match(html,/id="eden-agreement-full"/);
 assert.match(account,/https:\/\/light-of-hope\.net\/api\/ecosystem-agreement/);
 assert.match(account,/t\.version!==AGREEMENT_VERSION/);
 assert.match(account,/for\(const sec of t\.sections\)/);
 assert.doesNotMatch(account,/innerHTML\s*=/);
});
test("expired or updated agreement signs out once and redirects to full terms",()=>{
 assert.match(account,/const RENEW_KEY/);
 assert.match(account,/pending\(\)!==user\.uid&&mark\(user\.uid\)/);
 assert.match(account,/await signOut\(auth\)/);
 assert.match(account,/checkAgreementAfterLogin\(user\)/);
 assert.match(account,/\$\("eden-agreement-panel"\)\.scrollIntoView/);
});
test("acceptance uses one shared Firebase document and append-only history",()=>{
 assert.match(account,/batch\.set\(doc\(db,"agreements",uid\),data/);
 assert.match(account,/batch\.set\(history/);
 assert.match(account,/30\*24\*3600_000/);
 assert.doesNotMatch(account,/pwnzAgreements/);
});
test("DAO ballots and wallet transactions never authorize agreement",()=>{
 assert.doesNotMatch(account,/sendTransaction|executeDAOProposal|biometricEnroll/);
});
