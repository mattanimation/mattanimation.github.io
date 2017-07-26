
$(window).ready(function(){
	console.log("console loaded....");

	var consoleInput = $('#consoleInput');
	var consoleSpace = $('#consoleSpace');
	var cursorSpot = $('#cursorSpot');
	var latestInput = "";
	var lastCmd = 0;
	var isTyping = false;

	var cmdQueue = [];

	var mockData = {
		files:{
			"poop.txt":"poop poop poop",
			"super_secret_document.txt": "secrets here, secrets there...",
			"something_important.txt": "you are a turd.",
			"data.json":'{"blargh":"nerp", "lerp":["fart", "tarp"]}'
		},
		projects:{
			"orchard":{
				title:"The Orchard",
				description:"A partnership of Chaotic Moon and Gensler that resulted in a 30ft inflatable tree of lights, sounds and interaction",
				image:"http://www.placehold.it/600x200",
				contributors:["Matt Murray", "Eric Schneider", "Ali Madad", "Grant Nicol", "Alyssa Peters", "John Hauser"],
				work:"Arduino programming, Processing coding, User Interaction"
			}
		}
	};

	var templates = {
		projects:'<div class="project"><img src="{{image}}"/><h1 class="title">Title: {{title}}</h1><p class="description">Description: {{description}}</p><h4>Contributors: </h4><ul class="contributors">{{contributors}}</ul><p class="work">My Contributions: {{work}}</p></div>'
	}

	function RenderTemplate(_template, _data){
		var projectContainer = $('<div class="projects"></div>');
		Object.keys(_data).forEach(function(projKey){
			var proj = _data[projKey];
			var templateTxt = _template;
			console.log(proj);
			console.log(templateTxt);
			Object.keys(proj).forEach(function(k){
				var projData = proj[k];
				var projDataRes = proj[k];
				console.log(projData);
				if(projData.constructor == Array)
				{
					projDataRes = "";
					projData.forEach(function(con){
						projDataRes += ("<li>"+con+"</li>");
					})
				}
				templateTxt = templateTxt.replace("{{"+ k +"}}", projDataRes);
			});
			console.log(templateTxt);
			var newProject = $(templateTxt);
			projectContainer.append(newProject);
		});
		consoleSpace.append(projectContainer);
	}


	function ListFiles(){
		return Object.keys(mockData.files).join(", ");
	}

	var helpAttempts = 0;
	function DisplayHelp(){
		var r = [
			"nothing can help you now...",
			"don't need any help...",
			"stop while you're ahead...",
			"why do you keep trying this?",
			"seriously...?",
			"just stop",
			"STOP IT!!",
			"Knock it Off!",
			"YOU WILL NOT GET ANY HELP!",
			"...",
			".......",
			"BUGGER OFF!"
		];
		if(helpAttempts >= r.length)
			helpAttempts=0;
		helpAttempts += 1;
		return r[helpAttempts];
	}

	function DisplayAbout(){
		return "What about Bob?";
	}

	function OpenFile(fileName){
		var fn = fileName.split(" ")[1];
		return mockData.files[fn];
	}

	function Show(itemCmd){
		var item = itemCmd.split(" ")[1].toLowerCase();
		RenderTemplate(templates[item], mockData[item]);
		//return templates[item] mockData[item];
	}

	var cmds = {
		help:DisplayHelp,
		ls:ListFiles,
		open:OpenFile,
		show:Show,
		about:DisplayAbout
	};

	function parseInput(){
		var kz =Object.keys(cmds);
		let cmdFound = false;
		for(var i=0; i < kz.length; i++){
			var cmd = kz[i];
			if(latestInput.indexOf(cmd) != -1){
				cmdFound = true;
				console.log("!!!!");
				var parsedInput = latestInput.replace(" ","");
				console.log("command: " + cmd + " prsinput: " + parsedInput);
				cmdQueue.push(cmd);
				return cmds[cmd](latestInput);
			}
		}
		//clear value
		latestInput = "";
		if(!cmdFound){
			var sponses = ["Command not found...", "Sorry this isn't a chat interface... or is it?", "Ever use Linux?"];
			return sponses[Math.round(Math.random() * (sponses.length -1 ))];
		}
	}
	

	consoleInput.on('keydown', function(){
		latestInput = consoleInput.val();
		isTyping = true;

	});

	consoleInput.on('keyup', function(evt){
		latestInput = consoleInput.val();
		console.log(evt.keyCode);
		if(cmdQueue.length > 0){
			//down arrow
			if(evt.keyCode == 40){
				
				lastCmd -= 1;
				if(lastCmd <0)
					lastCmd = cmdQueue.length;
				consoleInput.val(cmdQueue[lastCmd]);
				
			}
			//up arrrow
			else if(evt.keyCode == 38){

				lastCmd += 1;
				if(lastCmd > cmdQueue.length)
					lastCmd = 0;
				consoleInput.val(cmdQueue[lastCmd-1]);
			}
		}
		//enter
		if(evt.keyCode == 13){
			var resp = parseInput();
			//add quips here form time to time
			consoleSpace.append($('<p class="console-line">'+resp+'</p>'));
			consoleInput.val("");
		}

		isTyping = false;
	});

	var crs = "";
	/*
	var cursorBlinkInterval = setInterval(function(){
		crs = crs == "--" ? "|" : "--"; 
		cursorSpot.html(crs);
	}, 250);
	*/

	
});