import {
  Text,
  Container,
  Button,
  Center,
  VStack,
  Image,
  HStack,
  Wrap,
  WrapItem,
  useColorMode,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { isMobile } from 'react-device-detect';
import { test2FAData } from '../testData';
import ServiceCard from '../components/ServiceCard';
import { imgProviderSrc } from '../ipfsHelpers';
import { ipfsCids } from '../ipfsCids';

import { useWeb3Modal } from '@web3modal/wagmi/react';
import { isBrowser } from 'react-device-detect';
import { openInNewTab } from '../helper';
import { getThemeData } from '../theme';

function LandingPage() {
  const logo = (cid, link) => (
    <a href={link} target="_blank">
      <Image
        borderRadius="full"
        boxSize="50px"
        src={imgProviderSrc(isMobile, cid)}
        fallbackSrc={imgProviderSrc(true, cid)}
        margin={2}
      />
    </a>
  );

  const { open, close } = useWeb3Modal();
  const { colorMode, toggleColorMode } = useColorMode();
  const themeData =
    colorMode === 'light' ? getThemeData('brat') : getThemeData('demure');

  return (
    <>
      <Container>
        <Text fontSize="5xl" fontWeight="bold">
          Wally
        </Text>
        <Text fontSize="large" fontWeight="bold">
          is your favorite new auth app
        </Text>
        <Center my={3}>
          {window.ethereum && (
            <Button my={2} onClick={() => open()}>
              Get started
            </Button>
          )}
          {!window.ethereum && (
            <VStack>
              {isBrowser ? (
                <>
                  <Text>Sign QR to open in Metamask Mobile</Text>
                  <QRCode
                    size={50}
                    style={{ height: 'auto', maxWidth: '50%', width: '50%' }}
                    value="https://metamask.app.link/dapp/wallet-otp.on.fleek.co"
                    viewBox={`0 0 50 50`}
                  />
                </>
              ) : (
                <Button
                  my={4}
                  background={'#7928CA'}
                  onClick={() =>
                    openInNewTab(
                      'https://metamask.app.link/dapp/wallet-otp.on.fleek.co'
                    )
                  }
                >
                  Sign in from Metamask Mobile
                </Button>
              )}
            </VStack>
          )}
        </Center>
      </Container>
      <hr></hr>
      <br></br>

      <div>
        <Text fontSize="2xl" fontWeight="bold" textAlign={'left'}>
          Demo
        </Text>
        <Text fontSize={'12px'} textAlign={'left'}>
          Here's how Wally works: your social accounts give you a 2FA secret.
          Set and forget the secrets in Wally. Use Wally from any device, any
          time to find your dynamically generated OTPs (6 digit codes) to help
          you log in to your socials.
        </Text>
      </div>
      <br></br>
      <Wrap justify={'center'} spacing="20px" w="100%">
        {test2FAData.map(c => (
          <WrapItem
            boxSizing="border-box"
            justifyContent={'center'}
            width={isMobile ? '100%' : '48%'}
          >
            <ServiceCard
              isDemo
              key={c.secret}
              service={c.service}
              account={c.account}
              secret={c.secret}
              themeData={themeData}
            />
          </WrapItem>
        ))}
      </Wrap>
    </>
  );
}

export default LandingPage;
