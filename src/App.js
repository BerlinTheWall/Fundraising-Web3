import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import contract from "./contracts/Fundraising.json";
import moment from "moment/moment";
var Web3 = require("web3");
var web3 = new Web3(Web3.givenProvider || "http://localhost:3000");

// copy contract's address here
const contractAddress = "";
const abi = contract.abi;

function App() {
  const { ethereum } = window;
  const [admin, setAdmin] = useState();
  const [contractInfo, setContractInfo] = useState({
    goal: "-",
    balance: "-",
    deadline: "-",
    noOfContribute: "-",
    minContribute: "-",
  });
  const [currentAccount, setCurrentAccount] = useState();
  const [metamaskState, setMetamaskState] = useState({
    text: "",
    color: "",
    disabled: "",
    onClick: "",
  });
  const [goalValue, setGoalValue] = useState();
  const [transactionHash, setTransactionHash] = useState();
  const [hashShow, setHashShow] = useState(false);
  const [hideEditDiv, setHideEditDiv] = useState("hidden");

  useEffect(() => {
    loadContractData();
  }, []);

  // Change metamask state if the account changes
  useEffect(() => {
    if (!ethereum) {
      setMetamaskState({
        text: "Need to install metamask",
        color: "bg-red-700",
        disabled: true,
      });
    } else if (ethereum && !currentAccount) {
      setMetamaskState({
        text: "Connect your wallet to contribute",
        color: "bg-orange-700",
        disabled: false,
        onClick: connectWalletHandler,
      });
    } else if (ethereum && currentAccount) {
      setMetamaskState({
        text: "Contribute",
        color: "bg-purple-700",
        disabled: false,
        onClick: handleTransfer,
      });
    }
  }, [ethereum, currentAccount]);

  // Set account address
  useEffect(() => {
    console.log(ethereum.selectedAddress);
    settingCurrentAccount();
  }, [ethereum, currentAccount]);

  // Check if account is contract owner
  useEffect(() => {
    console.log(currentAccount, admin);
    if (
      currentAccount != undefined &&
      currentAccount?.toLowerCase() === admin?.toLowerCase()
    )
      setHideEditDiv("block");
    else setHideEditDiv("hidden");
  }, [currentAccount, admin]);

  // Function for changing connected wallet
  const settingCurrentAccount = async () => {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      console.log("Found an authorized account", account);
    } else {
      console.log("No authorized account found.");
    }
  };

  // Connect wallet handler
  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Metamask is not installed!");
    }
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      // console.log("found account address: " + accounts[0]);
      setCurrentAccount(accounts[0]);
      setMetamaskState({
        text: "Contribute",
        color: "bg-purple-700",
        disabled: false,
        onClick: handleTransfer,
      });
      // console.log(currentAccount);
      if (
        currentAccount != undefined &&
        currentAccount.toLowerCase() === admin.toLowerCase()
      )
        setHideEditDiv("block");
      else setHideEditDiv("hidden");
    } catch (err) {
      console.log(err);
    }
  };

  // Function for loading data from contract
  const loadContractData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // const signer = provider.getSigner();
    const fundContract = new ethers.Contract(contractAddress, abi, provider);

    const contractAdmin = await fundContract.getAdmin();

    setAdmin(contractAdmin);

    const _balance = await fundContract.getBalance();
    const _goal = await fundContract.getGoal();
    const _deadline = await fundContract.getDeadline();
    const _noOfContribute = await fundContract.getNoOfContribute();
    const _minContribute = await fundContract.getMinContribute();

    var goal = Number(_goal);
    var balance = Number(_balance);
    var deadline = Number(_deadline);
    var noOfContribute = Number(_noOfContribute);
    var minContribute = Number(_minContribute);

    var deadline = moment(deadline * 1000).format("MMMM Do YYYY, h:mm:ss a");
    setContractInfo({
      goal,
      balance,
      deadline,
      noOfContribute,
      minContribute,
    });
  };

  // Change contract goal (only admin)
  const setGoal = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fundContract = new ethers.Contract(contractAddress, abi, signer);
    try {
      var nftTxn = await fundContract.setGoal(goalValue);
      // console.log(nftTxn)
      loadContractData();
    } catch (error) {
      console.log(error);
    }
  };
  // Change contract deadline (only admin)
  const setDeadline = async (value) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fundContract = new ethers.Contract(contractAddress, abi, signer);
    var v;
    if (value === 1) v = 86400;
    if (value === 2) v = 604800;
    if (value === 3) v = 86400 * 30;

    try {
      var nftTxn = await fundContract.setDeadline(v);
      // console.log(nftTxn)
      loadContractData();
    } catch (error) {
      console.log(error);
    }
  };

  // Transfer (Contribute) function
  const handleTransfer = async (e) => {
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = await web3.eth.getBlock("latest");
    // console.log("price", gasPrice);
    // console.log(gasLimit.gasLimit);
    // console.log(ethers.utils.parseEther("0.01"));
    web3.eth.sendTransaction(
      {
        from: currentAccount,
        to: contractAddress,
        value: ethers.utils.parseEther("0.001"),
        gasPrice: gasPrice * 10,
        gasLimit: gasLimit.gasLimit,
        // gas: 21000,
      },
      function (err, transactionHash) {
        if (err) {
          console.log(err);
        } else {
          loadContractData();
          // console.log(transactionHash);
          setTransactionHash(transactionHash);
          setHashShow((current) => !current);
        }
      }
    );
  };

  return (
    <div className="container mx-auto mt-3">
      <h1 className="text-5xl font-semibold">Fund raising</h1>
      <div className="flex mt-5 space-x-5">
        <div>
          <p className="text-xl">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum."
          </p>
        </div>
        <div className="w-full">
          <img src="data:image/png;base64,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"></img>
        </div>
      </div>
      <div
        className={`flex border-2 border-black rounded-2xl p-2 mt-5 ${hideEditDiv}`}
      >
        <div className="space-x-4 space-y-3 text-2xl w-1/2 items-center justify-center">
          <div className="text-3xl font-medium">Set goal</div>
          <input
            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="goal-input"
            type="number"
            placeholder="1000000000000 Wei"
            onChange={(e) => setGoalValue(e.target.value)}
          />
          <span className="font-bold">Wei</span>
          <button
            className="focus:outline-none text-white bg-blue-700 hover:bg-blue-700-800 focus:ring-4 
                    focus:ring-bg-blue-700-300 font-medium rounded-lg text-2xl px-4 py-2"
            onClick={setGoal}
          >
            Set goal
          </button>
        </div>
        <div className="space-x-4 space-y-3 text-2xl w-1/2 items-center justify-center">
          <div className="text-3xl font-medium">Set deadline</div>
          <button
            className="focus:outline-none text-white bg-green-700 hover:bg-green-700-800 focus:ring-4 
                    focus:ring-bg-green-700-300 font-medium rounded-lg text-2xl px-4 py-2"
            onClick={() => setDeadline(1)}
          >
            1 day
          </button>
          <button
            className="focus:outline-none text-white bg-yellow-700 hover:bg-yellow-700-800 focus:ring-4 
                    focus:ring-bg-yellow-700-300 font-medium rounded-lg text-2xl px-4 py-2"
            onClick={() => setDeadline(2)}
          >
            1 week
          </button>
          <button
            className="focus:outline-none text-white bg-red-700 hover:bg-red-700-800 focus:ring-4 
                    focus:ring-bg-red-700-300 font-medium rounded-lg text-2xl px-4 py-2"
            onClick={() => setDeadline(3)}
          >
            1 month
          </button>
        </div>
      </div>
      <div className="space-y-5 mt-8">
        <div className="flex space-x-3">
          <div className="text-3xl font-medium">
            Raised amount :{" "}
            <span className="font-bold">
              {contractInfo.balance * 0.000000000000000001} Ether
            </span>
          </div>
          <div className="text-3xl font-medium">
            of :{" "}
            <span className="font-bold">
              {contractInfo.goal * 0.000000000000000001} Ether
            </span>
          </div>
        </div>
        <div className="flex space-x-3">
          <div className="text-3xl font-medium">
            Deadline :{" "}
            <span className="font-bold">{contractInfo.deadline}</span>
          </div>
          <div className="text-3xl font-medium">
            Number of contributors :{" "}
            <span className="font-bold">{contractInfo.noOfContribute}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-10 space-x-5">
        <button
          type="submit"
          disabled={metamaskState.disabled}
          onClick={metamaskState.onClick}
          className={`focus:outline-none text-white ${metamaskState.color} hover:bg-${metamaskState.color}-800 focus:ring-4 
                    focus:ring-${metamaskState.color}-300 font-medium rounded-lg text-3xl px-8 py-3 mb-2`}
        >
          {metamaskState.text}
        </button>
        <div className="text-2xl font-medium">
          Minimum Contribution :{" "}
          <span className="font-bold">
            {contractInfo.minContribute * 0.000000000000000001} Ether
          </span>
        </div>
      </div>
      {hashShow && (
        <div className="text-xl">
          transactionHash (Goerli): {transactionHash}
        </div>
      )}
      {metamaskState.text == "Contribute" && (
        <div className="text-xl text-red-600">
          If the gas fee isn't enough, set it manually in metamask.
        </div>
      )}
    </div>
  );
}

export default App;
