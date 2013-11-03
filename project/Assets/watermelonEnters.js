#pragma strict
var watermelonPoints: int = 100;
var scoreTracker : GameObject;
var scoreTrackerScript : ScoreTrackerScript;

function Start() {
	scoreTrackerScript = scoreTracker.GetComponent(typeof(ScoreTrackerScript));
}

function OnTriggerEnter(collider: Collider) {
	if (collider.gameObject.name == "fruit watermelon(Clone)") {
		scoreTrackerScript.addScore(watermelonPoints);
		Destroy(collider.gameObject);
	}
}		