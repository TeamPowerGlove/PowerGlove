#pragma strict
var spawnables:GameObject[];
var count = 0;
var spawnInterval:float = 5.0;
var lastLocation:int =0; //0: Last location was left, 1: center, 2: right
private var spawnOnLeft:Vector3 = new Vector3(-4.75, 6.50, 4.75);
private var spawnOnCenter:Vector3 = new Vector3(0.15, 7.00, 6.75);
private var spawnOnRight:Vector3 = new Vector3(5.00, 6.75, 4.75);
private var spawnLocations:Vector3[] = [spawnOnLeft, spawnOnCenter, spawnOnRight];
//An array containing three different locations fruits can spawn at.
var fruitList:Array = new Array();

function Start () {

}

function FixedUpdate () {
	count ++;
	if(Random.value < 0.01 && count > 5) {
		count = 0;
		var spawnID = Random.Range(0,spawnables.Length);
		//Which fruit to spawn.
		var locationID:int = 0;
		//Which spawn location to be selected.
		if (lastLocation == 0) {
			locationID = Random.Range(1, 3);
			lastLocation = locationID;
		} //if left was last spawn location, don't spawn on left this time.
			else if (lastLocation == 1) {
			locationID = Random.Range(0, 2);
			if (locationID == 1) {
				locationID = 2;
			}
			lastLocation = locationID;
		}
			else if (lastLocation == 2) {
			locationID = Random.Range(0, 2);
			lastLocation = locationID;
		}	
		
		var newFruit:GameObject = Instantiate(spawnables[spawnID],spawnLocations[locationID],Random.rotationUniform);
		fruitList.push(newFruit);
	}
}