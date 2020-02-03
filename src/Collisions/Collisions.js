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
		this.meshColliders.push(collider);
		updateBox(collider);
	}

	removeCollider(collider) {
		var index = this.meshColliders.indexOf(collider);
		if (index > -1) {
			this.meshColliders.splice(index, 1);
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
			if (selectedObject.userData.transformData.box.intersectsBox(collisionObj.userData.transformData.box)) {
				return true;
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
			object.userData.transformData.parent = object.parent;
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