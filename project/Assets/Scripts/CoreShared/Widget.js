#pragma strict

var jsLeap: JSLeap;

var cSelected: Selector;
var cTool:int;
var grabbed = false;

var handPoint: Vector3;
var lastPos: Vector3;
var cAngle:float;
var anchorRot:Quaternion;
var lastRot:Quaternion;

var firstGrabFrame:boolean = true;
// var pull:Pull;

function Start() {
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
	anchorRot = transform.rotation;
}


function Update() {
	if (grabbed) {
		if (firstGrabFrame) {
			var P1 = handPoint;
			var P2 = transform.position;
			cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
			firstGrabFrame = false;
		}

		//Calculate and rotate the anchorRot (the absolute rotation of the object per the hand)
		P1 = handPoint;
		P2 = transform.position;
		Debug.DrawLine(P1, P2, Color.red);
		var newAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
		var diff = newAngle - cAngle;
		var spinAmt = Quaternion.AngleAxis(diff * 180 / Mathf.PI, Vector3.down);
		anchorRot *= spinAmt;
		transform.rotation *= spinAmt;
		turnObj(spinAmt);
		cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
		lastRot = transform.rotation;
		return;
	} else {

		firstGrabFrame = true;
	}
	if (cSelected == null ) return;
	transform.position = cSelected.transform.position + Vector3.up * -.25;
}

function handUpdate(pos: Vector3,rot: float) {
	handPoint = pos;
}

function deselect() {
	cSelected = null;
	transform.position.y = -15;

}

function select(what:Selector) {
	cSelected = what;
	transform.position = what.transform.position + Vector3.up * -.25;
}

function turnObj(amt: Quaternion) {
	if (cSelected != null) {
		cSelected.transform.rotation *= amt;
	}
}