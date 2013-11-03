#pragma strict
var score: int;

function Start () {
	score = 0;
}

function Update () {

}

function addScore(points: int) {
	score += points;
}

function OnGUI() {
	GUI.Label(Rect(0,0,100,100), score.ToString());
}