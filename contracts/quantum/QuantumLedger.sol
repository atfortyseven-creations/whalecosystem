// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

/**
 * @title QuantumLedger
 * @dev Immutable on-chain receipt registry for QuantumDots (QDs) transfers.
 * Creates cryptographically secure records of peer-to-peer transfers,
 * turning the Portfolio into an unhackable truth layer.
 */
contract QuantumLedger is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable quantumDots;

    uint256 private _receiptCounter;

    struct Receipt {
        uint256 id;
        address sender;
        address receiver;
        uint256 amount;
        uint256 timestamp;
        string memo;
        bytes32 transactionHashMarker; // Internal hash representation
    }

    mapping(uint256 => Receipt) public receipts;
    mapping(address => uint256[]) public userReceipts;

    event QuantumTransferExecuted(
        uint256 indexed receiptId,
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        string memo,
        uint256 timestamp
    );

    constructor(address _quantumDotsAddress) {
        require(_quantumDotsAddress != address(0), "QuantumLedger: Zero address provided");
        quantumDots = IERC20(_quantumDotsAddress);
    }

    /**
     * @dev Executes a transfer of QDs and generates an immutable on-chain receipt.
     * Requires the sender to have approved the Ledger contract beforehand.
     */
    function transferWithReceipt(address to, uint256 amount, string calldata memo) external nonReentrant returns (uint256) {
        return _executeTransfer(to, amount, memo);
    }

    /**
     * @dev Executes a transfer with a signed ERC20Permit, allowing a gasless 1-step process
     * without needing a separate 'approve' transaction.
     */
    function transferWithReceiptPermit(
        address to, 
        uint256 amount, 
        string calldata memo,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external nonReentrant returns (uint256) {
        // Execute the gasless permit, wrapped in try/catch to prevent MEV Griefing Attacks
        // where a bot front-runs the permit signature in the mempool to intentionally revert this transaction.
        try IERC20Permit(address(quantumDots)).permit(msg.sender, address(this), amount, deadline, v, r, s) {} catch {}
        
        return _executeTransfer(to, amount, memo);
    }

    function _executeTransfer(address to, uint256 amount, string calldata memo) internal returns (uint256) {
        require(to != address(0), "QuantumLedger: Transfer to zero address");
        require(amount > 0, "QuantumLedger: Amount must be greater than 0");

        // Execute transfer using SafeERC20
        quantumDots.safeTransferFrom(msg.sender, to, amount);

        // Generate receipt ID
        _receiptCounter++;
        uint256 currentReceiptId = _receiptCounter;

        // Create a unique hash marker for the specific transfer state
        bytes32 hashMarker = keccak256(abi.encodePacked(currentReceiptId, msg.sender, to, amount, block.timestamp, memo));

        Receipt memory newReceipt = Receipt({
            id: currentReceiptId,
            sender: msg.sender,
            receiver: to,
            amount: amount,
            timestamp: block.timestamp,
            memo: memo,
            transactionHashMarker: hashMarker
        });

        // Store the receipt immutably
        receipts[currentReceiptId] = newReceipt;
        
        // Link to user histories
        userReceipts[msg.sender].push(currentReceiptId);
        userReceipts[to].push(currentReceiptId);

        emit QuantumTransferExecuted(currentReceiptId, msg.sender, to, amount, memo, block.timestamp);

        return currentReceiptId;
    }

    /**
     * @dev Retrieve the total number of receipts for a given user.
     */
    function getUserReceiptCount(address user) external view returns (uint256) {
        return userReceipts[user].length;
    }

    /**
     * @dev Retrieve a paginated array of a user's receipts.
     */
    function getUserReceipts(address user, uint256 offset, uint256 limit) external view returns (Receipt[] memory) {
        uint256 total = userReceipts[user].length;
        if (offset >= total) {
            return new Receipt[](0);
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 size = end - offset;
        Receipt[] memory result = new Receipt[](size);

        for (uint256 i = 0; i < size; i++) {
            result[i] = receipts[userReceipts[user][total - 1 - (offset + i)]]; // Reverse order to get newest first
        }

        return result;
    }
}
