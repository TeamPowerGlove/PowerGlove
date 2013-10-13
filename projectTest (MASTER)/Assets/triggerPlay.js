#pragma strict
var jsLeap:JSLeap;
var tracking:Vector3[];
var trackingB:Vector3[];
var lastP;
var stable2 = false;
var stableCount = 0;
var paintFinger:GameObject;
var painting = false;
var primPaint = null;
var count = 0;
var hitDist = 12;
var table:GameObject;


function Start () {
	tracking = new Vector3[300];
	trackingB = new Vector3[300];
	table = jsLeap.table;
}

function Update () {
	if(jsLeap.primThumb == null) {
		stableCount -= 4;
		if (stableCount <= 0) {
			stableCount = 0;
			lastP = null;
			return;
		}
	} else {
		stableCount ++;
		if(stableCount > 50) {
			stableCount = 50;
		}
	}
	if (jsLeap.secCount == 1 && jsLeap.primCount >= 3) {
		painting = true;
		primPaint = true;
		paintFinger = jsLeap.primFingers[0];
	}
	if (jsLeap.primCount == 5 && jsLeap.secCount == 1) {
		painting = true;
		primPaint = false;
		
		paintFinger = jsLeap.secFingers[0];
	}
	if(primPaint && jsLeap.secCount <= 3) {
		painting = false;
		paintFinger = null;
	}
	if(!primPaint && jsLeap.primCount <= 3) {
		painting = false;
		paintFinger = null;
	}
	if(painting) {
	count ++;
	if(count == 2) {
	count = 0;
		Debug.DrawRay(paintFinger.transform.position,paintFinger.transform.forward*50);
		var hit : RaycastHit;
		if (Physics.Raycast (paintFinger.transform.position, paintFinger.transform.forward, hit, hitDist)) {
			var ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
			ball.transform.parent = jsLeap.table.transform;
			ball.AddComponent(SphereCollider);
			ball.layer = 1;
			var scale;
			if (primPaint) {
				scale = jsLeap.palms[1].transform.position.y/15.0;
			} else {
				scale = jsLeap.palms[0].transform.position.y/15.0;
				}
			ball.transform.localScale = Vector3(scale,scale,scale);
			ball.transform.position = hit.point;
			ball.renderer.material.SetColor("_Color",Color(Random.Range(.8,1.0),Random.Range(.8,1.0),Random.Range(.8,1.0),1));
			Debug.DrawLine(paintFinger.transform.position,hit.point);
			}
	}
	}	
	var dist:Vector3 = jsLeap.palms[0].transform.position - jsLeap.palms[1].transform.position;
}

