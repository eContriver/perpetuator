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
        address author;
    }

    Post[] public posts;
    uint public price = 0.01 ether;
    uint public charLimit = 288;

    constructor() {
    }

    /**
     * @notice returns the number of posts
     */
    function getPostCount() external view returns(uint count) {
        count = posts.length;
    }

    /**
     * @notice post a message to the blockchain
     */
    function post(string memory _message) public payable {
        require(msg.value >= price, "PERP: insufficient amount");
        require(bytes(_message).length <= charLimit, "PERP: character limit exceeded");
        posts.push(Post(_message, msg.sender));
        address payable owner = payable(owner());
        owner.transfer(msg.value);
    }
    
    function setLimit(uint _limit) external onlyOwner {
        charLimit = _limit;
    }

    function setPrice(uint _price) external onlyOwner {
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
