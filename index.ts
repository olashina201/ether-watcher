import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

class TransactionChecker {
  web3: any;
  account: string;

  constructor(projectId: string, account: string) {
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://eth-rinkeby.alchemyapi.io/v2/${projectId}`
      )
    );
    this.account = account.toLowerCase();
  }

  async checkBlock() {
    let block = await this.web3.eth.getBlock("latest");
    let number = block.number;
    console.log("Searching block " + number);

    if (block != null && block.transactions != null) {
      for (let txHash of block.transactions) {
        let tx = await this.web3.eth.getTransaction(txHash);
        if (this.account == tx?.to?.toLowerCase()) {
          console.log("Transaction found on block: " + number);
          console.log({
            address: tx.from,
            value: this.web3.utils.fromWei(tx.value, "ether"),
            timestamp: new Date(),
          });
        }
      }
    }
  }
}

let txChecker = new TransactionChecker(
  process.env.ALCHEMY_API_KEY as string,
  "0x0095B57245BeA88d2079D77a7acFD319248e95dE"
);
setInterval(() => {
  txChecker.checkBlock();
}, 15 * 1000);
