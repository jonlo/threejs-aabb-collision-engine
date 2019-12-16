/**
 * 
 * @module threejs-aabb-collision-engine
 * @class CollisionEngine
 * @author jon
 * @version 1
 **/
import { Vector3 } from 'three';
import { Collisions } from './Collisions/Collisions';
import { restrict } from './Transforms/Restrictions';
import { snap } from './Transforms/Snap';
import { TransformData } from './Transforms/TransformData.js';

/**
 * Creates an instance of CollisionEngine.
 * params = {trackAfterCollision,snapDistance,resetOnSnap,resetCallback}
 * @public
 * @name CollisionEngine
 * @function CollisionEngine
 * @param {Object}params 
 **/
class CollisionEngine {

	constructor(params) {
		this.trackAfterCollision = params.trackAfterCollision === undefined ? true : params.trackAfterCollision;
		this.snapDistance = params.snapDistance === undefined ? 0 : params.snapDistance;
		this.collisions = new Collisions();
		this.realPosition = null;
		this.collisionsEnabled = true;
		this.resetOnSnap = params.resetOnSnap === undefined ? true : params.resetOnSnap;
		this.resetCallback = params.resetCallback === undefined ? null : params.resetCallback;
	}

	/**
	 *Translates a object in a given axis and distance
	 *
	 * @param {Object3d} object
	 * @param {number} axis
	 * @param {number} distance
	 * @memberof CollisionEngine
	 */
	translate(object, axis, distance) {
		if (!object) {
			return;
		}
		this._checkTransformData(object);
		if (!this.realPosition) {
			this.realPosition = object.position.clone();
		}
		let snapped = false;
		if (this.snapDistance > 0) {
			snapped = snap(object, this.collisions.getClosestElement(object), axis, distance, this.snapDistance, (object, axis, value) => { this._onSnap(object, axis, value); }) === axis;
		}
		object.updateMatrixWorld();
		if (!snapped) {
			object.position.setComponent(axis, object.position.getComponent(axis) - distance);
			this._translateChildren(object, axis, distance, -1);
			object.updateMatrixWorld();
			this.realPosition.setComponent(axis, this.realPosition.getComponent(axis) - distance);
		}
		if (this.collisionsEnabled) {
			if (this.collisions.checkCollisions(object)) {
				object.position.setComponent(axis, object.position.getComponent(axis) + distance);
				this._translateChildren(object, axis, distance, 1);
				this.collisions.updateCollisionBox(object);
				if (this.trackAfterCollision) {
					this._tryToRelocateObject(object, axis);
				}
			} else {
				this.realPosition.setComponent(axis, object.position.getComponent(axis));
			}
		}
		restrict(object, axis);
	}

	/**
	 * adds a new collider to the system
	 *
	 * @param {Object3D} collider
	 * @memberof CollisionEngine
	 */
	addCollider(collider) {
		this.collisions.addCollider(collider);
	}

	/**
	 *Get all colliders in the system
	 *
	 * @returns []
	 * @memberof CollisionEngine
	 */
	getMeshColliders() {
		return this.collisions.meshColliders;
	}

	/**
	 * reset the real position
	 * @memberof CollisionEngine
	 */
	reset() {
		this.realPosition = null;
	}

	_checkTransformData(object) {
		if (!object) {
			return;
		}
		if (!object.userData.transformData) {
			object.userData.transformData = new TransformData();
		}
	}

	_onSnap(object, axis, value) {
		if (!this.realPosition) { return; }
		object.position.setComponent(axis, value);
		let deltaMove = this.realPosition.getComponent(axis) - object.position.getComponent(axis);
		this._translateChildren(object, axis, deltaMove, -1);
		if (this.resetOnSnap) {
			this.resetCallback();
		}
	}

	_translateChildren(object, axis, deltaMove, dir) {
		object.userData.transformData.getChildren().forEach(child => {
			child.position.setComponent(axis, child.position.getComponent(axis) + deltaMove * dir);
			this.collisions.updateCollisionBox(child);
		});
	}

	_tryToRelocateObject(object, axis) {
		let currentPos = new Vector3().copy(object.position);
		object.position.setComponent(axis, this.realPosition.getComponent(axis));
		object.updateMatrixWorld();
		if (this.collisions.checkCollisions(object)) {
			object.position.copy(currentPos);
			object.updateMatrixWorld();
			this.collisions.updateCollisionBox(object);
		} else {
			let deltaMove = this.realPosition.getComponent(axis) - currentPos.getComponent(axis);
			this._translateChildren(object, axis, deltaMove, 1);
		}
	}
}

export { CollisionEngine };
