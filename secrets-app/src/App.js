import { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  extendTheme,
  Text,
  Container,
  HStack,
  Button,
} from '@chakra-ui/react';

import { useAccount, useDisconnect } from 'wagmi';
import { getAccount } from '@wagmi/core';
import { Polybase } from '@polybase/client';
import * as eth from '@polybase/eth';

import ServiceCard from './components/ServiceCard';
import AddSecret from './components/AddSecret';
import LoaderModal from './components/LoaderModal';
import './App.css';
import LandingPage from './pages/LandingPage';
import { test2FAData } from './testData';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

function App() {
  const { address, isConnected } = useAccount();
  const account = getAccount();
  const { disconnect } = useDisconnect();
  const [polybaseLoading, setPolybaseLoading] = useState(false);
  const [polybaseRetrying, setPolybaseRetrying] = useState(false);
  // todo: add signed in with ENS ui

  // check if wallet is part of data dao

  // if it's part of data dao get mapping of wallet address -> encrypted collection on Polybase

  // these secrets are currently hardcoded but will come from Polybase or some encrypted db
  // todo: decrypt secret then display cards
  const [polybaseDb, setPolygbaseDb] = useState();
  const [defaultNamespace] = useState(
    'pk/0x0a4f8fcf98d7e5745ed5911b7c6f864e92a0016539d9ed46221d1e378ceb1e2498fc2390ee81ab65fd6a6e9255d334bcbed14f25db92faf2c7c4e785181675dc/TestTokens'
  );
  const [collectionReference] = useState('Keys');
  const [appId] = useState('test1');

  const [collectionData, setCollectionData] = useState([]);

  // need signer in order to create Polybase records
  const [addedSigner, setAddedSigner] = useState(false);
  const [cards, setCards] = useState(test2FAData);

  const listRecords = async () => {
    const records = await polybaseDb.collection(collectionReference).get();
    return records;
  };

  const deleteRecord = async id => {
    const record = await polybaseDb
      .collection(collectionReference)
      .record(id)
      .call('del');
    return record;
  };

  const listRecordsWhere = async (field, op, val) => {
    const records = await polybaseDb
      .collection(collectionReference)
      .where(field, op, val)
      .get();
    return records;
  };

  const createRecord = async (service, account, secret) => {
    console.log('createRecord');
    setPolybaseLoading(true);
    try {
      // schema creation types
      // id: string, appId: string, address: string, service: string, account: string, secret: string
      const id = `preencryption${Date.now().toString()}`;

      const record = await polybaseDb
        .collection(collectionReference)
        .create([id, appId, address, service, account, secret]);

      console.log('success!', record);
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

      // -32603 is the error code if user cancels tx
      if (err.code !== -32603) {
        createRecord(service, account, secret);
        setPolybaseRetrying(true);
      }
    }
    setPolybaseLoading(false);
  };

  const encryptAndSaveSecret = ({ Service, Account, Secret }) => {
    // todo: encrypt
    createRecord(Service, Account, Secret);
  };

  useEffect(() => {
    if (isConnected) {
      const db = new Polybase({
        defaultNamespace,
      });

      console.log(account);

      const addSigner = async () => {
        db.signer(async data => {
          const accounts = await eth.requestAccounts();
          const account = accounts[0];
          const sig = await eth.sign(data, account);
          setAddedSigner(true);
          return { h: 'eth-personal-sign', sig };
        });
      };

      // Add signer fn
      addSigner()
        .then(() => {
          console.log(db);
        })
        .then(() => {
          setPolygbaseDb(db);
          console.log('setPolygbaseDb');
        });
    }
  }, [isConnected]);

  return (
    <ChakraProvider theme={extendTheme({ config })}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <LoaderModal
              open={polybaseLoading || polybaseRetrying}
              message={
                polybaseLoading
                  ? 'Sign the message in your wallet to encrypt and save'
                  : 'Still polling Polybase, please sign again.'
              }
            />
            <Container>
              {isConnected && address && (
                <HStack justifyContent={'space-between'}>
                  <Text
                    bgGradient="linear(to-l, #7928CA, #FF0080)"
                    bgClip="text"
                    fontSize="4xl"
                    fontWeight="bold"
                  >
                    My OTPs
                  </Text>
                  <div>
                    <AddSecret saveSecret={encryptAndSaveSecret} />
                    <Button marginLeft={2} onClick={() => disconnect()}>
                      Log out
                    </Button>
                  </div>
                </HStack>
              )}
              {!isConnected && <LandingPage />}
              {cards.map(c => (
                <ServiceCard
                  key={c.secret}
                  service={c.service}
                  account={c.account}
                  secret={c.secret}
                />
              ))}
            </Container>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
