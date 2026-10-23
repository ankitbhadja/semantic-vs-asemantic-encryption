import * as forge from "node-forge";

const users = ["Alice", "Bob", "Charlie"];
const userKeyPairs: Record<string, { publicKey: string; privateKey: string }> = {};
const encryptedGroupKeys: Record<string, string> = {};

for (const user of users) {
  const keys = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  userKeyPairs[user] = {
    publicKey: forge.pki.publicKeyToPem(keys.publicKey),
    privateKey: forge.pki.privateKeyToPem(keys.privateKey),
  };
}

function generateGroup(admin: string): void {
  const groupKey = forge.random.getBytesSync(16);
  const publicKey = forge.pki.publicKeyFromPem(userKeyPairs[admin].publicKey);

  // RSA (asymmetric encryption) wraps the AES key for each group member.
  encryptedGroupKeys[admin] = publicKey.encrypt(groupKey, "RSA-OAEP");
}

function addUserToGroup(admin: string, user: string): void {
  const adminPrivateKey = forge.pki.privateKeyFromPem(userKeyPairs[admin].privateKey);
  const groupKey = adminPrivateKey.decrypt(encryptedGroupKeys[admin], "RSA-OAEP");
  const userPublicKey = forge.pki.publicKeyFromPem(userKeyPairs[user].publicKey);

  encryptedGroupKeys[user] = userPublicKey.encrypt(groupKey, "RSA-OAEP");
}

function encryptMessage(message: string, key: string): string {
  const iv = forge.random.getBytesSync(12);
  const cipher = forge.cipher.createCipher("AES-GCM", key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, "utf8"));
  cipher.finish();

  return forge.util.encode64(iv + cipher.output.getBytes() + cipher.mode.tag.getBytes());
}

function decryptMessage(encryptedMessage: string, key: string): string {
  const payload = forge.util.decode64(encryptedMessage);
  const decipher = forge.cipher.createDecipher("AES-GCM", key);
  decipher.start({
    iv: payload.slice(0, 12),
    tag: forge.util.createBuffer(payload.slice(-16)),
  });
  decipher.update(forge.util.createBuffer(payload.slice(12, -16)));

  if (!decipher.finish()) {
    throw new Error("Message authentication failed");
  }

  return decipher.output.toString();
}

function decryptGroupKey(user: string): string {
  const privateKey = forge.pki.privateKeyFromPem(userKeyPairs[user].privateKey);
  return privateKey.decrypt(encryptedGroupKeys[user], "RSA-OAEP");
}

function sendMessage(sender: string, message: string): string {
  return encryptMessage(message, decryptGroupKey(sender));
}

function receiveMessage(message: string, receivers: string[]): void {
  for (const receiver of receivers) {
    const plaintext = decryptMessage(message, decryptGroupKey(receiver));
    console.log(`${receiver} received: ${plaintext}`);
  }
}

generateGroup("Alice");
addUserToGroup("Alice", "Bob");
addUserToGroup("Alice", "Charlie");

const encryptedMessage = sendMessage("Alice", "Hello, Bob and Charlie!");
console.log("Encrypted message:", encryptedMessage);
receiveMessage(encryptedMessage, ["Bob", "Charlie"]);
