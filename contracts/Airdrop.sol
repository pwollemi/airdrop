// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";

contract Airdrop is Initializable, OwnableUpgradeable {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    /// @notice The merkle root of the the merkle tree
    bytes32 public root;

    /// @notice Flag for claimed users
    mapping(address => bool) public claimed;

    /// @notice Token to claim
    address public token;

    function initialize(address _token) external initializer {
        __Ownable_init();

        token = _token;
    }

    function setToken(address _token) external onlyOwner {
        token = _token;
    }

    /**
     * @notice Set the merkle root
     * @param _root bytes32
     */
    function setMerkleRoot(bytes32 _root) external onlyOwner {
        root = _root;
    }

    /**
     * @notice Claims the user's funds
     * @param amount      The amount of the user to claim
     * @param merkleProof   The merkle proof
     */
    function claim(uint256 amount, bytes32[] memory merkleProof) external {
        bytes32 node = keccak256(abi.encode(_msgSender(), amount));
        require(MerkleProofUpgradeable.verify(merkleProof, root, node));
        require(claimed[_msgSender()] == false);
        claimed[_msgSender()] = true;

        IERC20Upgradeable(token).safeTransfer(_msgSender(), amount);
    }
}