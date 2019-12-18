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
	contractAdress: '0x4164099A40D441354e089f3C055B6336D4739FA7',
	abi: contractAbi,
	ownerInfo: {
		addr: '0x046b7dd93Bebe2207baA9501efd6445113a2Fc28',
		privateKey: '2990fdafc4db01051e638ec82ff4c6452a59c889c4e5f1ec0a026514d40e2295',
		mnemonic: 'whale virtual rent primary churn peanut tube open small invest bargain amazing'
	}
}

const ContractOpts = {
  from: gameContractData.ownerInfo.addr,
  gasPrice: '100000000000', //price in wei
  gas: 2100000 //limit
};

$(document).ready(function() {

	//hide by default
	setActiveGameEventControls(false);

	ipc.on('gameEventReady', (event, args) => {
		const gameData = args;
		updateGameEventDialogByData(gameData);
		initializeWeb3();
    setActiveGameEventControls(true);
    subscribeToContractControlButtons();
	})

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
	});

	

	$('#sendMsgBtn').click(function () {
		const messageInput = document.getElementById('messageInput');

		if( messageInput.value === '')
			return false;
		ipc.send('onMessageSend', messageInput.value);
		messageInput.value = '';
	});
});

// ### Client event subscriber handlers ###
ipc.on('video-playlist-path-changed', (event, args) => {
	const httpPath = args;
	console.log(`Try to get video from url:${httpPath}`);
	var video = document.getElementById('video-player');
	if(Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(httpPath);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {						
			video.play();
			video.volume = 0;
		});
	}
});

ipc.on('watcher-count-update', (event, args) => {
	const watchersCount = args;
	const textCounter = document.getElementById('countOfWatchers');
	textCounter.textContent = watchersCount;
});

function subscribeToContractControlButtons() {
    const btnTakeIt = document.getElementById('btnTakeIt');
    const loseItBtn = document.getElementById('loseIt');

    btnTakeIt.onclick = () => {
      paymentForTrue().then((result) => {
        console.log(`TRUE executed! \n ${result}`);
      }).catch(err => {
        console.error(`Fail TRUE... \n ${err.toString()}`);
      })
      onGameEventFinish(true);
    }

    loseItBtn.onclick = () => {
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
		window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }
  
  window.mainContract = new web3.eth.Contract(gameContractData.abi, gameContractData.contractAdress, ContractOpts);

  if(!window.mainContract) {
    throw new Error("Contract not initialized!");
  }

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

async function paymentForFalse() {
  try {
    const gasPrice = await web3.eth.getGasPrice();

    const gasAmount = await window.mainContract.methods.finishBettingForFalse()
      .estimateGas({from: gameContractData.ownerInfo.addr});
    
    const result = await window.mainContract.methods.finishBettingForFalse().send({
      from: gameContractData.ownerInfo.addr,
      gasPrice: gasPrice,
      gas: gasAmount
    });
    return result;
  } catch(err) {
    throw err;
  }
}

async function paymentForTrue() {
  try {
    const gasPrice = await web3.eth.getGasPrice();

    const gasAmount = await window.mainContract.methods.finishBettingForTrue()
      .estimateGas({from: gameContractData.ownerInfo.addr});
    
    const result = await window.mainContract.methods.finishBettingForTrue().send({
      from: gameContractData.ownerInfo.addr,
      gasPrice: gasPrice,
      gas: gasAmount
    });
    return result;
  } catch(err) {
    throw err;
  }
}

function onGameEventFinish(isTrue) {
  ipc.send('gameEventEnded', isTrue); 
  //Скрываем панель управления
  //setActiveGameEventControls(false);
}

// ### END Client event subscriber handlers ###
