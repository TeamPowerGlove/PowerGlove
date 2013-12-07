#pragma strict

var theTexture : Texture2D;
var curA:float = 1.0;
var fadeOut = false;
var lastTime : float;
var toLoad:String;
function OnLevelWasLoaded() {
	lastTime = Time.time;
}
function OnGUI() {
	curA -= .1;
	GUI.color = Color.white;
	if(fadeOut) {
		GUI.color.a = Mathf.Lerp(1.0, 0.0, 1-(Time.time-lastTime));
		if(Time.time-lastTime > 1) {
			Application.LoadLevel("LeapBase");
		}
	} else {
		GUI.color.a = Mathf.Lerp(1.0, 0.0, (Time.time-lastTime));
	}
	GUI.DrawTexture(Rect(0,0,Screen.width,Screen.height),theTexture);
}