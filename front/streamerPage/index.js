const electron = require('electron');
const ipc = electron.ipcRenderer;
const chatItem = $.templates("#chatItem");

//Bad design, define all necessary data for web3 js 
//to iteract with contract
const contractAbi = [
  {
    "inputs": [],
    "payable": true,
    "stateMutability": "payable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "payable": true,
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "betHolderFALSE",
    "outputs": [
      {
        "internalType": "contract BetHolderContract",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "betHolderTRUE",
    "outputs": [
      {
        "internalType": "contract BetHolderContract",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "falsePlayersHashTable",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "isOwner",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "truePlayersHashTable",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayerBalanceInTrueBets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayerBalanceInFalseBets",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "internalType": "uint256",
        "name": "gasCost",
        "type": "uint256"
      }
    ],
    "name": "setGasCost",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "finishBettingForTrue",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [],
    "name": "finishBettingForFalse",
    "outputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "getPlayersBettingPoolAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]
const gameContractData = {
	contractAdress: '0xb5Bd17a9529583036c863FeA25C7f5f24B710a3f',
	abi: contractAbi,
	ownerInfo: {
		addr: '0x6A3fc1bab874318F4696cDfa15Ee5b9eD49Ae158',
		privateKey: '4888a629b009289c6890ce997c3942db07007bf9b1ea1e79a450b4b2c73af996',
		mnemonic: 'critic tell allow impose afford job degree level undo top umbrella column'
	}
}

const ContractOpts = {
  from: gameContractData.ownerInfo.addr,
  gasPrice: '100000000000', //price in wei
  gas: 2100000 //limit
};

let videoElement = null;
$(document).ready(function() {

	//hide by default
	setActiveGameEventControls(false);
  const chatElement = document.getElementById('chatElement');
	ipc.on('gameEventReady', (event, args) => {
		const gameData = args;
		updateGameEventDialogByData(gameData);
		initializeWeb3();
    setActiveGameEventControls(true);
    subscribeToContractControlButtons();
  })
  
  chatSendMsgByEnterInitialization(document.getElementById('messageInput'), document.getElementById('sendMsgBtn'));

	$('#backBtn').click(function(){
		ipc.send('backBtnClicked');
	});

	$('#saveStreamBtn').click(() => {
		ipc.send('saveStreamClicked');
	});

	ipc.on('chatMessageGetted', (event, args) => {
		let chatBody = $('#chatBody');
		if( $('.nobodywrite', chatBody).length ){
			$('.nobodywrite', chatBody).remove()
		}

		let messageHtml = chatItem.render(args);
    $('tbody',chatBody).append(messageHtml)
    
    scrollDownToElement(chatElement);
	});

	

	$('#sendMsgBtn').click(function () {
		const messageInput = document.getElementById('messageInput');
    scrollDownToElement(chatElement);
		if( messageInput.value === '')
			return false;
		ipc.send('onMessageSend', messageInput.value);
		messageInput.value = '';
  });
  
  videoElement = document.getElementById('video-player');
  videoElement.style.display = 'none';
});

// ### Client event subscriber handlers ###
ipc.on('video-playlist-path-changed', (event, args) => {
  const videoPlug = document.getElementById('video-plug');
  videoPlug.style.display = "none";
  videoElement.style.display = "block";
  loadVideoByTag(args, videoElement, null, 0);
});

ipc.on('watcher-count-update', (event, args) => {
	const watchersCount = args;
	const textCounter = document.getElementById('countOfWatchers');
	textCounter.textContent = watchersCount;
});

function isConfirm() {
  let isConfirmed = confirm("Вы уверены?");
  return isConfirmed;
}

function subscribeToContractControlButtons() {
    const btnTakeIt = document.getElementById('btnTakeIt');
    const loseItBtn = document.getElementById('loseIt');
    btnTakeIt.onclick = () => {
      if(isConfirm() === false)
        return;
      paymentForTrue().then((result) => {
        console.log(`TRUE executed! \n ${result}`);
      }).catch(err => {
        console.error(`Fail TRUE... \n ${err.toString()}`);
      })
      onGameEventFinish(true);
    }

    loseItBtn.onclick = () => {
      if(isConfirm() === false)
        return;
      paymentForFalse().then((result) => {
        console.log(`False executed! \n ${result}`);
      }).catch(err => {
        console.error(`Fail false... \n ${err.toString()}`);
      })
      onGameEventFinish(false);
    }
}

function setActiveGameEventControls(isActive) {
	const dialog = document.getElementById('gameEventControl');
	dialog.hidden = !isActive;
}

function updateGameEventDialogByData(gameData) {
	const gameEventName = document.getElementById('gameEventName');
	const gameEventDescription = document.getElementById('gameEventDescription');
	gameEventName.innerText = gameData.prettyViewName;
	gameEventDescription.innerText = gameData.gameEventDescription;
}

function initializeWeb3() {
	if (typeof web3 !== 'undefined') {
		window.web3 = new Web3(web3.currentProvider);
	} else {
		// set the provider you want from Web3.providers
		window.web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/80863635bd9a43afa39e50b97b42497e"));
  }
  
  window.mainContract = new web3.eth.Contract(gameContractData.abi, gameContractData.contractAdress, ContractOpts);

  if(!window.mainContract) {
    throw new Error("Contract not initialized!");
  }

  showContractMethods(window.mainContract);

	console.log(`Web3 initialized! \n ${web3}`);
}

//** DEPRECATED ** there is no need to set gas inside contracts..
function reduceGasFromContracts() {
  web3.eth.getGasPrice().then((wei) => {
    window.mainContract.methods.setGasCost(wei).send({from: gameContractData.ownerInfo.addr}, (err, result) => {
      if(err)
        console.error(`SetGas func not work! \n ${err.toString()}`);
      console.log(`Gas changed! \n to ${wei}`);
    });
  }).catch((err) => {
    console.error(`Cannot set gas! \n ${err.toString()}`)
  });
}

function paymentForFalse() {
  return sendSignedToContract_FALSE();
}

function paymentForTrue() {
  return sendSignedToContract_TRUE();
}

function onContractError(err) {
  toastr["error"](err.toString(), "Контракт не выполнен");
  return err;
}

function onGameEventFinish(isTrue) {
  ipc.send('gameEventEnded', isTrue); 
  //Скрываем панель управления
  setActiveGameEventControls(false);
}

// ### END Client event subscriber handlers ###


//TO access infura

//test
function showContractMethods(contract) {
  window.contractMethods = contract.methods;
  console.log(`METHODS OF CONTRACT: \n ${JSON.stringify(window.contractMethods)}`)
}

async function sendSignedToContract_FALSE() {
  console.log(`TRY TO EXECUTE WIN FALSE`);
  let Tx = require('ethereumjs-tx').Transaction;
  let web3 = window.web3;
  const gasAmount = await window.mainContract.methods.finishBettingForFalse()
      .estimateGas({from: gameContractData.ownerInfo.addr});

  const gasPriceGwei = 5; //middle
  const gasPrice = web3.utils.toWei(gasPriceGwei.toString(), 'gwei');

  let tx_builder = window.mainContract.methods.finishBettingForFalse();
  let encoded_tx = tx_builder.encodeABI();

  const addrForNonce = gameContractData.ownerInfo.addr;
  let nonce = await web3.eth.getTransactionCount(addrForNonce);
  let nonceHex = web3.utils.toHex(nonce);

  let gasLimit = web3.utils.toWei((210000000).toString(), 'gwei');
  let gasLimitHex = web3.utils.toHex(gasLimit);

  let web3GasPrice = await web3.eth.getGasPrice();
  let lastBlock = await web3.eth.getBlock("latest");
  let gasLimitOfLastBlock = lastBlock.gasLimit;
  const rawValues = {
    gas: (gasAmount * 5).toString(), 
    gasPrice: (8000000000).toString(), //8 gwei in WEI
    nonce: nonce.toString(), // << nonce is matter for AWAITING to accept transaction
    gasLimit: (gasLimitOfLastBlock * 1000000).toString()
  }

  console.log(`RAW VALUES OF TRANSACTION!: \n ${JSON.stringify(rawValues)}`);

  let transactionObject = {
      //gas: gasHex,
      data: encoded_tx,
      nonce: web3.utils.toHex(rawValues.nonce),
      gas: web3.utils.toHex(rawValues.gas),
      gasPrice: web3.utils.toHex(rawValues.gasPrice),
      gasLimit:  web3.utils.toHex(rawValues.gasLimit),
      from: gameContractData.ownerInfo.addr,
      to: gameContractData.contractAdress
  };

  var tx = new Tx(transactionObject);
  var privateKey = new Buffer(gameContractData.ownerInfo.privateKey, 'hex')

  tx.sign(privateKey);

  var serializedTx = tx.serialize();

  try {

    const receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .once('transactionHash', function(hash){
      console.log(`Hash getted! ${hash}`);
    })
    .once('receipt', function(receipt){
      console.log(`Reciep getted! ${receipt}`);
     })
    .on('confirmation', function(confNumber, receipt){
      console.log(`FALSE WINS: Transaction confiramted! \n ${confNumber} \n ${receipt}`)
     })
    .on('error', function(error){ 
      console.error(`SIGNED ERROR! \n ${error.toString()} !!!`);
     });

     console.log(`FALSE WINS: Reciept succefully MINED! \n ${receipt}`);
  } catch(err) {
    console.error(`RECEIPT CANT BE MINED! COZ: \n ${err.toString()}`);
  }

  return new Promise(resolve => setTimeout(resolve, 1000));  
}

async function sendSignedToContract_TRUE() {
  console.log(`TRY TO EXECUTE WIN TRUE`);
  let Tx = require('ethereumjs-tx').Transaction;
  let web3 = window.web3;
  const gasAmount = await window.mainContract.methods.finishBettingForTrue()
      .estimateGas({from: gameContractData.ownerInfo.addr});

  const gasPriceGwei = 5; //middle
  const gasPrice = web3.utils.toWei(gasPriceGwei.toString(), 'gwei');

  let tx_builder = window.mainContract.methods.finishBettingForTrue();
  let encoded_tx = tx_builder.encodeABI();

  const addrForNonce = gameContractData.ownerInfo.addr;
  let nonce = await web3.eth.getTransactionCount(addrForNonce);
  let nonceHex = web3.utils.toHex(nonce);

  let gasLimit = web3.utils.toWei((210000000).toString(), 'gwei');
  let gasLimitHex = web3.utils.toHex(gasLimit);

  let web3GasPrice = await web3.eth.getGasPrice();
  let lastBlock = await web3.eth.getBlock("latest");
  let gasLimitOfLastBlock = lastBlock.gasLimit;
  const rawValues = {
    gas: (gasAmount * 5).toString(), 
    gasPrice: (8000000000).toString(), //8 gwei in WEI
    nonce: nonce.toString(), // << nonce is matter for AWAITING to accept transaction
    gasLimit: (gasLimitOfLastBlock * 1000000).toString()
  }

  console.log(`RAW VALUES OF TRANSACTION!: \n ${JSON.stringify(rawValues)}`);

  let transactionObject = {
      //gas: gasHex,
      data: encoded_tx,
      nonce: web3.utils.toHex(rawValues.nonce),
      gas: web3.utils.toHex(rawValues.gas),
      gasPrice: web3.utils.toHex(rawValues.gasPrice),
      gasLimit:  web3.utils.toHex(rawValues.gasLimit),
      from: gameContractData.ownerInfo.addr,
      to: gameContractData.contractAdress
  };

  var tx = new Tx(transactionObject);
  var privateKey = new Buffer(gameContractData.ownerInfo.privateKey, 'hex')

  tx.sign(privateKey);

  var serializedTx = tx.serialize();

  try {

    const receipt = await web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
    .once('transactionHash', function(hash){
      console.log(`Hash getted! ${hash}`);
    })
    .once('receipt', function(receipt){
      console.log(`Reciep getted! ${receipt}`);
     })
    .on('confirmation', function(confNumber, receipt){
      console.log(`TRUE WINS: Transaction confiramted! \n ${confNumber} \n ${receipt}`)
     })
    .on('error', function(error){ 
      console.error(`SIGNED ERROR! \n ${error.toString()} !!!`);
     });

     console.log(`TRUE WINS: Reciept succefully MINED! \n ${receipt}`);
  } catch(err) {
    console.error(`RECEIPT CANT BE MINED! COZ: \n ${err.toString()}`);
  }

  return new Promise(resolve => setTimeout(resolve, 1000));  
}
