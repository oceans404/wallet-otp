import {
  Card,
  CardBody,
  Center,
  Box,
  CardFooter,
  Button,
} from '@chakra-ui/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyIcon } from '@chakra-ui/icons';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import * as authenticator from 'authenticator';
import { useState, useEffect } from 'react';
import SecretPopover from './SecretPopover';

function ServiceCard({ name, secret }) {
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
        <div>{name}</div>
        <Center marginTop={5}>
          <CountdownCircleTimer
            key={timerRefresh}
            colors="url(#your-unique-id)"
            isPlaying
            duration={duration}
            size={120}
          >
            {({ remainingTime }) => spaceOutCode(code)}
          </CountdownCircleTimer>
        </Center>
      </CardBody>
      <CardFooter justify={'center'}>
        <SecretPopover secret={secret} />
        <CopyToClipboard text={code}>
          <Button>
            <CopyIcon marginRight={1} /> Copy OTP
          </Button>
        </CopyToClipboard>
      </CardFooter>
    </Card>
  );
}

export default ServiceCard;
