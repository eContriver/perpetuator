//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";

contract Token is ERC20Capped, ERC20Pausable {

    constructor(string memory name_, string memory symbol_) 
    ERC20Capped(2000000000000000000000000)
    ERC20(name_, symbol_) {
        // console.log("name: %s", name());
    }

    //pausable
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20Pausable, ERC20) {
        super._beforeTokenTransfer(from, to, amount);
        require(!paused(), "token transfer while paused");
    }

    function mint(address account, uint256 amount) external {
        super._mint(account, amount);
    }

    function _mint(address account, uint256 amount) internal virtual override(ERC20Capped, ERC20) {
        require(ERC20.totalSupply() + amount <= cap(), "ERC20Capped: cap exceeded");
        super._mint(account, amount);
    }
}
