import {
  ChakraProvider,
  Box,
  VStack,
  Grid,
  extendTheme,
  Container,
} from '@chakra-ui/react';

import { useAccount } from 'wagmi';

import './App.css';
import LandingPage from './pages/LandingPage';
import LoggedInPage from './pages/LoggedInPage';

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

function App() {
  const { isConnected } = useAccount();
  return (
    <ChakraProvider theme={extendTheme({ config })}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <VStack spacing={8}>
            <Container minWidth={'80%'} maxWidth={'700px'}>
              {isConnected ? <LoggedInPage /> : <LandingPage />}
            </Container>
          </VStack>
        </Grid>
      </Box>
    </ChakraProvider>
  );
}

export default App;
