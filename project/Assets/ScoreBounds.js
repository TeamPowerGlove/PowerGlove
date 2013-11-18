#pragma strict

function Start () {

}

function Update () {

}
function OnTriggerStay(other:Collider) {
	// Debug.Log(other.tag);
	if(!other.CompareTag("Animal")) return;
	other.rigidbody.AddForce(new Vector3(3,-2,0));
	// Destroy(other.gameObject);
}
