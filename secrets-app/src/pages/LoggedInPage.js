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
import { CopyIcon, CheckCircleIcon } from '@chakra-ui/icons';
import * as LitJsSdk from '@lit-protocol/lit-node-client';

import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { Polybase } from '@polybase/client';
import * as eth from '@polybase/eth';

import AddSecret from '../components/AddSecret';
import ServiceCard from '../components/ServiceCard';
import LoaderModal from '../components/LoaderModal';
import { getThemeData } from '../theme';
import {
  checkIfApecoinTokenHolder,
  checkIfStakingApecoin,
} from '../apecoin/checkApecoinHolder';
import { imgProviderSrc } from '../ipfsHelpers';

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
  const [current2fa, setCurrent2fa] = useState();
  const [ensAvatar, setEnsAvatar] = useState();
  const [theme, setTheme] = useState('default');
  const [themeData, setThemeData] = useState(getThemeData(theme));

  useEffect(() => {
    setThemeData(getThemeData(theme));
  }, [theme]);

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

  useEffect(() => {
    const checkApecoinDaoTheme = async () => {
      const isApecoinHolder = await checkIfApecoinTokenHolder(address);
      const isApecoinHolderTestnet = await checkIfApecoinTokenHolder(
        address,
        'testnet'
      );
      const isApecoinStaker = await checkIfStakingApecoin(address);
      setTheme(
        isApecoinHolder || isApecoinStaker || isApecoinHolderTestnet
          ? 'apecoinDao'
          : 'default'
      );
    };

    const connectToLit = async () => {
      const client = new LitJsSdk.LitNodeClient();
      await client.connect();
      return client;
    };
    checkApecoinDaoTheme();
    connectToLit().then(async lc => {
      setLitClient(lc);

      if (window.ethereum) {
        const sig = await LitJsSdk.checkAndSignAuthMessage({
          chain,
        });

        setAuthSig(sig);
      }
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
  const [appId] = useState('wo');

  // need signer in order to create Polybase records
  const [addedSigner, setAddedSigner] = useState(false);
  const [cards, setCards] = useState();
  const [filteredCards, setFilteredCards] = useState(cards);

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
          service: service.service,
          account: account.account,
          secret: secret.secret,
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

  const encryptAndSaveSecret = async ({ service, account, secret }) => {
    const encryptedService = await encryptWithLit(service);
    const encryptedAccount = await encryptWithLit(account);
    const encryptedSecret = await encryptWithLit(secret);

    const full2fa = {
      service: {
        decrypted: service,
        encrypted: encryptedService,
      },
      account: {
        decrypted: account,
        encrypted: encryptedAccount,
      },
      secret: {
        decrypted: secret,
        encrypted: encryptedSecret,
      },
    };

    setCurrent2fa(full2fa);

    createPolybaseRecord(
      { ...encryptedService, service },
      { ...encryptedAccount, account },
      { ...encryptedSecret, secret }
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
          const serviceSortedRecs = decryptedRecs.sort((a, b) => {
            // if same service, alphabetize by account
            if (a.service.toLowerCase() === b.service.toLowerCase()) {
              return a.account.toLowerCase() > b.account.toLowerCase() ? 1 : -1;
            } else {
              // alphabetize by service
              return a.service.toLowerCase() > b.service.toLowerCase() ? 1 : -1;
            }
          });
          setCards(serviceSortedRecs);
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
        tableData={current2fa}
      />
      {address && (
        <HStack justifyContent={'space-between'}>
          <div>
            <Text
              bgGradient={`linear(to-l, ${themeData.color2}, ${themeData.color1})`}
              bgClip="text"
              fontSize="4xl"
              fontWeight="bold"
            >
              Wallet OTP
            </Text>
          </div>

          {cards && (
            <AddSecret
              saveSecret={encryptAndSaveSecret}
              themeData={themeData}
            />
          )}
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
                  fallbackSrc={imgProviderSrc(
                    isMobile,
                    themeData.fallbackPfpIpfsCid
                  )}
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
                    {theme === 'apecoinDao' && (
                      <Text fontSize={'10px'} color={themeData.color2}>
                        ApecoinDAO Member <CheckCircleIcon marginLeft={1} />
                      </Text>
                    )}
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
          Get started with Wallet OTP by adding your first 2FA secret. Need
          help?{' '}
          <a
            style={{ textDecoration: 'underline' }}
            target="_blank"
            href="https://www.notion.so/oceans404/How-to-add-2FA-codes-from-your-web2-and-web3-apps-to-the-Wallet-OTP-Authenticator-App-3152a69aa47e4f02ab347c60006bd9be?pvs=4"
          >
            Read the docs
          </a>
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
            themeData={themeData}
          />
        ))}
    </>
  );
}

export default LoggedInPage;
