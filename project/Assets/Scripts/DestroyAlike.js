#pragma strict
var species:int;
var enable = true;
var bigPoof:GameObject;
function Start () {

}

function Update () {
	rigidbody.AddRelativeTorque(Random.insideUnitSphere);
}

function OnCollisionEnter(c:Collision) {
	if(!enable || species == -1) return;
	if(c.transform.gameObject.CompareTag(this.tag)) {
		Debug.Log(c.transform.gameObject.GetComponent(typeof(DestroyAlike)).species);
		if(c.transform.gameObject.GetComponent(typeof(DestroyAlike)).enable && c.transform.gameObject.GetComponent(typeof(DestroyAlike)).species == species) {
		Destroy(this.gameObject);
		Destroy(c.transform.gameObject.gameObject);
		Instantiate(bigPoof,(this.transform.position + c.transform.gameObject.transform.position) / 2, Quaternion.identity);
		}	else {
		// gameObject.GetComponent(typeof(Grab)).changeColor(Color.black);
		// gameObject.GetComponent(typeof(Grab)).baseColor = Color.black;
		// species = -1;
		}
	} 
}