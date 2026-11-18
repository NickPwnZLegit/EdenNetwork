import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const h=readFileSync(new URL("../index.html",import.meta.url),"utf8");
test("Eden network only identifies HOPE and EDEN for token access",()=>assert.match(h,/EdenNetwork uses HOPE for future ecosystem utility and EDEN for planned governance/));
test("contract evidence not misrepresented",()=>assert.match(h,/contracts remain unverified and inactive/));
test("DAO holder votes limited to maximum two",()=>assert.match(h,/max two per proposal/));
test("no owner wallet or biometric information collected",()=>assert.ok(!/<input[^>]*(wallet|biometric|thumbprint)/i.test(h)));