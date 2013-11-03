#pragma strict
var moleculePoints : int = 50;
var scoreTracker : GameObject;
var scoreTrackerScript : ScoreTrackerScript;

function Start() {
	scoreTrackerScript = scoreTracker.GetComponent(typeof(ScoreTrackerScript));
}

function OnTriggerEnter(collider: Collider) {
	if (collider.gameObject.name == "fruit molecule(Clone)") {
		scoreTrackerScript.addScore(moleculePoints);
		Destroy(collider.gameObject);
	}
}		