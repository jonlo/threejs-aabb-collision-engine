import { Group, Mesh } from 'three';
import { getClosestDistanceBetweenObjects, checkIfObjectInsideObjectBounds, getClosestDistance } from '../Aabb/aabbOperations';
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
			throw 'Only groups or elements with geometry should be added to the collision engine';
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

	getClosestElement(selectedObject) {
		if (!selectedObject) {
			return;
		}
		tryToUpdateObject(selectedObject);
		let closest = {
			minDistance: NaN,
			distances: [],
			element: null
		};
		let meshCollidersAtSameLevel = this._getCollidersFromParent(selectedObject);
		meshCollidersAtSameLevel.forEach(collider => {
			if (!isSameObject(selectedObject, collider)) {
				tryToUpdateObject(collider);
				let distances = [0, 0, 0];
				distances = getClosestDistanceBetweenObjects(selectedObject, collider);
				let minDistance = getClosestDistance(distances);
				if (!closest.element || closest.minDistance > minDistance) {
					closest.minDistance = minDistance;
					closest.element = collider;
					closest.distances[0] = distances[0];
					closest.distances[1] = distances[1];
					closest.distances[2] = distances[2];
				}
			}
			collider.material.color.set(0x0000ff);
		});
		closest.element.material.color.set(0xff0000);
		return closest;
	}

	_getCollidersFromParent(element) {
		if (!element) {
			return;
		}
		let parent = element.userData.transformData.getParent();
		if (!parent) {
			element.userData.transformData.setParent(element.parent);
		}
		return this.meshColliders.filter((element) => {
			return element.userData.transformData.getParent().uuid === parent.uuid;
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
			let objectInside = checkIfObjectInsideObjectBounds(selectedObject, parent);
			return !objectInside;
		}
		return false;
	}

}

export { Collisions };