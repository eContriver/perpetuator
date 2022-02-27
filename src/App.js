import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import Perpetuator from './artifacts/contracts/Perpetuator.sol/Perpetuator.json'
import Token from './artifacts/contracts/Token.sol/Token.json'
// import logo from './logo.svg';

const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
const perpAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

function App() {
  const [message, setMessageValue] = useState()
  const [userAccount, setUserAccount] = useState()
  const [amount, setAmount] = useState()

  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
      const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(tokenAddress, Token.abi, provider)
      const balance = await contract.balanceOf(account);
      console.log("Balance: ", balance.toString());
    }
  }

  async function fetchMessage() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      console.log({ provider })
      const contract = new ethers.Contract(perpAddress, Perpetuator.abi, provider)
      try {
        const data = await contract.getPostCount()
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    } 
  }

  async function setMessage() {
    if (!message) return
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider })
      const signer = provider.getSigner()
      const contract = new ethers.Contract(perpAddress, Perpetuator.abi, signer)
      const transaction = await contract.post(message, {value: ethers.utils.parseEther("0.01")})
      await transaction.wait()
      fetchMessage()
    }
  }

  async function sendCoins() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount()
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      const transaction = await contract.transfer(userAccount, amount);
      await transaction.wait();
      console.log(`${amount} Coins successfully sent to ${userAccount}`);
    }
  }


  return (
    <div className="App">
      <h1 className='title'>Perpetuator</h1>
      <header className="App-header">
        <button onClick={fetchMessage}>Fetch Message</button>
        <button onClick={setMessage}>Set Message</button>
        <input onChange={e => setMessageValue(e.target.value)} placeholder="Set greeting" />

        <br />
        <button onClick={getBalance}>Get Balance</button>
        <button onClick={sendCoins}>Send Coins</button>
        <input onChange={e => setUserAccount(e.target.value)} placeholder="Account ID" />
        <input onChange={e => setAmount(e.target.value)} placeholder="Amount" />
      </header>
    </div>
  );
}

export default App;
