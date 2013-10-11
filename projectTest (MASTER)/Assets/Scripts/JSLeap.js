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
var cGrabbed:Grab;
var hovered = false;
var grabOffset:Vector3;
//These variables actually make sense to modify. Maybe a convention would be to precede them?
var grabDist = 3.0;
var spinFactor = 3.0;
var thumbTolerance = 60;
var keySpeed = 1;

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
	if (fingerCount <= 2 && palmCount == 2 && diff < Mathf.PI/4) {
		table.transform.Rotate(Vector3.down * diff * 180/Mathf.PI * spinFactor);
		Debug.DrawLine(P1,P2,Color.red);
	}
	//
	//Grab Controls
	//
	
	
	var hit : RaycastHit;
	if(cGrabbed != null) {
		cGrabbed.gameObject.transform.position = palms[0].transform.position + grabOffset;
		if (primCount >3) {
			cGrabbed.grabbed = false;
			cGrabbed = null;
		}
	}
	if (cGrabbed == null && primCount>3 && Physics.Raycast(palms[0].transform.position,Vector3.down, hit, 3.0)) {
		hit.transform.gameObject.GetComponent(typeof(Grab)).hover();
	}
	
	if (cGrabbed == null && primCount <=2) {
		var grabby = GameObject.FindGameObjectsWithTag("Grabby");
		var bestCount:float = 0;//Return the 'most selected' object, i.e., that which the palm has most hovered over
		var bestGrab:Grab;
		var bestObj:GameObject;
		for (var grabPotential:GameObject in grabby) {
			var tmpGrab:Grab = grabPotential.GetComponent(typeof(Grab));
			
			if(tmpGrab.hoverCount>bestCount) {
				bestObj = grabPotential;
				bestCount = tmpGrab.hoverCount;
				bestGrab = tmpGrab;
			}
			//break;
		}
		if(bestCount>0) {
			if(bestGrab.dupable) {
				 
				var newObj:GameObject = Instantiate(bestObj,bestObj.transform.position,Quaternion.EulerAngles(0,0,0));
				newObj.transform.parent = table.transform;
				newObj.GetComponent(typeof(Grab)).dupable = false;
				newObj.GetComponent(typeof(Grab)).grabbed = true;
				cGrabbed = newObj.GetComponent(typeof(Grab))	;
				grabOffset = bestGrab.gameObject.transform.position - palms[0].transform.position;
			} else {
				cGrabbed = bestGrab;
				grabOffset = bestGrab.gameObject.transform.position - palms[0].transform.position;
			}
		}
	}
	if(false && palmCount ==1 ) { //This is stupid. All of this is stupid (unfinished)
		if(primThumbStableCount < 5 || primCount<=3) {
			
			if (Physics.Raycast(palms[0].transform.position,Vector3.down, hit, 40.0)) {
				if(hit.transform.gameObject == primCurrentGrab) {
		
					//var ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
					//ball.layer = 2;
					//var scale = Random.RandomRange(.05,.5);
					//ball.transform.localScale = Vector3(scale,scale,scale);
					//ball.transform.position = hit.point;
					//Debug.Log(hit.transform.position);
					Debug.DrawLine(hit.transform.position,palms[0].transform.position,Color.blue);
					primGrabStability += 1;
					if(primGrabStability >30) {
						primGrabStability = 30;
					}
				} else {
					primGrabStability -= 5;
					if(primGrabStability < 0) {
						primGrabStability = 0;
						primCurrentGrab = hit.transform.gameObject;
											}
				}
			} else {
				
			}
			if(primGrabStability > 0) {
				Debug.DrawRay(primCurrentGrab.transform.position,Vector3.down,Color.green);
				primCurrentGrab.transform.position = palms[0].transform.position + Vector3.down*2;
			}
		} else {
			primCurrentGrab = null;
			primGrabStability = 0;
		}
		if (secThumbStableCount > 30) {
			
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
