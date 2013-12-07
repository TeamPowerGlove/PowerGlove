#pragma strict

var jsLeap: JSLeap;

var cSelected: Selector;
var cTool:int;
var grabbed = false;

var widgets:GameObject[];
var cWidget = -1;

var handPoint: Vector3;
var lastPos: Vector3;
var cAngle:float;
var cAngle3:Vector3;
var anchorAngle3:Vector3;
var anchorRot:Quaternion;
var startRot:Quaternion;
var lastRot:Quaternion;
var releaseRot:Quaternion;
var sinceLastCircle = 0;
var releaseTime:float;
var firstGrabFrame:boolean = true;
// var pull:Pull;

function Start() {
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
	anchorRot = transform.rotation;
	changeWidget();
}


function Update() {
	sinceLastCircle ++;
	if(sinceLastCircle>30) sinceLastCircle = 30;
	if (grabbed) {
		if (firstGrabFrame) {
			var P1 = handPoint;
			var P2 = transform.position;
			cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
			cAngle3 = new Vector3(P2.x-P1.x,P2.y-P1.y,P2.z-P1.z);
			firstGrabFrame = false;
			anchorRot = transform.rotation;
			startRot = cSelected.transform.rotation;

		}
		P1 = handPoint;
		P2 = transform.position;
		Debug.DrawLine(P1, P2, Color.red);
		//Calculate and rotate the anchorRot (the absolute rotation of the object per the hand)
		if(cWidget == 0 || cWidget == 2 || cWidget == 3 || cWidget == 4) {
			var newAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
			var diff = newAngle - cAngle;
			var spinAmt = Quaternion.AngleAxis(diff * 180 / Mathf.PI, Vector3.down);
			var tmp = new Vector3(0,-diff * 180 / Mathf.PI,0);
			anchorRot *= spinAmt;
			transform.rotation *= spinAmt;
			if (cSelected != null) {
				// cSelected.transform.rotation *= spinAmt;
				cSelected.transform.Rotate(tmp,Space.World);
			}
			cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
			lastRot = transform.rotation;
			return;
		} else if (cWidget == 1) {
			var newAngle3 = new Vector3(P2.x-P1.x,P2.y-P1.y,P2.z-P1.z);
			// var fromTo = Quaternion.FromToRotation(anchorRot.eulerAngles,newAngle3);
			var fromTo = Quaternion.FromToRotation(cAngle3,newAngle3);
			transform.rotation = fromTo;
			if (cSelected != null) {
				cSelected.transform.rotation = startRot;
				cSelected.transform.Rotate(fromTo.eulerAngles,Space.World);
			}
			return;
		}

	} else {
		if(firstGrabFrame == false) {
			//firstReleaseFrame
			var vec = cSelected.transform.localRotation.eulerAngles;
			vec.x = Mathf.Round(vec.x / 90) * 90;
			vec.y = Mathf.Round(vec.y / 90) * 90;
			vec.z = Mathf.Round(vec.z / 90) * 90;
			cSelected.transform.localRotation.eulerAngles = vec;
			releaseTime = Time.time;
			releaseRot = transform.rotation;
			firstGrabFrame = true;
		}
		if(cWidget == 1 && cSelected) {
			var speed = 3;
			var t = (Time.time-releaseTime)*speed;
			if(t>1) transform.rotation = Quaternion.identity;
			else {
				transform.rotation = Quaternion.Slerp(releaseRot,Quaternion.identity,Mathf.Sqrt(t));
			}
			startRot = cSelected.transform.rotation;
		}
	}
	if (cSelected == null ) return;
	transform.position = cSelected.transform.position + Vector3.up * -.25;
}

function handUpdate(pos: Vector3,rot: float) {
	handPoint = pos;
}

function deselect() {
	cSelected = null;
	grabbed = false;
	transform.position.y = -15;

}
function circle() {
	if(sinceLastCircle >25 && !grabbed) {
		sinceLastCircle = 0;
		changeWidget();
	}
}

function select(what:Selector) {
	cSelected = what;
	transform.position = what.transform.position + Vector3.up * -.25;
}
function changeWidget() {
	cWidget ++;
	if(cWidget == widgets.length) {
		cWidget = 0;
	}
	for (var i = 0;i < widgets.length; i++ ) {
		if(i == cWidget) {
			widgets[i].transform.localPosition = new Vector3(0,0,0);
		} else {
			widgets[i].transform.localPosition = new Vector3(0,0,-25);
		}
	}
}