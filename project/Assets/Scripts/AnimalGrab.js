#pragma strict
var hoverCount:float = 0;
var grabbed = false;
var matName = "_Color";
var baseColor:Color;
var highlightColor:Color = new Color(220/255.0,100/255.0,80/255.0);
var dupable:boolean;
var selfShader:Renderer;
var jsLeap:JSLeap;
var anchorPoint:Vector3;
var v:Vector3;
var offset:Vector3;
var rotOffset:float;
var lastPos:Vector3;
var throwable=false;
var grabPow:int;
var throwPow:int;
var newGrab = true;
var snapPoints = new Array();
var snapAngles = new Array();
var cubeSize = .5;

function Start () {
	cubeSize = .3;
	if (selfShader == null) {
		selfShader = gameObject.GetComponentInChildren(typeof(Renderer));
	}
	changeColor(baseColor);
	lastPos = transform.position;
	jsLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
}
function Update() {
	if (grabbed) {
		if (newGrab) {
		}

		if (v.magnitude <= .001) {
			lastPos = transform.position;
			v = new Vector3(0, 0, 0);
		}

		changeColor(highlightColor);

		//transform.position = anchorPoint; //This would be absolute positioning
		var grabFriction = .94;
		var diff: Vector3 = (transform.position - anchorPoint);
		//var grabPow = 1.3;
		//transform.position -= (diff * Mathf.Pow(diff.magnitude, grabPow) * 0.05); //Spring
		//transform.position += v;

		//
		//SNAP HERE
		//

		Debug.Log(transform.position.y);
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
		newGrab = true;
		if (!(jsLeap.fingerCount <= 2 && jsLeap.palmCount == 2) && throwable) { //if the user isn't spinning the table, ghetto check
			//Apply inertial effects
			transform.position += v;
			var throwFriction = .91;
			v = (transform.position - lastPos) * throwFriction;
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
	//rigidbody.AddForce(Vector3.up*hoverCount);
	var diff:Vector3 = jsLeap.palms[0].transform.position - transform.position;
	var strength:float = diff.magnitude;
	Debug.Log(strength);
	//strength = Mathf.Pow(2+strength,3); Silly
	strength = Mathf.Pow(1+strength,2.5);
	rigidbody.AddForce(diff.normalized * strength);
	if (hoverCount > 10) hoverCount = 10;
}

function changeColor(c: Color) {
	selfShader.material.SetColor("_Color", c);
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