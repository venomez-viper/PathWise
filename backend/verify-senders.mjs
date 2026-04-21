#!/usr/bin/env node
/**
 * Verify that every sender in FROM_ADDRESSES actually sends through Resend.
 *
 * Usage (run from the backend/ directory so the Resend SDK resolves):
 *   cd backend
 *   RESEND_API_KEY=re_xxx node verify-senders.mjs --to you@example.com
 *
 * Or grab the key from Encore's local config:
 *   RESEND_API_KEY=$(encore secret get ResendAPIKey --env=local) \
 *     node verify-senders.mjs --to you@example.com
 *
 * Exits non-zero if any sender fails, so you can wire it into a pre-merge check.
 */

import { Resend } from 'resend';

const SENDERS = [
  { key: 'hello',       from: 'PathWise <hello@pathwise.fit>' },
  { key: 'onboarding',  from: 'PathWise Onboarding <onboarding@pathwise.fit>' },
  { key: 'support',     from: 'PathWise Support <support@pathwise.fit>' },
  { key: 'marketing',   from: 'PathWise Team <marketing@pathwise.fit>' },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { to: null, dryRun: false };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--to' && args[i + 1]) { out.to = args[++i]; }
    else if (args[i] === '--dry-run') { out.dryRun = true; }
  }
  return out;
}

async function main() {
  const { to, dryRun } = parseArgs();
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.error('Set RESEND_API_KEY in your environment.');
    process.exit(2);
  }
  if (!to) {
    console.error('Pass a recipient: --to you@example.com');
    process.exit(2);
  }

  const resend = new Resend(key);
  const results = [];

  for (const s of SENDERS) {
    process.stdout.write(`→ ${s.key.padEnd(11)} ${s.from} ... `);
    if (dryRun) { console.log('skipped (--dry-run)'); results.push({ ...s, ok: true, dry: true }); continue; }

    try {
      const res = await resend.emails.send({
        from: s.from,
        to,
        subject: `[sender check] ${s.key}@pathwise.fit`,
        html: `<p>This is a verification send for the <b>${s.key}</b> sender. If you received this, Resend accepts this From address.</p>`,
      });
      if (res.error) {
        console.log(`FAIL — ${res.error.message}`);
        results.push({ ...s, ok: false, err: res.error.message });
      } else {
        console.log(`ok (resend id ${res.data?.id ?? '?'})`);
        results.push({ ...s, ok: true, id: res.data?.id });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL — ${msg}`);
      results.push({ ...s, ok: false, err: msg });
    }
  }

  const failed = results.filter(r => !r.ok);
  console.log('');
  if (failed.length === 0) {
    console.log(`All ${results.length} senders pass.`);
    process.exit(0);
  }
  console.log(`${failed.length} of ${results.length} senders failed:`);
  for (const f of failed) console.log(`  - ${f.key}: ${f.err}`);
  process.exit(1);
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(3);
});
