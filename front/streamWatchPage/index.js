const electron = require('electron');
const ipc = electron.ipcRenderer;
const chatItem = $.templates("#chatItem");

//CHANGE IT TO ITERACT WITH CONTRACTS!
const contractsAdresses = {
	FALSE_CONTRACT: null,
	TRUE_CONTRACT: null
}

$(document).ready(function() {
	ipc.on('streamerDataGetted', (event, args) => {
		const streamData = args;
		$('#streamerNameBlock').text(streamData.streamerName);
	});
	$('#backBtn').click(function(){
		ipc.send('gotoGlobalPage');
	});
	$('#createStreamBtn').click(function() {
		const args = {
            pageName: 'streamerInfoPage',
            pageArgs: 'none'
        };
        ipc.send('goto-page', args);
	});

	ipc.on('countOfWatchers-updated', (event, args) => {
		$('#countOfWatchers').text(args);
	});

	ipc.on('chatMessageGetted', (event, args) => {
		let chatBody = $('#chatBody');
		if( $('.nobodywrite', chatBody).length ){
			$('.nobodywrite', chatBody).remove()
		}

		let messageHtml = chatItem.render(args);
		$('tbody',chatBody).append(messageHtml)
	});

	ipc.on('onStreamEnded', (event, args) => {
		alert('Stream has been stopped!');
	});

	ipc.on('gameDataIncluded', (event, args) => {
		initializeGameData(args);
	})

	$('#sendMsgBtn').click(function () {
		const messageInput = document.getElementById('messageInput');
		ipc.send('onMessageSend', messageInput.value);
		messageInput.value = '';
	});
});

ipc.on('stream-loaded', (event, args) => {
    const httpPath = args;
	const video = document.getElementById('video-player');
	if(Hls.isSupported()) {
		const hls = new Hls();
		hls.loadSource(httpPath);
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, () => {
			video.play();
		});
	}
});

function initializeGameData(gameData) {

	const streamerGameEventElem = document.getElementById('streamerGameEvent');
	if(!gameData) {
		console.log(`This Stream without data!`);
		streamerGameEventElem.hidden = true;
		return;
	}	

	console.log(`Game data getted from streamer! \n ${JSON.stringify(gameData)}`);
	printValuesOfGameDataInWindow(gameData);
	subscribeToBetButtons();
	setActiveOfDialog(false); //basicly
}

function printValuesOfGameDataInWindow(gameData) {
	const gameEventNameElem = document.getElementById('gameEventName');
	const gameEventDescrElem = document.getElementById('gameEventDescription');
	gameEventNameElem.innerText = gameData.prettyViewName;
	gameEventDescrElem.innerText = gameData.gameEventDescription;
}

function subscribeToBetButtons() {
	const betTRUEButton = document.getElementById('makeItEventButton');
	const betFALSEButton = document.getElementById('dontItEventButton');
	betTRUEButton.onclick = () => {showDialogByAnswer(true);}
	betFALSEButton.onclick = () => {showDialogByAnswer(false);}
}

//answer is a boolean!
function showDialogByAnswer(answer) {
	setActiveOfDialog(true);
	const answerTitle = document.getElementById('answerElem');
	const answerStr = answer ? "Сделает" : "Не сделает";
	const answerStrColor = answer ? "white" : "red";
	if(answer === true) {
	//TODO show dialog
	} else if (answer === false) {
		
	} else {
		console.error(`Unknow type of answer! :/`);
	}

	answerTitle.innerText = answerStr;
	answerTitle.style.color = answerStrColor;

	console.log(`Bet click: ${answer}!`);
}

function setActiveOfDialog(isActive) {
	const dialog = document.getElementById('paymentInfo');
	dialog.hidden = !isActive;
}

