let doubleGreenFlag = false;
let webhookURL = 'https://discord.com/api/webhooks/1123197528314224640/O1XhhgCiC_4PKOx6bk3hjmNbMTJUs0_4ujRE3BTi6SKW_NfuVdPXyGMUerTlK1z9hk4j';
let oldJackpot = -1;

// Function to get an element by XPath
function getElementByXpath(path) {
    return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

// Function to extract, parse, and print
function extractJackpot() {
    // Get the element
    let path = '/html/body/cw-root/mat-sidenav-container/mat-sidenav-content/div/cw-roulette/div/header/div/cw-roulette-jackpot/div/div/cw-pretty-balance/span/text()';
    let jackpotElement = getElementByXpath(path);

    if (jackpotElement !== null) {
        // Get the text content, trim it, remove commas, parse it to float, and print it to the console
        let jackpotText = jackpotElement.textContent.trim().replace(/,/g, '');
        let jackpotFloat = parseFloat(jackpotText);
    
        if (!isNaN(jackpotFloat)) {
					console.log('Current jackpot: ' + jackpotFloat);
					return jackpotFloat;
        } else {
					console.log('Error: The text content of the jackpotElement could not be parsed to a float');
        }
    } else {
        console.log('Error: No element found with the given XPath');
    }
		return 0.0;
}

function f(x, greenBet, jackpot) {
	return (x / (greenBet + x) * jackpot / 3) - x;
}

function sendNotification(messageContent) {
	// Create a new XMLHttpRequest
	var xhr = new XMLHttpRequest();
	xhr.open("POST", webhookURL, true);
	xhr.setRequestHeader('Content-Type', 'application/json');

	// Send a message
	xhr.send(JSON.stringify({
			content: messageContent
	}));
}

function getOptimalBet(greenBet, jackpot) {
	let maxVal = -Infinity;
	let maxX = -1;
	
	for(let x = 0; x <= jackpot / 3 - greenBet; x += 0.1) {
		// Calculate function
		let val = f(x, greenBet, jackpot);
		
		if(val > maxVal) {
			maxVal = val;
			maxX = x;
		}
	}
	return maxX;
}

function extractCountdown() {
	// Get countdown by selector
	let countdownPath = '/html/body/cw-root/mat-sidenav-container/mat-sidenav-content/div/cw-roulette/div/div[2]/div[1]/cw-next-roll/div/div[2]';
	let countdown = getElementByXpath(countdownPath);
	if (countdown !== null) {
		// Get the text content and print it to the console
		let countdownText = countdown.textContent.trim();
		let countdownFloat = parseFloat(countdownText);
		if (!isNaN(countdownFloat)) {
			if(countdownFloat >= 59.9 && !doubleGreenFlag) {
				doubleGreenFlag = true;
				oldJackpot = extractJackpot();
				sendNotification('INFO: Double Green detected with jackpot ' + extractJackpot() + '!\nhttps://www.csgoroll.com/en/roll');
				console.log('INFO: Double Green detected!');
			}
			if(countdownFloat <= 0.1 && countdownFloat > 0) {
				let jackpot = extractJackpot();
				if(jackpot < oldJackpot) {
					sendNotification('INFO: Jackpot has been hit at ' + oldJackpot + '!');
					console.log('INFO: Jackpot has been hit at ' + oldJackpot + '!');
					oldJackpot = jackpot;
				}
				let greenBet = extractGreenBet();
				if(doubleGreenFlag) {
					if(jackpot > 0 && greenBet > 0) {
						let optimalBet = getOptimalBet(greenBet, jackpot);
						betValue(5);
						//sendNotification('Current jackpot is ' + jackpot + '\nOptimal bet on green is ' + optimalBet.toFixed(2) + '\nProfit from jackpot is ' + f(optimalBet, greenBet, jackpot).toFixed(2));
						console.log('Current jackpot is ' + jackpot + '\nOptimal bet on green is ' + optimalBet.toFixed(2) + '\nProfit from jackpot is ' + f(optimalBet, greenBet, jackpot).toFixed(2));
					}
					doubleGreenFlag = false;
				}
			}
		} else {
			console.log('Error: The countdown could not be parsed to a float');
		}
	} else {
			console.log('Error: Countdown not found!');
	}
}

// Function to extract, parse, and print the total green bet value
function extractGreenBet() {
    // Get the element
    let path = '/html/body/cw-root/mat-sidenav-container/mat-sidenav-content/div/cw-roulette/div/div[2]/div[2]/cw-roulette-bet-list/section[2]/header/div[2]/cw-pretty-balance/span/text()';
    let greenBetElement = getElementByXpath(path);

    if (greenBetElement !== null) {
        // Get the text content, trim it, remove commas, parse it to float, and print it to the console
        let greenBetText = greenBetElement.textContent.trim().replace(/,/g, '');
        let greenBetFloat = parseFloat(greenBetText);
    
        if (!isNaN(greenBetFloat)) {
            console.log('Current green bet: ' + greenBetFloat);
						return greenBetFloat;
        } else {
            console.log('Error: The text content of the greenBetElement could not be parsed to a float');
        }
    } else {
        console.log('Error: No element found with the given XPath');
    }
		return 0.0;
}

function betValue(bet) {
	// XPath of the input element
	let inputXPath = '/html/body/cw-root/mat-sidenav-container/mat-sidenav-content/div/cw-roulette/div/div[2]/cw-amount-input/mat-form-field/div/div[1]/div[3]/div[2]/input';
	
	// Get the input element
	let inputElement = getElementByXpath(inputXPath);

	if (inputElement !== null) {
		// Set the value of the input to x
		inputElement.value = bet;
		// XPath of the button element
		let buttonXPath = '/html/body/cw-root/mat-sidenav-container/mat-sidenav-content/div/cw-roulette/div/div[2]/div[2]/section/cw-roulette-bet-button[2]/div/button';

		// Get the button element
		let buttonElement = getElementByXpath(buttonXPath);

		if (buttonElement !== null) {
				// "Press" the button
				//buttonElement.click();
				console.log('INFO: Bet on green with ' + bet + ' coins');
		} else {
				console.log('Error: No element found with the given XPath for button');
		}
	} else {
			console.log('Error: No element found with the given XPath');
	}
}

// Call extractCountdown every 100 milliseconds (0.1 seconds)
setInterval(extractCountdown, 100);
