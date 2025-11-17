import crypto from 'crypto';

/**
 * Simple Blockchain Implementation for Transaction Integrity
 */

class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(0, Date.now(), 'Genesis Block', '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data) {
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      data,
      this.getLatestBlock().hash
    );
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChain() {
    return this.chain;
  }

  getBlock(index) {
    return this.chain[index];
  }
}

// Create singleton blockchain instance
const transactionBlockchain = new Blockchain();

/**
 * Add transaction to blockchain
 * @param {object} transactionData - Transaction data
 * @returns {object} Block information
 */
export const addTransactionToBlockchain = (transactionData) => {
  const block = transactionBlockchain.addBlock({
    transactionId: transactionData._id,
    userId: transactionData.userId,
    merchantId: transactionData.merchantId,
    amount: transactionData.amount,
    timestamp: transactionData.timestamp,
    status: transactionData.status,
  });

  return {
    blockIndex: block.index,
    blockHash: block.hash,
    previousHash: block.previousHash,
    timestamp: block.timestamp,
  };
};

/**
 * Verify blockchain integrity
 * @returns {boolean} Is blockchain valid
 */
export const verifyBlockchainIntegrity = () => {
  return transactionBlockchain.isChainValid();
};

/**
 * Get blockchain statistics
 * @returns {object} Blockchain stats
 */
export const getBlockchainStats = () => {
  const chain = transactionBlockchain.getChain();
  return {
    totalBlocks: chain.length,
    latestBlock: transactionBlockchain.getLatestBlock(),
    isValid: transactionBlockchain.isChainValid(),
    difficulty: transactionBlockchain.difficulty,
  };
};

/**
 * Get full blockchain
 * @returns {array} Complete blockchain
 */
export const getFullBlockchain = () => {
  return transactionBlockchain.getChain();
};

export default {
  addTransactionToBlockchain,
  verifyBlockchainIntegrity,
  getBlockchainStats,
  getFullBlockchain,
};






