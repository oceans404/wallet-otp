# Wallet OTP Polybase DBs

Polybase is a NoSQL-like privacy preserving decentralized database, built on zk-STARKs. It uses a zk-rollup combined with native indexing to allow decentralized database rules, fast queries and scalable writes.

[Polybase docs](https://polybase.xyz/docs/introduction)

Check the Schemas folder in this repo for the data structure of Wallet OTP dbs

## Decentralized Keys db on Polybase

- id: string
- appId: string
- publicKey: PublicKey
- service: string (encrypted with Lit)
- account: string (encrypted with Lit)
- secret: string (encrypted with Lit)
