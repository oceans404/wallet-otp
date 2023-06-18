import {
  useDisclosure,
  ModalContent,
  Modal,
  ModalOverlay,
  Spinner,
  Center,
  ModalHeader,
} from '@chakra-ui/react';
import EncryptionTable from './EncryptionTable';

function LoaderModal({ open, message, tableData }) {
  const { onClose } = useDisclosure();
  return (
    <Modal isOpen={open} onClose={onClose} width={'100%'} size={'xl'}>
      <ModalOverlay />
      <ModalContent padding={5} width={'100%'}>
        <ModalHeader>{message}</ModalHeader>
        <Center my={10}>
          <Spinner size="xl" />
        </Center>
        <EncryptionTable tableData={tableData} />
      </ModalContent>
    </Modal>
  );
}
export default LoaderModal;
