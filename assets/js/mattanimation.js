
//tie in the oracle stuff here

//tie in the console stuff here

//tie in the wit stuff here
function QueryBot(){
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
	    'q': 'set an alarm in 10min',
	    'access_token' : witData.clientToken
	  },
	  dataType: 'jsonp',
	  method: 'GET',
	  success: function(response) {
	      console.log("success!", response);
	  }
	});

	//converse
	$.ajax({
	  url: 'https://api.wit.ai/converse',
	  data: {
	  	'session_id':"123abc"
	    'q': 'weather in brussels',
	    'access_token' : witData.clientToken
	  },
	  dataType: 'jsonp',
	  method: 'GET',
	  success: function(response) {
	      console.log("success!", response);
	  }
	});
}