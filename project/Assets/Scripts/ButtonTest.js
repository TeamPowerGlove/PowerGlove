#pragma strict

function Start () {

}

function Update () {

}

function onCollisionStay (collision:Collision) {
	Debug.Log("Hello");
	
	if (collision.transform.gameObject.tag != "FingerTip") {
	return;
	}
}