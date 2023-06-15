import { useState, useEffect } from 'react';
import {
  Text,
  HStack,
  Button,
  Card,
  Image,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import { getPublicClient } from '@wagmi/core';
import { isMobile } from 'react-device-detect';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyIcon } from '@chakra-ui/icons';

import { useAccount, useDisconnect, useEnsName } from 'wagmi';
import { getAccount } from '@wagmi/core';
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

  const publicClient = getPublicClient();

  const account = getAccount();
  const { disconnect } = useDisconnect();
  const [polybaseLoading, setPolybaseLoading] = useState(false);
  const [polybaseRetrying, setPolybaseRetrying] = useState(false);
  const [ensAvatar, setEnsAvatar] = useState();

  // todo: check if wallet is part of data dao

  // todo: if it's part of data dao get mapping of wallet address -> encrypted collection on Polybase

  const [polybaseDb, setPolygbaseDb] = useState();
  const [defaultNamespace] = useState(
    'pk/0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc/TestTokens'
  );
  const [collectionReference] = useState('Keys');
  const [appId] = useState('test3');

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
      // id: string, appId: string, address: string, service: string, account: string, secret: string
      const id = `preencryption${Date.now().toString()}`;

      const record = await polybaseDb
        .collection(collectionReference)
        .create([id, appId, address, service, account, secret]);

      setPolybaseRetrying(false);

      // update ui to show new card
      setCards(cards => [
        {
          service,
          account,
          secret,
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

  const encryptAndSaveSecret = ({ Service, Account, Secret }) => {
    // todo: encrypt
    createPolybaseRecord(Service, Account, Secret);
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
    if (addedSigner) {
      const getEncryptedDataFromPolybase = async () => {
        return await listRecordsWhereAppIdMatches();
      };
      // todo: decrypt data
      getEncryptedDataFromPolybase().then(recs => setCards(recs));
    }
  }, [addedSigner]);

  const shortAddress = addr => `${addr.slice(0, 5)}...${addr.slice(-4)}`;

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
              <Image
                borderRadius="full"
                boxSize={isMobile ? '80px' : '100px'}
                src={ensAvatar}
                fallbackSrc="https://bafybeie7nvrlwxqkmvj6e3mse5qdvmsozmghccqd7fdxtck6dbhcxt3le4.ipfs.nftstorage.link"
                marginRight={isMobile ? 2 : 4}
              />
              <VStack style={{ textAlign: 'left', alignItems: 'flex-start' }}>
                <Text>
                  <strong>gm {ensName ? ensName : 'anon'} </strong>
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

                {/* <MobileView> */}
                {/* {' '} */}
                {/* <HStack> */}
                {/* <AddSecret saveSecret={encryptAndSaveSecret} /> */}
                <Button
                  marginLeft={2}
                  onClick={() => disconnect()}
                  width={isMobile ? '100%' : 'fit-content'}
                >
                  Log out
                </Button>
                {/* </HStack> */}
                {/* </MobileView> */}
              </VStack>
            </HStack>
          </VStack>
        </Card>
      )}

      {cards && cards.length == 0 && (
        <Text textAlign="left">
          Get started with Wallet OTP by adding your first 2FA secret
        </Text>
      )}

      {/* Returning user with secrets*/}
      {cards &&
        cards.map(c => (
          <ServiceCard
            key={c.secret}
            service={c.service}
            account={c.account}
            secret={c.secret}
          />
        ))}
    </>
  );
}

export default LoggedInPage;
