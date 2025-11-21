// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuraRegistry is Ownable {
    mapping(bytes32 => bool) public isStolen;
    mapping(bytes32 => uint256) public reportedAt;
    mapping(bytes32 => string) public stolenReason;
    
    address public justiceProtocol;
    
    event ItemMarkedStolen(bytes32 indexed serialHash, string reason, uint256 timestamp);
    event ItemCleared(bytes32 indexed serialHash, uint256 timestamp);
    event JusticeProtocolUpdated(address indexed oldAddress, address indexed newAddress);

    constructor(address initialOwner, address _justiceProtocol) Ownable(initialOwner) {
        justiceProtocol = _justiceProtocol;
    }

    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || msg.sender == justiceProtocol,
            "AuraRegistry: Caller is not authorized"
        );
        _;
    }

    function setStolen(bytes32 serialHash, bool status, string memory reason) public onlyAuthorized {
        isStolen[serialHash] = status;
        
        if (status) {
            reportedAt[serialHash] = block.timestamp;
            stolenReason[serialHash] = reason;
            emit ItemMarkedStolen(serialHash, reason, block.timestamp);
        } else {
            emit ItemCleared(serialHash, block.timestamp);
        }
    }

    function checkItemStatus(bytes32 serialHash) public view returns (bool stolen, uint256 reportTime, string memory reason) {
        return (isStolen[serialHash], reportedAt[serialHash], stolenReason[serialHash]);
    }

    function updateJusticeProtocol(address newJusticeProtocol) public onlyOwner {
        require(newJusticeProtocol != address(0), "AuraRegistry: Invalid address");
        address oldAddress = justiceProtocol;
        justiceProtocol = newJusticeProtocol;
        emit JusticeProtocolUpdated(oldAddress, newJusticeProtocol);
    }

    function bulkMarkStolen(bytes32[] memory serialHashes, string memory reason) public onlyAuthorized {
        for (uint256 i = 0; i < serialHashes.length; i++) {
            setStolen(serialHashes[i], true, reason);
        }
    }
}
