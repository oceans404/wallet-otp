import { Text, Container, Button } from '@chakra-ui/react';

import { Web3Button } from '@web3modal/react';

function LandingPage() {
  return (
    <>
      <Container>
        <Text
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          fontSize="4xl"
          fontWeight="bold"
          marginTop={4}
        >
          say GM to Wallet OTP
        </Text>

        <Text fontSize="large" fontWeight="bold">
          a wallet encrypted, self-custodial, 2FA solution
        </Text>
        <br></br>
        <Text fontSize={'14px'}>
          Two-factor authentication (2FA) adds an additional layer of protection
          beyond passwords to your web2 and web3 accounts. Wallet OTP is a free
          and completely open sourced public good that protects all your
          accounts by encrypting your 2FA secrets with your Wallet's public key
          before storing on decentralized storage. When you need 2FA, Wallet OTP
          generates new dynamic 6 digit OTPs (one time passwords) every 30
          seconds. That way, you and only you can use Wallet OTP to log in to
          accounts across the web.
          <br></br>
          <br></br>
          Check out the example below to see Wallet OTP in action. Don't worry,
          the example uses test accounts and test secrets. Ready to start using
          Wallet OTP? Sign in to manage 2FA from Wallet OTP.
        </Text>
        <br></br>
        <div>
          <Button
            padding={'0'}
            my={4}
            className="sign-in-button"
            background={'#7928CA'}
          >
            <Web3Button
              icon="hide"
              avatar="hide"
              label="Sign in with your wallet"
            />{' '}
          </Button>
        </div>
      </Container>

      <br></br>
      <hr></hr>
      <br></br>

      <div>
        <Text
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          fontSize="2xl"
          fontWeight="bold"
          textAlign={'left'}
        >
          Wallet OTP in action with demo accounts & secrets
        </Text>
        <Text fontSize={'12px'} textAlign={'left'}>
          Want to test whether Wallet OTP's one time passwords actually work?
          Add these demo 2FA secrets to your Authy or Google Authenticator app.
          The Wallet OTP dynamically generated OTPs match OTPs from any other
          service. 👯‍♀️
        </Text>
      </div>
    </>
  );
}

export default LandingPage;
