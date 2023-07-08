// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IWormhole} from "https://github.com/wormhole-foundation/wormhole-scaffolding/blob/main/evm/src/interfaces/IWormhole.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Messages.sol";
import "./BytesLib.sol";

interface Executable {
    function handleContent(bytes memory) external;
}

contract WormholeReceiver is Messages {
    using BytesLib for bytes;

    /// Address of the Wormhole core contract on this chain
    IWormhole public immutable wormhole;
    /// Wormhole chain id of the emitter to accept
    uint16 public immutable emitterChainId;
    /// Wormhole formatted address of the emitter to accept
    bytes32 public immutable emitterAddress;
    /// Stores the last message received
    bytes public message;
    /// Verified message hash to boolean
    mapping(bytes32 => bool) public consumedMessages;

    uint8 public typeMessage;

    bytes public payload;

    bool public isSuccessTransferToken;

    bool public isSuccessSendCustomMessage;

    bytes public _content;

    // MessageType public data;
    /// @param _wormhole The address of the Wormhole core contract
    /// @param _emitterChainId The emitter chain id to accept messages from
    /// @param _emitterAddress The emitter address to accept message from
    constructor(
        address _wormhole,
        uint16 _emitterChainId,
        bytes32 _emitterAddress
    ) {
        wormhole = IWormhole(_wormhole);
        emitterChainId = _emitterChainId;
        emitterAddress = _emitterAddress;
    }

    /// Used to receive a message
    /// @param _vaa The encoded wormhole message (VAA) to receive
    function receiveMessage(bytes memory _vaa) public {
        // call the Wormhole core contract to parse and verify the encodedMessage
        (
            IWormhole.VM memory wormholeMessage,
            bool valid,
            string memory reason
        ) = wormhole.parseAndVerifyVM(_vaa);

        // confirm that the Wormhole core contract verified the message
        require(valid, reason);

        // verify that this message was emitted by a registered emitter
        require(
            wormholeMessage.emitterChainId == emitterChainId,
            "invalid emitter chain"
        );
        require(
            wormholeMessage.emitterAddress == emitterAddress,
            "invalid emitter address"
        );

        // decode the message payload into the UpdateMessage struct
        UpdateMessage memory parsedMessage = decodeMessage(
            wormholeMessage.payload
        );

        // payload = wormholeMessage.payload;
        typeMessage = parsedMessage.typeHandle;

        /**
         * Check to see if this message has been consumed already. If not,
         * save the parsed message in the receivedMessages mapping.
         *
         * This check can protect against replay attacks in xDapps where messages are
         * only meant to be consumed once.
         */
        require(
            !consumedMessages[wormholeMessage.hash],
            "message already consumed"
        );

        message = parsedMessage.message;
        consumedMessages[wormholeMessage.hash] = true;

        if (typeMessage == 2) {
            // type = 2 => is message transfer
            isSuccessTransferToken = handleMessageTransfer(message);
        } else if (typeMessage == 127) {
            _content = handleMessageCustom(message);
        }
    }

    function handleMessageCustom(
        bytes memory _message
    ) public payable returns (bytes memory) {
        address to;
        bytes memory content;
        bool isSuccess;

        uint256 index = 0;

        index += 7;
        bytes memory toBytes = _message.slice(index, 42);
        to = stringToAddress(string(toBytes));
        index += 42;

        index += 2;
        content = _message.slice(index, _message.length - 1 - index);

        isSuccess = sendData(to, content);
        return content;
    }

    function sendData(
        address _to,
        bytes memory _content
    ) public returns (bool) {
        Executable(_to).handleContent(_content);
        return true;
    }

    function handleMessageTransfer(
        bytes memory _message
    ) public returns (bool) {
        address from;
        address to;
        address tokenAddress;
        uint amount;
        bool isSuccess;

        uint256 index = 0;

        index += 9;
        bytes memory fromBytes = _message.slice(index, 42);
        from = stringToAddress(string(fromBytes));
        index += 42;

        index += 8;
        bytes memory toBytes = _message.slice(index, 42);
        to = stringToAddress(string(toBytes));
        index += 42;

        index += 17;
        bytes memory tokenAddressBytes = _message.slice(index, 42);
        tokenAddress = stringToAddress(string(tokenAddressBytes));
        index += 42;

        index += 11;
        bytes memory amountBytes = _message.slice(
            index,
            _message.length - 1 - index
        );
        amount = bytesToUint(amountBytes);

        isSuccess = transferToken(from, to, tokenAddress, amount);

        return isSuccess;
    }

    function transferToken(
        address from,
        address to,
        address tokenAddress,
        uint amount
    ) public returns (bool) {
        IERC20 _erc20;

        _erc20 = IERC20(tokenAddress);

        _erc20.transferFrom(from, to, amount);

        return true;
    }

    function bytesToUint(bytes memory b) public pure returns (uint) {
        uint number = 0;
        for (uint i = 0; i < b.length; i++) {
            number = number * 10 + (uint(uint8(b[i])) - 48); // Subtract 48 because ASCII of '0' is 48
        }
        return number;
    }

    function stringToAddress(
        string memory _address
    ) private pure returns (address) {
        bytes memory temp = bytes(_address);
        require(temp.length == 42, "Invalid address string length");

        uint160 result = 0;
        for (uint256 i = 2; i < temp.length; i++) {
            uint8 digit;
            if (uint8(temp[i]) >= 48 && uint8(temp[i]) <= 57) {
                digit = uint8(temp[i]) - 48;
            } else if (uint8(temp[i]) >= 65 && uint8(temp[i]) <= 70) {
                digit = uint8(temp[i]) - 55;
            } else if (uint8(temp[i]) >= 97 && uint8(temp[i]) <= 102) {
                digit = uint8(temp[i]) - 87;
            } else {
                revert("Invalid character in address string");
            }
            result = result * 16 + uint160(digit);
        }
        return address(result);
    }
}