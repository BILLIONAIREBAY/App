// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title FxCharitySplitter
 * @notice Atomic split payment contract for charity auctions
 * @dev Ensures BOTH seller and charity receive funds atomically or entire transaction reverts
 */
contract FxCharitySplitter is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint256 public constant MAX_BPS = 10000; // 100% in basis points
    uint256 public constant MIN_CHARITY_BPS = 100; // 1% minimum
    uint256 public constant MAX_CHARITY_BPS = 5000; // 50% maximum

    event DonationProcessed(
        address indexed charity,
        address indexed seller,
        address indexed buyer,
        address token,
        uint256 charityAmount,
        uint256 sellerAmount,
        uint256 totalAmount
    );

    event CharityVerified(address indexed charity, string name);
    event CharityRevoked(address indexed charity);

    mapping(address => bool) public verifiedCharities;
    mapping(address => string) public charityNames;

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Verify a charity address for split payments
     * @param charity Charity wallet address
     * @param name Charity name for event logging
     */
    function verifyCharity(address charity, string calldata name) external onlyOwner {
        require(charity != address(0), "Invalid charity address");
        require(bytes(name).length > 0, "Charity name required");
        
        verifiedCharities[charity] = true;
        charityNames[charity] = name;
        
        emit CharityVerified(charity, name);
    }

    /**
     * @notice Revoke charity verification
     * @param charity Charity address to revoke
     */
    function revokeCharity(address charity) external onlyOwner {
        require(verifiedCharities[charity], "Charity not verified");
        
        verifiedCharities[charity] = false;
        delete charityNames[charity];
        
        emit CharityRevoked(charity);
    }

    /**
     * @notice Execute atomic split payment between seller and charity
     * @dev CRITICAL: All transfers must succeed or entire transaction reverts
     * @param token ERC20 token address (USDFx)
     * @param seller Seller wallet address
     * @param charity Verified charity wallet address
     * @param amount Total payment amount (buyer must approve this contract first)
     * @param charityShareBps Charity share in basis points (100 = 1%, 1000 = 10%)
     */
    function splitPaymentERC20(
        address token,
        address seller,
        address charity,
        uint256 amount,
        uint256 charityShareBps
    ) external nonReentrant {
        // Validation
        require(token != address(0), "Invalid token address");
        require(seller != address(0), "Invalid seller address");
        require(charity != address(0), "Invalid charity address");
        require(amount > 0, "Amount must be greater than zero");
        require(
            charityShareBps >= MIN_CHARITY_BPS && charityShareBps <= MAX_CHARITY_BPS,
            "Charity share must be between 1% and 50%"
        );
        require(verifiedCharities[charity], "Charity not verified");

        IERC20 tokenContract = IERC20(token);

        // Calculate splits
        uint256 charityAmount = (amount * charityShareBps) / MAX_BPS;
        uint256 sellerAmount = amount - charityAmount;

        require(charityAmount > 0, "Charity amount must be greater than zero");
        require(sellerAmount > 0, "Seller amount must be greater than zero");

        // ATOMIC TRANSFER SEQUENCE
        // Step 1: Transfer total amount from buyer to this contract
        tokenContract.safeTransferFrom(msg.sender, address(this), amount);

        // Step 2: Transfer charity share (if this fails, entire transaction reverts)
        tokenContract.safeTransfer(charity, charityAmount);

        // Step 3: Transfer seller share (if this fails, entire transaction reverts)
        tokenContract.safeTransfer(seller, sellerAmount);

        // Emit success event
        emit DonationProcessed(
            charity,
            seller,
            msg.sender,
            token,
            charityAmount,
            sellerAmount,
            amount
        );
    }

    /**
     * @notice Emergency withdrawal function (owner only)
     * @dev Only for stuck tokens, should never be needed in normal operation
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        IERC20(token).safeTransfer(owner(), amount);
    }
}
