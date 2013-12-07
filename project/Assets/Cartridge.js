#pragma strict
var selector:Selector;
var parRigid:Rigidbody;
var fader:FadeTexture;
var thisIsIt = false;
var toLoad:String;
function Start () {
	rigidbody.centerOfMass = rigidbody.centerOfMass + new Vector3(0,-.2,0);
	selector = transform.parent.gameObject.GetComponent(Selector);
	parRigid = transform.parent.rigidbody;
}

function Update () {
	if(selector.grabbed) {
		var diff = transform.rotation.eulerAngles.z - 90;
		parRigid.isKinematic = true;
	} else {	
		parRigid.isKinematic = false;
		// Debug.Log(transform.position.y);
		if (Mathf.Abs(transform.position.z + .86) < .2) {
			if (Mathf.Abs(transform.position.x + .2) < .4) {
				if(rigidbody.velocity.magnitude < .3) {
					if(!thisIsIt) fader.lastTime = Time.time;
					thisIsIt = true;
					fader.fadeOut = true;
					fader.toLoad = toLoad;
				}
			}
		} else {
			if(thisIsIt) {
				fader.fadeOut = false;
				thisIsIt = false;
			}
			if(fader.fadeOut) fader.lastTime = Time.time;
			fader.fadeOut = false;
		}
	}
}