import { ethers } from "ethers"
import dotenv from "dotenv"
dotenv.config()

// -----------------------------------------------
// ABI — paste your copied ABI here
// This tells ethers.js how to talk to contract
// -----------------------------------------------
const ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "stage",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "updatedBy",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "action",
				"type": "string"
			}
		],
		"name": "addBatchRecord",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "cropName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "farmerName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BatchCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "stage",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "updatedBy",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "BatchUpdated",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "batchHistory",
		"outputs": [
			{
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "stage",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "updatedBy",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "action",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			}
		],
		"name": "getBatchHistory",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "batchId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "stage",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "updatedBy",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "action",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "timestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "exists",
						"type": "bool"
					}
				],
				"internalType": "struct AgriChain.BatchRecord[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "batchId",
				"type": "string"
			}
		],
		"name": "getBatchRecordCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

// -----------------------------------------------
// Setup provider and wallet
// -----------------------------------------------
let contract = null

const getContract = () => {
  if (contract) return contract
  // reuse existing contract if already created

  // Provider = connection to Sepolia network
  // We use Sepolia RPC URL from .env
  const provider = new ethers.JsonRpcProvider(
    process.env.SEPOLIA_RPC_URL
  )

  // Wallet = our account that pays gas fees
  // Uses private key from .env
  const wallet = new ethers.Wallet(
    process.env.WALLET_PRIVATE_KEY,
    provider
  )

  // Contract = the deployed contract we interact with
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    wallet
  )

  return contract
}

// -----------------------------------------------
// Main function — called every time stage updates
// -----------------------------------------------
export const recordOnBlockchain = async (
  batchId,
  stage,
  updatedBy,
  action
) => {
  try {
    const contract = getContract()

    // Call smart contract function
    // This writes to blockchain
    const tx = await contract.addBatchRecord(
      batchId,
      stage,
      updatedBy,
      action
    )
    // tx = transaction object

    // Wait for transaction to be confirmed
    // waitForDeployment = wait for 1 block confirmation
    const receipt = await tx.wait(1)
    // receipt = confirmation that transaction was included in block

    console.log(`✅ Blockchain record added: ${receipt.hash}`)

    return receipt.hash
    // This is the transaction hash we save in MongoDB ✅

  } catch (error) {
    console.error(`❌ Blockchain error: ${error.message}`)
    // We don't throw error here
    // If blockchain fails, app still works
    // Just return empty string
    return ""
  }
}

// -----------------------------------------------
// Read batch history from blockchain
// This is FREE — view functions cost no gas ✅
// -----------------------------------------------
export const getBatchFromBlockchain = async (batchId) => {
  try {
    const contract = getContract()
    const history  = await contract.getBatchHistory(batchId)
    return history
  } catch (error) {
    console.error(`❌ Blockchain read error: ${error.message}`)
    return []
  }
}