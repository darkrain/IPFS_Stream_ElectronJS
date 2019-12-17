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
	contractAdress: '0xE9d7Ca2e9170b208482b7e15ad6bF800E7AFE428',
	abi: contractAbi,
	ownerInfo: {
		addr: '0x57221f51c1d31d1a27d391E5EA4Ab181376cb222',
		privateKey: '5fbb4026de3f121b50010efe73c7a7e78fe4dfcae247661ba6aaeb99364617f1',
		mnemonic: 'moral roof vivid stadium gold acquire plunge artefact artefact post analyst lyrics'
	}
}

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
      paymentForTrue();
      setActiveGameEventControls(false);
    }

    loseItBtn.onclick = () => {
      paymentForFalse();
      setActiveGameEventControls(false);
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
  const opts = {
		from: gameContractData.ownerInfo.addr,
		gasPrice: '100000000000', //price in wei
		gas: 210000 //limit
  };

  window.mainContract = new web3.eth.Contract(gameContractData.abi, gameContractData.contractAdress, opts);

  if(!window.mainContract) {
    throw new Error("Contract not initialized!");
  }
	console.log(`Web3 initialized! \n ${web3}`);
}

function paymentForFalse() {
  window.mainContract.methods.finishBettingForFalse().send({from: gameContractData.ownerInfo.addr}, function(error, result){
      if(error) {
        console.error(`Error with contract! \n ${error.toString()}`);
        return;
      }

      console.log(`FALSE wins! Result: \n ${JSON.stringify(result)}`);
    }); 
}

function paymentForTrue() {
  window.mainContract.methods.finishBettingForTrue().send({from: gameContractData.ownerInfo.addr}, function(error, result){
    if(error) {
      console.error(`Error with contract! \n ${error.toString()}`);
      return;
    }

    console.log(`TRUE wins! Result: \n ${JSON.stringify(result)}`);
  }); 
}

// ### END Client event subscriber handlers ###
