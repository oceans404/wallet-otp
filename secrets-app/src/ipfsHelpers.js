// static images were pinned on IPFS, stored with NFT.storage 🐛✨🌈
export const nftStorageLink = cid => `https://${cid}.ipfs.nftstorage.link`;

export const imgProviderSrc = (isMobile, cid) => nftStorageLink(cid);
