// Development reset: empties the issuance records so the demo can start from nothing.
//   npm run reset-documents            show what is there, then ask
//   npm run reset-documents -- -y      no question
//   npm run reset-documents -- --audit also clear the audit trail
//
// WHY THIS EXISTS. The Hardhat chain in dev.sh is in-memory, so every run starts
// a chain that knows no documents. Mongo's container has a volume, so the records
// survive - leaving documents whose anchor no longer exists, and whose sha256 and
// contentHash still occupy the unique indexes, so re-issuing the same file is
// rejected as a duplicate. This clears them.
//
// WHAT IT DOES NOT DO. It does not delete the stored files. S3 keys are the
// SHA-256 of the content, so storing the same file again is idempotent
// (storage.js writes with If-None-Match) and a leftover object costs nothing.
// It also does not touch the chain: an anchor cannot be deleted, which is the
// whole point of anchoring. A record for a LIVE chain should be REVOKED through
// the app, never deleted here.
require('dotenv').config({ quiet: true });
const readline = require('node:readline');
const { connectDatabase } = require('../db');

// The one real hazard: the Atlas URI is one uncommented line away in .env, and
// that database is shared. Wiping it is not a dev reset, it is data loss.
const LOCAL_HOSTS = ['127.0.0.1', 'localhost', '::1', 'mongo', 'mindforge-mongo'];

/** @returns {{local: boolean, host: string, db: string}} - parsed for the prompt, never logged in full (a URI can carry a password). */
function describe(uri) {
    const u = new URL(uri.replace(/^mongodb(\+srv)?:/, 'http:'));
    return { local: LOCAL_HOSTS.includes(u.hostname), host: u.hostname, db: u.pathname.replace(/^\//, '') || '(default)' };
}

const ask = (question) => new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); });
});

async function main() {
    const argv = process.argv.slice(2);
    const yes = argv.includes('-y') || argv.includes('--yes');
    const withAudit = argv.includes('--audit');

    const uri = process.env.MONGODB_URI;
    if (!uri) { console.error('MONGODB_URI is not set - nothing to reset.'); return 1; }

    const where = describe(uri);
    if (!where.local) {
        console.error(`Refusing to run: ${where.host} is not a local database.`);
        console.error('This script is for the dev container only. Revoke through the app instead.');
        return 1;
    }

    const { documents, audit, close } = await connectDatabase(uri);
    try {
        const counts = await documents.model.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]);
        const total = counts.reduce((sum, r) => sum + r.n, 0);
        if (!total && !withAudit) { console.log(`${where.db} on ${where.host} already has no documents.`); return 0; }

        console.log(`${where.db} on ${where.host}`);
        for (const r of counts.sort((a, b) => b.n - a.n)) console.log(`  ${String(r.n).padStart(5)}  ${r._id}`);
        const issued = counts.find((r) => r._id === 'ISSUED');
        if (issued) console.log(`\n  ${issued.n} document(s) are ISSUED: their hashes stay on the chain after this.`);

        if (!yes) {
            const answer = await ask(`\nDelete ${total} document record(s)${withAudit ? ' and the audit trail' : ''}? [y/N] `);
            if (!/^y(es)?$/i.test(answer)) { console.log('Left alone.'); return 0; }
        }

        const removed = await documents.model.deleteMany({});
        console.log(`Deleted ${removed.deletedCount} document record(s).`);
        if (withAudit) {
            const wiped = await audit.model.deleteMany({});
            console.log(`Deleted ${wiped.deletedCount} audit event(s).`);
        }
        console.log('Stored files and chain anchors are untouched. Issue your demo documents fresh.');
        return 0;
    } finally {
        await close();
    }
}

main().then((code) => process.exit(code), (err) => {
    console.error(err.name || 'Error', '-', String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/gi, '[REDACTED]'));
    process.exit(1);
});
