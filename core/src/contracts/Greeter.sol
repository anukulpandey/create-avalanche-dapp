//SPDX-License-Identifier:Unlicensed
pragma solidity ^0.8.17;

contract Greeter{
    string public message;

    constructor(){
        message = "Hello from AVAX";
    }

    function setMessage(string memory _message) public {
        message = _message;
    }

    function getMessage() public view returns(string memory){
        return message;
    }
}