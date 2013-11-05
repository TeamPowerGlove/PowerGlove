#pragma strict

//
//Receives raycasting from palms, handles selecting objects and passing various events depending on object type
//

//Script Types
var grabScript: Grab;
var spin: Spin;
// var animalGrab:AnimalGrab;
var widget: Widget;
var type: int = -1;
var grabbed = false;

var copy = false;

var baseColor:Color;
var highlightColor:Color = new Color(220,103,80);
var highlighters = new Array();
var hoverCount:float;
var hoverBy:int;
function Start() {
	checkType();
	var tmp = gameObject.GetComponent(Renderer);
	if(tmp) highlighters.push(tmp);
	highlighters = highlighters.concat(gameObject.GetComponentsInChildren(typeof(Renderer)));
	changeColor(baseColor);
}
function Update() {
	if (hoverCount == 0 || grabbed) return;
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
function checkType() {
	grabScript = gameObject.GetComponent(Grab);
	spin = gameObject.GetComponent(Spin);
	widget = gameObject.GetComponent(Widget);
	if (grabScript) type = 0;
	else if (spin) type = 1;
	else if (widget) type = 2;
	if(type != 2) {
		widget = GameObject.Find("Widget").GetComponent(typeof(Widget));
	}
}

function hover(by:int) {
	if(type == -1) checkType();
	hoverBy = by;
	hoverCount++;
	if(hoverCount > 10) hoverCount = 10;
}

function changeColor(c: Color) {
	for(var highlighter:Renderer in highlighters) {
		highlighter.material.SetColor("_Color", c);
	}
}
function handUpdate(pos: Vector3, rot: float) {
	if(type == -1) checkType();
	switch (type) {
		case 0:
			grabScript.handUpdate(pos, rot);
			break;
		case 1:
			spin.handUpdate(pos, rot);
			break;
		case 2:
			widget.handUpdate(pos, rot);
			break;
	}
}

function grab() {
	if(type == -1) checkType();
	grabbed = true;
	changeColor(highlightColor);
	switch (type) {
		case 0:
			widget.select(this);
			grabScript.grabbed = true;
			break;
		case 1:
			spin.grabbed = true;
			break;
		case 2:
			widget.grabbed = true;
			break;
	}
}

function release() {
	if(type == -1) checkType();
	grabbed = false;
	switch (type) {
		case 0:
			grabScript.grabbed = false;
			break;
		case 1:
			spin.grabbed = false;
			break;
		case 2:
			widget.grabbed = false;
			break;
	}
}