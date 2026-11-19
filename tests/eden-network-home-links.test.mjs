import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const html=readFileSync(new URL("../index.html",import.meta.url),"utf8");
test("EdenNetwork home links every ecosystem website and public journal",()=>{
 for(const u of ["https://light-of-hope.net/","https://edennetwork.live/","https://pwnz.live/","https://hope-labs-research.vercel.app/","https://light-of-hope.net/#/development-wall"])
 assert.ok(html.includes(u),u);
});
test("future identity and DAO claims remain clearly in research-only scope",()=>{
 assert.match(html,/No ZK enrollment yet/i);
 assert.match(html,/not live voting/i);
 assert.match(html,/Real personhood verification and voting remain disabled/i);
 assert.match(html,/Hope Labs maintains separate research and evidence/i);
});
