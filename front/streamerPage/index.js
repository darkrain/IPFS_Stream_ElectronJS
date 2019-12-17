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
	contractAdress: '0x6187Ddeda1d960834C9FeEc0b1Bc3245E92E6c7A',
	abi: contractAbi,
	ownerInfo: {
		addr: '0x24979284Bc9f7D16c3f13fE82DB1eDB6b201aBE3',
		privateKey: '9ec3a942c018eebf1422f54c6a7a58b225241ddcaa3e13abddbb2e844eed7968',
		mnemonic: 'major mutual knife split ability tennis silly run swarm major control rubber'
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

	console.log(`Web3 initialized! \n ${web3}`);
}

function paymentForFalse() {

	//TODO realize logic
	
	const opts = {
		from: gameContractData.ownerInfo.addr,
		gasPrice: '100000000000', //price in wei
		gas: 210000 //limit
  };

  const contract = web3.eth.contract(gameContractData.abi, gameContractData.contractAdress, opts);
  
  contract.methods.finishBettingForFalse().call({from: gameContractData.ownerInfo.addr}, function(error, result){
      if(error) {
        console.error(`Error with contract! \n ${error.toString()}`);
        return;
      }

      console.log(`FALSE wins! Result: \n ${JSON.stringify(result)}`);
    }); 
}

// ### END Client event subscriber handlers ###
