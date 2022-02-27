import { useState, useEffect } from 'react';
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
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async() => {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      // console.log({ provider })
      const contract = new ethers.Contract(perpAddress, Perpetuator.abi, provider)
      //try?
      const newPosts = []
      const count = await contract.getPostCount()
      console.log('count.i: ', count.toString())
      const pid = count.sub(1)
      const post = await contract.posts(pid)
      console.log('msg.i: ', post.message)
      var fePost = {id: pid, message: post.message, author: post.author}
      newPosts.push(fePost)
      setPosts(newPosts)
    }
    init()
    // fetch('http://127.0.0.1:8000/api/v1/products/all')
    //   .then((res) => res.json())
    //   .then((data) => setProductsList([...data]))
    //   .then(setIsLoading(false));
  }, []);

  useEffect(() => {
    const load = async() => {
      console.log("load")
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      // // console.log({ provider })
      // const contract = new ethers.Contract(perpAddress, Perpetuator.abi, provider)
      // //try?
      // const newPosts = []
      // const count = await contract.getPostCount()
      // console.log('count.ue: ', count)
      // const post = await contract.posts(count.sub(1))
      // console.log('msg.ue: ', post.message)
    }
    load()
  }, [posts]);

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
      // console.log({ provider })
      const contract = new ethers.Contract(perpAddress, Perpetuator.abi, provider)
      try {
        const count = await contract.getPostCount()
        console.log('count.f: ', count)
        const post = await contract.posts(count.sub(1))
        console.log('msg.f: ', post.message)
        // posts = [post.message]
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
      // console.log({ provider })
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
        <input onChange={e => setMessageValue(e.target.value)} placeholder="Post message" />
        <button onClick={setMessage}>Post Message</button>
        {/* {posts.forEach(function (item,index) {
          <p key={item}>{index}:{item}</p>
        })} */}
        {posts.map((item,key) => (
          <div>
            {console.log("p:", item)}
            <p key={item}>{item.id.toString()}:{item.message}</p>
            <pre>{item.author}</pre>
          </div>
        ))}
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
