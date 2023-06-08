# Gasless NFT minting using USDC powered by Gelato Relay
Non-Fungible Tokens (NFTs) have taken the digital world by storm, revolutionizing the way we perceive and trade digital assets. However, there has been a persistent barrier of entry preventing mass adoption – the requirement of a native token in order to transact on the appropriate network. Gelato Relay streamlines this process all whilst remaining trust minimised. This project illustrates the simplicity of integrating gasless minting into your next NFT project.

To accomplish this, the user signs a permit signature off-chain allowing the NFT contract to spend a specified amount of USDC. The function arguments along with the signature are submitted to Gelato using the Gelato SDK and executed on-chain by a relayer. The mint function uses the signature provided to permit itself to spend USDC; One USDC will be used to pay for the NFT itself and some is used to compensate the relayer.

# Contract Quick Start

1. From the project root, navigate to the contracts folder
```
cd contracts
```

2. Install project dependencies
```
npm install
```

3. Edit `hardhat.config.ts`

4. Compile the contract
```
npx hardhat compile
```

5. Deploy the contract
```
npx hardhat run scripts/deploy.ts --network polygon
```

6. Verify contract on polygonscan
```
npx hardhat run scripts/verify.ts --network polygon
```

# Frontend Quick Start

1. From the project root, navigate to the frontend folder
```
cd frontend
```

2. Install project dependencies
```
npm install
```

3. Edit `src/config.ts`

4. Run the frontend
```
npm start
```

# Contract Overview
```solidity
contract GaslessNFT is ERC721, GelatoRelayContext {
    uint256 public price;
    uint256 public supply;
    ERC20Permit public token;

    constructor(ERC20Permit _token, uint256 _price)
        ERC721("Gasless NFT", "GNFT")
    {
        price = _price;
        token = _token;
    }

    function mint(address to, uint256 amount, uint256 deadline, uint8 v,
        bytes32 r, bytes32 s) external onlyGelatoRelay
    {
        require(address(token) == _getFeeToken(),
            "GaslessNFT.mint: incorrect fee token");

        token.permit(to, address(this), amount, deadline, v, r, s);
        token.transferFrom(to, address(this), price);

        uint256 fee = _getFee();
        uint256 maxFee = amount - price;

        require(fee <= maxFee,
            "GaslessNFT.mint: insufficient fee");

        token.transferFrom(to, _getFeeCollector(), fee);

        _mint(to, supply++);
    }
}
```

# Frontend Overview
```ts
const purchase = async () => {
   const wallet = new ethers.BrowserProvider(window.ethereum);
   const signer = await wallet.getSigner();

   const amount = price + fee;
   const deadline = ethers.MaxUint256;

   const { chainId } = await provider.getNetwork();

   const sig = await sign(signer, token, amount, nft, deadline, chainId);
   const { v, r, s } = sig;

   const { data } = await nft.mint.populateTransaction(
      signer.address, amount, deadline, v, r, s);

   const request: CallWithSyncFeeRequest = {
      chainId: chainId.toString(),
      target: nft.target.toString(),
      feeToken: token.target.toString(),
      isRelayContext: true,
      data: data
   };

   const { taskId } = await relay.callWithSyncFee(request);
};
```
