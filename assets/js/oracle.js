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

//vars for loading
var totalCount = 2;
var loadedCount = 0;
var lmBtn=false, rmBtn=false, mmBtn=false;


// standard global variables
var container, scene, camera, renderer, controls, stats, i=0, j=0;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var manager, iLoader, oLoader, matlib;

// custom global variables
var width = window.innerWidth;
var height = window.innerHeight;
var mesh;
var gridGeo;
var gridLines;
var dancer;
var cube;
var projector, mouse = new THREE.Vector2(), INTERSECTED, CURRENT, LAST;
var canvas1, context1, texture1;
var raycaster;
var selLineHeight = 50;
var depthTarget, depthMaterial;
var postprocessing = {};
var targetList = [];
var zardoz;

var cubesx = 25;
var cubesz = 25;
var cubeSize = 100;
var sep = 10;
var iter =0;
var cubeGridItems = [];
var allLinesX = [];
var allLinesY = [];
var lineSpeed = 0.75;
var mountains, sky;

init();
animate();



// FUNCTIONS
function init()
{
	// SCENE
	scene = new THREE.Scene();
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,5,75);
	camera.lookAt(scene.position);
	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true, alpha: true} );
	else
		renderer = new THREE.CanvasRenderer();

	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	//renderer.shadowMapEnabled = true;
	//renderer.shadowMapType = THREE.PCFShadowMap;
	//renderer.shadowMapSoft = true;

	container = document.getElementById( 'env' );
	container.appendChild( renderer.domElement );



	// LOADING MANAGER
	manager = new THREE.LoadingManager();
	manager.onProgress = function(item, loaded, total){
		//console.log(item, loaded, total);
		//console.log(loaded/total);
		loadedCount++;
		//progbar.style.width = ((loaded/total) * canvas1.width) + "px";
	}

	iLoader = new THREE.ImageLoader(manager);
	oLoader  = new THREE.OBJLoader(manager);


	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : '~'.charCodeAt(0) });


	// CONTROLS
	//controls = new THREE.OrbitControls( camera, renderer.domElement );
	//controls.minDistance = 40;
	//controls.maxDistance = 75;
	//controls.noKeys = true;


	raycaster = new THREE.Raycaster();

	// STATS
	//stats = new Stats();
	//stats.domElement.style.position = 'absolute';
	//stats.domElement.style.bottom = '0px';
	//stats.domElement.style.zIndex = 100;
	//container.appendChild( stats.domElement );


	// SKYBOX
	/*
	var imagePrefix = "./images/DarkSea-";
	var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
	var imageSuffix = ".jpg";
	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

	var urls = [];
	for (var i = 0; i < 6; i++)
		urls.push( imagePrefix + directions[i] + imageSuffix );

	var materialArray = [];
	for (var i = 0; i < 6; i++)
		materialArray.push( new THREE.MeshBasicMaterial({
			map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
			side: THREE.BackSide
		}));
	var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
	var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
	scene.add( skyBox );


	//ADD SOME FOG
	scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );*/


	var cubeMap = new THREE.CubeTexture( [] );
	cubeMap.format = THREE.RGBFormat;
	cubeMap.flipY = false;


	var cubeShader = THREE.ShaderLib['cube'];
	cubeShader.uniforms['tCube'].value = cubeMap;

	var skyBoxMaterial = new THREE.ShaderMaterial( {
		fragmentShader: cubeShader.fragmentShader,
		vertexShader: cubeShader.vertexShader,
		uniforms: cubeShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

	var skyBox = new THREE.Mesh(
		new THREE.BoxGeometry( 10000, 10000, 10000 ),
		skyBoxMaterial
	);

	//scene.add( skyBox );

	//add dynamic reflections

	cubeCamera = new THREE.CubeCamera(3, 10000, 512);
	scene.add(cubeCamera);
	var dynCubeTarget = cubeCamera.renderTarget;

	var envMap = cubeMap;
	var useDynamicMap = true;
	if(useDynamicMap)
		envMap = dynCubeTarget;


	var ambLight = new THREE.AmbientLight(0x222);
	scene.add(ambLight);



	var red_light = new THREE.PointLight(0xffffff);
	red_light.position.set(-10,0,-20);
	red_light.intensity = 1;
	scene.add(red_light);

	var blue_light = new THREE.PointLight(0x0044ee);
	blue_light.position.set(10,0,-20);
	blue_light.intensity = 1;
	scene.add(blue_light);


	////////////
	// CUSTOM //
	////////////



	var loader = new THREE.OBJLoader( manager );

	/*======================================== BG VIZ ===========================================*/

	//add bg shader sky
	/* turbidity: 10,
	reileigh: 2,
	mieCoefficient: 0.005,
	mieDirectionalG: 0.8,
	luminance: 1,
	inclination: 0.49, // elevation / inclination
	azimuth: 0.25, // Facing front,
	sun: !true */
	sky = new THREE.Sky();
	scene.add( sky.mesh );

	var skyU = sky.uniforms;
	skyU.turbidity.value = 10;
	skyU.reileigh.value = 2;
	skyU.luminance.value = 1;
	skyU.mieCoefficient.value = 0.005;
	skyU.mieDirectionalG.value = 0.8;
	skyU.azimuth = 0.25;
	skyU.inclination = 0.49

	var theta = Math.PI * (skyU.inclination - 0.5);
	var phi = 2 * Math.PI * (skyU.azimuth - 0.5);

	sky.uniforms.sunPosition.value.copy(new THREE.Vector3(0,10,-100));


	//make particle cloud

	var pGeo = new THREE.Geometry();
	var pMat = [], pColor, pSize,particles, pParams;

	for ( i = 0; i < 2000; i ++ ) {

		var vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2000 - 1000;
		vertex.y = Math.random() * 2000 - 1000;
		vertex.z = Math.random() * 2000 - 1000;

		pGeo.vertices.push( vertex );

	}

	pParams = [
		[ [1, 1, 0.5], 5 ],
		[ [0.95, 1, 0.5], 4 ],
		[ [0.90, 1, 0.5], 3 ],
		[ [0.85, 1, 0.5], 2 ],
		[ [0.80, 1, 0.5], 1 ]
	];

	for ( i = 0; i < pParams.length; i ++ ) {

		pColor = pParams[i][0];
		pSize  = pParams[i][1];

		pMat[i] = new THREE.PointCloudMaterial( { size: pSize } );

		particles = new THREE.PointCloud( pGeo, pMat[i] );

		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;

		scene.add( particles );

	}

	//make grid
	// each square
	var planeW = 50; // pixels
	var planeH = 50; // pixels
	var numW = 50; // how many wide (50*50 = 2500 pixels wide)
	var numH = 50; // how many tall (50*50 = 2500 pixels tall)


	//make lines
	var linegeo = new THREE.Geometry();
	var lineMat = new THREE.LineBasicMaterial( { color: 0xFF00B8 , opacity: 1, linewidth: 3, vertexColors: THREE.VertexColors } ); //0xFF0066

	var i=0;
	for (i = 0; i < planeW; i ++ ) {

		linegeo = new THREE.Geometry();
		linegeo.colors = [new THREE.Color( 0xFF0066 ), new THREE.Color( 0xFF0066 )];
		linegeo.vertices.push( new THREE.Vector3(-1500,-15, i * -planeW) );
		linegeo.vertices.push( new THREE.Vector3(1500,-15, i * -planeH) );

		var ln = new THREE.Line(linegeo, lineMat);
		ln.origZ = i * -planeW;
		scene.add(ln);
		allLinesX.push(ln);
	}
	for (i = -planeH/2; i < planeH/2; i ++ ) {

		linegeo = new THREE.Geometry();
		linegeo.colors = [new THREE.Color( 0xFF0066 ), new THREE.Color( 0xFF0066 )];
		linegeo.vertices.push( new THREE.Vector3(i * -planeW,-15, -1500) );
		linegeo.vertices.push( new THREE.Vector3(i * -planeH,-15, 1500) );

		var ln = new THREE.Line(linegeo, lineMat);
		ln.origZ = i * -planeW;
		scene.add(ln);
		allLinesY.push(ln);
	}


	//end make lines

	//add blue mountains
	var blk = new THREE.MeshBasicMaterial( { color: 0x000000, wireframe: false });
	var blueline = new THREE.LineBasicMaterial( { color: 0x0000FF, opacity: 0.9, linewidth: 5, vertexColors: THREE.VertexColors } );
	var bluewire = new  THREE.MeshBasicMaterial( { color: 0xaaeeFF, wireframe: true } ); //0xaaeeFF
	//rgb(60, 248, 173)
	loader.load( 'assets/models/mount.obj', function ( object ) {
		//console.log(object);
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material = blueline;
				mountains = child.geometry;
			}
		} );
		object.scale.set(90,90,90);
		object.position.set(0,-80,-1500);
		var clone = new THREE.Mesh(object.children[0].geometry, bluewire);
		clone.position.set(0,-80,-1500);
		clone.scale.set(90.1, 90.1, 90.1);
		scene.add( object);
		scene.add(clone);
	});

	//add ground plane?
	gridGeo = new THREE.PlaneGeometry( planeW*numW, planeH*numH, planeW, planeH );
	gridLines = new THREE.Mesh( gridGeo,  blk ); //new THREE.MeshBasicMaterial( { color: 0xFF0066, wireframe: true } )
	gridLines.lookAt(new THREE.Vector3( 0, 1, 0 ));
	gridLines.position.set(0,-20,0);
	scene.add(gridLines);


	/*======================================== END BG VIZ ===========================================*/


	/*======================================== ADD ZARDOZ ===========================================*/
	//var cb = new THREE.Mesh( new THREE.BoxGeometry( 25,25,25), new THREE.MeshBasicMaterial( { color: 0x0099FF, wireframe: true } ) );
	//scene.add(cb);

	var wrfrm = new THREE.MeshBasicMaterial( { color: 0xffffff, wireframe: true });

	var path = "assets/img/simple/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var reflectionCube = THREE.ImageUtils.loadTextureCube( urls );
	reflectionCube.format = THREE.RGBFormat;

	var refractionCube = new THREE.CubeTexture( reflectionCube.image, new THREE.CubeRefractionMapping() );
	refractionCube.format = THREE.RGBFormat;

	var chromeMat = new THREE.MeshLambertMaterial( { color: 0x333, ambient: 0x111, envMap: reflectionCube, morphTargets:true, refractionRatio: 0.95, combine: THREE.MixOperation, reflectivity: 0.8 } );
	//floating head

	var zMesh;
	var zGeoOpen;
	loader.load( 'assets/models/zardoz.obj', function ( object ) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				zMesh = child;
				zMesh.material = chromeMat;
			}
		} );

		//zardoz = object;
		//scene.add( zardoz);

		//load the open state of mouth

		loader.load( 'assets/models/zardoz_open.obj', function ( object ) {
			object.traverse( function ( child ) {
				if ( child instanceof THREE.Mesh ) {
					zGeoOpen = child.geometry;
				}
			} );
			//object.scale.set(10,10,10);

			//calc morph stuff
			zMesh.geometry.morphTargets.push({name:'closed', vertices: zMesh.geometry.vertices});
			zMesh.geometry.morphTargets.push({name:'open', vertices: zGeoOpen.vertices});
			zMesh.geometry.computeMorphNormals();

			zardoz = new THREE.Mesh(zMesh.geometry, chromeMat);
			zardoz.scale.set(10,10,10);
			scene.add(zardoz);

			//console.log(zMesh);
			zardoz.morphTargetInfluences[0] = 0;
			zardoz.morphTargetInfluences[1] = 1;

			// lens flares
			loadLensFlares();
			//end add flares==============


		} );

	} );


	/*======================================== END ZARDOZ ===========================================*/


	// initialize object to perform world/screen calculations
	projector = new THREE.Projector();


	//start the post shaders
	initPostprocessing();


	// when the mouse moves, call the given function
	container.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener('mousemove', onDocumentMouseMove, false );
}

function playMusic()
{
	$('.pause-play').click(function(evt){
		//console.log("click")
		if(dancer.isPlaying())
		{
			dancer.pause();
			$(this).css({backgroundPosition: "0px 0px"});
		}
		else
		{
			dancer.play();
			$(this).css({backgroundPosition: "20px 0px"});
		}
	});
	/*==========================================  MUSIC AND VIZ  ========================================================*/
	var playMusic = true;
	if(playMusic)
	{
		//stream track from soundcloud
		//get userid for tracks: http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/solinvicto&client_id=8e3835c213c1dfedec6032c761cb72a4
		var cid = '';
		var group = "solinvicto";
		var uid = "3199276"
		var tPath = "https://api.soundcloud.com/users/"+group+"/tracks.json?client_id="+cid; //this gets json of all tracks as well
		var songTitle = "Turtle Massacre"; //Sol Invicto - Initium II - 11.0
		var streamURL ="";

		//use sound cloud api to get data
		SC.initialize({
		  client_id: '8e3835c213c1dfedec6032c761cb72a4'
		});

		SC.get("/users/"+group+"/tracks", function(tracks){
		  	//console.log(tracks);
		  	for(var i=0; i < tracks.length; i++)
		  	{
		  		var track = tracks[i];
		  		//console.log(track.title);
		  		if(track.title.indexOf(songTitle) != -1)
		  		{
		  			//console.log(track);
		  			streamURL = track.stream_url;
		  			//set ui stuff
		  			$('#scLink').attr('href', track.user.permalink_url);
		  			$('#scImg').attr('src', track.user.avatar_url);
		  			$('#scTitle').html(track.user.username);
		  			$('#scTrack').html(track.title);
		  			break;
		  		}
		  	}

		  	//fallback to local song if other not working
		  	if(streamURL == "")
		  		streamURL = "./Panic_edit.mp3";
		  	else
		  		streamURL += "?client_id=8e3835c213c1dfedec6032c761cb72a4";

		  	//create instance of dancer.js
			dancer = new Dancer();
			var aud = new Audio();
			aud.volume = 0.1;
			aud.src = streamURL;//;
			dancer.load(aud);

			kick = dancer.createKick({
		      onKick: function ( mag ) {
		        //console.log('Kick!');
		        //console.log(mag);
		        if(postprocessing)
		        {
		        	postprocessing.rgbOff.uniforms['amount'].value = mag/100;
		        	postprocessing.rgbOff.uniforms['angle'].value = mag/10 * 360;
		        }

		      },
		      offKick: function ( mag ) {
		        //console.log('no kick :(');
		        if(postprocessing)
		        {
		        	postprocessing.rgbOff.uniforms['amount'].value = mag/10;
		        	postprocessing.rgbOff.uniforms['angle'].value = mag/2 * 360;
		        }
		      }
		    });

			// Let's turn this kick on right away
			kick.on();

			dancer.onceAt( 10, function() {
			// Let's set up some things once at 10 seconds
			}).between( 10, 60, function() {
			// After 10s, let's do something on every frame for the first minute
			}).after( 60, function() {
			// After 60s, let's get this real and map a frequency to an object's y position
			// Note that the instance of dancer is bound to "this"
			//if(object != undefined)
				//object.y = this.getFrequency( 400 );
			}).onceAt( 120, function() {
			// After 120s, we'll turn the kick off as another object's y position is still being mapped from the previous "after" method
			//kick.off();
			}).load( aud ); // And finally, lets pass in our Audio element to load

			dancer.play();

		});

	}

	/*========================================== END MUSIC AND VIZ  ========================================================*/
}

function loadLensFlares()
{

	var textureFlare0 = THREE.ImageUtils.loadTexture( "assets/img/lensflare/lensflare0.png" );
	var textureFlare2 = THREE.ImageUtils.loadTexture( "assets/img/lensflare/lensflare2.png" );
	var textureFlare3 = THREE.ImageUtils.loadTexture( "assets/img/lensflare/lensflare3.png" );

	addLight( 0.55, 0.9, 0.5, -0.4, 0.7, 0.8 );
	addLight( 0.08, 0.8, 0.5,  0.4, 0.7, 0.8 );

	function addLight( h, s, l, x, y, z ) {
		var light = new THREE.PointLight( 0xffffff, 1, 4500 );
		light.color.setHSL( h, s, l );
		zardoz.add(light);
		light.position.set( x, y, z );
		//scene.add( light );

		var flareColor = new THREE.Color( 0xffffff );
		flareColor.setHSL( h, s, l + 0.5 );

		var lensFlare = new THREE.LensFlare( textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor );

		lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
		//lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );
		//lensFlare.add( textureFlare2, 512, 0.0, THREE.AdditiveBlending );

		lensFlare.add( textureFlare3, 60, 0.6, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 0.7, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 120, 0.9, THREE.AdditiveBlending );
		lensFlare.add( textureFlare3, 70, 1.0, THREE.AdditiveBlending );

		lensFlare.customUpdateCallback = lensFlareUpdateCallback;
		zardoz.add(lensFlare);
		lensFlare.position.copy( light.position );

		//scene.add( lensFlare );

	}
}

function lensFlareUpdateCallback( object ) {

	var f, fl = object.lensFlares.length;
	var flare;
	var vecX = -object.positionScreen.x * 2;
	var vecY = -object.positionScreen.y * 2;

	for( f = 0; f < fl; f++ ) {
		   flare = object.lensFlares[ f ];
		   flare.x = object.positionScreen.x + vecX * flare.distance;
		   flare.y = object.positionScreen.y + vecY * flare.distance;
		   flare.rotation = 0;
	}

	object.lensFlares[ 2 ].y += 0.025;
	object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );

}


function onDocumentMouseMove( event )
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();

	// update sprite position
	//sprite1.position.set( event.clientX, event.clientY - 20, 0 );

	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	var highlightHover = false;
	if(highlightHover)
	{

		//highlight any objects that are hovered over
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		// create an array containing all objects in the scene with which the ray intersects
		// only for the list of targets
		var intersects = ray.intersectObjects( targetList ); //scene.children

		if(intersects[0] != INTERSECTED)
		{

			// if there is one (or more) intersections
			if ( intersects.length > 0)
			{
				//reset all object emissive colors
				for(var z =0; z < targetList.length; z++)
				{
					if(targetList[z].name != "" && "emissive" in targetList[z].material)
						targetList[z].material.emissive.setRGB(0,0,0);
				}

				if(intersects[0].object.name.indexOf('child') != -1)
				{
					INTERSECTED = intersects[0].object.parent;
					INTERSECTED.traverse(function(child){
						if(child instanceof THREE.Mesh)
							if("emissive" in child.material)
								if(child.material.emissive.b == 0)
									child.material.emissive.setRGB(0.1, 0.3, 0.4);
					});
				}
				else
				{
					INTERSECTED = intersects[0].object;
					if(INTERSECTED.material.emissive != undefined && INTERSECTED.material.emissive.b == 0)
						INTERSECTED.material.emissive.setRGB( 0.1, 0.3, 0.4);
				}
			}
		}
	}
}


function onDocumentMouseUp( event )
{
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	// event.preventDefault();

	//console.log("Click.");
	cubeCamera.updateCubeMap(renderer, scene);

	lmBtn = rmBtn = mmBtn = false;
	switch(event.which)
	{
		case 1:
            //alert('Left Mouse button pressed.');
            lmBtn = true;
            break;
        case 2:
            //alert('Middle Mouse button pressed.');
            mmBtn = true;
            break;
        case 3:
            //alert('Right Mouse button pressed.');
            rmBtn = true;
			break;
		default:
			alert('You have a strange Mouse!');
	}

	//console.log(camera.position);
	//console.log(camera.rotation);

	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	// find intersections


	if(lmBtn)
	{
		// create a Ray with origin at the mouse position
		//   and direction into the scene (camera direction)
		var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
		projector.unprojectVector( vector, camera );

		var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

		// create an array containing all objects in the scene with which the ray intersects
		// only for the list of targets
		var intersects = ray.intersectObjects( targetList ); //scene.children

		//reset all object emissive colors
		for(var z =0; z < targetList.length; z++)
		{
			if("emissive" in targetList[z].material)
				if(targetList[z].name != "")
					targetList[z].material.emissive.setRGB(0,0,0);
		}

		//console.log(intersects.length);

		// if there is one (or more) intersections
		if ( intersects.length > 0 )
		{

			//console.log(CURRENT);

			//console.log("Hit @ " + toString( intersects[0].point ) );
			//if(CURRENT === undefined || CURRENT === null)

			//select the parent object if a child mesh has been selected
			if(intersects[0].object.name.indexOf('child') != -1)
				CURRENT = intersects[0].object.parent;
			else
				CURRENT = intersects[0].object;

			//close ui first
			closeItem(ux);
			if(LAST != CURRENT)
			{

				//create a new tween
				//==============================
				var start = camera.position;
				var offset = new THREE.Vector3(0, 5, -12); //CURRENT.geometry.boundingBox.max.z
				//console.log(bnds);
				var cp = intersects[0].point;
				console.log(cp);

				//tween the controls target first
				var ct = new TWEEN.Tween(controls.target).to(cp, 1200);
				ct.easing(TWEEN.Easing.Cubic.Out);
				ct.start();

				//controls.target.copy(cp);
				//controls.enabled = false;
				var end = new THREE.Vector3().addVectors(cp, offset);
				var mt = new TWEEN.Tween(start).to(end, 2500);
				mt.easing(TWEEN.Easing.Cubic.InOut);
				mt.onUpdate(function(){
					camera.position = start;
				});
				mt.onComplete(function(){
					setCurrentSelected();
					//controls.autoRotate = true;
					//controls.enabled = true;
				});
				mt.start();
				//==============================

				//console.log(CURRENT);
				/*if(CURRENT == cubeOutline)
				{
					cubeOutline.visible = !cubeOutline.visible;
					cubeSprite.visible = cubeOutline.visible;
				}*/

				LAST = CURRENT;
			}

		}
	}

}


function toString(v) { return "[ " + v.x + ", " + v.y + ", " + v.z + " ]"; }


function initPostprocessing() {

	renderer.autoClear = true;
	var renderPass = new THREE.RenderPass( scene, camera );

	var rgbPass = new THREE.ShaderPass( THREE.RGBShiftShader );
	rgbPass.uniforms[ 'amount' ].value = -0.0055;

	//var bloomPass = new THREE.BloomPass(0.39); //strength, kernel, sigma, res | 0.25, 25, 4, 256


	var bokehPass = new THREE.BokehPass( scene, camera, {
		focus: 		1.11,
		aperture:	0.05,
		maxblur:	0.011,
		aspect: 0.4,
		width: width,
		height: height
	});

	//var glitchPass = new THREE.GlitchPass();


	//bloomPass.renderToScreen = true;
	//rgbPass.renderToScreen = true;

	bokehPass.renderToScreen = true;
	//glitchPass.renderToScreen = true;




	var composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderPass );
	composer.addPass( rgbPass );
	//composer.addPass( glitchPass );
	composer.addPass( bokehPass );
	//composer.addPass( bloomPass );

	//composer.addPass( ssaoPass );



	postprocessing.composer = composer;
	postprocessing.rgbOff = rgbPass;
	//postprocessing.bloom = bloomPass;
	postprocessing.bokeh = bokehPass;

}


function animate()
{
    requestAnimationFrame( animate );
	render();
	update();
}


function update()
{
	//update any tweens
	TWEEN.update();

	if ( keyboard.pressed(13) )
	{
		// do something
		console.log("pressed enter");
	}


	var time = Date.now();
	var timer = time * 0.0001;

	var speed = 10;
	var cscale = 300;
	var waveSeed = 5;
	var waveIntensifier = 10;
	var waveDistruptX = 5;
	var waveDistruptY = 5;
	var waveDistruptZ = 5;
	var itemScale = 0.5;

	var animateCubes = true;
	/*
	if(animateCubes)
	{
		iter=0;
		for(var i=0; i < cubesx; i++)
		{
			for(var j=0; j < cubesz; j++)
			{
				var cItem = cubeGridItems[iter++];
				//var xVal = (Math.sin(i + timer) * waveDistruptX) + (Math.sin((j + timer) * waveDistruptY));
				var yVal = (Math.sin((i + timer * speed) * waveDistruptX)) + (Math.sin((j + timer * speed) * waveDistruptY));
				//var zVal = (Math.sin(timer) * waveDistruptZ) + (Math.sin(timer) * waveDistruptZ);

				cItem.position.set(cItem.position.x,  ((yVal/50) * waveIntensifier) + cItem.position.y , cItem.position.z);

				//cItem.position.set(((xVal/50) * waveIntensifier) + cItem.position.x, ((yVal/50) * waveIntensifier) + cItem.position.y, ((zVal/25) * (waveIntensifier/2)) + cItem.position.z);
				var sv = ((Math.sin(timer * (i + j)) * itemScale) * 0.5) + 1;
				cItem.scale.set(sv,sv,sv);
			}
		}
	}*/

	/*
	if(mountains != undefined)
	{
		var wv = dancer.getSpectrum();
		var speed = 10;
		for(var i=0; i < mountains.vertices.length; i++)
		{

			for(var j =0; j < wv.length/128; j++)
			{
				mountains.vertices[i].x = Math.sin(timer * (j * speed));

				mountains.vertices[i].z = Math.sin(timer * (i * speed));
				mountains.verticesNeedUpdate = true;

			}
			mountains.vertices[i].y += Math.sin(time * wv[i]);
			mountains.verticesNeedUpdate = true;
		}
	}*/



	lineSpeed = 0.75;
	for(var k =0; k < allLinesX.length; k++)
	{
		allLinesX[k].position.z += lineSpeed;
		if(allLinesX[k].position.z >= 50)
		{
			allLinesX[k].position.z = -50;
		}
	}



	//bob head
	if(zardoz != undefined)
	{
		zardoz.position.y = Math.sin(time * 0.001);
		zardoz.rotation.x = (Math.sin(time * 0.0009) * 0.02);


	    //zardoz.morphTargetInfluences[0] = Math.sin(time * 0.008)
	    //fake talk test
	    zardoz.morphTargetInfluences[1] = talkValue;// Math.sin(time * 0.008);
	}

	if(camera != undefined && controls == undefined)
	{
		camera.position.x = Math.sin(time * 0.0007) * 2;
		camera.position.y = Math.sin(time * 0.0005);
		camera.rotation.z = (Math.sin(time * 0.0006) * 0.02);
	}

	//move particles

	for ( i = 0; i < scene.children.length; i ++ ) {
		var object = scene.children[ i ];
		if ( object instanceof THREE.PointCloud ) {
			object.rotation.x = -(timer * ( i < 4 ? i + 1 : - ( i + 1 ) )) * 0.04;
		}

	}

	if(controls != undefined)
		controls.update();

	//stats.update();
}

function render()
{

	renderer.autoClear = false;
	//scene.overrideMaterial = depthMaterial;
	renderer.render( scene, camera);
	//renderer.render( scene, camera, depthTarget, true);

	//scene.overrideMaterial = null;
	renderer.autoClear = true;


	postprocessing.composer.render();

	//renderer.render( scene, camera );
}


