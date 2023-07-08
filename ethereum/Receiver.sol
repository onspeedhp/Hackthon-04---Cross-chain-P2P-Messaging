// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./BytesLib.sol";

contract Receiver {
    using BytesLib for bytes;

    uint public v1;
    uint public v2;
    bytes public v1Bytes;
    bytes public v2Bytes;

    function handleContent(bytes memory _content) external {
        uint index = 0;

        index += 5;
        v1Bytes = _content.slice(index, 1);
        v1 = bytesToUint(v1Bytes);
        index += 1;

        index += 6;
        v2Bytes = _content.slice(index, 1);
        v2 = bytesToUint(v2Bytes);
    }

    function bytesToUint(bytes memory b) public pure returns (uint) {
        uint number = 0;
        for (uint i = 0; i < b.length; i++) {
            number = number * 10 + (uint(uint8(b[i])) - 0x30);
        }
        return number;
    }
}