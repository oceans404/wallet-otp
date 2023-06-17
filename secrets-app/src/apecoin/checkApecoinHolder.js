import { Network, Alchemy } from 'alchemy-sdk';
import { ethers } from 'ethers';
import stakingAbi from './stakingAbi.json';

const alchemyMainnet = new Alchemy({
  apiKey: process.env.REACT_APP_ALCHEMY_KEY_MAINNET,
  network: Network.ETH_MAINNET,
});

const alchemyGoerli = new Alchemy({
  apiKey: process.env.REACT_APP_ALCHEMY_KEY_GOERLI,
  network: Network.ETH_GOERLI,
});

const apecoinContractMainnet = '0x4d224452801ACEd8B2F0aebE155379bb5D594381';
const apecoinContractGoerli = '0x328507DC29C95c170B56a1b3A758eB7a9E73455c';
const apecoinStakingContract = '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9';

export const checkIfApecoinTokenHolder = async (
  address,
  mainOrTest = 'mainnet'
) => {
  if (mainOrTest === 'mainnet') {
    return alchemyMainnet.core
      .getTokenBalances(address, [apecoinContractMainnet])
      .then(balances => {
        const { tokenBalances } = balances;
        const holdsTokens =
          tokenBalances[0].tokenBalance !==
          '0x0000000000000000000000000000000000000000000000000000000000000000';
        return holdsTokens; //boolean
      });
  } else {
    return alchemyGoerli.core
      .getTokenBalances(address, [apecoinContractGoerli])
      .then(balances => {
        const { tokenBalances } = balances;
        const holdsTokens =
          tokenBalances[0].tokenBalance !==
          '0x0000000000000000000000000000000000000000000000000000000000000000';
        return holdsTokens; //boolean
      });
  }
};

// https://docs.apestake.io/#/Reading?id=get-stakes-by-address
export const checkIfStakingApecoin = async address => {
  const provider = new ethers.BrowserProvider({
    ...window.ethereum,
    network: Network.ETH_MAINNET,
  });
  const contract = new ethers.Contract(
    apecoinStakingContract,
    stakingAbi,
    provider
  );
  try {
    const stakes = await contract.getAllStakes(address);
    console.log('apecoin', stakes);
    return Object.keys(stakes).length > 1; //boolean
  } catch (error) {
    console.error('Error calling function:', error);
    return false;
  }
};
