#pragma strict
//A new comment
//These variables are public so its easier to debug
var cAngle:float = 0; //c...urrent
var controlScript:GameObject;
var leapController:LeapUnityBridge;
var table:GameObject;
var hands:GameObject[];
var palms:GameObject[];
var fingers:GameObject[];
var primFingers:GameObject[];
var secFingers:GameObject[];
var fingerCount:int;
var palmCount:int;
var primHasThumb:boolean;
var secHasThumb:boolean;
var primThumb:GameObject;
var secThumb:GameObject;
var primCount:int;
var secCount:int;
var primPointer:GameObject;
var secPointer:GameObject;
var primThumbStableCount:int;
var secThumbStableCount:int;
var primCurrentGrab:GameObject;
var secCurrentGrab:GameObject;
var primGrabStability:int;
var secGrabStability:int;
var cGrab:Grab;
var cSpin:Spin;
var cType:int = -1;
var hovered = false;
var tapID = 0;
var widget:Widget;
var tapsOverTime:float = 0;
//These variables public and actually make sense to modify in real time. Maybe a convention would be to precede them?
var grabDist = 3.0;
var spinFactor = 3.0;
var thumbTolerance = 60;
var keySpeed = 1;
var tapPoof:Transform;

function Start () {
	//spinCube = GameObject.FindGameObjectsWithTag("LookCube");
	//controlScript = GameObject.Find("LeapController");
	hands = leapController.behavior.m_hands;
	palms = leapController.behavior.m_palms;
	fingers = leapController.behavior.m_fingers;
	
	
}

function Update () {
	//
	//Clear data and declare variables
	//
	primFingers = new GameObject[5];
	secFingers = new GameObject[5];
	fingerCount = 0;
	palmCount = 0;
	primCount = 0;
	secCount = 0;
	primHasThumb = false;
	secHasThumb = false;
	primThumb = null;
	secThumb = null;
	
	//
	//Count the active fingers and palms
	//
	for(var finger:GameObject in fingers) {
		var parent = finger.transform.parent;
		if (parent.name != "Unknown Hand") {
			fingerCount ++;
		} else continue;
		if (parent.name == "Primary Hand") {
			primFingers[primCount] = finger;
			primCount ++;
		} else if (parent.name == "Secondary Hand") {
			secFingers[secCount] = finger;
			secCount ++;
		}
	}
	
	if (palms[0].transform.parent.name != "Unknown Hand") palmCount ++;
	if (palms[1].transform.parent.name != "Unknown Hand") palmCount ++;
	

	
	//
	//Check for Thumbs
	//
	
	//The assumption about thumbs is:
	//If a finger has no fingers within thumbTolerance degrees of it, then it must be a thumb
	var P1 = palms[0].transform.position;
	var P2 = palms[1].transform.position;
	
	//Primary Hand
	if (primCount >= 2) {
		for (var i = 0;i<primCount;i++) {
			var isThumb = true;
			for (var j = 0;j<primCount;j++) {
				if (i == j) continue;
				var A = primFingers[i].transform.position;
				var B = primFingers[j].transform.position;
				//primPalm;
				var P1A:Vector3 = P1 - A;
				var P1B:Vector3 = P1 - B;
				
				Debug.DrawLine(P1,A,Color.blue);
				Debug.DrawLine(A,B,Color.blue);
				
				if (Vector3.Angle(P1A,P1B)<thumbTolerance) {
					isThumb = false;
					break;
				}
			}
			if(isThumb) {
				primHasThumb = true;
				primThumb = primFingers[i];
			}
		}
	}
	//Secondary Hand
	if (secCount >= 2) {
		for ( i = 0;i<secCount;i++) { //For each finger
			isThumb = true;
			for ( j = 0;j<secCount;j++) { //Test against all fingers
				if (i == j) continue;
				A = secFingers[i].transform.position;
				B = secFingers[j].transform.position;
				var P2A:Vector3 = P2 - A;
				var P2B:Vector3 = P2 - B;
				
				Debug.DrawLine(P2,A,Color.blue);
				Debug.DrawLine(A,B,Color.blue);
				
				if (Vector3.Angle(P2A,P2B)<thumbTolerance) {
					isThumb = false;
					break;
				}
			}
			if(isThumb) {
				secHasThumb = true;
				secHasThumb = secFingers[i];
			}
		}
	}
		
	//
	//Rotate table
	//
	var newAngle = Mathf.Atan2(P2.z-P1.z,P2.x-P1.x);
	var diff = newAngle - cAngle ;
	if (fingerCount <= 2 && palmCount == 2 && diff < Mathf.PI/4 && cType == -1) {
		table.transform.Rotate(Vector3.down * diff * 180/Mathf.PI * spinFactor);
		Debug.DrawLine(P1,P2,Color.red);
	}
	//
	//Respond to Taps (Instantiate dropped objects, smoke poofs, etc.)
	//
		if(tapID != leapController.behavior.gestureTapped) {
			tapID = leapController.behavior.gestureTapped;
			tapsOverTime ++;
		}
		tapsOverTime -= .05;
		if(tapsOverTime>3) {
			tapsOverTime = 3;
			Instantiate(tapPoof,palms[0].transform.localPosition, Quaternion.identity);
			widget.deselect();
			
		}
	//
	//Grab Controls - Raycasting and modfying cGrab, ...
	//


	var hit: RaycastHit;
	if (cType != -1) {
		//cGrab.gameObject.transform.position = palms[0].transform.position + grabOffset;
		if (cType == 0) cGrab.handUpdate(palms[0].transform.position,palms[0].transform.rotation.eulerAngles.y);
		if (cType == 1) cSpin.handUpdate(palms[0].transform.position,palms[0].transform.rotation.eulerAngles.y);

		if (primCount > 3) {
			if (cType == 0) {
				cGrab.grabbed = false;
				cGrab = null;
			} else if (cType == 1) {
				cSpin.grabbed = false;
				cSpin = null;
			}
			cType = -1;
		}
	}

	if (cType == -1 && primCount > 3) { //primary hover check

		if (Physics.Raycast(palms[0].transform.position, -palms[0].transform.up, hit, 5.0)) {
			var grab1: Grab = hit.transform.gameObject.GetComponent(typeof(Grab));
			var spin1: Spin = hit.transform.gameObject.GetComponent(typeof(Spin));
			var spin2: Spin = hit.transform.parent.gameObject.GetComponent(typeof(Spin));
			if (grab1 != null) grab1.hover();
			if (spin1 != null) spin1.hover();
			if (spin2 != null) spin2.hover();
		}
	}
	
	if (cType == -1 && secCount > 3) { //secondary hover check
		if (Physics.Raycast(palms[1].transform.position, -palms[0].transform.up, hit, 5.0)) {
			//hit.transform.gameObject.GetComponent(typeof(Grab)).hover();

		}
	}

	if (cType == -1 && primCount <= 2) {
		var grabby = GameObject.FindGameObjectsWithTag("Grabby");
		var spinny = GameObject.FindGameObjectsWithTag("Spinny");
		var bestCount: float = 0; //Return the 'most selected' object, i.e., that which the palm has most hovered over
		var bestGrab: Grab;
		var bestSpin: Spin;
		var bestObj: GameObject;
		var type: int = -1; //-1 = none 0 = grab 1 = spin
		for (var grabPotential: GameObject in grabby) {
			var tmpGrab: Grab = grabPotential.GetComponent(typeof(Grab));

			if (tmpGrab.hoverCount > bestCount) {
				bestObj = grabPotential;
				bestCount = tmpGrab.hoverCount;
				bestGrab = tmpGrab;
				type = 0;
			}
			//break;
		}
		for (var spinPotential: GameObject in spinny) {
			var tmpSpin: Spin = spinPotential.GetComponent(typeof(Spin));

			if (tmpSpin.hoverCount > bestCount) {
				bestObj = spinPotential;
				bestCount = tmpSpin.hoverCount;
				bestSpin = tmpSpin;
				type = 1;
			}
		}
		if (type >= 0) { //An object is to be grabbed
			if (type == 0 && bestGrab.dupable) { // only grabs can be duped

				var newObj: GameObject = Instantiate(bestObj, bestObj.transform.position, new Quaternion(0, 0, 0, 0));
				newObj.transform.parent = table.transform;
				newObj.GetComponent(typeof(Grab)).dupable = false;
				newObj.GetComponent(typeof(Grab)).grabbed = true;
				cGrab = newObj.GetComponent(typeof(Grab));
				var grabOffset = bestGrab.gameObject.transform.position - palms[0].transform.position;
				cGrab.handUpdate(palms[0].transform.position,palms[0].transform.rotation.eulerAngles.y);
				cGrab.offset = grabOffset;
				cGrab.rotOffset = palms[0].transform.rotation.eulerAngles.y;
				widget.select(newObj);
				cType = type;
			} else {
				if(type == 0) {
					cGrab = bestGrab;
					cGrab.grabbed = true;
					cGrab.dupable = false;
					cType = type;
					//Grab objects get an offset
					grabOffset = bestGrab.gameObject.transform.position - palms[0].transform.position;
					cGrab.offset = grabOffset;
					cGrab.rotOffset = palms[0].transform.rotation.eulerAngles.y;
					cGrab.handUpdate(palms[0].transform.position,palms[0].transform.rotation.eulerAngles.y);
					widget.select(bestGrab.gameObject);
				} else if (type == 1) {
					cSpin = bestSpin;
					cSpin.grabbed = true;
					cSpin.handUpdate(palms[0].transform.position,palms[0].transform.rotation.eulerAngles.y);
					cType = type;
				}
			}
		} else { //nothing was selected
			widget.deselect();
		}
	}
	
	//
	//Stability Tests
	//
	if(!primHasThumb) {
		primThumbStableCount -= 5;
		if (primThumbStableCount <= 0) {
			primThumbStableCount = 0;
		}
	} else {
		primThumbStableCount ++;
		if(primThumbStableCount > 50) {
			primThumbStableCount = 50;
		}
	}
	
	if(!secHasThumb) {
		secThumbStableCount -= 5;
		if (secThumbStableCount <= 0) {
			secThumbStableCount = 0;
		}
	} else {
		secThumbStableCount ++;
		if(secThumbStableCount > 50) {
			secThumbStableCount = 50;
		}
	}
	
	//Keyboard Control
	table.transform.Rotate(Vector3.down * Input.GetAxis ("Horizontal") * keySpeed);
	cAngle = newAngle;
}