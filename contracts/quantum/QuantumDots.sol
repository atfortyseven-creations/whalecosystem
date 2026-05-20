// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 * @title QuantumDots (QDs)
 * @dev Implementation of the QuantumDots token.
 * Contains a mathematically unbreakable hard cap of 21,000,000 QDs, mimicking Bitcoin.
 * Integrates Permit for gasless signatures and Votes for governance/staking power.
 */
contract QuantumDots is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ERC20Permit, ERC20Votes {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 public constant MAX_SUPPLY = 21_000_000 * 10 ** 18;

    constructor(address defaultAdmin)
        ERC20("QuantumDots", "QDs")
        ERC20Permit("QuantumDots")
    {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(PAUSER_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        
        // Genesis Mint: Allocate 2,005,000 QDs to the designated sovereign owner wallet
        address sovereignOwner = 0x78831C25c86eA2a78A6127fC2Ccb95E612D87b4a;
        uint256 genesisAmount = 2_005_000 * 10 ** 18;
        _mint(sovereignOwner, genesisAmount);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        require(totalSupply() + amount <= MAX_SUPPLY, "QuantumDots: Hard cap of 21M reached. Aborting mint.");
        _mint(to, amount);
    }

    // The following functions are overrides required by Solidity.

    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable, ERC20Votes)
    {
        super._update(from, to, value);
    }

    function nonces(address owner)
        public
        view
        override(ERC20Permit, Nonces)
        returns (uint256)
    {
        return super.nonces(owner);
    }
}
