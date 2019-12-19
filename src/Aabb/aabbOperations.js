import { Vector3 } from 'three';


export function checkIfObjectInsideParentBounds(object, parent) {
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

export function collidesInAxis(object, collider, axis) {
	let selectedBounds = getBoundsForObjectInAxis(object, axis);
	let colliderBounds = getBoundsForObjectInAxis(collider, axis);
	if ((selectedBounds.min >= colliderBounds.min && selectedBounds.min <= colliderBounds.max) || (selectedBounds.max >= colliderBounds.min && selectedBounds.max <= colliderBounds.max)
		|| (colliderBounds.min >= selectedBounds.min && colliderBounds.min <= selectedBounds.max) || (colliderBounds.max >= selectedBounds.min && colliderBounds.max <= selectedBounds.max)) {
		return true;
	} else { return false; }
}

export function getDistanceBetweenObjectsInAxis(object, collider, axis) {
	let selectedPoints = getBoundsForObjectInAxis(object, axis);
	let colliderPoints = getBoundsForObjectInAxis(collider, axis);
	if (selectedPoints.max < colliderPoints.max) {
		return colliderPoints.min - selectedPoints.max;
	} else {
		return selectedPoints.min - colliderPoints.max;
	}
}

export function getBoundsForObjectInAxis(object, axis) {

	let objectWorldPos = new Vector3();
	objectWorldPos.setFromMatrixPosition(object.matrixWorld);
	let objectWidth = (object.userData.transformData.box.max.getComponent(axis) - object.userData.transformData.box.min.getComponent(axis)) / 2;
	let max = objectWorldPos.getComponent(axis) + objectWidth;
	let min = objectWorldPos.getComponent(axis) - objectWidth;
	return { min, max };

}
