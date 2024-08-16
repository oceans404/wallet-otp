import {
  Box,
  ChakraProvider,
  Container,
  extendTheme,
  Flex,
  Grid,
  Switch,
  Text,
  useColorMode,
  VStack,
} from '@chakra-ui/react';

import { useAccount } from 'wagmi';

import './App.css';
import LandingPage from './pages/LandingPage';
import LoggedInPage from './pages/LoggedInPage';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const styles = {
  global: props => ({
    body: {
      bg: props.colorMode === 'light' ? '#89CC04' : '#1E2530',
      fontFamily:
        props.colorMode === 'light'
          ? `'Arial Narrow', Arial, sans-serif`
          : `'Open Sans', sans-serif`,
    },
  }),
};

const colors = {
  light: {
    primary: '#f5f5f5',
    secondary: '#e2e8f0',
  },
  dark: {
    primary: '#1a202c',
    secondary: '#2d3748',
  },
};

const customTheme = extendTheme({
  config,
  styles,
  colors,
});

function ThemeToggleButton() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex alignItems="center" p={2}>
      <Text
        mr={2}
        style={{ fontFamily: `'Arial Narrow', Arial, sans-serif` }}
        color={colorMode === 'light' ? 'inherit' : '#89CC04'}
      >
        brat
      </Text>
      <Switch
        isChecked={colorMode === 'dark'}
        onChange={toggleColorMode}
        size="lg"
        sx={{
          '& .chakra-switch__track': {
            bg: 'black', // Replace with your desired hex color
          },
          '& .chakra-switch__track[data-checked]': {
            bg: '#89CC04', // Replace with your desired hex color
          },
        }}
      />
      <Text
        ml={2}
        style={{ fontFamily: `Georgia, serif`, color: 'white' }}
        color={colorMode === 'light' ? 'blue.900' : 'inherit'}
      >
        demure
      </Text>
    </Flex>
  );
}

function App() {
  const { address, isConnecting, isDisconnected, isConnected } = useAccount();
  return (
    <ChakraProvider theme={customTheme}>
      <Box textAlign="center" fontSize="xl">
        <Flex justifyContent="flex-end" px={4}>
          <ThemeToggleButton />
        </Flex>
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
