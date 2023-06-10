import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

function AddSecret({ saveSecret }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleNewSecret = () => {
    onClose();
    saveSecret();
  };
  return (
    <>
      <Button onClick={onOpen}>+ Add Secret</Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add secret</ModalHeader>
          <ModalCloseButton />
          <ModalBody>inputs inputs inputs</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleNewSecret}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddSecret;
