import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();

class TransactionChecker {
  web3: any;
  web3ws: any;
  account: string;
  subscription: any;

  constructor(projectId: string | undefined, account: string) {
    this.web3ws = new Web3(
      new Web3.providers.WebsocketProvider(
        `https://eth-rinkeby.alchemyapi.io/v2/${projectId}`
      )
    );
    this.web3 = new Web3(
      new Web3.providers.HttpProvider(
        `https://eth-rinkeby.alchemyapi.io/v2/${projectId}`
      )
    );
    this.account = account.toLowerCase();
  }

  subscribe(topic: string) {
    this.subscription = this.web3ws.eth.subscribe(
      topic,
      function (error: any, result: any) {
        if (!error) console.log(result);
      }
    );
  }

  watchTransactions() {
    console.log("Watching all pending transactions...");
    this.subscription.on("data", (txHash: any) => {
      setTimeout(async () => {
        try {
          let tx = await this.web3.eth.getTransaction(txHash);
          let balance = await this.web3.fromWei(this.web3.eth.getBalance(this.account));
          if (tx != null) {
            if (this.account == tx.to.toLowerCase()) {
              console.log("New Transaction = ", {
                address: tx.from,
                value: this.web3.utils.fromWei(tx.value, "ether"),
                timestamp: new Date(),
              });
              console.log(`Available Balance = ${balance}`);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 5 * 60000);
    });
  }
}

let txChecker = new TransactionChecker(
  process.env.ALCHEMY_API_KEY,
  "0x0095B57245BeA88d2079D77a7acFD319248e95dE"
);
txChecker.subscribe("pendingTransactions");
txChecker.watchTransactions();
