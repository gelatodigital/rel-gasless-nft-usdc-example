
import { CallWithSyncFeeRequest } from '@gelatonetwork/relay-sdk';
import { ReactComponent as Logo } from '../../icons/logo.svg';
import { useContext, useEffect, useState } from 'react';
import { Status, State } from '../../types/Status';
import { ethers } from 'ethers';
import RelayContext from '../../context/RelayContext';
import Web3Context from '../../context/Web3Context';
import jetch from '../../util/jetch';
import sign from '../../util/sign';
import config from '../../config';
import Header from '../Header';
import Button from '../Button';
import Price from '../Price';
import abi from '../../abi';
import './style.css';

const App = () => {
  const relay = useContext(RelayContext);
  const provider = useContext(Web3Context);

  const [fee, setFee] = useState<bigint | null>(null);
  const [price, setPrice] = useState<bigint | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [decimals, setDecimals] = useState<number | null>(null);

  const [nft, setNft] = useState<ethers.Contract | null>(null);
  const [token, setToken] = useState<ethers.Contract | null>(null);

  const onPurchase = async () => {
    try {
      setStatus({ state: State.pending, message: 'Waiting for signature' });

      const wallet = new ethers.BrowserProvider(window.ethereum);
      const signer = await wallet.getSigner();

      const amount = price! + fee!;
      const balance = await token!.balanceOf(signer.address);

      if (balance < amount)
        return setStatus({ state: State.failed, message: 'Insufficient balance' });

      const { chainId } = await provider.getNetwork();
      const deadline = ethers.MaxUint256;

      const sig = await sign(signer, token!, amount, nft!, deadline, chainId);

      if (!sig)
        return setStatus({ state: State.failed, message: 'Signature denied' });

      setStatus({ state: State.pending, message: 'Waiting for transaction' });

      const { v, r, s } = sig;
      const { data } = await nft!.mint.populateTransaction(signer.address, amount, deadline, v, r, s);

      const request: CallWithSyncFeeRequest = {
        chainId: chainId.toString(),
        target: nft!.target.toString(),
        feeToken: token!.target.toString(),
        isRelayContext: true,
        data: data
      };

      const { taskId } = await relay.callWithSyncFee(request);

      const updateStatus = async () => {
        const { task } = await jetch(config.gelato + '/tasks/status/' + taskId);

        switch (task?.taskState) {
          case 'ExecSuccess':
            setStatus({ state: State.success, message: 'Success' });
            return;
          case 'Cancelled':
            setStatus({ state: State.failed, message: 'Purchase failed' });
            return;
          default:
            await new Promise(r => setTimeout(r, 1_000));
            await updateStatus();
            return;
        }
      };

      updateStatus();
    }
    catch (e) {
      setStatus({ state: State.failed, message: 'Wallet connection denied' });
    }
  };

  useEffect(() => {
    (async () => {
      const nft = new ethers.Contract(config.chain.mumbai.contract, abi.GaslessNFT, provider);
      const token = new ethers.Contract(await nft.token(), abi.ERC20Permit, provider);
      const decimals = await token.decimals();
      const price = await nft.price();

      setNft(nft);
      setToken(token);
      setPrice(price);
      setDecimals(decimals);

      const { chainId } = await provider.getNetwork();

      const updateFee = async () => {
        const fee = await relay.getEstimatedFee(
          Number(chainId),
          token.target.toString(),
          600_000n as any,
          false
        );

        setFee(fee.toBigInt());
        setTimeout(updateFee, 10_000);
      };

      updateFee();
    })();
  }, [provider, relay]);

  return (
    <div className='App'>
      <div className='container'>
        <Header />
        <main>
          <div className='product'>
            <div className='image'><Logo /></div>
            <div className='total'>
              <div>
                <span>NFT Price</span>
                <Price amount={price} decimals={decimals} />
              </div>
              <div>
                <span>Gas Fee</span>
                <Price amount={fee} decimals={decimals} />
              </div>
              <hr />
              <div>
                <span>Total</span>
                <Price amount={ (!price || !fee) ? null : price + fee } decimals={decimals} />
              </div>
            </div>
            <Button status={ status } onClick={ onPurchase }>Purchase</Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
