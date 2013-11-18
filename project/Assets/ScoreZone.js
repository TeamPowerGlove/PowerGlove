#pragma strict
var splat:GameObject;
function Start () {

}

function Update () {

}

function OnTriggerStay(other:Collider) {
	if(!other.CompareTag("Animal")) return;
	Destroy(other.gameObject);
	Instantiate(splat);
}
