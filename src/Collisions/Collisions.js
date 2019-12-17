import { Group, Mesh } from 'three';
import { checkIfObjectInsideParentBounds, collidesInAxis, getDistanceBetweenObjectsInAxis } from '../Aabb/aabbOperations';
import { isSameObject, tryToUpdateObject, updateBox } from './CollisionUpdates';
import { TransformData } from '../Transforms/TransformData';

class Collisions {

	constructor() {
		this.meshColliders = [];
	}

	updateCollisionBox(collider) {
		updateBox(collider);
	}

	addCollider(collider) {
		if (!collider.userData.transformData) {
			collider.userData.transformData = new TransformData(collider);
		}
		if (collider instanceof Group) {
			collider.traverse((mesh) => {
				if ((mesh instanceof Mesh)) {
					if (!mesh.userData.transformData) {
						mesh.userData.transformData = new TransformData(collider);
						mesh.userData.transformData.setAsGroupChild();
					}
					this.meshColliders.push(mesh);
					collider.userData.transformData.colliders.push(mesh);
				}
			});
		} else if (collider.geometry) {
			this.meshColliders.push(collider);
		} else {
			throw 'Only groups or objects with geometry should be added to the collision engine';
		}
	}

	checkCollisions(selectedObject) {
		if (this._checkCollisionWithParentBounds(selectedObject)) {
			return true;
		}
		updateBox(selectedObject);
		let meshCollidersAtSameLevel = this._getCollidersFromParent(selectedObject);
		for (let i = 0; i < meshCollidersAtSameLevel.length; i++) {
			let collisionObj = meshCollidersAtSameLevel[i];
			if (isSameObject(selectedObject, collisionObj)) {
				continue;
			}
			tryToUpdateObject(collisionObj);
			if (selectedObject instanceof Group) {
				for (let j = 0; j < selectedObject.userData.transformData.colliders.length; j++) {
					if (selectedObject.userData.transformData.colliders[j].userData.transformData.box.intersectsBox(collisionObj.userData.transformData.box)) {
						return true;
					}
				}
			} else {
				if (selectedObject.userData.transformData.box.intersectsBox(collisionObj.userData.transformData.box)) {
					return true;
				}
			}
		}
		return false;
	}

	getClosestObject(selectedObject) {
		if (!selectedObject) {
			return;
		}
		tryToUpdateObject(selectedObject);
		let closestObjects = [null, null, null];
		for (let index = 0; index < 3; index++) {
			closestObjects[index] = this._getClosestObjectInAxis(selectedObject, index);
		}
		closestObjects.sort(function (a, b) {
			return a.distance - b.distance;
		});
		let closestObject = closestObjects[0];
		if (!closestObject.object) { return null; }
		return closestObject;
	}


	_getClosestObjectInAxis(selectedObject, axis) {
		let meshCollidersAtSameLevel = this._getCollidersFromParent(selectedObject);
		let closest = {
			distance: Number.MAX_SAFE_INTEGER,
			axis: axis,
			object: null
		};
		meshCollidersAtSameLevel.forEach(collider => {
			if (!isSameObject(selectedObject, collider)) {
				tryToUpdateObject(collider);
				let otherAxesCollides = [];
				for (let index = 0; index < 3; index++) {
					if (index !== axis) {
						otherAxesCollides.push(collidesInAxis(selectedObject, collider, index));
					}
				}
				if (otherAxesCollides.every(o => o === true)) {
					let distance = getDistanceBetweenObjectsInAxis(selectedObject, collider, axis);
					if (!closest.object || closest.distance > distance) {
						closest.object = collider;
						closest.distance = distance;
					}
				}
			}
		});

		return closest;
	}

	_getCollidersFromParent(object) {
		if (!object) {
			return;
		}
		let parent = object.userData.transformData.getParent();
		if (!parent) {
			object.userData.transformData.setParent(object.parent);
		}
		return this.meshColliders.filter((object) => {
			return object.userData.transformData.getParent().uuid === parent.uuid;
		});
	}

	_checkCollisionWithParentBounds(selectedObject) {
		let parent = null;
		try {
			parent = selectedObject.userData.transformData.getParent();
		} catch (error) {
			return false;
		}
		if (parent.userData.transformData) {
			tryToUpdateObject(parent);
			let objectInside = checkIfObjectInsideParentBounds(selectedObject, parent);
			return !objectInside;
		}
		return false;
	}
}

export { Collisions };