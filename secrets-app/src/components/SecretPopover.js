import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Button,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';
import { ViewIcon, CopyIcon } from '@chakra-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';

function SecretPopover({ secret, isDemo }) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button marginRight={4}>
          <ViewIcon marginRight={1} /> 2FA secret
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>{isDemo && 'Demo '}2FA secret</PopoverHeader>
        <PopoverBody color="#FF0080">
          <p>
            {secret.slice(0, 9)} .... {secret.slice(-9)}
          </p>
          <CopyToClipboard text={secret}>
            <Button marginTop={2}>
              <CopyIcon marginRight={1} /> Copy full {isDemo && ' demo '}2FA
              secret
            </Button>
          </CopyToClipboard>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export default SecretPopover;
