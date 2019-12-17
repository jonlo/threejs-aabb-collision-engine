import { Group, Vector3 } from 'three';

export function getClosestDistanceBetweenObjects(selectedObject, collider) {
	let distances = [[], [], []];
	if (selectedObject instanceof Group) {
		selectedObject.updateMatrixWorld();
		selectedObject.userData.transformData.colliders.forEach((mesh) => {
			setDistancesBetweenObjects(mesh, collider, distances);
		});
	} else {
		setDistancesBetweenObjects(selectedObject, collider, distances);
	}
	return [getClosestDistance(distances[0]), getClosestDistance(distances[1]), getClosestDistance(distances[2])];
}

export function checkIfObjectInsideObjectBounds(object, parent) {
	let objectBox = object.userData.transformData.box;
	let parentBox = parent.userData.transformData.box;
	for (let axis = 0; axis < 2; axis++) {
		if ((object.position.getComponent(axis) - (objectBox.max.getComponent(axis) - objectBox.min.getComponent(axis)) / 2)
			< (parent.position.getComponent(axis) - (parentBox.max.getComponent(axis) - parentBox.min.getComponent(axis)) / 2 + Object.values(parent.userData.transformData.padding)[axis]) ||
			(object.position.getComponent(axis) + (objectBox.max.getComponent(axis) - objectBox.min.getComponent(axis)) / 2)
			> (parent.position.getComponent(axis) + (parentBox.max.getComponent(axis) - parentBox.min.getComponent(axis)) / 2 - Object.values(parent.userData.transformData.padding)[axis + 1])) {
			return false;
		}
	}
	return true;
}

function setDistancesBetweenObjects(selectedElement, collider, distances) {
	for (let axis = 0; axis < 3; axis++) {
		let selectedPoints = getBoundsForElementInAxis(selectedElement, axis);
		let colliderPoints = getBoundsForElementInAxis(collider, axis);
		if (selectedPoints.max < colliderPoints.max) {
			distances[axis].push(colliderPoints.min - selectedPoints.max);
		} else {
			distances[axis].push(selectedPoints.min - colliderPoints.max);
		}
	}
	console.log(`collider ${collider.name} dx: ${distances[0]}`);
	console.log(`collider ${collider.name} dy: ${distances[1]}`);
	console.log(`collider ${collider.name} dz: ${distances[2]}`);
}

export function getBoundsForElementInAxis(element, axis) {

	if (element instanceof Group) {
		element.updateMatrixWorld();
		let min = NaN;
		let max = NaN;
		element.userData.transformData.colliders.forEach((mesh) => {
			let meshWorldPosh = new Vector3();
			meshWorldPosh.setFromMatrixPosition(mesh.matrixWorld);
			let elementWidth = (mesh.userData.transformData.box.max.getComponent(axis) - mesh.userData.transformData.box.min.getComponent(axis)) / 2;
			let currentMax = meshWorldPosh.getComponent(axis) + elementWidth;
			let currentMin = meshWorldPosh.getComponent(axis) - elementWidth;
			max = currentMax < max || !max ? currentMax : max;
			min = currentMin < min || !min ? currentMin : min;
		});
		return { min, max };
	} else {
		let elementWorldPos = new Vector3();
		elementWorldPos.setFromMatrixPosition(element.matrixWorld);
		let elementWidth = (element.userData.transformData.box.max.getComponent(axis) - element.userData.transformData.box.min.getComponent(axis)) / 2;
		let max = elementWorldPos.getComponent(axis) + elementWidth;
		let min = elementWorldPos.getComponent(axis) - elementWidth;
		return { min, max };
	}
}

export function getClosestDistance(distances) {
	let minimunDistance = Math.max.apply(null, distances);
	distances.forEach((elem) => {
		if (elem >= 0 && elem < minimunDistance) {
			minimunDistance = elem;
		}
	});
	return minimunDistance;
}
