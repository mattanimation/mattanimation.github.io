/*
<!--
   _____   __                       .___        __                              __  .__
  /  _  \_/  |_  _____   ____  _____|   | _____/  |_  ________________    _____/  |_|__|__  __ ____
 /  /_\  \   __\/     \ /  _ \/  ___/   |/    \   __\/ __ \_  __ \__  \ _/ ___\   __\  \  \/ // __ \
/    |    \  | |  Y Y  (  <_> )___ \|   |   |  \  | \  ___/|  | \// __ \\  \___|  | |  |\   /\  ___/
\____|__  /__| |__|_|  /\____/____  >___|___|  /__|  \___  >__|  (____  /\___  >__| |__| \_/  \___  >
        \/           \/           \/         \/          \/           \/     \/                   \/
-->
Author: Matt Murray | @mattanimation
*/

var talkValue = 0;

$(document).ready(function(){


	var opts = {
		amplitude: 150,
		pitch: 2,
		speed: 140,
		voice:'en/en-us',
		wordgap: 0
	}

	var d = new Date();
	d = d.getTime();
	console.log(d);
	var r = $('#reply');
	var t = $('#txt');
	var a;
	var dncr, da, aSrc;
	var audioCtx;
	var cvr = $('.cover');
	var loaded = true;

	//nab the users local city/info based on ip

	var talkAboutCity = false;
	var talkAboutState = false;
	var uDetails;
	/*
	$.getJSON("https://ipinfo.io/json", function(data) {
	    console.log(data);
	    uDetails = data;

	});
	*/

	//use web audio api to change the voice and add effects and get sample data
	audioCtx = new (window.AudioContext || window.webkitAudioContext)();
	dncr = new Dancer();


	t.keypress(function(evt){
		if(evt.keyCode == 13)
		{
			talk();
		}
	});

	function talk()
	{
		console.log(t.val());
		QueryBot(t.val());
		/*
		$.ajax({
			url: botUrl,
			data: {"say":t.val(), "bot_id":1, "convo_id": d},
			success:botReturn
		});
		*/
		t.val("");
		r.html("Seeking wisdom from The Oracle...");
	}

	function QueryBot(_input){
		let witData = {
			appID:"59794539-dfbf-46ed-8983-ca83fc47fa08",
			serverToken:"LHQ3HIJDOROOSLWVS5YTWSUC33DTQDVF",
			clientToken:"FGLUGIKTM25RZR74TJAZGW67DCDTBJL2"
		}
		//ref: https://wit.ai/docs/http/20170307
		//ref: https://wit.ai/docs/http/20170307#get--message-link
		//message, get meaning of sentence
		
		$.ajax({
		  url: 'https://api.wit.ai/message',
		  data: {
		    'q': _input,
		    'access_token' : witData.clientToken
		  },
		  dataType: 'jsonp',
		  method: 'GET',
		  success: function(response) {
		      console.log("success!", response);
		      botReturn(JSON.stringify({botSay:response._text}));
		  }
		});
		

		//converse
		/*
		$.ajax({
		  url: 'https://api.wit.ai/converse',
		  data: {
		  	'session_id':"123abc",
		    'q': _input,
		    'access_token' : witData.clientToken
		  },
		  dataType: 'jsonp',
		  method: 'GET',
		  success: function(response) {
		      console.log("success!", response);
		      botReturn('{botSay:"funny ha ha"}');
		  }
		});
		*/
		
	}

	var lc;

  var phrase="";
  function botReturn(data){
    console.log(data);
		var jData = JSON.parse(String(data));
		console.log(jData);
		phrase = String(jData.botSay);
		if(phrase == "")
		{
			if(!talkAboutCity)
			{
				phrase = "Actually before we get to that I would like your thoughts on " + uDetails.city +", how do you like it?";
				talkAboutCity = true;
			}
			else if(!talkAboutState)
			{
				phrase = "Actually before we get to that do you like the weather in " + uDetails.region +"?";
				talkAboutState = true;
			}
			else
				phrase = "Not sure what you mean...";
		}
		console.log(phrase);


		//check for when the generated audio has been loaded
		
		lc = setInterval(function(){
			if(loaded)
			{
				alive();
				loaded = false;
				clearInterval(lc);
			}
		},100);


		speak(phrase, opts);

	}

	function alive()
	{
		//init dancer to get data from audio file
		a = document.getElementById('player');

		//aSrc = audioCtx.createMediaElementSource(a);
		//var analyser = audioCtx.createAnalyser();
		//var waveForm = analyser.getByteTimeDomainData()
		//var gainNode = audioCtx.createGain();
		//var cvNode = audioCtx.createConvolver();
		//var delayNode = audioCtx.createDelay(4);


		//connect the nodes
		//aSrc.connect(delayNode);
		//analyser.connect(delayNode);
		//aSrc.connect(cvNode)
		//cvNode.connect(gainNode);
		//gainNode.connect(audioCtx.destination);

		//gainNode.gain.value = 1;
		//a.play();


		var aud = new Audio();
		if(aud == null){ return; } 
		aud.src = a.src;//;
		dncr.load(aud);

		kick = dncr.createKick({
	      onKick: function ( mag ) {
	        //console.log('Kick!');
	        //console.log(mag);

	      },
	      offKick: function ( mag ) {
	        //console.log('no kick :(');
	        //console.log(mag);
	        talkValue = mag * 10;
	      }
	    });

		// Let's turn this kick on right away
		kick.on();

    var printInt;
    var printIntInd = 0;
    var printPhrase = "";

    dncr.play();

      //type out the letters
      printInt = setInterval(function(){
        if(printIntInd < phrase.length)
        {
          printPhrase += phrase[printIntInd];
          r.html(printPhrase);
        }
        else{
          clearInterval(printInt);

          printPhrase = "";
          //clear out test after a moment
          setTimeout(function(){
            r.html("Awaiting Input...");
            kick.off();
            kick = null;
            //dncr = null;
            talkValue = 0;
          }, printIntInd * 50);
          printIntInd = 0;

        }

        printIntInd++;

      }, 50);

		//var request = new XMLHttpRequest();
		//request.open("GET", aud.src, true);
		//request.responseType = "arraybuffer";

		//request.onload = function () {
		//	cvNode.buffer = audioCtx.createBuffer(base64ArrayBuffer(request.response), false);





		//}
		//request.send();




	}//end alive

  function base64ArrayBuffer(arrayBuffer) {
    var base64    = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes         = new Uint8Array(arrayBuffer)
    var byteLength    = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength    = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63               // 63       = 2^6 - 1

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength]

      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

      // Set the 4 least significant bits to zero
      b = (chunk & 3)   << 4 // 3   = 2^2 - 1

      base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

      // Set the 2 least significant bits to zero
      c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
  }


});

