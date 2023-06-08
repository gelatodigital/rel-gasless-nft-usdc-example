// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { GelatoRelayContext } from "@gelatonetwork/relay-context/contracts/GelatoRelayContext.sol";

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
