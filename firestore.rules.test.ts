import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const rulesContent = fs.readFileSync(
  new URL('./firestore.rules', import.meta.url),
  'utf8'
);

test('firestore.rules enforces default deny and hardened helpers', () => {
  assert.ok(rulesContent.includes("rules_version = '2';"));
  assert.ok(
    rulesContent.includes(
      'match /{document=**} {\n      allow read, write: if false;\n    }'
    )
  );
  assert.ok(rulesContent.includes('function isValidId(id)'));
  assert.ok(
    rulesContent.includes('request.auth.token.email_verified == true')
  );
  assert.ok(
    rulesContent.includes("request.auth.token.email == 'navied1514@gmail.com'")
  );
});

test('firestore.rules isolates owner_catalog_meta, orders PII, and subscribers from non-admins', () => {
  const ownerMetaSection = rulesContent.slice(
    rulesContent.indexOf('match /owner_catalog_meta/{productId}'),
    rulesContent.indexOf('match /store_settings/{settingId}')
  );
  assert.ok(ownerMetaSection.includes('allow get: if isValidId(productId) && isAdmin();'));
  assert.ok(ownerMetaSection.includes('allow list: if isAdmin();'));

  const ordersSection = rulesContent.slice(
    rulesContent.indexOf('match /orders/{orderId}'),
    rulesContent.indexOf('match /subscribers/{subscriberId}')
  );
  assert.ok(ordersSection.includes('allow get: if isValidId(orderId) && isAdmin();'));
  assert.ok(ordersSection.includes('allow list: if isAdmin();'));
  assert.ok(ordersSection.includes("incoming().status == 'pending'"));
  assert.ok(ordersSection.includes("incoming().hhcFulfillmentRef == ''"));
  assert.ok(ordersSection.includes("!('ownerNotes' in incoming())"));
  assert.ok(ordersSection.includes('incoming().createdAt == request.time'));
  assert.ok(ordersSection.includes('incoming().totalPkr == existing().totalPkr'));

  const subscribersSection = rulesContent.slice(
    rulesContent.indexOf('match /subscribers/{subscriberId}'),
    rulesContent.indexOf('match /admins/{adminUid}')
  );
  assert.ok(subscribersSection.includes('allow list: if isAdmin();'));
  assert.ok(subscribersSection.includes('allow update: if false;'));
});
