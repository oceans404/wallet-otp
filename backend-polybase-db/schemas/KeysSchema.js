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

  // encrypted name of service (google, netflix, hulu, coinbase, kraken) & service symmetric key
  service: string; 
  serviceKey: string; 

  // encrypted account name in case you have multiple profiles & account symmetric key
  account: string; 
  accountKey: string; 

  // encrypted 2fa secret key & secret symmetric key
  secret: string; 
  secretKey: string; 

  constructor (id: string, appId: string, address: string, service: string, serviceKey: string, account: string, accountKey: string, secret: string, secretKey: string) {
    this.id = id;
    this.appId = appId;
    this.address = address;
    this.service = service;
    this.serviceKey = serviceKey;
    this.account = account;
    this.accountKey = accountKey;
    this.secret = secret;
    this.secretKey = secretKey;
    
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
