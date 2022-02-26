//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Perpetuator is Ownable {
    using SafeERC20 for IERC20;

    struct Post {
        string message;
        address poster;
    }

    Post[] public posts;
    uint price = 0.01 ether;

    constructor() {
    }

    function post(string memory _message) payable public {
        require(msg.value >= price, "PERP: insufficient amount");
        posts.push(Post(_message, msg.sender));
        address payable owner = payable(owner());
        owner.transfer(address(this).balance);
    }
    
    function changePrice(uint _price) external onlyOwner {
        price = _price;
    }

    function withdraw() external onlyOwner {
        address payable owner = payable(owner());
        owner.transfer(address(this).balance);
    }

    // receive eth with no calldata
    // see: https://blog.soliditylang.org/2020/03/26/fallback-receive-split/
    receive() external payable {}

    // receive eth with no function match
    fallback() external payable {}

    function withdrawToken(address _token, uint _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }
}
