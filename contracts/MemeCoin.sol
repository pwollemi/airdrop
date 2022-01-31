// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./ERC20.sol";

contract MemeCoin is ERC20, Ownable {

    address taxWallet;
    address charityWallet;
    mapping (address => bool) public isExcludedFromTax;
    uint256 public taxPercent = 0;
    uint256 public charityPercent = 0;

    constructor(string memory _name, string memory _symbol, uint256 _amount, address _taxWallet, address _charityWallet) ERC20(_name, _symbol) {
        _mint(msg.sender, _amount);
        taxWallet = _taxWallet;
        charityWallet = _charityWallet;
    }

    function setTaxWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Tax wallet cannot be the zero address");
        taxWallet = _wallet;
    }
    function setCharityWallet(address _wallet) external onlyOwner {
        require(_wallet != address(0), "Charity wallet cannot be the zero address");
        charityWallet = _wallet;
    }
    function setTaxPercent(uint256 _value) external onlyOwner {
        require (_value >= 0);
        require (_value + charityPercent <= 100);
        taxPercent = _value;
    }

    function excludeAddressFromTax(address _address) external onlyOwner {
        isExcludedFromTax[_address] = true;
    }
    function includeAddressForTax(address _address) external onlyOwner {
        isExcludedFromTax[_address] = false;
    }
    function setCharityPercent(uint256 _value) external onlyOwner {
        require (_value >= 0);
        require (taxPercent + _value <= 100);
        charityPercent = _value;
    }

    modifier _setTaxPercent(address _sender,address _recipient) {
        uint256 actual_tax = taxPercent;
        uint256 actual_charity = charityPercent;
        if (isExcludedFromTax[_sender] || isExcludedFromTax[_recipient]) {
            taxPercent = 0;
            charityPercent = 0;
        }
        _;
        taxPercent = actual_tax;
        charityPercent = actual_charity;
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override _setTaxPercent(sender, recipient) {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _beforeTokenTransfer(sender, recipient, amount);
        uint256 senderBalance = _balances[sender];
        require(senderBalance >= amount, "ERC20: transfer amount exceeds balance");

        uint256 taxAmount = amount*taxPercent/1000;
        uint256 charityAmount = amount*charityPercent/1000;
        uint256 sendAmount = amount-taxAmount-charityAmount;
        unchecked {
            _balances[sender] = senderBalance - amount;
        }
        require(taxAmount >= 0 && charityAmount >= 0 && amount > taxAmount+charityAmount, "Invalid amounts for transfer");
        if (charityAmount > 0) {
            _balances[charityWallet] += charityAmount;
        }
        if (taxAmount > 0) {
            _balances[taxWallet] += taxAmount;
        } 
        _balances[recipient] += sendAmount;
        
        emit Transfer(sender, recipient, amount);

        _afterTokenTransfer(sender, recipient, amount);
    }
}