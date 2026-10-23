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
