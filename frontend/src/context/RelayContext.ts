
import { GelatoRelay } from '@gelatonetwork/relay-sdk';
import { createContext } from 'react';

const relay = new GelatoRelay();
const context = createContext(relay);

export default context;
