import {
  Card,
  CardBody,
  Center,
  Box,
  CardFooter,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import * as authenticator from 'authenticator';
import { useState, useEffect } from 'react';
import SecretPopover from './SecretPopover';

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function ServiceCard({ service, account, secret, isDemo, linkToEncodedData }) {
  const [timerRefresh, setTimerRefresh] = useState(0);
  const [code, setCode] = useState('******');
  // starting duration offset from current time (new code at 0/60 and 30 seconds)
  const [duration, setDuration] = useState(
    new Date().getSeconds() > 30
      ? 60 - new Date().getSeconds()
      : 30 - new Date().getSeconds()
  );
  useEffect(() => {
    const getCode = async () => {
      const formattedToken = authenticator.generateToken(secret);
      setCode(formattedToken);
    };

    const interval = setInterval(() => {
      const secs = new Date().getSeconds();
      // every 30 seconds a new code is generated
      if (secs === 0 || secs === 30) {
        getCode();
        setDuration(30);
        setTimerRefresh(previousTimerRefresh => previousTimerRefresh + 1);
      }
    }, 1000);
    getCode();
    return () => clearInterval(interval);
  }, []);

  const spaceOutCode = num => `${num.slice(0, 3)} ${num.slice(3)}`;

  return (
    <Card width={'100%'} my={4}>
      <Box height={0}>
        <svg>
          <defs>
            <linearGradient id="your-unique-id" x1="1" y1="0" x2="0" y2="0">
              <stop offset="5%" stopColor="#7928CA" />
              <stop offset="95%" stopColor="#FF0080" />
            </linearGradient>
          </defs>
        </svg>
      </Box>

      <CardBody>
        <div>
          {service}: {account}
        </div>
        <CopyToClipboard text={code}>
          <Center marginTop={5} style={{ cursor: 'pointer' }}>
            <CountdownCircleTimer
              key={timerRefresh}
              colors="url(#your-unique-id)"
              isPlaying
              duration={duration}
              size={150}
            >
              {({ remainingTime }) => (
                <VStack gap={0}>
                  <Text fontSize={'24px'} color={'#FF0080'} m={0} p={0}>
                    <strong>{spaceOutCode(code)}</strong>
                  </Text>
                  <Text color={''} fontSize={'13px'} m={0} p={0}>
                    <CopyIcon /> Copy OTP
                  </Text>
                </VStack>
              )}
            </CountdownCircleTimer>
          </Center>
        </CopyToClipboard>
      </CardBody>

      <CardFooter justify={'center'}>
        <SecretPopover
          secret={secret}
          isDemo={isDemo}
          linkToEncodedData={linkToEncodedData}
        />
        {linkToEncodedData && (
          <Button
            onClick={() => openInNewTab(linkToEncodedData)}
            marginLeft={4}
          >
            <ExternalLinkIcon marginRight={1} /> Encrypted data
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ServiceCard;
