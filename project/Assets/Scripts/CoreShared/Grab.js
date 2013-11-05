#pragma strict
var grabbed = false;
// var throwable=false;

var jsLeap:JSLeap;
var anchorPoint:Vector3;
var v:Vector3;
var offset:Vector3;
var rotOffset:float;
var lastPos:Vector3;
var grabPow:int;
var throwPow:int;
var firstGrabFrame = true;
var snapPoints = new Array();
var snapAngles = new Array();
var cubeSize = .5;

function Start () {
	cubeSize = .4;
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
}
function Update() {
	if (grabbed) {
		if (!firstGrabFrame) {
			//Build snapPoint list
			
			snapPoints = new Array();
			var grabby = GameObject.FindGameObjectsWithTag("Grabby");
			for (var grabObj:GameObject in grabby) {
				if(grabObj == gameObject) break;
				snapPoints.push(grabObj.transform.position+grabObj.transform.up*cubeSize);
				snapPoints.push(grabObj.transform.position-grabObj.transform.up*cubeSize);
				snapPoints.push(grabObj.transform.position+grabObj.transform.right*cubeSize);
				snapPoints.push(grabObj.transform.position-grabObj.transform.right*cubeSize);
				snapPoints.push(grabObj.transform.position+grabObj.transform.forward*cubeSize);
				snapPoints.push(grabObj.transform.position-grabObj.transform.forward*cubeSize);
				snapAngles.push(grabObj.transform.rotation);
				snapAngles.push(grabObj.transform.rotation);
				snapAngles.push(grabObj.transform.rotation);
				snapAngles.push(grabObj.transform.rotation);
				snapAngles.push(grabObj.transform.rotation);
				snapAngles.push(grabObj.transform.rotation);
			}
			for (var snapPoint:Vector3 in snapPoints) {
				Debug.DrawLine(snapPoint,snapPoint+Vector3.up*.05,Color.red);
			}
		}

		if (v.magnitude <= .001) {
			lastPos = transform.position;
			v = new Vector3(0, 0, 0);
		}

		

		//transform.position = anchorPoint; //This would be absolute positioning
		var grabFriction = .94;
		var diff: Vector3 = (transform.position - anchorPoint);
		var grabPow = 1.3;
		transform.position -= (diff * Mathf.Pow(diff.magnitude, grabPow) * 0.05); //Spring
		transform.position += v;

		//
		//SNAP HERE
		//

		if (transform.position.y < 1.01 && transform.position.y > .99) {
			// Debug.Log("SNAP");
			transform.position.y = 1;
			lastPos = transform.position;
		}
		if(transform.position.y < 3) {
			transform.position.y = 3;
		}
		for (var i = 0;i<snapPoints.length;i++) {
			if(snapD(transform.position,snapPoints[i])) {
				transform.position = snapPoints[i];
				transform.rotation = snapAngles[i];
				lastPos = transform.position;
			}
		}

		//
		//
		//

		v = (transform.position - lastPos) * grabFriction;
		lastPos = transform.position;
		return;
	} else {
		firstGrabFrame = true;
		// if (!(jsLeap.fingerCount <= 2 && jsLeap.palmCount == 2) && throwable) { //if the user isn't spinning the table, ghetto check
		// 	//Apply inertial effects
		// 	transform.position += v;
		// 	var throwFriction = .91;
		// 	v = (transform.position - lastPos) * throwFriction;
		// }
		lastPos = transform.position;
	}
}


function handUpdate(pos: Vector3,rot:float) {

	// anchorPoint = pos+offset;
	anchorPoint = pos + Vector3.down*.5;
	//transform.rotation.eulerAngles.y = rot+rotOffset; //rotate with the palm, interferes with rotate snaps
}
function snapD(P1:Vector3,P2:Vector3) {
	var tolerance = .03;
	var diff:Vector3 = P2-P1;
	if(diff.sqrMagnitude<tolerance) return true;
	return false;
}