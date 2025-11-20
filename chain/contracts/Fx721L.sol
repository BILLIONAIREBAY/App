// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fx721L is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    mapping(uint256 => bytes32) public serialNumberHashes;
    mapping(uint256 => bool) public isStolenFlag;
    
    event LivingAssetMinted(uint256 indexed tokenId, address indexed owner, bytes32 serialHash);
    event AssetFlaggedStolen(uint256 indexed tokenId, bool isStolen);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    constructor(address initialOwner)
        ERC721("BillionaireBay Living Asset", "FX721L")
        Ownable(initialOwner)
    {}

    function mintLivingAsset(
        address to,
        string memory uri,
        bytes32 serialHash
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        serialNumberHashes[tokenId] = serialHash;
        
        emit LivingAssetMinted(tokenId, to, serialHash);
        return tokenId;
    }

    function updateMetadata(uint256 tokenId, string memory newURI) public onlyOwner {
        _setTokenURI(tokenId, newURI);
        emit MetadataUpdated(tokenId, newURI);
    }

    function flagStolen(uint256 tokenId, bool stolen) public onlyOwner {
        isStolenFlag[tokenId] = stolen;
        emit AssetFlaggedStolen(tokenId, stolen);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
