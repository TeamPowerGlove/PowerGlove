/******************************************************************************\
* Copyright (C) Leap Motion, Inc. 2011-2013.                                   *
* Leap Motion proprietary and  confidential.  Not for distribution.            *
* Use subject to the terms of the Leap Motion SDK Agreement available at       *
* https://developer.leapmotion.com/sdk_agreement, or another agreement between *
* Leap Motion and you, your company or other organization.                     *
\******************************************************************************/

using UnityEngine;
using System;
using System.Collections;
using System.Collections.Generic;
using Leap;

/// <summary>
/// This class manipulates the hand representation in the unity scene based on the
/// input from the leap device. Fingers and Palm objects are moved around between
/// higher level 'hand' objects that mainly serve to organize.  Be aware that when
/// fingers are lost, unity does not dispatch OnTriggerExit events.
/// </summary>
public class LeapUnityHandController : MonoBehaviour 
{	
	public GameObject[]				m_palms		= null;
	public GameObject[]				m_fingers	= null;
	public GameObject[]				m_hands 	= null;
	public bool						m_DisplayHands = true;
	public int						gestureTapped = 0;
	//These arrays allow us to use our game object arrays much like pools.
	//When a new hand/finger is found, we mark a game object by active
	//by storing it's id, and when it goes out of scope we make the
	//corresponding gameobject invisible & set the id to -1.
	private int[]					m_fingerIDs = null;
	private int[]					m_handIDs	= null;
	
	void SetCollidable( GameObject obj, bool collidable )
	{
		foreach( Collider component in obj.GetComponents<Collider>() )
			component.enabled = collidable;
	
		foreach( Collider child in obj.GetComponentsInChildren<Collider>() )
			child.enabled = collidable;
	}
	
	void SetVisible( GameObject obj, bool visible )
	{
		foreach( Renderer component in obj.GetComponents<Renderer>() ) {
			component.enabled = visible && m_DisplayHands;
		}
		
		foreach( Renderer child in obj.GetComponentsInChildren<Renderer>() ) {
			child.enabled = visible && m_DisplayHands;
		}
		
		foreach( Light light in obj.GetComponents<Light>() ) {
			light.enabled = visible && m_DisplayHands;
		}	
		
		foreach( Light light in obj.GetComponentsInChildren<Light>() ) {
			light.enabled = visible && m_DisplayHands;	
		}
	}
	
	void Start()
	{
		m_fingerIDs = new int[10];
		for( int i = 0; i < m_fingerIDs.Length; i++ )
		{
			m_fingerIDs[i] = -1;	
		}
		
		m_handIDs = new int[2];
		for( int i = 0; i < m_handIDs.Length; i++ )
		{
			m_handIDs[i] = -1;	
		}
		
		LeapInput.HandFound += new LeapInput.HandFoundHandler(OnHandFound);
		LeapInput.HandLost += new LeapInput.ObjectLostHandler(OnHandLost);
		LeapInput.HandUpdated += new LeapInput.HandUpdatedHandler(OnHandUpdated);
		LeapInput.PointableFound += new 	LeapInput.PointableFoundHandler(OnPointableFound);
		LeapInput.PointableLost += new LeapInput.ObjectLostHandler(OnPointableLost);
		LeapInput.PointableUpdated += new LeapInput.PointableUpdatedHandler(OnPointableUpdated);
		LeapInput.GestureTap += new LeapInput.GestureTapHandler(OnGestureTap);
		
		//do a pass to hide the objects.
		foreach( GameObject palm in m_palms )
		{
			updatePalm(Leap.Hand.Invalid, palm);
		}
		foreach( GameObject finger in m_fingers)
		{
			updatePointable(Leap.Pointable.Invalid, finger);
		}
	}
	
	//When an object is found, we find our first inactive game object, activate it, and assign it to the found id
	//When lost, we deactivate the object & set it's id to -1
	//When updated, load the new data
	void OnGestureTap(Gesture g) {
		gestureTapped = g.Id;
	}
	void OnPointableUpdated( Pointable p )
	{
		int index = Array.FindIndex(m_fingerIDs, id => id == p.Id);
		if( index != -1 )
		{
			updatePointable( p, m_fingers[index] );	
		}
	}
	void OnPointableFound( Pointable p )
	{
		int index = Array.FindIndex(m_fingerIDs, id => id == -1);
		if( index != -1 )
		{
			m_fingerIDs[index] = p.Id;
			updatePointable( p, m_fingers[index] );
		}
	}
	void OnPointableLost( int lostID )
	{
		int index = Array.FindIndex(m_fingerIDs, id => id == lostID);
		if( index != -1 )
		{
			updatePointable( Pointable.Invalid, m_fingers[index] );
			m_fingerIDs[index] = -1;
		} 
	}

	void OnHandFound( Hand h )
	{
		int index = Array.FindIndex(m_handIDs, id => id == -1);
		if( index != -1 )
		{
			m_handIDs[index] = h.Id;
			updatePalm(h, m_palms[index]);
		}
	}
	void OnHandUpdated( Hand h )
	{
		int index = Array.FindIndex(m_handIDs, id => id == h.Id);
		if( index != -1 )
		{
			updatePalm(	h, m_palms[index] );
		}
	}
	void OnHandLost(int lostID)
	{
		int index = Array.FindIndex(m_handIDs, id => id == lostID);
		if( index != -1 )
		{
			updatePalm(Hand.Invalid, m_palms[index]);
			m_handIDs[index] = -1;
		}
	}
	
	void updatePointable( Leap.Pointable pointable, GameObject fingerObject )
	{
		updateParent( fingerObject, pointable.Hand.Id );
		
		SetVisible(fingerObject, pointable.IsValid);
		SetCollidable(fingerObject, pointable.IsValid);
		
		if ( pointable.IsValid )
		{
			Vector3 vFingerPos = pointable.TipPosition.ToUnityTranslated();
			
			// perform a cast between where it is and where it wants to be.
			//float fingerRadius = fingerObject.GetComponent<SphereCollider>().radius;
			//RaycastHit target;
			
			// the movement vector of the finger.
			/*Vector3 movementDir = vFingerPos - fingerObject.transform.position;
			movementDir.Normalize();
			
			Vector3 end = vFingerPos + movementDir * fingerRadius;
			
			if (Physics.Linecast(fingerObject.transform.position, end, out target, LayerMask.NameToLayer("Buttons"))) {
				//fingerObject.transform.position = target.point + -movementDir * fingerRadius;
			} else {
				//fingerObject.transform.position = vFingerPos;
			}
			*/
			fingerObject.transform.position = vFingerPos;
			Vector3 vFingerDir = pointable.Direction.ToUnity();
			
			fingerObject.transform.localRotation = Quaternion.FromToRotation( Vector3.forward, vFingerDir );
		}
	}

	void updatePalm( Leap.Hand leapHand, GameObject palmObject )
	{
		updateParent( palmObject, leapHand.Id);
		
		//SetVisible(palmObject, leapHand.IsValid);
		//SetCollidable(palmObject, leapHand.IsValid);
		if( leapHand.IsValid )
		{
			palmObject.transform.localPosition = leapHand.PalmPosition.ToUnityTranslated();
			// palmObject.transform.localRotation = UnityEngine.Random.rotationUniform;
			Vector3 vPalmNorm = leapHand.PalmNormal.ToUnity();
			Vector3 vPalmDir = leapHand.Direction.ToUnity();
			palmObject.transform.localRotation = Quaternion.FromToRotation(Vector3.down, vPalmNorm)*Quaternion.FromToRotation(Vector3.forward, vPalmDir);
			


		}
	}	
	
	void updateParent( GameObject child, int handId )
	{
		//check the hand & update the parent
		int handIndex = Array.FindIndex(m_handIDs, id => id == handId);
		if( handIndex == -1 || handId == -1 )
			handIndex = 2;
		
		GameObject parent = m_hands[handIndex];
		if( child.transform.parent != parent.transform )
		{
			child.transform.parent = parent.transform;
		}
	}
}
