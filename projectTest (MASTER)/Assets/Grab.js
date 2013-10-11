#pragma strict
var hoverCount:float = 0;
var grabbed = false;
var matName = "_Color";
var baseColor:Color;
var highlightColor:Color = new Color(220/255.0,100/255.0,80/255.0);
var dupable:boolean;
function Start () {
	changeColor(baseColor);
}
function Update () {
	if(grabbed) {
		changeColor(highlightColor);
		return;
	}
	if(hoverCount == 0) return;
	if(hoverCount== .5) {
		hoverCount = 0;
	} else {
		hoverCount -= .5;
		if(hoverCount >= 9.5) {
			changeColor(highlightColor);
		} else {
			changeColor(Color.Lerp(baseColor,highlightColor,hoverCount/10.0));
		}
	}
}

function hover() {
	hoverCount ++;
	if(hoverCount>10) hoverCount = 10;
}

function changeColor(c:Color) {

	gameObject.renderer.material.SetColor("_Color",c);
}