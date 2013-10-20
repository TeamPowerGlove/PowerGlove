#pragma strict
var hoverCount:float = 0;
var grabbed = false;
var matName = "_Color";
var baseColor:Color;
var highlightColor:Color = new Color(220/255.0,100/255.0,80/255.0);
var dupable:boolean;
var selfShader:Renderer;
var JSLeap:JSLeap;
var anchorPoint:Vector3;
var v:Vector3;
var offset:Vector3;
var lastPos:Vector3;

var grabPow:int;
var throwPow:int;

function Start () {
	selfShader = gameObject.GetComponentInChildren(typeof(Renderer));
	changeColor(baseColor);
	lastPos = transform.position;
	//JSLeap = GameObject.Find("JSLeapController").GetComponent(typeof(JSLeap));
}
function Update() {
	if (grabbed) {
		if (v.magnitude <= .001) {
			lastPos = transform.position;
			v = new Vector3(0, 0, 0);
		}
		changeColor(highlightColor);

		//transform.position = anchorPoint; //This would be absolute positioning
		var grabFriction = .94;
		var diff: Vector3 = (transform.position - anchorPoint);
		var grabPow = 1.3;
		transform.position -= (diff * Mathf.Pow(diff.magnitude, grabPow) * 0.05); //Spring
		transform.position += v;
		v = (transform.position - lastPos) * grabFriction;
		lastPos = transform.position;
		return;
	} else {
		transform.position += v;
		var throwFriction = .91;
		v = (transform.position - lastPos) * throwFriction;
		
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

function handUpdate(pos: Vector3) {

	anchorPoint = pos;
}