import {
  useDisclosure,
  ModalContent,
  Modal,
  ModalOverlay,
  Spinner,
  ModalCloseButton,
  ModalBody,
  Center,
  ModalHeader,
} from '@chakra-ui/react';

function LoaderModal({ open, message, tableData }) {
  const { onClose } = useDisclosure();
  console.log('tableData', tableData);
  return (
    <>
      <Modal isOpen={open} onClose={onClose}>
        <ModalOverlay />
        <ModalContent padding={10}>
          <ModalHeader>{message}</ModalHeader>
          <Center marginTop={10}>
            <Spinner size="xl" />
          </Center>
        </ModalContent>
      </Modal>
    </>
  );
}
export default LoaderModal;
