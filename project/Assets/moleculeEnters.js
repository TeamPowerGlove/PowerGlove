#pragma strict
var scoreTracker : GameObject;
var scoreTrackerScript : ScoreTrackerScript;

function Start() {
	scoreTrackerScript = scoreTracker.GetComponent(typeof(ScoreTrackerScript));
}

function OnTriggerEnter(collider: Collider) {
	if (collider.gameObject.name == "fruit molecule(Clone)") {
		scoreTrackerScript.addScore(100);
		Destroy(collider.gameObject);
	}
}		