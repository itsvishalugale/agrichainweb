// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// This is our Smart Contract
// Think of it like a class in JavaScript
contract AgriChain {

    // Owner of contract = us (deployer)
    address public owner;

    // -----------------------------------------------
    // Events — like console.log on blockchain
    // Frontend can listen to these
    // -----------------------------------------------
    event BatchCreated(
        string batchId,
        string cropName,
        string farmerName,
        uint256 timestamp
    );

    event BatchUpdated(
        string batchId,
        string stage,
        string updatedBy,
        uint256 timestamp
    );

    // -----------------------------------------------
    // Struct = like an object in JavaScript
    // Defines what a BatchRecord looks like
    // -----------------------------------------------
    struct BatchRecord {
        string  batchId;
        string  stage;
        string  updatedBy;
        string  action;
        uint256 timestamp;
        bool    exists;
    }

    // -----------------------------------------------
    // Mapping = like a dictionary / object in JS
    // batchId string → array of BatchRecords
    // stores full history of every batch ✅
    // -----------------------------------------------
    mapping(string => BatchRecord[]) public batchHistory;

    // -----------------------------------------------
    // Constructor runs ONCE when contract deploys
    // Sets owner to whoever deployed it
    // -----------------------------------------------
    constructor() {
        owner = msg.sender;
        // msg.sender = wallet address of deployer
    }

    // -----------------------------------------------
    // Add batch record to blockchain
    // Called every time any stage is updated
    // -----------------------------------------------
    function addBatchRecord(
        string memory batchId,
        string memory stage,
        string memory updatedBy,
        string memory action
    ) public {
        // Create new record
        BatchRecord memory record = BatchRecord({
            batchId:   batchId,
            stage:     stage,
            updatedBy: updatedBy,
            action:    action,
            timestamp: block.timestamp,
            // block.timestamp = current time in unix seconds
            exists:    true
        });

        // Push to history array for this batchId
        batchHistory[batchId].push(record);

        // Emit event so frontend can listen
        if (keccak256(bytes(stage)) == keccak256(bytes("farmer"))) {
            emit BatchCreated(batchId, action, updatedBy, block.timestamp);
        } else {
            emit BatchUpdated(batchId, stage, updatedBy, block.timestamp);
        }
    }

    // -----------------------------------------------
    // Get full history of a batch
    // Anyone can call this — it's a view function
    // view = only reads, doesn't write = FREE ✅
    // -----------------------------------------------
    function getBatchHistory(string memory batchId)
        public
        view
        returns (BatchRecord[] memory)
    {
        return batchHistory[batchId];
    }

    // -----------------------------------------------
    // Get count of records for a batch
    // -----------------------------------------------
    function getBatchRecordCount(string memory batchId)
        public
        view
        returns (uint256)
    {
        return batchHistory[batchId].length;
    }
}