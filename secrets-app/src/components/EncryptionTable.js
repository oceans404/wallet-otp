import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';

function EncryptionTable({ tableData: { service, account, secret } }) {
  const shortenValue = (val, amount = 20) => `${val.slice(0, amount)}...`;
  return (
    service &&
    account &&
    secret && (
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>
                Secrets Encrypted by{' '}
                <a
                  href="https://litprotocol.com"
                  target="_blank"
                  style={{ textDecoration: 'underline' }}
                >
                  Lit
                </a>{' '}
                🔥
              </Th>
              <Th>
                Stored in{' '}
                <a
                  href="https://polybase.xyz"
                  target="_blank"
                  style={{ textDecoration: 'underline' }}
                >
                  Polybase
                </a>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>{service.decrypted}</Td>
              <Td>{shortenValue(service.encrypted.encryptedString)}</Td>
            </Tr>
            <Tr>
              <Td>{account.decrypted}</Td>
              <Td>{shortenValue(account.encrypted.encryptedString)}</Td>
            </Tr>
            <Tr>
              <Td>{shortenValue(secret.decrypted)}</Td>
              <Td>{shortenValue(secret.encrypted.encryptedString)}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    )
  );
}

export default EncryptionTable;
