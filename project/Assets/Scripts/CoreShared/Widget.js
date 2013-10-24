#pragma strict
var cSelected: GameObject;
var spin: Spin;
// var pull:Pull;

function Start() {

}

function Update() {
	if (cSelected == null ) return;
	transform.position = cSelected.transform.position + Vector3.up * -.25;
}

function deselect() {
	cSelected = null;
	transform.position.y = -15;

}

function select(obj: GameObject) {
	cSelected = obj;
	transform.position = cSelected.transform.position + Vector3.up * -.25;

}

function turnObj(amt: Quaternion) {
	if (cSelected != null) {
		cSelected.transform.rotation *= amt;
	}
}