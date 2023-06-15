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
  Input,
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { AddIcon } from '@chakra-ui/icons';

function AddSecret({ saveSecret }) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { register, handleSubmit, reset } = useForm();

  const onSubmit = data => {
    onClose();
    saveSecret(data);
    reset();
  };

  const title = '2FA secret';

  return (
    <>
      <Button onClick={onOpen} background={'#7928CA'}>
        <AddIcon marginRight={2} /> {title}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a new {title}</ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(onSubmit)}>
            <ModalBody>
              <Text>Service</Text>
              <Input
                type="text"
                placeholder="Google"
                {...register('Service', { required: true, maxLength: 80 })}
                marginBottom={2}
              />
              <Text>Account</Text>
              <Input
                type="text"
                placeholder="steph@gmail.com"
                {...register('Account', {
                  required: true,
                  max: 100,
                  maxLength: 100,
                })}
                marginBottom={2}
              />
              <Text>2FA secret key from service</Text>
              <Input
                type="text"
                placeholder="j22h ni4e cd4o hqrx fka7 7uye wf2d xh77"
                {...register('Secret', {
                  required: true,
                  minLength: 32,
                  maxLength: 80,
                })}
              />
            </ModalBody>

            <ModalFooter>
              <Button
                background="#FF0080"
                mr={3}
                onClick={handleSubmit(onSubmit)}
              >
                Save
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AddSecret;
