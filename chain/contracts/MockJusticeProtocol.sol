// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MockJusticeProtocol is AccessControl {
    bytes32 public constant ENFORCER_ROLE = keccak256("ENFORCER_ROLE");
    
    mapping(address => bool) public frozenAddresses;
    mapping(address => mapping(uint256 => bool)) public frozenTokens;
    
    event AddressFrozen(address indexed account, string reason);
    event AddressUnfrozen(address indexed account);
    event TokenFrozen(address indexed tokenContract, uint256 indexed tokenId, string reason);
    event TokenUnfrozen(address indexed tokenContract, uint256 indexed tokenId);
    event AssetSeized(address indexed from, address indexed to, address tokenContract, uint256 amount);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ENFORCER_ROLE, admin);
    }

    function freezeAddress(address account, string memory reason) 
        public 
        onlyRole(ENFORCER_ROLE) 
    {
        require(!frozenAddresses[account], "JusticeProtocol: Already frozen");
        frozenAddresses[account] = true;
        emit AddressFrozen(account, reason);
    }

    function unfreezeAddress(address account) 
        public 
        onlyRole(ENFORCER_ROLE) 
    {
        require(frozenAddresses[account], "JusticeProtocol: Not frozen");
        frozenAddresses[account] = false;
        emit AddressUnfrozen(account);
    }

    function freezeToken(address tokenContract, uint256 tokenId, string memory reason) 
        public 
        onlyRole(ENFORCER_ROLE) 
    {
        frozenTokens[tokenContract][tokenId] = true;
        emit TokenFrozen(tokenContract, tokenId, reason);
    }

    function unfreezeToken(address tokenContract, uint256 tokenId) 
        public 
        onlyRole(ENFORCER_ROLE) 
    {
        frozenTokens[tokenContract][tokenId] = false;
        emit TokenUnfrozen(tokenContract, tokenId);
    }

    function seizeERC20(
        address tokenContract,
        address from,
        address to,
        uint256 amount
    ) public onlyRole(ENFORCER_ROLE) {
        require(frozenAddresses[from], "JusticeProtocol: Address not frozen");
        IERC20(tokenContract).transferFrom(from, to, amount);
        emit AssetSeized(from, to, tokenContract, amount);
    }

    function seizeERC721(
        address tokenContract,
        address from,
        address to,
        uint256 tokenId
    ) public onlyRole(ENFORCER_ROLE) {
        require(
            frozenAddresses[from] || frozenTokens[tokenContract][tokenId],
            "JusticeProtocol: Neither address nor token frozen"
        );
        IERC721(tokenContract).transferFrom(from, to, tokenId);
        emit AssetSeized(from, to, tokenContract, tokenId);
    }

    function isFrozen(address account) public view returns (bool) {
        return frozenAddresses[account];
    }

    function isTokenFrozen(address tokenContract, uint256 tokenId) 
        public 
        view 
        returns (bool) 
    {
        return frozenTokens[tokenContract][tokenId];
    }
}
