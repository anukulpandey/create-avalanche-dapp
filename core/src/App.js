import React from 'react';
import GreeterContract from "./contracts/Greeter.json";
import { OnboardingButton } from "./components/connection";
import { ethers } from 'ethers'
import { UpdateForm } from './components/UpdateForm'
import "./app.css"
const logo = "https://docs.avax.network/img/Avalanche_Horizontal_Red.svg";
const contractAddress = GreeterContract.address;
const ContractArtifact = GreeterContract.abi;
class App extends React.Component {
  constructor () {
    super()

    this.state = {
      isConnected: false,
      contract: null,
      currentMessage: '',
      messageInterval: null,
      updateTransactionHash: null,
      transactionError: null
    }

    this.onConnected = this.onConnected.bind(this)
    this.fetchMessage = this.fetchMessage.bind(this)
    this.updateMessage = this.updateMessage.bind(this)
  }

  componentWillUnmount () {
    if (this.state.messageInterval) {
      clearInterval(this.state.messageInterval)
    }
  }

  async onConnected () {
    // Use the MetaMask wallet as ethers provider
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    // Create a JavaScript object from the Contract ABI, to interact
    // with the HelloWorld contract.
    const contract = new ethers.Contract(
      contractAddress,
      ContractArtifact,
      provider.getSigner()
    )

    this.setState({
      isConnected: true,
      contract,
      // Start fetching the contract's message every 30 seconds
      messageInterval: setInterval(this.fetchMessage, 30000)
    })

    // Fetch the current message
    await this.fetchMessage()
  }

  async fetchMessage () {
    console.log('fetching current contract message')
    this.setState({ currentMessage: await this.state.contract.getMessage() })
  }

  async updateMessage (newMessage) {
    console.log('Sending new message', newMessage)
    this.setState({ transactionError: null })

    try {
      // Call the update method of the contract
      const tx = await this.state.contract.setMessage(newMessage)
      console.log('Created transaction', tx)
      // Store the transaction hash in the state
      this.setState({ updateTransactionHash: tx.hash })

      // Wait until the transaction is resolved (either mined
      // or returns with an error)
      const receipt = await tx.wait()
      console.log('Transaction successfull', receipt)

      if (receipt.status === 0) {
        // An undefined error occurred
        throw new Error('Transaction failed')
      }

      // Fetch the current message with a delay of 1 second
      setTimeout(this.fetchMessage, 1000)
    } catch (error) {
      // An error occurred
      console.error(error)
      this.setState({ transactionError: error })
    } finally {
      this.setState({ updateTransactionHash: null })
    }
  }

  render () {
    const MessageComponent = <div>
      {this.state.currentMessage
        ? <p className='msgComp'>{this.state.currentMessage}</p>
        : <p>Loading message...</p>
      }
    </div>

    return (
      <div className="App">
        <div className="header">
        <h1>Create</h1>
        <img src={logo} alt="" className='logo'/>
        <h1>dApp</h1>

        </div>

        <OnboardingButton onConnected={this.onConnected} />

        {this.state.isConnected &&
          <div>
            {MessageComponent}
            <button className='btn'
            onClick={this.fetchMessage}
            >Get Message</button>
            <UpdateForm
              currentMessage={this.state.currentMessage}
              updateTransactionHash={this.state.updateTransactionHash}
              updateMessage={this.updateMessage}
            />
           
          </div>
        }

        {this.state.transactionError &&
          <div>
            Transaction Error: {this.state.transactionError.code} {this.state.transactionError.message}
          </div>
        }
      </div>
    )
  }
}

export default App