#pragma strict
var keySpeed = .1;
function Start () {
	
}

function Update () {
	transform.Translate(Vector3.right * Input.GetAxis("Horizontal") * keySpeed);
	transform.Translate(Vector3.forward * Input.GetAxis("Vertical") * keySpeed);
	transform.Translate(Vector3.up * Input.GetAxis("Fly") * keySpeed);
}