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
	if(c.other.CompareTag(this.tag)) {
		Debug.Log(c.other.GetComponent(typeof(DestroyAlike)).species);
		if(c.other.GetComponent(typeof(DestroyAlike)).enable && c.other.GetComponent(typeof(DestroyAlike)).species == species) {
		Destroy(this.gameObject);
		Destroy(c.other.gameObject);
		Instantiate(bigPoof,(this.transform.position + c.other.transform.position) / 2, Quaternion.identity);
		}	else {
		gameObject.GetComponent(typeof(Grab)).changeColor(Color.black);
		gameObject.GetComponent(typeof(Grab)).baseColor = Color.black;
		species = -1;
		}
	} 
}