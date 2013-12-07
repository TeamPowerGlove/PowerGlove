#pragma strict
//A new comment
var grabDist = 3.0;
var spinFactor = 1.0;
var thumbTolerance = 60;
var keySpeed = 1;
var touchPoof:GameObject;
@HideInInspector

var cAngle:float = 0; //c...urrent
var controlScript:GameObject;
var leapController:LeapUnityBridge;
var table:GameObject;

var hands:GameObject[]; //Parent objects
var palms:GameObject[]; //Palm objects
var thumbs:GameObject[]; //Detected
var fingers:GameObject[];
var primFingers:GameObject[];
var secFingers:GameObject[];
var fingerCount:int;
var palmCount:int;
var sinceSelected:int;

var hasThumb:boolean[] = [false,false];

var fCount:int[] = [0,0]; //FingerCounts

var open:boolean[] = [false,false];
var hasPalm:boolean[] = [false,false];

var nowOpen:boolean[] = [false,false]; //These are single frame flags
var nowGrab:boolean[] = [false,false]; 
var nowClosed:boolean[] = [false,false];  

var primPointer:GameObject[]; //For drawing

var thumbStability:int[] = [0,0];

var cSelector:Selector[];

var tapID = 0;
var widget:Widget;

var tapsOverTime:float = 0;

var P1:Vector3;
var P2:Vector3;


function Start () {
	hands = leapController.behavior.m_hands;
	palms = leapController.behavior.m_palms;
	fingers = leapController.behavior.m_fingers;
	cSelector = new Selector[2];
	thumbs = new GameObject[2];
}

function Update () {
	//
	//Clear last frames data and declare variables
	//
	primFingers = new GameObject[5];
	secFingers = new GameObject[5];
	fingerCount = 0;
	fCount = [0,0];
	hasThumb = [false,false];
	nowOpen = [false,false];
	nowClosed = [false,false];
	palmCount = 0;
	P1 = palms[0].transform.position;
	P2 = palms[1].transform.position;
	sinceSelected ++;

	//
	//Count the active fingers and palms
	//
	for(var finger:GameObject in fingers) {
		var parent = finger.transform.parent;
		if (parent.name != "Unknown Hand") {
			fingerCount ++;
		} else continue;
		if (parent.name == "Primary Hand") {
			primFingers[fCount[0]] = finger;
			fCount[0] ++;
		} else if (parent.name == "Secondary Hand") {
			secFingers[fCount[1]] = finger;
			fCount[1] ++;
		}
	}
	
	if (palms[0].transform.parent.name != "Unknown Hand") {
		palmCount ++;
		hasPalm[0] = true;
		if(fCount[0]>2) {
			if(!open[0]) {
				open[0] = true;
				nowOpen[0] = true;
			}
		} else {
			if(open[0]) {
				open[0] = false;
				nowClosed[0] = true;
				Debug.Log("!!!");
			} 
		}
	} else {
		hasPalm[0] = false;
		cSelector[0] = null;
	}
	if (palms[1].transform.parent.name != "Unknown Hand") {
		palmCount ++;
		hasPalm[1] = true;
		if(fCount[1]>2) {
			if(!open[1]) {
				open[1] = true;
				nowOpen[1] = true;
			}
		} else {
			if(open[1]) {
				open[1] = false;
				nowClosed[1] = true;
			} 
		}
	} else {
		hasPalm[1] = false;
		cSelector[1] = null;
	}


	//Rotate table
	var newAngle = Mathf.Atan2(P2.z-P1.z,P2.x-P1.x);
	var diff = newAngle - cAngle ;
	if (palmCount == 2 && !open[0] && !open[1] && ((!cSelector[0] && !cSelector[1]) || sinceSelected<5)) {
		sinceSelected = 0;
		widget.deselect();
		table.transform.Rotate(Vector3.down * diff * 180/Mathf.PI * spinFactor);
		Debug.DrawLine(P1,P2,Color.red);
	}

	//Respond and dispatch for gestures
	if (tapID != leapController.behavior.gestureTapped) {
		tapID = leapController.behavior.gestureTapped;
		tapsOverTime++;
	}
	if(leapController.behavior.gestureCircled) {
		leapController.behavior.gestureCircled = false;
		widget.circle();
	}
	tapsOverTime -= .05;
	if (tapsOverTime > 3) {
		tapsOverTime = 3;
		widget.deselect();
	}

	//Thumb angle checks
	thumbCheck();
	
	//Thumb Stability checks
	stabilityCheck(0);
	stabilityCheck(1);

	//Dispatches to the selector scripts
	grabControl(0);
	grabControl(1);

	//Keyboard Control
	table.transform.Rotate(Vector3.down * Input.GetAxis ("Horizontal") * keySpeed);
	cAngle = newAngle;
}

function grabControl(palm:int) {
	//Raycasting and modifying cSelector
	var hit: RaycastHit;
	if (cSelector[palm]) {
		cSelector[palm].handUpdate(palms[palm].transform.position,palms[palm].transform.rotation.eulerAngles.y);
		if (open[palm]) {
			cSelector[palm].release();
			cSelector[palm] = null;
		}
	} else {
		if (!cSelector[palm] && hasPalm[palm] && open[palm]) {
			if (Physics.Raycast(palms[palm].transform.position, -palms[palm].transform.up, hit, 5.0)) {
				var tmpSelector: Selector;
				tmpSelector = hit.transform.gameObject.GetComponent(Selector);
				if (!tmpSelector) {
					if(hit.transform.parent) {
						tmpSelector = hit.transform.parent.gameObject.GetComponent(Selector);
					}
				}
				if (!tmpSelector) {
					if(hit.transform.parent.parent) {
						tmpSelector = hit.transform.parent.parent.gameObject.GetComponent(Selector);
					}
				}
				if (tmpSelector) {
					tmpSelector.hover(palm);
					Instantiate(touchPoof,hit.point,Quaternion.identity);
				}
			}
		}
		if (!cSelector[palm] && nowClosed[palm]) {
			
			var selectables = GameObject.FindGameObjectsWithTag("Selectable");
			var bestCount: float = 0; //Return the 'most selected' object, i.e., that which the palm has most hovered over
			var best: Selector;
			var bestObj: GameObject;
			for (var potential: GameObject in selectables) {
				var tmpSelectable: Selector = potential.GetComponent(typeof(Selector));
				if(!tmpSelectable || tmpSelectable.grabbed) continue;
				Debug.Log(tmpSelectable.hoverBy + " " + palm);
				if(tmpSelectable && tmpSelectable.hoverBy != palm) continue;
				var tmpHover = tmpSelectable.hoverCount;
				if (tmpHover > bestCount) {
				Debug.Log("grab");
					bestObj = potential;
					bestCount = tmpHover;
					best = tmpSelectable;
				}
			}
			if (bestCount != 0) { //An object is to be grabbed
				sinceSelected = 0;
				if (best.copy) {
					var newObj: GameObject = Instantiate(bestObj, bestObj.transform.position, bestObj.transform.rotation);
					newObj.transform.parent = table.transform;
					cSelector[palm] = newObj.GetComponent(Selector);
					cSelector[palm].copy = false;
					cSelector[palm].handUpdate(palms[palm].transform.position, palms[palm].transform.rotation.eulerAngles.y);
					cSelector[palm].grab();
				} else {
					cSelector[palm] = best;
					cSelector[palm].handUpdate(palms[palm].transform.position, palms[palm].transform.rotation.eulerAngles.y);
					cSelector[palm].grab();
				}
			} else { //nothing was selected
				widget.deselect();
			}
		}
	}
}

function thumbCheck() {
	//
	//Check for Thumbs
	//
	
	//The assumption about thumbs is:
	//If a finger has no fingers within thumbTolerance degrees of it, then it must be a thumb
	
	//Primary Hand
	if (fCount[0] >= 2) {
		for (var i = 0;i<fCount[0];i++) {
			var isThumb = true;
			for (var j = 0;j<fCount[0];j++) {
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
				hasThumb[0] = true;
				thumbs[0] = primFingers[i];
			}
		}
	}
	//Secondary Hand
	if (fCount[1] >= 2) {
		for ( i = 0;i<fCount[1];i++) { //For each finger
			isThumb = true;
			for ( j = 0;j<fCount[1];j++) { //Test against all fingers
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
				hasThumb[1] = true;
				thumbs[1] = secFingers[i];
			}
		}
	}
}

function stabilityCheck(palm:int) {
	//
	//Stability Tests
	//
	// if(!hasThumb[palm]) {
	// 	thumbStability[palm] -= 5;
	// 	if (thumbStability[palm] <= 0) {
	// 		thumbStability[palm] = 0;
	// 	}
	// } else {
	// 	thumbStability[palm] ++;
	// 	if(thumbStability[palm] > 50) {
	// 		thumbStability[palm] = 50;
	// 	}
	// }
}