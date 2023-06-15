// @`public` anyone can view and read this Public polybase collection
// sensitive values are encrypted ahead of being stored here

const KeysSchema = (collectionName) => `
@public
collection Keys {

  // unique id
  id: string;

  // for easier filtering while testing
  appId: string;

  // Owner's public key
  publicKey: PublicKey;

  // Owner's address (simplify filters)
  address: string;

  // explicit filter
  @index(address, appId);

  // encrypted name of service (google, netflix, hulu, coinbase, kraken)
  service: string; 

  // encrypted account name in case you have multiple profiles
  account: string; 

  // encrypted 2fa secret key
  secret: string; 

  constructor (id: string, appId: string, address: string, service: string, account: string, secret: string) {
    this.id = id;
    this.appId = appId;
    this.address = address;
    this.service = service;
    this.account = account;
    this.secret = secret;
    
    // set public key to the user creating the record's key
    this.publicKey = ctx.publicKey;
  }


  del () {
    // user can only delete records that were created with their public key
    if ((this.publicKey).toHex() != ctx.auth) {
      throw error();
    }
    selfdestruct();
  }
}
`;

module.exports = {
  KeysSchema,
};
