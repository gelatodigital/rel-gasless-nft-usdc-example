import { ethers } from 'ethers';

const sign = async (signer: ethers.JsonRpcSigner, token: ethers.Contract, value: bigint, spender: ethers.Contract, deadline: bigint, chainId: bigint): Promise<ethers.Signature | null> => {
  const salt = ethers.solidityPacked(['uint256'], [chainId]);

  const domain: ethers.TypedDataDomain = {
    name: await token.name(),
    version: '1',
    salt: salt,
    verifyingContract: token.target.toString()
  };

  const types = {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' }
    ]
  };

  const data = {
    owner: signer.address,
    spender: spender.target,
    value: value,
    nonce: await token.nonces(signer.address),
    deadline: deadline
  };

  try {
    const sig = await signer.signTypedData(domain, types, data);
    return ethers.Signature.from(sig);
  }
  catch (e) {
    return null
  }
};

export default sign;