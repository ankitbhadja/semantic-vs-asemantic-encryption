# End-to-end group encryption demo

This TypeScript example shows how a group can share encrypted messages using
both symmetric and asymmetric encryption:

- **AES-GCM (symmetric):** encrypts and authenticates the message with one
  randomly generated group key.
- **RSA-OAEP (asymmetric):** encrypts a copy of that group key for each
  member, so each member can recover it with their private key.

The example generates temporary keys in memory for Alice, Bob, and Charlie.
It does not persist keys, use a server, or provide production-ready key
management.

## Key concepts and message flow

### Public/private key pairs

Each member gets an independent 2048-bit RSA key pair:

- The **public key** can be shared with other members. It is used to encrypt
  (wrap) a copy of the group key for that member.
- The **private key** must remain secret. Only its owner uses it to decrypt
  (unwrap) the group key addressed to them.

RSA is not used to encrypt the message itself. It protects the small AES group
key so the same group key can be delivered securely to each member.

### One shared symmetric key

When the group is created, the example generates one random 16-byte (128-bit)
AES key. Alice's RSA public key wraps a copy for Alice. When Bob and Charlie
are added, Alice unwraps the group key with her private key and wraps a copy
for each member using that member's public key.

After unwrapping their copy with their own private key, members use the same
AES key to encrypt and decrypt group messages. AES-GCM also authenticates the
message, so decryption fails if the ciphertext or authentication tag has been
changed.

### Encrypting and receiving a message

For every message, the demo generates a fresh 12-byte initialization vector
(IV) and encrypts the plaintext with AES-GCM. It Base64-encodes the IV,
ciphertext, and 16-byte authentication tag together. A recipient decodes this
payload, separates those parts, unwraps the group key with their RSA private
key, and decrypts and verifies the message with AES-GCM.

In short: **RSA-OAEP protects the shared AES key; AES-GCM protects the
messages.** Anyone who has a copy of the group key can read messages encrypted
with it. This demo does not implement member revocation, key rotation, secure
key storage, or network transport.

## Requirements

- Node.js 18
- Yarn 1.22 or later

## Run the demo

From this directory:

```sh
nvm use
yarn install
yarn demo:encryption
```

Expected output includes one encrypted message and the plaintext received by
Bob and Charlie. The encryption key and private keys are not printed.

To compile the TypeScript project:

```sh
yarn build
```

The repository also contains scheduler-related source files from an earlier
project; they are separate from this self-contained encryption demo.
