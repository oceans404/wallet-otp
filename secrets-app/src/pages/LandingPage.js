import {
  Text,
  Container,
  Button,
  Center,
  VStack,
  Image,
  HStack,
  Wrap,
} from '@chakra-ui/react';
import QRCode from 'react-qr-code';
import { isMobile } from 'react-device-detect';
import { test2FAData } from '../testData';
import ServiceCard from '../components/ServiceCard';
import { imgProviderSrc } from '../ipfsHelpers';
import { ipfsCids } from '../ipfsCids';

import { Web3Button } from '@web3modal/react';
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
  const themeData = getThemeData('default');
  return (
    <>
      <Container>
        <Text
          bgGradient={`linear(to-l, ${themeData.color2}, ${themeData.color1})`}
          bgClip="text"
          fontSize="5xl"
          fontWeight="bold"
          marginTop={4}
        >
          Wallet OTP
        </Text>

        <Text fontSize="large" fontWeight="bold">
          is a decentralized, wallet encrypted, 2FA storage solution
        </Text>
        <br></br>
        <Text fontSize={'14px'}>
          Two-factor authentication (2FA) adds an additional layer of protection
          beyond passwords to your web2 and web3 accounts. Wallet OTP is{' '}
          <a
            href="https://github.com/oceans404/wallet-otp"
            target="_blank"
            style={{ textDecoration: 'underline' }}
          >
            a free and completely open source public good
          </a>{' '}
          that protects all your accounts by encrypting your 2FA secrets with
          your Wallet's public key before storing on decentralized storage. When
          you need 2FA, Wallet OTP generates new dynamic 6 digit OTPs (one time
          passwords) every 30 seconds. That way, you and only you can use Wallet
          OTP to log in to accounts across the web. Sign in to use Wallet OTP ⬇️
        </Text>
        <Center my={6}>
          {window.ethereum && (
            <Button padding={'0'} my={4} background={'#7928CA'}>
              <Web3Button
                icon="hide"
                avatar="hide"
                label="Sign in with your wallet"
              />
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

        <Center>
          <VStack>
            <Text
              bgGradient={`linear(to-l, ${themeData.color2}, ${themeData.color1})`}
              bgClip="text"
              fontSize={'14px'}
            >
              Wallet OTP has a decentralized stack powered by
            </Text>
            <HStack>
              <Wrap justifyContent={'space-around'}>
                {logo(ipfsCids.ens, 'https://ens.domains/')}
                {logo(ipfsCids.lit, 'https://litprotocol.com/')}
                {logo(ipfsCids.polybase, 'https://polybase.xyz/')}
                {logo(ipfsCids.fleek, 'https://fleek.co/')}
                {logo(ipfsCids.nftstorage, 'https://nft.storage/')}
                {logo(ipfsCids.ipfs, 'https://ipfs.tech/')}
                {logo(ipfsCids.apecoin, 'https://apecoin.com/')}
                {logo(ipfsCids.saturn, 'https://saturn.tech/')}
              </Wrap>
            </HStack>
          </VStack>
        </Center>
        <br></br>
      </Container>
      <hr></hr>
      <br></br>

      <div>
        <Text
          bgGradient={`linear(to-l, ${themeData.color2}, ${themeData.color1})`}
          bgClip="text"
          fontSize="2xl"
          fontWeight="bold"
          textAlign={'left'}
        >
          Wallet OTP in action with demo accounts & secrets
        </Text>
        <Text fontSize={'12px'} textAlign={'left'}>
          This is a demo to show Wallet OTP in action in case you want to check
          out the experience before signing in with your wallet. Don't worry,
          the demo uses test accounts and test secrets. Want to test whether
          Wallet OTP's one time passwords actually work? Add these demo 2FA
          secrets to your Authy or Google Authenticator app. The Wallet OTP
          dynamically generated OTPs match OTPs from any other service. 👯‍♀️
        </Text>
      </div>
      <div>
        {test2FAData.map(c => (
          <ServiceCard
            isDemo
            key={c.secret}
            service={c.service}
            account={c.account}
            secret={c.secret}
            themeData={themeData}
          />
        ))}
      </div>
    </>
  );
}

export default LandingPage;
