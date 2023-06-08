import { createContext } from 'react';
import { ethers } from 'ethers';
import config from '../config';

const provider = new ethers.JsonRpcProvider(config.chain.mumbai.provider);
const context = createContext(provider);

export default context;
