#pragma strict
var counter: int = 0;

function OnCollisionStay(collision: Collision) {
	if (collision.gameObject.name == "Ground") {
		Debug.Log("touching Ground");
		counter += 1;
	}
	if (counter >= 25) {
		Destroy(this.gameObject);
	}
}