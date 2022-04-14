// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ReflexToken is ERC20 {
    constructor() ERC20("Zam Token", "ZAM") {
        _mint(msg.sender, 10**23);
    }
}