# Wallet OTP (One Time Password)

Wallet OTP is a One Time Password Authenticator dapp built during [HackFS 2023](https://ethglobal.com/events/hackfs2023). Wallet OTP works on any device with a user interface and wallet connection (phones, tablets, desktop, your tesla...)

Check out the 👛 [Wallet OTP - EthGlobal Showcase Page](https://ethglobal.com/showcase/wallet-otp-one-time-password-pp9gx)

Wallet OTP app is live: https://wallet-otp.on.fleek.co


![Wallet OTP deck](https://github.com/oceans404/wallet-otp/assets/91382964/2dae553a-cd86-4cd4-94e0-3ef62b8cd6b6)

---

Wallet OTP provides decentralized storage of your 2FA secrets with public-key encryption so that **you and only you** can generate dynamic OTP (one time password) tokens that let you log in to any web2 or web3 service with your wallet.

Sign in with your wallet to encrypt and store your 2FA secrets for any web2 or web3 account (Instagram, Gmail, Tiktok, Kraken, Coinbase, etc). Then when you need to authenticate with your second auth factor, use the Wallet OTP app to get a dynamic OTP based on your secret.

---

## But I already use Twilio's Authy or Google's Authenticator app for this. Why should I use Wallet OTP instead?

### 1. Privacy and security

Wallet OTP encrypts your 2FA secret keys with your wallet's public key for maximum security. This means your 2FA keys are as safe as your crypto. [Here's a Wallet OTP encrypted 2FA record](https://testnet.polybase.xyz/v0/collections/pk%2F0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc%2FTestTokens%2FKeys/records/encrypted1686876767638) stored by "address":"0x61c4eF50cC6577CBb34744275c1bf7b7F111D5fD" from Wallet OTP. Notice how all fields (service, account, secret, plus corresponding symmetric keys for each field) are encrypted by Lit Protocol before being stored on Polybase decentralized storage. Even though the records are stored in public, no one can decrypt and view them except the person with signing capabilities for the 0x61c4eF50cC6577CBb34744275c1bf7b7F111D5fD address.


### 2. Free access from any device

One time I got a new phone and lost access to all my social accounts because my 2FA access was tied to an authenticator that used local storage on my old phone that I'd already wiped. 😭😭😭😭😭

I touched so much grass that day! 🥲

Wallet OTP is intentionally device agnostic and designed for multi-device use - you can access the Wallet OTP app on **any device** simply by connecting your wallet


### 3. Data availability

Wallet OTP stores encrypted data on distributed, decentralized storage. With distributed, decentralized storage there's no way a Google or Twilio intern can accidentally drop the only table your encrypted keys live in, and no chance your encrypted keys are lost.


### 4. Data sovereignty

- We've all heard, "Not your keys, not your crypto!"
- Introducing.... 🥁🥁🥁 **"Not your wallet encrypted 2FA secrets, not your social accounts"**

Wallet OTP is a wallet encrypted solution for 2FA secret storage so you no longer have to trust centralized OTP token generators like Authy with centralized encryption and storage of your 2FA secrets for services like Snapchat, Twitch, and Google. Wallet OTP uses your wallet to encrypt and store your 2FA secrets, then generates OTP tokens for you any time you need them for login.

# How it's Made

## 🚀 Web3 Details

- Login mechanism: **WalletConnect**'s Web3Modal combined with viem and wagmi React hooks
- ENS names: check if a user has an ENS and if so, display their **ENS avatar and name** with the viem library
- Encryption/decryption: **Lit Protocol** - I didn't use Ceramic or Arweave (default integrations) for storage, so I needed to create a custom Lit integration for Lit <> Polybase that encrypts data using Lit Protocol, uploads it to Polybase, fetches the Lit encrypted data from Polybase, and decrypts using Lit Protocol
- Decentralized Storage: **public-key-write-gated Polybase collections of Lit encrypted records**
- Known issue that will be fixed by WalletConnect by June 23: Your browser needs to have a wallet (window.ethereum) or wallet extension and you have to sign more than once. When working with WalletConnect, Polybase, and Lit signing, I tried to optimize the UX to prevent duplicate signing in and signing by injecting WalletConnect into Polybase and Lit for auth, but WalletConnect is between V1 and V2. WC V2 has signing/auth capabilities, but doesn't hasn't completed integration with any major mainstream wallets. V1 doesn't have a working auth/sign api, but supports major mainstream wallets (coinbase, metamask, trust, etc.) Because of this, the WalletConnect logged in user still has to sign to prove wallet ownership for Lit and to post new records for Polybase.
- Compute: I'm computing OTP generation client side to maximize security and prevent 2FA secret keys from leaking. I considered delegating this to Bacalhau, but thought it was overkill to reencrypt and decrypt in a second service, risk leaking the keys, and slow down OTP generation. The OTP is TOTP, a time based one-time-password, which is an event-based OTP algorithm where the moving factor is an event counter.
- CDN: **Filecoin Saturn**. I registered a custom service worker to provide fast content delivery of images **pinned on IPFS**
- Decentralized static image storage: Pinned on **IPFS**, stored on **NFT.storage**
- Website hosting: decentralized **on IPFS with Fleek**
- Wallet OTP a special APE theme for any **Apecoin DAO** Members (stakers or holders of $APE) when they sign in to Wallet OTP

  
## 🖥️ Web2 build details

- Frontend: React with Chakra UI components
- Backend: Node + Socket.io
- Design and slides: Canva Pro
- QR Libraries: react-qr-code & qr-scanner


## 📑 Papers read/referenced

- TOTP: Time-Based One-Time Password Algorithm https://www.ietf.org/rfc/rfc6238.txt
- What’s the Difference Between OTP, TOTP and HOTP? https://www.onelogin.com/learn/otp-totp-hotp
- Symmetric key encryption: https://www.cryptomathic.com/news-events/blog/symmetric-key-encryption-why-where-and-how-its-used-in-banking


