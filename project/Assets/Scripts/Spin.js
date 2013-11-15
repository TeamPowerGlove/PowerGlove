#pragma strict
var hoverCount: float = 0;
var grabbed = false;
var matName = "_Color";
var baseColor: Color;
var highlightColor: Color = new Color(220 / 255.0, 100 / 255.0, 80 / 255.0);
var selfShader: Renderer;
var jsLeap: JSLeap;
var handPoint: Vector3;
var omega: Quaternion;
var pivot:Vector3 = new Vector3(0,0,0);
var lastPos: Vector3;
var throwable = false;
var cAngle:float;
var anchorRot:Quaternion;
var lastRot:Quaternion;
var newGrab:boolean = true;
var widget:Widget;
function Start() {
	changeColor(baseColor);
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
	anchorRot = transform.rotation;
}

function Update() {
	if (grabbed) {
		pivot = transform.position;
		if (newGrab) {
			var P1 = handPoint;
			var P2 = pivot;
			cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
			newGrab = false;
		}
		//Calculate and rotate the anchorRot (the absolute rotation of the object per the hand)
		P1 = handPoint;
		P2 = pivot;
		Debug.DrawLine(P1, P2, Color.red);
		var newAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
		var diff = newAngle - cAngle;
		var spinAmt = Quaternion.AngleAxis(diff * 180 / Mathf.PI, Vector3.down);
		anchorRot *= spinAmt;
		if (widget != null) {
			//widget.turnObj(spinAmt);
		}
		cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x); //This math is identital to the table rotation stuff (although its simple to read alone)
		var spinFriction = .95;
		lastRot = transform.rotation;
		return;
	} else {
		newGrab = true;
	}
}

function changeColor(c: Color) {
	selfShader.renderer.material.SetColor("_Color", c);
}

function handUpdate(pos: Vector3,rot: float) {
	handPoint = pos;

	var P1 = handPoint;
	var P2 = pivot;
}