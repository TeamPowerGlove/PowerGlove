private var myTimer : float;
private var displaySeconds : int;
private var displayMinutes : int;

function Start () {
	myTimer = 0;
}

//A simple timer
function Update () {
  myTimer += Time.deltaTime;
  onGUI();
 
}

function onGUI () {
//display the timer
	if (!Trigger.isTriggered) {
	    myTimer = Mathf.CeilToInt(myTimer);
	    displaySeconds = myTimer % 60;
	    displayMinutes = myTimer / 60; 
	    
	    text = String.Format ("{0:00}:{1:00}", displayMinutes, displaySeconds); 
	    guiText.text = text;
 	} else {
    	text = "You Win! /n" + myTimer;
    }

}

function onTriggerEnter () {
	text = "You Win! /n" + myTimer;
}

