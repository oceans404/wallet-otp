import { NamedNetwork } from '@nillion/client-core';
import { createSignerFromKey } from '@nillion/client-payments';
import { NillionClient } from '@nillion/client-vms';

const client = NillionClient.create({
  network: NamedNetwork.enum.Photon,

  overrides: async () => {
    // this is the account's private key when running `nillion-devnet` with default seed
    const signer = await createSignerFromKey(
      '9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5'
    );
    return {
      endpoint: 'https://testnet-nillion-rpc.lavenderfive.com',
      userSeed: 'fml',
      nodeSeed: 'fml',
      signer,
    };
  },
});

console.log(client);

export default function App() {
  return (
    <NillionClientProvider client={client}>
      <div></div>
    </NillionClientProvider>
  );
}
