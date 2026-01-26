const admin = require("firebase-admin");

const uid = process.argv[2];

if (!uid) {
  console.error("Usage: node scripts/set-admin-claim.cjs <UID>");
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error("Missing GOOGLE_APPLICATION_CREDENTIALS environment variable.");
  process.exit(1);
}

admin.initializeApp();

admin
  .auth()
  .setCustomUserClaims(uid, {admin: true})
  .then(() => {
    console.log(`Admin claim set for uid: ${uid}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to set admin claim:", error);
    process.exit(1);
  });
