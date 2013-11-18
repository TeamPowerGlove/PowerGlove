#pragma strict
var selector:Selector;
var parRigid:Rigidbody;
function Start () {
	rigidbody.centerOfMass = rigidbody.centerOfMass + new Vector3(0,-.2,0);
	selector = transform.parent.gameObject.GetComponent(Selector);
	parRigid = transform.parent.rigidbody;
}

function Update () {
	if(selector.grabbed) {
		var diff = transform.rotation.eulerAngles.z - 90;
		Debug.Log(diff);
		parRigid.isKinematic = true;
	} else {	
		parRigid.isKinematic = false;
	}
}