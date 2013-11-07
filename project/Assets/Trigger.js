static var isTriggered = false;

function Start () {

}

function Update () {

}

function onTriggerEnter (thing : Collider) {
	isTriggered = true;
	Debug.Log("triggered");
}