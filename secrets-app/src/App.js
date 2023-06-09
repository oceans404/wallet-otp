import React from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  theme,
  Text,
} from '@chakra-ui/react';

import ServiceCard from './ServiceCard';

function App() {
  // todo: implement wallet auth, sign in with ENS

  // check if wallet is part of data dao

  // if it's part of data dao get mapping of wallet address -> encrypted collection on Polybase

  // these secrets are currently hardcoded but will come from Polybase or some encrypted db
  // todo: decrypt secret then display cards
  const cards = [
    // these are fake accounts and fake secrets
    {
      name: 'Google: test@google.com',
      secret: 'j22h ni4e cd4o hqrx fka7 7uye wf2d xh77',
    },
    {
      name: 'Instagram: @steph',
      secret: 'tcwb oqj3 f3p3 5lca iarf dpqv rhc6 5iwt',
    },
    {
      name: process.env.REACT_APP_FALLBACK_SERVICE_NAME,
      secret: process.env.REACT_APP_FALLBACK_SERVICE_SECRET,
    },
  ];
  return (
    <ChakraProvider theme={theme}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <Text
              bgGradient="linear(to-l, #7928CA, #FF0080)"
              bgClip="text"
              fontSize="6xl"
              fontWeight="extrabold"
            >
              My OTPs
            </Text>
            {cards.map(c => (
              <ServiceCard key={c.name} name={c.name} secret={c.secret} />
            ))}
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
