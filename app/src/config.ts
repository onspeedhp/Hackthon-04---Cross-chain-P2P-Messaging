export const WORMHOLE_ETH_SM_ADDRESS =
  "0x1A847f1bf58Ac84cF75B9c62135C7c0360D2AF95";

  export const WORMHOLE_ETH_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_wormhole",
                "type": "address"
            },
            {
                "internalType": "uint16",
                "name": "_emitterChainId",
                "type": "uint16"
            },
            {
                "internalType": "bytes32",
                "name": "_emitterAddress",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "_content",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "b",
                "type": "bytes"
            }
        ],
        "name": "bytesToUint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "consumedMessages",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "encodedMessage",
                "type": "bytes"
            }
        ],
        "name": "decodeMessage",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "payloadID",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "typeHandle",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct Messages.UpdateMessage",
                "name": "parsedMessage",
                "type": "tuple"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emitterAddress",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emitterChainId",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "payloadID",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "typeHandle",
                        "type": "uint8"
                    },
                    {
                        "internalType": "bytes",
                        "name": "message",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct Messages.UpdateMessage",
                "name": "parsedMessage",
                "type": "tuple"
            }
        ],
        "name": "encodeMessage",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "encodedMessage",
                "type": "bytes"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_message",
                "type": "bytes"
            }
        ],
        "name": "handleMessageCustom",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_message",
                "type": "bytes"
            }
        ],
        "name": "handleMessageTransfer",
        "outputs": [],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isSuccessSendCustomMessage",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isSuccessTransferToken",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "message",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payload",
        "outputs": [
            {
                "internalType": "bytes",
                "name": "",
                "type": "bytes"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes",
                "name": "_vaa",
                "type": "bytes"
            }
        ],
        "name": "receiveMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "bytes",
                "name": "content",
                "type": "bytes"
            }
        ],
        "name": "sendData",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "tokenAddress",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferToken",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "typeMessage",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "wormhole",
        "outputs": [
            {
                "internalType": "contract IWormhole",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]