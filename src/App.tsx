import React, { useState, useEffect } from 'react';
import { PeaqAgungTestnet } from '@particle-network/chains';
import { AAWrapProvider, SmartAccount } from '@particle-network/aa';
import { useEthereum, useConnect, useAuthCore } from '@particle-network/auth-core-modal';
import { ethers } from 'ethers';
import { Transaction } from '@particle-network/aa';
import { notification } from 'antd';

import './App.css';

const App: React.FC = () => {
  const { provider } = useEthereum();
  const { connect, disconnect } = useConnect();
  const { userInfo } = useAuthCore();

  const [balance, setBalance] = useState<string>("...");

  const smartAccount = new SmartAccount(provider, {
    projectId: process.env.REACT_APP_PROJECT_ID || '',
    clientKey: process.env.REACT_APP_CLIENT_KEY || '',
    appId: process.env.REACT_APP_APP_ID || '',
    aaOptions: {
      accountContracts: {
        SIMPLE: [{ chainIds: [PeaqAgungTestnet.id], version: '1.0.0' }],
      }
    }
  });

  const customProvider = new ethers.providers.Web3Provider(new AAWrapProvider(smartAccount), "any");

  useEffect(() => {
    if (userInfo) {
      fetchBalance();
    }
  }, [userInfo]);

  const fetchBalance = async () => {
    try {
      const address = await smartAccount.getAddress();
      const balanceResponse = await customProvider.getBalance(address);
      setBalance(ethers.utils.formatEther(balanceResponse));
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance("Error");
    }
  };

  const handleLogin = async (socialType: any) => {
    if (!userInfo) {
      try {
        await connect({
          socialType,
          chain: PeaqAgungTestnet
        });
      } catch (error) {
        console.error("Login error:", error);
      }
    }
  };

  const executeUserOp = async () => {
    try {
      const tx: Transaction = {
        to: "0x000000000000000000000000000000000000dEaD",
        value: ethers.utils.parseEther('0.001').toString(), // Convert BigNumber to string
        data: '0x',
      };
  
      notification.info({
        message: "Loading Transaction"
      });
  
      const feeQuotes = await smartAccount.getFeeQuotes(tx);
  
      if (!feeQuotes.verifyingPaymasterGasless) {
        throw new Error("Gasless transaction is not available");
      }
  
      const txResponse = await smartAccount.sendUserOperation({
        userOp: feeQuotes.verifyingPaymasterGasless.userOp,
        userOpHash: feeQuotes.verifyingPaymasterGasless.userOpHash
      });
  
      notification.success({
        message: "Transaction Successful",
        description: (
          <div>
            Transaction Hash: <a href={`https://agung-testnet.subscan.io/tx/${txResponse}`} target="_blank" rel="noopener noreferrer">{txResponse}</a>
          </div>
        )
      });
    } catch (error) {
      console.error("Transaction error:", error);
      notification.error({
        message: "Transaction Failed",
        description: error instanceof Error ? error.message : "An error occurred while processing the transaction."
      });
    }
  };
  return (
    <div className="App">
      <div className="logo-section">
        <img src="https://i.imgur.com/EerK7MS.png" alt="Logo 1" className="logo logo-big" />
        <img src="https://i.imgur.com/rFGq3N0.png" alt="Logo 2" className="logo logo-small" />
      </div>
      {!userInfo ? (
        <div className="login-section">
          <button className="sign-button google-button" onClick={() => handleLogin('google')}>
            <img src="https://i.imgur.com/nIN9P4A.png" alt="Google" className="icon"/>
            Sign in with Google
          </button>
          <button className="sign-button twitter-button" onClick={() => handleLogin('twitter')}>
            <img src="https://i.imgur.com/afIaQJC.png" alt="Twitter" className="icon"/>
            Sign in with X
          </button>
          <button className="sign-button other-button" onClick={() => handleLogin('')}>
            <img src="https://i.imgur.com/VRftF1b.png" alt="Other" className="icon"/>
          </button>
        </div>
      ) : (
        <div className="profile-card">
          <h2>{userInfo.name}</h2>
          <div className="balance-section">
            <small>{balance} AGUNG</small>
            <button className="sign-message-button" onClick={executeUserOp}>Execute Transaction</button>
            <button className="disconnect-button" onClick={() => disconnect()}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;