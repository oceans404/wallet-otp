// static images were pinned on IPFS, stored with NFT.storage 🐛✨🌈
export const nftStorageLink = cid => `https://${cid}.ipfs.nftstorage.link`;

// custom Saturn service worker (saturn-sw.js) is registered in serviceWorker.js
export const saturnCdnLink = cid => `/ipfs/${cid}`;

export const imgProviderSrc = (isMobile, cid) =>
  isMobile ? nftStorageLink(cid) : saturnCdnLink(cid);
