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
		if(newGrab) {
			var P1 = handPoint;
			var P2 = pivot;
			cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x); 
			newGrab = false;
		}
		// if (v.magnitude <= .001) {
		// 	lastPos = transform.position;
		// 	v = new Vector3(0, 0, 0);
		// }
		changeColor(highlightColor);

		//Calculate and rotate the anchorRot (the absolute rotation of the object per the hand)
		P1 = handPoint;
		P2 = pivot;
		Debug.DrawLine(P1, P2, Color.red);
		var newAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x);
		var diff = newAngle - cAngle;
		var spinAmt = Quaternion.AngleAxis(diff * 180 / Mathf.PI,Vector3.down) ;
		anchorRot *= spinAmt;
		if(widget != null) {
			Debug.Log("!!!");
			widget.turnObj(spinAmt);
		}
		cAngle = Mathf.Atan2(P2.z - P1.z, P2.x - P1.x); //This math is identital to the table rotation stuff (although its simple to read alone)
		var spinFriction = .95;

		// transform.position -= (diff * Mathf.Pow(diff.magnitude, grabPow) * 0.05); //Spring
		// transform.position += v;
		// v = (transform.position - lastPos) * grabFriction;
		// lastPos = transform.position;

		//The next few lines are a mindfuck. Don't think about it too much. Wheee, inertia
		var rotDiff: Quaternion = transform.rotation*Quaternion.Inverse(anchorRot);
		transform.rotation = anchorRot;
		var grabPow = 1.3;
		var angleO = 0.0;
		var axis = Vector3.up;
		// rotDiff.ToAngleAxis(angle, axis);
		angleO = rotDiff.eulerAngles.y;
		var angle = Quaternion.Angle(Quaternion.identity,rotDiff);
		angle *= Mathf.Pow(angle, grabPow) * 0.00001;
		//angle *= .05;
		
		//transform.rotation = Quaternion.Slerp(transform.rotation, anchorRot, angle/angleO);
		//transform.rotation *= Quaternion.AngleAxis(angle, axis); //Spring
		////transform.rotation *= omega; //Inertia
		////omega = Quaternion.Slerp(Quaternion.identity, Quaternion.FromToRotation(lastRot.eulerAngles, transform.rotation.eulerAngles), spinFriction);
		////omega *= Quaternion.Slerp(lastRot,transform.rotation,spinFriction);
		//// omega *= Quaternion.AngleAxis(angle, axis)
		lastRot = transform.rotation;
		return;
	} else {
		newGrab = true;
		if (!(jsLeap.fingerCount <= 2 && jsLeap.palmCount == 2) && throwable) {
			//Apply inertial effects
			// transform.position += v;
			// var throwFriction = .91;
			// v = (transform.position - lastPos) * throwFriction;
		}
		lastPos = transform.position;
	}
	if (hoverCount == 0) return;
	if (hoverCount == .5) {
		hoverCount = 0;
	} else {
		hoverCount -= .5;
		if (hoverCount >= 9.5) {
			changeColor(highlightColor);
		} else {

			changeColor(Color.Lerp(baseColor, highlightColor, hoverCount / 10.0));
		}
	}

}

function hover() {
	hoverCount++;
	if (hoverCount > 10) hoverCount = 10;
}

function changeColor(c: Color) {
	selfShader.renderer.material.SetColor("_Color", c);
}

function handUpdate(pos: Vector3,rot: float) {
	handPoint = pos;

	var P1 = handPoint;
	var P2 = pivot;
}