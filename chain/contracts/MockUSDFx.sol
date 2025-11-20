// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDFx is ERC20, Ownable {
    uint8 private _decimals = 6;
    
    event Minted(address indexed to, uint256 amount);
    event Burned(address indexed from, uint256 amount);

    constructor(address initialOwner) 
        ERC20("FlowX USD", "USDFx") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, 1000000 * 10 ** decimals());
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
        emit Burned(msg.sender, amount);
    }

    function faucet(uint256 amount) public {
        require(amount <= 10000 * 10 ** decimals(), "MockUSDFx: Faucet limit exceeded");
        _mint(msg.sender, amount);
        emit Minted(msg.sender, amount);
    }
}
