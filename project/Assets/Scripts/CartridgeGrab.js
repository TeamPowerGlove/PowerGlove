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
var snapCube:GameObject;
var cartridge:GameObject;

function Start () {
	cubeSize = .35;
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
	snapCube = GameObject.Find("SnapCube");
	for(var child : Transform in transform) {
		cartridge = child.gameObject;
	}
}
function Update() {
	if (grabbed) {
		if (!firstGrabFrame) {
		}

		if (v.magnitude <= .001) {
			lastPos = transform.position;
			v = new Vector3(0, 0, 0);
		}

		firstGrabFrame = false;

		//transform.position = anchorPoint; //This would be absolute positioning
		var grabFriction = .6;
		var diff: Vector3 = (transform.position - anchorPoint);
		var grabPow = 1;
		transform.position -= (diff * Mathf.Pow(diff.magnitude, grabPow) * 0.3); //Spring
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
		var tolerance = .8;
		diff = snapCube.transform.position-cartridge.transform.position;
		if(diff.sqrMagnitude<tolerance) {
			transform.position = snapCube.transform.position+new Vector3(0,1.1,0);
			cartridge.transform.rotation = snapCube.transform.rotation;
			lastPos = transform.position;
		}	
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
	anchorPoint = pos + Vector3.down*.8;
	//transform.rotation.eulerAngles.y = rot+rotOffset; //rotate with the palm, interferes with rotate snaps
}
function snapD(P1:Vector3,P2:Vector3) {

}