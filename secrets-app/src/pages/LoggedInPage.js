import { useState, useEffect } from 'react';
import {
  Text,
  HStack,
  Button,
  Card,
  Image,
  VStack,
  Tooltip,
  Spinner,
} from '@chakra-ui/react';
import { getPublicClient } from '@wagmi/core';
import { isMobile } from 'react-device-detect';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyIcon } from '@chakra-ui/icons';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { Polybase } from '@polybase/client';
import * as eth from '@polybase/eth';

import AddSecret from '../components/AddSecret';
import ServiceCard from '../components/ServiceCard';
import LoaderModal from '../components/LoaderModal';

function LoggedInPage() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({
    address,
  });
  const ensProfile = ensName
    ? `https://app.ens.domains/${ensName}`
    : 'https://app.ens.domains/';
  const publicClient = getPublicClient();

  const { disconnect } = useDisconnect();
  const [chain] = useState('ethereum');
  const [authSig, setAuthSig] = useState();
  const [polybaseLoading, setPolybaseLoading] = useState(false);
  const [polybaseRetrying, setPolybaseRetrying] = useState(false);
  const [ensAvatar, setEnsAvatar] = useState();

  const [litClient, setLitClient] = useState();

  const addressAccessControl = address => [
    {
      contractAddress: '',
      standardContractType: '',
      chain,
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: address,
      },
    },
  ];

  // todo: check if wallet is part of data dao
  // todo: if it's part of data dao get mapping of wallet address -> encrypted collection on Polybase

  useEffect(() => {
    const connectToLit = async () => {
      const client = new LitJsSdk.LitNodeClient();
      await client.connect();
      return client;
    };
    connectToLit().then(async lc => {
      setLitClient(lc);

      const sig = await LitJsSdk.checkAndSignAuthMessage({
        chain,
      });

      setAuthSig(sig);
    });
  }, []);

  const encryptWithLit = async msg => {
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(msg);

    const encryptedSymmetricKey = await litClient.saveEncryptionKey({
      accessControlConditions: addressAccessControl(address),
      symmetricKey,
      authSig,
      chain,
    });

    const encryptedMessageStr = await LitJsSdk.blobToBase64String(
      encryptedString
    );

    const encryptedKeyStr = LitJsSdk.uint8arrayToString(
      encryptedSymmetricKey,
      'base16'
    );

    return {
      encryptedString: encryptedMessageStr,
      encryptedSymmetricKey: encryptedKeyStr,
    };
  };

  const decryptRec = async rec => {
    const { id, service, serviceKey, account, accountKey, secret, secretKey } =
      rec;
    return Promise.all([
      id,
      decryptWithLit(service, serviceKey),
      decryptWithLit(account, accountKey),
      decryptWithLit(secret, secretKey),
    ]).then(([id, decryptedService, decryptedAccount, decryptedSecret]) => ({
      id,
      service: decryptedService,
      account: decryptedAccount,
      secret: decryptedSecret,
    }));
  };

  const decryptPolybaseRecs = async recs => {
    const decryptedPolybaseRecs = [];
    for (let rec of recs) {
      const dr = await decryptRec(rec);
      decryptedPolybaseRecs.push(dr);
    }
    return decryptedPolybaseRecs;
  };

  const decryptWithLit = async (encryptedString, encryptedSymmetricKey) => {
    if (litClient) {
      const encryptedMessageBlob = await LitJsSdk.base64StringToBlob(
        encryptedString
      );

      const symmetricKey = await litClient.getEncryptionKey({
        accessControlConditions: addressAccessControl(address),
        toDecrypt: encryptedSymmetricKey,
        chain,
        authSig,
      });

      const decryptedMessage = await LitJsSdk.decryptString(
        encryptedMessageBlob,
        symmetricKey
      );

      return decryptedMessage;
    }
  };

  const [polybaseDb, setPolygbaseDb] = useState();
  const [defaultNamespace] = useState(
    'pk/0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc/TestTokens'
  );
  const [collectionReference] = useState('Keys');
  const [appId] = useState('wallet-otp');

  // need signer in order to create Polybase records
  const [addedSigner, setAddedSigner] = useState(false);
  const [cards, setCards] = useState();

  const deleteRecord = async id => {
    const record = await polybaseDb
      .collection(collectionReference)
      .record(id)
      .call('del');
    return record;
  };

  // main server side filter is user address so they only get their own records
  // note: they still wouldn't be able to decrypt other records
  const listRecordsWhereAppIdMatches = async (
    field = 'address',
    op = '==',
    val = address
  ) => {
    if (polybaseDb) {
      const records = await polybaseDb
        .collection(collectionReference)
        .where(field, op, val)
        .where('appId', '==', appId)
        .get();
      return records.data.map(d => d.data);
    }
  };

  const createPolybaseRecord = async (service, account, secret) => {
    setPolybaseLoading(true);
    try {
      // schema creation types
      // id: string, appId: string, address: string, service: string, serviceKey: string,
      // account: string, accountKey: string, secret: string, secretKey: string
      const id = `encrypted${Date.now().toString()}`;

      const record = await polybaseDb
        .collection(collectionReference)
        .create([
          id,
          appId,
          address,
          service.encryptedString,
          service.encryptedSymmetricKey,
          account.encryptedString,
          account.encryptedSymmetricKey,
          secret.encryptedString,
          secret.encryptedSymmetricKey,
        ]);

      setPolybaseRetrying(false);

      // update ui to show new card
      setCards(cards => [
        {
          id,
          service: service.Service,
          account: account.Account,
          secret: secret.Secret,
        },
        ...cards,
      ]);
    } catch (err) {
      console.log(err);

      // error handling and retry
      // -32603 is the error code if user cancels tx
      if (err.code !== -32603) {
        // if Polybase error, retry post data
        createPolybaseRecord(service, account, secret);
        setPolybaseRetrying(true);
      }
    }
    setPolybaseLoading(false);
  };

  const encryptAndSaveSecret = async ({ Service, Account, Secret }) => {
    const encryptedService = await encryptWithLit(Service);
    const encryptedAccount = await encryptWithLit(Account);
    const encryptedSecret = await encryptWithLit(Secret);
    createPolybaseRecord(
      { ...encryptedService, Service },
      { ...encryptedAccount, Account },
      { ...encryptedSecret, Secret }
    );
  };

  useEffect(() => {
    if (isConnected && address) {
      const db = new Polybase({
        defaultNamespace,
      });

      const addSigner = async () => {
        setAddedSigner(true);
        db.signer(async data => {
          const accounts = await eth.requestAccounts();
          const account = accounts[0];
          const sig = await eth.sign(data, account);
          return { h: 'eth-personal-sign', sig };
        });

        const setAvatar = async () => {
          if (ensName) {
            const avatarSrc = await publicClient.getEnsAvatar({
              name: ensName,
            });
            setEnsAvatar(avatarSrc);
          }
        };

        setAvatar();
        setPolygbaseDb(db);
      };

      addSigner();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (addedSigner && litClient && authSig) {
      const getEncryptedDataFromPolybase = async () => {
        return await listRecordsWhereAppIdMatches();
      };
      getEncryptedDataFromPolybase().then(async recs => {
        await decryptPolybaseRecs(recs).then(decryptedRecs => {
          setCards(decryptedRecs);
        });
      });
    }
  }, [addedSigner, litClient, authSig]);

  const shortAddress = addr => `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  const encodedNamespaceDb = encodeURIComponent(
    `${defaultNamespace}/${collectionReference}`
  );

  return (
    <>
      <LoaderModal
        open={polybaseLoading || polybaseRetrying}
        message={
          polybaseLoading
            ? 'Sign the message in your wallet to encrypt and save your 2FA secret'
            : 'Still polling Polybase, please sign again.'
        }
      />
      {address && (
        <HStack justifyContent={'space-between'}>
          <div>
            <Text
              bgGradient="linear(to-l, #7928CA, #FF0080)"
              bgClip="text"
              fontSize="4xl"
              fontWeight="bold"
            >
              Wallet OTP
            </Text>
          </div>

          {/* <BrowserView> */}
          <div>
            <AddSecret saveSecret={encryptAndSaveSecret} />
          </div>
          {/* </BrowserView> */}
        </HStack>
      )}
      {/* NEW LOGGED IN USER */}
      {cards && (
        <Card padding={isMobile ? 4 : 10} my={5}>
          <VStack alignItems="flex-start">
            <HStack>
              <a href={ensProfile} target="_blank">
                <Image
                  borderRadius="full"
                  boxSize={isMobile ? '80px' : '100px'}
                  // if the user has an ENS with a set avatar, the pfp is their avatar
                  src={ensAvatar}
                  // if the user doesn't have an avatar, use the fallback pfp, stored on NFT.storage 🐛✨🌈
                  // "https://bafybeie7nvrlwxqkmvj6e3mse5qdvmsozmghccqd7fdxtck6dbhcxt3le4.ipfs.nftstorage.link"
                  // note: the image is served lightning using Saturn's CDN
                  fallbackSrc="/ipfs/bafybeie7nvrlwxqkmvj6e3mse5qdvmsozmghccqd7fdxtck6dbhcxt3le4"
                  marginRight={isMobile ? 2 : 4}
                />
              </a>

              <VStack style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <Text>
                  <strong>
                    gm{' '}
                    {ensName ? (
                      <a href={ensProfile} target="_blank">
                        {ensName}
                      </a>
                    ) : (
                      'anon'
                    )}{' '}
                  </strong>
                </Text>

                <Text>
                  <CopyToClipboard text={address}>
                    <span
                      style={{
                        color: 'rgba(255, 255, 255, 0.25)',
                        marginLeft: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      <CopyIcon marginRight={1} />
                      <Tooltip label="Click to copy address">
                        {shortAddress(address)}
                      </Tooltip>
                    </span>
                  </CopyToClipboard>
                </Text>

                <Button
                  marginLeft={2}
                  onClick={() => disconnect()}
                  width={isMobile ? '100%' : 'fit-content'}
                >
                  Log out
                </Button>
              </VStack>
            </HStack>
          </VStack>
        </Card>
      )}

      {(!address || !cards) && <Spinner marginTop={20} size={'xl'} />}

      {cards && cards.length == 0 && (
        <Text textAlign="left">
          Get started with Wallet OTP by adding your first 2FA secret
        </Text>
      )}
      {/* Returning user with secrets*/}
      {cards &&
        cards.map(c => (
          <ServiceCard
            key={c.id}
            linkToEncodedData={`https://testnet.polybase.xyz/v0/collections/${encodedNamespaceDb}/records/${c.id}`}
            service={c.service}
            account={c.account}
            secret={c.secret}
          />
        ))}
    </>
  );
}

export default LoggedInPage;
