#pragma strict
var spawnables:GameObject[];
var count = 0;
var bigPoof:GameObject;
var spawned = 0;
function Start () {

}

function Update () {
	count ++;
	if(Random.value < .0001 + count*.000025 && count>10 && spawned < 30) {
		spawned ++;
		count = 0;
		var spawnID = Random.Range(0,spawnables.Length);
		var spawnPoint:Vector3 = Vector3(Random.RandomRange(-2.0,2.0),Random.RandomRange(4,5.0),Random.RandomRange(-2.0,2.0));
		var newMolecule:GameObject = Instantiate(spawnables[spawnID],spawnPoint,Random.rotationUniform);
		
		//newMolecule.GetComponent(typeof(Grab)).dupable = false;
		//Debug.Log(newMolecule.GetComponent(typeof(DestroyAlike)));
		//newMolecule.GetComponent(typeof(DestroyAlike)).species = spawnID;
		// newMolecule.GetComponent(typeof(DestroyAlike)).enable = true;
		// newMolecule.GetComponent(typeof(DestroyAlike)).bigPoof = bigPoof;
		// newMolecule.rigidbody.isKinematic = false;
		//newMolecule.rigidbody.freezeRotation = true;
		newMolecule.rigidbody.AddTorque(Random.insideUnitSphere*200);
		newMolecule.rigidbody.useGravity = true;
		//newMolecule.rigidbody.constraints = RigidbodyConstraints.FreezeAll;
		newMolecule.layer = 3;
	}
}